/**
 * Datos de la Ficha Teórica del laboratorio de Leyes de Newton.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-V-P01:
 *   - Marco teórico: lectura A1 «Leyes de Newton: inercia, F=ma y acción-reacción
 *     en la vida cotidiana».
 *   - Glosario: glosario interactivo A5 «Leyes de Newton y fuerzas».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const NEWTON_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-V · P01 · A1 — Leyes de Newton: inercia, F=ma y acción-reacción",

  // Marco teórico — VERBATIM de la lectura A1 (CNEYT-V-P01-A1).
  marcoTeorico: [
    "Isaac Newton formuló en 1687, en su obra Principia Mathematica, tres leyes que describen el movimiento de los cuerpos y las fuerzas que los producen. Estas leyes son la base de la mecánica clásica y siguen siendo esenciales para entender desde el movimiento de un automóvil en la autopista hasta el diseño de estructuras antisísmicas.",
    "La Primera Ley de Newton, o Ley de la Inercia, establece que un cuerpo permanece en reposo o en movimiento rectilíneo uniforme a menos que una fuerza neta actúe sobre él. La inercia es la resistencia de un cuerpo a cambiar su estado de movimiento y es proporcional a su masa. Ejemplo concreto: un camión cisterna de PEMEX que circula por la carretera México-Querétaro a 90 km/h lleva una masa de 30,000 kg. Si el conductor frena de golpe, la carga de líquido dentro del tanque tiende a continuar su movimiento hacia adelante por inercia —razón por la cual estos vehículos tienen deflectores internos para controlar el movimiento del fluido. En los accidentes viales, los ocupantes de un automóvil que no portan cinturón de seguridad son proyectados hacia adelante por exactamente este principio.",
    "La Segunda Ley de Newton establece que la fuerza neta que actúa sobre un cuerpo es igual a su masa multiplicada por la aceleración que adquiere: F = ma. Esta ley es cuantitativa: nos dice exactamente cuánta aceleración produce una fuerza dada sobre una masa conocida. Ejemplo mexicano: cuando un futbolista del Club América patea un balón de fútbol (masa ≈ 0.43 kg) con una fuerza de 215 N, la aceleración que imprime al balón es a = F/m = 215/0.43 ≈ 500 m/s². El balón sale disparado a alta velocidad en décimas de segundo. En ingeniería, esta misma ley permite calcular las fuerzas necesarias para que los elevadores del Edificio Torre Latinoamericana (Ciudad de México, 44 pisos) aceleren con pasajeros sin superar la capacidad estructural de los cables y motores.",
    "La Tercera Ley de Newton, o Ley de Acción-Reacción, establece que cuando un cuerpo A ejerce una fuerza sobre un cuerpo B, este ejerce sobre A una fuerza de igual magnitud, misma dirección y sentido contrario. Las fuerzas siempre aparecen en pares sobre cuerpos distintos. Ejemplo: los motores de cohete funcionan exactamente por esta ley —expulsan gases hacia atrás (acción) y el cohete es impulsado hacia adelante (reacción). La Agencia Espacial Mexicana (AEM) trabaja en proyectos de satélites que se posicionan mediante pequeños propulsores basados en este principio.",
    "Los diagramas de cuerpo libre (DCL) son herramientas que representan todas las fuerzas que actúan sobre un objeto: el peso (W = mg, hacia abajo), la fuerza normal (N, perpendicular a la superficie, hacia arriba en plano horizontal), la tensión (T, a lo largo de cuerdas o cables), y la fricción (f, paralela a la superficie, oponiéndose al movimiento). En un plano inclinado, el peso se descompone en una componente paralela al plano (W sin θ, que impulsa hacia abajo por el plano) y una componente perpendicular (W cos θ, igual y opuesta a la normal). La fricción tiene dos variedades: estática (impide el movimiento antes de que comience, f_e ≤ μ_e · N) y cinética (actúa durante el movimiento, f_c = μ_c · N, con μ_c < μ_e siempre).",
    "Aplicación sísmica: durante el sismo del 19 de septiembre de 2017 en México (M7.1), los edificios experimentaron fuerzas horizontales masivas. Las normas sísmicas del Reglamento de Construcciones del DF (hoy CDMX) utilizan la Segunda Ley de Newton para calcular las fuerzas sísmicas de diseño: F_sísmica = masa del edificio × aceleración del suelo. Edificios correctamente diseñados con marcos dúctiles y aisladores sísmicos pudieron disipar estas fuerzas sin colapsar, salvando miles de vidas.",
  ],

  objetivos: [
    "Enunciar las tres leyes de Newton y distinguirlas entre sí con ejemplos cotidianos.",
    "Aplicar F = ma para calcular fuerza, masa o aceleración dados los otros dos valores.",
    "Identificar pares acción-reacción en situaciones reales (caminar, nadar, cohetes).",
    "Analizar situaciones de equilibrio (fuerza neta = 0) y de aceleración (fuerza neta ≠ 0).",
    "Resolver el reto evaluable de la actividad sobre las leyes de Newton.",
  ],

  materiales: [
    { nombre: "Simulador DCL 3D", detalle: "Diagrama de cuerpo libre interactivo con fuerzas a escala", icono: "fa-arrows-up-down-left-right" },
    { nombre: "Plano horizontal", detalle: "Caja con peso, normal, fricción y fuerza aplicada", icono: "fa-minus" },
    { nombre: "Plano inclinado", detalle: "Descomposición del peso: W·senθ y W·cosθ; ángulo 0–60°", icono: "fa-mountain" },
    { nombre: "Sistema con polea", detalle: "Masa en mesa + masa colgante; tensión y fricción", icono: "fa-circle-dot" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Primera Ley de Newton (Inercia)", definicion: "Un cuerpo permanece en reposo o en movimiento rectilíneo uniforme a menos que una fuerza neta actúe sobre él. La inercia es proporcional a la masa del cuerpo." },
    { termino: "Segunda Ley de Newton (F = ma)", definicion: "La fuerza neta sobre un cuerpo es igual a su masa multiplicada por su aceleración: F = ma. La aceleración es directamente proporcional a la fuerza e inversamente proporcional a la masa." },
    { termino: "Tercera Ley de Newton (Acción-Reacción)", definicion: "Cuando un cuerpo A ejerce una fuerza sobre un cuerpo B, B ejerce sobre A una fuerza de igual magnitud, misma dirección y sentido contrario. Las fuerzas siempre aparecen en pares sobre cuerpos distintos." },
    { termino: "Diagrama de Cuerpo Libre (DCL)", definicion: "Representación que muestra todas las fuerzas que actúan sobre un objeto aislado: peso (W=mg), normal (N), fricción (f), tensión (T) y fuerza aplicada (F). Las flechas son proporcionales a la magnitud." },
    { termino: "Fricción estática y cinética", definicion: "La fricción estática (f_e ≤ μ_e·N) impide el movimiento antes de que comience. La fricción cinética (f_c = μ_c·N) actúa durante el movimiento y siempre μ_c < μ_e." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 (CNEYT-V-P01-A5).
  glosario: [
    { termino: "Inercia", definicion: "Tendencia de un cuerpo a resistir cambios en su estado de movimiento. Un objeto en reposo tiende a permanecer en reposo y uno en movimiento tiende a seguir moviéndose con la misma velocidad y dirección." },
    { termino: "Fuerza neta (resultante)", definicion: "Suma vectorial de todas las fuerzas que actúan sobre un cuerpo. Si la fuerza neta es cero, el cuerpo se encuentra en equilibrio (reposo o movimiento rectilíneo uniforme)." },
    { termino: "Segunda ley de Newton (F = ma)", definicion: "La fuerza neta sobre un cuerpo es igual al producto de su masa por su aceleración: F = ma. La aceleración es directamente proporcional a F e inversamente proporcional a m." },
    { termino: "Tercera ley de Newton (acción y reacción)", definicion: "Por cada fuerza de acción que un cuerpo A ejerce sobre un cuerpo B, existe una fuerza de reacción de B sobre A, igual en magnitud, misma línea de acción y sentido contrario." },
    { termino: "Peso y masa", definicion: "La masa (kg) es la cantidad de materia de un cuerpo; el peso (N) es la fuerza gravitacional que actúa sobre ella: W = mg, donde g ≈ 9.8 m/s² en la superficie terrestre." },
    { termino: "Fricción (rozamiento)", definicion: "Fuerza de contacto que se opone al movimiento o al intento de movimiento entre dos superficies. Puede ser estática (objeto en reposo) o cinética (objeto en movimiento)." },
  ],

  aplicaciones: [
    "Los cinturones de seguridad protegen a los ocupantes de vehículos aplicando la Primera Ley: sin cinturón, la inercia proyecta al pasajero hacia adelante al frenar.",
    "El diseño sísmico de edificios en México (Reglamento CDMX) usa F = ma para calcular fuerzas sísmicas de diseño: F_sísmica = masa × aceleración del suelo.",
    "Los cohetes y satélites (incluido Mexsat, operado por la SCT) se propulsan y orientan mediante la Tercera Ley: expulsión de gas (acción) genera empuje (reacción).",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-V-P01. Ref: Serway & Jewett, Física para Ciencias e Ingeniería (9ª ed.); UNAM CENAPRED.",
};
