/**
 * Datos de la Ficha Teórica del laboratorio de la Distribución normal (PM-VI-P09).
 *
 * Contenido VERBATIM de la actividad ancla A1 «La distribución normal: la campana
 * que describe el mundo» (lectura) y del glosario A5 «Glosario: distribución
 * normal, tendencia central y dispersión». El reto evaluable vive en
 * normal-data.ts (A2). No se inventan datos: todo es verbatim de la BD.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const NORMAL_FICHA: FichaTeoricaData = {
  ancla: "PM-VI · P09 · A1 — La distribución normal: la campana que describe el mundo",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Si mides la estatura de miles de personas, el peso de los costales de maíz de una cosecha o las calificaciones de un examen nacional, descubres algo asombroso: los valores no se reparten al azar de cualquier manera, sino que se AMONTONAN cerca de un promedio y se vuelven cada vez más raros en los extremos. Al graficar cuántos casos hay de cada valor aparece una curva suave en forma de campana simétrica: la DISTRIBUCIÓN NORMAL, también llamada campana de Gauss. Es el modelo de probabilidad más importante de la estadística porque describe innumerables fenómenos naturales y sociales.",
    "DOS NÚMEROS LA DEFINEN. Una distribución normal queda totalmente determinada por dos cantidades. La MEDIA μ (mu) es una medida de tendencia central: marca el CENTRO de la campana, su eje de simetría, el valor más típico. La DESVIACIÓN ESTÁNDAR σ (sigma) es una medida de dispersión: dice qué tan ANCHA es la campana, es decir qué tan lejos del centro suelen estar los datos. Si σ es pequeña, la campana es alta y angosta (los datos se parecen mucho entre sí); si σ es grande, la campana es baja y ancha (hay mucha variación). Cambiar μ DESPLAZA la campana a izquierda o derecha sin deformarla; cambiar σ la ENSANCHA o la estrecha.",
    "MEDIA, MEDIANA Y MODA COINCIDEN. Como la campana es perfectamente simétrica respecto a μ, en una distribución normal las tres medidas de tendencia central —media, mediana y moda— caen en el mismo punto: μ. Ese es un sello de la normalidad.",
    "LA REGLA EMPÍRICA 68-95-99.7. La forma de la campana hace que las áreas a cierto número de desviaciones del centro sean siempre las mismas, sin importar el fenómeno. Aproximadamente el 68 % de los datos cae dentro de μ ± 1σ (a una desviación de la media); cerca del 95 % cae en μ ± 2σ; y el 99.7 % en μ ± 3σ. Es decir, casi todo (el 99.7 %) está a menos de tres desviaciones del centro, y salirse de ese rango es rarísimo. Esta «regla empírica» permite estimar probabilidades de memoria.",
    "EL ÁREA ES LA PROBABILIDAD. Bajo la curva normal, el ÁREA total vale 1 (el 100 % de los casos). Y el área entre dos valores a y b es exactamente la PROBABILIDAD de que la variable caiga en ese rango: P(a ≤ X ≤ b). Calcular probabilidades con la normal es, literalmente, medir áreas bajo la campana.",
    "LA PUNTUACIÓN z. ¿Cómo comparar un dato de un fenómeno con otro de un fenómeno distinto, o cómo calcular esas áreas? Se ESTANDARIZA con la puntuación z = (x − μ)/σ, que dice cuántas desviaciones estándar está un valor por encima (z > 0) o por debajo (z < 0) de la media. La z convierte CUALQUIER normal en la NORMAL ESTÁNDAR (μ = 0, σ = 1), para la que existen tablas y la función Φ(z) = P(Z ≤ z). Así, una estatura de 184 cm en una población con μ = 170 y σ = 7 tiene z = (184 − 170)/7 = 2: está dos desviaciones por encima del promedio, igual de excepcional que un 700 en una prueba con μ = 500 y σ = 100.",
    "EN MÉXICO Y EN EL MUNDO. La ENSANUT (INEGI y Secretaría de Salud) describe estaturas y pesos de la población con campanas normales; las pruebas PLANEA (SEP) y PISA (OCDE) escalan sus puntajes a una normal con media y desviación fijas para comparar generaciones y países; las escalas de coeficiente intelectual se diseñan normales con μ = 100 y σ = 15. Entender la distribución normal permite estimar qué tan común o raro es un valor y tomar decisiones fundamentadas con probabilidades.",
  ],

  objetivos: [
    "Identificar la distribución normal como una campana simétrica definida por su media μ y su desviación estándar σ.",
    "Distinguir μ (medida de tendencia central) de σ (medida de dispersión) y ver cómo cada una modifica la campana.",
    "Aplicar la regla empírica 68-95-99.7 para acotar dónde cae la mayoría de los datos.",
    "Calcular la puntuación z = (x − μ)/σ e interpretar qué tan lejos del centro está un valor.",
    "Interpretar el área bajo la curva como la probabilidad de que un valor caiga en un rango y resolver el reto A2.",
  ],

  materiales: [
    { nombre: "Campana de Gauss 3D", detalle: "Mueve μ (la campana se desplaza) y σ (se ensancha o se estrecha)", icono: "fa-bell" },
    { nombre: "Fenómenos reales (México)", detalle: "Estaturas ENSANUT, puntajes PLANEA/PISA y escala de CI", icono: "fa-database" },
    { nombre: "Regla empírica 68-95-99.7", detalle: "Bandas de área dentro de ±1σ, ±2σ y ±3σ", icono: "fa-layer-group" },
    { nombre: "Probabilidad / z", detalle: "Elige un rango [a, b]: su área es la probabilidad y z estandariza cada extremo", icono: "fa-percent" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Distribución normal (campana de Gauss)", definicion: "Curva suave en forma de campana simétrica que aparece cuando los valores se amontonan cerca de un promedio y se vuelven raros en los extremos; el modelo de probabilidad más importante de la estadística." },
    { termino: "Media μ", definicion: "Medida de tendencia central: marca el centro de la campana, su eje de simetría y el valor más típico. Cambiar μ desplaza la campana sin deformarla." },
    { termino: "Desviación estándar σ", definicion: "Medida de dispersión: dice qué tan ancha es la campana, es decir qué tan lejos del centro suelen estar los datos. A mayor σ, campana más baja y ancha." },
    { termino: "Regla empírica 68-95-99.7", definicion: "Aprox. el 68 % de los datos cae en μ ± 1σ, cerca del 95 % en μ ± 2σ y el 99.7 % en μ ± 3σ; casi todo está a menos de tres desviaciones del centro." },
    { termino: "Área = probabilidad", definicion: "Bajo la curva normal el área total vale 1 (100 %); el área entre dos valores a y b es la probabilidad P(a ≤ X ≤ b) de caer en ese rango." },
    { termino: "Puntuación z", definicion: "z = (x − μ)/σ: dice cuántas desviaciones estándar está un valor por encima (z > 0) o por debajo (z < 0) de la media; convierte cualquier normal en la normal estándar (μ = 0, σ = 1)." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5.
  glosario: [
    { termino: "Distribución normal", definicion: "Modelo de probabilidad en forma de campana simétrica, definido por su media μ y su desviación σ." },
    { termino: "Media (μ)", definicion: "Medida de tendencia central; el centro y eje de simetría de la campana." },
    { termino: "Desviación estándar (σ)", definicion: "Medida de dispersión; qué tan lejos de la media suelen estar los datos. A mayor σ, más ancha la campana." },
    { termino: "Varianza (σ²)", definicion: "El cuadrado de la desviación estándar; también mide la dispersión de los datos." },
    { termino: "Regla empírica 68-95-99.7", definicion: "En una normal, ~68 % de los datos caen en μ±1σ, ~95 % en μ±2σ y ~99.7 % en μ±3σ." },
    { termino: "Puntuación z", definicion: "z = (x − μ)/σ: número de desviaciones estándar que un valor está por encima (z>0) o por debajo (z<0) de la media." },
    { termino: "Área = probabilidad", definicion: "El área bajo la curva entre a y b es P(a ≤ X ≤ b); el área total vale 1." },
    { termino: "Normal estándar", definicion: "La normal con μ = 0 y σ = 1; cualquier normal se convierte a ella con la puntuación z." },
    { termino: "Medidas de tendencia central", definicion: "Media, mediana y moda; en una normal perfecta las tres coinciden en μ." },
    { termino: "Medidas de dispersión", definicion: "Rango, varianza y desviación estándar; cuantifican qué tan esparcidos están los datos." },
  ],

  aplicaciones: [
    "La ENSANUT (INEGI y Secretaría de Salud) describe estaturas y pesos de la población con campanas normales.",
    "Las pruebas PLANEA (SEP) y PISA (OCDE) escalan sus puntajes a una normal con media y desviación fijas para comparar generaciones y países.",
    "Las escalas de coeficiente intelectual se diseñan normales con μ = 100 y σ = 15.",
  ],

  fuente: "MCCEMS 2025 — Pensamiento Matemático VI «Pensamiento estadístico y probabilístico», contenido formativo: Distribución normal · Medidas de tendencia central · Medidas de dispersión.",
};
