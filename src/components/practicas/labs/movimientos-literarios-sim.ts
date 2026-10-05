/**
 * Simulador de la «curaduría» de una exposición literaria (simulación).
 *
 * Las piezas son FRAGMENTOS INVENTADOS de autores ficticios, escritos para este
 * laboratorio: no son citas de personas reales. Cada pieza muestra tres rasgos;
 * el alumno la coloca en la línea del tiempo de los movimientos y un medidor
 * enciende los rasgos del movimiento elegido que sí aparecen en la pieza.
 * Los rasgos de cada movimiento parafrasean las opciones correctas del quiz A2
 * (verbatim en `movimientos-literarios-data.ts`).
 */
import type { Movimiento } from "./movimientos-literarios-data";

export const MOVS: Movimiento[] = ["barroco", "romanticismo", "realismo", "modernismo", "vanguardias", "realismo-magico"];

/** Periodo aproximado de cada movimiento en la línea del tiempo (vertical). */
export const BANDAS: Record<Movimiento, { desde: number; hasta: number; col: 0 | 1; periodo: string }> = {
  barroco: { desde: 1600, hasta: 1700, col: 0, periodo: "s. XVII" },
  romanticismo: { desde: 1800, hasta: 1860, col: 0, periodo: "s. XIX" },
  realismo: { desde: 1850, hasta: 1900, col: 1, periodo: "s. XIX" },
  modernismo: { desde: 1880, hasta: 1920, col: 0, periodo: "fines XIX – inicio XX" },
  vanguardias: { desde: 1910, hasta: 1940, col: 1, periodo: "s. XX" },
  "realismo-magico": { desde: 1940, hasta: 1970, col: 0, periodo: "mediados s. XX" },
};

export interface Rasgo {
  id: string;
  mov: Movimiento;
  texto: string;
}

export const RASGOS_MOV: Rasgo[] = [
  { id: "b-orn", mov: "barroco", texto: "Lenguaje ornamental" },
  { id: "b-con", mov: "barroco", texto: "Contrastes extremos" },
  { id: "b-des", mov: "barroco", texto: "Desengaño del mundo" },
  { id: "r-yo", mov: "romanticismo", texto: "Individualismo y emoción" },
  { id: "r-nat", mov: "romanticismo", texto: "Naturaleza sublime" },
  { id: "r-reb", mov: "romanticismo", texto: "Rebeldía frente al orden" },
  { id: "re-obj", mov: "realismo", texto: "Representación objetiva de la sociedad" },
  { id: "re-crit", mov: "realismo", texto: "Crítica social" },
  { id: "re-ord", mov: "realismo", texto: "Personajes ordinarios" },
  { id: "mo-mus", mov: "modernismo", texto: "Musicalidad" },
  { id: "mo-prec", mov: "modernismo", texto: "Lenguaje preciosista" },
  { id: "mo-cos", mov: "modernismo", texto: "Cosmopolitismo" },
  { id: "va-form", mov: "vanguardias", texto: "Experimenta con la forma" },
  { id: "va-sint", mov: "vanguardias", texto: "Rechaza la sintaxis convencional" },
  { id: "va-rup", mov: "vanguardias", texto: "Rompe con la tradición" },
  { id: "rm-mar", mov: "realismo-magico", texto: "Elementos maravillosos" },
  { id: "rm-cot", mov: "realismo-magico", texto: "Dentro de la vida cotidiana" },
  { id: "rm-nat", mov: "realismo-magico", texto: "Se viven con naturalidad" },
];

export const rasgosDe = (m: Movimiento) => RASGOS_MOV.filter((r) => r.mov === m);
export const rasgoPorId = (id: string) => RASGOS_MOV.find((r) => r.id === id)!;

export interface Fragmento {
  id: string;
  titulo: string;
  autor: string;
  clave: string;
  texto: string;
  /** Los tres rasgos que muestra la pieza. */
  rasgos: string[];
  /** Movimiento en el que pesa más. */
  movimiento: Movimiento;
}

export const FRAGMENTOS: Fragmento[] = [
  {
    id: "fr-espejo",
    titulo: "Espejo de ceniza",
    autor: "Inés Valdivar (ficticia)",
    clave: "espejo-ceniza",
    texto: "Rosa de cristal y fuego, tu belleza es sombra que se deshace: lo que brilla se apaga y todo el mundo es engaño.",
    rasgos: ["b-orn", "b-con", "b-des"],
    movimiento: "barroco",
  },
  {
    id: "fr-acantilado",
    titulo: "Carta al acantilado",
    autor: "Teodoro Almarán (ficticio)",
    clave: "acantilado",
    texto: "Yo, solo ante el mar que ruge, rompo las reglas de mi casa: que la tormenta me escuche, que mi pena sea mayor que el cielo.",
    rasgos: ["r-yo", "r-nat", "r-reb"],
    movimiento: "romanticismo",
  },
  {
    id: "fr-lavandera",
    titulo: "La lavandera de la calle Cuarta",
    autor: "Amalia Torrescano (ficticia)",
    clave: "lavandera",
    texto: "Doña Luz lavaba ropa ajena por tres pesos la carga; el casero cobró el jueves y el patrón no pagó. Así se hacía la cuenta del mes.",
    rasgos: ["re-ord", "re-crit", "re-obj"],
    movimiento: "realismo",
  },
  {
    id: "fr-cisnes",
    titulo: "Nocturno de cisnes",
    autor: "Ariel Montesinos (ficticio)",
    clave: "cisnes",
    texto: "Cisnes de seda y luna sobre el lago de París; un violín de plata dibuja en el aire un rumor de azul y cristal.",
    rasgos: ["mo-mus", "mo-prec", "mo-cos"],
    movimiento: "modernismo",
  },
  {
    id: "fr-tranvia",
    titulo: "Caligrama del tranvía",
    autor: "Lupe Arriaga-Zeta (ficticia)",
    clave: "tranvia",
    texto: "tranvía / ¡ruido! ruido ruido / sin comas ni puntos ni /// el verso se cae por la escalera y empieza de nuevo",
    rasgos: ["va-form", "va-sint", "va-rup"],
    movimiento: "vanguardias",
  },
  {
    id: "fr-mariposas",
    titulo: "La abuela de las mariposas",
    autor: "Ernesto Palomares-Quiroz (ficticio)",
    clave: "mariposas",
    texto: "Cada tarde, a las tres, las mariposas amarillas entraban a la cocina y la abuela las saludaba sin levantar la vista del comal; nadie lo comentaba.",
    rasgos: ["rm-mar", "rm-cot", "rm-nat"],
    movimiento: "realismo-magico",
  },
  {
    id: "fr-boticario",
    titulo: "La novela del boticario",
    autor: "Sebastián Olmedo (ficticio)",
    clave: "boticario",
    texto: "Rosario lloró bajo la luna del patio, desesperada de amor; pero al amanecer tuvo que contar las monedas del mercado y regatear el precio del maíz.",
    rasgos: ["r-yo", "re-ord", "re-obj"],
    movimiento: "realismo",
  },
  {
    id: "fr-vitral",
    titulo: "Soneto del vitral",
    autor: "Casilda Mendiola-Fuentes (ficticia)",
    clave: "vitral",
    texto: "Oro en la voz del órgano, claroscuro de incienso; todo cuanto fulgura nos recuerda que nada dura, dice el vitral rosa y azul.",
    rasgos: ["b-orn", "b-des", "mo-mus"],
    movimiento: "barroco",
  },
];

/** Una pieza de frontera tiene rasgos de más de un movimiento. */
export const esFrontera = (f: Fragmento) => new Set(f.rasgos.map((r) => rasgoPorId(r).mov)).size > 1;

export interface Evaluacion {
  ok: boolean;
  /** Rasgos del movimiento elegido que aparecen en la pieza. */
  encendidos: string[];
  /** Rasgos de la pieza que NO son del movimiento elegido. */
  contradicen: Rasgo[];
  mensaje: string;
}

export function evaluar(f: Fragmento, bin: Movimiento, nombres: Record<Movimiento, string>): Evaluacion {
  const encendidos = f.rasgos.filter((r) => rasgoPorId(r).mov === bin);
  const contradicen = f.rasgos.map(rasgoPorId).filter((r) => r.mov !== bin);
  const ok = bin === f.movimiento;
  let mensaje: string;
  if (ok) {
    mensaje = `Encaja en ${nombres[bin]}: se encienden ${encendidos.length} de 3 rasgos.`;
    if (contradicen.length > 0) {
      const c = contradicen[0]!;
      mensaje += ` Ojo: «${c.texto}» es de ${nombres[c.mov]}; es una pieza de frontera, pero pesan más los de ${nombres[bin]}.`;
    }
  } else {
    const c = contradicen[0]!;
    mensaje =
      encendidos.length === 0
        ? `No encaja en ${nombres[bin]}: no se enciende ningún rasgo. «${c.texto}» es de ${nombres[c.mov]}.`
        : `Solo se enciende${encendidos.length > 1 ? "n" : ""} ${encendidos.length} de 3 rasgos de ${nombres[bin]}. «${c.texto}» pertenece a ${nombres[c.mov]}.`;
  }
  return { ok, encendidos, contradicen, mensaje };
}
