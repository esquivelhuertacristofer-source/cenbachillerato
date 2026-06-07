/**
 * Datos para el laboratorio "Concepto de función y sus representaciones"
 * (PM-IV-P01-A2, ejercicio_matematico "Identifico y evalúo una función a partir
 * de una tabla de valores"; UAC PM-IV; progresión 1: "Comprende el concepto de
 * función y sus representaciones (tabular, gráfica, algebraica, verbal)").
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabFuncionesConcepto.tsx) y la escena 3D (FuncionesConceptoScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-IV P1):
 *  · Una FUNCIÓN es una regla que a cada elemento del DOMINIO le asigna
 *    EXACTAMENTE UN elemento del RANGO.
 *  · PRUEBA DE LA LÍNEA VERTICAL: si una recta vertical corta la gráfica en más
 *    de un punto, la relación NO es función (una circunferencia completa no la
 *    pasa; una parábola sí).
 *  · CUATRO REPRESENTACIONES de una misma función: tabular, gráfica, algebraica
 *    y verbal.
 *
 * Todos los valores numéricos provienen del contenido verbatim de las
 * actividades A1 (lectura) y A2 (ejercicio del café que se enfría). Donde el
 * modelo es una aproximación se etiqueta como tal (campo `nota`).
 */

export type RelId =
  | "cafe"
  | "lineal"
  | "tiro"
  | "metro"
  | "orizaba"
  | "circulo"
  | "parabola_h";

export type Modo = "maquina" | "test";
export const MODO_DEF: Modo = "maquina";
export const REL_DEF: RelId = "cafe";

export type Pt2 = [number, number]; // par (x, y) en coordenadas de DATOS

/* ── Vista (mapeo datos → plano) ──────────────────────────────────────────── */
export interface Vista {
  xmin: number; xmax: number; ymin: number; ymax: number;
  xticks: number[]; yticks: number[];
  xlabel: string; ylabel: string;
}

export interface TablaRow { x: number; y: number; }

export interface Relacion {
  id: RelId;
  label: string;          // corto (chips)
  titulo: string;         // descriptivo
  esFuncion: boolean;
  color: string;
  icono: string;
  // 4 representaciones
  algebraica: string;     // fórmula
  verbal: string;         // descripción en palabras
  dominioTxt: string;     // dominio/rango en palabras
  contexto: string;       // contexto mexicano (A1)
  unidadX: string;
  unidadY: string;
  vista: Vista;
  // dominio real (para evaluar y para el barrido)
  domMin: number;
  domMax: number;
  // máquina (solo funciones): paso del control
  xStep: number;
  xDef: number;
  // tabla a mostrar (café: verbatim; resto: se calcula en el shell)
  tabla?: TablaRow[];
  tablaVerbatim?: boolean;
  // nota de honestidad por-relación (valores aproximados)
  nota?: string;
}

/* ── Catálogo de relaciones ───────────────────────────────────────────────── */
export const RELACIONES: Relacion[] = [
  {
    id: "cafe",
    label: "Café que se enfría",
    titulo: "Temperatura de un café en reposo",
    esFuncion: true,
    color: "#FB923C",
    icono: "fa-mug-hot",
    algebraica: "T(t) = 90 − 6t",
    verbal: "El café se sirve a 90 °C y pierde 6 °C por cada minuto que pasa.",
    dominioTxt: "Dominio: tiempo t ≥ 0 (min). Rango: temperatura que va bajando desde 90 °C.",
    contexto: "Ejercicio del enunciado (A2): a cada minuto le corresponde una sola temperatura, por eso es función.",
    unidadX: "min",
    unidadY: "°C",
    vista: { xmin: 0, xmax: 14, ymin: 0, ymax: 96, xticks: [0, 2, 4, 6, 8, 10, 12, 14], yticks: [0, 20, 40, 60, 80], xlabel: "tiempo (min)", ylabel: "temperatura (°C)" },
    domMin: 0, domMax: 14, xStep: 0.5, xDef: 0,
    tabla: [
      { x: 0, y: 90 }, { x: 2, y: 78 }, { x: 4, y: 66 }, { x: 6, y: 54 }, { x: 8, y: 42 },
    ],
    tablaVerbatim: true,
  },
  {
    id: "lineal",
    label: "Recta f(x)=2x+3",
    titulo: "Función lineal (1.er grado)",
    esFuncion: true,
    color: "#34D399",
    icono: "fa-slash",
    algebraica: "f(x) = 2x + 3",
    verbal: "Por cada unidad que aumenta x, y aumenta 2; el valor inicial (en x = 0) es 3.",
    dominioTxt: "Dominio: todos los números reales. Rango: todos los números reales.",
    contexto: "Ejemplo de representación algebraica de la lectura (A1).",
    unidadX: "", unidadY: "",
    vista: { xmin: -5, xmax: 5, ymin: -7, ymax: 13, xticks: [-4, -2, 0, 2, 4], yticks: [-6, 0, 6, 12], xlabel: "x", ylabel: "y" },
    domMin: -5, domMax: 5, xStep: 0.5, xDef: 1,
  },
  {
    id: "tiro",
    label: "Tiro h(t)=−5t²+20t",
    titulo: "Altura de un objeto lanzado (2.º grado)",
    esFuncion: true,
    color: "#60A5FA",
    icono: "fa-arrow-up-from-bracket",
    algebraica: "h(t) = −5t² + 20t",
    verbal: "Un objeto lanzado sube, alcanza su altura máxima y vuelve a bajar: su altura es función del tiempo.",
    dominioTxt: "Dominio: tiempo de vuelo t ∈ [0, 4] s. Rango: altura entre 0 y 20 m.",
    contexto: "Ejemplo de representación algebraica de la lectura (A1). Una parábola SÍ pasa la prueba de la línea vertical.",
    unidadX: "s", unidadY: "m",
    vista: { xmin: 0, xmax: 4.4, ymin: 0, ymax: 22, xticks: [0, 1, 2, 3, 4], yticks: [0, 5, 10, 15, 20], xlabel: "tiempo (s)", ylabel: "altura (m)" },
    domMin: 0, domMax: 4, xStep: 0.2, xDef: 1,
  },
  {
    id: "metro",
    label: "Metro (constante)",
    titulo: "Costo del Metro: función constante",
    esFuncion: true,
    color: "#C084FC",
    icono: "fa-train-subway",
    algebraica: "f(x) = 5",
    verbal: "Cada viaje cuesta lo mismo sin importar la distancia recorrida: una función constante.",
    dominioTxt: "Dominio: número de viajes x ≥ 0. Rango: un solo valor, $5.",
    contexto: "Ejemplo de la lectura (A1): el precio del Metro de la CDMX es constante (tarifa vigente $5).",
    unidadX: "viajes", unidadY: "$",
    vista: { xmin: 0, xmax: 6, ymin: 0, ymax: 10, xticks: [0, 1, 2, 3, 4, 5, 6], yticks: [0, 2, 4, 6, 8, 10], xlabel: "número de viajes", ylabel: "costo ($)" },
    domMin: 0, domMax: 6, xStep: 1, xDef: 2,
    nota: "El monto $5 corresponde a la tarifa vigente del Metro de la CDMX; lo que la lectura ilustra es que el precio NO depende de la distancia (función constante).",
  },
  {
    id: "orizaba",
    label: "Pico de Orizaba",
    titulo: "Temperatura según la altitud",
    esFuncion: true,
    color: "#F472B6",
    icono: "fa-mountain",
    algebraica: "T(h) ≈ 27 − 6h",
    verbal: "Al subir el Pico de Orizaba, por cada 1000 m de ascenso la temperatura baja unos 6 °C.",
    dominioTxt: "Dominio: altitud h ∈ [0, 5.6] km (la cima está a 5636 m). Rango: temperatura aproximada.",
    contexto: "Ejemplo de la lectura (A1): la temperatura es función de la altitud (modelo lineal aproximado, ~6 °C por cada 1000 m).",
    unidadX: "km", unidadY: "°C",
    vista: { xmin: 0, xmax: 5.6, ymin: -10, ymax: 30, xticks: [0, 1, 2, 3, 4, 5], yticks: [-10, 0, 10, 20, 30], xlabel: "altitud (km)", ylabel: "temperatura (°C)" },
    domMin: 0, domMax: 5.6, xStep: 0.2, xDef: 1,
    nota: "Modelo APROXIMADO y lineal: la temperatura base (27 °C) y la tasa (~6 °C/1000 m) son típicas; en la realidad varían con el clima y la humedad.",
  },
  {
    id: "circulo",
    label: "Circunferencia",
    titulo: "Circunferencia x² + y² = 25",
    esFuncion: false,
    color: "#F87171",
    icono: "fa-circle-notch",
    algebraica: "x² + y² = 25",
    verbal: "Una circunferencia completa: para casi cada x hay DOS valores de y (uno arriba y uno abajo).",
    dominioTxt: "Para −5 < x < 5 hay dos valores de y, así que NO es función.",
    contexto: "La lectura (A1) lo dice explícito: «Una circunferencia completa no pasa la prueba de la línea vertical».",
    unidadX: "", unidadY: "",
    vista: { xmin: -6, xmax: 6, ymin: -6, ymax: 6, xticks: [-5, 0, 5], yticks: [-5, 0, 5], xlabel: "x", ylabel: "y" },
    domMin: -5, domMax: 5, xStep: 0.5, xDef: 0,
  },
  {
    id: "parabola_h",
    label: "Parábola horizontal",
    titulo: "Parábola acostada x = y²",
    esFuncion: false,
    color: "#FBBF24",
    icono: "fa-share",
    algebraica: "x = y²",
    verbal: "Una parábola «acostada»: para cada x > 0 hay DOS valores de y (±√x), así que NO es función.",
    dominioTxt: "Para x > 0 hay dos valores de y, así que NO es función de x.",
    contexto: "Contraste con la parábola vertical h(t)=−5t²+20t, que SÍ es función. Solo cambia la orientación.",
    unidadX: "", unidadY: "",
    vista: { xmin: -2, xmax: 10, ymin: -3.4, ymax: 3.4, xticks: [0, 3, 6, 9], yticks: [-3, 0, 3], xlabel: "x", ylabel: "y" },
    domMin: 0, domMax: 9, xStep: 0.5, xDef: 4,
  },
];

const REL_MAP: Record<RelId, Relacion> = RELACIONES.reduce((acc, r) => {
  acc[r.id] = r;
  return acc;
}, {} as Record<RelId, Relacion>);

export function rel(id: RelId): Relacion {
  return REL_MAP[id];
}

/** Funciones evaluables (modo máquina). */
export const FUNCIONES: Relacion[] = RELACIONES.filter((r) => r.esFuncion);

/* ── Evaluación ───────────────────────────────────────────────────────────── */
/** Valor f(x) de una relación que es función. NaN si no es función o fuera de dominio. */
export function evalRel(id: RelId, x: number): number {
  switch (id) {
    case "cafe": return 90 - 6 * x;
    case "lineal": return 2 * x + 3;
    case "tiro": return -5 * x * x + 20 * x;
    case "metro": return 5;
    case "orizaba": return 27 - 6 * x;
    default: return NaN; // circulo / parabola_h no son funciones
  }
}

export function enDominio(id: RelId, x: number): boolean {
  const r = rel(id);
  return x >= r.domMin - 1e-9 && x <= r.domMax + 1e-9;
}

/**
 * Ramas (valores de y) de la relación en una x dada: cuántas veces la corta una
 * línea vertical. Una función devuelve a lo más 1; las no-funciones, 2.
 */
export function ramas(id: RelId, x: number): number[] {
  if (id === "circulo") {
    const d = 25 - x * x;
    if (d < -1e-9) return [];
    if (d < 1e-9) return [0];
    const s = Math.sqrt(d);
    return [s, -s];
  }
  if (id === "parabola_h") {
    if (x < -1e-9) return [];
    if (x < 1e-9) return [0];
    const s = Math.sqrt(x);
    return [s, -s];
  }
  // funciones
  if (!enDominio(id, x)) return [];
  const y = evalRel(id, x);
  return Number.isFinite(y) ? [y] : [];
}

/**
 * Muestrea la(s) curva(s) de una relación en coordenadas de DATOS, lista(s) para
 * que la escena las mapee al plano. Devuelve una o varias polilíneas.
 */
export function muestrear(id: RelId, n = 160): Pt2[][] {
  const r = rel(id);
  if (id === "circulo") {
    const pts: Pt2[] = [];
    for (let i = 0; i <= n; i++) {
      const t = (2 * Math.PI * i) / n;
      pts.push([5 * Math.cos(t), 5 * Math.sin(t)]);
    }
    return [pts];
  }
  if (id === "parabola_h") {
    const pts: Pt2[] = [];
    const ya = Math.sqrt(r.domMax);
    for (let i = 0; i <= n; i++) {
      const y = -ya + (2 * ya * i) / n;
      pts.push([y * y, y]);
    }
    return [pts];
  }
  // funciones: una polilínea sobre el dominio
  const pts: Pt2[] = [];
  for (let i = 0; i <= n; i++) {
    const x = r.domMin + ((r.domMax - r.domMin) * i) / n;
    const y = evalRel(id, x);
    if (Number.isFinite(y)) pts.push([x, y]);
  }
  return [pts];
}

/** Tabla a mostrar: la verbatim del café, o una calculada en los ticks del eje X. */
export function tablaDe(id: RelId): { rows: TablaRow[]; verbatim: boolean } {
  const r = rel(id);
  if (r.tabla && r.tablaVerbatim) return { rows: r.tabla, verbatim: true };
  const rows: TablaRow[] = [];
  for (const x of r.vista.xticks) {
    if (!enDominio(id, x)) continue;
    const y = evalRel(id, x);
    if (Number.isFinite(y)) rows.push({ x, y });
  }
  return { rows, verbatim: false };
}

/* ── Contenido pedagógico (verbatim-alineado A1/A2) ───────────────────────── */
export interface Representacion { clave: string; nombre: string; icono: string; desc: string; }

export const REPRESENTACIONES: Representacion[] = [
  { clave: "tabular", nombre: "Tabular", icono: "fa-table-cells", desc: "Una tabla de pares (x, y). Muestra valores concretos de forma discreta." },
  { clave: "grafica", nombre: "Gráfica", icono: "fa-chart-line", desc: "Una curva en el plano cartesiano. Revela tendencias, máximos y mínimos de un vistazo." },
  { clave: "algebraica", nombre: "Algebraica", icono: "fa-square-root-variable", desc: "Una fórmula, p. ej. f(x) = 2x + 3. Permite calcular el valor para cualquier x del dominio." },
  { clave: "verbal", nombre: "Verbal", icono: "fa-comment", desc: "La regla descrita en palabras, p. ej. «la altura aumenta 2 metros por cada segundo»." },
];

export const IDEAS: string[] = [
  "Una FUNCIÓN es una regla que a cada elemento del dominio le asigna EXACTAMENTE UN elemento del rango.",
  "Prueba de la línea vertical: si una recta vertical corta la gráfica en más de un punto, la relación NO es función.",
  "Una circunferencia completa NO pasa la prueba de la línea vertical; una parábola (vertical) SÍ la pasa.",
  "La misma función se puede representar de cuatro formas: tabular, gráfica, algebraica y verbal.",
  "La forma algebraica permite calcular el valor para cualquier x; la tabla solo muestra algunos pares concretos.",
  "El dominio es el conjunto de entradas válidas (x); el rango, el conjunto de salidas que produce (y).",
  "Ejemplos reales: la velocidad en el Periférico es función del tiempo; la temperatura del Pico de Orizaba, de la altitud; el precio del Metro es una función constante.",
];

export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "T(t) = 90 − 6t", texto: "modelo del café que se enfría (enunciado A2)", icono: "fa-mug-hot" },
  { valor: "T(10) = 30 °C", texto: "a los 10 minutos el café está a 30 °C", icono: "fa-temperature-half" },
  { valor: "t ≈ 11.67 min", texto: "cuándo llega a 20 °C: 90 − 6t = 20", icono: "fa-clock" },
  { valor: "≈ 6 °C / 1000 m", texto: "cuánto baja la temperatura al subir el Pico de Orizaba", icono: "fa-mountain" },
];

/* ── Reto guiado (verbatim A2) ─────────────────────────────────────────────── */
export interface RetoPaso { etiqueta: string; pregunta: string; respuesta: string; }
export const RETO = {
  enunciado: "Un café se sirve a 90 °C y, en reposo, pierde 6 °C por cada minuto que pasa.",
  pasos: [
    { etiqueta: "a", pregunta: "¿La temperatura es función del tiempo?", respuesta: "Sí: a cada tiempo le corresponde exactamente una temperatura." },
    { etiqueta: "b", pregunta: "Escribe la regla algebraica T(t).", respuesta: "T(t) = 90 − 6t (baja 12 °C cada 2 min ⇒ −6 °C/min; en t = 0, T = 90)." },
    { etiqueta: "c", pregunta: "¿Cuánto vale T(10)?", respuesta: "T(10) = 90 − 60 = 30 °C." },
    { etiqueta: "d", pregunta: "¿En qué minuto llega a 20 °C?", respuesta: "90 − 6t = 20 ⇒ 6t = 70 ⇒ t = 70/6 ≈ 11.67 min." },
  ] as RetoPaso[],
};

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);

/** Número con su unidad (la unidad puede ser ""). */
export function conUnidad(n: number, unidad: string, dec = 1): string {
  const s = ES(n, dec);
  return unidad ? `${s} ${unidad}` : s;
}

/** Sustitución algebraica en vivo: "T(0) = 90 − 6(0) = 90 °C". */
export function sustitucion(id: RelId, x: number): string {
  const y = evalRel(id, x);
  const yx = ES(y, 1);
  const xs = ES(x, 1);
  switch (id) {
    case "cafe": return `T(${xs}) = 90 − 6(${xs}) = ${yx}`;
    case "lineal": return `f(${xs}) = 2(${xs}) + 3 = ${yx}`;
    case "tiro": return `h(${xs}) = −5(${xs})² + 20(${xs}) = ${yx}`;
    case "metro": return `f(${xs}) = 5`;
    case "orizaba": return `T(${xs}) ≈ 27 − 6(${xs}) = ${yx}`;
    default: return "";
  }
}
