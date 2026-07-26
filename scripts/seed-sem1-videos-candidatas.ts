/**
 * Semestre 1 — Actividades de video candidatas (tipo 'video_con_preguntas').
 * Cubre las progresiones de Semestre I que aun no tenian video.
 * Mismo patron que seed-sem6-videos.ts: url_video PLACEHOLDER,
 * estado='borrador' hasta que el cliente entregue los enlaces reales de YouTube.
 * Uso: npx tsx scripts/seed-sem1-videos-candidatas.ts
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
    progresion: "CD-I-P02",
    codigo: "CD-I-P02-VID01",
    titulo: "Video básico: Tipos de licenciamiento de software: privativo y libre",
    descripcion: "Video explicativo sobre los tipos de licenciamiento de software y los requerimientos de hardware para acceder a servicios digitales.",
    titulo_video: "Tipos de licenciamiento de software: privativo y libre",
    descripcion_video: "Video que explica la diferencia entre las licencias de software privativo y las licencias libres, y qué requerimientos de hardware y software se necesitan para acceder a servicios tecnológicos y digitales.",
    preguntas: [
      { pregunta: "¿Cuál es la diferencia principal entre una licencia de software privativo y una licencia de software libre?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una característica del software libre?", tipo: "opcion_multiple", opciones: ["Permite modificar y compartir su código fuente","Prohíbe cualquier tipo de modificación","Solo puede usarse con autorización de una empresa"], respuesta_correcta: 0 },
      { pregunta: "Para acceder a ciertos servicios digitales es necesario cumplir con requerimientos mínimos de hardware y software.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CD-I-P03",
    codigo: "CD-I-P03-VID01",
    titulo: "Video básico: El impacto de las tecnologías digitales en las comunidades",
    descripcion: "Video explicativo sobre el impacto del uso de las tecnologías digitales y las políticas de información en las personas y comunidades.",
    titulo_video: "El impacto de las tecnologías digitales en las comunidades",
    descripcion_video: "Video que analiza cómo el uso de las tecnologías digitales y las políticas sobre disponibilidad y gestión de la información afectan la vida de las personas y de las comunidades.",
    preguntas: [
      { pregunta: "Menciona un ejemplo de cómo el uso de las tecnologías digitales puede afectar positiva o negativamente a una comunidad.", tipo: "abierta" },
      { pregunta: "¿Qué tipo de políticas influyen en cómo las comunidades acceden a la información digital?", tipo: "opcion_multiple", opciones: ["Las políticas de tránsito vehicular","Las políticas de disponibilidad y gestión de la información","Las políticas de horarios escolares"], respuesta_correcta: 1 },
      { pregunta: "El uso de las tecnologías digitales no tiene ningún impacto en la vida de las comunidades.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "CD-I-P09",
    codigo: "CD-I-P09-VID01",
    titulo: "Video básico: Alternativas de software libre a los programas privativos",
    descripcion: "Video explicativo sobre el uso de herramientas de software libre como alternativa a los programas de patente.",
    titulo_video: "Alternativas de software libre a los programas privativos",
    descripcion_video: "Video que muestra cómo utilizar herramientas de software libre y explorar alternativas a los programas con patente y al software como servicio.",
    preguntas: [
      { pregunta: "¿Por qué crees que es útil conocer alternativas de software libre a los programas de paga?", tipo: "abierta" },
      { pregunta: "¿Qué es el software como servicio?", tipo: "opcion_multiple", opciones: ["Un tipo de hardware especializado","Un lenguaje de programación","Un programa al que se accede mediante internet sin instalarlo por completo"], respuesta_correcta: 2 },
      { pregunta: "Existen herramientas de software libre que funcionan como alternativa a programas privativos de paga.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CD-I-P06",
    codigo: "CD-I-P06-VID01",
    titulo: "Video básico: Normatividad y seguridad digital en el ciberespacio",
    descripcion: "Video explicativo sobre la normatividad que regula el uso del ciberespacio y cómo cuidar la seguridad digital.",
    titulo_video: "Normatividad y seguridad digital en el ciberespacio",
    descripcion_video: "Video que explica qué normas regulan el uso del ciberespacio y los servicios digitales, y cómo aplicarlas para cuidar la propia seguridad digital y la de los demás.",
    preguntas: [
      { pregunta: "¿Qué medidas puedes tomar para cuidar tu seguridad digital al usar el ciberespacio?", tipo: "abierta" },
      { pregunta: "¿Para qué sirve la normatividad que regula el ciberespacio?", tipo: "opcion_multiple", opciones: ["Para proteger la seguridad digital de las personas","Para aumentar la velocidad del internet","Para vender productos en línea"], respuesta_correcta: 0 },
      { pregunta: "No existen normas ni leyes que regulen el uso del ciberespacio y los servicios digitales.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "CD-I-P10",
    codigo: "CD-I-P10-VID01",
    titulo: "Video básico: Uso responsable de los recursos digitales",
    descripcion: "Video explicativo sobre el uso responsable y seguro de los recursos digitales con fines personales, académicos y sociales.",
    titulo_video: "Uso responsable de los recursos digitales",
    descripcion_video: "Video que explica cómo utilizar los recursos digitales disponibles con fines personales, académicos y sociales, interactuando con seguridad y cuidando el medio ambiente.",
    preguntas: [
      { pregunta: "¿Qué relación existe entre el uso de recursos digitales y el cuidado del medio ambiente?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un fin para el que se pueden usar los recursos digitales?", tipo: "opcion_multiple", opciones: ["Solo fines militares","Fines personales, académicos y sociales","Únicamente fines comerciales de grandes empresas"], respuesta_correcta: 1 },
      { pregunta: "Usar recursos digitales con fines personales, académicos y sociales no tiene relación alguna con la seguridad ni con el cuidado del medio ambiente.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "CD-I-P04",
    codigo: "CD-I-P04-VID01",
    titulo: "Video básico: Resolución de problemas algorítmicos con medios digitales",
    descripcion: "Video explicativo sobre cómo comprender y resolver problemas algorítmicos usando medios tecnológicos y digitales.",
    titulo_video: "Resolución de problemas algorítmicos con medios digitales",
    descripcion_video: "Video que explica distintas formas de comprender y resolver problemas algorítmicos, para desarrollar una estrategia frente a una situación o problemática usando medios digitales.",
    preguntas: [
      { pregunta: "¿Qué pasos seguirías para diseñar una estrategia que resuelva un problema usando medios digitales?", tipo: "abierta" },
      { pregunta: "¿Qué es un problema algorítmico?", tipo: "opcion_multiple", opciones: ["Un tipo de virus informático","Un dispositivo de hardware","Una situación que puede resolverse siguiendo una secuencia de pasos ordenados"], respuesta_correcta: 2 },
      { pregunta: "Los medios tecnológicos y digitales pueden ayudar a desarrollar estrategias para resolver problemas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CD-I-P11",
    codigo: "CD-I-P11-VID01",
    titulo: "Video básico: Elementos del lenguaje algorítmico",
    descripcion: "Video explicativo sobre los elementos básicos del lenguaje algorítmico y su aplicación en distintas asignaturas.",
    titulo_video: "Elementos del lenguaje algorítmico",
    descripcion_video: "Video que presenta los elementos del lenguaje algorítmico (como secuencias, condiciones y repeticiones) y cómo usarlos para resolver problemas en distintas asignaturas.",
    preguntas: [
      { pregunta: "¿Qué elementos consideras indispensables para construir un algoritmo?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un elemento del lenguaje algorítmico?", tipo: "opcion_multiple", opciones: ["Las estructuras de secuencia, decisión y repetición","Los colores de una imagen","El tamaño de una pantalla"], respuesta_correcta: 0 },
      { pregunta: "El lenguaje algorítmico solo puede aplicarse en la asignatura de matemáticas.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "CD-I-P05",
    codigo: "CD-I-P05-VID01",
    titulo: "Video básico: Derechos digitales y cómo ejercerlos",
    descripcion: "Video explicativo sobre los derechos digitales de las personas y los mecanismos para ejercerlos.",
    titulo_video: "Derechos digitales y cómo ejercerlos",
    descripcion_video: "Video que explica qué son los derechos digitales y qué mecanismos existen para ejercerlos y hacerlos valer.",
    preguntas: [
      { pregunta: "¿Qué derecho digital consideras más importante y por qué?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un ejemplo de derecho digital?", tipo: "opcion_multiple", opciones: ["El derecho a votar en elecciones","El derecho a la protección de datos personales","El derecho a la propiedad de un terreno"], respuesta_correcta: 1 },
      { pregunta: "Existen mecanismos que permiten a las personas ejercer sus derechos digitales.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CD-I-P07",
    codigo: "CD-I-P07-VID01",
    titulo: "Video básico: Diversidad e inclusión en la comunicación digital",
    descripcion: "Video explicativo sobre la diversidad de identidades en el ciberespacio y la comunicación digital respetuosa.",
    titulo_video: "Diversidad e inclusión en la comunicación digital",
    descripcion_video: "Video que explica por qué es importante valorar la diversidad de identidades en el ciberespacio y practicar una comunicación digital respetuosa e inclusiva.",
    preguntas: [
      { pregunta: "¿Qué acciones concretas puedes tomar para comunicarte de forma respetuosa e inclusiva en el ciberespacio?", tipo: "abierta" },
      { pregunta: "¿Qué caracteriza a la comunicación digital inclusiva?", tipo: "opcion_multiple", opciones: ["Excluye a quienes piensan diferente","Se basa únicamente en memes","Respeta la diversidad de identidades de las personas"], respuesta_correcta: 2 },
      { pregunta: "En el ciberespacio conviven personas con identidades diversas que merecen ser respetadas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CD-I-P08",
    codigo: "CD-I-P08-VID01",
    titulo: "Video básico: Herramientas digitales para organizar información escolar",
    descripcion: "Video explicativo sobre el uso de herramientas digitales básicas para organizar información y comunicarse en la escuela.",
    titulo_video: "Herramientas digitales para organizar información escolar",
    descripcion_video: "Video que muestra cómo utilizar herramientas digitales básicas para organizar información y facilitar la comunicación escolar.",
    preguntas: [
      { pregunta: "¿Qué herramienta digital usas actualmente para organizar tus tareas o comunicarte con tus compañeros de escuela?", tipo: "abierta" },
      { pregunta: "¿Para qué sirven las herramientas digitales de organización de información?", tipo: "opcion_multiple", opciones: ["Para ordenar y clasificar la información escolar de forma eficiente","Para eliminar archivos automáticamente","Para diseñar videojuegos"], respuesta_correcta: 0 },
      { pregunta: "Las herramientas digitales básicas no sirven para organizar información ni para la comunicación escolar.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "CNEYT-I-P09",
    codigo: "CNEYT-I-P09-VID01",
    titulo: "Video básico: La interrelación de los fenómenos naturales",
    descripcion: "Video explicativo sobre cómo los fenómenos de la naturaleza están interrelacionados y pueden estudiarse de forma integral o especializada.",
    titulo_video: "La interrelación de los fenómenos naturales",
    descripcion_video: "Video que explica cómo los fenómenos naturales se relacionan entre sí y cómo pueden estudiarse en conjunto o desde disciplinas especializadas para generar conocimiento e innovación tecnológica.",
    preguntas: [
      { pregunta: "Da un ejemplo de un fenómeno natural que involucre varias disciplinas científicas al mismo tiempo.", tipo: "abierta" },
      { pregunta: "¿Para qué sirve estudiar los fenómenos naturales de forma especializada?", tipo: "opcion_multiple", opciones: ["Para complicar su comprensión","Para generar conocimiento e innovación tecnológica","Para eliminar la ciencia interdisciplinaria"], respuesta_correcta: 1 },
      { pregunta: "Los fenómenos de la naturaleza siempre son independientes entre sí y nunca se relacionan.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "CNEYT-I-P02",
    codigo: "CNEYT-I-P02-VID01",
    titulo: "Video básico: Materia, cuerpo, masa y densidad",
    descripcion: "Video explicativo sobre los conceptos de materia, cuerpo, masa y densidad.",
    titulo_video: "Materia, cuerpo, masa y densidad",
    descripcion_video: "Video que explica qué son la materia, el cuerpo, la masa y la densidad, usando ejemplos de objetos cotidianos para describirlos y analizarlos.",
    preguntas: [
      { pregunta: "¿Cuál es la diferencia entre masa y densidad?", tipo: "abierta" },
      { pregunta: "¿Qué es la densidad de un objeto?", tipo: "opcion_multiple", opciones: ["El peso que tiene en la Luna","El color que presenta a simple vista","La relación entre su masa y su volumen"], respuesta_correcta: 2 },
      { pregunta: "La densidad de un objeto depende únicamente de su color y no de su masa ni su volumen.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "CNEYT-I-P04",
    codigo: "CNEYT-I-P04-VID01",
    titulo: "Video básico: Sustancias puras, compuestos y mezclas",
    descripcion: "Video explicativo sobre los conceptos de sustancia pura, elemento, compuesto y mezcla.",
    titulo_video: "Sustancias puras, compuestos y mezclas",
    descripcion_video: "Video que explica la diferencia entre sustancia pura, elemento, compuesto y mezcla, y cómo usarlos para clasificar distintos tipos de materia según sus propiedades físicas y químicas.",
    preguntas: [
      { pregunta: "¿Cómo distinguirías una mezcla de una sustancia pura en la vida cotidiana?", tipo: "abierta" },
      { pregunta: "¿Qué es un compuesto?", tipo: "opcion_multiple", opciones: ["Una sustancia formada por dos o más elementos unidos químicamente","Una mezcla de dos líquidos que no se combinan","Un objeto hecho de un solo material sin combinar"], respuesta_correcta: 0 },
      { pregunta: "El agua salada es un ejemplo de mezcla, mientras que el agua pura es una sustancia pura.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-I-P10",
    codigo: "CNEYT-I-P10-VID01",
    titulo: "Video básico: La formación de enlaces químicos",
    descripcion: "Video explicativo sobre cómo se forman los enlaces químicos entre átomos.",
    titulo_video: "La formación de enlaces químicos",
    descripcion_video: "Video que explica cómo los átomos se unen para formar iones, moléculas y sustancias en busca de estabilidad energética, dando origen a los enlaces químicos.",
    preguntas: [
      { pregunta: "¿Por qué los átomos tienden a unirse con otros átomos para formar enlaces químicos?", tipo: "abierta" },
      { pregunta: "¿Qué buscan los átomos al formar un enlace químico?", tipo: "opcion_multiple", opciones: ["Aumentar su tamaño sin límite","Alcanzar una mayor estabilidad energética","Perder toda su masa"], respuesta_correcta: 1 },
      { pregunta: "Un ion se forma cuando un átomo gana o pierde electrones.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-I-P11",
    codigo: "CNEYT-I-P11-VID01",
    titulo: "Video básico: Naturaleza energética y corpuscular de la materia",
    descripcion: "Video explicativo sobre la naturaleza energética y corpuscular de la materia y sus aplicaciones tecnológicas.",
    titulo_video: "Naturaleza energética y corpuscular de la materia",
    descripcion_video: "Video que explica en qué consiste la naturaleza energética y corpuscular de la materia, y presenta algunas aplicaciones tecnológicas relacionadas con estos conceptos.",
    preguntas: [
      { pregunta: "¿Qué significa que la materia tenga una naturaleza corpuscular?", tipo: "abierta" },
      { pregunta: "¿Qué aspecto describe la naturaleza energética de la materia?", tipo: "opcion_multiple", opciones: ["El color que tiene un objeto","La forma geométrica de un cuerpo","La energía asociada a las partículas que la componen"], respuesta_correcta: 2 },
      { pregunta: "Existen aplicaciones tecnológicas basadas en la comprensión de la naturaleza energética y corpuscular de la materia.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-I-P06",
    codigo: "CNEYT-I-P06-VID01",
    titulo: "Video básico: El método científico y la medición",
    descripcion: "Video explicativo sobre el método científico y el papel de la medición en las investigaciones.",
    titulo_video: "El método científico y la medición",
    descripcion_video: "Video que explica los pasos del método científico y cómo aplicar la medición en observaciones e investigaciones del entorno.",
    preguntas: [
      { pregunta: "¿Cuáles son los pasos del método científico y para qué sirve cada uno?", tipo: "abierta" },
      { pregunta: "¿Qué papel juega la medición en una investigación científica?", tipo: "opcion_multiple", opciones: ["Permite obtener datos precisos y comparables","Sustituye por completo a la observación","Solo se usa en matemáticas"], respuesta_correcta: 0 },
      { pregunta: "El método científico no necesita de la observación ni de la medición para investigar el entorno.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "CNEYT-I-P07",
    codigo: "CNEYT-I-P07-VID01",
    titulo: "Video básico: Mujeres y grupos marginados en la ciencia",
    descripcion: "Video explicativo sobre la contribución de las mujeres y grupos históricamente marginados al desarrollo científico.",
    titulo_video: "Mujeres y grupos marginados en la ciencia",
    descripcion_video: "Video que explica y valora las aportaciones de mujeres y de grupos históricamente marginados al desarrollo de la ciencia a lo largo de la historia.",
    preguntas: [
      { pregunta: "¿Por qué crees que las aportaciones de muchas mujeres científicas fueron poco reconocidas en su época?", tipo: "abierta" },
      { pregunta: "¿Qué busca reconocer el estudio de las aportaciones de grupos históricamente marginados a la ciencia?", tipo: "opcion_multiple", opciones: ["Que la ciencia solo la hicieron hombres","Su papel y contribuciones reales en el desarrollo científico","Que la ciencia no tiene historia"], respuesta_correcta: 1 },
      { pregunta: "A lo largo de la historia, mujeres y grupos marginados han hecho aportaciones importantes a la ciencia.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-I-P08",
    codigo: "CNEYT-I-P08-VID01",
    titulo: "Video básico: La materia y los problemas ambientales",
    descripcion: "Video explicativo sobre cómo la materia y sus transformaciones se relacionan con problemas ambientales.",
    titulo_video: "La materia y los problemas ambientales",
    descripcion_video: "Video que explica cómo las transformaciones de la materia se relacionan con problemas ambientales tanto locales como globales.",
    preguntas: [
      { pregunta: "Menciona un problema ambiental de tu comunidad relacionado con alguna transformación de la materia.", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un ejemplo de transformación de la materia relacionada con un problema ambiental?", tipo: "opcion_multiple", opciones: ["El crecimiento de una planta en una maceta","El sonido de un instrumento musical","La quema de combustibles fósiles que genera contaminación"], respuesta_correcta: 2 },
      { pregunta: "Las transformaciones de la materia pueden generar problemas ambientales tanto locales como globales.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CS-I-P02",
    codigo: "CS-I-P02-VID01",
    titulo: "Video básico: El devenir del concepto de ciudadanía",
    descripcion: "Video explicativo sobre cómo ha evolucionado el concepto de ciudadanía a lo largo de la historia.",
    titulo_video: "El devenir del concepto de ciudadanía",
    descripcion_video: "Video que explica cómo ha cambiado el concepto de ciudadanía a lo largo del tiempo y su relación con la conformación de un Estado democrático e incluyente.",
    preguntas: [
      { pregunta: "¿Cómo ha cambiado el concepto de ciudadanía a lo largo de la historia?", tipo: "abierta" },
      { pregunta: "¿Qué papel juega el concepto de ciudadanía en un Estado democrático?", tipo: "opcion_multiple", opciones: ["Define los derechos y obligaciones de las personas frente al Estado","Determina el clima de un país","Establece los precios de los productos"], respuesta_correcta: 0 },
      { pregunta: "El concepto de ciudadanía ha permanecido exactamente igual a lo largo de toda la historia.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "CS-I-P03",
    codigo: "CS-I-P03-VID01",
    titulo: "Video básico: Las normas sociales y su rol en la vida cotidiana",
    descripcion: "Video explicativo sobre las normas sociales y su papel en la vida cotidiana.",
    titulo_video: "Las normas sociales y su rol en la vida cotidiana",
    descripcion_video: "Video que explica qué son las normas sociales, cómo se comparan entre sí y qué papel cumplen en la vida cotidiana de las personas.",
    preguntas: [
      { pregunta: "Da un ejemplo de una norma social que sigues en tu vida cotidiana y explica para qué sirve.", tipo: "abierta" },
      { pregunta: "¿Qué son las normas sociales?", tipo: "opcion_multiple", opciones: ["Leyes exclusivas del ámbito penal","Reglas de comportamiento que regulan la convivencia entre las personas","Fórmulas matemáticas"], respuesta_correcta: 1 },
      { pregunta: "Las normas sociales no tienen ningún papel en la vida cotidiana de las personas.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "CS-I-P04",
    codigo: "CS-I-P04-VID01",
    titulo: "Video básico: La diversidad como parte del espacio democrático",
    descripcion: "Video explicativo sobre la diversidad y su papel dentro del espacio democrático.",
    titulo_video: "La diversidad como parte del espacio democrático",
    descripcion_video: "Video que explica por qué la diversidad de ideas, culturas e identidades forma parte esencial de un espacio democrático.",
    preguntas: [
      { pregunta: "¿Por qué la diversidad es importante para un espacio democrático?", tipo: "abierta" },
      { pregunta: "¿Qué caracteriza a un espacio democrático respecto a la diversidad?", tipo: "opcion_multiple", opciones: ["Exige que todos piensen igual","Prohíbe la participación ciudadana","Reconoce y respeta la diversidad de las personas"], respuesta_correcta: 2 },
      { pregunta: "La diversidad de opiniones e identidades forma parte de un espacio democrático.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-I-P02",
    codigo: "IN-I-P02-VID01",
    titulo: "Video básico: Interacciones básicas en el aula en inglés",
    descripcion: "Video explicativo sobre cómo seguir indicaciones y participar en interacciones básicas dentro del aula en inglés.",
    titulo_video: "Interacciones básicas en el aula en inglés",
    descripcion_video: "Video que muestra frases básicas en inglés para pedir permiso, aclarar dudas y responder a instrucciones dentro del salón de clases.",
    preguntas: [
      { pregunta: "¿Qué frase en inglés usarías para pedir permiso para salir del salón?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes frases se usa en inglés para aclarar una duda en clase?", tipo: "opcion_multiple", opciones: ["Can you repeat that, please?","See you tomorrow","Happy birthday"], respuesta_correcta: 0 },
      { pregunta: "Seguir indicaciones en inglés dentro del aula ayuda a mejorar la comunicación con el profesor.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-I-P03",
    codigo: "IN-I-P03-VID01",
    titulo: "Video básico: Descripción de objetos y espacios en inglés",
    descripcion: "Video explicativo sobre cómo describir objetos y espacios cotidianos del hogar y la escuela en inglés.",
    titulo_video: "Descripción de objetos y espacios en inglés",
    descripcion_video: "Video que enseña cómo identificar y describir en inglés objetos y espacios del hogar o la escuela según su forma, color y tamaño.",
    preguntas: [
      { pregunta: "Describe en inglés un objeto de tu salón de clases mencionando su forma, color y tamaño.", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes palabras en inglés describe el tamaño de un objeto?", tipo: "opcion_multiple", opciones: ["Blue","Big","Table"], respuesta_correcta: 1 },
      { pregunta: "En inglés se pueden describir objetos usando características como forma, color y tamaño.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-I-P04",
    codigo: "IN-I-P04-VID01",
    titulo: "Video básico: Cómo dar información personal en inglés",
    descripcion: "Video explicativo sobre cómo solicitar y proporcionar información personal básica en inglés.",
    titulo_video: "Cómo dar información personal en inglés",
    descripcion_video: "Video que enseña frases en inglés para pedir y dar información personal básica como nombre, edad, nacionalidad, teléfono, dirección y correo electrónico.",
    preguntas: [
      { pregunta: "¿Cómo preguntarías en inglés el nombre y la nacionalidad de una persona nueva?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes preguntas en inglés sirve para pedir la edad de alguien?", tipo: "opcion_multiple", opciones: ["Where is the library?","What time is it?","How old are you?"], respuesta_correcta: 2 },
      { pregunta: "En contextos escolares es útil saber pedir y dar información personal básica en inglés.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-I-P05",
    codigo: "IN-I-P05-VID01",
    titulo: "Video básico: Preguntas sencillas sobre ubicación y horarios en inglés",
    descripcion: "Video explicativo sobre cómo hacer preguntas sencillas en inglés para obtener información sobre ubicación y horarios.",
    titulo_video: "Preguntas sencillas sobre ubicación y horarios en inglés",
    descripcion_video: "Video que enseña a formular preguntas sencillas en inglés para obtener información general, como la ubicación de un lugar o los horarios de un evento.",
    preguntas: [
      { pregunta: "¿Qué pregunta harías en inglés para saber dónde queda la biblioteca de tu escuela?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes preguntas se usa en inglés para conocer un horario?", tipo: "opcion_multiple", opciones: ["What time does the class start?","What is your name?","How are you?"], respuesta_correcta: 0 },
      { pregunta: "Las preguntas sencillas en inglés sirven para obtener información general como ubicación y horarios.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-I-P06",
    codigo: "IN-I-P06-VID01",
    titulo: "Video básico: Descripción de personas, vestimenta y clima en inglés",
    descripcion: "Video explicativo sobre cómo describir personas, vestimenta y clima en inglés respetando la diversidad.",
    titulo_video: "Descripción de personas, vestimenta y clima en inglés",
    descripcion_video: "Video que enseña vocabulario y frases en inglés para describir personas, vestimenta y clima en situaciones cotidianas, respetando la diversidad.",
    preguntas: [
      { pregunta: "Describe en inglés cómo está vestida una persona y cómo es el clima hoy.", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes palabras en inglés describe el clima?", tipo: "opcion_multiple", opciones: ["Shirt","Rainy","Tall"], respuesta_correcta: 1 },
      { pregunta: "En inglés no existen palabras para describir el clima ni la vestimenta de una persona.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "IN-I-P07",
    codigo: "IN-I-P07-VID01",
    titulo: "Video básico: Expresar gustos y opiniones en inglés",
    descripcion: "Video explicativo sobre cómo expresar gustos y opiniones simples en inglés.",
    titulo_video: "Expresar gustos y opiniones en inglés",
    descripcion_video: "Video que enseña frases en inglés para expresar gustos, preferencias y opiniones de forma simple y empática en situaciones cotidianas.",
    preguntas: [
      { pregunta: "¿Cómo expresarías en inglés que te gusta una actividad y por qué?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes frases en inglés expresa una preferencia?", tipo: "opcion_multiple", opciones: ["Where is the bathroom?","It is Monday today","I like this because it is fun"], respuesta_correcta: 2 },
      { pregunta: "Expresar opiniones de forma empática implica también respetar la opinión de los demás.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-I-P08",
    codigo: "IN-I-P08-VID01",
    titulo: "Video básico: El genitivo y los pronombres posesivos en inglés",
    descripcion: "Video explicativo sobre cómo expresar pertenencia en inglés usando el genitivo y los pronombres posesivos.",
    titulo_video: "El genitivo y los pronombres posesivos en inglés",
    descripcion_video: "Video que explica cómo preguntar y responder sobre posesión en inglés utilizando el genitivo ('s) y los pronombres posesivos (my, your, his, her...).",
    preguntas: [
      { pregunta: "¿Cómo preguntarías en inglés de quién es una mochila?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes opciones es un pronombre posesivo en inglés?", tipo: "opcion_multiple", opciones: ["Her","Run","Blue"], respuesta_correcta: 0 },
      { pregunta: "El genitivo en inglés (como en 'Maria's book') se usa para expresar posesión.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-I-P02",
    codigo: "LC-I-P02-VID01",
    titulo: "Video básico: La diversidad de textos según gustos de lectura",
    descripcion: "Video explicativo sobre cómo investigar los gustos de lectura y escritura de la comunidad escolar.",
    titulo_video: "La diversidad de textos según gustos de lectura",
    descripcion_video: "Video que explica cómo investigar los gustos e inclinaciones de las personas de la comunidad escolar respecto a la lectura y la escritura, para conocer la diversidad de textos que existen.",
    preguntas: [
      { pregunta: "¿Qué tipo de textos prefieres leer y por qué?", tipo: "abierta" },
      { pregunta: "¿Para qué sirve investigar los gustos de lectura de una comunidad escolar?", tipo: "opcion_multiple", opciones: ["Para eliminar géneros literarios","Para conocer la diversidad de textos que se leen y se escriben","Para calificar exámenes"], respuesta_correcta: 1 },
      { pregunta: "Existe una gran diversidad de textos según los gustos e intereses de las personas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-I-P03",
    codigo: "LC-I-P03-VID01",
    titulo: "Video básico: La claridad de las ideas en los textos escritos",
    descripcion: "Video explicativo sobre la importancia de transmitir con claridad las ideas en un texto escrito.",
    titulo_video: "La claridad de las ideas en los textos escritos",
    descripcion_video: "Video que explica cómo analizar la información, ideas, pensamientos y opiniones de un texto para comprender por qué es importante transmitir las ideas con claridad al escribir.",
    preguntas: [
      { pregunta: "¿Qué elementos hacen que un texto transmita sus ideas con claridad?", tipo: "abierta" },
      { pregunta: "¿Qué se debe analizar en un texto para comprender su claridad?", tipo: "opcion_multiple", opciones: ["Solo el número de páginas","El color de la portada","La información, ideas, pensamientos y opiniones que contiene"], respuesta_correcta: 2 },
      { pregunta: "La claridad al transmitir las ideas en un texto escrito no influye en su comprensión por parte del lector.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "LC-I-P05",
    codigo: "LC-I-P05-VID01",
    titulo: "Video básico: Cómo identificar los elementos significativos de un texto",
    descripcion: "Video explicativo sobre cómo identificar y resaltar la información significativa de un texto.",
    titulo_video: "Cómo identificar los elementos significativos de un texto",
    descripcion_video: "Video que explica cómo identificar la información importante de un texto para resaltar sus elementos más significativos.",
    preguntas: [
      { pregunta: "¿Qué estrategia usas para identificar la información más importante de un texto?", tipo: "abierta" },
      { pregunta: "¿Qué se busca al identificar los elementos significativos de un texto?", tipo: "opcion_multiple", opciones: ["Resaltar la información más relevante","Contar el número total de palabras","Cambiar el idioma del texto"], respuesta_correcta: 0 },
      { pregunta: "Identificar los elementos significativos de un texto ayuda a comprenderlo mejor.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-I-P06",
    codigo: "LC-I-P06-VID01",
    titulo: "Video básico: La concordancia y los conectores en un texto",
    descripcion: "Video explicativo sobre la concordancia gramatical y el uso de conectores en un texto.",
    titulo_video: "La concordancia y los conectores en un texto",
    descripcion_video: "Video que explica qué es la concordancia gramatical y para qué sirven los conectores en un texto, destacando su importancia para la comprensión.",
    preguntas: [
      { pregunta: "¿Por qué es importante que un texto tenga concordancia gramatical y conectores adecuados?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes palabras es un conector?", tipo: "opcion_multiple", opciones: ["Escuela","Sin embargo","Rápido"], respuesta_correcta: 1 },
      { pregunta: "Los conectores ayudan a unir ideas dentro de un texto de forma coherente.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-I-P07",
    codigo: "LC-I-P07-VID01",
    titulo: "Video básico: La lectura en voz alta y la opinión sobre un texto",
    descripcion: "Video explicativo sobre cómo practicar la lectura en voz alta y emitir opiniones sobre un texto.",
    titulo_video: "La lectura en voz alta y la opinión sobre un texto",
    descripcion_video: "Video que muestra cómo practicar la lectura en voz alta de un texto y cómo formular una opinión clara sobre su contenido.",
    preguntas: [
      { pregunta: "¿Qué aspectos consideras al leer un texto en voz alta, por ejemplo el tono o el ritmo?", tipo: "abierta" },
      { pregunta: "¿Qué se recomienda hacer después de leer un texto en voz alta?", tipo: "opcion_multiple", opciones: ["Borrar el texto de inmediato","Ignorar lo leído","Emitir una opinión sobre su contenido"], respuesta_correcta: 2 },
      { pregunta: "Practicar la lectura en voz alta ayuda a mejorar la fluidez y la comprensión de un texto.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-I-P08",
    codigo: "LC-I-P08-VID01",
    titulo: "Video básico: Características de una exposición oral",
    descripcion: "Video explicativo sobre las características principales de una exposición oral.",
    titulo_video: "Características de una exposición oral",
    descripcion_video: "Video que explica las características de una exposición oral, como la introducción, el desarrollo, la conclusión y el apoyo visual, para conocer cómo se desarrolla y ponerla en práctica.",
    preguntas: [
      { pregunta: "¿Qué partes debe tener una buena exposición oral?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una característica de una exposición oral efectiva?", tipo: "opcion_multiple", opciones: ["Tener una estructura clara de introducción, desarrollo y conclusión","Hablar sin ningún orden","Evitar el contacto visual con el público"], respuesta_correcta: 0 },
      { pregunta: "Una exposición oral no requiere ninguna estructura ni organización para ser efectiva.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "PFH-I-P02",
    codigo: "PFH-I-P02-VID01",
    titulo: "Video básico: Preguntas filosóficas significativas sobre la vida",
    descripcion: "Video explicativo sobre cómo formular preguntas filosóficas significativas para generar pensamiento crítico.",
    titulo_video: "Preguntas filosóficas significativas sobre la vida",
    descripcion_video: "Video que explica cómo formular preguntas significativas sobre la vida a través del ejercicio filosófico, con el fin de cuestionar certezas comunes y desarrollar un pensamiento crítico, creativo y cuidadoso.",
    preguntas: [
      { pregunta: "Formula una pregunta filosófica sobre algo que comúnmente se considera cierto en tu vida cotidiana.", tipo: "abierta" },
      { pregunta: "¿Qué tipo de pensamiento busca desarrollar el ejercicio filosófico de formular preguntas?", tipo: "opcion_multiple", opciones: ["Pensamiento automático sin cuestionar nada","Pensamiento crítico, creativo y cuidadoso","Pensamiento memorístico"], respuesta_correcta: 1 },
      { pregunta: "Formular preguntas filosóficas permite cuestionar ideas que comúnmente se dan por ciertas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-I-P03",
    codigo: "PFH-I-P03-VID01",
    titulo: "Video básico: La cotidianidad desde distintas perspectivas filosóficas",
    descripcion: "Video explicativo sobre cómo analizar la vida cotidiana desde normas, valores, creencias y visiones del mundo.",
    titulo_video: "La cotidianidad desde distintas perspectivas filosóficas",
    descripcion_video: "Video que explica cómo analizar la cotidianidad a partir de las normas, valores, creencias y visiones del mundo, para comprender el sentido de la vida desde distintas perspectivas filosóficas.",
    preguntas: [
      { pregunta: "¿Qué valores o creencias influyen en cómo entiendes tu vida cotidiana?", tipo: "abierta" },
      { pregunta: "¿Qué elementos se analizan para comprender la cotidianidad desde la filosofía?", tipo: "opcion_multiple", opciones: ["Únicamente los horarios del día","El clima de la región","Las normas, valores, creencias y visiones del mundo"], respuesta_correcta: 2 },
      { pregunta: "Existen distintas perspectivas filosóficas para comprender el sentido de la vida.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-I-P06",
    codigo: "PFH-I-P06-VID01",
    titulo: "Video básico: Preguntas filosóficas sobre el conocimiento y la verdad",
    descripcion: "Video explicativo sobre cómo se construye el conocimiento y los grados de verdad desde la filosofía.",
    titulo_video: "Preguntas filosóficas sobre el conocimiento y la verdad",
    descripcion_video: "Video que explica cómo formular preguntas filosóficas en torno al conocimiento, la ciencia y los grados de verdad, para comprender de forma crítica cómo se construye el conocimiento.",
    preguntas: [
      { pregunta: "¿Cómo distinguirías entre una creencia, una opinión y un conocimiento verdadero?", tipo: "abierta" },
      { pregunta: "¿Qué busca reconocer el análisis filosófico del conocimiento y la ciencia?", tipo: "opcion_multiple", opciones: ["Cómo se construye el conocimiento y su relevancia en la vida cotidiana","El horario de clases de ciencias","La cantidad de libros que existen"], respuesta_correcta: 0 },
      { pregunta: "El conocimiento puede tener distintos grados de verdad según cómo se construya.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-I-P04",
    codigo: "PFH-I-P04-VID01",
    titulo: "Video básico: Comunidades de diálogo sobre problemas filosóficos",
    descripcion: "Video explicativo sobre cómo participar con rigor en comunidades de diálogo filosófico.",
    titulo_video: "Comunidades de diálogo sobre problemas filosóficos",
    descripcion_video: "Video que explica cómo integrar la formulación de preguntas para participar con mayor rigor en comunidades de diálogo centradas en problemas filosóficos contemporáneos.",
    preguntas: [
      { pregunta: "¿Qué problema filosófico contemporáneo te gustaría discutir con tus compañeros?", tipo: "abierta" },
      { pregunta: "¿Qué favorece la formulación de preguntas dentro de una comunidad de diálogo?", tipo: "opcion_multiple", opciones: ["El silencio total del grupo","Una participación con mayor rigor y profundidad","La memorización de fechas"], respuesta_correcta: 1 },
      { pregunta: "Las comunidades de diálogo filosófico no permiten discutir problemas filosóficos contemporáneos.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "PFH-I-P05",
    codigo: "PFH-I-P05-VID01",
    titulo: "Video básico: La diversidad de tradiciones filosóficas",
    descripcion: "Video explicativo sobre la diversidad de tradiciones filosóficas alrededor del mundo.",
    titulo_video: "La diversidad de tradiciones filosóficas",
    descripcion_video: "Video que presenta la diversidad de tradiciones filosóficas que existen en distintas culturas y épocas, más allá de la filosofía occidental.",
    preguntas: [
      { pregunta: "¿Qué tradición filosófica distinta a la occidental conoces o te gustaría conocer?", tipo: "abierta" },
      { pregunta: "¿Qué implica reconocer la diversidad de tradiciones filosóficas?", tipo: "opcion_multiple", opciones: ["Que solo existe una única filosofía válida","Que la filosofía no tiene historia","Que existen distintas formas de filosofar en el mundo"], respuesta_correcta: 2 },
      { pregunta: "En el mundo existen diversas tradiciones filosóficas además de la occidental.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-I-P03",
    codigo: "PM-I-P03-VID01",
    titulo: "Video básico: Conceptos básicos de lógica matemática",
    descripcion: "Video explicativo sobre los conceptos básicos de la lógica matemática.",
    titulo_video: "Conceptos básicos de lógica matemática",
    descripcion_video: "Video que explica los conceptos básicos de la lógica matemática y cómo aplicarlos en situaciones cotidianas para desarrollar un razonamiento estructurado.",
    preguntas: [
      { pregunta: "¿Cómo usarías la lógica matemática para resolver un problema de tu vida diaria?", tipo: "abierta" },
      { pregunta: "¿Para qué sirve la lógica matemática?", tipo: "opcion_multiple", opciones: ["Para desarrollar esquemas de razonamiento estructurado","Para medir el tiempo exacto","Para dibujar figuras geométricas"], respuesta_correcta: 0 },
      { pregunta: "La lógica matemática ayuda a estructurar el razonamiento frente a distintas situaciones.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-I-P08",
    codigo: "PM-I-P08-VID01",
    titulo: "Video básico: El origen y desarrollo del concepto de conteo",
    descripcion: "Video explicativo sobre el concepto de conteo y los procesos sociales que llevaron a su desarrollo.",
    titulo_video: "El origen y desarrollo del concepto de conteo",
    descripcion_video: "Video que explica cómo surgió el concepto de conteo a partir de procesos sociales históricos, y cómo aplicarlo en situaciones de interés cotidiano.",
    preguntas: [
      { pregunta: "¿Por qué crees que las sociedades antiguas necesitaron desarrollar formas de contar?", tipo: "abierta" },
      { pregunta: "¿Qué influyó en el desarrollo histórico del concepto de conteo?", tipo: "opcion_multiple", opciones: ["Un solo descubrimiento aislado","Los procesos sociales de las comunidades humanas","La invención de la computadora"], respuesta_correcta: 1 },
      { pregunta: "El concepto de conteo surgió a partir de necesidades y procesos sociales.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-I-P02",
    codigo: "PM-I-P02-VID01",
    titulo: "Video básico: Clasificación de números y operaciones básicas",
    descripcion: "Video explicativo sobre la clasificación de los números naturales y enteros y sus operaciones básicas.",
    titulo_video: "Clasificación de números y operaciones básicas",
    descripcion_video: "Video que explica la clasificación de los números naturales y enteros a partir de situaciones cotidianas de conteo, y cómo realizar operaciones básicas entre ellos.",
    preguntas: [
      { pregunta: "Menciona una situación cotidiana en la que uses números naturales o enteros.", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un número entero negativo?", tipo: "opcion_multiple", opciones: ["3.5","0.25","-5"], respuesta_correcta: 2 },
      { pregunta: "Los números naturales no forman parte del conjunto de los números enteros.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "PM-I-P09",
    codigo: "PM-I-P09-VID01",
    titulo: "Video básico: Potenciación y radicación",
    descripcion: "Video explicativo sobre los conceptos de potenciación y radicación.",
    titulo_video: "Potenciación y radicación",
    descripcion_video: "Video que explica qué son la potenciación y la radicación, y cómo realizar operaciones con exponentes y radicales.",
    preguntas: [
      { pregunta: "¿Qué relación existe entre la potenciación y la radicación?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes expresiones representa una potenciación?", tipo: "opcion_multiple", opciones: ["2³","√9","3+3"], respuesta_correcta: 0 },
      { pregunta: "La radicación es la operación inversa de la potenciación.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-I-P06",
    codigo: "PM-I-P06-VID01",
    titulo: "Video básico: El origen y desarrollo del concepto de medición",
    descripcion: "Video explicativo sobre el concepto de medición y los procesos sociales que llevaron a su desarrollo.",
    titulo_video: "El origen y desarrollo del concepto de medición",
    descripcion_video: "Video que explica cómo surgió el concepto de medición a partir de procesos sociales históricos, y cómo aplicarlo en situaciones de interés cotidiano.",
    preguntas: [
      { pregunta: "¿Qué unidades de medición usas en tu vida diaria y para qué sirven?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una unidad de medición?", tipo: "opcion_multiple", opciones: ["El sustantivo","El metro","El adjetivo"], respuesta_correcta: 1 },
      { pregunta: "Los sistemas de medición surgieron para responder a necesidades sociales concretas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-I-P10",
    codigo: "PM-I-P10-VID01",
    titulo: "Video básico: Cálculos combinados con números reales",
    descripcion: "Video explicativo sobre cómo resolver cálculos combinados usando los elementos de la aritmética.",
    titulo_video: "Cálculos combinados con números reales",
    descripcion_video: "Video que explica cómo aplicar los elementos de la aritmética, como la jerarquía de operaciones, para resolver cálculos combinados con números reales.",
    preguntas: [
      { pregunta: "¿Qué orden sigues al resolver una operación combinada con varias operaciones aritméticas?", tipo: "abierta" },
      { pregunta: "¿Qué se debe respetar al resolver un cálculo combinado?", tipo: "opcion_multiple", opciones: ["El orden alfabético de las letras","El tamaño de los números","La jerarquía de las operaciones"], respuesta_correcta: 2 },
      { pregunta: "Los números reales excluyen a los números irracionales.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "PM-I-P07",
    codigo: "PM-I-P07-VID01",
    titulo: "Video básico: Estimación y razonabilidad de resultados numéricos",
    descripcion: "Video explicativo sobre cómo estimar, aproximar y verificar la razonabilidad de un resultado numérico.",
    titulo_video: "Estimación y razonabilidad de resultados numéricos",
    descripcion_video: "Video que explica cómo estimar y aproximar resultados numéricos, y cómo verificar si un resultado es razonable dentro de un cálculo.",
    preguntas: [
      { pregunta: "¿Cómo te das cuenta de que el resultado de un cálculo no es razonable?", tipo: "abierta" },
      { pregunta: "¿Para qué sirve estimar un resultado antes de hacer un cálculo exacto?", tipo: "opcion_multiple", opciones: ["Para verificar si el resultado final es razonable","Para evitar hacer cualquier cálculo","Para redondear siempre hacia cero"], respuesta_correcta: 0 },
      { pregunta: "Estimar y aproximar resultados ayuda a verificar si un cálculo es razonable.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
];

async function main() {
  const sb = createSB();
  log("\n🎬 Semestre 1 — Videos candidatas (tipo 'video_con_preguntas')\n");
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

  log(`\n✅ Sem1 videos candidatas: ${ok} insertados, ${fail} fallidos (de ${videos.length}).\n`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
