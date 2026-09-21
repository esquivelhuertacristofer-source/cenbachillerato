/**
 * LA CLAVE DE UN CLIP DE VOZ DE LABORATORIO. Un contrato entre tres piezas.
 *
 * Lo escriben y lo leen:
 *   · `scripts/extraer-voz-labs.ts`   — mide las frases en el navegador.
 *   · `scripts/narrar-labs.py`        — graba el MP3 con ese nombre.
 *   · `lab-voz.ts`                    — lo pide en tiempo de ejecución.
 *
 * Si los tres no arman EXACTAMENTE la misma clave, el reproductor pide un
 * archivo que no existe y el alumno se queda con la voz del sistema. Por eso la
 * regla vive en un solo archivo, sin dependencias, y sirve igual en Node y en
 * el navegador.
 *
 * LA CLAVE ES EL HASH DEL TEXTO, NO EL NOMBRE DEL LABORATORIO. «Good morning»
 * se dice en cinco labs de inglés: se graba una vez y los cinco lo comparten.
 * De paso, cambiar una frase en el código cambia su hash y el clip viejo
 * simplemente deja de pedirse.
 *
 * POR QUÉ NO SHA-1. En el navegador `crypto.subtle.digest` es asíncrono, y el
 * botón «Escuchar» tiene que decidir en el mismo tic si hay clip o si cae a la
 * síntesis del sistema. cyrb53 es síncrono, idéntico en Node y en el navegador,
 * y con ~2 000 frases la probabilidad de choque es despreciable; el largo del
 * texto va pegado al hash como segunda firma.
 */

/**
 * Normaliza lo que se va a decir. Se aplica ANTES de hashear, en los tres
 * lados. Los laboratorios arman sus frases con plantillas: un espacio doble o
 * un salto de línea de más no puede costar una grabación aparte.
 */
export function normalizarTextoVoz(texto: string): string {
  return texto
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** cyrb53. 53 bits, síncrono y sin dependencias. */
function cyrb53(texto: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < texto.length; i += 1) {
    const ch = texto.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/** Los dos idiomas que se graban: inglés (17 labs) y español (`lectura-en-voz-alta`). */
export type IdiomaVozLab = "en" | "es";

/**
 * `en/1a2b3c4d-27`. La carpeta es el idioma porque son dos locutoras distintas
 * y el mismo texto en dos idiomas no es el mismo clip.
 */
export function claveDeVozLab(texto: string, idioma: string): string {
  const t = normalizarTextoVoz(texto);
  const lang: IdiomaVozLab = idioma.toLowerCase().startsWith("es") ? "es" : "en";
  return `${lang}/${cyrb53(t)}-${t.length}`;
}
