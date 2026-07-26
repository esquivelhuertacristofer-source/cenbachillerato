/**
 * Semestre 2 — Actividades de video candidatas (tipo 'video_con_preguntas').
 * Cubre las progresiones de Semestre II que aun no tenian video.
 * Mismo patron que seed-sem6-videos.ts: url_video PLACEHOLDER,
 * estado='borrador' hasta que el cliente entregue los enlaces reales de YouTube.
 * Uso: npx tsx scripts/seed-sem2-videos-candidatas.ts
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
    progresion: "CD-II-P02",
    codigo: "CD-II-P02-VID01",
    titulo: "Video básico: Las TICCAD para comunicarte e investigar en equipo",
    descripcion: "Video explicativo sobre cómo usar las TICCAD para comunicarte con equipos de trabajo e investigar información confiable.",
    titulo_video: "Las TICCAD para comunicarte e investigar en equipo",
    descripcion_video: "Video que explica qué son las TICCAD y cómo usarlas para interactuar con equipos colaborativos, así como para buscar, filtrar y gestionar información sobre un problema personal, social o ambiental.",
    preguntas: [
      { pregunta: "¿Qué pasos seguirías para gestionar la información que encuentras en línea sobre un problema social o ambiental?", tipo: "abierta" },
      { pregunta: "¿Qué significa 'discriminar información' en el contexto de una investigación digital?", tipo: "opcion_multiple", opciones: ["Seleccionar la información confiable y descartar la que no lo es","Copiar la información sin revisarla","Borrar toda la información encontrada"], respuesta_correcta: 0 },
      { pregunta: "Las TICCAD permiten trabajar de forma colaborativa con un equipo aunque sus integrantes estén en lugares distintos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CD-II-P03",
    codigo: "CD-II-P03-VID01",
    titulo: "Video básico: Técnicas de investigación digital",
    descripcion: "Video explicativo sobre las técnicas y métodos para investigar información en medios digitales.",
    titulo_video: "Técnicas de investigación digital",
    descripcion_video: "Video que explica cómo buscar, recopilar, extraer, organizar y difundir información digital sobre una situación, fenómeno o problemática de interés.",
    preguntas: [
      { pregunta: "¿Qué pasos seguirías para investigar en internet un problema social de tu comunidad de manera ordenada?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una etapa clave de la investigación digital?", tipo: "opcion_multiple", opciones: ["Ignorar las fuentes encontradas","Organizar la información recopilada","Publicar sin verificar los datos"], respuesta_correcta: 1 },
      { pregunta: "Difundir la información investigada de forma clara es parte del proceso de investigación digital.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CD-II-P04",
    codigo: "CD-II-P04-VID01",
    titulo: "Video básico: Medidas de tendencia central y dispersión con software",
    descripcion: "Video explicativo sobre cómo calcular medidas de tendencia central y dispersión usando herramientas de software.",
    titulo_video: "Medidas de tendencia central y dispersión con software",
    descripcion_video: "Video que explica cómo procesar datos de una situación, fenómeno o problemática usando software para calcular media, mediana, moda y dispersión, y representarlos en gráficas.",
    preguntas: [
      { pregunta: "¿Por qué es útil representar los datos en una gráfica además de calcular sus medidas de tendencia central?", tipo: "abierta" },
      { pregunta: "¿Cuál de estas es una medida de tendencia central?", tipo: "opcion_multiple", opciones: ["La desviación estándar","El rango","La media"], respuesta_correcta: 2 },
      { pregunta: "Las hojas de cálculo permiten calcular medidas de tendencia central y generar gráficas a partir de un conjunto de datos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CD-II-P05",
    codigo: "CD-II-P05-VID01",
    titulo: "Video básico: Páginas web para difundir información",
    descripcion: "Video explicativo sobre cómo usar páginas web para difundir información de una problemática de interés.",
    titulo_video: "Páginas web para difundir información",
    descripcion_video: "Video que explica cómo utilizar páginas web para compartir y difundir información sobre una situación, fenómeno o problemática relacionada con otras asignaturas.",
    preguntas: [
      { pregunta: "¿Qué elementos debe tener una página web para comunicar de forma clara una problemática social o ambiental?", tipo: "abierta" },
      { pregunta: "¿Cuál es una ventaja de usar una página web para difundir información?", tipo: "opcion_multiple", opciones: ["Puede llegar a muchas personas al mismo tiempo","Solo la puede ver una persona a la vez","No permite incluir imágenes ni videos"], respuesta_correcta: 0 },
      { pregunta: "Una página web puede usarse para difundir información relacionada con otras asignaturas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-II-P05",
    codigo: "CNEYT-II-P05-VID01",
    titulo: "Video básico: Fuerza, movimiento y energía mecánica",
    descripcion: "Video explicativo sobre la relación entre fuerza, movimiento y energía mecánica.",
    titulo_video: "Fuerza, movimiento y energía mecánica",
    descripcion_video: "Video que explica cómo el cambio de posición de un cuerpo al interactuar con otro permite comprender los conceptos de fuerza, movimiento y su relación con la energía mecánica.",
    preguntas: [
      { pregunta: "¿Qué sucede con la posición de un cuerpo cuando otro cuerpo ejerce una fuerza sobre él?", tipo: "abierta" },
      { pregunta: "¿Qué tipo de energía está relacionada con el movimiento y la posición de un cuerpo?", tipo: "opcion_multiple", opciones: ["La energía química","La energía mecánica","La energía sonora"], respuesta_correcta: 1 },
      { pregunta: "El movimiento de un cuerpo puede producirse por la interacción con otro cuerpo.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-II-P04",
    codigo: "CNEYT-II-P04-VID01",
    titulo: "Video básico: Calor y temperatura, ¿cuál es la diferencia?",
    descripcion: "Video explicativo sobre el intercambio de calor entre cuerpos y la diferencia entre calor y temperatura.",
    titulo_video: "Calor y temperatura: ¿cuál es la diferencia?",
    descripcion_video: "Video que explica cómo ocurre el intercambio de calor entre cuerpos y con el entorno, y aclara la diferencia entre los conceptos de calor y temperatura.",
    preguntas: [
      { pregunta: "¿Por qué el calor y la temperatura no son lo mismo, aunque estén relacionados?", tipo: "abierta" },
      { pregunta: "¿Qué describe mejor el 'calor' en física?", tipo: "opcion_multiple", opciones: ["El nivel de agitación de las partículas de un solo cuerpo","La cantidad de materia de un cuerpo","La energía que se transfiere entre cuerpos por diferencia de temperatura"], respuesta_correcta: 2 },
      { pregunta: "El calor puede transferirse entre un cuerpo y su entorno.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-II-P03",
    codigo: "CNEYT-II-P03-VID01",
    titulo: "Video básico: Trabajo mecánico, calor y termodinámica",
    descripcion: "Video explicativo sobre el vínculo entre trabajo mecánico y calor para comprender la termodinámica.",
    titulo_video: "Trabajo mecánico, calor y termodinámica",
    descripcion_video: "Video que explica cómo se relacionan el trabajo mecánico y el calor, y cómo esta relación da origen al concepto de termodinámica.",
    preguntas: [
      { pregunta: "¿Cómo se relacionan el trabajo mecánico y el calor en un sistema físico?", tipo: "abierta" },
      { pregunta: "¿Qué rama de la física estudia la relación entre calor y trabajo mecánico?", tipo: "opcion_multiple", opciones: ["La termodinámica","La óptica","La acústica"], respuesta_correcta: 0 },
      { pregunta: "El trabajo mecánico y el calor pueden transformarse el uno en el otro.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-II-P10",
    codigo: "CNEYT-II-P10-VID01",
    titulo: "Video básico: Leyes de la termodinámica, entropía y entalpía",
    descripcion: "Video explicativo sobre las aplicaciones de la primera ley de la termodinámica y los conceptos de entropía y entalpía.",
    titulo_video: "Leyes de la termodinámica, entropía y entalpía",
    descripcion_video: "Video que explica las aplicaciones de la primera ley de la termodinámica y presenta los conceptos de entropía, entalpía, y la segunda y tercera leyes de la termodinámica.",
    preguntas: [
      { pregunta: "¿Qué establece la primera ley de la termodinámica sobre la energía en un sistema?", tipo: "abierta" },
      { pregunta: "¿Qué concepto describe el grado de desorden de un sistema?", tipo: "opcion_multiple", opciones: ["La entalpía","La entropía","La presión"], respuesta_correcta: 1 },
      { pregunta: "La termodinámica tiene varias leyes, no solo una.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-II-P08",
    codigo: "CNEYT-II-P08-VID01",
    titulo: "Video básico: Tipos de energía en fenómenos naturales y tecnología",
    descripcion: "Video explicativo sobre los distintos tipos de energía presentes en fenómenos naturales y sus aplicaciones tecnológicas.",
    titulo_video: "Tipos de energía en fenómenos naturales y tecnología",
    descripcion_video: "Video que explica cómo distintos tipos de energía intervienen en fenómenos naturales y cómo esas ideas se aplican en tecnologías cotidianas.",
    preguntas: [
      { pregunta: "¿Qué tipo de energía identificas en un fenómeno natural que hayas observado, por ejemplo un rayo o el viento?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un ejemplo de aplicación tecnológica basada en un tipo de energía?", tipo: "opcion_multiple", opciones: ["Un lápiz de madera","Una hoja de papel","Un panel solar que aprovecha la energía luminosa"], respuesta_correcta: 2 },
      { pregunta: "Distintos tipos de energía pueden explicar fenómenos naturales y también dar lugar a aplicaciones tecnológicas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-II-P01",
    codigo: "CNEYT-II-P01-VID01",
    titulo: "Video básico: Qué es la energía, formas y unidades de medición",
    descripcion: "Video explicativo sobre la definición de energía, sus formas y sus unidades de medición.",
    titulo_video: "Qué es la energía: formas y unidades de medición",
    descripcion_video: "Video que explica qué es la energía, cuáles son sus principales formas (mecánica, térmica, eléctrica, entre otras) y en qué unidades se mide.",
    preguntas: [
      { pregunta: "¿Qué formas de energía identificas en tu vida diaria?", tipo: "abierta" },
      { pregunta: "¿En qué unidad se mide comúnmente la energía en el Sistema Internacional?", tipo: "opcion_multiple", opciones: ["El joule","El metro","El kilogramo"], respuesta_correcta: 0 },
      { pregunta: "La energía puede presentarse en distintas formas, como la mecánica, la térmica o la eléctrica.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-II-P06",
    codigo: "CNEYT-II-P06-VID01",
    titulo: "Video básico: Consumo energético e impacto ambiental",
    descripcion: "Video explicativo sobre el consumo energético y su impacto en el medio ambiente.",
    titulo_video: "Consumo energético e impacto ambiental",
    descripcion_video: "Video que explica cómo el consumo de energía en actividades humanas genera un impacto ambiental y qué se puede hacer para reducirlo.",
    preguntas: [
      { pregunta: "¿Qué acciones cotidianas de consumo energético generan mayor impacto ambiental?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes acciones ayuda a reducir el impacto ambiental del consumo energético?", tipo: "opcion_multiple", opciones: ["Dejar encendidas todas las luces siempre","Usar focos ahorradores y apagar aparatos que no se usan","Aumentar el uso de combustibles fósiles"], respuesta_correcta: 1 },
      { pregunta: "El consumo de energía está relacionado con el impacto ambiental.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-II-P07",
    codigo: "CNEYT-II-P07-VID01",
    titulo: "Video básico: Energías renovables y no renovables en México",
    descripcion: "Video explicativo sobre las energías renovables y no renovables que se aprovechan en México.",
    titulo_video: "Energías renovables y no renovables en México",
    descripcion_video: "Video que explica la diferencia entre energías renovables y no renovables, y presenta ejemplos de cada una que se utilizan en México.",
    preguntas: [
      { pregunta: "¿Qué energías renovables se aprovechan en las distintas regiones de México?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una fuente de energía renovable?", tipo: "opcion_multiple", opciones: ["El petróleo","El gas natural","La energía solar"], respuesta_correcta: 2 },
      { pregunta: "Las energías no renovables se agotan con el tiempo porque no se regeneran a la misma velocidad en que se consumen.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CS-II-P02",
    codigo: "CS-II-P02-VID01",
    titulo: "Video básico: Formas de organización social",
    descripcion: "Video explicativo sobre las características y formas de organización social.",
    titulo_video: "Formas de organización social",
    descripcion_video: "Video que explica las características de distintas formas de organización social y cómo se relacionan personas, grupos, comunidades e instituciones.",
    preguntas: [
      { pregunta: "¿Qué grupos o instituciones forman parte de la organización social de tu comunidad?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una forma de organización social?", tipo: "opcion_multiple", opciones: ["Una institución educativa","Un número aleatorio","Un color"], respuesta_correcta: 0 },
      { pregunta: "Las personas, los grupos, las comunidades y las instituciones se relacionan entre sí dentro de la organización social.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CS-II-P03",
    codigo: "CS-II-P03-VID01",
    titulo: "Video básico: Factores de producción y desigualdad en la distribución de bienes",
    descripcion: "Video explicativo sobre los factores de producción y la distribución desigual de los bienes en la sociedad.",
    titulo_video: "Factores de producción y desigualdad en la distribución de bienes",
    descripcion_video: "Video que explica qué son los procesos y factores de producción, y cómo estos explican la distribución desigual de los bienes en la sociedad.",
    preguntas: [
      { pregunta: "¿Por qué crees que los bienes no se distribuyen de manera igualitaria entre todas las personas de la sociedad?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un factor de producción?", tipo: "opcion_multiple", opciones: ["El clima","El trabajo","El idioma"], respuesta_correcta: 1 },
      { pregunta: "Los procesos de producción influyen en cómo se distribuyen los bienes en la sociedad.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CS-II-P04",
    codigo: "CS-II-P04-VID01",
    titulo: "Video básico: Las relaciones de poder en la organización social",
    descripcion: "Video explicativo sobre las relaciones de poder dentro de la organización social.",
    titulo_video: "Las relaciones de poder en la organización social",
    descripcion_video: "Video que explica qué son las relaciones de poder y cuál es su función dentro de la diversidad de la organización social.",
    preguntas: [
      { pregunta: "¿En qué espacios de tu vida cotidiana identificas relaciones de poder?", tipo: "abierta" },
      { pregunta: "¿Qué son las relaciones de poder dentro de la organización social?", tipo: "opcion_multiple", opciones: ["Un tipo de clima","Una operación matemática","Formas en que unas personas o grupos influyen o toman decisiones sobre otros"], respuesta_correcta: 2 },
      { pregunta: "Las relaciones de poder cumplen una función dentro del funcionamiento de la organización social.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-II-P02",
    codigo: "IN-II-P02-VID01",
    titulo: "Video básico: Hablar en inglés sobre el tiempo libre de otras personas",
    descripcion: "Video explicativo sobre cómo hablar en inglés de lo que hacen otras personas en su tiempo libre.",
    titulo_video: "Hablar en inglés sobre el tiempo libre de otras personas",
    descripcion_video: "Video que explica cómo describir en inglés las actividades de tiempo libre de otras personas y relacionarlas con momentos del día o de la semana.",
    preguntas: [
      { pregunta: "¿Cómo describirías en inglés lo que hace tu mejor amigo o amiga en su tiempo libre?", tipo: "abierta" },
      { pregunta: "¿Cuál de estas oraciones describe correctamente una actividad de tiempo libre de otra persona en inglés?", tipo: "opcion_multiple", opciones: ["She reads books on Sundays","She reading books Sunday","She to read books on Sunday"], respuesta_correcta: 0 },
      { pregunta: "En inglés se pueden usar expresiones de tiempo como 'on Sundays' o 'in the evening' para decir cuándo alguien hace una actividad.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-II-P03",
    codigo: "IN-II-P03-VID01",
    titulo: "Video básico: Expresar habilidades y pedir permiso en inglés",
    descripcion: "Video explicativo sobre cómo expresar habilidades y pedir o dar permiso en inglés.",
    titulo_video: "Expresar habilidades y pedir permiso en inglés (can / can't)",
    descripcion_video: "Video que explica cómo usar 'can' y 'can't' en inglés para expresar habilidades y para pedir o dar permiso en situaciones cotidianas.",
    preguntas: [
      { pregunta: "¿Qué habilidades puedes expresar en inglés usando la palabra 'can'?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes oraciones pide permiso correctamente en inglés?", tipo: "opcion_multiple", opciones: ["I opening the window can","Can I open the window?","Open can I the window"], respuesta_correcta: 1 },
      { pregunta: "La palabra 'can' en inglés se usa tanto para hablar de habilidades como para pedir permiso.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-II-P04",
    codigo: "IN-II-P04-VID01",
    titulo: "Video básico: Describir personas, vestimenta y clima en inglés",
    descripcion: "Video explicativo sobre cómo describir en inglés a las personas, su vestimenta y el clima.",
    titulo_video: "Describir personas, vestimenta y clima en inglés",
    descripcion_video: "Video que explica cómo describir en inglés a las personas, su vestimenta y el clima, respetando la diversidad y el contexto cultural.",
    preguntas: [
      { pregunta: "¿Cómo describirías en inglés la ropa que llevas puesta hoy?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes palabras en inglés describe el clima?", tipo: "opcion_multiple", opciones: ["Jacket","Tall","Rainy"], respuesta_correcta: 2 },
      { pregunta: "Describir a las personas en inglés debe hacerse respetando la diversidad y sin juzgar.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-II-P05",
    codigo: "IN-II-P05-VID01",
    titulo: "Video básico: Comparar personas, lugares y objetos en inglés",
    descripcion: "Video explicativo sobre cómo comparar personas, lugares y objetos en inglés usando adjetivos comparativos.",
    titulo_video: "Comparar personas, lugares y objetos en inglés (adjetivos comparativos)",
    descripcion_video: "Video que explica cómo usar adjetivos comparativos en inglés para comparar personas, lugares y objetos de manera respetuosa.",
    preguntas: [
      { pregunta: "¿Qué dos lugares de tu comunidad compararías en inglés y qué adjetivo usarías?", tipo: "abierta" },
      { pregunta: "¿Cuál es la forma comparativa correcta del adjetivo 'big' en inglés?", tipo: "opcion_multiple", opciones: ["Bigger","Biggest","More big"], respuesta_correcta: 0 },
      { pregunta: "Los adjetivos comparativos en inglés sirven para expresar diferencias entre dos elementos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-II-P06",
    codigo: "IN-II-P06-VID01",
    titulo: "Video básico: Preguntar y dar direcciones en inglés",
    descripcion: "Video explicativo sobre cómo preguntar y dar direcciones en inglés para ubicarse en la comunidad.",
    titulo_video: "Preguntar y dar direcciones en inglés",
    descripcion_video: "Video que explica cómo preguntar cómo llegar a un lugar en inglés y cómo dar referencias para orientar a otras personas.",
    preguntas: [
      { pregunta: "¿Cómo le explicarías en inglés a alguien cómo llegar de tu casa a la escuela?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes preguntas se usa en inglés para pedir direcciones?", tipo: "opcion_multiple", opciones: ["What time is it?","How do I get to the park?","How old are you?"], respuesta_correcta: 1 },
      { pregunta: "Dar direcciones en inglés implica usar referencias como 'turn left' o 'go straight'.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-II-P07",
    codigo: "IN-II-P07-VID01",
    titulo: "Video básico: Expresar deseos y necesidades en conversaciones en inglés",
    descripcion: "Video explicativo sobre cómo participar en inglés en intercambios cotidianos sobre necesidades personales o comunitarias.",
    titulo_video: "Expresar deseos y necesidades en conversaciones cotidianas en inglés",
    descripcion_video: "Video que explica cómo expresar deseos, hacer elecciones y mostrar empatía en inglés durante intercambios cotidianos sobre necesidades personales o comunitarias.",
    preguntas: [
      { pregunta: "¿Cómo expresarías en inglés un deseo o una necesidad importante para tu comunidad?", tipo: "abierta" },
      { pregunta: "¿Cuál de estas frases expresa un deseo en inglés?", tipo: "opcion_multiple", opciones: ["She is a doctor","The book is on the table","I would like some water, please"], respuesta_correcta: 2 },
      { pregunta: "Mostrar empatía en una conversación en inglés puede incluir frases como 'I understand how you feel'.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-II-P08",
    codigo: "IN-II-P08-VID01",
    titulo: "Video básico: Repaso integrador de inglés",
    descripcion: "Video explicativo que repasa las estructuras y el vocabulario clave de inglés aprendidos en el semestre.",
    titulo_video: "Repaso integrador de inglés: estructuras y vocabulario clave",
    descripcion_video: "Video que repasa, mediante actividades guiadas, las estructuras gramaticales y el vocabulario clave aprendidos en contextos escolares y comunitarios.",
    preguntas: [
      { pregunta: "¿Qué tema o estructura de inglés de este semestre te gustaría repasar más y por qué?", tipo: "abierta" },
      { pregunta: "¿Para qué sirve repasar estructuras y vocabulario en contextos guiados e integradores?", tipo: "opcion_multiple", opciones: ["Para consolidar los aprendizajes clave del curso","Para olvidar lo aprendido","Para evitar practicar el idioma"], respuesta_correcta: 0 },
      { pregunta: "Repasar el vocabulario y las estructuras aprendidas ayuda a consolidar el aprendizaje del idioma.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-II-P02",
    codigo: "LC-II-P02-VID01",
    titulo: "Video básico: Cómo escribir un texto descriptivo o narrativo propio",
    descripcion: "Video explicativo sobre cómo escribir un texto descriptivo o narrativo de autoría propia.",
    titulo_video: "Cómo escribir un texto descriptivo o narrativo propio",
    descripcion_video: "Video que explica los elementos básicos para escribir un texto descriptivo o narrativo original, de la propia autoría del estudiante.",
    preguntas: [
      { pregunta: "¿Qué tema elegirías para escribir tu propio texto descriptivo o narrativo?", tipo: "abierta" },
      { pregunta: "¿Qué caracteriza a un texto narrativo?", tipo: "opcion_multiple", opciones: ["Solo enumera características de un objeto","Cuenta una serie de sucesos o acciones","Solo presenta datos numéricos"], respuesta_correcta: 1 },
      { pregunta: "Un texto descriptivo se enfoca en presentar las características de personas, objetos o lugares.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-II-P03",
    codigo: "LC-II-P03-VID01",
    titulo: "Video básico: Características lingüísticas de las narrativas populares",
    descripcion: "Video explicativo sobre las características lingüísticas presentes en las narrativas populares.",
    titulo_video: "Características lingüísticas de las narrativas populares",
    descripcion_video: "Video que explica cómo identificar características lingüísticas propias de las narrativas populares a partir de su lectura.",
    preguntas: [
      { pregunta: "¿Qué narrativa popular de tu región conoces y qué características lingüísticas identificas en ella?", tipo: "abierta" },
      { pregunta: "¿Qué es una narrativa popular?", tipo: "opcion_multiple", opciones: ["Un documento oficial de gobierno","Una fórmula matemática","Un relato transmitido y compartido dentro de una cultura o comunidad"], respuesta_correcta: 2 },
      { pregunta: "Las narrativas populares tienen características lingüísticas propias que se pueden identificar al leerlas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-II-P04",
    codigo: "LC-II-P04-VID01",
    titulo: "Video básico: Personajes y escenarios en la narrativa popular",
    descripcion: "Video explicativo sobre la relevancia de los personajes y los escenarios en la narrativa popular.",
    titulo_video: "Personajes y escenarios en la narrativa popular",
    descripcion_video: "Video que explica la relevancia de los personajes y los escenarios en la narrativa popular, para retomar esos elementos en escritos propios.",
    preguntas: [
      { pregunta: "¿Qué personaje de una narrativa popular te parece más memorable y por qué?", tipo: "abierta" },
      { pregunta: "¿Qué elemento de una narrativa indica dónde y cuándo ocurren los hechos?", tipo: "opcion_multiple", opciones: ["El escenario","El personaje","El título"], respuesta_correcta: 0 },
      { pregunta: "Los personajes y los escenarios son elementos que se pueden retomar al escribir un texto propio.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-II-P05",
    codigo: "LC-II-P05-VID01",
    titulo: "Video básico: Ideas centrales y secundarias en las narrativas populares",
    descripcion: "Video explicativo sobre cómo distinguir ideas centrales y secundarias en las narrativas populares.",
    titulo_video: "Ideas centrales y secundarias en las narrativas populares",
    descripcion_video: "Video que explica cómo distinguir los temas y las ideas centrales de las secundarias en las narrativas populares, y el papel que cumplen en sus distintas expresiones.",
    preguntas: [
      { pregunta: "¿Cómo distinguirías la idea central de las ideas secundarias en una narrativa que conozcas?", tipo: "abierta" },
      { pregunta: "¿Qué es la idea central de un texto narrativo?", tipo: "opcion_multiple", opciones: ["Un detalle secundario sin importancia","El mensaje o suceso más importante alrededor del cual gira el relato","El nombre del autor"], respuesta_correcta: 1 },
      { pregunta: "Distinguir las ideas centrales de las secundarias ayuda a comprender mejor una narrativa popular.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-II-P06",
    codigo: "LC-II-P06-VID01",
    titulo: "Video básico: Cómo reescribir un texto integrando elementos narrativos",
    descripcion: "Video explicativo sobre cómo reescribir un texto integrando elementos lingüísticos y narrativos.",
    titulo_video: "Cómo reescribir un texto integrando elementos narrativos",
    descripcion_video: "Video que explica cómo reescribir un texto propio integrando los elementos lingüísticos y narrativos que se consideren pertinentes.",
    preguntas: [
      { pregunta: "¿Qué cambiarías al reescribir uno de tus textos para mejorarlo?", tipo: "abierta" },
      { pregunta: "¿Para qué sirve reescribir un texto?", tipo: "opcion_multiple", opciones: ["Para eliminar por completo la idea original","Para copiar el texto de otra persona","Para mejorar e integrar elementos lingüísticos y narrativos pertinentes"], respuesta_correcta: 2 },
      { pregunta: "Reescribir un texto permite mejorar sus elementos narrativos y lingüísticos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-II-P07",
    codigo: "LC-II-P07-VID01",
    titulo: "Video básico: Análisis colaborativo de procedimientos narrativos",
    descripcion: "Video explicativo sobre cómo colaborar en el análisis de los procedimientos narrativos de un texto.",
    titulo_video: "Análisis colaborativo de procedimientos narrativos",
    descripcion_video: "Video que explica cómo colaborar con otros para analizar textos y así conocer, aprovechar o corregir sus procedimientos narrativos.",
    preguntas: [
      { pregunta: "¿Qué ventajas tiene analizar un texto en equipo en lugar de hacerlo de forma individual?", tipo: "abierta" },
      { pregunta: "¿Qué se busca al analizar en equipo los procedimientos narrativos de un texto?", tipo: "opcion_multiple", opciones: ["Conocerlos, aprovecharlos o corregirlos","Memorizarlos sin comprenderlos","Ignorarlos por completo"], respuesta_correcta: 0 },
      { pregunta: "El análisis colaborativo de textos permite identificar procedimientos narrativos que se pueden mejorar.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-II-P08",
    codigo: "LC-II-P08-VID01",
    titulo: "Video básico: Proyectos creativos que integran lectura, escritura y oralidad",
    descripcion: "Video explicativo sobre cómo integrar la lectura, la escritura y la oralidad en un proyecto creativo.",
    titulo_video: "Proyectos creativos que integran lectura, escritura y oralidad",
    descripcion_video: "Video que explica cómo integrar prácticas de lectura, escritura y oralidad en un proyecto creativo para presentar un texto elaborado.",
    preguntas: [
      { pregunta: "¿Cómo presentarías de forma creativa un texto que hayas escrito, combinando lectura, escritura y oralidad?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una práctica de oralidad?", tipo: "opcion_multiple", opciones: ["Escribir un borrador en la computadora","Leer en voz alta un texto ante un público","Corregir la ortografía de un texto"], respuesta_correcta: 1 },
      { pregunta: "Un proyecto creativo puede integrar prácticas de lectura, escritura y oralidad al mismo tiempo.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-II-P02",
    codigo: "PFH-II-P02-VID01",
    titulo: "Video básico: Fundamentos éticos y dilemas morales en la vida cotidiana",
    descripcion: "Video explicativo sobre los fundamentos éticos y los dilemas morales en la vida cotidiana.",
    titulo_video: "Fundamentos éticos y dilemas morales en la vida cotidiana",
    descripcion_video: "Video que explica los fundamentos éticos y su aplicación en la vida cotidiana, e invita a reflexionar críticamente sobre dilemas morales y el papel de la Filosofía en la toma de decisiones.",
    preguntas: [
      { pregunta: "¿Qué dilema moral has enfrentado o conoces en tu vida cotidiana?", tipo: "abierta" },
      { pregunta: "¿Qué es un dilema moral?", tipo: "opcion_multiple", opciones: ["Un problema matemático sin solución","Una situación en la que hay que elegir entre valores o principios en conflicto","Un tipo de experimento científico"], respuesta_correcta: 1 },
      { pregunta: "La Filosofía puede aportar herramientas para reflexionar sobre la toma de decisiones ante dilemas morales.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-II-P03",
    codigo: "PFH-II-P03-VID01",
    titulo: "Video básico: Desafíos éticos de la ciencia y la tecnología en México",
    descripcion: "Video explicativo sobre los desafíos éticos que plantean los avances de la ciencia y la tecnología en México.",
    titulo_video: "Desafíos éticos de la ciencia y la tecnología en México",
    descripcion_video: "Video que explica algunos desafíos éticos que plantean los avances científicos y tecnológicos en el contexto de nuestro país.",
    preguntas: [
      { pregunta: "¿Qué avance científico o tecnológico reciente en México te parece que plantea un desafío ético?", tipo: "abierta" },
      { pregunta: "¿Por qué los avances de la ciencia y la tecnología pueden plantear desafíos éticos?", tipo: "opcion_multiple", opciones: ["Porque pueden afectar valores, derechos o el bienestar de las personas","Porque siempre son gratuitos","Porque no tienen ninguna consecuencia social"], respuesta_correcta: 0 },
      { pregunta: "Desarrollar una conciencia crítica ayuda a analizar los desafíos éticos de la ciencia y la tecnología.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-II-P04",
    codigo: "PFH-II-P04-VID01",
    titulo: "Video básico: Las desigualdades de género desde la filosofía",
    descripcion: "Video explicativo sobre las desigualdades de género analizadas desde una mirada filosófica.",
    titulo_video: "Las desigualdades de género desde la filosofía",
    descripcion_video: "Video que explica cómo se pueden analizar las desigualdades de género desde una mirada filosófica, contrastando distintas perspectivas feministas.",
    preguntas: [
      { pregunta: "¿Qué desigualdad de género identificas en tu entorno y cómo podría analizarse desde la Filosofía?", tipo: "abierta" },
      { pregunta: "¿Para qué sirve contrastar diversas perspectivas feministas al analizar las desigualdades de género?", tipo: "opcion_multiple", opciones: ["Para elegir una única verdad absoluta sin discusión","Para promover la reflexión, el diálogo y una postura frente al tema","Para evitar hablar del tema"], respuesta_correcta: 1 },
      { pregunta: "Las desigualdades de género pueden analizarse desde diferentes perspectivas filosóficas y feministas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-II-P05",
    codigo: "PFH-II-P05-VID01",
    titulo: "Video básico: Problemas filosóficos contemporáneos",
    descripcion: "Video explicativo sobre problemas filosóficos contemporáneos relacionados con la ontología, la ética, la bioética, el género y la interculturalidad.",
    titulo_video: "Problemas filosóficos contemporáneos: ontología, ética, bioética, género e interculturalidad",
    descripcion_video: "Video que explica cómo integrar saberes filosóficos y perspectivas humanistas para reflexionar sobre problemas contemporáneos de la Ontología, la Ética, la Bioética, el género y la interculturalidad.",
    preguntas: [
      { pregunta: "¿Cuál de estos temas contemporáneos (ontología, ética, bioética, género o interculturalidad) te interesa más analizar y por qué?", tipo: "abierta" },
      { pregunta: "¿Qué rama de la Filosofía estudia la naturaleza del ser y de la existencia?", tipo: "opcion_multiple", opciones: ["La Bioética","La interculturalidad","La Ontología"], respuesta_correcta: 2 },
      { pregunta: "Integrar distintos saberes filosóficos permite elaborar reflexiones argumentadas sobre problemas contemporáneos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-II-P02",
    codigo: "PM-II-P02-VID01",
    titulo: "Video básico: Clasificación de las expresiones algebraicas",
    descripcion: "Video explicativo sobre la clasificación de las expresiones algebraicas.",
    titulo_video: "Clasificación de las expresiones algebraicas: monomios, binomios y polinomios",
    descripcion_video: "Video que explica cómo se clasifican las expresiones algebraicas en monomios, binomios, trinomios y polinomios, según su número de términos.",
    preguntas: [
      { pregunta: "¿Cómo distinguirías un monomio de un binomio con tus propias palabras?", tipo: "abierta" },
      { pregunta: "¿Cómo se llama una expresión algebraica con exactamente tres términos?", tipo: "opcion_multiple", opciones: ["Trinomio","Binomio","Monomio"], respuesta_correcta: 0 },
      { pregunta: "Un polinomio es una expresión algebraica formada por varios términos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-II-P07",
    codigo: "PM-II-P07-VID01",
    titulo: "Video básico: Operaciones con monomios y binomios",
    descripcion: "Video explicativo sobre cómo realizar operaciones con monomios y binomios.",
    titulo_video: "Operaciones con monomios y binomios",
    descripcion_video: "Video que explica cómo realizar operaciones aritméticas y algebraicas con monomios y binomios en situaciones de interés, analizando sus componentes.",
    preguntas: [
      { pregunta: "¿En qué situación de la vida cotidiana podrías usar una operación con monomios o binomios?", tipo: "abierta" },
      { pregunta: "¿Qué se debe analizar antes de operar con monomios o binomios?", tipo: "opcion_multiple", opciones: ["El color con que están escritos","Sus componentes, como coeficientes y exponentes","El número de página del libro"], respuesta_correcta: 1 },
      { pregunta: "Es posible sumar, restar y multiplicar monomios y binomios.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-II-P08",
    codigo: "PM-II-P08-VID01",
    titulo: "Video básico: Operaciones con trinomios y polinomios",
    descripcion: "Video explicativo sobre cómo realizar operaciones con trinomios y polinomios.",
    titulo_video: "Operaciones con trinomios y polinomios",
    descripcion_video: "Video que explica cómo realizar operaciones aritméticas y algebraicas con trinomios y polinomios en situaciones de interés, analizando sus componentes.",
    preguntas: [
      { pregunta: "¿Qué diferencia encuentras entre operar con un trinomio y operar con un polinomio de más términos?", tipo: "abierta" },
      { pregunta: "¿Qué operación permite combinar dos polinomios sumando sus términos semejantes?", tipo: "opcion_multiple", opciones: ["La raíz cuadrada","La suma de polinomios","El logaritmo"], respuesta_correcta: 1 },
      { pregunta: "Los trinomios son un tipo particular de polinomio con tres términos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-II-P03",
    codigo: "PM-II-P03-VID01",
    titulo: "Video básico: La relevancia del álgebra en otras áreas del conocimiento",
    descripcion: "Video explicativo sobre la relevancia del álgebra en otras áreas del conocimiento y de la vida humana.",
    titulo_video: "La relevancia del álgebra en otras áreas del conocimiento",
    descripcion_video: "Video que explica cómo el álgebra se aplica en situaciones de interés y por qué es relevante en otras áreas del conocimiento, en fenómenos naturales y en distintas esferas de la vida humana.",
    preguntas: [
      { pregunta: "¿En qué área de tu vida o de otra materia crees que podrías aplicar el álgebra?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una aplicación del álgebra fuera de las matemáticas?", tipo: "opcion_multiple", opciones: ["Memorizar fechas históricas","Aprender vocabulario nuevo","Modelar un fenómeno natural con una fórmula"], respuesta_correcta: 2 },
      { pregunta: "El álgebra puede aplicarse para comprender fenómenos naturales y otras áreas del conocimiento.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
];

async function main() {
  const sb = createSB();
  log("\n🎬 Semestre 2 — Videos candidatas (tipo 'video_con_preguntas')\n");
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

  log(`\n✅ Sem2 videos candidatas: ${ok} insertados, ${fail} fallidos (de ${videos.length}).\n`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
