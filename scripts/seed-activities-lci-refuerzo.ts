/**
 * Seed de FORTALECIMIENTO para LC-I (Lengua y Comunicación I).
 * Agrega 4 actividades (A4–A7) a cada una de las 8 progresiones, con tipos
 * variados anclados a los "Contenidos formativos" oficiales del programa
 * MCCEMS 2025 (Generación 2025-2028). Junto con las A1–A3 ya existentes,
 * cada progresión queda con 7 actividades (24 → 56 en total).
 *
 * Todas se insertan con estado='borrador' (requieren validación pedagógica).
 * Uso: npx tsx scripts/seed-activities-lci-refuerzo.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import {
  log,
  createSB,
  getProgresionesDeUAC,
  upsertActividad,
  type ActividadInput,
} from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

// Una entrada de refuerzo = los datos de UNA actividad, sin codigo ni progresion_id
// (esos se calculan por progresión al sembrar).
type Refuerzo = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;

async function main() {
  const sb = createSB();
  log("\n🌱 Fortalecimiento de actividades LC-I — Lengua y Comunicación I\n");

  const progs = await getProgresionesDeUAC(sb, "LC-I");
  let ok = 0;
  let fail = 0;

  for (const p of progs) {
    const set = refuerzos[p.numero - 1];
    if (!set) {
      log(`⚠️  No hay refuerzos definidos para la progresión ${p.numero} (${p.codigo}).`);
      continue;
    }

    // A4..A7
    const letras = ["A4", "A5", "A6", "A7"] as const;
    for (let i = 0; i < set.length; i++) {
      const act = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`,
        progresion_id: p.id,
        ...act,
      });
      res ? ok++ : fail++;
    }
  }

  log(`\n✅ LC-I refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ════════════════════════════════════════════════════════════════════════════
// REFUERZOS POR PROGRESIÓN (índice 0 = P01, …, índice 7 = P08)
// Cada progresión añade 4 actividades de tipos distintos a las A1–A3 previas.
// ════════════════════════════════════════════════════════════════════════════

const refuerzos: Refuerzo[][] = [
  // ──────────────────────────────────────────────────────────────────────────
  // P01 — Reconoce los vínculos entre la escritura y la lectura
  // Contenidos: escritura como pensamiento/empatía/creación/comunicación/ciencia;
  // lectura como diálogo entre contextos; lectura como placer.
  // ──────────────────────────────────────────────────────────────────────────
  [
    {
      titulo: "Verdadero o falso: leer y escribir",
      descripcion: "Verifica tu comprensión de los vínculos entre lectura y escritura.",
      tipo: "quiz_verdadero_falso",
      xp: 12,
      contenido: {
        preguntas: [
          { enunciado: "La escritura sirve únicamente para comunicarnos con otras personas.", respuesta: false, retroalimentacion: "Falso: la escritura también desarrolla el pensamiento, la empatía y la creación; comunicar es solo una de sus funciones." },
          { enunciado: "La lectura puede entenderse como un diálogo entre distintos contextos sociales, históricos y culturales.", respuesta: true, retroalimentacion: "Correcto: al leer ponemos en contacto el contexto del autor con el nuestro." },
          { enunciado: "Leer y escribir son habilidades que se aprenden por separado y no se influyen entre sí.", respuesta: false, retroalimentacion: "Falso: la lectura alimenta a la escritura y la escritura transforma nuestra manera de leer." },
          { enunciado: "La lectura puede ser un placer individual o compartido.", respuesta: true, retroalimentacion: "Correcto: leer no siempre tiene un fin utilitario; también es una fuente de disfrute." },
          { enunciado: "La escritura ha contribuido al avance científico al permitir registrar y comunicar el conocimiento.", respuesta: true, retroalimentacion: "Correcto: sin la escritura sería imposible acumular y transmitir el saber a lo largo del tiempo." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario: funciones de la lectura y la escritura",
      descripcion: "Conoce los conceptos clave de esta progresión.",
      tipo: "glosario_interactivo",
      xp: 10,
      contenido: {
        terminos: [
          { termino: "Escritura", definicion: "Práctica de crear significado mediante signos para que otra persona lo lea; desarrolla el pensamiento y la comunicación.", ejemplo: "Escribir un diario para ordenar lo que sentimos." },
          { termino: "Lectura", definicion: "Práctica de construir significado a partir de las palabras de otra persona; es un diálogo entre contextos.", ejemplo: "Leer una novela escrita hace cien años y dialogar con esa época." },
          { termino: "Empatía", definicion: "Capacidad de comprender lo que siente o piensa otra persona; la escritura y la lectura la fortalecen.", ejemplo: "Leer un testimonio ajeno y entender una vida distinta a la nuestra." },
          { termino: "Práctica social", definicion: "Uso de la lengua en situaciones reales para relacionarnos, aprender, expresarnos y transformar la realidad.", ejemplo: "Escribir una carta para pedir una mejora en la comunidad." },
          { termino: "Código alfabético", definicion: "Sistema que relaciona letras con sonidos; es la base, pero no el límite, de leer y escribir.", ejemplo: "Reconocer que la letra 'm' representa un sonido." },
        ],
        actividad_final: "Escribe una oración propia que use al menos dos de estos términos correctamente.",
      },
    },
    {
      titulo: "Completa: la lengua como práctica social",
      descripcion: "Completa el texto con los conceptos correctos.",
      tipo: "fill_blanks",
      xp: 15,
      contenido: {
        instrucciones: "Arrastra o escribe la palabra que completa correctamente cada espacio.",
        texto_con_huecos: "Cuando ___ construimos significado a partir de las palabras de otras personas; cuando ___ creamos significado para que otras personas lo lean. La lengua es, antes que nada, una práctica ___, porque la usamos para relacionarnos, aprender y expresarnos. Leer un texto literario nos invita a ___, mientras que leer un artículo informativo activa nuestra capacidad ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "leemos", alternativas_aceptadas: ["leer"], pista: "Acción de interpretar lo escrito." },
          { posicion: 1, respuesta_correcta: "escribimos", alternativas_aceptadas: ["escribir"], pista: "Acción de producir un texto." },
          { posicion: 2, respuesta_correcta: "social", pista: "Tiene que ver con relacionarnos con otros." },
          { posicion: 3, respuesta_correcta: "imaginar", alternativas_aceptadas: ["imaginar mundos"], pista: "Lo que provoca la literatura." },
          { posicion: 4, respuesta_correcta: "crítica", pista: "Capacidad de evaluar y cuestionar la información." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Debate: ¿leer o escribir desarrolla más el pensamiento?",
      descripcion: "Argumenta una postura con base en lo aprendido.",
      tipo: "debate_estructurado",
      xp: 20,
      contenido: {
        tema: "¿Qué desarrolla más el pensamiento crítico: la lectura o la escritura?",
        posturas: [
          "La lectura desarrolla más el pensamiento, porque nos expone a ideas y mundos distintos.",
          "La escritura desarrolla más el pensamiento, porque nos obliga a organizar y crear ideas propias.",
        ],
        argumentos_guia: {
          "La lectura desarrolla más el pensamiento, porque nos expone a ideas y mundos distintos.": [
            "Leer pone en diálogo nuestro contexto con el del autor.",
            "Sin leer no tendríamos referentes para escribir.",
          ],
          "La escritura desarrolla más el pensamiento, porque nos obliga a organizar y crear ideas propias.": [
            "Escribir exige estructurar las ideas con claridad.",
            "Al escribir descubrimos lo que realmente pensamos.",
          ],
        },
        reglas: [
          "Defiende tu postura con al menos dos argumentos.",
          "Escucha o lee la postura contraria antes de responder.",
          "Cierra reconociendo un punto válido de la otra postura.",
        ],
        criterios_evaluacion: ["Claridad de la postura", "Solidez de los argumentos", "Respeto a la postura contraria"],
        modalidad: "escrito",
      },
    },
  ],

  // ──────────────────────────────────────────────────────────────────────────
  // P02 — Explora gustos e inclinaciones de su comunidad
  // Contenidos: diversidad de textos, soportes y formatos; características
  // generales de los textos; situaciones cotidianas donde se necesitan textos.
  // ──────────────────────────────────────────────────────────────────────────
  [
    {
      titulo: "Glosario: tipos de textos, soportes y formatos",
      descripcion: "Distingue los conceptos que organizan la diversidad textual.",
      tipo: "glosario_interactivo",
      xp: 10,
      contenido: {
        terminos: [
          { termino: "Texto informativo", definicion: "Texto que reporta hechos y datos verificables sobre la realidad.", ejemplo: "Una noticia o un manual de instrucciones." },
          { termino: "Texto narrativo", definicion: "Texto que relata hechos reales o ficticios a lo largo del tiempo.", ejemplo: "Un cuento, una novela o una historia de vida." },
          { termino: "Texto digital", definicion: "Texto que circula en pantallas y plataformas electrónicas.", ejemplo: "Una publicación en redes sociales o un blog." },
          { termino: "Soporte", definicion: "Material o medio físico/electrónico donde aparece el texto.", ejemplo: "Papel, pantalla de celular, cartel en la calle." },
          { termino: "Formato", definicion: "Manera en que se organiza y presenta visualmente el texto.", ejemplo: "Lista, párrafo, tabla, historieta." },
        ],
        actividad_final: "Anota un texto que hayas leído hoy e identifica su tipo, su soporte y su formato.",
      },
    },
    {
      titulo: "Verdadero o falso: leer en la comunidad",
      descripcion: "Comprueba lo que sabes sobre los hábitos lectores cotidianos.",
      tipo: "quiz_verdadero_falso",
      xp: 12,
      contenido: {
        preguntas: [
          { enunciado: "La lectura solo ocurre en la escuela y en la biblioteca.", respuesta: false, retroalimentacion: "Falso: leemos en el trabajo, el hogar, el transporte, las redes y los mercados." },
          { enunciado: "Existen jerarquías que hacen que unos tipos de lectura sean más válidos que otros.", respuesta: false, retroalimentacion: "Falso: ningún tipo de lectura es más válido que otro; depende del propósito." },
          { enunciado: "Las etiquetas de productos y los mensajes de WhatsApp también son textos que leemos a diario.", respuesta: true, retroalimentacion: "Correcto: la lectura cotidiana incluye muchos textos breves y prácticos." },
          { enunciado: "Investigar los hábitos lectores de la comunidad ayuda a practicar la escucha activa.", respuesta: true, retroalimentacion: "Correcto: entrevistar e indagar desarrolla la escucha y la sistematización de información." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Completa: clasificando textos cotidianos",
      descripcion: "Identifica el tipo de texto según su propósito.",
      tipo: "fill_blanks",
      xp: 15,
      contenido: {
        instrucciones: "Completa con el tipo de texto correspondiente: informativo, narrativo o digital.",
        texto_con_huecos: "Una receta de cocina que explica pasos a seguir es un texto ___. Un cuento que relata las aventuras de un personaje es un texto ___. Una publicación que tu amistad sube a sus redes sociales es un texto ___. El reporte del clima en el periódico es un texto ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "informativo", pista: "Reporta datos o instrucciones verificables." },
          { posicion: 1, respuesta_correcta: "narrativo", pista: "Relata hechos a lo largo del tiempo." },
          { posicion: 2, respuesta_correcta: "digital", pista: "Circula en pantallas y plataformas." },
          { posicion: 3, respuesta_correcta: "informativo", pista: "Reporta datos verificables." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación: mi indagación en la comunidad",
      descripcion: "Valora cómo investigaste los hábitos lectores de tu entorno.",
      tipo: "autoevaluacion",
      xp: 12,
      contenido: {
        instrucciones: "Marca con honestidad el nivel que mejor describe tu desempeño en cada criterio.",
        criterios: [
          {
            descripcion: "Formulé preguntas claras para conocer los hábitos lectores de otra persona.",
            escala: [
              { valor: 1, etiqueta: "Aún no", descripcion: "No formulé preguntas o fueron confusas." },
              { valor: 2, etiqueta: "En proceso", descripcion: "Formulé algunas preguntas pertinentes." },
              { valor: 3, etiqueta: "Logrado", descripcion: "Formulé preguntas claras y pertinentes." },
            ],
          },
          {
            descripcion: "Escuché con atención y registré la información obtenida.",
            escala: [
              { valor: 1, etiqueta: "Aún no", descripcion: "No registré la información." },
              { valor: 2, etiqueta: "En proceso", descripcion: "Registré parte de la información." },
              { valor: 3, etiqueta: "Logrado", descripcion: "Escuché y registré con detalle." },
            ],
          },
          {
            descripcion: "Reconocí la diversidad de tipos de texto que lee mi comunidad.",
            escala: [
              { valor: 1, etiqueta: "Aún no", descripcion: "No identifiqué distintos tipos de texto." },
              { valor: 2, etiqueta: "En proceso", descripcion: "Identifiqué uno o dos tipos." },
              { valor: 3, etiqueta: "Logrado", descripcion: "Identifiqué varios tipos y soportes." },
            ],
          },
        ],
        reflexion_final_prompt: "¿Qué te sorprendió de los hábitos de lectura de las personas que consultaste?",
        visible_para_docente: true,
      },
    },
  ],

  // ──────────────────────────────────────────────────────────────────────────
  // P03 — Analiza información, ideas y opiniones en los textos
  // Contenidos: propiedades del texto (claridad, coherencia, concordancia);
  // distinguir información / ideas / opiniones; escritura de ideas sobre un tema.
  // ──────────────────────────────────────────────────────────────────────────
  [
    {
      titulo: "Verdadero o falso: ¿hecho u opinión?",
      descripcion: "Distingue entre información verificable y opiniones.",
      tipo: "quiz_verdadero_falso",
      xp: 12,
      contenido: {
        preguntas: [
          { enunciado: "\"El agua hierve a 100 °C a nivel del mar\" es una información verificable.", respuesta: true, retroalimentacion: "Correcto: es un dato que puede comprobarse." },
          { enunciado: "\"Esta es la mejor película de la historia\" es una información verificable.", respuesta: false, retroalimentacion: "Falso: es una opinión, una valoración personal que no se puede comprobar objetivamente." },
          { enunciado: "Un lector crítico acepta todo lo que lee como verdad absoluta.", respuesta: false, retroalimentacion: "Falso: un lector crítico cuestiona la autoría, el propósito y la evidencia del texto." },
          { enunciado: "La claridad, la coherencia y la concordancia son propiedades de un buen texto.", respuesta: true, retroalimentacion: "Correcto: son las propiedades que hacen comprensible un texto." },
          { enunciado: "Distinguir información de opiniones es especialmente importante en la era digital.", respuesta: true, retroalimentacion: "Correcto: en redes circulan mezclados textos de todo tipo, algunos sesgados o falsos." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Completa: información, idea y opinión",
      descripcion: "Clasifica cada enunciado según su tipo de contenido.",
      tipo: "fill_blanks",
      xp: 15,
      contenido: {
        instrucciones: "Completa con la palabra correcta: información, idea u opinión.",
        texto_con_huecos: "\"México tiene 32 entidades federativas\" es una ___ verificable. \"La diversidad cultural de México es su mayor riqueza\" es una ___ del autor. \"Deberíamos viajar más por nuestro país\" es una ___ personal. Para leer de forma ___, conviene distinguir estos tres elementos.",
        huecos: [
          { posicion: 0, respuesta_correcta: "información", pista: "Dato comprobable." },
          { posicion: 1, respuesta_correcta: "idea", pista: "Interpretación o valoración a partir de información." },
          { posicion: 2, respuesta_correcta: "opinión", pista: "Postura personal de quien escribe." },
          { posicion: 3, respuesta_correcta: "crítica", pista: "Forma de leer que cuestiona el texto." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Debate: ¿este mensaje quiere informar o convencer?",
      descripcion: "Analiza la intención de un texto y defiende tu postura.",
      tipo: "debate_estructurado",
      xp: 20,
      contenido: {
        tema: "¿La publicidad de productos puede considerarse información objetiva o es persuasión?",
        posturas: [
          "La publicidad es sobre todo persuasión: busca convencernos de comprar.",
          "La publicidad también informa: nos da datos reales sobre los productos.",
        ],
        argumentos_guia: {
          "La publicidad es sobre todo persuasión: busca convencernos de comprar.": [
            "Selecciona solo lo positivo del producto.",
            "Usa emociones e imágenes para influir en la decisión.",
          ],
          "La publicidad también informa: nos da datos reales sobre los productos.": [
            "Incluye precio, características y usos.",
            "Permite comparar opciones antes de comprar.",
          ],
        },
        reglas: [
          "Apoya tu postura con ejemplos concretos de anuncios.",
          "Identifica en el ejemplo qué es información y qué es opinión.",
        ],
        criterios_evaluacion: ["Distingue información de persuasión", "Usa ejemplos concretos", "Argumenta con claridad"],
        modalidad: "escrito",
      },
    },
    {
      titulo: "Autoevaluación: mi lectura crítica",
      descripcion: "Valora tu capacidad de analizar textos críticamente.",
      tipo: "autoevaluacion",
      xp: 12,
      contenido: {
        instrucciones: "Reflexiona y marca el nivel que mejor te describe en cada criterio.",
        criterios: [
          {
            descripcion: "Distingo entre información verificable, ideas y opiniones en un texto.",
            escala: [
              { valor: 1, etiqueta: "Aún no" },
              { valor: 2, etiqueta: "En proceso" },
              { valor: 3, etiqueta: "Logrado" },
            ],
          },
          {
            descripcion: "Me pregunto quién escribió el texto y con qué propósito.",
            escala: [
              { valor: 1, etiqueta: "Aún no" },
              { valor: 2, etiqueta: "En proceso" },
              { valor: 3, etiqueta: "Logrado" },
            ],
          },
          {
            descripcion: "Identifico cuando un texto intenta persuadirme.",
            escala: [
              { valor: 1, etiqueta: "Aún no" },
              { valor: 2, etiqueta: "En proceso" },
              { valor: 3, etiqueta: "Logrado" },
            ],
          },
        ],
        reflexion_final_prompt: "¿En qué situación de tu vida diaria te sería útil leer de forma más crítica?",
        visible_para_docente: true,
      },
    },
  ],

  // ──────────────────────────────────────────────────────────────────────────
  // P04 — Reconoce tipos de párrafos
  // Contenidos: párrafos descriptivos, narrativos, argumentativos; escritura de
  // comentarios; puntuación y sintaxis.
  // ──────────────────────────────────────────────────────────────────────────
  [
    {
      titulo: "Completa: identificando tipos de párrafo",
      descripcion: "Clasifica cada párrafo según su intención.",
      tipo: "fill_blanks",
      xp: 15,
      contenido: {
        instrucciones: "Completa con el tipo de párrafo: descriptivo, narrativo o argumentativo.",
        texto_con_huecos: "Un párrafo que detalla cómo es un lugar, sus colores y sonidos, es ___. Un párrafo que cuenta qué pasó primero, después y al final es ___. Un párrafo que defiende una postura con razones para convencer es ___. El párrafo que presenta el tema al inicio de un texto se llama párrafo ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "descriptivo", pista: "Pinta con palabras cómo es algo." },
          { posicion: 1, respuesta_correcta: "narrativo", pista: "Relata hechos en una secuencia temporal." },
          { posicion: 2, respuesta_correcta: "argumentativo", pista: "Defiende una postura con razones." },
          { posicion: 3, respuesta_correcta: "introductorio", pista: "Abre el texto y anuncia el tema." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Verdadero o falso: párrafos y puntuación",
      descripcion: "Comprueba tu dominio de la estructura del párrafo.",
      tipo: "quiz_verdadero_falso",
      xp: 12,
      contenido: {
        preguntas: [
          { enunciado: "La oración temática siempre debe ir al inicio del párrafo.", respuesta: false, retroalimentacion: "Falso: puede ir al inicio, en medio o al final del párrafo." },
          { enunciado: "Un párrafo desarrolla generalmente una sola idea principal.", respuesta: true, retroalimentacion: "Correcto: el párrafo es la unidad que desarrolla una idea central." },
          { enunciado: "El punto y seguido separa ideas dentro de un mismo párrafo.", respuesta: true, retroalimentacion: "Correcto: el punto y seguido separa oraciones relacionadas en el párrafo." },
          { enunciado: "El párrafo argumentativo solo describe objetos sin defender ninguna postura.", respuesta: false, retroalimentacion: "Falso: el argumentativo defiende una postura con razones; el que describe es el descriptivo." },
          { enunciado: "Un párrafo de conclusión retoma las ideas principales y cierra el texto.", respuesta: true, retroalimentacion: "Correcto: esa es la función del párrafo de conclusión." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario: el párrafo y sus tipos",
      descripcion: "Consulta los conceptos clave sobre el párrafo.",
      tipo: "glosario_interactivo",
      xp: 10,
      contenido: {
        terminos: [
          { termino: "Párrafo", definicion: "Unidad básica de organización del texto que desarrolla una idea principal.", ejemplo: "Este bloque de oraciones que estás leyendo es un párrafo." },
          { termino: "Oración temática", definicion: "Oración que expresa la idea principal del párrafo.", ejemplo: "\"El reciclaje tiene tres grandes beneficios\" puede ser una oración temática." },
          { termino: "Párrafo descriptivo", definicion: "Párrafo que detalla cómo es una persona, lugar u objeto.", ejemplo: "Describir un paisaje con sus colores y sonidos." },
          { termino: "Párrafo narrativo", definicion: "Párrafo que relata hechos en una secuencia temporal.", ejemplo: "Contar qué ocurrió durante un viaje." },
          { termino: "Párrafo argumentativo", definicion: "Párrafo que defiende una postura con razones para convencer.", ejemplo: "Defender por qué conviene leer todos los días." },
        ],
        actividad_final: "Escribe una oración temática para un párrafo argumentativo sobre un tema que te interese.",
      },
    },
    {
      titulo: "Autoevaluación: escribo párrafos",
      descripcion: "Valora cómo construyes tus párrafos.",
      tipo: "autoevaluacion",
      xp: 12,
      contenido: {
        instrucciones: "Revisa un párrafo que hayas escrito y marca tu nivel en cada criterio.",
        criterios: [
          {
            descripcion: "Mi párrafo tiene una oración temática clara.",
            escala: [
              { valor: 1, etiqueta: "Aún no" },
              { valor: 2, etiqueta: "En proceso" },
              { valor: 3, etiqueta: "Logrado" },
            ],
          },
          {
            descripcion: "Identifico qué tipo de párrafo escribí (descriptivo, narrativo o argumentativo).",
            escala: [
              { valor: 1, etiqueta: "Aún no" },
              { valor: 2, etiqueta: "En proceso" },
              { valor: 3, etiqueta: "Logrado" },
            ],
          },
          {
            descripcion: "Uso correctamente los signos de puntuación.",
            escala: [
              { valor: 1, etiqueta: "Aún no" },
              { valor: 2, etiqueta: "En proceso" },
              { valor: 3, etiqueta: "Logrado" },
            ],
          },
        ],
        reflexion_final_prompt: "¿Qué tipo de párrafo se te facilita más escribir y por qué?",
        visible_para_docente: true,
      },
    },
  ],

  // ──────────────────────────────────────────────────────────────────────────
  // P05 — Identifica información significativa
  // Contenidos: ideas principales y secundarias; elementos paratextuales;
  // escritura de ideas principales y secundarias.
  // ──────────────────────────────────────────────────────────────────────────
  [
    {
      titulo: "Completa: ideas principales y secundarias",
      descripcion: "Distingue la información esencial de la de apoyo.",
      tipo: "fill_blanks",
      xp: 15,
      contenido: {
        instrucciones: "Completa el texto con los conceptos correctos.",
        texto_con_huecos: "La idea ___ es la información más importante de un párrafo; las ideas ___ la apoyan con ejemplos y detalles. Los elementos ___, como el título, los subtítulos y las imágenes, ayudan a anticipar el contenido. Para identificar lo esencial es útil ___ las palabras clave del texto.",
        huecos: [
          { posicion: 0, respuesta_correcta: "principal", pista: "La más importante." },
          { posicion: 1, respuesta_correcta: "secundarias", pista: "Apoyan a la principal." },
          { posicion: 2, respuesta_correcta: "paratextuales", alternativas_aceptadas: ["paratextos"], pista: "Rodean al texto: título, imágenes…" },
          { posicion: 3, respuesta_correcta: "subrayar", pista: "Marcar lo importante con una línea." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Verdadero o falso: lo esencial del texto",
      descripcion: "Comprueba tus estrategias de selección de información.",
      tipo: "quiz_verdadero_falso",
      xp: 12,
      contenido: {
        preguntas: [
          { enunciado: "Resumir es copiar fragmentos literales del texto original.", respuesta: false, retroalimentacion: "Falso: resumir es reescribir las ideas principales con palabras propias." },
          { enunciado: "El título y los subtítulos son elementos paratextuales que ayudan a anticipar el contenido.", respuesta: true, retroalimentacion: "Correcto: los paratextos orientan la lectura antes y durante el texto." },
          { enunciado: "Las ideas secundarias son menos útiles, así que conviene ignorarlas siempre.", respuesta: false, retroalimentacion: "Falso: las ideas secundarias apoyan y aclaran la idea principal; no se ignoran, se jerarquizan." },
          { enunciado: "Subrayar palabras clave es una estrategia de lectura activa.", respuesta: true, retroalimentacion: "Correcto: subrayar ayuda a identificar y recordar lo esencial." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario: identificar lo significativo",
      descripcion: "Conceptos clave para seleccionar información relevante.",
      tipo: "glosario_interactivo",
      xp: 10,
      contenido: {
        terminos: [
          { termino: "Idea principal", definicion: "La información más importante de un párrafo o texto.", ejemplo: "En un párrafo sobre el reciclaje, la idea de que reduce la basura." },
          { termino: "Idea secundaria", definicion: "Información que apoya, ejemplifica o amplía la idea principal.", ejemplo: "Un dato que muestra cuánta basura se evita al reciclar." },
          { termino: "Elemento paratextual", definicion: "Recurso que rodea al texto y ayuda a anticiparlo: título, subtítulos, imágenes, índice.", ejemplo: "El título de un capítulo que anuncia su tema." },
          { termino: "Resumen", definicion: "Versión breve que reescribe las ideas principales con palabras propias.", ejemplo: "Contar en tres líneas lo esencial de una noticia." },
          { termino: "Subrayado", definicion: "Estrategia de marcar las palabras o frases clave durante la lectura.", ejemplo: "Resaltar la oración temática de cada párrafo." },
        ],
        actividad_final: "Toma un párrafo de una de tus lecturas y subraya la idea principal y una secundaria.",
      },
    },
    {
      titulo: "Autoevaluación: selecciono lo importante",
      descripcion: "Valora tu manejo de la información relevante.",
      tipo: "autoevaluacion",
      xp: 12,
      contenido: {
        instrucciones: "Marca con honestidad tu nivel en cada criterio.",
        criterios: [
          {
            descripcion: "Identifico la idea principal de un párrafo.",
            escala: [
              { valor: 1, etiqueta: "Aún no" },
              { valor: 2, etiqueta: "En proceso" },
              { valor: 3, etiqueta: "Logrado" },
            ],
          },
          {
            descripcion: "Distingo las ideas secundarias de la principal.",
            escala: [
              { valor: 1, etiqueta: "Aún no" },
              { valor: 2, etiqueta: "En proceso" },
              { valor: 3, etiqueta: "Logrado" },
            ],
          },
          {
            descripcion: "Uso los elementos paratextuales para anticipar el contenido.",
            escala: [
              { valor: 1, etiqueta: "Aún no" },
              { valor: 2, etiqueta: "En proceso" },
              { valor: 3, etiqueta: "Logrado" },
            ],
          },
        ],
        reflexion_final_prompt: "¿Qué estrategia te resulta más útil para encontrar lo importante de un texto?",
        visible_para_docente: true,
      },
    },
  ],

  // ──────────────────────────────────────────────────────────────────────────
  // P06 — Emplea concordancia y conectores
  // Contenidos: concordancia del texto; conectores causales, comparativos y de
  // adición.
  // ──────────────────────────────────────────────────────────────────────────
  [
    {
      titulo: "Completa: conectores en su lugar",
      descripcion: "Une las ideas con el conector adecuado.",
      tipo: "fill_blanks",
      xp: 15,
      contenido: {
        instrucciones: "Completa con un conector adecuado: porque, además, como (en comparación) u otro pertinente.",
        texto_con_huecos: "Llegué tarde a clase ___ el autobús se descompuso. Estudié mucho para el examen; ___, repasé con mis compañeros. Este texto es claro, ___ un río que fluye sin obstáculos. No traje la tarea, ___ por lo tanto no pude participar.",
        huecos: [
          { posicion: 0, respuesta_correcta: "porque", pista: "Conector causal: indica la causa." },
          { posicion: 1, respuesta_correcta: "además", pista: "Conector de adición: agrega información." },
          { posicion: 2, respuesta_correcta: "como", pista: "Conector comparativo: establece semejanza." },
          { posicion: 3, respuesta_correcta: "y", alternativas_aceptadas: ["así que"], pista: "Une la idea con su consecuencia." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Verdadero o falso: concordancia",
      descripcion: "Detecta errores de concordancia gramatical.",
      tipo: "quiz_verdadero_falso",
      xp: 12,
      contenido: {
        preguntas: [
          { enunciado: "\"Los niños fueron al parque\" tiene concordancia correcta.", respuesta: true, retroalimentacion: "Correcto: sujeto plural con verbo plural." },
          { enunciado: "\"Las casa son grandes\" tiene concordancia correcta.", respuesta: false, retroalimentacion: "Falso: debe ser \"Las casas\", el sustantivo concuerda en número con el artículo." },
          { enunciado: "El sujeto y el verbo deben concordar en número y persona.", respuesta: true, retroalimentacion: "Correcto: esa es la concordancia sujeto-verbo." },
          { enunciado: "\"Además\" es un conector que expresa causa.", respuesta: false, retroalimentacion: "Falso: \"además\" expresa adición; la causa se expresa con \"porque\"." },
          { enunciado: "Sin conectores adecuados, un texto parece una lista de ideas desconectadas.", respuesta: true, retroalimentacion: "Correcto: los conectores dan coherencia y fluidez al texto." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario: concordancia y conectores",
      descripcion: "Conceptos clave para dar coherencia al texto.",
      tipo: "glosario_interactivo",
      xp: 10,
      contenido: {
        terminos: [
          { termino: "Concordancia", definicion: "Acuerdo entre los elementos de la oración: sustantivo-adjetivo en género y número, y sujeto-verbo en número y persona.", ejemplo: "\"La casa blanca\" (concuerda en género y número)." },
          { termino: "Conector", definicion: "Palabra o frase que une ideas dentro de una oración o entre párrafos.", ejemplo: "porque, además, sin embargo, como." },
          { termino: "Conector causal", definicion: "Conector que indica la causa o el motivo de algo.", ejemplo: "\"No salí porque llovía\"." },
          { termino: "Conector comparativo", definicion: "Conector que establece una semejanza o comparación.", ejemplo: "\"Es alto como su padre\"." },
          { termino: "Conector de adición", definicion: "Conector que agrega información a lo dicho.", ejemplo: "\"Estudió mucho; además, durmió bien\"." },
        ],
        actividad_final: "Escribe tres oraciones, una con un conector causal, una comparativo y una de adición.",
      },
    },
    {
      titulo: "Autoevaluación: coherencia de mi texto",
      descripcion: "Valora el uso de concordancia y conectores en tu escritura.",
      tipo: "autoevaluacion",
      xp: 12,
      contenido: {
        instrucciones: "Revisa un texto que hayas escrito y marca tu nivel en cada criterio.",
        criterios: [
          {
            descripcion: "Mis oraciones tienen concordancia entre sujeto y verbo.",
            escala: [
              { valor: 1, etiqueta: "Aún no" },
              { valor: 2, etiqueta: "En proceso" },
              { valor: 3, etiqueta: "Logrado" },
            ],
          },
          {
            descripcion: "Uso conectores para unir mis ideas con claridad.",
            escala: [
              { valor: 1, etiqueta: "Aún no" },
              { valor: 2, etiqueta: "En proceso" },
              { valor: 3, etiqueta: "Logrado" },
            ],
          },
          {
            descripcion: "Reviso y corrijo los errores de concordancia antes de entregar.",
            escala: [
              { valor: 1, etiqueta: "Aún no" },
              { valor: 2, etiqueta: "En proceso" },
              { valor: 3, etiqueta: "Logrado" },
            ],
          },
        ],
        reflexion_final_prompt: "¿Qué tipo de conector usas con menos frecuencia y podrías practicar más?",
        visible_para_docente: true,
      },
    },
  ],

  // ──────────────────────────────────────────────────────────────────────────
  // P07 — Lee en voz alta y emite apreciaciones
  // Contenidos: apreciaciones orales y escritas del texto; elementos
  // paralingüísticos; escritura de elementos paralingüísticos.
  // ──────────────────────────────────────────────────────────────────────────
  [
    {
      titulo: "Verdadero o falso: leer en voz alta",
      descripcion: "Comprueba lo que sabes sobre la lectura en voz alta.",
      tipo: "quiz_verdadero_falso",
      xp: 12,
      contenido: {
        preguntas: [
          { enunciado: "La dicción es la pronunciación clara de cada sílaba.", respuesta: true, retroalimentacion: "Correcto: la dicción se refiere a pronunciar con claridad." },
          { enunciado: "Las pausas en la lectura en voz alta solo sirven para que descanse quien lee.", respuesta: false, retroalimentacion: "Falso: las pausas permiten al oyente procesar lo que escuchó." },
          { enunciado: "La entonación expresa preguntas, exclamaciones y afirmaciones con variaciones de tono.", respuesta: true, retroalimentacion: "Correcto: la entonación da expresividad según el tipo de oración." },
          { enunciado: "Emitir una opinión fundamentada es solo decir si el texto te gustó.", respuesta: false, retroalimentacion: "Falso: una opinión fundamentada explica el porqué con argumentos basados en el texto." },
          { enunciado: "Ser oyente atento desarrolla la escucha activa.", respuesta: true, retroalimentacion: "Correcto: escuchar con atención permite seguir el hilo y detectar inconsistencias." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario: elementos de la lectura en voz alta",
      descripcion: "Conoce los elementos paralingüísticos y técnicos.",
      tipo: "glosario_interactivo",
      xp: 10,
      contenido: {
        terminos: [
          { termino: "Dicción", definicion: "Pronunciación clara y correcta de los sonidos y sílabas.", ejemplo: "Pronunciar bien cada palabra sin \"comerse\" letras." },
          { termino: "Entonación", definicion: "Variación del tono de la voz para expresar preguntas, exclamaciones o afirmaciones.", ejemplo: "Subir el tono al final de una pregunta." },
          { termino: "Ritmo", definicion: "Velocidad adecuada de la lectura, ni demasiado rápida ni demasiado lenta.", ejemplo: "Leer más despacio una parte importante." },
          { termino: "Pausa", definicion: "Silencio breve que permite al oyente procesar lo escuchado.", ejemplo: "Detenerse un instante después de un punto." },
          { termino: "Elemento paralingüístico", definicion: "Recurso de la voz que acompaña a las palabras: tono, volumen, ritmo, pausas, énfasis.", ejemplo: "Bajar el volumen para crear suspenso." },
        ],
        actividad_final: "Lee una oración en voz alta cambiando la entonación y nota cómo cambia su significado.",
      },
    },
    {
      titulo: "Completa: la voz que da vida al texto",
      descripcion: "Completa con los elementos paralingüísticos correctos.",
      tipo: "fill_blanks",
      xp: 15,
      contenido: {
        instrucciones: "Completa con: dicción, entonación, ritmo o pausas.",
        texto_con_huecos: "Para que el público entienda cada palabra, cuido mi ___. Para expresar una pregunta, subo el tono usando la ___. Para no leer demasiado rápido, controlo el ___. Y para que el oyente procese lo dicho, hago ___ en los puntos.",
        huecos: [
          { posicion: 0, respuesta_correcta: "dicción", pista: "Pronunciación clara." },
          { posicion: 1, respuesta_correcta: "entonación", pista: "Variación de tono." },
          { posicion: 2, respuesta_correcta: "ritmo", pista: "Velocidad de la lectura." },
          { posicion: 3, respuesta_correcta: "pausas", pista: "Silencios breves." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Debate: ¿se comprende mejor leyendo en voz alta o en silencio?",
      descripcion: "Argumenta una postura sobre las formas de leer.",
      tipo: "debate_estructurado",
      xp: 20,
      contenido: {
        tema: "¿Se comprende mejor un texto leyéndolo en voz alta o leyéndolo en silencio?",
        posturas: [
          "Se comprende mejor en voz alta, porque escuchamos y nos concentramos más.",
          "Se comprende mejor en silencio, porque vamos a nuestro ritmo y sin distracciones.",
        ],
        argumentos_guia: {
          "Se comprende mejor en voz alta, porque escuchamos y nos concentramos más.": [
            "La entonación nos ayuda a captar el sentido.",
            "Al pronunciar, fijamos más la atención en cada palabra.",
          ],
          "Se comprende mejor en silencio, porque vamos a nuestro ritmo y sin distracciones.": [
            "Podemos releer las partes difíciles sin interrumpir a nadie.",
            "Avanzamos más rápido en los textos sencillos.",
          ],
        },
        reglas: [
          "Da al menos dos argumentos para tu postura.",
          "Reconoce en qué casos la otra forma de leer es mejor.",
        ],
        criterios_evaluacion: ["Claridad de la postura", "Calidad de los argumentos", "Reconoce matices"],
        modalidad: "hibrido",
      },
    },
  ],

  // ──────────────────────────────────────────────────────────────────────────
  // P08 — Prepara y realiza una exposición oral
  // Contenidos: seleccionar contenido; decidir forma individual/grupal; etapas
  // (planeación, acompañamiento, ejecución); recursos (diapositivas, mapas
  // mentales).
  // ──────────────────────────────────────────────────────────────────────────
  [
    {
      titulo: "Verdadero o falso: la exposición oral",
      descripcion: "Comprueba lo que sabes sobre preparar una exposición.",
      tipo: "quiz_verdadero_falso",
      xp: 12,
      contenido: {
        preguntas: [
          { enunciado: "La planificación es la primera etapa de una exposición oral.", respuesta: true, retroalimentacion: "Correcto: primero se define el tema, se investiga y se selecciona la información." },
          { enunciado: "Una exposición oral no necesita introducción ni conclusión.", respuesta: false, retroalimentacion: "Falso: toda exposición debe tener introducción, desarrollo y conclusión." },
          { enunciado: "El contacto visual con el público transmite seguridad.", respuesta: true, retroalimentacion: "Correcto: mirar a la audiencia genera conexión y confianza." },
          { enunciado: "Las diapositivas y los mapas mentales son recursos de apoyo para exponer.", respuesta: true, retroalimentacion: "Correcto: son apoyos visuales que organizan y refuerzan el mensaje." },
          { enunciado: "Practicar una exposición significa memorizarla palabra por palabra.", respuesta: false, retroalimentacion: "Falso: practicar es ensayar para ganar fluidez y controlar el tiempo, no memorizar literalmente." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario: etapas y recursos de la exposición",
      descripcion: "Conoce las fases y los apoyos de una exposición oral.",
      tipo: "glosario_interactivo",
      xp: 10,
      contenido: {
        terminos: [
          { termino: "Planeación", definicion: "Etapa de definir el tema, investigar y seleccionar la información relevante.", ejemplo: "Elegir el tema y buscar fuentes antes de exponer." },
          { termino: "Introducción", definicion: "Parte inicial que presenta el tema y capta la atención del público.", ejemplo: "Empezar con una pregunta o un dato sorprendente." },
          { termino: "Desarrollo", definicion: "Parte central donde se explican los puntos principales del tema.", ejemplo: "Exponer las tres ideas clave del tema." },
          { termino: "Conclusión", definicion: "Parte final que retoma lo más importante y cierra la exposición.", ejemplo: "Resumir las ideas y cerrar con una reflexión." },
          { termino: "Apoyo visual", definicion: "Recurso como diapositivas o mapas mentales que refuerza el mensaje oral.", ejemplo: "Una diapositiva con una imagen y palabras clave." },
        ],
        actividad_final: "Esboza la introducción de una exposición sobre un tema que domines.",
      },
    },
    {
      titulo: "Completa: las etapas de exponer",
      descripcion: "Ordena las fases de una exposición oral.",
      tipo: "fill_blanks",
      xp: 15,
      contenido: {
        instrucciones: "Completa con: planeación, introducción, desarrollo, conclusión.",
        texto_con_huecos: "Primero, en la ___, defino el tema e investigo. Al exponer, empiezo con la ___ para presentar el tema. Luego, en el ___, explico los puntos principales. Finalmente, en la ___, retomo lo esencial y cierro.",
        huecos: [
          { posicion: 0, respuesta_correcta: "planeación", alternativas_aceptadas: ["planeacion", "planificación"], pista: "Etapa previa: definir e investigar." },
          { posicion: 1, respuesta_correcta: "introducción", alternativas_aceptadas: ["introduccion"], pista: "Presenta el tema." },
          { posicion: 2, respuesta_correcta: "desarrollo", pista: "Explica los puntos principales." },
          { posicion: 3, respuesta_correcta: "conclusión", alternativas_aceptadas: ["conclusion"], pista: "Cierra la exposición." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Debate: ¿exposición individual o en equipo?",
      descripcion: "Argumenta qué forma de exponer es más efectiva.",
      tipo: "debate_estructurado",
      xp: 20,
      contenido: {
        tema: "¿Es mejor preparar una exposición de forma individual o en equipo?",
        posturas: [
          "Es mejor individual, porque hay más control sobre el contenido y el tiempo.",
          "Es mejor en equipo, porque se reparte el trabajo y se enriquece con varias ideas.",
        ],
        argumentos_guia: {
          "Es mejor individual, porque hay más control sobre el contenido y el tiempo.": [
            "No dependes de que otros cumplan su parte.",
            "El estilo y el mensaje son coherentes.",
          ],
          "Es mejor en equipo, porque se reparte el trabajo y se enriquece con varias ideas.": [
            "Cada integrante aporta su fortaleza.",
            "Se practica la colaboración y la coordinación.",
          ],
        },
        reglas: [
          "Defiende tu postura con al menos dos argumentos.",
          "Propón en qué situaciones conviene cada forma.",
        ],
        criterios_evaluacion: ["Claridad de la postura", "Argumentos pertinentes", "Considera el contexto"],
        modalidad: "oral",
      },
    },
  ],
];

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
