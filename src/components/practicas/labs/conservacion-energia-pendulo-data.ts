/**
 * Datos puros del laboratorio de Conservación de la energía: el péndulo (CNEYT-II-P02).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A2 «¿Verdadero o
 * falso? Principio de conservación» (quiz_verdadero_falso). Se usa en la tarjeta
 * interactiva (parte B del tratamiento): el alumno responde el quiz real dentro
 * del lab. Cada enunciado verdadero/falso se adapta a RetoQuizCard como un
 * reactivo con dos opciones ("Verdadero", "Falso").
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-II-P02-A2 (quiz_verdadero_falso), adaptado a opción binaria.
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Verdadero o falso? Principio de conservación",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "La energía puede crearse a partir de la nada si la temperatura es suficientemente alta.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "El principio de conservación de la energía establece que la energía total se conserva: no se crea ni se destruye, solo se transforma.",
    },
    {
      enunciado: "En un péndulo ideal (sin fricción), la suma de energía cinética y potencial se mantiene constante.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. En un sistema conservativo sin fricción, la energía mecánica total (Ec + Ep) se conserva en todo momento.",
    },
    {
      enunciado: "Una máquina de eficiencia del 100% es teóricamente posible si se diseña con suficiente tecnología.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "La segunda ley de la termodinámica prohíbe las máquinas de eficiencia 100%: siempre hay pérdida de energía útil por entropía.",
    },
    {
      enunciado: "Los paneles solares fotovoltaicos convierten energía luminosa en energía eléctrica.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. El efecto fotovoltaico convierte fotones de luz en corriente eléctrica mediante células semiconductoras de silicio.",
    },
    {
      enunciado: "La energía que se 'pierde' por calor en un motor es literalmente destruida.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "No se destruye: se transforma en energía térmica de baja calidad que se disipa en el ambiente, aumentando la entropía.",
    },
    {
      enunciado: "La eficiencia de un sistema se puede calcular como: eficiencia = (energía útil / energía total entrada) × 100%.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. Esta es la definición de eficiencia energética; cuanto más se acerca al 100%, menos energía se 'desperdicia'.",
    },
  ],
};
