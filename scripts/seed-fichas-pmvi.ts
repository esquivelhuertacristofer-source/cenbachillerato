/**
 * Seed de fichas de biblioteca para PM-VI (Pensamiento Matemático VI — Estadística y Probabilidad).
 * 21 fichas temáticas alineadas al MCCEMS 2025, Semestre 6.
 *
 * Uso: npx tsx scripts/seed-fichas-pmvi.ts
 * Idempotente: upsert por campo "slug".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

// ---------------------------------------------------------------------------
// FICHAS
// ---------------------------------------------------------------------------

const FICHAS_PMVI = [
  // ── 1 ── Estadística descriptiva — básico ────────────────────────────────
  {
    slug: "pm-vi-estadistica-descriptiva-inegi-enigh",
    titulo: "¿Qué es la estadística? Variables y el ENIGH del INEGI",
    categoria: "Estadística descriptiva",
    conceptos_clave: ["estadística descriptiva", "estadística inferencial", "variable cuantitativa", "variable cualitativa", "ENIGH", "INEGI"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La estadística es la ciencia que recopila, organiza, analiza e interpreta datos para tomar decisiones bajo incertidumbre. Se divide en dos grandes ramas: la estadística descriptiva, que resume y presenta datos de forma comprensible (tablas, gráficas, medidas resumen), y la estadística inferencial, que usa muestras para hacer generalizaciones sobre poblaciones completas con cierto nivel de confianza. Ambas ramas son complementarias y aparecen juntas en cualquier estudio serio.",
        },
        {
          tipo: "subtitulo",
          contenido: "Variables cuantitativas y cualitativas",
        },
        {
          tipo: "lista",
          items: [
            "Variable cuantitativa discreta: toma valores enteros contables. Ejemplos: número de hijos, número de habitaciones en un hogar.",
            "Variable cuantitativa continua: puede tomar cualquier valor en un intervalo real. Ejemplos: ingreso mensual en pesos, peso corporal en kilogramos.",
            "Variable cualitativa nominal: categorías sin orden natural. Ejemplos: estado de residencia, tipo de vivienda (propia, rentada, prestada).",
            "Variable cualitativa ordinal: categorías con orden natural pero sin distancia numérica definida. Ejemplos: nivel educativo (primaria, secundaria, bachillerato, superior).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "El ENIGH: estadística oficial de México",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Encuesta Nacional de Ingresos y Gastos de los Hogares (ENIGH) es elaborada cada dos años por el INEGI y constituye la fuente estadística más importante sobre el bienestar económico de las familias mexicanas. En su edición 2022 levantó información de más de 95,000 hogares en todo el país, midiendo variables como ingreso corriente total, gasto en alimentos, acceso a servicios de salud y características de la vivienda. El ENIGH es un ejemplo perfecto de estadística descriptiva (tablas de distribución del ingreso) e inferencial (los resultados de la muestra se generalizan a los 35 millones de hogares del país).",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La distinción entre variable cuantitativa y cualitativa determina qué herramientas estadísticas se pueden usar. Para variables cuantitativas se calculan medias, varianzas y coeficientes de correlación. Para variables cualitativas se usan tablas de contingencia, proporciones y pruebas como chi-cuadrada. Clasificar mal el tipo de variable lleva a análisis incorrectos y conclusiones sin sentido.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El INEGI publica los microdatos del ENIGH de forma abierta en su sitio web. Cualquier persona puede descargar la base de datos y reproducir o ampliar los análisis oficiales. Esta transparencia es un principio fundamental de la estadística pública: los datos son un bien común.",
        },
      ],
    },
  },

  // ── 2 ── Estadística descriptiva — intermedio ─────────────────────────────
  {
    slug: "pm-vi-tablas-frecuencia-histogramas",
    titulo: "Tablas de frecuencias e histogramas: distribución del ingreso en México",
    categoria: "Estadística descriptiva",
    conceptos_clave: ["frecuencia absoluta", "frecuencia relativa", "frecuencia acumulada", "histograma", "clase o intervalo", "ENIGH 2022"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una tabla de frecuencias organiza los datos en clases o intervalos y cuenta cuántos datos caen en cada clase. Para variables continuas como el ingreso mensual, se definen k intervalos de igual amplitud (o de amplitud variable para capturar asimetrías) y se cuentan las observaciones en cada uno. La tabla tiene tres columnas principales: frecuencia absoluta (n_i), frecuencia relativa (f_i = n_i / N) y frecuencia acumulada (F_i = suma de f_j para j hasta i). La suma de todas las frecuencias relativas es siempre 1.",
        },
        {
          tipo: "subtitulo",
          contenido: "Construcción de una tabla de frecuencias: paso a paso",
        },
        {
          tipo: "lista",
          items: [
            "Paso 1 — Determinar el rango: rango = valor máximo − valor mínimo.",
            "Paso 2 — Elegir el número de clases k. Regla de Sturges: k = 1 + 3.322 × log10(N), donde N es el número de datos.",
            "Paso 3 — Calcular la amplitud de cada clase: amplitud = rango / k. Redondear hacia arriba.",
            "Paso 4 — Definir los límites de cada clase: primer intervalo desde el mínimo, cada intervalo incluye su límite inferior y excluye el superior (convención [ , )).",
            "Paso 5 — Contar la frecuencia absoluta n_i en cada clase.",
            "Paso 6 — Calcular f_i = n_i / N y F_i acumulada.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Histograma y distribución del ingreso ENIGH 2022",
        },
        {
          tipo: "parrafo",
          contenido:
            "El histograma es la representación gráfica de la tabla de frecuencias: en el eje horizontal se colocan los intervalos (sin espacios entre las barras, porque los datos son continuos) y en el eje vertical la frecuencia relativa o la densidad de frecuencia (f_i / amplitud). Según el ENIGH 2022, el ingreso corriente trimestral promedio por hogar en México fue de 58,741 pesos, pero la distribución está fuertemente sesgada a la derecha: la mayoría de los hogares se concentra en los rangos bajos y hay una cola larga de hogares con ingresos muy altos. Este sesgo hace que la media sea mayor que la mediana, lo que tiene implicaciones importantes para las políticas de bienestar.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La frecuencia relativa f_i es adimensional y permite comparar distribuciones de diferentes tamaños muestrales. La frecuencia acumulada F_i al 50% corresponde a la mediana. Si F_i = 0.80 en la clase [20,000 − 25,000), significa que el 80% de los hogares tiene ingreso menor a 25,000 pesos trimestrales: un dato muy concreto sobre la desigualdad en México.",
        },
      ],
    },
  },

  // ── 3 ── Estadística descriptiva — avanzado ───────────────────────────────
  {
    slug: "pm-vi-distribucion-frecuencias-forma-sesgo",
    titulo: "Forma de la distribución: sesgo, simetría y bimodalidad en salarios ENOE",
    categoria: "Estadística descriptiva",
    conceptos_clave: ["sesgo positivo", "sesgo negativo", "distribución simétrica", "distribución bimodal", "asimetría", "ENOE", "INEGI"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La forma de la distribución de frecuencias describe cómo se distribuyen los datos alrededor del centro y hacia los extremos. Las tres características principales son la asimetría (sesgo), la curtosis (qué tan puntiaguda o plana es la distribución) y si hay uno o varios picos (modalidad). Reconocer la forma de una distribución permite elegir las medidas resumen correctas y anticipar qué análisis estadísticos son apropiados.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los cuatro tipos de forma",
        },
        {
          tipo: "lista",
          items: [
            "Distribución simétrica: la media, la mediana y la moda coinciden. La mitad izquierda es espejo de la derecha. Ejemplo: estaturas de una población homogénea.",
            "Sesgo positivo (cola derecha larga): la media es mayor que la mediana, que a su vez es mayor que la moda. La cola se extiende hacia valores altos. Ejemplo: ingresos, precios de vivienda, tiempos de espera.",
            "Sesgo negativo (cola izquierda larga): la media es menor que la mediana. La cola se extiende hacia valores bajos. Ejemplo: calificaciones en un examen muy fácil donde la mayoría obtiene notas altas.",
            "Distribución bimodal: tiene dos picos (dos modas). Señal de que la muestra mezcla dos subpoblaciones distintas. Ejemplo: salarios en una empresa con obreros y directivos sin categorías intermedias.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Distribución de salarios en México según la ENOE",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Encuesta Nacional de Ocupación y Empleo (ENOE) del INEGI registra trimestralmente los ingresos laborales de más de 300,000 trabajadores. Los datos muestran una distribución marcadamente sesgada a la derecha: la gran mayoría de los trabajadores gana entre 1 y 4 salarios mínimos (en 2024, entre 2,686 y 10,744 pesos mensuales), pero existe una cola derecha larga de trabajadores de muy altos ingresos. En 2023, el ingreso promedio por trabajo fue de 7,428 pesos mensuales, mientras que la mediana se ubicó en torno a 5,500 pesos: la brecha entre media y mediana evidencia el sesgo positivo y la concentración de altos salarios en pocos trabajadores.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En distribuciones sesgadas positivamente, reportar la media puede ser engañoso porque los valores extremos la jalan hacia arriba. Por eso el CONEVAL y otras instituciones prefieren usar la mediana del ingreso per cápita del hogar para medir la pobreza: la mediana es resistente a valores extremos y representa mejor la situación del trabajador típico.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El coeficiente de asimetría de Pearson se calcula como: asimetría = 3 × (media − mediana) / desviación estándar. Un valor positivo confirma sesgo a la derecha; uno negativo, sesgo a la izquierda. Para la distribución de salarios mexicana, este coeficiente suele ser mayor a 1, indicando asimetría fuerte.",
        },
      ],
    },
  },

  // ── 4 ── Medidas de tendencia central y dispersión — básico ──────────────
  {
    slug: "pm-vi-media-mediana-moda-ingreso-mexico",
    titulo: "Media, mediana y moda: ingreso promedio vs mediano en México",
    categoria: "Medidas de tendencia central y dispersión",
    conceptos_clave: ["media aritmética", "mediana", "moda", "tendencia central", "ingreso mediano", "CONEVAL"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las medidas de tendencia central son valores representativos que resumen dónde se concentra el grueso de los datos. Las tres principales son la media aritmética (promedio), la mediana (valor central que divide la distribución en dos mitades iguales) y la moda (valor o categoría más frecuente). Cada una tiene ventajas y limitaciones, y la elección entre ellas depende de la forma de la distribución y del propósito del análisis.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cálculo y fórmulas",
        },
        {
          tipo: "lista",
          items: [
            "Media aritmética: x-barra = (x1 + x2 + ... + xn) / n = (suma de xi) / n. Sensible a valores extremos.",
            "Mediana: si n es impar, la mediana es el valor en la posición (n+1)/2 de los datos ordenados. Si n es par, es el promedio de los valores en las posiciones n/2 y (n/2)+1.",
            "Moda: el valor que aparece con mayor frecuencia. En datos agrupados, es la marca de clase con mayor frecuencia. Puede no existir (si todos los valores son únicos) o haber varias modas.",
            "Para datos simétricos: media = mediana = moda. Para datos con sesgo positivo: moda < mediana < media.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Por qué el gobierno usa la mediana para medir bienestar",
        },
        {
          tipo: "parrafo",
          contenido:
            "El CONEVAL (Consejo Nacional de Evaluación de la Política de Desarrollo Social) usa el ingreso mediano del hogar, no el promedio, como referencia para medir el bienestar económico. La razón es estadísticamente precisa: el ingreso en México está muy sesgado a la derecha. Según ENIGH 2022, el ingreso corriente trimestral promedio por hogar fue de 58,741 pesos, pero la mediana fue de aproximadamente 40,000 pesos. La diferencia de casi 19,000 pesos (32% más alta la media) se debe a que un pequeño grupo de hogares con ingresos muy elevados jala la media hacia arriba, haciendo que el promedio sobreestime el nivel de vida del hogar típico. La mediana, al no verse afectada por estos valores extremos, representa mejor la realidad del hogar en el centro de la distribución.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Cuando escuches que el ingreso promedio de los mexicanos subió, pregunta: ¿media o mediana? Si solo subió la media y no la mediana, significa que los que ya ganaban más ahora ganan todavía más, pero el hogar típico no mejoró. Esta distinción es esencial para el análisis crítico de datos económicos y sociales.",
        },
      ],
    },
  },

  // ── 5 ── Medidas de tendencia central y dispersión — intermedio ───────────
  {
    slug: "pm-vi-varianza-desviacion-estandar-gini",
    titulo: "Varianza y desviación estándar: desigualdad salarial en México",
    categoria: "Medidas de tendencia central y dispersión",
    conceptos_clave: ["varianza", "desviación estándar", "dispersión", "coeficiente de Gini", "CONEVAL", "desigualdad salarial"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las medidas de tendencia central no son suficientes para describir un conjunto de datos: dos distribuciones pueden tener la misma media pero diferente dispersión (qué tan alejados están los datos del centro). Las medidas de dispersión cuantifican esa variabilidad. El rango (máximo − mínimo) es el más simple pero muy sensible a valores extremos. La varianza y la desviación estándar son las medidas más usadas porque tienen propiedades matemáticas muy útiles.",
        },
        {
          tipo: "subtitulo",
          contenido: "Fórmulas de varianza y desviación estándar",
        },
        {
          tipo: "lista",
          items: [
            "Varianza poblacional: sigma² = suma de (xi − mu)² / N, donde mu es la media poblacional y N el tamaño de la población.",
            "Varianza muestral: s² = suma de (xi − x-barra)² / (n−1), donde x-barra es la media muestral. Se divide entre n−1 (no n) para que s² sea un estimador insesgado de sigma².",
            "Desviación estándar: s = raíz cuadrada de s². Tiene las mismas unidades que los datos originales, a diferencia de la varianza.",
            "La desviación estándar mide la distancia promedio (cuadrática) de cada dato respecto a la media. Un s grande indica datos muy dispersos; un s pequeño indica datos concentrados alrededor de la media.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Desigualdad salarial y el coeficiente de Gini",
        },
        {
          tipo: "parrafo",
          contenido:
            "La desviación estándar de los salarios mide la dispersión salarial en términos absolutos. En México, la desviación estándar del ingreso laboral mensual es muy alta (superior a 8,000 pesos, comparable o mayor a la media misma), lo que refleja una gran heterogeneidad salarial. El CONEVAL complementa este análisis con el coeficiente de Gini, que mide desigualdad relativa en una escala de 0 a 1: Gini = 0 significa igualdad perfecta (todos ganan lo mismo) y Gini = 1 significa desigualdad máxima (una persona tiene todo el ingreso). México tiene un coeficiente de Gini de ingreso de aproximadamente 0.43 según ENIGH 2022, ubicándose entre los países con mayor desigualdad de América Latina.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La varianza muestral usa n−1 en el denominador (grados de libertad) porque al calcular las desviaciones respecto a x-barra (y no a mu), se pierde un grado de libertad: las n desviaciones (xi − x-barra) suman siempre cero, por lo que solo n−1 de ellas son independientes. Usar n en lugar de n−1 subestimaría sistemáticamente la variabilidad de la población.",
        },
      ],
    },
  },

  // ── 6 ── Medidas de tendencia central y dispersión — avanzado ────────────
  {
    slug: "pm-vi-cuartiles-percentiles-boxplot-pisa",
    titulo: "Cuartiles, percentiles y boxplot: calificaciones PISA 2022 en México",
    categoria: "Medidas de tendencia central y dispersión",
    conceptos_clave: ["cuartiles", "percentiles", "diagrama de caja", "boxplot", "rango intercuartílico", "outlier", "PISA 2022"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los cuartiles dividen la distribución ordenada en cuatro partes iguales: Q1 (percentil 25) separa el 25% inferior del 75% superior; Q2 (percentil 50) es la mediana; Q3 (percentil 75) separa el 75% inferior del 25% superior. El rango intercuartílico (RIC = Q3 − Q1) mide la dispersión del 50% central de los datos y es resistente a valores extremos. El diagrama de caja (boxplot) representa visualmente estos cinco resúmenes: mínimo, Q1, mediana, Q3 y máximo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Construcción del boxplot e identificación de outliers",
        },
        {
          tipo: "lista",
          items: [
            "La caja va de Q1 a Q3, con una línea interna en Q2 (mediana). La amplitud de la caja es el RIC.",
            "Los bigotes se extienden hasta: límite inferior = Q1 − 1.5 × RIC; límite superior = Q3 + 1.5 × RIC.",
            "Cualquier dato fuera de [Q1 − 1.5×RIC, Q3 + 1.5×RIC] se llama outlier o valor atípico y se grafica como un punto individual.",
            "Si la mediana está más cerca de Q1 que de Q3, la distribución tiene sesgo positivo (cola derecha más larga).",
            "Si los bigotes tienen diferente longitud, también señalan asimetría en la distribución.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Resultados PISA 2022 en México: distribución por percentil",
        },
        {
          tipo: "parrafo",
          contenido:
            "La prueba PISA 2022 de la OCDE evaluó a estudiantes de 15 años en matemáticas, lectura y ciencias. México obtuvo un puntaje promedio de 395 puntos en matemáticas (por debajo del promedio OCDE de 472). Pero el promedio no cuenta toda la historia: la distribución de puntajes mexicanos es amplia. Aproximadamente el 25% de los estudiantes mexicanos (Q1) obtuvo menos de 340 puntos; la mediana (Q2) estuvo cerca de 390 puntos; el 75% (Q3) llegó a unos 445 puntos. El RIC fue de aproximadamente 105 puntos. Los outliers superiores (estudiantes con más de 600 puntos) existen pero son pocos, mostrando la alta desigualdad educativa: el estudiante en el percentil 90 de México obtiene un puntaje similar al estudiante en el percentil 50 de Finlandia.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El percentil p de un conjunto de datos es el valor debajo del cual cae el p% de las observaciones. El percentil 90 en una evaluación significa que ese estudiante supera al 90% de sus compañeros. Los percentiles son más informativos que las notas absolutas para comparaciones entre grupos con diferentes escalas, como comparar resultados PISA entre países con distintos sistemas educativos.",
        },
      ],
    },
  },

  // ── 7 ── Medidas de tendencia central y dispersión — avanzado ────────────
  {
    slug: "pm-vi-coeficiente-variacion-tipo-cambio",
    titulo: "Coeficiente de variación: comparar volatilidad del peso y del petróleo Brent",
    categoria: "Medidas de tendencia central y dispersión",
    conceptos_clave: ["coeficiente de variación", "CV", "dispersión relativa", "tipo de cambio", "precio del petróleo", "Banxico"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La desviación estándar mide la dispersión en las mismas unidades que los datos originales. Esto hace imposible comparar directamente la variabilidad de dos conjuntos de datos con unidades o medias muy diferentes. ¿Es más variable el tipo de cambio peso/dólar (con valores alrededor de 17 pesos por dólar) o el precio del petróleo Brent (con valores alrededor de 80 dólares por barril)? Para responder esta pregunta se usa el coeficiente de variación (CV), que estandariza la dispersión dividiéndola por la media.",
        },
        {
          tipo: "subtitulo",
          contenido: "Fórmula e interpretación",
        },
        {
          tipo: "lista",
          items: [
            "CV = (s / x-barra) × 100%. Expresa la desviación estándar como porcentaje de la media.",
            "CV bajo (menos del 15%): datos relativamente homogéneos, poca variabilidad relativa.",
            "CV alto (más del 30%): datos muy heterogéneos, alta variabilidad relativa.",
            "El CV es adimensional: permite comparar variabilidad entre variables con distintas unidades o distintas magnitudes.",
            "Limitación: el CV no es válido si la media es cercana a cero o negativa, pues el denominador pierde sentido.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Comparación de volatilidades con datos de Banxico",
        },
        {
          tipo: "parrafo",
          contenido:
            "Según datos históricos publicados por el Banco de México (Banxico) para 2023: el tipo de cambio FIX peso/dólar tuvo una media aproximada de 17.20 pesos y una desviación estándar de 0.85 pesos, dando un CV de (0.85/17.20)×100 = 4.9%. El precio del petróleo Brent en el mismo período tuvo una media de 82 dólares por barril y una desviación estándar de 11 dólares, dando un CV de (11/82)×100 = 13.4%. Aunque la desviación estándar del petróleo en unidades absolutas (11 dólares) parece mucho mayor que la del tipo de cambio (0.85 pesos), el CV revela que el petróleo Brent es aproximadamente 2.7 veces más volátil de forma relativa que el peso mexicano frente al dólar en ese período.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En finanzas, el coeficiente de variación es una medida básica de riesgo por unidad de retorno esperado. Un inversionista que compara dos activos preferirá el que tenga menor CV si ambos tienen el mismo retorno esperado: obtiene el mismo rendimiento con menos variabilidad (menos riesgo). Esta lógica es la base de la teoría moderna de portafolios desarrollada por Harry Markowitz (Premio Nobel de Economía 1990).",
        },
      ],
    },
  },

  // ── 8 ── Probabilidad clásica y frecuentista — básico ────────────────────
  {
    slug: "pm-vi-probabilidad-laplace-loteria-nacional",
    titulo: "Espacio muestral y probabilidad clásica: la Lotería Nacional como experimento aleatorio",
    categoria: "Probabilidad clásica y frecuentista",
    conceptos_clave: ["experimento aleatorio", "espacio muestral", "evento", "probabilidad de Laplace", "Lotería Nacional", "equiprobabilidad"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un experimento aleatorio es aquel cuyo resultado no puede predecirse con certeza antes de realizarlo, aunque sí se conocen todos los posibles resultados. El espacio muestral (Omega) es el conjunto de todos los resultados posibles del experimento. Un evento (A) es cualquier subconjunto del espacio muestral. La probabilidad clásica o de Laplace se aplica cuando todos los resultados del espacio muestral son igualmente posibles (equiprobables): P(A) = número de resultados favorables a A / número total de resultados en Omega.",
        },
        {
          tipo: "subtitulo",
          contenido: "La Lotería Nacional como experimento aleatorio clásico",
        },
        {
          tipo: "parrafo",
          contenido:
            "El Sorteo Mayor de la Lotería Nacional para la Asistencia Pública de México vende billetes con números del 00000 al 99999 (100,000 billetes numerados). En el sorteo se extrae un número ganador al azar. El espacio muestral tiene 100,000 elementos equiprobables. La probabilidad de que un billete específico gane el primer premio es P = 1 / 100,000 = 0.00001 = 0.001%. Si una persona compra 10 billetes diferentes, la probabilidad de ganar es P = 10 / 100,000 = 0.01%. La probabilidad de no ganar con un billete es 1 − 0.00001 = 0.99999 = 99.999%. La regla del complemento establece que P(A complemento) = 1 − P(A): siempre se cumple que la probabilidad de que ocurra A más la probabilidad de que no ocurra suman 1.",
        },
        {
          tipo: "lista",
          items: [
            "Propiedades axiomáticas: 0 ≤ P(A) ≤ 1 para cualquier evento A.",
            "Certeza: P(Omega) = 1. Algún resultado siempre ocurre.",
            "Imposibilidad: P(conjunto vacío) = 0. El evento vacío nunca ocurre.",
            "Complemento: P(A complemento) = 1 − P(A).",
            "Adición para eventos mutuamente excluyentes: P(A unión B) = P(A) + P(B) si A y B son disjuntos.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La probabilidad de Laplace requiere que el espacio muestral sea finito y todos los resultados sean equiprobables. Si los resultados no son equiprobables (como en los dados cargados o en una ruleta sesgada), la probabilidad clásica no aplica y es necesario usar la probabilidad frecuentista (basada en datos históricos) o la probabilidad subjetiva (basada en grado de creencia).",
        },
      ],
    },
  },

  // ── 9 ── Probabilidad clásica y frecuentista — intermedio ────────────────
  {
    slug: "pm-vi-probabilidad-frecuentista-lluvia-cdmx",
    titulo: "Probabilidad frecuentista y Ley de los Grandes Números: lluvia en CDMX",
    categoria: "Probabilidad clásica y frecuentista",
    conceptos_clave: ["probabilidad frecuentista", "frecuencia relativa", "Ley de los Grandes Números", "simulación de Monte Carlo", "Servicio Meteorológico Nacional"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La probabilidad frecuentista define la probabilidad de un evento como el límite de su frecuencia relativa cuando el número de repeticiones del experimento tiende a infinito: P(A) = lim(n→infinito) de (n_A / n), donde n_A es el número de veces que ocurre A en n repeticiones. Este enfoque no requiere equiprobabilidad y es aplicable a cualquier fenómeno que pueda repetirse bajo las mismas condiciones: fenómenos físicos, biológicos, económicos y meteorológicos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ley de los Grandes Números",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Ley de los Grandes Números establece que, a medida que n aumenta, la frecuencia relativa n_A / n converge hacia la probabilidad verdadera P(A). Por eso, con muestras pequeñas los resultados son erráticos (mucha variabilidad), pero con muestras grandes la frecuencia relativa se estabiliza cerca del valor verdadero. Esta ley es el fundamento matemático de las encuestas, los seguros, los casinos y la epidemiología: todos dependen de que las frecuencias observadas en muchas repeticiones reflejan la probabilidad real.",
        },
        {
          tipo: "subtitulo",
          contenido: "Probabilidad de lluvia en CDMX según registros históricos",
        },
        {
          tipo: "lista",
          items: [
            "El Servicio Meteorológico Nacional (SMN) de México registra datos climáticos desde 1941 en estaciones de toda la CDMX.",
            "Con datos históricos de 80 años, se puede estimar P(lluvia en agosto) = número de días con lluvia en agosto / total de días de agosto en 80 años.",
            "Los registros del SMN indican que agosto es el mes más lluvioso en CDMX: aproximadamente el 70-80% de los días de agosto tienen lluvia registrada.",
            "Esto significa P(lluvia en un día de agosto en CDMX) ≈ 0.75. No es predicción, es probabilidad estimada de largo plazo.",
            "Simulación de Monte Carlo: repetir el experimento aleatoriamente muchas veces (en computadora) para estimar probabilidades complejas que no tienen fórmula cerrada.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El pronóstico meteorológico moderno combina la probabilidad frecuentista (datos históricos de décadas) con modelos dinámicos de la atmósfera (ecuaciones diferenciales). Cuando el SMN dice que hay 60% de probabilidad de lluvia mañana, usa modelos que simulan el estado futuro de la atmósfera miles de veces con ligeras variaciones en las condiciones iniciales: el 60% refleja cuántas de esas simulaciones produjeron lluvia.",
        },
      ],
    },
  },

  // ── 10 ── Probabilidad clásica y frecuentista — avanzado ─────────────────
  {
    slug: "pm-vi-combinatoria-probabilidad-quiniela",
    titulo: "Combinatoria y probabilidad: ¿cuántos resultados tiene la quiniela de Liga MX?",
    categoria: "Probabilidad clásica y frecuentista",
    conceptos_clave: ["permutaciones", "combinaciones", "regla del producto", "factorial", "espacio muestral grande", "Liga MX"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La combinatoria es la rama de las matemáticas que cuenta el número de formas de organizar o seleccionar objetos. Es fundamental para calcular probabilidades cuando el espacio muestral es grande: en lugar de listar todos los resultados posibles, se cuenta usando fórmulas. Las dos herramientas principales son las permutaciones (el orden importa) y las combinaciones (el orden no importa), además de la regla del producto (también llamada principio fundamental del conteo).",
        },
        {
          tipo: "subtitulo",
          contenido: "Principio fundamental del conteo y fórmulas",
        },
        {
          tipo: "lista",
          items: [
            "Regla del producto: si un procedimiento se realiza en k pasos y el paso i tiene n_i opciones independientes, el total de resultados es n_1 × n_2 × ... × n_k.",
            "Permutaciones de n objetos tomados de r en r: P(n,r) = n! / (n−r)! El orden importa.",
            "Combinaciones de n objetos tomados de r en r: C(n,r) = n! / (r! × (n−r)!) El orden no importa.",
            "Factorial: n! = n × (n−1) × (n−2) × ... × 2 × 1. Por definición 0! = 1.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La quiniela de fútbol: 9 partidos, 3 resultados posibles cada uno",
        },
        {
          tipo: "parrafo",
          contenido:
            "En la quiniela de fútbol de la Liga MX, cada partido puede terminar en victoria local (1), empate (X) o victoria visitante (2). Si hay 9 partidos en una jornada, ¿cuántos resultados distintos puede tener la quiniela completa? Por la regla del producto: 3 × 3 × 3 × 3 × 3 × 3 × 3 × 3 × 3 = 3^9 = 19,683 resultados posibles. Si alguien apuesta a un resultado específico de los 9 partidos y todos son equiprobables, la probabilidad de acertar todos es 1/19,683 ≈ 0.0051%, menos de 1 en 19,000. Para la quiniela española con 15 partidos el espacio muestral es 3^15 = 14,348,907 resultados: la probabilidad de acertar todos al azar es de aproximadamente 1 en 14 millones.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La diferencia entre permutaciones y combinaciones radica en si el orden importa. Si se eligen 3 jugadores para un podio (1er, 2do, 3er lugar) de 10 candidatos, el orden importa: usar P(10,3) = 720. Si se eligen 3 jugadores para un equipo (sin posición asignada), el orden no importa: usar C(10,3) = 120. La confusión entre ambas es uno de los errores más frecuentes en problemas de probabilidad.",
        },
      ],
    },
  },

  // ── 11 ── Probabilidad condicional y Bayes — básico ───────────────────────
  {
    slug: "pm-vi-probabilidad-condicional-prueba-covid",
    titulo: "Probabilidad condicional: prueba positiva de COVID-19 e interpretación correcta",
    categoria: "Probabilidad condicional y Bayes",
    conceptos_clave: ["probabilidad condicional", "sensibilidad", "especificidad", "valor predictivo positivo", "prueba diagnóstica", "IMSS"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La probabilidad condicional de A dado B, escrita P(A|B), es la probabilidad de que ocurra el evento A sabiendo que ya ocurrió el evento B. La fórmula es: P(A|B) = P(A intersección B) / P(B), siempre que P(B) mayor que 0. La probabilidad condicional actualiza la probabilidad de A cuando se tiene nueva información (el hecho de que B ocurrió). Esto la convierte en la herramienta fundamental del diagnóstico médico, los sistemas de recomendación y la inteligencia artificial.",
        },
        {
          tipo: "subtitulo",
          contenido: "Sensibilidad, especificidad y el valor predictivo de una prueba",
        },
        {
          tipo: "lista",
          items: [
            "Sensibilidad de una prueba: P(prueba positiva | enfermo). Qué tan bien detecta a los enfermos. Una prueba con sensibilidad = 0.90 deja escapar al 10% de los enfermos (falsos negativos).",
            "Especificidad de una prueba: P(prueba negativa | sano). Qué tan bien descarta a los sanos. Una especificidad = 0.95 produce un 5% de falsos positivos.",
            "Valor predictivo positivo (VPP): P(enfermo | prueba positiva). Esto es lo que realmente queremos saber: si doy positivo, ¿qué tan probable es que realmente esté enfermo?",
            "El VPP depende no solo de sensibilidad y especificidad, sino también de la prevalencia de la enfermedad en la población: a menor prevalencia, menor VPP aunque la prueba sea buena.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Las pruebas de antígeno para COVID-19 usadas por el IMSS tienen una sensibilidad aproximada de 0.80 y una especificidad de 0.97. Si la prevalencia de COVID-19 en la comunidad es del 5% (en un período de baja circulación viral), el valor predictivo positivo calculado por la fórmula de Bayes resulta ser aproximadamente 58%. Esto significa que de cada 100 personas con prueba de antígeno positiva, solo unas 58 están realmente enfermas en ese contexto: una sorpresa para quienes asumen que prueba positiva significa certeza de enfermedad.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Confundir P(prueba positiva | enfermo) con P(enfermo | prueba positiva) es la falacia de la transposición condicional, uno de los errores más comunes en el razonamiento médico y cotidiano. La primera es la sensibilidad (una característica de la prueba); la segunda es el VPP (depende también de la prevalencia). El teorema de Bayes permite calcular la segunda a partir de la primera.",
        },
      ],
    },
  },

  // ── 12 ── Probabilidad condicional y Bayes — intermedio ──────────────────
  {
    slug: "pm-vi-regla-multiplicacion-independencia-calidad",
    titulo: "Independencia de eventos y regla de multiplicación: control de calidad de tortillas",
    categoria: "Probabilidad condicional y Bayes",
    conceptos_clave: ["eventos independientes", "eventos dependientes", "regla de multiplicación", "muestreo con reemplazo", "muestreo sin reemplazo", "control de calidad"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Dos eventos A y B son independientes si la ocurrencia de uno no afecta la probabilidad del otro: P(A|B) = P(A) y P(B|A) = P(B). En ese caso, la regla de multiplicación se simplifica a: P(A intersección B) = P(A) × P(B). Si los eventos son dependientes, la regla general es: P(A intersección B) = P(A) × P(B|A). La independencia es una propiedad que debe verificarse o justificarse en cada problema, no asumirse.",
        },
        {
          tipo: "subtitulo",
          contenido: "Muestreo con y sin reemplazo: el efecto en la independencia",
        },
        {
          tipo: "parrafo",
          contenido:
            "En el control de calidad de una producción de tortillas bajo la norma NOM-247-SSA1-2008 (Productos y servicios — Cereales y sus productos — Disposiciones y especificaciones sanitarias), se inspeccionan lotes para verificar que el porcentaje de piezas defectuosas no supere el límite permitido. Supongamos un lote de 100 tortillas con 10 defectuosas (10%). Si tomamos 2 tortillas al azar: Con reemplazo (devolvemos la primera antes de sacar la segunda): P(ambas defectuosas) = (10/100) × (10/100) = 0.01. Los dos eventos son independientes porque la composición del lote no cambia. Sin reemplazo (guardamos la primera): P(ambas defectuosas) = (10/100) × (9/99) = 0.0091. Los eventos son dependientes: si la primera fue defectuosa, quedan 9 defectuosas de 99 tortillas.",
        },
        {
          tipo: "lista",
          items: [
            "La diferencia entre muestreo con y sin reemplazo es pequeña cuando N (tamaño del lote) es grande respecto a n (tamaño de la muestra): la independencia aproximada es válida si n/N menor que 0.05.",
            "En lotes pequeños, la dependencia importa y se usa la distribución hipergeométrica (no la binomial).",
            "Para verificar independencia formal: A y B son independientes si y solo si P(A intersección B) = P(A) × P(B). Esta igualdad debe cumplirse, no asumirse.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La regla general de multiplicación P(A intersección B) = P(A) × P(B|A) siempre funciona, independientemente de si A y B son dependientes o independientes. La simplificación P(A) × P(B) solo aplica cuando se ha verificado que los eventos son independientes. Usar la simplificación sin verificar la independencia es un error conceptual grave.",
        },
      ],
    },
  },

  // ── 13 ── Probabilidad condicional y Bayes — intermedio ──────────────────
  {
    slug: "pm-vi-teorema-bayes-diagnostico-medico",
    titulo: "Teorema de Bayes: actualizar probabilidades con nueva evidencia",
    categoria: "Probabilidad condicional y Bayes",
    conceptos_clave: ["Teorema de Bayes", "probabilidad a priori", "probabilidad a posteriori", "verosimilitud", "diagnóstico médico", "CENAPRECE"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El teorema de Bayes es el mecanismo formal para actualizar probabilidades cuando se obtiene nueva evidencia. Si conocemos la probabilidad a priori P(H) de una hipótesis H, y observamos evidencia E con verosimilitud P(E|H), el teorema de Bayes da la probabilidad a posteriori: P(H|E) = P(E|H) × P(H) / P(E), donde P(E) = P(E|H) × P(H) + P(E|H complemento) × P(H complemento). El teorema transforma lo que sabemos antes de observar la evidencia en lo que debemos creer después.",
        },
        {
          tipo: "subtitulo",
          contenido: "Aplicación clásica: diagnóstico médico paso a paso",
        },
        {
          tipo: "lista",
          items: [
            "Definir la hipótesis H: el paciente tiene la enfermedad. P(H) = prevalencia = probabilidad a priori.",
            "Definir la evidencia E: la prueba es positiva. P(E|H) = sensibilidad de la prueba.",
            "Calcular P(E|H complemento) = 1 − especificidad = tasa de falsos positivos.",
            "Aplicar Bayes: P(H|E) = [sensibilidad × prevalencia] / [sensibilidad × prevalencia + (1−especificidad) × (1−prevalencia)].",
            "Interpretar: P(H|E) es el valor predictivo positivo — la probabilidad real de estar enfermo dado que la prueba fue positiva.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "El Centro Nacional de Programas Preventivos y Control de Enfermedades (CENAPRECE) aplica el razonamiento bayesiano en epidemiología para estimar la probabilidad de un brote dado el número de casos reportados. Por ejemplo, si se detectan 3 casos de sarampión en una ciudad con alta cobertura de vacunación (prevalencia natural muy baja), la probabilidad posterior de que sea un brote real vs coincidencia depende de la probabilidad a priori (prevalencia del sarampión en la zona) y de la precisión del diagnóstico. Con prevalencia muy baja, incluso con diagnósticos correctos, la probabilidad posterior puede ser sorprendentemente baja: el denominador P(E) está dominado por los falsos positivos.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Thomas Bayes (1702-1761) nunca publicó en vida el teorema que lleva su nombre. Su amigo Richard Price lo publicó póstumamente en 1763. Durante casi 200 años, el enfoque bayesiano fue controversial porque requiere especificar probabilidades a priori, consideradas subjetivas. Hoy el método bayesiano es fundamental en medicina, inteligencia artificial, astronomía y finanzas: la subjetividad del priori es una ventaja, no un defecto, cuando representa conocimiento real previo.",
        },
      ],
    },
  },

  // ── 14 ── Probabilidad condicional y Bayes — avanzado ────────────────────
  {
    slug: "pm-vi-tablas-contingencia-chi-cuadrada-endutih",
    titulo: "Tablas de contingencia y chi-cuadrada: nivel educativo y acceso a internet (ENDUTIH 2023)",
    categoria: "Probabilidad condicional y Bayes",
    conceptos_clave: ["tabla de contingencia", "chi-cuadrada", "frecuencia esperada", "asociación", "ENDUTIH 2023", "INEGI", "independencia estadística"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una tabla de contingencia (o tabla de doble entrada) organiza datos de dos variables categóricas simultáneamente para examinar si existe asociación entre ellas. Las filas representan las categorías de una variable y las columnas las de la otra; cada celda contiene la frecuencia observada de la combinación correspondiente. Para determinar si la asociación es estadísticamente significativa (o podría deberse al azar del muestreo), se usa la prueba chi-cuadrada de independencia.",
        },
        {
          tipo: "subtitulo",
          contenido: "Prueba chi-cuadrada: lógica e interpretación",
        },
        {
          tipo: "lista",
          items: [
            "Hipótesis nula H_0: las dos variables son independientes (no hay asociación).",
            "Hipótesis alternativa H_1: las dos variables están asociadas.",
            "Frecuencia esperada bajo H_0: E_ij = (total fila i × total columna j) / N total.",
            "Estadístico chi-cuadrada: chi² = suma de (O_ij − E_ij)² / E_ij, sumando sobre todas las celdas.",
            "Si chi² observado mayor que chi² crítico (según la tabla con los grados de libertad apropiados), se rechaza H_0: hay evidencia de asociación.",
            "Grados de libertad: (número de filas − 1) × (número de columnas − 1).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Nivel educativo y acceso a internet en México: ENDUTIH 2023",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Encuesta Nacional sobre Disponibilidad y Uso de Tecnologías de la Información en los Hogares (ENDUTIH 2023) del INEGI reportó que en México el 78.6% de la población de 6 años o más es usuaria de internet. Sin embargo, la tasa de uso no es homogénea: entre personas con educación superior fue del 95.4%, mientras que entre quienes solo tienen educación básica fue del 60.8%. Una tabla de contingencia que cruce nivel educativo (básico, medio superior, superior) con uso de internet (sí/no) mostraría frecuencias observadas muy alejadas de las esperadas bajo independencia. La prueba chi-cuadrada con estos datos produce un estadístico muy grande y un valor-p prácticamente cero, llevando al rechazo rotundo de H_0: el nivel educativo y el acceso a internet están fuertemente asociados en México.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La prueba chi-cuadrada detecta asociación entre variables categóricas, pero no mide la fuerza de la asociación ni la dirección. Para complementar el análisis se usan medidas de asociación como el coeficiente V de Cramér: V = raíz cuadrada de chi² / (N × min(filas−1, columnas−1)), que varía entre 0 (independencia) y 1 (asociación perfecta). Tampoco indica causalidad: que nivel educativo y acceso a internet estén asociados no significa necesariamente que uno causa al otro.",
        },
      ],
    },
  },

  // ── 15 ── Muestreo y estimación — básico ─────────────────────────────────
  {
    slug: "pm-vi-poblacion-muestra-enigh-diseno",
    titulo: "¿Por qué muestrear? Población, muestra y el diseño del ENIGH",
    categoria: "Muestreo y estimación",
    conceptos_clave: ["población", "muestra", "parámetro", "estadístico", "diseño muestral", "INEGI", "ENIGH"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La población es el conjunto completo de elementos que queremos estudiar. La muestra es un subconjunto de la población que se observa realmente. Un parámetro es un valor numérico que describe a la población (como la media poblacional mu o la proporción poblacional p), generalmente desconocido. Un estadístico es el equivalente calculado a partir de la muestra (como la media muestral x-barra o la proporción muestral p-sombrero) y es la aproximación que usamos para inferir el parámetro. El objetivo del muestreo es obtener una muestra representativa que permita hacer inferencias válidas sobre la población.",
        },
        {
          tipo: "subtitulo",
          contenido: "¿Por qué no estudiar toda la población?",
        },
        {
          tipo: "lista",
          items: [
            "Costo: entrevistar a todos los hogares de México costaría miles de millones de pesos y tomaría años.",
            "Tiempo: el censo general se realiza cada 10 años (el más reciente fue en 2020), pero las decisiones de política pública requieren datos actualizados anualmente.",
            "Destrucción del elemento: en control de calidad, verificar si un producto es defectuoso a veces implica destruirlo (pruebas de resistencia, vida útil). Solo se puede probar una muestra.",
            "Precisión suficiente: con una muestra bien diseñada de 100,000 hogares se pueden obtener estimaciones con márgenes de error menores al 1% para México, con una fracción del costo del censo.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "El diseño muestral del ENIGH: cómo encuesta el INEGI",
        },
        {
          tipo: "parrafo",
          contenido:
            "La ENIGH 2022 del INEGI utilizó un diseño probabilístico, estratificado y por conglomerados en dos etapas. Primero se estratificó el país en zonas urbanas y rurales por entidad federativa. Luego se seleccionaron áreas geográficas primarias (AGEB o manzanas) y dentro de ellas se seleccionaron viviendas. En total se levantó información en 95,654 viviendas distribuidas en todo el país. Al ser un diseño probabilístico, cada vivienda del país tiene una probabilidad conocida y calculable de ser seleccionada, lo que permite que los resultados sean representativos de los 35 millones de hogares mexicanos con márgenes de error cuantificables.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La representatividad de una muestra no depende del tamaño de la muestra en relación con la población, sino del diseño del muestreo. Una muestra de 1,000 personas seleccionadas aleatoriamente representa mejor a México que una muestra de 100,000 personas seleccionadas de forma conveniente (por ejemplo, solo usuarios de redes sociales). El sesgo de selección es el enemigo de la representatividad.",
        },
      ],
    },
  },

  // ── 16 ── Muestreo y estimación — intermedio ─────────────────────────────
  {
    slug: "pm-vi-muestreo-tipos-encuesta",
    titulo: "Tipos de muestreo: diseño de encuesta sobre hábitos digitales en bachillerato",
    categoria: "Muestreo y estimación",
    conceptos_clave: ["muestreo aleatorio simple", "muestreo sistemático", "muestreo estratificado", "muestreo por conglomerados", "marco muestral", "diseño de encuesta"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Existen cuatro tipos principales de muestreo probabilístico, cada uno con ventajas y desventajas según las características de la población y los recursos disponibles. Todos comparten el requisito fundamental de que cada elemento de la población tenga una probabilidad conocida y mayor que cero de ser seleccionado. El marco muestral es la lista o mapa de todos los elementos de la población del que se extrae la muestra: su calidad determina en gran parte la calidad del estudio.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los cuatro tipos de muestreo probabilístico",
        },
        {
          tipo: "lista",
          items: [
            "Aleatorio simple: cada elemento tiene la misma probabilidad de ser seleccionado. Se numera toda la población y se eligen n números al azar. Ventaja: simple y sin sesgo. Desventaja: requiere un marco muestral completo y puede ser costoso si la población es dispersa geográficamente.",
            "Sistemático: se elige un elemento al azar de los primeros k = N/n elementos y luego se selecciona cada k-ésimo elemento. Ejemplo: si N=1000 y n=100, k=10. Se elige un número del 1 al 10 al azar (digamos el 3) y se toman los elementos 3, 13, 23, 33,... Ventaja: fácil de implementar. Riesgo: periodicidad en la lista puede introducir sesgo.",
            "Estratificado: se divide la población en subgrupos homogéneos (estratos) y se toma una muestra aleatoria simple de cada estrato. Ejemplo: dividir estudiantes por semestre y género. Ventaja: garantiza representación de todos los subgrupos y reduce la varianza de las estimaciones.",
            "Por conglomerados: la unidad de muestreo es un grupo natural (conglomerado) como un salón de clases, una manzana o una escuela. Se seleccionan conglomerados al azar y se estudia a todos sus miembros (o se hace una segunda etapa de muestreo dentro del conglomerado). Ventaja: reduce costos cuando la población está dispersa. Desventaja: mayor varianza que el aleatorio simple porque los miembros de un conglomerado tienden a parecerse.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Para una encuesta sobre hábitos digitales en un plantel de bachillerato con 1,200 estudiantes distribuidos en 40 grupos, el muestreo por conglomerados sería eficiente: se seleccionan al azar 8 grupos de los 40 y se encuesta a todos los estudiantes de esos grupos (240 estudiantes). Si el objetivo es comparar diferencias por grado y sexo, el muestreo estratificado garantiza representación de cada subgrupo: estratificar por grado (1ro, 2do, 3ro) y sexo (6 estratos) y tomar muestras proporcionales de cada uno.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El muestreo no probabilístico (por conveniencia, por cuotas, bola de nieve) es más barato pero no permite hacer inferencias estadísticamente válidas sobre la población, porque no se puede cuantificar el error de muestreo. Las redes sociales, las encuestas de satisfacción en línea y los estudios de voluntarios son ejemplos de muestreo no probabilístico: sus resultados pueden ser interesantes pero no son generalizables con rigor estadístico.",
        },
      ],
    },
  },

  // ── 17 ── Muestreo y estimación — intermedio ─────────────────────────────
  {
    slug: "pm-vi-margen-error-intervalo-confianza-elecciones",
    titulo: "Margen de error e intervalos de confianza: encuestas electorales México 2024",
    categoria: "Muestreo y estimación",
    conceptos_clave: ["intervalo de confianza", "margen de error", "nivel de confianza", "error estándar", "encuestas electorales", "INE"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un intervalo de confianza es un rango de valores calculado a partir de la muestra que, con un nivel de confianza dado, contiene al verdadero parámetro poblacional. Si se dice que una encuesta tiene un margen de error de más-menos 3 puntos porcentuales con 95% de confianza, significa que si se repitiera el proceso de muestreo 100 veces, en 95 de esas veces el intervalo construido contendría el verdadero valor de la proporción poblacional. No significa que hay 95% de probabilidad de que el parámetro esté en ese intervalo específico: el parámetro es fijo, es el intervalo el que varía.",
        },
        {
          tipo: "subtitulo",
          contenido: "Fórmula del intervalo de confianza para una proporción",
        },
        {
          tipo: "lista",
          items: [
            "Intervalo de confianza para proporción: p-sombrero ± z × raíz cuadrada de [p-sombrero × (1 − p-sombrero) / n].",
            "z = 1.96 para 95% de confianza; z = 2.576 para 99% de confianza; z = 1.645 para 90% de confianza.",
            "El margen de error E = z × raíz cuadrada de [p-sombrero × (1−p-sombrero) / n]. Para n = 1,067 y p-sombrero = 0.5: E = 1.96 × raíz(0.25/1067) = 1.96 × 0.0153 ≈ 0.03 = 3%.",
            "El error estándar de p-sombrero es raíz cuadrada de [p(1−p)/n]: mide la variabilidad del estadístico entre muestras.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Encuestas electorales en México: elecciones 2024",
        },
        {
          tipo: "parrafo",
          contenido:
            "En las elecciones presidenciales de México del 2 de junio de 2024, múltiples casas encuestadoras publicaron encuestas de intención de voto previas. La candidatura ganadora obtuvo en diversas encuestas ventajas que oscilaron entre 15 y 30 puntos porcentuales sobre la segunda candidatura. Con tamaños de muestra típicos de 1,000 a 1,200 personas y margen de error de ±3 puntos porcentuales al 95% de confianza, las encuestas capturaron correctamente la magnitud de la ventaja. El INE supervisa la metodología de las encuestas publicadas en períodos electorales mediante el Registro Nacional de Encuestas, que exige transparencia sobre tamaño de muestra, diseño, período de levantamiento y margen de error.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El margen de error aplica al error de muestreo aleatorio, no a otros tipos de error: sesgo de respuesta (la gente miente o cambia de opinión), sesgo de cobertura (grupos sin teléfono o internet no son encuestados) y sesgo de deseabilidad social. En México, la diferencia entre la intención de voto declarada y el voto real ha sido históricamente mayor que el margen de error técnico, especialmente en elecciones muy polarizadas.",
        },
      ],
    },
  },

  // ── 18 ── Muestreo y estimación — avanzado ───────────────────────────────
  {
    slug: "pm-vi-tamano-muestra-formula-bachillerato",
    titulo: "Tamaño de muestra: diseño de encuesta en un plantel de 800 alumnos",
    categoria: "Muestreo y estimación",
    conceptos_clave: ["tamaño de muestra", "población infinita", "población finita", "factor de corrección", "margen de error", "nivel de confianza"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Determinar el tamaño de muestra adecuado antes de levantar una encuesta es fundamental para que los resultados tengan la precisión requerida. Un tamaño de muestra muy pequeño produce estimaciones poco confiables con márgenes de error grandes. Uno innecesariamente grande desperdicia recursos sin mejorar sustancialmente la precisión. Las fórmulas para calcular n dependen de si la población es considerada infinita (N muy grande) o finita (N conocido y relativamente pequeño).",
        },
        {
          tipo: "subtitulo",
          contenido: "Fórmulas para calcular el tamaño de muestra",
        },
        {
          tipo: "lista",
          items: [
            "Para población infinita (N desconocido o N mayor que 100,000): n = z² × p × (1−p) / E². Donde z es el valor crítico para el nivel de confianza, p es la proporción esperada (usar 0.5 si se desconoce, da el n máximo) y E es el margen de error deseado.",
            "Para población finita de tamaño N conocido: n_ajustado = n_infinita / (1 + (n_infinita − 1) / N). El factor (1 + (n−1)/N) se llama factor de corrección para poblaciones finitas.",
            "A mayor nivel de confianza (z mayor), mayor n requerido.",
            "A menor margen de error E deseado, mayor n requerido: la relación es cuadrática (reducir E a la mitad cuadruplica el tamaño de muestra requerido).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo: encuesta estudiantil en un plantel con 800 alumnos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Se desea encuestar a estudiantes de un plantel de bachillerato con N = 800 alumnos sobre sus hábitos de estudio. Se quiere un margen de error E = 0.05 (5 puntos porcentuales) con 95% de confianza (z = 1.96) y se usa p = 0.5 para maximizar el tamaño de muestra. Paso 1 — n para población infinita: n = (1.96)² × 0.5 × 0.5 / (0.05)² = 3.8416 × 0.25 / 0.0025 = 384.16, redondeando a n = 385. Paso 2 — Factor de corrección para N = 800: n_ajustado = 385 / (1 + (385−1)/800) = 385 / (1 + 0.48) = 385 / 1.48 ≈ 260. Con 260 encuestas (de los 800 alumnos) se obtiene un margen de error de 5% con 95% de confianza. Si se quisiera reducir el margen de error a 3%: n_infinita = (1.96)² × 0.25 / (0.03)² ≈ 1,068; n_ajustado ≈ 1068 / (1 + 1067/800) ≈ 452 alumnos.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La fórmula para n asume muestreo aleatorio simple. Si se usa muestreo estratificado (por ejemplo, estratificar por grado), el tamaño total se mantiene pero se reparte proporcionalmente entre los estratos: n_estrato_k = n_total × (N_k / N). Con estratificación proporcional se garantiza que cada grado esté representado en la muestra con el mismo peso que tiene en la población.",
        },
      ],
    },
  },

  // ── 19 ── Lectura crítica de datos — básico ──────────────────────────────
  {
    slug: "pm-vi-visualizaciones-enganosas-medios",
    titulo: "Visualizaciones engañosas: gráficas truncadas, escalas manipuladas y pastel imposible",
    categoria: "Lectura crítica de datos",
    conceptos_clave: ["gráfica truncada", "eje y truncado", "escala manipulada", "gráfica de pastel", "visualización engañosa", "alfabetización estadística"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las gráficas estadísticas son herramientas poderosas para comunicar información, pero también pueden usarse deliberada o inadvertidamente para distorsionar la realidad. La alfabetización estadística incluye saber leer críticamente una visualización de datos: identificar qué variables se representan, qué escala se usa, qué se incluye y qué se omite. Los tres tipos de distorsión más frecuentes son el eje vertical truncado, las escalas manipuladas y los gráficos de pastel mal construidos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los tres tipos de engaño visual más frecuentes",
        },
        {
          tipo: "lista",
          items: [
            "Eje Y truncado: la gráfica de barras no comienza en cero. Una diferencia pequeña entre dos barras parece enorme cuando el eje empieza en un valor cercano al mínimo de los datos. Señal de alerta: siempre revisar si el eje Y comienza en cero o si hay una ruptura indicada.",
            "Escala manipulada: se cambia la escala del eje para que una tendencia parezca más dramática o más plana de lo que es. Una caída del 2% puede verse como un desplome si el eje Y tiene un rango de 1%. La misma caída puede verse insignificante si el rango es del 200%.",
            "Gráfica de pastel con más del 100%: los sectores de un gráfico circular siempre deben sumar exactamente el 100%. Si suman más (por error de redondeo no corregido o por sumar porcentajes que no son mutuamente excluyentes), la visualización es incorrecta. También es problemático tener más de 6-7 categorías en un pastel: se vuelve ilegible.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "En medios de comunicación mexicanos se han documentado casos de todos estos errores: portadas de periódicos con barras de inflación con eje truncado que hacen que un alza de 0.3 puntos parezca una explosión; gráficas electorales con escalas que amplifican diferencias dentro del margen de error; y gráficas de pastel de resultados electorales donde los sectores claramente no suman 100% porque se incluyeron votos nulos por separado del total sin ajustar los porcentajes. La buena práctica periodística exige mostrar la fuente de los datos, el año, la unidad de medida y la escala completa.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La pregunta que siempre debes hacer ante cualquier gráfica: ¿qué cambiaría si viera el eje Y desde cero? Si la conclusión visual cambia radicalmente al ajustar la escala, la gráfica está sobreenfatizando el efecto. No toda gráfica con eje truncado es deshonesta: en series de tiempo donde las variaciones pequeñas son relevantes (como tipo de cambio o temperatura global), truncar el eje puede ser informativamente válido, pero debe justificarse.",
        },
      ],
    },
  },

  // ── 20 ── Lectura crítica de datos — intermedio ───────────────────────────
  {
    slug: "pm-vi-correlacion-causalidad-pearson",
    titulo: "Correlación vs causalidad: aguacate, vivienda y el peligro de las correlaciones espurias",
    categoria: "Lectura crítica de datos",
    conceptos_clave: ["coeficiente de correlación de Pearson", "correlación espuria", "causalidad", "variable de confusión", "r de Pearson"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El coeficiente de correlación de Pearson (r) mide la fuerza y dirección de la relación lineal entre dos variables cuantitativas. Su fórmula es: r = suma de [(xi − x-barra)(yi − y-barra)] / raíz cuadrada de [suma de (xi − x-barra)² × suma de (yi − y-barra)²]. El valor de r varía entre -1 y 1: r = 1 indica correlación positiva perfecta; r = -1 indica correlación negativa perfecta; r = 0 indica ausencia de relación lineal. Sin embargo, correlación no implica causalidad: dos variables pueden correlacionarse sin que una cause a la otra.",
        },
        {
          tipo: "subtitulo",
          contenido: "Correlaciones espurias: cuando el número engaña",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una correlación espuria ocurre cuando dos variables se correlacionan fuertemente pero no existe ninguna relación causal directa entre ellas, generalmente porque ambas son causadas por una tercera variable (variable de confusión) o por simple coincidencia estadística. El economista Tyler Vigen documentó correlaciones ridículas entre variables sin ninguna relación causal, con r superiores a 0.99. En México se pueden observar correlaciones espurias interesantes: el consumo de aguacate en el país creció sostenidamente entre 2010 y 2020, y los precios de la vivienda en ciudades como Guadalajara y CDMX también subieron en el mismo período. El coeficiente de correlación entre ambas series temporales podría ser alto (r cercano a 0.8 o más), pero sería completamente espurio: ambas variables responden a causas comunes como el crecimiento económico, la inflación general y el aumento de la clase media, no se causan entre sí.",
        },
        {
          tipo: "lista",
          items: [
            "Variable de confusión: una tercera variable C que afecta tanto a A como a B, produciendo correlación entre A y B sin causalidad directa.",
            "Causalidad inversa: B causa A, pero se reporta como si A causara B.",
            "Coincidencia estadística: con miles de variables en el mundo, siempre es posible encontrar pares correlacionados por azar.",
            "Criterios de causalidad de Bradford Hill: temporalidad, fuerza, consistencia, especificidad, plausibilidad biológica — criterios para evaluar si una correlación podría ser causal.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Para establecer causalidad en estadística, la correlación es condición necesaria pero no suficiente. Se requieren diseños experimentales (experimentos controlados aleatorizados) o, cuando no son posibles, diseños cuasiexperimentales (variables instrumentales, diferencias en diferencias, regresión discontinua). En ciencias sociales, el debate entre correlación y causalidad es central: la econometría moderna desarrolla métodos para estimar efectos causales de políticas públicas a partir de datos observacionales.",
        },
      ],
    },
  },

  // ── 21 ── Lectura crítica de datos — avanzado ─────────────────────────────
  {
    slug: "pm-vi-falacia-denominador-tasas-conteos",
    titulo: "Falacia del denominador: tasas vs conteos absolutos en homicidios México-Finlandia",
    categoria: "Lectura crítica de datos",
    conceptos_clave: ["falacia del denominador", "tasa por 100,000 habitantes", "conteo absoluto", "normalización de datos", "comparación justa", "INEGI", "Statistics Finland"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La falacia del denominador ocurre cuando se comparan conteos absolutos entre grupos de distinto tamaño sin normalizar los datos, es decir, sin dividir por la magnitud relevante (denominador). Comparar números absolutos entre poblaciones de diferente tamaño produce conclusiones engañosas y potencialmente perjudiciales. La solución es siempre calcular tasas: cifras relativas que controlan por el tamaño de la población o de la exposición.",
        },
        {
          tipo: "subtitulo",
          contenido: "Homicidios en México y Finlandia: el caso del denominador",
        },
        {
          tipo: "parrafo",
          contenido:
            "Según datos del INEGI, México registró en torno a 32,000 homicidios dolosos en 2023. Finlandia, según Statistics Finland, registró aproximadamente 95 homicidios en el mismo año. En términos absolutos, México tiene 337 veces más homicidios que Finlandia. Pero esta comparación es injusta e inútil: México tiene 130 millones de habitantes y Finlandia tiene 5.5 millones. La tasa de homicidios se calcula como: tasa = (número de homicidios / población) × 100,000 habitantes. Para México: (32,000 / 130,000,000) × 100,000 ≈ 24.6 homicidios por cada 100,000 habitantes. Para Finlandia: (95 / 5,500,000) × 100,000 ≈ 1.7 homicidios por cada 100,000 habitantes. Ahora la comparación es justa: México tiene aproximadamente 14 veces más homicidios que Finlandia por habitante, no 337 veces.",
        },
        {
          tipo: "subtitulo",
          contenido: "Otros contextos donde normalizar los datos es esencial",
        },
        {
          tipo: "lista",
          items: [
            "Accidentes de tráfico: comparar el número de muertos por accidente sin normalizar por kilómetros recorridos o por número de vehículos favorece a países con menos autos (no necesariamente más seguros).",
            "Casos de COVID-19: en 2020, los medios reportaron el conteo acumulado de casos por país, haciendo que países grandes parecieran los más afectados. La tasa de casos por millón de habitantes daba una imagen completamente diferente.",
            "Crimen en ciudades: una ciudad grande tendrá más robos en total que una pequeña; la tasa de robos por cada 10,000 habitantes permite comparar el nivel real de inseguridad.",
            "Consumo de energía: comparar el consumo total de electricidad entre países de diferente tamaño requiere normalizar por PIB (intensidad energética) o por habitante para comparar eficiencia.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La regla general: antes de comparar cualquier conteo entre grupos, pregunta si los grupos son del mismo tamaño. Si no lo son, calcula la tasa apropiada dividiendo por el denominador relevante (población, superficie, ingresos, producción, etc.). Cuál es el denominador correcto depende de la pregunta que se está respondiendo: para comparar riesgo personal se usa la población; para comparar riesgo de tráfico se usan los vehículos-kilómetro; para comparar eficiencia económica se usa el PIB.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Florence Nightingale (1820-1910), pionera de la enfermería moderna y de la estadística visual, usó tasas normalizadas para demostrar que la mayoría de las muertes de soldados británicos en la Guerra de Crimea se debían a enfermedades prevenibles, no a heridas de batalla. Sus famosos diagramas de rosa (diagramas polares de área) comparaban tasas de mortalidad por causa a lo largo del tiempo, convenciendo al gobierno británico de reformar las condiciones sanitarias de los hospitales militares. La normalización de datos salvó miles de vidas.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaPMVI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca PM-VI (21 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "PM-VI")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC PM-VI no encontrada. Ejecuta primero seed-mccems.ts y seed-pmvi.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_PMVI.map((f, i) => ({
    uac_id: uacRow.id,
    slug: f.slug,
    titulo: f.titulo,
    categoria: f.categoria,
    conceptos_clave: f.conceptos_clave as unknown as string[],
    tiempo_lectura_minutos: f.tiempo_lectura_minutos,
    es_placeholder: f.es_placeholder,
    contenido: f.contenido,
    orden: i + 1,
  }));

  const { error } = await sb
    .from("fichas_biblioteca")
    .upsert(rows, { onConflict: "slug" });

  if (error) throw new Error(`Error seeding fichas PM-VI: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de PM-VI insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca PM-VI completado.\n");
}

// ---------------------------------------------------------------------------
// ENTRYPOINT
// ---------------------------------------------------------------------------

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  seedBibliotecaPMVI(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
