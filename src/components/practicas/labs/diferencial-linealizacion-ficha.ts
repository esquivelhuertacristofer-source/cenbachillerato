/**
 * Datos de la Ficha Teórica del laboratorio Diferencial y linealización
 * (PM-V-P08).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Diferenciales y aproximaciones
 * lineales: cálculo rápido sin calculadora» (lectura) y A5 «Glosario —
 * Diferencial y aproximación lineal» (glosario_interactivo).
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const DIFERENCIAL_FICHA: FichaTeoricaData = {
  ancla: "PM-V · P08 · A1 — Diferenciales y aproximaciones lineales: cálculo rápido sin calculadora",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Cuando Newton y Leibniz desarrollaron el cálculo, una de sus herramientas conceptuales más productivas fue la noción de diferencial: un cambio infinitesimalmente pequeño en una variable. Hoy, el diferencial nos da una técnica práctica y elegante para estimar valores de funciones complicadas sin necesidad de calculadora.",
    "Si y = f(x) es una función derivable, el diferencial dy se define como: dy = f'(x) · dx, donde dx es un cambio arbitrario (no necesariamente infinitesimal) en x. El diferencial dy es la aproximación lineal del cambio real Δy = f(x + Δx) - f(x).",
    "Sea P = (x, f(x)) un punto de la curva. Si x cambia en Δx: Δy = cambio real en y: se sube o baja por la curva hasta (x+Δx, f(x+Δx)). dy = cambio aproximado: se sube o baja por la recta tangente en P hasta (x+Δx, y+dy). Para Δx pequeño, la tangente es casi indistinguible de la curva y dy ≈ Δy. Para Δx grande, la aproximación empeora porque la tangente se aleja de la curva.",
    "La aproximación lineal de f cerca del punto x = a es: L(x) = f(a) + f'(a)(x - a). Esta es la ecuación de la recta tangente a f en x = a, usada como aproximación local de la función. Ejemplo: estimar √(4.02) sin calculadora. Usamos f(x) = √x con punto base a = 4. f(4) = 2; f'(x) = 1/(2√x), entonces f'(4) = 1/4; L(x) = 2 + (1/4)(x - 4); L(4.02) = 2 + (1/4)(0.02) = 2 + 0.005 = 2.005. El valor real es √4.02 ≈ 2.00499..., una excelente aproximación.",
    "Si medimos el lado L de un cubo con error ±ΔL, el error en el volumen V = L³ se estima con el diferencial: dV = 3L² dL. Si L = 10 cm y ΔL = 0.1 cm: dV = 3(100)(0.1) = 30 cm³. Esto significa que un error de ±0.1 cm en la medición del lado produce un error de aproximadamente ±30 cm³ en el volumen calculado. Los ingenieros y físicos usan esta técnica —llamada propagación de incertidumbre— para establecer tolerancias en el diseño de piezas mecánicas, instrumentos de medición y procesos de manufactura.",
    "El diferencial dy = f'(x)dx no solo aproxima cambios: también es el símbolo fundamental del cálculo integral. La integral ∫f(x)dx se puede interpretar como la suma de infinitos diferenciales f(x)dx, cada uno representando el área de una franja infinitesimalmente delgada bajo la curva. Así, el diferencial es el puente conceptual entre la derivada y la integral, y dominar esta idea te prepara para el cálculo integral del siguiente semestre.",
  ],

  objetivos: [
    "Definir el diferencial dy = f'(x)·dx e interpretarlo geométricamente como el cambio sobre la recta tangente.",
    "Calcular la linealización L(x) = f(a) + f'(a)(x − a) de una función en un punto base a.",
    "Usar la linealización para estimar valores de funciones sin calculadora (raíces, exponenciales).",
    "Distinguir entre el cambio real Δy y el diferencial dy, y comprender que dy ≈ Δy cuando dx es pequeño.",
    "Aplicar el diferencial para estimar la propagación del error en mediciones físicas.",
    "Resolver el ejercicio evaluable A2 de estimación con diferenciales.",
  ],

  materiales: [
    { nombre: "Escena 3D interactiva", detalle: "Modo Estimar un valor: mueve x sobre √x o eˣ y compara real vs. linealización", icono: "fa-ruler-combined" },
    { nombre: "Modo Estimar un error", detalle: "Esfera r = 5.0 ± 0.05 cm; dV = 4πr²·dr = 5π ≈ 15.71 cm³", icono: "fa-globe" },
    { nombre: "Recta tangente en 3D", detalle: "Visualiza L(x) vs. f(x) y el error que crece al alejarse del punto base", icono: "fa-chart-line" },
    { nombre: "Diferencial dy vs. Δy real", detalle: "Tarjeta de comparación en tiempo real: dy, Δy y error |f − L|", icono: "fa-scale-balanced" },
  ],

  // Conceptos centrales formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Diferencial dy", definicion: "dy = f'(x)·dx. Representa el cambio aproximado en y cuando x cambia en dx. Es la parte lineal del cambio real Δy; se mide sobre la recta tangente, no sobre la curva." },
    { termino: "Incremento real Δy", definicion: "Δy = f(x+Δx) − f(x). Es el cambio exacto en y al moverse por la curva. Para Δx pequeño, Δy ≈ dy = f'(x)·Δx; el error es de orden (Δx)²." },
    { termino: "Linealización L(x)", definicion: "L(x) = f(a) + f'(a)(x−a). La recta tangente a f en (a, f(a)) vista como función aproximante. Es la mejor aproximación lineal de f cerca de x = a." },
    { termino: "Punto base a", definicion: "El valor de x donde se conoce f(a) con exactitud y se construye la tangente. Cuanto más cerca esté x de a, mejor es la aproximación L(x) ≈ f(x)." },
    { termino: "Propagación del error", definicion: "Si x se mide con error Δx, el error propagado en y = f(x) se estima como |Δy| ≈ |f'(x)|·|Δx|. Cuanto mayor la derivada, mayor la amplificación del error." },
    { termino: "Error de la aproximación lineal", definicion: "El error |Δy − dy| ≈ |f''(c)|·(Δx)²/2. Es de orden cuadrático en Δx: para Δx = 0.1 el error es del orden 0.01, mucho menor que el cambio lineal." },
  ],

  // Glosario — VERBATIM de PM-V-P08-A5 (glosario_interactivo).
  glosario: [
    {
      termino: "Diferencial dy",
      definicion: "Para y = f(x), el diferencial es dy = f'(x)·dx. Representa el cambio aproximado en y cuando x cambia en dx. Es la 'parte lineal' del cambio real Δy. Ejemplo: y = x³: dy = 3x²·dx. En x=2 con dx=0.1: dy = 3(4)(0.1) = 1.2. Cambio real Δy = 2.1³−8 = 9.261−8 = 1.261.",
    },
    {
      termino: "Incremento real Δy",
      definicion: "Δy = f(x+Δx) − f(x). Es el cambio exacto en y. Para Δx pequeño, Δy ≈ dy = f'(x)·Δx. El error es de orden (Δx)². Ejemplo: f(x)=x²: Δy = (x+Δx)²−x² = 2x·Δx + (Δx)². El diferencial dy = 2x·Δx captura el término principal.",
    },
    {
      termino: "Linealización (aproximación lineal)",
      definicion: "L(x) = f(a) + f'(a)(x−a). La función lineal L(x) aproxima a f(x) cerca de x = a. Es la recta tangente vista como función aproximante. Ejemplo: f(x)=eˣ, a=0: L(x)=e⁰+e⁰(x−0)=1+x. Así e^(0.1) ≈ 1+0.1=1.1 (valor real: ≈1.10517).",
    },
    {
      termino: "Error en la aproximación lineal",
      definicion: "El error cometido es |Δy − dy| ≈ |f''(c)|·(Δx)²/2. Es de orden cuadrático en Δx: para Δx = 0.1, el error es del orden 0.01, mucho menor. Ejemplo: f(x)=x²: Δy=2x·Δx+(Δx)². dy=2x·Δx. Error = (Δx)². Para Δx=0.1: error = 0.01.",
    },
    {
      termino: "Aplicación: estimación de raíces y potencias",
      definicion: "El diferencial permite estimar valores difíciles de calcular a mano: ⁿ√(a+h) ≈ ⁿ√a + h/(n·a^((n−1)/n)), usando la linealización de f(x) = x^(1/n). Ejemplo: √(25.3) ≈ √25 + 0.3/(2√25) = 5 + 0.3/10 = 5.03. Valor real: ≈5.0299. Error < 0.001.",
    },
    {
      termino: "Diferencial en contextos de error",
      definicion: "Si se mide x con un error Δx, la propagación del error en y = f(x) es aproximadamente |Δy| ≈ |f'(x)|·|Δx|. Útil en laboratorio, topografía, ingeniería. Ejemplo: radio de esfera medido con error ±0.05 cm. V = (4/3)πr³. dV = 4πr²·dr. Con r=10, dr=0.05: dV = 4π(100)(0.05) ≈ 62.8 cm³ de error en volumen.",
    },
  ],

  aplicaciones: [
    "Estimación rápida de raíces y potencias sin calculadora (√9.04 ≈ 3.0067, e^0.1 ≈ 1.1).",
    "Propagación de incertidumbre en laboratorio: error en volumen de esfera cuando el radio tiene error ±0.05 cm.",
    "Diseño mecánico: tolerancias en piezas calculadas sin resolver ecuaciones exactas.",
    "Cálculo integral: el diferencial dy = f'(x)dx es el símbolo fundamental de la integral ∫f(x)dx.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y Glosario A5, PM-V-P08. Referencia: MCCEMS 2025.",
};
