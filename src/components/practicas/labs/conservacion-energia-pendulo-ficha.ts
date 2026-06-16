/**
 * Datos de la Ficha Teórica del laboratorio de Conservación de la energía (péndulo).
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-II-P02:
 *   - Marco teórico: lectura A1 «Transformación y conservación de la energía»
 *     (5 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Glosario: transformación y conservación».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const CONSERVACION_ENERGIA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-II · P02 · A1 — Transformación y conservación de la energía",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Uno de los principios más fundamentales de la física es la ley de conservación de la energía, también llamada primer principio de la termodinámica: la energía no se crea ni se destruye, solo se transforma de una forma a otra. La cantidad total de energía en un sistema cerrado permanece constante.",
    "Existen varios tipos de energía. La energía cinética es la energía del movimiento: cualquier objeto que se mueve la posee. La energía potencial gravitatoria es la energía almacenada en la posición de un objeto respecto al suelo: una roca en lo alto de una montaña tiene más energía potencial que la misma roca al pie de ella. La energía potencial elástica es la almacenada en objetos deformados que pueden recuperar su forma, como un resorte comprimido. La energía térmica es la energía asociada al movimiento de las partículas que forman una sustancia: a mayor temperatura, mayor energía térmica. La energía química está almacenada en los enlaces entre átomos de las moléculas: los alimentos, el combustible y las baterías son reservas de energía química. La energía eléctrica es la asociada al movimiento de cargas eléctricas.",
    "Las transformaciones de energía ocurren constantemente en nuestra vida cotidiana. Cuando una pila química alimenta un foco LED, la energía química de la pila se convierte en energía eléctrica que fluye por el circuito y luego en energía luminosa (luz) y una pequeña cantidad de energía térmica (calor). Cuando una plancha eléctrica funciona, convierte energía eléctrica en energía térmica. Cuando un motor eléctrico mueve un ventilador, convierte energía eléctrica en energía cinética del movimiento del aire.",
    "La eficiencia energética es el porcentaje de energía de entrada que se convierte en energía útil. Un foco incandescente tiene una eficiencia de solo 5%: el 95% de la energía eléctrica se convierte en calor, no en luz. Un foco LED tiene una eficiencia de 25-30%, razón por la que consume mucha menos electricidad para producir la misma cantidad de luz.",
    "México generó aproximadamente 324 TWh de energía eléctrica en 2023 (CFE). Para producir esa energía de manera más limpia, el país ha desarrollado proyectos de energías renovables: parques eólicos en el Istmo de Tehuantepec en Oaxaca, plantas solares en el desierto de Sonora y aprovechamiento de la energía geotérmica en Michoacán, donde el calor interno de la tierra se convierte en electricidad.",
  ],

  objetivos: [
    "Comprender la ley de conservación de la energía: la energía no se crea ni se destruye, solo se transforma.",
    "Identificar los tipos de energía (cinética, potencial, térmica, química, eléctrica) y cómo se transforman entre sí.",
    "Observar en el péndulo cómo la energía potencial se convierte en cinética y viceversa, manteniendo constante su suma.",
    "Reconocer que la fricción no destruye la energía mecánica: la transforma en energía térmica (calor).",
    "Resuelve el reto evaluable de la actividad A2.",
  ],

  materiales: [
    { nombre: "Péndulo 3D", detalle: "Masa colgada de un hilo que oscila intercambiando energía potencial y cinética", icono: "fa-atom" },
    { nombre: "Selector de gravedad", detalle: "Cambia el planeta (g) para ver cómo afecta la energía y el periodo", icono: "fa-globe" },
    { nombre: "Control de fricción", detalle: "Disipa la energía mecánica como calor hasta detener el péndulo", icono: "fa-fire" },
    { nombre: "Lecturas del experimento", detalle: "Altura máxima, energía E₀, rapidez máxima y periodo", icono: "fa-magnifying-glass-chart" },
  ],

  // Conceptos centrales del lab — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Ley de conservación de la energía", definicion: "Primer principio de la termodinámica: la energía no se crea ni se destruye, solo se transforma de una forma a otra. La energía total de un sistema cerrado permanece constante." },
    { termino: "Energía cinética", definicion: "La energía del movimiento: cualquier objeto que se mueve la posee. En el punto más bajo del péndulo es máxima." },
    { termino: "Energía potencial gravitatoria", definicion: "Energía almacenada en la posición de un objeto respecto al suelo: cuanto más alto está, más energía potencial tiene. En lo alto del péndulo es máxima." },
    { termino: "Energía térmica", definicion: "Energía asociada al movimiento de las partículas de una sustancia: a mayor temperatura, mayor energía térmica. La fricción transforma energía mecánica en energía térmica." },
    { termino: "Eficiencia energética", definicion: "Porcentaje de energía de entrada que se convierte en energía útil. Un foco LED (25-30%) es más eficiente que uno incandescente (5%)." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P02.
  glosario: [
    { termino: "Transformación de energía", definicion: "Cambio de la energía de una forma a otra." },
    { termino: "Transferencia de energía", definicion: "Paso de energía de un cuerpo o sistema a otro." },
    { termino: "Conservación de la energía", definicion: "Principio según el cual la energía no se crea ni se destruye, solo se transforma." },
    { termino: "Energía total", definicion: "Suma de todas las formas de energía de un sistema; en un sistema aislado se mantiene constante." },
  ],

  aplicaciones: [
    "Cuando una pila química alimenta un foco LED, la energía química se transforma en eléctrica y luego en luminosa y térmica.",
    "México ha desarrollado parques eólicos en el Istmo de Tehuantepec (Oaxaca) y plantas solares en el desierto de Sonora.",
    "La planta geotérmica de Cerro Prieto en Baja California es la más grande de América Latina: convierte el calor del interior de la Tierra en electricidad.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, CNEYT-II-P02.",
};
