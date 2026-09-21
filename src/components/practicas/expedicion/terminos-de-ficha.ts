import type { FichaTeoricaData } from "../labs/_ficha";

/**
 * LOS TÉRMINOS DE LA EXPEDICIÓN, VENGAN DE DONDE VENGAN.
 *
 * La ficha guarda sus términos en dos listas de la MISMA forma: `conceptos`
 * (los centrales) y `glosario` (el vocabulario). Cuál llenó cada laboratorio
 * depende de quién lo escribió, no de lo que el alumno necesita: 36 tienen
 * sólo glosario y 6 sólo conceptos. Colgar los capítulos de un campo fijo
 * dejaba a esos 42 laboratorios con dos capítulos en vez de tres —sin el de
 * descubrir, o sin el de comprobar— por un detalle de dónde quedó el texto.
 *
 * Cada capítulo toma su lista preferida y, si viene vacía, la otra. No se
 * inventa contenido: si no hay términos en ninguna, el capítulo se omite.
 */
export function fichaDeExpedicion(ficha: FichaTeoricaData): FichaTeoricaData {
  return {
    ...ficha,
    conceptos: ficha.conceptos.length > 0 ? ficha.conceptos : ficha.glosario,
    glosario: ficha.glosario.length >= 3 ? ficha.glosario : ficha.conceptos,
  };
}

/** Cuántos capítulos arma la expedición con esta ficha (el laboratorio siempre cuenta). */
export function capitulosDeFicha(ficha: FichaTeoricaData | null): number {
  if (!ficha) return 1;
  const f = fichaDeExpedicion(ficha);
  return 1 + (f.conceptos.length > 0 ? 1 : 0) + (f.glosario.length >= 3 ? 1 : 0);
}
