/**
 * Datos puros del reto evaluable del laboratorio de Notación científica (PM-I-P06).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Conversión de unidades en
 * situaciones prácticas» (ejercicio_matematico). El alumno captura los cinco
 * resultados y comprueba con tolerancia; la retroalimentación (pasos guía +
 * respuesta final) es verbatim del ejercicio.
 *
 * FUENTE: PM-I-P06-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
 * Se usó A2 (preferido sobre A6) porque tiene 5 respuestas numéricas enteras
 * y limpias; A6 tiene respuesta mixta (notación científica + µm).
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-I-P06-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Conversión de unidades en situaciones prácticas",
  contexto: "Conversiones de unidades del Sistema Internacional en situaciones prácticas diversas.",
  problema:
    "a) Una piscina mide 25 m de largo, 10 m de ancho y 1.8 m de profundidad. ¿Cuántos litros de agua caben? (1 m³ = 1,000 L)\n" +
    "b) Una persona pesa 68 kg. ¿Cuántos gramos pesa?\n" +
    "c) Una carrera es de 5 km. ¿Cuántos metros son? ¿Y cuántos centímetros?\n" +
    "d) Un frasco de medicina tiene 250 mL. ¿Cuántos frascos se necesitan para tener 3 litros?",
  campos: [
    { etiqueta: "a) Litros de agua en la piscina", objetivo: 450000, tolerancia: 0, unidad: "L", placeholder: "450000" },
    { etiqueta: "b) Gramos que pesa la persona", objetivo: 68000, tolerancia: 0, unidad: "g", placeholder: "68000" },
    { etiqueta: "c) Metros en 5 km", objetivo: 5000, tolerancia: 0, unidad: "m", placeholder: "5000" },
    { etiqueta: "c) Centímetros en 5 km", objetivo: 500000, tolerancia: 0, unidad: "cm", placeholder: "500000" },
    { etiqueta: "d) Frascos de 250 mL para 3 litros", objetivo: 12, tolerancia: 0, unidad: "frascos", placeholder: "12" },
  ],
  pasosGuia: [
    "a) Volumen = largo × ancho × profundidad = 25 × 10 × 1.8 m³. Luego multiplica por 1,000.",
    "b) 1 kg = 1,000 g. Multiplica 68 × 1,000.",
    "c) 1 km = 1,000 m. 1 m = 100 cm. Convierte en dos pasos.",
    "d) Convierte 3 litros a mL, luego divide entre 250.",
  ],
  respuestaFinal: "a) 450,000 litros. b) 68,000 g. c) 5,000 m y 500,000 cm. d) 12 frascos.",
};
