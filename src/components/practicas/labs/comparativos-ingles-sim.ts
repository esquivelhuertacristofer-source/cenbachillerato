/**
 * Lógica pura del simulador «Lucía va de compras» (comparativos en inglés).
 *
 * Lucía (personaje FICTICIO) tiene que decidir entre dos opciones en cuatro
 * compras. El alumno ve barras con los datos de cada opción y le dice a Lucía
 * una comparación en inglés: «A is ___ than B». Lo que decide la frase es:
 *   1. si la FORMA del comparativo existe (more cheap / gooder no existen),
 *   2. si la frase es VERDADERA según las barras,
 *   3. si habla de lo que Lucía quiere decidir.
 * Solo si las tres cosas se cumplen, Lucía elige. Todas las cifras son valores
 * de juego («simulación»), no precios ni mediciones reales.
 */

import type { TipoRegla } from "./comparativos-ingles-data";

export interface FormaComp {
  /** El comparativo tal como se dice: «cheaper», «more expensive»… */
  forma: string;
  adj: string;
  tipo: TipoRegla;
}

export interface Atributo {
  id: string;
  /** Nombre en español para las barras. */
  nombre: string;
  unidad: string;
  /** Comparativo de «tiene MÁS de esto». */
  hi: FormaComp;
  /** Comparativo de «tiene MENOS de esto». */
  lo: FormaComp;
}

export interface OpcionCompra {
  id: string;
  /** Nombre corto que entra en la frase: «Zeta is faster than Orbi». */
  corto: string;
  /** Qué es, en español, para la tarjeta. */
  que: string;
  /** Clave de la imagen: /media/labs-sim/comparativos-ingles/<clave>.webp */
  clave: string;
  icono: string;
  valores: Record<string, number>;
}

export interface ErrorForma {
  forma: string;
  corrige: string;
  porque: string;
}

export interface Ronda {
  id: string;
  titulo: string;
  icono: string;
  /** Lo que dice Lucía (inglés) y su traducción. */
  lucia: string;
  luciaEs: string;
  /** Atributo que decide la compra y en qué sentido. */
  meta: { atributo: string; dir: "alto" | "bajo" };
  atributos: Atributo[];
  opciones: [OpcionCompra, OpcionCompra];
  errores: ErrorForma[];
}

const f = (forma: string, adj: string, tipo: TipoRegla): FormaComp => ({ forma, adj, tipo });

export const RONDAS: Ronda[] = [
  {
    id: "telefono",
    titulo: "Phone",
    icono: "fa-mobile-screen",
    lucia: "I want to spend less money on my new phone. Which one is better for that?",
    luciaEs: "Lucía quiere gastar menos en su teléfono nuevo.",
    meta: { atributo: "precio", dir: "bajo" },
    atributos: [
      { id: "precio", nombre: "Precio", unidad: "$", hi: f("more expensive", "expensive", "more"), lo: f("cheaper", "cheap", "er") },
      { id: "pantalla", nombre: "Pantalla", unidad: "pulg.", hi: f("bigger", "big", "er"), lo: f("smaller", "small", "er") },
    ],
    opciones: [
      { id: "zeta", corto: "Zeta", que: "Teléfono Zeta", clave: "telefono-zeta", icono: "fa-mobile-screen", valores: { precio: 3200, pantalla: 5.8 } },
      { id: "orbi", corto: "Orbi", que: "Teléfono Orbi", clave: "telefono-orbi", icono: "fa-mobile-screen-button", valores: { precio: 6900, pantalla: 6.7 } },
    ],
    errores: [
      { forma: "more cheap", corrige: "cheaper", porque: "«cheap» es corto (1 sílaba): lleva -er, no «more»." },
      { forma: "expensiver", corrige: "more expensive", porque: "«expensive» es largo (3 sílabas): lleva «more», no -er." },
    ],
  },
  {
    id: "autobus",
    titulo: "Bus",
    icono: "fa-bus",
    lucia: "We need to arrive early at the beach. Which bus should we take?",
    luciaEs: "El grupo de Lucía necesita llegar temprano a la playa.",
    meta: { atributo: "velocidad", dir: "alto" },
    atributos: [
      { id: "velocidad", nombre: "Velocidad", unidad: "km/h", hi: f("faster", "fast", "er"), lo: f("slower", "slow", "er") },
      { id: "comodidad", nombre: "Comodidad", unidad: "/10", hi: f("more comfortable", "comfortable", "more"), lo: f("less comfortable", "comfortable", "more") },
    ],
    opciones: [
      { id: "gaviota", corto: "Gaviota", que: "Autobús Gaviota", clave: "autobus-gaviota", icono: "fa-bus", valores: { velocidad: 70, comodidad: 9 } },
      { id: "delfin", corto: "Delfín", que: "Autobús Delfín", clave: "autobus-delfin", icono: "fa-bus-simple", valores: { velocidad: 95, comodidad: 6 } },
    ],
    errores: [
      { forma: "more fast", corrige: "faster", porque: "«fast» es corto (1 sílaba): lleva -er, no «more»." },
      { forma: "comfortabler", corrige: "more comfortable", porque: "«comfortable» es largo: lleva «more», no -er." },
    ],
  },
  {
    id: "pelicula",
    titulo: "Movie",
    icono: "fa-film",
    lucia: "I want to watch something more interesting tonight. You choose!",
    luciaEs: "Lucía quiere ver algo más interesante esta noche.",
    meta: { atributo: "interes", dir: "alto" },
    atributos: [
      { id: "interes", nombre: "Interés (opinión del público)", unidad: "/10", hi: f("more interesting", "interesting", "more"), lo: f("more boring", "boring", "more") },
      { id: "duracion", nombre: "Duración", unidad: "min", hi: f("longer", "long", "er"), lo: f("shorter", "short", "er") },
    ],
    opciones: [
      { id: "luna", corto: "Moon Trip", que: "Película Moon Trip", clave: "pelicula-luna", icono: "fa-moon", valores: { interes: 6, duracion: 140 } },
      { id: "chef", corto: "Chef Night", que: "Película Chef Night", clave: "pelicula-chef", icono: "fa-utensils", valores: { interes: 9, duracion: 95 } },
    ],
    errores: [
      { forma: "interestinger", corrige: "more interesting", porque: "«interesting» es largo (4 sílabas): lleva «more», no -er." },
      { forma: "more long", corrige: "longer", porque: "«long» es corto (1 sílaba): lleva -er, no «more»." },
    ],
  },
  {
    id: "paseo",
    titulo: "Trip",
    icono: "fa-map-location-dot",
    lucia: "For the weekend I want the place with the best reviews. What do you think?",
    luciaEs: "Lucía quiere el lugar con mejores reseñas para el fin de semana.",
    meta: { atributo: "resenas", dir: "alto" },
    atributos: [
      { id: "resenas", nombre: "Reseñas", unidad: "/10", hi: f("better", "good", "irregular"), lo: f("worse", "bad", "irregular") },
      { id: "distancia", nombre: "Distancia", unidad: "km", hi: f("farther", "far", "irregular"), lo: f("closer", "close", "er") },
    ],
    opciones: [
      { id: "sierra", corto: "Sierra Verde", que: "Pueblo Sierra Verde", clave: "paseo-sierra", icono: "fa-mountain-sun", valores: { resenas: 9, distancia: 120 } },
      { id: "playa", corto: "Playa Azul", que: "Playa Azul", clave: "paseo-playa", icono: "fa-umbrella-beach", valores: { resenas: 7, distancia: 310 } },
    ],
    errores: [
      { forma: "gooder", corrige: "better", porque: "«good» es irregular: su comparativo es «better», nunca «gooder»." },
      { forma: "more far", corrige: "farther", porque: "«far» es irregular: «farther» (o «further»); no se dice «more far»." },
    ],
  },
];

/** Todas las formas que se ofrecen como fichas en una ronda, en orden alfabético. */
export function fichasDe(r: Ronda): string[] {
  const buenas = r.atributos.flatMap((a) => [a.hi.forma, a.lo.forma]);
  const malas = r.errores.map((e) => e.forma);
  return [...buenas, ...malas].sort((a, b) => a.localeCompare(b, "en"));
}

export function opcionDe(r: Ronda, id: string): OpcionCompra {
  return r.opciones.find((o) => o.id === id) ?? r.opciones[0];
}

export function otraDe(r: Ronda, id: string): OpcionCompra {
  return r.opciones.find((o) => o.id !== id) ?? r.opciones[1];
}

/** La opción que cumple lo que Lucía quiere. */
export function ganadoraDe(r: Ronda): OpcionCompra {
  const [a, b] = r.opciones;
  const va = a.valores[r.meta.atributo] ?? 0;
  const vb = b.valores[r.meta.atributo] ?? 0;
  const aGana = r.meta.dir === "alto" ? va > vb : va < vb;
  return aGana ? a : b;
}

/** Busca a qué atributo y sentido corresponde una forma (si es una forma válida). */
export function buscaForma(r: Ronda, forma: string): { atributo: Atributo; dir: "alto" | "bajo"; info: FormaComp } | null {
  for (const at of r.atributos) {
    if (at.hi.forma === forma) return { atributo: at, dir: "alto", info: at.hi };
    if (at.lo.forma === forma) return { atributo: at, dir: "bajo", info: at.lo };
  }
  return null;
}

export type Veredicto = "bien" | "gramatica" | "falsa" | "fuera";

export interface Resultado {
  veredicto: Veredicto;
  /** Reacción de Lucía, en inglés. */
  ingles: string;
  /** Explicación en español. */
  es: string;
  /** Solo cuando la forma es válida (verdadera o no). */
  tipo?: TipoRegla;
  forma?: string;
  /** Solo con veredicto «bien». */
  ganadora?: string;
}

const REGLA_TIPO: Record<TipoRegla, string> = {
  er: "Adjetivo corto: se agrega -er.",
  more: "Adjetivo largo: se usa «more» antes del adjetivo.",
  irregular: "Adjetivo irregular: hay que memorizar su forma.",
};

function num(v: number, unidad: string): string {
  if (unidad === "$") return `$${v.toLocaleString("en-US")}`;
  return `${v} ${unidad}`;
}

/** Evalúa la frase «sujeto is forma than (la otra)» y devuelve la reacción de Lucía. */
export function evaluar(r: Ronda, sujetoId: string, forma: string): Resultado {
  const sujeto = opcionDe(r, sujetoId);
  const objeto = otraDe(r, sujetoId);
  const frase = `${sujeto.corto} is ${forma} than ${objeto.corto}`;

  const err = r.errores.find((e) => e.forma === forma);
  if (err) {
    return {
      veredicto: "gramatica",
      ingles: `Sorry? «${frase}»? I don't understand.`,
      es: `${err.porque} Lucía no entiende. Prueba con «${err.corrige}».`,
    };
  }
  const hallada = buscaForma(r, forma);
  if (!hallada) {
    return { veredicto: "gramatica", ingles: "Sorry? I didn't get that.", es: "Esa forma no existe. Elige otra ficha." };
  }
  const { atributo, dir, info } = hallada;
  const vs = sujeto.valores[atributo.id] ?? 0;
  const vo = objeto.valores[atributo.id] ?? 0;
  const verdadera = dir === "alto" ? vs > vo : vs < vo;
  if (!verdadera) {
    return {
      veredicto: "falsa",
      tipo: info.tipo,
      forma,
      ingles: `Hmm, ${sujeto.corto} is not ${forma} than ${objeto.corto}. Look at the bars!`,
      es: `La forma «${forma}» está bien, pero la frase es falsa: en ${atributo.nombre.toLowerCase()}, ${sujeto.corto} tiene ${num(vs, atributo.unidad)} y ${objeto.corto} ${num(vo, atributo.unidad)}. Mira las barras.`,
    };
  }
  if (atributo.id !== r.meta.atributo) {
    const meta = r.atributos.find((a) => a.id === r.meta.atributo);
    return {
      veredicto: "fuera",
      tipo: info.tipo,
      forma,
      ingles: `That's true, but it doesn't help me decide!`,
      es: `Frase correcta y verdadera, pero habla de ${atributo.nombre.toLowerCase()} y Lucía decide por ${meta?.nombre.toLowerCase() ?? "otra cosa"}. Compara en lo que ella pidió.`,
    };
  }
  const gana = ganadoraDe(r);
  return {
    veredicto: "bien",
    tipo: info.tipo,
    forma,
    ganadora: gana.id,
    ingles: `${frase}. Great, I'll take ${gana.corto}!`,
    es: `${REGLA_TIPO[info.tipo]} «${info.adj}» → «${forma} than». Lucía elige ${gana.corto}.`,
  };
}
