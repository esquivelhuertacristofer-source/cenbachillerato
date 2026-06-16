/**
 * Datos para el laboratorio de Concentración de una disolución (CNEYT-I-P04).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabConcentracion.tsx) y la escena 3D (ConcentracionScene.tsx) sin arrastrar
 * three.js al bundle del shell.
 *
 * Idea pedagógica: la CONCENTRACIÓN en % en masa indica cuánto soluto hay en una
 * disolución respecto a su masa total:
 *     % masa = (masa de soluto / masa de la disolución) × 100
 *     masa de la disolución = masa de soluto + masa de disolvente
 * Cada soluto tiene un límite de SOLUBILIDAD: si se agrega más del que el agua
 * puede disolver, el exceso no se disuelve y la disolución está SATURADA.
 */

export interface Soluto {
  key: string;
  nombre: string;
  formula: string;
  icono: string; // Font Awesome 6
  color: string; // color del soluto / tinte de la disolución
  /** Solubilidad aproximada en agua a ~20 °C, en g por 100 g de agua. */
  solubilidad: number;
}

export const SOLUTOS: Soluto[] = [
  { key: "sal", nombre: "Sal de mesa", formula: "NaCl", icono: "fa-cubes-stacked", color: "#EAF2F8", solubilidad: 36 },
  { key: "azucar", nombre: "Azúcar", formula: "C₁₂H₂₂O₁₁", icono: "fa-cube", color: "#F3E2BE", solubilidad: 200 },
  { key: "sulfato", nombre: "Sulfato de cobre", formula: "CuSO₄", icono: "fa-flask", color: "#2E86C1", solubilidad: 32 },
];

/** Masas de disolvente (agua) disponibles, en gramos (≈ mL). */
export const AGUAS = [50, 100, 150, 200] as const;

/** Soluto: gramos que se pueden agregar (paso de 10 g). */
export const SOLUTO_MAX = 120;
export const SOLUTO_PASO = 10;

export interface Disolucion {
  maxDisuelto: number; // cuánto soluto admite el agua
  disuelto: number; // soluto realmente disuelto
  excedente: number; // soluto que no se disolvió
  masaDisolucion: number; // disuelto + agua
  concentracion: number; // % en masa (con lo disuelto)
  saturada: boolean;
}

/** Calcula la disolución a partir del soluto agregado, el agua y la solubilidad. */
export function disolver(masaSoluto: number, masaAgua: number, solubilidad: number): Disolucion {
  const maxDisuelto = solubilidad * (masaAgua / 100);
  const disuelto = Math.min(masaSoluto, maxDisuelto);
  const excedente = Math.max(0, masaSoluto - disuelto);
  const masaDisolucion = disuelto + masaAgua;
  const concentracion = masaDisolucion > 0 ? (disuelto / masaDisolucion) * 100 : 0;
  return { maxDisuelto, disuelto, excedente, masaDisolucion, concentracion, saturada: excedente > 0.0001 };
}

/** Etiqueta cualitativa de la disolución. */
export function nivelDisolucion(soluto: number, d: Disolucion): { texto: string; color: string } {
  if (soluto <= 0) return { texto: "Solo disolvente", color: "#8AB4FF" };
  if (d.saturada) return { texto: "Saturada", color: "#FF8A3C" };
  if (d.concentracion < 10) return { texto: "Diluida", color: "#5BC8FF" };
  if (d.concentracion < 25) return { texto: "Concentrada", color: "#34D399" };
  return { texto: "Muy concentrada", color: "#FFD166" };
}

/**
 * Ejercicio ancla del laboratorio — VERBATIM del A6 de CNEYT-I-P04
 * (ejercicio_matematico «Concentración de una disolución (% en masa)»).
 *
 * Lo usa la tarjeta evaluable RetoDisolucionCard: el alumno arma la disolución
 * (20 g de sal + 80 g de agua) y calcula el % m/m. La respuesta correcta es 20 %.
 */
export const EJERCICIO_A6 = {
  titulo: "Concentración de una disolución (% en masa)",
  contexto: "% en masa = (masa de soluto / masa de disolución) × 100. La masa de la disolución es soluto + disolvente.",
  problema: "Disuelves 20 g de sal en 80 g de agua. ¿Cuál es la concentración de la disolución en porcentaje de masa (% m/m)?",
  unidades: "% m/m",
  pasosGuia: [
    "Masa de disolución = 20 g + 80 g = 100 g.",
    "% m/m = (20 / 100) × 100.",
    "% m/m = 20%.",
  ],
  instrucciones: "Resuelve mostrando el procedimiento.",
  respuestaFinal: "20% en masa",
  toleranciaError: 0.5,
  // Valores objetivo para validar la disolución que arma el alumno.
  solutoObjetivo: 20, // g de sal
  aguaObjetivo: 80, // g de agua
  porcentajeObjetivo: 20, // % m/m
} as const;

