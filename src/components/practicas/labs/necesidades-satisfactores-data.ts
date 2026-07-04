/**
 * Datos del Laboratorio — Necesidades y satisfactores: materiales, personales,
 * familiares y de la comunidad (CS-II-P01, Ciencias Sociales II).
 *
 * Contenido VERBATIM de CS-II·P01 ("Identifica sus necesidades y satisfactores
 * materiales, personales, familiares y los de su comunidad"). La progresión
 * distingue dos conceptos centrales —la NECESIDAD (carencia) y el SATISFACTOR
 * (medio con que se cubre)— y los integra desde el enfoque de derechos.
 *
 * El laboratorio integra las actividades de forma fiel:
 *  - Modo 1 (clasificar): separa cada tarjeta entre NECESIDAD y SATISFACTOR. Las
 *    tarjetas se toman literalmente de las definiciones y ejemplos del glosario
 *    A5 y de las afirmaciones del quiz A4 (necesidades vitales y sus medios).
 *  - Modo 2 (emparejar necesidad ↔ satisfactor): usa los pares necesidad→medio
 *    que el propio glosario A5 enuncia en sus ejemplos.
 *  - Modo 3 (glosario): los cinco términos verbatim del glosario A5.
 *  - El cuestionario usa afirmaciones V/F verbatim de A4 (necesidades y
 *    satisfactores) y la afirmación on-topic de A2 sobre el bienestar social.
 *
 * NOTA DE FIDELIDAD: el título del propósito menciona cuatro ámbitos
 * (materiales, personales, familiares, comunidad), pero el contenido fuente
 * (A1/A4/A5) NO define esas cuatro categorías como clasificación; la distinción
 * que el contenido sí sostiene verbatim es NECESIDAD vs SATISFACTOR. Por eso el
 * Modo 1 clasifica con esa dicotomía y no se inventan los cuatro ámbitos.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Necesidad o satisfactor? (clasifica cada tarjeta)
 * ───────────────────────────────────────────────────────────────────────── */
export type Categoria = "necesidad" | "satisfactor";

export const CATEGORIA_INFO: Record<
  Categoria,
  { titulo: string; subtitulo: string; icono: string }
> = {
  necesidad: {
    titulo: "Necesidad",
    subtitulo: "Carencia o falta de algo indispensable para la vida y el desarrollo de las personas.",
    icono: "fa-hand-holding-heart",
  },
  satisfactor: {
    titulo: "Satisfactor",
    subtitulo: "Bien, servicio o relación social con el que se cubre una necesidad.",
    icono: "fa-box-open",
  },
};

export const TARJETAS: { id: string; texto: string; categoria: Categoria }[] = [
  { id: "ta-n1", texto: "La necesidad de alimentarse", categoria: "necesidad" },
  { id: "ta-n2", texto: "La necesidad de salud", categoria: "necesidad" },
  { id: "ta-n3", texto: "La necesidad de educación", categoria: "necesidad" },
  { id: "ta-n4", texto: "La necesidad de hidratación", categoria: "necesidad" },
  { id: "ta-n5", texto: "La necesidad de vivienda", categoria: "necesidad" },
  { id: "ta-s1", texto: "El alimento que cubre la necesidad de nutrición", categoria: "satisfactor" },
  { id: "ta-s2", texto: "El agua potable como medio de hidratación", categoria: "satisfactor" },
  { id: "ta-s3", texto: "El acceso a servicios de salud cuando se enferma una persona", categoria: "satisfactor" },
  { id: "ta-s4", texto: "El acceso a educación y a un ingreso suficiente", categoria: "satisfactor" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Empareja necesidad ↔ satisfactor (pares verbatim de A5/A4)
 * Cada necesidad se cubre con el medio (bien, servicio o relación) que el
 * propio glosario A5 enuncia en sus ejemplos.
 * ───────────────────────────────────────────────────────────────────────── */
export const PAREJAS: { id: string; necesidad: string; satisfactor: string; ejemplo: string }[] = [
  {
    id: "pa-nutricion",
    necesidad: "Nutrición",
    satisfactor: "El alimento",
    ejemplo: "El alimento satisface la necesidad de nutrición.",
  },
  {
    id: "pa-hidratacion",
    necesidad: "Hidratación",
    satisfactor: "El agua potable",
    ejemplo: "El agua potable como satisfactor de la necesidad de hidratación.",
  },
  {
    id: "pa-salud",
    necesidad: "Salud",
    satisfactor: "El acceso a servicios de salud",
    ejemplo: "Tener acceso a servicios de salud cuando se enferma una persona.",
  },
  {
    id: "pa-educacion",
    necesidad: "Educación",
    satisfactor: "El acceso a la escuela",
    ejemplo: "El derecho a la educación reconocido en la Constitución.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-necesidad",
    termino: "Necesidad",
    definicion: "Carencia o falta de algo indispensable para la vida y el desarrollo de las personas.",
    ejemplo: "La necesidad de alimentarse, de salud o de educación.",
  },
  {
    id: "gl-satisfactor",
    termino: "Satisfactor",
    definicion: "Bien, servicio o relación social con el que se cubre una necesidad.",
    ejemplo: "El agua potable como satisfactor de la necesidad de hidratación.",
  },
  {
    id: "gl-vitales",
    termino: "Necesidades vitales",
    definicion: "Aquellas indispensables para sobrevivir y vivir con dignidad, como alimentación, salud, vivienda y educación.",
    ejemplo: "Tener acceso a servicios de salud cuando se enferma una persona.",
  },
  {
    id: "gl-bienestar",
    termino: "Bienestar social",
    definicion: "Conjunto de condiciones que permiten a las personas vivir con dignidad y satisfacer sus necesidades.",
    ejemplo: "Acceso a salud, educación y un ingreso suficiente.",
  },
  {
    id: "gl-derechos",
    termino: "Enfoque de derechos",
    definicion: "Perspectiva que entiende el bienestar como un conjunto de derechos garantizados para todas las personas, no como un favor.",
    ejemplo: "El derecho a la educación o a la salud reconocidos en la Constitución.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (V/F de A4 verbatim + afirmación on-topic de A2).
 * Renderizado como opción doble Verdadero / Falso.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "Una necesidad es una carencia que las personas buscan satisfacer para vivir y desarrollarse.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: las necesidades motivan la búsqueda de satisfactores.",
  },
  {
    pregunta: "Un satisfactor es el medio (bien, servicio o relación) con el que se cubre una necesidad.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: por ejemplo, el alimento satisface la necesidad de nutrición.",
  },
  {
    pregunta: "El bienestar social desde el enfoque de derechos solo depende de la caridad y no de garantías para todas las personas.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "El enfoque de derechos plantea que el bienestar es una garantía exigible, no una dádiva.",
  },
  {
    pregunta: "Las necesidades vitales (alimentación, salud, vivienda, educación) se satisfacen de formas distintas según el entorno familiar y comunitario.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: las formas de satisfacerlas varían entre contextos.",
  },
  {
    pregunta: "El bienestar social solo puede medirse con indicadores económicos.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "El bienestar social incluye salud, educación, participación, seguridad y otros factores no solo económicos.",
  },
];

/** Dato verbatim del glosario A5 (definición de «Bienestar social»). */
export const DATO_NECESIDADES =
  "El bienestar social es el conjunto de condiciones que permiten a las personas vivir con dignidad y satisfacer sus necesidades. Desde el enfoque de derechos, es una garantía exigible para todas las personas, no un favor.";
