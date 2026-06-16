/**
 * Datos de la Ficha Teórica del laboratorio de Reacción vinagre + bicarbonato (CO₂).
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-IV-P08:
 *   - Marco teórico: lectura A1 «Química en casa: experimentos con materiales accesibles»
 *     (5 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Método experimental y seguridad en el laboratorio»
 *     (6 términos verbatim).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const REACCION_CO2_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-IV · P08 · A4 — Verdadero o Falso: Experimentos de química casera",

  // Marco teórico — VERBATIM de la lectura A1 (CNEYT-IV-P08-A1).
  marcoTeorico: [
    "Una de las ideas erróneas más comunes sobre la química es que solo ocurre en laboratorios con equipos costosos y sustancias peligrosas. En realidad, la cocina de cualquier hogar mexicano es un laboratorio lleno de reacciones químicas esperando ser exploradas. Con vinagre, bicarbonato, col morada, limón y agua es posible diseñar y realizar experimentos que ilustran principios fundamentales de la química.",
    "El bicarbonato de sodio (NaHCO₃) y el vinagre (solución diluida de ácido acético, CH₃COOH) producen una reacción de doble sustitución: CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂. La formación de burbujas (CO₂ gaseoso) es evidencia visible de la reacción química. Esta misma reacción es la base de los polvos para hornear en la panadería: el CO₂ producido hace que el pan esponje.",
    "La col morada (repollo morado) contiene antocianinas, pigmentos que actúan como indicadores naturales de pH: en ambiente ácido viran hacia el rojo/rosa; en neutro permanecen morados; en básico cambian a verde/amarillo. Con el extracto de col morada y diferentes líquidos del hogar (jugo de limón, agua, bicarbonato disuelto, jabón, agua de cal), puedes construir una escala de pH casera completamente funcional.",
    "La investigación con materiales accesibles tiene una larga tradición. En México, el programa de ferias de ciencias de la SEP ha promovido experimentos de este tipo desde la década de 1980. Los laboratorios del CINVESTAV y la UNAM frecuentemente refieren que los científicos más creativos son aquellos que aprendieron a hacerse preguntas con recursos limitados. La química experimental no requiere equipos costosos: requiere curiosidad, método y observación cuidadosa.",
    "El método científico aplicado a estos experimentos incluye: formular una pregunta o hipótesis, diseñar el experimento controlando variables, registrar observaciones sistemáticamente, analizar resultados y comunicar conclusiones. Estos pasos son idénticos en el experimento más sencillo y en las investigaciones más avanzadas.",
  ],

  objetivos: [
    "Identificar los tipos de variables en un experimento (independiente, dependiente, controladas y control).",
    "Explicar la reacción ácido-base entre el vinagre (CH₃COOH) y el bicarbonato (NaHCO₃) y sus evidencias observables.",
    "Aplicar las normas básicas de equipo de protección personal (EPP) al diseñar o realizar experimentos con reactivos caseros.",
    "Reconocer que una hipótesis debe ser falsable para ser científica.",
    "Comprender que los resultados que refutan una hipótesis son igualmente válidos y valiosos en el proceso científico.",
    "Aprobar el cuestionario Verdadero o Falso de la actividad A4.",
  ],

  materiales: [
    { nombre: "Vinagre (CH₃COOH)", detalle: "Solución diluida de ácido acético al 5–10 %", icono: "fa-flask" },
    { nombre: "Bicarbonato de sodio", detalle: "NaHCO₃, base utilizada como reactivo limitante o en exceso", icono: "fa-spoon" },
    { nombre: "Col morada / repollo", detalle: "Indicador natural de pH: rojo/rosa en ácido, verde/amarillo en básico", icono: "fa-leaf" },
    { nombre: "Recipientes graduados", detalle: "Para medir volúmenes y diseñar el experimento con variable controlada", icono: "fa-vial" },
    { nombre: "Equipo de protección (EPP)", detalle: "Bata, gafas y guantes (siempre, aunque los reactivos sean caseros)", icono: "fa-shield-halved" },
    { nombre: "Simulación 3D", detalle: "Escena interactiva: globo que se infla con el CO₂ real (estequiometría 1:1)", icono: "fa-cube" },
  ],

  // Conceptos centrales formulados a partir de la lectura A1 y las actividades ancla.
  conceptos: [
    { termino: "Reacción ácido-base", definicion: "Reacción de doble sustitución entre un ácido (CH₃COOH) y una base (NaHCO₃) que produce sal, agua y CO₂ gaseoso. La ecuación balanceada es: CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑." },
    { termino: "Reactivo limitante", definicion: "El reactivo que se agota primero y determina cuánto producto se forma. Si el bicarbonato se agota, añadir más vinagre no produce más CO₂." },
    { termino: "Hipótesis falsable", definicion: "Explicación tentativa que puede ser refutada mediante observaciones o experimentos. La falsabilidad es un criterio central del método científico (Popper)." },
    { termino: "Variable controlada", definicion: "Factor que el investigador mantiene constante en todos los grupos del experimento para que no afecte los resultados." },
    { termino: "Indicador natural de pH", definicion: "Pigmento vegetal (p. ej. antocianinas de la col morada) que cambia de color según el pH: rojo/rosa en ácido, morado en neutro, verde/amarillo en básico." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 (CNEYT-IV-P08-A5).
  glosario: [
    { termino: "Variable independiente", definicion: "Factor que el investigador manipula deliberadamente para observar su efecto en la variable dependiente." },
    { termino: "Variable dependiente", definicion: "Factor que se mide u observa en respuesta a los cambios en la variable independiente." },
    { termino: "Hipótesis", definicion: "Explicación tentativa y falsable de un fenómeno observado, que puede comprobarse mediante experimentación." },
    { termino: "Grupo control", definicion: "Grupo del experimento que no recibe el tratamiento estudiado; sirve como referencia para comparar los resultados." },
    { termino: "Equipo de protección personal (EPP)", definicion: "Conjunto de dispositivos de seguridad (bata, gafas, guantes, mascarilla) que protegen al experimentador de riesgos químicos o físicos." },
    { termino: "Indicador natural de pH", definicion: "Pigmento vegetal que cambia de color en función del pH; se extrae de plantas como el repollo morado, la Jamaica o la cúrcuma." },
  ],

  aplicaciones: [
    "Los polvos para hornear usan la misma reacción NaHCO₃ + ácido para producir CO₂ y esponjar el pan.",
    "El CINVESTAV y la UNAM promueven la experimentación con materiales accesibles como base de la formación científica.",
    "Las ferias de ciencias de la SEP en México han impulsado el método científico experimental desde la década de 1980.",
    "El EPP es obligatorio en cualquier experimento, incluso con reactivos caseros, para prevenir quemaduras e irritaciones.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-IV-P08.",
};
