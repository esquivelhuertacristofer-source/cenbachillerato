/**
 * Datos de la Ficha Teórica del laboratorio de Parábola — tiro parabólico (PM-III-P06).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Parábolas: vértice, ceros y eje de
 * simetría» (video_con_preguntas). Glosario VERBATIM de A5 «Glosario — Parábolas y
 * funciones cuadráticas» (glosario_interactivo). El reto evaluable vive en
 * parabola-trayectoria-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const PARABOLA_FICHA: FichaTeoricaData = {
  ancla: "PM-III · P06 · A1 — Parábolas: vértice, ceros y eje de simetría",

  // Marco teórico — VERBATIM de la lectura/video A1.
  marcoTeorico: [
    "La parábola es la curva que describe la gráfica de toda función cuadrática de la forma f(x) = ax² + bx + c, donde a, b y c son constantes y a es distinto de cero. Es una de las curvas más frecuentes en la naturaleza y en la tecnología: la trayectoria de un proyectil, la forma de los espejos telescópicos y los reflectores de luz siguen esta forma.",
    "El parámetro 'a' determina la apertura de la parábola. Si a es positivo, la parábola abre hacia arriba y tiene un punto mínimo: es como un cuenco que puede contener agua. Si a es negativo, la parábola abre hacia abajo y tiene un punto máximo: como una colina. Cuanto mayor sea el valor absoluto de 'a', más estrecha y pronunciada será la parábola; cuanto más cercano a cero, más ancha.",
    "El vértice es el punto más importante de la parábola: es el mínimo si a > 0 o el máximo si a < 0. Para encontrar su coordenada horizontal (xv), usamos la fórmula xv = -b / (2a). Luego, para encontrar la coordenada vertical (yv), sustituimos xv en la función: yv = f(xv). El eje de simetría es la línea vertical que pasa por el vértice, con ecuación x = xv: la parábola es perfectamente simétrica respecto a esta línea.",
    "Los ceros o raíces de la función cuadrática son los valores de x donde la parábola cruza el eje horizontal, es decir, donde f(x) = 0. Se obtienen resolviendo la ecuación cuadrática, ya sea por factorización, completando el cuadrado o usando la fórmula general. Una parábola puede tener dos ceros (cruza el eje x en dos puntos), uno (es tangente al eje x en el vértice) o ninguno (no toca el eje x).",
    "Para graficar una parábola, sigue estos pasos: encuentra el vértice con la fórmula; calcula el eje de simetría; determina si abre hacia arriba o hacia abajo; calcula los ceros si existen; elige dos o tres valores adicionales de x a cada lado del vértice y calcula sus imágenes; traza la curva pasando por todos los puntos.",
    "En la Liga MX, la trayectoria de un balón pateado desde el suelo con ángulo y velocidad definidos sigue una parábola. Si la función que modela la altura en metros es h(t) = -4.9t² + 15t, el vértice nos dice cuándo el balón alcanza su altura máxima (t = 15/9.8 ≈ 1.53 s) y cuál es esa altura máxima. Los ceros indican los momentos en que el balón está a nivel del suelo.",
  ],

  objetivos: [
    "Identificar el vértice, eje de simetría y apertura de una parábola a partir de f(x) = ax² + bx + c.",
    "Calcular los ceros de la función cuadrática e interpretarlos como puntos de corte con el eje x.",
    "Relacionar el discriminante con la cantidad de intersecciones de la parábola con el eje x.",
    "Esbozar la gráfica de una parábola usando vértice, ceros e intersección con el eje y.",
    "Resolver el ejercicio evaluable de tiro parabólico de la actividad A2.",
  ],

  materiales: [
    { nombre: "Parábola 3D interactiva", detalle: "Mueve a, b y c y observa cómo cambia la trayectoria del balón", icono: "fa-chart-line" },
    { nombre: "Vértice y eje de simetría", detalle: "Visualiza el punto más alto y la recta x = xv", icono: "fa-mountain" },
    { nombre: "Ceros (raíces)", detalle: "Los puntos donde la parábola cruza el eje x (el suelo)", icono: "fa-down-long" },
    { nombre: "Escenario del gol", detalle: "Compara h(25) con el travesaño (2.44 m) del problema ancla", icono: "fa-futbol" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Apertura (parámetro a)", definicion: "Si a > 0, la parábola abre hacia arriba (vértice mínimo); si a < 0, abre hacia abajo (vértice máximo). Cuanto mayor |a|, más estrecha la curva." },
    { termino: "Vértice", definicion: "Punto de máximo o mínimo de la parábola. Su abscisa es xv = −b/(2a) y su ordenada es f(xv)." },
    { termino: "Eje de simetría", definicion: "Recta vertical x = xv que divide la parábola en dos mitades perfectamente simétricas." },
    { termino: "Ceros (raíces)", definicion: "Valores de x donde f(x) = 0; son los puntos donde la parábola cruza el eje x. Se obtienen resolviendo ax² + bx + c = 0." },
    { termino: "Discriminante", definicion: "D = b² − 4ac. Si D > 0: dos ceros; D = 0: un cero (tangente al eje x); D < 0: ningún cero real." },
    { termino: "Fórmula general", definicion: "x = (−b ± √(b²−4ac)) / (2a). Permite encontrar los ceros de cualquier función cuadrática." },
  ],

  // Glosario VERBATIM de A5 «Glosario — Parábolas y funciones cuadráticas».
  glosario: [
    { termino: "Función cuadrática", definicion: "Función de la forma f(x) = ax² + bx + c (a ≠ 0). Su gráfica es una parábola." },
    { termino: "Parábola", definicion: "Curva simétrica con forma de 'U' (o '∩') que es la gráfica de toda función cuadrática." },
    { termino: "Vértice de la parábola", definicion: "Punto de máximo (a<0) o mínimo (a>0) de la parábola. Su abscisa es x_v = −b/(2a) y su ordenada es f(x_v)." },
    { termino: "Eje de simetría", definicion: "Recta vertical x = −b/(2a) que divide la parábola en dos mitades simétricas." },
    { termino: "Ceros (raíces) de la función", definicion: "Valores de x donde f(x) = 0; son los puntos donde la parábola cruza el eje x. Se obtienen resolviendo ax²+bx+c=0." },
    { termino: "Intersección con el eje y", definicion: "El punto donde la parábola cruza el eje y se obtiene evaluando f(0) = c." },
  ],

  aplicaciones: [
    "Modelar la trayectoria de un balón de fútbol: el vértice es la altura máxima y los ceros son los puntos donde el balón toca el suelo.",
    "Diseño de espejos parabólicos en telescopios (Gran Telescopio Milimétrico, Sierra Negra, Puebla): concentran los rayos en el foco.",
    "Forma de reflectores de luz, antenas parabólicas y estructuras de puentes en arco.",
    "Proyectiles y cohetes: la parábola modela todo lo que sube y cae bajo gravedad constante.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Video/Lectura A1 + Glosario A5, PM-III-P06.",
};
