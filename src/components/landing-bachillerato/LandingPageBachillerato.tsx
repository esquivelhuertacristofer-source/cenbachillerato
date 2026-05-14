'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../landing-cen/LandingCEN.css';

const CURRICULUM_CARDS = [
  {
    code: 'CF',
    tag: 'Tronco común',
    title: 'Currículum Fundamental',
    desc: '34 UAC distribuidas en 6 semestres. Tronco común obligatorio para todo bachiller del sistema educativo mexicano.',
    meta: '34 UAC · 6 semestres',
    variant: 'navy',
  },
  {
    code: 'CFE',
    tag: 'Semestres 5 y 6',
    title: 'Currículum Fundamental Extendido',
    desc: 'UAC electivas en semestres 5 y 6 según la oferta de cada institución. Profundización disciplinar específica.',
    meta: 'Electivas institucionales',
    variant: 'sky-soft',
  },
  {
    code: 'CA',
    tag: 'Desarrollo integral',
    title: 'Currículum Ampliado',
    desc: '4 Ámbitos de Formación Socioemocional para el desarrollo integral del estudiante. Actividades transversales.',
    meta: '4 Ámbitos · Transversal',
    variant: 'blue-soft',
  },
  {
    code: 'CL',
    tag: 'Técnico-profesional',
    title: 'Currículum Laboral',
    desc: 'Componentes técnicos específicos para bachilleratos tecnológicos y profesional-técnico. Formación para el trabajo.',
    meta: 'DGETI · CONALEP · DGETAyCM',
    variant: 'sky-soft',
  },
];

const RSC_CARDS = [
  { code: 'LC', name: 'Lengua y Comunicación', semestres: 'Semestres 1–6' },
  { code: 'PM', name: 'Pensamiento Matemático', semestres: 'Semestres 1–6' },
  { code: 'IN', name: 'Inglés', semestres: 'Semestres 1–4' },
  { code: 'CD', name: 'Cultura Digital', semestres: 'Semestres 1, 2 y 6' },
  { code: 'CH', name: 'Conciencia Histórica', semestres: 'Semestres 4–6' },
  { code: 'CS', name: 'Ciencias Sociales', semestres: 'Semestres 1, 2 y 4' },
  { code: 'HUM', name: 'Humanidades', semestres: 'Semestres 1–3' },
  { code: 'CNEYT', name: 'Ciencias Naturales, Experimentales y Tecnología', semestres: 'Semestres 1–6' },
];

const AMBITOS = [
  {
    icon: 'fas fa-running',
    title: 'Actividades físicas y deportivas',
    desc: 'Desarrollo de la salud física, hábitos deportivos y bienestar integral del estudiante.',
  },
  {
    icon: 'fas fa-palette',
    title: 'Actividades artísticas y culturales',
    desc: 'Expresión artística, apreciación cultural e identidad nacional a través del arte.',
  },
  {
    icon: 'fas fa-heart',
    title: 'Educación integral en sexualidad y género',
    desc: 'Formación en perspectiva de género, derechos, diversidad e igualdad sustantiva.',
  },
  {
    icon: 'fas fa-leaf',
    title: 'Educación para la salud y práctica ciudadana',
    desc: 'Ciudadanía activa, cultura de la salud y participación en la vida democrática.',
  },
];

const CARACTERISTICAS = [
  { icon: 'fas fa-th-large', title: 'Hub estudiantil personalizado', desc: 'Vista por semestre, progreso por UAC y acceso a todas las progresiones del currículum.' },
  { icon: 'fas fa-chart-line', title: 'Panel de seguimiento docente', desc: 'Métricas por grupo, alumno y UAC en tiempo real. Reportes exportables.' },
  { icon: 'fas fa-school', title: 'Gestión multi-tenant', desc: 'Arquitectura preparada para una o múltiples escuelas con aislamiento total de datos.' },
  { icon: 'fas fa-file-alt', title: 'Compatible con MCCEMS 2023', desc: 'Alineado al Acuerdo 09/08/23 y Modelo Educativo 2025 (Acuerdo 21/08/25).' },
  { icon: 'fas fa-tachometer-alt', title: 'Reportes en tiempo real', desc: 'Métricas de avance por alumno, grupo y UAC disponibles en el dashboard docente.' },
  { icon: 'fas fa-lock', title: 'Autenticación PKCE segura', desc: 'Acceso institucional con PKCE, cookies httpOnly y cumplimiento LFPDPPP.' },
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

export default function LandingPageBachillerato() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="landing-cen-root" style={{ background: '#F8FAFC', minHeight: '100vh' }} />;
  }

  return (
    <div className="landing-cen">
      <div className="cen-content">
        <main className="main-scroll">

          {/* ── NAV ── */}
          <nav className="nav">
            <Link href="/" className="brand">
              <div className="logo-mark"><span>C</span></div>
              <div className="brand-text">
                <span className="b1">CEN</span>
                <span className="b2">Bachillerato</span>
              </div>
            </Link>
            <div className="nav-links">
              <a href="#inicio" className="active">Inicio</a>
              <a href="#curriculo">Currículo</a>
              <a href="#recursos">Recursos</a>
              <a href="#caracteristicas">Características</a>
            </div>
            <div className="nav-right">
              <Link href="/log-in" className="nav-btn-primary">Ingresar</Link>
            </div>
          </nav>

          {/* ── HERO ZS ── */}
          <div id="inicio" className="hero-zs">
            <div className="hero-zs-body">
              <div className="hero-zs-left">
                <p className="hero-zs-eyebrow">Tu Plataforma de Bachillerato · Producto CEN</p>
                <h1 className="hero-zs-title">
                  Aprende, Avanza<br />y Certifica con<br /><span className="accent">CEN Bachillerato</span>
                </h1>
                <p className="hero-zs-sub">
                  Plataforma educativa institucional alineada al MCCEMS. 34 UAC, 8 Recursos Sociocognitivos
                  y 4 Ámbitos de Formación Socioemocional para bachillerato general, tecnológico y técnico-bachiller.
                </p>
                <Link href="/log-in" className="hero-zs-cta">
                  Ingresar a la plataforma <i className="fas fa-arrow-right"></i>
                </Link>
                <div className="hero-zs-review">
                  <div className="hero-zs-avatars">
                    <div className="hero-zs-avatar"><i className="fas fa-user-graduate"></i></div>
                    <div className="hero-zs-avatar"><i className="fas fa-chalkboard-teacher"></i></div>
                    <div className="hero-zs-avatar"><i className="fas fa-school"></i></div>
                  </div>
                  <div className="hero-zs-review-divider"></div>
                  <div className="hero-zs-review-text">
                    <div className="rv-title">Subsistemas compatibles</div>
                    <div className="rv-sub">DGB · DGETI · CONALEP · COBACH y más</div>
                  </div>
                </div>
              </div>

              <div className="hero-zs-right">
                <div className="hero-zs-photo">
                  <i className="fas fa-user-graduate"></i>
                  <span>Fotografía del estudiante</span>
                </div>
                <div className="hero-zs-card hzs-c1">
                  <div className="hzs-card-icon"><i className="fas fa-book-open"></i></div>
                  <div className="hzs-card-value">34 UAC</div>
                  <div className="hzs-card-label">Currículum Fundamental</div>
                </div>
                <div className="hero-zs-card hzs-c2">
                  <div className="hzs-card-icon"><i className="fas fa-layer-group"></i></div>
                  <div className="hzs-card-value">8 RSC</div>
                  <div className="hzs-card-label">Recursos Sociocognitivos</div>
                </div>
                <div className="hero-zs-card hzs-c3">
                  <div className="hzs-card-icon"><i className="fas fa-chart-line"></i></div>
                  <div className="hzs-card-value">342</div>
                  <div className="hzs-card-label">Progresiones de aprendizaje</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── FEATURES BAND ── */}
          <section className="features-band">
            <div className="feat-card">
              <div className="feat-icon"><i className="fas fa-th-large"></i></div>
              <h3>Hub estudiantil</h3>
              <p>Vista semestral, progreso por UAC y acceso a todas las progresiones del currículum.</p>
            </div>
            <div className="feat-card featured">
              <div className="feat-icon"><i className="fas fa-landmark"></i></div>
              <h3>Alineado al MCCEMS</h3>
              <p>Acuerdo 09/08/23 y Modelo Educativo 2025. Marco oficial de la SEP para bachillerato.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon"><i className="fas fa-chart-bar"></i></div>
              <h3>Dashboard docente</h3>
              <p>Métricas por grupo, alumno y UAC en tiempo real. Reportes exportables al instante.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon"><i className="fas fa-school"></i></div>
              <h3>Gestión institucional</h3>
              <p>Multi-tenant con aislamiento total por Row Level Security. Una o múltiples escuelas.</p>
            </div>
          </section>

          {/* ── ESTRUCTURA CURRICULAR MCCEMS ── */}
          <section id="curriculo" className="section">
            <div className="section-head center">
              <span className="sh-eyebrow">Estructura Curricular MCCEMS</span>
              <h2>Un currículo organizado para <em>cada etapa</em> del bachillerato</h2>
              <p className="sh-sub">
                Marco Curricular Común de la Educación Media Superior (Acuerdo 09/08/23).
                Cuatro componentes curriculares que forman al bachiller integral.
              </p>
            </div>

            <div className="tiers">
              {CURRICULUM_CARDS.map((card) => (
                <div key={card.code} className="tier" style={{ cursor: 'default' }}>
                  <div className="tier-tags">
                    <span className="tag">{card.tag}</span>
                  </div>
                  <div style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.04em', color: 'rgba(125,211,252,0.7)', lineHeight: 1 }}>
                    {card.code}
                  </div>
                  <h3>{card.title}</h3>
                  <p className="tier-blurb">{card.desc}</p>
                  <div className="read-more-btn">
                    <div className="read-more-pill">{card.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── RSC ── */}
          <section id="recursos" className="editorial-section">
            <div className="editorial-head">
              <div>
                <div className="editorial-eyebrow">
                  <span className="pip"></span> Recursos Sociocognitivos
                </div>
                <h2>8 Recursos Sociocognitivos <em>transversales</em></h2>
              </div>
              <div className="editorial-stats">
                <div className="editorial-stat">
                  <div className="v">8</div>
                  <div className="l">RSC</div>
                </div>
                <div className="editorial-stat">
                  <div className="v">6</div>
                  <div className="l">Semestres</div>
                </div>
              </div>
            </div>

            <div className="content-grid-4">
              {RSC_CARDS.map((rsc, idx) => (
                <div key={rsc.code} className={`pcard${idx % 3 === 2 ? ' navy' : ''}`}>
                  <div className="pc-top">
                    <span className="pc-tag">{rsc.code}</span>
                  </div>
                  <div className="pc-code">{rsc.code}</div>
                  <div className="pc-title">{rsc.name}</div>
                  <div className="pc-meta">{rsc.semestres}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── ÁMBITOS ── */}
          <section className="alt-section">
            <div className="section-head center" style={{ marginBottom: '36px' }}>
              <span className="sh-eyebrow">Formación Socioemocional</span>
              <h2>4 Ámbitos de Formación <em>Socioemocional</em></h2>
              <p className="sh-sub">
                Componentes del Currículum Ampliado para el desarrollo integral del estudiante de bachillerato.
              </p>
            </div>
            <div className="content-grid-2" style={{ maxWidth: '900px', margin: '0 auto' }}>
              {AMBITOS.map((ambito) => (
                <div key={ambito.title} className="pcard">
                  <div className="vc-icon" style={{ marginBottom: '8px' }}>
                    <i className={ambito.icon}></i>
                  </div>
                  <div className="pc-title">{ambito.title}</div>
                  <div className="pc-desc">{ambito.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CARACTERÍSTICAS ── */}
          <section id="caracteristicas" className="section">
            <div className="section-head center">
              <span className="sh-eyebrow">Características de la plataforma</span>
              <h2>Todo lo que necesita su <em>institución</em></h2>
              <p className="sh-sub">
                Herramientas pensadas para estudiantes, docentes y administradores escolares desde el primer día.
              </p>
            </div>
            <div className="content-grid">
              {CARACTERISTICAS.map((c, idx) => (
                <div key={c.title} className={`pcard${idx % 4 === 3 ? ' navy' : ''}`}>
                  <div className="vc-icon"><i className={c.icon}></i></div>
                  <div className="pc-title">{c.title}</div>
                  <div className="pc-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── SUBSISTEMAS DETAIL ── */}
          <section className="subsistemas-section">
            <div className="section-head center" style={{ marginBottom: '32px' }}>
              <span className="sh-eyebrow">Para subsistemas</span>
              <h2>CEN Bachillerato es compatible con <em>todos los subsistemas</em></h2>
            </div>
            <div className="subsistemas-grid">
              {SUBSISTEMAS_LIST.map((s) => (
                <div key={s} className="subsistema-pill">{s}</div>
              ))}
            </div>
          </section>

          {/* ── STATS BAND ── */}
          <section className="live-band">
            <div>
              <div className="lb-eyebrow"><span className="pulse"></span>MCCEMS · Acuerdo 09/08/23</div>
              <h2>La plataforma bachillerato<br /><em>más completa</em> de México.</h2>
              <p>
                Alineada al Marco Curricular Común de la Educación Media Superior y el Modelo Educativo 2025.
                Lista para implementar en cualquier bachillerato del país.
              </p>
              <div className="live-stats">
                <div className="live-stat">
                  <h4>34</h4>
                  <div className="lbl">UAC MCCEMS</div>
                  <div className="sub"><i className="fas fa-book-open"></i> Currículum Fundamental</div>
                </div>
                <div className="live-stat">
                  <h4>8</h4>
                  <div className="lbl">Recursos Sociocognitivos</div>
                  <div className="sub"><i className="fas fa-layer-group"></i> Transversales 1–6</div>
                </div>
                <div className="live-stat">
                  <h4>4</h4>
                  <div className="lbl">Ámbitos Socioemocionales</div>
                  <div className="sub"><i className="fas fa-users"></i> Formación integral</div>
                </div>
              </div>
            </div>

            <div className="live-band-visual">
              <div className="visual-grid">
                {['1°', '2°', '3°', '4°', '5°', '6°'].map((sem) => (
                  <div key={sem} className="visual-badge">{sem} Sem.</div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA BAND ── */}
          <section className="cta-band">
            <div>
              <h3>Listo para implementar<br /><em>Bachillerato CEN</em></h3>
              <p>
                Solicite una demostración o ingrese a la plataforma con sus credenciales institucionales.
              </p>
              <div className="cta-actions">
                <Link href="/log-in" className="btn-cta">
                  Ingresar a la plataforma <i className="fas fa-arrow-right"></i>
                </Link>
                <a href="mailto:gerencia@campanaeducativanacional.com.mx" className="btn-cta-outline">
                  Contactar a CEN <i className="fas fa-envelope"></i>
                </a>
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="footer">
            <div className="footer-brand">
              <div className="logo-mark" style={{ marginBottom: '20px' }}><span>C</span></div>
              <h4>CEN Bachillerato<br />Campaña Educativa Nacional</h4>
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
              <a href="#curriculo">Currículo MCCEMS</a>
              <a href="#recursos">Recursos Sociocognitivos</a>
              <a href="#caracteristicas">Características</a>
              <Link href="/">CEN Principal</Link>
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
