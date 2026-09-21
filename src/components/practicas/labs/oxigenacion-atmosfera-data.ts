/**
 * Datos y modelo del laboratorio "La oxigenación de la atmósfera" (CNEYT-III,
 * progresión 5; códigos de actividad CNEYT-III-P11-A1…A9).
 *
 * Propósito: comprender la importancia del oxígeno para la vida en la Tierra a
 * partir del análisis del proceso de oxigenación de la atmósfera primitiva y la
 * intervención de los organismos fotosintéticos.
 *
 * Anclas (VERBATIM):
 *   - A1 lectura «El oxígeno que respiramos: de la atmósfera primitiva a la
 *     actual»: marco teórico (5 párrafos) y preguntas de comprensión.
 *   - A2 ejercicio matemático «Óxidos y oxígeno: clasifica y balancea»: reto
 *     numérico (conteo de átomos y moléculas).
 *   - A4 verdadero/falso: quiz evaluable. A5 glosario (10 términos).
 *   - A6 completa el texto (10 huecos). A8 preguntas cerradas del video.
 *
 * Lo que NO es verbatim:
 *   - Modo «Mar primitivo»: modelo de sumideros de oxígeno con estequiometría
 *     real (4 Fe²⁺ + O₂ + 10 H₂O → 4 Fe(OH)₃ + 8 H⁺); las cantidades están en
 *     unidades relativas (ilustrativas).
 *   - Modo «Historia del O₂»: la banda de incertidumbre resume rangos publicados
 *     (Lyons, Reinhard y Planavsky, 2014, Nature 506: 307-315, y estimaciones
 *     del Fanerozoico); los valores intermedios son interpolaciones y el escudo
 *     de ozono es un modelo cualitativo.
 *   - Modo «Óxidos»: reacciones reales; los pH son aproximados para una
 *     disolución de laboratorio escolar.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { RetoNumericoData } from "./_reto-numerico";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Utilidades ───────────────────────────────────────────────────────── */

/** Número con miles separados por coma y punto decimal (uso de México). */
export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hexARgb(h: string): [number, number, number] {
  const v = parseInt(h.replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/** Mezcla lineal de dos colores hex. */
export function mezclaHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexARgb(a);
  const [r2, g2, b2] = hexARgb(b);
  const k = clamp01(t);
  const c = (x: number, y: number) => Math.round(x + (y - x) * k).toString(16).padStart(2, "0");
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
}

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "mar" | "historia" | "oxidos";
export const MODOS: Modo[] = ["mar", "historia", "oxidos"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  mar: { etq: "Mar primitivo", subtitulo: "Cianobacterias, hierro y el primer O₂", icono: "fa-water", color: "#2dd4bf" },
  historia: { etq: "Historia del O₂", subtitulo: "4,000 millones de años de atmósfera", icono: "fa-earth-americas", color: "#60a5fa" },
  oxidos: { etq: "Química del oxígeno", subtitulo: "Combustión, óxidos básicos y ácidos", icono: "fa-fire-flame-curved", color: "#fb923c" },
};

/* ════════════════════════════════════════════════════════════════════════
 * 1. MAR PRIMITIVO — sumideros de oxígeno
 * ════════════════════════════════════════════════════════════════════════ */

/** Hierro ferroso (Fe²⁺) disuelto al empezar, en unidades relativas. */
export const FE_INICIAL = 120;
/** Producción máxima de O₂ de las cianobacterias por ciclo (unidades). */
export const P_MAX = 12;
/** Aporte máximo de Fe²⁺ de las fuentes hidrotermales por ciclo (unidades). */
export const S_MAX = 40;
/** O₂ que consumen por ciclo los gases volcánicos reductores (H₂, CH₄, H₂S) del aire. */
export const GASES = 1;
/** Hierro precipitado que forma una banda visible en el fondo. */
export const FE_POR_BANDA = 40;
/** Estequiometría: cada molécula de O₂ oxida 4 iones Fe²⁺. */
export const FE_POR_O2 = 4;
/** Duración de un ciclo de la simulación (ms). */
export const MS_CICLO = 600;

export interface EstadoMar {
  ciclo: number;
  /** Fe²⁺ disuelto en el océano. */
  fe: number;
  /** O₂ acumulado en el aire. */
  aire: number;
  /** O₂ producido en total por las cianobacterias. */
  producido: number;
  /** Fe precipitado en total (formaciones de hierro bandeado). */
  depositado: number;
  /** Flujos del último ciclo, para dibujar. */
  flujoFe: number;
  flujoAire: number;
}

export const MAR_INICIAL: EstadoMar = { ciclo: 0, fe: FE_INICIAL, aire: 0, producido: 0, depositado: 0, flujoFe: 0, flujoAire: 0 };

/**
 * Un ciclo del modelo de sumideros:
 *  1) llega Fe²⁺ de las fuentes hidrotermales;
 *  2) el O₂ que liberan las cianobacterias oxida primero el Fe²⁺ disuelto
 *     (4 Fe²⁺ por O₂) y el Fe(OH)₃ precipita al fondo;
 *  3) el O₂ sobrante escapa al aire, donde los gases volcánicos reductores
 *     consumen una parte cada ciclo.
 */
export function pasoMar(e: EstadoMar, P: number, S: number): EstadoMar {
  const feDisponible = e.fe + S;
  const o2AlHierro = Math.min(P, feDisponible / FE_POR_O2);
  const feOxidado = o2AlHierro * FE_POR_O2;
  const sobrante = P - o2AlHierro;
  const aire0 = e.aire + sobrante;
  const aire = Math.max(0, aire0 - Math.min(GASES, aire0));
  return {
    ciclo: e.ciclo + 1,
    fe: feDisponible - feOxidado,
    aire,
    producido: e.producido + P,
    depositado: e.depositado + feOxidado,
    flujoFe: o2AlHierro,
    flujoAire: sobrante,
  };
}

/** A la larga, ¿se acumula O₂ en el aire? Solo si la producción supera a todos los sumideros. */
export function seAcumula(P: number, S: number): boolean {
  return P - S / FE_POR_O2 - GASES > 1e-9;
}

export function balanceTexto(P: number, S: number): string {
  const neto = P - S / FE_POR_O2 - GASES;
  return `${num(P)} − ${num(S)}/4 − ${GASES} = ${num(neto, Number.isInteger(neto) ? 0 : 1)}`;
}

export const bandasDe = (depositado: number) => Math.floor(depositado / FE_POR_BANDA);

/* ════════════════════════════════════════════════════════════════════════
 * 2. HISTORIA DEL OXÍGENO — curva con incertidumbre
 * ════════════════════════════════════════════════════════════════════════ */

export const T_MAX_MA = 4000;
/** Nivel actual de O₂ en el aire seco (% en volumen). */
export const O2_ACTUAL = 20.95;

/**
 * Curva de O₂ atmosférico: [millones de años atrás, log₁₀ mínimo, log₁₀ máximo]
 * expresados como fracción del nivel actual (PAL). Rangos resumidos de Lyons,
 * Reinhard y Planavsky (2014) para el Precámbrico y de las reconstrucciones del
 * Fanerozoico (máximo de ~25–35 % hace unos 300 Ma). Entre puntos se interpola.
 */
export const CURVA: [number, number, number][] = [
  [4000, -7, -5],
  [2500, -6.5, -4.5],
  [2430, -6, -4],
  [2330, -3, -1],
  [2200, -2, -0.5],
  [2060, -2.5, -1],
  [1800, -3, -1],
  [1000, -3, -1],
  [800, -2.5, -0.8],
  [635, -1.5, -0.3],
  [540, -1, -0.1],
  [420, -0.4, 0.1],
  [300, 0.08, 0.22],
  [250, -0.25, 0],
  [200, -0.25, 0],
  [100, -0.1, 0.1],
  [0, 0, 0],
];

/** Rango de log₁₀(PAL) de O₂ a una edad (Ma). */
export function rangoLog(tMa: number): { min: number; max: number; medio: number } {
  const t = Math.min(T_MAX_MA, Math.max(0, tMa));
  for (let i = 0; i < CURVA.length - 1; i++) {
    const [t0, a0, b0] = CURVA[i]!;
    const [t1, a1, b1] = CURVA[i + 1]!;
    if (t <= t0 && t >= t1) {
      const k = t0 === t1 ? 0 : (t0 - t) / (t0 - t1);
      const min = a0 + (a1 - a0) * k;
      const max = b0 + (b1 - b0) * k;
      return { min, max, medio: (min + max) / 2 };
    }
  }
  return { min: 0, max: 0, medio: 0 };
}

export const pctDeLog = (lg: number) => O2_ACTUAL * Math.pow(10, lg);

/** Porcentaje de O₂ en el aire con cifras legibles. */
export function pctTexto(p: number): string {
  if (p >= 10) return num(p, 0);
  if (p >= 1) return num(p, 1);
  if (p >= 0.1) return num(p, 2);
  if (p >= 0.00001) return p.toPrecision(1);
  return "<0.00001";
}

export function rangoTexto(tMa: number): string {
  const r = rangoLog(tMa);
  if (tMa <= 0) return `${num(O2_ACTUAL, 2)} %`;
  return `${pctTexto(pctDeLog(r.min))}–${pctTexto(pctDeLog(r.max))} %`;
}

/**
 * Escudo de ozono (0–1), modelo cualitativo: los modelos atmosféricos indican
 * que con O₂ alrededor de una centésima del nivel actual ya se forma una capa de
 * ozono que filtra buena parte del UV más dañino.
 */
export function escudoOzono(logPal: number): number {
  return clamp01((logPal + 4) / 3.5);
}

/** Qué tan «oxigenado» se ve el cielo (0 = neblina sin O₂, 1 = cielo actual). */
export function cieloOxigeno(logPal: number): number {
  return clamp01((logPal + 5) / 5);
}

export interface Hito {
  t: number;
  etq: string;
  texto: string;
  icono: string;
}

export const HITOS: Hito[] = [
  { t: 4000, etq: "Arcaico", icono: "fa-volcano", texto: "Aire sin oxígeno libre (menos de una cienmilésima del nivel actual): nitrógeno, CO₂, vapor de agua y gases reductores como metano e hidrógeno." },
  { t: 3450, etq: "Primeros estromatolitos", icono: "fa-layer-group", texto: "Hace 3,480–3,430 Ma, comunidades microbianas construyen estructuras en capas en Pilbara, Australia: los estromatolitos más antiguos ampliamente aceptados." },
  { t: 2700, etq: "Fotosíntesis que libera O₂", icono: "fa-bacteria", texto: "Evidencias geoquímicas sugieren que las cianobacterias ya liberaban O₂ hace al menos unos 2,700 Ma (la fecha exacta sigue en debate). Ese oxígeno se gastaba en hierro disuelto y gases volcánicos." },
  { t: 2500, etq: "Máximo del hierro bandeado", icono: "fa-bars-staggered", texto: "Hace unos 2,500 Ma se depositan grandes formaciones de hierro bandeado, como las de Hamersley, Australia: el O₂ oxidaba el hierro del mar y lo hacía precipitar." },
  { t: 2330, etq: "Gran Evento de Oxidación", icono: "fa-wind", texto: "Entre ~2,400 y 2,100 Ma el O₂ se acumula por primera vez en el aire. Hacia 2,330 Ma desaparece una señal de isótopos de azufre que solo se forma en un aire sin oxígeno." },
  { t: 2300, etq: "Glaciaciones huronianas", icono: "fa-snowflake", texto: "Entre 2,450 y 2,220 Ma hubo glaciaciones muy extensas; una hipótesis es que el O₂ destruyó parte del metano, un gas de efecto invernadero." },
  { t: 1850, etq: "Fin del hierro bandeado", icono: "fa-ban", texto: "Hacia 1,850 Ma casi dejan de formarse: la química del océano profundo cambia y ya no acumula tanto hierro disuelto." },
  { t: 1650, etq: "Células eucariontes", icono: "fa-circle-nodes", texto: "Los fósiles claros de eucariontes tienen unos 1,650 Ma. Sus mitocondrias usan O₂ en la respiración aerobia." },
  { t: 1300, etq: "«Mil millones aburridos»", icono: "fa-hourglass-half", texto: "Entre ~1,800 y 800 Ma el O₂ se mantiene bajo y con mucha incertidumbre: quizá entre 0.1 % y 10 % del nivel actual." },
  { t: 680, etq: "Tierra bola de nieve", icono: "fa-snowflake", texto: "Entre ~720 y 635 Ma, glaciaciones que llegaron cerca del ecuador. Coinciden con el Evento de Oxigenación Neoproterozoico (800–540 Ma), un segundo gran aumento del O₂." },
  { t: 539, etq: "Explosión cámbrica", icono: "fa-shrimp", texto: "Desde hace 538.8 Ma los animales se diversifican rápidamente; los animales grandes y activos necesitan mucho O₂." },
  { t: 470, etq: "Plantas en tierra firme", icono: "fa-seedling", texto: "Hace unos 470 Ma, con la capa de ozono ya formada, las primeras plantas colonizan los continentes." },
  { t: 300, etq: "Máximo del Carbonífero", icono: "fa-mosquito", texto: "Hace unos 300 Ma el O₂ quizá llegó a 25–35 %. Vivían insectos gigantes como Meganeura, de unos 70 cm de envergadura." },
  { t: 0, etq: "Hoy", icono: "fa-person", texto: "El aire seco tiene 20.95 % de O₂. Lo mantiene la fotosíntesis de plantas, algas y cianobacterias; el fitoplancton aporta cerca de la mitad." },
];

/** El hito más reciente que ya ocurrió a la edad `tMa`. */
export function hitoEn(tMa: number): Hito {
  let h = HITOS[0]!;
  for (const x of HITOS) if (x.t >= tMa) h = x;
  return h;
}

export type Era = "arcaico" | "goe" | "fanerozoico" | "otra";
export function eraDe(tMa: number): Era {
  if (tMa >= 2500) return "arcaico";
  if (tMa <= 2450 && tMa >= 2100) return "goe";
  if (tMa <= 539) return "fanerozoico";
  return "otra";
}

/** Glaciaciones globales (para pintar el planeta). */
export function glaciacion(tMa: number): boolean {
  return (tMa <= 2450 && tMa >= 2220) || (tMa <= 720 && tMa >= 635);
}

export function vidaEn(tMa: number): string {
  if (tMa > 3500) return "Quizá los primeros microbios anaerobios";
  if (tMa > 2700) return "Microbios anaerobios y estromatolitos";
  if (tMa > 1650) return "Bacterias, arqueas y cianobacterias";
  if (tMa > 539) return "Microbios y eucariontes (algas); al final, primeros animales";
  if (tMa > 470) return "Animales marinos: explosión cámbrica";
  if (tMa > 0) return "Plantas y animales en mar y tierra";
  return "Biosfera actual";
}

export interface PreguntaGrafica {
  pregunta: string;
  opciones: string[];
  correcta: number;
  porque: string;
}

export const PREGUNTAS_GRAFICA: PreguntaGrafica[] = [
  {
    pregunta: "Según la curva, ¿en qué intervalo el O₂ del aire pasó de trazas a valores medibles?",
    opciones: ["Hace 3,500–3,000 Ma", "Hace 2,400–2,100 Ma", "Hace unos 300 Ma"],
    correcta: 1,
    porque: "Es el Gran Evento de Oxidación: la banda sube varios órdenes de magnitud. Antes, el O₂ de las cianobacterias se gastaba en hierro disuelto y gases volcánicos.",
  },
  {
    pregunta: "¿Cuándo alcanzó el O₂ valores parecidos o mayores que el actual (21 %)?",
    opciones: ["Justo después del Gran Evento de Oxidación", "Durante los «mil millones aburridos»", "En los últimos ~550 millones de años"],
    correcta: 2,
    porque: "Tras el Gran Evento de Oxidación el O₂ se quedó muy por debajo del actual durante más de mil millones de años; solo en el Fanerozoico llega a niveles como los de hoy.",
  },
  {
    pregunta: "¿Por qué la curva es una banda y no una sola línea?",
    opciones: ["Porque el O₂ subía y bajaba cada año", "Porque se estima con evidencias indirectas en rocas antiguas, que dan rangos", "Porque nadie ha estudiado el tema"],
    correcta: 1,
    porque: "Nadie midió el aire de hace 2,000 Ma: se deduce de minerales, isótopos y fósiles. Cada método da un rango, y la ciencia lo reporta con su incertidumbre.",
  },
];

/* ════════════════════════════════════════════════════════════════════════
 * 3. QUÍMICA DEL OXÍGENO — óxidos básicos y ácidos
 * ════════════════════════════════════════════════════════════════════════ */

export type ElementoId = "mg" | "ca" | "fe" | "s" | "c";
export type Clase = "basico" | "acido";

export interface Especie {
  formula: string;
  atomos: Record<string, number>;
}

export interface Elemento {
  id: ElementoId;
  etq: string;
  simbolo: string;
  tipo: "metal" | "no metal";
  muestra: string;
  /** Cómo reacciona con el O₂. */
  proceso: "combustion" | "lenta";
  reactivo: Especie;
  producto: Especie;
  /** Coeficientes mínimos de [elemento, O₂, óxido]. */
  coef: [number, number, number];
  colorMuestra: string;
  colorProducto: string;
  colorLlama: string;
  observacion: string;
  nombreProducto: string;
  /** El óxido es un gas que se disuelve en el agua del frasco. */
  gas: boolean;
  conAgua: string;
  pH: number;
  pHTexto: string;
  clase: Clase;
  explica: string;
}

export const O2: Especie = { formula: "O₂", atomos: { O: 2 } };

export const ELEMENTOS: Elemento[] = [
  {
    id: "mg",
    etq: "Magnesio",
    simbolo: "Mg",
    tipo: "metal",
    muestra: "cinta de magnesio",
    proceso: "combustion",
    reactivo: { formula: "Mg", atomos: { Mg: 1 } },
    producto: { formula: "MgO", atomos: { Mg: 1, O: 1 } },
    coef: [2, 1, 2],
    colorMuestra: "#cbd5e1",
    colorProducto: "#f8fafc",
    colorLlama: "#ffffff",
    observacion: "Arde con una luz blanca muy intensa (no se mira directamente) y deja un polvo blanco.",
    nombreProducto: "óxido de magnesio",
    gas: false,
    conAgua: "MgO + H₂O → Mg(OH)₂",
    pH: 10,
    pHTexto: "≈ 10",
    clase: "basico",
    explica: "El magnesio es un METAL: su óxido es BÁSICO. En agua forma hidróxido de magnesio, una base (la «leche de magnesia»).",
  },
  {
    id: "ca",
    etq: "Calcio",
    simbolo: "Ca",
    tipo: "metal",
    muestra: "granallas de calcio",
    proceso: "combustion",
    reactivo: { formula: "Ca", atomos: { Ca: 1 } },
    producto: { formula: "CaO", atomos: { Ca: 1, O: 1 } },
    coef: [2, 1, 2],
    colorMuestra: "#9ca3af",
    colorProducto: "#f5f5f4",
    colorLlama: "#fb7d3c",
    observacion: "Arde con llama rojo anaranjada y deja un sólido blanco: cal viva.",
    nombreProducto: "óxido de calcio (cal viva)",
    gas: false,
    conAgua: "CaO + H₂O → Ca(OH)₂",
    pH: 12,
    pHTexto: "≈ 12",
    clase: "basico",
    explica: "El calcio es un METAL: su óxido es BÁSICO. En agua forma hidróxido de calcio, la «cal» con la que se nixtamaliza el maíz.",
  },
  {
    id: "fe",
    etq: "Hierro",
    simbolo: "Fe",
    tipo: "metal",
    muestra: "clavo de hierro húmedo",
    proceso: "lenta",
    reactivo: { formula: "Fe", atomos: { Fe: 1 } },
    producto: { formula: "Fe₂O₃", atomos: { Fe: 2, O: 3 } },
    coef: [4, 3, 2],
    colorMuestra: "#6b7280",
    colorProducto: "#9a3412",
    colorLlama: "#f97316",
    observacion: "Con humedad y O₂ se cubre poco a poco de herrumbre rojiza (aquí en cámara rápida: días en segundos).",
    nombreProducto: "óxido de hierro(III) (herrumbre)",
    gas: false,
    conAgua: "Fe₂O₃ casi no se disuelve en agua",
    pH: 7,
    pHTexto: "≈ 7",
    clase: "basico",
    explica: "El hierro es un METAL: su óxido se clasifica como BÁSICO. Pero casi no se disuelve, por eso el indicador apenas cambia: clasificar por el tipo de elemento sigue funcionando.",
  },
  {
    id: "s",
    etq: "Azufre",
    simbolo: "S",
    tipo: "no metal",
    muestra: "azufre en polvo",
    proceso: "combustion",
    reactivo: { formula: "S", atomos: { S: 1 } },
    producto: { formula: "SO₂", atomos: { S: 1, O: 2 } },
    coef: [1, 1, 1],
    colorMuestra: "#facc15",
    colorProducto: "#a3a3a3",
    colorLlama: "#3b82f6",
    observacion: "Se funde y arde con llama azul; forma un gas incoloro de olor picante: dióxido de azufre (se trabaja en campana).",
    nombreProducto: "dióxido de azufre",
    gas: true,
    conAgua: "SO₂ + H₂O → H₂SO₃",
    pH: 3,
    pHTexto: "≈ 2–3",
    clase: "acido",
    explica: "El azufre es un NO METAL: su óxido es ÁCIDO. En agua forma ácido sulfuroso; en el aire, los óxidos de azufre causan la lluvia ácida.",
  },
  {
    id: "c",
    etq: "Carbono",
    simbolo: "C",
    tipo: "no metal",
    muestra: "trozo de carbón",
    proceso: "combustion",
    reactivo: { formula: "C", atomos: { C: 1 } },
    producto: { formula: "CO₂", atomos: { C: 1, O: 2 } },
    coef: [1, 1, 1],
    colorMuestra: "#1f2937",
    colorProducto: "#57534e",
    colorLlama: "#f97316",
    observacion: "El carbón se pone al rojo vivo, casi sin llama, y forma un gas incoloro: dióxido de carbono.",
    nombreProducto: "dióxido de carbono",
    gas: true,
    conAgua: "CO₂ + H₂O → H₂CO₃",
    pH: 5,
    pHTexto: "≈ 5",
    clase: "acido",
    explica: "El carbono es un NO METAL: su óxido es ÁCIDO. En agua forma ácido carbónico, un ácido débil; por eso incluso la lluvia limpia tiene pH ≈ 5.6.",
  },
];

/** Átomos de un elemento químico en un lado de la ecuación. */
function contar(especies: { e: Especie; k: number }[]): Record<string, number> {
  const r: Record<string, number> = {};
  for (const { e, k } of especies) for (const [sim, n] of Object.entries(e.atomos)) r[sim] = (r[sim] ?? 0) + n * k;
  return r;
}

export interface Balance {
  izq: Record<string, number>;
  der: Record<string, number>;
  elementos: string[];
  balanceada: boolean;
  minima: boolean;
}

function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

export function balance(el: Elemento, coef: [number, number, number]): Balance {
  const izq = contar([
    { e: el.reactivo, k: coef[0] },
    { e: O2, k: coef[1] },
  ]);
  const der = contar([{ e: el.producto, k: coef[2] }]);
  const elementos = [el.simbolo, "O"];
  const balanceada = elementos.every((s) => (izq[s] ?? 0) === (der[s] ?? 0));
  const minima = mcd(mcd(coef[0], coef[1]), coef[2]) === 1;
  return { izq, der, elementos, balanceada, minima };
}

/** Ecuación con coeficientes (se omite el 1). */
export function ecuacion(el: Elemento, coef: [number, number, number]): string {
  const k = (n: number) => (n === 1 ? "" : `${n} `);
  return `${k(coef[0])}${el.reactivo.formula} + ${k(coef[1])}O₂ → ${k(coef[2])}${el.producto.formula}`;
}

export const COEF_MAX = 6;
export const T_ARDER = 3200;
export const T_DISOLVER = 2600;

/** Etapas del experimento: balancear → reaccionar → introducir en el frasco con agua e indicador. */
export type FaseOx = "listo" | "reaccionando" | "reaccionado" | "disolviendo" | "disuelto";

/** Color del indicador universal según el pH. */
export function colorPH(pH: number): string {
  const paradas: [number, string][] = [
    [1, "#dc2626"],
    [3, "#f97316"],
    [5, "#facc15"],
    [7, "#22c55e"],
    [9, "#0ea5e9"],
    [11, "#4f46e5"],
    [13, "#7e22ce"],
  ];
  if (pH <= paradas[0]![0]) return paradas[0]![1];
  for (let i = 0; i < paradas.length - 1; i++) {
    const [p0, c0] = paradas[i]!;
    const [p1, c1] = paradas[i + 1]!;
    if (pH <= p1) return mezclaHex(c0, c1, (pH - p0) / (p1 - p0));
  }
  return paradas[paradas.length - 1]![1];
}

/* ── Estrellas: clasifica el óxido ─────────────────────────────────────── */

export const OXIDOS: { formula: string; nombre: string; clase: Clase; porque: string }[] = [
  { formula: "MgO", nombre: "óxido de magnesio", clase: "basico", porque: "El magnesio es un metal." },
  { formula: "CaO", nombre: "óxido de calcio (cal viva)", clase: "basico", porque: "El calcio es un metal." },
  { formula: "Na₂O", nombre: "óxido de sodio", clase: "basico", porque: "El sodio es un metal." },
  { formula: "K₂O", nombre: "óxido de potasio", clase: "basico", porque: "El potasio es un metal." },
  { formula: "Fe₂O₃", nombre: "óxido de hierro(III), la herrumbre", clase: "basico", porque: "El hierro es un metal." },
  { formula: "CuO", nombre: "óxido de cobre(II)", clase: "basico", porque: "El cobre es un metal." },
  { formula: "SO₂", nombre: "dióxido de azufre", clase: "acido", porque: "El azufre es un no metal." },
  { formula: "SO₃", nombre: "trióxido de azufre", clase: "acido", porque: "El azufre es un no metal." },
  { formula: "CO₂", nombre: "dióxido de carbono", clase: "acido", porque: "El carbono es un no metal." },
  { formula: "NO₂", nombre: "dióxido de nitrógeno", clase: "acido", porque: "El nitrógeno es un no metal." },
  { formula: "P₂O₅", nombre: "pentóxido de difósforo", clase: "acido", porque: "El fósforo es un no metal." },
  { formula: "N₂O₅", nombre: "pentóxido de dinitrógeno", clase: "acido", porque: "El nitrógeno es un no metal." },
];

/** Ronda de `n` óxidos, mitad básicos y mitad ácidos, barajados. */
export function rondaOxidos(rnd: () => number, n = 6): number[] {
  const idx = (c: Clase) => OXIDOS.map((o, i) => ({ o, i })).filter((x) => x.o.clase === c).map((x) => x.i);
  const baraja = (xs: number[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  const mitad = Math.floor(n / 2);
  return baraja([...baraja(idx("basico")).slice(0, n - mitad), ...baraja(idx("acido")).slice(0, mitad)]);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM (CNEYT-III-P11)
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "El oxígeno que respiramos: de la atmósfera primitiva a la actual";

/** Lectura A1 — cinco párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "El oxígeno (O₂) que respiramos es tan común que parece que siempre estuvo ahí, pero no es así: durante miles de millones de años la Tierra casi no tuvo oxígeno libre en el aire. Entender de dónde salió —y por qué es vital— es comprender una de las grandes transformaciones químicas de nuestro planeta.",
  "LA ATMÓSFERA PRIMITIVA: REDUCTORA. Según la hipótesis de OPARIN-HALDANE, la atmósfera de la Tierra primitiva era muy distinta de la actual: era una atmósfera REDUCTORA, es decir, sin oxígeno libre (O₂) y rica en gases como metano (CH₄), amoniaco (NH₃), vapor de agua (H₂O) e hidrógeno (H₂), además de dióxido de carbono (CO₂). «Reductora» significa que predominaban sustancias capaces de ceder electrones (lo contrario de «oxidante»). En ese ambiente sin oxígeno no podrían vivir los organismos que respiran aire como nosotros, pero sí surgieron las primeras formas de vida.",
  "LA GRAN OXIDACIÓN: el papel de la fotosíntesis. El cambio llegó con la aparición de organismos FOTOSINTÉTICOS, sobre todo las CIANOBACTERIAS, hace unos 2400 millones de años. La FOTOSÍNTESIS toma dióxido de carbono y agua y, con la energía del Sol, produce materia orgánica liberando OXÍGENO como subproducto: 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂. Durante cientos de millones de años, esas bacterias fueron llenando de O₂ los océanos y luego la atmósfera, en lo que se conoce como la GRAN OXIDACIÓN. Así, la atmósfera reductora se transformó en la atmósfera OXIDANTE actual (~21% de O₂). La diferencia es enorme: la vida que respira oxígeno, incluidos nosotros, solo fue posible gracias a esos organismos fotosintéticos.",
  "EL CICLO DEL OXÍGENO. El oxígeno no se queda quieto: circula en el CICLO BIOGEOQUÍMICO DEL OXÍGENO. Los organismos fotosintéticos (plantas, algas, cianobacterias) PRODUCEN O₂; los seres vivos (incluidas las plantas de noche) lo CONSUMEN en la respiración, devolviendo CO₂; y este CO₂ vuelve a la fotosíntesis. Además, el oxígeno participa en la combustión y en la oxidación de minerales. La capa de OZONO (O₃) de la estratósfera, formada a partir de O₂, protege a la vida de la radiación ultravioleta. El ciclo del oxígeno y el del carbono están entrelazados y mantienen el equilibrio de la atmósfera.",
  "ÓXIDOS BÁSICOS Y ÁCIDOS. El oxígeno es muy reactivo y forma ÓXIDOS al combinarse con otros elementos. Hay dos grandes tipos. Los ÓXIDOS BÁSICOS se forman cuando el oxígeno reacciona con un METAL (por ejemplo, 2 Mg + O₂ → 2 MgO, óxido de magnesio; o la herrumbre del hierro); al disolverse en agua dan bases (hidróxidos). Los ÓXIDOS ÁCIDOS se forman cuando el oxígeno reacciona con un NO METAL (por ejemplo, S + O₂ → SO₂, dióxido de azufre; o C + O₂ → CO₂); al disolverse en agua dan ácidos. Estos óxidos ácidos son la causa de la LLUVIA ÁCIDA: los óxidos de azufre y nitrógeno que emiten autos e industrias se combinan con el agua de la atmósfera y forman ácidos que dañan bosques, lagos y edificios. Comprender la química del oxígeno —su origen, su ciclo y sus óxidos— explica tanto la historia de la vida en la Tierra como problemas ambientales actuales de México y el mundo.",
];

export const FUENTE_A1 =
  "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología III «Nuestro hogar. El sistema terrestre», contenido formativo: Composición química de la atmósfera reductora según Oparin-Haldane y las diferencias con la atmósfera actual · Ciclo biogeoquímico del oxígeno · Formación de óxidos básicos y ácidos.";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Cómo era la atmósfera primitiva según Oparin-Haldane y en qué se diferencia de la actual?",
  "¿Qué organismos oxigenaron la atmósfera y mediante qué proceso?",
  "¿Qué diferencia a un óxido básico de un óxido ácido?",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Atmósfera reductora", definicion: "Atmósfera sin oxígeno libre, rica en gases que ceden electrones (CH₄, NH₃, H₂).", ejemplo: "La Tierra primitiva según Oparin-Haldane." },
  { termino: "Hipótesis de Oparin-Haldane", definicion: "Propuesta de que la vida surgió en una atmósfera primitiva reductora.", ejemplo: "Base del experimento de Miller-Urey." },
  { termino: "Organismos fotosintéticos", definicion: "Seres que producen materia orgánica y liberan O₂ usando la luz.", ejemplo: "Cianobacterias, algas y plantas." },
  { termino: "Gran Oxidación", definicion: "Periodo en que la fotosíntesis llenó de O₂ océanos y atmósfera.", ejemplo: "Hace ~2400 millones de años." },
  { termino: "Ciclo del oxígeno", definicion: "Circulación del O₂: producido en la fotosíntesis y consumido en la respiración.", ejemplo: "Entrelazado con el ciclo del carbono." },
  { termino: "Óxido", definicion: "Compuesto de oxígeno con otro elemento.", ejemplo: "MgO, SO₂, CO₂, herrumbre." },
  { termino: "Óxido básico", definicion: "Óxido de un metal con el oxígeno; al disolverse da bases.", ejemplo: "2 Mg + O₂ → 2 MgO." },
  { termino: "Óxido ácido", definicion: "Óxido de un no metal con el oxígeno; al disolverse da ácidos.", ejemplo: "S + O₂ → SO₂." },
  { termino: "Lluvia ácida", definicion: "Lluvia con ácidos formados por óxidos de azufre y nitrógeno disueltos.", ejemplo: "Daña bosques, lagos y monumentos." },
  { termino: "Capa de ozono (O₃)", definicion: "Capa de la estratósfera que filtra la radiación ultravioleta.", ejemplo: "Se forma a partir del O₂." },
];

export const ACTIVIDAD_A5 =
  "Clasifica como óxido básico o ácido y di con qué se relaciona: (1) 4 Fe + 3 O₂ → 2 Fe₂O₃ (herrumbre); (2) C + O₂ → CO₂; (3) explica por qué sin organismos fotosintéticos no respiraríamos.";

/** Preguntas cerradas del video A8, con su respuesta (verbatim). */
export const HECHOS_A8: string[] = [
  "¿Qué gas comenzó a acumularse en la atmósfera gracias a la fotosíntesis de organismos primitivos? — Oxígeno.",
  "Verdadero: «La atmósfera primitiva de la Tierra no tenía la misma composición que la atmósfera actual.»",
  "Pregunta abierta: ¿Qué papel jugaron los organismos fotosintéticos en la oxigenación de la atmósfera primitiva?",
];

/** Quiz A4 «Verdadero o falso: oxígeno, atmósfera primitiva y óxidos» — verbatim. */
export const QUIZ_A4: QuizEvaluable = {
  titulo: "Verdadero o falso: oxígeno, atmósfera primitiva y óxidos",
  puntajeMinimo: 70,
  reactivos: [
    { enunciado: "Según Oparin-Haldane, la atmósfera primitiva era reductora y carecía de oxígeno libre.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 0, retroalimentacion: "Correcto: era rica en CH₄, NH₃, vapor de agua y CO₂, pero sin O₂ libre." },
    { enunciado: "El oxígeno de la atmósfera actual fue producido principalmente por organismos fotosintéticos como las cianobacterias.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 0, retroalimentacion: "Correcto: la fotosíntesis liberó O₂ durante cientos de millones de años (la Gran Oxidación)." },
    { enunciado: "Un óxido básico se forma cuando el oxígeno reacciona con un no metal.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 1, retroalimentacion: "Falso: los óxidos BÁSICOS se forman con METALES (2 Mg + O₂ → 2 MgO). Con no metales se forman óxidos ÁCIDOS." },
    { enunciado: "La fotosíntesis se resume en 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 0, retroalimentacion: "Correcto: produce glucosa y libera 6 moléculas de O₂ por cada glucosa." },
    { enunciado: "Los óxidos ácidos como el SO₂ se relacionan con la formación de la lluvia ácida.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 0, retroalimentacion: "Correcto: al disolverse en el agua de la atmósfera forman ácidos que dañan bosques, lagos y edificios." },
    { enunciado: "La atmósfera actual y la primitiva tienen la misma composición química.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 1, retroalimentacion: "Falso: la primitiva era reductora (sin O₂); la actual es oxidante, con ~21% de oxígeno." },
  ],
};

/** Ejercicio A2 «Óxidos y oxígeno: clasifica y balancea» — enunciado, pasos y respuesta verbatim. */
export const RETO_A2: RetoNumericoData = {
  titulo: "Óxidos y oxígeno: clasifica y balancea (A2)",
  contexto:
    "El ejercicio aplica el contenido formativo: composición de la atmósfera reductora vs actual, formación de óxidos básicos (metal + O₂) y ácidos (no metal + O₂) y el papel de la fotosíntesis en el ciclo del oxígeno, con la conexión a la lluvia ácida.",
  problema:
    "a) ATMÓSFERA PRIMITIVA. Menciona dos gases de la atmósfera reductora primitiva (Oparin-Haldane) y di qué gas, ausente entonces, abunda hoy (~21%).\n\nb) ÓXIDO BÁSICO. Clasifica y completa: 2 Mg + O₂ → 2 MgO. ¿Es básico o ácido? ¿Por qué? Verifica que esté balanceada contando los átomos de Mg y O.\n\nc) ÓXIDO ÁCIDO. Clasifica: S + O₂ → SO₂. ¿Es básico o ácido? ¿Por qué? ¿Con qué problema ambiental se relaciona?\n\nd) FOTOSÍNTESIS. En la ecuación 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂, ¿cuántas moléculas de O₂ se liberan por cada molécula de glucosa? ¿Por qué fue clave para oxigenar la atmósfera?",
  campos: [
    { etiqueta: "b) Átomos de Mg en cada lado de 2 Mg + O₂ → 2 MgO", objetivo: 2, tolerancia: 0, unidad: "átomos" },
    { etiqueta: "b) Átomos de O en cada lado de 2 Mg + O₂ → 2 MgO", objetivo: 2, tolerancia: 0, unidad: "átomos" },
    { etiqueta: "d) Moléculas de O₂ liberadas por cada glucosa", objetivo: 6, tolerancia: 0, unidad: "moléculas" },
  ],
  pasosGuia: [
    "a) Atmósfera reductora: metano (CH₄), amoniaco (NH₃), vapor de agua (H₂O), CO₂, H₂ (cualquier par). El gas ausente entonces y abundante hoy es el OXÍGENO (O₂, ~21%).",
    "b) ÓXIDO BÁSICO, porque el oxígeno reacciona con un METAL (magnesio). Balance: Mg 2=2; O: izquierda 2 (de O₂), derecha 2 (de 2 MgO). Está balanceada y cumple la conservación de la materia.",
    "c) ÓXIDO ÁCIDO, porque el oxígeno reacciona con un NO METAL (azufre). El SO₂ (y otros óxidos de azufre y nitrógeno) se relaciona con la LLUVIA ÁCIDA al disolverse en el agua de la atmósfera.",
    "d) Por cada molécula de glucosa (C₆H₁₂O₆) se liberan 6 moléculas de O₂. Fue clave porque, repetida durante cientos de millones de años por las cianobacterias, llenó de oxígeno los océanos y la atmósfera (Gran Oxidación).",
  ],
  respuestaFinal:
    "a) Reductora: CH₄, NH₃, H₂O, CO₂ (dos cualesquiera); hoy abunda el O₂ (~21%). b) Básico (metal Mg); balanceada (Mg 2=2, O 2=2). c) Ácido (no metal S); ligado a la lluvia ácida. d) 6 O₂ por glucosa; oxigenó la atmósfera durante la Gran Oxidación.",
};

const TEXTO_A6 =
  "Según Oparin-Haldane, la atmósfera primitiva era ___, sin oxígeno libre y rica en metano y ___. El oxígeno actual fue producido por organismos ___, como las ___, mediante la ___, en un proceso llamado la Gran ___. El oxígeno circula en su ciclo: lo producen las plantas y lo consume la ___. Cuando el oxígeno reacciona con un metal forma un óxido ___, y cuando reacciona con un no metal forma un óxido ___, causa de la lluvia ___.";

/** Actividad A6 «Completa: el origen y la química del oxígeno» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CNEYT-III-P11-A6 · Completa: el origen y la química del oxígeno",
  instrucciones: "Arrastra o escribe la palabra correcta en cada espacio.",
  partes: TEXTO_A6.split("___"),
  huecos: [
    { respuesta: "reductora", alternativas: ["reductiva"] },
    { respuesta: "amoniaco", alternativas: ["amoníaco", "NH₃", "NH3"] },
    { respuesta: "fotosintéticos", alternativas: ["fotosinteticos"] },
    { respuesta: "cianobacterias", alternativas: ["cianobacteria"] },
    { respuesta: "fotosíntesis", alternativas: ["fotosintesis", "la fotosíntesis"] },
    { respuesta: "Oxidación", alternativas: ["oxidación", "oxidacion"] },
    { respuesta: "respiración", alternativas: ["respiracion", "la respiración"] },
    { respuesta: "básico", alternativas: ["basico"] },
    { respuesta: "ácido", alternativas: ["acido"] },
    { respuesta: "ácida", alternativas: ["acida"] },
  ],
};

/* ── Textos propios del laboratorio ───────────────────────────────────── */

export const FUENTE =
  "CEN Bachillerato — CNEYT-III, progresión 5 (actividades CNEYT-III-P11): lectura A1 (" +
  FUENTE_A1 +
  "), ejercicio A2, quiz A4, glosario A5, texto A6 y video A8.";

export const PROBLEMA =
  "Durante casi la mitad de la historia de la Tierra no hubo oxígeno libre en el aire. ¿Por qué, si las cianobacterias ya lo producían? En este laboratorio ves a dónde se fue el primer oxígeno, recorres 4,000 millones de años de atmósfera y experimentas con la química que hace del O₂ un gas tan reactivo.";

export const INSTRUCCIONES: string[] = [
  "En Mar primitivo, ajusta la producción de O₂ de las cianobacterias y el hierro de las fuentes hidrotermales, predice si el O₂ llegará al aire y echa a andar los ciclos.",
  "En Historia del O₂, mueve la línea del tiempo, activa los rayos UV y responde las preguntas de la gráfica.",
  "En Química del oxígeno, balancea la ecuación, provoca la reacción, disuelve el óxido en agua con indicador y clasifícalo.",
  "Clasifica óxidos para ganar estrellas y resuelve el reto A2, el quiz A4 y el texto A6.",
];

export const IDEAS: string[] = [
  "El O₂ del aire es un subproducto de la fotosíntesis: 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂.",
  "Durante cientos de millones de años el O₂ se gastó oxidando hierro disuelto y gases volcánicos: por eso tardó en acumularse.",
  "El hierro oxidado precipitó en el fondo del mar y formó las formaciones de hierro bandeado.",
  "El O₂ se acumula en el aire solo cuando la producción supera a todos los sumideros.",
  "Con el O₂ se formó la capa de ozono, que filtra el UV y permitió la vida en tierra firme.",
  "La respiración aerobia obtiene de cada glucosa unas 15 veces más ATP (hasta ~30–32) que la fermentación (2).",
  "Metal + O₂ → óxido básico (da bases en agua); no metal + O₂ → óxido ácido (da ácidos y lluvia ácida).",
];

export const MEXICO =
  "En México aún viven estromatolitos, parientes actuales de los que oxigenaron el planeta: en las pozas de Cuatro Ciénegas, Coahuila, y en la laguna de Bacalar, Quintana Roo, donde se encuentra una de las formaciones de agua dulce más grandes del mundo.";
