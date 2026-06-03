'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { springs, stagger } from '@/lib/motion/tokens';
import { useReducedMotion } from '@/lib/motion/hooks';

const PARTICLES = [
  { s:3, l:'6%',  dl:'0s',   dr:'9s'  },
  { s:2, l:'14%', dl:'1.8s', dr:'12s' },
  { s:4, l:'23%', dl:'3.2s', dr:'8s'  },
  { s:2, l:'35%', dl:'0.6s', dr:'14s' },
  { s:3, l:'48%', dl:'2.4s', dr:'10s' },
  { s:2, l:'59%', dl:'4.1s', dr:'11s' },
  { s:4, l:'71%', dl:'1.1s', dr:'9s'  },
  { s:2, l:'82%', dl:'3.7s', dr:'13s' },
  { s:3, l:'90%', dl:'0.4s', dr:'10s' },
];

const CYCLING_WORDS = ['sí funciona.', 'transforma.', 'inspira.', 'avanza.'];
const LIVE_AVATARS  = ['#1E40AF', '#0F766E', '#7C3AED', '#B45309', '#0369A1'];
const CRED_PILLS = [
  { icon: 'fa-landmark',       text: 'SEP Oficial'      },
  { icon: 'fa-graduation-cap', text: 'MCCEMS 2023'      },
  { icon: 'fa-file-contract',  text: 'Acuerdo 09/08/23' },
  { icon: 'fa-shield-alt',     text: 'LFPDPPP'          },
];

export function HeroCEN() {
  const [wordIdx,     setWordIdx]     = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [liveCount,   setLiveCount]   = useState(0);
  const reducedMotion = useReducedMotion();

  // Cycling word — fade + blur cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % CYCLING_WORDS.length);
        setWordVisible(true);
      }, 300);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  // Live count-up
  useEffect(() => {
    const target = 127;
    const timer = setInterval(() => {
      setLiveCount(c => {
        if (c >= target) { clearInterval(timer); return target; }
        return Math.min(c + 4, target);
      });
    }, 22);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="inicio" className="hero-wrap">
      <header className="hero">

        {/* Partículas flotantes — sutiles, azul cielo */}
        {!reducedMotion && (
          <div className="cen-hero-particles" aria-hidden="true">
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

        {/* LEFT — contenido principal */}
        <div className="hero-left">
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.smooth, delay: 0.05 }}
          >
            <div className="hero-badge">Campaña Educativa Nacional</div>
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={reducedMotion ? {} : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.smooth, delay: 0.05 + stagger.fast }}
          >
            Educación que
            <span
              className={`accent cycling-word cycling-word--hero${wordVisible ? ' visible' : ''}${wordIdx % 2 !== 0 ? ' cw-outline' : ''}`}
            >
              {CYCLING_WORDS[wordIdx]}
            </span>
          </motion.h1>

          <motion.p
            className="hero-sub"
            initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.smooth, delay: 0.05 + stagger.fast * 2 }}
          >
            CEN reúne el currículo oficial mexicano en una plataforma moderna para escuelas,
            docentes y estudiantes. Bachillerato, educación financiera, laboratorios y más.
          </motion.p>

          <motion.div
            className="hero-cta-row"
            initial={reducedMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.smooth, delay: 0.05 + stagger.fast * 3 }}
          >
            <motion.a
              href="#productos"
              className="btn-cta"
              whileHover={reducedMotion ? {} : { scale: 1.05, y: -2 }}
              whileTap={reducedMotion ? {} : { scale: 0.97 }}
              transition={springs.snappy}
            >
              ¡Empieza Ahora! <i className="fas fa-arrow-right" />
            </motion.a>
            <motion.a
              href="/log-in"
              className="btn-cta-demo"
              whileHover={reducedMotion ? {} : { scale: 1.04, y: -1 }}
              whileTap={reducedMotion ? {} : { scale: 0.97 }}
              transition={springs.snappy}
            >
              Iniciar Sesión <i className="fas fa-chevron-right" />
            </motion.a>
          </motion.div>

          <motion.div
            className="hero-cred-row"
            initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.smooth, delay: 0.05 + stagger.fast * 4 }}
          >
            {CRED_PILLS.map((p, i) => (
              <div
                key={p.text}
                className="hero-cred-pill"
                style={{ animationDelay: `${0.65 + i * 0.13}s` }}
              >
                <i className={`fas ${p.icon}`} />
                <span>{p.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — foto del estudiante */}
        <div className="hero-right">
          <div className="hero-visual">
            {/* Un único glow radial detrás de la foto */}
            <div className="hero-student-glow" aria-hidden="true" />

            <div className="hero-student-card">
              <img src="/1.png" alt="Estudiante CEN" className="hero-student-img" />
            </div>

            <div className="hero-bottom-fade" aria-hidden="true" />
            <div className="hero-photo-blend" aria-hidden="true" />

            {/* Floating badges — entrada con delay para no competir con el h1 */}
            <motion.div
              className="hero-float-badge"
              style={{ top: '28px', right: '28px' }}
              initial={reducedMotion ? {} : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.smooth, delay: 0.9 }}
            >
              <i className="fas fa-graduation-cap" />
              <span>MCCEMS · 34 UAC</span>
            </motion.div>

            <motion.div
              className="hero-float-badge"
              style={{ top: '44%', right: '28px' }}
              initial={reducedMotion ? {} : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.smooth, delay: 1.05 }}
            >
              <i className="fas fa-school" />
              <span>7+ subsistemas</span>
            </motion.div>
          </div>
        </div>

        {/* Live card — social proof */}
        <motion.div
          className="hero-live-card"
          initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.smooth, delay: 0.82 }}
        >
          <span className="hero-live-dot" />
          <div className="hero-live-avatars">
            {LIVE_AVATARS.map((c, i) => (
              <div
                key={i}
                className="hero-live-avatar"
                style={{ background: c, zIndex: 5 - i }}
              />
            ))}
          </div>
          <div className="hero-live-info">
            <span className="hero-live-num">{liveCount}+</span>
            <span className="hero-live-label">docentes activos</span>
          </div>
        </motion.div>

        {/* Scroll hint — solo la línea, sin chevron */}
        <div className="hero-scroll-hint" aria-hidden="true">
          <span className="scroll-line" />
        </div>

      </header>

      <div className="hero-bottom-wave" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 56" preserveAspectRatio="none">
          <path fill="#F8FAFC" d="M0,28 C360,56 1080,0 1440,28 L1440,56 L0,56 Z" />
        </svg>
      </div>
    </div>
  );
}
