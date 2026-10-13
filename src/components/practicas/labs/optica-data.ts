/**
 * Datos para el laboratorio "Óptica geométrica: lentes, espejos y formación de
 * imágenes" (CNEYT-V-P06-A2, simulación "Simulación de óptica: lentes, espejos
 * y formación de imágenes"; UAC CNEYT-V "La energía en procesos de vida diaria";
 * progresión 6 "Óptica geométrica: reflexión, refracción y la ley de Snell").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabOptica.tsx) y la escena 3D (OpticaScene.tsx).
 *
 * Tres modos (verbatim de las instrucciones de la simulación A2):
 *  (a) "lentes"     — banco óptico con lente convergente o divergente: el alumno
 *        coloca el objeto a distintas distancias y traza los 3 rayos principales
 *        para hallar la imagen (real/virtual, derecha/invertida, mayor/menor).
 *        Verifica la ecuación de Gauss 1/f = 1/dₒ + 1/dᵢ y el aumento M = −dᵢ/dₒ.
 *  (b) "espejos"    — espejo plano, cóncavo o convexo: misma ecuación, pero la
 *        imagen real se forma del MISMO lado del objeto (reflexión).
 *  (c) "refraccion" — ley de Snell n₁·sen θ₁ = n₂·sen θ₂ entre dos medios (aire,
 *        agua, vidrio, diamante) y el fenómeno de reflexión total interna cuando
 *        se supera el ángulo crítico θ_c = arcsen(n₂/n₁): el principio de la
 *        fibra óptica.
 *
 * Toda la física es de cálculo cerrado: ecuación de las lentes/espejos delgados
 * (óptica paraxial de Gauss) y ley de Snell. Los índices de refracción, las
 * leyes y el contexto mexicano son verbatim de la lectura A1.
 */

export type Modo = "lentes" | "espejos" | "refraccion";

/* ── Constantes ───────────────────────────────────────────────────────────── */
export const C_LUZ = 3e8; // m/s — rapidez de la luz en el vacío

/* ── (a) Lentes ───────────────────────────────────────────────────────────── */
export type TipoLente = "convergente" | "divergente";

export const F_LENTE_MIN = 1.2;   // distancia focal mínima (u)
export const F_LENTE_MAX = 4;     // distancia focal máxima (u)
export const F_LENTE_DEF = 2.2;   // foco por defecto
export const DO_MIN = 0.6;        // distancia objeto mínima (u)
export const DO_MAX = 9;          // distancia objeto máxima (u)
export const DO_LENTE_DEF = 5.5;  // objeto lejos del foco → imagen real invertida
export const H_OBJ = 1.1;         // altura del objeto (u)

/* ── (b) Espejos ──────────────────────────────────────────────────────────── */
export type TipoEspejo = "plano" | "concavo" | "convexo";
export const DO_ESPEJO_DEF = 5;
export const F_ESPEJO_DEF = 2.2; // |f| para cóncavo/convexo

/* ── (c) Refracción (ley de Snell) ────────────────────────────────────────── */
export interface Medio {
  id: string;
  nombre: string;
  n: number;
  color: string;
}

/** Índices de refracción verbatim de la lectura A1. */
export const MEDIOS: Medio[] = [
  { id: "aire",     nombre: "Aire",     n: 1.0,  color: "#7dd3fc" },
  { id: "agua",     nombre: "Agua",     n: 1.33, color: "#38bdf8" },
  { id: "vidrio",   nombre: "Vidrio",   n: 1.5,  color: "#a5b4fc" },
  { id: "diamante", nombre: "Diamante", n: 2.42, color: "#f0abfc" },
];

export function medioPorId(id: string): Medio {
  return MEDIOS.find((m) => m.id === id) ?? MEDIOS[0]!;
}

export const THETA_MIN = 0;
export const THETA_MAX = 89;
export const THETA_DEF = 35;
export const MEDIO1_DEF = "vidrio"; // n₁ > n₂ por defecto para mostrar reflexión total interna
export const MEDIO2_DEF = "aire";

/* ── Tipos de resultado ───────────────────────────────────────────────────── */
export interface ImagenOptica {
  f: number;             // distancia focal (con signo: + converge, − diverge)
  do_: number;           // distancia objeto (> 0)
  di: number;            // distancia imagen (con signo)
  M: number;             // aumento lateral = −di/do
  ho: number;            // altura objeto
  hi: number;            // altura imagen = M·ho (con signo: − = invertida)
  tipoImagen: "real" | "virtual";
  orientacion: "derecha" | "invertida";
  tamano: "mayor" | "menor" | "igual";
  enInfinito: boolean;   // objeto en el foco → imagen en el infinito
}

const EPS = 1e-6;

/**
 * Resuelve la ecuación de Gauss 1/f = 1/dₒ + 1/dᵢ para una lente o espejo
 * delgado. `f` lleva signo (convergente/cóncavo +, divergente/convexo −,
 * plano = ±∞ → pasar f = Infinity). Devuelve dᵢ, el aumento M = −dᵢ/dₒ y la
 * descripción de la imagen.
 */
export function resolverGauss(f: number, do_: number, ho: number): ImagenOptica {
  if (!isFinite(f)) {
    // Espejo plano: dᵢ = −dₒ, M = 1 (imagen virtual, derecha, igual).
    return {
      f, do_, di: -do_, M: 1, ho, hi: ho,
      tipoImagen: "virtual", orientacion: "derecha", tamano: "igual", enInfinito: false,
    };
  }
  const inv = 1 / f - 1 / do_; // = 1/dᵢ
  if (Math.abs(inv) < EPS) {
    // objeto en el foco → imagen en el infinito
    return {
      f, do_, di: Infinity, M: Infinity, ho, hi: Infinity,
      tipoImagen: "real", orientacion: "invertida", tamano: "mayor", enInfinito: true,
    };
  }
  const di = 1 / inv;
  const M = -di / do_;
  const hi = M * ho;
  const tipoImagen = di > 0 ? "real" : "virtual";
  const orientacion = M < 0 ? "invertida" : "derecha";
  const aM = Math.abs(M);
  const tamano = Math.abs(aM - 1) < 1e-3 ? "igual" : aM > 1 ? "mayor" : "menor";
  return { f, do_, di, M, ho, hi, tipoImagen, orientacion, tamano, enInfinito: false };
}

export interface Snell {
  n1: number;
  n2: number;
  thetaIncDeg: number;   // ángulo de incidencia (grados, respecto a la normal)
  thetaRefDeg: number;   // ángulo de refracción (grados); −1 si hay reflexión total
  reflexionTotal: boolean;
  thetaCriticoDeg: number | null; // θ_c = arcsen(n₂/n₁) si n₁ > n₂
  seAcerca: boolean;     // ¿el rayo se dobla HACIA la normal? (n₂ > n₁)
}

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

/** Ley de Snell: n₁·sen θ₁ = n₂·sen θ₂, con reflexión total interna. */
export function resolverSnell(n1: number, n2: number, thetaIncDeg: number): Snell {
  const thetaCriticoDeg = n1 > n2 ? Math.asin(n2 / n1) * DEG : null;
  const s2 = (n1 * Math.sin(thetaIncDeg * RAD)) / n2;
  if (s2 > 1 + EPS) {
    return { n1, n2, thetaIncDeg, thetaRefDeg: -1, reflexionTotal: true, thetaCriticoDeg, seAcerca: n2 > n1 };
  }
  const thetaRefDeg = Math.asin(Math.min(1, s2)) * DEG;
  return { n1, n2, thetaIncDeg, thetaRefDeg, reflexionTotal: false, thetaCriticoDeg, seAcerca: n2 > n1 };
}

/* ── Escenarios preestablecidos ───────────────────────────────────────────── */
export interface CasoLente {
  id: string;
  etq: string;
  tipo: TipoLente;
  f: number;     // |f|
  do_: number;
  nota: string;
}
export const CASOS_LENTE: CasoLente[] = [
  { id: "real",   etq: "Objeto lejano",        tipo: "convergente", f: 2.2, do_: 5.5, nota: "dₒ > 2f → imagen real, invertida y menor (como una cámara)." },
  { id: "igual",  etq: "Objeto en 2f",         tipo: "convergente", f: 2.2, do_: 4.4, nota: "dₒ = 2f → imagen real, invertida y del mismo tamaño." },
  { id: "lupa",   etq: "Objeto dentro del foco", tipo: "convergente", f: 2.6, do_: 1.6, nota: "dₒ < f → imagen virtual, derecha y mayor: ¡es una lupa!" },
  { id: "diverge", etq: "Lente divergente",     tipo: "divergente",  f: 2.4, do_: 4.5, nota: "Siempre da imagen virtual, derecha y menor (corrige la miopía)." },
];

export interface CasoEspejo {
  id: string;
  etq: string;
  tipo: TipoEspejo;
  f: number;     // |f| (ignorado si plano)
  do_: number;
  nota: string;
}
export const CASOS_ESPEJO: CasoEspejo[] = [
  { id: "plano",   etq: "Espejo plano",          tipo: "plano",   f: 0,   do_: 4.5, nota: "Imagen virtual, derecha, del mismo tamaño, detrás del espejo." },
  { id: "concavo_lejos", etq: "Cóncavo: objeto lejano", tipo: "concavo", f: 2.2, do_: 5.5, nota: "dₒ > C → imagen real, invertida y menor (telescopios)." },
  { id: "concavo_cerca", etq: "Cóncavo: objeto cerca",  tipo: "concavo", f: 2.6, do_: 1.6, nota: "dₒ < f → imagen virtual, derecha y mayor (espejo de afeitar)." },
  { id: "convexo", etq: "Espejo convexo",        tipo: "convexo", f: 2.2, do_: 4.5, nota: "Siempre virtual, derecha y menor, con más campo visual (retrovisor)." },
];

/* ── Texto: descripción del laboratorio ───────────────────────────────────── */
export const PROBLEMA =
  "Banco de óptica geométrica: la luz se modela con rayos que viajan en línea recta hasta que una superficie los refleja (espejos) o los refracta (lentes y cambios de medio). Coloca un objeto frente a una lente o un espejo y traza los rayos principales para descubrir dónde y cómo se forma la imagen; cambia los medios y el ángulo para ver la ley de Snell y la reflexión total interna que hace posible la fibra óptica.";

/* ── Instrucciones (verbatim de la simulación A2) ─────────────────────────── */
export const INSTRUCCIONES: string[] = [
  "Elige el componente óptico: espejo plano, espejo cóncavo, espejo convexo, lente convergente, lente divergente",
  "Coloca el objeto a distintas distancias del componente óptico",
  "Traza los rayos principales y encuentra la imagen",
  "Aplica la ley de Snell: cambia el ángulo de incidencia y los materiales (agua, vidrio, diamante)",
  "Verifica la ecuación de lentes: 1/f = 1/do + 1/di",
  "Explora el fenómeno de reflexión total interna variando el ángulo hasta superar el ángulo crítico",
];

/* ── Preguntas de reflexión (verbatim de la simulación A2) ────────────────── */
export const PREGUNTAS: string[] = [
  "¿Qué tipo de imagen produce una lente convergente cuando el objeto está entre el foco y la lente?",
  "¿Por qué la fibra óptica usa reflexión total interna?",
  "¿Cómo corrige una lente divergente la miopía?",
];

/* ── Ideas clave (fieles a la lectura A1) ─────────────────────────────────── */
export const IDEAS: string[] = [
  "La óptica geométrica modela la luz con rayos (líneas rectas) y se basa en tres fenómenos: reflexión, refracción y dispersión.",
  "Ley de reflexión: el ángulo de incidencia es igual al ángulo de reflexión (θᵢ = θᵣ), medidos respecto a la normal.",
  "El índice de refracción n = c/v indica cuánto más lenta viaja la luz en un medio. Valores típicos: aire ≈ 1.00, agua 1.33, vidrio ≈ 1.50, diamante 2.42.",
  "Ley de Snell: n₁·sen θ₁ = n₂·sen θ₂. Al pasar a un medio más denso la luz se dobla HACIA la normal; a uno menos denso, se ALEJA de la normal.",
  "Si la luz va de un medio más denso a uno menos denso y supera el ángulo crítico θ_c = arcsen(n₂/n₁), ocurre reflexión total interna: la luz no escapa.",
  "La fibra óptica usa la reflexión total interna para llevar pulsos de luz por kilómetros con pérdidas mínimas. TELMEX y Totalplay la usan para dar internet de banda ancha en México.",
  "Las lentes convergentes (f > 0) juntan los rayos paralelos en el foco; las divergentes (f < 0) los abren como si vinieran de un foco virtual.",
  "Ecuación de las lentes (Gauss): 1/f = 1/dₒ + 1/dᵢ. El aumento es M = −dᵢ/dₒ (M < 0 = imagen invertida).",
  "El ojo es un sistema óptico: la córnea y el cristalino enfocan la imagen en la retina. La miopía se corrige con lentes divergentes; la hipermetropía, con convergentes.",
  "La dispersión separa la luz blanca porque el índice depende de la longitud de onda: el violeta se refracta más que el rojo. Así se forma el arcoíris, a 42° del punto antisolar.",
];

/* ── Glosario (fiel a la lectura A1) ──────────────────────────────────────── */
export const GLOSARIO: { termino: string; definicion: string }[] = [
  { termino: "Reflexión", definicion: "Cambio de dirección de un rayo de luz al rebotar en una superficie. La ley de reflexión dice que el ángulo de incidencia es igual al de reflexión (θᵢ = θᵣ)." },
  { termino: "Refracción", definicion: "Cambio de dirección de la luz al pasar de un medio a otro con distinto índice de refracción, porque cambia su rapidez." },
  { termino: "Índice de refracción", definicion: "Número n = c/v que compara la rapidez de la luz en el vacío con la del medio. A mayor n, más lenta viaja la luz y más se dobla el rayo." },
  { termino: "Ley de Snell", definicion: "n₁·sen θ₁ = n₂·sen θ₂. Relaciona los ángulos de incidencia y refracción con los índices de los dos medios." },
  { termino: "Reflexión total interna", definicion: "Cuando la luz va de un medio más denso a uno menos denso y el ángulo supera el crítico θ_c = arcsen(n₂/n₁), toda la luz se refleja sin refractarse. Es la base de la fibra óptica." },
  { termino: "Distancia focal (f)", definicion: "Distancia del foco a la lente o espejo. Positiva en lentes convergentes y espejos cóncavos; negativa en divergentes y convexos." },
];

/* ── Contexto y fuente (verbatim/fiel a la lectura A1) ────────────────────── */
export const CONTEXTO =
  "Las redes de fibra óptica de TELMEX y Totalplay en México usan la reflexión total interna para proveer internet de banda ancha a millones de hogares. El CINVESTAV (Centro de Investigación y de Estudios Avanzados del IPN) es el principal centro de ciencia experimental de México, con laboratorios en Física, Química, Biología, Ingeniería y Biotecnología.";

export const FUENTE =
  "Material elaborado para CEN Bachillerato — CNEYT-V. Ref: Hecht, Óptica (4ª ed.); Serway & Jewett, Física (9ª ed.).";

/* ── Ejemplo resuelto (verbatim de la pregunta de comprensión 2 del A1) ───── */
export const EJEMPLO = {
  enunciado: "Un rayo de luz pasa de agua (n = 1.33) a vidrio (n = 1.50) con ángulo de incidencia de 30°. ¿Cuál es el ángulo de refracción?",
  n1: 1.33,
  n2: 1.5,
  thetaInc: 30,
  thetaRef: 26.3,
  solucion: "Snell: 1.33·sen 30° = 1.50·sen θ₂ → sen θ₂ = 0.665/1.50 = 0.443 → θ₂ ≈ 26.3°. El rayo se dobla hacia la normal al pasar a un medio más denso.",
};

/* ── Datos rápidos (tarjetas) ─────────────────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "θᵢ = θᵣ", texto: "ley de reflexión: el ángulo se conserva", icono: "fa-arrows-left-right-to-line" },
  { valor: "n₁ sen θ₁ = n₂ sen θ₂", texto: "ley de Snell para la refracción", icono: "fa-wave-square" },
  { valor: "1/f = 1/dₒ + 1/dᵢ", texto: "ecuación de las lentes y espejos (Gauss)", icono: "fa-glasses" },
  { valor: "n: aire 1.00 · agua 1.33 · vidrio 1.50 · diamante 2.42", texto: "índices de refracción típicos", icono: "fa-gem" },
];

/* ── Formato (es-MX) ──────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt0 = (n: number): string => ES(n, 0);
export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);

/** Ángulo en grados con el símbolo °. */
export function fmtAng(deg: number): string {
  return `${ES(deg, 1)}°`;
}

/** Distancia con signo y unidades (u) o "∞". */
export function fmtDist(u: number): string {
  if (!isFinite(u)) return "∞";
  return `${ES(u, 2)} u`;
}

/** Aumento con signo (×). */
export function fmtAumento(M: number): string {
  if (!isFinite(M)) return "∞";
  return `${ES(M, 2)}×`;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * BANCO ÓPTICO «ÉLITE» (agregado 2026-10): pantalla, Fresnel, dispersión, ojo.
 * Solo se AGREGAN exports; todo lo de arriba queda igual.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Modos del laboratorio: los tres de siempre más el ojo humano. */
export type ModoLab = Modo | "ojo";

/** Sub-vistas del modo refracción. */
export type VistaRefraccion = "frontera" | "fibra" | "prisma";

/* ── Pantalla del banco: la imagen real solo es nítida en dᵢ ─────────────── */
export const DP_MIN = 0.8;   // posición mínima de la pantalla tras la lente (u)
export const DP_MAX = 9.5;   // posición máxima (u)
export const DP_DEF = 6.5;   // empieza desenfocada a propósito
/** Radio útil (abertura) de la lente del banco, en u. */
export const LENTE_RADIO_U = 1.85;

export interface EnfoquePantalla {
  /** Radio del círculo de desenfoque en la pantalla (u): A·|1 − dₚ/dᵢ|. */
  desenfoque: number;
  /** Factor de escala de la mancha en la pantalla: −dₚ/dₒ (rayo central). */
  escala: number;
  /** 0 (mancha) … 1 (imagen nítida). */
  nitidez: number;
  /** ¿Se puede formar imagen en la pantalla? (solo si es real y finita). */
  hayImagenReal: boolean;
}

/**
 * Óptica de lente delgada exacta para una pantalla a la distancia dₚ: cada
 * punto del objeto manda un cono que llena la abertura A de la lente y que
 * converge (o diverge) hacia su imagen en dᵢ. En la pantalla ese cono es un
 * círculo de radio A·|1 − dₚ/dᵢ| centrado donde llega el rayo central
 * (escala −dₚ/dₒ). En dₚ = dᵢ el radio es cero: imagen nítida.
 */
export function enfoquePantalla(f: number, do_: number, dp: number, A = LENTE_RADIO_U): EnfoquePantalla {
  const r = resolverGauss(f, do_, H_OBJ);
  const escala = -dp / do_;
  const desenfoque = r.enInfinito ? A : A * Math.abs(1 - dp / r.di);
  const nitidez = Math.exp(-((desenfoque / 0.12) ** 2));
  return { desenfoque, escala, nitidez, hayImagenReal: r.tipoImagen === "real" && !r.enInfinito };
}

/** Umbral de «imagen nítida» en la pantalla (≈ desenfoque ≤ 0.06 u). */
export const NITIDEZ_OK = 0.78;

/* ── Reflectancia de Fresnel (luz no polarizada) ─────────────────────────── */
/**
 * Fracción de la luz que se REFLEJA en la frontera (0…1). Con reflexión total
 * interna vale 1. Es la razón por la que el rayo reflejado se ve cada vez más
 * brillante al acercarse al ángulo crítico.
 */
export function fresnelReflectancia(n1: number, n2: number, thetaIncDeg: number): number {
  const ti = thetaIncDeg * RAD;
  const ci = Math.cos(ti);
  const s2 = (n1 / n2) * Math.sin(ti);
  if (s2 >= 1) return 1;
  const ct = Math.sqrt(1 - s2 * s2);
  const rs = (n1 * ci - n2 * ct) / (n1 * ci + n2 * ct);
  const rp = (n1 * ct - n2 * ci) / (n1 * ct + n2 * ci);
  return Math.min(1, Math.max(0, (rs * rs + rp * rp) / 2));
}

/* ── Fibra óptica: el rayo rebota dentro del núcleo ──────────────────────── */
/** Fracción de luz que sigue dentro tras k rebotes: Rᵏ. */
export function luzQueLlega(n1: number, n2: number, thetaIncDeg: number, rebotes: number): number {
  return Math.pow(fresnelReflectancia(n1, n2, thetaIncDeg), Math.max(0, rebotes));
}

/* ── Dispersión: el índice depende del color (ecuación de Cauchy) ────────── */
export interface ColorEspectro { id: string; nombre: string; nm: number; color: string }
export const ESPECTRO: ColorEspectro[] = [
  { id: "rojo",     nombre: "rojo",     nm: 680, color: "#ff3b30" },
  { id: "naranja",  nombre: "naranja",  nm: 610, color: "#ff8a1f" },
  { id: "amarillo", nombre: "amarillo", nm: 580, color: "#ffe23a" },
  { id: "verde",    nombre: "verde",    nm: 530, color: "#38f06a" },
  { id: "cian",     nombre: "cian",     nm: 490, color: "#2fe0ff" },
  { id: "azul",     nombre: "azul",     nm: 460, color: "#3b6bff" },
  { id: "violeta",  nombre: "violeta",  nm: 410, color: "#a24dff" },
];
/** Vidrio del prisma: n = 1.50 en la luz amarilla (589 nm), como en la lectura. */
export const N_PRISMA_D = 1.5;
/** Coeficiente B de Cauchy de un vidrio crown (nm²). */
export const CAUCHY_B = 4200;
/** n(λ) = n_D + B·(1/λ² − 1/589.3²): el violeta se refracta más que el rojo. */
export function indiceCauchy(nm: number, nD = N_PRISMA_D, B = CAUCHY_B): number {
  return nD + B * (1 / (nm * nm) - 1 / (589.3 * 589.3));
}
export const PRISMA_APICE = 60; // ° (prisma equilátero)
export const THETA_PRISMA_MIN = 20;
export const THETA_PRISMA_MAX = 80;
export const THETA_PRISMA_DEF = 50;

export interface RayoPrisma { theta1p: number; theta2p: number; theta2: number; desviacion: number; tir: boolean }
/**
 * Prisma de ápice A: Snell en la cara de entrada (θ₁ → θ₁′), geometría
 * θ₂′ = A − θ₁′ y Snell en la cara de salida (θ₂′ → θ₂). Desviación
 * δ = θ₁ + θ₂ − A. Si n·sen θ₂′ > 1 la luz queda atrapada (reflexión total).
 */
export function trazarPrisma(n: number, thetaDeg: number, apiceDeg = PRISMA_APICE): RayoPrisma {
  const theta1p = Math.asin(Math.sin(thetaDeg * RAD) / n) * DEG;
  const theta2p = apiceDeg - theta1p;
  const s = n * Math.sin(theta2p * RAD);
  if (s > 1) return { theta1p, theta2p, theta2: NaN, desviacion: NaN, tir: true };
  const theta2 = Math.asin(s) * DEG;
  return { theta1p, theta2p, theta2, desviacion: thetaDeg + theta2 - apiceDeg, tir: false };
}

/* ── El ojo humano (modelo de ojo reducido) ──────────────────────────────── */
export type CondicionOjo = "normal" | "miopia" | "hipermetropia";
/** Potencia del ojo reducido (córnea + cristalino), en dioptrías: f = 16.7 mm. */
export const OJO_POTENCIA = 60;
/** Distancia de los anteojos al plano principal del ojo (m). */
export const OJO_D_ANTEOJO = 0.012;
export const PC_MIN = -6;
export const PC_MAX = 6;
export interface DatosOjo { id: CondicionOjo; etq: string; largoMm: number; nota: string }
/** Largo óptico del ojo (plano principal → retina). Miopía: ojo largo; hipermetropía: ojo corto. */
export const OJOS: DatosOjo[] = [
  { id: "normal",        etq: "Ojo normal",    largoMm: 1000 / 60, nota: "La imagen de un objeto lejano cae justo sobre la retina." },
  { id: "miopia",        etq: "Miopía",        largoMm: 1000 / 56, nota: "El ojo es más largo: la imagen cae ANTES de la retina y lo lejano se ve borroso." },
  { id: "hipermetropia", etq: "Hipermetropía", largoMm: 1000 / 63, nota: "El ojo es más corto: la imagen caería DETRÁS de la retina." },
];
export function ojoPorId(id: CondicionOjo): DatosOjo {
  return OJOS.find((o) => o.id === id) ?? OJOS[0]!;
}
/**
 * Dónde enfoca el ojo (mm tras su plano principal) la luz de un objeto
 * lejano, con un anteojo de potencia Pc a 12 mm: vergencia al llegar al ojo
 * V = Pc/(1 − d·Pc), y luego f = 1/(V + P_ojo).
 */
export function focoOjoMm(pc: number): number {
  const V = pc / (1 - OJO_D_ANTEOJO * pc);
  return 1000 / (V + OJO_POTENCIA);
}
/** Graduación exacta que pone la imagen sobre la retina de un ojo de largo L. */
export function graduacionNecesaria(largoMm: number): number {
  const V = 1000 / largoMm - OJO_POTENCIA;
  return V / (1 + OJO_D_ANTEOJO * V);
}
/** Error de enfoque en dioptrías (0 = nítido): lo que el ojo «ve» borroso. */
export function errorDioptrias(largoMm: number, pc: number): number {
  return 1000 / largoMm - 1000 / focoOjoMm(pc);
}
/** Tolerancia: la imagen se considera sobre la retina a ±0.12 mm. */
export const OJO_TOL_MM = 0.12;

/* ── Prisma: ampliación SOLO visual del abanico de colores ───────────────── */
/** Los ángulos por color son exactos; el dibujo amplía su diferencia ×6. */
export const AMPL_PRISMA = 6;

/* ── Fibra óptica: trazo del rayo rebotando en el núcleo ─────────────────── */
export const FIBRA_X0 = -6;    // entrada del núcleo (escena)
export const FIBRA_X1 = 6;     // salida del núcleo (escena)
export const FIBRA_R = 0.5;    // radio del núcleo (escena)
type P3 = [number, number, number];
export interface TrazoFibra {
  tramos: { a: P3; b: P3; k: number }[];
  fugas: { a: P3; b: P3; k: number }[];
  /** Fracción de luz que llega al final (0…1). */
  llega: number;
  rebotes: number;
  fin: P3;
  R: number;
  sn: Snell;
}
/**
 * El rayo avanza en el núcleo con el ángulo θ₁ respecto a la normal de la
 * pared. En cada rebote se refleja la fracción R (Fresnel) y escapa 1 − R;
 * con reflexión total interna R = 1 y la luz llega completa.
 */
export function trazarFibra(n1: number, n2: number, thetaInc: number): TrazoFibra {
  const sn = resolverSnell(n1, n2, thetaInc);
  const R = fresnelReflectancia(n1, n2, thetaInc);
  const tan = Math.tan(thetaInc * RAD);
  const tramos: TrazoFibra["tramos"] = [];
  const fugas: TrazoFibra["fugas"] = [];
  let x = FIBRA_X0, y = 0, sube = 1, I = 1, rebotes = 0, llega = 0;
  let fin: P3 = [x, y, 0];
  for (let i = 0; i < 90; i++) {
    const yT = sube * FIBRA_R;
    const xT = x + Math.abs(yT - y) * tan;
    if (xT >= FIBRA_X1) {
      const yF = tan > 1e-6 ? y + (sube * (FIBRA_X1 - x)) / tan : y;
      tramos.push({ a: [x, y, 0], b: [FIBRA_X1, yF, 0], k: I });
      fin = [FIBRA_X1, yF, 0];
      llega = I;
      break;
    }
    tramos.push({ a: [x, y, 0], b: [xT, yT, 0], k: I });
    if (!sn.reflexionTotal) {
      const t2 = sn.thetaRefDeg * RAD;
      fugas.push({ a: [xT, yT, 0], b: [xT + Math.sin(t2) * 1.25, yT + sube * Math.cos(t2) * 1.25, 0], k: I * (1 - R) });
    }
    I *= R;
    x = xT; y = yT; sube = -sube; rebotes++;
    fin = [x, y, 0];
    if (I < 0.015) { llega = 0; break; }
  }
  return { tramos, fugas, llega, rebotes, fin, R, sn };
}
