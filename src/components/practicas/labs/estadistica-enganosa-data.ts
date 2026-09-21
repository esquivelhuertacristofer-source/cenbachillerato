/**
 * Datos y matemática del laboratorio "Estadísticas que engañan"
 * (PM-VI-P08, progresión 8 de Pensamiento Matemático VI).
 *
 * Anclas:
 *   - A1 infografía «Las 5 formas más comunes en que los medios distorsionan
 *     las estadísticas»: marco teórico (puntos clave verbatim), contexto,
 *     preguntas de reflexión y los casos numéricos del laboratorio.
 *   - A2 quiz verdadero/falso: reto evaluable (7 reactivos verbatim).
 *   - A4 quiz verdadero/falso: hechos. A5 glosario: 6 términos.
 *
 * Datos puros (sin three ni React): seguro de importar desde el shell y
 * desde scripts de verificación.
 */

import type { QuizEvaluable } from "./_reto-quiz";

/* ── Modos y vistas ───────────────────────────────────────────────────── */

export type Modo = "graficas" | "cambios" | "tipico";
export const MODOS: Modo[] = ["graficas", "cambios", "tipico"];

export type Vista = "truncado" | "volumen" | "log" | "puntos" | "riesgo" | "bases" | "mediana" | "margen";

export interface ModoDef {
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
  vistas: Vista[];
}

export const MODOS_DEF: Record<Modo, ModoDef> = {
  graficas: {
    etq: "Gráficas que engañan",
    subtitulo: "Eje truncado, volúmenes y escala logarítmica",
    icono: "fa-chart-column",
    color: "#fb7185",
    vistas: ["truncado", "volumen", "log"],
  },
  cambios: {
    etq: "¿Cuánto cambió?",
    subtitulo: "Puntos, porcentajes, riesgos y bases",
    icono: "fa-percent",
    color: "#38bdf8",
    vistas: ["puntos", "riesgo", "bases"],
  },
  tipico: {
    etq: "¿Qué tan típico?",
    subtitulo: "Media contra mediana y margen de error",
    icono: "fa-scale-balanced",
    color: "#a3e635",
    vistas: ["mediana", "margen"],
  },
};

export const VISTAS_DEF: Record<Vista, { etq: string; icono: string }> = {
  truncado: { etq: "Eje truncado", icono: "fa-scissors" },
  volumen: { etq: "Íconos en 3D", icono: "fa-cube" },
  log: { etq: "Escala logarítmica", icono: "fa-chart-line" },
  puntos: { etq: "Puntos o %", icono: "fa-percent" },
  riesgo: { etq: "Riesgo relativo", icono: "fa-heart-pulse" },
  bases: { etq: "Bases distintas", icono: "fa-coins" },
  mediana: { etq: "Media o mediana", icono: "fa-scale-balanced" },
  margen: { etq: "Margen de error", icono: "fa-arrows-left-right" },
};

/* ── Formato ──────────────────────────────────────────────────────────── */

/** Número con separador de miles (espacio fino no separable) y decimales fijos. */
export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

/** Con signo explícito: +2.0 o −7.0. */
export function conSigno(x: number, dec = 1): string {
  return `${x >= 0 ? "+" : "−"}${num(Math.abs(x), dec)}`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. GRÁFICAS QUE ENGAÑAN
 * ════════════════════════════════════════════════════════════════════════ */

export interface CasoBarras {
  id: string;
  etq: string;
  fuente: string;
  unidad: string;
  /** Prefijo del valor (p. ej. "$"). */
  prefijo?: string;
  dec: number;
  a: { etq: string; v: number };
  b: { etq: string; v: number };
  /** Donde arranca el eje en la versión engañosa. */
  ejeTruncado: number;
  titular: string;
}

export const CASOS_BARRAS: CasoBarras[] = [
  {
    id: "pib",
    etq: "PIB per cápita",
    fuente: "Infografía A1",
    unidad: "USD",
    prefijo: "$",
    dec: 0,
    a: { etq: "Año inicial", v: 9800 },
    b: { etq: "5 años después", v: 10200 },
    ejeTruncado: 9700,
    titular: "«¡El PIB per cápita se disparó!»",
  },
  {
    id: "desempleo",
    etq: "Tasa de desempleo",
    fuente: "Quiz A2",
    unidad: "%",
    dec: 1,
    a: { etq: "Antes", v: 3.8 },
    b: { etq: "Después", v: 4.1 },
    ejeTruncado: 3.5,
    titular: "«El desempleo casi se duplica»",
  },
  {
    id: "caida",
    etq: "Indicador de 0 a 100",
    fuente: "Glosario A5",
    unidad: "puntos",
    dec: 0,
    a: { etq: "Antes", v: 98 },
    b: { etq: "Después", v: 95 },
    ejeTruncado: 90,
    titular: "«Caída catastrófica»",
  },
];

/** Alturas visuales (0–1) de las dos barras con el eje arrancando en `min`: la más alta mide 1. */
export function alturasBarras(c: CasoBarras, min: number): [number, number] {
  const top = Math.max(c.a.v, c.b.v);
  const den = top - min;
  return [(c.a.v - min) / den, (c.b.v - min) / den];
}

export interface LecturaBarras {
  cambioReal: number;
  /** Cuántas veces más alta (o baja) se ve la barra B que la A. */
  razonVisual: number;
  /** Cambio que sugiere la altura, en %. */
  cambioAparente: number;
  exageracion: number;
}

export function leerBarras(c: CasoBarras, min: number): LecturaBarras {
  const [ha, hb] = alturasBarras(c, min);
  const cambioReal = ((c.b.v - c.a.v) / c.a.v) * 100;
  const razonVisual = hb / ha;
  const cambioAparente = (razonVisual - 1) * 100;
  return { cambioReal, razonVisual, cambioAparente, exageracion: Math.abs(cambioAparente) / Math.abs(cambioReal) };
}

/** Límite superior del deslizador del eje: deja al menos un 8 % del rango visible en la barra menor. */
export function ejeMaximo(c: CasoBarras): number {
  const lo = Math.min(c.a.v, c.b.v);
  const hi = Math.max(c.a.v, c.b.v);
  return lo - (hi - lo) * 0.08;
}

/* ── Íconos escalados en 3D ───────────────────────────────────────────── */

export interface CasoVolumen {
  id: string;
  etq: string;
  fuente: string;
  a: { etq: string; v: number };
  b: { etq: string; v: number };
  unidad: string;
  icono: "bolsa" | "casa" | "frasco";
}

export const CASOS_VOLUMEN: CasoVolumen[] = [
  { id: "ventas", etq: "Ventas que «crecieron 300 %»", fuente: "Glosario A5", a: { etq: "Año anterior", v: 10 }, b: { etq: "Este año", v: 40 }, unidad: "pesos", icono: "bolsa" },
  { id: "riesgo", etq: "Riesgo que «se duplicó»", fuente: "Quiz A2", a: { etq: "Antes", v: 1 }, b: { etq: "Después", v: 2 }, unidad: "casos por millón", icono: "frasco" },
  { id: "pib", etq: "PIB per cápita", fuente: "Infografía A1", a: { etq: "Año inicial", v: 9800 }, b: { etq: "5 años después", v: 10200 }, unidad: "USD", icono: "casa" },
];

export type Escalado = "alto" | "tres";

/** Cuántas veces "más grande" se percibe el ícono B: por su alto (honesto) o por su volumen (lado³). */
export function razonIcono(c: CasoVolumen, escalado: Escalado) {
  const r = c.b.v / c.a.v;
  return { razonDato: r, lado: escalado === "tres" ? r : 1, razonVisible: escalado === "tres" ? r ** 3 : r };
}

/* ── Escala logarítmica ───────────────────────────────────────────────── */

export const DIAS = 60;
/** Dos curvas ilustrativas de contagios: se duplican cada 4 y cada 8 días. */
export const CURVAS = [
  { id: "rapido", etq: "País A: se duplica cada 4 días", duplica: 4, inicio: 10, color: "#fb7185" },
  { id: "lento", etq: "País B: se duplica cada 8 días", duplica: 8, inicio: 10, color: "#fbbf24" },
] as const;

export function casos(curva: (typeof CURVAS)[number], dia: number): number {
  return curva.inicio * 2 ** (dia / curva.duplica);
}

export const CASOS_MAX = casos(CURVAS[0], DIAS);
/** Potencias de 10 que caben en el eje logarítmico. */
export const DECADAS = Math.ceil(Math.log10(CASOS_MAX));

/** Tope del eje lineal y sus marcas. */
export const LIN_MAX = 350_000;
export const MARCAS_LIN = [0, 50_000, 100_000, 150_000, 200_000, 250_000, 300_000, 350_000];
export const MARCAS_LOG = Array.from({ length: DECADAS + 1 }, (_, i) => 10 ** i);

/** Altura normalizada (0–1) de un valor en la escala lineal (0 a LIN_MAX) o logarítmica (1 a 10^DECADAS). */
export function alturaEscala(v: number, log: boolean): number {
  if (log) return Math.max(0, Math.log10(Math.max(1, v))) / DECADAS;
  return v / LIN_MAX;
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. ¿CUÁNTO CAMBIÓ?
 * ════════════════════════════════════════════════════════════════════════ */

export interface CasoPuntos {
  id: string;
  etq: string;
  fuente: string;
  a: number;
  b: number;
  /** Unidad de la tasa y nombre de la diferencia. */
  unidad: string;
  diferencia: string;
  escalaMax: number;
  titular: string;
}

export const CASOS_PUNTOS: CasoPuntos[] = [
  { id: "desocupacion", etq: "Desempleo de 3 % a 5 %", fuente: "Infografía A1", a: 3, b: 5, unidad: "%", diferencia: "puntos porcentuales", escalaMax: 6, titular: "«El desempleo se disparó 66.7 %»" },
  { id: "interes", etq: "Tasa de interés de 8 % a 10 %", fuente: "Glosario de la infografía A1", a: 8, b: 10, unidad: "%", diferencia: "puntos porcentuales", escalaMax: 12, titular: "«La tasa de interés subió 25 %»" },
  { id: "homicidios", etq: "Homicidios de 28 a 21", fuente: "Actividad de la infografía A1", a: 28, b: 21, unidad: "por 100 000 hab.", diferencia: "homicidios por cada 100 000 habitantes", escalaMax: 32, titular: "«La tasa de homicidios bajó un 25 %»" },
  { id: "desempleo-a2", etq: "Desempleo de 3.8 % a 4.1 %", fuente: "Quiz A2", a: 3.8, b: 4.1, unidad: "%", diferencia: "puntos porcentuales", escalaMax: 5, titular: "«El desempleo subió casi 8 %»" },
];

export function cambios(a: number, b: number) {
  return { puntos: b - a, porcentaje: ((b - a) / a) * 100 };
}

/* ── Riesgo relativo y absoluto ───────────────────────────────────────── */

export const FIGURAS = 1000;

export interface CasoRiesgo {
  id: string;
  etq: string;
  fuente: string;
  /** Probabilidades antes y después (fracción). */
  antes: number;
  despues: number;
  /** Personas que representa cada figura. */
  porFigura: number;
  titular: string;
}

export const CASOS_RIESGO: CasoRiesgo[] = [
  { id: "tratamiento", etq: "Tratamiento: 0.4 % → 0.2 %", fuente: "Glosario A5", antes: 0.004, despues: 0.002, porFigura: 1, titular: "«Reduce los accidentes cerebrales a la mitad»" },
  { id: "medicamento", etq: "Medicamento: 0.002 % → 0.001 %", fuente: "Quiz A4", antes: 0.00002, despues: 0.00001, porFigura: 100, titular: "«Reduce el riesgo en un 50 %»" },
  { id: "cancer", etq: "Riesgo: 1 → 2 en un millón", fuente: "Quiz A2", antes: 0.000001, despues: 0.000002, porFigura: 1000, titular: "«¡El riesgo de cáncer se duplicó!»" },
];

export function leerRiesgo(c: CasoRiesgo) {
  const personas = FIGURAS * c.porFigura;
  const casosAntes = Math.round(c.antes * personas);
  const casosDespues = Math.round(c.despues * personas);
  return {
    personas,
    casosAntes,
    casosDespues,
    relativo: ((c.despues - c.antes) / c.antes) * 100,
    absolutoPuntos: (c.despues - c.antes) * 100,
    // Cada caso ilumina la figura (el grupo de `porFigura` personas) donde ocurre.
    figurasAntes: casosAntes,
    figurasDespues: casosDespues,
  };
}

function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Qué figuras (de las 1 000) se iluminan antes y después; fijo por caso. */
export function figurasConCaso(c: CasoRiesgo): { antes: number[]; despues: number[] } {
  const r = leerRiesgo(c);
  const rnd = mulberry32(c.id.split("").reduce((h, ch) => h * 31 + ch.charCodeAt(0), 7));
  const elegir = (k: number) => {
    const s = new Set<number>();
    while (s.size < k) s.add(120 + Math.floor(rnd() * (FIGURAS - 240)));
    return [...s];
  };
  return { antes: elegir(r.figurasAntes), despues: elegir(r.figurasDespues) };
}

/** Porcentaje con los decimales justos para que un riesgo diminuto no se vea como 0. */
export function pctFino(fraccion: number): string {
  const p = fraccion * 100;
  if (p === 0) return "0 %";
  const dec = Math.min(6, Math.max(1, Math.ceil(-Math.log10(Math.abs(p))) + 1));
  return `${num(p, dec)} %`;
}

/* ── Bases distintas ──────────────────────────────────────────────────── */

/** Presupuestos de la infografía A1, en millones de pesos. */
export const BASES = {
  salud: { etq: "Salud", base: 100_000, pct: 20, color: "#34d399" },
  seguridad: { etq: "Seguridad", base: 400_000, pct: 3, color: "#60a5fa" },
  /** Millones por bloque del apilado. */
  bloque: 10_000,
};

export const PCT_SEGURIDAD_MAX = 10;
export const PCT_IGUALA = (BASES.salud.base * BASES.salud.pct) / BASES.seguridad.base;

export function aumento(base: number, pct: number) {
  return (base * pct) / 100;
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. ¿QUÉ TAN TÍPICO?
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * 20 hogares ilustrativos (ingreso mensual en pesos). Los 18 primeros son
 * fijos; los dos más ricos se calibran para que el 10 % más rico concentre el
 * 36.5 % del ingreso, como reporta la ENIGH 2022 citada en la infografía A1.
 */
export const HOGARES_BASE = [6000, 7500, 8500, 9500, 10500, 11500, 12500, 13500, 14500, 15500, 16500, 18000, 19500, 21000, 23000, 25500, 28500, 33000];
export const RICO_2 = 70_000;
export const RICO_1 = 99_300;
export const RICO_MIN = 40_000;
export const RICO_MAX = 160_000;
/** Pesos por unidad de altura en la escena. */
export const PESOS_POR_UNIDAD = 30_000;

export function hogares(ricoMayor: number): number[] {
  return [...HOGARES_BASE, RICO_2, ricoMayor];
}

export function media(xs: number[]): number {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

export function mediana(xs: number[]): number {
  const o = [...xs].sort((a, b) => a - b);
  const m = o.length / 2;
  return o.length % 2 ? o[Math.floor(m)]! : (o[m - 1]! + o[m]!) / 2;
}

/** Parte del ingreso total que concentra el 10 % más rico. */
export function parteDecilSuperior(xs: number[]): number {
  const o = [...xs].sort((a, b) => b - a);
  const k = Math.max(1, Math.round(o.length / 10));
  return o.slice(0, k).reduce((s, x) => s + x, 0) / o.reduce((s, x) => s + x, 0);
}

/* ── Margen de error ──────────────────────────────────────────────────── */

export const ENCUESTA = { a: 35, b: 33 };
export const TAMANOS_ENCUESTA = [250, 500, 1000, 2000, 4000, 8000, 10000];

/** Margen de error al 95 % en puntos porcentuales, en el peor caso p = 0.5. */
export function margenPuntos(n: number): number {
  return 1.96 * Math.sqrt(0.25 / n) * 100;
}

export function empateTecnico(n: number): boolean {
  const me = margenPuntos(n);
  return ENCUESTA.a - me <= ENCUESTA.b + me;
}

/** El menor n (sin redondear la fórmula) con el que los intervalos dejan de tocarse. */
export const N_ROMPE_EMPATE = Math.ceil((1.96 * 0.5 * 100) ** 2 / ((ENCUESTA.a - ENCUESTA.b) / 2) ** 2) + 1;

/* ════════════════════════════════════════════════════════════════════════
 * Tarjeta de estrellas: calcula los dos cambios
 * ════════════════════════════════════════════════════════════════════════ */

const TEMAS: { tema: string; bases: number[] }[] = [
  { tema: "La tasa de desocupación", bases: [2, 2.5, 4, 5] },
  { tema: "La inflación anual", bases: [4, 5, 8, 10] },
  { tema: "El porcentaje de hogares con internet", bases: [40, 50, 60] },
  { tema: "La tasa de interés de un crédito", bases: [8, 10, 12.5, 20, 25] },
  { tema: "El porcentaje de estudiantes que reprobó", bases: [5, 8, 10, 12.5, 20] },
  { tema: "La participación electoral", bases: [40, 50, 60] },
];

export interface CasoCambio {
  tema: string;
  a: number;
  b: number;
}

export function casoCambioAleatorio(rnd: () => number = Math.random): CasoCambio {
  const t = TEMAS[Math.floor(rnd() * TEMAS.length)]!;
  // Factores que dan porcentajes de cambio limpios de calcular y porcentajes menores a 100.
  const factores = [0.5, 0.6, 0.75, 0.8, 1.2, 1.25, 1.4, 1.5, 1.6];
  const a = t.bases[Math.floor(rnd() * t.bases.length)]!;
  const b = Math.round(a * factores[Math.floor(rnd() * factores.length)]! * 10) / 10;
  return { tema: t.tema, a, b };
}

export function estrellasPorIntentos(intentos: number): number {
  return Math.max(1, 4 - intentos);
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Las 5 formas en que los medios distorsionan estadísticas: guía de alfabetización estadística para ciudadanos mexicanos";

/** Infografía A1 — los 10 puntos clave, verbatim. */
export const PUNTOS_CLAVE: string[] = [
  "EJE Y TRUNCADO: un gráfico que no comienza en cero puede hacer que diferencias pequeñas parezcan enormes. Si el PIB per cápita de México pasó de $9,800 a $10,200 USD en 5 años (un aumento del 4.1% en términos reales, INEGI 2023), un eje Y que va de $9,700 a $10,300 hace que la barra del último año parezca el doble de alta que la del primero. Regla de verificación: siempre mira el valor mínimo del eje Y. Si no empieza en cero, calcula el porcentaje de cambio real con los números, no con la altura visual de las barras.",
  "PUNTOS PORCENTUALES vs. PORCENTAJE DE CAMBIO: estas son dos medidas matemáticamente distintas. Si la tasa de desempleo sube de 3% a 5%, subió 2 PUNTOS PORCENTUALES (5−3 = 2) pero subió 66.7% EN PORCENTAJE (2/3 = 0.667). Ambas afirmaciones son verdaderas pero generan impresiones radicalmente distintas. El INEGI y la ENOE reportan la tasa de desocupación en puntos porcentuales; los titulares periodísticos frecuentemente convierten a porcentaje de cambio para ampliar el impacto. En 2023, la tasa de desocupación en México fue de 2.8% (ENOE T4-2023 INEGI).",
  "CORRELACIÓN NO ES CAUSALIDAD: dos variables pueden crecer juntas sin que una cause la otra. En México, la producción de aguacate en Michoacán y las exportaciones de servicios de software crecieron simultáneamente entre 2018 y 2023 (ambas con tendencia positiva), pero ninguna causa la otra — ambas responden a factores externos distintos (demanda internacional y auge digital, respectivamente). El coeficiente de correlación r puede ser alto (ej. r = 0.85) sin que exista causalidad. Probar causalidad requiere diseño experimental o métodos econométricos como variables instrumentales.",
  "MUESTRA NO REPRESENTATIVA: las encuestas de intención de voto publicadas antes de las elecciones presidenciales de México 2024 tenían márgenes de error explícitos de ±3 puntos porcentuales con 95% de confianza (para n ≈ 1,000 personas). Varias encuestadoras fallaron en sus predicciones porque sus muestras sobrerrepresentaban zonas urbanas (donde era más fácil hacer entrevistas) y subestimaban el voto rural y de comunidades indígenas. El INE publicó el PREP con resultados reales que mostraron diferencias significativas con varias encuestas previas.",
  "COMPARAR PORCENTAJES DE BASES DISTINTAS: 'el presupuesto de salud aumentó 20% mientras que el de seguridad aumentó solo 3%' puede ser engañoso si las bases son muy diferentes. Si salud tenía $100,000 millones y seguridad $400,000 millones, el 3% de seguridad ($12,000M) es tres veces el 20% de salud ($20,000M). La SHCP publica el Presupuesto de Egresos de la Federación con cifras absolutas en millones de pesos precisamente para que los ciudadanos puedan hacer comparaciones reales, no solo de tasas de cambio.",
  "ESCALA LOGARÍTMICA vs. LINEAL sin etiquetado claro: durante la pandemia de COVID-19 en México (2020–2022), muchos medios publicaban curvas de contagios en escala logarítmica sin indicarlo claramente. En escala log, una línea recta representa crecimiento EXPONENCIAL, no lineal. El CONACYT y la Subsecretaría de Prevención usaban escala log para comparar tasas de crecimiento entre países (donde la escala log es la correcta), pero el público sin contexto lo interpretaba como crecimiento moderado y lineal. México registró 7.6 millones de casos confirmados al cierre de la epidemia (SSA/SINAVE 2023).",
  "CHERRY-PICKING (selección selectiva de período): reportar solo el subperíodo que apoya la narrativa. Si la economía mexicana creció 3 años y decreció 2, un reportaje puede mostrar solo los años de crecimiento. El PIB de México tuvo una caída histórica de −8.4% en 2020 (pandemia) y un rebote de +4.8% en 2021 (INEGI). Un reporte que solo muestra 2021 da una imagen muy diferente de uno que muestra 2019–2023. La SHCP publica series históricas del PIB desde 1993 para proporcionar contexto completo.",
  "MEDIAS vs. MEDIANAS en distribuciones sesgadas: el ingreso PROMEDIO y el ingreso MEDIANO de los hogares mexicanos son muy distintos porque la distribución del ingreso está muy sesgada hacia la derecha. El 10% más rico concentra el 36.5% del ingreso total corriente (ENIGH 2022, INEGI). Esto hace que el ingreso medio sea significativamente mayor que el mediano. Cuando leas 'ingreso promedio de los mexicanos', pregunta: ¿es la media o la mediana? La mediana es más representativa del hogar 'típico'.",
  "Verificadoras mexicanas activas: Animal Político (sección Verificado), El Universal (Verificado MX), Ojo Público y Chequeado.com (con cobertura México) son organizaciones que contrastan afirmaciones estadísticas con fuentes primarias. Según el Duke Reporters' Lab 2023, México cuenta con al menos 8 organizaciones de fact-checking activas. Su metodología estándar: identificar la afirmación → buscar la fuente original → contrastar con datos del INEGI, CONEVAL, Banco de México o Hacienda → evaluar exactitud y contexto.",
  "El INEGI como fuente primaria: el Instituto Nacional de Estadística y Geografía es la autoridad estadística oficial de México, con independencia técnica garantizada por ley desde 2008. Sus microdatos de la ENIGH (hogares), ENOE (empleo), Censo de Población 2020 y Encuesta Intercensal son públicos y descargables en inegi.org.mx. Cualquier cifra económica, de pobreza o demográfica citada en medios debería poder rastrearse a una tabla del INEGI o del CONEVAL. La alfabetización estadística ciudadana incluye saber buscar en estas fuentes primarias.",
];

/** Contexto mexicano de la infografía A1 — verbatim (dos párrafos). */
export const CONTEXTO_A1: string[] = [
  "México vive un momento de saturación informativa donde las redes sociales, portales de noticias y programas de análisis producen decenas de gráficas estadísticas al día. La capacidad de leer estas gráficas críticamente —identificar un eje truncado, distinguir puntos porcentuales de porcentajes de cambio, entender el margen de error de una encuesta— es una habilidad cívica tan importante como saber leer un contrato. Las elecciones presidenciales de 2024, las discusiones sobre pobreza (con datos del CONEVAL) y el debate sobre seguridad pública son ejemplos donde la ciudadanía necesita evaluar estadísticas con ojo crítico.",
  "El ecosistema de verificación de datos en México ha crecido significativamente: organizaciones como Animal Político, Ojo Público y El Universal Verificado contrastan diariamente las afirmaciones de funcionarios y medios con datos del INEGI, CONEVAL, Banco de México y otras fuentes primarias. Estas organizaciones no son de tendencia política — aplican el mismo rigor independientemente de quién haga la afirmación. El estudiante que termina bachillerato con alfabetización estadística no solo puede verificar afirmaciones; también puede participar en el debate público con mayor calidad, exigir datos con contexto completo y rechazar la manipulación estadística, cualquiera que sea su origen ideológico.",
];

/** Preguntas de reflexión de la infografía A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "Busca una gráfica estadística publicada esta semana en un periódico o red social mexicana. ¿Puedes identificar alguno de los 5 errores de la infografía? ¿El eje Y comienza en cero? ¿Se indica si es escala log o lineal? ¿Se reporta el margen de error?",
  "El INEGI tiene independencia técnica garantizada por ley desde 2008. ¿Por qué es importante que la institución que genera las estadísticas nacionales sea independiente del gobierno en turno? ¿Qué pasaría si las cifras del PIB o de pobreza las publicara directamente la Presidencia?",
  "En las elecciones presidenciales de México 2024, varias encuestadoras fallaron en sus predicciones. ¿Cuál es la responsabilidad ética de una encuestadora que publica resultados con sesgo muestral sin advertirlo? ¿Cómo afecta la publicación de encuestas erróneas al comportamiento de los votantes (efecto bandwagon)?",
  "La correlación entre la producción de aguacate en Michoacán y las exportaciones de software en México no implica causalidad. Pero ¿cómo distinguirías estadísticamente una correlación espuria de una relación causal real? ¿Qué tipo de estudio (observacional, experimental, cuasiexperimental) sería necesario?",
];

/** Actividad posterior de la infografía A1 — verbatim. */
export const ACTIVIDAD_A1 =
  "Analiza el siguiente caso: un periódico publica 'La tasa de homicidios en México bajó un 25%' entre 2022 y 2023. (a) ¿Qué información necesitas para evaluar si esta afirmación es precisa? (b) Si la tasa pasó de 28 a 21 homicidios por 100,000 habitantes, ¿cuántos puntos porcentuales bajó? ¿Cuánto bajó en porcentaje? (c) ¿Qué fuente primaria mexicana consultarías para verificar esta cifra? (d) ¿Por qué reportar solo un año de cambio podría ser cherry-picking? ¿Qué período de comparación sería más justo?";

/** Hechos del quiz verdadero/falso A4 — verbatim (los enunciados falsos van con su corrección). */
export const HECHOS: string[] = [
  "Una gráfica de barras con el eje y truncado (que no comienza en 0) puede exagerar visualmente las diferencias entre grupos, generando una impresión distorsionada de los datos.",
  "El 50% puede ser engañoso sin el riesgo absoluto. Si el riesgo basal era de 0.002% (2 en 100000), reducirlo al 0.001% es un 50% de reducción relativa, pero el beneficio absoluto es ínfimo. Siempre se necesita el contexto.",
  "La correlación entre dos variables (por ejemplo, consumo de helado y muertes por ahogamiento) no implica necesariamente que una cause a la otra; puede existir una variable confusora (el calor del verano).",
  "El tamaño de la muestra importa, pero la representatividad es fundamental. Una muestra de 10000 auto-seleccionados (sesgada) puede ser menos confiable que 500 elegidos con muestreo aleatorio estratificado correctamente.",
  "Cuando una noticia informa que 'el 80% de los expertos apoya X', es importante preguntar cuántos expertos fueron consultados y cómo fueron seleccionados antes de aceptar la afirmación.",
];

export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}

/** Glosario A5 — los 6 términos verbatim. */
export const GLOSARIO: GlosarioItem[] = [
  {
    termino: "Correlación vs. causalidad",
    definicion: "Dos variables están correlacionadas si tienden a cambiar juntas, pero eso no implica que una cause a la otra. Puede haber una variable confusora (tercera variable) que explique la relación.",
    ejemplo: "Ciudades con más hospitales tienen más muertes → correlación positiva, pero causarla es absurdo. Los hospitales se ubican donde hay más población y enfermos.",
  },
  {
    termino: "Riesgo relativo vs. riesgo absoluto",
    definicion: "El riesgo relativo (RR) es el cociente entre la probabilidad de un evento en dos grupos. El riesgo absoluto es la diferencia en probabilidades. Un RR grande puede corresponder a un beneficio absoluto pequeño si el riesgo basal es muy bajo.",
    ejemplo: "Tratamiento reduce accidentes cerebrales de 0.4% a 0.2%: RR=50% de reducción (impresionante) pero reducción absoluta = 0.2% (solo 2 de cada 1000 personas más se benefician).",
  },
  {
    termino: "Manipulación gráfica",
    definicion: "Técnicas que distorsionan la percepción visual de los datos: eje truncado (no inicia en 0), escala no uniforme, gráficas 3D que exageran volúmenes, selección parcial del período mostrado.",
    ejemplo: "Gráfica de barras con eje y entre 90 y 100: una caída de 98 a 95 parece catastrófica. Con eje desde 0, la diferencia de 3 puntos es casi imperceptible.",
  },
  {
    termino: "Tamaño y representatividad de la muestra",
    definicion: "Una muestra debe ser suficientemente grande Y representativa de la población para que las conclusiones sean válidas. Una muestra grande pero sesgada es menos útil que una pequeña y bien seleccionada.",
    ejemplo: "Encuesta de satisfacción en redes sociales: 50 000 respuestas, pero solo participaron usuarios activos jóvenes. Resultado: no representa a la población adulta mayor.",
  },
  {
    termino: "Afirmaciones sin contexto y cherry-picking",
    definicion: "Reportar solo los datos que apoyan una conclusión (cherry-picking) y omitir los contradictorios es una forma de manipulación estadística. Todo resultado debe presentarse con su contexto completo.",
    ejemplo: "Empresa anuncia: 'este año nuestras ventas crecieron 300%'. Contexto omitido: el año anterior vendieron solo 10 pesos; este año vendieron 40. El crecimiento es real pero el contexto cambia la percepción.",
  },
  {
    termino: "Preguntas para evaluar una estadística",
    definicion: "Al ver un dato estadístico, pregunta: ¿Quién lo publicó y tiene intereses? ¿Cuál fue el método de muestreo? ¿El tamaño muestral es adecuado? ¿Los ejes de la gráfica comienzan en 0? ¿Se muestra el margen de error? ¿Es riesgo relativo o absoluto?",
    ejemplo: "Titular: 'Producto X aumenta la energía en un 200%'. Preguntas: ¿Comparado con qué? ¿Cuántos participantes en el estudio? ¿Quién financió la investigación? ¿Fue revisada por pares?",
  },
];

export const FUENTE =
  "Infografía A1: INEGI — ENIGH 2022 y ENOE T4-2023: microdatos de ingresos y empleo; CONEVAL — Medición de pobreza multidimensional 2022; INE — Resultados PREP elecciones presidenciales 2024.";

export const PROBLEMA =
  "Un gráfico que no comienza en cero puede hacer que diferencias pequeñas parezcan enormes. Ambas afirmaciones son verdaderas pero generan impresiones radicalmente distintas.";

export const INSTRUCCIONES: string[] = [
  "En «Gráficas que engañan», mueve el inicio del eje de las barras: compara la altura visual con el cambio real calculado con los números.",
  "En «Íconos en 3D», escala el ícono solo a lo alto y luego en sus tres dimensiones: el dato no cambia, el volumen sí.",
  "En «Escala logarítmica», alterna lineal y logarítmica: la curva exponencial se vuelve recta.",
  "En «¿Cuánto cambió?», compara los puntos porcentuales con el porcentaje de cambio de cada titular.",
  "En «Riesgo relativo», cuenta las figuras: un riesgo que se duplica puede seguir siendo diminuto.",
  "En «Bases distintas», sube el aumento de seguridad hasta igualar en pesos el aumento de salud.",
  "En «¿Qué tan típico?», mueve el ingreso del hogar más rico: la media se va con él y la mediana no.",
  "En «Margen de error», aumenta el tamaño de la encuesta hasta que el empate técnico se rompa.",
  "Gana estrellas calculando los dos cambios de un titular y cierra con el quiz evaluable A2.",
];

export const IDEAS: string[] = [
  "Antes de mirar la altura de una barra, mira dónde empieza el eje.",
  "Un ícono que crece en tres dimensiones exagera: si su lado se duplica, su volumen se multiplica por ocho.",
  "En escala logarítmica cada marca vale diez veces la anterior; una recta significa crecimiento exponencial.",
  "Puntos porcentuales (b − a) y porcentaje de cambio ((b − a)/a) miden cosas distintas; un buen titular dice cuál usa.",
  "El riesgo relativo sin el absoluto no permite saber si un cambio importa.",
  "Un porcentaje grande de una base chica puede ser menos dinero que un porcentaje chico de una base grande.",
  "Con ingresos sesgados, la media se aleja del hogar típico; la mediana lo representa mejor.",
  "Si los intervalos de dos candidatos se tocan, la encuesta no permite decir quién va adelante.",
];

/** Nota del laboratorio sobre el ejemplo de bases distintas de la infografía A1. */
export const NOTA_BASES =
  "Con las cifras de la infografía, el 3 % de seguridad son $12,000 millones y el 20 % de salud son $20,000 millones: el aumento de seguridad es menor, no «tres veces» mayor. La lección se mantiene: una tasa más alta no dice cuál aumento es mayor en pesos; hay que comparar las cifras absolutas.";

/* ── Reto evaluable: quiz verdadero/falso A2, verbatim ────────────────── */

const VF = ["Verdadero", "Falso"];

export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Verdadero o falso? Lectura crítica de estadísticas en medios y contextos sociales",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Un grafico de barras que empieza el eje vertical (eje Y) en 3.5% en lugar de 0% es metodologicamente valido porque muestra mejor las diferencias entre las barras.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion:
        "Falso. Truncar el eje Y es una forma comun de distorsion visual: hace que diferencias pequenas parezcan enormes. Si la tasa de desempleo pasa de 3.8% a 4.1%, un grafico con eje desde 3.5% hace que la barra parezca casi doblar su altura cuando el cambio real es de solo 0.3 puntos porcentuales. Los graficos que comparan magnitudes deben comenzar el eje Y en cero para dar una perspectiva visual honesta del cambio.",
    },
    {
      enunciado: "Si una noticia dice que 'el riesgo de cancer se duplico', esto siempre significa un aumento grave que deberia preocupar significativamente a la poblacion.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion:
        "Falso. Duplicar un riesgo pequeno sigue siendo un riesgo pequeno en terminos absolutos. Si la probabilidad base era de 1 en un millon (0.0001%) y se duplica a 2 en un millon (0.0002%), el riesgo se duplico pero el aumento absoluto es minimo. Los medios frecuentemente reportan el riesgo relativo (que suena dramatico) sin mencionar el riesgo absoluto (que da perspectiva). Para evaluar correctamente el riesgo, es necesario conocer ambas cifras.",
    },
    {
      enunciado: "Si en verano aumentan tanto el consumo de helado como el numero de ahogamientos en playas, podemos concluir que comer helado causa ahogamientos.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion:
        "Falso. Esta es la confusion clasica entre correlacion y causalidad. El calor del verano es la variable confusora que causa ambos fenomenos independientemente: hace calor, la gente compra mas helado Y tambien va mas a la playa (aumentando los accidentes). Correlacion estadistica no implica causalidad. Para establecer causalidad se requieren disenos experimentales controlados, como ensayos clinicos aleatorizados, no simplemente observar que dos variables se mueven juntas.",
    },
    {
      enunciado: "Una encuesta electoral que da al candidato A 35% y al candidato B 33% con un margen de error de +/- 3 puntos porcentuales muestra que A va claramente adelante.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion:
        "Falso. Con un margen de error de +/- 3 puntos, el candidato A podria tener entre 32% y 38%, y el candidato B entre 30% y 36%. Los rangos se solapan: estadisticamente es un empate tecnico. Reportar 'A va adelante' sin mencionar el margen de error, o sin señalar que la diferencia no es estadisticamente significativa, es una distorsion que puede influir indebidamente en la percepcion de la competencia electoral.",
    },
    {
      enunciado: "Las gráficas con escala logarítmica son siempre engañosas y no deben usarse en periodismo de datos.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion:
        "Falso. La escala logaritmica es una herramienta valida y a veces la mas adecuada: permite visualizar crecimientos que abarcan varios ordenes de magnitud (como el crecimiento de contagios en una pandemia, donde los primeros dias hay decenas y semanas despues hay millones). El problema no es la escala logaritmica en si, sino no aclarar explicitamente al lector que el eje usa esa escala. La transparencia metodologica es la clave.",
    },
    {
      enunciado: "Cuando una encuesta en línea reporta que '8 de cada 10 mexicanos apoyan una medida', el tamaño grande de respuestas (100,000 personas) garantiza que el resultado es representativo de todos los mexicanos.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion:
        "Falso. El tamaño de la muestra no corrige el sesgo de seleccion. Una encuesta en linea con autoselecion excluye sistematicamente a personas sin acceso a internet o sin redes sociales (adultos mayores, poblacion rural, personas de bajos ingresos) e incluye principalmente a usuarios activos del medio que publica la encuesta (con sesgos politicos o demograficos propios de esa audiencia). Un millon de respuestas sesgadas siguen siendo un millon de respuestas sesgadas.",
    },
    {
      enunciado: "Animal Político y Parámetría son ejemplos de medios y organizaciones en México que han introducido estándares más rigurosos en el uso y verificación de estadísticas.",
      opciones: VF,
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correcto. Animal Politico ha desarrollado periodismo de datos con verificacion de fuentes y Parámetría es una empresa de investigacion por encuestas con metodologia transparente. Ambas organizaciones han contribuido a elevar los estandares del periodismo estadistico en Mexico, reportando margenes de error, metodologias de muestreo y fichas tecnicas de sus encuestas. Son referencias de buenas practicas en el uso de estadisticas en medios mexicanos.",
    },
  ],
};
