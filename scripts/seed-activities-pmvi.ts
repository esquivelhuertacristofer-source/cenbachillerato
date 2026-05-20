/**
 * Seed de actividades pedagógicas para PM-VI (Pensamiento Matemático VI — Estadística y Probabilidad, Semestre 6).
 * 8 propósitos × 3 actividades = 24 actividades. estado='publicada'.
 * Tipos A1: lectura, video_con_preguntas, lectura, lectura, lectura, lectura, lectura, infografia
 * Tipos A2: quiz_multiple_opcion, ejercicio_matematico, ejercicio_matematico, ejercicio_matematico,
 *           quiz_multiple_opcion, ejercicio_matematico, ejercicio_matematico, quiz_verdadero_falso
 * Tipos A3: reflexion_escrita, reflexion_escrita, reflexion_escrita, autoevaluacion,
 *           reflexion_escrita, reflexion_escrita, autoevaluacion, debate_estructurado
 * Uso: npx tsx scripts/seed-activities-pmvi.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades PM-VI — Estadística descriptiva, probabilidad y muestreo\n");
  const progs = await getProgresionesDeUAC(sb, "PM-VI");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo;
    const n = p.numero;
    const a1ok = await upsertActividad(sb, { codigo: `${base}-A1`, titulo: titulos[n-1].a1, descripcion: "Introducción conceptual al propósito formativo.", tipo: tiposA1[n-1], progresion_id: p.id, xp: 10, estado: "publicada", contenido: contenidosA1[n-1] });
    a1ok ? ok++ : fail++;
    const a2ok = await upsertActividad(sb, { codigo: `${base}-A2`, titulo: titulos[n-1].a2, descripcion: "Práctica de verificación y consolidación conceptual.", tipo: tiposA2[n-1], progresion_id: p.id, xp: 15, estado: "publicada", contenido: contenidosA2[n-1] });
    a2ok ? ok++ : fail++;
    const a3ok = await upsertActividad(sb, { codigo: `${base}-A3`, titulo: titulos[n-1].a3, descripcion: "Aplicación crítica y cierre del propósito formativo.", tipo: tiposA3[n-1], progresion_id: p.id, xp: 20, estado: "publicada", contenido: contenidosA3[n-1] });
    a3ok ? ok++ : fail++;
  }
  log(`\n✅ PM-VI: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ─────────────────────────────────────────────────────────────────────
const titulos = [
  {
    a1: "Estadística: la ciencia de los datos al servicio de la toma de decisiones",
    a2: "¿Cuánto sabes sobre estadística descriptiva e inferencial, tipos de variables y fuentes de datos?",
    a3: "Reflexión: ¿cómo se usa la estadística en la salud pública y las políticas sociales en México?",
  },
  {
    a1: "Tablas de frecuencia e histogramas: cómo organizar y representar datos",
    a2: "Ejercicio: construir una tabla de frecuencias y calcular frecuencias relativas y acumuladas",
    a3: "Reflexión: interpretar un histograma de datos reales del INEGI sobre educación o salud",
  },
  {
    a1: "Media, mediana y moda: cuándo usar cada medida de tendencia central",
    a2: "Ejercicio: calcular media, mediana y moda para datos de calificaciones escolares",
    a3: "Reflexión: ¿por qué el salario mediano importa más que el promedio para entender la desigualdad?",
  },
  {
    a1: "Varianza y desviación estándar: cómo medir la dispersión de un conjunto de datos",
    a2: "Ejercicio: calcular varianza, desviación estándar y coeficiente de variación",
    a3: "Autoevaluación: mis competencias en estadística descriptiva",
  },
  {
    a1: "Probabilidad: azar, incertidumbre y toma de decisiones informadas",
    a2: "¿Cuánto sabes sobre probabilidad clásica, frecuentista y axiomas de Kolmogorov?",
    a3: "Reflexión: la probabilidad en la vida cotidiana — decisiones bajo incertidumbre",
  },
  {
    a1: "Probabilidad condicional y el teorema de Bayes: actualizar creencias con nueva información",
    a2: "Ejercicio: calcular probabilidades condicionales en pruebas diagnósticas médicas",
    a3: "Reflexión: sensibilidad, especificidad y valores predictivos en pruebas de VIH en México",
  },
  {
    a1: "Muestreo estadístico: cómo seleccionar una muestra representativa para una encuesta",
    a2: "Ejercicio: calcular tamaño de muestra y diseñar un muestreo estratificado",
    a3: "Autoevaluación: diseño de mi encuesta estadística comunitaria",
  },
  {
    a1: "Las 5 formas más comunes en que los medios distorsionan las estadísticas",
    a2: "¿Verdadero o falso? Lectura crítica de estadísticas en medios y contextos sociales",
    a3: "Debate: ¿Los medios de comunicación usan la estadística para informar o para manipular a la audiencia?",
  },
];

// ── TIPOS ────────────────────────────────────────────────────────────────────────
const tiposA1 = ["lectura", "video_con_preguntas", "lectura", "lectura", "lectura", "lectura", "lectura", "infografia"] as const;
const tiposA2 = ["quiz_multiple_opcion", "ejercicio_matematico", "ejercicio_matematico", "ejercicio_matematico", "quiz_multiple_opcion", "ejercicio_matematico", "ejercicio_matematico", "quiz_verdadero_falso"] as const;
const tiposA3 = ["reflexion_escrita", "reflexion_escrita", "reflexion_escrita", "autoevaluacion", "reflexion_escrita", "reflexion_escrita", "autoevaluacion", "debate_estructurado"] as const;

// ── A1 ──────────────────────────────────────────────────────────────────────────
const contenidosA1 = [
  { // P01 — lectura (estadística descriptiva vs inferencial, tipos de variables, fuentes mexicanas)
    titulo: "Estadística: la ciencia de los datos al servicio de la toma de decisiones",
    texto: "La estadística nació de necesidades concretas de los estados modernos: contar a la población, medir la mortalidad, distribuir recursos. John Graunt, en 1662, publicó sus Observaciones Naturales y Políticas sobre las Listas de Mortalidad de Londres, considerado el primer análisis estadístico sistemático de la historia: a partir de los registros de muertes de la ciudad, identificó patrones de mortalidad según causas y estaciones del año. Florence Nightingale, en 1858, usó gráficas innovadoras de causas de muerte durante la guerra de Crimea para convencer al Parlamento británico de que las condiciones sanitarias, y no las batallas, eran la principal causa de muerte entre los soldados. Hoy, la estadística es la base de la medicina basada en evidencia, la economía, la educación y las políticas públicas.\n\nLa estadística se divide en dos grandes ramas. La estadística descriptiva se ocupa de resumir, organizar y presentar datos de un conjunto observado: calcula promedios, elabora tablas, construye gráficas. No va más allá de los datos que tiene en mano. La estadística inferencial, en cambio, usa los resultados de una muestra para sacar conclusiones sobre una población más grande. Por ejemplo, una encuesta aplicada a 1,200 personas puede darnos información estadísticamente válida sobre las preferencias de millones de mexicanos, siempre que la muestra sea representativa.\n\nPara trabajar con estadística es fundamental comprender los tipos de variables. Las variables cualitativas describen categorías o atributos: pueden ser nominales (sin orden natural, como color de ojos, municipio de nacimiento o partido político) u ordinales (con orden definido, como nivel educativo: primaria, secundaria, bachillerato, licenciatura; o grado de satisfacción: muy insatisfecho, insatisfecho, neutral, satisfecho, muy satisfecho). Las variables cuantitativas expresan cantidades numéricas: pueden ser discretas (se cuentan en valores enteros, como número de hijos, número de materias reprobadas) o continuas (pueden tomar cualquier valor real dentro de un intervalo, como estatura, temperatura, tiempo).\n\nEn México existen fuentes de datos estadísticos de gran relevancia pública. El INEGI (Instituto Nacional de Estadística y Geografía) realiza el Censo de Población y Vivienda cada diez años y levanta la Encuesta Nacional de Ingresos y Gastos de los Hogares (ENIGH) periódicamente para medir condiciones de vida. El CONEVAL (Consejo Nacional de Evaluación de la Política de Desarrollo Social) mide la pobreza multidimensional en México usando datos del INEGI. El CONAPO (Consejo Nacional de Población) elabora proyecciones demográficas. La Secretaría de Salud, el IMSS y el ISSSTE generan datos sobre salud pública, mortalidad y enfermedades.\n\nUna distinción conceptual clave es la diferencia entre población y muestra. La población es el conjunto completo de todos los elementos de interés para el estudio: todos los mexicanos, todas las escuelas del país, todas las empresas de un sector. El Censo del INEGI intenta medir a toda la población cada diez años. Una muestra es un subconjunto de la población, seleccionado de forma representativa para inferir características del total. Las encuestas nacionales como la ENIGH trabajan con muestras de miles de hogares para estimar condiciones de millones.\n\nFinalmente, la ética en el manejo de datos es un tema urgente. La privacidad de los datos personales debe protegerse: los microdatos del INEGI están anonimizados para impedir identificar a personas concretas. Los sesgos de representación son otro problema serio: los grupos más marginalizados (comunidades indígenas en zonas de difícil acceso, personas en situación de calle, migrantes irregulares) frecuentemente quedan subcontados en los datos oficiales, lo que sesga las políticas diseñadas a partir de esos datos.",
    fuente: "Material CEN Bachillerato — PM-VI. Ref.: INEGI, CONEVAL, CONAPO. Nightingale, 1858; Graunt, 1662.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      {
        pregunta: "¿Cuál es la diferencia fundamental entre la estadística descriptiva y la estadística inferencial?",
        respuesta_guia: "La estadística descriptiva resume, organiza y presenta datos del conjunto observado sin ir más allá de ellos: calcula promedios, construye tablas y gráficas. La estadística inferencial usa los resultados de una muestra representativa para sacar conclusiones sobre una población más grande, asumiendo cierto margen de error controlado estadísticamente.",
      },
      {
        pregunta: "¿Qué tipos de variables existen y cómo se clasifican? Da un ejemplo mexicano de cada tipo.",
        respuesta_guia: "Las variables cualitativas nominales no tienen orden (municipio de nacimiento, partido político, idioma). Las cualitativas ordinales sí tienen orden (nivel educativo: primaria-secundaria-bachillerato; nivel de pobreza: moderada-extrema). Las cuantitativas discretas se cuentan en enteros (número de hijos, número de cuartos en la vivienda segun ENIGH). Las cuantitativas continuas pueden tomar cualquier valor real (temperatura, ingreso mensual en pesos, estatura).",
      },
      {
        pregunta: "¿Qué diferencia hay entre población y muestra, y por qué el INEGI usa ambas estrategias?",
        respuesta_guia: "La población es el conjunto completo de todos los elementos de interés; la muestra es un subconjunto representativo. El INEGI usa la población en el Censo (cada 10 años, muy costoso y tardado) para tener un conteo completo. Usa muestras en encuestas como la ENIGH (levantada con miles de hogares) para obtener información actualizada sobre ingresos, gastos y condiciones de vida con menor costo y mayor frecuencia.",
      },
      {
        pregunta: "¿Por qué la ética en el manejo de datos estadísticos es relevante para la toma de decisiones en México?",
        respuesta_guia: "Porque los datos se usan para diseñar políticas públicas y distribuir recursos. Si los datos tienen sesgos de representación (grupos marginalizados subcontados), las políticas ignorarán las necesidades de esos grupos. La privacidad es igualmente importante: los microdatos deben anonimizarse para no identificar a personas concretas y proteger su información personal.",
      },
    ],
  },

  { // P02 — video_con_preguntas (tablas de frecuencia e histogramas paso a paso)
    url_video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    titulo_video: "Tablas de frecuencia e histogramas: organizar y visualizar datos cuantitativos",
    tiempo_segundos: 780,
    preguntas: [
      {
        pregunta: "¿Qué es la frecuencia absoluta de un dato o intervalo, y en qué se diferencia de la frecuencia relativa?",
        opciones: [
          "La frecuencia absoluta es el conteo de veces que aparece un valor; la frecuencia relativa es ese conteo dividido entre el total de datos (expresada en decimales o porcentaje)",
          "La frecuencia absoluta es el porcentaje y la relativa es el conteo entero",
          "Son exactamente lo mismo, solo con nombres distintos",
          "La frecuencia absoluta solo aplica a datos continuos y la relativa a datos discretos",
        ],
        respuesta_correcta: "La frecuencia absoluta es el conteo de veces que aparece un valor; la frecuencia relativa es ese conteo dividido entre el total de datos (expresada en decimales o porcentaje)",
        explicacion: "La frecuencia absoluta (fi) cuenta cuantas veces aparece un valor o cuantos datos caen en un intervalo: es un numero entero. La frecuencia relativa (hi) divide esa frecuencia entre el total n: hi = fi/n. Si fi=6 y n=20, entonces hi=0.30 o 30%. La frecuencia relativa permite comparar distribuciones de diferentes tamaños.",
      },
      {
        pregunta: "¿Cómo se determina la amplitud de clase (ancho del intervalo) al construir un histograma para datos continuos?",
        opciones: [
          "La amplitud siempre debe ser 10, sin importar los datos",
          "Se calcula dividiendo el rango (maximo menos minimo) entre el numero de intervalos deseados, generalmente entre 5 y 15 clases",
          "La amplitud es igual al numero total de datos dividido entre 2",
          "Se usa siempre el mismo numero de intervalos que el numero de datos",
        ],
        respuesta_correcta: "Se calcula dividiendo el rango (maximo menos minimo) entre el numero de intervalos deseados, generalmente entre 5 y 15 clases",
        explicacion: "La amplitud de clase c = Rango / k, donde Rango = maximo - minimo y k es el numero de intervalos. La regla de Sturges sugiere k = 1 + 3.322 * log10(n) como punto de partida. Por ejemplo, con n=20 datos entre 55 y 100, Rango=45, k=5, amplitud c=45/5=9; se redondea a 10 para mayor comodidad.",
      },
      {
        pregunta: "¿Cuál es la diferencia principal entre un histograma y una gráfica de barras?",
        opciones: [
          "No hay diferencia, son exactamente lo mismo con distinto nombre",
          "El histograma representa variables cuantitativas continuas con barras pegadas (sin espacio), mientras que la grafica de barras representa variables cualitativas o discretas con barras separadas",
          "El histograma siempre tiene menos barras que la grafica de barras",
          "La grafica de barras solo se usa en matematicas y el histograma en ciencias sociales",
        ],
        respuesta_correcta: "El histograma representa variables cuantitativas continuas con barras pegadas (sin espacio), mientras que la grafica de barras representa variables cualitativas o discretas con barras separadas",
        explicacion: "El histograma usa barras adyacentes (sin espacio entre ellas) porque los intervalos son continuos: el limite superior de un intervalo es el limite inferior del siguiente. La grafica de barras tiene espacios entre las barras porque las categorias son independientes (nominales u ordinales). Usar un histograma para datos cualitativos o una grafica de barras para datos continuos es un error metodologico.",
      },
      {
        pregunta: "¿Para qué sirve la ojiva (curva de frecuencias acumuladas) en el análisis de datos?",
        opciones: [
          "Para calcular la media aritmetica del conjunto de datos",
          "Para leer percentiles: permite encontrar que porcentaje de los datos es menor o igual a un valor dado, o encontrar el valor que deja un porcentaje dado de datos por debajo",
          "Para identificar la moda del conjunto de datos",
          "Para comparar dos variables cualitativas entre si",
        ],
        respuesta_correcta: "Para leer percentiles: permite encontrar que porcentaje de los datos es menor o igual a un valor dado, o encontrar el valor que deja un porcentaje dado de datos por debajo",
        explicacion: "La ojiva es la curva que conecta las frecuencias relativas acumuladas: comienza en 0% y termina en 100%. Su principal utilidad es leer percentiles graficamente. Por ejemplo, si la ojiva alcanza el 75% en el limite superior del intervalo [80,90), el percentil 75 (o Q3) es aproximadamente 90. El percentil 50 de la ojiva corresponde a la mediana.",
      },
    ],
  },

  { // P03 — lectura (media, mediana, moda: cuándo usar cada una)
    titulo: "Media, mediana y moda: cuándo usar cada medida de tendencia central",
    texto: "Las medidas de tendencia central son valores representativos de un conjunto de datos: intentan resumir toda la distribución en un solo numero que capture el 'centro' de los datos. La eleccion correcta entre media, mediana y moda depende del tipo de variable y de las caracteristicas del conjunto de datos.\n\nLa media aritmetica es el promedio clasico: se calcula sumando todos los valores y dividiendo entre el numero de datos (n). La media tiene propiedades algebraicas utiles: la suma de las desviaciones de cada dato respecto a la media es siempre cero. Sin embargo, su principal debilidad es la sensibilidad a los valores atipicos (outliers): un solo dato extremadamente alto o bajo puede jalar la media significativamente hacia ese extremo, haciendo que deje de representar al grupo tipico.\n\nLa mediana es el valor central cuando los datos estan ordenados de menor a mayor. Si n es impar, la mediana es el dato en la posicion (n+1)/2. Si n es par, la mediana es el promedio de los dos datos centrales (en las posiciones n/2 y n/2+1). La mediana es resistente a los valores atipicos: no importa que tan extremo sea el mayor o menor valor, la mediana solo depende del dato o datos centrales. Esta propiedad la hace la medida preferida para distribuiciones sesgadas.\n\nLa moda es el valor que aparece con mayor frecuencia en el conjunto. Un conjunto puede ser unimodal (una sola moda), bimodal (dos modas), multimodal (varias modas) o amodal (sin moda, si todos los datos aparecen con la misma frecuencia). La moda es la unica medida de tendencia central aplicable a variables cualitativas nominales: podemos hablar de la moda del color de ojos en una poblacion (el color mas frecuente), pero no de su media o mediana.\n\nLa regla general para elegir la medida correcta es: si los datos tienen valores atipicos extremos o la distribucion es marcadamente asimetrica, usar la mediana. Si la distribucion es aproximadamente simetrica y sin valores atipicos extremos, la media es adecuada. Si la variable es cualitativa o se quiere identificar el valor mas comun, usar la moda.\n\nUn caso especial es la media ponderada: cuando los datos no tienen el mismo peso o importancia. El promedio escolar mexicano pondera las calificaciones por el numero de creditos de cada materia: una materia de 8 creditos tiene mas peso que una de 3. El Indice Nacional de Precios al Consumidor (INPC) que usa el INEGI para medir la inflacion es una media ponderada: cada bien y servicio tiene un peso proporcional a su importancia en el gasto tipico de los hogares mexicanos.\n\nEl ejemplo mas ilustrativo de la diferencia entre media y mediana en Mexico es el salario. El ingreso laboral promedio (media) puede verse elevado por los salarios extremadamente altos del decil 10 de la distribucion de ingresos. El salario mediano, que es el punto donde la mitad de los trabajadores gana mas y la mitad gana menos, es significativamente menor que la media y refleja mejor la situacion de la mayoria de los trabajadores mexicanos. Los datos de la ENOE (Encuesta Nacional de Ocupacion y Empleo del INEGI) muestran esta brecha con claridad.",
    fuente: "Material CEN Bachillerato — PM-VI. Ref.: INEGI-ENOE, ENIGH 2022.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 11,
    preguntas_comprension: [
      {
        pregunta: "¿Cuál es la principal debilidad de la media aritmética y en qué tipo de situaciones deja de ser una buena medida del centro?",
        respuesta_guia: "La media es sensible a los valores atipicos (outliers): un solo dato extremadamente alto o bajo puede desplazarla significativamente, haciendo que deje de representar al dato tipico del grupo. En distribuciones muy sesgadas (como la distribucion de salarios o de precios de vivienda, donde unos pocos valores son extremadamente altos) la media sobreestima el valor tipico.",
      },
      {
        pregunta: "¿Por qué la mediana es resistente a los valores atípicos y cuándo se prefiere sobre la media?",
        respuesta_guia: "Porque la mediana solo depende del dato o datos centrales cuando los datos estan ordenados: no importa que tan extremo sea el mayor o menor valor, la posicion del centro no cambia. Se prefiere cuando la distribucion es asimetrica o tiene outliers extremos: salarios, precios de vivienda, ingresos, donde unos pocos valores muy altos distorsionan la media.",
      },
      {
        pregunta: "¿En qué tipo de variables es la moda la única medida de tendencia central aplicable?",
        respuesta_guia: "En variables cualitativas nominales: no tiene sentido calcular la media o mediana del color de ojos, del municipio de residencia o del partido politico favorito. Si solo se puede identificar cuál categoria aparece con mayor frecuencia, la moda es la unica opcion valida.",
      },
      {
        pregunta: "¿Por qué el INPC (inflación) usa una media ponderada y no una media simple?",
        respuesta_guia: "Porque no todos los bienes y servicios tienen la misma importancia en el presupuesto de los hogares. La gasolina, los alimentos basicos y la vivienda tienen mucho mayor peso que artículos de lujo o bienes poco consumidos. Una media simple trataria igual el cambio de precio de un auto de lujo y del precio del tortillazo; la media ponderada refleja el impacto real de los cambios de precios en el gasto tipico de los hogares mexicanos.",
      },
    ],
  },

  { // P04 — lectura (varianza y desviación estándar: medir dispersión)
    titulo: "Varianza y desviación estándar: cómo medir la dispersión de un conjunto de datos",
    texto: "Dos conjuntos de datos pueden tener exactamente la misma media y ser completamente diferentes. Imagina dos grupos de 5 estudiantes con la misma media de 75 en calificaciones: el Grupo A tiene calificaciones de 60, 70, 75, 80 y 90; el Grupo B tiene 73, 74, 75, 76 y 77. La media de ambos es 75, pero el Grupo A es mucho mas heterogeneo que el Grupo B. Las medidas de dispersion cuantifican exactamente esa diferencia en variabilidad.\n\nEl rango o recorrido es la medida de dispersion mas simple: es la diferencia entre el valor maximo y el minimo (Rango = maximo - minimo). Para el Grupo A: 90 - 60 = 30. Para el Grupo B: 77 - 73 = 4. El rango es facil de calcular pero tiene una debilidad: depende solo de dos datos (el maximo y el minimo) y es muy sensible a valores extremos. Un solo outlier puede inflar el rango artificialmente sin reflejar la variabilidad real del resto de los datos.\n\nLa desviacion de cada dato respecto a la media (xi - x_barra) mide que tan lejos esta ese dato del centro. La suma de todas las desviaciones siempre es cero (por definicion de la media), por lo que no se puede usar directamente como medida de dispersion. La solucion es elevar al cuadrado cada desviacion para que los valores positivos y negativos no se cancelen: (xi - x_barra)^2.\n\nLa varianza (s^2) es el promedio de las desviaciones al cuadrado. Si usamos todos los datos de la poblacion, se divide entre N (varianza poblacional). Si los datos son una muestra, se divide entre n-1 (varianza muestral, ajustada para evitar subestimar la variabilidad poblacional). Las unidades de la varianza son el cuadrado de las unidades originales: si las calificaciones estan en puntos, la varianza esta en puntos^2, lo que dificulta su interpretacion directa.\n\nLa desviacion estandar (s) resuelve el problema de las unidades: es simplemente la raiz cuadrada de la varianza, s = raiz(s^2). Las unidades de la desviacion estandar son las mismas que las de los datos originales (puntos, pesos, centimetros). Esta es la medida de dispersion mas usada en estadistica descriptiva.\n\nEn una distribucion aproximadamente normal (campana de Gauss), la desviacion estandar tiene una interpretacion poderosa: aproximadamente el 68% de los datos cae dentro del intervalo (x_barra - s, x_barra + s); el 95% dentro de (x_barra - 2s, x_barra + 2s); y el 99.7% dentro de (x_barra - 3s, x_barra + 3s). Esta propiedad, conocida como la regla empirica o regla 68-95-99.7, permite interpretar rapidamente que tan concentrados o dispersos estan los datos.\n\nEl coeficiente de variacion (CV) es util cuando se quiere comparar la dispersion relativa de dos conjuntos con diferentes escalas o unidades: CV = (s / x_barra) x 100%. Por ejemplo, si queremos comparar la variabilidad de los salarios de medicos (x_barra alto, s alto) con la de salarios de maestros de primaria (x_barra bajo, s bajo), el CV da una medida comparativa justa sin importar la diferencia de escalas.",
    fuente: "Material CEN Bachillerato — PM-VI. Ref.: estadistica descriptiva y distribucion normal.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      {
        pregunta: "¿Por qué no se puede usar la suma de las desviaciones (xi - media) como medida de dispersión?",
        respuesta_guia: "Porque la suma de todas las desviaciones respecto a la media siempre es exactamente cero, por definicion de la media aritmetica. Los valores positivos y negativos se cancelan perfectamente. Para evitar esta cancelacion, las desviaciones se elevan al cuadrado antes de promediarlas, lo que da la varianza.",
      },
      {
        pregunta: "¿Cuál es la diferencia entre varianza y desviación estándar y por qué la desviación estándar es más útil para interpretar la dispersión?",
        respuesta_guia: "La varianza es el promedio de las desviaciones al cuadrado: sus unidades son el cuadrado de las unidades originales (puntos^2, pesos^2), lo que dificulta la interpretacion directa. La desviacion estandar es la raiz cuadrada de la varianza, por lo que tiene las mismas unidades que los datos originales (puntos, pesos). Eso hace que sea directamente interpretable: puedo decir 'los salarios se desvian en promedio 2,500 pesos de la media'.",
      },
      {
        pregunta: "¿Qué dice la regla empírica 68-95-99.7 y cómo se interpreta la desviación estándar en una distribución normal?",
        respuesta_guia: "En una distribucion aproximadamente normal, el 68% de los datos cae dentro de un desvio estandar de la media (x_barra ± s), el 95% dentro de dos desvios (x_barra ± 2s) y el 99.7% dentro de tres desvios (x_barra ± 3s). Esto permite saber rapidamente que tan concentrados o dispersos estan los datos: una s pequeña indica datos muy concentrados alrededor de la media; una s grande indica alta variabilidad.",
      },
      {
        pregunta: "¿Para qué sirve el coeficiente de variación y en qué situaciones es más útil que la desviación estándar?",
        respuesta_guia: "El coeficiente de variacion CV = (s/x_barra) x 100% mide la dispersion relativa: cuantos puntos porcentuales representa la desviacion estandar respecto a la media. Es util cuando se comparan conjuntos con diferentes escalas o unidades: por ejemplo, comparar la variabilidad de salarios de medicos (cifras altas) con salarios de maestros de primaria (cifras menores). La desviacion estandar bruta no es comparable entre escalas tan diferentes, pero el CV si lo es.",
      },
    ],
  },

  { // P05 — lectura (probabilidad clásica, frecuentista y subjetiva)
    titulo: "Probabilidad: azar, incertidumbre y toma de decisiones informadas",
    texto: "La probabilidad es la rama de las matematicas que estudia el azar y la incertidumbre. Nos permite asignar un numero entre 0 y 1 (o entre 0% y 100%) a la posibilidad de que ocurra un evento, y eso tiene aplicaciones practicas inmensas: desde el pronostico del tiempo hasta las primas de seguros, pasando por los ensayos clinicos de medicamentos.\n\nEl punto de partida es el experimento aleatorio: cualquier proceso cuyo resultado no podemos predecir con certeza antes de realizarlo. Lanzar un dado, sacar una carta de una baraja, medir la temperatura maxima de manana, o tomar una muestra de 100 personas para medir su presion arterial, son todos experimentos aleatorios. El espacio muestral (usualmente escrito como omega) es el conjunto de todos los resultados posibles del experimento. Para un dado de seis caras, omega = {1, 2, 3, 4, 5, 6}. Un evento es cualquier subconjunto del espacio muestral: por ejemplo, el evento 'sacar un numero par' es el subconjunto {2, 4, 6}.\n\nExisten tres enfoques principales para definir y calcular probabilidades. La probabilidad clasica (o de Laplace) define P(A) = numero de casos favorables al evento A / numero total de casos posibles del espacio muestral. Esta formula asume que todos los resultados son igualmente posibles (equiprobabilidad): funciona perfectamente para dados, monedas, cartas y urnas ideales, pero no para la mayoria de situaciones reales. La probabilidad frecuentista define P(A) como la frecuencia relativa del evento A en un numero muy grande de repeticiones del experimento: P(A) = numero de veces que ocurrio A / numero total de repeticiones. La ley de los grandes numeros garantiza que, conforme aumenta el numero de repeticiones, la frecuencia relativa se acerca al valor verdadero de la probabilidad. La probabilidad subjetiva es el grado de creencia personal sobre la posibilidad de un evento, basado en experiencia, intuicion o informacion incompleta. Se usa en medicina (probabilidad de que un paciente tenga cierta enfermedad segun sus sintomas), en seguros y en toma de decisiones empresariales.\n\nLos axiomas de Kolmogorov (1933) dan el fundamento matematico riguroso de la probabilidad: (1) P(A) es mayor o igual a 0 para cualquier evento A; (2) P(omega) = 1, la probabilidad del espacio muestral completo es 1; (3) si dos eventos A y B son mutuamente excluyentes (A interseccion B = vacio), entonces P(A union B) = P(A) + P(B). De estos tres axiomas se derivan todas las demas propiedades de la probabilidad. El complemento de un evento A es el conjunto de todos los resultados que no pertenecen a A: P(A') = 1 - P(A). Si la probabilidad de lluvia es 0.30, la probabilidad de que no llueva es 0.70.\n\nLa probabilidad esta presente en decisiones cotidianas. El meteorologo que dice 'probabilidad de lluvia del 70%' usa modelos frecuentistas. La aseguradora que calcula la prima de un seguro de vida usa tablas de mortalidad (datos frecuentistas de millones de personas). El medico que dice 'dado tus sintomas, la probabilidad de que sea dengue es alta' usa probabilidad subjetiva basada en experiencia clinica.",
    fuente: "Material CEN Bachillerato — PM-VI. Ref.: Kolmogorov, 1933; ley de los grandes numeros.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      {
        pregunta: "¿Cuál es la diferencia entre probabilidad clásica, frecuentista y subjetiva? ¿En qué situaciones aplica cada una?",
        respuesta_guia: "La clasica (Laplace) usa casos favorables/casos posibles bajo equiprobabilidad: dados, monedas, urnas ideales. La frecuentista usa la frecuencia relativa en muchas repeticiones reales: probabilidades de mortalidad, tasas de exito de tratamientos medicos. La subjetiva es el grado de creencia personal basado en experiencia e informacion incompleta: diagnostico medico, predicciones empresariales, apostar en deportes.",
      },
      {
        pregunta: "¿Qué son los axiomas de Kolmogorov y por qué son importantes para la probabilidad?",
        respuesta_guia: "Son los tres principios fundamentales que dan base matematica rigurosa a la probabilidad: (1) toda probabilidad es no negativa, (2) la probabilidad del espacio muestral completo es 1, (3) la probabilidad de la union de eventos mutuamente excluyentes es la suma de sus probabilidades individuales. De estos tres axiomas se pueden deducir todas las demas propiedades y formulas de la probabilidad, sin necesidad de asumir nada adicional.",
      },
      {
        pregunta: "¿Qué garantiza la ley de los grandes números en relación con la probabilidad frecuentista?",
        respuesta_guia: "Garantiza que, conforme aumenta el numero de repeticiones del experimento aleatorio, la frecuencia relativa del evento se aproxima cada vez mas al valor verdadero de la probabilidad. Es decir, con pocas repeticiones puede haber mucha variacion por azar, pero con miles o millones de repeticiones, el resultado experimental converge al valor teorico.",
      },
      {
        pregunta: "¿Cómo se usa el complemento de un evento y por qué es útil?",
        respuesta_guia: "El complemento A' es todo lo que no es A: P(A') = 1 - P(A). Es util cuando es mas facil calcular la probabilidad del complemento que la del evento directamente. Por ejemplo, calcular la probabilidad de que al lanzar dos dados NO salga doble es mas facil calculando 1 - P(doble) = 1 - 6/36 = 30/36 = 5/6, en vez de enumerar todos los pares no-dobles.",
      },
    ],
  },

  { // P06 — lectura (probabilidad condicional, independencia, Bayes)
    titulo: "Probabilidad condicional y el teorema de Bayes: actualizar creencias con nueva información",
    texto: "La probabilidad condicional responde a una pregunta fundamental: ¿como cambia la probabilidad de un evento cuando ya sabemos que otro evento ha ocurrido? Formalmente, la probabilidad de A dado B (escrita P(A|B)) es la probabilidad de que A ocurra sabiendo que B ya ocurrio. La formula es: P(A|B) = P(A interseccion B) / P(B), siempre que P(B) sea mayor que cero.\n\nLa intuicion detras de esta formula es que el espacio muestral se reduce: ya no consideramos todos los resultados posibles, sino solo los que son compatibles con B. Por ejemplo, en un grupo de 100 personas, 40 son hombres y 60 son mujeres. De los 40 hombres, 10 fuman. La probabilidad de que una persona seleccionada al azar fume dado que es hombre es P(fuma|hombre) = 10/40 = 0.25. El espacio muestral se redujo de 100 a los 40 hombres.\n\nDos eventos son independientes cuando conocer que uno ocurrio no cambia la probabilidad del otro: P(A|B) = P(A). Si los eventos son independientes, la regla del producto se simplifica: P(A interseccion B) = P(A) * P(B). En cambio, si son dependientes, P(A interseccion B) = P(A) * P(B|A). Esta regla del producto es esencial para calcular probabilidades conjuntas.\n\nEl teorema de Bayes es una de las formulas mas poderosas de la estadistica moderna. Permite actualizar la probabilidad de una hipotesis a la luz de nueva evidencia. La formula basica es: P(B|A) = P(A|B) * P(B) / P(A). En contextos reales, esto significa que podemos calcular la probabilidad de que una hipotesis sea verdadera (por ejemplo, que un paciente tenga una enfermedad) dado que observamos cierta evidencia (que la prueba diagnostica salio positiva), usando la probabilidad previa de la enfermedad (prevalencia) y las caracteristicas de la prueba.\n\nEn medicina, las pruebas diagnosticas se caracterizan por su sensibilidad y especificidad. La sensibilidad es P(positivo | enfermo): que tan bien detecta la prueba a los enfermos verdaderos. La especificidad es P(negativo | sano): que tan bien descarta a los sanos verdaderos. Un resultado positivo no garantiza la enfermedad: el Valor Predictivo Positivo (VPP) es la probabilidad de estar realmente enfermo dado que la prueba salio positiva, P(enfermo | positivo). Este valor depende crucialmente de la prevalencia de la enfermedad en la poblacion: una prueba muy buena puede tener un VPP bajo si la enfermedad es muy rara, porque los falsos positivos en personas sanas son numerosos.\n\nEn Mexico, el IMSS e ISSSTE aplican estas herramientas en sus programas de deteccion temprana de cancer, diabetes e hipertension. Entender la probabilidad condicional permite al paciente y al medico interpretar correctamente un resultado positivo: no es una sentencia, es una probabilidad que debe confirmarse con pruebas adicionales.",
    fuente: "Material CEN Bachillerato — PM-VI. Ref.: Bayes, 1763; aplicaciones diagnosticas IMSS-ISSSTE.",
    nivel_lectura: "avanzado" as const,
    tiempo_estimado_minutos: 13,
    preguntas_comprension: [
      {
        pregunta: "¿Qué significa la probabilidad condicional P(A|B) y cómo se interpreta geométricamente en términos del espacio muestral?",
        respuesta_guia: "P(A|B) es la probabilidad de que ocurra A sabiendo que ya ocurrio B. Geometricamente, el espacio muestral se reduce a B: solo consideramos los resultados que son compatibles con B. La probabilidad de A dentro de ese espacio reducido es P(A interseccion B) / P(B).",
      },
      {
        pregunta: "¿Qué significa que dos eventos sean independientes y cómo se simplifica el calculo de la probabilidad conjunta en ese caso?",
        respuesta_guia: "Dos eventos son independientes si P(A|B) = P(A): conocer que ocurrio B no cambia la probabilidad de A. En ese caso, P(A interseccion B) = P(A) * P(B), lo que simplifica mucho el calculo. Si no son independientes (dependientes), P(A interseccion B) = P(A) * P(B|A), que es mas complejo.",
      },
      {
        pregunta: "¿Qué hace el teorema de Bayes y por qué es importante para el razonamiento bajo incertidumbre?",
        respuesta_guia: "El teorema de Bayes permite actualizar la probabilidad de una hipotesis a la luz de nueva evidencia: P(B|A) = P(A|B) * P(B) / P(A). Es fundamental porque permite combinar lo que ya sabiamos antes de la evidencia (probabilidad previa) con lo que nos dice la nueva informacion para obtener una probabilidad actualizada. Es la base del razonamiento bayesiano en medicina, inteligencia artificial y ciencia.",
      },
      {
        pregunta: "¿Por qué el Valor Predictivo Positivo (VPP) de una prueba diagnóstica depende de la prevalencia de la enfermedad y no solo de la sensibilidad y especificidad?",
        respuesta_guia: "Porque aunque la prueba sea muy buena (alta sensibilidad y especificidad), si la enfermedad es muy rara (baja prevalencia), hay muchas mas personas sanas que enfermas en la poblacion. El pequeño porcentaje de falsos positivos en el grupo muy numeroso de sanos genera tantos o mas falsos positivos que verdaderos positivos. Por eso el VPP puede ser bajo incluso con una prueba excelente cuando la prevalencia es muy baja.",
      },
    ],
  },

  { // P07 — lectura (muestreo estadístico: tipos, errores, tamaño de muestra)
    titulo: "Muestreo estadístico: cómo seleccionar una muestra representativa para una encuesta",
    texto: "En muchas situaciones practicas es imposible o demasiado costoso estudiar a toda la poblacion. El Censo de Poblacion del INEGI, que intenta contar a todos los mexicanos, se realiza solo cada diez años por el enorme costo que representa. En cambio, la Encuesta Nacional de Ingresos y Gastos de los Hogares (ENIGH) levanta datos de decenas de miles de hogares para estimar condiciones de vida de millones. El muestreo estadistico es la tecnica que permite obtener informacion valida sobre una poblacion a partir de una muestra representativa.\n\nEl error muestral es la diferencia entre el resultado obtenido en la muestra y el verdadero valor poblacional (que generalmente no conocemos). El error muestral es inevitable, pero se puede controlar: disminuye al aumentar el tamaño de la muestra y al mejorar el metodo de seleccion. El margen de error que reportan las encuestas electorales ('con un margen de error de +/- 3 puntos porcentuales') refleja precisamente este error muestral controlado.\n\nExisten varios tipos de muestreo probabilistico (donde cada elemento de la poblacion tiene una probabilidad conocida y mayor a cero de ser seleccionado). El muestreo aleatorio simple selecciona los elementos al azar, como extraer boletos de una urna. Hoy se usan tablas de numeros aleatorios o funciones de computadora. El muestreo sistematico selecciona cada k-esimo elemento de una lista ordenada: k = N/n, donde N es el tamaño de la poblacion y n es el tamaño de la muestra deseada. Si N=800 y n=80, k=10: se selecciona un elemento de partida al azar entre el 1 y el 10, y luego cada decimo elemento. El muestreo estratificado divide la poblacion en grupos homogeneos llamados estratos (por edad, genero, region, nivel educativo) y selecciona una muestra proporcionalmente de cada estrato. Garantiza que todos los grupos importantes esten representados en la muestra. El muestreo por conglomerados selecciona grupos naturales completos (manzanas de una ciudad, escuelas de un municipio) y encuesta a todos sus miembros; es mas economico cuando la poblacion esta geograficamente dispersa.\n\nLos muestreos no probabilisticos (como el de conveniencia, donde se encuesta a quien sea accesible) tienen sesgo de seleccion y sus resultados no pueden generalizarse a la poblacion. Las encuestas en linea con autoselecion, donde solo responden quienes estan interesados o tienen acceso a internet, son ejemplos de muestras sesgadas que no son representativas de la poblacion general mexicana.\n\nEl INEGI usa disenos muestrales complejos en sus encuestas: la ENIGH usa muestreo estratificado y por conglomerados en multiple etapas para garantizar representatividad nacional, estatal y rural/urbana. La Encuesta Nacional de Ocupacion y Empleo (ENOE) se levanta trimestralmente con metodologia similar. Entender como se construyen estas muestras es fundamental para interpretar correctamente los resultados y sus margenes de error.",
    fuente: "Material CEN Bachillerato — PM-VI. Ref.: INEGI-ENIGH, ENOE. Metodologia de muestreo.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      {
        pregunta: "¿Qué es el error muestral y cómo se puede controlar al diseñar una encuesta?",
        respuesta_guia: "El error muestral es la diferencia entre el resultado de la muestra y el verdadero valor poblacional. Es inevitable pero controlable: disminuye al aumentar el tamaño de la muestra (mayor n da menor error) y al usar metodos de seleccion probabilisticos que garanticen representatividad. El margen de error que reportan las encuestas electorales refleja el error muestral esperado para el tamaño de muestra usado.",
      },
      {
        pregunta: "¿Cuáles son las ventajas del muestreo estratificado sobre el muestreo aleatorio simple?",
        respuesta_guia: "El muestreo estratificado garantiza que todos los subgrupos importantes de la poblacion esten representados proporcionalmente en la muestra. El aleatorio simple puede, por azar, subrepresentar o sobrerepresentar algun grupo (por ejemplo, tener muy pocas mujeres o muy pocos jovenes). El estratificado es especialmente util cuando se quiere comparar resultados entre subgrupos (por region, edad, genero) o cuando algunos subgrupos son pequeños pero importantes.",
      },
      {
        pregunta: "¿Qué es el sesgo de selección y cómo puede afectar los resultados de una encuesta?",
        respuesta_guia: "El sesgo de seleccion ocurre cuando la muestra no es representativa de la poblacion porque el metodo de seleccion favorece sistematicamente a ciertos grupos sobre otros. Por ejemplo, una encuesta en linea excluye a personas sin acceso a internet o sin habilidades digitales (tipicamente adultos mayores y personas de bajos ingresos). Una encuesta de conveniencia en un centro comercial excluye a personas que no tienen tiempo o dinero para ir de compras. Los resultados de estas muestras no se pueden generalizar a la poblacion total.",
      },
      {
        pregunta: "¿Por qué el INEGI usa diseños muestrales complejos (estratificado + conglomerados + múltiple etapa) para la ENIGH en lugar de un simple muestreo aleatorio?",
        respuesta_guia: "Porque Mexico es un pais muy heterogeneo (urbano/rural, norte/sur, distintos estados, distintos niveles de ingreso) y un muestreo aleatorio simple sobre los millones de hogares mexicanos seria logisticamente imposible y extremadamente costoso. El diseño complejo permite garantizar representatividad en todos los niveles de analisis relevantes (nacional, estatal, rural/urbano) con un tamaño de muestra manejable y un costo razonable, controlando el error muestral en cada nivel.",
      },
    ],
  },

  { // P08 — infografia (Las 5 formas mas comunes en que los medios distorsionan las estadísticas)
    titulo: "Las 5 formas mas comunes en que los medios distorsionan las estadisticas",
    descripcion_accesible: "Infografia que muestra con ejemplos visuales y explicaciones concretas los errores y manipulaciones estadisticas mas frecuentes en los medios de comunicacion: graficos con ejes truncados, confusion entre porcentaje absoluto y relativo, correlacion confundida con causalidad, muestras no representativas, comparacion de porcentajes de bases diferentes, omision del margen de error y uso de escala logaritmica vs lineal.",
    url_imagen: "/placeholder/infografia.svg",
    puntos_clave: [
      "Eje Y truncado: empezar el eje vertical en un valor distinto de cero para exagerar visualmente diferencias pequenas. Ejemplo: si la tasa de desempleo pasa de 3.8% a 4.1%, un grafico con eje desde 3.5% hace que la barra parezca duplicarse, cuando el cambio real es de 0.3 puntos porcentuales.",
      "Confundir porcentaje con porcentaje de porcentaje: decir que algo aumento un 50% cuando paso de 2% a 3% es tecnicamente cierto (aumento relativo del 50%), pero el aumento absoluto es solo 1 punto porcentual. Los medios frecuentemente usan el porcentaje relativo para hacer los cambios parecer mas dramaticos de lo que son en terminos absolutos.",
      "Correlacion confundida con causalidad: dos variables pueden moverse juntas (estar correlacionadas) sin que una cause la otra. El consumo de helado y los ahogamientos en playas suben al mismo tiempo en verano, pero no porque el helado cause ahogamientos: ambos dependen de una tercera variable (el calor). Los medios frecuentemente reportan correlaciones estadisticas como si fueran relaciones causales.",
      "Muestra no representativa: encuestas en linea con autoselecion, encuestas en redes sociales de un medio con audiencia sesgada, o encuestas en un solo municipio presentadas como resultados nacionales. Si la muestra no es representativa de la poblacion, los resultados no se pueden generalizar, aunque el numero de respuestas sea grande.",
      "Comparar porcentajes de bases diferentes: decir que el 50% de A y el 50% de B son equivalentes sin mencionar que A tiene 10 casos y B tiene 1,000 es engañoso. El 50% de 10 son 5 casos; el 50% de 1,000 son 500 casos. En noticias de salud esto es frecuente: 'el riesgo se duplico' puede significar que paso de 1 en un millon a 2 en un millon.",
      "Omitir el margen de error en encuestas politicas: una encuesta que da al candidato A 32% y al candidato B 30% con margen de error de +/- 3 puntos porcentuales muestra un empate tecnico, no una ventaja. Reportar 'A va adelante' sin mencionar el margen de error distorsiona la percepcion de la competencia electoral.",
      "Escala logaritmica vs lineal: las graficas con escala logaritmica hacen que crecimientos exponenciales parezcan lineales y suavizan las curvas de crecimiento muy rapido. Durante la pandemia de COVID-19, los mismos datos de contagios podian mostrar una curva aparentemente controlada en escala logaritmica o una explosion alarmente en escala lineal. Usar una u otra escala sin mencionarlo puede cambiar completamente la impresion que da el grafico.",
    ],
    fuente: "Material CEN Bachillerato — PM-VI. Ref.: Darrell Huff, 'Como mentir con estadisticas', 1954. Parametria, Animal Politico.",
  },
];

// ── A2 ──────────────────────────────────────────────────────────────────────────
const contenidosA2 = [
  { // P01 — quiz_multiple_opcion (estadística descriptiva/inferencial, tipos de variables, fuentes, ética)
    preguntas: [
      {
        enunciado: "¿Cuál es la diferencia principal entre la estadística descriptiva y la estadística inferencial?",
        opciones: [
          "La descriptiva usa graficas y la inferencial solo usa numeros",
          "La descriptiva resume y organiza los datos observados sin ir mas alla; la inferencial usa una muestra para sacar conclusiones sobre una poblacion mas grande",
          "La descriptiva es para datos cualitativos y la inferencial para datos cuantitativos",
          "Son identicas; solo tienen nombres distintos segun el contexto en que se usan",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La estadistica descriptiva describe lo que hay en los datos sin extrapolacion: calcula medias, construye tablas y graficas del conjunto observado. La inferencial va mas alla: usa una muestra representativa para estimar parametros de la poblacion completa con un margen de error controlado. Por ejemplo, la ENIGH del INEGI usa una muestra de hogares para estimar las condiciones de vida de todos los hogares mexicanos.",
      },
      {
        enunciado: "¿Cuál de las siguientes variables es cuantitativa continua?",
        opciones: [
          "Numero de hijos en el hogar",
          "Nivel educativo (primaria, secundaria, bachillerato)",
          "Ingreso mensual en pesos del jefe de hogar",
          "Municipio de residencia del encuestado",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "El ingreso mensual en pesos puede tomar cualquier valor real positivo (por ejemplo, 8,750.50 pesos), por lo que es cuantitativa continua. El numero de hijos es cuantitativa discreta (solo enteros). El nivel educativo es cualitativa ordinal (tiene orden pero no es numerica). El municipio de residencia es cualitativa nominal (sin orden natural).",
      },
      {
        enunciado: "¿Qué mide el CONEVAL en México y qué tipo de datos usa del INEGI?",
        opciones: [
          "La inflacion mensual usando precios de la canasta basica",
          "La pobreza multidimensional, usando datos de la ENIGH del INEGI sobre ingresos y acceso a servicios",
          "El desempleo trimestral mediante la ENOE",
          "Las proyecciones de poblacion futura por estado y municipio",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El CONEVAL (Consejo Nacional de Evaluacion de la Politica de Desarrollo Social) mide la pobreza multidimensional en Mexico: considera tanto el ingreso como el acceso a derechos sociales (educacion, salud, seguridad social, alimentacion, vivienda). Para ello usa principalmente los datos de la ENIGH (Encuesta Nacional de Ingresos y Gastos de los Hogares) que levanta el INEGI cada dos anos.",
      },
      {
        enunciado: "En una encuesta del INEGI, ¿cuál es la diferencia entre la 'población' del estudio y la 'muestra'?",
        opciones: [
          "La poblacion son los encuestadores y la muestra son las preguntas del cuestionario",
          "La poblacion es el conjunto completo de todos los elementos de interes (todos los hogares mexicanos); la muestra es el subconjunto seleccionado para ser encuestado",
          "La poblacion es la muestra mas grande y la muestra es la poblacion mas pequeña; son lo mismo con diferente nombre",
          "La poblacion solo aplica al Censo y la muestra solo a encuestas urbanas",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La poblacion es el universo completo de estudio: todos los hogares, todas las personas, o todas las empresas sobre las que se quiere obtener informacion. La muestra es el subconjunto representativo que realmente se encuesta. La ENIGH encuesta decenas de miles de hogares (muestra) para estimar condiciones de vida de los mas de 35 millones de hogares mexicanos (poblacion).",
      },
      {
        enunciado: "¿Por qué los grupos marginalizados frecuentemente quedan subcontados en las estadísticas oficiales del INEGI?",
        opciones: [
          "Porque el INEGI les hace cuestionarios mas cortos para ahorrar tiempo",
          "Porque comunidades en zonas de dificil acceso, personas en situacion de calle y migrantes irregulares son mas dificiles de alcanzar con los metodos de levantamiento estandar, generando sesgos de representacion",
          "Porque esas personas no tienen derecho a participar en las encuestas nacionales",
          "Porque el INEGI deliberadamente los excluye para mejorar las estadisticas de pobreza",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El sesgo de representacion en datos oficiales ocurre por razones practicas y metodologicas: comunidades indigenas en zonas rurales de dificil acceso, personas sin domicilio fijo, trabajadores informales sin direccion registrada y migrantes en situacion irregular son grupos que los metodos de levantamiento estandar (basados en marcos muestrales de viviendas) dificultan alcanzar. Esto genera estadisticas que subestiman sus condiciones de vida y necesidades.",
      },
      {
        enunciado: "Florence Nightingale es considerada pionera de la estadística aplicada porque:",
        opciones: [
          "Invento la formula para calcular la media aritmetica en 1858",
          "Uso graficas innovadoras de causas de muerte durante la guerra de Crimea para convencer al Parlamento britanico de que las condiciones sanitarias, no las batallas, eran la principal causa de muerte entre soldados",
          "Fundo el primer departamento de estadistica oficial de Gran Bretana en el siglo XIX",
          "Publico las primeras tablas de mortalidad de Londres en 1662",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Nightingale uso visualizacion de datos (sus famosos diagramas de area polar o 'diagramas de rosa') para mostrar que la mayoria de las muertes de soldados britanicos en Crimea se debian a enfermedades infecciosas prevenibles con mejores condiciones sanitarias, no a heridas de batalla. Este uso estrategico de estadisticas graficas para influir en politicas publicas la convierte en una de las fundadoras de la estadistica aplicada. Las tablas de mortalidad de 1662 son obra de John Graunt.",
      },
    ],
  },

  { // P02 — ejercicio_matematico (tabla de frecuencias, frecuencia relativa acumulada, ojiva)
    problema: "Las calificaciones de 20 alumnos en un examen de matematicas son: 55, 60, 65, 65, 70, 70, 70, 75, 75, 75, 75, 80, 80, 80, 85, 85, 90, 90, 95, 100. Organiza los datos en 5 intervalos de clase de amplitud 10 (50-59, 60-69, 70-79, 80-89, 90-100) y calcula la frecuencia relativa acumulada (ojiva) para el ultimo intervalo (90-100), expresada como porcentaje del total.",
    tipo_respuesta: "numerica" as const,
    datos_problema: "n=20 datos. Intervalos: [50,60), [60,70), [70,80), [80,90), [90,100]. Frecuencias absolutas: [50,60)=1, [60,70)=2, [70,80)=6, [80,90)=5, [90,100]=6.",
    pasos_guia: [
      "Suma las frecuencias absolutas para verificar n=20: 1+2+6+5+6=20. Correcto.",
      "Calcula frecuencias relativas: cada fi/n. Ejemplo: [50,60) = 1/20 = 0.05 = 5%. [60,70) = 2/20 = 0.10 = 10%. [70,80) = 6/20 = 0.30 = 30%. [80,90) = 5/20 = 0.25 = 25%. [90,100] = 6/20 = 0.30 = 30%.",
      "Calcula frecuencias absolutas acumuladas: [50,60)=1; [60,70)=1+2=3; [70,80)=3+6=9; [80,90)=9+5=14; [90,100]=14+6=20.",
      "Frecuencia relativa acumulada del ultimo intervalo: 20/20 = 1.00 = 100%.",
      "La ojiva termina siempre en 100% por definicion: el ultimo intervalo acumula la totalidad de los datos.",
    ],
    respuesta_final: "100",
    tolerancia_error: 0,
    unidades: "% (frecuencia relativa acumulada del ultimo intervalo)",
    solucion_explicada: "La frecuencia relativa acumulada del ultimo intervalo siempre es 100% (o 1.00) porque representa la totalidad de los datos: todos los datos son menores o iguales al limite superior del ultimo intervalo. La ojiva es la curva que conecta los porcentajes acumulados: comienza en 0% (antes del primer intervalo) y termina en 100% (al final del ultimo). Es util para encontrar percentiles: por ejemplo, si el 75% de la frecuencia acumulada cae en el limite superior del intervalo [80,90), el percentil 75 (Q3) es aproximadamente 90.",
    contexto_real: "El INEGI usa tablas de frecuencias y ojivas para representar distribucion de escolaridad, ingresos y edades de la poblacion mexicana. La ojiva permite identificar rapidamente que porcentaje de la poblacion tiene un nivel de escolaridad o ingreso menor o igual a cierto valor.",
  },

  { // P03 — ejercicio_matematico (media y mediana, efecto de outliers, salarios)
    problema: "Los salarios mensuales (en pesos) de 9 empleados de una empresa son: 6,500, 7,200, 7,800, 8,000, 8,500, 9,000, 10,000, 12,000 y 45,000. Calcula la media aritmetica y la mediana. Luego determina cual de las dos medidas representa mejor el salario tipico de estos 9 empleados.",
    tipo_respuesta: "numerica" as const,
    datos_problema: "9 datos ordenados de menor a mayor: 6500, 7200, 7800, 8000, 8500, 9000, 10000, 12000, 45000.",
    pasos_guia: [
      "Suma todos los salarios: 6500 + 7200 + 7800 + 8000 + 8500 + 9000 + 10000 + 12000 + 45000 = 114000 pesos.",
      "Calcula la media: 114000 / 9 = 12666.67 pesos.",
      "Para la mediana: los datos ya estan ordenados. n=9 (impar), la mediana es el dato en la posicion (9+1)/2 = 5.",
      "El 5o dato en orden ascendente es 8500 pesos.",
      "Comparacion: media = 12666.67 pesos vs mediana = 8500 pesos. El salario del director (45000) jala la media hacia arriba. 8 de 9 empleados ganan menos que la media. La mediana representa mejor al empleado tipico.",
    ],
    respuesta_final: "8500",
    tolerancia_error: 0,
    unidades: "pesos (mediana)",
    solucion_explicada: "La media es 12,666.67 pesos, pero solo 1 de 9 empleados gana mas que ese promedio. El salario del director (45,000) distorsiona la media hacia arriba. La mediana de 8,500 pesos representa mejor al empleado tipico porque no se ve afectada por ese valor extremo (outlier): el 50% gana mas de 8,500 y el 50% gana menos. Este ejemplo ilustra exactamente por que las discusiones sobre salarios en Mexico usan la mediana: el ingreso laboral promedio nacional puede parecer mayor de lo que experimenta la mayoria de los trabajadores.",
    contexto_real: "La ENOE del INEGI reporta tanto el salario promedio como el salario mediano de los trabajadores mexicanos. En Mexico, el salario mediano es consistentemente menor que el salario promedio porque la distribucion de salarios esta muy sesgada hacia la derecha: una minoria con salarios muy altos eleva el promedio sin representar la experiencia de la mayoria.",
  },

  { // P04 — ejercicio_matematico (varianza y desviacion estandar del Grupo A)
    problema: "Dos grupos de 5 estudiantes tienen la siguiente media de calificaciones: Grupo A: 60, 70, 75, 80, 90 y Grupo B: 73, 74, 75, 76, 77. Ambos grupos tienen la misma media (x_barra = 75). Calcula la varianza y la desviacion estandar del Grupo A para determinar que tan dispersas estan sus calificaciones.",
    tipo_respuesta: "numerica" as const,
    datos_problema: "Grupo A: 60, 70, 75, 80, 90. Media = 75. n = 5.",
    pasos_guia: [
      "Calcula las desviaciones de cada dato respecto a la media: (60-75) = -15; (70-75) = -5; (75-75) = 0; (80-75) = 5; (90-75) = 15.",
      "Eleva al cuadrado cada desviacion: (-15)^2 = 225; (-5)^2 = 25; 0^2 = 0; 5^2 = 25; 15^2 = 225.",
      "Suma los cuadrados de las desviaciones: 225 + 25 + 0 + 25 + 225 = 500.",
      "Calcula la varianza poblacional: s^2 = 500 / 5 = 100 (usando n, pues consideramos a los 5 como la poblacion de interes).",
      "Calcula la desviacion estandar: s = raiz(100) = 10 puntos. Para comparar: el Grupo B tendria s aproximadamente 1.41 puntos.",
    ],
    respuesta_final: "10",
    tolerancia_error: 0.1,
    unidades: "puntos (desviacion estandar del Grupo A)",
    solucion_explicada: "La desviacion estandar del Grupo A es s = 10 puntos, lo que indica que en promedio los estudiantes se desvian 10 puntos de la media de 75. El Grupo B tiene s = 1.41 puntos, significativamente menor. Aunque ambos grupos tienen la misma media, el Grupo A es mucho mas heterogeneo: hay estudiantes con calificaciones muy altas y muy bajas, lo que podria indicar necesidades pedagogicas muy diferentes dentro del mismo grupo. El coeficiente de variacion del Grupo A es CV = 10/75 x 100% = 13.3%, mientras que el del Grupo B es CV = 1.41/75 x 100% = 1.9%.",
    contexto_real: "En educacion, la desviacion estandar de calificaciones dentro de un grupo es informacion crucial para el docente: un grupo muy heterogeneo (s alta) requiere estrategias de diferenciacion pedagogica; un grupo homogeneo (s baja) puede avanzar con un ritmo mas uniforme. El INEE (ahora MEJOREDU) usaba estas medidas para comparar la dispersion de resultados de PLANEA entre grupos y escuelas.",
  },

  { // P05 — quiz_multiple_opcion (probabilidad: clasica, frecuentista, subjetiva, axiomas, complemento)
    preguntas: [
      {
        enunciado: "¿Cuál es la definición de probabilidad clásica (de Laplace) y qué supuesto fundamental requiere?",
        opciones: [
          "P(A) = frecuencia de A en muchas repeticiones; requiere un numero grande de experimentos",
          "P(A) = numero de casos favorables a A / numero total de casos posibles; requiere que todos los resultados sean igualmente posibles (equiprobabilidad)",
          "P(A) = grado de creencia subjetiva en A; no requiere ningun supuesto matematico",
          "P(A) = 1 - P(A'); requiere conocer la probabilidad del complemento de A",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La probabilidad clasica de Laplace calcula P(A) = casos favorables / casos posibles, pero SOLO funciona bajo el supuesto de equiprobabilidad: todos los resultados del espacio muestral deben ser igualmente posibles. Funciona perfectamente para dados no cargados, monedas equilibradas, cartas bien mezcladas. No aplica a situaciones reales donde los resultados no son equiprobables (por ejemplo, la probabilidad de ganar una loteria no es 1/numero de participantes si los boletos no estan distribuidos uniformemente).",
      },
      {
        enunciado: "¿Qué garantiza la ley de los grandes números en el contexto de la probabilidad frecuentista?",
        opciones: [
          "Que con mas datos la media siempre aumenta",
          "Que conforme aumenta el numero de repeticiones del experimento, la frecuencia relativa del evento converge al valor verdadero de la probabilidad",
          "Que en un juego de azar siempre recuperas lo perdido si juegas suficientes veces",
          "Que la muestra siempre tiene exactamente las mismas proporciones que la poblacion",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La ley de los grandes numeros establece que la frecuencia relativa de un evento en un experimento aleatorio converge al valor de la probabilidad verdadera conforme el numero de repeticiones tiende a infinito. Con pocas repeticiones hay mucha variabilidad por azar (puedo obtener 7 caras de 10 lanzamientos de una moneda justa). Con miles de repeticiones, la frecuencia relativa se acerca al 50% para una moneda equilibrada. Ojo: esto no significa que 'te toca' un evento si no ha salido; cada repeticion es independiente.",
      },
      {
        enunciado: "¿Cuáles son los axiomas de Kolmogorov que fundamentan matemáticamente la probabilidad?",
        opciones: [
          "P(A) esta entre -1 y 1; P(vacio) = 0; P(A union B) = P(A) x P(B)",
          "P(A) es mayor o igual a 0; P(espacio muestral) = 1; si A y B son mutuamente excluyentes, P(A union B) = P(A) + P(B)",
          "P(A) esta entre 0 y 100; P(espacio muestral) = 100; P(A interseccion B) = P(A) + P(B)",
          "P(A) = P(A'); P(espacio muestral) = 0.5; P(A union B) = P(A) - P(B)",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Los tres axiomas de Kolmogorov (1933) son: (1) la probabilidad de cualquier evento es no negativa, P(A) >= 0; (2) la probabilidad del espacio muestral completo es 1, P(omega) = 1; (3) si dos eventos son mutuamente excluyentes (no pueden ocurrir al mismo tiempo), la probabilidad de que ocurra al menos uno es la suma de sus probabilidades, P(A union B) = P(A) + P(B). De estos tres principios se pueden deducir todas las demas propiedades y formulas de la probabilidad.",
      },
      {
        enunciado: "Si la probabilidad de que llueva mañana es P(lluvia) = 0.35, ¿cuál es la probabilidad de que NO llueva?",
        opciones: [
          "0.35",
          "0.65",
          "0.135",
          "1.35",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Por la propiedad del complemento: P(A') = 1 - P(A). P(no lluvia) = 1 - P(lluvia) = 1 - 0.35 = 0.65. Esto se deriva directamente del axioma de Kolmogorov que establece P(espacio muestral) = 1: como lluvia y no lluvia son mutuamente excluyentes y exhaustivos (uno de los dos debe ocurrir), sus probabilidades deben sumar 1.",
      },
      {
        enunciado: "¿Cuál de los siguientes es un ejemplo de probabilidad subjetiva?",
        opciones: [
          "La probabilidad de sacar un 6 al lanzar un dado justo es 1/6",
          "La probabilidad de que un recien nacido sea nino es 0.51 segun los registros del INEGI",
          "El medico dice: 'Dados tus sintomas y tu historial, yo diria que hay un 70% de probabilidad de que sea una infeccion viral'",
          "El pronostico del tiempo dice que hay 40% de probabilidad de lluvia basado en modelos de los ultimos 30 anos",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "La probabilidad subjetiva es el grado de creencia personal de un experto basada en experiencia e informacion disponible, no en un calculo formal de casos equiprobables ni en frecuencias historicas de millones de repeticiones. La estimacion del medico es tipicamente subjetiva: combina experiencia clinica, intuicion y la informacion del paciente particular. La opcion a es clasica (equiprobabilidad), la b es frecuentista (datos del INEGI), la d es frecuentista (modelos historicos de lluvia).",
      },
      {
        enunciado: "¿En cuál de las siguientes situaciones mexicanas se usa la probabilidad para tomar decisiones de política pública?",
        opciones: [
          "El INEGI decide cuantos empleados contratar para el proximo censo",
          "La SSA estima probabilidades de contagio de enfermedades infecciosas para decidir cuantas vacunas producir y distribuir antes de una temporada de influenza",
          "Un estudiante decide en que universidad estudiar segun su promedio de preparatoria",
          "Un maestro decide cuantas preguntas poner en un examen",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La SSA (Secretaria de Salud) usa modelos probabilisticos de transmision de enfermedades (tasas de reproduccion R0, probabilidades de contagio por contacto) para estimar cuantas personas pueden infectarse en una temporada de influenza o un brote de dengue, y decide con base en eso cuantas dosis de vacuna producir y distribuir en cada region del pais. Esta es estadistica inferencial y modelado probabilistico aplicados directamente a politica publica de salud.",
      },
    ],
  },

  { // P06 — ejercicio_matematico (VPP con teorema de Bayes, prueba de diabetes)
    problema: "Una prueba de deteccion de diabetes tiene sensibilidad del 90% (P(positivo|diabetes) = 0.90) y especificidad del 95% (P(negativo|sin diabetes) = 0.95). En una poblacion donde la prevalencia de diabetes es del 10% (P(diabetes) = 0.10). Usando el teorema de Bayes, calcula el Valor Predictivo Positivo (VPP): la probabilidad de tener diabetes dado que la prueba salio positiva, expresada en porcentaje.",
    tipo_respuesta: "numerica" as const,
    datos_problema: "P(diabetes) = 0.10; P(sin diabetes) = 0.90. Sensibilidad: P(positivo|diabetes) = 0.90. Especificidad: P(negativo|sin diabetes) = 0.95, por lo que P(positivo|sin diabetes) = 1 - 0.95 = 0.05.",
    pasos_guia: [
      "Calcula P(positivo y diabetes): P(diabetes) x P(positivo|diabetes) = 0.10 x 0.90 = 0.090.",
      "Calcula P(positivo y sin diabetes): P(sin diabetes) x P(positivo|sin diabetes) = 0.90 x 0.05 = 0.045.",
      "Calcula P(positivo total) por la regla de la probabilidad total: 0.090 + 0.045 = 0.135.",
      "Aplica el teorema de Bayes: VPP = P(diabetes|positivo) = P(positivo y diabetes) / P(positivo total) = 0.090 / 0.135 = 0.6667.",
      "Convierte a porcentaje: 0.6667 x 100 = 66.67%.",
    ],
    respuesta_final: "66.67",
    tolerancia_error: 0.5,
    unidades: "% (Valor Predictivo Positivo)",
    solucion_explicada: "El VPP del 66.67% significa que solo el 67% de las personas con prueba positiva realmente tienen diabetes; el 33% restante son falsos positivos (personas sanas con resultado positivo). Esto se debe a la prevalencia relativamente baja (10%): hay 9 veces mas personas sanas que enfermas en la poblacion. El 5% de falsos positivos en el grupo numeroso de personas sanas (0.90 x 0.05 = 0.045) genera casi la mitad de los positivos totales. Por eso los medicos confirman siempre con una segunda prueba antes de diagnosticar: un solo resultado positivo, aunque la prueba sea buena, no garantiza la enfermedad.",
    contexto_real: "El IMSS aplica pruebas de deteccion de diabetes a millones de mexicanos en sus unidades de medicina familiar. Entender el VPP ayuda a interpretar correctamente un resultado positivo: no es un diagnostico definitivo sino una señal de que se requieren pruebas de confirmacion (glucosa en ayuno, hemoglobina glucosilada). Mexico tiene una de las tasas de diabetes mas altas del mundo: aproximadamente el 13% de los adultos, lo que mejora el VPP en comparacion con poblaciones con menor prevalencia.",
  },

  { // P07 — ejercicio_matematico (muestreo estratificado, fraccion de muestreo por grado)
    problema: "Quieres encuestar a estudiantes de tu escuela sobre el uso de redes sociales. Tu escuela tiene 800 estudiantes distribuidos en 4 grados: 1o (250), 2o (210), 3o (190) y 4o (150). Decides usar muestreo estratificado con una muestra de n = 80 estudiantes. Calcula cuantos estudiantes debes encuestar de cada grado.",
    tipo_respuesta: "numerica" as const,
    datos_problema: "N = 800 estudiantes en total. n = 80 (muestra deseada). Estratos: Grado 1: 250 estudiantes; Grado 2: 210 estudiantes; Grado 3: 190 estudiantes; Grado 4: 150 estudiantes.",
    pasos_guia: [
      "Calcula la fraccion de muestreo: f = n/N = 80/800 = 0.10 = 10%.",
      "Grado 1: 250 x 0.10 = 25 estudiantes.",
      "Grado 2: 210 x 0.10 = 21 estudiantes.",
      "Grado 3: 190 x 0.10 = 19 estudiantes.",
      "Grado 4: 150 x 0.10 = 15 estudiantes.",
      "Verificacion: 25 + 21 + 19 + 15 = 80 estudiantes. Correcto.",
    ],
    respuesta_final: "80",
    tolerancia_error: 0,
    unidades: "estudiantes totales en la muestra (suma de los cuatro estratos)",
    solucion_explicada: "Con muestreo estratificado proporcional, cada grado aporta exactamente el 10% de sus estudiantes (la fraccion de muestreo f = 80/800 = 0.10). Grado 1: 25 estudiantes, Grado 2: 21, Grado 3: 19, Grado 4: 15. Total: 80 estudiantes. Este metodo garantiza que todos los grados esten representados proporcionalmente en la muestra, evitando el sesgo que ocurriria si eligieramos los 80 estudiantes solo de los grados mas accesibles o de un solo salon. Con esta muestra, los resultados son representativos de cada grado por separado y de la escuela en conjunto.",
    contexto_real: "El INEGI usa muestreo estratificado en la ENIGH: estratifica por estado, por tamaño de localidad (rural/urbano) y por nivel de ingreso estimado para garantizar que todos los grupos esten representados. Sin estratificacion, los hogares de zonas rurales remotas (con condiciones muy diferentes) podrian quedar subrepresentados en una muestra nacional elegida puramente al azar.",
  },

  { // P08 — quiz_verdadero_falso (lectura critica de estadisticas en medios)
    preguntas: [
      {
        enunciado: "Un grafico de barras que empieza el eje vertical (eje Y) en 3.5% en lugar de 0% es metodologicamente valido porque muestra mejor las diferencias entre las barras.",
        respuesta: false,
        retroalimentacion: "Falso. Truncar el eje Y es una forma comun de distorsion visual: hace que diferencias pequenas parezcan enormes. Si la tasa de desempleo pasa de 3.8% a 4.1%, un grafico con eje desde 3.5% hace que la barra parezca casi doblar su altura cuando el cambio real es de solo 0.3 puntos porcentuales. Los graficos que comparan magnitudes deben comenzar el eje Y en cero para dar una perspectiva visual honesta del cambio.",
      },
      {
        enunciado: "Si una noticia dice que 'el riesgo de cancer se duplico', esto siempre significa un aumento grave que deberia preocupar significativamente a la poblacion.",
        respuesta: false,
        retroalimentacion: "Falso. Duplicar un riesgo pequeno sigue siendo un riesgo pequeno en terminos absolutos. Si la probabilidad base era de 1 en un millon (0.0001%) y se duplica a 2 en un millon (0.0002%), el riesgo se duplico pero el aumento absoluto es minimo. Los medios frecuentemente reportan el riesgo relativo (que suena dramatico) sin mencionar el riesgo absoluto (que da perspectiva). Para evaluar correctamente el riesgo, es necesario conocer ambas cifras.",
      },
      {
        enunciado: "Si en verano aumentan tanto el consumo de helado como el numero de ahogamientos en playas, podemos concluir que comer helado causa ahogamientos.",
        respuesta: false,
        retroalimentacion: "Falso. Esta es la confusion clasica entre correlacion y causalidad. El calor del verano es la variable confusora que causa ambos fenomenos independientemente: hace calor, la gente compra mas helado Y tambien va mas a la playa (aumentando los accidentes). Correlacion estadistica no implica causalidad. Para establecer causalidad se requieren disenos experimentales controlados, como ensayos clinicos aleatorizados, no simplemente observar que dos variables se mueven juntas.",
      },
      {
        enunciado: "Una encuesta electoral que da al candidato A 35% y al candidato B 33% con un margen de error de +/- 3 puntos porcentuales muestra que A va claramente adelante.",
        respuesta: false,
        retroalimentacion: "Falso. Con un margen de error de +/- 3 puntos, el candidato A podria tener entre 32% y 38%, y el candidato B entre 30% y 36%. Los rangos se solapan: estadisticamente es un empate tecnico. Reportar 'A va adelante' sin mencionar el margen de error, o sin señalar que la diferencia no es estadisticamente significativa, es una distorsion que puede influir indebidamente en la percepcion de la competencia electoral.",
      },
      {
        enunciado: "Las gráficas con escala logarítmica son siempre engañosas y no deben usarse en periodismo de datos.",
        respuesta: false,
        retroalimentacion: "Falso. La escala logaritmica es una herramienta valida y a veces la mas adecuada: permite visualizar crecimientos que abarcan varios ordenes de magnitud (como el crecimiento de contagios en una pandemia, donde los primeros dias hay decenas y semanas despues hay millones). El problema no es la escala logaritmica en si, sino no aclarar explicitamente al lector que el eje usa esa escala. La transparencia metodologica es la clave.",
      },
      {
        enunciado: "Cuando una encuesta en línea reporta que '8 de cada 10 mexicanos apoyan una medida', el tamaño grande de respuestas (100,000 personas) garantiza que el resultado es representativo de todos los mexicanos.",
        respuesta: false,
        retroalimentacion: "Falso. El tamaño de la muestra no corrige el sesgo de seleccion. Una encuesta en linea con autoselecion excluye sistematicamente a personas sin acceso a internet o sin redes sociales (adultos mayores, poblacion rural, personas de bajos ingresos) e incluye principalmente a usuarios activos del medio que publica la encuesta (con sesgos politicos o demograficos propios de esa audiencia). Un millon de respuestas sesgadas siguen siendo un millon de respuestas sesgadas.",
      },
      {
        enunciado: "Animal Político y Parámetría son ejemplos de medios y organizaciones en México que han introducido estándares más rigurosos en el uso y verificación de estadísticas.",
        respuesta: true,
        retroalimentacion: "Correcto. Animal Politico ha desarrollado periodismo de datos con verificacion de fuentes y Parámetría es una empresa de investigacion por encuestas con metodologia transparente. Ambas organizaciones han contribuido a elevar los estandares del periodismo estadistico en Mexico, reportando margenes de error, metodologias de muestreo y fichas tecnicas de sus encuestas. Son referencias de buenas practicas en el uso de estadisticas en medios mexicanos.",
      },
    ],
  },
];

// ── A3 ──────────────────────────────────────────────────────────────────────────
const contenidosA3 = [
  { // P01 — reflexion_escrita (uso de la estadística en salud pública y políticas sociales en México)
    prompt: "El INEGI reporta que en 2022, el 36.3% de la poblacion mexicana vivia en pobreza segun el CONEVAL. Pero distintos medios de comunicacion interpretan este dato de formas muy diferentes. Como usa la estadistica el Estado mexicano para disenar politicas de salud publica o programas sociales? Que decisiones concretas se toman basadas en datos estadisticos en Mexico? Quien puede resultar excluido si los datos tienen sesgos de representacion?",
    longitud_minima_palabras: 120,
    pistas: [
      "Piensa en programas como Sembrando Vida, el IMSS-Bienestar o el Seguro Popular: como se decide a quien llegan y en que cantidad?",
      "Si una comunidad indigena no aparece bien representada en el Censo del INEGI, que consecuencias puede tener eso para los recursos que recibe?",
      "Que diferencia hace usar la media o la mediana al reportar el ingreso de los mexicanos para justificar o criticar una politica social?",
      "Por que es importante que los datos estadisticos sobre pobreza sean publicos, auditables y metodologicamente transparentes?",
    ],
    criterios_evaluacion: [
      "Menciona al menos una fuente estadistica mexicana concreta (INEGI, CONEVAL, ENIGH, ENOE) y explica como se usa para disenar politicas",
      "Identifica al menos una decision de politica publica que depende de datos estadisticos en Mexico",
      "Reflexiona sobre quien puede quedar excluido cuando los datos tienen sesgos de representacion",
    ],
  },

  { // P02 — reflexion_escrita (interpretar histograma de datos reales del INEGI)
    prompt: "El INEGI publica histogramas sobre distribucion de ingresos de los hogares mexicanos, edades de la poblacion o anos de escolaridad. Imagina que tienes acceso a un histograma que muestra la distribucion de grados de escolaridad completados de adultos de 25 a 65 anos en tu municipio. Como interpretarias ese histograma? Que informacion te daria sobre la desigualdad educativa en tu comunidad? Que politicas publicas podrian sugerirse a partir de ese histograma?",
    longitud_minima_palabras: 110,
    pistas: [
      "Donde estaria la mayor concentracion de barras: en los niveles educativos bajos o altos? Que dice eso sobre la escolaridad promedio de tu municipio?",
      "Si el histograma tiene una cola larga hacia la derecha (algunos adultos con muchos anos de escolaridad), que dice eso sobre la desigualdad educativa?",
      "Que diferencia hace conocer la forma del histograma (simetrico, sesgado a la izquierda o derecha) para disenar politicas educativas?",
      "Que programas del gobierno federal o estatal podrian implementarse si el histograma muestra que muchos adultos no completaron la secundaria?",
    ],
    criterios_evaluacion: [
      "Describe correctamente como leeria un histograma: interpreta las barras como intervalos de frecuencia, no como datos individuales",
      "Conecta la forma del histograma con las caracteristicas de la distribucion de escolaridad (sesgo, concentracion, cola)",
      "Propone al menos una politica publica concreta que responderia a la informacion del histograma",
    ],
  },

  { // P03 — reflexion_escrita (media vs mediana en la distribución del ingreso en México)
    prompt: "En Mexico, el INEGI reporta que el ingreso laboral promedio (media) es significativamente mayor que el ingreso laboral mediano. Que nos dice esta diferencia sobre la distribucion del ingreso en Mexico? Por que los medios de comunicacion frecuentemente usan el promedio y no la mediana al reportar salarios? Que medida usarias tu si quisieras mostrar que los salarios en Mexico son bajos, y cual usarias si quisieras mostrar que son altos?",
    longitud_minima_palabras: 120,
    pistas: [
      "Si la media es mayor que la mediana, que nos dice eso sobre la forma de la distribucion de salarios? Es simetrica o sesgada?",
      "Piensa en cuantos mexicanos ganan menos que el salario promedio reportado por el INEGI: mas de la mitad o menos?",
      "Un periodista que quiere criticar la desigualdad salarial preferiria usar la mediana o la media? Por que?",
      "Un funcionario que quiere mostrar que la economia va bien preferiria usar la mediana o la media? Por que?",
    ],
    criterios_evaluacion: [
      "Explica correctamente por que la diferencia media-mediana indica una distribucion sesgada hacia la derecha (con valores extremos altos)",
      "Identifica que si la media supera a la mediana, mas de la mitad de los trabajadores gana menos que la media",
      "Reflexiona sobre como la eleccion de la medida estadistica puede usarse para construir narrativas diferentes sobre la misma realidad",
      "Conecta el analisis estadistico con el contexto de desigualdad de ingresos en Mexico",
    ],
  },

  { // P04 — autoevaluacion (estadística descriptiva: media, mediana, moda, desviación estándar)
    criterios: [
      {
        descripcion: "Calculo correctamente la media, mediana y moda para conjuntos de datos reales",
        escala: [
          { valor: 1, etiqueta: "Nunca o muy poco", descripcion: "Cometo errores frecuentes al calcular cualquiera de las tres medidas, incluso con pocos datos." },
          { valor: 2, etiqueta: "Algunas veces", descripcion: "Calculo correctamente la media pero tengo dificultades con la mediana (especialmente cuando n es par) o con la moda en datos bimodales." },
          { valor: 3, etiqueta: "Con frecuencia", descripcion: "Calculo correctamente las tres medidas en la mayoria de los casos, aunque a veces cometo errores en conjuntos grandes o con datos no ordenados." },
          { valor: 4, etiqueta: "Siempre o casi siempre", descripcion: "Calculo con seguridad y precision la media, mediana y moda para cualquier conjunto de datos, incluyendo casos con n par, datos bimodales o valores atipicos extremos." },
        ],
      },
      {
        descripcion: "Interpreto la desviacion estandar para entender la dispersion de un conjunto de datos",
        escala: [
          { valor: 1, etiqueta: "Nunca o muy poco", descripcion: "No entiendo que representa la desviacion estandar ni como calcularla; confundo varianza y desviacion estandar." },
          { valor: 2, etiqueta: "Algunas veces", descripcion: "Puedo calcular la desviacion estandar siguiendo los pasos, pero no estoy seguro de como interpretar su valor en el contexto del problema." },
          { valor: 3, etiqueta: "Con frecuencia", descripcion: "Calculo e interpreto la desviacion estandar correctamente en la mayoria de los casos, y entiendo que una s alta indica mayor heterogeneidad." },
          { valor: 4, etiqueta: "Siempre o casi siempre", descripcion: "Calculo, interpreto y uso la desviacion estandar con confianza: puedo aplicar la regla empirica 68-95-99.7 y el coeficiente de variacion para comparar grupos con diferentes escalas." },
        ],
      },
      {
        descripcion: "Identifico cuando usar la media o la mediana segun las caracteristicas del conjunto de datos",
        escala: [
          { valor: 1, etiqueta: "Nunca o muy poco", descripcion: "Siempre uso la media sin considerar si hay valores atipicos o si la distribucion es asimetrica." },
          { valor: 2, etiqueta: "Algunas veces", descripcion: "Se que la mediana es mejor cuando hay outliers, pero tengo dificultad para identificar cuando un dato es realmente atipico en un contexto real." },
          { valor: 3, etiqueta: "Con frecuencia", descripcion: "Identifico correctamente la mayoria de los casos en que se debe preferir la mediana sobre la media y puedo justificar la eleccion." },
          { valor: 4, etiqueta: "Siempre o casi siempre", descripcion: "Analizo sistematicamente la forma de la distribucion (simetria, asimetria, outliers) antes de elegir la medida mas adecuada, y puedo explicar con claridad la razon estadistica de mi eleccion." },
        ],
      },
      {
        descripcion: "Relaciono las medidas estadisticas con contextos reales de Mexico (salarios, educacion, salud)",
        escala: [
          { valor: 1, etiqueta: "Nunca o muy poco", descripcion: "Veo la estadistica descriptiva como ejercicios matematicos abstractos sin conexion con la realidad social de Mexico." },
          { valor: 2, etiqueta: "Algunas veces", descripcion: "Entiendo que la estadistica se usa en contextos reales, pero tengo dificultad para identificar ejemplos concretos de Mexico (INEGI, ENIGH, ENOE)." },
          { valor: 3, etiqueta: "Con frecuencia", descripcion: "Puedo conectar las medidas estadisticas con fuentes y contextos mexicanos en la mayoria de los casos, y entiendo por que el salario mediano importa mas que el promedio." },
          { valor: 4, etiqueta: "Siempre o casi siempre", descripcion: "Aplico con confianza las medidas estadisticas a datos reales de Mexico, cito fuentes del INEGI o CONEVAL para contextualizar mis analisis, y puedo interpretar lo que las cifras dicen sobre la desigualdad o las condiciones de vida." },
        ],
      },
    ],
    reflexion_final_prompt: "En que aspecto de la estadistica descriptiva necesitas mas practica y que estrategia usaras para fortalecer esa competencia antes del final del semestre?",
  },

  { // P05 — reflexion_escrita (probabilidad en la vida cotidiana, decisiones bajo incertidumbre)
    prompt: "La probabilidad esta presente en multiples decisiones de la vida cotidiana: el pronostico del tiempo (probabilidad de lluvia del 70%), los seguros de vida (primas basadas en tablas de mortalidad), el diagnostico medico (probabilidad de tener una enfermedad dado un resultado positivo en la prueba). Elige dos situaciones de tu vida donde tomas decisiones bajo incertidumbre. Analiza que tipo de probabilidad (clasica, frecuentista o subjetiva) se aplica a cada situacion y como afecta tu decision.",
    longitud_minima_palabras: 120,
    pistas: [
      "Piensa en decisiones de todos los dias: si llevo paraguas, si salgo a correr aunque 'quiza llueva', si voy al medico aunque 'probablemente no es nada'.",
      "Cuando dices 'probablemente no me vaya a pasar', estas usando probabilidad subjetiva basada en tu experiencia personal. Como podrias hacerla mas rigurosa?",
      "Cuando la CDMX dice 'probabilidad de lluvia del 60%', que tipo de probabilidad es esa y como deberia influir en tu decision de llevar o no paraguas?",
      "Hay situaciones donde subestimas o sobreestimas los riesgos? Como afecta eso tus decisiones cotidianas?",
    ],
    criterios_evaluacion: [
      "Identifica correctamente el tipo de probabilidad (clasica, frecuentista o subjetiva) en cada situacion elegida",
      "Explica como esa probabilidad influye o deberia influir en la decision tomada",
      "Reflexiona sobre si su estimacion del riesgo es rigurosa o esta sesgada por factores subjetivos",
    ],
  },

  { // P06 — reflexion_escrita (sensibilidad, especificidad, VPP en pruebas de cancer cervical)
    prompt: "El IMSS e ISSSTE realizan campanas de deteccion temprana de cancer de cervix (VPH/Papanicolaou) en Mexico. El cancer cervical tiene alta prevalencia entre mujeres de 25-65 anos. Considerando los conceptos de sensibilidad, especificidad y valor predictivo positivo: por que es importante conocer no solo el resultado positivo/negativo de una prueba, sino tambien la prevalencia de la enfermedad en la poblacion objetivo? Que podria pasar si una mujer recibe un resultado positivo en Papanicolaou sin entender el concepto de falso positivo?",
    longitud_minima_palabras: 130,
    pistas: [
      "Una prueba con 95% de especificidad rechaza correctamente al 95% de las personas sanas, pero el 5% restante recibe un falso positivo. Si hay muchas personas sanas en la poblacion, cuantos falsos positivos absolutamente eso genera?",
      "Que puede sentir y hacer una mujer que recibe un resultado positivo en Papanicolaou si no sabe que hay una probabilidad significativa de que sea un falso positivo?",
      "Por que los protocolos medicos del IMSS exigen confirmacion con una segunda prueba antes de diagnosticar definitivamente el cancer?",
      "Que papel juega la prevalencia (que tan comun es el cancer cervical en la poblacion que se esta estudiando) en el calculo del VPP?",
    ],
    criterios_evaluacion: [
      "Explica correctamente que es la sensibilidad y la especificidad de una prueba diagnostica y como se relacionan con los falsos positivos y falsos negativos",
      "Argumenta por que la prevalencia de la enfermedad determina el VPP, no solo la calidad tecnica de la prueba",
      "Reflexiona sobre las consecuencias humanas y sociales de no entender el concepto de falso positivo en un contexto de deteccion de cancer",
      "Conecta el analisis estadistico con las politicas de deteccion temprana del IMSS o ISSSTE en Mexico",
    ],
  },

  { // P07 — autoevaluacion (diseño de encuesta estadística comunitaria)
    criterios: [
      {
        descripcion: "Identifico el tipo de muestreo mas adecuado segun las caracteristicas de la poblacion y los objetivos del estudio",
        escala: [
          { valor: 1, etiqueta: "Nunca o muy poco", descripcion: "No conozco los diferentes tipos de muestreo o no puedo distinguir cuando usar cada uno." },
          { valor: 2, etiqueta: "Algunas veces", descripcion: "Conozco el muestreo aleatorio simple pero tengo dificultad para elegir entre estratificado, sistematico y por conglomerados segun el contexto." },
          { valor: 3, etiqueta: "Con frecuencia", descripcion: "Puedo justificar la eleccion del tipo de muestreo en la mayoria de los contextos, aunque a veces tengo dudas en casos complejos con multiples subgrupos." },
          { valor: 4, etiqueta: "Siempre o casi siempre", descripcion: "Analizo sistematicamente la estructura de la poblacion y los objetivos del estudio para elegir el tipo de muestreo mas eficiente y representativo, y puedo explicar las ventajas y limitaciones de cada opcion." },
        ],
      },
      {
        descripcion: "Calculo el tamaño de muestra y la distribucion por estratos en un muestreo estratificado",
        escala: [
          { valor: 1, etiqueta: "Nunca o muy poco", descripcion: "No se como calcular el numero de personas a encuestar en cada estrato ni la fraccion de muestreo." },
          { valor: 2, etiqueta: "Algunas veces", descripcion: "Puedo calcular la fraccion de muestreo cuando n y N me la dan, pero tengo dificultad para determinar el tamaño de muestra necesario segun el margen de error deseado." },
          { valor: 3, etiqueta: "Con frecuencia", descripcion: "Calculo correctamente la distribucion por estratos en la mayoria de los casos y entiendo como el tamaño de muestra afecta el margen de error." },
          { valor: 4, etiqueta: "Siempre o casi siempre", descripcion: "Calculo con precision la fraccion de muestreo, la distribucion proporcional por estratos y tengo claridad conceptual sobre la relacion entre tamaño de muestra, margen de error y nivel de confianza." },
        ],
      },
      {
        descripcion: "Reconozco posibles sesgos de seleccion y propongo como evitarlos",
        escala: [
          { valor: 1, etiqueta: "Nunca o muy poco", descripcion: "No identifico cuando una muestra puede tener sesgo de seleccion ni que consecuencias tiene para la validez de los resultados." },
          { valor: 2, etiqueta: "Algunas veces", descripcion: "Identifico el sesgo de seleccion en ejemplos obvios (encuesta solo a mis amigos) pero tengo dificultad en casos mas sutiles (encuesta en linea o de conveniencia)." },
          { valor: 3, etiqueta: "Con frecuencia", descripcion: "Identifico la mayoria de los tipos de sesgo de seleccion comunes y propongo alternativas para reducirlos en mi diseno de encuesta." },
          { valor: 4, etiqueta: "Siempre o casi siempre", descripcion: "Analizo proactivamente los posibles sesgos de seleccion antes de disenar la muestra, propongo estrategias concretas para minimizarlos y entiendo como el sesgo de seleccion limita la generalizacion de los resultados." },
        ],
      },
      {
        descripcion: "Diseño un cuestionario con preguntas claras, no tendenciosas y apropiadas para mi objetivo de estudio",
        escala: [
          { valor: 1, etiqueta: "Nunca o muy poco", descripcion: "Mis preguntas son confusas, demasiado largas o indujo la respuesta deseada sin darme cuenta." },
          { valor: 2, etiqueta: "Algunas veces", descripcion: "Diseño preguntas comprensibles pero a veces incluyo doble negacion, opciones incompletas o preguntas que combinan dos ideas diferentes." },
          { valor: 3, etiqueta: "Con frecuencia", descripcion: "La mayoria de mis preguntas son claras, con opciones de respuesta completas y mutuamente excluyentes, aunque ocasionalmente una pregunta puede ser ambigua." },
          { valor: 4, etiqueta: "Siempre o casi siempre", descripcion: "Diseño preguntas precisas, neutrales y apropiadas para el nivel de los encuestados, con escalas de respuesta bien construidas y sin sesgos de formulacion; reviso cada pregunta buscando posibles malentendidos antes de aplicar el cuestionario." },
        ],
      },
    ],
    reflexion_final_prompt: "Describe el problema o pregunta de investigacion que quieres estudiar con tu encuesta comunitaria. Que tipo de muestreo usarias y por que? Cuales son los principales riesgos de sesgo que debes controlar?",
  },

  { // P08 — debate_estructurado (medios de comunicacion y estadísticas en México)
    tema: "Los medios de comunicacion en Mexico usan la estadistica principalmente para informar a la ciudadania o para manipular la opinion publica?",
    posturas: [
      "Los medios de comunicacion usan la estadistica principalmente como herramienta de manipulacion de la opinion publica en Mexico",
      "Los medios de comunicacion usan la estadistica de forma mayoritariamente responsable para informar, aunque con errores inevitables de simplificacion",
    ],
    argumentos_guia: {
      "medios_manipulan": [
        "Las encuestas electorales son frecuentemente publicadas sin reportar el margen de error, lo que distorsiona la percepcion de ventajas o empates tecnicos entre candidatos",
        "Los graficos con ejes truncados son utilizados recurrentemente por medios de distintas tendencias politicas para dramatizar cambios menores en indicadores economicos como la inflacion o el tipo de cambio",
        "Los medios frecuentemente confunden correlacion con causalidad al reportar estudios medicos, generando panico o falsas expectativas en la poblacion sobre alimentos, medicamentos o habitos de vida",
        "La seleccion de cual dato publicar (cherry picking) permite a los medios construir narrativas contradictorias usando datos igualmente validos del INEGI o el CONEVAL segun la linea editorial del medio",
      ],
      "medios_informan": [
        "Los medios mexicanos han mejorado significativamente su uso de infografias y visualizacion de datos en los ultimos diez anos, haciendo la estadistica mas accesible para audiencias no especializadas",
        "El periodismo de datos en Mexico (Parametria, Animal Politico, El Universal Datos) ha introducido estandares mas rigurosos: reportan metodologia, margen de error y tamaño de muestra en sus encuestas",
        "Los errores estadisticos en medios son frecuentemente producto de la falta de formacion estadistica de los periodistas, no de una intencion deliberada de manipular a la audiencia",
        "La competencia entre medios y la critica de expertos en redes sociales incentiva la correccion de errores estadisticos cuando son denunciados publicamente, generando una dinamica de autocorreccion",
      ],
    },
    reglas: [
      "Usar ejemplos concretos de medios mexicanos reales en los argumentos",
      "Distinguir entre error involuntario por falta de formacion estadistica e intencion deliberada de manipular",
      "Respetar el tiempo de argumentacion de cada equipo sin interrumpir",
      "Proponer al final del debate al menos una solucion concreta para mejorar el uso de estadisticas en los medios de comunicacion mexicanos",
    ],
    tiempo_argumentacion_minutos: 15,
  },
];

main().catch((err) => { console.error("Error fatal:", err.message); process.exit(1); });
