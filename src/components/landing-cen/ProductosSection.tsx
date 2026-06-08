'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { springs } from '@/lib/motion/tokens';
import { useReducedMotion, useMouseAura } from '@/lib/motion/hooks';

interface ProductItem {
  id: string;
  name: string;
  tier: string;
  badge: string;
  description: string;
  meta: string;
  icon: string;
  color: string;
  accent: string;
  image: string;
  href: string;
  available: boolean;
  external?: boolean;
  features?: string[];
  telemetry: { val: string; lbl: string; icon: string }[];
}

export const PRODUCTS: ProductItem[] = [
  /* ── Niveles educativos — familia de azules ── */
  {
    id: 'preescolar',
    name: 'CEN Preescolar',
    tier: '3–6a',
    badge: 'Educación Básica · 3–6 años',
    description: 'Juego, exploración y aprendizaje para la primera infancia. Pensamiento lógico y comunicación desde los 3 años.',
    meta: '3 a 6 años',
    icon: 'fa-child',
    color: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
    accent: '#60A5FA',
    image: '/4.webp',
    href: '#',
    available: false,
    telemetry: [
      { val: '3–6',      lbl: 'Años de Edad',  icon: 'fa-child'    },
      { val: '100%',     lbl: 'Lúdico Activo', icon: 'fa-gamepad'  },
      { val: 'Motric.',  lbl: 'Desarrollo',    icon: 'fa-brain'    },
    ],
  },
  {
    id: 'primaria',
    name: 'CEN Primaria',
    tier: '6–12a',
    badge: 'Educación Básica · NEM 2025',
    description: 'Contenidos para 1° a 6° grado alineados a la Nueva Escuela Mexicana 2025.',
    meta: '1° a 6° Grado · NEM 2025',
    icon: 'fa-book-open',
    color: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
    accent: '#3B82F6',
    features: ['6 Grados', 'NEM 2025', 'Educación Básica'],
    image: '/5.webp',
    href: '#',
    available: false,
    telemetry: [
      { val: '6 Grados', lbl: 'Primaria SEP',      icon: 'fa-graduation-cap' },
      { val: 'Fases 3-5',lbl: 'Nueva Escuela Mex.', icon: 'fa-layer-group'  },
      { val: 'Proyectos',lbl: 'Pedagógicos',        icon: 'fa-puzzle-piece'  },
    ],
  },
  {
    id: 'secundaria',
    name: 'CEN Secundaria',
    tier: '12–15a',
    badge: 'Educación Básica · NEM 2025',
    description: '7° a 9° grado con la Nueva Escuela Mexicana. Proyectos interdisciplinares y evaluación formativa.',
    meta: '7° a 9° Grado · NEM 2025',
    icon: 'fa-school',
    color: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
    accent: '#2563EB',
    features: ['3 Grados', 'NEM 2025', 'Evaluación formativa'],
    image: '/6.webp',
    href: '#',
    available: false,
    telemetry: [
      { val: '3 Grados', lbl: 'Secundaria SEP', icon: 'fa-school'          },
      { val: 'Fase 6',   lbl: 'NEM 2025',        icon: 'fa-compass'        },
      { val: 'Formativa',lbl: 'Evaluación',       icon: 'fa-clipboard-check'},
    ],
  },
  {
    id: 'bachillerato',
    name: 'CEN Bachillerato',
    tier: 'EMS',
    badge: 'EMS · MCCEMS · SEP',
    description: 'Plataforma alineada al Marco Curricular Común de la EMS. 34 UAC del Currículum Fundamental, 8 RSC y 4 Ámbitos de Formación.',
    meta: '34 UAC · 6 Semestres',
    icon: 'fa-graduation-cap',
    color: 'linear-gradient(135deg, #0A1628 0%, #1E3A8A 100%)',
    accent: '#3B82F6',
    features: ['34 UAC', '8 RSC', 'MCCEMS 2023', 'Multi-subsistema'],
    image: '/bachillerato.webp',
    href: '/bachillerato',
    available: true,
    telemetry: [
      { val: '34 UAC', lbl: 'SEP Oficial',    icon: 'fa-book-open'    },
      { val: '100%',   lbl: 'MCCEMS 2023',    icon: 'fa-check-circle' },
      { val: 'Acuerdo',lbl: '09/08/23 SEP',   icon: 'fa-certificate'  },
    ],
  },
  /* ── Plataformas transversales ── */
  {
    id: 'financiera',
    name: 'Educación Financiera',
    tier: 'P · S',
    badge: 'Primaria · Secundaria',
    description: '364 actividades pedagógicas para nueve grados escolares, de primero de primaria a tercero de secundaria.',
    meta: '364 Actividades · 9 Grados',
    icon: 'fa-coins',
    color: 'linear-gradient(135deg, #064E3B 0%, #059669 100%)',
    accent: '#10B981',
    features: ['364 Actividades', '9 Grados escolares', 'Primaria · Secundaria'],
    image: '/2.webp',
    href: 'https://cenfinancierafinal.vercel.app',
    available: true,
    external: true,
    telemetry: [
      { val: '364 Retos', lbl: 'Actividades',          icon: 'fa-coins'  },
      { val: '9 Grados',  lbl: 'Primaria-Sec',         icon: 'fa-list-ol'},
      { val: 'Banxico',   lbl: 'Educación Financiera',  icon: 'fa-wallet' },
    ],
  },
  {
    id: 'labs',
    name: 'Laboratorios Virtuales',
    tier: 'STEM',
    badge: 'Bachillerato · STEM',
    description: '40 simuladores interactivos de química, física, biología y matemáticas alineados al MCCEMS.',
    meta: '40 Simuladores · MCCEMS',
    icon: 'fa-flask',
    color: 'linear-gradient(135deg, #2E1065 0%, #6D28D9 100%)',
    accent: '#8B5CF6',
    features: ['40 Simuladores', 'Química · Física · Bio', 'MCCEMS Alineado'],
    image: '/3.webp',
    href: 'https://www.cenlaboratorios.com.mx',
    available: true,
    external: true,
    telemetry: [
      { val: '40 Labs',    lbl: 'Simuladores STEM', icon: 'fa-flask'     },
      { val: 'Quí/Fís/Bio',lbl: 'Ciencias Exactas', icon: 'fa-atom'      },
      { val: 'MCCEMS',     lbl: 'Alineación SEP',   icon: 'fa-microscope'},
    ],
  },
  {
    id: 'robotica',
    name: 'CEN Robótica',
    tier: 'K–12',
    badge: 'STEM · Todas las edades',
    description: 'Pensamiento computacional, programación visual y robótica educativa para primaria, secundaria y bachillerato.',
    meta: 'Todas las edades',
    icon: 'fa-robot',
    color: 'linear-gradient(135deg, #7C2D12 0%, #C2410C 100%)',
    accent: '#F97316',
    image: '/7.webp',
    href: '#',
    available: false,
    telemetry: [
      { val: 'Arduino', lbl: 'Compatible',      icon: 'fa-microchip'},
      { val: 'Coding',  lbl: 'Código Visual',   icon: 'fa-code'     },
      { val: 'STEM',    lbl: 'Proyectos Guiados',icon: 'fa-robot'   },
    ],
  },
  {
    id: 'idiomas',
    name: 'CEN Idiomas',
    tier: 'A1–B2',
    badge: 'Básica y Media Superior',
    description: 'Inglés, francés y portugués con metodología comunicativa activa para estudiantes de primaria hasta bachillerato.',
    meta: 'Inglés · Francés · Portugués',
    icon: 'fa-language',
    color: 'linear-gradient(135deg, #4A044E 0%, #86198F 100%)',
    accent: '#D946EF',
    image: '/8.webp',
    href: '#',
    available: false,
    telemetry: [
      { val: 'EN·FR·PT', lbl: 'Idiomas',       icon: 'fa-language'},
      { val: 'A1-B2',    lbl: 'Marco CEFR',    icon: 'fa-globe'   },
      { val: 'Gamific.', lbl: 'Método Activo', icon: 'fa-trophy'  },
    ],
  },
];

type Product = ProductItem;

interface AccPanelProps {
  p: Product;
  i: number;
  isActive: boolean;
  onActivate: (i: number) => void;
  reducedMotion: boolean;
}

function AccPanel({ p, i, isActive, onActivate, reducedMotion }: AccPanelProps) {
  const auraRef = useMouseAura<HTMLDivElement>();

  return (
    <motion.div
      ref={auraRef}
      className={`acc-panel${isActive ? ' acc--active' : ''}`}
      style={{ '--acc-accent': p.accent } as React.CSSProperties}
      onClick={() => onActivate(i)}
      whileHover={reducedMotion ? {} : { scale: 1.012 }}
      whileTap={reducedMotion ? {} : { scale: 0.99 }}
      transition={springs.snappy}
    >
      {/* Mouse aura highlight */}
      {!reducedMotion && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
            background: 'radial-gradient(180px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.07), transparent 70%)',
            zIndex: 5,
          }}
        />
      )}

      <div className="acc-bg" style={{ backgroundImage: `url(${p.image})` }} />
      <div className="acc-ov-solid" style={{ background: p.color }} />
      <div className="acc-ov-gradient" />
      <div className="acc-glass-edge" />

      {/* Collapsed content */}
      <div className="acc-collapsed-content">
        {p.tier && <span className="acc-tier">{p.tier}</span>}
        <span className="acc-vname">{p.name}</span>
      </div>

      {/* Expanded content */}
      <div className="acc-expanded-content">
        <div className="acc-exp-inner">
          <span className="acc-exp-eyebrow">{p.badge}</span>
          <h3 className="acc-exp-name">{p.name}</h3>
          <p className="acc-exp-desc">{p.description}</p>
          {p.telemetry && (
            <div className="acc-exp-tel">
              {p.telemetry.slice(0, 3).map((t, ti) => (
                <div key={ti} className="acc-tel-item">
                  <i className={`fas ${t.icon}`} />
                  <span className="acc-tel-val">{t.val}</span>
                  <span className="acc-tel-lbl">{t.lbl}</span>
                </div>
              ))}
            </div>
          )}
          {p.available ? (
            p.external ? (
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="acc-exp-cta"
                style={{ background: p.accent }}
                onClick={e => e.stopPropagation()}
              >
                Explorar <i className="fas fa-arrow-right" />
              </a>
            ) : (
              <Link
                href={p.href}
                className="acc-exp-cta"
                style={{ background: p.accent }}
                onClick={e => e.stopPropagation()}
              >
                Explorar <i className="fas fa-arrow-right" />
              </Link>
            )
          ) : (
            <span className="acc-exp-soon">
              <i className="fas fa-clock" /> Próximamente
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ProductosSection() {
  const [activePanel,      setActivePanel]      = useState(3);
  const [accordionVisible, setAccordionVisible] = useState(false);
  const accordionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = accordionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setAccordionVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="productos" className="section prod-section">
      <div
        className="prod-ambient-glow"
        style={{
          background: PRODUCTS[activePanel]?.color ?? 'transparent',
          opacity: 0.16,
        }}
      />
      <div className="prod-layout">

        <div className="prod-side-label" aria-hidden="true">
          <span className="prod-side-eyebrow">Ecosistema CEN</span>
          <span className="prod-side-num">08</span>
        </div>

        <div className="prod-body">
          <div className="prod-heading">
            <div className="prod-heading-top">
              <span className="prod-eyebrow">
                <i className="fas fa-layer-group" />
                Ecosistema CEN
              </span>
              <span className="prod-heading-count">08 plataformas</span>
            </div>
            <h2 className="prod-heading-h2">
              Plataformas educativas<br />
              para <em>cada etapa</em> de tu vida
            </h2>
            <p className="prod-heading-sub">
              Del preescolar al bachillerato — cada producto construido sobre el currículo oficial mexicano,
              diseñado para docentes, estudiantes e instituciones de todo el país.
            </p>
          </div>

          <div
            className={`acc-viewport${accordionVisible ? ' acc--in' : ''}`}
            ref={accordionRef}
          >
            <div className="acc-wrapper">
              {PRODUCTS.map((p, i) => (
                <AccPanel
                  key={p.id}
                  p={p}
                  i={i}
                  isActive={activePanel === i}
                  onActivate={setActivePanel}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
