'use client';

import { useState, useEffect } from 'react';
import { X, Trophy, Clock, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface IntentoItem {
  id: string;
  actividad_titulo: string;
  actividad_codigo: string;
  completed_at: string | null;
  score: number | null;
}

export default function StudentRecordModal({
  studentId,
  studentName,
  onClose,
  isDark = true,
}: {
  studentId: string;
  studentName: string;
  onClose: () => void;
  isDark?: boolean;
}) {
  const [intentos, setIntentos] = useState<IntentoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecord() {
      setLoading(true);
      const sb = getSupabaseBrowser();

      const { data: rows } = await sb
        .from('intentos')
        .select('id, actividad_id, completed_at, score')
        .eq('user_id', studentId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(50);

      if (!rows || rows.length === 0) { setIntentos([]); setLoading(false); return; }

      const actIds = [...new Set(rows.map((r) => r.actividad_id))];
      const { data: actividades } = await sb
        .from('actividades')
        .select('id, codigo, titulo')
        .in('id', actIds);

      const actMap = new Map((actividades ?? []).map((a) => [a.id, a]));

      setIntentos(
        rows.map((r) => {
          const act = actMap.get(r.actividad_id);
          return {
            id: r.id,
            actividad_titulo: act?.titulo ?? '—',
            actividad_codigo: act?.codigo ?? r.actividad_id,
            completed_at: r.completed_at,
            score: r.score,
          };
        })
      );
      setLoading(false);
    }
    void fetchRecord();
  }, [studentId]);

  const totalXP = intentos.reduce((acc, i) => acc + (i.score ?? 0), 0);
  const avgScore = intentos.length > 0 ? Math.round(totalXP / intentos.length) : 0;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[#0A0118]/90 backdrop-blur-3xl" onClick={onClose} />

      <div className={`relative z-10 w-full max-w-3xl rounded-[60px] border p-12 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] ${
        isDark ? 'bg-white/[0.03] border-white/10 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        {/* Header decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A574]/10 blur-[100px] -mr-32 -mt-32" />

        {/* Header */}
        <div className="flex justify-between items-start mb-12 relative z-10">
          <div className="flex items-center gap-8">
            <div className={`w-24 h-24 rounded-[30px] flex items-center justify-center text-4xl font-black ${
              isDark ? 'bg-[#D4A574]/20 text-[#D4A574]' : 'bg-[#D4A574] text-white'
            }`}>
              {studentName[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4A574] mb-2">Expediente Académico</div>
              <h2 className="text-4xl font-black tracking-tighter uppercase">{studentName}</h2>
              <div className="flex items-center gap-4 mt-4 opacity-50 font-bold text-xs uppercase tracking-widest">
                <ShieldCheck size={16} className="text-[#7DD3FC]" /> Alumno MCCEMS
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-full hover:bg-[#E27D7D]/70 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-3 gap-6 mb-12 relative z-10">
          <div className="p-8 bg-white/5 rounded-[30px] border border-white/5">
            <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Puntos XP</div>
            <div className="text-3xl font-black flex items-center gap-3">
              <Zap className="text-[#D4A574]" /> {totalXP}
            </div>
          </div>
          <div className="p-8 bg-white/5 rounded-[30px] border border-white/5">
            <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Actividades</div>
            <div className="text-3xl font-black flex items-center gap-3 text-[#7DD3FC]">
              <CheckCircle2 /> {intentos.length}
            </div>
          </div>
          <div className="p-8 bg-white/5 rounded-[30px] border border-white/5">
            <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Promedio</div>
            <div className={`text-3xl font-black ${avgScore >= 70 ? 'text-emerald-400' : avgScore >= 50 ? 'text-[#D4A574]' : 'text-[#E27D7D]'}`}>
              {intentos.length > 0 ? `${avgScore}/100` : '—'}
            </div>
          </div>
        </div>

        {/* Historial */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
          <h3 className="text-xs font-black uppercase tracking-[0.5em] opacity-30 mb-8 px-4">
            Historial de Actividades
          </h3>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#D4A574] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : intentos.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black uppercase tracking-widest">Sin registros aún</div>
          ) : (
            intentos.map((item) => (
              <div
                key={item.id}
                className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#D4A574]">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-black uppercase tracking-widest mb-1">
                      {item.actividad_titulo}
                    </div>
                    <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} />
                      {item.completed_at
                        ? new Date(item.completed_at).toLocaleString('es-MX')
                        : '—'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.score != null && (
                    <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      item.score >= 70
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : item.score >= 50
                        ? 'bg-[#D4A574]/10 text-[#D4A574] border-[#D4A574]/20'
                        : 'bg-[#E27D7D]/10 text-[#E27D7D] border-[#E27D7D]/20'
                    }`}>
                      {item.score}/100
                    </div>
                  )}
                  <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
                    Completada
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
