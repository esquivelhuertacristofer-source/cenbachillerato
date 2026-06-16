/**
 * Datos puros del laboratorio de Conservación de la materia (CNEYT-I-P08).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A2
 * «Transformaciones de la materia y problemas ambientales». Se usa en la
 * tarjeta interactiva (parte B del tratamiento): el alumno responde el quiz
 * real dentro del lab.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-I-P08-A2 (quiz_multiple_opcion).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Transformaciones de la materia y problemas ambientales",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué establece la Ley de Conservación de la Materia?",
      opciones: [
        "La materia puede crearse en condiciones extremas de temperatura",
        "La masa total de los reactivos es igual a la de los productos: la materia no se crea ni se destruye",
        "La materia siempre se destruye en las reacciones químicas",
        "Solo se conserva la masa en las reacciones físicas",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La Ley de Lavoisier establece que la materia se transforma pero no se crea ni se destruye.",
    },
    {
      enunciado: "Cuando quemamos gasolina, ¿qué le pasa al carbono?",
      opciones: [
        "Desaparece completamente",
        "Se convierte en CO₂ que se libera a la atmósfera",
        "Se convierte en carbono sólido que cae al suelo",
        "Se almacena en el motor del auto",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Por la conservación de la materia, el carbono de la gasolina no desaparece: se convierte en CO₂, contribuyendo al cambio climático.",
    },
    {
      enunciado: "¿Cuál es la diferencia entre un cambio físico y un cambio químico?",
      opciones: [
        "El físico es reversible, el químico no",
        "En el físico no cambia la composición química; en el químico se forman nuevas sustancias",
        "El físico requiere calor, el químico no",
        "No hay diferencia práctica entre ellos",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "El cambio físico no altera la composición química (fusión del hielo); el cambio químico produce nuevas sustancias (combustión).",
    },
    {
      enunciado: "¿Por qué el plástico que tiramos al suelo es un problema ambiental a largo plazo?",
      opciones: [
        "Porque ocupa mucho espacio",
        "Porque se convierte en microplásticos que persisten en suelos, agua y cadenas alimentarias",
        "Porque es feo visualmente",
        "Porque atrae animales peligrosos",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Por conservación de la materia, el plástico no desaparece: se fragmenta en microplásticos que contaminan ecosistemas.",
    },
    {
      enunciado: "¿Cuál de estos es un ejemplo de cambio químico?",
      opciones: [
        "El agua al congelarse en hielo",
        "La sal al disolverse en agua",
        "La fotosíntesis de las plantas",
        "El vidrio al romperse",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "La fotosíntesis convierte CO₂ y agua en glucosa y oxígeno: hay nuevas sustancias, por lo tanto es un cambio químico.",
    },
  ],
};
