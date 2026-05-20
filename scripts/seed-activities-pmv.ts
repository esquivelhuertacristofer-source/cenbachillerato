/**
 * Seed de actividades pedagógicas para PM-V (Pensamiento Matemático V — Cálculo Diferencial, Semestre 5).
 * 8 propósitos × 3 actividades = 24 actividades. estado='publicada'.
 * Tipos: lectura, video_con_preguntas, ejercicio_matematico, quiz_multiple_opcion,
 *        reflexion_escrita, autoevaluacion, infografia
 * Uso: npx tsx scripts/seed-activities-pmv.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades PM-V — Cálculo Diferencial\n");

  const progs = await getProgresionesDeUAC(sb, "PM-V");
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
      descripcion: "Práctica principal del propósito formativo.",
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
      descripcion: "Cierre y aplicación del propósito formativo.",
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ PM-V: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ──────────────────────────────────────────────────────────────────

const titulos = [
  {
    a1: "¿Qué es un límite? Intuición gráfica y algebraica",
    a2: "Calculando límites: del límite básico al 0/0 indeterminado",
    a3: "¿Cuánto sabes sobre límites?",
  },
  {
    a1: "Continuidad y discontinuidad: cuándo una función 'no se rompe'",
    a2: "Analizando discontinuidades: evitable, salto y esencial",
    a3: "Reflexión: continuidad en física — ¿por qué importa que las funciones sean continuas?",
  },
  {
    a1: "La derivada: pendiente instantánea y tasa de cambio",
    a2: "Derivando desde la definición: el cociente de Newton",
    a3: "¿Cuánto sabes sobre derivadas e interpretación geométrica?",
  },
  {
    a1: "Reglas de derivación: potencia, producto, cociente y cadena",
    a2: "Ejercicios de derivación con todas las reglas",
    a3: "Autoevaluación: ¿domino las reglas de derivación?",
  },
  {
    a1: "Derivadas de funciones trascendentes: seno, coseno, eˣ y ln",
    a2: "Calculando derivadas de funciones trigonométricas y exponenciales",
    a3: "Reflexión: ¿por qué eˣ es su propia derivada?",
  },
  {
    a1: "Máximos, mínimos e inflexión: el análisis completo de una función",
    a2: "Análisis completo de función: encontrando extremos e inflexión",
    a3: "¿Cuánto sabes sobre análisis de funciones con derivada?",
  },
  {
    a1: "Optimización con derivada: encontrar el mejor valor posible",
    a2: "Resolviendo problemas de optimización en contextos reales",
    a3: "Autoevaluación: ¿puedo resolver problemas de optimización?",
  },
  {
    a1: "Diferenciales y aproximaciones lineales: cálculo rápido sin calculadora",
    a2: "Aplicando diferenciales para estimar errores y valores",
    a3: "Reflexión: ¿cómo se relacionan la derivada y la integral a través del diferencial?",
  },
];

const tiposA1 = ["lectura", "infografia", "lectura", "lectura", "lectura", "infografia", "lectura", "lectura"] as const;
const tiposA2 = ["ejercicio_matematico", "ejercicio_matematico", "ejercicio_matematico", "ejercicio_matematico", "ejercicio_matematico", "ejercicio_matematico", "ejercicio_matematico", "ejercicio_matematico"] as const;
const tiposA3 = ["quiz_multiple_opcion", "reflexion_escrita", "quiz_multiple_opcion", "autoevaluacion", "reflexion_escrita", "quiz_multiple_opcion", "autoevaluacion", "reflexion_escrita"] as const;

// ── CONTENIDOS A1 ─────────────────────────────────────────────────────────────

const contenidosA1 = [
  { // P01 — lectura — Límites: intuición gráfica y algebraica
    titulo: "¿Qué es un límite? Intuición gráfica y algebraica",
    texto: `La idea de límite es la piedra angular de todo el cálculo diferencial e integral. Aunque su formalización rigurosa llegó con Cauchy y Weierstrass en el siglo XIX, la intuición que la sustenta es sencilla: ¿a qué valor se acerca una función cuando su variable de entrada se aproxima a un punto determinado, sin llegar a él?\n\nImagina un automóvil recorriendo la autopista México-Querétaro. En cada instante, el velocímetro muestra una velocidad; esa velocidad es la tasa de cambio instantánea de la posición. Pero si solo conocemos la posición en dos momentos distintos, podemos calcular la velocidad promedio en ese intervalo. El límite nos permite llevar esa idea al extremo: ¿qué pasa cuando el intervalo de tiempo se hace infinitamente pequeño? La respuesta es la velocidad instantánea, y esa respuesta es un límite.\n\n**Definición intuitiva.** Decimos que el límite de f(x) cuando x se acerca a a es L, y lo escribimos:\n\nlim(x→a) f(x) = L\n\nsi los valores f(x) se acercan arbitrariamente a L conforme x se acerca a a (por la izquierda o por la derecha), sin importar si f está definida o no en x = a. La clave es el acercamiento, no la llegada.\n\n**Cálculo por sustitución directa.** Para funciones polinomiales y racionales donde el denominador no se anula, el límite se calcula simplemente sustituyendo:\n\nlim(x→3) (x² + 2x - 1) = 3² + 2(3) - 1 = 9 + 6 - 1 = 14\n\n**Formas indeterminadas y factorización.** Cuando la sustitución produce 0/0, la fracción no está definida pero el límite puede existir. La técnica consiste en factorizar y cancelar el factor que se anula:\n\nlim(x→2) (x² - 4)/(x - 2) = lim(x→2) [(x+2)(x-2)]/(x-2) = lim(x→2) (x+2) = 4\n\n**El límite notable lim(x→0) sen(x)/x = 1.** Este resultado, que se demuestra geométricamente con el círculo unitario, es fundamental para derivar funciones trigonométricas. Aunque sen(0)/0 es una forma indeterminada, el límite vale exactamente 1. Esto explica por qué para ángulos pequeños (en radianes), sen(x) ≈ x, aproximación usada en ingeniería y física.\n\n**Límites al infinito y asíntotas horizontales.** Cuando x crece sin cota:\n\nlim(x→∞) 1/x = 0\n\nlim(x→∞) (3x² + 5)/(x² - 1) = 3 (el grado del numerador y denominador es igual; el límite es el cociente de los coeficientes líderes)\n\nEsta idea conecta directamente con las asíntotas horizontales de una función racional: la recta y = L es asíntota horizontal si lim(x→±∞) f(x) = L.\n\n**Ejemplo con contexto real.** Un auto en la Ciudad de México sale del punto de referencia en el km 0 de la autopista a las 8:00 a.m. Su posición en kilómetros está dada por s(t) = 80t (t en horas). La velocidad promedio en cualquier intervalo es siempre 80 km/h. Pero si la función de posición fuera s(t) = 3t² + 5t, la velocidad promedio entre t=1 y t=1+h sería [s(1+h) - s(1)]/h. Al calcular el límite cuando h→0, obtenemos la velocidad instantánea en t=1, que es la derivada de s en ese punto. Esta conexión entre límite y derivada es el corazón del cálculo diferencial.\n\nDominar el concepto de límite requiere práctica con los tres casos: sustitución directa, factorización cuando hay indeterminación, y reconocimiento de límites notables. Con estas herramientas estarás listo para comprender la derivada como un límite particular.`,
    fuente: "Material elaborado para CEN Bachillerato — PM-V. Referencias: MCCEMS 2025, Stewart Calculus 8ª ed.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 14,
    preguntas_comprension: [
      {
        pregunta: "¿Qué significa, en términos intuitivos, que lim(x→a) f(x) = L?",
        respuesta_guia: "Significa que los valores f(x) se acercan arbitrariamente al número L conforme x se aproxima a a, sin importar si f(a) está definida. La clave es el acercamiento de x a a, no que x llegue a valer a.",
      },
      {
        pregunta: "¿Por qué la forma 0/0 se llama 'indeterminada' y cómo se resuelve en el caso de lim(x→2) (x²-4)/(x-2)?",
        respuesta_guia: "Se llama indeterminada porque la expresión no tiene valor definido en el punto pero el límite puede existir. Se resuelve factorizando: (x²-4) = (x+2)(x-2), se cancela (x-2) y queda lim(x→2)(x+2) = 4.",
      },
      {
        pregunta: "¿Cuál es el valor del límite notable lim(x→0) sen(x)/x y para qué sirve en física e ingeniería?",
        respuesta_guia: "El límite vale 1. Sirve para justificar la aproximación sen(x) ≈ x para ángulos pequeños en radianes, que se usa en péndulos de pequeña oscilación, óptica paraxial y diseño de estructuras donde los ángulos de deflexión son pequeños.",
      },
      {
        pregunta: "¿Cómo se relaciona el límite con el concepto de velocidad instantánea?",
        respuesta_guia: "La velocidad promedio en un intervalo [t, t+h] es [s(t+h)-s(t)]/h. La velocidad instantánea es el límite de ese cociente cuando h→0. Este proceso de tomar el límite del cociente diferencial es precisamente la definición de la derivada.",
      },
    ],
  },
  { // P02 — infografia — Continuidad y tipos de discontinuidad
    titulo: "Continuidad y sus tipos de discontinuidad",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía con 4 paneles: (1) definición de continuidad en un punto (3 condiciones), (2) discontinuidad evitable/removible con su gráfica, (3) discontinuidad de salto con su gráfica, (4) discontinuidad esencial con su gráfica.",
    puntos_clave: [
      "Una función f es continua en x = a si y solo si se cumplen las 3 condiciones simultáneamente: (1) f(a) está definida (existe); (2) lim(x→a) f(x) existe (los límites lateral izquierdo y derecho son iguales); (3) lim(x→a) f(x) = f(a) (el límite coincide con el valor de la función). Si alguna condición falla, hay discontinuidad en x = a.",
      "Discontinuidad evitable (removible): el límite lim(x→a) f(x) = L existe pero f(a) no está definida o f(a) ≠ L. Se llama 'evitable' porque se puede 'reparar' redefiniendo f(a) = L. Ejemplo: f(x) = (x²-4)/(x-2) tiene una discontinuidad evitable en x=2 porque el límite vale 4 pero f(2) no está definida. Gráfica: la función tiene un 'hoyo' (punto hueco) en x = a.",
      "Discontinuidad de salto: los límites laterales existen pero son distintos: lim(x→a⁻) f(x) ≠ lim(x→a⁺) f(x). La función 'salta' de un valor a otro en x = a. No puede repararse redefiniendo un punto. Ejemplo: la función parte entera (piso) salta en cada entero. Gráfica: se ve un 'escalón' en x = a con dos puntos en distintos niveles.",
      "Discontinuidad esencial (inevitable): al menos uno de los límites laterales no existe o es infinito. Incluye asíntotas verticales (lim = ±∞) y oscilaciones infinitas. Ejemplo: f(x) = 1/x tiene una discontinuidad esencial en x = 0 porque los límites son +∞ y -∞. Ejemplo: f(x) = sen(1/x) oscila infinitamente cerca de x = 0 sin converger a ningún valor.",
      "El Teorema del Valor Intermedio (TVI): si f es continua en [a, b] y N es cualquier valor entre f(a) y f(b), entonces existe al menos un c ∈ (a, b) tal que f(c) = N. Consecuencia práctica: si f(a) y f(b) tienen signos opuestos, la ecuación f(x) = 0 tiene al menos una raíz en (a, b). Este teorema es la base de métodos numéricos para encontrar raíces como la bisección.",
      "Importancia en física e ingeniería: la continuidad garantiza la existencia de ciertos valores y la previsibilidad del comportamiento. Una función de temperatura continua no puede 'saltar' de 20°C a 100°C sin pasar por todos los valores intermedios. Una discontinuidad en la función de corriente eléctrica de un hospital sería catastrófica. Los modelos físicos razonables exigen continuidad, y cuando aparece una discontinuidad en un modelo matemático, suele indicar una simplificación excesiva o un cambio de régimen físico.",
    ],
    fuente: "PM-V MCCEMS 2025 — Cálculo diferencial.",
  },
  { // P03 — lectura — La derivada: pendiente instantánea y tasa de cambio
    titulo: "La derivada: pendiente instantánea y tasa de cambio",
    texto: `¿Cómo describe la matemática algo que cambia en un instante? Esta pregunta, que obsesionó a Newton y Leibniz en el siglo XVII, tiene una respuesta precisa: la derivada. Comprender la derivada es comprender el cambio.\n\n**El problema motivador: velocidad instantánea.** Imagina un proyectil lanzado verticalmente. Su altura en metros sobre el suelo, en función del tiempo t (en segundos), es h(t) = -5t² + 30t. La velocidad promedio entre t = 1 y t = 2 es:\n\n[h(2) - h(1)] / (2 - 1) = [(-5·4 + 60) - (-5 + 30)] / 1 = [40 - 25] / 1 = 15 m/s\n\nPero ¿cuál es la velocidad exacta en el instante t = 1? Para saberlo, calculamos la velocidad promedio en el intervalo [1, 1+h] y luego tomamos el límite cuando h→0.\n\n**El cociente de Newton (cociente diferencial).** Para una función f(x), el cociente diferencial es:\n\n[f(x+h) - f(x)] / h\n\nEste cociente representa la pendiente de la recta secante que pasa por los puntos (x, f(x)) y (x+h, f(x+h)) de la curva. Cuando h→0, la recta secante se convierte en la recta tangente a la curva en el punto (x, f(x)), y su pendiente es la derivada:\n\nf'(x) = lim(h→0) [f(x+h) - f(x)] / h\n\n**Interpretación geométrica.** La derivada f'(a) es la pendiente de la recta tangente a la gráfica de f en el punto (a, f(a)). Una pendiente positiva significa que la función crece en ese punto; una pendiente negativa, que decrece; una pendiente cero señala un posible máximo, mínimo o punto de inflexión.\n\n**Ejemplo concreto: derivada de f(x) = x² desde la definición.**\n\nf'(x) = lim(h→0) [(x+h)² - x²] / h\n     = lim(h→0) [x² + 2xh + h² - x²] / h\n     = lim(h→0) [2xh + h²] / h\n     = lim(h→0) [2x + h]\n     = 2x\n\nAsí, la pendiente de la parábola y = x² en cualquier punto x es 2x. En x = 1, la tangente tiene pendiente 2; en x = 3, tiene pendiente 6.\n\n**Notaciones.** Existen varias notaciones equivalentes para la derivada, cada una con su utilidad:\n- f'(x): notación de Lagrange, práctica para funciones nombradas\n- dy/dx: notación de Leibniz, enfatiza la relación entre variables y es útil en cálculo integral\n- D[f]: notación de operador\n\n**Interpretación física: posición, velocidad y aceleración.** Si s(t) es la función de posición de un objeto, entonces:\n- s'(t) = v(t) es la velocidad (primera derivada de posición)\n- v'(t) = s''(t) = a(t) es la aceleración (segunda derivada de posición)\n\nEsta cadena de derivadas es fundamental en mecánica clásica. Las Leyes de Newton (F = ma) están escritas en lenguaje de derivadas: la fuerza es masa por la segunda derivada de la posición respecto al tiempo.\n\n**Derivabilidad y continuidad.** Si f es derivable en x = a, entonces f también es continua en x = a. El recíproco no es verdadero: f(x) = |x| es continua en x = 0 pero no derivable allí (la gráfica tiene un 'pico' angular con dos tangentes distintas por la izquierda y la derecha).\n\nComprender la derivada como un límite del cociente diferencial es el fundamento sobre el cual se construyen todas las reglas de derivación que aprenderemos en los siguientes propósitos.`,
    fuente: "Material elaborado para CEN Bachillerato — PM-V. Referencias: MCCEMS 2025, Apostol Calculus Vol. I.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 15,
    preguntas_comprension: [
      {
        pregunta: "¿Qué es el cociente de Newton y qué representa geométricamente?",
        respuesta_guia: "El cociente de Newton es [f(x+h) - f(x)] / h. Geométricamente, representa la pendiente de la recta secante que une dos puntos de la curva: (x, f(x)) y (x+h, f(x+h)). Cuando h→0, la secante se convierte en la tangente y el cociente converge a la derivada.",
      },
      {
        pregunta: "¿Qué significa que f'(a) = 0 en términos de la gráfica de f?",
        respuesta_guia: "Significa que la recta tangente a la gráfica de f en x = a es horizontal (pendiente cero). Esto ocurre en máximos locales, mínimos locales y ciertos puntos de inflexión. No significa automáticamente que hay un extremo: hay que analizar el signo de f' en el entorno del punto.",
      },
      {
        pregunta: "Calcula la derivada de f(x) = x² en x = 3 usando la definición. ¿Qué significa ese valor?",
        respuesta_guia: "f'(3) = 2·3 = 6. Significa que la pendiente de la recta tangente a la parábola y = x² en el punto (3, 9) es 6. También significa que en ese instante la función crece a razón de 6 unidades en y por cada unidad en x.",
      },
      {
        pregunta: "Si s(t) = -5t² + 30t modela la altura de un proyectil, ¿cuál es su velocidad en t = 3 s?",
        respuesta_guia: "La velocidad es la derivada: s'(t) = -10t + 30. En t = 3: s'(3) = -30 + 30 = 0 m/s. Esto significa que el proyectil está en su punto más alto en t = 3 s (velocidad cero = máximo de altura).",
      },
    ],
  },
  { // P04 — lectura — Reglas de derivación
    titulo: "Reglas de derivación: potencia, producto, cociente y cadena",
    texto: `Calcular la derivada desde la definición es tedioso para funciones complicadas. Por eso los matemáticos desarrollaron reglas que permiten derivar cualquier función algebraica de forma eficiente. Estas reglas son consecuencia directa de la definición de derivada como límite.\n\n**Regla de la potencia.** Para cualquier exponente real n:\n\nd/dx [xⁿ] = n·xⁿ⁻¹\n\nEjemplos:\n- d/dx [x⁵] = 5x⁴\n- d/dx [x⁻²] = -2x⁻³ = -2/x³\n- d/dx [√x] = d/dx [x^(1/2)] = (1/2)x^(-1/2) = 1/(2√x)\n- d/dx [c] = 0 para cualquier constante c (la función constante no cambia)\n\nCombinando con linealidad: d/dx [af(x) + bg(x)] = af'(x) + bg'(x)\n\n**Regla del producto.** Si f y g son derivables:\n\nd/dx [f(x)·g(x)] = f'(x)·g(x) + f(x)·g'(x)\n\nEjemplo: deriva h(x) = (x² + 1)(3x - 2)\n- f = x² + 1, f' = 2x\n- g = 3x - 2, g' = 3\n- h' = 2x·(3x-2) + (x²+1)·3 = 6x² - 4x + 3x² + 3 = 9x² - 4x + 3\n\nError común: NO es cierto que (fg)' = f'g'. La regla del producto tiene dos términos.\n\n**Regla del cociente.** Si g(x) ≠ 0:\n\nd/dx [f(x)/g(x)] = [f'(x)·g(x) - f(x)·g'(x)] / [g(x)]²\n\nMnemotecnia: 'numerador derivado por denominador, menos numerador por denominador derivado, todo sobre denominador al cuadrado'.\n\nEjemplo: deriva h(x) = (x²+1)/(x-1)\n- f = x²+1, f' = 2x\n- g = x-1, g' = 1\n- h' = [2x·(x-1) - (x²+1)·1] / (x-1)²\n     = [2x² - 2x - x² - 1] / (x-1)²\n     = (x² - 2x - 1) / (x-1)²\n\n**Regla de la cadena.** Para funciones compuestas f(g(x)):\n\nd/dx [f(g(x))] = f'(g(x))·g'(x)\n\nEn palabras: 'derivada de la función exterior evaluada en la interior, por derivada de la interior'.\n\nEjemplo: deriva k(x) = (2x³ + 1)⁴\n- Función exterior: u⁴, su derivada es 4u³\n- Función interior: u = 2x³ + 1, su derivada es 6x²\n- k'(x) = 4(2x³+1)³ · 6x² = 24x²(2x³+1)³\n\n**Tabla resumen de reglas básicas.**\n\n| Función | Derivada |\n|---|---|\n| c (constante) | 0 |\n| xⁿ | nxⁿ⁻¹ |\n| cf(x) | cf'(x) |\n| f(x) ± g(x) | f'(x) ± g'(x) |\n| f(x)·g(x) | f'g + fg' |\n| f(x)/g(x) | (f'g - fg')/g² |\n| f(g(x)) | f'(g(x))·g'(x) |\n\nEstas cuatro reglas —potencia, producto, cociente, cadena— son suficientes para derivar cualquier función racional o algebraica. Las funciones trascendentes (trigonométricas, exponenciales, logarítmicas) requieren sus propias fórmulas base, pero la cadena sigue siendo la herramienta para componerlas.`,
    fuente: "Material elaborado para CEN Bachillerato — PM-V. Referencia: MCCEMS 2025.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 13,
    preguntas_comprension: [
      {
        pregunta: "¿Cuál es la derivada de f(x) = 4x³ - 5x + 7 y qué reglas usaste?",
        respuesta_guia: "f'(x) = 12x² - 5. Se usa la regla de la potencia para cada término (d/dx[4x³]=12x², d/dx[-5x]=-5, d/dx[7]=0) y la linealidad de la derivada.",
      },
      {
        pregunta: "¿En qué se diferencia la regla del producto de simplemente multiplicar las derivadas? ¿Por qué (fg)' ≠ f'g'?",
        respuesta_guia: "La regla del producto es (fg)' = f'g + fg', no f'g'. Se puede verificar con el ejemplo simple f=x, g=x: (fg)' = (x²)' = 2x, pero f'g' = 1·1 = 1 ≠ 2x. La derivada del producto tiene dos términos porque ambas funciones están cambiando simultáneamente.",
      },
      {
        pregunta: "Identifica la función exterior e interior en k(x) = (2x³+1)⁴ y aplica la regla de la cadena.",
        respuesta_guia: "Función exterior: u⁴ (con u siendo la función interior). Función interior: u = 2x³+1. Por la cadena: k'(x) = 4(2x³+1)³ · 6x² = 24x²(2x³+1)³.",
      },
    ],
  },
  { // P05 — lectura — Derivadas de funciones trascendentes
    titulo: "Derivadas de funciones trascendentes: seno, coseno, eˣ y ln",
    texto: `Las funciones trascendentes —trigonométricas, exponenciales y logarítmicas— aparecen en los modelos más importantes de la ciencia y la ingeniería. Conocer sus derivadas abre la puerta a modelar oscilaciones, crecimiento, decaimiento y flujo de calor.\n\n**Derivadas de funciones trigonométricas.**\n\nUsando la definición de derivada y el límite notable lim(x→0) sen(x)/x = 1, se demuestran:\n\nd/dx [sen x] = cos x\nd/dx [cos x] = -sen x\nd/dx [tan x] = sec²x\n\nObserva la elegancia del par seno-coseno: la derivada del seno es el coseno, y la del coseno es el seno negativo. Si derivas el seno cuatro veces, vuelves al seno. Esta propiedad de periodicidad de las derivadas explica por qué las funciones trigonométricas describen perfectamente las oscilaciones: un péndulo, una onda sonora, una corriente alterna.\n\nEjemplo con la cadena: d/dx[sen(3x)] = cos(3x) · 3 = 3cos(3x)\n\n**La derivada de eˣ: la función que es su propia derivada.**\n\nd/dx [eˣ] = eˣ\n\nEste resultado extraordinario establece que la función exponencial natural eˣ (donde e ≈ 2.71828...) es la única función (salvo multiplicar por constante) que es igual a su propia derivada. Esta propiedad la hace ideal para modelar cualquier proceso donde la tasa de cambio es proporcional al estado actual:\n\n- Crecimiento bacteriano: la tasa de reproducción es proporcional al número actual de bacterias → modelo N(t) = N₀eᵏᵗ\n- Decaimiento radioactivo: la tasa de desintegración es proporcional a la cantidad de material → modelo M(t) = M₀e⁻ᵏᵗ\n- Descarga de un condensador en un circuito eléctrico\n- Disipación de calor en un objeto (Ley de Newton de enfriamiento)\n\nEjemplo con la cadena: d/dx[e^(2x)] = e^(2x) · 2 = 2e^(2x)\n\n**La derivada del logaritmo natural.**\n\nd/dx [ln x] = 1/x   (para x > 0)\n\nObserva que ln x toma una función trascendente y produce una función racional simple. Esto hace que el logaritmo sea una herramienta poderosa para simplificar cálculos. La derivación logarítmica (tomar ln antes de derivar) facilita derivar productos y cocientes complicados.\n\nEjemplo con la cadena: d/dx[ln(x² + 1)] = 1/(x²+1) · 2x = 2x/(x²+1)\n\n**Aplicación: decaimiento radioactivo y péndulo.**\n\nEl decaimiento del Carbono-14 se modela con C(t) = C₀e^(-0.000121t), donde t está en años. La tasa de decaimiento en cualquier instante es:\nC'(t) = -0.000121 · C₀e^(-0.000121t) = -0.000121 · C(t)\n\nEsto confirma que la tasa de decaimiento es proporcional a la cantidad presente: un hecho verificado experimentalmente que la derivada de eˣ captura perfectamente.\n\nUn péndulo de longitud L (para oscilaciones pequeñas) sigue θ(t) = A·cos(ωt + φ), donde ω = √(g/L). La velocidad angular es θ'(t) = -Aω·sen(ωt + φ), que confirma el patrón derivada del coseno es menos el seno.\n\n**Tabla resumen.**\n\n| Función | Derivada |\n|---|---|\n| sen x | cos x |\n| cos x | -sen x |\n| tan x | sec²x |\n| eˣ | eˣ |\n| aˣ | aˣ·ln a |\n| ln x | 1/x |\n| logₐ x | 1/(x·ln a) |`,
    fuente: "Material elaborado para CEN Bachillerato — PM-V. Referencia: MCCEMS 2025.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 14,
    preguntas_comprension: [
      {
        pregunta: "¿Cuáles son las derivadas de sen x, cos x y tan x? ¿Qué patrón observas si derivas el seno cuatro veces consecutivas?",
        respuesta_guia: "d/dx[sen x] = cos x; d/dx[cos x] = -sen x; d/dx[tan x] = sec²x. Si derivas sen x cuatro veces: sen→cos→-sen→-cos→sen. Vuelves al seno original. Este ciclo de periodo 4 refleja la naturaleza oscilatoria de estas funciones.",
      },
      {
        pregunta: "¿Por qué eˣ es especial entre todas las funciones exponenciales?",
        respuesta_guia: "Porque es la única función (salvo múltiplos constantes) que es igual a su propia derivada: d/dx[eˣ] = eˣ. Esto significa que la tasa de cambio de eˣ en cada punto es exactamente el valor de la función en ese punto, propiedad que modela procesos donde el cambio es proporcional al estado actual.",
      },
      {
        pregunta: "Usa la regla de la cadena para calcular d/dx[e^(3x²)].",
        respuesta_guia: "Función exterior: eᵘ con derivada eᵘ. Función interior: u = 3x², con derivada 6x. Por la cadena: d/dx[e^(3x²)] = e^(3x²) · 6x = 6x·e^(3x²).",
      },
    ],
  },
  { // P06 — infografia — Análisis completo de una función con la derivada
    titulo: "Cómo analizar completamente una función con derivada",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía paso a paso para el análisis completo de una función: (1) dominio, (2) interceptos, (3) primera derivada → crecimiento/decrecimiento y extremos, (4) segunda derivada → concavidad e inflexión, (5) asíntotas, (6) gráfica final.",
    puntos_clave: [
      "Paso 1 — Dominio: determina para qué valores de x está definida la función. Excluye denominadores cero, radicales de negativos y logaritmos de no positivos. El dominio marca el escenario donde vive la función.",
      "Paso 2 — Interceptos: calcula la intersección con el eje y (evalúa f(0) si 0 está en el dominio) y con el eje x (resuelve f(x) = 0). Los interceptos dan puntos ancla para la gráfica.",
      "Paso 3 — Primera derivada f'(x): calcula f'(x), iguala a cero y determina los puntos críticos (f'(x) = 0 o f' no existe). Analiza el signo de f' en intervalos: si f' > 0 la función crece; si f' < 0 decrece. Los extremos locales ocurren donde f' cambia de signo: positivo→negativo es un máximo local; negativo→positivo es un mínimo local.",
      "Paso 4 — Segunda derivada f''(x): calcula f''(x). Si f''(x) > 0 la gráfica es cóncava hacia arriba (concavidad positiva, forma de taza). Si f''(x) < 0 es cóncava hacia abajo. Los puntos de inflexión ocurren donde f'' cambia de signo. Criterio de la segunda derivada: si f'(c) = 0 y f''(c) > 0, entonces c es mínimo local; si f''(c) < 0, es máximo local; si f''(c) = 0, la prueba no es concluyente.",
      "Paso 5 — Asíntotas: verticales donde f no está definida (denominador cero); horizontales con lim(x→±∞) f(x); oblicuas cuando el grado del numerador supera en 1 al del denominador.",
      "Paso 6 — Gráfica final: con todos los datos anteriores (dominio, interceptos, puntos críticos, extremos, inflexiones, asíntotas, crecimiento, concavidad) traza una gráfica cualitativa precisa sin necesitar tabla extensa de valores. Este análisis completo es la base del diseño de ingeniería, economía y física.",
    ],
    fuente: "PM-V MCCEMS 2025 — Cálculo diferencial.",
  },
  { // P07 — lectura — Optimización con derivada
    titulo: "Optimización con derivada: encontrar el mejor valor posible",
    texto: `Una de las aplicaciones más poderosas y directas del cálculo diferencial es la optimización: encontrar el valor máximo o mínimo de una función en un contexto dado. Desde la ingeniería hasta la economía, desde la biología hasta la logística, la derivada nos permite determinar el "mejor" valor posible.\n\n**Metodología general.**\n\n1. Identificar la función objetivo: ¿qué se quiere maximizar o minimizar?\n2. Expresar esa función en términos de una sola variable usando las restricciones del problema.\n3. Calcular la derivada e igualar a cero para encontrar los puntos críticos.\n4. Verificar si cada punto crítico es máximo o mínimo (usando la segunda derivada o el criterio de la primera derivada).\n5. Evaluar también los extremos del dominio (si es un intervalo cerrado).\n6. Interpretar el resultado en el contexto del problema con unidades.\n\n**Ejemplo de ingeniería: diseño de una caja de máximo volumen.**\n\nSe quiere construir una caja rectangular abierta por arriba (sin tapa) usando 300 cm² de cartón. Si la base es cuadrada con lado x y la altura es h, se busca maximizar el volumen.\n\nRestricción de área: área total = base + 4 caras laterales = x² + 4xh = 300\nDespejando h: h = (300 - x²) / (4x)\n\nFunción objetivo (volumen): V(x) = x² · h = x² · (300 - x²)/(4x) = x(300 - x²)/4 = 75x - x³/4\n\nDerivando e igualando a cero:\nV'(x) = 75 - 3x²/4 = 0 → 3x²/4 = 75 → x² = 100 → x = 10 cm\nh = (300 - 100)/(4·10) = 200/40 = 5 cm\nV_máx = 10² · 5 = 500 cm³\n\nVerificación con segunda derivada: V''(x) = -6x/4 < 0 para x > 0 → confirma máximo.\n\n**Ejemplo de economía: maximizar la ganancia.**\n\nUna empresa tiene ingresos I(q) = 50q - 0.5q² y costos C(q) = 10q + 200. La ganancia es:\nG(q) = I(q) - C(q) = 40q - 0.5q² - 200\nG'(q) = 40 - q = 0 → q* = 40 unidades\n\nEsto equivale al principio económico: ingreso marginal (I'(q) = 50 - q) = costo marginal (C'(q) = 10) → q = 40.\n\n**Contexto mexicano: empaques industriales.**\n\nEmpresas mexicanas como Gruma (productora de MASECA) y Bimbo optimizan constantemente el diseño de sus empaques. Un kilogramo de harina en bolsa rectangular o una caja de pan de caja deben minimizar el material de empaque (costo de plástico o cartón) mientras contienen un volumen fijo de producto. Este es exactamente el problema matemático de optimización que acabamos de resolver. Un ingeniero de empaques en Monterrey o Toluca aplica cálculo diferencial para diseñar la caja óptima que reduce el material en centavos por unidad — lo que a escala de millones de cajas al día representa ahorros millonarios.\n\nLa optimización con derivada no solo resuelve problemas abstractos: es el lenguaje matemático de la eficiencia industrial y ambiental.`,
    fuente: "Material elaborado para CEN Bachillerato — PM-V. Referencia: MCCEMS 2025, Stewart Calculus.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 15,
    preguntas_comprension: [
      {
        pregunta: "¿Cuáles son los 6 pasos de la metodología de optimización con derivada?",
        respuesta_guia: "(1) Identificar qué se maximiza o minimiza. (2) Expresar la función objetivo en una sola variable usando las restricciones. (3) Derivar e igualar a cero para encontrar puntos críticos. (4) Verificar si es máximo o mínimo con la segunda derivada o cambio de signo de f'. (5) Evaluar los extremos del dominio. (6) Interpretar el resultado con unidades en el contexto real.",
      },
      {
        pregunta: "En el ejemplo de la caja, ¿por qué hay una restricción y cómo se usa para reducir variables?",
        respuesta_guia: "La restricción es la cantidad fija de cartón (300 cm²): área base + 4 caras = x² + 4xh = 300. Esta ecuación nos permite despejar h en términos de x: h = (300-x²)/(4x). Así el volumen, que originalmente dependía de dos variables (x y h), queda como función de una sola variable V(x), que ya podemos maximizar con la derivada.",
      },
      {
        pregunta: "¿Cómo se relaciona el principio económico 'ingreso marginal = costo marginal' con la derivada?",
        respuesta_guia: "La ganancia G = I - C se maximiza cuando G' = 0, es decir cuando I' = C' (ingreso marginal = costo marginal). Las derivadas del ingreso y del costo son precisamente las funciones de ingreso marginal y costo marginal en economía. Maximizar la ganancia es un problema de cálculo diferencial.",
      },
    ],
  },
  { // P08 — lectura — Diferenciales y aproximaciones lineales
    titulo: "Diferenciales y aproximaciones lineales: cálculo rápido sin calculadora",
    texto: `Cuando Newton y Leibniz desarrollaron el cálculo, una de sus herramientas conceptuales más productivas fue la noción de diferencial: un cambio infinitesimalmente pequeño en una variable. Hoy, el diferencial nos da una técnica práctica y elegante para estimar valores de funciones complicadas sin necesidad de calculadora.\n\n**El diferencial dy.**\n\nSi y = f(x) es una función derivable, el diferencial dy se define como:\n\ndy = f'(x) · dx\n\ndonde dx es un cambio arbitrario (no necesariamente infinitesimal) en x. El diferencial dy es la aproximación lineal del cambio real Δy = f(x + Δx) - f(x).\n\n**Diferencia geométrica entre Δy y dy.**\n\nSea P = (x, f(x)) un punto de la curva. Si x cambia en Δx:\n- Δy = cambio real en y: se sube o baja por la curva hasta (x+Δx, f(x+Δx))\n- dy = cambio aproximado: se sube o baja por la recta tangente en P hasta (x+Δx, y+dy)\n\nPara Δx pequeño, la tangente es casi indistinguible de la curva y dy ≈ Δy. Para Δx grande, la aproximación empeora porque la tangente se aleja de la curva.\n\n**Linealización: L(x) = f(a) + f'(a)(x - a).**\n\nLa aproximación lineal de f cerca del punto x = a es:\n\nL(x) = f(a) + f'(a)(x - a)\n\nEsta es la ecuación de la recta tangente a f en x = a, usada como aproximación local de la función.\n\n**Ejemplo: estimar √(4.02) sin calculadora.**\n\nUsamos f(x) = √x con punto base a = 4 (raíz cuadrada exacta conocida).\n- f(4) = 2\n- f'(x) = 1/(2√x), entonces f'(4) = 1/4\n- L(x) = 2 + (1/4)(x - 4)\n- L(4.02) = 2 + (1/4)(0.02) = 2 + 0.005 = 2.005\n\nEl valor real es √4.02 ≈ 2.00499..., una excelente aproximación.\n\n**Propagación de errores en mediciones físicas.**\n\nSi medimos el lado L de un cubo con error ±ΔL, el error en el volumen V = L³ se estima con el diferencial:\n\ndV = 3L² dL\n\nSi L = 10 cm y ΔL = 0.1 cm:\ndV = 3(100)(0.1) = 30 cm³\n\nEsto significa que un error de ±0.1 cm en la medición del lado produce un error de aproximadamente ±30 cm³ en el volumen calculado. Los ingenieros y físicos usan esta técnica —llamada propagación de incertidumbre— para establecer tolerancias en el diseño de piezas mecánicas, instrumentos de medición y procesos de manufactura.\n\n**Puente hacia la integral.** El diferencial dy = f'(x)dx no solo aproxima cambios: también es el símbolo fundamental del cálculo integral. La integral ∫f(x)dx se puede interpretar como la suma de infinitos diferenciales f(x)dx, cada uno representando el área de una franja infinitesimalmente delgada bajo la curva. Así, el diferencial es el puente conceptual entre la derivada y la integral, y dominar esta idea te prepara para el cálculo integral del siguiente semestre.`,
    fuente: "Material elaborado para CEN Bachillerato — PM-V. Referencia: MCCEMS 2025.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      {
        pregunta: "¿Cuál es la diferencia geométrica entre Δy y dy? ¿Cuándo es buena la aproximación dy ≈ Δy?",
        respuesta_guia: "Δy es el cambio real en la función al moverse por la curva; dy es el cambio aproximado al moverse por la recta tangente. La aproximación dy ≈ Δy es buena cuando Δx es pequeño, porque para valores pequeños de Δx la tangente y la curva son casi indistinguibles.",
      },
      {
        pregunta: "¿Cómo se estima √(9.04) usando la linealización? Indica el punto base y el cálculo.",
        respuesta_guia: "Usamos f(x)=√x con a=9. f(9)=3, f'(x)=1/(2√x), f'(9)=1/6. L(x)=3+(1/6)(x-9). L(9.04)=3+(1/6)(0.04)=3+0.00667≈3.0067. El valor real es √9.04≈3.00666..., excelente aproximación.",
      },
      {
        pregunta: "¿Cómo se usa el diferencial para estimar el error en el volumen de una esfera si el radio tiene una incertidumbre ΔR?",
        respuesta_guia: "V = (4/3)πR³, entonces dV = 4πR² dR. Si el radio tiene incertidumbre ΔR, el error estimado en el volumen es ΔV ≈ dV = 4πR²·ΔR. Esto multiplica el error del radio por el área de la esfera 4πR².",
      },
    ],
  },
];

// ── CONTENIDOS A2 ─────────────────────────────────────────────────────────────

const contenidosA2 = [
  { // P01 — ejercicio_matematico — Límites: sustitución, factorización, límite notable
    problema: "Un automóvil en la autopista México-Querétaro tiene como función de posición s(t) = 3t² + 5t (en km, con t en horas).\n\n(a) Calcula lim(t→2) s(t)/t. Interpreta el resultado.\n(b) Resuelve la indeterminación: lim(x→3) (x² - 9)/(x - 3).\n(c) Estima lim(x→0) sen(2x)/x usando el límite notable lim(x→0) sen(x)/x = 1.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) Calcula s(2) = 3(4) + 5(2) = 12 + 10 = 22 km. Entonces s(2)/2 = 22/2 = 11 km/h. Interpretación: es la velocidad promedio del auto desde t=0 hasta t=2 horas.",
      "(b) Sustituye x=3: (9-9)/(3-3) = 0/0 — forma indeterminada. Factoriza el numerador: x²-9 = (x+3)(x-3). Cancela (x-3): lim(x→3) (x+3) = 3+3 = 6.",
      "(c) Reescribe: sen(2x)/x = 2 · [sen(2x)/(2x)]. Cuando x→0, también 2x→0, entonces lim(2x→0)[sen(2x)/(2x)] = 1. Por lo tanto lim(x→0) sen(2x)/x = 2·1 = 2.",
      "Verificación (c): sen(0.01)/0.01 ≈ 0.009999833/0.01 ≈ 0.9999833 → 2·0.9999833 ≈ 1.9999 ≈ 2 ✓",
    ],
    solucion_numerica: "(a) 11 km/h promedio; (b) 6; (c) 2",
    tolerancia: 0.01,
    solucion_explicada: "(a) Se evalúa s(2)/2 = 22/2 = 11 km/h, interpretado como velocidad promedio en 2 horas. (b) La forma 0/0 se resuelve factorizando: (x²-9)/(x-3) = (x+3)(x-3)/(x-3) = x+3 → límite = 6. (c) Se usa la identidad sen(2x)/x = 2·[sen(2x)/(2x)] y el límite notable → resultado = 2.",
  },
  { // P02 — ejercicio_matematico — Continuidad: análisis de discontinuidades y TVI
    problema: "Analiza la función f(x) = (x² - 4)/(x - 2).\n\n(a) ¿Es f continua en x = 2? Justifica usando las 3 condiciones de continuidad.\n(b) Clasifica el tipo de discontinuidad en x = 2.\n(c) ¿Se puede 'reparar' la discontinuidad? ¿Cómo se definiría la función reparada?\n(d) Aplica el Teorema del Valor Intermedio a g(x) = x³ - x - 1 en el intervalo [1, 2]: ¿existe al menos una raíz en ese intervalo? Justifica.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) Condición 1: f(2) = (4-4)/(2-2) = 0/0 — no está definida. La primera condición falla, por lo tanto f NO es continua en x=2.",
      "(b) Calcula el límite: lim(x→2)(x²-4)/(x-2) = lim(x→2)(x+2)(x-2)/(x-2) = lim(x→2)(x+2) = 4. El límite existe y es finito, pero f(2) no está definida. Discontinuidad evitable (removible).",
      "(c) Sí se puede reparar. Se define la función extendida: F(x) = (x²-4)/(x-2) si x≠2, y F(2) = 4. Ahora F es continua en todo su dominio incluyendo x=2.",
      "(d) g(1) = 1 - 1 - 1 = -1 < 0. g(2) = 8 - 2 - 1 = 5 > 0. Como g es continua en [1,2] (es polinomial) y g(1) < 0 < g(2), por el TVI existe al menos un c ∈ (1,2) tal que g(c) = 0. Sí existe al menos una raíz en (1,2).",
    ],
    solucion_numerica: "(a) No continua; (b) discontinuidad evitable; (c) sí, con F(2)=4; (d) sí, g cambia de signo en [1,2]",
    tolerancia: 0,
    solucion_explicada: "(a) f(2) no existe → primera condición de continuidad falla → no es continua. (b) El límite en x=2 existe y vale 4 pero f(2) no está definida → discontinuidad evitable/removible. (c) Redefinir F(2)=4 repara la discontinuidad. (d) g(1)=-1<0 y g(2)=5>0 con g continua → TVI garantiza raíz en (1,2).",
  },
  { // P03 — ejercicio_matematico — Derivada desde la definición y recta tangente
    problema: "Usando la definición de derivada (límite del cociente de Newton), calcula:\n\n(a) f'(x) si f(x) = x² + 3x\n(b) f'(x) si f(x) = 1/x\n(c) La ecuación de la recta tangente a f(x) = x² en el punto donde x = 2.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) f'(x) = lim(h→0) [(x+h)² + 3(x+h) - (x²+3x)] / h = lim(h→0) [x²+2xh+h²+3x+3h-x²-3x] / h = lim(h→0) [2xh+h²+3h] / h = lim(h→0) [2x+h+3] = 2x+3.",
      "(b) f'(x) = lim(h→0) [1/(x+h) - 1/x] / h = lim(h→0) [x-(x+h)] / [h·x(x+h)] = lim(h→0) [-h] / [h·x(x+h)] = lim(h→0) -1/[x(x+h)] = -1/x².",
      "(c) Para f(x)=x², f'(x)=2x. En x=2: pendiente m = f'(2) = 4. Punto de tangencia: (2, f(2)) = (2, 4). Ecuación punto-pendiente: y - 4 = 4(x - 2) → y = 4x - 8 + 4 → y = 4x - 4.",
      "Verificación (c): la tangente y=4x-4 pasa por (2,4): 4(2)-4=4 ✓. Es tangente porque tiene pendiente f'(2)=4 y comparte el punto (2,4) con la parábola ✓.",
    ],
    solucion_numerica: "(a) 2x+3; (b) -1/x²; (c) y = 4x - 4",
    tolerancia: 0,
    solucion_explicada: "(a) Expandiendo (x+h)², los términos x² y 3x se cancelan; queda (2xh+h²+3h)/h = 2x+h+3 → límite = 2x+3. (b) Restando fracciones con denominador común y cancelando h, queda -1/[x(x+h)] → límite = -1/x². (c) f'(2)=4 da la pendiente; la tangente por (2,4) con pendiente 4 es y=4x-4.",
  },
  { // P04 — ejercicio_matematico — Reglas de derivación: potencia, producto, cociente, cadena
    problema: "Deriva las siguientes funciones aplicando las reglas correspondientes. Indica cuál regla usas en cada caso.\n\n(a) f(x) = 3x⁵ - 2x³ + 7x - 1\n(b) g(x) = (x² + 1)(3x - 2)\n(c) h(x) = (x² + 1)/(x - 1)\n(d) k(x) = (2x³ + 1)⁴",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) Regla de la potencia término a término: f'(x) = 3·5x⁴ - 2·3x² + 7·1 - 0 = 15x⁴ - 6x² + 7.",
      "(b) Regla del producto: (fg)' = f'g + fg'. Con f=x²+1 (f'=2x) y g=3x-2 (g'=3): g'(x) = 2x(3x-2) + (x²+1)(3) = 6x²-4x + 3x²+3 = 9x²-4x+3.",
      "(c) Regla del cociente: (f/g)' = (f'g - fg')/g². f=x²+1 (f'=2x), g=x-1 (g'=1): h'(x) = [2x(x-1) - (x²+1)(1)] / (x-1)² = [2x²-2x-x²-1] / (x-1)² = (x²-2x-1)/(x-1)².",
      "(d) Regla de la cadena: función exterior u⁴ (derivada 4u³), función interior u=2x³+1 (derivada 6x²): k'(x) = 4(2x³+1)³ · 6x² = 24x²(2x³+1)³.",
    ],
    solucion_numerica: "(a) 15x⁴ - 6x² + 7; (b) 9x² - 4x + 3; (c) (x²-2x-1)/(x-1)²; (d) 24x²(2x³+1)³",
    tolerancia: 0,
    solucion_explicada: "(a) Potencia directa: multiplicar exponente por coeficiente y bajar exponente. (b) Producto: dos términos, usar f'g+fg'. (c) Cociente: numerador derivado·denominador menos numerador·denominador derivado, sobre denominador al cuadrado. (d) Cadena: derivada del exterior evaluada en el interior, por derivada del interior.",
  },
  { // P05 — ejercicio_matematico — Derivadas de funciones trascendentes
    problema: "Calcula las siguientes derivadas. Indica en cada caso si usas cadena u otra regla combinada.\n\n(a) d/dx [3 sen x - 2 cos x + tan x]\n(b) d/dx [e^(2x) · cos x]\n(c) d/dx [ln(x² + 1)]\n(d) d/dx [sen(x³)]",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) Linealidad + derivadas básicas: d/dx[3 sen x] = 3 cos x; d/dx[-2 cos x] = 2 sen x; d/dx[tan x] = sec²x. Resultado: 3 cos x + 2 sen x + sec²x.",
      "(b) Regla del producto: f=e^(2x) (f'=2e^(2x) por cadena), g=cos x (g'=-sen x). Resultado: 2e^(2x)·cos x + e^(2x)·(-sen x) = e^(2x)(2 cos x - sen x).",
      "(c) Regla de la cadena: función exterior ln(u) (derivada 1/u), función interior u=x²+1 (derivada 2x). Resultado: (1/(x²+1)) · 2x = 2x/(x²+1).",
      "(d) Regla de la cadena: función exterior sen(u) (derivada cos(u)), función interior u=x³ (derivada 3x²). Resultado: cos(x³) · 3x² = 3x² cos(x³).",
    ],
    solucion_numerica: "(a) 3cos x + 2sen x + sec²x; (b) e^(2x)(2cos x - sen x); (c) 2x/(x²+1); (d) 3x²·cos(x³)",
    tolerancia: 0,
    solucion_explicada: "(a) Suma de derivadas directas usando linealidad. (b) Producto de e^(2x) y cos x: se aplica regla del producto, recordando que la derivada de e^(2x) requiere la cadena. (c) ln de función compuesta: cadena con 1/u y la derivada de u=x²+1. (d) Seno de función compuesta: cadena con cos(u) y la derivada de u=x³.",
  },
  { // P06 — ejercicio_matematico — Análisis completo de función con primera y segunda derivada
    problema: "Para la función f(x) = x³ - 3x² - 9x + 5:\n\n(a) Encuentra todos los puntos críticos (donde f'(x) = 0).\n(b) Clasifica cada punto crítico como máximo o mínimo local usando el criterio de la segunda derivada.\n(c) Encuentra todos los puntos de inflexión.\n(d) Determina los intervalos de crecimiento/decrecimiento y los intervalos de concavidad.",
    tipo_respuesta: "desarrollo" as const,
    pasos_guia: [
      "(a) f'(x) = 3x² - 6x - 9 = 3(x² - 2x - 3) = 3(x-3)(x+1). Igualando a cero: x = 3 y x = -1. Puntos críticos: x = -1 y x = 3.",
      "(b) f''(x) = 6x - 6. En x = -1: f''(-1) = -6 - 6 = -12 < 0 → máximo local. f(-1) = -1 - 3 + 9 + 5 = 10. Máximo local en (-1, 10). En x = 3: f''(3) = 18 - 6 = 12 > 0 → mínimo local. f(3) = 27 - 27 - 27 + 5 = -22. Mínimo local en (3, -22).",
      "(c) Puntos de inflexión donde f'' cambia de signo: f''(x) = 6x - 6 = 0 → x = 1. Verifica cambio de signo: f''(0) = -6 < 0 y f''(2) = 6 > 0 → sí cambia de signo en x=1. f(1) = 1 - 3 - 9 + 5 = -6. Punto de inflexión en (1, -6).",
      "(d) Crecimiento: f' > 0 cuando (x+1)(x-3) > 0, es decir x < -1 o x > 3. Decrecimiento: -1 < x < 3. Cóncava hacia abajo (f'' < 0): x < 1. Cóncava hacia arriba (f'' > 0): x > 1.",
    ],
    solucion_numerica: "Máximo local en x=-1 con f(-1)=10; mínimo local en x=3 con f(3)=-22; inflexión en x=1 con f(1)=-6",
    tolerancia: 0,
    solucion_explicada: "f'=3(x-3)(x+1)=0 da puntos críticos x=-1 y x=3. La segunda derivada f''=-12 en x=-1 confirma máximo (f(-1)=10) y f''=12 en x=3 confirma mínimo (f(3)=-22). f''=0 en x=1 con cambio de signo confirma inflexión en (1,-6). Crece en (-∞,-1) y (3,∞); decrece en (-1,3); cóncava abajo en (-∞,1); cóncava arriba en (1,∞).",
  },
  { // P07 — ejercicio_matematico — Optimización: caja cilíndrica de mínimo material
    problema: "Una empresa fabricante de envases (como los que produce Vitro en Monterrey) quiere construir una caja cilíndrica sin tapa con un volumen de 1000 cm³. ¿Cuál debe ser el radio r y la altura h para minimizar el material usado (área de la base circular + área lateral)? Expresa r y h con 2 decimales.",
    tipo_respuesta: "numerica" as const,
    pasos_guia: [
      "Planteamiento: Área total A = πr² (base) + 2πrh (área lateral). Restricción: V = πr²h = 1000, entonces h = 1000/(πr²).",
      "Función objetivo en una variable: A(r) = πr² + 2πr · [1000/(πr²)] = πr² + 2000/r.",
      "Derivar e igualar a cero: A'(r) = 2πr - 2000/r² = 0 → 2πr = 2000/r² → r³ = 1000/π → r = (1000/π)^(1/3).",
      "Calcular r: r = (1000/π)^(1/3) = (318.31...)^(1/3) ≈ 5.42 cm.",
      "Calcular h: h = 1000/(π · (5.42)²) = 1000/(π · 29.38) ≈ 1000/92.28 ≈ 10.84 cm. Nota: h = 2r (el cilindro óptimo tiene altura igual al diámetro). Área mínima: A(5.42) = π(29.38) + 2000/5.42 ≈ 92.28 + 369.0 ≈ 461.3 cm². [Con la fórmula exacta: A = 3π(1000/π)^(2/3) ≈ 554 cm²].",
    ],
    solucion_numerica: "r ≈ 5.42 cm; h ≈ 10.84 cm; área mínima ≈ 554 cm²",
    tolerancia: 0.1,
    solucion_explicada: "Se expresa el área total en función de r usando la restricción de volumen para eliminar h. A(r) = πr² + 2000/r. Derivando: A'(r)=2πr-2000/r²=0 → r³=1000/π → r≈5.42 cm. Luego h=1000/(πr²)≈10.84 cm. El cilindro óptimo satisface h=2r (altura igual al diámetro). La segunda derivada A''=2π+4000/r³>0 confirma mínimo.",
  },
  { // P08 — ejercicio_matematico — Diferenciales: aproximaciones lineales y propagación de errores
    problema: "Usa la linealización (aproximación lineal) para estimar:\n\n(a) √(9.04) sin calculadora. (Usa f(x) = √x con punto base a = 9.)\n(b) e^(0.1) usando la linealización de eˣ en x = 0.\n(c) Un ingeniero mide el radio de una esfera como r = 5.0 ± 0.05 cm. Usa el diferencial dV = 4πr²dr para estimar el error máximo en el volumen calculado.",
    tipo_respuesta: "numerica" as const,
    pasos_guia: [
      "(a) f(x)=√x, f'(x)=1/(2√x). En a=9: f(9)=3, f'(9)=1/6. Linealización: L(x)=3+(1/6)(x-9). Para x=9.04: L(9.04)=3+(1/6)(0.04)=3+0.00667≈3.0067.",
      "(b) f(x)=eˣ, f'(x)=eˣ. En a=0: f(0)=1, f'(0)=1. Linealización: L(x)=1+1·(x-0)=1+x. Para x=0.1: L(0.1)=1+0.1=1.1. (Valor real: e^0.1≈1.1052, error<0.5%.)",
      "(c) V=(4/3)πr³. dV=4πr²dr. Con r=5.0 cm y dr=0.05 cm: dV=4π(25)(0.05)=4π(1.25)=5π≈15.71 cm³. El error máximo en el volumen es aproximadamente ±15.7 cm³.",
      "Porcentaje de error en volumen: (dV/V)·100 = (4πr²dr)/[(4/3)πr³]·100 = (3dr/r)·100 = (3·0.05/5)·100 = 3%. Un error de 1% en el radio produce 3% de error en el volumen.",
    ],
    solucion_numerica: "(a) ≈ 3.0067; (b) ≈ 1.1; (c) dV ≈ 15.7 cm³",
    tolerancia: 0.01,
    solucion_explicada: "(a) Con a=9, la tangente L(x)=3+(x-9)/6 evalúa en 9.04 para dar 3+0.04/6≈3.0067. (b) La tangente de eˣ en x=0 es L(x)=1+x, evaluada en 0.1 da 1.1. (c) El diferencial del volumen de una esfera es dV=4πr²dr. Con r=5 y dr=0.05: dV=4π(25)(0.05)=5π≈15.7 cm³.",
  },
];

// ── CONTENIDOS A3 ─────────────────────────────────────────────────────────────

const contenidosA3 = [
  { // P01 — quiz_multiple_opcion — Límites
    preguntas: [
      {
        enunciado: "¿Cuál de las siguientes expresiones es la notación correcta para 'el límite de f(x) cuando x tiende a a es igual a L'?",
        opciones: [
          "f(a) = L",
          "lim(x→a) f(x) = L",
          "f'(a) = L",
          "∫f(a)dx = L",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La notación lim(x→a) f(x) = L significa que los valores de f(x) se acercan a L conforme x se acerca a a, sin importar si f(a) está definida. No confundir con f(a) (valor de la función en a) ni con f'(a) (derivada en a).",
      },
      {
        enunciado: "Para calcular lim(x→5) (x² - 3x + 1), ¿qué método es más directo?",
        opciones: [
          "Factorizar el numerador y cancelar factores comunes",
          "Sustitución directa, porque el denominador no se anula",
          "Aplicar la regla de L'Hôpital porque hay una forma indeterminada",
          "Calcular los límites laterales por separado",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Para funciones polinomiales (y racionales donde el denominador no se anula en el punto), la sustitución directa funciona: lim(x→5)(x²-3x+1) = 25-15+1 = 11. La factorización se reserva para cuando la sustitución produce 0/0 (forma indeterminada).",
      },
      {
        enunciado: "¿Cuál es el resultado de lim(x→2) (x² - 4)/(x - 2)?",
        opciones: [
          "0",
          "Indefinido (0/0, no existe)",
          "4",
          "2",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "La sustitución directa da 0/0 (forma indeterminada), pero el límite sí existe. Factorizando: (x²-4)/(x-2) = (x+2)(x-2)/(x-2) = x+2. El límite cuando x→2 de (x+2) es 4. La forma 0/0 es indeterminada, no significa que el límite no exista.",
      },
      {
        enunciado: "Los límites laterales lim(x→a⁻) f(x) y lim(x→a⁺) f(x) son distintos. ¿Qué se puede concluir?",
        opciones: [
          "El límite lim(x→a) f(x) existe pero vale el promedio de los dos límites laterales",
          "El límite lim(x→a) f(x) no existe",
          "La función tiene una discontinuidad evitable en x = a",
          "La función no está definida en ningún punto cerca de a",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Para que el límite bilateral lim(x→a) f(x) exista, los límites laterales deben ser iguales. Si lim(x→a⁻) f(x) ≠ lim(x→a⁺) f(x), el límite bilateral no existe. Esto corresponde a una discontinuidad de salto en x = a.",
      },
      {
        enunciado: "¿Cuál es el valor del límite lim(x→∞) (5x² - 3x)/(2x² + 1)?",
        opciones: [
          "0",
          "5/2",
          "∞",
          "-3",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Para límites al infinito de funciones racionales donde numerador y denominador tienen el mismo grado, el límite es el cociente de los coeficientes líderes: lim(x→∞)(5x²-3x)/(2x²+1) = 5/2. La recta y=5/2 es la asíntota horizontal de esta función.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P02 — reflexion_escrita — Continuidad en física e ingeniería
    prompt: "La continuidad matemática aparece en muchos fenómenos físicos: temperatura, presión, velocidad, corriente eléctrica. Reflexiona:\n\n1. ¿Por qué es importante que estas funciones sean continuas en física e ingeniería?\n2. ¿Qué implicaría una discontinuidad en la función de corriente eléctrica de un hospital o en la presión de un gasoducto?\n3. ¿Cómo conecta el Teorema del Valor Intermedio con la búsqueda de raíces en la ingeniería?",
    pistas: [
      "Piensa en qué pasa cuando 'rompe' una función discontinua en un sistema físico",
      "El TVI garantiza la existencia de algo, ¿de qué?",
      "¿Qué es una raíz de una función en términos físicos?",
    ],
    criterios: [
      "Explica por qué la continuidad es necesaria en al menos un sistema físico real, con argumento preciso",
      "Describe las consecuencias concretas de una discontinuidad en corriente eléctrica hospitalaria o en presión de gasoducto",
      "Conecta el TVI con la búsqueda de soluciones en ingeniería (existencia de raíces, valores intermedios garantizados)",
    ],
    longitud_minima: 80,
  },
  { // P03 — quiz_multiple_opcion — Derivadas: definición e interpretación geométrica
    preguntas: [
      {
        enunciado: "La derivada f'(a) se define formalmente como:",
        opciones: [
          "f(a+1) - f(a)",
          "lim(h→0) [f(a+h) - f(a)] / h",
          "lim(x→a) f(x)",
          "[f(b) - f(a)] / (b - a) para b ≠ a",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La derivada en x=a es el límite del cociente de Newton cuando h→0: f'(a) = lim(h→0)[f(a+h)-f(a)]/h. La opción (d) es la pendiente de la secante (velocidad promedio), no la derivada. La opción (a) es solo una diferencia finita sin tomar límite.",
      },
      {
        enunciado: "Geométricamente, f'(a) representa:",
        opciones: [
          "El área bajo la curva de f entre 0 y a",
          "La pendiente de la recta tangente a la gráfica de f en el punto (a, f(a))",
          "La distancia entre los puntos (a, f(a)) y (a+1, f(a+1))",
          "El valor máximo de f en el intervalo [0, a]",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La derivada f'(a) es la pendiente de la recta tangente a la gráfica de y=f(x) en el punto (a, f(a)). Esta interpretación geométrica conecta el cálculo diferencial con la geometría: la derivada mide la inclinación instantánea de la curva.",
      },
      {
        enunciado: "Si s(t) modela la posición de un objeto en función del tiempo, ¿qué representa s'(t)?",
        opciones: [
          "La distancia total recorrida por el objeto",
          "La aceleración del objeto en el instante t",
          "La velocidad instantánea del objeto en el instante t",
          "El tiempo en que el objeto se detiene",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "La primera derivada de la posición respecto al tiempo es la velocidad instantánea: s'(t) = v(t). La segunda derivada s''(t) = v'(t) = a(t) es la aceleración. Este es uno de los contextos más importantes de la derivada en física.",
      },
      {
        enunciado: "¿Cuál de las siguientes afirmaciones sobre derivabilidad y continuidad es correcta?",
        opciones: [
          "Si f es continua en a, entonces f es derivable en a",
          "Si f es derivable en a, entonces f es continua en a",
          "Derivabilidad y continuidad son condiciones independientes",
          "f(x) = |x| es derivable en x = 0 porque es continua allí",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La derivabilidad implica continuidad (si f es derivable en a, entonces es continua en a). Pero la continuidad NO implica derivabilidad: f(x)=|x| es continua en x=0 pero no derivable allí (la gráfica tiene un pico angular, con distintas pendientes por la izquierda y por la derecha).",
      },
      {
        enunciado: "Para f(x) = x² - 4x + 3, ¿cuál es la ecuación de la recta tangente en x = 1?",
        opciones: [
          "y = -2x + 2",
          "y = 2x - 2",
          "y = -2x",
          "y = 2x",
        ],
        respuesta_correcta: 0,
        retroalimentacion: "f'(x) = 2x - 4. En x=1: pendiente m = f'(1) = 2-4 = -2. Punto: (1, f(1)) = (1, 1-4+3) = (1, 0). Ecuación: y - 0 = -2(x-1) → y = -2x + 2.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P04 — autoevaluacion — Reglas de derivación
    criterios: [
      {
        id: "regla_potencia",
        descripcion: "Aplico la regla de la potencia correctamente",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "No recuerdo la regla de la potencia o la aplico de forma incorrecta." },
          { valor: 2, etiqueta: "A veces", descripcion: "La aplico correctamente en casos simples pero cometo errores con exponentes negativos o fraccionarios." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Aplico d/dx[xⁿ]=nxⁿ⁻¹ correctamente en la mayoría de los casos, incluyendo constantes y combinaciones lineales." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Aplico la regla de la potencia sin errores en cualquier caso, incluyendo potencias negativas, fraccionarias y radicales reescritos como potencias." },
        ],
      },
      {
        id: "regla_producto",
        descripcion: "Aplico la regla del producto sin confundirla con la cadena",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "Confundo la regla del producto con simplemente multiplicar las derivadas, o no sé cuándo usarla." },
          { valor: 2, etiqueta: "A veces", descripcion: "Recuerdo la fórmula (fg)'=f'g+fg' pero a veces mezclo los términos o olvido uno de los dos." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Aplico (fg)'=f'g+fg' correctamente y la distingo de la regla de la cadena en la mayoría de los casos." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Aplico la regla del producto sin errores, incluso cuando se combina con la cadena o el cociente en una misma función." },
        ],
      },
      {
        id: "regla_cociente",
        descripcion: "Aplico la regla del cociente (numerador - denominador, no al revés)",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "Invierto el orden de la resta (pongo denominador-numerador) o no recuerdo el denominador al cuadrado." },
          { valor: 2, etiqueta: "A veces", descripcion: "Recuerdo la estructura pero cometo errores de signo o olvido elevar el denominador al cuadrado." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Aplico (f/g)'=(f'g-fg')/g² correctamente y verifico el orden de la resta en la mayoría de los ejercicios." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Aplico la regla del cociente sin errores en cualquier función racional, y puedo verificar el resultado expandiendo." },
        ],
      },
      {
        id: "regla_cadena",
        descripcion: "Identifico cuándo usar la regla de la cadena (función compuesta)",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "No identifico funciones compuestas o no sé aplicar la cadena: derivada exterior × derivada interior." },
          { valor: 2, etiqueta: "A veces", descripcion: "Identifico la función compuesta cuando es obvia (ej. (x²+1)⁴) pero la confundo en casos menos evidentes." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Identifico la función exterior e interior, y aplico la cadena correctamente en la mayoría de los casos, incluyendo composiciones con funciones trascendentes." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Aplico la cadena automáticamente en cualquier función compuesta, incluyendo composiciones múltiples y combinaciones con producto o cociente." },
        ],
      },
      {
        id: "verificacion",
        descripcion: "Verifico mis derivadas derivando de nuevo o evaluando en un punto",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "No verifico mis resultados; entrego la derivada sin revisarla." },
          { valor: 2, etiqueta: "A veces", descripcion: "Verifico solo cuando tengo dudas o cuando el ejercicio lo pide explícitamente." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Verifico la mayoría de mis derivadas evaluando en un punto concreto o comprobando el grado del resultado." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Verifico sistemáticamente todas mis derivadas: evalúo en puntos sencillos, compruebo el grado y el signo del resultado, y detecto errores antes de entregar." },
        ],
      },
    ],
    reflexion_final_prompt: "¿Cuál regla de derivación te resulta más difícil de aplicar y por qué? ¿Qué estrategia vas a usar para mejorar en esa regla específica?",
  },
  { // P05 — reflexion_escrita — ¿Por qué eˣ es su propia derivada?
    prompt: "El número e ≈ 2.71828... es la única base cuya función exponencial eˣ es igual a su propia derivada: d/dx[eˣ] = eˣ. Esto lo hace especial para describir procesos de cambio continuo. Reflexiona:\n\n1. ¿Qué significa matemáticamente que una función sea igual a su propia derivada?\n2. ¿Qué fenómenos naturales o sociales crecen o decaen de manera exponencial?\n3. ¿Puedes pensar en algún ejemplo en México (demografía, epidemiología, economía) donde el crecimiento o decaimiento exponencial sea relevante?",
    pistas: [
      "¿Qué es una derivada en términos de tasa de cambio?",
      "Piensa en el crecimiento de una población, el decaimiento de un medicamento en el cuerpo, o el interés compuesto",
      "¿Por qué la epidemia de COVID-19 en sus primeras semanas fue 'exponencial'?",
    ],
    criterios: [
      "Explica con sus propias palabras qué significa que una función sea igual a su propia derivada (tasa de cambio proporcional al valor actual)",
      "Identifica al menos dos fenómenos naturales o sociales con comportamiento exponencial",
      "Da un ejemplo concreto y relevante en el contexto de México con argumentación propia",
    ],
    longitud_minima: 100,
  },
  { // P06 — quiz_multiple_opcion — Análisis de funciones con derivada
    preguntas: [
      {
        enunciado: "Si f'(c) = 0 y f''(c) > 0, ¿qué tipo de punto es x = c?",
        opciones: [
          "Máximo local",
          "Mínimo local",
          "Punto de inflexión",
          "No se puede determinar",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Criterio de la segunda derivada: si f'(c)=0 y f''(c)>0, la función tiene un mínimo local en x=c. La segunda derivada positiva indica que la función es cóncava hacia arriba en ese punto (como el fondo de una 'taza'), lo que garantiza un mínimo local.",
      },
      {
        enunciado: "La función f(x) decrece en el intervalo (a, b) si y solo si:",
        opciones: [
          "f'(x) = 0 para todo x en (a, b)",
          "f'(x) < 0 para todo x en (a, b)",
          "f''(x) < 0 para todo x en (a, b)",
          "f(a) < f(b)",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Una función decrece en (a, b) si y solo si f'(x) < 0 para todo x en (a, b). La pendiente negativa de la tangente indica que la función desciende al avanzar hacia la derecha. No confundir con f''<0 (que indica concavidad hacia abajo, no decrecimiento).",
      },
      {
        enunciado: "Un punto de inflexión de f es un punto donde:",
        opciones: [
          "f'(x) = 0",
          "f(x) = 0",
          "f''(x) cambia de signo",
          "f'(x) cambia de signo",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "Un punto de inflexión ocurre donde f''(x) cambia de signo, es decir, donde la concavidad cambia de hacia arriba a hacia abajo (o viceversa). Solo con f''(c)=0 no es suficiente: hay que verificar que f'' cambia de signo a través de c.",
      },
      {
        enunciado: "Para f(x) = x³ + 3x² - 9x + 1, ¿cuáles son los puntos críticos?",
        opciones: [
          "x = 1 y x = -3",
          "x = -1 y x = 3",
          "x = 1 y x = 3",
          "x = 0 y x = 2",
        ],
        respuesta_correcta: 0,
        retroalimentacion: "f'(x) = 3x² + 6x - 9 = 3(x²+2x-3) = 3(x+3)(x-1). Igualando a cero: x = -3 y x = 1. Son los puntos críticos. Verificación: f'(-3)=3(0)(-4)=0 ✓ y f'(1)=3(4)(-2+... )... 3(1+3-3)... 3(1) ≠ 0... recalculando: f'(1)=3+6-9=0 ✓.",
      },
      {
        enunciado: "Si la gráfica de f es cóncava hacia arriba en un intervalo, entonces en ese intervalo:",
        opciones: [
          "f'(x) > 0 (la función crece)",
          "f''(x) > 0",
          "f(x) > 0 (la función es positiva)",
          "f'(x) = 0 (la pendiente es cero)",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La concavidad hacia arriba (forma de taza) significa que la segunda derivada es positiva: f''(x) > 0. Esto implica que la primera derivada f' es creciente (la función se 'acelera' hacia arriba), no necesariamente que f' sea positiva o negativa.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P07 — autoevaluacion — Optimización
    criterios: [
      {
        id: "identificar_funcion",
        descripcion: "Identifico la función objetivo y las restricciones del problema",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "No sé distinguir qué se quiere maximizar o minimizar, ni cuáles son las restricciones del problema." },
          { valor: 2, etiqueta: "A veces", descripcion: "Identifico la función objetivo en problemas sencillos pero no distingo claramente las restricciones en problemas con varios datos." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Identifico correctamente la función objetivo y las restricciones en la mayoría de los problemas de optimización." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Identifico de forma sistemática la función objetivo, las restricciones y el dominio físico razonable en cualquier problema de optimización." },
        ],
      },
      {
        id: "modelar",
        descripcion: "Expreso la función objetivo en una sola variable usando las restricciones",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "No puedo reducir la función a una sola variable aunque conozca las restricciones." },
          { valor: 2, etiqueta: "A veces", descripcion: "En problemas simples despejo correctamente una variable, pero me confundo cuando la restricción es más compleja." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Uso las restricciones para eliminar variables y expreso la función objetivo en una sola variable en la mayoría de los casos." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Siempre logro expresar la función objetivo en una sola variable, simplifico algebraicamente antes de derivar y verifico que el dominio sea correcto." },
        ],
      },
      {
        id: "derivar_igualar",
        descripcion: "Derivo e igualo a cero para encontrar los puntos críticos",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "No sé por qué se deriva ni qué significa igualar la derivada a cero en el contexto de la optimización." },
          { valor: 2, etiqueta: "A veces", descripcion: "Derivo correctamente pero cometo errores al resolver la ecuación f'(x)=0 (problemas algebraicos al despejar)." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Derivo la función objetivo, igualo a cero y resuelvo la ecuación correctamente en la mayoría de los casos." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Derivo eficientemente, resuelvo f'(x)=0 sin errores y verifico que los puntos críticos estén en el dominio físico del problema." },
        ],
      },
      {
        id: "verificar_extremo",
        descripcion: "Verifico si el punto crítico es máximo o mínimo usando la segunda derivada o evaluando puntos cercanos",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "Asumo que el punto crítico siempre es el óptimo sin verificarlo." },
          { valor: 2, etiqueta: "A veces", descripcion: "Intento verificar con la segunda derivada pero cometo errores de cálculo o no sé interpretar el resultado." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Verifico el tipo de extremo usando la segunda derivada (f''>0 mínimo, f''<0 máximo) correctamente en la mayoría de los casos." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Verifico sistemáticamente el tipo de extremo, evalúo también los extremos del intervalo cuando el dominio es cerrado y comparo todos los valores candidatos." },
        ],
      },
      {
        id: "interpretar_contexto",
        descripcion: "Interpreto el resultado en el contexto del problema (unidades, significado físico)",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "Obtengo un número pero no sé qué significa en el contexto del problema." },
          { valor: 2, etiqueta: "A veces", descripcion: "Expreso el resultado con unidades correctas pero a veces no lo interpreto en palabras del problema original." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Interpreto el resultado en el contexto del problema con unidades correctas y señalo qué significa el valor óptimo encontrado." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Interpreto el resultado completo: señalo qué se optimizó, cuál es el valor óptimo con unidades, qué significan las variables encontradas y por qué ese valor es el mejor posible según el problema." },
        ],
      },
    ],
    reflexion_final_prompt: "Describe con tus propias palabras la estrategia para resolver un problema de optimización. ¿Cuál de los 5 pasos te resulta más difícil? ¿Por qué?",
  },
  { // P08 — reflexion_escrita — El diferencial como puente entre derivada e integral
    prompt: "El diferencial dy = f'(x)dx es el puente entre la derivada y la integral. Reflexiona:\n\n1. ¿Por qué el diferencial dy es una aproximación del cambio real Δy y cuándo esa aproximación es buena?\n2. ¿Cómo se usa el diferencial para estimar errores de medición en física e ingeniería?\n3. ¿Qué significará ∫f(x)dx cuando llegues al cálculo integral el próximo semestre?",
    pistas: [
      "¿Cuándo la tangente se 'aleja' de la curva? ¿Para valores Δx grandes o pequeños?",
      "¿Cómo se relaciona el diferencial con la propagación de incertidumbre en laboratorios?",
      "¿Qué es 'dx' en el símbolo de la integral?",
    ],
    criterios: [
      "Explica la diferencia entre Δy y dy con referencia a la tangente y la curva",
      "Describe el uso del diferencial en propagación de errores con al menos un ejemplo concreto",
      "Reflexiona sobre el significado de dx en la notación integral, conectando con lo aprendido sobre diferenciales",
    ],
    longitud_minima: 80,
  },
];

main().catch((err) => { console.error("❌ Error fatal:", err.message); process.exit(1); });
