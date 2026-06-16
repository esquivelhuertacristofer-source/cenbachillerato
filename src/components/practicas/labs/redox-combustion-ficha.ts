/**
 * Datos de la Ficha Teórica del laboratorio de Redox y Combustión (CNEYT-IV-P09).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Ganar y perder electrones:
 * óxido-reducción y combustión» (lectura). El glosario es VERBATIM de la
 * actividad A5 «Glosario: óxido-reducción y combustión» (glosario_interactivo).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const REDOX_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-IV-P09 · A1 — Ganar y perder electrones: óxido-reducción y combustión",

  // Marco teórico — VERBATIM de la lectura A1 (párrafos).
  marcoTeorico: [
    "Muchas de las reacciones que mueven el mundo —desde la respiración de tus células hasta el motor de un autobús— son reacciones de ÓXIDO-REDUCCIÓN (o redox). La idea central es sencilla: en ellas hay TRANSFERENCIA DE ELECTRONES de una sustancia a otra. Siempre ocurren dos cosas al mismo tiempo: una especie se OXIDA (pierde electrones) y otra se REDUCE (gana electrones). No puede haber una sin la otra; por eso hablamos de óxido-REDUCCIÓN.",
    "OXIDACIÓN Y REDUCCIÓN. Una regla para recordarlo: «OPERA» (Oxidación Pierde Electrones; Reducción Añade). Quien cede electrones se oxida y se llama AGENTE REDUCTOR (porque provoca la reducción del otro). Quien gana electrones se reduce y se llama AGENTE OXIDANTE. Para llevar la cuenta usamos el NÚMERO DE OXIDACIÓN: una carga aparente que SUBE cuando un átomo se oxida y BAJA cuando se reduce. Ejemplo clásico: si sumerges una lámina de zinc en una disolución azul de sulfato de cobre, el zinc se oxida (Zn → Zn²⁺ + 2e⁻) y los iones cobre se reducen (Cu²⁺ + 2e⁻ → Cu). La reacción global es Zn + Cu²⁺ → Zn²⁺ + Cu: la lámina se cubre de cobre rojizo y la disolución se decolora.",
    "LA COMBUSTIÓN ES UN REDOX. Quemar algo es hacerlo reaccionar rápidamente con el oxígeno. En la combustión del metano, CH₄ + 2O₂ → CO₂ + 2H₂O, el carbono se oxida (pasa de número de oxidación −4 en CH₄ a +4 en CO₂) y el oxígeno se reduce. Es una reacción EXOTÉRMICA: libera mucha energía en forma de calor y luz (ΔH = −890 kJ/mol). Si hay oxígeno suficiente, la combustión es COMPLETA y produce CO₂ y agua; si falta oxígeno, es INCOMPLETA y genera monóxido de carbono (CO, un gas tóxico) y hollín. Por eso los calentadores de gas mal ventilados son peligrosos.",
    "LAS PILAS: REDOX QUE DA CORRIENTE. Si separamos las dos mitades de un redox en electrodos distintos y las unimos por un cable, los electrones se ven obligados a viajar por ese cable: eso es una PILA GALVÁNICA. En la pila de Daniell, el zinc se oxida en el ÁNODO (−) y los iones cobre se reducen en el CÁTODO (+); los electrones que circulan encienden un foco. La fuerza con que cada especie tiende a reducirse se mide con su POTENCIAL ESTÁNDAR DE REDUCCIÓN E° (en volts). El voltaje de la pila es E°pila = E°cátodo − E°ánodo. Para el Daniell: 0.34 − (−0.76) = +1.10 V. Que el resultado sea positivo indica que la reacción es espontánea.",
    "EN LA NATURALEZA Y LA VIDA. El redox está en todas partes. La RESPIRACIÓN CELULAR oxida la glucosa (C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O) para obtener energía: es la misma ecuación que la combustión, pero realizada por pasos y de forma controlada en tus células. La FOTOSÍNTESIS es el redox inverso: usa la energía del Sol para reducir el CO₂ a glucosa y liberar O₂. La HERRUMBRE es hierro que se oxida lentamente con el oxígeno y la humedad; se combate con galvanizado (recubrir con zinc, que se oxida «en su lugar»).",
    "IMPORTANCIA INDUSTRIAL. La combustión de hidrocarburos mueve coches, aviones y termoeléctricas; la metalurgia obtiene metales reduciendo sus minerales; las pilas y baterías —de la AA al litio del celular y a la batería del auto— almacenan energía como redox controlado. Comprender estas reacciones permite producir energía, proteger los metales de la corrosión y diseñar mejores baterías.",
  ],

  objetivos: [
    "Identificar la transferencia de electrones como base de toda reacción redox.",
    "Distinguir la oxidación de la reducción y señalar al agente oxidante y al reductor.",
    "Explicar por qué la combustión es un redox exotérmico y diferenciar combustión completa e incompleta.",
    "Calcular el potencial estándar de una pila con E°pila = E°cátodo − E°ánodo.",
    "Calcular la energía liberada por la combustión con Q = |ΔH|·n.",
    "Resolver el reto evaluable de la actividad A2 (pila de Daniell y combustión de metano).",
  ],

  materiales: [
    { nombre: "Modo Óxido-reducción", detalle: "Visualiza la transferencia de electrones en la reacción Zn + Cu²⁺", icono: "fa-atom" },
    { nombre: "Modo Combustión", detalle: "Observa la combustión del metano paso a paso", icono: "fa-fire" },
    { nombre: "Modo Pila galvánica", detalle: "Recorre la pila de Daniell: ánodo, cátodo y corriente", icono: "fa-car-battery" },
    { nombre: "Modo Comparar", detalle: "Contrasta los tres procesos en una sola tabla", icono: "fa-table-list" },
    { nombre: "Calculadora A2", detalle: "Elige pares redox y combustibles para calcular E°pila y Q", icono: "fa-calculator" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Óxido-reducción (redox)", definicion: "Reacción en la que hay transferencia de electrones de una especie a otra; oxidación y reducción ocurren siempre al mismo tiempo." },
    { termino: "Oxidación", definicion: "Proceso en que una especie PIERDE electrones; su número de oxidación SUBE. La especie que se oxida actúa como agente reductor." },
    { termino: "Reducción", definicion: "Proceso en que una especie GANA electrones; su número de oxidación BAJA. La especie que se reduce actúa como agente oxidante." },
    { termino: "Regla OPERA", definicion: "Mnemotecnia: Oxidación Pierde Electrones; Reducción Añade (electrones)." },
    { termino: "Número de oxidación", definicion: "Carga aparente de un átomo; sube al oxidarse (pierde e⁻) y baja al reducirse (gana e⁻). Ejemplo: C pasa de −4 en CH₄ a +4 en CO₂." },
    { termino: "Combustión completa vs. incompleta", definicion: "Con O₂ suficiente produce CO₂ y H₂O (completa); con poco O₂ genera CO tóxico y hollín (incompleta)." },
    { termino: "Potencial estándar de reducción (E°)", definicion: "Tendencia de una semirreacción a reducirse, medida en volts. E°pila = E°cátodo − E°ánodo; si es positivo, la reacción es espontánea." },
    { termino: "Entalpía de combustión (ΔH)", definicion: "Energía liberada al quemar 1 mol de combustible. Q = |ΔH|·n da la energía total para n moles." },
  ],

  // Glosario — VERBATIM de A5 (glosario_interactivo).
  glosario: [
    { termino: "Óxido-reducción (redox)", definicion: "Reacción en la que hay transferencia de electrones entre especies. Ejemplo: Zn + Cu²⁺ → Zn²⁺ + Cu." },
    { termino: "Oxidación", definicion: "Proceso en que una especie pierde electrones; su número de oxidación aumenta. Ejemplo: Zn → Zn²⁺ + 2e⁻ (el zinc se oxida)." },
    { termino: "Reducción", definicion: "Proceso en que una especie gana electrones; su número de oxidación disminuye. Ejemplo: Cu²⁺ + 2e⁻ → Cu (el cobre se reduce)." },
    { termino: "Agente reductor", definicion: "Especie que cede electrones (se oxida) y provoca la reducción de otra. Ejemplo: el zinc en la reacción con el cobre." },
    { termino: "Agente oxidante", definicion: "Especie que gana electrones (se reduce) y provoca la oxidación de otra. Ejemplo: el O₂ en una combustión; el Cu²⁺ frente al zinc." },
    { termino: "Número de oxidación", definicion: "Carga aparente de un átomo; sube al oxidarse y baja al reducirse. Ejemplo: el C pasa de −4 en CH₄ a +4 en CO₂." },
    { termino: "Combustión", definicion: "Reacción redox rápida de un combustible con oxígeno que libera calor y luz. Ejemplo: CH₄ + 2O₂ → CO₂ + 2H₂O + energía." },
    { termino: "Reacción exotérmica", definicion: "Reacción que libera energía al entorno; su ΔH es negativa. Ejemplo: toda combustión: el gas de la estufa al arder." },
    { termino: "Pila galvánica", definicion: "Dispositivo que aprovecha un redox espontáneo para producir corriente eléctrica. Ejemplo: la pila de Daniell Zn|Zn²⁺‖Cu²⁺|Cu, +1.10 V." },
    { termino: "Potencial estándar de reducción (E°)", definicion: "Tendencia de una semirreacción a reducirse, medida en volts frente al electrodo de hidrógeno. Ejemplo: E°(Cu²⁺/Cu) = +0.34 V; E°(Zn²⁺/Zn) = −0.76 V." },
  ],

  aplicaciones: [
    "La respiración celular oxida la glucosa en pasos controlados para obtener energía (ATP).",
    "Las baterías de litio de los teléfonos y los autos eléctricos funcionan por reacciones redox controladas.",
    "La galvanización recubre el hierro con zinc para que el zinc se oxide «en su lugar» y proteja al hierro de la corrosión.",
    "Las termoeléctricas y los motores de combustión interna queman hidrocarburos: redox exotérmico a gran escala.",
    "La metalurgia reduce minerales oxidados para obtener metales (p. ej., reducción de Fe₂O₃ con coque para producir hierro).",
  ],

  fuente:
    "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología IV «El poder de la química», CNEYT-IV-P09-A1 (lectura) y A5 (glosario_interactivo).",
};
