'use client';

import { TrendingUp, BarChart3, Sparkles } from 'lucide-react';

export default function PerformanceChart({ isDark = true }: { isDark?: boolean }) {
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
        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${
          isDark
            ? 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20'
            : 'bg-[#4ADE80]/10 text-emerald-700 border-emerald-200'
        }`}>
          <TrendingUp className="w-4 h-4" />
          +14.5%
        </div>
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

        {[45, 60, 40, 85, 70, 95, 65].map((h, i) => (
          <div key={i} className="relative flex-1 group/bar flex flex-col items-center h-full justify-end">
            {/* Value Tooltip */}
            <div className="absolute -top-4 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 -translate-y-4 group-hover/bar:translate-y-0 z-20">
              <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black shadow-2xl ${isDark ? 'bg-white text-[#011C40]' : 'bg-[#011C40] text-white'}`}>
                {h}%
              </div>
              <div className={`w-2 h-2 mx-auto rotate-45 -mt-1 ${isDark ? 'bg-white' : 'bg-[#011C40]'}`} />
            </div>

            <div
              className="w-full max-w-[45px] rounded-2xl transition-all duration-1000 group-hover/bar:shadow-[0_0_30px_rgba(212,165,116,0.3)] relative overflow-hidden group-hover/bar:scale-x-105"
              style={{
                height: `${h}%`,
                background: `linear-gradient(to top, #011C40, ${i === 5 ? '#7DD3FC' : '#D4A574'})`,
                transitionDelay: `${i * 100}ms`,
              }}
            >
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 skew-y-[-15deg] origin-top-left" />

              {/* Active Pulse for high performance */}
              {h > 90 && (
                <div className="absolute inset-0 animate-pulse bg-white/20" />
              )}
            </div>

            <span className={`mt-6 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
              isDark ? 'text-white/20 group-hover/bar:text-[#D4A574]' : 'text-slate-400 group-hover/bar:text-[#011C40]'
            }`}>
              {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'][i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
