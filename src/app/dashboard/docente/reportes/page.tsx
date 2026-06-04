'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import {
  PieChart,
  Target,
  Download,
  Users,
  Zap,
  ShieldCheck,
  Activity,
  FileDown,
  Loader2,
} from 'lucide-react';

interface StudentRow {
  id: string;
  full_name: string | null;
  email: string;
  grupo_nombre: string | null;
  progress_count: number;
  avg_score: number;
  total_minutes: number;
}

export default function ReportesPage() {
  const [teacherName, setTeacherName] = useState<string | undefined>(undefined);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [grupoNombres, setGrupoNombres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const sb = getSupabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push('/log-in'); return; }

      const { data: profile } = await sb
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin' && profile.role !== 'super_admin')) {
        router.push('/');
        return;
      }
      setTeacherName(profile.full_name ?? undefined);

      const { data: grupos } = await sb
        .from('grupos')
        .select('id, nombre')
        .eq('id_docente', user.id);

      if (!grupos || grupos.length === 0) { setLoading(false); return; }

      const grupoIds = grupos.map((g) => g.id);
      const grupoMap: Record<string, string> = {};
      grupos.forEach((g) => { grupoMap[g.id] = g.nombre; });
      setGrupoNombres(grupos.map((g) => g.nombre));

      const { data: memberships } = await sb
        .from('alumnos_grupos')
        .select('id_alumno, id_grupo')
        .in('id_grupo', grupoIds);

      const studentIds = [...new Set(memberships?.map((m) => m.id_alumno) ?? [])];
      const membershipMap: Record<string, string> = {};
      memberships?.forEach((m) => { membershipMap[m.id_alumno] = m.id_grupo; });

      if (studentIds.length === 0) { setLoading(false); return; }

      const [profilesRes, intentosRes] = await Promise.all([
        sb.from('profiles').select('id, full_name, email').in('id', studentIds),
        sb.from('intentos').select('user_id, score, tiempo_segundos')
          .in('user_id', studentIds)
          .eq('status', 'completed'),
      ]);

      const profiles = profilesRes.data ?? [];
      const intentos = intentosRes.data ?? [];

      const countMap: Record<string, number> = {};
      const scoreSum: Record<string, number> = {};
      const timeSum: Record<string, number> = {};
      for (const it of intentos as { user_id: string; score: number | null; tiempo_segundos: number | null }[]) {
        countMap[it.user_id] = (countMap[it.user_id] ?? 0) + 1;
        scoreSum[it.user_id] = (scoreSum[it.user_id] ?? 0) + (it.score ?? 0);
        timeSum[it.user_id] = (timeSum[it.user_id] ?? 0) + (it.tiempo_segundos ?? 0);
      }

      const enriched: StudentRow[] = (profiles as { id: string; full_name: string | null; email: string }[]).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        grupo_nombre: membershipMap[p.id] ? (grupoMap[membershipMap[p.id]!] ?? null) : null,
        progress_count: countMap[p.id] ?? 0,
        avg_score: countMap[p.id] ? Math.round(scoreSum[p.id]! / countMap[p.id]!) : 0,
        total_minutes: Math.round((timeSum[p.id] ?? 0) / 60),
      }));

      setStudents(enriched);
      setLoading(false);
    };
    void init();
  }, [router]);

  // ── Métricas reales del grupo ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.progress_count > 0);
    const groupAvg = active.length
      ? Math.round(active.reduce((sum, s) => sum + s.avg_score, 0) / active.length)
      : 0;
    const totalActivities = students.reduce((sum, s) => sum + s.progress_count, 0);
    const totalMinutes = students.reduce((sum, s) => sum + s.total_minutes, 0);

    // Distribución de desempeño (sobre alumnos con actividad)
    const buckets = [
      { label: 'Excelente (90-100)', min: 90, color: 'bg-emerald-400', count: 0 },
      { label: 'Bueno (70-89)',      min: 70, color: 'bg-[#7DD3FC]',   count: 0 },
      { label: 'Suficiente (60-69)', min: 60, color: 'bg-[#D4A574]',   count: 0 },
      { label: 'En riesgo (<60)',    min: 0,  color: 'bg-rose-400',     count: 0 },
    ];
    active.forEach((s) => {
      const b = buckets.find((bk) => s.avg_score >= bk.min)!;
      b.count += 1;
    });
    const distribution = buckets.map((b) => ({
      ...b,
      val: active.length ? Math.round((b.count / active.length) * 100) : 0,
    }));

    return { total, active: active.length, groupAvg, totalActivities, totalMinutes, distribution };
  }, [students]);

  // ── Export: Informe grupal en PDF con datos reales ─────────────────────────
  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const PAGE_W = 297;
      const M = 15;

      const header = () => {
        doc.setFillColor(1, 28, 64);
        doc.rect(0, 0, PAGE_W, 38, 'F');
        doc.setFillColor(212, 165, 116);
        doc.rect(0, 38, PAGE_W, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(19);
        doc.setFont('helvetica', 'bold');
        doc.text('CEN Bachillerato — Informe Grupal de Desempeño MCCEMS', M, 18);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Docente: ${teacherName ?? '—'}`, M, 28);
        doc.text(`Grupo(s): ${grupoNombres.join(', ') || '—'}`, M, 34);
        doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, PAGE_W - M, 28, { align: 'right' });
      };

      const footer = () => {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(203, 213, 225);
        doc.text('© 2026 CEN Bachillerato — Documento generado automáticamente', PAGE_W / 2, 200, { align: 'center' });
      };

      header();

      // Resumen de KPIs reales
      const summary = [
        { label: 'ALUMNOS TOTALES',      value: String(stats.total) },
        { label: 'ALUMNOS ACTIVOS',      value: String(stats.active) },
        { label: 'PROMEDIO GRUPAL',      value: `${stats.groupAvg}/100` },
        { label: 'ACTIVIDADES',          value: String(stats.totalActivities) },
        { label: 'MIN. INVERTIDOS',      value: String(stats.totalMinutes) },
      ];
      summary.forEach((item, i) => {
        const x = M + i * 54;
        doc.setFillColor(248, 249, 251);
        doc.roundedRect(x, 46, 50, 22, 3, 3, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(1, 28, 64);
        doc.text(item.value, x + 25, 55, { align: 'center' });
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(item.label, x + 25, 62, { align: 'center' });
      });

      // Tabla detalle por alumno
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(1, 28, 64);
      doc.text('Detalle por Alumno', M, 80);

      const drawTableHead = (yTop: number) => {
        doc.setFillColor(1, 28, 64);
        doc.rect(M, yTop, 267, 9, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('#', M + 3, yTop + 6);
        doc.text('NOMBRE COMPLETO', M + 12, yTop + 6);
        doc.text('GRUPO', M + 100, yTop + 6);
        doc.text('ACTIVIDADES', M + 150, yTop + 6, { align: 'right' });
        doc.text('PUNTAJE PROM.', M + 195, yTop + 6, { align: 'right' });
        doc.text('MIN.', M + 230, yTop + 6, { align: 'right' });
        doc.text('ESTADO', M + 240, yTop + 6);
      };

      drawTableHead(84);
      const ranked = [...students].sort((a, b) => b.avg_score - a.avg_score);
      let y = 93;
      if (ranked.length === 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text('Sin alumnos registrados en tus grupos.', M + 3, y + 3);
      }
      ranked.forEach((s, idx) => {
        if (y > 188) {
          footer();
          doc.addPage();
          y = 20;
          drawTableHead(y - 9);
        }
        if (idx % 2 === 0) {
          doc.setFillColor(248, 249, 251);
          doc.rect(M, y, 267, 8, 'F');
        }
        doc.setFontSize(7.5);
        doc.setFont('helvetica', idx < 3 ? 'bold' : 'normal');
        doc.setTextColor(30, 41, 59);
        const nombre = s.full_name ?? s.email;
        doc.text(String(idx + 1), M + 3, y + 5.5);
        doc.text(nombre.length > 42 ? nombre.slice(0, 39) + '...' : nombre, M + 12, y + 5.5);
        doc.text(s.grupo_nombre ?? '—', M + 100, y + 5.5);
        doc.text(String(s.progress_count), M + 150, y + 5.5, { align: 'right' });
        doc.text(`${s.avg_score}/100`, M + 195, y + 5.5, { align: 'right' });
        doc.text(`${s.total_minutes}m`, M + 230, y + 5.5, { align: 'right' });
        const estado = s.progress_count >= 10 ? 'Al corriente' : s.progress_count > 0 ? 'En progreso' : 'Sin inicio';
        const [r2, g2, b2] = s.progress_count >= 10 ? [16, 185, 129] : s.progress_count > 0 ? [180, 120, 0] : [148, 163, 184];
        doc.setTextColor(r2, g2, b2);
        doc.text(estado, M + 240, y + 5.5);
        y += 8;
      });

      footer();
      doc.save(`informe-grupal-cen-bachillerato-${new Date().toISOString().split('T')[0]}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex min-h-screen font-['Epilogue'] relative overflow-hidden bg-[#011C40] theme-dark">

      {/* Cinematic background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1400px] h-[1400px] rounded-full blur-[200px] -mr-80 -mt-80 animate-pulse bg-[#D4A574]/5 opacity-100" />
        <div className="absolute bottom-0 left-[300px] w-[1200px] h-[1200px] rounded-full blur-[180px] -ml-80 -mb-80 bg-[#7DD3FC]/5 opacity-100" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
      </div>

      <Sidebar teacherName={teacherName} />

      <main className="flex-1 relative z-10 custom-scrollbar md:overflow-y-auto md:h-screen flex flex-col">

        {/* HUD Status Bar */}
        <div className="sticky top-0 z-50 backdrop-blur-3xl border-b px-4 sm:px-8 md:pr-12 md:pl-6 py-4 flex items-center justify-between bg-[#011C40]/80 border-white/5 shadow-2xl">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)] bg-emerald-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/50">ANALÍTICA ACTIVA</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="hidden xl:flex items-center gap-3">
              <Activity className="w-4 h-4 text-[#D4A574]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Alumnos</span>
                <span className="text-[10px] font-black leading-none text-white">{stats.total} registrados</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border bg-white/5 border-white/10">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
                CEN Bachillerato MCCEMS
              </span>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting || loading}
              className="flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-[#D4A574] text-white shadow-[0_10px_30px_rgba(212,165,116,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting ? 'Generando…' : 'Reporte MCCEMS'}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="p-4 sm:p-8 md:pt-12 md:pr-12 md:pb-12 md:pl-0 space-y-8 lg:space-y-16 flex-1">

          {/* Header */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] bg-[#7DD3FC]/10 text-[#7DD3FC]">
                Centro de Inteligencia
              </span>
              <div className="h-px w-10 sm:w-20 bg-white/10" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                Métricas MCCEMS
              </span>
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-4 text-white">
                Reportes <span className="italic font-sans text-[#D4A574]">Académicos</span>
              </h1>
              <p className="text-lg font-medium max-w-xl text-white/40">
                Analiza el desempeño real de tu grupo y genera un informe en PDF para la coordinación.
              </p>
            </div>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-12 gap-10">

            {/* Main performance chart */}
            <div className="col-span-12 lg:col-span-8">
              <PerformanceChart isDark={true} />
            </div>

            {/* Side metrics */}
            <div className="col-span-12 lg:col-span-4 space-y-10">
              {/* Promedio grupal real */}
              <div className="rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl bg-[#011C40] border border-white/5">
                <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform text-[#7DD3FC]">
                  <Target className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#7DD3FC]/10 text-[#7DD3FC]">
                      <Zap className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Promedio del Grupo</p>
                  </div>
                  <p className="text-6xl font-black tracking-tighter text-white">{stats.groupAvg}<span className="text-[#7DD3FC]">%</span></p>
                  <p className="text-sm font-medium leading-relaxed text-white/40">
                    Calculado sobre <span className="font-bold text-white">{stats.active}</span> alumno(s) con actividad registrada de un total de <span className="font-bold text-white">{stats.total}</span>.
                  </p>
                </div>
              </div>

              {/* Distribución de desempeño real */}
              <div className="rounded-[3rem] p-10 border shadow-xl bg-white/5 border-white/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#D4A574]/10 text-[#D4A574]">
                    <PieChart className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Distribución de Desempeño</p>
                </div>
                <div className="space-y-6">
                  {stats.distribution.map(item => (
                    <div key={item.label} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-white/50">{item.label}</span>
                        <span className="text-white">{item.val}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full overflow-hidden bg-white/5">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.val}%` }} />
                      </div>
                    </div>
                  ))}
                  {stats.active === 0 && (
                    <p className="text-[11px] font-medium text-white/30 italic">Aún no hay alumnos con actividad registrada.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-20">
            <div className="rounded-[2.5rem] p-8 border flex items-center gap-6 bg-white/5 border-white/5 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5">
                <Users className="w-8 h-8 text-white/20" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/20">Alumnos en el Grupo</p>
                <p className="text-xl font-black text-white">{stats.total}</p>
              </div>
            </div>

            <div className="rounded-[2.5rem] p-8 border flex items-center gap-6 bg-white/5 border-white/5 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5">
                <ShieldCheck className="w-8 h-8 text-[#7DD3FC]/40" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/20">Actividades Completadas</p>
                <p className="text-xl font-black text-white">{stats.totalActivities}</p>
              </div>
            </div>

            {/* Acción real: exportar (reemplaza la antigua tarjeta de "Tutor AI") */}
            <button
              onClick={handleExport}
              disabled={exporting || loading}
              className="text-left bg-gradient-to-br from-[#D4A574] to-[#b8895a] rounded-[2.5rem] p-8 text-white shadow-2xl flex items-center justify-between group cursor-pointer hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Informe para Coordinación</p>
                <p className="text-xl font-black">{exporting ? 'Generando PDF…' : 'Exportar Reporte'}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                {exporting ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <FileDown className="w-7 h-7 text-white" />}
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
