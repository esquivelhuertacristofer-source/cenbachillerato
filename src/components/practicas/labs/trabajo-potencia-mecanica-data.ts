/**
 * Datos puros del reto evaluable del laboratorio de Trabajo y potencia mecánica
 * (CNEYT-II-P05).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Ejercicio: calcula trabajo y
 * potencia» (ejercicio_matematico). El alumno captura los dos resultados
 * (trabajo y potencia) y comprueba con tolerancia; la retroalimentación
 * (pasos guía + respuesta final) es verbatim del ejercicio.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de CNEYT-II-P05-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Ejercicio: calcula trabajo y potencia",
  contexto: "Trabajo mecánico: W = F × d × cos θ | Potencia: P = W / t",
  problema:
    "Una persona aplica una fuerza horizontal de 80 N para empujar una caja a lo largo de 5 metros sobre una superficie plana (el ángulo entre la fuerza y el desplazamiento es 0°). Posteriormente, un motor realiza el mismo trabajo (400 J) en tan solo 2 segundos.\n\n(a) ¿Cuánto trabajo realiza la persona? (b) ¿Cuánta potencia desarrolla el motor?",
  campos: [
    { etiqueta: "(a) Trabajo que realiza la persona", objetivo: 400, tolerancia: 0, unidad: "J", placeholder: "400" },
    { etiqueta: "(b) Potencia que desarrolla el motor", objetivo: 200, tolerancia: 0, unidad: "W", placeholder: "200" },
  ],
  pasosGuia: [
    "Parte (a): Identifica F = 80 N, d = 5 m, θ = 0° → cos(0°) = 1",
    "Aplica W = F × d × cos θ = 80 × 5 × 1 = 400 J",
    "Parte (b): Identifica W = 400 J, t = 2 s",
    "Aplica P = W / t = 400 J / 2 s = 200 W",
  ],
  respuestaFinal: "(a) W = 400 J | (b) P = 200 W",
};
