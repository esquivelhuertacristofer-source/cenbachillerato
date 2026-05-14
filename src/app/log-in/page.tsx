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

      // Registrar consentimiento
      try {
        await supabase.from("user_consents").insert([
          { user_id: data.user.id, document_type: "privacy", document_version: "1.0" },
          { user_id: data.user.id, document_type: "terms", document_version: "1.0" },
        ]);
      } catch {
        // El consentimiento puede estar ya registrado — no bloqueamos el login
      }

      // Obtener role del profile para redirigir
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold text-indigo-700">CEN</span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">Campaña Educativa Nacional</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-xl font-bold text-gray-900">
            Iniciar sesión
          </h1>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
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

            <div className="flex items-start gap-3">
              <input
                id="consentimiento"
                type="checkbox"
                checked={consentimiento}
                onChange={(e) => setConsentimiento(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600"
                required
              />
              <label htmlFor="consentimiento" className="text-sm text-gray-600">
                He leído y acepto el{" "}
                <Link
                  href="/privacidad"
                  target="_blank"
                  className="text-indigo-600 underline"
                >
                  Aviso de Privacidad
                </Link>{" "}
                y los{" "}
                <Link
                  href="/terminos"
                  target="_blank"
                  className="text-indigo-600 underline"
                >
                  Términos de Uso
                </Link>
                .
              </label>
            </div>

            {error && (
              <div
                className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
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
              Acceder
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Plataforma protegida conforme a la LFPDPPP.
          <br />
          Si tienes problemas para acceder, contacta al administrador de tu institución.
        </p>
      </div>
    </div>
  );
}
