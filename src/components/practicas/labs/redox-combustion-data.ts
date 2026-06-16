/**
 * Datos puros del reto evaluable del laboratorio de Redox y Combustión
 * (CNEYT-IV-P09).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Calculando el potencial de una
 * pila y la energía de un combustible» (ejercicio_matematico,
 * practica_slug=redox-combustion). El alumno captura los dos resultados
 * numéricos del problema (incisos a y c) y comprueba con tolerancia ±0.01;
 * la retroalimentación (pasos guía + respuesta final) es verbatim del
 * ejercicio.
 *
 * Nota: el inciso b) «identificar agente reductor y oxidante» es de desarrollo
 * textual (no numérico); se reproduce en el contexto/enunciado para que el
 * alumno lo trabaje en el laboratorio, pero no tiene campo numérico asociado.
 *
 * Aritmética verificada:
 *   a) E°pila = E°cátodo − E°ánodo = 0.34 − (−0.76) = 0.34 + 0.76 = 1.10 V  ✓
 *   c) Q = |ΔH|·n = 890 × 3 = 2 670 kJ  ✓
 *
 * Sin three: seguro de importar desde el shell del lab.
 *
 * Fuente: CNEYT-IV-P09-A2 (ejercicio_matematico), MCCEMS 2025.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de CNEYT-IV-P09-A2 (ejercicio_matematico, practica_slug=redox-combustion).
export const RETO_A2: RetoNumericoData = {
  titulo: "Calculando el potencial de una pila y la energía de un combustible",

  contexto:
    "Los tres incisos recorren el contenido formativo de la progresión: la pila (a) con el potencial estándar, la identificación del redox (b) con los agentes oxidante/reductor, y la combustión (c) con la energía liberada. En el laboratorio 3D cada proceso es un modo y la calculadora da estos números para cualquier par redox y cualquier combustible.",

  problema:
    "Trabaja con la pila de Daniell y con la combustión de un gas doméstico.\n\n" +
    "a) PILA. Se arma una pila con un electrodo de zinc en Zn²⁺ y uno de cobre en Cu²⁺. Datos: E°(Cu²⁺/Cu) = +0.34 V; E°(Zn²⁺/Zn) = −0.76 V. Indica cuál se oxida y cuál se reduce, y calcula el potencial estándar de la pila, E°pila = E°cátodo − E°ánodo.\n\n" +
    "b) IDENTIFICAR REDOX. En la reacción global Zn + Cu²⁺ → Zn²⁺ + Cu, ¿quién es el agente reductor y quién el agente oxidante?\n\n" +
    "c) COMBUSTIÓN. ¿Cuánta energía libera la combustión completa de 3 moles de metano, si su entalpía de combustión es ΔH = −890 kJ/mol? Usa Q = |ΔH|·n.",

  campos: [
    {
      etiqueta: "a) E°pila — potencial estándar de la pila de Daniell",
      objetivo: 1.10,
      tolerancia: 0.01,
      unidad: "V",
      placeholder: "1.10",
    },
    {
      etiqueta: "c) Q — energía de combustión de 3 mol de metano",
      objetivo: 2670,
      tolerancia: 0.01,
      unidad: "kJ",
      placeholder: "2670",
    },
  ],

  pasosGuia: [
    "a) El cobre tiene mayor E° (+0.34), así que es el cátodo (se reduce); el zinc, con menor E° (−0.76), es el ánodo (se oxida). E°pila = 0.34 − (−0.76) = 0.34 + 0.76 = +1.10 V.",
    "b) El zinc cede electrones (Zn → Zn²⁺ + 2e⁻): se oxida, es el agente REDUCTOR. El Cu²⁺ gana electrones (Cu²⁺ + 2e⁻ → Cu): se reduce, es el agente OXIDANTE.",
    "c) Q = |ΔH|·n = 890 × 3 = 2 670 kJ.",
  ],

  respuestaFinal:
    "a) E°pila = +1.10 V (espontánea). b) Reductor: Zn (se oxida); oxidante: Cu²⁺ (se reduce). c) Q = 2 670 kJ.",
};
