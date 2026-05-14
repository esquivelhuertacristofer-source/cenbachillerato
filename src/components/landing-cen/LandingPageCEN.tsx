'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './LandingCEN.css';

export default function LandingPageCEN() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="landing-cen-root" style={{ background: '#fff', minHeight: '100vh' }} />;
  }

  return (
    <div className="landing-cen">
      <div className="cen-content">
        <main className="main-scroll">

          {/* ── STICKY NAV ── */}
          <div className="nav-wrapper">
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
                <a href="#por-que-cen">Por qué CEN</a>
              </div>
              <div className="nav-right">
                <Link href="/bachillerato" className="nav-btn-primary">CEN Bachillerato</Link>
              </div>
            </nav>
          </div>

          {/* ── HERO OMK ── */}
          <div id="inicio" className="hero-omk">
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
                  <div className="omk-pill-icon"><i className="fas fa-shield-alt"></i></div>
                  <span className="omk-pill-text">Datos seguros · LFPDPPP</span>
                </div>

                <div className="hero-omk-pill omk-p5">
                  <div className="omk-pill-icon"><i className="fas fa-coins"></i></div>
                  <span className="omk-pill-text">364 Act. Financiera</span>
                </div>

                <div className="hero-omk-pill omk-p6">
                  <div className="omk-pill-icon"><i className="fas fa-mobile-alt"></i></div>
                  <span className="omk-pill-text">Sin instalación</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── PRODUCTS FEATURED ── */}
          <section id="productos" className="section">
            <div className="section-head center">
              <span className="sh-eyebrow">Productos CEN</span>
              <h2>Un ecosistema para <em>cada etapa</em> educativa</h2>
            </div>

            <div className="products-featured">

              {/* FLAGSHIP — CEN BACHILLERATO */}
              <Link href="/bachillerato" className="product-flagship">
                <div className="flagship-left">
                  <div className="flagship-badge">
                    <i className="fas fa-landmark"></i> MCCEMS · SEP · Acuerdo 09/08/23
                  </div>
                  <h3 className="flagship-title">CEN Bachillerato</h3>
                  <p className="flagship-desc">
                    Plataforma educativa alineada al Marco Curricular Común de la Educación Media Superior.
                    Para bachillerato general, tecnológico y técnico-bachiller.
                  </p>
                  <div className="flagship-chips">
                    <span className="flagship-chip"><i className="fas fa-book-open"></i> 34 UAC</span>
                    <span className="flagship-chip"><i className="fas fa-layer-group"></i> 8 RSC</span>
                    <span className="flagship-chip"><i className="fas fa-calendar"></i> 6 Semestres</span>
                    <span className="flagship-chip"><i className="fas fa-chart-line"></i> 342 Progresiones</span>
                  </div>
                </div>
                <div className="flagship-right">
                  <span className="flagship-cta">
                    Explorar plataforma <i className="fas fa-arrow-right"></i>
                  </span>
                  <div className="flagship-stats">
                    <div className="flagship-stat">
                      <div className="flagship-stat-val">34</div>
                      <div className="flagship-stat-lbl">UAC</div>
                    </div>
                    <div className="flagship-stat">
                      <div className="flagship-stat-val">8</div>
                      <div className="flagship-stat-lbl">RSC</div>
                    </div>
                    <div className="flagship-stat">
                      <div className="flagship-stat-val">4</div>
                      <div className="flagship-stat-lbl">Ámbitos</div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* CEN FINANCIERA */}
              <Link
                href="https://cenfinancierafinal.vercel.app"
                className="product-card product-card-financiera"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="pc-badge"><i className="fas fa-coins"></i> Primaria · Secundaria</div>
                <h3 className="pc-title">CEN Educación Financiera</h3>
                <p className="pc-desc-text">
                  364 actividades pedagógicas para primaria y secundaria. Nueve grados escolares, de 6 a 15 años.
                </p>
                <div className="pc-meta-row">
                  <span className="pc-meta-text">364 Actividades · 9 Grados</span>
                  <div className="pc-arrow-btn"><i className="fas fa-arrow-right"></i></div>
                </div>
              </Link>

              {/* CEN LABS */}
              <Link
                href="https://www.cenlaboratorios.com.mx"
                className="product-card product-card-labs"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="pc-badge"><i className="fas fa-flask"></i> Bachillerato · MCCEMS</div>
                <h3 className="pc-title">CEN Labs</h3>
                <p className="pc-desc-text">
                  40 simuladores de química, física, biología y matemáticas alineados al MCCEMS.
                </p>
                <div className="pc-meta-row">
                  <span className="pc-meta-text">40 Simuladores · 15 a 18 años</span>
                  <div className="pc-arrow-btn"><i className="fas fa-arrow-right"></i></div>
                </div>
              </Link>

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

          {/* ── BENTO VALUES ── */}
          <section id="por-que-cen" className="section">
            <div className="section-head center">
              <span className="sh-eyebrow">Por qué CEN</span>
              <h2>Tecnología educativa construida <em>desde adentro</em> del sistema</h2>
              <p className="sh-sub">Diseñado en colaboración con docentes, directivos y especialistas pedagógicos.</p>
            </div>
            <div className="bento-grid">
              <div className="bento-card bento-navy bento-wide">
                <div className="bento-icon"><i className="fas fa-landmark"></i></div>
                <h3 className="bento-title">Alineación oficial SEP</h3>
                <p className="bento-desc">Contenidos diseñados según los marcos curriculares vigentes: MCCEMS, NEM y Modelo Educativo 2025.</p>
                <span className="bento-deco" aria-hidden="true">SEP</span>
              </div>
              <div className="bento-card bento-sky">
                <div className="bento-icon"><i className="fas fa-school"></i></div>
                <h3 className="bento-title">Multi-tenant</h3>
                <p className="bento-desc">Una o múltiples escuelas con aislamiento total de datos por Row Level Security.</p>
              </div>
              <div className="bento-card bento-light">
                <div className="bento-icon"><i className="fas fa-shield-alt"></i></div>
                <h3 className="bento-title">Seguridad institucional</h3>
                <p className="bento-desc">Cumplimiento con LFPDPPP. Sin acceso cruzado entre instituciones.</p>
              </div>
              <div className="bento-card bento-sky">
                <div className="bento-icon"><i className="fas fa-laptop"></i></div>
                <h3 className="bento-title">Tecnología moderna</h3>
                <p className="bento-desc">Responsive desde cualquier dispositivo. Sin instalación requerida.</p>
              </div>
              <div className="bento-card bento-navy bento-wide">
                <div className="bento-icon"><i className="fas fa-chalkboard-teacher"></i></div>
                <h3 className="bento-title">Soporte educativo</h3>
                <p className="bento-desc">Diseñado en colaboración con docentes en activo, directivos y especialistas del sistema educativo mexicano.</p>
                <span className="bento-deco" aria-hidden="true">CEN</span>
              </div>
            </div>
          </section>

          {/* ── CTA BAND ── */}
          <section className="cta-band">
            <div>
              <h3>Comience a trabajar<br /><em>con CEN hoy</em></h3>
              <p>Acceso institucional disponible para escuelas y subsistemas de todo el sistema educativo mexicano.</p>
            </div>
            <div className="cta-actions">
              <Link href="/bachillerato" className="btn-cta">
                Explorar CEN Bachillerato <i className="fas fa-arrow-right"></i>
              </Link>
              <a href="mailto:gerencia@campanaeducativanacional.com.mx" className="btn-cta-outline">
                Contactar <i className="fas fa-envelope"></i>
              </a>
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
