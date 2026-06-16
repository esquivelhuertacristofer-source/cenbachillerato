/**
 * Datos puros del laboratorio del Espectro Electromagnético (CNEYT-V-P05).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A2
 * «¿Cuánto sabes sobre el espectro electromagnético y sus aplicaciones?».
 * Se usa en la tarjeta interactiva (parte B del tratamiento): el alumno
 * responde el quiz real dentro del lab.
 *
 * Sin three: seguro de importar desde el shell del lab.
 *
 * Fuente: CNEYT-V-P05-A2 (quiz_multiple_opcion, estado=publicada).
 * respuestaCorrecta: índice 0-based (campo "respuesta_correcta" del dump es
 * ya 0-based — verificado pregunta a pregunta a continuación).
 *   P1: "Ondas de radio" → índice 2 ✓ (0-based)
 *   P2: "Pueden propagarse en el vacío…" → índice 2 ✓
 *   P3: "Las frecuencias de radio y televisión…" → índice 1 ✓
 *   P4: "3×10⁸ m/s" → índice 1 ✓
 *   P5: "Los rayos X y rayos gamma son ionizantes…" → índice 2 ✓
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-V-P05-A2 (quiz_multiple_opcion).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Cuánto sabes sobre el espectro electromagnético y sus aplicaciones?",
  puntajeMinimo: 70,
  reactivos: [
    {
      // respuesta_correcta=2 (0-based) → "Ondas de radio"
      enunciado:
        "¿Cuál de las siguientes regiones del espectro electromagnético tiene la MAYOR longitud de onda y la MENOR frecuencia?",
      opciones: [
        "Rayos gamma",
        "Luz ultravioleta",
        "Ondas de radio",
        "Rayos X",
      ],
      respuestaCorrecta: 2,
      retroalimentacion:
        "Las ondas de radio tienen la mayor longitud de onda (desde centímetros hasta kilómetros) y la menor frecuencia y energía del espectro. Los rayos gamma están en el extremo opuesto: menor longitud de onda y mayor frecuencia/energía.",
    },
    {
      // respuesta_correcta=2 (0-based) → "Pueden propagarse en el vacío…"
      enunciado:
        "Las ondas electromagnéticas se diferencian de las ondas mecánicas (como el sonido) en que:",
      opciones: [
        "Viajan más lento que el sonido",
        "No pueden transportar energía",
        "Pueden propagarse en el vacío sin necesidad de un medio material",
        "Solo se propagan en sólidos",
      ],
      respuestaCorrecta: 2,
      retroalimentacion:
        "Las ondas electromagnéticas no necesitan medio material para propagarse; viajan en el vacío a c = 3×10⁸ m/s. Por eso la luz del Sol llega hasta la Tierra a través del vacío del espacio interestelar. El sonido, en cambio, necesita un medio (aire, agua, sólido) y no se propaga en el vacío.",
    },
    {
      // respuesta_correcta=1 (0-based) → "Las frecuencias de radio y televisión…"
      enunciado:
        "El IFT (Instituto Federal de Telecomunicaciones) de México regula el uso de:",
      opciones: [
        "Los rayos X en hospitales",
        "Las frecuencias de radio y televisión del espectro radioeléctrico",
        "La energía de los rayos gamma en radioterapia",
        "El infrarrojo en cámaras de seguridad",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El IFT es el órgano regulador autónomo que administra y vigila el espectro radioeléctrico en México: concesiones de radio AM/FM, televisión abierta, telefonía celular (4G/5G), WiFi y otros servicios inalámbricos. Los rayos X son regulados por la COFEPRIS; los rayos gamma en medicina por la CNSNS (Comisión Nacional de Seguridad Nuclear y Salvaguardias).",
    },
    {
      // respuesta_correcta=1 (0-based) → "3×10⁸ m/s"
      enunciado: "La velocidad de la luz en el vacío es aproximadamente:",
      opciones: [
        "3×10⁶ m/s",
        "3×10⁸ m/s",
        "3×10¹⁰ m/s",
        "340 m/s",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "c ≈ 3×10⁸ m/s = 300,000 km/s. A esta velocidad, la luz tarda apenas 1.3 segundos en ir de la Luna a la Tierra, y 8 minutos en viajar del Sol a la Tierra. Las 340 m/s son la velocidad del sonido en el aire, no de la luz.",
    },
    {
      // respuesta_correcta=2 (0-based) → "Los rayos X y rayos gamma son ionizantes…"
      enunciado:
        "¿Cuál de las siguientes afirmaciones sobre la radiación ionizante es CORRECTA?",
      opciones: [
        "Las ondas de radio son ionizantes porque tienen mucha longitud de onda",
        "La radiación infrarroja es la más ionizante del espectro",
        "Los rayos X y rayos gamma son ionizantes porque tienen suficiente energía para arrancar electrones de los átomos",
        "La luz visible es ionizante a temperaturas normales",
      ],
      respuestaCorrecta: 2,
      retroalimentacion:
        "La radiación ionizante (rayos X, rayos gamma, y algunas UV de onda corta) tiene suficiente energía para arrancar electrones de los átomos, dañando el ADN y los tejidos. Las ondas de radio, microondas, infrarrojo y luz visible son no ionizantes: no tienen energía suficiente para ionizar átomos. El IMSS y el INER regulan la exposición a radiación ionizante con dosímetros personales y blindajes de plomo.",
    },
  ],
};
