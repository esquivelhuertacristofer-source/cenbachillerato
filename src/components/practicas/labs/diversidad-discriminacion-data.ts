/**
 * Datos del Laboratorio — Diversidad cultural, organización social y
 * discriminación (CS-II-P02, Ciencias Sociales II).
 *
 * Contenido VERBATIM de CS-II·P02 ("Características y formas de organización
 * social; diversidad cultural y discriminación"). Las definiciones del glosario,
 * los ejemplos y las afirmaciones del cuestionario se toman literalmente de las
 * actividades A1 (infografía), A2 (quiz), A4 (V/F) y A5 (glosario).
 *
 *  - Clasificar: ¿forma de organización social o manifestación de
 *    discriminación? A4 establece textualmente que «la subordinación, la
 *    exclusión y la dominación son manifestaciones de la discriminación»; A1
 *    enumera las formas de organización social (familia, comunidad, clase
 *    social, sociedad civil, movimientos sociales, corporativismo).
 *  - Conceptos: empareja cada concepto de A2 con la idea clave que lo define
 *    (verbatim de las retroalimentaciones de A2).
 *  - Glosario (A5, verbatim): término ↔ definición.
 *  - Cuestionario: las cuatro afirmaciones V/F de A4 (verbatim).
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Organización social o discriminación? (clasifica por categoría)
 * ───────────────────────────────────────────────────────────────────────── */
export type Categoria = "organizacion" | "discriminacion";

export const CATEGORIA_INFO: Record<
  Categoria,
  { titulo: string; subtitulo: string; icono: string }
> = {
  organizacion: {
    titulo: "Forma de organización social",
    subtitulo: "Patrón estructurado mediante el cual los grupos humanos coordinan actividades, distribuyen recursos y ejercen poder: familia, comunidad, clase social, sociedad civil, movimientos sociales.",
    icono: "fa-people-group",
  },
  discriminacion: {
    titulo: "Manifestación de discriminación",
    subtitulo: "Trato desigual e injusto que produce exclusión y desigualdad en el acceso a derechos. Opera mediante la subordinación, la exclusión y la dominación.",
    icono: "fa-ban",
  },
};

export const TARJETAS: { id: string; texto: string; categoria: Categoria }[] = [
  { id: "ta-o1", texto: "La familia y el hogar", categoria: "organizacion" },
  { id: "ta-o2", texto: "La comunidad y el barrio (asamblea, sistema de cargos, tequio)", categoria: "organizacion" },
  { id: "ta-o3", texto: "Las clases sociales", categoria: "organizacion" },
  { id: "ta-o4", texto: "La sociedad civil organizada (OSC, sindicatos)", categoria: "organizacion" },
  { id: "ta-o5", texto: "Los movimientos sociales", categoria: "organizacion" },
  { id: "ta-d1", texto: "La subordinación", categoria: "discriminacion" },
  { id: "ta-d2", texto: "La exclusión", categoria: "discriminacion" },
  { id: "ta-d3", texto: "La dominación", categoria: "discriminacion" },
  { id: "ta-d4", texto: "El racismo", categoria: "discriminacion" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Conceptos clave (empareja concepto → idea, verbatim de A2)
 * ───────────────────────────────────────────────────────────────────────── */
export const CONCEPTOS: { id: string; concepto: string; idea: string; ejemplo: string }[] = [
  {
    id: "co-osc",
    concepto: "Organización de la sociedad civil (OSC)",
    idea: "Organización formal y registrada; estructurada de manera estable.",
    ejemplo: "México tiene más de 45,000 OSC registradas en el RFOSC.",
  },
  {
    id: "co-movimiento",
    concepto: "Movimiento social",
    idea: "Acción colectiva más flexible: proceso de movilización para transformar normas y estructuras.",
    ejemplo: "El movimiento feminista #NiUnaMenos.",
  },
  {
    id: "co-tequio",
    concepto: "Tequio",
    idea: "Trabajo comunitario no remunerado basado en la reciprocidad, para el bien común.",
    ejemplo: "Una práctica comunitaria indígena de trabajo colectivo.",
  },
  {
    id: "co-capital",
    concepto: "Capital social",
    idea: "Las redes de confianza y relaciones que permiten resolver problemas colectivos.",
    ejemplo: "Los lazos de confianza y reciprocidad que facilitan la cooperación comunitaria.",
  },
  {
    id: "co-sindicato",
    concepto: "Movimiento sindical",
    idea: "Ha conquistado derechos como el salario mínimo, la jornada de 8 horas y las vacaciones.",
    ejemplo: "Los sindicatos lograron derechos laborales que hoy son ley.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-comunitaria",
    termino: "Organización comunitaria",
    definicion: "Forma en que las personas de una comunidad se agrupan y cooperan para resolver asuntos comunes.",
    ejemplo: "Una asamblea de vecinos o un tequio para una obra del barrio.",
  },
  {
    id: "gl-diversidad",
    termino: "Diversidad cultural",
    definicion: "Coexistencia de distintas culturas, lenguas, tradiciones y formas de vida en una sociedad.",
    ejemplo: "Los pueblos originarios con sus propias lenguas y costumbres en México.",
  },
  {
    id: "gl-discriminacion",
    termino: "Discriminación",
    definicion: "Trato desigual e injusto hacia una persona o grupo por características como origen, color de piel, género o creencias.",
    ejemplo: "Negar un empleo por la apariencia o el origen de alguien.",
  },
  {
    id: "gl-racismo",
    termino: "Racismo",
    definicion: "Forma de discriminación que considera superiores a unas personas sobre otras por su origen étnico o color de piel.",
    ejemplo: "Burlas o exclusión hacia personas por su tono de piel.",
  },
  {
    id: "gl-exclusion",
    termino: "Exclusión social",
    definicion: "Proceso por el cual a ciertas personas o grupos se les impide participar plenamente en la sociedad.",
    ejemplo: "Comunidades sin acceso a servicios o sin representación.",
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
    pregunta: "La organización comunitaria, familiar y personal forma parte de las maneras en que la sociedad se estructura.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: son distintas formas de organización social.",
  },
  {
    pregunta: "La diversidad cultural es una característica de las sociedades y enriquece la vida en común.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: distintas culturas, lenguas y formas de vida conviven en la sociedad.",
  },
  {
    pregunta: "El racismo y la discriminación no afectan el acceso a derechos y oportunidades de las personas.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Sí afectan: producen exclusión y desigualdad en el acceso a derechos.",
  },
  {
    pregunta: "La subordinación, la exclusión y la dominación son manifestaciones de la discriminación.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: son formas en que opera la discriminación en la sociedad.",
  },
];

/** Dato verbatim de la infografía A1 (glosario «Coeficiente de Gini»). */
export const DATO_DIVERSIDAD =
  "México tiene un coeficiente de Gini de 0.427 (2022), entre los más altos de los países de la OCDE: el 10% más rico concentra el 59.1% del ingreso, mientras el 50% más pobre accede al 4.7%.";
