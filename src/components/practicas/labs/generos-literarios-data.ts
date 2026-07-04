/**
 * Datos del Laboratorio — Géneros literarios: formas de contar y decir
 * (LC-III-P03, Lenguaje y Comunicación III).
 *
 * Contenido VERBATIM de LC-III·P03 ("Géneros literarios: formas de contar y
 * decir — narrativo, lírico, dramático y sus particularidades"). Las
 * definiciones del glosario, los ejemplos y las afirmaciones del cuestionario
 * se toman literalmente de las actividades A1 (lectura), A2 (V/F), A4 (V/F) y
 * A5 (glosario). Las obras y subgéneros a clasificar son casos que las propias
 * actividades nombran y clasifican explícitamente.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Narrativo, lírico, dramático o ensayístico? (clasifica por género)
 * ───────────────────────────────────────────────────────────────────────── */
export type Genero = "narrativo" | "lirico" | "dramatico" | "ensayistico";

export const GENERO_INFO: Record<
  Genero,
  { titulo: string; subtitulo: string; icono: string }
> = {
  narrativo: {
    titulo: "Género narrativo",
    subtitulo: "Agrupa los textos que cuentan historias: construye mundos habitados por personajes que actúan en el tiempo. Incluye la novela, el cuento y la crónica.",
    icono: "fa-book",
  },
  lirico: {
    titulo: "Género lírico",
    subtitulo: "La lírica o poesía expresa estados interiores, sensaciones y percepciones mediante figuras retóricas, ritmo y musicalidad.",
    icono: "fa-feather-pointed",
  },
  dramatico: {
    titulo: "Género dramático",
    subtitulo: "El drama o teatro está escrito para ser representado: se organiza en actos y escenas, y el diálogo entre personajes lleva la acción.",
    icono: "fa-masks-theater",
  },
  ensayistico: {
    titulo: "Género ensayístico",
    subtitulo: "El ensayo es un género de no ficción en que el autor reflexiona, argumenta o interpreta sobre un tema con voz propia.",
    icono: "fa-pen-nib",
  },
};

export const OBRAS: { id: string; texto: string; genero: Genero }[] = [
  { id: "ob-n1", texto: "«Pedro Páramo» de Juan Rulfo (novela)", genero: "narrativo" },
  { id: "ob-n2", texto: "«El aleph» de Jorge Luis Borges (cuento)", genero: "narrativo" },
  { id: "ob-n3", texto: "La crónica, entre lo real y lo literario", genero: "narrativo" },
  { id: "ob-l1", texto: "«Veinte poemas de amor y una canción desesperada» de Neruda", genero: "lirico" },
  { id: "ob-l2", texto: "Un poema en verso libre, sin rima ni métrica fija", genero: "lirico" },
  { id: "ob-d1", texto: "«La casa de Bernarda Alba» de Federico García Lorca", genero: "dramatico" },
  { id: "ob-d2", texto: "Una tragedia: conflictos que terminan en pérdida", genero: "dramatico" },
  { id: "ob-d3", texto: "Una comedia: conflictos que terminan en armonía", genero: "dramatico" },
  { id: "ob-e1", texto: "«El laberinto de la soledad» de Octavio Paz", genero: "ensayistico" },
  { id: "ob-e2", texto: "«El laberinto de la soledad»: reflexión con voz propia", genero: "ensayistico" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — La característica de cada género (empareja género ↔ rasgo)
 * Rasgos verbatim de la lectura A1.
 * ───────────────────────────────────────────────────────────────────────── */
export const RASGOS: { id: string; genero: string; rasgo: string; ejemplo: string }[] = [
  {
    id: "ge-narrativo",
    genero: "Narrativo",
    rasgo: "Cuenta historias y construye mundos habitados por personajes que actúan en el tiempo.",
    ejemplo: "La novela (extensa, con múltiples personajes y tramas) y el cuento (breve, concentrado en un efecto).",
  },
  {
    id: "ge-lirico",
    genero: "Lírico",
    rasgo: "Expresa estados interiores a través del lenguaje cargado de figuras retóricas, ritmo y musicalidad.",
    ejemplo: "No siempre rima, pero siempre tiene una conciencia especial del sonido y la imagen.",
  },
  {
    id: "ge-dramatico",
    genero: "Dramático",
    rasgo: "Está escrito para ser representado: se organiza en actos y escenas, y el diálogo lleva la acción.",
    ejemplo: "Incluye la tragedia, la comedia y el drama moderno (ambiguo, realista).",
  },
  {
    id: "ge-ensayistico",
    genero: "Ensayístico",
    rasgo: "Es no ficción: el autor reflexiona, argumenta o interpreta un tema con voz propia.",
    ejemplo: "A diferencia del artículo científico, el ensayo acepta la subjetividad y la belleza del estilo.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-novela",
    termino: "Novela",
    definicion: "Género narrativo extenso con personajes complejos, trama desarrollada en múltiples capítulos y universo ficcional detallado.",
    ejemplo: "«Pedro Páramo» de Juan Rulfo.",
  },
  {
    id: "gl-cuento",
    termino: "Cuento",
    definicion: "Género narrativo breve, con un único conflicto central, pocos personajes y final generalmente sorpresivo o revelador.",
    ejemplo: "«El aleph» de Jorge Luis Borges.",
  },
  {
    id: "gl-poesia",
    termino: "Poesía",
    definicion: "Género lírico que expresa emociones, experiencias o ideas a través del verso, el ritmo y figuras retóricas.",
    ejemplo: "«Veinte poemas de amor y una canción desesperada» de Neruda.",
  },
  {
    id: "gl-drama",
    termino: "Drama",
    definicion: "Género teatral escrito para ser representado en escena; incluye diálogo, acotaciones y conflicto dramático.",
    ejemplo: "«La casa de Bernarda Alba» de Federico García Lorca.",
  },
  {
    id: "gl-ensayo",
    termino: "Ensayo",
    definicion: "Texto no ficcional en prosa donde el autor reflexiona, argumenta e interpreta un tema desde su perspectiva.",
    ejemplo: "«El laberinto de la soledad» de Octavio Paz.",
  },
  {
    id: "gl-narrador",
    termino: "Narrador",
    definicion: "Voz que cuenta la historia en los textos narrativos; puede ser omnisciente, en primera persona o testigo.",
    ejemplo: "El narrador omnisciente sabe todo lo que piensan los personajes.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (V/F de A4 + A2, verbatim).
 * Renderizado como opción doble Verdadero / Falso.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "La novela es un género narrativo extenso que desarrolla personajes y tramas complejas.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: la extensión y la complejidad narrativa son rasgos definitorios de la novela.",
  },
  {
    pregunta: "El ensayo literario es un texto de ficción que narra hechos imaginarios.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No: el ensayo es un texto no ficcional que expone reflexiones, argumentos e interpretaciones de un autor sobre un tema.",
  },
  {
    pregunta: "El cuento se distingue de la novela principalmente por su brevedad y por tener un único conflicto central.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: el cuento es conciso y concentra la acción en un solo núcleo narrativo.",
  },
  {
    pregunta: "El drama está escrito principalmente para ser leído en voz alta de forma individual, sin representación escénica.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No: el drama (género teatral) está concebido para su representación escénica ante un público.",
  },
  {
    pregunta: "La poesía se caracteriza por el uso del verso, el ritmo y recursos como la metáfora y la imagen.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Sí: aunque también existe la prosa poética, el verso, el ritmo y las figuras retóricas son elementos centrales de la poesía.",
  },
  {
    pregunta: "Los géneros literarios pueden mezclarse: una novela puede contener poemas o ensayos dentro.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La hibridación de géneros es frecuente en la literatura contemporánea: muchas novelas integran poesía, cartas o ensayos.",
  },
];

/** Dato verbatim de la lectura A1 (hibridación de géneros). */
export const DATO_GENEROS =
  "Los géneros se mezclan: un poema puede ser narrativo, una novela puede tener ensayos dentro, un drama puede ser poético. Reconocer estas mezclas es parte de la lectura literaria sofisticada.";
