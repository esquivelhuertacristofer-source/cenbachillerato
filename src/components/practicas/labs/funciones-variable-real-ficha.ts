/**
 * Datos de la Ficha Teórica del laboratorio Funciones de variable real (PM-V-P09).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Funciones de variable real:
 * la forma del cambio» (lectura). El glosario proviene VERBATIM de la
 * actividad A5 «Glosario: funciones de variable real» (glosario_interactivo).
 * El reto evaluable (A2) vive en funciones-variable-real-data.ts.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const FUNCIONES_VR_FICHA: FichaTeoricaData = {
  ancla: "PM-V · P09 · A1 — Funciones de variable real: la forma del cambio",

  // Marco teórico — VERBATIM del texto de la lectura A1 (PM-V-P09-A1).
  marcoTeorico: [
    "Casi todo lo que estudiamos cambia: la posición de un balón en el aire, la temperatura a lo largo del día, el costo de un viaje según la distancia. Para estudiar el CAMBIO con precisión usamos FUNCIONES. Una FUNCIÓN DE VARIABLE REAL es una regla que asigna a cada número real x un único número real y = f(x). A x se le llama variable independiente (la que «movemos») y a y, variable dependiente (la que «responde»).",
    "LA GRÁFICA. La forma más poderosa de entender una función es su REPRESENTACIÓN GRÁFICA: el conjunto de todos los puntos (x, f(x)) dibujados en el plano cartesiano. La gráfica convierte una fórmula en una imagen, y en esa imagen se leen de un vistazo todos los comportamientos de la función. Por ejemplo, la gráfica de f(x) = x² es una parábola; la de f(x) = x³, una curva que sube siempre con una «S» suave.",
    "QUÉ SE LEE EN LA GRÁFICA. (1) Las RAÍCES o ceros: los valores de x donde la curva cruza el eje X, es decir, donde f(x) = 0. (2) La INTERSECCIÓN CON Y: el punto (0, f(0)) donde la curva corta el eje vertical. (3) El CRECIMIENTO y DECRECIMIENTO: la función crece donde la curva sube al avanzar en x y decrece donde baja. (4) Los MÁXIMOS y MÍNIMOS locales: las cumbres y los valles, los puntos donde la función deja de crecer y empieza a decrecer (máximo) o al revés (mínimo). (5) La CONTINUIDAD: una función es continua si su gráfica se puede dibujar sin levantar el lápiz; las rectas y las parábolas lo son.",
    "SIMETRÍA: PARES E IMPARES. Muchas funciones tienen una simetría que ayuda a entenderlas y a graficarlas con menos trabajo. Una función es PAR si f(−x) = f(x): su gráfica es un ESPEJO respecto al eje Y. Lo que ocurre a la derecha se repite igual a la izquierda. Son pares f(x) = x², f(x) = |x| y f(x) = cos(x). Una función es IMPAR si f(−x) = −f(x): su gráfica gira 180° alrededor del ORIGEN; lo de la derecha aparece «de cabeza» a la izquierda. Son impares f(x) = x³, f(x) = 2x y f(x) = sen(x). Si no cumple ninguna de las dos condiciones, la función no tiene simetría (por ejemplo, f(x) = 2x + 1).",
    "POR QUÉ IMPORTA. Distintas funciones modelan distintos cambios: una RECTA modela un ritmo constante (la tarifa de un taxi), una PARÁBOLA un tiro o un clavado, una función SENOIDAL un ciclo que se repite (la temperatura del día, las mareas). Reconocer la forma de la gráfica —y su simetría— permite predecir cómo se comportará el fenómeno y, sobre todo, encontrar sus valores óptimos: los máximos y mínimos. Ese es el corazón del cálculo diferencial que estudiarás este semestre.",
  ],

  objetivos: [
    "Identificar una función de variable real y su variable independiente (x) y dependiente (y = f(x)).",
    "Leer en la gráfica las raíces, la intersección con Y, los tramos de crecimiento/decrecimiento y la continuidad.",
    "Reconocer los máximos y mínimos locales como cumbres y valles de la gráfica.",
    "Determinar si una función es par (f(−x) = f(x)), impar (f(−x) = −f(x)) o sin simetría.",
    "Resolver el ejercicio de análisis de f(x) = x³ − 3x: simetría, raíces y extremos (A2).",
  ],

  materiales: [
    { nombre: "Plano cartesiano 3D", detalle: "Grafica cualquier función del catálogo e identifica sus rasgos en vivo", icono: "fa-chart-line" },
    { nombre: "Catálogo de funciones", detalle: "Rectas, parábolas, cúbicas, seno y valor absoluto", icono: "fa-shapes" },
    { nombre: "Análisis de simetría", detalle: "Refleja la curva para ver si es par, impar o ninguna", icono: "fa-arrows-left-right-to-line" },
    { nombre: "Marcadores de rasgos", detalle: "Raíces, corte con Y, máximos y mínimos locales sobre la gráfica", icono: "fa-location-dot" },
  ],

  // Conceptos — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Función de variable real", definicion: "Regla que asigna a cada número real x un único número real y = f(x); x es la variable independiente e y la dependiente." },
    { termino: "Gráfica de una función", definicion: "Conjunto de todos los puntos (x, f(x)) dibujados en el plano cartesiano; convierte la fórmula en una imagen." },
    { termino: "Raíces o ceros", definicion: "Los valores de x donde la curva cruza el eje X (f(x) = 0). Una función puede tener varias, una o ninguna raíz." },
    { termino: "Intersección con Y", definicion: "El punto (0, f(0)) donde la gráfica corta el eje vertical." },
    { termino: "Crecimiento y decrecimiento", definicion: "La función crece donde la curva sube al avanzar en x y decrece donde baja. Los extremos locales están entre tramos de crecimiento y decrecimiento." },
    { termino: "Función par", definicion: "Cumple f(−x) = f(x): su gráfica es un espejo respecto al eje Y. Ejemplos: x², |x|, cos(x)." },
    { termino: "Función impar", definicion: "Cumple f(−x) = −f(x): su gráfica gira 180° alrededor del origen. Ejemplos: x³, 2x, sen(x)." },
  ],

  // Glosario VERBATIM de PM-V-P09-A5 (glosario_interactivo).
  glosario: [
    { termino: "Función de variable real", definicion: "Regla que asigna a cada número real x un único número real y = f(x). Ejemplo: f(x) = x² − 4 asigna a x = 3 el valor y = 5." },
    { termino: "Gráfica de una función", definicion: "Conjunto de todos los puntos (x, f(x)) dibujados en el plano cartesiano. Ejemplo: la gráfica de f(x) = x² es una parábola." },
    { termino: "Raíz o cero", definicion: "Valor de x donde f(x) = 0; la gráfica cruza o toca el eje X. Ejemplo: x² − 4 = 0 tiene raíces x = −2 y x = 2." },
    { termino: "Intersección con el eje Y", definicion: "El punto (0, f(0)) donde la gráfica corta el eje vertical. Ejemplo: para f(x) = x² − 4 es (0, −4)." },
    { termino: "Crecimiento / decrecimiento", definicion: "Tramo donde la función sube (crece) o baja (decrece) al avanzar en x. Ejemplo: x² decrece para x < 0 y crece para x > 0." },
    { termino: "Máximo local", definicion: "Punto donde la función deja de crecer y empieza a decrecer (una cumbre). Ejemplo: x³ − 3x tiene un máximo local en (−1, 2)." },
    { termino: "Mínimo local", definicion: "Punto donde la función deja de decrecer y empieza a crecer (un valle). Ejemplo: x³ − 3x tiene un mínimo local en (1, −2)." },
    { termino: "Función par", definicion: "Cumple f(−x) = f(x); su gráfica es simétrica respecto al eje Y. Ejemplo: x², |x| y cos(x) son pares." },
    { termino: "Función impar", definicion: "Cumple f(−x) = −f(x); su gráfica es simétrica respecto al origen. Ejemplo: x³, 2x y sen(x) son impares." },
    { termino: "Continuidad", definicion: "Una función es continua si su gráfica se dibuja sin levantar el lápiz. Ejemplo: las parábolas y las rectas son continuas en todos los reales." },
  ],

  aplicaciones: [
    "Clavado en Acapulco o tiro de un balón: parábola que sube hasta su máximo (la mayor altura) y baja.",
    "Tarifa de taxi o recibo de CFE: recta con un valor fijo más un ritmo constante de crecimiento.",
    "Temperatura del día en la CDMX o mareas del Golfo: función senoidal que sube y baja en ciclos repetidos.",
    "Corriente alterna a 60 Hz de la red eléctrica de México: función senoidal cuyo análisis de simetría simplifica los cálculos.",
  ],

  fuente: "MCCEMS 2025 — Pensamiento Matemático V «Cálculo diferencial», PM-V-P09-A1 (lectura) y PM-V-P09-A5 (glosario).",
};
