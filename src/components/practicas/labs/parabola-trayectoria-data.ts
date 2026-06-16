/**
 * Datos puros del reto evaluable del laboratorio de Parábola — tiro parabólico
 * (PM-III-P06).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Analizo la trayectoria de un tiro
 * parabólico» (ejercicio_matematico, practica_slug=parabola-trayectoria).
 * El alumno captura los cuatro resultados y comprueba con tolerancia; la
 * retroalimentación (pasos guía + respuesta final) es verbatim del ejercicio.
 *
 * Verificación aritmética (h(x) = -0.04x² + 1.2x):
 *   (a) x_v = -1.2 / (2 × -0.04) = -1.2 / -0.08 = 15 m
 *       h(15) = -0.04(225) + 1.2(15) = -9 + 18 = 9 m
 *   (b) -0.04x² + 1.2x = 0 → x(-0.04x + 1.2) = 0 → x = 0 o x = 30 m
 *   (c) h(25) = -0.04(625) + 1.2(25) = -25 + 30 = 5 m > 2.44 m → gol
 *   (d) eje de simetría: x = x_v = 15
 *
 * Fuente: PM-III-P06-A2 (scripts/_sem3_dump.txt).
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-III-P06-A2 (ejercicio_matematico, practica_slug=parabola-trayectoria).
export const RETO_A2: RetoNumericoData = {
  titulo: "Analizo la trayectoria de un tiro parabólico",
  contexto:
    "Las funciones cuadráticas modelan trayectorias de proyectiles en física y deportes. El vértice representa el punto más alto y los ceros representan los puntos donde el proyectil toca el suelo.",
  problema:
    "Un balón de fútbol es pateado desde el suelo y describe una trayectoria modelada por h(x) = -0.04x² + 1.2x, donde h es la altura en metros y x es la distancia horizontal en metros.\n" +
    "(a) ¿A qué distancia horizontal el balón alcanza su altura máxima? ¿Cuál es esa altura máxima?\n" +
    "(b) ¿A qué distancia horizontal el balón vuelve a tocar el suelo (aparte del punto de inicio)?\n" +
    "(c) Si la portería está a 25 m de distancia horizontal y el travesaño está a 2.44 m de altura, ¿entra el gol? (Calcula h(25) y compara.)\n" +
    "(d) ¿Cuál es el eje de simetría de la parábola?",
  campos: [
    {
      etiqueta: "(a) Distancia horizontal al punto más alto (x_v)",
      objetivo: 15,
      tolerancia: 0,
      unidad: "m",
      placeholder: "15",
    },
    {
      etiqueta: "(a) Altura máxima del balón h(x_v)",
      objetivo: 9,
      tolerancia: 0,
      unidad: "m",
      placeholder: "9",
    },
    {
      etiqueta: "(b) Distancia donde el balón toca el suelo",
      objetivo: 30,
      tolerancia: 0,
      unidad: "m",
      placeholder: "30",
    },
    {
      etiqueta: "(c) Altura del balón en la portería h(25)",
      objetivo: 5,
      tolerancia: 0,
      unidad: "m",
      placeholder: "5",
    },
  ],
  pasosGuia: [
    "(a) El vértice tiene coordenada x = -b/(2a). Con a = -0.04 y b = 1.2: x_v = -1.2 / (2 × -0.04) = -1.2 / -0.08 = 15 m.",
    "(a) Sustituye x_v en h(x): h(15) = -0.04(225) + 1.2(15) = -9 + 18 = 9 m.",
    "(b) Los ceros: -0.04x² + 1.2x = 0 → x(-0.04x + 1.2) = 0 → x = 0 o x = 30 m.",
    "(c) Calcula h(25) = -0.04(625) + 1.2(25) = -25 + 30 = 5 m. Compara: 5 m > 2.44 m → sí entra el gol.",
    "(d) El eje de simetría es la recta vertical x = x_v = 15.",
  ],
  respuestaFinal:
    "(a) x_v = 15 m, h_max = 9 m. (b) El balón toca el suelo a x = 30 m. (c) h(25) = 5 m > 2.44 m → sí entra el gol. (d) Eje de simetría: x = 15.",
};
