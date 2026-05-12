import type { Metadata } from "next";
import { Header } from "@/components/shared/Header";
import { HeroCEN } from "@/components/landing-cen/Hero";
import { ProductosGrid } from "@/components/landing-cen/ProductosGrid";
import { FooterCEN } from "@/components/landing-cen/Footer";

export const metadata: Metadata = {
  title: "CEN — Campaña Educativa Nacional",
  description:
    "Plataforma educativa digital para escuelas y subsistemas del sistema educativo mexicano. Alineada al MCCEMS, NEM y marcos curriculares de la SEP.",
};

const POR_QUE_CEN = [
  {
    icono: "🏛️",
    titulo: "Alineado a la SEP",
    descripcion:
      "Cada producto está diseñado conforme a los marcos curriculares vigentes: MCCEMS (Acuerdo 09/08/23), NEM y Modelo Educativo 2025.",
  },
  {
    icono: "🏫",
    titulo: "Para escuelas y subsistemas",
    descripcion:
      "Compatible con DGB, DGETI, DGETA, CONALEP, CECYT, CCH, ENP, bachilleratos estatales, primarias, secundarias y particulares con RVOE.",
  },
  {
    icono: "🔐",
    titulo: "Seguro y privado",
    descripcion:
      "Cumplimiento estricto de la LFPDPPP. Datos de cada institución aislados. Sin acceso cruzado entre escuelas.",
  },
  {
    icono: "🚀",
    titulo: "Listo desde el inicio del ciclo",
    descripcion:
      "Alta masiva de alumnos por Excel/CSV, grupos automáticos, y estructura curricular pre-cargada desde el primer día.",
  },
];

export default function HomePage() {
  return (
    <>
      <Header variant="cen" />
      <main className="flex-1">
        <HeroCEN />

        <ProductosGrid />

        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Por qué CEN
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Tecnología educativa construida desde adentro del sistema.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {POR_QUE_CEN.map((item) => (
                <div key={item.titulo} className="text-center">
                  <div className="text-4xl">{item.icono}</div>
                  <h3 className="mt-4 text-base font-semibold text-gray-900">
                    {item.titulo}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{item.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <FooterCEN />
    </>
  );
}
