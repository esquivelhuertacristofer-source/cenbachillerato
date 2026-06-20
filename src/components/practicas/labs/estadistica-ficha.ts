/**
 * Ficha Teórica del laboratorio de Estadística descriptiva
 * (Pensamiento Matemático VI «Pensamiento estadístico y probabilístico»).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Medidas de tendencia central:
 * media, mediana y moda» (lectura, PM-VI-P03-A1) y del glosario interactivo
 * A5 (PM-VI-P03-A5). El reto evaluable (A2) vive en estadistica-data.ts.
 * No se inventan datos: todo es verbatim de la BD.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ESTADISTICA_FICHA: FichaTeoricaData = {
  ancla: "PM-VI · P03 · A1 — Medidas de tendencia central: media, mediana y moda",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Las medidas de tendencia central son valores representativos de un conjunto de datos: intentan resumir toda la distribución en un solo número que capture el «centro» de los datos. La elección correcta entre media, mediana y moda depende del tipo de variable y de las características del conjunto de datos.",
    "La media aritmética es el promedio clásico: se calcula sumando todos los valores y dividiendo entre el número de datos (n). La media tiene propiedades algebraicas útiles: la suma de las desviaciones de cada dato respecto a la media es siempre cero. Sin embargo, su principal debilidad es la sensibilidad a los valores atípicos (outliers): un solo dato extremadamente alto o bajo puede jalar la media significativamente hacia ese extremo, haciendo que deje de representar al grupo típico.",
    "La mediana es el valor central cuando los datos están ordenados de menor a mayor. Si n es impar, la mediana es el dato en la posición (n+1)/2. Si n es par, la mediana es el promedio de los dos datos centrales (en las posiciones n/2 y n/2+1). La mediana es resistente a los valores atípicos: no importa qué tan extremo sea el mayor o menor valor, la mediana solo depende del dato o datos centrales. Esta propiedad la hace la medida preferida para distribuciones sesgadas.",
    "La moda es el valor que aparece con mayor frecuencia en el conjunto. Un conjunto puede ser unimodal (una sola moda), bimodal (dos modas), multimodal (varias modas) o amodal (sin moda, si todos los datos aparecen con la misma frecuencia). La moda es la única medida de tendencia central aplicable a variables cualitativas nominales: podemos hablar de la moda del color de ojos en una población (el color más frecuente), pero no de su media o mediana.",
    "La regla general para elegir la medida correcta es: si los datos tienen valores atípicos extremos o la distribución es marcadamente asimétrica, usar la mediana. Si la distribución es aproximadamente simétrica y sin valores atípicos extremos, la media es adecuada. Si la variable es cualitativa o se quiere identificar el valor más común, usar la moda.",
    "Un caso especial es la media ponderada: cuando los datos no tienen el mismo peso o importancia. El promedio escolar mexicano pondera las calificaciones por el número de créditos de cada materia: una materia de 8 créditos tiene más peso que una de 3. El Índice Nacional de Precios al Consumidor (INPC) que usa el INEGI para medir la inflación es una media ponderada: cada bien y servicio tiene un peso proporcional a su importancia en el gasto típico de los hogares mexicanos.",
    "El ejemplo más ilustrativo de la diferencia entre media y mediana en México es el salario. El ingreso laboral promedio (media) puede verse elevado por los salarios extremadamente altos del decil 10 de la distribución de ingresos. El salario mediano, que es el punto donde la mitad de los trabajadores gana más y la mitad gana menos, es significativamente menor que la media y refleja mejor la situación de la mayoría de los trabajadores mexicanos. Los datos de la ENOE (Encuesta Nacional de Ocupación y Empleo del INEGI) muestran esta brecha con claridad.",
  ],

  objetivos: [
    "Calcular la media aritmética, la mediana y la moda de un conjunto de datos.",
    "Reconocer que la media es sensible a los valores atípicos y la mediana resistente a ellos.",
    "Elegir la medida de tendencia central adecuada según el tipo de variable y la forma de la distribución.",
    "Medir la dispersión de los datos con el rango, la varianza y la desviación estándar.",
    "Organizar datos en una tabla de frecuencias y leer un histograma; resolver el reto A2 (salarios).",
  ],

  materiales: [
    { nombre: "Recta numérica 3D (dot plot)", detalle: "Cada dato es una esfera apilada sobre su valor; la nube muestra la forma de la distribución", icono: "fa-chart-simple" },
    { nombre: "Fulcro de la media", detalle: "La media es el punto de equilibrio de la «balanza»; un valor atípico la inclina", icono: "fa-scale-balanced" },
    { nombre: "Corte de la mediana", detalle: "El plano central deja la mitad de los datos a cada lado, sin que lo muevan los extremos", icono: "fa-scissors" },
    { nombre: "Banda media ± σ e histograma", detalle: "La dispersión como banda alrededor del centro y el agrupamiento en intervalos", icono: "fa-arrows-left-right-to-line" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Media aritmética (x̄)", definicion: "El promedio clásico: x̄ = Σx / n. La suma de las desviaciones de cada dato respecto a la media es siempre cero. Es sensible a los valores atípicos." },
    { termino: "Mediana", definicion: "El valor central de los datos ordenados de menor a mayor. Con n impar es el dato en la posición (n+1)/2; con n par, el promedio de los dos centrales. Es resistente a los valores atípicos." },
    { termino: "Moda", definicion: "El valor que aparece con mayor frecuencia. Un conjunto puede ser unimodal, bimodal, multimodal o amodal. Es la única medida aplicable a variables cualitativas nominales." },
    { termino: "Valor atípico (outlier)", definicion: "Dato extremadamente alto o bajo que jala la media hacia ese extremo, haciendo que deje de representar al grupo típico; la mediana casi no se ve afectada." },
    { termino: "Media ponderada", definicion: "Promedio donde cada valor tiene un peso: x̄ₚ = Σ(xᵢ·wᵢ)/Σwᵢ. Se usa cuando los datos no tienen la misma importancia (promedio escolar por créditos, INPC del INEGI)." },
    { termino: "Dispersión (rango, varianza, σ)", definicion: "El rango es máx − mín; la varianza σ² = Σ(x − x̄)²/n es el promedio de los cuadrados de las distancias a la media; la desviación estándar σ = √σ² está en las mismas unidades que los datos." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5.
  glosario: [
    { termino: "Media aritmética (promedio)", definicion: "Suma de todos los valores dividida entre el número total de datos: x̄ = Σxᵢ/n. Es sensible a valores extremos (atípicos)." },
    { termino: "Mediana", definicion: "Valor central de los datos ordenados de menor a mayor. Con n impar: posición (n+1)/2. Con n par: promedio de los valores en posiciones n/2 y n/2+1." },
    { termino: "Moda", definicion: "Valor o valores que aparecen con mayor frecuencia en el conjunto de datos. Un conjunto puede ser unimodal (una moda), bimodal (dos) o multimodal. Si todos los valores tienen la misma frecuencia, no hay moda." },
    { termino: "Media ponderada", definicion: "Promedio donde cada valor xᵢ tiene un peso wᵢ. Fórmula: x̄ₚ = Σ(xᵢ·wᵢ)/Σwᵢ. Usada cuando los datos no tienen igual importancia." },
    { termino: "Sesgo y resistencia de medidas", definicion: "La media es sensible al sesgo (valores atípicos la distorsionan). La mediana y la moda son resistentes a valores extremos. En distribuciones simétricas las tres coinciden." },
    { termino: "Medidas en datos agrupados", definicion: "Cuando los datos están en tabla de frecuencias, la media se aproxima con las marcas de clase: x̄ ≈ Σ(mᵢ·fᵢ)/n, donde mᵢ es la marca de clase y fᵢ la frecuencia de cada intervalo." },
  ],

  aplicaciones: [
    "El promedio escolar mexicano pondera las calificaciones por el número de créditos de cada materia.",
    "El Índice Nacional de Precios al Consumidor (INPC) del INEGI es una media ponderada: cada bien y servicio pesa según su importancia en el gasto de los hogares.",
    "El salario mediano (ENOE/INEGI) refleja mejor que el promedio la situación de la mayoría de los trabajadores, porque los sueldos muy altos del decil 10 inflan la media.",
  ],

  fuente: "MCCEMS 2025 — Pensamiento Matemático VI «Pensamiento estadístico y probabilístico», contenido formativo: Medidas de tendencia central (media, mediana, moda) · Medidas de dispersión · Tablas de frecuencia e histogramas. Ref.: INEGI-ENOE, ENIGH 2022.",
};
