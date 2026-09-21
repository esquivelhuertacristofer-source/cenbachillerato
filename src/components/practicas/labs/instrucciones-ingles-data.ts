/**
 * Datos y modelo del laboratorio «Instructions that work» (IN-III-P06, Inglés
 * III: «Pide, da y entiende instrucciones más completas: orienta a otra
 * persona para hacer algo o llegar a un lugar»).
 *
 * Anclas (verbatim de la base):
 *   - A1 lectura «How to Give Instructions in English»: marco teórico, recuadro
 *     «Did you know?» y preguntas de comprensión.
 *   - A3 quiz de opción múltiple: reto evaluable (RetoQuizCard).
 *   - A2 fill_blanks: modo «Completa el texto» (vive en -huecos.ts).
 *   - A4 verdadero/falso: panel de hechos.  A5 glosario: ficha.
 *
 * La tesis del laboratorio —y lo que lo separa de `procesos-ingles`
 * (IN-V-P03, ordenar un proceso) y de `ciudad-direcciones-ingles-3d`
 * (IN-II-P06, moverse por un plano)— es esta: **una instrucción no es correcta
 * porque se entienda, sino porque no admite otra lectura**. Por eso todo lo que
 * el alumno escribe aquí lo ejecuta algo literal, y la imprecisión se paga con
 * un resultado equivocado que se ve.
 *
 * Los cuatro modos manipulables:
 *   1. «Da la instrucción» — una pantalla simulada con diez elementos obedece
 *      al pie de la letra la instrucción que el alumno arma (verbo + objeto +
 *      detalle). Si la frase alcanza a más de un elemento, la máquina toma el
 *      primero que encuentra y hace otra cosa.
 *   2. «Precisa o ambigua» — seis pares de instrucciones; elegir la precisa y
 *      decir QUÉ dato le falta a la otra.
 *   3. «Arregla la secuencia» — los conectores están en orden perfecto y los
 *      pasos no: la simulación demuestra que el orden de los conectores no
 *      basta.
 *   4. «Pide que te orienten» — preguntas indirectas (Could you tell me… / Do
 *      you know…), que invierten el orden respecto a la pregunta directa.
 *
 * Todo el inglés que no viene de la base lo escribió este laboratorio en
 * inglés estadounidense estándar. Los nombres de archivo y la plataforma
 * escolar son ficticios. Datos puros: sin React ni three.
 */

import type { QuizEvaluable } from "./_reto-quiz";

/* ═══════════════════════════════════════════════════════════════════════
 * MODO 1 — «Da la instrucción»: la pantalla que obedece al pie de la letra
 * ═══════════════════════════════════════════════════════════════════════ */

export type Verbo = "Click" | "Open" | "Select" | "Type" | "Press";
export const VERBOS: Verbo[] = ["Click", "Open", "Select", "Type", "Press"];

export type ZonaPantalla = "barra" | "menu" | "lista" | "pie";

export interface ElementoPantalla {
  id: string;
  /** Texto visible en la pantalla simulada (en inglés, como la interfaz real). */
  etiqueta: string;
  zona: ZonaPantalla;
  clase: "boton" | "menu" | "archivo" | "campo";
  /** Color del botón, cuando lo tiene (es parte de la descripción precisa). */
  color?: "azul" | "rojo" | "verde";
  /** Verbos que este elemento acepta. */
  acciones: Verbo[];
  /** Qué pasa cuando la máquina lo ejecuta (en español, para la bitácora). */
  efecto: string;
}

export const ELEMENTOS: ElementoPantalla[] = [
  { id: "m-home", etiqueta: "Home", zona: "menu", clase: "menu", acciones: ["Click", "Open", "Select"], efecto: "La plataforma vuelve a la página de inicio." },
  { id: "m-classes", etiqueta: "My classes", zona: "menu", clase: "menu", acciones: ["Click", "Open", "Select"], efecto: "Se abre la lista de tus clases." },
  { id: "m-assignments", etiqueta: "Assignments", zona: "menu", clase: "menu", acciones: ["Click", "Open", "Select"], efecto: "Se abre la sección de tareas." },
  { id: "campo-buscar", etiqueta: "Search…", zona: "barra", clase: "campo", acciones: ["Type"], efecto: "El texto aparece escrito en el buscador." },
  { id: "btn-delete", etiqueta: "Delete", zona: "barra", clase: "boton", color: "rojo", acciones: ["Click", "Press"], efecto: "¡La plataforma borra el archivo seleccionado!" },
  { id: "btn-upload", etiqueta: "Upload", zona: "barra", clase: "boton", color: "azul", acciones: ["Click", "Press"], efecto: "Se abre la ventana para subir el archivo." },
  { id: "f-notes", etiqueta: "notes.pdf", zona: "lista", clase: "archivo", acciones: ["Click", "Open", "Select"], efecto: "Queda seleccionado «notes.pdf»." },
  { id: "f-tarea", etiqueta: "Tarea 3.docx", zona: "lista", clase: "archivo", acciones: ["Click", "Open", "Select"], efecto: "Queda seleccionado «Tarea 3.docx»." },
  { id: "f-photo", etiqueta: "photo.jpg", zona: "lista", clase: "archivo", acciones: ["Click", "Open", "Select"], efecto: "Queda seleccionado «photo.jpg»." },
  { id: "btn-send", etiqueta: "Send", zona: "pie", clase: "boton", color: "verde", acciones: ["Click", "Press"], efecto: "La tarea se envía a la maestra." },
];

/**
 * El orden en que la máquina RECORRE la pantalla cuando una frase alcanza a
 * varios elementos: de arriba abajo y de izquierda a derecha. No es un capricho
 * —es el punto de la lección—: «the button» toma el primer botón que encuentra,
 * y el primero es el rojo de borrar.
 */
export const ORDEN_LECTURA: string[] = [
  "m-home",
  "m-classes",
  "m-assignments",
  "campo-buscar",
  "btn-delete",
  "btn-upload",
  "f-notes",
  "f-tarea",
  "f-photo",
  "btn-send",
];

export interface ObjetoFrase {
  id: string;
  /** El trozo de inglés que el alumno elige. */
  texto: string;
  /** Elementos a los que esa descripción alcanza. */
  alcanza: string[];
}

export const OBJETOS: ObjetoFrase[] = [
  { id: "o-button", texto: "the button", alcanza: ["btn-delete", "btn-upload", "btn-send"] },
  { id: "o-blue", texto: "the blue button", alcanza: ["btn-upload"] },
  { id: "o-red", texto: "the red button", alcanza: ["btn-delete"] },
  { id: "o-green", texto: "the green button", alcanza: ["btn-send"] },
  { id: "o-file", texto: "the file", alcanza: ["f-notes", "f-tarea", "f-photo"] },
  { id: "o-tarea", texto: 'the file named "Tarea 3.docx"', alcanza: ["f-tarea"] },
  { id: "o-option", texto: "the menu option", alcanza: ["m-home", "m-classes", "m-assignments"] },
  { id: "o-assign", texto: '"Assignments"', alcanza: ["m-assignments"] },
  { id: "o-box", texto: "the search box", alcanza: ["campo-buscar"] },
];

export interface DetalleFrase {
  id: string;
  /** Trozo final de la frase; vacío cuando el alumno decide no dar detalle. */
  texto: string;
  /** Etiqueta para el botón cuando el texto está vacío. */
  etiqueta?: string;
  /** Si está, la frase solo alcanza a estos elementos. */
  filtra?: string[];
}

export const DETALLES: DetalleFrase[] = [
  { id: "d-nada", texto: "", etiqueta: "— sin detalle —" },
  { id: "d-topright", texto: "at the top right", filtra: ["btn-delete", "btn-upload", "campo-buscar"] },
  { id: "d-bottom", texto: "at the bottom of the screen", filtra: ["btn-send"] },
  { id: "d-menu", texto: "in the left menu", filtra: ["m-home", "m-classes", "m-assignments"] },
  { id: "d-lista", texto: "in the file list", filtra: ["f-notes", "f-tarea", "f-photo"] },
];

export interface TareaPantalla {
  id: string;
  /** Lo que hay que conseguir, en español. */
  meta: string;
  /** Elemento que debe quedar accionado (los verbos válidos los declara el propio elemento). */
  objetivo: string;
  /** Una instrucción precisa que sí funciona (se revela como ayuda). */
  ejemplo: string;
}

export const TAREAS: TareaPantalla[] = [
  {
    id: "t1",
    meta: "Abre la sección de tareas («Assignments») del menú de la izquierda.",
    objetivo: "m-assignments",
    ejemplo: 'Open "Assignments" in the left menu.',
  },
  {
    id: "t2",
    meta: "Selecciona el archivo de la tarea, «Tarea 3.docx».",
    objetivo: "f-tarea",
    ejemplo: 'Select the file named "Tarea 3.docx" in the file list.',
  },
  {
    id: "t3",
    meta: "Pulsa el botón azul «Upload» de la barra de arriba.",
    objetivo: "btn-upload",
    ejemplo: "Press the blue button at the top right.",
  },
  {
    id: "t4",
    meta: "Pulsa el botón verde «Send» del final de la pantalla.",
    objetivo: "btn-send",
    ejemplo: "Click the green button at the bottom of the screen.",
  },
];

export type ClaseDesenlace = "exito" | "ambigua" | "otro" | "verbo" | "nada";

export interface Desenlace {
  clase: ClaseDesenlace;
  /** Elemento que la máquina terminó accionando (si accionó alguno). */
  elegido: string | null;
  /** Todos los elementos que la frase alcanzaba. */
  candidatos: string[];
  /** Lo que la máquina "responde", en español. */
  mensaje: string;
  /** Por qué pasó eso y cómo se arregla la instrucción. */
  leccion: string;
}

/** Busca un elemento por id (con noUncheckedIndexedAccess no hay atajos). */
export function elementoPorId(id: string): ElementoPantalla | undefined {
  return ELEMENTOS.find((e) => e.id === id);
}

function etiquetaDe(id: string): string {
  return elementoPorId(id)?.etiqueta ?? id;
}

/** La frase en inglés que el alumno acaba de construir. */
export function fraseDe(verbo: Verbo, objetoId: string, detalleId: string): string {
  const o = OBJETOS.find((x) => x.id === objetoId);
  const d = DETALLES.find((x) => x.id === detalleId);
  const cola = d && d.texto ? ` ${d.texto}` : "";
  return `${verbo} ${o?.texto ?? "…"}${cola}.`;
}

/**
 * LA MÁQUINA LITERAL. Recibe la frase armada y decide qué hace.
 *
 * Reglas, en este orden:
 *  1. Si la frase no alcanza a ningún elemento → no hace nada.
 *  2. Si alcanza a varios → toma el PRIMERO del orden de lectura. Aunque por
 *     casualidad sea el correcto, la tarea NO se da por hecha: la instrucción
 *     admitía otra lectura.
 *  3. Si alcanza a uno solo pero el verbo no le corresponde → no hace nada útil.
 *  4. Si alcanza a uno solo, con verbo válido, y es el objetivo → éxito.
 */
export function ejecutar(verbo: Verbo, objetoId: string, detalleId: string, objetivoId: string): Desenlace {
  const o = OBJETOS.find((x) => x.id === objetoId);
  const d = DETALLES.find((x) => x.id === detalleId);
  if (!o) return { clase: "nada", elegido: null, candidatos: [], mensaje: "No entiendo qué objeto quieres.", leccion: "Elige un objeto para la instrucción." };

  const filtro = d?.filtra;
  const candidatos = ORDEN_LECTURA.filter((id) => o.alcanza.includes(id) && (!filtro || filtro.includes(id)));

  if (candidatos.length === 0) {
    return {
      clase: "nada",
      elegido: null,
      candidatos: [],
      mensaje: `«${fraseDe(verbo, objetoId, detalleId)}» → I can't find it.`,
      leccion:
        "En esta pantalla no hay nada que cumpla las dos condiciones a la vez. El detalle contradice al objeto: revisa dónde está de verdad lo que quieres señalar.",
    };
  }

  const primero = candidatos[0]!;
  const el = elementoPorId(primero)!;

  if (candidatos.length > 1) {
    const lista = candidatos.map((id) => `«${etiquetaDe(id)}»`).join(", ");
    return {
      clase: "ambigua",
      elegido: primero,
      candidatos,
      mensaje: `Encontré ${candidatos.length}: ${lista}. Obedecí el primero: «${el.etiqueta}». ${el.efecto}`,
      leccion:
        "La instrucción se entiende, pero admite otra lectura: la máquina toma el primero que encuentra. Añade el color, el nombre exacto o el lugar para que solo quede uno.",
    };
  }

  if (!el.acciones.includes(verbo)) {
    const sugerido = el.acciones[0]!;
    return {
      clase: "verbo",
      elegido: primero,
      candidatos,
      mensaje: `Encontré «${el.etiqueta}», pero no sé hacerle eso: nothing happens.`,
      leccion: `Ese elemento no acepta «${verbo}». Para «${el.etiqueta}» usa «${sugerido}». El verbo del imperativo también tiene que ser el correcto, no solo el objeto.`,
    };
  }

  if (primero !== objetivoId) {
    return {
      clase: "otro",
      elegido: primero,
      candidatos,
      mensaje: `Obedecí sin dudar: «${el.etiqueta}». ${el.efecto}`,
      leccion:
        "La instrucción era precisa —solo señalaba una cosa— pero señalaba la equivocada. Precisión y acierto no son lo mismo: relee la meta.",
    };
  }

  return {
    clase: "exito",
    elegido: primero,
    candidatos,
    mensaje: `Done: «${el.etiqueta}». ${el.efecto}`,
    leccion: "Una sola lectura posible y la correcta. Así es una instrucción completa: verbo + qué exactamente + dónde.",
  };
}

/* ═══════════════════════════════════════════════════════════════════════
 * MODO 2 — «Precisa o ambigua»
 * ═══════════════════════════════════════════════════════════════════════ */

export type Falta = "cuanto" | "cual" | "donde" | "tiempo" | "orden" | "herramienta";

export const FALTA_INFO: Record<Falta, { etq: string; pregunta: string; icono: string }> = {
  cuanto: { etq: "Cuánto", pregunta: "How much / How many?", icono: "fa-scale-balanced" },
  cual: { etq: "Cuál", pregunta: "Which one?", icono: "fa-hand-pointer" },
  donde: { etq: "Dónde", pregunta: "Where exactly?", icono: "fa-location-dot" },
  tiempo: { etq: "Cuánto tiempo", pregunta: "How long?", icono: "fa-stopwatch" },
  orden: { etq: "En qué orden", pregunta: "In what order?", icono: "fa-list-ol" },
  herramienta: { etq: "Con qué", pregunta: "With what?", icono: "fa-screwdriver-wrench" },
};

export const FALTAS: Falta[] = ["cuanto", "cual", "donde", "tiempo", "orden", "herramienta"];

export interface ParInstruccion {
  id: string;
  a: string;
  b: string;
  /** Cuál de las dos no admite otra lectura. */
  precisa: "a" | "b";
  /** Qué dato le falta a la otra. */
  falta: Falta;
  /** Por qué, en español, con el inglés citado. */
  porque: string;
}

export const PARES: ParInstruccion[] = [
  {
    id: "p1",
    a: "Add some salt to the water.",
    b: "Add half a teaspoon of salt to the water.",
    precisa: "b",
    falta: "cuanto",
    porque:
      "«some salt» puede ser una pizca o una cucharada: quien cocine decidirá por ti. «half a teaspoon» solo se puede leer de una forma. En una receta, la cantidad es parte de la instrucción.",
  },
  {
    id: "p2",
    a: "Press the green button on the right.",
    b: "Press the button.",
    precisa: "a",
    falta: "cual",
    porque:
      "Si en la pantalla hay tres botones, «the button» señala a los tres. El color y la posición («the green button on the right») dejan uno solo.",
  },
  {
    id: "p3",
    a: "Put the folder over there.",
    b: "Put the folder on the top shelf.",
    precisa: "b",
    falta: "donde",
    porque:
      "«over there» funciona si estás señalando con el dedo; por escrito no señala nada. Una instrucción escrita necesita el lugar dicho con palabras: «on the top shelf».",
  },
  {
    id: "p4",
    a: "Bake the bread for a while.",
    b: "Bake the bread for 25 minutes.",
    precisa: "b",
    falta: "tiempo",
    porque:
      "«for a while» no es una duración. En instrucciones el tiempo se dice con número: «for 25 minutes», «for ten seconds», «until it boils».",
  },
  {
    id: "p5",
    a: "Mix the ingredients and heat them.",
    b: "First, mix the ingredients. Then, heat them.",
    precisa: "b",
    falta: "orden",
    porque:
      "«and» junta dos acciones pero no dice cuál va antes. Los conectores de secuencia (First, Then, After that, Finally) fijan el orden y quitan la duda.",
  },
  {
    id: "p6",
    a: "Cut the onion with a sharp knife.",
    b: "Cut the onion.",
    precisa: "a",
    falta: "herramienta",
    porque:
      "Sin decir con qué, la instrucción admite cortar con lo que sea. «with a sharp knife» cierra esa lectura. Es el mismo caso de «stir it with a fork» o «open it with the app».",
  },
];

/* ═══════════════════════════════════════════════════════════════════════
 * MODO 3 — «Arregla la secuencia»
 * ═══════════════════════════════════════════════════════════════════════ */

export interface PasoProc {
  id: string;
  /** Conector verbatim del inglés de instrucciones; se queda FIJO en su ranura. */
  conector: string;
  /** El paso, sin el conector. */
  texto: string;
  traduccion: string;
  /** Pasos que tienen que haber ocurrido antes para que este tenga sentido. */
  requiere: string[];
  /** Lo que pasa si se ejecuta antes de tiempo (la máquina obedece igual). */
  fallo: string;
}

export interface Procedimiento {
  id: string;
  titulo: string;
  contexto: string;
  /** En el orden correcto. */
  pasos: PasoProc[];
  /** Orden inicial (revuelto) en que se le presentan al alumno. */
  inicial: string[];
  exito: string;
  icono: string;
}

export const PROCEDIMIENTOS: Procedimiento[] = [
  {
    id: "jamaica",
    titulo: "How to make agua de jamaica",
    contexto: "Le escribes la receta a una compañera de intercambio. Los conectores ya están en orden; los pasos no.",
    icono: "fa-mug-hot",
    pasos: [
      {
        id: "j1",
        conector: "First",
        texto: "boil one liter of water in a pot.",
        traduccion: "hierve un litro de agua en una olla.",
        requiere: [],
        fallo: "",
      },
      {
        id: "j2",
        conector: "Then",
        texto: "add two cups of dried hibiscus flowers and turn off the heat.",
        traduccion: "agrega dos tazas de flor de jamaica seca y apaga el fuego.",
        requiere: ["j1"],
        fallo: "Echas la flor de jamaica en una olla vacía: todavía no hay agua caliente.",
      },
      {
        id: "j3",
        conector: "After that",
        texto: "let the mixture rest for fifteen minutes.",
        traduccion: "deja reposar la mezcla quince minutos.",
        requiere: ["j2"],
        fallo: "Esperas quince minutos delante de una olla que no tiene la flor dentro.",
      },
      {
        id: "j4",
        conector: "Next",
        texto: "strain the liquid and add sugar to taste.",
        traduccion: "cuela el líquido y agrega azúcar al gusto.",
        requiere: ["j3"],
        fallo: "Cuelas un agua que no tiene nada que colar: no ha reposado con la flor.",
      },
      {
        id: "j5",
        conector: "Finally",
        texto: "serve it over ice with a slice of lime.",
        traduccion: "sírvela con hielo y una rodaja de limón.",
        requiere: ["j4"],
        fallo: "Sirves agua caliente sin color, sin sabor y sin azúcar.",
      },
    ],
    inicial: ["j3", "j1", "j5", "j2", "j4"],
    exito: "La jarra queda roja, fría y dulce. La instrucción se puede seguir sin preguntar nada.",
  },
  {
    id: "tarea",
    titulo: "How to upload your homework",
    contexto: "Le explicas a un compañero cómo entregar la tarea en la plataforma de la escuela.",
    icono: "fa-laptop",
    pasos: [
      {
        id: "u1",
        conector: "First",
        texto: "turn on the computer and open the browser.",
        traduccion: "enciende la computadora y abre el navegador.",
        requiere: [],
        fallo: "",
      },
      {
        id: "u2",
        conector: "Then",
        texto: "log in to the school platform with your username and password.",
        traduccion: "entra a la plataforma de la escuela con tu usuario y contraseña.",
        requiere: ["u1"],
        fallo: "No hay navegador abierto, así que no hay ninguna página donde escribir la contraseña.",
      },
      {
        id: "u3",
        conector: "After that",
        texto: "click on the Assignments section and choose today's task.",
        traduccion: "entra a la sección de tareas y elige la de hoy.",
        requiere: ["u2"],
        fallo: "No has iniciado sesión: la sección de tareas ni siquiera aparece en la pantalla.",
      },
      {
        id: "u4",
        conector: "Next",
        texto: "select your document and press the Upload button.",
        traduccion: "selecciona tu documento y pulsa el botón de subir.",
        requiere: ["u3"],
        fallo: "No estás dentro de la tarea: no hay ningún botón de subir en esta pantalla.",
      },
      {
        id: "u5",
        conector: "Finally",
        texto: "check that the file appears on the list and log out.",
        traduccion: "comprueba que el archivo aparece en la lista y cierra la sesión.",
        requiere: ["u4"],
        fallo: "Compruebas una lista vacía: todavía no has subido nada.",
      },
    ],
    inicial: ["u2", "u4", "u1", "u5", "u3"],
    exito: "El archivo aparece en la lista con la hora de entrega. Tu compañero entregó sin llamarte.",
  },
];

export interface ResultadoSim {
  /** Cuántos pasos se pudieron ejecutar antes de que algo no tuviera sentido. */
  okHasta: number;
  /** Paso que rompió la secuencia, o null si todo salió bien. */
  pasoFallo: string | null;
  fallo: string | null;
}

/**
 * Ejecuta la secuencia TAL COMO ESTÁ, sin corregirla. Es la demostración de
 * que los conectores en orden no garantizan nada: la máquina llega al primer
 * paso cuyo requisito no se ha cumplido y hace el ridículo.
 */
export function simular(proc: Procedimiento, orden: string[]): ResultadoSim {
  const hechos = new Set<string>();
  for (let i = 0; i < orden.length; i++) {
    const id = orden[i]!;
    const paso = proc.pasos.find((p) => p.id === id);
    if (!paso) continue;
    if (!paso.requiere.every((r) => hechos.has(r))) {
      return { okHasta: i, pasoFallo: paso.id, fallo: paso.fallo };
    }
    hechos.add(paso.id);
  }
  return { okHasta: orden.length, pasoFallo: null, fallo: null };
}

/* ═══════════════════════════════════════════════════════════════════════
 * MODO 4 — «Pide que te orienten»: la pregunta indirecta
 * ═══════════════════════════════════════════════════════════════════════ */

export interface PreguntaIndirecta {
  id: string;
  /** La pregunta directa, la que ya sabe hacer. */
  directa: string;
  /** Situación, en español. */
  contexto: string;
  /** Fórmula de cortesía que abre la pregunta indirecta (dada). */
  apertura: string;
  /** La continuación correcta, ficha por ficha. */
  solucion: string[];
  /** Fichas disponibles: la solución + trampas del orden directo. */
  fichas: string[];
  /** La regla que se aprende, en español. */
  regla: string;
  traduccion: string;
}

export const INDIRECTAS: PreguntaIndirecta[] = [
  {
    id: "q1",
    directa: "Where is the library?",
    contexto: "Estás en una escuela que no conoces y le preguntas a una persona de la administración.",
    apertura: "Could you tell me",
    solucion: ["where", "the library", "is"],
    fichas: ["is", "where", "the library"],
    regla:
      "En la pregunta indirecta el orden vuelve a ser el de una oración normal: sujeto + verbo. «Where IS THE LIBRARY?» → «…where THE LIBRARY IS».",
    traduccion: "¿Me podría decir dónde está la biblioteca?",
  },
  {
    id: "q2",
    directa: "How can I get to the bus station?",
    contexto: "Le preguntas a alguien en la calle cómo llegar a la central de autobuses.",
    apertura: "Do you know",
    solucion: ["how", "I", "can", "get to the bus station"],
    fichas: ["can", "how", "get to the bus station", "I"],
    regla: "El auxiliar «can» pasa a ir DESPUÉS del sujeto: «how CAN I» → «how I CAN».",
    traduccion: "¿Sabes cómo puedo llegar a la central de autobuses?",
  },
  {
    id: "q3",
    directa: "Where does the bus stop?",
    contexto: "Quieres saber en qué esquina se detiene el camión.",
    apertura: "Could you tell me",
    solucion: ["where", "the bus", "stops"],
    fichas: ["does", "where", "stops", "the bus", "stop"],
    regla: "El auxiliar «does» desaparece y el verbo recupera su «-s»: «does the bus STOP» → «the bus STOPS». Sobran dos fichas.",
    traduccion: "¿Me podrías decir dónde para el camión?",
  },
  {
    id: "q4",
    directa: "What time does the museum open?",
    contexto: "Llamas al museo para preguntar el horario.",
    apertura: "Do you know",
    solucion: ["what time", "the museum", "opens"],
    fichas: ["open", "the museum", "what time", "opens", "does"],
    regla: "Mismo caso que el anterior: sin «does», y «open» se convierte en «opens». Sobran dos fichas.",
    traduccion: "¿Sabes a qué hora abre el museo?",
  },
  {
    id: "q5",
    directa: "How do I turn on the projector?",
    contexto: "Le pides ayuda a la maestra para encender el proyector del salón.",
    apertura: "Could you tell me",
    solucion: ["how", "to turn on", "the projector"],
    fichas: ["I", "how", "the projector", "to turn on", "do"],
    regla:
      "Cuando pides una instrucción, «how + to + verbo» ahorra el sujeto y el auxiliar: «how DO I TURN ON» → «how TO TURN ON». Sobran dos fichas.",
    traduccion: "¿Me podría decir cómo se enciende el proyector?",
  },
  {
    id: "q6",
    directa: "Is there a pharmacy near here?",
    contexto: "Buscas una farmacia por la colonia y preguntas en una tienda.",
    apertura: "Do you know",
    solucion: ["if", "there", "is", "a pharmacy near here"],
    fichas: ["is there", "if", "a pharmacy near here", "is", "there"],
    regla:
      "Una pregunta de sí/no se introduce con «if» (o «whether»), y después el orden normal: «IS THERE a pharmacy…?» → «if THERE IS a pharmacy…». Sobra una ficha.",
    traduccion: "¿Sabes si hay una farmacia cerca de aquí?",
  },
];

/** La frase completa que quedó armada, para leerla o escucharla. */
export function fraseIndirecta(q: PreguntaIndirecta, piezas: (string | null)[]): string {
  const cuerpo = piezas.filter((p): p is string => p !== null).join(" ");
  return `${q.apertura} ${cuerpo}?`;
}

/* ═══════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM de la base de datos
 * ═══════════════════════════════════════════════════════════════════════ */

/** IN-III-P06-A1 — lectura «How to Give Instructions in English» (verbatim). */
export const LECTURA_A1: string[] = [
  "Giving clear instructions is one of the most practical uses of English in everyday life. Whether you are explaining a recipe, describing how to use an app, or guiding someone through a task at school or work, the ability to give step-by-step instructions clearly and in the right order is an essential skill.",
  "In English, instructions are given using the imperative form of the verb: the base form without a subject. This makes instructions direct and unambiguous. Open the document. Click on the menu. Select the file. Press enter. Type your name. The subject (you) is understood and does not need to be stated.",
  "Sequence connectors organize instructions so the listener or reader can follow them in order. First introduces the initial step. Then and next introduce the following steps. After that signals a step that depends on the one before it. Finally introduces the last step. For example: First, wash and peel the avocados. Then, mash them in a bowl with a fork. Next, add lime juice, salt, and chopped onion. After that, stir everything together. Finally, taste and adjust the seasoning.",
  "Instructions can be made more precise and helpful with modifiers. Use 'always' to indicate a step that must never be skipped: Always save your document before closing the program. Use 'make sure to' to emphasize a critical step: Make sure to stir the mixture slowly so it does not burn. Use 'be careful not to' for warnings: Be careful not to add too much chili, especially if you are cooking for children.",
  "Negative imperatives prevent mistakes: Do not press the red button before the system is ready. Never share your password with anyone, not even your friends. Do not open the oven before the timer goes off.",
  "In a Mexican school context, you might write instructions for a classmate on how to complete a digital assignment: how to upload a file to the school platform, how to format a document, or how to send an email to a teacher. In a kitchen context, you might translate a Mexican recipe into English instructions. Guacamole, agua de jamaica, and arroz con leche are classic recipes with clear, sequential steps that make excellent practice for writing instructions.",
  "Practice: choose one Mexican recipe or one digital task and write clear instructions in English using at least six steps with appropriate sequence connectors.",
];

/** Recuadro «¿Sabías que…?» de A1 (verbatim). */
export const RECUADRO_A1 =
  "The recipe format is one of the oldest types of written instruction in human history. Some of the oldest known recipes are Mesopotamian clay tablets from around 1700 BCE (the Yale Culinary Tablets) describing how to prepare stews and other dishes. Today, food recipe videos are among the most watched content on the internet globally, proving that the instruction format is timeless and universally useful.";

/** Preguntas de comprensión de A1 (verbatim, con su respuesta guía). */
export const PREGUNTAS_A1: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: "Why do we use the imperative form to give instructions? Give three examples.",
    respuesta: "Because instructions are direct commands where the subject (you) is understood. Examples: Open the file. Click the button. Press enter.",
  },
  {
    pregunta: "What is the function of sequence connectors in instructions? List five in order.",
    respuesta: "They organize steps so the listener can follow them correctly. First, then, next, after that, finally.",
  },
  {
    pregunta: 'What is the difference between a negative imperative and a warning with "be careful not to"?',
    respuesta:
      'A negative imperative (Do not..., Never...) prohibits an action directly. "Be careful not to" is softer and warns of an undesirable consequence if the action is done incorrectly.',
  },
];

/** IN-III-P06-A3 — quiz evaluable (verbatim). */
export const QUIZ_A3: QuizEvaluable = {
  titulo: "Quiz: Imperatives and Connectors",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Which is a correct imperative sentence?",
      opciones: ["Open the window, please.", "You must open the window, please.", "You open the window, please.", "Opening the window, please."],
      respuestaCorrecta: 0,
      retroalimentacion: "Imperatives use the base verb without a subject: 'Open the window.' Adding 'please' makes it more polite.",
    },
    {
      enunciado: "Which connector introduces the LAST step in a sequence?",
      opciones: ["First", "Finally", "After that", "Then"],
      respuestaCorrecta: 1,
      retroalimentacion: "'Finally' (or 'In the end') signals the last step in a sequence of instructions or events.",
    },
    {
      enunciado: "Choose the correct negative imperative:",
      opciones: ["Don't to touch the screen.", "Don't touch the screen.", "You not touch the screen.", "Not touch the screen."],
      respuestaCorrecta: 1,
      retroalimentacion: "Negative imperatives: Don't + base verb. 'Don't touch the screen' = está prohibido tocar la pantalla.",
    },
    {
      enunciado: "Which sentence uses a connector INCORRECTLY for instructions?",
      opciones: [
        "Finally, let it cool before serving.",
        "First, wash your hands.",
        "Suddenly, stir the mixture for two minutes.",
        "Then, add the ingredients.",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "'Suddenly' is used for unexpected events in stories, not for planned steps in instructions. Use 'After that' or 'Next' instead.",
    },
    {
      enunciado: "'___ that, let the dough rest for 30 minutes.' Which connector fits best?",
      opciones: ["Suddenly", "First", "After", "In the end"],
      respuestaCorrecta: 2,
      retroalimentacion: "'After that' (often shortened to 'after') connects sequential steps in instructions.",
    },
  ],
};

/** IN-III-P06-A4 — verdadero/falso (verbatim). */
export const HECHOS_A4: { enunciado: string; respuesta: boolean; retro: string }[] = [
  {
    enunciado: "El imperativo en inglés usa el verbo base sin sujeto ('Open your book').",
    respuesta: true,
    retro: "Correcto: el imperativo no lleva sujeto: Open / Close / Read.",
  },
  {
    enunciado: "'First', 'then', 'after that' y 'finally' son conectores secuenciales.",
    respuesta: true,
    retro: "Sí: organizan los pasos de una instrucción en orden.",
  },
  {
    enunciado: "'Don't touch that' es la forma negativa del imperativo.",
    respuesta: true,
    retro: "Correcto: Don't + verbo base para prohibir o advertir.",
  },
  {
    enunciado: "'Finally' se usa al principio de las instrucciones.",
    respuesta: false,
    retro: "'Finally' se usa al final, para el último paso. 'First' va al principio.",
  },
  {
    enunciado: "'After that' significa 'después de eso' y conecta dos pasos consecutivos.",
    respuesta: true,
    retro: "Correcto: es un conector de secuencia entre pasos.",
  },
];

/** IN-III-P06-A5 — glosario (verbatim). */
export const GLOSARIO_A5: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "imperative (affirmative)", definicion: "Verbo base sin sujeto para dar instrucciones: Open, Close, Write, Read.", ejemplo: "Open the window, please." },
  { termino: "imperative (negative)", definicion: "Don't + verbo base para prohibir o advertir.", ejemplo: "Don't forget your password." },
  { termino: "First / Then", definicion: "Conectores: primero / después — para el 1er y 2do paso.", ejemplo: "First, turn on the computer. Then, enter your username." },
  { termino: "After that / Next", definicion: "Conectores: después de eso / a continuación — pasos intermedios.", ejemplo: "After that, open the application." },
  { termino: "Finally", definicion: "Conector: finalmente — para el último paso.", ejemplo: "Finally, save your work." },
  {
    termino: "instructions vocabulary",
    definicion: "Verbos comunes en instrucciones: click, press, add, mix, cut, turn on/off.",
    ejemplo: "Press the button and then add your name.",
  },
];

/** Tarea final del glosario A5 (verbatim). */
export const TAREA_A5 = "Escribe las instrucciones para preparar tu bebida favorita (5 pasos) usando First, Then, After that y Finally.";

export const NOTA_PRACTICA =
  "Verbatim de la progresión IN-III-P06: la lectura y su recuadro (A1), el texto con huecos (A2), el quiz evaluable (A3), los hechos verdadero/falso (A4) y el glosario (A5). La pantalla de la plataforma, los seis pares precisa/ambigua, los dos procedimientos y las seis preguntas indirectas son material nuevo escrito para esta práctica en inglés estadounidense estándar; los nombres de archivo y la plataforma son ficticios. Las preguntas indirectas (Could you tell me… / Do you know…) no están en las actividades de la base: se añadieron porque el propósito de la progresión también pide PEDIR instrucciones, no solo darlas.";
