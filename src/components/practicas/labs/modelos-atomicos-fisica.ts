/**
 * Física pura del laboratorio de Modelos atómicos (sin three, sin React).
 *
 *   · BOHR: niveles del hidrógeno, E_n = −13,6 eV / n², r_n = n² · a₀, y la
 *     longitud de onda del fotón de cada salto, λ = hc / ΔE.
 *   · RUTHERFORD: dispersión de Coulomb de partículas alfa por núcleos.
 *     Ángulo θ = 2·arctan(d / 2b) con d = distancia mínima de acercamiento
 *     frontal; la estadística sale del parámetro de impacto al núcleo más
 *     cercano en una lámina de grosor t (dispersión simple) — no del azar.
 *     La trayectoria hiperbólica se INTEGRA con la fuerza 1/r².
 *   · SCHRÖDINGER: funciones de onda hidrogenoides reales (n ≤ 4, l ≤ 2) y un
 *     muestreador de |ψ|² para pintar la nube de probabilidad con puntos.
 *
 * Todo es determinista (PRNG con semilla): la misma nube en cada render.
 */

/* ── Constantes ─────────────────────────────────────────────────────── */
export const HC_EV_NM = 1239.84193; // h·c en eV·nm
export const RYDBERG_EV = 13.6057; // energía de ionización del hidrógeno
export const A0_PM = 52.9177; // radio de Bohr en picómetros
export const KE2_MEV_FM = 1.43996; // e²/(4πε₀) en MeV·fm

/* ── PRNG determinista (mulberry32) ─────────────────────────────────── */
export function prng(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ════════════════════════════ BOHR ════════════════════════════════ */

export const N_MAX_BOHR = 6;

/** Energía del nivel n del hidrógeno (eV). */
export const energiaBohr = (n: number): number => -RYDBERG_EV / (n * n);

/** Radio de la órbita n (pm): crece como n². */
export const radioBohrPm = (n: number): number => A0_PM * n * n;

/** Longitud de onda (nm) del fotón emitido o absorbido entre dos niveles. */
export function longitudOndaNm(nA: number, nB: number): number {
  const dE = Math.abs(energiaBohr(nA) - energiaBohr(nB));
  return dE > 0 ? HC_EV_NM / dE : Infinity;
}

/** Energía del fotón (eV) entre dos niveles. */
export const energiaFoton = (nA: number, nB: number): number => Math.abs(energiaBohr(nA) - energiaBohr(nB));

const SERIES = ["Lyman", "Balmer", "Paschen", "Brackett", "Pfund", "Humphreys"];
/** Nombre de la serie espectral según el nivel de llegada (el más bajo). */
export const serieEspectral = (nInferior: number): string => SERIES[nInferior - 1] ?? "—";

export type Region = "ultravioleta" | "visible" | "infrarrojo";
export const regionEspectral = (nm: number): Region => (nm < 380 ? "ultravioleta" : nm > 750 ? "infrarrojo" : "visible");

/**
 * Color aproximado (sRGB) de una longitud de onda visible — algoritmo de Dan
 * Bruton. Fuera del visible devuelve un tono convencional (no es «su» color:
 * esa luz no se ve).
 */
export function colorDeLongitud(nm: number): string {
  if (nm < 380) return "#b8a4ff"; // ultravioleta: convención violeta pálido
  if (nm > 750) return "#9b3a2c"; // infrarrojo: convención rojo oscuro
  let r = 0, g = 0, b = 0;
  if (nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else { r = 1; }
  let f = 1;
  if (nm < 420) f = 0.3 + (0.7 * (nm - 380)) / 40;
  else if (nm > 700) f = 0.3 + (0.7 * (750 - nm)) / 50;
  const c = (v: number) => Math.round(255 * Math.pow(Math.max(0, v) * f, 0.8));
  const hx = (v: number) => c(v).toString(16).padStart(2, "0");
  return `#${hx(r)}${hx(g)}${hx(b)}`;
}

/** Las cuatro líneas visibles de la serie de Balmer (nm, redondeadas). */
export const LINEAS_BALMER = [3, 4, 5, 6].map((n) => ({ n, nm: Math.round(longitudOndaNm(n, 2)) }));

/* ═══════════════════════════ RUTHERFORD ═══════════════════════════ */

export interface Metal {
  id: string;
  nombre: string;
  Z: number;
  A: number;
  /** Átomos por m³ (densidad numérica del sólido). */
  densidad: number;
}
export const METALES: Metal[] = [
  { id: "Au", nombre: "Oro", Z: 79, A: 197, densidad: 5.9e28 },
  { id: "Ag", nombre: "Plata", Z: 47, A: 108, densidad: 5.86e28 },
  { id: "Cu", nombre: "Cobre", Z: 29, A: 64, densidad: 8.49e28 },
  { id: "Al", nombre: "Aluminio", Z: 13, A: 27, densidad: 6.03e28 },
];

/** Distancia mínima de acercamiento frontal d (fm) de una alfa (z = 2) de energía K. */
export const distanciaMinimaFm = (kMeV: number, Z: number): number => (2 * Z * KE2_MEV_FM) / kMeV;

/** Radio del núcleo (fm): R = 1,2·A^(1/3). */
export const radioNuclearFm = (A: number): number => 1.2 * Math.cbrt(A);

/** Ángulo de desviación (rad) para un parámetro de impacto b: θ = 2·arctan(d / 2b). */
export const anguloDesviacion = (bFm: number, dFm: number): number => 2 * Math.atan(dFm / (2 * Math.abs(bFm)));

/** Átomos por m² de lámina (grosor en µm). */
const atomosPorArea = (metal: Metal, grosorUm: number) => metal.densidad * grosorUm * 1e-6;

/** Probabilidad (dispersión simple) de desviarse MÁS de θ. */
export function probMayorQue(thetaRad: number, dFm: number, metal: Metal, grosorUm: number): number {
  if (thetaRad <= 0) return 1;
  if (thetaRad >= Math.PI) return 0;
  const b = ((dFm / 2) / Math.tan(thetaRad / 2)) * 1e-15;
  return 1 - Math.exp(-atomosPorArea(metal, grosorUm) * Math.PI * b * b);
}

/**
 * Muestra el ángulo de desviación (rad) de UNA partícula.
 * 1) Parámetro de impacto al núcleo más cercano: P(B < b) = 1 − e^(−n·t·π·b²).
 * 2) θ de Coulomb para ese b (dispersión simple).
 * 3) Más la dispersión múltiple de ángulo pequeño (gaussiana, aproximada):
 *    lo que ensancha el haz recto alrededor de 1°.
 */
export function muestrearDesviacion(
  rnd: () => number,
  dFm: number,
  metal: Metal,
  grosorUm: number,
  kMeV: number,
): number {
  const u = Math.min(0.999999, rnd());
  const b = Math.sqrt(-Math.log(1 - u) / (atomosPorArea(metal, grosorUm) * Math.PI)); // m
  const thS = 2 * Math.atan((dFm * 1e-15) / (2 * b));
  const sigma = ((0.9 * Math.PI) / 180) * (metal.Z / 79) * (7.7 / kMeV) * Math.sqrt((grosorUm / 0.4) * (metal.densidad / 5.9e28));
  const fi = rnd() * Math.PI * 2;
  // gaussiana 2D (Box–Muller)
  const r = Math.sqrt(-2 * Math.log(Math.max(1e-9, rnd())));
  const a = rnd() * Math.PI * 2;
  const tx = thS * Math.cos(fi) + sigma * r * Math.cos(a);
  const ty = thS * Math.sin(fi) + sigma * r * Math.sin(a);
  return Math.min(Math.PI, Math.hypot(tx, ty));
}

/** Rangos del histograma (grados). */
export const BINS_GRADOS = [0, 2, 10, 30, 60, 90, 180];

/** Fracción esperada por rango (dispersión simple): la «predicción de Rutherford». */
export function fraccionesTeoricas(dFm: number, metal: Metal, grosorUm: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < BINS_GRADOS.length - 1; i++) {
    const a = (BINS_GRADOS[i]! * Math.PI) / 180;
    const b = (BINS_GRADOS[i + 1]! * Math.PI) / 180;
    out.push(probMayorQue(a, dFm, metal, grosorUm) - probMayorQue(b, dFm, metal, grosorUm));
  }
  return out;
}

/**
 * Trayectoria de una alfa que se acerca a un núcleo con parámetro de impacto b
 * (todas las distancias en la MISMA unidad que d). Se integra la repulsión de
 * Coulomb F = C/r² (Verlet) desde muy lejos, con la energía total correcta, y
 * se guardan puntos a intervalos IGUALES DE TIEMPO: la alfa frena de verdad
 * cerca del núcleo. Devuelve pares (x, y) dentro de la ventana |x|,|y| < vista.
 */
export function trayectoriaCoulomb(b: number, d: number, vista = 11, dt = 0.05): Float32Array {
  const K = 0.5; // masa 1, rapidez lejana 1
  const C = d * K; // d = C / K (acercamiento frontal)
  const x0 = -60;
  let x = x0, y = b;
  const r0 = Math.hypot(x, y);
  let vx = Math.sqrt(Math.max(0, 2 * (K - C / r0))), vy = 0;
  const sub = 10;
  const h = dt / sub;
  const pts: number[] = [];
  const acel = (px: number, py: number): [number, number] => {
    const r = Math.hypot(px, py);
    const k = C / (r * r * r);
    return [k * px, k * py];
  };
  let [ax, ay] = acel(x, y);
  for (let paso = 0; paso < 20000; paso++) {
    for (let s = 0; s < sub; s++) {
      x += vx * h + 0.5 * ax * h * h;
      y += vy * h + 0.5 * ay * h * h;
      const [nx, ny] = acel(x, y);
      vx += 0.5 * (ax + nx) * h;
      vy += 0.5 * (ay + ny) * h;
      ax = nx; ay = ny;
    }
    const dentro = Math.abs(x) < vista && Math.abs(y) < vista;
    if (dentro) pts.push(x, y);
    else if (pts.length && x * vx + y * vy > 0) break; // ya salió alejándose
  }
  return new Float32Array(pts);
}

/* ══════════════════════ SCHRÖDINGER (orbitales) ═══════════════════ */

export type Angular = "s" | "px" | "py" | "pz" | "dxy" | "dxz" | "dyz" | "dx2y2" | "dz2";
export interface OrbitalSpec {
  n: number;
  l: number;
  ang: Angular;
}

/** Nombre legible del orbital (con subíndices Unicode). */
export function nombreOrbital(o: OrbitalSpec): string {
  const sub: Record<Angular, string> = {
    s: "s", px: "pₓ", py: "p_y", pz: "p_z", dxy: "d_xy", dxz: "d_xz", dyz: "d_yz", dx2y2: "d_x²−y²", dz2: "d_z²",
  };
  return `${o.n}${sub[o.ang]}`;
}

/** Parte radial hidrogenoide R_nl(ρ), ρ = Z·r/a₀ (sin constante: solo forma y signo). */
export function radial(n: number, l: number, rho: number): number {
  const e = Math.exp(-rho / n);
  if (n === 1) return 2 * e;
  if (n === 2 && l === 0) return (2 - rho) * e;
  if (n === 2 && l === 1) return rho * e;
  if (n === 3 && l === 0) return (27 - 18 * rho + 2 * rho * rho) * e;
  if (n === 3 && l === 1) return (6 * rho - rho * rho) * e;
  if (n === 3 && l === 2) return rho * rho * e;
  if (n === 4 && l === 0) return (192 - 144 * rho + 24 * rho * rho - rho * rho * rho) * e;
  if (n === 4 && l === 1) return rho * (80 - 20 * rho + rho * rho) * e;
  return 0;
}

/** Nodos radiales (en ρ) de cada R_nl: donde la fase cambia de signo. */
export function nodosRadiales(n: number, l: number): number[] {
  if (n === 2 && l === 0) return [2];
  if (n === 3 && l === 0) return [(18 - Math.sqrt(108)) / 4, (18 + Math.sqrt(108)) / 4];
  if (n === 3 && l === 1) return [6];
  if (n === 4 && l === 0) return [1.8716, 6.6108, 15.5176];
  if (n === 4 && l === 1) return [10 - Math.sqrt(20), 10 + Math.sqrt(20)];
  return [];
}

/** Parte angular real, normalizada a máximo 1 en valor absoluto. */
export function angular(a: Angular, x: number, y: number, z: number): number {
  switch (a) {
    case "s": return 1;
    case "px": return x;
    case "py": return y;
    case "pz": return z;
    case "dxy": return 2 * x * y;
    case "dxz": return 2 * x * z;
    case "dyz": return 2 * y * z;
    case "dx2y2": return x * x - y * y;
    case "dz2": return (3 * z * z - 1) / 2;
  }
}

/** Radio máximo a muestrear (a₀) para un Z dado. */
const radioMax = (n: number, Z: number) => (5 + 3.6 * n * n) / Z;

interface Cdf { r: Float32Array; c: Float32Array }
function cdfRadial(n: number, l: number, Z: number): Cdf {
  const N = 600;
  const rMax = radioMax(n, Z);
  const r = new Float32Array(N + 1);
  const c = new Float32Array(N + 1);
  let acc = 0;
  for (let i = 0; i <= N; i++) {
    const ri = (i / N) * rMax;
    const R = radial(n, l, Z * ri);
    const p = ri * ri * R * R;
    if (i > 0) acc += p;
    r[i] = ri;
    c[i] = acc;
  }
  for (let i = 0; i <= N; i++) c[i] = c[i]! / acc;
  return { r, c };
}
function invertir(cdf: Cdf, u: number): number {
  let lo = 0, hi = cdf.c.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cdf.c[mid]! < u) lo = mid; else hi = mid;
  }
  const c0 = cdf.c[lo]!, c1 = cdf.c[hi]!;
  const t = c1 > c0 ? (u - c0) / (c1 - c0) : 0;
  return cdf.r[lo]! + t * (cdf.r[hi]! - cdf.r[lo]!);
}

/** Radio (en a₀) que encierra el 90 % de la probabilidad. */
export function radio90(n: number, l: number, Z = 1): number {
  return invertir(cdfRadial(n, l, Z), 0.9);
}

/** Dirección del lóbulo al que pertenece un punto (para «separar» la nube). */
function direccionLobulo(a: Angular, x: number, y: number, z: number, capa: number, out: number[]): void {
  const sg = (v: number) => (v >= 0 ? 1 : -1);
  const S = Math.SQRT1_2;
  let dx = 0, dy = 0, dz = 0;
  switch (a) {
    case "s": {
      const r = Math.hypot(x, y, z) || 1;
      dx = (x / r) * capa; dy = (y / r) * capa; dz = (z / r) * capa;
      break;
    }
    case "px": dx = sg(x); break;
    case "py": dy = sg(y); break;
    case "pz": dz = sg(z); break;
    case "dxy": dx = sg(x) * S; dy = sg(y) * S; break;
    case "dxz": dx = sg(x) * S; dz = sg(z) * S; break;
    case "dyz": dy = sg(y) * S; dz = sg(z) * S; break;
    case "dx2y2": if (Math.abs(x) > Math.abs(y)) dx = sg(x); else dy = sg(y); break;
    case "dz2": {
      if (3 * z * z - 1 > 0) dz = sg(z);
      else { const rr = Math.hypot(x, y) || 1; dx = x / rr; dy = y / rr; }
      break;
    }
  }
  out[0] = dx; out[1] = dy; out[2] = dz;
}

export interface NubeMuestreada {
  /** Posiciones (a₀), 3 por punto. */
  pos: Float32Array;
  /** Signo de ψ en el punto (+1 / −1): la fase. */
  signo: Float32Array;
  /** Dirección de su lóbulo (o capa radial) para separarlo. */
  dir: Float32Array;
  /** Número aleatorio por punto (tamaño y titileo). */
  azar: Float32Array;
}

/**
 * Muestrea `cuantos` puntos con densidad |ψ|² del orbital (Z efectiva dada).
 * Radial: inversión de la distribución r²R². Angular: aceptación–rechazo con |Y|².
 */
export function muestrearOrbital(o: OrbitalSpec, Z: number, cuantos: number, semilla: number): NubeMuestreada {
  const rnd = prng(semilla);
  const cdf = cdfRadial(o.n, o.l, Z);
  const nodos = nodosRadiales(o.n, o.l);
  const pos = new Float32Array(cuantos * 3);
  const signo = new Float32Array(cuantos);
  const dir = new Float32Array(cuantos * 3);
  const azar = new Float32Array(cuantos);
  const tmp = [0, 0, 0];
  for (let i = 0; i < cuantos; i++) {
    let x = 0, y = 0, z = 0, f = 1;
    for (let intento = 0; intento < 200; intento++) {
      const cz = 2 * rnd() - 1;
      const fi = rnd() * Math.PI * 2;
      const s = Math.sqrt(1 - cz * cz);
      x = s * Math.cos(fi); y = s * Math.sin(fi); z = cz;
      f = angular(o.ang, x, y, z);
      if (rnd() < f * f) break;
    }
    const r = invertir(cdf, rnd());
    const rho = Z * r;
    const capa = nodos.filter((nd) => nd < rho).length;
    const sgn = Math.sign(radial(o.n, o.l, rho) * f) || 1;
    // ejes de la escena: «z» del orbital = arriba (y de three)
    pos[i * 3] = x * r;
    pos[i * 3 + 1] = z * r;
    pos[i * 3 + 2] = -y * r;
    signo[i] = sgn;
    direccionLobulo(o.ang, x, y, z, capa, tmp);
    dir[i * 3] = tmp[0]!;
    dir[i * 3 + 1] = tmp[2]!;
    dir[i * 3 + 2] = -tmp[1]!;
    azar[i] = rnd();
  }
  return { pos, signo, dir, azar };
}

/* ── Configuración electrónica y Z efectiva (reglas de Slater) ───────── */

export interface Ocupacion {
  orb: OrbitalSpec;
  electrones: number;
  zEf: number;
}

/**
 * Orbitales ocupados de un átomo neutro de número atómico Z (hasta Z = 20,
 * orden 1s 2s 2p 3s 3p 4s) con la Z efectiva de Slater de cada grupo.
 * En cada subnivel p los electrones se reparten por la regla de Hund.
 */
export function configuracion(Z: number): Ocupacion[] {
  const orden: { n: number; l: number; cap: number }[] = [
    { n: 1, l: 0, cap: 2 }, { n: 2, l: 0, cap: 2 }, { n: 2, l: 1, cap: 6 },
    { n: 3, l: 0, cap: 2 }, { n: 3, l: 1, cap: 6 }, { n: 4, l: 0, cap: 2 },
  ];
  const lleno: Record<string, number> = {};
  let resto = Z;
  for (const s of orden) {
    const k = Math.min(s.cap, Math.max(0, resto));
    lleno[`${s.n}${s.l}`] = k;
    resto -= k;
  }
  const g = (n: number) => (lleno[`${n}0`] ?? 0) + (lleno[`${n}1`] ?? 0);
  const n1 = g(1), n2 = g(2), n3 = g(3), n4 = g(4);
  const zEf = (n: number): number => {
    if (n === 1) return Z - 0.3 * Math.max(0, n1 - 1);
    if (n === 2) return Z - (0.35 * Math.max(0, n2 - 1) + 0.85 * n1);
    if (n === 3) return Z - (0.35 * Math.max(0, n3 - 1) + 0.85 * n2 + n1);
    return Z - (0.35 * Math.max(0, n4 - 1) + 0.85 * n3 + n2 + n1);
  };
  const out: Ocupacion[] = [];
  for (const s of orden) {
    const k = lleno[`${s.n}${s.l}`] ?? 0;
    if (!k) continue;
    if (s.l === 0) {
      out.push({ orb: { n: s.n, l: 0, ang: "s" }, electrones: k, zEf: zEf(s.n) });
    } else {
      const ejes: Angular[] = ["px", "py", "pz"];
      ejes.forEach((a, i) => {
        const e = (k > i ? 1 : 0) + (k > i + 3 ? 1 : 0);
        if (e) out.push({ orb: { n: s.n, l: 1, ang: a }, electrones: e, zEf: zEf(s.n) });
      });
    }
  }
  return out;
}

/** Texto de la configuración: «1s² 2s² 2p⁴». */
export function textoConfiguracion(Z: number): string {
  const sup = (k: number) => String(k).replace(/\d/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)]!);
  const grupos = new Map<string, number>();
  for (const o of configuracion(Z)) {
    const k = `${o.orb.n}${o.orb.l === 0 ? "s" : "p"}`;
    grupos.set(k, (grupos.get(k) ?? 0) + o.electrones);
  }
  return [...grupos].map(([k, e]) => `${k}${sup(e)}`).join(" ");
}
