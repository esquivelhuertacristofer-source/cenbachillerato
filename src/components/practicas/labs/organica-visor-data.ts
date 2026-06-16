/**
 * Datos puros del laboratorio Visor de Química Orgánica (CNEYT-IV-P04).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A2
 * «Grupos funcionales y nomenclatura: quiz de química orgánica».
 * Se usa en la tarjeta interactiva (parte B del tratamiento): el alumno
 * responde el quiz real dentro del lab.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-IV-P04-A2 (quiz_multiple_opcion).
// Fuente: scripts/_sem4_dump.txt líneas 1116–1179.
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Grupos funcionales y nomenclatura: quiz de química orgánica",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál es el grupo funcional que define a los alcoholes?",
      opciones: [
        "–COOH (carboxilo)",
        "–OH (hidroxilo)",
        "–NH₂ (amino)",
        "C=C (doble enlace)",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El grupo –OH (hidroxilo) es el grupo funcional de los alcoholes. El etanol (C₂H₅OH) es el alcohol de las bebidas fermentadas; el metanol (CH₃OH) es el alcohol tóxico. Ambos tienen –OH pero son moléculas distintas con efectos biológicos completamente diferentes.",
    },
    {
      enunciado: "El metano (CH₄), el etano (C₂H₆) y el propano (C₃H₈) pertenecen a la familia de los:",
      opciones: [
        "Alquenos",
        "Alquinos",
        "Alcanos",
        "Ácidos carboxílicos",
      ],
      respuestaCorrecta: 2,
      retroalimentacion:
        "Son alcanos: hidrocarburos con solo enlaces simples C–C. Su fórmula general es CₙH₂ₙ₊₂. El metano es el gas natural; el propano y butano forman el gas LP que se usa en millones de hogares mexicanos para cocinar.",
    },
    {
      enunciado: "El ácido acético (CH₃COOH) contiene el grupo funcional:",
      opciones: [
        "Hidroxilo (–OH)",
        "Carboxilo (–COOH)",
        "Amino (–NH₂)",
        "Aldehído (–CHO)",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El grupo carboxilo (–COOH) define a los ácidos carboxílicos. El ácido acético al 5-8% es el vinagre; el ácido cítrico (con 3 grupos –COOH) es el responsable del sabor ácido del limón. México es el principal productor mundial de limón persa.",
    },
    {
      enunciado: "¿Cuál de estas propiedades distingue a los alquenos de los alcanos?",
      opciones: [
        "Los alquenos contienen solo hidrógeno; los alcanos, solo carbono",
        "Los alquenos tienen al menos un doble enlace C=C que los hace más reactivos que los alcanos",
        "Los alquenos son gases; los alcanos son siempre líquidos",
        "Los alquenos son más estables químicamente que los alcanos",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El doble enlace C=C en los alquenos puede romperse para agregar otros átomos (reacciones de adición), haciéndolos mucho más reactivos. El etileno (eteno, C₂H₄) es el alqueno más simple y el compuesto orgánico más producido industrialmente: base del polietileno y del PVC.",
    },
    {
      enunciado:
        "¿Por qué el etanol (C₂H₅OH) y el metanol (CH₃OH) tienen efectos biológicos tan distintos si ambos son alcoholes?",
      opciones: [
        "Son exactamente iguales en sus efectos; el nombre cambia pero la molécula es la misma",
        "Difieren solo en una longitud de cadena: el metanol se metaboliza en formaldehído y ácido fórmico, que son altamente tóxicos; el etanol se metaboliza en acetaldehído y ácido acético, mucho menos tóxicos en dosis moderadas",
        "El metanol es más dulce, por eso se prefiere en bebidas alcohólicas fraudulentas",
        "No hay diferencia en toxicidad; la dosis es lo único que importa",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El metanol se metaboliza por la enzima alcohol deshidrogenasa en formaldehído (CH₂O) y luego en ácido fórmico (HCOOH), que destruyen el nervio óptico y pueden causar acidosis severa y muerte. El etanol produce acetaldehído y ácido acético, metabolizados más fácilmente. La diferencia de un grupo –CH₂– cambia completamente la toxicidad.",
    },
  ],
};
