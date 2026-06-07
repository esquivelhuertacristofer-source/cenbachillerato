/**
 * Datos para el laboratorio de la Ecuación de la recta en el plano cartesiano
 * (PM-III-P10-A2, "Grafico la ecuación de la recta y sus soluciones"; progresión 2 / O2).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabEcuacionRecta.tsx) y la escena 3D (EcuacionRectaScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-III, propósito 2 / contenido C2:
 * "Ecuaciones lineales con dos incógnitas · Ecuación de la recta · Concepto de
 *  plano cartesiano: ejes perpendiculares horizontal (X) y vertical (Y) ·
 *  Representación gráfica de la ecuación de la recta"):
 *
 * Una ecuación lineal con DOS incógnitas (x, y) se DIBUJA como una RECTA en el
 * plano cartesiano. La forma pendiente–ordenada y = m·x + b muestra el sentido
 * geométrico de cada número:
 *   • la PENDIENTE m es la inclinación: cuánto sube (o baja) y por cada paso en x
 *     (m = subida / avance); m > 0 sube, m < 0 baja, m = 0 es horizontal;
 *   • la ORDENADA AL ORIGEN b es el punto donde la recta cruza el eje Y, (0, b);
 *   • la RAÍZ o cero (intersección con X) es donde y = 0: x = −b/m;
 *   • cada PUNTO de la recta es una SOLUCIÓN de la ecuación: una ecuación con dos
 *     incógnitas tiene infinitas soluciones (todos los puntos de la recta).
 *
 * Escenario verbatim de la actividad (tarifa de taxi de la CDMX como modelo lineal):
 *   costo y = 1.07·x + 8.74  →  ordenada b = 8.74 (banderazo), pendiente m = 1.07
 *   ($/100 m); a x = 0 el costo es el banderazo, y sube de forma constante.
 */

/* ── Coeficientes (controles) ─────────────────────────────────────────── */
export const M_MIN = -3;
export const M_MAX = 3;
export const M_STEP = 0.25;
export const B_MIN = -5;
export const B_MAX = 5;
export const B_STEP = 0.5;

export const DEFAULTS = { m: 0.5, b: 1 };

/* ── Ventana del plano cartesiano ─────────────────────────────────────── */
// Plano simétrico con los cuatro cuadrantes; valores enteros de −RANGO a RANGO.
export const RANGO = 6;

/* ── Escenario real (verbatim de la actividad) ────────────────────────── */
export const TAXI = {
  m: 1.07, // $ por cada 100 m recorridos (pendiente)
  b: 8.74, // banderazo en pesos (ordenada al origen)
};

/* ── Funciones matemáticas ────────────────────────────────────────────── */
/** Evalúa y = m·x + b. */
export const evalY = (m: number, b: number, x: number): number => m * x + b;

/** Ordenada al origen: el punto (0, b) donde la recta cruza el eje Y. */
export const ordenadaOrigen = (b: number): number => b;

/**
 * Raíz / cero: el punto (x, 0) donde la recta cruza el eje X (y = 0 ⇒ x = −b/m).
 * Devuelve null si la recta es horizontal (m = 0): no cruza el eje X (salvo b = 0).
 */
export const raizX = (m: number, b: number): number | null => {
  if (m === 0) return null;
  return -b / m;
};

/**
 * Triángulo de pendiente desde (0, b): un AVANCE horizontal de 1 produce una
 * SUBIDA vertical de m. Devuelve los puntos para dibujar el triángulo "rise/run".
 */
export const trianguloPendiente = (m: number, b: number): { x0: number; y0: number; avance: number; subida: number } => {
  return { x0: 0, y0: b, avance: 1, subida: m };
};

/**
 * Soluciones de coordenadas ENTERAS dentro de la ventana del plano.
 * Sirven para mostrar que una ecuación con dos incógnitas tiene MUCHAS soluciones
 * (cada punto de la recta), no una sola. Solo se listan las de coordenadas enteras.
 */
export const solucionesEnteras = (m: number, b: number, rango = RANGO): Array<{ x: number; y: number }> => {
  const pts: Array<{ x: number; y: number }> = [];
  for (let x = -rango; x <= rango; x++) {
    const y = evalY(m, b, x);
    // tolerancia por flotantes; solo enteros dentro del rango visible
    if (Math.abs(y - Math.round(y)) < 1e-9 && Math.round(y) >= -rango && Math.round(y) <= rango) {
      pts.push({ x, y: Math.round(y) });
    }
  }
  return pts;
};

/** Clasifica el sentido de la recta a partir de la pendiente. */
export const sentido = (m: number): "sube" | "baja" | "horizontal" => {
  if (m > 0) return "sube";
  if (m < 0) return "baja";
  return "horizontal";
};

/* ── Formato ──────────────────────────────────────────────────────────── */
/** Formatea un número con es-MX y "−" tipográfico. */
export const fmtNum = (n: number, dec = 2): string => {
  if (!Number.isFinite(n)) return "∞";
  const r = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
  const s = r.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 });
  return s.replace("-", "−");
};

/** Construye el texto "y = m·x + b" con signos correctos. */
export const fmtRecta = (m: number, b: number): string => {
  const sm = m < 0 ? "−" : "";
  const t1 = m === 0 ? "" : `${sm}${fmtNum(Math.abs(m))}x`;
  const sb = b >= 0 ? "+" : "−";
  const t2 = b === 0 ? "" : `${m === 0 ? "" : ` ${sb} `}${fmtNum(Math.abs(b))}`;
  if (m === 0) return `y = ${fmtNum(b)}`;
  if (b === 0) return `y = ${t1}`;
  return `y = ${t1}${t2}`;
};

/**
 * Construye el texto en forma estándar (ecuación lineal con dos incógnitas):
 * y = m·x + b  ⇔  −m·x + y = b. Se presenta como "a·x + b·y = c" con a = −m,
 * b_coef = 1, c = b para subrayar que es UNA ecuación con dos incógnitas.
 */
export const fmtEstandar = (m: number, b: number): string => {
  if (m === 0) return `y = ${fmtNum(b)}`;
  const a = -m;
  const sa = a < 0 ? "−" : "";
  const ax = `${sa}${fmtNum(Math.abs(a))}x`;
  return `${ax} + y = ${fmtNum(b)}`;
};
