import Link from "next/link";

export function HeroBachillerato() {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
            Alineado al MCCEMS — Acuerdo 09/08/23
          </span>
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
            Compatible con Modelo Educativo 2025
          </span>
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
            Multi-subsistema
          </span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          CEN Bachillerato
          <span className="mt-2 block text-2xl font-normal text-indigo-300 sm:text-3xl">
            La plataforma educativa alineada al MCCEMS
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-indigo-100">
          Estructura curricular, progresiones de aprendizaje, actividades pedagógicas y
          reportes institucionales para DGB, DGETI, DGETA, CONALEP, CECYT, CCH, ENP y
          bachilleratos particulares con RVOE.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/log-in"
            className="rounded-xl bg-white px-8 py-3 text-center text-base font-semibold text-indigo-700 shadow hover:bg-indigo-50"
          >
            Acceder a la plataforma
          </Link>
          <Link
            href="#estructura"
            className="rounded-xl border border-white/30 px-8 py-3 text-center text-base font-semibold text-white hover:bg-white/10"
          >
            Ver estructura MCCEMS
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { numero: "6", label: "Semestres" },
            { numero: "5", label: "Recursos Sociocognitivos" },
            { numero: "3", label: "Áreas de Conocimiento" },
            { numero: "30+", label: "UAC base" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white">{stat.numero}</div>
              <div className="mt-1 text-sm text-indigo-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
