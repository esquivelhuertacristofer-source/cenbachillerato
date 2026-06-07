/**
 * Datos para el laboratorio "Interacciones entre subsistemas terrestres"
 * (CNEYT-III-P05-A2, simulación; UAC CNEYT-III "Ecosistemas, interacciones y
 * energía"). Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell
 * de UI (LabSubsistemas.tsx) y la escena 3D (SubsistemasScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-III P5): la Tierra es un SISTEMA de
 * cuatro subsistemas que interactúan —atmósfera, hidrosfera, litosfera y
 * biosfera—, de modo que un cambio en uno afecta a todos. El alumno modifica
 * las variables de la actividad (CO₂ atmosférico, cobertura vegetal, actividad
 * volcánica y la retroalimentación del permafrost) y observa en vivo cómo
 * responden la temperatura media, el nivel del mar, el pH del océano y el
 * metano —tal como pide la simulación verbatim.
 *
 * ⚠️ MODELO CUALITATIVO. Los coeficientes son APROXIMADOS y de uso didáctico:
 * usan números de referencia conocidos (sensibilidad climática ~3 °C por
 * duplicación de CO₂, IPCC; ~3 cm de nivel del mar por cada 0.1 °C; pH
 * preindustrial 8.2 → ~8.1 hoy) para mostrar la DIRECCIÓN y el ORDEN de las
 * interacciones, NO para predecir valores exactos.
 */

/* ── Controles (rangos verbatim de la actividad) ─────────────────────────── */
export const CO2_MIN = 280, CO2_MAX = 560, CO2_STEP = 10, CO2_DEFAULT = 280; // ppm — 280 = ref. 1850
export const VEG_MIN = 30, VEG_MAX = 100, VEG_STEP = 5, VEG_DEFAULT = 100;   // cobertura vegetal %
export const VOLC_MIN = 0, VOLC_MAX = 10, VOLC_STEP = 1, VOLC_DEFAULT = 0;   // índice de actividad volcánica
export const CO2_REF = 280;     // ppm de referencia (≈ preindustrial / 1850)
export const CO2_HOY = 420;     // ppm actuales (referencia de la actividad)

/* ── Constantes base del sistema (valores de referencia 1850) ───────────── */
export const T_BASE = 13.9;     // °C, temperatura media global preindustrial (aprox.)
export const PH_BASE = 8.2;     // pH oceánico preindustrial
export const CH4_BASE = 700;    // ppb de metano preindustrial (aprox.)
export const ECS = 3.0;         // °C por duplicación de CO₂ (sensibilidad climática, IPCC, aprox.)

/* ── Modelo: cómo responde el sistema ─────────────────────────────────────
 * Todas las funciones son DETERMINISTAS (aptas para React Compiler/useMemo).
 */

/** log base 2 (para la respuesta logarítmica del CO₂). */
const log2 = (x: number): number => Math.log(x) / Math.log(2);

export interface EstadoSistema {
  co2eff: number;     // ppm efectivos (CO₂ + efecto de deforestación + volcán)
  deltaT: number;     // °C respecto a 1850
  temperatura: number;// °C media global
  nivelMar: number;   // cm sobre la referencia 1850
  ph: number;         // pH del océano
  ch4: number;        // ppb de metano
  precip: number;     // índice de precipitación (100 = referencia)
  enfriaVolcan: number;// °C de enfriamiento temporal por aerosoles de SO₂
  permafrostT: number; // °C extra por la retroalimentación del permafrost
  puntoNoRetorno: boolean; // ¿el permafrost se disparó?
}

/**
 * Calcula el estado del sistema a partir de los controles.
 * @param co2  CO₂ atmosférico base (ppm)
 * @param veg  cobertura vegetal (%)
 * @param volc índice de actividad volcánica (0–10)
 * @param permafrost ¿retroalimentación del permafrost activada?
 */
export const calcularEstado = (
  co2: number, veg: number, volc: number, permafrost: boolean,
): EstadoSistema => {
  // 1) La deforestación reduce el sumidero: el CO₂ "efectivo" sube un poco.
  //    A 100% de cobertura no añade nada; a 30% añade hasta ~40 ppm.
  const deforestExtra = (1 - veg / 100) * 60;
  // 2) El volcanismo libera CO₂ (lento, calienta) y SO₂ (aerosoles, enfrían).
  const volcanCO2 = volc * 4;            // ppm de CO₂ volcánico
  const enfriaVolcan = volc * 0.18;      // °C de enfriamiento temporal por SO₂

  const co2eff = co2 + deforestExtra + volcanCO2;

  // 3) Forzamiento del CO₂ (respuesta logarítmica, sensibilidad climática).
  let deltaT = ECS * log2(co2eff / CO2_REF) - enfriaVolcan;

  // 4) Retroalimentación del permafrost: si ya hay calentamiento, el deshielo
  //    libera metano que amplifica el calentamiento (bucle positivo).
  let ch4 = CH4_BASE + (co2eff - CO2_REF) * 4; // el CH4 sube con la industria
  let permafrostT = 0;
  let puntoNoRetorno = false;
  if (permafrost && deltaT > 1.0) {
    const exceso = deltaT - 1.0;
    permafrostT = exceso * 0.6;          // amplificación
    ch4 += exceso * 900;                 // ppb de metano liberado
    deltaT += permafrostT;
    puntoNoRetorno = true;
  }

  const temperatura = T_BASE + deltaT;

  // 5) Nivel del mar: dilatación térmica + deshielo, ~3 cm por cada 0.1 °C.
  const nivelMar = Math.max(0, deltaT) * 30;

  // 6) Acidez del océano: el CO₂ disuelto baja el pH (~0.1 de 280 a 420 ppm).
  const ph = PH_BASE - (co2eff - CO2_REF) * (0.1 / 140);

  // 7) Ciclo del agua: la cobertura vegetal sostiene la evapotranspiración;
  //    menos bosque → menos lluvia tierra adentro.
  const precip = veg - Math.max(0, deltaT) * 4;

  return { co2eff, deltaT, temperatura, nivelMar, ph, ch4, precip, enfriaVolcan, permafrostT, puntoNoRetorno };
};

/* ── Los cuatro subsistemas (datos verbatim de la lectura P05-A1) ────────── */
export interface Subsistema {
  key: "atmosfera" | "hidrosfera" | "litosfera" | "biosfera";
  nombre: string;
  icono: string;   // Font Awesome 6 Free solid
  color: string;
  resumen: string;
  datos: string[]; // viñetas de composición/escala
}

export const SUBSISTEMAS: Subsistema[] = [
  {
    key: "atmosfera", nombre: "Atmósfera", icono: "fa-wind", color: "#7cc4ff",
    resumen: "Capa gaseosa que envuelve la Tierra: protege de la radiación UV (ozono) y regula la temperatura por el efecto invernadero natural.",
    datos: ["78% nitrógeno, 21% oxígeno", "Gases traza: CO₂, argón, vapor de agua", "Sin efecto invernadero: −18 °C en lugar de 15 °C"],
  },
  {
    key: "hidrosfera", nombre: "Hidrosfera", icono: "fa-water", color: "#3aa0ff",
    resumen: "Toda el agua del planeta. Los océanos regulan el clima absorbiendo calor y CO₂; las corrientes reparten energía térmica.",
    datos: ["97% océanos", "~2% glaciares y casquetes polares", "~0.7% subterránea, <0.3% superficial dulce"],
  },
  {
    key: "litosfera", nombre: "Litosfera", icono: "fa-mountain", color: "#c2895a",
    resumen: "Capa sólida exterior: corteza y manto superior, fragmentada en placas tectónicas. El vulcanismo la conecta con los demás subsistemas.",
    datos: ["Placas que se mueven ~2–10 cm/año", "Causa sismos, volcanes y montañas", "El vulcanismo libera CO₂, vapor de agua y SO₂"],
  },
  {
    key: "biosfera", nombre: "Biosfera", icono: "fa-leaf", color: "#34D399",
    resumen: "Todos los organismos vivos. No solo habita el planeta: lo transforma, alterando aire, agua y roca.",
    datos: ["Plantas fijan CO₂ (atmósfera–biosfera)", "Corales construyen arrecifes (hidro–lito–biosfera)", "Raíces desintegran la roca (lito–biosfera)"],
  },
];

/* ── Escenarios guiados (de las instrucciones verbatim de la simulación) ─── */
export interface Escenario {
  label: string;
  icono: string;
  desc: string;
  co2: number; veg: number; volc: number; permafrost: boolean;
}

export const ESCENARIOS: Escenario[] = [
  { label: "Referencia 1850", icono: "fa-flag-checkered", co2: 280, veg: 100, volc: 0, permafrost: false,
    desc: "Estado inicial: CO₂ 280 ppm, bosque intacto, sin vulcanismo extra." },
  { label: "Hoy (~420 ppm)", icono: "fa-industry", co2: 420, veg: 85, volc: 0, permafrost: false,
    desc: "Concentración actual de CO₂ con algo de deforestación." },
  { label: "Deforestación", icono: "fa-tree", co2: 420, veg: 50, volc: 0, permafrost: false,
    desc: "Cobertura vegetal al 50%: cae el sumidero y la lluvia tierra adentro." },
  { label: "Erupción mayor", icono: "fa-volcano", co2: 420, veg: 85, volc: 9, permafrost: false,
    desc: "Mucho SO₂ (enfría un tiempo) y CO₂ volcánico que acidifica el océano." },
  { label: "Permafrost", icono: "fa-temperature-arrow-up", co2: 500, veg: 70, volc: 0, permafrost: true,
    desc: "El deshielo libera metano y amplifica el calentamiento: punto de no retorno." },
  { label: "Restauración", icono: "fa-seedling", co2: 300, veg: 100, volc: 0, permafrost: false,
    desc: "Reforestar y bajar el CO₂: el sistema vuelve cerca de la referencia." },
];

/* ── Interacciones clave (para el panel; tomadas de la lectura) ──────────── */
export const INTERACCIONES: { de: string; a: string; texto: string }[] = [
  { de: "Atmósfera", a: "Hidrosfera", texto: "El océano absorbe calor y CO₂ del aire; al subir la temperatura sube el nivel del mar." },
  { de: "Atmósfera", a: "Hidrosfera", texto: "Más CO₂ disuelto acidifica el océano (baja el pH) y daña a los corales." },
  { de: "Biosfera", a: "Atmósfera", texto: "Los bosques fijan CO₂ y sostienen el ciclo del agua; la deforestación rompe ambos." },
  { de: "Litosfera", a: "Atmósfera", texto: "Los volcanes inyectan SO₂ (enfría a corto plazo) y CO₂ (calienta a largo plazo)." },
  { de: "Litosfera", a: "Atmósfera", texto: "El deshielo del permafrost libera metano: una retroalimentación que amplifica el calentamiento." },
];

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: dec }).replace("-", "−");

export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);
export const fmt0 = (n: number): string => ES(Math.round(n), 0);
/** Delta con signo explícito (+/−). */
export const fmtDelta = (n: number, dec = 1): string => (n >= 0 ? "+" : "") + ES(n, dec);
