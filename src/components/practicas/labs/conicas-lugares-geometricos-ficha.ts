/**
 * Datos de la Ficha Teórica del laboratorio de Cónicas.
 *
 * Contenido VERBATIM de las actividades ancla de PM-IV-P07:
 *   - Marco teórico: puntos clave de la infografía A1
 *     «Cónicas: circunferencia y parábola como lugares geométricos».
 *   - Glosario: glosario interactivo A5 «Circunferencia y parábola».
 *
 * Fuente: PM-IV-P07-A1 (infografía) y PM-IV-P07-A5 (glosario_interactivo).
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const CONICAS_FICHA: FichaTeoricaData = {
  ancla: "PM-IV · P07 · A1 — Cónicas: circunferencia y parábola como lugares geométricos",

  // Marco teórico — VERBATIM de los puntos clave de la infografía A1 (PM-IV-P07-A1).
  marcoTeorico: [
    "Una cónica es la curva que se obtiene al cortar un cono de doble napa con un plano. Según el ángulo: corte perpendicular al eje → circunferencia; corte oblicuo sin cruzar la base → elipse; corte paralelo a una generatriz → parábola; corte que intersecta ambas napas → hipérbola.",
    "Lugar geométrico: conjunto de todos los puntos del plano que satisfacen una condición geométrica. La circunferencia es el LG de los puntos equidistantes de un centro fijo (el radio r). La parábola es el LG de los puntos que equidistan de un punto fijo (foco) y de una recta fija (directriz).",
    "Circunferencia — ecuación canónica: (x − h)² + (y − k)² = r², donde (h, k) es el centro y r el radio. Identificación rápida: en la ecuación general, si los coeficientes de x² y y² son iguales y no hay término xy, la cónica es una circunferencia.",
    "Parábola — ecuación canónica con vértice en el origen: eje vertical → x² = 4py (abre arriba si p > 0); eje horizontal → y² = 4px. El foco está en (0, p) y la directriz es y = −p. Propiedad focal: todo rayo paralelo al eje se refleja exactamente hacia el foco.",
    "El Gran Telescopio Milimétrico (GTM) del INAOE en el Volcán Sierra Negra (Puebla), a 4,600 m de altitud, tiene un reflector parabólico de 50 m de diámetro. Su superficie sigue exactamente la ecuación de una parábola: las ondas de radio y microondas del universo que llegan paralelas al eje se concentran en el foco, donde está el receptor.",
    "Identificación de cónicas por coeficientes en Ax² + Cy² + Dx + Ey + F = 0 (sin término xy): A = C → circunferencia; A ≠ C con igual signo → elipse; solo uno de A, C es cero → parábola; A y C con signos opuestos → hipérbola. Regla útil en exámenes de admisión UNAM (EXANI-II) e IPN.",
    "Aplicaciones en infraestructura mexicana: el Puente Baluarte en la Sierra Madre Occidental (Durango-Sinaloa) —uno de los puentes atirantados más altos del mundo con 402 m sobre el río Baluarte— tiene cables tensados en formas geométricas que los ingenieros civiles de la SCT calculan con geometría analítica de cónicas.",
  ],

  objetivos: [
    "Identificar la circunferencia y la parábola como lugares geométricos con condición geométrica precisa.",
    "Aplicar la ecuación canónica (x−h)²+(y−k)²=r² para reconocer centro y radio de una circunferencia.",
    "Aplicar la ecuación canónica x²=4py para identificar vértice, foco y directriz de una parábola.",
    "Completar el cuadrado para convertir la ecuación general de una circunferencia a forma estándar.",
    "Resolver el quiz evaluable de cónicas de la actividad A2.",
  ],

  materiales: [
    { nombre: "Visor 3D de cónicas", detalle: "Plano cartesiano flotante: circunferencia y parábola en tiempo real", icono: "fa-bezier-curve" },
    { nombre: "Deslizadores interactivos", detalle: "Centro (h,k), radio r para la circunferencia; parámetro p para la parábola", icono: "fa-sliders" },
    { nombre: "Panel de cálculo paso a paso", detalle: "Ecuación canónica, distancias y clasificación del punto Q en vivo", icono: "fa-calculator" },
    { nombre: "Ejemplos preconfigurados", detalle: "Escenarios de circunferencia y parábola para comparar propiedades", icono: "fa-list-check" },
  ],

  // Conceptos centrales — formulados a partir de la infografía A1.
  conceptos: [
    { termino: "Lugar geométrico", definicion: "Conjunto de todos los puntos del plano (o el espacio) que satisfacen una condición geométrica determinada. Las cónicas se definen como lugares geométricos: la circunferencia, de puntos equidistantes a un centro; la parábola, de puntos equidistantes a un foco y una directriz." },
    { termino: "Circunferencia", definicion: "Lugar geométrico de los puntos del plano equidistantes de un punto fijo llamado centro. Ecuación canónica: (x−h)²+(y−k)²=r², donde (h,k) es el centro y r el radio." },
    { termino: "Parábola", definicion: "Lugar geométrico de los puntos equidistantes de un punto fijo (foco) y de una recta fija (directriz). Ecuación canónica con vértice en el origen: x²=4py (eje vertical). Propiedad focal: todo rayo paralelo al eje converge en el foco." },
    { termino: "Foco", definicion: "Punto fijo que define una cónica junto con una directriz (parábola) u otro foco (elipse, hipérbola). La propiedad focal de la parábola —todo rayo paralelo al eje se refleja hacia el foco— es la base de antenas, telescopios y faros." },
    { termino: "Directriz", definicion: "Recta fija que, junto con el foco, define la parábola. Un punto pertenece a la parábola si y solo si su distancia al foco es igual a su distancia a la directriz." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 (PM-IV-P07-A5).
  glosario: [
    { termino: "Circunferencia (lugar geométrico)", definicion: "Conjunto de todos los puntos en el plano que equidistan de un punto fijo llamado centro. Ecuación estándar: (x − h)² + (y − k)² = r²." },
    { termino: "Forma general de la circunferencia", definicion: "x² + y² + Dx + Ey + F = 0. Se convierte a forma estándar completando el cuadrado en x y en y." },
    { termino: "Parábola como lugar geométrico", definicion: "Conjunto de puntos equidistantes de un punto fijo (foco) y una recta fija (directriz). Ecuación con vértice en origen: y = ax² (vertical) o x = ay² (horizontal)." },
    { termino: "Vértice y eje de simetría de la parábola", definicion: "El vértice es el punto de la parábola más cercano a la directriz. El eje de simetría pasa por el vértice y el foco, perpendicular a la directriz." },
    { termino: "Interceptos de cónicas", definicion: "Los interceptos en x se obtienen haciendo y = 0 y resolviendo; los interceptos en y haciendo x = 0. Útiles para graficar." },
    { termino: "Sección cónica", definicion: "Las cónicas (circunferencia, elipse, parábola, hipérbola) se obtienen cortando un cono doble con un plano. Representan curvas fundamentales en matemáticas y física." },
  ],

  aplicaciones: [
    "El GTM del INAOE (reflector parabólico de 50 m) concentra señales de radio y microondas del universo en el foco gracias a la propiedad focal de la parábola.",
    "Aproximadamente 20 millones de hogares mexicanos con televisión satelital (DISH, SKY) usan reflectores parabólicos de ~60 cm de diámetro para concentrar la señal del satélite en el receptor.",
    "Los exámenes de admisión a la UNAM (EXANI-II) y el IPN incluyen identificación de cónicas por su ecuación general.",
    "El Puente Baluarte (Durango-Sinaloa, 402 m sobre el río Baluarte) usa geometría analítica de cónicas en el cálculo estructural de sus cables tensados.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Infografía A1 y glosario A5, PM-IV-P07. INAOE GTM 2023; SCT Puente Baluarte 2020; UNAM Instituto de Matemáticas 2022.",
};
