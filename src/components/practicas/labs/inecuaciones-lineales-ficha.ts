/**
 * Datos de la Ficha Teórica del laboratorio de Inecuaciones lineales (PM-III-P09).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Inecuaciones: restricciones y
 * soluciones posibles» (infografía). El glosario proviene de A5
 * «Glosario: inecuaciones lineales» (glosario_interactivo), también verbatim.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const INECUACIONES_FICHA: FichaTeoricaData = {
  ancla: "PM-III · P09 · A1 — Inecuaciones: restricciones y soluciones posibles",

  // Marco teórico — VERBATIM de los puntos_clave de la infografía A1.
  marcoTeorico: [
    "Una inecuación es una expresión matemática que usa un símbolo de desigualdad (<, >, ≤, ≥) para comparar dos cantidades. A diferencia de una ecuación (solución única), la inecuación tiene un conjunto infinito de soluciones: un intervalo en una variable, o una región del plano en dos variables.",
    "Resolución de una inecuación lineal: se opera igual que una ecuación, con una excepción crítica — al multiplicar o dividir ambos lados por un número NEGATIVO, el signo de la desigualdad se invierte. Ejemplo: −2x > 6 → dividir entre −2 (negativo) → x < −3 (el signo cambia).",
    "Representación en recta numérica: punto abierto (○) si el valor límite NO está incluido (< o >); punto cerrado (●) si SÍ está incluido (≤ o ≥). La solución de x > 3 es ○ en 3 con flecha hacia la derecha.",
    "Representación en plano cartesiano: una inecuación con dos variables (como 2x + 3y ≤ 600) define un semiplano. La recta es la frontera; la región sombreada es el conjunto de soluciones. Si el símbolo es ≤ o ≥, la recta frontera está incluida (trazo continuo); si es < o >, está excluida (trazo punteado).",
    "Aplicación en presupuesto familiar: si un hogar mexicano tiene ingresos de $12,000 MXN al mes y el alquiler cuesta al menos $4,000 MXN, los gastos disponibles satisfacen: gastos_otros ≤ 8,000. La ENIGH 2022 del INEGI documenta que los hogares del 40% más pobre destinan más del 50% de su ingreso a alimentación — una restricción de desigualdad que define su espacio de opciones.",
    "Inecuaciones en producción agrícola: un agricultor en Sonora tiene 100 hectáreas. Si quiere sembrar trigo (x ha) y maíz (y ha), la restricción de tierra es: x + y ≤ 100. Si necesita al menos 20 ha de trigo para cubrir costos mínimos: x ≥ 20. El sistema define la región factible — base matemática de la programación lineal que usa la SAGARPA en planificación agropecuaria.",
    "Inecuaciones en normas técnicas: el Reglamento de Construcciones de la CDMX establece que la altura máxima en zona residencial tipo H es h ≤ 10 m, y que el área construida no exceda el 60% del terreno: área_construida ≤ 0.60 × área_terreno. Dos inecuaciones que todo arquitecto debe satisfacer simultáneamente antes de presentar un proyecto.",
    "La CONASAMI fija el salario mínimo como una inecuación: salario_pagado ≥ salario_mínimo. En la economía informal mexicana — que emplea a casi el 56% de los trabajadores (INEGI 2023) — esta inecuación frecuentemente no se cumple, lo que constituye una violación de la norma con consecuencias en pobreza y seguridad social.",
  ],

  objetivos: [
    "Distinguir una ecuación de una inecuación e identificar el tipo de solución de cada una.",
    "Resolver inecuaciones lineales de una variable, incluyendo el cambio de signo al multiplicar o dividir por negativos.",
    "Representar la solución de una inecuación en la recta numérica usando punto abierto o cerrado.",
    "Identificar el semiplano solución de una inecuación lineal con dos variables en el plano cartesiano.",
    "Resolver el reto evaluable de la actividad A2 (planteo y resolución de inecuaciones lineales).",
  ],

  materiales: [
    { nombre: "Recta numérica 3D", detalle: "Visualiza la solución como intervalo (rayo) en una variable", icono: "fa-arrows-left-right-to-line" },
    { nombre: "Semiplano 3D", detalle: "Explora la región solución de una inecuación con dos variables", icono: "fa-layer-group" },
    { nombre: "Selector de símbolo", detalle: "Cambia entre <, ≤, > y ≥ para ver cómo cambia la solución", icono: "fa-greater-than-equal" },
    { nombre: "Punto abierto / cerrado", detalle: "Observa cuándo la frontera está incluida o excluida", icono: "fa-circle-dot" },
  ],

  // Conceptos centrales — formulados a partir de la infografía A1.
  conceptos: [
    { termino: "Inecuación", definicion: "Expresión matemática que establece una relación de desigualdad entre dos cantidades usando <, >, ≤ o ≥. Su solución es un conjunto infinito de valores (un intervalo en una variable, un semiplano en dos variables)." },
    { termino: "Conjunto solución", definicion: "Conjunto de todos los valores que satisfacen una inecuación. Para una variable se representa en la recta numérica; para dos variables, como una región sombreada en el plano cartesiano." },
    { termino: "Semiplano", definicion: "Región del plano cartesiano a un lado de una recta frontera. Una inecuación lineal con dos variables define un semiplano como su conjunto solución. La frontera puede estar incluida (≤, ≥) o excluida (<, >) de la solución." },
    { termino: "Región factible", definicion: "En programación lineal, intersección de todos los semiplanos generados por un sistema de inecuaciones. Representa el conjunto de soluciones posibles que satisfacen todas las restricciones simultáneamente." },
    { termino: "Programación lineal", definicion: "Método matemático de optimización que busca maximizar o minimizar una función objetivo sujeta a restricciones expresadas como inecuaciones lineales. Es una herramienta fundamental en logística, economía y gestión empresarial." },
    { termino: "Inversión del signo", definicion: "Regla crítica: al multiplicar o dividir ambos lados de una inecuación por un número negativo, el símbolo de desigualdad se invierte. Ejemplo: −2x > 6 → x < −3." },
  ],

  // Glosario — VERBATIM de A5 «Glosario: inecuaciones lineales» (glosario_interactivo).
  glosario: [
    { termino: "Desigualdad", definicion: "Relación que indica que una cantidad es mayor o menor que otra. Ejemplo: 3 < 5; x > 2." },
    { termino: "Inecuación", definicion: "Desigualdad con una incógnita que se resuelve para hallar los valores que la cumplen. Ejemplo: x + 3 > 5." },
    { termino: "Recta numérica", definicion: "Línea donde se ubican los números y se representan las soluciones de una inecuación. Ejemplo: sombrear los valores mayores que 2." },
    { termino: "Intervalo", definicion: "Conjunto de todos los números entre dos extremos (o desde uno hacia el infinito). Ejemplo: todos los x mayores que 2." },
  ],

  aplicaciones: [
    "Presupuesto familiar: los hogares del 40% más pobre destinan más del 50% de su ingreso a alimentación (ENIGH 2022, INEGI) — una restricción de desigualdad que define su espacio de opciones.",
    "Producción agrícola en Sonora: restricciones de tierra (x + y ≤ 100 ha) y costos mínimos (x ≥ 20 ha de trigo) forman la región factible usada por la SAGARPA.",
    "Reglamento de Construcciones de la CDMX: altura máxima h ≤ 10 m y área construida ≤ 60% del terreno — inecuaciones con consecuencias legales.",
    "Salario mínimo (CONASAMI): salario_pagado ≥ salario_mínimo; en la economía informal mexicana (56% de los trabajadores, INEGI 2023) esta inecuación frecuentemente no se cumple.",
    "Empresas como FEMSA, Bimbo y Gruma usan programación lineal — sistemas de inecuaciones — para optimizar rutas de distribución, mezclas de materias primas y horarios de producción.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Infografía A1 y Glosario A5, PM-III-P09. Fuentes: INEGI ENIGH 2022; CONASAMI 2024; RCCDMX vigente.",
};
