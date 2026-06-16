/**
 * Datos de la Ficha Teórica del laboratorio de Concepto de función (PM-IV-P01).
 *
 * Contenido VERBATIM de la actividad ancla A1 «¿Qué es una función?
 * Representaciones y ejemplos reales» (lectura) y de la actividad A5
 * «Glosario — Concepto de función» (glosario_interactivo).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const FUNCIONES_FICHA: FichaTeoricaData = {
  ancla: "PM-IV · P01 · A1 — ¿Qué es una función? Representaciones y ejemplos reales",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "La idea de función es una de las más poderosas de toda la matemática. Aunque el concepto formal se formalizó en el siglo XVII con Leibniz y Euler, la intuición de que una cantidad depende de otra es antiquísima: los astrónomos babilonios ya tabulaban la posición de los planetas en función del tiempo hace más de 3 000 años.",
    "Una función es una regla que a cada elemento de un conjunto (el dominio) le asigna exactamente un elemento de otro conjunto (el rango o codominio). La palabra clave es \"exactamente uno\": si un mismo valor de entrada produce dos valores de salida distintos, la relación no es una función.",
    "La prueba de la línea vertical resume esto en términos gráficos: si cualquier línea vertical corta la gráfica en más de un punto, la gráfica no representa una función. Una circunferencia completa no pasa la prueba; una parábola sí.",
    "En la vida cotidiana las funciones están en todos lados. La velocidad de un automóvil en el Periférico de la Ciudad de México es una función del tiempo: en cada instante hay exactamente una velocidad. La temperatura del Pico de Orizaba es una función de la altitud: a mayor altura, menor temperatura, con una relación aproximadamente lineal (~6°C por cada 1 000 m de ascenso). El costo de una llamada telefónica era una función del número de minutos; el precio del transporte metro es constante (función constante).",
    "Las funciones se pueden representar de cuatro maneras complementarias:\n\nTabular: una tabla que muestra pares (x, y). Es discreta y fácil de leer pero limitada.\nGráfica: una curva en el plano cartesiano. Permite ver tendencias, máximos y mínimos visualmente.\nAlgebraica: una fórmula como f(x) = 2x + 3 o h(t) = -5t² + 20t. Permite calcular cualquier valor y generalizar.\nVerbal: una descripción en palabras como \"la altura aumenta 2 metros por cada segundo transcurrido\". Es la más natural pero la menos precisa.\n\nDominar las cuatro representaciones y pasar de una a otra es una habilidad central del pensamiento matemático.",
  ],

  objetivos: [
    "Enunciar la definición de función y distinguirla de una relación que no lo es.",
    "Identificar el dominio y el rango de una función dada algebraica o gráficamente.",
    "Representar una función en sus formas tabular, gráfica, algebraica y verbal.",
    "Evaluar f(a) sustituyendo valores y aplicar la prueba de la línea vertical.",
    "Resolver el ejercicio evaluable: tabla de temperatura del café (A2).",
  ],

  materiales: [
    { nombre: "Plano cartesiano 3D", detalle: "Visualiza la curva y la prueba de la línea vertical en tiempo real", icono: "fa-diagram-project" },
    { nombre: "Modo Máquina", detalle: "Mueve la entrada x y observa exactamente una salida f(x)", icono: "fa-gears" },
    { nombre: "Modo ¿Es función?", detalle: "Barre la línea vertical y juzga cuántos puntos corta", icono: "fa-grip-lines-vertical" },
    { nombre: "Cuatro representaciones", detalle: "Tabular, gráfica, algebraica y verbal sincronizadas", icono: "fa-layer-group" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Función", definicion: "Regla que a cada elemento del dominio le asigna exactamente un elemento del rango. La palabra clave es «exactamente uno»: si una misma entrada produce dos salidas distintas, la relación no es una función." },
    { termino: "Dominio", definicion: "Conjunto de todos los valores de entrada (x) para los cuales la función está definida." },
    { termino: "Rango (o codominio)", definicion: "Conjunto de los posibles valores de salida (y). El rango es el conjunto de valores que la función realmente toma." },
    { termino: "Prueba de la línea vertical", definicion: "Criterio gráfico: si cualquier línea vertical corta la gráfica en más de un punto, la gráfica no representa una función. Una circunferencia completa no la pasa; una parábola vertical sí." },
    { termino: "Representación tabular", definicion: "Tabla de pares (x, f(x)) que muestra correspondencias concretas entre entradas y salidas. Es discreta y fácil de leer." },
    { termino: "Representación gráfica", definicion: "Conjunto de puntos (x, f(x)) graficados en el plano cartesiano. Permite ver tendencias, máximos y mínimos visualmente." },
    { termino: "Representación algebraica", definicion: "Fórmula como f(x) = 2x + 3. Permite calcular cualquier valor del dominio y generalizar el comportamiento." },
    { termino: "Representación verbal", definicion: "Descripción en palabras de la regla. Es la más natural pero la menos precisa." },
  ],

  // Glosario — VERBATIM de A5 «Glosario — Concepto de función» (glosario_interactivo).
  glosario: [
    {
      termino: "Función",
      definicion: "Relación entre dos conjuntos (dominio y codominio) que asigna a cada elemento del dominio exactamente un elemento del codominio. Ejemplo: f: ℝ → ℝ, f(x) = 2x + 1. A cada x ∈ ℝ le corresponde un único y = 2x + 1.",
    },
    {
      termino: "Dominio",
      definicion: "Conjunto de todos los valores de entrada (x) para los cuales la función está definida. Ejemplo: para f(x) = √x, el dominio es [0, +∞) porque la raíz de un número negativo no es real.",
    },
    {
      termino: "Codominio y rango (imagen)",
      definicion: "El codominio es el conjunto de posibles salidas. El rango (o imagen) es el conjunto de valores que la función realmente toma. Ejemplo: f(x) = x², codominio = ℝ, rango = [0, +∞). No todos los reales son alcanzados.",
    },
    {
      termino: "Representación tabular",
      definicion: "Tabla de pares (x, f(x)) que muestra correspondencias concretas entre entradas y salidas de la función. Ejemplo: x: 0, 1, 2, 3 → f(x) = x²: 0, 1, 4, 9.",
    },
    {
      termino: "Representación gráfica",
      definicion: "Conjunto de puntos (x, f(x)) graficados en el plano cartesiano. Se verifica con la prueba de la línea vertical. Ejemplo: la parábola y = x² pasa la prueba: es función.",
    },
    {
      termino: "Notación f(x) y evaluación",
      definicion: "f(x) denota el valor de la función en x. Evaluar f(a) significa sustituir x = a en la expresión algebraica. Ejemplo: si f(x) = 3x − 2, entonces f(4) = 3(4) − 2 = 10.",
    },
  ],

  aplicaciones: [
    "La velocidad de un automóvil en el Periférico de la Ciudad de México es una función del tiempo: en cada instante hay exactamente una velocidad.",
    "La temperatura del Pico de Orizaba es una función de la altitud: a mayor altura, menor temperatura (~6°C por cada 1 000 m de ascenso).",
    "El precio del transporte metro de la CDMX es constante: no importa la distancia, el costo no cambia (función constante).",
    "El costo de una llamada telefónica era una función del número de minutos marcados.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y Glosario A5, PM-IV-P01.",
};
