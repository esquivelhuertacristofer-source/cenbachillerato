/**
 * Datos del laboratorio «Hecho, idea y opinión» — LC-I-P03.
 *
 * Progresión: «Analiza en textos de su elección la información, ideas,
 * pensamientos y opiniones, para comprender su sentido.»
 *
 * Qué es VERBATIM de la base de datos (MCCEMS 2025, LC-I·P03):
 *  · MARCO (lectura A1) y DATO_RULFO (callout «¿sabías que?» de A1).
 *  · CATEGORIA_INFO — las descripciones de las tres categorías de A9.
 *  · ENUNCIADOS — los nueve enunciados de A9 con su categoría y su explicación.
 *  · HECHOS — las cinco afirmaciones de A4 (verdadero/falso) con su retro.
 *  · QUIZ — los cinco reactivos de A2 con sus opciones y su retroalimentación.
 *  · DEBATE_A6 — el tema, las posturas y los argumentos guía de A6.
 *
 * Qué escribí yo (y por eso va señalado en la nota al pie del laboratorio):
 *  · TEXTOS — los tres textos que el alumno marca. La progresión pide analizar
 *    «textos de su elección» y no trae ninguno, así que hacían falta. Son
 *    ILUSTRATIVOS: la biblioteca de la colonia Las Águilas y los cuadernos
 *    «Colibrí» son ficticios (marca inventada a propósito, para no poner en
 *    boca de una empresa real una publicidad que no escribió). Los datos
 *    externos que sí aparecen son reales y comprobables: El Llano en llamas
 *    (1953) y Pedro Páramo (1955) de Juan Rulfo, la declaración de García
 *    Márquez sobre Pedro Páramo (ambos verbatim del callout de A1), las 32
 *    entidades federativas de México y la Cámara Nacional de la Industria
 *    Editorial Mexicana (CANIEM).
 *  · MARCAS — las siete oraciones del modo «Caza la marca». La apertura del
 *    Metro de la Ciudad de México en 1969 y la primera Feria Internacional del
 *    Libro de Guadalajara en 1987 son hechos reales.
 *
 * Sin three, sin React: datos puros.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * Las tres categorías (VERBATIM de LC-I-P03-A9)
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Categoria = "informacion" | "idea" | "opinion";

export const CATEGORIAS: Categoria[] = ["informacion", "idea", "opinion"];

export const CATEGORIA_INFO: Record<
  Categoria,
  { titulo: string; descripcion: string; icono: string; color: string; pregunta: string }
> = {
  informacion: {
    titulo: "Información",
    // verbatim A9
    descripcion: "Se puede contrastar con la realidad: una fecha, una cifra, un nombre.",
    icono: "fa-magnifying-glass-chart",
    color: "#38BDF8",
    pregunta: "¿Dónde lo comprobarías?",
  },
  idea: {
    titulo: "Idea",
    // verbatim A9
    descripcion: "Es una interpretación o valoración que el autor construye a partir de información.",
    icono: "fa-lightbulb",
    color: "#A78BFA",
    pregunta: "¿Otro autor podría leer los mismos datos de otra forma?",
  },
  opinion: {
    titulo: "Opinión",
    // verbatim A9
    descripcion: "Expresa la postura personal de quien escribe y no se puede verificar objetivamente.",
    icono: "fa-comment-dots",
    color: "#FBBF24",
    pregunta: "¿Hay una palabra que califique o que proponga lo que conviene?",
  },
};

/** Lo que se le dice al alumno cuando marca con el lente equivocado. */
export const ERROR_POR_LENTE: Record<Categoria, string> = {
  informacion:
    "Para ser información tendría que poder contrastarse con una fuente concreta. Pregúntate dónde lo comprobarías: si la respuesta es «en ningún lado», no es información.",
  idea: "Una idea interpreta datos: explica, relaciona o da un sentido a hechos que sí existen. Si el enunciado sólo da el dato, o sólo califica, no es una idea.",
  opinion:
    "Una opinión toma postura: califica («la mejor»), propone («deberíamos») o expresa un gusto. Si el enunciado no valora nada, no es una opinión.",
};

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 1 — «Marca el texto»
 * Tres textos ilustrativos escritos para este laboratorio (ver cabecera).
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Proposito = "informar" | "convencer" | "ambas";

export interface Segmento {
  id: string;
  texto: string;
  categoria: Categoria;
  /** Por qué es de esa categoría. Se muestra al acertar. */
  explicacion: string;
}

export interface TextoAnalizable {
  id: string;
  titulo: string;
  genero: string;
  icono: string;
  /** Línea de crédito honesta: quién firma (ficticio) y dónde se publicaría. */
  credito: string;
  segmentos: Segmento[];
  proposito: Proposito;
  explicacionProposito: string;
}

export const PROPOSITO_INFO: Record<Proposito, { titulo: string; icono: string }> = {
  informar: { titulo: "Informar", icono: "fa-circle-info" },
  convencer: { titulo: "Convencer", icono: "fa-bullhorn" },
  ambas: { titulo: "Las dos cosas", icono: "fa-scale-balanced" },
};

export const TEXTOS: TextoAnalizable[] = [
  {
    id: "biblioteca",
    titulo: "Una biblioteca en la plaza",
    genero: "Nota informativa",
    icono: "fa-newspaper",
    credito: "Texto ilustrativo · gaceta escolar (ficticia)",
    segmentos: [
      {
        id: "bib-1",
        texto: "El pasado 7 de septiembre abrió la biblioteca comunitaria de la colonia Las Águilas.",
        categoria: "informacion",
        explicacion: "Una fecha y un lugar: basta acudir o consultar el acta de apertura para comprobarlo.",
      },
      {
        id: "bib-2",
        texto: "El acervo inicial es de 1,200 libros donados por vecinos de la colonia.",
        categoria: "informacion",
        explicacion: "Es una cantidad contable: se verifica en el inventario de la biblioteca.",
      },
      {
        id: "bib-3",
        texto: "Abrirá de lunes a viernes, de 9:00 a 19:00 horas.",
        categoria: "informacion",
        explicacion: "Un horario concreto: basta ir a la puerta para comprobarlo.",
      },
      {
        id: "bib-4",
        texto: "La sala infantil ocupa la mitad del espacio, según el proyecto entregado a la alcaldía.",
        categoria: "informacion",
        explicacion: "El dato viene atribuido a un documento: se puede pedir el proyecto y revisarlo.",
      },
      {
        id: "bib-5",
        texto: "La cercanía de estos espacios explica que cada vez más jóvenes del barrio se acerquen a leer.",
        categoria: "idea",
        explicacion: "Parte de datos reales, pero la relación de causa que propone es una interpretación del autor.",
      },
      {
        id: "bib-6",
        texto: "Una biblioteca a pie de calle cambia la relación de un barrio con la lectura.",
        categoria: "idea",
        explicacion: "Es una lectura de los hechos: otro autor podría interpretar lo mismo de otra manera.",
      },
    ],
    proposito: "informar",
    explicacionProposito:
      "Predomina la información verificable: fecha, cifra, horario y una fuente documental. Las dos ideas interpretan esos datos, pero el texto no te pide que tomes partido ni califica nada.",
  },
  {
    id: "rulfo",
    titulo: "Rulfo en el salón",
    genero: "Columna de opinión",
    icono: "fa-feather-pointed",
    credito: "Texto ilustrativo · los datos sobre Juan Rulfo son reales",
    segmentos: [
      {
        id: "rul-1",
        texto: "Juan Rulfo publicó El Llano en llamas en 1953 y Pedro Páramo en 1955.",
        categoria: "informacion",
        explicacion: "Dos títulos y dos años: se comprueban en cualquier catálogo editorial o biblioteca.",
      },
      {
        id: "rul-2",
        texto: "Gabriel García Márquez afirmó que Pedro Páramo le enseñó cómo se podía escribir.",
        categoria: "informacion",
        explicacion:
          "Cuidado con este: lo que García Márquez dijo es una opinión suya, pero QUE LO DIJO es un hecho documentado. La declaración se verifica.",
      },
      {
        id: "rul-3",
        texto: "Con apenas dos libros, Rulfo cambió la forma de narrar en América Latina.",
        categoria: "idea",
        explicacion: "Interpreta la influencia de una obra: se apoya en hechos, pero la conclusión es del autor.",
      },
      {
        id: "rul-4",
        texto: "Pedro Páramo es la mejor novela que se ha escrito en México.",
        categoria: "opinion",
        explicacion: "«La mejor» es un juicio de gusto: depende de quien lo dice y no hay forma de verificarlo.",
      },
      {
        id: "rul-5",
        texto: "Leer a Rulfo es más urgente que leer a cualquier autor de moda.",
        categoria: "opinion",
        explicacion: "Establece una jerarquía de valor entre lecturas: no existe una medida de «urgencia» que la compruebe.",
      },
      {
        id: "rul-6",
        texto: "La brevedad de su obra explica que se lea completa en un semestre.",
        categoria: "idea",
        explicacion: "Propone una causa; otro profesor podría explicar lo mismo por el programa de estudios.",
      },
      {
        id: "rul-7",
        texto: "Deberíamos leer Pedro Páramo antes de salir del bachillerato.",
        categoria: "opinion",
        explicacion: "Un verbo de deber: propone lo que conviene, no describe lo que ocurre.",
      },
    ],
    proposito: "convencer",
    explicacionProposito:
      "El texto tiene datos, pero los usa como apoyo: su columna vertebral son dos juicios de valor y una propuesta. Quiere que compartas su postura, no sólo que te enteres.",
  },
  {
    id: "anuncio",
    titulo: "Cuadernos Colibrí",
    genero: "Anuncio publicitario",
    icono: "fa-tag",
    credito: "Texto ilustrativo · «Colibrí» es una marca inventada para esta práctica",
    segmentos: [
      {
        id: "anu-1",
        texto: "Cada cuaderno Colibrí tiene 100 hojas de papel reciclado.",
        categoria: "informacion",
        explicacion: "Una cifra y un material: se cuentan las hojas y se lee la etiqueta del producto.",
      },
      {
        id: "anu-2",
        texto: "Su precio de lista es de 38 pesos.",
        categoria: "informacion",
        explicacion: "Un precio publicado: se contrasta en el mostrador de cualquier papelería.",
      },
      {
        id: "anu-3",
        texto: "Se vende en papelerías de las 32 entidades del país.",
        categoria: "informacion",
        explicacion: "El número de entidades es un dato constitucional y la cobertura se comprueba en la lista de distribuidores.",
      },
      {
        id: "anu-4",
        texto: "Usar papel reciclado convierte cada apunte en una decisión ambiental.",
        categoria: "idea",
        explicacion: "Interpreta el gesto de comprar: le atribuye un sentido que el dato por sí solo no tiene.",
      },
      {
        id: "anu-5",
        texto: "Es el cuaderno que todo estudiante merece.",
        categoria: "opinion",
        explicacion: "«Merece» valora: el anuncio decide por ti lo que te conviene y eso no se puede verificar.",
      },
      {
        id: "anu-6",
        texto: "Con Colibrí, tus apuntes se ven mejor.",
        categoria: "opinion",
        explicacion: "«Mejor» sin término de comparación ni medida: es una promesa, no un dato.",
      },
    ],
    proposito: "ambas",
    explicacionProposito:
      "La publicidad informa (precio, material, dónde se vende) y a la vez persuade (te dice lo que mereces). Por eso el debate de esta progresión tiene dos posturas defendibles: «selecciona sólo lo positivo del producto» y «permite comparar opciones antes de comprar».",
  },
];

export const TOTAL_SEGMENTOS = TEXTOS.reduce((n, t) => n + t.segmentos.length, 0);

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 2 — «Clasifica los enunciados» (VERBATIM de LC-I-P03-A9)
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface Enunciado {
  id: string;
  texto: string;
  categoria: Categoria;
  explicacion: string;
}

/** Los nueve enunciados de A9, con su categoría y su explicación verbatim. */
export const ENUNCIADOS: Enunciado[] = [
  {
    id: "e1",
    texto: "México tiene 32 entidades federativas.",
    categoria: "informacion",
    explicacion: "Es un dato que se puede comprobar en la Constitución: se contrasta y se verifica.",
  },
  {
    id: "e2",
    texto: "El sismo del 19 de septiembre de 2017 tuvo magnitud 7.1.",
    categoria: "informacion",
    explicacion: "Una cifra registrada por el Servicio Sismológico Nacional: verificable.",
  },
  {
    id: "e3",
    texto: "La biblioteca de la escuela abre de 8 a 14 horas.",
    categoria: "informacion",
    explicacion: "Un horario concreto: basta ir a la puerta para comprobarlo.",
  },
  {
    id: "e4",
    texto: "El aumento de bibliotecas públicas explica la mejora en los hábitos de lectura.",
    categoria: "idea",
    explicacion: "Parte de datos reales, pero la relación de causa que propone es una interpretación del autor.",
  },
  {
    id: "e5",
    texto: "La migración transformó la economía de las comunidades del occidente del país.",
    categoria: "idea",
    explicacion: "Es una lectura de los hechos: otro autor podría interpretar los mismos datos distinto.",
  },
  {
    id: "e6",
    texto: "Las redes sociales cambiaron la forma en que los jóvenes construyen su identidad.",
    categoria: "idea",
    explicacion: "Interpreta un fenómeno observable, pero la conclusión es del autor, no del dato.",
  },
  {
    id: "e7",
    texto: "Leer novelas es mucho más valioso que ver series.",
    categoria: "opinion",
    explicacion: "Establece una jerarquía de valor personal: no hay forma de verificarla.",
  },
  {
    id: "e8",
    texto: "La mejor música mexicana es la de los años setenta.",
    categoria: "opinion",
    explicacion: "'La mejor' es un juicio de gusto: depende de quien lo dice.",
  },
  {
    id: "e9",
    texto: "Deberíamos dedicar más horas de clase a la escritura.",
    categoria: "opinion",
    explicacion: "Una propuesta basada en una postura personal sobre lo que conviene.",
  },
];

/** Instrucción verbatim de A9. */
export const INSTRUCCION_A9 =
  "Arrastra cada enunciado a la columna que le corresponde. Si estás en un teléfono, toca primero el enunciado y después la columna.";

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 3 — «Caza la marca»
 * Oraciones escritas para este laboratorio. Los hechos citados son reales:
 * el Metro de la Ciudad de México abrió en 1969 y la Feria Internacional del
 * Libro de Guadalajara celebró su primera edición en 1987.
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface Marca {
  id: string;
  /** La oración partida en palabras (se pinta una por una, y se hace clic). */
  palabras: string[];
  /** Índices que se dan por buenos (una marca puede tener varias palabras). */
  marcas: number[];
  /** true cuando la oración NO valora: es información verificable. */
  sinMarca: boolean;
  /** Qué tipo de marca es (para el rótulo). */
  tipo: string;
  porque: string;
  /** Cómo se diría sin valorar. Vacío en las oraciones sin marca. */
  reescritura: string;
}

export const MARCAS: Marca[] = [
  {
    id: "m1",
    palabras: ["La", "mejor", "música", "mexicana", "es", "la", "de", "los", "años", "setenta."],
    marcas: [1],
    sinMarca: false,
    tipo: "Superlativo",
    porque: "«Mejor» compara y jerarquiza sin ninguna medida que pueda comprobarse: es la marca de opinión más frecuente.",
    reescritura: "«La música mexicana de los años setenta es la que más escucho.» Ahora habla de ti, y eso sí se puede comprobar en tu historial.",
  },
  {
    id: "m2",
    palabras: ["Deberíamos", "dedicar", "más", "horas", "de", "clase", "a", "la", "escritura."],
    marcas: [0],
    sinMarca: false,
    tipo: "Verbo de deber",
    porque: "«Deberíamos», «hay que», «tendríamos que»: proponen lo que conviene. Expresan una postura, no describen un hecho.",
    reescritura: "«El programa de Lengua y Comunicación I dedica tres horas semanales a la escritura.» Eso se consulta en el plan de estudios.",
  },
  {
    id: "m3",
    palabras: ["El", "Metro", "de", "la", "Ciudad", "de", "México", "abrió", "en", "1969."],
    marcas: [],
    sinMarca: true,
    tipo: "Sin marca",
    porque: "No hay ninguna palabra que valore: hay un nombre propio y una fecha. Se contrasta con la fuente y queda comprobado.",
    reescritura: "",
  },
  {
    id: "m4",
    palabras: ["El", "insoportable", "ruido", "del", "tráfico", "arruina", "la", "ciudad."],
    marcas: [1, 5],
    sinMarca: false,
    tipo: "Adjetivo y verbo valorativos",
    porque: "«Insoportable» y «arruina» miden con el gusto de quien escribe, no con un instrumento.",
    reescritura: "«El ruido del tráfico supera los 70 decibeles en la avenida.» Eso se mide con un sonómetro.",
  },
  {
    id: "m5",
    palabras: ["Leer", "novelas", "es", "mucho", "más", "valioso", "que", "ver", "series."],
    marcas: [3, 4, 5],
    sinMarca: false,
    tipo: "Comparación de valor",
    porque: "«Mucho más valioso» establece una jerarquía: no existe una unidad para medir el valor de una lectura.",
    reescritura: "«Leer novelas y ver series desarrollan habilidades distintas.» Así se convierte en una idea discutible, no en un veredicto.",
  },
  {
    id: "m6",
    palabras: ["La", "Feria", "Internacional", "del", "Libro", "de", "Guadalajara", "se", "celebra", "cada", "año", "desde", "1987."],
    marcas: [],
    sinMarca: true,
    tipo: "Sin marca",
    porque: "Nombre propio y fecha: basta consultar el archivo de la feria. Ningún adjetivo la califica.",
    reescritura: "",
  },
  {
    id: "m7",
    palabras: ["Este", "es,", "sin", "duda,", "el", "libro", "más", "importante", "del", "año."],
    marcas: [2, 3, 6, 7],
    sinMarca: false,
    tipo: "Certeza fingida y superlativo",
    porque: "«Sin duda» finge una certeza que no demuestra y «más importante» jerarquiza: dos marcas de opinión en una sola línea.",
    reescritura:
      "«Este libro fue el más vendido del año según la Cámara Nacional de la Industria Editorial Mexicana.» Ahora hay quién lo dice y con qué dato.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Reto evaluable — VERBATIM de LC-I-P03-A2
 * ═══════════════════════════════════════════════════════════════════════════ */

export const QUIZ = {
  titulo: "Identificando el tipo de contenido textual",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál de estos enunciados es una información verificable?",
      opciones: [
        "La película fue entretenida",
        "El volcán Popocatépetl tiene 5,452 metros de altitud",
        "Creo que debería llover menos",
        "Las matemáticas son más difíciles que la biología",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Una cifra geográfica es información verificable con fuentes confiables.",
    },
    {
      enunciado: "¿Cuál de estos enunciados es una opinión?",
      opciones: [
        "El partido terminó 2-1",
        "La novela fue publicada en 1967",
        "Ese político es el mejor gobernante del país",
        "La temperatura bajó 5 grados ayer",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "Afirmar que alguien es 'el mejor' es una valoración personal, no un hecho verificable.",
    },
    {
      enunciado: "Un lector crítico ante una noticia debe preguntarse:",
      opciones: [
        "Si el texto está bien redactado",
        "Solo si le gusta el tema",
        "Quién lo escribió, con qué propósito y qué evidencia presenta",
        "Si la letra es legible",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "La lectura crítica implica cuestionar la autoría, el propósito y la evidencia del texto.",
    },
    {
      enunciado: "¿Por qué es importante distinguir información de opiniones?",
      opciones: [
        "Para aprobar exámenes",
        "Para no aceptar todo como verdad absoluta y leer críticamente",
        "Porque las opiniones son siempre falsas",
        "Solo es importante en contextos académicos",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Distinguir información de opiniones permite leer críticamente y no dejarse manipular.",
    },
    {
      enunciado: "¿Cuál de estos es un ejemplo de idea (interpretación)?",
      opciones: [
        "La ciudad tiene 3 millones de habitantes",
        "El texto fue escrito en 2020",
        "La pobreza es resultado de malas decisiones personales",
        "La temperatura promedio es 18°C",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "Atribuir la pobreza a decisiones personales es una interpretación ideológica, no un hecho.",
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Hechos — VERBATIM de LC-I-P03-A4 (verdadero / falso)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const HECHOS: { enunciado: string; verdadero: boolean; retro: string }[] = [
  {
    enunciado: '"El agua hierve a 100 °C a nivel del mar" es una información verificable.',
    verdadero: true,
    retro: "Correcto: es un dato que puede comprobarse.",
  },
  {
    enunciado: '"Esta es la mejor película de la historia" es una información verificable.',
    verdadero: false,
    retro: "Falso: es una opinión, una valoración personal que no se puede comprobar objetivamente.",
  },
  {
    enunciado: "Un lector crítico acepta todo lo que lee como verdad absoluta.",
    verdadero: false,
    retro: "Falso: un lector crítico cuestiona la autoría, el propósito y la evidencia del texto.",
  },
  {
    enunciado: "Distinguir información de opiniones es especialmente importante en la era digital.",
    verdadero: true,
    retro: "Correcto: en redes circulan mezclados textos de todo tipo, algunos sesgados o falsos.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Marco teórico y contexto (VERBATIM de LC-I-P03-A1 y A6)
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Los tres párrafos de la lectura A1, verbatim. */
export const MARCO: string[] = [
  "Cuando leemos un texto, no todos los elementos que encontramos son del mismo tipo. Algunos textos buscan informarnos sobre hechos y datos verificables; otros nos comparten la opinión de su autor; y otros mezclan información, ideas personales e incluso argumentos para persuadirnos.",
  "La información es aquello que puede contrastarse con la realidad: una fecha, una cifra, el nombre de un lugar. Las ideas son interpretaciones o valoraciones que hace el autor a partir de información. Las opiniones van un paso más allá: expresan la postura personal de quien escribe, a menudo sin que sea posible verificarlas objetivamente.",
  "Aprender a distinguir estos tres elementos es fundamental para leer de forma crítica. Un lector crítico no acepta todo lo que lee como verdad absoluta: se pregunta quién escribió el texto, con qué propósito, qué evidencia presenta y qué no dice. Esta habilidad es especialmente importante en la era digital, donde textos de todo tipo circulan mezclados en redes sociales y plataformas de información.",
];

/** Callout «¿sabías que?» de A1, verbatim. */
export const DATO_RULFO =
  "Juan Rulfo escribió toda su obra con sólo dos libros: El Llano en llamas (1953) y Pedro Páramo (1955). A pesar de su brevedad, su influencia en la narrativa latinoamericana es comparable a la de Borges. Gabriel García Márquez afirmó que Pedro Páramo le enseñó cómo se podía escribir.";

/** Debate A6, verbatim (tema, posturas y argumentos guía). */
export const DEBATE_A6 = {
  tema: "¿La publicidad de productos puede considerarse información objetiva o es persuasión?",
  posturas: [
    {
      postura: "La publicidad es sobre todo persuasión: busca convencernos de comprar.",
      argumentos: ["Selecciona solo lo positivo del producto.", "Usa emociones e imágenes para influir en la decisión."],
    },
    {
      postura: "La publicidad también informa: nos da datos reales sobre los productos.",
      argumentos: ["Incluye precio, características y usos.", "Permite comparar opciones antes de comprar."],
    },
  ],
};

/** Las tres pistas de la reflexión escrita A3, verbatim. */
export const PISTAS_A3: string[] = [
  "¿Hay datos con números, fechas o nombres que puedas verificar?",
  "¿El autor interpreta o valora algo? ¿Expresa una postura personal?",
  "¿Te parece que quiere informarte, convencerte o ambas cosas?",
];

export const FUENTE = "LC-I-P03 · Lengua y Comunicación I, MCCEMS 2025 (actividades A1, A2, A3, A4, A5, A6 y A9).";
