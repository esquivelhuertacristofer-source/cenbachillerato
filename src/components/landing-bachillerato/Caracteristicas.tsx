const CARACTERISTICAS = [
  {
    icono: "🏫",
    titulo: "Multi-tenant por escuela",
    descripcion: "Cada institución tiene su propio espacio aislado con control de alumnos, docentes y grupos.",
  },
  {
    icono: "📊",
    titulo: "Dashboard docente",
    descripcion: "Seguimiento en tiempo real del progreso de alumnos por UAC, progresión y grupo.",
  },
  {
    icono: "📋",
    titulo: "Reportes institucionales",
    descripcion: "Generación de reportes en los formatos requeridos por la SEP y cada subsistema.",
  },
  {
    icono: "📥",
    titulo: "Alta masiva Excel/CSV",
    descripcion: "Carga de alumnos y docentes por lotes desde el inicio del ciclo escolar.",
  },
  {
    icono: "🔐",
    titulo: "LFPDPPP + INAI",
    descripcion: "Gestión de datos personales conforme a la Ley Federal de Protección de Datos.",
  },
  {
    icono: "🎯",
    titulo: "Propósitos formativos",
    descripcion: "Estructura pedagógica UAC → Propósito formativo → Actividad, alineada al Marco Curricular Común 2025.",
  },
  {
    icono: "📱",
    titulo: "Responsive y accesible",
    descripcion: "Funciona en computadora, tablet y teléfono. Accesible para alumnos en cualquier dispositivo.",
  },
  {
    icono: "🔄",
    titulo: "Ciclos escolares",
    descripcion: "Gestión de ciclos, semestres y grupos. Histórico de avance por alumno.",
  },
];

export function Caracteristicas() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Características de la plataforma
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Diseñada para el contexto real de la educación pública mexicana
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {CARACTERISTICAS.map((c) => (
            <div key={c.titulo} className="text-center sm:text-left">
              <div className="text-3xl">{c.icono}</div>
              <h3 className="mt-3 font-semibold text-gray-900">{c.titulo}</h3>
              <p className="mt-2 text-sm text-gray-500">{c.descripcion}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="/log-in"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white hover:bg-indigo-700"
          >
            Acceder a la plataforma
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
