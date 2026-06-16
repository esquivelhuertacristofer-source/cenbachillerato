/**
 * Datos puros del reto evaluable del laboratorio de Semejanza de triángulos
 * (PM-III-P05).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Mido una altura de forma indirecta
 * usando semejanza» (ejercicio_matematico, tipo_respuesta "numerica").
 * El alumno captura los tres resultados (a, b, c) y comprueba con tolerancia;
 * la retroalimentación (pasos guía + respuesta final) es verbatim del ejercicio.
 *
 * Aritmética verificada:
 *   (a) H_torre  = 1.60 × (12.40 / 0.80) = 1.60 × 15.5 = 24.8 m  ✓
 *   (b) k        = 12.40 / 0.80           = 15.5                   ✓
 *   (c) H_monum  = (3.2 / 0.80) × 1.60   = 4 × 1.60  = 6.4 m     ✓
 *       (equiv.: k_monum = 3.2/0.80 = 4; H = 4 × 1.60 = 6.4)
 *
 * Fuente: PM-III-P05-A2 (ejercicio_matematico).
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-III-P05-A2 (ejercicio_matematico, tipo_respuesta "numerica").
export const RETO_A2: RetoNumericoData = {
  titulo: "Mido una altura de forma indirecta usando semejanza",
  contexto:
    "La semejanza de triángulos permite medir objetos o distancias inaccesibles usando solo proporciones y medidas indirectas. Esta técnica fue usada por los egipcios y griegos antiguos, y sigue siendo útil en topografía, arquitectura y fotografía.",
  problema:
    "Sofía quiere conocer la altura de la torre del reloj de su pueblo. En un momento del día, Sofía (estatura = 1.60 m) proyecta una sombra de 0.80 m, mientras que la torre proyecta una sombra de 12.40 m sobre el suelo.\n" +
    "(a) Establece la proporción usando triángulos semejantes y calcula la altura de la torre.\n" +
    "(b) Si la razón de semejanza entre el triángulo de la torre y el de Sofía es k, ¿cuánto mide k?\n" +
    "(c) Si la base del monumento que está junto a la torre proyecta una sombra de 3.2 m al mismo instante, ¿qué altura tiene el monumento?",
  campos: [
    {
      etiqueta: "(a) Altura de la torre del reloj",
      objetivo: 24.8,
      tolerancia: 0.1,
      unidad: "m",
      placeholder: "24.8",
    },
    {
      etiqueta: "(b) Razón de semejanza k",
      objetivo: 15.5,
      tolerancia: 0.1,
      placeholder: "15.5",
    },
    {
      etiqueta: "(c) Altura del monumento",
      objetivo: 6.4,
      tolerancia: 0.1,
      unidad: "m",
      placeholder: "6.4",
    },
  ],
  pasosGuia: [
    "(a) Los triángulos formados por Sofía y su sombra, y por la torre y su sombra, son semejantes (mismo ángulo del sol).",
    "(a) Plantea la proporción: altura_torre / sombra_torre = altura_Sofía / sombra_Sofía.",
    "(a) Sustituye: H / 12.40 = 1.60 / 0.80 → H = 1.60 × (12.40 / 0.80).",
    "(b) k = sombra_torre / sombra_Sofía = 12.40 / 0.80.",
    "(c) Usa la misma razón: H_monumento / 3.2 = 1.60 / 0.80 → H_monumento = k × 1.60.",
  ],
  respuestaFinal: "(a) H = 24.8 m. (b) k = 15.5. (c) H_monumento = 6.4 m.",
};
