'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { Activity, Clock, CheckCircle2, ArrowUpRight, Zap, Sparkles } from 'lucide-react';
import StudentRecordModal from './StudentRecordModal';

interface DeliveryItem {
  id: string;
  user_id: string;
  name: string;
  initials: string;
  time: string;
  text: string;
  color: string;
}

interface LatestDeliveriesProps {
  grupoIds: string[];
  isDark?: boolean;
}

export default function LatestDeliveries({ grupoIds, isDark = true }: LatestDeliveriesProps) {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const sb = getSupabaseBrowser();

    const fetchLatest = async () => {
      try {
        if (grupoIds.length === 0) { setDeliveries([]); setLoading(false); return; }

        const { data: memberships } = await sb
          .from('alumnos_grupos')
          .select('id_alumno')
          .in('id_grupo', grupoIds);

        const studentIds = memberships?.map((m) => m.id_alumno) ?? [];
        if (studentIds.length === 0) { setDeliveries([]); setLoading(false); return; }

        const { data: rows } = await sb
          .from('intentos')
          .select('id, user_id, actividad_id, completed_at')
          .in('user_id', studentIds)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(5);

        if (!rows || rows.length === 0) { setDeliveries([]); setLoading(false); return; }

        const idsNeeded = [...new Set(rows.map((d) => d.user_id))];
        const actIds = [...new Set(rows.map((d) => d.actividad_id))];

        const [{ data: students }, { data: actividades }] = await Promise.all([
          sb.from('profiles').select('id, full_name').in('id', idsNeeded),
          sb.from('actividades').select('id, titulo').in('id', actIds),
        ]);

        const COLORS = isDark
          ? ['bg-white/10', 'bg-[#D4A574]/20', 'bg-[#7DD3FC]/20', 'bg-white/5', 'bg-[#D4A574]/10']
          : ['bg-[#011C40]', 'bg-[#D4A574]', 'bg-[#7DD3FC]', 'bg-[#011C40]/80', 'bg-[#D4A574]/80'];

        const actMap = new Map((actividades ?? []).map((a) => [a.id, a]));

        const mapped: DeliveryItem[] = rows.map((d, i) => {
          const student = students?.find((s) => s.id === d.user_id);
          const act = actMap.get(d.actividad_id);
          const name = student?.full_name ?? 'Alumno';
          const initials = name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
          const time = d.completed_at
            ? new Date(d.completed_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
            : '--:--';
          return {
            id: d.id,
            user_id: d.user_id,
            name,
            initials,
            time,
            text: act?.titulo ? `Completó: ${act.titulo}` : 'Completó una actividad',
            color: COLORS[i % COLORS.length] ?? COLORS[0]!,
          };
        });

        setDeliveries(mapped);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();

    // Realtime subscription
    const channel = sb
      .channel('realtime_deliveries_bachillerato')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'intentos' }, () => {
        void fetchLatest();
      })
      .subscribe();

    return () => { void sb.removeChannel(channel); };
  }, [grupoIds, isDark]);

  if (!mounted) return null;

  return (
    <div className={`rounded-[4rem] p-12 flex flex-col h-full relative overflow-hidden group/main border transition-all ${
      isDark
        ? 'bg-white/5 backdrop-blur-3xl border-white/5 shadow-2xl'
        : 'bg-white border-slate-100 shadow-[0_40px_80px_rgba(1,28,64,0.06)]'
    }`}>
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 blur-3xl opacity-40 transition-opacity duration-1000 ${
        isDark ? 'bg-[#7DD3FC]/5 group-hover/main:opacity-100' : 'bg-[#7DD3FC]/10 group-hover/main:opacity-60'
      }`} />

      <div className="mb-14 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <div className={`flex h-16 w-16 items-center justify-center rounded-[2rem] border shadow-2xl transition-all duration-700 group-hover/main:scale-110 group-hover/main:rotate-6 ${
            isDark ? 'bg-white/5 border-white/10 text-[#7DD3FC]' : 'bg-[#011C40]/5 border-[#011C40]/10 text-[#011C40]'
          }`}>
            <Activity className="h-8 w-8" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] leading-none pb-2 flex items-center gap-3 transition-colors ${
              isDark ? 'text-white/30' : 'text-slate-400'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-[#D4A574]" /> TIEMPO REAL
            </h3>
            <p className={`text-3xl font-black tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-[#011C40]'}`}>
              Últimas Entregas
            </p>
          </div>
        </div>
        <button className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-colors group/audit ${
          isDark ? 'text-[#7DD3FC] hover:text-white' : 'text-[#011C40]/40 hover:text-[#D4A574]'
        }`}>
          Audit <ArrowUpRight className="w-4 h-4 group-hover/audit:translate-x-1 group-hover/audit:-translate-y-1 transition-transform" />
        </button>
      </div>

      <div className="space-y-10 flex-1 relative z-10">
        {loading ? (
          <div className="space-y-10">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 animate-pulse">
                <div className={`w-16 h-16 rounded-[1.5rem] ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                <div className="flex-1 space-y-3">
                  <div className={`h-4 w-3/4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                  <div className={`h-3 w-1/4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Activity className={`w-12 h-12 ${isDark ? 'text-white/10' : 'text-slate-200'}`} />
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-slate-300'}`}>
              Sin actividad reciente
            </p>
          </div>
        ) : (
          deliveries.map((delivery, i) => (
            <div
              key={delivery.id}
              className="flex gap-8 group/item relative cursor-pointer"
              style={{ animationDelay: `${i * 100}ms` }}
              onClick={() => setSelectedStudent({ id: delivery.user_id, name: delivery.name })}
            >
              {i !== deliveries.length - 1 && (
                <div className={`absolute left-8 top-16 bottom-[-2.5rem] w-px transition-colors ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
              )}

              <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[1.5rem] text-lg font-black text-white transition-all group-hover/item:scale-110 shadow-2xl z-10 relative overflow-hidden border ${
                isDark ? 'border-white/5' : 'border-white'
              } ${delivery.color}`}>
                {delivery.initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <p className={`text-lg font-black truncate tracking-tight transition-colors group-hover/item:text-[#D4A574] ${
                    isDark ? 'text-white' : 'text-[#011C40]'
                  }`}>
                    {delivery.name}
                  </p>
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[10px] font-black whitespace-nowrap transition-all ${
                    isDark
                      ? 'bg-white/5 border-white/5 text-white/40 group-hover/item:text-[#7DD3FC]'
                      : 'bg-slate-50 border-slate-100 text-slate-400 group-hover/item:text-[#011C40]'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    {delivery.time}
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                    isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'
                  }`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                  </div>
                  <p className={`text-[14px] font-medium leading-relaxed max-w-sm transition-colors ${
                    isDark ? 'text-white/60' : 'text-slate-500'
                  }`}>
                    {delivery.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button className={`w-full mt-14 py-6 font-black rounded-[2.5rem] border text-[12px] uppercase tracking-[0.3em] transition-all duration-700 flex items-center justify-center gap-4 group/btn shadow-2xl backdrop-blur-xl ${
        isDark
          ? 'bg-[#7DD3FC]/10 border-[#7DD3FC]/20 text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-[#011C40]'
          : 'bg-[#011C40] border-[#011C40] text-white hover:bg-[#D4A574] hover:border-[#D4A574]'
      }`}
        onClick={() => { window.location.href = '/dashboard/docente/alumnos'; }}
      >
        <span>Historial de Sesiones</span>
        <Zap className="w-5 h-5 group-hover/btn:fill-current" />
      </button>

      {selectedStudent && (
        <StudentRecordModal
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          isDark={isDark}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
