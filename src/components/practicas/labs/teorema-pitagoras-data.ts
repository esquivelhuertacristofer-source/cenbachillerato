/**
 * Datos puros del reto evaluable del laboratorio Teorema de Pitágoras (PM-III-P01).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Calculo distancias reales con el
 * Teorema de Pitágoras» (ejercicio_matematico, practica_slug=teorema-pitagoras).
 * El alumno captura los tres resultados numéricos y comprueba con tolerancia;
 * la retroalimentación (pasos guía + respuesta final) es verbatim del ejercicio.
 *
 * Aritmética verificada:
 *   (a) c² = 4.8² + 0.6² = 23.04 + 0.36 = 23.40 → c = √23.40 ≈ 4.8374 → 4.84 m
 *   (b) relación = 0.6 / 4.8 = 0.125  (exactamente 1/8 → cumple la norma)
 *   (c) x² = 15² − 9² = 225 − 81 = 144 → x = 12 m  (triple 3-4-5 × 3)
 *
 * Fuente: PM-III-P01-A2 (ejercicio_matematico, tolerancia_error global = 0.05).
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-III-P01-A2 (ejercicio_matematico).
export const RETO_A2: RetoNumericoData = {
  titulo: "Calculo distancias reales con el Teorema de Pitágoras",
  contexto:
    "El Teorema de Pitágoras se usa en ingeniería civil para calcular longitudes inclinadas, verificar ángulos y garantizar que las construcciones cumplan estándares de seguridad y accesibilidad.",
  problema:
    "Un ingeniero civil necesita verificar que una rampa de acceso para personas con discapacidad esté bien construida. La rampa tiene una longitud horizontal de 4.8 m y sube una altura de 0.6 m.\n" +
    "(a) ¿Cuál es la longitud real de la superficie inclinada de la rampa?\n" +
    "(b) Si la norma exige que la relación altura/longitud horizontal no supere 1/8, ¿cumple esta rampa con la norma? (Calcula la relación altura/longitud horizontal.)\n" +
    "(c) Un poste de luz cercano proyecta una sombra diagonal en el plano del suelo. Si la base del poste está a 9 m de un punto de referencia y la punta de la sombra está a 15 m, ¿a qué altura (en línea recta sobre el suelo) está la punta de la sombra respecto al mismo punto de referencia?",
  campos: [
    {
      etiqueta: "(a) Longitud inclinada de la rampa",
      objetivo: 4.84,
      tolerancia: 0.05,
      unidad: "m",
      placeholder: "4.84",
    },
    {
      etiqueta: "(b) Relación altura / longitud horizontal",
      objetivo: 0.125,
      tolerancia: 0.005,
      placeholder: "0.125",
    },
    {
      etiqueta: "(c) Altura de la punta de la sombra",
      objetivo: 12,
      tolerancia: 0,
      unidad: "m",
      placeholder: "12",
    },
  ],
  pasosGuia: [
    "(a) Identifica los catetos: horizontal = 4.8 m, vertical = 0.6 m. Aplica c² = a² + b².",
    "(a) Calcula: c² = (4.8)² + (0.6)² = 23.04 + 0.36 = 23.4. Obtén c = √23.4.",
    "(b) Calcula la relación 0.6/4.8 y compara con 1/8 = 0.125.",
    "(c) Los valores 9 y 15 te recuerdan el triple 3-4-5 multiplicado por 3: verifica si 9² + x² = 15² y despeja x.",
  ],
  respuestaFinal:
    "(a) c ≈ 4.84 m; (b) 0.6/4.8 ≈ 0.125 = 1/8, cumple exactamente; (c) x = √(225 - 81) = √144 = 12 m",
};
