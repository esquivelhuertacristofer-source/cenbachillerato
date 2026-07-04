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
