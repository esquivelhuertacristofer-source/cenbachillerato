/**
 * Datos para el laboratorio de Funciones de variable real
 * (PM-V-P09-A2, "Grafico funciones de variable real e identifico sus simetrías";
 *  progresión 3 / propósito formativo O3).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabFunciones.tsx) y la escena 3D (FuncionesScene.tsx). Por la regla del
 * tamaño del Worker (3 MiB gzip) este archivo NO importa three ni react.
 *
 * Idea pedagógica (MCCEMS 2025 — PM-V «Cálculo diferencial», propósito formativo 3 /
 * contenido formativo C3: "Funciones de variable real · Representación gráfica de
 * funciones de variable real · Conceptos de continuidad, crecimiento, decrecimiento,
 * máximos y mínimos · Desigualdades"):
 *
 * Una FUNCIÓN de variable real asigna a cada número x un único número y = f(x). Su
 * REPRESENTACIÓN GRÁFICA es el conjunto de puntos (x, f(x)) en el plano cartesiano.
 * En esa gráfica se leen sus rasgos:
 *   • RAÍCES o ceros: donde la curva cruza el eje X (f(x) = 0);
 *   • INTERSECCIÓN con Y: el punto (0, f(0));
 *   • CRECIMIENTO / DECRECIMIENTO: tramos donde la curva sube o baja;
 *   • MÁXIMOS y MÍNIMOS locales: cumbres y valles donde cambia de subir a bajar;
 *   • SIMETRÍA: una función es PAR si f(−x) = f(x) (su gráfica es un espejo respecto
 *     al eje Y) e IMPAR si f(−x) = −f(x) (su gráfica gira 180° alrededor del origen).
 */

/* ── Ventana del plano cartesiano ─────────────────────────────────────── */
export const RANGO = 5; // medio-ancho: el plano va de −RANGO a RANGO en X e Y

/* ── Catálogo de funciones ────────────────────────────────────────────── */
export type Simetria = "par" | "impar" | "ninguna";

export interface Funcion {
  id: string;
  nombre: string;
  tipo: string;
  formula: string; // texto "f(x) = …"
  f: (x: number) => number;
  /** descripción breve del rasgo que mejor ilustra. */
  nota: string;
}

export const FUNCIONES: Funcion[] = [
  { id: "cuad", nombre: "Parábola", tipo: "Cuadrática", formula: "f(x) = x²", f: (x) => x * x,
    nota: "La cuadrática más simple: simétrica respecto al eje Y (par), con un mínimo en el origen." },
  { id: "cuad4", nombre: "Parábola desplazada", tipo: "Cuadrática", formula: "f(x) = x² − 4", f: (x) => x * x - 4,
    nota: "La misma parábola corrida 4 hacia abajo: ahora corta el eje X en x = −2 y x = +2." },
  { id: "ncuad", nombre: "Parábola invertida", tipo: "Cuadrática", formula: "f(x) = −x² + 4", f: (x) => -x * x + 4,
    nota: "Abre hacia abajo: tiene un máximo en (0, 4) y raíces en ±2. Modela un tiro o un clavado." },
  { id: "abs", nombre: "Valor absoluto", tipo: "Valor absoluto", formula: "f(x) = |x|", f: (x) => Math.abs(x),
    nota: "Forma de V: par (espejo en el eje Y), con un mínimo en el origen y un pico (no es derivable ahí)." },
  { id: "lin", nombre: "Recta por el origen", tipo: "Lineal", formula: "f(x) = 2x", f: (x) => 2 * x,
    nota: "Una recta que pasa por (0,0): es impar (simétrica respecto al origen) y siempre creciente." },
  { id: "linb", nombre: "Recta con ordenada", tipo: "Lineal", formula: "f(x) = 2x + 1", f: (x) => 2 * x + 1,
    nota: "Al subir la recta con el +1 deja de pasar por el origen: ya no es ni par ni impar." },
  { id: "cub", nombre: "Cúbica simple", tipo: "Cúbica", formula: "f(x) = x³", f: (x) => x * x * x,
    nota: "Impar: gira 180° alrededor del origen. Crece siempre, sin máximos ni mínimos." },
  { id: "cubx", nombre: "Cúbica con joroba", tipo: "Cúbica", formula: "f(x) = x³ − 3x", f: (x) => x * x * x - 3 * x,
    nota: "Impar, con un máximo local en (−1, 2) y un mínimo local en (1, −2); raíces en 0 y ±√3." },
  { id: "sin", nombre: "Seno", tipo: "Trigonométrica", formula: "f(x) = sen(x)", f: (x) => Math.sin(x),
    nota: "Onda impar y periódica: se repite cada 2π. Modela ciclos como la temperatura del día." },
  { id: "cos", nombre: "Coseno", tipo: "Trigonométrica", formula: "f(x) = cos(x)", f: (x) => Math.cos(x),
    nota: "Onda par y periódica: es el seno adelantado un cuarto de vuelta; espejo en el eje Y." },
];

export const FUNCION_DEFAULT = "cuad4";

export const funcionPorId = (id: string): Funcion =>
  FUNCIONES.find((f) => f.id === id) ?? FUNCIONES[0]!;

/* ── Muestreo de la curva (recortada a la ventana) ────────────────────── */
/**
 * Interpola el punto donde el segmento (x1,y1)–(x2,y2) cruza la frontera y = ±H.
 * Devuelve null si no cruza una frontera horizontal entre los dos puntos.
 */
function cruceFrontera(x1: number, y1: number, x2: number, y2: number, H: number): [number, number] | null {
  for (const borde of [H, -H]) {
    if ((y1 - borde) * (y2 - borde) < 0) {
      const t = (borde - y1) / (y2 - y1);
      return [x1 + t * (x2 - x1), borde];
    }
  }
  return null;
}

/**
 * Devuelve la curva y = f(x) como una lista de SEGMENTOS de puntos (x, y),
 * recortada a la caja [−H,H]×[−H,H]. Cada vez que la curva se sale por arriba o
 * por abajo se corta el segmento (así no aparecen líneas falsas verticales).
 */
export function segmentosCurva(fn: Funcion, H = RANGO, paso = 0.04): Array<Array<[number, number]>> {
  const segs: Array<Array<[number, number]>> = [];
  let cur: Array<[number, number]> = [];
  let prev: { x: number; y: number; dentro: boolean } | null = null;

  for (let x = -H; x <= H + 1e-9; x += paso) {
    const y = fn.f(x);
    const dentro = Number.isFinite(y) && y >= -H && y <= H;
    if (dentro) {
      if (prev && !prev.dentro) {
        const c = cruceFrontera(prev.x, prev.y, x, y, H);
        if (c) cur.push(c);
      }
      cur.push([x, y]);
    } else if (prev && prev.dentro) {
      const c = cruceFrontera(prev.x, prev.y, x, y, H);
      if (c) cur.push(c);
      if (cur.length >= 2) segs.push(cur);
      cur = [];
    }
    prev = { x, y, dentro };
  }
  if (cur.length >= 2) segs.push(cur);
  return segs;
}

/* ── Rasgos de la función (cálculo numérico) ──────────────────────────── */
const dedupe = (xs: number[], tol = 0.04): number[] => {
  const out: number[] = [];
  for (const x of xs) if (!out.some((o) => Math.abs(o - x) < tol)) out.push(x);
  return out;
};

/** Refina una raíz por bisección entre a y b (con cambio de signo). */
function biseccion(fn: Funcion, a: number, b: number): number {
  let fa = fn.f(a);
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2;
    const fm = fn.f(m);
    if (fm === 0) return m;
    if (fa * fm < 0) b = m;
    else { a = m; fa = fm; }
  }
  return (a + b) / 2;
}

/** Raíces (ceros) dentro de la ventana: donde la curva cruza el eje X. */
export function raices(fn: Funcion, H = RANGO): number[] {
  const found: number[] = [];
  const N = 2000;
  let px = -H;
  let py = fn.f(-H);
  if (Math.abs(py) < 1e-9) found.push(px);
  for (let i = 1; i <= N; i++) {
    const x = -H + (2 * H * i) / N;
    const y = fn.f(x);
    if (Number.isFinite(py) && Number.isFinite(y)) {
      if (Math.abs(y) < 1e-9) found.push(x);
      else if (py * y < 0) found.push(biseccion(fn, px, x));
    }
    px = x;
    py = y;
  }
  return dedupe(found).sort((a, b) => a - b);
}

/** Intersección con el eje Y: el punto (0, f(0)). */
export const interseccionY = (fn: Funcion): number => fn.f(0);

export interface Extremo { x: number; y: number; tipo: "max" | "min"; }

/** Máximos y mínimos locales dentro de la ventana (detección por muestreo). */
export function extremos(fn: Funcion, H = RANGO): Extremo[] {
  const N = 1200;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= N; i++) {
    const x = -H + (2 * H * i) / N;
    xs.push(x);
    ys.push(fn.f(x));
  }
  const ex: Extremo[] = [];
  for (let i = 1; i < N; i++) {
    const a = ys[i - 1]!;
    const b = ys[i]!;
    const c = ys[i + 1]!;
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) continue;
    if (b > a && b > c && Math.abs(b) <= H) ex.push({ x: xs[i]!, y: b, tipo: "max" });
    else if (b < a && b < c && Math.abs(b) <= H) ex.push({ x: xs[i]!, y: b, tipo: "min" });
  }
  // fusiona extremos casi iguales (mismo tipo y x cercana)
  const out: Extremo[] = [];
  for (const e of ex) {
    if (!out.some((o) => o.tipo === e.tipo && Math.abs(o.x - e.x) < 0.2)) out.push(e);
  }
  return out;
}

/** Clasifica la simetría comparando f(−x) con f(x) en muchos puntos. */
export function simetria(fn: Funcion, H = RANGO): Simetria {
  let par = true;
  let impar = true;
  const N = 240;
  for (let i = 1; i <= N; i++) {
    const x = (H * i) / N;
    const f1 = fn.f(x);
    const f2 = fn.f(-x);
    if (!Number.isFinite(f1) || !Number.isFinite(f2)) continue;
    if (Math.abs(f2 - f1) > 1e-6) par = false;
    if (Math.abs(f2 + f1) > 1e-6) impar = false;
  }
  return par ? "par" : impar ? "impar" : "ninguna";
}

/** Texto descriptivo de la simetría. */
export const simetriaTexto = (s: Simetria): string =>
  s === "par"
    ? "PAR — su gráfica es un espejo respecto al eje Y: f(−x) = f(x)."
    : s === "impar"
    ? "IMPAR — su gráfica gira 180° alrededor del origen: f(−x) = −f(x)."
    : "NINGUNA — no tiene simetría par ni impar.";

/* ── Formato ──────────────────────────────────────────────────────────── */
export const fmtNum = (n: number, dec = 2): string => {
  if (!Number.isFinite(n)) return "∞";
  const r = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
  const z = r === 0 ? 0 : r; // evita "−0"
  return z.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");
};

/** Lista de raíces como texto, p.ej. "x = −2, 2" o "no corta el eje X". */
export const raicesTexto = (rs: number[]): string =>
  rs.length === 0 ? "no corta el eje X" : "x = " + rs.map((r) => fmtNum(r, 2)).join(", ");

/* ── Contenido didáctico (verbatim del propósito) ─────────────────────── */
export const PROBLEMA = {
  enunciado:
    "Dada la función f(x) = x³ − 3x, analiza su gráfica: (a) ¿es par, impar o ninguna? Justifícalo con f(−x). (b) Halla sus raíces. (c) ¿Tiene máximos o mínimos locales y dónde?",
  datos: ["f(x) = x³ − 3x", "Ventana: −5 ≤ x ≤ 5"],
  solucion: [
    "(a) f(−x) = (−x)³ − 3(−x) = −x³ + 3x = −(x³ − 3x) = −f(x). Como f(−x) = −f(x), la función es IMPAR: su gráfica gira 180° alrededor del origen.",
    "(b) x³ − 3x = x(x² − 3) = 0 ⇒ x = 0 o x² = 3 ⇒ x = ±√3 ≈ ±1.73. Tres raíces: −1.73, 0 y 1.73.",
    "(c) Sube, baja y vuelve a subir: tiene un MÁXIMO local en (−1, 2) y un MÍNIMO local en (1, −2).",
  ],
  resultado: "f(x) = x³ − 3x es IMPAR, con raíces en −√3, 0 y √3, máximo local (−1, 2) y mínimo local (1, −2).",
};

export const INSTRUCCIONES = [
  "Elige una función del catálogo y obsérvala en el plano cartesiano.",
  "Activa «Analizar simetría» para ver el espejo respecto al eje Y o al origen y descubrir si es par, impar o ninguna.",
  "Activa «Mostrar rasgos» para marcar las raíces, la intersección con Y y los máximos/mínimos.",
  "Comprueba el problema de A2: selecciona f(x) = x³ − 3x y verifica la simetría, las raíces y los extremos.",
];

export const PREGUNTAS = [
  "¿Dónde corta la curva al eje X (sus raíces) y al eje Y?",
  "¿En qué tramos la función crece y en cuáles decrece?",
  "¿Tiene cumbres (máximos) o valles (mínimos)? ¿Dónde?",
  "Al reflejar la curva, ¿coincide consigo misma? ¿Respecto al eje Y (par) o al origen (impar)?",
];

export const IDEAS = [
  "Una función de variable real asigna a cada x un único valor y = f(x); su gráfica es el conjunto de puntos (x, f(x)).",
  "Las raíces son donde la gráfica cruza el eje X (f(x) = 0); la intersección con Y es el punto (0, f(0)).",
  "Una función crece donde la curva sube y decrece donde baja; entre ambos hay máximos y mínimos locales.",
  "Es PAR si f(−x) = f(x) (espejo en el eje Y) e IMPAR si f(−x) = −f(x) (giro de 180° en el origen).",
  "La simetría ahorra trabajo: si conoces la mitad de una función par o impar, conoces la otra mitad.",
  "Funciones distintas modelan cambios distintos: rectas (ritmo constante), parábolas (tiros), senoidales (ciclos).",
];

export const GLOSARIO = [
  { termino: "Función de variable real", definicion: "Regla que asigna a cada número real x un único número real y = f(x).", ejemplo: "f(x) = x² − 4 asigna a x = 3 el valor y = 5." },
  { termino: "Gráfica de una función", definicion: "Conjunto de todos los puntos (x, f(x)) dibujados en el plano cartesiano.", ejemplo: "La gráfica de f(x) = x² es una parábola." },
  { termino: "Raíz o cero", definicion: "Valor de x donde f(x) = 0; la gráfica cruza (o toca) el eje X.", ejemplo: "x² − 4 = 0 tiene raíces x = −2 y x = 2." },
  { termino: "Intersección con el eje Y", definicion: "El punto (0, f(0)) donde la gráfica corta el eje vertical.", ejemplo: "Para f(x) = x² − 4 es (0, −4)." },
  { termino: "Crecimiento / decrecimiento", definicion: "Tramo donde la función sube (crece) o baja (decrece) al avanzar en x.", ejemplo: "x² decrece para x < 0 y crece para x > 0." },
  { termino: "Máximo local", definicion: "Punto donde la función deja de crecer y empieza a decrecer (una cumbre).", ejemplo: "x³ − 3x tiene un máximo local en (−1, 2)." },
  { termino: "Mínimo local", definicion: "Punto donde la función deja de decrecer y empieza a crecer (un valle).", ejemplo: "x³ − 3x tiene un mínimo local en (1, −2)." },
  { termino: "Función par", definicion: "Cumple f(−x) = f(x); su gráfica es simétrica respecto al eje Y.", ejemplo: "x², |x| y cos(x) son pares." },
  { termino: "Función impar", definicion: "Cumple f(−x) = −f(x); su gráfica es simétrica respecto al origen.", ejemplo: "x³, 2x y sen(x) son impares." },
  { termino: "Continuidad", definicion: "Una función es continua si su gráfica se puede dibujar sin levantar el lápiz.", ejemplo: "Las parábolas y rectas son continuas en todos los reales." },
];

export const CONTEXTO =
  "Las funciones modelan el cambio en todas partes. Una PARÁBOLA describe la trayectoria de un balón o de un clavadista en Acapulco y la del agua en una fuente. Una RECTA modela un ritmo constante: la tarifa de un taxi o el consumo de CFE. Una función SENOIDAL describe ciclos que se repiten: la temperatura a lo largo del día en la Ciudad de México, las mareas en el Golfo o la corriente alterna a 60 Hz de la red eléctrica nacional. Reconocer la forma de la gráfica —y su simetría— ayuda a predecir el comportamiento del fenómeno y a encontrar valores óptimos (máximos y mínimos), que es de lo que trata el cálculo.";

export const FUENTE =
  "MCCEMS 2025 — Pensamiento Matemático V «Cálculo diferencial», propósito formativo 3 y contenido formativo: Funciones de variable real · Representación gráfica de funciones de variable real · Conceptos de continuidad, crecimiento, decrecimiento, máximos y mínimos · Desigualdades.";

export const HECHOS = [
  "La palabra «función» la introdujo Leibniz en 1673; la notación f(x) es de Euler (siglo XVIII).",
  "Toda función par tiene su gráfica idéntica a su reflejo en el eje Y; por eso basta estudiar la mitad x ≥ 0.",
  "El seno y el coseno son la misma onda desfasada: cos(x) = sen(x + π/2).",
  "Una recta es a la vez la función más simple y la única cuya razón de cambio (pendiente) es constante.",
  "Los máximos y mínimos de una función son la base de los problemas de optimización del cálculo diferencial.",
];
