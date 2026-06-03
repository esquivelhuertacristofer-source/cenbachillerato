'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { springs, stagger } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/lib/motion/hooks';
import '../landing-cen/LandingCEN.css';
import './LandingBachillerato.css';

const PARTICLES = [
  { s:3, l:'5%',  dl:'0s',    dr:'11s' },
  { s:2, l:'12%', dl:'2.1s',  dr:'14s' },
  { s:4, l:'21%', dl:'0.8s',  dr:'9s'  },
  { s:2, l:'33%', dl:'3.5s',  dr:'12s' },
  { s:3, l:'47%', dl:'1.4s',  dr:'10s' },
  { s:2, l:'58%', dl:'4.2s',  dr:'13s' },
  { s:3, l:'68%', dl:'0.5s',  dr:'11s' },
  { s:2, l:'79%', dl:'2.8s',  dr:'9s'  },
  { s:4, l:'88%', dl:'1.9s',  dr:'14s' },
  { s:2, l:'94%', dl:'3.1s',  dr:'10s' },
];

// ── Data ──────────────────────────────────────────────────────────────────────

const CURRICULUM_CARDS = [
  { code: 'CF',  tag: 'Tronco común',        title: 'Currículum Fundamental',          desc: '34 UAC en 6 semestres. Tronco común obligatorio para todo bachiller del sistema educativo mexicano.',  meta: '34 UAC · 6 semestres' },
  { code: 'CFE', tag: 'Semestres 5 y 6',     title: 'Currículum Fundamental Extendido', desc: 'UAC electivas en semestres 5 y 6. Profundización disciplinar según la oferta de cada institución.',    meta: 'Electivas institucionales' },
  { code: 'CA',  tag: 'Desarrollo integral', title: 'Currículum Ampliado',              desc: '4 Ámbitos de Formación Socioemocional para el desarrollo integral del estudiante. Actividades transversales.', meta: '4 Ámbitos · Transversal' },
  { code: 'CL',  tag: 'Técnico-profesional', title: 'Currículum Laboral',               desc: 'Componentes técnicos para bachilleratos tecnológicos y profesional-técnico. Formación para el trabajo.',    meta: 'DGETI · CONALEP · DGETAyCM' },
];

const RSC_CARDS = [
  { code: 'LC',    name: 'Lengua y Comunicación',                            semestres: 'Semestres 1–6',      progresiones: '32 Progresiones', ejes: ['Comprensión Lectora', 'Composición de Textos', 'Debate y Retórica'],    desc: 'Lectura crítica, composición escrita, debate y comunicación asertiva.',              image: '/rsc/lc.png'    },
  { code: 'PM',    name: 'Pensamiento Matemático',                           semestres: 'Semestres 1–6',      progresiones: '36 Progresiones', ejes: ['Álgebra y Funciones', 'Estadística Descriptiva', 'Modelación Lógica'],   desc: 'Modelación matemática, lógica formal y resolución de problemas cotidianos.',         image: '/rsc/pm.png'    },
  { code: 'IN',    name: 'Inglés',                                           semestres: 'Semestres 1–4',      progresiones: '24 Progresiones', ejes: ['Comprensión Auditiva', 'Comunicación Técnica', 'Fluidez Conversacional'], desc: 'Adquisición del idioma como segunda lengua con énfasis en comunicación real.',        image: '/rsc/in.png'    },
  { code: 'CD',    name: 'Cultura Digital',                                  semestres: 'Semestres 1, 2 y 6', progresiones: '18 Progresiones', ejes: ['Programación y Algoritmia', 'Ciudadanía Digital', 'Colaboración Cloud'],  desc: 'Uso ético y estratégico de tecnologías de la información.',                         image: '/rsc/cd.png'    },
  { code: 'CH',    name: 'Conciencia Histórica',                             semestres: 'Semestres 4–6',      progresiones: '16 Progresiones', ejes: ['Memoria Histórica', 'Procesos Nacionales', 'Análisis Geopolítico'],       desc: 'Análisis crítico de procesos históricos locales y globales.',                        image: '/rsc/ch.png'    },
  { code: 'CS',    name: 'Ciencias Sociales',                                semestres: 'Semestres 1, 2 y 4', progresiones: '20 Progresiones', ejes: ['Estructuras Sociales', 'Derechos Humanos', 'Participación Ciudadana'],    desc: 'Estructuras socioeconómicas, derechos humanos y organización comunitaria.',          image: '/rsc/cs.png'    },
  { code: 'HUM',   name: 'Humanidades',                                      semestres: 'Semestres 1–3',      progresiones: '24 Progresiones', ejes: ['Ética y Valores', 'Filosofía Práctica', 'Apreciación Estética'],          desc: 'Reflexión filosófica, ética y pensamiento crítico.',                                 image: '/rsc/hum.png'   },
  { code: 'CNEYT', name: 'Ciencias Naturales, Experimentales y Tecnología',  semestres: 'Semestres 1–6',      progresiones: '30 Progresiones', ejes: ['Física Aplicada', 'Química Orgánica', 'Biología y Ecosistemas'],           desc: 'Comprensión científica del mundo físico con enfoque experimental.',                  image: '/rsc/cneyt.png' },
];

const FEATURES = [
  { icon: 'fa-layer-group',  col: '#0D9488', title: 'Hub estudiantil por semestre',  desc: 'Cada alumno accede a sus UAC organizadas por semestre, con progreso visual por progresión y biblioteca integrada.' },
  { icon: 'fa-chart-line',   col: '#0891B2', title: 'Dashboard docente en vivo',     desc: 'Métricas por grupo, alumno y UAC. Identifica quién necesita apoyo antes del examen parcial.' },
  { icon: 'fa-school',       col: '#7C3AED', title: 'Multi-plantel y multi-escuela', desc: 'Arquitectura multi-tenant con Row Level Security. Escala desde 1 hasta 100 instituciones sin fricción.' },
  { icon: 'fa-file-alt',     col: '#EA580C', title: 'Alineación MCCEMS 100%',        desc: 'Acuerdo 09/08/23 y Modelo Educativo 2025. Todas las UAC, RSC y Ámbitos implementados al detalle.' },
  { icon: 'fa-lock',         col: '#059669', title: 'Seguridad institucional PKCE',  desc: 'Autenticación con PKCE, cookies httpOnly y cumplimiento total de la LFPDPPP.' },
  { icon: 'fa-bolt',         col: '#D97706', title: 'Implementación en horas',       desc: 'Alta masiva de alumnos y docentes por CSV. Sin capacitaciones largas. Sin integraciones complejas.' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function LandingPageBachillerato() {
  const [mounted, setMounted]           = useState(false);
  const [navScrolled, setNavScrolled]   = useState(false);
  const [mobileMenuOpen, setMobileOpen] = useState(false);

  const reducedMotion = useReducedMotion();

  // Carousel — fade entre slides, sin drag
  const [currentSlide, setCurrentSlide] = useState(0);
  const maxIndex  = RSC_CARDS.length - 1;
  const nextSlide = () => setCurrentSlide(p => Math.min(p + 1, maxIndex));
  const prevSlide = () => setCurrentSlide(p => Math.max(p - 1, 0));

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const fn = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  if (!mounted) return <div style={{ background: '#040A08', minHeight: '100vh' }} />;

  return (
    <div className="landing-cen landing-bach">
      <div className="cen-content">
        <main className="main-scroll">

          {/* ── NAV ─────────────────────────────────────────────────── */}
          <nav className={`nav${navScrolled ? ' nav--scrolled' : ''}`}>
            <Link href="/" className="brand">
              <img src="/Logo%20Cen.png" alt="CEN" className="brand-logo" />
              <div className="brand-text">
                <span className="b1">CEN</span>
                <span className="b2">BACHILLERATO</span>
              </div>
            </Link>
            <div className="nav-links">
              <a href="#inicio"          className="active">Inicio</a>
              <a href="#curriculo">Currículo</a>
              <a href="#recursos">Recursos</a>
              <a href="#caracteristicas">Características</a>
            </div>
            <div className="nav-right">
              <Link href="/log-in" className="nav-btn-primary">Ingresar</Link>
            </div>
            <button className="nav-mobile-toggle" onClick={() => setMobileOpen(!mobileMenuOpen)} aria-label="Toggle menu" aria-expanded={mobileMenuOpen}>
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`} />
            </button>
            <div className={`nav-mobile-overlay${mobileMenuOpen ? ' open' : ''}`}>
              <div className="nav-mobile-links">
                <a href="#inicio"          onClick={() => setMobileOpen(false)}>Inicio</a>
                <a href="#curriculo"       onClick={() => setMobileOpen(false)}>Currículo</a>
                <a href="#recursos"        onClick={() => setMobileOpen(false)}>Recursos</a>
                <a href="#caracteristicas" onClick={() => setMobileOpen(false)}>Características</a>
                <Link href="/log-in" className="btn-cta mobile-nav-btn" onClick={() => setMobileOpen(false)}>Ingresar</Link>
              </div>
            </div>
          </nav>

          {/* ── HERO v3 — editorial fullbleed ──────────────────────── */}
          <section className="hv3" id="inicio">

            {/* Glow de profundidad detrás del contenido */}
            <div className="hv3-content-glow" aria-hidden="true" />

            {/* Partículas flotantes */}
            {!reducedMotion && (
              <div className="hv3-particles" aria-hidden="true">
                {PARTICLES.map((p, i) => (
                  <span
                    key={i}
                    style={{
                      width: p.s, height: p.s,
                      left: p.l,
                      animationDelay: p.dl,
                      animationDuration: p.dr,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Columna izquierda — texto con animaciones de entrada */}
            <div className="hv3-left">
              <motion.div
                initial={reducedMotion ? {} : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.smooth, delay: 0.05 }}
              >
                <div className="hv3-badge">
                  <span className="hv3-badge-dot" />
                  MCCEMS 2025 · Acuerdo 09/08/23
                </div>
              </motion.div>

              <motion.h1
                className="hv3-title"
                initial={reducedMotion ? {} : { opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.smooth, delay: 0.12 }}
              >
                Domina tu<br />bachillerato,
              </motion.h1>
              <motion.span
                className="hv3-title-accent"
                initial={reducedMotion ? {} : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.smooth, delay: 0.12 + stagger.fast }}
              >
                progresión<br />a progresión.
              </motion.span>

              <motion.p
                className="hv3-sub"
                initial={reducedMotion ? {} : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.smooth, delay: 0.28 }}
              >
                34 UAC y 334 progresiones de aprendizaje al alcance de cada alumno.
                Dashboard en tiempo real para cada docente.
              </motion.p>

              <motion.div
                className="hv3-actions"
                initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.smooth, delay: 0.38 }}
              >
                <Link href="/log-in" className="hv3-cta">
                  Acceso institucional <i className="fas fa-arrow-right" />
                </Link>
                <a href="#curriculo" className="hv3-ghost">
                  Ver currículo <i className="fas fa-chevron-down" />
                </a>
              </motion.div>

              <motion.div
                className="hv3-data"
                initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.smooth, delay: 0.5 }}
              >
                {[
                  { n: '334', l: 'Progresiones' },
                  { n: '34',  l: 'UAC base' },
                  { n: '8',   l: 'RSC' },
                  { n: '6',   l: 'Semestres' },
                ].map((s, i) => (
                  <div key={s.l} style={{ display: 'contents' }}>
                    {i > 0 && <div className="hv3-sep" />}
                    <div className="hv3-datum">
                      <span className="hv3-n">{s.n}</span>
                      <span className="hv3-l">{s.l}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Columna derecha — foto a sangre con fade en la base */}
            <div className="hv3-right">
              <img
                src="/AHORRO.png"
                alt="Alumna CEN Bachillerato"
                className="hv3-photo"
              />
              <div className="hv3-bottom-fade" aria-hidden="true" />
            </div>

          </section>

          {/* ── RSC v3 — editorial fullbleed, justo bajo el hero ─────── */}
          <section className="rsc-v3" id="recursos">
            <div className="rscv3-ambient" aria-hidden="true" />

            <div className="rscv3-head">
              <div>
                <div className="rscv3-eye"><span className="pip" /> Programa de estudios · SEP</div>
                <h2 className="rscv3-title">Tu formación, <em>materia a materia</em></h2>
              </div>
              <div className="rscv3-counter">
                <span className="rscv3-curr">{String(currentSlide + 1).padStart(2, '0')}</span>
                <span className="rscv3-total">&thinsp;/ 08</span>
              </div>
            </div>

            {/* Stage — fullbleed card con fade */}
            <div className="rscv3-stage">
              {RSC_CARDS.map((rsc, idx) => (
                <div
                  key={rsc.code}
                  className={`rscv3-card${idx === currentSlide ? ' rscv3-card--active' : ''}`}
                >
                  <Image
                    src={rsc.image}
                    alt={rsc.name}
                    fill
                    sizes="100vw"
                    className="rscv3-img"
                    quality={80}
                    priority={idx === 0}
                  />
                  <div className="rscv3-overlay" />
                  <span className="rscv3-code-wm" aria-hidden="true">{rsc.code}</span>

                  <div className="rscv3-content">
                    <div className="rscv3-meta">
                      <span className="rscv3-badge">{rsc.semestres}</span>
                      <span className="rscv3-prog-pill">{rsc.progresiones} oficiales</span>
                    </div>
                    <h3 className="rscv3-name">{rsc.name}</h3>
                    <p className="rscv3-desc">{rsc.desc}</p>
                    <div className="rscv3-ejes">
                      {rsc.ejes.map((e, ei) => (
                        <span key={ei} className="rscv3-eje">{e}</span>
                      ))}
                    </div>
                  </div>

                  {/* Nav arrows dentro del card */}
                  <div className="rscv3-nav">
                    <button className="rscv3-btn" onClick={prevSlide} disabled={currentSlide === 0} aria-label="Anterior">
                      <i className="fas fa-arrow-left" />
                    </button>
                    <button className="rscv3-btn" onClick={nextSlide} disabled={currentSlide === maxIndex} aria-label="Siguiente">
                      <i className="fas fa-arrow-right" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Thumbnail strip */}
            <div className="rscv3-thumbs">
              {RSC_CARDS.map((rsc, idx) => (
                <button
                  key={rsc.code}
                  className={`rscv3-thumb${idx === currentSlide ? ' rscv3-thumb--active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                >
                  <span className="rscv3-thumb-code">{rsc.code}</span>
                  <span className="rscv3-thumb-name">{rsc.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── FEATURES — layout editorial split ────────────────────── */}
          <section className="bfeat" id="caracteristicas">
            <div className="bfeat-inner">

              {/* Columna izquierda — heading con peso tipográfico */}
              <div className="bfeat-left">
                <span className="bfeat-eye">Plataforma completa</span>
                <h2 className="bfeat-title">
                  Listo desde el <em>primer día</em>
                </h2>
                <p className="bfeat-sub">
                  Sin configuraciones. Sin capacitaciones largas.
                </p>
                <Link href="/log-in" className="bfeat-cta">
                  Ingresar a la plataforma <i className="fas fa-arrow-right" />
                </Link>
              </div>

              {/* Columna derecha — lista de features */}
              <div className="bfeat-right">
                {FEATURES.map(f => (
                  <div key={f.title} className="bfeat-item">
                    <div
                      className="bfeat-icon"
                      style={{
                        background: `${f.col}18`,
                        borderColor: `${f.col}35`,
                        color: f.col,
                      }}
                    >
                      <i className={`fas ${f.icon}`} />
                    </div>
                    <div className="bfeat-content">
                      <h3 className="bfeat-item-title">{f.title}</h3>
                      <p className="bfeat-desc">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* Wave de transición RSC → Features */}
          <svg className="rscv3-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden="true">
            <path fill="#F0FAF8" d="M0,32 C480,64 960,0 1440,32 L1440,64 L0,64 Z"/>
          </svg>

          {/* ── CURRICULO ────────────────────────────────────────────── */}
          <section id="curriculo" className="curriculo-v2">
            <div className="cv2-head">
              <span className="cv2-eye">Estructura Curricular MCCEMS</span>
              <h2 className="cv2-title">Currículo oficial, <em>cuatro componentes</em></h2>
              <p className="cv2-sub">MCCEMS · Acuerdo 09/08/23 · Cuatro componentes que forman al bachiller integral.</p>
            </div>
            <div className="cv2-grid">
              {CURRICULUM_CARDS.map(card => (
                <div key={card.code} className="cv2-card">
                  <div className="cv2-code">{card.code}</div>
                  <span className="cv2-tag">{card.tag}</span>
                  <h3 className="cv2-ct">{card.title}</h3>
                  <p className="cv2-cd">{card.desc}</p>
                  <div className="cv2-meta">{card.meta}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── STUDENTS BANNER ──────────────────────────────────────── */}
          <section className="students-banner">
            <img src="/bachillerato.png" alt="Estudiantes CEN" className="sb-photo" />
            <div className="sb-overlay" />
            <div className="sb-content">
              <h2 className="sb-title">
                Para todos los subsistemas<br />
                de <span className="sb-grad">bachillerato en México</span>
              </h2>
              <div className="sb-chips">
                {['DGB','DGETI','CONALEP','COBACH','DGETAyCM','ENP','CCH','Particular RVOE'].map(s => (
                  <span key={s} className="sb-chip">{s}</span>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA con watermark tipográfico ────────────────────────── */}
          <section className="cta-v2">
            <div className="cta-v2-glow" />
            <span className="bctw" aria-hidden="true">EMS</span>
            <div className="cta-v2-inner">
              <h2 className="cta-v2-title">Implementá<br /><em>CEN Bachillerato</em></h2>
              <p className="cta-v2-sub">Solicite una demostración o ingrese con sus credenciales institucionales.</p>
              <div className="cta-v2-actions">
                <Link href="/log-in" className="btn-cta">Ingresar a la plataforma <i className="fas fa-arrow-right" /></Link>
                <a href="mailto:gerencia@campanaeducativanacional.com.mx" className="btn-cta-outline">Contactar a CEN <i className="fas fa-envelope" /></a>
              </div>
            </div>
          </section>

          {/* ── FOOTER ───────────────────────────────────────────────── */}
          <footer className="footer">
            <div className="footer-brand">
              <img src="/Logo%20Cen.png" alt="CEN" className="brand-logo" style={{ marginBottom: 20 }} />
              <h4>CEN Bachillerato<br />Campaña Educativa Nacional</h4>
              <div className="fc-block"><div className="fc-label">Correo</div><div className="fc-value">gerencia@campanaeducativanacional.com.mx</div></div>
              <div className="fc-block"><div className="fc-label">Teléfonos</div><div className="fc-value">722 537 9594 · 729 178 9196</div></div>
            </div>
            <div className="footer-links">
              <a href="#inicio">Inicio</a>
              <a href="#curriculo">Currículo MCCEMS</a>
              <a href="#recursos">Recursos Sociocognitivos</a>
              <a href="#caracteristicas">Características</a>
              <Link href="/">CEN Principal</Link>
            </div>
            <div className="footer-contact">
              <div className="fc-block">
                <div className="fc-label">Dirección</div>
                <div className="fc-value">Mariano Matamoros #208<br />Casa Blanca, Metepec, Estado de México.</div>
              </div>
              <div className="fc-block">
                <div className="fc-label">Legal</div>
                <div className="fc-value">
                  <Link href="/privacidad" style={{ color: 'inherit' }}>Aviso de Privacidad</Link><br />
                  <Link href="/terminos"   style={{ color: 'inherit' }}>Términos de Uso</Link>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© 2026 CEN — Campaña Educativa Nacional. Todos los derechos reservados.</span>
              <div className="fb-legal">
                <Link href="/privacidad">Privacidad</Link>
                <Link href="/terminos">Términos</Link>
              </div>
            </div>
            <p className="footer-copyright-text">
              El contenido pedagógico, la marca, el código fuente y los materiales didácticos son propiedad exclusiva de CEN — Campaña Educativa Nacional.
            </p>
          </footer>

        </main>
      </div>
    </div>
  );
}
