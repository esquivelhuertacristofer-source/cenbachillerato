/**
 * Refuerzo PM-I (Plantilla CEN): agrega A4-A7 a las 7 progresiones que ya tienen A1-A3
 * (A1=lectura, A2=ejercicio_matematico, A3=reflexion_escrita).
 *   A4 = quiz_multiple_opcion · A5 = quiz_verdadero_falso · A6 = fill_blanks / ejercicio_matematico · A7 = autoevaluacion
 * Keyed por CÓDIGO (no por numero) para ser robusto tras la renumeración oficial.
 * Todas en estado='borrador'. Uso: npx tsx scripts/seed-activities-pmi-refuerzo.ts
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
  log("\n🌱 Refuerzo PM-I — A4-A7 para las 7 progresiones existentes\n");
  const progs = await getProgresionesDeUAC(sb, "PM-I");
  let ok = 0, fail = 0, skip = 0;
  for (const p of progs) {
    const set = refuerzos[p.codigo];
    if (!set) { skip++; continue; }
    for (let i = 0; i < set.length; i++) {
      const r = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`, titulo: r.titulo, descripcion: r.descripcion,
        tipo: r.tipo, progresion_id: p.id, xp: r.xp, contenido: r.contenido,
      });
      res ? ok++ : fail++;
    }
  }
  log(`\n✅ PM-I refuerzo: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas (nuevas).\n`);
}

const refuerzos: Record<string, Refuerzo[]> = {
  // ════════ PM-I-P03 — Lógica matemática (Oficial 1) ════════
  "PM-I-P03": [
    { titulo: "Lógica matemática — Quiz", descripcion: "Comprueba tu manejo de proposiciones, conectivos y tablas de verdad.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "La proposición compuesta que une dos enunciados con 'y' se llama:", opciones: ["Disyunción", "Conjunción", "Negación", "Bicondicional"], respuesta_correcta: 1, retroalimentacion: "La conjunción (∧) usa 'y'." },
        { enunciado: "La conjunción p ∧ q es verdadera únicamente cuando:", opciones: ["Al menos una es verdadera", "Ambas son verdaderas", "Ambas son falsas", "p es falsa"], respuesta_correcta: 1, retroalimentacion: "p ∧ q es verdadera solo si ambas lo son." },
        { enunciado: "La negación de 'Hoy llueve' es:", opciones: ["Hoy hace sol", "Hoy no llueve", "Mañana llueve", "Hoy llueve mucho"], respuesta_correcta: 1, retroalimentacion: "La negación (¬) invierte el valor de verdad." },
        { enunciado: "Una bicondicional p ↔ q es verdadera cuando p y q tienen:", opciones: ["Distinto valor de verdad", "El mismo valor de verdad", "Valor verdadero siempre", "Valor falso siempre"], respuesta_correcta: 1, retroalimentacion: "p ↔ q es verdadera si ambas son V o ambas son F." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Proposiciones — Verdadero o falso", descripcion: "Distingue afirmaciones correctas sobre la lógica proposicional.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Una proposición es un enunciado que puede ser verdadero o falso.", respuesta: true, retroalimentacion: "Correcto: tiene un valor de verdad definido." },
        { enunciado: "La disyunción (o) es verdadera solo si ambas proposiciones son verdaderas.", respuesta: false, retroalimentacion: "La disyunción es verdadera si al menos una lo es." },
        { enunciado: "La conjunción p ∧ q es falsa si al menos una proposición es falsa.", respuesta: true, retroalimentacion: "Correcto: basta una falsa para que sea falsa." },
        { enunciado: "Una pregunta como '¿qué hora es?' es una proposición lógica.", respuesta: false, retroalimentacion: "Las preguntas no tienen valor de verdad, no son proposiciones." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Completa: conectivos lógicos", descripcion: "Completa el texto sobre los operadores de la lógica matemática.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Una ___ es un enunciado que puede ser verdadero o falso. Cuando unimos dos con 'y' formamos una ___; con 'o' formamos una disyunción. La ___ invierte el valor de verdad de una proposición. La proposición 'si... entonces...' se llama ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "proposición", alternativas_aceptadas: ["proposicion"], pista: "Enunciado con valor de verdad." },
          { posicion: 1, respuesta_correcta: "conjunción", alternativas_aceptadas: ["conjuncion"], pista: "Usa 'y'." },
          { posicion: 2, respuesta_correcta: "negación", alternativas_aceptadas: ["negacion"], pista: "Invierte el valor de verdad." },
          { posicion: 3, respuesta_correcta: "condicional", pista: "Si... entonces..." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Lógica matemática", descripcion: "Valora tu dominio de la lógica proposicional.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Identifico proposiciones y distingo conjunción, disyunción y negación.", escala: escala4 },
        { descripcion: "Construyo y leo tablas de verdad.", escala: escala4 },
        { descripcion: "Reconozco proposiciones condicionales y bicondicionales.", escala: escala4 },
      ], reflexion_final_prompt: "¿Dónde podrías usar la lógica para analizar un argumento de la vida diaria?" } },
  ],

  // ════════ PM-I-P02 — Reales, enteros, factorización, MCD/mcm (Oficial 3) ════════
  "PM-I-P02": [
    { titulo: "Números y operaciones — Quiz", descripcion: "Comprueba tu manejo de la clasificación de números, factorización, MCD y mcm.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "El máximo común divisor (MCD) de 12 y 18 es:", opciones: ["2", "3", "6", "36"], respuesta_correcta: 2, retroalimentacion: "12 = 2²·3 y 18 = 2·3²; el MCD es 2·3 = 6." },
        { enunciado: "El mínimo común múltiplo (mcm) de 4 y 6 es:", opciones: ["10", "12", "24", "2"], respuesta_correcta: 1, retroalimentacion: "Múltiplos comunes: 12, 24...; el menor es 12." },
        { enunciado: "La factorización en números primos de 60 es:", opciones: ["2²·3·5", "2·3·10", "4·15", "6·10"], respuesta_correcta: 0, retroalimentacion: "60 = 2·2·3·5 = 2²·3·5 (todos primos)." },
        { enunciado: "El conjunto que incluye números negativos, el cero y positivos, sin decimales, es el de los:", opciones: ["Naturales (N)", "Enteros (Z)", "Racionales (Q)", "Irracionales"], respuesta_correcta: 1, retroalimentacion: "Los enteros (Z): ..., -2, -1, 0, 1, 2, ..." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Propiedades de las operaciones — Verdadero o falso", descripcion: "Distingue afirmaciones sobre conjuntos numéricos y propiedades.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Todo número natural es también un número entero.", respuesta: true, retroalimentacion: "Correcto: los naturales están dentro de los enteros." },
        { enunciado: "La propiedad conmutativa dice que a + b = b + a.", respuesta: true, retroalimentacion: "Correcto: el orden de los sumandos no altera la suma." },
        { enunciado: "La resta de dos números naturales siempre da otro número natural.", respuesta: false, retroalimentacion: "Por ejemplo 3 − 5 = −2, que no es natural." },
        { enunciado: "El neutro aditivo es el número 1.", respuesta: false, retroalimentacion: "El neutro aditivo es el 0; el neutro multiplicativo es el 1." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Completa: clasificación de números", descripcion: "Completa el texto sobre los conjuntos numéricos y sus propiedades.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o número correcto.",
        texto_con_huecos: "Los números ___ son 1, 2, 3, ...; al agregar el cero y los negativos obtenemos los enteros. El neutro aditivo es el ___. Descomponer un número en factores primos se llama ___. El menor múltiplo común a dos números es el ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "naturales", pista: "1, 2, 3, 4, ..." },
          { posicion: 1, respuesta_correcta: "0", alternativas_aceptadas: ["cero"], pista: "a + 0 = a." },
          { posicion: 2, respuesta_correcta: "factorización", alternativas_aceptadas: ["factorizacion"], pista: "Descomponer en primos." },
          { posicion: 3, respuesta_correcta: "mcm", alternativas_aceptadas: ["mínimo común múltiplo", "minimo comun multiplo"], pista: "Mínimo común múltiplo." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Números y operaciones", descripcion: "Valora tu dominio de los conjuntos numéricos y sus operaciones.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Clasifico números (naturales, enteros, racionales) y opero con enteros.", escala: escala4 },
        { descripcion: "Aplico las propiedades (conmutativa, asociativa, distributiva, neutros e inversos).", escala: escala4 },
        { descripcion: "Factorizo en primos y calculo MCD y mcm.", escala: escala4 },
      ], reflexion_final_prompt: "¿En qué situación real te serviría calcular el mcm o el MCD?" } },
  ],

  // ════════ PM-I-P04 — Unidad, fracciones y porcentajes (Oficial 4) ════════
  "PM-I-P04": [
    { titulo: "Fracciones y porcentajes — Quiz", descripcion: "Comprueba tu manejo de fracciones, equivalencias y porcentajes.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "La fracción 6/8 simplificada es:", opciones: ["2/3", "3/4", "4/6", "1/2"], respuesta_correcta: 1, retroalimentacion: "Dividiendo numerador y denominador entre 2: 6/8 = 3/4." },
        { enunciado: "El 25% de 80 es:", opciones: ["15", "20", "25", "40"], respuesta_correcta: 1, retroalimentacion: "25% = 1/4; 80 ÷ 4 = 20." },
        { enunciado: "Una fracción equivalente a 1/2 es:", opciones: ["2/3", "2/4", "3/5", "1/3"], respuesta_correcta: 1, retroalimentacion: "2/4 = 1/2 (se obtiene multiplicando por 2 arriba y abajo)." },
        { enunciado: "Para sumar 1/3 + 1/6, el común denominador es:", opciones: ["3", "6", "9", "18"], respuesta_correcta: 1, retroalimentacion: "6 es múltiplo de 3 y de 6; 1/3 = 2/6, así 2/6 + 1/6 = 3/6 = 1/2." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Fracciones — Verdadero o falso", descripcion: "Distingue afirmaciones sobre fracciones, decimales y porcentajes.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Una fracción representa partes de una unidad.", respuesta: true, retroalimentacion: "Correcto: el denominador indica en cuántas partes se divide la unidad." },
        { enunciado: "El decimal 0.5 equivale a la fracción 1/2.", respuesta: true, retroalimentacion: "Correcto: 1 ÷ 2 = 0.5." },
        { enunciado: "El 100% de una cantidad es la cantidad completa.", respuesta: true, retroalimentacion: "Correcto: 100% representa el total." },
        { enunciado: "Para simplificar una fracción se multiplica el numerador y el denominador por el mismo número.", respuesta: false, retroalimentacion: "Para simplificar se DIVIDE entre un factor común; multiplicar da una fracción equivalente, no más simple." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Completa: fracciones y porcentajes", descripcion: "Completa el texto sobre fracciones, equivalencias y porcentajes.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o número correcto.",
        texto_con_huecos: "En una fracción, el ___ indica en cuántas partes se divide la unidad. Para ___ una fracción se divide numerador y denominador entre un factor común. El decimal 0.5 equivale a la fracción 1/2 y al ___ %. El 25% de 80 es ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "denominador", pista: "El número de abajo." },
          { posicion: 1, respuesta_correcta: "simplificar", pista: "Reducir a su mínima expresión." },
          { posicion: 2, respuesta_correcta: "50", pista: "0.5 como porcentaje." },
          { posicion: 3, respuesta_correcta: "20", pista: "Un cuarto de 80." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Fracciones y porcentajes", descripcion: "Valora tu dominio de fracciones, decimales y porcentajes.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Entiendo la fracción como partes de una unidad y simplifico fracciones.", escala: escala4 },
        { descripcion: "Encuentro fracciones equivalentes y opero con ellas.", escala: escala4 },
        { descripcion: "Calculo porcentajes en situaciones reales.", escala: escala4 },
      ], reflexion_final_prompt: "¿Dónde usas porcentajes en tu vida (descuentos, propinas, calificaciones)?" } },
  ],

  // ════════ PM-I-P06 — Medición, SI y notación científica (Oficial 6) ════════
  "PM-I-P06": [
    { titulo: "Medición y notación científica — Quiz", descripcion: "Comprueba tu manejo del Sistema Internacional y la notación científica.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "La unidad base de longitud en el Sistema Internacional es:", opciones: ["El centímetro", "El metro", "El kilómetro", "La pulgada"], respuesta_correcta: 1, retroalimentacion: "El metro (m) es la unidad base de longitud." },
        { enunciado: "1 kilómetro equivale a:", opciones: ["100 m", "1000 m", "10 m", "10 000 m"], respuesta_correcta: 1, retroalimentacion: "El prefijo 'kilo' significa 1000: 1 km = 1000 m." },
        { enunciado: "El número 3000 escrito en notación científica es:", opciones: ["3 × 10²", "3 × 10³", "30 × 10²", "3 × 10⁴"], respuesta_correcta: 1, retroalimentacion: "3000 = 3 × 1000 = 3 × 10³." },
        { enunciado: "El número 0.004 en notación científica es:", opciones: ["4 × 10³", "4 × 10⁻²", "4 × 10⁻³", "0.4 × 10⁻²"], respuesta_correcta: 2, retroalimentacion: "0.004 = 4 × 10⁻³ (se corre el punto 3 lugares)." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Sistema Internacional — Verdadero o falso", descripcion: "Distingue afirmaciones sobre medición y notación científica.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El kilogramo es la unidad base de masa en el SI.", respuesta: true, retroalimentacion: "Correcto: el kg es la unidad base de masa." },
        { enunciado: "La notación científica sirve para escribir números muy grandes o muy pequeños.", respuesta: true, retroalimentacion: "Correcto: usa potencias de 10." },
        { enunciado: "1 metro equivale a 100 milímetros.", respuesta: false, retroalimentacion: "1 metro = 1000 milímetros (100 son los centímetros)." },
        { enunciado: "Una magnitud es una propiedad que se puede medir.", respuesta: true, retroalimentacion: "Correcto: longitud, masa y tiempo son magnitudes." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Notación científica y conversiones", descripcion: "Ejercicio de notación científica y conversión de unidades del SI.", tipo: "ejercicio_matematico", xp: 15,
      contenido: { instrucciones: "Resuelve mostrando el procedimiento.",
        problema: "Una bacteria mide 0.000002 metros. (a) Escribe esa medida en notación científica. (b) Si 1 metro = 1 000 000 micrómetros (µm), ¿cuántos µm mide la bacteria?",
        contexto: "Notación científica: a × 10ⁿ, con 1 ≤ a < 10. Para pasar de metros a micrómetros se multiplica por 1 000 000.",
        tipo_respuesta: "numerica",
        pasos_guia: ["0.000002 = 2 × 10⁻⁶ m (el punto se corre 6 lugares).", "0.000002 m × 1 000 000 = 2 µm."],
        respuesta_final: "2 × 10⁻⁶ m, equivalente a 2 µm", unidades: "m y µm", tolerancia_error: 0 } },
    { titulo: "Autoevaluación — Medición y notación científica", descripcion: "Valora tu dominio de la medición y la notación científica.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Identifico las unidades base del SI y convierto entre unidades.", escala: escala4 },
        { descripcion: "Escribo números grandes y pequeños en notación científica.", escala: escala4 },
        { descripcion: "Reconozco magnitudes y elijo la unidad adecuada para medir.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué cosa muy grande o muy pequeña te gustaría medir y en qué unidad?" } },
  ],

  // ════════ PM-I-P05 — Razón y proporción (Complemento) ════════
  "PM-I-P05": [
    { titulo: "Razón y proporción — Quiz", descripcion: "Comprueba tu manejo de razones, proporciones y regla de tres.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "Si 3 lápices cuestan $12, ¿cuánto cuestan 5 lápices (al mismo precio)?", opciones: ["$15", "$18", "$20", "$24"], respuesta_correcta: 2, retroalimentacion: "Cada lápiz cuesta $4; 5 × $4 = $20." },
        { enunciado: "La razón entre 6 y 3 es:", opciones: ["2", "3", "1/2", "18"], respuesta_correcta: 0, retroalimentacion: "6 ÷ 3 = 2." },
        { enunciado: "En una proporcionalidad inversa, si una cantidad aumenta, la otra:", opciones: ["Aumenta igual", "Disminuye", "No cambia", "Se duplica"], respuesta_correcta: 1, retroalimentacion: "En la inversa, al aumentar una, la otra disminuye." },
        { enunciado: "La regla de tres sirve para:", opciones: ["Sumar tres números", "Encontrar un valor proporcional desconocido", "Redondear", "Factorizar"], respuesta_correcta: 1, retroalimentacion: "Permite hallar un cuarto valor a partir de una proporción." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Proporcionalidad — Verdadero o falso", descripcion: "Distingue afirmaciones sobre razón y proporción.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Una razón compara dos cantidades por medio de un cociente (división).", respuesta: true, retroalimentacion: "Correcto: la razón a:b es a ÷ b." },
        { enunciado: "En proporcionalidad directa, si una cantidad se duplica, la otra se reduce a la mitad.", respuesta: false, retroalimentacion: "En la directa, si una se duplica, la otra también se duplica." },
        { enunciado: "A distancia fija, la velocidad y el tiempo son inversamente proporcionales.", respuesta: true, retroalimentacion: "Correcto: a mayor velocidad, menor tiempo." },
        { enunciado: "Una proporción es la igualdad de dos razones.", respuesta: true, retroalimentacion: "Correcto: a/b = c/d." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Regla de tres en contexto", descripcion: "Ejercicio de proporcionalidad directa con regla de tres.", tipo: "ejercicio_matematico", xp: 15,
      contenido: { instrucciones: "Resuelve con regla de tres mostrando el procedimiento.",
        problema: "Una receta para 4 personas necesita 300 g de harina. ¿Cuánta harina se necesita para 6 personas?",
        contexto: "Es una proporcionalidad directa: a más personas, más harina. Regla de tres: 4 → 300, 6 → x.",
        tipo_respuesta: "numerica",
        pasos_guia: ["Plantea la proporción: 300/4 = x/6.", "x = (300 × 6) / 4.", "x = 1800 / 4 = 450 g."],
        respuesta_final: "450 g", unidades: "gramos", tolerancia_error: 0 } },
    { titulo: "Autoevaluación — Razón y proporción", descripcion: "Valora tu dominio de la proporcionalidad.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Expreso e interpreto razones entre cantidades.", escala: escala4 },
        { descripcion: "Distingo proporcionalidad directa de inversa.", escala: escala4 },
        { descripcion: "Resuelvo problemas con regla de tres.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué problema de tu vida diaria resolverías con una regla de tres?" } },
  ],

  // ════════ PM-I-P01 — Matemáticas como construcción humana (Complemento) ════════
  "PM-I-P01": [
    { titulo: "Historia de las matemáticas — Quiz", descripcion: "Comprueba lo que sabes sobre las matemáticas como construcción humana.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "Un pueblo de América que desarrolló y usó el cero fue el:", opciones: ["Romano", "Maya", "Griego", "Egipcio"], respuesta_correcta: 1, retroalimentacion: "Los pueblos olmeca y maya usaron el cero de forma destacada." },
        { enunciado: "El sistema de numeración que usamos hoy (0-9) se llama:", opciones: ["Romano", "Maya", "Indoarábigo", "Binario"], respuesta_correcta: 2, retroalimentacion: "El sistema indoarábigo, difundido en Europa por Leonardo de Pisa (Fibonacci)." },
        { enunciado: "Las matemáticas se entienden mejor como:", opciones: ["Verdades que existen fuera de la humanidad", "Una construcción humana e histórica", "Un invento de una sola cultura", "Algo sin relación con la vida diaria"], respuesta_correcta: 1, retroalimentacion: "Son una construcción humana desarrollada por muchas culturas a lo largo del tiempo." },
        { enunciado: "Los números romanos (I, V, X, L...) son un ejemplo de:", opciones: ["Un sistema de numeración", "Una operación", "Una fracción", "Una ecuación"], respuesta_correcta: 0, retroalimentacion: "Son un sistema de numeración distinto al indoarábigo." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Matemáticas y cultura — Verdadero o falso", descripcion: "Distingue afirmaciones sobre la historia y diversidad de las matemáticas.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Todas las culturas de la historia usaron el mismo sistema de numeración.", respuesta: false, retroalimentacion: "Hubo muchos sistemas distintos (maya, romano, egipcio, indoarábigo...)." },
        { enunciado: "Las matemáticas se han construido a lo largo de la historia por muchas culturas.", respuesta: true, retroalimentacion: "Correcto: son una construcción colectiva e histórica." },
        { enunciado: "El sistema de numeración maya incluía un símbolo para el cero.", respuesta: true, retroalimentacion: "Correcto: fue uno de los grandes aportes de Mesoamérica." },
        { enunciado: "Las matemáticas no tienen ninguna relación con la vida cotidiana.", respuesta: false, retroalimentacion: "Las usamos al medir, comprar, cocinar y planear." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Completa: las matemáticas en la historia", descripcion: "Completa el texto sobre las matemáticas como construcción humana.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Las matemáticas son una construcción ___ desarrollada por muchas culturas. Los pueblos olmeca y ___ usaron el cero. El sistema de numeración que empleamos hoy se llama ___ y fue difundido en Europa por Leonardo de Pisa, también conocido como ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "humana", alternativas_aceptadas: ["social", "histórica", "historica"], pista: "Hecha por personas." },
          { posicion: 1, respuesta_correcta: "maya", pista: "Cultura de Mesoamérica." },
          { posicion: 2, respuesta_correcta: "indoarábigo", alternativas_aceptadas: ["indoarabigo"], pista: "El de los dígitos 0-9." },
          { posicion: 3, respuesta_correcta: "Fibonacci", alternativas_aceptadas: ["fibonacci"], pista: "Apodo de Leonardo de Pisa." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Matemáticas y cultura", descripcion: "Valora tu comprensión de las matemáticas como construcción humana.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Reconozco las matemáticas como una construcción humana e histórica.", escala: escala4 },
        { descripcion: "Identifico distintos sistemas de numeración y culturas.", escala: escala4 },
        { descripcion: "Relaciono las matemáticas con la vida cotidiana.", escala: escala4 },
      ], reflexion_final_prompt: "¿Por qué crees que el cero fue un descubrimiento tan importante?" } },
  ],

  // ════════ PM-I-P07 — Estimación y razonabilidad (Complemento) ════════
  "PM-I-P07": [
    { titulo: "Estimación y razonabilidad — Quiz", descripcion: "Comprueba tu manejo de la estimación y el redondeo.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "Estimar 198 + 203 redondeando a centenas da aproximadamente:", opciones: ["300", "400", "500", "350"], respuesta_correcta: 1, retroalimentacion: "≈ 200 + 200 = 400." },
        { enunciado: "Redondear 47 a la decena más cercana da:", opciones: ["40", "45", "50", "47"], respuesta_correcta: 2, retroalimentacion: "47 está más cerca de 50 que de 40." },
        { enunciado: "Estimar antes de calcular sirve sobre todo para:", opciones: ["Obtener el resultado exacto", "Verificar si un resultado es razonable", "Evitar usar números", "Complicar el cálculo"], respuesta_correcta: 1, retroalimentacion: "La estimación ayuda a detectar errores grandes." },
        { enunciado: "Si calculo 49 × 51 y obtengo 250, mi resultado es:", opciones: ["Razonable", "No razonable (debería ser ≈ 2500)", "Exacto", "Imposible de verificar"], respuesta_correcta: 1, retroalimentacion: "49 × 51 ≈ 50 × 50 = 2500; 250 está muy lejos." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Estimación — Verdadero o falso", descripcion: "Distingue afirmaciones sobre estimación y aproximación.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Estimar es calcular rápidamente un valor aproximado.", respuesta: true, retroalimentacion: "Correcto: se usa para tener una idea cercana del resultado." },
        { enunciado: "La estimación sirve para detectar errores grandes en un cálculo.", respuesta: true, retroalimentacion: "Correcto: si el resultado se aleja mucho de la estimación, algo falló." },
        { enunciado: "Redondear 6.8 a la unidad más cercana da 6.", respuesta: false, retroalimentacion: "6.8 se redondea a 7 porque el decimal es ≥ 0.5." },
        { enunciado: "Una estimación debe ser siempre exactamente igual al resultado real.", respuesta: false, retroalimentacion: "Una estimación es aproximada, no exacta." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Completa: estimación y redondeo", descripcion: "Completa el texto sobre estimación y razonabilidad.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o número correcto.",
        texto_con_huecos: "___ es calcular un valor aproximado de forma rápida. Sirve para verificar si un resultado es ___. Al redondear 6.8 a la unidad obtenemos ___. Al estimar 49 × 51 esperamos un resultado cercano a ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "estimar", alternativas_aceptadas: ["estimación", "estimacion"], pista: "Calcular un valor aproximado." },
          { posicion: 1, respuesta_correcta: "razonable", pista: "Que tiene sentido." },
          { posicion: 2, respuesta_correcta: "7", pista: "6.8 redondeado." },
          { posicion: 3, respuesta_correcta: "2500", pista: "≈ 50 × 50." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Estimación y razonabilidad", descripcion: "Valora tu dominio de la estimación y la verificación.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Estimo y redondeo para obtener resultados aproximados.", escala: escala4 },
        { descripcion: "Verifico si un resultado es razonable.", escala: escala4 },
        { descripcion: "Uso la estimación para detectar errores en mis cálculos.", escala: escala4 },
      ], reflexion_final_prompt: "¿Cuándo te ha servido estimar 'a ojo' antes de hacer una cuenta exacta?" } },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
