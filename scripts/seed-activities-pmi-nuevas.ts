/**
 * PM-I nuevas (Plantilla CEN A1-A7) para las 3 progresiones oficiales que faltaban:
 *   PM-I-P08 — Conteo y sistemas de numeración (Oficial 2)
 *   PM-I-P09 — Potenciación y radicación (Oficial 5)
 *   PM-I-P10 — Operaciones combinadas y jerarquía (Oficial 7)
 * Patrón: A1 lectura(10) · A2 ejercicio_matematico(15) · A3 reflexion_escrita(20) ·
 *         A4 quiz_multiple_opcion(15) · A5 quiz_verdadero_falso(10) · A6 fill_blanks/ejercicio(10-15) · A7 autoevaluacion(10)
 * Todas en estado='borrador'. Uso: npx tsx scripts/seed-activities-pmi-nuevas.ts
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
  log("\n🌱 PM-I nuevas — A1-A7 para P08, P09, P10\n");
  const progs = await getProgresionesDeUAC(sb, "PM-I");
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
  log(`\n✅ PM-I nuevas: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas.\n`);
}

const nuevas: Record<string, Act[]> = {
  // ════════════════ PM-I-P08 — Conteo y sistemas de numeración (Oficial 2) ════════════════
  "PM-I-P08": [
    { titulo: "Contar: una historia humana", descripcion: "Lee cómo distintas culturas inventaron formas de contar y de escribir los números.", tipo: "lectura", xp: 10,
      contenido: { texto: "Contar es una de las primeras necesidades de la humanidad: saber cuántos animales, cuántas personas o cuántos días pasaban. Desde esa necesidad social, cada cultura construyó su propio sistema de conteo. En Mesopotamia se contaba en grupos de 60; en Egipto se usaban símbolos para 1, 10, 100 y 1000; en América, los pueblos olmeca y maya desarrollaron un sistema vigesimal (de base 20) y, sobre todo, usaron el CERO, un aporte enorme para las matemáticas. En la India nació el sistema que hoy usamos, con diez símbolos (0, 1, 2, ..., 9); los matemáticos árabes lo difundieron y Leonardo de Pisa, conocido como Fibonacci, lo llevó a Europa: por eso se llama sistema indoarábigo. Es un sistema POSICIONAL: el valor de cada dígito depende del lugar que ocupa (en 4 700, el 7 vale 700). Para apoyar el cálculo se inventaron herramientas como el ÁBACO. Detrás de cada número que escribimos hay, entonces, siglos de ideas de muchas culturas.",
        fuente: "MCCEMS 2025 — Pensamiento Matemático I, propósito 2", nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "¿Por qué se considera el cero un aporte tan importante?", respuesta_guia: "Permite los sistemas posicionales y representar la ausencia de cantidad." },
          { pregunta: "¿Qué significa que el sistema indoarábigo sea 'posicional'?", respuesta_guia: "El valor de un dígito depende del lugar que ocupa." },
        ], tiempo_estimado_minutos: 10 } },
    { titulo: "Valor posicional", descripcion: "Calcula el valor de un dígito según su posición en el sistema de base 10.", tipo: "ejercicio_matematico", xp: 15,
      contenido: { instrucciones: "Analiza la posición de cada dígito y responde.",
        problema: "El sistema indoarábigo es posicional y de base 10. En el número 4 700, ¿qué valor representa el dígito 7?",
        contexto: "En un sistema posicional, cada lugar vale 10 veces más que el de su derecha: unidades, decenas, centenas, unidades de millar...",
        tipo_respuesta: "numerica",
        pasos_guia: ["El 7 está en la posición de las centenas.", "Una centena vale 100, y hay 7: 7 × 100 = 700."],
        respuesta_final: "700", unidades: "", tolerancia_error: 0 } },
    { titulo: "El cero y las culturas que contaron", descripcion: "Reflexiona sobre el conteo como construcción social e histórica.", tipo: "reflexion_escrita", xp: 20,
      contenido: { prompt: "Las matemáticas no cayeron del cielo: muchas culturas inventaron formas de contar a partir de sus necesidades. Escribe un texto breve (120-250 palabras) que responda: (1) ¿Para qué necesitaron contar los pueblos antiguos? (2) Explica con tus palabras por qué el cero fue un descubrimiento tan importante. (3) ¿Qué te parece que el sistema que usas a diario sea resultado del trabajo de culturas de la India, el mundo árabe y, en América, los mayas? Da tu opinión con argumentos.",
        pistas: ["Piensa en situaciones reales: ganado, cosechas, días, personas.", "El cero permite escribir números grandes y representar 'nada'.", "Relaciona el valor posicional con el cero."],
        longitud_minima_palabras: 120, longitud_maxima_palabras: 250,
        criterios_evaluacion: ["Explica el conteo como necesidad social.", "Argumenta la importancia del cero.", "Expresa una opinión fundamentada sobre la diversidad cultural de las matemáticas."],
        formato_esperado: "libre" } },
    { titulo: "Sistemas de numeración — Quiz", descripcion: "Comprueba lo que aprendiste sobre conteo y sistemas de numeración.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "El sistema de numeración que usamos hoy es de base:", opciones: ["2", "10", "20", "60"], respuesta_correcta: 1, retroalimentacion: "El sistema indoarábigo es de base 10 (diez símbolos: 0-9)." },
        { enunciado: "Una cultura de América que desarrolló y usó el cero fue la:", opciones: ["Romana", "Maya", "Griega", "Mesopotámica"], respuesta_correcta: 1, retroalimentacion: "Los pueblos olmeca y maya usaron el cero." },
        { enunciado: "El matemático que difundió el sistema indoarábigo en Europa fue:", opciones: ["Pitágoras", "Euclides", "Leonardo de Pisa (Fibonacci)", "Arquímedes"], respuesta_correcta: 2, retroalimentacion: "Fibonacci lo difundió en Europa." },
        { enunciado: "Un instrumento antiguo que sirve para contar y calcular es:", opciones: ["El ábaco", "La regla", "El compás", "El transportador"], respuesta_correcta: 0, retroalimentacion: "El ábaco apoya el conteo y el cálculo." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Conteo y número — Verdadero o falso", descripcion: "Distingue afirmaciones sobre el conteo y los sistemas numéricos.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El cero fue un aporte fundamental para los sistemas de numeración posicionales.", respuesta: true, retroalimentacion: "Correcto: sin el cero no existiría el valor posicional como lo conocemos." },
        { enunciado: "Todos los pueblos antiguos contaban exactamente de la misma manera.", respuesta: false, retroalimentacion: "Cada cultura desarrolló su propio sistema." },
        { enunciado: "Los números naturales sirven para contar objetos.", respuesta: true, retroalimentacion: "Correcto: 1, 2, 3, ... se usan para contar." },
        { enunciado: "El sistema indoarábigo usa diez símbolos, del 0 al 9.", respuesta: true, retroalimentacion: "Correcto: por eso es de base 10." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Completa: sistemas de numeración", descripcion: "Completa el texto sobre el conteo y los sistemas numéricos.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o número correcto.",
        texto_con_huecos: "El sistema que usamos hoy se llama ___ y es de base ___. Los pueblos maya y olmeca aportaron el ___, clave para los sistemas posicionales. Un instrumento antiguo para contar y calcular es el ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "indoarábigo", alternativas_aceptadas: ["indoarabigo"], pista: "Difundido por Fibonacci." },
          { posicion: 1, respuesta_correcta: "10", alternativas_aceptadas: ["diez"], pista: "Diez símbolos: 0-9." },
          { posicion: 2, respuesta_correcta: "cero", alternativas_aceptadas: ["0"], pista: "Representa la ausencia de cantidad." },
          { posicion: 3, respuesta_correcta: "ábaco", alternativas_aceptadas: ["abaco"], pista: "Tablero con cuentas." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Conteo y numeración", descripcion: "Valora tu comprensión del conteo y los sistemas de numeración.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Explico el conteo como una necesidad social e histórica.", escala: escala4 },
        { descripcion: "Reconozco distintos sistemas de numeración y el valor del cero.", escala: escala4 },
        { descripcion: "Entiendo el valor posicional en el sistema de base 10.", escala: escala4 },
      ], reflexion_final_prompt: "¿Cómo cambiaría tu vida diaria si no existiera el cero?" } },
  ],

  // ════════════════ PM-I-P09 — Potenciación y radicación (Oficial 5) ════════════════
  "PM-I-P09": [
    { titulo: "Potencias y raíces", descripcion: "Lee qué son la potenciación y la radicación y cómo se relacionan.", tipo: "lectura", xp: 10,
      contenido: { texto: "Una POTENCIA es una forma corta de escribir una multiplicación repetida de la misma base. En 5³, el número 5 es la BASE y el 3 es el EXPONENTE; significa 5 × 5 × 5 = 125. Hay reglas útiles: al multiplicar potencias de igual base se suman los exponentes (2³ × 2² = 2⁵), y cualquier base elevada a 0 vale 1 (7⁰ = 1). Un exponente NEGATIVO indica el inverso multiplicativo de la base: 2⁻¹ = 1/2 y 3⁻² = 1/3² = 1/9. La RADICACIÓN es la operación inversa de la potenciación: la raíz cuadrada de 49 es 7 porque 7² = 49. En la raíz, el número dentro del símbolo se llama RADICANDO y el pequeño número que indica el tipo de raíz es el ÍNDICE (en la raíz cuadrada, el índice es 2). Como son operaciones inversas, una 'cancela' a la otra: la raíz cuadrada de un número al cuadrado vuelve al número original.",
        fuente: "MCCEMS 2025 — Pensamiento Matemático I, propósito 5", nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "¿Qué representa un exponente negativo?", respuesta_guia: "El inverso multiplicativo de la base elevada al exponente positivo." },
          { pregunta: "¿Por qué la radicación es la operación inversa de la potenciación?", respuesta_guia: "Porque deshace la potencia: √(7²) = 7." },
        ], tiempo_estimado_minutos: 10 } },
    { titulo: "Calcula potencias y raíces", descripcion: "Resuelve operaciones de potenciación y radicación.", tipo: "ejercicio_matematico", xp: 15,
      contenido: { instrucciones: "Calcula cada caso mostrando el procedimiento.",
        problema: "Calcula: (a) 2⁵   (b) la raíz cuadrada de 81   (c) 3⁻²",
        contexto: "Potencia = multiplicación repetida; raíz cuadrada = operación inversa; exponente negativo = inverso multiplicativo.",
        tipo_respuesta: "numerica",
        pasos_guia: ["(a) 2⁵ = 2×2×2×2×2 = 32.", "(b) √81 = 9 porque 9² = 81.", "(c) 3⁻² = 1/3² = 1/9 ≈ 0.111."],
        respuesta_final: "(a) 32, (b) 9, (c) 1/9", unidades: "", tolerancia_error: 0.01 } },
    { titulo: "¿Para qué sirven las potencias?", descripcion: "Reflexiona sobre la utilidad de potencias y raíces.", tipo: "reflexion_escrita", xp: 20,
      contenido: { prompt: "Las potencias aparecen en muchos lugares: áreas y volúmenes, la notación científica, el crecimiento de poblaciones o de un ahorro con interés. Escribe un texto breve (120-250 palabras): (1) Explica con tus palabras qué es una potencia y qué es una raíz, y por qué son operaciones inversas. (2) Da un ejemplo real donde se usen potencias (por ejemplo, calcular el área de un cuadrado o números muy grandes). (3) ¿Qué te resulta más fácil y qué más difícil de este tema?",
        pistas: ["Una potencia es una multiplicación repetida.", "La raíz deshace la potencia.", "El área de un cuadrado de lado L es L²."],
        longitud_minima_palabras: 120, longitud_maxima_palabras: 250,
        criterios_evaluacion: ["Define potencia y raíz y su relación inversa.", "Da un ejemplo real pertinente.", "Reflexiona sobre su propio aprendizaje."],
        formato_esperado: "libre" } },
    { titulo: "Potenciación y radicación — Quiz", descripcion: "Comprueba tu manejo de potencias, exponentes y raíces.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "En la potencia 5³, el número 3 es el:", opciones: ["Base", "Exponente", "Radicando", "Índice"], respuesta_correcta: 1, retroalimentacion: "El 3 es el exponente; el 5 es la base." },
        { enunciado: "El resultado de 2⁴ es:", opciones: ["6", "8", "16", "24"], respuesta_correcta: 2, retroalimentacion: "2×2×2×2 = 16." },
        { enunciado: "La raíz cuadrada de 49 es:", opciones: ["6", "7", "8", "24.5"], respuesta_correcta: 1, retroalimentacion: "7² = 49, así que √49 = 7." },
        { enunciado: "El exponente negativo 2⁻¹ es igual a:", opciones: ["−2", "1/2", "2", "0"], respuesta_correcta: 1, retroalimentacion: "2⁻¹ = 1/2 (inverso multiplicativo)." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Potencias y raíces — Verdadero o falso", descripcion: "Distingue afirmaciones sobre potenciación y radicación.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Una potencia es una multiplicación repetida de la misma base.", respuesta: true, retroalimentacion: "Correcto: 5³ = 5×5×5." },
        { enunciado: "La radicación es la operación inversa de la potenciación.", respuesta: true, retroalimentacion: "Correcto: la raíz deshace la potencia." },
        { enunciado: "5⁰ es igual a 0.", respuesta: false, retroalimentacion: "Cualquier base distinta de 0 elevada a 0 vale 1: 5⁰ = 1." },
        { enunciado: "La raíz cuadrada de 16 es 4.", respuesta: true, retroalimentacion: "Correcto: 4² = 16." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Reglas de potencias y radicación", descripcion: "Aplica la regla del producto de potencias y calcula una raíz.", tipo: "ejercicio_matematico", xp: 15,
      contenido: { instrucciones: "Resuelve mostrando el procedimiento.",
        problema: "(a) Aplica la regla del producto de potencias de igual base: 3² × 3³.  (b) Calcula la raíz cuadrada de 100.",
        contexto: "Producto de potencias de igual base: se suman los exponentes (aᵐ × aⁿ = aᵐ⁺ⁿ). Raíz cuadrada: número que elevado al cuadrado da el radicando.",
        tipo_respuesta: "numerica",
        pasos_guia: ["(a) 3² × 3³ = 3²⁺³ = 3⁵ = 243.", "(b) √100 = 10 porque 10² = 100."],
        respuesta_final: "(a) 243, (b) 10", unidades: "", tolerancia_error: 0 } },
    { titulo: "Autoevaluación — Potenciación y radicación", descripcion: "Valora tu dominio de potencias y raíces.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Identifico base, exponente, radicando e índice.", escala: escala4 },
        { descripcion: "Calculo potencias (incluidos exponentes 0 y negativos) y raíces cuadradas.", escala: escala4 },
        { descripcion: "Aplico reglas de potencias y entiendo que la raíz es la inversa de la potencia.", escala: escala4 },
      ], reflexion_final_prompt: "¿Dónde has visto números escritos como potencias (por ejemplo, en ciencia o tecnología)?" } },
  ],

  // ════════════════ PM-I-P10 — Operaciones combinadas y jerarquía (Oficial 7) ════════════════
  "PM-I-P10": [
    { titulo: "El orden importa: jerarquía de operaciones", descripcion: "Lee cómo resolver operaciones combinadas respetando la jerarquía.", tipo: "lectura", xp: 10,
      contenido: { texto: "Cuando una expresión tiene varias operaciones, no se resuelven de izquierda a derecha sin más: hay un ORDEN o jerarquía que todos respetamos para obtener el mismo resultado. El orden es: (1) lo que está dentro de los símbolos de agrupación —paréntesis ( ), corchetes [ ] y llaves { }—; (2) las potencias y raíces; (3) las multiplicaciones y divisiones, de izquierda a derecha; y (4) por último, las sumas y restas, de izquierda a derecha. Por ejemplo, en 2 + 3 × 4 primero se multiplica (3 × 4 = 12) y luego se suma (2 + 12 = 14); NO da 20. Los símbolos de agrupación permiten cambiar ese orden: (5 + 3) × 2 = 8 × 2 = 16. Además, conviene recordar que restar un número es lo mismo que sumar su opuesto: 7 − 5 = 7 + (−5). Respetar la jerarquía evita errores y hace que una misma expresión signifique lo mismo para todas las personas.",
        fuente: "MCCEMS 2025 — Pensamiento Matemático I, propósito 7", nivel_lectura: "intermedio",
        preguntas_comprension: [
          { pregunta: "¿Cuál es el orden correcto de la jerarquía de operaciones?", respuesta_guia: "Agrupación, potencias/raíces, multiplicación/división, suma/resta." },
          { pregunta: "¿Por qué 2 + 3 × 4 no da 20?", respuesta_guia: "Porque primero se multiplica (3×4=12) y luego se suma: 14." },
        ], tiempo_estimado_minutos: 10 } },
    { titulo: "Resuelve respetando la jerarquía", descripcion: "Aplica el orden de las operaciones en una expresión combinada.", tipo: "ejercicio_matematico", xp: 15,
      contenido: { instrucciones: "Resuelve respetando la jerarquía de operaciones.",
        problema: "Calcula: 2 + 3 × 4",
        contexto: "Orden: agrupación → potencias/raíces → multiplicación/división → suma/resta.",
        tipo_respuesta: "numerica",
        pasos_guia: ["Primero la multiplicación: 3 × 4 = 12.", "Luego la suma: 2 + 12 = 14."],
        respuesta_final: "14", unidades: "", tolerancia_error: 0 } },
    { titulo: "¿Por qué acordamos un orden?", descripcion: "Reflexiona sobre la utilidad de la jerarquía de operaciones.", tipo: "reflexion_escrita", xp: 20,
      contenido: { prompt: "La jerarquía de operaciones es un acuerdo para que todos obtengamos el mismo resultado. Escribe un texto breve (120-250 palabras): (1) Explica con tus palabras cuál es el orden de la jerarquía. (2) Da un ejemplo donde, si no se respeta el orden, se obtiene un resultado equivocado. (3) ¿Por qué crees que es importante que todas las personas usen las mismas reglas al calcular (por ejemplo, en una calculadora, en una computadora o en una factura)?",
        pistas: ["Recuerda: agrupación, potencias/raíces, ×÷, +−.", "Usa un ejemplo como 2 + 3 × 4.", "Piensa en qué pasaría si cada quien resolviera en un orden distinto."],
        longitud_minima_palabras: 120, longitud_maxima_palabras: 250,
        criterios_evaluacion: ["Describe correctamente el orden de la jerarquía.", "Da un ejemplo que muestre la diferencia.", "Argumenta la importancia de reglas comunes."],
        formato_esperado: "libre" } },
    { titulo: "Operaciones combinadas — Quiz", descripcion: "Comprueba tu manejo de la jerarquía de operaciones.", tipo: "quiz_multiple_opcion", xp: 15,
      contenido: { preguntas: [
        { enunciado: "En 2 + 3 × 4, ¿qué operación se hace primero?", opciones: ["La suma", "La multiplicación", "Da igual el orden", "Ninguna"], respuesta_correcta: 1, retroalimentacion: "Primero la multiplicación: 3×4=12, luego 2+12=14." },
        { enunciado: "El resultado de (5 + 3) × 2 es:", opciones: ["11", "13", "16", "10"], respuesta_correcta: 2, retroalimentacion: "Primero el paréntesis: 5+3=8; luego 8×2=16." },
        { enunciado: "El resultado de 10 − 2² es:", opciones: ["6", "64", "16", "8"], respuesta_correcta: 0, retroalimentacion: "Primero la potencia: 2²=4; luego 10−4=6." },
        { enunciado: "El orden correcto de la jerarquía es:", opciones: ["Suma, resta, multiplicación, paréntesis", "Paréntesis, potencias/raíces, multiplicación/división, suma/resta", "Multiplicación, paréntesis, suma, potencias", "De izquierda a derecha siempre"], respuesta_correcta: 1, retroalimentacion: "Ese es el orden correcto de la jerarquía." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Jerarquía — Verdadero o falso", descripcion: "Distingue afirmaciones sobre operaciones combinadas.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "En una operación combinada, la multiplicación se hace antes que la suma.", respuesta: true, retroalimentacion: "Correcto: la multiplicación tiene mayor jerarquía que la suma." },
        { enunciado: "Los paréntesis indican qué operación hacer primero.", respuesta: true, retroalimentacion: "Correcto: lo agrupado se resuelve primero." },
        { enunciado: "La expresión 2 + 3 × 4 es igual a 20.", respuesta: false, retroalimentacion: "Es igual a 14: primero 3×4=12, luego +2." },
        { enunciado: "Restar un número es lo mismo que sumar su opuesto.", respuesta: true, retroalimentacion: "Correcto: 7 − 5 = 7 + (−5)." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Cálculo combinado con agrupación", descripcion: "Resuelve una expresión con paréntesis, división, multiplicación y suma.", tipo: "ejercicio_matematico", xp: 15,
      contenido: { instrucciones: "Resuelve paso a paso respetando la jerarquía.",
        problema: "Calcula: 12 ÷ (1 + 2) + 5 × 2",
        contexto: "Orden: primero el paréntesis, luego división y multiplicación (de izquierda a derecha), y al final la suma.",
        tipo_respuesta: "numerica",
        pasos_guia: ["Paréntesis: 1 + 2 = 3.", "División: 12 ÷ 3 = 4.", "Multiplicación: 5 × 2 = 10.", "Suma final: 4 + 10 = 14."],
        respuesta_final: "14", unidades: "", tolerancia_error: 0 } },
    { titulo: "Autoevaluación — Operaciones combinadas", descripcion: "Valora tu dominio de la jerarquía de operaciones.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Recuerdo y aplico el orden de la jerarquía de operaciones.", escala: escala4 },
        { descripcion: "Uso correctamente paréntesis, corchetes y llaves.", escala: escala4 },
        { descripcion: "Resuelvo operaciones combinadas con potencias, raíces y las cuatro operaciones básicas.", escala: escala4 },
      ], reflexion_final_prompt: "¿Te ha pasado obtener un resultado distinto al de una calculadora por no respetar el orden?" } },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
