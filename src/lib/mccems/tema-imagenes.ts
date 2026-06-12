/**
 * Imagen temática por propósito formativo — datos puros (UAC → tema → WebP).
 *
 * Reemplaza el ícono genérico de las tarjetas de propósito por una foto con
 * licencia libre relacionada con la materia. Cada área tiene un POOL de imágenes
 * y se elige una por el número de progresión, de modo que una misma UAC no repite
 * la misma foto en todas sus tarjetas (variedad sin salir del tema).
 *
 * - Ciencias y Matemáticas reutilizan las fotos ya optimizadas de `public/labs/`.
 * - Lengua, Inglés, Filosofía, Sociales, Historia y Cultura Digital usan las
 *   nuevas fotos de `public/temas/` (Wikimedia Commons, ~800px WebP, ver CREDITS).
 *
 * Seguro para importar en listados (no arrastra three.js).
 */

/** Pools de rutas públicas (WebP optimizado) por código de UAC. */
const TEMA_POOL: Record<string, string[]> = {
  // ── Ciencias Naturales (reusa /labs) ──
  "CNEYT-I":   ["/labs/materia.webp", "/labs/fluidos.webp", "/labs/molecula.webp"],
  "CNEYT-II":  ["/labs/energia.webp", "/labs/termo.webp", "/labs/electricidad.webp"],
  "CNEYT-III": ["/labs/tierra.webp", "/labs/ecosistema.webp", "/labs/planta.webp"],
  "CNEYT-IV":  ["/labs/reaccion.webp", "/labs/molecula.webp", "/labs/materia.webp"],
  "CNEYT-V":   ["/labs/espacio.webp", "/labs/movimiento.webp", "/labs/ondas.webp", "/labs/optica.webp", "/labs/espectro.webp", "/labs/electricidad.webp"],
  "CNEYT-VI":  ["/labs/celula.webp", "/labs/adn.webp", "/labs/evolucion.webp", "/labs/planta.webp"],

  // ── Pensamiento Matemático (reusa /labs) ──
  "PM-I":   ["/labs/algebra.webp", "/labs/graficas.webp"],
  "PM-II":  ["/labs/algebra.webp", "/labs/graficas.webp"],
  "PM-III": ["/labs/geometria.webp", "/labs/algebra.webp"],
  "PM-IV":  ["/labs/trigonometria.webp", "/labs/geometria.webp", "/labs/graficas.webp"],
  "PM-V":   ["/labs/calculo.webp", "/labs/graficas.webp"],
  "PM-VI":  ["/labs/graficas.webp", "/labs/calculo.webp"],

  // ── Humanidades / Lengua / Digital (nuevas en /temas) ──
  "LC-I":   ["/temas/lengua.webp"],
  "LC-II":  ["/temas/lengua.webp"],
  "LC-III": ["/temas/lengua.webp"],
  "IN-I":   ["/temas/ingles.webp"],
  "IN-II":  ["/temas/ingles.webp"],
  "IN-III": ["/temas/ingles.webp"],
  "IN-IV":  ["/temas/ingles.webp"],
  "IN-V":   ["/temas/ingles.webp"],
  "PFH-I":   ["/temas/filosofia.webp"],
  "PFH-II":  ["/temas/filosofia.webp"],
  "PFH-III": ["/temas/filosofia.webp"],
  "CS-I":   ["/temas/sociales.webp"],
  "CS-II":  ["/temas/sociales.webp"],
  "CS-III": ["/temas/sociales.webp"],
  "CH-I":   ["/temas/historia.webp"],
  "CH-II":  ["/temas/historia.webp"],
  "CH-III": ["/temas/historia.webp"],
  "CD-I":   ["/temas/digital.webp"],
  "CD-II":  ["/temas/digital.webp"],
  "CD-III": ["/temas/digital.webp"],
};

/** Imagen por defecto cuando el código de UAC no está en el mapa. */
const FALLBACK = "/temas/lengua.webp";

/**
 * Ruta de la imagen temática para una tarjeta de propósito formativo.
 * `numero` es la progresión (1-based) y se usa para variar la foto dentro de una
 * misma materia de forma estable (mismo número → misma foto en cada render).
 */
export function imagenDePropositos(codigoUAC: string, numero: number): string {
  const pool = TEMA_POOL[codigoUAC];
  if (!pool || pool.length === 0) return FALLBACK;
  const idx = ((numero - 1) % pool.length + pool.length) % pool.length;
  return pool[idx]!;
}
