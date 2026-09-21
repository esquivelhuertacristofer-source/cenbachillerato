/**
 * Datos y modelo del laboratorio "Lógica matemática y compuertas" (PM-I,
 * progresión 1 de Pensamiento Matemático I).
 *
 * OJO con la numeración: la progresión 1 («Aplica conceptos básicos de lógica
 * matemática en situaciones de su contexto para desarrollar esquemas de
 * razonamiento estructurado») lleva los códigos PM-I-P03-*.
 *
 * Anclas (todo VERBATIM de la base de datos):
 *   - A1 lectura «Proposiciones, conectivos y lógica cotidiana»: marco teórico,
 *     preguntas y recuadro.
 *   - A2 ejercicio «Tabla de verdad de proposiciones compuestas»: reto
 *     evaluable (RetoNumericoCard) y expresión central del modo Tabla de verdad.
 *   - A3 reflexión: consigna y pistas. A4 quiz: RetoQuizCard. A5 V/F: hechos.
 *   - A6 completa el texto: CompletaTexto. A7 autoevaluación: criterios.
 *   - A9 relacionar columnas: las reglas de verdad de los cinco conectivos
 *     (con sus dos distractores) son la pregunta con la que se cierra cada
 *     conectivo en el modo Circuito.
 *
 * Nada de lo que se ve en pantalla se afirma "a mano": los valores de cada
 * cable, de cada fila y de cada mundo salen de evaluar la expresión con
 * `evaluar()`. Las situaciones cotidianas son ilustrativas.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";
import type { RetoNumericoData } from "./_reto-numerico";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "circuito" | "tabla" | "razonar";
export const MODOS: Modo[] = ["circuito", "tabla", "razonar"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  circuito: { etq: "Circuito de conectivos", subtitulo: "Predice cuándo se enciende el foco", icono: "fa-microchip", color: "#38bdf8" },
  tabla: { etq: "Tabla de verdad", subtitulo: "Construye la tabla y clasifica", icono: "fa-table-cells", color: "#a78bfa" },
  razonar: { etq: "Condicional y razonamientos", subtitulo: "Cuatro mundos posibles ponen a prueba", icono: "fa-code-branch", color: "#f472b6" },
};

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export const vf = (b: boolean) => (b ? "V" : "F");

/* ════════════════════════════════════════════════════════════════════════
 * Lógica proposicional: expresiones y evaluación
 * ════════════════════════════════════════════════════════════════════════ */

export type Op = "and" | "or" | "imp" | "bic";
export type Conectivo = "neg" | Op;
export type Var = "p" | "q";

export type Expr = { k: "var"; v: Var } | { k: "not"; a: Expr } | { k: "bin"; op: Op; a: Expr; b: Expr };

export const P: Expr = { k: "var", v: "p" };
export const Q: Expr = { k: "var", v: "q" };
export const no = (a: Expr): Expr => ({ k: "not", a });
export const bin = (op: Op, a: Expr, b: Expr): Expr => ({ k: "bin", op, a, b });

export const SIMBOLO: Record<Conectivo, string> = { neg: "¬", and: "∧", or: "∨", imp: "→", bic: "↔" };

export function aplicar(op: Op, a: boolean, b: boolean): boolean {
  if (op === "and") return a && b;
  if (op === "or") return a || b;
  if (op === "imp") return !a || b;
  return a === b;
}

export function evaluar(e: Expr, p: boolean, q: boolean): boolean {
  if (e.k === "var") return e.v === "p" ? p : q;
  if (e.k === "not") return !evaluar(e.a, p, q);
  return aplicar(e.op, evaluar(e.a, p, q), evaluar(e.b, p, q));
}

/** Texto de la expresión con los paréntesis estrictamente necesarios. */
export function texto(e: Expr): string {
  if (e.k === "var") return e.v;
  if (e.k === "not") return e.a.k === "bin" ? `¬(${texto(e.a)})` : `¬${texto(e.a)}`;
  const lado = (x: Expr) => (x.k === "bin" ? `(${texto(x)})` : texto(x));
  return `${lado(e.a)} ${SIMBOLO[e.op]} ${lado(e.b)}`;
}

/** Subexpresiones compuestas en orden de cálculo (hijos antes que padres), sin repetir. */
export function columnas(e: Expr): Expr[] {
  const out: Expr[] = [];
  const vistos = new Set<string>();
  const visita = (x: Expr) => {
    if (x.k === "var") return;
    if (x.k === "not") visita(x.a);
    else {
      visita(x.a);
      visita(x.b);
    }
    const t = texto(x);
    if (!vistos.has(t)) {
      vistos.add(t);
      out.push(x);
    }
  };
  visita(e);
  return out;
}

/** Orden de la lectura A1: VV, VF, FV, FF. */
export const FILAS: [boolean, boolean][] = [
  [true, true],
  [true, false],
  [false, true],
  [false, false],
];
export const FILAS_NEG: [boolean, boolean][] = [
  [true, true],
  [false, true],
];

export type Clase = "tautologia" | "contradiccion" | "contingencia";
export const CLASES: { id: Clase; etq: string; explica: string }[] = [
  { id: "tautologia", etq: "Tautología", explica: "siempre verdadera" },
  { id: "contradiccion", etq: "Contradicción", explica: "siempre falsa" },
  { id: "contingencia", etq: "Contingencia", explica: "a veces verdadera" },
];

export function clasificar(e: Expr): Clase {
  const vals = FILAS.map(([p, q]) => evaluar(e, p, q));
  if (vals.every(Boolean)) return "tautologia";
  if (vals.every((v) => !v)) return "contradiccion";
  return "contingencia";
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. CIRCUITO DE CONECTIVOS
 * ════════════════════════════════════════════════════════════════════════ */

export const CONECTIVOS: Conectivo[] = ["neg", "and", "or", "imp", "bic"];

export interface ConectivoDef {
  id: Conectivo;
  nombre: string;
  /** Nombre de la columna izquierda de A9 — verbatim. */
  a9: string;
  /** Regla de la columna derecha de A9 — verbatim. */
  regla: string;
  expr: Expr;
  /** Compuerta con la que se dibuja en el circuito. */
  compuerta: string;
  p: { si: string; no: string };
  q?: { si: string; no: string };
  /** La proposición compuesta leída en la situación. */
  frase: string;
  /** Qué significa que el foco se encienda. */
  foco: string;
  /** Comentario por fila (clave "VF", etc.). */
  comentario: Record<string, string>;
}

export const CONECTIVO_DEF: Record<Conectivo, ConectivoDef> = {
  neg: {
    id: "neg",
    nombre: "Negación",
    a9: "Negación (NO p)",
    regla: "Invierte el valor de verdad de la proposición original.",
    expr: no(P),
    compuerta: "Compuerta NOT (inversor)",
    p: { si: "Hoy llueve", no: "Hoy no llueve" },
    frase: "Hoy no llueve.",
    foco: "«Hoy no llueve» es verdadera",
    comentario: {
      VV: "Si «hoy llueve» es verdadera, su negación «hoy no llueve» es falsa: el inversor apaga la señal.",
      FV: "Si «hoy llueve» es falsa, entonces «hoy no llueve» es verdadera: el inversor enciende la salida aunque la entrada esté apagada.",
    },
  },
  and: {
    id: "and",
    nombre: "Conjunción",
    a9: "Conjunción (p Y q)",
    regla: "Es verdadera solo si las dos proposiciones son verdaderas.",
    expr: bin("and", P, Q),
    compuerta: "Compuerta AND (Y)",
    p: { si: "Tengo dinero", no: "No tengo dinero" },
    q: { si: "Hay descuento", no: "No hay descuento" },
    frase: "Tengo dinero y hay descuento.",
    foco: "se cumplen las dos condiciones",
    comentario: {
      VV: "Tengo dinero y hay descuento: se cumplen las dos, la conjunción es verdadera.",
      VF: "Tengo dinero pero no hay descuento: basta una falsa para que la conjunción sea falsa.",
      FV: "Hay descuento pero no tengo dinero: una condición falla, la conjunción es falsa.",
      FF: "Ni dinero ni descuento: las dos son falsas, la conjunción es falsa.",
    },
  },
  or: {
    id: "or",
    nombre: "Disyunción",
    a9: "Disyunción (p O q)",
    regla: "Es falsa solo si las dos proposiciones son falsas.",
    expr: bin("or", P, Q),
    compuerta: "Compuerta OR (O)",
    p: { si: "Traigo efectivo", no: "No traigo efectivo" },
    q: { si: "Traigo tarjeta", no: "No traigo tarjeta" },
    frase: "Traigo efectivo o traigo tarjeta.",
    foco: "puedo pagar",
    comentario: {
      VV: "Traigo las dos cosas: la disyunción de la lectura es inclusiva, así que también es verdadera.",
      VF: "Solo traigo efectivo: con una verdadera basta, la disyunción es verdadera.",
      FV: "Solo traigo tarjeta: una verdadera basta, la disyunción es verdadera.",
      FF: "No traigo ni efectivo ni tarjeta: las dos son falsas y es el único caso en que la disyunción es falsa.",
    },
  },
  imp: {
    id: "imp",
    nombre: "Implicación (condicional)",
    a9: "Implicación (si p, entonces q)",
    regla: "Es falsa únicamente cuando p es verdadera y q es falsa.",
    expr: bin("imp", P, Q),
    compuerta: "Por dentro funciona como ¬p ∨ q",
    p: { si: "Apruebas el examen", no: "No apruebas el examen" },
    q: { si: "Vamos al cine", no: "No vamos al cine" },
    frase: "Si apruebas el examen, entonces vamos al cine.",
    foco: "la promesa se cumplió (no se rompió)",
    comentario: {
      VV: "Aprobaste y fueron al cine: la promesa se cumplió, la implicación es verdadera.",
      VF: "Aprobaste y NO fueron al cine: la promesa se rompió. Es el único caso en que la implicación es falsa.",
      FV: "No aprobaste y aun así fueron al cine: la promesa no hablaba de ese caso, así que no se rompió. La implicación es verdadera.",
      FF: "No aprobaste y no fueron: nadie rompió la promesa. La implicación es verdadera.",
    },
  },
  bic: {
    id: "bic",
    nombre: "Bicondicional",
    a9: "Bicondicional (p si y solo si q)",
    regla: "Es verdadera cuando ambas proposiciones tienen el mismo valor de verdad.",
    expr: bin("bic", P, Q),
    compuerta: "Compuerta XNOR (igualdad)",
    p: { si: "El semáforo está en verde", no: "El semáforo no está en verde" },
    q: { si: "Los autos avanzan", no: "Los autos no avanzan" },
    frase: "El semáforo está en verde si y solo si los autos avanzan.",
    foco: "las dos tienen el mismo valor",
    comentario: {
      VV: "Verde y los autos avanzan: mismo valor (V y V), la bicondicional es verdadera.",
      VF: "Verde y los autos no avanzan: valores distintos, la bicondicional es falsa.",
      FV: "No está en verde y los autos avanzan: valores distintos, la bicondicional es falsa.",
      FF: "No está en verde y no avanzan: mismo valor (F y F), la bicondicional es verdadera.",
    },
  },
};

export const claveFila = (p: boolean, q: boolean) => `${vf(p)}${vf(q)}`;

/** Opciones de la columna derecha de A9: las cinco reglas y los dos distractores, verbatim. */
export const REGLAS_A9: string[] = [
  "Es verdadera solo si las dos proposiciones son verdaderas.",
  "Es falsa solo si las dos proposiciones son falsas.",
  "Invierte el valor de verdad de la proposición original.",
  "Es falsa únicamente cuando p es verdadera y q es falsa.",
  "Es verdadera cuando ambas proposiciones tienen el mismo valor de verdad.",
  "Es verdadera solo si al menos una de las dos proposiciones es falsa.",
  "Es verdadera siempre que p sea falsa, sin importar el valor de q.",
];
/** Orden en que se ofrecen (fijo, revuelto una vez). */
export const ORDEN_REGLAS = [3, 5, 0, 4, 6, 1, 2];

/**
 * Retroalimentación para quien elige un distractor de A9. El segundo
 * distractor describe algo que SÍ cumple la implicación (las filas FV y FF dan
 * V), pero no es su regla completa: por eso se trata aparte.
 */
export function explicaRegla(c: Conectivo, idx: number): { ok: boolean; parcial: boolean; txt: string } {
  const regla = REGLAS_A9[idx]!;
  if (regla === CONECTIVO_DEF[c].regla) return { ok: true, parcial: false, txt: `Exacto: «${regla}» Es justo lo que mostró tu tabla.` };
  if (idx === 6 && c === "imp")
    return { ok: false, parcial: true, txt: "Es cierto que con p falsa la implicación sale V (filas FV y FF), pero la regla está incompleta: no dice qué pasa cuando p es verdadera. Busca la regla que la describe entera." };
  if (idx === 5) return { ok: false, parcial: false, txt: "Esa regla no corresponde a ninguno de los cinco conectivos: sería una «NO-Y» (¬(p ∧ q)). Revisa tu tabla." };
  if (idx === 6) return { ok: false, parcial: false, txt: "Esa regla no describe este conectivo: revisa qué pasa en tu tabla cuando p es falsa." };
  const de = CONECTIVOS.find((k) => CONECTIVO_DEF[k].regla === regla)!;
  return { ok: false, parcial: false, txt: `Esa es la regla de la ${CONECTIVO_DEF[de].nombre.toLowerCase()}. Compárala con las filas de tu tabla.` };
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. TABLA DE VERDAD
 * ════════════════════════════════════════════════════════════════════════ */

export interface Expresion {
  id: string;
  expr: Expr;
  /** Lectura con p = «estudio», q = «duermo bien» (la de A2 es verbatim). */
  lectura: string;
  etq: string;
  nota: string;
}

export const LECTURA_PQ = "p = «estudio», q = «duermo bien»";

export const EXPRESIONES: Expresion[] = [
  {
    id: "a2",
    etq: "A2",
    expr: bin("imp", bin("and", P, Q), bin("or", P, Q)),
    lectura: "Si estudio Y duermo bien, entonces estudio O duermo bien.",
    nota: "Es la proposición del ejercicio A2: si se cumplen las dos condiciones, al menos una se cumple.",
  },
  {
    id: "contra",
    etq: "p ∧ ¬p",
    expr: bin("and", P, no(P)),
    lectura: "Estudio y no estudio.",
    nota: "Una proposición y su negación nunca son verdaderas a la vez: ninguna fila puede encender el foco.",
  },
  {
    id: "conting",
    etq: "(p ∨ q) → p",
    expr: bin("imp", bin("or", P, Q), P),
    lectura: "Si estudio o duermo bien, entonces estudio.",
    nota: "Falla cuando duermo bien pero no estudio: depende de los valores, es una contingencia.",
  },
  {
    id: "demorgan",
    etq: "De Morgan",
    expr: bin("bic", no(bin("and", P, Q)), bin("or", no(P), no(Q))),
    lectura: "«No es cierto que estudio y duermo bien» si y solo si «no estudio o no duermo bien».",
    nota: "Ley de De Morgan: negar una conjunción equivale a la disyunción de las negaciones. Las columnas ¬(p ∧ q) y ¬p ∨ ¬q son idénticas.",
  },
  {
    id: "ponens",
    etq: "Modus ponens",
    expr: bin("imp", bin("and", bin("imp", P, Q), P), Q),
    lectura: "Si «si estudio, duermo bien» y además estudio, entonces duermo bien.",
    nota: "Es la forma del modus ponens escrita como una sola proposición. Que sea tautología significa que el razonamiento es válido.",
  },
  {
    id: "consecuente",
    etq: "Afirmar el consecuente",
    expr: bin("imp", bin("and", bin("imp", P, Q), Q), P),
    lectura: "Si «si estudio, duermo bien» y además duermo bien, entonces estudio.",
    nota: "Es la forma de la falacia de afirmar el consecuente. La fila FV la hace falsa: no es tautología, así que el razonamiento no es válido.",
  },
];

/* ════════════════════════════════════════════════════════════════════════
 * 3. CONDICIONAL Y RAZONAMIENTOS — cuatro mundos posibles
 * ════════════════════════════════════════════════════════════════════════ */

export interface Situacion {
  id: string;
  etq: string;
  icono: string;
  p: { si: string; no: string };
  q: { si: string; no: string };
  formas: Record<Forma, string>;
  hechos: { p: string; np: string; q: string; nq: string };
  /**
   * Un ejemplo concreto para cada mundo (clave VV, VF, FV, FF), o null si no
   * existe ninguno porque la condición original es un hecho verdadero.
   */
  ejemplos: Record<string, string | null>;
}

export type Forma = "original" | "reciproca" | "inversa" | "contrapositiva";
export const FORMAS: Forma[] = ["original", "reciproca", "inversa", "contrapositiva"];
export const FORMA_DEF: Record<Forma, { etq: string; simbolo: string; expr: Expr; como: string }> = {
  original: { etq: "Original", simbolo: "p → q", expr: bin("imp", P, Q), como: "La condición de partida." },
  reciproca: { etq: "Recíproca", simbolo: "q → p", expr: bin("imp", Q, P), como: "Intercambia antecedente y consecuente." },
  inversa: { etq: "Inversa", simbolo: "¬p → ¬q", expr: bin("imp", no(P), no(Q)), como: "Niega las dos partes sin intercambiarlas." },
  contrapositiva: { etq: "Contrapositiva", simbolo: "¬q → ¬p", expr: bin("imp", no(Q), no(P)), como: "Intercambia y niega las dos partes." },
};

export const SITUACIONES: Situacion[] = [
  {
    id: "multiplo",
    etq: "Múltiplos de 4",
    icono: "fa-hashtag",
    p: { si: "es múltiplo de 4", no: "no es múltiplo de 4" },
    q: { si: "es par", no: "es impar" },
    formas: {
      original: "Si un número es múltiplo de 4, entonces es par.",
      reciproca: "Si un número es par, entonces es múltiplo de 4.",
      inversa: "Si un número no es múltiplo de 4, entonces no es par.",
      contrapositiva: "Si un número no es par, entonces no es múltiplo de 4.",
    },
    hechos: { p: "Este número es múltiplo de 4.", np: "Este número no es múltiplo de 4.", q: "Este número es par.", nq: "Este número no es par." },
    ejemplos: { VV: "12", VF: null, FV: "6", FF: "7" },
  },
  {
    id: "jalisco",
    etq: "Guadalajara y Jalisco",
    icono: "fa-map-location-dot",
    p: { si: "vive en Guadalajara", no: "no vive en Guadalajara" },
    q: { si: "vive en Jalisco", no: "no vive en Jalisco" },
    formas: {
      original: "Si una persona vive en Guadalajara, entonces vive en Jalisco.",
      reciproca: "Si una persona vive en Jalisco, entonces vive en Guadalajara.",
      inversa: "Si una persona no vive en Guadalajara, entonces no vive en Jalisco.",
      contrapositiva: "Si una persona no vive en Jalisco, entonces no vive en Guadalajara.",
    },
    hechos: { p: "Ana vive en Guadalajara.", np: "Ana no vive en Guadalajara.", q: "Ana vive en Jalisco.", nq: "Ana no vive en Jalisco." },
    ejemplos: { VV: "Guadalajara", VF: null, FV: "Zapopan", FF: "Monterrey" },
  },
  {
    id: "descuento",
    etq: "Descuento y compra",
    icono: "fa-tags",
    p: { si: "hay descuento", no: "no hay descuento" },
    q: { si: "compro", no: "no compro" },
    formas: {
      original: "Si hay descuento, entonces compro.",
      reciproca: "Si compro, entonces hay descuento.",
      inversa: "Si no hay descuento, entonces no compro.",
      contrapositiva: "Si no compro, entonces no hay descuento.",
    },
    hechos: { p: "Hoy hay descuento.", np: "Hoy no hay descuento.", q: "Hoy compré.", nq: "Hoy no compré." },
    ejemplos: { VV: "compro en oferta", VF: "la regla se rompe", FV: "compro sin oferta", FF: "ni oferta ni compra" },
  },
];

export type Argumento = "ponens" | "tollens" | "consecuente" | "antecedente";
export const ARGUMENTOS: Argumento[] = ["ponens", "tollens", "consecuente", "antecedente"];

export interface ArgumentoDef {
  etq: string;
  forma: string;
  valido: boolean;
  premisa2: Expr;
  conclusion: Expr;
  hecho2: "p" | "np" | "q" | "nq";
  concl: "p" | "np" | "q" | "nq";
  explica: string;
}

export const ARGUMENTO_DEF: Record<Argumento, ArgumentoDef> = {
  ponens: {
    etq: "Modus ponens",
    forma: "p → q ; p ∴ q",
    valido: true,
    premisa2: P,
    conclusion: Q,
    hecho2: "p",
    concl: "q",
    explica: "Solo sobrevive el mundo VV, y ahí la conclusión q es verdadera. No hay contraejemplo posible: el razonamiento es válido.",
  },
  tollens: {
    etq: "Modus tollens",
    forma: "p → q ; ¬q ∴ ¬p",
    valido: true,
    premisa2: no(Q),
    conclusion: no(P),
    hecho2: "nq",
    concl: "np",
    explica: "Solo sobrevive el mundo FF, y ahí ¬p es verdadera. El mundo VF, el único que podría ser contraejemplo, ya lo descartó la primera premisa: es válido.",
  },
  consecuente: {
    etq: "Afirmar el consecuente",
    forma: "p → q ; q ∴ p",
    valido: false,
    premisa2: Q,
    conclusion: P,
    hecho2: "q",
    concl: "p",
    explica: "Sobreviven VV y FV. En el mundo FV las dos premisas son verdaderas y la conclusión es falsa: ese mundo es un contraejemplo, así que es una falacia.",
  },
  antecedente: {
    etq: "Negar el antecedente",
    forma: "p → q ; ¬p ∴ ¬q",
    valido: false,
    premisa2: no(P),
    conclusion: no(Q),
    hecho2: "np",
    concl: "nq",
    explica: "Sobreviven FV y FF. En el mundo FV las premisas son verdaderas pero ¬q es falsa: hay contraejemplo, es una falacia.",
  },
};

export type EstadoMundo = "descartadoP1" | "descartadoP2" | "confirma" | "contraejemplo";

/** Qué le pasa a cada mundo (VV, VF, FV, FF) al poner a prueba un argumento. */
export function probarArgumento(a: Argumento): EstadoMundo[] {
  const d = ARGUMENTO_DEF[a];
  return FILAS.map(([p, q]) => {
    if (!evaluar(bin("imp", P, Q), p, q)) return "descartadoP1";
    if (!evaluar(d.premisa2, p, q)) return "descartadoP2";
    return evaluar(d.conclusion, p, q) ? "confirma" : "contraejemplo";
  });
}

export const esValido = (a: Argumento) => !probarArgumento(a).includes("contraejemplo");

export function equivaleAOriginal(f: Forma): boolean {
  return FILAS.every(([p, q]) => evaluar(FORMA_DEF[f].expr, p, q) === evaluar(FORMA_DEF.original.expr, p, q));
}

/* ════════════════════════════════════════════════════════════════════════
 * Tarjeta de estrellas: ¿es proposición?
 * ════════════════════════════════════════════════════════════════════════ */

export type TipoEnunciado = "simple" | "compuesta" | "no";
export const TIPOS_ENUNCIADO: { id: TipoEnunciado; etq: string; icono: string }[] = [
  { id: "simple", etq: "Proposición simple", icono: "fa-circle-dot" },
  { id: "compuesta", etq: "Proposición compuesta", icono: "fa-diagram-project" },
  { id: "no", etq: "No es proposición", icono: "fa-ban" },
];

export const ENUNCIADOS: { texto: string; tipo: TipoEnunciado; porque: string }[] = [
  { texto: "Hoy es lunes.", tipo: "simple", porque: "es una afirmación que puede ser verdadera o falsa y no usa conectivos." },
  { texto: "¿Qué hora es?", tipo: "no", porque: "es una pregunta: no tiene valor de verdad." },
  { texto: "Si tengo dinero y hay descuento, entonces compro.", tipo: "compuesta", porque: "une proposiciones con «y» y con «si… entonces»." },
  { texto: "Cierra la puerta.", tipo: "no", porque: "es una orden: no es verdadera ni falsa." },
  { texto: "7 es un número par.", tipo: "simple", porque: "es falsa, pero tiene valor de verdad: sí es proposición." },
  { texto: "Llueve o hace frío.", tipo: "compuesta", porque: "une dos proposiciones con el conectivo «o»." },
  { texto: "¡Ojalá gane México!", tipo: "no", porque: "expresa un deseo: no se puede decir si es verdadero o falso." },
  { texto: "La Ciudad de México es la capital del país.", tipo: "simple", porque: "es una sola afirmación con valor de verdad (verdadera)." },
  { texto: "No es cierto que 2 + 2 = 5.", tipo: "compuesta", porque: "aplica el conectivo negación a la proposición «2 + 2 = 5»." },
  { texto: "x + 3 = 8", tipo: "no", porque: "es un enunciado abierto: su valor depende de x, así que todavía no es verdadero ni falso." },
  { texto: "Entrego la tarea si y solo si la termino hoy.", tipo: "compuesta", porque: "usa el bicondicional «si y solo si»." },
  { texto: "Pásame la sal, por favor.", tipo: "no", porque: "es una petición: no tiene valor de verdad." },
  { texto: "Un triángulo tiene tres lados.", tipo: "simple", porque: "es una afirmación verdadera sin conectivos." },
  { texto: "El agua hierve a 100 °C al nivel del mar y el hielo flota en ella.", tipo: "compuesta", porque: "une dos proposiciones con «y»." },
];

export function rondaEnunciados(rnd: () => number): number[] {
  const idx = ENUNCIADOS.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j]!, idx[i]!];
  }
  // Siempre hay al menos una de cada tipo en las 6.
  const tipos: TipoEnunciado[] = ["simple", "compuesta", "no"];
  const elegidos = tipos.map((t) => idx.find((i) => ENUNCIADOS[i]!.tipo === t)!);
  const resto = idx.filter((i) => !elegidos.includes(i)).slice(0, 3);
  const ronda = [...elegidos, ...resto];
  for (let i = ronda.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [ronda[i], ronda[j]] = [ronda[j]!, ronda[i]!];
  }
  return ronda;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido verbatim
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Proposiciones, conectivos y lógica cotidiana";

/** Lectura A1 — verbatim (4 párrafos). */
export const LECTURA_A1: string[] = [
  "La lógica matemática es el estudio de los principios que determinan si un argumento es válido o no. Una proposición es una afirmación que puede ser verdadera o falsa, pero no ambas al mismo tiempo. \"Hoy es lunes\" es una proposición. \"¿Qué hora es?\" no lo es, porque es una pregunta.",
  "Cuando combinamos proposiciones con conectivos lógicos, obtenemos proposiciones compuestas. Los principales conectivos son: la conjunción (p Y q: verdadera solo si ambas son verdaderas), la disyunción (p O q: falsa solo si ambas son falsas), la negación (NO p: invierte el valor de verdad), la implicación (Si p, entonces q) y la bicondicional (p si y solo si q).",
  "Las tablas de verdad nos permiten analizar sistemáticamente todos los casos posibles de una proposición compuesta. Si p puede ser V o F, y q también puede ser V o F, entonces tenemos 4 combinaciones posibles: VV, VF, FV, FF. Analizar cada combinación nos permite determinar cuándo una proposición compuesta es verdadera.",
  "Esta herramienta no es solo abstracta: la usamos cuando analizamos argumentos en debates, cuando identificamos falacias en noticias o publicidad, y cuando tomamos decisiones con condiciones múltiples (\"si tengo dinero Y hay descuento, entonces compro\").",
];

/** Recuadro «importante» de la lectura A1 — verbatim. */
export const RECUADRO_A1 =
  "La Olimpiada Mexicana de Matemáticas (OMM) ha formado a generaciones de jóvenes talentosos. México ocupa consistentemente los primeros lugares en la Olimpiada Iberoamericana de Matemáticas y ha ganado medallas en la Olimpiada Internacional.";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: { pregunta: string; guia: string }[] = [
  { pregunta: "¿Cuándo es verdadera una conjunción (p Y q)?", guia: "Solo cuando ambas proposiciones son verdaderas." },
  { pregunta: "¿Cuándo es falsa una disyunción (p O q)?", guia: "Solo cuando ambas proposiciones son falsas." },
  { pregunta: "¿Cuántas combinaciones posibles hay con dos proposiciones (p y q)?", guia: "4 combinaciones: VV, VF, FV, FF." },
];

/** Hechos: quiz A5 (verdadero/falso), cada enunciado con su retroalimentación — verbatim. */
export const HECHOS: string[] = [
  "Verdadero: «Una proposición es un enunciado que puede ser verdadero o falso». Correcto: tiene un valor de verdad definido.",
  "Falso: «La disyunción (o) es verdadera solo si ambas proposiciones son verdaderas». La disyunción es verdadera si al menos una lo es.",
  "Verdadero: «La conjunción p ∧ q es falsa si al menos una proposición es falsa». Correcto: basta una falsa para que sea falsa.",
  "Falso: «Una pregunta como '¿qué hora es?' es una proposición lógica». Las preguntas no tienen valor de verdad, no son proposiciones.",
];

/** Reflexión A3 — consigna y pistas verbatim. */
export const REFLEXION_A3 = {
  prompt:
    "Encuentra en las noticias, redes sociales o publicidad un argumento que uses para analizarlo lógicamente. Identifica sus proposiciones, su forma lógica (¿qué conectivos usa?) y determina si el argumento es válido o tiene fallas. Explica si te convenció o no, y por qué.",
  pistas: ["¿Hay argumentos tipo 'si haces X, entonces Y'?", "¿Hay promesas que usen 'si y solo si'?", "¿Hay afirmaciones que combinen condiciones con Y u O?"],
};

/** Autoevaluación A7 — criterios y reflexión final verbatim. */
export const AUTOEVALUACION_A7 = {
  criterios: ["Identifico proposiciones y distingo conjunción, disyunción y negación.", "Construyo y leo tablas de verdad.", "Reconozco proposiciones condicionales y bicondicionales."],
  reflexion: "¿Dónde podrías usar la lógica para analizar un argumento de la vida diaria?",
};

/**
 * Glosario: no existe un glosario interactivo en esta progresión. Se arma con
 * definiciones verbatim de la propia progresión: A5 (proposición), A1 (tabla de
 * verdad), A2 (tautología, contradicción, contingencia) y A9 (los conectivos).
 */
export const GLOSARIO: { termino: string; definicion: string; origen: string }[] = [
  { termino: "Proposición", definicion: "Una proposición es un enunciado que puede ser verdadero o falso.", origen: "A5" },
  { termino: "Conjunción (p Y q)", definicion: "Es verdadera solo si las dos proposiciones son verdaderas.", origen: "A9" },
  { termino: "Disyunción (p O q)", definicion: "Es falsa solo si las dos proposiciones son falsas.", origen: "A9" },
  { termino: "Negación (NO p)", definicion: "Invierte el valor de verdad de la proposición original.", origen: "A9" },
  { termino: "Implicación (si p, entonces q)", definicion: "Es falsa únicamente cuando p es verdadera y q es falsa.", origen: "A9" },
  { termino: "Bicondicional (p si y solo si q)", definicion: "Es verdadera cuando ambas proposiciones tienen el mismo valor de verdad.", origen: "A9" },
  { termino: "Tabla de verdad", definicion: "Las tablas de verdad nos permiten analizar sistemáticamente todos los casos posibles de una proposición compuesta.", origen: "A1" },
  { termino: "Tautología · contradicción · contingencia", definicion: "Tautología (siempre verdadera), contradicción (siempre falsa) o contingencia (a veces verdadera).", origen: "A2" },
];

export const FUENTE =
  "CEN Bachillerato — PM-I, progresión 1 (códigos PM-I-P03): lectura A1 (Material elaborado para CEN Bachillerato), ejercicio A2, reflexión A3, quiz A4, verdadero/falso A5, texto A6, autoevaluación A7 y relacionar columnas A9.";

export const PROBLEMA =
  "«Si tengo dinero Y hay descuento, entonces compro.» Cada vez que decides con condiciones, razonas con conectivos lógicos. En este laboratorio los conectivos son compuertas de un circuito: las proposiciones verdaderas llevan corriente y el foco solo se enciende cuando la proposición compuesta es verdadera. Con ese circuito construyes tablas de verdad y pones a prueba razonamientos.";

export const INSTRUCCIONES: string[] = [
  "En Circuito de conectivos, elige un conectivo, pon p y q en V o F con los interruptores y predice si el foco se enciende. Llena las filas de su tabla y di cuál regla de A9 la describe.",
  "En Tabla de verdad, llena las columnas de la expresión fila por fila (toca una casilla para poner V o F) y pruébala en el circuito. Con la tabla correcta, clasifícala.",
  "En Condicional y razonamientos, predice qué formas del condicional equivalen a la original y si cada razonamiento es válido; luego los cuatro mundos posibles lo comprueban.",
  "Clasifica enunciados en «¿Es proposición?» para ganar estrellas y resuelve el reto A2, el quiz A4 y el texto A6.",
];

export const IDEAS: string[] = [
  "Una proposición tiene un solo valor de verdad: V o F. Preguntas, órdenes y deseos no son proposiciones.",
  "Con dos proposiciones hay 4 filas en la tabla (VV, VF, FV, FF); con una sola, 2.",
  "La implicación p → q solo es falsa cuando p es V y q es F; por eso equivale a ¬p ∨ q.",
  "Una tautología es verdadera en todas las filas; una contradicción, en ninguna; una contingencia, en algunas.",
  "La contrapositiva ¬q → ¬p dice lo mismo que p → q; la recíproca y la inversa, no.",
  "Un razonamiento es válido si ningún mundo posible hace verdaderas las premisas y falsa la conclusión.",
  "De Morgan: ¬(p ∧ q) equivale a ¬p ∨ ¬q, y ¬(p ∨ q) equivale a ¬p ∧ ¬q.",
];

/** Quiz A4 «Lógica matemática — Quiz» — verbatim. */
export const QUIZ_A4: QuizEvaluable = {
  titulo: "Lógica matemática — Quiz",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "La proposición compuesta que une dos enunciados con 'y' se llama:",
      opciones: ["Disyunción", "Conjunción", "Negación", "Bicondicional"],
      respuestaCorrecta: 1,
      retroalimentacion: "La conjunción (∧) usa 'y'.",
    },
    {
      enunciado: "La conjunción p ∧ q es verdadera únicamente cuando:",
      opciones: ["Al menos una es verdadera", "Ambas son verdaderas", "Ambas son falsas", "p es falsa"],
      respuestaCorrecta: 1,
      retroalimentacion: "p ∧ q es verdadera solo si ambas lo son.",
    },
    {
      enunciado: "La negación de 'Hoy llueve' es:",
      opciones: ["Hoy hace sol", "Hoy no llueve", "Mañana llueve", "Hoy llueve mucho"],
      respuestaCorrecta: 1,
      retroalimentacion: "La negación (¬) invierte el valor de verdad.",
    },
    {
      enunciado: "Una bicondicional p ↔ q es verdadera cuando p y q tienen:",
      opciones: ["Distinto valor de verdad", "El mismo valor de verdad", "Valor verdadero siempre", "Valor falso siempre"],
      respuestaCorrecta: 1,
      retroalimentacion: "p ↔ q es verdadera si ambas son V o ambas son F.",
    },
  ],
};

/** Actividad A6 «Completa: conectivos lógicos» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "PM-I-P03-A6 · Completa: conectivos lógicos",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "Una ",
    " es un enunciado que puede ser verdadero o falso. Cuando unimos dos con 'y' formamos una ",
    "; con 'o' formamos una disyunción. La ",
    " invierte el valor de verdad de una proposición. La proposición 'si... entonces...' se llama ",
    ".",
  ],
  huecos: [
    { respuesta: "proposición", alternativas: ["proposicion"], pista: "Enunciado con valor de verdad." },
    { respuesta: "conjunción", alternativas: ["conjuncion"], pista: "Usa 'y'." },
    { respuesta: "negación", alternativas: ["negacion"], pista: "Invierte el valor de verdad." },
    { respuesta: "condicional", alternativas: [], pista: "Si... entonces..." },
  ],
};

/**
 * Ejercicio A2 — problema, contexto, pasos guía y respuesta final verbatim.
 * La actividad pide una respuesta de desarrollo; aquí la tabla se captura por
 * sus conteos exactos (lo que se puede calificar con tolerancia 0, igual que en
 * la actividad). La clasificación y la tabla completa se hacen en el modo
 * Tabla de verdad.
 */
export const RETO_A2: RetoNumericoData = {
  titulo: "Tabla de verdad de proposiciones compuestas",
  contexto: "Lógica proposicional: conectivos, tablas de verdad, y clasificación de proposiciones compuestas.",
  problema:
    "Sean p y q proposiciones. Construye la tabla de verdad de: (p ∧ q) → (p ∨ q). Determina si es tautología, contradicción o contingencia. Luego da un ejemplo cotidiano de esta proposición.\n\nCaptura los conteos de tu tabla:",
  campos: [
    { etiqueta: "Combinaciones (filas) de la tabla", objetivo: 4, tolerancia: 0, unidad: "filas" },
    { etiqueta: "Filas en que p ∧ q es V", objetivo: 1, tolerancia: 0, unidad: "filas" },
    { etiqueta: "Filas en que p ∨ q es V", objetivo: 3, tolerancia: 0, unidad: "filas" },
    { etiqueta: "Filas en que (p ∧ q) → (p ∨ q) es V", objetivo: 4, tolerancia: 0, unidad: "filas" },
  ],
  pasosGuia: [
    "1. Lista las 4 combinaciones posibles de valores de p y q: VV, VF, FV, FF.",
    "2. Calcula p ∧ q (conjunción: verdadera solo si ambas son V).",
    "3. Calcula p ∨ q (disyunción: falsa solo si ambas son F).",
    "4. Calcula la implicación: A → B es falsa solo cuando A es V y B es F.",
    "5. Revisa si el resultado final es siempre V, siempre F o varía.",
  ],
  respuestaFinal:
    "La proposición es una tautología (siempre verdadera). Si se cumplen las dos condiciones (p ∧ q = V), entonces al menos una se cumple (p ∨ q = V) también. Ejemplo: 'Si estudio Y duermo bien, entonces estudio O duermo bien'.",
};
