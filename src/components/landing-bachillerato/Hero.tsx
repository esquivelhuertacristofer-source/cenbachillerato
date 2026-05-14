import Link from "next/link";

export function HeroBachillerato() {
  return (
    <section className="bg-gradient-to-br from-cen-navy via-cen-navy-2 to-cen-blue px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cen-sky/80">
            Alineado al MCCEMS — Acuerdo 09/08/23
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cen-sky/80">
            Compatible con Modelo Educativo 2025
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cen-sky/80">
            Multi-subsistema
          </span>
        </div>

        <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
          CEN Bachillerato
          <span className="mt-2 block text-2xl font-medium text-cen-sky sm:text-3xl">
            La plataforma educativa alineada al MCCEMS
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-white/70">
          Estructura curricular, progresiones de aprendizaje, actividades pedagógicas y
          reportes institucionales para DGB, DGETI, DGETA, CONALEP, CECYT, CCH, ENP y
          bachilleratos particulares con RVOE.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/log-in"
            className="rounded-2xl bg-white px-8 py-3 text-center text-base font-bold uppercase tracking-widest text-cen-navy shadow hover:bg-cen-cool transition-all duration-300"
          >
            Acceder a la plataforma
          </Link>
          <Link
            href="#estructura"
            className="rounded-2xl border border-white/20 px-8 py-3 text-center text-base font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all duration-300"
          >
            Ver estructura MCCEMS
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { numero: "6", label: "Semestres" },
            { numero: "8", label: "Recursos Sociocognitivos" },
            { numero: "3", label: "Áreas de Conocimiento" },
            { numero: "34", label: "UAC base" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-white">{stat.numero}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cen-sky/80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
