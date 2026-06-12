/**
 * Matcher de términos de glosario — isomorfo (server + client), sin dependencias.
 *
 * Objetivo: localizar en prosa las apariciones EXACTAS (palabra completa) de un
 * conjunto pequeño de términos, de forma insensible a acentos y mayúsculas, sin
 * inventar coincidencias. Se usa en dos lugares:
 *   - server (extraer.ts): qué términos del glosario de la UAC están presentes.
 *   - client (LecturaActivity): dónde resaltarlos, una sola vez por documento.
 *
 * Diseño clave: el "folding" (minúsculas + sin diacríticos) preserva la longitud
 * carácter a carácter ⇒ los índices del texto plegado coinciden 1:1 con los del
 * texto original ⇒ podemos recortar el original por posición sin remapear.
 */

export interface TermDef {
  t: string;
  d: string;
}

export interface PreparedTerm {
  /** Forma plegada (para comparar). */
  f: string;
  /** Término original (para mostrar la definición correcta). */
  t: string;
  /** Definición. */
  d: string;
}

export interface Match {
  /** Índice inicial en el texto ORIGINAL. */
  start: number;
  /** Índice final (exclusivo) en el texto ORIGINAL. */
  end: number;
  /** Término original del glosario. */
  t: string;
  /** Definición. */
  d: string;
  /** Forma plegada (clave de "ya usado"). */
  f: string;
}

/** Mapa de plegado 1:1 para los acentos del español (preserva longitud). */
const FOLD: Record<string, string> = {
  á: "a", é: "e", í: "i", ó: "o", ú: "u", ü: "u", ñ: "n",
  Á: "a", É: "e", Í: "i", Ó: "o", Ú: "u", Ü: "u", Ñ: "n",
  à: "a", è: "e", ì: "i", ò: "o", ù: "u",
  À: "a", È: "e", Ì: "i", Ò: "o", Ù: "u",
};

/**
 * Pliega una cadena a su forma de comparación SIN cambiar su longitud:
 * cada carácter de entrada produce exactamente un carácter de salida, de modo
 * que las posiciones se mantienen alineadas con el texto original.
 */
export function foldear(s: string): string {
  let out = "";
  for (const ch of s) {
    const mapped = FOLD[ch];
    if (mapped !== undefined) {
      out += mapped;
      continue;
    }
    const low = ch.toLowerCase();
    // Solo aceptamos minúsculas de 1 carácter para no romper la alineación.
    out += low.length === 1 ? low : ch;
  }
  return out;
}

const WORD_CHAR = /[\p{L}\p{N}]/u;

/** ¿El carácter forma parte de una "palabra" (letra o número)? */
function esCaracterPalabra(ch: string | undefined): boolean {
  return ch !== undefined && WORD_CHAR.test(ch);
}

/**
 * Prepara la lista de términos para el escaneo: pliega, descarta vacíos,
 * deduplica por forma plegada y ordena por longitud DESC (match más largo
 * primero, p.ej. "energía cinética" antes que "energía").
 */
export function prepararTerminos(terms: TermDef[]): PreparedTerm[] {
  const porForma = new Map<string, PreparedTerm>();
  for (const { t, d } of terms) {
    const original = (t ?? "").trim();
    if (!original) continue;
    const f = foldear(original);
    if (!f) continue;
    // Primera definición gana en empate de forma (el dict ya viene desambiguado).
    if (!porForma.has(f)) porForma.set(f, { f, t: original, d });
  }
  return [...porForma.values()].sort((a, b) => b.f.length - a.f.length);
}

/**
 * Encuentra coincidencias de palabra completa, sin solapamiento, del conjunto `terms`
 * en `text`. Es longest-match-first y respeta/actualiza `yaUsados` (formas
 * plegadas ya emparejadas) para honrar "una vez por documento".
 *
 * Si se pasa `yaUsados`, las formas que ya estén dentro se omiten y las nuevas
 * se agregan a medida que se emparejan (mutación intencional para coordinar
 * varios párrafos en un mismo render).
 */
export function encontrarMatches(
  text: string,
  terms: PreparedTerm[],
  yaUsados?: Set<string>,
): Match[] {
  if (!text || terms.length === 0) return [];
  const folded = foldear(text); // misma longitud que `text`
  const matches: Match[] = [];
  const n = folded.length;
  let i = 0;

  while (i < n) {
    // Solo intentamos en un límite de palabra inicial.
    const prevNoPalabra = i === 0 || !esCaracterPalabra(text[i - 1]);
    if (prevNoPalabra && esCaracterPalabra(text[i])) {
      let encontrado: Match | null = null;
      for (const p of terms) {
        if (yaUsados?.has(p.f)) continue;
        const end = i + p.f.length;
        if (end > n) continue;
        if (!folded.startsWith(p.f, i)) continue;
        // Límite de palabra final.
        if (esCaracterPalabra(text[end])) continue;
        encontrado = { start: i, end, t: p.t, d: p.d, f: p.f };
        break; // longest-first ⇒ el primero que cierra es el más largo
      }
      if (encontrado) {
        matches.push(encontrado);
        yaUsados?.add(encontrado.f);
        i = encontrado.end;
        continue;
      }
    }
    i++;
  }
  return matches;
}

/**
 * Conjunto de términos presentes en `text` (deduplicado por forma, en orden de
 * aparición). Útil para el lado servidor: sólo necesita saber CUÁLES aparecen.
 */
export function terminosPresentes(text: string, terms: PreparedTerm[]): TermDef[] {
  const usados = new Set<string>();
  const matches = encontrarMatches(text, terms, usados);
  return matches.map((m) => ({ t: m.t, d: m.d }));
}
