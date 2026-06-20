/**
 * Ficha Teórica del laboratorio «Modelado y estimación con cónicas».
 *
 * Contenido VERBATIM de la actividad ancla PM-IV-P08-A1 (lectura
 * «Las secciones cónicas y su aplicación: modelado y estimación»).
 * Glosario y conceptos derivados de la misma lectura.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const MODELADO_CONICAS_FICHA: FichaTeoricaData = {
  ancla: "PM-IV · P08 · A1 — Las secciones cónicas y su aplicación: modelado y estimación",

  marcoTeorico: [
    "Las SECCIONES CÓNICAS —circunferencia, parábola, elipse e hipérbola— son las curvas que se obtienen al cortar un cono con un plano. El tipo de curva depende del ángulo con que el plano corta al cono.",
    "Parábola: y = a·x² (o, equivalentemente, x² = 4py). Es la curva que se obtiene cuando el plano queda paralelo a una de las generatrices del cono. Su propiedad clave es que concentra los rayos paralelos al eje en un punto llamado FOCO; por eso se usa en antenas, telescopios y faros.",
    "Elipse: x²/a² + y²/b² = 1. Es una curva cerrada con DOS focos. Modela las órbitas de los planetas (primera ley de Kepler) y los arcos de muchas construcciones.",
    "Circunferencia: (x − h)² + (y − k)² = r². Es el caso particular de la elipse cuando a = b. Todos sus puntos están a la misma distancia r del centro. Modela, por ejemplo, el área de cobertura de una señal.",
    "Hipérbola: x²/a² − y²/b² = 1. Tiene dos ramas abiertas y modela relaciones de proporcionalidad inversa (como la ley de Boyle de los gases) y sistemas de navegación basados en diferencias de distancias.",
    "MODELAR Y ESTIMAR con cónicas sigue tres pasos: (1) identificar qué cónica describe la situación; (2) escribir su ecuación usando los datos conocidos; (3) usar la ecuación para estimar el valor que se busca.",
  ],

  objetivos: [
    "Reconocer las cuatro cónicas como cortes de un mismo cono según el ángulo del plano.",
    "Asociar cada cónica con su ecuación de dos variables y un fenómeno real.",
    "Modelar una antena parabólica y = a·x² y localizar su foco.",
    "Estimar, con la circunferencia x²+y²=r², si un punto está dentro, fuera o en el borde del alcance.",
    "Resolver el ejercicio evaluable de modelado y estimación de la actividad A2.",
  ],

  materiales: [
    { nombre: "Cono de doble napa 3D", detalle: "Plano de corte inclinable que genera las cuatro cónicas en tiempo real", icono: "fa-cube" },
    { nombre: "Antena parabólica virtual", detalle: "Curva y = 0.25·x², foco y haz de rayos paralelos concentrándose", icono: "fa-satellite-dish" },
    { nombre: "Mapa de cobertura", detalle: "Circunferencia x²+y²=25 y prueba de puntos dentro/borde/fuera", icono: "fa-tower-cell" },
    { nombre: "Reto de modelado y estimación", detalle: "Ejercicio verbatim A2: antena, foco y alcance de señal", icono: "fa-calculator" },
  ],

  conceptos: [
    { termino: "Sección cónica", definicion: "Curva que se obtiene al cortar un cono con un plano. Las cuatro son circunferencia, elipse, parábola e hipérbola, y el ángulo del plano determina cuál aparece." },
    { termino: "Generatriz", definicion: "Cada una de las rectas que, al girar alrededor del eje, forman la superficie del cono. Cuando el plano de corte queda paralelo a una generatriz, la cónica es una parábola." },
    { termino: "Foco de la parábola", definicion: "Punto donde se concentran todos los rayos que llegan paralelos al eje. En y = a·x² está en (0, 1/(4a)). Es la base de antenas y faros." },
    { termino: "Modelar", definicion: "Escribir la ecuación de una cónica que representa una situación real, usando los datos conocidos del problema." },
    { termino: "Estimar", definicion: "Usar la ecuación del modelo para predecir o aproximar un valor: por ejemplo, la altura de la antena en un punto o si una casa tiene señal." },
  ],

  glosario: [
    { termino: "Parábola", definicion: "Cónica abierta de ecuación y = a·x² (x² = 4py). Concentra en el foco los rayos paralelos al eje; se usa en antenas, telescopios y faros." },
    { termino: "Elipse", definicion: "Cónica cerrada de ecuación x²/a² + y²/b² = 1, con dos focos. Modela las órbitas planetarias (Kepler) y los arcos arquitectónicos." },
    { termino: "Circunferencia", definicion: "Cónica de ecuación (x−h)²+(y−k)²=r²; caso particular de la elipse con a = b. Modela el alcance circular de una señal." },
    { termino: "Hipérbola", definicion: "Cónica de dos ramas abiertas, x²/a² − y²/b² = 1. Modela la proporcionalidad inversa (ley de Boyle) y la navegación por diferencia de distancias." },
    { termino: "Foco", definicion: "Punto característico de una cónica. En la parábola concentra los rayos paralelos; la elipse y la hipérbola tienen dos focos." },
    { termino: "Radio", definicion: "Distancia constante del centro a cualquier punto de la circunferencia. Una antena con radio de cobertura r = 5 km cumple x²+y² = 25." },
  ],

  aplicaciones: [
    "Antenas parabólicas (DISH, SKY, internet satelital) y faros de automóvil aprovechan la propiedad focal de la parábola.",
    "El satélite mexicano Mexsat y, en general, los satélites siguen órbitas elípticas descritas por la primera ley de Kepler.",
    "Las antenas de telefonía celular se modelan con circunferencias de cobertura: un punto tiene señal si x²+y² ≤ r².",
    "La ley de Boyle (presión y volumen de un gas inversamente proporcionales) se representa con una hipérbola.",
  ],

  fuente:
    "MCCEMS 2025 — Pensamiento Matemático IV «Trigonometría y geometría analítica». Lectura PM-IV-P08-A1: «Las secciones cónicas y su aplicación: modelado y estimación».",
};
