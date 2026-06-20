/**
 * Datos y matemática PURA del laboratorio de Estadística descriptiva
 * (Pensamiento Matemático VI «Pensamiento estadístico y probabilístico»).
 *
 * ⚠️ NO importar three / @react-three aquí: este módulo es de DATOS y puede
 * entrar al bundle del Worker (límite FREE 3 MiB gzipped).
 *
 * Un mismo conjunto de datos se visualiza como un "dot plot" 3D sobre la recta
 * numérica. Sobre él se marcan:
 *   • la MEDIA como punto de equilibrio (fulcro de una balanza),
 *   • la MEDIANA como el corte que deja la mitad de los datos a cada lado,
 *   • la MODA como la(s) columna(s) más alta(s),
 *   • la DISPERSIÓN como la banda media ± σ y el rango [mín, máx],
 *   • el HISTOGRAMA al agrupar los datos en intervalos (gráficas).
 *
 * Sirve a tres propósitos formativos de PM-VI:
 *   P05 (tablas de frecuencia / histogramas), P09 (tendencia central),
 *   P10 (dispersión: rango, varianza, desviación estándar).
 */

export type Variante = "tendencia" | "dispersion" | "graficas";

// ── Conjuntos de datos de contexto real (México, didácticos) ────────────────
export interface Conjunto {
  id: string;
  nombre: string;
  unidad: string;
  simbolo: string; // prefijo/sufijo corto para readouts ($, °C, …)
  valores: number[];
  contexto: string;
  /** Decimales recomendados para mostrar los estadísticos de este conjunto. */
  dec: number;
}

export const CONJUNTOS: Conjunto[] = [
  {
    id: "salarios",
    nombre: "Salarios de 9 empleados",
    unidad: "pesos al mes",
    simbolo: "$",
    valores: [6500, 7200, 7800, 8000, 8500, 9000, 10000, 12000, 45000],
    dec: 0,
    contexto:
      "Nueve sueldos de una empresa. El salario del director (45 000) es un valor atípico que jala la MEDIA hacia arriba: 8 de 9 personas ganan menos que el promedio. Aquí la MEDIANA representa mejor al empleado típico.",
  },
  {
    id: "calificaciones",
    nombre: "Calificaciones de un grupo",
    unidad: "puntos (0–10)",
    simbolo: "",
    valores: [6, 7, 7, 8, 8, 8, 8, 9, 9, 6, 5, 10, 8, 7, 9],
    dec: 2,
    contexto:
      "Las 15 calificaciones de un grupo de bachillerato. Hay un valor que se repite más que los demás: esa es la MODA. Como no hay valores extremos, media, mediana y moda quedan cerca entre sí.",
  },
  {
    id: "goles",
    nombre: "Goles por jornada (Liga MX)",
    unidad: "goles por partido",
    simbolo: "",
    valores: [2, 1, 0, 3, 2, 1, 2, 4, 1, 2, 0, 3, 2, 1, 5, 2, 0],
    dec: 2,
    contexto:
      "Goles anotados por un equipo en 17 jornadas. Son datos discretos: la MODA (el marcador más frecuente) tiene sentido directo, y el histograma muestra de un vistazo la jornada típica.",
  },
  {
    id: "temperaturas",
    nombre: "Temperatura máxima CDMX",
    unidad: "°C",
    simbolo: "°C",
    valores: [22, 24, 23, 25, 21, 20, 26, 24, 23, 22, 25, 19, 24, 23],
    dec: 1,
    contexto:
      "Catorce temperaturas máximas diarias. Los datos están agrupados alrededor de un centro con poca DISPERSIÓN: la desviación estándar σ es pequeña frente a la media.",
  },
  {
    id: "grupoA",
    nombre: "Grupo A — 5 calificaciones (dispersión)",
    unidad: "puntos",
    simbolo: "",
    valores: [60, 70, 75, 80, 90],
    dec: 2,
    contexto:
      "Es el ejercicio de DISPERSIÓN: el Grupo A y el Grupo B tienen la MISMA media (75), pero el Grupo A está mucho más disperso. Carga este conjunto en el modo «Dispersión» y mira cómo la banda media ± σ se ensancha. σ del Grupo A = 10 puntos; la del Grupo B sería ≈ 1.41.",
  },
  {
    id: "examen20",
    nombre: "Examen de 20 alumnos (histograma)",
    unidad: "puntos (0–100)",
    simbolo: "",
    valores: [55, 60, 65, 65, 70, 70, 70, 75, 75, 75, 75, 80, 80, 80, 85, 85, 90, 90, 95, 100],
    dec: 1,
    contexto:
      "Es el ejercicio de HISTOGRAMA: las calificaciones de 20 alumnos. En el modo «Histograma» se agrupan en intervalos de amplitud 10 (50–59, 60–69, 70–79, 80–89, 90–100); el intervalo 70–79 es el más alto (6 alumnos) y la ojiva (frecuencia acumulada) termina en 100 %.",
  },
];

export const CONJUNTO_DEFAULT = "salarios";
export const conjuntoPorId = (id: string): Conjunto => CONJUNTOS.find((c) => c.id === id) ?? CONJUNTOS[0]!;

// ── Estadística PURA ────────────────────────────────────────────────────────
export const suma = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);

export const media = (xs: number[]): number => (xs.length ? suma(xs) / xs.length : 0);

export function mediana(xs: number[]): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  const mid = Math.floor(n / 2);
  return n % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

export interface ModaInfo {
  valores: number[]; // valor(es) modal(es)
  frecuencia: number; // frecuencia de la moda
  tipo: "amodal" | "unimodal" | "multimodal";
}

export function moda(xs: number[]): ModaInfo {
  if (!xs.length) return { valores: [], frecuencia: 0, tipo: "amodal" };
  const freq = new Map<number, number>();
  for (const x of xs) freq.set(x, (freq.get(x) ?? 0) + 1);
  let max = 0;
  for (const f of freq.values()) if (f > max) max = f;
  // amodal: todos aparecen lo mismo (típicamente todos una vez)
  if (max <= 1) return { valores: [], frecuencia: 1, tipo: "amodal" };
  const vals = [...freq.entries()].filter(([, f]) => f === max).map(([v]) => v).sort((a, b) => a - b);
  return { valores: vals, frecuencia: max, tipo: vals.length === 1 ? "unimodal" : "multimodal" };
}

export const minimo = (xs: number[]): number => (xs.length ? Math.min(...xs) : 0);
export const maximo = (xs: number[]): number => (xs.length ? Math.max(...xs) : 0);
export const rango = (xs: number[]): number => maximo(xs) - minimo(xs);

/** Varianza POBLACIONAL (divide entre n): σ² = Σ(x−μ)² / n. */
export function varianza(xs: number[]): number {
  if (!xs.length) return 0;
  const m = media(xs);
  return suma(xs.map((x) => (x - m) * (x - m))) / xs.length;
}

export const desviacion = (xs: number[]): number => Math.sqrt(varianza(xs));

/** Coeficiente de variación CV = σ/μ (en %), comparable entre conjuntos. */
export const coefVariacion = (xs: number[]): number => {
  const m = media(xs);
  return m !== 0 ? (desviacion(xs) / Math.abs(m)) * 100 : 0;
};

/** Cuantil por interpolación lineal (método "type-7", como hojas de cálculo). */
export function cuantil(xs: number[], p: number): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  if (s.length === 1) return s[0]!;
  const h = (s.length - 1) * p;
  const lo = Math.floor(h);
  const hi = Math.ceil(h);
  return s[lo]! + (h - lo) * (s[hi]! - s[lo]!);
}

export const q1 = (xs: number[]): number => cuantil(xs, 0.25);
export const q3 = (xs: number[]): number => cuantil(xs, 0.75);
export const iqr = (xs: number[]): number => q3(xs) - q1(xs);

// ── Frecuencias e histograma ────────────────────────────────────────────────
export interface Barra {
  x0: number;
  x1: number;
  mid: number;
  conteo: number;
  etiqueta: string;
}

/** Número de clases sugerido por la regla de Sturges: k = 1 + 3.322·log10(n). */
export const sturges = (n: number): number => Math.max(1, Math.ceil(1 + 3.322 * Math.log10(Math.max(1, n))));

export function histograma(xs: number[], nbins?: number): { barras: Barra[]; maxConteo: number } {
  if (!xs.length) return { barras: [], maxConteo: 0 };
  const lo = minimo(xs);
  const hi = maximo(xs);
  const k = nbins ?? sturges(xs.length);
  const ancho = (hi - lo) / k || 1;
  const barras: Barra[] = [];
  let maxConteo = 0;
  for (let i = 0; i < k; i++) {
    const x0 = lo + i * ancho;
    const x1 = i === k - 1 ? hi : lo + (i + 1) * ancho;
    // el último intervalo incluye el extremo superior
    const conteo = xs.filter((x) => (i === k - 1 ? x >= x0 && x <= x1 : x >= x0 && x < x1)).length;
    if (conteo > maxConteo) maxConteo = conteo;
    barras.push({ x0, x1, mid: (x0 + x1) / 2, conteo, etiqueta: `${fmt(x0, 0)}–${fmt(x1, 0)}` });
  }
  return { barras, maxConteo };
}

/** Tabla de frecuencias por VALOR (para el dot-plot apilado). */
export interface Columna {
  valor: number;
  conteo: number;
}
export function columnas(xs: number[]): { cols: Columna[]; maxConteo: number } {
  const freq = new Map<number, number>();
  for (const x of xs) freq.set(x, (freq.get(x) ?? 0) + 1);
  const cols = [...freq.entries()].map(([valor, conteo]) => ({ valor, conteo })).sort((a, b) => a.valor - b.valor);
  const maxConteo = cols.reduce((m, c) => Math.max(m, c.conteo), 0);
  return { cols, maxConteo };
}

// ── Formateadores ───────────────────────────────────────────────────────────
export function fmt(n: number, dec = 2): string {
  if (!Number.isFinite(n)) return "—";
  const r = Number(n.toFixed(dec));
  const v = Object.is(r, -0) ? 0 : r;
  return v.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: dec }).replace(/−/g, "-");
}

/** Paquete completo de estadísticos de un conjunto (para readouts). */
export interface Resumen {
  n: number;
  suma: number;
  media: number;
  mediana: number;
  moda: ModaInfo;
  min: number;
  max: number;
  rango: number;
  varianza: number;
  desviacion: number;
  cv: number;
  q1: number;
  q3: number;
  iqr: number;
}

export function resumen(xs: number[]): Resumen {
  return {
    n: xs.length,
    suma: suma(xs),
    media: media(xs),
    mediana: mediana(xs),
    moda: moda(xs),
    min: minimo(xs),
    max: maximo(xs),
    rango: rango(xs),
    varianza: varianza(xs),
    desviacion: desviacion(xs),
    cv: coefVariacion(xs),
    q1: q1(xs),
    q3: q3(xs),
    iqr: iqr(xs),
  };
}

// ── Contenido didáctico ─────────────────────────────────────────────────────
export const VARIANTES: { id: Variante; nombre: string; icon: string; desc: string }[] = [
  {
    id: "tendencia",
    nombre: "Tendencia central",
    icon: "fa-down-left-and-up-right-to-center",
    desc: "Media (punto de equilibrio), mediana (el corte central) y moda (la columna más alta). Mira cómo un valor atípico mueve la media pero casi no a la mediana.",
  },
  {
    id: "dispersion",
    nombre: "Dispersión",
    icon: "fa-arrows-left-right-to-line",
    desc: "Rango [mín, máx] y la banda media ± σ. A mayor desviación estándar, más esparcidos están los datos alrededor del centro.",
  },
  {
    id: "graficas",
    nombre: "Histograma",
    icon: "fa-chart-column",
    desc: "Agrupa los datos en intervalos (clases) y cuenta cuántos caen en cada uno: así nace el histograma y se ve la forma de la distribución.",
  },
];

export const OBJETIVOS = [
  "Calcular e interpretar las medidas de tendencia central: media, mediana y moda.",
  "Reconocer cuándo la mediana representa mejor que la media (datos con valores atípicos).",
  "Medir la dispersión con el rango, la varianza y la desviación estándar.",
  "Organizar datos en una tabla de frecuencias y leer un histograma.",
];

export const IDEAS = [
  "La MEDIA es el punto de equilibrio: si los datos fueran pesos sobre una regla, la media es donde la regla no se inclina.",
  "La MEDIANA parte los datos ordenados en dos mitades iguales; no le afectan los valores extremos.",
  "La MODA es el valor que más se repite; un conjunto puede no tener moda (amodal) o tener varias (multimodal).",
  "Un valor ATÍPICO (outlier) jala la media hacia él, pero casi no mueve la mediana. Por eso el sueldo MEDIANO suele informar mejor que el promedio.",
  "La DESVIACIÓN ESTÁNDAR σ resume cuánto se alejan los datos de la media; σ² es la varianza.",
];

export const GLOSARIO = [
  { termino: "Media aritmética (x̄)", definicion: "Suma de todos los datos entre la cantidad de datos: x̄ = Σx / n. Es el punto de equilibrio de la distribución.", ejemplo: "114 000 / 9 = 12 666.67 pesos." },
  { termino: "Mediana", definicion: "El valor central de los datos ORDENADOS: deja la mitad por debajo y la mitad por encima. Con n impar es el dato en la posición (n+1)/2.", ejemplo: "9 sueldos ordenados ⇒ el 5.º = 8 500 pesos." },
  { termino: "Moda", definicion: "El valor que aparece con mayor frecuencia. Puede haber una (unimodal), varias (multimodal) o ninguna (amodal).", ejemplo: "Si el 8 se repite más que cualquier otra calificación, la moda es 8." },
  { termino: "Valor atípico (outlier)", definicion: "Dato muy alejado del resto. Afecta mucho a la media y poco a la mediana.", ejemplo: "El salario de 45 000 frente a sueldos de 6 500–12 000." },
  { termino: "Rango", definicion: "Diferencia entre el dato máximo y el mínimo: mide la amplitud total de los datos.", ejemplo: "45 000 − 6 500 = 38 500 pesos." },
  { termino: "Varianza (σ²)", definicion: "Promedio de los cuadrados de las distancias a la media: σ² = Σ(x − x̄)² / n.", ejemplo: "Cuanto más dispersos los datos, mayor la varianza." },
  { termino: "Desviación estándar (σ)", definicion: "Raíz cuadrada de la varianza; está en las mismas unidades que los datos.", ejemplo: "σ = √σ². Si σ es pequeña, los datos están apretados alrededor de la media." },
  { termino: "Tabla de frecuencias", definicion: "Cuenta cuántos datos caen en cada valor o intervalo (clase).", ejemplo: "Goles: 0→3, 1→4, 2→6, 3→2, 4→1, 5→1." },
  { termino: "Histograma", definicion: "Gráfica de barras contiguas de una tabla de frecuencias con intervalos; muestra la forma de la distribución.", ejemplo: "Barras más altas donde se concentran los datos." },
];

export const CONTEXTO =
  "Las medidas de tendencia central y de dispersión son la base de la estadística descriptiva: resumen un conjunto de datos en pocos números. El INEGI las usa para reportar el ingreso de los hogares (donde el ingreso MEDIANO informa mejor que el promedio por los hogares de altos ingresos), la temperatura, la escolaridad o los precios. Saber elegir la medida correcta evita conclusiones engañosas.";

export const FUENTE =
  "MCCEMS 2025 — Pensamiento Matemático VI «Pensamiento estadístico y probabilístico», propósitos formativos sobre medidas de tendencia central (media, mediana, moda), dispersión (rango, varianza, desviación estándar) y representaciones gráficas (tablas de frecuencia e histogramas).";

// ── Reto evaluable — VERBATIM de PM-VI-P03-A2 ───────────────────────────────
// (ejercicio_matematico, tipo_respuesta "numerica", respuesta_final 8500,
//  tolerancia_error 0). Aritmética verificada:
//   Σ = 6500+7200+7800+8000+8500+9000+10000+12000+45000 = 114 000.
//   media = 114000/9 = 12 666.67 ; n=9 impar ⇒ mediana = 5.º dato = 8 500.
import type { RetoNumericoData } from "./_reto-numerico";
export type { RetoNumericoData };

export const RETO_TENDENCIA: RetoNumericoData = {
  titulo: "Salarios: media vs mediana, ¿cuál representa mejor?",
  contexto:
    "Es el ejercicio de la progresión: nueve salarios con un valor atípico (el director). En el laboratorio carga el conjunto «Salarios de 9 empleados» y, en el modo «Tendencia central», observa cómo la MEDIA (el fulcro) se inclina hacia el 45 000 mientras la MEDIANA (el corte central) se queda junto al grueso de los sueldos.",
  problema:
    "Los salarios mensuales (en pesos) de 9 empleados de una empresa son: 6 500, 7 200, 7 800, 8 000, 8 500, 9 000, 10 000, 12 000 y 45 000. Calcula la media aritmética y la mediana. Luego determina cuál de las dos medidas representa mejor el salario típico de estos 9 empleados.",
  campos: [
    { etiqueta: "Media aritmética (Σ ÷ n)", objetivo: 12666.67, tolerancia: 1, unidad: "pesos", placeholder: "12666.67" },
    { etiqueta: "Mediana (5.º dato ordenado)", objetivo: 8500, tolerancia: 0, unidad: "pesos", placeholder: "8500" },
  ],
  pasosGuia: [
    "Suma todos los salarios: 6500 + 7200 + 7800 + 8000 + 8500 + 9000 + 10000 + 12000 + 45000 = 114 000 pesos.",
    "Calcula la media: 114 000 / 9 = 12 666.67 pesos.",
    "Para la mediana: los datos ya están ordenados. n = 9 (impar), la mediana es el dato en la posición (9 + 1)/2 = 5.",
    "El 5.º dato en orden ascendente es 8 500 pesos.",
    "Comparación: media = 12 666.67 vs mediana = 8 500. El salario del director (45 000) jala la media hacia arriba: 8 de 9 empleados ganan menos que la media. La MEDIANA representa mejor al empleado típico.",
  ],
  respuestaFinal:
    "Media = 12 666.67 pesos y mediana = 8 500 pesos. Como el sueldo de 45 000 es un valor atípico que infla la media, la MEDIANA (8 500) representa mejor el salario típico.",
};

// ── Reto evaluable — VERBATIM de PM-VI-P04-A2 (dispersión) ───────────────────
// (numerica, respuesta_final 10, tolerancia 0.1). Grupo A: 60,70,75,80,90.
//   media = 75 ; Σ(x−x̄)² = 225+25+0+25+225 = 500 ; σ² = 500/5 = 100 ; σ = 10.
export const RETO_DISPERSION: RetoNumericoData = {
  titulo: "Dos grupos, misma media: ¿cuál está más disperso?",
  contexto:
    "Es el ejercicio de la progresión de DISPERSIÓN. El Grupo A y el Grupo B tienen la misma media (x̄ = 75), pero sus datos se reparten muy distinto. Carga el conjunto «Grupo A — 5 calificaciones» en el modo «Dispersión» y observa cómo la banda media ± σ se abre: esa anchura es justo lo que vas a calcular.",
  problema:
    "Dos grupos de 5 estudiantes tienen la siguiente media de calificaciones: Grupo A: 60, 70, 75, 80, 90 y Grupo B: 73, 74, 75, 76, 77. Ambos grupos tienen la misma media (x̄ = 75). Calcula la varianza y la desviación estándar del Grupo A para determinar qué tan dispersas están sus calificaciones.",
  campos: [
    { etiqueta: "Varianza poblacional σ² (Σ(x−x̄)² ÷ n)", objetivo: 100, tolerancia: 0.5, unidad: "puntos²", placeholder: "100" },
    { etiqueta: "Desviación estándar σ (√σ²)", objetivo: 10, tolerancia: 0.1, unidad: "puntos", placeholder: "10" },
  ],
  pasosGuia: [
    "Calcula las desviaciones de cada dato respecto a la media: (60−75) = −15; (70−75) = −5; (75−75) = 0; (80−75) = 5; (90−75) = 15.",
    "Eleva al cuadrado cada desviación: (−15)² = 225; (−5)² = 25; 0² = 0; 5² = 25; 15² = 225.",
    "Suma los cuadrados de las desviaciones: 225 + 25 + 0 + 25 + 225 = 500.",
    "Calcula la varianza poblacional: σ² = 500 / 5 = 100 (usando n, pues consideramos a los 5 como la población de interés).",
    "Calcula la desviación estándar: σ = √100 = 10 puntos. Para comparar: el Grupo B tendría σ ≈ 1.41 puntos, mucho menos disperso.",
  ],
  respuestaFinal:
    "Varianza σ² = 100 puntos² y desviación estándar σ = 10 puntos. El Grupo A (σ = 10) está mucho más disperso que el Grupo B (σ ≈ 1.41), aunque ambos compartan la misma media de 75.",
};

// ── Reto evaluable — VERBATIM de PM-VI-P02-A2 (histograma / ojiva) ───────────
// (numerica, respuesta_final 100, tolerancia 0). 20 calificaciones en 5 clases
//   de amplitud 10; frecuencias 1,2,6,5,6 (Σ=20); la ojiva acumula 100 %.
export const RETO_GRAFICAS: RetoNumericoData = {
  titulo: "Tabla de frecuencias y ojiva: ¿dónde termina la curva acumulada?",
  contexto:
    "Es el ejercicio de la progresión de HISTOGRAMAS. Carga el conjunto «Examen de 20 alumnos» en el modo «Histograma» y observa los 5 intervalos de clase. La frecuencia relativa acumulada (ojiva) suma intervalo por intervalo hasta cubrir todos los datos.",
  problema:
    "Las calificaciones de 20 alumnos en un examen de matemáticas son: 55, 60, 65, 65, 70, 70, 70, 75, 75, 75, 75, 80, 80, 80, 85, 85, 90, 90, 95, 100. Organiza los datos en 5 intervalos de clase de amplitud 10 (50–59, 60–69, 70–79, 80–89, 90–100) y calcula la frecuencia relativa acumulada (ojiva) para el último intervalo (90–100), expresada como porcentaje del total.",
  campos: [
    { etiqueta: "Frecuencia relativa acumulada del último intervalo", objetivo: 100, tolerancia: 0, unidad: "%", placeholder: "100" },
  ],
  pasosGuia: [
    "Suma las frecuencias absolutas para verificar n = 20: 1 + 2 + 6 + 5 + 6 = 20. Correcto.",
    "Calcula frecuencias relativas (fᵢ/n): [50,60) = 1/20 = 5 %; [60,70) = 2/20 = 10 %; [70,80) = 6/20 = 30 %; [80,90) = 5/20 = 25 %; [90,100] = 6/20 = 30 %.",
    "Calcula frecuencias absolutas acumuladas: [50,60) = 1; [60,70) = 3; [70,80) = 9; [80,90) = 14; [90,100] = 20.",
    "Frecuencia relativa acumulada del último intervalo: 20/20 = 1.00 = 100 %.",
    "La ojiva termina siempre en 100 % por definición: el último intervalo acumula la totalidad de los datos.",
  ],
  respuestaFinal:
    "La frecuencia relativa acumulada del último intervalo (90–100) es 100 %. La ojiva siempre termina en 100 % porque el último intervalo acumula todos los datos.",
};
