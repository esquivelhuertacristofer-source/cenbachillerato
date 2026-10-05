/**
 * Lógica pura del «Transformador de géneros» (Géneros literarios, LC-III·P03).
 *
 * Una misma semilla de historia FICTICIA (escrita para este laboratorio, sin
 * citas de autores reales) se vuelve texto lírico, narrativo o dramático según
 * tres decisiones: la VOZ, la FORMA y los RASGOS que se le añaden. El texto de
 * la vista previa cambia de verdad (párrafos, versos o escena con acotaciones)
 * y un medidor enciende los rasgos de cada género. Las contradicciones se
 * explican en lugar de solo marcarse como error.
 *
 * Sin React: lo prueban y lo usan los componentes.
 */

export type GeneroSim = "narrativo" | "lirico" | "dramatico" | "ensayistico";
export type Voz = "narrador" | "yo" | "personajes";
export type Forma = "prosa" | "verso" | "escena";
export type Rasgo = "trama" | "imagenes" | "dialogo" | "acotaciones" | "argumento";

export interface EleccionGenero {
  voz: Voz;
  forma: Forma;
  rasgos: Rasgo[];
}

export const ELECCION_INICIAL: EleccionGenero = { voz: "narrador", forma: "prosa", rasgos: [] };

export const SEMILLA =
  "Marisol vende flores en una plaza. Una tarde empieza a llover y, entre las macetas, encuentra una carta sin firma.";

export const VOCES: { id: Voz; titulo: string; ayuda: string; icono: string }[] = [
  { id: "narrador", titulo: "Un narrador", ayuda: "Alguien cuenta lo que pasa", icono: "fa-user-tie" },
  { id: "yo", titulo: "Un «yo» que siente", ayuda: "Habla de lo que le pasa por dentro", icono: "fa-heart" },
  { id: "personajes", titulo: "Los personajes", ayuda: "Hablan entre ellos", icono: "fa-comments" },
];

export const FORMAS: { id: Forma; titulo: string; ayuda: string; icono: string; foto: string }[] = [
  { id: "prosa", titulo: "Párrafos", ayuda: "Texto corrido", icono: "fa-align-left", foto: "forma-libro" },
  { id: "verso", titulo: "Versos", ayuda: "Líneas cortas con ritmo", icono: "fa-feather-pointed", foto: "forma-ventana" },
  { id: "escena", titulo: "Escena", ayuda: "Actos y escenas", icono: "fa-masks-theater", foto: "forma-escenario" },
];

export const RASGOS: { id: Rasgo; titulo: string; icono: string }[] = [
  { id: "trama", titulo: "Hechos en secuencia", icono: "fa-list-ol" },
  { id: "imagenes", titulo: "Figuras y ritmo", icono: "fa-wand-magic-sparkles" },
  { id: "dialogo", titulo: "Diálogo", icono: "fa-comment-dots" },
  { id: "acotaciones", titulo: "Acotaciones", icono: "fa-clapperboard" },
  { id: "argumento", titulo: "Opinión argumentada", icono: "fa-scale-balanced" },
];

const GENERO_DE_VOZ: Record<Voz, GeneroSim> = { narrador: "narrativo", yo: "lirico", personajes: "dramatico" };
const GENERO_DE_FORMA: Record<Forma, GeneroSim> = { prosa: "narrativo", verso: "lirico", escena: "dramatico" };
const GENERO_DE_RASGO: Record<Rasgo, GeneroSim> = {
  trama: "narrativo",
  imagenes: "lirico",
  dialogo: "dramatico",
  acotaciones: "dramatico",
  argumento: "ensayistico",
};

export const NOMBRE_GENERO: Record<GeneroSim, string> = {
  narrativo: "Narrativo",
  lirico: "Lírico",
  dramatico: "Dramático",
  ensayistico: "Ensayístico",
};

/* ── La vista previa: el texto se reformatea de verdad ──────────────── */

export type TipoLinea = "titulo" | "parrafo" | "verso" | "dialogo" | "acotacion" | "ensayo";
export interface Linea {
  tipo: TipoLinea;
  texto: string;
}

const BASE: Record<Voz, Record<Forma, Linea[]>> = {
  narrador: {
    prosa: [
      { tipo: "parrafo", texto: "Marisol acomodaba sus rosas cuando la lluvia cayó sobre la plaza. Entre las macetas halló una carta sin firma y, tras dudar, la abrió." },
    ],
    verso: [
      { tipo: "verso", texto: "Marisol acomoda rosas" },
      { tipo: "verso", texto: "y la lluvia cae en la plaza;" },
      { tipo: "verso", texto: "entre las macetas, una carta" },
      { tipo: "verso", texto: "sin firma la espera." },
    ],
    escena: [
      { tipo: "titulo", texto: "ACTO I · ESCENA 1" },
      { tipo: "parrafo", texto: "El narrador explica: «Marisol acomoda sus rosas. Llueve. Marisol encuentra una carta».", },
    ],
  },
  yo: {
    prosa: [
      { tipo: "parrafo", texto: "Yo acomodaba mis rosas cuando la lluvia cayó sobre la plaza. Entre las macetas hallé una carta sin firma y, tras dudar, la abrí." },
    ],
    verso: [
      { tipo: "verso", texto: "Acomodo mis rosas" },
      { tipo: "verso", texto: "mientras la lluvia" },
      { tipo: "verso", texto: "golpea la plaza como un pulso;" },
      { tipo: "verso", texto: "una carta sin firma" },
      { tipo: "verso", texto: "me abre el pecho." },
    ],
    escena: [
      { tipo: "titulo", texto: "ACTO I · ESCENA 1" },
      { tipo: "dialogo", texto: "MARISOL (sola): Acomodo mis rosas. Llueve. Hallo una carta." },
    ],
  },
  personajes: {
    prosa: [
      { tipo: "parrafo", texto: "—¿De quién es esta carta? —preguntó Marisol. —Nadie la firmó —contestó don Teo." },
    ],
    verso: [
      { tipo: "verso", texto: "—¿De quién es esta carta?" },
      { tipo: "verso", texto: "—Nadie la firmó." },
    ],
    escena: [
      { tipo: "titulo", texto: "ACTO I · ESCENA 1" },
      { tipo: "dialogo", texto: "MARISOL: ¿De quién es esta carta?" },
      { tipo: "dialogo", texto: "DON TEO: Nadie la firmó." },
    ],
  },
};

const EXTRA: Record<Rasgo, Record<Forma, Linea[]>> = {
  trama: {
    prosa: [{ tipo: "parrafo", texto: "Luego siguió la pista hasta el puesto de pan y, al final, reconoció la letra." }],
    verso: [{ tipo: "verso", texto: "luego, la pista; al final, la letra conocida." }],
    escena: [{ tipo: "acotacion", texto: "ESCENA 2 · Más tarde, Marisol llega al puesto de pan y reconoce la letra." }],
  },
  imagenes: {
    prosa: [{ tipo: "parrafo", texto: "La lluvia era un tambor de cobre sobre la plaza." }],
    verso: [{ tipo: "verso", texto: "la lluvia, tambor de cobre," }, { tipo: "verso", texto: "late en mi ventana de pétalos." }],
    escena: [{ tipo: "dialogo", texto: "MARISOL: La lluvia es un tambor de cobre." }],
  },
  dialogo: {
    prosa: [{ tipo: "parrafo", texto: "—¿Y si la leo? —murmuró Marisol." }],
    verso: [{ tipo: "verso", texto: "—¿Y si la leo?" }],
    escena: [{ tipo: "dialogo", texto: "DON TEO: ¿Y si la lees?" }],
  },
  acotaciones: {
    prosa: [{ tipo: "acotacion", texto: "(Se oye un trueno.)" }],
    verso: [{ tipo: "acotacion", texto: "(Se oye un trueno.)" }],
    escena: [{ tipo: "acotacion", texto: "(Entra DON TEO con un paraguas. Se oye un trueno.)" }],
  },
  argumento: {
    prosa: [{ tipo: "ensayo", texto: "Creo que una carta anónima dice más de quien la lee que de quien la escribe." }],
    verso: [{ tipo: "ensayo", texto: "Creo que una carta anónima dice más de quien la lee que de quien la escribe." }],
    escena: [{ tipo: "ensayo", texto: "Creo que una carta anónima dice más de quien la lee que de quien la escribe." }],
  },
};

const ORDEN_RASGOS: Rasgo[] = ["imagenes", "trama", "dialogo", "acotaciones", "argumento"];

export function componer(e: EleccionGenero): Linea[] {
  const lineas = [...BASE[e.voz][e.forma]];
  for (const r of ORDEN_RASGOS) if (e.rasgos.includes(r)) lineas.push(...EXTRA[r][e.forma]);
  return lineas;
}

/* ── El medidor y el diagnóstico ────────────────────────────────────── */

export interface Medidor {
  genero: GeneroSim;
  puntos: number;
  maximo: number;
}

export function medir(e: EleccionGenero): Medidor[] {
  const pts: Record<GeneroSim, number> = { narrativo: 0, lirico: 0, dramatico: 0, ensayistico: 0 };
  pts[GENERO_DE_VOZ[e.voz]] += 2;
  pts[GENERO_DE_FORMA[e.forma]] += 2;
  for (const r of e.rasgos) pts[GENERO_DE_RASGO[r]] += 1;
  const maximo: Record<GeneroSim, number> = { narrativo: 5, lirico: 5, dramatico: 6, ensayistico: 1 };
  return (Object.keys(pts) as GeneroSim[]).map((g) => ({ genero: g, puntos: pts[g], maximo: maximo[g] }));
}

export interface Diagnostico {
  /** Género al que se inclina el texto (el de mayor puntaje). */
  genero: GeneroSim;
  /** Voz, forma y rasgos apuntan al mismo género y hay al menos un rasgo propio. */
  coherente: boolean;
  /** Por qué: contradicciones o lo que le falta, en español. */
  mensajes: string[];
}

export function diagnosticar(e: EleccionGenero): Diagnostico {
  const mensajes: string[] = [];
  const gv = GENERO_DE_VOZ[e.voz];
  const gf = GENERO_DE_FORMA[e.forma];

  if (e.voz === "personajes" && e.forma !== "escena")
    mensajes.push("Los personajes hablan, pero sin actos ni escenas el diálogo no está pensado para representarse: se queda como un fragmento de cuento.");
  if (e.forma === "escena" && e.voz === "narrador")
    mensajes.push("En el drama el diálogo lleva la acción; un narrador que lo explica todo le quita la palabra a los personajes.");
  if (e.forma === "escena" && e.voz === "yo")
    mensajes.push("Un «yo» que habla solo en escena es un monólogo: sirve en el teatro, pero la acción necesita a otros personajes.");
  if (e.forma === "verso" && e.voz === "narrador")
    mensajes.push("Un narrador en versos cuenta hechos con ritmo, pero la lírica expresa un estado interior: busca una voz que sienta.");
  if (e.forma === "verso" && e.voz === "personajes")
    mensajes.push("Diálogo cortado en líneas no es poesía: el verso se justifica por el ritmo y la imagen, no por quién habla.");
  if (e.forma === "prosa" && e.voz === "yo")
    mensajes.push("Un «yo» en párrafos puede ser narrativo (narrador protagonista) o ensayo; para que sea lírico le falta el verso y el ritmo.");
  if (e.rasgos.includes("acotaciones") && e.forma !== "escena")
    mensajes.push("Las acotaciones son indicaciones para la puesta en escena; fuera de una obra para representarse nadie las ejecuta.");
  if (e.rasgos.includes("trama") && e.forma === "verso")
    mensajes.push("Encadenar hechos uno tras otro es propio de narrar; la lírica no cuenta una secuencia, expresa lo que se siente.");
  if (e.rasgos.includes("argumento"))
    mensajes.push("Una opinión argumentada empuja el texto hacia el ensayo, que es no ficción: la semilla es una historia inventada.");
  if (e.rasgos.includes("dialogo") && e.voz === "narrador" && e.forma === "prosa")
    mensajes.push("Un narrador que cede la palabra con guiones es normal en el cuento: el diálogo no basta para volverlo dramático.");

  const medidor = medir(e);
  const mayor = medidor.reduce((a, b) => (b.puntos > a.puntos ? b : a));
  const propios = e.rasgos.filter((r) => GENERO_DE_RASGO[r] === gv);
  const cruzados = e.rasgos.filter(
    (r) => GENERO_DE_RASGO[r] !== gv && !((r === "dialogo" || r === "imagenes") && gv === "narrativo"),
  );
  const alineado = gv === gf;
  const hayContradiccion = e.rasgos.includes("argumento") || (e.rasgos.includes("acotaciones") && e.forma !== "escena") ||
    (e.rasgos.includes("trama") && e.forma === "verso");
  const coherente = alineado && propios.length > 0 && cruzados.length === 0 && !hayContradiccion;

  if (alineado && propios.length === 0)
    mensajes.push(`Voz y forma ya apuntan a lo ${NOMBRE_GENERO[gv].toLowerCase()}; añade un rasgo propio para reforzarlo.`);
  if (alineado && cruzados.length > 0 && mensajes.length === 0)
    mensajes.push("Hay rasgos que pertenecen a otro género (por ejemplo, diálogo o acotaciones en un poema): el texto se mezcla.");
  if (!alineado && mensajes.length === 0)
    mensajes.push(`Tu voz es de lo ${NOMBRE_GENERO[gv].toLowerCase()} pero la forma es de lo ${NOMBRE_GENERO[gf].toLowerCase()}: el texto queda mezclado.`);
  if (coherente) mensajes.unshift(`Texto ${NOMBRE_GENERO[gv].toLowerCase()} coherente: voz, forma y rasgos cuentan la misma historia.`);

  return { genero: coherente ? gv : mayor.genero, coherente, mensajes };
}

/** Géneros logrados de forma coherente (sirve para las misiones). */
export function generoLogrado(e: EleccionGenero): GeneroSim | null {
  const d = diagnosticar(e);
  return d.coherente ? d.genero : null;
}

export function alternarRasgo(e: EleccionGenero, r: Rasgo): EleccionGenero {
  return { ...e, rasgos: e.rasgos.includes(r) ? e.rasgos.filter((x) => x !== r) : [...e.rasgos, r] };
}
