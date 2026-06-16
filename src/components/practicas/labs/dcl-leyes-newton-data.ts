/**
 * Datos puros del laboratorio de Leyes de Newton (CNEYT-V-P01).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A3
 * «¿Cuánto sabes sobre las leyes de Newton?». Se usa en la tarjeta
 * interactiva (parte B del tratamiento): el alumno responde el quiz real
 * dentro del lab.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-V-P01-A3 (quiz_multiple_opcion).
// respuestaCorrecta es 0-based (el dump ya lo entrega en base-0).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Cuánto sabes sobre las leyes de Newton?",
  puntajeMinimo: 70, // puntaje_minimo_aprobacion verbatim del ancla
  reactivos: [
    {
      // CNEYT-V-P01-A3 — pregunta 1
      enunciado:
        "Un pasajero en un autobús sin cinturón de seguridad es proyectado hacia adelante cuando el conductor frena de golpe. ¿Qué ley de Newton explica este fenómeno?",
      opciones: [
        "Segunda Ley (F=ma): el conductor frena con mucha fuerza",
        "Primera Ley (inercia): el pasajero tiende a mantener su movimiento hacia adelante",
        "Tercera Ley: el asiento ejerce una fuerza sobre el pasajero",
        "Ley de Gravitación Universal",
      ],
      respuestaCorrecta: 1, // 0-based: opción B
      retroalimentacion:
        "Primera Ley de Newton (inercia): el pasajero tiene una velocidad hacia adelante; al frenar el autobús, el pasajero no tiene fuerza que cambie su estado de movimiento, por lo que sigue moviéndose hacia adelante. El cinturón de seguridad proporciona esa fuerza de frenado para protegerlo.",
    },
    {
      // CNEYT-V-P01-A3 — pregunta 2
      enunciado:
        "Si se aplica una fuerza neta de 180 N a un objeto de 60 kg, ¿cuál es su aceleración?",
      opciones: [
        "10,800 m/s²",
        "0.33 m/s²",
        "3 m/s²",
        "120 m/s²",
      ],
      respuestaCorrecta: 2, // 0-based: opción C
      retroalimentacion:
        "Segunda Ley: a = F/m = 180/60 = 3 m/s². La aceleración es directamente proporcional a la fuerza e inversamente proporcional a la masa. Si se duplica la fuerza manteniendo la misma masa, la aceleración también se duplica.",
    },
    {
      // CNEYT-V-P01-A3 — pregunta 3
      enunciado:
        "Un cohete expulsa gases hacia abajo y el cohete sube. ¿Cuál ley de Newton describe esta situación?",
      opciones: [
        "Primera ley: el cohete en reposo tiende a permanecer en reposo",
        "Segunda ley: los gases tienen mayor masa que el cohete",
        "Tercera ley: los gases son expulsados hacia abajo (acción) y el cohete es impulsado hacia arriba (reacción)",
        "Ley de Gravitación Universal",
      ],
      respuestaCorrecta: 2, // 0-based: opción C
      retroalimentacion:
        "Tercera Ley (acción-reacción): el motor expulsa gases hacia abajo con cierta fuerza (acción); por la Tercera Ley, los gases ejercen sobre el cohete una fuerza igual y opuesta hacia arriba (reacción). Toda la propulsión espacial, incluida la de los satélites Mexsat, se basa en este principio.",
    },
    {
      // CNEYT-V-P01-A3 — pregunta 4
      enunciado: "¿Cuál es la diferencia entre masa y peso?",
      opciones: [
        "Son exactamente lo mismo, se miden en kilogramos",
        "La masa mide la cantidad de materia (kg, constante); el peso es la fuerza gravitacional sobre esa masa (N, varía según el lugar)",
        "El peso se mide en kg y la masa en N",
        "La masa varía con la altitud; el peso es constante",
      ],
      respuestaCorrecta: 1, // 0-based: opción B
      retroalimentacion:
        "La masa (kg) es una propiedad intrínseca del cuerpo, mide la cantidad de materia y no cambia. El peso (N) es la fuerza gravitacional W = mg; depende de g, que varía según el cuerpo celeste. En la Tierra: g = 9.8 m/s². En la Luna: g = 1.62 m/s². Una persona de 70 kg tiene siempre 70 kg de masa pero pesa 686 N en la Tierra y solo 113 N en la Luna.",
    },
    {
      // CNEYT-V-P01-A3 — pregunta 5
      enunciado:
        "En un plano inclinado sin fricción a 30°, ¿cuál es la aceleración de un bloque de masa m que desliza hacia abajo?",
      opciones: [
        "g (9.8 m/s²)",
        "g × cos 30° ≈ 8.49 m/s²",
        "g × sen 30° = 4.9 m/s²",
        "0 m/s² (el bloque no se mueve sin fricción)",
      ],
      respuestaCorrecta: 2, // 0-based: opción C
      retroalimentacion:
        "La fuerza que impulsa el bloque hacia abajo del plano es la componente del peso paralela al plano: F = mg·sen θ. Aplicando F = ma: ma = mg·sen 30° → a = g·sen 30° = 9.8 × 0.5 = 4.9 m/s². Sin fricción, todos los bloques (sin importar su masa) bajan con la misma aceleración de 4.9 m/s².",
    },
  ],
};
