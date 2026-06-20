/**
 * Datos + motor del laboratorio «Álgebra con mosaicos» (algebra tiles).
 * Pensamiento Matemático II — «Introducción al álgebra».
 *
 * Un mismo motor 3D sirve a tres propósitos formativos consecutivos:
 *   • P01 — Representa operaciones aritméticas mediante letras y símbolos,
 *           para comprender el LENGUAJE ALGEBRAICO.
 *   • P02 — Comprende la CLASIFICACIÓN de las expresiones algebraicas
 *           (monomios, binomios, trinomios y polinomios).
 *   • P03 — Realiza OPERACIONES con monomios y binomios.
 *
 * Módulo de DATOS PUROS (sin three): la geometría de los mosaicos se calcula
 * aquí de forma determinista y la escena solo la dibuja. Todo el contenido está
 * anclado a las actividades verbatim PM-II-P01/P02 (lecturas y ejercicios A2).
 */

import type { RetoNumericoData } from "./_reto-numerico";
export type { RetoNumericoData };

export type Variante = "lenguaje" | "clasificacion" | "operaciones";

/** Tipos de mosaico (algebra tiles clásicos). */
export type TipoTile = "x2" | "x" | "unit";

/** Un término = un tipo de mosaico con su coeficiente (con signo). */
export interface Termino {
  tipo: TipoTile;
  coef: number;
}

/* ════════════════════ Geometría de los mosaicos ══════════════════════════ */

/** Lado visual de "x" (en unidades de mundo). La unidad mide 1. */
export const X_LEN = 2.4;
export const U_LEN = 1;
export const TILE_H = 0.42; // grosor del mosaico

export const COLOR_TILE: Record<TipoTile, string> = {
  x2: "#5fb0ff", // azul
  x: "#34D399", // verde
  unit: "#ffd24a", // dorado
};
export const COLOR_NEG = "#f0667d"; // negativo (rojo coral)

/** Dimensiones (ancho, fondo) de cada tipo de mosaico en el plano. */
export function dimsTile(tipo: TipoTile): [number, number] {
  if (tipo === "x2") return [X_LEN, X_LEN];
  if (tipo === "x") return [X_LEN, U_LEN];
  return [U_LEN, U_LEN];
}

export const ETIQUETA_TILE: Record<TipoTile, string> = { x2: "x²", x: "x", unit: "1" };

/* ════════════════════ P01 · Lenguaje algebraico ══════════════════════════ */

export interface Frase {
  id: string;
  frase: string;
  expresion: string;
  terminos: Termino[];
  explica: string;
}

/**
 * Traducciones verbales → expresión algebraica (lenguaje algebraico).
 * Tomadas del marco de PM-II-P01/P02: «pasar de "el doble de cinco más tres"
 * a escribir 2x + 3 es usar el lenguaje algebraico».
 */
export const FRASES: Frase[] = [
  {
    id: "doble-mas-3",
    frase: "El doble de un número, más tres",
    expresion: "2x + 3",
    terminos: [
      { tipo: "x", coef: 2 },
      { tipo: "unit", coef: 3 },
    ],
    explica: "«El doble de un número» es 2x (dos mosaicos x); «más tres» suma 3 unidades.",
  },
  {
    id: "cuadrado",
    frase: "El cuadrado de un número",
    expresion: "x²",
    terminos: [{ tipo: "x2", coef: 1 }],
    explica: "«El cuadrado» eleva la variable al exponente 2: un mosaico x² (de lado x).",
  },
  {
    id: "aumentado-5",
    frase: "Un número aumentado en cinco",
    expresion: "x + 5",
    terminos: [
      { tipo: "x", coef: 1 },
      { tipo: "unit", coef: 5 },
    ],
    explica: "«Un número» es x; «aumentado en cinco» suma 5 unidades.",
  },
  {
    id: "triple-menos-2",
    frase: "El triple de un número, menos dos",
    expresion: "3x − 2",
    terminos: [
      { tipo: "x", coef: 3 },
      { tipo: "unit", coef: -2 },
    ],
    explica: "«El triple» es 3x; «menos dos» quita 2 unidades (mosaicos en rojo, negativos).",
  },
  {
    id: "lote-infonavit",
    frase: "El área de un lote del INFONAVIT, de largo (2x + 5) por ancho x",
    expresion: "2x² + 5x",
    terminos: [
      { tipo: "x2", coef: 2 },
      { tipo: "x", coef: 5 },
    ],
    explica:
      "El área x·(2x + 5) = 2x² + 5x: dos mosaicos x² y cinco mosaicos x. Con x = 6 m da 2(36)+5(6) = 102 m² (ejemplo verbatim de la lectura PM-II-P02).",
  },
];

/** Evalúa una lista de términos para un valor de x. */
export function evalTerminos(terminos: Termino[], x: number): number {
  return terminos.reduce((acc, t) => {
    const base = t.tipo === "x2" ? x * x : t.tipo === "x" ? x : 1;
    return acc + t.coef * base;
  }, 0);
}

/* ════════════════════ P02 · Clasificación ════════════════════════════════ */

export type Clase = "Monomio" | "Binomio" | "Trinomio" | "Polinomio";

export interface Expresion {
  id: string;
  expresion: string;
  terminos: Termino[];
  grado: number;
  /** Anatomía del primer término: coeficiente, variable, exponente. */
  anatomia: { coeficiente: number; variable: string; exponente: number };
}

export function clasifica(nTerminos: number): Clase {
  if (nTerminos === 1) return "Monomio";
  if (nTerminos === 2) return "Binomio";
  if (nTerminos === 3) return "Trinomio";
  return "Polinomio";
}

export const CLASE_DESC: Record<Clase, string> = {
  Monomio: "Un solo término. Ej.: 5x².",
  Binomio: "Dos términos. Ej.: 3x + 7.",
  Trinomio: "Tres términos. Ej.: x² + 4x − 2.",
  Polinomio: "Cuatro o más términos.",
};

/** Expresiones de muestra (verbatim de la lectura PM-II-P02-A1). */
export const EXPRESIONES: Expresion[] = [
  {
    id: "mono",
    expresion: "5x²",
    terminos: [{ tipo: "x2", coef: 5 }],
    grado: 2,
    anatomia: { coeficiente: 5, variable: "x", exponente: 2 },
  },
  {
    id: "bino",
    expresion: "3x + 7",
    terminos: [
      { tipo: "x", coef: 3 },
      { tipo: "unit", coef: 7 },
    ],
    grado: 1,
    anatomia: { coeficiente: 3, variable: "x", exponente: 1 },
  },
  {
    id: "trino",
    expresion: "x² + 4x − 2",
    terminos: [
      { tipo: "x2", coef: 1 },
      { tipo: "x", coef: 4 },
      { tipo: "unit", coef: -2 },
    ],
    grado: 2,
    anatomia: { coeficiente: 1, variable: "x", exponente: 2 },
  },
  {
    id: "poli",
    expresion: "2x² + 5x + 3 − x",
    terminos: [
      { tipo: "x2", coef: 2 },
      { tipo: "x", coef: 5 },
      { tipo: "unit", coef: 3 },
      { tipo: "x", coef: -1 },
    ],
    grado: 2,
    anatomia: { coeficiente: 2, variable: "x", exponente: 2 },
  },
];

/* ════════════════════ P03 · Operaciones ══════════════════════════════════ */

/**
 * Combinar términos semejantes (suma/resta). Ejemplo verbatim de PM-II-P02-A1:
 * 3x² + 2x + 5x² − x = 8x² + x.
 */
export const SEMEJANTES = {
  entrada: "3x² + 2x + 5x² − x",
  pasos: "Junta los semejantes: (3x² + 5x²) + (2x − x)",
  resultado: "8x² + x",
  resultadoTerminos: [
    { tipo: "x2" as TipoTile, coef: 8 },
    { tipo: "x" as TipoTile, coef: 1 },
  ],
};

/**
 * Modelo de área para multiplicar binomios (x + a)(x + b).
 * El rectángulo de lados (x+a) y (x+b) se reparte en:
 *   1 mosaico x²,  (a + b) mosaicos x,  (a·b) unidades.
 * Resultado: x² + (a+b)x + ab.
 */
export function productoBinomios(a: number, b: number): {
  ecuacion: string;
  expandido: string;
  coefX: number;
  constante: number;
  terminos: Termino[];
} {
  const coefX = a + b;
  const constante = a * b;
  const sg = (n: number) => (n >= 0 ? `+ ${n}` : `− ${Math.abs(n)}`);
  const sgX = (n: number) => (n >= 0 ? `+ ${n}x` : `− ${Math.abs(n)}x`);
  return {
    ecuacion: `(x ${sg(a)})(x ${sg(b)})`,
    expandido: `x² ${sgX(coefX)} ${sg(constante)}`,
    coefX,
    constante,
    terminos: [
      { tipo: "x2", coef: 1 },
      { tipo: "x", coef: coefX },
      { tipo: "unit", coef: constante },
    ],
  };
}

/** Presets de productos para los botones. */
export const PRODUCTOS_PRESET: { a: number; b: number; etiqueta: string }[] = [
  { a: 3, b: -2, etiqueta: "(x + 3)(x − 2)" },
  { a: 2, b: 3, etiqueta: "(x + 2)(x + 3)" },
  { a: 4, b: 1, etiqueta: "(x + 4)(x + 1)" },
  { a: -1, b: -4, etiqueta: "(x − 1)(x − 4)" },
];

/* ════════════════════ Retos evaluables (verbatim-grounded) ═══════════════ */

export const RETO_LENGUAJE: RetoNumericoData = {
  titulo: "Del lenguaje verbal al algebraico",
  contexto:
    "El lenguaje algebraico permite escribir una regla general con letras y luego evaluarla para cualquier valor, como hacen arquitectos e ingenieros con las medidas variables de un plano.",
  problema:
    "a) Escribe y evalúa «el doble de un número más tres» cuando el número vale 7 (2x + 3 con x = 7). b) Un lote del INFONAVIT tiene largo (2x + 5) y ancho x; su área es 2x² + 5x. ¿Cuántos m² mide si x = 6 m? c) «El triple de un número menos dos» (3x − 2) con x = 5.",
  campos: [
    { etiqueta: "a) 2x + 3 con x = 7", objetivo: 17, tolerancia: 0.01, placeholder: "2·7 + 3" },
    { etiqueta: "b) área 2x² + 5x con x = 6", objetivo: 102, tolerancia: 0.01, unidad: "m²", placeholder: "2·36 + 5·6" },
    { etiqueta: "c) 3x − 2 con x = 5", objetivo: 13, tolerancia: 0.01, placeholder: "3·5 − 2" },
  ],
  pasosGuia: [
    "a) «El doble de un número» = 2x; «más tres» = + 3 ⇒ 2x + 3. Con x = 7: 2·7 + 3 = 14 + 3 = 17.",
    "b) Área = largo · ancho = (2x + 5)·x = 2x² + 5x. Con x = 6: 2·(6²) + 5·6 = 2·36 + 30 = 72 + 30 = 102 m².",
    "c) «El triple de un número» = 3x; «menos dos» = − 2 ⇒ 3x − 2. Con x = 5: 3·5 − 2 = 15 − 2 = 13.",
  ],
  respuestaFinal: "a) 17. b) 102 m². c) 13.",
};

export const RETO_CLASIFICACION: RetoNumericoData = {
  titulo: "Clasifica la expresión algebraica",
  contexto:
    "Clasificar por número de términos (monomio, binomio, trinomio o polinomio) y reconocer el grado y el coeficiente es el primer paso para operar con expresiones algebraicas.",
  problema:
    "Considera la expresión x² + 4x − 2. a) ¿Cuántos términos tiene? b) ¿Cuál es su grado (mayor exponente)? c) ¿Cuál es el coeficiente del primer término (x²)?",
  campos: [
    { etiqueta: "a) número de términos", objetivo: 3, tolerancia: 0.01, placeholder: "cuenta los términos" },
    { etiqueta: "b) grado de la expresión", objetivo: 2, tolerancia: 0.01, placeholder: "mayor exponente" },
    { etiqueta: "c) coeficiente de x²", objetivo: 1, tolerancia: 0.01, placeholder: "x² = 1·x²" },
  ],
  pasosGuia: [
    "a) Los términos van separados por + o −: x², 4x y −2. Son 3 ⇒ es un TRINOMIO.",
    "b) El grado es el mayor exponente de la variable: x² tiene exponente 2 ⇒ grado 2.",
    "c) En x² el coeficiente no se escribe porque vale 1: x² = 1·x² ⇒ coeficiente 1.",
  ],
  respuestaFinal: "a) 3 términos (trinomio). b) grado 2. c) coeficiente 1.",
};

export const RETO_OPERACIONES: RetoNumericoData = {
  titulo: "Multiplica binomios con el modelo de área",
  contexto:
    "Multiplicar dos binomios (propiedad distributiva doble, «FOIL») equivale a calcular el área de un rectángulo de lados (x + a) y (x + b): el modelo de mosaicos lo hace visible.",
  problema:
    "Desarrolla (x + 3)(x − 2). a) ¿Cuál es el coeficiente de x? b) ¿Cuál es el término independiente (la constante)? c) Comprueba evaluando el resultado en x = 5.",
  campos: [
    { etiqueta: "a) coeficiente de x", objetivo: 1, tolerancia: 0.01, placeholder: "3 + (−2)" },
    { etiqueta: "b) término independiente", objetivo: -6, tolerancia: 0.01, placeholder: "3 · (−2)" },
    { etiqueta: "c) valor en x = 5", objetivo: 24, tolerancia: 0.01, placeholder: "25 + 5 − 6" },
  ],
  pasosGuia: [
    "Modelo de área: (x + a)(x + b) = x² + (a + b)x + a·b. Aquí a = 3 y b = −2.",
    "a) Coeficiente de x = a + b = 3 + (−2) = 1.",
    "b) Término independiente = a · b = 3 · (−2) = −6. ⇒ (x + 3)(x − 2) = x² + x − 6.",
    "c) En x = 5: 5² + 5 − 6 = 25 + 5 − 6 = 24. (También (5+3)(5−2) = 8·3 = 24.)",
  ],
  respuestaFinal: "(x + 3)(x − 2) = x² + x − 6. a) 1. b) −6. c) 24.",
};

export const RETO_POR_VARIANTE: Record<Variante, RetoNumericoData> = {
  lenguaje: RETO_LENGUAJE,
  clasificacion: RETO_CLASIFICACION,
  operaciones: RETO_OPERACIONES,
};

/* ════════════════════ Variantes (modos) ══════════════════════════════════ */

export const VARIANTES: { id: Variante; nombre: string; icon: string; desc: string }[] = [
  {
    id: "lenguaje",
    nombre: "Lenguaje algebraico",
    icon: "fa-language",
    desc: "Traduce una frase verbal a una expresión con letras y símbolos, mírala como mosaicos y evalúala para un valor de x.",
  },
  {
    id: "clasificacion",
    nombre: "Clasificación",
    icon: "fa-layer-group",
    desc: "Cuenta los términos de una expresión para clasificarla como monomio, binomio, trinomio o polinomio, y lee su grado.",
  },
  {
    id: "operaciones",
    nombre: "Operaciones",
    icon: "fa-xmark",
    desc: "Multiplica dos binomios con el modelo de área y combina términos semejantes: el álgebra se vuelve geometría de mosaicos.",
  },
];

/* ════════════════════ Texto didáctico ════════════════════════════════════ */

export const OBJETIVOS = [
  "Traducir frases verbales al lenguaje algebraico con letras y símbolos",
  "Reconocer coeficiente, variable y exponente en un término",
  "Clasificar expresiones por su número de términos (monomio…polinomio)",
  "Combinar términos semejantes para sumar y restar expresiones",
  "Multiplicar binomios con el modelo de área de mosaicos",
];

export const IDEAS = [
  "El lenguaje algebraico usa letras (variables) para hablar de cantidades sin conocer su valor: pasar de «el doble de cinco más tres» a 2x + 3.",
  "Un monomio tiene un coeficiente (cuántas veces se tiene la variable), una variable y un exponente. Si el coeficiente es 1 no se escribe: x² = 1x².",
  "Por su número de términos: 1 → monomio, 2 → binomio, 3 → trinomio, 4 o más → polinomio. El grado es el mayor exponente.",
  "Solo se combinan TÉRMINOS SEMEJANTES (misma variable y mismo exponente): 3x² + 5x² = 8x², pero x² y x no se suman.",
  "Multiplicar dos binomios es como calcular el área de un rectángulo: (x + a)(x + b) = x² + (a + b)x + a·b.",
  "Los mosaicos algebraicos (algebra tiles) hacen visible el álgebra: x² es un cuadrado de lado x, x es una tira de largo x y la unidad es un cuadrito de lado 1.",
];

export const CONTEXTO =
  "El álgebra es el puente entre lo concreto y lo abstracto. Arquitectos e ingenieros del INFONAVIT, por ejemplo, escriben el área de un lote como una expresión algebraica (x·(2x + 5) = 2x² + 5x) para ajustar las dimensiones de la vivienda social y cumplir el área mínima de 42 m² que marca la norma.";

export const FUENTE =
  "MCCEMS 2025 — Pensamiento Matemático II «Introducción al álgebra». Anclas verbatim: lecturas y ejercicios PM-II-P01-A1/A2 (lenguaje y patrones), PM-II-P02-A1/A2 (monomios, clasificación y operaciones).";

export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const GLOSARIO: GlosarioItem[] = [
  { termino: "Variable", definicion: "Letra que representa una cantidad desconocida o que puede cambiar.", ejemplo: "En 2x + 3, la x es la variable." },
  { termino: "Coeficiente", definicion: "Número que multiplica a la variable; indica cuántas veces se tiene.", ejemplo: "En 5x² el coeficiente es 5." },
  { termino: "Exponente", definicion: "Indica cuántas veces se multiplica la variable por sí misma.", ejemplo: "En x² el exponente es 2." },
  { termino: "Monomio", definicion: "Expresión algebraica de un solo término.", ejemplo: "7x³ es un monomio." },
  { termino: "Términos semejantes", definicion: "Términos con la misma variable elevada al mismo exponente; solo entre ellos se suma o resta.", ejemplo: "3x² y 5x² son semejantes." },
  { termino: "Grado", definicion: "El mayor exponente de la variable en la expresión.", ejemplo: "x² + 4x − 2 tiene grado 2." },
];
