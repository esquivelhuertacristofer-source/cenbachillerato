/**
 * Datos de la Ficha Teórica del laboratorio de Notación científica (PM-I-P06).
 *
 * Contenido VERBATIM de la actividad ancla A1 «El Sistema Internacional de
 * Medidas» (lectura). La progresión P06 no tiene actividad de glosario; los
 * conceptos centrales se formulan a partir de la lectura A1 (sin inventar
 * datos), y el reto evaluable vive en notacion-cientifica-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const NOTACION_CIENTIFICA_FICHA: FichaTeoricaData = {
  ancla: "PM-I · P06 · A1 — El Sistema Internacional de Medidas",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "El Sistema Internacional de Unidades (SI) es el sistema de medición más utilizado en el mundo y el estándar en ciencia y tecnología. Fue adoptado internacionalmente en 1960 y tiene siete unidades base: metro (longitud), kilogramo (masa), segundo (tiempo), ampere (corriente eléctrica), kelvin (temperatura), mol (cantidad de sustancia) y candela (intensidad luminosa).",
    "Del SI se derivan múltiples unidades usando prefijos que indican potencias de 10. Los más comunes son: kilo (×1,000), hecto (×100), deca (×10), deci (÷10), centi (÷100) y mili (÷1,000). Así, 1 kilómetro = 1,000 metros; 1 centímetro = 0.01 metros.",
    "Convertir entre unidades requiere multiplicar o dividir por la relación entre ellas. Para convertir 3.5 kilómetros a metros: 3.5 × 1,000 = 3,500 metros. Para convertir 750 mililitros a litros: 750 ÷ 1,000 = 0.75 litros.",
    "En la vida cotidiana y en las ciencias, medir con precisión y en las unidades correctas puede marcar la diferencia entre el éxito y el error. En 1999, una sonda de la NASA se perdió porque dos equipos usaban diferentes sistemas de unidades sin convertir correctamente.",
  ],

  objetivos: [
    "Identificar las siete unidades base del Sistema Internacional (SI).",
    "Aplicar los prefijos del SI (kilo, centi, mili, etc.) para convertir entre unidades.",
    "Escribir números muy grandes o muy pequeños en notación científica (a × 10ⁿ).",
    "Convertir medidas en situaciones prácticas con el factor correcto.",
    "Resolver el ejercicio de conversión de unidades en contexto (A2).",
  ],

  materiales: [
    { nombre: "Torre de escalas 3D", detalle: "Navega del átomo (10⁻¹⁰ m) al Sol (10⁹ m) cambiando exponente", icono: "fa-layer-group" },
    { nombre: "Control de mantisa y exponente", detalle: "Ajusta a × 10ⁿ y observa el número en forma desarrollada", icono: "fa-sliders" },
    { nombre: "Referencias reales", detalle: "Salta a bacterias, granos, edificios, planetas y más", icono: "fa-compass" },
    { nombre: "Conversión de unidades", detalle: "El mismo tamaño en km, m y mm — solo cambia el exponente", icono: "fa-arrows-left-right" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Sistema Internacional (SI)", definicion: "Sistema de medición adoptado en 1960 con siete unidades base: metro, kilogramo, segundo, ampere, kelvin, mol y candela." },
    { termino: "Prefijos del SI", definicion: "Multiplican la unidad base por potencias de 10: kilo (×1 000), centi (÷100), mili (÷1 000), entre otros." },
    { termino: "Notación científica", definicion: "Forma de escribir un número como a × 10ⁿ, donde 1 ≤ a < 10 y n es un entero; facilita manejar valores muy grandes o muy pequeños." },
    { termino: "Conversión de unidades", definicion: "Proceso de multiplicar o dividir por el factor de relación entre dos unidades para expresar la misma cantidad en diferente unidad." },
    { termino: "Magnitud", definicion: "Propiedad física que se puede medir cuantitativamente, como la longitud, la masa o el tiempo." },
    { termino: "Exponente", definicion: "En a × 10ⁿ, el valor n indica cuántos lugares se corre el punto decimal; positivo = número grande, negativo = número pequeño." },
  ],

  // La progresión P06 no tiene actividad de glosario; los términos clave
  // viven en "conceptos" (formulados desde la lectura A1).
  glosario: [],

  aplicaciones: [
    "Ciencias de la salud: convertir miligramos a gramos en dosificación de medicamentos para evitar errores fatales.",
    "Ingeniería y construcción: usar el factor correcto al pasar de metros a centímetros en planos arquitectónicos.",
    "Astronomía y física: expresar distancias estelares y tamaños de partículas en notación científica para comparar órdenes de magnitud.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, PM-I-P06.",
};
