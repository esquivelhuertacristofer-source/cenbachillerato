/**
 * Datos puros del reto evaluable del laboratorio de Inecuaciones lineales
 * (PM-III-P09).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Planteo y resuelvo inecuaciones
 * lineales» (ejercicio_matematico, tipo_respuesta "desarrollo",
 * practica_slug=inecuaciones-lineales). El alumno captura el valor límite
 * (frontera) de cada inecuación y, en la doble, los dos extremos del intervalo.
 *
 * Verificación aritmética:
 *   (a) 3x − 5 > 7  →  3x > 12  →  x > 4          → límite = 4
 *   (b) −2x + 4 ≤ 10 →  −2x ≤ 6  →  x ≥ −3 (giro) → límite = −3
 *   (c) 5 ≤ 2x + 1 < 13
 *         izq: 5 − 1 = 4, 4/2 = 2  →  x ≥ 2
 *         der: 13 − 1 = 12, 12/2 = 6  →  x < 6
 *         Intervalo: 2 ≤ x < 6         → extremo izq = 2, extremo der = 6
 *   (d) 30 + 15a ≤ 120  →  15a ≤ 90  →  a ≤ 6      → máx atracciones = 6
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-III-P09-A2 (ejercicio_matematico).
export const RETO_A2: RetoNumericoData = {
  titulo: "Planteo y resuelvo inecuaciones lineales",
  contexto:
    "Las inecuaciones modelan restricciones reales: presupuestos, condiciones mínimas o máximas, rangos de seguridad.",
  problema:
    "Resuelve las siguientes inecuaciones y representa la solución en la recta numérica:\n" +
    "(a) 3x - 5 > 7\n" +
    "(b) -2x + 4 ≤ 10\n" +
    "(c) 5 ≤ 2x + 1 < 13\n" +
    "(d) Problema: Una tienda cobra $30 por entrada más $15 por cada atracción. ¿Cuántas atracciones como máximo puede comprar Luisa si tiene $120?",
  campos: [
    {
      etiqueta: "(a) 3x − 5 > 7 → x > ___ (ingresa la frontera)",
      objetivo: 4,
      tolerancia: 0,
      placeholder: "4",
    },
    {
      etiqueta: "(b) −2x + 4 ≤ 10 → x ≥ ___ (ingresa la frontera)",
      objetivo: -3,
      tolerancia: 0,
      placeholder: "−3",
    },
    {
      etiqueta: "(c) 5 ≤ 2x + 1 < 13 → extremo izquierdo del intervalo",
      objetivo: 2,
      tolerancia: 0,
      placeholder: "2",
    },
    {
      etiqueta: "(c) 5 ≤ 2x + 1 < 13 → extremo derecho del intervalo",
      objetivo: 6,
      tolerancia: 0,
      placeholder: "6",
    },
    {
      etiqueta: "(d) Máximo de atracciones que puede comprar Luisa",
      objetivo: 6,
      tolerancia: 0,
      unidad: "atracciones",
      placeholder: "6",
    },
  ],
  pasosGuia: [
    "(a) Suma 5 a ambos lados, luego divide entre 3. → 3x > 12 → x > 4.",
    "(b) Resta 4 a ambos lados, luego divide entre −2 (recuerda invertir el signo). → −2x ≤ 6 → x ≥ −3.",
    "(c) Resuelve como inecuación doble: opera en las dos desigualdades simultáneamente. → 4 ≤ 2x < 12 → 2 ≤ x < 6.",
    "(d) Plantea: 30 + 15a ≤ 120 y despeja a. → 15a ≤ 90 → a ≤ 6.",
  ],
  respuestaFinal:
    "(a) x > 4; (b) x ≥ −3; (c) 2 ≤ x < 6; (d) a ≤ 6 atracciones.",
};
