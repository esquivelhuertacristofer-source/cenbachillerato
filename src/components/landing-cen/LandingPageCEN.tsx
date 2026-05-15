'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import './LandingCEN.css';

const SUBSISTEMAS = [
  'DGB', 'DGETI', 'DGETAyCM', 'CONALEP', 'COBACH', 'CECYT', 'CCH', 'ENP',
  'Bachilleratos con RVOE', 'Bachilleratos universitarios estatales',
  'Primarias y secundarias', 'Educación básica',
];

const PRODUCTS = [
  {
    id: 'bachillerato',
    name: 'CEN Bachillerato',
    badge: 'EMS · MCCEMS · SEP',
    description: 'Plataforma alineada al Marco Curricular Común de la EMS. 34 UAC del Currículum Fundamental, 8 RSC y 4 Ámbitos de Formación.',
    meta: '34 UAC · 6 Semestres',
    icon: 'fa-graduation-cap',
    color: 'linear-gradient(135deg, #0A1628 0%, #1E3A8A 100%)',
    href: '/bachillerato',
    available: true,
  },
  {
    id: 'financiera',
    name: 'Educación Financiera',
    badge: 'Primaria · Secundaria',
    description: '364 actividades pedagógicas para nueve grados escolares, de primero de primaria a tercero de secundaria.',
    meta: '364 Actividades · 9 Grados',
    icon: 'fa-coins',
    color: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
    href: 'https://cenfinancierafinal.vercel.app',
    available: true,
    external: true,
  },
  {
    id: 'labs',
    name: 'Laboratorios Virtuales',
    badge: 'Bachillerato · STEM',
    description: '40 simuladores interactivos de química, física, biología y matemáticas alineados al MCCEMS.',
    meta: '40 Simuladores · MCCEMS',
    icon: 'fa-flask',
    color: 'linear-gradient(135deg, #1E1B4B 0%, #4C1D95 100%)',
    href: 'https://www.cenlaboratorios.com.mx',
    available: true,
    external: true,
  },
  {
    id: 'preescolar',
    name: 'CEN Preescolar',
    badge: 'Educación Básica',
    description: 'Juego, exploración y aprendizaje para la primera infancia. Pensamiento lógico y comunicación desde los 3 años.',
    meta: '3 a 6 años',
    icon: 'fa-child',
    color: 'linear-gradient(135deg, #431407 0%, #9A3412 100%)',
    href: '#',
    available: false,
  },
  {
    id: 'primaria',
    name: 'CEN Primaria',
    badge: 'Educación Básica',
    description: 'Contenidos para 1° a 6° grado alineados a la Nueva Escuela Mexicana 2025.',
    meta: '1° a 6° Grado · NEM 2025',
    icon: 'fa-book-open',
    color: 'linear-gradient(135deg, #451A03 0%, #B45309 100%)',
    href: '#',
    available: false,
  },
  {
    id: 'secundaria',
    name: 'CEN Secundaria',
    badge: 'Educación Básica',
    description: '7° a 9° grado con la Nueva Escuela Mexicana. Proyectos interdisciplinares y evaluación formativa.',
    meta: '7° a 9° Grado · NEM 2025',
    icon: 'fa-school',
    color: 'linear-gradient(135deg, #042F2E 0%, #0F766E 100%)',
    href: '#',
    available: false,
  },
  {
    id: 'robotica',
    name: 'CEN Robótica',
    badge: 'STEM · Todas las edades',
    description: 'Pensamiento computacional, programación visual y robótica educativa para primaria, secundaria y bachillerato.',
    meta: 'Todas las edades',
    icon: 'fa-robot',
    color: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
    href: '#',
    available: false,
  },
  {
    id: 'idiomas',
    name: 'CEN Idiomas',
    badge: 'Básica y Media Superior',
    description: 'Inglés, francés y portugués con metodología comunicativa activa para estudiantes de primaria hasta bachillerato.',
    meta: 'Inglés · Francés · Portugués',
    icon: 'fa-language',
    color: 'linear-gradient(135deg, #4C0519 0%, #9F1239 100%)',
    href: '#',
    available: false,
  },
];

const CYCLING_WORDS = ['plataforma', 'solución', 'herramienta', 'ecosistema'];

const PARTICLES = [
  { s:3, l:'6%',  dl:'0s',   dr:'9s'  },
  { s:2, l:'11%', dl:'1.8s', dr:'12s' },
  { s:4, l:'19%', dl:'3.2s', dr:'8s'  },
  { s:2, l:'26%', dl:'0.6s', dr:'14s' },
  { s:3, l:'34%', dl:'2.4s', dr:'10s' },
  { s:2, l:'43%', dl:'4.1s', dr:'11s' },
  { s:4, l:'52%', dl:'1.1s', dr:'9s'  },
  { s:2, l:'61%', dl:'3.7s', dr:'13s' },
  { s:3, l:'70%', dl:'0.4s', dr:'10s' },
  { s:2, l:'78%', dl:'2.9s', dr:'12s' },
  { s:3, l:'86%', dl:'1.6s', dr:'8s'  },
  { s:2, l:'93%', dl:'4.5s', dr:'11s' },
];

const LIVE_AVATARS = ['#1E40AF','#0F766E','#7C3AED','#B45309','#0369A1'];

const VALUES = [
  {
    title: 'Alineación oficial',
    desc: 'Contenidos diseñados según los marcos curriculares vigentes de la SEP: MCCEMS, NEM y Modelo Educativo 2025.',
    icon: 'fas fa-landmark',
  },
  {
    title: 'Multi-tenant',
    desc: 'Arquitectura preparada para una o múltiples escuelas con aislamiento de datos por Row Level Security.',
    icon: 'fas fa-school',
    alt: true,
  },
  {
    title: 'Seguridad institucional',
    desc: 'Cumplimiento con LFPDPPP y políticas de protección de datos. Sin acceso cruzado entre instituciones.',
    icon: 'fas fa-shield-alt',
  },
  {
    title: 'Tecnología moderna',
    desc: 'Plataforma web responsive accesible desde cualquier dispositivo. Sin instalación requerida.',
    icon: 'fas fa-laptop',
    alt: true,
  },
  {
    title: 'Soporte educativo',
    desc: 'Diseñado en colaboración con docentes en activo y especialistas pedagógicos del sistema educativo mexicano.',
    icon: 'fas fa-chalkboard-teacher',
  },
];

const SUBSISTEMAS_LIST = [
  'DGB — Dirección General del Bachillerato',
  'DGETI — Educación Tecnológica Industrial',
  'DGETAyCM — Educación Tecnológica Agropecuaria',
  'CONALEP — Educación Profesional Técnica',
  'COBACH — Colegio de Bachilleres',
  'Particulares con RVOE',
  'Bachilleratos universitarios estatales',
];

export default function LandingPageCEN() {
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeProduct, setActiveProduct] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % CYCLING_WORDS.length);
        setWordVisible(true);
      }, 280);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const target = 127;
    const step = 4;
    const timer = setInterval(() => {
      setLiveCount(c => {
        if (c >= target) { clearInterval(timer); return target; }
        return Math.min(c + step, target);
      });
    }, 22);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <div className="landing-cen-root" style={{ background: '#F8FAFC', minHeight: '100vh' }} />;
  }

  return (
    <div className="landing-cen">
      <div className="cen-content">
        <main className="main-scroll">

          {/* ── NAV ── */}
          <nav className={`nav${navScrolled ? ' nav--scrolled' : ''}`}>
            <Link href="/" className="brand">
              <div className="logo-mark"><span>C</span></div>
              <div className="brand-text">
                <span className="b1">CEN</span>
                <span className="b2">Campaña Educativa Nacional</span>
              </div>
            </Link>
            <div className="nav-links">
              <a href="#inicio" className="active">Inicio</a>
              <a href="#productos">Productos</a>
              <a href="#instituciones">Instituciones</a>
              <a href="#por-que-cen">Por qué CEN</a>
            </div>
            <div className="nav-right">
              <Link href="/log-in" className="nav-btn-primary">Iniciar Sesión</Link>
            </div>
          </nav>

          {/* ── HERO ── */}
          <div id="inicio" className="hero-wrap">
            <header className="hero">
              <div className="hero-bg">
                <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none" preserveAspectRatio="none">
                  <path d="M0 200C200 100 400 300 600 200C800 100 1000 200 1000 200V1000H0V200Z" fill="white" fillOpacity="0.03" />
                </svg>
              </div>

              {/* ── Partículas flotantes ── */}
              <div className="hero-particles" aria-hidden="true">
                {PARTICLES.map((p, i) => (
                  <span key={i} style={{ width: p.s, height: p.s, left: p.l, animationDelay: p.dl, animationDuration: p.dr }} />
                ))}
              </div>

              {/* ── Educational icons background — inline styles guaranteed ── */}
              <div className="hero-icons-bg" aria-hidden="true">
                {/* — columna izquierda — */}
                <i className="fas fa-graduation-cap"    style={{ position:'absolute', fontSize:88,  color:'#fff', opacity:0.07,  top:'7%',    left:'4%'                           }}/>
                <i className="fas fa-book-open"         style={{ position:'absolute', fontSize:50,  color:'#fff', opacity:0.10,  top:'61%',   left:'14%'                          }}/>
                <i className="fas fa-calculator"        style={{ position:'absolute', fontSize:38,  color:'#fff', opacity:0.12,  bottom:'14%',left:'5%'                           }}/>
                <i className="fas fa-brain"             style={{ position:'absolute', fontSize:102, color:'#fff', opacity:0.025, top:'37%',   left:'1%',   filter:'blur(5px)'     }}/>
                <i className="fas fa-microscope"        style={{ position:'absolute', fontSize:98,  color:'#fff', opacity:0.03,  top:'51%',   left:'9%',   filter:'blur(4px)'     }}/>
                <i className="fas fa-ruler-combined"    style={{ position:'absolute', fontSize:60,  color:'#fff', opacity:0.05,  bottom:'8%', left:'20%',  filter:'blur(2px)'     }}/>
                <i className="fas fa-lightbulb"         style={{ position:'absolute', fontSize:44,  color:'#7DD3FC', opacity:0.09, top:'22%', left:'24%',  filter:'blur(0.5px)'  }}/>
                <i className="fas fa-infinity"          style={{ position:'absolute', fontSize:56,  color:'#fff', opacity:0.06,  bottom:'32%',left:'2%',   filter:'blur(1.5px)'   }}/>
                <i className="fas fa-compass"           style={{ position:'absolute', fontSize:34,  color:'#7DD3FC', opacity:0.11, bottom:'52%',left:'30%'                       }}/>
                {/* — zona central — */}
                <i className="fas fa-atom"              style={{ position:'absolute', fontSize:68,  color:'#fff', opacity:0.055, top:'29%',   left:'36%',  filter:'blur(1.5px)'   }}/>
                <i className="fas fa-flask"             style={{ position:'absolute', fontSize:115, color:'#fff', opacity:0.04,  top:'2%',    left:'44%',  filter:'blur(3px)'     }}/>
                <i className="fas fa-globe"             style={{ position:'absolute', fontSize:76,  color:'#fff', opacity:0.04,  bottom:'26%',left:'30%',  filter:'blur(2px)'     }}/>
                <i className="fas fa-pencil-alt"        style={{ position:'absolute', fontSize:34,  color:'#fff', opacity:0.13,  top:'16%',   left:'50%',  filter:'blur(0.5px)'   }}/>
                <i className="fas fa-chalkboard-teacher"style={{ position:'absolute', fontSize:54,  color:'#fff', opacity:0.08,  top:'74%',   left:'42%',  filter:'blur(1px)'     }}/>
                <i className="fas fa-dna"               style={{ position:'absolute', fontSize:42,  color:'#fff', opacity:0.09,  top:'44%',   left:'54%',  filter:'blur(1px)'     }}/>
                <i className="fas fa-chart-bar"         style={{ position:'absolute', fontSize:48,  color:'#7DD3FC', opacity:0.07, top:'6%',  left:'38%',  filter:'blur(1px)'    }}/>
                <i className="fas fa-star"              style={{ position:'absolute', fontSize:22,  color:'#7DD3FC', opacity:0.18, top:'12%', left:'57%'                          }}/>
                {/* — columna derecha — */}
                <i className="fas fa-award"             style={{ position:'absolute', fontSize:70,  color:'#fff', opacity:0.05,  top:'5%',    right:'10%', filter:'blur(2px)'     }}/>
                <i className="fas fa-robot"             style={{ position:'absolute', fontSize:86,  color:'#fff', opacity:0.035, top:'38%',   right:'5%',  filter:'blur(4px)'     }}/>
                <i className="fas fa-pen-nib"           style={{ position:'absolute', fontSize:36,  color:'#7DD3FC', opacity:0.09, top:'20%', right:'16%', filter:'blur(0.5px)'  }}/>
                <i className="fas fa-cube"              style={{ position:'absolute', fontSize:52,  color:'#fff', opacity:0.06,  bottom:'40%',right:'8%',  filter:'blur(1.5px)'   }}/>
                <i className="fas fa-star"              style={{ position:'absolute', fontSize:16,  color:'#7DD3FC', opacity:0.22, top:'55%', right:'22%'                         }}/>
                <i className="fas fa-circle"            style={{ position:'absolute', fontSize:12,  color:'#7DD3FC', opacity:0.20, top:'35%', right:'12%'                         }}/>
                <i className="fas fa-code"              style={{ position:'absolute', fontSize:40,  color:'#fff', opacity:0.07,  bottom:'18%',right:'14%', filter:'blur(1px)'     }}/>
                <i className="fas fa-magnifying-glass"  style={{ position:'absolute', fontSize:58,  color:'#fff', opacity:0.04,  bottom:'6%', right:'28%', filter:'blur(2.5px)'  }}/>
              </div>


              <div className="hero-left">
                <div className="hero-badge">Campaña Educativa Nacional</div>
                <h1 className="hero-title">
                  Una sola<br />
                  <span className={`accent cycling-word${wordVisible ? ' visible' : ''}`}>
                    {CYCLING_WORDS[wordIdx]}
                  </span><br />
                  <span className="underlined">para todos.</span>
                </h1>
                <p className="hero-sub">
                  Acceda al ecosistema integral de educación CEN: bachillerato, educación financiera, laboratorios
                  virtuales y más. Diseñado para escuelas, docentes y estudiantes.
                </p>
                <div className="hero-cta-row">
                  <Link href="/log-in" className="btn-cta">
                    Ingresar a la plataforma <i className="fas fa-arrow-right"></i>
                  </Link>
                  <a href="#productos" className="btn-cta-demo">
                    Conocer productos <i className="fas fa-chevron-down"></i>
                  </a>
                </div>
                <div className="hero-cred-row">
                  <span><i className="fas fa-landmark"></i>SEP</span>
                  <span className="hcr-dot"></span>
                  <span><i className="fas fa-graduation-cap"></i>MCCEMS</span>
                  <span className="hcr-dot"></span>
                  <span><i className="fas fa-book"></i>NEM 2025</span>
                  <span className="hcr-dot"></span>
                  <span><i className="fas fa-shield-alt"></i>LFPDPPP</span>
                </div>
              </div>

              <div className="hero-right">
                <div className="hero-visual">

                  {/* glow radial detrás de la estudiante */}
                  <div className="hero-student-glow" aria-hidden="true"></div>

                  {/* student photo card */}
                  <div className="hero-student-card">
                    <img src="/1.png" alt="Estudiante CEN" className="hero-student-img" />
                  </div>

                  {/* bottom fade + right-edge frame */}
                  <div className="hero-bottom-fade" aria-hidden="true"></div>
                  <div className="hero-photo-blend" aria-hidden="true"></div>

                  {/* badges — inline styles para posicionamiento fiable */}
                  <div className="hero-float-badge" style={{ top: '28px', right: '28px' }}>
                    <i className="fas fa-graduation-cap"></i>
                    <span>MCCEMS · 34 UAC</span>
                  </div>

                  <div className="hero-float-badge" style={{ top: '44%', right: '28px' }}>
                    <i className="fas fa-school"></i>
                    <span>7+ subsistemas</span>
                  </div>

                  {/* smaller browser mockup bottom-right */}
                  <div className="hero-mockup-sm">
                    <div className="mock-browser">
                      <div className="mock-bar">
                        <div className="mock-dots"><span></span><span></span><span></span></div>
                        <div className="mock-url">cen.edu.mx/bachillerato</div>
                      </div>
                      <div className="mock-body">
                        <div className="mock-sidebar">
                          <div className="mock-logo-sm"></div>
                          <div className="mock-nav-item active"></div>
                          <div className="mock-nav-item"></div>
                          <div className="mock-nav-item"></div>
                          <div className="mock-nav-item"></div>
                        </div>
                        <div className="mock-main">
                          <div className="mock-header-row">
                            <div>
                              <div className="mock-label-sm">CEN Bachillerato</div>
                              <div className="mock-title-sm">Panel Docente</div>
                            </div>
                            <div className="mock-avatar"></div>
                          </div>
                          <div className="mock-stats-row">
                            <div className="mock-stat-card">
                              <div className="mock-stat-val">34</div>
                              <div className="mock-stat-lbl">UAC</div>
                            </div>
                            <div className="mock-stat-card accent">
                              <div className="mock-stat-val">87%</div>
                              <div className="mock-stat-lbl">Avance</div>
                            </div>
                            <div className="mock-stat-card">
                              <div className="mock-stat-val">6°</div>
                              <div className="mock-stat-lbl">Sem.</div>
                            </div>
                          </div>
                          <div className="mock-list">
                            <div className="mock-course">
                              <div className="mock-course-dot"></div>
                              <div className="mock-course-info">
                                <div className="mock-course-name">Pensamiento Matemático</div>
                                <div className="mock-progress-bar"><div style={{ width: '84%' }}></div></div>
                              </div>
                              <div className="mock-course-pct">84%</div>
                            </div>
                            <div className="mock-course">
                              <div className="mock-course-dot"></div>
                              <div className="mock-course-info">
                                <div className="mock-course-name">Lenguaje y Comunicación</div>
                                <div className="mock-progress-bar"><div style={{ width: '71%' }}></div></div>
                              </div>
                              <div className="mock-course-pct">71%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* ── Live card — social proof + avatars + contador ── */}
              <div className="hero-live-card">
                <span className="hero-live-dot"></span>
                <div className="hero-live-avatars">
                  {LIVE_AVATARS.map((c, i) => (
                    <div key={i} className="hero-live-avatar" style={{ background: c, zIndex: 5 - i }} />
                  ))}
                </div>
                <div className="hero-live-info">
                  <span className="hero-live-num">{liveCount}+</span>
                  <span className="hero-live-label">docentes activos</span>
                </div>
              </div>

              {/* scroll hint */}
              <div className="hero-scroll-hint" aria-hidden="true">
                <span className="scroll-line"></span>
                <i className="fas fa-chevron-down"></i>
              </div>

            </header>
          </div>

          {/* ── SUBSISTEMAS MARQUEE ── */}
          <div className="allies" id="instituciones">
            <div className="allies-eyebrow">Subsistemas educativos compatibles</div>
            <h2>Compatible con los principales <em>sistemas educativos</em> de México</h2>
            <div className="allies-divider"></div>
            <div className="marquee">
              <div className="marquee-track">
                {[...SUBSISTEMAS, ...SUBSISTEMAS].map((s, i) => (
                  <React.Fragment key={i}>
                    <span className="ally-name">{s}</span>
                    <span className="ally-dot"></span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* ── STATS BAND ── */}
          <section className="stats-band">
            <div className="stats-band-inner">
              <div className="sb-item">
                <div className="sb-num">34</div>
                <div className="sb-label">UAC del MCCEMS</div>
              </div>
              <div className="sb-divider"></div>
              <div className="sb-item">
                <div className="sb-num">364</div>
                <div className="sb-label">Actividades Financieras</div>
              </div>
              <div className="sb-divider"></div>
              <div className="sb-item">
                <div className="sb-num">40</div>
                <div className="sb-label">Simuladores Virtuales</div>
              </div>
              <div className="sb-divider"></div>
              <div className="sb-item">
                <div className="sb-num">7+</div>
                <div className="sb-label">Subsistemas Compatibles</div>
              </div>
            </div>
          </section>

          {/* ── PRODUCTS TABS ── */}
          <section id="productos" className="section prod-section">
            <div className="section-head center">
              <span className="sh-eyebrow">Ecosistema CEN</span>
              <h2>Un producto para <em>cada etapa</em> educativa</h2>
              <p className="sh-sub">
                Desde preescolar hasta bachillerato. Tecnología educativa diseñada para cada nivel del sistema mexicano.
              </p>
            </div>
            <div className="prod-tabs">
              <div className="prod-tab-list">
                {PRODUCTS.map((p, i) => (
                  <button
                    key={p.id}
                    className={`prod-tab-btn${activeProduct === i ? ' active' : ''}`}
                    onClick={() => setActiveProduct(i)}
                  >
                    <div className="ptb-icon" style={{ background: p.color }}>
                      <i className={`fas ${p.icon}`}></i>
                    </div>
                    <div className="ptb-text">
                      <div className="ptb-name">{p.name}</div>
                      {!p.available && <span className="ptb-soon">Próximamente</span>}
                    </div>
                  </button>
                ))}
              </div>

              <div className="prod-tab-panel">
                {(() => {
                  const p = PRODUCTS[activeProduct];
                  if (!p) return null;
                  return (
                    <>
                      <div className="ptp-header" style={{ background: p.color }}>
                        <i className={`fas ${p.icon} ptp-big-icon`}></i>
                        {!p.available && <span className="ptp-soon-badge">Próximamente</span>}
                      </div>
                      <div className="ptp-body">
                        <span className="ptp-badge">{p.badge}</span>
                        <h3 className="ptp-title">{p.name}</h3>
                        <p className="ptp-desc">{p.description}</p>
                        <div className="ptp-meta">
                          <i className="fas fa-circle-dot"></i> {p.meta}
                        </div>
                        {p.available && (
                          <div className="ptp-cta-row">
                            {p.external
                              ? <a href={p.href} target="_blank" rel="noopener noreferrer" className="btn-cta ptp-cta-btn">Explorar producto <i className="fas fa-arrow-right"></i></a>
                              : <Link href={p.href} className="btn-cta ptp-cta-btn">Explorar producto <i className="fas fa-arrow-right"></i></Link>
                            }
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* ── FEATURES SPLIT (Por qué CEN) ── */}
          <section id="por-que-cen" className="features-split">
            <div className="features-visual">
              <div className="fv-header">
                <span className="fv-pulse"></span>
                <span className="fv-header-text">Compatibilidad verificada</span>
              </div>
              <div className="fv-checklist">
                {SUBSISTEMAS_LIST.map((s) => (
                  <div key={s} className="fv-check-row">
                    <i className="fas fa-check"></i>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <div className="fv-footer">
                <i className="fas fa-landmark"></i>
                <span>SEP · MCCEMS · NEM 2025</span>
              </div>
            </div>
            <div className="features-list">
              <span className="fl-eyebrow">Por qué CEN</span>
              <h2 className="fl-title">Construida <em>desde adentro</em> del sistema</h2>
              <p className="features-sub">Diseñado con docentes en activo, directivos y especialistas pedagógicos del sistema educativo mexicano.</p>
              <div className="feat-items">
                {VALUES.map((v, i) => (
                  <div key={v.title} className="feat-item">
                    <span className="feat-num">0{i + 1}</span>
                    <div>
                      <div className="feat-title">{v.title}</div>
                      <div className="feat-desc">{v.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── MILESTONE BAND ── */}
          <section className="milestone-band">
            <div className="milestone-inner">
              <div className="milestone-left">
                <div className="milestone-eyebrow">Cobertura nacional</div>
                <div className="milestone-num">+7</div>
                <div className="milestone-label">subsistemas educativos compatibles</div>
              </div>
              <div className="milestone-right">
                <div className="milestone-stat">
                  <div className="ms-val">DGB</div>
                  <div className="ms-name">Dirección General del Bachillerato</div>
                </div>
                <div className="milestone-stat">
                  <div className="ms-val">DGETI</div>
                  <div className="ms-name">Educación Tecnológica Industrial</div>
                </div>
                <div className="milestone-stat">
                  <div className="ms-val">CONALEP</div>
                  <div className="ms-name">Educación Profesional Técnica</div>
                </div>
                <div className="milestone-stat">
                  <div className="ms-val">COBACH</div>
                  <div className="ms-name">Colegio de Bachilleres</div>
                </div>
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="faq-section">
            <div className="section-head center">
              <span className="sh-eyebrow">Preguntas frecuentes</span>
              <h2>Sus <em>dudas</em>, resueltas</h2>
            </div>
            <div className="faq-list">
              {[
                {
                  q: '¿Qué es CEN y cómo funciona?',
                  a: 'CEN es un ecosistema de plataformas educativas digitales diseñadas para el sistema educativo mexicano. Cada producto está alineado con los marcos curriculares oficiales de la SEP y funciona directamente desde el navegador, sin instalación.',
                },
                {
                  q: '¿Qué subsistemas de bachillerato son compatibles?',
                  a: 'CEN Bachillerato es compatible con DGB, DGETI, DGETAyCM, CONALEP, COBACH, bachilleratos con RVOE y bachilleratos universitarios estatales. Todos los subsistemas que operan bajo el MCCEMS.',
                },
                {
                  q: '¿Cómo se alinea CEN al MCCEMS y la NEM?',
                  a: 'Los contenidos de CEN Bachillerato fueron diseñados siguiendo el Acuerdo 09/08/23 de la SEP. Cubren las 34 UAC del Currículum Fundamental, los 8 RSC y los 4 Ámbitos de Formación Socioemocional del MCCEMS.',
                },
                {
                  q: '¿Cómo se accede institucionalmente?',
                  a: 'El acceso es institucional. La escuela o subsistema contrata el servicio y nosotros configuramos el entorno con su plantilla docente y matrícula estudiantil. Cada institución tiene su propio espacio aislado.',
                },
                {
                  q: '¿Los datos de mi institución están protegidos?',
                  a: 'Sí. Utilizamos arquitectura multi-tenant con Row Level Security. Los datos de cada institución están completamente aislados y nunca son accesibles por otras instituciones. Cumplimos con la LFPDPPP.',
                },
                {
                  q: '¿Cuándo estarán disponibles los productos en desarrollo?',
                  a: 'Preescolar, Primaria, Secundaria, Robótica e Idiomas están en desarrollo activo. Si desea información sobre fechas de lanzamiento o acceso anticipado, contáctenos directamente.',
                },
              ].map((item, i) => (
                <div key={i} className={`faq-item${openFaq === i ? ' faq-open' : ''}`}>
                  <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{item.q}</span>
                    <i className={`fas fa-${openFaq === i ? 'minus' : 'plus'}`}></i>
                  </button>
                  {openFaq === i && (
                    <div className="faq-a">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA FINAL ── */}
          <section className="cta-final">
            <div className="cta-final-inner">
              <div>
                <h3>Comience hoy con <em>CEN</em></h3>
                <p>Acceso institucional para escuelas y subsistemas de todo México.</p>
              </div>
              <div className="cta-final-actions">
                <Link href="/bachillerato" className="btn-cta">
                  Explorar CEN Bachillerato <i className="fas fa-arrow-right"></i>
                </Link>
                <a href="mailto:gerencia@campanaeducativanacional.com.mx" className="btn-cta-demo">
                  Contactar <i className="fas fa-envelope"></i>
                </a>
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="footer">
            <div className="footer-brand">
              <div className="logo-mark" style={{ marginBottom: '20px' }}><span>C</span></div>
              <h4>Campaña Educativa<br />Nacional</h4>
              <div className="fc-block">
                <div className="fc-label">Correo electrónico</div>
                <div className="fc-value">gerencia@campanaeducativanacional.com.mx</div>
              </div>
              <div className="fc-block">
                <div className="fc-label">Teléfonos</div>
                <div className="fc-value">722 537 9594 · 729 178 9196</div>
              </div>
            </div>

            <div className="footer-links">
              <a href="#inicio">Inicio</a>
              <a href="#productos">Productos</a>
              <a href="#instituciones">Instituciones</a>
              <a href="#por-que-cen">Por qué CEN</a>
              <Link href="/bachillerato">CEN Bachillerato</Link>
            </div>

            <div className="footer-contact">
              <div className="fc-block">
                <div className="fc-label">Dirección</div>
                <div className="fc-value">
                  Mariano Matamoros #208<br />
                  Casa Blanca, Metepec,<br />
                  Estado de México.
                </div>
              </div>
              <div className="fc-block">
                <div className="fc-label">Legal</div>
                <div className="fc-value">
                  <Link href="/privacidad" style={{ color: 'inherit' }}>Aviso de Privacidad</Link><br />
                  <Link href="/terminos" style={{ color: 'inherit' }}>Términos de Uso</Link>
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
              El contenido pedagógico, la marca, el código fuente, los diseños, ilustraciones, simulaciones interactivas
              y materiales didácticos son propiedad exclusiva de CEN — Campaña Educativa Nacional. Su reproducción,
              distribución o uso sin autorización expresa por escrito constituye una infracción a los derechos de autor
              protegidos bajo la Ley Federal del Derecho de Autor de México.
            </p>
          </footer>

        </main>
      </div>
    </div>
  );
}
