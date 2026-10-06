/**
 * Simulador del laboratorio «Causalidad histórica» (CH-I-P03).
 *
 * Caso: «¿Por qué estalló la Revolución Mexicana en 1910?». El alumno arma su
 * explicación eligiendo causas de una mesa de candidatas y las ve aparecer en
 * una línea del tiempo. Un medidor dice qué tan sólida es la explicación.
 *
 * Los hechos son los reales y los textos de las causas salen VERBATIM de
 * `causalidad-historica-data.ts` (lectura A1, glosario A5). No hay citas
 * inventadas. El peso de cada causa (puntos) es un valor de JUEGO: sirve para
 * que el medidor se mueva, no es una medida histórica.
 *
 * Reglas (deterministas):
 *  · cada causa válida suma su peso;
 *  · combinar al menos una estructural y una coyuntural suma 15 («multicausal»);
 *  · cada candidata que NO explica el evento resta 20;
 *  · sin la combinación estructural + coyuntural la explicación no pasa de 69.
 */

import { CAUSAS } from "./causalidad-historica-data";

export const EVENTO = { anio: 1910, etiqueta: "Estalla la Revolución · 1910" };

export type NaturalezaCausa = "estructural" | "coyuntural" | "consecuencia" | "ajena";

export interface Candidata {
  id: string;
  /** Nombre corto para la línea del tiempo. */
  corto: string;
  /** Texto verbatim de los datos de la progresión (o del glosario A5). */
  texto: string;
  tipo: NaturalezaCausa;
  valida: boolean;
  peso: number;
  desde: number;
  hasta: number;
  clave: string;
  icono: string;
  porque: string;
}

const t = (id: string) => CAUSAS.find((c) => c.id === id)!.texto;

export const CANDIDATAS: Candidata[] = [
  {
    id: "tierras",
    corto: "Tierras en haciendas",
    texto: t("ca-e1"),
    tipo: "estructural",
    valida: true,
    peso: 25,
    desde: 1876,
    hasta: 1910,
    clave: "hacienda-peones",
    icono: "fa-wheat-awn",
    porque: "Es una condición profunda y de larga duración (estructural): por décadas dejó sin tierra a comunidades que después reclamaron en la Revolución.",
  },
  {
    id: "dictadura",
    corto: "Dictadura porfirista",
    texto: t("ca-e2"),
    tipo: "estructural",
    valida: true,
    peso: 25,
    desde: 1876,
    hasta: 1910,
    clave: "sillon-poder",
    icono: "fa-chess-king",
    porque: "También es estructural: sin competencia electoral no había salida política al descontento, y eso preparó el terreno.",
  },
  {
    id: "desigualdad",
    corto: "Desigualdad entre clases",
    texto: "La desigualdad extrema entre las clases sociales en el Porfiriato",
    tipo: "estructural",
    valida: true,
    peso: 20,
    desde: 1876,
    hasta: 1910,
    clave: "calle-contraste",
    icono: "fa-scale-unbalanced",
    porque: "El glosario la nombra como causa estructural de la Revolución: una condición social duradera que acumula tensión.",
  },
  {
    id: "plan",
    corto: "Plan de San Luis",
    texto: t("ca-c1"),
    tipo: "coyuntural",
    valida: true,
    peso: 15,
    desde: 1910,
    hasta: 1910,
    clave: "jinetes-amanecer",
    icono: "fa-bolt",
    porque: "Es el detonante inmediato (causa contingente): llamó a levantarse en una fecha concreta, sobre un terreno ya condicionado por las causas estructurales.",
  },
  {
    id: "constitucion",
    corto: "Constitución de 1917",
    texto: t("ca-k1"),
    tipo: "consecuencia",
    valida: false,
    peso: 0,
    desde: 1917,
    hasta: 1917,
    clave: "asamblea-teatro",
    icono: "fa-scroll",
    porque: "No es causa: es consecuencia. Ocurre DESPUÉS de 1910 y una causa siempre precede al evento que explica.",
  },
  {
    id: "agraria",
    corto: "Reforma agraria",
    texto: t("ca-k2"),
    tipo: "consecuencia",
    valida: false,
    peso: 0,
    desde: 1915,
    hasta: 1915,
    clave: "campesinos-medicion",
    icono: "fa-seedling",
    porque: "Es consecuencia del movimiento, no su origen: la reforma agraria llega después de que la Revolución ya había estallado.",
  },
  {
    id: "sarajevo",
    corto: "Sarajevo 1914",
    texto: t("ca-c2"),
    tipo: "ajena",
    valida: false,
    peso: 0,
    desde: 1914,
    hasta: 1914,
    clave: "calle-1914",
    icono: "fa-earth-europe",
    porque: "Es el detonante (causa contingente) de OTRO evento, la Primera Guerra Mundial, y además ocurre 4 años después de 1910. Un hecho no explica todo lo que pasa en su época.",
  },
  {
    id: "napoleon",
    corto: "Invasión napoleónica",
    texto: t("ca-c3"),
    tipo: "ajena",
    valida: false,
    peso: 0,
    desde: 1808,
    hasta: 1808,
    clave: "tropas-1808",
    icono: "fa-flag",
    porque: "Pertenece a otro proceso: detonó la Independencia (1810), un siglo antes. Que sea anterior no basta: tiene que estar ligada a ESTE evento.",
  },
];

export const PENALIZACION = 20;
export const BONO_MULTICAUSAL = 15;
export const UMBRAL_SOLIDA = 70;

export interface Evaluacion {
  fuerza: number;
  nivel: "vacia" | "fragil" | "parcial" | "solida";
  titulo: string;
  consejo: string;
  tieneEstructural: boolean;
  tieneCoyuntural: boolean;
  intrusas: number;
}

export function evaluar(ids: string[]): Evaluacion {
  const sel = CANDIDATAS.filter((c) => ids.includes(c.id));
  const validas = sel.filter((c) => c.valida);
  const intrusas = sel.length - validas.length;
  const tieneEstructural = validas.some((c) => c.tipo === "estructural");
  const tieneCoyuntural = validas.some((c) => c.tipo === "coyuntural");
  const multicausal = tieneEstructural && tieneCoyuntural;
  let fuerza = validas.reduce((s, c) => s + c.peso, 0) + (multicausal ? BONO_MULTICAUSAL : 0) - intrusas * PENALIZACION;
  if (!multicausal) fuerza = Math.min(fuerza, UMBRAL_SOLIDA - 1);
  fuerza = Math.max(0, Math.min(100, fuerza));

  if (sel.length === 0) {
    return { fuerza: 0, nivel: "vacia", titulo: "Aún no hay explicación", consejo: "Toca una candidata para ponerla en tu explicación.", tieneEstructural, tieneCoyuntural, intrusas };
  }
  let nivel: Evaluacion["nivel"] = "fragil";
  if (fuerza >= UMBRAL_SOLIDA) nivel = "solida";
  else if (fuerza >= 35) nivel = "parcial";

  let consejo: string;
  if (intrusas > 0) consejo = "Hay candidatas que no explican este evento: no están antes de 1910 o pertenecen a otro proceso. Quítalas.";
  else if (!tieneEstructural) consejo = "Falta una condición profunda y de larga duración (causa estructural).";
  else if (!tieneCoyuntural) consejo = "Falta el detonante inmediato (causa contingente). Sin él no se explica POR QUÉ estalló en 1910.";
  else if (fuerza < UMBRAL_SOLIDA) consejo = "Ya combinas condiciones estructurales y un detonante. Suma más causas válidas para cubrir lo político, lo social y lo agrario.";
  else consejo = "Explicación multicausal: condiciones profundas más un detonante.";
  const titulo = nivel === "solida" ? "Explicación sólida y multicausal" : nivel === "parcial" ? "Explicación parcial" : "Explicación frágil";
  return { fuerza, nivel, titulo, consejo, tieneEstructural, tieneCoyuntural, intrusas };
}

/** Mensaje inmediato al añadir o quitar una candidata. */
export function mensajeCambio(id: string, agregada: boolean): string {
  const c = CANDIDATAS.find((x) => x.id === id);
  if (!c) return "";
  if (agregada) {
    return c.valida ? `Sumas «${c.corto}» (+${c.peso}). ${c.porque}` : `«${c.corto}» resta ${PENALIZACION}. ${c.porque}`;
  }
  return c.valida
    ? `Quitaste «${c.corto}»: tu explicación pierde ${c.peso} puntos y deja de cubrir esa parte del problema.`
    : `Descartaste «${c.corto}»: tu explicación recupera ${PENALIZACION} puntos. ${c.porque}`;
}

/* ── línea del tiempo ─────────────────────────────────────────────── */
export const EJE = { desde: 1800, hasta: 1925, x0: 20, x1: 540 };

export function xDe(anio: number): number {
  return EJE.x0 + ((anio - EJE.desde) / (EJE.hasta - EJE.desde)) * (EJE.x1 - EJE.x0);
}
