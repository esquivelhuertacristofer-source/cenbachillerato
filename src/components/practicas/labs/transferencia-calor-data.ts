/**
 * Datos para el laboratorio de Transferencia de calor
 * (CNEYT-II-P04-A1, "Calor, temperatura y mecanismos de transferencia").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabTransferenciaCalor.tsx) y la escena 3D (TransferenciaCalorScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-II, termodinámica):
 * La TEMPERATURA mide el movimiento promedio (energía cinética) de las partículas.
 * El CALOR es energía en tránsito: fluye espontáneamente del cuerpo de mayor
 * temperatura al de menor, hasta llegar al equilibrio térmico (misma temperatura,
 * flujo neto cero). Esa energía se transfiere por tres mecanismos:
 *
 *   · CONDUCCIÓN — por contacto directo, partícula a partícula, sin que la materia
 *     se desplace. Es eficiente en sólidos, sobre todo en metales (buenos
 *     conductores). La madera, la lana o el aire son aislantes.
 *   · CONVECCIÓN — por el movimiento masivo de un fluido. El fluido caliente, menos
 *     denso, asciende; el frío, más denso, desciende, formando corrientes.
 *   · RADIACIÓN — por ondas electromagnéticas (infrarrojo). No necesita medio
 *     material: es el único mecanismo que funciona en el vacío (Sol → Tierra).
 */

/* ── Mecanismos de transferencia ─────────────────────────────────────── */
export type MecanismoKey = "conduccion" | "conveccion" | "radiacion";

export interface Mecanismo {
  key: MecanismoKey;
  nombre: string;
  icono: string; // Font Awesome 6 (solid)
  resumen: string;
  necesitaMedio: string;
  ejemplo: string;
}

export const MECANISMOS: Mecanismo[] = [
  {
    key: "conduccion",
    nombre: "Conducción",
    icono: "fa-grip-lines",
    resumen:
      "El calor viaja partícula a partícula por contacto directo, sin que la materia se desplace. Las partículas calientes vibran más y empujan a sus vecinas.",
    necesitaMedio: "Necesita contacto. Mejor en sólidos, sobre todo metales.",
    ejemplo: "El mango metálico de una sartén se calienta aunque solo toques el fuego en la base.",
  },
  {
    key: "conveccion",
    nombre: "Convección",
    icono: "fa-arrows-up-down",
    resumen:
      "El calor se mueve con el propio fluido. El fluido caliente (menos denso) sube y el frío (más denso) baja, formando corrientes que reparten la energía.",
    necesitaMedio: "Necesita un fluido (líquido o gas) que pueda moverse.",
    ejemplo: "El agua de una olla circula al calentarse; la brisa marina y las corrientes oceánicas.",
  },
  {
    key: "radiacion",
    nombre: "Radiación",
    icono: "fa-tower-broadcast",
    resumen:
      "El calor viaja como ondas electromagnéticas (infrarrojo). No mueve partículas: la energía viaja sola por el espacio.",
    necesitaMedio: "No necesita medio: es el único que funciona en el vacío.",
    ejemplo: "El Sol calienta la Tierra a 150 millones de km a través del vacío del espacio.",
  },
];

export const getMecanismo = (key: MecanismoKey): Mecanismo =>
  MECANISMOS.find((m) => m.key === key) ?? MECANISMOS[0]!;

/* ── Materiales para conducción (conductividad térmica real) ──────────── */
export interface Material {
  key: string;
  nombre: string;
  k: number; // conductividad térmica (W/m·K)
  rate: number; // rapidez relativa para la animación (0–1)
  conductor: boolean;
  icono: string;
}

/**
 * k = conductividad térmica real (W/m·K). `rate` es una rapidez RELATIVA para la
 * simulación: los valores reales abarcan 4 órdenes de magnitud (cobre 401 vs.
 * madera ~0.12), imposibles de mostrar a la vez, así que se comprimen a 0–1
 * conservando el orden (metal rápido, aislante lento).
 */
export const MATERIALES: Material[] = [
  { key: "cobre", nombre: "Cobre", k: 401, rate: 1.0, conductor: true, icono: "fa-bolt" },
  { key: "aluminio", nombre: "Aluminio", k: 237, rate: 0.66, conductor: true, icono: "fa-bolt" },
  { key: "vidrio", nombre: "Vidrio", k: 0.8, rate: 0.18, conductor: false, icono: "fa-shield-halved" },
  { key: "madera", nombre: "Madera", k: 0.12, rate: 0.06, conductor: false, icono: "fa-shield-halved" },
];

export const getMaterial = (key: string): Material =>
  MATERIALES.find((m) => m.key === key) ?? MATERIALES[0]!;

/* ── Temperatura de la fuente (foco caliente) ─────────────────────────── */
export const T_FUENTE_MIN = 50; // °C
export const T_FUENTE_MAX = 500;
export const T_FUENTE_STEP = 10;

/** Temperatura ambiente de referencia (°C). */
export const T_AMBIENTE = 20;

/**
 * Intensidad normalizada (0–1) de la fuente respecto a su rango. Escala la
 * rapidez de las animaciones y el "calor" del color.
 */
export const intensidadFuente = (Tc: number) =>
  Math.max(0, Math.min(1, (Tc - T_FUENTE_MIN) / (T_FUENTE_MAX - T_FUENTE_MIN)));

/* ── Conversión de escalas de temperatura ─────────────────────────────── */
export const celsiusAKelvin = (c: number) => c + 273.15;
export const celsiusAFahrenheit = (c: number) => (c * 9) / 5 + 32;

/** Cero absoluto (°C): no existe temperatura menor. */
export const CERO_ABSOLUTO_C = -273.15;

/** Calor específico del agua (J/g·°C), de referencia. */
export const C_AGUA = 4.18;

/**
 * Calor necesario para cambiar la temperatura de una masa: Q = m·c·ΔT.
 * m en gramos, c en J/g·°C, ΔT en °C → Q en joules.
 */
export const calorQ = (m: number, c: number, dT: number) => m * c * dT;

/** Formatea un número con coma decimal es-MX y "−" tipográfico. */
export const fmtNum = (n: number, dec = 2) => {
  const r = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
  const s = r.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 });
  return s.replace("-", "−");
};
