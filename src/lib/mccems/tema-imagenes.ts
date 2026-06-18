/**
 * Imagen temática por propósito formativo — datos puros (UAC → tema → WebP).
 *
 * Reemplaza el ícono genérico de las tarjetas de propósito por una foto con
 * licencia libre relacionada con la materia. Cada UAC tiene un POOL ordenado de
 * imágenes y se elige una por el número de propósito (progresión), de modo que
 * una misma materia NO repita la misma foto en todas sus tarjetas: el propósito 1
 * recibe la 1.ª del pool, el 2 la 2.ª, etc. (se cicla solo si hay más propósitos
 * que imágenes on-theme disponibles).
 *
 * Fuentes (todas WebP ~800px, licencia libre, ver CREDITS.json de cada carpeta):
 *  - `/labs/*.webp`     → fotos científicas/matemáticas
 *  - `/temas/*.webp`    → portadas de área (lengua, inglés, filosofía, etc.)
 *  - `/lecturas/*.webp` → humanidades/sociales/digital (variedad por sub-tema)
 *
 * Antes, cada UAC de humanidades tenía UNA sola imagen → todas las tarjetas de
 * propósito salían idénticas. Ahora se combinan `/temas` + `/lecturas` (+ `/labs`
 * en ciencias/matemáticas) para dar varias imágenes distintas y on-theme por
 * materia. Con el lote de fotos sumado, casi todas las UAC tienen tantas o más
 * imágenes que propósitos (1:1 efectivo); solo se cicla si una UAC concreta
 * llegara a tener más propósitos que fotos on-theme disponibles.
 *
 * Seguro para importar en listados (datos puros, no arrastra three.js).
 */

const L = (t: string) => `/labs/${t}.webp`;
const T = (t: string) => `/temas/${t}.webp`;
const C = (t: string) => `/lecturas/${t}.webp`;

/** Pools ordenados de rutas públicas (WebP optimizado) por código de UAC. */
const TEMA_POOL: Record<string, string[]> = {
  // ── Ciencias Naturales (reusa /labs) — 8 propósitos c/u ──
  "CNEYT-I":   [L("materia"), L("molecula"), L("reaccion"), L("laboratorio"), L("fluidos"), L("electricidad"), L("energia"), L("microscopio")],
  "CNEYT-II":  [L("energia"), L("termo"), L("electricidad"), L("movimiento"), L("ondas"), L("fluidos"), L("laboratorio"), L("materia")],
  "CNEYT-III": [L("tierra"), L("ecosistema"), L("planta"), L("fluidos"), L("molecula"), L("reaccion"), L("microscopio"), L("laboratorio")],
  "CNEYT-IV":  [L("reaccion"), L("molecula"), L("materia"), L("laboratorio"), L("energia"), L("termo"), L("electricidad"), L("microscopio")],
  "CNEYT-V":   [L("espacio"), L("movimiento"), L("ondas"), L("optica"), L("espectro"), L("electricidad"), L("fluidos"), L("energia")],
  "CNEYT-VI":  [L("celula"), L("adn"), L("evolucion"), L("microscopio"), L("planta"), L("ecosistema"), L("laboratorio"), L("molecula")],

  // ── Pensamiento Matemático (reusa /labs) ──
  "PM-I":   [L("aritmetica"), L("algebra"), L("graficas"), L("geometria"), L("ecuaciones"), L("estadistica"), L("movimiento")],
  "PM-II":  [L("algebra"), L("ecuaciones"), L("graficas"), L("geometria"), L("aritmetica"), L("movimiento")],
  "PM-III": [L("geometria"), L("algebra"), L("graficas"), L("ecuaciones"), L("trigonometria"), L("espacio")],
  "PM-IV":  [L("trigonometria"), L("geometria"), L("graficas"), L("espacio"), L("ecuaciones"), L("algebra"), L("calculo")],
  "PM-V":   [L("calculo"), L("graficas"), L("movimiento"), L("ecuaciones"), L("algebra"), L("geometria"), L("espacio"), L("trigonometria")],
  "PM-VI":  [L("estadistica"), L("graficas"), C("datos"), L("calculo"), L("algebra"), L("geometria"), L("aritmetica"), L("movimiento")],

  // ── Lengua y Comunicación (combina /temas + /lecturas) ──
  "LC-I":   [T("lengua"), C("libros"), C("escritura"), C("biblioteca"), C("dialogo"), C("narrativa"), C("poesia"), C("oratoria")],
  "LC-II":  [C("narrativa"), C("poesia"), C("escritura"), C("libros"), C("biblioteca"), T("lengua"), C("dialogo"), C("oratoria")],
  "LC-III": [C("libros"), C("narrativa"), C("biblioteca"), T("lengua"), C("escritura"), C("dialogo"), C("oratoria")],

  // ── Inglés (combina /temas + /lecturas) ──
  "IN-I":   [T("ingles"), C("idiomas"), C("salon-clase"), C("dialogo"), C("libros"), C("viaje"), C("globo"), C("escritura")],
  "IN-II":  [C("idiomas"), C("dialogo"), T("ingles"), C("salon-clase"), C("libros"), C("globo"), C("viaje"), C("escritura")],
  "IN-III": [C("dialogo"), T("ingles"), C("idiomas"), C("viaje"), C("escritura"), C("libros"), C("salon-clase"), C("globo")],
  "IN-IV":  [C("idiomas"), C("libros"), C("dialogo"), C("globo"), T("ingles"), C("escritura"), C("salon-clase"), C("viaje")],
  "IN-V":   [T("ingles"), C("escritura"), C("idiomas"), C("oratoria"), C("dialogo"), C("libros"), C("salon-clase"), C("globo")],

  // ── Pensamiento Filosófico y Humanidades (combina /temas + /lecturas) ──
  "PFH-I":   [T("filosofia"), C("pensamiento"), C("filosofia"), C("dialogo"), C("libros")],
  "PFH-II":  [C("filosofia"), C("pensamiento"), T("filosofia"), C("libros"), C("dialogo")],
  "PFH-III": [C("pensamiento"), T("filosofia"), C("dialogo"), C("filosofia")],

  // ── Ciencias Sociales (combina /temas + /lecturas) ──
  "CS-I":   [T("sociales"), C("sociedad"), C("economia"), C("dialogo")],
  "CS-II":  [C("sociedad"), C("economia"), T("sociales"), C("dialogo")],
  "CS-III": [C("economia"), T("sociales"), C("sociedad")],

  // ── Conciencia Histórica (combina /temas + /lecturas) ──
  "CH-I":   [T("historia"), C("historia"), C("archivo"), C("libros")],
  "CH-II":  [C("historia"), C("archivo"), T("historia"), C("libros")],
  "CH-III": [C("archivo"), T("historia"), C("historia"), C("libros")],

  // ── Cultura Digital (combina /temas + /lecturas) ──
  "CD-I":   [T("digital"), C("tecnologia"), C("codigo"), C("redes"), C("hardware"), C("ciberseguridad"), C("datos"), C("colaboracion")],
  "CD-II":  [C("colaboracion"), C("redes"), C("datos"), T("digital"), C("tecnologia")],
  "CD-III": [C("datos"), C("redes"), C("codigo"), T("digital")],
};

/** Imagen por defecto cuando el código de UAC no está en el mapa. */
const FALLBACK = T("lengua");

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
