'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { springs, stagger } from '@/lib/motion/tokens';
import { useReducedMotion, useInView, useMouseAura } from '@/lib/motion/hooks';

interface Metric {
  /** Valor final al que cuenta */
  target: number;
  /** Sufijo (p.ej. "%", "+") */
  suffix?: string;
  /** Etiqueta principal */
  label: string;
  /** Subtítulo de apoyo */
  sub: string;
  icon: string;
  /** Color de acento hex */
  accent: string;
}

// Cifras REALES y verificadas de la plataforma (no inventadas).
const METRICS: Metric[] = [
  { target: 6,    label: 'Semestres',              sub: 'Plan completo de bachillerato', icon: 'fa-layer-group',     accent: '#0D9488' },
  { target: 8,    label: 'Áreas de conocimiento',  sub: 'Currículo Fundamental MCCEMS',  icon: 'fa-compass',         accent: '#0891B2' },
  { target: 207,  label: 'Progresiones',           sub: 'Alineadas al MCCEMS 2025',      icon: 'fa-diagram-project', accent: '#0F766E' },
  { target: 1601, label: 'Actividades',            sub: 'Didácticas e interactivas',     icon: 'fa-list-check',      accent: '#7C3AED' },
  { target: 77,   label: 'Laboratorios 3D',        sub: 'Simuladores manipulables',      icon: 'fa-cube',            accent: '#B45309' },
  { target: 100,  suffix: '%', label: 'Alineado',  sub: 'Al Modelo Educativo MCCEMS',    icon: 'fa-circle-check',    accent: '#059669' },
];

function useCountUp(target: number, active: boolean, duration = 1500): number {
  const [val, setVal] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!active) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (reducedMotion) { setVal(target); return; }
    let raf = 0;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else setVal(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration, reducedMotion]);

  return val;
}

function MetricCard({ m, i, active }: { m: Metric; i: number; active: boolean }) {
  const auraRef = useMouseAura<HTMLDivElement>();
  const reducedMotion = useReducedMotion();
  const value = useCountUp(m.target, active);
  const display = Math.round(value).toLocaleString('es-MX');

  return (
    <motion.div
      ref={auraRef}
      className="num-card"
      style={{ '--num-accent': m.accent } as React.CSSProperties}
      initial={reducedMotion ? {} : { opacity: 0, y: 24 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ ...springs.smooth, delay: i * stagger.normal }}
      whileHover={reducedMotion ? {} : { y: -6 }}
    >
      <div className="num-card-glow" aria-hidden="true" />
      {!reducedMotion && <div className="num-card-aura" aria-hidden="true" />}

      <div className="num-card-icon" aria-hidden="true">
        <i className={`fas ${m.icon}`} />
      </div>

      <div className="num-card-value">
        {display}
        {m.suffix && <span className="num-card-suffix">{m.suffix}</span>}
      </div>
      <div className="num-card-label">{m.label}</div>
      <div className="num-card-sub">{m.sub}</div>

      <div className="num-card-edge" aria-hidden="true" />
    </motion.div>
  );
}

export function NumerosSection() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

  return (
    <section className="num-section" id="numeros">
      {/* Glows ambientales — profundidad sin oscurecer */}
      <div className="num-ambient num-ambient-a" aria-hidden="true" />
      <div className="num-ambient num-ambient-b" aria-hidden="true" />

      <div className="num-inner" ref={ref}>
        <div className="num-header">
          <span className="num-eyebrow">
            <i className="fas fa-chart-line" />
            La plataforma en números
          </span>
          <h2 className="num-title">
            Un currículo completo,<br />
            construido a <em>escala</em>
          </h2>
          <p className="num-sub">
            Las 8 áreas del Currículo Fundamental, publicadas y alineadas
            al MCCEMS 2025 — listas para operar desde el primer día.
          </p>
        </div>

        <div className="num-grid">
          {METRICS.map((m, i) => (
            <MetricCard key={m.label} m={m} i={i} active={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
