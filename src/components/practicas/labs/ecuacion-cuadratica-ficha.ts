/**
 * Datos de la Ficha Teórica del laboratorio de Ecuaciones cuadráticas (PM-III-P02).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Ecuaciones cuadráticas: tres
 * métodos para resolverlas» (lectura). El glosario proviene VERBATIM de A5
 * «Glosario — Ecuaciones cuadráticas» (glosario_interactivo). El reto
 * evaluable vive en ecuacion-cuadratica-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const CUADRATICA_FICHA: FichaTeoricaData = {
  ancla: "PM-III · P02 · A1 — Ecuaciones cuadráticas: tres métodos para resolverlas",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Una ecuación cuadrática es una ecuación polinomial de grado dos con la forma general ax² + bx + c = 0, donde a ≠ 0. Estas ecuaciones aparecen en física (movimiento de proyectiles), economía (optimización de ganancias), arquitectura (diseño de arcos) y muchos otros campos.",
    "Existen tres métodos principales para resolver ecuaciones cuadráticas:\n\n1. Factorización. Si la ecuación puede escribirse como un producto de dos binomios, la solución se obtiene igualando cada factor a cero. Por ejemplo, x² - 5x + 6 = 0 se factoriza como (x-2)(x-3) = 0, de modo que x = 2 o x = 3. Este método es rápido cuando la ecuación factoriza con enteros, pero no siempre es posible.\n\n2. Completar el cuadrado. Consiste en transformar ax² + bx + c = 0 en la forma (x + h)² = k y luego aplicar raíz cuadrada. Por ejemplo: x² + 6x + 5 = 0 → x² + 6x = -5 → x² + 6x + 9 = 4 → (x+3)² = 4 → x = -3 ± 2. Este método siempre funciona y sirve de base para derivar la fórmula general.\n\n3. Fórmula general (cuadrática). Es la herramienta universal: x = (-b ± √(b² - 4ac)) / 2a. Funciona para cualquier ecuación cuadrática. La expresión b² - 4ac bajo la raíz se llama discriminante y determina cuántas soluciones reales existen.",
  ],

  objetivos: [
    "Identificar los coeficientes a, b y c de una ecuación cuadrática en forma estándar.",
    "Resolver ecuaciones cuadráticas por factorización cuando es posible.",
    "Aplicar la fórmula general para obtener las raíces de cualquier ecuación cuadrática.",
    "Usar el método de completar el cuadrado para transformar y resolver la ecuación.",
    "Resolver el problema del terreno (A2) usando la fórmula general y verificar el resultado.",
  ],

  materiales: [
    { nombre: "Visor de parábola 3D", detalle: "Mueve a, b, c y observa cómo cambian las raíces y el discriminante", icono: "fa-chart-simple" },
    { nombre: "Panel de métodos", detalle: "Factorización, completar el cuadrado y fórmula general en vivo", icono: "fa-square-root-variable" },
    { nombre: "Caso del agricultor", detalle: "Ecuación 2w² + 5w − 133 = 0 del enunciado verbatim A2", icono: "fa-tractor" },
    { nombre: "Discriminante Δ", detalle: "Δ = b² − 4ac decide el número de soluciones reales (2, 1 ó 0)", icono: "fa-triangle-exclamation" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Ecuación cuadrática", definicion: "Ecuación polinomial de grado dos de la forma ax² + bx + c = 0, con a ≠ 0. También llamada ecuación de segundo grado." },
    { termino: "Discriminante (Δ)", definicion: "La expresión b² − 4ac bajo la raíz en la fórmula general. Si Δ > 0 hay dos raíces reales; si Δ = 0 una raíz doble; si Δ < 0 ninguna raíz real." },
    { termino: "Factorización", definicion: "Método que escribe ax² + bx + c = 0 como producto de dos factores lineales e iguala cada factor a cero. Es rápido cuando los factores son enteros, pero no siempre es posible." },
    { termino: "Completar el cuadrado", definicion: "Método algebraico que transforma ax² + bx + c = 0 en la forma (x + h)² = k y despeja x con raíz cuadrada. Siempre funciona y da origen a la fórmula general." },
    { termino: "Fórmula general (cuadrática)", definicion: "x = (−b ± √(b²−4ac)) / (2a). Resuelve cualquier ecuación cuadrática, sea o no factorizable con enteros." },
    { termino: "Raíz doble", definicion: "Cuando el discriminante es cero (Δ = 0), la ecuación tiene una única solución: x = −b / (2a). La parábola toca el eje x en exactamente un punto (el vértice)." },
  ],

  // Glosario VERBATIM de A5 «Glosario — Ecuaciones cuadráticas» (glosario_interactivo).
  glosario: [
    {
      termino: "Ecuación cuadrática",
      definicion: "Ecuación de la forma ax² + bx + c = 0 con a ≠ 0. También llamada ecuación de segundo grado. Ejemplo: 2x² − 3x + 1 = 0 es una ecuación cuadrática con a=2, b=−3, c=1.",
    },
    {
      termino: "Factorización",
      definicion: "Método para resolver ax² + bx + c = 0 expresándola como producto de dos factores lineales. Ejemplo: x² − 5x + 6 = (x−2)(x−3) = 0 → x = 2 o x = 3.",
    },
    {
      termino: "Fórmula general (cuadrática)",
      definicion: "x = (−b ± √(b²−4ac)) / (2a). Resuelve cualquier ecuación cuadrática. Ejemplo: para x²−5x+6=0: x = (5 ± √(25−24))/2 = (5±1)/2 → x=3 o x=2.",
    },
    {
      termino: "Completar el cuadrado",
      definicion: "Método algebraico que transforma ax²+bx+c=0 en la forma (x+h)²=k para despejar x. Ejemplo: x²+6x+5=0 → (x+3)²=4 → x+3=±2 → x=−1 o x=−5.",
    },
    {
      termino: "Raíces (soluciones) de la ecuación",
      definicion: "Los valores de x que satisfacen ax²+bx+c=0. Una ecuación cuadrática tiene a lo más dos raíces reales. Ejemplo: las raíces de x²−5x+6=0 son x=2 y x=3.",
    },
    {
      termino: "Verificación de una raíz",
      definicion: "Sustituir la solución encontrada en la ecuación original para confirmar que la igualdad se cumple. Ejemplo: para x=2: (2)²−5(2)+6 = 4−10+6 = 0. ✓",
    },
  ],

  aplicaciones: [
    "Física: el movimiento de proyectiles sigue una trayectoria cuadrática (d = ½gt²).",
    "Economía: optimización de ganancias cuando el ingreso depende del cuadrado de la producción.",
    "Arquitectura: diseño de arcos y bóvedas cuya curva es una parábola.",
    "Agricultura: cálculo de dimensiones de terrenos cuando el área es una función cuadrática de la variable.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 + Glosario A5, PM-III-P02.",
};
