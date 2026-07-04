/**
 * Datos del Laboratorio — Causalidad histórica (CH-I-P03).
 *
 * Contenido VERBATIM de CH-I·P03 (Conciencia Histórica I, "Nada ocurre por una
 * sola razón: multicausalidad en la historia"). Las definiciones del glosario,
 * los ejemplos históricos y las afirmaciones del cuestionario se toman
 * literalmente de las actividades A1 (lectura), A2 (quiz), A4 (V/F), A5
 * (glosario) y A6 (fill_blanks). Los ejemplos a clasificar son casos históricos
 * que las propias actividades clasifican explícitamente.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Qué tipo de causa? (estructural · coyuntural · consecuencia)
 * ───────────────────────────────────────────────────────────────────────── */
export type TipoCausa = "estructural" | "coyuntural" | "consecuencia";

export const TIPO_CAUSA_INFO: Record<
  TipoCausa,
  { titulo: string; subtitulo: string; icono: string }
> = {
  estructural: {
    titulo: "Causa estructural",
    subtitulo: "Condición profunda y duradera que crea el terreno propicio para un evento. Opera a largo plazo.",
    icono: "fa-layer-group",
  },
  coyuntural: {
    titulo: "Causa coyuntural",
    subtitulo: "Evento o circunstancia inmediata que actúa como detonante de un proceso ya condicionado.",
    icono: "fa-bolt",
  },
  consecuencia: {
    titulo: "Consecuencia",
    subtitulo: "Efecto o resultado de un evento o proceso histórico, inmediato o de largo plazo.",
    icono: "fa-arrow-trend-up",
  },
};

export const CAUSAS: { id: string; texto: string; tipo: TipoCausa }[] = [
  { id: "ca-e1", texto: "La concentración de tierras en haciendas y el despojo de tierras comunales indígenas durante el porfiriato", tipo: "estructural" },
  { id: "ca-e2", texto: "La dictadura de Porfirio Díaz, que concentró el poder y eliminó la competencia electoral", tipo: "estructural" },
  { id: "ca-e3", texto: "La desigualdad colonial y las ideas de la Ilustración antes de la Independencia", tipo: "estructural" },
  { id: "ca-c1", texto: "El Plan de San Luis Potosí de Madero, que llamó a levantarse el 20 de noviembre de 1910", tipo: "coyuntural" },
  { id: "ca-c2", texto: "El asesinato del archiduque Francisco Fernando en Sarajevo (1914)", tipo: "coyuntural" },
  { id: "ca-c3", texto: "La invasión napoleónica a España y la crisis de la monarquía", tipo: "coyuntural" },
  { id: "ca-k1", texto: "La Constitución de 1917 tras la Revolución Mexicana", tipo: "consecuencia" },
  { id: "ca-k2", texto: "La reforma agraria y el Estado mexicano posrevolucionario", tipo: "consecuencia" },
  { id: "ca-k3", texto: "La formación de una identidad nacional tras la Revolución Mexicana", tipo: "consecuencia" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — ¿Monocausal o multicausal? (detecta el error de explicación)
 * ───────────────────────────────────────────────────────────────────────── */
export type TipoExplicacion = "monocausal" | "multicausal";

export const EXPLICACION_INFO: Record<
  TipoExplicacion,
  { titulo: string; subtitulo: string; icono: string }
> = {
  monocausal: {
    titulo: "Monocausal (error)",
    subtitulo: "Explica un evento con una sola causa. Simplifica la realidad y oculta la complejidad de los procesos.",
    icono: "fa-circle-exclamation",
  },
  multicausal: {
    titulo: "Multicausal (correcto)",
    subtitulo: "Reconoce múltiples causas de distinta naturaleza y alcance temporal que interactúan entre sí.",
    icono: "fa-circle-check",
  },
};

export const EXPLICACIONES: { id: string; texto: string; tipo: TipoExplicacion }[] = [
  { id: "ex-m1", texto: "La Revolución estalló solo porque Madero la convocó", tipo: "monocausal" },
  { id: "ex-m2", texto: "La Independencia se debió exclusivamente a que Hidalgo tocó la campana el 16 de septiembre de 1810", tipo: "monocausal" },
  { id: "ex-m3", texto: "La única causa real de la Conquista fue la superioridad tecnológica española (armas, caballos)", tipo: "monocausal" },
  { id: "ex-m4", texto: "La Independencia fue causada únicamente por la influencia de la Revolución Francesa en las élites criollas", tipo: "monocausal" },
  { id: "ex-u1", texto: "La Independencia combinó causas estructurales (desigualdad colonial, Ilustración), coyunturales (invasión napoleónica) y contingentes (la conspiración de Querétaro)", tipo: "multicausal" },
  { id: "ex-u2", texto: "La Revolución Mexicana tuvo causas políticas, económicas, sociales y culturales entrelazadas", tipo: "multicausal" },
  { id: "ex-u3", texto: "La Conquista combinó condiciones estructurales (fragmentación política mesoamericana) y un detonante contingente (la llegada de Cortés con aliados)", tipo: "multicausal" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-causalidad",
    termino: "Causalidad histórica",
    definicion: "Relación de causa y efecto entre fenómenos históricos: las causas son condiciones o eventos anteriores que generan o posibilitan nuevos eventos o procesos.",
    ejemplo: "Las causas de la Primera Guerra Mundial incluyen el sistema de alianzas, el nacionalismo, el imperialismo y el asesinato del archiduque Francisco Fernando.",
  },
  {
    id: "gl-multicausalidad",
    termino: "Multicausalidad",
    definicion: "Principio que reconoce que los eventos históricos son resultado de múltiples causas de distinta naturaleza (política, económica, social, cultural) que interactúan entre sí.",
    ejemplo: "La Revolución Mexicana no tuvo una sola causa; fue producto de la dictadura porfirista, la desigualdad agraria, el caudillismo y el anarquismo.",
  },
  {
    id: "gl-estructural",
    termino: "Causa estructural",
    definicion: "Condición profunda y duradera —política, económica, social o cultural— que crea el terreno propicio para que un evento ocurra. Opera a largo plazo.",
    ejemplo: "La desigualdad extrema entre las clases sociales en el Porfiriato fue una causa estructural de la Revolución Mexicana.",
  },
  {
    id: "gl-coyuntural",
    termino: "Causa coyuntural",
    definicion: "Evento o circunstancia inmediata que actúa como detonante o catalizador de un proceso ya condicionado por causas estructurales.",
    ejemplo: "El asesinato del archiduque Francisco Fernando en Sarajevo (1914) fue la causa coyuntural que detonó la Primera Guerra Mundial.",
  },
  {
    id: "gl-consecuencia",
    termino: "Consecuencia histórica",
    definicion: "Efecto o resultado de un evento o proceso histórico, que puede ser inmediato o de largo plazo, intencionado o no previsto por los actores.",
    ejemplo: "Consecuencias de la Revolución Mexicana: la Constitución de 1917, la reforma agraria y el Estado mexicano posrevolucionario.",
  },
  {
    id: "gl-agencia",
    termino: "Agencia histórica",
    definicion: "Capacidad de los actores históricos (individuos, grupos, movimientos) para tomar decisiones y actuar, influyendo en el curso de los eventos históricos.",
    ejemplo: "La agencia de Emiliano Zapata —su liderazgo y el Plan de Ayala— fue fundamental para que la demanda agraria fuera un eje de la Revolución.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (V/F de A4, verbatim).
 * Renderizado como opción doble Verdadero / Falso.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "La multicausalidad histórica reconoce que los eventos y procesos históricos son resultado de múltiples causas simultáneas, no de una sola causa aislada.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La historiografía contemporánea rechaza el monocausalismo: la Revolución Mexicana tuvo causas políticas, económicas, sociales y culturales entrelazadas.",
  },
  {
    pregunta: "En historia, las causas y las consecuencias de un evento son siempre simultáneas: ocurren al mismo tiempo.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. Las causas preceden al evento y las consecuencias lo suceden; un mismo evento puede tener consecuencias inmediatas, de mediano plazo y de larga duración.",
  },
  {
    pregunta: "Distinguir entre causas estructurales y causas coyunturales ayuda a comprender mejor los procesos históricos complejos.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. Las estructurales son profundas y de larga duración; las coyunturales son detonantes inmediatos. Ambas son necesarias para explicar un evento.",
  },
  {
    pregunta: "La relación causa-efecto en historia es siempre determinista: una misma causa produce inevitablemente el mismo efecto en cualquier contexto.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. La historia no es determinista. Las mismas condiciones en contextos distintos pueden producir resultados diferentes según la agencia humana y las contingencias.",
  },
  {
    pregunta: "El análisis de las consecuencias de un evento histórico puede revelar efectos no intencionados que los actores originales no previeron.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La historia está llena de consecuencias no deseadas: la Revolución Industrial trajo mejoras materiales pero también contaminación y crisis sociales imprevistas.",
  },
];

/** Dato verbatim de la lectura A1. */
export const DATO_CAUSALIDAD =
  "El monocausalismo —la tendencia a explicar un evento histórico con una sola causa— es un error frecuente porque simplifica la realidad y hace invisible la complejidad de los procesos sociales.";
