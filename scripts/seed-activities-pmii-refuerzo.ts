/**
 * Refuerzo PM-II (Plantilla CEN): agrega A4-A7 a las 6 progresiones que ya tienen A1-A3
 * (A1=lectura, A2=quiz_multiple_opcion, A3=reflexion_escrita).
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * Solo P01-P06 (NO P07/P08/P09, que son nuevas). Todas en estado='borrador'.
 * Uso: npx tsx scripts/seed-activities-pmii-refuerzo.ts
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
  log("\n🌱 Refuerzo PM-II — A4-A7 para las 6 progresiones existentes (P01-P06)\n");
  const progs = await getProgresionesDeUAC(sb, "PM-II");
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
  log(`\n✅ PM-II refuerzo: ${ok} insertadas, ${fail} fallidas, ${skip} progresiones omitidas (nuevas).\n`);
}

const refuerzos: Record<string, Refuerzo[]> = {
  // ════════ PM-II-P01 — Lenguaje algebraico ════════
  "PM-II-P01": [
    { titulo: "Lenguaje algebraico — Verdadero o falso", descripcion: "Distingue afirmaciones sobre la traducción del lenguaje común al algebraico.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "El lenguaje algebraico usa letras para representar números desconocidos o variables.", respuesta: true, retroalimentacion: "Correcto: las letras representan incógnitas o cantidades que varían." },
        { enunciado: "'El doble de un número más tres' se traduce como 2x + 3.", respuesta: true, retroalimentacion: "Correcto: el doble es 2x y 'más tres' suma 3." },
        { enunciado: "Una incógnita es un valor conocido que no necesita calcularse.", respuesta: false, retroalimentacion: "Falso: la incógnita es un valor desconocido que se busca." },
        { enunciado: "'La mitad de un número' se escribe como x ÷ 2 (o x/2).", respuesta: true, retroalimentacion: "Correcto: la mitad equivale a dividir entre 2." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: lenguaje algebraico", descripcion: "Aprende los términos clave del lenguaje algebraico.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Lenguaje algebraico", definicion: "Forma de expresar relaciones y cantidades usando números, letras y signos.", ejemplo: "2x + 3 para 'el doble de un número más tres'." },
        { termino: "Variable", definicion: "Letra que representa una cantidad que puede cambiar o que es desconocida.", ejemplo: "La x en 2x + 3." },
        { termino: "Incógnita", definicion: "Valor desconocido que se desea encontrar.", ejemplo: "La x cuya valor buscamos en una ecuación." },
        { termino: "Término", definicion: "Cada una de las partes de una expresión separadas por suma o resta.", ejemplo: "En 2x + 3 hay dos términos: 2x y 3." },
        { termino: "Expresión algebraica", definicion: "Combinación de números, letras y operaciones.", ejemplo: "3x² − 5x + 1." },
      ], actividad_final: "Traduce al lenguaje algebraico: 'el triple de un número, menos cuatro'." } },
    { titulo: "Completa: lenguaje algebraico", descripcion: "Completa el texto sobre el lenguaje algebraico.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o expresión correcta.",
        texto_con_huecos: "El lenguaje algebraico usa ___ para representar cantidades desconocidas. Un valor desconocido que se busca se llama ___. La frase 'el doble de un número más tres' se traduce como ___. Cada parte de una expresión separada por suma o resta es un ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "letras", alternativas_aceptadas: ["variables"], pista: "x, y, z..." },
          { posicion: 1, respuesta_correcta: "incógnita", alternativas_aceptadas: ["incognita"], pista: "Valor desconocido." },
          { posicion: 2, respuesta_correcta: "2x + 3", alternativas_aceptadas: ["2x+3", "2x más 3", "2x mas 3"], pista: "El doble es 2x." },
          { posicion: 3, respuesta_correcta: "término", alternativas_aceptadas: ["termino"], pista: "Parte separada por + o −." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Lenguaje algebraico", descripcion: "Valora tu manejo de la traducción del lenguaje común al algebraico.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Traduzco frases del lenguaje común al lenguaje algebraico.", escala: escala4 },
        { descripcion: "Distingo variables, incógnitas y términos en una expresión.", escala: escala4 },
        { descripcion: "Uso símbolos y letras para representar cantidades.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué frase del lenguaje común te costó más traducir al álgebra y por qué?" } },
  ],

  // ════════ PM-II-P02 — Clasificación de expresiones y componentes del monomio ════════
  "PM-II-P02": [
    { titulo: "Clasificación de expresiones — Verdadero o falso", descripcion: "Distingue afirmaciones sobre monomios, binomios, trinomios y polinomios.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Un monomio tiene un solo término.", respuesta: true, retroalimentacion: "Correcto: por ejemplo 5x³." },
        { enunciado: "Un binomio tiene tres términos.", respuesta: false, retroalimentacion: "Falso: el binomio tiene dos términos; el de tres es el trinomio." },
        { enunciado: "En el monomio 5x³, el coeficiente es 5 y el exponente es 3.", respuesta: true, retroalimentacion: "Correcto: 5 multiplica y 3 es el exponente de x." },
        { enunciado: "El grado de un monomio de una variable es el valor de su exponente.", respuesta: true, retroalimentacion: "Correcto: en 5x³ el grado es 3." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: clasificación de expresiones", descripcion: "Aprende los términos clave para clasificar expresiones algebraicas.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Monomio", definicion: "Expresión algebraica de un solo término.", ejemplo: "5x³." },
        { termino: "Binomio", definicion: "Expresión algebraica de dos términos.", ejemplo: "2x + 3." },
        { termino: "Trinomio", definicion: "Expresión algebraica de tres términos.", ejemplo: "x² + 6x + 9." },
        { termino: "Polinomio", definicion: "Expresión algebraica de uno o varios términos.", ejemplo: "2x³ − x² + 5x − 7." },
        { termino: "Grado", definicion: "Mayor exponente de la variable en la expresión.", ejemplo: "En 5x³ el grado es 3." },
      ], actividad_final: "Clasifica estas expresiones como monomio, binomio o trinomio: 7x; 7x − 2; x² + 6x + 9." } },
    { titulo: "Completa: componentes del monomio", descripcion: "Completa el texto sobre la clasificación de expresiones y el monomio.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o número correcto.",
        texto_con_huecos: "Una expresión de un solo término es un ___; la de dos términos es un binomio; la de tres términos es un ___. En el monomio 5x al cubo, el número 5 es el ___ y el número 3 es el ___. El grado de ese monomio es ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "monomio", pista: "Un solo término." },
          { posicion: 1, respuesta_correcta: "trinomio", pista: "Tres términos." },
          { posicion: 2, respuesta_correcta: "coeficiente", pista: "El número que multiplica." },
          { posicion: 3, respuesta_correcta: "exponente", pista: "Indica la potencia de x." },
          { posicion: 4, respuesta_correcta: "3", alternativas_aceptadas: ["tres"], pista: "Coincide con el exponente." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Clasificación de expresiones", descripcion: "Valora tu capacidad de clasificar expresiones e identificar componentes del monomio.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Clasifico expresiones como monomio, binomio, trinomio o polinomio.", escala: escala4 },
        { descripcion: "Identifico coeficiente, variable y exponente en un monomio.", escala: escala4 },
        { descripcion: "Determino el grado de un monomio.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué te ayuda a distinguir rápidamente cuántos términos tiene una expresión?" } },
  ],

  // ════════ PM-II-P03 — Factorización y álgebra aplicada ════════
  "PM-II-P03": [
    { titulo: "Factorización — Verdadero o falso", descripcion: "Distingue afirmaciones sobre factorización y álgebra aplicada.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Factorizar es escribir una expresión como un producto de factores.", respuesta: true, retroalimentacion: "Correcto: es el proceso inverso de la multiplicación." },
        { enunciado: "La diferencia de cuadrados a² − b² se factoriza como (a + b)(a − b).", respuesta: true, retroalimentacion: "Correcto: por ejemplo x² − 9 = (x + 3)(x − 3)." },
        { enunciado: "El trinomio cuadrado perfecto x² + 6x + 9 se factoriza como (x + 3)².", respuesta: true, retroalimentacion: "Correcto: es el cuadrado de (x + 3)." },
        { enunciado: "Un descuento del 20% sobre 100 pesos deja un precio final de 90 pesos.", respuesta: false, retroalimentacion: "Falso: el 20% de 100 es 20; el precio final es 80 pesos." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: factorización y aplicaciones", descripcion: "Aprende los términos clave de factorización y álgebra aplicada.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Factorizar", definicion: "Escribir una expresión como producto de factores.", ejemplo: "6x² + 9x = 3x(2x + 3)." },
        { termino: "Factor común", definicion: "Factor compartido por todos los términos que se extrae al factorizar.", ejemplo: "En 4x + 8 el factor común es 4: 4(x + 2)." },
        { termino: "Diferencia de cuadrados", definicion: "Expresión a² − b² que se factoriza como (a + b)(a − b).", ejemplo: "x² − 9 = (x + 3)(x − 3)." },
        { termino: "Trinomio cuadrado perfecto", definicion: "Trinomio que es el cuadrado de un binomio.", ejemplo: "x² + 6x + 9 = (x + 3)²." },
        { termino: "Porcentaje", definicion: "Proporción referida a 100, útil en descuentos y aumentos.", ejemplo: "20% de 100 es 20." },
      ], actividad_final: "Factoriza x² − 25 e indica qué tipo de factorización usaste." } },
    { titulo: "Completa: factorización", descripcion: "Completa el texto sobre factorización y aplicaciones.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o expresión correcta.",
        texto_con_huecos: "___ es escribir una expresión como un producto. Si los términos comparten un factor, se extrae el factor ___. La diferencia de cuadrados, a al cuadrado menos b al cuadrado, se factoriza como (a mas b) por (a menos ___). El trinomio cuadrado perfecto x al cuadrado mas 6x mas 9 se factoriza como (x mas ___) al cuadrado.",
        huecos: [
          { posicion: 0, respuesta_correcta: "factorizar", alternativas_aceptadas: ["factorización", "factorizacion"], pista: "Escribir como producto." },
          { posicion: 1, respuesta_correcta: "común", alternativas_aceptadas: ["comun"], pista: "Compartido por todos." },
          { posicion: 2, respuesta_correcta: "b", pista: "El conjugado: signo opuesto." },
          { posicion: 3, respuesta_correcta: "3", alternativas_aceptadas: ["tres"], pista: "Su cuadrado es 9 y su doble es 6." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Factorización y aplicaciones", descripcion: "Valora tu manejo de la factorización y su uso en situaciones reales.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Factorizo por factor común.", escala: escala4 },
        { descripcion: "Reconozco y factorizo diferencias de cuadrados y trinomios cuadrados perfectos.", escala: escala4 },
        { descripcion: "Aplico el álgebra a situaciones cotidianas (presupuesto, recetas, descuentos).", escala: escala4 },
      ], reflexion_final_prompt: "¿En qué situación de tu vida podrías aplicar porcentajes o proporciones?" } },
  ],

  // ════════ PM-II-P04 (complemento) — Ecuaciones lineales en una variable ════════
  "PM-II-P04": [
    { titulo: "Ecuaciones lineales — Verdadero o falso", descripcion: "Distingue afirmaciones sobre la resolución de ecuaciones lineales en una variable.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Resolver una ecuación es encontrar el valor de la incógnita que la hace verdadera.", respuesta: true, retroalimentacion: "Correcto: ese valor es la solución." },
        { enunciado: "Para despejar la incógnita se hace la misma operación en ambos lados de la igualdad.", respuesta: true, retroalimentacion: "Correcto: es la propiedad de uniformidad." },
        { enunciado: "La solución de 2x + 5 = 13 es x = 4.", respuesta: true, retroalimentacion: "Correcto: 2x = 8, entonces x = 4." },
        { enunciado: "En x + 7 = 10, la solución es x = 17.", respuesta: false, retroalimentacion: "Falso: x = 10 − 7 = 3." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: ecuaciones lineales", descripcion: "Aprende los términos clave de las ecuaciones lineales en una variable.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Ecuación lineal", definicion: "Ecuación en la que la incógnita está elevada a la potencia 1.", ejemplo: "2x + 5 = 13." },
        { termino: "Incógnita", definicion: "Valor desconocido que se busca en la ecuación.", ejemplo: "La x en 2x + 5 = 13." },
        { termino: "Despejar", definicion: "Aislar la incógnita en un lado de la igualdad mediante operaciones inversas.", ejemplo: "De 2x = 8 se obtiene x = 4 dividiendo entre 2." },
        { termino: "Solución", definicion: "Valor de la incógnita que hace verdadera la ecuación.", ejemplo: "x = 4 es la solución de 2x + 5 = 13." },
      ], actividad_final: "Resuelve paso a paso la ecuación 3x − 6 = 9 e indica la solución." } },
    { titulo: "Completa: resolver ecuaciones lineales", descripcion: "Completa el texto sobre la resolución de ecuaciones lineales.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o número correcto.",
        texto_con_huecos: "Para resolver 2x mas 5 igual a 13, primero restamos 5 en ambos lados y queda 2x igual a ___. Luego dividimos entre 2 y obtenemos x igual a ___. El valor que hace verdadera la ecuación se llama ___. Para aislar la incógnita decimos que la vamos a ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "8", alternativas_aceptadas: ["ocho"], pista: "13 − 5." },
          { posicion: 1, respuesta_correcta: "4", alternativas_aceptadas: ["cuatro"], pista: "8 ÷ 2." },
          { posicion: 2, respuesta_correcta: "solución", alternativas_aceptadas: ["solucion"], pista: "El valor buscado." },
          { posicion: 3, respuesta_correcta: "despejar", pista: "Aislarla en un lado." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Ecuaciones lineales", descripcion: "Valora tu capacidad de resolver ecuaciones lineales en una variable.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Identifico la incógnita en una ecuación lineal.", escala: escala4 },
        { descripcion: "Despejo la incógnita aplicando la misma operación en ambos lados.", escala: escala4 },
        { descripcion: "Compruebo que mi solución hace verdadera la ecuación.", escala: escala4 },
      ], reflexion_final_prompt: "¿Por qué es importante comprobar la solución sustituyéndola en la ecuación?" } },
  ],

  // ════════ PM-II-P05 (complemento) — Sistemas de ecuaciones 2x2 ════════
  "PM-II-P05": [
    { titulo: "Sistemas de ecuaciones — Verdadero o falso", descripcion: "Distingue afirmaciones sobre los sistemas de ecuaciones 2×2 y sus métodos.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Un sistema 2×2 tiene dos ecuaciones y dos incógnitas.", respuesta: true, retroalimentacion: "Correcto: por ejemplo x e y en dos ecuaciones." },
        { enunciado: "La sustitución, la igualación y la eliminación son métodos para resolver sistemas.", respuesta: true, retroalimentacion: "Correcto: son los tres métodos algebraicos clásicos." },
        { enunciado: "La solución de un sistema 2×2 es un par de valores (x, y) que cumple ambas ecuaciones.", respuesta: true, retroalimentacion: "Correcto: debe satisfacer las dos a la vez." },
        { enunciado: "Para resolver un sistema basta con encontrar el valor de una sola incógnita.", respuesta: false, retroalimentacion: "Falso: se necesitan los valores de ambas incógnitas." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: sistemas de ecuaciones", descripcion: "Aprende los términos clave de los sistemas de ecuaciones 2×2.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Sistema de ecuaciones", definicion: "Conjunto de dos o más ecuaciones que comparten las mismas incógnitas.", ejemplo: "x + y = 5 y x − y = 1." },
        { termino: "Método de sustitución", definicion: "Despejar una incógnita en una ecuación y sustituirla en la otra.", ejemplo: "Despejar x y reemplazarla en la segunda ecuación." },
        { termino: "Método de igualación", definicion: "Despejar la misma incógnita en ambas ecuaciones e igualar los resultados.", ejemplo: "Igualar las dos expresiones de x." },
        { termino: "Método de eliminación", definicion: "Sumar o restar las ecuaciones para eliminar una incógnita.", ejemplo: "Sumar para cancelar la y." },
        { termino: "Solución del sistema", definicion: "Par de valores que satisface todas las ecuaciones a la vez.", ejemplo: "(x, y) = (3, 2)." },
      ], actividad_final: "Resuelve por el método que prefieras: x + y = 5 y x − y = 1." } },
    { titulo: "Completa: sistemas de ecuaciones", descripcion: "Completa el texto sobre los sistemas de ecuaciones 2×2.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o número correcto.",
        texto_con_huecos: "Un sistema 2 por 2 tiene dos ecuaciones y dos ___. Para resolverlo podemos usar la sustitución, la igualación o la ___. En el sistema x mas y igual a 5, y x menos y igual a 1, al sumar ambas ecuaciones se elimina la y y obtenemos 2x igual a 6, así que x igual a ___ e y igual a ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "incógnitas", alternativas_aceptadas: ["incognitas", "variables"], pista: "Los valores desconocidos." },
          { posicion: 1, respuesta_correcta: "eliminación", alternativas_aceptadas: ["eliminacion"], pista: "Sumar o restar ecuaciones." },
          { posicion: 2, respuesta_correcta: "3", alternativas_aceptadas: ["tres"], pista: "6 ÷ 2." },
          { posicion: 3, respuesta_correcta: "2", alternativas_aceptadas: ["dos"], pista: "Si x = 3 y x + y = 5, entonces y = 5 − 3." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Sistemas de ecuaciones", descripcion: "Valora tu capacidad de resolver sistemas de ecuaciones 2×2.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Reconozco un sistema 2×2 y sus incógnitas.", escala: escala4 },
        { descripcion: "Resuelvo sistemas por sustitución, igualación o eliminación.", escala: escala4 },
        { descripcion: "Verifico que el par (x, y) cumple ambas ecuaciones.", escala: escala4 },
      ], reflexion_final_prompt: "¿Qué método para resolver sistemas te resulta más cómodo y por qué?" } },
  ],

  // ════════ PM-II-P06 (complemento) — Inecuaciones lineales ════════
  "PM-II-P06": [
    { titulo: "Inecuaciones lineales — Verdadero o falso", descripcion: "Distingue afirmaciones sobre desigualdades e inecuaciones lineales.", tipo: "quiz_verdadero_falso", xp: 10,
      contenido: { preguntas: [
        { enunciado: "Una inecuación usa signos de desigualdad como menor que (<) o mayor que (>).", respuesta: true, retroalimentacion: "Correcto: a diferencia de la ecuación, que usa el signo igual." },
        { enunciado: "La solución de una inecuación suele ser un conjunto de valores, no uno solo.", respuesta: true, retroalimentacion: "Correcto: se representa como un intervalo en la recta numérica." },
        { enunciado: "Si en una inecuación se multiplica o divide por un número negativo, el sentido de la desigualdad se invierte.", respuesta: true, retroalimentacion: "Correcto: por ejemplo, al dividir entre −1 el signo < se vuelve >." },
        { enunciado: "La solución de x + 3 > 5 es x > 8.", respuesta: false, retroalimentacion: "Falso: x > 5 − 3, es decir x > 2." },
      ], intentos_maximos: 2, puntaje_minimo_aprobacion: 70 } },
    { titulo: "Glosario: inecuaciones lineales", descripcion: "Aprende los términos clave de las inecuaciones lineales.", tipo: "glosario_interactivo", xp: 15,
      contenido: { terminos: [
        { termino: "Desigualdad", definicion: "Relación que indica que una cantidad es mayor o menor que otra.", ejemplo: "3 < 5; x > 2." },
        { termino: "Inecuación", definicion: "Desigualdad con una incógnita que se resuelve para hallar los valores que la cumplen.", ejemplo: "x + 3 > 5." },
        { termino: "Recta numérica", definicion: "Línea donde se ubican los números y se representan las soluciones de una inecuación.", ejemplo: "Sombrear los valores mayores que 2." },
        { termino: "Intervalo", definicion: "Conjunto de todos los números entre dos extremos (o desde uno hacia el infinito).", ejemplo: "Todos los x mayores que 2." },
      ], actividad_final: "Resuelve x + 3 > 5 y representa la solución en una recta numérica." } },
    { titulo: "Completa: inecuaciones lineales", descripcion: "Completa el texto sobre las inecuaciones lineales.", tipo: "fill_blanks", xp: 10,
      contenido: { instrucciones: "Completa con la palabra o expresión correcta.",
        texto_con_huecos: "Una ___ es una desigualdad con una incógnita. Se resuelve de forma parecida a una ecuación, pero al multiplicar o dividir por un número ___, el sentido de la desigualdad se invierte. La solución de x mas 3 mayor que 5 es x mayor que ___. Las soluciones se representan en la ___ numérica.",
        huecos: [
          { posicion: 0, respuesta_correcta: "inecuación", alternativas_aceptadas: ["inecuacion", "desigualdad"], pista: "Desigualdad con incógnita." },
          { posicion: 1, respuesta_correcta: "negativo", pista: "Menor que cero." },
          { posicion: 2, respuesta_correcta: "2", alternativas_aceptadas: ["dos"], pista: "5 − 3." },
          { posicion: 3, respuesta_correcta: "recta", pista: "___ numérica." },
        ], distingue_mayusculas: false } },
    { titulo: "Autoevaluación — Inecuaciones lineales", descripcion: "Valora tu manejo de las inecuaciones lineales y su representación.", tipo: "autoevaluacion", xp: 10,
      contenido: { instrucciones: "Marca tu nivel honesto en cada criterio.", criterios: [
        { descripcion: "Distingo una ecuación de una inecuación.", escala: escala4 },
        { descripcion: "Resuelvo inecuaciones lineales (incluyendo el cambio de signo al multiplicar por negativos).", escala: escala4 },
        { descripcion: "Represento la solución en la recta numérica.", escala: escala4 },
      ], reflexion_final_prompt: "¿En qué situación real se usa una desigualdad (por ejemplo, 'al menos' o 'como máximo')?" } },
  ],
};

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
