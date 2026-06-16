/**
 * Datos puros del reto evaluable del laboratorio de Razón y proporción (PM-I-P05).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Proporcionalidad directa e inversa:
 * situaciones reales» (ejercicio_matematico). El alumno captura los tres
 * resultados y comprueba con tolerancia; la retroalimentación (pasos guía +
 * respuesta final) es verbatim del ejercicio.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-I-P05-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Proporcionalidad directa e inversa: situaciones reales",
  contexto: "Situaciones de proporcionalidad directa e inversa en contextos laborales y cotidianos.",
  problema:
    "a) Si 5 obreros construyen un muro en 12 días, ¿cuántos días tardarán 15 obreros en construir el mismo muro?\n" +
    "b) Un automóvil viaja a 80 km/h y tarda 3 horas en llegar a su destino. Si viaja a 120 km/h, ¿cuánto tiempo tardará?\n" +
    "c) Un grifo llena un tanque en 4 horas. ¿Cuánto tiempo tardarán 3 grifos iguales trabajando juntos?",
  campos: [
    { etiqueta: "a) Días que tardarán 15 obreros", objetivo: 4, tolerancia: 0, unidad: "días", placeholder: "4" },
    { etiqueta: "b) Tiempo a 120 km/h", objetivo: 2, tolerancia: 0, unidad: "h", placeholder: "2" },
    { etiqueta: "c) Tiempo con 3 grifos (en horas, ej. 1.33)", objetivo: 1.33, tolerancia: 0.01, unidad: "h", placeholder: "1.33" },
  ],
  pasosGuia: [
    "a) Más obreros → menos días: proporcionalidad inversa. k = 5 × 12 = 60. Tiempo = 60/15.",
    "b) Mayor velocidad → menos tiempo: proporcionalidad inversa. k = 80 × 3 = 240. Tiempo = 240/120.",
    "c) Más grifos → menos tiempo: proporcionalidad inversa. k = 1 × 4 = 4. Tiempo = 4/3.",
  ],
  respuestaFinal: "a) 4 días. b) 2 horas. c) 1 hora y 20 minutos (4/3 horas ≈ 1.33 h).",
};
