/**
 * Datos para el laboratorio de Entropía y leyes de la termodinámica
 * (CNEYT-II-P10-A1, "Entropía, entalpía y leyes de la termodinámica").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabEntropia.tsx) y la escena 3D (EntropiaScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-II, termodinámica):
 * La primera ley dice que la energía se conserva, pero no explica por qué los
 * procesos ocurren en un solo sentido. La ENTROPÍA (S) mide el desorden de un
 * sistema —con más precisión, la dispersión de la energía— y la SEGUNDA LEY
 * establece que en todo proceso espontáneo la entropía total del universo
 * aumenta. De ahí salen hechos cotidianos: el calor fluye solo de lo caliente a
 * lo frío, dos gases se mezclan pero nunca se separan solos, y ninguna máquina
 * térmica es 100% eficiente. La TERCERA LEY afirma que la entropía de un cristal
 * perfecto en el cero absoluto (0 K = −273.15 °C) es cero, y que ese cero
 * absoluto es inalcanzable.
 *
 * El lab vuelve VISIBLE la flecha del tiempo: pongas el proceso que pongas, la
 * barra de entropía solo sube (procesos espontáneos), salvo al ordenar un cristal
 * acercándolo al cero absoluto, donde S tiende a cero pero nunca llega.
 */

/* ── Procesos demostrables ────────────────────────────────────────────── */
export type ProcesoKey = "mezcla" | "calor" | "cristal";

export interface Proceso {
  key: ProcesoKey;
  nombre: string;
  ley: string;
  icono: string; // Font Awesome 6 (solid)
  resumen: string;
  /** Etiqueta del botón que dispara el proceso (null si usa el deslizador). */
  accionOn: string | null;
  accionOff: string | null;
}

export const PROCESOS: Proceso[] = [
  {
    key: "mezcla",
    nombre: "Mezcla de gases",
    ley: "2.ª ley",
    icono: "fa-shuffle",
    resumen:
      "Dos gases separados por una pared. Al quitarla se mezclan solos y jamás se vuelven a separar por sí mismos: el desorden (entropía) aumenta y no da marcha atrás.",
    accionOn: "Quitar la pared",
    accionOff: "Volver a separar",
  },
  {
    key: "calor",
    nombre: "Flujo de calor",
    ley: "2.ª ley",
    icono: "fa-temperature-arrow-down",
    resumen:
      "Un cuerpo caliente y uno frío en contacto. El calor fluye espontáneamente del caliente al frío hasta el equilibrio térmico, nunca al revés. La entropía total sube.",
    accionOn: "Poner en contacto",
    accionOff: "Separar de nuevo",
  },
  {
    key: "cristal",
    nombre: "Cristal a 0 K",
    ley: "3.ª ley",
    icono: "fa-snowflake",
    resumen:
      "Al enfriar un cristal perfecto, sus partículas se ordenan y casi dejan de vibrar. En el cero absoluto la entropía sería cero, pero ese punto es inalcanzable: solo puedes acercarte.",
    accionOn: null,
    accionOff: null,
  },
];

export const getProceso = (key: ProcesoKey): Proceso =>
  PROCESOS.find((p) => p.key === key) ?? PROCESOS[0]!;

/* ── Las tres leyes (más la cero) ─────────────────────────────────────── */
export interface Ley {
  nombre: string;
  enunciado: string;
}

export const LEYES: Ley[] = [
  {
    nombre: "Primera ley",
    enunciado: "La energía no se crea ni se destruye, solo se transforma (se conserva).",
  },
  {
    nombre: "Segunda ley",
    enunciado: "En todo proceso espontáneo, la entropía total del universo aumenta.",
  },
  {
    nombre: "Tercera ley",
    enunciado: "La entropía de un cristal perfecto en el cero absoluto es cero (y 0 K es inalcanzable).",
  },
];

/* ── Cristal / cero absoluto (tercera ley) ────────────────────────────── */
export const T_CRISTAL_MIN = 1; // K — nunca exactamente 0 (inalcanzable)
export const T_CRISTAL_MAX = 300; // K
export const T_CRISTAL_STEP = 1;

/** Cero absoluto en °C: no existe temperatura menor. */
export const CERO_ABSOLUTO_C = -273.15;

export const kelvinACelsius = (k: number) => k - 273.15;

/**
 * Entropía relativa (0–1) de un cristal a la temperatura T (K), respecto a su
 * máximo en el rango. Tiende a 0 cuando T → 0 (tercera ley).
 */
export const entropiaCristal = (k: number) =>
  Math.max(0, Math.min(1, (k - 0) / T_CRISTAL_MAX));

/* ── Entalpía (concepto de la lectura) ────────────────────────────────── */
/** Entalpía H = U + PV (J). Útil a presión constante. */
export const entalpia = (U: number, P: number, V: number) => U + P * V;

/** Formatea un número con coma decimal es-MX y "−" tipográfico. */
export const fmtNum = (n: number, dec = 2) => {
  const r = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
  const s = r.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 });
  return s.replace("-", "−");
};
