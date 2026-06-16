/**
 * Datos de la Ficha Teórica del laboratorio de Reglas de derivación (PM-V-P04).
 *
 * Contenido VERBATIM de la actividad ancla A1
 * «Reglas de derivación: potencia, producto, cociente y cadena» (lectura).
 * El glosario proviene VERBATIM de la actividad A5 «Glosario — Reglas básicas
 * de derivación» (glosario_interactivo). Ancla evaluable: PM-V-P04-A2.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const REGLAS_FICHA: FichaTeoricaData = {
  ancla: "PM-V · P04 · A1 — Reglas de derivación: potencia, producto, cociente y cadena",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Calcular la derivada desde la definición es tedioso para funciones complicadas. Por eso los matemáticos desarrollaron reglas que permiten derivar cualquier función algebraica de forma eficiente. Estas reglas son consecuencia directa de la definición de derivada como límite.",
    "Regla de la potencia. Para cualquier exponente real n: d/dx [xⁿ] = n·xⁿ⁻¹. Ejemplos: d/dx [x⁵] = 5x⁴; d/dx [x⁻²] = −2x⁻³ = −2/x³; d/dx [√x] = d/dx [x^(1/2)] = (1/2)x^(−1/2) = 1/(2√x); d/dx [c] = 0 para cualquier constante c. Combinando con linealidad: d/dx [af(x) + bg(x)] = af'(x) + bg'(x).",
    "Regla del producto. Si f y g son derivables: d/dx [f(x)·g(x)] = f'(x)·g(x) + f(x)·g'(x). Ejemplo: deriva h(x) = (x² + 1)(3x − 2). f = x² + 1, f' = 2x; g = 3x − 2, g' = 3; h' = 2x·(3x−2) + (x²+1)·3 = 6x² − 4x + 3x² + 3 = 9x² − 4x + 3. Error común: NO es cierto que (fg)' = f'g'. La regla del producto tiene dos términos.",
    "Regla del cociente. Si g(x) ≠ 0: d/dx [f(x)/g(x)] = [f'(x)·g(x) − f(x)·g'(x)] / [g(x)]². Mnemotecnia: «numerador derivado por denominador, menos numerador por denominador derivado, todo sobre denominador al cuadrado». Ejemplo: deriva h(x) = (x²+1)/(x−1). f = x²+1, f' = 2x; g = x−1, g' = 1; h' = [2x·(x−1) − (x²+1)·1] / (x−1)² = [2x² − 2x − x² − 1] / (x−1)² = (x² − 2x − 1) / (x−1)².",
    "Regla de la cadena. Para funciones compuestas f(g(x)): d/dx [f(g(x))] = f'(g(x))·g'(x). En palabras: «derivada de la función exterior evaluada en la interior, por derivada de la interior». Ejemplo: deriva k(x) = (2x³ + 1)⁴. Función exterior: u⁴, su derivada es 4u³; función interior: u = 2x³ + 1, su derivada es 6x²; k'(x) = 4(2x³+1)³ · 6x² = 24x²(2x³+1)³.",
    "Estas cuatro reglas —potencia, producto, cociente, cadena— son suficientes para derivar cualquier función racional o algebraica. Las funciones trascendentes (trigonométricas, exponenciales, logarítmicas) requieren sus propias fórmulas base, pero la cadena sigue siendo la herramienta para componerlas.",
  ],

  objetivos: [
    "Aplicar la regla de la potencia d/dx[xⁿ] = n·xⁿ⁻¹ a funciones polinomiales y con exponentes fraccionarios o negativos.",
    "Derivar el producto de dos funciones con la fórmula (f·g)' = f'·g + f·g'.",
    "Derivar un cociente de funciones con la fórmula (f/g)' = (f'·g − f·g')/g².",
    "Identificar la función exterior e interior en una composición y aplicar la regla de la cadena f'(g(x))·g'(x).",
    "Resolver el ejercicio evaluable de derivación con las cuatro reglas (A2).",
  ],

  materiales: [
    { nombre: "Escena 3D de derivadas", detalle: "Visualiza f, f' y la tangente en tiempo real para los 4 casos del A2", icono: "fa-superscript" },
    { nombre: "Regla de la potencia", detalle: "d/dx[xⁿ] = n·xⁿ⁻¹ para cualquier exponente real", icono: "fa-superscript" },
    { nombre: "Regla del producto", detalle: "(f·g)' = f'·g + f·g' — dos términos, no el producto de derivadas", icono: "fa-xmark" },
    { nombre: "Regla del cociente", detalle: "(f/g)' = (f'g − fg')/g² — numerador cruzado sobre g²", icono: "fa-divide" },
    { nombre: "Regla de la cadena", detalle: "f'(g(x))·g'(x) — de afuera hacia adentro", icono: "fa-link" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Regla de la potencia", definicion: "d/dx[xⁿ] = n·xⁿ⁻¹. Funciona para cualquier exponente real n (entero, fraccionario o negativo). La derivada de una constante es 0." },
    { termino: "Linealidad de la derivada", definicion: "d/dx [af(x) + bg(x)] = af'(x) + bg'(x). La derivada se distribuye sobre la suma y respeta los factores constantes." },
    { termino: "Regla del producto", definicion: "d/dx[f·g] = f'·g + f·g'. La derivada del producto NO es el producto de las derivadas; tiene dos términos." },
    { termino: "Regla del cociente", definicion: "d/dx[f/g] = (f'·g − f·g')/g² cuando g(x) ≠ 0. Orden crítico: numerador derivado primero, luego el cruzado." },
    { termino: "Regla de la cadena", definicion: "Si h(x) = f(g(x)), entonces h'(x) = f'(g(x))·g'(x). Derivada de la función exterior evaluada en la interior, por derivada de la interior." },
  ],

  // Glosario — VERBATIM de PM-V-P04-A5 (glosario_interactivo).
  glosario: [
    {
      termino: "Regla de la potencia",
      definicion: "d/dx[xⁿ] = n·xⁿ⁻¹. Funciona para cualquier exponente real n (entero, fraccionario, negativo). Ejemplo: d/dx[x⁴] = 4x³. d/dx[x^(1/2)] = (1/2)x^(−1/2) = 1/(2√x). d/dx[x⁻³] = −3x⁻⁴.",
    },
    {
      termino: "Regla de la suma y diferencia",
      definicion: "d/dx[f(x) ± g(x)] = f'(x) ± g'(x). La derivada se distribuye sobre la suma y la diferencia. Ejemplo: d/dx[3x⁴ − 5x² + 7] = 12x³ − 10x. (Constante: derivada de 7 es 0.)",
    },
    {
      termino: "Regla del producto",
      definicion: "d/dx[f·g] = f'·g + f·g'. No es el producto de las derivadas individuales. Ejemplo: d/dx[x³·ln x] = 3x²·ln x + x³·(1/x) = 3x²·ln x + x².",
    },
    {
      termino: "Regla del cociente",
      definicion: "d/dx[f/g] = (f'·g − f·g')/g² (cuando g(x) ≠ 0). Mnemotecnia: «hi d-lo minus lo d-hi, over hi-hi». Ejemplo: d/dx[x²/(x²+1)] = (2x·(x²+1) − x²·2x)/(x²+1)² = 2x/(x²+1)².",
    },
    {
      termino: "Regla de la cadena",
      definicion: "Si h(x) = f(g(x)), entonces h'(x) = f'(g(x))·g'(x). Derivada exterior (evaluada en la interior) por derivada interior. Ejemplo: h(x) = (3x²+1)⁵: exterior f(u)=u⁵, interior g(x)=3x²+1. h'(x) = 5(3x²+1)⁴·6x = 30x(3x²+1)⁴.",
    },
    {
      termino: "Regla de la constante multiplicativa",
      definicion: "d/dx[c·f(x)] = c·f'(x). Las constantes multiplicativas «salen» de la derivada. Ejemplo: d/dx[7x³] = 7·d/dx[x³] = 7·3x² = 21x². d/dx[−4x] = −4.",
    },
  ],

  aplicaciones: [
    "El INEGI publica datos estadísticos abiertos en datos.gob.mx que permiten aplicar el Pensamiento Matemático a fenómenos reales: distribución del ingreso, crecimiento demográfico, mortalidad por enfermedades y tendencias educativas.",
    "La regla de la cadena permite derivar modelos de crecimiento compuesto y funciones trascendentes (exponenciales, trigonométricas) que describen ondas, poblaciones y circuitos.",
    "La regla del cociente aparece en tasas: densidad de población, tasa de mortalidad, razón de cambio de un cociente de variables estadísticas.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, PM-V-P04. Referencia: MCCEMS 2025.",
};
