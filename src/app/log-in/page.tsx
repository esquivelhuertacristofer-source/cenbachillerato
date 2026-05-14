"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!consentimiento) {
      setError("Debes aceptar el Aviso de Privacidad y los Términos de Uso para continuar.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        const msg =
          authError.message === "Invalid login credentials"
            ? "Correo o contraseña incorrectos."
            : authError.message === "Email not confirmed"
            ? "Debes confirmar tu correo electrónico antes de acceder."
            : "Ocurrió un error al iniciar sesión. Intenta de nuevo.";
        setError(msg);
        return;
      }

      if (!data.user) {
        setError("No se pudo obtener la sesión. Intenta de nuevo.");
        return;
      }

      try {
        await supabase.from("user_consents").insert([
          { user_id: data.user.id, document_type: "privacy", document_version: "1.0" },
          { user_id: data.user.id, document_type: "terms", document_version: "1.0" },
        ]);
      } catch {
        // El consentimiento puede estar ya registrado — no bloqueamos el login
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role = profile?.role ?? "student";

      if (role === "student") {
        router.replace("/hub");
      } else if (role === "teacher") {
        router.replace("/dashboard/docente");
      } else {
        router.replace("/admin/escuelas");
      }
    } catch (err) {
      console.error("[LoginPage] error:", err);
      setError("Error inesperado. Por favor intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ fontFamily: "'Epilogue', system-ui, sans-serif", background: '#F8FAFC' }}
    >
      <div className="flex flex-1">

        {/* ── LEFT PANEL: Branding (oculto en mobile) ── */}
        <div
          className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 xl:p-16"
          style={{ background: 'linear-gradient(135deg, #0B2545 0%, #0E2D56 100%)' }}
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
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-4 group" style={{ textDecoration: 'none' }}>
              <div
                className="flex items-center justify-center rounded-xl shadow-lg group-hover:scale-105 transition-transform"
                style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 22, lineHeight: 1 }}>C</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em' }}>CEN</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>BACHILLERATO</span>
              </div>
            </Link>
          </div>

          {/* Centro: contenido + decoración flotante */}
          <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
            {/* Decorative ring */}
            <div
              className="mx-auto mb-10"
              style={{
                width: 200, height: 200, borderRadius: '50%',
                background: 'rgba(125,211,252,0.08)',
                border: '1.5px solid rgba(125,211,252,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'float 6s ease-in-out infinite',
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
            </div>

            <h2
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
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.65, fontWeight: 500, maxWidth: 380 }}>
              Accede a tu cuenta para continuar tus actividades, revisar tu progreso en el MCCEMS y
              gestionar tu formación por semestre.
            </p>

            {/* Stats pills */}
            <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
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
            </div>
          </div>

          {/* Footer del panel */}
          <div className="relative z-10" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>
            © 2026 CEN — Campaña Educativa Nacional
          </div>
        </div>

        {/* ── RIGHT PANEL: Formulario ── */}
        <div
          className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12"
          style={{ background: '#fff' }}
        >
          <div style={{ width: '100%', maxWidth: 440 }}>

            {/* Logo mobile */}
            <div className="lg:hidden mb-12 flex justify-center">
              <Link href="/" className="inline-flex items-center gap-3" style={{ textDecoration: 'none' }}>
                <div
                  className="flex items-center justify-center rounded-xl shadow-lg"
                  style={{ width: 48, height: 48, background: '#0B2545' }}
                >
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 22 }}>C</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                  <span style={{ color: '#0B2545', fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em' }}>CEN</span>
                  <span style={{ color: 'rgba(11,37,69,0.5)', fontWeight: 700, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>BACHILLERATO</span>
                </div>
              </Link>
            </div>

            {/* Encabezado */}
            <div style={{ marginBottom: 36 }}>
              <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0B2545', letterSpacing: '-0.03em', marginBottom: 10 }}>
                Iniciar sesión
              </h1>
              <p style={{ color: '#64748B', fontSize: 16, fontWeight: 500, lineHeight: 1.5 }}>
                Acceda a CEN Bachillerato con sus credenciales institucionales.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: '#FEF2F2', border: '1px solid #FEE2E2',
                  color: '#DC2626', padding: '14px 16px',
                  borderRadius: 16, marginBottom: 24,
                  fontWeight: 700, fontSize: 14,
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  animation: 'slideDown 0.3s ease-out',
                }}
                role="alert"
              >
                <i className="fas fa-exclamation-circle" style={{ marginTop: 2, opacity: 0.8, fontSize: 16 }}></i>
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Email */}
              <div className="group">
                <label
                  style={{
                    display: 'block', color: '#0B2545', fontWeight: 700,
                    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em',
                    marginBottom: 8, transition: 'color 0.15s',
                  }}
                >
                  Correo electrónico institucional
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', inset: '0 auto 0 0', paddingLeft: 16,
                    display: 'flex', alignItems: 'center', pointerEvents: 'none',
                    color: '#94A3B8',
                  }}>
                    <i className="fas fa-envelope" style={{ fontSize: 16 }}></i>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    placeholder="usuario@suescuela.edu.mx"
                    style={{
                      width: '100%', paddingLeft: 48, paddingRight: 20, paddingTop: 16, paddingBottom: 16,
                      background: '#F8FAFC', border: '2px solid #E2E8F0',
                      borderRadius: 16, outline: 'none',
                      fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#0B2545',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#7DD3FC';
                      e.target.style.boxShadow = '0 0 0 4px rgba(125,211,252,0.15)';
                      e.target.style.background = '#fff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = '#F8FAFC';
                    }}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="group">
                <label
                  style={{
                    display: 'block', color: '#0B2545', fontWeight: 700,
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
                    color: '#94A3B8',
                  }}>
                    <i className="fas fa-lock" style={{ fontSize: 16 }}></i>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    placeholder="Su contraseña"
                    style={{
                      width: '100%', paddingLeft: 48, paddingRight: 20, paddingTop: 16, paddingBottom: 16,
                      background: '#F8FAFC', border: '2px solid #E2E8F0',
                      borderRadius: 16, outline: 'none',
                      fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#0B2545',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#7DD3FC';
                      e.target.style.boxShadow = '0 0 0 4px rgba(125,211,252,0.15)';
                      e.target.style.background = '#fff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = '#F8FAFC';
                    }}
                  />
                </div>
              </div>

              {/* Consentimiento */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={consentimiento}
                  onChange={(e) => setConsentimiento(e.target.checked)}
                  style={{
                    marginTop: 3, width: 20, height: 20,
                    accentColor: '#1E40AF', cursor: 'pointer', flexShrink: 0,
                    borderRadius: 4,
                  }}
                />
                <span style={{ fontSize: 14, color: '#64748B', fontWeight: 500, lineHeight: 1.55 }}>
                  Acepto el{' '}
                  <Link href="/privacidad" target="_blank" style={{ color: '#1E40AF', fontWeight: 700 }}>
                    Aviso de Privacidad
                  </Link>
                  {' '}y los{' '}
                  <Link href="/terminos" target="_blank" style={{ color: '#1E40AF', fontWeight: 700 }}>
                    Términos y Condiciones
                  </Link>
                  {' '}de uso de la plataforma.
                </span>
              </label>

              {/* Botón submit */}
              <button
                type="submit"
                disabled={loading || !consentimiento}
                style={{
                  marginTop: 8,
                  width: '100%',
                  background: '#0B2545',
                  color: '#fff',
                  paddingTop: 20, paddingBottom: 20,
                  borderRadius: 16,
                  fontFamily: 'inherit',
                  fontWeight: 900,
                  fontSize: 17,
                  border: 'none',
                  cursor: loading || !consentimiento ? 'not-allowed' : 'pointer',
                  opacity: loading || !consentimiento ? 0.7 : 1,
                  boxShadow: '0 10px 25px rgba(11,37,69,0.15)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!loading && consentimiento) {
                    const btn = e.currentTarget;
                    btn.style.transform = 'translateY(-2px)';
                    btn.style.boxShadow = '0 16px 35px rgba(11,37,69,0.25)';
                    btn.style.background = '#1E40AF';
                  }
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget;
                  btn.style.transform = 'translateY(0)';
                  btn.style.boxShadow = '0 10px 25px rgba(11,37,69,0.15)';
                  btn.style.background = '#0B2545';
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
              </button>
            </form>

            {/* Nota inferior */}
            <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500, lineHeight: 1.55 }}>
                ¿No tiene credenciales? Solicite acceso a través de su administrador escolar.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
