/**
 * Datos de la Ficha Teórica del laboratorio Círculo unitario (PM-IV-P04).
 *
 * Marco teórico: VERBATIM de la actividad ancla A1 «El círculo unitario:
 * valores exactos de seno, coseno y tangente» (infografía, puntos_clave).
 * Glosario: VERBATIM de A5 «Glosario — Círculo unitario y trigonometría
 * extendida» (glosario_interactivo).
 * El reto evaluable vive en circulo-unitario-data.ts (RETO_A2, ancla A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const CIRCULO_FICHA: FichaTeoricaData = {
  ancla: "PM-IV · P04 · A1 — El círculo unitario: seno, coseno y tangente aplicados a sismología y astronomía mexicanas",

  // Marco teórico — VERBATIM de A1 (puntos_clave de la infografía).
  marcoTeorico: [
    "El círculo unitario es una circunferencia de radio r = 1 centrada en el origen. Para cualquier punto P = (x, y) sobre el círculo, el ángulo θ con el eje positivo x define: cos θ = x y sen θ = y. Esta es la definición trigonométrica más general, válida para cualquier ángulo positivo, negativo o mayor de 360°.",
    "Ángulos y coordenadas exactas del primer cuadrante: 0° → (1, 0); 30° → (√3/2, 1/2); 45° → (√2/2, √2/2); 60° → (1/2, √3/2); 90° → (0, 1). Mnemotécnica: los numeradores del seno en 0°, 30°, 45°, 60°, 90° son √0, √1, √2, √3, √4 — todos divididos entre 2.",
    "Regla CAST para signos por cuadrante: Cuadrante I (0°–90°): todos positivos. Cuadrante II (90°–180°): solo Seno positivo. Cuadrante III (180°–270°): solo Tangente positiva. Cuadrante IV (270°–360°): solo Coseno positivo. CAST se lee de IV a I en sentido antihorario.",
    "Tangente: tan θ = sen θ / cos θ = y/x. Es indefinida cuando cos θ = 0 (en 90° y 270°), porque implica división por cero. Período de la tangente: 180° (π rad). Período del seno y coseno: 360° (2π rad).",
    "Periodicidad y ondas: la periodicidad de seno y coseno — sen(θ + 360°) = sen θ — es la base matemática de todas las oscilaciones periódicas en física: ondas sísmicas, ondas de sonido, corriente alterna eléctrica (60 Hz en México, estándar de la CFE).",
    "Aplicación sismológica: el análisis de Fourier descompone cualquier señal sísmica en sumas de senos y cosenos de distintas frecuencias. El CENAPRED (Centro Nacional de Prevención de Desastres) usa estas herramientas para analizar acelerogramas de terremotos como el de 1985 (8.1 Mw) y el de 2017 (7.1 Mw). El círculo unitario es la base matemática de ese análisis.",
    "Aplicación astronómica: el Gran Telescopio Milimétrico (GTM) del INAOE en el Volcán Sierra Negra (Puebla) apunta a coordenadas celestes expresadas en ángulos de ascensión recta y declinación. Los astrónomos transforman estas coordenadas usando seno y coseno para convertir entre sistemas de referencia ecuatorial y altazimutal.",
    "Radianes vs. grados: un radián es el ángulo central que subtiende un arco igual al radio. Relación: π rad = 180°, por tanto 30° = π/6, 45° = π/4, 60° = π/3, 90° = π/2. Los lenguajes de programación científica (Python, MATLAB) usados en el INAOE y el CINVESTAV trabajan en radianes por defecto.",
  ],

  objetivos: [
    "Usar el círculo unitario para determinar el seno y el coseno de cualquier ángulo como coordenadas (x, y) del punto sobre la circunferencia.",
    "Aplicar la regla CAST para determinar el signo de sen, cos y tan en cada cuadrante.",
    "Calcular valores exactos de razones trigonométricas para ángulos notables (0°, 30°, 45°, 60°, 90°, y sus análogos en otros cuadrantes).",
    "Identificar el ángulo de referencia de cualquier ángulo y usarlo para calcular razones trigonométricas fuera del primer cuadrante.",
    "Verificar la identidad pitagórica sen²θ + cos²θ = 1 con valores exactos.",
    "Resolver el ejercicio evaluable de valores trigonométricos exactos (A2).",
  ],

  materiales: [
    { nombre: "Círculo unitario 3D", detalle: "Gira el radio y observa el punto P = (cos θ, sen θ) en tiempo real", icono: "fa-compass-drafting" },
    { nombre: "Ángulos notables", detalle: "Valores exactos en 0°, 30°, 45°, 60°, 90° y sus análogos", icono: "fa-angle-up" },
    { nombre: "Regla CAST / signos", detalle: "Panel de cuadrantes con signo de sen, cos y tan", icono: "fa-compass" },
    { nombre: "Identidad pitagórica", detalle: "Verificación en vivo: sen²θ + cos²θ = 1 para cualquier θ", icono: "fa-square-root-variable" },
    { nombre: "Hélice (desfase 90°)", detalle: "La curva que revela que seno y coseno son sombras del mismo punto", icono: "fa-wave-square" },
  ],

  // Conceptos centrales — formulados a partir de la infografía A1 y el glosario A5.
  conceptos: [
    { termino: "Círculo unitario", definicion: "Circunferencia de radio 1 centrada en el origen del plano cartesiano. Para cualquier ángulo θ, el punto sobre el círculo es exactamente P = (cos θ, sen θ)." },
    { termino: "Seno (sen θ)", definicion: "Coordenada y del punto (cos θ, sen θ) sobre el círculo unitario. Función periódica con período 360° (2π rad), con valores entre −1 y 1." },
    { termino: "Coseno (cos θ)", definicion: "Coordenada x del punto (cos θ, sen θ) sobre el círculo unitario. Función periódica con período 360° (2π rad), con valores entre −1 y 1." },
    { termino: "Tangente (tan θ)", definicion: "Razón sen θ / cos θ. Es indefinida cuando cos θ = 0 (en 90° y 270°). Su período es 180° (π rad)." },
    { termino: "Identidad pitagórica", definicion: "sen²θ + cos²θ = 1 para cualquier ángulo θ. Es el Teorema de Pitágoras aplicado al triángulo inscrito en el círculo unitario (catetos sen y cos, hipotenusa = radio = 1)." },
    { termino: "Ángulo de referencia", definicion: "Ángulo agudo formado entre el lado terminal del ángulo y el eje x más cercano. Permite calcular razones trigonométricas de cualquier ángulo a partir de los valores del primer cuadrante." },
    { termino: "Radián", definicion: "Unidad de medida de ángulos. Un radián es el ángulo central que subtiende un arco igual al radio. Relación clave: π radianes = 180°." },
    { termino: "Análisis de Fourier", definicion: "Método matemático que descompone cualquier función periódica en una suma de senos y cosenos de distintas frecuencias y amplitudes. Es la herramienta central para analizar señales sísmicas, sonoras y eléctricas." },
  ],

  // Glosario VERBATIM de A5 (glosario_interactivo, campo "terminos").
  glosario: [
    {
      termino: "Círculo unitario",
      definicion: "Circunferencia de radio 1 centrada en el origen del plano cartesiano. Cada punto de la circunferencia es (cos θ, sen θ) para un ángulo θ.",
    },
    {
      termino: "Ángulo en posición estándar",
      definicion: "Ángulo con vértice en el origen y lado inicial sobre el eje x positivo. Se mide en sentido antihorario (positivo) o horario (negativo).",
    },
    {
      termino: "Signo por cuadrante (regla ACTS)",
      definicion: "Cuadrante I: todas positivas. Cuadrante II: solo seno (+). Cuadrante III: solo tangente (+). Cuadrante IV: solo coseno (+). Regla mnemotécnica: 'Todos Saben Tomar Café'.",
    },
    {
      termino: "Ángulo de referencia",
      definicion: "Ángulo agudo (0° a 90°) formado entre el lado terminal del ángulo y el eje x más cercano. Permite calcular razones trigonométricas de cualquier ángulo.",
    },
    {
      termino: "Valores en los ejes (ángulos cuadrantales)",
      definicion: "Para 0°, 90°, 180°, 270°, 360°: los puntos del círculo unitario dan valores exactos sin necesidad de ángulo de referencia.",
    },
    {
      termino: "Período de seno y coseno",
      definicion: "Las funciones seno y coseno son periódicas con período 360° (2π rad): sen(θ + 360°) = sen(θ) y cos(θ + 360°) = cos(θ).",
    },
  ],

  aplicaciones: [
    "El CENAPRED analiza acelerogramas de terremotos mexicanos (1985, 2017) descomponiendo las señales sísmicas en sumas de senos y cosenos (análisis de Fourier).",
    "El Gran Telescopio Milimétrico (GTM) del INAOE en el Volcán Sierra Negra (Puebla) usa seno y coseno para convertir coordenadas celestes entre sistemas de referencia ecuatorial y altazimutal.",
    "La corriente alterna eléctrica en México opera a 60 Hz (estándar CFE): su forma es exactamente una onda seno, descrita por el círculo unitario.",
    "Los lenguajes de programación científica (Python, MATLAB) usados en el INAOE y el CINVESTAV trabajan con ángulos en radianes, la unidad natural del círculo unitario.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Infografía A1, PM-IV-P04 (INAOE, CENAPRED, UNAM Instituto de Matemáticas).",
};
