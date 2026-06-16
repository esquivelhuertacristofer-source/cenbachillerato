/**
 * Datos puros del laboratorio de Formas y transformación de la energía
 * (CNEYT-II-P01).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A2 «¿Qué tipo de
 * energía es cada caso?». Se usa en la tarjeta interactiva (parte B del
 * tratamiento): el alumno responde el quiz real dentro del lab.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-II-P01-A2 (quiz_multiple_opcion).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Qué tipo de energía es cada caso?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Un automóvil en movimiento tiene principalmente:",
      opciones: [
        "Energía potencial gravitacional",
        "Energía cinética",
        "Energía luminosa",
        "Energía química almacenada",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La energía cinética es la energía del movimiento; depende de la masa y la velocidad: Ec = ½mv².",
    },
    {
      enunciado: "Una presa hidroeléctrica almacena principalmente energía:",
      opciones: [
        "Cinética",
        "Eléctrica",
        "Potencial gravitacional",
        "Térmica",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "El agua retenida en la presa tiene energía potencial gravitacional que se libera al caer y mover las turbinas.",
    },
    {
      enunciado: "¿Qué transformación energética ocurre en una bombilla eléctrica incandescente?",
      opciones: [
        "Energía química → energía eléctrica",
        "Energía eléctrica → energía luminosa y energía térmica",
        "Energía cinética → energía eléctrica",
        "Energía solar → energía eléctrica",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La bombilla incandescente convierte energía eléctrica principalmente en calor (~95%) y luz (~5%).",
    },
    {
      enunciado: "La energía química almacenada en los alimentos se convierte en nuestro cuerpo en:",
      opciones: [
        "Solo energía eléctrica",
        "Energía mecánica (movimiento) y energía térmica (calor corporal)",
        "Solo energía luminosa",
        "Energía potencial gravitacional únicamente",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "El metabolismo convierte la energía química de los alimentos en energía mecánica para moverse y calor para mantener la temperatura corporal.",
    },
    {
      enunciado: "¿Cuál es la unidad de energía en el Sistema Internacional?",
      opciones: [
        "Watt (W)",
        "Newton (N)",
        "Joule (J)",
        "Caloria (cal)",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "El Joule (J) es la unidad de energía y trabajo en el SI. El Watt es la unidad de potencia (J/s).",
    },
  ],
};
