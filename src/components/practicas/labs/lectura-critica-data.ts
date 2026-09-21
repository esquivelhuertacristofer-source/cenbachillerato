/**
 * Datos del laboratorio «Leer más allá de lo literal».
 *
 * Progresión LC-III-P01 (Lengua y Comunicación III, tercer semestre):
 * «Leer críticamente: más allá de la comprensión literal».
 *
 * Qué es VERBATIM de la base de datos:
 *  · LECTURA_A1 / MARCO → LC-III-P01-A1 (lectura), íntegra.
 *  · DATO_PAZ           → el recuadro («callout») de LC-III-P01-A1.
 *  · QUIZ               → LC-III-P01-A2 (quiz_multiple_opcion), 5 reactivos.
 *  · PISTAS_A3          → las pistas de LC-III-P01-A3 (reflexión escrita).
 *  · CRITERIOS_A3       → los criterios de evaluación de LC-III-P01-A3.
 *  · HECHOS             → LC-III-P01-A4 (quiz_verdadero_falso), 5 enunciados.
 *  · PARES              → LC-III-P01-A5 (glosario_interactivo), 6 términos.
 *  (los huecos de LC-III-P01-A6 viven en `lectura-critica-huecos.ts`)
 *
 * Qué es material propio de la práctica: TODOS los textos que aquí se leen,
 * se cuestionan y se critican (TEXTOS, SUPUESTOS, CASOS, TEXTO_POSTURA). Se
 * escribieron para este laboratorio porque la progresión pide trabajar sobre
 * «un texto de tu elección» y no trae ninguno. Son ILUSTRATIVOS y sus autores,
 * empresas y asociaciones son FICTICIOS a propósito: el alumno debe aprender a
 * evaluar un argumento, no a juzgar la credibilidad de un medio, una
 * institución o una persona reales. Los únicos datos reales que aparecen son
 * los del recuadro verbatim sobre Octavio Paz.
 *
 * Sin three ni React: datos puros.
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { ParTermino } from "./_mecanica-termino";

/* ═══════════════════════════════════════════════════════════════════════
 * 0. Lectura de activación (A1), verbatim
 * ═══════════════════════════════════════════════════════════════════════ */

export const LECTURA_A1_TITULO = "Leer críticamente: más allá de la comprensión literal";

/** Los cinco párrafos de LC-III-P01-A1, verbatim. */
export const MARCO: string[] = [
  "Leer de forma crítica no significa desconfiar del texto ni buscarle defectos: significa comprometerse con él de manera activa, cuestionando, interpretando y evaluando lo que el autor dice y cómo lo dice.",
  "El primer nivel de la lectura crítica es la paráfrasis: reformular con nuestras propias palabras lo que el texto dice, sin agregar ni quitar información. Parafrasear nos obliga a verificar si realmente entendemos; si no podemos parafrasear, probablemente no hemos comprendido.",
  "El segundo nivel es identificar la postura del autor: ¿qué punto de vista defiende?, ¿qué valores o supuestos están detrás de sus argumentos?, ¿qué voces o perspectivas no aparecen en el texto? No todo lo que se escribe es neutral: el autor selecciona, enfatiza y omite desde una posición determinada.",
  "El tercer nivel es captar el sentido global del texto: ¿cuál es el propósito comunicativo del texto?, ¿a qué lector está dirigido?, ¿qué efecto busca producir en quien lo lee? Distinguir este propósito nos permite evaluar si el texto cumple o no su intención.",
  "Leer críticamente es una competencia que se desarrolla con práctica. Cada texto que analizamos a profundidad amplía nuestra capacidad de leer el siguiente con mayor perspicacia.",
];

/** Recuadro de A1, verbatim. Es el único dato real y externo del laboratorio. */
export const DATO_PAZ =
  "Octavio Paz, Premio Nobel de Literatura 1990, analizó la identidad mexicana en El laberinto de la soledad (1950). Sus reflexiones sobre la máscara, la fiesta y la muerte como rasgos culturales siguen siendo referencia en los estudios de comunicación y humanidades.";

/** Las cuatro preguntas de comprensión de A1, verbatim. */
export const PREGUNTAS_A1: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: "¿Qué significa leer de forma crítica según el texto?",
    respuesta:
      "Comprometerse activamente con el texto cuestionando, interpretando y evaluando lo que el autor dice y cómo lo dice.",
  },
  {
    pregunta: "¿Para qué sirve la paráfrasis en la lectura crítica?",
    respuesta: "Para verificar la comprensión real del texto; si no podemos parafrasear, no hemos entendido.",
  },
  {
    pregunta: "¿Qué implica identificar la postura del autor?",
    respuesta: "Reconocer su punto de vista, valores y supuestos, y detectar qué perspectivas omite.",
  },
  {
    pregunta: "¿Qué es el sentido global del texto?",
    respuesta: "El propósito comunicativo, el lector al que va dirigido y el efecto que busca producir.",
  },
];

/** Pistas de la reflexión escrita A3, verbatim. */
export const PISTAS_A3: string[] = [
  "La paráfrasis no es resumir: es reformular fielmente sin agregar tu opinión.",
  "Para identificar la postura del autor pregúntate: ¿qué quiere que piense quien lee esto?",
  "Tu postura debe diferenciarse de la del autor: ¿estás de acuerdo, en desacuerdo o tienes matices?",
  "Usa conectores de contraste y de argumentación: 'sin embargo', 'aunque', 'por el contrario', 'porque'.",
];

/** Criterios de evaluación de A3, verbatim. */
export const CRITERIOS_A3: string[] = [
  "La paráfrasis reformula el texto sin agregar ni omitir ideas principales",
  "Identifica la postura del autor con argumentos textuales",
  "Formula su propia postura con al menos dos argumentos",
  "Usa vocabulario de lectura crítica (postura, argumento, perspectiva, implícito)",
];

/* ═══════════════════════════════════════════════════════════════════════
 * 1. MODO «Tres niveles»: literal, inferencial y crítico sobre un mismo texto
 * ═══════════════════════════════════════════════════════════════════════ */

export type Nivel = "literal" | "inferencial" | "critico";

export const NIVELES: Nivel[] = ["literal", "inferencial", "critico"];

export const NIVEL_INFO: Record<
  Nivel,
  { titulo: string; corto: string; color: string; icono: string; descripcion: string; comoSeResponde: string }
> = {
  literal: {
    titulo: "Literal",
    corto: "Literal",
    color: "#60A5FA",
    icono: "fa-magnifying-glass-location",
    descripcion: "La respuesta está escrita en el texto: se localiza y se copia.",
    comoSeResponde: "Señala la línea del texto donde está la respuesta.",
  },
  inferencial: {
    titulo: "Inferencial",
    corto: "Inferencial",
    color: "#A78BFA",
    icono: "fa-diagram-project",
    descripcion: "La respuesta no está escrita, pero el texto da pistas suficientes para deducirla.",
    comoSeResponde: "Elige la conclusión que el texto permite sostener: ni repetirlo ni ir más lejos.",
  },
  critico: {
    titulo: "Crítico",
    corto: "Crítico",
    color: "#FFC75A",
    icono: "fa-scale-balanced",
    descripcion: "La respuesta evalúa al texto: si lo que afirma queda sostenido por lo que muestra.",
    comoSeResponde: "Elige la evaluación que juzga el argumento, no al autor ni el tema.",
  },
};

/** Por qué una clasificación equivocada lo es. */
export const ERROR_POR_NIVEL: Record<Nivel, string> = {
  literal:
    "Una pregunta literal se contesta copiando: si tuviste que deducir algo o juzgar al texto para contestarla, no era literal.",
  inferencial:
    "Una pregunta inferencial pide deducir lo que el texto no dice pero permite concluir. Si la respuesta está escrita tal cual, era literal; si te pide valorar el texto, era crítica.",
  critico:
    "Una pregunta crítica pone a prueba al texto: pregunta si lo que afirma queda probado. Si solo pide localizar o deducir contenido, no es crítica.",
};

export interface LineaTexto {
  id: string;
  /** Número visible de la línea, para poder citarla. */
  n: number;
  texto: string;
}

export interface OpcionEscalon {
  id: string;
  texto: string;
  correcta: boolean;
  porque: string;
}

export interface PreguntaNivel {
  id: string;
  nivel: Nivel;
  pregunta: string;
  /** Por qué la pregunta pertenece a ese nivel. */
  porque: string;
  /** Nivel literal: id de la línea donde está la respuesta. */
  lineaRespuesta?: string;
  /** Niveles inferencial y crítico: opciones a elegir. */
  opciones?: OpcionEscalon[];
}

export interface TextoNiveles {
  id: string;
  titulo: string;
  genero: string;
  credito: string;
  icono: string;
  lineas: LineaTexto[];
  preguntas: PreguntaNivel[];
  /** Lo que el texto deja ver una vez respondidos los tres niveles. */
  cierre: string;
}

export const TEXTOS: TextoNiveles[] = [
  {
    id: "horario",
    titulo: "La escuela movió la hora de entrada",
    genero: "Boletín escolar",
    credito: "Texto ilustrativo escrito para esta práctica. El plantel y las cifras son ficticios.",
    icono: "fa-clock",
    lineas: [
      { id: "h1", n: 1, texto: "Desde agosto, la entrada al plantel pasó de las 7:00 a las 7:30 horas." },
      { id: "h2", n: 2, texto: "En el primer bimestre se registraron 168 retardos; en el mismo bimestre del año pasado fueron 412." },
      { id: "h3", n: 3, texto: "Varios maestros comentan que los grupos llegan más despiertos a la primera clase." },
      { id: "h4", n: 4, texto: "El nuevo horario, entonces, resolvió el problema de la impuntualidad en la escuela." },
    ],
    preguntas: [
      {
        id: "h-lit",
        nivel: "literal",
        pregunta: "¿Cuántos retardos se registraron en el primer bimestre de este año?",
        porque:
          "La cifra está escrita en el texto: para contestar basta localizar la línea y copiarla. Eso es comprensión literal.",
        lineaRespuesta: "h2",
      },
      {
        id: "h-inf",
        nivel: "inferencial",
        pregunta: "¿Qué quiere el boletín que el lector concluya al mencionar a los maestros?",
        porque:
          "El texto nunca dice «quiero que atribuyas la mejora al horario»: hay que deducirlo del orden en que coloca los datos. Eso es inferir.",
        opciones: [
          {
            id: "h-inf-a",
            texto: "Que los retardos bajaron de 412 a 168.",
            correcta: false,
            porque: "Eso está escrito tal cual en la línea 2: es una respuesta literal, no una inferencia.",
          },
          {
            id: "h-inf-b",
            texto: "Que la mejora se debe al cambio de horario, sin decirlo con esas palabras.",
            correcta: true,
            porque:
              "El texto coloca el cambio, la baja de retardos y el comentario de los maestros en ese orden para que el lector una los tres. Esa unión la pone el lector: es una inferencia sostenida por el texto.",
          },
          {
            id: "h-inf-c",
            texto: "Que los maestros están en contra del nuevo horario.",
            correcta: false,
            porque:
              "Eso va más lejos de lo que el texto permite: los maestros comentan una mejora, y nada indica que se opongan. Inferir no es inventar.",
          },
        ],
      },
      {
        id: "h-cri",
        nivel: "critico",
        pregunta: "¿La línea 4 queda probada por lo que el texto muestra?",
        porque:
          "Aquí ya no se pregunta qué dice el texto, sino si lo que afirma se sostiene. Eso es evaluar el texto: lectura crítica.",
        opciones: [
          {
            id: "h-cri-b",
            texto: "No hay que creerle: lo escribió la propia escuela y esos boletines siempre exageran.",
            correcta: false,
            porque:
              "Eso descalifica al emisor, no al argumento. Saber quién firma sirve para revisar con más cuidado, pero no vuelve falso lo que dice: el argumento hay que responderlo con razones.",
          },
          {
            id: "h-cri-c",
            texto: "Está bien dicho, porque entrar más tarde siempre le conviene a cualquier adolescente.",
            correcta: false,
            porque:
              "Esto opina sobre el tema, no evalúa el texto. La pregunta crítica no es «¿estoy de acuerdo con el horario?», sino «¿este texto prueba lo que afirma?».",
          },
          {
            id: "h-cri-a",
            texto:
              "No queda probada: el texto muestra dos cosas que ocurrieron juntas, pero no descarta otras causas ni compara grupos.",
            correcta: true,
            porque:
              "Esta evaluación trabaja sobre el argumento: señala que coincidir en el tiempo no es lo mismo que causar, y dice qué le falta al texto para probar su conclusión.",
          },
        ],
      },
    ],
    cierre:
      "La misma persona puede contestar la pregunta 1 sin equivocarse y fallar la 3: localizar un dato y juzgar si un texto prueba lo que afirma son dos capacidades distintas.",
  },
  {
    id: "arboles",
    titulo: "Carta de vecinos por los árboles de la avenida",
    genero: "Carta abierta",
    credito: "Texto ilustrativo escrito para esta práctica. La colonia y la avenida son ficticias.",
    icono: "fa-tree",
    lineas: [
      { id: "a1", n: 1, texto: "En los últimos tres años se retiraron 28 árboles de la avenida principal de nuestra colonia." },
      { id: "a2", n: 2, texto: "Hoy ese tramo es el más caluroso del recorrido al mediodía, según las mediciones que hicimos con un termómetro de mano." },
      { id: "a3", n: 3, texto: "Por eso pedimos al comité vecinal sembrar 40 árboles antes de mayo." },
      { id: "a4", n: 4, texto: "Quien se oponga a esta propuesta simplemente no quiere a la colonia." },
    ],
    preguntas: [
      {
        id: "a-lit",
        nivel: "literal",
        pregunta: "¿Cuántos árboles pide sembrar la carta y antes de qué mes?",
        porque: "Los dos datos están escritos en una sola línea: localizar y copiar.",
        lineaRespuesta: "a3",
      },
      {
        id: "a-inf",
        nivel: "inferencial",
        pregunta: "¿Qué da por hecho la carta sobre la causa del calor en ese tramo?",
        porque:
          "La carta nunca escribe «el calor se debe a la tala»: lo deja implícito al poner los dos datos uno detrás del otro. Deducirlo es inferir.",
        opciones: [
          {
            id: "a-inf-b",
            texto: "Que en tres años se retiraron 28 árboles.",
            correcta: false,
            porque: "Está escrito en la línea 1: eso es literal.",
          },
          {
            id: "a-inf-a",
            texto: "Que la falta de árboles es lo que volvió más caluroso ese tramo.",
            correcta: true,
            porque:
              "Es la única forma de que el «por eso» de la línea 3 tenga sentido. El texto lo necesita, aunque no lo escriba: es una inferencia sostenida.",
          },
          {
            id: "a-inf-c",
            texto: "Que el comité vecinal ordenó talar los árboles para construir.",
            correcta: false,
            porque:
              "El texto no dice quién los retiró ni por qué. Atribuirlo al comité es agregar información que no está: eso ya no es inferir.",
          },
        ],
      },
      {
        id: "a-cri",
        nivel: "critico",
        pregunta: "¿Qué le falta a la línea 4 para funcionar como argumento?",
        porque: "Se juzga una pieza del texto: si convence con razones o con otra cosa.",
        opciones: [
          {
            id: "a-cri-b",
            texto: "Le falta cuidar la ortografía y la puntuación.",
            correcta: false,
            porque:
              "La forma se puede revisar, pero eso no evalúa el razonamiento. Una frase impecable puede ser un mal argumento y al revés.",
          },
          {
            id: "a-cri-c",
            texto: "No le falta nada: quien se opone, en efecto, no quiere a la colonia.",
            correcta: false,
            porque:
              "Aceptar la frase tal cual es dar por buena una falsa disyuntiva: entre apoyar esta propuesta exacta y no querer a la colonia hay muchas posiciones intermedias.",
          },
          {
            id: "a-cri-a",
            texto:
              "Le faltan razones: convierte el desacuerdo en falta de cariño por la colonia, en vez de responder a las objeciones posibles.",
            correcta: true,
            porque:
              "Exacto: la línea 4 no defiende la propuesta, descalifica de antemano a quien la discuta. Un argumento responde objeciones; esto las bloquea.",
          },
        ],
      },
    ],
    cierre:
      "Una carta puede tener datos verificables en sus tres primeras líneas y una falacia en la cuarta. Leer críticamente es evaluar línea por línea, no aprobar o rechazar el texto entero de golpe.",
  },
  {
    id: "pantalla",
    titulo: "Leer en pantalla: lo que me pasó este año",
    genero: "Entrada de blog",
    credito: "Texto ilustrativo escrito para esta práctica. La autora y el blog son ficticios.",
    icono: "fa-laptop",
    lineas: [
      { id: "p1", n: 1, texto: "Este año leí 14 libros: 9 en pantalla y 5 en papel." },
      { id: "p2", n: 2, texto: "Recuerdo mucho mejor los que leí en papel." },
      { id: "p3", n: 3, texto: "Concluyo que el papel es mejor que la pantalla para estudiar, para todo el mundo." },
      { id: "p4", n: 4, texto: "Además hay un estudio que lo demuestra, aunque ahora no recuerdo cuál era." },
    ],
    preguntas: [
      {
        id: "p-lit",
        nivel: "literal",
        pregunta: "¿Cuántos libros leyó la autora en pantalla?",
        porque: "El número está escrito: localizar y copiar.",
        lineaRespuesta: "p1",
      },
      {
        id: "p-inf",
        nivel: "inferencial",
        pregunta: "¿En qué se apoya realmente la autora para concluir lo de la línea 3?",
        porque:
          "Hay que reconstruir el apoyo de su conclusión revisando lo que sí ofrece y lo que solo anuncia. El texto no lo resume: se deduce.",
        opciones: [
          {
            id: "p-inf-b",
            texto: "En un estudio con datos que el texto cita.",
            correcta: false,
            porque:
              "El texto menciona un estudio pero no lo identifica. Una referencia que no se puede consultar no se puede comprobar: no es evidencia.",
          },
          {
            id: "p-inf-c",
            texto: "En los resultados de sus alumnos durante el año.",
            correcta: false,
            porque: "En el texto no hay alumnos por ningún lado. Eso no es inferir: es agregar.",
          },
          {
            id: "p-inf-a",
            texto: "En su propia experiencia con 14 libros de este año.",
            correcta: true,
            porque:
              "Es lo único que el texto aporta: un caso, el suyo. La línea 4 menciona un estudio, pero al no poder citarlo no funciona como apoyo.",
          },
        ],
      },
      {
        id: "p-cri",
        nivel: "critico",
        pregunta: "¿Hasta dónde alcanza lo que la autora puede sostener con este texto?",
        porque: "Se evalúa la distancia entre la evidencia ofrecida y el tamaño de la conclusión.",
        opciones: [
          {
            id: "p-cri-b",
            texto: "No alcanza para nada: escribe en un blog y no es investigadora.",
            correcta: false,
            porque:
              "Eso juzga a la autora, no al texto. Un texto de blog puede estar bien argumentado y un texto firmado por una especialista puede no estarlo: lo que se revisa es la evidencia.",
          },
          {
            id: "p-cri-a",
            texto:
              "Alcanza para contar lo que le pasó a ella; para decir «para todo el mundo» necesitaría más de un caso y un estudio que sí se pueda consultar.",
            correcta: true,
            porque:
              "Eso evalúa el argumento: la experiencia personal es evidencia válida sobre uno mismo, y se vuelve débil en cuanto la conclusión se generaliza a todos.",
          },
          {
            id: "p-cri-c",
            texto: "Alcanza de sobra: si a ella le funcionó el papel, le funciona igual a cualquiera.",
            correcta: false,
            porque:
              "Eso es generalizar desde un solo caso, justo el paso que había que revisar. Aceptarlo es repetir el error del texto en vez de evaluarlo.",
          },
        ],
      },
    ],
    cierre:
      "La autora es honesta y su experiencia es real: el problema no es quién escribe, sino que la conclusión es más grande que la evidencia que la sostiene.",
  },
];

export const TOTAL_PREGUNTAS = TEXTOS.reduce((n, t) => n + t.preguntas.length, 0);

/* ═══════════════════════════════════════════════════════════════════════
 * 2. MODO «El supuesto oculto»
 * ═══════════════════════════════════════════════════════════════════════ */

export type TipoOpcionSupuesto = "supuesto" | "dicho" | "ajeno";

export interface OpcionSupuesto {
  id: string;
  texto: string;
  tipo: TipoOpcionSupuesto;
  porque: string;
}

export interface ArgumentoSupuesto {
  id: string;
  etiqueta: string;
  premisa: string;
  conclusion: string;
  opciones: OpcionSupuesto[];
  /** Qué pasa con el argumento si el supuesto no se acepta. */
  siLoRechazas: string;
}

export const SUPUESTOS: ArgumentoSupuesto[] = [
  {
    id: "s1",
    etiqueta: "Aviso en la sala de cómputo",
    premisa: "Quienes usan el laboratorio de cómputo sacan mejores calificaciones en informática.",
    conclusion: "Por eso hay que ampliar el horario del laboratorio.",
    opciones: [
      {
        id: "s1-b",
        texto: "Que quienes usan el laboratorio sacan mejores calificaciones.",
        tipo: "dicho",
        porque: "Eso está dicho con todas sus letras en la premisa. Un supuesto es justo lo que NO se dice.",
      },
      {
        id: "s1-a",
        texto: "Que usar el laboratorio es lo que produce las mejores calificaciones, y no al revés.",
        tipo: "supuesto",
        porque:
          "El aviso no lo argumenta en ningún momento, pero lo necesita: si en realidad van al laboratorio quienes ya iban bien en informática, ampliar el horario no cambiaría nada.",
      },
      {
        id: "s1-c",
        texto: "Que el laboratorio tiene treinta computadoras.",
        tipo: "ajeno",
        porque: "El argumento funciona igual con treinta computadoras o con diez: eso no es lo que lo sostiene.",
      },
    ],
    siLoRechazas: "Si la relación va al revés, ampliar el horario no mejora a nadie: solo da más horas a quien ya iba bien.",
  },
  {
    id: "s2",
    etiqueta: "Nota del comité de biblioteca",
    premisa: "La biblioteca prestó 3 200 libros el año pasado y 2 100 este año.",
    conclusion: "La lectura está cayendo entre los jóvenes.",
    opciones: [
      {
        id: "s2-c",
        texto: "Que la biblioteca abre también los sábados.",
        tipo: "ajeno",
        porque: "Un dato del servicio que no interviene en el salto de la premisa a la conclusión.",
      },
      {
        id: "s2-b",
        texto: "Que los préstamos bajaron de 3 200 a 2 100.",
        tipo: "dicho",
        porque: "Es la premisa, escrita tal cual. Lo que se busca es la pieza que falta, no la que ya está.",
      },
      {
        id: "s2-a",
        texto: "Que los préstamos de esta biblioteca miden cuánto leen los jóvenes.",
        tipo: "supuesto",
        porque:
          "Nunca lo defiende, pero sin eso la conclusión no se sostiene: se puede leer más que nunca en libros propios, prestados entre amigos o en pantalla, y pedir menos libros aquí.",
      },
    ],
    siLoRechazas: "Si los préstamos no miden la lectura, la cifra sigue siendo cierta y la conclusión se queda sin piso.",
  },
  {
    id: "s3",
    etiqueta: "Comentario en la sala de maestros",
    premisa: "Ningún estudiante reprobó el examen de práctica.",
    conclusion: "El examen fue justo.",
    opciones: [
      {
        id: "s3-a",
        texto: "Que un examen que nadie reprueba es, por eso mismo, un examen justo.",
        tipo: "supuesto",
        porque:
          "Es el puente que falta. Un examen tan fácil que no distingue quién estudió también lo aprueban todos, y de justo tendría poco.",
      },
      {
        id: "s3-b",
        texto: "Que ningún estudiante reprobó.",
        tipo: "dicho",
        porque: "Es la premisa. El supuesto es lo que hace falta ADEMÁS de la premisa para llegar a la conclusión.",
      },
      {
        id: "s3-c",
        texto: "Que el examen duró dos horas.",
        tipo: "ajeno",
        porque: "La duración no interviene en el razonamiento tal como está planteado.",
      },
    ],
    siLoRechazas: "Si «que todos aprueben» no garantiza justicia, hace falta otra evidencia: qué se preguntó y qué se esperaba medir.",
  },
  {
    id: "s4",
    etiqueta: "Publicación en un grupo de estudio",
    premisa: "Este método de estudio lo usan los tres primeros lugares de la generación.",
    conclusion: "Úsalo tú también.",
    opciones: [
      {
        id: "s4-b",
        texto: "Que los tres primeros lugares usan ese método.",
        tipo: "dicho",
        porque: "Es lo que la publicación afirma; el supuesto está en el salto hacia «úsalo tú».",
      },
      {
        id: "s4-c",
        texto: "Que el método se publicó en un cuadernillo impreso.",
        tipo: "ajeno",
        porque: "Dónde se publicó no cambia el razonamiento.",
      },
      {
        id: "s4-a",
        texto: "Que lo que le funciona a esos tres estudiantes funcionará igual para cualquier otro.",
        tipo: "supuesto",
        porque:
          "No se argumenta, y es justo lo discutible: tres casos elegidos por su resultado no muestran qué hizo la diferencia ni si es trasladable.",
      },
    ],
    siLoRechazas: "Si lo que funciona para tres no funciona para todos, la recomendación necesita algo más que su ejemplo.",
  },
  {
    id: "s5",
    etiqueta: "Cartel en el pasillo",
    premisa: "El plantel propone un reglamento nuevo para los recesos.",
    conclusion: "Si no apoyas el reglamento, estás a favor del desorden.",
    opciones: [
      {
        id: "s5-c",
        texto: "Que el reglamento tiene doce artículos.",
        tipo: "ajeno",
        porque: "El número de artículos no sostiene ni derriba la conclusión.",
      },
      {
        id: "s5-a",
        texto: "Que solo existen dos posibilidades: este reglamento exacto o el desorden.",
        tipo: "supuesto",
        porque:
          "Es la pieza escondida, y es falsa: se puede querer orden y a la vez proponer otro reglamento, o pedir que se corrijan dos de sus artículos.",
      },
      {
        id: "s5-b",
        texto: "Que el plantel propone un reglamento nuevo.",
        tipo: "dicho",
        porque: "Es la premisa, a la vista de todos.",
      },
    ],
    siLoRechazas: "En cuanto aparece una tercera posibilidad, la amenaza del cartel deja de funcionar como razón.",
  },
];

export const PISTA_SUPUESTO =
  "Un supuesto no está escrito: es el puente que hay que poner entre la premisa y la conclusión para que el paso se sostenga. Pruébalo así: si lo niegas y el argumento se cae, ese era el supuesto.";

/* ═══════════════════════════════════════════════════════════════════════
 * 3. MODO «Quién habla y desde dónde»
 * ═══════════════════════════════════════════════════════════════════════ */

export type TipoReaccion = "argumento" | "persona";

export const REACCION_INFO: Record<TipoReaccion, { titulo: string; color: string; icono: string; descripcion: string }> = {
  argumento: {
    titulo: "Critica el argumento",
    color: "#34D399",
    icono: "fa-scale-balanced",
    descripcion: "Responde a lo que el texto dice: su evidencia, sus saltos, lo que omite.",
  },
  persona: {
    titulo: "Descalifica al emisor",
    color: "#FF8A3C",
    icono: "fa-user-slash",
    descripcion: "Rechaza lo dicho por quién lo dice. Señalar un interés sirve para revisar; no basta para refutar.",
  },
};

export interface OpcionInteres {
  id: string;
  texto: string;
  correcto: boolean;
  porque: string;
}

export interface Reaccion {
  id: string;
  texto: string;
  tipo: TipoReaccion;
  porque: string;
}

export interface CasoEmisor {
  id: string;
  emisor: string;
  desde: string;
  icono: string;
  texto: string;
  conclusion: string;
  intereses: OpcionInteres[];
  reacciones: Reaccion[];
}

export const CASOS: CasoEmisor[] = [
  {
    id: "c1",
    emisor: "Aguas Claras, embotelladora (empresa ficticia)",
    desde: "Folleto repartido casa por casa",
    icono: "fa-bottle-water",
    texto: "«El agua de garrafón es la única forma segura de beber agua en casa. Cualquier otra opción pone en riesgo a tu familia.»",
    conclusion: "Solo el garrafón es seguro.",
    intereses: [
      {
        id: "c1-b",
        texto: "A quien reparte el folleto en la calle.",
        correcto: false,
        porque: "Quien lo reparte cobra igual se acepte o no la conclusión: no es quien la aprovecha.",
      },
      {
        id: "c1-a",
        texto: "A la empresa que vende garrafones.",
        correcto: true,
        porque:
          "Quien firma el folleto gana si el lector acepta la conclusión. Eso no vuelve falso el folleto, pero sí obliga a revisar si consideró las otras opciones.",
      },
      {
        id: "c1-c",
        texto: "A nadie en particular: es información general.",
        correcto: false,
        porque:
          "La conclusión descarta de un golpe a todas las alternativas y deja solo el producto del emisor. Ahí hay un interés claro.",
      },
    ],
    reacciones: [
      {
        id: "c1-r1",
        texto: "El folleto no dice nada de hervir el agua ni de los filtros caseros, que también son opciones conocidas.",
        tipo: "argumento",
        porque: "Señala una omisión del texto: responde a lo que el folleto afirma y muestra qué dejó fuera.",
      },
      {
        id: "c1-r2",
        texto: "Lo escribió una embotelladora, así que es mentira.",
        tipo: "persona",
        porque:
          "Dar algo por falso por el origen del mensaje no es refutarlo. El interés del emisor es una razón para revisar la evidencia, no un sustituto de revisarla.",
      },
    ],
  },
  {
    id: "c2",
    emisor: "Comité del torneo escolar (organización ficticia)",
    desde: "Comunicado pegado en la entrada",
    icono: "fa-futbol",
    texto: "«El torneo debe jugarse dentro del horario de clases: así asistiría mucha más gente y tendría el ambiente que merece.»",
    conclusion: "El torneo va en horario de clases.",
    intereses: [
      {
        id: "c2-b",
        texto: "A los maestros de las materias de esa hora.",
        correcto: false,
        porque: "Son justamente quienes pierden algo con la propuesta, no quienes ganan.",
      },
      {
        id: "c2-c",
        texto: "A las familias de los jugadores.",
        correcto: false,
        porque: "El comunicado no menciona a las familias ni su horario: no hay nada en el texto que apunte hacia ellas.",
      },
      {
        id: "c2-a",
        texto: "A quienes organizan el torneo y quieren gradas llenas.",
        correcto: true,
        porque: "La conclusión resuelve el problema del emisor —el público— y deja sin resolver el de las clases perdidas.",
      },
    ],
    reacciones: [
      {
        id: "c2-r2",
        texto: "Lo dicen porque son flojos y no quieren entrar a clase.",
        tipo: "persona",
        porque:
          "Atribuye una intención al emisor en vez de responder a su razón. Aunque fueran flojos, habría que mostrar por qué la propuesta no conviene.",
      },
      {
        id: "c2-r1",
        texto: "Tener más público no es razón suficiente: el comunicado no dice qué pasa con las clases que se pierden.",
        tipo: "argumento",
        porque: "Toma la razón que da el texto, la pesa contra el costo que el texto calla y pide que se resuelva. Eso es criticar el argumento.",
      },
    ],
  },
  {
    id: "c3",
    emisor: "Asociación de familias del plantel (organización ficticia)",
    desde: "Carta dirigida a la dirección",
    icono: "fa-mobile-screen",
    texto: "«Pedimos prohibir el celular en toda la escuela, a toda hora: distrae y por eso baja el aprovechamiento.»",
    conclusion: "Prohibición total del celular.",
    intereses: [
      {
        id: "c3-a",
        texto: "A quien busca una medida simple de vigilar, aunque sea gruesa.",
        correcto: true,
        porque:
          "La prohibición total es la más fácil de aplicar y de supervisar. Esa comodidad explica por qué el texto no distingue usos: distinguir complicaría la regla.",
      },
      {
        id: "c3-b",
        texto: "A los estudiantes que usan el celular para consultar tareas.",
        correcto: false,
        porque: "Son quienes pierden con la medida: la prohibición total les quita también el uso escolar.",
      },
      {
        id: "c3-c",
        texto: "A las compañías de telefonía.",
        correcto: false,
        porque: "Nada en la carta las involucra: esa conexión la pondría el lector desde fuera del texto.",
      },
    ],
    reacciones: [
      {
        id: "c3-r1",
        texto: "La carta llama «distracción» a cualquier uso y no distingue consultar una tarea de ver videos en clase.",
        tipo: "argumento",
        porque: "Ataca el punto débil del razonamiento: mete todos los usos en la misma bolsa para poder concluir la prohibición total.",
      },
      {
        id: "c3-r2",
        texto: "Los adultos que escriben esto no entienden nada de tecnología.",
        tipo: "persona",
        porque:
          "Descalifica a quien firma en lugar de revisar la carta. Además no hace falta: el problema del texto se puede mostrar leyéndolo.",
      },
    ],
  },
  {
    id: "c4",
    emisor: "Creador de contenido que vende un curso (persona ficticia)",
    desde: "Publicación en una red social",
    icono: "fa-graduation-cap",
    texto: "«Estudiar solo con resúmenes automáticos siempre alcanza para pasar cualquier examen. En mi curso te enseño el método completo.»",
    conclusion: "Los resúmenes automáticos siempre alcanzan.",
    intereses: [
      {
        id: "c4-c",
        texto: "A quien estudia con tiempo y toma apuntes propios.",
        correcto: false,
        porque: "Es justo el método que la publicación declara innecesario.",
      },
      {
        id: "c4-a",
        texto: "A quien vende el curso que aparece al final.",
        correcto: true,
        porque:
          "La conclusión y la venta van en la misma publicación. Repetimos: eso obliga a pedir evidencia, no autoriza a dar por falso lo que dice.",
      },
      {
        id: "c4-b",
        texto: "A las escuelas que aplican exámenes.",
        correcto: false,
        porque: "La publicación no les ofrece nada; si acaso, discute sus exámenes.",
      },
    ],
    reacciones: [
      {
        id: "c4-r2",
        texto: "Seguro ni terminó la escuela.",
        tipo: "persona",
        porque:
          "Inventa un dato sobre la persona y lo usa como respuesta. Aunque fuera cierto, no diría nada sobre si los resúmenes bastan o no.",
      },
      {
        id: "c4-r1",
        texto: "La publicación no muestra ni un caso en el que el resumen automático haya bastado, y dice «siempre» y «cualquier examen».",
        tipo: "argumento",
        porque: "Mide el tamaño de la afirmación contra la evidencia ofrecida, que es ninguna. Es la crítica que toca.",
      },
    ],
  },
];

export const TOTAL_REACCIONES = CASOS.reduce((n, c) => n + c.reacciones.length, 0);

export const NOTA_EMISOR =
  "Identificar el interés de quien escribe es parte de leer críticamente: dice dónde mirar con más cuidado. Lo que NO puede hacer es sustituir a la revisión del argumento. Si la conclusión le conviene al emisor y además está bien sostenida, sigue estando bien sostenida.";

/* ═══════════════════════════════════════════════════════════════════════
 * 4. MODO «Toma postura»
 * ═══════════════════════════════════════════════════════════════════════ */

export interface PosturaOpcion {
  id: string;
  etiqueta: string;
  enunciado: string;
  icono: string;
  color: string;
  /** Las dos líneas del texto que la respaldan. */
  apoyo: string[];
  porque: string;
}

export interface TextoPostura {
  id: string;
  titulo: string;
  genero: string;
  credito: string;
  lineas: LineaTexto[];
  posturas: PosturaOpcion[];
}

export const TEXTO_POSTURA: TextoPostura = {
  id: "biblioteca",
  titulo: "La biblioteca del plantel abre dos horas más",
  genero: "Acta informativa",
  credito: "Texto ilustrativo escrito para esta práctica. El plantel y las cifras son ficticios.",
  lineas: [
    { id: "b1", n: 1, texto: "Desde septiembre la biblioteca abre de 7:00 a 18:00 horas, dos horas más que antes." },
    { id: "b2", n: 2, texto: "En esas dos horas adicionales entraron, en promedio, once estudiantes por día." },
    { id: "b3", n: 3, texto: "El plantel tiene mil cuatrocientos ochenta estudiantes inscritos." },
    { id: "b4", n: 4, texto: "La bibliotecaria cubre ese horario sin pago adicional, a cambio de salir temprano los viernes." },
    { id: "b5", n: 5, texto: "Quienes lo usan declaran que es el único momento del día en que pueden estudiar sin ruido." },
    { id: "b6", n: 6, texto: "El acuerdo se revisará en enero." },
  ],
  posturas: [
    {
      id: "favor",
      etiqueta: "A favor",
      enunciado: "El horario extra vale la pena aunque lo use poca gente.",
      icono: "fa-thumbs-up",
      color: "#34D399",
      apoyo: ["b5", "b6"],
      porque:
        "Estas dos líneas sostienen la postura: hay un beneficio real y declarado para quien lo usa (5) y el compromiso no es indefinido, se revisa en enero (6), así que el costo está acotado.",
    },
    {
      id: "contra",
      etiqueta: "En contra",
      enunciado: "El beneficio es demasiado pequeño para lo que cuesta.",
      icono: "fa-thumbs-down",
      color: "#FF8A3C",
      apoyo: ["b2", "b3"],
      porque:
        "Estas dos líneas sostienen la postura: once estudiantes de mil cuatrocientos ochenta es menos del uno por ciento. La comparación entre (2) y (3) es lo que convierte tu desacuerdo en argumento.",
    },
    {
      id: "matiz",
      etiqueta: "Con matices",
      enunciado: "Sí al horario, pero no a costa de una sola persona.",
      icono: "fa-code-branch",
      color: "#A78BFA",
      apoyo: ["b4", "b6"],
      porque:
        "Estas dos líneas sostienen la postura: el costo real lo está absorbiendo la bibliotecaria sin pago (4), y en enero hay una fecha concreta para corregirlo (6). Una postura con matices también necesita evidencia.",
    },
  ],
};

export const SIN_SUSTENTO =
  "Esas líneas no sostienen esta postura: dicen otra cosa. Sin líneas que la respalden, lo que tienes es una opinión sin sustento, no una postura argumentada. No es cuestión de gusto: es cuestión de evidencia.";

export const NOTA_POSTURA =
  "Las tres posturas son defendibles y aquí ninguna se califica de correcta: lo que se evalúa es si la sostienes con lo que el texto realmente dice. El mismo texto admite varias posturas argumentadas; lo que no admite es ninguna sin evidencia.";

/* ═══════════════════════════════════════════════════════════════════════
 * 5. Contenido evaluable verbatim (A2, A4, A5)
 * ═══════════════════════════════════════════════════════════════════════ */

/** LC-III-P01-A2, verbatim: 5 reactivos, mínimo 70 %. */
export const QUIZ: QuizEvaluable = {
  titulo: "Reto evaluable — ¿Qué tan bien comprendo lo que leo?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál es el propósito principal de la paráfrasis en la lectura crítica?",
      opciones: [
        "Copiar el texto con otras palabras para recordarlo",
        "Verificar la comprensión real del texto reformulándolo sin agregar ni quitar información",
        "Resumir el texto eliminando los detalles",
        "Traducir el texto a un lenguaje más sencillo",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La paráfrasis es una prueba de comprensión: si no podemos reformular el texto fielmente, no lo hemos entendido.",
    },
    {
      enunciado: "Identificar la postura del autor implica:",
      opciones: [
        "Buscar errores ortográficos o gramaticales",
        "Reconocer su punto de vista, valores y qué perspectivas omite deliberadamente",
        "Contar cuántas veces repite una idea",
        "Traducir sus metáforas a lenguaje literal",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La postura del autor incluye sus supuestos ideológicos y las voces que excluye, no solo lo que dice explícitamente.",
    },
    {
      enunciado: "¿Qué distingue a un lector crítico de uno literal?",
      opciones: [
        "El lector crítico solo lee textos académicos",
        "El lector crítico cuestiona, interpreta y evalúa; el literal solo extrae lo que el texto dice explícitamente",
        "El lector crítico desconfía de todo lo escrito",
        "No hay diferencia real entre ambos tipos de lectura",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La lectura crítica añade interpretación y evaluación a la comprensión literal: va más allá de lo explícito.",
    },
    {
      enunciado: "El 'sentido global del texto' se refiere a:",
      opciones: [
        "La extensión total del texto",
        "El propósito comunicativo, el lector al que va dirigido y el efecto que busca producir",
        "El número de ideas que contiene",
        "El vocabulario más difícil del texto",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El sentido global integra propósito, destinatario y efecto buscado: es la intención comunicativa completa.",
    },
    {
      enunciado: "¿Por qué no todo texto es neutral según la lectura crítica?",
      opciones: [
        "Porque todos los textos tienen errores",
        "Porque el autor selecciona, enfatiza y omite desde una posición determinada",
        "Porque el lenguaje es siempre subjetivo",
        "Porque los textos son escritos por personas con emociones",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La selección, el énfasis y la omisión son actos del autor que revelan su postura frente al tema.",
    },
  ],
};

/** LC-III-P01-A4, verbatim: cinco enunciados de verdadero o falso. */
export const HECHOS: { enunciado: string; verdadero: boolean; retro: string }[] = [
  {
    enunciado: "El sentido global de un texto se construye considerando el tema, la estructura y la intención del autor en conjunto.",
    verdadero: true,
    retro: "Correcto: el sentido global integra todos esos elementos para dar una interpretación completa.",
  },
  {
    enunciado: "La paráfrasis consiste en copiar literalmente las ideas del autor sin modificarlas.",
    verdadero: false,
    retro: "No: la paráfrasis es reformular las ideas con las propias palabras respetando el significado original.",
  },
  {
    enunciado: "Tomar postura frente a un autor significa aceptar todo lo que dice sin cuestionarlo.",
    verdadero: false,
    retro: "No: tomar postura implica evaluar críticamente los argumentos y emitir un juicio propio, ya sea de acuerdo o en desacuerdo.",
  },
  {
    enunciado: "Los conocimientos previos del lector influyen en la construcción del significado de un texto.",
    verdadero: true,
    retro: "Correcto: el lector activa sus saberes previos para conectarlos con la nueva información y construir sentido.",
  },
  {
    enunciado: "La intención del autor puede ser informar, persuadir, entretener o reflexionar, entre otras.",
    verdadero: true,
    retro: "Sí: identificar la intención ayuda a leer de forma más crítica y consciente.",
  },
];

/** LC-III-P01-A5, verbatim: los seis términos del glosario con su ejemplo. */
export const PARES: ParTermino[] = [
  {
    id: "g1",
    termino: "sentido global",
    definicion: "Significado general que se construye al interpretar tema, estructura e intención del texto en conjunto.",
    ejemplo: "El sentido global de la crónica es denunciar la desigualdad social.",
  },
  {
    id: "g2",
    termino: "intención del autor",
    definicion: "Propósito que guía la escritura: informar, persuadir, entretener, reflexionar o criticar.",
    ejemplo: "La intención del autor en este ensayo es persuadir al lector sobre el cambio climático.",
  },
  {
    id: "g3",
    termino: "paráfrasis",
    definicion: "Reformulación de las ideas de un texto con las propias palabras, manteniendo el sentido original.",
    ejemplo: "Parafraseando al autor: la violencia genera más violencia y perpetúa el ciclo de dolor.",
  },
  {
    id: "g4",
    termino: "postura crítica",
    definicion: "Juicio argumentado que el lector emite ante las ideas del autor, a favor o en contra, con razones.",
    ejemplo: "Mi postura es que el autor simplifica el problema al ignorar factores económicos.",
  },
  {
    id: "g5",
    termino: "conocimientos previos",
    definicion: "Saberes que el lector ya posee y que activa para interpretar un texto nuevo.",
    ejemplo: "Mis conocimientos previos sobre la Revolución Mexicana me ayudaron a entender la novela.",
  },
  {
    id: "g6",
    termino: "inferencia",
    definicion: "Conclusión que el lector deduce a partir de pistas en el texto, sin que se diga explícitamente.",
    ejemplo: "Inferimos que el personaje está asustado porque tiembla y evita hablar.",
  },
];

/** Cierre de A5, verbatim. */
export const ACTIVIDAD_FINAL_A5 =
  "Elige un párrafo de cualquier texto que estés leyendo, parafraséalo con tus propias palabras y escribe una oración expresando tu postura ante la idea del autor.";

export const FUENTE =
  "Progresión LC-III-P01 «Leer críticamente: más allá de la comprensión literal», Lengua y Comunicación III, Marco Curricular Común de la Educación Media Superior (NEM, 2025).";
