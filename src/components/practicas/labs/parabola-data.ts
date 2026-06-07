/**
 * Datos para el laboratorio de Parábolas y funciones cuadráticas
 * (PM-III-P06-A2, "Analizo la trayectoria de un tiro parabólico"; progresión 6).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabParabola.tsx) y la escena 3D (ParabolaScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-III P6: "Relaciona el álgebra con la
 * geometría mediante la representación gráfica de ecuaciones cuadráticas"):
 * Una función cuadrática h(x) = a·x² + b·x + c se DIBUJA como una parábola, y
 * cada parte del álgebra tiene un significado geométrico:
 *   • el signo de a decide la APERTURA (a<0 abre hacia abajo, como un tiro);
 *   • el VÉRTICE (x_v = −b/2a) es el punto más alto (o más bajo) de la curva;
 *   • los CEROS o raíces son donde la parábola cruza el eje X (toca el suelo);
 *   • el EJE DE SIMETRÍA es la recta vertical x = x_v que parte la parábola en
 *     dos mitades espejo.
 *
 * Problema verbatim de la actividad (tiro de un balón):
 *   h(x) = −0.04x² + 1.2x  →  vértice (15, 9), ceros en x=0 y x=30,
 *   h(25) = 5 m > 2.44 m (travesaño) ⇒ el balón entraría por encima del arco.
 */

/* ── Coeficientes (controles) ─────────────────────────────────────────── */
// El laboratorio modela una TRAYECTORIA (tiro parabólico): a siempre negativo
// (la parábola abre hacia abajo). Los rangos mantienen el vértice dentro del
// campo para la mayoría de las combinaciones; el caso por defecto es el balón.
export const A_MIN = -0.1;
export const A_MAX = -0.02;
export const A_STEP = 0.01;
export const B_MIN = 0.4;
export const B_MAX = 2.4;
export const B_STEP = 0.1;
export const C_MIN = 0;
export const C_MAX = 4;
export const C_STEP = 0.5;

export const DEFAULTS = { a: -0.04, b: 1.2, c: 0 };

/* ── Escenario del gol (verbatim de la actividad) ─────────────────────── */
export const GOL = {
  porteriaX: 25, // distancia horizontal de la portería (m)
  travesano: 2.44, // altura del travesaño (m)
};

/* ── Funciones matemáticas ────────────────────────────────────────────── */
/** Evalúa h(x) = a·x² + b·x + c. */
export const evalH = (a: number, b: number, c: number, x: number): number => a * x * x + b * x + c;

/** Vértice de la parábola: x_v = −b/(2a), h_v = h(x_v). */
export const vertice = (a: number, b: number, c: number): { x: number; h: number } => {
  const x = -b / (2 * a);
  return { x, h: evalH(a, b, c, x) };
};

/** Discriminante D = b² − 4ac (decide cuántas veces cruza el eje X). */
export const discriminante = (a: number, b: number, c: number): number => b * b - 4 * a * c;

/**
 * Ceros (raíces reales) de la parábola, ordenados de menor a mayor.
 * Devuelve [] si no cruza el eje X (D<0), o un único valor repetido si D=0.
 */
export const raices = (a: number, b: number, c: number): number[] => {
  const D = discriminante(a, b, c);
  if (D < 0) return [];
  const r = Math.sqrt(D);
  const r1 = (-b - r) / (2 * a);
  const r2 = (-b + r) / (2 * a);
  return [Math.min(r1, r2), Math.max(r1, r2)];
};

/** Eje de simetría: la recta vertical x = x_v. */
export const ejeSimetria = (a: number, b: number): number => -b / (2 * a);

/**
 * Punto donde el proyectil toca el suelo (raíz positiva mayor), partiendo de
 * x = 0 con altura c. Si no hay raíz positiva, devuelve 0.
 */
export const aterrizaje = (a: number, b: number, c: number): number => {
  const rs = raices(a, b, c);
  if (rs.length === 0) return 0;
  const pos = rs.filter((x) => x > 1e-9);
  return pos.length ? Math.max(...pos) : 0;
};

/* ── Formato ──────────────────────────────────────────────────────────── */
/** Formatea un número con es-MX y "−" tipográfico. */
export const fmtNum = (n: number, dec = 2): string => {
  if (!Number.isFinite(n)) return "∞";
  const r = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
  const s = r.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 });
  return s.replace("-", "−");
};

/** Construye el texto "a·x² + b·x + c" con signos correctos. */
export const fmtEcuacion = (a: number, b: number, c: number): string => {
  const t1 = `${fmtNum(a)}x²`;
  const sb = b >= 0 ? "+" : "−";
  const t2 = `${sb} ${fmtNum(Math.abs(b))}x`;
  const sc = c >= 0 ? "+" : "−";
  const t3 = c === 0 ? "" : ` ${sc} ${fmtNum(Math.abs(c))}`;
  return `h(x) = ${t1} ${t2}${t3}`;
};
