'use client';

import { TrendingUp, TrendingDown, BarChart3, Sparkles } from 'lucide-react';

export interface WeeklyBar {
  /** Etiqueta del día (Lun, Mar, ...) */
  label: string;
  /** Altura de la barra normalizada 0-100 (pct respecto al día con más actividad) */
  pct: number;
  /** Valor real (nº de actividades completadas ese día) */
  value: number;
}

const DIAS_VACIOS: WeeklyBar[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(
  (label) => ({ label, pct: 0, value: 0 })
);

export default function PerformanceChart({
  isDark = true,
  bars,
  trend = null,
}: {
  isDark?: boolean;
  /** Engagement por día de la semana, calculado desde intentos reales. */
  bars?: WeeklyBar[];
  /** Variación % de actividad (últimos 7 días vs 7 anteriores). null = sin base de comparación. */
  trend?: number | null;
}) {
  const data = bars && bars.length === 7 ? bars : DIAS_VACIOS;
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const hayDatos = total > 0;
  // Día con más actividad: se resalta en cian.
  const maxValue = Math.max(...data.map((d) => d.value));
  const peakIndex = hayDatos ? data.findIndex((d) => d.value === maxValue) : -1;
  const trendUp = (trend ?? 0) >= 0;

  return (
    <div className={`rounded-[3rem] border transition-all duration-700 p-10 group h-full flex flex-col relative overflow-hidden ${
      isDark
        ? 'bg-white/5 border-white/5 shadow-2xl backdrop-blur-2xl'
        : 'bg-white border-slate-200 shadow-xl'
    }`}>

      {/* HUD Background Decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-10 transition-colors ${isDark ? 'bg-[#D4A574]' : 'bg-[#D4A574]/20'}`} />
      <div className={`absolute bottom-0 left-0 w-40 h-40 blur-[100px] opacity-5 transition-colors ${isDark ? 'bg-[#7DD3FC]' : 'bg-[#7DD3FC]/20'}`} />

      <div className="mb-10 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-5">
          <div className={`flex h-14 w-14 items-center justify-center rounded-[1.2rem] border transition-all duration-500 group-hover:rotate-6 ${
            isDark ? 'bg-white/5 border-white/10 text-[#D4A574]' : 'bg-[#D4A574]/10 border-[#D4A574]/20 text-[#D4A574]'
          }`}>
            <BarChart3 className="h-7 w-7" />
          </div>
          <div>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] leading-none pb-2 flex items-center gap-2 ${
              isDark ? 'text-white/30' : 'text-slate-400'
            }`}>
              <Sparkles className="w-3 h-3" /> ANALÍTICA SEMANAL
            </h3>
            <p className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-[#011C40]'}`}>Engagement Global</p>
          </div>
        </div>
        {trend !== null && (
          <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${
            trendUp
              ? (isDark ? 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20' : 'bg-[#4ADE80]/10 text-emerald-700 border-emerald-200')
              : (isDark ? 'bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20' : 'bg-[#F87171]/10 text-red-700 border-red-200')
          }`}>
            {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {trendUp ? '+' : ''}{trend}%
          </div>
        )}
      </div>

      <div className="flex-1 relative min-h-[250px] flex items-end justify-between gap-4 px-2 pb-4">
        {/* Technical HUD Grid */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${isDark ? 'opacity-[0.05]' : 'opacity-[0.08]'}`}
          style={{
            backgroundImage: `linear-gradient(${isDark ? '#fff' : '#011C40'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#fff' : '#011C40'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Empty state cuando no hay actividad registrada en la semana */}
        {!hayDatos && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
            <BarChart3 className={`h-10 w-10 mb-4 ${isDark ? 'text-white/20' : 'text-slate-300'}`} />
            <p className={`text-sm font-bold ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              Sin actividad registrada esta semana
            </p>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-white/20' : 'text-slate-300'}`}>
              Las barras se llenarán cuando tus alumnos completen actividades.
            </p>
          </div>
        )}

        {data.map((bar, i) => {
          const isPeak = i === peakIndex;
          return (
            <div key={bar.label} className="relative flex-1 group/bar flex flex-col items-center h-full justify-end">
              {/* Value Tooltip */}
              {hayDatos && (
                <div className="absolute -top-4 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 -translate-y-4 group-hover/bar:translate-y-0 z-20">
                  <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black shadow-2xl whitespace-nowrap ${isDark ? 'bg-white text-[#011C40]' : 'bg-[#011C40] text-white'}`}>
                    {bar.value} {bar.value === 1 ? 'actividad' : 'actividades'}
                  </div>
                  <div className={`w-2 h-2 mx-auto rotate-45 -mt-1 ${isDark ? 'bg-white' : 'bg-[#011C40]'}`} />
                </div>
              )}

              <div
                className="w-full max-w-[45px] rounded-2xl transition-all duration-1000 group-hover/bar:shadow-[0_0_30px_rgba(212,165,116,0.3)] relative overflow-hidden group-hover/bar:scale-x-105"
                style={{
                  // Altura mínima de 2% para que el carril del día siga siendo visible aunque tenga 0.
                  height: `${Math.max(bar.pct, 2)}%`,
                  background: `linear-gradient(to top, #011C40, ${isPeak ? '#7DD3FC' : '#D4A574'})`,
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 skew-y-[-15deg] origin-top-left" />

                {/* Active Pulse para el día pico */}
                {isPeak && (
                  <div className="absolute inset-0 animate-pulse bg-white/20" />
                )}
              </div>

              <span className={`mt-6 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                isDark ? 'text-white/20 group-hover/bar:text-[#D4A574]' : 'text-slate-400 group-hover/bar:text-[#011C40]'
              }`}>
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
