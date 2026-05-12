import type { Metadata } from "next";
import Link from "next/link";
import { FooterLegal } from "@/components/shared/FooterLegal";

export const metadata: Metadata = {
  title: "Términos de Uso — CEN Bachillerato",
};

export default function TerminosPage() {
  return (
    <>
      <header className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-xl font-bold text-indigo-700">CEN</Link>
        </div>
      </header>

      <main className="flex-1 bg-white px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Banner de revisión legal */}
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-800">
              ⚠️ Documento en revisión legal
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Estos Términos de Uso se encuentran en proceso de revisión por el equipo legal.
              El contenido puede ser modificado antes de la publicación oficial de la plataforma.
            </p>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Términos de Uso</h1>
          <p className="mt-2 text-gray-500">
            CEN — Campaña Educativa Nacional · Versión 1.0 · Fecha de última actualización: Mayo 2026
          </p>

          <div className="mt-8 space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">1. Aceptación de los Términos</h2>
              <p className="mt-3">
                Al acceder y usar la plataforma CEN Bachillerato, usted acepta estar vinculado por estos
                Términos de Uso, el Aviso de Privacidad y cualquier política adicional publicada en la
                plataforma. Si no está de acuerdo con alguno de estos términos, no use la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">2. Descripción del Servicio</h2>
              <p className="mt-3">
                CEN Bachillerato es una plataforma educativa digital diseñada para alumnos, docentes y
                administradores de instituciones de educación media superior en México. La plataforma
                ofrece acceso a contenidos pedagógicos alineados al MCCEMS (Acuerdo 09/08/23) y al
                Modelo Educativo 2025 de la SEP.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">3. Uso Permitido</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Acceder a contenidos educativos asignados por su institución.</li>
                <li>Completar actividades y progresiones de aprendizaje.</li>
                <li>Consultar su progreso académico dentro de la plataforma.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">4. Uso Prohibido</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Compartir sus credenciales de acceso con terceros.</li>
                <li>Intentar acceder a datos de otros usuarios o instituciones.</li>
                <li>Realizar ingeniería inversa, scraping o cualquier extracción automatizada de contenidos.</li>
                <li>Usar la plataforma para fines distintos a los educativos autorizados.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">5. Propiedad Intelectual</h2>
              <p className="mt-3">
                Todos los contenidos de la plataforma (textos, materiales pedagógicos, estructura
                curricular, software) son propiedad de CEN o de sus licenciantes. Queda prohibida su
                reproducción, distribución o uso comercial sin autorización expresa por escrito.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">6. Limitación de Responsabilidad</h2>
              <p className="mt-3">
                CEN no garantiza la disponibilidad ininterrumpida de la plataforma. No será responsable
                por daños indirectos, incidentales o consecuentes derivados del uso o imposibilidad de
                uso del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">7. Ley Aplicable</h2>
              <p className="mt-3">
                Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier
                controversia se someterá a los tribunales competentes de la Ciudad de México.
              </p>
            </section>
          </div>
        </div>
      </main>

      <FooterLegal />
    </>
  );
}
