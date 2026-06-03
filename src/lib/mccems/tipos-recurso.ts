/**
 * Tipos de recurso (actividad) — metadata para la UI del Centro de Recursos.
 * Las claves coinciden con `actividades.tipo` en la DB.
 * Tipos sin contenido real hoy (video, imagen) quedan declarados para que,
 * en cuanto se agreguen recursos, el chip aparezca solo. NO se renderiza un
 * tipo con conteo 0 — nada de pestañas vacías.
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
  { tipo: "lectura",              label: "Lecturas",    singular: "Lectura",    icon: "fa-book-open",            color: "#7DD3FC" },
  { tipo: "reflexion_escrita",   label: "Reflexiones", singular: "Reflexión",  icon: "fa-pen-nib",              color: "#A78BFA" },
  { tipo: "quiz_multiple_opcion", label: "Quizzes",     singular: "Quiz",       icon: "fa-circle-question",      color: "#D4A574" },
  { tipo: "ejercicio_matematico", label: "Ejercicios",  singular: "Ejercicio",  icon: "fa-square-root-variable", color: "#34D399" },
  { tipo: "fill_blanks",         label: "Completar",   singular: "Completar",  icon: "fa-pen-fancy",            color: "#38BDF8" },
  { tipo: "debate_estructurado", label: "Debates",     singular: "Debate",     icon: "fa-comments",             color: "#FB923C" },
  // ── Futuros (aparecen solos cuando haya contenido) ──
  { tipo: "video",               label: "Videos",      singular: "Video",      icon: "fa-play",                 color: "#F87171" },
  { tipo: "imagen",              label: "Imágenes",    singular: "Imagen",     icon: "fa-image",                color: "#2DD4BF" },
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
