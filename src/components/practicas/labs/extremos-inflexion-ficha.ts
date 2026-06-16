/**
 * Datos de la Ficha Teórica del laboratorio de Análisis de función:
 * extremos e inflexión (PM-V-P06).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Máximos, mínimos e inflexión:
 * el análisis completo de una función» (infografía, puntos_clave).
 * El glosario proviene VERBATIM de la actividad A5 «Glosario — Máximos,
 * mínimos y puntos de inflexión» (glosario_interactivo).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ANALISIS_FICHA: FichaTeoricaData = {
  ancla: "PM-V · P06 · A1 — Máximos, mínimos e inflexión: el análisis completo de una función",

  // Marco teórico — VERBATIM de puntos_clave de la infografía A1 (PM-V-P06).
  marcoTeorico: [
    "Definiciones fundamentales: x = c es un MÁXIMO LOCAL de f si existe un entorno donde f(c) ≥ f(x) para todo x en ese entorno. Es un MÍNIMO LOCAL si f(c) ≤ f(x). Un PUNTO DE INFLEXIÓN ocurre cuando f''(c) = 0 y f'' cambia de signo, indicando que la función pasa de cóncava hacia arriba a cóncava hacia abajo (o viceversa). Un EXTREMO ABSOLUTO es el mayor o menor valor de f en todo el dominio o intervalo dado.",
    "Procedimiento analítico completo en 6 pasos: (1) calcular f'(x) y encontrar puntos críticos donde f'(c) = 0 o f'(c) no existe; (2) aplicar criterio de primera derivada — analizar el signo de f' a cada lado del punto crítico para determinar si es máximo (+ a −), mínimo (− a +) o ni uno (sin cambio de signo); (3) calcular f''(x); (4) aplicar criterio de segunda derivada — si f''(c) > 0 entonces mínimo local, si f''(c) < 0 entonces máximo local, si f''(c) = 0 el criterio es inconcluso; (5) encontrar puntos de inflexión resolviendo f''(c) = 0 y verificando cambio de signo de f''; (6) evaluar f en los extremos del intervalo para encontrar extremos absolutos.",
    "Optimización de artesanías oaxaqueñas: un artesano que produce alebrijes estima que su ingreso mensual sigue I(p) = −500p² + 20,000p − 150,000, donde p es el precio en pesos por pieza. Calculando: I'(p) = −1,000p + 20,000 = 0 → p* = 20 pesos. Verificando con la segunda derivada: I''(p) = −1,000 < 0, confirmando que p* = 20 es un máximo. El ingreso máximo es I(20) = −500(400) + 20,000(20) − 150,000 = −200,000 + 400,000 − 150,000 = $50,000 pesos/mes. El artesano debe cobrar exactamente $20/pieza.",
    "Criterio de la primera derivada (detalle): si f' cambia de positivo a negativo al pasar por c (la función sube y luego baja), entonces x = c es un máximo local. Si f' cambia de negativo a positivo (la función baja y luego sube), es un mínimo local. Si f' no cambia de signo, x = c es un punto de silla o inflexión. Este criterio es más general que el de la segunda derivada porque funciona incluso cuando f''(c) = 0.",
    "Sotero Prieto Rodríguez (1884–1935): matemático y astrónomo nacido en Guadalajara, Jalisco, considerado el fundador del cálculo diferencial universitario en México. Fue catedrático fundador de la Facultad de Ciencias de la UNAM, autor del primer texto de cálculo en español para México y formó a generaciones de matemáticos nacionales, entre ellos Manuel Sandoval Vallarta. Su método pedagógico conectaba la optimización con problemas reales de producción e ingeniería de su época.",
    "Optimización agrícola con la SADER: los técnicos de la Secretaría de Agricultura y Desarrollo Rural modelan el rendimiento del maíz con funciones cuadráticas del tipo R(f) = −0.002f² + 1.2f + 3, donde f es la cantidad de fertilizante (kg/ha) y R es el rendimiento en toneladas/ha. El máximo se obtiene en f* = −b/(2a) = −1.2/(2·(−0.002)) = 300 kg/ha. Este tipo de análisis de punto crítico orienta las recomendaciones de fertilización para los 7.5 millones de hectáreas de maíz cultivadas en México (SIAP 2022).",
    "Concavidad y puntos de inflexión: cuando f''(x) > 0 en un intervalo, f es cóncava hacia arriba (la derivada es creciente, la pendiente aumenta). Cuando f''(x) < 0, f es cóncava hacia abajo (la pendiente decrece). El punto de inflexión, donde f'' cambia de signo, marca la transición entre dos comportamientos. En una curva de costo de producción, la inflexión indica el inicio de los rendimientos decrecientes — el punto donde cada unidad adicional produce menos utilidad.",
    "Aplicaciones empresariales mexicanas: BIMBO (World's largest baking company, sede en CDMX), CEMEX (cemento, Monterrey) y GRUMA (harina de maíz y tortillas, Monterrey) publican reportes trimestrales donde sus departamentos de planeación financiera maximizan la función de utilidad U(q) respecto a la cantidad producida q. El principio es idéntico al cálculo: maximizar U(q) implica encontrar q* donde U'(q*) = 0 y U''(q*) < 0. Las tres empresas figuran en el Top 100 de Forbes México.",
    "Punto de inflexión en epidemiología: durante la pandemia de COVID-19 en México, el IMSS, el CONACYT y el INDRE monitoreaban la curva de casos acumulados I(t). El punto de inflexión de I(t) —donde I''(t) cambia de positivo a negativo— indicaba que el crecimiento diario comenzaba a disminuir: era el momento de 'doblar la curva'. Identificar matemáticamente este punto orientó las decisiones de apertura económica y la reasignación de camas hospitalarias entre marzo 2020 y junio 2021.",
    "Extremos en intervalos cerrados — Teorema de Weierstrass: toda función continua en un intervalo cerrado [a, b] alcanza su máximo y mínimo absolutos. Para encontrarlos: (1) encontrar todos los puntos críticos en (a, b), (2) evaluar f en cada punto crítico y en los extremos a y b, (3) el valor más grande es el máximo absoluto y el más pequeño es el mínimo absoluto. Este teorema garantiza que siempre existe una solución al problema de optimización en un rango finito.",
  ],

  objetivos: [
    "Encontrar los puntos críticos de f igualando f'(x) = 0 y clasificarlos con la prueba de la primera o segunda derivada.",
    "Determinar los intervalos donde f es creciente (f' > 0) y decreciente (f' < 0) a partir de los puntos críticos.",
    "Identificar la concavidad de f usando f''(x) y encontrar los puntos de inflexión donde f'' cambia de signo.",
    "Realizar un análisis completo de la función f(x) = x³ − 3x² − 9x + 5 (extremos, concavidad, inflexión).",
    "Resolver el reto evaluable de la actividad A2.",
  ],

  materiales: [
    { nombre: "Curva f(x) 3D", detalle: "Visualiza f(x) = x³ − 3x² − 9x + 5 con su derivada f' y segunda derivada f''", icono: "fa-chart-line" },
    { nombre: "Sonda x = a", detalle: "Desliza la sonda para leer f(a), f'(a) y f''(a) en tiempo real", icono: "fa-crosshairs" },
    { nombre: "Puntos notables", detalle: "Salta directamente a máximo, mínimo e inflexión", icono: "fa-location-dot" },
    { nombre: "Criterios de clasificación", detalle: "Criterio de 1.ª y 2.ª derivada para clasificar puntos críticos", icono: "fa-magnifying-glass-chart" },
  ],

  // Conceptos centrales — VERBATIM de A5 glosario_interactivo (PM-V-P06).
  conceptos: [
    { termino: "Punto crítico", definicion: "Un punto c es crítico de f si f'(c) = 0 o f'(c) no existe. Todo extremo local está en un punto crítico, pero no todo punto crítico es extremo." },
    { termino: "Prueba de la primera derivada", definicion: "Si f' cambia de + a − en c → máximo local. Si f' cambia de − a + en c → mínimo local. Si f' no cambia de signo en c → no es extremo (posible inflexión)." },
    { termino: "Prueba de la segunda derivada", definicion: "Si f'(c)=0 y f''(c)>0 → mínimo local (cóncava arriba). Si f'(c)=0 y f''(c)<0 → máximo local (cóncava abajo). Si f''(c)=0 → la prueba es inconclusa." },
    { termino: "Concavidad", definicion: "Si f''(x) > 0 en (a,b) → f es cóncava hacia arriba (taza de café boca arriba). Si f''(x) < 0 en (a,b) → f es cóncava hacia abajo (taza invertida)." },
    { termino: "Punto de inflexión", definicion: "Punto (c, f(c)) donde la concavidad cambia de signo. Condición necesaria: f''(c) = 0 o f''(c) no existe, y f'' debe cambiar de signo a ambos lados de c." },
    { termino: "Análisis completo de una función", definicion: "Procedimiento: (1) Dominio; (2) Interceptos; (3) f'(x)=0 → puntos críticos, intervalos crecientes/decrecientes; (4) f''(x)=0 → concavidad, puntos de inflexión; (5) Extremos; (6) Gráfica." },
  ],

  // Glosario VERBATIM de A5 glosario_interactivo (PM-V-P06), campo "termino"+"definicion".
  glosario: [
    { termino: "Punto crítico", definicion: "Un punto c es crítico de f si f'(c) = 0 o f'(c) no existe. Todo extremo local está en un punto crítico, pero no todo punto crítico es extremo. Ejemplo: f(x) = x³: f'(x) = 3x², f'(0) = 0 → x=0 es crítico. Pero x=0 es un punto de inflexión, no un extremo." },
    { termino: "Prueba de la primera derivada", definicion: "Si f' cambia de + a − en c → máximo local. Si f' cambia de − a + en c → mínimo local. Si f' no cambia de signo en c → no es extremo (posible inflexión). Ejemplo: f(x)=x²−4x+3: f'(x)=2x−4=0 → x=2. Para x<2, f'<0 (decrece); para x>2, f'>0 (crece). Cambio −→+: mínimo local en x=2." },
    { termino: "Prueba de la segunda derivada", definicion: "Si f'(c)=0 y f''(c)>0 → mínimo local (cóncava arriba). Si f'(c)=0 y f''(c)<0 → máximo local (cóncava abajo). Si f''(c)=0 → la prueba es inconclusa. Ejemplo: f(x)=x²−4x+3: f''(x)=2>0 en x=2 → mínimo local confirmado." },
    { termino: "Concavidad", definicion: "Si f''(x) > 0 en (a,b) → f es cóncava hacia arriba (taza de café boca arriba). Si f''(x) < 0 en (a,b) → f es cóncava hacia abajo (taza invertida). Ejemplo: f(x)=x²: f''(x)=2>0 para todo x → siempre cóncava hacia arriba. f(x)=−x²: f''(x)=−2<0 → siempre cóncava hacia abajo." },
    { termino: "Punto de inflexión", definicion: "Punto (c, f(c)) donde la concavidad cambia de signo. Condición necesaria: f''(c) = 0 o f''(c) no existe, y f'' debe cambiar de signo a ambos lados de c. Ejemplo: f(x)=x³: f''(x)=6x. Para x<0, f''<0 (cóncava abajo); para x>0, f''>0 (cóncava arriba). Cambio de signo en x=0: punto de inflexión en (0,0)." },
    { termino: "Análisis completo de una función", definicion: "Procedimiento: (1) Dominio; (2) Interceptos; (3) f'(x)=0 → puntos críticos, intervalos crecientes/decrecientes; (4) f''(x)=0 → concavidad, puntos de inflexión; (5) Extremos; (6) Gráfica. Ejemplo: Para f(x)=x³−3x: f'=3x²−3=0→x=±1 (extremos). f''=6x: f''(1)=6>0 (mín), f''(−1)=−6<0 (máx). Inflexión en x=0." },
  ],

  aplicaciones: [
    "Optimización de precios de artesanías oaxaqueñas: el vértice de la parábola I(p) es el punto óptimo de venta (máximo ingreso).",
    "Planeación agrícola SADER: encontrar la dosis óptima de fertilizante (kg/ha) que maximiza el rendimiento del maíz.",
    "Análisis de curvas de costo empresarial: el punto de inflexión marca el inicio de los rendimientos decrecientes (BIMBO, CEMEX, GRUMA).",
    "Epidemiología: el punto de inflexión de la curva de casos COVID-19 indicaba el momento de 'doblar la curva' y guiaba decisiones de apertura (IMSS/CONACYT/INDRE).",
    "Teorema de Weierstrass: garantiza que toda función continua en [a, b] alcanza su máximo y mínimo absolutos — fundamento de la optimización en ingeniería.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Infografía A1 y Glosario A5, PM-V-P06. Fuentes: Banxico, UNAM Fac. de Ciencias, SADER/SIAP.",
};
