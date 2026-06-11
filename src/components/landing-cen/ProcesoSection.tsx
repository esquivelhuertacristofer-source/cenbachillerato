'use client';

import { motion } from 'motion/react';
import { springs, stagger } from '@/lib/motion/tokens';
import { useReducedMotion, useInView, useMouseAura } from '@/lib/motion/hooks';

const STEPS = [
  {
    num: '01',
    icon: 'fa-envelope-open-text',
    title: 'Solicita acceso',
    desc: 'Escríbenos con los datos de tu plantel. Te confirmamos en menos de 24 horas hábiles.',
  },
  {
    num: '02',
    icon: 'fa-school',
    title: 'Configura tu institución',
    desc: 'Cargamos tu estructura de grupos, semestre y subsistema en menos de 30 minutos.',
  },
  {
    num: '03',
    icon: 'fa-users',
    title: 'Invita a tus docentes',
    desc: 'Cada maestro recibe su cuenta individual con control granular de grupos y contenidos.',
  },
  {
    num: '04',
    icon: 'fa-rocket',
    title: 'Empieza a enseñar',
    desc: 'Desde el primer día, acceso completo al currículo oficial alineado a la SEP.',
  },
];

interface StepProps {
  step: (typeof STEPS)[number];
  i: number;
  inView: boolean;
  reducedMotion: boolean;
}

function PV2Step({ step, i, inView, reducedMotion }: StepProps) {
  const auraRef = useMouseAura<HTMLDivElement>();

  return (
    <motion.div
      className="pv2-step"
      initial={reducedMotion ? {} : { opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...springs.smooth, delay: i * stagger.normal }}
    >
      {/* Número + icono */}
      <div className="pv2-num-col">
        <span className="pv2-num" aria-hidden="true">{step.num}</span>
        <div className="pv2-icon" aria-hidden="true">
          <i className={`fas ${step.icon}`} />
        </div>
      </div>

      {/* Texto — ahora glass card con profundidad + aura */}
      <div className="pv2-content" ref={auraRef}>
        {!reducedMotion && <div className="pv2-content-aura" aria-hidden="true" />}
        <span className="pv2-step-label">Paso {step.num}</span>
        <h3 className="pv2-step-title">{step.title}</h3>
        <p className="pv2-step-desc">{step.desc}</p>
        <div className="pv2-content-edge" aria-hidden="true" />
      </div>
    </motion.div>
  );
}

export function ProcesoSection() {
  const [timelineRef, inView] = useInView<HTMLDivElement>();
  const reducedMotion = useReducedMotion();

  return (
    <section className="pv2-section">
      {/* Glow ambiental suave */}
      <div className="pv2-ambient" aria-hidden="true" />

      <div className="pv2-inner">

        {/* Header */}
        <div className="pv2-header">
          <div className="pv2-eyebrow">
            <i className="fas fa-map-signs" />
            Proceso de inicio
          </div>
          <h2 className="pv2-title">
            Empieza en <em>menos de</em><br />24 horas
          </h2>
          <p className="pv2-sub">
            Sin infraestructura propia. Sin instalación.<br />
            Solo un correo y tu plantel opera desde el primer día.
          </p>
        </div>

        {/* Timeline vertical */}
        <div className="pv2-timeline" ref={timelineRef}>
          {/* Línea animada que se "dibuja" al entrar en vista */}
          <motion.span
            className="pv2-line-fill"
            aria-hidden="true"
            initial={reducedMotion ? { scaleY: 1 } : { scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          {STEPS.map((step, i) => (
            <PV2Step
              key={step.num}
              step={step}
              i={i}
              inView={inView}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
