/**
 * Datos para el laboratorio "Optimización con la derivada: la lata de mínimo
 * material" (PM-V-P07-A2, ejercicio_matematico "Resolviendo problemas de
 * optimización en contextos reales"; UAC PM-V Cálculo Diferencial; progresión 7).
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabOptimizacion.tsx) y la escena 3D (OptimizacionScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-V P7, verbatim A2):
 *  Optimizar = encontrar el MEJOR valor posible (máximo o mínimo) de una
 *  magnitud sujeta a una restricción, usando la derivada:
 *    1. Modelar la cantidad a optimizar y la restricción.
 *    2. Reducir a UNA variable usando la restricción.
 *    3. Derivar la función objetivo e igualar a cero (punto crítico).
 *    4. Verificar que es el óptimo y traducirlo al contexto.
 *
 * Problema verbatim del A2 (Vitro, Monterrey): una caja cilíndrica SIN TAPA de
 * volumen V = 1000 cm³; minimizar el material = base circular + área lateral.
 *  · Restricción:  V = π r² h = 1000      ⇒  h = 1000 / (π r²)
 *  · Objetivo:     A(r) = π r² + 2π r h = π r² + 2000 / r
 *  · Derivada:     A'(r) = 2π r − 2000 / r²
 *  · A'(r) = 0  ⇒  r³ = 1000 / π  ⇒  r = (1000/π)^(1/3) ≈ 6.83 cm
 *  · h = 1000 / (π r²) = r ≈ 6.83 cm    (SIN tapa el óptimo cumple h = r)
 *  · Área mínima:  A = 3π r² ≈ 439.3 cm²
 *
 * NOTA matemática: el óptimo de un cilindro SIN tapa es h = r; el de uno CERRADO
 * (con dos tapas) es h = 2r. Todos los valores aquí son EXACTOS / cálculo cerrado.
 */

export type Curva = "total" | "base" | "lateral";

/* ── Constantes del problema (verbatim A2) ────────────────────────────────── */
export const VOLUMEN = 1000;                 // cm³ (restricción)
export const PI = Math.PI;

/* ── Modelo (todo exacto) ─────────────────────────────────────────────────── */
/** Altura impuesta por la restricción V = π r² h = 1000. */
export function hDeR(r: number): number { return VOLUMEN / (PI * r * r); }

/** Área de la base circular, π r². */
export function areaBase(r: number): number { return PI * r * r; }

/** Área lateral, 2π r h = 2000 / r. */
export function areaLateral(r: number): number { return 2000 / r; }

/** Material total (objetivo): A(r) = π r² + 2000 / r. */
export function areaTotal(r: number): number { return PI * r * r + 2000 / r; }

/** Derivada del objetivo: A'(r) = 2π r − 2000 / r². */
export function dArea(r: number): number { return 2 * PI * r - 2000 / (r * r); }

export function valorEn(which: Curva, r: number): number {
  return which === "total" ? areaTotal(r) : which === "base" ? areaBase(r) : areaLateral(r);
}

/* ── Óptimo (cálculo cerrado) ─────────────────────────────────────────────── */
export const R_OPT = Math.cbrt(VOLUMEN / PI);   // (1000/π)^(1/3) ≈ 6.8278
export const H_OPT = hDeR(R_OPT);               // = R_OPT ≈ 6.8278
export const A_OPT = areaTotal(R_OPT);          // = 3π R_OPT² ≈ 439.3
export const V_VERIF = PI * R_OPT * R_OPT * H_OPT; // = 1000 (verificación)

/* ── Rango explorable del radio ───────────────────────────────────────────── */
export const R_MIN = 3;
export const R_MAX = 11;

/* ── Vista del plano de costo (r en x, área en y) ─────────────────────────── */
export interface Vista {
  xmin: number; xmax: number; ymin: number; ymax: number;
  xticks: number[]; yticks: number[];
  xlabel: string; ylabel: string;
}

export const VISTA: Vista = {
  xmin: 0, xmax: 12, ymin: 0, ymax: 900,
  xticks: [0, 2, 4, 6, 8, 10, 12],
  yticks: [0, 200, 400, 600, 800],
  xlabel: "r (cm)", ylabel: "A (cm²)",
};

export type Pt2 = [number, number];

/**
 * Muestrea una curva de área (total, base o lateral) sobre el plano de costo.
 * Devuelve una o varias polilíneas (corta donde se sale del recuadro visible).
 */
export function muestrear(which: Curva, n = 360): Pt2[][] {
  const polis: Pt2[][] = [];
  let actual: Pt2[] = [];
  const lo = 0.6;                 // evita la asíntota en r → 0
  const hi = VISTA.xmax;
  for (let i = 0; i <= n; i++) {
    const r = lo + ((hi - lo) * i) / n;
    const y = valorEn(which, r);
    if (Number.isFinite(y) && y >= VISTA.ymin - 0.5 && y <= VISTA.ymax + 0.5) {
      actual.push([r, y]);
    } else if (actual.length > 1) {
      polis.push(actual); actual = [];
    } else {
      actual = [];
    }
  }
  if (actual.length > 1) polis.push(actual);
  return polis;
}

/** Recorta la recta y = m·x + b al rectángulo de la vista. */
export function clipRecta(m: number, b: number, v: Vista = VISTA): Pt2[] {
  const cand: Pt2[] = [];
  const push = (x: number, y: number) => {
    if (x >= v.xmin - 1e-6 && x <= v.xmax + 1e-6 && y >= v.ymin - 1e-6 && y <= v.ymax + 1e-6) {
      cand.push([Math.min(v.xmax, Math.max(v.xmin, x)), Math.min(v.ymax, Math.max(v.ymin, y))]);
    }
  };
  push(v.xmin, m * v.xmin + b);
  push(v.xmax, m * v.xmax + b);
  if (Math.abs(m) > 1e-9) {
    push((v.ymin - b) / m, v.ymin);
    push((v.ymax - b) / m, v.ymax);
  }
  const out: Pt2[] = [];
  for (const p of cand) {
    if (!out.some((q) => Math.abs(q[0] - p[0]) < 1e-4 && Math.abs(q[1] - p[1]) < 1e-4)) out.push(p);
  }
  return out.length >= 2 ? [out[0]!, out[out.length - 1]!] : [];
}

/** Recta tangente a A(r) en r = a (m = A'(a), b = A(a) − m·a). */
export function tangente(a: number): { m: number; b: number } {
  const m = dArea(a);
  const b = areaTotal(a) - m * a;
  return { m, b };
}

/* ── Resolución paso a paso (pasos_guia verbatim — A2 corregido) ──────────── */
export interface PasoReto { etiqueta: string; texto: string; }

export const PASOS: PasoReto[] = [
  { etiqueta: "1", texto: "Planteamiento: A = πr² (base) + 2πrh (área lateral). Restricción V = πr²h = 1000 → h = 1000/(πr²)." },
  { etiqueta: "2", texto: "Función objetivo en una variable: A(r) = πr² + 2πr·[1000/(πr²)] = πr² + 2000/r." },
  { etiqueta: "3", texto: "Derivar e igualar a cero: A'(r) = 2πr − 2000/r² = 0 → 2πr = 2000/r² → r³ = 1000/π → r = (1000/π)^(1/3)." },
  { etiqueta: "4", texto: "Calcular r: r = (1000/π)^(1/3) = (318.31…)^(1/3) ≈ 6.83 cm." },
  { etiqueta: "5", texto: "Calcular h: h = 1000/(π·6.83²) ≈ 6.83 cm. En el cilindro SIN tapa el óptimo cumple h = r (no h = 2r, que es el del cilindro cerrado). Área mínima A = 3πr² ≈ 439.3 cm²." },
];

/* ── Contenido pedagógico (verbatim-alineado A2 / A1) ─────────────────────── */
export const IDEAS: string[] = [
  "Optimizar es hallar el mejor valor posible (mínimo o máximo) de una cantidad sujeta a una restricción; la derivada localiza ese punto.",
  "Paso clave: usar la restricción (V = 1000) para dejar el objetivo A en UNA sola variable, A(r) = πr² + 2000/r.",
  "En el óptimo, A'(r) = 0: la tangente a la curva de costo es horizontal. Antes A' < 0 (el área baja) y después A' > 0 (el área sube).",
  "El total se reparte entre base (πr², crece con r) y lateral (2000/r, baja con r): el mínimo está donde el ahorro de una compensa el aumento de la otra.",
  "Resultado: r ≈ 6.83 cm, h ≈ 6.83 cm; en el cilindro SIN tapa el óptimo cumple h = r (el cilindro cerrado da h = 2r).",
  "Material mínimo A = 3πr² ≈ 439.3 cm², con el volumen fijo en 1000 cm³: misma capacidad, menos lámina, menos costo.",
];

export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "V = π r² h = 1000", texto: "restricción: el volumen no cambia", icono: "fa-flask" },
  { valor: "A(r) = π r² + 2000/r", texto: "objetivo: material a minimizar", icono: "fa-scroll" },
  { valor: "A'(r) = 0 → r³ = 1000/π", texto: "punto crítico de la derivada", icono: "fa-crosshairs" },
  { valor: "r = h ≈ 6.83 cm", texto: "óptimo del cilindro sin tapa; A ≈ 439.3 cm²", icono: "fa-trophy" },
];

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt0 = (n: number): string => ES(n, 0);
export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);
export const fmt3 = (n: number): string => ES(n, 3);
