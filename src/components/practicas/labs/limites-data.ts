/**
 * Datos para el laboratorio "El límite: a qué se acerca f(x) cuando x→a"
 * (PM-V-P01-A2, ejercicio_matematico "Calculando límites: del límite básico al
 * 0/0 indeterminado"; UAC PM-V Cálculo Diferencial; progresión 1).
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabLimites.tsx) y la escena 3D (LimitesScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-V P1, verbatim A1/A2):
 *  · El LÍMITE es el valor L al que se acerca f(x) cuando x se aproxima a `a`
 *    (por la izquierda y por la derecha), SIN IMPORTAR si f está definida en a.
 *    «La clave es el acercamiento, no la llegada».
 *  · SUSTITUCIÓN DIRECTA cuando el denominador no se anula.
 *  · FORMA INDETERMINADA 0/0: la fracción no existe en x=a (un "hueco"), pero el
 *    límite puede existir — se resuelve factorizando y cancelando.
 *  · LÍMITE NOTABLE lim(x→0) sen(x)/x = 1.
 *
 * Los tres casos son exactamente los del enunciado A2 (auto en la autopista
 * México-Querétaro, s(t)=3t²+5t):
 *   (a) lim(t→2) s(t)/t = 11 km/h  — velocidad promedio (sustitución directa).
 *   (b) lim(x→3) (x²−9)/(x−3) = 6  — 0/0 resuelta por factorización (hueco en x=3).
 *   (c) lim(x→0) sen(2x)/x = 2      — límite notable (hueco en x=0).
 *
 * Todos los valores son EXACTOS (salen de la fórmula). La escena dibuja a escala
 * propia por caso para mostrar valores reales.
 */

export type CasoId = "velocidad" | "indeterminada" | "notable";
export type Lado = "izq" | "der";

export const CASO_DEF: CasoId = "velocidad";
export const LADO_DEF: Lado = "izq";

export type Pt2 = [number, number]; // par (x, y) en coordenadas de DATOS

/* ── Vista (mapeo datos → plano) ──────────────────────────────────────────── */
export interface Vista {
  xmin: number; xmax: number; ymin: number; ymax: number;
  xticks: number[]; yticks: number[];
  xlabel: string; ylabel: string;
}

export interface PasoReto { etiqueta: string; texto: string; }

export interface Caso {
  id: CasoId;
  label: string;          // corto (chips)
  titulo: string;         // descriptivo
  icono: string;
  color: string;
  expr: string;           // fórmula de f
  limStr: string;         // notación del límite, p. ej. "lim(x→3) (x²−9)/(x−3)"
  a: number;              // punto al que tiende x
  L: number;              // valor del límite
  hueco: boolean;         // f(a) NO está definida (0/0) → hueco abierto en (a, L)
  fDefinidaEnA: boolean;  // ¿existe f(a)? (= !hueco)
  metodo: string;         // técnica usada
  unidadX: string;
  unidadY: string;
  vista: Vista;
  domMin: number;         // dominio del deslizador / barrido
  domMax: number;
  xStep: number;
  xDef: number;           // x inicial del deslizador
  contexto: string;       // contexto verbatim (A2/A1)
  pasos: PasoReto[];      // resolución paso a paso (pasos_guia verbatim)
  nota?: string;          // honestidad del modelo
}

/* ── Catálogo de casos (los tres del enunciado A2) ────────────────────────── */
export const CASOS: Caso[] = [
  {
    id: "velocidad",
    label: "(a) Velocidad promedio",
    titulo: "lim(t→2) s(t)/t — sustitución directa",
    icono: "fa-gauge-high",
    color: "#FB923C",
    expr: "g(t) = s(t)/t = 3t + 5",
    limStr: "lim(t→2) s(t)/t",
    a: 2,
    L: 11,
    hueco: false,
    fDefinidaEnA: true,
    metodo: "Sustitución directa (la función es continua en t = 2).",
    unidadX: "h",
    unidadY: "km/h",
    vista: {
      xmin: 0, xmax: 4.2, ymin: 0, ymax: 20,
      xticks: [0, 1, 2, 3, 4], yticks: [0, 5, 10, 15, 20],
      xlabel: "tiempo t (h)", ylabel: "velocidad promedio (km/h)",
    },
    domMin: 0.05, domMax: 4, xStep: 0.05, xDef: 0.6,
    contexto: "Auto en la autopista México-Querétaro con posición s(t) = 3t² + 5t (km). La velocidad promedio de 0 a t es s(t)/t = 3t + 5; al acercar t a 2 h se acerca a 11 km/h.",
    pasos: [
      { etiqueta: "1", texto: "s(2) = 3(4) + 5(2) = 12 + 10 = 22 km." },
      { etiqueta: "2", texto: "s(2)/2 = 22/2 = 11 km/h." },
      { etiqueta: "3", texto: "Interpretación: es la velocidad promedio del auto desde t = 0 hasta t = 2 h." },
    ],
    nota: "La función graficada es g(t) = s(t)/t = 3t + 5 (la velocidad promedio acumulada); en t = 2 vale exactamente 11 km/h. g no está definida en t = 0, pero eso no afecta el límite en t = 2.",
  },
  {
    id: "indeterminada",
    label: "(b) Indeterminada 0/0",
    titulo: "lim(x→3) (x²−9)/(x−3) — factorización",
    icono: "fa-scissors",
    color: "#60A5FA",
    expr: "f(x) = (x²−9)/(x−3) = x + 3",
    limStr: "lim(x→3) (x²−9)/(x−3)",
    a: 3,
    L: 6,
    hueco: true,
    fDefinidaEnA: false,
    metodo: "0/0 indeterminado → factorizar x²−9 = (x+3)(x−3) y cancelar (x−3).",
    unidadX: "",
    unidadY: "",
    vista: {
      xmin: 0, xmax: 6.2, ymin: 0, ymax: 10,
      xticks: [0, 1, 2, 3, 4, 5, 6], yticks: [0, 2, 4, 6, 8, 10],
      xlabel: "x", ylabel: "f(x)",
    },
    domMin: 0, domMax: 6, xStep: 0.05, xDef: 0.8,
    contexto: "Al sustituir x = 3 sale 0/0: la fracción NO existe en x = 3 (hay un hueco), pero la curva es la recta y = x + 3 y al acercar x a 3 los valores se acercan a 6.",
    pasos: [
      { etiqueta: "1", texto: "Sustituye x = 3: (9 − 9)/(3 − 3) = 0/0 — forma indeterminada." },
      { etiqueta: "2", texto: "Factoriza el numerador: x² − 9 = (x + 3)(x − 3)." },
      { etiqueta: "3", texto: "Cancela (x − 3): lim(x→3) (x + 3) = 3 + 3 = 6." },
    ],
    nota: "La función (x²−9)/(x−3) es idéntica a x + 3 en todas partes EXCEPTO en x = 3, donde no está definida (el hueco abierto). El límite vale 6 aunque f(3) no exista.",
  },
  {
    id: "notable",
    label: "(c) Límite notable",
    titulo: "lim(x→0) sen(2x)/x — sen(x)/x = 1",
    icono: "fa-wave-square",
    color: "#34D399",
    expr: "f(x) = sen(2x)/x",
    limStr: "lim(x→0) sen(2x)/x",
    a: 0,
    L: 2,
    hueco: true,
    fDefinidaEnA: false,
    metodo: "Reescribe sen(2x)/x = 2·[sen(2x)/(2x)] y usa lim(u→0) sen(u)/u = 1.",
    unidadX: "rad",
    unidadY: "",
    vista: {
      xmin: -3.2, xmax: 3.2, ymin: -1, ymax: 2.6,
      xticks: [-3, -2, -1, 0, 1, 2, 3], yticks: [-1, 0, 1, 2],
      xlabel: "x (rad)", ylabel: "sen(2x)/x",
    },
    domMin: -3, domMax: 3, xStep: 0.02, xDef: -2.4,
    contexto: "En x = 0 sale 0/0, pero la curva se acerca a 2 por ambos lados. Es el límite notable: para ángulos pequeños sen(u) ≈ u.",
    pasos: [
      { etiqueta: "1", texto: "Reescribe: sen(2x)/x = 2 · [sen(2x)/(2x)]." },
      { etiqueta: "2", texto: "Cuando x→0, también 2x→0, entonces lim(2x→0)[sen(2x)/(2x)] = 1." },
      { etiqueta: "3", texto: "Por lo tanto lim(x→0) sen(2x)/x = 2·1 = 2." },
      { etiqueta: "✓", texto: "Verificación: sen(0.01)/0.01 ≈ 0.9999833 → 2·0.9999833 ≈ 1.9999 ≈ 2." },
    ],
    nota: "sen(2x)/x no está definida en x = 0 (0/0), pero el límite vale exactamente 2. La curva se evalúa con la fórmula real en radianes.",
  },
];

const CASO_MAP: Record<CasoId, Caso> = CASOS.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {} as Record<CasoId, Caso>);

export function caso(id: CasoId): Caso {
  return CASO_MAP[id];
}

/* ── Evaluación (exacta) ──────────────────────────────────────────────────── */
/**
 * Valor f(x) del caso. Devuelve NaN justo en el hueco (0/0) o fuera de un
 * denominador válido — así la escena puede dibujar el hueco abierto.
 */
export function evalCaso(id: CasoId, x: number): number {
  switch (id) {
    case "velocidad":
      // g(t) = s(t)/t = (3t² + 5t)/t = 3t + 5, indefinida en t = 0
      if (Math.abs(x) < 1e-7) return NaN;
      return (3 * x * x + 5 * x) / x;
    case "indeterminada":
      // (x² − 9)/(x − 3), indefinida en x = 3
      if (Math.abs(x - 3) < 1e-7) return NaN;
      return (x * x - 9) / (x - 3);
    case "notable":
      // sen(2x)/x, indefinida en x = 0
      if (Math.abs(x) < 1e-7) return NaN;
      return Math.sin(2 * x) / x;
    default:
      return NaN;
  }
}

export function enDominio(id: CasoId, x: number): boolean {
  const c = caso(id);
  return x >= c.domMin - 1e-9 && x <= c.domMax + 1e-9;
}

/**
 * Muestrea la curva del caso en coordenadas de DATOS. Devuelve una o dos
 * polilíneas (parte un tramo si pasa por el hueco) para que la escena las mapee.
 */
export function muestrear(id: CasoId, n = 240): Pt2[][] {
  const c = caso(id);
  const polis: Pt2[][] = [];
  let actual: Pt2[] = [];
  const lo = c.vista.xmin;
  const hi = c.vista.xmax;
  for (let i = 0; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n;
    const y = evalCaso(id, x);
    if (Number.isFinite(y) && y >= c.vista.ymin - 0.5 && y <= c.vista.ymax + 0.5) {
      actual.push([x, y]);
    } else {
      if (actual.length > 1) polis.push(actual);
      actual = [];
    }
  }
  if (actual.length > 1) polis.push(actual);
  return polis;
}

/* ── Tabla de acercamiento (por la izquierda y por la derecha) ────────────── */
export interface FilaAprox { x: number; y: number; lado: Lado; }

const OFFSETS: number[] = [0.1, 0.01, 0.001];

/** Filas x→a desde ambos lados (las 3 más cercanas por lado), con f(x) exacto. */
export function tablaAprox(id: CasoId): { izq: FilaAprox[]; der: FilaAprox[] } {
  const c = caso(id);
  const izq: FilaAprox[] = [];
  const der: FilaAprox[] = [];
  for (const d of OFFSETS) {
    const xi = c.a - d;
    const xd = c.a + d;
    izq.push({ x: xi, y: evalCaso(id, xi), lado: "izq" });
    der.push({ x: xd, y: evalCaso(id, xd), lado: "der" });
  }
  return { izq, der };
}

/* ── Contenido pedagógico (verbatim-alineado A1/A2) ───────────────────────── */
export const IDEAS: string[] = [
  "El límite es el valor L al que se acerca f(x) cuando x se aproxima a `a`, por la izquierda y por la derecha. La clave es el acercamiento, no la llegada.",
  "El límite puede existir aunque f(a) NO esté definida (un hueco): solo importa hacia dónde se dirige la curva.",
  "Sustitución directa: si el denominador no se anula, lim(x→a) f(x) = f(a).",
  "Forma indeterminada 0/0: la fracción no existe en x = a, pero al factorizar y cancelar el límite puede existir.",
  "Límite notable: lim(x→0) sen(x)/x = 1; por eso sen(x) ≈ x para ángulos pequeños (en radianes).",
  "El límite por la izquierda y el límite por la derecha deben coincidir para que el límite exista.",
];

export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "lim = 11 km/h", texto: "(a) velocidad promedio del auto en t = 2 h", icono: "fa-gauge-high" },
  { valor: "lim = 6", texto: "(b) 0/0 resuelta por factorización en x = 3", icono: "fa-scissors" },
  { valor: "lim = 2", texto: "(c) límite notable sen(2x)/x en x = 0", icono: "fa-wave-square" },
  { valor: "sen(x)/x → 1", texto: "el límite notable que demuestra el círculo unitario", icono: "fa-circle-notch" },
];

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);
export const fmt3 = (n: number): string => ES(n, 3);

/** Número con su unidad (la unidad puede ser ""). */
export function conUnidad(n: number, unidad: string, dec = 2): string {
  if (!Number.isFinite(n)) return "indefinido";
  const s = ES(n, dec);
  return unidad ? `${s} ${unidad}` : s;
}

/** Distancia |x − a| con formato corto (para mostrar el acercamiento). */
export function cercania(id: CasoId, x: number): string {
  const c = caso(id);
  const d = Math.abs(x - c.a);
  if (d < 1e-9) return "0";
  if (d < 0.001) return d.toExponential(1).replace("-", "−");
  return ES(d, 3);
}
