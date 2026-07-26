/**
 * Semestre 4 — Actividades de video candidatas (tipo 'video_con_preguntas').
 * Cubre las progresiones de Semestre IV que aun no tenian video.
 * Mismo patron que seed-sem6-videos.ts: url_video PLACEHOLDER,
 * estado='borrador' hasta que el cliente entregue los enlaces reales de YouTube.
 * Uso: npx tsx scripts/seed-sem4-videos-candidatas.ts
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
    progresion: "CH-I-P03",
    codigo: "CH-I-P03-VID01",
    titulo: "Video básico: Las conexiones entre fenómenos históricos",
    descripcion: "Video explicativo sobre cómo establecer conexiones entre fenómenos, acontecimientos y procesos históricos.",
    titulo_video: "Las conexiones entre fenómenos históricos",
    descripcion_video: "Video que explica cómo relacionar fenómenos, acontecimientos y procesos de distintas épocas para comprender mejor el devenir histórico.",
    preguntas: [
      { pregunta: "¿Por qué es importante relacionar un acontecimiento histórico con otros fenómenos y procesos, en lugar de estudiarlo de forma aislada?", tipo: "abierta" },
      { pregunta: "¿Qué palabra describe mejor el conjunto de cambios y transformaciones que ocurren a lo largo del tiempo en la historia?", tipo: "opcion_multiple", opciones: ["El devenir histórico","El texto narrativo","El mapa conceptual"], respuesta_correcta: 0 },
      { pregunta: "Comprender la historia implica identificar cómo se conectan distintos hechos y procesos entre sí.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CH-I-P01",
    codigo: "CH-I-P01-VID01",
    titulo: "Video básico: Cómo plantear preguntas históricas",
    descripcion: "Video explicativo sobre cómo plantear preguntas históricas a partir de problemáticas actuales.",
    titulo_video: "Cómo plantear preguntas históricas",
    descripcion_video: "Video que explica cómo formular preguntas a partir de problemas actuales usando conceptos y categorías históricas para analizarlos.",
    preguntas: [
      { pregunta: "¿Cómo puede una problemática actual convertirse en el punto de partida para una pregunta histórica?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es un ejemplo de categoría histórica que ayuda a analizar un problema actual?", tipo: "opcion_multiple", opciones: ["Volumen y densidad","Cambio y continuidad","Sujeto y predicado"], respuesta_correcta: 1 },
      { pregunta: "Analizar un problema actual con conceptos históricos permite entender mejor sus causas y su contexto.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CH-I-P04",
    codigo: "CH-I-P04-VID01",
    titulo: "Video básico: La diversidad de discursos en la historia",
    descripcion: "Video explicativo sobre el valor de la diversidad de discursos para construir explicaciones históricas.",
    titulo_video: "La diversidad de discursos en la historia",
    descripcion_video: "Video que explica por qué escuchar distintas voces y discursos enriquece la construcción de explicaciones históricas más completas.",
    preguntas: [
      { pregunta: "¿Qué ocurre con nuestra comprensión de un hecho histórico cuando solo consideramos un único discurso o punto de vista?", tipo: "abierta" },
      { pregunta: "¿Qué beneficio aporta considerar múltiples discursos al construir una explicación histórica?", tipo: "opcion_multiple", opciones: ["Una única versión indiscutible de los hechos","Una respuesta más corta de memorizar","Una interpretación más rica y completa del hecho"], respuesta_correcta: 2 },
      { pregunta: "Reconocer distintos discursos ayuda a construir explicaciones históricas más justas y completas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-IV-P01",
    codigo: "CNEYT-IV-P01-VID01",
    titulo: "Video básico: El balanceo de ecuaciones químicas por tanteo",
    descripcion: "Video explicativo sobre el balanceo de ecuaciones químicas por el método de tanteo.",
    titulo_video: "El balanceo de ecuaciones químicas por tanteo",
    descripcion_video: "Video que explica cómo balancear ecuaciones químicas usando el método de tanteo y cómo esto comprueba la ley de conservación de la masa.",
    preguntas: [
      { pregunta: "¿Qué significa 'balancear' una ecuación química y por qué es necesario hacerlo?", tipo: "abierta" },
      { pregunta: "¿Qué ley se comprueba al balancear correctamente una ecuación química?", tipo: "opcion_multiple", opciones: ["La ley de conservación de la masa","La ley de la gravitación universal","La ley de Ohm"], respuesta_correcta: 0 },
      { pregunta: "En una reacción química balanceada, el número de átomos de cada elemento es igual en reactivos y productos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-IV-P10",
    codigo: "CNEYT-IV-P10-VID01",
    titulo: "Video básico: El equilibrio químico",
    descripcion: "Video explicativo sobre el equilibrio químico y las reacciones reversibles e irreversibles.",
    titulo_video: "El equilibrio químico",
    descripcion_video: "Video que explica qué es el equilibrio químico y cómo se diferencian las reacciones reversibles de las irreversibles en fenómenos cotidianos.",
    preguntas: [
      { pregunta: "¿Qué diferencia hay entre una reacción reversible y una irreversible?", tipo: "abierta" },
      { pregunta: "¿Qué ocurre en el equilibrio químico de una reacción reversible?", tipo: "opcion_multiple", opciones: ["Se detiene por completo la reacción","La velocidad de la reacción directa e inversa se igualan","Todos los reactivos se transforman en productos"], respuesta_correcta: 1 },
      { pregunta: "Algunas reacciones químicas pueden ocurrir en ambos sentidos, formando un equilibrio dinámico.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-IV-P03",
    codigo: "CNEYT-IV-P03-VID01",
    titulo: "Video básico: Ácidos, bases y el potencial de hidrógeno (pH)",
    descripcion: "Video explicativo sobre las propiedades de sustancias ácidas y básicas según su pH.",
    titulo_video: "Ácidos, bases y el potencial de hidrógeno (pH)",
    descripcion_video: "Video que explica las propiedades físicas y químicas de las sustancias ácidas y básicas, y cómo el pH permite diferenciarlas.",
    preguntas: [
      { pregunta: "¿Cómo puede el valor de pH ayudarnos a identificar si una sustancia cotidiana es ácida o básica?", tipo: "abierta" },
      { pregunta: "¿Qué rango de la escala de pH corresponde a una sustancia ácida?", tipo: "opcion_multiple", opciones: ["De 7 a 14","Exactamente 7","De 0 a menos de 7"], respuesta_correcta: 2 },
      { pregunta: "El agua pura tiene un pH neutro, cercano a 7.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-IV-P04",
    codigo: "CNEYT-IV-P04-VID01",
    titulo: "Video básico: Estructura, propiedades y nomenclatura de los compuestos orgánicos",
    descripcion: "Video explicativo sobre la estructura, propiedades y nomenclatura de los compuestos orgánicos.",
    titulo_video: "Estructura, propiedades y nomenclatura de los compuestos orgánicos",
    descripcion_video: "Video que explica la estructura y las propiedades de los compuestos orgánicos, así como las reglas básicas para nombrarlos.",
    preguntas: [
      { pregunta: "¿Qué elemento químico es la base de todos los compuestos orgánicos y por qué es tan importante para la vida?", tipo: "abierta" },
      { pregunta: "¿Qué elemento forma el 'esqueleto' de las moléculas orgánicas?", tipo: "opcion_multiple", opciones: ["El carbono","El sodio","El calcio"], respuesta_correcta: 0 },
      { pregunta: "Los compuestos orgánicos son importantes para el bienestar humano porque forman parte de alimentos, medicamentos y materiales.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-IV-P11",
    codigo: "CNEYT-IV-P11-VID01",
    titulo: "Video básico: La respiración aerobia y anaerobia",
    descripcion: "Video explicativo sobre los procesos químicos de la respiración aerobia y anaerobia.",
    titulo_video: "La respiración aerobia y anaerobia",
    descripcion_video: "Video que explica los procesos químicos de la respiración aerobia y anaerobia, y su importancia para los seres vivos.",
    preguntas: [
      { pregunta: "¿Qué diferencia hay entre la respiración aerobia y la anaerobia en cuanto al uso de oxígeno?", tipo: "abierta" },
      { pregunta: "¿Qué proceso de respiración utiliza oxígeno para obtener energía?", tipo: "opcion_multiple", opciones: ["La respiración anaerobia","La respiración aerobia","La fermentación"], respuesta_correcta: 1 },
      { pregunta: "La respiración anaerobia ocurre en ausencia de oxígeno.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-IV-P06",
    codigo: "CNEYT-IV-P06-VID01",
    titulo: "Video básico: La química orgánica en la industria",
    descripcion: "Video explicativo sobre la relación entre la química orgánica y las industrias farmacéutica, alimentaria y de materiales.",
    titulo_video: "La química orgánica en la industria",
    descripcion_video: "Video que explica cómo la química orgánica se aplica en la industria farmacéutica, alimentaria y de materiales para crear productos que usamos a diario.",
    preguntas: [
      { pregunta: "¿Qué ejemplo cotidiano conoces de un producto que existe gracias a la química orgánica aplicada a la industria?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes industrias utiliza directamente la química orgánica para fabricar medicamentos?", tipo: "opcion_multiple", opciones: ["La industria minera","La industria siderúrgica","La industria farmacéutica"], respuesta_correcta: 2 },
      { pregunta: "La química orgánica participa en la creación de plásticos, medicamentos y alimentos procesados.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-IV-P07",
    codigo: "CNEYT-IV-P07-VID01",
    titulo: "Video básico: El impacto ambiental de los contaminantes químicos y los plásticos",
    descripcion: "Video explicativo sobre el impacto de los contaminantes químicos y los plásticos en el ambiente.",
    titulo_video: "El impacto ambiental de los contaminantes químicos y los plásticos",
    descripcion_video: "Video que explica cómo los contaminantes químicos y los plásticos afectan el ambiente y qué consecuencias tiene su acumulación.",
    preguntas: [
      { pregunta: "¿Qué consecuencias puede tener la acumulación de plásticos en los ecosistemas?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un ejemplo de contaminante químico que puede dañar el ambiente?", tipo: "opcion_multiple", opciones: ["Los pesticidas y los metales pesados","El agua destilada","El oxígeno atmosférico"], respuesta_correcta: 0 },
      { pregunta: "Muchos plásticos tardan cientos de años en degradarse en el ambiente.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-IV-P08",
    codigo: "CNEYT-IV-P08-VID01",
    titulo: "Video básico: Diseño de experimentos sencillos de química",
    descripcion: "Video explicativo sobre cómo diseñar y realizar experimentos sencillos de química con materiales accesibles.",
    titulo_video: "Diseño de experimentos sencillos de química",
    descripcion_video: "Video que explica cómo diseñar y llevar a cabo experimentos sencillos de química utilizando materiales accesibles y seguros.",
    preguntas: [
      { pregunta: "¿Qué pasos debes seguir para diseñar un experimento de química sencillo y seguro con materiales caseros?", tipo: "abierta" },
      { pregunta: "¿Qué elemento es indispensable registrar al diseñar un experimento científico?", tipo: "opcion_multiple", opciones: ["El nombre del profesor","La hipótesis y los resultados observados","El color del laboratorio"], respuesta_correcta: 1 },
      { pregunta: "Es posible realizar experimentos de química útiles con materiales accesibles y de bajo costo.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CS-III-P01",
    codigo: "CS-III-P01-VID01",
    titulo: "Video básico: El papel de los actores sociales en sucesos recientes",
    descripcion: "Video explicativo sobre el papel de los diferentes actores sociales en dinámicas y sucesos recientes.",
    titulo_video: "El papel de los actores sociales en sucesos recientes",
    descripcion_video: "Video que explica quiénes son los actores sociales y cómo su papel ayuda a explicar, contrastar e interpretar sucesos recientes.",
    preguntas: [
      { pregunta: "¿Quiénes pueden considerarse 'actores sociales' en un suceso reciente y por qué es importante analizar su papel?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es un ejemplo de actor social?", tipo: "opcion_multiple", opciones: ["Un número aleatorio","Una fórmula matemática","Una organización civil o un grupo comunitario"], respuesta_correcta: 2 },
      { pregunta: "Analizar el papel de distintos actores sociales ayuda a comprender mejor un suceso desde varias perspectivas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CS-III-P03",
    codigo: "CS-III-P03-VID01",
    titulo: "Video básico: Las juventudes como agentes de transformación social",
    descripcion: "Video explicativo sobre las juventudes en las sociedades actuales y su papel como agentes de transformación social.",
    titulo_video: "Las juventudes como agentes de transformación social",
    descripcion_video: "Video que explica cómo las y los jóvenes pueden reconocerse como agentes críticos y de transformación en la sociedad actual.",
    preguntas: [
      { pregunta: "¿De qué manera puedes tú, como joven, participar en la transformación de tu comunidad o sociedad?", tipo: "abierta" },
      { pregunta: "¿Qué significa que una persona joven sea un 'agente crítico'?", tipo: "opcion_multiple", opciones: ["Que analiza y cuestiona su realidad para proponer cambios","Que evita opinar sobre temas sociales","Que solo repite lo que dicen los demás"], respuesta_correcta: 0 },
      { pregunta: "Las juventudes pueden ser protagonistas de cambios sociales importantes en su comunidad.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-IV-P02",
    codigo: "IN-IV-P02-VID01",
    titulo: "Video básico: Expresar y justificar preferencias en inglés",
    descripcion: "Video explicativo sobre cómo expresar y justificar preferencias personales en inglés.",
    titulo_video: "Expresar y justificar preferencias en inglés",
    descripcion_video: "Video que explica cómo expresar preferencias personales en inglés y justificarlas de forma respetuosa comparando opciones cotidianas.",
    preguntas: [
      { pregunta: "¿Cómo puedes justificar en inglés por qué prefieres una opción sobre otra, por ejemplo entre dos actividades cotidianas?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes frases en inglés expresa correctamente una preferencia?", tipo: "opcion_multiple", opciones: ["I tea prefer because relax.","I prefer tea because it relaxes me.","Prefer I tea it relaxes."], respuesta_correcta: 1 },
      { pregunta: "Expresar una preferencia de forma respetuosa incluye dar una razón sin descalificar la opción de otra persona.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-IV-P03",
    codigo: "IN-IV-P03-VID01",
    titulo: "Video básico: Describir rutinas y hábitos en inglés",
    descripcion: "Video explicativo sobre cómo describir rutinas y hábitos en inglés con conciencia del contexto.",
    titulo_video: "Describir rutinas y hábitos en inglés",
    descripcion_video: "Video que explica cómo describir en inglés lo que se hace habitualmente en la escuela, la casa o la comunidad, y por qué se hace.",
    preguntas: [
      { pregunta: "¿Qué rutina diaria tuya podrías describir en inglés y por qué la realizas?", tipo: "abierta" },
      { pregunta: "¿Qué tiempo verbal en inglés se usa comúnmente para describir rutinas y hábitos?", tipo: "opcion_multiple", opciones: ["El pasado perfecto (Past Perfect)","El futuro continuo (Future Continuous)","El presente simple (Simple Present)"], respuesta_correcta: 2 },
      { pregunta: "Describir una rutina con conciencia del contexto implica explicar no solo qué se hace, sino también por qué.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-IV-P04",
    codigo: "IN-IV-P04-VID01",
    titulo: "Video básico: Pedir y dar consejos en inglés",
    descripcion: "Video explicativo sobre cómo pedir y dar consejos de forma empática en inglés.",
    titulo_video: "Pedir y dar consejos en inglés",
    descripcion_video: "Video que explica cómo solicitar y dar consejos en inglés relacionados con la salud, el estudio o la convivencia diaria, de forma empática.",
    preguntas: [
      { pregunta: "¿Cómo pedirías consejo en inglés a un amigo sobre un problema relacionado con la escuela?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes expresiones en inglés se usa para dar un consejo?", tipo: "opcion_multiple", opciones: ["You should get some rest.","You rested some should.","Rest you should get."], respuesta_correcta: 0 },
      { pregunta: "Dar un consejo de forma empática implica considerar los sentimientos y la situación de la otra persona.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-IV-P05",
    codigo: "IN-IV-P05-VID01",
    titulo: "Video básico: Hablar sobre planes y propósitos en inglés",
    descripcion: "Video explicativo sobre cómo hablar en inglés de planes y propósitos personales o comunitarios.",
    titulo_video: "Hablar sobre planes y propósitos en inglés",
    descripcion_video: "Video que explica cómo expresar en inglés lo que se piensa hacer y por qué es importante, ya sea a nivel personal o comunitario.",
    preguntas: [
      { pregunta: "¿Qué plan personal o comunitario te gustaría expresar en inglés y por qué es importante para ti?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes estructuras en inglés se usa para hablar de planes futuros?", tipo: "opcion_multiple", opciones: ["I have been studying.","I am going to study.","I studied yesterday."], respuesta_correcta: 1 },
      { pregunta: "Al hablar de un plan futuro en inglés, es útil explicar también la razón por la que se quiere lograr.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-IV-P06",
    codigo: "IN-IV-P06-VID01",
    titulo: "Video básico: Conversaciones sociales breves y expresiones de cortesía en inglés",
    descripcion: "Video explicativo sobre cómo participar en conversaciones sociales breves con expresiones de cortesía en inglés.",
    titulo_video: "Conversaciones sociales breves y expresiones de cortesía en inglés",
    descripcion_video: "Video que explica cómo iniciar, mantener y cerrar una conversación breve en inglés utilizando expresiones de cortesía y respeto.",
    preguntas: [
      { pregunta: "¿Qué expresiones en inglés usarías para iniciar y cerrar una conversación breve de forma cortés?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes frases es una expresión de cortesía en inglés?", tipo: "opcion_multiple", opciones: ["Give me that now.","Do it now.","Could you please help me?"], respuesta_correcta: 2 },
      { pregunta: "Una conversación social breve en inglés puede incluir un saludo, el tema principal y una despedida cortés.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-IV-P07",
    codigo: "IN-IV-P07-VID01",
    titulo: "Video básico: Contar una anécdota en inglés",
    descripcion: "Video explicativo sobre cómo contar una anécdota o experiencia significativa en inglés.",
    titulo_video: "Contar una anécdota en inglés",
    descripcion_video: "Video que explica cómo narrar de forma clara y organizada, en inglés, una anécdota o experiencia significativa que se haya vivido o aprendido.",
    preguntas: [
      { pregunta: "¿Qué anécdota o experiencia significativa podrías narrar en inglés y cómo la ordenarías cronológicamente?", tipo: "abierta" },
      { pregunta: "¿Qué tiempo verbal se usa principalmente para narrar una anécdota en inglés?", tipo: "opcion_multiple", opciones: ["El pasado simple (Simple Past)","El presente simple (Simple Present)","El futuro simple (Simple Future)"], respuesta_correcta: 0 },
      { pregunta: "Usar palabras de secuencia como 'first', 'then' y 'finally' ayuda a organizar una anécdota en inglés.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-IV-P08",
    codigo: "IN-IV-P08-VID01",
    titulo: "Video básico: Estrategias para comunicarse con claridad en inglés",
    descripcion: "Video explicativo sobre las estrategias para comprender y expresar ideas de forma clara y estructurada en inglés.",
    titulo_video: "Estrategias para comunicarse con claridad en inglés",
    descripcion_video: "Video que explica algunas estrategias para comprender y expresar ideas de forma clara y estructurada en tareas orales y escritas en inglés.",
    preguntas: [
      { pregunta: "¿Qué estrategia te ayuda a organizar mejor tus ideas antes de hablar o escribir en inglés?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una estrategia útil para expresar ideas de forma clara en inglés?", tipo: "opcion_multiple", opciones: ["Memorizar palabras sin contexto","Organizar las ideas antes de comunicarlas","Evitar practicar en voz alta"], respuesta_correcta: 1 },
      { pregunta: "Aplicar estrategias de comunicación ayuda a que las ideas en inglés se expresen con más claridad y propósito.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-IV-P02",
    codigo: "PM-IV-P02-VID01",
    titulo: "Video básico: Graficar polinomios de dos variables",
    descripcion: "Video explicativo sobre cómo graficar polinomios de dos variables en el plano cartesiano.",
    titulo_video: "Graficar polinomios de dos variables",
    descripcion_video: "Video que explica cómo graficar en el plano cartesiano polinomios de dos variables con coeficientes reales, y cómo deducir su simetría y extensión.",
    preguntas: [
      { pregunta: "¿Qué información nos da la simetría de una gráfica sobre el comportamiento de un polinomio de dos variables?", tipo: "abierta" },
      { pregunta: "¿Qué se necesita conocer, además de la ecuación, para graficar correctamente un polinomio de dos variables?", tipo: "opcion_multiple", opciones: ["El color de la gráfica","El nombre del autor de la fórmula","Sus coeficientes reales"], respuesta_correcta: 2 },
      { pregunta: "La extensión de una gráfica indica hasta dónde se prolongan sus valores en el plano cartesiano.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-IV-P07",
    codigo: "PM-IV-P07-VID01",
    titulo: "Video básico: Funciones cuadráticas y la parábola",
    descripcion: "Video explicativo sobre las funciones cuadráticas y las propiedades analíticas de la parábola.",
    titulo_video: "Funciones cuadráticas y la parábola",
    descripcion_video: "Video que explica cómo modelar situaciones o fenómenos con funciones cuadráticas y cómo deducir las propiedades de la parábola que forman.",
    preguntas: [
      { pregunta: "¿Qué situación de la vida cotidiana podría modelarse con una función cuadrática y qué forma tendría su gráfica?", tipo: "abierta" },
      { pregunta: "¿Qué figura geométrica se forma al graficar una función cuadrática?", tipo: "opcion_multiple", opciones: ["Una parábola","Una línea recta","Una circunferencia"], respuesta_correcta: 0 },
      { pregunta: "El vértice de una parábola es un punto clave para analizar las propiedades de una función cuadrática.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-IV-P04",
    codigo: "PM-IV-P04-VID01",
    titulo: "Video básico: La circunferencia, la elipse y las leyes de Kepler",
    descripcion: "Video explicativo sobre los movimientos circulares y elípticos, y su relación con las leyes de Kepler.",
    titulo_video: "La circunferencia, la elipse y las leyes de Kepler",
    descripcion_video: "Video que explica cómo la ecuación de la circunferencia, la elipse y las leyes de Kepler ayudan a entender movimientos circulares y orbitales.",
    preguntas: [
      { pregunta: "¿Por qué las leyes de Kepler son útiles para describir el movimiento de los planetas alrededor del Sol?", tipo: "abierta" },
      { pregunta: "¿Qué forma geométrica describen las órbitas de los planetas según las leyes de Kepler?", tipo: "opcion_multiple", opciones: ["Un cuadrado","Una elipse","Una recta"], respuesta_correcta: 1 },
      { pregunta: "La ecuación de la circunferencia permite describir puntos que están a una misma distancia de un centro.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-IV-P08",
    codigo: "PM-IV-P08-VID01",
    titulo: "Video básico: Ecuaciones con dos variables para hacer estimaciones",
    descripcion: "Video explicativo sobre cómo aplicar ecuaciones con dos variables para realizar estimaciones sencillas.",
    titulo_video: "Ecuaciones con dos variables para hacer estimaciones",
    descripcion_video: "Video que explica cómo usar ecuaciones con dos variables para hacer estimaciones sencillas y consolidar lo aprendido sobre este tipo de ecuaciones.",
    preguntas: [
      { pregunta: "¿Qué tipo de estimación cotidiana podrías resolver usando una ecuación con dos variables?", tipo: "abierta" },
      { pregunta: "¿Cuántas incógnitas tiene, como mínimo, una ecuación con dos variables?", tipo: "opcion_multiple", opciones: ["Una","Tres","Dos"], respuesta_correcta: 2 },
      { pregunta: "Las ecuaciones con dos variables se pueden usar para estimar valores desconocidos en situaciones reales.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-IV-P05",
    codigo: "PM-IV-P05-VID01",
    titulo: "Video básico: La Ley de Senos y la Ley de Cosenos",
    descripcion: "Video explicativo sobre la Ley de Senos y la Ley de Cosenos en triángulos oblicuángulos.",
    titulo_video: "La Ley de Senos y la Ley de Cosenos",
    descripcion_video: "Video que explica cómo aplicar la Ley de Senos y la Ley de Cosenos para resolver triángulos oblicuángulos, es decir, sin ángulo recto.",
    preguntas: [
      { pregunta: "¿En qué situación usarías la Ley de Cosenos en lugar de la Ley de Senos para resolver un triángulo?", tipo: "abierta" },
      { pregunta: "¿Qué tipo de triángulo se resuelve utilizando la Ley de Senos y la Ley de Cosenos?", tipo: "opcion_multiple", opciones: ["Un triángulo oblicuángulo (sin ángulo recto)","Un triángulo isósceles rectángulo","Un triángulo equilátero solamente"], respuesta_correcta: 0 },
      { pregunta: "La Ley de Senos y la Ley de Cosenos permiten resolver triángulos que no tienen un ángulo recto.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
];

async function main() {
  const sb = createSB();
  log("\n🎬 Semestre 4 — Videos candidatas (tipo 'video_con_preguntas')\n");
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

  log(`\n✅ Sem4 videos candidatas: ${ok} insertados, ${fail} fallidos (de ${videos.length}).\n`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
