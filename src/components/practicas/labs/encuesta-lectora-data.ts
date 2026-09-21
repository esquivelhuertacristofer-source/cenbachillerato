/**
 * Datos — «La encuesta lectora de tu comunidad» (LC-I-P02).
 *
 * Progresión: «Investiga los gustos y las inclinaciones de las personas de su
 * comunidad escolar respecto de la lectura.»
 *
 * VERBATIM de la base: el glosario de tipos de texto, soporte y formato sale de
 * LC-I-P02-A4; las pistas de entrevista, de LC-I-P02-A3; los hechos V/F, de
 * LC-I-P02-A5; el cuestionario, de LC-I-P02-A2; el callout de autoridades del
 * español, de LC-I-P02-A1.
 *
 * ILUSTRATIVO (dicho en la nota al pie del laboratorio): las nueve personas de
 * la comunidad escolar y sus respuestas son un levantamiento simulado —nombres
 * y testimonios ficticios pero verosímiles— para que el alumno tenga qué
 * tabular. No son datos de una encuesta real y no representan a ninguna escuela.
 *
 * Sin React ni three: datos puros.
 */

/* ═══ Tipos de texto y soportes (glosario VERBATIM de LC-I-P02-A4) ═══════ */

export type TipoTexto = "informativo" | "narrativo" | "digital";
export type Soporte = "papel" | "pantalla" | "calle";

export interface CategoriaInfo {
  label: string;
  corto: string;
  color: string;
  icono: string;
  definicion: string;
  ejemplo: string;
}

export const TIPO_INFO: Record<TipoTexto, CategoriaInfo> = {
  informativo: {
    label: "Texto informativo",
    corto: "Informativo",
    color: "#4FC3F7",
    icono: "fa-newspaper",
    definicion: "Texto que reporta hechos y datos verificables sobre la realidad.",
    ejemplo: "Una noticia o un manual de instrucciones.",
  },
  narrativo: {
    label: "Texto narrativo",
    corto: "Narrativo",
    color: "#FFB74D",
    icono: "fa-book-open-reader",
    definicion: "Texto que relata hechos reales o ficticios a lo largo del tiempo.",
    ejemplo: "Un cuento, una novela o una historia de vida.",
  },
  digital: {
    label: "Texto digital",
    corto: "Digital",
    color: "#BA9BFF",
    icono: "fa-mobile-screen",
    definicion: "Texto que circula en pantallas y plataformas electrónicas.",
    ejemplo: "Una publicación en redes sociales o un blog.",
  },
};

export const SOPORTE_INFO: Record<Soporte, CategoriaInfo> = {
  papel: {
    label: "Papel",
    corto: "Papel",
    color: "#FFD54F",
    icono: "fa-file-lines",
    definicion: "Material o medio físico/electrónico donde aparece el texto.",
    ejemplo: "Periódico, libro, instructivo impreso, etiqueta de un producto.",
  },
  pantalla: {
    label: "Pantalla",
    corto: "Pantalla",
    color: "#4DD0E1",
    icono: "fa-display",
    definicion: "Material o medio físico/electrónico donde aparece el texto.",
    ejemplo: "Celular, computadora, televisión con subtítulos.",
  },
  calle: {
    label: "Cartel en la calle",
    corto: "En la calle",
    color: "#F48FB1",
    icono: "fa-sign-hanging",
    definicion: "Material o medio físico/electrónico donde aparece el texto.",
    ejemplo: "Aviso pegado en la reja, cartel, rótulo de un local.",
  },
};

export const TIPOS: TipoTexto[] = ["informativo", "narrativo", "digital"];
export const SOPORTES: Soporte[] = ["papel", "pantalla", "calle"];

/* ═══ Modo 1 · «Arma la encuesta» ════════════════════════════════════════
 * Doce preguntas candidatas. El alumno decide una por una si entra al
 * cuestionario o se descarta, y recibe el porqué. Seis sirven y seis tienen un
 * defecto que se nombra: inducida, ambigua, cerrada y pobre, doble, invasiva o
 * con un supuesto falso.
 * Las pistas de entrevista de LC-I-P02-A3 («¿qué lee?, ¿cuándo?, ¿para qué?»,
 * «¿cómo aprendió a leer?») son el criterio de lo que sí sirve.
 */

export interface PreguntaCandidata {
  id: string;
  texto: string;
  /** ¿Entra al cuestionario? */
  sirve: boolean;
  /** Etiqueta corta del defecto (solo si no sirve). */
  defecto?: string;
  /** Por qué sirve o por qué falla; se muestra al decidir. */
  porque: string;
  /** Cómo se arreglaría la pregunta defectuosa. */
  arreglo?: string;
}

export const CANDIDATAS: PreguntaCandidata[] = [
  {
    id: "c1",
    texto: "¿Qué fue lo último que leyó, aunque haya sido algo corto?",
    sirve: true,
    porque:
      "Abre la respuesta sin juzgar y sin sugerir qué contestar. El «aunque haya sido algo corto» permite que aparezcan las etiquetas, los mensajes y los avisos, que también son lectura.",
  },
  {
    id: "c2",
    texto: "¿En qué momento del día lee más?",
    sirve: true,
    porque:
      "Es una de las pistas de la entrevista de la actividad A3. Ubica la lectura en la vida diaria: el camión de la mañana, el rato antes de dormir, la hora de la comida.",
  },
  {
    id: "c3",
    texto: "¿Verdad que leer novelas es mucho mejor que estar en TikTok?",
    sirve: false,
    defecto: "Pregunta inducida",
    porque:
      "Ya trae la respuesta metida: quien la escucha entiende cuál es la contestación «correcta» y contesta eso para quedar bien. Además supone una jerarquía que la lectura de la progresión niega: ningún tipo de lectura es más válido que otro.",
    arreglo: "Pregunta neutral: «¿Qué prefiere leer y por qué?».",
  },
  {
    id: "c4",
    texto: "¿Lee más en papel o en pantalla?",
    sirve: true,
    porque:
      "Pregunta por el soporte, es decir, el material o medio donde aparece el texto. Sirve para tabular después y comparar.",
  },
  {
    id: "c5",
    texto: "¿Lee usted?",
    sirve: false,
    defecto: "Cerrada y pobre",
    porque:
      "Se contesta con «sí» o «no» y no revela ningún gusto ni ninguna inclinación. Casi todas las personas contestan «no» aunque lean todos los días recibos, mensajes y letreros, porque creen que «leer» solo significa leer libros.",
    arreglo: "Ábrela: «¿Qué cosas lee en un día normal?».",
  },
  {
    id: "c6",
    texto: "¿Para qué lee: por placer, por trabajo o por necesidad?",
    sirve: true,
    porque:
      "Es otra pista de la entrevista de A3 y apunta al propósito de la lectura, que es lo que de verdad distingue a un lector de otro.",
  },
  {
    id: "c7",
    texto: "¿Cuánto gana usted al mes?",
    sirve: false,
    defecto: "Fuera de tema e invasiva",
    porque:
      "No investiga gustos ni inclinaciones lectoras, y pide un dato privado que incomoda. Una pregunta así hace que la persona se cierre y conteste el resto a medias.",
    arreglo: "Quítala. Si te interesa el contexto, pregunta por el oficio o la actividad.",
  },
  {
    id: "c8",
    texto: "¿Qué tipo de textos prefiere: informativos, narrativos o digitales?",
    sirve: true,
    porque:
      "Usa las categorías del glosario de la progresión y da una respuesta que se puede tabular. Conviene acompañarla de un ejemplo de cada tipo, por si la persona no conoce los términos.",
  },
  {
    id: "c9",
    texto: "¿Le gusta leer, escribir y además escuchar pódcast?",
    sirve: false,
    defecto: "Pregunta doble",
    porque:
      "Pregunta tres cosas a la vez, así que un «sí» no dice a cuál de las tres se refiere. Al tabular no sabrías qué contar.",
    arreglo: "Pártela en tres preguntas, una por cada cosa.",
  },
  {
    id: "c10",
    texto: "¿Lee mucho?",
    sirve: false,
    defecto: "Ambigua",
    porque:
      "«Mucho» significa cosas distintas para cada quien: para alguien es un libro al mes y para otra persona son tres horas de mensajes al día. Dos personas que leen lo mismo contestarían distinto.",
    arreglo: "Hazla medible: «¿Cuántos días de la semana lee algo?».",
  },
  {
    id: "c11",
    texto: "¿Cómo aprendió a leer?",
    sirve: true,
    porque:
      "Es la tercera pista de la entrevista de A3. Trae historias de vida —la maestra, la abuela, el catecismo, la primaria nocturna— y explica de dónde vienen los gustos lectores de hoy.",
  },
  {
    id: "c12",
    texto: "¿Por qué la gente ya no lee nada?",
    sirve: false,
    defecto: "Supuesto falso",
    porque:
      "Da por hecho algo que tu propia investigación va a desmentir. La lectura no ocurre solo en la escuela: ocurre en el trabajo, el hogar, el transporte, las redes sociales y los mercados.",
    arreglo: "Pregunta por los hechos antes de explicarlos: «¿Qué lee y dónde lo lee?».",
  },
];

export const CANDIDATAS_UTILES = CANDIDATAS.filter((c) => c.sirve).length;

/* ═══ Modo 2 · «Levanta los datos» ═══════════════════════════════════════
 * Nueve personas de la comunidad escolar ya contestaron la pregunta abierta.
 * El alumno CODIFICA cada respuesta: le asigna tipo de texto y soporte. Eso es
 * exactamente lo que hace quien sistematiza una encuesta, y de ahí sale la
 * gráfica del modo 3.
 * Personas y testimonios ILUSTRATIVOS (ficticios).
 */

export interface PersonaEncuestada {
  id: string;
  nombre: string;
  rol: string;
  icono: string;
  /** Respuesta textual a «¿Qué lee, cuándo y dónde?». */
  respuesta: string;
  tipo: TipoTexto;
  soporte: Soporte;
  /** Por qué se codifica así; se muestra al acertar. */
  porque: string;
}

export const PERSONAS: PersonaEncuestada[] = [
  {
    id: "p1",
    nombre: "Rosa",
    rol: "Intendencia",
    icono: "fa-broom",
    respuesta:
      "Todas las mañanas leo el periódico que dejan en la entrada: primero los encabezados y luego el pronóstico del clima.",
    tipo: "informativo",
    soporte: "papel",
    porque: "El periódico reporta hechos y datos verificables (informativo) y lo tiene impreso en las manos (papel).",
  },
  {
    id: "p2",
    nombre: "Kevin",
    rol: "Estudiante, 2.º semestre",
    icono: "fa-user-graduate",
    respuesta:
      "Lo que más leo son los subtítulos de las series y los comentarios que la gente deja debajo de los videos.",
    tipo: "digital",
    soporte: "pantalla",
    porque: "Comentarios y subtítulos circulan en plataformas electrónicas (digital) y los lee en una pantalla.",
  },
  {
    id: "p3",
    nombre: "Enrique",
    rol: "Docente de Historia",
    icono: "fa-chalkboard-user",
    respuesta: "Leo novelas históricas en el camión, de ida y de vuelta. Siempre traigo una en la mochila.",
    tipo: "narrativo",
    soporte: "papel",
    porque: "La novela relata hechos a lo largo del tiempo (narrativo) y el libro que carga es de papel.",
  },
  {
    id: "p4",
    nombre: "Carmen",
    rol: "Madre de familia",
    icono: "fa-user",
    respuesta:
      "Leo el instructivo de los medicamentos de mi mamá y las etiquetas de los productos cuando hago el súper.",
    tipo: "informativo",
    soporte: "papel",
    porque:
      "Instructivos y etiquetas dan datos e indicaciones verificables (informativo) y están impresos en la caja o el envase (papel).",
  },
  {
    id: "p5",
    nombre: "Ana Lucía",
    rol: "Biblioteca escolar",
    icono: "fa-book",
    respuesta: "Los muchachos me piden mangas y termino leyéndolos con ellos; me enganchan las historias.",
    tipo: "narrativo",
    soporte: "papel",
    porque: "El manga cuenta una historia en secuencia (narrativo) y el tomo que le prestan es impreso (papel).",
  },
  {
    id: "p6",
    nombre: "Said",
    rol: "Estudiante, 4.º semestre",
    icono: "fa-user-graduate",
    respuesta: "Leo el grupo de WhatsApp del salón y los hilos largos que la gente escribe en redes.",
    tipo: "digital",
    soporte: "pantalla",
    porque: "Mensajes e hilos circulan en plataformas electrónicas (digital) y los lee en el celular (pantalla).",
  },
  {
    id: "p7",
    nombre: "Beto",
    rol: "Vigilancia",
    icono: "fa-user-shield",
    respuesta: "Leo los avisos que pegan en la reja y los carteles de la papelería de enfrente.",
    tipo: "informativo",
    soporte: "calle",
    porque:
      "Un aviso comunica datos verificables (informativo), pero el soporte no es papel de mano ni pantalla: es un cartel en la vía pública.",
  },
  {
    id: "p8",
    nombre: "Paola",
    rol: "Prefectura",
    icono: "fa-clipboard-list",
    respuesta: "Leo las circulares y los reglamentos que llegan al correo de la escuela; a veces tres o cuatro al día.",
    tipo: "informativo",
    soporte: "pantalla",
    porque:
      "Circulares y reglamentos informan (informativo), y aquí llegan al correo: el mismo tipo de texto puede cambiar de soporte.",
  },
  {
    id: "p9",
    nombre: "Ximena",
    rol: "Egresada",
    icono: "fa-user-astronaut",
    respuesta: "Sigo blogs de cocina, y ahí mismo leo la historia que la autora cuenta antes de cada receta.",
    tipo: "digital",
    soporte: "pantalla",
    porque: "El blog es un texto que circula en plataformas electrónicas (digital) y se lee en pantalla.",
  },
];

/** Conteo esperado al terminar la tabulación (sirve para probar la gráfica). */
export function contarPorTipo(personas: PersonaEncuestada[]): Record<TipoTexto, number> {
  const base: Record<TipoTexto, number> = { informativo: 0, narrativo: 0, digital: 0 };
  for (const p of personas) base[p.tipo] += 1;
  return base;
}
export function contarPorSoporte(personas: PersonaEncuestada[]): Record<Soporte, number> {
  const base: Record<Soporte, number> = { papel: 0, pantalla: 0, calle: 0 };
  for (const p of personas) base[p.soporte] += 1;
  return base;
}

/* ═══ Modo 3 · «Lee la gráfica» ══════════════════════════════════════════
 * Preguntas de interpretación sobre la gráfica que el propio alumno acaba de
 * producir. Las respuestas corresponden a la tabulación completa de las nueve
 * personas: informativo 4 · narrativo 2 · digital 3; papel 4 · pantalla 4 ·
 * cartel en la calle 1.
 */

export interface PreguntaGrafica {
  id: string;
  enunciado: string;
  opciones: string[];
  correcta: number;
  explica: string;
}

export const LECTURA_GRAFICA: PreguntaGrafica[] = [
  {
    id: "g1",
    enunciado: "Según tu gráfica, ¿cuál es el tipo de texto más frecuente entre las nueve personas?",
    opciones: ["El narrativo", "El informativo", "El digital", "Los tres aparecen igual"],
    correcta: 1,
    explica:
      "Informativo aparece 4 veces (Rosa, Carmen, Beto y Paola), digital 3 y narrativo 2. Leer instructivos, etiquetas, circulares y avisos también es leer, aunque nadie lo llame «lectura».",
  },
  {
    id: "g2",
    enunciado: "¿Qué soporte predomina en la muestra?",
    opciones: [
      "El papel, claramente",
      "La pantalla, claramente",
      "Ninguno: el papel y la pantalla empatan con 4",
      "El cartel en la calle",
    ],
    correcta: 2,
    explica:
      "Cuatro personas leen en papel y cuatro en pantalla; el cartel en la calle aparece una vez. Cuando dos barras miden lo mismo, la gráfica no te autoriza a decir que una le gana a la otra.",
  },
  {
    id: "g3",
    enunciado: "Una compañera escribe esta conclusión: «En mi escuela ya nadie lee». ¿Es válida con estos datos?",
    opciones: [
      "Sí, porque solo dos personas leen novelas",
      "Sí, porque la mayoría solo ve pantallas",
      "No: las nueve personas leen algo; lo que cambia es qué leen y dónde",
      "No se puede saber: falta preguntarles la edad",
    ],
    correcta: 2,
    explica:
      "Ninguna fila quedó vacía: todas las personas leen. La lectura ocurre en el trabajo, el hogar, el transporte, las redes sociales y los mercados. Y aunque alguien no leyera, nueve personas no representan a toda la escuela.",
  },
  {
    id: "g4",
    enunciado: "Carmen solo lee instructivos de medicamentos y etiquetas del súper. ¿Dónde queda en tu tabla?",
    opciones: [
      "En ninguna parte: eso no cuenta como lectura",
      "En textos narrativos, porque cuenta algo",
      "En textos informativos: reportan datos e indicaciones verificables",
      "En textos digitales, porque hoy todo está en internet",
    ],
    correcta: 2,
    explica:
      "Un instructivo y una etiqueta reportan hechos y datos verificables sobre la realidad: eso es un texto informativo. Ningún tipo de lectura es más válido que otro; lo que cambia es el propósito.",
  },
  {
    id: "g5",
    enunciado: "Tu gráfica dice CUÁNTAS personas leen cada tipo de texto. ¿Qué es lo que NO te dice?",
    opciones: [
      "Cuántas personas leen en pantalla",
      "Por qué cada persona lee lo que lee",
      "Cuál es el tipo de texto más frecuente",
      "Cuántas personas contestaron la encuesta",
    ],
    correcta: 1,
    explica:
      "Una gráfica de frecuencias cuenta casos, no explica motivos. Para el porqué hay que volver con las personas y preguntarles: es justo lo que pide la entrevista de la actividad A3 («¿lee por placer, por trabajo, por necesidad?»).",
  },
];

/* ═══ Cuestionario evaluable — VERBATIM de LC-I-P02-A2 ═══════════════════ */

export const QUIZ = {
  titulo: "Comunidad lectora: ¿qué sabemos?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿En cuáles de los siguientes espacios ocurre la lectura según el texto?",
      opciones: [
        "Solo en la escuela y la biblioteca",
        "En el trabajo, hogar, transporte y redes sociales",
        "Solo en espacios formales",
        "Exclusivamente en textos académicos",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La lectura ocurre en múltiples contextos: trabajo, hogar, transporte, redes y más.",
    },
    {
      enunciado: "¿Qué tipo de texto es una noticia de periódico?",
      opciones: ["Narrativo", "Digital", "Informativo", "Poético"],
      respuestaCorrecta: 2,
      retroalimentacion: "Las noticias son textos informativos que reportan hechos verificables.",
    },
    {
      enunciado: "Al investigar hábitos lectores de la comunidad, ¿qué habilidades se desarrollan?",
      opciones: [
        "Solo ortografía",
        "Formular preguntas, escuchar y sistematizar información",
        "Memorización de textos",
        "Escritura creativa únicamente",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La investigación comunitaria desarrolla habilidades de indagación, escucha activa y organización de datos.",
    },
    {
      enunciado: "¿Cuál es la postura del texto respecto a los distintos tipos de lectura?",
      opciones: [
        "Los textos académicos son más valiosos",
        "La lectura en papel es superior a la digital",
        "Ningún tipo de lectura es más válido que otro",
        "Los textos narrativos son los más importantes",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "El texto afirma que no existen jerarquías entre tipos de lectura: todos son válidos.",
    },
    {
      enunciado: "¿Qué es un texto narrativo?",
      opciones: [
        "Un artículo con datos estadísticos",
        "Una publicación en redes sociales",
        "Una novela, cuento o historia de vida",
        "Un manual de instrucciones",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "Los textos narrativos son cuentos, novelas e historias de vida que relatan eventos.",
    },
  ],
};

/* ═══ Hechos — VERBATIM de LC-I-P02-A5 (verdadero / falso) ═══════════════ */

export const HECHOS: { enunciado: string; respuesta: boolean; retroalimentacion: string }[] = [
  {
    enunciado: "La lectura solo ocurre en la escuela y en la biblioteca.",
    respuesta: false,
    retroalimentacion: "Falso: leemos en el trabajo, el hogar, el transporte, las redes y los mercados.",
  },
  {
    enunciado: "Existen jerarquías que hacen que unos tipos de lectura sean más válidos que otros.",
    respuesta: false,
    retroalimentacion: "Falso: ningún tipo de lectura es más válido que otro; depende del propósito.",
  },
  {
    enunciado: "Las etiquetas de productos y los mensajes de WhatsApp también son textos que leemos a diario.",
    respuesta: true,
    retroalimentacion: "Correcto: la lectura cotidiana incluye muchos textos breves y prácticos.",
  },
  {
    enunciado: "Investigar los hábitos lectores de la comunidad ayuda a practicar la escucha activa.",
    respuesta: true,
    retroalimentacion: "Correcto: entrevistar e indagar desarrolla la escucha y la sistematización de información.",
  },
];

/* ═══ Pistas de la entrevista — VERBATIM de LC-I-P02-A3 ══════════════════ */

export const PISTAS_ENTREVISTA: string[] = [
  "¿Lee noticias, mensajes, libros, instrucciones? ¿En qué momento del día?",
  "¿Lee por placer, por trabajo, por necesidad? ¿Cómo aprendió a leer?",
  "¿Qué te sorprendió de sus hábitos de lectura?",
];

/* ═══ Callout de la lectura A1 — VERBATIM ════════════════════════════════ */

export const CALLOUT_A1 =
  "La Academia Mexicana de la Lengua (AML) y el Diccionario del Español de México (DEM) de El Colegio de México son los referentes mexicanos para resolver dudas sobre el uso correcto del español, incluido el vocabulario técnico y digital. La Fundéu RAE, de origen español, también ofrece recomendaciones, pero no es una institución mexicana.";

/* ═══ Dato real (encuesta nacional) ══════════════════════════════════════
 * MOLEC = Módulo sobre Lectura del INEGI. Metodología pública: se levanta cada
 * febrero en 32 ciudades de 100 mil y más habitantes, entre población de 18
 * años y más alfabeta, y considera cinco materiales: libros, revistas,
 * periódicos, historietas y páginas de internet, foros o blogs.
 */

export const DATO_MOLEC =
  "El INEGI levanta cada febrero el MOLEC (Módulo sobre Lectura) en 32 ciudades de 100 mil habitantes o más, entre población de 18 años y más que sabe leer y escribir. Solo cuenta cinco materiales: libros, revistas, periódicos, historietas y páginas de internet, foros o blogs. Alrededor de 7 de cada 10 personas encuestadas declaran haber leído alguno de ellos en los últimos doce meses (INEGI, MOLEC 2024). Fíjate en lo que esa lista deja fuera: las etiquetas de Carmen y los avisos de Beto no cuentan. Toda encuesta decide qué cuenta como leer, y esa decisión cambia el resultado.";

export const NOTA_PIE =
  "VERBATIM de la progresión LC-I-P02: el glosario de tipos de texto y soportes (A4), las pistas de entrevista (A3), los hechos de verdadero/falso (A5), el texto con huecos (A6), el cuestionario evaluable (A2) y el recuadro sobre la AML y el DEM (A1). ILUSTRATIVO: las nueve personas de la comunidad escolar, sus testimonios y la gráfica que resulta de ellos son un levantamiento simulado, con nombres ficticios; no provienen de ninguna encuesta real ni representan a ninguna escuela. El dato nacional es real: INEGI, Módulo sobre Lectura (MOLEC), levantamiento de febrero de 2024.";
