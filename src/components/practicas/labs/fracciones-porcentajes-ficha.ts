/**
 * Datos de la Ficha Teórica del laboratorio de Fracciones, decimales y
 * porcentajes (PM-I-P04).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Fracciones, decimales y
 * porcentajes: tres formas de lo mismo» (lectura). La progresión P04 no tiene
 * actividad de glosario; los conceptos centrales se formulan a partir de la
 * lectura A1 (sin inventar datos), y el reto evaluable vive en
 * fracciones-porcentajes-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const FRACCIONES_PORCENTAJES_FICHA: FichaTeoricaData = {
  ancla: "PM-I · P04 · A1 — Fracciones, decimales y porcentajes: tres formas de lo mismo",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Fracciones, decimales y porcentajes son tres formas de expresar la misma idea: una parte de un todo. La fracción 1/4 equivale al decimal 0.25 y al porcentaje 25%. Saber convertir entre estas representaciones es una habilidad fundamental para la vida cotidiana y para las ciencias.",
    "En la cocina usamos fracciones: 3/4 de taza de harina. En economía usamos porcentajes: una inflación del 4.5% mensual. En ciencias usamos decimales: una concentración de 0.05 gramos por litro. Cada representación es más cómoda en cierto contexto, pero la cantidad que representan es la misma.",
    "Las operaciones con fracciones tienen reglas propias. Para sumar o restar fracciones necesitamos denominador común: 1/3 + 1/4 = 4/12 + 3/12 = 7/12. Para multiplicar, multiplicamos numeradores y denominadores: (2/3) × (3/5) = 6/15 = 2/5. Para dividir, multiplicamos por el recíproco: (2/3) ÷ (4/5) = (2/3) × (5/4) = 10/12 = 5/6.",
    "Los porcentajes son especialmente útiles para comparar cantidades relativas: no es lo mismo que un producto cueste $10 más si el original cuesta $20 (un 50% más) a si cuesta $1,000 (solo un 1% más).",
  ],

  objetivos: [
    "Convertir entre fracción, decimal y porcentaje para una misma cantidad.",
    "Identificar y construir fracciones equivalentes cambiando el denominador.",
    "Aplicar operaciones con fracciones (suma, multiplicación y división) usando sus reglas propias.",
    "Calcular porcentajes sucesivos sobre cantidades económicas reales.",
    "Resolver el ejercicio de descuentos en cadena (A2).",
  ],

  materiales: [
    { nombre: "Pastel y barra 3D", detalle: "Visualiza la fracción como parte del todo en dos representaciones simultáneas", icono: "fa-chart-pie" },
    { nombre: "Tres formas en vivo", detalle: "Lee fracción, decimal y porcentaje en tiempo real al modificar n/d", icono: "fa-equals" },
    { nombre: "Fracciones equivalentes", detalle: "Detecta automáticamente cuando dos fracciones distintas valen lo mismo", icono: "fa-left-right" },
    { nombre: "Aplicación económica", detalle: "Calcula descuentos, propinas e impuestos con el porcentaje activo", icono: "fa-percent" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Fracción", definicion: "Forma de expresar una parte de un todo: el numerador indica las partes tomadas y el denominador, en cuántas partes se divide la unidad." },
    { termino: "Decimal", definicion: "Representación numérica de una fracción como número con punto decimal; por ejemplo, 1/4 = 0.25." },
    { termino: "Porcentaje", definicion: "Fracción cuyo denominador es 100; expresa la cantidad relativa respecto al total (1/4 = 25%)." },
    { termino: "Fracción equivalente", definicion: "Fracciones con distinto numerador y denominador que representan la misma cantidad (1/2 = 2/4 = 3/6)." },
    { termino: "Simplificación", definicion: "Dividir numerador y denominador entre su factor común para obtener la expresión más simple de la fracción." },
    { termino: "Denominador común", definicion: "Número múltiplo de ambos denominadores, necesario para sumar o restar fracciones: 1/3 + 1/4 requiere convertir a doceavos." },
  ],

  // La progresión P04 no tiene actividad de glosario; los términos clave
  // viven en "conceptos" (formulados desde la lectura A1).
  glosario: [],

  aplicaciones: [
    "Calcular descuentos sucesivos en compras: primer descuento sobre el precio original y segundo descuento sobre el precio ya reducido.",
    "Interpretar datos estadísticos del INEGI (datos.gob.mx): distribución del ingreso, crecimiento demográfico y tendencias educativas expresadas como porcentajes.",
    "Medir ingredientes en la cocina con fracciones de taza o litro.",
    "Calcular tasas de inflación e interés en economía personal y finanzas.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, PM-I-P04.",
};
