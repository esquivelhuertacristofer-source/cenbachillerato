/**
 * Datos de la Ficha Teórica del laboratorio "¿Están relacionadas?
 * Independencia y correlación" (PM-VI-P12, progresión 6 de Pensamiento
 * Matemático VI).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «¿Están relacionadas? Independencia y
 *     correlación entre variables» (5 párrafos).
 *   - Glosario: glosario interactivo A5 «Glosario: independencia y
 *     correlación» (10 términos, reutilizados del archivo de datos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./correlacion-variables-data";

export const CORRELACION_VARIABLES_FICHA: FichaTeoricaData = {
  ancla: "PM-VI · P12 · A1 — ¿Están relacionadas? Independencia y correlación entre variables",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Distinguir variables cualitativas de cuantitativas y elegir la herramienta adecuada para cada par.",
    "Organizar dos variables cualitativas en una tabla de contingencia y comparar lo observado con lo esperado.",
    "Decidir si dos variables cualitativas son independientes o están asociadas comparando proporciones.",
    "Interpretar la forma de una nube de puntos y el signo y la fuerza del coeficiente de correlación r.",
    "Explicar el signo de r con los productos (x − x̄)(y − ȳ) de cada punto.",
    "Reconocer una variable oculta y argumentar por qué correlación no implica causalidad.",
    "Resolver el reto evaluable del ejercicio A2.",
  ],

  materiales: [
    { nombre: "Dos torres de 50 estudiantes", detalle: "Hombres y mujeres, cada ficha pintada según su deporte favorito.", icono: "fa-table-cells" },
    { nombre: "Plano de lo esperado", detalle: "La altura a la que quedaría la frontera si sexo y deporte fueran independientes.", icono: "fa-layer-group" },
    { nombre: "Tablero de dispersión", detalle: "Se agregan y quitan puntos con un toque; r y la recta se recalculan al instante.", icono: "fa-chart-line" },
    { nombre: "Rectángulos de productos", detalle: "Cada punto dibuja (x − x̄)(y − ȳ): verdes suman, rojos restan.", icono: "fa-vector-square" },
    { nombre: "52 semanas en 3D", detalle: "Helado vendido, ahogamientos y la temperatura como tercer eje.", icono: "fa-temperature-high" },
  ],

  conceptos: [
    {
      termino: "Frecuencia esperada",
      definicion: "Lo que marcaría cada celda si las variables fueran independientes: total de la fila × total de la columna ÷ total general.",
    },
    {
      termino: "Comparar proporciones",
      definicion: "Con grupos de distinto tamaño no basta mirar conteos: se compara qué fracción de cada grupo cae en cada categoría.",
    },
    {
      termino: "Productos (x − x̄)(y − ȳ)",
      definicion: "Un punto arriba y a la derecha del centro de la nube, o abajo y a la izquierda, da producto positivo; en los otros dos cuadrantes, negativo. r = Σ(x − x̄)(y − ȳ) / √[Σ(x − x̄)²·Σ(y − ȳ)²].",
    },
    {
      termino: "Recta de mínimos cuadrados",
      definicion: "La recta y = a + b·x que mejor sigue a la nube; su pendiente tiene el mismo signo que r.",
    },
    {
      termino: "Variable oculta",
      definicion: "Una tercera variable que mueve a las dos que se comparan. Al fijarla (comparar solo casos parecidos en ella), la correlación aparente se desvanece.",
    },
    {
      termino: "Correlación parcial",
      definicion: "La correlación entre dos variables después de descontar el efecto de una tercera. Si es cercana a 0, la relación original venía de esa tercera variable.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Las encuestas del INEGI cruzan variables como sexo, edad o entidad con preferencias y hábitos usando tablas de contingencia.",
    "En salud pública se busca correlación entre hábitos (actividad física, sueño, alimentación) y indicadores como el pulso o la presión arterial.",
    "Los estudios educativos comparan horas de estudio o de pantalla con el rendimiento, cuidando no confundir asociación con causa.",
    "Los ensayos clínicos existen precisamente porque la correlación no basta: asignan tratamientos al azar para descartar variables ocultas.",
  ],

  fuente: FUENTE,
};
