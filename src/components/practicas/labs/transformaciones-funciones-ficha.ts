/**
 * Datos de la Ficha Teórica del laboratorio de Transformaciones de funciones
 * (PM-IV-P02).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Funciones lineales y cuadráticas:
 * gráficas y transformaciones» (video_con_preguntas) y A5 «Glosario — Funciones
 * lineales y cuadráticas» (glosario_interactivo). El reto evaluable vive en
 * transformaciones-funciones-data.ts (A2, RETO_A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const TRANSFORMACIONES_FICHA: FichaTeoricaData = {
  ancla: "PM-IV · P02 · A1 — Funciones lineales y cuadráticas: gráficas y transformaciones",

  // Marco teórico — VERBATIM de la lectura A1 (campo "texto").
  marcoTeorico: [
    "Una función matemática es una regla que asigna a cada valor de entrada (x) exactamente un valor de salida (f(x)). Las funciones lineales y cuadráticas son las dos formas más fundamentales y se encuentran en prácticamente todas las aplicaciones matemáticas.",
    "La función lineal tiene la forma f(x) = mx + b, donde m es la pendiente y b es la ordenada al origen. La pendiente m indica cuánto crece o decrece la función por cada unidad que avanza x. Si m es positivo, la función es creciente: su gráfica sube de izquierda a derecha. Si m es negativo, es decreciente: baja de izquierda a derecha. Si m es cero, la función es constante: su gráfica es una línea horizontal. La ordenada al origen b indica dónde la gráfica cruza el eje vertical.",
    "La función cuadrática tiene la forma f(x) = ax² + bx + c. Su gráfica es una parábola con todas las propiedades ya estudiadas: vértice, eje de simetría, ceros y apertura determinada por el signo de a.",
    "Las transformaciones son operaciones que modifican la gráfica de una función sin cambiar su forma fundamental. El desplazamiento vertical suma o resta una constante k a la función: f(x) + k mueve la gráfica k unidades hacia arriba; f(x) - k la mueve hacia abajo. El desplazamiento horizontal reemplaza x por (x - h): f(x - h) mueve la gráfica h unidades a la derecha; f(x + h) la mueve h unidades a la izquierda (¡ojo con el signo!). La reflexión respecto al eje x cambia el signo de toda la función: -f(x) voltea la gráfica. El escalamiento vertical multiplica la función por una constante: 2f(x) la estira verticalmente; (1/2)f(x) la comprime.",
    "La tarifa doméstica de electricidad de la CFE (Comisión Federal de Electricidad) en México es un ejemplo real de función por tramos: para consumo entre 0 y 150 kWh se aplica una tarifa, para el tramo entre 151 y 280 kWh se aplica otra mayor, y para el excedente se aplica una tarifa aún más alta. Cada tramo es una función lineal, y la función completa es una función por tramos o escalón. La trayectoria de los cohetes Soyuz y los lanzamientos del puerto espacial de la Agencia Espacial Mexicana sigue modelos cuadráticos en su fase inicial.",
  ],

  objetivos: [
    "Identificar si una función es lineal o cuadrática a partir de su fórmula, tabla o gráfica.",
    "Aplicar transformaciones a funciones: traslaciones verticales y horizontales, reflexiones y escalamientos.",
    "Encontrar el vértice, la apertura, el dominio y el rango de una función cuadrática.",
    "Modelar situaciones reales con funciones lineales o cuadráticas e interpretarlas en contexto.",
    "Resolver el reto evaluable de la actividad A2 (trayectoria del balón).",
  ],

  materiales: [
    { nombre: "Visor 3D interactivo", detalle: "Modifica a, h, k y observa la transformación en tiempo real", icono: "fa-chart-line" },
    { nombre: "Función padre", detalle: "y = x² (cuadrática) o y = x (lineal) como referencia base", icono: "fa-square-root-variable" },
    { nombre: "Escenarios guiados", detalle: "Balón, recta inclinada, parábola trasladada y más", icono: "fa-futbol" },
    { nombre: "Panel de anatomía", detalle: "Vértice, apertura, ordenada al origen y pendiente en tiempo real", icono: "fa-vector-square" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Función lineal (f(x) = mx + b)", definicion: "Función de primer grado cuya gráfica es una recta. m es la pendiente (razón de cambio) y b la ordenada al origen (donde cruza el eje y)." },
    { termino: "Función cuadrática (f(x) = ax² + bx + c)", definicion: "Función de segundo grado cuya gráfica es una parábola. Abre hacia arriba si a > 0 y hacia abajo si a < 0." },
    { termino: "Desplazamiento vertical", definicion: "La transformación g(x) = f(x) + k mueve la gráfica k unidades hacia arriba (k > 0) o hacia abajo (k < 0)." },
    { termino: "Desplazamiento horizontal", definicion: "La transformación g(x) = f(x − h) mueve la gráfica h unidades a la derecha (h > 0) o a la izquierda (h < 0). ¡Ojo con el signo!" },
    { termino: "Reflexión respecto al eje x", definicion: "La transformación g(x) = −f(x) voltea la gráfica: las parábolas que abren hacia arriba pasan a abrir hacia abajo." },
    { termino: "Escalamiento vertical", definicion: "g(x) = a·f(x) estira la gráfica si |a| > 1 y la comprime si |a| < 1." },
    { termino: "Forma vértice de la parábola", definicion: "f(x) = a(x − h)² + k, donde (h, k) es el vértice. Facilita identificar todas las transformaciones de un vistazo." },
  ],

  // Glosario — VERBATIM de A5 «Glosario — Funciones lineales y cuadráticas».
  glosario: [
    {
      termino: "Función lineal (primer grado)",
      definicion: "Función de la forma f(x) = mx + b donde m ≠ 0. Su gráfica es una recta con pendiente m e intercepto b en el eje y. Ejemplo: f(x) = 2x − 3: pendiente m = 2, intercepto b = −3. Pasa por (0, −3) y (1.5, 0).",
    },
    {
      termino: "Pendiente de una recta",
      definicion: "Razón de cambio m = (y₂ − y₁)/(x₂ − x₁). Indica la inclinación y dirección de la recta. Ejemplo: Entre (1, 3) y (4, 9): m = (9−3)/(4−1) = 6/3 = 2.",
    },
    {
      termino: "Función cuadrática (segundo grado)",
      definicion: "Función de la forma f(x) = ax² + bx + c (a ≠ 0). Su gráfica es una parábola que abre hacia arriba (a > 0) o hacia abajo (a < 0). Ejemplo: f(x) = x² − 4x + 3: parábola con a = 1 > 0, vértice en (2, −1).",
    },
    {
      termino: "Forma vértice de la parábola",
      definicion: "f(x) = a(x − h)² + k, donde (h, k) es el vértice. Facilita identificar transformaciones: desplazamientos y reflexiones. Ejemplo: f(x) = 2(x − 1)² − 3: vértice (1, −3), abre hacia arriba, desplazada 1 unidad a la derecha y 3 hacia abajo.",
    },
    {
      termino: "Desplazamiento vertical y horizontal",
      definicion: "g(x) = f(x) + k desplaza f verticalmente k unidades. g(x) = f(x − h) desplaza f horizontalmente h unidades (hacia la derecha si h > 0). Ejemplo: g(x) = x² + 3 desplaza y = x² tres unidades hacia arriba.",
    },
    {
      termino: "Reflexión y dilatación",
      definicion: "g(x) = −f(x) refleja la gráfica respecto al eje x. g(x) = af(x) estira (|a| > 1) o comprime (|a| < 1) verticalmente. Ejemplo: g(x) = −x² refleja y = x² en el eje x, convirtiendo el mínimo en máximo.",
    },
  ],

  aplicaciones: [
    "La tarifa doméstica de electricidad de la CFE es una función por tramos: cada tramo de consumo tiene su propia función lineal.",
    "La trayectoria de un balón lanzado es una parábola con a < 0: el vértice (h, k) es el punto más alto.",
    "Los cohetes en su fase inicial siguen modelos cuadráticos (cohetes Soyuz, Agencia Espacial Mexicana).",
    "La pendiente en una función de distancia-tiempo es la velocidad; en costo-producción es el costo marginal.",
  ],

  fuente: "CEN Bachillerato — UAC Pensamiento Matemático IV · Lectura A1 y Glosario A5 (PM-IV-P02).",
};
