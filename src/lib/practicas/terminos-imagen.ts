/**
 * Viñetas de los términos de cada laboratorio.
 *
 * Cada concepto y cada palabra del glosario tiene su propia ilustración de
 * plastilina (la misma serie que las carátulas), generada con
 * `scripts/generar-imagenes-terminos.ts` y guardada en
 * `public/media/labs-terminos/<slug>/<clave>.webp`.
 *
 * El índice de las que EXISTEN lo escribe `scripts/indexar-imagenes-terminos.ts`
 * en `terminos-imagen.generated.ts`: sin él, la app pediría imágenes que aún no
 * se han generado y el alumno vería recuadros rotos. Mientras un laboratorio no
 * tenga viñetas, su expedición se dibuja con iconos, sin huecos.
 */

import { TERMINOS_CON_IMAGEN } from "./terminos-imagen.generated";

/**
 * Nombre de archivo de un término. Quita acentos y todo lo que no sea letra o
 * número, así que «Densidad (ρ)» y «densidad» apuntan a la misma viñeta.
 * Debe coincidir con `claveDeTermino` de `scripts/mapa-fichas-labs.ts`.
 */
export function claveDeTermino(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Ruta pública de la viñeta de un término, o null si todavía no existe. */
export function imagenDeTermino(slug: string, termino: string): string | null {
  const clave = claveDeTermino(termino);
  return TERMINOS_CON_IMAGEN[slug]?.includes(clave) ? `/media/labs-terminos/${slug}/${clave}.webp` : null;
}

/** true si el laboratorio tiene al menos una viñeta (para decidir el diseño). */
export function tieneViñetas(slug: string): boolean {
  return (TERMINOS_CON_IMAGEN[slug]?.length ?? 0) > 0;
}
