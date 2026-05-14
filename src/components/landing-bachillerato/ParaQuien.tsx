const SUBSISTEMAS = [
  { codigo: "DGB", nombre: "Dirección General de Bachillerato", descripcion: "Bachillerato general federal y estatal" },
  { codigo: "DGETI", nombre: "DGETI", descripcion: "Bachillerato tecnológico industrial y de servicios" },
  { codigo: "DGETA", nombre: "DGETA", descripcion: "Bachillerato tecnológico agropecuario" },
  { codigo: "CONALEP", nombre: "CONALEP", descripcion: "Colegio Nacional de Educación Profesional Técnica" },
  { codigo: "CECYT", nombre: "CECyT / IPN", descripcion: "Centros de estudios científicos y tecnológicos" },
  { codigo: "CCH", nombre: "CCH — UNAM", descripcion: "Colegio de Ciencias y Humanidades" },
  { codigo: "ENP", nombre: "ENP — UNAM", descripcion: "Escuela Nacional Preparatoria" },
  { codigo: "BGE", nombre: "Bachilleratos Estatales", descripcion: "Subsistemas estatales descentralizados" },
  { codigo: "EMSAD", nombre: "EMSAD", descripcion: "Educación Media Superior a Distancia" },
  { codigo: "particular", nombre: "Particulares con RVOE", descripcion: "Instituciones privadas con Reconocimiento de Validez Oficial" },
];

export function ParaQuien() {
  return (
    <section id="para-quien" className="bg-cen-bg px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-cen-navy sm:text-4xl">
            Para quién es CEN Bachillerato
          </h2>
          <p className="mt-4 text-lg text-ink-60">
            Compatible con todos los subsistemas que operan bajo el MCCEMS
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBSISTEMAS.map((sub) => (
            <div
              key={sub.codigo}
              className="flex items-start gap-4 rounded-2xl border border-ink-10 bg-white p-5 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cen-navy text-[10px] font-black text-white">
                {sub.codigo.substring(0, 3)}
              </div>
              <div>
                <h3 className="font-bold text-cen-navy">{sub.nombre}</h3>
                <p className="mt-1 text-sm text-ink-60">{sub.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[2.5rem] bg-gradient-to-br from-cen-navy to-cen-blue p-8 text-center text-white">
          <h3 className="text-2xl font-black uppercase tracking-tight">
            Multi-tenant desde el primer día
          </h3>
          <p className="mt-3 text-white/70">
            Cada escuela opera en su propio espacio aislado. Los datos de una institución
            nunca son visibles para otra. Compatible con CCT, RVOE y estructuras
            orgánicas de cualquier subsistema.
          </p>
        </div>
      </div>
    </section>
  );
}
