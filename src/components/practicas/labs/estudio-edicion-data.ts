/**
 * Datos y modelo del laboratorio "Estudio de edición de contenido digital"
 * (CD-III, progresión 3; actividades CD-III-P04-A1…A8).
 *
 * Propósito de la progresión: «Utiliza dispositivos tecnológicos, servicios de
 * difusión y herramientas de software para crear y editar contenido digital,
 * conforme a sus recursos y contextos.»
 *
 * Anclas (verbatim):
 *   - A1 lectura «Participación ciudadana digital…»: marco teórico y recuadro.
 *   - A2 simulación «diseña y evalúa un proyecto de participación comunitaria
 *     digital»: inspira el hilo del laboratorio (producir la difusión de un
 *     proyecto comunitario con los recursos reales de la comunidad).
 *   - A4 verdadero/falso: hechos. A5 glosario. A6 completa el texto.
 *   - A8 video «Creación y edición de contenido digital»: sus dos preguntas
 *     cerradas forman el reto evaluable.
 *
 * Modelo (NO verbatim, pero exacto y comprobable):
 *   - Imagen: peso = ancho × alto × bits ÷ 8; cuantización a 1, 8 (3-3-2),
 *     16 (5-6-5) y 24 bits; compresión sin pérdida por longitud de secuencias
 *     (RLE) contada byte a byte; compresión con pérdida con la transformada
 *     DCT de 8×8 y las tablas de cuantización del estándar JPEG (ITU-T T.81,
 *     anexo K) escaladas con la fórmula de calidad de la IJG; error en PSNR.
 *   - Capas: composición «encima» C = α·capa + (1 − α)·abajo en sRGB, y
 *     razón de contraste de las WCAG 2.x con luminancia relativa.
 *   - Video y audio: tasa sin comprimir = ancho × alto × 24 × fps; PCM =
 *     frecuencia × bits × canales; peso = tasa × duración ÷ 8. Tasas
 *     recomendadas: guía de codificación para subir videos de YouTube (SDR).
 * Las imágenes (foto del parque y logotipo) son sintéticas y los requisitos de
 * cada destino (límite de MB, calidad mínima) son criterios del laboratorio.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";
import type { RetoNumericoData } from "./_reto-numerico";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "imagen" | "capas" | "medios";
export const MODOS: Modo[] = ["imagen", "capas", "medios"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  imagen: { etq: "La imagen por dentro", subtitulo: "Píxeles, bits y compresión", icono: "fa-border-all", color: "#38bdf8" },
  capas: { etq: "Capas de edición", subtitulo: "Arma un cartel legible", icono: "fa-layer-group", color: "#f472b6" },
  medios: { etq: "Video y audio", subtitulo: "Peso, datos y destino", icono: "fa-film", color: "#fbbf24" },
};

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

/** Bytes con unidades del SI (1 kB = 1000 B, 1 MB = 10⁶ B, 1 GB = 10⁹ B). */
export function bytesTxt(b: number): string {
  if (b < 1000) return `${num(b)} B`;
  if (b < 1e6) return `${num(b / 1000, b < 1e4 ? 2 : 1)} kB`;
  if (b < 1e9) return `${num(b / 1e6, b < 1e7 ? 2 : 1)} MB`;
  return `${num(b / 1e9, 2)} GB`;
}

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export type RGB = [number, number, number];

const clamp255 = (x: number) => Math.max(0, Math.min(255, Math.round(x)));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ════════════════════════════════════════════════════════════════════════
 * Imágenes sintéticas
 * ════════════════════════════════════════════════════════════════════════ */

export type ImagenId = "foto" | "logo";
export const IMAGENES: { id: ImagenId; etq: string; detalle: string; icono: string }[] = [
  { id: "foto", etq: "Foto del parque", detalle: "Degradados y grano de cámara: casi ningún píxel se repite.", icono: "fa-image" },
  { id: "logo", etq: "Logotipo del proyecto", detalle: "Pocos colores planos y bordes nítidos.", icono: "fa-shapes" },
];

/** Ruido de sensor determinista (entero en −9…9) a partir de las coordenadas. */
function grano(x: number, y: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return Math.round((s - Math.floor(s)) * 18 - 9);
}

/**
 * Foto del parque al atardecer. `u` y `v` van de 0 a 1 (v hacia abajo);
 * `aspecto` = ancho ÷ alto, para que el sol y la copa sean redondos.
 */
export function colorFoto(u: number, v: number, aspecto: number): RGB {
  let c: RGB;
  const horizonte = 0.64 + 0.045 * Math.sin(u * 7.3 + 0.6);
  if (v < horizonte) {
    const t = Math.pow(v / horizonte, 1.25);
    c = [lerp(38, 252, t), lerp(66, 168, t), lerp(140, 96, t)];
    const ds = Math.hypot((u - 0.68) * aspecto, v - 0.44);
    if (ds < 0.15) {
      const k = ds < 0.105 ? 1 : 1 - (ds - 0.105) / 0.045;
      c = [lerp(c[0], 255, k), lerp(c[1], 226, k), lerp(c[2], 132, k)];
    }
  } else {
    const t = Math.min(1, (v - horizonte) / (1 - horizonte));
    c = [lerp(56, 20, t), lerp(128, 72, t), lerp(66, 40, t)];
  }
  if (u > 0.215 && u < 0.265 && v > 0.5 && v < 0.84) c = [92, 62, 36];
  if (Math.hypot((u - 0.24) * aspecto, v - 0.43) < 0.13) c = [34, 118, 58];
  return c;
}

/** Logotipo: círculo verde, casa blanca y una barra de «letras» sobre fondo crema. */
export function colorLogo(u: number, v: number, aspecto: number): RGB {
  let c: RGB = [246, 244, 236];
  const d = Math.hypot((u - 0.5) * aspecto, v - 0.42);
  if (d < 0.3) c = [22, 163, 74];
  const casa = u > 0.4 && u < 0.6 && v > 0.42 && v < 0.6;
  const techo = v > 0.28 && v <= 0.42 && Math.abs(u - 0.5) < ((v - 0.28) / 0.14) * 0.14;
  if (casa || techo) c = [255, 255, 255];
  if (u > 0.47 && u < 0.53 && v > 0.5 && v < 0.6) c = [217, 119, 6];
  if (v > 0.8 && v < 0.9 && u > 0.14 && u < 0.86 && ((u - 0.14) / 0.06) % 1 < 0.72) c = [30, 41, 59];
  return c;
}

/** Resolución base de las imágenes del modo 1 (se reduce promediando bloques). */
export const BASE_W = 64;
export const BASE_H = 48;

export const RESOLUCIONES = [
  { w: 64, h: 48 },
  { w: 32, h: 24 },
  { w: 16, h: 12 },
] as const;

/** Pixeles RGB (fila por fila) de una imagen a la resolución base. */
export function imagenBase(id: ImagenId): number[] {
  const px: number[] = [];
  const aspecto = BASE_W / BASE_H;
  for (let y = 0; y < BASE_H; y++) {
    for (let x = 0; x < BASE_W; x++) {
      const u = (x + 0.5) / BASE_W;
      const v = (y + 0.5) / BASE_H;
      const c = id === "foto" ? colorFoto(u, v, aspecto) : colorLogo(u, v, aspecto);
      const g = id === "foto" ? grano(x, y) : 0;
      px.push(clamp255(c[0] + g), clamp255(c[1] + g), clamp255(c[2] + g));
    }
  }
  return px;
}

/** Reduce la resolución promediando bloques de `f`×`f` píxeles. */
export function reducir(px: number[], w: number, h: number, f: number): number[] {
  if (f === 1) return [...px];
  const out: number[] = [];
  const w2 = Math.floor(w / f);
  const h2 = Math.floor(h / f);
  for (let y = 0; y < h2; y++) {
    for (let x = 0; x < w2; x++) {
      for (let ch = 0; ch < 3; ch++) {
        let s = 0;
        for (let dy = 0; dy < f; dy++) for (let dx = 0; dx < f; dx++) s += px[((y * f + dy) * w + (x * f + dx)) * 3 + ch]!;
        out.push(Math.round(s / (f * f)));
      }
    }
  }
  return out;
}

/* ── Profundidad de color ─────────────────────────────────────────────── */

export type Bits = 1 | 8 | 16 | 24;
export const PROFUNDIDADES: { bits: Bits; etq: string; reparto: number[]; detalle: string }[] = [
  { bits: 1, etq: "1 bit", reparto: [1], detalle: "2 colores: blanco o negro" },
  { bits: 8, etq: "8 bits", reparto: [3, 3, 2], detalle: "256 colores (3 bits rojo, 3 verde, 2 azul)" },
  { bits: 16, etq: "16 bits", reparto: [5, 6, 5], detalle: "65 536 colores (5-6-5)" },
  { bits: 24, etq: "24 bits", reparto: [8, 8, 8], detalle: "16 777 216 colores: 8 bits por canal" },
];

export const luma = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b;

/**
 * Código binario que guarda cada canal con esa profundidad y el color que se
 * reconstruye. Con 1 bit se guarda un solo bit (blanco si la luminancia ≥ 128).
 */
export function cuantizarPixel(r: number, g: number, b: number, bits: Bits): { codigos: number[]; color: RGB } {
  if (bits === 1) {
    const on = luma(r, g, b) >= 128 ? 1 : 0;
    return { codigos: [on], color: on ? [255, 255, 255] : [0, 0, 0] };
  }
  const reparto = PROFUNDIDADES.find((p) => p.bits === bits)!.reparto;
  const codigos = [r, g, b].map((val, i) => {
    const max = 2 ** reparto[i]! - 1;
    return Math.round((val * max) / 255);
  });
  const color = codigos.map((cod, i) => Math.round((cod * 255) / (2 ** reparto[i]! - 1))) as RGB;
  return { codigos, color };
}

export function cuantizar(px: number[], bits: Bits): number[] {
  const out: number[] = [];
  for (let i = 0; i < px.length; i += 3) out.push(...cuantizarPixel(px[i]!, px[i + 1]!, px[i + 2]!, bits).color);
  return out;
}

/** Bytes de los datos de píxel sin comprimir (sin encabezado). */
export const bytesCrudos = (w: number, h: number, bits: number) => (w * h * bits) / 8;

export function coloresDistintos(px: number[]): number {
  const s = new Set<number>();
  for (let i = 0; i < px.length; i += 3) s.add((px[i]! << 16) | (px[i + 1]! << 8) | px[i + 2]!);
  return s.size;
}

/* ── Compresión sin pérdida: longitud de secuencias (RLE) ─────────────── */

/**
 * Recorre la imagen fila por fila y guarda cada secuencia de píxeles iguales
 * como (repeticiones, color). Cada secuencia ocupa 1 byte de conteo (máximo
 * 255) más los bytes del color: 1 byte con 1 u 8 bits, 2 con 16 y 3 con 24.
 */
export function rle(px: number[], w: number, bits: Bits): { secuencias: number; bytes: number } {
  const bytesColor = Math.ceil(bits / 8);
  let secuencias = 0;
  const n = px.length / 3;
  let i = 0;
  while (i < n) {
    let largo = 1;
    while (
      i + largo < n &&
      largo < 255 &&
      (i + largo) % w !== 0 &&
      px[(i + largo) * 3] === px[i * 3] &&
      px[(i + largo) * 3 + 1] === px[i * 3 + 1] &&
      px[(i + largo) * 3 + 2] === px[i * 3 + 2]
    )
      largo++;
    secuencias++;
    i += largo;
  }
  return { secuencias, bytes: secuencias * (1 + bytesColor) };
}

/* ── Compresión con pérdida: DCT 8×8 al estilo JPEG ────────────────────── */

/** Tabla de cuantización de luminancia, ITU-T T.81 anexo K.1 (fila = frecuencia vertical). */
export const Q_LUMA = [
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92,
  49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
];
/** Tabla de cuantización de crominancia, ITU-T T.81 anexo K.2. */
export const Q_CROMA = [
  17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
];

/** Escala una tabla con la calidad (1–100) como lo hace la biblioteca libjpeg de la IJG. */
export function tablaCalidad(base: number[], calidad: number): number[] {
  const q = Math.max(1, Math.min(100, Math.round(calidad)));
  const s = q < 50 ? Math.floor(5000 / q) : 200 - 2 * q;
  return base.map((v) => Math.max(1, Math.min(255, Math.floor((v * s + 50) / 100))));
}

const COS: number[] = [];
for (let x = 0; x < 8; x++) for (let u = 0; u < 8; u++) COS.push(Math.cos(((2 * x + 1) * u * Math.PI) / 16));
const CU = (u: number) => (u === 0 ? Math.SQRT1_2 : 1);

function dct8(bloque: number[]): number[] {
  const F: number[] = [];
  for (let v = 0; v < 8; v++)
    for (let u = 0; u < 8; u++) {
      let s = 0;
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) s += bloque[y * 8 + x]! * COS[x * 8 + u]! * COS[y * 8 + v]!;
      F.push(0.25 * CU(u) * CU(v) * s);
    }
  return F;
}

function idct8(F: number[]): number[] {
  const f: number[] = [];
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      let s = 0;
      for (let v = 0; v < 8; v++) for (let u = 0; u < 8; u++) s += CU(u) * CU(v) * F[v * 8 + u]! * COS[x * 8 + u]! * COS[y * 8 + v]!;
      f.push(0.25 * s);
    }
  return f;
}

export interface ResultadoJpeg {
  px: number[];
  /** Coeficientes cuantizados distintos de cero (lo que realmente hay que guardar). */
  noCero: number;
  total: number;
}

/**
 * Codifica y decodifica con pérdida: RGB → YCbCr (JFIF), bloques de 8×8 con
 * el borde replicado, DCT, cuantización con las tablas escaladas, redondeo,
 * y el camino inverso. Sin submuestreo de color, para aislar el efecto de la
 * cuantización.
 */
export function jpeg(px: number[], w: number, h: number, calidad: number): ResultadoJpeg {
  const qy = tablaCalidad(Q_LUMA, calidad);
  const qc = tablaCalidad(Q_CROMA, calidad);
  const W8 = Math.ceil(w / 8) * 8;
  const H8 = Math.ceil(h / 8) * 8;
  const canales: number[][] = [[], [], []];
  for (let y = 0; y < H8; y++)
    for (let x = 0; x < W8; x++) {
      const k = (Math.min(y, h - 1) * w + Math.min(x, w - 1)) * 3;
      const r = px[k]!;
      const g = px[k + 1]!;
      const b = px[k + 2]!;
      canales[0]!.push(0.299 * r + 0.587 * g + 0.114 * b);
      canales[1]!.push(-0.168736 * r - 0.331264 * g + 0.5 * b + 128);
      canales[2]!.push(0.5 * r - 0.418688 * g - 0.081312 * b + 128);
    }
  const rec: number[][] = [Array(W8 * H8).fill(0), Array(W8 * H8).fill(0), Array(W8 * H8).fill(0)];
  let noCero = 0;
  let total = 0;
  for (let ch = 0; ch < 3; ch++) {
    const tabla = ch === 0 ? qy : qc;
    for (let by = 0; by < H8; by += 8)
      for (let bx = 0; bx < W8; bx += 8) {
        const bloque: number[] = [];
        for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bloque.push(canales[ch]![(by + y) * W8 + bx + x]! - 128);
        const F = dct8(bloque);
        const Fq = F.map((c, i) => {
          const q = Math.round(c / tabla[i]!);
          total++;
          if (q !== 0) noCero++;
          return q * tabla[i]!;
        });
        const f = idct8(Fq);
        for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) rec[ch]![(by + y) * W8 + bx + x] = f[y * 8 + x]! + 128;
      }
  }
  const out: number[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * W8 + x;
      const Y = rec[0]![i]!;
      const cb = rec[1]![i]! - 128;
      const cr = rec[2]![i]! - 128;
      out.push(clamp255(Y + 1.402 * cr), clamp255(Y - 0.344136 * cb - 0.714136 * cr), clamp255(Y + 1.772 * cb));
    }
  return { px: out, noCero, total };
}

/** Relación señal/ruido de pico en dB; Infinity si las imágenes son idénticas. */
export function psnr(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i]! - b[i]!) ** 2;
  if (s === 0) return Infinity;
  return 10 * Math.log10((255 * 255) / (s / a.length));
}

export type Compresion = "ninguna" | "sinPerdida" | "conPerdida";
export const COMPRESIONES: { id: Compresion; etq: string; detalle: string; icono: string }[] = [
  { id: "ninguna", etq: "Sin comprimir", detalle: "Todos los píxeles, uno tras otro (como un BMP)", icono: "fa-box-open" },
  { id: "sinPerdida", etq: "Sin pérdida (RLE)", detalle: "La idea de PNG: se recupera idéntica", icono: "fa-file-zipper" },
  { id: "conPerdida", etq: "Con pérdida (DCT)", detalle: "La idea de JPEG: se descarta detalle", icono: "fa-scissors" },
];

export interface ProcesoImagen {
  w: number;
  h: number;
  /** Lo que se ve después de guardar y volver a abrir. */
  px: number[];
  /** La imagen a esa resolución antes de cuantizar o comprimir. */
  original: number[];
  bitsEfectivos: Bits;
  bytesSinComprimir: number;
  bytesArchivo: number | null;
  secuencias: number | null;
  noCero: number | null;
  totalCoef: number | null;
  psnr: number;
  colores: number;
}

export function procesarImagen(id: ImagenId, resIdx: number, bits: Bits, comp: Compresion, calidad: number): ProcesoImagen {
  const res = RESOLUCIONES[resIdx] ?? RESOLUCIONES[0];
  const f = BASE_W / res.w;
  const original = reducir(imagenBase(id), BASE_W, BASE_H, f);
  const bitsEfectivos: Bits = comp === "conPerdida" ? 24 : bits;
  const bytesSinComprimir = bytesCrudos(res.w, res.h, bitsEfectivos);
  if (comp === "conPerdida") {
    const j = jpeg(original, res.w, res.h, calidad);
    return { w: res.w, h: res.h, px: j.px, original, bitsEfectivos, bytesSinComprimir, bytesArchivo: null, secuencias: null, noCero: j.noCero, totalCoef: j.total, psnr: psnr(original, j.px), colores: coloresDistintos(j.px) };
  }
  const q = cuantizar(original, bitsEfectivos);
  const r = comp === "sinPerdida" ? rle(q, res.w, bitsEfectivos) : null;
  return {
    w: res.w,
    h: res.h,
    px: q,
    original,
    bitsEfectivos,
    bytesSinComprimir,
    bytesArchivo: r ? r.bytes : bytesSinComprimir,
    secuencias: r ? r.secuencias : null,
    noCero: null,
    totalCoef: null,
    psnr: psnr(original, q),
    colores: coloresDistintos(q),
  };
}

/** Fotos reales para escalar el cálculo: mismos bits, más píxeles. */
export const FOTOS_REALES = [
  { etq: "Foto de celular de 12 MP", w: 4000, h: 3000 },
  { etq: "Pantalla Full HD", w: 1920, h: 1080 },
] as const;

/* ════════════════════════════════════════════════════════════════════════
 * 2. CAPAS
 * ════════════════════════════════════════════════════════════════════════ */

export type CapaId = "foto" | "ajuste" | "banda" | "texto";

export const CAPA_DEF: Record<CapaId, { etq: string; icono: string; color: string; explica: string }> = {
  foto: { etq: "Foto del parque", icono: "fa-image", color: "#38bdf8", explica: "Capa opaca: tapa todo lo que quede debajo." },
  ajuste: { etq: "Ajuste: oscurecer", icono: "fa-circle-half-stroke", color: "#a78bfa", explica: "Una capa de ajuste modifica todo lo que está debajo de ella." },
  banda: { etq: "Banda oscura", icono: "fa-square", color: "#94a3b8", explica: "Rectángulo negro semitransparente detrás del texto." },
  texto: { etq: "Texto del cartel", icono: "fa-font", color: "#fbbf24", explica: "El aviso: qué, cuándo y dónde." },
};

/** Orden inicial, de abajo hacia arriba: el cartel empieza mal armado. */
export const ORDEN_INICIAL: CapaId[] = ["texto", "foto", "ajuste", "banda"];

export const TEXTO_CARTEL = { titulo: "LIMPIEZA DEL PARQUE", linea: "Sábado 9:00 h · trae guantes" };

export const COLORES_TEXTO = [
  { id: "blanco", etq: "Blanco", rgb: [255, 255, 255] as RGB },
  { id: "amarillo", etq: "Amarillo", rgb: [253, 224, 71] as RGB },
  { id: "negro", etq: "Negro", rgb: [15, 23, 42] as RGB },
] as const;
export type ColorTextoId = (typeof COLORES_TEXTO)[number]["id"];

/** Cartel vertical 4:5 (el de una publicación de 1080 × 1350). */
export const CARTEL_W = 96;
export const CARTEL_H = 120;
export const CARTEL_REAL = { w: 1080, h: 1350 };
/** Zona del texto (y de la banda), en fracciones del cartel. */
export const ZONA_TEXTO = { u0: 0.06, u1: 0.94, v0: 0.31, v1: 0.53 };
export const CONTRASTE_AA = 4.5;

export function fotoCartel(): number[] {
  const px: number[] = [];
  const aspecto = CARTEL_W / CARTEL_H;
  for (let y = 0; y < CARTEL_H; y++)
    for (let x = 0; x < CARTEL_W; x++) {
      const c = colorFoto((x + 0.5) / CARTEL_W, (y + 0.5) / CARTEL_H, aspecto);
      const g = grano(x + 3, y + 7);
      px.push(clamp255(c[0] + g), clamp255(c[1] + g), clamp255(c[2] + g));
    }
  return px;
}

export interface EstadoCapas {
  orden: CapaId[];
  visible: Record<CapaId, boolean>;
  /** Opacidad de foto, banda y texto; en el ajuste, cuánto oscurece (0–1). */
  valor: Record<CapaId, number>;
  colorTexto: ColorTextoId;
}

/** Aplica una capa «encima» sobre un color (sRGB, 0–255). */
function sobre(abajo: RGB, capa: RGB, alfa: number): RGB {
  return [alfa * capa[0] + (1 - alfa) * abajo[0], alfa * capa[1] + (1 - alfa) * abajo[1], alfa * capa[2] + (1 - alfa) * abajo[2]];
}

/** Compone un píxel del cartel con todas las capas visibles; `conTexto` indica si el texto cubre ese punto. */
export function componerPixel(e: EstadoCapas, foto: RGB, enZona: boolean, conTexto: boolean): RGB {
  let c: RGB = [255, 255, 255];
  for (const id of e.orden) {
    if (!e.visible[id]) continue;
    const a = e.valor[id];
    if (id === "foto") c = sobre(c, foto, a);
    else if (id === "ajuste") c = sobre(c, [0, 0, 0], a);
    else if (id === "banda" && enZona) c = sobre(c, [0, 0, 0], a);
    else if (id === "texto" && conTexto) c = sobre(c, COLORES_TEXTO.find((t) => t.id === e.colorTexto)!.rgb, a);
  }
  return c;
}

/** Luminancia relativa WCAG 2.x de un color sRGB (0–255). */
export function luminancia(c: RGB): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
}

export function razonContraste(a: RGB, b: RGB): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export interface EvalCapas {
  /** Contraste mínimo entre el texto y su fondo en toda la zona del texto. */
  contraste: number;
  peorFondo: RGB;
  peorTexto: RGB;
  textoTapado: boolean;
  ajusteSobreTexto: boolean;
  bandaSobreTexto: boolean;
  bandaDebajoFoto: boolean;
  ordenCorrecto: boolean;
}

export function evaluarCapas(e: EstadoCapas, foto: number[]): EvalCapas {
  const pos = (id: CapaId) => e.orden.indexOf(id);
  const textoTapado = pos("foto") > pos("texto") && e.visible.foto && e.valor.foto >= 0.999;
  const ajusteSobreTexto = pos("ajuste") > pos("texto");
  const bandaSobreTexto = pos("banda") > pos("texto");
  const bandaDebajoFoto = pos("banda") < pos("foto");
  const ordenCorrecto = pos("foto") === 0 && pos("texto") === 3;
  let contraste = Infinity;
  let peorFondo: RGB = [0, 0, 0];
  let peorTexto: RGB = [0, 0, 0];
  const x0 = Math.floor(ZONA_TEXTO.u0 * CARTEL_W);
  const x1 = Math.ceil(ZONA_TEXTO.u1 * CARTEL_W);
  const y0 = Math.floor(ZONA_TEXTO.v0 * CARTEL_H);
  const y1 = Math.ceil(ZONA_TEXTO.v1 * CARTEL_H);
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const k = (y * CARTEL_W + x) * 3;
      const f: RGB = [foto[k]!, foto[k + 1]!, foto[k + 2]!];
      const fondo = componerPixel(e, f, true, false);
      const texto = componerPixel(e, f, true, true);
      const r = razonContraste(fondo, texto);
      if (r < contraste) {
        contraste = r;
        peorFondo = fondo;
        peorTexto = texto;
      }
    }
  if (!e.visible.texto) contraste = 1;
  return { contraste, peorFondo, peorTexto, textoTapado, ajusteSobreTexto, bandaSobreTexto, bandaDebajoFoto, ordenCorrecto };
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. VIDEO Y AUDIO
 * ════════════════════════════════════════════════════════════════════════ */

export const RES_VIDEO = [
  { id: "360p", w: 640, h: 360, rec30: 1, rec60: 1.5 },
  { id: "480p", w: 854, h: 480, rec30: 2.5, rec60: 4 },
  { id: "720p", w: 1280, h: 720, rec30: 5, rec60: 7.5 },
  { id: "1080p", w: 1920, h: 1080, rec30: 8, rec60: 12 },
  { id: "2160p", w: 3840, h: 2160, rec30: 35, rec60: 53 },
] as const;
export type ResVideoId = (typeof RES_VIDEO)[number]["id"];

export const FPS = [24, 30, 60] as const;
export type Fps = (typeof FPS)[number];

/** Pasos del control de tasa de bits de video, en Mbps. */
export const TASAS_VIDEO = [0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10, 12, 16, 20, 25, 35, 45, 53];

/** Audio del video: AAC a 128 kbps. */
export const AUDIO_VIDEO_KBPS = 128;

/** Bits por segundo de video sin comprimir, con 24 bits por píxel. */
export const tasaVideoCruda = (w: number, h: number, fps: number) => w * h * 24 * fps;

/** Tasa recomendada por YouTube para subir video SDR (24–30 fps usan la de 30). */
export function tasaRecomendada(resId: ResVideoId, fps: Fps): number {
  const r = RES_VIDEO.find((x) => x.id === resId)!;
  return fps === 60 ? r.rec60 : r.rec30;
}

export type CalidadVideo = "nitido" | "aceptable" | "pixelado";
export function calidadVideo(mbps: number, resId: ResVideoId, fps: Fps): CalidadVideo {
  const rec = tasaRecomendada(resId, fps);
  if (mbps >= rec) return "nitido";
  if (mbps >= rec / 2) return "aceptable";
  return "pixelado";
}

export const CALIDAD_DEF: Record<CalidadVideo, { etq: string; color: string; explica: string }> = {
  nitido: { etq: "Nítido", color: "#34d399", explica: "La tasa alcanza la recomendada para esa resolución y fps." },
  aceptable: { etq: "Aceptable", color: "#fbbf24", explica: "Entre la mitad y la tasa recomendada: se nota algo de bloque en escenas con movimiento." },
  pixelado: { etq: "Se pixelea", color: "#f87171", explica: "Menos de la mitad de la tasa recomendada: faltan bits para tantos píxeles y cuadros." },
};

/** Peso en bytes de un archivo a una tasa total (bit/s) durante `seg` segundos. */
export const pesoBytes = (bps: number, seg: number) => (bps * seg) / 8;

export type DestinoVideoId = "celular" | "proyector";
export interface DestinoVideo {
  id: DestinoVideoId;
  etq: string;
  icono: string;
  contexto: string;
  duracionInicial: number;
  maxBytes: number;
  /** Resolución mínima y máxima útil (índices de RES_VIDEO). */
  resMin: number;
  resMax: number;
  calidadMin: CalidadVideo;
  contenedor: { etq: string; bytes: number };
}

export const DESTINOS_VIDEO: DestinoVideo[] = [
  {
    id: "celular",
    etq: "Celulares con datos limitados",
    icono: "fa-mobile-screen",
    contexto: "Aviso de 1 minuto para el grupo de mensajería de la colonia. Muchas familias tienen un paquete de 1 GB al mes: el video no debe gastar más de 15 MB (1.5 % del paquete) y debe verse al menos aceptable en 480p o más.",
    duracionInicial: 60,
    maxBytes: 15e6,
    resMin: 1,
    resMax: 4,
    calidadMin: "aceptable",
    contenedor: { etq: "Paquete de 1 GB", bytes: 1e9 },
  },
  {
    id: "proyector",
    etq: "Proyector comunitario",
    icono: "fa-film",
    contexto: "Proyección de 5 minutos en la plaza con un proyector de 1920 × 1080. El archivo va en una memoria USB con formato FAT32, que no admite archivos de 4 GiB o más. Debe verse nítido; más resolución que la del proyector solo gasta espacio.",
    duracionInicial: 300,
    maxBytes: 4294967295,
    resMin: 3,
    resMax: 3,
    calidadMin: "nitido",
    contenedor: { etq: "Límite de archivo FAT32 (4 GiB)", bytes: 4294967296 },
  },
];

export interface CalculoVideo {
  bpsVideo: number;
  bpsTotal: number;
  bytes: number;
  crudoBps: number;
  factorCompresion: number;
  calidad: CalidadVideo;
  recomendada: number;
  fraccionContenedor: number;
  vecesPaquete: number;
  cumple: { peso: boolean; resolucion: boolean; calidad: boolean };
  ok: boolean;
}

const ORDEN_CAL: CalidadVideo[] = ["pixelado", "aceptable", "nitido"];

export function calcularVideo(d: DestinoVideo, resIdx: number, fps: Fps, mbps: number, seg: number): CalculoVideo {
  const r = RES_VIDEO[resIdx] ?? RES_VIDEO[0];
  const bpsVideo = mbps * 1e6;
  const bpsTotal = bpsVideo + AUDIO_VIDEO_KBPS * 1000;
  const bytes = pesoBytes(bpsTotal, seg);
  const crudoBps = tasaVideoCruda(r.w, r.h, fps);
  const calidad = calidadVideo(mbps, r.id, fps);
  const cumple = {
    peso: bytes <= d.maxBytes,
    resolucion: resIdx >= d.resMin && resIdx <= d.resMax,
    calidad: ORDEN_CAL.indexOf(calidad) >= ORDEN_CAL.indexOf(d.calidadMin),
  };
  return {
    bpsVideo,
    bpsTotal,
    bytes,
    crudoBps,
    factorCompresion: crudoBps / bpsVideo,
    calidad,
    recomendada: tasaRecomendada(r.id, fps),
    fraccionContenedor: bytes / d.contenedor.bytes,
    vecesPaquete: Math.floor(1e9 / bytes),
    cumple,
    ok: cumple.peso && cumple.resolucion && cumple.calidad,
  };
}

/* ── Audio ────────────────────────────────────────────────────────────── */

export const FRECUENCIAS = [8000, 16000, 22050, 44100, 48000] as const;
export const BITS_AUDIO = [8, 16, 24] as const;
export const TASAS_AUDIO = [32, 64, 96, 128, 192, 320] as const;

export type FormatoAudio = "pcm" | "comprimido";

export type DestinoAudioId = "podcast" | "maestra";
export interface DestinoAudio {
  id: DestinoAudioId;
  etq: string;
  icono: string;
  contexto: string;
  minutos: number;
  maxBytes: number | null;
  sinPerdida: boolean;
  frecuenciaMin: number;
  kbpsMin: number;
}

export const DESTINOS_AUDIO: DestinoAudio[] = [
  {
    id: "podcast",
    etq: "Podcast de la radio comunitaria",
    icono: "fa-podcast",
    contexto: "Episodio de 10 minutos de entrevistas con vecinos, para descargarse con datos móviles: no debe pasar de 10 MB. La voz debe oírse clara: muestreo de al menos 16 kHz o, si se comprime, al menos 64 kbps.",
    minutos: 10,
    maxBytes: 10e6,
    sinPerdida: false,
    frecuenciaMin: 16000,
    kbpsMin: 64,
  },
  {
    id: "maestra",
    etq: "Grabación maestra para editar",
    icono: "fa-sliders",
    contexto: "La entrevista original de 10 minutos, que todavía vas a cortar y mezclar. Guárdala sin pérdida (cada nueva compresión con pérdida borra más detalle) y con calidad de música: 44.1 kHz o más.",
    minutos: 10,
    maxBytes: null,
    sinPerdida: true,
    frecuenciaMin: 44100,
    kbpsMin: 0,
  },
];

export interface CalculoAudio {
  bps: number;
  bytes: number;
  frecuenciaMax: number;
  niveles: number;
  snrDb: number | null;
  cumple: { peso: boolean; formato: boolean; claridad: boolean };
  ok: boolean;
}

/**
 * PCM: bits/s = frecuencia × bits × canales. Comprimido: la tasa elegida (ya
 * incluye todos los canales) sobre una fuente de 44.1 kHz.
 */
export function calcularAudio(d: DestinoAudio, formato: FormatoAudio, frecuencia: number, bits: number, canales: number, kbps: number, minutos: number): CalculoAudio {
  const pcm = formato === "pcm";
  const bps = pcm ? frecuencia * bits * canales : kbps * 1000;
  const bytes = pesoBytes(bps, minutos * 60);
  const fs = pcm ? frecuencia : 44100;
  const cumple = {
    peso: d.maxBytes === null || bytes <= d.maxBytes,
    formato: d.sinPerdida ? pcm : true,
    claridad: pcm ? frecuencia >= d.frecuenciaMin : kbps >= d.kbpsMin && fs >= d.frecuenciaMin,
  };
  return {
    bps,
    bytes,
    frecuenciaMax: fs / 2,
    niveles: pcm ? 2 ** bits : 0,
    snrDb: pcm ? 6.02 * bits + 1.76 : null,
    cumple,
    ok: cumple.peso && cumple.formato && cumple.claridad,
  };
}

/**
 * Señal sintética parecida a una voz: tres componentes graves y medios y uno
 * agudo de 6.5 kHz, como el siseo de la /s/, que tiene mucha energía por
 * encima de 4 kHz. Amplitudes en −1…1.
 */
export const COMPONENTES: { hz: number; amp: number; fase: number; etq: string }[] = [
  { hz: 700, amp: 0.5, fase: 0, etq: "700 Hz" },
  { hz: 1900, amp: 0.25, fase: 0.7, etq: "1.9 kHz" },
  { hz: 3100, amp: 0.12, fase: 1.9, etq: "3.1 kHz" },
  { hz: 6500, amp: 0.1, fase: 0.4, etq: "6.5 kHz (/s/)" },
];

/**
 * Valor de la señal en el instante `tSeg`. Con `nyquist`, se omiten los
 * componentes que no caben por debajo de la mitad de la frecuencia de
 * muestreo, como hace el filtro antialias de un grabador antes de muestrear.
 */
export function senal(tSeg: number, nyquist = Infinity): number {
  return COMPONENTES.reduce((s, c) => (c.hz < nyquist ? s + c.amp * Math.sin(2 * Math.PI * c.hz * tSeg + c.fase) : s), 0);
}

/** Cuantiza un valor en −1…1 con `bits` bits (niveles simétricos). */
export function cuantizarMuestra(x: number, bits: number): number {
  const m = 2 ** (bits - 1) - 1;
  return Math.round(Math.max(-1, Math.min(1, x)) * m) / m;
}
/** Ventana de tiempo que se dibuja: 2 milisegundos. */
export const VENTANA_S = 0.002;

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas: ¿con pérdida o sin pérdida?
 * ════════════════════════════════════════════════════════════════════════ */

export const CASOS_FORMATO: { texto: string; sinPerdida: boolean; porque: string }[] = [
  { texto: "El logotipo del proyecto, con bordes nítidos y pocos colores.", sinPerdida: true, porque: "La compresión con pérdida deja halos en los bordes; en colores planos, PNG comprime bien sin perder nada." },
  { texto: "Una captura de pantalla de un tutorial con letras pequeñas.", sinPerdida: true, porque: "Con pérdida, las letras se emborronan; PNG las conserva exactas." },
  { texto: "La grabación original de la entrevista que todavía vas a editar.", sinPerdida: true, porque: "Cada vez que se vuelve a comprimir con pérdida se descarta más detalle; la maestra va en WAV o FLAC." },
  { texto: "La hoja de cálculo con los resultados de la encuesta vecinal.", sinPerdida: true, porque: "Un solo dígito cambiado arruina el dato: se comprime en ZIP, que recupera el archivo idéntico." },
  { texto: "Una aplicación que compartes para que otros la instalen.", sinPerdida: true, porque: "Si cambia un solo bit, el programa puede dejar de funcionar." },
  { texto: "La foto del parque para mandar al grupo de la colonia.", sinPerdida: false, porque: "El ojo no nota el detalle fino que descarta JPEG y la foto pesa muchas veces menos." },
  { texto: "El video del evento para verse en el celular con datos.", sinPerdida: false, porque: "Sin comprimir, un minuto de 1080p a 30 fps pesaría más de 11 GB; MP4 (H.264) lo deja en megabytes." },
  { texto: "El podcast de la radio comunitaria para escucharse con datos.", sinPerdida: false, porque: "MP3 o AAC quitan lo que el oído casi no percibe: a 64 kbps, 10 minutos pesan 4.8 MB." },
  { texto: "La transmisión en vivo de la asamblea vecinal.", sinPerdida: false, porque: "Sin comprimir, 1080p a 30 fps necesita casi 1.5 Gbps; ninguna conexión común lo aguanta." },
  { texto: "Las fotos del recorrido para la página del proyecto.", sinPerdida: false, porque: "JPEG o WebP hacen que la página cargue rápido incluso con mala señal." },
];

export function rondaCasos(rnd: () => number, n = 6): number[] {
  const si = CASOS_FORMATO.map((c, i) => ({ c, i })).filter((x) => x.c.sinPerdida).map((x) => x.i);
  const no = CASOS_FORMATO.map((c, i) => ({ c, i })).filter((x) => !x.c.sinPerdida).map((x) => x.i);
  const baraja = (xs: number[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  const mitad = Math.floor(n / 2);
  return baraja([...baraja(si).slice(0, n - mitad), ...baraja(no).slice(0, mitad)]);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Participación ciudadana digital: del activismo en línea al cambio real";

/** Lectura A1 — seis párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "La tecnología digital ha transformado profundamente las formas en que los ciudadanos participan en la vida pública. Peticiones en línea, campañas en redes sociales, colectivos organizados por WhatsApp, manifestaciones convocadas por Twitter o Instagram: estas prácticas son parte cotidiana de la vida política de millones de mexicanos, especialmente de las generaciones más jóvenes que crecieron con internet como parte de su entorno natural.",
  "En México, algunos de los movimientos sociales más importantes de la última década se organizaron y amplificaron gracias a las redes sociales. El movimiento #MeToo llegó a México en 2019-2020 con una ola de denuncias públicas de acoso y abuso sexual en universidades, medios de comunicación y círculos culturales. Las listas de acosadores publicadas en Twitter y los testimonios compartidos en redes sociales rompieron el silencio que por décadas protegió a los agresores y abrieron debates públicos sobre la cultura del abuso en distintas instituciones. El movimiento #UnDíaSinNosotras del 9 de marzo de 2020 convocó a un paro nacional de mujeres que tuvo una organización masiva en redes sociales y movilizó a millones de mujeres en todo el país.",
  "Las comunidades digitales pueden tener impactos concretos en la realidad más allá de las tendencias en redes. Tras el sismo del 19 de septiembre de 2017, las redes sociales y aplicaciones de mensajería coordinaron en tiempo real las labores de rescate, la distribución de víveres y la localización de personas atrapadas. Equipos de voluntarios usaron Google Maps y plataformas colaborativas para mapear los edificios dañados y las necesidades urgentes de cada colonia. Colectivas feministas han construido redes de apoyo mutuo digitales para acompañar a víctimas de violencia de género, compartir información sobre albergues y recursos legales, y coordinar acciones de incidencia política.",
  "La metodología de proyectos comunitarios permite canalizar estas energías colectivas hacia soluciones sostenibles. Un proyecto de participación comunitaria digital bien diseñado sigue cuatro etapas: primero, el diagnóstico participativo, que consiste en identificar colectivamente el problema que se quiere resolver, escuchando a quienes lo viven; segundo, el diseño, que implica definir la solución digital apropiada, los recursos necesarios y los actores involucrados; tercero, la implementación, que es la puesta en marcha de la solución con evaluación continua; y cuarto, la evaluación del impacto, que mide si la solución resolvió el problema y qué se puede mejorar.",
  "Herramientas digitales colaborativas facilitan el trabajo en equipo para estos proyectos. Trello y Notion son plataformas de gestión de proyectos que permiten organizar tareas, asignar responsabilidades y hacer seguimiento del avance. Google Workspace (Docs, Sheets, Slides, Forms) permite crear y editar documentos colaborativamente en tiempo real. Los repositorios de código abierto en GitHub permiten compartir y desarrollar colectivamente herramientas tecnológicas. Canva y Adobe Express facilitan la producción de contenidos visuales para comunicar el proyecto a la comunidad.",
  "Es importante distinguir entre el activismo digital genuino y el slacktivism: la tendencia a sentirse satisfecho con acciones digitales de bajo costo (compartir una publicación, firmar una petición en línea) sin comprometerse con acciones concretas fuera de las pantallas. Los movimientos sociales más efectivos combinan la movilización digital con la organización en el territorio: se conocen en persona, construyen confianza, desarrollan capacidades colectivas y generan cambios en las instituciones y las políticas. La tecnología es una herramienta poderosa de organización, pero no reemplaza la acción comunitaria directa.",
];

/** Recuadro informativo de la lectura A1 — verbatim. */
export const RECUADRO_A1 =
  "El marco europeo de Competencias Digitales para la Ciudadanía (DigComp), definido por la Comisión Europea, organiza las habilidades digitales en cinco áreas: alfabetización en información y datos, comunicación y colaboración, creación de contenidos digitales, seguridad y resolución de problemas. (La UNESCO maneja su propio marco, el Digital Literacy Global Framework, con siete áreas de competencia.) México las integra en el currículo del NEM desde 2023.";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Cómo utilizaron las redes sociales los movimientos #MeToo y #UnDíaSinNosotras en México y qué impacto concreto tuvieron?",
  "¿Cómo se usaron las herramientas digitales para coordinar la respuesta al sismo del 19S en la Ciudad de México?",
  "¿Cuáles son las cuatro etapas de la metodología de proyectos comunitarios digitales y qué ocurre en cada una?",
  "¿Qué es el slacktivism y por qué el texto señala que el activismo digital más efectivo combina la acción en línea con la organización territorial?",
];

/** Simulación A2 — descripción, variables y una pregunta de reflexión, verbatim. */
export const SIMULACION_A2 = {
  titulo: "Simulación: diseña y evalúa un proyecto de participación comunitaria digital",
  descripcion:
    "Eres parte de un grupo de jóvenes del bachillerato que quiere resolver un problema de su comunidad o colonia usando tecnologías digitales. El problema puede ser: falta de acceso a información sobre servicios públicos, contaminación de un parque o río, inseguridad vial cerca de la escuela, abandono escolar temprano, o falta de espacios culturales para jóvenes. Deben diseñar un proyecto comunitario digital que incluya diagnóstico del problema, solución tecnológica, plan de implementación e indicadores de impacto.",
  variables: [
    "Pertinencia tecnológica: ¿la solución digital propuesta es accesible para la comunidad objetivo?",
    "Viabilidad de recursos desde el contexto del bachillerato",
  ],
  reflexion: "¿Cómo te aseguraste de que tu solución es accesible para todas las personas de la comunidad, incluyendo las que tienen menos acceso a tecnología o conectividad?",
};

/** Hechos: quiz A4 (verdadero/falso), cada enunciado con su retroalimentación verbatim. */
export const HECHOS: string[] = [
  "Verdadero: «El diagnóstico comunitario es el primer paso en el diseño de un proyecto de participación digital y consiste en identificar las necesidades, recursos y contexto de la comunidad antes de proponer soluciones tecnológicas.» Un buen diagnóstico comunitario evita imponer soluciones tecnológicas descontextualizadas y garantiza que el proyecto responda a necesidades reales de las personas.",
  "Falso: «La participación comunitaria digital requiere que todos los miembros de la comunidad tengan acceso a smartphones de última generación y conexión de banda ancha.» Un proyecto comunitario bien diseñado considera las condiciones de conectividad y los dispositivos disponibles en la comunidad, adaptando las herramientas digitales a la realidad existente (por ejemplo, SMS, WhatsApp, grupos de Facebook en lugar de plataformas que requieren conexión permanente).",
  "Falso: «En un proyecto de participación comunitaria digital, la evaluación solo debe realizarse al finalizar el proyecto para determinar si fue exitoso o no.» La evaluación debe ser continua (diagnóstico, proceso y resultado). El seguimiento durante la implementación permite ajustar el proyecto a tiempo y aprender de los obstáculos que surgen.",
  "Verdadero: «El activismo digital puede ser una forma de participación comunitaria: peticiones en línea, campañas en redes sociales y plataformas de incidencia pueden complementar la acción comunitaria presencial.» El activismo digital amplía el alcance de la participación comunitaria y puede articularse con acciones presenciales para lograr mayor impacto. Herramientas como Change.org, campañas de hashtag o grupos de WhatsApp son ejemplos.",
  "Falso: «Al diseñar un proyecto digital comunitario, basta con elegir la tecnología más avanzada disponible para garantizar el éxito del proyecto.» El éxito de un proyecto comunitario depende principalmente de que responda a una necesidad real, involucre a la comunidad en su diseño e implementación, y sea sostenible. La tecnología es un medio, no un fin en sí mismo.",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  {
    termino: "Diagnóstico comunitario",
    definicion:
      "Proceso sistemático de identificar y analizar las necesidades, recursos, actores y contexto de una comunidad antes de diseñar una intervención. En proyectos digitales, incluye mapear el acceso a tecnología y las competencias digitales de la comunidad.",
    ejemplo: "Antes de crear una plataforma de información para vecinos, un grupo de estudiantes encuestó a 50 familias del barrio para saber qué dispositivos tenían, qué aplicaciones usaban y qué información necesitaban con más urgencia.",
  },
  {
    termino: "Diseño participativo",
    definicion: "Enfoque de diseño que involucra a los usuarios finales (en este caso, la comunidad) como co-creadores del proyecto desde el inicio, no solo como receptores de soluciones. Garantiza pertinencia y apropiación del proyecto.",
    ejemplo: "Al diseñar una app para reportar baches en el municipio, el equipo realizó talleres con vecinos para que ellos mismos propusieran las funciones que necesitaban y el lenguaje más claro para usarla.",
  },
  {
    termino: "Ciudadanía digital activa",
    definicion: "Práctica de participar responsablemente en la vida cívica, política y comunitaria a través de herramientas digitales: peticiones, campañas, consultas, difusión de información y organización colectiva en línea.",
    ejemplo: "Jóvenes de una preparatoria crearon una cuenta de Instagram para documentar problemas de infraestructura escolar y etiquetar a las autoridades municipales, logrando que se atendieran tres solicitudes en un semestre.",
  },
  {
    termino: "Herramientas de participación digital",
    definicion:
      "Plataformas y aplicaciones que facilitan la organización, comunicación y acción colectiva en comunidades. Incluyen: grupos de WhatsApp/Telegram, encuestas en línea (Google Forms), plataformas de peticiones (Change.org), mapas colaborativos (Google Maps, Ushahidi) y redes sociales.",
    ejemplo: "Un grupo juvenil usó Google Forms para levantar datos sobre el estado de las luminarias de su colonia, creó un mapa con los puntos sin luz y compartió el reporte con el gobierno municipal vía Twitter.",
  },
  {
    termino: "Sostenibilidad del proyecto",
    definicion: "Capacidad de un proyecto comunitario de mantenerse activo y generar impacto más allá del período inicial sin depender de recursos externos constantes. Implica formación de capacidades locales, liderazgo distribuido y uso de tecnologías de bajo costo.",
    ejemplo: "Un proyecto de radio comunitaria digital es sostenible si forma a varios jóvenes como operadores, usa software libre (Audacity, OBS) y cuenta con el apoyo de la organización comunitaria para su continuidad.",
  },
  {
    termino: "Evaluación de impacto comunitario",
    definicion: "Proceso de medir y valorar los cambios producidos por un proyecto en la comunidad: participación, conocimiento generado, problemas resueltos, redes fortalecidas. Incluye indicadores cuantitativos y cualitativos.",
    ejemplo: "Después de tres meses, el equipo del proyecto evaluó: ¿cuántas personas usaron la plataforma?, ¿qué problemas se reportaron y cuántos fueron atendidos?, ¿qué aprendió la comunidad sobre el proceso?",
  },
];

export const ACTIVIDAD_A5 =
  "Identifica un problema o necesidad real de tu comunidad escolar, barrial o familiar que podría abordarse con tecnología digital. Diseña el esquema básico de un proyecto: (a) diagnóstico (¿cuál es el problema y quiénes afecta?), (b) propuesta de solución digital (¿qué herramienta usarías y por qué?), (c) estrategia de participación (¿cómo involucrarias a la comunidad?), (d) indicadores de evaluación (¿cómo sabrías que funcionó?).";

/** Pregunta abierta del video A8 y reflexión final de la autoevaluación A7 — verbatim. */
export const PREGUNTA_ABIERTA_A8 = "¿Qué pasos seguirías para crear y editar un video o una imagen digital con los recursos que tienes disponibles?";
export const REFLEXION_A7 =
  "¿Qué problema de tu comunidad escolar o barrial podrías comenzar a abordar HOY con las herramientas digitales que ya tienes (un celular, acceso a internet, redes sociales)? ¿Cuál sería tu primer paso concreto esta semana?";

export const FUENTE = "CEN Bachillerato — CD-III, progresión 3: lectura A1 (Material CEN Bachillerato — CD-III), simulación A2, quiz A4, glosario A5, actividad A6, autoevaluación A7 y video A8.";

export const PROBLEMA =
  "Tu grupo del bachillerato organiza la limpieza del parque de la colonia y tiene que difundirla con lo que hay: celulares, datos limitados y un proyector prestado. En este estudio abres una imagen hasta sus bits, armas el cartel por capas para que se lea y preparas el video y el audio a la medida de cada destino.";

export const INSTRUCCIONES: string[] = [
  "En La imagen por dentro, cambia la resolución y los bits de color y mira cómo cambian la cuadrícula y el peso; luego comprime la foto y el logotipo con y sin pérdida.",
  "En Capas de edición, reordena las capas y ajusta su opacidad hasta que el texto del cartel tenga contraste de al menos 4.5:1.",
  "En Video y audio, elige un destino y ajusta resolución, cuadros por segundo, tasa de bits y duración hasta cumplir todos sus requisitos.",
  "Clasifica los casos de «¿Con pérdida o sin pérdida?» para ganar estrellas y resuelve el reto de cálculo, el cuestionario del video A8 y el texto A6.",
];

export const IDEAS: string[] = [
  "Una imagen digital es una cuadrícula: su peso sin comprimir es ancho × alto × bits por píxel ÷ 8.",
  "Cada bit de color duplica los colores posibles: 1 bit da 2, 8 bits dan 256 y 24 bits, 16 777 216.",
  "Sin pérdida se recupera el archivo idéntico; funciona muy bien en colores planos y poco en fotos con grano.",
  "Con pérdida se descarta el detalle que menos se nota; a calidad baja aparecen los bloques de 8×8.",
  "En un editor, cada capa tapa o modifica solo lo que está debajo de ella: el orden importa.",
  "El peso de un video o audio es su tasa de bits por su duración: elegir bien depende del destino y de los datos de tu comunidad.",
];

/** Video A8 «Creación y edición de contenido digital»: preguntas cerradas verbatim. */
export const QUIZ_A8: QuizEvaluable = {
  titulo: "Creación y edición de contenido digital (video A8)",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué se necesita, además de un dispositivo tecnológico, para crear y editar contenido digital?",
      opciones: ["Un cuaderno de apuntes", "Herramientas de software", "Un mapa impreso"],
      respuestaCorrecta: 1,
      retroalimentacion: "El dispositivo captura o reproduce; el software (un editor de imagen, de audio o de video) es el que permite recortar, ajustar, combinar capas y exportar en el formato adecuado.",
    },
    {
      enunciado: "El tipo de contenido digital que se puede crear depende de los recursos y el contexto de quien lo elabora.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Verdadero: con un celular y datos limitados conviene un cartel ligero o un audio comprimido; con un proyector y una USB se puede preparar un video en alta resolución.",
    },
  ],
};

/** Actividad A6 «Completa los espacios — Proyectos de participación comunitaria digital» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CD-III-P04-A6 · Completa los espacios — Proyectos de participación comunitaria digital",
  instrucciones: "Completa los huecos con el término o concepto correcto.",
  partes: [
    "El primer paso en el diseño de un proyecto comunitario digital es realizar un ",
    " comunitario para identificar necesidades y recursos. El enfoque que involucra a los usuarios como co-creadores del proyecto desde el inicio se llama diseño ",
    ". La capacidad de un proyecto de mantenerse activo y generar impacto sin recursos externos constantes se denomina ",
    ". La práctica de participar en la vida cívica a través de herramientas digitales se conoce como ciudadanía digital ",
    ".",
  ],
  huecos: [
    { respuesta: "diagnóstico", alternativas: ["diagnostico"], pista: "Antes de diseñar soluciones, se debe hacer un ___ para entender el contexto y las necesidades reales de la comunidad." },
    { respuesta: "participativo", alternativas: ["participativa"], pista: "El diseño que co-crea con la comunidad en lugar de imponer soluciones se llama diseño ___." },
    { respuesta: "sostenibilidad", alternativas: ["sostenible"], pista: "La propiedad de un proyecto que le permite continuar generando impacto a largo plazo con recursos propios se llama ___." },
    { respuesta: "activa", alternativas: ["activo"], pista: "La ciudadanía digital ___ implica participar con responsabilidad en la vida cívica a través de herramientas digitales." },
  ],
};

/** Reto de cálculo del laboratorio (NO es una actividad de la base de datos). */
export const RETO_VIDEO: RetoNumericoData = {
  titulo: "¿Cuánto pesa el video de la asamblea? (reto del laboratorio)",
  contexto:
    "Peso = (tasa de video + tasa de audio) × duración ÷ 8. Usa unidades del SI: 1 Mbps = 1 000 000 bit/s, 1 kbps = 1000 bit/s, 1 MB = 1 000 000 bytes y 1 GB = 1000 MB.",
  problema:
    "Grabaron 2 minutos de la asamblea vecinal en 720p a 30 fps, con el video a 5 Mbps y el audio AAC a 128 kbps. ¿Cuántos MB pesa el archivo? ¿Qué porcentaje de un paquete de datos de 1 GB gasta descargarlo? ¿Cuántas veces completas se puede descargar con ese paquete?",
  campos: [
    { etiqueta: "Peso del archivo", objetivo: 76.92, tolerancia: 0.01, unidad: "MB" },
    { etiqueta: "Porcentaje del paquete de 1 GB", objetivo: 7.692, tolerancia: 0.01, unidad: "%" },
    { etiqueta: "Descargas completas con el paquete", objetivo: 13, tolerancia: 0, unidad: "veces" },
  ],
  pasosGuia: [
    "Tasa total: 5 000 000 + 128 000 = 5 128 000 bit/s.",
    "Duración: 2 min = 120 s → 5 128 000 × 120 = 615 360 000 bits.",
    "Bytes: 615 360 000 ÷ 8 = 76 920 000 B = 76.92 MB.",
    "Porcentaje: 76.92 ÷ 1000 × 100 = 7.692 %.",
    "Descargas: 1000 ÷ 76.92 = 13.0 → 13 veces completas.",
  ],
  respuestaFinal: "76.92 MB, 7.692 % del paquete y 13 descargas completas.",
};
