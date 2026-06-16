/**
 * Datos de la Ficha Teórica del laboratorio de Optimización con la derivada
 * (PM-V-P07).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Optimización con derivada:
 * encontrar el mejor valor posible» (lectura) y del glosario A5 «Glosario —
 * Optimización con la derivada».
 *
 * Ancla: PM-V-P07-A2 (ejercicio_matematico, practica_slug=optimizacion-cilindro).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const OPTIMIZACION_FICHA: FichaTeoricaData = {
  ancla: "PM-V · P07 · A1 — Optimización con derivada: encontrar el mejor valor posible",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Una de las aplicaciones más poderosas y directas del cálculo diferencial es la optimización: encontrar el valor máximo o mínimo de una función en un contexto dado. Desde la ingeniería hasta la economía, desde la biología hasta la logística, la derivada nos permite determinar el \"mejor\" valor posible.",
    "Metodología general: (1) Identificar la función objetivo: ¿qué se quiere maximizar o minimizar? (2) Expresar esa función en términos de una sola variable usando las restricciones del problema. (3) Calcular la derivada e igualar a cero para encontrar los puntos críticos. (4) Verificar si cada punto crítico es máximo o mínimo (usando la segunda derivada o el criterio de la primera derivada). (5) Evaluar también los extremos del dominio (si es un intervalo cerrado). (6) Interpretar el resultado en el contexto del problema con unidades.",
    "Ejemplo de ingeniería: diseño de una caja de máximo volumen. Se quiere construir una caja rectangular abierta por arriba (sin tapa) usando 300 cm² de cartón. Si la base es cuadrada con lado x y la altura es h, se busca maximizar el volumen. Restricción de área: área total = base + 4 caras laterales = x² + 4xh = 300. Despejando h: h = (300 − x²) / (4x). Función objetivo (volumen): V(x) = x² · h = x² · (300 − x²)/(4x) = x(300 − x²)/4 = 75x − x³/4. Derivando e igualando a cero: V'(x) = 75 − 3x²/4 = 0 → x² = 100 → x = 10 cm, h = 5 cm, V_máx = 500 cm³. Verificación con segunda derivada: V''(x) = −6x/4 < 0 para x > 0 → confirma máximo.",
    "Ejemplo de economía: maximizar la ganancia. Una empresa tiene ingresos I(q) = 50q − 0.5q² y costos C(q) = 10q + 200. La ganancia es: G(q) = I(q) − C(q) = 40q − 0.5q² − 200. G'(q) = 40 − q = 0 → q* = 40 unidades. Esto equivale al principio económico: ingreso marginal (I'(q) = 50 − q) = costo marginal (C'(q) = 10) → q = 40.",
    "Contexto mexicano: empaques industriales. Empresas mexicanas como Gruma (productora de MASECA) y Bimbo optimizan constantemente el diseño de sus empaques. Un kilogramo de harina en bolsa rectangular o una caja de pan de caja deben minimizar el material de empaque (costo de plástico o cartón) mientras contienen un volumen fijo de producto. Este es exactamente el problema matemático de optimización que acabamos de resolver. Un ingeniero de empaques en Monterrey o Toluca aplica cálculo diferencial para diseñar la caja óptima que reduce el material en centavos por unidad — lo que a escala de millones de cajas al día representa ahorros millonarios. La optimización con derivada no solo resuelve problemas abstractos: es el lenguaje matemático de la eficiencia industrial y ambiental.",
  ],

  objetivos: [
    "Identificar la función objetivo y las restricciones del problema de optimización.",
    "Expresar la función objetivo en una sola variable usando la restricción dada.",
    "Calcular la derivada, igualarla a cero y resolver para encontrar los puntos críticos.",
    "Verificar si el punto crítico es máximo o mínimo usando la segunda derivada.",
    "Interpretar el resultado en el contexto real del problema (unidades, significado geométrico).",
    "Resolver el reto evaluable: diseño óptimo del cilindro sin tapa con V = 1000 cm³ (A2).",
  ],

  materiales: [
    { nombre: "Cilindro 3D interactivo", detalle: "Mueve el radio r y observa cómo cambia la altura h (V fijo = 1000 cm³)", icono: "fa-wine-bottle" },
    { nombre: "Curva A(r) = πr² + 2000/r", detalle: "Visualiza el material total y su descomposición en base + lateral", icono: "fa-chart-line" },
    { nombre: "Derivada A'(r) en vivo", detalle: "Lee la pendiente del material y localiza el mínimo donde A'(r) = 0", icono: "fa-arrow-trend-down" },
    { nombre: "Sección de paso a paso", detalle: "Resolución verbatim del ejercicio A2 en 5 pasos algebraicos", icono: "fa-list-ol" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Función objetivo", definicion: "La cantidad que se desea maximizar o minimizar (área, volumen, costo, etc.). Se expresa en términos de una o más variables." },
    { termino: "Restricción", definicion: "Condición que limita los valores posibles de las variables (volumen fijo, presupuesto fijo, etc.). Se usa para reducir la función objetivo a una sola variable." },
    { termino: "Punto crítico", definicion: "Valor de la variable en el que la derivada se anula (f'(x) = 0) o no existe. Es candidato a ser máximo o mínimo." },
    { termino: "Segunda derivada y verificación", definicion: "Si f''(x) > 0 en el punto crítico, es un mínimo; si f''(x) < 0, es un máximo. Permite confirmar el tipo de extremo." },
    { termino: "Cilindro sin tapa", definicion: "Problema modelo: A(r) = πr² + 2000/r. El óptimo cumple h = r (a diferencia del cilindro cerrado donde h = 2r)." },
  ],

  // Glosario — VERBATIM de la actividad A5 «Glosario — Optimización con la derivada».
  glosario: [
    {
      termino: "Función objetivo",
      definicion: "La cantidad que se desea maximizar o minimizar en un problema de optimización (área, volumen, costo, beneficio, tiempo, etc.). Se expresa en términos de una o más variables. Ejemplo: maximizar el área A = l·w de una parcela rectangular.",
    },
    {
      termino: "Restricción",
      definicion: "Condición que limita los valores posibles de las variables (perímetro fijo, presupuesto fijo, volumen fijo, etc.). Se usa para reducir la función objetivo a una sola variable. Ejemplo: perímetro fijo P = 2l + 2w = 100 m → w = 50 − l.",
    },
    {
      termino: "Procedimiento de optimización",
      definicion: "1) Identificar la función objetivo Q. 2) Escribir la restricción y despejar para reducir Q a una sola variable. 3) Calcular Q'=0 → puntos críticos. 4) Verificar si es máximo o mínimo. 5) Responder con unidades. Ejemplo: ¿qué dimensiones de caja sin tapa maximizan el volumen si una plancha cuadrada de lado 12 cm tiene esquinas cuadradas cortadas?",
    },
    {
      termino: "Optimización en geometría",
      definicion: "Problemas clásicos: maximizar área dado el perímetro, minimizar perímetro dada el área, maximizar volumen dado el material superficial. La solución suele ser una figura simétrica (cuadrado, cubo, cilindro). Ejemplo: maximizar área de rectángulo con P=40: A(x)=x(20−x), A'=20−2x=0 → x=10. Área máxima = 100 m², es un cuadrado de lado 10.",
    },
    {
      termino: "Optimización en economía",
      definicion: "Maximizar beneficio B(q) = I(q) − C(q) o minimizar costo promedio C(q)/q. La condición de primer orden B'(q) = 0 da ingreso marginal = costo marginal. Ejemplo: C(q) = q³ − 6q² + 15q, costo marginal C'(q) = 3q² − 12q + 15.",
    },
    {
      termino: "Teorema del Valor Extremo",
      definicion: "Toda función continua en [a, b] alcanza su máximo y mínimo absolutos. Estos ocurren en puntos críticos interiores o en los extremos a y b. Siempre se evalúa f en todos esos candidatos. Ejemplo: f(x)=x³−3x en [0,2]: f'=3x²−3=0→x=1. f(0)=0, f(1)=−2, f(2)=2. Máx. abs.=2 en x=2; mín. abs.=−2 en x=1.",
    },
  ],

  aplicaciones: [
    "Ingeniería de empaques: Gruma y Bimbo minimizan el material de cartón/plástico de sus envases con volumen fijo usando optimización con derivada.",
    "Diseño de contenedores cilíndricos (latas, bidones) donde r = h minimiza el material cuando no hay tapa.",
    "Maximizar el volumen de una caja abierta construida con una lámina de cartón fija.",
    "Economía: maximizar ganancia igualando ingreso marginal = costo marginal (G'(q) = 0).",
    "La Olimpiada Mexicana de Matemáticas (OMM) usa problemas de optimización como los de esta práctica.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — PM-V. Referencia: MCCEMS 2025, Stewart Calculus. A1 PM-V-P07.",
};
