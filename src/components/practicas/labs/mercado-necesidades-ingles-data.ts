/**
 * Datos y modelo del laboratorio "Needs and wishes: el tianguis y el centro de
 * acopio" (IN-II-P07, progresión 7 de Inglés II: «Participa en intercambios
 * cotidianos sobre necesidades personales o comunitarias (expresa deseos, elige
 * y muestra empatía)»).
 *
 * Anclas VERBATIM:
 *   - A1 lectura «Expressing Needs and Desires in English»: marco teórico y
 *     preguntas de comprensión (la nota del INEGI no se incluye: es de otra
 *     asignatura).
 *   - A2 quiz «Would Like, How Much and How Many»: RetoQuizCard.
 *   - A3 escritura «What My Community Needs»: «Tu turno».
 *   - A4 verdadero/falso: hechos. A5 glosario. A6 fill_blanks «At the café».
 *   - A7 autoevaluación (criterios y escala). A8 video: la frase de empatía
 *     «I understand how you feel».
 *   - Los sustantivos de la tarjeta de estrellas salen de A1, A2, A5 y A6.
 *
 * Lo que NO es verbatim: la lista de Doña Carmen, los precios del tianguis
 * (redondeados, del orden de un tianguis del centro de México en 2025), los
 * cuatro dilemas de la asamblea con sus cifras y los cinco vecinos son
 * ILUSTRATIVOS; las personas y la colonia son ficticias. Todas las oraciones en
 * inglés están en inglés estadounidense estándar.
 *
 * Datos puros (sin three ni React).
 */

import type { TextoHuecosData } from "./_mecanica-huecos";
import type { QuizEvaluable } from "./_reto-quiz";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "mercado" | "elegir" | "acopio";
export const MODOS: Modo[] = ["mercado", "elegir", "acopio"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  mercado: { etq: "I'd like…", subtitulo: "Compra la lista en el tianguis", icono: "fa-basket-shopping", color: "#f59e0b" },
  elegir: { etq: "Choose and explain", subtitulo: "Pregunta, elige y justifica", icono: "fa-scale-balanced", color: "#38bdf8" },
  acopio: { etq: "Help your community", subtitulo: "Muestra empatía y ofrece ayuda", icono: "fa-hand-holding-heart", color: "#f472b6" },
};

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function baraja<T>(xs: readonly T[], rnd: () => number): T[] {
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

/* ════════════════════════════════════════════════════════════════════════
 * Validación tolerante de lo que escribe el alumno
 * ════════════════════════════════════════════════════════════════════════ */

/** Minúsculas, sin acentos, apóstrofos rectos, sin puntuación ni espacios de sobra. */
export function normalizaIngles(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/[‘’`´]/g, "'")
    .replace(/(\d),(\d{3})/g, "$1$2")
    .replace(/(\d)(kgs?|lts?|l|liters?|litres?|kilos?|pesos)\b/g, "$1 $2")
    .replace(/[.,;:!?¡¿"()—–$-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Contracciones equivalentes: I'd → I would, it's → it is, don't → do not… */
export function expande(s: string): string {
  return ` ${s} `
    .replace(/ i'd /g, " i would ")
    .replace(/ id like /g, " i would like ")
    .replace(/ we'd /g, " we would ")
    .replace(/ you'd /g, " you would ")
    .replace(/ i'm | im /g, " i am ")
    .replace(/ (it|that|there|what|here|he|she)'s /g, " $1 is ")
    .replace(/ i'll /g, " i will ")
    .replace(/ we'll /g, " we will ")
    .replace(/ don't | dont /g, " do not ")
    .replace(/ doesn't | doesnt /g, " does not ")
    .replace(/ can't | cant /g, " cannot ")
    .replace(/ let's /g, " let us ")
    .replace(/\s+/g, " ")
    .trim();
}

const UNIDADES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const DECENAS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

/** Número en palabras en inglés (0–999): «two hundred and six», «forty-four». */
export function numeroIngles(n: number): string {
  if (n < 20) return UNIDADES[n]!;
  if (n < 100) return n % 10 === 0 ? DECENAS[n / 10]! : `${DECENAS[Math.floor(n / 10)]}-${UNIDADES[n % 10]}`;
  const c = Math.floor(n / 100);
  const r = n % 100;
  return r === 0 ? `${UNIDADES[c]} hundred` : `${UNIDADES[c]} hundred and ${numeroIngles(r)}`;
}

/** Lee una cantidad (dígitos o palabras, «a dozen») desde la posición i. */
export function leeCantidad(t: string[], i: number): { n: number; sig: number } | null {
  const w = t[i];
  if (w === undefined) return null;
  let n: number;
  let sig = i + 1;
  if (/^\d+$/.test(w)) n = Number(w);
  else if (w === "a" || w === "an") n = 1;
  else if (w === "dozen") return { n: 12, sig };
  else if (UNIDADES.indexOf(w) >= 1) n = UNIDADES.indexOf(w);
  else if (DECENAS.indexOf(w) >= 2) {
    n = DECENAS.indexOf(w) * 10;
    const u = UNIDADES.indexOf(t[sig] ?? "");
    if (u >= 1 && u <= 9) {
      n += u;
      sig++;
    }
  } else return null;
  if (t[sig] === "dozen") {
    n *= 12;
    sig++;
  }
  return { n, sig };
}

/** Palabras en español que delatan que el alumno escribió en español. */
const ES_DELATORES = /\b(quiero|quisiera|me gustaria|kilos de|litros|huevos|arroz|leche|naranjas|puedo|ayudar|ayuda|quieres|necesitas|lo siento|cuanto|cuesta|comida|cobijas|libros|jabon)\b/;

export interface Revision {
  ok: boolean;
  msg: string;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. I'D LIKE… — el tianguis
 * ════════════════════════════════════════════════════════════════════════ */

export type ProductoId = "eggs" | "rice" | "milk" | "rolls" | "oranges" | "coffee" | "bananas";

export interface Producto {
  id: ProductoId;
  /** Nombre en inglés tal como aparece en el letrero del puesto. */
  en: string;
  es: string;
  contable: boolean;
  /** Precio en pesos por pieza o por unidad de medida (ilustrativo). */
  precio: number;
  /** Letrero del precio en inglés. */
  letrero: string;
  icono: string;
}

export const PRODUCTOS: Record<ProductoId, Producto> = {
  eggs: { id: "eggs", en: "eggs", es: "huevos", contable: true, precio: 3, letrero: "$3 each", icono: "fa-egg" },
  rice: { id: "rice", en: "rice", es: "arroz", contable: false, precio: 30, letrero: "$30 a kilo", icono: "fa-bowl-rice" },
  milk: { id: "milk", en: "milk", es: "leche", contable: false, precio: 28, letrero: "$28 a liter", icono: "fa-bottle-droplet" },
  rolls: { id: "rolls", en: "bread rolls", es: "bolillos", contable: true, precio: 3, letrero: "$3 each", icono: "fa-bread-slice" },
  oranges: { id: "oranges", en: "oranges", es: "naranjas", contable: true, precio: 4, letrero: "$4 each", icono: "fa-lemon" },
  coffee: { id: "coffee", en: "coffee", es: "café", contable: false, precio: 70, letrero: "$70 a bag", icono: "fa-mug-hot" },
  bananas: { id: "bananas", en: "bananas", es: "plátanos", contable: true, precio: 4, letrero: "3 for $12", icono: "fa-seedling" },
};

/** Orden de los productos sobre la mesa del puesto (de izquierda a derecha). */
export const PUESTO: ProductoId[] = ["coffee", "eggs", "rice", "milk", "rolls", "oranges", "bananas"];

export interface ItemLista {
  prod: ProductoId;
  cantidad: number;
  /** Medida para los incontables. */
  medida: { sg: string; pl: string } | null;
  /** Cómo lo escribió Doña Carmen (en español). */
  listaEs: string;
  /** Pregunta del vendedor partida por el hueco de much / many. */
  pregunta: [string, string];
  porque: string;
}

export const PRESUPUESTO = 250;

export const LISTA: ItemLista[] = [
  { prod: "eggs", cantidad: 12, medida: null, listaEs: "12 huevos", pregunta: ["How ", " eggs would you like?"], porque: "Eggs se pueden contar (one egg, two eggs): son contables → how many." },
  { prod: "rice", cantidad: 2, medida: { sg: "kilo", pl: "kilos" }, listaEs: "2 kg de arroz", pregunta: ["How ", " rice would you like?"], porque: "Rice es incontable: no decimos «one rice, two rices»; se mide en kilos → how much." },
  { prod: "milk", cantidad: 2, medida: { sg: "liter", pl: "liters" }, listaEs: "2 litros de leche", pregunta: ["How ", " milk would you like?"], porque: "Milk es incontable (A2): se mide en litros, no se cuenta → how much." },
  { prod: "rolls", cantidad: 6, medida: null, listaEs: "6 bolillos", pregunta: ["How ", " bread rolls would you like?"], porque: "Bread rolls son piezas que se cuentan (one roll, six rolls) → how many. Ojo: «bread» solo es incontable." },
  { prod: "oranges", cantidad: 6, medida: null, listaEs: "6 naranjas", pregunta: ["How ", " oranges would you like?"], porque: "Oranges se cuentan (one orange, six oranges) → how many." },
];

export const NOTA_LISTA = "Si sobra dinero, trae un poco de fruta. Nada que no esté en la lista.";

export function itemDe(prod: ProductoId): ItemLista | undefined {
  return LISTA.find((x) => x.prod === prod);
}

export function subtotal(it: ItemLista): number {
  return it.cantidad * PRODUCTOS[it.prod].precio;
}

/** La cantidad dicha en inglés: «twelve eggs», «two kilos of rice». */
export function cantidadEn(it: ItemLista): string {
  const num = numeroIngles(it.cantidad);
  if (it.medida) return `${num} ${it.cantidad === 1 ? it.medida.sg : it.medida.pl} of ${PRODUCTOS[it.prod].en}`;
  return `${num} ${PRODUCTOS[it.prod].en}`;
}

export const pedidoModelo = (it: ItemLista) => `I'd like ${cantidadEn(it)}, please.`;

const KILOS = ["kilos", "kilo", "kilograms", "kilogram", "kg", "kgs"];
const LITROS = ["liters", "liter", "litres", "litre", "l", "lt", "lts", "cartons", "carton", "boxes", "box"];
const MEDIDA_SG = ["kilo", "kilogram", "liter", "litre", "carton", "box"];

/** Cómo puede escribir el alumno el sustantivo de cada producto (plural, singular). */
const NOMBRES: Record<ProductoId, { pl: string[]; sg: string[] }> = {
  eggs: { pl: ["eggs"], sg: ["egg"] },
  rice: { pl: ["rices"], sg: ["rice"] },
  milk: { pl: ["milks"], sg: ["milk"] },
  rolls: { pl: ["bread rolls", "rolls", "bolillos", "pieces of bread"], sg: ["bread roll", "roll", "bolillo", "piece of bread"] },
  oranges: { pl: ["oranges"], sg: ["orange"] },
  coffee: { pl: ["coffees"], sg: ["coffee"] },
  bananas: { pl: ["bananas"], sg: ["banana"] },
};

function empiezaCon(s: string, opciones: string[]): string | null {
  return opciones.find((o) => s === o || s.startsWith(`${o} `)) ?? null;
}

/** ¿Qué producto nombra el texto (para detectar que pidió otro)? */
function productoNombrado(s: string): ProductoId | null {
  for (const id of Object.keys(NOMBRES) as ProductoId[]) {
    const n = NOMBRES[id];
    if ([...n.pl, ...n.sg].some((w) => new RegExp(`(^| )${w}( |$)`).test(s))) return id;
  }
  return null;
}

/**
 * Revisa el pedido que escribe el alumno para un producto de la lista.
 * Acepta «I'd like / I would like (to buy / have / get)…» y, como alternativa
 * cortés, «Can / Could / May I have…»; mayúsculas, puntuación, «please» y
 * cantidades en dígitos o palabras («12», «twelve», «a dozen») dan igual.
 */
export function revisaPedido(it: ItemLista, texto: string): Revision {
  const p = PRODUCTOS[it.prod];
  const modelo = pedidoModelo(it);
  let e = expande(normalizaIngles(texto))
    .replace(/(^| )(please|thank you|thanks)( |$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  e = e.replace(/^((hello|hi|good morning|good afternoon|ok|okay|yes|um|well) )+/, "");
  if (!e) return { ok: false, msg: `Escribe tu pedido en inglés. Por ejemplo: «I'd like…».` };
  if (ES_DELATORES.test(e)) return { ok: false, msg: `Escríbelo en inglés: «I'd like…» = me gustaría / quisiera.` };

  let resto: string | null = null;
  let alterna = false;
  const m = e.match(/^(i|we) would like (to (buy|have|get|take|order) )?(.*)$/);
  const alt = e.match(/^((can|could|may) (i|we) (have|get|buy)|i will (have|take)) (.*)$/);
  if (m) resto = m[4] ?? "";
  else if (alt) {
    resto = alt[6] ?? "";
    alterna = true;
  } else if (/^(i|we) (want|wants|need|needs)( |$)/.test(e))
    return { ok: false, msg: `«I want / I need…» se entiende, pero con el vendedor suena brusco. Para pedir con cortesía usa «would like» (A1: es más cortés que «want») → «${modelo}»` };
  else if (/^(i|we) likes? /.test(e)) return { ok: false, msg: `«I like» significa «me gusta» (en general). Para pedir algo ahora se usa «I'd like» (= quisiera) → «${modelo}»` };
  else if (/^(i|we) would likes /.test(e)) return { ok: false, msg: `«Would like» no cambia: nunca lleva -s («she would like», «I would like») → «${modelo}»` };
  else if (/^(i|we) (like would|like to would) /.test(e)) return { ok: false, msg: `El orden es «would» + «like»: «I would like…» o «I'd like…» (A2) → «${modelo}»` };
  else if (/^would like /.test(e)) return { ok: false, msg: `Falta el sujeto: en inglés siempre se dice quién quiere → «I'd like…».` };
  else if (/^(i|we) would /.test(e)) return { ok: false, msg: `Después de «I would» va «like»: «I would like…» → «${modelo}»` };
  else if (leeCantidad(e.split(" "), 0))
    return { ok: false, msg: `Así se contesta rápido en una charla (como en A6: «Two, please.»), pero aquí practica la oración completa y cortés → «${modelo}»` };
  else return { ok: false, msg: `Empieza tu pedido con «I'd like…» (o «I would like…») → «${modelo}»` };

  if (/^to /.test(resto)) return { ok: false, msg: `Con un sustantivo, «would like» va sin «to»: «I'd like ${cantidadEn(it)}». La forma «would like + to» es para un verbo: «I'd like to buy…» (A1).` };
  const t = resto.split(" ").filter(Boolean);
  if (t[0] === "some" || t[0] === "any")
    return { ok: false, msg: `«Some» sirve cuando no dices cuántos (Would you like some coffee?). Aquí el vendedor preguntó la cantidad y la lista dice ${it.listaEs} → «${modelo}»` };
  const q = leeCantidad(t, 0);
  if (!q) return { ok: false, msg: `Falta la cantidad: el vendedor preguntó «${it.pregunta[0]}${p.contable ? "many" : "much"}${it.pregunta[1]}» → «${modelo}»` };
  const cola = t.slice(q.sig).join(" ");
  const nombrado = productoNombrado(cola);
  if (nombrado && nombrado !== it.prod) return { ok: false, msg: `Estás pidiendo «${PRODUCTOS[nombrado].en}», pero en el puesto elegiste ${p.en}. Pide ${p.en}: «${modelo}»` };

  if (p.contable) {
    const n = NOMBRES[it.prod];
    if (empiezaCon(cola, [...KILOS, ...LITROS])) return { ok: false, msg: `Los ${p.es} aquí se venden por pieza y se cuentan: di cuántos → «${modelo}»` };
    if (it.prod === "rolls" && !empiezaCon(cola, ["bread rolls", "bread roll"]) && empiezaCon(cola, ["breads", "bread"]))
      return { ok: false, msg: `«Bread» (pan) es incontable: no se dice «six breads». Para piezas se dice «bread rolls» o «pieces of bread» → «${modelo}»` };
    const pl = empiezaCon(cola, n.pl);
    const sg = pl ? null : empiezaCon(cola, n.sg);
    if (!pl && !sg) return { ok: false, msg: `Después de la cantidad va el sustantivo en inglés, como en el letrero: «${p.en}» → «${modelo}»` };
    if (q.n !== it.cantidad) return { ok: false, msg: `La lista de Doña Carmen dice ${it.listaEs}, y escribiste ${q.n}. → «${modelo}»` };
    if (sg && q.n > 1) return { ok: false, msg: `Con más de uno, el sustantivo contable va en plural: «${numeroIngles(q.n)} ${p.en}», no «${sg}».` };
  } else {
    const nombre = NOMBRES[it.prod];
    const medidas = it.prod === "rice" ? KILOS : LITROS;
    const otra = it.prod === "rice" ? LITROS : KILOS;
    if (empiezaCon(cola, [...nombre.pl, ...nombre.sg]))
      return { ok: false, msg: `«${p.en}» es incontable (A1): no se cuenta directo ni lleva -s. Usa una medida: «${cantidadEn(it)}».` };
    if (empiezaCon(cola, otra)) return { ok: false, msg: `El ${p.es} se mide en ${it.medida!.pl}: «${cantidadEn(it)}».` };
    const med = empiezaCon(cola, medidas);
    if (!med) return { ok: false, msg: `«${p.en}» es incontable: di la medida y luego «of» → «${cantidadEn(it)}» (dos ${it.medida!.pl} DE ${p.es}).` };
    const tras = cola.slice(med.length).trim();
    if (!/^of( |$)/.test(tras)) return { ok: false, msg: `Falta «of» entre la medida y el sustantivo: «${cantidadEn(it)}» (of = de).` };
    const sust = tras.replace(/^of ?/, "");
    if (empiezaCon(sust, nombre.pl)) return { ok: false, msg: `«${p.en}» es incontable: no lleva -s aunque sean ${it.cantidad} ${it.medida!.pl} → «${cantidadEn(it)}».` };
    if (!empiezaCon(sust, nombre.sg)) return { ok: false, msg: `Después de «of» va el producto: «${cantidadEn(it)}».` };
    if (q.n !== it.cantidad) return { ok: false, msg: `La lista de Doña Carmen dice ${it.listaEs}, y escribiste ${q.n}. → «${modelo}»` };
    if (q.n > 1 && MEDIDA_SG.includes(med)) return { ok: false, msg: `Con más de uno, la medida va en plural: «${numeroIngles(q.n)} ${it.medida!.pl} of ${p.en}».` };
  }
  return {
    ok: true,
    msg: `${alterna ? `¡Correcto! Tu forma también es cortés; la de la lectura A1 es «${modelo}»` : `¡Perfecto! «${modelo}»`}${/bolillo/.test(e) ? " (En inglés, «bolillos» se dice «bread rolls».)" : ""}`,
  };
}

/** Explica por qué much o many con un sustantivo concreto. */
export function revisaMuchMany(it: ItemLista, elegido: "much" | "many"): Revision {
  const bien = PRODUCTOS[it.prod].contable ? "many" : "much";
  if (elegido === bien) return { ok: true, msg: it.porque };
  return { ok: false, msg: `«How ${elegido}» no va aquí. ${it.porque}` };
}

export interface Oferta {
  prod: ProductoId;
  pregunta: string;
  precio: number;
  correcta: "yes" | "no";
}

export const OFERTAS: Oferta[] = [
  { prod: "coffee", pregunta: "Would you like some coffee too? A bag is 70 pesos.", precio: 70, correcta: "no" },
  { prod: "bananas", pregunta: "Would you like some bananas? Three bananas are 12 pesos.", precio: 12, correcta: "yes" },
];

export const TOTAL_LISTA = LISTA.reduce((a, it) => a + subtotal(it), 0);
export const TOTAL_FINAL = TOTAL_LISTA + OFERTAS.filter((o) => o.correcta === "yes").reduce((a, o) => a + o.precio, 0);
export const CAMBIO = PRESUPUESTO - TOTAL_FINAL;

export function explicaOferta(o: Oferta, dijo: "yes" | "no"): Revision {
  const suma = TOTAL_LISTA + o.precio;
  const cabe = suma <= PRESUPUESTO;
  const enLista = !!itemDe(o.prod);
  const fruta = o.prod === "bananas";
  const base =
    o.correcta === "no"
      ? `La cuenta va en ${TOTAL_LISTA} pesos: ${TOTAL_LISTA} + ${o.precio} = ${suma}, más que los ${PRESUPUESTO} de Doña Carmen${enLista ? "" : ", y el café no está en su lista"}. Se contesta «No, thank you.»`
      : `La cuenta va en ${TOTAL_LISTA} pesos: ${TOTAL_LISTA} + ${o.precio} = ${suma}, ${cabe ? "cabe en" : "se pasa de"} los ${PRESUPUESTO}${fruta ? ", y la nota pide fruta si sobra dinero" : ""}. Se contesta «Yes, please.»`;
  return { ok: dijo === o.correcta, msg: `${dijo === o.correcta ? "¡Bien decidido! " : "Revisa la cuenta. "}${base} (Would you like some…? es la forma cortés de ofrecer, A1.)` };
}

/** Revisa la pregunta del precio: «How much is it?» y variantes. */
export function revisaPreguntaPrecio(texto: string): Revision {
  const e = expande(normalizaIngles(texto)).replace(/(^| )(please|excuse me|sorry)( |$)/g, " ").replace(/\s+/g, " ").trim();
  if (!e) return { ok: false, msg: "Pregunta en inglés cuánto es todo." };
  if (ES_DELATORES.test(e)) return { ok: false, msg: "Pregúntalo en inglés: «How much is it?» = ¿cuánto es?" };
  if (/^how many /.test(e)) return { ok: false, msg: "Para precios se usa «how much» (A4: «How much is it?» = ¿cuánto cuesta?). El dinero es incontable." };
  if (/^how much (it is|that is|this is|it costs?)( |$)/.test(e)) return { ok: false, msg: "En una pregunta el verbo va antes del sujeto: «How much is it?» (no «how much it is»)." };
  if (/^how much costs?( |$)/.test(e)) return { ok: false, msg: "Falta el sujeto o el auxiliar: «How much is it?» o «How much does it cost?»." };
  if (/^how much (is|are) (it|that|this|everything|all this|all of this|the total|they|these|those)( |$)/.test(e)) return { ok: true, msg: "¡Bien preguntado! «How much is it?» = ¿cuánto es? (A4)." };
  if (/^how much (does|do) (it|that|this|everything|all this|all of this|they) cost( |$)/.test(e)) return { ok: true, msg: "¡Correcto! «How much does it cost?» también pregunta el precio." };
  if (/^how much do i owe you( |$)/.test(e)) return { ok: true, msg: "¡Correcto! «How much do I owe you?» (¿cuánto le debo?) también funciona." };
  if (/^how much /.test(e)) return { ok: false, msg: "Vas bien con «how much»; completa la pregunta: «How much is it?»." };
  return { ok: false, msg: "Para preguntar el precio: «How much is it?» (A4)." };
}

export const TOTAL_EN = `It's ${numeroIngles(TOTAL_FINAL)} pesos.`;
export const CAMBIO_EN = `Here's your change: ${numeroIngles(CAMBIO)} pesos. Thank you!`;

/** Lee la cantidad que el alumno entendió (dígitos, con o sin «pesos» o «$»). */
export function revisaMonto(texto: string): Revision {
  const e = normalizaIngles(texto).replace(/(^| )(pesos|mxn|it is|its)( |$)/g, " ").trim();
  if (!e) return { ok: false, msg: "Escribe con números cuánto dijo el vendedor." };
  if (!/^\d+$/.test(e)) return { ok: false, msg: `Escríbelo con números (por ejemplo 150). Escucha o lee de nuevo: «${TOTAL_EN}»` };
  const n = Number(e);
  if (n === TOTAL_FINAL) return { ok: true, msg: `¡Eso es! ${numeroIngles(TOTAL_FINAL)} = ${TOTAL_FINAL}. Pagas con ${PRESUPUESTO} y te dan ${CAMBIO} de cambio.` };
  if (n === 260 || n === 216 || n === 226) return { ok: false, msg: `Casi: «${numeroIngles(TOTAL_FINAL)}» = ${TOTAL_FINAL}. Two hundred = 200 y «and six» = 6 (sixty sería 60 y sixteen 16).` };
  return { ok: false, msg: `No es ${n}. El vendedor dijo «${numeroIngles(TOTAL_FINAL)}»: two hundred (200) and six (6). Suma también el ticket para comprobarlo.` };
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. CHOOSE AND EXPLAIN — la asamblea de la colonia
 * ════════════════════════════════════════════════════════════════════════ */

export type Lado = "A" | "B";

export interface OpcionDilema {
  lado: Lado;
  /** Frase verbal: «I'd rather ___» / «I'd like to ___». */
  verbo: string;
  /** Frase nominal: «I'd like ___». */
  sustantivo: string;
  es: string;
  /** Respuesta a cada pregunta, en inglés. */
  datos: [string, string];
  rasgo: string;
}

export interface PreguntaDilema {
  partes: [string, string];
  aux: "much" | "many";
  porque: string;
}

export interface RazonDilema {
  en: string;
  verdaderaPara: Lado;
  explica: string;
}

export interface Dilema {
  id: string;
  necesidad: string;
  es: string;
  icono: string;
  preguntas: [PreguntaDilema, PreguntaDilema];
  opciones: [OpcionDilema, OpcionDilema];
  razones: RazonDilema[];
}

export const DILEMAS: Dilema[] = [
  {
    id: "libros",
    necesidad: "Our school library needs more books.",
    es: "La biblioteca de la secundaria de la colonia necesita más libros.",
    icono: "fa-book",
    preguntas: [
      { partes: ["How ", " does it cost?"], aux: "much", porque: "Preguntas por dinero, y money es incontable (A1) → «How much does it cost?» = ¿cuánto cuesta?" },
      { partes: ["How ", " books do we get?"], aux: "many", porque: "Books se cuentan (one book, forty books) → how many." },
    ],
    opciones: [
      { lado: "A", verbo: "buy new books", sustantivo: "new books", es: "comprar libros nuevos", datos: ["It costs 6,000 pesos.", "We get 40 books."], rasgo: "We choose the titles." },
      { lado: "B", verbo: "organize a book drive", sustantivo: "a book drive", es: "organizar una colecta de libros", datos: ["It costs 500 pesos.", "We get about 150 books."], rasgo: "The books are used." },
    ],
    razones: [
      { en: "it is cheaper", verdaderaPara: "B", explica: "La colecta cuesta 500 pesos y los libros nuevos 6,000: la más barata es la B." },
      { en: "we get more books", verdaderaPara: "B", explica: "Con la colecta llegan unos 150 libros; comprando, 40: más libros con la B." },
      { en: "we can choose the titles", verdaderaPara: "A", explica: "Solo comprando eliges qué títulos llegan; en la colecta llega lo que la gente dona." },
    ],
  },
  {
    id: "sombra",
    necesidad: "The park next to the market needs shade.",
    es: "El parque junto al tianguis no tiene sombra y la gente no aguanta el sol.",
    icono: "fa-sun",
    preguntas: [
      { partes: ["How ", " does it cost?"], aux: "much", porque: "Otra vez dinero (incontable) → how much." },
      { partes: ["How ", " time does it take to give shade?"], aux: "much", porque: "Time (tiempo) es incontable → «how much time». Si preguntaras por years (contable) sería «how many years»." },
    ],
    opciones: [
      { lado: "A", verbo: "plant trees", sustantivo: "trees", es: "plantar árboles", datos: ["It costs 4,000 pesos for 20 young trees.", "It takes about five years."], rasgo: "Trees clean the air." },
      { lado: "B", verbo: "buy big umbrellas", sustantivo: "big umbrellas", es: "comprar sombrillas grandes", datos: ["It costs 12,000 pesos for 6 umbrellas.", "It takes one day."], rasgo: "Umbrellas give shade right away." },
    ],
    razones: [
      { en: "it is cheaper", verdaderaPara: "A", explica: "Los árboles cuestan 4,000 pesos y las sombrillas 12,000: la más barata es la A." },
      { en: "we get shade right away", verdaderaPara: "B", explica: "Las sombrillas dan sombra en un día; los árboles tardan unos cinco años." },
      { en: "trees clean the air", verdaderaPara: "A", explica: "Limpiar el aire es algo que hacen los árboles, no las sombrillas." },
    ],
  },
  {
    id: "comida",
    necesidad: "Some families in the neighborhood need food.",
    es: "Algunas familias de la colonia no tienen suficiente comida.",
    icono: "fa-bowl-food",
    preguntas: [
      { partes: ["How ", " families can it help?"], aux: "many", porque: "Families se cuentan (one family, forty families) → how many." },
      { partes: ["How ", " money do we need?"], aux: "much", porque: "Money es incontable (A1: «how much money», no «how many money») → how much." },
    ],
    opciones: [
      { lado: "A", verbo: "start a community garden", sustantivo: "a community garden", es: "iniciar un huerto comunitario", datos: ["It can help 15 families.", "We need 3,000 pesos for seeds and tools."], rasgo: "Fresh vegetables in about three months." },
      { lado: "B", verbo: "collect food at the market", sustantivo: "a food collection", es: "hacer una colecta de comida en el tianguis", datos: ["It can help 40 families.", "We don't need any money."], rasgo: "Families get food this week." },
    ],
    razones: [
      { en: "it helps more families", verdaderaPara: "B", explica: "La colecta ayuda a 40 familias y el huerto a 15: más familias con la B." },
      { en: "we don't need any money", verdaderaPara: "B", explica: "El huerto necesita 3,000 pesos; la colecta no necesita dinero («any» va en negativas: we don't need any money)." },
      { en: "we can grow fresh vegetables", verdaderaPara: "A", explica: "Cultivar verduras frescas solo se puede con el huerto (opción A)." },
    ],
  },
  {
    id: "agua",
    necesidad: "Our street has no water two days a week.",
    es: "En la calle cortan el agua dos días a la semana.",
    icono: "fa-droplet",
    preguntas: [
      { partes: ["How ", " does it cost?"], aux: "much", porque: "Dinero → how much." },
      { partes: ["How ", " liters of water do we get?"], aux: "many", porque: "La pregunta cuenta liters (one liter, two liters): contable → how many. Ojo: por «water» sola, que es incontable, sería «how much water»." },
    ],
    opciones: [
      { lado: "A", verbo: "install a rainwater tank", sustantivo: "a rainwater tank", es: "instalar un tinaco para agua de lluvia", datos: ["It costs 7,000 pesos, only once.", "We get 2,500 liters each time the rain fills it."], rasgo: "It collects rain every year." },
      { lado: "B", verbo: "call a water truck", sustantivo: "a water truck", es: "pedir una pipa de agua", datos: ["It costs 1,200 pesos every time.", "We get 10,000 liters, one time."], rasgo: "The truck can come today." },
    ],
    razones: [
      { en: "we pay only once", verdaderaPara: "A", explica: "El tinaco se paga una sola vez; la pipa se paga cada vez que viene." },
      { en: "we get water today", verdaderaPara: "B", explica: "La pipa puede llegar hoy; el tinaco hay que instalarlo y esperar a que llueva." },
      { en: "it collects rain every year", verdaderaPara: "A", explica: "Juntar lluvia cada año es lo que hace el tinaco (opción A)." },
    ],
  },
];

export type FichaElegir = "likeTo" | "rather" | "like" | "ratherTo" | "vA" | "vB" | "nA" | "nB" | "because" | "r0" | "r1" | "r2";

export const FICHAS_ELEGIR: FichaElegir[] = ["likeTo", "rather", "like", "ratherTo", "vA", "vB", "nA", "nB", "because", "r0", "r1", "r2"];
export const INICIOS: FichaElegir[] = ["likeTo", "rather", "like", "ratherTo"];
const INICIO_TXT: Record<string, string> = { likeTo: "I'd like to", rather: "I'd rather", like: "I'd like", ratherTo: "I'd rather to" };

/** Fichas de cada dilema, revueltas con semilla fija. */
export const FICHAS_DILEMA: FichaElegir[][] = DILEMAS.map((_, i) => baraja(FICHAS_ELEGIR, mulberry32(41 + i * 13)));

export function textoFichaElegir(d: Dilema, f: FichaElegir): string {
  if (f in INICIO_TXT) return INICIO_TXT[f]!;
  if (f === "vA") return d.opciones[0].verbo;
  if (f === "vB") return d.opciones[1].verbo;
  if (f === "nA") return d.opciones[0].sustantivo;
  if (f === "nB") return d.opciones[1].sustantivo;
  if (f === "because") return "because";
  return d.razones[Number(f.slice(1))]!.en;
}

export function oracionElegir(d: Dilema, fichas: FichaElegir[]): string {
  if (!fichas.length) return "";
  return `${fichas.map((f) => textoFichaElegir(d, f)).join(" ")}.`;
}

export const opcionDe = (d: Dilema, lado: Lado) => (lado === "A" ? d.opciones[0] : d.opciones[1]);

/** Revisa la oración armada para justificar la elección. Lista vacía = correcta. */
export function revisaEleccion(d: Dilema, elegida: Lado, fichas: FichaElegir[]): string[] {
  const errores: string[] = [];
  const inicios = fichas.filter((f) => INICIOS.includes(f));
  const frases = fichas.filter((f) => f === "vA" || f === "vB" || f === "nA" || f === "nB");
  const razones = fichas.filter((f) => f === "r0" || f === "r1" || f === "r2");
  const op = opcionDe(d, elegida);
  const faltan: string[] = [];
  if (!inicios.length) faltan.push("el inicio (I'd like to… / I'd rather…)");
  if (!frases.length) faltan.push(`lo que eliges («${op.verbo}»)`);
  if (!fichas.includes("because")) faltan.push("«because»");
  if (!razones.length) faltan.push("una razón");
  if (faltan.length) errores.push(`Falta ${faltan.join(", ")}.`);
  if (inicios.length > 1) errores.push("Usa un solo inicio.");
  if (frases.length > 1) errores.push("Nombra una sola opción.");
  if (razones.length > 1) errores.push("Da una sola razón.");
  if (errores.length) return errores;

  const ini = inicios[0]!;
  const fr = frases[0]!;
  const esVerbo = fr === "vA" || fr === "vB";
  const ladoFrase: Lado = fr === "vA" || fr === "nA" ? "A" : "B";
  if (ini === "ratherTo") errores.push(`«Would rather» va con el verbo base, SIN «to»: «I'd rather ${op.verbo}». En cambio «would like» sí lleva «to» antes de un verbo: «I'd like to ${op.verbo}».`);
  else if (ini === "like" && esVerbo) errores.push(`Con un verbo, «would like» lleva «to» (A1: would like + to + verb): «I'd like to ${op.verbo}». Sin «to» va con un sustantivo: «I'd like ${op.sustantivo}».`);
  else if (ini === "likeTo" && !esVerbo) errores.push(`Después de «I'd like to» va un verbo: «I'd like to ${op.verbo}». Con un sustantivo va sin «to»: «I'd like ${op.sustantivo}».`);
  else if (ini === "rather" && !esVerbo) errores.push(`«Would rather» va con un verbo: «I'd rather ${op.verbo}». Para un sustantivo usa «I'd like ${op.sustantivo}».`);
  if (ladoFrase !== elegida) errores.push(`Elegiste la opción ${elegida} (${op.es}), pero tu frase habla de la otra opción.`);
  const razon = d.razones[Number(razones[0]!.slice(1))]!;
  if (razon.verdaderaPara !== elegida) errores.push(`«Because ${razon.en}» no es verdad para la opción ${elegida}: ${razon.explica} Busca una razón que sí apoye tu elección.`);
  if (errores.length) return errores;

  const orden: FichaElegir[] = [ini, fr, "because", razones[0]!];
  if (!orden.every((x, i) => fichas[i] === x)) errores.push(`Ordena la oración: inicio + lo que eliges + because + razón → «${textoFichaElegir(d, ini)} ${textoFichaElegir(d, fr)} because ${razon.en}».`);
  return errores;
}

/** Explicación de much / many para una pregunta del dilema. */
export function revisaPreguntaDilema(q: PreguntaDilema, elegido: "much" | "many"): Revision {
  if (elegido === q.aux) return { ok: true, msg: q.porque };
  return { ok: false, msg: `«How ${elegido}» no va aquí. ${q.porque}` };
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. HELP YOUR COMMUNITY — el centro de acopio
 * ════════════════════════════════════════════════════════════════════════ */

export type Insumo = "rice" | "beans" | "water" | "blankets" | "books" | "soap";

export const INSUMOS: { id: Insumo; en: string; enSg: string; es: string; icono: string; color: string; max: number }[] = [
  { id: "rice", en: "kilos of rice", enSg: "kilo of rice", es: "kg de arroz", icono: "fa-bowl-rice", color: "#f5f0e1", max: 6 },
  { id: "beans", en: "cans of beans", enSg: "can of beans", es: "latas de frijoles", icono: "fa-jar", color: "#b45309", max: 8 },
  { id: "water", en: "bottles of water", enSg: "bottle of water", es: "botellas de agua", icono: "fa-bottle-water", color: "#38bdf8", max: 8 },
  { id: "blankets", en: "blankets", enSg: "blanket", es: "cobijas", icono: "fa-layer-group", color: "#a855f7", max: 5 },
  { id: "books", en: "books", enSg: "book", es: "libros", icono: "fa-book", color: "#22c55e", max: 10 },
  { id: "soap", en: "bars of soap", enSg: "bar of soap", es: "jabones", icono: "fa-soap", color: "#fbcfe8", max: 6 },
];

export type Caja = Record<Insumo, number>;
export const CAJA_VACIA: Caja = { rice: 0, beans: 0, water: 0, blankets: 0, books: 0, soap: 0 };

export interface RespuestaEmpatia {
  en: string;
  ok: boolean;
  porque: string;
}

export interface Vecino {
  id: string;
  nombre: string;
  quien: string;
  camisa: string;
  cabello: string;
  coleta: boolean;
  dice: string;
  es: string;
  necesidadEs: string;
  respuestas: RespuestaEmpatia[];
  /** Palabras que muestran que la oferta responde a su necesidad. */
  claves: string[];
  ofertaModelo: string;
  contesta: string;
  pide: Partial<Caja>;
}

export const VECINOS: Vecino[] = [
  {
    id: "rosa",
    nombre: "Rosa",
    quien: "vecina de la calle Jacarandas",
    camisa: "#f97316",
    cabello: "#1f1410",
    coleta: true,
    dice: "I lost my job last week, and I can't buy enough food for my kids.",
    es: "Perdió su trabajo y no le alcanza para la comida de sus hijos.",
    necesidadEs: "comida para su familia",
    respuestas: [
      { en: "I'm sorry to hear that.", ok: true, porque: "Reconoces lo que le pasa antes de ofrecer algo: eso es mostrar empatía." },
      { en: "That's great! Congratulations!", ok: false, porque: "«Congratulations» es para buenas noticias; perder el trabajo es una mala noticia." },
      { en: "Why? What did you do wrong?", ok: false, porque: "Suena a que la culpas. Primero se muestra empatía; los detalles no hacen falta." },
    ],
    claves: ["food", "rice", "beans", "groceries", "eat", "cook", "meal", "meals", "breakfast", "lunch", "dinner", "shopping", "kids", "children", "money"],
    ofertaModelo: "Would you like me to bring you some food?",
    contesta: "Yes, please. We need two kilos of rice and three cans of beans.",
    pide: { rice: 2, beans: 3 },
  },
  {
    id: "chuy",
    nombre: "Don Chuy",
    quien: "vecino de 78 años",
    camisa: "#0ea5e9",
    cabello: "#e5e7eb",
    coleta: false,
    dice: "My back hurts, and I can't carry my water home.",
    es: "Le duele la espalda y no puede cargar su agua hasta su casa.",
    necesidadEs: "cargar el agua hasta su casa",
    respuestas: [
      { en: "Oh no, that sounds painful.", ok: true, porque: "Nombras cómo se siente él («that sounds painful»): es una respuesta empática." },
      { en: "Me too! My back hurts all the time.", ok: false, porque: "Llevas la conversación hacia ti. La empatía pone la atención en la otra persona." },
      { en: "You're old. That's normal.", ok: false, porque: "Es un comentario hiriente sobre su edad y minimiza su problema." },
    ],
    claves: ["carry", "water", "bottles", "bottle", "bring", "take", "home", "house", "walk", "bag", "bags"],
    ofertaModelo: "Would you like me to carry the water for you?",
    contesta: "Thank you so much! I need six bottles of water.",
    pide: { water: 6 },
  },
  {
    id: "laura",
    nombre: "Maestra Laura",
    quien: "maestra de la primaria",
    camisa: "#16a34a",
    cabello: "#7c2d12",
    coleta: true,
    dice: "Our school needs books. Many students don't have any.",
    es: "La escuela necesita libros: muchos alumnos no tienen ninguno.",
    necesidadEs: "libros para sus alumnos",
    respuestas: [
      { en: "What a shame. Every student needs books.", ok: true, porque: "Reconoces que es un problema real y te pones del lado de los alumnos." },
      { en: "Books are boring anyway.", ok: false, porque: "Desprecias lo que ella necesita; no es empático ni ayuda." },
      { en: "OK. That's not my school.", ok: false, porque: "Es indiferencia: cierra la conversación en vez de escuchar." },
    ],
    claves: ["book", "books", "read", "reading", "donate", "library", "stories", "storybooks", "school", "students", "collect"],
    ofertaModelo: "Would you like some books for your students?",
    contesta: "Yes! We'd like some storybooks. Can you give us eight?",
    pide: { books: 8 },
  },
  {
    id: "mateo",
    nombre: "Mateo",
    quien: "estudiante de bachillerato",
    camisa: "#6366f1",
    cabello: "#111827",
    coleta: false,
    dice: "It's very cold at night, and my little sisters don't have warm blankets.",
    es: "Hace mucho frío en la noche y sus hermanitas no tienen cobijas calientitas.",
    necesidadEs: "cobijas para sus hermanas",
    respuestas: [
      { en: "That sounds really hard. I understand how you feel.", ok: true, porque: "«I understand how you feel» es una frase de empatía (video A8): muestras que lo escuchas." },
      { en: "Just buy some blankets.", ok: false, porque: "Suena a que no escuchaste: si pudiera comprarlas, no lo estaría pidiendo." },
      { en: "I love cold weather!", ok: false, porque: "Hablas de tus gustos y minimizas su problema." },
    ],
    claves: ["blanket", "blankets", "warm", "cold", "clothes", "jacket", "jackets", "sweater", "sweaters", "coat", "coats", "sisters"],
    ofertaModelo: "Can I help you with some blankets?",
    contesta: "Yes, please. We need three blankets.",
    pide: { blankets: 3 },
  },
  {
    id: "torres",
    nombre: "Señora Torres",
    quien: "vecina cuya casa se inundó",
    camisa: "#e11d48",
    cabello: "#3f2a1d",
    coleta: false,
    dice: "The storm flooded our house. Everything is wet and dirty.",
    es: "La tormenta inundó su casa: todo está mojado y sucio.",
    necesidadEs: "limpiar su casa después de la inundación",
    respuestas: [
      { en: "I'm so sorry. Is your family OK?", ok: true, porque: "Muestras empatía y te preocupas primero por las personas." },
      { en: "Well, now your house is really clean!", ok: false, porque: "Es un chiste sobre su desgracia: lastima aunque no sea la intención." },
      { en: "That's not my problem.", ok: false, porque: "Es indiferencia total: cierra la conversación." },
    ],
    claves: ["clean", "cleaning", "soap", "water", "wash", "house", "home", "dry", "towels", "mop", "furniture", "move"],
    ofertaModelo: "Would you like me to help you clean your house?",
    contesta: "We're OK, thanks. We need four bars of soap and four bottles of water.",
    pide: { soap: 4, water: 4 },
  },
];

/** Respuestas de empatía de cada vecino en orden fijo revuelto. */
export const ORDEN_RESPUESTAS: number[][] = VECINOS.map((_, i) => baraja([0, 1, 2], mulberry32(71 + i * 5)));

/**
 * Revisa la oferta de ayuda que escribe el alumno. Acepta, entre otras:
 * Would you like me to…? · Would you like some…? · Can / Could / Shall I…? ·
 * How can I help? · Do you need (some) help / …? · I can… · Let me…
 * Detecta calcos del español («would you like that I…») y exige que la oferta
 * toque la necesidad del vecino o sea un ofrecimiento general de ayuda.
 */
export function revisaOferta(v: Vecino, texto: string): Revision {
  const e = expande(normalizaIngles(texto));
  if (!e) return { ok: false, msg: `Escribe en inglés cómo ofreces ayuda a ${v.nombre}.` };
  if (ES_DELATORES.test(e)) return { ok: false, msg: `Escríbelo en inglés. Por ejemplo: «Would you like me to…?» (¿quieres que yo…?).` };
  if (/would you like (that|if) (i|we) /.test(e) || /do you want (that )?i /.test(e) || /want you that/.test(e))
    return { ok: false, msg: `Es un calco del español («¿quieres que yo…?»). En inglés se dice «Would you like me to + verbo?» → «${v.ofertaModelo}»` };
  if (/would you likes /.test(e)) return { ok: false, msg: `«Would like» nunca lleva -s: «Would you like…?».` };
  if (/(^| )you would like /.test(e) && !/would you like /.test(e)) return { ok: false, msg: `En una pregunta «would» va antes del sujeto: «Would you like…?», no «You would like…?».` };
  if (/would you like me (?!to )[a-z]+/.test(e)) return { ok: false, msg: `Falta «to»: «Would you like me TO + verbo?» → «${v.ofertaModelo}»` };
  if (/would you like me to (?!bring |sing )[a-z]{2,}ing( |$)/.test(e)) return { ok: false, msg: `Después de «to» va el verbo base, sin -ing: «Would you like me to help…?».` };
  if (/would you like to me /.test(e)) return { ok: false, msg: `El orden es «Would you like me to…?» (me va antes de to).` };
  if (/can i to /.test(e) || /could i to /.test(e)) return { ok: false, msg: `Después de «can / could» va el verbo sin «to»: «Can I help you?».` };
  if (/can i helping|can i helps/.test(e)) return { ok: false, msg: `Después de «can» va el verbo base: «Can I help you…?».` };

  const oferta =
    /would you like me to [a-z]+/.test(e) ||
    /would you like (some|a|an|any|more|the|my|our|these|this) [a-z]+/.test(e) ||
    /would you like to [a-z]+/.test(e) ||
    /(can|could|may|shall) (i|we) [a-z]+/.test(e) ||
    /how can (i|we) help/.test(e) ||
    /do you need (some |any |a little |more )?[a-z]+/.test(e) ||
    /do you want me to [a-z]+/.test(e) ||
    /(^| )(i|we) (can|could|will) [a-z]+/.test(e) ||
    /(^| )let (me|us) [a-z]+/.test(e);
  if (!oferta)
    return { ok: false, msg: `Todavía no suena a ofrecimiento. Usa una forma de ofrecer ayuda: «Would you like me to…?», «Can I help you with…?», «Would you like some…?» → «${v.ofertaModelo}»` };

  const palabras = e.split(" ");
  const general = /(how can (i|we) help|(can|could|may|shall) (i|we) help( you)?$|do you need (some |any )?help$|(i|we) can help( you)?$|would you like (me to help( you)?|some help|help)$|do you want me to help( you)?$)/.test(e);
  const concreta = v.claves.some((c) => palabras.includes(c));
  if (!concreta && !general)
    return { ok: false, msg: `Tu oferta está bien formada, pero no responde a lo que necesita ${v.nombre}: ${v.necesidadEs}. Menciona algo concreto (p. ej. «${v.ofertaModelo}») o pregunta «How can I help?».` };
  const empatia = /(sorry|sounds|understand|shame|hard|oh no)/.test(e);
  return {
    ok: true,
    msg: concreta
      ? `¡Muy bien! Ofreces ayuda concreta${empatia ? " y además muestras empatía" : ""}.`
      : `¡Bien! «How can I help?» es un ofrecimiento amable; una oferta concreta ayuda todavía más: «${v.ofertaModelo}»`,
  };
}

export function textoPedido(v: Vecino): string {
  return INSUMOS.filter((x) => (v.pide[x.id] ?? 0) > 0)
    .map((x) => `${numeroIngles(v.pide[x.id]!)} ${v.pide[x.id] === 1 ? x.enSg : x.en}`)
    .join(" and ");
}

/** Revisa la caja armada contra lo que dijo el vecino. Lista vacía = correcta. */
export function revisaCaja(v: Vecino, caja: Caja): string[] {
  const errores: string[] = [];
  for (const x of INSUMOS) {
    const pide = v.pide[x.id] ?? 0;
    const hay = caja[x.id];
    if (pide === hay) continue;
    if (pide === 0) errores.push(`Sobra: ${v.nombre} no pidió ${x.en} (${x.es}).`);
    else if (hay === 0) errores.push(`Falta lo que dijo: «${numeroIngles(pide)} ${pide === 1 ? x.enSg : x.en}» (${pide} ${x.es}).`);
    else errores.push(`Dijo «${numeroIngles(pide)} ${pide === 1 ? x.enSg : x.en}» = ${pide}, y pusiste ${hay}.`);
  }
  return errores;
}

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas — Countable or uncountable? (sustantivos de A1, A2, A5 y A6)
 * ════════════════════════════════════════════════════════════════════════ */

export type Conteo = "countable" | "uncountable";

export const SUSTANTIVOS: { w: string; tipo: Conteo; explica: string }[] = [
  { w: "apples", tipo: "countable", explica: "one apple, two apples (A1) → how many apples." },
  { w: "water", tipo: "uncountable", explica: "no decimos «two waters» al medirla: a glass of water (A1) → how much water." },
  { w: "love", tipo: "uncountable", explica: "es una idea que no se cuenta (A1) → how much love." },
  { w: "money", tipo: "uncountable", explica: "contamos pesos, no «moneys» (A1) → how much money." },
  { w: "information", tipo: "uncountable", explica: "a piece of information, no «an information» (A2) → how much information." },
  { w: "rice", tipo: "uncountable", explica: "se mide en kilos: two kilos of rice (A5) → how much rice." },
  { w: "students", tipo: "countable", explica: "one student, thirty students (A1) → how many students." },
  { w: "eggs", tipo: "countable", explica: "one egg, two eggs (A2) → how many eggs." },
  { w: "milk", tipo: "uncountable", explica: "se mide en litros: a liter of milk (A2) → how much milk." },
  { w: "chairs", tipo: "countable", explica: "one chair, ten chairs (A2) → how many chairs." },
  { w: "people", tipo: "countable", explica: "people es el plural de person: se cuenta (A1) → how many people." },
  { w: "days", tipo: "countable", explica: "one day, three days (A1) → how many days." },
  { w: "bread", tipo: "uncountable", explica: "a piece of bread, a loaf of bread (A5); para piezas: bread rolls → how much bread." },
  { w: "juice", tipo: "uncountable", explica: "a glass of juice (A5) → how much juice." },
  { w: "sandwiches", tipo: "countable", explica: "one sandwich, two sandwiches (A6) → how many sandwiches." },
  { w: "oranges", tipo: "countable", explica: "one orange, six oranges (A1) → how many oranges." },
  { w: "coffee", tipo: "uncountable", explica: "como bebida o grano es incontable: how much coffee. (En un café, «two coffees» significa dos tazas.)" },
  { w: "friends", tipo: "countable", explica: "one friend, many friends (A2) → how many friends." },
];

export const RONDA_CONTEO = 8;

/** Ronda de 8 sustantivos con al menos 3 de cada tipo. */
export function rondaConteo(rnd: () => number): number[] {
  const c = baraja(SUSTANTIVOS.map((s, i) => ({ s, i })).filter((x) => x.s.tipo === "countable"), rnd).slice(0, 4);
  const u = baraja(SUSTANTIVOS.map((s, i) => ({ s, i })).filter((x) => x.s.tipo === "uncountable"), rnd).slice(0, 4);
  return baraja([...c, ...u].map((x) => x.i), rnd);
}

/* ════════════════════════════════════════════════════════════════════════
 * A3 — Tu turno: What My Community Needs (revisión automática orientativa)
 * ════════════════════════════════════════════════════════════════════════ */

export const A3 = {
  prompt:
    "Think about a need or desire of YOUR community (a park, better public transport, a library, a sports center, clean water, etc.). Write in English: (a) what your community would like to have, (b) how much or how many of this thing is needed, and (c) why this is important for your community.",
  pistas: ["Use 'would like': 'My community would like to have...'", "Use 'how much' or 'how many': 'We need more water / We need 3 more buses.'", "Include a reason: 'This is important because...'"],
  criterios: ["Clearly identifies a community need", "Uses 'would like' correctly", "Uses 'how much' or 'how many' appropriately", "Explains the importance with a reason"],
  min: 60,
  max: 180,
};

const INCONTABLES_COMUNES = ["water", "money", "rice", "milk", "information", "time", "food", "traffic", "garbage", "trash", "pollution", "space", "light", "electricity", "furniture", "equipment", "love", "help", "coffee", "bread", "juice"];
const CONTABLES_COMUNES = ["people", "students", "buses", "trees", "books", "parks", "days", "chairs", "apples", "eggs", "libraries", "families", "cars", "houses", "schools", "teachers", "doctors", "computers", "streets", "lights", "benches"];

export interface AnalisisA3 {
  palabras: number;
  wouldLike: number;
  cantidad: boolean;
  razon: boolean;
  /** «how many water», «how much people»… */
  errores: string[];
}

export function analizaA3(texto: string): AnalisisA3 {
  const e = expande(normalizaIngles(texto));
  const palabras = texto.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;
  const wouldLike = (e.match(/\bwould like\b/g) ?? []).length;
  const cantidad = /\bhow (much|many)\b/.test(e) || /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|twenty|fifty|hundred|thousand) (more )?[a-z]+/.test(e) || /\bmore [a-z]+/.test(e);
  const razon = /\b(because|important|so that|since)\b/.test(e);
  const errores: string[] = [];
  for (const m of e.matchAll(/\bhow many ([a-z]+)/g)) if (INCONTABLES_COMUNES.includes(m[1]!)) errores.push(`«how many ${m[1]}» → «how much ${m[1]}» (incontable)`);
  for (const m of e.matchAll(/\bhow much ([a-z]+)/g)) if (CONTABLES_COMUNES.includes(m[1]!)) errores.push(`«how much ${m[1]}» → «how many ${m[1]}» (contable)`);
  for (const m of e.matchAll(/\bwould like to (a|an|the|some|more|new|better|clean) /g)) errores.push(`«would like to ${m[1]}…»: con sustantivo va sin «to» («would like ${m[1]}…») o agrega un verbo («would like to have ${m[1]}…»)`);
  if (/\bwould likes\b/.test(e)) errores.push("«would likes» → «would like» (nunca lleva -s)");
  return { palabras, wouldLike, cantidad, razon, errores };
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Expressing Needs and Desires in English";

/** Lectura A1 — verbatim (las viñetas se agrupan con su encabezado). */
export const LECTURA_A1: string[] = [
  "When we want something or prefer something, we use 'would like'. It is more polite than 'want'. Would like + noun or would like + to + verb.",
  "• I would like a glass of water, please. (noun)\n• She would like to study medicine. (infinitive)\n• Would you like some coffee? (question form)",
  "To ask about quantities:\n• How much + uncountable noun (water, money, rice): How much water do you need?\n• How many + countable noun (apples, people, days): How many students are in your class?",
  "Countable nouns can be counted: one apple, two apples, three oranges.\nUncountable nouns cannot be counted directly: water, love, money, information.",
  "These structures help us express desires and needs in everyday situations — at a store, at a restaurant, in conversations with neighbors, or when talking about community projects.",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS_A1: { pregunta: string; respuesta: string }[] = [
  { pregunta: "What structure follows 'would like' when we want a thing (noun)?", respuesta: "Would like + noun: I would like a glass of water." },
  { pregunta: "When do we use 'how much' vs 'how many'?", respuesta: "How much with uncountable nouns; how many with countable nouns." },
  { pregunta: "Is 'money' countable or uncountable?", respuesta: "Uncountable. We say 'how much money', not 'how many money'." },
];

/** Quiz A2 «Would Like, How Much and How Many» — verbatim. */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Would Like, How Much and How Many (A2)",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Choose the correct sentence:",
      opciones: ["I would like a coffee, please.", "I would like to a coffee.", "I would likes a coffee.", "I like would a coffee."],
      respuestaCorrecta: 0,
      retroalimentacion: "'Would like + noun' is the correct structure for polite requests.",
    },
    { enunciado: "'How ___ milk do you need?' (milk is uncountable):", opciones: ["many", "much", "any", "some"], respuestaCorrecta: 1, retroalimentacion: "'How much' is used with uncountable nouns like milk, water, money." },
    { enunciado: "'How ___ eggs do we need for the cake?' (eggs are countable):", opciones: ["much", "many", "little", "few"], respuestaCorrecta: 1, retroalimentacion: "'How many' is used with countable nouns like eggs, students, chairs." },
    { enunciado: "Which noun is UNCOUNTABLE?", opciones: ["apple", "chair", "information", "friend"], respuestaCorrecta: 2, retroalimentacion: "'Information' is uncountable. We say 'a piece of information', not 'an information'." },
    { enunciado: "'She would like ___ visit Paris someday.'", opciones: ["to", "a", "for", "at"], respuestaCorrecta: 0, retroalimentacion: "'Would like + to + verb (infinitive)': She would like to visit Paris." },
  ],
};

/** Hechos: verdadero/falso A4 — verbatim, cada enunciado con su retroalimentación. */
export const HECHOS: string[] = [
  "Verdadero: «'I'd like a coffee' es una forma cortés de pedir algo». Correcto: would like = querría/me gustaría (más cortés que 'I want').",
  "Verdadero: «Después de 'would like' un verbo va en infinitivo con 'to' ('I'd like to go')». Sí: would like + to + verbo.",
  "Falso: «'How many' se usa con sustantivos incontables como water». 'How many' es para contables; 'how much' para incontables (how much water).",
  "Verdadero: «'How much' se usa para preguntar precios». Sí: 'How much is it?' = ¿cuánto cuesta?",
  "Verdadero: «'Apples' y 'eggs' son sustantivos contables». Correcto: se pueden contar (two apples, three eggs).",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string; etiqueta: string }[] = [
  { termino: "I'd like (would like)", definicion: "Forma cortés de pedir algo o expresar un deseo.", ejemplo: "I'd like a sandwich, please.", etiqueta: "cortesía" },
  { termino: "would like + to + verb", definicion: "Para expresar un deseo de hacer algo.", ejemplo: "I'd like to go to the park.", etiqueta: "gramática" },
  { termino: "How much / How many", definicion: "Cantidad: how much (incontable) / how many (contable).", ejemplo: "How many apples? How much milk?", etiqueta: "cantidad" },
  { termino: "countable / uncountable", definicion: "Sustantivos contables (apples) e incontables (water, rice).", ejemplo: "Water is uncountable.", etiqueta: "gramática" },
  { termino: "food & drinks", definicion: "Alimentos y bebidas: bread, milk, coffee, juice.", ejemplo: "I'd like a glass of juice.", etiqueta: "comida" },
  { termino: "How much is it?", definicion: "¿Cuánto cuesta? (para preguntar precios).", ejemplo: "How much is it? — It's 20 pesos.", etiqueta: "precio" },
];

export const ACTIVIDAD_A5 = "Escribe un mini-diálogo en una tienda usando 'I'd like', 'how much' y 'how many'.";

/** A6 «Fill in the blanks — At the café» — verbatim (sin el espacio antes de «?» que deja el marcador del hueco). */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "IN-II-P07-A6 · Fill in the blanks — At the café",
  instrucciones: "Completa los huecos para este diálogo en un café.",
  partes: ["Waiter: Hello! What would you ", "? Customer: I'd ", " a coffee and a sandwich, please. Waiter: How ", " sandwiches? Customer: Two, please. How ", " is it?"],
  huecos: [
    { respuesta: "like", alternativas: [], pista: "What would you ___ ? (forma cortés de '¿qué desea?')." },
    { respuesta: "like", alternativas: [], pista: "I'd ___ = me gustaría." },
    { respuesta: "many", alternativas: [], pista: "Sandwiches es CONTABLE: how ___ ." },
    { respuesta: "much", alternativas: [], pista: "Preguntar el precio total: how ___ is it?" },
  ],
};

/** A7 «Self-check — Everyday needs» — verbatim. */
export const A7 = {
  instrucciones: "Marca tu nivel honesto en cada criterio.",
  criterios: ["Pido cosas cortésmente con 'I'd like a/an...'.", "Expreso deseos con 'I'd like to + verbo'.", "Uso 'how much' y 'how many' según contable o incontable.", "Pregunto y entiendo precios y cantidades."],
  escala: [
    { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
    { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
    { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
    { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo ayudar a otra persona." },
  ],
  reflexion: "¿En qué situación real (tienda, café) podrías usar 'I'd like...' en inglés?",
};

/** Frase de empatía del video A8 — verbatim. */
export const EMPATIA_A8 = "Mostrar empatía en una conversación en inglés puede incluir frases como 'I understand how you feel'.";

export const FUENTE =
  "CEN Bachillerato — Inglés II, progresión 7: lectura A1 «Expressing Needs and Desires in English» (Material elaborado para CEN Bachillerato — IN-II), quiz A2, escritura A3, verdadero/falso A4, glosario A5, fill_blanks A6, autoevaluación A7 y video A8.";

export const PROBLEMA =
  "¿Cómo pides lo que necesitas, eliges entre dos opciones y ofreces ayuda en inglés sin sonar brusco? En este laboratorio haces el mandado de Doña Carmen en el tianguis de la colonia Las Flores con un billete de 250 pesos, votas en la asamblea vecinal explicando por qué prefieres una opción, y atiendes a cinco vecinos en el centro de acopio con empatía y ofertas concretas.";

export const INSTRUCCIONES: string[] = [
  "En I'd like…, elige en el puesto un producto de la lista de Doña Carmen, completa la pregunta del vendedor con much o many y escribe tu pedido («I'd like…»). Después decide las ofertas según el presupuesto y pregunta cuánto es.",
  "En Choose and explain, pregunta con how much / how many para descubrir los datos de las dos opciones, elige una en la plaza y arma con fichas por qué: «I'd rather… / I'd like to… because…».",
  "En Help your community, elige la respuesta empática para cada vecino, escribe cómo le ofreces ayuda y arma su caja con las cantidades que te dice en inglés.",
  "Clasifica sustantivos para ganar estrellas, resuelve el quiz A2, completa el diálogo A6 y escribe sobre las necesidades de tu comunidad (A3).",
];

export const IDEAS: string[] = [
  "«Would like» es más cortés que «want»: I'd like a coffee, please.",
  "Would like + sustantivo (I'd like two kilos of rice) · would like + to + verbo (I'd like to plant trees).",
  "Would rather + verbo base, sin to: I'd rather organize a book drive.",
  "How much con incontables (water, money, rice, time) · how many con contables (eggs, books, families, liters).",
  "Los incontables se cuentan con una medida: two kilos of rice, a liter of milk, four bars of soap.",
  "Some en ofrecimientos y afirmaciones (Would you like some coffee?) · any en negativas (We don't need any money).",
  "Para ofrecer ayuda: Would you like me to…? · Can I help you with…? Y antes, empatía: I'm sorry to hear that.",
];
