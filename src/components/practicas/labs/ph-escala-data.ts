/**
 * Datos puros del laboratorio de Escala de pH (CNEYT-IV-P03).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A4
 * «Verdadero o Falso — pH, ácidos y bases». Se usa en la tarjeta interactiva
 * (parte B del tratamiento): el alumno responde el quiz real dentro del lab.
 *
 * Fuente: CNEYT-IV-P03-A4 (quiz_verdadero_falso), scripts/_sem4_dump.txt líneas 831–863.
 *
 * Mapping V/F → opción múltiple:
 *   opciones: ["Verdadero", "Falso"]
 *   respuesta (bool) → respuestaCorrecta: true → 0, false → 1
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-IV-P03-A4 (quiz_verdadero_falso).
// puntaje_minimo_aprobacion = 70 → puntajeMinimo = 70.
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Verdadero o Falso — pH, ácidos y bases",
  puntajeMinimo: 70,
  reactivos: [
    {
      // respuesta: true → respuestaCorrecta: 0 ("Verdadero")
      enunciado: "Una solución con pH 3 es más ácida que una solución con pH 6.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correcto: a menor valor de pH, mayor concentración de iones H⁺ y mayor acidez. La escala es logarítmica, así que pH 3 es 1000 veces más ácido que pH 6.",
    },
    {
      // respuesta: false → respuestaCorrecta: 1 ("Falso")
      enunciado: "Los ácidos tienen pH mayor de 7 y los bases tienen pH menor de 7.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Es al revés: los ácidos tienen pH menor de 7 (mayor [H⁺]) y las bases tienen pH mayor de 7 (mayor [OH⁻]).",
    },
    {
      // respuesta: true → respuestaCorrecta: 0 ("Verdadero")
      enunciado: "La sangre humana tiene un pH aproximado de 7.4, lo que la hace ligeramente básica.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correcto: el pH de la sangre oscila entre 7.35 y 7.45; mantenerlo en ese rango es vital para el funcionamiento de enzimas y proteínas.",
    },
    {
      // respuesta: true → respuestaCorrecta: 0 ("Verdadero")
      enunciado:
        "Los indicadores de pH como el papel tornasol cambian de color dependiendo de la acidez o basicidad de la solución.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correcto: el papel tornasol se vuelve rojo en medios ácidos y azul en medios básicos; otros indicadores como la fenolftaleína tienen colores distintos.",
    },
    {
      // respuesta: true → respuestaCorrecta: 0 ("Verdadero")
      enunciado: "La neutralización de un ácido con una base siempre produce sal y agua.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correcto: la reacción ácido-base de neutralización generaliza ácido + base → sal + agua. Ejemplo: HCl + NaOH → NaCl + H₂O.",
    },
  ],
};
