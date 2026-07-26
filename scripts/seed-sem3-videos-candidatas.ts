/**
 * Semestre 3 — Actividades de video candidatas (tipo 'video_con_preguntas').
 * Cubre las progresiones de Semestre III que aun no tenian video.
 * Mismo patron que seed-sem6-videos.ts: url_video PLACEHOLDER,
 * estado='borrador' hasta que el cliente entregue los enlaces reales de YouTube.
 * Uso: npx tsx scripts/seed-sem3-videos-candidatas.ts
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
    progresion: "CNEYT-III-P10",
    codigo: "CNEYT-III-P10-VID01",
    titulo: "Video básico: Estados de agregación de la materia y las capas de la Tierra",
    descripcion: "Video explicativo sobre los estados de agregación de la materia y su relación con la hidrósfera y la atmósfera.",
    titulo_video: "Estados de agregación de la materia y las capas de la Tierra",
    descripcion_video: "Video que explica los estados de agregación de la materia y cómo las propiedades de los cuerpos y la temperatura ayudan a comprender la composición e interacción de la hidrósfera y la atmósfera.",
    preguntas: [
      { pregunta: "¿Qué relación existe entre los estados de agregación de la materia y la composición de la hidrósfera y la atmósfera?", tipo: "abierta" },
      { pregunta: "¿Cuáles son los estados de agregación básicos de la materia?", tipo: "opcion_multiple", opciones: ["Sólido, líquido y gaseoso","Ácido, base y neutro","Mezcla, compuesto y elemento"], respuesta_correcta: 0 },
      { pregunta: "La temperatura influye en el estado de agregación en que se encuentra la materia.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-III-P09",
    codigo: "CNEYT-III-P09-VID01",
    titulo: "Video básico: La estructura de una reacción química",
    descripcion: "Video explicativo sobre la estructura de una reacción química y su importancia como proceso de transformación de la materia.",
    titulo_video: "La estructura de una reacción química",
    descripcion_video: "Video que explica los elementos que forman una reacción química (reactivos, productos y la flecha de reacción) y por qué representa un proceso de transformación de la materia.",
    preguntas: [
      { pregunta: "¿Qué elementos componen la estructura de una reacción química?", tipo: "abierta" },
      { pregunta: "¿Cómo se llaman las sustancias que se transforman al inicio de una reacción química?", tipo: "opcion_multiple", opciones: ["Productos","Reactivos","Catalizadores"], respuesta_correcta: 1 },
      { pregunta: "En una reacción química, la materia se transforma pero no desaparece.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-III-P11",
    codigo: "CNEYT-III-P11-VID01",
    titulo: "Video básico: La oxigenación de la atmósfera primitiva",
    descripcion: "Video explicativo sobre el proceso de oxigenación de la atmósfera primitiva y su importancia para la vida en la Tierra.",
    titulo_video: "La oxigenación de la atmósfera primitiva",
    descripcion_video: "Video que explica cómo los organismos fotosintéticos transformaron la atmósfera primitiva al liberar oxígeno, y por qué este proceso hizo posible la vida tal como la conocemos.",
    preguntas: [
      { pregunta: "¿Qué papel jugaron los organismos fotosintéticos en la oxigenación de la atmósfera primitiva?", tipo: "abierta" },
      { pregunta: "¿Qué gas comenzó a acumularse en la atmósfera gracias a la fotosíntesis de organismos primitivos?", tipo: "opcion_multiple", opciones: ["Dióxido de carbono","Nitrógeno","Oxígeno"], respuesta_correcta: 2 },
      { pregunta: "La atmósfera primitiva de la Tierra no tenía la misma composición que la atmósfera actual.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-III-P06",
    codigo: "CNEYT-III-P06-VID01",
    titulo: "Video básico: El deterioro ambiental y sus escalas",
    descripcion: "Video explicativo sobre la dinámica de los subsistemas terrestres, la actividad humana y el concepto de deterioro ambiental.",
    titulo_video: "El deterioro ambiental y sus escalas",
    descripcion_video: "Video que explica cómo la actividad humana afecta la dinámica de los subsistemas terrestres, y cómo se manifiesta el deterioro ambiental en distintas escalas, desde lo local hasta lo global.",
    preguntas: [
      { pregunta: "¿Qué se entiende por deterioro ambiental y en qué escalas se puede manifestar?", tipo: "abierta" },
      { pregunta: "¿Cuáles son ejemplos de subsistemas terrestres afectados por la actividad humana?", tipo: "opcion_multiple", opciones: ["La atmósfera, la hidrósfera y la litósfera","El sistema solar y las galaxias","Los números y las operaciones"], respuesta_correcta: 0 },
      { pregunta: "La actividad humana puede alterar la dinámica de los subsistemas terrestres.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-III-P08",
    codigo: "CNEYT-III-P08-VID01",
    titulo: "Video básico: Innovaciones tecnológicas contra el deterioro ambiental",
    descripcion: "Video explicativo sobre innovaciones tecnológicas que aprovechan el conocimiento de los subsistemas terrestres para reducir el deterioro ambiental.",
    titulo_video: "Innovaciones tecnológicas contra el deterioro ambiental",
    descripcion_video: "Video que muestra ejemplos de innovaciones tecnológicas diseñadas a partir del conocimiento de los subsistemas terrestres para reducir o mitigar el deterioro ambiental.",
    preguntas: [
      { pregunta: "Menciona una innovación tecnológica que ayude a reducir el deterioro ambiental y explica cómo funciona.", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una innovación tecnológica orientada a reducir el deterioro ambiental?", tipo: "opcion_multiple", opciones: ["Los paneles solares","Los motores de combustión sin filtro","La tala no regulada"], respuesta_correcta: 0 },
      { pregunta: "El conocimiento científico de los subsistemas terrestres puede aplicarse para desarrollar tecnología que reduzca el daño ambiental.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-III-P01",
    codigo: "CNEYT-III-P01-VID01",
    titulo: "Video básico: Biomas y ecosistemas del planeta",
    descripcion: "Video explicativo sobre los componentes y características de los principales biomas y ecosistemas del planeta.",
    titulo_video: "Biomas y ecosistemas del planeta",
    descripcion_video: "Video que describe los principales biomas y ecosistemas del planeta, sus componentes bióticos y abióticos, y las características que los distinguen entre sí.",
    preguntas: [
      { pregunta: "¿Qué diferencia hay entre un bioma y un ecosistema?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un ejemplo de bioma?", tipo: "opcion_multiple", opciones: ["La selva tropical","El microscopio","La tabla periódica"], respuesta_correcta: 0 },
      { pregunta: "Los biomas y ecosistemas del planeta tienen componentes bióticos (seres vivos) y abióticos (factores físicos).", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-III-P04",
    codigo: "CNEYT-III-P04-VID01",
    titulo: "Video básico: Los ciclos biogeoquímicos",
    descripcion: "Video explicativo sobre los ciclos biogeoquímicos del agua, el carbono, el nitrógeno y el fósforo.",
    titulo_video: "Los ciclos biogeoquímicos",
    descripcion_video: "Video que explica cómo circulan el agua, el carbono, el nitrógeno y el fósforo entre los seres vivos y el ambiente a través de los ciclos biogeoquímicos.",
    preguntas: [
      { pregunta: "¿Por qué son importantes los ciclos biogeoquímicos para el funcionamiento de los ecosistemas?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes elementos NO forma parte de los ciclos biogeoquímicos estudiados?", tipo: "opcion_multiple", opciones: ["El fósforo","El sodio","El nitrógeno"], respuesta_correcta: 1 },
      { pregunta: "El ciclo del agua es uno de los ciclos biogeoquímicos fundamentales para la vida.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-III-P07",
    codigo: "CNEYT-III-P07-VID01",
    titulo: "Video básico: Conservación y restauración de ecosistemas en México",
    descripcion: "Video explicativo sobre políticas y estrategias de conservación y restauración de ecosistemas en México.",
    titulo_video: "Conservación y restauración de ecosistemas en México",
    descripcion_video: "Video que presenta políticas y estrategias que se implementan en México para conservar y restaurar los ecosistemas dañados.",
    preguntas: [
      { pregunta: "¿Qué diferencia hay entre una estrategia de conservación y una de restauración de ecosistemas?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una estrategia de conservación de ecosistemas en México?", tipo: "opcion_multiple", opciones: ["Las áreas naturales protegidas","La urbanización sin control","La deforestación"], respuesta_correcta: 0 },
      { pregunta: "México cuenta con políticas orientadas a conservar y restaurar sus ecosistemas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-III-P02",
    codigo: "IN-III-P02-VID01",
    titulo: "Video básico: Hablar de experiencias recientes en inglés",
    descripcion: "Video explicativo sobre cómo compartir experiencias personales recientes en inglés.",
    titulo_video: "Hablar de experiencias recientes en inglés",
    descripcion_video: "Video que explica cómo compartir experiencias personales recientes en inglés, contando qué ha hecho una persona y con quién, usando el present perfect.",
    preguntas: [
      { pregunta: "¿Cómo se construye una oración en inglés para contar algo que has hecho recientemente?", tipo: "abierta" },
      { pregunta: "¿Qué tiempo verbal se usa comúnmente en inglés para hablar de experiencias recientes?", tipo: "opcion_multiple", opciones: ["Present perfect","Past continuous","Future simple"], respuesta_correcta: 0 },
      { pregunta: "En inglés se puede indicar con quién se realizó una actividad reciente.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-III-P03",
    codigo: "IN-III-P03-VID01",
    titulo: "Video básico: Describir lugares y dar recomendaciones en inglés",
    descripcion: "Video explicativo sobre cómo describir lugares conocidos y dar recomendaciones básicas en inglés.",
    titulo_video: "Describir lugares y dar recomendaciones en inglés",
    descripcion_video: "Video que enseña a describir lugares conocidos, las actividades que se pueden hacer ahí, y a dar información y recomendaciones básicas en inglés.",
    preguntas: [
      { pregunta: "¿Qué información es útil incluir al describir un lugar en inglés?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes expresiones sirve para dar una recomendación en inglés?", tipo: "opcion_multiple", opciones: ["You should visit...","I have never...","She is doing..."], respuesta_correcta: 0 },
      { pregunta: "Al describir un lugar en inglés también se pueden mencionar actividades que se realizan ahí.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-III-P04",
    codigo: "IN-III-P04-VID01",
    titulo: "Video básico: Hábitos, frecuencia y preferencias en inglés",
    descripcion: "Video explicativo sobre cómo hablar en inglés de hábitos, frecuencia y preferencias en la vida cotidiana.",
    titulo_video: "Hábitos, frecuencia y preferencias en inglés",
    descripcion_video: "Video que explica cómo hablar en inglés sobre hábitos y preferencias de la vida diaria, y cómo comparar lo que hacen, eligen o prefieren distintas personas.",
    preguntas: [
      { pregunta: "¿Qué palabras en inglés sirven para expresar la frecuencia con la que se hace algo?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes palabras indica frecuencia en inglés?", tipo: "opcion_multiple", opciones: ["Usually","Yesterday","Tomorrow"], respuesta_correcta: 0 },
      { pregunta: "En inglés se pueden usar comparativos para contrastar las preferencias de dos personas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-III-P05",
    codigo: "IN-III-P05-VID01",
    titulo: "Video básico: Obligación y prohibición en inglés",
    descripcion: "Video explicativo sobre cómo expresar responsabilidades, normas, obligación y prohibición en inglés.",
    titulo_video: "Obligación y prohibición en inglés",
    descripcion_video: "Video que explica cómo hablar en inglés de responsabilidades y normas en la casa, la escuela o la comunidad, usando expresiones de obligación y prohibición.",
    preguntas: [
      { pregunta: "¿Qué expresiones en inglés se usan para hablar de una obligación?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes expresiones indica prohibición en inglés?", tipo: "opcion_multiple", opciones: ["You must not...","You should...","You can..."], respuesta_correcta: 0 },
      { pregunta: "El verbo modal 'must' puede usarse en inglés para expresar una obligación.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-III-P06",
    codigo: "IN-III-P06-VID01",
    titulo: "Video básico: Dar y entender instrucciones en inglés",
    descripcion: "Video explicativo sobre cómo pedir, dar y entender instrucciones más completas en inglés.",
    titulo_video: "Dar y entender instrucciones en inglés",
    descripcion_video: "Video que explica cómo pedir, dar y comprender instrucciones en inglés para orientar a alguien a hacer algo o llegar a un lugar.",
    preguntas: [
      { pregunta: "¿Qué elementos debe incluir una instrucción clara en inglés para orientar a alguien hacia un lugar?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes frases se usa en inglés para pedir instrucciones?", tipo: "opcion_multiple", opciones: ["Could you tell me how to get to...?","I have finished my homework.","She was reading a book."], respuesta_correcta: 0 },
      { pregunta: "Los verbos en imperativo son útiles en inglés para dar instrucciones.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-III-P07",
    codigo: "IN-III-P07-VID01",
    titulo: "Video básico: Narrar eventos pasados en inglés",
    descripcion: "Video explicativo sobre cómo relatar eventos cotidianos y su secuencia en inglés.",
    titulo_video: "Narrar eventos pasados en inglés",
    descripcion_video: "Video que explica cómo contar algo que pasó en inglés, ordenando los eventos con conectores simples de secuencia.",
    preguntas: [
      { pregunta: "¿Qué conectores en inglés ayudan a ordenar los eventos de una historia?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes conectores en inglés indica secuencia?", tipo: "opcion_multiple", opciones: ["First, then, finally","Because","Although"], respuesta_correcta: 0 },
      { pregunta: "Para narrar eventos pasados en inglés se utiliza principalmente el past simple.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-III-P08",
    codigo: "IN-III-P08-VID01",
    titulo: "Video básico: Repaso integrador de inglés III",
    descripcion: "Video explicativo que consolida lo aprendido en el curso mediante actividades significativas.",
    titulo_video: "Repaso integrador de inglés III",
    descripcion_video: "Video que repasa las estructuras clave aprendidas durante el curso y muestra cómo aplicarlas en tareas orales y escritas contextualizadas.",
    preguntas: [
      { pregunta: "¿Cuál de las estructuras aprendidas en el curso te parece más útil para la vida cotidiana y por qué?", tipo: "abierta" },
      { pregunta: "¿Para qué sirve la producción guiada al final de un curso de inglés?", tipo: "opcion_multiple", opciones: ["Para aplicar en la práctica las estructuras aprendidas","Para memorizar solo vocabulario nuevo","Para evitar hablar en inglés"], respuesta_correcta: 0 },
      { pregunta: "Consolidar lo aprendido implica poner en práctica las estructuras clave en tareas orales y escritas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-III-P02",
    codigo: "LC-III-P02-VID01",
    titulo: "Video básico: Los movimientos literarios",
    descripcion: "Video explicativo sobre los diversos movimientos literarios y sus particularidades.",
    titulo_video: "Los movimientos literarios",
    descripcion_video: "Video que explica, a través de la lectura, los diversos movimientos literarios y las particularidades que los distinguen entre sí.",
    preguntas: [
      { pregunta: "¿Qué es un movimiento literario y por qué es importante reconocerlo al leer una obra?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un ejemplo de movimiento literario?", tipo: "opcion_multiple", opciones: ["El romanticismo","La fotosíntesis","El teorema de Pitágoras"], respuesta_correcta: 0 },
      { pregunta: "Cada movimiento literario tiene características propias que lo distinguen de otros.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-III-P03",
    codigo: "LC-III-P03-VID01",
    titulo: "Video básico: Los géneros literarios y sus perspectivas",
    descripcion: "Video explicativo sobre los géneros literarios y su papel para involucrar perspectivas diversas.",
    titulo_video: "Los géneros literarios y sus perspectivas",
    descripcion_video: "Video que explica los géneros literarios y cómo, a través de la lectura, permiten conocer perspectivas de diversa índole.",
    preguntas: [
      { pregunta: "¿Cómo permite un género literario conocer una perspectiva distinta a la propia?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un género literario?", tipo: "opcion_multiple", opciones: ["El lírico","El aritmético","El geográfico"], respuesta_correcta: 0 },
      { pregunta: "Los géneros literarios pueden mostrar perspectivas diversas sobre la realidad.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-III-P04",
    codigo: "LC-III-P04-VID01",
    titulo: "Video básico: Los subgéneros narrativos",
    descripcion: "Video explicativo sobre los subgéneros narrativos y sus elementos discursivos.",
    titulo_video: "Los subgéneros narrativos",
    descripcion_video: "Video que identifica los principales subgéneros narrativos y los elementos discursivos que los conforman a partir de la lectura.",
    preguntas: [
      { pregunta: "¿Qué elementos discursivos ayudan a identificar un subgénero narrativo?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un subgénero narrativo?", tipo: "opcion_multiple", opciones: ["El cuento","El soneto","El ensayo argumentativo"], respuesta_correcta: 0 },
      { pregunta: "Los subgéneros narrativos comparten elementos discursivos, aunque cada uno tiene rasgos propios.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-III-P05",
    codigo: "LC-III-P05-VID01",
    titulo: "Video básico: Las figuras retóricas en la poesía",
    descripcion: "Video explicativo sobre las figuras retóricas presentes en fragmentos de poesía.",
    titulo_video: "Las figuras retóricas en la poesía",
    descripcion_video: "Video que analiza fragmentos de poesía leídos en voz alta para identificar y valorar las figuras retóricas que utilizan.",
    preguntas: [
      { pregunta: "¿Qué es una figura retórica y qué función cumple en un poema?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una figura retórica?", tipo: "opcion_multiple", opciones: ["La metáfora","La ecuación","El teorema"], respuesta_correcta: 0 },
      { pregunta: "Leer poesía en voz alta ayuda a apreciar mejor sus figuras retóricas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-III-P06",
    codigo: "LC-III-P06-VID01",
    titulo: "Video básico: La reseña crítica",
    descripcion: "Video explicativo sobre las características de la reseña crítica.",
    titulo_video: "La reseña crítica",
    descripcion_video: "Video que explica las características de la reseña crítica y cómo elaborar una composición basada en un movimiento literario.",
    preguntas: [
      { pregunta: "¿Qué elementos debe contener una reseña crítica?", tipo: "abierta" },
      { pregunta: "¿Cuál es el propósito principal de una reseña crítica?", tipo: "opcion_multiple", opciones: ["Analizar y valorar una obra","Narrar una historia de ficción","Resolver una ecuación"], respuesta_correcta: 0 },
      { pregunta: "Una reseña crítica puede basarse en un movimiento literario específico.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-III-P07",
    codigo: "LC-III-P07-VID01",
    titulo: "Video básico: La exposición oral formal de una reseña",
    descripcion: "Video explicativo sobre la exposición oral formal de una reseña crítica.",
    titulo_video: "La exposición oral formal de una reseña",
    descripcion_video: "Video que explica cómo realizar una exposición oral formal, en un coloquio, un simposio o un foro, para compartir el análisis crítico de una reseña.",
    preguntas: [
      { pregunta: "¿Qué recomendaciones seguirías para presentar de forma oral y formal el análisis de una reseña?", tipo: "abierta" },
      { pregunta: "¿En cuál de los siguientes espacios se puede realizar una exposición oral formal?", tipo: "opcion_multiple", opciones: ["Un coloquio o simposio","Una conversación informal por chat","Un mensaje de texto"], respuesta_correcta: 0 },
      { pregunta: "La exposición oral formal permite compartir y explicar un análisis crítico ante un público.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-III-P02",
    codigo: "PFH-III-P02-VID01",
    titulo: "Video básico: Los problemas de la filosofía política",
    descripcion: "Video explicativo sobre los problemas de la filosofía política y su relación con la realidad social contemporánea.",
    titulo_video: "Los problemas de la filosofía política",
    descripcion_video: "Video que explica algunos problemas centrales de la filosofía política y cómo un análisis argumentado ayuda a cuestionar la realidad social contemporánea.",
    preguntas: [
      { pregunta: "¿Qué problema de la filosofía política te parece más relevante para la sociedad actual y por qué?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un tema propio de la filosofía política?", tipo: "opcion_multiple", opciones: ["La justicia y el poder","La fotosíntesis","Las ecuaciones cuadráticas"], respuesta_correcta: 0 },
      { pregunta: "La filosofía política permite cuestionar situaciones de la realidad social contemporánea.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-III-P03",
    codigo: "PFH-III-P03-VID01",
    titulo: "Video básico: El arte y las categorías estéticas",
    descripcion: "Video explicativo sobre el arte y las categorías estéticas desde la perspectiva filosófica.",
    titulo_video: "El arte y las categorías estéticas",
    descripcion_video: "Video que reflexiona sobre la cultura contemporánea y su influencia en la vida cotidiana a partir del análisis del arte y las categorías estéticas desde la filosofía.",
    preguntas: [
      { pregunta: "¿Qué categoría estética reconoces en una obra de arte que te guste y por qué?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una categoría estética?", tipo: "opcion_multiple", opciones: ["Lo bello","Lo racional","Lo numérico"], respuesta_correcta: 0 },
      { pregunta: "El análisis filosófico del arte ayuda a reflexionar sobre la cultura contemporánea.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-III-P04",
    codigo: "PFH-III-P04-VID01",
    titulo: "Video básico: Filosofía y humanismo ante problemas contemporáneos",
    descripcion: "Video explicativo sobre cómo integrar saberes filosóficos y perspectivas humanistas frente a problemas contemporáneos.",
    titulo_video: "Filosofía y humanismo ante problemas contemporáneos",
    descripcion_video: "Video que explica cómo integrar saberes filosóficos y perspectivas humanistas para reflexionar sobre problemas contemporáneos y sus implicaciones éticas, sociales y culturales.",
    preguntas: [
      { pregunta: "¿Cómo puede el pensamiento filosófico ayudarte a transformar tu realidad cotidiana?", tipo: "abierta" },
      { pregunta: "¿Qué tipo de implicaciones consideran los saberes filosóficos y humanistas al analizar un problema contemporáneo?", tipo: "opcion_multiple", opciones: ["Éticas, sociales y culturales","Únicamente matemáticas","Únicamente biológicas"], respuesta_correcta: 0 },
      { pregunta: "Integrar saberes filosóficos y humanistas permite reconocerse como capaz de transformar la realidad.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-III-P10",
    codigo: "PM-III-P10-VID01",
    titulo: "Video básico: Ecuaciones lineales con dos incógnitas",
    descripcion: "Video explicativo sobre cómo resolver ecuaciones lineales con dos incógnitas en situaciones de interés.",
    titulo_video: "Ecuaciones lineales con dos incógnitas",
    descripcion_video: "Video que explica cómo aplicar la aritmética y el álgebra para resolver ecuaciones lineales con dos incógnitas en situaciones cotidianas.",
    preguntas: [
      { pregunta: "¿Qué significa que una ecuación lineal tenga dos incógnitas?", tipo: "abierta" },
      { pregunta: "¿Cuántas incógnitas tiene una ecuación lineal con dos incógnitas?", tipo: "opcion_multiple", opciones: ["Una","Dos","Tres"], respuesta_correcta: 1 },
      { pregunta: "Las ecuaciones lineales con dos incógnitas se pueden usar para modelar situaciones de la vida cotidiana.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-III-P08",
    codigo: "PM-III-P08-VID01",
    titulo: "Video básico: Sistemas de ecuaciones lineales",
    descripcion: "Video explicativo sobre cómo resolver sistemas de ecuaciones lineales usando álgebra y el método gráfico.",
    titulo_video: "Sistemas de ecuaciones lineales",
    descripcion_video: "Video que explica cómo resolver sistemas de ecuaciones lineales usando la aritmética, el álgebra y el método gráfico en situaciones de interés.",
    preguntas: [
      { pregunta: "¿Qué representa gráficamente la solución de un sistema de ecuaciones lineales?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un método para resolver un sistema de ecuaciones lineales?", tipo: "opcion_multiple", opciones: ["El método gráfico","El método de Miller-Urey","El método de Punnett"], respuesta_correcta: 0 },
      { pregunta: "Un sistema de ecuaciones lineales se puede resolver de más de una manera, por ejemplo algebraica o gráficamente.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-III-P02",
    codigo: "PM-III-P02-VID01",
    titulo: "Video básico: Resolución de ecuaciones cuadráticas",
    descripcion: "Video explicativo sobre cómo resolver ecuaciones cuadráticas en situaciones de interés.",
    titulo_video: "Resolución de ecuaciones cuadráticas",
    descripcion_video: "Video que explica cómo aplicar la aritmética y el álgebra para resolver ecuaciones cuadráticas que representan situaciones de interés.",
    preguntas: [
      { pregunta: "¿Qué caracteriza a una ecuación cuadrática en comparación con una ecuación lineal?", tipo: "abierta" },
      { pregunta: "¿Cuál es el grado máximo de una ecuación cuadrática?", tipo: "opcion_multiple", opciones: ["Uno","Dos","Tres"], respuesta_correcta: 1 },
      { pregunta: "Las ecuaciones cuadráticas pueden usarse para resolver problemas de situaciones de interés.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-III-P06",
    codigo: "PM-III-P06-VID01",
    titulo: "Video básico: Modelar situaciones con ecuaciones",
    descripcion: "Video explicativo sobre cómo expresar y resolver situaciones de interés usando distintos tipos de ecuaciones.",
    titulo_video: "Modelar situaciones con ecuaciones",
    descripcion_video: "Video que explica cómo expresar y resolver diversas situaciones de interés mediante distintos tipos de ecuaciones, y su relevancia en otras áreas del conocimiento y en fenómenos de la vida cotidiana.",
    preguntas: [
      { pregunta: "Da un ejemplo de una situación de la vida cotidiana que se pueda representar con una ecuación.", tipo: "abierta" },
      { pregunta: "¿Para qué sirve modelar una situación de interés a través de una ecuación?", tipo: "opcion_multiple", opciones: ["Para representarla y resolverla matemáticamente","Para memorizarla sin comprenderla","Para eliminarla del problema"], respuesta_correcta: 0 },
      { pregunta: "Distintos tipos de ecuaciones pueden aplicarse a fenómenos naturales y a otras áreas del conocimiento.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-III-P05",
    codigo: "PM-III-P05-VID01",
    titulo: "Video básico: El teorema del triángulo de Napoleón",
    descripcion: "Video explicativo sobre el teorema del triángulo de Napoleón y su relación con la geometría euclidiana.",
    titulo_video: "El teorema del triángulo de Napoleón",
    descripcion_video: "Video que presenta el teorema del triángulo de Napoleón como un problema-meta para aplicar resultados de la geometría euclidiana.",
    preguntas: [
      { pregunta: "¿Qué construcción geométrica describe el teorema del triángulo de Napoleón?", tipo: "abierta" },
      { pregunta: "¿Qué tipo de triángulos se construyen sobre los lados de un triángulo cualquiera según el teorema de Napoleón?", tipo: "opcion_multiple", opciones: ["Triángulos equiláteros","Triángulos rectángulos","Triángulos isósceles"], respuesta_correcta: 0 },
      { pregunta: "El teorema del triángulo de Napoleón se apoya en resultados de la geometría euclidiana.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-III-P03",
    codigo: "PM-III-P03-VID01",
    titulo: "Video básico: El discriminante y las raíces de una ecuación cuadrática",
    descripcion: "Video explicativo sobre el discriminante y la naturaleza de las raíces de una ecuación cuadrática.",
    titulo_video: "El discriminante y las raíces de una ecuación cuadrática",
    descripcion_video: "Video que explica qué es el discriminante de una ecuación cuadrática y cómo su valor permite interpretar la naturaleza de sus raíces.",
    preguntas: [
      { pregunta: "¿Qué información proporciona el discriminante sobre las raíces de una ecuación cuadrática?", tipo: "abierta" },
      { pregunta: "Si el discriminante de una ecuación cuadrática es negativo, ¿qué se puede afirmar de sus raíces?", tipo: "opcion_multiple", opciones: ["Son reales","No son reales (son complejas)","Son iguales a cero"], respuesta_correcta: 1 },
      { pregunta: "El discriminante permite saber si una ecuación cuadrática tiene raíces reales o no.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-III-P04",
    codigo: "PM-III-P04-VID01",
    titulo: "Video básico: Perímetros, áreas y volúmenes",
    descripcion: "Video explicativo sobre el cálculo de perímetros, áreas y volúmenes de figuras y sólidos geométricos comunes.",
    titulo_video: "Perímetros, áreas y volúmenes",
    descripcion_video: "Video que explica cómo calcular perímetros, áreas y volúmenes de figuras y sólidos geométricos comunes.",
    preguntas: [
      { pregunta: "¿Qué diferencia hay entre calcular el área y calcular el volumen de una figura?", tipo: "abierta" },
      { pregunta: "¿Qué se calcula al medir el contorno de una figura geométrica?", tipo: "opcion_multiple", opciones: ["El perímetro","El volumen","El área"], respuesta_correcta: 0 },
      { pregunta: "Los sólidos geométricos, a diferencia de las figuras planas, tienen volumen.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-III-P09",
    codigo: "PM-III-P09-VID01",
    titulo: "Video básico: Las inecuaciones lineales",
    descripcion: "Video explicativo sobre las inecuaciones lineales como complemento del estudio de las ecuaciones.",
    titulo_video: "Las inecuaciones lineales",
    descripcion_video: "Video que explica qué es una inecuación lineal, en qué se diferencia de una ecuación y cómo se representa su solución.",
    preguntas: [
      { pregunta: "¿En qué se diferencia una inecuación lineal de una ecuación lineal?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes símbolos aparece en una inecuación pero no en una ecuación?", tipo: "opcion_multiple", opciones: ["El signo igual (=)","El signo mayor que (>)","El signo de suma (+)"], respuesta_correcta: 1 },
      { pregunta: "La solución de una inecuación lineal suele ser un conjunto de valores, no un solo número.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
];

async function main() {
  const sb = createSB();
  log("\n🎬 Semestre 3 — Videos candidatas (tipo 'video_con_preguntas')\n");
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

  log(`\n✅ Sem3 videos candidatas: ${ok} insertados, ${fail} fallidos (de ${videos.length}).\n`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
