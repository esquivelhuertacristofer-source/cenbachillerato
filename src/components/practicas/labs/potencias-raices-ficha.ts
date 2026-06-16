/**
 * Datos de la Ficha Teórica del laboratorio de Potencias y raíces (PM-I-P09).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Potencias y raíces» (lectura).
 * La progresión P09 no tiene actividad de glosario; los conceptos centrales
 * se formulan a partir de la lectura A1 (sin inventar datos), y el reto
 * evaluable vive en potencias-raices-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const POTENCIAS_RAICES_FICHA: FichaTeoricaData = {
  ancla: "PM-I · P09 · A1 — Potencias y raíces",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Una POTENCIA es una forma corta de escribir una multiplicación repetida de la misma base. En 5³, el número 5 es la BASE y el 3 es el EXPONENTE; significa 5 × 5 × 5 = 125. Hay reglas útiles: al multiplicar potencias de igual base se suman los exponentes (2³ × 2² = 2⁵), y cualquier base elevada a 0 vale 1 (7⁰ = 1). Un exponente NEGATIVO indica el inverso multiplicativo de la base: 2⁻¹ = 1/2 y 3⁻² = 1/3² = 1/9. La RADICACIÓN es la operación inversa de la potenciación: la raíz cuadrada de 49 es 7 porque 7² = 49. En la raíz, el número dentro del símbolo se llama RADICANDO y el pequeño número que indica el tipo de raíz es el ÍNDICE (en la raíz cuadrada, el índice es 2). Como son operaciones inversas, una 'cancela' a la otra: la raíz cuadrada de un número al cuadrado vuelve al número original.",
  ],

  objetivos: [
    "Identificar la base, el exponente, el radicando y el índice en una expresión de potencia o raíz.",
    "Calcular potencias enteras como multiplicación repetida (p. ej. 2⁵ = 32).",
    "Aplicar el exponente cero: cualquier base ≠ 0 elevada a 0 vale 1.",
    "Interpretar el exponente negativo como inverso multiplicativo (p. ej. 3⁻² = 1/9).",
    "Calcular raíces cuadradas como operación inversa de la potencia (p. ej. √81 = 9).",
    "Resolver el reto de potencias y raíces del ejercicio A2.",
  ],

  materiales: [
    {
      nombre: "Visor 3D de potencias",
      detalle: "Construye n² (área) y n³ (volumen) con cubitos en tiempo real",
      icono: "fa-cube",
    },
    {
      nombre: "Selector de base y exponente",
      detalle: "Elige la base (1–6) y el exponente (² o ³) para ver el crecimiento",
      icono: "fa-sliders",
    },
    {
      nombre: "Resaltado del lado (raíz)",
      detalle: "Activa el lado resaltado para descubrir la raíz como operación inversa",
      icono: "fa-square-root-variable",
    },
    {
      nombre: "Cinta EN VIVO",
      detalle: "Muestra la expansión de la potencia en tiempo real",
      icono: "fa-bolt",
    },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    {
      termino: "Potencia (aⁿ)",
      definicion:
        "Forma corta de escribir una multiplicación repetida de la misma base. En 5³, el 5 es la base y el 3 es el exponente; significa 5 × 5 × 5 = 125.",
    },
    {
      termino: "Base",
      definicion:
        "El número que se multiplica repetidamente en una potencia.",
    },
    {
      termino: "Exponente",
      definicion:
        "El número que indica cuántas veces se multiplica la base. Un exponente 0 siempre da 1 (7⁰ = 1).",
    },
    {
      termino: "Exponente negativo",
      definicion:
        "Indica el inverso multiplicativo de la base elevada al exponente positivo: 2⁻¹ = 1/2 y 3⁻² = 1/9.",
    },
    {
      termino: "Radicación (√)",
      definicion:
        "La operación inversa de la potenciación: la raíz cuadrada de 49 es 7 porque 7² = 49. El número bajo el símbolo es el radicando; el índice (2 en la raíz cuadrada) indica el tipo de raíz.",
    },
    {
      termino: "Radicando",
      definicion:
        "El número dentro del símbolo de raíz sobre el que se calcula la raíz.",
    },
    {
      termino: "Índice de la raíz",
      definicion:
        "El pequeño número que acompaña al símbolo de raíz e indica el tipo de raíz (en la raíz cuadrada el índice es 2).",
    },
  ],

  // La progresión P09 no tiene actividad de glosario explícita; los términos
  // clave viven en "conceptos" (formulados desde la lectura A1).
  glosario: [],

  aplicaciones: [
    "Calcular áreas (n²) y volúmenes (n³) en geometría y construcción.",
    "Expresar números muy grandes o muy pequeños en notación científica (potencias de 10).",
    "Modelar el crecimiento de una población o de un ahorro con interés compuesto.",
    "Usar exponentes negativos para representar fracciones en física y química (p. ej. m⁻¹ = 1/m).",
  ],

  fuente:
    "Material elaborado para CEN Bachillerato — Lectura A1, PM-I-P09. MCCEMS 2025 — Pensamiento Matemático I, propósito 5.",
};
