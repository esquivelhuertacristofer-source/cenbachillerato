import type { AreaConocimientoStatic } from "./types";

export const AREAS_CONOCIMIENTO: AreaConocimientoStatic[] = [
  {
    codigo: "AC-CS",
    nombre: "Ciencias Sociales",
    descripcion:
      "Analiza fenómenos sociales, económicos y políticos desde perspectivas multidisciplinarias para comprender y transformar la realidad.",
    color: "bg-orange-600",
    colorText: "text-orange-600",
    icono: "🏙️",
    orden: 1,
    semestresInicio: 3,
  },
  {
    codigo: "AC-CNT",
    nombre: "Ciencias Naturales, Experimentales y Tecnología",
    descripcion:
      "Desarrolla pensamiento científico y tecnológico a través de la experimentación, la investigación y la resolución de problemas del entorno.",
    color: "bg-green-600",
    colorText: "text-green-600",
    icono: "🔬",
    orden: 2,
    semestresInicio: 3,
  },
  {
    codigo: "AC-HUM",
    nombre: "Humanidades",
    descripcion:
      "Fomenta la reflexión filosófica, literaria y estética para el desarrollo del pensamiento crítico y la sensibilidad cultural.",
    color: "bg-violet-600",
    colorText: "text-violet-600",
    icono: "📚",
    orden: 3,
    semestresInicio: 3,
  },
];
