/**
 * Ficha teórica — tipos-graficas
 *
 * Contenido VERBATIM de la progresión CD-II-P04 (Cultura Digital II).
 * El marco teórico sale de CD-II-P04-A1 (infografia); el glosario y los
 * conceptos, de las actividades de glosario de la misma progresión. Generado
 * por scripts/generar-fichas-labs.ts: si el contenido de la base cambia, se
 * regenera; no editar a mano sin avisar al script.
 */
import type { FichaTeoricaData } from "./_ficha";

export const TIPOS_GRAFICAS_FICHA: FichaTeoricaData = {
  ancla: "CD-II-P04-A1 · Tipos de gráficas y cuándo usarlas",
  marcoTeorico: [
    "Gráfica de barras: compara cantidades entre categorías discretas. Ideal para 3 a 15 categorías. Es el formato más usado por el INEGI para comparar indicadores entre entidades federativas.",
    "Gráfica de línea: muestra tendencias a lo largo del tiempo. Requiere al menos 6 puntos temporales para ser informativa. Formato estándar para series históricas del PIB, inflación o empleo.",
    "Gráfica circular (pastel): representa proporciones de un todo. Solo útil con 6 o menos categorías. Muy abusada: los cerebros humanos comparan áreas con menos precisión que alturas.",
    "Gráfica de dispersión (scatter plot): muestra la relación entre dos variables numéricas continuas. Alta densidad de puntos puede revelar correlaciones no evidentes. No implica causalidad.",
    "Gráfica de área: variante de la línea que enfatiza el volumen acumulado. Útil para comparar múltiples series a lo largo del tiempo (ej: mix de generación eléctrica por fuente).",
    "Trampa del eje truncado: si el eje Y no comienza en cero, una diferencia del 2% puede verse como si fuera del 200%. Técnica frecuente en medios para exagerar diferencias en encuestas electorales.",
    "Trampa de escalas distintas: dos variables con ejes independientes en la misma gráfica pueden crear una correlación visual que no existe en los datos reales.",
    "Trampa 3D: las representaciones tridimensionales de datos bidimensionales distorsionan la percepción relativa de las porciones. Evitarlas en visualización seria.",
    "Toda gráfica requiere: título descriptivo, etiquetas en ambos ejes, unidades de medida, fuente de los datos con año de actualización y nota metodológica cuando aplique.",
  ],
  objetivos: [
    "Completa el modo «Tipo de gráfica y su propósito».",
    "Completa el modo «¿Qué gráfica usarías?».",
    "Completa el modo «Empareja término y definición».",
    "Aprueba el cuestionario de comprensión de la ficha.",
  ],
  materiales: [],
  conceptos: [
    { termino: "Variable cuantitativa", definicion: "Dato numérico que puede medirse y compararse aritméticamente (ingreso, temperatura, número de estudiantes). Opuesto a la variable categórica, que clasifica sin medir." },
    { termino: "Correlación", definicion: "Relación estadística entre dos variables que tienden a cambiar juntas. Una correlación alta no implica que una variable sea causa de la otra." },
    { termino: "Escala logarítmica", definicion: "Eje donde cada unidad representa una multiplicación por 10. Útil cuando los datos varían en órdenes de magnitud muy distintos (ej: casos de contagio durante una pandemia)." },
    { termino: "Percentil", definicion: "Valor que indica qué porcentaje de los datos queda por debajo de ese punto. El percentil 50 es la mediana; el percentil 90 significa que el 90% de los datos tiene un valor menor." },
    { termino: "Outlier", definicion: "Dato atípico que se aleja notablemente del patrón general. Puede distorsionar promedios e interpretaciones si no se identifica y trata explícitamente." },
  ],
  glosario: [
    { termino: "Medida de tendencia central", definicion: "Valor que resume un conjunto de datos: media, mediana o moda." },
    { termino: "Media (promedio)", definicion: "Suma de todos los valores dividida entre la cantidad de datos." },
    { termino: "Medida de dispersión", definicion: "Valor que indica qué tan separados están los datos entre sí." },
    { termino: "Representación gráfica", definicion: "Forma visual de mostrar datos para entenderlos y comunicarlos." },
    { termino: "Software estadístico libre", definicion: "Programas gratuitos y abiertos para analizar datos." },
  ],
  aplicaciones: [
    "El INEGI produce más de 300 conjuntos de datos estadísticos públicos, todos accesibles en datos.gob.mx. Sus gráficas son el estándar de referencia para periodistas, investigadores y funcionarios en México. Sin embargo, un diagnóstico del CONEVAL (2022) encontró que la mayoría de los adultos mexicanos enfrenta dificultades para interpretar correctamente gráficas con dos ejes o variables. La brecha de alfabetización estadística es un desafío central de la educación en Cultura Digital.\n\nEn los medios de comunicación mexicanos es frecuente encontrar gráficas con ejes truncados para dramatizar diferencias en encuestas electorales, o gráficas circulares con porcentajes que no suman 100%. Identificar estas trampas no es solo una habilidad técnica: es una competencia ciudadana fundamental para participar en democracia con información verificada.",
  ],
  fuente: "Instituto Nacional de Estadística y Geografía (INEGI) — ENDUTIH 2023; CEPAL — Manual de visualización de datos estadísticos 2022",
};
