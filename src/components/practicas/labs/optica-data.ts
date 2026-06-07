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
