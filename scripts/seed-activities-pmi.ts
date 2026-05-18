/**
 * Seed de actividades pedagógicas para PM-I (Pensamiento Matemático I).
 * 7 progresiones × 3 actividades = 21 actividades. estado='borrador'.
 * Uso: npx tsx scripts/seed-activities-pmi.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades PM-I — Pensamiento Matemático I\n");

  const progs = await getProgresionesDeUAC(sb, "PM-I");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo; // PM-I-P01, etc.

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[p.numero - 1].a1,
      descripcion: "Lectura de contextualización para explorar el propósito formativo.",
      tipo: "lectura",
      progresion_id: p.id,
      xp: 10,
      contenido: lecturas[p.numero - 1],
    });
    a1ok ? ok++ : fail++;

    const a2ok = await upsertActividad(sb, {
      codigo: `${base}-A2`,
      titulo: titulos[p.numero - 1].a2,
      descripcion: "Ejercicio matemático de práctica y aplicación.",
      tipo: "ejercicio_matematico",
      progresion_id: p.id,
      xp: 15,
      contenido: ejercicios[p.numero - 1],
    });
    a2ok ? ok++ : fail++;

    const a3ok = await upsertActividad(sb, {
      codigo: `${base}-A3`,
      titulo: titulos[p.numero - 1].a3,
      descripcion: "Reflexión escrita sobre el uso de las matemáticas en contexto.",
      tipo: "reflexion_escrita",
      progresion_id: p.id,
      xp: 20,
      contenido: reflexiones[p.numero - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ PM-I: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ───────────────────────────────────────────────────────────────────

const titulos = [
  { // P01 — historia y cultura de las matemáticas
    a1: "Las matemáticas son una creación humana",
    a2: "Matemáticas en mi vida cotidiana",
    a3: "¿Para qué sirven las matemáticas en mi comunidad?",
  },
  { // P02 — operaciones con naturales, enteros y racionales
    a1: "Números que usamos todos los días",
    a2: "Operaciones con enteros y racionales en contexto",
    a3: "Resuelvo un problema real con los números que conozco",
  },
  { // P03 — razonamiento lógico
    a1: "Proposiciones, conectivos y lógica cotidiana",
    a2: "Tabla de verdad de proposiciones compuestas",
    a3: "Lógica en argumentos de la vida real",
  },
  { // P04 — fracciones, decimales y porcentajes
    a1: "Fracciones, decimales y porcentajes: tres formas de lo mismo",
    a2: "Calculando porcentajes en economía cotidiana",
    a3: "¿Cuánto descuento me dan realmente?",
  },
  { // P05 — razón y proporción
    a1: "Razones, proporciones y proporcionalidad",
    a2: "Proporcionalidad directa e inversa: situaciones reales",
    a3: "Identifico proporciones en mi entorno",
  },
  { // P06 — Sistema Internacional y conversiones
    a1: "El Sistema Internacional de Medidas",
    a2: "Conversión de unidades en situaciones prácticas",
    a3: "Mido y convierto en mi mundo cotidiano",
  },
  { // P07 — estimación y razonabilidad
    a1: "Estimar: el arte de calcular sin exactitud",
    a2: "¿Es razonable este resultado?",
    a3: "¿Cuándo estimar es suficiente y cuándo necesito exactitud?",
  },
];

// ── LECTURAS (A1) ─────────────────────────────────────────────────────────────

const lecturas = [
  { // P01 — historia y cultura de las matemáticas
    texto: `Las matemáticas no surgieron de la nada ni fueron inventadas por una sola persona. Son una construcción colectiva de la humanidad a lo largo de miles de años. Los babilonios desarrollaron un sistema de numeración posicional en base 60 que todavía usamos para medir el tiempo (60 segundos en un minuto, 60 minutos en una hora). Los mayas inventaron el cero de forma independiente al resto del mundo. Los árabes sistematizaron el álgebra. Las mujeres matemáticas como Hipatia de Alejandría y Emmy Noether contribuyeron al pensamiento abstracto pese a los obstáculos históricos que enfrentaron.\n\nEsta diversidad cultural en la construcción de las matemáticas tiene una consecuencia importante: los conocimientos matemáticos no son neutrales ni universales en el sentido de que surgieron de un solo lugar. Reflejan las necesidades, las preguntas y los contextos de las culturas que los desarrollaron. Los agricultores necesitaban medir tierras y calcular cosechas; los arquitectos necesitaban geometría; los comerciantes necesitaban fracciones y porcentajes.\n\nEn tu vida cotidiana, las matemáticas están presentes aunque no siempre las reconozcas: cuando calculas cuánto tiempo tardas en llegar a algún lugar, cuando decides si te alcanza el dinero, cuando ajustas una receta para más personas, cuando estimas si un objeto cabe en un espacio. Reconocer esta presencia es el primer paso para desarrollar el pensamiento matemático.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la aportación matemática de los babilonios que aún usamos?", respuesta_guia: "El sistema de numeración en base 60 para medir el tiempo." },
      { pregunta: "¿Por qué el texto dice que las matemáticas no son neutrales?", respuesta_guia: "Porque surgieron de necesidades y contextos culturales específicos, no de un lugar único." },
      { pregunta: "Menciona tres situaciones cotidianas donde usamos matemáticas.", respuesta_guia: "Calcular tiempo de traslado, ver si alcanza el dinero, ajustar recetas, entre otras." },
    ],
  },
  { // P02 — operaciones con naturales, enteros y racionales
    texto: `Los números que usamos en matemáticas no son todos del mismo tipo. Los números naturales (1, 2, 3, 4...) son los que usamos para contar objetos concretos. Los números enteros incluyen también los números negativos (-3, -2, -1, 0) y nos permiten representar situaciones como temperaturas bajo cero, deudas o pisos de un edificio bajo tierra. Los números racionales son los que pueden expresarse como una fracción de dos enteros, e incluyen decimales finitos y periódicos.\n\nCada conjunto de números amplía las posibilidades de lo que podemos calcular. Con solo los naturales no podríamos representar deudas. Con solo los enteros no podríamos calcular medidas exactas que requieren partes (como 1.5 litros o 3/4 de taza). Con los racionales podemos hacer casi cualquier cálculo de la vida cotidiana.\n\nLas operaciones básicas (suma, resta, multiplicación y división) funcionan de manera diferente en cada conjunto. Por ejemplo, dividir dos números naturales no siempre da un natural: 7 ÷ 2 = 3.5, que es racional. Multiplicar dos números negativos da un número positivo: (-3) × (-4) = 12. Conocer estas reglas y saber cuándo aplicarlas es fundamental para resolver problemas reales con precisión.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Qué tipo de situaciones requieren números negativos?", respuesta_guia: "Temperaturas bajo cero, deudas, pisos bajo tierra." },
      { pregunta: "¿Por qué los naturales no son suficientes para todas las situaciones?", respuesta_guia: "Porque no permiten representar deudas ni medidas con partes fraccionarias." },
      { pregunta: "¿Cuánto es (-3) × (-4) y por qué?", respuesta_guia: "12, porque multiplicar dos negativos da positivo." },
    ],
  },
  { // P03 — razonamiento lógico
    texto: `La lógica matemática es el estudio de los principios que determinan si un argumento es válido o no. Una proposición es una afirmación que puede ser verdadera o falsa, pero no ambas al mismo tiempo. "Hoy es lunes" es una proposición. "¿Qué hora es?" no lo es, porque es una pregunta.\n\nCuando combinamos proposiciones con conectivos lógicos, obtenemos proposiciones compuestas. Los principales conectivos son: la conjunción (p Y q: verdadera solo si ambas son verdaderas), la disyunción (p O q: falsa solo si ambas son falsas), la negación (NO p: invierte el valor de verdad), la implicación (Si p, entonces q) y la bicondicional (p si y solo si q).\n\nLas tablas de verdad nos permiten analizar sistemáticamente todos los casos posibles de una proposición compuesta. Si p puede ser V o F, y q también puede ser V o F, entonces tenemos 4 combinaciones posibles: VV, VF, FV, FF. Analizar cada combinación nos permite determinar cuándo una proposición compuesta es verdadera.\n\nEsta herramienta no es solo abstracta: la usamos cuando analizamos argumentos en debates, cuando identificamos falacias en noticias o publicidad, y cuando tomamos decisiones con condiciones múltiples ("si tengo dinero Y hay descuento, entonces compro").`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 10,
    preguntas_comprension: [
      { pregunta: "¿Cuándo es verdadera una conjunción (p Y q)?", respuesta_guia: "Solo cuando ambas proposiciones son verdaderas." },
      { pregunta: "¿Cuándo es falsa una disyunción (p O q)?", respuesta_guia: "Solo cuando ambas proposiciones son falsas." },
      { pregunta: "¿Cuántas combinaciones posibles hay con dos proposiciones (p y q)?", respuesta_guia: "4 combinaciones: VV, VF, FV, FF." },
    ],
  },
  { // P04 — fracciones, decimales y porcentajes
    texto: `Fracciones, decimales y porcentajes son tres formas de expresar la misma idea: una parte de un todo. La fracción 1/4 equivale al decimal 0.25 y al porcentaje 25%. Saber convertir entre estas representaciones es una habilidad fundamental para la vida cotidiana y para las ciencias.\n\nEn la cocina usamos fracciones: 3/4 de taza de harina. En economía usamos porcentajes: una inflación del 4.5% mensual. En ciencias usamos decimales: una concentración de 0.05 gramos por litro. Cada representación es más cómoda en cierto contexto, pero la cantidad que representan es la misma.\n\nLas operaciones con fracciones tienen reglas propias. Para sumar o restar fracciones necesitamos denominador común: 1/3 + 1/4 = 4/12 + 3/12 = 7/12. Para multiplicar, multiplicamos numeradores y denominadores: (2/3) × (3/5) = 6/15 = 2/5. Para dividir, multiplicamos por el recíproco: (2/3) ÷ (4/5) = (2/3) × (5/4) = 10/12 = 5/6.\n\nLos porcentajes son especialmente útiles para comparar cantidades relativas: no es lo mismo que un producto cueste $10 más si el original cuesta $20 (un 50% más) a si cuesta $1,000 (solo un 1% más).`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿A qué decimal y porcentaje equivale la fracción 1/4?", respuesta_guia: "0.25 y 25%." },
      { pregunta: "¿Cuál es el resultado de 1/3 + 1/4?", respuesta_guia: "7/12." },
      { pregunta: "¿Por qué los porcentajes son útiles para comparar cantidades?", respuesta_guia: "Porque expresan la cantidad relativa respecto al total, no el valor absoluto." },
    ],
  },
  { // P05 — razón y proporción
    texto: `Una razón es una comparación entre dos cantidades. Si en un grupo hay 3 mujeres por cada 2 hombres, la razón es 3:2 o 3/2. Una proporción es una igualdad entre dos razones: 3/2 = 6/4, lo que significa que si duplicamos ambos grupos, la relación se mantiene.\n\nLa proporcionalidad directa ocurre cuando al aumentar una cantidad, la otra también aumenta en la misma proporción. Si un trabajador produce 5 piezas por hora, en 3 horas producirá 15 piezas: la relación es constante (5 piezas/hora). La fórmula es y = kx, donde k es la constante de proporcionalidad.\n\nLa proporcionalidad inversa ocurre cuando al aumentar una cantidad, la otra disminuye en la misma proporción. Si 4 trabajadores terminan una tarea en 6 días, 8 trabajadores la terminarán en 3 días: más trabajadores, menos tiempo. La fórmula es y = k/x.\n\nReconocer cuándo una situación es de proporcionalidad directa o inversa es crucial para resolver problemas correctamente. Un error frecuente es asumir que toda relación entre dos cantidades es directamente proporcional cuando en realidad puede ser inversa.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué es una razón? Dé un ejemplo.", respuesta_guia: "Comparación entre dos cantidades. Ej: 3 mujeres por cada 2 hombres (3:2)." },
      { pregunta: "¿Cuándo hay proporcionalidad inversa?", respuesta_guia: "Cuando al aumentar una cantidad, la otra disminuye en la misma proporción." },
      { pregunta: "Si 4 trabajadores terminan en 6 días, ¿cuántos días tardarán 8 trabajadores?", respuesta_guia: "3 días (proporcionalidad inversa: se dobla el personal, se reduce a la mitad el tiempo)." },
    ],
  },
  { // P06 — Sistema Internacional y conversiones
    texto: `El Sistema Internacional de Unidades (SI) es el sistema de medición más utilizado en el mundo y el estándar en ciencia y tecnología. Fue adoptado internacionalmente en 1960 y tiene siete unidades base: metro (longitud), kilogramo (masa), segundo (tiempo), ampere (corriente eléctrica), kelvin (temperatura), mol (cantidad de sustancia) y candela (intensidad luminosa).\n\nDel SI se derivan múltiples unidades usando prefijos que indican potencias de 10. Los más comunes son: kilo (×1,000), hecto (×100), deca (×10), deci (÷10), centi (÷100) y mili (÷1,000). Así, 1 kilómetro = 1,000 metros; 1 centímetro = 0.01 metros.\n\nConvertir entre unidades requiere multiplicar o dividir por la relación entre ellas. Para convertir 3.5 kilómetros a metros: 3.5 × 1,000 = 3,500 metros. Para convertir 750 mililitros a litros: 750 ÷ 1,000 = 0.75 litros.\n\nEn la vida cotidiana y en las ciencias, medir con precisión y en las unidades correctas puede marcar la diferencia entre el éxito y el error. En 1999, una sonda de la NASA se perdió porque dos equipos usaban diferentes sistemas de unidades sin convertir correctamente.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Cuáles son las siete unidades base del SI?", respuesta_guia: "Metro, kilogramo, segundo, ampere, kelvin, mol y candela." },
      { pregunta: "¿Cuántos metros hay en 3.5 kilómetros?", respuesta_guia: "3,500 metros." },
      { pregunta: "¿Cuántos litros son 750 mililitros?", respuesta_guia: "0.75 litros." },
    ],
  },
  { // P07 — estimación y razonabilidad
    texto: `Estimar es calcular un valor aproximado sin necesidad de calcularlo con exactitud. No es adivinar al azar: es usar el razonamiento matemático para obtener una aproximación razonable en poco tiempo. La estimación es tan importante como el cálculo exacto, y a veces más útil.\n\nAlgunas estrategias de estimación incluyen el redondeo (aproximar a decenas, centenas o múltiplos convenientes), la comparación con referencias conocidas (¿cuántas veces cabe este objeto en aquel?) y el uso de porcentajes aproximados (el 10% de algo es fácil de calcular mentalmente).\n\nVerificar la razonabilidad de un resultado es igualmente fundamental: antes de aceptar una respuesta, debemos preguntarnos si tiene sentido. Si calculamos cuántos autobuses se necesitan para llevar a 480 personas en autobuses de 40 asientos, la respuesta debe ser 12 (un número entero y razonable); si obtenemos 1,200, algo está mal. Si calculamos el precio por kilo y nos da $0.002, probablemente cometimos un error.\n\nLa estimación también permite detectar errores en calculadoras o computadoras. Una máquina que da un resultado sin sentido no siempre avisa: depende del operador reconocer que algo falla.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la diferencia entre estimar y adivinar?", respuesta_guia: "Estimar usa razonamiento matemático para obtener una aproximación; adivinar es al azar." },
      { pregunta: "Menciona dos estrategias de estimación.", respuesta_guia: "Redondeo y comparación con referencias conocidas (o porcentajes aproximados)." },
      { pregunta: "Si necesitas llevar 480 personas en autobuses de 40 asientos, ¿cuántos autobuses necesitas?", respuesta_guia: "12 autobuses." },
    ],
  },
];

// ── EJERCICIOS MATEMÁTICOS (A2) ───────────────────────────────────────────────

const ejercicios = [
  { // P01 — matemáticas cotidianas
    instrucciones: "Lee el siguiente problema y resuélvelo mostrando tu procedimiento paso a paso.",
    problema: "Una receta para 4 personas requiere 2 tazas de arroz, 1/2 kg de pollo y 3 tomates. ¿Cuánto necesitas de cada ingrediente si quieres preparar la receta para 10 personas?",
    contexto: "Situación cotidiana de cocina que involucra proporciones y operaciones con fracciones.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "1. Identifica la razón entre la cantidad original (4 personas) y la nueva cantidad (10 personas).",
      "2. Multiplica cada ingrediente por esa razón.",
      "3. Simplifica los resultados si es necesario.",
      "4. Verifica que las cantidades sean razonables.",
    ],
    respuesta_final: "Arroz: 5 tazas. Pollo: 1.25 kg (o 1 kg y 250 g). Tomates: 7.5 (aproximadamente 8 tomates).",
  },
  { // P02 — enteros y racionales
    instrucciones: "Resuelve los siguientes ejercicios y explica el procedimiento de cada uno.",
    problema: "a) Una empresa tiene deudas de $4,500 y ganancias de $3,200. ¿Cuál es su balance actual?\nb) La temperatura bajó de 8°C a -3°C. ¿Cuántos grados descendió?\nc) Un elevador está en el piso -2 (sótano 2). Sube 7 pisos. ¿En qué piso queda?\nd) Calcula: (-6) × (-4) + (-3) × 5",
    contexto: "Situaciones reales que requieren operaciones con números enteros (positivos y negativos).",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "a) Balance = Ganancias − Deudas = 3,200 − 4,500",
      "b) Descenso = 8 − (−3) = 8 + 3",
      "c) Piso final = −2 + 7",
      "d) Aplica jerarquía de operaciones: primero multiplicaciones, luego suma",
    ],
    respuesta_final: "a) −$1,300 (deuda neta). b) 11 grados. c) Piso 5. d) 24 + (−15) = 9.",
  },
  { // P03 — razonamiento lógico
    instrucciones: "Construye la tabla de verdad de la proposición compuesta indicada y determina si es una tautología (siempre verdadera), contradicción (siempre falsa) o contingencia (a veces verdadera).",
    problema: "Sean p y q proposiciones. Construye la tabla de verdad de: (p ∧ q) → (p ∨ q). Determina si es tautología, contradicción o contingencia. Luego da un ejemplo cotidiano de esta proposición.",
    contexto: "Lógica proposicional: conectivos, tablas de verdad, y clasificación de proposiciones compuestas.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "1. Lista las 4 combinaciones posibles de valores de p y q: VV, VF, FV, FF.",
      "2. Calcula p ∧ q (conjunción: verdadera solo si ambas son V).",
      "3. Calcula p ∨ q (disyunción: falsa solo si ambas son F).",
      "4. Calcula la implicación: A → B es falsa solo cuando A es V y B es F.",
      "5. Revisa si el resultado final es siempre V, siempre F o varía.",
    ],
    respuesta_final: "La proposición es una tautología (siempre verdadera). Si se cumplen las dos condiciones (p ∧ q = V), entonces al menos una se cumple (p ∨ q = V) también. Ejemplo: 'Si estudio Y duermo bien, entonces estudio O duermo bien'.",
  },
  { // P04 — fracciones, decimales y porcentajes
    instrucciones: "Resuelve el siguiente problema de economía cotidiana mostrando el procedimiento completo.",
    problema: "Una tienda tiene una chamarra con precio original de $850. Ofrece un descuento del 30%. Además, si pagas en efectivo, te dan un 10% adicional sobre el precio con descuento. ¿Cuánto pagas finalmente? ¿Cuánto ahorraste en total respecto al precio original?",
    contexto: "Aplicación de porcentajes en descuentos sucesivos, situación económica cotidiana.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "1. Calcula el 30% de $850 para obtener el primer descuento.",
      "2. Resta ese descuento al precio original para obtener el precio intermedio.",
      "3. Calcula el 10% del precio intermedio para el segundo descuento.",
      "4. Resta el segundo descuento al precio intermedio.",
      "5. Calcula el ahorro total: precio original − precio final.",
    ],
    respuesta_final: "Primer descuento: $255. Precio intermedio: $595. Segundo descuento: $59.50. Precio final: $535.50. Ahorro total: $314.50 (37% del precio original).",
  },
  { // P05 — razón y proporción
    instrucciones: "Identifica el tipo de proporcionalidad (directa o inversa) y resuelve el problema.",
    problema: "a) Si 5 obreros construyen un muro en 12 días, ¿cuántos días tardarán 15 obreros en construir el mismo muro?\nb) Un automóvil viaja a 80 km/h y tarda 3 horas en llegar a su destino. Si viaja a 120 km/h, ¿cuánto tiempo tardará?\nc) Un grifo llena un tanque en 4 horas. ¿Cuánto tiempo tardarán 3 grifos iguales trabajando juntos?",
    contexto: "Situaciones de proporcionalidad directa e inversa en contextos laborales y cotidianos.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "a) Más obreros → menos días: proporcionalidad inversa. k = 5 × 12 = 60. Tiempo = 60/15.",
      "b) Mayor velocidad → menos tiempo: proporcionalidad inversa. k = 80 × 3 = 240. Tiempo = 240/120.",
      "c) Más grifos → menos tiempo: proporcionalidad inversa. k = 1 × 4 = 4. Tiempo = 4/3.",
    ],
    respuesta_final: "a) 4 días. b) 2 horas. c) 1 hora y 20 minutos (4/3 horas ≈ 1.33 h).",
  },
  { // P06 — Sistema Internacional y conversiones
    instrucciones: "Convierte las siguientes medidas al sistema indicado y resuelve el problema práctico.",
    problema: "a) Una piscina mide 25 m de largo, 10 m de ancho y 1.8 m de profundidad. ¿Cuántos litros de agua caben? (1 m³ = 1,000 L)\nb) Una persona pesa 68 kg. ¿Cuántos gramos pesa?\nc) Una carrera es de 5 km. ¿Cuántos metros son? ¿Y cuántos centímetros?\nd) Un frasco de medicina tiene 250 mL. ¿Cuántos frascos se necesitan para tener 3 litros?",
    contexto: "Conversiones de unidades del Sistema Internacional en situaciones prácticas diversas.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "a) Volumen = largo × ancho × profundidad = 25 × 10 × 1.8 m³. Luego multiplica por 1,000.",
      "b) 1 kg = 1,000 g. Multiplica 68 × 1,000.",
      "c) 1 km = 1,000 m. 1 m = 100 cm. Convierte en dos pasos.",
      "d) Convierte 3 litros a mL, luego divide entre 250.",
    ],
    respuesta_final: "a) 450,000 litros. b) 68,000 g. c) 5,000 m y 500,000 cm. d) 12 frascos.",
  },
  { // P07 — estimación y razonabilidad
    instrucciones: "Para cada situación, estima mentalmente el resultado y luego verifica si el resultado dado es razonable. Explica tu razonamiento.",
    problema: "a) Un estadio tiene 23 secciones de aproximadamente 480 asientos cada una. Se dice que caben 11,520 personas. ¿Es razonable?\nb) Una tienda vendió 347 productos a $29.90 cada uno. La cajera dice que el total es $103,776.30. ¿Es razonable?\nc) Si divides $1,800 entre 36 personas, cada una debería recibir $500. ¿Es razonable?\nd) Necesitas 8 metros de tela para 4 trajes. Se afirma que para 7 trajes necesitarás 14 metros. ¿Es razonable?",
    contexto: "Verificación de razonabilidad de resultados usando estimación mental y sentido numérico.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "a) Estima: 23 × 500 ≈ 11,500. ¿Coincide con 11,520?",
      "b) Estima: 350 × 30 = 10,500. ¿Coincide con 103,776?",
      "c) Estima: 1,800 ÷ 36 = 50. ¿Coincide con 500?",
      "d) Estima: si 4 trajes necesitan 8 m, cada traje necesita 2 m. 7 × 2 = 14. ¿Coincide?",
    ],
    respuesta_final: "a) Razonable (23 × 480 = 11,040 ≈ 11,520 con variación). b) NO razonable (350 × 30 ≈ 10,500, no 103,776). c) NO razonable (1,800 ÷ 36 = 50, no 500). d) Razonable (7 × 2 = 14 m).",
  },
];

// ── REFLEXIONES (A3) ──────────────────────────────────────────────────────────

const reflexiones = [
  { // P01 — historia y cultura de las matemáticas
    prompt: "Piensa en tres situaciones de tu vida diaria o de tu comunidad donde se usen matemáticas (pueden ser situaciones de trabajo, cocina, comercio, construcción, etc.). Describe cada situación y explica qué tipo de operación o concepto matemático se aplica. ¿Hay alguna situación donde se usen matemáticas de una manera que te sorprendió o no habías notado antes?",
    pistas: ["¿Cómo calcula precios o cambio alguien que vende en el mercado?", "¿Qué matemáticas usa un albañil, un cocinero, un costurero?", "¿Qué matemáticas usas tú sin darte cuenta?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Identifica tres situaciones reales concretas", "Vincula cada situación con un concepto matemático", "Refleja sobre una situación que le sorprendió", "Redacción clara y organizada"],
    formato_esperado: "libre" as const,
  },
  { // P02 — enteros y racionales
    prompt: "Elige un problema real de tu entorno que puedas resolver usando números enteros o racionales (puede ser de economía familiar, temperatura, deudas, medidas de cocina, etc.). Plantea el problema con datos reales o realistas, muestra tu solución paso a paso y explica por qué usaste ese tipo de números.",
    pistas: ["¿Tienes alguna cuenta bancaria, ahorros o deudas que puedas plantear?", "¿Hay cambios de temperatura en tu ciudad que puedas calcular?", "¿Puedes plantear una receta o una división de gastos entre amigos?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Plantea un problema con contexto real claro", "Muestra solución paso a paso con el tipo de número correcto", "Explica por qué ese tipo de número es necesario", "Redacción matemática clara"],
    formato_esperado: "libre" as const,
  },
  { // P03 — razonamiento lógico
    prompt: "Encuentra en las noticias, redes sociales o publicidad un argumento que uses para analizarlo lógicamente. Identifica sus proposiciones, su forma lógica (¿qué conectivos usa?) y determina si el argumento es válido o tiene fallas. Explica si te convenció o no, y por qué.",
    pistas: ["¿Hay argumentos tipo 'si haces X, entonces Y'?", "¿Hay promesas que usen 'si y solo si'?", "¿Hay afirmaciones que combinen condiciones con Y u O?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Identifica las proposiciones del argumento real", "Analiza la estructura lógica con vocabulario correcto", "Emite un juicio fundado sobre la validez del argumento", "Usa vocabulario de lógica proposicional"],
    formato_esperado: "libre" as const,
  },
  { // P04 — fracciones, decimales y porcentajes
    prompt: "Busca en periódicos, redes sociales o en tu entorno tres ejemplos donde se usen porcentajes, fracciones o decimales (pueden ser datos estadísticos, precios, noticias económicas, recetas, etc.). Para cada ejemplo: describe el contexto, indica qué representa el número y calcula o verifica algún dato relacionado.",
    pistas: ["¿Qué porcentajes aparecen en noticias económicas?", "¿Hay etiquetas de alimentos con cantidades en fracciones?", "¿Qué descuentos o tasas de interés puedes encontrar en tiendas?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Describe tres ejemplos concretos del mundo real", "Explica correctamente qué representa el número en cada contexto", "Hace al menos un cálculo o verificación numérica", "Usa vocabulario del tema (fracción, decimal, porcentaje)"],
    formato_esperado: "libre" as const,
  },
  { // P05 — razón y proporción
    prompt: "Identifica en tu entorno una situación real de proporcionalidad directa y una de proporcionalidad inversa. Para cada una: describe la situación, explica por qué es directa o inversa, plantea un problema concreto con números y resuélvelo.",
    pistas: ["¿Qué pasa con el gasto de gasolina cuando aumenta la distancia?", "¿Qué pasa con el tiempo de cocción cuando aumentas la temperatura?", "¿Qué relación hay entre el número de personas que trabajan y el tiempo que tardan?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Identifica correctamente una situación directa y una inversa", "Explica el tipo de proporcionalidad con argumentos", "Plantea y resuelve un problema numérico por cada tipo", "Usa vocabulario correcto (razón, constante de proporcionalidad)"],
    formato_esperado: "libre" as const,
  },
  { // P06 — Sistema Internacional y conversiones
    prompt: "Imagina que eres un científico, médico, ingeniero o chef. Elige una profesión y describe tres situaciones en esa profesión donde convertir unidades correctamente sea crítico. ¿Qué consecuencias podría tener un error de conversión? Incluye un ejemplo de conversión que haría ese profesional.",
    pistas: ["¿Qué pasa si un médico confunde miligramos con gramos en una dosis?", "¿Qué consecuencias tiene confundir metros con centímetros en una construcción?", "¿Qué problemas genera usar libras en vez de kilos en una receta internacional?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Elige una profesión concreta y la describe", "Menciona tres situaciones donde la conversión es crítica", "Explica las consecuencias de un error", "Incluye un ejemplo de conversión correctamente realizado"],
    formato_esperado: "libre" as const,
  },
  { // P07 — estimación y razonabilidad
    prompt: "Describe una situación de tu vida donde hayas tenido que estimar (calcular aproximadamente) sin papel ni calculadora. ¿Cómo lo hiciste? ¿Fue suficientemente preciso? Además, plantea una situación donde NO es suficiente estimar y se requiere exactitud. ¿Por qué en ese caso la estimación no basta?",
    pistas: ["¿Alguna vez calculaste mentalmente si te alcanzaba el dinero en una tienda?", "¿Has estimado el tiempo que tarda un trayecto?", "¿En qué situaciones el error de estimación podría tener consecuencias graves?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Describe una situación real de estimación con estrategia explícita", "Evalúa si la estimación fue suficientemente precisa", "Identifica una situación donde la exactitud es necesaria con justificación", "Reflexión coherente y matemáticamente fundamentada"],
    formato_esperado: "libre" as const,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
