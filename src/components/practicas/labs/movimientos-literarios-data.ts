/**
 * Datos del Laboratorio — Movimientos literarios: del Barroco a las Vanguardias
 * (LC-III-P02, Lenguaje y Comunicación III).
 *
 * Contenido VERBATIM de LC-III·P02 ("Movimientos literarios: del Barroco a las
 * Vanguardias"). El laboratorio integra las cuatro actividades de la progresión:
 *  - Modo 1 (clasificar): cada autor/obra representativa se arrastra a su
 *    movimiento literario. Los pares autor↔obra↔movimiento son verbatim del
 *    glosario A5 (campo "ejemplo") y de la infografía A1.
 *  - Modo 2 (emparejar): cada movimiento se empareja con su rasgo definitorio,
 *    transcrito literalmente de las opciones correctas del quiz A2.
 *  - Modo 3 (glosario): los seis términos y definiciones verbatim de A5.
 *  - El cuestionario usa las cinco preguntas de opción múltiple verbatim de A2,
 *    con sus opciones y respuesta correcta exactas.
 *
 * Los seis movimientos son los que la FUENTE nombra explícitamente en su
 * glosario A5: Barroco, Romanticismo, Realismo, Modernismo, Vanguardias y
 * Realismo mágico.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — Clasifica cada obra/autor por su movimiento literario
 * ───────────────────────────────────────────────────────────────────────── */
export type Movimiento =
  | "barroco"
  | "romanticismo"
  | "realismo"
  | "modernismo"
  | "vanguardias"
  | "realismo-magico";

export const MOVIMIENTO_INFO: Record<
  Movimiento,
  { titulo: string; subtitulo: string; icono: string }
> = {
  barroco: {
    titulo: "Barroco",
    subtitulo: "Movimiento (s. XVII) caracterizado por el lenguaje complejo, metáforas elaboradas y tensión entre lo divino y lo humano.",
    icono: "fa-feather-pointed",
  },
  romanticismo: {
    titulo: "Romanticismo",
    subtitulo: "Movimiento (s. XIX) que exalta la emoción, la libertad, la naturaleza y el héroe trágico.",
    icono: "fa-heart",
  },
  realismo: {
    titulo: "Realismo",
    subtitulo: "Corriente (s. XIX) que busca retratar la realidad social con objetividad y detalle.",
    icono: "fa-eye",
  },
  modernismo: {
    titulo: "Modernismo",
    subtitulo: "Movimiento hispanoamericano (fines s. XIX – inicio s. XX) de refinamiento estético, musicalidad y simbolismo.",
    icono: "fa-music",
  },
  vanguardias: {
    titulo: "Vanguardias",
    subtitulo: "Conjunto de movimientos experimentales del s. XX (Surrealismo, Dadaísmo, Ultraísmo) que rompen con la tradición.",
    icono: "fa-bolt",
  },
  "realismo-magico": {
    titulo: "Realismo mágico",
    subtitulo: "Corriente latinoamericana que integra lo fantástico en un contexto cotidiano como algo natural.",
    icono: "fa-wand-magic-sparkles",
  },
};

export const OBRAS: { id: string; texto: string; movimiento: Movimiento }[] = [
  // Barroco — A5 ejemplo + A1 infografía
  { id: "ob-ba1", texto: "Sor Juana Inés de la Cruz, «Hombres necios que acusáis»", movimiento: "barroco" },
  { id: "ob-ba2", texto: "Sor Juana Inés de la Cruz, «Primero Sueño» (1692)", movimiento: "barroco" },
  // Romanticismo — A5 ejemplo + A1 infografía
  { id: "ob-ro1", texto: "Gustavo Adolfo Bécquer, «Rimas y leyendas»", movimiento: "romanticismo" },
  { id: "ob-ro2", texto: "Ignacio Manuel Altamirano, «El Zarco»", movimiento: "romanticismo" },
  // Realismo — A5 ejemplo
  { id: "ob-re1", texto: "Benito Pérez Galdós, «Fortunata y Jacinta»", movimiento: "realismo" },
  // Modernismo — A5 ejemplo + A1 infografía
  { id: "ob-mo1", texto: "Rubén Darío, «Azul…»", movimiento: "modernismo" },
  { id: "ob-mo2", texto: "Manuel Gutiérrez Nájera, «Revista Azul» (1894)", movimiento: "modernismo" },
  // Vanguardias — A5 ejemplo + A1 infografía (Estridentismo)
  { id: "ob-va1", texto: "Vicente Huidobro y el Creacionismo", movimiento: "vanguardias" },
  { id: "ob-va2", texto: "Manuel Maples Arce, «Manifiesto Estridentista» (1921)", movimiento: "vanguardias" },
  // Realismo mágico — A5 ejemplo
  { id: "ob-rm1", texto: "Gabriel García Márquez, «Cien años de soledad»", movimiento: "realismo-magico" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Empareja cada movimiento con su rasgo definitorio
 * Rasgos verbatim de las opciones correctas del quiz A2.
 * ───────────────────────────────────────────────────────────────────────── */
export const RASGOS: { id: string; movimiento: string; rasgo: string; ejemplo: string }[] = [
  {
    id: "ra-barroco",
    movimiento: "Barroco",
    rasgo: "Lenguaje ornamental, contrastes extremos y el tema del desengaño del mundo.",
    ejemplo: "El Barroco se distingue por su lenguaje recargado y el contraste entre apariencia y realidad, reflejando el desengaño de su época.",
  },
  {
    id: "ra-romanticismo",
    movimiento: "Romanticismo",
    rasgo: "El individualismo, la emoción, la naturaleza sublime y la rebeldía frente al orden establecido.",
    ejemplo: "El Romanticismo reacciona contra el racionalismo ilustrado exaltando el yo, la emoción y la naturaleza.",
  },
  {
    id: "ra-realismo",
    movimiento: "Realismo",
    rasgo: "Busca representar objetivamente la sociedad, con crítica social y personajes ordinarios.",
    ejemplo: "El Realismo reacciona contra el idealismo romántico: prefiere lo cotidiano, lo social y lo verosímil.",
  },
  {
    id: "ra-modernismo",
    movimiento: "Modernismo",
    rasgo: "La musicalidad, el lenguaje preciosista, el cosmopolitismo y la renovación formal.",
    ejemplo: "El Modernismo, liderado por Rubén Darío, renueva el castellano literario con musicalidad, exotismo y cuidado formal extremo.",
  },
  {
    id: "ra-realismo-magico",
    movimiento: "Realismo mágico",
    rasgo: "Integrar elementos maravillosos o sobrenaturales en la realidad cotidiana de manera natural.",
    ejemplo: "En el Realismo mágico, lo extraordinario coexiste con lo cotidiano sin asombrar a los personajes: es parte de su mundo.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-barroco",
    termino: "Barroco",
    definicion: "Movimiento (s. XVII) caracterizado por el lenguaje complejo, metáforas elaboradas y tensión entre lo divino y lo humano.",
    ejemplo: "Sor Juana Inés de la Cruz, 'Hombres necios que acusáis'.",
  },
  {
    id: "gl-romanticismo",
    termino: "Romanticismo",
    definicion: "Movimiento (s. XIX) que exalta la emoción, la libertad, la naturaleza y el héroe trágico.",
    ejemplo: "Gustavo Adolfo Bécquer, 'Rimas y leyendas'.",
  },
  {
    id: "gl-realismo",
    termino: "Realismo",
    definicion: "Corriente (s. XIX) que busca retratar la realidad social con objetividad y detalle.",
    ejemplo: "Benito Pérez Galdós, 'Fortunata y Jacinta'.",
  },
  {
    id: "gl-modernismo",
    termino: "Modernismo",
    definicion: "Movimiento hispanoamericano (fines s. XIX – inicio s. XX) de refinamiento estético, musicalidad y simbolismo.",
    ejemplo: "Rubén Darío, 'Azul...'.",
  },
  {
    id: "gl-vanguardias",
    termino: "Vanguardias",
    definicion: "Conjunto de movimientos experimentales del s. XX (Surrealismo, Dadaísmo, Ultraísmo) que rompen con la tradición.",
    ejemplo: "Vicente Huidobro y el Creacionismo.",
  },
  {
    id: "gl-realismo-magico",
    termino: "Realismo mágico",
    definicion: "Corriente latinoamericana que integra lo fantástico en un contexto cotidiano como algo natural.",
    ejemplo: "Gabriel García Márquez, 'Cien años de soledad'.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (opción múltiple de A2, verbatim).
 * Enunciados, opciones y respuesta correcta exactos.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}[] = [
  {
    pregunta: "¿Qué caracteriza principalmente al Barroco literario?",
    opciones: [
      "Lenguaje simple y directo con propósito moral",
      "Lenguaje ornamental, contrastes extremos y el tema del desengaño del mundo",
      "Representación objetiva de la sociedad contemporánea",
      "Ruptura radical con todas las convenciones literarias anteriores",
    ],
    correcta: 1,
    retro: "El Barroco se distingue por su lenguaje recargado y el contraste entre apariencia y realidad, reflejando el desengaño de su época.",
  },
  {
    pregunta: "El Romanticismo literario se caracteriza por:",
    opciones: [
      "Valorar la razón por encima de la emoción",
      "El individualismo, la emoción, la naturaleza sublime y la rebeldía frente al orden establecido",
      "Representar la vida cotidiana de la clase trabajadora",
      "Experimentar con la forma y rechazar la sintaxis convencional",
    ],
    correcta: 1,
    retro: "El Romanticismo reacciona contra el racionalismo ilustrado exaltando el yo, la emoción y la naturaleza.",
  },
  {
    pregunta: "¿Qué distingue al Realismo literario del Romanticismo?",
    opciones: [
      "El Realismo usa más metáforas y recursos poéticos",
      "El Realismo busca representar objetivamente la sociedad, con crítica social y personajes ordinarios",
      "El Realismo se centra en mundos imaginarios",
      "No hay diferencias significativas entre ambos movimientos",
    ],
    correcta: 1,
    retro: "El Realismo reacciona contra el idealismo romántico: prefiere lo cotidiano, lo social y lo verosímil.",
  },
  {
    pregunta: "¿Cuál es el rasgo más representativo del Modernismo hispanoamericano?",
    opciones: [
      "La representación cruda de la marginalidad urbana",
      "La musicalidad, el lenguaje preciosista, el cosmopolitismo y la renovación formal",
      "La integración de lo maravilloso en lo cotidiano",
      "La ruptura total con el lenguaje literario tradicional",
    ],
    correcta: 1,
    retro: "El Modernismo, liderado por Rubén Darío, renueva el castellano literario con musicalidad, exotismo y cuidado formal extremo.",
  },
  {
    pregunta: "El Realismo mágico se caracteriza por:",
    opciones: [
      "Narrar solo hechos históricos comprobables",
      "Integrar elementos maravillosos o sobrenaturales en la realidad cotidiana de manera natural",
      "Ambientar sus historias en mundos completamente fantásticos",
      "Rechazar los elementos culturales latinoamericanos",
    ],
    correcta: 1,
    retro: "En el Realismo mágico, lo extraordinario coexiste con lo cotidiano sin asombrar a los personajes: es parte de su mundo.",
  },
];

/** Dato verbatim del glosario A1 (definición de «Movimiento literario»). */
export const DATO_MOVIMIENTOS =
  "Un movimiento literario es una corriente de pensamiento estético que agrupa a autores de una época con visión del mundo, recursos formales y temas compartidos. Los movimientos son construcciones críticas retrospectivas: los escritores raramente se autodefinen así al escribir.";
