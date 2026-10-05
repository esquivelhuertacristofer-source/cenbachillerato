/**
 * Datos del laboratorio "Concordancia y conectores" (LC-I-P06-A4).
 *
 * Módulo de datos PURO (sin three, sin React): contenido alineado VERBATIM a la
 * lectura A1 «Concordancia y conectores: el hilo del texto» (LC-I·P06), el quiz
 * A2, el fill_blanks A4, el V/F A5 y el glosario A6.
 */

/* ── Modo 1 «Repara la concordancia» (arrastra la forma correcta) ───────── */
// Cada oración tiene un error de concordancia (verbatim de A1/A2/A5). El alumno
// arrastra la forma correcta al hueco y la oración queda bien construida.
export interface Reparacion {
  id: string;
  antes: string; // texto antes del hueco
  mal: string; // forma incorrecta que se muestra tachada
  bien: string; // forma correcta a arrastrar
  despues: string; // texto después del hueco
  regla: string; // por qué
}

export const REPARACIONES: Reparacion[] = [
  { id: "r-ninos", antes: "Los niños", mal: "fue", bien: "fueron", despues: "al parque.", regla: "Sujeto plural (los niños) requiere verbo plural: fueron." },
  { id: "r-casas", antes: "Las", mal: "casa", bien: "casas", despues: "son grandes.", regla: "El sustantivo concuerda en número con el artículo: las casas." },
  { id: "r-patio", antes: "Los niños", mal: "corrió", bien: "corrieron", despues: "en el patio.", regla: "Sujeto plural con verbo plural: corrieron." },
  { id: "r-blanca", antes: "La casa es", mal: "blanco", bien: "blanca", despues: "y amplia.", regla: "El adjetivo concuerda en género y número con el sustantivo: casa (femenino) → blanca." },
];

/* ── Modo 2 «Conectores en su lugar» (arrastra el conector al hueco) ────── */
// Verbatim del fill_blanks A4: cada oración necesita el conector adecuado a su
// sentido (causal, de adición, comparativo, consecuencia).
export interface Frase {
  id: string;
  antes: string;
  conector: string; // conector correcto (lo que se arrastra)
  despues: string;
  tipo: string; // etiqueta breve del tipo de relación
}

export const FRASES: Frase[] = [
  { id: "f-porque", antes: "Llegué tarde a clase", conector: "porque", despues: "el autobús se descompuso.", tipo: "causa" },
  { id: "f-ademas", antes: "Estudié mucho para el examen;", conector: "además", despues: "repasé con mis compañeros.", tipo: "adición" },
  { id: "f-como", antes: "Este texto es claro,", conector: "como", despues: "un río que fluye sin obstáculos.", tipo: "comparación" },
  { id: "f-y", antes: "No traje la tarea,", conector: "y", despues: "por lo tanto no pude participar.", tipo: "consecuencia" },
];

/* ── Modo 3 «Glosario» (emparejar término con su definición) ────────────── */
// Verbatim del glosario A6.
export interface TerminoGlosario {
  id: string;
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const GLOSARIO: TerminoGlosario[] = [
  {
    id: "g-concordancia",
    termino: "Concordancia",
    definicion: "Acuerdo entre los elementos de la oración: sustantivo-adjetivo en género y número, y sujeto-verbo en número y persona.",
    ejemplo: "«La casa blanca» (concuerda en género y número).",
  },
  {
    id: "g-conector",
    termino: "Conector",
    definicion: "Palabra o frase que une ideas dentro de una oración o entre párrafos.",
    ejemplo: "porque, además, sin embargo, como.",
  },
  {
    id: "g-causal",
    termino: "Conector causal",
    definicion: "Conector que indica la causa o el motivo de algo.",
    ejemplo: "«No salí porque llovía».",
  },
  {
    id: "g-comparativo",
    termino: "Conector comparativo",
    definicion: "Conector que establece una semejanza o comparación.",
    ejemplo: "«Es alto como su padre».",
  },
  {
    id: "g-adicion",
    termino: "Conector de adición",
    definicion: "Conector que agrega información a lo dicho.",
    ejemplo: "«Estudió mucho; además, durmió bien».",
  },
];

/* ── Cuestionario (verbatim del quiz A2) ────────────────────────────────── */
export interface QuizItem {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}

export const QUIZ: QuizItem[] = [
  {
    pregunta: "¿Cuál de estas oraciones tiene un error de concordancia?",
    opciones: ["Las alumnas fueron al laboratorio", "El maestro explicó la lección", "Los niño corrió en el patio", "Ella preparó su tarea"],
    correcta: 2,
    retro: "'Los niño' tiene un error: el artículo plural no concuerda con el sustantivo sin pluralizar.",
  },
  {
    pregunta: "¿Qué conector expresa adición?",
    opciones: ["Sin embargo", "Aunque", "Además", "Por lo tanto"],
    correcta: 2,
    retro: "'Además' añade información a lo ya dicho, expresando adición.",
  },
  {
    pregunta: "¿Cuál es la función de los conectores en el texto?",
    opciones: ["Decorar el texto", "Unir ideas de forma lógica y coherente", "Indicar el tema principal", "Reemplazar los sustantivos"],
    correcta: 1,
    retro: "Los conectores unen ideas dentro de oraciones y entre párrafos, dando coherencia al texto.",
  },
  {
    pregunta: "En la oración 'Ella y él fue al cine', el error es:",
    opciones: ["En el uso del artículo", "En la concordancia sujeto-verbo", "En el tiempo verbal", "No hay error"],
    correcta: 1,
    retro: "Sujeto plural (ella y él) requiere verbo plural: 'fueron', no 'fue'.",
  },
  {
    pregunta: "¿Por qué analizar textos que admiramos ayuda a mejorar la escritura?",
    opciones: [
      "Porque los memorizamos",
      "Porque observamos recursos que luego podemos imitar creativamente",
      "Porque aprendemos de memoria las reglas gramaticales",
      "No ayuda en realidad",
    ],
    correcta: 1,
    retro: "Observar cómo escritores logran textos claros y coherentes nos permite aprender por imitación reflexiva.",
  },
];

/** Dato verbatim de A1 (la coherencia como claridad comunicativa). */
export const DATO_CONCORDANCIA =
  "El uso correcto de conectores y concordancia no es solo gramática formal: es una herramienta de claridad comunicativa. Cuando escribimos de forma coherente, el lector puede seguir nuestro razonamiento sin esfuerzo adicional.";

/* ═══════════════════════════════════════════════════════════════════════════
 * SIMULADOR (2026-10): el texto del alumno cambia lo que entiende el lector.
 * Personas y escuelas ficticias; el contenido curricular de arriba no cambia.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Lo que el lector «ve» en su cabeza al leer una forma. */
export interface OpcionAviso {
  forma: string;
  /** Lectura LITERAL del lector (por qué se entiende o no). */
  lectura: string;
  /** Imagen mental: ícono, cuántos y si queda una duda. */
  vis: { icono: string; n: number; duda: boolean };
}

export interface EscenaAviso {
  /** id de la `Reparacion` a la que pertenece. */
  id: string;
  /** Formas posibles: la incorrecta (`mal`), la correcta (`bien`) y un distractor. */
  opciones: OpcionAviso[];
}

export const AVISO_LECTOR = { nombre: "Profa. Lupita", rol: "Tutora de 1.º B (ficticia)" };
export const AVISO_GRUPO = "Aviso del 1.º B para la tutora (escuela ficticia «Secundaria Cerro Alto»)";

export const AVISOS: EscenaAviso[] = [
  {
    id: "r-ninos",
    opciones: [
      { forma: "fue", lectura: "«Fue» es singular: solo fue UNO de los niños. No sabe cuál ni dónde están los demás.", vis: { icono: "fa-child", n: 1, duda: true } },
      { forma: "fueron", lectura: "Todo el grupo de niños fue al parque. Queda claro.", vis: { icono: "fa-child", n: 4, duda: false } },
      { forma: "fuimos", lectura: "«Fuimos» incluye a quien escribe: ya no sabe si tú también estabas en el parque.", vis: { icono: "fa-child", n: 4, duda: true } },
    ],
  },
  {
    id: "r-casas",
    opciones: [
      { forma: "casa", lectura: "«Las casa»: ¿es una casa o son varias? El artículo dice plural y el sustantivo, singular.", vis: { icono: "fa-house", n: 1, duda: true } },
      { forma: "casas", lectura: "Varias casas, todas grandes. Queda claro.", vis: { icono: "fa-house", n: 3, duda: false } },
      { forma: "casos", lectura: "«Las casos»: no sabe si hablas de casas o de casos; el artículo y el sustantivo no coinciden.", vis: { icono: "fa-folder", n: 2, duda: true } },
    ],
  },
  {
    id: "r-patio",
    opciones: [
      { forma: "corrió", lectura: "«Corrió» es singular: solo UNO corrió. ¿Y los demás niños qué hacían?", vis: { icono: "fa-person-running", n: 1, duda: true } },
      { forma: "corrieron", lectura: "Todos los niños corrieron en el patio. Queda claro.", vis: { icono: "fa-person-running", n: 4, duda: false } },
      { forma: "corriste", lectura: "«Corriste» habla de ti: entiende que TÚ corriste, no los niños.", vis: { icono: "fa-person-running", n: 1, duda: true } },
    ],
  },
  {
    id: "r-blanca",
    opciones: [
      { forma: "blanco", lectura: "«Blanco» es masculino: no sabe qué es blanco, porque «casa» es femenino. ¿Algo más en la casa?", vis: { icono: "fa-house", n: 1, duda: true } },
      { forma: "blanca", lectura: "La casa (una) es blanca y amplia. Queda claro.", vis: { icono: "fa-house", n: 1, duda: false } },
      { forma: "blancas", lectura: "«Blancas» es plural: piensa que hay varias casas, no una.", vis: { icono: "fa-house", n: 3, duda: true } },
    ],
  },
];

/** Opción de conector con su efecto en el sentido. */
export interface OpcionConector {
  conector: string;
  /** Qué relación expresa de verdad entre A y B. */
  relacion: "causa" | "causa-invertida" | "adicion" | "contraste" | "comparacion" | "consecuencia";
  lectura: string;
}

export interface EscenaConector {
  /** id de la `Frase` a la que pertenece. */
  id: string;
  ideaA: string;
  ideaB: string;
  quien: string;
  opciones: OpcionConector[];
}

export const RELACION_INFO: Record<OpcionConector["relacion"], { etiqueta: string; icono: string }> = {
  causa: { etiqueta: "B es la causa de A", icono: "fa-arrow-left-long" },
  "causa-invertida": { etiqueta: "A causó B (al revés)", icono: "fa-arrow-right-long" },
  adicion: { etiqueta: "A y además B", icono: "fa-plus" },
  contraste: { etiqueta: "A choca con B", icono: "fa-bolt" },
  comparacion: { etiqueta: "A se parece a B", icono: "fa-equals" },
  consecuencia: { etiqueta: "A tiene como efecto B", icono: "fa-arrow-right-long" },
};

export const ESCENAS_CONECTOR: EscenaConector[] = [
  {
    id: "f-porque",
    ideaA: "Llegué tarde",
    ideaB: "El autobús se descompuso",
    quien: "Tutora Lupita (ficticia)",
    opciones: [
      { conector: "porque", relacion: "causa", lectura: "El autobús se descompuso y por eso llegaste tarde. Te cree." },
      { conector: "aunque", relacion: "contraste", lectura: "Dices que llegaste tarde A PESAR de que el autobús se descompuso. No tiene sentido: no te cree." },
      { conector: "por lo tanto", relacion: "causa-invertida", lectura: "Entiende que llegaste tarde y POR ESO se descompuso el autobús. Suena a que fue tu culpa." },
    ],
  },
  {
    id: "f-ademas",
    ideaA: "Estudié mucho",
    ideaB: "Repasé con mis compañeros",
    quien: "Prof. Rodrigo (ficticio)",
    opciones: [
      { conector: "además", relacion: "adicion", lectura: "Hiciste dos cosas: estudiar y también repasar en grupo. Se nota el esfuerzo." },
      { conector: "sin embargo", relacion: "contraste", lectura: "Lo lee como contradicción: estudiaste mucho, SIN EMBARGO repasaste. ¿Repasar estaba mal?" },
      { conector: "porque", relacion: "causa", lectura: "Dice que estudiaste mucho PORQUE repasaste. Cambia el orden: no entiende cuál fue primero." },
    ],
  },
  {
    id: "f-como",
    ideaA: "Este texto es claro",
    ideaB: "Un río que fluye sin obstáculos",
    quien: "Mateo, de tu equipo (ficticio)",
    opciones: [
      { conector: "como", relacion: "comparacion", lectura: "Compara el texto con un río: claro y sin tropiezos. Mateo lo imagina." },
      { conector: "porque", relacion: "causa", lectura: "Mateo cree que el texto es claro PORQUE un río fluye. La razón no tiene lógica." },
      { conector: "pero", relacion: "contraste", lectura: "«Pero» anuncia un problema que nunca llega: Mateo piensa que el texto tiene fallas." },
    ],
  },
  {
    id: "f-y",
    ideaA: "No traje la tarea",
    ideaB: "No pude participar",
    quien: "Tutora Lupita (ficticia)",
    opciones: [
      { conector: "y", relacion: "consecuencia", lectura: "No trajiste la tarea y, por lo tanto, no participaste. Todo encaja." },
      { conector: "pero", relacion: "contraste", lectura: "«Pero» promete algo que contradice lo anterior; la tutora espera un 'sí participé' que no llega." },
      { conector: "porque", relacion: "causa", lectura: "Entiende que NO trajiste la tarea porque no pudiste participar: causa y efecto al revés." },
    ],
  },
];
