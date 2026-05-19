/**
 * Seed de actividades pedagógicas para CNEYT-II (Ciencias Naturales, Experimentales y Tecnología II).
 * 8 progresiones × 3 actividades = 24 actividades. estado='publicada'.
 * Tipos: lectura, video_con_preguntas, infografia, quiz_multiple_opcion,
 *        quiz_verdadero_falso, reflexion_escrita, ejercicio_matematico,
 *        fill_blanks, simulacion, debate_estructurado, glosario_interactivo, autoevaluacion (12 tipos)
 * Uso: npx tsx scripts/seed-activities-cneytii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CNEYT-II — Ciencias Naturales, Experimentales y Tecnología II\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-II");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo;
    const n = p.numero;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[n - 1].a1,
      descripcion: "Introducción conceptual al propósito formativo.",
      tipo: tiposA1[n - 1],
      progresion_id: p.id,
      xp: 10,
      estado: "publicada",
      contenido: contenidosA1[n - 1],
    });
    a1ok ? ok++ : fail++;

    const a2ok = await upsertActividad(sb, {
      codigo: `${base}-A2`,
      titulo: titulos[n - 1].a2,
      descripcion: "Práctica de verificación y ejercicio científico.",
      tipo: tiposA2[n - 1],
      progresion_id: p.id,
      xp: 15,
      estado: "publicada",
      contenido: contenidosA2[n - 1],
    });
    a2ok ? ok++ : fail++;

    const a3ok = await upsertActividad(sb, {
      codigo: `${base}-A3`,
      titulo: titulos[n - 1].a3,
      descripcion: "Aplicación crítica y cierre del propósito formativo.",
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ CNEYT-II: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

const titulos = [
  { a1: "Formas de energía en el mundo cotidiano", a2: "¿Qué tipo de energía es cada caso?", a3: "Reflexión: la energía que me rodea" },
  { a1: "Transformación y conservación de la energía", a2: "¿Verdadero o falso? Principio de conservación", a3: "Reflexión: eficiencia energética en casa" },
  { a1: "Introducción a la termodinámica: leyes y aplicaciones", a2: "Simulación: refrigeración y motores de calor", a3: "Reflexión: entropía en la vida cotidiana" },
  { a1: "Calor, temperatura y mecanismos de transferencia", a2: "Completa los conceptos: calor y temperatura", a3: "Autoevaluación: calor y temperatura" },
  { a1: "Trabajo y potencia mecánica: fórmulas y contexto real", a2: "Ejercicio: calcula trabajo y potencia", a3: "Reflexión: el trabajo invisible de las máquinas" },
  { a1: "Consumo energético e impacto ambiental", a2: "¿Qué sabemos sobre la huella de carbono?", a3: "Debate: ¿Quién es responsable del cambio climático?" },
  { a1: "Fuentes de energía renovable y no renovable en México", a2: "¿Verdadero o falso? Energía en México", a3: "Reflexión: el futuro energético de México" },
  { a1: "Glosario científico: diseño de investigaciones", a2: "Simulación: diseña tu investigación sobre energía", a3: "Autoevaluación: mis habilidades de investigación científica" },
];

const tiposA1 = ["lectura", "video_con_preguntas", "lectura", "infografia", "lectura", "video_con_preguntas", "infografia", "glosario_interactivo"] as const;
const tiposA2 = ["quiz_multiple_opcion", "quiz_verdadero_falso", "simulacion", "fill_blanks", "ejercicio_matematico", "quiz_multiple_opcion", "quiz_verdadero_falso", "simulacion"] as const;
const tiposA3 = ["reflexion_escrita", "reflexion_escrita", "reflexion_escrita", "autoevaluacion", "reflexion_escrita", "debate_estructurado", "reflexion_escrita", "autoevaluacion"] as const;

// ── A1 ──────────────────────────────────────────────────────────────────────────
const contenidosA1 = [
  { // P01 — lectura (Formas de energía)
    texto: `La energía es la capacidad de producir cambios o de realizar trabajo. No podemos crearla ni destruirla, pero sí transformarla de una forma a otra. Este principio se llama conservación de la energía y es uno de los más fundamentales de la física.\n\nEn la naturaleza encontramos distintas formas de energía. La energía cinética es la energía del movimiento: un carro en marcha, una pelota cayendo, el viento que sopla. Depende de la masa y la velocidad del objeto (Ec = ½mv²). La energía potencial es la energía almacenada en función de la posición: un libro en un estante tiene energía potencial gravitacional que se libera al caer (Ep = mgh).\n\nLa energía térmica está relacionada con el movimiento de los átomos y moléculas que forman la materia: cuanto más rápido se mueven, mayor es la temperatura. La energía luminosa (o radiante) es transportada por ondas electromagnéticas, como la luz del Sol. Finalmente, la energía eléctrica es el resultado del movimiento de cargas eléctricas a través de un conductor.\n\nEn la vida cotidiana, los transformadores de energía son omnipresentes. Una planta hidroeléctrica convierte energía potencial del agua en energía cinética (la turbina) y luego en energía eléctrica (el generador). Una planta solar fotovoltaica convierte energía luminosa en energía eléctrica. Nuestro cuerpo convierte energía química (los alimentos) en energía mecánica (el movimiento) y energía térmica (el calor corporal).`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-II",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 10,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la diferencia entre energía cinética y energía potencial?", respuesta_guia: "La cinética es energía de movimiento; la potencial es energía almacenada por posición (gravitacional, elástica, etc.)." },
      { pregunta: "¿Qué es la energía térmica?", respuesta_guia: "La energía relacionada con el movimiento de los átomos y moléculas que forman la materia; mayor movimiento = mayor temperatura." },
      { pregunta: "¿Qué transformaciones energéticas ocurren en una planta hidroeléctrica?", respuesta_guia: "Energía potencial del agua → energía cinética (turbina) → energía eléctrica (generador)." },
    ],
  },
  { // P02 — video_con_preguntas (Transformación y conservación de la energía)
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "El principio de conservación de la energía: transformaciones y eficiencia",
    descripcion_video: "Explica el principio de conservación de la energía con ejemplos cotidianos y tecnológicos: paneles solares, generadores, motores de combustión, baterías. Muestra diagramas de flujo energético y el concepto de eficiencia (energía útil / energía total).",
    duracion_segundos: 480,
    subtitulos_disponibles: true,
    preguntas: [
      { tiempo_segundos: 100, pregunta: "¿Qué dice exactamente el principio de conservación de la energía?", tipo: "abierta" as const },
      { tiempo_segundos: 270, pregunta: "¿Por qué ninguna máquina es 100% eficiente? ¿Qué pasa con la energía que se 'pierde'?", tipo: "abierta" as const },
      { tiempo_segundos: 420, pregunta: "Describe una cadena de transformaciones energéticas que ocurra en tu casa o escuela.", tipo: "abierta" as const },
    ],
  },
  { // P03 — lectura (Termodinámica básica)
    texto: `La termodinámica es la rama de la física que estudia las relaciones entre calor, trabajo y temperatura en sistemas que intercambian energía. Sus leyes fundamentales describen límites y posibilidades del universo físico.\n\nLa primera ley de la termodinámica es la ley de conservación de la energía aplicada a procesos térmicos: la energía total de un sistema cerrado se conserva. Si un sistema absorbe calor (Q) y realiza trabajo (W), la variación de su energía interna (ΔU) es: ΔU = Q - W. Esto explica por qué los motores necesitan combustible: la energía interna debe reponerse constantemente.\n\nLa segunda ley introduce el concepto de entropía (S): la tendencia natural de los sistemas a la desorganización. En cualquier proceso real, la entropía del universo siempre aumenta. Esto explica por qué el calor fluye espontáneamente del cuerpo caliente al frío (y nunca al revés), por qué los motores no pueden ser 100% eficientes, y por qué los procesos naturales son irreversibles.\n\nLas aplicaciones prácticas son enormes. Los refrigeradores funcionan usando trabajo eléctrico para transferir calor del interior frío al exterior caliente (contra el flujo espontáneo). Los motores de combustión interna convierten energía química en calor y parte de ese calor en trabajo mecánico. Los sistemas biológicos mantienen su organización interna (baja entropía) consumiendo energía continuamente.`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-II",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 11,
    preguntas_comprension: [
      { pregunta: "¿Qué establece la primera ley de la termodinámica?", respuesta_guia: "Que la energía se conserva: la variación de energía interna de un sistema es igual al calor absorbido menos el trabajo realizado (ΔU = Q - W)." },
      { pregunta: "¿Qué es la entropía y qué tendencia describe?", respuesta_guia: "La entropía es una medida del desorden de un sistema; la segunda ley dice que en procesos reales, la entropía total del universo siempre aumenta." },
      { pregunta: "¿Por qué un refrigerador necesita electricidad para funcionar?", respuesta_guia: "Porque transferir calor del frío al caliente va contra el flujo espontáneo; se necesita trabajo (energía eléctrica) para lograrlo." },
    ],
  },
  { // P04 — infografia (Calor y temperatura)
    titulo: "Calor y temperatura: no son lo mismo",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía comparativa entre calor y temperatura, con sus definiciones, unidades de medida y los tres mecanismos de transferencia de calor: conducción, convección y radiación, con ejemplos cotidianos de cada uno.",
    puntos_clave: [
      "Temperatura: medida del movimiento promedio de las partículas de un cuerpo. Unidades: Kelvin (K), Celsius (°C), Fahrenheit (°F). Relación: K = °C + 273.15",
      "Calor: energía en tránsito que fluye de un cuerpo más caliente a uno más frío. Unidad: Joule (J) o caloría (1 cal = 4.18 J).",
      "Conducción: transferencia de calor por contacto directo entre partículas. Ejemplo: el mango metálico de una sartén caliente.",
      "Convección: transferencia de calor por movimiento de fluidos (líquidos o gases). Ejemplo: el agua hirviendo sube caliente y baja fría; el calentador de cuarto calienta el aire.",
      "Radiación: transferencia de calor por ondas electromagnéticas, sin necesidad de medio material. Ejemplo: el calor del Sol llega a la Tierra a través del vacío.",
      "Aplicaciones: el aislamiento térmico (paredes, ropa de invierno) reduce la conducción; las corrientes de convección determinan el clima; la radiación solar es la fuente energética de la vida.",
    ],
    fuente: "Material CEN Bachillerato — CNEYT-II",
    actividad_post: "Identifica en tu hogar un ejemplo de cada mecanismo de transferencia de calor (conducción, convección, radiación). Escribe cómo reconociste cada uno.",
  },
  { // P05 — lectura (Trabajo y potencia mecánica)
    texto: `En física, el trabajo mecánico tiene un significado preciso que difiere del cotidiano. Trabajo (W) es la transferencia de energía que ocurre cuando una fuerza desplaza un objeto en la dirección de esa fuerza. La fórmula es:\n\nW = F × d × cos θ\n\ndonde F es la magnitud de la fuerza (en Newtons), d es el desplazamiento (en metros) y θ es el ángulo entre la fuerza y el desplazamiento. La unidad de trabajo es el Joule (J): 1 J = 1 N·m.\n\nSi empujas una caja con 20 N a lo largo de 3 metros en la misma dirección de la fuerza (θ = 0°, cos 0° = 1), el trabajo realizado es 60 J. Si la fuerza es perpendicular al desplazamiento (θ = 90°, cos 90° = 0), el trabajo es cero (no hay transferencia de energía en la dirección del movimiento).\n\nLa potencia (P) mide qué tan rápido se realiza trabajo. Es el trabajo realizado por unidad de tiempo:\n\nP = W / t\n\nLa unidad es el Watt (W): 1 W = 1 J/s. Un motor que realiza 600 J en 3 segundos tiene una potencia de 200 W. Los caballos de fuerza (hp) son otra unidad: 1 hp ≈ 746 W.\n\nEstas fórmulas permiten comparar máquinas: un motor de 2000 W hace el mismo trabajo que uno de 1000 W, pero en la mitad del tiempo. En la vida cotidiana, las bombillas, electrodomésticos y motores se etiquetan en Watts porque indica cuánta energía consumen o producen por segundo.`,
    fuente: "Material elaborado para CEN Bachillerato — CNEYT-II",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 10,
    preguntas_comprension: [
      { pregunta: "¿Por qué cargar una mochila sin caminar no realiza trabajo mecánico?", respuesta_guia: "Porque no hay desplazamiento; si no hay desplazamiento (d = 0), el trabajo W = F × 0 × cos θ = 0." },
      { pregunta: "¿Qué diferencia existe entre trabajo y potencia?", respuesta_guia: "El trabajo es la energía transferida; la potencia es la tasa de transferencia de esa energía (trabajo por unidad de tiempo)." },
      { pregunta: "Si un motor de 500 W trabaja durante 10 segundos, ¿cuántos Joules de trabajo realiza?", respuesta_guia: "W = P × t = 500 W × 10 s = 5000 J." },
    ],
  },
  { // P06 — video_con_preguntas (Consumo energético e impacto ambiental)
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Huella de carbono, combustibles fósiles y la transición energética",
    descripcion_video: "Analiza la relación entre consumo de energía, emisiones de CO₂ y cambio climático. Explica qué es la huella de carbono, cómo se calcula, y presenta alternativas: eficiencia energética, energías renovables y políticas de transición energética en México y el mundo.",
    duracion_segundos: 500,
    subtitulos_disponibles: true,
    preguntas: [
      { tiempo_segundos: 100, pregunta: "¿Qué es la huella de carbono y cómo se relaciona con el consumo de energía?", tipo: "abierta" as const },
      { tiempo_segundos: 300, pregunta: "¿Por qué la quema de combustibles fósiles contribuye al calentamiento global?", tipo: "abierta" as const },
      { tiempo_segundos: 450, pregunta: "Menciona dos acciones concretas que puedes hacer tú como estudiante para reducir tu huella de carbono.", tipo: "abierta" as const },
    ],
  },
  { // P07 — infografia (Fuentes de energía en México)
    titulo: "El mapa energético de México: renovables vs. no renovables",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Mapa e infografía del potencial y uso de fuentes de energía renovable y no renovable en México, con datos de generación eléctrica, regiones de mayor potencial (solar en el norte, eólico en Oaxaca y Veracruz, geotérmico en Michoacán y Jalisco, hidroeléctrico en el sur) y la participación del petróleo y gas natural.",
    puntos_clave: [
      "No renovables (México): petróleo (Campeche, Tabasco, Veracruz), gas natural, carbón mineral. Representan ~80% de la generación eléctrica nacional.",
      "Renovables en México: hidroeléctrica (~10% de la electricidad nacional; Chiapas, Guerrero), eólica (~7%; Oaxaca es el mayor corredor eólico), solar (<4% pero con mayor crecimiento).",
      "Potencial solar: México recibe entre 4.4 y 6.3 kWh/m²/día. El norte (Sonora, Chihuahua, Baja California) tiene el mayor potencial solar del mundo.",
      "Geotermia: México es el 5º productor mundial de energía geotérmica; principales campos en Los Humeros (Puebla) y Cerro Prieto (Baja California).",
      "Reto: transición energética hacia fuentes limpias para cumplir compromisos del Acuerdo de París (reducir emisiones 22-36% para 2030).",
      "Debate nacional: tensión entre expansión de energías renovables y soberanía energética basada en Pemex y CFE.",
    ],
    fuente: "Material CEN Bachillerato — CNEYT-II. Datos: SENER, CRE, IRENA 2024.",
    actividad_post: "¿Cuál fuente de energía renovable crees que México debería priorizar y por qué? Escribe dos oraciones con tu argumento basado en los datos de la infografía.",
  },
  { // P08 — glosario_interactivo (Diseño de investigaciones científicas)
    terminos: [
      { termino: "Pregunta de investigación", definicion: "Interrogante específica, medible y delimitada que orienta todo el proceso científico.", ejemplo: "¿Cómo afecta la temperatura del agua a la velocidad de disolución del azúcar?", etiquetas: ["método científico", "investigación"] },
      { termino: "Hipótesis", definicion: "Explicación provisional y comprobable que responde a la pregunta de investigación antes de obtener datos.", ejemplo: "Si se aumenta la temperatura del agua, el azúcar se disuelve más rápido porque las moléculas tienen más energía cinética.", etiquetas: ["método científico", "predicción"] },
      { termino: "Variable independiente", definicion: "Factor que el investigador manipula o controla deliberadamente para observar su efecto.", ejemplo: "En el experimento del azúcar, la temperatura del agua es la variable independiente.", etiquetas: ["experimentación", "variables"] },
      { termino: "Variable dependiente", definicion: "Factor que se mide u observa para detectar el efecto de la variable independiente.", ejemplo: "El tiempo que tarda el azúcar en disolverse es la variable dependiente.", etiquetas: ["experimentación", "medición"] },
      { termino: "Variables controladas", definicion: "Factores que se mantienen constantes durante el experimento para que no interfieran con los resultados.", ejemplo: "La cantidad de azúcar, el tipo de azúcar y el volumen de agua se mantienen iguales en cada prueba.", etiquetas: ["control experimental", "variables"] },
      { termino: "Metodología", definicion: "Descripción detallada y reproducible del procedimiento, materiales y técnicas usadas en la investigación.", ejemplo: "Calentar 100 mL de agua a 25°C, 50°C y 75°C; agregar 5 g de azúcar y medir el tiempo de disolución con cronómetro.", etiquetas: ["procedimiento", "reproducibilidad"] },
      { termino: "Datos cuantitativos", definicion: "Datos expresados en números y unidades que permiten comparaciones precisas y análisis estadístico.", ejemplo: "Temperatura: 25°C, 50°C, 75°C; Tiempo de disolución: 120 s, 85 s, 40 s.", etiquetas: ["datos", "medición", "estadística"] },
      { termino: "Datos cualitativos", definicion: "Datos descriptivos no numéricos que aportan contexto o características observadas.", ejemplo: "El agua a mayor temperatura producía más vapor visible; la disolución a baja temperatura era más lenta y gradual.", etiquetas: ["datos", "observación"] },
      { termino: "Conclusión científica", definicion: "Interpretación basada en datos que responde la pregunta de investigación y confirma, rechaza o modifica la hipótesis.", ejemplo: "Los datos confirman que a mayor temperatura del agua, menor es el tiempo de disolución del azúcar, lo que apoya la hipótesis.", etiquetas: ["interpretación", "resultados"] },
      { termino: "Reproducibilidad", definicion: "Capacidad de obtener resultados similares al repetir el experimento en condiciones iguales; criterio básico de validez científica.", ejemplo: "Si otro laboratorio repite el experimento con los mismos parámetros y obtiene resultados similares, los resultados son reproducibles.", etiquetas: ["validez", "ciencia"] },
    ],
    actividad_final: "Diseña en tres oraciones una investigación simple sobre un fenómeno energético que puedas observar en tu entorno: define la pregunta, enuncia una hipótesis e identifica las variables (independiente, dependiente y controladas).",
  },
];

// ── A2 ──────────────────────────────────────────────────────────────────────────
const contenidosA2 = [
  { // P01 — quiz_multiple_opcion (Formas de energía)
    preguntas: [
      { enunciado: "Un automóvil en movimiento tiene principalmente:", opciones: ["Energía potencial gravitacional", "Energía cinética", "Energía luminosa", "Energía química almacenada"], respuesta_correcta: 1, retroalimentacion: "La energía cinética es la energía del movimiento; depende de la masa y la velocidad: Ec = ½mv²." },
      { enunciado: "Una presa hidroeléctrica almacena principalmente energía:", opciones: ["Cinética", "Eléctrica", "Potencial gravitacional", "Térmica"], respuesta_correcta: 2, retroalimentacion: "El agua retenida en la presa tiene energía potencial gravitacional que se libera al caer y mover las turbinas." },
      { enunciado: "¿Qué transformación energética ocurre en una bombilla eléctrica incandescente?", opciones: ["Energía química → energía eléctrica", "Energía eléctrica → energía luminosa y energía térmica", "Energía cinética → energía eléctrica", "Energía solar → energía eléctrica"], respuesta_correcta: 1, retroalimentacion: "La bombilla incandescente convierte energía eléctrica principalmente en calor (~95%) y luz (~5%)." },
      { enunciado: "La energía química almacenada en los alimentos se convierte en nuestro cuerpo en:", opciones: ["Solo energía eléctrica", "Energía mecánica (movimiento) y energía térmica (calor corporal)", "Solo energía luminosa", "Energía potencial gravitacional únicamente"], respuesta_correcta: 1, retroalimentacion: "El metabolismo convierte la energía química de los alimentos en energía mecánica para moverse y calor para mantener la temperatura corporal." },
      { enunciado: "¿Cuál es la unidad de energía en el Sistema Internacional?", opciones: ["Watt (W)", "Newton (N)", "Joule (J)", "Caloria (cal)"], respuesta_correcta: 2, retroalimentacion: "El Joule (J) es la unidad de energía y trabajo en el SI. El Watt es la unidad de potencia (J/s)." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P02 — quiz_verdadero_falso (Conservación de la energía)
    preguntas: [
      { enunciado: "La energía puede crearse a partir de la nada si la temperatura es suficientemente alta.", respuesta: false, retroalimentacion: "El principio de conservación de la energía establece que la energía total se conserva: no se crea ni se destruye, solo se transforma." },
      { enunciado: "En un péndulo ideal (sin fricción), la suma de energía cinética y potencial se mantiene constante.", respuesta: true, retroalimentacion: "Correcto. En un sistema conservativo sin fricción, la energía mecánica total (Ec + Ep) se conserva en todo momento." },
      { enunciado: "Una máquina de eficiencia del 100% es teóricamente posible si se diseña con suficiente tecnología.", respuesta: false, retroalimentacion: "La segunda ley de la termodinámica prohíbe las máquinas de eficiencia 100%: siempre hay pérdida de energía útil por entropía." },
      { enunciado: "Los paneles solares fotovoltaicos convierten energía luminosa en energía eléctrica.", respuesta: true, retroalimentacion: "Correcto. El efecto fotovoltaico convierte fotones de luz en corriente eléctrica mediante células semiconductoras de silicio." },
      { enunciado: "La energía que se 'pierde' por calor en un motor es literalmente destruida.", respuesta: false, retroalimentacion: "No se destruye: se transforma en energía térmica de baja calidad que se disipa en el ambiente, aumentando la entropía." },
      { enunciado: "La eficiencia de un sistema se puede calcular como: eficiencia = (energía útil / energía total entrada) × 100%.", respuesta: true, retroalimentacion: "Correcto. Esta es la definición de eficiencia energética; cuanto más se acerca al 100%, menos energía se 'desperdicia'." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P03 — simulacion (Termodinámica)
    tipo_simulacion: "laboratorio" as const,
    descripcion: "Simulación de un ciclo termodinámico: un refrigerador doméstico que transfiere calor del interior frío al exterior caliente consumiendo trabajo eléctrico. Explora cómo cambian la temperatura interna, el calor transferido y el coeficiente de rendimiento (COP) al modificar parámetros.",
    url_simulacion: "",
    instrucciones: [
      "Abre la simulación del refrigerador termodinámico.",
      "Ajusta la temperatura deseada del interior (entre 0°C y 10°C) y observa el consumo eléctrico.",
      "Registra los valores de calor absorbido del interior (Q_frío) y calor liberado al exterior (Q_caliente).",
      "Calcula el coeficiente de rendimiento: COP = Q_frío / W (trabajo eléctrico consumido).",
      "Modifica la temperatura exterior (+5°C, +10°C) y observa cómo afecta el consumo eléctrico y el COP.",
    ],
    variables_a_explorar: ["Temperatura interior del refrigerador", "Temperatura exterior (ambiente)", "Trabajo eléctrico consumido (W)", "Calor absorbido del interior (Q_frío)", "Calor liberado al exterior (Q_caliente)", "Coeficiente de rendimiento (COP)"],
    preguntas_reflexion: [
      "¿Por qué el refrigerador necesita energía eléctrica para funcionar si el calor ya quiere fluir?",
      "¿Qué pasa con el COP cuando aumenta la temperatura exterior? ¿Qué implicación tiene esto para el consumo en días de verano?",
      "¿Cuál de las dos leyes de la termodinámica (1ª o 2ª) explica mejor el funcionamiento del refrigerador?",
    ],
    reporte_esperado: "Tabla con tres configuraciones diferentes (temperatura interior baja/media/alta) registrando W, Q_frío, Q_caliente y COP. Incluye una conclusión de dos oraciones sobre la relación entre temperatura y eficiencia.",
  },
  { // P04 — fill_blanks (Calor y temperatura)
    instrucciones: "Completa el texto con los términos correctos del banco de palabras: conducción, convección, radiación, Kelvin, temperatura, calor, Joule.",
    texto_con_huecos: `La ___ es una medida del movimiento promedio de las partículas de un cuerpo, y se mide en grados Celsius o en la escala absoluta ___. El ___, en cambio, es energía en tránsito que fluye de un cuerpo más caliente a uno más frío; su unidad en el Sistema Internacional es el ___.\n\nExisten tres mecanismos de transferencia de calor. En la ___, el calor se transfiere por contacto directo entre las partículas de un material (ejemplo: una sartén caliente). En la ___, el calor se transfiere mediante el movimiento de fluidos líquidos o gaseosos (ejemplo: el agua hirviendo). Finalmente, en la ___, el calor viaja en forma de ondas electromagnéticas y no requiere un medio material (ejemplo: la energía del Sol).`,
    huecos: [
      { posicion: 0, respuesta_correcta: "temperatura", pista: "Medida del movimiento molecular promedio" },
      { posicion: 1, respuesta_correcta: "Kelvin", alternativas_aceptadas: ["kelvin", "K"], pista: "Escala de temperatura absoluta (0 K = -273.15°C)" },
      { posicion: 2, respuesta_correcta: "calor", pista: "Energía en tránsito de cuerpos calientes a fríos" },
      { posicion: 3, respuesta_correcta: "Joule", alternativas_aceptadas: ["joule", "J"], pista: "Unidad de energía del Sistema Internacional" },
      { posicion: 4, respuesta_correcta: "conducción", pista: "Contacto directo entre partículas (sartén caliente)" },
      { posicion: 5, respuesta_correcta: "convección", pista: "Movimiento de fluidos líquidos o gaseosos" },
      { posicion: 6, respuesta_correcta: "radiación", pista: "Ondas electromagnéticas; no necesita medio material" },
    ],
    distingue_mayusculas: false,
  },
  { // P05 — ejercicio_matematico (Trabajo y potencia)
    instrucciones: "Resuelve los siguientes problemas de trabajo y potencia mecánica. Muestra tu procedimiento paso a paso.",
    problema: "Una persona aplica una fuerza horizontal de 80 N para empujar una caja a lo largo de 5 metros sobre una superficie plana (el ángulo entre la fuerza y el desplazamiento es 0°). Posteriormente, un motor realiza el mismo trabajo (400 J) en tan solo 2 segundos.\n\n(a) ¿Cuánto trabajo realiza la persona? (b) ¿Cuánta potencia desarrolla el motor?",
    contexto: "Trabajo mecánico: W = F × d × cos θ | Potencia: P = W / t",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "Parte (a): Identifica F = 80 N, d = 5 m, θ = 0° → cos(0°) = 1",
      "Aplica W = F × d × cos θ = 80 × 5 × 1 = 400 J",
      "Parte (b): Identifica W = 400 J, t = 2 s",
      "Aplica P = W / t = 400 J / 2 s = 200 W",
    ],
    respuesta_final: "(a) W = 400 J | (b) P = 200 W",
    unidades: "Joules (J) para trabajo; Watts (W) para potencia",
    tolerancia_error: 0,
  },
  { // P06 — quiz_multiple_opcion (Consumo e impacto ambiental)
    preguntas: [
      { enunciado: "¿Qué es la huella de carbono?", opciones: ["La sombra que proyecta un árbol de carbono", "La cantidad total de emisiones de gases de efecto invernadero generadas por una actividad, persona u organización", "El carbono que queda en el suelo después de un incendio", "La medida del carbono en los combustibles fósiles"], respuesta_correcta: 1, retroalimentacion: "La huella de carbono cuantifica las emisiones de CO₂ y otros GEI equivalentes generados por una actividad; se expresa en toneladas de CO₂ equivalente." },
      { enunciado: "¿Por qué la quema de combustibles fósiles aumenta el efecto invernadero?", opciones: ["Porque consume el oxígeno del aire", "Porque libera CO₂ y otros gases atrapados durante millones de años que aumentan la concentración atmosférica de GEI", "Porque produce partículas que bloquean la luz solar", "Porque calienta el agua de los océanos directamente"], respuesta_correcta: 1, retroalimentacion: "Los combustibles fósiles contienen carbono fijado hace millones de años; quemarlos libera ese carbono como CO₂, elevando su concentración y amplificando el efecto invernadero." },
      { enunciado: "¿Cuál de estas acciones reduce más la huella de carbono de una persona en México?", opciones: ["Cambiar el color de paredes de casa", "Reducir el consumo de carne roja y usar transporte público o bicicleta", "Comprar ropa nueva de marcas sustentables", "Usar bolsas de tela en lugar de plástico ocasionalmente"], respuesta_correcta: 1, retroalimentacion: "La dieta y el transporte son los factores de mayor impacto en la huella de carbono individual; reducir el consumo de carne y usar transporte limpio tiene mayor efecto." },
      { enunciado: "La eficiencia energética consiste en:", opciones: ["Usar más energía para producir más bienes", "Obtener el mismo resultado (o mejor) con menor cantidad de energía", "Reemplazar toda la energía fósil por renovable inmediatamente", "Reducir el consumo de energía eléctrica al mínimo posible"], respuesta_correcta: 1, retroalimentacion: "La eficiencia energética busca producir los mismos servicios con menos energía, reduciendo costos y emisiones sin sacrificar bienestar." },
      { enunciado: "¿Qué es la 'transición energética'?", opciones: ["El proceso de reparar líneas eléctricas dañadas", "El cambio gradual de un sistema energético basado en combustibles fósiles a uno predominantemente renovable y limpio", "La reducción del consumo energético a niveles del siglo XIX", "El traslado de plantas generadoras de una ciudad a otra"], respuesta_correcta: 1, retroalimentacion: "La transición energética es el cambio sistémico hacia fuentes renovables, mayor eficiencia y descarbonización de la economía." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P07 — quiz_verdadero_falso (Fuentes de energía en México)
    preguntas: [
      { enunciado: "México tiene uno de los mayores potenciales solares del mundo, especialmente en el norte del país.", respuesta: true, retroalimentacion: "Correcto. Sonora, Chihuahua y Baja California reciben entre 5.5 y 6.3 kWh/m²/día, nivel de irradiación entre los más altos del planeta." },
      { enunciado: "La energía geotérmica solo se puede generar en países con volcanes activos como Islandia y no en México.", respuesta: false, retroalimentacion: "México es el 5º productor mundial de energía geotérmica; los campos de Los Humeros (Puebla) y Cerro Prieto (Baja California) son relevantes a nivel mundial." },
      { enunciado: "Las fuentes de energía renovable no emiten ningún tipo de gases de efecto invernadero en todo su ciclo de vida.", respuesta: false, retroalimentacion: "Las renovables emiten mucho menos GEI que los combustibles fósiles, pero no son cero en todo el ciclo de vida (fabricación, instalación, mantenimiento de paneles, turbinas, etc.)." },
      { enunciado: "El corredor eólico de Oaxaca es el principal en México por generación de energía eólica.", respuesta: true, retroalimentacion: "Correcto. El Istmo de Tehuantepec en Oaxaca tiene vientos constantes que lo hacen el mayor productor de energía eólica del país." },
      { enunciado: "México ha cumplido ya el 100% de su generación eléctrica con fuentes renovables.", respuesta: false, retroalimentacion: "México aún genera aproximadamente el 80% de su electricidad con combustibles fósiles; las renovables representan alrededor del 20% aunque van en aumento." },
      { enunciado: "La energía hidroeléctrica es una fuente renovable pero puede tener impactos ambientales negativos como inundación de ecosistemas.", respuesta: true, retroalimentacion: "Correcto. Las grandes represas son renovables pero pueden inundar valles, desplazar comunidades y alterar ecosistemas acuáticos." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P08 — simulacion (Diseño de investigaciones)
    tipo_simulacion: "laboratorio" as const,
    descripcion: "Simulación interactiva de diseño de investigación científica sobre un fenómeno energético. El estudiante elige un fenómeno (conducción térmica, eficiencia de un panel solar o consumo energético de electrodomésticos), formula su pregunta e hipótesis, diseña el experimento definiendo variables, y analiza datos simulados para llegar a conclusiones.",
    url_simulacion: "",
    instrucciones: [
      "Selecciona uno de los tres fenómenos energéticos disponibles en la simulación.",
      "Formula tu pregunta de investigación siguiendo el patrón: '¿Cómo afecta [variable independiente] a [variable dependiente]?'",
      "Escribe tu hipótesis antes de iniciar: enuncia lo que esperas encontrar y por qué.",
      "Configura el experimento: define variable independiente, variable dependiente y variables controladas.",
      "Ejecuta las pruebas (mínimo 3 niveles de la variable independiente) y registra los datos en la tabla.",
      "Analiza los resultados: ¿confirman o refutan tu hipótesis? ¿Por qué?",
    ],
    variables_a_explorar: ["Variable independiente (factor que modificas)", "Variable dependiente (factor que mides)", "Variables controladas (factores que mantienes constantes)", "Número de repeticiones de cada prueba", "Unidades de medición de cada variable"],
    preguntas_reflexion: [
      "¿Tu hipótesis fue confirmada por los datos? Si no, ¿qué te dice eso sobre el método científico?",
      "¿Qué haría más confiables tus resultados? (Piensa en repeticiones, precisión de los instrumentos, variables controladas).",
      "¿Cómo conecta tu investigación con alguno de los propósitos formativos de CNEYT-II que ya estudiaste?",
    ],
    reporte_esperado: "Informe breve con: pregunta de investigación, hipótesis, diseño experimental (tabla de variables), datos obtenidos y conclusión basada en los datos.",
  },
];

// ── A3 ──────────────────────────────────────────────────────────────────────────
const contenidosA3 = [
  { // P01 — reflexion_escrita (Energía en mi entorno)
    prompt: "Observa tu entorno durante un día: tu hogar, el camino a la escuela, la escuela misma. Identifica al menos cinco transformaciones de energía que puedas ver o sentir (no solo electricidad: también movimiento, calor, luz, sonido, alimentos).\n\nEscribe: ¿qué formas de energía hay en cada caso?, ¿de qué forma de energía provienen y en qué se transforman? ¿Hay alguna transformación que antes nunca habías pensado como energía?",
    pistas: ["El desayuno que comes es una transformación de energía química.", "El sonido de un motor o bocina es energía mecánica transformada en energía sonora.", "La sombra de un árbol te está protegiendo de la radiación solar, que es energía electromagnética."],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Identifica al menos cinco transformaciones energéticas concretas y cotidianas", "Nombra correctamente las formas de energía involucradas en cada caso", "Reflexiona sobre alguna transformación que no había considerado antes", "Usa correctamente el vocabulario científico del propósito (cinética, potencial, térmica, etc.)"],
    formato_esperado: "libre" as const,
  },
  { // P02 — reflexion_escrita (Eficiencia energética en casa)
    prompt: "El principio de conservación de la energía dice que la energía no se pierde, solo se transforma. Sin embargo, en la práctica decimos que algunas máquinas 'desperdician' energía.\n\nElige tres aparatos de tu hogar (ej: foco, ventilador, refrigerador, computadora, estufa). Para cada uno: describe qué transformación energética realiza, qué parte de la energía es 'útil' (para qué sirve) y qué parte se 'desperdicia' (¿en qué se convierte?). ¿Qué podrías hacer para reducir ese desperdicio?",
    pistas: ["Un foco incandescente convierte ~5% de la energía en luz y ~95% en calor (¡desperdicio enorme!).", "La eficiencia de un aparato dice qué porcentaje de la energía entrada se convierte en energía útil.", "No confundas apagar aparatos (reduce consumo) con mejorar eficiencia (hace más con lo mismo)."],
    longitud_minima_palabras: 110,
    longitud_maxima_palabras: 380,
    criterios_evaluacion: ["Analiza correctamente tres aparatos del hogar", "Distingue entre energía útil y energía 'desperdiciada' en cada caso", "Propone acciones concretas para mejorar la eficiencia", "Conecta el análisis con el principio de conservación de la energía"],
    formato_esperado: "libre" as const,
  },
  { // P03 — reflexion_escrita (Entropía en la vida cotidiana)
    prompt: "La segunda ley de la termodinámica dice que la entropía (el desorden) del universo siempre aumenta en los procesos reales. Aunque suena abstracto, la entropía está en todas partes.\n\nElige dos ejemplos cotidianos donde puedas 'ver' la entropía aumentar (el desorden natural de las cosas). Explica qué es lo que aumenta su desorden y por qué no se revierte espontáneamente. Luego reflexiona: ¿cómo combatimos el aumento de entropía en la vida (en el hogar, en los organismos vivos, en las ciudades)? ¿Qué se necesita siempre para hacerlo?",
    pistas: ["Cuando se derrama azúcar en el piso, ¿se vuelve a jundar sola? ¿Por qué?", "Un cuarto en desorden, una mezcla de gases, el calor que se disipa... son ejemplos de entropía.", "Para reducir el desorden de un sistema siempre se necesita energía: eso mismo hace tu cuerpo, tu casa y tus células."],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 380,
    criterios_evaluacion: ["Identifica dos ejemplos cotidianos reales de aumento de entropía", "Explica por qué no se revierten espontáneamente", "Reflexiona sobre la relación entre orden/organización y consumo de energía", "Usa el término 'entropía' correctamente y en contexto"],
    formato_esperado: "libre" as const,
  },
  { // P04 — autoevaluacion (Calor y temperatura)
    instrucciones: "Evalúa honestamente tu comprensión de los conceptos de calor, temperatura y mecanismos de transferencia. Usa esta autoevaluación para identificar qué conceptos dominas y cuáles necesitas reforzar.",
    criterios: [
      {
        descripcion: "Distingo conceptualmente entre calor y temperatura",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Confundo calor con temperatura o los uso como sinónimos." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Sé que son distintos pero a veces los mezclo al explicar fenómenos." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Distingo claramente: temperatura mide movimiento promedio de partículas; calor es energía en tránsito de caliente a frío." },
        ],
      },
      {
        descripcion: "Identifico y explico los tres mecanismos de transferencia de calor",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Solo recuerdo uno o dos mecanismos y no puedo explicarlos con ejemplos." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Recuerdo los tres nombres (conducción, convección, radiación) pero confundo cuándo aplica cada uno." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Identifico los tres mecanismos con exactitud y doy ejemplos cotidianos correctos de cada uno." },
        ],
      },
      {
        descripcion: "Relaciono los mecanismos de transferencia con aplicaciones tecnológicas (aislantes, calefacción, paneles solares)",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No veo la conexión entre la teoría y las aplicaciones del mundo real." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Conozco algunas aplicaciones pero no puedo explicar el mecanismo físico detrás." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Explico con precisión cómo funciona al menos dos tecnologías usando los mecanismos de transferencia de calor." },
        ],
      },
      {
        descripcion: "Manejo las unidades de temperatura (°C, K) y energía (J, cal)",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No recuerdo las unidades ni las conversiones." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Recuerdo las unidades principales pero cometo errores en conversiones (°C ↔ K)." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Manejo con soltura las conversiones: K = °C + 273.15; 1 cal = 4.18 J. Elijo la unidad correcta según el contexto." },
        ],
      },
    ],
    reflexion_final_prompt: "¿En qué criterio tienes menor puntuación? Escribe una estrategia concreta para mejorarlo antes de la siguiente sesión.",
    visible_para_docente: true,
  },
  { // P05 — reflexion_escrita (El trabajo de las máquinas)
    prompt: "Las fórmulas W = F × d × cos θ y P = W / t describen el trabajo mecánico y la potencia. Pero el trabajo físico está en todas partes, no solo en los problemas del libro.\n\nElige una máquina o situación de tu vida cotidiana (una escalera eléctrica, un elevador, un motor de lavadora, tus propias piernas al subir escaleras). Estima o describe (no necesitas datos exactos): ¿qué fuerzas actúan?, ¿qué distancias recorren?, ¿cuánto tiempo toman? Reflexiona: ¿qué harías con la potencia si pudieras medirla? ¿Qué te dice eso sobre la máquina o situación que elegiste?",
    pistas: ["No necesitas números exactos: puedes hacer estimaciones razonables.", "Piensa en qué dirección actúa la fuerza y cuál es la dirección del movimiento (eso determina el ángulo θ).", "La potencia de una lavadora común es de ~500W; la de un elevador de pasajeros puede ser de 5000-15000 W."],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Aplica conceptualmente las fórmulas de trabajo y potencia a una situación real", "Identifica fuerza, desplazamiento y tiempo aunque sea de forma estimada", "Reflexiona sobre el significado físico de los resultados", "Muestra comprensión de las unidades (J, W)"],
    formato_esperado: "libre" as const,
  },
  { // P06 — debate_estructurado (Responsabilidad climática)
    tema: "¿Quiénes son los principales responsables del cambio climático y quiénes deben liderar la solución?",
    posturas: ["Las grandes corporaciones y los países industrializados son los responsables principales y deben actuar primero", "La responsabilidad es individual y compartida: cada persona debe cambiar sus hábitos para lograr la transición"],
    argumentos_guia: {
      "Las grandes corporaciones y los países industrializados son los responsables principales y deben actuar primero": [
        "El 71% de las emisiones globales de GEI proviene de solo 100 empresas (investigación de CDP 2017).",
        "Los países del G7 han emitido históricamente mucho más CO₂ per cápita que los países en desarrollo.",
        "Sin regulación a las grandes industrias, los cambios individuales tienen impacto marginal.",
        "Los países ricos tienen los recursos para liderar la transición energética; los países pobres enfrentan la crisis sin haberla causado.",
      ],
      "La responsabilidad es individual y compartida: cada persona debe cambiar sus hábitos para lograr la transición": [
        "La demanda de los consumidores impulsa la producción: si la gente consume menos carne y más renovables, las empresas cambian.",
        "Las acciones individuales suman: millones de personas cambiando hábitos generan presión política y de mercado.",
        "La ciudadanía tiene poder político: votando por políticas climáticas y exigiendo a sus gobiernos.",
        "Esperar solo a las empresas y gobiernos nos hace pasivos ante un problema urgente que nos afecta a todos.",
      ],
    },
    reglas: ["Apoya argumentos con datos concretos (emisiones, países, empresas)", "No desestimes la postura contraria sin argumentar", "Concluye reconociendo lo válido de la otra postura"],
    tiempo_argumentacion_minutos: 5,
    criterios_evaluacion: ["Usa datos o evidencia científica concreta en al menos dos argumentos", "Articula coherentemente la postura asignada", "Reconoce y refuta al menos un argumento de la postura contraria", "Demuestra comprensión del nexo energía-ambiente-sociedad"],
    modalidad: "escrito" as const,
  },
  { // P07 — reflexion_escrita (Futuro energético de México)
    prompt: "Revisaste el mapa energético de México: un país con enorme potencial solar, eólico y geotérmico, pero que aún depende en ~80% de combustibles fósiles.\n\n¿Qué opinas sobre la transición energética en México? ¿Por qué avanza tan lento si el potencial renovable es tan grande? ¿Qué obstáculos ves (económicos, políticos, tecnológicos, culturales)? ¿Cuál sería tu propuesta si tuvieras poder de decisión? Argumenta tu respuesta con al menos dos datos de la infografía que estudiaste.",
    pistas: ["Considera los intereses económicos detrás del petróleo y la CFE.", "Las energías renovables no solo son 'buenas para el ambiente': también generan empleos y pueden bajar el costo de la electricidad.", "Puedes plantear una visión crítica: ¿beneficia la transición a todos los mexicanos por igual?"],
    longitud_minima_palabras: 120,
    longitud_maxima_palabras: 420,
    criterios_evaluacion: ["Menciona al menos dos datos concretos de la infografía", "Identifica obstáculos reales (no solo 'falta de voluntad')", "Propone una alternativa concreta y argumentada", "Muestra pensamiento crítico sobre los intereses en juego"],
    formato_esperado: "ensayo" as const,
  },
  { // P08 — autoevaluacion (Habilidades de investigación científica)
    instrucciones: "Reflexiona sobre lo que aprendiste en la simulación de diseño de investigaciones. Evalúa el desarrollo de tus habilidades científicas con honestidad.",
    criterios: [
      {
        descripcion: "Formula preguntas de investigación específicas, medibles y delimitadas",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Mis preguntas son muy generales o difíciles de responder experimentalmente." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Formulo preguntas específicas, pero a veces no son completamente medibles o son demasiado amplias." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Formulo preguntas concretas, medibles y factibles: sé qué medir y cómo." },
        ],
      },
      {
        descripcion: "Distingo variable independiente, dependiente y controladas en un diseño experimental",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Confundo las variables o no sé cuál modificar y cuál medir." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Identifico la independiente y dependiente pero olvido las variables de control." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Identifico las tres categorías de variables y explico por qué es importante controlar algunas." },
        ],
      },
      {
        descripcion: "Interpreto datos para confirmar o refutar hipótesis",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Describo los datos pero no sé relacionarlos con la hipótesis original." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Relaciono datos con la hipótesis pero mis conclusiones a veces no son completamente precisas." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Analizo los datos y concluyo si la hipótesis se confirma o refuta, explicando por qué con evidencia." },
        ],
      },
      {
        descripcion: "Comunico resultados de forma clara y organizada",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Mi reporte es desordenado o le faltan partes esenciales (pregunta, hipótesis, datos, conclusión)." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Mi reporte incluye las partes principales pero la redacción o la organización pueden mejorar." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Mi reporte es claro, completo y organizado: permite que otra persona reproduzca el experimento." },
        ],
      },
    ],
    reflexion_final_prompt: "¿Qué habilidad de investigación científica quieres seguir desarrollando? Describe una acción concreta que puedas practicar en tu vida cotidiana para ejercitarla.",
    visible_para_docente: true,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
