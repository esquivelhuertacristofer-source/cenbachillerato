/**
 * Datos de la Ficha Teórica del laboratorio "Azar, frecuencia y probabilidad —
 * el tablero de Galton" (PM-VI-P05, progresión 2 de Pensamiento Matemático VI).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Probabilidad: azar, incertidumbre y toma de
 *     decisiones informadas» (5 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Probabilidad clásica, frecuentista y
 *     subjetiva» (6 términos verbatim, reutilizados del archivo de datos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO } from "./galton-probabilidad-data";

export const GALTON_PROBABILIDAD_FICHA: FichaTeoricaData = {
  ancla: "PM-VI · P05 · A1 — Probabilidad: azar, incertidumbre y toma de decisiones informadas",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "La probabilidad es la rama de las matematicas que estudia el azar y la incertidumbre. Nos permite asignar un numero entre 0 y 1 (o entre 0% y 100%) a la posibilidad de que ocurra un evento, y eso tiene aplicaciones practicas inmensas: desde el pronostico del tiempo hasta las primas de seguros, pasando por los ensayos clinicos de medicamentos.",
    "El punto de partida es el experimento aleatorio: cualquier proceso cuyo resultado no podemos predecir con certeza antes de realizarlo. Lanzar un dado, sacar una carta de una baraja, medir la temperatura maxima de manana, o tomar una muestra de 100 personas para medir su presion arterial, son todos experimentos aleatorios. El espacio muestral (usualmente escrito como omega) es el conjunto de todos los resultados posibles del experimento. Para un dado de seis caras, omega = {1, 2, 3, 4, 5, 6}. Un evento es cualquier subconjunto del espacio muestral: por ejemplo, el evento 'sacar un numero par' es el subconjunto {2, 4, 6}.",
    "Existen tres enfoques principales para definir y calcular probabilidades. La probabilidad clasica (o de Laplace) define P(A) = numero de casos favorables al evento A / numero total de casos posibles del espacio muestral. Esta formula asume que todos los resultados son igualmente posibles (equiprobabilidad): funciona perfectamente para dados, monedas, cartas y urnas ideales, pero no para la mayoria de situaciones reales. La probabilidad frecuentista define P(A) como la frecuencia relativa del evento A en un numero muy grande de repeticiones del experimento: P(A) = numero de veces que ocurrio A / numero total de repeticiones. La ley de los grandes numeros garantiza que, conforme aumenta el numero de repeticiones, la frecuencia relativa se acerca al valor verdadero de la probabilidad. La probabilidad subjetiva es el grado de creencia personal sobre la posibilidad de un evento, basado en experiencia, intuicion o informacion incompleta. Se usa en medicina (probabilidad de que un paciente tenga cierta enfermedad segun sus sintomas), en seguros y en toma de decisiones empresariales.",
    "Los axiomas de Kolmogorov (1933) dan el fundamento matematico riguroso de la probabilidad: (1) P(A) es mayor o igual a 0 para cualquier evento A; (2) P(omega) = 1, la probabilidad del espacio muestral completo es 1; (3) si dos eventos A y B son mutuamente excluyentes (A interseccion B = vacio), entonces P(A union B) = P(A) + P(B). De estos tres axiomas se derivan todas las demas propiedades de la probabilidad. El complemento de un evento A es el conjunto de todos los resultados que no pertenecen a A: P(A') = 1 - P(A). Si la probabilidad de lluvia es 0.30, la probabilidad de que no llueva es 0.70.",
    "La probabilidad esta presente en decisiones cotidianas. El meteorologo que dice 'probabilidad de lluvia del 70%' usa modelos frecuentistas. La aseguradora que calcula la prima de un seguro de vida usa tablas de mortalidad (datos frecuentistas de millones de personas). El medico que dice 'dado tus sintomas, la probabilidad de que sea dengue es alta' usa probabilidad subjetiva basada en experiencia clinica.",
  ],

  objetivos: [
    "Enumerar el espacio muestral Ω de un experimento aleatorio y reconocer un evento como un subconjunto suyo.",
    "Calcular la probabilidad clásica P(A) = casos favorables / casos posibles y el complemento P(A') = 1 − P(A).",
    "Distinguir la probabilidad clásica (antes del experimento) de la frecuentista (medida al repetirlo).",
    "Comprobar en el tablero de Galton que la frecuencia relativa se acerca a la probabilidad teórica al aumentar el número de bolas.",
    "Reconocer cuándo se rompe la equiprobabilidad y por qué la regla de Laplace deja de aplicar en ese caso.",
    "Explicar la ley de los grandes números sin caer en la falacia del jugador: cada repetición es independiente.",
    "Aprobar el reto evaluable de la actividad A2.",
  ],

  materiales: [
    { nombre: "Dado de seis caras", detalle: "Experimento aleatorio con Ω = {1, 2, 3, 4, 5, 6} y resultados equiprobables.", icono: "fa-dice-six" },
    { nombre: "Dos monedas", detalle: "Ω = {CC, CS, SC, SS}: cuatro resultados, no tres.", icono: "fa-coins" },
    { nombre: "Baraja de 52 cartas", detalle: "Cuatro palos por trece valores; 26 cartas rojas.", icono: "fa-clone" },
    { nombre: "Tablero de Galton", detalle: "Filas de clavos y cajones acumuladores; la probabilidad de desviarse a la derecha es ajustable.", icono: "fa-chart-column" },
    { nombre: "Contador de repeticiones", detalle: "Repite el experimento hasta miles de veces y grafica la frecuencia relativa.", icono: "fa-arrow-trend-up" },
  ],

  conceptos: [
    {
      termino: "Experimento aleatorio",
      definicion: "Proceso cuyo resultado no podemos predecir con certeza antes de realizarlo. Lanzar un dado, sacar una carta o tomar una muestra de 100 personas lo son.",
    },
    {
      termino: "Regla de Laplace",
      definicion: "P(A) = casos favorables / casos posibles. Solo es válida si todos los resultados del espacio muestral son igualmente posibles.",
    },
    {
      termino: "Frecuencia relativa",
      definicion: "Veces que ocurrió el evento entre veces que se repitió el experimento. Es la estimación frecuentista de la probabilidad y se mide después de experimentar.",
    },
    {
      termino: "Ley de los grandes números",
      definicion: "Conforme aumenta el número de repeticiones, la frecuencia relativa se acerca al valor verdadero de la probabilidad. No promete compensar rachas: cada repetición es independiente.",
    },
    {
      termino: "Distribución binomial",
      definicion: "Describe cuántos éxitos hay en n intentos independientes con probabilidad p. En el tablero de Galton, P(k) = C(n,k)·p^k·(1−p)^(n−k) es la altura teórica del cajón k.",
    },
    {
      termino: "Equiprobabilidad",
      definicion: "Supuesto de que todos los resultados de Ω tienen la misma probabilidad. Cargar el tablero (p ≠ 0.5) lo rompe, y con él la validez de contar casos favorables.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "La SSA estima probabilidades de contagio para decidir cuántas dosis de vacuna producir y distribuir antes de una temporada de influenza.",
    "Las aseguradoras calculan la prima de un seguro de vida con tablas de mortalidad, que son datos frecuentistas de millones de personas.",
    "El pronóstico del tiempo («probabilidad de lluvia del 70%») sale de modelos frecuentistas alimentados con décadas de registros.",
    "En los ensayos clínicos, la probabilidad decide si la mejoría observada en un medicamento es real o pudo deberse al azar.",
  ],

  fuente: "Material CEN Bachillerato — PM-VI. Ref.: Kolmogorov, 1933; ley de los grandes numeros.",
};
