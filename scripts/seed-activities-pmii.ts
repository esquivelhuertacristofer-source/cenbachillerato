/**
 * Seed de actividades pedagógicas para PM-II (Pensamiento Matemático II).
 * 6 progresiones × 3 actividades = 18 actividades. estado='publicada'.
 * Tipos: lectura, video_con_preguntas, infografia, ejercicio_matematico,
 *        reflexion_escrita, autoevaluacion (6 tipos)
 * Uso: npx tsx scripts/seed-activities-pmii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades PM-II — Pensamiento Matemático II\n");

  const progs = await getProgresionesDeUAC(sb, "PM-II");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo;
    const n = p.numero;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[n - 1].a1,
      descripcion: "Contextualización conceptual del propósito formativo.",
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
      descripcion: "Ejercicio matemático de práctica y resolución en contexto.",
      tipo: "ejercicio_matematico",
      progresion_id: p.id,
      xp: 15,
      estado: "publicada",
      contenido: ejercicios[n - 1],
    });
    a2ok ? ok++ : fail++;

    const a3ok = await upsertActividad(sb, {
      codigo: `${base}-A3`,
      titulo: titulos[n - 1].a3,
      descripcion: "Reflexión o autoevaluación de cierre.",
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ PM-II: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ──────────────────────────────────────────────────────────────────

const titulos = [
  { a1: "Patrones en la naturaleza y las matemáticas", a2: "Generalizo patrones con expresiones algebraicas", a3: "¿Para qué sirven los patrones y el álgebra en mi vida?" },
  { a1: "Del número a la letra: expresiones algebraicas", a2: "Operaciones con monomios y polinomios", a3: "¿Qué tan bien domino las expresiones algebraicas?" },
  { a1: "Factorizar: descomponer para comprender mejor", a2: "Factorizo polinomios paso a paso", a3: "¿Para qué sirve factorizar en la práctica?" },
  { a1: "Ecuaciones lineales en situaciones reales", a2: "Planteo y resuelvo ecuaciones lineales", a3: "Ecuaciones lineales en decisiones cotidianas" },
  { a1: "Sistemas de ecuaciones: cuando dos son necesarias", a2: "Resuelvo sistemas de ecuaciones lineales", a3: "¿Domino los sistemas de ecuaciones?" },
  { a1: "Inecuaciones: restricciones y soluciones posibles", a2: "Planteo y resuelvo inecuaciones lineales", a3: "Las inecuaciones como herramienta de decisión" },
];

const tiposA1 = ["lectura", "video_con_preguntas", "lectura", "video_con_preguntas", "lectura", "infografia"] as const;
const tiposA3 = ["reflexion_escrita", "autoevaluacion", "reflexion_escrita", "reflexion_escrita", "autoevaluacion", "reflexion_escrita"] as const;

// ── CONTENIDOS A1 ─────────────────────────────────────────────────────────────

const contenidosA1 = [
  { // P01 — lectura
    texto: `Los patrones matemáticos están en todas partes: en los pétalos de una flor (que siguen la secuencia de Fibonacci), en el hexágono de un panal de abejas, en los mosaicos de las tradiciones indígenas, en los ritmos musicales. Reconocer y describir patrones es una de las habilidades más fundamentales del pensamiento matemático.\n\nUn patrón es una regularidad que se repite siguiendo una regla. En matemáticas, los patrones numéricos pueden ser aritméticos (se suma o resta siempre la misma cantidad: 2, 5, 8, 11…) o geométricos (se multiplica o divide siempre por la misma cantidad: 3, 6, 12, 24…). Cuando identificamos un patrón, podemos generalizarlo: en lugar de continuar describiendo cada término, expresamos la regla con una fórmula general.\n\nEsa fórmula general usa letras (variables) para representar cualquier número de la secuencia. Si el patrón es 2, 5, 8, 11, la fórmula general es a = 3n - 1 (donde n es la posición del término). Esto es el álgebra: el lenguaje de las generalizaciones matemáticas.`,
    fuente: "Material elaborado para CEN Bachillerato — PM-II",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué es un patrón matemático según el texto?", respuesta_guia: "Una regularidad que se repite siguiendo una regla." },
      { pregunta: "¿Cuál es la diferencia entre un patrón aritmético y uno geométrico?", respuesta_guia: "En el aritmético se suma/resta la misma cantidad; en el geométrico se multiplica/divide por la misma cantidad." },
      { pregunta: "¿Para qué sirve generalizar un patrón con una fórmula?", respuesta_guia: "Para expresar la regla con una expresión algebraica que funciona para cualquier término." },
    ],
  },
  { // P02 — video_con_preguntas
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Del número a la letra: expresiones algebraicas",
    descripcion_video: "Explicación del álgebra como lenguaje de la generalización. Introduce monomios, polinomios y las operaciones básicas entre ellos (suma, resta, multiplicación). Incluye ejemplos con contextos cotidianos como áreas, perímetros y costos.",
    duracion_segundos: 540,
    subtitulos_disponibles: true,
    preguntas: [
      { tiempo_segundos: 120, pregunta: "¿Qué diferencia hay entre un monomio y un polinomio?", tipo: "abierta" as const },
      { tiempo_segundos: 300, pregunta: "¿Cómo se suma o resta polinomios? ¿Qué condición deben cumplir los términos?", tipo: "abierta" as const },
      { tiempo_segundos: 480, pregunta: "Da un ejemplo cotidiano donde usar una expresión algebraica sea más útil que un número específico.", tipo: "abierta" as const },
    ],
  },
  { // P03 — lectura
    texto: `Factorizar un polinomio es encontrar los factores cuya multiplicación produce ese polinomio. Es el proceso inverso a la multiplicación algebraica. Por ejemplo, x² + 5x + 6 puede factorizarse como (x + 2)(x + 3), porque al multiplicar esos dos binomios obtenemos el polinomio original.\n\n¿Para qué sirve factorizar? En primer lugar, para simplificar expresiones algebraicas. En segundo lugar, para resolver ecuaciones cuadráticas con mayor facilidad. En tercer lugar, para encontrar los ceros de una función, que tienen muchas aplicaciones en física, economía e ingeniería.\n\nLas técnicas básicas de factorización son: (1) factor común (sacar afuera el factor que comparten todos los términos: 3x + 6 = 3(x + 2)), (2) diferencia de cuadrados (a² - b² = (a+b)(a-b)), (3) trinomio cuadrado perfecto (a² + 2ab + b² = (a+b)²), y (4) trinomio de la forma x² + bx + c (buscar dos números cuya suma sea b y cuyo producto sea c).`,
    fuente: "Material elaborado para CEN Bachillerato — PM-II",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 10,
    preguntas_comprension: [
      { pregunta: "¿Qué es factorizar un polinomio?", respuesta_guia: "Encontrar los factores cuya multiplicación produce ese polinomio (proceso inverso a multiplicar)." },
      { pregunta: "Menciona tres usos de la factorización.", respuesta_guia: "Simplificar expresiones, resolver ecuaciones cuadráticas, encontrar ceros de funciones." },
      { pregunta: "¿Cuál es la factorización de a² - b²?", respuesta_guia: "(a + b)(a - b) — diferencia de cuadrados." },
    ],
  },
  { // P04 — video_con_preguntas
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Ecuaciones lineales en situaciones reales",
    descripcion_video: "Planteamiento y resolución de ecuaciones lineales en una variable a partir de problemas contextualizados: costos, distancias, edades, mezclas. Se muestra el proceso de modelación (pasar de un problema a lenguaje algebraico) y verificación de la solución.",
    duracion_segundos: 480,
    subtitulos_disponibles: true,
    preguntas: [
      { tiempo_segundos: 100, pregunta: "¿Qué pasos se siguen para pasar de un problema de palabras a una ecuación lineal?", tipo: "abierta" as const },
      { tiempo_segundos: 280, pregunta: "¿Cómo se verifica que la solución de una ecuación es correcta?", tipo: "abierta" as const },
      { tiempo_segundos: 420, pregunta: "Da un ejemplo de situación cotidiana que pueda modelarse con una ecuación lineal.", tipo: "abierta" as const },
    ],
  },
  { // P05 — lectura
    texto: `Un sistema de ecuaciones lineales es un conjunto de dos o más ecuaciones que comparten las mismas incógnitas. La solución de un sistema es el par (o conjunto) de valores que satisface simultáneamente todas las ecuaciones.\n\nGeométricamente, cada ecuación lineal en dos variables representa una recta. La solución del sistema es el punto donde esas rectas se intersectan. Si las rectas son paralelas, el sistema no tiene solución (es inconsistente). Si las rectas son la misma (coincidentes), el sistema tiene infinitas soluciones.\n\nLos métodos algebraicos para resolver un sistema 2×2 son: (1) sustitución (despejar una variable en una ecuación y sustituir en la otra), (2) igualación (despejar la misma variable en ambas ecuaciones e igualarlas), y (3) eliminación o Gauss (sumar o restar las ecuaciones para eliminar una variable). Cada método tiene ventajas según la estructura del sistema.`,
    fuente: "Material elaborado para CEN Bachillerato — PM-II",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué es la solución de un sistema de ecuaciones?", respuesta_guia: "El par de valores que satisface simultáneamente todas las ecuaciones del sistema." },
      { pregunta: "¿Qué significa geométricamente que un sistema no tenga solución?", respuesta_guia: "Que las rectas representadas son paralelas y no se intersectan." },
      { pregunta: "Menciona los tres métodos algebraicos para resolver un sistema 2×2.", respuesta_guia: "Sustitución, igualación y eliminación (Gauss)." },
    ],
  },
  { // P06 — infografia
    titulo: "Inecuaciones lineales: restricciones y soluciones",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía sobre las inecuaciones lineales: definición, símbolos (<, >, ≤, ≥), representación en recta numérica y plano cartesiano, y aplicaciones en problemas de restricción y optimización básica.",
    puntos_clave: [
      "Inecuación: expresión matemática que compara dos cantidades con <, >, ≤ o ≥.",
      "Solución de una inecuación: conjunto de valores que la satisfacen (intervalo).",
      "Representación en recta numérica: intervalo con punto abierto (exclusivo) o cerrado (inclusivo).",
      "Representación en plano cartesiano: semiplano a un lado de la recta.",
      "Aplicación: restricciones presupuestales, límites de velocidad, condiciones de eligibilidad.",
      "Al multiplicar o dividir por un número negativo, el signo de la desigualdad se invierte.",
    ],
    fuente: "Material CEN Bachillerato — PM-II",
    actividad_post: "Identifica una situación de tu vida donde existe una restricción (una condición que limita las posibilidades). Expresa esa restricción como una inecuación.",
  },
];

// ── EJERCICIOS (A2) ───────────────────────────────────────────────────────────

const ejercicios = [
  { // P01 — Patrones
    problema: "La siguiente secuencia sigue un patrón aritmético: 4, 9, 14, 19, …\n(a) ¿Cuál es la razón (diferencia común) de la secuencia?\n(b) ¿Cuál es el término número 10?\n(c) Escribe la fórmula general del término n.\n(d) ¿Qué término de la secuencia es igual a 99?",
    contexto: "Los patrones aritméticos describen situaciones donde algo crece a ritmo constante: el ahorro semanal, los escalones de una escalera, los días de entrenamiento.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "La razón es la diferencia entre términos consecutivos: 9 - 4 = ?",
      "El término n es: a_n = a_1 + (n-1)·d, donde a_1 = 4 y d es la razón.",
      "Para el término 10: a_10 = 4 + (10-1)·d",
      "Para encontrar qué término es 99: resuelve 4 + (n-1)·d = 99",
    ],
    respuesta_final: "(a) d=5; (b) a_10=49; (c) a_n=5n-1; (d) n=20",
    tolerancia_error: 0,
  },
  { // P02 — Polinomios
    problema: "Realiza las siguientes operaciones con polinomios:\n(a) (3x² + 2x - 5) + (x² - 4x + 7)\n(b) (5x³ - 2x + 3) - (2x³ + x² - x)\n(c) 2x·(3x² - x + 4)\n(d) (x + 3)(x - 2)",
    contexto: "Las operaciones con polinomios se usan para modelar costos combinados, áreas de figuras compuestas o distancias sumadas.",
    tipo_respuesta: "algebraica" as const,
    pasos_guia: [
      "(a) Agrupa términos semejantes (mismo exponente de x).",
      "(b) Distribuye el signo negativo antes de agrupar términos semejantes.",
      "(c) Multiplica el monomio por cada término del polinomio.",
      "(d) Usa la propiedad distributiva doble (FOIL) para multiplicar binomios.",
    ],
    respuesta_final: "(a) 4x²-2x+2; (b) 3x³-x²-x+3; (c) 6x³-2x²+8x; (d) x²+x-6",
    tolerancia_error: 0,
  },
  { // P03 — Factorización
    problema: "Factoriza completamente cada polinomio indicando la técnica utilizada:\n(a) 6x³ + 9x²\n(b) x² - 25\n(c) x² + 6x + 9\n(d) x² - 7x + 12",
    contexto: "La factorización permite simplificar fracciones algebraicas y resolver ecuaciones cuadráticas con facilidad.",
    tipo_respuesta: "algebraica" as const,
    pasos_guia: [
      "(a) Identifica el factor común: ¿qué número y potencia de x divide a ambos términos?",
      "(b) Reconoce el patrón a²-b²: ¿cuál es a y cuál es b?",
      "(c) Reconoce el trinomio cuadrado perfecto: (a+b)² = a² + 2ab + b²",
      "(d) Busca dos números cuya suma sea -7 y cuyo producto sea 12.",
    ],
    respuesta_final: "(a) 3x²(2x+3); (b) (x+5)(x-5); (c) (x+3)²; (d) (x-3)(x-4)",
    tolerancia_error: 0,
  },
  { // P04 — Ecuaciones lineales
    problema: "Resuelve los siguientes problemas planteando y resolviendo una ecuación lineal:\n(a) El doble de un número aumentado en 7 es igual a 23. ¿Cuál es el número?\n(b) Un artesano cobra $150 por hora de trabajo más $200 de materiales fijos. Si cobró $950 en total, ¿cuántas horas trabajó?\n(c) Dos hermanos tienen en total 45 años. El mayor tiene 9 años más que el menor. ¿Cuántos años tiene cada uno?",
    contexto: "Plantear ecuaciones lineales es una herramienta fundamental para resolver problemas cotidianos de manera sistemática.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) Sea x el número: 2x + 7 = 23 → despeja x.",
      "(b) Sea h las horas: 150h + 200 = 950 → despeja h.",
      "(c) Sea x la edad del menor: x + (x+9) = 45 → despeja x y calcula ambas edades.",
    ],
    respuesta_final: "(a) x=8; (b) h=5 horas; (c) menor=18 años, mayor=27 años",
    tolerancia_error: 0,
  },
  { // P05 — Sistemas de ecuaciones
    problema: "Resuelve el siguiente sistema usando el método indicado:\n(a) Método de sustitución:\n    x + y = 10\n    2x - y = 5\n\n(b) Método de eliminación:\n    3x + 2y = 16\n    x - 2y = 0\n\n(c) Problema: Juan tiene $80 en monedas de $5 y de $10. En total tiene 12 monedas. ¿Cuántas monedas de cada tipo tiene?",
    contexto: "Los sistemas de ecuaciones modelan situaciones donde dos condiciones deben cumplirse simultáneamente.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) Despeja x (o y) en la primera ecuación, sustituye en la segunda.",
      "(b) Suma ambas ecuaciones para eliminar y directamente.",
      "(c) Define variables (monedas de $5 = a, de $10 = b), plantea dos ecuaciones (total monedas y total valor) y resuelve.",
    ],
    respuesta_final: "(a) x=5, y=5; (b) x=4, y=2; (c) 8 monedas de $5 y 4 de $10",
    tolerancia_error: 0,
  },
  { // P06 — Inecuaciones
    problema: "Resuelve las siguientes inecuaciones y representa la solución en la recta numérica:\n(a) 3x - 5 > 7\n(b) -2x + 4 ≤ 10\n(c) 5 ≤ 2x + 1 < 13\n(d) Problema: Una tienda cobra $30 por entrada más $15 por cada atracción. ¿Cuántas atracciones como máximo puede comprar Luisa si tiene $120?",
    contexto: "Las inecuaciones modelan restricciones reales: presupuestos, condiciones mínimas o máximas, rangos de seguridad.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) Suma 5 a ambos lados, luego divide entre 3.",
      "(b) Resta 4 a ambos lados, luego divide entre -2 (recuerda invertir el signo).",
      "(c) Resuelve como inecuación doble: opera en las dos desigualdades simultáneamente.",
      "(d) Plantea: 30 + 15a ≤ 120 y despeja a.",
    ],
    respuesta_final: "(a) x>4; (b) x≥-3; (c) 2≤x<6; (d) a≤6 atracciones",
    tolerancia_error: 0,
  },
];

// ── CONTENIDOS A3 ─────────────────────────────────────────────────────────────

const contenidosA3 = [
  { // P01 — reflexion_escrita
    prompt: "Elige uno de los siguientes contextos y escribe sobre cómo los patrones matemáticos aparecen en él: (a) el arte y diseño de tu comunidad, (b) los ciclos naturales (lluvia, siembras, temporadas), o (c) los horarios y rutinas cotidianas. Explica: ¿qué patrón identificas?, ¿es aritmético o geométrico?, ¿cómo podrías expresarlo con una fórmula? No es necesario que la fórmula sea perfecta: lo importante es el razonamiento.",
    pistas: ["Busca algo que se repita con regularidad en tu entorno.", "Describe primero el patrón con palabras antes de intentar una expresión algebraica.", "¿Cuánto aumenta o se multiplica cada vez?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 250,
    criterios_evaluacion: ["Identifica un patrón concreto en un contexto real", "Describe correctamente si es aritmético o geométrico", "Intenta expresarlo algebraicamente con razonamiento claro", "Reflexión personal sobre la utilidad del álgebra"],
    formato_esperado: "libre" as const,
  },
  { // P02 — autoevaluacion
    instrucciones: "Evalúa tu comprensión de las expresiones algebraicas tras las actividades de esta progresión.",
    criterios: [
      {
        descripcion: "Identifico y diferencio monomios de polinomios",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Confundo los conceptos." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Los diferencio en la mayoría de los casos." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Los identifico y diferencio correctamente siempre." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Los identifico, diferencio y puedo dar ejemplos propios." },
        ],
      },
      {
        descripcion: "Realizo operaciones con polinomios sin errores",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Cometo errores frecuentes en las operaciones." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Las operaciones simples me salen; las complejas tienen errores." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Realizo las cuatro operaciones con pocos errores." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Realizo las operaciones sin errores y puedo verificarlas." },
        ],
      },
      {
        descripcion: "Entiendo por qué el álgebra es útil para generalizar",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No veo la conexión con situaciones reales." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Entiendo la utilidad en algunos contextos." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Explico con un ejemplo real por qué el álgebra es útil." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Propongo contextos propios donde el álgebra resuelve problemas." },
        ],
      },
    ],
    reflexion_final_prompt: "¿En qué operación con polinomios te sientes más seguro/a? ¿Cuál te genera más dudas y qué harás para dominarla?",
    visible_para_docente: true,
  },
  { // P03 — reflexion_escrita
    prompt: "La factorización tiene aplicaciones en ingeniería, arquitectura, economía y computación. Elige uno de estos campos y explica (aunque sea hipotéticamente) cómo la factorización podría ser útil. También reflexiona: ¿cuál de las técnicas de factorización te resultó más difícil y por qué crees que es así?",
    pistas: ["En arquitectura: simplificar expresiones de área o volumen.", "En economía: factorizar ecuaciones de costos o ingresos.", "En computación: optimizar algoritmos.", "Sé honesto/a sobre la dificultad: ¿fue la mecánica? ¿El reconocimiento del patrón?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 250,
    criterios_evaluacion: ["Propone una aplicación concreta y razonada de la factorización", "Identifica con claridad la técnica más difícil", "Explica la dificultad con argumentos concretos (no solo 'es difícil')", "Demuestra comprensión del para qué de la factorización"],
    formato_esperado: "libre" as const,
  },
  { // P04 — reflexion_escrita
    prompt: "Piensa en una decisión que hayas tomado o que alguien cercano a ti haya tomado donde haya sido importante calcular cantidades (un presupuesto, dividir algo entre personas, determinar el tiempo para llegar a algún lado). Escribe: ¿cómo podrías haber planteado esa situación como una ecuación lineal? ¿Qué incógnita despejarías? ¿Cuál sería la solución?",
    pistas: ["Empieza por identificar lo que NO sabes (la incógnita).", "¿Qué información SÍ tienes? Esa será la información de tu ecuación.", "No importa si la ecuación no es perfecta: lo valioso es el intento de modelar."],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 250,
    criterios_evaluacion: ["Describe una situación real concreta", "Plantea correctamente una ecuación lineal con su incógnita", "Resuelve la ecuación o explica el proceso", "Reflexiona sobre el valor de modelar problemas algebraicamente"],
    formato_esperado: "libre" as const,
  },
  { // P05 — autoevaluacion
    instrucciones: "Evalúa tu comprensión de los sistemas de ecuaciones lineales.",
    criterios: [
      {
        descripcion: "Comprendo qué significa resolver un sistema de ecuaciones",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No tengo claro qué busco cuando resuelvo un sistema." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Entiendo que busco valores que satisfagan ambas ecuaciones." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Comprendo y puedo explicar qué es la solución de un sistema." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Comprendo la interpretación algebraica y geométrica de la solución." },
        ],
      },
      {
        descripcion: "Aplico al menos dos métodos de resolución correctamente",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Solo manejo uno de los métodos con dificultad." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Manejo un método bien y otro con errores frecuentes." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Aplico dos métodos correctamente en la mayoría de los casos." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Aplico los tres métodos y elijo el más eficiente según el sistema." },
        ],
      },
    ],
    reflexion_final_prompt: "¿Qué método de resolución prefieres y por qué? ¿Hay un tipo de sistema que te resulte particularmente difícil?",
    visible_para_docente: true,
  },
  { // P06 — reflexion_escrita
    prompt: "Las inecuaciones modelan restricciones del mundo real. Piensa en tres restricciones que existen en tu vida cotidiana (puede ser económica, de tiempo, de espacio, de salud) y exprésalas como inecuaciones. Explica cada una: ¿qué significa la restricción?, ¿qué consecuencias tiene en tus decisiones?",
    pistas: ["Restricción económica: 'Tengo máximo $X para gastar, y cada cosa cuesta $Y...'", "Restricción de tiempo: 'Necesito al menos H horas de sueño y T horas de estudio...'", "Las inecuaciones se escriben con <, >, ≤ o ≥ según si el límite es estricto o incluido."],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 280,
    criterios_evaluacion: ["Propone tres restricciones reales propias", "Expresa cada restricción como una inecuación (aunque sea aproximada)", "Explica en palabras el significado de cada inecuación", "Reflexiona sobre cómo las restricciones influyen en decisiones"],
    formato_esperado: "libre" as const,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
