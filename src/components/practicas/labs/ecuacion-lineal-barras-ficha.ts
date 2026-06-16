/**
 * Datos de la Ficha Teórica del laboratorio Ecuación lineal: el modelo de barras
 * (PM-III-P07).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Ecuaciones lineales en situaciones
 * reales» (video_con_preguntas). El reto evaluable vive en
 * ecuacion-lineal-barras-data.ts (A2). Glosario VERBATIM de A5.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ECUACION_LINEAL_FICHA: FichaTeoricaData = {
  ancla: "PM-III · P07 · A1 — Ecuaciones lineales en situaciones reales",

  // Marco teórico — VERBATIM del texto de la lectura A1.
  marcoTeorico: [
    "Una ecuación lineal es una igualdad matemática que involucra una variable elevada a la primera potencia. Su forma general es ax + b = c, donde a, b y c son números conocidos y x es la incógnita que buscamos. Resolver una ecuación lineal significa encontrar el valor de x que hace verdadera la igualdad.",
    "El procedimiento para resolver una ecuación lineal sigue pasos lógicos y reversibles. Primero, se agrupan los términos con la variable en un lado de la igualdad y los términos numéricos en el otro, usando operaciones inversas: si hay una suma, se resta; si hay una multiplicación, se divide. Segundo, se simplifica cada lado. Tercero, se despeja la incógnita dividiéndola por su coeficiente. Cuarto, y fundamental, se verifica la solución sustituyendo el valor obtenido en la ecuación original: si ambos lados son iguales, la respuesta es correcta.",
    "Plantear un problema en forma de ecuación lineal requiere traducir el lenguaje cotidiano al lenguaje matemático. Consideremos un ejemplo con planes de datos móviles en México. Telcel ofrece un plan con cargo fijo de 200 pesos al mes más 15 pesos por cada GB adicional consumido. Si al final del mes la factura fue de 425 pesos, ¿cuántos GB adicionales se consumieron? Traducimos: 200 + 15x = 425. Restamos 200 a ambos lados: 15x = 225. Dividimos entre 15: x = 15 GB adicionales. Verificamos: 200 + 15(15) = 200 + 225 = 425. Correcto.",
    "Otro tipo de problema frecuente en ciencias involucra mezclas. Si en un laboratorio se mezclan dos soluciones y se necesita saber cuántos mililitros de una solución al 30% de concentración deben añadirse a 100 mL de agua para obtener una concentración del 10%, la ecuación lineal 0.30x = 0.10(x + 100) permite encontrar la respuesta.",
    "El ahorro personal también genera ecuaciones lineales. Si una estudiante tiene 350 pesos ahorrados y ahorra 80 pesos cada semana, ¿en cuántas semanas tendrá 1,150 pesos para comprarse sus materiales de bachillerato? La ecuación es 350 + 80x = 1150, que da x = 10 semanas.",
    "Las ecuaciones lineales son modelos matemáticos de relaciones proporcionales: describen situaciones donde una cantidad crece o decrece de forma constante respecto a otra. Reconocer esa estructura en situaciones reales es la habilidad central que este tema desarrolla.",
  ],

  objetivos: [
    "Identificar la incógnita en un problema expresado en lenguaje cotidiano.",
    "Traducir el enunciado de un problema al lenguaje algebraico (ax + b = c).",
    "Despejar la incógnita aplicando operaciones inversas en ambos lados de la igualdad.",
    "Verificar la solución sustituyendo el valor obtenido en la ecuación original.",
    "Resolver el reto evaluable de la actividad A2 (Planteo y resuelvo ecuaciones lineales).",
  ],

  materiales: [
    { nombre: "Modelo de barras 3D", detalle: "Visualiza a·x + b = c como segmentos apilados que deben alcanzar la meta c", icono: "fa-ruler-horizontal" },
    { nombre: "Deslizador de incógnita", detalle: "Mueve x y observa en tiempo real cómo crece a·x hasta resolver la ecuación", icono: "fa-sliders" },
    { nombre: "Despeje algebraico", detalle: "Muestra el proceso x = (c − b) / a paso a paso", icono: "fa-square-root-variable" },
    { nombre: "Tres problemas contextualizados", detalle: "Artesano, hermanos y número desconocido; cada uno plantea una ecuación lineal diferente", icono: "fa-list-check" },
  ],

  // Conceptos formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Ecuación lineal", definicion: "Igualdad matemática donde la variable aparece elevada a la primera potencia; forma general: ax + b = c." },
    { termino: "Incógnita (x)", definicion: "El valor desconocido que hace verdadera la ecuación; lo que buscamos al resolver." },
    { termino: "Coeficiente (a)", definicion: "El número que multiplica a la incógnita en la ecuación lineal ax + b = c." },
    { termino: "Término independiente (b)", definicion: "El número que se suma (o resta) a la incógnita; no depende del valor de x." },
    { termino: "Despejar", definicion: "Aislar la incógnita en un lado de la igualdad usando operaciones inversas (sumar/restar, multiplicar/dividir)." },
    { termino: "Verificación", definicion: "Sustituir el valor obtenido en la ecuación original para confirmar que ambos lados son iguales." },
    { termino: "Operaciones inversas", definicion: "Pares de operaciones que se cancelan mutuamente: suma ↔ resta, multiplicación ↔ división." },
  ],

  // Glosario VERBATIM de PM-III-P07-A5.
  glosario: [
    { termino: "Ecuación lineal", definicion: "Ecuación en la que la incógnita está elevada a la potencia 1. Ejemplo: 2x + 5 = 13." },
    { termino: "Incógnita", definicion: "Valor desconocido que se busca en la ecuación. Ejemplo: la x en 2x + 5 = 13." },
    { termino: "Despejar", definicion: "Aislar la incógnita en un lado de la igualdad mediante operaciones inversas. Ejemplo: de 2x = 8 se obtiene x = 4 dividiendo entre 2." },
    { termino: "Solución", definicion: "Valor de la incógnita que hace verdadera la ecuación. Ejemplo: x = 4 es la solución de 2x + 5 = 13." },
  ],

  aplicaciones: [
    "Planes de datos móviles: cargo fijo más costo por GB adicional (ej. Telcel: 200 + 15x = 425).",
    "Ahorro personal: cantidad inicial más aportación semanal constante (ej. 350 + 80x = 1 150 pesos).",
    "Mezclas en laboratorio: concentración proporcional a volumen añadido.",
    "Presupuestos y costos de servicio: honorarios por hora más materiales fijos.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, PM-III-P07. Glosario verbatim de A5.",
};
