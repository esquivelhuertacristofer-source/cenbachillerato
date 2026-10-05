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

const palabras = (s: unknown) => String(s ?? "").trim().split(/\s+/).filter(Boolean).length;
const texto = (s: unknown) => typeof s === "string" && s.trim().length > 0;

/**
 * Errores de forma de una guía (sin consultar la BD). Lo usan el test que
 * revisa todas las guías publicadas y el validador contra el texto real.
 * `nParrafos`, si se da, exige además cubrir exactamente esos párrafos.
 */
export function erroresGuia(g: LecturaGuia, nParrafos?: number): string[] {
  const e: string[] = [];
  if (!texto(g?.codigo)) e.push("sin codigo");
  const conceptos = Array.isArray(g?.conceptos) ? g.conceptos : [];
  if (conceptos.length < 2 || conceptos.length > 5) e.push(`conceptos: ${conceptos.length} (2–5)`);
  conceptos.forEach((c, i) => {
    if (!texto(c.termino) || palabras(c.termino) > 6) e.push(`concepto ${i}: termino vacío o largo`);
    if (!texto(c.idea) || palabras(c.idea) > 22) e.push(`concepto ${i}: idea vacía o > 22 palabras`);
  });
  const partes = Array.isArray(g?.partes) ? g.partes : [];
  if (partes.length === 0 || partes.length > 6) e.push(`partes: ${partes.length} (1–6)`);
  let esperado = 0;
  partes.forEach((p, i) => {
    const ps = Array.isArray(p.parrafos) ? p.parrafos : [];
    if (ps.length === 0 || ps.length > 8) e.push(`parte ${i}: ${ps.length} párrafos (1–8)`);
    for (const k of ps) {
      if (k !== esperado) e.push(`parte ${i}: párrafo ${k}, se esperaba ${esperado}`);
      esperado = k + 1;
    }
    if (!texto(p.titulo) || palabras(p.titulo) > 8) e.push(`parte ${i}: título vacío o > 8 palabras`);
    if (!texto(p.idea) || palabras(p.idea) > 30) e.push(`parte ${i}: idea vacía o > 30 palabras`);
    const v = p.visual;
    if (v) {
      const lista = (x: unknown, min: number, max: number, nombre: string) => {
        const n = Array.isArray(x) ? x.length : 0;
        if (n < min || n > max) e.push(`parte ${i}: ${nombre} ${n} (${min}–${max})`);
      };
      if (v.tipo === "formulas") { lista(v.items, 1, 4, "fórmulas"); v.items?.forEach((f) => { if (!texto(f.nombre) || !texto(f.expr)) e.push(`parte ${i}: fórmula incompleta`); }); }
      else if (v.tipo === "comparar") { lista(v.columnas, 1, 4, "columnas"); v.columnas?.forEach((c) => { if (!texto(c.titulo)) e.push(`parte ${i}: columna sin título`); lista(c.puntos, 1, 6, "puntos"); }); }
      else if (v.tipo === "datos") { lista(v.items, 1, 6, "datos"); v.items?.forEach((d) => { if (!texto(d.valor) || !texto(d.etiqueta)) e.push(`parte ${i}: dato incompleto`); if (d.barra !== undefined && (typeof d.barra !== "number" || d.barra < 0 || d.barra > 100)) e.push(`parte ${i}: barra fuera de 0–100`); }); }
      else if (v.tipo === "pasos") { lista(v.items, 2, 6, "pasos"); v.items?.forEach((s) => { if (!texto(s.titulo) || !texto(s.texto)) e.push(`parte ${i}: paso incompleto`); }); }
      else if (v.tipo === "ejemplo") { if (!texto(v.titulo) || !texto(v.resultado)) e.push(`parte ${i}: ejemplo incompleto`); lista(v.lineas, 1, 6, "líneas"); }
      else e.push(`parte ${i}: visual desconocido`);
    }
    const c = p.comprueba;
    if (c) {
      const n = Array.isArray(c.opciones) ? c.opciones.length : 0;
      if (!texto(c.pregunta)) e.push(`parte ${i}: pregunta vacía`);
      if (n < 2 || n > 4) e.push(`parte ${i}: ${n} opciones (2–4)`);
      if (!Number.isInteger(c.correcta) || c.correcta < 0 || c.correcta >= n) e.push(`parte ${i}: correcta fuera de rango`);
      if (new Set(c.opciones ?? []).size !== n) e.push(`parte ${i}: opciones repetidas`);
      if (!texto(c.porque)) e.push(`parte ${i}: sin porqué`);
    }
  });
  if (nParrafos !== undefined && esperado !== nParrafos) e.push(`cubre ${esperado} de ${nParrafos} párrafos`);
  return e;
}
