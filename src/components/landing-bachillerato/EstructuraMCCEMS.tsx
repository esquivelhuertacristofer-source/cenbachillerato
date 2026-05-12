import { RECURSOS_SOCIOCOGNITIVOS } from "@/lib/mccems/recursos-sociocognitivos";
import { AREAS_CONOCIMIENTO } from "@/lib/mccems/areas-conocimiento";
import { RECURSOS_SOCIOEMOCIONALES } from "@/lib/mccems/estructura";

export function EstructuraMCCEMS() {
  return (
    <section
      id="estructura"
      className="bg-white px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Estructura Curricular MCCEMS
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Marco Curricular Común de la Educación Media Superior — Acuerdo 09/08/23
          </p>
        </div>

        {/* Recursos Sociocognitivos */}
        <div className="mt-16">
          <div className="mb-2 inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700">
            Currículum Fundamental
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Recursos Sociocognitivos
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Transversales • Semestres 1-6 • Obligatorios para todos los subsistemas
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {RECURSOS_SOCIOCOGNITIVOS.map((recurso) => (
              <div
                key={recurso.codigo}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div
                  className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${recurso.color} bg-opacity-15`}
                  style={{ backgroundColor: `${recurso.color.replace("bg-", "")}20` }}
                >
                  {recurso.icono}
                </div>
                <h4 className="text-sm font-semibold text-gray-900">
                  {recurso.nombre}
                </h4>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  {recurso.descripcion}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {recurso.semestres.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      S{s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Áreas de Conocimiento */}
        <div className="mt-16">
          <div className="mb-2 inline-block rounded-full bg-purple-100 px-4 py-1.5 text-sm font-semibold text-purple-700">
            Currículum Fundamental Extendido
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Áreas de Conocimiento
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Semestres 3-6 • El alumno elige UNA área según su vocación e institución
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {AREAS_CONOCIMIENTO.map((area) => (
              <div
                key={area.codigo}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-2xl bg-gray-50">
                  {area.icono}
                </div>
                <h4 className="font-semibold text-gray-900">{area.nombre}</h4>
                <p className="mt-2 text-sm text-gray-500">{area.descripcion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recursos Socioemocionales */}
        <div className="mt-16">
          <div className="mb-2 inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
            Currículum Ampliado
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Recursos Socioemocionales y Ámbitos de Formación
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Transversales • Todos los semestres • Desarrollo integral del alumno
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {RECURSOS_SOCIOEMOCIONALES.map((recurso) => (
              <div
                key={recurso.codigo}
                className="flex items-start gap-4 rounded-xl border border-green-100 bg-green-50 p-5"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900">{recurso.nombre}</h4>
                  <p className="mt-1 text-sm text-green-700">{recurso.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagrama de semestres */}
        <div className="mt-16">
          <h3 className="text-xl font-bold text-gray-900">
            Distribución por Semestre
          </h3>

          <div className="mt-6 overflow-x-auto">
            <div className="flex min-w-max gap-3">
              {[1, 2, 3, 4, 5, 6].map((sem) => (
                <div
                  key={sem}
                  className="flex w-40 flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div className="text-center font-bold text-gray-900">
                    Semestre {sem}
                  </div>
                  {RECURSOS_SOCIOCOGNITIVOS.filter((r) =>
                    r.semestres.includes(sem)
                  ).map((r) => (
                    <span
                      key={r.codigo}
                      className="rounded-lg bg-indigo-50 px-2 py-1 text-center text-xs text-indigo-700"
                    >
                      {r.nombre.split(" ")[0]} {r.nombre.split(" ")[1] ?? ""}
                    </span>
                  ))}
                  {sem >= 3 && (
                    <span className="rounded-lg bg-purple-50 px-2 py-1 text-center text-xs text-purple-700">
                      Área de Conocimiento
                    </span>
                  )}
                  <span className="rounded-lg bg-green-50 px-2 py-1 text-center text-xs text-green-700">
                    RSE (Transversal)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
