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
    badge: 'MCCEMS · SEP',
    description:
      'Plataforma educativa alineada al Marco Curricular Común de la Educación Media Superior. 34 UAC del Currículum Fundamental, 8 Recursos Sociocognitivos y 4 Ámbitos de Formación Socioemocional.',
    meta: '34 UAC · 6 Semestres · 342 progresiones',
    href: '/bachillerato',
    available: true,
  },
  {
    id: 'financiera',
    name: 'CEN Educación Financiera',
    badge: 'Primaria · Secundaria',
    description:
      'Plataforma para educación financiera de nivel básico. 364 actividades pedagógicas organizadas en nueve grados escolares, de primero de primaria a tercero de secundaria.',
    meta: '364 Actividades · 9 Grados · 6 a 15 años',
    href: 'https://cenfinancierafinal.vercel.app',
    available: true,
    external: true,
  },
  {
    id: 'labs',
    name: 'CEN Labs',
    badge: 'Bachillerato · MCCEMS',
    description:
      'Laboratorios virtuales interactivos para educación media superior. 40 simuladores científicos de química, física, biología y matemáticas alineados al MCCEMS.',
    meta: '40 Simuladores · 15 a 18 años',
    href: 'https://www.cenlaboratorios.com.mx',
    available: true,
    external: true,
  },
  {
    id: 'proximo',
    name: 'Más productos CEN',
    badge: 'En desarrollo',
    description:
      'Estamos expandiendo el catálogo educativo con nuevos productos para educación básica, idiomas, robótica y más.',
    meta: 'Próximos lanzamientos',
    href: '#',
    available: false,
  },
];

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

          {/* ── HERO OMK ── */}
          <div id="inicio" className="hero-omk">
            <nav className="nav">
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
                <Link href="/bachillerato" className="nav-btn-primary">CEN Bachillerato</Link>
              </div>
            </nav>

            <div className="hero-omk-body">
              <div className="hero-omk-left">
                <div className="hero-omk-badge">
                  <div className="hero-omk-badge-icons">
                    <div className="hero-omk-badge-icon"><i className="fas fa-graduation-cap"></i></div>
                    <div className="hero-omk-badge-icon"><i className="fas fa-school"></i></div>
                    <div className="hero-omk-badge-icon"><i className="fas fa-book-open"></i></div>
                  </div>
                  <span className="hero-omk-badge-text">Compatible con +7 subsistemas educativos</span>
                </div>

                <h1 className="hero-omk-title">
                  La Plataforma<br />
                  Educativa para<br />
                  Todo México
                </h1>

                <p className="hero-omk-sub">
                  Bachillerato, educación financiera y laboratorios virtuales. Un ecosistema digital
                  para estudiantes, docentes y directivos de todos los subsistemas de México.
                </p>

                <div className="hero-omk-ctas">
                  <a href="#productos" className="hero-omk-btn">
                    Conocer productos <i className="fas fa-chevron-down"></i>
                  </a>
                  <Link href="/bachillerato" className="hero-omk-link">
                    CEN Bachillerato <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>

                <div className="hero-omk-partners">
                  <div className="hero-omk-partners-label">Subsistemas educativos</div>
                  <div className="hero-omk-partners-row">
                    <span className="hero-omk-partner-tag">DGB</span>
                    <span className="hero-omk-partner-tag">DGETI</span>
                    <span className="hero-omk-partner-tag">CONALEP</span>
                    <span className="hero-omk-partner-tag">COBACH</span>
                  </div>
                </div>
              </div>

              <div className="hero-omk-right">
                <div className="hero-omk-panel"></div>
                <div className="hero-omk-photo">
                  <i className="fas fa-user-graduate"></i>
                  <span>Fotografía del estudiante</span>
                </div>

                <div className="hero-omk-card omk-c1">
                  <div className="omk-card-avatars">
                    <div className="omk-card-avatar"><i className="fas fa-user-graduate"></i></div>
                    <div className="omk-card-avatar"><i className="fas fa-chalkboard-teacher"></i></div>
                    <div className="omk-card-avatar"><i className="fas fa-user"></i></div>
                    <div className="omk-card-avatar"><i className="fas fa-user-circle"></i></div>
                  </div>
                  <div className="omk-card-label">CEN Bachillerato</div>
                  <div className="omk-card-val">34 UAC</div>
                  <div className="omk-card-sub">MCCEMS · 6 Semestres</div>
                </div>

                <div className="hero-omk-card omk-c2">
                  <div className="omk-card-label">CEN Labs</div>
                  <div className="omk-card-val">40 Sim.</div>
                  <div className="omk-card-sub">Ciencias y matemáticas</div>
                </div>

                <div className="hero-omk-pill omk-p3">
                  <div className="omk-pill-icon"><i className="fas fa-landmark"></i></div>
                  <span className="omk-pill-text">Alineado al MCCEMS</span>
                </div>

                <div className="hero-omk-pill omk-p4">
                  <div className="omk-pill-icon"><i className="fas fa-school"></i></div>
                  <span className="omk-pill-text">Multi-tenant</span>
                </div>

                <div className="hero-omk-pill omk-p5">
                  <div className="omk-pill-icon"><i className="fas fa-coins"></i></div>
                  <span className="omk-pill-text">364 Act. Financiera</span>
                </div>

                <div className="hero-omk-pill omk-p6">
                  <div className="omk-pill-icon"><i className="fas fa-flask"></i></div>
                  <span className="omk-pill-text">CEN Labs · 40 Sim.</span>
                </div>
              </div>
            </div>
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

          {/* ── PRODUCTS SECTION ── */}
          <section id="productos" className="section">
            <div className="section-head center">
              <span className="sh-eyebrow">Productos CEN</span>
              <h2>Un ecosistema diseñado para <em>cada etapa</em> educativa</h2>
              <p className="sh-sub">
                Desde primaria hasta bachillerato. Nuestros productos se adaptan al nivel y necesidades de cada
                institución educativa del sistema mexicano.
              </p>
            </div>

            <div className="tiers">
              {PRODUCTS.map((product) => (
                <Link
                  key={product.id}
                  href={product.href}
                  className="tier"
                  target={product.external ? '_blank' : undefined}
                  rel={product.external ? 'noopener noreferrer' : undefined}
                  style={{ opacity: product.available ? 1 : 0.7 }}
                >
                  <div className="tier-tags">
                    <span className="tag">{product.badge}</span>
                    {!product.available && <span className="tag tag-soon">Próximamente</span>}
                  </div>
                  <h3>{product.name}</h3>
                  <p className="tier-blurb">{product.description}</p>
                  <div className="read-more-btn">
                    <div className="read-more-pill">{product.available ? 'Explorar' : 'En desarrollo'}</div>
                    <div className="read-more-arrow">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── SUBSISTEMAS DETAIL ── */}
          <section className="subsistemas-section">
            <div className="section-head center" style={{ marginBottom: '32px' }}>
              <span className="sh-eyebrow">Para instituciones</span>
              <h2>CEN es compatible con los principales <em>subsistemas</em> educativos de México</h2>
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
              <div className="lb-eyebrow"><span className="pulse"></span>Plataforma educativa nacional</div>
              <h2>Diseñado para <em>escalar</em><br />con tu institución.</h2>
              <p>
                Tecnología educativa construida desde adentro del sistema. Datos de cada institución
                aislados con arquitectura multi-tenant segura.
              </p>
              <div className="live-stats">
                <div className="live-stat">
                  <h4>34</h4>
                  <div className="lbl">UAC del MCCEMS</div>
                  <div className="sub"><i className="fas fa-book-open"></i> Currículum Fundamental</div>
                </div>
                <div className="live-stat">
                  <h4>364</h4>
                  <div className="lbl">Actividades Financiera</div>
                  <div className="sub"><i className="fas fa-star"></i> 9 grados escolares</div>
                </div>
                <div className="live-stat">
                  <h4>40</h4>
                  <div className="lbl">Simuladores Labs</div>
                  <div className="sub"><i className="fas fa-flask"></i> Ciencias y matemáticas</div>
                </div>
              </div>
            </div>

            <div className="live-band-visual">
              <div className="visual-grid">
                {['DGB', 'DGETI', 'CONALEP', 'COBACH', 'DGETAyCM', 'RVOE'].map((s) => (
                  <div key={s} className="visual-badge">{s}</div>
                ))}
              </div>
            </div>
          </section>

          {/* ── POR QUÉ CEN ── */}
          <section id="por-que-cen" className="section">
            <div className="section-head center">
              <span className="sh-eyebrow">Por qué CEN</span>
              <h2>Tecnología educativa construida <em>desde adentro</em> del sistema</h2>
              <p className="sh-sub">
                Diseñado en colaboración con docentes en activo, directivos escolares y especialistas pedagógicos.
              </p>
            </div>
            <div className="values-grid">
              {VALUES.map((v) => (
                <div key={v.title} className={`value-card${v.alt ? ' alt' : ''}`}>
                  <div className="vc-icon"><i className={v.icon}></i></div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA BAND ── */}
          <section className="cta-band">
            <div>
              <h3>Comience a trabajar<br /><em>con CEN</em></h3>
              <p>
                Acceso institucional disponible para escuelas y subsistemas educativos de todo el sistema mexicano.
              </p>
              <div className="cta-actions">
                <Link href="/bachillerato" className="btn-cta">
                  Explorar CEN Bachillerato <i className="fas fa-arrow-right"></i>
                </Link>
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
