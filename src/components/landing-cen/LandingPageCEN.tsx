'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './LandingCEN.css';

const SUBSISTEMAS = [
  'DGB', 'DGETI', 'DGETAyCM', 'CONALEP', 'COBACH', 'CECYT', 'CCH', 'ENP',
  'Bachilleratos con RVOE', 'Bachilleratos universitarios estatales',
  'Primarias y secundarias', 'Educación básica',
];

const PRODUCTS = [
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
    image: '/4.png',
    href: '#',
    available: false,
    telemetry: [
      { val: '3–6', lbl: 'Años de Edad', icon: 'fa-child' },
      { val: '100%', lbl: 'Lúdico Activo', icon: 'fa-gamepad' },
      { val: 'Motricidad', lbl: 'Desarrollo', icon: 'fa-brain' }
    ]
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
    image: '/5.png',
    href: '#',
    available: false,
    telemetry: [
      { val: '6 Grados', lbl: 'Primaria SEP', icon: 'fa-graduation-cap' },
      { val: 'Fases 3-5', lbl: 'Nueva Escuela Mex.', icon: 'fa-layer-group' },
      { val: 'Proyectos', lbl: 'Pedagógicos', icon: 'fa-puzzle-piece' }
    ]
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
    image: '/6.png',
    href: '#',
    available: false,
    telemetry: [
      { val: '3 Grados', lbl: 'Secundaria SEP', icon: 'fa-school' },
      { val: 'Fase 6', lbl: 'NEM 2025', icon: 'fa-compass' },
      { val: 'Formativa', lbl: 'Evaluación', icon: 'fa-clipboard-check' }
    ]
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
    image: '/bachillerato.png',
    href: '/bachillerato',
    available: true,
    telemetry: [
      { val: '34 UAC', lbl: 'SEP Oficial', icon: 'fa-book-open' },
      { val: '100%', lbl: 'MCCEMS 2023', icon: 'fa-check-circle' },
      { val: 'Acuerdo', lbl: '09/08/23 SEP', icon: 'fa-certificate' }
    ]
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
    image: '/2.png',
    href: 'https://cenfinancierafinal.vercel.app',
    available: true,
    external: true,
    telemetry: [
      { val: '364 Retos', lbl: 'Actividades', icon: 'fa-coins' },
      { val: '9 Grados', lbl: 'Primaria-Sec', icon: 'fa-list-ol' },
      { val: 'Banxico', lbl: 'Educación Financiera', icon: 'fa-wallet' }
    ]
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
    image: '/3.png',
    href: 'https://www.cenlaboratorios.com.mx',
    available: true,
    external: true,
    telemetry: [
      { val: '40 Labs', lbl: 'Simuladores STEM', icon: 'fa-flask' },
      { val: 'Quí/Fís/Bio', lbl: 'Ciencias Exactas', icon: 'fa-atom' },
      { val: 'MCCEMS', lbl: 'Alineación SEP', icon: 'fa-microscope' }
    ]
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
    image: '/7.png',
    href: '#',
    available: false,
    telemetry: [
      { val: 'Arduino', lbl: 'Compatible', icon: 'fa-microchip' },
      { val: 'Coding', lbl: 'Código Visual', icon: 'fa-code' },
      { val: 'STEM', lbl: 'Proyectos Guiados', icon: 'fa-robot' }
    ]
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
    image: '/8.png',
    href: '#',
    available: false,
    telemetry: [
      { val: 'EN·FR·PT', lbl: 'Idiomas', icon: 'fa-language' },
      { val: 'A1-B2', lbl: 'Marco CEFR', icon: 'fa-globe' },
      { val: 'Gamificado', lbl: 'Método Activo', icon: 'fa-trophy' }
    ]
  },
];

const CYCLING_WORDS = ['sí funciona.', 'transforma.', 'inspira.', 'avanza.'];


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

const TESTIMONIOS = [
  {
    nombre: 'Verónica Salinas',
    avatar: 'VS',
    color: '#1E40AF',
    quote: 'CEN nos permitió alinear todas las materias sin depender de hojas de cálculo. El seguimiento por progresión es espectacular y exacto.',
  },
  {
    nombre: 'Alejandro Mendoza',
    avatar: 'AM',
    color: '#0F766E',
    quote: 'Ver en qué momento exacto se atasca cada alumno cambió mi forma de dar clase. Ya no tengo que esperar a los exámenes para ayudarlos.',
  },
  {
    nombre: 'Patricia Guerrero',
    avatar: 'PG',
    color: '#7C3AED',
    quote: 'El panel de seguimiento en vivo eliminó horas de captura manual. Ahora solo me enfoco en lo que importa: dar una mejor clase.',
  },
  {
    nombre: 'Roberto Cavazos',
    avatar: 'RC',
    color: '#B45309',
    quote: 'La velocidad de la plataforma es increíble, incluso con el internet inestable de la escuela. Mis alumnos entran desde el celular sin ningún problema.',
  },
  {
    nombre: 'Mariana Robles',
    avatar: 'MR',
    color: '#BE185D',
    quote: 'Tener simuladores interactivos de ciencia directamente integrados en el currículo ha hecho que las clases de biología sean las favoritas.',
  },
  {
    nombre: 'Carlos Echeverría',
    avatar: 'CE',
    color: '#0369A1',
    quote: 'La automatización de las evaluaciones formativas nos salvó la vida. Todo está alineado a la Nueva Escuela Mexicana sin esfuerzo.',
  },
  {
    nombre: 'Lucía Fernández',
    avatar: 'LF',
    color: '#6D28D9',
    quote: 'El nivel de diseño y usabilidad es de primer mundo. Por fin usamos software educativo que no parece hecho hace 20 años.',
  },
  {
    nombre: 'Héctor Salgado',
    avatar: 'HS',
    color: '#15803D',
    quote: 'El reporte en tiempo real para coordinación es magia pura. Sé exactamente qué grupo necesita ayuda antes de que termine el mes.',
  },
];

const STEPS = [
  { icon: 'fa-envelope-open-text', title: 'Solicita acceso', desc: 'Escríbenos con los datos de tu plantel. Te confirmamos en menos de 24 horas hábiles.', num: '01' },
  { icon: 'fa-school', title: 'Configura tu institución', desc: 'Cargamos tu estructura de grupos, semestre y subsistema en menos de 30 minutos.', num: '02' },
  { icon: 'fa-users', title: 'Invita a tus docentes', desc: 'Cada maestro recibe su cuenta individual con control granular de grupos y contenidos.', num: '03' },
  { icon: 'fa-rocket', title: 'Empieza a enseñar', desc: 'Desde el primer día, acceso completo al currículo oficial alineado a la SEP.', num: '04' },
];


export default function LandingPageCEN() {
  const [mounted, setMounted] = useState(false);
  const [activePanel, setActivePanel] = useState(3);
  const [accordionVisible, setAccordionVisible] = useState(false);
  const accordionRef = useRef<HTMLDivElement>(null);
  const [wordIdx, setWordIdx] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Scroll reveal — adds .reveal--visible when element enters viewport
  useEffect(() => {
    if (!mounted) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal--visible'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !accordionRef.current) return;
    const el = accordionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry && entry.isIntersecting) setAccordionVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted]);

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
              <img src="/Logo%20Cen.png" alt="CEN" className="brand-logo" />
              <div className="brand-text">
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
              <a href="#productos" className="nav-btn-primary">¡Empieza Ahora!</a>
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

              {/* ── Gradient orbs ── */}
              <div className="hero-orbs" aria-hidden="true">
                <div className="hero-orb hero-orb-1"></div>
                <div className="hero-orb hero-orb-2"></div>
                <div className="hero-orb hero-orb-3"></div>
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
                  Educación que<br />
                  <span className={`accent cycling-word${wordVisible ? ' visible' : ''}${wordIdx % 2 !== 0 ? ' cw-outline' : ''}`}>
                    {CYCLING_WORDS[wordIdx]}
                  </span>
                </h1>
                <p className="hero-sub">
                  CEN reúne el currículo oficial mexicano en una plataforma moderna para escuelas,
                  docentes y estudiantes. Bachillerato, educación financiera, laboratorios y más.
                </p>
                <div className="hero-cta-row">
                  <a href="#productos" className="btn-cta">
                    ¡Empieza Ahora! <i className="fas fa-arrow-right"></i>
                  </a>
                  <a href="/log-in" className="btn-cta-demo">
                    Iniciar Sesión <i className="fas fa-chevron-right"></i>
                  </a>
                </div>
                <div className="hero-cred-row">
                  {[
                    { icon: 'fa-landmark',       text: 'SEP Oficial'        },
                    { icon: 'fa-graduation-cap', text: 'MCCEMS 2023'        },
                    { icon: 'fa-file-contract',  text: 'Acuerdo 09/08/23'   },
                    { icon: 'fa-shield-alt',     text: 'LFPDPPP'            },
                  ].map((p, i) => (
                    <div key={p.text} className="hero-cred-pill" style={{ animationDelay: `${0.65 + i * 0.13}s` }}>
                      <i className={`fas ${p.icon}`}></i>
                      <span>{p.text}</span>
                    </div>
                  ))}
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
                          <div className="mock-logo-sm">
                            <img src="/Logo%20Cen.png" alt="CEN" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
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
                            <div className="mock-header-icons">
                              <div className="mock-icon-btn"><i className="fas fa-bell"></i><span className="mock-notif-dot"></span></div>
                              <div className="mock-icon-btn"><i className="fas fa-circle-user"></i></div>
                            </div>
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
            <div className="hero-bottom-wave" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 56" preserveAspectRatio="none">
                <path fill="#F8FAFC" d="M0,28 C360,56 1080,0 1440,28 L1440,56 L0,56 Z"/>
              </svg>
            </div>
          </div>

          {/* ── SUBSISTEMAS MARQUEE ── */}
          <div className="allies" id="instituciones">
            <div className="allies-bg-icons" aria-hidden="true">
              <i className="fas fa-graduation-cap" style={{ position:'absolute', fontSize:170, color:'#1E40AF', opacity:0.045, top:'-10px',  left:'2%',   transform:'rotate(-12deg)', filter:'blur(2px)', pointerEvents:'none' }}/>
              <i className="fas fa-school"         style={{ position:'absolute', fontSize:110, color:'#1E40AF', opacity:0.04,  bottom:'-8px', right:'3%',  transform:'rotate(8deg)',  filter:'blur(2px)', pointerEvents:'none' }}/>
              <i className="fas fa-book-open"      style={{ position:'absolute', fontSize:80,  color:'#1E40AF', opacity:0.05,  top:'10px',    right:'18%',                            filter:'blur(1px)', pointerEvents:'none' }}/>
              <i className="fas fa-atom"           style={{ position:'absolute', fontSize:60,  color:'#1E40AF', opacity:0.04,  bottom:'5px',  left:'22%',                             filter:'blur(1.5px)', pointerEvents:'none' }}/>
              <i className="fas fa-flask"          style={{ position:'absolute', fontSize:52,  color:'#1E40AF', opacity:0.04,  top:'8px',     left:'40%',  transform:'rotate(-8deg)', filter:'blur(1px)', pointerEvents:'none' }}/>
              <i className="fas fa-ruler-combined" style={{ position:'absolute', fontSize:48,  color:'#1E40AF', opacity:0.035, bottom:'6px',  right:'38%', transform:'rotate(6deg)',  filter:'blur(1px)', pointerEvents:'none' }}/>
            </div>
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

          {/* ── PRODUCTOS: ACCORDION EXPANDIBLE ── */}
          <section id="productos" className="section prod-section">
            <div className="prod-ambient-glow" style={{
              background: PRODUCTS[activePanel] ? PRODUCTS[activePanel]!.color : 'transparent',
              opacity: 0.16
            }} />
            <div className="prod-layout">

              <div className="prod-side-label" aria-hidden="true">
                <span className="prod-side-eyebrow">Ecosistema CEN</span>
                <span className="prod-side-num">08</span>
              </div>

              <div className="prod-body">
                <div className="prod-heading">
                  <div className="prod-heading-top">
                    <span className="prod-eyebrow">
                      <i className="fas fa-layer-group"></i>
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

                {/* ── Accordion ── */}
                <div
                  className={`acc-viewport${accordionVisible ? ' acc--in' : ''}`}
                  ref={accordionRef}
                >
                  <div className="acc-wrapper">
                    {PRODUCTS.map((p, i) => (
                      <div
                        key={p.id}
                        className={`acc-panel${activePanel === i ? ' acc--active' : ''}`}
                        style={{ '--acc-accent': p.accent } as React.CSSProperties}
                        onClick={() => setActivePanel(i)}
                      >
                        {/* Background image */}
                        <div className="acc-bg" style={{ backgroundImage: `url(${p.image})` }} />
                        {/* Solid overlay — collapso state */}
                        <div className="acc-ov-solid" style={{ background: p.color }} />
                        {/* Gradient overlay — expanded state */}
                        <div className="acc-ov-gradient" />
                        {/* Crystalline edge */}
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
                                    <i className={`fas ${t.icon}`}></i>
                                    <span className="acc-tel-val">{t.val}</span>
                                    <span className="acc-tel-lbl">{t.lbl}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {p.available ? (
                              p.external ? (
                                <a href={p.href} target="_blank" rel="noopener noreferrer"
                                   className="acc-exp-cta" style={{ background: p.accent }}
                                   onClick={e => e.stopPropagation()}>
                                  Explorar <i className="fas fa-arrow-right"></i>
                                </a>
                              ) : (
                                <Link href={p.href} className="acc-exp-cta"
                                      style={{ background: p.accent }}
                                      onClick={e => e.stopPropagation()}>
                                  Explorar <i className="fas fa-arrow-right"></i>
                                </Link>
                              )
                            ) : (
                              <span className="acc-exp-soon">
                                <i className="fas fa-clock"></i> Próximamente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </section>





          {/* ── PROCESO — ¿Cómo empezar? ── */}
          <section className="proceso-section">
            <div className="proceso-inner">
              <div className="proceso-header">
                <div className="proceso-eyebrow">
                  <i className="fas fa-map-signs"></i>
                  Proceso de inicio
                </div>
                <h2 className="proceso-title">Empieza en <em>menos de 24 horas</em></h2>
                <p className="proceso-subtitle">
                  Sin infraestructura propia. Sin instalación. Solo un correo y tu plantel opera desde el primer día.
                </p>
              </div>
              <div className="proceso-steps">
                <div className="proceso-connector" aria-hidden="true" />
                {STEPS.map((step, i) => (
                  <div key={i} className="proceso-step">
                    <div className="paso-num-bg" aria-hidden="true">{step.num}</div>
                    <div className="paso-step-num">Paso {step.num}</div>
                    <div className="paso-icon-wrap">
                      <i className={`fas ${step.icon}`}></i>
                    </div>
                    <div className="paso-title">{step.title}</div>
                    <p className="paso-desc">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── POR QUÉ CEN — Split feature ── */}
          <section className="feature-split" id="por-que-cen">
            <div className="feature-split-inner">
              <div className="feature-split-photo-col">
                <div className="feature-split-photo-frame">
                  <img src="/estudiante.png" alt="Estudiante CEN" className="feature-split-img" />
                  <div className="fsf-ring" />
                  <div className="fsf-blob" />
                </div>
              </div>
              <div className="feature-split-text-col">
                <div className="feature-split-eyebrow">
                  <i className="fas fa-circle-check"></i>
                  Por qué elegir CEN
                </div>
                <h2 className="feature-split-title">
                  La plataforma educativa que<br />
                  <em>México merece</em>
                </h2>
                <ul className="feature-split-list">
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <span>Más de <mark>34 UAC</mark> del currículo oficial, alineadas a la SEP y el MCCEMS 2023</span>
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <span>Compatible con los <mark>principales subsistemas</mark> de educación media superior en México</span>
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <span>Evaluación formativa en <mark>tiempo real</mark> que no interrumpe el ritmo de la clase</span>
                  </li>
                  <li>
                    <i className="fas fa-check-circle"></i>
                    <span>Operativo desde el <mark>primer día</mark>, sin instalación ni infraestructura propia</span>
                  </li>
                </ul>
                <Link href="/bachillerato" className="feature-split-cta">
                  Explorar CEN Bachillerato <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </section>

          {/* ── TESTIMONIOS — Dual marquee ── */}
          <section className="testimonios-section">
            {/* Iconos decorativos desenfocados de fondo */}
            <div className="test-bg-icons" aria-hidden="true">
              <i className="fas fa-graduation-cap" style={{ position:'absolute', fontSize:260, color:'#3B82F6', opacity:0.045, top:'-40px', left:'3%', transform:'rotate(-15deg)', filter:'blur(4px)' }}/>
              <i className="fas fa-book-open"       style={{ position:'absolute', fontSize:180, color:'#60A5FA', opacity:0.05,  top:'30%',  left:'8%',  filter:'blur(3px)' }}/>
              <i className="fas fa-atom"            style={{ position:'absolute', fontSize:140, color:'#3B82F6', opacity:0.04,  bottom:'10%', left:'5%', transform:'rotate(12deg)', filter:'blur(3px)' }}/>
              <i className="fas fa-flask"           style={{ position:'absolute', fontSize:200, color:'#60A5FA', opacity:0.035, top:'5%',    left:'35%', filter:'blur(5px)' }}/>
              <i className="fas fa-brain"           style={{ position:'absolute', fontSize:160, color:'#3B82F6', opacity:0.04,  bottom:'5%', left:'30%', filter:'blur(4px)' }}/>
              <i className="fas fa-microscope"      style={{ position:'absolute', fontSize:220, color:'#60A5FA', opacity:0.04,  top:'10%',   right:'5%', transform:'rotate(8deg)', filter:'blur(5px)' }}/>
              <i className="fas fa-star"            style={{ position:'absolute', fontSize:80,  color:'#7DD3FC', opacity:0.09,  top:'20%',   right:'22%' }}/>
              <i className="fas fa-robot"           style={{ position:'absolute', fontSize:170, color:'#3B82F6', opacity:0.045, bottom:'8%', right:'4%', transform:'rotate(-10deg)', filter:'blur(3px)' }}/>
              <i className="fas fa-globe"           style={{ position:'absolute', fontSize:130, color:'#60A5FA', opacity:0.04,  top:'55%',   right:'16%', filter:'blur(3px)' }}/>
              <i className="fas fa-infinity"        style={{ position:'absolute', fontSize:100, color:'#7DD3FC', opacity:0.06,  bottom:'20%', right:'32%', filter:'blur(2px)' }}/>
            </div>

            <div className="test-header">
              <div className="test-eyebrow">
                <i className="fas fa-star"></i>
                Testimonios reales
              </div>
              <h2 className="test-title">Lo que dicen los <em>docentes</em></h2>
              <p className="test-sub">Más de 127 docentes activos en todo México ya usan CEN en su plantel.</p>
            </div>

            {/* Fila 1 — desliza hacia la izquierda */}
            <div className="test-mq-wrap">
              <div className="test-mq-track test-mq-track--fwd">
                {[...TESTIMONIOS, ...TESTIMONIOS].map((t, i) => (
                  <div key={i} className="test-mq-card">
                    <span className="test-mq-bigquote">❝</span>
                    <p className="test-mq-text">{t.quote}</p>
                    <div className="test-mq-author">
                      <div className="test-mq-avatar" style={{ background: t.color }}>{t.avatar}</div>
                      <span className="test-mq-name">{t.nombre}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fila 2 — desliza hacia la derecha */}
            <div className="test-mq-wrap">
              <div className="test-mq-track test-mq-track--rev">
                {[...TESTIMONIOS.slice().reverse(), ...TESTIMONIOS.slice().reverse()].map((t, i) => (
                  <div key={i} className="test-mq-card">
                    <span className="test-mq-bigquote">❝</span>
                    <p className="test-mq-text">{t.quote}</p>
                    <div className="test-mq-author">
                      <div className="test-mq-avatar" style={{ background: t.color }}>{t.avatar}</div>
                      <span className="test-mq-name">{t.nombre}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA FINAL — Gran finale ── */}
          <section className="cta-final">
            <div className="cta-orbs" aria-hidden="true">
              <div className="cta-orb cta-orb-1"></div>
              <div className="cta-orb cta-orb-2"></div>
              <div className="cta-orb cta-orb-3"></div>
            </div>
            <div className="cta-final-inner">
              {/* Columna izquierda — texto */}
              <div className="cta-split-left">
                <div className="cta-eyebrow">
                  <span className="fv-pulse"></span>
                  <span>Acceso institucional disponible</span>
                </div>
                <h2 className="cta-headline">¿Listo para dar el<br /><em>primer paso</em>?</h2>
                <p className="cta-sub">Únete a la red de academias y comienza a construir el futuro educativo de tus alumnos hoy mismo.</p>
              </div>
              {/* Columna derecha — acciones */}
              <div className="cta-split-right">
                <div className="cta-action-cards">
                  <Link href="/bachillerato" className="cta-action-card cta-action-card--primary">
                    <div className="cac-icon">
                      <i className="fas fa-graduation-cap"></i>
                    </div>
                    <div className="cac-text">
                      <div className="cac-label">Plataforma principal</div>
                      <div className="cac-title">CEN Bachillerato</div>
                    </div>
                    <i className="fas fa-arrow-right cac-arrow"></i>
                  </Link>
                  <a href="mailto:gerencia@campanaeducativanacional.com.mx" className="cta-action-card">
                    <div className="cac-icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="cac-text">
                      <div className="cac-label">Para instituciones</div>
                      <div className="cac-title">Contactar al equipo</div>
                    </div>
                    <i className="fas fa-arrow-right cac-arrow"></i>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="footer">
            <div className="footer-brand">
              <div className="logo-mark" style={{ marginBottom: '20px' }}>
                <img src="/Logo%20Cen.png" alt="CEN" className="logo-mark-img" />
              </div>
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

          {/* ── MOBILE STICKY CTA ── */}
          <div className={`mobile-sticky-cta${navScrolled ? ' visible' : ''}`}>
            <Link href="/log-in" className="btn-cta">
              Ingresar a la plataforma <i className="fas fa-arrow-right"></i>
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
}
