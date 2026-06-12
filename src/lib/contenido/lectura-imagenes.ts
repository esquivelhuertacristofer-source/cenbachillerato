/**
 * Imagen destacada temática para lecturas y fichas — datos puros.
 *
 * Cada UAC tiene un "pool" de imágenes con licencia libre (foto real, optimizada
 * a WebP ~800px) que ilustra su materia. Se elige una de forma determinista a
 * partir de un texto semilla (el título de la actividad), de modo que cada
 * lectura recibe una imagen estable y con variedad dentro de la misma materia.
 *
 * Fuentes:
 *  - `/labs/*.webp`     → fotos científicas/matemáticas (Wikimedia, ver labs/CREDITS.json)
 *  - `/lecturas/*.webp` → humanidades/sociales/digital (Wikimedia, ver lecturas/CREDITS.json)
 *
 * Seguro para importar en cualquier parte (datos puros, no arrastra three.js).
 */

const L = (t: string) => `/labs/${t}.webp`;
const C = (t: string) => `/lecturas/${t}.webp`;

/**
 * Pool por UAC. Se afina por semestre en Ciencias y Matemáticas para que la
 * imagen vaya sobre el tema real de ese semestre; humanidades usan su área.
 */
const POOL_POR_UAC: Record<string, string[]> = {
  // ── Ciencias Naturales, Experimentales y Tecnología ──
  "CNEYT-I": [L("materia"), L("molecula"), L("reaccion")],
  "CNEYT-II": [L("energia"), L("electricidad"), L("termo"), L("ondas")],
  "CNEYT-III": [L("tierra"), L("ecosistema"), L("planta")],
  "CNEYT-IV": [L("reaccion"), L("molecula"), L("materia")],
  "CNEYT-V": [L("espacio"), L("ondas"), L("optica"), L("espectro"), L("movimiento")],
  "CNEYT-VI": [L("celula"), L("adn"), L("evolucion"), L("planta")],

  // ── Pensamiento Matemático ──
  "PM-I": [L("algebra"), L("graficas")],
  "PM-II": [L("algebra"), L("graficas")],
  "PM-III": [L("algebra"), L("geometria")],
  "PM-IV": [L("trigonometria"), L("geometria"), L("graficas")],
  "PM-V": [L("calculo"), L("graficas")],
  "PM-VI": [L("graficas"), L("calculo")],
};

/**
 * Pool por área (prefijo de UAC). Fallback cuando no hay override por UAC, y
 * fuente principal de las áreas de humanidades/sociales/digital.
 */
const POOL_POR_AREA: Record<string, string[]> = {
  CNEYT: [L("molecula"), L("celula"), L("energia"), L("tierra")],
  PM: [L("algebra"), L("geometria"), L("graficas"), L("calculo")],
  LC: [C("libros"), C("escritura"), C("narrativa")],
  IN: [C("idiomas"), C("dialogo"), C("libros")],
  PFH: [C("filosofia"), C("pensamiento")],
  CS: [C("sociedad"), C("economia")],
  CH: [C("historia"), C("archivo")],
  CD: [C("tecnologia"), C("redes")],
};

/** Pool por defecto cuando no se reconoce el área (lectura genérica). */
const POOL_FALLBACK = [C("libros"), C("escritura")];

/** Prefijo de área a partir de un código UAC (quita el sufijo de semestre romano). */
function areaDeUAC(uacCodigo: string): string {
  return uacCodigo.replace(/-[IVX]+$/i, "").toUpperCase();
}

/** Hash determinista simple (djb2) → entero no negativo. */
function hash(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 33) ^ seed.charCodeAt(i);
  }
  return h >>> 0;
}

/**
 * Ruta pública de la imagen destacada para una lectura/ficha.
 * @param uacCodigo  código de la UAC (p.ej. "CNEYT-V", "LC-III")
 * @param seed       texto semilla para variar dentro de la materia (título de la actividad)
 */
export function imagenDeLectura(uacCodigo: string | null | undefined, seed = ""): string {
  const codigo = (uacCodigo ?? "").toUpperCase();
  const pool =
    POOL_POR_UAC[codigo] ?? POOL_POR_AREA[areaDeUAC(codigo)] ?? POOL_FALLBACK;
  const idx = pool.length > 0 ? hash(seed || codigo) % pool.length : 0;
  return pool[idx] ?? POOL_FALLBACK[0]!;
}
