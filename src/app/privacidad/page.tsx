import type { Metadata } from "next";
import Link from "next/link";
import { FooterLegal } from "@/components/shared/FooterLegal";

export const metadata: Metadata = {
  title: "Aviso de Privacidad — CEN Bachillerato",
};

export default function PrivacidadPage() {
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
              Este Aviso de Privacidad se encuentra en proceso de revisión por el equipo legal.
              El contenido puede ser modificado antes de la publicación oficial de la plataforma.
            </p>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Aviso de Privacidad</h1>
          <p className="mt-2 text-gray-500">
            CEN — Campaña Educativa Nacional · Versión 1.0 · Fecha de última actualización: Mayo 2026
          </p>

          <div className="mt-8 space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">I. Identidad del Responsable</h2>
              <p className="mt-3">
                CEN — Campaña Educativa Nacional (en adelante &quot;CEN&quot; o &quot;el Responsable&quot;) es responsable
                del tratamiento de sus datos personales, en términos de la Ley Federal de Protección
                de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">II. Datos Personales que se Recaban</h2>
              <p className="mt-3">CEN recaba las siguientes categorías de datos personales:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li><strong>Datos de identificación:</strong> nombre completo, correo electrónico.</li>
                <li><strong>Datos académicos:</strong> semestre, área de conocimiento, institución educativa, grupo, avance curricular.</li>
                <li><strong>Datos de uso de la plataforma:</strong> progresiones visitadas, actividades realizadas, tiempo de sesión.</li>
                <li><strong>Datos de consentimiento:</strong> registro de aceptación de aviso de privacidad y términos, con marca de tiempo e IP.</li>
              </ul>
              <p className="mt-3 text-sm text-gray-500">
                No recabamos datos personales sensibles (salud, biométricos, genéticos, religiosos, políticos).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">III. Finalidades del Tratamiento</h2>
              <p className="mt-3">Sus datos personales son tratados para las siguientes finalidades primarias:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Prestación del servicio educativo digital: acceso, autenticación y personalización del aprendizaje.</li>
                <li>Seguimiento del progreso curricular y generación de reportes institucionales.</li>
                <li>Gestión de grupos, docentes y alumnos por institución.</li>
                <li>Cumplimiento de obligaciones legales y regulatorias.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">IV. Transferencias de Datos</h2>
              <p className="mt-3">
                Los datos personales no serán transferidos a terceros sin consentimiento previo, salvo los
                casos previstos en el artículo 37 de la LFPDPPP (autoridades competentes, subsistemas de
                bachillerato que contrataron el servicio, proveedores de infraestructura bajo estrictas
                obligaciones de confidencialidad).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">V. Derechos ARCO</h2>
              <p className="mt-3">
                Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse (Derechos ARCO) al
                tratamiento de sus datos personales. Para ejercerlos, envíe una solicitud a:
              </p>
              <p className="mt-2 font-medium">
                <a href="mailto:privacidad@cen.edu.mx" className="text-indigo-600 underline">
                  privacidad@cen.edu.mx
                </a>
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Responderemos a su solicitud en un plazo no mayor a 20 días hábiles conforme a la LFPDPPP.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">VI. Cambios al Aviso de Privacidad</h2>
              <p className="mt-3">
                Cualquier modificación al presente aviso se notificará a través de la plataforma y/o
                por correo electrónico al domicilio registrado. El uso continuado de la plataforma
                posterior a la notificación implica la aceptación de los cambios.
              </p>
            </section>
          </div>
        </div>
      </main>

      <FooterLegal />
    </>
  );
}
