/**
 * Datos de la Ficha Teórica del laboratorio de Valor posicional (PM-I-P08).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Contar: una historia humana»
 * (lectura). La progresión P08 no tiene actividad de glosario; los conceptos
 * centrales se formulan a partir de la lectura A1 (sin inventar datos), y el
 * reto evaluable vive en valor-posicional-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const VALOR_POSICIONAL_FICHA: FichaTeoricaData = {
  ancla: "PM-I · P08 · A1 — Contar: una historia humana",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Contar es una de las primeras necesidades de la humanidad: saber cuántos animales, cuántas personas o cuántos días pasaban. Desde esa necesidad social, cada cultura construyó su propio sistema de conteo. En Mesopotamia se contaba en grupos de 60; en Egipto se usaban símbolos para 1, 10, 100 y 1000; en América, los pueblos olmeca y maya desarrollaron un sistema vigesimal (de base 20) y, sobre todo, usaron el CERO, un aporte enorme para las matemáticas. En la India nació el sistema que hoy usamos, con diez símbolos (0, 1, 2, ..., 9); los matemáticos árabes lo difundieron y Leonardo de Pisa, conocido como Fibonacci, lo llevó a Europa: por eso se llama sistema indoarábigo. Es un sistema POSICIONAL: el valor de cada dígito depende del lugar que ocupa (en 4 700, el 7 vale 700). Para apoyar el cálculo se inventaron herramientas como el ÁBACO. Detrás de cada número que escribimos hay, entonces, siglos de ideas de muchas culturas.",
  ],

  objetivos: [
    "Reconocer el valor posicional de cada dígito en el sistema de base 10.",
    "Identificar que cada lugar vale 10 veces el lugar de su derecha.",
    "Comprender el papel del cero como marcador de posición.",
    "Relacionar el sistema indoarábigo con sus raíces históricas y culturales.",
    "Resolver el reto de valor posicional ancla (A2).",
  ],

  materiales: [
    { nombre: "Bloques base-10 en 3D", detalle: "Cubito (unidad), barra (decena), placa (centena), cubo grande (millar)", icono: "fa-cubes-stacked" },
    { nombre: "Panel de posiciones", detalle: "Millares · Centenas · Decenas · Unidades con controles por cifra", icono: "fa-table-columns" },
    { nombre: "Deslizador de número", detalle: "Arma cualquier número de 0 a 9 999 y ve su descomposición al instante", icono: "fa-sliders" },
    { nombre: "Descomposición posicional", detalle: "Muestra cifra × valor del lugar = aporte de cada posición", icono: "fa-calculator" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Sistema posicional", definicion: "Sistema donde el valor de un dígito depende del lugar que ocupa. En 4 700, el 7 vale 700 porque está en las centenas." },
    { termino: "Sistema indoarábigo", definicion: "El sistema de numeración que usamos hoy, de base 10 (diez símbolos: 0–9). Nació en la India, fue difundido por matemáticos árabes y llegó a Europa con Fibonacci." },
    { termino: "El cero (0)", definicion: "Aporte clave de los pueblos olmeca y maya; representa la ausencia de cantidad y permite los sistemas posicionales al guardar el lugar de posiciones vacías." },
    { termino: "Valor posicional", definicion: "El valor que toma un dígito según su posición: unidades (×1), decenas (×10), centenas (×100), unidades de millar (×1 000)." },
    { termino: "Base 10 (decimal)", definicion: "Cada posición vale 10 veces la de su derecha. Diez cubitos forman una barra; diez barras, una placa; diez placas, un cubo." },
    { termino: "Ábaco", definicion: "Herramienta inventada para apoyar el conteo y el cálculo; representa cada posición con cuentas o columnas." },
  ],

  // La progresión P08 no tiene actividad de glosario; los términos clave
  // viven en "conceptos" (formulados desde la lectura A1).
  glosario: [],

  aplicaciones: [
    "Leer y escribir cualquier cantidad en la vida cotidiana (precios, medidas, poblaciones) usando el valor posicional.",
    "Entender por qué el cero es imprescindible: sin él, 305 y 35 serían indistinguibles.",
    "Reconocer la diversidad cultural detrás del sistema que usamos: India, mundo árabe, olmecas, mayas y Europa.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, PM-I-P08.",
};
