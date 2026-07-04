/**
 * Datos del laboratorio "Constructor de algoritmos" (CD-I-P11-A2).
 *
 * Módulo de datos PURO (sin three, sin React): contenido alineado VERBATIM a las
 * lecturas A1 «Lenguaje algorítmico: datos, variables y operadores» (CD-I·P11) y
 * «Los algoritmos deciden por nosotros» (CD-I·P04) de Cultura Digital I.
 *
 * Los operadores (aritméticos +−×÷, relacionales ><=≠, lógicos Y/O/NO), las tres
 * estructuras de control (secuencial, condicional, repetitiva) y el concepto de
 * diagrama de flujo se toman literalmente del texto de las actividades; el quiz
 * comprueba esos mismos conceptos.
 */

/** Forma del bloque en el diagrama de flujo (símbolo estándar). */
export type Forma = "terminal" | "entrada" | "proceso" | "decision" | "salida";

export const FORMA_INFO: Record<Forma, { label: string; icono: string; color: string }> = {
  terminal: { label: "Inicio / Fin", icono: "fa-circle-stop", color: "#9AA6B2" },
  entrada: { label: "Entrada", icono: "fa-keyboard", color: "#5BA8FF" },
  proceso: { label: "Proceso", icono: "fa-gears", color: "#34D399" },
  decision: { label: "Decisión", icono: "fa-code-branch", color: "#F2A33C" },
  salida: { label: "Salida", icono: "fa-display", color: "#C792EA" },
};

/** Un paso del algoritmo; el alumno los ordena para armar el diagrama de flujo. */
export interface Paso {
  id: string;
  texto: string;
  forma: Forma;
}

export interface Problema {
  id: string;
  titulo: string;
  enunciado: string;
  /** Pasos en su ORDEN correcto. */
  pasos: Paso[];
}

/* ── Modo «Construye el algoritmo» ─────────────────────────────────────── */
// Cada problema combina estructura secuencial + una condición (estructura
// condicional «si… entonces…»), tal como describe la lectura A1.
export const PROBLEMAS: Problema[] = [
  {
    id: "par-impar",
    titulo: "¿Par o impar?",
    enunciado: "Determinar si un número es par o impar.",
    pasos: [
      { id: "pi1", texto: "Inicio", forma: "terminal" },
      { id: "pi2", texto: "Leer el número n", forma: "entrada" },
      { id: "pi3", texto: "Calcular el residuo de n ÷ 2", forma: "proceso" },
      { id: "pi4", texto: "¿El residuo es igual a 0?", forma: "decision" },
      { id: "pi5", texto: "Sí → mostrar «Es par»", forma: "salida" },
      { id: "pi6", texto: "No → mostrar «Es impar»", forma: "salida" },
      { id: "pi7", texto: "Fin", forma: "terminal" },
    ],
  },
  {
    id: "mayor",
    titulo: "El mayor de dos números",
    enunciado: "Mostrar cuál de dos números es el mayor.",
    pasos: [
      { id: "ma1", texto: "Inicio", forma: "terminal" },
      { id: "ma2", texto: "Leer a y b", forma: "entrada" },
      { id: "ma3", texto: "¿a > b?", forma: "decision" },
      { id: "ma4", texto: "Sí → mostrar a", forma: "salida" },
      { id: "ma5", texto: "No → mostrar b", forma: "salida" },
      { id: "ma6", texto: "Fin", forma: "terminal" },
    ],
  },
  {
    id: "promedio",
    titulo: "¿Aprobado o reprobado?",
    enunciado: "Calcular el promedio de 3 calificaciones y decir si aprueba.",
    pasos: [
      { id: "pr1", texto: "Inicio", forma: "terminal" },
      { id: "pr2", texto: "Leer c1, c2 y c3", forma: "entrada" },
      { id: "pr3", texto: "Calcular promedio = (c1 + c2 + c3) ÷ 3", forma: "proceso" },
      { id: "pr4", texto: "¿promedio ≥ 6?", forma: "decision" },
      { id: "pr5", texto: "Sí → mostrar «Aprobado»", forma: "salida" },
      { id: "pr6", texto: "No → mostrar «Reprobado»", forma: "salida" },
      { id: "pr7", texto: "Fin", forma: "terminal" },
    ],
  },
];

/* ── Modo «Clasifica los operadores» ───────────────────────────────────── */
// Verbatim A1: "los aritméticos (+, −, ×, ÷) para hacer cálculos; los
// relacionales (>, <, =, ≠) para comparar valores; y los lógicos (Y, O, NO)
// para combinar condiciones."
export type TipoOp = "aritmetico" | "relacional" | "logico";

export const OP_INFO: Record<TipoOp, { label: string; descripcion: string; icono: string; color: string }> = {
  aritmetico: { label: "Aritméticos", descripcion: "Para hacer cálculos.", icono: "fa-calculator", color: "#34D399" },
  relacional: { label: "Relacionales", descripcion: "Para comparar valores.", icono: "fa-scale-balanced", color: "#5BA8FF" },
  logico: { label: "Lógicos", descripcion: "Para combinar condiciones.", icono: "fa-diagram-project", color: "#F2A33C" },
};

export interface Operador {
  id: string;
  simbolo: string;
  tipo: TipoOp;
}

export const OPERADORES: Operador[] = [
  { id: "mas", simbolo: "+", tipo: "aritmetico" },
  { id: "menos", simbolo: "−", tipo: "aritmetico" },
  { id: "por", simbolo: "×", tipo: "aritmetico" },
  { id: "entre", simbolo: "÷", tipo: "aritmetico" },
  { id: "mayor", simbolo: ">", tipo: "relacional" },
  { id: "menor", simbolo: "<", tipo: "relacional" },
  { id: "igual", simbolo: "=", tipo: "relacional" },
  { id: "distinto", simbolo: "≠", tipo: "relacional" },
  { id: "y", simbolo: "Y", tipo: "logico" },
  { id: "o", simbolo: "O", tipo: "logico" },
  { id: "no", simbolo: "NO", tipo: "logico" },
];

/* ── Modo «Estructuras de control» ─────────────────────────────────────── */
// Verbatim A1: "las secuenciales (instrucciones que se ejecutan una tras otra),
// las condicionales o selectivas (toman un camino según se cumpla o no una
// condición, como 'si… entonces…') y las repetitivas o cíclicas (repiten
// acciones mientras se cumpla una condición)."
export interface Estructura {
  id: string;
  texto: string; // definición verbatim que el alumno empareja
}

export interface Escenario {
  id: string;
  texto: string;
  estructuraId: string;
}

export const ESTRUCTURAS: Estructura[] = [
  { id: "e-sec", texto: "Secuencial: las instrucciones se ejecutan una tras otra." },
  { id: "e-cond", texto: "Condicional: toma un camino según una condición («si… entonces…»)." },
  { id: "e-rep", texto: "Repetitiva: repite acciones mientras se cumpla una condición." },
];

export const ESCENARIOS: Escenario[] = [
  { id: "s1", texto: "Saludar, pedir el nombre y despedirse, en ese orden.", estructuraId: "e-sec" },
  { id: "s2", texto: "Si la calificación es ≥ 6, mostrar «Aprobado».", estructuraId: "e-cond" },
  { id: "s3", texto: "Mientras queden mensajes sin leer, abrir el siguiente.", estructuraId: "e-rep" },
];

/* ── Cuestionario de comprensión (verbatim del concepto de A1/P04) ─────── */
export interface QuizItem {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}

export const QUIZ: QuizItem[] = [
  {
    pregunta: "¿Qué es un algoritmo?",
    opciones: [
      "Un conjunto de instrucciones ordenadas para resolver un problema",
      "Un tipo de computadora",
      "Una red social",
      "Un componente físico del celular",
    ],
    correcta: 0,
    retro: "Un algoritmo es un conjunto de instrucciones ordenadas para resolver un problema o completar una tarea.",
  },
  {
    pregunta: "¿Qué es una variable?",
    opciones: [
      "Un espacio con nombre cuyo valor puede cambiar durante el proceso",
      "Un valor que se mantiene siempre fijo",
      "Un operador lógico",
      "Una estructura repetitiva",
    ],
    correcta: 0,
    retro: "La variable es un espacio con nombre cuyo contenido puede cambiar (por ejemplo, edad = 15); la constante se mantiene fija.",
  },
  {
    pregunta: "¿Para qué sirven los operadores relacionales (>, <, =, ≠)?",
    opciones: [
      "Para comparar valores",
      "Para hacer cálculos",
      "Para combinar condiciones",
      "Para guardar datos",
    ],
    correcta: 0,
    retro: "Los relacionales (>, <, =, ≠) comparan valores; los aritméticos calculan y los lógicos (Y, O, NO) combinan condiciones.",
  },
  {
    pregunta: "¿Cuáles son las tres estructuras de control?",
    opciones: [
      "Secuenciales, condicionales y repetitivas",
      "Datos, variables y constantes",
      "Aritméticos, relacionales y lógicos",
      "Entrada, proceso y salida",
    ],
    correcta: 0,
    retro: "Los algoritmos se construyen con tres estructuras: secuenciales, condicionales (selectivas) y repetitivas (cíclicas).",
  },
  {
    pregunta: "¿Cómo se llama la representación visual de un algoritmo?",
    opciones: ["Diagrama de flujo", "Hoja de cálculo", "Base de datos", "Sistema operativo"],
    correcta: 0,
    retro: "Para representar la solución de forma visual se usa un diagrama de flujo, con bloques de inicio/fin, entrada, proceso, decisión y salida.",
  },
];

/** Dato verbatim del callout de A1 (P04). */
export const DATO_ALGORITMOS =
  "Los algoritmos no son neutrales: suelen diseñarse para maximizar el tiempo que pasas en la plataforma y tienden a promover contenido que genera reacciones emocionales fuertes. Entender cómo funcionan te ayuda a ser un usuario más consciente.";
