'use client';

import React, { useId } from 'react';
import { motion } from 'motion/react';

export interface DonutSegment {
  label: string;
  value: number;
  /** Color sólido en hex (p.ej. "#34d399") */
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  /** Texto grande en el centro (p.ej. "12") */
  centerValue?: string | number;
  /** Texto pequeño debajo del valor central */
  centerLabel?: string;
  /** Diámetro del SVG en px */
  size?: number;
  /** Grosor del anillo en px */
  thickness?: number;
}

/**
 * Donut chart en SVG puro + motion (sin dependencias externas).
 * Anima cada segmento con strokeDashoffset al montar.
 */
export default function DonutChart({
  segments,
  centerValue,
  centerLabel,
  size = 200,
  thickness = 22,
}: DonutChartProps) {
  const uid = useId();
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Offset acumulado (en fracción de la circunferencia) para encadenar segmentos.
  let acc = 0;

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-10">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-label="Gráfica de distribución"
        >
          {/* Pista de fondo */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={thickness}
          />
          {total > 0 &&
            segments.map((seg, i) => {
              const frac = seg.value / total;
              if (frac <= 0) return null;
              const dash = frac * circumference;
              const gap = circumference - dash;
              const offset = -acc * circumference;
              acc += frac;
              return (
                <motion.circle
                  key={`${uid}-${i}`}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={thickness}
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${gap}`}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.1, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                />
              );
            })}
        </svg>
        {(centerValue !== undefined || centerLabel) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerValue !== undefined && (
              <span className="text-4xl font-black tracking-tighter text-white leading-none">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/30">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="w-full space-y-4">
        {segments.map((seg, i) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div key={`${uid}-leg-${i}`} className="flex items-center gap-3">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="flex-1 text-[11px] font-bold text-white/50">{seg.label}</span>
              <span className="text-[11px] font-black tabular-nums text-white/80">
                {seg.value}
              </span>
              <span className="w-10 text-right text-[11px] font-black tabular-nums text-white/40">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
