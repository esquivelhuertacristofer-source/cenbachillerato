/**
 * Datos para el laboratorio de Densidad y Flotación (CNEYT-I-P02).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparte el shell de UI
 * (LabDensidad.tsx) para la "interactividad ampliada".
 *
 * El ejercicio reproducido es la actividad ancla evaluada de la progresión,
 * A6 «Cálculo de densidad», VERBATIM del contenido sembrado en la plataforma.
 * El estudiante resuelve aquí mismo el problema y comprueba su procedimiento.
 */

export interface OpcionMetal {
  key: string;
  label: string;
  d: number; // g/cm³
}

export interface EjercicioDensidad {
  /** Enunciado VERBATIM del problema A6. */
  enunciado: string;
  /** Contexto/fórmula VERBATIM del problema A6. */
  contexto: string;
  datos: { masa: number; volumen: number };
  /** Pasos guía VERBATIM del problema A6. */
  pasos: string[];
  respuestaValor: number; // 2.7
  respuestaUnidad: string; // "g/cm³"
  tolerancia: number; // margen aceptado al comprobar
  metalCorrecto: string; // key de la opción correcta
  opcionesMetal: OpcionMetal[];
  /** Respuesta VERBATIM del problema A6. */
  respuestaTexto: string;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Ejercicio A6 «Cálculo de densidad» — VERBATIM de CNEYT-I-P02.
 * (enunciado, contexto, pasos y respuesta tal como están sembrados).
 * ──────────────────────────────────────────────────────────────────────── */
export const EJERCICIO_A6: EjercicioDensidad = {
  enunciado:
    "Un objeto metálico tiene una masa de 270 g y un volumen de 100 cm³. Calcula su densidad. Sabiendo que la densidad del aluminio es 2.7 g/cm³, ¿de qué metal podría tratarse?",
  contexto: "Densidad = masa / volumen (ρ = m/V). La densidad es característica de cada sustancia.",
  datos: { masa: 270, volumen: 100 },
  pasos: [
    "Aplica ρ = m / V.",
    "ρ = 270 g / 100 cm³.",
    "ρ = 2.7 g/cm³, que coincide con la del aluminio.",
  ],
  respuestaValor: 2.7,
  respuestaUnidad: "g/cm³",
  tolerancia: 0.05,
  metalCorrecto: "aluminio",
  opcionesMetal: [
    { key: "aluminio", label: "Aluminio", d: 2.7 },
    { key: "hierro", label: "Hierro", d: 7.87 },
    { key: "plomo", label: "Plomo", d: 11.34 },
    { key: "oro", label: "Oro", d: 19.32 },
  ],
  respuestaTexto: "2.7 g/cm³ (aluminio)",
};
