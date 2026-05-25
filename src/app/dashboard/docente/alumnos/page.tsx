'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import {
  Users,
  Search,
  ArrowRight,
  GraduationCap,
  Award,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Download,
  FileText,
  Trophy,
} from 'lucide-react';
import jsPDF from 'jspdf';

interface IntentoEntry {
  actividad_id: string;
  actividad_titulo: string;
  completed_at: string;
  score: number | null;
  tiempo_segundos: number | null;
}

interface Student {
  id: string;
  full_name: string | null;
  email: string;
  grupo_nombre: string | null;
  progress_count: number;
  avg_score: number;
  total_minutes: number;
  history?: IntentoEntry[];
}

export default function AlumnosPage() {
  const [teacherName, setTeacherName] = useState<string | undefined>(undefined);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Student | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
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

      const enriched: Student[] = (profiles as { id: string; full_name: string | null; email: string }[]).map((p) => ({
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

  useEffect(() => {
    if (selected && !selected.history) {
      const fetchHistory = async () => {
        setLoadingDetails(true);
        const sb = getSupabaseBrowser();
        const { data: rows } = await sb
          .from('intentos')
          .select('actividad_id, completed_at, score, tiempo_segundos')
          .eq('user_id', selected.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false });

        if (rows && rows.length > 0) {
          const actIds = [...new Set(rows.map((r) => r.actividad_id))];
          const { data: actividades } = await sb
            .from('actividades')
            .select('id, titulo')
            .in('id', actIds);
          const actMap = new Map((actividades ?? []).map((a) => [a.id, a.titulo as string]));

          const history: IntentoEntry[] = (rows as { actividad_id: string; completed_at: string; score: number | null; tiempo_segundos: number | null }[]).map((r) => ({
            actividad_id: r.actividad_id,
            actividad_titulo: actMap.get(r.actividad_id) ?? r.actividad_id,
            completed_at: r.completed_at,
            score: r.score,
            tiempo_segundos: r.tiempo_segundos,
          }));
          setSelected((prev) => (prev ? { ...prev, history } : null));
          setStudents((prev) => prev.map((s) => (s.id === selected.id ? { ...s, history } : s)));
        } else {
          setSelected((prev) => (prev ? { ...prev, history: [] } : null));
        }
        setLoadingDetails(false);
      };
      void fetchHistory();
    }
  }, [selected]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        (s.full_name?.toLowerCase().includes(q) ?? false) ||
        s.email.toLowerCase().includes(q) ||
        (s.grupo_nombre?.toLowerCase().includes(q) ?? false)
    );
  }, [search, students]);

  const getInitials = (name: string | null, email: string) => {
    const display = name ?? email;
    return display.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const handleIndividualPDF = (student: Student) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFillColor(1, 28, 64);
    doc.rect(0, 0, 210, 42, 'F');
    doc.setFillColor(212, 165, 116);
    doc.rect(0, 42, 210, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('CEN Bachillerato — Expediente Académico', 15, 20);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 15, 30);
    doc.text(`Docente: ${teacherName ?? ''}`, 15, 37);

    doc.setTextColor(1, 28, 64);
    doc.setFontSize(17);
    doc.setFont('helvetica', 'bold');
    doc.text(student.full_name ?? student.email, 15, 58);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Grupo: ${student.grupo_nombre || '—'}`, 15, 67);
    doc.text(`Email: ${student.email}`, 15, 73);

    const kpis = [
      { label: 'ACTIVIDADES', value: String(student.progress_count) },
      { label: 'PUNTAJE PROM.', value: `${student.avg_score}/100` },
      { label: 'MIN. INVERTIDOS', value: String(student.total_minutes) },
    ];
    kpis.forEach((kpi, i) => {
      const x = 15 + i * 62;
      doc.setFillColor(248, 249, 251);
      doc.roundedRect(x, 82, 57, 26, 3, 3, 'F');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(1, 28, 64);
      doc.text(kpi.value, x + 28.5, 95, { align: 'center' });
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(kpi.label, x + 28.5, 103, { align: 'center' });
    });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(1, 28, 64);
    doc.text('Historial de Actividades', 15, 122);

    doc.setFillColor(1, 28, 64);
    doc.rect(15, 126, 180, 9, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('ACTIVIDAD', 19, 132);
    doc.text('FECHA', 105, 132);
    doc.text('PUNTAJE', 148, 132);
    doc.text('TIEMPO', 178, 132);

    const history = student.history ?? [];
    let y = 135;
    history.forEach((entry, idx) => {
      if (y > 272) return;
      if (idx % 2 === 0) {
        doc.setFillColor(248, 249, 251);
        doc.rect(15, y, 180, 8, 'F');
      }
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const titulo = entry.actividad_titulo.length > 45 ? entry.actividad_titulo.slice(0, 42) + '...' : entry.actividad_titulo;
      doc.text(titulo, 19, y + 5.5);
      doc.text(new Date(entry.completed_at).toLocaleDateString('es-MX'), 105, y + 5.5);
      doc.text(entry.score !== null ? String(entry.score) : '—', 163, y + 5.5, { align: 'right' });
      doc.text(entry.tiempo_segundos ? `${Math.round(entry.tiempo_segundos / 60)}m` : '—', 192, y + 5.5, { align: 'right' });
      y += 8;
    });

    if (history.length === 0) {
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('Sin actividades registradas.', 19, 144);
    }

    doc.setFontSize(7);
    doc.setTextColor(203, 213, 225);
    doc.text('© 2026 CEN Bachillerato — Documento generado automáticamente', 105, 288, { align: 'center' });

    doc.save(`expediente-${(student.full_name ?? student.email).replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  const handleGroupPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFillColor(1, 28, 64);
    doc.rect(0, 0, 297, 38, 'F');
    doc.setFillColor(212, 165, 116);
    doc.rect(0, 38, 297, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('CEN Bachillerato — Informe Grupal de Desempeño MCCEMS', 15, 18);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Docente: ${teacherName ?? ''}`, 15, 28);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 15, 35);

    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.progress_count > 0).length;
    const groupAvg = totalStudents
      ? Math.round(students.reduce((s, st) => s + st.avg_score, 0) / totalStudents)
      : 0;
    const totalActivities = students.reduce((s, st) => s + st.progress_count, 0);

    const summaryItems = [
      { label: 'ALUMNOS TOTALES', value: String(totalStudents) },
      { label: 'ALUMNOS ACTIVOS', value: String(activeStudents) },
      { label: 'PUNTAJE GRUPAL', value: `${groupAvg}/100` },
      { label: 'ACTIVIDADES COMPLETADAS', value: String(totalActivities) },
    ];
    summaryItems.forEach((item, i) => {
      const x = 15 + i * 70;
      doc.setFillColor(248, 249, 251);
      doc.roundedRect(x, 46, 65, 22, 3, 3, 'F');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(1, 28, 64);
      doc.text(item.value, x + 32.5, 55, { align: 'center' });
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(item.label, x + 32.5, 62, { align: 'center' });
    });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(1, 28, 64);
    doc.text('Detalle por Alumno', 15, 80);

    doc.setFillColor(1, 28, 64);
    doc.rect(15, 84, 267, 9, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('#', 18, 90);
    doc.text('NOMBRE COMPLETO', 27, 90);
    doc.text('GRUPO', 115, 90);
    doc.text('ACTIVIDADES', 150, 90);
    doc.text('PUNTAJE PROM.', 190, 90);
    doc.text('MIN. INVERTIDOS', 230, 90);
    doc.text('ESTADO', 263, 90);

    const ranked = [...students].sort((a, b) => b.avg_score - a.avg_score);
    let y = 93;
    ranked.forEach((s, idx) => {
      if (y > 188) return;
      if (idx % 2 === 0) {
        doc.setFillColor(248, 249, 251);
        doc.rect(15, y, 267, 8, 'F');
      }
      doc.setFontSize(7.5);
      doc.setFont('helvetica', idx < 3 ? 'bold' : 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(String(idx + 1), 18, y + 5.5);
      doc.text(s.full_name ?? s.email, 27, y + 5.5);
      doc.text(s.grupo_nombre ?? '—', 115, y + 5.5);
      doc.text(String(s.progress_count), 165, y + 5.5, { align: 'right' });
      doc.text(`${s.avg_score}/100`, 205, y + 5.5, { align: 'right' });
      doc.text(`${s.total_minutes}m`, 245, y + 5.5, { align: 'right' });
      const estado = s.progress_count >= 10 ? 'Al corriente' : s.progress_count > 0 ? 'En progreso' : 'Sin inicio';
      const [r2, g2, b2] = s.progress_count >= 10 ? [16, 185, 129] : s.progress_count > 0 ? [180, 120, 0] : [148, 163, 184];
      doc.setTextColor(r2, g2, b2);
      doc.text(estado, 263, y + 5.5);
      doc.setTextColor(30, 41, 59);
      y += 8;
    });

    doc.setFontSize(7);
    doc.setTextColor(203, 213, 225);
    doc.text('© 2026 CEN Bachillerato — Documento generado automáticamente', 148.5, 198, { align: 'center' });

    doc.save(`informe-grupal-cen-bachillerato-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) return (
    <div className="flex min-h-screen bg-[#F4F1EA] font-['Epilogue']">
      <Sidebar />
      <main className="flex-1 md:ml-[260px] p-4 sm:p-8 md:p-12 space-y-8 lg:space-y-16">
        <div className="h-64 bg-[#011C40] rounded-[4rem] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[360px] bg-white rounded-[3.5rem] border border-slate-100 animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F4F1EA] font-['Epilogue'] relative overflow-hidden">
      <Sidebar teacherName={teacherName} />

      <main className="flex-1 md:ml-[260px] p-4 sm:p-8 md:p-12 space-y-8 lg:space-y-16 relative z-10">

        {/* Header */}
        <div className="relative overflow-hidden rounded-[3rem] md:rounded-[4rem] bg-[#011C40] p-8 sm:p-12 md:p-16 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A574]/10 rounded-full blur-[100px]" />
          <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="space-y-4 md:space-y-6 w-full xl:w-auto">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#7DD3FC]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Gestión de Alumnado</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-none tracking-tighter">
                Mis <span className="italic text-[#D4A574]">Alumnos</span>
              </h1>
              <p className="text-white/50 font-medium text-lg max-w-xl">
                Supervisa el avance individual, entrega de actividades y desempeño MCCEMS en tiempo real.
              </p>
            </div>
            <div className="w-full xl:w-96 space-y-3 md:space-y-4">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-[#D4A574] transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar alumno, grupo..."
                  aria-label="Buscar alumno por nombre, correo o grupo"
                  className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] text-white focus:border-[#D4A574] outline-none transition-all backdrop-blur-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest flex-1 text-center">
                  {filtered.length} alumno{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={handleGroupPDF}
                  disabled={students.length === 0}
                  className="flex items-center gap-2 px-5 py-3 bg-[#D4A574] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#b8895a] transition-all shadow-lg active:scale-95 disabled:opacity-40"
                >
                  <FileText className="w-4 h-4" /> Informe Grupal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Student grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <Users className="w-16 h-16 text-slate-200" />
            <p className="text-sm font-bold text-slate-400 italic">No hay alumnos en tus grupos aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {filtered.map((student, i) => (
              <div
                key={student.id}
                role="button"
                tabIndex={0}
                aria-label={`Ver expediente de ${student.full_name ?? student.email}`}
                onClick={() => setSelected(student)}
                onKeyDown={(e) => e.key === 'Enter' && setSelected(student)}
                className="group relative bg-white rounded-[3.5rem] p-12 cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl border border-slate-100 flex flex-col h-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:ring-offset-2"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-20 h-20 bg-[#011C40] rounded-[2rem] flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:rotate-6 transition-transform">
                    {getInitials(student.full_name, student.email)}
                  </div>
                  <div className="text-right">
                    <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                      Activo
                    </span>
                    <p className="text-[10px] font-black text-slate-300 mt-2 uppercase tracking-widest">
                      {student.grupo_nombre ?? '—'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <h3 className="font-black text-[#011C40] text-2xl tracking-tighter group-hover:text-[#D4A574] transition-colors line-clamp-1">
                      {student.full_name ?? '—'}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest truncate">
                      {student.email}
                    </p>
                  </div>

                  {student.avg_score > 0 && (
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-[#D4A574]" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Promedio: <span className="text-[#011C40]">{student.avg_score}/100</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Trophy className="w-4 h-4 text-[#7DD3FC]" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="text-[#011C40]">{student.progress_count}</span> actividades completadas
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-slate-300" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {student.total_minutes}m invertidos
                    </span>
                  </div>
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-[#011C40] group-hover:text-white transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#011C40]/90 backdrop-blur-md p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[#F4F1EA] rounded-[4rem] overflow-hidden shadow-2xl flex flex-col xl:flex-row relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal sidebar */}
            <div className="w-full xl:w-[380px] bg-[#011C40] p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <GraduationCap className="w-48 h-48" />
              </div>
              <div className="relative z-10 space-y-10">
                <div className="w-32 h-32 bg-white/10 rounded-[3rem] border border-white/20 flex items-center justify-center text-4xl font-black shadow-2xl">
                  {getInitials(selected.full_name, selected.email)}
                </div>
                <div className="space-y-4">
                  <span className="px-4 py-1.5 bg-[#7DD3FC] text-[#011C40] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Expediente Oficial
                  </span>
                  <h2 className="text-4xl font-black tracking-tighter leading-none">{selected.full_name ?? '—'}</h2>
                  <p className="text-[#D4A574] font-black text-xs uppercase tracking-[0.3em]">
                    {selected.grupo_nombre ?? 'Sin grupo'}
                  </p>
                </div>
                <div className="space-y-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <Users className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Grupo Asignado</p>
                      <p className="text-sm font-black text-white">{selected.grupo_nombre ?? 'Sin grupo'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <History className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Último Acceso</p>
                      <p className="text-sm font-black text-white">
                        {selected.history?.[0]
                          ? new Date(selected.history[0].completed_at).toLocaleDateString('es-MX')
                          : 'Sin actividad'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleIndividualPDF(selected)}
                className="relative z-10 w-full py-6 bg-white text-[#011C40] rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#D4A574] hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 mt-8"
              >
                <Download className="w-5 h-5" /> Descargar Expediente PDF
              </button>
            </div>

            {/* Modal content */}
            <div className="flex-1 p-12 overflow-y-auto dashboard-scrollbar-thin space-y-12">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#011C40]/40">Analítica de Desempeño</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-[#011C40] hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* KPI grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-white shadow-sm flex flex-col items-center text-center space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actividades</p>
                  <p className="text-5xl font-black text-[#011C40]">{selected.progress_count}</p>
                  <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div
                      className="h-full bg-[#7DD3FC] rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((selected.progress_count / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 border border-white shadow-sm flex flex-col items-center text-center space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Puntaje Prom.</p>
                  <p className="text-5xl font-black text-[#D4A574]">
                    {selected.avg_score}<span className="text-slate-200 text-3xl">/100</span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Promedio general</p>
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 border border-white shadow-sm flex flex-col items-center text-center space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo</p>
                  <p className="text-5xl font-black text-[#011C40]">
                    {selected.total_minutes}<span className="text-slate-200 text-3xl">m</span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Tiempo total</p>
                </div>
              </div>

              {/* Activity dots */}
              <div className="bg-white rounded-[2.5rem] p-10 border border-white shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-[#011C40] uppercase tracking-widest">Mapa de Actividades</p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#7DD3FC]" /> Completada
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-100" /> Pendiente
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-4">
                  {Array.from({ length: 20 }, (_, idx) => {
                    const isDone = idx < selected.progress_count;
                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#7DD3FC] shadow-[0_10px_20px_rgba(125,211,252,0.3)] scale-105'
                            : 'bg-slate-50 border border-slate-100 opacity-50'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-[#011C40]" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* History */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <History className="w-5 h-5 text-[#D4A574]" />
                  <p className="text-[10px] font-black text-[#011C40] uppercase tracking-widest">Historial Reciente</p>
                </div>

                <div className="space-y-4">
                  {loadingDetails ? (
                    <div className="flex flex-col items-center py-10 gap-4">
                      <Loader2 className="w-8 h-8 text-[#011C40] animate-spin" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizando datos...</p>
                    </div>
                  ) : selected.history && selected.history.length > 0 ? (
                    selected.history.map((log, i) => (
                      <div
                        key={i}
                        className="group bg-white rounded-3xl p-6 border border-white shadow-sm flex items-center justify-between hover:border-[#D4A574]/20 transition-all"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#011C40] font-black text-xs group-hover:bg-[#011C40] group-hover:text-white transition-all">
                            <Trophy className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#011C40] uppercase tracking-tight">{log.actividad_titulo}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {new Date(log.completed_at).toLocaleString('es-MX', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {log.score !== null && (
                            <div className="px-4 py-2 bg-[#011C40]/5 rounded-xl text-[10px] font-black text-[#011C40] uppercase tracking-widest">
                              {log.score}/100
                            </div>
                          )}
                          <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3" /> Completada
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center py-12 gap-4 bg-white rounded-[3rem] border border-dashed border-slate-200">
                      <AlertCircle className="w-10 h-10 text-slate-200" />
                      <p className="text-sm font-bold text-slate-400 italic">No hay actividades registradas aún.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
