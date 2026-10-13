/**
 * El zoom continuo entre escalas («Powers of Ten») del laboratorio de
 * Fotosíntesis. Matemática pura: sin React.
 *
 * Idea: hay un solo número `z` que va de 0 (planta) a 3 (tilacoide). Cada
 * escala k vive en su propio grupo, centrada en el origen y a tamaño 1 cuando
 * z = k. Entre k y k+1 la escala k crece por un FACTOR alrededor de su
 * «pivote» (el punto donde está la escala siguiente: la hoja protagonista, un
 * cloroplasto, una grana) y la escala k+1 nace diminuta en ese mismo punto y
 * crece hasta llenar el cuadro. Así el alumno ve que el cloroplasto ESTÁ
 * dentro de la célula, que está dentro de la hoja.
 *
 * Fórmulas (f = z − k ∈ [0,1], g = suavizado de f, P = pivote de k):
 *   escala k (la de afuera):    tamaño F^f,     posición −P·(F^f − 1 + g)
 *   escala k+1 (la de adentro): tamaño F^(f−1), posición  P·(1 − g)
 * Con f = 0 la de afuera está intacta; con f = 1 el pivote quedó en el origen
 * y la de adentro está a tamaño 1. El pivote se desliza hacia el centro de la
 * pantalla de forma monótona (sin el «bulto» de interpolar lineal).
 */

import { pivotePlanta, type Vec3 } from "./fotosintesis-geometrias";

/** Cuánto crece cada salto de escala. */
export const FACTOR_ZOOM = 16;
export const NUM_ESCALAS = 4;

/** Dónde está la escala siguiente, dentro de cada escala (coordenadas locales). */
export const PIVOTE_HOJA: Vec3 = [-0.25, 0.7, 1.44];
export const PIVOTE_CLOROPLASTO: Vec3 = [0.35, 0.25, 0.35];

let pivotes: Vec3[] | null = null;
export function pivotes3(): Vec3[] {
  if (!pivotes) pivotes = [pivotePlanta(), PIVOTE_HOJA, PIVOTE_CLOROPLASTO];
  return pivotes;
}

const suave = (f: number) => f * f * (3 - 2 * f);
const escalon = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export interface TransformEscala {
  x: number;
  y: number;
  z: number;
  escala: number;
  /** 0 = invisible, 1 = opaca. */
  alfa: number;
}

/** Posición, tamaño y opacidad de la escala `k` cuando el zoom vale `zoom`. */
export function transformEscala(k: number, zoom: number, out: TransformEscala): TransformEscala {
  const P = pivotes3();
  const F = FACTOR_ZOOM;
  out.x = 0; out.y = 0; out.z = 0; out.escala = 1; out.alfa = 0;
  if (zoom >= k) {
    const f = zoom - k;
    if (f >= 1) return out;
    if (f <= 1e-4 || k >= NUM_ESCALAS - 1) {
      out.alfa = 1;
      return out;
    }
    const p = P[k]!;
    const s = Math.pow(F, f);
    const m = s - 1 + suave(f);
    out.x = -p[0] * m; out.y = -p[1] * m; out.z = -p[2] * m;
    out.escala = s;
    out.alfa = 1 - escalon(0.38, 0.78, f);
    return out;
  }
  const j = k - 1;
  const f = zoom - j;
  if (f <= 0) return out;
  const p = P[j]!;
  const g = suave(f);
  out.x = p[0] * (1 - g); out.y = p[1] * (1 - g); out.z = p[2] * (1 - g);
  out.escala = Math.pow(F, f - 1);
  out.alfa = escalon(0.22, 0.6, f);
  return out;
}

/** Punto de vista preferido de cada escala (coordenadas esféricas). */
export interface VistaEscala {
  /** Azimut alrededor de Y (rad, 0 = de frente, +Z). */
  az: number;
  /** Ángulo polar desde arriba (rad). */
  pol: number;
  dist: number;
  /** Altura del punto al que mira la cámara. */
  ty: number;
  /** Desplazamiento lateral del punto al que mira (para encuadrar). */
  tx: number;
}

export const VISTAS: VistaEscala[] = [
  { az: 0.32, pol: 1.3, dist: 14.6, ty: -0.25, tx: 0.2 },
  { az: 0.55, pol: 1.08, dist: 11.2, ty: -0.25, tx: 0 },
  { az: -0.42, pol: 1.1, dist: 9.4, ty: -0.25, tx: 0 },
  { az: 0.2, pol: 1.17, dist: 13.4, ty: 0.6, tx: 0.2 },
];

/** Color de fondo de cada escala (se mezclan durante el viaje). */
export const FONDOS: [string, string][] = [
  // [cenit, horizonte]
  ["#16120f", "#4a3420"],
  ["#06160f", "#123322"],
  ["#04140c", "#0f2c1c"],
  ["#030c16", "#0b2030"],
];
