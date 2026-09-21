/**
 * Datos del laboratorio «A trip to remember» — IN-IV-P01 (Inglés IV, 4.º semestre).
 *
 * Propósito de la progresión: «Describe experiencias pasadas con detalle: narra
 * lo que ocurrió, dónde y cómo».
 *
 * QUÉ ES VERBATIM DE LA BASE
 *  · LECTURA_A1, NOTA_GRAMATICAL_A1, PREGUNTAS_A1, DATO_A1 → IN-IV-P01-A1.
 *  · Los dos textos de huecos (en `pasado-viaje-huecos.ts`)   → A2 y A6.
 *  · TU_TURNO_A3                                             → A3.
 *  · QUIZ (reto evaluable, True/False)                        → A4.
 *  · GLOSARIO_A5                                              → A5.
 *  · AUTOEVAL_A7                                              → A7.
 *  · VIDEO_A8                                                 → A8.
 *
 * QUÉ ESCRIBÍ YO PARA ESTA PRÁCTICA (ilustrativo, pero inglés correcto y
 * lugares reales)
 *  · VERBOS: los dieciséis verbos del modo de ortografía. Las reglas de
 *    escritura de -ed son las de cualquier gramática descriptiva del inglés
 *    estadounidense estándar.
 *  · ESCENAS: cinco viñetas de fondo/interrupción. Los lugares son reales y
 *    los datos que los acompañan verificables (ver DATO de cada escena); las
 *    personas —Sofía, Emiliano, Abril, Tadeo— son FICTICIAS.
 *  · RELATO e INTRUSOS: la excursión escolar a Teotihuacán, continuación del
 *    relato que la propia actividad A2 empieza. Ficticia en lo personal, real
 *    en lo geográfico.
 *  · ESCRITURA: las ocho oraciones que se teclean.
 *
 * Sin React ni three: datos puros.
 */

import type { QuizEvaluable } from "./_reto-quiz";

export const FUENTE = "Material CEN Bachillerato — IN-IV (A2+), progresión 1 «A Trip to Remember: Past Simple in Context».";

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · Modo «Spelling the past» — cómo se escribe el pasado
 * ═══════════════════════════════════════════════════════════════════════════ */

export type ReglaEd = "ed" | "d" | "ied" | "doble" | "irregular";

export const ORDEN_REGLAS: ReglaEd[] = ["ed", "d", "ied", "doble", "irregular"];

export interface ReglaInfo {
  /** Rótulo corto de la columna, en inglés porque es la forma que se escribe. */
  titulo: string;
  /** La regla, en español. */
  explica: string;
  /** Ejemplo canónico. */
  ejemplo: string;
  color: string;
  icono: string;
}

export const REGLA_INFO: Record<ReglaEd, ReglaInfo> = {
  ed: {
    titulo: "+ -ed",
    explica: "La regla general: al verbo base se le pega -ed y no cambia nada más. Ojo: si la -y va después de una VOCAL, también toca aquí (play → played, no «plaid»).",
    ejemplo: "walk → walked",
    color: "#5BC8FF",
    icono: "fa-plus",
  },
  d: {
    titulo: "-e → + -d",
    explica: "Si el verbo ya termina en -e, no se escribe otra e: solo se añade -d.",
    ejemplo: "arrive → arrived",
    color: "#7DD3FC",
    icono: "fa-scissors",
  },
  ied: {
    titulo: "cons. + y → -ied",
    explica: "Si la -y viene después de una CONSONANTE, la y se convierte en i y se añade -ed.",
    ejemplo: "study → studied",
    color: "#C084FC",
    icono: "fa-rotate",
  },
  doble: {
    titulo: "doblar + -ed",
    explica: "Verbo de una sílaba que acaba en vocal + consonante: la consonante final se dobla antes de -ed, para que la vocal siga siendo corta.",
    ejemplo: "stop → stopped",
    color: "#FBBF24",
    icono: "fa-clone",
  },
  irregular: {
    titulo: "irregular",
    explica: "No hay regla: la forma de pasado es otra palabra y hay que aprendérsela. Son las más usadas del idioma, por eso sobreviven sin regla.",
    ejemplo: "go → went",
    color: "#FB7185",
    icono: "fa-star",
  },
};

export interface VerboPasado {
  id: string;
  base: string;
  pasado: string;
  regla: ReglaEd;
  /** Traducción al español, para que el alumno sepa de qué verbo hablamos. */
  es: string;
  /** Por qué va en esa columna (español). Se muestra al acertar o al fallar. */
  porque: string;
  /** true si la forma aparece en la lectura A1 o en los textos A2/A6. */
  enLaProgresion?: boolean;
}

export const VERBOS: VerboPasado[] = [
  // ── regla general: + -ed ───────────────────────────────────────────────
  { id: "walk", base: "walk", pasado: "walked", regla: "ed", es: "caminar", porque: "Acaba en consonante normal: se le pega -ed y ya.", enLaProgresion: true },
  { id: "visit", base: "visit", pasado: "visited", regla: "ed", es: "visitar", porque: "Acaba en -t; se añade -ed (y se pronuncia /ɪd/: vi-si-ted).", enLaProgresion: true },
  { id: "play", base: "play", pasado: "played", regla: "ed", es: "jugar / tocar música", porque: "La -y va después de la VOCAL a, así que NO cambia a i: played." },

  // ── acaba en -e: + -d ──────────────────────────────────────────────────
  { id: "arrive", base: "arrive", pasado: "arrived", regla: "d", es: "llegar", porque: "Ya termina en -e: solo falta la -d. «arriveed» no existe.", enLaProgresion: true },
  { id: "decorate", base: "decorate", pasado: "decorated", regla: "d", es: "decorar", porque: "Termina en -e: decorate + d.", enLaProgresion: true },
  { id: "taste", base: "taste", pasado: "tasted", regla: "d", es: "probar (sabor)", porque: "Termina en -e: taste + d.", enLaProgresion: true },

  // ── consonante + y → -ied ──────────────────────────────────────────────
  { id: "study", base: "study", pasado: "studied", regla: "ied", es: "estudiar", porque: "La -y va después de la consonante d: y → i, + -ed." },
  { id: "try", base: "try", pasado: "tried", regla: "ied", es: "probar / intentar", porque: "La -y va después de la consonante r: y → i, + -ed.", enLaProgresion: true },
  { id: "carry", base: "carry", pasado: "carried", regla: "ied", es: "cargar / llevar", porque: "La -y va después de la consonante r: y → i, + -ed." },

  // ── doblar la consonante final ─────────────────────────────────────────
  { id: "stop", base: "stop", pasado: "stopped", regla: "doble", es: "parar(se)", porque: "Una sílaba, vocal + consonante (o-p): se dobla la p. «stoped» se leería «stouped»." },
  { id: "plan", base: "plan", pasado: "planned", regla: "doble", es: "planear", porque: "Una sílaba, vocal + consonante (a-n): se dobla la n." },
  { id: "shop", base: "shop", pasado: "shopped", regla: "doble", es: "ir de compras", porque: "Una sílaba, vocal + consonante (o-p): se dobla la p." },

  // ── irregulares ────────────────────────────────────────────────────────
  { id: "go", base: "go", pasado: "went", regla: "irregular", es: "ir", porque: "Irregular total: el pasado es otra palabra. Nunca «goed».", enLaProgresion: true },
  { id: "see", base: "see", pasado: "saw", regla: "irregular", es: "ver", porque: "Irregular: see → saw. Nunca «seed».", enLaProgresion: true },
  { id: "take", base: "take", pasado: "took", regla: "irregular", es: "tomar / llevar", porque: "Irregular: take → took. Nunca «taked».", enLaProgresion: true },
  { id: "buy", base: "buy", pasado: "bought", regla: "irregular", es: "comprar", porque: "Irregular: buy → bought. Nunca «buyed».", enLaProgresion: true },
];

export const TOTAL_VERBOS = VERBOS.length;

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · Modo «Background & interruption» — past continuous frente a past simple
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface FichaVerbo {
  id: string;
  /** La forma tal como se escribe en la oración: «were walking», «started». */
  forma: string;
  /** "cont" = past continuous, "simple" = past simple. */
  tipo: "cont" | "simple";
}

export interface OpcionOracion {
  texto: string;
  correcta: boolean;
  /** Por qué sí o por qué no, en español. */
  razon: string;
}

export interface EscenaFondo {
  id: string;
  /** Lugar real, en español. */
  lugar: string;
  /** Una línea de contexto en español. */
  contexto: string;
  /** Dato verificable del lugar (con fuente). */
  dato: string;
  /** Hueco del fondo: texto antes / después. */
  fondoAntes: string;
  fondoDespues: string;
  /** Hueco de la interrupción. */
  interAntes: string;
  interDespues: string;
  /** id de FICHAS que va en cada hueco. */
  fondoId: string;
  interId: string;
  /** Las cuatro fichas revueltas de esta escena. */
  fichas: FichaVerbo[];
  /** Tercer paso: cuál de las dos oraciones está bien armada. */
  opciones: [OpcionOracion, OpcionOracion];
  /** La explicación de la regla, en español, cuando se cierra la escena. */
  explica: string;
}

export const ESCENAS: EscenaFondo[] = [
  {
    id: "teoti",
    lugar: "Calzada de los Muertos, Teotihuacán (Estado de México)",
    contexto: "Sofía y su grupo recorren la avenida principal de la ciudad prehispánica.",
    dato: "La Calzada de los Muertos mide alrededor de 2 km y ordena toda la traza de Teotihuacán; la zona es Patrimonio Mundial de la UNESCO desde 1987 (INAH / UNESCO).",
    fondoAntes: "We ",
    fondoDespues: " along the Avenue of the Dead",
    interAntes: "it ",
    interDespues: " to rain",
    fondoId: "were-walking",
    interId: "started",
    fichas: [
      { id: "were-walking", forma: "were walking", tipo: "cont" },
      { id: "walked", forma: "walked", tipo: "simple" },
      { id: "started", forma: "started", tipo: "simple" },
      { id: "was-starting", forma: "was starting", tipo: "cont" },
    ],
    opciones: [
      {
        texto: "While we were walking along the Avenue of the Dead, it started to rain.",
        correcta: true,
        razon: "while presenta el FONDO —la caminata, que ya llevaba rato— en past continuous, y lo que la corta va en past simple.",
      },
      {
        texto: "While it started to rain, we were walking along the Avenue of the Dead.",
        correcta: false,
        razon: "Aquí while va con un past simple y deja la lluvia como fondo: se entiende al revés, como si hubiera estado lloviendo todo el tiempo.",
      },
    ],
    explica: "El fondo es lo que ya estaba pasando (was/were + -ing). La interrupción es un hecho puntual y completo (past simple). El orden de las dos partes puede cambiarse, pero el tiempo verbal de cada una no.",
  },
  {
    id: "zocalo",
    lugar: "Zócalo de Oaxaca de Juárez (Oaxaca)",
    contexto: "Tadeo está sentado bajo los laureles de la plaza, escuchando a la banda municipal.",
    dato: "El Centro Histórico de Oaxaca está inscrito en la Lista del Patrimonio Mundial de la UNESCO desde 1987, junto con la zona arqueológica de Monte Albán.",
    fondoAntes: "Tadeo ",
    fondoDespues: " to the municipal band",
    interAntes: "a street parade ",
    interDespues: " in front of him",
    fondoId: "was-listening",
    interId: "passed",
    fichas: [
      { id: "was-listening", forma: "was listening", tipo: "cont" },
      { id: "listened", forma: "listened", tipo: "simple" },
      { id: "passed", forma: "passed", tipo: "simple" },
      { id: "were-passing", forma: "were passing", tipo: "cont" },
    ],
    opciones: [
      {
        texto: "Tadeo was listening to the municipal band when a street parade passed in front of him.",
        correcta: true,
        razon: "when introduce el hecho puntual (passed) y el fondo se queda en past continuous.",
      },
      {
        texto: "Tadeo listened to the municipal band when a street parade was passing in front of him.",
        correcta: false,
        razon: "Están cambiados: la escucha era lo largo y el desfile lo puntual. Además, when pide el past simple justo después.",
      },
    ],
    explica: "Regla práctica: después de while suele ir el past continuous; después de when, el past simple. Es la pista más rápida para no cruzarlos.",
  },
  {
    id: "xochimilco",
    lugar: "Canales de Xochimilco (Ciudad de México)",
    contexto: "Emiliano y Abril van en una trajinera entre las chinampas.",
    dato: "Xochimilco conserva el sistema de chinampas de origen prehispánico y forma parte del sitio «Centro Histórico de la Ciudad de México y Xochimilco», Patrimonio Mundial de la UNESCO desde 1987.",
    fondoAntes: "Emiliano and Abril ",
    fondoDespues: " photos of the chinampas",
    interAntes: "a mariachi boat ",
    interDespues: " closer",
    fondoId: "were-taking",
    interId: "came",
    fichas: [
      { id: "were-taking", forma: "were taking", tipo: "cont" },
      { id: "took", forma: "took", tipo: "simple" },
      { id: "came", forma: "came", tipo: "simple" },
      { id: "was-coming", forma: "was coming", tipo: "cont" },
    ],
    opciones: [
      {
        texto: "Emiliano and Abril were taking photos of the chinampas when a mariachi boat came closer.",
        correcta: true,
        razon: "Sujeto plural → were + -ing para el fondo; el bote aparece de golpe → past simple.",
      },
      {
        texto: "Emiliano and Abril was taking photos of the chinampas when a mariachi boat came closer.",
        correcta: false,
        razon: "El sujeto es plural: va were, no was. La estructura del resto sí es correcta.",
      },
    ],
    explica: "En past continuous el auxiliar concuerda con el sujeto: I / he / she / it → was; you / we / they → were. Los verbos irregulares (take → took, come → came) solo son irregulares en past simple; en continuous solo llevan -ing.",
  },
  {
    id: "mercado",
    lugar: "Mercado 20 de Noviembre, Oaxaca de Juárez (Oaxaca)",
    contexto: "La familia busca dónde sentarse en el mercado, famoso por su pasillo de humo.",
    dato: "El mercado 20 de Noviembre, en el centro de la ciudad de Oaxaca, es conocido por su «pasillo de humo», donde se asan cortes de carne al carbón frente al cliente.",
    fondoAntes: "We ",
    fondoDespues: " for a free table",
    interAntes: "my brother ",
    interDespues: " the mole stand",
    fondoId: "were-looking",
    interId: "found",
    fichas: [
      { id: "were-looking", forma: "were looking", tipo: "cont" },
      { id: "looked", forma: "looked", tipo: "simple" },
      { id: "found", forma: "found", tipo: "simple" },
      { id: "was-finding", forma: "was finding", tipo: "cont" },
    ],
    opciones: [
      {
        texto: "While we were looking for a free table, my brother found the mole stand.",
        correcta: true,
        razon: "La búsqueda duraba (fondo) y el hallazgo ocurrió en un instante (interrupción).",
      },
      {
        texto: "While we looked for a free table, my brother was finding the mole stand.",
        correcta: false,
        razon: "«was finding» no funciona: encontrar algo es instantáneo, no una acción que se prolongue. Hay verbos que casi nunca van en continuous (find, know, understand, like).",
      },
    ],
    explica: "No todo verbo admite past continuous. Los que describen un estado o un resultado instantáneo —find, know, see, understand, want— se quedan en past simple aunque la acción «dure» en español.",
  },
  {
    id: "montealban",
    lugar: "Monte Albán (Oaxaca)",
    contexto: "Sofía dibuja en su cuaderno la galería de los Danzantes.",
    dato: "Monte Albán fue la capital zapoteca fundada hacia 500 a.C. sobre un cerro aplanado a unos 400 m sobre el valle de Oaxaca; es Patrimonio Mundial de la UNESCO desde 1987 (INAH / UNESCO).",
    fondoAntes: "Sofía ",
    fondoDespues: " the Danzantes in her notebook",
    interAntes: "her phone ",
    interDespues: " twice",
    fondoId: "was-drawing",
    interId: "rang",
    fichas: [
      { id: "was-drawing", forma: "was drawing", tipo: "cont" },
      { id: "drew", forma: "drew", tipo: "simple" },
      { id: "rang", forma: "rang", tipo: "simple" },
      { id: "was-ringing", forma: "was ringing", tipo: "cont" },
    ],
    opciones: [
      {
        texto: "Sofía was drawing the Danzantes in her notebook when her phone rang twice.",
        correcta: true,
        razon: "El dibujo venía de antes (fondo) y el teléfono sonó en ese momento (interrupción).",
      },
      {
        texto: "Sofía drew the Danzantes in her notebook when her phone was ringing twice.",
        correcta: false,
        razon: "Así se entiende que primero sonó el teléfono y después ella se puso a dibujar: se invierte la historia.",
      },
    ],
    explica: "Cambiar el tiempo verbal cambia lo que pasó. Con el fondo en continuous, el dibujo ya estaba en marcha; con los dos en simple, se leen como dos hechos uno tras otro.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * 3 · Modo «Build the trip» — orden, conectores e intrusos
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface MomentoRelato {
  id: string;
  /** Conector o expresión de tiempo que encabeza el momento (fijo en la ranura). */
  conector: string;
  /** La oración que hay que colocar ahí. */
  texto: string;
  /** Qué señal del texto lo delata, en español. */
  pista: string;
}

export const RELATO_TITULO = "A school trip to Teotihuacán";

export const RELATO: MomentoRelato[] = [
  {
    id: "m1",
    conector: "Last December,",
    texto: "our school organized a trip to Teotihuacán.",
    pista: "«Last December» sitúa la historia: lo primero que se cuenta es cómo nació el viaje, no lo que pasó ese día.",
  },
  {
    id: "m2",
    conector: "First,",
    texto: "we woke up at five in the morning and took the bus.",
    pista: "Levantarse y tomar el camión es el arranque del día: por eso va con First.",
  },
  {
    id: "m3",
    conector: "When we arrived,",
    texto: "our guide told us about the history of the pyramids.",
    pista: "«When we arrived» marca la llegada: lo que sigue es lo primero que ocurrió ya dentro de la zona.",
  },
  {
    id: "m4",
    conector: "After that,",
    texto: "we walked along the Avenue of the Dead for two kilometers.",
    pista: "«After that» encadena con lo anterior: primero la explicación del guía, después el recorrido.",
  },
  {
    id: "m5",
    conector: "While we were eating our lunch,",
    texto: "it suddenly started to rain.",
    pista: "Esta es la única oración con una interrupción: «While + past continuous» pide un past simple que la corte.",
  },
  {
    id: "m6",
    conector: "Finally,",
    texto: "we returned home tired but happy.",
    pista: "«Finally» cierra la narración: el regreso es el último momento.",
  },
];

export const CONECTORES_INFO: { conector: string; es: string; uso: string }[] = [
  { conector: "First,", es: "primero", uso: "Abre la secuencia de hechos." },
  { conector: "Then,", es: "luego", uso: "Encadena el siguiente hecho." },
  { conector: "After that,", es: "después de eso", uso: "Igual que Then, pero marca más la relación con lo anterior." },
  { conector: "Later,", es: "más tarde", uso: "Deja pasar tiempo entre un hecho y el siguiente." },
  { conector: "Finally, / In the end,", es: "finalmente / al final", uso: "Cierra la narración." },
  { conector: "While / When", es: "mientras / cuando", uso: "Enlaza el fondo con lo que lo interrumpe." },
];

export const EXPRESIONES_TIEMPO: { en: string; es: string }[] = [
  { en: "last summer / last December", es: "el verano pasado / en diciembre pasado" },
  { en: "two years ago", es: "hace dos años" },
  { en: "in 2023", es: "en 2023" },
  { en: "when I was twelve", es: "cuando tenía doce años" },
  { en: "that morning / that day", es: "esa mañana / ese día" },
  { en: "at the time", es: "en ese momento" },
];

export interface RondaIntruso {
  id: string;
  /** Las cuatro oraciones de la ronda. */
  frases: string[];
  /** Índice de la que rompe el tiempo verbal. */
  intruso: number;
  /** Cómo debería estar escrita. */
  correccion: string;
  /** Por qué, en español. */
  explica: string;
}

export const INTRUSOS: RondaIntruso[] = [
  {
    id: "r1",
    frases: [
      "We left Mexico City at six in the morning.",
      "The bus stopped in Acolman for breakfast.",
      "Our guide speaks about the Pyramid of the Sun.",
      "We arrived at the archaeological zone before nine.",
    ],
    intruso: 2,
    correccion: "Our guide spoke about the Pyramid of the Sun.",
    explica: "«speaks» es presente simple (tercera persona). Toda la narración ocurrió el año pasado, así que va el pasado de speak, que es irregular: spoke.",
  },
  {
    id: "r2",
    frases: [
      "While we were walking, Abril took a photo of the Pyramid of the Moon.",
      "The sun is very strong that morning.",
      "We bought two bottles of water near the entrance.",
      "Our teacher explained the meaning of the murals.",
    ],
    intruso: 1,
    correccion: "The sun was very strong that morning.",
    explica: "«is» es el presente de be, y choca con «that morning», que ya pasó. El pasado de be con sujeto singular es was.",
  },
  {
    id: "r3",
    frases: [
      "After that, we visited the site museum.",
      "Emiliano tried a tlacoyo for the first time.",
      "We will return to school at seven in the evening.",
      "On the bus, we talked about the whole day.",
    ],
    intruso: 2,
    correccion: "We returned to school at seven in the evening.",
    explica: "«will return» es futuro y la excursión ya ocurrió. En una narración pasada se escribe returned (regular: return + -ed).",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * 4 · Modo «Write the verb» — se teclea
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface ItemEscritura {
  id: string;
  /** Texto antes del hueco. */
  antes: string;
  /** Texto después del hueco. */
  despues: string;
  /** Verbo base que se muestra entre paréntesis. */
  base: string;
  respuesta: string;
  alternativas: string[];
  /** Pista en español (se pide con el botón). */
  pista: string;
  /** Explicación en español al resolver o al fallar. */
  explica: string;
}

export const ESCRITURA: ItemEscritura[] = [
  {
    id: "e1",
    antes: "Last July, my cousins and I ",
    despues: " in Puebla for lunch.",
    base: "stop",
    respuesta: "stopped",
    alternativas: [],
    pista: "Una sílaba que acaba en vocal + consonante: algo hay que doblar.",
    explica: "stop → stopped. Se dobla la p porque es un verbo de una sílaba que termina en vocal + consonante. «stoped» cambiaría la pronunciación de la o.",
  },
  {
    id: "e2",
    antes: "While we ",
    despues: " to Oaxaca, the rain started.",
    base: "drive",
    respuesta: "were driving",
    alternativas: [],
    pista: "Después de «while» va la acción larga, la que servía de fondo. Y el sujeto es «we».",
    explica: "were driving. Es el fondo (past continuous) y el sujeto «we» es plural, así que lleva were, no was. En continuous el verbo solo pierde la -e y toma -ing: drive → driving.",
  },
  {
    id: "e3",
    antes: "My little brother ",
    despues: " chapulines for the first time.",
    base: "try",
    respuesta: "tried",
    alternativas: [],
    pista: "Acaba en -y después de consonante. ¿Qué le pasa a esa y?",
    explica: "try → tried. La -y viene después de la consonante r, así que se convierte en i y se añade -ed.",
  },
  {
    id: "e4",
    antes: "At eight o'clock, the band ",
    despues: " in the zócalo when the fireworks began.",
    base: "play",
    respuesta: "was playing",
    alternativas: [],
    pista: "«when the fireworks began» es lo que interrumpe; lo de la banda, entonces, es el fondo. Sujeto singular.",
    explica: "was playing. La banda ya estaba tocando (fondo → past continuous) y los fuegos artificiales la interrumpen (past simple). «the band» es singular: was.",
  },
  {
    id: "e5",
    antes: "We ",
    despues: " in Oaxaca City after four hours on the bus.",
    base: "arrive",
    respuesta: "arrived",
    alternativas: [],
    pista: "El verbo ya termina en -e.",
    explica: "arrive → arrived. Como ya acaba en -e, solo se le añade la -d.",
  },
  {
    id: "e6",
    antes: "I ",
    despues: " a photo of the cempasúchil flowers.",
    base: "take",
    respuesta: "took",
    alternativas: [],
    pista: "Este no sigue ninguna regla: es de los que hay que saberse de memoria.",
    explica: "take → took. Irregular: no existe «taked». Es uno de los cincuenta irregulares más frecuentes del inglés.",
  },
  {
    id: "e7",
    antes: "It ",
    despues: " the first time I saw so many candles together.",
    base: "be",
    respuesta: "was",
    alternativas: [],
    pista: "«It ___ the first time I…» es una fórmula fija para contar algo que hiciste por primera vez.",
    explica: "was. «It was the first time I + past simple» es la expresión que la progresión pide para hablar de una experiencia nueva.",
  },
  {
    id: "e8",
    antes: "We ",
    despues: " to Monte Albán that day because the road was closed.",
    base: "not go",
    respuesta: "did not go",
    alternativas: ["didn't go"],
    pista: "En negativo el pasado lo carga el auxiliar did, no el verbo principal.",
    explica: "did not go (o la contracción didn't go). En las negativas y las preguntas, did lleva el pasado y el verbo vuelve a su forma base: nunca «didn't went».",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * VERBATIM · IN-IV-P01-A1 (lectura)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const LECTURA_A1_TITULO = "A Trip to Remember: Past Simple in Context";

/** Los cinco párrafos de la lectura A1, verbatim (con sus glosas al español). */
export const LECTURA_A1: string[] = [
  "Last year, my family and I traveled (viajamos) to Oaxaca for Día de Muertos. It was an unforgettable experience that I will never forget.",
  "We left (salimos) Mexico City early in the morning. My mother packed (empacó) tamales and pan dulce for the road. After four hours on the bus, we arrived (llegamos) in Oaxaca City. First, we checked into (nos registramos en) a small hotel near the zócalo.",
  "On the evening of November 1st, we walked (caminamos) to the Panteón General cemetery. The atmosphere was (era) incredible. Families decorated (decoraron) the graves with cempasúchil flowers, candles, and photographs. Children and grandparents sat together (se sentaron juntos), talked, and shared food. I saw (vi) colors and lights everywhere.",
  "The next day, we visited (visitamos) the local market. We bought (compramos) colorful alebrijes and tasted (probamos) traditional Oaxacan mole. My little brother tried (probó) chapulines — that is, fried grasshoppers — for the first time. He said (dijo) they were surprisingly delicious!",
  "In the end, we returned (regresamos) home tired but happy. That trip taught (enseñó) me that Día de Muertos is not a sad celebration — it is a beautiful way to remember and honor the people we love.",
];

/** La nota gramatical con la que cierra A1, verbatim. */
export const NOTA_GRAMATICAL_A1 =
  "Grammar note: Notice the verbs in bold. They are all in the PASADO SIMPLE (Past Simple). Regular verbs add -ed (traveled, packed, arrived, decorated, visited). Irregular verbs have special forms (left → left, was → was, saw → saw, bought → bought, said → said, taught → taught). Sequence connectors like First, then, after, and In the end organize the story.";

/** Preguntas de comprensión de A1 con su respuesta guía, verbatim. */
export const PREGUNTAS_A1: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: "¿Cuándo y a dónde viajó la familia del narrador? ¿Por qué eligieron ese lugar?",
    respuesta:
      "Viajaron a Oaxaca durante el Día de Muertos (1 y 2 de noviembre). Eligieron ese lugar para celebrar esta festividad, que es especialmente famosa en Oaxaca por sus tradiciones y decoraciones en los cementerios.",
  },
  {
    pregunta: "Identifica tres verbos irregulares en el texto y escribe su forma base e infinitivo en español.",
    respuesta:
      "Ejemplos: left (base: leave — salir), saw (base: see — ver), bought (base: buy — comprar), said (base: say — decir), taught (base: teach — enseñar). Los verbos irregulares tienen formas especiales en pasado que no siguen la regla de añadir -ed.",
  },
  {
    pregunta: "¿Qué conectores de secuencia usa el texto para organizar la historia? ¿Para qué sirven?",
    respuesta:
      "El texto usa: First (primero), The next day (al día siguiente), In the end (al final). Estos conectores organizan los eventos en orden cronológico y ayudan al lector a seguir la narración con claridad.",
  },
];

/** Callout «¿Sabías?» de A1, verbatim. */
export const DATO_A1 =
  "México cuenta con más de 120,000 desarrolladores de software activos. Guadalajara —llamada el 'Silicon Valley mexicano'— alberga sedes de IBM, Intel, HP, Oracle y cientos de startups tecnológicas que exportan software al mercado norteamericano y europeo.";

/* ═══════════════════════════════════════════════════════════════════════════
 * VERBATIM · A3 (producción escrita), A5 (glosario), A7 (autoevaluación), A8 (video)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const TU_TURNO_A3 = {
  prompt:
    "Describe un viaje, visita o experiencia que hayas tenido en el pasado. Puede ser una celebración (Día de Muertos, quinceañera, graduación), una excursión escolar, un viaje a otra ciudad o un evento especial.\n\nEscribe en inglés o en español (o los dos). Tu texto debe incluir al menos 5 verbos en pasado (past simple) y al menos 2 conectores de secuencia (first, then, after that, later, finally, in the end). Describe dónde fuiste, qué hiciste, y cómo te sentiste al final.",
  pistas: [
    "Empieza con un tiempo y lugar: 'Last year, I went to...' / 'When I was 12, my family visited...'",
    "Usa verbos irregulares comunes: went (go), saw (see), ate (eat), bought (buy), felt (feel), met (meet), took (take).",
    "Conectores de secuencia: First, we... / Then, we... / After that, ... / Finally, ...",
    "Cierra con una reflexión: 'In the end, it was... because...' / 'That experience taught me that...'",
  ],
  criterios: [
    "Usa al menos 5 verbos en pasado simple (regulares o irregulares) correctamente",
    "Incluye al menos 2 conectores de secuencia en su posición correcta",
    "Describe un lugar, evento o experiencia con detalles específicos",
    "Cierra con una reflexión o evaluación personal de la experiencia",
  ],
  minimo: 80,
};

export const GLOSARIO_A5: { termino: string; definicion: string; ejemplo: string }[] = [
  {
    termino: "past continuous (was/were + -ing)",
    definicion: "Background action ongoing at a moment in the past.",
    ejemplo: "I was studying when my friend knocked on the door.",
  },
  {
    termino: "past simple (interruption)",
    definicion: "A completed action that interrupts a background activity.",
    ejemplo: "While I was reading, the power went out.",
  },
  {
    termino: "It was the first time I...",
    definicion: "Expresión para hablar de una experiencia completamente nueva.",
    ejemplo: "It was the first time I cooked for the whole family.",
  },
  {
    termino: "time expressions (past)",
    definicion: "Marcadores temporales: last year, ago, in 2022, when I was ten.",
    ejemplo: "When I was twelve, I visited the coast for the first time.",
  },
  {
    termino: "while / when",
    definicion: "Conectores de simultaneidad: mientras / cuando.",
    ejemplo: "While we were eating, it suddenly started to snow.",
  },
  {
    termino: "detail expressions",
    definicion: "Frases para añadir detalle: with my family, at the time, right there.",
    ejemplo: "At the time, I was living with my grandparents.",
  },
];

/** Actividad final del glosario A5, verbatim. */
export const CIERRE_A5 =
  "Escribe un párrafo de 5-7 oraciones sobre una experiencia pasada memorable. Incluye past continuous, al menos una expresión de tiempo y el conector 'while' o 'when'.";

/** Criterios de la autoevaluación A7, verbatim. */
export const AUTOEVAL_A7: string[] = [
  "Uso past continuous (was/were + -ing) para describir una acción en progreso en el pasado.",
  "Combino past continuous y past simple para narrar una interrupción ('While I was..., ... happened').",
  "Añado detalle a mis narraciones: lugar, compañía, circunstancias y sentimientos.",
  "Uso marcadores de tiempo (last year, ago, when I was young) para situar la experiencia.",
];

export const AUTOEVAL_A7_CIERRE = "¿Qué experiencia pasada recuerdas bien y ya podrías contar en inglés con detalle?";

export const VIDEO_A8 = {
  titulo: "Bienvenida a Inglés IV / Welcome to English IV",
  descripcion:
    "Presentación general: propósito y temas (experiencias pasadas, preferencias, rutinas y hábitos, consejos) para comunicarte con mayor detalle en inglés.",
  preguntas: [
    "¿Qué tipo de experiencias pasadas podrás narrar con más detalle en inglés?",
    "Escribe una frase sencilla en inglés expresando una preferencia.",
    "En esta UAC aprenderás a narrar experiencias pasadas con mayor conexión y detalle. (Verdadero)",
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
 * VERBATIM · A4 — reto evaluable (True or False)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const QUIZ: QuizEvaluable = {
  titulo: "True or False — Describing past experiences",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "To add detail to a past experience you can mention where it happened, who you were with, and how you felt.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correct: providing context (place, people, feelings) makes past narratives richer and clearer.",
    },
    {
      enunciado: "The expression 'It was the first time I...' is followed by the past simple ('It was the first time I tried sushi').",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correct: 'It was the first time I + past simple' describes a new experience.",
    },
    {
      enunciado: "To say you were in the middle of doing something when another event happened, you use the past simple for both verbs ('I walked when it rained').",
      opciones: ["True", "False"],
      respuestaCorrecta: 1,
      retroalimentacion: "No: use past continuous + past simple: 'I was walking when it started to rain'.",
    },
    {
      enunciado: "'While' introduces a background action in the past continuous ('While I was cooking, the phone rang').",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correct: while + past continuous sets the scene for an interruption.",
    },
    {
      enunciado: "'Last', 'ago', 'in [year]' and 'when I was [age]' are useful time expressions for past narratives.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correct: these markers anchor the experience in a specific past time.",
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Marco teórico de la ficha
 * ═══════════════════════════════════════════════════════════════════════════ */

export const MARCO: string[] = [
  "Narrar una experiencia pasada con detalle no es solo poner los verbos en pasado: es decidir qué era el fondo y qué lo interrumpió, encadenar los hechos con conectores de tiempo y anclar todo a un momento concreto. Esas tres decisiones son las que convierten una lista de acciones en una historia que se entiende.",
  "Past simple: es el tiempo del hecho terminado. Los verbos regulares añaden -ed con tres ajustes de escritura (arrive → arrived si ya acaba en -e; study → studied si la -y va tras consonante; stop → stopped si es una sílaba con vocal + consonante final). Los irregulares no siguen regla y hay que aprendérselos: go → went, see → saw, take → took, buy → bought.",
  "Past continuous: was / were + verbo-ing. Describe lo que YA estaba pasando en un momento del pasado. Se usa como telón de fondo: «I was walking when it started to rain». El fondo va en continuous y lo que lo corta, en past simple. Después de while suele ir el continuous; después de when, el simple.",
  "Grammar note (A1, verbatim): Regular verbs add -ed (traveled, packed, arrived, decorated, visited). Irregular verbs have special forms (left, was, saw, bought, said, taught). Sequence connectors like First, then, after, and In the end organize the story.",
  "Los conectores de secuencia —First, Then, After that, Later, Finally, In the end— y las expresiones de tiempo pasadas —last summer, two years ago, in 2023, when I was twelve— son las que le dicen al que escucha en qué orden pasó todo y cuándo. Sin ellas, la narración se vuelve un montón de frases sueltas.",
  "Una narración es coherente cuando todas sus oraciones comparten el mismo marco temporal. Una sola frase en presente o en futuro rompe el relato y el lector se pierde: es el error más común al escribir en inglés sobre el pasado.",
];

export const DATO_BILINGUE =
  "Día de Muertos está inscrito en la Lista Representativa del Patrimonio Cultural Inmaterial de la Humanidad de la UNESCO desde 2008. Contar en inglés lo que se vive en esos días —una ofrenda, un panteón iluminado, el olor del cempasúchil— es una de las cosas que más piden los visitantes a los guías en Oaxaca, Pátzcuaro y Mixquic.";
