/**
 * Datos y modelo del laboratorio "La ciencia como práctica humana: revisión,
 * falsabilidad y autocorrección" (CNEYT-I-P01, progresión 1 de Ciencias
 * Naturales, Experimentales y Tecnología I).
 *
 * Anclas:
 *   - A1 lectura «Las ciencias: una práctica humana, no un conjunto de
 *     verdades absolutas»: marco teórico verbatim (4 párrafos + recuadro).
 *   - A2 quiz «¿Qué sé sobre cómo funciona la ciencia?»: reto evaluable.
 *   - A6 completa el texto «la ciencia como construcción colectiva».
 *   - A4 verdadero/falso: hechos. A5 glosario: 5 términos. El ejemplo de
 *     falsabilidad de los metales que se dilatan es el del glosario A5.
 *
 * Los manuscritos del modo de revisión son EJEMPLOS DIDÁCTICOS (no estudios
 * reales). Los casos históricos (H. pylori y la deriva continental) sí son
 * reales; el peso de cada evidencia en la balanza y el porcentaje de la
 * comunidad que acepta cada idea son ilustrativos.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "revision" | "falsabilidad" | "historia";
export const MODOS: Modo[] = ["revision", "falsabilidad", "historia"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  revision: { etq: "Revisión y replicación", subtitulo: "La comunidad pone a prueba un estudio", icono: "fa-users-viewfinder", color: "#38bdf8" },
  falsabilidad: { etq: "Falsabilidad", subtitulo: "¿Puede un dato demostrar que es falsa?", icono: "fa-scale-unbalanced", color: "#f472b6" },
  historia: { etq: "La ciencia se corrige", subtitulo: "Cómo cambia el consenso con la evidencia", icono: "fa-clock-rotate-left", color: "#fbbf24" },
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

function normal(rnd: () => number): number {
  const u = Math.max(1e-9, rnd());
  const v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. REVISIÓN POR PARES Y REPLICACIÓN
 * ════════════════════════════════════════════════════════════════════════ */

export type Defecto = "muestra" | "control" | "conflicto" | "datos";
export const DEFECTOS: Defecto[] = ["muestra", "control", "conflicto", "datos"];

export const DEFECTO_DEF: Record<Defecto, { etq: string; icono: string; explica: string }> = {
  muestra: { etq: "Muestra demasiado pequeña", icono: "fa-user-group", explica: "Con muy pocos casos, la suerte puede producir un efecto que no existe." },
  control: { etq: "No hay grupo de control", icono: "fa-code-compare", explica: "Sin un grupo que no reciba el tratamiento, no se sabe si el cambio habría ocurrido de todos modos." },
  conflicto: { etq: "Conflicto de interés sin declarar", icono: "fa-sack-dollar", explica: "Quien gana con el resultado financió el estudio y no lo dijo: los lectores no pueden valorarlo." },
  datos: { etq: "Datos y método no disponibles", icono: "fa-lock", explica: "Si nadie puede ver los datos ni el procedimiento completo, nadie puede replicarlo." },
};

export type Dictamen = "aceptar" | "cambios" | "rechazar";
export const DICTAMENES: { id: Dictamen; etq: string; icono: string }[] = [
  { id: "aceptar", etq: "Aceptar", icono: "fa-circle-check" },
  { id: "cambios", etq: "Pedir cambios", icono: "fa-pen-to-square" },
  { id: "rechazar", etq: "Rechazar", icono: "fa-circle-xmark" },
];

export interface Manuscrito {
  id: string;
  titulo: string;
  afirmacion: string;
  /** Lo que el artículo dice de su diseño: el revisor debe leerlo. */
  ficha: string[];
  defectos: Defecto[];
  unidad: string;
  /** Efecto que reporta el artículo. */
  efectoReportado: number;
  /** Efecto verdadero en el modelo (lo que encontrarán las réplicas en promedio). */
  efectoReal: number;
  /** Variación de una réplica bien hecha (desviación estándar del efecto medido). */
  ruido: number;
}

/** Manuscritos de ejemplo (didácticos, no estudios reales). */
export const MANUSCRITOS: Manuscrito[] = [
  {
    id: "te",
    titulo: "Té de hierbas contra la fiebre",
    afirmacion: "Un té de hierbas baja la fiebre 1.5 °C en dos horas.",
    ficha: ["Participantes: 9 personas con fiebre.", "Todos tomaron el té; nadie tomó otra bebida para comparar.", "Financiamiento: no se menciona. (La marca del té pagó el estudio.)", "Los datos individuales no se publican."],
    defectos: ["muestra", "control", "conflicto", "datos"],
    unidad: "°C",
    efectoReportado: 1.5,
    efectoReal: 0,
    ruido: 0.15,
  },
  {
    id: "sueno",
    titulo: "Dormir poco y memoria",
    afirmacion: "Dormir menos de 6 horas reduce 18 % las palabras que se recuerdan al día siguiente.",
    ficha: ["Participantes: 240 estudiantes asignados al azar a dormir 5 u 8 horas.", "Grupo de control: el de 8 horas.", "Financiamiento: universidad pública, declarado.", "Datos y protocolo publicados en un repositorio abierto."],
    defectos: [],
    unidad: "%",
    efectoReportado: 18,
    efectoReal: 16,
    ruido: 3,
  },
  {
    id: "fertilizante",
    titulo: "Fertilizante para maíz",
    afirmacion: "Un fertilizante nuevo aumenta 30 % la cosecha de maíz.",
    ficha: ["Muestra: 60 parcelas, la mitad con el fertilizante.", "Grupo de control: 30 parcelas con el fertilizante de siempre.", "Financiamiento: la empresa que lo fabrica, declarado en el artículo.", "Los datos por parcela no se publican: «son confidenciales»."],
    defectos: ["datos"],
    unidad: "%",
    efectoReportado: 30,
    efectoReal: 11,
    ruido: 4,
  },
  {
    id: "videojuegos",
    titulo: "Videojuegos y atención",
    afirmacion: "Jugar videojuegos de acción mejora 25 % la atención visual.",
    ficha: ["Participantes: 12 jóvenes, 6 juegan y 6 no.", "Grupo de control: los 6 que no juegan.", "Financiamiento: fondo público, declarado.", "Datos y pruebas publicados."],
    defectos: ["muestra"],
    unidad: "%",
    efectoReportado: 25,
    efectoReal: 6,
    ruido: 4,
  },
];

/** El dictamen que corresponde: sin defectos se acepta, con uno se piden cambios, con dos o más se rechaza. */
export function dictamenCorrecto(m: Manuscrito): Dictamen {
  return m.defectos.length === 0 ? "aceptar" : m.defectos.length === 1 ? "cambios" : "rechazar";
}

export const N_LABS = 5;

/** Los laboratorios que replican (instituciones mexicanas y extranjeras, como ejemplo). */
export const LABS: string[] = ["UNAM", "Cinvestav", "U. de Guadalajara", "Universidad de Chile", "U. de Toronto"];

/** Efecto medido por cada réplica independiente. */
export function replicas(m: Manuscrito, rnd: () => number = Math.random): number[] {
  return Array.from({ length: N_LABS }, () => m.efectoReal + m.ruido * normal(rnd));
}

export type Veredicto = "replicado" | "menor" | "noReplicado";

/**
 * Qué concluye la comunidad al ver las réplicas: si el promedio llega a dos
 * tercios de lo reportado se confirma; si hay efecto claro pero menor, el
 * resultado se corrige a la baja; si no se distingue de cero, no se replicó.
 */
export function veredicto(m: Manuscrito, medidos: number[]): Veredicto {
  const prom = medidos.reduce((a, b) => a + b, 0) / medidos.length;
  const errorProm = m.ruido / Math.sqrt(medidos.length);
  if (prom >= (2 / 3) * m.efectoReportado) return "replicado";
  if (prom > 2.5 * errorProm) return "menor";
  return "noReplicado";
}

export const VEREDICTO_DEF: Record<Veredicto, { etq: string; color: string; explica: string }> = {
  replicado: { etq: "Replicado", color: "#34d399", explica: "Laboratorios independientes obtienen un efecto parecido: el resultado gana confianza." },
  menor: { etq: "Efecto real pero menor", color: "#fbbf24", explica: "El efecto existe, pero es más pequeño que lo publicado: la comunidad corrige la cifra." },
  noReplicado: { etq: "No se replicó", color: "#f87171", explica: "Nadie encuentra el efecto: el artículo se corrige o se retracta. Así se detecta un error aunque la revisión lo haya dejado pasar." },
};

/* ════════════════════════════════════════════════════════════════════════
 * 2. FALSABILIDAD
 * ════════════════════════════════════════════════════════════════════════ */

export type Prueba = "metal" | "hervir" | "cisnes" | "dragon";

export interface Afirmacion {
  id: Prueba;
  texto: string;
  falsable: boolean;
  prediccion: string;
  fuente: string;
}

export const AFIRMACIONES: Afirmacion[] = [
  { id: "metal", texto: "Todos los metales se dilatan con el calor.", falsable: true, prediccion: "Si calientas una barra de metal, debe alargarse. Una barra que no se alarga la refutaría.", fuente: "Ejemplo del glosario A5" },
  { id: "hervir", texto: "El agua pura siempre hierve a 100 °C.", falsable: true, prediccion: "En cualquier lugar, el termómetro debe marcar 100 °C cuando el agua hierve.", fuente: "Ejemplo del laboratorio" },
  { id: "cisnes", texto: "Todos los cisnes son blancos.", falsable: true, prediccion: "Nunca debería encontrarse un cisne de otro color. Uno solo la refuta.", fuente: "Ejemplo clásico del filósofo Karl Popper" },
  { id: "dragon", texto: "En mi cochera vive un dragón invisible, que no pesa, no se puede tocar y no deja huellas.", falsable: false, prediccion: "Ningún resultado podría contradecirla: cada prueba tiene una excusa preparada.", fuente: "Ejemplo del astrónomo Carl Sagan" },
];

/* ── Metal: dilatación lineal ΔL = α · L₀ · ΔT ─────────────────────────── */

export const METALES = [
  { id: "aluminio", etq: "Aluminio", alfa: 23e-6, color: "#cbd5e1" },
  { id: "cobre", etq: "Cobre", alfa: 17e-6, color: "#d97706" },
  { id: "acero", etq: "Acero", alfa: 12e-6, color: "#94a3b8" },
] as const;
export type MetalId = (typeof METALES)[number]["id"];
export const L0_MM = 1000;
export const T_AMBIENTE = 20;
export const T_MAX = 320;

export function dilatacionMm(alfa: number, tC: number): number {
  return alfa * L0_MM * (tC - T_AMBIENTE);
}

/* ── Hervir: punto de ebullición según la altitud ──────────────────────── */

export const LUGARES = [
  { id: "veracruz", etq: "Veracruz (puerto)", altitud: 10 },
  { id: "cdmx", etq: "Ciudad de México", altitud: 2240 },
  { id: "toluca", etq: "Toluca", altitud: 2660 },
  { id: "pico", etq: "Pico de Orizaba (cumbre)", altitud: 5636 },
] as const;
export type LugarId = (typeof LUGARES)[number]["id"];

/** Presión atmosférica estándar (kPa) a una altitud en metros. */
export function presionKPa(altitud: number): number {
  return 101.325 * Math.pow(1 - 2.25577e-5 * altitud, 5.25588);
}

/** Punto de ebullición del agua (°C) con Clausius–Clapeyron, L = 40.65 kJ/mol. */
export function ebullicion(altitud: number): number {
  const R = 8.314;
  const L = 40650;
  const inv = 1 / 373.15 - (R * Math.log(presionKPa(altitud) / 101.325)) / L;
  return 1 / inv - 273.15;
}

/* ── Cisnes ────────────────────────────────────────────────────────────── */

export const REGIONES = [
  { id: "europa", etq: "Europa", negros: 0, fuente: "Cisne vulgar (Cygnus olor), blanco" },
  { id: "norteamerica", etq: "Norteamérica", negros: 0, fuente: "Cisne trompetero (Cygnus buccinator), blanco" },
  { id: "australia", etq: "Australia", negros: 5, fuente: "Cisne negro (Cygnus atratus), descrito por naturalistas europeos en 1697" },
] as const;
export type RegionId = (typeof REGIONES)[number]["id"];

/* ── Dragón: cada prueba tiene una excusa ──────────────────────────────── */

export const PRUEBAS_DRAGON = [
  { id: "harina", etq: "Echar harina en el piso para ver sus huellas", icono: "fa-shoe-prints", excusa: "«Es que flota: no toca el piso.»" },
  { id: "infrarrojo", etq: "Usar una cámara infrarroja para ver su calor", icono: "fa-temperature-high", excusa: "«Su fuego es frío: no da calor.»" },
  { id: "pintura", etq: "Rociar pintura para ver su silueta", icono: "fa-spray-can", excusa: "«No tiene cuerpo: la pintura lo atraviesa.»" },
  { id: "bascula", etq: "Pesarlo con una báscula", icono: "fa-weight-scale", excusa: "«No pesa nada, ya te lo dije.»" },
] as const;
export type PruebaDragonId = (typeof PRUEBAS_DRAGON)[number]["id"];

/* ── Estrellas: ¿es científica? ────────────────────────────────────────── */

export const ENUNCIADOS: { texto: string; falsable: boolean; porque: string }[] = [
  { texto: "El agua salada se congela a menor temperatura que el agua dulce.", falsable: true, porque: "Basta congelar las dos y medir." },
  { texto: "Todo lo que pasa es parte de un destino que no podemos conocer.", falsable: false, porque: "Cualquier cosa que ocurra encaja: nada podría refutarla." },
  { texto: "Las plantas de frijol crecen más con 12 horas de luz que con 4.", falsable: true, porque: "Se pueden cultivar dos grupos y medir su altura." },
  { texto: "Este amuleto funciona, pero solo si crees en él lo suficiente.", falsable: false, porque: "Si falla, siempre se puede decir que no creíste bastante." },
  { texto: "Los objetos caen con la misma aceleración si no hay aire.", falsable: true, porque: "Se comprueba dejando caer objetos en una cámara de vacío." },
  { texto: "Existen universos paralelos con los que jamás podremos tener contacto.", falsable: false, porque: "Si nunca habrá contacto, ningún dato podría contradecirlo." },
  { texto: "Lavarse las manos con jabón reduce las bacterias de la piel.", falsable: true, porque: "Se cuentan bacterias antes y después de lavarse." },
  { texto: "Los fantasmas están aquí, pero desaparecen cuando alguien los busca.", falsable: false, porque: "Está construida para que ninguna búsqueda la refute." },
  { texto: "El ejercicio diario baja la presión arterial en adultos.", falsable: true, porque: "Se compara la presión de quienes hacen ejercicio y quienes no." },
  { texto: "La mala suerte existe, aunque no siempre se note.", falsable: false, porque: "Si no se nota, ningún resultado la contradice." },
];

export function rondaEnunciados(rnd: () => number, n = 6): number[] {
  const verdaderos = ENUNCIADOS.map((e, i) => ({ e, i })).filter((x) => x.e.falsable).map((x) => x.i);
  const falsos = ENUNCIADOS.map((e, i) => ({ e, i })).filter((x) => !x.e.falsable).map((x) => x.i);
  const baraja = (xs: number[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  const mitad = Math.floor(n / 2);
  return baraja([...baraja(verdaderos).slice(0, n - mitad), ...baraja(falsos).slice(0, mitad)]);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. LA CIENCIA SE CORRIGE — casos históricos reales
 * ════════════════════════════════════════════════════════════════════════ */

export interface Hito {
  anio: string;
  texto: string;
  /** Hacia qué idea empuja: la establecida o la nueva. */
  apoya: "vieja" | "nueva";
  /** Peso ilustrativo de la evidencia en la balanza. */
  peso: number;
  /** Porcentaje ilustrativo de la comunidad que acepta la idea nueva después de este hito. */
  consenso: number;
}

export interface Caso {
  id: "ulcera" | "deriva";
  etq: string;
  vieja: string;
  nueva: string;
  hitos: Hito[];
  leccion: string;
}

export const CASOS: Caso[] = [
  {
    id: "ulcera",
    etq: "Las úlceras y una bacteria",
    vieja: "Las úlceras las causan el estrés y el exceso de ácido",
    nueva: "Una bacteria, Helicobacter pylori, causa la mayoría de las úlceras",
    hitos: [
      { anio: "Antes de 1980", texto: "Los médicos enseñan que el estómago es demasiado ácido para que vivan bacterias; las úlceras se tratan con dieta, calma y antiácidos.", apoya: "vieja", peso: 3, consenso: 2 },
      { anio: "1979", texto: "El patólogo Robin Warren observa bacterias en forma de espiral en biopsias de estómagos inflamados.", apoya: "nueva", peso: 1, consenso: 4 },
      { anio: "1982", texto: "Warren y el médico Barry Marshall logran cultivar la bacteria en el laboratorio.", apoya: "nueva", peso: 1, consenso: 8 },
      { anio: "1984", texto: "Muchos colegas dudan. Marshall bebe un cultivo de la bacteria, desarrolla gastritis y la cura con antibióticos.", apoya: "nueva", peso: 1.5, consenso: 20 },
      { anio: "1994", texto: "Tras años de estudios replicados en varios países, los Institutos Nacionales de Salud de EUA recomiendan tratar con antibióticos las úlceras con H. pylori.", apoya: "nueva", peso: 2.5, consenso: 80 },
      { anio: "2005", texto: "Warren y Marshall reciben el Premio Nobel de Fisiología o Medicina.", apoya: "nueva", peso: 1, consenso: 95 },
    ],
    leccion: "La idea nueva tardó más de una década en aceptarse: no bastó con que fuera cierta, hubo que acumular evidencia replicada que convenciera a la comunidad.",
  },
  {
    id: "deriva",
    etq: "Los continentes se mueven",
    vieja: "Los continentes y los océanos están fijos en su lugar",
    nueva: "Los continentes se desplazan sobre placas en movimiento",
    hitos: [
      { anio: "Antes de 1912", texto: "La mayoría de los geólogos considera que continentes y océanos ocupan siempre el mismo lugar.", apoya: "vieja", peso: 3, consenso: 2 },
      { anio: "1912", texto: "Alfred Wegener propone la deriva continental: las costas encajan y hay fósiles iguales en continentes separados.", apoya: "nueva", peso: 1.2, consenso: 8 },
      { anio: "Años 20 y 30", texto: "Muchos geólogos la rechazan: Wegener no explica qué fuerza podría mover los continentes.", apoya: "vieja", peso: 1, consenso: 5 },
      { anio: "Años 50", texto: "El paleomagnetismo de las rocas muestra que los continentes han cambiado de posición.", apoya: "nueva", peso: 1.2, consenso: 25 },
      { anio: "1962–1963", texto: "Harry Hess propone la expansión del fondo oceánico y Vine y Matthews explican sus bandas magnéticas simétricas.", apoya: "nueva", peso: 2, consenso: 60 },
      { anio: "Finales de los 60", texto: "La tectónica de placas une las evidencias y se acepta como la teoría que explica el movimiento de los continentes.", apoya: "nueva", peso: 2, consenso: 92 },
    ],
    leccion: "Wegener tenía parte de razón, pero le faltaba un mecanismo. La comunidad no la aceptó por autoridad, sino cuando nuevas mediciones la volvieron difícil de negar.",
  },
];

/** Pesos acumulados en cada platillo hasta el hito `k` (incluido). */
export function pesosHasta(c: Caso, k: number): { vieja: number; nueva: number } {
  let vieja = 0;
  let nueva = 0;
  c.hitos.slice(0, k + 1).forEach((h) => {
    if (h.apoya === "vieja") vieja += h.peso;
    else nueva += h.peso;
  });
  return { vieja, nueva };
}

/** Inclinación de la balanza en radianes (positiva: baja el platillo de la idea nueva). */
export function inclinacion(p: { vieja: number; nueva: number }): number {
  const total = p.vieja + p.nueva;
  if (total === 0) return 0;
  return ((p.nueva - p.vieja) / total) * 0.38;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Las ciencias: una práctica humana, no un conjunto de verdades absolutas";

/** Lectura A1 — cuatro párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "La ciencia suele presentarse en los libros de texto como un conjunto de hechos establecidos y verdades definitivas. Pero esta imagen distorsiona profundamente lo que la ciencia realmente es: una práctica social, histórica y colectiva, llena de errores, debates, revisiones y contextos culturales.",
  "La ciencia se hace en laboratorios, universidades, instituciones y comunidades. Los científicos son personas con biografías, intereses, creencias y sesgos. Las preguntas que investigan no son neutrales: responden a las necesidades, intereses y valores de su época. El desarrollo de la física nuclear durante la Segunda Guerra Mundial fue posible gracias a enormes inversiones militares. La farmacología moderna está influida por los intereses de la industria.",
  "Esto no significa que la ciencia sea \"solo opinión\" o que todo valga. Significa que el conocimiento científico se construye colectivamente mediante procesos de revisión, debate, replicación de experimentos y crítica entre pares. Una hipótesis que nadie puede refutar (porque está mal diseñada para ser refutable) no es científica: es dogma.",
  "Admitir que la ciencia es una práctica humana imperfecta no la invalida: al contrario, hace que confiemos en ella por mejores razones. Confiamos en la ciencia no porque los científicos sean infalibles, sino porque el método científico incluye mecanismos para detectar y corregir errores.",
];

/** Recuadro «importante» de la lectura A1 — verbatim. */
export const RECUADRO_A1 =
  "La investigación científica en México está coordinada por el CONAHCYT (ex CONACYT). El Sistema Nacional de Investigadoras e Investigadores (SNII) agrupa a más de 35,000 científicos activos en universidades e institutos de todo el país, con presencia en todas las áreas del conocimiento.";

/** Nota de actualización (no verbatim): el organismo cambió de nombre en 2025. */
export const NOTA_RECUADRO = "Actualización: desde 2025 el CONAHCYT se transformó en la Secretaría de Ciencia, Humanidades, Tecnología e Innovación (SECIHTI).";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Por qué el texto dice que la imagen de la ciencia en los libros de texto es distorsionada?",
  "¿Qué hace que el conocimiento científico sea confiable según el texto?",
  "¿Por qué una hipótesis irrefutable no es científica?",
];

/** Hechos: quiz A4 (verdadero/falso), cada enunciado con su retroalimentación. */
export const HECHOS: string[] = [
  "Falso: «La ciencia es un conjunto de verdades absolutas que nunca cambian». El conocimiento científico es provisional: se revisa y corrige con nueva evidencia.",
  "Verdadero: «El conocimiento científico se construye de forma colectiva mediante debate, replicación y revisión por pares». Por eso es confiable, no por la autoridad de quien lo dice.",
  "Falso: «Una hipótesis que no puede ponerse a prueba ni ser refutada es científica». Para ser científica una hipótesis debe ser falsable: debe poder refutarse.",
  "Verdadero: «El financiamiento y los intereses de cada época pueden influir en qué preguntas investiga la ciencia». La ciencia es una práctica social situada en contextos culturales y económicos.",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Práctica social", definicion: "Actividad construida por comunidades humanas con sus contextos e intereses.", ejemplo: "La ciencia se hace en universidades, institutos y comunidades." },
  { termino: "Falsabilidad", definicion: "Propiedad de una hipótesis que permite ponerla a prueba y refutarla.", ejemplo: "'Todos los metales se dilatan con el calor' es falsable." },
  { termino: "Revisión por pares", definicion: "Evaluación de una investigación por otros expertos antes de publicarse.", ejemplo: "Una revista científica envía el artículo a revisores." },
  { termino: "Replicación", definicion: "Repetir un experimento para verificar que da los mismos resultados.", ejemplo: "Otro laboratorio repite el estudio y confirma el hallazgo." },
  { termino: "Epistemología", definicion: "Rama que estudia cómo se produce y valida el conocimiento.", ejemplo: "Pregunta: ¿qué hace confiable a una afirmación científica?" },
];

export const ACTIVIDAD_A5 = "Explica con tus palabras por qué la replicación hace más confiable a la ciencia.";

export const FUENTE = "CEN Bachillerato — CNEYT-I, progresión 1: lectura A1 (Material elaborado para CEN Bachillerato), quiz A2, quiz A4, glosario A5 y actividad A6.";

export const PROBLEMA =
  "Si los científicos son personas con intereses y sesgos, ¿por qué confiar en la ciencia? En este laboratorio revisas estudios como lo haría la comunidad científica, pones a prueba afirmaciones para ver si pueden refutarse y sigues dos casos reales en los que la ciencia corrigió lo que creía.";

export const INSTRUCCIONES: string[] = [
  "En Revisión y replicación, lee el manuscrito, marca sus defectos y da tu dictamen. Después manda el estudio a cinco laboratorios independientes.",
  "En Falsabilidad, elige una afirmación y ponla a prueba: calienta la barra, cambia de lugar, explora regiones o intenta detectar al dragón.",
  "En La ciencia se corrige, avanza hito por hito y mira cómo se inclina la balanza de la evidencia y cambia la comunidad.",
  "Clasifica enunciados en «¿Es científica?» para ganar estrellas y resuelve el quiz A2 y el texto A6.",
];

export const IDEAS: string[] = [
  "La ciencia es provisional: sus conclusiones cambian cuando aparece nueva evidencia.",
  "La revisión por pares filtra errores antes de publicar, pero no es infalible.",
  "La replicación por laboratorios independientes detecta lo que la revisión dejó pasar.",
  "Una hipótesis es científica si algún dato posible podría refutarla.",
  "Una prueba superada no demuestra una hipótesis para siempre: solo la deja en pie por ahora.",
  "El consenso cambia por la acumulación de evidencia, no por la autoridad de una persona.",
];

/** Quiz A2 «¿Qué sé sobre cómo funciona la ciencia?» — verbatim. */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Qué sé sobre cómo funciona la ciencia?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Por qué la ciencia NO es un conjunto de verdades absolutas?",
      opciones: ["Porque los científicos son poco confiables", "Porque el conocimiento científico se construye, revisa y corrige constantemente", "Porque no usa métodos rigurosos", "Porque está influida por el gobierno"],
      respuestaCorrecta: 1,
      retroalimentacion: "La ciencia es provisional y autocorrectiva: sus conclusiones cambian cuando hay nueva evidencia.",
    },
    {
      enunciado: "¿Cuál de estas características hace al conocimiento científico confiable?",
      opciones: ["Que lo dice una persona famosa", "Que los resultados pueden replicarse y son evaluados por otros expertos", "Que está publicado en internet", "Que es muy antiguo y probado por el tiempo"],
      respuestaCorrecta: 1,
      retroalimentacion: "La replicabilidad y la revisión por pares son los mecanismos que hacen confiable al conocimiento científico.",
    },
    {
      enunciado: "¿Qué significa que la ciencia es una práctica 'social'?",
      opciones: ["Que los científicos son muy sociables", "Que se hace en comunidades de personas que comparten, debaten y critican resultados", "Que se hace en redes sociales", "Que todos pueden hacer ciencia sin formación"],
      respuestaCorrecta: 1,
      retroalimentacion: "La ciencia es social porque se construye colectivamente mediante el debate, la crítica y la colaboración entre científicos.",
    },
    {
      enunciado: "¿Qué hace que una hipótesis sea científica?",
      opciones: ["Que sea propuesta por un científico famoso", "Que pueda ser puesta a prueba y potencialmente refutada", "Que sea muy compleja y difícil de entender", "Que esté publicada en un libro de texto"],
      respuestaCorrecta: 1,
      retroalimentacion: "Una hipótesis científica debe ser falsificable: debe ser posible diseñar un experimento que la refute.",
    },
    {
      enunciado: "¿Por qué los intereses económicos o políticos pueden influir en la ciencia?",
      opciones: ["Porque los científicos son corruptos en general", "Porque la investigación requiere financiamiento y quienes financian pueden orientar las preguntas que se investigan", "Porque la ciencia y la política son lo mismo", "Porque no existen organismos que regulen la ciencia"],
      respuestaCorrecta: 1,
      retroalimentacion: "El financiamiento de la investigación influye en qué preguntas se investigan, aunque el método científico busca neutralizar sesgos.",
    },
  ],
};

/** Actividad A6 «Completa: la ciencia como construcción colectiva» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CNEYT-I-P01-A6 · Completa: la ciencia como construcción colectiva",
  instrucciones: "Completa cada espacio con la palabra correcta.",
  partes: [
    "La ciencia no es un conjunto de verdades absolutas, sino una práctica ",
    " e histórica. Una hipótesis es científica solo si puede ser ",
    " por los datos. Para confiar en un resultado, otros científicos deben poder ",
    " el experimento y obtener lo mismo.",
  ],
  huecos: [
    { respuesta: "social", alternativas: ["colectiva"], pista: "Se construye entre muchas personas." },
    { respuesta: "refutada", alternativas: ["falsada", "puesta a prueba"], pista: "Debe poder demostrarse falsa." },
    { respuesta: "replicar", alternativas: ["repetir", "reproducir"], pista: "Volver a hacerlo igual." },
  ],
};
