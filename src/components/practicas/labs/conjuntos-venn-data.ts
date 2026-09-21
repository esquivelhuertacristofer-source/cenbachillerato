/**
 * Datos del laboratorio "Conjuntos y diagramas de Venn" (PM-VI-P10,
 * progresión 3 de Pensamiento Matemático VI).
 *
 * OJO con la numeración: en PM-VI el sufijo del código NO coincide con el
 * número de progresión. La progresión 3 ("Comprende los conceptos básicos de
 * la teoría de conjuntos…") es la que lleva los códigos PM-VI-P10-*.
 *
 * El laboratorio se ancla al ejercicio A2 «Encuesta con diagrama de Venn:
 * deportes en un grupo», que viaja verbatim como reto evaluable; el marco
 * teórico es la lectura A1 y el glosario es el A5.
 *
 * Toda la lógica de zonas sale de evaluar una expresión booleana sobre las
 * cuatro zonas de un Venn de dos conjuntos. Así, que una ley de De Morgan "se
 * cumpla" en pantalla no es algo que el laboratorio afirma: es que los dos
 * lados, calculados por separado, marcan las mismas zonas.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

/* ── Modos ────────────────────────────────────────────────────────────── */
export type Modo = "operaciones" | "demorgan" | "encuesta";

export const MODOS: Modo[] = ["operaciones", "demorgan", "encuesta"];

export interface ModoDef {
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
  fuente: "A1" | "A2" | "A5";
}

export const MODOS_DEF: Record<Modo, ModoDef> = {
  operaciones: {
    etq: "Operaciones",
    subtitulo: "Unión, intersección, complemento y diferencia",
    icono: "fa-circle-nodes",
    color: "#7dd3fc",
    fuente: "A1",
  },
  demorgan: {
    etq: "Leyes de De Morgan",
    subtitulo: "Dos caminos que llegan a la misma zona",
    icono: "fa-code-compare",
    color: "#c084fc",
    fuente: "A1",
  },
  encuesta: {
    etq: "Encuesta con Venn",
    subtitulo: "Se llena empezando por la intersección",
    icono: "fa-people-group",
    color: "#34d399",
    fuente: "A2",
  },
};

/* ══════════════════════════════════════════════════════════════════════
 * Zonas de un diagrama de Venn de dos conjuntos
 * ══════════════════════════════════════════════════════════════════════ */

/** Las cuatro zonas: fuera de ambos, solo A, solo B, en los dos. */
export type Zona = "ninguno" | "soloA" | "soloB" | "ambos";

export const ZONAS: Zona[] = ["soloA", "ambos", "soloB", "ninguno"];

export function zonaDe(enA: boolean, enB: boolean): Zona {
  if (enA && enB) return "ambos";
  if (enA) return "soloA";
  if (enB) return "soloB";
  return "ninguno";
}

export function enAdeZona(z: Zona): boolean {
  return z === "soloA" || z === "ambos";
}
export function enBdeZona(z: Zona): boolean {
  return z === "soloB" || z === "ambos";
}

export const ZONA_ETQ: Record<Zona, string> = {
  soloA: "Solo A",
  soloB: "Solo B",
  ambos: "A y B",
  ninguno: "Fuera de A y de B",
};

/** Una operación: su notación y la condición que cumple un elemento del resultado. */
export interface OperacionDef {
  id: string;
  notacion: string;
  lectura: string;
  f: (enA: boolean, enB: boolean) => boolean;
}

export const OPERACIONES: OperacionDef[] = [
  { id: "union", notacion: "A ∪ B", lectura: "Está en A, en B o en ambos («o»).", f: (a, b) => a || b },
  { id: "interseccion", notacion: "A ∩ B", lectura: "Está en A y en B a la vez («y»).", f: (a, b) => a && b },
  { id: "compA", notacion: "Aᶜ", lectura: "Está en el universal pero NO en A.", f: (a) => !a },
  { id: "compB", notacion: "Bᶜ", lectura: "Está en el universal pero NO en B.", f: (_a, b) => !b },
  { id: "difAB", notacion: "A − B", lectura: "Está en A y no está en B.", f: (a, b) => a && !b },
  { id: "difBA", notacion: "B − A", lectura: "Está en B y no está en A.", f: (a, b) => b && !a },
];

export function operacionPorId(id: string): OperacionDef {
  return OPERACIONES.find((o) => o.id === id) ?? OPERACIONES[0]!;
}

/** Las zonas del diagrama que marca una condición. */
export function zonasDe(f: (enA: boolean, enB: boolean) => boolean): Set<Zona> {
  const out = new Set<Zona>();
  for (const a of [false, true]) for (const b of [false, true]) if (f(a, b)) out.add(zonaDe(a, b));
  return out;
}

export function mismasZonas(x: Set<Zona>, y: Set<Zona>): boolean {
  return x.size === y.size && [...x].every((z) => y.has(z));
}

/* ── Leyes de De Morgan, construidas paso a paso ─────────────────────── */

export interface PasoDeMorgan {
  /** Qué se sombrea en este paso. */
  etq: string;
  f: (enA: boolean, enB: boolean) => boolean;
}

export interface LeyDef {
  id: "ley1" | "ley2";
  enunciado: string;
  enPalabras: string;
  izquierda: { notacion: string; pasos: PasoDeMorgan[] };
  derecha: { notacion: string; pasos: PasoDeMorgan[] };
}

export const LEYES: LeyDef[] = [
  {
    id: "ley1",
    enunciado: "(A ∪ B)ᶜ = Aᶜ ∩ Bᶜ",
    enPalabras: "«no (A o B)» equivale a «no A y no B»",
    izquierda: {
      notacion: "(A ∪ B)ᶜ",
      pasos: [
        { etq: "Primero la unión A ∪ B", f: (a, b) => a || b },
        { etq: "Luego su complemento (A ∪ B)ᶜ", f: (a, b) => !(a || b) },
      ],
    },
    derecha: {
      notacion: "Aᶜ ∩ Bᶜ",
      pasos: [
        { etq: "Primero Aᶜ", f: (a) => !a },
        { etq: "Después Bᶜ", f: (_a, b) => !b },
        { etq: "Donde se traslapan: Aᶜ ∩ Bᶜ", f: (a, b) => !a && !b },
      ],
    },
  },
  {
    id: "ley2",
    enunciado: "(A ∩ B)ᶜ = Aᶜ ∪ Bᶜ",
    enPalabras: "«no (A y B)» equivale a «no A o no B»",
    izquierda: {
      notacion: "(A ∩ B)ᶜ",
      pasos: [
        { etq: "Primero la intersección A ∩ B", f: (a, b) => a && b },
        { etq: "Luego su complemento (A ∩ B)ᶜ", f: (a, b) => !(a && b) },
      ],
    },
    derecha: {
      notacion: "Aᶜ ∪ Bᶜ",
      pasos: [
        { etq: "Primero Aᶜ", f: (a) => !a },
        { etq: "Después Bᶜ", f: (_a, b) => !b },
        { etq: "Todo lo que cae en alguno: Aᶜ ∪ Bᶜ", f: (a, b) => !a || !b },
      ],
    },
  },
];

export function leyPorId(id: string): LeyDef {
  return LEYES.find((l) => l.id === id) ?? LEYES[0]!;
}

/** Cuántos pasos tiene el lado más largo de la ley (los dos avanzan juntos). */
export function pasosTotales(ley: LeyDef): number {
  return Math.max(ley.izquierda.pasos.length, ley.derecha.pasos.length);
}

/* ══════════════════════════════════════════════════════════════════════
 * MODO 1 · Conjuntos con elementos concretos
 * ══════════════════════════════════════════════════════════════════════ */

export interface Elemento {
  etq: string;
  zona: Zona;
}

export interface PresetConjuntos {
  id: string;
  etq: string;
  nota: string;
  elementos: Elemento[];
}

function desde(universal: string[], a: string[], b: string[]): Elemento[] {
  return universal.map((e) => ({ etq: e, zona: zonaDe(a.includes(e), b.includes(e)) }));
}

export const PRESETS: PresetConjuntos[] = [
  {
    id: "glosario",
    etq: "U = {1..6}",
    nota: "La actividad final del glosario A5: U = {1,2,3,4,5,6}, A = {1,2,3}, B = {3,4}.",
    elementos: desde(["1", "2", "3", "4", "5", "6"], ["1", "2", "3"], ["3", "4"]),
  },
  {
    id: "multiplos",
    etq: "Pares y múltiplos de 3",
    nota: "U = {1..10}, A = los pares, B = los múltiplos de 3. Solo el 6 es las dos cosas.",
    elementos: desde(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], ["2", "4", "6", "8", "10"], ["3", "6", "9"]),
  },
  {
    id: "disjuntos",
    etq: "Conjuntos disjuntos",
    nota: "U = {1..8}, A = {1,2,3}, B = {6,7}. No comparten elementos: A ∩ B = ∅.",
    elementos: desde(["1", "2", "3", "4", "5", "6", "7", "8"], ["1", "2", "3"], ["6", "7"]),
  },
];

export function presetPorId(id: string): PresetConjuntos {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0]!;
}

/** Siguiente zona al hacer clic sobre una ficha: A → A y B → B → fuera → A… */
export function siguienteZona(z: Zona): Zona {
  const orden: Zona[] = ["soloA", "ambos", "soloB", "ninguno"];
  return orden[(orden.indexOf(z) + 1) % orden.length]!;
}

/** Escribe un conjunto por extensión: {1, 2, 3} o ∅. */
export function porExtension(etqs: string[]): string {
  if (etqs.length === 0) return "∅";
  return `{${etqs.join(", ")}}`;
}

/* ══════════════════════════════════════════════════════════════════════
 * MODO 3 · Encuesta
 * ══════════════════════════════════════════════════════════════════════ */

export const ENCUESTA_MAX = 40;

export interface Encuesta {
  total: number;
  f: number;
  b: number;
  ambos: number;
}

/** Los datos verbatim del ejercicio A2. */
export const ENCUESTA_A2: Encuesta = { total: 40, f: 22, b: 18, ambos: 10 };

export interface RepartoEncuesta {
  soloF: number;
  soloB: number;
  ambos: number;
  union: number;
  ninguno: number;
}

export function repartir(e: Encuesta): RepartoEncuesta {
  const soloF = e.f - e.ambos;
  const soloB = e.b - e.ambos;
  const union = e.f + e.b - e.ambos;
  return { soloF, soloB, ambos: e.ambos, union, ninguno: e.total - union };
}

/**
 * Una encuesta es posible si nadie queda en negativo: la intersección no puede
 * ser mayor que ninguno de los dos conjuntos, y la unión no puede pasar del
 * total del grupo.
 */
export function encuestaValida(e: Encuesta): string | null {
  if (e.ambos > e.f || e.ambos > e.b) return "La intersección no puede ser mayor que cualquiera de los dos conjuntos.";
  if (e.f + e.b - e.ambos > e.total) return "Con esos datos la unión pasaría del total del grupo: alguien quedaría contado dos veces.";
  return null;
}

/** Las fases del llenado, en el orden que pide la lectura A1. */
export const FASES_ENCUESTA: { etq: string; zona: Zona | null }[] = [
  { etq: "Grupo sin acomodar", zona: null },
  { etq: "1 · La intersección (ambos)", zona: "ambos" },
  { etq: "2 · Solo fútbol", zona: "soloA" },
  { etq: "3 · Solo básquetbol", zona: "soloB" },
  { etq: "4 · Ninguno (el complemento de la unión)", zona: "ninguno" },
];

/**
 * Encuesta aleatoria para el reto de estrellas: se sortea hasta que sea
 * posible y tenga a alguien en cada una de las cuatro zonas.
 */
export function encuestaAleatoria(): Encuesta {
  for (let i = 0; i < 200; i++) {
    const total = 24 + Math.floor(Math.random() * 17); // 24..40
    const ambos = 2 + Math.floor(Math.random() * 8); // 2..9
    const f = ambos + 1 + Math.floor(Math.random() * 14);
    const b = ambos + 1 + Math.floor(Math.random() * 12);
    const e = { total, f, b, ambos };
    if (encuestaValida(e) === null && repartir(e).ninguno >= 1) return e;
  }
  return { total: 36, f: 20, b: 14, ambos: 6 };
}

/* ══════════════════════════════════════════════════════════════════════
 * Textos — VERBATIM de las actividades ancla
 * ══════════════════════════════════════════════════════════════════════ */

export const PROBLEMA =
  "Un CONJUNTO es una colección bien definida de objetos llamados ELEMENTOS. «Bien definida» significa que siempre se puede decir con claridad si algo pertenece o no al conjunto.";

export const DEFINICION =
  "La forma más clara de visualizar conjuntos y operaciones son los DIAGRAMAS DE VENN: un rectángulo representa el universal U y dentro, óvalos representan los conjuntos.";

/** Lectura A1 — los cinco párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "Un CONJUNTO es una colección bien definida de objetos llamados ELEMENTOS. «Bien definida» significa que siempre se puede decir con claridad si algo pertenece o no al conjunto. Los conjuntos se nombran con letras mayúsculas y sus elementos se escriben entre llaves: por ejemplo, A = {1, 2, 3, 4, 5} o V = {a, e, i, o, u}. La pertenencia se escribe con el símbolo ∈: «3 ∈ A» se lee «3 pertenece a A»; y «7 ∉ A», «7 no pertenece a A». Un conjunto puede definirse por EXTENSIÓN (listando sus elementos) o por COMPRENSIÓN (con una propiedad: A = {x | x es un número natural del 1 al 5}).",
  "IGUALDAD Y SUBCONJUNTOS. Dos conjuntos son IGUALES si tienen exactamente los mismos elementos, sin importar el orden ni las repeticiones: {1,2,3} = {3,2,1}. Un conjunto B es SUBCONJUNTO de A (se escribe B ⊆ A) si todos los elementos de B están también en A. Por ejemplo, {1,2} ⊆ {1,2,3,4,5}. El CONJUNTO VACÍO (∅), que no tiene elementos, es subconjunto de cualquier conjunto. El CONJUNTO UNIVERSAL (U) es el conjunto de referencia que contiene a todos los elementos posibles del problema (por ejemplo, todos los estudiantes de un grupo).",
  "LAS OPERACIONES. Con los conjuntos se opera como con números, pero con su propio significado. La UNIÓN (A ∪ B) reúne todos los elementos que están en A, en B o en ambos («o»). La INTERSECCIÓN (A ∩ B) toma solo los elementos que están en A Y en B a la vez («y»); si no comparten elementos, son DISJUNTOS y A ∩ B = ∅. El COMPLEMENTO (Aᶜ o A') son todos los elementos del universal que NO están en A. La DIFERENCIA (A − B) son los elementos de A que no están en B. Estas operaciones permiten combinar y filtrar colecciones.",
  "DIAGRAMAS DE VENN. La forma más clara de visualizar conjuntos y operaciones son los DIAGRAMAS DE VENN: un rectángulo representa el universal U y dentro, óvalos representan los conjuntos. Las zonas donde se traslapan los óvalos son las intersecciones. Estos diagramas son la herramienta clave para resolver problemas de encuestas: por ejemplo, cuántas personas practican fútbol, básquetbol, ambos o ninguno. Se colocan primero los datos de la intersección y luego se completan las demás zonas.",
  "LAS LEYES DE DE MORGAN. Dos identidades muy útiles relacionan complemento, unión e intersección. La primera dice que el complemento de una unión es la intersección de los complementos: (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ. La segunda, que el complemento de una intersección es la unión de los complementos: (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ. En palabras: «no (A o B)» equivale a «no A y no B», y «no (A y B)» equivale a «no A o no B». Estas leyes son fundamentales en lógica, en bases de datos y en probabilidad, y muestran que la teoría de conjuntos es el lenguaje que organiza el razonamiento del semestre antes de entrar al conteo y la probabilidad.",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Qué diferencia hay entre la unión y la intersección de dos conjuntos?",
  "¿Qué es el conjunto universal y para qué sirve en un diagrama de Venn?",
  "Enuncia una de las leyes de De Morgan.",
];

export const INSTRUCCIONES: string[] = [
  "En «Operaciones», elige un juego de conjuntos. Cada ficha numerada es un elemento del universal U, colocada en la zona del diagrama a la que pertenece.",
  "Toca una ficha (en la escena o en el panel) para cambiarla de zona: pasa de «solo A» a «A y B», a «solo B» y a «fuera». Los conjuntos se reescriben solos.",
  "Elige una operación. Se ilumina exactamente la zona del resultado y el conjunto aparece escrito por extensión.",
  "En «Leyes de De Morgan», avanza paso a paso: a la izquierda se construye un lado de la ley y a la derecha el otro. Al final compara las zonas sombreadas.",
  "En «Encuesta con Venn», mueve los datos del grupo o usa los del ejercicio A2, y acomoda a los estudiantes empezando por la intersección, como indica la lectura.",
  "Resuelve la encuesta sorpresa de la tarjeta de estrellas: tres estrellas si aciertas al primer intento.",
  "Cierra con el reto evaluable: el ejercicio A2, con sus cuatro resultados.",
];

export const IDEAS: string[] = [
  "«o» es unión y «y» es intersección. Casi todos los errores con conjuntos son confundir esas dos palabras.",
  "El complemento siempre depende del universal: sin saber qué es U, Aᶜ no está definido.",
  "Si A y B son disjuntos, A ∩ B = ∅ y la unión se cuenta sumando: |A ∪ B| = |A| + |B|.",
  "Si comparten elementos, sumar |A| + |B| cuenta dos veces a los de la intersección. Por eso |A ∪ B| = |A| + |B| − |A ∩ B|.",
  "En una encuesta se llena primero la intersección: es el único dato que no está repetido en otro.",
  "Las leyes de De Morgan dicen que negar un «o» produce un «y», y negar un «y» produce un «o».",
];

/** Hechos del quiz verdadero/falso A4 — verbatim. */
export const HECHOS: string[] = [
  "Los conjuntos {1,2,3} y {3,2,1} son iguales: en un conjunto no importa el orden ni las repeticiones; tienen los mismos elementos.",
  "La intersección (∩) contiene solo los elementos que están en A Y en B a la vez; los que están en al menos uno forman la UNIÓN (∪).",
  "El conjunto vacío no tiene elementos, por lo que es subconjunto de cualquier conjunto.",
  "El conjunto universal es el conjunto de referencia; en un Venn es el rectángulo que rodea los óvalos.",
  "Si dos conjuntos son disjuntos no comparten elementos, así que su intersección es el conjunto VACÍO (∅), no el universal.",
];

export interface DatoClave {
  valor: string;
  texto: string;
  icono: string;
}

export const DATOS: DatoClave[] = [
  { valor: "∅ ⊆ A", texto: "El conjunto vacío es subconjunto de cualquier conjunto.", icono: "fa-circle" },
  { valor: "|A∪B| = |A|+|B|−|A∩B|", texto: "Principio de inclusión-exclusión: la intersección se resta una vez.", icono: "fa-plus-minus" },
  { valor: "(A∪B)ᶜ = Aᶜ∩Bᶜ", texto: "Primera ley de De Morgan: negar un «o» da un «y».", icono: "fa-code-compare" },
  { valor: "{1,2,3} = {3,2,1}", texto: "En un conjunto no importa el orden ni las repeticiones.", icono: "fa-equals" },
];

export const CONTEXTO =
  "Las leyes de De Morgan son fundamentales en lógica, en bases de datos y en probabilidad. Cuando un buscador filtra «ni fútbol ni básquetbol», o una base de datos consulta los registros que no cumplen dos condiciones, está aplicando (F ∪ B)ᶜ = Fᶜ ∩ Bᶜ: excluir la unión es lo mismo que pedir que no esté en ninguno de los dos.";

export const FUENTE =
  "MCCEMS 2025 — Pensamiento Matemático VI «Pensamiento estadístico y probabilístico», contenido formativo: Concepto general de conjunto · Notación e igualdad de conjuntos · Subconjunto, conjunto universal y subconjuntos · Representación de conjuntos con diagramas de Venn · Leyes de Morgan.";

/** Glosario A5 — los 10 términos verbatim. */
export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const GLOSARIO: GlosarioItem[] = [
  { termino: "Conjunto", definicion: "Colección bien definida de objetos llamados elementos.", ejemplo: "A = {1, 2, 3, 4, 5}." },
  { termino: "Elemento / pertenencia (∈)", definicion: "Cada objeto del conjunto; ∈ indica que pertenece, ∉ que no.", ejemplo: "3 ∈ A; 7 ∉ A." },
  { termino: "Subconjunto (⊆)", definicion: "B es subconjunto de A si todos los elementos de B están en A.", ejemplo: "{1,2} ⊆ {1,2,3}." },
  { termino: "Conjunto vacío (∅)", definicion: "Conjunto sin elementos; es subconjunto de todos.", ejemplo: "Los meses con 32 días = ∅." },
  { termino: "Conjunto universal (U)", definicion: "Conjunto de referencia con todos los elementos posibles del problema.", ejemplo: "Todos los estudiantes de un grupo." },
  { termino: "Unión (∪)", definicion: "Elementos que están en A, en B o en ambos («o»).", ejemplo: "{1,2}∪{2,3} = {1,2,3}." },
  { termino: "Intersección (∩)", definicion: "Elementos que están en A y en B a la vez («y»).", ejemplo: "{1,2}∩{2,3} = {2}." },
  { termino: "Complemento (Aᶜ)", definicion: "Elementos del universal que no están en A.", ejemplo: "Si U={1..5} y A={1,2}, Aᶜ={3,4,5}." },
  { termino: "Diagrama de Venn", definicion: "Representación gráfica: rectángulo (U) y óvalos (conjuntos) que se traslapan.", ejemplo: "Sirve para resolver problemas de encuestas." },
  { termino: "Leyes de De Morgan", definicion: "(A∪B)ᶜ=Aᶜ∩Bᶜ y (A∩B)ᶜ=Aᶜ∪Bᶜ.", ejemplo: "«no (A o B)» = «no A y no B»." },
];

/* ── Reto evaluable: el ejercicio A2, verbatim ────────────────────────── */

export const RETO_A2: RetoNumericoData = {
  titulo: "Encuesta con diagrama de Venn: deportes en un grupo",
  contexto:
    "El problema aplica el contenido formativo: conjuntos, subconjuntos, intersección, unión, complemento, diagramas de Venn y las leyes de De Morgan, en un contexto cotidiano de encuesta escolar.",
  problema:
    "En un grupo de 40 estudiantes se preguntó qué deporte practican. 22 practican fútbol (F), 18 practican básquetbol (B) y 10 practican AMBOS.\n\na) ¿Cuántos practican SOLO fútbol y cuántos SOLO básquetbol?\n\nb) ¿Cuántos practican fútbol O básquetbol (la unión F ∪ B)?\n\nc) ¿Cuántos NO practican ninguno de los dos (el complemento de la unión)?\n\nd) Verifica tu resultado del inciso (c) usando la idea de las leyes de De Morgan: «no (F o B)» = «no F y no B».",
  campos: [
    { etiqueta: "a) Solo fútbol", objetivo: 12, tolerancia: 0.01, unidad: "estudiantes" },
    { etiqueta: "a) Solo básquetbol", objetivo: 8, tolerancia: 0.01, unidad: "estudiantes" },
    { etiqueta: "b) Unión F ∪ B", objetivo: 30, tolerancia: 0.01, unidad: "estudiantes" },
    { etiqueta: "c) Ninguno de los dos", objetivo: 10, tolerancia: 0.01, unidad: "estudiantes" },
  ],
  pasosGuia: [
    "a) La intersección F∩B = 10 (ambos). Solo fútbol = 22 − 10 = 12. Solo básquetbol = 18 − 10 = 8.",
    "b) Unión F∪B = solo F + solo B + ambos = 12 + 8 + 10 = 30. (Equivale a 22 + 18 − 10 = 30, por el principio de inclusión-exclusión.)",
    "c) Ninguno = universal − unión = 40 − 30 = 10 estudiantes.",
    "d) «no F y no B» = los que no están ni en F ni en B = los 10 de fuera de ambos óvalos: coincide con el complemento de la unión (F∪B)ᶜ = 10, confirmando la ley de De Morgan.",
  ],
  respuestaFinal: "a) Solo fútbol 12, solo básquetbol 8. b) Unión = 30. c) Ninguno = 10. d) (F∪B)ᶜ = Fᶜ∩Bᶜ = 10 (verifica De Morgan).",
};
