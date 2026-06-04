/**
 * Refuerzo LC-II (Plantilla CEN): agrega A4-A7 a las 8 progresiones que ya tienen A1-A3.
 * UAC: Lengua y Comunicación II — "Libertad para imaginar, poder para comunicar".
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * Keyed por CÓDIGO (LC-II-P01..P08). Todas en estado='borrador'.
 * Uso: npx tsx scripts/seed-activities-lcii-refuerzo.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Refuerzo = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;
const letras = ["A4", "A5", "A6", "A7"];

const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo argumentarlo." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 Refuerzo LC-II — A4-A7 para las 8 progresiones existentes\n");
  const progs = await getProgresionesDeUAC(sb, "LC-II");
  let ok = 0, fail = 0, skip = 0;
  for (const p of progs) {
    const set = refuerzos[p.codigo];
    if (!set) { skip++; continue; }
    for (let i = 0; i < set.length; i++) {
      const r = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`, titulo: r.titulo, descripcion: r.descripcion,
        tipo: r.tipo, progresion_id: p.id, xp: r.xp, contenido: r.contenido,
      });
      res ? ok++ : fail++;
    }
  }
  log(`\n✅ LC-II refuerzo: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas.\n`);
}

const refuerzos: Record<string, Refuerzo[]> = {
  // ════════ LC-II-P01 — Narra situaciones de su historia de vida (huella personal) ════════
  "LC-II-P01": [
    { titulo: "Mi historia de vida — Verdadero o falso", descripcion: "Distingue afirmaciones sobre narración, descripción y la diferencia entre ficción y realidad.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Narrar es contar hechos o situaciones que ocurren a lo largo del tiempo.", respuesta: true, retroalimentacion: "Correcto: la narración relata acontecimientos en una secuencia." },
        { enunciado: "Describir consiste en decir cómo son las personas, lugares u objetos.", respuesta: true, retroalimentacion: "Correcto: la descripción detalla características y cualidades." },
        { enunciado: "En un texto todas las ideas tienen exactamente la misma importancia.", respuesta: false, retroalimentacion: "Hay ideas prioritarias (principales) e ideas secundarias que las apoyan." },
        { enunciado: "Un relato de tu historia de vida puede mezclar elementos de realidad y de ficción.", respuesta: true, retroalimentacion: "Correcto: al narrar tu vida puedes recrear o imaginar partes, distinguiendo lo real de lo ficticio." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: narración, descripción y huella personal", descripcion: "Aprende los términos clave para narrar tu historia de vida.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Narración", definicion: "Relato de hechos o situaciones que suceden a lo largo del tiempo, con un orden.", ejemplo: "Contar cómo fue tu primer día en el bachillerato." },
        { termino: "Descripción", definicion: "Explicación de cómo son las personas, lugares, objetos o emociones.", ejemplo: "Describir la casa donde creciste." },
        { termino: "Idea prioritaria", definicion: "Idea principal de un texto, la más importante que sostiene el mensaje.", ejemplo: "En un relato de viaje, el destino y su importancia." },
        { termino: "Idea secundaria", definicion: "Idea que complementa o apoya a la idea principal con detalles.", ejemplo: "Los pequeños sucesos que ocurrieron durante el viaje." },
        { termino: "Ficción y realidad", definicion: "La ficción es lo inventado o imaginado; la realidad es lo que ocurrió de verdad.", ejemplo: "Un recuerdo real al que añades un final imaginado." },
      ], actividad_final: "Escribe tres situaciones reales de tu vida y marca cuál sería la idea prioritaria de cada una." } },
    { titulo: "Completa: narrar mi historia", descripcion: "Completa el texto sobre narración, descripción e ideas en un relato personal.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Cuando cuento hechos que ocurren en el tiempo estoy haciendo una ___; cuando digo cómo son las personas o lugares estoy haciendo una ___. La idea más importante de un texto es la idea ___, y las que la apoyan son las ideas ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "narración", alternativas_aceptadas: ["narracion"], pista: "Contar hechos en el tiempo." },
          { posicion: 1, respuesta_correcta: "descripción", alternativas_aceptadas: ["descripcion"], pista: "Decir cómo son las cosas." },
          { posicion: 2, respuesta_correcta: "prioritaria", alternativas_aceptadas: ["principal"], pista: "La más importante." },
          { posicion: 3, respuesta_correcta: "secundarias", pista: "Las que apoyan a la principal." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Mi historia de vida", descripcion: "Valora tu capacidad para narrar y describir situaciones de tu vida.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Narro y describo situaciones de mi historia de vida con claridad.", escala: escala4 },
        { descripcion: "Distingo las ideas prioritarias de las secundarias en mi relato.", escala: escala4 },
        { descripcion: "Identifico qué partes de mi relato son reales y cuáles ficticias.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué situación de tu vida te gustaría narrar y compartir con tu grupo, y por qué?" } },
  ],

  // ════════ LC-II-P02 — Escribe un texto descriptivo o narrativo de su autoría ════════
  "LC-II-P02": [
    { titulo: "Escribir un texto propio — Verdadero o falso", descripcion: "Distingue afirmaciones sobre la organización de ideas y el sentido comunicativo de un texto.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Antes de escribir conviene organizar las ideas con un esquema, lista o borrador.", respuesta: true, retroalimentacion: "Correcto: planear ayuda a ordenar lo que se quiere decir." },
        { enunciado: "El sentido comunicativo de un texto es la intención o propósito con que se escribe.", respuesta: true, retroalimentacion: "Correcto: informar, narrar, describir, convencer, emocionar, etc." },
        { enunciado: "Un texto bien hecho no necesita revisión ni corrección.", respuesta: false, retroalimentacion: "Revisar y corregir el borrador mejora la claridad del texto." },
        { enunciado: "Un texto puede ser descriptivo, narrativo o combinar ambos según lo que se quiera comunicar.", respuesta: true, retroalimentacion: "Correcto: la forma depende del propósito comunicativo." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: escritura y sentido comunicativo", descripcion: "Aprende los términos clave para escribir un texto de tu autoría.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Organización de ideas", definicion: "Ordenar lo que se va a escribir antes y durante la redacción.", ejemplo: "Hacer una lista o un esquema de los puntos del texto." },
        { termino: "Sentido comunicativo", definicion: "Propósito o intención con la que se escribe un texto.", ejemplo: "Narrar una anécdota para emocionar al lector." },
        { termino: "Borrador", definicion: "Primera versión de un texto que luego se revisa y corrige.", ejemplo: "Un escrito inicial con tachones y notas al margen." },
        { termino: "Texto descriptivo", definicion: "Texto cuyo propósito es mostrar cómo son personas, lugares u objetos.", ejemplo: "La descripción de un paisaje." },
        { termino: "Texto narrativo", definicion: "Texto que relata hechos o sucesos en una secuencia temporal.", ejemplo: "Un cuento o una anécdota." },
      ], actividad_final: "Define el sentido comunicativo de un texto que quieras escribir y haz una lista de sus ideas." } },
    { titulo: "Completa: escribir mi texto", descripcion: "Completa el texto sobre la organización de ideas y el sentido comunicativo.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Antes de escribir conviene ___ las ideas con un esquema o lista. El propósito con que se escribe es el ___ comunicativo. La primera versión del texto se llama ___, y conviene ___ lo para mejorarlo.",
        huecos: [
          { posicion: 0, respuesta_correcta: "organizar", alternativas_aceptadas: ["ordenar"], pista: "Poner en orden." },
          { posicion: 1, respuesta_correcta: "sentido", pista: "___ comunicativo: la intención." },
          { posicion: 2, respuesta_correcta: "borrador", pista: "Primera versión." },
          { posicion: 3, respuesta_correcta: "revisar", alternativas_aceptadas: ["corregir"], pista: "Mejorar el borrador." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Escribir un texto propio", descripcion: "Valora tu proceso de escritura de un texto descriptivo o narrativo.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Organizo mis ideas antes y durante la escritura.", escala: escala4 },
        { descripcion: "Defino el sentido comunicativo de mi texto.", escala: escala4 },
        { descripcion: "Reviso y corrijo mi borrador para mejorarlo.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué fue lo más difícil al escribir tu propio texto y cómo lo resolviste?" } },
  ],

  // ════════ LC-II-P03 — Identifica características lingüísticas en narrativas populares ════════
  "LC-II-P03": [
    { titulo: "Narrativas populares — Verdadero o falso", descripcion: "Distingue afirmaciones sobre narrativas populares, oralidad y sus adaptaciones modernas.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Las leyendas, mitos y cuentos populares forman parte de las narrativas populares.", respuesta: true, retroalimentacion: "Correcto: surgen de la cultura y la tradición de un pueblo." },
        { enunciado: "Muchas narrativas populares se transmitieron de forma oral antes de escribirse.", respuesta: true, retroalimentacion: "Correcto: la oralidad ha sido clave para conservarlas." },
        { enunciado: "Una creepypasta o un cómic no pueden ser adaptaciones de narrativas tradicionales.", respuesta: false, retroalimentacion: "Sí pueden serlo: son formas modernas de contar historias tradicionales." },
        { enunciado: "Reescribir una narración breve permite adaptarla a un nuevo contexto o lenguaje.", respuesta: true, retroalimentacion: "Correcto: la reescritura actualiza o transforma el relato." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: narrativas populares y oralidad", descripcion: "Aprende los términos clave de las narrativas populares y sus formas.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Narrativa popular", definicion: "Relato que nace de la cultura y la tradición de un pueblo o comunidad.", ejemplo: "La leyenda de La Llorona." },
        { termino: "Oralidad", definicion: "Transmisión de relatos de boca en boca, sin estar escritos.", ejemplo: "Cuentos que tus abuelos contaban de memoria." },
        { termino: "Mito", definicion: "Relato tradicional que explica el origen del mundo, dioses o fenómenos.", ejemplo: "Mitos sobre la creación del Sol y la Luna." },
        { termino: "Leyenda", definicion: "Relato tradicional que mezcla hechos reales con elementos fantásticos.", ejemplo: "La leyenda del Callejón del Beso." },
        { termino: "Creepypasta", definicion: "Relato breve de terror que circula y se reescribe en internet.", ejemplo: "Historias de miedo compartidas en foros y redes." },
      ], actividad_final: "Investiga una narrativa popular de tu región y di si conoces alguna adaptación moderna de ella." } },
    { titulo: "Completa: narrativas populares", descripcion: "Completa el texto sobre narrativas populares, oralidad y adaptaciones.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Las narrativas ___ nacen de la tradición de un pueblo y muchas se transmitieron por ___ antes de escribirse. Un relato que explica el origen del mundo es un ___, mientras que la ___ mezcla hechos reales con elementos fantásticos.",
        huecos: [
          { posicion: 0, respuesta_correcta: "populares", pista: "Del pueblo." },
          { posicion: 1, respuesta_correcta: "oralidad", alternativas_aceptadas: ["tradición oral", "tradicion oral"], pista: "De boca en boca." },
          { posicion: 2, respuesta_correcta: "mito", pista: "Explica el origen del mundo o dioses." },
          { posicion: 3, respuesta_correcta: "leyenda", pista: "Mezcla realidad y fantasía." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Narrativas populares", descripcion: "Valora tu reconocimiento de las narrativas populares y sus rasgos.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Reconozco narrativas populares según su contexto y mi interés.", escala: escala4 },
        { descripcion: "Relaciono la narración con la oralidad y la tradición.", escala: escala4 },
        { descripcion: "Identifico adaptaciones modernas (cómic, creepypasta, teatro) de relatos tradicionales.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué narrativa popular te gustaría reescribir como cómic o creepypasta y por qué?" } },
  ],

  // ════════ LC-II-P04 — Relevancia de personajes y escenarios en la narrativa popular ════════
  "LC-II-P04": [
    { titulo: "Personajes y escenarios — Verdadero o falso", descripcion: "Distingue afirmaciones sobre la caracterización y clasificación de los personajes.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Caracterizar a un personaje es describir cómo es física y psicológicamente y cómo actúa.", respuesta: true, retroalimentacion: "Correcto: la caracterización define su apariencia, personalidad y conducta." },
        { enunciado: "Los personajes pueden cambiar o evolucionar de inicio a fin de la historia.", respuesta: true, retroalimentacion: "Correcto: muchos relatos muestran la transformación de sus personajes." },
        { enunciado: "El escenario o ambiente donde ocurre la historia no influye en el relato.", respuesta: false, retroalimentacion: "El escenario aporta sentido, atmósfera y contexto a la narrativa." },
        { enunciado: "Los personajes pueden clasificarse, por ejemplo, en principales y secundarios.", respuesta: true, retroalimentacion: "Correcto: también en protagonista, antagonista, etc." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: personajes y escenarios", descripcion: "Aprende los términos clave sobre los personajes de la narrativa.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Caracterización", definicion: "Conjunto de rasgos físicos, psicológicos y de conducta que definen a un personaje.", ejemplo: "Un personaje valiente, alto y de mirada decidida." },
        { termino: "Protagonista", definicion: "Personaje principal alrededor del cual gira la historia.", ejemplo: "El héroe o la heroína del relato." },
        { termino: "Antagonista", definicion: "Personaje que se opone al protagonista o le crea conflicto.", ejemplo: "El villano que dificulta la meta del héroe." },
        { termino: "Personaje secundario", definicion: "Personaje que acompaña o apoya la historia sin ser el centro.", ejemplo: "Un amigo o ayudante del protagonista." },
        { termino: "Escenario", definicion: "Lugar y ambiente donde se desarrolla la historia.", ejemplo: "Un bosque oscuro, un pueblo, una nave espacial." },
      ], actividad_final: "Elige un personaje de una narrativa popular y describe su caracterización de inicio a fin." } },
    { titulo: "Completa: personajes y escenarios", descripcion: "Completa el texto sobre la construcción de personajes.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Describir los rasgos de un personaje es ___ lo. El personaje principal es el ___ y quien se le opone es el ___. El lugar y ambiente donde ocurre la historia es el ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "caracterizar", pista: "Describir cómo es." },
          { posicion: 1, respuesta_correcta: "protagonista", pista: "Personaje principal." },
          { posicion: 2, respuesta_correcta: "antagonista", pista: "Se opone al protagonista." },
          { posicion: 3, respuesta_correcta: "escenario", alternativas_aceptadas: ["ambiente"], pista: "Lugar de la historia." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Personajes y escenarios", descripcion: "Valora tu comprensión de los personajes y su relevancia en la narrativa.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Caracterizo a los personajes y describo sus relaciones de inicio a fin.", escala: escala4 },
        { descripcion: "Clasifico a los personajes (protagonista, antagonista, secundarios).", escala: escala4 },
        { descripcion: "Reconozco cómo el escenario aporta sentido a la narrativa.", escala: escala4 },
      ], reflexion_final_prompt: "Si crearas un personaje, ¿cómo lo caracterizarías y en qué escenario lo pondrías?" } },
  ],

  // ════════ LC-II-P05 — Distingue temas e ideas centrales y secundarias ════════
  "LC-II-P05": [
    { titulo: "Tema e idea principal — Verdadero o falso", descripcion: "Distingue afirmaciones sobre el tema, la idea principal y las ideas secundarias.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El tema es el asunto general del que trata un texto.", respuesta: true, retroalimentacion: "Correcto: el tema se puede resumir en pocas palabras (ej. la amistad)." },
        { enunciado: "La idea principal y el tema son exactamente lo mismo.", respuesta: false, retroalimentacion: "El tema es el asunto; la idea principal es lo que el texto afirma sobre ese asunto." },
        { enunciado: "Las ideas secundarias amplían, explican o ejemplifican la idea principal.", respuesta: true, retroalimentacion: "Correcto: sirven de apoyo a la idea central." },
        { enunciado: "Un mismo tema puede tratarse de maneras distintas en varias narrativas.", respuesta: true, retroalimentacion: "Correcto: por eso es útil comparar cómo lo abordan distintos relatos." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: tema, idea principal y secundaria", descripcion: "Aprende a distinguir el tema de las ideas de un texto.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Tema", definicion: "Asunto general del que trata un texto, expresable en pocas palabras.", ejemplo: "El valor, la amistad, la muerte." },
        { termino: "Idea principal", definicion: "Afirmación más importante que el texto hace sobre el tema.", ejemplo: "La amistad verdadera resiste las dificultades." },
        { termino: "Idea secundaria", definicion: "Idea que apoya, explica o ejemplifica la idea principal.", ejemplo: "Un ejemplo concreto de dos amigos que se ayudan." },
        { termino: "Comparación de temas", definicion: "Analizar cómo distintas narrativas tratan un mismo tema.", ejemplo: "Comparar el tema del miedo en dos leyendas." },
      ], actividad_final: "Lee un relato breve e identifica su tema, su idea principal y dos ideas secundarias." } },
    { titulo: "Completa: tema e ideas", descripcion: "Completa el texto sobre tema, idea principal y secundaria.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "El asunto general de un texto es el ___. Lo más importante que el texto afirma sobre ese asunto es la idea ___. Las ideas que la apoyan y ejemplifican son las ideas ___. Un mismo tema se puede ___ en varias narrativas distintas.",
        huecos: [
          { posicion: 0, respuesta_correcta: "tema", pista: "El asunto general." },
          { posicion: 1, respuesta_correcta: "principal", alternativas_aceptadas: ["central"], pista: "La más importante." },
          { posicion: 2, respuesta_correcta: "secundarias", pista: "Las que apoyan." },
          { posicion: 3, respuesta_correcta: "comparar", pista: "Ver semejanzas y diferencias." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Tema e ideas", descripcion: "Valora tu capacidad para distinguir tema, idea principal e ideas secundarias.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Diferencio el tema de la idea principal de un texto.", escala: escala4 },
        { descripcion: "Identifico las ideas secundarias y su función.", escala: escala4 },
        { descripcion: "Comparo cómo un mismo tema aparece en distintas narrativas.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué tema te interesa y en qué narrativas (canciones, películas, libros) lo has visto tratado?" } },
  ],

  // ════════ LC-II-P06 — Reescribe integrando elementos lingüísticos y narrativos ════════
  "LC-II-P06": [
    { titulo: "Conectores, trama y tonos — Verdadero o falso", descripcion: "Distingue afirmaciones sobre conectores, trama, tipos de narración y tonos narrativos.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Los conectores textuales son palabras o frases que enlazan ideas y marcan jerarquías.", respuesta: true, retroalimentacion: "Correcto: por ejemplo 'sin embargo', 'por lo tanto', 'además'." },
        { enunciado: "El conflicto es el problema o situación que da tensión a la trama.", respuesta: true, retroalimentacion: "Correcto: el conflicto mueve la historia hacia adelante." },
        { enunciado: "Una narración autobiográfica cuenta hechos inventados de personas desconocidas.", respuesta: false, retroalimentacion: "La autobiográfica cuenta la propia vida del autor; lo inventado sería ficción/fantástica." },
        { enunciado: "El tono narrativo puede ser humorístico, dramático o irónico, entre otros.", respuesta: true, retroalimentacion: "Correcto: el tono expresa la actitud con que se cuenta la historia." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: conectores, trama y tonos", descripcion: "Aprende los elementos lingüísticos y narrativos para reescribir un texto.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Conector textual", definicion: "Palabra o frase que enlaza ideas y marca su jerarquía u orden.", ejemplo: "Además, sin embargo, por lo tanto, primero, finalmente." },
        { termino: "Trama", definicion: "Conjunto ordenado de acontecimientos que forman la historia.", ejemplo: "Inicio, desarrollo, clímax y desenlace de un cuento." },
        { termino: "Conflicto", definicion: "Problema o situación de tensión que enfrenta el personaje.", ejemplo: "Un héroe que debe superar un obstáculo." },
        { termino: "Tipo de narración", definicion: "Clase de relato según su contenido: realista, fantástica, histórica o autobiográfica.", ejemplo: "Una narración fantástica con dragones." },
        { termino: "Tono narrativo", definicion: "Actitud o intención emocional con que se cuenta la historia.", ejemplo: "Tono humorístico, dramático o irónico." },
      ], actividad_final: "Reescribe un párrafo de un relato cambiando su tono (por ejemplo, de dramático a humorístico)." } },
    { titulo: "Completa: reescribir un texto", descripcion: "Completa el texto sobre conectores, trama y tonos narrativos.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Las palabras que enlazan ideas y marcan jerarquías son los ___. El conjunto ordenado de sucesos de una historia es la ___, y el problema que genera tensión es el ___. La actitud emocional con que se narra es el ___ narrativo.",
        huecos: [
          { posicion: 0, respuesta_correcta: "conectores", pista: "Enlazan ideas." },
          { posicion: 1, respuesta_correcta: "trama", pista: "Sucesión de hechos." },
          { posicion: 2, respuesta_correcta: "conflicto", pista: "Problema o tensión." },
          { posicion: 3, respuesta_correcta: "tono", pista: "Humorístico, dramático, irónico." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Reescribir un texto", descripcion: "Valora tu uso de conectores, trama, tipos y tonos al reescribir.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Uso conectores textuales que marcan jerarquías entre ideas.", escala: escala4 },
        { descripcion: "Reconozco la trama y el conflicto de una narración.", escala: escala4 },
        { descripcion: "Identifico tipos de narración y tonos (humorístico, dramático, irónico).", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué tono te resulta más natural al escribir y cuál te gustaría practicar más?" } },
  ],

  // ════════ LC-II-P07 — Colabora en el análisis de textos ════════
  "LC-II-P07": [
    { titulo: "Análisis colaborativo — Verdadero o falso", descripcion: "Distingue afirmaciones sobre el trabajo colaborativo y el análisis de textos narrativos.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Intercambiar experiencias y dialogar entre pares enriquece el análisis de un texto.", respuesta: true, retroalimentacion: "Correcto: distintas miradas aportan más ideas." },
        { enunciado: "La retroalimentación entre compañeros sirve para corregir y mejorar lo escrito.", respuesta: true, retroalimentacion: "Correcto: ayuda a detectar aciertos y áreas de mejora." },
        { enunciado: "En un trabajo colaborativo solo importa la opinión de una persona.", respuesta: false, retroalimentacion: "Colaborar implica escuchar y valorar las aportaciones de todas las personas." },
        { enunciado: "Construir un texto narrativo en equipo requiere acordar ideas y respetar turnos.", respuesta: true, retroalimentacion: "Correcto: la colaboración necesita acuerdos y respeto." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: colaboración y análisis de textos", descripcion: "Aprende los términos clave del trabajo colaborativo con textos.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Diálogo entre pares", definicion: "Conversación entre compañeros para compartir ideas y puntos de vista.", ejemplo: "Comentar en equipo qué les pareció un cuento." },
        { termino: "Retroalimentación", definicion: "Comentarios que señalan aciertos y aspectos a mejorar de un trabajo.", ejemplo: "Decir a un compañero qué parte de su texto quedó clara y cuál no." },
        { termino: "Procedimiento narrativo", definicion: "Recurso o estrategia que se usa para construir una narración.", ejemplo: "El uso del suspenso, el narrador en primera persona, los saltos en el tiempo." },
        { termino: "Texto colaborativo", definicion: "Texto creado entre varias personas que aportan y acuerdan ideas.", ejemplo: "Un cuento escrito por todo el equipo." },
      ], actividad_final: "Con un compañero, intercambien sus textos y denle a cada uno una retroalimentación respetuosa." } },
    { titulo: "Completa: análisis colaborativo", descripcion: "Completa el texto sobre colaboración y análisis de textos narrativos.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "El ___ entre pares permite compartir distintos puntos de vista sobre un texto. Los comentarios que ayudan a corregir y mejorar se llaman ___. Las estrategias para construir un relato son los ___ narrativos, y un texto creado en equipo es un texto ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "diálogo", alternativas_aceptadas: ["dialogo"], pista: "Conversación entre compañeros." },
          { posicion: 1, respuesta_correcta: "retroalimentación", alternativas_aceptadas: ["retroalimentacion", "realimentación", "realimentacion"], pista: "Comentarios para mejorar." },
          { posicion: 2, respuesta_correcta: "procedimientos", pista: "Estrategias narrativas." },
          { posicion: 3, respuesta_correcta: "colaborativo", pista: "Hecho en equipo." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Análisis colaborativo", descripcion: "Valora tu participación en el análisis y construcción colaborativa de textos.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Intercambio experiencias y dialogo con mis compañeros sobre los textos.", escala: escala4 },
        { descripcion: "Doy y recibo retroalimentación de forma respetuosa para corregir y mejorar.", escala: escala4 },
        { descripcion: "Colaboro en la construcción de textos narrativos en equipo.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué aprendiste de tus compañeros al analizar o escribir un texto en equipo?" } },
  ],

  // ════════ LC-II-P08 — Integra lectura, escritura y oralidad en un proyecto creativo ════════
  "LC-II-P08": [
    { titulo: "Proyecto creativo y pódcast — Verdadero o falso", descripcion: "Distingue afirmaciones sobre el guion, la grabación y los elementos extralingüísticos.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Un guion es el texto que se crea para organizar lo que se dirá y hará en un pódcast o video.", respuesta: true, retroalimentacion: "Correcto: guía la producción del contenido." },
        { enunciado: "Un pódcast es un formato digital de audio que puede contar historias o tratar temas.", respuesta: true, retroalimentacion: "Correcto: combina lectura, escritura y oralidad." },
        { enunciado: "Los elementos extralingüísticos (tono de voz, pausas, ritmo) no influyen en cómo se recibe el mensaje.", respuesta: false, retroalimentacion: "Sí influyen mucho: dan emoción, énfasis y sentido al mensaje oral." },
        { enunciado: "Editar la grabación permite mejorar el resultado final del proyecto.", respuesta: true, retroalimentacion: "Correcto: la edición corrige errores y pule el producto." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: guion, pódcast y oralidad", descripcion: "Aprende los términos clave para tu proyecto creativo digital.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Guion", definicion: "Texto creado que organiza lo que se dirá y hará en una producción de audio o video.", ejemplo: "El guion de un episodio de pódcast." },
        { termino: "Pódcast", definicion: "Formato digital de audio, generalmente por episodios, para contar historias o tratar temas.", ejemplo: "Un pódcast donde narran leyendas mexicanas." },
        { termino: "Elementos extralingüísticos", definicion: "Recursos de la voz y el cuerpo que acompañan al mensaje: tono, ritmo, pausas, volumen.", ejemplo: "Bajar la voz para crear suspenso." },
        { termino: "Grabación", definicion: "Registro del audio o video del guion ejecutado.", ejemplo: "Grabar la narración con un teléfono." },
        { termino: "Edición", definicion: "Proceso de mejorar la grabación cortando, ajustando o añadiendo elementos.", ejemplo: "Quitar silencios o agregar música de fondo." },
      ], actividad_final: "Escribe un guion breve (una página) para un episodio de pódcast que narre una historia." } },
    { titulo: "Completa: proyecto creativo", descripcion: "Completa el texto sobre guion, pódcast y producción oral.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "El ___ es el texto que organiza lo que se dirá en un proyecto digital. Un formato de audio por episodios es el ___. Los recursos de la voz como el tono y las pausas son elementos ___. Después de grabar conviene ___ el material para mejorarlo.",
        huecos: [
          { posicion: 0, respuesta_correcta: "guion", alternativas_aceptadas: ["guión"], pista: "Texto que organiza la producción." },
          { posicion: 1, respuesta_correcta: "pódcast", alternativas_aceptadas: ["podcast"], pista: "Audio por episodios." },
          { posicion: 2, respuesta_correcta: "extralingüísticos", alternativas_aceptadas: ["extralinguisticos"], pista: "Tono, ritmo, pausas." },
          { posicion: 3, respuesta_correcta: "editar", pista: "Mejorar la grabación." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Proyecto creativo", descripcion: "Valora tu integración de lectura, escritura y oralidad en un proyecto.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Analizo formatos digitales como el pódcast y reconozco sus partes.", escala: escala4 },
        { descripcion: "Escribo un guion narrativo y lo grabo cuidando los elementos extralingüísticos.", escala: escala4 },
        { descripcion: "Edito y ejecuto mi proyecto integrando lectura, escritura y oralidad.", escala: escala4 },
      ], reflexion_final_prompt: "¿Sobre qué tema o historia te gustaría crear un pódcast y por qué?" } },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
