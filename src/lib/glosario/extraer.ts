/**
 * SOLO-SERVIDOR. Extrae el subconjunto de términos del glosario de una UAC que
 * aparecen en un texto de lectura. Importa el diccionario consolidado (~208 KB),
 * por lo que NUNCA debe importarse desde un componente cliente: vive únicamente
 * en el render del page.tsx de la actividad y sólo el pequeño subconjunto
 * resultante {t,d}[] viaja como prop al cliente.
 *
 * Regla anti-fake: el diccionario es verbatim de la BD. Aquí sólo FILTRAMOS
 * (no reescribimos), con una compuerta conservadora que prefiere omitir un
 * término ambiguo antes que resaltar uno equivocado.
 */

import { GLOSARIO_POR_UAC } from "./glosario-consolidado";
import { foldear, prepararTerminos, terminosPresentes, type TermDef } from "./matcher";

/**
 * Palabras de uso cotidiano que colisionan con su sentido técnico y que NO
 * deben resaltarse aunque pasaran la compuerta por longitud. El sentido
 * cotidiano ("peso" = dinero, "calor" = clima, "ser" = existir, "foco" = bombilla)
 * haría que el tooltip se sintiera intrusivo o incorrecto en contexto.
 */
const STOPLIST = new Set(
  [
    // Español cotidiano ambiguo
    "dato", "cuerpo", "fisica", "masa", "peso", "calor", "aire", "clima",
    "oxido", "estado", "razon", "verdad", "etica", "moral", "ser", "genero",
    "tema", "trama", "pausa", "ritmo", "mito", "guion", "grado", "foco",
    "moda", "praxis", "fluido", "conclusion", "drama", "terror", "cuento",
    "ensayo", "foro", "novela", "ironia", "poesia",
    // Polisémicas genéricas: el sentido cotidiano suele ser la PRIMERA aparición
    // (mostraría una definición de sentido equivocado). Verificado sobre prosa real.
    "lectura", "desarrollo", "solucion",
    // Conectores / vocabulario funcional en inglés (lecturas de Inglés)
    "than", "where", "behind", "because", "anyway", "rarely", "board",
    "desk", "did", "whose", "while", "when", "hobby", "skill", "career",
  ].map(foldear),
);

/**
 * Términos técnicos cortos (≤6 letras) seguros: sin sentido cotidiano que
 * confunda en su materia. Recuperan valor que la compuerta "denegar por
 * defecto" descartaría. Si alguno no existe en ninguna UAC, simplemente nunca
 * coincide (inofensivo).
 */
const ALLOWLIST_CORTOS = new Set(
  [
    "celula", "alcano", "lipido", "gameto", "cateto", "elipse", "bioma",
    "ion", "ph", "genoma", "atomo", "enzima", "alelo", "mol", "vector",
    "cigoto", "nucleo", "soluto",
  ].map(foldear),
);

/**
 * ¿El término califica para resaltarse? Compuerta conservadora:
 *  - STOPLIST ⇒ nunca.
 *  - Multipalabra (frase) ⇒ siempre (sin ambigüedad cotidiana).
 *  - Token único: sólo si es acrónimo/símbolo, o está en ALLOWLIST_CORTOS,
 *    o su forma plegada alfanumérica tiene ≥7 letras. El resto se omite.
 */
function calificaTermino(termino: string): boolean {
  const original = termino.trim();
  if (!original) return false;
  const f = foldear(original);
  if (STOPLIST.has(f)) return false;

  const esMultipalabra = /\s/.test(original);
  if (esMultipalabra) return true;

  if (ALLOWLIST_CORTOS.has(f)) return true;

  // Acrónimo (≥2 mayúsculas, p.ej. ADN, ANP, CONANP) o símbolo con dígito/
  // sub/superíndice (p.ej. N₂, H⁺, pH se cubre por allowlist).
  const esAcronimo = /\p{Lu}.*\p{Lu}/u.test(original);
  const tieneDigitoOSimbolo = /[0-9₀-₉⁰-ⁿ]/u.test(original);
  if (esAcronimo || tieneDigitoOSimbolo) return true;

  const letras = f.replace(/[^a-z0-9]/g, "");
  return letras.length >= 7;
}

/**
 * Subconjunto verbatim {t,d}[] de términos del glosario de `uacCodigo` que
 * aparecen en `texto`, ya filtrado por la compuerta. Vacío si la UAC no tiene
 * glosario o el texto no contiene términos calificados.
 */
export function extraerGlosarioPresente(uacCodigo: string, texto: string): TermDef[] {
  if (!uacCodigo || !texto) return [];
  const dict = GLOSARIO_POR_UAC[uacCodigo];
  if (!dict || dict.length === 0) return [];

  const calificados = dict
    .filter((x) => calificaTermino(x.t))
    .map((x) => ({ t: x.t, d: x.d }));
  if (calificados.length === 0) return [];

  const prepared = prepararTerminos(calificados);
  return terminosPresentes(texto, prepared);
}
