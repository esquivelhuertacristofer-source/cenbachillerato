/**
 * Datos de la Ficha Teórica del laboratorio de Ecuación lineal — la balanza
 * (PM-II-P09).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Ecuación, igualdad y sus
 * propiedades» (lectura) y del glosario A5 «Glosario: igualdad y ecuaciones»
 * (glosario_interactivo). El reto evaluable vive en
 * ecuacion-lineal-balanza-data.ts (A8). Sin inventar datos.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ECUACION_BALANZA_FICHA: FichaTeoricaData = {
  ancla: "PM-II · P09 · A1 — Ecuación, igualdad y sus propiedades",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Una IGUALDAD es una relación que afirma que dos expresiones valen lo mismo; se escribe con el signo igual, como en 4 mas 3 igual a 7. En álgebra distinguimos dos tipos de igualdad.",
    "Una IDENTIDAD es una igualdad que es verdadera para CUALQUIER valor de las letras que aparecen. Por ejemplo, (a mas b) al cuadrado igual a, a al cuadrado mas 2ab mas b al cuadrado, se cumple sin importar qué números pongamos en a y en b. Las identidades expresan reglas siempre válidas.",
    "Una ECUACIÓN, en cambio, es una igualdad que solo es verdadera para CIERTOS valores de la incógnita. Por ejemplo, x mas 2 igual a 5 solo es verdadera cuando x vale 3; para cualquier otro número la igualdad es falsa. Resolver una ecuación es encontrar el valor o los valores que la hacen verdadera.",
    "La igualdad cumple cuatro propiedades fundamentales:\n- Reflexiva: toda cantidad es igual a sí misma; a igual a, a.\n- Simétrica: si a es igual a b, entonces b es igual a, a.\n- Transitiva: si a es igual a b, y b es igual a c, entonces a es igual a c.\n- Uniformidad: si a es igual a b, podemos sumar, restar, multiplicar o dividir (por un número distinto de cero) la misma cantidad en ambos lados y la igualdad se conserva; por ejemplo, si a igual a b, entonces a mas c igual a b mas c.",
    "La propiedad de uniformidad es la base para resolver ecuaciones: hacemos la misma operación a los dos lados para despejar la incógnita.",
  ],

  objetivos: [
    "Distinguir una identidad (verdadera para cualquier valor) de una ecuación (verdadera solo para ciertos valores de la incógnita).",
    "Reconocer las cuatro propiedades de la igualdad: reflexiva, simétrica, transitiva y uniformidad.",
    "Aplicar la propiedad de uniformidad para despejar la incógnita haciendo la misma operación en ambos lados.",
    "Comprobar una solución sustituyendo el valor de la incógnita en la igualdad original.",
    "Resolver el reto evaluable de la actividad A8 sobre las propiedades de la igualdad.",
  ],

  materiales: [
    { nombre: "Balanza 3D en equilibrio", detalle: "Los dos platos pesan lo mismo: representan una igualdad", icono: "fa-scale-balanced" },
    { nombre: "Cajas (incógnita x)", detalle: "Cada caja vale lo mismo: la incógnita que se busca", icono: "fa-cube" },
    { nombre: "Operación de uniformidad", detalle: "Quita o reparte lo mismo en AMBOS lados sin romper la igualdad", icono: "fa-equals" },
    { nombre: "Comprobación", detalle: "Sustituye el valor hallado y verifica que la igualdad se cumple", icono: "fa-circle-check" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Propiedad reflexiva", definicion: "Toda cantidad es igual a sí misma; a = a." },
    { termino: "Propiedad simétrica", definicion: "Si a es igual a b, entonces b es igual a, a." },
    { termino: "Propiedad transitiva", definicion: "Si a es igual a b, y b es igual a c, entonces a es igual a c." },
    { termino: "Propiedad de uniformidad", definicion: "Si a = b, se puede sumar, restar, multiplicar o dividir (por un número distinto de cero) la misma cantidad en ambos lados y la igualdad se conserva." },
  ],

  // Glosario — VERBATIM de A5 «Glosario: igualdad y ecuaciones».
  glosario: [
    { termino: "Igualdad", definicion: "Relación que afirma que dos expresiones tienen el mismo valor. Ejemplo: 4 + 3 = 7." },
    { termino: "Identidad", definicion: "Igualdad verdadera para cualquier valor de las letras que contiene. Ejemplo: (a + b)² = a² + 2ab + b²." },
    { termino: "Ecuación", definicion: "Igualdad verdadera solo para ciertos valores de la incógnita. Ejemplo: x + 2 = 5, verdadera solo si x = 3." },
    { termino: "Incógnita", definicion: "Valor desconocido que se busca en una ecuación, representado por una letra. Ejemplo: la x en x + 2 = 5." },
    { termino: "Propiedad de uniformidad", definicion: "Si a = b, se puede aplicar la misma operación a ambos lados y la igualdad se conserva. Ejemplo: si a = b, entonces a + c = b + c." },
  ],

  aplicaciones: [
    "Plantear una situación cotidiana como una ecuación para encontrar un valor desconocido.",
    "Usar la balanza como modelo: lo que se hace de un lado debe hacerse del otro para mantener la igualdad.",
    "Despejar una incógnita restando o dividiendo la misma cantidad en ambos lados (uniformidad).",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, PM-II-P09.",
};
