/**
 * Datos de la Ficha Teórica del laboratorio "Muestreo: cómo elegir una
 * muestra representativa" (PM-VI-P07, progresión 7 de Pensamiento
 * Matemático VI).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Muestreo estadístico» (5 párrafos).
 *   - Glosario: glosario interactivo A5 (6 términos, reutilizados del archivo
 *     de datos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./muestreo-estadistico-data";

export const MUESTREO_ESTADISTICO_FICHA: FichaTeoricaData = {
  ancla: "PM-VI · P07 · A1 — Muestreo estadístico",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Distinguir población, muestra, parámetro y estimación.",
    "Aplicar las cuatro técnicas probabilísticas: aleatorio simple, sistemático, estratificado y por conglomerados.",
    "Calcular el reparto proporcional de un muestreo estratificado con f = n/N.",
    "Reconocer el sesgo de selección en encuestas voluntarias y de conveniencia.",
    "Explicar con muestras repetidas por qué el error muestral disminuye al aumentar n y por qué el sesgo no.",
    "Resolver el reto evaluable del ejercicio A2.",
  ],

  materiales: [
    { nombre: "Una escuela de 800 estudiantes", detalle: "Los cuatro grados del ejercicio A2, organizados en 27 salones sobre el patio.", icono: "fa-school" },
    { nombre: "Seis técnicas de muestreo", detalle: "Cuatro probabilísticas y dos sesgadas, aplicadas sobre la misma población.", icono: "fa-hand-pointer" },
    { nombre: "Tabla del estratificado", detalle: "La fracción f = n/N aplicada a cada grado, con el redondeo que conserva el total.", icono: "fa-table" },
    { nombre: "Histograma de 300 muestras", detalle: "Cada ficha es una muestra; la línea dorada es el valor real de la escuela.", icono: "fa-chart-column" },
    { nombre: "Banda del margen de error", detalle: "±1.96·√(p(1 − p)/n), con la corrección por población finita.", icono: "fa-arrows-left-right" },
  ],

  conceptos: [
    {
      termino: "Parámetro y estimación",
      definicion: "El parámetro es el valor de toda la población (aquí, la proporción p de estudiantes que usan redes más de 3 h). La estimación p̂ es el mismo cálculo hecho solo con la muestra.",
    },
    {
      termino: "Fracción de muestreo",
      definicion: "f = n/N. En el estratificado proporcional cada estrato aporta nᵢ = Nᵢ·f estudiantes; si el producto no es entero se redondea sin cambiar el total.",
    },
    {
      termino: "Intervalo sistemático",
      definicion: "k = N/n. Se elige al azar un arranque entre los primeros k de la lista y después se toma cada k-ésimo elemento.",
    },
    {
      termino: "Margen de error al 95 %",
      definicion: "ME = 1.96·√(p(1 − p)/n)·√((N − n)/(N − 1)). Al multiplicar n por cuatro el margen se reduce aproximadamente a la mitad.",
    },
    {
      termino: "Distribución muestral",
      definicion: "El histograma de las estimaciones de muchas muestras del mismo tamaño. Su ancho es el error muestral; la distancia de su centro al valor real es el sesgo.",
    },
    {
      termino: "Sesgo de selección",
      definicion: "Ocurre cuando unas personas tienen más probabilidad de quedar en la muestra que otras por una razón ligada a lo que se mide. No se corrige aumentando n.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "La ENIGH del INEGI combina estratos y conglomerados en varias etapas para estimar ingresos y gastos de todo el país con decenas de miles de hogares.",
    "La ENOE se levanta cada trimestre para medir el empleo con una metodología muestral similar.",
    "Las encuestas electorales publican su margen de error; entenderlo evita leer como ventaja real una diferencia menor al margen.",
    "En una escuela, una encuesta estratificada por grado da resultados más confiables que preguntar solo a quien pasa por la cafetería.",
  ],

  fuente: FUENTE,
};
