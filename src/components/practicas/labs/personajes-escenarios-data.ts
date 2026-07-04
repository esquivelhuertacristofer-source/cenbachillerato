/**
 * Datos del Laboratorio — Personajes y escenarios (LC-II-P04).
 *
 * Contenido VERBATIM de LC-II·P04 (Lengua y Comunicación II, "Personajes y
 * escenarios"). Las definiciones, ejemplos del glosario, tipos de escenario y
 * afirmaciones del cuestionario se toman literalmente de las actividades A1
 * (infografía), A2 (quiz), A4 (V/F) y A5 (glosario). Los enunciados de los
 * elementos a clasificar son instancias ilustrativas que aplican fielmente esas
 * definiciones oficiales (sin alterar el concepto).
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Qué tipo de personaje? (clasifica por rol en la trama)
 * ───────────────────────────────────────────────────────────────────────── */
export type TipoPersonaje = "protagonista" | "antagonista" | "secundario";

export const TIPO_PERSONAJE_INFO: Record<
  TipoPersonaje,
  { titulo: string; subtitulo: string; ejemplo: string; icono: string }
> = {
  protagonista: {
    titulo: "Protagonista",
    subtitulo: "Personaje principal alrededor del cual gira la historia.",
    ejemplo: "El héroe o la heroína del relato.",
    icono: "fa-star",
  },
  antagonista: {
    titulo: "Antagonista",
    subtitulo: "Personaje que se opone al protagonista o le crea conflicto.",
    ejemplo: "El villano que dificulta la meta del héroe.",
    icono: "fa-skull",
  },
  secundario: {
    titulo: "Personaje secundario",
    subtitulo: "Personaje que acompaña o apoya la historia sin ser el centro.",
    ejemplo: "Un amigo o ayudante del protagonista.",
    icono: "fa-user-group",
  },
};

export const PERSONAJES: { id: string; texto: string; tipo: TipoPersonaje }[] = [
  { id: "pe-p1", texto: "El héroe o la heroína del relato", tipo: "protagonista" },
  { id: "pe-p2", texto: "La joven cuya aventura seguimos de inicio a fin", tipo: "protagonista" },
  { id: "pe-p3", texto: "El personaje principal alrededor del cual gira la historia", tipo: "protagonista" },
  { id: "pe-a1", texto: "El villano que dificulta la meta del héroe", tipo: "antagonista" },
  { id: "pe-a2", texto: "El personaje que se opone al protagonista y crea el conflicto", tipo: "antagonista" },
  { id: "pe-a3", texto: "El cacique que domina el pueblo por el terror", tipo: "antagonista" },
  { id: "pe-s1", texto: "Un amigo o ayudante del protagonista", tipo: "secundario" },
  { id: "pe-s2", texto: "Quien apoya, complica o enriquece la trama sin ser el centro", tipo: "secundario" },
  { id: "pe-s3", texto: "El vecino que aparece solo en algunas escenas", tipo: "secundario" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — ¿Qué tipo de escenario? (clasifica por ambiente)
 * ───────────────────────────────────────────────────────────────────────── */
export type TipoEscenario = "realista" | "fantastico" | "historico";

export const TIPO_ESCENARIO_INFO: Record<
  TipoEscenario,
  { titulo: string; subtitulo: string; icono: string }
> = {
  realista: {
    titulo: "Realista",
    subtitulo: "Lugares y situaciones cotidianas y verosímiles del mundo real.",
    icono: "fa-house-chimney",
  },
  fantastico: {
    titulo: "Fantástico",
    subtitulo: "Escenario con elementos sobrenaturales.",
    icono: "fa-hat-wizard",
  },
  historico: {
    titulo: "Histórico",
    subtitulo: "Se ubica en épocas pasadas con contexto histórico real.",
    icono: "fa-landmark",
  },
};

export const ESCENARIOS: { id: string; texto: string; tipo: TipoEscenario }[] = [
  { id: "es-h1", texto: "El México prehispánico, con eventos históricos reales", tipo: "historico" },
  { id: "es-h2", texto: "Una ciudad durante la Revolución Mexicana", tipo: "historico" },
  { id: "es-h3", texto: "Una hacienda del siglo XIX con las costumbres de la época", tipo: "historico" },
  { id: "es-f1", texto: "Un río donde, por las noches, llora La Llorona", tipo: "fantastico" },
  { id: "es-f2", texto: "Un reino mágico habitado por criaturas sobrenaturales", tipo: "fantastico" },
  { id: "es-f3", texto: "Un bosque encantado donde los árboles hablan", tipo: "fantastico" },
  { id: "es-r1", texto: "El mercado de un pueblo cualquiera, como los de hoy", tipo: "realista" },
  { id: "es-r2", texto: "Un salón de clases en una escuela actual", tipo: "realista" },
  { id: "es-r3", texto: "La cocina de una casa durante una cena familiar", tipo: "realista" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-caracterizacion",
    termino: "Caracterización",
    definicion: "Conjunto de rasgos físicos, psicológicos y de conducta que definen a un personaje.",
    ejemplo: "Un personaje valiente, alto y de mirada decidida.",
  },
  {
    id: "gl-protagonista",
    termino: "Protagonista",
    definicion: "Personaje principal alrededor del cual gira la historia.",
    ejemplo: "El héroe o la heroína del relato.",
  },
  {
    id: "gl-antagonista",
    termino: "Antagonista",
    definicion: "Personaje que se opone al protagonista o le crea conflicto.",
    ejemplo: "El villano que dificulta la meta del héroe.",
  },
  {
    id: "gl-secundario",
    termino: "Personaje secundario",
    definicion: "Personaje que acompaña o apoya la historia sin ser el centro.",
    ejemplo: "Un amigo o ayudante del protagonista.",
  },
  {
    id: "gl-escenario",
    termino: "Escenario",
    definicion: "Lugar y ambiente donde se desarrolla la historia.",
    ejemplo: "Un bosque oscuro, un pueblo, una nave espacial.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (V/F de A4 + arquetipo de A2, verbatim)
 * Renderizado como opción doble Verdadero / Falso.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "Caracterizar a un personaje es describir cómo es física y psicológicamente y cómo actúa.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: la caracterización define su apariencia, personalidad y conducta.",
  },
  {
    pregunta: "Los personajes pueden cambiar o evolucionar de inicio a fin de la historia.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: muchos relatos muestran la transformación de sus personajes.",
  },
  {
    pregunta: "El escenario o ambiente donde ocurre la historia no influye en el relato.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "El escenario aporta sentido, atmósfera y contexto a la narrativa.",
  },
  {
    pregunta: "Los personajes pueden clasificarse, por ejemplo, en principales y secundarios.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: también en protagonista, antagonista, etc.",
  },
  {
    pregunta: "Un arquetipo es un personaje universal que representa un rol simbólico (el héroe, el sabio, el trickster).",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Los arquetipos son personajes universales que aparecen en culturas y épocas distintas.",
  },
];

/** Dato verbatim de la infografía A1. */
export const DATO_ESCENARIO =
  "El escenario no es solo decorado; establece el conflicto, revela el poder social y moldea el comportamiento de los personajes.";
