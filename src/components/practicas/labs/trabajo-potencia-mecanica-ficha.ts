/**
 * Datos de la Ficha Teórica del laboratorio de Trabajo y potencia mecánica
 * (CNEYT-II-P05).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Trabajo y potencia mecánica:
 * fórmulas y contexto real» (lectura) para el marco teórico, y de la actividad
 * A5 «Glosario: energía mecánica» (glosario_interactivo) para el glosario. El
 * reto evaluable vive en trabajo-potencia-mecanica-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const TRABAJO_POTENCIA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-II · P05 · A1 — Trabajo y potencia mecánica: fórmulas y contexto real",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "En física, el trabajo mecánico tiene un significado preciso que difiere del cotidiano. Trabajo (W) es la transferencia de energía que ocurre cuando una fuerza desplaza un objeto en la dirección de esa fuerza. La fórmula es:\n\nW = F × d × cos θ\n\ndonde F es la magnitud de la fuerza (en Newtons), d es el desplazamiento (en metros) y θ es el ángulo entre la fuerza y el desplazamiento. La unidad de trabajo es el Joule (J): 1 J = 1 N·m.",
    "Si empujas una caja con 20 N a lo largo de 3 metros en la misma dirección de la fuerza (θ = 0°, cos 0° = 1), el trabajo realizado es 60 J. Si la fuerza es perpendicular al desplazamiento (θ = 90°, cos 90° = 0), el trabajo es cero (no hay transferencia de energía en la dirección del movimiento).",
    "La potencia (P) mide qué tan rápido se realiza trabajo. Es el trabajo realizado por unidad de tiempo:\n\nP = W / t\n\nLa unidad es el Watt (W): 1 W = 1 J/s. Un motor que realiza 600 J en 3 segundos tiene una potencia de 200 W. Los caballos de fuerza (hp) son otra unidad: 1 hp ≈ 746 W.",
    "Estas fórmulas permiten comparar máquinas: un motor de 2000 W hace el mismo trabajo que uno de 1000 W, pero en la mitad del tiempo. En la vida cotidiana, las bombillas, electrodomésticos y motores se etiquetan en Watts porque indica cuánta energía consumen o producen por segundo.",
  ],

  objetivos: [
    "Calcular el trabajo mecánico con W = F × d × cos θ y expresarlo en Joules.",
    "Reconocer que solo la parte de la fuerza alineada con el movimiento (F·cos θ) realiza trabajo.",
    "Comprender por qué una fuerza perpendicular (θ = 90°) realiza trabajo cero.",
    "Calcular la potencia con P = W / t y expresarla en Watts.",
    "Resolver el ejercicio de cálculo de trabajo y potencia en contexto (A2).",
  ],

  materiales: [
    { nombre: "Visor de trabajo 3D", detalle: "Caja empujada con fuerza F sobre una distancia d", icono: "fa-person-walking" },
    { nombre: "Descomposición de la fuerza", detalle: "Visualiza F·cos θ (útil) y F·sen θ (perpendicular)", icono: "fa-rotate" },
    { nombre: "Carrera de potencia", detalle: "Compara dos máquinas haciendo el mismo trabajo (t = W/P)", icono: "fa-gauge-high" },
    { nombre: "Lectura en vivo", detalle: "Trabajo en Joules y potencia en Watts/hp en tiempo real", icono: "fa-calculator" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Trabajo (W)", definicion: "Transferencia de energía cuando una fuerza desplaza un objeto en la dirección de esa fuerza: W = F × d × cos θ. Se mide en Joules (1 J = 1 N·m)." },
    { termino: "Potencia (P)", definicion: "Qué tan rápido se realiza trabajo: el trabajo realizado por unidad de tiempo, P = W / t. Se mide en Watts (1 W = 1 J/s)." },
    { termino: "Ángulo θ", definicion: "Ángulo entre la fuerza y el desplazamiento. Si θ = 0° (cos 0° = 1) todo el trabajo cuenta; si θ = 90° (cos 90° = 0) el trabajo es cero." },
    { termino: "Joule (J)", definicion: "Unidad de trabajo y de energía: 1 J = 1 N·m." },
    { termino: "Watt (W)", definicion: "Unidad de potencia: 1 W = 1 J/s. Los caballos de fuerza (hp) son otra unidad: 1 hp ≈ 746 W." },
  ],

  // Glosario — VERBATIM de A5 «Glosario: energía mecánica».
  glosario: [
    { termino: "Energía mecánica", definicion: "Suma de la energía cinética y la energía potencial de un cuerpo. Ejemplo: la energía total de una pelota que cae." },
    { termino: "Energía cinética (Ec)", definicion: "Energía debida al movimiento; Ec = ½mv². Ejemplo: un balón que rueda." },
    { termino: "Energía potencial (Ep)", definicion: "Energía almacenada por la posición; la gravitatoria es Ep = mgh. Ejemplo: una maceta en una repisa alta." },
    { termino: "Velocidad (v)", definicion: "Rapidez con dirección con que se mueve un cuerpo; se mide en m/s. Ejemplo: 60 km/h de un auto en carretera." },
    { termino: "Gravedad (g)", definicion: "Aceleración con que la Tierra atrae a los cuerpos, cercana a 9.8 m/s². Hace que los objetos caigan." },
  ],

  aplicaciones: [
    "Comparar motores y máquinas: uno de 2000 W hace el mismo trabajo que uno de 1000 W, pero en la mitad del tiempo.",
    "Entender por qué bombillas, electrodomésticos y motores se etiquetan en Watts: indica cuánta energía consumen o producen por segundo.",
    "Reconocer que cargar una mochila sin caminar no realiza trabajo mecánico, porque no hay desplazamiento.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, CNEYT-II-P05.",
};
