/**
 * Datos y cálculo EXACTO de la «sala de museo» del laboratorio de cónicas
 * (PM-IV-P07). Módulo de DATOS PUROS (sin three, sin react): lo comparten el
 * shell (LabConicas.tsx) y las escenas (conicas-*3d.tsx).
 *
 * Lo que se agrega sobre `conicas-data.ts` (que también usa el lab de modelado
 * y por eso no se toca):
 *   · EL CONO DE APOLONIO: un cono de doble napa de semiángulo α cortado por un
 *     plano que gira alrededor de una recta horizontal que cruza el eje a la
 *     altura d. El corte se calcula cerrado, en las coordenadas del propio
 *     plano (u a lo largo de la inclinación, w horizontal):
 *         cono  x² + z² = (y·tan α)²,   plano  (x, y, z) = (u cos θ, d + u sen θ, w)
 *         ⇒  (cos²θ − tan²α·sen²θ)·u² − 2·tan²α·d·sen θ·u + w² − tan²α·d² = 0
 *     El coeficiente A = cos²θ − tan²α·sen²θ decide la curva: A > 0 elipse
 *     (circunferencia si θ = 0), A = 0 parábola (θ = 90° − α, el plano paralelo
 *     a la generatriz), A < 0 hipérbola (el plano corta las dos napas). Con d = 0
 *     el plano pasa por el vértice y salen las degeneradas: punto, recta, par de
 *     rectas. Excentricidad: e = sen θ / cos α.
 *   · Los otros lugares geométricos: elipse (d₁ + d₂ = 2a) e hipérbola
 *     (|d₁ − d₂| = 2a).
 *   · Aplicaciones: antena parabólica (rayos paralelos → foco), órbita de
 *     Kepler (Sol en un foco) y galería de los susurros (de un foco al otro).
 */

const RAD = Math.PI / 180;
const EPS = 1e-6;

/* ── Modos del laboratorio ───────────────────────────────────────────────── */
export type ModoConicas = "cono" | "circunferencia" | "elipse" | "parabola" | "hiperbola" | "aplicaciones";
export type VistaAplicacion = "antena" | "orbita" | "galeria";

/* ═══════════════════════════════════════════════════════════════════════════
 * 1. EL CONO DE APOLONIO
 * ═══════════════════════════════════════════════════════════════════════════ */
/** Semiángulo del cono (entre el eje y la generatriz). */
export const ALFA_DEG = 30;
export const TAN_ALFA = Math.tan(ALFA_DEG * RAD);
/** Altura de cada napa (unidades de la escena = unidades de la pizarra). */
export const H_NAPA = 3.2;
/** Radio del borde de cada napa. */
export const R_BORDE = TAN_ALFA * H_NAPA;
/** Inclinación de la generatriz respecto a la horizontal: 90° − α. */
export const ANG_GENERATRIZ = 90 - ALFA_DEG;

export const TH_MIN = 0, TH_MAX = 85, TH_STEP = 1, TH_DEF = 25;
export const DC_MIN = -2.4, DC_MAX = 2.4, DC_STEP = 0.1, DC_DEF = 2;

export type TipoCorte = "circunferencia" | "elipse" | "parabola" | "hiperbola" | "punto" | "recta" | "rectas";

export const NOMBRE_CORTE: Record<TipoCorte, string> = {
  circunferencia: "Circunferencia",
  elipse: "Elipse",
  parabola: "Parábola",
  hiperbola: "Hipérbola",
  punto: "Punto",
  recta: "Recta",
  rectas: "Par de rectas",
};

export const COLOR_CORTE: Record<TipoCorte, string> = {
  circunferencia: "#34d399",
  elipse: "#38bdf8",
  parabola: "#fbbf24",
  hiperbola: "#f472b6",
  punto: "#c4b5fd",
  recta: "#c4b5fd",
  rectas: "#c4b5fd",
};

/** Por qué sale esa curva (retroalimentación inmediata). */
export const POR_QUE_CORTE: Record<TipoCorte, string> = {
  circunferencia: "El plano es perpendicular al eje (θ = 0°): todos los puntos del corte quedan a la misma distancia del eje.",
  elipse: `El plano está menos inclinado que la generatriz (θ < ${ANG_GENERATRIZ}°): corta todas las generatrices de una napa y la curva se cierra.`,
  parabola: `El plano es paralelo a la generatriz (θ = ${ANG_GENERATRIZ}°): la curva nunca se cierra, se abre hacia el borde.`,
  hiperbola: `El plano está más inclinado que la generatriz (θ > ${ANG_GENERATRIZ}°): corta las DOS napas y salen dos ramas.`,
  punto: "El plano pasa por el vértice y no toca nada más: la cónica degenera en un punto.",
  recta: "El plano pasa por el vértice y es tangente al cono a lo largo de una generatriz: degenera en una recta.",
  rectas: "El plano pasa por el vértice y entra en el cono: corta dos generatrices, un par de rectas que se cruzan.",
};

export type P2 = [number, number];

export interface Corte {
  tipo: TipoCorte;
  theta: number;     // grados
  d: number;         // altura a la que el plano cruza el eje
  A: number;         // coeficiente de u² (decide el tipo)
  e: number;         // excentricidad sen θ / cos α
  centro: number;    // u del centro (elipse, hipérbola) o del vértice (parábola)
  orient: 1 | -1;    // hacia dónde abre la parábola en u
  a: number; b: number;   // semiejes (circunferencia: a = b = r)
  p: number;         // parámetro de la parábola (|p|)
  m: number;         // pendiente de las rectas degeneradas
  tramos: P2[][];    // la curva en coordenadas del plano (u, w), recortada al cono
  uMin: number; uMax: number; wMax: number;  // extensión de la placa de corte
}

/** Corta una polilínea donde sale del cono (|y| > H) e interpola el borde. */
function recortar(pts: P2[], d: number, s: number): P2[][] {
  const yDe = (u: number) => d + u * s;
  const dentro = (p: P2) => Math.abs(yDe(p[0])) <= H_NAPA + 1e-9;
  const tramos: P2[][] = [];
  let actual: P2[] = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!;
    const prev = i > 0 ? pts[i - 1]! : null;
    const inP = dentro(p);
    const inPrev = prev ? dentro(prev) : false;
    if (prev && inP !== inPrev) {
      // punto exacto del borde (|y| = H) sobre el segmento
      const y1 = yDe(prev[0]), y2 = yDe(p[0]);
      const lim = (inP ? y1 : y2) > 0 ? H_NAPA : -H_NAPA;
      const l = Math.abs(y2 - y1) < 1e-12 ? 0 : (lim - y1) / (y2 - y1);
      const q: P2 = [prev[0] + (p[0] - prev[0]) * l, prev[1] + (p[1] - prev[1]) * l];
      if (inP) { actual = [q]; } else { actual.push(q); if (actual.length > 1) tramos.push(actual); actual = []; }
    }
    if (inP) actual.push(p);
  }
  if (actual.length > 1) tramos.push(actual);
  return tramos;
}

/** El corte del cono de doble napa por el plano (θ grados, d altura). Exacto. */
export function corteCono(thetaDeg: number, dRaw: number): Corte {
  const d = Math.abs(dRaw) < EPS ? 0 : dRaw;
  const th = thetaDeg * RAD;
  const s = Math.sin(th), c = Math.cos(th), t2 = TAN_ALFA * TAN_ALFA;
  const dif = thetaDeg - ANG_GENERATRIZ;
  const paralelo = Math.abs(dif) < EPS;
  const A = paralelo ? 0 : c * c - t2 * s * s;
  const e = s / Math.cos(ALFA_DEG * RAD);

  let tipo: TipoCorte;
  if (d === 0) tipo = paralelo ? "recta" : dif < 0 ? "punto" : "rectas";
  else if (thetaDeg < EPS) tipo = "circunferencia";
  else tipo = paralelo ? "parabola" : dif < 0 ? "elipse" : "hiperbola";

  let centro = 0, a = 0, b = 0, p = 0, m = 0;
  let orient: 1 | -1 = 1;
  let crudos: P2[][] = [];
  const N = 220;

  if (tipo === "circunferencia" || tipo === "elipse") {
    centro = (t2 * d * s) / A;
    a = Math.abs(TAN_ALFA * d * c / A);
    b = Math.abs(TAN_ALFA * d * c) / Math.sqrt(A);
    const pts: P2[] = [];
    for (let i = 0; i <= N; i++) {
      const f = (i / N) * Math.PI * 2;
      pts.push([centro + a * Math.cos(f), b * Math.sin(f)]);
    }
    crudos = [pts];
  } else if (tipo === "parabola") {
    // w² = 2·tan²α·d·sen θ·u + tan²α·d²  → vértice en u = −d / (2 sen θ)
    centro = -d / (2 * s);
    orient = d > 0 ? 1 : -1;
    p = Math.abs((t2 * d * s) / 2);
    const pts: P2[] = [];
    const W = R_BORDE * 1.02;
    for (let i = 0; i <= N; i++) {
      const w = -W + (i / N) * 2 * W;
      pts.push([(w * w - t2 * d * d) / (2 * t2 * d * s), w]);
    }
    crudos = [pts];
  } else if (tipo === "hiperbola") {
    centro = (t2 * d * s) / A;
    a = Math.abs(TAN_ALFA * d * c / A);
    b = Math.abs(TAN_ALFA * d * c) / Math.sqrt(-A);
    const S = Math.asinh((R_BORDE * 1.05) / b);
    for (const rama of [1, -1]) {
      const pts: P2[] = [];
      for (let i = 0; i <= N; i++) {
        const t = -S + (i / N) * 2 * S;
        pts.push([centro + rama * a * Math.cosh(t), b * Math.sinh(t)]);
      }
      crudos.push(pts);
    }
  } else if (tipo === "recta" || tipo === "rectas") {
    m = tipo === "rectas" ? Math.sqrt(-A) : 0;
    const U = (H_NAPA + 0.2) / Math.max(s, EPS);
    const signos = tipo === "rectas" ? [1, -1] : [0];
    for (const sg of signos) {
      const pts: P2[] = [];
      for (let i = 0; i <= 40; i++) {
        const u = -U + (i / 40) * 2 * U;
        pts.push([u, sg * m * u]);
      }
      crudos.push(pts);
    }
  }

  const tramos = tipo === "punto" ? [[[0, 0] as P2]] : crudos.flatMap((t) => recortar(t, d, s));

  // Placa: cubre la rebanada del cono que atraviesa (más un margen).
  const margenY = 0.4, margenX = 0.65;
  const xLim = R_BORDE + margenX;
  let uMin = -xLim / Math.max(c, 0.05), uMax = xLim / Math.max(c, 0.05);
  if (s > EPS) {
    uMin = Math.max(uMin, (-H_NAPA - margenY - d) / s);
    uMax = Math.min(uMax, (H_NAPA + margenY - d) / s);
  }
  return { tipo, theta: thetaDeg, d, A, e, centro, orient, a, b, p, m, tramos, uMin, uMax, wMax: R_BORDE + 0.55 };
}

/** La curva del corte en sus coordenadas canónicas (centro o vértice en el origen). */
export function corteCanonico(k: Corte): P2[][] {
  return k.tramos.map((t) => t.map(([u, w]) => [(u - k.centro) * k.orient, w] as P2));
}

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");
export const f2 = (n: number) => ES(n, 2);
export const f1 = (n: number) => ES(n, 1);
export const f0 = (n: number) => ES(Math.round(n), 0);

/** Ecuación canónica del corte (en el plano de corte, con su centro o vértice en el origen). */
export function ecuacionCorte(k: Corte): string {
  switch (k.tipo) {
    case "circunferencia": return `x² + y² = ${f2(k.a * k.a)}`;
    case "elipse": return `x²/${f2(k.a * k.a)} + y²/${f2(k.b * k.b)} = 1`;
    case "parabola": return `y² = 4(${f2(k.p)})x`;
    case "hiperbola": return `x²/${f2(k.a * k.a)} − y²/${f2(k.b * k.b)} = 1`;
    case "punto": return `${f2(k.A)}x² + y² = 0  →  solo (0, 0)`;
    case "recta": return "y² = 0  →  la recta y = 0";
    case "rectas": return `y = ±${f2(k.m)}x`;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2. ELIPSE — el método del jardinero: d₁ + d₂ = 2a (el largo del hilo)
 * ═══════════════════════════════════════════════════════════════════════════ */
export const AE_MIN = 3, AE_MAX = 7, AE_STEP = 0.5, AE_DEF = 6;
export const CE_MIN = 0, CE_STEP = 0.5, CE_DEF = 4;

export interface Elipse { a: number; b: number; c: number; e: number }
export function calcElipse(a: number, c: number): Elipse {
  const cc = Math.min(c, a);
  return { a, c: cc, b: Math.sqrt(Math.max(0, a * a - cc * cc)), e: cc / a };
}
/** Punto de la elipse para la fase 0..1 (ángulo excéntrico). */
export function puntoElipse(el: Elipse, fase: number): P2 {
  const f = fase * Math.PI * 2;
  return [el.a * Math.cos(f), el.b * Math.sin(f)];
}
/** Distancias de un punto a los focos (−c, 0) y (c, 0). */
export function distFocos(pt: P2, c: number): { d1: number; d2: number } {
  return { d1: Math.hypot(pt[0] + c, pt[1]), d2: Math.hypot(pt[0] - c, pt[1]) };
}
export function ecElipse(el: Elipse): string {
  return `x²/${f2(el.a * el.a)} + y²/${f2(el.b * el.b)} = 1`;
}
export function curvaElipse(el: Elipse, n = 200): P2[] {
  const pts: P2[] = [];
  for (let i = 0; i <= n; i++) pts.push(puntoElipse(el, i / n));
  return pts;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3. HIPÉRBOLA — |d₁ − d₂| = 2a
 * ═══════════════════════════════════════════════════════════════════════════ */
export const AH_MIN = 1, AH_MAX = 4, AH_STEP = 0.5, AH_DEF = 3;
export const CH_MAX = 7, CH_STEP = 0.5, CH_DEF = 5;
/** Medio lado de la pizarra (unidades del plano). */
export const LADO_PIZARRA = 8;

export interface Hiperbola { a: number; b: number; c: number; e: number; sMax: number }
export function calcHiperbola(a: number, c: number): Hiperbola {
  const cc = Math.max(c, a + 0.01);
  const b = Math.sqrt(cc * cc - a * a);
  const lim = LADO_PIZARRA - 0.6;
  const sMax = Math.min(Math.asinh(lim / b), Math.acosh(Math.max(1.0001, lim / a)));
  return { a, b, c: cc, e: cc / a, sMax };
}
/** Punto P: la primera mitad de la fase recorre la rama derecha; la segunda, la izquierda. */
export function puntoHiperbola(h: Hiperbola, fase: number): P2 {
  const f = ((fase % 1) + 1) % 1;
  const rama = f < 0.5 ? 1 : -1;
  const local = (f % 0.5) / 0.5;
  const s = h.sMax * Math.sin(local * Math.PI * 2);
  return [rama * h.a * Math.cosh(s), h.b * Math.sinh(s)];
}
export function ramaHiperbola(h: Hiperbola, rama: 1 | -1, n = 120): P2[] {
  const pts: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const s = -h.sMax + (i / n) * 2 * h.sMax;
    pts.push([rama * h.a * Math.cosh(s), h.b * Math.sinh(s)]);
  }
  return pts;
}
export function ecHiperbola(h: Hiperbola): string {
  return `x²/${f2(h.a * h.a)} − y²/${f2(h.b * h.b)} = 1`;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 4. APLICACIONES
 * ═══════════════════════════════════════════════════════════════════════════ */
/* ── 4a. Antena parabólica: y = r²/4f; todo rayo paralelo al eje pasa por (0, f) */
export const R_ANTENA = 3;
export const FA_MIN = 1, FA_MAX = 2.2, FA_STEP = 0.1, FA_DEF = 1.6;
export const HR_MIN = 0.4, HR_MAX = 3.4, HR_STEP = 0.1, HR_DEF = 2.6;
/** Radio del receptor (bocina) que capta la señal. */
export const R_RECEPTOR = 0.14;
/** Radios de los rayos (en el corte); los mismos que se dibujan en anillos. */
export function radiosAntena(n = 6): number[] {
  return Array.from({ length: n }, (_, i) => R_ANTENA * (0.18 + (0.8 * i) / Math.max(1, n - 1)));
}
/**
 * ¿Qué fracción de los rayos reflejados pasa por el receptor colocado a la
 * altura hR? La recta reflejada va del punto de impacto (r, r²/4f) al foco
 * (0, f); su distancia al punto (0, hR) es r·|f − hR| / (r²/4f + f).
 */
export function senalAntena(f: number, hR: number, n = 6): number {
  const rs = radiosAntena(n);
  const ok = rs.filter((r) => (r * Math.abs(f - hR)) / ((r * r) / (4 * f) + f) < R_RECEPTOR).length;
  return ok / rs.length;
}

/* ── 4b. Órbita de Kepler: el Sol en un foco ─────────────────────────────── */
export const A_ORBITA = 5;
export const EO_MIN = 0, EO_MAX = 0.97, EO_STEP = 0.01, EO_DEF = 0.6;
export const ORBITAS: { label: string; e: number; icono: string; desc: string }[] = [
  { label: "Tierra", e: 0.017, icono: "fa-earth-americas", desc: "La órbita de la Tierra es casi una circunferencia (e ≈ 0.017)." },
  { label: "Mercurio", e: 0.21, icono: "fa-circle", desc: "Mercurio tiene la órbita más excéntrica de los planetas (e ≈ 0.21)." },
  { label: "Plutón", e: 0.25, icono: "fa-snowflake", desc: "Plutón: e ≈ 0.25; a veces queda más cerca del Sol que Neptuno." },
  { label: "Cometa Halley", e: 0.97, icono: "fa-meteor", desc: "El cometa Halley: e ≈ 0.97, una elipse larguísima." },
];
/** Resuelve la ecuación de Kepler M = E − e·sen E (Newton). */
export function anomaliaExcentrica(M: number, e: number): number {
  let E = e < 0.8 ? M : Math.PI;
  for (let i = 0; i < 12; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}
export interface PosOrbita { x: number; y: number; r: number; r2: number; vRel: number }
/**
 * Posición del planeta para la fase 0..1 (anomalía media, avanza parejo con el
 * tiempo). Centro de la elipse en el origen; el Sol en el foco (c, 0).
 */
export function posicionOrbita(fase: number, e: number, a = A_ORBITA): PosOrbita {
  const b = a * Math.sqrt(1 - e * e), c = a * e;
  const E = anomaliaExcentrica(fase * Math.PI * 2, e);
  const x = a * Math.cos(E), y = b * Math.sin(E);
  const r = Math.hypot(x - c, y), r2 = Math.hypot(x + c, y);
  return { x, y, r, r2, vRel: Math.sqrt(Math.max(0, (2 * a) / r - 1)) };
}

/* ── 4c. Galería de los susurros: de un foco al otro ─────────────────────── */
export const A_GALERIA = 6;
export const CG_MIN = 2, CG_MAX = 5, CG_STEP = 0.5, CG_DEF = 4;
export const XL_MIN = -5, XL_MAX = 5.5, XL_STEP = 0.5, XL_DEF = 1;
export const R_OYENTE = 0.4;
export interface RayoGaleria { sale: P2; choca: P2; llega: P2; largo: number }
/** Rayos que salen del foco (−c, 0), chocan con la pared y van al foco (c, 0). */
export function rayosGaleria(a: number, c: number, n: number): RayoGaleria[] {
  const b = Math.sqrt(a * a - c * c);
  const out: RayoGaleria[] = [];
  for (let j = 0; j < n; j++) {
    const ang = ((j + 0.5) / n) * Math.PI * 2;
    const dx = Math.cos(ang), dy = Math.sin(ang);
    // (−c + t dx)²/a² + (t dy)²/b² = 1
    const qa = (dx * dx) / (a * a) + (dy * dy) / (b * b);
    const qb = (-2 * c * dx) / (a * a);
    const qc = (c * c) / (a * a) - 1;
    const t = (-qb + Math.sqrt(qb * qb - 4 * qa * qc)) / (2 * qa);
    const choca: P2 = [-c + t * dx, t * dy];
    out.push({ sale: [-c, 0], choca, llega: [c, 0], largo: t + Math.hypot(choca[0] - c, choca[1]) });
  }
  return out;
}
/** Fracción del sonido reflejado que pasa a menos de R_OYENTE del oyente (xL, 0). */
export function senalGaleria(a: number, c: number, xL: number, n = 24): number {
  const rs = rayosGaleria(a, c, n);
  const ok = rs.filter(({ choca, llega }) => {
    const vx = llega[0] - choca[0], vy = llega[1] - choca[1];
    const wx = xL - choca[0], wy = 0 - choca[1];
    const l = Math.hypot(vx, vy) || 1;
    return Math.abs(vx * wy - vy * wx) / l < R_OYENTE;
  }).length;
  return ok / rs.length;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 5. TEORÍA DE LA SALA (texto propio de esta versión; el curricular sigue en
 *    conicas-data.ts y en la ficha)
 * ═══════════════════════════════════════════════════════════════════════════ */
export const IDEAS_MUSEO: string[] = [
  "Apolonio de Perga (siglo III a. C.) estudió las cónicas como cortes de un cono de doble napa y les dio los nombres de elipse, parábola e hipérbola.",
  `En este cono el semiángulo es α = ${ALFA_DEG}°, así que la generatriz está inclinada ${ANG_GENERATRIZ}° respecto a la horizontal. Comparar la inclinación θ del plano con esos ${ANG_GENERATRIZ}° decide la curva.`,
  "La excentricidad del corte es e = sen θ / cos α: vale 0 en la circunferencia, está entre 0 y 1 en la elipse, es exactamente 1 en la parábola y mayor que 1 en la hipérbola.",
  "Si el plano pasa por el vértice del cono, la cónica degenera: un punto, una recta (la generatriz) o un par de rectas que se cruzan.",
  "Elipse: el conjunto de puntos cuya SUMA de distancias a dos focos es constante e igual a 2a. Por eso se traza con un hilo atado a dos clavos (el método del jardinero).",
  "Hipérbola: el conjunto de puntos cuya DIFERENCIA de distancias a dos focos es constante, en valor absoluto, e igual a 2a. Sus dos ramas se acercan a las asíntotas y = ±(b/a)x.",
  "En la elipse b² = a² − c²; en la hipérbola b² = c² − a². En ambas, la excentricidad es e = c/a.",
  "Primera ley de Kepler (1609): cada planeta recorre una elipse con el Sol en uno de sus focos. Va más rápido cuando está más cerca del Sol.",
  "Propiedad reflectora de la elipse: lo que sale de un foco y rebota en la curva llega al otro foco, y todos los caminos miden 2a. Así funcionan las galerías de los susurros y los reflectores elípticos que rompen cálculos renales (litotricia).",
];

export const DATOS_MUSEO: { valor: string; texto: string; icono: string }[] = [
  { valor: "d₁ + d₂ = 2a", texto: "elipse: suma de distancias a los focos", icono: "fa-circle-nodes" },
  { valor: "|d₁ − d₂| = 2a", texto: "hipérbola: diferencia de distancias", icono: "fa-arrows-left-right" },
  { valor: "x²/a² + y²/b² = 1", texto: "elipse centrada en el origen", icono: "fa-circle" },
  { valor: "x²/a² − y²/b² = 1", texto: "hipérbola centrada en el origen", icono: "fa-bezier-curve" },
  { valor: "e = sen θ / cos α", texto: "excentricidad del corte del cono", icono: "fa-ruler-combined" },
  { valor: "GTM · 50 m", texto: "reflector parabólico del INAOE en Sierra Negra, Puebla", icono: "fa-satellite-dish" },
];
