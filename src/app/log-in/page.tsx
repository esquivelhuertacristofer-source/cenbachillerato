"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { iniciarSesion } from "@/lib/actions/iniciar-sesion";
import { springs, stagger } from "@/lib/motion/tokens";
import { useReducedMotion } from "@/lib/motion/hooks";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!consentimiento) {
      setError("Debes aceptar el Aviso de Privacidad y los Términos de Uso para continuar.");
      return;
    }

    setLoading(true);
    try {
      const result = await iniciarSesion({
        email: email.trim(),
        password,
        consentimiento,
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      if (result.rol === "student") {
        router.replace("/hub");
      } else if (result.rol === "teacher") {
        router.replace("/dashboard/docente");
      } else {
        router.replace("/admin/escuelas");
      }
      router.refresh();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error("[LoginPage] error:", err);
      setError("Error inesperado. Por favor intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !loading && consentimiento;

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ fontFamily: "'Epilogue', system-ui, sans-serif", background: '#0A1828' }}
    >
      <div className="flex flex-1">

        {/* ── LEFT PANEL: Branding (oculto en mobile) ── */}
        <div
          className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 xl:p-16"
          style={{ background: 'linear-gradient(135deg, #0B2545 0%, #0E2D56 100%)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Dot-grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          {/* Glow blobs */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 560, height: 560, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(125,211,252,0.1), transparent 70%)',
              bottom: '-200px', right: '-120px',
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              width: 400, height: 400, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(30,64,175,0.15), transparent 70%)',
              top: '-150px', left: '-100px',
            }}
          />

          {/* Logo */}
          <motion.div
            className="relative z-10"
            initial={reducedMotion ? {} : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springs.smooth, delay: 0.05 }}
          >
            <Link href="/" className="inline-flex items-center gap-4 group" style={{ textDecoration: 'none' }}>
              <img src="/Logo%20Cen.png" alt="CEN" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.92 }} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em' }}>CEN</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>BACHILLERATO</span>
              </div>
            </Link>
          </motion.div>

          {/* Centro: contenido + decoración flotante */}
          <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
            {/* Decorative ring */}
            <motion.div
              className="mx-auto mb-10"
              initial={reducedMotion ? {} : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...springs.gentle, delay: 0.15 }}
              style={{
                width: 200, height: 200, borderRadius: '50%',
                background: 'rgba(125,211,252,0.08)',
                border: '1.5px solid rgba(125,211,252,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: reducedMotion ? undefined : 'float 6s ease-in-out infinite',
              }}
            >
              <div
                style={{
                  width: 140, height: 140, borderRadius: '50%',
                  background: 'rgba(125,211,252,0.1)',
                  border: '2px solid rgba(125,211,252,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 48,
                }}
              >
                <i className="fas fa-graduation-cap" style={{ color: '#7DD3FC' }}></i>
              </div>
            </motion.div>

            <motion.h2
              initial={reducedMotion ? {} : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.smooth, delay: 0.2 }}
              style={{
                fontSize: 'clamp(32px, 3.5vw, 46px)',
                fontWeight: 900,
                color: '#fff',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                marginBottom: 16,
                textWrap: 'balance',
              }}
            >
              Desbloquea tu potencial{' '}
              <span style={{ color: '#7DD3FC' }}>académico.</span>
            </motion.h2>

            <motion.p
              initial={reducedMotion ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.smooth, delay: 0.2 + stagger.fast }}
              style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.65, fontWeight: 500, maxWidth: 380 }}
            >
              Accede a tu cuenta para continuar tus actividades, revisar tu progreso en el MCCEMS y
              gestionar tu formación por semestre.
            </motion.p>

            {/* Stats pills */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.smooth, delay: 0.2 + stagger.fast * 2 }}
              style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}
            >
              {[
                { label: 'UAC MCCEMS', value: '34' },
                { label: 'RSC', value: '8' },
                { label: 'Semestres', value: '6' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 999, padding: '8px 16px',
                  }}
                >
                  <span style={{ color: '#7DD3FC', fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em' }}>{stat.value}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footer del panel */}
          <div className="relative z-10" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>
            © 2026 CEN — Campaña Educativa Nacional
          </div>
        </div>

        {/* ── RIGHT PANEL: Formulario ── */}
        <div
          className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12"
          style={{ background: '#0D1F3C' }}
        >
          <div style={{ width: '100%', maxWidth: 440 }}>

            {/* Logo mobile */}
            <div className="lg:hidden mb-12 flex justify-center">
              <Link href="/" className="inline-flex items-center gap-3" style={{ textDecoration: 'none' }}>
                <img src="/Logo%20Cen.png" alt="CEN" style={{ width: 40, height: 40, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em' }}>CEN</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>BACHILLERATO</span>
                </div>
              </Link>
            </div>

            {/* Encabezado */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springs.smooth, delay: 0.1 }}
              style={{ marginBottom: 36 }}
            >
              <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 10 }}>
                Iniciar sesión
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 500, lineHeight: 1.5 }}>
                Acceda a CEN Bachillerato con sus credenciales institucionales.
              </p>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={reducedMotion ? {} : { opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={reducedMotion ? {} : { opacity: 0, y: -4, height: 0 }}
                  transition={springs.snappy}
                  style={{
                    background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)',
                    color: '#FCA5A5', padding: '14px 16px',
                    borderRadius: 16, marginBottom: 24,
                    fontWeight: 700, fontSize: 14,
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    overflow: 'hidden',
                  }}
                  role="alert"
                >
                  <i className="fas fa-exclamation-circle" style={{ marginTop: 2, opacity: 0.8, fontSize: 16, flexShrink: 0 }}></i>
                  <p style={{ margin: 0 }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Email */}
              <motion.div
                className="group"
                initial={reducedMotion ? {} : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.smooth, delay: 0.15 }}
              >
                <label
                  htmlFor="login-email"
                  style={{
                    display: 'block', color: 'rgba(255,255,255,0.65)', fontWeight: 700,
                    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em',
                    marginBottom: 8,
                  }}
                >
                  Correo electrónico institucional
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', inset: '0 auto 0 0', paddingLeft: 16,
                    display: 'flex', alignItems: 'center', pointerEvents: 'none',
                    color: 'rgba(255,255,255,0.3)',
                  }}>
                    <i className="fas fa-envelope" style={{ fontSize: 16 }} aria-hidden="true"></i>
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    placeholder="usuario@suescuela.edu.mx"
                    style={{
                      width: '100%', paddingLeft: 48, paddingRight: 20, paddingTop: 16, paddingBottom: 16,
                      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16, outline: 'none',
                      fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#fff',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(125,211,252,0.7)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(125,211,252,0.12)';
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = 'rgba(255,255,255,0.07)';
                    }}
                  />
                </div>
              </motion.div>

              {/* Contraseña */}
              <motion.div
                className="group"
                initial={reducedMotion ? {} : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.smooth, delay: 0.15 + stagger.normal }}
              >
                <label
                  htmlFor="login-password"
                  style={{
                    display: 'block', color: 'rgba(255,255,255,0.65)', fontWeight: 700,
                    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em',
                    marginBottom: 8,
                  }}
                >
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', inset: '0 auto 0 0', paddingLeft: 16,
                    display: 'flex', alignItems: 'center', pointerEvents: 'none',
                    color: 'rgba(255,255,255,0.3)',
                  }}>
                    <i className="fas fa-lock" style={{ fontSize: 16 }} aria-hidden="true"></i>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    placeholder="Su contraseña"
                    style={{
                      width: '100%', paddingLeft: 48, paddingRight: 20, paddingTop: 16, paddingBottom: 16,
                      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16, outline: 'none',
                      fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#fff',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(125,211,252,0.7)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(125,211,252,0.12)';
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = 'rgba(255,255,255,0.07)';
                    }}
                  />
                </div>
              </motion.div>

              {/* Consentimiento */}
              <motion.label
                initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.smooth, delay: 0.15 + stagger.normal * 2 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', userSelect: 'none' }}
              >
                <input
                  type="checkbox"
                  checked={consentimiento}
                  onChange={(e) => setConsentimiento(e.target.checked)}
                  style={{
                    marginTop: 3, width: 20, height: 20,
                    accentColor: '#7DD3FC', cursor: 'pointer', flexShrink: 0,
                    borderRadius: 4,
                  }}
                />
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500, lineHeight: 1.55 }}>
                  Acepto el{' '}
                  <Link href="/privacidad" target="_blank" style={{ color: '#7DD3FC', fontWeight: 700 }}>
                    Aviso de Privacidad
                  </Link>
                  {' '}y los{' '}
                  <Link href="/terminos" target="_blank" style={{ color: '#7DD3FC', fontWeight: 700 }}>
                    Términos y Condiciones
                  </Link>
                  {' '}de uso de la plataforma.
                </span>
              </motion.label>

              {/* Botón submit */}
              <motion.div
                initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.smooth, delay: 0.15 + stagger.normal * 3 }}
              >
                <motion.button
                  type="submit"
                  disabled={!canSubmit}
                  whileHover={canSubmit && !reducedMotion ? { y: -2 } : {}}
                  whileTap={canSubmit && !reducedMotion ? { scale: 0.98 } : {}}
                  transition={springs.snappy}
                  style={{
                    marginTop: 8,
                    width: '100%',
                    background: '#1E3A8A',
                    color: '#fff',
                    paddingTop: 20, paddingBottom: 20,
                    borderRadius: 16,
                    fontFamily: 'inherit',
                    fontWeight: 900,
                    fontSize: 17,
                    border: 'none',
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    opacity: canSubmit ? 1 : 0.6,
                    boxShadow: '0 10px 25px rgba(30,58,138,0.25)',
                    transition: 'background 0.25s ease, box-shadow 0.25s ease, opacity 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (canSubmit) {
                      e.currentTarget.style.background = '#1E40AF';
                      e.currentTarget.style.boxShadow = '0 16px 35px rgba(30,64,175,0.35)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1E3A8A';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(30,58,138,0.25)';
                  }}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin" style={{ color: '#7DD3FC' }}></i>
                      Validando acceso...
                    </>
                  ) : (
                    <>
                      Ingresar
                      <i className="fas fa-arrow-right" style={{ color: '#7DD3FC' }}></i>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Nota inferior */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...springs.smooth, delay: 0.45 }}
              style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}
            >
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 500, lineHeight: 1.55 }}>
                ¿No tiene credenciales? Solicite acceso a través de su administrador escolar.
              </p>
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
}
