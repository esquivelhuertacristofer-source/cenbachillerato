/**
 * Datos del laboratorio «Anatomía de una exposición oral» — LC-I-P08.
 *
 * Progresión: «Identifica las características de una exposición oral para
 * conocer su desarrollo y ponerlo en práctica.» (Lengua y Comunicación I,
 * 1.er semestre.)
 *
 * EL ÁNGULO DE ESTE LABORATORIO. Ya existe en la plataforma un laboratorio de
 * exposición oral (`exposicion-oral`, LC-III-P07) que enseña los FORMATOS
 * —coloquio, simposio y foro— y empareja conceptos con definiciones. Este es
 * otro acto: aquí se abre la exposición por dentro. El alumno la MONTA pieza
 * por pieza y comprueba qué se rompe cuando falta una, reparte el tiempo
 * contra un reloj hasta descubrir que el desarrollo se come el cierre, decide
 * qué apoyo visual sirve en cada momento y diagnostica exposiciones ajenas.
 * No se repasa una lista de características: se construye el objeto.
 *
 * QUÉ ES VERBATIM Y QUÉ NO — el laboratorio lo declara al pie y el alumno
 * tiene derecho a saberlo:
 *   · VERBATIM de la base de datos (LC-I-P08): la lectura A1 (marco teórico,
 *     el callout «¿Sabías?» y sus preguntas de comprensión), el quiz A2
 *     (`RETO_QUIZ`), la consigna y las pistas de A3 (`CONSIGNA_A3`), los cinco
 *     enunciados verdadero/falso de A4 (`HECHOS`), el glosario A5 (`GLOSARIO`,
 *     que A9 vuelve a pedir en forma de columnas), el texto con huecos A6
 *     (archivo `anatomia-exposicion-huecos.ts`) y el debate A7 (`DEBATE`).
 *   · ESCRITO PARA ESTE LABORATORIO (ilustrativo): el guion de las siete
 *     piezas (`PIEZAS`) y su exposición de demostración sobre el cuidado del
 *     agua —el tema que el Producto Integrador de la materia propone como
 *     ejemplo—, los dos escenarios del reloj (`ESCENARIOS_TIEMPO`) y sus
 *     bandas recomendadas, las cinco decisiones de apoyo visual (`APOYOS`) y
 *     los cuatro casos de la clínica (`CLINICA`). Son situaciones verosímiles
 *     de un bachillerato mexicano, sin personas ni instituciones reales, y
 *     cada una desarrolla algo que la propia progresión enuncia.
 *
 * Sin three ni React: datos puros.
 */

import type { QuizEvaluable } from "./_reto-quiz";

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 1 — Mesa de montaje: el guion, pieza por pieza
 *
 * La lectura A1 dice que la exposición se organiza en «introducción,
 * desarrollo y conclusión», y A3 pide exactamente «el título, la introducción
 * (3-4 oraciones), los 3 puntos principales del desarrollo y la conclusión».
 * Eso es la anatomía: aquí se monta en el orden en que tendría que ocurrir y
 * después se le quita cada pieza para ver qué se cae sin ella.
 *
 * El ejemplo que recorre el modo es una exposición de tres minutos sobre el
 * cuidado del agua en la colonia: el tema que el Producto Integrador de la
 * materia pone como primer ejemplo de «un tema que le importe a tu comunidad».
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Parte = "introduccion" | "desarrollo" | "conclusion" | "despues";

export const PARTE_INFO: Record<Parte, { titulo: string; subtitulo: string; icono: string }> = {
  introduccion: {
    titulo: "Introducción",
    subtitulo: "Parte inicial que presenta el tema y capta la atención del público.",
    icono: "fa-door-open",
  },
  desarrollo: {
    titulo: "Desarrollo",
    subtitulo: "Parte central donde se explican los puntos principales del tema.",
    icono: "fa-layer-group",
  },
  conclusion: {
    titulo: "Conclusión",
    subtitulo: "Parte final que retoma lo más importante y cierra la exposición.",
    icono: "fa-flag-checkered",
  },
  despues: {
    titulo: "Después del cierre",
    subtitulo: "El momento en que el público toma la palabra. No está en el guion escrito, pero sí en la exposición real.",
    icono: "fa-hand",
  },
};

export interface PiezaGuion {
  id: string;
  /** Posición en el guion (0 es la primera). */
  orden: number;
  parte: Parte;
  nombre: string;
  /** Qué hace esa pieza dentro de la exposición. */
  funcion: string;
  /** Cómo suena en la exposición de demostración (agua en la colonia). */
  ejemplo: string;
  /** Lo que se rompe si esa pieza falta. */
  falta: string;
  icono: string;
}

export const PIEZAS: PiezaGuion[] = [
  {
    id: "apertura",
    orden: 0,
    parte: "introduccion",
    nombre: "Apertura: el gancho",
    funcion: "La primera frase, pensada para que la audiencia decida escucharte: una pregunta o un dato sorprendente.",
    ejemplo: "«¿Cuánta agua crees que se va por la llave que gotea en tu cocina mientras dura esta exposición?»",
    falta: "Sin gancho la audiencia entra fría. Los primeros segundos se gastan en conseguir la atención que no pediste, y esos segundos ya no se recuperan: el tema empieza cuando la mitad del salón todavía no está contigo.",
    icono: "fa-fish-fins",
  },
  {
    id: "tema",
    orden: 1,
    parte: "introduccion",
    nombre: "Tema y propósito",
    funcion: "Di de qué vas a hablar y para qué: la idea que quieres que el público se lleve al salir.",
    ejemplo: "«Hoy quiero mostrarles que en nuestra colonia se puede ahorrar agua sin gastar un peso.»",
    falta: "Sin propósito la exposición parece una colección de datos sueltos. El público no sabe hacia dónde va ni qué se supone que debe recordar, así que no recuerda nada.",
    icono: "fa-bullseye",
  },
  {
    id: "punto1",
    orden: 2,
    parte: "desarrollo",
    nombre: "Punto 1 · de dónde viene",
    funcion: "La primera idea principal, con su evidencia y su apoyo visual. Es el piso sobre el que se paran las demás.",
    ejemplo: "El recorrido del agua hasta la colonia, con un mapa sencillo proyectado.",
    falta: "El desarrollo arranca a media idea. Los puntos siguientes dan por sabido algo que nunca se explicó y el público se pierde justo cuando empieza lo importante.",
    icono: "fa-1",
  },
  {
    id: "punto2",
    orden: 3,
    parte: "desarrollo",
    nombre: "Punto 2 · dónde se pierde",
    funcion: "La segunda idea principal: otra idea, no la misma dicha con otras palabras.",
    ejemplo: "Los usos de la casa donde más agua se va, con una gráfica de barras.",
    falta: "La exposición se queda corta y repetitiva: A3 pide tres puntos distintos en el desarrollo, y uno solo obliga a estirar la misma idea hasta que se nota.",
    icono: "fa-2",
  },
  {
    id: "punto3",
    orden: 4,
    parte: "desarrollo",
    nombre: "Punto 3 · qué podemos hacer",
    funcion: "La tercera idea principal, la que convierte el tema en algo que el público puede usar.",
    ejemplo: "Tres medidas que cualquier casa puede aplicar esta semana, en una lista corta.",
    falta: "El tema queda diagnosticado pero sin salida. El público se va sabiendo cuál es el problema y sin la menor idea de qué hacer con esa información.",
    icono: "fa-3",
  },
  {
    id: "cierre",
    orden: 5,
    parte: "conclusion",
    nombre: "Cierre",
    funcion: "Retoma lo más importante y cierra el tema con una frase que se pueda repetir.",
    ejemplo: "«Si cada casa cierra la llave mientras se enjabona, la colonia ahorra sin gastar un peso.»",
    falta: "La exposición no termina: se apaga. El público se queda esperando algo más y el expositor acaba diciendo «bueno… ya», que es la peor última frase posible.",
    icono: "fa-flag-checkered",
  },
  {
    id: "preguntas",
    orden: 6,
    parte: "despues",
    nombre: "Turno de preguntas",
    funcion: "El público pregunta y tú respondes con lo que sabes del tema, no con lo que memorizaste del guion.",
    ejemplo: "«¿Alguien quiere preguntar algo o contar qué hacen en su casa para no desperdiciar agua?»",
    falta: "Nadie comprueba si de verdad dominas el tema, y tú pierdes lo único que la audiencia te puede dar: sus dudas. Quien memorizó se descubre aquí, en la primera pregunta fuera del guion.",
    icono: "fa-hand",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 2 — El reloj: repartir el tiempo entre las partes
 *
 * A3 pide «una mini-exposición oral de 3 minutos»: ese es el primer escenario,
 * y es verbatim. El segundo (10 minutos en equipo) está escrito para este
 * laboratorio porque el reparto solo se entiende cuando cambia la duración.
 *
 * Las bandas recomendadas son un CRITERIO DE ESTE LABORATORIO, no un dato de
 * la progresión: reparten el tiempo de modo que el desarrollo sea la parte
 * central (A5: «parte central donde se explican los puntos principales») sin
 * dejar sin aire a la introducción ni a la conclusión, que la lectura A1
 * considera igual de obligatorias.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type BloqueId = "apertura" | "desarrollo" | "cierre" | "preguntas";

export interface BloqueTiempo {
  id: BloqueId;
  nombre: string;
  /** Porcentaje mínimo y máximo recomendado del tiempo total. */
  min: number;
  max: number;
  icono: string;
  porque: string;
}

export const BLOQUES: BloqueTiempo[] = [
  {
    id: "apertura",
    nombre: "Introducción",
    min: 8,
    max: 18,
    icono: "fa-door-open",
    porque: "Lo justo para enganchar y decir el propósito. Si se alarga, el público ya se enteró del tema y todavía no oye nada nuevo.",
  },
  {
    id: "desarrollo",
    nombre: "Desarrollo (3 puntos)",
    min: 50,
    max: 70,
    icono: "fa-layer-group",
    porque: "Es la parte central: aquí van las tres ideas con su evidencia. Menos de la mitad del tiempo deja el tema sin explicar; más de siete décimas se come lo que viene después.",
  },
  {
    id: "cierre",
    nombre: "Conclusión",
    min: 8,
    max: 18,
    icono: "fa-flag-checkered",
    porque: "Cerrar toma tiempo: hay que retomar lo importante y rematar. Un cierre de cinco segundos no cierra nada.",
  },
  {
    id: "preguntas",
    nombre: "Preguntas",
    min: 10,
    max: 25,
    icono: "fa-hand",
    porque: "Si no reservas este rato, el turno de preguntas no existe: se lo comió el desarrollo.",
  },
];

export interface EscenarioTiempo {
  id: string;
  nombre: string;
  segundos: number;
  /** Paso de los deslizadores, en segundos. */
  paso: number;
  nota: string;
}

export const ESCENARIOS_TIEMPO: EscenarioTiempo[] = [
  {
    id: "mini",
    nombre: "Mini-exposición de 3 minutos",
    segundos: 180,
    paso: 5,
    nota: "La que pide A3, verbatim: «Planifica una mini-exposición oral de 3 minutos sobre un tema que domines».",
  },
  {
    id: "equipo",
    nombre: "Exposición de equipo de 10 minutos",
    segundos: 600,
    paso: 10,
    nota: "Escenario de este laboratorio: la duración típica de una exposición de equipo en clase.",
  },
];

/**
 * Ritmo de referencia para estimar cuántas palabras caben en un tiempo.
 *
 * ILUSTRATIVO, no es un dato de la progresión: al hablar en público en español
 * el ritmo cómodo va más o menos de 120 a 150 palabras por minuto (por debajo
 * suena lento; por encima, atropellado). El laboratorio calcula con 130 para
 * que el alumno vea que en tres minutos caben unas cuatrocientas palabras:
 * poco más de una cuartilla, no el ensayo entero.
 */
export const PALABRAS_POR_MINUTO = 130;

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 3 — ¿Qué apoyo sirve para este momento?
 *
 * A5 define el apoyo visual como «recurso como diapositivas o mapas mentales
 * que refuerza el mensaje oral», y su ejemplo es «una diapositiva con una
 * imagen y palabras clave». A3 y el Producto Integrador piden decidir «qué
 * apoyo visual usarías». Este modo es esa decisión, cinco veces, con la razón
 * de por qué los otros dos apoyos no sirven ahí.
 *
 * Los cinco momentos y sus opciones están escritos para este laboratorio.
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface OpcionApoyo {
  txt: string;
  porque: string;
}

export interface CasoApoyo {
  id: string;
  momento: string;
  detalle: string;
  opciones: OpcionApoyo[];
  /** Índice de la opción que sí sirve. */
  correcta: number;
  icono: string;
}

export const APOYOS: CasoApoyo[] = [
  {
    id: "ap-gancho",
    momento: "Abrir con el gancho",
    detalle: "Tu primera frase es una pregunta sobre el agua que se desperdicia. ¿Qué proyectas detrás?",
    icono: "fa-fish-fins",
    opciones: [
      {
        txt: "Una sola imagen grande: la llave goteando, sin texto",
        porque: "Sirve: la imagen sostiene la pregunta sin competir con tu voz. El apoyo refuerza el mensaje oral, no lo sustituye.",
      },
      {
        txt: "Tu introducción completa escrita en la diapositiva",
        porque: "No sirve: si está escrita, el público la lee más rápido de lo que la dices y deja de mirarte. Además te empuja a leer de espaldas, y ahí se acaba el contacto visual.",
      },
      {
        txt: "Un video de tres minutos sobre la crisis del agua",
        porque: "No sirve aquí: en una exposición de tres minutos el video ES la exposición. El apoyo no puede ocupar el tiempo que te toca a ti.",
      },
    ],
    correcta: 0,
  },
  {
    id: "ap-tiempo",
    momento: "Mostrar cómo cambió algo con los años",
    detalle: "Vas a explicar cómo fue cambiando el servicio de agua en la colonia desde que se fundó.",
    icono: "fa-timeline",
    opciones: [
      {
        txt: "Un mapa mental con el tema en el centro",
        porque: "No sirve para esto: el mapa mental ordena ideas que se relacionan entre sí, pero no tiene manera de mostrar qué pasó antes y qué después.",
      },
      {
        txt: "Una línea del tiempo con cuatro momentos marcados",
        porque: "Sirve: lo que estás explicando es una secuencia, y la línea del tiempo es la forma visual de una secuencia. El público ve de un golpe el antes y el después.",
      },
      {
        txt: "Un objeto real: una cubeta de las que se usaban antes",
        porque: "El objeto llama la atención, pero por sí solo no dice cuándo ni en qué orden. Puede acompañar la línea del tiempo; no puede reemplazarla.",
      },
    ],
    correcta: 1,
  },
  {
    id: "ap-comparar",
    momento: "Comparar tres cantidades",
    detalle: "Quieres que se vea cuál de los tres usos de la casa gasta más agua.",
    icono: "fa-chart-simple",
    opciones: [
      {
        txt: "Decir las tres cifras en voz alta, una tras otra",
        porque: "No basta: el oído no retiene tres números seguidos. Para el público la tercera cifra borra la primera y la comparación se pierde.",
      },
      {
        txt: "Un cartel escrito a mano con las cifras en letra pequeña",
        porque: "No sirve: desde la tercera fila nadie lo lee. Un apoyo que no se ve completo desde el fondo del salón no es un apoyo.",
      },
      {
        txt: "Una gráfica de barras con los tres usos",
        porque: "Sirve: comparar cantidades es exactamente lo que hace una gráfica de barras. La diferencia se ve antes de que termines la frase.",
      },
    ],
    correcta: 2,
  },
  {
    id: "ap-relacion",
    momento: "Explicar cómo se relacionan las partes del tema",
    detalle: "Necesitas mostrar que el consumo en casa, las fugas de la red y la lluvia son tres piezas del mismo problema.",
    icono: "fa-diagram-project",
    opciones: [
      {
        txt: "Un mapa mental: el problema al centro y las tres ramas",
        porque: "Sirve: A5 nombra el mapa mental como apoyo visual, y su trabajo es justo este, enseñar de un vistazo cómo cuelgan las partes de una misma idea.",
      },
      {
        txt: "Una lista de veinte viñetas con todo lo que sabes",
        porque: "No sirve: veinte viñetas no muestran relaciones, muestran un montón. El público las lee en lugar de escucharte y sigue sin ver cómo encajan.",
      },
      {
        txt: "Una gráfica de barras con los tres factores",
        porque: "No sirve para esto: la gráfica compara tamaños, no explica de qué manera un factor se conecta con otro.",
      },
    ],
    correcta: 0,
  },
  {
    id: "ap-cierre",
    momento: "Cerrar la exposición",
    detalle: "Es la última diapositiva. La que se queda proyectada mientras hablas por última vez.",
    icono: "fa-flag-checkered",
    opciones: [
      {
        txt: "Una diapositiva de «Gracias por su atención», sin nada más",
        porque: "Desperdicia el mejor momento: es la imagen que más tiempo se queda en pantalla y no dice nada del tema.",
      },
      {
        txt: "La idea final en una frase, con la imagen del inicio",
        porque: "Sirve: retoma lo más importante, cierra el círculo con el gancho del principio y le deja al público una sola cosa que recordar.",
      },
      {
        txt: "Todas las diapositivas del desarrollo otra vez, en resumen",
        porque: "No sirve: repetir el desarrollo no es concluir. La conclusión retoma lo esencial, no lo vuelve a exponer entero.",
      },
    ],
    correcta: 1,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * CLÍNICA — diagnosticar exposiciones ajenas
 *
 * Cuatro exposiciones descritas por escrito, cada una con un defecto que la
 * propia progresión nombra: el tiempo mal repartido, el apoyo que sustituye al
 * mensaje, la falta de propósito y la memorización. Los nombres son ficticios;
 * las situaciones, verosímiles de un salón de bachillerato.
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface CasoClinica {
  id: string;
  relato: string;
  opciones: string[];
  correcta: number;
  retro: string;
}

export const CLINICA: CasoClinica[] = [
  {
    id: "cl-tiempo",
    relato: "Ana tenía tres minutos. A los tres y medio seguía en su segundo punto; cuando el maestro le avisó, dijo «ah, bueno, y ya, esas eran mis ideas» y se sentó.",
    opciones: [
      "Le faltó investigar el tema",
      "El desarrollo se comió el tiempo del cierre",
      "No usó ningún apoyo visual",
      "Habló demasiado bajo",
    ],
    correcta: 1,
    retro: "El desarrollo se comió el cierre. No es un problema de contenido, es de reparto: si los tres puntos ocupan todo el tiempo, la conclusión desaparece, y la exposición termina sin terminar.",
  },
  {
    id: "cl-leer",
    relato: "Luis proyectó seis diapositivas con todo su texto y las leyó de principio a fin, de frente a la pantalla y de espaldas al grupo.",
    opciones: [
      "Perdió el contacto visual y dejó que el apoyo sustituyera su mensaje",
      "Sus diapositivas tenían pocos colores",
      "Eligió un tema difícil",
      "Se pasó de tiempo",
    ],
    correcta: 0,
    retro: "Dos cosas a la vez: el contacto visual transmite seguridad y conecta con el público (A1), y el apoyo visual refuerza el mensaje oral (A5), no lo reemplaza. Leer la diapositiva de espaldas rompe las dos.",
  },
  {
    id: "cl-proposito",
    relato: "Mariana dio tres datos interesantes sobre el agua, bien dichos y bien apoyados. Al terminar, un compañero preguntó: «oye, ¿y qué nos querías decir con eso?».",
    opciones: [
      "Le faltaron apoyos visuales",
      "Habló demasiado rápido",
      "Faltó el propósito: los datos no apuntaban a ninguna idea",
      "No saludó al público",
    ],
    correcta: 2,
    retro: "Sin tema y propósito enunciados, los datos no forman una exposición: forman una lista. La introducción existe justamente para decir de qué se va a hablar y hacia dónde va todo lo que sigue.",
  },
  {
    id: "cl-memoria",
    relato: "Pedro se aprendió su exposición palabra por palabra y la dijo completa, sin equivocarse. En la primera pregunta del grupo se quedó callado.",
    opciones: [
      "Practicó demasiado",
      "Confundió practicar con memorizar",
      "Su tema no servía",
      "Le faltó una conclusión",
    ],
    correcta: 1,
    retro: "Verbatim de A4: «practicar es ensayar para ganar fluidez y controlar el tiempo, no memorizar literalmente». El guion memorizado aguanta hasta la primera pregunta que no estaba en el guion.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * GLOSARIO — LC-I-P08-A5, verbatim (los mismos pares que A9 pide relacionar)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const GLOSARIO: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-planeacion",
    termino: "Planeación",
    definicion: "Etapa de definir el tema, investigar y seleccionar la información relevante.",
    ejemplo: "Elegir el tema y buscar fuentes antes de exponer.",
  },
  {
    id: "gl-introduccion",
    termino: "Introducción",
    definicion: "Parte inicial que presenta el tema y capta la atención del público.",
    ejemplo: "Empezar con una pregunta o un dato sorprendente.",
  },
  {
    id: "gl-desarrollo",
    termino: "Desarrollo",
    definicion: "Parte central donde se explican los puntos principales del tema.",
    ejemplo: "Exponer las tres ideas clave del tema.",
  },
  {
    id: "gl-conclusion",
    termino: "Conclusión",
    definicion: "Parte final que retoma lo más importante y cierra la exposición.",
    ejemplo: "Resumir las ideas y cerrar con una reflexión.",
  },
  {
    id: "gl-apoyo",
    termino: "Apoyo visual",
    definicion: "Recurso como diapositivas o mapas mentales que refuerza el mensaje oral.",
    ejemplo: "Una diapositiva con una imagen y palabras clave.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * HECHOS — LC-I-P08-A4, verbatim
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface Hecho {
  enunciado: string;
  respuesta: boolean;
  retro: string;
}

export const HECHOS: Hecho[] = [
  {
    enunciado: "La planificación es la primera etapa de una exposición oral.",
    respuesta: true,
    retro: "Correcto: primero se define el tema, se investiga y se selecciona la información.",
  },
  {
    enunciado: "Una exposición oral no necesita introducción ni conclusión.",
    respuesta: false,
    retro: "Falso: toda exposición debe tener introducción, desarrollo y conclusión.",
  },
  {
    enunciado: "El contacto visual con el público transmite seguridad.",
    respuesta: true,
    retro: "Correcto: mirar a la audiencia genera conexión y confianza.",
  },
  {
    enunciado: "Las diapositivas y los mapas mentales son recursos de apoyo para exponer.",
    respuesta: true,
    retro: "Correcto: son apoyos visuales que organizan y refuerzan el mensaje.",
  },
  {
    enunciado: "Practicar una exposición significa memorizarla palabra por palabra.",
    respuesta: false,
    retro: "Falso: practicar es ensayar para ganar fluidez y controlar el tiempo, no memorizar literalmente.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * DEBATE — LC-I-P08-A7, verbatim
 * ═══════════════════════════════════════════════════════════════════════════ */

export const DEBATE = {
  tema: "¿Es mejor preparar una exposición de forma individual o en equipo?",
  reglas: [
    "Defiende tu postura con al menos dos argumentos.",
    "Propón en qué situaciones conviene cada forma.",
  ],
  minimoPalabras: 25,
  posturas: [
    {
      id: "individual",
      texto: "Es mejor individual, porque hay más control sobre el contenido y el tiempo.",
      guia: [
        "No dependes de que otros cumplan su parte.",
        "El estilo y el mensaje son coherentes.",
      ],
    },
    {
      id: "equipo",
      texto: "Es mejor en equipo, porque se reparte el trabajo y se enriquece con varias ideas.",
      guia: [
        "Cada integrante aporta su fortaleza.",
        "Se practica la colaboración y la coordinación.",
      ],
    },
  ],
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
 * A3 — consigna de la reflexión escrita, verbatim (se cita en el modo del reloj)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const CONSIGNA_A3 = {
  titulo: "Planifico mi primera exposición oral",
  prompt:
    "Planifica una mini-exposición oral de 3 minutos sobre un tema que domines (puede ser una afición, un lugar que conoces, algo que aprendiste). Escribe: el título, la introducción (3-4 oraciones), los 3 puntos principales del desarrollo y la conclusión (2-3 oraciones). Explica qué apoyos visuales usarías.",
  pistas: [
    "La introducción debe presentar el tema y captar la atención del oyente",
    "Cada punto del desarrollo debe desarrollar una idea diferente",
    "La conclusión retoma lo más importante y cierra el tema",
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
 * LECTURA A1 — preguntas de comprensión y callout, verbatim
 * ═══════════════════════════════════════════════════════════════════════════ */

export const COMPRENSION_A1: { pregunta: string; guia: string }[] = [
  {
    pregunta: "¿Cuáles son las fases de una exposición oral según el texto?",
    guia: "Planificación, organización, preparación de apoyos y práctica.",
  },
  {
    pregunta: "¿Qué elementos no verbales importan durante la exposición?",
    guia: "Contacto visual, voz segura y postura corporal.",
  },
  {
    pregunta: "¿Por qué el texto dice que preparar exposiciones desarrolla confianza?",
    guia: "Porque al dominar el tema y practicar, uno gana seguridad para comunicarse frente a otros.",
  },
];

/** Callout «¿Sabías?» de la lectura A1, verbatim. */
export const DATO_FIL =
  "México es el cuarto país hispanohablante con mayor producción editorial en español. La Feria Internacional del Libro de Guadalajara (FIL) es la más grande del mundo en lengua española, con más de 800,000 visitantes anuales y más de 2,000 editoriales participantes.";

/* ═══════════════════════════════════════════════════════════════════════════
 * RETO EVALUABLE — LC-I-P08-A2, verbatim (5 reactivos, mínimo 70 %)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const RETO_QUIZ: QuizEvaluable = {
  titulo: "Elementos de la exposición oral",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál es la primera fase en la preparación de una exposición oral?",
      opciones: [
        "Practicar frente al espejo",
        "Planificación: definir el tema e investigar",
        "Diseñar las diapositivas",
        "Hablar improvisadamente",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La planificación es el primer paso: definir el tema, investigar y seleccionar información.",
    },
    {
      enunciado: "¿Qué estructura básica debe tener una exposición oral?",
      opciones: [
        "Introducción y conclusión únicamente",
        "Solo el desarrollo del tema",
        "Introducción, desarrollo y conclusión",
        "Un listado de puntos sin estructura",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "Toda exposición formal tiene introducción (presenta el tema), desarrollo (lo explica) y conclusión (lo cierra).",
    },
    {
      enunciado: "¿Por qué el contacto visual con el público es importante durante una exposición?",
      opciones: [
        "Para ver si el público está dormido",
        "Para conectar con la audiencia y transmitir seguridad",
        "Para leer las diapositivas proyectadas",
        "No es importante",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "El contacto visual genera conexión con el público y transmite confianza en lo que se dice.",
    },
    {
      enunciado: "¿Qué significa 'practicar' una exposición antes de presentarla?",
      opciones: [
        "Memorizarla palabra por palabra",
        "Ensayarla varias veces para familiarizarse con el contenido y el tiempo",
        "Solo leer las diapositivas",
        "Pedirle a alguien más que la presente",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Practicar significa ensayar para ganar fluidez, controlar el tiempo y reducir nervios.",
    },
    {
      enunciado: "¿Qué transmite una postura corporal segura durante la exposición?",
      opciones: [
        "Que el expositor sabe todo",
        "Confianza y dominio del tema al público",
        "Que el texto está memorizado",
        "Que no hay nervios",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Una postura erguida y abierta comunica confianza y refuerza el mensaje verbal.",
    },
  ],
};
