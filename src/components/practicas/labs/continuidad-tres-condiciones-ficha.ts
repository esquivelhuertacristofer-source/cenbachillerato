/**
 * Datos de la Ficha Teórica del laboratorio de Continuidad: las 3 condiciones.
 *
 * Contenido VERBATIM de la actividad ancla A1 «Continuidad y discontinuidad:
 * cuándo una función "no se rompe"» (infografia, PM-V-P02-A1).
 * Los puntos_clave se transcriben íntegros como marcoTeorico.
 * El glosario proviene de A5 «Glosario — Continuidad y discontinuidad»
 * (glosario_interactivo, PM-V-P02-A5); se usa el campo termino+definicion.
 * El reto evaluable vive en continuidad-tres-condiciones-data.ts (A2).
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

// VERBATIM de PM-V-P02-A1 (infografia) y PM-V-P02-A5 (glosario_interactivo).
export const CONTINUIDAD_FICHA: FichaTeoricaData = {
  ancla: "PM-V · P02 · A1 — Continuidad y discontinuidad: cuándo una función 'no se rompe'",

  // Marco teórico — puntos_clave VERBATIM de la infografía A1.
  marcoTeorico: [
    "Una función f(x) es CONTINUA en x = a si y solo si se cumplen tres condiciones simultáneas: (1) f(a) existe (el punto está definido), (2) lím_{x→a} f(x) existe (los límites laterales izquierdo y derecho coinciden), y (3) lím_{x→a} f(x) = f(a) (el límite coincide con el valor de la función en ese punto). Si falla cualquiera de las tres condiciones, hay una discontinuidad en x = a.",
    "Discontinuidad EVITABLE (removible): el límite lím_{x→a} f(x) existe, pero f(a) no está definida o difiere del límite. Ejemplo: f(x) = (x² − 4)/(x − 2) en x = 2 tiene un 'hueco' porque la expresión no está definida, pero el límite es 4. Se elimina la discontinuidad redefiniendo f(2) = 4. Gráficamente se muestra como un punto hueco en la curva.",
    "Discontinuidad de SALTO (primera especie): los límites laterales existen pero son distintos — lím_{x→a⁻} f(x) ≠ lím_{x→a⁺} f(x). La función 'salta' abruptamente. Las tarifas eléctricas de la CFE funcionan exactamente así: en la tarifa doméstica 1F, el precio por kWh cambia de manera abrupta al cruzar los umbrales de 150 kWh (básico→intermedio) y 280 kWh (intermedio→excedente). Consumir 151 kWh cuesta significativamente más que 150 kWh.",
    "Discontinuidad ESENCIAL (segunda especie): al menos uno de los límites laterales no existe o es infinito. Ejemplo clásico: f(x) = 1/x en x = 0 tiene una asíntota vertical — la función crece sin límite hacia ±∞. No es posible hacer esta función continua en x = 0 por ninguna redefinición. También ocurre con f(x) = sen(1/x) en x = 0, donde la función oscila infinitamente rápido.",
    "Teorema del Valor Intermedio (TVI): si f es continua en el intervalo cerrado [a, b] y N es cualquier valor entre f(a) y f(b), entonces existe al menos un punto c ∈ (a, b) tal que f(c) = N. Consecuencia práctica: si la temperatura en la mañana fue 8 °C y al mediodía es 22 °C, en algún momento exacto fue 15 °C. El TVI garantiza la existencia de raíces en ecuaciones continuas (base del método de bisección numérica).",
    "Aplicación sísmica — CENAPRED: el Centro Nacional de Prevención de Desastres registra la aceleración del suelo a(t) durante un sismo. Esta función presenta discontinuidades reales que corresponden a la llegada de ondas P (primarias) y ondas S (secundarias). En el sismo de 2017 (magnitud 7.1, epicentro Axochiapan-Morelos), el CENAPRED analizó las discontinuidades en a(t) para determinar la velocidad de propagación y la amplificación local en la CDMX, donde los suelos lacustres del antiguo lago de Texcoco modifican la señal.",
    "Tarifas CFE — modelo matemático: la función de costo mensual C(k) en pesos para la tarifa 1F puede modelarse como: C(k) = {precio_básico × k si 0 ≤ k ≤ 150; precio_básico × 150 + precio_intermedio × (k−150) si 150 < k ≤ 280; valor_intermedio + precio_excedente × (k−280) si k > 280}. Esta función tiene discontinuidades de salto en k = 150 y k = 280 que el Congreso y la SHCP negocian anualmente en el Presupuesto de Egresos de la Federación.",
    "Manuel Sandoval Vallarta (1899–1977): físico teórico mexicano, primer egresado del MIT de origen latinoamericano en obtener el doctorado en física. Fue catedrático de la UNAM y director del Instituto Nacional de Energía Nuclear. Sus trabajos sobre la llegada de rayos cósmicos a la Tierra (con Georges Lemaître, 1930) involucran funciones de distribución continuas en campos magnéticos. Es considerado el padre de la física teórica en México.",
    "La función de Heaviside H(t) = {0 si t < 0; 1 si t ≥ 0} es la discontinuidad de salto más usada en ingeniería eléctrica y de control. En los modelos de simulación de la CFE para cortes de corriente, esta función modela el instante exacto en que la corriente cambia de flujo a interrupción, y se usa en transformadas de Laplace para resolver circuitos eléctricos con interrupciones repentinas.",
    "Continuidad y naturaleza: la densidad del agua tiene un máximo en 4 °C y cambia de fase de forma discontinua a 0 °C (hielo-agua) y 100 °C (agua-vapor). La presión atmosférica es continua pero tiene tasas de cambio (derivada) distintas en las capas troposfera, estratosfera y mesosfera. Identificar qué funciones son continuas y cuáles no es fundamental para modelar correctamente cualquier fenómeno físico, económico o biológico.",
  ],

  objetivos: [
    "Verificar las tres condiciones de continuidad en un punto dado (f(a) definida, límite existe, límite = f(a)).",
    "Clasificar una discontinuidad como evitable, de salto o esencial, justificando con los límites laterales.",
    "Interpretar gráficamente los tipos de discontinuidad (hueco, salto, asíntota vertical).",
    "Aplicar el Teorema del Valor Intermedio para garantizar la existencia de raíces de funciones continuas.",
    "Resolver el reto evaluable de la actividad A2.",
  ],

  materiales: [
    { nombre: "Semáforo de continuidad", detalle: "Evalúa las 3 condiciones en el punto a", icono: "fa-traffic-light" },
    { nombre: "Funciones de ejemplo", detalle: "Evitable, salto, esencial y continua", icono: "fa-wave-square" },
    { nombre: "Modo TVI", detalle: "g(x) = x³ − x − 1 en [1,2]; raíz por bisección", icono: "fa-arrow-down-up-across-line" },
    { nombre: "Caso ancla CFE", detalle: "Tarifa doméstica 1F — discontinuidades de salto en 150 y 280 kWh", icono: "fa-bolt" },
  ],

  // Conceptos centrales — formulados desde A1 (infografía, glosario integrado).
  conceptos: [
    {
      termino: "Continuidad en un punto (3 condiciones)",
      definicion: "Propiedad de una función que requiere tres condiciones simultáneas en x = a: que f(a) exista, que el límite exista y que ambos coincidan. Es la formalización matemática de que la función no tiene 'saltos, huecos ni explosiones' en ese punto.",
    },
    {
      termino: "Discontinuidad de salto",
      definicion: "Tipo de discontinuidad donde los límites laterales existen pero son distintos (lím_{x→a⁻} f(x) ≠ lím_{x→a⁺} f(x)). La función salta abruptamente de un valor a otro. Las tarifas por bloques de la CFE son un ejemplo de función con discontinuidades de salto.",
    },
    {
      termino: "Teorema del Valor Intermedio (TVI)",
      definicion: "Si f es continua en [a, b] y N está entre f(a) y f(b), existe c ∈ (a, b) con f(c) = N. Garantiza la existencia de raíces y valores intermedios en funciones continuas, sin necesidad de construir explícitamente el punto c.",
    },
    {
      termino: "Función a trozos",
      definicion: "Función definida por diferentes expresiones en diferentes subintervalos del dominio. Las tarifas CFE, el impuesto sobre la renta progresivo del SAT y la función de Heaviside son ejemplos. Su continuidad debe verificarse en cada punto de transición entre expresiones.",
    },
    {
      termino: "Asíntota vertical",
      definicion: "Recta vertical x = a hacia la que la gráfica de f(x) se aproxima ilimitadamente cuando x → a. Indica una discontinuidad esencial: la función crece o decrece sin límite cerca de ese punto. Ejemplo: f(x) = 1/x tiene asíntota vertical en x = 0.",
    },
  ],

  // Glosario — VERBATIM de PM-V-P02-A5 (glosario_interactivo, campo termino+definicion).
  glosario: [
    {
      termino: "Continuidad en un punto",
      definicion: "f es continua en x = a si: (1) f(a) existe, (2) lim(x→a) f(x) existe, (3) lim(x→a) f(x) = f(a). Las tres condiciones deben cumplirse.",
    },
    {
      termino: "Discontinuidad evitable (removible)",
      definicion: "El límite lim(x→a) f(x) = L existe, pero f(a) ≠ L o f(a) no está definida. Se puede eliminar redefiniendo f(a) = L.",
    },
    {
      termino: "Discontinuidad de salto",
      definicion: "Los límites laterales existen pero son distintos: lim(x→a⁻) f(x) ≠ lim(x→a⁺) f(x). La gráfica presenta un salto finito en x = a.",
    },
    {
      termino: "Discontinuidad esencial (infinita)",
      definicion: "Alguno de los límites laterales es ±∞. La gráfica tiene una asíntota vertical en x = a.",
    },
    {
      termino: "Continuidad en un intervalo",
      definicion: "f es continua en (a, b) si es continua en cada punto del intervalo. En los extremos [a, b] se exige continuidad lateral: desde la derecha en a y desde la izquierda en b.",
    },
    {
      termino: "Teorema del Valor Intermedio (TVI)",
      definicion: "Si f es continua en [a, b] y N está entre f(a) y f(b), entonces existe al menos un c ∈ (a, b) tal que f(c) = N. Garantiza que una función continua no puede saltar valores.",
    },
  ],

  aplicaciones: [
    "Tarifas eléctricas CFE 1F: discontinuidades de salto en los umbrales 150 kWh y 280 kWh — más del 95% de los hogares mexicanos conectados.",
    "CENAPRED — análisis sísmico: discontinuidades en a(t) permiten identificar ondas P/S y amplificación local en suelos lacustres de la CDMX.",
    "Función de Heaviside en ingeniería eléctrica: modela cortes de corriente en simulaciones CFE y en transformadas de Laplace.",
    "Temperatura, presión y densidad del agua: la continuidad (o su ausencia) es fundamental para modelar fenómenos físicos y de cambio de fase.",
    "TVI como base del método de bisección numérica para encontrar raíces de ecuaciones continuas.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Infografía A1 y Glosario A5, PM-V-P02. Fuentes: CENAPRED — Atlas Nacional de Riesgos 2022; CFE — Tarifas domésticas 1F 2023; UNAM Instituto de Matemáticas.",
};
