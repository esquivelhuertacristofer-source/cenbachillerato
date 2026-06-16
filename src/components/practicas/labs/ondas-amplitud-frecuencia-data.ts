/**
 * Datos puros del laboratorio de Ondas: amplitud, frecuencia y longitud de onda (CNEYT-V-P04).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A3
 * «¿Cuánto sabes sobre ondas mecánicas y sonido?».
 * Se usa en la tarjeta interactiva (parte B del tratamiento).
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-V-P04-A3 (quiz_multiple_opcion).
// respuestaCorrecta convertida a índice 0-based (el dump usa índice 0-based también).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Cuánto sabes sobre ondas mecánicas y sonido?",
  puntajeMinimo: 70,
  reactivos: [
    {
      // A3 pregunta 0 — respuesta_correcta: 2 → índice 0-based: 2
      enunciado: "¿Cuál de las siguientes ondas es una onda LONGITUDINAL?",
      opciones: [
        "Onda S sísmica (corte)",
        "Onda de luz visible",
        "Onda de sonido en el aire",
        "Onda en una cuerda de guitarra",
      ],
      respuestaCorrecta: 2,
      retroalimentacion:
        "Las ondas de sonido en el aire son longitudinales: las moléculas de aire se comprimen y se expanden en la misma dirección que la propagación de la onda. Las ondas en una cuerda de guitarra y las ondas S sísmicas son transversales; la perturbación es perpendicular a la propagación.",
    },
    {
      // A3 pregunta 1 — respuesta_correcta: 0 → índice 0-based: 0
      enunciado:
        "Una onda tiene frecuencia f = 440 Hz (nota La musical) y la velocidad del sonido en el aire es 340 m/s. ¿Cuál es su longitud de onda?",
      opciones: ["0.77 m", "149,600 m", "1.29 m", "440 m"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "λ = v/f = 340/440 ≈ 0.773 m ≈ 77 cm. La nota La de 440 Hz tiene una longitud de onda de 77 cm en el aire a temperatura ambiente.",
    },
    {
      // A3 pregunta 2 — respuesta_correcta: 1 → índice 0-based: 1
      enunciado:
        "El SASMEX (Sistema de Alerta Sísmica Mexicano) puede alertar a la CDMX antes de un sismo porque:",
      opciones: [
        "Los sensores predicen los sismos con días de anticipación",
        "Las ondas P (más rápidas, ~8 km/s) se detectan en la costa antes de que lleguen las destructivas ondas S (~4 km/s), y la alerta viaja a velocidad de la luz",
        "Los satélites Mexsat detectan los movimientos del fondo marino antes de que ocurra el sismo",
        "Las ondas S viajan más rápido que las ondas P",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El SASMEX aprovecha la diferencia de velocidad entre ondas P y S. Sensores en la costa del Pacífico (Guerrero, Oaxaca) detectan las ondas P (compresión, ~8 km/s, menos destructivas) y transmiten la alerta a la CDMX a velocidad de la luz (señal de radio), antes de que lleguen las ondas S (~4 km/s, más destructivas). El margen es de 40-120 segundos.",
    },
    {
      // A3 pregunta 3 — respuesta_correcta: 2 → índice 0-based: 2
      enunciado:
        "Una ambulancia de la Cruz Roja se acerca a 80 km/h emitiendo su sirena a 1,000 Hz. ¿Qué escucha un observador parado en la acera?",
      opciones: [
        "El mismo tono de 1,000 Hz sin cambios",
        "Un tono más grave (menor frecuencia) porque la ambulancia se acerca",
        "Un tono más agudo (mayor frecuencia) porque las ondas se comprimen frente a la ambulancia que se acerca",
        "No escucha nada porque el sonido no viaja si la fuente se mueve",
      ],
      respuestaCorrecta: 2,
      retroalimentacion:
        "Efecto Doppler: cuando la fuente se acerca, las ondas se comprimen frente a ella (menor λ, mayor f). El observador escucha un tono más agudo que los 1,000 Hz reales. Cuando la ambulancia se aleja, las ondas se expanden (mayor λ, menor f) y el tono baja. Este efecto es audible claramente cuando una ambulancia o un tren pasa a alta velocidad.",
    },
    {
      // A3 pregunta 4 — respuesta_correcta: 2 → índice 0-based: 2
      enunciado:
        "¿Cuál de las siguientes propiedades de una onda de sonido determina su VOLUMEN (intensidad percibida)?",
      opciones: [
        "La frecuencia (f)",
        "La longitud de onda (λ)",
        "La amplitud (A)",
        "La velocidad de propagación (v)",
      ],
      respuestaCorrecta: 2,
      retroalimentacion:
        "La amplitud de una onda sonora determina su volumen o intensidad: mayor amplitud = mayor desplazamiento de las moléculas de aire = mayor presión sonora = sonido más fuerte. La frecuencia determina el tono (agudo/grave). La velocidad depende del medio (340 m/s en aire a 20°C) y no cambia el volumen ni el tono.",
    },
  ],
};
