'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { springs } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/lib/motion/hooks';

const MotionLink = motion(Link);

export function CTAFinal() {
  const reducedMotion = useReducedMotion();

  return (
    <>
      {/* ── CTA FINAL ── */}
      <section className="cta-final">
        {/* Glow ambiental + orb único */}
        <div className="cta-final-glow" aria-hidden="true" />
        <div className="cta-orbs" aria-hidden="true">
          <div className="cta-orb cta-orb-1" />
        </div>

        {/* "CEN" watermark tipográfico — firma arquitectónica */}
        <span className="cta-watermark" aria-hidden="true">CEN</span>

        <div className="cta-final-inner">
          {/* Columna texto */}
          <div className="cta-split-left">
            <div className="cta-eyebrow">
              <span className="fv-pulse" />
              <span>Acceso institucional disponible</span>
            </div>
            <h2 className="cta-headline">
              ¿Listo para dar el<br /><em>primer paso</em>?
            </h2>
            <p className="cta-sub">
              Únete a la red de academias y comienza a construir el futuro educativo de tus alumnos hoy mismo.
            </p>
          </div>

          {/* Columna acciones */}
          <div className="cta-split-right">
            <div className="cta-action-cards">
              <motion.div
                whileHover={reducedMotion ? {} : { y: -4, scale: 1.02 }}
                whileTap={reducedMotion ? {} : { scale: 0.98 }}
                transition={springs.snappy}
              >
                <MotionLink href="/bachillerato" className="cta-action-card cta-action-card--primary">
                  <div className="cac-icon">
                    <i className="fas fa-graduation-cap" />
                  </div>
                  <div className="cac-text">
                    <div className="cac-label">Plataforma principal</div>
                    <div className="cac-title">CEN Bachillerato</div>
                  </div>
                  <i className="fas fa-arrow-right cac-arrow" />
                </MotionLink>
              </motion.div>

              <motion.a
                href="mailto:gerencia@campanaeducativanacional.com.mx"
                className="cta-action-card"
                whileHover={reducedMotion ? {} : { y: -4, scale: 1.02 }}
                whileTap={reducedMotion ? {} : { scale: 0.98 }}
                transition={springs.snappy}
              >
                <div className="cac-icon">
                  <i className="fas fa-envelope" />
                </div>
                <div className="cac-text">
                  <div className="cac-label">Para instituciones</div>
                  <div className="cac-title">Contactar al equipo</div>
                </div>
                <i className="fas fa-arrow-right cac-arrow" />
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-brand">
          <div style={{ marginBottom: '20px' }}>
            <img src="/Logo%20Cen.png" alt="CEN" className="brand-logo" />
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
          El contenido pedagógico, la marca, el código fuente, los diseños, ilustraciones, simulaciones interactivas
          y materiales didácticos son propiedad exclusiva de CEN — Campaña Educativa Nacional. Su reproducción,
          distribución o uso sin autorización expresa por escrito constituye una infracción a los derechos de autor
          protegidos bajo la Ley Federal del Derecho de Autor de México.
        </p>
      </footer>
    </>
  );
}
