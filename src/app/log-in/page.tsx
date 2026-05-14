"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
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
    <div className="flex min-h-screen">
      {/* ── Left panel: branding (hidden on mobile) ─────────── */}
      <div className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:justify-center lg:px-12">
        {/* Gradient background */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-cen-navy to-[#071A35]"
          aria-hidden="true"
        />

        {/* Dot-grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Floating logo mark */}
        <div className="relative z-10 animate-float">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white/10 backdrop-blur-sm border border-white/20">
            <span className="text-4xl font-black text-white">C</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 mt-8 max-w-sm">
          <h2
            className="text-3xl font-black uppercase tracking-tight"
            style={{
              background:
                "linear-gradient(90deg, #7DD3FC 0%, #1E40AF 40%, #7DD3FC 80%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradient 4s linear infinite",
            }}
          >
            Accede a tu plataforma
          </h2>
          <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
            CEN Bachillerato — Marco Curricular Común de la Educación Media Superior
          </p>

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap gap-2">
            {["34 UAC", "342 Progresiones", "6 Semestres"].map((stat) => (
              <span
                key={stat}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cen-sky/80"
              >
                {stat}
              </span>
            ))}
          </div>
        </div>

        {/* Decorative twinkle dots */}
        {[
          { top: "15%", right: "20%", size: "6px" },
          { top: "35%", right: "8%", size: "4px" },
          { top: "65%", right: "15%", size: "5px" },
          { top: "80%", right: "30%", size: "3px" },
        ].map((dot, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute animate-twinkle rounded-full bg-cen-sky/40"
            style={{
              top: dot.top,
              right: dot.right,
              width: dot.size,
              height: dot.size,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* ── Right panel: form ────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center bg-white px-6 py-12 sm:px-10 lg:max-w-[480px]">
        {/* Mobile logo */}
        <div className="mb-10 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cen-navy">
              <span className="text-sm font-black text-white">C</span>
            </div>
            <span className="text-sm font-black uppercase tracking-[0.25em] text-cen-navy">
              CEN
            </span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-2xl font-black uppercase tracking-tight text-cen-navy">
            Iniciar sesión
          </h1>
          <p className="mt-1 text-sm text-ink-60">
            Campaña Educativa Nacional — Bachillerato
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="tu@correo.com"
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />

            <div className="flex items-start gap-3 pt-1">
              <input
                id="consentimiento"
                type="checkbox"
                checked={consentimiento}
                onChange={(e) => setConsentimiento(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#E2E8F0] accent-cen-blue"
                required
              />
              <label htmlFor="consentimiento" className="text-xs leading-relaxed text-ink-60">
                He leído y acepto el{" "}
                <Link
                  href="/privacidad"
                  target="_blank"
                  className="font-bold text-cen-blue underline"
                >
                  Aviso de Privacidad
                </Link>{" "}
                y los{" "}
                <Link
                  href="/terminos"
                  target="_blank"
                  className="font-bold text-cen-blue underline"
                >
                  Términos de Uso
                </Link>
                .
              </label>
            </div>

            {error && (
              <div
                className="animate-slide-down rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!email || !password}
              className="w-full"
            >
              {loading ? "Validando acceso..." : "Acceder"}
            </Button>
          </form>

          <p className="mt-8 text-center text-[10px] leading-relaxed text-ink-40">
            Plataforma protegida conforme a la LFPDPPP.
            <br />
            Si tienes problemas para acceder, contacta al administrador de tu institución.
          </p>
        </div>
      </div>
    </div>
  );
}
