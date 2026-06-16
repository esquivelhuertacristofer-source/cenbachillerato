/**
 * Datos puros del laboratorio del Ciclo del Carbono (CNEYT-III-P04).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A3
 * «¿Cuánto domino los ciclos? Quiz de cierre» (quiz_multiple_opcion).
 * Se exporta como QUIZ_A2 por convención del tratamiento, aunque la
 * actividad fuente es A3.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-III-P04-A3 (quiz_multiple_opcion).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Cuánto domino los ciclos? Quiz de cierre",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué proceso del ciclo del nitrógeno convierte el N₂ atmosférico en formas que las plantas pueden absorber?",
      opciones: [
        "Desnitrificación",
        "Nitrificación",
        "Fijación de nitrógeno",
        "Denitrificación",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "La fijación de nitrógeno (realizada por bacterias como Rhizobium y Azotobacter) convierte el N₂ gaseoso en amoníaco (NH₃) o iones amonio (NH₄⁺), que las plantas pueden absorber. Sin este proceso, el N₂ del aire sería inaccesible para los organismos.",
    },
    {
      enunciado: "¿Por qué el ciclo del fósforo es diferente a los ciclos del carbono y del nitrógeno?",
      opciones: [
        "Porque el fósforo es un gas a temperatura ambiente",
        "Porque el fósforo no tiene una fase atmosférica significativa; circula principalmente entre la litosfera, el suelo y los seres vivos",
        "Porque el fósforo solo existe en los océanos",
        "Porque los microorganismos no participan en el ciclo del fósforo",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "A diferencia del C y N, el fósforo casi no tiene fase gaseosa; su ciclo es sedimentario. Se libera de las rocas por meteorización, es absorbido por plantas y devuelto al suelo por descomposición, o llega al océano y se deposita en sedimentos.",
    },
    {
      enunciado: "La eutrofización de un lago es un ejemplo de perturbación humana en el ciclo del:",
      opciones: [
        "Agua únicamente",
        "Carbono únicamente",
        "Nitrógeno y fósforo principalmente",
        "Silicio y hierro",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "La eutrofización ocurre por el exceso de nitrógeno (N) y fósforo (P) provenientes de fertilizantes agrícolas o aguas residuales. Estos nutrientes estimulan el crecimiento masivo de algas, alterando gravemente el ciclo de ambos elementos en el ecosistema acuático.",
    },
    {
      enunciado: "¿Qué papel juegan los hongos y las bacterias en los ciclos biogeoquímicos?",
      opciones: [
        "Solo perjudican los ciclos al consumir nutrientes",
        "Son descomponedores que liberan nutrientes de la materia orgánica muerta, haciéndolos disponibles para los productores",
        "Solo intervienen en el ciclo del nitrógeno",
        "No tienen un papel relevante en los ciclos biogeoquímicos",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Los descomponedores (hongos y bacterias) son esenciales: sin ellos, los nutrientes quedarían atrapados en la materia orgánica muerta y los productores no podrían reincorporarlos. Son el cierre indispensable de todos los ciclos biogeoquímicos.",
    },
    {
      enunciado: "El proceso de evapotranspiración combina:",
      opciones: [
        "La evaporación del suelo y la transpiración de las plantas",
        "La evaporación del océano y la precipitación de lluvia",
        "La transpiración animal y la condensación en nubes",
        "La filtración del agua y su evaporación en el subsuelo",
      ],
      respuestaCorrecta: 0,
      retroalimentacion: "La evapotranspiración suma la evaporación directa del agua del suelo, lagos y ríos, más la transpiración de las plantas (liberación de vapor de agua por los estomas). Es un proceso clave en el ciclo hidrológico, especialmente en bosques tropicales.",
    },
  ],
};
