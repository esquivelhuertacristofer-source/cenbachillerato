/**
 * Refuerzo de actividades para PM-VI (Pensamiento Matemático VI — Estadística y Probabilidad,
 * semestre 6) según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 8 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 8 progresiones × 4 = 32 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial PM-VI (MCCEMS 2025): estadística descriptiva e inferencial,
 * tablas de frecuencia, histogramas, polígonos, ojivas, medidas de tendencia central,
 * medidas de dispersión, probabilidad clásica/frecuentista/subjetiva, eventos simples/compuestos/
 * condicionales/independientes, muestreo y lectura crítica de datos estadísticos.
 * Uso: npx tsx scripts/seed-activities-pmvi-refuerzo.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Refuerzo = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;

const letras = ["A4", "A5", "A6", "A7"];

// Escala estándar de autoevaluación (1-4) reutilizada en todas las progresiones.
const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo ayudar a otra persona." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 Refuerzo PM-VI — Pensamiento Matemático VI: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "PM-VI");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const set = refuerzos[p.numero - 1];
    if (!set) { log(`⚠️  Sin refuerzos definidos para P${p.numero}`); continue; }
    for (let i = 0; i < set.length; i++) {
      const r = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`,
        titulo: r.titulo,
        descripcion: r.descripcion,
        tipo: r.tipo,
        progresion_id: p.id,
        xp: r.xp,
        contenido: r.contenido,
      });
      res ? ok++ : fail++;
    }
  }

  log(`\n✅ PM-VI refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Estadística descriptiva e inferencial ════════════
  [
    {
      titulo: "Verdadero o Falso — Estadística descriptiva e inferencial",
      descripcion: "Decide si cada afirmación sobre la diferencia entre estadística descriptiva e inferencial y su papel en la toma de decisiones basada en datos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La estadística descriptiva resume y organiza datos de una muestra o población sin extraer conclusiones más allá de esos datos.",
            respuesta: true,
            retroalimentacion: "Correcto. La estadística descriptiva describe los datos disponibles mediante tablas, gráficas y medidas numéricas, sin inferir conclusiones sobre una población mayor.",
          },
          {
            enunciado: "La estadística inferencial se usa para calcular la media de un conjunto de datos ya conocidos.",
            respuesta: false,
            retroalimentacion: "Falso. Calcular la media de datos conocidos es estadística descriptiva. La estadística inferencial usa muestras para hacer generalizaciones (inferencias) sobre una población.",
          },
          {
            enunciado: "Un censo es un ejemplo de recopilación de datos de toda la población, mientras que una encuesta a 200 estudiantes de una escuela de 1500 es una muestra.",
            respuesta: true,
            retroalimentacion: "Correcto. El censo abarca toda la población; la encuesta a 200 de 1500 constituye una muestra representativa.",
          },
          {
            enunciado: "Si un médico mide la presión arterial de 50 pacientes y concluye que el medicamento X reduce la presión en todos los adultos mayores, está haciendo estadística descriptiva.",
            respuesta: false,
            retroalimentacion: "Falso. Generalizar de 50 pacientes a 'todos los adultos mayores' es estadística inferencial: se extrapola más allá de los datos observados.",
          },
          {
            enunciado: "Una variable cuantitativa continua, como la estatura en centímetros, puede tomar cualquier valor dentro de un intervalo, a diferencia de una variable cualitativa como el género.",
            respuesta: true,
            retroalimentacion: "Correcto. Las variables cuantitativas continuas asumen valores en un intervalo real; las cualitativas (nominales u ordinales) representan categorías, no medidas numéricas.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Estadística descriptiva e inferencial",
      descripcion: "Glosario interactivo de los conceptos fundamentales de la estadística: descriptiva, inferencial, población, muestra y tipos de variables.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Estadística descriptiva",
            definicion: "Rama de la estadística que organiza, resume y presenta datos mediante tablas, gráficas y medidas numéricas (medias, medianas, desviaciones) sin generalizaciones más allá del conjunto de datos estudiado.",
            ejemplo: "Calcular el promedio de calificaciones de 30 estudiantes de un grupo y presentarlo en un histograma es estadística descriptiva.",
            etiquetas: ["descriptiva", "resumen", "datos"],
          },
          {
            termino: "Estadística inferencial",
            definicion: "Rama que usa datos de una muestra para hacer generalizaciones (inferencias) sobre una población más amplia, con un nivel de confianza o margen de error asociado.",
            ejemplo: "Encuestar a 400 ciudadanos de una ciudad de 1 000 000 habitantes para estimar el porcentaje que apoya una política pública.",
            etiquetas: ["inferencial", "generalización", "muestra"],
          },
          {
            termino: "Población y muestra",
            definicion: "La población es el conjunto completo de individuos u objetos de interés. La muestra es un subconjunto representativo extraído de la población para su estudio.",
            ejemplo: "Población: todos los alumnos de bachillerato de México. Muestra: 500 alumnos seleccionados al azar de 50 planteles.",
            etiquetas: ["población", "muestra", "subconjunto"],
          },
          {
            termino: "Variable estadística",
            definicion: "Característica que puede tomar distintos valores en los individuos de una muestra. Se clasifica en cualitativa (categorías) o cuantitativa (números), y esta última en discreta o continua.",
            ejemplo: "Variables cualitativas: color de ojos, estado civil. Variables cuantitativas discretas: número de hijos. Continuas: estatura, temperatura.",
            etiquetas: ["variable", "cualitativa", "cuantitativa"],
          },
          {
            termino: "Dato y frecuencia",
            definicion: "Un dato es la observación individual de una variable. La frecuencia es el número de veces que aparece ese valor (frecuencia absoluta) o su proporción respecto al total (frecuencia relativa).",
            ejemplo: "En un grupo de 20 alumnos, si 8 obtienen 8 en una prueba: frecuencia absoluta = 8; frecuencia relativa = 8/20 = 0.40 = 40%.",
            etiquetas: ["dato", "frecuencia", "absoluta", "relativa"],
          },
          {
            termino: "Toma de decisiones basada en datos",
            definicion: "Proceso que utiliza análisis estadístico —descriptivo e inferencial— para respaldar decisiones en salud, política, economía, ciencia y vida cotidiana, reduciendo la subjetividad.",
            ejemplo: "Un hospital usa estadística inferencial para decidir qué tratamiento adoptar con base en ensayos clínicos; una tienda usa estadística descriptiva para identificar sus productos más vendidos.",
            etiquetas: ["decisiones", "datos", "aplicación"],
          },
        ],
        actividad_final: "Clasifica las siguientes variables en cualitativa nominal, cualitativa ordinal, cuantitativa discreta o cuantitativa continua: (a) tipo de sangre, (b) nivel de satisfacción (1-5), (c) número de hermanos, (d) peso en kg. Luego escribe un ejemplo de pregunta de estadística descriptiva y uno de estadística inferencial usando esas variables.",
      },
    },
    {
      titulo: "Completa los espacios — Estadística descriptiva e inferencial",
      descripcion: "Completa los conceptos clave sobre los tipos de estadística, variables y toma de decisiones con datos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o valor correcto.",
        texto_con_huecos: "La estadística ___ organiza y resume los datos disponibles sin hacer generalizaciones. Cuando se usa una muestra para sacar conclusiones sobre toda la población, se hace estadística ___. El conjunto completo de individuos de interés se llama ___. La frecuencia relativa de un valor es el cociente entre su frecuencia absoluta y el total de ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "descriptiva",
            alternativas_aceptadas: [],
            pista: "La estadística que describe y resume datos sin inferir más allá se llama estadística ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "inferencial",
            alternativas_aceptadas: [],
            pista: "Generalizar de una muestra a la población completa es tarea de la estadística ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "población",
            alternativas_aceptadas: [],
            pista: "El conjunto total de individuos u objetos estudiados se denomina ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "datos",
            alternativas_aceptadas: ["observaciones"],
            pista: "Frecuencia relativa = frecuencia absoluta / total de ___ (n).",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Estadística descriptiva e inferencial",
      descripcion: "Reflexiona sobre tu comprensión de los fundamentos de la estadística y su papel en la toma de decisiones.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esto te ayudará a identificar qué reforzar.",
        criterios: [
          { descripcion: "Distingo con ejemplos concretos la estadística descriptiva de la inferencial.", escala: escala4 },
          { descripcion: "Identifico si un estudio trabaja con una muestra o con la población completa y justifico la diferencia.", escala: escala4 },
          { descripcion: "Clasifico variables estadísticas en cualitativas (nominal u ordinal) y cuantitativas (discreta o continua).", escala: escala4 },
          { descripcion: "Explico cómo la estadística apoya la toma de decisiones informadas en salud, educación u otro contexto real.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Puedes pensar en una decisión importante que hayas visto tomar en tu comunidad (salud, transporte, educación)? ¿Qué datos se necesitarían y qué tipo de estadística (descriptiva o inferencial) sería más útil para respaldar esa decisión?",
      },
    },
  ],

  // ════════════ P02 — Tablas de frecuencia, histogramas, polígonos y ojivas ════════════
  [
    {
      titulo: "Verdadero o Falso — Tablas de frecuencia, histogramas y ojivas",
      descripcion: "Decide si cada afirmación sobre la organización de datos en tablas de frecuencia, histogramas, polígonos de frecuencia y ojivas es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "En una tabla de frecuencias, la frecuencia acumulada de la última clase siempre es igual al total de datos (n).",
            respuesta: true,
            retroalimentacion: "Correcto. La frecuencia acumulada suma todas las frecuencias anteriores; al llegar a la última clase, la suma es igual a n (total de datos).",
          },
          {
            enunciado: "En un histograma, las barras representan categorías cualitativas y pueden separarse visualmente.",
            respuesta: false,
            retroalimentacion: "Falso. Los histogramas representan variables cuantitativas continuas agrupadas en intervalos; las barras son adyacentes (sin separación). Las barras separadas son características de los diagramas de barras para datos cualitativos.",
          },
          {
            enunciado: "El polígono de frecuencias se construye uniendo los puntos medios de las barras del histograma con segmentos de recta.",
            respuesta: true,
            retroalimentacion: "Correcto. El polígono de frecuencias conecta los puntos medios superiores de cada barra del histograma, permitiendo visualizar la forma de la distribución.",
          },
          {
            enunciado: "La ojiva (o polígono de frecuencias acumuladas) permite determinar qué porcentaje de datos es menor o igual a un valor dado.",
            respuesta: true,
            retroalimentacion: "Correcto. La ojiva grafica la frecuencia acumulada (absoluta o relativa) y sirve para leer percentiles y proporciones acumuladas de la distribución.",
          },
          {
            enunciado: "El número de clases de una tabla de frecuencias debe ser siempre exactamente 5, sin importar el tamaño del conjunto de datos.",
            respuesta: false,
            retroalimentacion: "Falso. El número de clases depende del tamaño de los datos. Una regla práctica es usar entre 5 y 20 clases; la regla de Sturges propone k ≈ 1 + 3.322 · log₁₀(n) clases.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Tablas de frecuencia y representaciones gráficas",
      descripcion: "Glosario interactivo sobre las herramientas de organización y representación gráfica de datos: tablas de frecuencia, histograma, polígono de frecuencias y ojiva.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Tabla de frecuencias",
            definicion: "Tabla que organiza datos en clases (intervalos) mostrando: límites del intervalo, marca de clase (punto medio), frecuencia absoluta (f), frecuencia relativa (f/n) y frecuencia acumulada (F).",
            ejemplo: "Edades de 20 personas [15-20): f=5, f/n=0.25, F=5; [20-25): f=9, f/n=0.45, F=14; [25-30): f=6, f/n=0.30, F=20.",
            etiquetas: ["tabla", "frecuencia", "clases"],
          },
          {
            termino: "Histograma",
            definicion: "Gráfico de barras adyacentes donde cada barra representa un intervalo de clase. El ancho de la barra es la amplitud del intervalo; la altura es la frecuencia (absoluta o relativa). Visualiza la forma de la distribución.",
            ejemplo: "Para calificaciones en el intervalo [60-70): frecuencia=8; barra de ancho 10 y altura 8 sobre el eje horizontal.",
            etiquetas: ["histograma", "barras", "intervalo"],
          },
          {
            termino: "Polígono de frecuencias",
            definicion: "Gráfico de líneas que une los puntos (marca de clase, frecuencia) de cada intervalo. Se cierra en los extremos conectando los puntos en cero para las clases anterior y posterior.",
            ejemplo: "Si las marcas de clase son 17.5, 22.5, 27.5 con frecuencias 5, 9, 6, el polígono conecta (12.5,0)→(17.5,5)→(22.5,9)→(27.5,6)→(32.5,0).",
            etiquetas: ["polígono", "frecuencias", "líneas"],
          },
          {
            termino: "Ojiva (polígono de frecuencias acumuladas)",
            definicion: "Gráfico que representa la frecuencia acumulada (F) en función del límite superior de cada clase. Tiene forma de S ascendente. Permite leer percentiles directamente.",
            ejemplo: "En la tabla anterior: límites superiores 20, 25, 30 con F = 5, 14, 20. La ojiva asciende de 0 a 20.",
            etiquetas: ["ojiva", "acumulada", "percentil"],
          },
          {
            termino: "Marca de clase (punto medio)",
            definicion: "Valor central de cada intervalo, calculado como (límite inferior + límite superior)/2. Se usa como representante del intervalo en cálculos de media y en la construcción del polígono.",
            ejemplo: "Para el intervalo [60, 70): marca de clase = (60 + 70)/2 = 65.",
            etiquetas: ["marca de clase", "punto medio", "intervalo"],
          },
          {
            termino: "Amplitud de clase",
            definicion: "Longitud de cada intervalo: amplitud = límite superior − límite inferior. Idealmente todos los intervalos tienen la misma amplitud para facilitar la comparación.",
            ejemplo: "Si el rango de datos es 50 y elegimos 5 clases: amplitud = 50/5 = 10 unidades por clase.",
            etiquetas: ["amplitud", "intervalo", "clase"],
          },
        ],
        actividad_final: "Con los siguientes 15 datos de tiempo de estudio semanal (horas): 5, 8, 12, 7, 10, 15, 9, 6, 11, 14, 8, 13, 7, 10, 12 — construye una tabla de frecuencias con 4 clases de amplitud 3 (comenzando en 5), calcula las frecuencias absolutas, relativas y acumuladas, y describe qué muestra la ojiva sobre el 60% de los estudiantes.",
      },
    },
    {
      titulo: "Completa los espacios — Tablas y gráficas estadísticas",
      descripcion: "Completa los conceptos y valores clave sobre tablas de frecuencia, histogramas, polígonos de frecuencias y ojivas.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o valor correcto.",
        texto_con_huecos: "En un histograma, las barras son ___ (sin espacio entre ellas) porque representan datos continuos. La frecuencia acumulada de la última clase es igual al total de ___ (n). El polígono de frecuencias une los ___ de clase con segmentos de recta. La ojiva permite leer directamente el valor de un ___, es decir, el valor por debajo del cual se encuentra un porcentaje dado de datos.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "adyacentes",
            alternativas_aceptadas: ["continuas", "juntas"],
            pista: "A diferencia del diagrama de barras, las barras del histograma están ___ (sin separación) porque los intervalos son contiguos.",
          },
          {
            posicion: 1,
            respuesta_correcta: "datos",
            alternativas_aceptadas: ["observaciones"],
            pista: "La frecuencia acumulada final siempre iguala el número total de ___ (n).",
          },
          {
            posicion: 2,
            respuesta_correcta: "puntos medios",
            alternativas_aceptadas: ["marcas de clase"],
            pista: "El polígono de frecuencias une los ___ (marcas de clase) de cada intervalo.",
          },
          {
            posicion: 3,
            respuesta_correcta: "percentil",
            alternativas_aceptadas: ["cuantil"],
            pista: "El valor por debajo del cual se encuentra x% de los datos se llama ___.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Tablas de frecuencia, histogramas y ojivas",
      descripcion: "Reflexiona sobre tu habilidad para organizar datos en tablas de frecuencia y representarlos gráficamente.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Construyo una tabla de frecuencias con intervalos, marcas de clase y frecuencias absolutas, relativas y acumuladas.", escala: escala4 },
          { descripcion: "Trazo un histograma correcto con barras adyacentes e interpreto la forma de la distribución.", escala: escala4 },
          { descripcion: "Construyo un polígono de frecuencias uniendo los puntos medios de los intervalos.", escala: escala4 },
          { descripcion: "Construyo e interpreto una ojiva para leer percentiles y frecuencias acumuladas.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cuál representación gráfica (histograma, polígono de frecuencias u ojiva) encontraste más útil para entender una distribución de datos? ¿Por qué? Da un ejemplo de una situación real en que usarías específicamente la ojiva.",
      },
    },
  ],

  // ════════════ P03 — Medidas de tendencia central ════════════
  [
    {
      titulo: "Verdadero o Falso — Media, mediana y moda",
      descripcion: "Decide si cada afirmación sobre el cálculo e interpretación de las medidas de tendencia central (media, mediana y moda) en contextos reales es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La media aritmética de los datos {4, 7, 7, 9, 13} es igual a (4+7+7+9+13)/5 = 40/5 = 8.",
            respuesta: true,
            retroalimentacion: "Correcto. La media se calcula sumando todos los valores y dividiendo entre el número de datos: Σx/n = 40/5 = 8.",
          },
          {
            enunciado: "La mediana de {3, 5, 7, 9, 11} es 7, porque es el valor central de los datos ordenados.",
            respuesta: true,
            retroalimentacion: "Correcto. Con 5 datos (n impar), la mediana es el valor en la posición (5+1)/2 = 3a posición: el valor 7.",
          },
          {
            enunciado: "Para el conjunto de datos {2, 4, 6, 8}, la mediana es 6 porque es el cuarto dato.",
            respuesta: false,
            retroalimentacion: "Falso. Con n=4 (par), la mediana es el promedio de los dos valores centrales (posiciones 2 y 3): (4+6)/2 = 5. La mediana es 5, no 6.",
          },
          {
            enunciado: "En un conjunto de datos muy sesgado (con valores extremos muy altos), la media es más representativa del centro que la mediana.",
            respuesta: false,
            retroalimentacion: "Falso. Con datos sesgados o valores atípicos, la mediana es más representativa porque no se ve afectada por los valores extremos, mientras que la media sí se distorsiona.",
          },
          {
            enunciado: "El conjunto {2, 5, 5, 7, 8, 8} tiene dos modas: 5 y 8, por lo que es bimodal.",
            respuesta: true,
            retroalimentacion: "Correcto. Cuando dos valores tienen la misma frecuencia máxima (ambos aparecen 2 veces), el conjunto es bimodal con modas 5 y 8.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Medidas de tendencia central",
      descripcion: "Glosario interactivo sobre la media aritmética, la mediana y la moda: definiciones, fórmulas y aplicaciones en contextos reales.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Media aritmética (promedio)",
            definicion: "Suma de todos los valores dividida entre el número total de datos: x̄ = Σxᵢ/n. Es sensible a valores extremos (atípicos).",
            ejemplo: "Sueldos: 8000, 9000, 10000, 9500, 43500 pesos. x̄ = 80000/5 = 16000. La media 16000 no representa bien a los 4 empleados con sueldos entre 8000 y 10000.",
            etiquetas: ["media", "promedio", "Σx/n"],
          },
          {
            termino: "Mediana",
            definicion: "Valor central de los datos ordenados de menor a mayor. Con n impar: posición (n+1)/2. Con n par: promedio de los valores en posiciones n/2 y n/2+1.",
            ejemplo: "Datos ordenados: {6, 8, 11, 14, 17} → n=5 (impar), mediana = 11. Datos: {4, 7, 9, 13} → n=4 (par), mediana = (7+9)/2 = 8.",
            etiquetas: ["mediana", "valor central", "datos ordenados"],
          },
          {
            termino: "Moda",
            definicion: "Valor o valores que aparecen con mayor frecuencia en el conjunto de datos. Un conjunto puede ser unimodal (una moda), bimodal (dos) o multimodal. Si todos los valores tienen la misma frecuencia, no hay moda.",
            ejemplo: "{3, 5, 5, 7, 9} → moda = 5 (unimodal). {2, 2, 4, 6, 6} → modas = 2 y 6 (bimodal). Talla más vendida en una tienda: moda práctica.",
            etiquetas: ["moda", "frecuencia", "bimodal"],
          },
          {
            termino: "Media ponderada",
            definicion: "Promedio donde cada valor xᵢ tiene un peso wᵢ. Fórmula: x̄ₚ = Σ(xᵢ·wᵢ)/Σwᵢ. Usada cuando los datos no tienen igual importancia.",
            ejemplo: "Calificación final: parcial (peso 3): 80; final (peso 5): 90; tarea (peso 2): 70. x̄ₚ = (80×3+90×5+70×2)/(3+5+2) = (240+450+140)/10 = 830/10 = 83.",
            etiquetas: ["media ponderada", "pesos", "promedio"],
          },
          {
            termino: "Sesgo y resistencia de medidas",
            definicion: "La media es sensible al sesgo (valores atípicos la distorsionan). La mediana y la moda son resistentes a valores extremos. En distribuciones simétricas las tres coinciden.",
            ejemplo: "Ingresos de una colonia: 5000, 6000, 5500, 5800, 150000 pesos. Media=34460 (sesgada por el valor alto). Mediana=5800 (más representativa).",
            etiquetas: ["sesgo", "atípico", "resistencia"],
          },
          {
            termino: "Medidas en datos agrupados",
            definicion: "Cuando los datos están en tabla de frecuencias, la media se aproxima con las marcas de clase: x̄ ≈ Σ(mᵢ·fᵢ)/n, donde mᵢ es la marca de clase y fᵢ la frecuencia de cada intervalo.",
            ejemplo: "Intervalos [60,70) y [70,80) con marcas 65 y 75 y frecuencias 8 y 12 (n=20): x̄ ≈ (65×8 + 75×12)/20 = (520+900)/20 = 1420/20 = 71.",
            etiquetas: ["datos agrupados", "marca de clase", "media agrupada"],
          },
        ],
        actividad_final: "Un equipo de fútbol anotó los siguientes goles en 9 partidos: 0, 1, 2, 1, 3, 1, 4, 2, 1. Calcula: (a) la media aritmética, (b) la mediana, (c) la moda. Luego explica cuál medida describe mejor el rendimiento habitual del equipo y por qué.",
      },
    },
    {
      titulo: "Completa los espacios — Medidas de tendencia central",
      descripcion: "Completa los cálculos y definiciones clave sobre media, mediana y moda.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el valor o término correcto.",
        texto_con_huecos: "La media aritmética de {2, 4, 6, 8, 10} es x̄ = ___. Para los datos ordenados {3, 7, 9, 15} (n=4 par), la mediana es el promedio de los dos valores centrales: (7+9)/2 = ___. La medida de tendencia central más útil cuando hay valores atípicos es la ___. El conjunto {4, 4, 6, 7, 7} tiene ___ modas.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "6",
            alternativas_aceptadas: [],
            pista: "x̄ = (2+4+6+8+10)/5 = 30/5 = ?",
          },
          {
            posicion: 1,
            respuesta_correcta: "8",
            alternativas_aceptadas: [],
            pista: "(7+9)/2 = 16/2 = ?",
          },
          {
            posicion: 2,
            respuesta_correcta: "mediana",
            alternativas_aceptadas: ["la mediana"],
            pista: "La medida resistente a valores extremos (atípicos) es la ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "dos",
            alternativas_aceptadas: ["2"],
            pista: "4 aparece 2 veces y 7 aparece 2 veces → el conjunto es bimodal con ___ modas.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Medidas de tendencia central",
      descripcion: "Reflexiona sobre tu dominio del cálculo e interpretación de la media, mediana y moda en contextos reales.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Calculo la media aritmética (x̄ = Σxᵢ/n) y la interpreto como el centro de equilibrio de los datos.", escala: escala4 },
          { descripcion: "Determino la mediana de datos ordenados para n impar y n par, y la interpreto como el valor que divide los datos a la mitad.", escala: escala4 },
          { descripcion: "Identifico la moda (unimodal, bimodal o sin moda) y explico su utilidad en contextos como tallas de ropa o calificaciones frecuentes.", escala: escala4 },
          { descripcion: "Selecciono la medida de tendencia central más adecuada (media, mediana o moda) según las características del conjunto de datos.", escala: escala4 },
        ],
        reflexion_final_prompt: "Imagina que eres el director de una escuela y quieres reportar el 'rendimiento promedio' de tus alumnos a los padres de familia. ¿Usarías la media, la mediana o la moda? ¿Cambia tu respuesta si hay 5 alumnos con calificaciones muy bajas (2, 3) y 25 con calificaciones entre 8 y 10?",
      },
    },
  ],

  // ════════════ P04 — Medidas de dispersión ════════════
  [
    {
      titulo: "Verdadero o Falso — Rango, varianza y desviación estándar",
      descripcion: "Decide si cada afirmación sobre el cálculo e interpretación de las medidas de dispersión (rango, varianza y desviación estándar) y su relación con la confiabilidad de datos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "El rango de los datos {4, 7, 12, 3, 9} es 12 − 3 = 9.",
            respuesta: true,
            retroalimentacion: "Correcto. El rango = valor máximo − valor mínimo = 12 − 3 = 9. Es la medida de dispersión más sencilla.",
          },
          {
            enunciado: "Una desviación estándar de 0 significa que todos los datos son iguales a la media.",
            respuesta: true,
            retroalimentacion: "Correcto. Si σ = 0, no hay variabilidad: todos los valores son idénticos e iguales a la media. Cuanto mayor es σ, más dispersos están los datos.",
          },
          {
            enunciado: "La varianza es la raíz cuadrada de la desviación estándar.",
            respuesta: false,
            retroalimentacion: "Falso. Es al revés: la desviación estándar es la raíz cuadrada de la varianza (σ = √σ²). La varianza se expresa en unidades al cuadrado; la desviación estándar, en las mismas unidades que los datos.",
          },
          {
            enunciado: "Para el conjunto {2, 4, 4, 4, 6}, la varianza poblacional σ² = Σ(xᵢ − μ)²/N = [(4+0+0+0+4)]/5 = 8/5 = 1.6.",
            respuesta: true,
            retroalimentacion: "Correcto. μ = (2+4+4+4+6)/5 = 20/5 = 4. Desviaciones: (2-4)²=4, (4-4)²=0, (4-4)²=0, (4-4)²=0, (6-4)²=4. Suma=8. σ²=8/5=1.6.",
          },
          {
            enunciado: "Una empresa cuyos tiempos de entrega tienen alta desviación estándar es más confiable que otra con desviación estándar baja.",
            respuesta: false,
            retroalimentacion: "Falso. Una desviación estándar alta indica mayor variabilidad e imprevisibilidad, lo que se traduce en menor confiabilidad. La empresa más confiable es la que tiene desviación estándar baja (tiempos de entrega consistentes).",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Medidas de dispersión",
      descripcion: "Glosario interactivo sobre el rango, la varianza y la desviación estándar: definiciones, fórmulas y su relación con la confiabilidad de los datos.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Rango (recorrido)",
            definicion: "La medida de dispersión más sencilla: Rango = valor máximo − valor mínimo. Indica el intervalo total que abarcan los datos, pero es muy sensible a valores atípicos.",
            ejemplo: "Temperaturas en una semana: 18, 22, 20, 25, 19, 21, 24 °C. Rango = 25 − 18 = 7 °C.",
            etiquetas: ["rango", "dispersión", "máximo", "mínimo"],
          },
          {
            termino: "Desviación de cada dato respecto a la media",
            definicion: "Para cada dato xᵢ, la desviación es (xᵢ − μ). La suma de todas las desviaciones es siempre 0, por lo que se usan las desviaciones al cuadrado para calcular la varianza.",
            ejemplo: "Datos: {2, 4, 6}, μ=4. Desviaciones: 2-4=-2, 4-4=0, 6-4=2. Suma=0. Desviaciones²: 4, 0, 4.",
            etiquetas: ["desviación", "media", "dispersión"],
          },
          {
            termino: "Varianza poblacional (σ²)",
            definicion: "Promedio de las desviaciones cuadráticas respecto a la media: σ² = Σ(xᵢ − μ)²/N. Se expresa en unidades al cuadrado (por ejemplo, kg², €²).",
            ejemplo: "Datos: {2, 4, 6}, μ=4, N=3. σ² = [(4+0+4)/3] = 8/3 ≈ 2.67 (unidades²).",
            etiquetas: ["varianza", "σ²", "desviaciones cuadradas"],
          },
          {
            termino: "Desviación estándar (σ)",
            definicion: "Raíz cuadrada de la varianza: σ = √σ². Se expresa en las mismas unidades que los datos, por lo que es más interpretable que la varianza. Indica cuánto se alejan los datos, en promedio, de la media.",
            ejemplo: "Si σ² = 8/3 ≈ 2.67, entonces σ = √2.67 ≈ 1.63. Los datos se apartan en promedio 1.63 unidades de la media.",
            etiquetas: ["desviación estándar", "σ", "raíz cuadrada"],
          },
          {
            termino: "Coeficiente de variación (CV)",
            definicion: "CV = (σ/μ) × 100%. Mide la dispersión relativa respecto a la media, permitiendo comparar la variabilidad de conjuntos con diferentes unidades o medias.",
            ejemplo: "Máquina A: μ=100 kg, σ=5 kg → CV=5%. Máquina B: μ=10 kg, σ=3 kg → CV=30%. La máquina B es relativamente más variable aunque su σ sea menor.",
            etiquetas: ["coeficiente de variación", "CV", "comparación"],
          },
          {
            termino: "Dispersión y confiabilidad de datos",
            definicion: "Una desviación estándar pequeña indica que los datos son consistentes y predecibles (alta confiabilidad). Una desviación estándar grande indica alta variabilidad e imprevisibilidad (menor confiabilidad).",
            ejemplo: "Dos proveedores envían piezas de 50 mm. Proveedor A: σ=0.2 mm (muy consistente). Proveedor B: σ=3 mm (poco confiable, piezas muy variables). Se elige el proveedor A.",
            etiquetas: ["confiabilidad", "variabilidad", "consistencia"],
          },
        ],
        actividad_final: "Para los datos de tiempo de respuesta de un call center en minutos: {3, 5, 7, 5, 4, 8, 6, 5, 9, 3} — calcula: (a) el rango, (b) la media μ, (c) la varianza poblacional σ², (d) la desviación estándar σ. Luego interpreta qué significa σ en el contexto del call center.",
      },
    },
    {
      titulo: "Completa los espacios — Medidas de dispersión",
      descripcion: "Completa los valores y fórmulas clave sobre rango, varianza y desviación estándar.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el valor o término correcto.",
        texto_con_huecos: "El rango de {10, 15, 8, 22, 13} es ___ (máximo − mínimo). La fórmula de la varianza poblacional es σ² = Σ(xᵢ − μ)² / ___. La desviación estándar es la ___ cuadrada de la varianza. Una desviación estándar ___ indica que los datos están concentrados cerca de la media (alta confiabilidad).",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "14",
            alternativas_aceptadas: [],
            pista: "Rango = valor máximo − valor mínimo = 22 − 8 = ?",
          },
          {
            posicion: 1,
            respuesta_correcta: "N",
            alternativas_aceptadas: ["n"],
            pista: "La varianza poblacional divide la suma de desviaciones cuadradas entre el número total de datos: ___ (o N).",
          },
          {
            posicion: 2,
            respuesta_correcta: "raíz",
            alternativas_aceptadas: ["raíz cuadrada"],
            pista: "σ = √σ². La desviación estándar es la ___ cuadrada de la varianza.",
          },
          {
            posicion: 3,
            respuesta_correcta: "pequeña",
            alternativas_aceptadas: ["baja", "pequeño"],
            pista: "Cuando los datos están muy concentrados alrededor de la media, la dispersión es ___ (σ cercana a 0).",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Medidas de dispersión",
      descripcion: "Reflexiona sobre tu dominio del cálculo e interpretación de rango, varianza y desviación estándar.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Calculo el rango de un conjunto de datos y lo interpreto como la amplitud total de la distribución.", escala: escala4 },
          { descripcion: "Calculo la varianza poblacional paso a paso: hallo la media, las desviaciones cuadradas, su suma y divido entre N.", escala: escala4 },
          { descripcion: "Obtengo la desviación estándar como raíz cuadrada de la varianza e interpreto su significado en las mismas unidades que los datos.", escala: escala4 },
          { descripcion: "Relaciono el valor de σ con la confiabilidad o consistencia de los datos: σ pequeña = datos concentrados = mayor confiabilidad.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué se usa la desviación estándar en lugar de la varianza para interpretar la dispersión de los datos? Da un ejemplo concreto (temperatura, calificaciones, tiempos) en que una σ alta sea problemática.",
      },
    },
  ],

  // ════════════ P05 — Probabilidad clásica, frecuentista y subjetiva ════════════
  [
    {
      titulo: "Verdadero o Falso — Tipos de probabilidad",
      descripcion: "Decide si cada afirmación sobre la probabilidad clásica, frecuentista y subjetiva es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La probabilidad clásica de obtener un número par al lanzar un dado estándar de 6 caras es P = 3/6 = 1/2, porque hay 3 resultados favorables (2, 4, 6) de 6 posibles igualmente probables.",
            respuesta: true,
            retroalimentacion: "Correcto. La regla de Laplace: P(A) = casos favorables / casos totales = 3/6 = 0.5. Aplica cuando todos los resultados son igualmente posibles.",
          },
          {
            enunciado: "La probabilidad frecuentista se determina antes del experimento usando la simetría del espacio muestral, sin necesidad de repetir el experimento.",
            respuesta: false,
            retroalimentacion: "Falso. Eso describe la probabilidad clásica (a priori). La probabilidad frecuentista se determina empíricamente repitiendo el experimento muchas veces y calculando la frecuencia relativa de éxito.",
          },
          {
            enunciado: "La probabilidad subjetiva es una estimación personal o experta basada en experiencia o creencias, y puede ser diferente para distintas personas ante el mismo evento.",
            respuesta: true,
            retroalimentacion: "Correcto. La probabilidad subjetiva no se basa en simetría ni en experimentos repetidos; es una valoración individual (por ejemplo, 'creo que hay un 70% de probabilidad de lluvia mañana').",
          },
          {
            enunciado: "La probabilidad de cualquier evento A debe estar entre 0 y 1, es decir, 0 ≤ P(A) ≤ 1.",
            respuesta: true,
            retroalimentacion: "Correcto. Este es el segundo axioma de Kolmogorov: la probabilidad de cualquier evento es un número en [0, 1]. P=0 implica imposible; P=1 implica certeza.",
          },
          {
            enunciado: "Si al lanzar una moneda 100 veces obtengo 43 caras, la probabilidad frecuentista de cara es exactamente 0.5.",
            respuesta: false,
            retroalimentacion: "Falso. La probabilidad frecuentista es la frecuencia relativa observada: 43/100 = 0.43. Se aproxima a 0.5 conforme el número de experimentos tiende a infinito (Ley de los Grandes Números), pero con 100 lanzamientos puede diferir.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Probabilidad clásica, frecuentista y subjetiva",
      descripcion: "Glosario interactivo sobre los tres enfoques de la probabilidad, el espacio muestral y los axiomas fundamentales de Kolmogorov.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Experimento aleatorio y espacio muestral",
            definicion: "Un experimento aleatorio es aquel cuyo resultado no puede predecirse con certeza. El espacio muestral (Ω o S) es el conjunto de todos los resultados posibles del experimento.",
            ejemplo: "Lanzar dos monedas: Ω = {CC, CS, SC, SS}. Lanzar un dado: Ω = {1, 2, 3, 4, 5, 6}.",
            etiquetas: ["espacio muestral", "experimento aleatorio", "Ω"],
          },
          {
            termino: "Probabilidad clásica (regla de Laplace)",
            definicion: "P(A) = número de casos favorables a A / número total de casos igualmente posibles. Aplica cuando todos los resultados del espacio muestral son equiprobables.",
            ejemplo: "Extraer una carta roja de una baraja de 52: P = 26/52 = 1/2. Sacar un número mayor que 4 en un dado: P = 2/6 = 1/3.",
            etiquetas: ["clásica", "Laplace", "equiprobable"],
          },
          {
            termino: "Probabilidad frecuentista (empírica)",
            definicion: "P(A) ≈ número de veces que ocurrió A / número total de experimentos realizados (frecuencia relativa). Se aproxima al valor teórico conforme n → ∞ (Ley de los Grandes Números).",
            ejemplo: "Una moneda se lanza 500 veces y cae cara 248 veces. Probabilidad frecuentista de cara = 248/500 = 0.496 ≈ 0.5.",
            etiquetas: ["frecuentista", "empírica", "frecuencia relativa"],
          },
          {
            termino: "Probabilidad subjetiva",
            definicion: "Estimación de la probabilidad basada en el juicio personal, experiencia o información experta, sin un espacio muestral simétrico ni experimentos repetidos. Puede variar entre personas.",
            ejemplo: "Un médico estima: 'hay un 80% de probabilidad de que el paciente se recupere'. Un meteorólogo: 'probabilidad de 65% de lluvia mañana'.",
            etiquetas: ["subjetiva", "juicio", "estimación"],
          },
          {
            termino: "Axiomas de Kolmogorov",
            definicion: "1) P(A) ≥ 0 para todo evento A. 2) P(Ω) = 1 (el espacio muestral tiene probabilidad 1). 3) Si A y B son mutuamente excluyentes: P(A∪B) = P(A) + P(B). Toda la teoría de probabilidad se construye sobre estos tres axiomas.",
            ejemplo: "P(cara) = 0.5 ≥ 0 ✓. P({1,2,3,4,5,6}) = 1 ✓. P(1 o 2) = P(1)+P(2) = 1/6+1/6 = 1/3 ✓.",
            etiquetas: ["axiomas", "Kolmogorov", "fundamentos"],
          },
          {
            termino: "Evento complementario",
            definicion: "El complemento de A (Aᶜ o Ā) es el evento que ocurre cuando A no ocurre. P(Aᶜ) = 1 − P(A). La suma de las probabilidades de un evento y su complemento siempre es 1.",
            ejemplo: "P(lluvia) = 0.35, entonces P(no lluvia) = 1 − 0.35 = 0.65. P(sacar 6 en dado) = 1/6, P(no sacar 6) = 5/6.",
            etiquetas: ["complemento", "P(Aᶜ)", "1−P(A)"],
          },
        ],
        actividad_final: "Clasifica cada afirmación como probabilidad clásica, frecuentista o subjetiva: (a) 'La probabilidad de sacar 3 en un dado es 1/6'. (b) 'Después de 200 lanzamientos de un dado, el 3 salió 38 veces: probabilidad ≈ 0.19'. (c) 'Creo que hay un 50% de probabilidad de que México clasifique al siguiente Mundial'. Calcula también el complemento de cada evento.",
      },
    },
    {
      titulo: "Completa los espacios — Tipos de probabilidad",
      descripcion: "Completa los conceptos y cálculos clave sobre probabilidad clásica, frecuentista y subjetiva.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el valor o término correcto.",
        texto_con_huecos: "La probabilidad clásica P(A) = casos ___ / casos totales. Si al lanzar un dado 300 veces aparece el 1 exactamente 54 veces, la probabilidad frecuentista de obtener 1 es ___. La probabilidad de cualquier evento A debe estar entre ___ y 1 (axioma de Kolmogorov). Si P(lluvia) = 0.4, entonces P(no lluvia) = ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "favorables",
            alternativas_aceptadas: ["favorables al evento"],
            pista: "Regla de Laplace: P(A) = casos ___ a A / número total de casos equiprobables.",
          },
          {
            posicion: 1,
            respuesta_correcta: "0.18",
            alternativas_aceptadas: ["54/300", "18/100"],
            pista: "Probabilidad frecuentista = ocurrencias / total de lanzamientos = 54/300 = ?",
          },
          {
            posicion: 2,
            respuesta_correcta: "0",
            alternativas_aceptadas: ["cero"],
            pista: "El primer axioma establece que P(A) ≥ ___ para cualquier evento A.",
          },
          {
            posicion: 3,
            respuesta_correcta: "0.6",
            alternativas_aceptadas: ["0,6"],
            pista: "P(Aᶜ) = 1 − P(A) = 1 − 0.4 = ?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Tipos de probabilidad",
      descripcion: "Reflexiona sobre tu comprensión de los tres enfoques de la probabilidad y sus fundamentos.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo la probabilidad clásica (regla de Laplace), frecuentista (frecuencia relativa) y subjetiva, con ejemplos concretos de cada una.", escala: escala4 },
          { descripcion: "Identifico el espacio muestral de experimentos simples (dado, moneda, urna) y calculo probabilidades clásicas.", escala: escala4 },
          { descripcion: "Enuncio los axiomas de Kolmogorov y los aplico para verificar que una asignación de probabilidades es válida.", escala: escala4 },
          { descripcion: "Calculo la probabilidad del complemento de un evento usando P(Aᶜ) = 1 − P(A).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿En qué situaciones de la vida cotidiana usarías probabilidad clásica, frecuentista o subjetiva? Da un ejemplo concreto de cada tipo en contextos de salud, deportes o medio ambiente.",
      },
    },
  ],

  // ════════════ P06 — Probabilidades de eventos simples, compuestos, condicionales e independientes ════════════
  [
    {
      titulo: "Verdadero o Falso — Eventos compuestos, condicionales e independientes",
      descripcion: "Decide si cada afirmación sobre el cálculo de probabilidades de eventos simples, compuestos, condicionales e independientes es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La regla de la suma para eventos mutuamente excluyentes es P(A∪B) = P(A) + P(B), sin restar la intersección.",
            respuesta: true,
            retroalimentacion: "Correcto. Si A y B son mutuamente excluyentes (no pueden ocurrir simultáneamente), P(A∩B)=0, por lo que P(A∪B) = P(A) + P(B).",
          },
          {
            enunciado: "Si P(A) = 0.4 y P(B) = 0.3 y los eventos son independientes, entonces P(A∩B) = P(A) × P(B) = 0.12.",
            respuesta: true,
            retroalimentacion: "Correcto. Para eventos independientes, la probabilidad de la intersección es el producto de sus probabilidades individuales: P(A∩B) = 0.4 × 0.3 = 0.12.",
          },
          {
            enunciado: "La probabilidad condicional P(A|B) representa la probabilidad de que ocurra B dado que ya ocurrió A.",
            respuesta: false,
            retroalimentacion: "Falso. P(A|B) es la probabilidad de que ocurra A dado que ya ocurrió B: P(A|B) = P(A∩B)/P(B). La notación indica primero el evento condicionado, luego el conocido.",
          },
          {
            enunciado: "Si en una bolsa hay 4 bolas rojas y 6 azules, la probabilidad de sacar 2 bolas rojas consecutivamente sin reposición es P = (4/10) × (3/9) = 12/90 = 2/15.",
            respuesta: true,
            retroalimentacion: "Correcto. En el primer sorteo P(R₁) = 4/10. En el segundo, sin reposición, quedan 3 rojas de 9 totales: P(R₂|R₁) = 3/9. P(R₁∩R₂) = 4/10 × 3/9 = 12/90 = 2/15.",
          },
          {
            enunciado: "Si P(A) = 0.5, P(B) = 0.4 y P(A∩B) = 0.2, entonces P(A∪B) = P(A) + P(B) − P(A∩B) = 0.5 + 0.4 − 0.2 = 0.7.",
            respuesta: true,
            retroalimentacion: "Correcto. Esta es la regla de la suma general (para eventos que no son mutuamente excluyentes): P(A∪B) = P(A) + P(B) − P(A∩B) = 0.9 − 0.2 = 0.7.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Eventos compuestos, condicionales e independientes",
      descripcion: "Glosario interactivo sobre las reglas de la suma y del producto, la probabilidad condicional y la independencia de eventos.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Regla de la suma (general)",
            definicion: "Para dos eventos cualesquiera A y B: P(A∪B) = P(A) + P(B) − P(A∩B). Si son mutuamente excluyentes (P(A∩B)=0): P(A∪B) = P(A) + P(B).",
            ejemplo: "Sacar un as o un corazón de una baraja de 52: P(as)=4/52, P(corazón)=13/52, P(as de corazón)=1/52. P(as∪corazón) = 4/52+13/52-1/52 = 16/52 = 4/13.",
            etiquetas: ["regla de la suma", "unión", "mutuamente excluyentes"],
          },
          {
            termino: "Regla del producto (eventos independientes)",
            definicion: "Dos eventos A y B son independientes si la ocurrencia de uno no afecta al otro: P(A∩B) = P(A) × P(B). Si no son independientes: P(A∩B) = P(A) × P(B|A).",
            ejemplo: "Lanzar una moneda y un dado: P(cara∩6) = P(cara)×P(6) = 0.5×(1/6) = 1/12, porque son independientes.",
            etiquetas: ["regla del producto", "independencia", "intersección"],
          },
          {
            termino: "Probabilidad condicional P(A|B)",
            definicion: "La probabilidad de que ocurra A dado que B ya ocurrió: P(A|B) = P(A∩B)/P(B), siempre que P(B)>0. Actualiza la probabilidad de A con la información de que B es cierto.",
            ejemplo: "En 100 estudiantes: 60 estudian, 40 practican deporte, 25 hacen ambas. P(deporte|estudian) = P(deporte∩estudian)/P(estudian) = 25/100 ÷ 60/100 = 25/60 ≈ 0.417.",
            etiquetas: ["condicional", "P(A|B)", "Bayes"],
          },
          {
            termino: "Eventos independientes vs. dependientes",
            definicion: "A y B son independientes si P(A|B) = P(A) (o equivalentemente P(B|A) = P(B), o P(A∩B) = P(A)·P(B)). Son dependientes si la ocurrencia de uno modifica la probabilidad del otro.",
            ejemplo: "Con reposición: extraer bola roja dos veces de una urna son eventos independientes. Sin reposición: son dependientes porque el segundo sorteo depende del resultado del primero.",
            etiquetas: ["independencia", "dependencia", "reposición"],
          },
          {
            termino: "Diagrama de árbol",
            definicion: "Representación visual de un experimento en etapas sucesivas. Cada rama muestra un resultado posible con su probabilidad. La probabilidad de una trayectoria es el producto de las probabilidades a lo largo de la rama.",
            ejemplo: "Lanzar una moneda dos veces: árbol con ramas CC(0.25), CS(0.25), SC(0.25), SS(0.25). Las 4 trayectorias suman 1.",
            etiquetas: ["diagrama de árbol", "etapas", "trayectoria"],
          },
          {
            termino: "Eventos mutuamente excluyentes",
            definicion: "Dos eventos son mutuamente excluyentes (o disjuntos) si no pueden ocurrir simultáneamente: A∩B = ∅ → P(A∩B) = 0. No confundir con independencia: los eventos mutuamente excluyentes NO son independientes (si uno ocurre, el otro tiene probabilidad 0).",
            ejemplo: "Sacar 3 y sacar 5 en un dado son mutuamente excluyentes. Sacar número par y número mayor que 3 NO son mutuamente excluyentes (el 4 y 6 pertenecen a ambos).",
            etiquetas: ["mutuamente excluyentes", "disjuntos", "intersección vacía"],
          },
        ],
        actividad_final: "Una caja contiene 5 bolas azules, 3 rojas y 2 verdes (total 10). Se extraen dos bolas sin reposición. Calcula: (a) P(primera azul) = ? (b) P(segunda azul | primera azul) = ? (c) P(ambas azules) usando la regla del producto. (d) ¿Son los dos eventos independientes? Justifica.",
      },
    },
    {
      titulo: "Completa los espacios — Probabilidad compuesta y condicional",
      descripcion: "Completa los cálculos y fórmulas clave sobre probabilidades de eventos compuestos, condicionales e independientes.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el valor o expresión correcta.",
        texto_con_huecos: "La regla general de la suma es P(A∪B) = P(A) + P(B) − ___. Para eventos independientes, P(A∩B) = P(A) × ___. La probabilidad condicional se define como P(A|B) = P(A∩B) / ___. Si P(A)=0.3 y P(B)=0.5 y son mutuamente excluyentes, entonces P(A∪B) = ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "P(A∩B)",
            alternativas_aceptadas: ["P(A ∩ B)", "P(AnB)"],
            pista: "P(A∪B) = P(A) + P(B) − ___ (para evitar contar la intersección dos veces).",
          },
          {
            posicion: 1,
            respuesta_correcta: "P(B)",
            alternativas_aceptadas: ["P(b)"],
            pista: "Eventos independientes: P(A∩B) = P(A) × ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "P(B)",
            alternativas_aceptadas: ["P(b)"],
            pista: "P(A|B) = P(A∩B) / ___ (probabilidad del evento conocido).",
          },
          {
            posicion: 3,
            respuesta_correcta: "0.8",
            alternativas_aceptadas: ["0,8"],
            pista: "Si A y B son mutuamente excluyentes: P(A∪B) = P(A) + P(B) = 0.3 + 0.5 = ?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Probabilidad compuesta, condicional e independencia",
      descripcion: "Reflexiona sobre tu dominio de las reglas de la suma y del producto, la probabilidad condicional y la independencia de eventos.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Aplico la regla de la suma P(A∪B) = P(A)+P(B)−P(A∩B) y la simplifico cuando los eventos son mutuamente excluyentes.", escala: escala4 },
          { descripcion: "Identifico si dos eventos son independientes o dependientes y aplico la regla del producto correspondiente.", escala: escala4 },
          { descripcion: "Calculo probabilidades condicionales usando P(A|B) = P(A∩B)/P(B) e interpreto el resultado en contexto.", escala: escala4 },
          { descripcion: "Uso diagramas de árbol para calcular probabilidades en experimentos en dos o más etapas sucesivas.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cuál es la diferencia entre eventos mutuamente excluyentes e independientes? Describe un ejemplo concreto de cada caso y explica por qué es importante distinguirlos en la práctica (medicina, seguros, juegos de azar).",
      },
    },
  ],

  // ════════════ P07 — Técnicas de muestreo y encuestas estadísticas ════════════
  [
    {
      titulo: "Verdadero o Falso — Técnicas de muestreo",
      descripcion: "Decide si cada afirmación sobre las técnicas de muestreo, el diseño de encuestas y la realización de estudios estadísticos en la comunidad es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "En el muestreo aleatorio simple, cada individuo de la población tiene la misma probabilidad de ser seleccionado.",
            respuesta: true,
            retroalimentacion: "Correcto. El muestreo aleatorio simple garantiza equiprobabilidad de selección para todos los individuos de la población, lo que permite generalizaciones válidas.",
          },
          {
            enunciado: "El muestreo estratificado divide la población en grupos homogéneos (estratos) y selecciona muestras de cada estrato en proporción al tamaño del estrato en la población.",
            respuesta: true,
            retroalimentacion: "Correcto. El muestreo estratificado garantiza representación de todos los subgrupos importantes de la población (por ejemplo, por género, edad o grado escolar).",
          },
          {
            enunciado: "El sesgo de selección ocurre cuando los elementos de la muestra no son representativos de la población, lo que puede invalidar las conclusiones del estudio.",
            respuesta: true,
            retroalimentacion: "Correcto. El sesgo de selección es uno de los errores más graves en estadística: si la muestra no refleja adecuadamente a la población, las inferencias son incorrectas.",
          },
          {
            enunciado: "En el muestreo sistemático se selecciona un individuo al azar de los primeros k elementos y después cada k-ésimo elemento de la lista. Este método siempre produce una muestra aleatoria perfecta.",
            respuesta: false,
            retroalimentacion: "Falso. El muestreo sistemático puede introducir sesgos si existe un patrón periódico en la lista que coincida con el intervalo k. Es conveniente cuando la lista es aleatoria, pero no garantiza aleatoriedad perfecta en todos los casos.",
          },
          {
            enunciado: "Una encuesta voluntaria en redes sociales es un ejemplo de muestreo por conveniencia y puede producir resultados sesgados porque solo responden quienes tienen interés en el tema.",
            respuesta: true,
            retroalimentacion: "Correcto. El muestreo por conveniencia (o auto-selección) produce muestras no representativas porque los participantes se auto-seleccionan, introduciendo sesgo sistemático en los resultados.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Técnicas de muestreo y diseño de estudios",
      descripcion: "Glosario interactivo sobre los principales métodos de muestreo, el diseño de encuestas estadísticas y los conceptos clave para estudios en la comunidad.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Muestreo aleatorio simple",
            definicion: "Técnica en la que cada elemento de la población tiene la misma probabilidad de ser seleccionado. Se puede realizar mediante números aleatorios, tómbola o tabla de números aleatorios.",
            ejemplo: "De una lista de 500 alumnos, seleccionar 50 al azar asignando un número a cada alumno y usando un generador de números aleatorios.",
            etiquetas: ["aleatorio simple", "equiprobable", "azar"],
          },
          {
            termino: "Muestreo sistemático",
            definicion: "Se elige aleatoriamente uno de los primeros k elementos y luego se selecciona cada k-ésimo elemento: k = N/n (tamaño de la población entre tamaño de la muestra).",
            ejemplo: "De 400 estudiantes (N) se desea una muestra de 40 (n): k=400/40=10. Se elige al azar uno entre los primeros 10 (por ejemplo, el 7) y luego el 17, 27, 37, …",
            etiquetas: ["sistemático", "intervalo k", "lista"],
          },
          {
            termino: "Muestreo estratificado",
            definicion: "La población se divide en subgrupos homogéneos (estratos: sexo, grado, región) y se selecciona una muestra aleatoria de cada estrato en proporción a su tamaño.",
            ejemplo: "Escuela con 300 alumnos de 1er grado, 200 de 2do y 100 de 3ro. Para una muestra de 60: 30 de 1er, 20 de 2do y 10 de 3er grado (en proporción).",
            etiquetas: ["estratificado", "estratos", "proporcional"],
          },
          {
            termino: "Muestreo por conglomerados",
            definicion: "La población se divide en grupos heterogéneos (conglomerados), se seleccionan aleatoriamente algunos conglomerados y se estudian todos sus elementos.",
            ejemplo: "Para encuestar hogares de una ciudad: se seleccionan al azar 10 manzanas (conglomerados) y se encuestan todos los hogares de esas manzanas.",
            etiquetas: ["conglomerados", "grupos", "selección de grupos"],
          },
          {
            termino: "Sesgo y error muestral",
            definicion: "El sesgo es un error sistemático que hace que la muestra no represente bien a la población (pregunta tendenciosa, muestra no representativa). El error muestral es la diferencia aleatoria inevitable entre el estadístico de la muestra y el parámetro de la población.",
            ejemplo: "Pregunta sesgada: '¿No cree usted que el director debería renunciar?' induce una respuesta. El error muestral disminuye aumentando el tamaño de la muestra.",
            etiquetas: ["sesgo", "error muestral", "representatividad"],
          },
          {
            termino: "Diseño de encuesta: pasos esenciales",
            definicion: "1) Definir el objetivo y la población. 2) Elegir técnica de muestreo y calcular n. 3) Diseñar el cuestionario (preguntas claras, sin sesgo). 4) Recopilar datos. 5) Organizar y analizar. 6) Interpretar y reportar con medidas descriptivas.",
            ejemplo: "Estudio sobre hábitos de lectura en la escuela: definir población (alumnos de bachillerato), elegir muestreo estratificado por grado, diseñar 10 preguntas sin sesgo, encuestar, calcular media y frecuencias, presentar histograma y conclusiones.",
            etiquetas: ["encuesta", "diseño", "pasos"],
          },
        ],
        actividad_final: "Diseña en miniatura un estudio estadístico en tu comunidad escolar: (a) define el objetivo y la variable a medir, (b) identifica la población y calcula el tamaño de muestra necesario si deseas estudiar el 10%, (c) elige la técnica de muestreo más adecuada y justifica tu elección, (d) escribe 3 preguntas del cuestionario sin sesgo y (e) describe cómo organizarías los datos en una tabla de frecuencias.",
      },
    },
    {
      titulo: "Completa los espacios — Técnicas de muestreo",
      descripcion: "Completa los conceptos clave sobre los tipos de muestreo, el sesgo y el diseño de estudios estadísticos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o valor correcto.",
        texto_con_huecos: "En el muestreo ___, cada elemento de la población tiene la misma probabilidad de ser elegido. En el muestreo sistemático, si N=200 y n=20, el intervalo de selección k = ___. El muestreo ___ divide la población en subgrupos homogéneos y selecciona muestras de cada uno en proporción a su tamaño. El error producido por una muestra no representativa de la población se llama ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "aleatorio simple",
            alternativas_aceptadas: ["aleatorio"],
            pista: "La técnica donde todos tienen igual probabilidad de selección es el muestreo ___ simple.",
          },
          {
            posicion: 1,
            respuesta_correcta: "10",
            alternativas_aceptadas: [],
            pista: "k = N/n = 200/20 = ?",
          },
          {
            posicion: 2,
            respuesta_correcta: "estratificado",
            alternativas_aceptadas: [],
            pista: "El muestreo que garantiza representación de todos los subgrupos (estratos) de la población se llama muestreo ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "sesgo",
            alternativas_aceptadas: ["sesgo de selección"],
            pista: "El error sistemático que surge cuando la muestra no refleja a la población se llama ___.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Técnicas de muestreo y encuestas",
      descripcion: "Reflexiona sobre tu dominio de las técnicas de muestreo y tu capacidad para planear y ejecutar un estudio estadístico.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Describo y distingo los cuatro tipos de muestreo (aleatorio simple, sistemático, estratificado, conglomerados) con ejemplos concretos.", escala: escala4 },
          { descripcion: "Identifico fuentes de sesgo en el diseño de encuestas (preguntas tendenciosas, muestra por conveniencia, auto-selección) y propongo correcciones.", escala: escala4 },
          { descripcion: "Diseño los pasos de un estudio estadístico en mi comunidad: objetivo, población, técnica de muestreo y cuestionario sin sesgo.", escala: escala4 },
          { descripcion: "Organizo los datos recolectados en tablas de frecuencia y los represento con histogramas o polígonos para comunicar los resultados.", escala: escala4 },
        ],
        reflexion_final_prompt: "Si quisieras estudiar el promedio de horas que los alumnos de tu escuela duermen por noche, ¿qué técnica de muestreo usarías y por qué? ¿Cómo asegurarías que tu muestra no esté sesgada? Describe el procedimiento completo.",
      },
    },
  ],

  // ════════════ P08 — Interpretación crítica de resultados estadísticos en medios ════════════
  [
    {
      titulo: "Verdadero o Falso — Lectura crítica de estadísticas en medios",
      descripcion: "Decide si cada afirmación sobre la interpretación crítica de resultados estadísticos presentados en medios de comunicación es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Una gráfica de barras con el eje y truncado (que no comienza en 0) puede exagerar visualmente las diferencias entre grupos, generando una impresión distorsionada de los datos.",
            respuesta: true,
            retroalimentacion: "Correcto. Truncar el eje y es una técnica común de manipulación visual. Si el eje empieza en, por ejemplo, 80 en lugar de 0, una diferencia pequeña de 2 puntos parece enorme. Siempre verificar el origen de los ejes.",
          },
          {
            enunciado: "Un titular que dice 'el nuevo medicamento reduce el riesgo en un 50%' es siempre suficiente información para evaluar la eficacia del tratamiento, sin necesitar el contexto completo.",
            respuesta: false,
            retroalimentacion: "Falso. El 50% puede ser engañoso sin el riesgo absoluto. Si el riesgo basal era de 0.002% (2 en 100000), reducirlo al 0.001% es un 50% de reducción relativa, pero el beneficio absoluto es ínfimo. Siempre se necesita el contexto.",
          },
          {
            enunciado: "La correlación entre dos variables (por ejemplo, consumo de helado y muertes por ahogamiento) no implica necesariamente que una cause a la otra; puede existir una variable confusora (el calor del verano).",
            respuesta: true,
            retroalimentacion: "Correcto. Correlación no implica causalidad. Una variable confusora (el calor) puede explicar la correlación entre helado y ahogamientos, sin que haya relación causal directa entre ellas.",
          },
          {
            enunciado: "Una encuesta con 10 000 participantes siempre es más confiable que una con 500, independientemente de cómo se seleccionó la muestra.",
            respuesta: false,
            retroalimentacion: "Falso. El tamaño de la muestra importa, pero la representatividad es fundamental. Una muestra de 10000 auto-seleccionados (sesgada) puede ser menos confiable que 500 elegidos con muestreo aleatorio estratificado correctamente.",
          },
          {
            enunciado: "Cuando una noticia informa que 'el 80% de los expertos apoya X', es importante preguntar cuántos expertos fueron consultados y cómo fueron seleccionados antes de aceptar la afirmación.",
            respuesta: true,
            retroalimentacion: "Correcto. El 80% de 5 expertos (4 de 5) es estadísticamente insignificante. El número total, el método de selección y posibles conflictos de interés son esenciales para evaluar la solidez del dato.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Interpretación crítica de estadísticas en medios",
      descripcion: "Glosario interactivo sobre las herramientas para leer con sentido crítico los resultados estadísticos presentados en medios de comunicación y redes sociales.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Correlación vs. causalidad",
            definicion: "Dos variables están correlacionadas si tienden a cambiar juntas, pero eso no implica que una cause a la otra. Puede haber una variable confusora (tercera variable) que explique la relación.",
            ejemplo: "Ciudades con más hospitales tienen más muertes → correlación positiva, pero causarla es absurdo. Los hospitales se ubican donde hay más población y enfermos.",
            etiquetas: ["correlación", "causalidad", "confusora"],
          },
          {
            termino: "Riesgo relativo vs. riesgo absoluto",
            definicion: "El riesgo relativo (RR) es el cociente entre la probabilidad de un evento en dos grupos. El riesgo absoluto es la diferencia en probabilidades. Un RR grande puede corresponder a un beneficio absoluto pequeño si el riesgo basal es muy bajo.",
            ejemplo: "Tratamiento reduce accidentes cerebrales de 0.4% a 0.2%: RR=50% de reducción (impresionante) pero reducción absoluta = 0.2% (solo 2 de cada 1000 personas más se benefician).",
            etiquetas: ["riesgo relativo", "riesgo absoluto", "beneficio"],
          },
          {
            termino: "Manipulación gráfica",
            definicion: "Técnicas que distorsionan la percepción visual de los datos: eje truncado (no inicia en 0), escala no uniforme, gráficas 3D que exageran volúmenes, selección parcial del período mostrado.",
            ejemplo: "Gráfica de barras con eje y entre 90 y 100: una caída de 98 a 95 parece catastrófica. Con eje desde 0, la diferencia de 3 puntos es casi imperceptible.",
            etiquetas: ["manipulación", "gráfica", "eje truncado"],
          },
          {
            termino: "Tamaño y representatividad de la muestra",
            definicion: "Una muestra debe ser suficientemente grande Y representativa de la población para que las conclusiones sean válidas. Una muestra grande pero sesgada es menos útil que una pequeña y bien seleccionada.",
            ejemplo: "Encuesta de satisfacción en redes sociales: 50 000 respuestas, pero solo participaron usuarios activos jóvenes. Resultado: no representa a la población adulta mayor.",
            etiquetas: ["tamaño muestral", "representatividad", "sesgo"],
          },
          {
            termino: "Afirmaciones sin contexto y cherry-picking",
            definicion: "Reportar solo los datos que apoyan una conclusión (cherry-picking) y omitir los contradictorios es una forma de manipulación estadística. Todo resultado debe presentarse con su contexto completo.",
            ejemplo: "Empresa anuncia: 'este año nuestras ventas crecieron 300%'. Contexto omitido: el año anterior vendieron solo 10 pesos; este año vendieron 40. El crecimiento es real pero el contexto cambia la percepción.",
            etiquetas: ["cherry-picking", "contexto", "manipulación"],
          },
          {
            termino: "Preguntas para evaluar una estadística",
            definicion: "Al ver un dato estadístico, pregunta: ¿Quién lo publicó y tiene intereses? ¿Cuál fue el método de muestreo? ¿El tamaño muestral es adecuado? ¿Los ejes de la gráfica comienzan en 0? ¿Se muestra el margen de error? ¿Es riesgo relativo o absoluto?",
            ejemplo: "Titular: 'Producto X aumenta la energía en un 200%'. Preguntas: ¿Comparado con qué? ¿Cuántos participantes en el estudio? ¿Quién financió la investigación? ¿Fue revisada por pares?",
            etiquetas: ["pensamiento crítico", "evaluación", "preguntas"],
          },
        ],
        actividad_final: "Busca en internet o en un periódico una noticia que cite datos estadísticos (puede ser sobre salud, economía, deporte o política). Aplica el pensamiento crítico: (a) identifica el tipo de estadística presentada (descriptiva o inferencial), (b) detecta si hay manipulación gráfica o riesgo relativo presentado sin contexto, (c) evalúa la representatividad de la muestra, (d) formula dos preguntas que harías al autor para validar las conclusiones.",
      },
    },
    {
      titulo: "Completa los espacios — Interpretación crítica de estadísticas",
      descripcion: "Completa los conceptos y términos clave para leer estadísticas con sentido crítico en medios de comunicación.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o concepto correcto.",
        texto_con_huecos: "Cuando dos variables cambian juntas pero ninguna causa a la otra (puede haber una variable ___ que explique la relación), se dice que hay correlación sin causalidad. Una gráfica de barras con el eje y que no comienza en cero puede ___ visualmente las diferencias entre grupos. Un medicamento que reduce el riesgo del 2% al 1% tiene un riesgo ___ del 50% pero un riesgo ___ de solo 1 punto porcentual. Reportar solo los datos convenientes y omitir los contrarios se llama ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "confusora",
            alternativas_aceptadas: ["de confusión", "confundidora"],
            pista: "La variable que explica una correlación sin que haya causalidad entre las dos variables observadas se llama variable ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "exagerar",
            alternativas_aceptadas: ["distorsionar", "amplificar"],
            pista: "Un eje y truncado (no inicia en 0) hace que diferencias pequeñas parezcan grandes: ___ visualmente las diferencias.",
          },
          {
            posicion: 2,
            respuesta_correcta: "relativo",
            alternativas_aceptadas: [],
            pista: "El porcentaje de reducción calculado como (2%-1%)/2% = 50% es el riesgo ___ (compara los dos grupos entre sí).",
          },
          {
            posicion: 3,
            respuesta_correcta: "absoluto",
            alternativas_aceptadas: [],
            pista: "La diferencia directa entre las dos proporciones (2% − 1% = 1%) es el riesgo ___ (mide el impacto real en términos directos).",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Interpretación crítica de estadísticas en medios",
      descripcion: "Reflexiona sobre tu capacidad para leer con sentido crítico los datos estadísticos presentados en medios de comunicación y redes sociales.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo correlación de causalidad e identifico posibles variables confusoras en noticias o estudios.", escala: escala4 },
          { descripcion: "Detecto manipulaciones gráficas (eje truncado, escala engañosa, gráficas 3D) que distorsionan la percepción de los datos.", escala: escala4 },
          { descripcion: "Evalúo la solidez de una estadística preguntando sobre el tamaño y método de muestreo, el financiamiento del estudio y el contexto de los datos.", escala: escala4 },
          { descripcion: "Distingo riesgo relativo de riesgo absoluto y uso esa distinción para evaluar críticamente afirmaciones sobre beneficios o riesgos.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Has visto alguna vez una noticia, anuncio o publicación en redes sociales que usara estadísticas de forma engañosa (aunque no necesariamente falsa)? Descríbela y explica qué preguntas críticas harías para evaluarla correctamente.",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
