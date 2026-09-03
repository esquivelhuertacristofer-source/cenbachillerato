/**
 * LAS 29 ACTIVIDADES DE VIDEO QUE FALTABAN.
 *
 * La auditoría integral encontró 29 progresiones sin ninguna actividad de tipo
 * `video_con_preguntas`. No estaban a medias ni rotas: nunca se les creó la fila.
 * Este script la crea, tomando el título y la descripción del guion que ya se
 * escribió en `video-pipeline/content/<slug>.json` para que la ficha de la
 * actividad y el video digan exactamente lo mismo.
 *
 * DE DÓNDE SALE CADA DATO
 *   titulo_video / descripcion_video  ← del spec (única fuente de verdad)
 *   url_video                         ← R2, la misma ruta que los otros 211
 *   preguntas                         ← escritas aquí, sobre el contenido del guion
 *
 * POR QUÉ LAS PREGUNTAS SE ESCRIBEN A MANO. Derivarlas del texto daría preguntas
 * que se contestan repitiendo la frase anterior. Las tres de cada video siguen el
 * mismo patrón que los 211 existentes: una abierta que pide aplicar lo visto, una
 * de opción múltiple sobre el dato central, y una de verdadero o falso sobre la
 * idea que más se malentiende del tema.
 *
 * CÓDIGO DE LA ACTIVIDAD. Se toma el siguiente `-A{n}` libre de la progresión, en
 * vez de un número fijo: varias de estas progresiones ya recibieron actividades
 * dinámicas y un número fijo las sobrescribiría en silencio.
 *
 * ESTADO. Entra como `borrador` a propósito. La fila apunta a un MP4 que todavía
 * no está en R2 —se renderiza y se sube después—, y una actividad publicada que
 * apunta a un video inexistente es peor que no tenerla. `publicar-borradores.ts`
 * la abre cuando el video ya existe.
 *
 * Uso: npx tsx scripts/seed-videos-faltantes.ts [--publicar]
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { readFileSync, existsSync } from "fs";
import { log, createSB, getProgresionId, upsertActividad } from "./lib/activity-utils";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const R2 = "https://pub-94a8196c0c59456a89cf72193424c9d1.r2.dev/bachillerato";
const CONTENT_DIR = resolve(process.cwd(), "..", "video-pipeline", "content");

type Pregunta =
  | { tipo: "abierta"; pregunta: string }
  | { tipo: "opcion_multiple"; pregunta: string; opciones: string[]; respuesta_correcta: number }
  | { tipo: "verdadero_falso"; pregunta: string; respuesta_correcta: boolean };

interface Def {
  progresion: string;
  preguntas: [Pregunta, Pregunta, Pregunta];
}

const DEFINICIONES: Def[] = [
  {
    progresion: "IN-II-P02",
    preguntas: [
      { tipo: "abierta", pregunta: "Escribe tres oraciones en presente simple sobre lo que hace un familiar tuyo en su tiempo libre, usando un adverbio de frecuencia en cada una." },
      { tipo: "opcion_multiple", pregunta: "¿Cuál es la forma correcta de la tercera persona del verbo 'watch'?", opciones: ["watchs", "watches", "watchies"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "En la pregunta 'Does he play basketball?', el verbo principal vuelve a su forma base porque la marca de tercera persona la lleva 'does'.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-II-P02",
    preguntas: [
      { tipo: "abierta", pregunta: "Describe en un párrafo el conflicto (nudo) de una historia que quieras escribir, e indica qué tipo de narrador usarías y por qué." },
      { tipo: "opcion_multiple", pregunta: "¿Qué narrador conoce los pensamientos de todos los personajes y puede moverse libremente en el tiempo?", opciones: ["El narrador testigo", "El narrador en primera persona", "El narrador omnisciente"], respuesta_correcta: 2 },
      { tipo: "verdadero_falso", pregunta: "En 'No oyes ladrar los perros', de Juan Rulfo, la descripción del paisaje árido funciona como proyección del estado interno del personaje.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CD-II-P02",
    preguntas: [
      { tipo: "abierta", pregunta: "Tu equipo va a entregar un proyecto en línea. Define los roles de cada integrante y la convención con la que van a nombrar los archivos." },
      { tipo: "opcion_multiple", pregunta: "¿Qué herramienta está pensada específicamente para organizar tareas en columnas de tipo kanban?", opciones: ["Trello", "Google Docs", "Padlet"], respuesta_correcta: 0 },
      { tipo: "verdadero_falso", pregunta: "El historial de versiones permite recuperar una versión anterior del documento si alguien comete un error.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-II-P02",
    preguntas: [
      { tipo: "abierta", pregunta: "Escribe un monomio e identifica por separado su coeficiente, su variable y su exponente. Después escribe un binomio y un trinomio con esa misma variable." },
      { tipo: "opcion_multiple", pregunta: "¿Cuál es el resultado de sumar 3x² + 2x + 5x² − x?", opciones: ["8x² + x", "9x³", "8x + x²"], respuesta_correcta: 0 },
      { tipo: "verdadero_falso", pregunta: "Solo se pueden sumar o restar términos semejantes, es decir, los que tienen la misma variable elevada al mismo exponente.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-II-P03",
    preguntas: [
      { tipo: "abierta", pregunta: "Describe una situación médica en la que el principio de autonomía entre en tensión con el de beneficencia, y explica cómo la resolverías." },
      { tipo: "opcion_multiple", pregunta: "¿Qué principio bioético exige que ninguna intervención cause más daño que beneficio?", opciones: ["Justicia", "No maleficencia", "Autonomía"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "Algo puede ser legal sin ser ético, y algo puede ser éticamente cuestionable sin ser ilegal.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CS-II-P04",
    preguntas: [
      { tipo: "abierta", pregunta: "Identifica en tu entorno un ejemplo de cada tipo de dominación de Weber: tradicional, carismática y legal-racional." },
      { tipo: "opcion_multiple", pregunta: "En el coeficiente de Gini, ¿qué representa un valor cercano a 1?", opciones: ["Igualdad perfecta", "Desigualdad absoluta", "Ausencia de datos"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "Para Max Weber, el poder incluye la probabilidad de imponer la propia voluntad incluso contra la resistencia de otros.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-II-P06",
    preguntas: [
      { tipo: "abierta", pregunta: "Calcula de forma aproximada en qué categoría se concentra tu huella de carbono personal y propón dos cambios concretos en esa categoría." },
      { tipo: "opcion_multiple", pregunta: "En una huella de carbono individual, ¿qué categoría pesa más?", opciones: ["El hogar", "Los bienes manufacturados", "El transporte"], respuesta_correcta: 2 },
      { tipo: "verdadero_falso", pregunta: "Las energías renovables no emiten CO2 durante la generación, pero enfrentan el desafío de la intermitencia.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-II-P06",
    preguntas: [
      { tipo: "abierta", pregunta: "Toma un párrafo tuyo y reescríbelo dos veces: una amplificándolo con detalles sensoriales y otra condensándolo al mínimo. Explica cuál funciona mejor y por qué." },
      { tipo: "opcion_multiple", pregunta: "¿Qué estrategia de reescritura convierte un reporte en un testimonio?", opciones: ["La sustitución léxica", "El cambio de voz narrativa", "La condensación"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "Reescribir es solo corregir errores de ortografía y cambiar algunas palabras.", respuesta_correcta: false },
    ],
  },
  {
    progresion: "IN-II-P06",
    preguntas: [
      { tipo: "abierta", pregunta: "Escribe en inglés las indicaciones para llegar de tu escuela a la farmacia más cercana, usando al menos cuatro de las frases del video." },
      { tipo: "opcion_multiple", pregunta: "¿Cómo se dice en inglés 'sigue derecho dos cuadras'?", opciones: ["Turn right for two blocks", "Go straight ahead for two blocks", "Take the second street"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "En muchas comunidades mexicanas es normal dar indicaciones por referencias locales en vez de por nombres de calle.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-III-P02",
    preguntas: [
      { tipo: "abierta", pregunta: "Escribe tres preguntas con 'Have you ever...?' sobre comida, viajes o experiencias culturales, y contéstalas tú mismo." },
      { tipo: "opcion_multiple", pregunta: "¿Cuál es el participio pasado del verbo 'write'?", opciones: ["writed", "wrote", "written"], respuesta_correcta: 2 },
      { tipo: "verdadero_falso", pregunta: "Si mencionas el momento exacto en que ocurrió algo, en inglés se usa el pasado simple y no el presente perfecto.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-III-P03",
    preguntas: [
      { tipo: "abierta", pregunta: "Calcula el discriminante de x² − 6x + 9 = 0 y explica qué te dice sobre la gráfica de la parábola correspondiente." },
      { tipo: "opcion_multiple", pregunta: "Si Δ < 0, ¿qué ocurre con la parábola?", opciones: ["Cruza el eje horizontal en dos puntos", "Es tangente al eje horizontal", "No toca el eje horizontal"], respuesta_correcta: 2 },
      { tipo: "verdadero_falso", pregunta: "El discriminante permite saber cuántas soluciones reales tiene una ecuación sin resolverla por completo.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-III-P06",
    preguntas: [
      { tipo: "abierta", pregunta: "Encuentra el vértice y el eje de simetría de f(x) = 2x² − 8x + 5, y describe hacia dónde abre la parábola." },
      { tipo: "opcion_multiple", pregunta: "¿Cuál es la fórmula de la coordenada horizontal del vértice?", opciones: ["xv = -b / 2a", "xv = b² − 4ac", "xv = -c / a"], respuesta_correcta: 0 },
      { tipo: "verdadero_falso", pregunta: "Si el coeficiente 'a' es negativo, la parábola abre hacia abajo y su vértice es un punto máximo.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-III-P06",
    preguntas: [
      { tipo: "abierta", pregunta: "Identifica una manifestación de deterioro ambiental en tu localidad y explica en qué escala ocurre: local, regional o global." },
      { tipo: "opcion_multiple", pregunta: "Según CONAFOR (2023), ¿cuál es la principal causa de deforestación en México?", opciones: ["La tala ilegal", "La ganadería extensiva", "La agricultura de roza-tumba-quema"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "La deforestación y el cambio climático se amplifican mutuamente: menos bosque absorbe menos CO2, y más calor produce más incendios.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-III-P05",
    preguntas: [
      { tipo: "abierta", pregunta: "Elige un fragmento de un poema mexicano, léelo en voz alta e identifica al menos dos figuras retóricas, explicando el efecto de cada una." },
      { tipo: "opcion_multiple", pregunta: "'El viento susurra secretos entre los árboles' es un ejemplo de:", opciones: ["Hipérbole", "Símil", "Personificación"], respuesta_correcta: 2 },
      { tipo: "verdadero_falso", pregunta: "La rima consonante coincide en todos los sonidos desde la última vocal acentuada; la asonante, solo en las vocales.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "LC-III-P07",
    preguntas: [
      { tipo: "abierta", pregunta: "Planea la exposición oral de tu reseña: escribe tu tesis, dos argumentos con evidencia y la idea con la que vas a cerrar." },
      { tipo: "opcion_multiple", pregunta: "¿Qué formato permite que la audiencia intervenga directamente con preguntas y experiencias?", opciones: ["El coloquio", "El simposio", "El foro"], respuesta_correcta: 2 },
      { tipo: "verdadero_falso", pregunta: "El lenguaje académico oral se distingue por el uso de conectores discursivos y la referencia explícita a las fuentes.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-III-P06",
    preguntas: [
      { tipo: "abierta", pregunta: "Escribe en inglés las instrucciones de una receta mexicana en cinco pasos, usando First, Then, Next, After that y Finally." },
      { tipo: "opcion_multiple", pregunta: "¿Cuál es la forma correcta de una instrucción en inglés?", opciones: ["You open the document", "Open the document", "You should to open the document"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "En el imperativo en inglés, el sujeto 'you' se sobreentiende y no se escribe.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PFH-III-P03",
    preguntas: [
      { tipo: "abierta", pregunta: "Describe una experiencia tuya que puedas clasificar como sublime y explica por qué no la considerarías simplemente bella." },
      { tipo: "opcion_multiple", pregunta: "Según Kant, ¿qué caracteriza al placer que produce lo bello?", opciones: ["Es interesado y busca poseer el objeto", "Es desinteresado: solo se contempla", "Depende del precio de la obra"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "Las catrinas de José Guadalupe Posada son un ejemplo de lo grotesco porque mezclan lo macabro con lo festivo.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-IV-P03",
    preguntas: [
      { tipo: "abierta", pregunta: "Ordena de menor a mayor pH cinco sustancias que tengas en casa y explica qué consecuencia práctica tiene su acidez o basicidad." },
      { tipo: "opcion_multiple", pregunta: "¿Por qué el bicarbonato de sodio funciona como antiácido?", opciones: ["Porque es ácido y refuerza la digestión", "Porque es básico y neutraliza el exceso de ácido", "Porque tiene pH neutro"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "La sangre humana debe mantenerse en un rango de pH muy estrecho, entre 7.35 y 7.45.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-IV-P07",
    preguntas: [
      { tipo: "abierta", pregunta: "Explica con un ejemplo por qué un depredador tope acumula más contaminante que los organismos de los que se alimenta." },
      { tipo: "opcion_multiple", pregunta: "¿Qué tamaño define a un microplástico?", opciones: ["Menor a 5 milímetros", "Menor a 5 centímetros", "Menor a 5 micrómetros"], respuesta_correcta: 0 },
      { tipo: "verdadero_falso", pregunta: "Según SEMARNAT (2022), México recicla formalmente alrededor del 9.6% de sus residuos sólidos urbanos.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-IV-P02",
    preguntas: [
      { tipo: "abierta", pregunta: "Parte de f(x) = x² y describe qué transformación aplicarías para obtener una parábola desplazada 3 unidades a la derecha y 2 hacia abajo." },
      { tipo: "opcion_multiple", pregunta: "¿Qué hace f(x + h) sobre la gráfica de f(x)?", opciones: ["La mueve h unidades a la derecha", "La mueve h unidades a la izquierda", "La estira verticalmente"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "La tarifa doméstica de la CFE es un ejemplo de función por tramos, donde cada tramo es una función lineal distinta.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "PM-IV-P05",
    preguntas: [
      { tipo: "abierta", pregunta: "Plantea un problema de medición de tu comunidad en el que un punto sea inaccesible y explica qué ley usarías para calcular la distancia." },
      { tipo: "opcion_multiple", pregunta: "¿Qué ley se usa cuando se conocen dos lados y el ángulo comprendido entre ellos (caso LAL)?", opciones: ["La Ley de Senos", "La Ley de Cosenos", "El teorema de Pitágoras"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "Cuando el ángulo C mide 90°, la Ley de Cosenos se reduce exactamente al teorema de Pitágoras.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CS-III-P03",
    preguntas: [
      { tipo: "abierta", pregunta: "Identifica una forma de participación juvenil que exista en tu comunidad y explica qué transformación busca." },
      { tipo: "opcion_multiple", pregunta: "¿Qué rango de edad abarca la definición institucional de juventud en México?", opciones: ["De 15 a 24 años", "De 12 a 29 años", "De 18 a 30 años"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "El movimiento #YoSoy132 mostró que las juventudes podían organizarse horizontalmente sin estructuras partidistas.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-IV-P02",
    preguntas: [
      { tipo: "abierta", pregunta: "Escribe tres comparaciones en inglés entre lugares o comidas de México, y una oración con superlativo que justifique tu preferencia." },
      { tipo: "opcion_multiple", pregunta: "¿Cuál es el superlativo correcto de 'good'?", opciones: ["the goodest", "the most good", "the best"], respuesta_correcta: 2 },
      { tipo: "verdadero_falso", pregunta: "Decir 'more faster' es incorrecto porque 'faster' ya es el comparativo de 'fast'.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-IV-P05",
    preguntas: [
      { tipo: "abierta", pregunta: "Escribe en inglés tres planes tuyos con 'be going to' y una predicción con 'will', y explica en español por qué elegiste cada estructura." },
      { tipo: "opcion_multiple", pregunta: "Al ver nubes oscuras ahora mismo, ¿qué estructura prefiere el inglés?", opciones: ["It will rain this afternoon", "It is going to rain this afternoon", "It rains this afternoon"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "'Will' se usa para decisiones espontáneas tomadas en el momento de hablar.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "IN-IV-P08",
    preguntas: [
      { tipo: "abierta", pregunta: "Escribe un párrafo en inglés con estructura de tres partes (oración temática, detalles y conclusión) sobre un tema que te interese." },
      { tipo: "opcion_multiple", pregunta: "¿En qué consiste el 'scanning' como estrategia de lectura?", opciones: ["Leer rápido para captar el tema general", "Buscar un dato específico en el texto", "Traducir palabra por palabra"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "El presente perfecto sirve tanto para experiencias sin fecha como para situaciones que empezaron antes y continúan.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-V-P08",
    preguntas: [
      { tipo: "abierta", pregunta: "Argumenta a favor o en contra de ampliar la generación nucleoeléctrica en México, usando al menos un dato del video." },
      { tipo: "opcion_multiple", pregunta: "¿Qué porcentaje aproximado de la electricidad nacional produce Laguna Verde según la CFE (2023)?", opciones: ["3.5%", "12%", "25%"], respuesta_correcta: 0 },
      { tipo: "verdadero_falso", pregunta: "El problema de los residuos radiactivos de alta actividad ya está resuelto: existen repositorios geológicos permanentes en operación.", respuesta_correcta: false },
    ],
  },
  {
    progresion: "IN-V-P07",
    preguntas: [
      { tipo: "abierta", pregunta: "Escribe en inglés cómo pedirías la palabra, cómo mostrarías desacuerdo con respeto y cómo parafrasearías lo que dijo otra persona." },
      { tipo: "opcion_multiple", pregunta: "¿Qué caracteriza a un panel frente a un debate formal?", opciones: ["Los participantes deben tomar posiciones opuestas", "No requiere posiciones opuestas: fomenta múltiples perspectivas", "No participa un moderador"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "Parafrasear lo que dijo otra persona es una forma de escucha activa y demuestra que se entendió su punto.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CNEYT-VI-P04",
    preguntas: [
      { tipo: "abierta", pregunta: "Explica con tus palabras qué le ocurriría a una proteína si en la transcripción se leyera la hebra equivocada del ADN." },
      { tipo: "opcion_multiple", pregunta: "¿Qué codón funciona universalmente como señal de inicio de la traducción?", opciones: ["UAA", "AUG", "UGA"], respuesta_correcta: 1 },
      { tipo: "verdadero_falso", pregunta: "En los organismos eucariontes, los intrones se eliminan del pre-ARNm mediante un proceso llamado splicing.", respuesta_correcta: true },
    ],
  },
  {
    progresion: "CD-II-P05",
    preguntas: [
      { tipo: "abierta", pregunta: "Vas a publicar un contenido sobre un problema de tu comunidad. Explica cómo cumplirías los principios de veracidad, privacidad y transparencia." },
      { tipo: "opcion_multiple", pregunta: "¿Qué licencia Creative Commons exige que las obras derivadas mantengan la misma licencia?", opciones: ["CC-BY", "CC-NC", "CC-SA"], respuesta_correcta: 2 },
      { tipo: "verdadero_falso", pregunta: "La forma más confiable de detectar un deepfake es verificar la fuente original del contenido.", respuesta_correcta: true },
    ],
  },
];

/** Lee el spec del video para no duplicar el título ni la descripción. */
function leerSpec(progresion: string): { slug: string; titulo: string; descripcion: string } {
  const slug = `${progresion.toLowerCase()}-vid01`;
  const ruta = resolve(CONTENT_DIR, `${slug}.json`);
  if (!existsSync(ruta)) throw new Error(`No existe el guion ${slug}.json — corre antes tts/emitir-specs.py`);
  const spec = JSON.parse(readFileSync(ruta, "utf8")) as {
    title: string;
    intro: { text: string };
  };
  // La descripción del video es la promesa de la intro, recortada a una oración:
  // es lo que ya escuchará el alumno, así que decir otra cosa sería contradecirse.
  const primeraOracion = spec.intro.text.split(/(?<=\.)\s/)[0] ?? spec.intro.text;
  return { slug, titulo: spec.title, descripcion: primeraOracion.trim() };
}

/** Siguiente código -A{n} libre de la progresión. */
async function siguienteCodigo(
  sb: ReturnType<typeof createSB>,
  progresionId: string,
  progresion: string
): Promise<string> {
  const { data } = await sb.from("actividades").select("codigo").eq("progresion_id", progresionId);
  let max = 0;
  for (const a of data ?? []) {
    const m = /-A(\d+)$/.exec(a.codigo);
    if (m) max = Math.max(max, parseInt(m[1]!, 10));
  }
  return `${progresion}-A${max + 1}`;
}

async function main() {
  const publicar = process.argv.includes("--publicar");
  const sb = createSB();
  let ok = 0;
  const fallos: string[] = [];

  log(`\n=== 29 actividades de video faltantes (${publicar ? "publicada" : "borrador"}) ===\n`);

  for (const def of DEFINICIONES) {
    try {
      const spec = leerSpec(def.progresion);
      const progresionId = await getProgresionId(sb, def.progresion);
      const codigo = await siguienteCodigo(sb, progresionId, def.progresion);

      const creado = await upsertActividad(sb, {
        codigo,
        titulo: `Video: ${spec.titulo}`,
        descripcion: spec.descripcion,
        tipo: "video_con_preguntas",
        progresion_id: progresionId,
        xp: 15,
        estado: publicar ? "publicada" : "borrador",
        contenido: {
          url_video: `${R2}/${spec.slug}.mp4`,
          titulo_video: spec.titulo,
          descripcion_video: spec.descripcion,
          subtitulos_disponibles: false,
          preguntas: def.preguntas,
        },
      });
      if (creado) ok++;
      else fallos.push(def.progresion);
    } catch (e) {
      fallos.push(`${def.progresion}: ${(e as Error).message}`);
    }
  }

  log(`\nCreadas ${ok}/${DEFINICIONES.length}`);
  if (fallos.length) log(`Fallos: ${fallos.join(" | ")}`);
}

main();
