'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { springs } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/lib/motion/hooks';
import './LandingCEN.css';

import { HeroCEN }             from './HeroCEN';
import { AlliesBand }          from './AlliesBand';
import { ProductosSection }    from './ProductosSection';
import { ProcesoSection }      from './ProcesoSection';
import { PorQueCEN }           from './PorQueCEN';
import { TestimoniosSection }  from './TestimoniosSection';
import { CTAFinal }            from './CTAFinal';

// ── Nav component — self-contained ──────────────────────────────────────────

function NavCEN() {
  const [navScrolled,    setNavScrolled]    = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`nav${navScrolled ? ' nav--scrolled' : ''}`}>
      <Link href="/" className="brand">
        <img src="/Logo%20Cen.png" alt="CEN" className="brand-logo" />
        <div className="brand-text">
          <span className="b2">Campaña Educativa Nacional</span>
        </div>
      </Link>

      <div className="nav-links">
        <a href="#inicio"     className="active">Inicio</a>
        <a href="#productos">Productos</a>
        <a href="#instituciones">Instituciones</a>
        <a href="#por-que-cen">Por qué CEN</a>
      </div>

      <div className="nav-right">
        <motion.a
          href="#productos"
          className="nav-btn-primary"
          whileHover={reducedMotion ? {} : { scale: 1.05, y: -1 }}
          whileTap={reducedMotion ? {} : { scale: 0.97 }}
          transition={springs.snappy}
        >
          ¡Empieza Ahora!
        </motion.a>
      </div>

      <button
        className="nav-mobile-toggle"
        onClick={() => setMobileMenuOpen(o => !o)}
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`} />
      </button>

      <div className={`nav-mobile-overlay${mobileMenuOpen ? ' open' : ''}`}>
        <div className="nav-mobile-links">
          <a href="#inicio"         onClick={() => setMobileMenuOpen(false)}>Inicio</a>
          <a href="#productos"      onClick={() => setMobileMenuOpen(false)}>Productos</a>
          <a href="#instituciones"  onClick={() => setMobileMenuOpen(false)}>Instituciones</a>
          <a href="#por-que-cen"    onClick={() => setMobileMenuOpen(false)}>Por qué CEN</a>
          <a
            href="#productos"
            className="nav-btn-primary mobile-nav-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            ¡Empieza Ahora!
          </a>
        </div>
      </div>
    </nav>
  );
}

// ── Mobile sticky CTA ────────────────────────────────────────────────────────

function MobileStickyTCA() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <div className={`mobile-sticky-cta${visible ? ' visible' : ''}`}>
      <Link href="/log-in" className="btn-cta">
        Ingresar a la plataforma <i className="fas fa-arrow-right" />
      </Link>
    </div>
  );
}

// ── Assembler ────────────────────────────────────────────────────────────────

export default function LandingPageCEN() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className="landing-cen-root" style={{ background: '#F8FAFC', minHeight: '100vh' }} />;
  }

  return (
    <div className="landing-cen">
      <div className="cen-content">
        <main className="main-scroll">
          <NavCEN />
          <HeroCEN />
          <AlliesBand />
          <ProductosSection />
          <ProcesoSection />
          <PorQueCEN />
          <TestimoniosSection />
          <CTAFinal />
        </main>
      </div>
      <MobileStickyTCA />
    </div>
  );
}
