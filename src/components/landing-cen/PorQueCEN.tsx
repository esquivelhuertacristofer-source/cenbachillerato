'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { springs, stagger } from '@/lib/motion/tokens';
import { useReducedMotion, useInView } from '@/lib/motion/hooks';

const FEATURES = [
  {
    title: 'Currículo oficial alineado al 100%',
    desc: '32 UAC del MCCEMS 2025, el Acuerdo 09/08/23 y el Modelo Educativo vigente de la SEP.',
  },
  {
    title: 'Compatible con todos los subsistemas',
    desc: 'DGB, DGETI, CONALEP, COBACH, DGETAyCM, ENP, CCH y bachilleratos con RVOE.',
  },
  {
    title: 'Evaluación formativa en tiempo real',
    desc: 'Identifica quién necesita apoyo antes del examen parcial, sin interrumpir la clase.',
  },
  {
    title: 'Operativo desde el primer día',
    desc: 'Sin instalación ni infraestructura propia. Alta masiva por CSV en menos de 30 minutos.',
  },
];

const STATS = [
  { icon: 'fa-book-open',    val: '32 UAC',    lbl: 'Currículo Fundamental · SEP' },
  { icon: 'fa-check-circle', val: '100%',       lbl: 'Alineación MCCEMS 2025'      },
  { icon: 'fa-certificate',  val: 'Acuerdo',    lbl: '09/08/23 · SEP'              },
];

export function PorQueCEN() {
  const [listRef, inView] = useInView<HTMLUListElement>();
  const reducedMotion = useReducedMotion();

  return (
    <section className="pqcen" id="por-que-cen">
      <div className="pqcen-ambient" aria-hidden="true" />
      <div className="pqcen-inner">

        {/* Columna izquierda — texto */}
        <div className="pqcen-left">
          <div className="pqcen-eyebrow">
            <i className="fas fa-circle-check" />
            Por qué elegir CEN
          </div>
          <h2 className="pqcen-heading">
            La plataforma educativa<br />
            que <em>México merece</em>
          </h2>

          <ul className="pqcen-feature-list" ref={listRef}>
            {FEATURES.map((f, i) => (
              <motion.li
                key={f.title}
                className="pqcen-feat"
                initial={reducedMotion ? {} : { opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ ...springs.smooth, delay: i * stagger.normal }}
              >
                <h3 className="pqcen-feat-title">{f.title}</h3>
                <p className="pqcen-feat-desc">{f.desc}</p>
              </motion.li>
            ))}
          </ul>

          <Link href="/bachillerato" className="pqcen-cta">
            Explorar CEN Bachillerato <i className="fas fa-arrow-right" />
          </Link>
        </div>

        {/* Columna derecha — visual con watermark "32" */}
        <div className="pqcen-visual">
          <span className="pqcen-watermark" aria-hidden="true">32</span>
          <div className="pqcen-stat-stack">
            {STATS.map(s => (
              <div key={s.lbl} className="pqcen-stat-card">
                <div className="pqcen-sc-icon">
                  <i className={`fas ${s.icon}`} />
                </div>
                <div className="pqcen-sc-body">
                  <span className="pqcen-sc-val">{s.val}</span>
                  <span className="pqcen-sc-lbl">{s.lbl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
