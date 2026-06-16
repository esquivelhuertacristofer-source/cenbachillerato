/**
 * Datos de la Ficha Teórica del laboratorio del Teorema Fundamental del Cálculo
 * (PM-V-P10).
 *
 * Contenido VERBATIM de la actividad ancla:
 *   A1 — lectura: «El Teorema Fundamental del Cálculo: derivar e integrar son inversas»
 *   A5 — glosario_interactivo: «Glosario: integral, área y Teorema Fundamental»
 *
 * El reto evaluable vive en teorema-fundamental-calculo-data.ts (A2).
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const TFC_FICHA: FichaTeoricaData = {
  ancla: "PM-V · P10 · A1 — El Teorema Fundamental del Cálculo: derivar e integrar son inversas",

  // Marco teórico — VERBATIM de la lectura A1 (PM-V-P10-A1).
  marcoTeorico: [
    "Durante este semestre aprendiste a DERIVAR: a medir qué tan rápido cambia una función en cada instante (su pendiente). El cálculo tiene una segunda gran operación, la INTEGRAL, que hace lo contrario: en vez de medir el ritmo del cambio, suma el cambio para obtener un TOTAL acumulado. El Teorema Fundamental del Cálculo (TFC) es el puente que conecta ambas ideas, y es uno de los resultados más importantes de toda la matemática.",
    "LA INTEGRAL ES UN ÁREA. La INTEGRAL DEFINIDA de una función f entre x = a y x = b, escrita ∫ₐᵇ f(x) dx, es el ÁREA encerrada entre la curva y el eje X en ese intervalo. ¿Por qué un área? Porque si f representa un ritmo —por ejemplo una velocidad—, el área bajo su gráfica es el total acumulado de ese ritmo: la distancia recorrida. Bajo una gráfica velocidad–tiempo, el área es la distancia; bajo un caudal, el volumen; bajo la potencia eléctrica, la energía.",
    "SUMAS DE RIEMANN. ¿Cómo se mide el área bajo una curva que no es un rectángulo ni un triángulo? La idea de Bernhard Riemann fue APROXIMARLA con rectángulos: se parte el intervalo [a, b] en n pedazos iguales de ancho (b−a)/n, sobre cada pedazo se levanta un rectángulo cuya altura es el valor de la función, y se suman sus áreas. Con pocos rectángulos la aproximación es burda (sobra o falta área); pero al usar cada vez MÁS rectángulos, más delgados, la suma se PEGA al área real. El área exacta es el límite de esas sumas cuando n tiende a infinito: esa es la integral.",
    "LA ANTIDERIVADA. Sumar infinitos rectángulos sería imposible a mano. Aquí entra la otra cara del teorema: una ANTIDERIVADA (o primitiva) de f es una función F cuya derivada es f, es decir F′(x) = f(x). Por ejemplo, una antiderivada de f(x) = 2x es F(x) = x², porque la derivada de x² es 2x.",
    "EL TEOREMA. El Teorema Fundamental del Cálculo dice dos cosas que son la misma vista desde dos lados. (1) Si construimos la FUNCIÓN DE ACUMULACIÓN F(x) = ∫ₐˣ f(t) dt —el área bajo f desde a hasta x—, entonces al derivarla recuperamos la función original: F′(x) = f(x). Derivar la acumulación deshace la integral. (2) Por eso, para calcular un área exacta no hace falta sumar rectángulos: basta encontrar una antiderivada F y restar sus valores en los extremos: ∫ₐᵇ f(x) dx = F(b) − F(a).",
    "UN EJEMPLO QUE LO REÚNE TODO. Un objeto se mueve con velocidad v(t) = 2t (m/s). ¿Qué distancia recorre entre t = 0 y t = 4 s? Es el área bajo la gráfica v–t: un triángulo de base 4 y altura v(4) = 8, cuya área es ½·4·8 = 16 m. Con el TFC: una antiderivada de 2t es t², así que ∫₀⁴ 2t dt = [t²]₀⁴ = 16 − 0 = 16 m. Coinciden. Y la función de acumulación, la distancia d(t) = t², cumple d′(t) = 2t = v(t): derivar la distancia devuelve la velocidad. Eso es el Teorema Fundamental del Cálculo: integrar y derivar son operaciones inversas.",
  ],

  objetivos: [
    "Identificar la integral definida ∫ₐᵇ f(x) dx como el área bajo la curva y, si f es un ritmo, el total acumulado.",
    "Aproximar el área bajo una curva con sumas de Riemann y comprender qué ocurre al aumentar el número de rectángulos.",
    "Reconocer una antiderivada F de f (F′(x) = f(x)) y calcular la integral definida como F(b) − F(a).",
    "Explicar el Teorema Fundamental del Cálculo: la función de acumulación F(x) = ∫ₐˣ f cumple F′(x) = f(x).",
    "Resolver el reto evaluable de la actividad A2 (∫₀⁴ 2t dt y el TFC).",
  ],

  materiales: [
    { nombre: "Escena 3D interactiva", detalle: "Visualiza ∫₀ᵇ f con la curva, rectángulos y función de acumulación", icono: "fa-chart-area" },
    { nombre: "Catálogo de funciones", detalle: "Elige entre f(x) = 2x, x², sen(x) y más para integrar", icono: "fa-shapes" },
    { nombre: "Modo Área (Riemann)", detalle: "Sube n y mira cómo la suma de rectángulos se pega al área exacta", icono: "fa-grip-lines-vertical" },
    { nombre: "Modo Acumulación", detalle: "Observa F(x) = ∫₀ˣ f crecer a medida que x avanza", icono: "fa-layer-group" },
    { nombre: "Modo Conexión (TFC)", detalle: "Comprueba que la pendiente de F en b es exactamente f(b)", icono: "fa-link" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Integral definida", definicion: "Área con signo bajo y = f(x) entre x = a y x = b; se escribe ∫ₐᵇ f(x) dx. Si f es un ritmo, el área es el total acumulado de ese ritmo." },
    { termino: "Sumas de Riemann", definicion: "Aproximación del área con n rectángulos de ancho (b−a)/n; converge al área exacta cuando n crece sin límite." },
    { termino: "Antiderivada (primitiva)", definicion: "Función F cuya derivada es f, es decir F′(x) = f(x). Por ejemplo, F(x) = x² es antiderivada de f(x) = 2x." },
    { termino: "Función de acumulación", definicion: "F(x) = ∫ₐˣ f(t) dt: el área acumulada bajo f desde a hasta x. Su derivada es f: F′(x) = f(x)." },
    { termino: "Teorema Fundamental del Cálculo", definicion: "Conecta derivada e integral: F′(x) = f(x) (derivar la acumulación devuelve la función) y ∫ₐᵇ f = F(b) − F(a) (basta evaluar la antiderivada en los extremos)." },
    { termino: "Operaciones inversas", definicion: "Integrar y derivar se deshacen mutuamente, como sumar y restar: derivar la distancia devuelve la velocidad, integrar la velocidad devuelve la distancia." },
  ],

  // Glosario — VERBATIM de la actividad A5 (glosario_interactivo, PM-V-P10-A5).
  glosario: [
    { termino: "Integral definida", definicion: "Área con signo bajo y = f(x) entre x = a y x = b; se escribe ∫ₐᵇ f(x) dx. Ejemplo: ∫₀⁴ 2t dt = 16 es el área bajo v = 2t en [0, 4]." },
    { termino: "Área bajo la curva", definicion: "Región encerrada entre la gráfica de una función y el eje X dentro de un intervalo. Ejemplo: bajo una gráfica velocidad–tiempo, el área es la distancia recorrida." },
    { termino: "Suma de Riemann", definicion: "Aproximación del área con n rectángulos de ancho (b−a)/n; converge al área exacta cuando n crece. Ejemplo: con 4 rectángulos la aproximación es burda; con 40, casi exacta." },
    { termino: "Antiderivada (primitiva)", definicion: "Función F cuya derivada es f, es decir F′(x) = f(x). Ejemplo: F(x) = x² es una antiderivada de f(x) = 2x." },
    { termino: "Función de acumulación", definicion: "F(x) = ∫ₐˣ f(t) dt: el área acumulada desde a hasta x. Ejemplo: la distancia d(t) = t² acumula la velocidad v(t) = 2t." },
    { termino: "Teorema Fundamental del Cálculo", definicion: "Conecta derivada e integral: F′(x) = f(x) y ∫ₐᵇ f = F(b) − F(a). Ejemplo: permite calcular ∫₀⁴ 2t dt como [t²]₀⁴ = 16." },
    { termino: "Operaciones inversas", definicion: "Integrar y derivar se deshacen mutuamente, como sumar y restar. Ejemplo: derivar la distancia t² devuelve la velocidad 2t." },
    { termino: "Acumulación de cambios continuos", definicion: "Sumar un ritmo que varía a cada instante para obtener un total. Ejemplo: caudal→volumen, potencia→energía, velocidad→distancia." },
    { termino: "Variable de integración", definicion: "La variable muda (t o x) sobre la que se suma dentro de la integral; el resultado no depende de su nombre. Ejemplo: ∫₀⁴ 2t dt = ∫₀⁴ 2u du = 16." },
    { termino: "Límites de integración", definicion: "Los extremos a (inferior) y b (superior) que delimitan el intervalo donde se mide el área. Ejemplo: en ∫₀⁴, a = 0 y b = 4." },
  ],

  aplicaciones: [
    "El área bajo una gráfica velocidad–tiempo es la distancia de un viaje (p. ej., Puebla–CDMX).",
    "El área bajo el caudal del Cutzamala es el volumen de agua que llega a la CDMX.",
    "El área bajo la curva de potencia eléctrica es la energía en kWh que cobra la CFE.",
    "El área bajo la tasa de lluvia es el agua acumulada en una presa.",
  ],

  fuente: "MCCEMS 2025 — Pensamiento Matemático V «Cálculo diferencial», contenido formativo: Integral como función inversa de la derivada · Área bajo la curva de una función dentro de un intervalo · Representación gráfica. Lectura A1 y Glosario A5, PM-V-P10.",
};
