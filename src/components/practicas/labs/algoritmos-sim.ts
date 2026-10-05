/**
 * Simuladores del «Constructor de algoritmos».
 *
 * Módulo PURO (sin React). Dos motores:
 *  1. `ejecutarRobot`: el robot repartidor «Chispa» ejecuta, paso a paso, el
 *     programa de bloques del alumno sobre una cuadrícula. Un orden equivocado
 *     se ve: choca, se pasa de la meta o se queda corto.
 *  2. `ejecutarFlujo`: un diagrama de flujo armado en cualquier orden se
 *     EJECUTA con datos de prueba; el primer paso imposible (usar una variable
 *     que aún no existe, decidir antes de leer…) queda marcado en rojo.
 *
 * Los problemas del diagrama son los de `algoritmos-data.ts` (verbatim).
 */

import { PROBLEMAS } from "./algoritmos-data";

/* ═══════════════════════════ Robot en cuadrícula ═══════════════════════════ */

/** 0 = norte, 1 = este, 2 = sur, 3 = oeste. */
export type Dir = 0 | 1 | 2 | 3;
export type BloqueRobot = "avanzar" | "izq" | "der" | "rep3" | "mientras" | "si";

export const BLOQUES_ROBOT: Record<BloqueRobot, { texto: string; icono: string; estructura: "secuencial" | "condicional" | "repetitiva"; color: string }> = {
  avanzar: { texto: "Avanzar una casilla", icono: "fa-arrow-up", estructura: "secuencial", color: "#34D399" },
  izq: { texto: "Girar a la izquierda", icono: "fa-rotate-left", estructura: "secuencial", color: "#34D399" },
  der: { texto: "Girar a la derecha", icono: "fa-rotate-right", estructura: "secuencial", color: "#34D399" },
  rep3: { texto: "Repetir 3 veces: avanzar", icono: "fa-repeat", estructura: "repetitiva", color: "#C792EA" },
  mientras: { texto: "Mientras haya camino: avanzar", icono: "fa-forward", estructura: "repetitiva", color: "#C792EA" },
  si: { texto: "Si hay pared adelante: girar a la derecha; si no: avanzar", icono: "fa-code-branch", estructura: "condicional", color: "#F2A33C" },
};

export interface NivelRobot {
  id: string;
  titulo: string;
  enunciado: string;
  pista: string;
  cols: number;
  rows: number;
  inicio: { x: number; y: number; dir: Dir };
  meta: { x: number; y: number };
  muros: string[];
  maxBloques: number;
  permitidos: BloqueRobot[];
  /** Permite «repetir todo el programa hasta llegar a la meta». */
  bucle: boolean;
  clave: string;
}

const todosMuros = (cols: number, rows: number, libres: string[]): string[] => {
  const out: string[] = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (!libres.includes(`${x},${y}`)) out.push(`${x},${y}`);
  return out;
};

const PASILLO = Array.from({ length: 7 }, (_, x) => `${x},1`);
const CAMINO_C = [
  ...Array.from({ length: 5 }, (_, x) => `${x},0`),
  ...Array.from({ length: 5 }, (_, y) => `4,${y}`),
  ...Array.from({ length: 5 }, (_, x) => `${x},4`),
];

export const NIVELES_ROBOT: NivelRobot[] = [
  {
    id: "secuencia",
    titulo: "1 · Secuencia",
    enunciado: "Lleva a Chispa hasta el paquete. Los pasos se ejecutan uno tras otro, en el orden en que los pongas.",
    pista: "Chispa mira al este. Cuenta cuántas casillas hay hasta arriba del paquete y dónde debe girar.",
    cols: 5,
    rows: 5,
    inicio: { x: 0, y: 3, dir: 1 },
    meta: { x: 3, y: 1 },
    muros: ["1,2", "2,2", "1,1", "2,1", "0,1", "0,2"],
    maxBloques: 8,
    permitidos: ["avanzar", "izq", "der"],
    bucle: false,
    clave: "robot-secuencia",
  },
  {
    id: "repeticion",
    titulo: "2 · Repetición",
    enunciado: "El pasillo es largo y solo caben 2 bloques. Si repites una acción, el programa se acorta.",
    pista: "No necesitas 6 bloques de «Avanzar»: hay bloques que repiten.",
    cols: 7,
    rows: 3,
    inicio: { x: 0, y: 1, dir: 1 },
    meta: { x: 6, y: 1 },
    muros: todosMuros(7, 3, PASILLO),
    maxBloques: 2,
    permitidos: ["avanzar", "rep3", "mientras"],
    bucle: false,
    clave: "robot-repeticion",
  },
  {
    id: "decision",
    titulo: "3 · Decisión",
    enunciado: "El camino da vueltas y no sabes cuántas casillas mide cada tramo. Haz que Chispa decida en cada paso, y repite el programa.",
    pista: "Activa «Repetir el programa». Un solo bloque que mire si hay pared puede bastar.",
    cols: 5,
    rows: 5,
    inicio: { x: 0, y: 0, dir: 1 },
    meta: { x: 0, y: 4 },
    muros: todosMuros(5, 5, CAMINO_C),
    maxBloques: 3,
    permitidos: ["avanzar", "der", "mientras", "si"],
    bucle: true,
    clave: "robot-decision",
  },
];

export interface Micro {
  x: number;
  y: number;
  dir: Dir;
  /** Índice del bloque del programa que está corriendo (-1 al inicio). */
  bloque: number;
  evento: "inicio" | "avanza" | "gira" | "choque" | "espera" | "meta";
}

export interface ResultadoRobot {
  micros: Micro[];
  fin: "meta" | "choque" | "sinMeta" | "limite";
  motivo: string;
}

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];
const LIMITE_MICROS = 60;

export const hayMuro = (n: NivelRobot, x: number, y: number): boolean => x < 0 || y < 0 || x >= n.cols || y >= n.rows || n.muros.includes(`${x},${y}`);

export function ejecutarRobot(n: NivelRobot, programa: BloqueRobot[], repetir: boolean): ResultadoRobot {
  let { x, y, dir } = n.inicio;
  const micros: Micro[] = [{ x, y, dir, bloque: -1, evento: "inicio" }];
  const empuja = (bloque: number, evento: Micro["evento"]) => micros.push({ x, y, dir, bloque, evento });
  const enMeta = () => x === n.meta.x && y === n.meta.y;
  const delante = () => hayMuro(n, x + DX[dir]!, y + DY[dir]!);

  /** Devuelve un texto si la ejecución debe cortarse. */
  const avanzar = (b: number): "choque" | null => {
    if (delante()) {
      empuja(b, "choque");
      return "choque";
    }
    x += DX[dir]!;
    y += DY[dir]!;
    empuja(b, enMeta() ? "meta" : "avanza");
    return null;
  };

  const vueltas = repetir && n.bucle ? 40 : 1;
  for (let v = 0; v < vueltas; v++) {
    for (let b = 0; b < programa.length; b++) {
      const bl = programa[b]!;
      if (micros.length >= LIMITE_MICROS) {
        return { micros, fin: "limite", motivo: "Chispa llevaba demasiadas acciones sin llegar: el programa da vueltas sin avanzar." };
      }
      if (bl === "izq" || bl === "der") {
        dir = ((dir + (bl === "izq" ? 3 : 1)) % 4) as Dir;
        empuja(b, "gira");
      } else if (bl === "avanzar" || bl === "rep3") {
        const veces = bl === "rep3" ? 3 : 1;
        for (let k = 0; k < veces; k++) {
          if (avanzar(b) === "choque") {
            return { micros, fin: "choque", motivo: `Chispa chocó con una pared en la casilla (${x + 1}, ${y + 1}) al ejecutar «${BLOQUES_ROBOT[bl].texto}».` };
          }
          if (enMeta()) break;
        }
      } else if (bl === "mientras") {
        let pasos = 0;
        while (!delante() && !enMeta() && micros.length < LIMITE_MICROS) {
          avanzar(b);
          pasos++;
        }
        if (pasos === 0) empuja(b, "espera");
      } else if (bl === "si") {
        if (delante()) {
          dir = ((dir + 1) % 4) as Dir;
          empuja(b, "gira");
        } else {
          avanzar(b);
        }
      }
      if (enMeta()) return { micros, fin: "meta", motivo: "¡Chispa entregó el paquete!" };
    }
  }
  const falta = Math.abs(n.meta.x - x) + Math.abs(n.meta.y - y);
  return {
    micros,
    fin: "sinMeta",
    motivo: `El programa terminó con Chispa en (${x + 1}, ${y + 1}), a ${falta} casilla${falta === 1 ? "" : "s"} de la meta. Faltó algún paso${repetir ? "" : " (o repetir el programa)"}.`,
  };
}

/* ═══════════════════════ Diagrama de flujo ejecutable ═══════════════════════ */

export interface PruebaFlujo {
  etiqueta: string;
  vars: Record<string, number>;
  esperado: string;
}

interface SpecFlujo {
  inicio: string;
  fin: string;
  leer: string;
  calcular?: { id: string; nombre: string; fn: (v: Record<string, number>) => number };
  decidir: string;
  cond: (v: Record<string, number>, calc: number | null) => boolean;
  si: string;
  no: string;
  textoSi: (v: Record<string, number>) => string;
  textoNo: (v: Record<string, number>) => string;
  pruebas: PruebaFlujo[];
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

const SPECS: Record<string, SpecFlujo> = {
  "par-impar": {
    inicio: "pi1",
    leer: "pi2",
    calcular: { id: "pi3", nombre: "residuo", fn: (v) => v.n! % 2 },
    decidir: "pi4",
    cond: (_v, c) => c === 0,
    si: "pi5",
    no: "pi6",
    fin: "pi7",
    textoSi: () => "Es par",
    textoNo: () => "Es impar",
    pruebas: [
      { etiqueta: "n = 7", vars: { n: 7 }, esperado: "Es impar" },
      { etiqueta: "n = 10", vars: { n: 10 }, esperado: "Es par" },
    ],
  },
  mayor: {
    inicio: "ma1",
    leer: "ma2",
    decidir: "ma3",
    cond: (v) => v.a! > v.b!,
    si: "ma4",
    no: "ma5",
    fin: "ma6",
    textoSi: (v) => `Muestra a = ${v.a}`,
    textoNo: (v) => `Muestra b = ${v.b}`,
    pruebas: [
      { etiqueta: "a = 9, b = 4", vars: { a: 9, b: 4 }, esperado: "Muestra a = 9" },
      { etiqueta: "a = 3, b = 8", vars: { a: 3, b: 8 }, esperado: "Muestra b = 8" },
    ],
  },
  promedio: {
    inicio: "pr1",
    leer: "pr2",
    calcular: { id: "pr3", nombre: "promedio", fn: (v) => (v.c1! + v.c2! + v.c3!) / 3 },
    decidir: "pr4",
    cond: (_v, c) => (c ?? 0) >= 6,
    si: "pr5",
    no: "pr6",
    fin: "pr7",
    textoSi: () => "Aprobado",
    textoNo: () => "Reprobado",
    pruebas: [
      { etiqueta: "8, 7 y 9", vars: { c1: 8, c2: 7, c3: 9 }, esperado: "Aprobado" },
      { etiqueta: "4, 5 y 3", vars: { c1: 4, c2: 5, c3: 3 }, esperado: "Reprobado" },
    ],
  },
};

export const pruebasDe = (problemaId: string): PruebaFlujo[] => SPECS[problemaId]?.pruebas ?? [];

export type EstadoFila = "ok" | "salta" | "error" | "pend";
export interface FilaFlujo {
  id: string;
  estado: EstadoFila;
  nota: string;
}
export interface ResultadoFlujo {
  filas: FilaFlujo[];
  salida: string | null;
  vars: [string, string][];
  /** Mensaje del primer error (null si todo corrió). */
  error: string | null;
  ok: boolean;
}

export function ejecutarFlujo(problemaId: string, orden: string[], prueba: PruebaFlujo): ResultadoFlujo {
  const spec = SPECS[problemaId]!;
  const problema = PROBLEMAS.find((p) => p.id === problemaId)!;
  const vars: [string, string][] = [];
  const filas: FilaFlujo[] = orden.map((id) => ({ id, estado: "pend" as EstadoFila, nota: "" }));
  let leido = false;
  let calc: number | null = null;
  let decidido: boolean | null = null;
  let salida: string | null = null;
  let inicio = false;
  let finOk = false;
  let error: string | null = null;

  const falla = (i: number, msg: string) => {
    filas[i]!.estado = "error";
    filas[i]!.nota = msg;
    error = msg;
  };

  for (let i = 0; i < orden.length && !error; i++) {
    const id = orden[i]!;
    if (i === 0 && id !== spec.inicio) {
      falla(i, "Todo algoritmo comienza con «Inicio»: sin él no se sabe dónde empieza.");
      break;
    }
    if (id === spec.inicio) {
      if (i !== 0) falla(i, "«Inicio» debe ser el primer paso.");
      else {
        inicio = true;
        filas[i]!.estado = "ok";
        filas[i]!.nota = "Comienza";
      }
    } else if (id === spec.fin) {
      if (i !== orden.length - 1) falla(i, "«Fin» cierra el algoritmo: lo que va después nunca se ejecuta.");
      else {
        finOk = true;
        filas[i]!.estado = "ok";
        filas[i]!.nota = "Termina";
      }
    } else if (id === spec.leer) {
      leido = true;
      for (const [k, v] of Object.entries(prueba.vars)) vars.push([k, String(v)]);
      filas[i]!.estado = "ok";
      filas[i]!.nota = `Lee ${prueba.etiqueta}`;
    } else if (spec.calcular && id === spec.calcular.id) {
      if (!leido) falla(i, "Se usa un dato que todavía no se leyó: primero hay que leer los valores.");
      else {
        calc = spec.calcular.fn(prueba.vars);
        vars.push([spec.calcular.nombre, fmt(calc)]);
        filas[i]!.estado = "ok";
        filas[i]!.nota = `${spec.calcular.nombre} = ${fmt(calc)}`;
      }
    } else if (id === spec.decidir) {
      if (!leido || (spec.calcular && calc === null)) {
        falla(i, "No se puede decidir: aún no hay un valor que comparar.");
      } else {
        decidido = spec.cond(prueba.vars, calc);
        filas[i]!.estado = "ok";
        filas[i]!.nota = decidido ? "Se cumple: camino «Sí»" : "No se cumple: camino «No»";
      }
    } else if (id === spec.si || id === spec.no) {
      if (decidido === null) {
        falla(i, "Se muestra un resultado antes de decidir: el algoritmo no sabe qué camino tomar.");
      } else if ((id === spec.si) === decidido) {
        salida = id === spec.si ? spec.textoSi(prueba.vars) : spec.textoNo(prueba.vars);
        filas[i]!.estado = "ok";
        filas[i]!.nota = salida;
      } else {
        filas[i]!.estado = "salta";
        filas[i]!.nota = "Este camino no se toma";
      }
    }
  }

  if (!error) {
    if (!inicio) error = "Falta el bloque «Inicio».";
    else if (!finOk) error = "El algoritmo nunca llega a «Fin».";
    else if (salida === null) error = "Terminó sin mostrar ninguna respuesta: falta un bloque de salida que se ejecute.";
    else if (orden.length < problema.pasos.length) error = "Faltan bloques por colocar.";
  }
  const ok = !error && salida === prueba.esperado;
  if (!error && salida !== prueba.esperado) error = `Mostró «${salida}» pero lo correcto era «${prueba.esperado}».`;
  return { filas, salida, vars, error, ok };
}
