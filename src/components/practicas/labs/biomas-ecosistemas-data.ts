/**
 * Datos puros del laboratorio de Biomas y ecosistemas (CNEYT-III-P01).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A2
 * «¿Cuánto sabes sobre ecosistemas?». Se usa en la tarjeta interactiva
 * (parte B del tratamiento): el alumno responde el quiz real dentro del lab.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-III-P01-A2 (quiz_multiple_opcion).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Cuánto sabes sobre ecosistemas?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué distingue un bioma de un ecosistema?",
      opciones: [
        "Un bioma es microscópico; un ecosistema es macroscópico",
        "Un bioma es una región geográfica amplia con clima y vegetación característica; un ecosistema incluye la comunidad biótica y el entorno abiótico a cualquier escala",
        "Son sinónimos perfectos",
        "Un ecosistema solo aplica al mar; un bioma, a la tierra",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El bioma es una unidad biogeográfica regional (como la selva tropical o la tundra); el ecosistema incluye la comunidad viva + factores abióticos y puede tener cualquier tamaño, desde un charco hasta un océano.",
    },
    {
      enunciado: "¿Por qué México es considerado un país 'megadiverso'?",
      opciones: [
        "Porque tiene la mayor superficie territorial de América",
        "Porque posee entre el 10-12% de la biodiversidad mundial en menos del 2% de la superficie terrestre",
        "Porque tiene el mayor número de parques nacionales del continente",
        "Porque solo en México viven los jaguares y los axolotes",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "México comparte el título de megadiverso con solo 17 países del mundo que juntos albergan más del 70% de la biodiversidad del planeta. La combinación de climas, topografía y su posición biogeográfica explican esta riqueza.",
    },
    {
      enunciado: "¿Cuál de estos factores abióticos es determinante para distinguir un desierto de una selva tropical?",
      opciones: [
        "La altitud sobre el nivel del mar",
        "La temperatura y la precipitación anual",
        "La presencia de suelo arenoso",
        "La latitud geográfica exclusivamente",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La temperatura y la precipitación son los factores climáticos más determinantes para definir un bioma. Los desiertos tienen <250 mm de lluvia/año; las selvas tropicales, >2000 mm, con temperaturas cálidas todo el año.",
    },
    {
      enunciado: "¿Qué son los servicios ecosistémicos?",
      opciones: [
        "Empresas que limpian ecosistemas contaminados",
        "Los beneficios que los ecosistemas proporcionan a las sociedades humanas (alimentos, agua limpia, regulación del clima, polinización)",
        "Los servicios turísticos en áreas naturales protegidas",
        "Las actividades económicas que se realizan dentro de un ecosistema",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Los servicios ecosistémicos son todos los beneficios que las personas obtienen de los ecosistemas, incluyendo aprovisionamiento (alimento, agua), regulación (clima, inundaciones), culturales y de soporte (fotosíntesis, ciclos de nutrientes).",
    },
    {
      enunciado: "Un ecotono es:",
      opciones: [
        "Un tipo de bioma polar extremo",
        "La zona de transición entre dos ecosistemas, con alta biodiversidad propia",
        "Un organismo que vive en dos ecosistemas distintos",
        "El nivel máximo de un nivel trófico",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El ecotono es la zona de contacto o transición entre dos ecosistemas (ej. borde entre un bosque y una pradera). Suele tener mayor biodiversidad que cada uno por separado, ya que combina especies de ambos.",
    },
  ],
};
