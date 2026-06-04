/**
 * Refuerzo de actividades para LC-III (Lengua y Comunicación III — "Describir culturas, apropiarse de las palabras") según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 7 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 7 progresiones × 4 = 28 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial de LC-III (MCCEMS 2025): análisis textual, movimientos literarios,
 * géneros y subgéneros, poesía, reseña crítica y exposición oral formal.
 * Uso: npx tsx scripts/seed-activities-lciii-refuerzo.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Refuerzo = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;

const letras = ["A4", "A5", "A6", "A7"];

// Escala estándar de autoevaluación (1-4) reutilizada en todas las progresiones.
const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo ayudar a otra persona." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 Refuerzo LC-III — Lengua y Comunicación III: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "LC-III");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const set = refuerzos[p.numero - 1];
    if (!set) { log(`⚠️  Sin refuerzos definidos para P${p.numero}`); continue; }
    for (let i = 0; i < set.length; i++) {
      const r = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`,
        titulo: r.titulo,
        descripcion: r.descripcion,
        tipo: r.tipo,
        progresion_id: p.id,
        xp: r.xp,
        contenido: r.contenido,
      });
      res ? ok++ : fail++;
    }
  }

  log(`\n✅ LC-III refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Sentido global, intención del autor, pensamiento crítico, paráfrasis ════════════
  [
    {
      titulo: "Verdadero o falso — Análisis e intención del texto",
      descripcion: "Decide si cada afirmación sobre el sentido global de un texto, la intención del autor y la paráfrasis es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "El sentido global de un texto se construye considerando el tema, la estructura y la intención del autor en conjunto.", respuesta: true, retroalimentacion: "Correcto: el sentido global integra todos esos elementos para dar una interpretación completa." },
          { enunciado: "La paráfrasis consiste en copiar literalmente las ideas del autor sin modificarlas.", respuesta: false, retroalimentacion: "No: la paráfrasis es reformular las ideas con las propias palabras respetando el significado original." },
          { enunciado: "Tomar postura frente a un autor significa aceptar todo lo que dice sin cuestionarlo.", respuesta: false, retroalimentacion: "No: tomar postura implica evaluar críticamente los argumentos y emitir un juicio propio, ya sea de acuerdo o en desacuerdo." },
          { enunciado: "Los conocimientos previos del lector influyen en la construcción del significado de un texto.", respuesta: true, retroalimentacion: "Correcto: el lector activa sus saberes previos para conectarlos con la nueva información y construir sentido." },
          { enunciado: "La intención del autor puede ser informar, persuadir, entretener o reflexionar, entre otras.", respuesta: true, retroalimentacion: "Sí: identificar la intención ayuda a leer de forma más crítica y consciente." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Lectura crítica y paráfrasis",
      descripcion: "Glosario interactivo de los conceptos clave para analizar un texto, identificar la intención del autor y construir una postura crítica.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "sentido global", definicion: "Significado general que se construye al interpretar tema, estructura e intención del texto en conjunto.", ejemplo: "El sentido global de la crónica es denunciar la desigualdad social.", etiquetas: ["análisis", "lectura"] },
          { termino: "intención del autor", definicion: "Propósito que guía la escritura: informar, persuadir, entretener, reflexionar o criticar.", ejemplo: "La intención del autor en este ensayo es persuadir al lector sobre el cambio climático.", etiquetas: ["análisis"] },
          { termino: "paráfrasis", definicion: "Reformulación de las ideas de un texto con las propias palabras, manteniendo el sentido original.", ejemplo: "Parafraseando al autor: la violencia genera más violencia y perpetúa el ciclo de dolor.", etiquetas: ["escritura", "lectura"] },
          { termino: "postura crítica", definicion: "Juicio argumentado que el lector emite ante las ideas del autor, a favor o en contra, con razones.", ejemplo: "Mi postura es que el autor simplifica el problema al ignorar factores económicos.", etiquetas: ["pensamiento crítico"] },
          { termino: "conocimientos previos", definicion: "Saberes que el lector ya posee y que activa para interpretar un texto nuevo.", ejemplo: "Mis conocimientos previos sobre la Revolución Mexicana me ayudaron a entender la novela.", etiquetas: ["lectura"] },
          { termino: "inferencia", definicion: "Conclusión que el lector deduce a partir de pistas en el texto, sin que se diga explícitamente.", ejemplo: "Inferimos que el personaje está asustado porque tiembla y evita hablar.", etiquetas: ["análisis", "lectura"] },
        ],
        actividad_final: "Elige un párrafo de cualquier texto que estés leyendo, parafraséalo con tus propias palabras y escribe una oración expresando tu postura ante la idea del autor.",
      },
    },
    {
      titulo: "Completa el texto — Análisis textual",
      descripcion: "Completa los huecos con los conceptos correctos sobre análisis de textos, intención del autor y pensamiento crítico.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término más adecuado según el contexto. Las respuestas son: sentido global, paráfrasis, postura, intención, inferencia.",
        texto_con_huecos: "Para analizar un texto es fundamental identificar la ___ del autor, es decir, qué quiso lograr con su escritura. Luego construimos el ___ integrando tema y estructura. Reformular las ideas con nuestras palabras se llama ___. Cuando deducimos algo que no está escrito directamente hacemos una ___. Finalmente, expresar nuestra ___ implica argumentar si estamos de acuerdo o no con el autor.",
        huecos: [
          { posicion: 0, respuesta_correcta: "intención", alternativas_aceptadas: ["intención del autor"], pista: "¿Qué quiso lograr el autor al escribir? Eso se llama ___." },
          { posicion: 1, respuesta_correcta: "sentido global", alternativas_aceptadas: ["sentido"], pista: "La interpretación completa que integra tema, estructura e intención es el ___." },
          { posicion: 2, respuesta_correcta: "paráfrasis", alternativas_aceptadas: [], pista: "Decir con tus propias palabras lo que dice el autor es hacer una ___." },
          { posicion: 3, respuesta_correcta: "inferencia", alternativas_aceptadas: [], pista: "Deducir lo que no está escrito explícitamente es hacer una ___." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Leer con sentido crítico",
      descripcion: "Evalúa tu nivel de dominio para analizar textos, identificar la intención del autor y construir una postura crítica argumentada.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. No es una calificación: es para saber qué reforzar.",
        criterios: [
          { descripcion: "Identifico la intención del autor (informar, persuadir, reflexionar, criticar) en un texto.", escala: escala4 },
          { descripcion: "Construyo el sentido global integrando tema, estructura e intención.", escala: escala4 },
          { descripcion: "Reformulo ideas con mis propias palabras (paráfrasis) sin distorsionar el significado.", escala: escala4 },
          { descripcion: "Expreso una postura crítica argumentada ante las ideas del autor.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Con qué tipo de texto te resulta más difícil construir una postura crítica y por qué?",
      },
    },
  ],

  // ════════════ P02 — Movimientos literarios: Barroco, Neoclasicismo, Romanticismo, Realismo, Modernismo, Vanguardias, Realismo mágico, literaturas disidentes y digitales ════════════
  [
    {
      titulo: "Verdadero o falso — Movimientos literarios",
      descripcion: "Decide si cada afirmación sobre los principales movimientos literarios es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "El Barroco literario se caracteriza por la complejidad del lenguaje, el uso de metáforas elaboradas y el contraste entre opuestos.", respuesta: true, retroalimentacion: "Correcto: autores como Sor Juana Inés de la Cruz y Francisco de Quevedo son ejemplos del Barroco hispano." },
          { enunciado: "El Romanticismo exalta la razón y el orden por encima de las emociones y la naturaleza.", respuesta: false, retroalimentacion: "No: es el Neoclasicismo el que privilegia la razón y el orden; el Romanticismo exalta la emoción, la naturaleza y la libertad individual." },
          { enunciado: "El Realismo mágico integra elementos fantásticos en un contexto cotidiano presentado como normal.", respuesta: true, retroalimentacion: "Correcto: obras como 'Cien años de soledad' de García Márquez son el ejemplo más reconocido." },
          { enunciado: "Las vanguardias literarias del siglo XX buscaban romper con las formas y temas tradicionales.", respuesta: true, retroalimentacion: "Sí: el Surrealismo, el Dadaísmo y el Ultraísmo son movimientos de vanguardia que experimentaron con el lenguaje y la estructura." },
          { enunciado: "La literatura digital se produce y consume exclusivamente en soporte impreso.", respuesta: false, retroalimentacion: "No: la literatura digital nace y se difunde en entornos digitales, aprovechando hipervínculos, multimedia e interactividad." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Movimientos literarios",
      descripcion: "Glosario interactivo de los movimientos literarios principales: características, época y autores representativos.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Barroco", definicion: "Movimiento (s. XVII) caracterizado por el lenguaje complejo, metáforas elaboradas y tensión entre lo divino y lo humano.", ejemplo: "Sor Juana Inés de la Cruz, 'Hombres necios que acusáis'.", etiquetas: ["movimiento", "siglo XVII"] },
          { termino: "Romanticismo", definicion: "Movimiento (s. XIX) que exalta la emoción, la libertad, la naturaleza y el héroe trágico.", ejemplo: "Gustavo Adolfo Bécquer, 'Rimas y leyendas'.", etiquetas: ["movimiento", "siglo XIX"] },
          { termino: "Realismo", definicion: "Corriente (s. XIX) que busca retratar la realidad social con objetividad y detalle.", ejemplo: "Benito Pérez Galdós, 'Fortunata y Jacinta'.", etiquetas: ["movimiento", "siglo XIX"] },
          { termino: "Modernismo", definicion: "Movimiento hispanoamericano (fines s. XIX – inicio s. XX) de refinamiento estético, musicalidad y simbolismo.", ejemplo: "Rubén Darío, 'Azul...'.", etiquetas: ["movimiento", "siglo XX"] },
          { termino: "Vanguardias", definicion: "Conjunto de movimientos experimentales del s. XX (Surrealismo, Dadaísmo, Ultraísmo) que rompen con la tradición.", ejemplo: "Vicente Huidobro y el Creacionismo.", etiquetas: ["movimiento", "siglo XX"] },
          { termino: "Realismo mágico", definicion: "Corriente latinoamericana que integra lo fantástico en un contexto cotidiano como algo natural.", ejemplo: "Gabriel García Márquez, 'Cien años de soledad'.", etiquetas: ["movimiento", "siglo XX"] },
        ],
        actividad_final: "Elige dos movimientos literarios y elabora una tabla comparativa con: época, características principales y un autor representativo de cada uno.",
      },
    },
    {
      titulo: "Completa el texto — Movimientos literarios",
      descripcion: "Completa los huecos con el movimiento literario o el concepto correcto.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término más adecuado: Barroco, Romanticismo, Realismo mágico, Vanguardias, Modernismo.",
        texto_con_huecos: "El ___ del siglo XVII se distingue por el uso ornamentado del lenguaje y el juego con los contrastes. A diferencia de este, el ___ del siglo XIX pone en el centro la emoción y la naturaleza. En el siglo XX, el ___ de García Márquez convierte lo sobrenatural en algo cotidiano. Los movimientos de ___ rompieron con todas las convenciones literarias previas. El ___ hispanoamericano cultivó la musicalidad y el refinamiento estético.",
        huecos: [
          { posicion: 0, respuesta_correcta: "Barroco", alternativas_aceptadas: ["barroco"], pista: "Siglo XVII, lenguaje ornamentado y juego de contrastes." },
          { posicion: 1, respuesta_correcta: "Romanticismo", alternativas_aceptadas: ["romanticismo"], pista: "Siglo XIX, exalta la emoción y la naturaleza." },
          { posicion: 2, respuesta_correcta: "Realismo mágico", alternativas_aceptadas: ["realismo mágico"], pista: "Lo sobrenatural conviviendo con lo cotidiano, García Márquez." },
          { posicion: 3, respuesta_correcta: "Vanguardias", alternativas_aceptadas: ["vanguardias"], pista: "Movimientos del siglo XX que rompieron con todas las convenciones previas." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Movimientos literarios",
      descripcion: "Evalúa tu nivel de dominio para identificar y caracterizar los principales movimientos literarios.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico las características principales del Barroco, el Romanticismo y el Realismo.", escala: escala4 },
          { descripcion: "Reconozco el Modernismo y las Vanguardias y los sitúo en su época.", escala: escala4 },
          { descripcion: "Explico qué es el Realismo mágico y menciono un autor representativo.", escala: escala4 },
          { descripcion: "Distingo las literaturas disidentes y digitales como expresiones contemporáneas.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cuál movimiento literario te parece más vigente en la actualidad y por qué?",
      },
    },
  ],

  // ════════════ P03 — Géneros literarios: novela, cuento, poesía, drama, ensayo ════════════
  [
    {
      titulo: "Verdadero o falso — Géneros literarios",
      descripcion: "Decide si cada afirmación sobre los géneros literarios y sus características es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "La novela es un género narrativo extenso que desarrolla personajes y tramas complejas.", respuesta: true, retroalimentacion: "Correcto: la extensión y la complejidad narrativa son rasgos definitorios de la novela." },
          { enunciado: "El ensayo literario es un texto de ficción que narra hechos imaginarios.", respuesta: false, retroalimentacion: "No: el ensayo es un texto no ficcional que expone reflexiones, argumentos e interpretaciones de un autor sobre un tema." },
          { enunciado: "El cuento se distingue de la novela principalmente por su brevedad y por tener un único conflicto central.", respuesta: true, retroalimentacion: "Correcto: el cuento es conciso y concentra la acción en un solo núcleo narrativo." },
          { enunciado: "El drama está escrito principalmente para ser leído en voz alta de forma individual, sin representación escénica.", respuesta: false, retroalimentacion: "No: el drama (género teatral) está concebido para su representación escénica ante un público." },
          { enunciado: "La poesía se caracteriza por el uso del verso, el ritmo y recursos como la metáfora y la imagen.", respuesta: true, retroalimentacion: "Sí: aunque también existe la prosa poética, el verso, el ritmo y las figuras retóricas son elementos centrales de la poesía." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Géneros literarios",
      descripcion: "Glosario interactivo de los cinco géneros literarios fundamentales: novela, cuento, poesía, drama y ensayo.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "novela", definicion: "Género narrativo extenso con personajes complejos, trama desarrollada en múltiples capítulos y universo ficcional detallado.", ejemplo: "Pedro Páramo de Juan Rulfo.", etiquetas: ["género", "narrativa"] },
          { termino: "cuento", definicion: "Género narrativo breve, con un único conflicto central, pocos personajes y final generalmente sorpresivo o revelador.", ejemplo: "El aleph de Jorge Luis Borges.", etiquetas: ["género", "narrativa"] },
          { termino: "poesía", definicion: "Género lírico que expresa emociones, experiencias o ideas a través del verso, el ritmo y figuras retóricas.", ejemplo: "Veinte poemas de amor y una canción desesperada de Neruda.", etiquetas: ["género", "lírica"] },
          { termino: "drama", definicion: "Género teatral escrito para ser representado en escena; incluye diálogo, acotaciones y conflicto dramático.", ejemplo: "La casa de Bernarda Alba de Federico García Lorca.", etiquetas: ["género", "teatro"] },
          { termino: "ensayo", definicion: "Texto no ficcional en prosa donde el autor reflexiona, argumenta e interpreta un tema desde su perspectiva.", ejemplo: "El laberinto de la soledad de Octavio Paz.", etiquetas: ["género", "no ficción"] },
          { termino: "narrador", definicion: "Voz que cuenta la historia en los textos narrativos; puede ser omnisciente, en primera persona o testigo.", ejemplo: "El narrador omnisciente sabe todo lo que piensan los personajes.", etiquetas: ["narrativa", "concepto"] },
        ],
        actividad_final: "Elabora una tabla con los cinco géneros literarios, sus características principales y un ejemplo de obra para cada uno.",
      },
    },
    {
      titulo: "Completa el texto — Géneros literarios",
      descripcion: "Completa los huecos con el género literario correcto: novela, cuento, poesía, drama o ensayo.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el género literario que corresponde a cada descripción.",
        texto_con_huecos: "Pedro Páramo es una ___ del siglo XX que explora el mundo de los muertos. 'El aleph' de Borges es un ___ breve con un final sorprendente. Un texto no ficcional donde el autor argumenta su perspectiva se llama ___. La obra de García Lorca escrita para ser representada en escena pertenece al ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "novela", alternativas_aceptadas: [], pista: "Género narrativo extenso con múltiples capítulos." },
          { posicion: 1, respuesta_correcta: "cuento", alternativas_aceptadas: [], pista: "Género narrativo breve con un único conflicto central." },
          { posicion: 2, respuesta_correcta: "ensayo", alternativas_aceptadas: [], pista: "Texto no ficcional donde el autor argumenta sobre un tema." },
          { posicion: 3, respuesta_correcta: "drama", alternativas_aceptadas: ["teatro"], pista: "Género concebido para la representación escénica." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Géneros literarios",
      descripcion: "Evalúa tu nivel de dominio para identificar y caracterizar los cinco géneros literarios.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo la novela del cuento por sus características formales (extensión, complejidad, conflicto).", escala: escala4 },
          { descripcion: "Reconozco la poesía por el uso del verso, el ritmo y las figuras retóricas.", escala: escala4 },
          { descripcion: "Identifico el drama como género teatral escrito para la representación escénica.", escala: escala4 },
          { descripcion: "Diferencio el ensayo de los géneros de ficción por su carácter argumentativo y no ficcional.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué género literario disfrutas más leer y qué características te gustan de él?",
      },
    },
  ],

  // ════════════ P04 — Subgéneros narrativos: suspenso, terror, ciencia ficción, autoficción, neorrealismo urbano, literaturas del Antropoceno ════════════
  [
    {
      titulo: "Verdadero o falso — Subgéneros narrativos",
      descripcion: "Decide si cada afirmación sobre los subgéneros narrativos y sus elementos discursivos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "El suspenso como subgénero narrativo se construye mediante la tensión, la incertidumbre y la dilación de la resolución.", respuesta: true, retroalimentacion: "Correcto: el suspenso mantiene al lector en un estado de expectativa constante gracias a estas estrategias." },
          { enunciado: "La autoficción es un subgénero en el que el autor presenta eventos completamente imaginarios sin ninguna relación con su vida real.", respuesta: false, retroalimentacion: "No: la autoficción combina elementos autobiográficos reales con ficcionales, creando una zona ambigua entre verdad y ficción." },
          { enunciado: "La ciencia ficción explora mundos futuros, tecnologías avanzadas y sus implicaciones sociales o éticas.", respuesta: true, retroalimentacion: "Correcto: la ciencia ficción especula sobre el futuro de la humanidad a partir de avances científicos o tecnológicos." },
          { enunciado: "Las literaturas del Antropoceno abordan temas relacionados con el impacto humano en el medio ambiente y la crisis ecológica.", respuesta: true, retroalimentacion: "Sí: el Antropoceno designa la era geológica marcada por la influencia humana en la Tierra, y esta literatura reflexiona sobre ello." },
          { enunciado: "El neorrealismo urbano retrata la vida rural y campesina alejada de las grandes ciudades.", respuesta: false, retroalimentacion: "No: el neorrealismo urbano se enfoca precisamente en la vida en las ciudades contemporáneas, sus conflictos y sus personajes marginales." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Subgéneros narrativos",
      descripcion: "Glosario interactivo de los subgéneros narrativos contemporáneos y sus elementos discursivos.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "suspenso", definicion: "Subgénero que genera tensión e incertidumbre mediante la dilación de la resolución y la amenaza constante.", ejemplo: "Relatos de Patricia Highsmith.", etiquetas: ["subgénero", "narrativa"] },
          { termino: "terror", definicion: "Subgénero que busca provocar miedo mediante lo sobrenatural, lo abyecto o lo psicológico.", ejemplo: "Cuentos de Edgar Allan Poe.", etiquetas: ["subgénero", "narrativa"] },
          { termino: "ciencia ficción", definicion: "Subgénero que especula sobre futuros posibles a partir de avances científicos o tecnológicos y sus consecuencias sociales.", ejemplo: "Fahrenheit 451 de Ray Bradbury.", etiquetas: ["subgénero", "narrativa"] },
          { termino: "autoficción", definicion: "Subgénero que combina elementos autobiográficos reales con recursos ficcionales, borrando los límites entre verdad y ficción.", ejemplo: "Escenas de la vida rural de Emmanuel Carrère.", etiquetas: ["subgénero", "contemporáneo"] },
          { termino: "neorrealismo urbano", definicion: "Subgénero contemporáneo que retrata la vida cotidiana en las ciudades, sus conflictos sociales y personajes marginales.", ejemplo: "Narrativa de Roberto Arlt o Juan Villoro.", etiquetas: ["subgénero", "contemporáneo"] },
          { termino: "literaturas del Antropoceno", definicion: "Narrativas que reflexionan sobre el impacto humano en el planeta, la crisis ecológica y las relaciones entre naturaleza y cultura.", ejemplo: "Textos de Richard Powers o autores latinoamericanos de ecoficción.", etiquetas: ["subgénero", "contemporáneo"] },
        ],
        actividad_final: "Elige un subgénero narrativo, identifica sus elementos discursivos principales y escribe el primer párrafo de un texto breve en ese subgénero.",
      },
    },
    {
      titulo: "Completa el texto — Subgéneros narrativos",
      descripcion: "Completa los huecos con el subgénero narrativo correcto.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el subgénero narrativo que corresponde a cada descripción: suspenso, terror, ciencia ficción, autoficción.",
        texto_con_huecos: "Una historia donde los personajes no saben si serán atacados o no, y el lector tampoco, pertenece al ___. Cuando el narrador mezcla su propia vida con eventos inventados, estamos ante la ___. Una novela que imagina cómo será la humanidad en el año 2150 gracias a la inteligencia artificial es ___. Los cuentos que generan miedo mediante lo sobrenatural o lo psicológico son de ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "suspenso", alternativas_aceptadas: [], pista: "Incertidumbre y tensión constante que dilata la resolución." },
          { posicion: 1, respuesta_correcta: "autoficción", alternativas_aceptadas: [], pista: "El narrador mezcla su vida real con elementos inventados." },
          { posicion: 2, respuesta_correcta: "ciencia ficción", alternativas_aceptadas: [], pista: "Especulación sobre el futuro de la humanidad y la tecnología." },
          { posicion: 3, respuesta_correcta: "terror", alternativas_aceptadas: [], pista: "El objetivo principal es provocar miedo en el lector." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Subgéneros narrativos",
      descripcion: "Evalúa tu nivel de dominio para identificar y analizar los subgéneros narrativos y sus elementos discursivos.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico los elementos discursivos del suspenso y el terror en un texto narrativo.", escala: escala4 },
          { descripcion: "Reconozco la ciencia ficción y explico sus características especulativas y sociales.", escala: escala4 },
          { descripcion: "Distingo la autoficción y comprendo la zona ambigua entre autobiografía y ficción.", escala: escala4 },
          { descripcion: "Comprendo el neorrealismo urbano y las literaturas del Antropoceno como expresiones contemporáneas.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué subgénero narrativo has leído o visto en una serie o película? ¿Qué elementos discursivos identificas en él?",
      },
    },
  ],

  // ════════════ P05 — Poesía: género lírico, figuras retóricas, rima y métrica ════════════
  [
    {
      titulo: "Verdadero o falso — Género lírico y figuras retóricas",
      descripcion: "Decide si cada afirmación sobre la poesía, las figuras retóricas, la rima y la métrica es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "La metáfora es una figura retórica que identifica un elemento con otro basándose en una semejanza implícita.", respuesta: true, retroalimentacion: "Correcto: por ejemplo, 'tus ojos son estrellas' identifica los ojos con estrellas por su brillo, sin usar 'como'." },
          { enunciado: "El hipérbaton consiste en exagerar una cualidad o situación de forma extrema para crear efecto expresivo.", respuesta: false, retroalimentacion: "No: el hipérbaton es la alteración del orden sintáctico habitual. La exageración extrema es la hipérbole." },
          { enunciado: "La prosopopeya (personificación) atribuye cualidades humanas a seres inanimados o abstractos.", respuesta: true, retroalimentacion: "Correcto: 'el viento susurra secretos' es un ejemplo de prosopopeya." },
          { enunciado: "La rima consonante coincide tanto en vocales como en consonantes desde la última vocal acentuada.", respuesta: true, retroalimentacion: "Sí: por ejemplo, 'amor' y 'calor' riman en consonante porque comparten '-or'." },
          { enunciado: "La métrica se refiere únicamente al tipo de rima que tiene un poema, no a la medida de sus versos.", respuesta: false, retroalimentacion: "No: la métrica estudia la medida (número de sílabas) de los versos; la rima es un concepto relacionado pero distinto." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Figuras retóricas y elementos de la poesía",
      descripcion: "Glosario interactivo de las figuras retóricas principales y los elementos formales de la poesía lírica.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "metáfora", definicion: "Identificación implícita de dos elementos por su semejanza, sin usar 'como'.", ejemplo: "'Tus ojos son dos luceros' (los ojos = luceros por su brillo).", etiquetas: ["figura retórica"] },
          { termino: "hipérbaton", definicion: "Alteración del orden sintáctico habitual para lograr énfasis o musicalidad.", ejemplo: "'Del salón en el ángulo oscuro' (orden normal: en el ángulo oscuro del salón).", etiquetas: ["figura retórica"] },
          { termino: "hipérbole", definicion: "Exageración extrema de una cualidad o situación para crear un efecto expresivo intenso.", ejemplo: "'Te lo he dicho mil veces' (exageración del número de veces).", etiquetas: ["figura retórica"] },
          { termino: "ironía", definicion: "Expresión que dice lo contrario de lo que se piensa, con intención crítica o humorística.", ejemplo: "'¡Qué puntual eres!' (dicho a alguien que llega tarde).", etiquetas: ["figura retórica"] },
          { termino: "prosopopeya", definicion: "Atribución de cualidades o acciones humanas a seres inanimados, animales o abstracciones.", ejemplo: "'El mar te reclama' (el mar, ser inanimado, realiza una acción humana).", etiquetas: ["figura retórica"] },
          { termino: "rima y métrica", definicion: "La rima es la repetición de sonidos al final del verso; la métrica es la medida silábica de cada verso.", ejemplo: "Un soneto tiene 14 versos endecasílabos (11 sílabas cada uno).", etiquetas: ["forma poética"] },
        ],
        actividad_final: "Lee un poema breve en voz alta. Identifica al menos dos figuras retóricas y señala si tiene rima consonante o asonante.",
      },
    },
    {
      titulo: "Completa el texto — Figuras retóricas",
      descripcion: "Completa los huecos con el nombre de la figura retórica que corresponde a cada ejemplo.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con la figura retórica correcta: metáfora, hipérbole, prosopopeya, ironía.",
        texto_con_huecos: "Decir 'te lo repetí un millón de veces' es una ___ porque exagera el número de repeticiones. Atribuirle sentimientos al océano ('el mar llora') es una ___. Cuando alguien dice '¡qué inteligente!' refiriéndose a alguien que cometió un error grave, usa la ___. Llamar 'perla' a una persona por su valor y brillo es una ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "hipérbole", alternativas_aceptadas: [], pista: "Exageración extrema de una cualidad o cantidad." },
          { posicion: 1, respuesta_correcta: "prosopopeya", alternativas_aceptadas: ["personificación"], pista: "Atribuir acciones o sentimientos humanos a algo que no es humano." },
          { posicion: 2, respuesta_correcta: "ironía", alternativas_aceptadas: [], pista: "Decir lo contrario de lo que se piensa con intención crítica." },
          { posicion: 3, respuesta_correcta: "metáfora", alternativas_aceptadas: [], pista: "Identificar implícitamente a una persona con otra cosa por semejanza, sin usar 'como'." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Poesía y figuras retóricas",
      descripcion: "Evalúa tu nivel de dominio para analizar textos poéticos, identificar figuras retóricas y reconocer elementos formales.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico metáforas, hipérboles, prosopopeyas, hipérbatos e ironías en un poema.", escala: escala4 },
          { descripcion: "Distingo la rima consonante de la asonante y la identifico en un texto poético.", escala: escala4 },
          { descripcion: "Mido la métrica de un verso (cuento sílabas y aplico sinalefa si es necesario).", escala: escala4 },
          { descripcion: "Leo un fragmento poético en voz alta con entonación y ritmo adecuados.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué figura retórica te resulta más difícil de identificar en la lectura y qué estrategia usarás para reconocerla?",
      },
    },
  ],

  // ════════════ P06 — Reseña crítica: idea principal, interpretación, composición sobre un movimiento literario ════════════
  [
    {
      titulo: "Verdadero o falso — La reseña crítica",
      descripcion: "Decide si cada afirmación sobre las características y la estructura de la reseña crítica es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "La reseña crítica combina la presentación descriptiva de una obra con una valoración argumentada por parte del autor de la reseña.", respuesta: true, retroalimentacion: "Correcto: la reseña no solo describe, también evalúa y argumenta el juicio del reseñista." },
          { enunciado: "En una reseña crítica, la idea principal es la que el reseñista quiere transmitir sobre la obra, apoyada por ideas secundarias.", respuesta: true, retroalimentacion: "Sí: la idea principal expresa la tesis o valoración central y las ideas secundarias la argumentan." },
          { enunciado: "La reseña crítica de una obra literaria puede prescindir completamente del análisis del movimiento literario al que pertenece.", respuesta: false, retroalimentacion: "No: contextualizar la obra en su movimiento literario enriquece la interpretación y da profundidad a la reseña." },
          { enunciado: "La interpretación en una reseña es la lectura subjetiva y argumentada que el reseñista hace de los temas y recursos de la obra.", respuesta: true, retroalimentacion: "Correcto: la interpretación va más allá del resumen e implica una lectura crítica y personal." },
          { enunciado: "Una reseña crítica es equivalente a un resumen argumental porque ambos solo describen lo que ocurre en la obra.", respuesta: false, retroalimentacion: "No: el resumen solo describe; la reseña crítica añade valoración, interpretación y argumentación." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Reseña crítica",
      descripcion: "Glosario interactivo de los conceptos clave para redactar y analizar una reseña crítica literaria.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "reseña crítica", definicion: "Texto que presenta una obra, la describe brevemente, la interpreta y emite una valoración argumentada.", ejemplo: "Una reseña de 'Pedro Páramo' que analiza su estructura fragmentaria y su relación con el Realismo mágico.", etiquetas: ["género discursivo", "escritura"] },
          { termino: "idea principal", definicion: "Tesis o valoración central que el reseñista defiende sobre la obra.", ejemplo: "Idea principal: la novela subvierte la narrativa lineal para reflejar el tiempo circular de los muertos.", etiquetas: ["reseña", "texto"] },
          { termino: "idea secundaria", definicion: "Argumento o ejemplo que apoya y desarrolla la idea principal de la reseña.", ejemplo: "Idea secundaria: el uso de voces fragmentadas refuerza la sensación de desorientación y pérdida.", etiquetas: ["reseña", "texto"] },
          { termino: "interpretación", definicion: "Lectura argumentada y personal de los temas, recursos y sentidos de la obra.", ejemplo: "Interpreto que el silencio de los personajes es una crítica a la represión social.", etiquetas: ["análisis", "reseña"] },
          { termino: "valoración", definicion: "Juicio global sobre la calidad, relevancia o impacto de la obra, justificado con argumentos.", ejemplo: "Valoro la obra como un hito del Realismo mágico por su innovación narrativa.", etiquetas: ["reseña", "crítica"] },
          { termino: "contextualización", definicion: "Situar la obra en su contexto histórico, cultural y literario (movimiento, época, autor).", ejemplo: "La novela se inscribe en el Realismo mágico latinoamericano de mediados del siglo XX.", etiquetas: ["reseña", "contexto"] },
        ],
        actividad_final: "Escribe el párrafo de introducción de una reseña crítica de cualquier obra literaria que hayas leído, incluyendo su contextualización y tu idea principal.",
      },
    },
    {
      titulo: "Completa el texto — Estructura de la reseña crítica",
      descripcion: "Completa los huecos con los conceptos correctos relacionados con la reseña crítica.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con: idea principal, interpretación, valoración, contextualización, ideas secundarias.",
        texto_con_huecos: "La ___ ubica la obra en su movimiento literario y su época. La ___ es la tesis central que el reseñista defiende sobre la obra. Las ___ son los argumentos que apoyan y desarrollan esa tesis. La ___ es la lectura personal y argumentada de los temas y recursos de la obra. La ___ final emite un juicio sobre la calidad o relevancia de la obra.",
        huecos: [
          { posicion: 0, respuesta_correcta: "contextualización", alternativas_aceptadas: [], pista: "Situar la obra en su movimiento literario, época y autor." },
          { posicion: 1, respuesta_correcta: "idea principal", alternativas_aceptadas: ["tesis"], pista: "La tesis o valoración central que defiende el reseñista." },
          { posicion: 2, respuesta_correcta: "ideas secundarias", alternativas_aceptadas: ["argumentos"], pista: "Los argumentos o ejemplos que apoyan la idea principal." },
          { posicion: 3, respuesta_correcta: "interpretación", alternativas_aceptadas: [], pista: "La lectura personal y argumentada de temas y recursos." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Reseña crítica",
      descripcion: "Evalúa tu nivel de dominio para escribir y analizar una reseña crítica literaria.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico la idea principal y las ideas secundarias de una reseña crítica.", escala: escala4 },
          { descripcion: "Contextualizo una obra en su movimiento literario y época al escribir una reseña.", escala: escala4 },
          { descripcion: "Redacto una interpretación argumentada de los temas y recursos de una obra.", escala: escala4 },
          { descripcion: "Emito una valoración global justificada sobre la calidad o relevancia de la obra.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué parte de la reseña crítica te resulta más difícil de escribir: la contextualización, la interpretación o la valoración? ¿Por qué?",
      },
    },
  ],

  // ════════════ P07 — Exposición oral formal: coloquio, simposio, foro; planeación, ejecución y seguimiento ════════════
  [
    {
      titulo: "Verdadero o falso — Exposición oral formal",
      descripcion: "Decide si cada afirmación sobre la exposición oral formal (coloquio, simposio, foro) es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Un coloquio es una conversación académica entre participantes que debaten un tema de forma estructurada.", respuesta: true, retroalimentacion: "Correcto: el coloquio implica diálogo entre participantes con posiciones argumentadas sobre un tema específico." },
          { enunciado: "En un simposio, un único orador presenta durante todo el evento sin intervención de otros participantes.", respuesta: false, retroalimentacion: "No: en un simposio participan varios especialistas que presentan perspectivas distintas sobre un mismo tema." },
          { enunciado: "La planeación logística de una exposición oral incluye definir el tema, el tiempo, los materiales y la distribución del espacio.", respuesta: true, retroalimentacion: "Correcto: la planeación contempla todos esos elementos para garantizar una exposición organizada y efectiva." },
          { enunciado: "El seguimiento de una exposición oral solo se realiza durante la presentación, no antes ni después.", respuesta: false, retroalimentacion: "No: el seguimiento implica evaluar y retroalimentar el proceso antes (preparación), durante (ejecución) y después (reflexión y mejora)." },
          { enunciado: "Un foro presencial o virtual permite la participación del público mediante preguntas y comentarios.", respuesta: true, retroalimentacion: "Sí: el foro es un espacio de debate abierto donde el público interviene activamente." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Exposición oral formal",
      descripcion: "Glosario interactivo de los conceptos clave para planear, ejecutar y evaluar una exposición oral formal.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "coloquio", definicion: "Conversación académica estructurada entre participantes que debaten un tema con posiciones argumentadas.", ejemplo: "Coloquio sobre literatura mexicana contemporánea con tres estudiantes que defienden distintos autores.", etiquetas: ["formato oral", "académico"] },
          { termino: "simposio", definicion: "Evento académico donde varios especialistas o ponentes presentan perspectivas distintas sobre un mismo tema.", ejemplo: "Simposio sobre los movimientos literarios del siglo XX: cada ponente expone uno diferente.", etiquetas: ["formato oral", "académico"] },
          { termino: "foro", definicion: "Espacio de debate abierto, presencial o virtual, donde el público puede intervenir con preguntas y comentarios.", ejemplo: "Foro de discusión virtual sobre la reseña crítica: el moderador cede la palabra al público.", etiquetas: ["formato oral", "participación"] },
          { termino: "planeación logística", definicion: "Organización previa que define tema, tiempo, materiales, roles y distribución del espacio para la exposición.", ejemplo: "Distribuir el tiempo: 5 min de introducción, 15 min de desarrollo, 5 min de cierre y 5 de preguntas.", etiquetas: ["planeación", "oral"] },
          { termino: "ejecución", definicion: "Desarrollo real de la exposición oral siguiendo el plan establecido, con claridad, cohesión y adecuación al público.", ejemplo: "Presentar el tema con voz clara, apoyarse en diapositivas y mantener contacto visual con el público.", etiquetas: ["ejecución", "oral"] },
          { termino: "seguimiento y retroalimentación", definicion: "Evaluación del proceso antes, durante y después de la exposición para identificar fortalezas y áreas de mejora.", ejemplo: "Después del coloquio, el grupo reflexiona: ¿qué salió bien? ¿qué mejoraremos la próxima vez?", etiquetas: ["evaluación", "oral"] },
        ],
        actividad_final: "Planea una exposición oral de 10 minutos sobre un movimiento literario: define el formato (coloquio, simposio o foro), el tema, la distribución del tiempo y los materiales de apoyo.",
      },
    },
    {
      titulo: "Completa el texto — Exposición oral formal",
      descripcion: "Completa los huecos con el concepto correcto relacionado con la exposición oral formal.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con: coloquio, simposio, foro, planeación, seguimiento.",
        texto_con_huecos: "Cuando varios especialistas presentan perspectivas distintas sobre un mismo tema en un evento académico, el formato es el ___. Si el público puede intervenir con preguntas al final de la presentación, el formato es el ___. El debate estructurado entre participantes con posiciones argumentadas se llama ___. La etapa previa que organiza tema, tiempo y materiales es la ___ logística. La evaluación que ocurre antes, durante y después de la exposición se llama ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "simposio", alternativas_aceptadas: [], pista: "Varios ponentes, perspectivas distintas, un mismo tema." },
          { posicion: 1, respuesta_correcta: "foro", alternativas_aceptadas: [], pista: "El público interviene con preguntas; puede ser presencial o virtual." },
          { posicion: 2, respuesta_correcta: "coloquio", alternativas_aceptadas: [], pista: "Conversación académica estructurada con posiciones argumentadas." },
          { posicion: 3, respuesta_correcta: "planeación", alternativas_aceptadas: ["planeación logística"], pista: "Etapa previa de organización del tema, tiempo y materiales." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Exposición oral formal",
      descripcion: "Evalúa tu nivel de dominio para planear, ejecutar y dar seguimiento a una exposición oral formal.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo los formatos de exposición oral formal: coloquio, simposio y foro.", escala: escala4 },
          { descripcion: "Planifico una exposición oral definiendo tema, tiempo, materiales y roles.", escala: escala4 },
          { descripcion: "Ejecuto una exposición oral con claridad, cohesión y adecuación al público.", escala: escala4 },
          { descripcion: "Realizo el seguimiento de mi exposición identificando fortalezas y áreas de mejora.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué aspecto de la exposición oral te genera más ansiedad: la preparación, la ejecución o las preguntas del público? ¿Qué harás para afrontarlo?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
