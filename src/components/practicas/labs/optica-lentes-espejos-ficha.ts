/**
 * Datos de la Ficha Teórica del laboratorio de Óptica geométrica.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-V-P06:
 *   - Marco teórico: lectura A1 «Óptica geométrica: reflexión, refracción
 *     y la ley de Snell» (párrafos verbatim del campo "texto").
 *   - Glosario: glosario interactivo A5 «Óptica: reflexión, refracción y
 *     dispersión» (términos + definiciones verbatim del campo "terminos").
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const OPTICA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-V · P06 · A1 — Óptica geométrica: reflexión, refracción y la ley de Snell",

  // Marco teórico — VERBATIM de la lectura A1 (campo "texto", dividido en párrafos naturales).
  marcoTeorico: [
    "La óptica geométrica estudia el comportamiento de la luz cuando interactúa con superficies reflectoras y refractantes, usando el modelo de rayos de luz (líneas rectas) para trazar trayectorias. Tres fenómenos fundamentales la describen: la reflexión, la refracción y la dispersión.",
    "La reflexión ocurre cuando un rayo de luz golpea una superficie y rebota. La Ley de Reflexión establece que el ángulo de incidencia (θᵢ) es igual al ángulo de reflexión (θᵣ), ambos medidos respecto a la normal a la superficie: θᵢ = θᵣ. Los espejos planos producen imágenes virtuales, derechas y del mismo tamaño que el objeto. Los espejos cóncavos (como los de telescopios y linternas de automóvil) concentran los rayos en un foco y pueden producir imágenes reales o virtuales según la posición del objeto. Los espejos convexos (retrovisores de automóvil, espejos de seguridad en tiendas) producen siempre imágenes virtuales, menores y con mayor campo visual.",
    "La refracción ocurre cuando la luz pasa de un medio a otro con distinto índice de refracción. El índice de refracción (n) de un medio es la relación entre la velocidad de la luz en el vacío (c = 3×10⁸ m/s) y la velocidad de la luz en ese medio (v): n = c/v. Valores típicos: aire n ≈ 1.00, agua n = 1.33, vidrio n ≈ 1.50, diamante n = 2.42. Cuanto mayor el índice, más lenta viaja la luz en ese medio.",
    "La Ley de Snell (o Ley de Snell-Descartes) describe cuánto se dobla un rayo de luz al pasar de un medio a otro: n₁ · sen θ₁ = n₂ · sen θ₂. Cuando la luz pasa de un medio menos denso a uno más denso (ej. de aire a vidrio), se dobla hacia la normal (θ₂ < θ₁). Cuando pasa de más denso a menos denso (ej. de vidrio a aire), se aleja de la normal. Si el ángulo de incidencia supera el ángulo crítico θ_c = arcsen(n₂/n₁) (con n₁ > n₂), la luz no se refracta y se refleja completamente: esto es la reflexión total interna.",
    "Las lentes utilizan la refracción para modificar la trayectoria de los rayos de luz y formar imágenes. Las lentes convergentes (convexas) hacen que los rayos paralelos converjan en un punto llamado foco (f > 0). Las lentes divergentes (cóncavas) hacen que los rayos diverjan como si vinieran de un foco virtual (f < 0). La ecuación de las lentes (ecuación de Gauss) es: 1/f = 1/d_o + 1/d_i, donde d_o es la distancia objeto y d_i la distancia imagen. El ojo humano es el sistema óptico más sofisticado de la naturaleza: la córnea realiza la mayor parte de la refracción, y el cristalino (una lente biológica flexible) ajusta el foco para ver a distintas distancias (acomodación). La miopía (el globo ocular es demasiado largo o la córnea muy curvada) se corrige con lentes divergentes. La hipermetropía (globo muy corto) se corrige con lentes convergentes.",
    "La reflexión total interna hace posible la fibra óptica: un rayo de luz que viaja dentro de un núcleo de vidrio de alto índice de refracción no puede escapar si el ángulo de incidencia supera el ángulo crítico. La luz rebota indefinidamente por el interior de la fibra, transportando información digital (pulsos de luz) con pérdidas mínimas a lo largo de kilómetros. Las redes de fibra óptica de TELMEX y Totalplay en México usan este principio para proveer internet de banda ancha a millones de hogares.",
    "La dispersión ocurre porque el índice de refracción depende de la longitud de onda (frecuencia) de la luz. En el vidrio de un prisma, la luz violeta (λ menor) se refracta más que la luz roja (λ mayor), separando la luz blanca en el espectro de colores del arcoíris. Los arcoíris naturales se forman por reflexión y dispersión dentro de millones de gotas de agua en suspensión, formando un arco a 42° del antisolar.",
  ],

  objetivos: [
    "Aplicar la ley de reflexión θᵢ = θᵣ para trazar la trayectoria de rayos reflejados en espejos planos, cóncavos y convexos.",
    "Aplicar la ley de Snell n₁·sen θ₁ = n₂·sen θ₂ para calcular ángulos de refracción entre distintos medios.",
    "Usar la ecuación de lentes 1/f = 1/dₒ + 1/dᵢ para determinar la posición y tipo de imagen formada.",
    "Explicar el principio de reflexión total interna y su condición (θ > θ_c) con su aplicación en fibra óptica.",
    "Resolver el reto evaluable de fenómenos ópticos de la práctica.",
  ],

  materiales: [
    { nombre: "Banco óptico 3D", detalle: "Simulación de lentes convergente/divergente, espejos y refracción", icono: "fa-glasses" },
    { nombre: "Modo lentes", detalle: "Ecuación de Gauss 1/f = 1/dₒ + 1/dᵢ con trazado de rayos principales", icono: "fa-circle-half-stroke" },
    { nombre: "Modo espejos", detalle: "Espejo plano, cóncavo y convexo: imagen real o virtual", icono: "fa-mirror" },
    { nombre: "Modo refracción", detalle: "Ley de Snell entre 4 medios (aire, agua, vidrio, diamante) + ángulo crítico", icono: "fa-water" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Reflexión de la luz", definicion: "Ley de Reflexión: θᵢ = θᵣ. El ángulo de incidencia es igual al ángulo de reflexión, ambos medidos desde la normal. Reflexión especular (espejo pulido): forma imagen. Reflexión difusa (superficie rugosa): dispersa los rayos." },
    { termino: "Refracción y Ley de Snell", definicion: "La luz cambia de dirección al pasar de un medio a otro: n₁·sen θ₁ = n₂·sen θ₂. Al ir a un medio más denso (n mayor) el rayo se acerca a la normal; al ir a uno menos denso se aleja. Índice de refracción: n = c/v." },
    { termino: "Reflexión total interna", definicion: "Cuando la luz viaja de un medio más denso a uno menos denso y supera el ángulo crítico θ_c = arcsen(n₂/n₁), la luz no se refracta: se refleja totalmente. Base de la fibra óptica (TELMEX, Totalplay)." },
    { termino: "Ecuación de Gauss (lentes)", definicion: "1/f = 1/dₒ + 1/dᵢ. Relaciona distancia focal f, distancia objeto dₒ y distancia imagen dᵢ. Aumento: M = −dᵢ/dₒ. Lente convergente: f > 0; divergente: f < 0." },
    { termino: "Dispersión", definicion: "El índice de refracción varía con la longitud de onda. La luz violeta (λ corta) se refracta más que la roja (λ larga), separando la luz blanca en el espectro visible. Causa el arcoíris y los colores del prisma." },
  ],

  // Glosario — VERBATIM de A5 «Glosario — Óptica: reflexión, refracción y dispersión».
  glosario: [
    {
      termino: "Reflexión de la luz",
      definicion: "Cambio de dirección de la luz al rebotar sobre una superficie. Ley: el ángulo de incidencia θᵢ es igual al ángulo de reflexión θᵣ (ambos medidos respecto a la normal). Reflexión especular: superficie lisa. Reflexión difusa: superficie rugosa.",
    },
    {
      termino: "Refracción de la luz",
      definicion: "Cambio de dirección y velocidad de la luz al pasar de un medio a otro con diferente índice de refracción. Ley de Snell: n₁·sen(θ₁) = n₂·sen(θ₂).",
    },
    {
      termino: "Índice de refracción (n)",
      definicion: "Razón entre la velocidad de la luz en el vacío (c) y su velocidad en el medio: n = c/v. El vacío tiene n = 1. Medios más densos tienen mayor n (aire ≈ 1.00, agua ≈ 1.33, vidrio ≈ 1.5, diamante ≈ 2.42).",
    },
    {
      termino: "Dispersión de la luz",
      definicion: "Separación de la luz blanca en sus colores componentes porque el índice de refracción depende de la longitud de onda. La luz violeta se refracta más que la roja en el vidrio.",
    },
    {
      termino: "Reflexión total interna",
      definicion: "Cuando la luz viaja de un medio más denso a uno menos denso y el ángulo de incidencia supera el ángulo crítico, la luz se refleja totalmente sin refractarse. Base de las fibras ópticas.",
    },
    {
      termino: "Lentes convergentes y divergentes",
      definicion: "Lente convergente (convexa): refracta los rayos hacia el eje óptico; tiene foco real. Aplicaciones: lupas, cámaras, corrección de hipermetropía. Lente divergente (cóncava): dispersa los rayos; tiene foco virtual. Aplicaciones: corrección de miopía.",
    },
  ],

  aplicaciones: [
    "Las redes de fibra óptica de TELMEX y Totalplay en México usan reflexión total interna para proveer internet de banda ancha a millones de hogares.",
    "Los retrovisores de automóvil son espejos convexos: producen siempre imágenes virtuales, menores y con mayor campo visual.",
    "Las lentes correctivas (gafas y lentes de contacto) usan la ecuación de Gauss para corregir miopía (divergente) e hipermetropía (convergente).",
    "El CINVESTAV (Centro de Investigación y de Estudios Avanzados del IPN) es el principal centro de ciencia experimental de México, con laboratorios en Biología, Química, Física, Ingeniería y Biotecnología.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-V-P06.",
};
