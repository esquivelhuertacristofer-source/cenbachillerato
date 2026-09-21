/**
 * Datos del laboratorio «Leer y escribir: un diálogo» — LC-I-P01.
 *
 * Progresión: «Reflexiona sobre los vínculos entre la escritura y la lectura
 * para dar sentido a la necesidad humana por comunicar información, ideas,
 * pensamientos u opiniones.» (Lengua y Comunicación I, 1.er semestre.)
 *
 * QUÉ ES VERBATIM Y QUÉ NO — esto importa, porque el laboratorio lo declara al
 * pie y el alumno tiene derecho a saberlo:
 *   · VERBATIM de la base de datos: la lectura A1 (marco teórico y el dato del
 *     INALI), el quiz A2 (`RETO_QUIZ`), los cinco enunciados verdadero/falso de
 *     A4 (`HECHOS`), el glosario A5 (`GLOSARIO`), el texto con huecos A6
 *     (archivo `lectura-escritura-huecos.ts`), la reflexión escrita A3
 *     (`CUADERNO`) y el debate A7 (`DEBATE`).
 *   · ILUSTRATIVO, escrito para este laboratorio: los tres circuitos de
 *     `CIRCUITOS` y los doce textos de `TEXTOS`. Son situaciones verosímiles de
 *     un bachillerato mexicano —ninguna persona ni institución real— y cada una
 *     desarrolla una idea que la lectura A1 sí enuncia: que leer alimenta a la
 *     escritura, que escribir transforma la manera de leer, que un texto
 *     literario invita a imaginar mundos posibles, que uno informativo pide
 *     capacidad crítica, que el diario ayuda a procesar emociones y que la
 *     lengua sirve para transformar la realidad.
 *
 * Sin three ni React: datos puros.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — El circuito del sentido
 *
 * La afirmación central de la progresión no es que leer y escribir se parezcan,
 * sino que se ALIMENTAN: «la lectura alimenta a la escritura y la escritura
 * transforma nuestra manera de leer». Eso solo se ve en el tiempo, así que el
 * alumno reconstruye tres situaciones completas paso a paso y observa cómo se
 * alternan los dos actos hasta cerrar el circuito.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Acto = "leer" | "escribir";

export const ACTO_INFO: Record<Acto, { label: string; icono: string; color: string }> = {
  leer: { label: "Leer", icono: "fa-book-open-reader", color: "#4FC3F7" },
  escribir: { label: "Escribir", icono: "fa-pen-nib", color: "#FFB74D" },
};

export interface PasoCircuito {
  id: string;
  acto: Acto;
  texto: string;
  /** Por qué ese paso va donde va: la retroalimentación que explica el vínculo. */
  porque: string;
}

export interface Circuito {
  id: string;
  titulo: string;
  /** Situación de partida, para que el orden tenga sentido. */
  contexto: string;
  /** Qué queda demostrado al cerrarlo. */
  cierre: string;
  pasos: PasoCircuito[];
}

export const CIRCUITOS: Circuito[] = [
  {
    id: "calle",
    titulo: "La calle sin alumbrado",
    contexto:
      "En tu colonia hay una calle que lleva meses a oscuras. Vas a escribir una carta para pedir que la reparen.",
    cierre:
      "Cerraste el circuito de una práctica social: leíste para enterarte, leíste para informarte, escribiste, releíste lo tuyo con ojos ajenos y volviste a escribir. La lengua sirvió para transformar algo real.",
    pasos: [
      {
        id: "calle-1",
        acto: "leer",
        texto: "Lees en el grupo vecinal que dos personas se cayeron esta semana en la calle oscura.",
        porque:
          "Todo empieza por una lectura: si nadie lee lo que ocurre, no hay nada que escribir. Leer aquí es enterarse.",
      },
      {
        id: "calle-2",
        acto: "leer",
        texto: "Buscas en la página del municipio a qué oficina se dirigen las solicitudes vecinales y con qué datos.",
        porque:
          "La lectura alimenta a la escritura: sin este paso no sabrías a quién escribir ni qué información incluir.",
      },
      {
        id: "calle-3",
        acto: "escribir",
        texto: "Escribes un borrador con los hechos, la petición concreta y un teléfono de contacto.",
        porque:
          "Escribir es crear significado para que otra persona lo lea. El borrador no es el texto final: es el texto puesto a prueba.",
      },
      {
        id: "calle-4",
        acto: "leer",
        texto: "Relees tu borrador como si fueras quien lo va a recibir en la ventanilla: ¿se entiende qué pides?",
        porque:
          "Leer lo propio poniéndose en el lugar del otro es empatía aplicada, y es lo que convierte un borrador en una carta.",
      },
      {
        id: "calle-5",
        acto: "escribir",
        texto: "Escribes la versión final, la imprimen y la firman las vecinas y los vecinos de la cuadra.",
        porque:
          "La escritura transformó la manera de leer la situación: ya no es una queja, es una solicitud firmada por muchas personas.",
      },
    ],
  },
  {
    id: "diario",
    titulo: "El diario de una semana difícil",
    contexto:
      "Discutiste con tu mejor amiga y no sabes bien qué sentiste. Abres el cuaderno donde nadie más va a leer.",
    cierre:
      "Cerraste el circuito íntimo: escribir ayudó a procesar la emoción, releer mostró lo que no habías visto y la lectura de un cuento ajeno te dio palabras nuevas para volver a escribir.",
    pasos: [
      {
        id: "diario-1",
        acto: "escribir",
        texto: "Escribes de corrido, sin pensarlo mucho, todo lo que sentiste el día de la discusión.",
        porque:
          "Aquí el circuito arranca al revés: se escribe antes de tener claro qué se piensa. Escribir un diario ayuda a procesar emociones y experiencias.",
      },
      {
        id: "diario-2",
        acto: "leer",
        texto: "Relees lo que escribiste y notas que repites una misma palabra: «injusto».",
        porque:
          "Releerse es leer a un autor que ya no eres del todo. La repetición te dice algo que en el momento no sabías.",
      },
      {
        id: "diario-3",
        acto: "leer",
        texto: "Buscas un cuento sobre una amistad rota y lo lees completo de una sentada.",
        porque:
          "El texto literario invita a imaginar mundos posibles; aquí ese mundo posible se parece bastante al tuyo y te presta palabras.",
      },
      {
        id: "diario-4",
        acto: "escribir",
        texto: "Escribes otra entrada: los mismos hechos, pero contados desde el punto de vista de tu amiga.",
        porque:
          "Escribir desde otro punto de vista obliga a imaginar lo que la otra persona siente: la escritura fortalece la empatía.",
      },
      {
        id: "diario-5",
        acto: "leer",
        texto: "Lees las dos entradas juntas, una después de la otra, y entiendes algo que antes no veías.",
        porque:
          "La escritura transformó tu manera de leer el conflicto. Ese es el vínculo completo: ninguna de las dos prácticas basta sola.",
      },
    ],
  },
  {
    id: "comunidad",
    titulo: "La exposición sobre tu comunidad",
    contexto:
      "Tu equipo investiga la historia del barrio y en dos semanas tienen que exponerla frente al grupo.",
    cierre:
      "Cerraste el circuito escolar: leer varias fuentes, escribir lo que comparten, escribir para decirlo, leerlo en voz alta y reescribir lo que la voz no aguanta.",
    pasos: [
      {
        id: "comunidad-1",
        acto: "leer",
        texto: "Lees tres textos sobre el barrio: un folleto del municipio, una nota de periódico y una entrada de blog.",
        porque:
          "Investigar es leer más de una fuente. Comparar textos distintos sobre el mismo hecho es lo que activa la capacidad crítica.",
      },
      {
        id: "comunidad-2",
        acto: "escribir",
        texto: "Escribes en tu cuaderno las ideas que aparecen en los tres textos y las que solo aparecen en uno.",
        porque:
          "Escribir lo leído no es copiarlo: es decidir qué se sostiene y qué no. La escritura ordena el pensamiento.",
      },
      {
        id: "comunidad-3",
        acto: "escribir",
        texto: "Escribes el guion de la exposición con una idea por tarjeta y un ejemplo para cada una.",
        porque:
          "Aquí se escribe pensando en quien va a escuchar: el destinatario cambia el texto antes de que exista.",
      },
      {
        id: "comunidad-4",
        acto: "leer",
        texto: "Lees el guion en voz alta, con el cronómetro, y marcas dónde se te acaba el aire.",
        porque:
          "La lectura en voz alta vuelve audible el texto: lo que en el papel parecía correcto, dicho se enreda.",
      },
      {
        id: "comunidad-5",
        acto: "escribir",
        texto: "Reescribes las frases más largas partidas en dos, para poder decirlas sin tropezar.",
        porque:
          "Leer en voz alta cambió lo que escribiste. Otra vez: la lectura vuelve a alimentar a la escritura, y el circuito sigue.",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — ¿Qué hace este texto?
 *
 * Las cuatro funciones salen, con sus propias palabras, de la lectura A1:
 * «leer un texto literario nos invita a imaginar mundos posibles; leer un
 * artículo informativo nos pide activar nuestra capacidad crítica; escribir un
 * diario personal nos ayuda a procesar emociones y experiencias» y «la usamos
 * para relacionarnos, para aprender, para expresarnos y para transformar
 * nuestra realidad».
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Funcion = "imaginar" | "critica" | "procesar" | "transformar";

export const FUNCION_INFO: Record<
  Funcion,
  { label: string; descripcion: string; icono: string; color: string }
> = {
  imaginar: {
    label: "Imaginar mundos posibles",
    descripcion: "Lo que provoca el texto literario",
    icono: "fa-wand-magic-sparkles",
    color: "#A78BFA",
  },
  critica: {
    label: "Activar la capacidad crítica",
    descripcion: "Lo que exige el texto informativo",
    icono: "fa-magnifying-glass",
    color: "#4FC3F7",
  },
  procesar: {
    label: "Procesar emociones y experiencias",
    descripcion: "Lo que hace la escritura personal",
    icono: "fa-heart",
    color: "#F48FB1",
  },
  transformar: {
    label: "Transformar la realidad",
    descripcion: "Lo que busca la lengua como práctica social",
    icono: "fa-people-group",
    color: "#81C784",
  },
};

export interface TextoCaso {
  id: string;
  texto: string;
  funcion: Funcion;
  porque: string;
}

export const TEXTOS: TextoCaso[] = [
  {
    id: "t-novela",
    texto: "Una novela en la que una joven de Xalapa descubre que puede oír lo que piensan los árboles.",
    funcion: "imaginar",
    porque: "Es literatura: no te pide comprobar si es cierto, te pide entrar en un mundo que no existe y habitarlo.",
  },
  {
    id: "t-cuento",
    texto: "Un cuento de ciencia ficción sobre la primera escuela construida en la Luna.",
    funcion: "imaginar",
    porque: "La ciencia ficción trabaja con mundos posibles: su valor está en lo que te hace figurarte, no en el dato.",
  },
  {
    id: "t-poema",
    texto: "Un poema que compara la lluvia sobre el techo de lámina con una carta que nadie firmó.",
    funcion: "imaginar",
    porque: "La comparación no informa nada: abre una imagen. El texto literario amplía lo que puedes imaginar.",
  },
  {
    id: "t-nota",
    texto: "Una nota de periódico que afirma que el transporte mejoró 40 % y no dice de dónde salió ese número.",
    funcion: "critica",
    porque: "Un dato sin fuente es justo lo que pide capacidad crítica: preguntar quién lo midió, cuándo y cómo.",
  },
  {
    id: "t-divulgacion",
    texto: "Un artículo de divulgación sobre las 68 lenguas nacionales que se hablan hoy en México.",
    funcion: "critica",
    porque: "Es texto informativo: se lee evaluando si las cifras y las fuentes se sostienen, no imaginando.",
  },
  {
    id: "t-remedio",
    texto: "Una publicación en redes que asegura que un té casero cura la gripa en un solo día.",
    funcion: "critica",
    porque: "Promesa grande y evidencia nula: la lectura crítica es la única defensa frente a este tipo de texto.",
  },
  {
    id: "t-diario",
    texto: "La entrada de un diario escrita la noche en que te cambiaste de escuela.",
    funcion: "procesar",
    porque: "Escribir un diario personal ayuda a procesar emociones y experiencias: el destinatario eres tú.",
  },
  {
    id: "t-carta-futuro",
    texto: "Una carta dirigida a ti misma o a ti mismo dentro de cinco años, que guardas en un sobre cerrado.",
    funcion: "procesar",
    porque: "Escribes para ordenar lo que sientes hoy; el acto de escribirlo ya hace su trabajo aunque nadie lo lea.",
  },
  {
    id: "t-despedida",
    texto: "Un texto que escribes para despedirte de tu perro y que no piensas enseñarle a nadie.",
    funcion: "procesar",
    porque: "No busca comunicar ni convencer: busca darle forma a una experiencia difícil. Esa también es una función de escribir.",
  },
  {
    id: "t-carta-municipio",
    texto: "Una carta al ayuntamiento firmada por la cuadra para pedir alumbrado en una calle oscura.",
    funcion: "transformar",
    porque: "Es la lengua usada para actuar: el texto busca que algo cambie fuera del papel.",
  },
  {
    id: "t-reglamento",
    texto: "El reglamento que tu grupo escribe y firma para organizar la limpieza del salón.",
    funcion: "transformar",
    porque: "Un acuerdo escrito y firmado crea obligaciones que antes no existían: la escritura organiza la convivencia.",
  },
  {
    id: "t-convocatoria",
    texto: "Un cartel que convoca a la jornada de limpieza del río el próximo sábado a las 8.",
    funcion: "transformar",
    porque: "Convoca, es decir, mueve gente. La lengua es práctica social porque sirve para transformar la realidad.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — Escribe el término · GLOSARIO VERBATIM (LC-I-P01-A5)
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface ParGlosario {
  id: string;
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const GLOSARIO: ParGlosario[] = [
  {
    id: "g-escritura",
    termino: "Escritura",
    definicion:
      "Práctica de crear significado mediante signos para que otra persona lo lea; desarrolla el pensamiento y la comunicación.",
    ejemplo: "Escribir un diario para ordenar lo que sentimos.",
  },
  {
    id: "g-lectura",
    termino: "Lectura",
    definicion:
      "Práctica de construir significado a partir de las palabras de otra persona; es un diálogo entre contextos.",
    ejemplo: "Leer una novela escrita hace cien años y dialogar con esa época.",
  },
  {
    id: "g-empatia",
    termino: "Empatía",
    definicion:
      "Capacidad de comprender lo que siente o piensa otra persona; la escritura y la lectura la fortalecen.",
    ejemplo: "Leer un testimonio ajeno y entender una vida distinta a la nuestra.",
  },
  {
    id: "g-practica",
    termino: "Práctica social",
    definicion:
      "Uso de la lengua en situaciones reales para relacionarnos, aprender, expresarnos y transformar la realidad.",
    ejemplo: "Escribir una carta para pedir una mejora en la comunidad.",
  },
  {
    id: "g-codigo",
    termino: "Código alfabético",
    definicion: "Sistema que relaciona letras con sonidos; es la base, pero no el límite, de leer y escribir.",
    ejemplo: "Reconocer que la letra 'm' representa un sonido.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 5 — Tu cuaderno · REFLEXIÓN ESCRITA VERBATIM (LC-I-P01-A3)
 *
 * El `prompt` se conserva tal cual está en la base de datos, incluida la forma
 * «escribís» (voseo), que no corresponde al español de México. Es un defecto de
 * contenido reportado, no corregido aquí: el laboratorio no reescribe la base.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const CUADERNO = {
  ancla: "LC-I-P01-A3 · Mi relación personal con leer y escribir",
  prompt:
    "Piensa en tu propia relación con leer y escribir: ¿cuándo lees? ¿qué tipo de textos prefieres? ¿cuándo escribís? ¿cómo se relacionan esas dos actividades en tu vida diaria? Describe al menos una experiencia concreta donde leer algo te llevó a querer escribir, o donde escribir algo te llevó a querer leer más.",
  pistas: [
    "¿Hubo algún libro, artículo o mensaje que te haya inspirado a escribir algo?",
    "¿Escribes mensajes, diarios personales, publicaciones? ¿Qué lees antes de escribir?",
    "¿Cómo crees que mejorarías tu escritura leyendo más?",
  ],
  criterios: [
    "Describe una experiencia personal concreta",
    "Establece una conexión explícita entre leer y escribir",
    "Usa vocabulario del tema estudiado",
    "Redacción coherente y organizada",
  ],
  minimo: 80,
  maximo: 250,
} as const;

/**
 * Raíces que cuentan como «vocabulario del tema estudiado» (criterio 3 de A3).
 *
 * Son raíces y no palabras completas para que «leer», «leo», «leí», «lectura» o
 * «leyendo» cuenten igual: lo que se comprueba es que el alumno escriba sobre
 * el tema con sus palabras, no que copie el glosario. Van ya normalizadas (sin
 * acentos y en minúsculas), como las deja `normaliza`.
 */
export const RAICES_TEMA: { etiqueta: string; raices: string[] }[] = [
  { etiqueta: "leer / lectura", raices: ["lee", "lei", "ley", "lect"] },
  { etiqueta: "escribir / escritura", raices: ["escrib", "escrit"] },
  { etiqueta: "empatía", raices: ["empat"] },
  { etiqueta: "práctica social", raices: ["practica social", "social"] },
  { etiqueta: "código alfabético", raices: ["alfabet", "codigo"] },
  { etiqueta: "significado", raices: ["significad"] },
  { etiqueta: "imaginar", raices: ["imagin"] },
  { etiqueta: "crítica", raices: ["critic"] },
  { etiqueta: "comunicar", raices: ["comunic"] },
  { etiqueta: "texto", raices: ["texto"] },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * DEBATE VERBATIM (LC-I-P01-A7)
 *
 * No hay respuesta correcta: se conserva tal cual y el laboratorio no califica
 * la postura del alumno. Lo que sí se le pide —porque es la tercera regla
 * verbatim de la actividad— es reconocer un punto válido de la postura
 * contraria.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const DEBATE = {
  ancla: "LC-I-P01-A7 · Debate: ¿leer o escribir desarrolla más el pensamiento?",
  tema: "¿Qué desarrolla más el pensamiento crítico: la lectura o la escritura?",
  reglas: [
    "Defiende tu postura con al menos dos argumentos.",
    "Escucha o lee la postura contraria antes de responder.",
    "Cierra reconociendo un punto válido de la otra postura.",
  ],
  criterios: ["Claridad de la postura", "Solidez de los argumentos", "Respeto a la postura contraria"],
  posturas: [
    {
      id: "lectura",
      texto: "La lectura desarrolla más el pensamiento, porque nos expone a ideas y mundos distintos.",
      argumentos: [
        "Leer pone en diálogo nuestro contexto con el del autor.",
        "Sin leer no tendríamos referentes para escribir.",
      ],
    },
    {
      id: "escritura",
      texto: "La escritura desarrolla más el pensamiento, porque nos obliga a organizar y crear ideas propias.",
      argumentos: [
        "Escribir exige estructurar las ideas con claridad.",
        "Al escribir descubrimos lo que realmente pensamos.",
      ],
    },
  ],
  minimoPalabras: 15,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
 * HECHOS VERBATIM (LC-I-P01-A4 · quiz verdadero/falso)
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface Hecho {
  enunciado: string;
  respuesta: boolean;
  retro: string;
}

export const HECHOS: Hecho[] = [
  {
    enunciado: "La escritura sirve únicamente para comunicarnos con otras personas.",
    respuesta: false,
    retro:
      "Falso: la escritura también desarrolla el pensamiento, la empatía y la creación; comunicar es solo una de sus funciones.",
  },
  {
    enunciado:
      "La lectura puede entenderse como un diálogo entre distintos contextos sociales, históricos y culturales.",
    respuesta: true,
    retro: "Correcto: al leer ponemos en contacto el contexto del autor con el nuestro.",
  },
  {
    enunciado: "Leer y escribir son habilidades que se aprenden por separado y no se influyen entre sí.",
    respuesta: false,
    retro: "Falso: la lectura alimenta a la escritura y la escritura transforma nuestra manera de leer.",
  },
  {
    enunciado: "La lectura puede ser un placer individual o compartido.",
    respuesta: true,
    retro: "Correcto: leer no siempre tiene un fin utilitario; también es una fuente de disfrute.",
  },
  {
    enunciado: "La escritura ha contribuido al avance científico al permitir registrar y comunicar el conocimiento.",
    respuesta: true,
    retro: "Correcto: sin la escritura sería imposible acumular y transmitir el saber a lo largo del tiempo.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * RETO EVALUABLE VERBATIM (LC-I-P01-A2 · quiz de opción múltiple, mínimo 70 %)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const RETO_QUIZ = {
  titulo: "¿Cuánto sé sobre escritura y lectura?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cómo se relacionan la lectura y la escritura según la lectura anterior?",
      opciones: [
        "Son prácticas completamente independientes",
        "Se retroalimentan mutuamente",
        "La escritura es más importante que la lectura",
        "Solo se relacionan en la escuela",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Leer y escribir se retroalimentan: la lectura alimenta a la escritura y viceversa.",
    },
    {
      enunciado: "¿Cuál de estos es un ejemplo de texto que activa la imaginación?",
      opciones: ["Un artículo de noticias", "Un manual de instrucciones", "Una novela", "Una factura de servicios"],
      respuestaCorrecta: 2,
      retroalimentacion: "Los textos literarios como las novelas invitan a imaginar mundos posibles.",
    },
    {
      enunciado: "¿Qué propone el Modelo Educativo 2025 respecto a la lengua?",
      opciones: [
        "Aprenderla de forma aislada",
        "Practicarla solo en la escuela",
        "Desarrollarla en situaciones reales y significativas",
        "Memorizarla mediante reglas gramaticales",
      ],
      respuestaCorrecta: 2,
      retroalimentacion:
        "El modelo propone desarrollar la lengua en situaciones reales: investigando, analizando textos, exponiendo.",
    },
    {
      enunciado: "¿Qué significa que la lengua es una práctica social?",
      opciones: [
        "Que solo se usa en grupos grandes",
        "Que la usamos para relacionarnos, aprender y expresarnos",
        "Que está regulada por el gobierno",
        "Que se aprende imitando a los demás sin reflexión",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La lengua es práctica social porque la usamos para relacionarnos, aprender, expresarnos y transformar la realidad.",
    },
    {
      enunciado: "Leer un artículo informativo requiere principalmente:",
      opciones: [
        "Imaginación desbordada",
        "Capacidad crítica",
        "Habilidades de escritura creativa",
        "Memorizar datos exactos",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Los textos informativos demandan activar la capacidad crítica para evaluar la información.",
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Dato verbatim (callout «¿Sabías?» de la lectura LC-I-P01-A1)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const DATO_LENGUAS =
  "México reconoce 68 lenguas nacionales además del español, según el catálogo del INALI (Instituto Nacional de Lenguas Indígenas). Cada una tiene variantes dialectales propias: el náhuatl, por ejemplo, tiene más de 30 variantes distribuidas desde Guerrero hasta Veracruz.";

/** Preguntas de comprensión de la lectura A1, verbatim, con su respuesta guía. */
export const COMPRENSION_A1: { pregunta: string; guia: string }[] = [
  {
    pregunta: "¿Cuál es la relación que el texto establece entre leer y escribir?",
    guia: "Son dos caras de la misma moneda: se retroalimentan mutuamente.",
  },
  {
    pregunta: "Menciona dos funciones de la lectura que se nombran en el texto.",
    guia: "Construir significado, imaginar mundos posibles, activar la capacidad crítica.",
  },
  {
    pregunta: "¿Por qué el texto dice que la lengua es una práctica social?",
    guia: "Porque la usamos para relacionarnos, aprender, expresarnos y transformar la realidad.",
  },
];
