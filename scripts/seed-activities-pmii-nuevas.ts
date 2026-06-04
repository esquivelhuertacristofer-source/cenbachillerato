/**
 * Plantilla CEN completa (A1-A7) para las 3 progresiones NUEVAS de PM-II
 * (Introducción al Álgebra):
 *   PM-II-P07 — Operaciones con monomios y binomios
 *   PM-II-P08 — Operaciones con trinomios y polinomios; productos notables
 *   PM-II-P09 — Ecuación, igualdad y sus propiedades
 * A1=lectura · A2=quiz_multiple_opcion · A3=reflexion_escrita · A4=quiz_verdadero_falso
 * A5=glosario_interactivo · A6=fill_blanks · A7=autoevaluacion. estado='borrador'.
 * Uso: npx tsx scripts/seed-activities-pmii-nuevas.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;
const letras = ["A1", "A2", "A3", "A4", "A5", "A6", "A7"];

const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo argumentarlo." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 PM-II — A1-A7 para las 3 progresiones nuevas (P07, P08, P09)\n");
  const progs = await getProgresionesDeUAC(sb, "PM-II");
  let ok = 0, fail = 0, skip = 0;
  for (const p of progs) {
    const set = nuevas[p.codigo];
    if (!set) { skip++; continue; }
    for (let i = 0; i < set.length; i++) {
      const a = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`, titulo: a.titulo, descripcion: a.descripcion,
        tipo: a.tipo, progresion_id: p.id, xp: a.xp, contenido: a.contenido,
      });
      res ? ok++ : fail++;
    }
  }
  log(`\n✅ PM-II nuevas: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas (existentes).\n`);
}

const nuevas: Record<string, Act[]> = {
  // ════════ PM-II-P07 — Operaciones con monomios y binomios ════════
  "PM-II-P07": [
    { titulo: "Operaciones con monomios y binomios", descripcion: "Lectura sobre suma, resta, multiplicación, división de monomios y factor común.", tipo: "lectura", xp: 10,
      contenido: {
        texto: "Un monomio es una expresión algebraica de un solo término, como 3x, 5x al cuadrado o 7. Un binomio tiene dos términos unidos por suma o resta, como 2x mas 3. Para operar con ellos hay reglas claras.\n\nSUMA Y RESTA. Solo se pueden sumar o restar términos semejantes, es decir, los que tienen la misma variable elevada al mismo exponente. Se suman o restan los coeficientes y se conserva la parte literal. Por ejemplo: 3x mas 5x da 8x; y 7x al cuadrado menos 2x al cuadrado da 5x al cuadrado. En cambio, 3x mas 5x al cuadrado NO se puede reducir, porque no son semejantes.\n\nMULTIPLICACIÓN. Se multiplican los coeficientes y, cuando la base es la misma, se SUMAN los exponentes. Esta es la ley de los exponentes: a elevado a m, por a elevado a n, es igual a a elevado a (m mas n). Por ejemplo: (3x al cuadrado)(4x al cubo) da 12x a la quinta, porque 3 por 4 es 12 y 2 mas 3 es 5.\n\nDIVISIÓN. Se dividen los coeficientes y, con la misma base, se RESTAN los exponentes: a elevado a m, entre a elevado a n, es igual a a elevado a (m menos n). Por ejemplo: 12x a la quinta, entre 4x al cuadrado, da 3x al cubo, porque 12 entre 4 es 3 y 5 menos 2 es 3.\n\nREGLAS DE LOS SIGNOS. Al multiplicar o dividir: mas por mas da mas; mas por menos da menos; menos por menos da mas.\n\nFACTOR COMÚN. Factorizar es escribir una expresión como producto. Cuando varios términos comparten un factor, lo extraemos: 6x al cuadrado mas 9x se factoriza como 3x por (2x mas 3), porque 3x es el factor común. Si distribuimos de nuevo comprobamos: 3x por 2x da 6x al cuadrado y 3x por 3 da 9x.",
        nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "¿Qué condición deben cumplir dos términos para poder sumarse o restarse?", respuesta_guia: "Ser semejantes: misma variable elevada al mismo exponente." },
          { pregunta: "Al multiplicar potencias de la misma base, ¿qué se hace con los exponentes?", respuesta_guia: "Se suman (a^m por a^n = a^(m+n))." },
          { pregunta: "Factoriza por factor común 6x² + 9x.", respuesta_guia: "3x(2x + 3)." },
        ], tiempo_estimado_minutos: 14 } },
    { titulo: "Monomios y binomios — Opción múltiple", descripcion: "Evalúa las operaciones con monomios y binomios y la factorización por factor común.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "El resultado de 3x + 5x es…", opciones: ["8x", "15x", "8x²", "2x"], respuesta_correcta: 0, retroalimentacion: "Son semejantes: 3 + 5 = 8, se conserva la x. Resultado: 8x." },
        { enunciado: "El resultado de (3x²)(4x³) es…", opciones: ["7x⁵", "12x⁶", "12x⁵", "12x⁹"], respuesta_correcta: 2, retroalimentacion: "Coeficientes: 3·4 = 12. Exponentes se suman: 2 + 3 = 5. Resultado: 12x⁵." },
        { enunciado: "El resultado de 12x⁵ ÷ 4x² es…", opciones: ["3x³", "3x⁷", "8x³", "3x²"], respuesta_correcta: 0, retroalimentacion: "Coeficientes: 12÷4 = 3. Exponentes se restan: 5 − 2 = 3. Resultado: 3x³." },
        { enunciado: "Al factorizar por factor común, 6x² + 9x es igual a…", opciones: ["3x(2x + 3)", "6x(x + 9)", "3(2x² + 3x)", "x(6x + 9x)"], respuesta_correcta: 0, retroalimentacion: "El factor común es 3x: 3x·2x = 6x² y 3x·3 = 9x. Resultado: 3x(2x + 3)." },
        { enunciado: "El producto (−2x)(−3x) es…", opciones: ["−6x²", "6x²", "−5x", "6x"], respuesta_correcta: 1, retroalimentacion: "Menos por menos da más; 2·3 = 6; x·x = x². Resultado: 6x²." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Reflexión: ¿para qué sirve operar con expresiones?", descripcion: "Reflexiona sobre la utilidad de combinar términos algebraicos en situaciones reales.", tipo: "reflexion_escrita", xp: 20,
      contenido: { instrucciones: "Escribe un texto reflexionando sobre el uso de las operaciones algebraicas.", prompt: "Las operaciones con monomios y binomios permiten simplificar expresiones que describen situaciones reales (perímetros, costos, cantidades que se repiten). Describe una situación de tu vida donde sumar términos semejantes o factorizar te ayudaría a calcular más rápido, y explica por qué solo se pueden sumar términos semejantes.", formato_esperado: "libre", longitud_minima_palabras: 120 } },
    { titulo: "Monomios y binomios — Verdadero o falso", descripcion: "Distingue afirmaciones correctas sobre operaciones con monomios y binomios.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Para multiplicar potencias de la misma base se suman los exponentes.", respuesta: true, retroalimentacion: "Correcto: a^m · a^n = a^(m+n)." },
        { enunciado: "3x + 5x² se puede reducir a 8x³.", respuesta: false, retroalimentacion: "Falso: no son términos semejantes, no se pueden sumar." },
        { enunciado: "Al dividir potencias de la misma base se restan los exponentes.", respuesta: true, retroalimentacion: "Correcto: a^m ÷ a^n = a^(m−n)." },
        { enunciado: "El producto (−4x)(−2x) es negativo.", respuesta: false, retroalimentacion: "Falso: menos por menos da más; el resultado es 8x²." },
        { enunciado: "6x² + 9x se factoriza por factor común como 3x(2x + 3).", respuesta: true, retroalimentacion: "Correcto: 3x es el factor común." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: monomios y operaciones", descripcion: "Aprende los términos clave de las operaciones con monomios y binomios.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Monomio", definicion: "Expresión algebraica de un solo término (coeficiente y parte literal).", ejemplo: "3x², 5x, 7." },
        { termino: "Binomio", definicion: "Expresión algebraica de dos términos unidos por suma o resta.", ejemplo: "2x + 3." },
        { termino: "Términos semejantes", definicion: "Términos con la misma variable elevada al mismo exponente; pueden sumarse o restarse.", ejemplo: "3x y 5x son semejantes; 3x y 5x² no lo son." },
        { termino: "Coeficiente", definicion: "Número que multiplica a la parte literal de un término.", ejemplo: "En 4x³ el coeficiente es 4." },
        { termino: "Factor común", definicion: "Factor que comparten todos los términos y que se extrae al factorizar.", ejemplo: "En 6x² + 9x el factor común es 3x: 3x(2x + 3)." },
      ], actividad_final: "Escribe dos monomios semejantes y dos no semejantes, y suma los que se puedan." } },
    { titulo: "Completa: operaciones con monomios", descripcion: "Completa el texto sobre las reglas para operar con monomios.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o número correcto.",
        texto_con_huecos: "Solo se pueden sumar o restar términos ___. Al multiplicar potencias de la misma base, los exponentes se ___. Al dividir potencias de la misma base, los exponentes se ___. El resultado de multiplicar 3x al cuadrado por 4x al cubo es 12x a la ___. Menos por menos da ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "semejantes", pista: "Misma variable y mismo exponente." },
          { posicion: 1, respuesta_correcta: "suman", pista: "a^m · a^n = a^(m+n)." },
          { posicion: 2, respuesta_correcta: "restan", pista: "a^m ÷ a^n = a^(m−n)." },
          { posicion: 3, respuesta_correcta: "quinta", alternativas_aceptadas: ["5", "quinta potencia"], pista: "2 + 3 = ?" },
          { posicion: 4, respuesta_correcta: "más", alternativas_aceptadas: ["mas", "positivo", "+"], pista: "Regla de los signos." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Monomios y binomios", descripcion: "Valora tu dominio de las operaciones con monomios y binomios.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Sumo y resto términos semejantes correctamente.", escala: escala4 },
        { descripcion: "Multiplico y divido monomios aplicando las leyes de los exponentes.", escala: escala4 },
        { descripcion: "Factorizo expresiones sencillas por factor común.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué regla de exponentes te cuesta más recordar y cómo la repasarás?" } },
  ],

  // ════════ PM-II-P08 — Operaciones con trinomios y polinomios; productos notables ════════
  "PM-II-P08": [
    { titulo: "Polinomios y productos notables", descripcion: "Lectura sobre operaciones con trinomios y polinomios y los productos notables.", tipo: "lectura", xp: 10,
      contenido: {
        texto: "Un trinomio tiene tres términos y un polinomio tiene varios términos. Para sumarlos o restarlos se agrupan los términos semejantes; para multiplicarlos se aplica la propiedad distributiva, multiplicando cada término de uno por cada término del otro y luego reduciendo.\n\nALGUNOS productos aparecen tan seguido que conviene memorizar su resultado: son los PRODUCTOS NOTABLES.\n\n1) Binomio al cuadrado (suma): (a mas b) al cuadrado es igual a a al cuadrado, mas 2ab, mas b al cuadrado. Ejemplo: (x mas 3) al cuadrado da x al cuadrado, mas 6x, mas 9. Comprobación: 2 por x por 3 da 6x, y 3 al cuadrado da 9.\n\n2) Binomio al cuadrado (resta): (a menos b) al cuadrado es igual a a al cuadrado, menos 2ab, mas b al cuadrado. Ejemplo: (x menos 4) al cuadrado da x al cuadrado, menos 8x, mas 16. Observa que el último término siempre es positivo.\n\n3) Producto de binomios conjugados: (a mas b)(a menos b) es igual a a al cuadrado, menos b al cuadrado (diferencia de cuadrados). Ejemplo: (x mas 5)(x menos 5) da x al cuadrado, menos 25. El término del medio se cancela.\n\n4) Binomio al cubo (suma): (a mas b) al cubo es igual a a al cubo, mas 3a al cuadrado b, mas 3ab al cuadrado, mas b al cubo.\n\nDominar estos patrones permite multiplicar mentalmente y, más adelante, factorizar con rapidez.",
        nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "¿Cómo se desarrolla (a + b)²?", respuesta_guia: "a² + 2ab + b²." },
          { pregunta: "¿Cuál es el resultado de (x + 5)(x − 5)?", respuesta_guia: "x² − 25 (diferencia de cuadrados)." },
          { pregunta: "Al desarrollar (x − 4)², ¿por qué el último término es positivo?", respuesta_guia: "Porque b² = (−4)² = 16; un número al cuadrado siempre es positivo." },
        ], tiempo_estimado_minutos: 14 } },
    { titulo: "Productos notables — Opción múltiple", descripcion: "Evalúa el desarrollo de productos notables y operaciones con polinomios.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "El desarrollo de (x + 3)² es…", opciones: ["x² + 9", "x² + 6x + 9", "x² + 3x + 9", "x² + 6x + 6"], respuesta_correcta: 1, retroalimentacion: "(a+b)² = a² + 2ab + b²: x² + 2·x·3 + 3² = x² + 6x + 9." },
        { enunciado: "El desarrollo de (x − 4)² es…", opciones: ["x² − 16", "x² − 8x − 16", "x² − 8x + 16", "x² + 8x + 16"], respuesta_correcta: 2, retroalimentacion: "(a−b)² = a² − 2ab + b²: x² − 8x + 16." },
        { enunciado: "El producto (x + 5)(x − 5) es…", opciones: ["x² − 25", "x² + 25", "x² − 10x − 25", "x² − 25x"], respuesta_correcta: 0, retroalimentacion: "(a+b)(a−b) = a² − b² = x² − 25." },
        { enunciado: "La fórmula del binomio al cubo (a + b)³ es…", opciones: ["a³ + b³", "a³ + 3a²b + 3ab² + b³", "a³ + 2ab + b³", "a³ + 3ab + b³"], respuesta_correcta: 1, retroalimentacion: "(a+b)³ = a³ + 3a²b + 3ab² + b³." },
        { enunciado: "El resultado de (2x + 1)(x − 3) es…", opciones: ["2x² − 5x − 3", "2x² − 3", "2x² + 7x − 3", "2x² − 6x − 3"], respuesta_correcta: 0, retroalimentacion: "Distributiva: 2x·x = 2x², 2x·(−3) = −6x, 1·x = x, 1·(−3) = −3 → 2x² − 5x − 3." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Reflexión: patrones que ahorran trabajo", descripcion: "Reflexiona sobre cómo reconocer patrones (productos notables) facilita los cálculos.", tipo: "reflexion_escrita", xp: 20,
      contenido: { instrucciones: "Escribe un texto reflexionando sobre el valor de reconocer patrones en matemáticas.", prompt: "Los productos notables son patrones que permiten multiplicar sin hacer toda la operación paso a paso. Reflexiona: ¿por qué crees que conviene memorizar fórmulas como (a + b)² = a² + 2ab + b? Da un ejemplo propio desarrollando un binomio al cuadrado y explica cómo reconocer patrones te ayuda también fuera de las matemáticas.", formato_esperado: "libre", longitud_minima_palabras: 120 } },
    { titulo: "Productos notables — Verdadero o falso", descripcion: "Distingue afirmaciones correctas sobre productos notables y polinomios.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "(a + b)² es igual a a² + b² (sin término del medio).", respuesta: false, retroalimentacion: "Falso: (a + b)² = a² + 2ab + b²; falta el doble producto 2ab." },
        { enunciado: "(x + 5)(x − 5) = x² − 25.", respuesta: true, retroalimentacion: "Correcto: producto de conjugados, diferencia de cuadrados." },
        { enunciado: "En (a − b)² = a² − 2ab + b², el último término es positivo.", respuesta: true, retroalimentacion: "Correcto: b² siempre es positivo." },
        { enunciado: "(a + b)³ = a³ + b³.", respuesta: false, retroalimentacion: "Falso: (a + b)³ = a³ + 3a²b + 3ab² + b³." },
        { enunciado: "Para multiplicar dos polinomios se usa la propiedad distributiva.", respuesta: true, retroalimentacion: "Correcto: cada término por cada término, y luego se reducen." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: polinomios y productos notables", descripcion: "Aprende los términos clave sobre polinomios y productos notables.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Trinomio", definicion: "Polinomio de tres términos.", ejemplo: "x² + 6x + 9." },
        { termino: "Polinomio", definicion: "Expresión algebraica de varios términos sumados o restados.", ejemplo: "2x³ − x² + 5x − 7." },
        { termino: "Propiedad distributiva", definicion: "Regla para multiplicar: cada término de un factor multiplica a cada término del otro.", ejemplo: "a(b + c) = ab + ac." },
        { termino: "Producto notable", definicion: "Multiplicación cuyo resultado sigue un patrón conocido y se puede escribir de memoria.", ejemplo: "(a + b)² = a² + 2ab + b²." },
        { termino: "Diferencia de cuadrados", definicion: "Resultado del producto de binomios conjugados: (a + b)(a − b) = a² − b².", ejemplo: "(x + 5)(x − 5) = x² − 25." },
      ], actividad_final: "Desarrolla (x + 2)² y comprueba el resultado multiplicando término a término." } },
    { titulo: "Completa: productos notables", descripcion: "Completa el texto sobre los productos notables.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o expresión correcta.",
        texto_con_huecos: "El cuadrado de una suma se desarrolla así: (a mas b) al cuadrado es a al cuadrado, mas ___, mas b al cuadrado. El producto de dos binomios ___ da una diferencia de cuadrados. Por eso (x mas 5)(x menos 5) es igual a x al cuadrado, menos ___. Para multiplicar polinomios se aplica la propiedad ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "2ab", alternativas_aceptadas: ["dos ab", "2 ab", "doble producto"], pista: "El doble producto de a por b." },
          { posicion: 1, respuesta_correcta: "conjugados", alternativas_aceptadas: ["conjugado"], pista: "Mismos términos, signos opuestos." },
          { posicion: 2, respuesta_correcta: "25", alternativas_aceptadas: ["veinticinco"], pista: "5 al cuadrado." },
          { posicion: 3, respuesta_correcta: "distributiva", pista: "a(b + c) = ab + ac." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Polinomios y productos notables", descripcion: "Valora tu dominio de operaciones con polinomios y productos notables.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Sumo, resto y multiplico polinomios usando la propiedad distributiva.", escala: escala4 },
        { descripcion: "Desarrollo el cuadrado de un binomio: (a ± b)² = a² ± 2ab + b².", escala: escala4 },
        { descripcion: "Reconozco la diferencia de cuadrados (a + b)(a − b) = a² − b².", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué producto notable te resulta más fácil de recordar y por qué?" } },
  ],

  // ════════ PM-II-P09 — Ecuación, igualdad y sus propiedades ════════
  "PM-II-P09": [
    { titulo: "Ecuación, igualdad y sus propiedades", descripcion: "Lectura sobre igualdad, identidad, ecuación y las propiedades de la igualdad.", tipo: "lectura", xp: 10,
      contenido: {
        texto: "Una IGUALDAD es una relación que afirma que dos expresiones valen lo mismo; se escribe con el signo igual, como en 4 mas 3 igual a 7. En álgebra distinguimos dos tipos de igualdad.\n\nUna IDENTIDAD es una igualdad que es verdadera para CUALQUIER valor de las letras que aparecen. Por ejemplo, (a mas b) al cuadrado igual a, a al cuadrado mas 2ab mas b al cuadrado, se cumple sin importar qué números pongamos en a y en b. Las identidades expresan reglas siempre válidas.\n\nUna ECUACIÓN, en cambio, es una igualdad que solo es verdadera para CIERTOS valores de la incógnita. Por ejemplo, x mas 2 igual a 5 solo es verdadera cuando x vale 3; para cualquier otro número la igualdad es falsa. Resolver una ecuación es encontrar el valor o los valores que la hacen verdadera.\n\nLa igualdad cumple cuatro propiedades fundamentales:\n- Reflexiva: toda cantidad es igual a sí misma; a igual a, a.\n- Simétrica: si a es igual a b, entonces b es igual a, a.\n- Transitiva: si a es igual a b, y b es igual a c, entonces a es igual a c.\n- Uniformidad: si a es igual a b, podemos sumar, restar, multiplicar o dividir (por un número distinto de cero) la misma cantidad en ambos lados y la igualdad se conserva; por ejemplo, si a igual a b, entonces a mas c igual a b mas c.\n\nLa propiedad de uniformidad es la base para resolver ecuaciones: hacemos la misma operación a los dos lados para despejar la incógnita.",
        nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "¿Qué diferencia hay entre una identidad y una ecuación?", respuesta_guia: "La identidad es verdadera para cualquier valor; la ecuación solo para ciertos valores de la incógnita." },
          { pregunta: "Enuncia la propiedad transitiva de la igualdad.", respuesta_guia: "Si a = b y b = c, entonces a = c." },
          { pregunta: "¿Qué propiedad permite sumar lo mismo a ambos lados de una ecuación?", respuesta_guia: "La uniformidad." },
        ], tiempo_estimado_minutos: 14 } },
    { titulo: "Igualdad y ecuaciones — Opción múltiple", descripcion: "Evalúa los conceptos de igualdad, identidad, ecuación y sus propiedades.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "Una igualdad verdadera para CUALQUIER valor de las letras es una…", opciones: ["ecuación", "identidad", "incógnita", "desigualdad"], respuesta_correcta: 1, retroalimentacion: "Una identidad se cumple siempre, como (a+b)² = a² + 2ab + b²." },
        { enunciado: "La ecuación x + 2 = 5 es verdadera cuando x vale…", opciones: ["2", "5", "3", "7"], respuesta_correcta: 2, retroalimentacion: "x = 5 − 2 = 3." },
        { enunciado: "La propiedad que dice 'si a = b, entonces b = a' se llama…", opciones: ["reflexiva", "simétrica", "transitiva", "uniformidad"], respuesta_correcta: 1, retroalimentacion: "Es la propiedad simétrica." },
        { enunciado: "La propiedad que dice 'si a = b y b = c, entonces a = c' es la…", opciones: ["reflexiva", "simétrica", "transitiva", "distributiva"], respuesta_correcta: 2, retroalimentacion: "Es la propiedad transitiva." },
        { enunciado: "La propiedad que permite sumar la misma cantidad a ambos lados de una igualdad es la…", opciones: ["uniformidad", "reflexiva", "conmutativa", "asociativa"], respuesta_correcta: 0, retroalimentacion: "La uniformidad: si a = b, entonces a + c = b + c." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Reflexión: el equilibrio de una igualdad", descripcion: "Reflexiona sobre la idea de igualdad como equilibrio y su utilidad para resolver problemas.", tipo: "reflexion_escrita", xp: 20,
      contenido: { instrucciones: "Escribe un texto reflexionando sobre el concepto de igualdad.", prompt: "Una ecuación se parece a una balanza en equilibrio: lo que hacemos de un lado debemos hacerlo del otro (propiedad de uniformidad). Explica con tus palabras la diferencia entre una identidad y una ecuación, y describe una situación cotidiana que podrías plantear como una ecuación para encontrar un valor desconocido.", formato_esperado: "libre", longitud_minima_palabras: 120 } },
    { titulo: "Igualdad y ecuaciones — Verdadero o falso", descripcion: "Distingue afirmaciones correctas sobre igualdad, identidad y ecuación.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Una ecuación es una igualdad verdadera solo para ciertos valores de la incógnita.", respuesta: true, retroalimentacion: "Correcto: por ejemplo x + 2 = 5 solo si x = 3." },
        { enunciado: "La igualdad (a + b)² = a² + 2ab + b² es una identidad.", respuesta: true, retroalimentacion: "Correcto: se cumple para todos los valores de a y b." },
        { enunciado: "La propiedad reflexiva dice que a = a.", respuesta: true, retroalimentacion: "Correcto: toda cantidad es igual a sí misma." },
        { enunciado: "Si a una igualdad le sumamos una cantidad solo en un lado, la igualdad se conserva.", respuesta: false, retroalimentacion: "Falso: hay que hacerlo en ambos lados (uniformidad)." },
        { enunciado: "La ecuación x + 2 = 5 también es verdadera cuando x = 4.", respuesta: false, retroalimentacion: "Falso: solo es verdadera cuando x = 3." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: igualdad y ecuaciones", descripcion: "Aprende los términos clave sobre igualdad, identidad y ecuación.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Igualdad", definicion: "Relación que afirma que dos expresiones tienen el mismo valor.", ejemplo: "4 + 3 = 7." },
        { termino: "Identidad", definicion: "Igualdad verdadera para cualquier valor de las letras que contiene.", ejemplo: "(a + b)² = a² + 2ab + b²." },
        { termino: "Ecuación", definicion: "Igualdad verdadera solo para ciertos valores de la incógnita.", ejemplo: "x + 2 = 5, verdadera solo si x = 3." },
        { termino: "Incógnita", definicion: "Valor desconocido que se busca en una ecuación, representado por una letra.", ejemplo: "La x en x + 2 = 5." },
        { termino: "Propiedad de uniformidad", definicion: "Si a = b, se puede aplicar la misma operación a ambos lados y la igualdad se conserva.", ejemplo: "Si a = b, entonces a + c = b + c." },
      ], actividad_final: "Escribe una ecuación sencilla, indica su incógnita y di para qué valor es verdadera." } },
    { titulo: "Completa: igualdad y sus propiedades", descripcion: "Completa el texto sobre igualdad, ecuación y sus propiedades.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra correcta.",
        texto_con_huecos: "Una ___ es verdadera para cualquier valor de las letras, mientras que una ___ solo es verdadera para ciertos valores de la incógnita. La propiedad ___ dice que si a es igual a b, entonces b es igual a, a. La propiedad ___ dice que si a es igual a b, y b es igual a c, entonces a es igual a c. La propiedad de ___ permite hacer la misma operación en ambos lados.",
        huecos: [
          { posicion: 0, respuesta_correcta: "identidad", pista: "Verdadera siempre." },
          { posicion: 1, respuesta_correcta: "ecuación", alternativas_aceptadas: ["ecuacion"], pista: "Verdadera solo para ciertos valores." },
          { posicion: 2, respuesta_correcta: "simétrica", alternativas_aceptadas: ["simetrica"], pista: "Si a = b entonces b = a." },
          { posicion: 3, respuesta_correcta: "transitiva", pista: "Si a = b y b = c entonces a = c." },
          { posicion: 4, respuesta_correcta: "uniformidad", pista: "Misma operación a ambos lados." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Igualdad y ecuaciones", descripcion: "Valora tu comprensión de la igualdad, la identidad, la ecuación y sus propiedades.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Distingo una identidad de una ecuación.", escala: escala4 },
        { descripcion: "Identifico la incógnita y el valor que hace verdadera una ecuación.", escala: escala4 },
        { descripcion: "Reconozco las propiedades de la igualdad (reflexiva, simétrica, transitiva, uniformidad).", escala: escala4 },
      ], reflexion_final_prompt: "¿Cómo te ayuda la propiedad de uniformidad a resolver una ecuación?" } },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
