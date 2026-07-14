import type { Metadata } from "next";
import Link from "next/link";
import { FooterLegal } from "@/components/shared/FooterLegal";

export const metadata: Metadata = {
  title: "Mantenimiento — CEN Bachillerato",
};

export default function MantenimientoPage() {
  return (
    <>
      <header style={{ borderBottom: '1px solid rgba(11,37,69,0.10)', background: '#0B2545', padding: '14px 24px' }}>
        <div style={{ maxWidth: 896, margin: '0 auto' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/Logo%20Cen.png" alt="CEN" style={{ width: 28, height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.92 }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>CEN Bachillerato</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-white px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#0B2545',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4l-5.6 5.6a1.5 1.5 0 0 0 2.1 2.1l5.6-5.6a4 4 0 0 1 5.4-5.4l-2.1 2.1-1.4-1.4z" />
            </svg>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Estamos en mantenimiento
          </h1>
          <p className="mt-4 text-base text-gray-600">
            La plataforma CEN Bachillerato no está disponible en este momento porque estamos
            realizando trabajos de mantenimiento para mejorar tu experiencia.
          </p>
          <p className="mt-3 text-base text-gray-600">
            No es necesario que hagas nada: tu progreso y tus datos están a salvo. Por favor,
            intenta ingresar de nuevo en unos minutos.
          </p>

          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
            <p className="text-sm text-gray-500">
              Si el problema continúa después de un rato, puedes escribirnos a{" "}
              <a href="mailto:campanaeducativanacional@gmail.com" style={{ color: '#1E40AF', textDecoration: 'underline' }}>
                campanaeducativanacional@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      <FooterLegal />
    </>
  );
}

// NOTA: esta página es solo el contenido estático; para que se sirva automáticamente
// durante una caída (p. ej. como página de error personalizada del Worker en Cloudflare,
// o mediante un switch manual a nivel DNS) se requiere un paso de configuración adicional
// fuera de este repositorio.
