/**
 * Datos para el laboratorio de Formas y transformación de la energía
 * (CNEYT-II-P01-A1, "Formas de energía en el mundo cotidiano"; progresión 1).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabEnergiaFormas.tsx) y la escena 3D (EnergiaFormasScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-II, "El poder de la energía"):
 * La energía es la capacidad de producir cambios; no se crea ni se destruye,
 * solo se TRANSFORMA de una forma a otra (conservación de la energía). Existen
 * distintas FORMAS —cinética, potencial, térmica, luminosa, eléctrica, química—
 * y los aparatos cotidianos son TRANSFORMADORES que convierten una forma en
 * otra. En cada conversión real una parte se disipa como calor (energía térmica),
 * por eso ningún transformador es 100% eficiente; pero la energía total siempre
 * se conserva: entrada = salida útil + calor disipado.
 *
 * Este laboratorio complementa —sin repetir— al del péndulo (P02), que solo
 * muestra el vaivén cinética↔potencial. Aquí el foco son las CADENAS de
 * transformación entre muchas formas y el "impuesto" de calor en cada paso.
 *
 * Nota de honestidad: salvo la bombilla incandescente (5% luz / 95% calor, dato
 * verbatim de la actividad CNEYT-II-P01-A2), las eficiencias son valores
 * aproximados típicos, etiquetados como tales en la interfaz.
 */

/* ── Formas de energía ────────────────────────────────────────────────── */
export type FormaKey =
  | "cinetica"
  | "potencial"
  | "termica"
  | "luminosa"
  | "electrica"
  | "quimica";

export interface Forma {
  key: FormaKey;
  nombre: string;
  color: string; // hex
  icono: string; // Font Awesome 6 (solid)
  descripcion: string;
  formula?: string;
}

export const FORMAS: Forma[] = [
  { key: "cinetica", nombre: "Cinética", color: "#4aa8ff", icono: "fa-person-running",
    descripcion: "La energía del movimiento. Depende de la masa y la velocidad.", formula: "Ec = ½ m v²" },
  { key: "potencial", nombre: "Potencial", color: "#b388ff", icono: "fa-arrow-down-long",
    descripcion: "Energía almacenada por la posición; se libera al caer.", formula: "Ep = m g h" },
  { key: "termica", nombre: "Térmica", color: "#ff7a4a", icono: "fa-temperature-high",
    descripcion: "Movimiento de átomos y moléculas: a más movimiento, mayor temperatura." },
  { key: "luminosa", nombre: "Luminosa", color: "#ffd24a", icono: "fa-sun",
    descripcion: "Transportada por ondas electromagnéticas, como la luz del Sol." },
  { key: "electrica", nombre: "Eléctrica", color: "#3ee0ff", icono: "fa-bolt",
    descripcion: "Resultado del movimiento de cargas a través de un conductor." },
  { key: "quimica", nombre: "Química", color: "#34d399", icono: "fa-flask",
    descripcion: "Energía almacenada en los enlaces de los alimentos y combustibles." },
];

export const getForma = (key: FormaKey): Forma => FORMAS.find((f) => f.key === key) ?? FORMAS[0]!;

/* ── Transformadores (cadenas de conversión) ──────────────────────────── */
export interface Etapa {
  de: FormaKey;
  a: FormaKey;
  /** Fracción 0..1 de la energía que continúa como la forma "a"; el resto es calor. */
  eficiencia: number;
  /** Pieza que realiza la conversión. */
  dispositivo: string;
}

export interface Transformador {
  key: string;
  nombre: string;
  icono: string;
  /** Cadena de conversiones; la entrada es etapas[0].de. */
  etapas: Etapa[];
  resumen: string;
  /** ¿La eficiencia es dato verbatim de la actividad (true) o típico aproximado (false)? */
  verbatim: boolean;
}

export const TRANSFORMADORES: Transformador[] = [
  {
    key: "hidroelectrica",
    nombre: "Planta hidroeléctrica",
    icono: "fa-water",
    etapas: [
      { de: "potencial", a: "cinetica", eficiencia: 0.95, dispositivo: "Caída del agua → turbina" },
      { de: "cinetica", a: "electrica", eficiencia: 0.95, dispositivo: "Generador" },
    ],
    resumen:
      "El agua embalsada tiene energía potencial; al caer se vuelve cinética y mueve la turbina, y el generador la convierte en eléctrica. Es de las conversiones más eficientes (~90%).",
    verbatim: false,
  },
  {
    key: "solar",
    nombre: "Panel solar fotovoltaico",
    icono: "fa-solar-panel",
    etapas: [
      { de: "luminosa", a: "electrica", eficiencia: 0.18, dispositivo: "Celda fotovoltaica" },
    ],
    resumen:
      "La celda fotovoltaica convierte la energía luminosa del Sol directamente en energía eléctrica. Solo aprovecha ~18% de la luz; el resto se pierde como calor.",
    verbatim: false,
  },
  {
    key: "cuerpo",
    nombre: "Cuerpo humano",
    icono: "fa-person-walking",
    etapas: [
      { de: "quimica", a: "cinetica", eficiencia: 0.25, dispositivo: "Metabolismo → músculos" },
    ],
    resumen:
      "Tu cuerpo convierte la energía química de los alimentos en energía mecánica (movimiento). Solo ~25% se vuelve movimiento; el ~75% restante es el calor que te mantiene tibio.",
    verbatim: false,
  },
  {
    key: "bombilla",
    nombre: "Foco incandescente",
    icono: "fa-lightbulb",
    etapas: [
      { de: "electrica", a: "luminosa", eficiencia: 0.05, dispositivo: "Filamento" },
    ],
    resumen:
      "El foco incandescente convierte energía eléctrica en luz… pero solo el 5%. El 95% se va en calor: por eso quema al tocarlo y por eso los LED lo reemplazaron.",
    verbatim: true,
  },
];

export const getTransformador = (key: string): Transformador =>
  TRANSFORMADORES.find((t) => t.key === key) ?? TRANSFORMADORES[0]!;

export const DEFAULT_TRANSFORMADOR = "hidroelectrica";

/* ── Entrada de energía (control) ─────────────────────────────────────── */
export const E_MIN = 20;
export const E_MAX = 100;
export const E_STEP = 5;
export const E_DEFAULT = 100;

/* ── Balance de energía (conservación) ────────────────────────────────── */
export interface EtapaCalculada extends Etapa {
  entra: number; // energía que entra a la etapa
  sale: number; // energía útil que sale (forma "a")
  calor: number; // energía disipada como calor en la etapa
}

export interface Balance {
  entrada: number; // energía inicial E0
  formaEntrada: FormaKey;
  formaFinal: FormaKey;
  etapas: EtapaCalculada[];
  util: number; // energía útil final (forma "a" de la última etapa)
  calorTotal: number; // calor disipado acumulado
  eficienciaGlobal: number; // util / entrada (0..1)
}

/**
 * Calcula el balance de energía a lo largo de la cadena.
 * Garantiza conservación exacta: util + calorTotal = entrada.
 */
export const calcularBalance = (t: Transformador, E0: number): Balance => {
  let current = E0;
  let calorTotal = 0;
  const etapas: EtapaCalculada[] = [];
  for (const e of t.etapas) {
    const sale = current * e.eficiencia;
    const calor = current - sale; // = current * (1 - eficiencia)
    calorTotal += calor;
    etapas.push({ ...e, entra: current, sale, calor });
    current = sale;
  }
  return {
    entrada: E0,
    formaEntrada: t.etapas[0]!.de,
    formaFinal: t.etapas[t.etapas.length - 1]!.a,
    etapas,
    util: current,
    calorTotal,
    eficienciaGlobal: E0 > 0 ? current / E0 : 0,
  };
};

/* ── Casos de identificación (verbatim de CNEYT-II-P01-A2) ────────────── */
export interface CasoIdentif {
  caso: string;
  forma: string;
  detalle: string;
}

export const CASOS_IDENTIF: CasoIdentif[] = [
  { caso: "Un automóvil en movimiento", forma: "Cinética", detalle: "Energía del movimiento: Ec = ½ m v²." },
  { caso: "El agua retenida en una presa", forma: "Potencial gravitacional", detalle: "Se libera al caer y mover las turbinas." },
  { caso: "Un foco incandescente encendido", forma: "Eléctrica → luz + calor", detalle: "~5% luz y ~95% calor." },
  { caso: "Los alimentos que comes", forma: "Química → mecánica + térmica", detalle: "El metabolismo da movimiento y calor corporal." },
];

/* ── Formato ──────────────────────────────────────────────────────────── */
/** Formatea un número con es-MX y "−" tipográfico. */
export const fmtNum = (n: number, dec = 0) => {
  if (!Number.isFinite(n)) return "∞";
  const r = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
  const s = r.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 });
  return s.replace("-", "−");
};

/** Porcentaje 0..1 → "85 %". */
export const fmtPct = (frac: number) => `${fmtNum(frac * 100, 0)} %`;
