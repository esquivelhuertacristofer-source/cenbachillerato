/**
 * Producto Integrador del semestre para PM-V (Pensamiento Matemático V —
 * Cálculo Diferencial). Integra las 8 progresiones:
 *   P01 Límites · P02 Continuidad · P03 Derivada como límite ·
 *   P04 Reglas de derivación · P05 Derivadas trig/exp/log ·
 *   P06 Máximos, mínimos e inflexión · P07 Optimización · P08 Diferencial.
 * Se aloja en la progresión de mayor número (P08, culminante de PM-V).
 * Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar.
 * Uso: npx tsx scripts/seed-pmv-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador PM-V — Cálculo Diferencial (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "PM-V");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de PM-V");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "PM-V-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: Modelado con Cálculo Diferencial — Análisis Completo de un Fenómeno Real",
    descripcion: "Capstone del semestre: integra las ocho progresiones de PM-V (límites, continuidad, derivada como límite, reglas de derivación, derivadas de trig/exp/log, análisis de extremos e inflexión, optimización y diferencial) en el estudio matemático riguroso de un fenómeno o función real de tu elección.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "PRODUCTO INTEGRADOR — PM-V: Pensamiento Matemático V (Cálculo Diferencial)\n\n" +
        "Durante este semestre desarrollaste ocho competencias fundamentales del cálculo diferencial: " +
        "(1) el concepto de límite y su cálculo; (2) la continuidad y los tipos de discontinuidad; " +
        "(3) la derivada como límite del cociente diferencial y su interpretación geométrica; " +
        "(4) las reglas básicas de derivación (potencia, producto, cociente, cadena); " +
        "(5) las derivadas de funciones trigonométricas (sin, cos, tan), exponenciales (eˣ, aˣ) y logarítmicas (ln x); " +
        "(6) el análisis de máximos, mínimos y puntos de inflexión; " +
        "(7) la optimización en contextos reales; y " +
        "(8) el diferencial dy = f'(x)dx y las aproximaciones lineales.\n\n" +
        "SITUACIÓN INTEGRADORA — ANÁLISIS MATEMÁTICO DE UN FENÓMENO REAL:\n" +
        "Elige UNA función matemática f(x) que modele un fenómeno real de tu interés. " +
        "Puede ser de cualquier área: ciencias (posición de un proyectil, decaimiento radiactivo, crecimiento poblacional), " +
        "ingeniería (deflexión de una viga, temperatura a lo largo de una barra, señal eléctrica), " +
        "economía (costo total, ingreso, beneficio en función de la producción), biología (concentración de un medicamento en sangre), " +
        "o física (trabajo, energía potencial, velocidad). " +
        "Ejemplos concretos de funciones que puedes elegir: " +
        "f(x) = x³ − 6x² + 9x + 2 (costo de producción), " +
        "f(x) = 50·e^(−0.3x)·cos(x) (señal amortiguada), " +
        "f(x) = 100x·e^(−x) (concentración de fármaco), " +
        "f(x) = x/(x²+1) (distribución de probabilidad), " +
        "o la que tú propongas con justificación de su contexto real.\n\n" +
        "Tu informe (mínimo 300 palabras) debe desarrollar CADA UNO de los siguientes ocho puntos, " +
        "aplicando las competencias de PM-V con procedimientos matemáticos completos:\n\n" +
        "1) LÍMITES — COMPORTAMIENTO GLOBAL DE LA FUNCIÓN:\n" +
        "Calcula al menos tres límites de tu función f(x): " +
        "(a) lim(x→a) f(x) en un punto a donde la evaluación directa requiera álgebra (factorización, simplificación o forma indeterminada), " +
        "(b) lim(x→+∞) f(x) para describir el comportamiento asintótico de la función, " +
        "(c) lim(x→−∞) f(x). " +
        "Interpreta cada resultado en el contexto del fenómeno modelado: ¿qué significa que la función tienda a un valor L, a infinito o a cero?\n\n" +
        "2) CONTINUIDAD — DOMINIO Y PUNTOS PROBLEMÁTICOS:\n" +
        "Determina el dominio natural de f(x) (conjunto de x donde f está definida). " +
        "Identifica si existen puntos donde f podría no ser continua (denominadores que se anulan, argumentos de logaritmos ≤ 0, etc.). " +
        "Para cada punto sospechoso x = c, verifica las tres condiciones de continuidad: " +
        "(i) f(c) existe, (ii) lim(x→c) f(x) existe, (iii) lim(x→c) f(x) = f(c). " +
        "Clasifica el tipo de discontinuidad si existe (evitable, de salto o esencial) y justifica gráficamente.\n\n" +
        "3) DERIVADA COMO LÍMITE — CÁLCULO DESDE LA DEFINICIÓN:\n" +
        "Para una función simplificada relacionada con f (o para f misma si es polinomial), " +
        "calcula la derivada f'(x) usando la definición como límite del cociente diferencial: " +
        "f'(x) = lim(h→0) [f(x+h) − f(x)] / h. " +
        "Muestra cada paso algebraico del desarrollo del límite. " +
        "Interpreta geométricamente f'(x₀) para un punto x₀ específico: escribe la ecuación de la recta tangente " +
        "y = f(x₀) + f'(x₀)(x − x₀) y describe qué representa en el contexto del fenómeno.\n\n" +
        "4) REGLAS DE DERIVACIÓN — CÁLCULO EFICIENTE DE f'(x) y f''(x):\n" +
        "Calcula f'(x) usando las reglas de derivación (potencia, suma/diferencia, producto, cociente, cadena). " +
        "Muestra qué regla o combinación de reglas aplicas en cada paso. " +
        "Calcula también f''(x) (segunda derivada). " +
        "Verifica que el resultado de f'(x) obtenido aquí coincida con el de la definición (punto 3) para la parte simplificada.\n\n" +
        "5) DERIVADAS DE TRIG, EXP Y LOG — SI LA FUNCIÓN LO REQUIERE:\n" +
        "Si tu función f(x) incluye términos trigonométricos (sin, cos, tan), exponenciales (eˣ, aˣ) o logarítmicos (ln x, log_a x), " +
        "muestra explícitamente la derivada de cada uno de esos términos y cómo se combinan con la cadena o el producto. " +
        "Si tu función no los incluye directamente, considera una perturbación o versión modificada: " +
        "por ejemplo, compara f(x) con g(x) = f(x)·e^(−kx) o h(x) = ln(f(x)) (válido donde f > 0), " +
        "y calcula la derivada de esa versión. Interpreta el significado de la derivada de la parte trascendente en tu contexto.\n\n" +
        "6) ANÁLISIS DE EXTREMOS E INFLEXIÓN — COMPORTAMIENTO LOCAL:\n" +
        "Usando f'(x) e f''(x), realiza el análisis completo de la función: " +
        "(a) Encuentra todos los puntos críticos resolviendo f'(x) = 0 e indicando dónde f'(x) no existe. " +
        "(b) Clasifica cada punto crítico como máximo local, mínimo local o ninguno, usando la prueba de la segunda derivada o la prueba de la primera derivada. " +
        "(c) Determina los intervalos donde f es creciente (f'>0) y donde es decreciente (f'<0). " +
        "(d) Encuentra los candidatos a puntos de inflexión resolviendo f''(x) = 0 y verifica el cambio de concavidad. " +
        "(e) Indica los intervalos de concavidad hacia arriba (f''>0) y hacia abajo (f''<0). " +
        "Interpreta cada hallazgo en el contexto del fenómeno: un máximo puede ser un pico de producción, un instante de velocidad máxima, etc.\n\n" +
        "7) OPTIMIZACIÓN — PROBLEMA PRÁCTICO CON TU FUNCIÓN O RELACIONADO:\n" +
        "Plantea y resuelve un problema de optimización relacionado con tu fenómeno. " +
        "Puede ser: maximizar la producción o el beneficio, minimizar el costo o el tiempo, " +
        "encontrar las dimensiones óptimas de un recipiente, etc. " +
        "Usa el procedimiento estándar: " +
        "(i) Define la función objetivo Q y la restricción (si la hay). " +
        "(ii) Expresa Q en términos de una sola variable. " +
        "(iii) Calcula Q'=0 para encontrar puntos críticos. " +
        "(iv) Verifica si es máximo o mínimo (segunda derivada o Teorema del Valor Extremo si el dominio es un intervalo cerrado). " +
        "(v) Responde con valor numérico y unidades. " +
        "Interpreta el resultado: ¿qué decisión práctica recomiendas basándote en tu análisis matemático?\n\n" +
        "8) DIFERENCIAL — ESTIMACIÓN Y PROPAGACIÓN DEL ERROR:\n" +
        "Elige un valor x₀ en el dominio de f y calcula el diferencial dy = f'(x₀)·dx para un incremento dx pequeño (|dx| ≤ 0.1). " +
        "Compara dy con el incremento real Δy = f(x₀+dx) − f(x₀). " +
        "Calcula el error absoluto |Δy − dy| y el error relativo |Δy − dy|/|Δy|. " +
        "Aplica la linealización L(x) = f(x₀) + f'(x₀)(x − x₀) para estimar f(x₀ + dx) sin cálculo exacto. " +
        "En un contexto de medición (ingeniería, ciencias), interpreta qué significaría ese error: " +
        "si x es una longitud medida con error ±dx, ¿cuánto error se propaga a f(x)?\n\n" +
        "REFLEXIÓN FINAL:\n" +
        "Cierra tu informe con una reflexión de al menos dos párrafos respondiendo: " +
        "¿Cómo se conectan las ocho competencias de PM-V en el análisis de tu función? " +
        "¿Cuál de las técnicas (límites, derivada por definición, reglas, análisis de extremos, optimización, diferencial) " +
        "fue la más reveladora para comprender el comportamiento de tu fenómeno y por qué? " +
        "¿Qué preguntas nuevas surgen sobre tu fenómeno que el cálculo diferencial no puede responder por sí solo " +
        "(y que podrían abordarse con cálculo integral u otras herramientas matemáticas)?\n\n" +
        "Escribe con precisión matemática: muestra todos los procedimientos paso a paso, " +
        "usa notación correcta (f'(x), d/dx, lim, ∞, dy, dx, ≈), justifica cada decisión y " +
        "responde con unidades cuando el contexto lo requiera.",

      pistas: [
        "Para la sección de LÍMITES: si al sustituir directamente obtienes la forma 0/0, factoriza numerador y denominador buscando factores comunes. Si obtienes ∞/∞ en el límite al infinito, divide numerador y denominador entre la potencia de x más alta que aparezca. Recuerda: lim(x→∞) c/xⁿ = 0 para n > 0 y cualquier constante c.",
        "Para la sección de DERIVADA POR DEFINICIÓN: desarrolla (x+h)ⁿ usando el binomio antes de simplificar. Identifica y cancela el factor h del denominador con un h del numerador. Para funciones que incluyen eˣ o sin(x), usa las identidades lim(h→0)(eʰ−1)/h = 1 y lim(h→0)sin(h)/h = 1 para simplificar. Muestra cada línea de álgebra.",
        "Para la sección de ANÁLISIS DE EXTREMOS: organiza la información en una tabla de signos de f'(x): marca los puntos críticos como columnas y los intervalos entre ellos como filas; indica el signo de f'(x) en cada intervalo (elige un valor de prueba). El signo positivo indica función creciente; el negativo, decreciente. Para la concavidad, repite el proceso con f''(x).",
        "Para la sección de OPTIMIZACIÓN: dibuja un diagrama (descrito textualmente si no puedes hacer una figura) que muestre las variables del problema. Etiqueta claramente qué es la función objetivo (la cantidad a optimizar) y cuál es la restricción (la ecuación que relaciona las variables). Después de encontrar el punto crítico, siempre verifica con f'' que sea efectivamente un máximo o mínimo del tipo que necesitas.",
        "Para la sección del DIFERENCIAL: recuerda que la linealización L(x₀+dx) = f(x₀) + f'(x₀)·dx es exactamente lo mismo que calcular dy = f'(x₀)·dx y sumarlo a f(x₀). Para calcular el error relativo, usa: error relativo = |Δy − dy| / |Δy| × 100%. Si el dominio tiene restricciones (por ejemplo, x > 0 para ln x), asegúrate de que x₀ + dx también esté en el dominio."
      ],

      longitud_minima_palabras: 300,

      criterios_evaluacion: [
        "Calcula correctamente al menos dos límites de f(x) (incluyendo uno que requiera álgebra para resolver una indeterminación) e interpreta cada resultado en el contexto real del fenómeno modelado. [P01 — Límites]",
        "Determina el dominio de f(x), identifica puntos de posible discontinuidad, verifica las tres condiciones de continuidad en al menos un punto y clasifica correctamente el tipo de discontinuidad si existe. [P02 — Continuidad]",
        "Calcula f'(x) desde la definición como límite del cociente diferencial lim(h→0)[f(x+h)−f(x)]/h, mostrando cada paso algebraico, y usa f'(x₀) para escribir la ecuación de la recta tangente e interpretarla geométricamente. [P03 — Derivada como límite]",
        "Calcula f'(x) y f''(x) usando las reglas de derivación (potencia, producto, cociente, cadena), identificando explícitamente qué regla aplica en cada paso del cálculo. [P04 — Reglas de derivación]",
        "Aplica correctamente las derivadas de funciones trigonométricas (d/dx[sin x]=cos x, d/dx[cos x]=−sin x, d/dx[tan x]=sec²x), exponenciales (d/dx[eˣ]=eˣ) y logarítmicas (d/dx[ln x]=1/x), combinándolas con la regla de la cadena cuando sea necesario. [P05 — Derivadas trig/exp/log]",
        "Realiza el análisis completo de extremos e inflexión: encuentra puntos críticos (f'=0), los clasifica con la prueba de la segunda derivada, determina intervalos de crecimiento/decrecimiento, identifica puntos de inflexión con cambio de concavidad, e interpreta cada resultado en contexto. [P06 — Máximos, mínimos e inflexión]",
        "Plantea y resuelve correctamente un problema de optimización contextualizado: define función objetivo y restricción, reduce a una sola variable, deriva e iguala a cero, verifica el tipo de extremo, y responde con valor numérico, unidades e interpretación práctica. [P07 — Optimización]",
        "Calcula el diferencial dy = f'(x₀)·dx para un incremento pequeño, lo compara con el incremento real Δy, cuantifica el error de la aproximación lineal y aplica la linealización L(x) = f(x₀)+f'(x₀)(x−x₀) para estimar un valor de f, con interpretación en términos de propagación del error. [P08 — Diferencial]"
      ],

      formato_esperado: "ensayo",
    },
  });

  log(ok ? "  ✓ Producto Integrador PM-V creado (borrador)\n" : "  ✗ Falló el Producto Integrador PM-V\n");

  // Estado actual de PM-V (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 PM-V total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
