/**
 * fluidos-data.ts — DATOS PUROS para el laboratorio 3D de fluidos (CNEYT-V·O6).
 *
 * ⚠️ Este módulo NO debe importar `three` ni `@react-three/*` (límite Worker 3 MiB).
 * Toda la física vive aquí en forma cerrada; la escena solo dibuja los resultados.
 *
 * Propósito formativo (verbatim 2025): "Analiza el comportamiento de fluidos
 * para comprender sus propiedades físicas."
 * Contenidos formativos (verbatim 2025): Principio de Pascal y de Arquímedes ·
 * Tensión superficial y capilaridad · Ecuación de continuidad y de Bernoulli · Viscosidad.
 */

export type Modo = "flotacion" | "presion" | "flujo";

/* ───────────────── Constantes físicas ───────────────── */
export const G = 9.81; // m/s²  aceleración de la gravedad
export const P_ATM = 101325; // Pa  presión atmosférica a nivel del mar (1 atm)

/* Flotación: densidad del cuerpo (kg/m³) */
export const RHO_OBJ_MIN = 100;
export const RHO_OBJ_MAX = 3000;
export const RHO_OBJ_DEF = 600;

/* Flotación: volumen del cuerpo (litros → m³) */
export const VOL_MIN_L = 1;
export const VOL_MAX_L = 30;
export const VOL_DEF_L = 8;

/* Presión: profundidad (m) y presión externa aplicada (kPa, Pascal) */
export const PROF_MIN = 0;
export const PROF_MAX = 30;
export const PROF_DEF = 8;
export const PEXT_MIN_KPA = 0; // sobrepresión sobre la atmosférica
export const PEXT_MAX_KPA = 200;
export const PEXT_DEF_KPA = 0;

/* Flujo: caudal (L/s) y razón de estrechamiento A2/A1 */
export const CAUDAL_MIN = 1;
export const CAUDAL_MAX = 40;
export const CAUDAL_DEF = 12;
export const RAZON_MIN = 0.1; // A2/A1 (sección estrecha respecto a la ancha)
export const RAZON_MAX = 1.0;
export const RAZON_DEF = 0.35;
export const AREA_ANCHA = 0.02; // m² sección ancha de la tubería (fija)

/* ───────────────── Fluidos ───────────────── */
export interface Fluido {
  id: string;
  nombre: string;
  rho: number; // densidad kg/m³
  visc: number; // viscosidad dinámica Pa·s (a ~20 °C)
  color: string; // color del líquido en la escena
  nota: string;
}

export const FLUIDOS: Fluido[] = [
  { id: "agua", nombre: "Agua", rho: 1000, visc: 0.001, color: "#38BDF8", nota: "Referencia universal (1 g/cm³)." },
  { id: "aguamar", nombre: "Agua de mar", rho: 1025, visc: 0.00107, color: "#22D3EE", nota: "Más densa por las sales: flotamos mejor." },
  { id: "aceite", nombre: "Aceite", rho: 920, visc: 0.084, color: "#FBBF24", nota: "Menos denso que el agua: flota sobre ella." },
  { id: "glicerina", nombre: "Glicerina", rho: 1260, visc: 1.41, color: "#A3E635", nota: "Muy viscosa: fluye con lentitud." },
  { id: "mercurio", nombre: "Mercurio", rho: 13600, visc: 0.0015, color: "#CBD5E1", nota: "Metal líquido: casi todo flota en él." },
];

export function fluidoPorId(id: string): Fluido {
  return FLUIDOS.find((f) => f.id === id) ?? FLUIDOS[0]!;
}

/* Materiales de referencia para la flotación (presets de densidad) */
export interface Material {
  id: string;
  nombre: string;
  rho: number;
}
export const MATERIALES: Material[] = [
  { id: "corcho", nombre: "Corcho", rho: 240 },
  { id: "pino", nombre: "Madera de pino", rho: 500 },
  { id: "hielo", nombre: "Hielo", rho: 917 },
  { id: "polietileno", nombre: "Plástico (PE)", rho: 950 },
  { id: "concreto", nombre: "Concreto", rho: 2400 },
  { id: "aluminio", nombre: "Aluminio", rho: 2700 },
];

/* ───────────────── Arquímedes / flotación ───────────────── */
export interface EstadoFlotacion {
  peso: number; // N  W = ρ_obj·V·g
  empuje: number; // N  E = ρ_f·V_sumergido·g
  flota: boolean;
  fraccionSumergida: number; // 0..1
  Vsub: number; // m³ volumen sumergido
  pesoAparente: number; // N  W − E (solo si se hunde, sostenido)
  densidadRelativa: number; // ρ_obj/ρ_f
}

export function resolverFlotacion(rhoObj: number, rhoF: number, volM3: number): EstadoFlotacion {
  const peso = rhoObj * volM3 * G;
  const densidadRelativa = rhoObj / rhoF;
  if (rhoObj < rhoF) {
    // flota en equilibrio: empuje iguala al peso
    const fraccionSumergida = rhoObj / rhoF;
    const Vsub = fraccionSumergida * volM3;
    const empuje = rhoF * Vsub * G; // = peso
    return { peso, empuje, flota: true, fraccionSumergida, Vsub, pesoAparente: 0, densidadRelativa };
  }
  // se hunde: totalmente sumergido
  const Vsub = volM3;
  const empuje = rhoF * Vsub * G;
  return {
    peso,
    empuje,
    flota: false,
    fraccionSumergida: 1,
    Vsub,
    pesoAparente: peso - empuje,
    densidadRelativa,
  };
}

/* ───────────────── Presión hidrostática + Pascal ───────────────── */
export interface EstadoPresion {
  pManometrica: number; // Pa  ρ·g·h (debida solo a la columna)
  pExterna: number; // Pa  presión aplicada en la superficie (atm + sobrepresión)
  pAbsoluta: number; // Pa  P_ext + ρ·g·h
  columnaEquivAgua: number; // m  altura de columna de agua equivalente a la presión absoluta
}

/**
 * Presión a una profundidad h con una presión externa total Pext en la superficie.
 * Principio de Pascal: un aumento de Pext se transmite íntegro a TODA profundidad.
 */
export function resolverPresion(rhoF: number, h: number, pExtTotal: number): EstadoPresion {
  const pManometrica = rhoF * G * h;
  const pAbsoluta = pExtTotal + pManometrica;
  const columnaEquivAgua = pAbsoluta / (1000 * G);
  return { pManometrica, pExterna: pExtTotal, pAbsoluta, columnaEquivAgua };
}

/* Prensa hidráulica (Pascal): F2 = F1 · A2/A1 */
export interface PrensaHidraulica {
  F2: number; // N fuerza obtenida en el pistón grande
  ventaja: number; // A2/A1 ventaja mecánica
  d2: number; // m desplazamiento del pistón grande para un d1 dado
}
export function resolverPrensa(F1: number, A1: number, A2: number, d1: number): PrensaHidraulica {
  const ventaja = A2 / A1;
  return { F2: F1 * ventaja, ventaja, d2: d1 * (A1 / A2) };
}

/* ───────────────── Continuidad + Bernoulli ───────────────── */
export interface EstadoFlujo {
  v1: number; // m/s velocidad en la sección ancha
  v2: number; // m/s velocidad en la sección estrecha
  caudal: number; // m³/s  Q = A·v (constante)
  A1: number; // m²
  A2: number; // m²
  deltaP: number; // Pa  P2 − P1 = ½ρ(v1² − v2²) (negativo: cae la presión donde acelera)
  numReynolds: number; // adimensional (sección estrecha)
}

/**
 * Tubería horizontal con estrechamiento. Continuidad: A1·v1 = A2·v2 = Q.
 * Bernoulli (misma altura): P1 + ½ρv1² = P2 + ½ρv2².
 */
export function resolverFlujo(caudalM3s: number, razon: number, fluido: Fluido): EstadoFlujo {
  const A1 = AREA_ANCHA;
  const A2 = AREA_ANCHA * razon;
  const v1 = caudalM3s / A1;
  const v2 = caudalM3s / A2;
  const deltaP = 0.5 * fluido.rho * (v1 * v1 - v2 * v2); // = P2 − P1 (≤ 0)
  // diámetro equivalente de la sección estrecha (circular): A2 = πd²/4
  const d = Math.sqrt((4 * A2) / Math.PI);
  const numReynolds = (fluido.rho * v2 * d) / fluido.visc;
  return { v1, v2, caudal: caudalM3s, A1, A2, deltaP, numReynolds };
}

/* Capilaridad — ascenso de Jurin: h = 2·γ·cosθ / (ρ·g·r) */
export function ascensoCapilar(gamma: number, rhoF: number, radioMm: number, anguloDeg = 0): number {
  const r = radioMm / 1000;
  return (2 * gamma * Math.cos((anguloDeg * Math.PI) / 180)) / (rhoF * G * r);
}

/* ───────────────── Formateadores es-MX ───────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace("-", "−");
export const fmt0 = (n: number) => ES(n, 0);
export const fmt1 = (n: number) => ES(n, 1);
export const fmt2 = (n: number) => ES(n, 2);

/** Presión: Pa si < 1000, si no kPa con 1–2 decimales. */
export function fmtPresion(pa: number): string {
  if (Math.abs(pa) < 1000) return `${fmt0(pa)} Pa`;
  return `${fmt1(pa / 1000)} kPa`;
}
/** Fuerza: N si < 1000, si no kN. */
export function fmtFuerza(n: number): string {
  if (Math.abs(n) < 1000) return `${fmt1(n)} N`;
  return `${fmt2(n / 1000)} kN`;
}
export const fmtDens = (n: number) => `${fmt0(n)} kg/m³`;
export const fmtVel = (n: number) => `${fmt2(n)} m/s`;
export const fmtVol = (litros: number) => `${fmt1(litros)} L`;
export const fmtProf = (m: number) => `${fmt1(m)} m`;

/* ───────────────── Texto didáctico (contenido nuevo, no oficial) ───────────────── */
export const PROBLEMA =
  "Un fluido —líquido o gas— no tiene forma propia: toma la del recipiente y responde a fuerzas según " +
  "sus propiedades. Tres preguntas guían esta práctica. ¿Por qué un barco de acero flota y un clavo se hunde " +
  "(Arquímedes)? ¿Por qué la presión aumenta con la profundidad y cómo se transmite (Pascal)? ¿Por qué el agua " +
  "acelera y pierde presión al pasar por un estrechamiento (continuidad y Bernoulli)? Manipula cada modelo y " +
  "descúbrelo.";

export const INSTRUCCIONES: Record<Modo, string[]> = {
  flotacion: [
    "Elige el fluido y ajusta la densidad y el volumen del cuerpo.",
    "Si la densidad del cuerpo es menor que la del fluido, flota; la fracción sumergida es ρ_cuerpo/ρ_fluido.",
    "Compara el empuje E = ρ_fluido·V_sumergido·g con el peso W = ρ_cuerpo·V·g.",
  ],
  presion: [
    "Mueve la sonda para cambiar la profundidad y lee la presión P = P_ext + ρ·g·h.",
    "Aumenta la presión externa: por el principio de Pascal se suma por igual a TODA profundidad.",
    "Observa que la presión actúa en todas direcciones, no solo hacia abajo.",
  ],
  flujo: [
    "Ajusta el caudal y la razón de estrechamiento de la tubería.",
    "Continuidad: A₁·v₁ = A₂·v₂; al estrecharse, el fluido acelera.",
    "Bernoulli: donde la velocidad sube, la presión baja (ΔP = ½ρ(v₁²−v₂²)).",
  ],
};

export const PREGUNTAS: Record<Modo, string[]> = {
  flotacion: [
    "¿Qué le pasa a la fracción sumergida si el fluido es más denso (de agua a agua de mar)?",
    "Un cuerpo con ρ igual a la del fluido, ¿flota, se hunde o queda suspendido?",
    "¿Por qué un barco hueco de acero flota aunque el acero sea más denso que el agua?",
  ],
  presion: [
    "Si duplicas la profundidad, ¿se duplica la presión manométrica? ¿Y la absoluta?",
    "Al apretar el émbolo (subir P_ext), ¿dónde aumenta más la presión: arriba o en el fondo?",
    "¿Por qué los muros de una presa son más gruesos en la base?",
  ],
  flujo: [
    "Si la sección estrecha es la mitad de la ancha, ¿cuántas veces más rápido va el fluido?",
    "¿Por qué la presión es MENOR justo donde el fluido va más rápido?",
    "¿Qué pasaría con la velocidad si la tubería no se estrechara nada (razón = 1)?",
  ],
};

export const IDEAS: string[] = [
  "Arquímedes: todo cuerpo sumergido recibe un empuje vertical hacia arriba igual al peso del fluido que desaloja.",
  "Flota si su densidad media es menor que la del fluido; un barco flota porque su densidad MEDIA (acero + aire) es baja.",
  "Pascal: la presión aplicada a un fluido confinado se transmite íntegra a todos sus puntos; así funcionan el gato y los frenos hidráulicos.",
  "Presión hidrostática: P = P₀ + ρ·g·h. Solo depende de la profundidad, no de la forma del recipiente (paradoja hidrostática).",
  "Continuidad: como el líquido es casi incompresible, lo que entra sale; al reducir el área, la velocidad aumenta.",
  "Bernoulli: en un fluido en movimiento, donde la velocidad es mayor la presión es menor (a igual altura).",
  "Tensión superficial: la superficie del agua se comporta como una membrana elástica; por eso algunos insectos caminan sobre ella.",
  "Capilaridad: el agua sube por tubos finos (ascenso de Jurin) combinando tensión superficial y adhesión; así sube la savia.",
  "Viscosidad: resistencia interna al flujo; la glicerina es ~1400 veces más viscosa que el agua.",
];

export const GLOSARIO: { termino: string; definicion: string }[] = [
  { termino: "Fluido", definicion: "Sustancia que fluye y adopta la forma del recipiente (líquidos y gases)." },
  { termino: "Densidad (ρ)", definicion: "Masa por unidad de volumen, en kg/m³. Decide si un cuerpo flota o se hunde." },
  { termino: "Empuje (E)", definicion: "Fuerza vertical hacia arriba sobre un cuerpo sumergido; igual al peso del fluido desalojado." },
  { termino: "Presión (P)", definicion: "Fuerza por unidad de área, en pascales (Pa = N/m²)." },
  { termino: "Principio de Pascal", definicion: "La presión aplicada a un fluido confinado se transmite por igual a todos sus puntos." },
  { termino: "Presión hidrostática", definicion: "La que ejerce un fluido en reposo por su peso: P = ρ·g·h." },
  { termino: "Caudal (Q)", definicion: "Volumen de fluido que pasa por una sección por segundo (m³/s)." },
  { termino: "Ecuación de continuidad", definicion: "A₁·v₁ = A₂·v₂: el caudal se conserva en una tubería." },
  { termino: "Ecuación de Bernoulli", definicion: "P + ½ρv² + ρgh = constante a lo largo de una línea de corriente." },
  { termino: "Viscosidad", definicion: "Medida de la resistencia interna de un fluido a fluir (Pa·s)." },
  { termino: "Tensión superficial", definicion: "Energía/fuerza que mantiene cohesionada la superficie de un líquido (N/m)." },
  { termino: "Capilaridad", definicion: "Ascenso o descenso de un líquido en tubos muy finos por tensión superficial y adhesión." },
];

export const CONTEXTO =
  "En México la hidráulica está en todas partes: el Sistema Cutzamala bombea agua a más de 1 000 m de desnivel " +
  "para abastecer al Valle de México; las presas (La Angostura, Chicoasén) resisten enormes presiones hidrostáticas; " +
  "PEMEX transporta crudo viscoso por miles de kilómetros de ductos (continuidad y Bernoulli); y todo gato o freno " +
  "hidráulico de un taller aplica el principio de Pascal.";

export const FUENTE =
  "Contenido formativo MCCEMS 2025 — CNEyT V: Principio de Pascal y de Arquímedes; tensión superficial y capilaridad; " +
  "ecuación de continuidad y de Bernoulli; viscosidad. Modelos físicos estándar.";

export interface Ejemplo {
  enunciado: string;
  datos: string[];
  solucion: string;
  resultado: string;
}

export const EJEMPLO: Ejemplo = {
  enunciado:
    "Un bloque de madera de pino (ρ = 500 kg/m³) de 8 L se coloca en agua (ρ = 1000 kg/m³). " +
    "¿Qué fracción queda sumergida y cuánto vale el empuje?",
  datos: ["ρ_cuerpo = 500 kg/m³", "ρ_agua = 1000 kg/m³", "V = 8 L = 0.008 m³", "g = 9.81 m/s²"],
  solucion:
    "Como ρ_cuerpo < ρ_agua, flota. Fracción sumergida = ρ_cuerpo/ρ_agua = 500/1000 = 0.50 (50 %). " +
    "En equilibrio el empuje iguala al peso: E = W = ρ_cuerpo·V·g = 500 × 0.008 × 9.81 = 39.24 N.",
  resultado: "Se sumerge el 50 % y el empuje es de 39.24 N (igual al peso del bloque).",
};

export interface Dato {
  valor: string;
  texto: string;
  icono: string;
}
export const DATOS: Dato[] = [
  { valor: "9.81 m/s²", texto: "Gravedad usada en todos los cálculos.", icono: "⬇" },
  { valor: "13.6×", texto: "El mercurio es 13.6 veces más denso que el agua.", icono: "🌡" },
  { valor: "≈760 mm", texto: "Columna de mercurio que equilibra 1 atm (barómetro).", icono: "📏" },
  { valor: "1 000 m", texto: "Desnivel que vence el Cutzamala para llevar agua al Valle de México.", icono: "💧" },
  { valor: "~1 400×", texto: "La glicerina es ~1 400 veces más viscosa que el agua.", icono: "🍯" },
];
