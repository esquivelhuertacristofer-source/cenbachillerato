/**
 * Datos del Laboratorio — Rules: Must, Mustn't and Have To
 * (IN-III-P05, Inglés III).
 *
 * Contenido VERBATIM de IN-III·P05 ("Rules: Must, Mustn't and Have To"). Las
 * oraciones a clasificar son los ejemplos LITERALES de la lectura A1; los huecos
 * a completar se construyen sobre esos mismos ejemplos (la respuesta es siempre
 * la forma modal verbatim de A1); el glosario es el de A5; y el cuestionario es
 * el V/F de A4 (verbatim). Los distractores del modo «completar» son formas
 * gramaticalmente incorrectas que la propia lectura/quiz señala como erróneas
 * (p. ej. «musts», «have», «has») para reforzar la regla.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — Obligation, prohibition or no obligation? (clasifica por modal)
 * Las cuatro formas que A1 distingue explícitamente:
 *  · must            → obligación / regla fuerte
 *  · mustn't         → prohibición (no está permitido)
 *  · have to         → obligación externa / necesidad
 *  · don't have to   → no obligación (es opcional)
 * ───────────────────────────────────────────────────────────────────────── */
export type Modal = "must" | "mustnt" | "haveto" | "donthaveto";

export const MODAL_INFO: Record<
  Modal,
  { titulo: string; subtitulo: string; ejemplo: string; icono: string }
> = {
  must: {
    titulo: "must",
    subtitulo: "Obligación fuerte o regla (suele venir de la opinión o autoridad del hablante).",
    ejemplo: "You must study for the exam.",
    icono: "fa-circle-exclamation",
  },
  mustnt: {
    titulo: "mustn't",
    subtitulo: "Prohibición: algo NO está permitido (está prohibido).",
    ejemplo: "You mustn't use your phone during the exam.",
    icono: "fa-ban",
  },
  haveto: {
    titulo: "have to / has to",
    subtitulo: "Obligación que viene de una regla externa o de una necesidad.",
    ejemplo: "I have to wear glasses.",
    icono: "fa-arrow-right-to-bracket",
  },
  donthaveto: {
    titulo: "don't have to",
    subtitulo: "NO hay obligación (es opcional): puedes hacerlo si quieres.",
    ejemplo: "You don't have to come if you don't want to.",
    icono: "fa-circle-check",
  },
};

/** Oraciones VERBATIM de la lectura A1, clasificadas como en A1. */
export const ORACIONES: { id: string; texto: string; modal: Modal }[] = [
  // must (strong obligation or rule)
  { id: "or-must-1", texto: "You must study for the exam.", modal: "must" },
  { id: "or-must-2", texto: "Students must wear their uniform.", modal: "must" },
  { id: "or-must-3", texto: "I must call my grandmother today.", modal: "must" },
  // mustn't (prohibition)
  { id: "or-mn-1", texto: "You mustn't use your phone during the exam.", modal: "mustnt" },
  { id: "or-mn-2", texto: "We mustn't throw trash in the river.", modal: "mustnt" },
  { id: "or-mn-3", texto: "You mustn't run inside the building.", modal: "mustnt" },
  // have to (external obligation)
  { id: "or-ht-1", texto: "I have to wear glasses.", modal: "haveto" },
  { id: "or-ht-2", texto: "She has to finish her project by Friday.", modal: "haveto" },
  // don't have to (no obligation)
  { id: "or-dh-1", texto: "You don't have to come if you don't want to.", modal: "donthaveto" },
  { id: "or-dh-2", texto: "He doesn't have to wear a tie on Fridays.", modal: "donthaveto" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Complete the rule (arrastra la forma modal correcta al hueco)
 * Cada hueco usa un ejemplo VERBATIM de A1; la respuesta es la forma modal
 * literal de ese ejemplo. La pista indica el tipo de regla (escuela/hogar/etc.).
 * ───────────────────────────────────────────────────────────────────────── */
export const HUECOS: {
  id: string;
  resp: string;
  antes: string;
  despues: string;
  pista: string;
}[] = [
  {
    id: "hu-must",
    resp: "must",
    antes: "Students",
    despues: "wear their uniform.",
    pista: "School rule — obligación fuerte",
  },
  {
    id: "hu-mustnt",
    resp: "mustn't",
    antes: "You",
    despues: "use your phone during the exam.",
    pista: "Está prohibido — not permitted",
  },
  {
    id: "hu-haveto",
    resp: "have to",
    antes: "I",
    despues: "wear glasses.",
    pista: "Medical necessity — external reason",
  },
  {
    id: "hu-hasto",
    resp: "has to",
    antes: "She",
    despues: "finish her project by Friday.",
    pista: "Deadline — third person singular",
  },
  {
    id: "hu-donthaveto",
    resp: "don't have to",
    antes: "You",
    despues: "come if you don't want to.",
    pista: "Not necessary — es opcional",
  },
];

/** Formas incorrectas que NO encajan en ningún hueco (refuerzan la regla). */
export const DISTRACTORES_HUECO: string[] = ["musts", "must to", "have", "haves to"];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Match the structure (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-must",
    termino: "must / mustn't",
    definicion: "Obligación fuerte o prohibición: deber / no deber (está prohibido).",
    ejemplo: "You must turn off your phone in class. You mustn't run in the hallways.",
  },
  {
    id: "gl-haveto",
    termino: "have to / has to",
    definicion: "Obligación externa: tener que (he/she usa 'has to').",
    ejemplo: "Students have to wear a uniform. She has to be home by 9.",
  },
  {
    id: "gl-donthaveto",
    termino: "don't have to / doesn't have to",
    definicion: "No es necesario (pero es opcional).",
    ejemplo: "You don't have to bring a dictionary — I have one.",
  },
  {
    id: "gl-school",
    termino: "rules at school",
    definicion: "Normas del colegio: be on time, respect others, keep quiet.",
    ejemplo: "We have to be respectful to our teachers.",
  },
  {
    id: "gl-home",
    termino: "chores at home",
    definicion: "Quehaceres del hogar: do the dishes, take out the rubbish, tidy your room.",
    ejemplo: "I have to do the dishes every evening.",
  },
  {
    id: "gl-community",
    termino: "community responsibilities",
    definicion: "Responsabilidades en la comunidad: recycle, keep the streets clean.",
    ejemplo: "We must recycle to protect the environment.",
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
    pregunta: "'Must' expresa obligación fuerte o una regla personal ('You must wear a helmet').",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: must = obligación o regla importante.",
  },
  {
    pregunta: "'Mustn't' y 'don't have to' significan lo mismo.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "'Mustn't' = está prohibido; 'don't have to' = no es necesario (pero puedes si quieres).",
  },
  {
    pregunta: "'Have to' expresa obligación externa (reglas, leyes, normas de la escuela).",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Sí: have to/has to viene de una norma externa, no personal.",
  },
  {
    pregunta: "Con 'he' y 'she' la forma es 'has to' ('She has to arrive on time').",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: have → has en 3ª persona singular.",
  },
  {
    pregunta: "Después de 'must' el verbo lleva -s ('You musts study').",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No: must es modal y va seguido de verbo base: 'You must study'.",
  },
];

/** Dato verbatim de la lectura A1 (la diferencia clave). */
export const DATO_REGLAS =
  "Diferencia clave: «mustn't» = forbidden (NO está permitido) ≠ «don't have to» = not necessary (puedes hacerlo si quieres). «You mustn't eat in the library» ≠ «You don't have to eat in the library».";
