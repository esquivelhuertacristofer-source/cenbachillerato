/**
 * Tipos de recurso (actividad) — metadata para la UI del Centro de Recursos.
 * Las claves coinciden EXACTAMENTE con `actividades.tipo` en la DB (los 12
 * tipos canónicos de `src/types/activities.ts`). Cada tipo real tiene su
 * etiqueta/ícono/color: así ninguno cae en el fallback "Otros".
 * NO se renderiza un tipo con conteo 0 — nada de chips vacíos.
 */

export interface TipoRecursoMeta {
  tipo: string;
  /** Etiqueta plural para chips/filtros (p. ej. "Lecturas"). */
  label: string;
  /** Etiqueta singular para una tarjeta (p. ej. "Lectura"). */
  singular: string;
  icon: string;
  color: string;
}

export const TIPOS_RECURSO: TipoRecursoMeta[] = [
  { tipo: "lectura",              label: "Lecturas",        singular: "Lectura",        icon: "fa-book-open",            color: "#7DD3FC" },
  { tipo: "infografia",          label: "Infografías",     singular: "Infografía",     icon: "fa-chart-simple",         color: "#F472B6" },
  { tipo: "video_con_preguntas", label: "Videos",          singular: "Video",          icon: "fa-circle-play",          color: "#F87171" },
  { tipo: "reflexion_escrita",   label: "Reflexiones",     singular: "Reflexión",      icon: "fa-pen-nib",              color: "#A78BFA" },
  { tipo: "quiz_multiple_opcion", label: "Quizzes",         singular: "Quiz",           icon: "fa-circle-question",      color: "#D4A574" },
  { tipo: "quiz_verdadero_falso", label: "Verdadero/Falso", singular: "Verdadero/Falso", icon: "fa-circle-half-stroke",  color: "#FBBF24" },
  { tipo: "ejercicio_matematico", label: "Ejercicios",      singular: "Ejercicio",      icon: "fa-square-root-variable", color: "#34D399" },
  { tipo: "fill_blanks",         label: "Completar",       singular: "Completar",      icon: "fa-pen-fancy",            color: "#38BDF8" },
  { tipo: "glosario_interactivo", label: "Glosarios",       singular: "Glosario",       icon: "fa-spell-check",          color: "#818CF8" },
  { tipo: "autoevaluacion",      label: "Autoevaluación",  singular: "Autoevaluación", icon: "fa-clipboard-check",      color: "#2DD4BF" },
  { tipo: "simulacion",          label: "Simulaciones",    singular: "Simulación",     icon: "fa-flask",                color: "#A3E635" },
  { tipo: "debate_estructurado", label: "Debates",         singular: "Debate",         icon: "fa-comments",             color: "#FB923C" },
];

const FALLBACK: TipoRecursoMeta = {
  tipo: "otro",
  label: "Otros",
  singular: "Recurso",
  icon: "fa-shapes",
  color: "#94A3B8",
};

/** Orden canónico de los tipos para listas/chips. */
export const ORDEN_TIPOS = TIPOS_RECURSO.map((t) => t.tipo);

export function getTipoRecursoMeta(tipo: string): TipoRecursoMeta {
  return TIPOS_RECURSO.find((t) => t.tipo === tipo) ?? { ...FALLBACK, tipo };
}
