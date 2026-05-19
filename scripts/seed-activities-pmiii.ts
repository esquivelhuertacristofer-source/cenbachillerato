/**
 * Seed de actividades pedagógicas para PM-III (Pensamiento Matemático III).
 * 6 progresiones × 3 actividades = 18 actividades. estado='publicada'.
 * Tipos A1: lectura, lectura, video_con_preguntas, infografia, lectura, video_con_preguntas
 * Tipos A2: ejercicio_matematico (todos)
 * Tipos A3: quiz_multiple_opcion, reflexion_escrita, quiz_multiple_opcion,
 *            autoevaluacion, ejercicio_matematico, reflexion_escrita
 * Uso: npx tsx scripts/seed-activities-pmiii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades PM-III — Pensamiento Matemático III\n");

  const progs = await getProgresionesDeUAC(sb, "PM-III");
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
      descripcion: "Evaluación o reflexión de cierre del propósito formativo.",
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ PM-III: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ──────────────────────────────────────────────────────────────────

const titulos = [
  { a1: "El Teorema de Pitágoras: demostración y aplicaciones", a2: "Calculo distancias reales con el Teorema de Pitágoras", a3: "¿Comprendo el Teorema de Pitágoras y sus usos?" },
  { a1: "Ecuaciones cuadráticas: tres métodos para resolverlas", a2: "Resuelvo una ecuación cuadrática en contexto real", a3: "Ecuaciones cuadráticas en mi entorno cotidiano" },
  { a1: "El discriminante: ¿cuántas soluciones tiene una ecuación?", a2: "Determino el número de soluciones reales usando el discriminante", a3: "¿Sé interpretar el discriminante de una ecuación cuadrática?" },
  { a1: "Perímetros, áreas y volúmenes de figuras cotidianas", a2: "Calculo el volumen de un tanque cilíndrico real", a3: "¿Domino el cálculo de áreas y volúmenes?" },
  { a1: "Semejanza y congruencia de triángulos", a2: "Mido una altura de forma indirecta usando semejanza", a3: "Calculo medidas indirectas en mi comunidad" },
  { a1: "Parábolas: vértice, ceros y eje de simetría", a2: "Analizo la trayectoria de un tiro parabólico", a3: "Las parábolas explican el mundo que me rodea" },
];

const tiposA1 = ["lectura", "lectura", "video_con_preguntas", "infografia", "lectura", "video_con_preguntas"] as const;
const tiposA3 = ["quiz_multiple_opcion", "reflexion_escrita", "quiz_multiple_opcion", "autoevaluacion", "ejercicio_matematico", "reflexion_escrita"] as const;

// ── CONTENIDOS A1 ─────────────────────────────────────────────────────────────

const contenidosA1 = [
  { // P01 — lectura — Teorema de Pitágoras
    texto: `El Teorema de Pitágoras es uno de los resultados más importantes y bellos de la geometría. Establece que en todo triángulo rectángulo la suma de los cuadrados de los catetos es igual al cuadrado de la hipotenusa: a² + b² = c², donde c es la hipotenusa (el lado opuesto al ángulo recto).\n\nLa demostración más sencilla utiliza cuatro triángulos rectángulos iguales. Si los organizamos dentro de un cuadrado de lado (a+b), notamos que el área total del cuadrado grande puede calcularse de dos formas: como (a+b)² o como c² más el área de los cuatro triángulos (4 × ab/2 = 2ab). Al igualar: a² + 2ab + b² = c² + 2ab, lo que nos da directamente a² + b² = c².\n\nLos triples pitagóricos son conjuntos de tres enteros positivos que satisfacen la relación: 3-4-5 (9+16=25), 5-12-13 (25+144=169) y 8-15-17 son los más conocidos. Cualquier múltiplo de un triple pitagórico también lo es: 6-8-10, 9-12-15, etc.\n\nLas aplicaciones del teorema son enormes. En construcción, se usa para verificar que los ángulos sean rectos (los albañiles estiran una cuerda con nudos en las proporciones 3-4-5). En navegación y GPS, se calcula la distancia entre dos puntos. En topografía, se mide la altura de montañas o edificios sin llegar hasta ellos. En arquitectura e ingeniería, está en cada diseño que involucre ángulos rectos y diagonales.`,
    fuente: "Material elaborado para CEN Bachillerato — PM-III",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 10,
    preguntas_comprension: [
      { pregunta: "¿Qué establece el Teorema de Pitágoras?", respuesta_guia: "Que en un triángulo rectángulo, la suma de los cuadrados de los catetos es igual al cuadrado de la hipotenusa: a² + b² = c²." },
      { pregunta: "¿Qué son los triples pitagóricos? Da dos ejemplos.", respuesta_guia: "Son conjuntos de tres enteros que satisfacen a² + b² = c². Ejemplos: 3-4-5 y 5-12-13." },
      { pregunta: "Menciona dos aplicaciones reales del Teorema de Pitágoras.", respuesta_guia: "En construcción para verificar ángulos rectos, en navegación/GPS para calcular distancias, en topografía para medir alturas, entre otras." },
      { pregunta: "¿Por qué si 3-4-5 es un triple pitagórico, también lo es 6-8-10?", respuesta_guia: "Porque al multiplicar cada elemento por 2, la relación a² + b² = c² se mantiene: 36 + 64 = 100." },
    ],
  },
  { // P02 — lectura — Ecuaciones cuadráticas
    texto: `Una ecuación cuadrática es una ecuación polinomial de grado dos con la forma general ax² + bx + c = 0, donde a ≠ 0. Estas ecuaciones aparecen en física (movimiento de proyectiles), economía (optimización de ganancias), arquitectura (diseño de arcos) y muchos otros campos.\n\nExisten tres métodos principales para resolver ecuaciones cuadráticas:\n\n**1. Factorización.** Si la ecuación puede escribirse como un producto de dos binomios, la solución se obtiene igualando cada factor a cero. Por ejemplo, x² - 5x + 6 = 0 se factoriza como (x-2)(x-3) = 0, de modo que x = 2 o x = 3. Este método es rápido cuando la ecuación factoriza con enteros, pero no siempre es posible.\n\n**2. Completar el cuadrado.** Consiste en transformar ax² + bx + c = 0 en la forma (x + h)² = k y luego aplicar raíz cuadrada. Por ejemplo: x² + 6x + 5 = 0 → x² + 6x = -5 → x² + 6x + 9 = 4 → (x+3)² = 4 → x = -3 ± 2. Este método siempre funciona y sirve de base para derivar la fórmula general.\n\n**3. Fórmula general (cuadrática).** Es la herramienta universal: x = (-b ± √(b² - 4ac)) / 2a. Funciona para cualquier ecuación cuadrática. La expresión b² - 4ac bajo la raíz se llama discriminante y determina cuántas soluciones reales existen, como veremos en el siguiente propósito.`,
    fuente: "Material elaborado para CEN Bachillerato — PM-III",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      { pregunta: "¿Qué forma tiene la ecuación cuadrática general?", respuesta_guia: "ax² + bx + c = 0, donde a ≠ 0." },
      { pregunta: "¿Cuáles son los tres métodos para resolver ecuaciones cuadráticas?", respuesta_guia: "Factorización, completar el cuadrado y la fórmula general (cuadrática)." },
      { pregunta: "¿Cuándo conviene usar factorización y cuándo es mejor usar la fórmula general?", respuesta_guia: "Factorización es más rápida cuando los factores son enteros fáciles. La fórmula general funciona siempre, incluso cuando la factorización no es evidente." },
      { pregunta: "¿Qué es el discriminante y dónde aparece en la fórmula general?", respuesta_guia: "Es la expresión b² - 4ac que está bajo el signo de raíz en la fórmula. Determina el número de soluciones reales." },
    ],
  },
  { // P03 — video_con_preguntas — El discriminante
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "El discriminante: ¿cuántas raíces tiene una parábola?",
    descripcion_video: "Explicación del discriminante Δ = b² - 4ac y sus tres casos: Δ > 0 (dos raíces reales distintas, la parábola corta la recta en dos puntos), Δ = 0 (raíz doble, la parábola es tangente al eje x), Δ < 0 (raíces complejas, la parábola no cruza el eje x). Se muestra la relación entre el valor del discriminante y la posición de la gráfica de la función cuadrática. Incluye ejemplos numéricos y contextuales.",
    duracion_segundos: 510,
    subtitulos_disponibles: true,
    preguntas: [
      { tiempo_segundos: 100, pregunta: "¿Qué valor debe tener el discriminante para que la ecuación cuadrática tenga dos soluciones reales distintas?", tipo: "abierta" as const },
      { tiempo_segundos: 280, pregunta: "Si Δ = 0, ¿cómo se relaciona la parábola con el eje x? ¿Cuántas raíces tiene?", tipo: "abierta" as const },
      { tiempo_segundos: 420, pregunta: "¿Qué significa geométricamente que Δ < 0? ¿Puede una situación real producir ese resultado?", tipo: "abierta" as const },
      { tiempo_segundos: 490, pregunta: "Sin resolver la ecuación 2x² - 4x + 3 = 0, ¿cuántas raíces reales tiene? Justifica usando el discriminante.", tipo: "abierta" as const },
    ],
  },
  { // P04 — infografia — Perímetros, áreas y volúmenes
    titulo: "Fórmulas esenciales de áreas y volúmenes",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía con las fórmulas de perímetro y área de figuras planas (cuadrado, rectángulo, triángulo, círculo, trapecio) y las fórmulas de volumen y área lateral de sólidos (prisma rectangular, cilindro, pirámide, cono, esfera). Incluye un diagrama de cada figura con sus variables etiquetadas.",
    puntos_clave: [
      "Rectángulo: P = 2(b+h), A = b·h",
      "Círculo: C = 2πr, A = πr²",
      "Triángulo: P = a+b+c, A = (b·h)/2",
      "Cilindro: V = πr²h, A_lateral = 2πrh",
      "Prisma rectangular: V = l·w·h, A_total = 2(lw + lh + wh)",
      "Cono: V = (1/3)πr²h",
      "Esfera: V = (4/3)πr³, A = 4πr²",
    ],
    fuente: "Material CEN Bachillerato — PM-III",
    actividad_post: "Escoge un objeto cotidiano que tenga forma geométrica (una lata, una caja, una pelota) y estima sus dimensiones. Aplica la fórmula correspondiente para calcular su volumen o área superficial.",
  },
  { // P05 — lectura — Semejanza y congruencia de triángulos
    texto: `Dos figuras son **congruentes** si tienen exactamente la misma forma y el mismo tamaño (los lados y ángulos correspondientes son iguales). Dos figuras son **semejantes** si tienen la misma forma pero distinto tamaño: los ángulos correspondientes son iguales y los lados correspondientes son proporcionales, con una razón de semejanza k.\n\nPara los triángulos existen criterios que permiten establecer congruencia o semejanza sin necesidad de conocer todos los elementos:\n\n**Criterios de congruencia:** LLL (Lado-Lado-Lado: los tres pares de lados son iguales), LAL (Lado-Ángulo-Lado: dos lados y el ángulo comprendido), ALA (Ángulo-Lado-Ángulo: dos ángulos y el lado comprendido).\n\n**Criterios de semejanza:** AA (dos pares de ángulos iguales), LLL proporcional (los tres pares de lados son proporcionales), LAL proporcional (dos pares de lados proporcionales y el ángulo comprendido igual).\n\nLa razón de semejanza k es el cociente entre lados correspondientes. Si k = 3, el triángulo grande tiene sus lados 3 veces más largos que el triángulo pequeño. Las áreas se relacionan con k² y los volúmenes con k³.\n\nLa **medición indirecta** es una aplicación práctica: si no podemos medir directamente la altura de un árbol, un poste o un edificio, podemos usar las sombras que proyectan. Si nuestra sombra mide 1.5 m y nuestra estatura es 1.65 m, y el árbol proyecta una sombra de 8 m, el árbol mide 1.65 × (8/1.5) = 8.8 m. Esto funciona porque el sol forma triángulos semejantes.`,
    fuente: "Material elaborado para CEN Bachillerato — PM-III",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 11,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la diferencia entre figuras congruentes y figuras semejantes?", respuesta_guia: "Las congruentes tienen la misma forma y tamaño; las semejantes tienen la misma forma pero distinto tamaño, con lados proporcionales." },
      { pregunta: "Menciona dos criterios de congruencia de triángulos.", respuesta_guia: "LLL (tres lados iguales), LAL (dos lados y el ángulo comprendido), ALA (dos ángulos y el lado comprendido)." },
      { pregunta: "¿Qué es la razón de semejanza y cómo se relaciona con las áreas?", respuesta_guia: "Es el cociente k entre lados correspondientes. Las áreas se relacionan con k²." },
      { pregunta: "¿Cómo permite la semejanza de triángulos medir una altura de forma indirecta?", respuesta_guia: "Usando la proporción entre las sombras de un objeto conocido y del objeto a medir, ya que el sol forma triángulos semejantes." },
    ],
  },
  { // P06 — video_con_preguntas — Parábolas
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Parábolas: vértice, ceros y eje de simetría",
    descripcion_video: "Introducción a la función cuadrática y=ax²+bx+c y su representación gráfica (la parábola). Se explica cómo identificar el vértice (punto máximo o mínimo), el eje de simetría (x = -b/2a), los ceros o raíces (donde la parábola cruza el eje x) y el significado del coeficiente 'a' (dirección de apertura). Se trabajan las formas estándar y factorizada, y se aplican a contextos de tiro parabólico y optimización.",
    duracion_segundos: 570,
    subtitulos_disponibles: true,
    preguntas: [
      { tiempo_segundos: 120, pregunta: "¿Qué determina si una parábola abre hacia arriba o hacia abajo?", tipo: "abierta" as const },
      { tiempo_segundos: 300, pregunta: "¿Cómo se calcula la coordenada x del vértice a partir de los coeficientes a y b?", tipo: "abierta" as const },
      { tiempo_segundos: 450, pregunta: "¿Qué son los ceros de una función cuadrática y cómo se relacionan con la parábola?", tipo: "abierta" as const },
      { tiempo_segundos: 540, pregunta: "Si una parábola representa la altura de un proyectil, ¿qué representa el vértice en ese contexto físico?", tipo: "abierta" as const },
    ],
  },
];

// ── EJERCICIOS (A2) ───────────────────────────────────────────────────────────

const ejercicios = [
  { // P01 — Teorema de Pitágoras: contexto construcción
    problema: "Un ingeniero civil necesita verificar que una rampa de acceso para personas con discapacidad esté bien construida. La rampa tiene una longitud horizontal de 4.8 m y sube una altura de 0.6 m.\n(a) ¿Cuál es la longitud real de la superficie inclinada de la rampa?\n(b) Si la norma exige que la relación altura/longitud horizontal no supere 1/8, ¿cumple esta rampa con la norma?\n(c) Un poste de luz cercano proyecta una sombra diagonal en el plano del suelo. Si la base del poste está a 9 m de un punto de referencia y la punta de la sombra está a 15 m, ¿a qué altura (en línea recta sobre el suelo) está la punta de la sombra respecto al mismo punto de referencia?",
    contexto: "El Teorema de Pitágoras se usa en ingeniería civil para calcular longitudes inclinadas, verificar ángulos y garantizar que las construcciones cumplan estándares de seguridad y accesibilidad.",
    tipo_respuesta: "numerica" as const,
    pasos_guia: [
      "(a) Identifica los catetos: horizontal = 4.8 m, vertical = 0.6 m. Aplica c² = a² + b².",
      "(a) Calcula: c² = (4.8)² + (0.6)² = 23.04 + 0.36 = 23.4. Obtén c = √23.4.",
      "(b) Calcula la relación 0.6/4.8 y compara con 1/8 = 0.125.",
      "(c) Los valores 9 y 15 te recuerdan el triple 3-4-5 multiplicado por 3: verifica si 9² + x² = 15² y despeja x.",
    ],
    respuesta_final: "(a) c ≈ 4.84 m; (b) 0.6/4.8 ≈ 0.125 = 1/8, cumple exactamente; (c) x = √(225 - 81) = √144 = 12 m",
    tolerancia_error: 0.05,
    unidades: "metros",
  },
  { // P02 — Ecuaciones cuadráticas: área de terreno
    problema: "Un agricultor tiene un terreno rectangular cuya longitud es 5 metros más que el doble del ancho. El área total del terreno es 133 m².\n(a) Plantea la ecuación cuadrática que modela el problema (usa w para el ancho).\n(b) Resuélvela usando la fórmula general.\n(c) ¿Cuáles son las dimensiones reales del terreno? Descarta las soluciones no físicas.\n(d) Verifica tu respuesta calculando el área con las dimensiones encontradas.",
    contexto: "Las ecuaciones cuadráticas modelan situaciones donde el área, el volumen o la trayectoria dependen del cuadrado de una variable. En este caso, las dimensiones de un terreno generan una ecuación de segundo grado.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "Define la variable: sea w el ancho (en metros). Entonces la longitud es 2w + 5.",
      "Plantea la ecuación de área: w·(2w + 5) = 133 → 2w² + 5w - 133 = 0.",
      "Identifica a = 2, b = 5, c = -133. Calcula el discriminante: b² - 4ac = 25 + 1064 = 1089.",
      "Aplica la fórmula: w = (-5 ± √1089) / 4 = (-5 ± 33) / 4.",
      "Obtén las dos raíces y descarta la negativa (el ancho no puede ser negativo).",
    ],
    respuesta_final: "w = 7 m (ancho), l = 19 m (longitud). Verificación: 7 × 19 = 133 m².",
    tolerancia_error: 0,
    unidades: "metros",
  },
  { // P03 — Discriminante: diseño de proyectil
    problema: "Una empresa de pirotecnia modela la altura (en metros) de un cohete con la función h(t) = -5t² + 30t + 10, donde t es el tiempo en segundos.\n(a) Calcula el discriminante de la ecuación -5t² + 30t + 10 = 0. ¿Cuántas veces toca el suelo el cohete?\n(b) ¿A qué tiempo(s) alcanza el cohete exactamente 55 m de altura? Plantea y resuelve la ecuación correspondiente e interpreta el discriminante.\n(c) ¿Puede el cohete alcanzar 100 m de altura? Justifica con el discriminante sin resolver la ecuación completa.",
    contexto: "El discriminante es una herramienta de análisis previo: permite saber cuántas soluciones reales tendrá un problema antes de resolverlo completamente, lo que es útil en ingeniería y diseño.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) Ecuación al tocar el suelo: h(t) = 0 → -5t² + 30t + 10 = 0. Identifica a = -5, b = 30, c = 10.",
      "(a) Calcula Δ = b² - 4ac = 900 - 4(-5)(10) = 900 + 200 = 1100 > 0 → dos raíces reales, pero solo la positiva es física.",
      "(b) h(t) = 55 → -5t² + 30t + 10 = 55 → -5t² + 30t - 45 = 0 → t² - 6t + 9 = 0. Δ = 36 - 36 = 0 → raíz doble: t = 3 s.",
      "(c) h(t) = 100 → -5t² + 30t - 90 = 0 → t² - 6t + 18 = 0. Δ = 36 - 72 = -36 < 0 → no alcanza 100 m.",
    ],
    respuesta_final: "(a) Δ = 1100 > 0, el cohete toca el suelo una vez (raíz positiva). (b) t = 3 s (raíz doble, toca los 55 m exactamente en el vértice). (c) No puede alcanzar 100 m porque Δ < 0.",
    tolerancia_error: 0,
    unidades: "metros y segundos",
  },
  { // P04 — Áreas y volúmenes: tanque cilíndrico
    problema: "Una comunidad rural construirá un tanque de almacenamiento de agua con forma cilíndrica. El radio de la base es 1.5 m y la altura es 3.2 m. El tanque tiene tapa superior e inferior.\n(a) Calcula el volumen de agua que puede almacenar el tanque (en m³ y en litros; 1 m³ = 1 000 litros).\n(b) Calcula el área total de la lámina de metal necesaria para construirlo (base, tapa y cuerpo lateral).\n(c) Si el metal cuesta $280 por m², ¿cuánto costará la lámina? Da el resultado redondeado al peso más cercano.",
    contexto: "El cálculo de volúmenes y áreas es fundamental en ingeniería civil, arquitectura y planificación comunitaria. Diseñar sistemas de almacenamiento requiere dominar estas fórmulas con precisión.",
    tipo_respuesta: "numerica" as const,
    pasos_guia: [
      "(a) Volumen del cilindro: V = πr²h. Sustituye r = 1.5 m y h = 3.2 m.",
      "(a) Convierte m³ a litros multiplicando por 1 000.",
      "(b) Área lateral: A_lat = 2πrh. Dos bases circulares: A_bases = 2πr². Área total = A_lat + A_bases.",
      "(c) Costo = Área total × $280 por m².",
    ],
    respuesta_final: "(a) V = π(1.5)²(3.2) ≈ 22.62 m³ ≈ 22 619 litros. (b) A_lat = 2π(1.5)(3.2) ≈ 30.16 m²; A_bases = 2π(1.5)² ≈ 14.14 m²; A_total ≈ 44.30 m². (c) Costo ≈ $12 404.",
    tolerancia_error: 0.5,
    unidades: "m³, litros, m², pesos",
  },
  { // P05 — Semejanza: medición indirecta de altura
    problema: "Sofía quiere conocer la altura de la torre del reloj de su pueblo. En un momento del día, Sofía (estatura = 1.60 m) proyecta una sombra de 0.80 m, mientras que la torre proyecta una sombra de 12.40 m sobre el suelo.\n(a) Establece la proporción usando triángulos semejantes y calcula la altura de la torre.\n(b) Si la razón de semejanza entre el triángulo de la torre y el de Sofía es k, ¿cuánto mide k?\n(c) Si la base del monumento que está junto a la torre proyecta una sombra de 3.2 m al mismo instante, ¿qué altura tiene el monumento?",
    contexto: "La semejanza de triángulos permite medir objetos o distancias inaccesibles usando solo proporciones y medidas indirectas. Esta técnica fue usada por los egipcios y griegos antiguos, y sigue siendo útil en topografía, arquitectura y fotografía.",
    tipo_respuesta: "numerica" as const,
    pasos_guia: [
      "(a) Los triángulos formados por Sofía y su sombra, y por la torre y su sombra, son semejantes (mismo ángulo del sol).",
      "(a) Plantea la proporción: altura_torre / sombra_torre = altura_Sofía / sombra_Sofía.",
      "(a) Sustituye: H / 12.40 = 1.60 / 0.80 → H = 1.60 × (12.40 / 0.80).",
      "(b) k = sombra_torre / sombra_Sofía = 12.40 / 0.80.",
      "(c) Usa la misma razón: H_monumento / 3.2 = 1.60 / 0.80 → H_monumento = k × 1.60.",
    ],
    respuesta_final: "(a) H = 24.8 m. (b) k = 15.5. (c) H_monumento = 6.4 m.",
    tolerancia_error: 0.1,
    unidades: "metros",
  },
  { // P06 — Parábolas: tiro parabólico
    problema: "Un balón de fútbol es pateado desde el suelo y describe una trayectoria modelada por h(x) = -0.04x² + 1.2x, donde h es la altura en metros y x es la distancia horizontal en metros.\n(a) ¿A qué distancia horizontal el balón alcanza su altura máxima? ¿Cuál es esa altura máxima?\n(b) ¿A qué distancia horizontal el balón vuelve a tocar el suelo (aparte del punto de inicio)?\n(c) Si la portería está a 25 m de distancia horizontal y el travesaño está a 2.44 m de altura, ¿entra el gol? (Calcula h(25) y compara.)\n(d) ¿Cuál es el eje de simetría de la parábola?",
    contexto: "Las funciones cuadráticas modelan trayectorias de proyectiles en física y deportes. El vértice representa el punto más alto y los ceros representan los puntos donde el proyectil toca el suelo.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) El vértice tiene coordenada x = -b/(2a). Con a = -0.04 y b = 1.2: x_v = -1.2 / (2 × -0.04).",
      "(a) Sustituye x_v en h(x) para obtener la altura máxima.",
      "(b) Los ceros: -0.04x² + 1.2x = 0 → x(-0.04x + 1.2) = 0 → x = 0 o x = 30.",
      "(c) Calcula h(25) = -0.04(625) + 1.2(25) = -25 + 30 = 5. Compara 5 m > 2.44 m.",
      "(d) El eje de simetría es la recta vertical x = x_v.",
    ],
    respuesta_final: "(a) x_v = 15 m, h_max = 9 m. (b) El balón toca el suelo a x = 30 m. (c) h(25) = 5 m > 2.44 m → sí entra el gol. (d) Eje de simetría: x = 15.",
    tolerancia_error: 0,
    unidades: "metros",
  },
];

// ── CONTENIDOS A3 ─────────────────────────────────────────────────────────────

const contenidosA3 = [
  { // P01 — quiz_multiple_opcion — Teorema de Pitágoras
    preguntas: [
      {
        enunciado: "En un triángulo rectángulo con catetos de 6 cm y 8 cm, ¿cuánto mide la hipotenusa?",
        opciones: ["10 cm", "12 cm", "14 cm", "√28 cm"],
        respuesta_correcta: 0,
        retroalimentacion: "6² + 8² = 36 + 64 = 100 = 10². La respuesta es 10 cm. Es el triple pitagórico 6-8-10 (múltiplo de 3-4-5).",
      },
      {
        enunciado: "¿Cuál de los siguientes conjuntos es un triple pitagórico?",
        opciones: ["4, 6, 8", "5, 12, 13", "6, 7, 10", "3, 5, 7"],
        respuesta_correcta: 1,
        retroalimentacion: "5² + 12² = 25 + 144 = 169 = 13². Solo el conjunto 5-12-13 cumple la relación a² + b² = c².",
      },
      {
        enunciado: "Una escalera de 5 m de largo se apoya en una pared. Si la base está a 3 m de la pared, ¿a qué altura llega la escalera?",
        opciones: ["2 m", "3 m", "4 m", "√34 m"],
        respuesta_correcta: 2,
        retroalimentacion: "h² = 5² - 3² = 25 - 9 = 16 → h = 4 m. Corresponde al triple 3-4-5.",
      },
      {
        enunciado: "El Teorema de Pitágoras aplica únicamente a...",
        opciones: ["Cualquier triángulo", "Triángulos isósceles", "Triángulos rectángulos", "Triángulos equiláteros"],
        respuesta_correcta: 2,
        retroalimentacion: "El teorema establece que a² + b² = c² solo en triángulos que tienen un ángulo recto (90°). Para triángulos arbitrarios se usa la Ley de Cosenos.",
      },
      {
        enunciado: "Si la hipotenusa mide 17 cm y uno de los catetos mide 8 cm, ¿cuánto mide el otro cateto?",
        opciones: ["9 cm", "13 cm", "15 cm", "√225 cm"],
        respuesta_correcta: 2,
        retroalimentacion: "b² = 17² - 8² = 289 - 64 = 225 → b = 15 cm. Es el triple pitagórico 8-15-17.",
      },
      {
        enunciado: "Un punto A está en coordenadas (0,0) y un punto B en coordenadas (5,12). ¿Cuál es la distancia entre A y B?",
        opciones: ["17 unidades", "13 unidades", "√119 unidades", "10 unidades"],
        respuesta_correcta: 1,
        retroalimentacion: "Distancia = √(5² + 12²) = √(25 + 144) = √169 = 13 unidades. La fórmula de distancia es una aplicación directa del Teorema de Pitágoras.",
      },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: true,
  },
  { // P02 — reflexion_escrita — Ecuaciones cuadráticas
    prompt: "Las ecuaciones cuadráticas describen situaciones del mundo real donde algo crece al cuadrado: el área de una figura que se amplía, la trayectoria de un objeto que cae, el rendimiento que aumenta de forma cuadrática. Elige una situación de tu vida o de tu comunidad (puede ser en agricultura, construcción, comercio o deportes) y describe cómo se podría modelar con una ecuación cuadrática. ¿Qué variable sería la incógnita? ¿Cuál sería el significado del resultado? ¿Cuál de los tres métodos de resolución (factorización, completar el cuadrado o fórmula general) preferirías usar y por qué?",
    pistas: [
      "Piensa en situaciones donde el área es lo que se busca: cercar un terreno, diseñar una sala, cultivar un huerto.",
      "En física: la distancia de caída libre es proporcional al cuadrado del tiempo (d = ½gt²).",
      "¿Hay precios o tarifas en tu comunidad que dependan de una cantidad al cuadrado?",
      "No necesitas resolver la ecuación: lo importante es describir la situación y justificar tu elección de método.",
    ],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: [
      "Describe una situación real concreta y creíble",
      "Identifica correctamente la incógnita y plantea al menos la forma general de la ecuación",
      "Justifica la elección del método de resolución con argumentos matemáticos",
      "Reflexiona sobre el significado del resultado en el contexto elegido",
    ],
    formato_esperado: "libre" as const,
  },
  { // P03 — quiz_multiple_opcion — Discriminante
    preguntas: [
      {
        enunciado: "¿Cuál es el valor del discriminante de la ecuación 2x² - 3x + 5 = 0?",
        opciones: ["Δ = -31", "Δ = 49", "Δ = 31", "Δ = 9"],
        respuesta_correcta: 0,
        retroalimentacion: "Δ = b² - 4ac = (-3)² - 4(2)(5) = 9 - 40 = -31. Como Δ < 0, la ecuación no tiene raíces reales.",
      },
      {
        enunciado: "Si Δ = 0, la ecuación cuadrática tiene...",
        opciones: ["Dos raíces reales distintas", "Una raíz doble real", "Dos raíces complejas", "Infinitas soluciones"],
        respuesta_correcta: 1,
        retroalimentacion: "Cuando el discriminante es cero, la fórmula da x = -b/(2a), que es un único valor. Se llama raíz doble porque aparece dos veces en la factorización: a(x - r)².",
      },
      {
        enunciado: "Para la ecuación x² - 6x + 9 = 0, ¿qué describe mejor su situación con el eje x?",
        opciones: ["La parábola corta al eje x en dos puntos distintos", "La parábola es tangente al eje x (un solo punto de contacto)", "La parábola no intersecta al eje x", "La parábola es el eje x"],
        respuesta_correcta: 1,
        retroalimentacion: "Δ = 36 - 36 = 0. Con raíz doble, la parábola toca el eje x en exactamente un punto: el vértice. La factorización es (x-3)² = 0.",
      },
      {
        enunciado: "¿Para qué valores de k la ecuación x² + kx + 9 = 0 tiene dos raíces reales distintas?",
        opciones: ["|k| < 6", "|k| = 6", "|k| > 6", "k = 0"],
        respuesta_correcta: 2,
        retroalimentacion: "Para dos raíces reales distintas se necesita Δ > 0: k² - 4(1)(9) > 0 → k² > 36 → |k| > 6.",
      },
      {
        enunciado: "Una empresa modela su ganancia con G(x) = -2x² + 8x - 10, donde x es la cantidad producida. ¿Hay algún nivel de producción donde la ganancia sea cero?",
        opciones: ["Sí, en x = 2 y x = 4", "Sí, en x = 2 (raíz doble)", "No, porque Δ < 0", "Sí, en x = 5"],
        respuesta_correcta: 2,
        retroalimentacion: "Δ = 64 - 4(-2)(-10) = 64 - 80 = -16 < 0. La ecuación no tiene raíces reales, lo que significa que la ganancia nunca es cero: siempre es negativa (la empresa siempre pierde).",
      },
      {
        enunciado: "¿Cuál es la relación entre el discriminante y la gráfica de una función cuadrática?",
        opciones: [
          "Δ > 0 significa que la parábola abre hacia arriba",
          "Δ determina cuántas veces la parábola cruza o toca el eje x",
          "Δ indica la posición del vértice en el eje y",
          "Δ solo sirve cuando la ecuación tiene soluciones enteras",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El discriminante determina el número de intersecciones con el eje x: dos puntos si Δ > 0, un punto (tangente) si Δ = 0, ninguno si Δ < 0. La apertura depende del signo de a, no de Δ.",
      },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: true,
  },
  { // P04 — autoevaluacion — Perímetros, áreas y volúmenes
    instrucciones: "Evalúa tu nivel de dominio en el cálculo de medidas de figuras geométricas planas y sólidas.",
    criterios: [
      {
        descripcion: "Identifico y aplico correctamente las fórmulas de área de figuras planas",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Confundo las fórmulas o no recuerdo cuándo aplicar cada una." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Aplico correctamente las fórmulas básicas (rectángulo, triángulo) pero cometo errores en círculo o trapecio." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Aplico las fórmulas de las principales figuras sin errores." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Aplico todas las fórmulas y puedo derivarlas o explicar su origen." },
        ],
      },
      {
        descripcion: "Calculo volúmenes de sólidos (cilindro, prisma, cono, esfera) con precisión",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No domino las fórmulas de volumen." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Calculo correctamente el volumen de cilindros y prismas pero tengo dificultad con cono y esfera." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Calculo el volumen de los principales sólidos con pocos errores." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Calculo volúmenes y áreas superficiales de todos los sólidos, y resuelvo problemas compuestos." },
        ],
      },
      {
        descripcion: "Resuelvo problemas contextualizados que requieren cálculo de área o volumen",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No sé cuál fórmula aplicar en un problema de palabras." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Identifico la figura y la fórmula, pero cometo errores al sustituir o convertir unidades." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Resuelvo problemas contextualizados de área y volumen con pasos claros." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Resuelvo problemas complejos (objetos compuestos, conversión de unidades, costos) sin errores." },
        ],
      },
      {
        descripcion: "Comprendo la diferencia entre perímetro, área y volumen y sus unidades",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Confundo los tres conceptos y sus unidades (m, m², m³)." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Entiendo la diferencia conceptual pero a veces uso unidades incorrectas." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Distingugo claramente perímetro (m), área (m²) y volumen (m³) y los uso bien." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Explico con ejemplos la diferencia y la razón de las unidades al cuadrado y al cubo." },
        ],
      },
    ],
    reflexion_final_prompt: "¿Qué tipo de figura geométrica te resulta más difícil de trabajar? ¿Qué estrategia usarás para memorizar y entender mejor sus fórmulas?",
    visible_para_docente: true,
  },
  { // P05 — ejercicio_matematico — Semejanza: medición indirecta complementaria
    problema: "Durante una excursión, el grupo de Mateo quiere estimar la altura de un árbol sin escalarlo. Mateo tiene 1.72 m de estatura y en ese momento proyecta una sombra de 1.08 m. El árbol proyecta una sombra de 6.48 m sobre el suelo.\n(a) Calcula la altura del árbol usando semejanza de triángulos.\n(b) ¿Cuál es la razón de semejanza k entre el triángulo del árbol y el de Mateo?\n(c) Si hubiera un arbusto cercano con una sombra de 2.16 m al mismo instante, ¿qué altura tiene el arbusto?\n(d) Si la razón de semejanza entre áreas de triángulos semejantes es k², ¿cuántas veces mayor es el área del triángulo del árbol que el de Mateo?",
    contexto: "La semejanza de triángulos es la base matemática de la medición indirecta. Esta técnica es utilizada en cartografía, fotografía, astronomía (para calcular la distancia a estrellas) y en la vida cotidiana para estimar alturas.",
    tipo_respuesta: "numerica" as const,
    pasos_guia: [
      "(a) Plantea la proporción: H_árbol / sombra_árbol = H_Mateo / sombra_Mateo.",
      "(a) Sustituye: H / 6.48 = 1.72 / 1.08 → H = 1.72 × (6.48 / 1.08).",
      "(b) k = sombra_árbol / sombra_Mateo = 6.48 / 1.08.",
      "(c) H_arbusto / 2.16 = 1.72 / 1.08 → H_arbusto = k × 1.72 / 1 — O directamente: k_arbusto = 2.16/1.08, H = k_arbusto × 1.72.",
      "(d) Relación de áreas = k² (donde k es la razón de semejanza del inciso b).",
    ],
    respuesta_final: "(a) H = 1.72 × 6 = 10.32 m. (b) k = 6. (c) H_arbusto = 2 × 1.72 = 3.44 m. (d) Las áreas se relacionan como k² = 36; el triángulo del árbol tiene 36 veces el área del de Mateo.",
    tolerancia_error: 0.05,
    unidades: "metros",
  },
  { // P06 — reflexion_escrita — Parábolas en el mundo real
    prompt: "Las parábolas están en muchos lugares de la vida cotidiana y de la naturaleza: la trayectoria de un balón, el arco de un puente, la forma de una antena parabólica, la curva del agua que sale de una manguera. Elige uno de estos contextos (u otro que conozcas) y reflexiona: ¿qué representa el vértice en ese contexto?, ¿qué representan los ceros de la función?, ¿hacia dónde abre la parábola y qué significa eso físicamente? Describe también si ese conocimiento podría ser útil para alguien en tu comunidad y de qué manera.",
    pistas: [
      "El vértice representa un punto extremo: la altura máxima de un proyectil, el punto más bajo de un cable colgante.",
      "Los ceros son los puntos donde la función vale cero: donde el proyectil toca el suelo, donde el arco apoya en los pilares.",
      "Si a > 0 la parábola abre hacia arriba (mínimo); si a < 0 abre hacia abajo (máximo).",
      "Piensa en personas de tu comunidad que diseñan, construyen o proyectan trayectorias en su trabajo.",
    ],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: [
      "Elige un contexto real y lo describe con precisión",
      "Interpreta correctamente el significado del vértice y los ceros en ese contexto",
      "Explica la apertura de la parábola y su significado físico o práctico",
      "Reflexiona sobre la utilidad del concepto para su comunidad con argumentos concretos",
    ],
    formato_esperado: "libre" as const,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
