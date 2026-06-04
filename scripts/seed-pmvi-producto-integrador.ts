/**
 * Producto Integrador del semestre para PM-VI (Pensamiento Matemático VI —
 * Estadística y Probabilidad, semestre 6).
 * - Crea 1 capstone (reflexion_escrita) que integra las 8 progresiones:
 *   1) Estadística descriptiva e inferencial; 2) Tablas de frecuencia, histogramas,
 *   polígonos y ojivas; 3) Medidas de tendencia central; 4) Medidas de dispersión;
 *   5) Probabilidad clásica, frecuentista y subjetiva; 6) Probabilidades de eventos
 *   simples, compuestos, condicionales e independientes; 7) Técnicas de muestreo
 *   y encuestas; 8) Interpretación crítica de estadísticas en medios.
 *   Se aloja en la progresión de mayor número (culminante de PM-VI).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar.
 * Uso: npx tsx scripts/seed-pmvi-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador PM-VI (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "PM-VI");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de PM-VI");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "PM-VI-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: Estudio Estadístico de mi Comunidad — Datos, Probabilidad y Lectura Crítica",
    descripcion: "Capstone del semestre: diseña y ejecuta un estudio estadístico en tu comunidad integrando las ocho progresiones de PM-VI: estadística descriptiva e inferencial, tablas de frecuencia y gráficas (histograma, polígono, ojiva), medidas de tendencia central (media, mediana, moda), medidas de dispersión (rango, varianza, desviación estándar), probabilidad clásica/frecuentista/subjetiva, probabilidades de eventos simples/compuestos/condicionales/independientes, técnicas de muestreo y lectura crítica de datos estadísticos en medios.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "PRODUCTO INTEGRADOR — PM-VI: Pensamiento Matemático VI\n\n" +
        "A lo largo del semestre desarrollaste ocho competencias estadísticas y probabilísticas fundamentales: " +
        "(1) distinguir la estadística descriptiva de la inferencial y su rol en la toma de decisiones basada en datos; " +
        "(2) organizar y representar datos en tablas de frecuencia, histogramas, polígonos de frecuencia y ojivas; " +
        "(3) calcular e interpretar medidas de tendencia central (media, mediana, moda); " +
        "(4) calcular e interpretar medidas de dispersión (rango, varianza, desviación estándar) y vincularlas con la confiabilidad de los datos; " +
        "(5) comprender y aplicar la probabilidad clásica, frecuentista y subjetiva; " +
        "(6) calcular probabilidades de eventos simples, compuestos, condicionales e independientes; " +
        "(7) aplicar técnicas de muestreo para planear y ejecutar una encuesta estadística en tu comunidad; " +
        "(8) interpretar resultados estadísticos presentados en medios con sentido crítico.\n\n" +
        "SITUACIÓN INTEGRADORA — ESTUDIO ESTADÍSTICO DE TU COMUNIDAD:\n" +
        "Eres parte de un equipo de investigación comunitaria encargado de diseñar, ejecutar, analizar e interpretar un estudio estadístico sobre un fenómeno de interés en tu escuela, colonia o municipio. " +
        "Puedes elegir el tema (hábitos de sueño, consumo de comida saludable, horas de pantalla, actividad física, rendimiento académico, acceso a internet, participación en actividades culturales, etc.) " +
        "y debes demostrar cómo cada una de las ocho competencias de PM-VI es indispensable para llevar el estudio de principio a fin.\n\n" +
        "Tu informe (mínimo 300 palabras) debe desarrollar CADA UNO de los siguientes ocho puntos con procedimientos estadísticos y probabilísticos completos, con cálculos justificados y resultados interpretados en el contexto de tu estudio:\n\n" +
        "1) ESTADÍSTICA DESCRIPTIVA E INFERENCIAL: Define claramente el objetivo de tu estudio. Identifica la variable principal (cuantitativa continua, discreta o cualitativa) y clasifícala. " +
        "Explica si tu estudio es principalmente descriptivo (resumir los datos de tu muestra) o si también harás inferencia (generalizar a una población más amplia). " +
        "Delimita la población de interés y justifica por qué tu muestra permite o no permite generalizar. Incluye al menos un ejemplo concreto de pregunta descriptiva y uno de pregunta inferencial relacionados con tu tema.\n\n" +
        "2) TABLAS DE FRECUENCIA, HISTOGRAMA, POLÍGONO Y OJIVA: Con los datos recolectados (puedes usar datos reales o un conjunto simulado coherente con tu tema de al menos 20 observaciones), " +
        "construye una tabla de frecuencias con al menos 5 clases. Incluye: límites de clase, marca de clase, frecuencia absoluta (f), frecuencia relativa (f/n) y frecuencia acumulada (F). " +
        "Describe el histograma resultante (forma: simétrica, sesgada a la derecha, sesgada a la izquierda, bimodal). " +
        "Con la ojiva, determina por debajo de qué valor se encuentra el 50% de tus datos (mediana gráfica) y compáralo con la mediana calculada algebraicamente.\n\n" +
        "3) MEDIDAS DE TENDENCIA CENTRAL — MEDIA, MEDIANA, MODA: Calcula las tres medidas de tendencia central para tu conjunto de datos. " +
        "Muestra el procedimiento completo: suma de datos y división entre n para la media (x̄ = Σxᵢ/n), identificación del valor central para la mediana (o promedio de los dos centrales si n es par), y el valor más frecuente para la moda. " +
        "Usa las marcas de clase de tu tabla de frecuencias si calculas la media de datos agrupados: x̄ ≈ Σ(mᵢ·fᵢ)/n. " +
        "Compara las tres medidas e interpreta cuál describe mejor el 'centro' de tus datos en el contexto de tu estudio. " +
        "¿Hay datos atípicos que distorsionen la media? Justifica tu elección de medida más representativa.\n\n" +
        "4) MEDIDAS DE DISPERSIÓN — RANGO, VARIANZA Y DESVIACIÓN ESTÁNDAR: Calcula paso a paso: " +
        "(a) el Rango = valor máximo − valor mínimo; " +
        "(b) la varianza poblacional σ² = Σ(xᵢ − μ)²/N (calcula cada desviación xᵢ − μ, elévala al cuadrado, súmalas y divide entre N); " +
        "(c) la desviación estándar σ = √σ². " +
        "Interpreta el valor de σ en las mismas unidades que tus datos: ¿están los datos muy dispersos o concentrados alrededor de la media? " +
        "Vincula la dispersión con la confiabilidad de tus conclusiones: si σ es grande, ¿qué implica para la representatividad de la media? " +
        "Si es pertinente, calcula el coeficiente de variación CV = (σ/μ)×100% para comparar la variabilidad relativa entre subgrupos de tu estudio.\n\n" +
        "5) PROBABILIDAD CLÁSICA, FRECUENTISTA Y SUBJETIVA: Define un espacio muestral relacionado con tu estudio. " +
        "Calcula al menos tres probabilidades usando los tres enfoques: " +
        "(a) Probabilidad clásica: si las categorías de respuesta son equiprobables, usa P(A) = casos favorables / casos totales. " +
        "(b) Probabilidad frecuentista: usa las frecuencias relativas de tu tabla para estimar la probabilidad de que un individuo elegido al azar pertenezca a cierta clase o responda de cierta forma. " +
        "(c) Probabilidad subjetiva: basada en tu contexto y conocimiento previo, estima una probabilidad antes de ver los datos y compárala con el resultado frecuentista obtenido. " +
        "Verifica que todas tus probabilidades estén en [0, 1] y que la suma de probabilidades del espacio muestral sea 1 (axiomas de Kolmogorov). " +
        "Calcula también la probabilidad del evento complementario de al menos uno de tus eventos: P(Aᶜ) = 1 − P(A).\n\n" +
        "6) PROBABILIDADES COMPUESTAS, CONDICIONALES E INDEPENDIENTES: Diseña al menos dos eventos compuestos a partir de tus datos. " +
        "Para cada par de eventos A y B relevantes en tu estudio: " +
        "(a) Calcula P(A∪B) = P(A) + P(B) − P(A∩B) usando la regla de la suma general; si son mutuamente excluyentes, verifica que P(A∩B)=0 y aplica la forma simplificada. " +
        "(b) Calcula la probabilidad condicional P(A|B) = P(A∩B)/P(B) e interpreta: '¿Cómo cambia la probabilidad de A cuando ya sé que B ocurrió?' " +
        "(c) Verifica si A y B son independientes: comprueba si P(A|B) = P(A) o equivalentemente P(A∩B) = P(A)·P(B). " +
        "Si los eventos no son independientes, calcula P(A∩B) = P(A)·P(B|A) usando la regla del producto para eventos dependientes. " +
        "Puedes construir un diagrama de árbol o una tabla de doble entrada para organizar los cálculos.\n\n" +
        "7) TÉCNICAS DE MUESTREO — DISEÑO Y EJECUCIÓN DE LA ENCUESTA: Describe el proceso completo de muestreo de tu estudio: " +
        "(a) Técnica elegida: aleatorio simple, sistemático, estratificado o por conglomerados. Justifica por qué es la más adecuada para tu población y objetivo. " +
        "(b) Tamaño de la muestra: calcula cuántos individuos necesitas (si deseas estudiar el 10% de tu escuela de 400 alumnos, n=40; ajusta según tu contexto). " +
        "(c) Procedimiento de selección: describe paso a paso cómo aplicaste (o aplicarías) la técnica elegida para obtener tu muestra sin sesgo. " +
        "(d) Cuestionario: presenta 3-5 preguntas de tu encuesta; verifica que no sean tendenciosas ni ambiguas. " +
        "(e) Identifica posibles fuentes de sesgo en tu diseño y explica cómo las mitigaste o cómo podrías hacerlo en un estudio más riguroso.\n\n" +
        "8) LECTURA CRÍTICA DE ESTADÍSTICAS EN MEDIOS: Busca (o construye) un ejemplo de un resultado estadístico relacionado con tu tema tal como aparecería en un medio de comunicación, red social o informe institucional. " +
        "Puede ser real o hipotético pero verosímil. Aplica el pensamiento estadístico crítico: " +
        "(a) Identifica si el dato presenta riesgo relativo o absoluto, y si el contexto es suficiente para interpretarlo correctamente. " +
        "(b) Detecta si la gráfica asociada contiene alguna manipulación visual (eje truncado, escala no uniforme, gráfica 3D engañosa). " +
        "(c) Evalúa la representatividad de la muestra citada: ¿cómo fue seleccionada? ¿es suficientemente grande? ¿hay sesgo de auto-selección? " +
        "(d) Identifica si se está confundiendo correlación con causalidad. " +
        "(e) Formula tres preguntas concretas que harías para validar las conclusiones del estudio antes de aceptarlas.\n\n" +
        "REFLEXIÓN FINAL: Cierra tu informe respondiendo: ¿Cuál de las ocho competencias estadísticas fue la más difícil de aplicar en tu estudio y por qué? " +
        "¿Qué aprendiste sobre la importancia de los datos y la estadística para tomar decisiones informadas en tu comunidad? " +
        "¿Cómo cambió (o reforzó) tu mirada crítica hacia las noticias y afirmaciones estadísticas que ves en medios y redes sociales?\n\n" +
        "Escribe con claridad y precisión estadística. Muestra todos los procedimientos y cálculos paso a paso. " +
        "Usa notación correcta (x̄ para media, μ para media poblacional, σ para desviación estándar, σ² para varianza, P(A) para probabilidad, Σ para sumatoria). " +
        "Incluye tablas, descripciones de gráficas y cálculos organizados. Justifica cada decisión metodológica con argumentos estadísticos.",
      pistas: [
        "Para la TABLA DE FRECUENCIAS: con n datos, usa la regla de Sturges para el número de clases: k ≈ 1 + 3.322·log₁₀(n). Para n=20 datos: k ≈ 1 + 3.322·log₁₀(20) ≈ 1 + 4.3 ≈ 5 clases. La amplitud de clase = (valor máximo − valor mínimo)/k. Asegúrate de que las clases sean mutuamente excluyentes y cubran todos los datos.",
        "Para la VARIANZA y DESVIACIÓN ESTÁNDAR: sigue estos pasos exactos: (1) calcula la media μ = Σxᵢ/N; (2) para cada dato, calcula (xᵢ − μ); (3) eleva al cuadrado cada desviación: (xᵢ − μ)²; (4) suma todas las desviaciones cuadradas: Σ(xᵢ − μ)²; (5) divide entre N (varianza poblacional): σ²; (6) saca la raíz cuadrada: σ = √σ². Recuerda: la varianza está en unidades², la desviación estándar en las mismas unidades que los datos.",
        "Para PROBABILIDAD CONDICIONAL y la tabla de doble entrada: organiza tus datos en una tabla de contingencia (2×2 o 2×3). Por ejemplo, filas = 'duerme ≥8h / duerme <8h', columnas = 'rinde bien / rinde regular / rinde mal'. Las frecuencias de las celdas te dan P(A∩B); los totales de filas y columnas te dan P(A) y P(B). Aplica P(A|B) = celda(A∩B)/total de columna B.",
        "Para el MUESTREO ESTRATIFICADO: si tu escuela tiene 3 grupos de bachillerato con 40, 35 y 25 alumnos (total 100) y quieres una muestra de 20: grupo 1: 20×(40/100)=8 alumnos; grupo 2: 20×(35/100)=7 alumnos; grupo 3: 20×(25/100)=5 alumnos. Suma: 8+7+5=20. Cada estrato aporta en proporción a su tamaño.",
        "Para la LECTURA CRÍTICA: recuerda las seis preguntas clave ante cualquier dato estadístico en medios: (1) ¿Quién publicó el dato y tiene intereses? (2) ¿Cómo se seleccionó la muestra y qué tan grande es? (3) ¿Los ejes de la gráfica comienzan en 0? (4) ¿Es riesgo relativo o absoluto? (5) ¿Hay una variable confusora que explique la correlación? (6) ¿Se muestra el margen de error o el intervalo de confianza?",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Define la variable, clasifica el tipo de estadística (descriptiva/inferencial), delimita la población y la muestra, y justifica si las conclusiones pueden generalizarse más allá de la muestra estudiada.",
        "Construye correctamente la tabla de frecuencias con al menos 5 clases (límites, marcas, frecuencias absolutas, relativas y acumuladas), describe la forma del histograma e interpreta la ojiva para leer el percentil 50.",
        "Calcula la media (x̄ = Σxᵢ/n), la mediana (valor central para n impar; promedio de centrales para n par) y la moda, comparando las tres medidas y justificando cuál es más representativa en el contexto del estudio.",
        "Calcula paso a paso el rango (máx − mín), la varianza poblacional (σ² = Σ(xᵢ−μ)²/N) y la desviación estándar (σ = √σ²), interpretando σ en las unidades del problema y vinculándola con la confiabilidad o consistencia de los datos.",
        "Calcula al menos tres probabilidades usando los enfoques clásico (Laplace), frecuentista (frecuencia relativa de la tabla) y subjetivo, verifica los axiomas de Kolmogorov y calcula el complemento de al menos un evento.",
        "Aplica la regla de la suma P(A∪B) = P(A)+P(B)−P(A∩B), calcula una probabilidad condicional P(A|B) con la fórmula correcta, e identifica si dos eventos de su estudio son independientes o dependientes con justificación numérica.",
        "Describe la técnica de muestreo elegida (aleatorio simple, sistemático, estratificado o conglomerados), calcula el tamaño de muestra, presenta el cuestionario sin preguntas sesgadas e identifica al menos dos posibles fuentes de sesgo y su mitigación.",
        "Analiza un resultado estadístico presentado en medios aplicando pensamiento crítico: identifica riesgo relativo vs. absoluto, detecta manipulaciones gráficas o confusión correlación-causalidad, evalúa la representatividad de la muestra y formula preguntas de validación.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador PM-VI creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de PM-VI (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 PM-VI total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
