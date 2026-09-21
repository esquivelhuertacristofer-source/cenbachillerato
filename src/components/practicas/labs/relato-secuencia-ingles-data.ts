/**
 * Datos y modelo del laboratorio 3D "Telling a story" (IN-III-P07, Inglés III:
 * «Relata eventos cotidianos y su secuencia»).
 *
 * Anclas VERBATIM (IN-III-P07):
 *   - A1 lectura «Telling a Story in the Past»: marco teórico, preguntas y la
 *     historia de la abuela (sin las glosas en español entre paréntesis).
 *   - A10 ordenar_secuencia «Tell the story in order»: la historia del camión
 *     perdido, con sus marcas y explicaciones (modo 1).
 *   - A2 fill_blanks «Narrative Connectors»: Completa el texto.
 *   - A4 verdadero/falso: reto evaluable. A5 glosario. A3 pistas de escritura.
 * Inspiración (IN-IV-P01 e IN-IV-P07): past continuous con while/when, la
 * anécdota del perro suelto (A6) y los hechos de sus quizzes A4 (verbatim).
 *
 * Lo que NO es verbatim (la historia del tianguis del modo 2, las escenas del
 * perro del modo 3, las explicaciones de por qué un orden es incoherente y el
 * banco «¿Qué pasó primero?») es material didáctico escrito para el lab, con
 * personajes y lugares ficticios.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "orden" | "conectar" | "escribir";
export const MODOS: Modo[] = ["orden", "conectar", "escribir"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  orden: { etq: "Put the story in order", subtitulo: "Ordena las viñetas y reprodúcelas", icono: "fa-film", color: "#f59e0b" },
  conectar: { etq: "Connect the events", subtitulo: "Conectores y verbos en pasado", icono: "fa-link", color: "#38bdf8" },
  escribir: { etq: "Tell your version", subtitulo: "Escribe tu relato escena por escena", icono: "fa-pen-nib", color: "#a78bfa" },
};

/* ── Utilidades ───────────────────────────────────────────────────────── */

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function barajar<T>(xs: T[], rnd: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/**
 * Normaliza lo que escribe el alumno: minúsculas, apóstrofos tipográficos,
 * contracciones negativas expandidas («didn't» = «did not», también «didnt»),
 * sin puntuación y con espacios simples.
 */
export function normalizaIngles(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’´`]/g, "'")
    .replace(/\b(did|was|were|could|do|does)n'?t\b/g, "$1 not")
    .replace(/\bcan'?t\b/g, "can not")
    .replace(/\bcannot\b/g, "can not")
    .replace(/[.,;:!?¡¿"()“”«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** ¿Aparece `frase` (una o varias palabras) como palabras completas en `texto` normalizado? */
export function contieneFrase(textoNorm: string, frase: string): boolean {
  const f = normalizaIngles(frase);
  if (!f) return false;
  return ` ${textoNorm} `.includes(` ${f} `);
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 1 · PUT THE STORY IN ORDER
 * ════════════════════════════════════════════════════════════════════════ */

export type EscenaId =
  | "b-despierta"
  | "b-corre"
  | "b-parada"
  | "b-camina"
  | "b-clase"
  | "b-promesa"
  | "g-visita"
  | "g-tamales"
  | "g-cuentos"
  | "g-vecinos"
  | "g-musica"
  | "d-camino"
  | "d-perro"
  | "d-gato"
  | "d-dueno"
  | "d-escuela";

export interface PasoHistoria {
  escena: EscenaId;
  /** Marca/conector verbatim. */
  marca: string;
  /** Oración verbatim. */
  texto: string;
  /** Explicación verbatim de por qué va ahí. */
  explicacion: string;
  /** Índices de los pasos que deben ocurrir ANTES (coherencia temporal). */
  requiere: number[];
  /** Por qué no puede ir antes de sus requisitos (didáctico, no verbatim). */
  porQue: string;
  /** Rótulo corto en español para la viñeta. */
  rotulo: string;
}

export interface Historia {
  id: "camion" | "abuela";
  etq: string;
  titulo: string;
  ancla: string;
  instrucciones: string;
  pasos: PasoHistoria[];
  /** Orden inicial desordenado (índices de pasos por posición). */
  ordenInicial: number[];
  epilogo?: string;
}

export const HISTORIAS: Historia[] = [
  {
    id: "camion",
    etq: "The day I missed the bus",
    titulo: "Tell the story in order",
    ancla: "IN-III-P07-A10 · ordenar secuencia",
    instrucciones:
      "Las oraciones cuentan lo que pasó ayer, pero están desordenadas. Los conectores (first, then, after that, finally) son la pista: en inglés marcan la secuencia igual que en español.",
    ordenInicial: [3, 0, 5, 2, 4, 1],
    pasos: [
      {
        escena: "b-despierta",
        marca: "First",
        texto: "First, I woke up late because my alarm didn't ring.",
        explicacion: "'First' abre la secuencia. Además, el pasado simple ('woke', 'didn't ring') sitúa todo el relato.",
        requiere: [],
        porQue: "«First» abre el relato: todo lo demás pasa porque te despertaste tarde.",
        rotulo: "Se despierta tarde",
      },
      {
        escena: "b-corre",
        marca: "Then",
        texto: "Then, I ran to the bus stop without breakfast.",
        explicacion: "'Then' encadena la acción siguiente a la anterior.",
        requiere: [0],
        porQue: "Corriste sin desayunar PORQUE te despertaste tarde: primero va la causa y después el efecto. Además, «Then» necesita una acción anterior.",
        rotulo: "Corre a la parada",
      },
      {
        escena: "b-parada",
        marca: "When",
        texto: "When I arrived, the bus had already left.",
        explicacion: "El past perfect ('had left') marca algo anterior a otro pasado: el camión se fue ANTES de que llegara.",
        requiere: [1],
        porQue: "Para llegar a la parada («When I arrived») primero tuviste que correr hacia ella.",
        rotulo: "El camión ya se fue",
      },
      {
        escena: "b-camina",
        marca: "After that",
        texto: "After that, I walked twenty minutes to school.",
        explicacion: "'After that' señala consecuencia temporal de lo anterior.",
        requiere: [2],
        porQue: "Caminaste a la escuela PORQUE el camión ya se había ido: el efecto no puede ir antes que su causa. «After that» se refiere a lo que acaba de pasar.",
        rotulo: "Camina 20 minutos",
      },
      {
        escena: "b-clase",
        marca: "—",
        texto: "I got to class late, but the teacher understood.",
        explicacion: "El resultado de la cadena. 'but' introduce el contraste con lo que se esperaba.",
        requiere: [3],
        porQue: "Llegar tarde a clase es el resultado de caminar veinte minutos: primero caminas y después llegas.",
        rotulo: "Llega tarde a clase",
      },
      {
        escena: "b-promesa",
        marca: "Finally",
        texto: "Finally, I promised myself to set two alarms.",
        explicacion: "'Finally' cierra el relato con la conclusión de quien lo cuenta.",
        requiere: [0, 1, 2, 3, 4],
        porQue: "«Finally» cierra el relato: la promesa de poner dos alarmas es la conclusión y solo tiene sentido después de todo lo que pasó.",
        rotulo: "La promesa",
      },
    ],
  },
  {
    id: "abuela",
    etq: "A visit to my grandmother",
    titulo: "Example story (lectura A1)",
    ancla: "IN-III-P07-A1 · historia de ejemplo",
    instrucciones:
      "La historia de ejemplo de la lectura A1, desordenada. Aquí hay dos órdenes válidos: busca cuáles eventos dependen de otros y cuáles podrían intercambiarse.",
    ordenInicial: [4, 2, 0, 3, 1],
    epilogo: "It was a wonderful evening.",
    pasos: [
      {
        escena: "g-visita",
        marca: "Last Saturday",
        texto: "Last Saturday, I went to visit my grandmother.",
        explicacion: "La expresión de tiempo «Last Saturday» sitúa el relato en el pasado y lo abre; went es el pasado irregular de go.",
        requiere: [],
        porQue: "Primero llegas a casa de la abuela («Last Saturday, I went…») y después pasa todo lo demás.",
        rotulo: "Visita a la abuela",
      },
      {
        escena: "g-tamales",
        marca: "First",
        texto: "First, we ate tamales and drank atole.",
        explicacion: "«First» marca el primer evento de la visita; ate (eat) y drank (drink) son pasados irregulares.",
        requiere: [0],
        porQue: "Comen tamales EN LA CASA de la abuela: antes tienes que haber llegado. «First» marca lo primero que hicieron ya juntos.",
        rotulo: "Tamales y atole",
      },
      {
        escena: "g-cuentos",
        marca: "Then",
        texto: "Then she told me old stories about our town.",
        explicacion: "«Then» encadena el evento siguiente; told es el pasado irregular de tell.",
        requiere: [0, 1],
        porQue: "«Then» significa «luego»: necesita un evento anterior, y «First» ya marcó cuál fue el primero.",
        rotulo: "Cuentos del pueblo",
      },
      {
        escena: "g-vecinos",
        marca: "Suddenly",
        texto: "Suddenly, we saw our neighbors arriving with a guitar.",
        explicacion: "«Suddenly» introduce algo inesperado; saw es el pasado irregular de see.",
        requiere: [0, 1],
        porQue: "Lo inesperado («Suddenly») interrumpe algo que ya estaba pasando: no puede ocurrir antes de lo primero que hicieron («First»).",
        rotulo: "¡Llegan los vecinos!",
      },
      {
        escena: "g-musica",
        marca: "In the end",
        texto: "In the end, we all made music together until midnight.",
        explicacion: "«In the end» cierra el relato; made es el pasado irregular de make.",
        requiere: [0, 1, 2, 3],
        porQue: "«In the end» cierra el relato. Además, hacen música con la guitarra que trajeron los vecinos: primero tienen que llegar.",
        rotulo: "Música hasta medianoche",
      },
    ],
  },
];

/** Resultado de revisar un orden: la primera posición incoherente, si la hay. */
export interface RevisionOrden {
  coherente: boolean;
  /** Posición (0-based) donde se rompe la coherencia. */
  posicion: number | null;
  /** Paso colocado en esa posición. */
  paso: number | null;
  /** Paso que debía ocurrir antes y quedó después. */
  falta: number | null;
}

export function revisarOrden(h: Historia, orden: number[]): RevisionOrden {
  const vistos = new Set<number>();
  for (let pos = 0; pos < orden.length; pos++) {
    const i = orden[pos]!;
    const falta = h.pasos[i]!.requiere.find((r) => !vistos.has(r));
    if (falta !== undefined) return { coherente: false, posicion: pos, paso: i, falta };
    vistos.add(i);
  }
  return { coherente: true, posicion: null, paso: null, falta: null };
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 2 · CONNECT THE EVENTS — la historia del tianguis (didáctica)
 * ════════════════════════════════════════════════════════════════════════ */

export type Relacion = "inicio" | "secuencia" | "despues" | "sorpresa" | "mientras" | "interrupcion" | "consecuencia" | "causa" | "cierre";

export const RELACION_DEF: Record<Relacion, { etq: string; color: string; icono: string; regla: string }> = {
  inicio: { etq: "Inicio", color: "#34d399", icono: "fa-flag", regla: "«First» abre la secuencia: marca el primer evento." },
  secuencia: { etq: "Secuencia", color: "#38bdf8", icono: "fa-arrow-right", regla: "«Then» / «After that» encadenan el evento siguiente al anterior." },
  despues: { etq: "Más tarde", color: "#60a5fa", icono: "fa-clock", regla: "«Later» = más tarde: pasó un tiempo entre los dos eventos." },
  sorpresa: { etq: "Sorpresa", color: "#facc15", icono: "fa-bolt", regla: "«Suddenly» = de repente: introduce algo inesperado." },
  mientras: { etq: "Simultaneidad", color: "#c084fc", icono: "fa-layer-group", regla: "«While» + past continuous (was/were + -ing) = una acción en progreso durante la cual pasa otra cosa (past simple)." },
  interrupcion: { etq: "Interrupción", color: "#e879f9", icono: "fa-phone-volume", regla: "Past continuous + «when» + past simple: la acción en progreso queda interrumpida por un evento breve." },
  consecuencia: { etq: "Consecuencia", color: "#fb923c", icono: "fa-arrow-right-long", regla: "«so» introduce la CONSECUENCIA: el resultado de lo anterior." },
  causa: { etq: "Causa", color: "#f472b6", icono: "fa-arrow-left-long", regla: "«because» introduce la CAUSA: lo que provocó lo otro (ocurrió antes, aunque en la oración vaya después)." },
  cierre: { etq: "Cierre", color: "#34d399", icono: "fa-flag-checkered", regla: "«In the end» / «Finally» cierran el relato." },
};

export type Parte = string | { hueco: "C" } | { hueco: "V" };

export interface ItemConectar {
  id: string;
  /** Oración con dos huecos: C (conector) y V (verbo). */
  partes: Parte[];
  conector: string;
  /** Opciones de conector (incluye la correcta). */
  opciones: string[];
  /** Por qué NO va cada opción incorrecta (clave = opción). */
  porQueNo: Record<string, string>;
  /** Verbo base mostrado entre paréntesis. */
  base: string;
  respuestas: string[];
  irregular: boolean;
  /** Pista del verbo (no delata la respuesta). */
  pista: string;
  relacion: Relacion;
  /** Rótulo del evento en la línea del tiempo (inglés). */
  evento: string;
  /** Acción de fondo (past continuous) para mientras/interrupción. */
  fondo?: string;
  icono: string;
}

export const EVENTO_INICIAL = { texto: "Last Sunday, Sofía went to the tianguis (street market) with her brother Diego.", evento: "went to the tianguis", icono: "fa-store" };

export const ITEMS: ItemConectar[] = [
  {
    id: "fruta",
    partes: [{ hueco: "C" }, ", they ", { hueco: "V" }, " fruit and fresh juice."],
    conector: "First",
    opciones: ["First", "Suddenly", "Because", "While"],
    porQueNo: {
      Suddenly: "Comprar fruta no es algo inesperado, y es lo primero que hacen en el tianguis: usa «First».",
      Because: "«Because» introduce una causa y necesita el efecto en la misma oración («…because they were thirsty»). Aquí la oración abre la secuencia.",
      While: "«While» pide past continuous (they were buying) y otra acción al mismo tiempo en la misma oración.",
    },
    base: "buy",
    respuestas: ["bought"],
    irregular: true,
    pista: "Es irregular: no termina en -ed (rima con «thought»).",
    relacion: "inicio",
    evento: "bought fruit and juice",
    icono: "fa-apple-whole",
  },
  {
    id: "tacos",
    partes: [{ hueco: "C" }, ", they ", { hueco: "V" }, " tacos at a small stand."],
    conector: "Then",
    opciones: ["Then", "While", "Finally", "Because"],
    porQueNo: {
      While: "«While they ate tacos» no es una oración completa: «While» presenta una acción de fondo y necesita otra acción que pase durante ella.",
      Finally: "«Finally» cierra el relato, y la historia apenas empieza.",
      Because: "«Because» une una causa con su efecto dentro de la oración; aquí solo cuentas lo siguiente que hicieron.",
    },
    base: "eat",
    respuestas: ["ate"],
    irregular: true,
    pista: "Es irregular: tres letras, empieza con «a».",
    relacion: "secuencia",
    evento: "ate tacos",
    icono: "fa-utensils",
  },
  {
    id: "amigo",
    partes: [{ hueco: "C" }, " they were eating, Diego ", { hueco: "V" }, " a friend from school."],
    conector: "While",
    opciones: ["While", "So", "Then", "In the end"],
    porQueNo: {
      So: "«So» introduce una consecuencia, pero comer no causa que Diego vea a un amigo: las dos cosas pasan al mismo tiempo.",
      Then: "«Then» marca la acción siguiente y va con past simple; «they were eating» es una acción en progreso: usa «While».",
      "In the end": "«In the end» cierra el relato; aquí describes dos acciones simultáneas.",
    },
    base: "see",
    respuestas: ["saw"],
    irregular: true,
    pista: "Es irregular: past simple de «see» (no «seed» ni «seen»).",
    relacion: "mientras",
    evento: "saw a friend",
    fondo: "were eating",
    icono: "fa-user-group",
  },
  {
    id: "lluvia",
    partes: [{ hueco: "C" }, ", it ", { hueco: "V" }, " to rain."],
    conector: "Suddenly",
    opciones: ["Suddenly", "First", "Because", "While"],
    porQueNo: {
      First: "«First» abre el relato y ya pasaron varias cosas antes.",
      Because: "«Because» introduce una causa y necesita el efecto en la misma oración.",
      While: "«While» pide past continuous (it was raining) y otra acción al mismo tiempo.",
    },
    base: "start",
    respuestas: ["started", "began"],
    irregular: false,
    pista: "Es regular: verbo base + -ed.",
    relacion: "sorpresa",
    evento: "it started to rain",
    icono: "fa-cloud-rain",
  },
  {
    id: "cafe",
    partes: ["It was raining hard, ", { hueco: "C" }, " they ", { hueco: "V" }, " inside a café."],
    conector: "so",
    opciones: ["so", "because", "while", "first"],
    porQueNo: {
      because: "«because» introduce la CAUSA, pero «they ran inside a café» es la CONSECUENCIA de la lluvia: usa «so».",
      while: "«while» indica simultaneidad; aquí una cosa provoca la otra.",
      first: "«first» no une dos oraciones, y este ya no es el primer evento.",
    },
    base: "run",
    respuestas: ["ran"],
    irregular: true,
    pista: "Es irregular: cambia la vocal (r_n).",
    relacion: "consecuencia",
    evento: "ran inside a café",
    icono: "fa-mug-hot",
  },
  {
    id: "espera",
    partes: ["They waited there for an hour ", { hueco: "C" }, " the rain ", { hueco: "V" }, "."],
    conector: "because",
    opciones: ["because", "so", "then", "when"],
    porQueNo: {
      so: "«so» introduciría una consecuencia, pero que la lluvia no parara es la CAUSA de la espera: usa «because». Ojo: en la oración el efecto va primero y la causa después; en el tiempo, la causa ocurre antes.",
      then: "«then» pondría «the rain didn't stop» después de esperar; en realidad es la razón de la espera.",
      when: "«when» marca un momento puntual; aquí explicas por qué esperaron.",
    },
    base: "not stop",
    respuestas: ["didn't stop", "did not stop"],
    irregular: false,
    pista: "Es negativa en pasado: did not (didn't) + verbo base.",
    relacion: "causa",
    evento: "waited an hour",
    fondo: "the rain didn't stop",
    icono: "fa-hourglass-half",
  },
  {
    id: "telefono",
    partes: ["Sofía was paying for the coffee ", { hueco: "C" }, " her phone ", { hueco: "V" }, "."],
    conector: "when",
    opciones: ["when", "while", "so", "after that"],
    porQueNo: {
      while: "«while» acompaña a la acción en progreso (was paying). La llamada es un evento breve en past simple: usa «when».",
      so: "Pagar el café no provoca que suene el teléfono: fue una interrupción, no una consecuencia.",
      "after that": "«after that» pondría la llamada después de pagar; «was paying» indica que la llamada llegó mientras pagaba.",
    },
    base: "ring",
    respuestas: ["rang"],
    irregular: true,
    pista: "Es irregular: ring → r_ng (cambia la vocal).",
    relacion: "interrupcion",
    evento: "her phone rang",
    fondo: "was paying",
    icono: "fa-phone-volume",
  },
  {
    id: "camion",
    partes: [{ hueco: "C" }, ", they ", { hueco: "V" }, " the bus home."],
    conector: "Later",
    opciones: ["Later", "While", "Because", "First"],
    porQueNo: {
      While: "«While» necesita past continuous y otra acción simultánea.",
      Because: "«Because» introduce una causa; aquí solo cuentas lo que pasó más tarde.",
      First: "«First» abre el relato; tomar el camión a casa es de lo último que pasó.",
    },
    base: "take",
    respuestas: ["took"],
    irregular: true,
    pista: "Es irregular: take → t__k.",
    relacion: "despues",
    evento: "took the bus home",
    icono: "fa-bus",
  },
  {
    id: "casa",
    partes: [{ hueco: "C" }, ", they ", { hueco: "V" }, " home wet but happy."],
    conector: "In the end",
    opciones: ["In the end", "Suddenly", "While", "So"],
    porQueNo: {
      Suddenly: "Llegar a casa no es inesperado: es el final de la historia. Usa «In the end».",
      While: "«While» presenta una acción de fondo en progreso; esta oración cierra la historia.",
      So: "«So» presenta la consecuencia de algo inmediato; para cerrar el relato usa «In the end».",
    },
    base: "get",
    respuestas: ["got"],
    irregular: true,
    pista: "Es irregular: get → g_t.",
    relacion: "cierre",
    evento: "got home wet but happy",
    icono: "fa-house",
  },
];

/** Oración completa (con las respuestas) de un reactivo. */
export function oracionCompleta(it: ItemConectar): string {
  return it.partes.map((p) => (typeof p === "string" ? p : p.hueco === "C" ? it.conector : it.respuestas[0]!)).join("");
}

/** Pasados regularizados por error → forma correcta. */
export const SOBRE_REGULARIZADOS: Record<string, string> = {
  goed: "went",
  runned: "ran",
  eated: "ate",
  buyed: "bought",
  maked: "made",
  taked: "took",
  telled: "told",
  catched: "caught",
  comed: "came",
  finded: "found",
  getted: "got",
  sayed: "said",
  thinked: "thought",
  gived: "gave",
  writed: "wrote",
  knowed: "knew",
  drinked: "drank",
  leaved: "left",
  feeled: "felt",
  meeted: "met",
  haved: "had",
  bringed: "brought",
  teached: "taught",
  waked: "woke",
  ringed: "rang",
  seed: "saw",
  sawed: "saw",
};

export interface RevisionVerbo {
  ok: boolean;
  msg: string;
}

/** Revisa el verbo de un reactivo del modo 2 con retroalimentación que enseña. */
export function revisarVerbo(it: ItemConectar, valor: string, intento: number): RevisionVerbo {
  const v = normalizaIngles(valor);
  if (!v) return { ok: false, msg: "Escribe el verbo en pasado." };
  if (it.respuestas.some((r) => normalizaIngles(r) === v)) {
    return { ok: true, msg: `${it.base} → ${it.respuestas[0]}${it.irregular ? " (irregular)" : ""}.` };
  }
  const revela = intento >= 2 ? ` La forma correcta es «${it.respuestas[0]}».` : "";
  if (it.id === "espera") {
    if (/^did not \w+ed$/.test(v)) return { ok: false, msg: `Después de «didn't» va el verbo BASE, sin -ed: didn't + stop.${revela}` };
    if (v === "stopped") return { ok: false, msg: `La oración es negativa: la lluvia NO paró. En pasado se niega con didn't + verbo base.${revela}` };
    if (v === "not stop" || v === "not stopped" || v === "no stop") return { ok: false, msg: `En inglés la negación del pasado necesita el auxiliar «did»: did not (didn't) + stop.${revela}` };
    return { ok: false, msg: `Negativa en pasado = did not (didn't) + verbo base.${revela}` };
  }
  const sobre = SOBRE_REGULARIZADOS[v];
  if (sobre) return { ok: false, msg: `«${it.base}» es irregular: su pasado no lleva -ed.${revela || " Piensa en su forma especial."}` };
  if (v === it.base || v === `${it.base}s` || v === `${it.base}es`) {
    return { ok: false, msg: `Estás narrando en pasado: «${v}» es presente. ${it.irregular ? "Este verbo es irregular." : "Agrega -ed."}${revela}` };
  }
  if (/^(was|were) \w+ing$/.test(v) || /ing$/.test(v)) {
    return { ok: false, msg: `Aquí va past simple: es un evento breve y completo, no una acción en progreso.${revela}` };
  }
  if (v === `${it.base}ed` || v === `${it.base}d`) return { ok: false, msg: `«${it.base}» es irregular: no se forma con -ed.${revela}` };
  return { ok: false, msg: `${it.pista}${revela}` };
}

/** ¿El conector elegido es el correcto? (sin distinguir mayúsculas). */
export function conectorCorrecto(it: ItemConectar, elegido: string): boolean {
  return normalizaIngles(elegido) === normalizaIngles(it.conector);
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 3 · TELL YOUR VERSION — la anécdota del perro suelto
 * (inspirada en IN-IV-P07-A6; escenas y ejemplo escritos para el lab)
 * ════════════════════════════════════════════════════════════════════════ */

export interface EscenaRelato {
  escena: EscenaId;
  titulo: string;
  /** Palabras guía en inglés (lo que se ve en la viñeta). */
  guia: string;
  /** Verbos base sugeridos. */
  verbos: string[];
  /** Formas en pasado aceptadas para esta escena (simple o continuo). */
  pasados: string[];
  /** Formas en presente que delatan que el alumno no narró en pasado. */
  presentes: { forma: string; pasado: string }[];
  sugeridos: string[];
  ejemplo: string;
}

export const ESCENAS_RELATO: EscenaRelato[] = [
  {
    escena: "d-camino",
    titulo: "Camino a la escuela",
    guia: "walk to school · backpack · morning",
    verbos: ["walk", "go"],
    pasados: ["walked", "went", "was walking", "were walking", "was going", "were going", "left"],
    presentes: [
      { forma: "walk", pasado: "walked" },
      { forma: "walks", pasado: "walked" },
      { forma: "go", pasado: "went" },
      { forma: "goes", pasado: "went" },
      { forma: "leave", pasado: "left" },
    ],
    sugeridos: ["First", "One morning", "Last Monday"],
    ejemplo: "First, I walked to school with my backpack.",
  },
  {
    escena: "d-perro",
    titulo: "El perro suelto",
    guia: "see · my neighbor's dog · running in the street",
    verbos: ["see", "notice"],
    pasados: ["saw", "noticed", "spotted", "watched", "found", "heard"],
    presentes: [
      { forma: "see", pasado: "saw" },
      { forma: "sees", pasado: "saw" },
      { forma: "notice", pasado: "noticed" },
      { forma: "find", pasado: "found" },
      { forma: "watch", pasado: "watched" },
    ],
    sugeridos: ["While", "When", "Then"],
    ejemplo: "While I was walking, I saw my neighbor's dog in the street.",
  },
  {
    escena: "d-gato",
    titulo: "¡Un gato!",
    guia: "chase · a cat · into a garden",
    verbos: ["chase", "run"],
    pasados: ["chased", "started chasing", "started to chase", "began chasing", "began to chase", "ran", "followed", "jumped", "was chasing"],
    presentes: [
      { forma: "chase", pasado: "chased" },
      { forma: "chases", pasado: "chased" },
      { forma: "run", pasado: "ran" },
      { forma: "runs", pasado: "ran" },
      { forma: "follow", pasado: "followed" },
      { forma: "follows", pasado: "followed" },
    ],
    sugeridos: ["Suddenly"],
    ejemplo: "Suddenly, the dog started chasing a cat into a garden.",
  },
  {
    escena: "d-dueno",
    titulo: "Llega el dueño",
    guia: "the owner · come / show up · catch the dog",
    verbos: ["come", "show up", "catch"],
    pasados: ["came", "showed up", "caught", "arrived", "took", "called", "grabbed", "ran", "got"],
    presentes: [
      { forma: "come", pasado: "came" },
      { forma: "comes", pasado: "came" },
      { forma: "show up", pasado: "showed up" },
      { forma: "shows up", pasado: "showed up" },
      { forma: "catch", pasado: "caught" },
      { forma: "catches", pasado: "caught" },
      { forma: "arrive", pasado: "arrived" },
      { forma: "arrives", pasado: "arrived" },
    ],
    sugeridos: ["Then", "After that"],
    ejemplo: "After that, the owner showed up and caught the dog.",
  },
  {
    escena: "d-escuela",
    titulo: "En la escuela",
    guia: "arrive at school late · tell my friends",
    verbos: ["arrive", "tell"],
    pasados: ["arrived", "got", "told", "laughed", "was", "were", "felt", "explained", "said"],
    presentes: [
      { forma: "arrive", pasado: "arrived" },
      { forma: "arrives", pasado: "arrived" },
      { forma: "tell", pasado: "told" },
      { forma: "tells", pasado: "told" },
      { forma: "get", pasado: "got" },
      { forma: "gets", pasado: "got" },
      { forma: "laugh", pasado: "laughed" },
    ],
    sugeridos: ["In the end", "Finally"],
    ejemplo: "In the end, I arrived at school late, but I told my friends a funny story.",
  },
];

/** Conectores narrativos que el lab reconoce en la escritura libre. */
export const CONECTORES_RELATO = ["after that", "in the end", "first", "then", "next", "later", "suddenly", "when", "while", "because", "so", "finally"];
const ABREN = ["first", "one morning", "one day", "last monday", "last week", "yesterday"];
const ENCADENAN = ["then", "after that", "next", "later"];
const CIERRAN = ["finally", "in the end"];
const NO_EXCEPCIONES_ED = new Set(["need", "feed", "seed", "speed", "bleed", "breed", "proceed", "succeed", "exceed", "bed", "red", "shed"]);

export interface RevisionOracion {
  ok: boolean;
  /** Problemas que impiden aprobar la oración (en español). */
  errores: string[];
  /** Consejos que no bloquean. */
  consejos: string[];
  verbo: string | null;
  conectores: string[];
  continuo: boolean;
}

/** Revisa una oración del relato del alumno para la escena `idx`. */
export function revisarOracion(idx: number, texto: string): RevisionOracion {
  const esc = ESCENAS_RELATO[idx]!;
  const n = normalizaIngles(texto);
  const palabras = n ? n.split(" ") : [];
  const errores: string[] = [];
  const consejos: string[] = [];
  const conectores = CONECTORES_RELATO.filter((c) => contieneFrase(n, c));
  const continuo = /\b(was|were) \w+ing\b/.test(n);
  if (palabras.length < 4) {
    return { ok: false, errores: ["Escribe una oración completa (al menos 4 palabras): quién, qué hizo y dónde."], consejos, verbo: null, conectores, continuo };
  }
  const verbo = esc.pasados.find((p) => contieneFrase(n, p)) ?? null;
  // Sobre-regularizados (goed, runned…).
  for (const w of palabras) {
    const bien = SOBRE_REGULARIZADOS[w];
    if (bien && !(w === "seed" && !/\bi seed\b|\bwe seed\b|\bthey seed\b|\bhe seed\b|\bshe seed\b/.test(n))) {
      errores.push(`«${w}» no existe como pasado: el verbo es irregular → «${bien}».`);
    }
  }
  // didn't + pasado.
  const neg = n.match(/\bdid not (\w+)\b/);
  if (neg) {
    const w = neg[1]!;
    if (Object.values(SOBRE_REGULARIZADOS).includes(w) || (/ed$/.test(w) && !NO_EXCEPCIONES_ED.has(w))) {
      errores.push(`Después de «didn't» va el verbo base: «didn't ${w}» es incorrecto.`);
    }
  }
  const sobreRegularizado = errores.length > 0;
  if (!verbo && !sobreRegularizado) {
    const pres = esc.presentes.find((p) => contieneFrase(n, p.forma));
    if (pres) errores.push(`Narras en pasado: «${pres.forma}» es presente → usa «${pres.pasado}».`);
    else errores.push(`Falta un verbo en pasado que cuente lo que pasa en esta escena (${esc.verbos.map((v) => `${v} → ?`).join(", ")}).`);
  }
  // Coherencia de conectores según la posición en el relato.
  const inicio = [...ABREN, ...ENCADENAN, ...CIERRAN].filter((c) => n.startsWith(`${c} `) || n === c).sort((a, b) => b.length - a.length)[0];
  if (idx === 0 && inicio && (ENCADENAN.includes(inicio) || CIERRAN.includes(inicio))) {
    errores.push(`«${inicio}» encadena con algo anterior o cierra el relato: no puede abrir la historia. Empieza con «First», «One morning» o «Last Monday».`);
  }
  if (idx > 0 && contieneFrase(n, "first") && n.startsWith("first ")) {
    errores.push("«First» abre el relato: úsalo solo en la primera escena.");
  }
  if (idx < ESCENAS_RELATO.length - 1 && inicio && CIERRAN.includes(inicio)) {
    errores.push(`«${inicio}» cierra el relato: guárdalo para la última escena.`);
  }
  if (contieneFrase(n, "while") && !/\bwhile\b.*\b\w+ing\b/.test(n)) {
    consejos.push("Con «while» lo más natural es la acción en progreso en past continuous: «While I was walking, …».");
  }
  if (conectores.length === 0) consejos.push(`Agrega un conector para enlazar esta escena: ${esc.sugeridos.map((s) => `«${s}»`).join(" o ")}.`);
  if (idx === ESCENAS_RELATO.length - 1 && !CIERRAN.some((c) => contieneFrase(n, c))) consejos.push("Para cerrar la historia puedes empezar con «In the end» o «Finally».");
  return { ok: errores.length === 0 && !!verbo, errores, consejos, verbo, conectores, continuo };
}

export interface RevisionRelato {
  oraciones: RevisionOracion[];
  todasOk: boolean;
  conectores: string[];
  relatoOk: boolean;
  continuo: boolean;
}

export function revisarRelato(textos: string[]): RevisionRelato {
  const oraciones = ESCENAS_RELATO.map((_, i) => revisarOracion(i, textos[i] ?? ""));
  const conectores = [...new Set(oraciones.flatMap((o) => o.conectores))];
  const todasOk = oraciones.every((o) => o.ok);
  return { oraciones, todasOk, conectores, relatoOk: todasOk && conectores.length >= 4, continuo: oraciones.some((o) => o.continuo) };
}

/* ════════════════════════════════════════════════════════════════════════
 * ESTRELLAS · ¿QUÉ PASÓ PRIMERO?
 * ════════════════════════════════════════════════════════════════════════ */

export type Primero = "A" | "B" | "igual";

export interface EnunciadoOrden {
  texto: string;
  a: string;
  b: string;
  primero: Primero;
  porque: string;
}

export const ENUNCIADOS_ORDEN: EnunciadoOrden[] = [
  { texto: "I woke up late because my alarm didn't ring.", a: "I woke up late", b: "my alarm didn't ring", primero: "B", porque: "«because» introduce la causa: la alarma no sonó y POR ESO te despertaste tarde." },
  { texto: "My alarm didn't ring, so I woke up late.", a: "my alarm didn't ring", b: "I woke up late", primero: "A", porque: "«so» introduce la consecuencia: primero la alarma no sonó y después te despertaste tarde." },
  { texto: "When I arrived, the bus had already left.", a: "I arrived", b: "the bus left", primero: "B", porque: "«had already left» (past perfect) marca algo anterior a otro pasado: el camión se fue antes de que llegaras." },
  { texto: "While I was eating, the phone rang.", a: "I was eating", b: "the phone rang", primero: "igual", porque: "«While» + past continuous: la llamada ocurrió durante la comida, que ya estaba en progreso." },
  { texto: "After I finished my homework, I watched TV.", a: "I finished my homework", b: "I watched TV", primero: "A", porque: "«After» + primer evento: terminaste la tarea y después viste la tele." },
  { texto: "Before I went to bed, I set two alarms.", a: "I went to bed", b: "I set two alarms", primero: "B", porque: "«Before» marca lo que vino después: primero pusiste las alarmas y luego te acostaste." },
  { texto: "I was walking to school when it started to rain.", a: "I was walking to school", b: "it started to rain", primero: "igual", porque: "Past continuous + «when» + past simple: empezó a llover mientras caminabas." },
  { texto: "We went into a café because it started to rain.", a: "we went into a café", b: "it started to rain", primero: "B", porque: "«because» introduce la causa: empezó a llover y por eso entraron al café." },
  { texto: "It started to rain, so we went into a café.", a: "it started to rain", b: "we went into a café", primero: "A", porque: "«so» introduce la consecuencia: primero la lluvia, después el café." },
  { texto: "I watched a movie after I had dinner.", a: "I watched a movie", b: "I had dinner", primero: "B", porque: "«after» va con el evento que ocurrió primero, aunque aparezca al final de la oración: cenaste y luego viste la película." },
  { texto: "When the teacher came in, we stopped talking.", a: "the teacher came in", b: "we stopped talking", primero: "A", porque: "«When» + past simple en las dos partes = secuencia inmediata: la maestra entró y en ese momento dejaron de hablar." },
  { texto: "While my brother was studying, our cat knocked over a glass of water.", a: "my brother was studying", b: "our cat knocked over a glass of water", primero: "igual", porque: "«While» + past continuous: el gato tiró el vaso mientras tu hermano estudiaba (ejemplo verbatim de la lectura IN-IV-P07-A1)." },
];

export const N_RONDA = 6;
export function rondaOrden(rnd: () => number): number[] {
  return barajar(ENUNCIADOS_ORDEN.map((_, i) => i), rnd).slice(0, N_RONDA);
}

/* ════════════════════════════════════════════════════════════════════════
 * CONTENIDO VERBATIM DE LA PLATAFORMA
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Telling a Story in the Past";

const TEXTO_A1 =
  "Good storytelling in English uses irregular past verbs and narrative connectors to make the events flow naturally.\n\nThe most common irregular past verbs at A2 level (you should know these!):\n• go → went (ir → fue/fui)\n• eat → ate (comer → comió/comí)\n• see → saw (ver → vio/vi)\n• make → made (hacer → hizo/hice)\n• tell → told (contar/decir → contó/conté)\n• come → came (venir → vino/vine)\n• take → took (tomar/llevar → tomó/tomé)\n• give → gave (dar → dio/di)\n• write → wrote (escribir → escribió/escribí)\n• buy → bought (comprar → compró/compré)\n• think → thought (pensar → pensó/pensé)\n• find → found (encontrar → encontró/encontré)\n• say → said (decir → dijo/dije)\n• know → knew (saber/conocer → supo/supe)\n\nNarrative connectors (conectores narrativos) to sequence a story:\n• First / First of all — for the beginning (primero)\n• Then / After that — for the next event (luego / después)\n• Later — after some time (más tarde)\n• Suddenly — for an unexpected event (de repente)\n• In the end / Finally — for the conclusion (al final / finalmente)\n\nExample story:\nLast Saturday, I went (fui) to visit my grandmother. First, we ate (comimos) tamales and drank (bebimos) atole. Then she told (contó) me old stories about our town. Suddenly, we saw (vimos) our neighbors arriving (llegar) with a guitar. In the end, we all made (hicimos) music together until midnight. It was (fue) a wonderful evening.";

/** Lectura A1 en bloques (cada bloque conserva sus saltos de línea). */
export const LECTURA_A1: string[] = TEXTO_A1.split("\n\n");
/** Lectura A1 línea por línea (para la ficha, que pinta párrafos). */
export const LECTURA_A1_LINEAS: string[] = TEXTO_A1.split("\n").filter((l) => l.trim().length > 0);

export const PREGUNTAS_A1: { pregunta: string; guia: string }[] = [
  { pregunta: "What is the past form of 'see'? Use it in a sentence.", guia: "The past form of 'see' is 'saw'. Example: We saw a beautiful sunset yesterday." },
  { pregunta: "What connector would you use to introduce an unexpected event in a story?", guia: "'Suddenly' is used for unexpected events. Example: Suddenly, the lights went out." },
  { pregunta: "What is the past form of 'tell'? What does it mean?", guia: "The past form of 'tell' is 'told'. It means 'contó' or 'dije/dijo'." },
  { pregunta: "Identify two narrative connectors from the example story and explain their function.", guia: "'Then' connects events in sequence (luego). 'Suddenly' introduces an unexpected event (de repente). 'In the end' signals the conclusion (al final)." },
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "then / after", definicion: "Conectores: luego / después — para el siguiente evento en la historia.", ejemplo: "I finished school. Then I went to the park." },
  { termino: "later / afterwards", definicion: "Conectores: más tarde / después — para un evento posterior.", ejemplo: "Later, we had dinner at home." },
  { termino: "suddenly / all of a sudden", definicion: "De repente — para eventos inesperados.", ejemplo: "Suddenly, it started to rain." },
  { termino: "irregular verbs (list)", definicion: "Irregulares frecuentes: go→went, see→saw, eat→ate, buy→bought, meet→met, take→took.", ejemplo: "We met our friends and took a bus." },
  { termino: "while / when", definicion: "Mientras / cuando — para situar dos eventos simultáneos o relacionados.", ejemplo: "I was reading when the phone rang." },
  { termino: "at the end / in the end", definicion: "Al final (de un evento o historia).", ejemplo: "In the end, we decided to stay home." },
];
export const ACTIVIDAD_A5 = "Narra en 6 oraciones lo que hiciste el fin de semana pasado. Usa al menos 4 verbos irregulares y 3 conectores narrativos.";

/** Reflexión escrita A3 — prompt y pistas verbatim. */
export const PROMPT_A3 =
  "Write a short story (a real or invented one) about something that happened to you or someone you know. Use at least 6 irregular past verbs from the list studied in this unit (went, ate, saw, made, told, came, took, gave, found, bought, said, thought). Use at least 4 narrative connectors (first, then, after that, later, suddenly, in the end, finally) to organize the events.";
export const PISTAS_A3: string[] = [
  "Set the scene: 'Last [day/month/year], I went to...' or 'One afternoon, my friend and I decided to...'",
  "Use irregular past verbs: went, ate, saw, made, told, came, took, gave, found, bought, said, thought.",
  "Connect events with: first, then, after that, later, suddenly, in the end, finally.",
  "Add a surprising or emotional moment using 'suddenly' — it makes stories more interesting!",
  "End with a reflection: 'In the end, I felt... / I learned that... / It was the best/worst...'",
];

/** Quiz A4 (verdadero/falso) como reto evaluable — verbatim. */
export const QUIZ_A4: QuizEvaluable = {
  titulo: "True or False — Narrating events",
  puntajeMinimo: 70,
  reactivos: [
    { enunciado: "'Then', 'after', 'later' y 'suddenly' son conectores narrativos en inglés.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 0, retroalimentacion: "Sí: conectan y ordenan eventos en una narración." },
    { enunciado: "'Suddenly' indica que algo ocurrió gradualmente.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 1, retroalimentacion: "'Suddenly' significa 'de repente' — algo inesperado o rápido." },
    { enunciado: "'Went', 'saw', 'ate' y 'woke up' son formas irregulares del pasado simple.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 0, retroalimentacion: "Correcto: go→went, see→saw, eat→ate, wake up→woke up." },
    { enunciado: "Para narrar una secuencia de eventos pasados se usa el presente simple.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 1, retroalimentacion: "Para narrar eventos pasados se usa el pasado simple, no el presente." },
    { enunciado: "'Later' puede usarse para indicar que algo ocurrió después de un tiempo.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 0, retroalimentacion: "Correcto: 'Later, we went home' = más tarde, fuimos a casa." },
  ],
};

/** Hechos: quizzes V/F de IN-IV-P01-A4 e IN-IV-P07-A4 (verbatim, en inglés en la BD). */
export const HECHOS: string[] = [
  "False: «To say you were in the middle of doing something when another event happened, you use the past simple for both verbs ('I walked when it rained')». No: use past continuous + past simple: 'I was walking when it started to rain'. (IN-IV-P01-A4)",
  "True: «'While' introduces a background action in the past continuous ('While I was cooking, the phone rang')». Correct: while + past continuous sets the scene for an interruption. (IN-IV-P01-A4)",
  "True: «A good anecdote typically has a setting, a complication, and a resolution or reaction». Correct: setting (when/where/who), complication (what happened), resolution/reaction (how it ended or how you felt). (IN-IV-P07-A4)",
  "False: «In an anecdote, you should use only the past simple and never the past continuous». No: past continuous sets the scene ('I was waiting for the bus') and past simple tells what happened ('when I saw my teacher'). (IN-IV-P07-A4)",
  "True: «'In the end' signals the conclusion or result of an anecdote». Correct: 'In the end, we all laughed about it' = final resolution of the story. (IN-IV-P07-A4)",
];

/** A2 «Narrative Connectors: Fill in the Blanks» — verbatim. */
const TEXTO_A2 =
  "Last Friday, Carlos ___ (wake up) very early. ___, he ___ (make) breakfast for his whole family. ___, he ___ (go) to the bus station and ___ (buy) a ticket to Puebla. The journey ___ (take) three hours. ___, he ___ (find) his old friend Miguel near the cathedral. ___, it ___ (start) to rain heavily, so they ___ (go) into a café. They ___ (talk) and ___ (eat) for two hours. ___, they ___ (say) goodbye and Carlos ___ (take) the last bus home.";

export const HUECOS_A2: TextoHuecosData = {
  ancla: "IN-III-P07-A2 · Narrative Connectors: Fill in the Blanks",
  instrucciones:
    "Complete the story. For verb blanks: write the correct past simple form of the verb given in parentheses. For connector blanks: choose the best narrative connector (First / Then / Later / Suddenly / In the end).",
  partes: TEXTO_A2.split("___"),
  huecos: [
    { respuesta: "woke up", alternativas: ["woke"], pista: "Irregular: wake up → ?" },
    { respuesta: "First", alternativas: ["first"], pista: "Connector: beginning of the story" },
    { respuesta: "made", alternativas: [], pista: "Irregular: make → ?" },
    { respuesta: "Then", alternativas: ["After that"], pista: "Connector: next event" },
    { respuesta: "went", alternativas: [], pista: "Irregular: go → ?" },
    { respuesta: "bought", alternativas: [], pista: "Irregular: buy → ?" },
    { respuesta: "took", alternativas: [], pista: "Irregular: take → ?" },
    { respuesta: "Later", alternativas: ["later"], pista: "Connector: after some time had passed" },
    { respuesta: "found", alternativas: [], pista: "Irregular: find → ?" },
    { respuesta: "Suddenly", alternativas: ["suddenly"], pista: "Connector: unexpected event" },
    { respuesta: "started", alternativas: [], pista: "Regular: start + ed" },
    { respuesta: "went", alternativas: [], pista: "Irregular: go → ?" },
    { respuesta: "talked", alternativas: ["chatted"], pista: "Regular: talk + ed" },
    { respuesta: "ate", alternativas: [], pista: "Irregular: eat → ?" },
    { respuesta: "In the end", alternativas: ["Finally"], pista: "Connector: conclusion of the story" },
    { respuesta: "said", alternativas: [], pista: "Irregular: say → ?" },
    { respuesta: "took", alternativas: [], pista: "Irregular: take → ?" },
  ],
};

export const FUENTE =
  "CEN Bachillerato — Inglés III, progresión 7 (IN-III-P07): lectura A1, fill in the blanks A2, reflexión A3, verdadero/falso A4, glosario A5 y ordenar secuencia A10. Inspiración: Inglés IV, progresiones 1 y 7 (IN-IV-P01, IN-IV-P07).";

export const PROBLEMA =
  "Contar algo que te pasó no es solo decir verbos en pasado: quien escucha necesita saber qué pasó primero, qué provocó qué y qué ocurrió al mismo tiempo. En este teatrino de viñetas ordenas una anécdota, conectas eventos con first, then, suddenly, while, when, because o so, y escribes tu propia versión de una historia.";

export const INSTRUCCIONES: string[] = [
  "En Put the story in order, toca dos viñetas (en la escena o en la lista) para intercambiarlas. Después pulsa «Play the story»: el personaje actúa escena por escena y la reproducción se detiene donde el orden deja de tener sentido.",
  "En Connect the events, elige el conector y escribe el verbo en pasado de cada oración. La línea del tiempo 3D muestra la relación: secuencia, sorpresa, causa, consecuencia o acción simultánea.",
  "En Tell your version, escribe una oración en inglés por viñeta. El lab revisa verbos en pasado, conectores y su orden, y reproduce tu historia en el teatrino.",
  "Gana estrellas en «¿Qué pasó primero?», aprueba el verdadero/falso A4 y completa el texto A2.",
];

export const IDEAS: string[] = [
  "Para narrar el pasado se usa el past simple; muchos verbos frecuentes son irregulares (go → went, see → saw, take → took).",
  "First abre la historia; then, after that y later la hacen avanzar; suddenly introduce lo inesperado; finally e in the end la cierran.",
  "because introduce la causa (lo que pasó antes); so, la consecuencia (lo que pasó después).",
  "while + past continuous presenta una acción en progreso; when + past simple, el evento breve que la interrumpe.",
  "El orden de la oración no siempre es el orden del tiempo: «I watched a movie after I had dinner» cuenta primero la cena.",
  "Una buena anécdota tiene escena, complicación y cierre (IN-IV-P07).",
];
