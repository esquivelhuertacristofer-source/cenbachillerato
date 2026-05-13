import type { RecursoSociocognitivoStatic } from "./types";

export const RECURSOS_SOCIOCOGNITIVOS: RecursoSociocognitivoStatic[] = [
  {
    codigo: "RSC-LC",
    nombre: "Lengua y Comunicación",
    descripcion:
      "Desarrolla competencias comunicativas orales, escritas y digitales en contextos académicos y sociales.",
    color: "bg-blue-600",
    colorText: "text-blue-600",
    icono: "📝",
    orden: 1,
    semestres: [1, 2, 3, 4, 5, 6],
  },
  {
    codigo: "RSC-PM",
    nombre: "Pensamiento Matemático",
    descripcion:
      "Fomenta el razonamiento lógico, cuantitativo y espacial para resolver problemas en contextos reales.",
    color: "bg-purple-600",
    colorText: "text-purple-600",
    icono: "🔢",
    orden: 2,
    semestres: [1, 2, 3, 4, 5, 6],
  },
  {
    codigo: "RSC-IN",
    nombre: "Inglés",
    descripcion:
      "Fortalece la competencia comunicativa en inglés para contextos académicos y laborales globales.",
    color: "bg-red-600",
    colorText: "text-red-600",
    icono: "🌐",
    orden: 3,
    semestres: [1, 2, 3, 4],
  },
  {
    codigo: "RSC-CD",
    nombre: "Cultura Digital",
    descripcion:
      "Desarrolla competencias para el uso ético, crítico y creativo de tecnologías digitales.",
    color: "bg-teal-600",
    colorText: "text-teal-600",
    icono: "💻",
    orden: 4,
    semestres: [1, 2, 6],
  },
  {
    codigo: "RSC-CH",
    nombre: "Conciencia Histórica",
    descripcion:
      "Analiza procesos históricos para comprender el presente y proyectar el futuro con sentido crítico.",
    color: "bg-amber-600",
    colorText: "text-amber-600",
    icono: "🏛️",
    orden: 5,
    semestres: [4, 5, 6],
  },
  {
    codigo: "RSC-CS",
    nombre: "Ciencias Sociales",
    descripcion:
      "Analiza fenómenos sociales, económicos y políticos desde perspectivas multidisciplinarias para comprender y transformar la realidad.",
    color: "bg-orange-600",
    colorText: "text-orange-600",
    icono: "🏙️",
    orden: 6,
    semestres: [1, 2, 4],
  },
  {
    codigo: "RSC-HUM",
    nombre: "Humanidades",
    descripcion:
      "Fomenta la reflexión filosófica, literaria y estética para el pensamiento crítico y la sensibilidad cultural.",
    color: "bg-violet-600",
    colorText: "text-violet-600",
    icono: "📚",
    orden: 7,
    semestres: [1, 2, 3],
  },
  {
    codigo: "RSC-CNEYT",
    nombre: "Ciencias Naturales, Experimentales y Tecnología",
    descripcion:
      "Desarrolla pensamiento científico y tecnológico a través de la experimentación, la investigación y la resolución de problemas del entorno.",
    color: "bg-green-600",
    colorText: "text-green-600",
    icono: "🔬",
    orden: 8,
    semestres: [1, 2, 3, 4, 5, 6],
  },
];

export function getRecursosSociocognitivosPorSemestre(
  semestre: number
): RecursoSociocognitivoStatic[] {
  return RECURSOS_SOCIOCOGNITIVOS.filter((r) =>
    r.semestres.includes(semestre)
  );
}
