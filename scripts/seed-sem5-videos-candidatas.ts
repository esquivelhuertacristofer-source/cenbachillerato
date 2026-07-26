/**
 * Semestre 5 — Actividades de video candidatas (tipo 'video_con_preguntas').
 * Cubre las progresiones de Semestre V que aun no tenian video.
 * Mismo patron que seed-sem6-videos.ts: url_video PLACEHOLDER,
 * estado='borrador' hasta que el cliente entregue los enlaces reales de YouTube.
 * Uso: npx tsx scripts/seed-sem5-videos-candidatas.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionId, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

const PLACEHOLDER = "https://www.youtube.com/embed/PENDIENTE";

interface PregV {
  pregunta: string;
  tipo: "abierta" | "opcion_multiple" | "verdadero_falso";
  opciones?: string[];
  respuesta_correcta?: number | boolean | string;
}

interface VideoDef {
  progresion: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  titulo_video: string;
  descripcion_video: string;
  preguntas: PregV[];
}

const videos: VideoDef[] = [
  {
    progresion: "CH-II-P04",
    codigo: "CH-II-P04-VID01",
    titulo: "Video básico: Explicaciones históricas sobre cambios y continuidades",
    descripcion: "Video explicativo sobre cómo construir explicaciones históricas que muestren cambios y continuidades.",
    titulo_video: "Explicaciones históricas sobre cambios y continuidades",
    descripcion_video: "Video que explica cómo formular preguntas y construir explicaciones históricas para comprender qué cambia y qué permanece en los procesos históricos de la humanidad.",
    preguntas: [
      { pregunta: "¿Qué significa decir que en la historia hay 'cambios' y 'continuidades'?", tipo: "abierta" },
      { pregunta: "¿Qué elemento es indispensable para construir una explicación histórica sólida?", tipo: "opcion_multiple", opciones: ["Una fecha exacta memorizada","Una pregunta que guíe la investigación","Una opinión personal sin evidencia"], respuesta_correcta: 1 },
      { pregunta: "Las buenas preguntas históricas ayudan a entender por qué algunos procesos cambian y otros se mantienen con el tiempo.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CH-II-P03",
    codigo: "CH-II-P03-VID01",
    titulo: "Video básico: El sentido histórico de los acontecimientos",
    descripcion: "Video explicativo sobre cómo comprender el sentido histórico de los acontecimientos en distintos contextos.",
    titulo_video: "El sentido histórico de los acontecimientos",
    descripcion_video: "Video que explica qué significa el 'sentido histórico' de un acontecimiento y por qué su significado cambia según el contexto en que ocurrió.",
    preguntas: [
      { pregunta: "¿Por qué un mismo acontecimiento puede tener significados distintos según el contexto en que se estudie?", tipo: "abierta" },
      { pregunta: "¿Qué se necesita para analizar críticamente una explicación histórica?", tipo: "opcion_multiple", opciones: ["Aceptarla sin cuestionarla","Compararla con otras fuentes y contextos","Memorizarla textualmente"], respuesta_correcta: 1 },
      { pregunta: "El contexto en que ocurre un acontecimiento influye en el significado que le damos como sociedad.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CH-II-P01",
    codigo: "CH-II-P01-VID01",
    titulo: "Video básico: El vínculo ético con los sujetos históricos",
    descripcion: "Video explicativo sobre cómo construir un vínculo ético con las personas que protagonizaron la historia.",
    titulo_video: "El vínculo ético con los sujetos históricos",
    descripcion_video: "Video que explica qué es un vínculo ético con los sujetos históricos y cómo la reflexión sobre la diversidad de contextos ayuda a comprenderlos sin juzgarlos con ideas actuales.",
    preguntas: [
      { pregunta: "¿Qué significa construir un 'vínculo ético' con una persona que vivió en otra época?", tipo: "abierta" },
      { pregunta: "¿Qué error se comete al juzgar a personas del pasado solo con los valores del presente?", tipo: "opcion_multiple", opciones: ["Se les da demasiado reconocimiento","Se ignora el contexto en el que vivieron","Se les compara con héroes actuales"], respuesta_correcta: 1 },
      { pregunta: "Reflexionar sobre la diversidad de contextos ayuda a comprender mejor a los sujetos históricos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-V-P01",
    codigo: "CNEYT-V-P01-VID01",
    titulo: "Video básico: La tercera ley de Newton",
    descripcion: "Video explicativo sobre la tercera ley de Newton y los fenómenos de acción y reacción.",
    titulo_video: "La tercera ley de Newton",
    descripcion_video: "Video que explica la tercera ley de Newton (acción y reacción) y cómo permite entender la interacción entre dos cuerpos.",
    preguntas: [
      { pregunta: "¿Qué dice la tercera ley de Newton sobre la interacción entre dos cuerpos?", tipo: "abierta" },
      { pregunta: "Cuando caminas y empujas el suelo hacia atrás con el pie, ¿qué ocurre según la tercera ley de Newton?", tipo: "opcion_multiple", opciones: ["El suelo te empuja hacia adelante","No existe ninguna fuerza sobre ti","Solo tú ejerces fuerza sobre el suelo"], respuesta_correcta: 0 },
      { pregunta: "Según la tercera ley de Newton, las fuerzas de acción y reacción siempre actúan sobre cuerpos diferentes.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-V-P03",
    codigo: "CNEYT-V-P03-VID01",
    titulo: "Video básico: La ley de la gravitación universal",
    descripcion: "Video explicativo sobre la ley de la gravitación universal y las órbitas de los cuerpos celestes.",
    titulo_video: "La ley de la gravitación universal",
    descripcion_video: "Video que explica por qué todos los objetos caen con la misma aceleración sin importar su masa, y cómo la ley de la gravitación universal explica las órbitas de los cuerpos celestes.",
    preguntas: [
      { pregunta: "¿Por qué dos objetos con masas distintas caen al mismo tiempo si se sueltan desde la misma altura (sin resistencia del aire)?", tipo: "abierta" },
      { pregunta: "¿Qué determina la fuerza de atracción gravitacional entre dos cuerpos según Newton?", tipo: "opcion_multiple", opciones: ["Solo su color y forma","Sus masas y la distancia entre ellos","Su temperatura"], respuesta_correcta: 1 },
      { pregunta: "La ley de la gravitación universal explica tanto la caída libre en la Tierra como el movimiento orbital de los planetas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-V-P04",
    codigo: "CNEYT-V-P04-VID01",
    titulo: "Video básico: Propiedades físicas de las ondas",
    descripcion: "Video explicativo sobre las propiedades físicas que determinan el comportamiento de las ondas.",
    titulo_video: "Propiedades físicas de las ondas",
    descripcion_video: "Video que explica propiedades como frecuencia, longitud de onda y velocidad, y cómo estas determinan el comportamiento de distintos fenómenos ondulatorios.",
    preguntas: [
      { pregunta: "¿Qué propiedades de una onda determinan cómo se comporta al viajar por un medio?", tipo: "abierta" },
      { pregunta: "¿Qué relación existe entre la frecuencia y la longitud de onda cuando la velocidad es constante?", tipo: "opcion_multiple", opciones: ["Son independientes entre sí","Son directamente proporcionales","Son inversamente proporcionales"], respuesta_correcta: 2 },
      { pregunta: "Las propiedades físicas de una onda permiten explicar fenómenos como el sonido y la luz.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-V-P06",
    codigo: "CNEYT-V-P06-VID01",
    titulo: "Video básico: El comportamiento de la luz",
    descripcion: "Video explicativo sobre el comportamiento de la luz y los fenómenos ópticos naturales.",
    titulo_video: "El comportamiento de la luz",
    descripcion_video: "Video que explica cómo se comporta la luz al reflejarse y refractarse, y cómo este comportamiento permite entender fenómenos ópticos de la naturaleza.",
    preguntas: [
      { pregunta: "¿Qué fenómenos naturales se pueden explicar a partir del comportamiento de la luz?", tipo: "abierta" },
      { pregunta: "¿Qué le ocurre a la luz cuando pasa de un medio a otro con distinta densidad, como del aire al agua?", tipo: "opcion_multiple", opciones: ["Desaparece","Se refracta, es decir, cambia de dirección","Se detiene por completo"], respuesta_correcta: 1 },
      { pregunta: "El comportamiento de la luz permite explicar fenómenos ópticos como el arcoíris o los espejismos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-V-P05",
    codigo: "CNEYT-V-P05-VID01",
    titulo: "Video básico: Temas de física moderna y contemporánea",
    descripcion: "Video divulgativo sobre temas relevantes de la física moderna y contemporánea.",
    titulo_video: "Temas de física moderna y contemporánea",
    descripcion_video: "Video de carácter divulgativo que presenta temas de interés de la física moderna y contemporánea y su relevancia para entender el mundo actual.",
    preguntas: [
      { pregunta: "¿Por qué es importante conocer, aunque sea de forma general, los avances de la física moderna y contemporánea?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un tema propio de la física moderna y contemporánea?", tipo: "opcion_multiple", opciones: ["La física de partículas y la relatividad","La palanca de primer género","La ley de la oferta y la demanda"], respuesta_correcta: 0 },
      { pregunta: "Divulgar temas de física moderna ayuda a que más personas comprendan avances científicos actuales.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-V-P08",
    codigo: "CNEYT-V-P08-VID01",
    titulo: "Video básico: Ética y sociedad frente a la tecnología en física",
    descripcion: "Video explicativo sobre las implicaciones éticas y sociales del desarrollo tecnológico en física.",
    titulo_video: "Ética y sociedad frente a la tecnología en física",
    descripcion_video: "Video que reflexiona sobre las implicaciones éticas y sociales de tecnologías derivadas de la física, como la energía nuclear y las telecomunicaciones.",
    preguntas: [
      { pregunta: "¿Qué riesgos y beneficios sociales implica el desarrollo de la energía nuclear?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una tecnología derivada de la física con fuertes implicaciones éticas y sociales?", tipo: "opcion_multiple", opciones: ["El telar manual","La energía nuclear","El ábaco"], respuesta_correcta: 1 },
      { pregunta: "El desarrollo tecnológico en física, como la energía nuclear o las telecomunicaciones, plantea dilemas éticos y sociales que la sociedad debe discutir.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-V-P02",
    codigo: "IN-V-P02-VID01",
    titulo: "Video básico: Compartir experiencias personales en inglés",
    descripcion: "Video explicativo sobre cómo compartir en inglés experiencias personales o escolares relacionadas con tu campo de estudio.",
    titulo_video: "Compartir experiencias personales en inglés",
    descripcion_video: "Video que muestra cómo narrar en inglés experiencias personales o escolares y explicar por qué te interesa tu campo de estudio.",
    preguntas: [
      { pregunta: "¿Qué frases en inglés te sirven para explicar por qué te interesa un campo de estudio?", tipo: "abierta" },
      { pregunta: "¿Qué tiempo verbal en inglés se usa comúnmente para narrar una experiencia personal pasada?", tipo: "opcion_multiple", opciones: ["El presente simple (present simple)","El pasado simple (past simple)","El futuro (future)"], respuesta_correcta: 1 },
      { pregunta: "Compartir experiencias personales en inglés ayuda a practicar vocabulario relacionado con tus intereses académicos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-V-P03",
    codigo: "IN-V-P03-VID01",
    titulo: "Video básico: Preguntas y respuestas sobre procesos en inglés",
    descripcion: "Video explicativo sobre cómo formular y responder preguntas en inglés sobre procesos y conceptos básicos.",
    titulo_video: "Preguntas y respuestas sobre procesos en inglés",
    descripcion_video: "Video que muestra cómo formular y responder preguntas en inglés sobre procesos, conceptos o procedimientos, como en una entrevista simulada o una demostración.",
    preguntas: [
      { pregunta: "¿Qué tipo de preguntas en inglés usarías para pedir que alguien explique un procedimiento?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una forma correcta en inglés de preguntar cómo funciona algo?", tipo: "opcion_multiple", opciones: ["'How does it work?'","'How it works does?'","'Work does how it?'"], respuesta_correcta: 0 },
      { pregunta: "Practicar preguntas y respuestas sobre procesos en inglés es útil para simular entrevistas o dar explicaciones.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-V-P04",
    codigo: "IN-V-P04-VID01",
    titulo: "Video básico: Expresar opiniones y preferencias en inglés",
    descripcion: "Video explicativo sobre cómo expresar en inglés opiniones, preferencias y preocupaciones.",
    titulo_video: "Expresar opiniones y preferencias en inglés",
    descripcion_video: "Video que muestra frases en inglés para expresar opiniones, preferencias y preocupaciones sobre temas del campo de estudio o de la comunidad.",
    preguntas: [
      { pregunta: "¿Qué expresiones en inglés puedes usar para dar tu opinión sobre un tema, además de 'I think'?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes frases expresa una preferencia en inglés?", tipo: "opcion_multiple", opciones: ["'I was born in...'","'I prefer... rather than...'","'It is raining today.'"], respuesta_correcta: 1 },
      { pregunta: "Expresar opiniones y preocupaciones en inglés permite participar en discusiones sobre temas de interés de la comunidad.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-V-P05",
    codigo: "IN-V-P05-VID01",
    titulo: "Video básico: Comprensión de lectura en inglés",
    descripcion: "Video explicativo sobre cómo leer y analizar textos breves en inglés relacionados con tu campo de estudio.",
    titulo_video: "Comprensión de lectura en inglés",
    descripcion_video: "Video que explica estrategias para leer, resumir y opinar sobre textos breves en inglés vinculados con un campo temático o de estudio.",
    preguntas: [
      { pregunta: "¿Qué estrategias te ayudan a entender un texto en inglés aunque no conozcas todas las palabras?", tipo: "abierta" },
      { pregunta: "¿Qué se recomienda hacer primero al leer un texto breve en inglés para comprenderlo mejor?", tipo: "opcion_multiple", opciones: ["Traducir palabra por palabra desde el inicio","Identificar el tema general y las ideas principales","Memorizar el texto completo"], respuesta_correcta: 1 },
      { pregunta: "Leer y resumir textos breves en inglés ayuda a desarrollar la comprensión lectora en ese idioma.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-V-P06",
    codigo: "IN-V-P06-VID01",
    titulo: "Video básico: Redacción de textos funcionales en inglés",
    descripcion: "Video explicativo sobre cómo redactar en inglés textos funcionales como correos y solicitudes.",
    titulo_video: "Redacción de textos funcionales en inglés",
    descripcion_video: "Video que muestra cómo redactar en inglés textos funcionales breves, como correos, solicitudes o propuestas, para informar o proponer acciones.",
    preguntas: [
      { pregunta: "¿Qué partes debe tener un correo formal en inglés para solicitar algo?", tipo: "abierta" },
      { pregunta: "¿Cuál es una frase adecuada para iniciar un correo formal en inglés?", tipo: "opcion_multiple", opciones: ["'Hey what's up'","'Dear Sir or Madam'","'Yo bro'"], respuesta_correcta: 1 },
      { pregunta: "Un texto funcional en inglés, como un correo o una solicitud, debe ser claro y tener un propósito específico.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-V-P07",
    codigo: "IN-V-P07-VID01",
    titulo: "Video básico: Interacción oral semiestructurada en inglés",
    descripcion: "Video explicativo sobre cómo participar en interacciones orales semiestructuradas en inglés.",
    titulo_video: "Interacción oral semiestructurada en inglés",
    descripcion_video: "Video que explica cómo participar en inglés en una entrevista, presentación breve o panel, siguiendo una guía semiestructurada de preguntas y respuestas.",
    preguntas: [
      { pregunta: "¿Qué diferencia hay entre una conversación libre y una interacción oral semiestructurada como una entrevista?", tipo: "abierta" },
      { pregunta: "¿Qué elemento es característico de una interacción oral semiestructurada, como un panel o una entrevista?", tipo: "opcion_multiple", opciones: ["No hay ningún tema definido","Sigue una guía de preguntas o temas previos","Se realiza siempre por escrito"], respuesta_correcta: 1 },
      { pregunta: "Practicar interacciones orales semiestructuradas en inglés, como entrevistas o paneles, ayuda a desenvolverse mejor al hablar en público.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-V-P08",
    codigo: "IN-V-P08-VID01",
    titulo: "Video básico: El proyecto final integrador en inglés",
    descripcion: "Video explicativo sobre cómo integrar habilidades lingüísticas en un proyecto final en inglés.",
    titulo_video: "El proyecto final integrador en inglés",
    descripcion_video: "Video que explica cómo integrar las habilidades de escuchar, hablar, leer y escribir en inglés para producir un proyecto final vinculado al campo temático del grupo.",
    preguntas: [
      { pregunta: "¿Qué habilidades en inglés necesitas combinar para realizar un buen proyecto final?", tipo: "abierta" },
      { pregunta: "¿Cuál es el propósito principal de un proyecto final integrador en una clase de inglés?", tipo: "opcion_multiple", opciones: ["Memorizar una lista de vocabulario aislada","Aplicar de forma conjunta varias habilidades del idioma en un tema real","Copiar un texto ya existente sin cambios"], respuesta_correcta: 1 },
      { pregunta: "Un proyecto final integrador reúne distintas habilidades del idioma inglés en un solo trabajo relacionado con el campo temático del grupo.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-V-P03",
    codigo: "PM-V-P03-VID01",
    titulo: "Video básico: Origen del cálculo diferencial y la recta tangente",
    descripcion: "Video explicativo sobre el origen del cálculo diferencial y la recta tangente a una curva en un punto.",
    titulo_video: "Origen del cálculo diferencial y la recta tangente",
    descripcion_video: "Video que explica el origen histórico del cálculo diferencial y cómo se obtiene la recta tangente a una curva en un punto dado, para explicar fenómenos físicos.",
    preguntas: [
      { pregunta: "¿Por qué surgió históricamente el cálculo diferencial y para qué problemas se creó?", tipo: "abierta" },
      { pregunta: "¿Qué representa la recta tangente a una curva en un punto dado?", tipo: "opcion_multiple", opciones: ["La distancia total recorrida","La razón de cambio instantánea en ese punto","El área bajo la curva"], respuesta_correcta: 1 },
      { pregunta: "El cálculo diferencial surgió, entre otras razones, para explicar fenómenos físicos como el movimiento.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-V-P09",
    codigo: "PM-V-P09-VID01",
    titulo: "Video básico: Funciones y simetría en el estudio del cambio",
    descripcion: "Video explicativo sobre cómo modelar fenómenos de cambio con funciones de variable real e identificar simetrías.",
    titulo_video: "Funciones y simetría en el estudio del cambio",
    descripcion_video: "Video que explica cómo usar funciones de variable real para modelar situaciones donde el cambio es central, e identificar simetrías en su representación gráfica.",
    preguntas: [
      { pregunta: "¿Qué es una simetría en la gráfica de una función y cómo se reconoce a simple vista?", tipo: "abierta" },
      { pregunta: "¿Cómo se llama una función cuya gráfica es simétrica respecto al eje vertical?", tipo: "opcion_multiple", opciones: ["Función par","Función impar","Función constante"], respuesta_correcta: 0 },
      { pregunta: "Las funciones de variable real permiten modelar fenómenos en los que el cambio es el elemento central de estudio.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-V-P02",
    codigo: "PM-V-P02-VID01",
    titulo: "Video básico: El concepto de límite y la continuidad",
    descripcion: "Video explicativo sobre el concepto de límite y la continuidad de funciones de variable real.",
    titulo_video: "El concepto de límite y la continuidad",
    descripcion_video: "Video que explica qué es el límite de una función, cómo se relaciona con la continuidad, y cómo estos conceptos ayudan a interpretar y modelar fenómenos naturales y sociales.",
    preguntas: [
      { pregunta: "¿Qué representa el límite de una función cuando la variable se acerca a un valor determinado?", tipo: "abierta" },
      { pregunta: "¿Cuándo se dice que una función es continua en un punto?", tipo: "opcion_multiple", opciones: ["Cuando no está definida en ese punto","Cuando su límite en ese punto coincide con el valor de la función","Cuando su gráfica tiene un salto"], respuesta_correcta: 1 },
      { pregunta: "El concepto de límite es la base para entender la continuidad de una función.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-V-P05",
    codigo: "PM-V-P05-VID01",
    titulo: "Video básico: Funciones exponenciales, logarítmicas y trigonométricas",
    descripcion: "Video explicativo sobre las propiedades de las funciones exponenciales, logarítmicas y trigonométricas.",
    titulo_video: "Funciones exponenciales, logarítmicas y trigonométricas",
    descripcion_video: "Video que explica las propiedades de las funciones exponenciales, logarítmicas y trigonométricas, y ejemplos de fenómenos donde se aplican.",
    preguntas: [
      { pregunta: "¿En qué tipo de fenómenos reales se aplican las funciones exponenciales, logarítmicas o trigonométricas?", tipo: "abierta" },
      { pregunta: "¿Qué tipo de función describe mejor el crecimiento de una población que se duplica cada cierto tiempo?", tipo: "opcion_multiple", opciones: ["Una función trigonométrica","Una función exponencial","Una función logarítmica"], respuesta_correcta: 1 },
      { pregunta: "Las funciones trigonométricas son útiles para describir fenómenos periódicos, como las olas o las mareas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-V-P04",
    codigo: "PM-V-P04-VID01",
    titulo: "Video básico: Derivadas de funciones lineales y polinomiales",
    descripcion: "Video explicativo sobre métodos para derivar funciones lineales y polinomiales.",
    titulo_video: "Derivadas de funciones lineales y polinomiales",
    descripcion_video: "Video que explica métodos para derivar funciones lineales y polinomiales, y cómo la derivada ayuda a analizar fenómenos de cambio en las ciencias naturales y sociales.",
    preguntas: [
      { pregunta: "¿Qué información nos da la derivada de una función sobre su comportamiento?", tipo: "abierta" },
      { pregunta: "¿Cuál es la derivada de una función polinomial como f(x) = x²?", tipo: "opcion_multiple", opciones: ["f'(x) = 2x","f'(x) = x","f'(x) = 2"], respuesta_correcta: 0 },
      { pregunta: "La derivada es una herramienta útil para analizar fenómenos de cambio en distintas áreas del conocimiento.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-V-P07",
    codigo: "PM-V-P07-VID01",
    titulo: "Video básico: La derivada en problemas de optimización",
    descripcion: "Video explicativo sobre cómo aplicar la derivada para resolver problemas de optimización.",
    titulo_video: "La derivada en problemas de optimización",
    descripcion_video: "Video que explica cómo usar la derivada para resolver problemas de optimización, como encontrar el valor máximo o mínimo en situaciones del entorno o de otras áreas del conocimiento.",
    preguntas: [
      { pregunta: "¿Qué tipo de problemas cotidianos se pueden resolver usando la derivada para optimizar recursos?", tipo: "abierta" },
      { pregunta: "¿Qué condición se busca en la derivada de una función para encontrar un posible máximo o mínimo en un problema de optimización?", tipo: "opcion_multiple", opciones: ["Que la derivada sea igual a cero","Que la derivada sea siempre positiva","Que la función no tenga derivada"], respuesta_correcta: 0 },
      { pregunta: "Los problemas de optimización buscan encontrar el valor máximo o mínimo de una situación usando la derivada.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-V-P06",
    codigo: "PM-V-P06-VID01",
    titulo: "Video básico: Máximos, mínimos y puntos de inflexión",
    descripcion: "Video explicativo sobre cómo usar la derivada para encontrar máximos, mínimos y puntos de inflexión.",
    titulo_video: "Máximos, mínimos y puntos de inflexión",
    descripcion_video: "Video que explica cómo aplicar la derivada para identificar máximos, mínimos y puntos de inflexión en el análisis de funciones.",
    preguntas: [
      { pregunta: "¿Cómo se distingue, usando la derivada, un punto máximo de un punto mínimo en una gráfica?", tipo: "abierta" },
      { pregunta: "¿Qué ocurre con la segunda derivada en un punto de inflexión?", tipo: "opcion_multiple", opciones: ["Se vuelve infinita","Cambia de signo o se hace cero","Siempre es positiva"], respuesta_correcta: 1 },
      { pregunta: "El análisis de funciones con la derivada permite localizar máximos, mínimos y puntos de inflexión en su gráfica.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-V-P08",
    codigo: "PM-V-P08-VID01",
    titulo: "Video básico: La diferencial y las aproximaciones lineales",
    descripcion: "Video explicativo sobre la noción de diferencial y su uso en aproximaciones lineales.",
    titulo_video: "La diferencial y las aproximaciones lineales",
    descripcion_video: "Video que introduce la noción de diferencial y explica cómo se utiliza para hacer aproximaciones lineales de una función.",
    preguntas: [
      { pregunta: "¿Para qué sirve la diferencial de una función cuando queremos estimar un cambio pequeño?", tipo: "abierta" },
      { pregunta: "¿En qué se basa una aproximación lineal usando la diferencial?", tipo: "opcion_multiple", opciones: ["En la recta tangente a la función en un punto","En el área bajo la curva","En el valor máximo de la función"], respuesta_correcta: 0 },
      { pregunta: "La diferencial permite aproximar el valor de una función cerca de un punto sin calcular su valor exacto.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
];

async function main() {
  const sb = createSB();
  log("\n🎬 Semestre 5 — Videos candidatas (tipo 'video_con_preguntas')\n");
  log("   ⚠️  url_video = PLACEHOLDER; el cliente reemplazara con su enlace de YouTube.\n");

  let ok = 0;
  let fail = 0;

  for (const v of videos) {
    const progresion_id = await getProgresionId(sb, v.progresion);
    const res = await upsertActividad(sb, {
      codigo: v.codigo,
      titulo: v.titulo,
      descripcion: v.descripcion,
      tipo: "video_con_preguntas",
      progresion_id,
      xp: 15,
      estado: "borrador",
      contenido: {
        url_video: PLACEHOLDER,
        titulo_video: v.titulo_video,
        descripcion_video: v.descripcion_video,
        subtitulos_disponibles: false,
        preguntas: v.preguntas,
      },
    });
    res ? ok++ : fail++;
  }

  log(`\n✅ Sem5 videos candidatas: ${ok} insertados, ${fail} fallidos (de ${videos.length}).\n`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
