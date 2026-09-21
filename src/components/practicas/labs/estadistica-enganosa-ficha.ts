/**
 * Datos de la Ficha Teórica del laboratorio "Estadísticas que engañan"
 * (PM-VI-P08, progresión 8 de Pensamiento Matemático VI).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: infografía A1 «Las 5 formas más comunes en que los medios
 *     distorsionan las estadísticas» (10 puntos clave).
 *   - Glosario: glosario interactivo A5 (6 términos, reutilizados del archivo
 *     de datos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, PUNTOS_CLAVE, FUENTE } from "./estadistica-enganosa-data";

export const ESTADISTICA_ENGANOSA_FICHA: FichaTeoricaData = {
  ancla: "PM-VI · P08 · A1 — Las 5 formas más comunes en que los medios distorsionan las estadísticas",

  marcoTeorico: PUNTOS_CLAVE,

  objetivos: [
    "Detectar un eje truncado y calcular el cambio real con los números, no con la altura de las barras.",
    "Explicar por qué un ícono escalado en tres dimensiones exagera un dato.",
    "Leer una gráfica en escala logarítmica y reconocer el crecimiento exponencial.",
    "Distinguir puntos porcentuales de porcentaje de cambio, y riesgo relativo de riesgo absoluto.",
    "Comparar aumentos de bases distintas en cifras absolutas.",
    "Decidir cuándo la mediana describe mejor a un grupo que la media.",
    "Interpretar el margen de error de una encuesta y reconocer un empate técnico.",
    "Aprobar el quiz evaluable A2.",
  ],

  materiales: [
    { nombre: "Barras con eje móvil", detalle: "El inicio del eje se desliza desde cero hasta el valor del titular engañoso.", icono: "fa-scissors" },
    { nombre: "Íconos escalables", detalle: "Una bolsa, un frasco y una casa que crecen a lo alto o en sus tres dimensiones.", icono: "fa-cube" },
    { nombre: "Tablero de curvas", detalle: "Dos países con contagios exponenciales, en escala lineal o logarítmica.", icono: "fa-chart-line" },
    { nombre: "Tanques de tasas", detalle: "La tasa antes y después, con la diferencia puesta junto al valor original.", icono: "fa-flask" },
    { nombre: "1 000 figuras", detalle: "Cada figura es una persona o un grupo; los casos se iluminan.", icono: "fa-people-group" },
    { nombre: "Presupuestos en bloques", detalle: "Cada bloque vale $10,000 millones; los aumentos se ven en dorado.", icono: "fa-coins" },
    { nombre: "20 hogares", detalle: "Torres ordenadas por ingreso con el nivel de la media y el de la mediana.", icono: "fa-house" },
    { nombre: "Intervalos de encuesta", detalle: "Dos candidatos con su margen de error y la zona donde se tocan.", icono: "fa-arrows-left-right" },
  ],

  conceptos: [
    {
      termino: "Cambio real y cambio aparente",
      definicion: "Cambio real = (b − a) ÷ a. Con el eje desde m, la barra mide (valor − m): la razón de alturas es (b − m) ÷ (a − m), mayor mientras más cerca de a esté m.",
    },
    {
      termino: "Escalar en tres dimensiones",
      definicion: "Si un ícono se agranda r veces a lo alto, ancho y hondo, su volumen crece r³ veces: duplicar el lado hace que se vea ocho veces mayor.",
    },
    {
      termino: "Escala logarítmica",
      definicion: "Cada marca del eje vale 10 veces la anterior. Una cantidad que se duplica cada k días dibuja una recta; su pendiente indica la rapidez del crecimiento.",
    },
    {
      termino: "Puntos porcentuales",
      definicion: "La diferencia b − a entre dos porcentajes. El porcentaje de cambio es (b − a) ÷ a × 100: de 3 % a 5 % son 2 puntos y 66.7 %.",
    },
    {
      termino: "Riesgo relativo y absoluto",
      definicion: "Relativo: (después − antes) ÷ antes. Absoluto: después − antes. Duplicar un riesgo de 1 en un millón suma solo un caso por millón.",
    },
    {
      termino: "Media y mediana",
      definicion: "La media reparte el total por igual; la mediana es el valor del centro al ordenar. Con pocos valores muy grandes, la media sube y la mediana no se mueve.",
    },
    {
      termino: "Margen de error y empate técnico",
      definicion: "ME ≈ 1.96·√(p(1 − p)/n). Si los intervalos [a − ME, a + ME] y [b − ME, b + ME] se tocan, la encuesta no permite afirmar quién va adelante.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Revisar el eje, la escala y la fuente de una gráfica antes de compartirla en redes sociales.",
    "Interpretar la tasa de desocupación de la ENOE y distinguir cambios en puntos de cambios en porcentaje.",
    "Leer una noticia de salud y buscar el riesgo absoluto detrás de «reduce el riesgo a la mitad».",
    "Comparar el Presupuesto de Egresos de la Federación con cifras absolutas en millones de pesos.",
    "Evaluar si una encuesta electoral permite decir quién va adelante con su margen de error.",
  ],

  fuente: FUENTE,
};
