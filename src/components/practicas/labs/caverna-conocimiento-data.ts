/**
 * Datos y modelo del laboratorio "La caverna y el conocimiento" (PFH-I-P06,
 * progresión 6 de Pensamiento Filosófico y Humanidades I: Conocimiento,
 * Ciencia y grados de Verdad).
 *
 * Anclas (verbatim de la plataforma):
 *   - A1 lectura «Conocimiento, Ciencia y Verdad»: marco teórico (3 párrafos).
 *   - A2 quiz de opción múltiple: reto evaluable.
 *   - A3 reflexión escrita, A4 verdadero/falso (hechos), A5 glosario,
 *     A6 completa el texto, A7 autoevaluación, A8 preguntas del video.
 *
 * Tres modos, todos sobre EPISTEMOLOGÍA (no sobre el método científico, que
 * ya trabaja `naturaleza-ciencia-3d`):
 *   1. La caverna (Platón, República VII, 514a–517a): la sombra se calcula
 *      proyectando cada punto del objeto desde el fuego hasta la pared; una
 *      misma sombra la producen objetos distintos. Después, el ascenso del
 *      prisionero liberado y las cuatro formas de conocimiento de la línea
 *      dividida (República VI, 509d–511e).
 *   2. Los sentidos engañan: una habitación de Ames construida de verdad con
 *      una transformación proyectiva que deja fija la mirilla.
 *   3. Escalera de la certeza: creencia, justificación y verdad; incluye el
 *      reloj parado (B. Russell, 1948), antecedente de los casos de Gettier.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "caverna" | "ames" | "escalera";
export const MODOS: Modo[] = ["caverna", "ames", "escalera"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  caverna: { etq: "La caverna", subtitulo: "Sombras, objetos y el camino a la luz", icono: "fa-fire", color: "#f59e0b" },
  ames: { etq: "Los sentidos engañan", subtitulo: "La habitación de Ames: percepción y razón", icono: "fa-eye", color: "#22d3ee" },
  escalera: { etq: "Escalera de la certeza", subtitulo: "Creencia, justificación y verdad", icono: "fa-stairs", color: "#a78bfa" },
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

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

const GRAD = Math.PI / 180;

/* ════════════════════════════════════════════════════════════════════════
 * 1. LA CAVERNA — proyección de sombras desde el fuego
 * ════════════════════════════════════════════════════════════════════════ */

export interface P2 {
  x: number;
  y: number;
}
export type P3 = [number, number, number];

/** Geometría de la caverna (metros de la escena). */
export const CUEVA = {
  /** Plano de la pared donde se proyectan las sombras. */
  muroZ: -5,
  /** Rectángulo visible de la pared. */
  muroX: 7.5,
  muroAlto: 8,
  /** Muro bajo (tabique) detrás de los prisioneros, como la mampara de los titiriteros. */
  tabiqueZ: 0,
  tabiqueAlto: 1.6,
  /** Prisioneros sentados mirando la pared. */
  prisioneroZ: -2.2,
  cabezaY: 1.15,
  prisionerosX: [-1.8, 0, 1.8] as number[],
  /** Altura a la que los portadores levantan los objetos. */
  objetoY: 3.2,
  fuegoZ: 5.5,
  /** Tamaño de las figuras (arista, diámetro y alto), en metros. */
  tam: 0.6,
};

export const OBJ_Z_MIN = 0.4;
export const OBJ_Z_MAX = 3.9;
export const OBJ_Z_INICIAL = 0.6;
export const FUEGO_Y_MIN = 2.2;
export const FUEGO_Y_MAX = 4.4;
export const FUEGO_X_MAX = 2;

export type Solido = "cubo" | "cilindro" | "cono" | "esfera" | "piramide";
export const SOLIDOS: { id: Solido; etq: string; icono: string; detalle: string }[] = [
  { id: "cubo", etq: "Cubo", icono: "fa-cube", detalle: "arista de 60 cm" },
  { id: "cilindro", etq: "Cilindro", icono: "fa-database", detalle: "60 cm de diámetro y 60 cm de alto" },
  { id: "cono", etq: "Cono", icono: "fa-play", detalle: "base de 60 cm y 60 cm de alto" },
  { id: "esfera", etq: "Esfera", icono: "fa-circle", detalle: "60 cm de diámetro" },
  { id: "piramide", etq: "Pirámide", icono: "fa-caret-up", detalle: "base cuadrada de 60 cm y 60 cm de alto" },
];

/** Puntos de la superficie de cada sólido (tamaño 1, centrado en el origen; se escalan con CUEVA.tam). */
function puntosLocales(s: Solido): P3[] {
  const anillo = (y: number, n = 64): P3[] => Array.from({ length: n }, (_, i) => [0.5 * Math.cos((i / n) * Math.PI * 2), y, 0.5 * Math.sin((i / n) * Math.PI * 2)] as P3);
  if (s === "cubo") return [-0.5, 0.5].flatMap((x) => [-0.5, 0.5].flatMap((y) => [-0.5, 0.5].map((z) => [x, y, z] as P3)));
  if (s === "cilindro") return [...anillo(-0.5), ...anillo(0.5)];
  if (s === "cono") return [...anillo(-0.5), [0, 0.5, 0]];
  if (s === "piramide")
    return [
      [-0.5, -0.5, -0.5],
      [0.5, -0.5, -0.5],
      [0.5, -0.5, 0.5],
      [-0.5, -0.5, 0.5],
      [0, 0.5, 0],
    ];
  // Esfera: espiral de Fibonacci.
  const n = 900;
  const oro = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    return [0.5 * Math.cos(oro * i) * r, 0.5 * y, 0.5 * Math.sin(oro * i) * r] as P3;
  });
}

const PUNTOS: Record<Solido, P3[]> = {
  cubo: puntosLocales("cubo"),
  cilindro: puntosLocales("cilindro"),
  cono: puntosLocales("cono"),
  esfera: puntosLocales("esfera"),
  piramide: puntosLocales("piramide"),
};

export interface Pose {
  solido: Solido;
  /** Giro alrededor del eje vertical (grados). */
  giro: number;
  /** Inclinación hacia el fuego (grados). Primero se inclina y luego se gira. */
  inclina: number;
  /** Posición del objeto a lo largo del camino (z). */
  objZ: number;
  fuegoX: number;
  fuegoY: number;
}

/** Rota un punto: primero alrededor de X (inclinación) y luego de Y (giro). Igual que un grupo Y que contiene un grupo X. */
export function rotar(p: P3, giro: number, inclina: number): P3 {
  const a = inclina * GRAD;
  const b = giro * GRAD;
  const y1 = p[1] * Math.cos(a) - p[2] * Math.sin(a);
  const z1 = p[1] * Math.sin(a) + p[2] * Math.cos(a);
  const x2 = p[0] * Math.cos(b) + z1 * Math.sin(b);
  const z2 = -p[0] * Math.sin(b) + z1 * Math.cos(b);
  return [x2, y1, z2];
}

/** Proyección central desde el fuego F sobre el plano de la pared z = muroZ. */
export function proyectar(p: P3, f: P3, muroZ = CUEVA.muroZ): P2 | null {
  const dz = p[2] - f[2];
  if (dz >= -1e-6) return null; // el punto no está entre el fuego y la pared
  const t = (muroZ - f[2]) / dz;
  return { x: f[0] + t * (p[0] - f[0]), y: f[1] + t * (p[1] - f[1]) };
}

function cruz(o: P2, a: P2, b: P2): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/** Envolvente convexa (cadena monótona de Andrew), en sentido antihorario. */
export function envolvente(puntos: P2[]): P2[] {
  const ps = [...puntos].sort((a, b) => a.x - b.x || a.y - b.y);
  if (ps.length < 3) return ps;
  const inf: P2[] = [];
  for (const p of ps) {
    while (inf.length >= 2 && cruz(inf[inf.length - 2]!, inf[inf.length - 1]!, p) <= 0) inf.pop();
    inf.push(p);
  }
  const sup: P2[] = [];
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i]!;
    while (sup.length >= 2 && cruz(sup[sup.length - 2]!, sup[sup.length - 1]!, p) <= 0) sup.pop();
    sup.push(p);
  }
  inf.pop();
  sup.pop();
  return [...inf, ...sup];
}

export function area(poli: P2[]): number {
  let a = 0;
  for (let i = 0; i < poli.length; i++) {
    const p = poli[i]!;
    const q = poli[(i + 1) % poli.length]!;
    a += p.x * q.y - q.x * p.y;
  }
  return a / 2;
}

export function centroide(poli: P2[]): P2 {
  let cx = 0;
  let cy = 0;
  let a = 0;
  for (let i = 0; i < poli.length; i++) {
    const p = poli[i]!;
    const q = poli[(i + 1) % poli.length]!;
    const k = p.x * q.y - q.x * p.y;
    a += k;
    cx += (p.x + q.x) * k;
    cy += (p.y + q.y) * k;
  }
  if (Math.abs(a) < 1e-12) return poli[0] ?? { x: 0, y: 0 };
  return { x: cx / (3 * a), y: cy / (3 * a) };
}

/** Recorta el polígono convexo `sujeto` con el polígono convexo `recorte` (ambos antihorarios). */
export function recortar(sujeto: P2[], recorte: P2[]): P2[] {
  let salida = sujeto;
  for (let i = 0; i < recorte.length && salida.length > 0; i++) {
    const a = recorte[i]!;
    const b = recorte[(i + 1) % recorte.length]!;
    const entrada = salida;
    salida = [];
    for (let j = 0; j < entrada.length; j++) {
      const p = entrada[j]!;
      const q = entrada[(j + 1) % entrada.length]!;
      const dp = cruz(a, b, p);
      const dq = cruz(a, b, q);
      if (dp >= 0) salida.push(p);
      if (dp * dq < 0) {
        const t = dp / (dp - dq);
        salida.push({ x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) });
      }
    }
  }
  return salida;
}

export function puntoFuego(pose: Pick<Pose, "fuegoX" | "fuegoY">): P3 {
  return [pose.fuegoX, pose.fuegoY, CUEVA.fuegoZ];
}

/** Sombra del objeto en la pared: envolvente de la proyección de todos sus puntos. */
export function sombraObjeto(pose: Pose): P2[] {
  const f = puntoFuego(pose);
  const proy: P2[] = [];
  for (const p of PUNTOS[pose.solido]) {
    const r = rotar(p, pose.giro, pose.inclina);
    const q = proyectar([r[0] * CUEVA.tam, r[1] * CUEVA.tam + CUEVA.objetoY, r[2] * CUEVA.tam + pose.objZ], f);
    if (q) proy.push(q);
  }
  return envolvente(proy);
}

/** Rectángulo visible de la pared (antihorario). */
export const PARED: P2[] = [
  { x: -CUEVA.muroX, y: 0 },
  { x: CUEVA.muroX, y: 0 },
  { x: CUEVA.muroX, y: CUEVA.muroAlto },
  { x: -CUEVA.muroX, y: CUEVA.muroAlto },
];

/** Sombra de una caja (convexa) dada por su centro y medidas. */
export function sombraCaja(centro: P3, medidas: P3, f: P3): P2[] {
  const pts: P2[] = [];
  for (const sx of [-0.5, 0.5])
    for (const sy of [-0.5, 0.5])
      for (const sz of [-0.5, 0.5]) {
        const q = proyectar([centro[0] + sx * medidas[0], centro[1] + sy * medidas[1], centro[2] + sz * medidas[2]], f);
        if (q) pts.push(q);
      }
  return recortar(envolvente(pts), PARED);
}

/** Sombra de una esfera aproximada por puntos (cabezas de los prisioneros). */
export function sombraBola(centro: P3, radio: number, f: P3): P2[] {
  const pts: P2[] = [];
  const n = 120;
  const oro = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const q = proyectar([centro[0] + radio * Math.cos(oro * i) * r, centro[1] + radio * y, centro[2] + radio * Math.sin(oro * i) * r], f);
    if (q) pts.push(q);
  }
  return recortar(envolvente(pts), PARED);
}

/** Aumento de la sombra respecto del objeto: distancia fuego–pared entre distancia fuego–objeto. */
export function aumento(objZ: number): number {
  return (CUEVA.fuegoZ - CUEVA.muroZ) / (CUEVA.fuegoZ - objZ);
}

/** Alto (m) de un polígono. */
export function altoPoli(poli: P2[]): number {
  if (poli.length === 0) return 0;
  const ys = poli.map((p) => p.y);
  return Math.max(...ys) - Math.min(...ys);
}

/* ── Sombras objetivo: ¿qué objeto la produce? ─────────────────────────── */

export type Silueta = "cuadrado" | "circulo" | "triangulo";
export const SILUETAS: { id: Silueta; etq: string; objetos: Solido[]; pista: string }[] = [
  { id: "cuadrado", etq: "Un cuadrado", objetos: ["cubo", "cilindro"], pista: "Un cubo de frente… ¿y qué más tiene lados rectos vistos de lado?" },
  { id: "circulo", etq: "Un círculo", objetos: ["esfera", "cilindro", "cono"], pista: "Una esfera, claro. Prueba inclinar otros objetos 90° hacia el fuego." },
  { id: "triangulo", etq: "Un triángulo", objetos: ["cono", "piramide"], pista: "Mira de lado los objetos que terminan en punta." },
];

function siluetaIdeal(s: Silueta): P2[] {
  if (s === "cuadrado")
    return [
      { x: -0.5, y: -0.5 },
      { x: 0.5, y: -0.5 },
      { x: 0.5, y: 0.5 },
      { x: -0.5, y: 0.5 },
    ];
  if (s === "triangulo")
    return [
      { x: -0.5, y: -0.5 },
      { x: 0.5, y: -0.5 },
      { x: 0, y: 0.5 },
    ];
  return Array.from({ length: 96 }, (_, i) => ({ x: 0.5 * Math.cos((i / 96) * Math.PI * 2), y: 0.5 * Math.sin((i / 96) * Math.PI * 2) }));
}

/** Lleva un polígono a centroide 0 y área 1: compara FORMAS, sin importar tamaño ni lugar en la pared. */
export function normalizar(poli: P2[]): P2[] {
  const c = centroide(poli);
  const a = Math.abs(area(poli));
  if (a < 1e-9) return [];
  const k = 1 / Math.sqrt(a);
  return poli.map((p) => ({ x: (p.x - c.x) * k, y: (p.y - c.y) * k }));
}

/** Coincidencia de forma (intersección entre unión, 0–1) de dos polígonos convexos normalizados. */
export function coincidenciaFormas(a: P2[], b: P2[]): number {
  const na = normalizar(a);
  const nb = normalizar(b);
  if (na.length < 3 || nb.length < 3) return 0;
  const inter = Math.abs(area(recortar(na, nb)));
  return inter / (2 - inter);
}

export function coincidencia(sombra: P2[], s: Silueta): number {
  return coincidenciaFormas(sombra, siluetaIdeal(s));
}

/**
 * Umbral de «es la misma sombra» (calibrado con scripts/tmp-chk-caverna-conocimiento-3d.mts):
 * un cuadrado y un círculo de igual área coinciden 0.834 y la sombra hexagonal de un cubo visto
 * por su diagonal llega a 0.923 del círculo; el cilindro de lado da 0.95 del cuadrado.
 */
export const UMBRAL_MISMA = 0.94;

export function siluetaPoligono(s: Silueta): P2[] {
  return siluetaIdeal(s);
}

/* ── El ascenso y las cuatro formas de conocimiento ────────────────────── */

export type Forma = "eikasia" | "pistis" | "dianoia" | "noesis";
export const FORMAS: { id: Forma; griego: string; etq: string; que: string; region: "opinion" | "inteligible" }[] = [
  { id: "eikasia", griego: "εἰκασία", etq: "Eikasía · imaginación", que: "Conoce solo imágenes: sombras y reflejos, sin saber que son copias.", region: "opinion" },
  { id: "pistis", griego: "πίστις", etq: "Pístis · creencia", que: "Cree en las cosas visibles mismas: objetos, animales, plantas.", region: "opinion" },
  { id: "dianoia", griego: "διάνοια", etq: "Diánoia · pensamiento discursivo", que: "Razona a partir de supuestos y se apoya en figuras, como el geómetra.", region: "inteligible" },
  { id: "noesis", griego: "νόησις", etq: "Nóesis · inteligencia", que: "Comprende los principios mismos, sin imágenes; en la cima, la Idea del Bien.", region: "inteligible" },
];

export interface Etapa {
  titulo: string;
  pasaje: string;
  narra: string;
  forma: Forma;
  /** Deslumbramiento inicial de la vista (0–1). */
  brillo: number;
  porque: string;
}

export const ETAPAS: Etapa[] = [
  {
    titulo: "Encadenado frente a la pared",
    pasaje: "República VII, 514a–515c",
    narra: "Encadenados desde niños por las piernas y el cuello, los prisioneros solo pueden mirar la pared. Toman por reales las sombras que proyecta el fuego y creen que son ellas las que hablan cuando oyen el eco.",
    forma: "eikasia",
    brillo: 0,
    porque: "Solo conocen imágenes de imágenes (las sombras de figuras) y no saben que lo son: es el grado más bajo, la eikasía.",
  },
  {
    titulo: "Liberado: los objetos y el fuego",
    pasaje: "República VII, 515c–515e",
    narra: "Obligado a levantarse y a volverse, le duelen los ojos por la luz del fuego. Ve las figuras que antes solo conocía por su sombra, pero al principio cree que las sombras eran más verdaderas.",
    forma: "pistis",
    brillo: 0.72,
    porque: "Ahora ve los objetos mismos que causaban las sombras: sigue en el mundo visible, pero ya no de imágenes; corresponde a la pístis (creencia).",
  },
  {
    titulo: "Afuera: reflejos y cosas",
    pasaje: "República VII, 515e–516b",
    narra: "Arrastrado por la subida áspera y empinada, sale a la luz. Deslumbrado, primero distingue las sombras, luego los reflejos de las personas y las cosas en el agua, después las cosas mismas y, de noche, el cielo.",
    forma: "dianoia",
    brillo: 0.88,
    porque: "Fuera de la caverna empieza lo inteligible. Los reflejos y las cosas de afuera suelen leerse como la diánoia: pensar con ayuda de imágenes y supuestos, como el geómetra que razona sobre un triángulo dibujado.",
  },
  {
    titulo: "El Sol",
    pasaje: "República VII, 516b–c y 517b–c",
    narra: "Por último puede mirar el Sol mismo, en su propio lugar, y concluye que es el que produce las estaciones y los años y gobierna todo lo visible. Platón lo compara con la Idea del Bien, lo último y más difícil de ver.",
    forma: "noesis",
    brillo: 1,
    porque: "Contemplar el principio que explica todo lo demás, sin imágenes intermedias, es la nóesis: el grado más alto del conocimiento.",
  },
];

export const REGRESO =
  "Si volviera a su antiguo asiento, sus ojos se llenarían de tinieblas; mientras se acostumbra, los demás se reirían de él, dirían que subió y regresó con la vista estropeada, y si pudieran matarían a quien intentara liberarlos (República VII, 516e–517a).";

/* ════════════════════════════════════════════════════════════════════════
 * 2. LA HABITACIÓN DE AMES — transformación proyectiva desde la mirilla
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * La habitación que CREES ver (ilusoria) es un rectángulo de ANCHO × ALTO ×
 * profundidad, con la mirilla en el origen a media altura. La habitación REAL
 * se obtiene deslizando cada punto P a lo largo de su rayo desde la mirilla:
 * P' = s(x) · P, con s(x) = (ALTO + m·ANCHO) / (ALTO + 2·m·x). Como es una
 * transformación proyectiva que fija el ojo, desde la mirilla la imagen es
 * idéntica, los planos siguen siendo planos (piso, techo y muros reales son
 * superficies planas inclinadas) y la esquina izquierda queda K veces más
 * lejos que la derecha.
 */
export const AMES = {
  ancho: 4,
  alto: 3,
  zFrente: -0.6,
  zFondo: -6,
  K: 2.2,
  /** Ana y Beto miden lo mismo. */
  estatura: 1.6,
  zPersonas: -5.45,
  xAna: 1.55,
  xBetoMin: -1.55,
  xBetoMax: 0.3,
};

export const M_AMES = (AMES.alto * (AMES.K - 1)) / (AMES.ancho * (AMES.K + 1));

/** Factor de alejamiento a lo largo del rayo según la x ilusoria. */
export function sAmes(x: number): number {
  return (AMES.alto + M_AMES * AMES.ancho) / (AMES.alto + 2 * M_AMES * x);
}

/** De la habitación ilusoria a la real (ojo en el origen). */
export function mapAmes(p: P3): P3 {
  const s = sAmes(p[0]);
  return [p[0] * s, p[1] * s, p[2] * s];
}

export interface MedidaPersona {
  /** Pies en la habitación real. */
  pies: P3;
  /** Distancia horizontal real desde la mirilla (m). */
  distancia: number;
  /** Tamaño angular desde la mirilla (grados). */
  angulo: number;
  /** Estatura que parece tener si la habitación fuera rectangular (m). */
  aparente: number;
}

export function medirPersona(xIlusoria: number): MedidaPersona {
  const pies = mapAmes([xIlusoria, -AMES.alto / 2, AMES.zPersonas]);
  const cabeza: P3 = [pies[0], pies[1] + AMES.estatura, pies[2]];
  const n = (v: P3) => Math.hypot(v[0], v[1], v[2]);
  const cos = (pies[0] * cabeza[0] + pies[1] * cabeza[1] + pies[2] * cabeza[2]) / (n(pies) * n(cabeza));
  return {
    pies,
    distancia: Math.hypot(pies[0], pies[2]),
    angulo: Math.acos(Math.min(1, cos)) / GRAD,
    aparente: AMES.estatura / sAmes(xIlusoria),
  };
}

export type Prediccion = "ana" | "beto" | "iguales";
export const PREDICCIONES: { id: Prediccion; etq: string }[] = [
  { id: "ana", etq: "Ana (derecha) es más alta" },
  { id: "beto", etq: "Beto (izquierda) es más alto" },
  { id: "iguales", etq: "Miden lo mismo" },
];

export const EXPLICACIONES_AMES: { id: string; etq: string; ok: boolean; explica: string }[] = [
  { id: "ojos", etq: "Los ojos siempre mienten: no hay que confiar nunca en la percepción.", ok: false, explica: "Demasiado: casi siempre la percepción funciona. Falla aquí porque alguien construyó la habitación para engañar a un supuesto concreto." },
  {
    id: "supuesto",
    etq: "El cerebro da por hecho que el cuarto es rectangular y, con ese supuesto, calcula mal el tamaño de las personas.",
    ok: true,
    explica: "Exacto. Desde la mirilla la imagen es idéntica a la de un cuarto rectangular; el cerebro elige esa interpretación, y entonces la persona más lejana tiene que ser «más pequeña».",
  },
  { id: "encoge", etq: "Beto de verdad se encoge al caminar hacia la esquina izquierda.", ok: false, explica: "La regla lo desmiente: Beto mide 1.60 m en cualquier lugar. Lo que cambia es su distancia a la mirilla." },
  { id: "luz", etq: "La luz de la esquina izquierda es más débil y por eso se ve más pequeño.", ok: false, explica: "La iluminación no cambia el tamaño en la imagen; lo cambia la distancia. Rodea la habitación para verlo." },
];

export const FUENTES_CORRIGEN: { id: string; etq: string; ok: boolean }[] = [
  { id: "otra", etq: "La percepción desde otro punto de vista", ok: true },
  { id: "razon", etq: "La razón: medir y calcular distancias", ok: true },
  { id: "mayoria", etq: "Lo que opina la mayoría de los visitantes", ok: false },
  { id: "primera", etq: "La primera impresión por la mirilla", ok: false },
];

/* ════════════════════════════════════════════════════════════════════════
 * 3. ESCALERA DE LA CERTEZA
 * ════════════════════════════════════════════════════════════════════════ */

export type Fuente = "percepcion" | "razon" | "testimonio" | "autoridad" | "emocion";
export const FUENTE_DEF: Record<Fuente, { etq: string; icono: string; color: string; que: string }> = {
  percepcion: { etq: "Percepción", icono: "fa-eye", color: "#38bdf8", que: "Lo que captas con tus sentidos." },
  razon: { etq: "Razón", icono: "fa-brain", color: "#a78bfa", que: "Lo que deduces o calculas con el pensamiento." },
  testimonio: { etq: "Testimonio", icono: "fa-comments", color: "#fbbf24", que: "Lo que otra persona te cuenta." },
  autoridad: { etq: "Autoridad", icono: "fa-building-columns", color: "#34d399", que: "Una persona o institución experta en ESE tema, con métodos que otros pueden revisar." },
  emocion: { etq: "Emoción o deseo", icono: "fa-heart", color: "#fb7185", que: "Lo que sientes o quisieras que fuera cierto: no es una fuente de conocimiento." },
};

export type Veredicto = "verdadera" | "falsa" | "nosabe";
export const VEREDICTOS: { id: Veredicto; etq: string; icono: string }[] = [
  { id: "verdadera", etq: "Es verdadera", icono: "fa-circle-check" },
  { id: "falsa", etq: "Es falsa", icono: "fa-circle-xmark" },
  { id: "nosabe", etq: "No se puede saber todavía", icono: "fa-circle-question" },
];

export type Calidad = "solida" | "debil" | "enganosa";
export interface Evidencia {
  id: string;
  texto: string;
  fuente: Fuente;
  calidad: Calidad;
  /** Qué veredicto apoya (null: no permite concluir nada). */
  apoya: Veredicto | null;
  explica: string;
}

export type CasoId = "censo" | "volado" | "reloj";
export interface CasoEscalera {
  id: CasoId;
  etq: string;
  contexto: string;
  afirmacion: string;
  evidencias: Evidencia[];
}

export const CASOS: CasoEscalera[] = [
  {
    id: "censo",
    etq: "El dato del censo",
    contexto: "En el grupo de mensajes de tu salón discuten cuánta gente vive en México.",
    afirmacion: "En México viven más de 126 millones de personas.",
    evidencias: [
      { id: "meme", texto: "Un meme dice que «ya somos 200 millones de mexicanos».", fuente: "testimonio", calidad: "enganosa", apoya: "verdadera", explica: "No dice quién contó ni cómo, y la cifra es falsa. Llegar a una conclusión verdadera con una razón falsa es acertar de chiripa." },
      { id: "inegi", texto: "El Censo de Población y Vivienda 2020 del INEGI contó 126 014 024 habitantes.", fuente: "autoridad", calidad: "solida", apoya: "verdadera", explica: "El INEGI es la institución experta en contar a la población y publica cómo lo hace." },
      { id: "metodo", texto: "El censo recorre las viviendas de todo el país y publica su método y sus datos para que cualquiera los revise.", fuente: "razon", calidad: "solida", apoya: "verdadera", explica: "Es una razón para confiar en la fuente: un método público puede revisarse y corregirse." },
      { id: "escuela", texto: "En mi escuela somos 1 200 alumnos: en el país debe haber muchísima gente.", fuente: "razon", calidad: "debil", apoya: null, explica: "Es cierto que hay mucha gente, pero de tu escuela no se puede calcular el total del país." },
      { id: "vecino", texto: "Mi vecino dice que leyó en algún lado que somos como 130 millones.", fuente: "testimonio", calidad: "debil", apoya: "verdadera", explica: "Apunta en la dirección correcta, pero no sabes de dónde lo sacó: es un testimonio sin respaldo." },
    ],
  },
  {
    id: "volado",
    etq: "El volado",
    contexto: "Van a echar un volado para decidir qué equipo empieza el partido.",
    afirmacion: "En el próximo volado va a caer águila.",
    evidencias: [
      { id: "corazonada", texto: "Tengo el presentimiento de que va a caer águila.", fuente: "emocion", calidad: "debil", apoya: "verdadera", explica: "Un presentimiento no está conectado con cómo cae la moneda: es lo que quisieras, no una razón." },
      { id: "racha", texto: "Ya cayó sol tres veces seguidas: ahora le toca águila.", fuente: "razon", calidad: "enganosa", apoya: "verdadera", explica: "Es la falacia del jugador: la moneda no recuerda los tiros anteriores; águila sigue teniendo probabilidad 1/2." },
      { id: "primo", texto: "Mi primo gana casi todos los volados y asegura que caerá águila.", fuente: "testimonio", calidad: "enganosa", apoya: "verdadera", explica: "Nadie es experto en adivinar un volado: tener buena racha no da autoridad sobre el azar." },
      { id: "mitad", texto: "Una moneda equilibrada tiene la misma probabilidad de caer águila que sol: 1/2.", fuente: "razon", calidad: "solida", apoya: "nosabe", explica: "Lo que sí puede saberse es la probabilidad, no el resultado de un tiro." },
      { id: "giro", texto: "La moneda gira muchas veces en el aire: nadie controla ni ve de antemano cómo caerá.", fuente: "percepcion", calidad: "solida", apoya: "nosabe", explica: "Lo observas: el resultado no está disponible antes de que caiga." },
    ],
  },
  {
    id: "reloj",
    etq: "El reloj de la plaza",
    contexto: "Vas a la escuela y, al cruzar la plaza, miras el reloj de la torre.",
    afirmacion: "Son las 8:15 de la mañana.",
    evidencias: [
      { id: "veo", texto: "Veo el reloj de la torre: marca las 8:15.", fuente: "percepcion", calidad: "solida", apoya: "verdadera", explica: "Lo estás viendo con claridad y de cerca." },
      { id: "siempre", texto: "Ese reloj siempre ha dado bien la hora: todo el pueblo se guía por él.", fuente: "testimonio", calidad: "solida", apoya: "verdadera", explica: "Un historial largo de aciertos es una buena razón para confiar en un instrumento." },
      { id: "tamales", texto: "El puesto de tamales ya abrió, y abre a las 8.", fuente: "percepcion", calidad: "debil", apoya: "verdadera", explica: "Solo indica que ya pasan de las 8, no qué hora exacta es." },
      { id: "prisa", texto: "Siento que voy tardísimo: seguro ya son más de las 9.", fuente: "emocion", calidad: "enganosa", apoya: "falsa", explica: "La prisa no mide el tiempo: es una emoción, no una evidencia." },
    ],
  },
];

export const NIVELES: { etq: string; que: string }[] = [
  { etq: "Sin razones", que: "Lo afirmas sin ninguna razón." },
  { etq: "Opinión (dóxa)", que: "Solo razones débiles o engañosas: sentimientos, rumores, dichos." },
  { etq: "Creencia fundada", que: "Tienes al menos una razón sólida." },
  { etq: "Creencia justificada", que: "Dos o más razones sólidas de fuentes distintas y ninguna engañosa." },
];

export interface Justificacion {
  nivel: 0 | 1 | 2 | 3;
  solidas: number;
  fuentes: number;
  enganosas: Evidencia[];
  contrarias: Evidencia[];
  sinPeso: Evidencia[];
}

/** Grado de justificación de un veredicto con las razones elegidas. */
export function justificacion(caso: CasoEscalera, veredicto: Veredicto | null, elegidas: string[]): Justificacion {
  const ev = caso.evidencias.filter((e) => elegidas.includes(e.id));
  const enganosas = ev.filter((e) => e.calidad === "enganosa");
  const contrarias = veredicto ? ev.filter((e) => e.calidad !== "enganosa" && e.apoya !== null && e.apoya !== veredicto) : [];
  const sinPeso = ev.filter((e) => e.calidad !== "enganosa" && e.apoya === null);
  const aFavor = veredicto ? ev.filter((e) => e.calidad !== "enganosa" && e.apoya === veredicto) : [];
  const solidas = aFavor.filter((e) => e.calidad === "solida");
  const fuentes = new Set(solidas.map((e) => e.fuente)).size;
  let nivel: Justificacion["nivel"] = 0;
  if (!veredicto || ev.length === 0) nivel = 0;
  else if (enganosas.length > 0 || contrarias.length > 0) nivel = 1;
  else if (solidas.length >= 2 && fuentes >= 2) nivel = 3;
  else if (solidas.length >= 1) nivel = 2;
  else if (aFavor.length > 0) nivel = 1;
  return { nivel, solidas: solidas.length, fuentes, enganosas, contrarias, sinPeso };
}

/** Tira una moneda equilibrada. */
export function tirarMoneda(rnd: () => number): "aguila" | "sol" {
  return rnd() < 0.5 ? "aguila" : "sol";
}

export type Resultado = "conocimiento" | "fundada" | "suerte" | "errorJustificado" | "falsa" | "gettier";

/** La verdad del caso; en el volado depende del tiro. */
export function veredictoCorrecto(caso: CasoEscalera, moneda: "aguila" | "sol" | null): Veredicto[] {
  if (caso.id === "censo") return ["verdadera"];
  if (caso.id === "reloj") return ["verdadera"];
  // Volado: «no se puede saber» es correcto siempre; águila/sol, según el tiro.
  return moneda === "aguila" ? ["nosabe", "verdadera"] : ["nosabe", "falsa"];
}

export function resultado(caso: CasoEscalera, veredicto: Veredicto, nivel: number, moneda: "aguila" | "sol" | null): Resultado {
  const correcto = veredictoCorrecto(caso, moneda).includes(veredicto);
  if (caso.id === "reloj" && correcto && nivel === 3) return "gettier";
  if (correcto && nivel === 3) return "conocimiento";
  if (correcto && nivel === 2) return "fundada";
  if (correcto) return "suerte";
  if (nivel === 3) return "errorJustificado";
  return "falsa";
}

export const RESULTADO_DEF: Record<Resultado, { etq: string; color: string; explica: string }> = {
  conocimiento: { etq: "Conocimiento", color: "#34d399", explica: "Crees algo verdadero y lo sostienes con razones sólidas de fuentes distintas: es una creencia verdadera justificada." },
  fundada: { etq: "Acierto con justificación incompleta", color: "#fbbf24", explica: "Tu creencia es verdadera y tiene una razón sólida, pero una sola fuente puede fallar. Busca otra razón independiente." },
  suerte: { etq: "Acierto por suerte", color: "#fb923c", explica: "Resultó verdadero, pero tus razones no lo sostenían. Platón ya advertía que una opinión verdadera no es lo mismo que el conocimiento: le falta dar razón de ella." },
  errorJustificado: { etq: "Error justificado", color: "#f87171", explica: "Tenías buenas razones y aun así era falso: la justificación no garantiza la verdad." },
  falsa: { etq: "Opinión falsa", color: "#f87171", explica: "No corresponde a los hechos y tus razones tampoco la sostenían." },
  gettier: {
    etq: "¿Conocimiento… o suerte?",
    color: "#c084fc",
    explica: "Creías algo verdadero y tenías buenas razones. Pero el reloj estaba parado desde ayer a las 8:15: acertaste porque pasaste justo a esa hora.",
  },
};

export const PREGUNTA_RELOJ = "Cumpliste las tres condiciones: creencia, verdad y justificación. ¿Sabías que eran las 8:15?";
export const OPCIONES_RELOJ: { id: string; etq: string; ok: boolean; explica: string }[] = [
  {
    id: "si",
    etq: "Sí: creía algo verdadero con buenas razones; no hay nada raro.",
    ok: false,
    explica: "Es lo que diría la definición clásica. Pero piensa: si hubieras pasado a las 8:40, el mismo reloj y las mismas razones te habrían engañado. Lo que te dio la verdad fue la suerte, no tus razones.",
  },
  {
    id: "suerte",
    etq: "Tenía creencia, verdad y justificación, pero acerté por suerte: mi razón («el reloj funciona») era falsa.",
    ok: true,
    explica: "Exacto. Bertrand Russell usó el reloj parado en 1948, y en 1963 el filósofo estadounidense Gettier publicó casos parecidos para mostrar que «creencia verdadera justificada» quizá no basta para saber. Los filósofos siguen discutiendo qué hay que añadir.",
  },
  { id: "falsa", etq: "No, porque la afirmación era falsa.", ok: false, explica: "Revisa el teléfono: sí eran las 8:15. La afirmación era verdadera; el problema está en otro lado." },
  { id: "sinrazon", etq: "No, porque no tenía ninguna razón para creerlo.", ok: false, explica: "Sí tenías razones: veías el reloj y confiabas en su historial. Justamente por eso el caso es interesante." },
];

/* ── Estrellas: ¿de dónde viene lo que sabes? ──────────────────────────── */

export type FuenteClasif = Exclude<Fuente, "emocion">;
export const FUENTES_CLASIF: FuenteClasif[] = ["percepcion", "razon", "testimonio", "autoridad"];

export const AFIRMACIONES_FUENTE: { texto: string; fuente: FuenteClasif; porque: string }[] = [
  { texto: "Toqué el comal y sentí que estaba muy caliente.", fuente: "percepcion", porque: "Lo captaste directamente con el tacto." },
  { texto: "Veo que el lápiz se «dobla» al meterlo en el vaso con agua.", fuente: "percepcion", porque: "Es lo que ves… y la vista se equivoca: la luz cambia de dirección al pasar del agua al aire (refracción)." },
  { texto: "Oigo que está lloviendo sobre el techo.", fuente: "percepcion", porque: "Lo sabes por el oído." },
  { texto: "Si todos los mamíferos respiran aire y la ballena es un mamífero, la ballena respira aire.", fuente: "razon", porque: "La conclusión se deduce de las premisas: es trabajo de la razón." },
  { texto: "Si hoy es martes, pasado mañana será jueves.", fuente: "razon", porque: "No necesitas mirar un calendario: se deduce." },
  { texto: "Los ángulos interiores de cualquier triángulo en un plano suman 180°.", fuente: "razon", porque: "Se demuestra con geometría, no midiendo triángulos uno por uno." },
  { texto: "Mi amiga me contó que cambiaron el examen al lunes.", fuente: "testimonio", porque: "Lo sabes porque otra persona te lo dijo; conviene confirmarlo." },
  { texto: "Un video viral asegura que un té cura todas las enfermedades.", fuente: "testimonio", porque: "Alguien lo afirma sin pruebas ni fuente identificable: testimonio poco fiable." },
  { texto: "La receta de la abuela dice que los frijoles se cuecen más rápido si se remojan la noche anterior.", fuente: "testimonio", porque: "Es un saber transmitido por tradición: testimonio. Puede ser cierto, y se puede comprobar en la cocina." },
  { texto: "Un influencer que no es médico dice que su suplemento sustituye la insulina.", fuente: "testimonio", porque: "Parece autoridad por sus seguidores, pero no es experto en medicina: es un testimonio sin respaldo, y peligroso." },
  { texto: "Según el Censo 2020 del INEGI, en México viven 126 014 024 personas.", fuente: "autoridad", porque: "El INEGI es la institución experta en ese tema y publica su método." },
  { texto: "En el planetario, una astrónoma explica que la luz del Sol tarda unos 8 minutos en llegar a la Tierra.", fuente: "autoridad", porque: "Es una experta en ese tema, y el dato puede comprobarse con la distancia y la velocidad de la luz." },
  { texto: "El Servicio Sismológico Nacional informa la magnitud de un sismo.", fuente: "autoridad", porque: "Es la institución especializada que mide los sismos en México." },
];

/** Ronda de 6: una afirmación de cada fuente y dos más al azar. */
export function rondaFuentes(rnd: () => number, n = 6): number[] {
  const baraja = (xs: number[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  const elegidos: number[] = [];
  for (const f of FUENTES_CLASIF) {
    const idx = AFIRMACIONES_FUENTE.map((a, i) => ({ a, i })).filter((x) => x.a.fuente === f).map((x) => x.i);
    elegidos.push(baraja(idx)[0]!);
  }
  const resto = baraja(AFIRMACIONES_FUENTE.map((_, i) => i).filter((i) => !elegidos.includes(i)));
  return baraja([...elegidos, ...resto.slice(0, n - elegidos.length)]);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM (PFH-I-P06)
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Conocimiento, Ciencia y Verdad";

/** Lectura A1 — tres párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "Desde siempre, los seres humanos se preguntan cómo conocen el mundo y qué significa que algo sea verdadero. La rama de la filosofía que estudia esto es la teoría del conocimiento o epistemología. Sus preguntas básicas son: ¿qué podemos conocer?, ¿cómo lo conocemos? y ¿hasta qué punto podemos estar seguros?",
  "En esa búsqueda aparecen dos fuentes clásicas del conocimiento: la percepción (lo que captamos por los sentidos) y la razón (lo que comprendemos con el pensamiento). Algunas corrientes confían más en la experiencia sensible y otras en la razón; la mayoría reconoce que ambas se complementan. El conocimiento científico se construye con métodos, evidencia y revisión entre pares, mientras que los saberes sociales y humanísticos aportan sentido, valores e interpretación: entre ambos hay encuentros y desencuentros, pero los dos son valiosos.",
  "El problema de la verdad consiste en preguntarnos qué hace que una afirmación sea verdadera. ¿Es verdad lo que corresponde a los hechos? ¿Lo que es coherente con lo demás que sabemos? ¿Lo que resulta útil? Hoy este problema se vuelve urgente por la posverdad: situaciones en que las emociones y las creencias personales pesan más que los hechos a la hora de formar opiniones, algo que las noticias falsas y las redes sociales amplifican. Por eso, interpretar con cuidado la información —preguntar quién lo dice, con qué pruebas y con qué intención— es una habilidad filosófica esencial para la vida cotidiana.",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS_A1: { pregunta: string; guia: string }[] = [
  { pregunta: "¿Cuáles son las dos fuentes clásicas del conocimiento?", guia: "La percepción (los sentidos) y la razón (el pensamiento)." },
  { pregunta: "¿Qué es la posverdad?", guia: "Situaciones en que las emociones y creencias pesan más que los hechos al formar opiniones." },
];

/** Reflexión escrita A3 — verbatim. */
export const REFLEXION_A3 =
  "En la era de las redes sociales y las noticias falsas, ¿cómo decides tú si una información es verdadera o no? Describe los pasos o criterios que usas y reflexiona sobre por qué es importante no dejarse llevar solo por las emociones (posverdad).";

/** Hechos: quiz A4 (verdadero/falso) con su retroalimentación — verbatim. */
export const HECHOS: { enunciado: string; respuesta: boolean; retro: string }[] = [
  { enunciado: "La percepción y la razón se complementan en la construcción del conocimiento.", respuesta: true, retro: "Correcto: ambas aportan." },
  { enunciado: "El conocimiento científico y los saberes humanísticos no tienen ningún valor en común.", respuesta: false, retro: "Ambos son valiosos; tienen encuentros y desencuentros." },
  { enunciado: "En la posverdad, los hechos pesan menos que las emociones al formar opiniones.", respuesta: true, retro: "Correcto: esa es su característica central." },
  { enunciado: "Interpretar la información con cuidado es una habilidad filosófica útil para la vida.", respuesta: true, retro: "Correcto: ayuda a no caer en engaños." },
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Epistemología", definicion: "Rama de la filosofía que estudia el conocimiento: qué podemos conocer y cómo.", ejemplo: "Preguntar cómo sabemos que algo es verdad." },
  { termino: "Percepción", definicion: "Conocimiento que obtenemos a través de los sentidos.", ejemplo: "Ver, oír o tocar algo." },
  { termino: "Razón", definicion: "Capacidad de pensar, comprender y argumentar.", ejemplo: "Deducir una conclusión a partir de premisas." },
  { termino: "Verdad", definicion: "Cualidad de una afirmación que corresponde a los hechos o es coherente y fundada.", ejemplo: "'Está lloviendo' es verdad si efectivamente llueve." },
  { termino: "Posverdad", definicion: "Situación en que las emociones y creencias personales influyen más que los hechos en la opinión pública.", ejemplo: "Creer una noticia falsa porque encaja con lo que ya pensábamos." },
];

export const ACTIVIDAD_A5 = "Busca una noticia y anota tres preguntas para comprobar si es verdadera.";

/** Autoevaluación A7 — criterios verbatim. */
export const AUTOEVALUACION_A7: string[] = [
  "Distingo la percepción de la razón como fuentes del conocimiento.",
  "Comprendo el problema de la verdad y la posverdad.",
  "Interpreto la información de forma crítica (fuente, pruebas, intención).",
];
export const REFLEXION_FINAL_A7 = "¿Qué harás de ahora en adelante antes de compartir una noticia?";

/** Pregunta abierta del video A8 — verbatim. */
export const PREGUNTA_A8 = "¿Cómo distinguirías entre una creencia, una opinión y un conocimiento verdadero?";

export const FUENTE =
  "CEN Bachillerato — PFH-I, progresión 6: lectura A1, quiz A2, reflexión A3, quiz A4, glosario A5, texto A6, autoevaluación A7 y video A8. Alegoría de la caverna: Platón, República, libro VII, 514a–517c; línea dividida: libro VI, 509d–511e.";

export const PROBLEMA =
  "¿Cómo sabes que lo que sabes es verdad? Los prisioneros de Platón estaban seguros de que las sombras eran la realidad. En este laboratorio proyectas sombras de verdad para ver por qué no bastan, te dejas engañar por una habitación construida para burlar a tus ojos y subes una creencia, escalón por escalón, hasta el conocimiento… o hasta descubrir que acertaste por suerte.";

export const INSTRUCCIONES: string[] = [
  "En La caverna, elige la sombra que ven los prisioneros y busca DOS objetos distintos que la proyecten: gira, inclina y acerca cada objeto al fuego. Después libera a un prisionero y acompáñalo hasta el Sol.",
  "En Los sentidos engañan, predice desde la mirilla quién es más alto, mide a Ana y a Beto, y rodea la habitación para descubrir su forma real.",
  "En Escalera de la certeza, elige un veredicto, escoge tus razones y mira hasta qué escalón sube tu creencia. Luego verifica.",
  "Clasifica afirmaciones por su fuente para ganar estrellas y resuelve el quiz A2 y el texto A6.",
];

export const IDEAS: string[] = [
  "Una misma sombra puede venir de objetos distintos: la apariencia no basta para saber qué hay detrás.",
  "Para Platón, conocer es un ascenso: de las imágenes (eikasía) y las cosas visibles (pístis) al pensamiento (diánoia) y la inteligencia (nóesis).",
  "La percepción puede engañarnos cuando se apoya en un supuesto falso; la razón y otro punto de vista la corrigen: ambas se complementan.",
  "Distinguimos creencia (lo que tienes por cierto), verdad (que corresponda a los hechos) y justificación (las razones que la sostienen).",
  "No todas las fuentes pesan igual: una autoridad lo es solo en su tema y si sus métodos pueden revisarse.",
  "Acertar por suerte no es saber: el reloj parado muestra que ni siquiera una creencia verdadera justificada garantiza el conocimiento.",
];

/** Quiz A2 «Conocimiento y Verdad — Opción múltiple» — verbatim. */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Conocimiento y Verdad — Opción múltiple",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "La rama de la filosofía que estudia el conocimiento se llama…",
      opciones: ["estética", "epistemología", "ontología", "ética"],
      respuestaCorrecta: 1,
      retroalimentacion: "La epistemología o teoría del conocimiento.",
    },
    {
      enunciado: "Las dos fuentes clásicas del conocimiento son…",
      opciones: ["la fe y la costumbre", "la percepción y la razón", "el dinero y el poder", "la suerte y el azar"],
      respuestaCorrecta: 1,
      retroalimentacion: "Los sentidos (percepción) y el pensamiento (razón).",
    },
    {
      enunciado: "La 'posverdad' describe situaciones en que…",
      opciones: ["los hechos siempre se respetan", "las emociones y creencias pesan más que los hechos", "no existe internet", "todos dicen la verdad"],
      respuestaCorrecta: 1,
      retroalimentacion: "Las emociones pesan más que la evidencia.",
    },
    {
      enunciado: "Ante una información, una actitud filosófica crítica es…",
      opciones: ["creer todo lo que se comparte", "preguntar quién lo dice y con qué pruebas", "ignorar siempre las fuentes", "difundirla sin leerla"],
      respuestaCorrecta: 1,
      retroalimentacion: "Interpretar con cuidado: fuente, pruebas e intención.",
    },
  ],
};

/** Actividad A6 «Completa: conocimiento y verdad» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "PFH-I-P06-A6 · Completa: conocimiento y verdad",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "La ",
    " es la rama de la filosofía que estudia el conocimiento. Sus dos fuentes clásicas son la ",
    ", por los sentidos, y la razón, por el pensamiento. El problema de la ",
    " pregunta qué hace verdadera una afirmación. Cuando las emociones pesan más que los hechos hablamos de ",
    ".",
  ],
  huecos: [
    { respuesta: "epistemología", alternativas: ["epistemologia", "teoría del conocimiento", "teoria del conocimiento"], pista: "Estudia el conocimiento." },
    { respuesta: "percepción", alternativas: ["percepcion"], pista: "Por los sentidos." },
    { respuesta: "verdad", alternativas: [], pista: "El problema de la ___." },
    { respuesta: "posverdad", alternativas: [], pista: "Emociones por encima de los hechos." },
  ],
};
