'use client';

import React, { useId } from 'react';
import { motion } from 'motion/react';

export interface HBarItem {
  /** Etiqueta corta (p.ej. código UAC) */
  label: string;
  /** Subtítulo opcional (p.ej. nombre largo) */
  sublabel?: string;
  /** Valor 0-100 */
  pct: number;
  /** Color hex de la barra */
  color: string;
}

interface HBarChartProps {
  items: HBarItem[];
  /** Texto cuando no hay datos */
  emptyText?: string;
}

/**
 * Barras horizontales animadas en HTML/CSS + motion (sin SVG ni deps externas).
 * Pensado para "Avance por asignatura" del grupo.
 */
export default function HBarChart({ items, emptyText = 'Sin datos disponibles.' }: HBarChartProps) {
  const uid = useId();

  if (items.length === 0) {
    return <p className="text-[11px] font-medium text-white/30 italic">{emptyText}</p>;
  }

  return (
    <div className="space-y-5">
      {items.map((item, i) => (
        <div key={`${uid}-${i}`} className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0 flex items-baseline gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-white/70">
                {item.label}
              </span>
              {item.sublabel && (
                <span className="truncate text-[11px] font-medium text-white/30">
                  {item.sublabel}
                </span>
              )}
            </div>
            <span className="shrink-0 text-[12px] font-black tabular-nums text-white">
              {item.pct}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: item.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, Math.min(100, item.pct))}%` }}
              transition={{ duration: 1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
