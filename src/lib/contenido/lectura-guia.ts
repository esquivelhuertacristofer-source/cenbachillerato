/**
 * LECTURA GUIADA — el andamio visual que se monta ENCIMA de una lectura.
 *
 * El texto de la lectura (`contenido.texto` en BD) es contenido oficial y no se
 * toca: se parte en párrafos con la misma regla de siempre (línea en blanco) y
 * la guía solo dice cómo agruparlos, qué título y qué idea clave lleva cada
 * grupo, qué esquema lo acompaña y qué pregunta rápida lo cierra.
 *
 * Las guías viven como JSON estáticos en `public/lecturas-guia/<codigo>.json`
 * y se piden desde el navegador: así no pesan en el Worker (límite 3 MiB). Una
 * lectura sin guía se ve como antes.
 */

export interface ConceptoClave {
  termino: string;
  /** Una línea: qué es, en palabras del alumno. */
  idea: string;
}

export type VisualGuia =
  | { tipo: "formulas"; items: { nombre: string; expr: string; leyenda?: string }[] }
  | { tipo: "comparar"; columnas: { titulo: string; puntos: string[] }[] }
  | { tipo: "datos"; items: { valor: string; etiqueta: string; barra?: number }[]; fuente?: string }
  | { tipo: "pasos"; items: { titulo: string; texto: string }[] }
  | { tipo: "ejemplo"; titulo: string; lineas: string[]; resultado: string };

export interface ComprobacionGuia {
  pregunta: string;
  opciones: string[];
  /** Índice de la opción correcta. */
  correcta: number;
  /** Por qué es esa: se muestra al responder, acierte o no. */
  porque: string;
}

export interface ParteGuia {
  /** Índices de los párrafos de `contenido.texto` que forman esta parte. */
  parrafos: number[];
  titulo: string;
  idea: string;
  visual?: VisualGuia;
  comprueba?: ComprobacionGuia;
}

export interface LecturaGuia {
  codigo: string;
  conceptos: ConceptoClave[];
  partes: ParteGuia[];
}

/** La misma regla de párrafos que usa el render de siempre (markdown). */
export function parrafosDe(texto: string): string[] {
  return String(texto ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Una guía solo vale si cubre TODOS los párrafos, cada uno una vez y en orden.
 * Si el texto en BD cambió (o la guía está mal), se cae a la lectura de siempre
 * en vez de esconder o repetir texto oficial.
 */
export function guiaValida(guia: LecturaGuia | null | undefined, texto: string): guia is LecturaGuia {
  if (!guia || !Array.isArray(guia.partes) || guia.partes.length === 0) return false;
  const n = parrafosDe(texto).length;
  const usados = guia.partes.flatMap((p) => p.parrafos ?? []);
  if (usados.length !== n) return false;
  return usados.every((idx, i) => idx === i);
}
