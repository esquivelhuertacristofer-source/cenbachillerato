/**
 * Semestre 6 — Actividades de video candidatas (tipo 'video_con_preguntas').
 * Cubre las progresiones de Semestre VI que aun no tenian video.
 * Mismo patron que seed-sem6-videos.ts: url_video PLACEHOLDER,
 * estado='borrador' hasta que el cliente entregue los enlaces reales de YouTube.
 * Uso: npx tsx scripts/seed-sem6-videos-candidatas.ts
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
    progresion: "CD-III-P02",
    codigo: "CD-III-P02-VID01",
    titulo: "Video básico: Herramientas de comunicación digital para difundir información",
    descripcion: "Video explicativo sobre las herramientas de comunicación digital para difundir información y aprendizajes.",
    titulo_video: "Herramientas de comunicación digital para difundir información",
    descripcion_video: "Video que explica qué herramientas de comunicación digital existen (redes sociales, blogs, podcasts, videos) y cómo elegir la más adecuada para difundir información, conocimientos y experiencias según el contexto.",
    preguntas: [
      { pregunta: "¿Qué herramienta de comunicación digital usarías para compartir un aprendizaje con tu comunidad y por qué?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un ejemplo de herramienta de comunicación digital para difundir contenido?", tipo: "opcion_multiple", opciones: ["Un blog o podcast","Una calculadora científica","Un microscopio"], respuesta_correcta: 0 },
      { pregunta: "La elección de una herramienta digital para difundir información debe considerar el contexto y la audiencia a la que se dirige.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CD-III-P04",
    codigo: "CD-III-P04-VID01",
    titulo: "Video básico: Creación y edición de contenido digital",
    descripcion: "Video explicativo sobre cómo crear y editar contenido digital usando dispositivos y software.",
    titulo_video: "Creación y edición de contenido digital",
    descripcion_video: "Video que muestra cómo usar dispositivos tecnológicos y herramientas de software para crear y editar contenido digital (video, audio, imagen) adaptándolo a los recursos disponibles.",
    preguntas: [
      { pregunta: "¿Qué pasos seguirías para crear y editar un video o una imagen digital con los recursos que tienes disponibles?", tipo: "abierta" },
      { pregunta: "¿Qué se necesita, además de un dispositivo tecnológico, para crear y editar contenido digital?", tipo: "opcion_multiple", opciones: ["Un cuaderno de apuntes","Herramientas de software","Un mapa impreso"], respuesta_correcta: 1 },
      { pregunta: "El tipo de contenido digital que se puede crear depende de los recursos y el contexto de quien lo elabora.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CH-III-P03",
    codigo: "CH-III-P03-VID01",
    titulo: "Video básico: La validez de las interpretaciones históricas",
    descripcion: "Video explicativo sobre cómo argumentar la validez de una interpretación histórica.",
    titulo_video: "La validez de las interpretaciones históricas",
    descripcion_video: "Video que explica cómo argumentar la validez de una interpretación sobre un hecho histórico mediante el diálogo, la comparación con otras perspectivas y el uso fundamentado de fuentes.",
    preguntas: [
      { pregunta: "¿Por qué es importante contrastar tu interpretación de un hecho histórico con otras perspectivas antes de darla por válida?", tipo: "abierta" },
      { pregunta: "¿Qué elemento fortalece la validez de una interpretación histórica?", tipo: "opcion_multiple", opciones: ["Repetir la opinión más popular","El uso fundamentado de fuentes","Evitar el diálogo con otras posturas"], respuesta_correcta: 1 },
      { pregunta: "Una interpretación histórica se vuelve más sólida cuando se contrasta con otros puntos de vista.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CH-III-P04",
    codigo: "CH-III-P04-VID01",
    titulo: "Video básico: Cómo elaborar argumentos históricos con fuentes",
    descripcion: "Video explicativo sobre cómo elaborar argumentos e interpretaciones históricas a partir de fuentes variadas.",
    titulo_video: "Cómo elaborar argumentos históricos con fuentes",
    descripcion_video: "Video que explica el proceso para construir un argumento o interpretación histórica integrando información proveniente de fuentes variadas y pertinentes.",
    preguntas: [
      { pregunta: "¿Qué pasos seguirías para construir un argumento histórico sólido a partir de varias fuentes?", tipo: "abierta" },
      { pregunta: "¿Qué característica deben tener las fuentes que se usan para elaborar un argumento histórico?", tipo: "opcion_multiple", opciones: ["Ser variadas y pertinentes","Ser todas del mismo autor","Ser exclusivamente orales"], respuesta_correcta: 0 },
      { pregunta: "Integrar información de distintas fuentes ayuda a elaborar argumentos históricos más completos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-VI-P10",
    codigo: "CNEYT-VI-P10-VID01",
    titulo: "Video básico: El descubrimiento de la célula y la teoría celular",
    descripcion: "Video explicativo sobre el proceso histórico que llevó al descubrimiento de la célula y a la teoría celular.",
    titulo_video: "El descubrimiento de la célula y la teoría celular",
    descripcion_video: "Video que narra los procesos históricos y los científicos que llevaron al descubrimiento de la célula, y cómo esto derivó en la teoría celular como base de todos los seres vivos.",
    preguntas: [
      { pregunta: "¿Por qué se dice que la teoría celular es fundamental para entender a los seres vivos?", tipo: "abierta" },
      { pregunta: "¿Qué invento permitió el descubrimiento de la célula?", tipo: "opcion_multiple", opciones: ["El telescopio","El microscopio","El barómetro"], respuesta_correcta: 1 },
      { pregunta: "La teoría celular establece que la célula es la unidad fundamental de los organismos vivos.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-VI-P02",
    codigo: "CNEYT-VI-P02-VID01",
    titulo: "Video básico: Moléculas orgánicas y organelos celulares",
    descripcion: "Video explicativo sobre las moléculas orgánicas, los organelos celulares y las diferencias entre células procariotas y eucariotas.",
    titulo_video: "Moléculas orgánicas y organelos celulares",
    descripcion_video: "Video que explica qué moléculas orgánicas y organelos forman la célula, su función, y la diferencia entre células procariotas y eucariotas y su relevancia para la naturaleza y el bienestar humano.",
    preguntas: [
      { pregunta: "¿Qué diferencia principal existe entre una célula procariota y una eucariota?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes es un organelo celular?", tipo: "opcion_multiple", opciones: ["La mitocondria","El cuadro de Punnett","El ARN mensajero"], respuesta_correcta: 0 },
      { pregunta: "Las células eucariotas poseen núcleo definido, mientras que las procariotas no.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-VI-P04",
    codigo: "CNEYT-VI-P04-VID01",
    titulo: "Video básico: ADN, ARN y cromosomas: bases de la herencia",
    descripcion: "Video explicativo sobre la estructura del ADN, el ARN y los cromosomas como bases moleculares de la herencia.",
    titulo_video: "ADN, ARN y cromosomas: bases de la herencia",
    descripcion_video: "Video que explica la estructura molecular del ADN y el ARN, así como las características de los cromosomas, para comprender cómo se transmite la información genética de generación en generación.",
    preguntas: [
      { pregunta: "¿Cómo se relacionan el ADN, el ARN y los cromosomas en la transmisión de la herencia biológica?", tipo: "abierta" },
      { pregunta: "¿Qué molécula contiene la información genética que se hereda?", tipo: "opcion_multiple", opciones: ["El ARN de transferencia","El ADN","El ATP"], respuesta_correcta: 1 },
      { pregunta: "Los cromosomas están formados por ADN empaquetado junto con proteínas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-VI-P09",
    codigo: "CNEYT-VI-P09-VID01",
    titulo: "Video básico: Mitosis y meiosis, mecanismos de división celular",
    descripcion: "Video explicativo sobre las fases de la mitosis y la meiosis como mecanismos de reproducción celular.",
    titulo_video: "Mitosis y meiosis, mecanismos de división celular",
    descripcion_video: "Video que explica las fases de la mitosis y la meiosis, y por qué son procesos fundamentales para la reproducción y la variabilidad de los seres vivos.",
    preguntas: [
      { pregunta: "¿Cuál es la diferencia principal entre la mitosis y la meiosis en cuanto al número de células resultantes?", tipo: "abierta" },
      { pregunta: "¿Qué tipo de división celular da origen a las células sexuales (gametos)?", tipo: "opcion_multiple", opciones: ["La mitosis","La meiosis","La fotosíntesis"], respuesta_correcta: 1 },
      { pregunta: "La mitosis produce dos células hijas genéticamente idénticas a la célula original.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-VI-P08",
    codigo: "CNEYT-VI-P08-VID01",
    titulo: "Video básico: Las características de los seres vivos",
    descripcion: "Video explicativo sobre las características que identifican a los seres vivos.",
    titulo_video: "Las características de los seres vivos",
    descripcion_video: "Video que explica las características comunes que identifican a los seres vivos (organización, metabolismo, reproducción, respuesta a estímulos, entre otras) y cómo se relacionan con aplicaciones tecnológicas.",
    preguntas: [
      { pregunta: "¿Qué características tienen en común todos los seres vivos, sin importar su tamaño o forma?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una característica de los seres vivos?", tipo: "opcion_multiple", opciones: ["Estar formados por cristales","Ser capaces de reproducirse","No responder a estímulos"], respuesta_correcta: 1 },
      { pregunta: "Todos los seres vivos comparten características comunes como el metabolismo y la reproducción.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-VI-P03",
    codigo: "CNEYT-VI-P03-VID01",
    titulo: "Video básico: Metabolismo celular: respiración y fotosíntesis",
    descripcion: "Video explicativo sobre los procesos de respiración celular y fotosíntesis a nivel molecular.",
    titulo_video: "Metabolismo celular: respiración y fotosíntesis",
    descripcion_video: "Video que explica, a nivel molecular, cómo ocurren la respiración celular y la fotosíntesis, y cómo ambos procesos permiten a las células obtener y transformar energía.",
    preguntas: [
      { pregunta: "¿Cómo se relacionan la fotosíntesis y la respiración celular en el flujo de energía de los seres vivos?", tipo: "abierta" },
      { pregunta: "¿Qué molécula se produce principalmente en la respiración celular como fuente de energía?", tipo: "opcion_multiple", opciones: ["La glucosa","El ATP","La clorofila"], respuesta_correcta: 1 },
      { pregunta: "La fotosíntesis transforma la energía luminosa en energía química almacenada en moléculas orgánicas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-VI-P06",
    codigo: "CNEYT-VI-P06-VID01",
    titulo: "Video básico: Mutaciones, variabilidad genética y evolución",
    descripcion: "Video explicativo sobre las causas de las mutaciones y su papel en la variabilidad genética y la evolución.",
    titulo_video: "Mutaciones, variabilidad genética y evolución",
    descripcion_video: "Video que explica qué causa las mutaciones genéticas y cómo estas contribuyen a la variabilidad genética de las poblaciones y al proceso de evolución de las especies.",
    preguntas: [
      { pregunta: "¿Por qué las mutaciones pueden ser una fuente de variabilidad genética útil para la evolución de una especie?", tipo: "abierta" },
      { pregunta: "¿Cuál de los siguientes puede causar una mutación genética?", tipo: "opcion_multiple", opciones: ["La radiación ultravioleta","El uso de un microscopio","La fotosíntesis"], respuesta_correcta: 0 },
      { pregunta: "Todas las mutaciones son siempre dañinas para el organismo que las presenta.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
  {
    progresion: "PM-VI-P05",
    codigo: "PM-VI-P05-VID01",
    titulo: "Video básico: Incertidumbre, frecuencia y probabilidad mediante simulaciones",
    descripcion: "Video explicativo sobre cómo usar simulaciones para obtener la frecuencia y probabilidad de un evento.",
    titulo_video: "Incertidumbre, frecuencia y probabilidad mediante simulaciones",
    descripcion_video: "Video que explica qué es la incertidumbre asociada a la variabilidad, y cómo mediante simulaciones se puede plantear una hipótesis de trabajo para calcular la frecuencia y la probabilidad de que ocurra un evento.",
    preguntas: [
      { pregunta: "¿Cómo puede una simulación ayudarte a estimar la probabilidad de que ocurra un evento incierto?", tipo: "abierta" },
      { pregunta: "¿Qué se obtiene al repetir muchas veces una simulación de un evento aleatorio?", tipo: "opcion_multiple", opciones: ["Su frecuencia y probabilidad aproximada","Su valor exacto garantizado","Su fórmula algebraica"], respuesta_correcta: 0 },
      { pregunta: "La incertidumbre de un evento está relacionada con su variabilidad.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-VI-P10",
    codigo: "PM-VI-P10-VID01",
    titulo: "Video básico: Conceptos básicos de la teoría de conjuntos",
    descripcion: "Video explicativo sobre los conceptos básicos de la teoría de conjuntos y su aplicación en problemas.",
    titulo_video: "Conceptos básicos de la teoría de conjuntos",
    descripcion_video: "Video que explica qué es un conjunto, sus elementos y las operaciones básicas entre conjuntos (unión, intersección, diferencia) para resolver problemas cotidianos.",
    preguntas: [
      { pregunta: "¿Qué es un conjunto y cómo se representan sus elementos?", tipo: "abierta" },
      { pregunta: "¿Cómo se llama la operación que reúne todos los elementos de dos conjuntos sin repetirlos?", tipo: "opcion_multiple", opciones: ["Intersección","Unión","Complemento"], respuesta_correcta: 1 },
      { pregunta: "La teoría de conjuntos permite organizar y relacionar elementos para resolver problemas.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-VI-P11",
    codigo: "PM-VI-P11-VID01",
    titulo: "Video básico: Técnicas de conteo para calcular probabilidad",
    descripcion: "Video explicativo sobre las técnicas de conteo (permutaciones y combinaciones) para calcular probabilidad.",
    titulo_video: "Técnicas de conteo para calcular probabilidad",
    descripcion_video: "Video que explica cómo elegir y aplicar una técnica de conteo (permutaciones, combinaciones, con o sin orden y reemplazo) para calcular la probabilidad de eventos simples.",
    preguntas: [
      { pregunta: "¿Cuándo debes usar una permutación en lugar de una combinación para contar posibilidades?", tipo: "abierta" },
      { pregunta: "¿Qué técnica de conteo se usa cuando el orden de los elementos SÍ importa?", tipo: "opcion_multiple", opciones: ["La combinación","La permutación","La media aritmética"], respuesta_correcta: 1 },
      { pregunta: "Elegir la técnica de conteo adecuada ayuda a calcular correctamente la probabilidad de un evento.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-VI-P12",
    codigo: "PM-VI-P12-VID01",
    titulo: "Video básico: Relación entre variables categóricas y cuantitativas",
    descripcion: "Video explicativo sobre cómo identificar la relación entre variables categóricas y cuantitativas en un fenómeno de interés.",
    titulo_video: "Relación entre variables categóricas y cuantitativas",
    descripcion_video: "Video que explica cómo, ante una problemática o fenómeno de interés, se puede identificar si dos o más variables (categóricas o cuantitativas) están relacionadas entre sí.",
    preguntas: [
      { pregunta: "¿Qué diferencia hay entre una variable categórica y una variable cuantitativa? Da un ejemplo de cada una.", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una variable categórica?", tipo: "opcion_multiple", opciones: ["La estatura en centímetros","El color de ojos","El peso en kilogramos"], respuesta_correcta: 1 },
      { pregunta: "Identificar la relación entre variables ayuda a entender mejor un fenómeno de interés.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-VI-P07",
    codigo: "PM-VI-P07-VID01",
    titulo: "Video básico: Técnicas de muestreo y aleatoriedad",
    descripcion: "Video explicativo sobre las técnicas de muestreo y la importancia de la aleatoriedad al tomar una muestra.",
    titulo_video: "Técnicas de muestreo y aleatoriedad",
    descripcion_video: "Video que explica qué son las técnicas de muestreo, cómo se usan para extraer información de una población, y por qué la aleatoriedad es clave para que una muestra sea representativa.",
    preguntas: [
      { pregunta: "¿Por qué es importante que una muestra se tome de forma aleatoria y no a conveniencia?", tipo: "abierta" },
      { pregunta: "¿Qué es una muestra en un estudio estadístico?", tipo: "opcion_multiple", opciones: ["Toda la población estudiada","Una parte representativa de la población","Un error de medición"], respuesta_correcta: 1 },
      { pregunta: "Una muestra tomada al azar tiende a ser más representativa de la población completa.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-VI-P03",
    codigo: "PM-VI-P03-VID01",
    titulo: "Video básico: Medidas de tendencia central",
    descripcion: "Video explicativo sobre cómo calcular e interpretar la media, la mediana y la moda en contextos reales.",
    titulo_video: "Medidas de tendencia central",
    descripcion_video: "Video que explica cómo calcular la media, la mediana y la moda de un conjunto de datos, y cómo interpretarlas en situaciones de la vida real.",
    preguntas: [
      { pregunta: "¿Qué información distinta te da la media en comparación con la moda de un conjunto de datos?", tipo: "abierta" },
      { pregunta: "¿Cómo se llama el valor que aparece con más frecuencia en un conjunto de datos?", tipo: "opcion_multiple", opciones: ["La media","La moda","La mediana"], respuesta_correcta: 1 },
      { pregunta: "La mediana es el valor que queda en el centro cuando los datos están ordenados.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-VI-P04",
    codigo: "PM-VI-P04-VID01",
    titulo: "Video básico: Medidas de dispersión y confiabilidad de los datos",
    descripcion: "Video explicativo sobre el rango, la varianza y la desviación estándar, y su relación con la confiabilidad de los datos.",
    titulo_video: "Medidas de dispersión y confiabilidad de los datos",
    descripcion_video: "Video que explica cómo calcular el rango, la varianza y la desviación estándar de un conjunto de datos, y cómo estas medidas indican qué tan confiables o dispersos son los datos.",
    preguntas: [
      { pregunta: "¿Qué significa que un conjunto de datos tenga una desviación estándar alta?", tipo: "abierta" },
      { pregunta: "¿Cuál de las siguientes es una medida de dispersión?", tipo: "opcion_multiple", opciones: ["La moda","La desviación estándar","La media"], respuesta_correcta: 1 },
      { pregunta: "Una desviación estándar baja indica que los datos están poco dispersos respecto a la media.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-VI-P06",
    codigo: "PM-VI-P06-VID01",
    titulo: "Video básico: Probabilidad de eventos simples y compuestos",
    descripcion: "Video explicativo sobre el cálculo de probabilidades de eventos simples, compuestos, condicionales e independientes.",
    titulo_video: "Probabilidad de eventos simples y compuestos",
    descripcion_video: "Video que explica cómo calcular la probabilidad de eventos simples, compuestos, condicionales e independientes, con ejemplos de la vida cotidiana.",
    preguntas: [
      { pregunta: "¿Qué diferencia hay entre un evento independiente y un evento condicional en probabilidad?", tipo: "abierta" },
      { pregunta: "¿Cómo se llama la probabilidad de que ocurra un evento dado que ya ocurrió otro?", tipo: "opcion_multiple", opciones: ["Probabilidad condicional","Probabilidad simple","Probabilidad nula"], respuesta_correcta: 0 },
      { pregunta: "Dos eventos son independientes cuando la ocurrencia de uno no afecta la probabilidad del otro.", tipo: "verdadero_falso", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-VI-P08",
    codigo: "PM-VI-P08-VID01",
    titulo: "Video básico: Interpretación crítica de estadísticas en medios",
    descripcion: "Video explicativo sobre cómo interpretar con sentido crítico los resultados estadísticos que aparecen en los medios de comunicación.",
    titulo_video: "Interpretación crítica de estadísticas en medios",
    descripcion_video: "Video que explica cómo leer con sentido crítico gráficas y resultados estadísticos presentados en noticias, redes sociales y otros medios de comunicación, para identificar posibles sesgos o manipulaciones.",
    preguntas: [
      { pregunta: "¿Qué preguntas te harías antes de creer una estadística que ves en una noticia o red social?", tipo: "abierta" },
      { pregunta: "¿Qué actitud es recomendable al ver una estadística en los medios de comunicación?", tipo: "opcion_multiple", opciones: ["Aceptarla sin cuestionarla","Analizarla con sentido crítico","Ignorarla siempre"], respuesta_correcta: 1 },
      { pregunta: "Los datos estadísticos presentados en los medios de comunicación siempre están libres de sesgos.", tipo: "verdadero_falso", respuesta_correcta: false },
    ],
  },
];

async function main() {
  const sb = createSB();
  log("\n🎬 Semestre 6 — Videos candidatas (tipo 'video_con_preguntas')\n");
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

  log(`\n✅ Sem6 videos candidatas: ${ok} insertados, ${fail} fallidos (de ${videos.length}).\n`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
