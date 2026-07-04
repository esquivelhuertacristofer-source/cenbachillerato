/**
 * Datos del laboratorio "El Estado mexicano" (CS-I-P01-A4).
 *
 * Módulo de datos PURO (sin three, sin React): contenido alineado VERBATIM a la
 * lectura A1 «El Estado: ¿qué es y para qué sirve?» (CS-I·P01), el quiz A4, el
 * V/F A5 y el glosario A6.
 */

/* ── Modo 1 «Arma el Estado» (elementos constitutivos vs. símbolos patrios) ─ */
// Verbatim A1: «el Estado se define por tres elementos: un territorio delimitado,
// una población que lo habita y un gobierno con el monopolio legítimo de la fuerza».
// Distractores tomados del quiz A4 (opción "Bandera, himno y escudo"): son
// símbolos patrios, no elementos constitutivos del Estado.
export interface Elemento {
  id: string;
  nombre: string;
  detalle: string;
  icono: string;
  constitutivo: boolean;
}

export const ELEMENTOS: Elemento[] = [
  { id: "e-territorio", nombre: "Territorio", detalle: "Un territorio delimitado donde se ejerce la autoridad.", icono: "fa-map", constitutivo: true },
  { id: "e-poblacion", nombre: "Población", detalle: "Una población que habita ese territorio.", icono: "fa-people-group", constitutivo: true },
  { id: "e-gobierno", nombre: "Gobierno", detalle: "Un gobierno con el monopolio legítimo de la fuerza.", icono: "fa-landmark", constitutivo: true },
  { id: "e-bandera", nombre: "Bandera", detalle: "Es un símbolo patrio, no un elemento constitutivo del Estado.", icono: "fa-flag", constitutivo: false },
  { id: "e-himno", nombre: "Himno", detalle: "Es un símbolo patrio, no un elemento constitutivo del Estado.", icono: "fa-music", constitutivo: false },
  { id: "e-escudo", nombre: "Escudo", detalle: "Es un símbolo patrio, no un elemento constitutivo del Estado.", icono: "fa-shield-halved", constitutivo: false },
];

/* ── Modo 2 «División de poderes» (clasificar en 3 poderes) ─────────────── */
// Verbatim A1: Ejecutivo (presidente, gobernadores, presidentes municipales);
// Legislativo (Congreso de la Unión: Senado y Cámara de Diputados; congresos
// locales); Judicial (Suprema Corte de Justicia, tribunales). Funciones del A1/A4.
export type Poder = "ejecutivo" | "legislativo" | "judicial";

export const PODER_INFO: Record<Poder, { label: string; descripcion: string; icono: string; color: string }> = {
  ejecutivo: {
    label: "Poder Ejecutivo",
    descripcion: "Aplica las leyes y administra al país.",
    icono: "fa-user-tie",
    color: "#FF8A5B",
  },
  legislativo: {
    label: "Poder Legislativo",
    descripcion: "Hace las leyes.",
    icono: "fa-scroll",
    color: "#5BA8FF",
  },
  judicial: {
    label: "Poder Judicial",
    descripcion: "Imparte justicia e interpreta las leyes.",
    icono: "fa-scale-balanced",
    color: "#C792EA",
  },
};

export interface ItemPoder {
  id: string;
  texto: string;
  poder: Poder;
  esFuncion?: boolean;
}

export const ITEMS_PODER: ItemPoder[] = [
  // Ejecutivo
  { id: "ip-presidente", texto: "Presidente de la república", poder: "ejecutivo" },
  { id: "ip-gobernadores", texto: "Gobernadores", poder: "ejecutivo" },
  { id: "ip-municipales", texto: "Presidentes municipales", poder: "ejecutivo" },
  { id: "ip-aplica", texto: "Aplicar las leyes y proveer servicios públicos", poder: "ejecutivo", esFuncion: true },
  // Legislativo
  { id: "ip-congreso", texto: "Congreso de la Unión", poder: "legislativo" },
  { id: "ip-senado", texto: "Senado", poder: "legislativo" },
  { id: "ip-diputados", texto: "Cámara de Diputados", poder: "legislativo" },
  { id: "ip-hacer", texto: "Hacer las leyes", poder: "legislativo", esFuncion: true },
  // Judicial
  { id: "ip-scjn", texto: "Suprema Corte de Justicia", poder: "judicial" },
  { id: "ip-tribunales", texto: "Tribunales", poder: "judicial" },
  { id: "ip-impartir", texto: "Impartir justicia", poder: "judicial", esFuncion: true },
];

/* ── Modo 3 «Conceptos clave» (emparejar concepto con su definición) ────── */
// Verbatim del glosario A6.
export interface Concepto {
  id: string;
  termino: string;
  definicion: string;
}

export const CONCEPTOS: Concepto[] = [
  { id: "c-division", termino: "División de poderes", definicion: "Separación de funciones en Ejecutivo, Legislativo y Judicial para evitar abusos." },
  { id: "c-monopolio", termino: "Monopolio legítimo de la fuerza", definicion: "Solo el Estado puede usar la fuerza de forma legal (policía, ejército)." },
  { id: "c-captura", termino: "Captura del Estado", definicion: "Cuando intereses privados controlan al Estado en su beneficio." },
  { id: "c-impunidad", termino: "Impunidad", definicion: "Falta de castigo a quien comete un delito." },
  { id: "c-institucion", termino: "Institución", definicion: "Conjunto estable de normas y organizaciones que estructuran la vida social." },
];

/* ── Cuestionario (verbatim del quiz A4) ───────────────────────────────── */
export interface QuizItem {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}

export const QUIZ: QuizItem[] = [
  {
    pregunta: "¿Cuáles son los tres elementos clásicos del Estado?",
    opciones: ["Territorio, población y gobierno", "Bandera, himno y escudo", "Presidente, congreso y jueces", "Dinero, ejército y leyes"],
    correcta: 0,
    retro: "El Estado se define por territorio delimitado, población y un gobierno con monopolio legítimo de la fuerza.",
  },
  {
    pregunta: "¿Cuáles son los tres poderes del Estado mexicano?",
    opciones: ["Federal, estatal y municipal", "Ejecutivo, Legislativo y Judicial", "Civil, militar y religioso", "Económico, político y social"],
    correcta: 1,
    retro: "Ejecutivo, Legislativo y Judicial: se controlan mutuamente.",
  },
  {
    pregunta: "El Congreso de la Unión pertenece al poder:",
    opciones: ["Ejecutivo", "Judicial", "Legislativo", "Municipal"],
    correcta: 2,
    retro: "El Legislativo (Senado y Cámara de Diputados) hace las leyes.",
  },
  {
    pregunta: "Cuando intereses particulares controlan al Estado para su beneficio se habla de:",
    opciones: ["división de poderes", "captura del Estado", "estado de derecho", "soberanía popular"],
    correcta: 1,
    retro: "La 'captura del Estado' ocurre cuando intereses particulares lo controlan.",
  },
  {
    pregunta: "Que la relación Estado-ciudadanía sea 'bidireccional' significa que:",
    opciones: [
      "solo el Estado tiene obligaciones",
      "solo los ciudadanos tienen deberes",
      "ambos tienen derechos y obligaciones mutuas",
      "no hay relación entre ellos",
    ],
    correcta: 2,
    retro: "El Estado tiene obligaciones hacia los ciudadanos y éstos derechos y deberes hacia el Estado.",
  },
];

/** Dato verbatim de A1 (el Estado como relación social). */
export const DATO_ESTADO =
  "El Estado no es solo un conjunto de instituciones: es una relación social, una forma en que una sociedad se organiza para distribuir el poder y los recursos. Por eso la relación entre Estado y ciudadanía es bidireccional y cambia con la historia.";
