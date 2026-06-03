/**
 * Refuerzo CNEYT-I (Plantilla CEN): agrega A4-A7 a las 8 progresiones que ya tienen A1-A3
 * (A1=lectura, A2=quiz_multiple_opcion, A3=reflexion_escrita).
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks / ejercicio_matematico · A7 = autoevaluacion
 * Las A6 cuantitativas (ejercicio_matematico) refuerzan el contenido oficial AUGMENTADO:
 *   P06 medición/conversión de unidades · P02 cálculo de densidad · P04 concentración de disoluciones (% masa).
 * Keyed por CÓDIGO (no por numero) para ser robusto tras la renumeración oficial.
 * Todas en estado='borrador'. Uso: npx tsx scripts/seed-activities-cneyti-refuerzo.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Refuerzo = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;
const letras = ["A4", "A5", "A6", "A7"];

const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo argumentarlo." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 Refuerzo CNEYT-I — A4-A7 para las 8 progresiones existentes\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-I");
  let ok = 0; let fail = 0; let skip = 0;

  for (const p of progs) {
    const set = refuerzos[p.codigo];
    if (!set) { skip++; continue; } // progresiones nuevas (P09/P10/P11) se siembran en otro script
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
  log(`\n✅ CNEYT-I refuerzo: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas (nuevas).\n`);
}

// ── REFUERZOS POR CÓDIGO DE PROGRESIÓN ──────────────────────────────────────────
const refuerzos: Record<string, Refuerzo[]> = {
  // ════════ P01 — Ciencia como práctica social (Oficial 1a) ════════
  "CNEYT-I-P01": [
    {
      titulo: "¿Cómo funciona la ciencia? — Verdadero o falso", descripcion: "Distingue ideas correctas e incorrectas sobre la naturaleza de la ciencia.",
      tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La ciencia es un conjunto de verdades absolutas que nunca cambian.", respuesta: false, retroalimentacion: "El conocimiento científico es provisional: se revisa y corrige con nueva evidencia." },
        { enunciado: "El conocimiento científico se construye de forma colectiva mediante debate, replicación y revisión por pares.", respuesta: true, retroalimentacion: "Correcto: por eso es confiable, no por la autoridad de quien lo dice." },
        { enunciado: "Una hipótesis que no puede ponerse a prueba ni ser refutada es científica.", respuesta: false, retroalimentacion: "Para ser científica una hipótesis debe ser falsable: debe poder refutarse." },
        { enunciado: "El financiamiento y los intereses de cada época pueden influir en qué preguntas investiga la ciencia.", respuesta: true, retroalimentacion: "Correcto: la ciencia es una práctica social situada en contextos culturales y económicos." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 },
    },
    {
      titulo: "Glosario — Naturaleza de la ciencia", descripcion: "Conceptos clave sobre la ciencia como práctica social.",
      tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Práctica social", definicion: "Actividad construida por comunidades humanas con sus contextos e intereses.", ejemplo: "La ciencia se hace en universidades, institutos y comunidades.", etiquetas: ["concepto"] },
        { termino: "Falsabilidad", definicion: "Propiedad de una hipótesis que permite ponerla a prueba y refutarla.", ejemplo: "'Todos los metales se dilatan con el calor' es falsable.", etiquetas: ["concepto"] },
        { termino: "Revisión por pares", definicion: "Evaluación de una investigación por otros expertos antes de publicarse.", ejemplo: "Una revista científica envía el artículo a revisores.", etiquetas: ["proceso"] },
        { termino: "Replicación", definicion: "Repetir un experimento para verificar que da los mismos resultados.", ejemplo: "Otro laboratorio repite el estudio y confirma el hallazgo.", etiquetas: ["proceso"] },
        { termino: "Epistemología", definicion: "Rama que estudia cómo se produce y valida el conocimiento.", ejemplo: "Pregunta: ¿qué hace confiable a una afirmación científica?", etiquetas: ["concepto"] },
      ], actividad_final: "Explica con tus palabras por qué la replicación hace más confiable a la ciencia." },
    },
    {
      titulo: "Completa: la ciencia como construcción colectiva", descripcion: "Completa el texto sobre la naturaleza de la ciencia.",
      tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa cada espacio con la palabra correcta.",
        texto_con_huecos: "La ciencia no es un conjunto de verdades absolutas, sino una práctica ___ e histórica. Una hipótesis es científica solo si puede ser ___ por los datos. Para confiar en un resultado, otros científicos deben poder ___ el experimento y obtener lo mismo.",
        huecos: [
          { posicion: 0, respuesta_correcta: "social", alternativas_aceptadas: ["colectiva"], pista: "Se construye entre muchas personas." },
          { posicion: 1, respuesta_correcta: "refutada", alternativas_aceptadas: ["falsada", "puesta a prueba"], pista: "Debe poder demostrarse falsa." },
          { posicion: 2, respuesta_correcta: "replicar", alternativas_aceptadas: ["repetir", "reproducir"], pista: "Volver a hacerlo igual." },
        ], distingue_mayusculas: false },
    },
    {
      titulo: "Autoevaluación — Naturaleza de la ciencia", descripcion: "Valora tu comprensión de la ciencia como práctica social.",
      tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto. No es calificación: es para saber qué reforzar.",
        criterios: [
          { descripcion: "Explico por qué la ciencia no es un conjunto de verdades absolutas.", escala: escala4 },
          { descripcion: "Entiendo qué hace falsable a una hipótesis.", escala: escala4 },
          { descripcion: "Reconozco la replicación y la revisión por pares como mecanismos de confianza.", escala: escala4 },
        ], reflexion_final_prompt: "¿Cómo distingues una afirmación científica de una opinión en redes sociales?" },
    },
  ],

  // ════════ P06 — Método científico + medición (Oficial 1b) ════════
  "CNEYT-I-P06": [
    {
      titulo: "Método científico y medición — Verdadero o falso", descripcion: "Distingue afirmaciones sobre el método científico y la medición.",
      tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La variable independiente es la que el investigador manipula.", respuesta: true, retroalimentacion: "Correcto: la dependiente es la que se mide como resultado." },
        { enunciado: "Toda medición es exacta y no tiene incertidumbre.", respuesta: false, retroalimentacion: "Toda medición tiene incertidumbre asociada al instrumento y al método." },
        { enunciado: "El metro, el kilogramo y el segundo son unidades del Sistema Internacional.", respuesta: true, retroalimentacion: "Correcto: son unidades base del SI." },
        { enunciado: "Las variables de control se dejan cambiar libremente durante el experimento.", respuesta: false, retroalimentacion: "Las variables de control se mantienen constantes para no interferir." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 },
    },
    {
      titulo: "Glosario — Método y medición", descripcion: "Conceptos clave del método científico y la medición.",
      tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Hipótesis", definicion: "Explicación provisional y falsable que se pone a prueba.", ejemplo: "'La planta crece más con más luz'.", etiquetas: ["concepto"] },
        { termino: "Variable independiente", definicion: "La que se manipula a propósito en el experimento.", ejemplo: "La cantidad de luz que recibe la planta.", etiquetas: ["concepto"] },
        { termino: "Variable dependiente", definicion: "La que se mide como resultado.", ejemplo: "La altura que alcanza la planta.", etiquetas: ["concepto"] },
        { termino: "Sistema Internacional (SI)", definicion: "Conjunto estándar de unidades de medida (m, kg, s, K…).", ejemplo: "Medir la masa en kilogramos.", etiquetas: ["medición"] },
        { termino: "Incertidumbre", definicion: "Margen de error inevitable de toda medición.", ejemplo: "Una regla mide ±1 mm.", etiquetas: ["medición"] },
        { termino: "Cifras significativas", definicion: "Dígitos de una medida que aportan información confiable.", ejemplo: "12.3 cm tiene tres cifras significativas.", etiquetas: ["medición"] },
      ], actividad_final: "Da un ejemplo de variable independiente, dependiente y de control para un experimento propio." },
    },
    {
      titulo: "Medición: conversión de unidades", descripcion: "Ejercicio de medición y conversión en el Sistema Internacional.",
      tipo: "ejercicio_matematico", xp: 15,
      contenido: { instrucciones: "Resuelve mostrando el procedimiento.",
        problema: "En un experimento mediste la longitud de una mesa: 1.75 m. Exprésala en centímetros (cm) y en milímetros (mm).",
        contexto: "1 m = 100 cm = 1000 mm. Las conversiones dentro del SI se hacen multiplicando o dividiendo por potencias de 10.",
        tipo_respuesta: "numerica",
        pasos_guia: ["Para pasar de m a cm, multiplica por 100.", "Para pasar de m a mm, multiplica por 1000.", "1.75 × 100 = 175 cm; 1.75 × 1000 = 1750 mm."],
        respuesta_final: "175 cm y 1750 mm", unidades: "cm y mm", tolerancia_error: 0 },
    },
    {
      titulo: "Autoevaluación — Método y medición", descripcion: "Valora tu dominio del método científico y la medición.",
      tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico variable independiente, dependiente y de control.", escala: escala4 },
          { descripcion: "Formulo una hipótesis falsable.", escala: escala4 },
          { descripcion: "Uso unidades del SI y reconozco la incertidumbre de una medición.", escala: escala4 },
        ], reflexion_final_prompt: "¿Qué fenómeno de tu entorno te gustaría investigar y cómo lo medirías?" },
    },
  ],

  // ════════ P02 — Materia, masa, volumen y densidad (Oficial 3) ════════
  "CNEYT-I-P02": [
    {
      titulo: "Materia, masa y densidad — Verdadero o falso", descripcion: "Distingue afirmaciones sobre materia, masa, volumen y densidad.",
      tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La masa es la cantidad de materia de un cuerpo y se mide en kilogramos.", respuesta: true, retroalimentacion: "Correcto: el peso, en cambio, depende de la gravedad." },
        { enunciado: "La densidad se calcula dividiendo la masa entre el volumen (ρ = m/V).", respuesta: true, retroalimentacion: "Correcto: por eso un objeto flota si su densidad es menor que la del líquido." },
        { enunciado: "Masa y peso son exactamente lo mismo.", respuesta: false, retroalimentacion: "La masa es cantidad de materia; el peso es la fuerza de gravedad sobre esa masa." },
        { enunciado: "La densidad es una propiedad que sirve para identificar sustancias.", respuesta: true, retroalimentacion: "Correcto: cada sustancia pura tiene una densidad característica." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 },
    },
    {
      titulo: "Glosario — Materia, masa y densidad", descripcion: "Conceptos clave sobre la materia y sus medidas.",
      tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Materia", definicion: "Todo lo que tiene masa y ocupa un espacio.", ejemplo: "El agua, el aire y las rocas.", etiquetas: ["concepto"] },
        { termino: "Cuerpo", definicion: "Porción limitada de materia con forma propia.", ejemplo: "Una piedra es un cuerpo hecho de materia.", etiquetas: ["concepto"] },
        { termino: "Masa", definicion: "Cantidad de materia de un cuerpo; se mide en kg.", ejemplo: "Una manzana tiene unos 0.15 kg.", etiquetas: ["medición"] },
        { termino: "Peso", definicion: "Fuerza con que la gravedad atrae a un cuerpo.", ejemplo: "El mismo objeto pesa menos en la Luna.", etiquetas: ["concepto"] },
        { termino: "Volumen", definicion: "Espacio que ocupa un cuerpo; se mide en m³ o L.", ejemplo: "Se calcula con geometría o por desplazamiento de agua.", etiquetas: ["medición"] },
        { termino: "Densidad", definicion: "Masa por unidad de volumen (ρ = m/V).", ejemplo: "La del agua es 1 g/cm³; la del oro, 19.3 g/cm³.", etiquetas: ["propiedad"] },
      ], actividad_final: "Explica por qué un barco de acero flota aunque el acero sea más denso que el agua." },
    },
    {
      titulo: "Cálculo de densidad", descripcion: "Ejercicio de cálculo de densidad con la fórmula ρ = m/V.",
      tipo: "ejercicio_matematico", xp: 15,
      contenido: { instrucciones: "Resuelve mostrando el procedimiento y las unidades.",
        problema: "Un objeto metálico tiene una masa de 270 g y un volumen de 100 cm³. Calcula su densidad. Sabiendo que la densidad del aluminio es 2.7 g/cm³, ¿de qué metal podría tratarse?",
        contexto: "Densidad = masa / volumen (ρ = m/V). La densidad es característica de cada sustancia.",
        tipo_respuesta: "numerica",
        pasos_guia: ["Aplica ρ = m / V.", "ρ = 270 g / 100 cm³.", "ρ = 2.7 g/cm³, que coincide con la del aluminio."],
        respuesta_final: "2.7 g/cm³ (aluminio)", unidades: "g/cm³", tolerancia_error: 0.05 },
    },
    {
      titulo: "Autoevaluación — Materia y densidad", descripcion: "Valora tu comprensión de materia, masa, volumen y densidad.",
      tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo materia de cuerpo y masa de peso.", escala: escala4 },
          { descripcion: "Calculo el volumen de un objeto (geométrico o por desplazamiento).", escala: escala4 },
          { descripcion: "Calculo la densidad con ρ = m/V y la interpreto.", escala: escala4 },
        ], reflexion_final_prompt: "¿Cómo usarías la densidad para saber si una joya es de oro puro?" },
    },
  ],

  // ════════ P03 — Átomo y modelos atómicos (Oficial 5) ════════
  "CNEYT-I-P03": [
    {
      titulo: "El átomo y sus modelos — Verdadero o falso", descripcion: "Distingue afirmaciones sobre la estructura del átomo y sus modelos.",
      tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El número atómico (Z) es la cantidad de protones y define el elemento.", respuesta: true, retroalimentacion: "Correcto: el carbono siempre tiene Z = 6." },
        { enunciado: "Los electrones tienen carga positiva.", respuesta: false, retroalimentacion: "Los electrones tienen carga negativa; los protones, positiva." },
        { enunciado: "El modelo de Rutherford propuso que el átomo tiene un núcleo pequeño y denso.", respuesta: true, retroalimentacion: "Correcto: su experimento de la lámina de oro lo demostró." },
        { enunciado: "El modelo de Schrödinger describe los electrones en órbitas fijas y exactas.", respuesta: false, retroalimentacion: "El modelo cuántico habla de zonas de probabilidad (orbitales), no de órbitas exactas." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 },
    },
    {
      titulo: "Glosario — Átomo y modelos atómicos", descripcion: "Conceptos clave de la estructura atómica.",
      tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Número atómico (Z)", definicion: "Número de protones del núcleo; define el elemento.", ejemplo: "Oxígeno: Z = 8.", etiquetas: ["concepto"] },
        { termino: "Número de masa (A)", definicion: "Suma de protones y neutrones del núcleo.", ejemplo: "Carbono-12: A = 12.", etiquetas: ["concepto"] },
        { termino: "Isótopo", definicion: "Átomos del mismo elemento con distinto número de neutrones.", ejemplo: "Carbono-12 y carbono-14.", etiquetas: ["concepto"] },
        { termino: "Modelo de Dalton", definicion: "El átomo como esfera maciza e indivisible.", ejemplo: "Primer modelo moderno (1808).", etiquetas: ["modelo"] },
        { termino: "Modelo de Bohr", definicion: "Electrones en niveles de energía definidos alrededor del núcleo.", ejemplo: "Explica los espectros de emisión.", etiquetas: ["modelo"] },
        { termino: "Modelo de Schrödinger", definicion: "Modelo cuántico: orbitales como zonas de probabilidad del electrón.", ejemplo: "Modelo vigente en química.", etiquetas: ["modelo"] },
      ], actividad_final: "Ordena los modelos atómicos de Dalton a Schrödinger y di qué aportó cada uno." },
    },
    {
      titulo: "Completa: evolución de los modelos atómicos", descripcion: "Completa el texto sobre los modelos del átomo.",
      tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "El átomo está formado por protones y neutrones en el ___, rodeados por electrones. El número de protones se llama número ___. El modelo de ___ introdujo niveles de energía, y el modelo cuántico de Schrödinger describe ___ donde es probable encontrar al electrón.",
        huecos: [
          { posicion: 0, respuesta_correcta: "núcleo", alternativas_aceptadas: ["nucleo"], pista: "Parte central y densa del átomo." },
          { posicion: 1, respuesta_correcta: "atómico", alternativas_aceptadas: ["atomico"], pista: "Número que identifica al elemento (Z)." },
          { posicion: 2, respuesta_correcta: "Bohr", alternativas_aceptadas: ["bohr"], pista: "Niveles o capas de energía." },
          { posicion: 3, respuesta_correcta: "orbitales", alternativas_aceptadas: ["zonas de probabilidad"], pista: "Regiones de probabilidad." },
        ], distingue_mayusculas: false },
    },
    {
      titulo: "Autoevaluación — Estructura atómica", descripcion: "Valora tu comprensión del átomo y sus modelos.",
      tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico protones, neutrones y electrones y sus cargas.", escala: escala4 },
          { descripcion: "Distingo número atómico (Z) de número de masa (A) e isótopos.", escala: escala4 },
          { descripcion: "Describo la evolución de los modelos de Dalton a Schrödinger.", escala: escala4 },
        ], reflexion_final_prompt: "¿Por qué crees que los modelos del átomo cambiaron con el tiempo?" },
    },
  ],

  // ════════ P04 — Sustancias, mezclas, disoluciones y tabla periódica (Oficial 4) ════════
  "CNEYT-I-P04": [
    {
      titulo: "Sustancias, mezclas y disoluciones — Verdadero o falso", descripcion: "Distingue afirmaciones sobre clasificación de la materia y disoluciones.",
      tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Un compuesto está formado por dos o más elementos unidos químicamente.", respuesta: true, retroalimentacion: "Correcto: el agua (H₂O) es un compuesto." },
        { enunciado: "Una disolución es una mezcla heterogénea.", respuesta: false, retroalimentacion: "Una disolución es una mezcla homogénea (p. ej. agua con sal disuelta)." },
        { enunciado: "En una disolución, el soluto es la sustancia que se disuelve en el disolvente.", respuesta: true, retroalimentacion: "Correcto: en agua con azúcar, el azúcar es el soluto y el agua el disolvente." },
        { enunciado: "En la tabla periódica, los elementos de un mismo grupo (columna) tienen propiedades químicas semejantes.", respuesta: true, retroalimentacion: "Correcto: comparten el número de electrones de valencia." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 },
    },
    {
      titulo: "Glosario — Sustancias, mezclas y tabla periódica", descripcion: "Conceptos clave de clasificación de la materia.",
      tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Elemento", definicion: "Sustancia pura de un solo tipo de átomo.", ejemplo: "Oxígeno, hierro, oro.", etiquetas: ["concepto"] },
        { termino: "Compuesto", definicion: "Sustancia pura de dos o más elementos unidos químicamente.", ejemplo: "Agua (H₂O), sal (NaCl).", etiquetas: ["concepto"] },
        { termino: "Disolución", definicion: "Mezcla homogénea de soluto disuelto en un disolvente.", ejemplo: "Agua con sal.", etiquetas: ["concepto"] },
        { termino: "Soluto / disolvente", definicion: "El que se disuelve / el que disuelve.", ejemplo: "En agua azucarada: azúcar (soluto), agua (disolvente).", etiquetas: ["concepto"] },
        { termino: "Concentración", definicion: "Cantidad de soluto respecto a la disolución (diluida, concentrada, saturada).", ejemplo: "Más sal en la misma agua = más concentrada.", etiquetas: ["concepto"] },
        { termino: "Grupo y periodo", definicion: "Columna y fila de la tabla periódica.", ejemplo: "Los del grupo 1 son metales muy reactivos.", etiquetas: ["concepto"] },
      ], actividad_final: "Clasifica como elemento, compuesto o mezcla: oxígeno, agua, aire, sal y limonada." },
    },
    {
      titulo: "Concentración de una disolución (% en masa)", descripcion: "Ejercicio de cálculo de concentración porcentual en masa.",
      tipo: "ejercicio_matematico", xp: 15,
      contenido: { instrucciones: "Resuelve mostrando el procedimiento.",
        problema: "Disuelves 20 g de sal en 80 g de agua. ¿Cuál es la concentración de la disolución en porcentaje de masa (% m/m)?",
        contexto: "% en masa = (masa de soluto / masa de disolución) × 100. La masa de la disolución es soluto + disolvente.",
        tipo_respuesta: "numerica",
        pasos_guia: ["Masa de disolución = 20 g + 80 g = 100 g.", "% m/m = (20 / 100) × 100.", "% m/m = 20%."],
        respuesta_final: "20% en masa", unidades: "% m/m", tolerancia_error: 0.5 },
    },
    {
      titulo: "Autoevaluación — Clasificación de la materia", descripcion: "Valora tu comprensión de sustancias, mezclas, disoluciones y tabla periódica.",
      tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo elemento, compuesto y mezcla.", escala: escala4 },
          { descripcion: "Identifico soluto, disolvente y calculo concentración (% en masa).", escala: escala4 },
          { descripcion: "Uso la tabla periódica (grupos y periodos) para predecir propiedades.", escala: escala4 },
        ], reflexion_final_prompt: "¿Qué disoluciones preparas en tu vida diaria y cómo cambias su concentración?" },
    },
  ],

  // ════════ P05 — Estados de agregación y energía (Oficial 7) ════════
  "CNEYT-I-P05": [
    {
      titulo: "Estados de la materia y energía — Verdadero o falso", descripcion: "Distingue afirmaciones sobre estados de agregación y teoría cinética.",
      tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Según la teoría cinética, las partículas de la materia están en movimiento constante.", respuesta: true, retroalimentacion: "Correcto: la temperatura mide su energía cinética promedio." },
        { enunciado: "Al aumentar la temperatura, la energía cinética de las partículas disminuye.", respuesta: false, retroalimentacion: "Al subir la temperatura aumenta la energía cinética de las partículas." },
        { enunciado: "La energía interna es la suma de la energía cinética y la potencial de las partículas.", respuesta: true, retroalimentacion: "Correcto: incluye el movimiento y las fuerzas de atracción entre partículas." },
        { enunciado: "La sublimación es el paso directo de sólido a gas.", respuesta: true, retroalimentacion: "Correcto: el hielo seco (CO₂) sublima." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 },
    },
    {
      titulo: "Glosario — Estados de la materia y energía", descripcion: "Conceptos clave de estados de agregación y teoría cinética.",
      tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Teoría cinética molecular", definicion: "Modelo que explica la materia como partículas en movimiento constante.", ejemplo: "Explica por qué los gases se expanden.", etiquetas: ["concepto"] },
        { termino: "Energía cinética", definicion: "Energía asociada al movimiento de las partículas.", ejemplo: "Aumenta al calentar la sustancia.", etiquetas: ["concepto"] },
        { termino: "Energía potencial", definicion: "Energía asociada a las fuerzas de atracción entre partículas.", ejemplo: "Mayor en los sólidos, donde están muy unidas.", etiquetas: ["concepto"] },
        { termino: "Energía interna", definicion: "Suma de la energía cinética y potencial de todas las partículas.", ejemplo: "Aumenta al fundir o evaporar una sustancia.", etiquetas: ["concepto"] },
        { termino: "Temperatura", definicion: "Medida de la energía cinética promedio de las partículas.", ejemplo: "Un cuerpo caliente tiene partículas más rápidas.", etiquetas: ["medición"] },
        { termino: "Sublimación", definicion: "Cambio directo de sólido a gas.", ejemplo: "El hielo seco se convierte en gas.", etiquetas: ["cambio"] },
      ], actividad_final: "Explica qué le pasa a la energía de las partículas cuando el hielo se derrite." },
    },
    {
      titulo: "Completa: estados, energía y cambios", descripcion: "Completa el texto sobre estados de agregación y energía.",
      tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Según la teoría ___, las partículas se mueven constantemente y la ___ mide su energía cinética promedio. En los sólidos las partículas vibran en posiciones fijas; al darles energía pueden pasar a líquido (___) y luego a gas. El paso directo de sólido a gas se llama ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "cinética", alternativas_aceptadas: ["cinetica", "cinética molecular"], pista: "Teoría sobre partículas en movimiento." },
          { posicion: 1, respuesta_correcta: "temperatura", pista: "Medida de la energía cinética promedio." },
          { posicion: 2, respuesta_correcta: "fusión", alternativas_aceptadas: ["fusion"], pista: "De sólido a líquido." },
          { posicion: 3, respuesta_correcta: "sublimación", alternativas_aceptadas: ["sublimacion"], pista: "De sólido directo a gas." },
        ], distingue_mayusculas: false },
    },
    {
      titulo: "Autoevaluación — Estados de la materia y energía", descripcion: "Valora tu comprensión de los estados de agregación y la energía.",
      tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Explico los estados de agregación con la teoría cinética.", escala: escala4 },
          { descripcion: "Distingo energía cinética, potencial e interna.", escala: escala4 },
          { descripcion: "Nombro y explico los cambios de estado por transferencia de energía.", escala: escala4 },
        ], reflexion_final_prompt: "¿Cómo explicarías, con energía de partículas, por qué la ropa mojada se seca?" },
    },
  ],

  // ════════ P07 — Mujeres y grupos marginados en ciencia (Complemento) ════════
  "CNEYT-I-P07": [
    {
      titulo: "Mujeres y ciencia — Verdadero o falso", descripcion: "Distingue afirmaciones sobre el papel de las mujeres y grupos marginados en la ciencia.",
      tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "La 'Foto 51' de Rosalind Franklin fue clave para describir la estructura del ADN.", respuesta: true, retroalimentacion: "Correcto: fue usada sin su crédito por Watson y Crick." },
        { enunciado: "Las mujeres nunca han hecho aportaciones importantes a la ciencia.", respuesta: false, retroalimentacion: "Han hecho aportaciones fundamentales, muchas veces invisibilizadas." },
        { enunciado: "Lise Meitner fue excluida del Premio Nobel pese a su papel en la fisión nuclear.", respuesta: true, retroalimentacion: "Correcto: el Nobel lo recibió Otto Hahn." },
        { enunciado: "Los sesgos de género, raza y clase no influyen en quién recibe reconocimiento científico.", respuesta: false, retroalimentacion: "Sí influyen: han negado crédito y acceso a muchos grupos." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 },
    },
    {
      titulo: "Glosario — Ciencia, género e inclusión", descripcion: "Conceptos clave sobre la ciencia como práctica social e incluyente.",
      tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Sesgo de género", definicion: "Prejuicio que favorece o perjudica a alguien por su género.", ejemplo: "Negar crédito a una científica por ser mujer.", etiquetas: ["concepto"] },
        { termino: "Invisibilización", definicion: "Borrar o ignorar la contribución de personas o grupos.", ejemplo: "No mencionar a las mujeres en la historia de la ciencia.", etiquetas: ["concepto"] },
        { termino: "Rosalind Franklin", definicion: "Científica cuya imagen del ADN fue clave para la doble hélice.", ejemplo: "La 'Foto 51'.", etiquetas: ["persona"] },
        { termino: "Lise Meitner", definicion: "Física fundamental en el descubrimiento de la fisión nuclear.", ejemplo: "Excluida del Nobel de 1944.", etiquetas: ["persona"] },
        { termino: "Interculturalidad", definicion: "Reconocimiento del valor de distintos saberes y culturas.", ejemplo: "Saberes botánicos indígenas en la medicina.", etiquetas: ["concepto"] },
      ], actividad_final: "Nombra a una científica (mexicana o de otro país) e indica su aportación." },
    },
    {
      titulo: "Completa: ciencia, género e inclusión", descripcion: "Completa el texto sobre las contribuciones invisibilizadas en la ciencia.",
      tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "La historia de la ciencia suele ___ las aportaciones de las mujeres y grupos marginados. Rosalind ___ contribuyó a descubrir la estructura del ADN sin recibir crédito. Reconocer estas historias muestra que los ___ sociales afectan quién hace ciencia y quién es reconocido.",
        huecos: [
          { posicion: 0, respuesta_correcta: "invisibilizar", alternativas_aceptadas: ["ocultar", "borrar"], pista: "Hacer que no se vean." },
          { posicion: 1, respuesta_correcta: "Franklin", alternativas_aceptadas: ["franklin"], pista: "Apellido de Rosalind." },
          { posicion: 2, respuesta_correcta: "sesgos", alternativas_aceptadas: ["prejuicios"], pista: "Prejuicios de género, raza o clase." },
        ], distingue_mayusculas: false },
    },
    {
      titulo: "Autoevaluación — Ciencia e inclusión", descripcion: "Valora tu comprensión del papel de las mujeres y grupos marginados en la ciencia.",
      tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Reconozco aportaciones de mujeres y grupos marginados a la ciencia.", escala: escala4 },
          { descripcion: "Explico cómo los sesgos afectan el reconocimiento científico.", escala: escala4 },
          { descripcion: "Relaciono esto con la idea de la ciencia como práctica social.", escala: escala4 },
        ], reflexion_final_prompt: "¿Qué se podría hacer para que la ciencia sea más justa e incluyente?" },
    },
  ],

  // ════════ P08 — Materia, transformaciones y medio ambiente (Complemento) ════════
  "CNEYT-I-P08": [
    {
      titulo: "Materia y medio ambiente — Verdadero o falso", descripcion: "Distingue afirmaciones sobre transformaciones de la materia y ambiente.",
      tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Según la ley de conservación de la materia, esta no se crea ni se destruye, solo se transforma.", respuesta: true, retroalimentacion: "Correcto: la masa de los reactivos es igual a la de los productos." },
        { enunciado: "El plástico que tiramos simplemente desaparece con el tiempo.", respuesta: false, retroalimentacion: "Se fragmenta en microplásticos que persisten en suelos, agua y cadenas alimentarias." },
        { enunciado: "La combustión de la gasolina libera CO₂ a la atmósfera.", respuesta: true, retroalimentacion: "Correcto: el carbono del combustible se transforma en CO₂." },
        { enunciado: "La fotosíntesis es un cambio físico, no químico.", respuesta: false, retroalimentacion: "Es un cambio químico: produce nuevas sustancias (glucosa y oxígeno)." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 },
    },
    {
      titulo: "Glosario — Materia, ambiente y sustentabilidad", descripcion: "Conceptos clave sobre transformaciones de la materia y ambiente.",
      tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Ley de conservación de la materia", definicion: "La materia no se crea ni se destruye, solo se transforma.", ejemplo: "Formulada por Lavoisier.", etiquetas: ["ley"] },
        { termino: "Cambio físico", definicion: "Transformación sin cambio en la composición química.", ejemplo: "El hielo que se derrite.", etiquetas: ["concepto"] },
        { termino: "Cambio químico", definicion: "Transformación que produce nuevas sustancias.", ejemplo: "La combustión y la oxidación.", etiquetas: ["concepto"] },
        { termino: "Microplástico", definicion: "Fragmento de plástico menor a 5 mm que contamina ecosistemas.", ejemplo: "Llega al agua y a la cadena alimentaria.", etiquetas: ["problema"] },
        { termino: "Gases de efecto invernadero", definicion: "Gases como el CO₂ que retienen calor en la atmósfera.", ejemplo: "Contribuyen al cambio climático.", etiquetas: ["problema"] },
        { termino: "Sustentabilidad", definicion: "Uso de recursos sin comprometer a las futuras generaciones.", ejemplo: "Reducir, reutilizar y reciclar.", etiquetas: ["concepto"] },
      ], actividad_final: "Aplica la ley de conservación: ¿a dónde va realmente la basura que 'tiramos'?" },
    },
    {
      titulo: "Completa: conservación de la materia y ambiente", descripcion: "Completa el texto sobre transformaciones de la materia y ambiente.",
      tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "La ley de ___ de la materia dice que esta no se crea ni se destruye, solo se ___. Cuando quemamos gasolina, el carbono se convierte en ___ que se libera a la atmósfera. Un cambio ___ produce nuevas sustancias, como en la combustión.",
        huecos: [
          { posicion: 0, respuesta_correcta: "conservación", alternativas_aceptadas: ["conservacion"], pista: "Principio de Lavoisier." },
          { posicion: 1, respuesta_correcta: "transforma", alternativas_aceptadas: ["transforma."], pista: "Cambia de forma." },
          { posicion: 2, respuesta_correcta: "CO2", alternativas_aceptadas: ["CO₂", "dióxido de carbono", "dioxido de carbono"], pista: "Gas de efecto invernadero." },
          { posicion: 3, respuesta_correcta: "químico", alternativas_aceptadas: ["quimico"], pista: "Produce sustancias nuevas." },
        ], distingue_mayusculas: false },
    },
    {
      titulo: "Autoevaluación — Materia y medio ambiente", descripcion: "Valora tu comprensión de las transformaciones de la materia y el ambiente.",
      tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Explico la ley de conservación de la materia.", escala: escala4 },
          { descripcion: "Distingo cambios físicos de químicos en problemas ambientales.", escala: escala4 },
          { descripcion: "Relaciono las transformaciones de la materia con la sustentabilidad.", escala: escala4 },
        ], reflexion_final_prompt: "¿Qué problema ambiental de tu comunidad podrías explicar con la conservación de la materia?" },
    },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
