'use client';

import { PieChart, Zap } from 'lucide-react';

// Labels oficiales MCCEMS — 4 dimensiones de evaluación
const RADAR_LABELS = [
  'Saberes',
  'Metacognición',
  'Capacidades de la transversalidad',
  'Vinculación con lo personal y social',
];

export default function GroupRadarChart() {
  return (
    <div className="rounded-[2.5rem] border border-white bg-white/70 backdrop-blur-xl p-8 shadow-sm group h-full flex flex-col">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A574]/10 text-[#D4A574]">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B2545]/40 leading-none pb-1">Análisis de Dominio</h3>
            <p className="text-lg font-black text-[#0B2545]">Dimensiones MCCEMS</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
        {/* SVG Radar */}
        <svg viewBox="0 0 100 100" className="w-full max-w-[220px] drop-shadow-2xl">
          {/* Grid Circles */}
          {[20, 40, 60, 80, 100].map(r => (
            <circle key={r} cx="50" cy="50" r={r / 2} fill="none" stroke="rgba(11,37,69,0.05)" strokeWidth="0.5" />
          ))}
          {/* Grid Lines — 4 axes for 4 dimensions */}
          {[0, 90, 180, 270].map(a => (
            <line
              key={a}
              x1="50" y1="50"
              x2={50 + 50 * Math.cos(a * Math.PI / 180)}
              y2={50 + 50 * Math.sin(a * Math.PI / 180)}
              stroke="rgba(11,37,69,0.05)" strokeWidth="0.5"
            />
          ))}
          {/* Data Polygon */}
          <polygon
            points="50,12 88,50 50,82 12,50"
            fill="rgba(125,211,252,0.2)"
            stroke="#7DD3FC"
            strokeWidth="1"
            className="animate-pulse"
          />
          {/* Data Points */}
          <circle cx="50" cy="12" r="1.5" fill="#0B2545" />
          <circle cx="88" cy="50" r="1.5" fill="#D4A574" />
          <circle cx="50" cy="82" r="1.5" fill="#0B2545" />
          <circle cx="12" cy="50" r="1.5" fill="#D4A574" />
        </svg>

        {/* Labels — 4 dimensiones MCCEMS */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[7px] font-black text-[#0B2545] uppercase tracking-widest text-center leading-tight max-w-[60px]">
          {RADAR_LABELS[0]}
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 text-[7px] font-black text-[#0B2545] uppercase tracking-widest text-right leading-tight max-w-[52px]">
          {RADAR_LABELS[1]}
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[6px] font-black text-[#0B2545] uppercase tracking-widest text-center leading-tight max-w-[70px]">
          {RADAR_LABELS[2]}
        </div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[6px] font-black text-[#0B2545] uppercase tracking-widest text-left leading-tight max-w-[52px]">
          {RADAR_LABELS[3]}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between p-4 bg-[#0B2545]/5 rounded-2xl border border-white">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#D4A574]" />
          <span className="text-[10px] font-black text-[#0B2545] uppercase tracking-widest">Área de oportunidad:</span>
        </div>
        <span className="text-[10px] font-black text-[#D4A574] uppercase underline">Metacognición</span>
      </div>
    </div>
  );
}
