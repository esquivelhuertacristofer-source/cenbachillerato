'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

const MCCEMS_INSIGHTS = [
  'Detectada baja participación en Saberes. ¿Quieres enviar recordatorio?',
  '¡Excelente! El 90% ha completado actividades de Metacognición.',
  'Tip MCCEMS: Vinculación con lo personal y social requiere práctica activa.',
  'Alumnos con mejor avance en Capacidades de la transversalidad esta semana.',
  'Recordatorio: Revisar progresiones pendientes antes del cierre de semana.',
];

interface WelcomeBannerProps {
  teacherName?: string;
  pctAvance?: number;
  isDark?: boolean;
}

export default function WelcomeBanner({
  teacherName,
  pctAvance = 88,
  isDark = true,
}: WelcomeBannerProps) {
  const [aiInsight, setAiInsight] = useState('');
  // Lazy initializer runs once on mount — no impure call during render.
  const [insightIdx] = useState(() => Math.floor(Date.now() / 1000) % MCCEMS_INSIGHTS.length);

  useEffect(() => {
    const id = setTimeout(() => {
      setAiInsight(MCCEMS_INSIGHTS[insightIdx] ?? '');
    }, 0);
    return () => clearTimeout(id);
  }, [insightIdx]);

  return (
    <div className={`relative overflow-hidden rounded-[4rem] p-12 md:p-20 shadow-2xl group border transition-all duration-1000 noise-texture ${
      isDark ? 'bg-[#011C40] border-white/10' : 'bg-white border-slate-100'
    }`}>

      {/* Atmospheric Glows */}
      <div className={`absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full opacity-10 blur-[140px] animate-pulse ${isDark ? 'bg-[#7DD3FC]' : 'bg-[#7DD3FC]/40'}`} />
      <div className={`absolute -left-40 -bottom-40 h-[500px] w-[500px] rounded-full opacity-10 blur-[120px] ${isDark ? 'bg-[#D4A574]' : 'bg-[#D4A574]/40'}`} />

      <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-16">

        <div className="flex-1 space-y-12 text-center xl:text-left">
          <div className="flex flex-wrap justify-center xl:justify-start gap-4">
            <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full backdrop-blur-3xl border shadow-2xl ${
              isDark ? 'bg-white/5 border-white/10 text-[#7DD3FC]' : 'bg-[#7DD3FC]/5 border-[#7DD3FC]/10 text-[#011C40]'
            }`}>
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Estatus: Activo
              </span>
            </div>

            {/* AI Insight Bubble */}
            {aiInsight && (
              <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full backdrop-blur-3xl border shadow-2xl ${
                isDark ? 'bg-[#7DD3FC]/10 border-[#7DD3FC]/20 text-[#7DD3FC]' : 'bg-[#7DD3FC]/5 border-[#7DD3FC]/10 text-[#011C40]'
              }`}>
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {aiInsight}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h1 className={`text-6xl md:text-8xl font-black leading-[1.1] tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-[#011C40]'}`}>
              Hola, <br />
              <span className="premium-gradient-text italic dashboard-serif-premium">
                Prof. {teacherName?.split(' ')[0] ?? 'Docente'}
              </span>
            </h1>
            <p className={`text-xl md:text-2xl font-medium leading-relaxed max-w-2xl transition-colors opacity-70 mx-auto xl:mx-0 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Tu grupo MCCEMS tiene un{' '}
              <span className={`font-black underline underline-offset-[12px] ${isDark ? 'text-[#7DD3FC] decoration-[#7DD3FC]/40' : 'text-[#D4A574] decoration-[#D4A574]/40'}`}>
                {pctAvance}% de avance
              </span>
              {' '}en las actividades del semestre.
            </p>
          </div>

          <div className="flex flex-wrap justify-center xl:justify-start gap-6 pt-4">
            <button
              onClick={() => { window.location.href = '/dashboard/docente/alumnos'; }}
              className="px-12 py-6 bg-[#D4A574] hover:bg-[#b8895a] text-white font-black rounded-[2.5rem] shadow-2xl transition-all hover:-translate-y-2 active:scale-95 text-[12px] uppercase tracking-[0.3em] flex items-center gap-5 group/btn overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
              <span>Mis Alumnos</span>
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-3 transition-transform" />
            </button>
            <button
              onClick={() => { window.location.href = '/dashboard/docente/reportes'; }}
              className={`px-12 py-6 font-black rounded-[2.5rem] border backdrop-blur-2xl transition-all text-[12px] uppercase tracking-[0.3em] hover:-translate-y-1 ${
                isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-[#011C40]/5 border-[#011C40]/10 text-[#011C40] hover:bg-[#011C40]/10'
              }`}
            >
              Reportes Académicos
            </button>
          </div>
        </div>

        {/* Diamond decoration */}
        <div className="relative w-72 h-72 md:w-[450px] md:h-[450px] flex items-center justify-center shrink-0">
          <div className={`absolute inset-0 rounded-full blur-[100px] animate-pulse ${isDark ? 'bg-[#7DD3FC]/5' : 'bg-[#7DD3FC]/10'}`} />
          <div className={`absolute inset-0 border-[2px] rounded-full animate-[spin_30s_linear_infinite] ${isDark ? 'border-white/10' : 'border-[#011C40]/5'}`} />

          <div className={`relative w-48 h-48 md:w-72 md:h-72 border backdrop-blur-3xl rounded-[4rem] flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-1000 overflow-hidden cursor-pointer ${
            isDark ? 'bg-white/5 border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-100 shadow-[0_40px_80px_rgba(1,28,64,0.1)]'
          }`}>
            <div className={`absolute inset-0 opacity-60 ${isDark ? 'bg-gradient-to-tr from-[#7DD3FC]/20 to-[#D4A574]/20' : 'bg-gradient-to-tr from-[#7DD3FC]/5 to-[#D4A574]/5'}`} />
            <div className="relative flex flex-col items-center">
              <span className="text-8xl md:text-[10rem] drop-shadow-[0_0_50px_rgba(125,211,252,0.4)] animate-bounce mb-4">💎</span>
              <div className={`px-5 py-2 rounded-full border transition-all duration-700 ${isDark ? 'bg-white/10 border-white/20' : 'bg-[#011C40]/5 border-[#011C40]/10'}`}>
                <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white' : 'text-[#011C40]'}`}>MCCEMS</span>
              </div>
            </div>
          </div>

          <Sparkles className={`absolute top-20 left-10 w-10 h-10 animate-pulse opacity-40 ${isDark ? 'text-[#D4A574]' : 'text-[#D4A574]'}`} />
          <Sparkles className={`absolute bottom-20 right-10 w-14 h-14 animate-pulse opacity-40 ${isDark ? 'text-[#7DD3FC]' : 'text-[#7DD3FC]'}`} style={{ animationDelay: '1s' }} />
        </div>
      </div>
    </div>
  );
}
