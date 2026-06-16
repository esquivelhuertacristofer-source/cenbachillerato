/**
 * Datos de la Ficha Teórica del laboratorio de Límites (PM-V-P01).
 *
 * Contenido VERBATIM de la actividad ancla A1 «¿Qué es un límite? Intuición
 * gráfica y algebraica» (lectura) y glosario A5 «Glosario — Límite de una
 * función». El reto evaluable vive en limites-acercamiento-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const LIMITES_FICHA: FichaTeoricaData = {
  ancla: "PM-V · P01 · A1 — ¿Qué es un límite? Intuición gráfica y algebraica",

  // Marco teórico — VERBATIM de la lectura A1 (PM-V-P01-A1).
  marcoTeorico: [
    "La idea de límite es la piedra angular de todo el cálculo diferencial e integral. Aunque su formalización rigurosa llegó con Cauchy y Weierstrass en el siglo XIX, la intuición que la sustenta es sencilla: ¿a qué valor se acerca una función cuando su variable de entrada se aproxima a un punto determinado, sin llegar a él?",
    "Imagina un automóvil recorriendo la autopista México-Querétaro. En cada instante, el velocímetro muestra una velocidad; esa velocidad es la tasa de cambio instantánea de la posición. Pero si solo conocemos la posición en dos momentos distintos, podemos calcular la velocidad promedio en ese intervalo. El límite nos permite llevar esa idea al extremo: ¿qué pasa cuando el intervalo de tiempo se hace infinitamente pequeño? La respuesta es la velocidad instantánea, y esa respuesta es un límite.",
    "Definición intuitiva. Decimos que el límite de f(x) cuando x se acerca a a es L, y lo escribimos: lim(x→a) f(x) = L, si los valores f(x) se acercan arbitrariamente a L conforme x se acerca a a (por la izquierda o por la derecha), sin importar si f está definida o no en x = a. La clave es el acercamiento, no la llegada.",
    "Cálculo por sustitución directa. Para funciones polinomiales y racionales donde el denominador no se anula, el límite se calcula simplemente sustituyendo: lim(x→3) (x² + 2x - 1) = 3² + 2(3) - 1 = 9 + 6 - 1 = 14.",
    "Formas indeterminadas y factorización. Cuando la sustitución produce 0/0, la fracción no está definida pero el límite puede existir. La técnica consiste en factorizar y cancelar el factor que se anula: lim(x→2) (x² - 4)/(x - 2) = lim(x→2) [(x+2)(x-2)]/(x-2) = lim(x→2) (x+2) = 4.",
    "El límite notable lim(x→0) sen(x)/x = 1. Este resultado, que se demuestra geométricamente con el círculo unitario, es fundamental para derivar funciones trigonométricas. Aunque sen(0)/0 es una forma indeterminada, el límite vale exactamente 1. Esto explica por qué para ángulos pequeños (en radianes), sen(x) ≈ x, aproximación usada en ingeniería y física.",
    "Límites al infinito y asíntotas horizontales. Cuando x crece sin cota: lim(x→∞) 1/x = 0. lim(x→∞) (3x² + 5)/(x² - 1) = 3 (el grado del numerador y denominador es igual; el límite es el cociente de los coeficientes líderes). Esta idea conecta directamente con las asíntotas horizontales de una función racional: la recta y = L es asíntota horizontal si lim(x→±∞) f(x) = L.",
    "Dominar el concepto de límite requiere práctica con los tres casos: sustitución directa, factorización cuando hay indeterminación, y reconocimiento de límites notables. Con estas herramientas estarás listo para comprender la derivada como un límite particular.",
  ],

  objetivos: [
    "Explicar intuitivamente qué significa lim(x→a) f(x) = L sin recurrir a la definición formal con ε-δ.",
    "Calcular límites por sustitución directa cuando la función es continua en el punto.",
    "Resolver indeterminaciones 0/0 factorizando, racionalizando o simplificando algebraicamente.",
    "Calcular límites laterales y determinar si el límite bilateral existe comparándolos.",
    "Resolver el reto evaluable de la actividad A2 (tres casos verbatim del enunciado).",
  ],

  materiales: [
    { nombre: "Laboratorio 3D de límites", detalle: "Acerca x → a y observa hacia qué valor converge f(x)", icono: "fa-arrow-right-to-bracket" },
    { nombre: "Tabla de acercamiento", detalle: "Valores de f(x) por la izquierda y por la derecha de a", icono: "fa-table-list" },
    { nombre: "Tres casos verbatim", detalle: "Sustitución directa, 0/0 factorización, límite trigonométrico", icono: "fa-list-ol" },
    { nombre: "Función de posición s(t) = 3t² + 5t", detalle: "Automóvil en autopista México-Querétaro", icono: "fa-car" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Límite de una función", definicion: "lim(x→a) f(x) = L significa que los valores f(x) se acercan arbitrariamente a L conforme x se acerca a a, sin importar si f está definida o no en x = a. La clave es el acercamiento, no la llegada." },
    { termino: "Sustitución directa", definicion: "Para funciones polinomiales y racionales donde el denominador no se anula, el límite se calcula sustituyendo x = a directamente." },
    { termino: "Forma indeterminada 0/0", definicion: "Cuando la sustitución produce 0/0, la fracción no está definida pero el límite puede existir. Se resuelve factorizando y cancelando el factor que se anula." },
    { termino: "Límite notable lim(x→0) sen(x)/x = 1", definicion: "Resultado fundamental (x en radianes) que justifica la aproximación sen(x) ≈ x para ángulos pequeños, usada en ingeniería y física." },
    { termino: "Límite al infinito", definicion: "Describe el comportamiento de f(x) cuando x crece sin cota. Para cocientes de polinomios con el mismo grado, el límite es el cociente de coeficientes líderes." },
    { termino: "Asíntota horizontal", definicion: "La recta y = L es asíntota horizontal de f si lim(x→±∞) f(x) = L." },
  ],

  // Glosario — VERBATIM de A5 (glosario_interactivo, PM-V-P01-A5).
  glosario: [
    { termino: "Límite de una función", definicion: "lim(x→a) f(x) = L significa que f(x) se acerca arbitrariamente a L cuando x se acerca a a, sin necesariamente llegar a a. El valor f(a) puede ser distinto de L o incluso no estar definido. Ejemplo: lim(x→3) (x² − 9)/(x − 3) = lim(x→3) (x+3) = 6. Aunque f(3) = 0/0, el límite es 6." },
    { termino: "Límites laterales", definicion: "El límite por la izquierda lim(x→a⁻) f(x) considera x < a. El límite por la derecha lim(x→a⁺) f(x) considera x > a. El límite bilateral existe solo si ambos son iguales. Ejemplo: f(x) = |x|/x: lim(x→0⁻) = −1 y lim(x→0⁺) = 1. Como difieren, lim(x→0) no existe." },
    { termino: "Forma indeterminada 0/0", definicion: "Cuando la sustitución directa da 0/0, se recurre a álgebra: factorización, racionalización o simplificación para eliminar el factor que causa la indeterminación. Ejemplo: lim(x→2) (x²−4)/(x−2): factor = (x+2)(x−2)/(x−2) = x+2 → límite = 4." },
    { termino: "Sustitución directa", definicion: "Si f es continua en a (polinomio, función racional sin cero en denominador, etc.), entonces lim(x→a) f(x) = f(a). Es el método más simple. Ejemplo: lim(x→3) (2x² + 1) = 2(9) + 1 = 19." },
    { termino: "Límite al infinito", definicion: "lim(x→∞) f(x) describe el comportamiento de f(x) cuando x crece sin límite. Para cocientes de polinomios, el grado del numerador vs. denominador determina el resultado. Ejemplo: lim(x→∞) (5x³)/(2x³+1) = 5/2 (mismos grados)." },
    { termino: "Límite trigonométrico fundamental", definicion: "lim(x→0) sen(x)/x = 1 (x en radianes). Este límite es la base para derivar funciones trigonométricas y no puede obtenerse por sustitución directa (forma 0/0). Ejemplo: lim(x→0) sen(3x)/x = 3 · lim(x→0) sen(3x)/(3x) = 3 · 1 = 3." },
  ],

  aplicaciones: [
    "Calcular la velocidad instantánea de un automóvil como límite del cociente diferencial cuando el intervalo de tiempo tiende a cero.",
    "Determinar asíntotas horizontales de funciones racionales en modelos de saturación (crecimiento poblacional, dosis-respuesta).",
    "Justificar la aproximación sen(θ) ≈ θ para ángulos pequeños, usada en péndulos de pequeña oscilación y óptica paraxial.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — PM-V-P01. Lectura A1 + Glosario A5. Referencias: MCCEMS 2025, Stewart Calculus 8ª ed.",
};
