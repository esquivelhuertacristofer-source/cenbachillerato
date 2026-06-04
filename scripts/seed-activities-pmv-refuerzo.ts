/**
 * Refuerzo de actividades para PM-V (Pensamiento Matemático V — Cálculo Diferencial)
 * según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 8 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 8 progresiones × 4 = 32 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial PM-V (MCCEMS 2025): límites, continuidad, derivada como límite,
 * reglas de derivación, derivadas de trig/exp/log, análisis de funciones, optimización, diferencial.
 * Uso: npx tsx scripts/seed-activities-pmv-refuerzo.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Refuerzo = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;

const letras = ["A4", "A5", "A6", "A7"];

// Escala estándar de autoevaluación (1-4) reutilizada en todas las progresiones.
const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo ayudar a otra persona." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 Refuerzo PM-V — Pensamiento Matemático V (Cálculo Diferencial): A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "PM-V");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const set = refuerzos[p.numero - 1];
    if (!set) { log(`⚠️  Sin refuerzos definidos para P${p.numero}`); continue; }
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

  log(`\n✅ PM-V refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Límite de una función y cálculo en casos sencillos ════════════
  [
    {
      titulo: "Verdadero o Falso — Concepto de límite",
      descripcion: "Decide si cada afirmación sobre el concepto de límite de una función y su cálculo en casos sencillos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "El límite lim(x→2) (x² − 4)/(x − 2) se puede calcular sustituyendo directamente x = 2, obteniendo 0/0, por lo que el límite no existe.",
            respuesta: false,
            retroalimentacion: "Falso. La forma 0/0 es indeterminada, pero el límite puede existir. Factorizando: (x²−4)/(x−2) = (x+2)(x−2)/(x−2) = x+2, y al evaluar en x→2 el límite es 4.",
          },
          {
            enunciado: "Si f(x) = 5 para todo x ≠ 3 y f(3) = 10, entonces lim(x→3) f(x) = 5.",
            respuesta: true,
            retroalimentacion: "Correcto. El límite depende del comportamiento de f(x) cuando x se acerca a 3, no del valor en x = 3. Como f(x) = 5 para todo x ≠ 3, el límite es 5.",
          },
          {
            enunciado: "El límite lim(x→0) (sen x)/x es igual a 1 (con x en radianes).",
            respuesta: true,
            retroalimentacion: "Correcto. Este es un límite trigonométrico fundamental: lim(x→0) (sen x)/x = 1, válido cuando x se mide en radianes.",
          },
          {
            enunciado: "Para que lim(x→a) f(x) exista, los límites laterales izquierdo y derecho deben ser iguales: lim(x→a⁻) f(x) = lim(x→a⁺) f(x).",
            respuesta: true,
            retroalimentacion: "Correcto. La existencia del límite bilateral requiere que ambos límites laterales (por la izquierda y por la derecha) existan y sean iguales.",
          },
          {
            enunciado: "lim(x→∞) (3x² + 2x)/(x² − 1) = 3, ya que dominan los términos de mayor grado en numerador y denominador.",
            respuesta: true,
            retroalimentacion: "Correcto. Al dividir entre x²: (3 + 2/x)/(1 − 1/x²) → 3/1 = 3 cuando x→∞. El límite al infinito de un cociente de polinomios del mismo grado es el cociente de coeficientes líderes.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Límite de una función",
      descripcion: "Glosario interactivo de los conceptos fundamentales sobre el límite de una función: definición informal, límites laterales, indeterminaciones y límites al infinito.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Límite de una función",
            definicion: "lim(x→a) f(x) = L significa que f(x) se acerca arbitrariamente a L cuando x se acerca a a, sin necesariamente llegar a a. El valor f(a) puede ser distinto de L o incluso no estar definido.",
            ejemplo: "lim(x→3) (x² − 9)/(x − 3) = lim(x→3) (x+3) = 6. Aunque f(3) = 0/0, el límite es 6.",
            etiquetas: ["límite", "definición"],
          },
          {
            termino: "Límites laterales",
            definicion: "El límite por la izquierda lim(x→a⁻) f(x) considera x < a. El límite por la derecha lim(x→a⁺) f(x) considera x > a. El límite bilateral existe solo si ambos son iguales.",
            ejemplo: "f(x) = |x|/x: lim(x→0⁻) = −1 y lim(x→0⁺) = 1. Como difieren, lim(x→0) no existe.",
            etiquetas: ["límites laterales", "bilateral"],
          },
          {
            termino: "Forma indeterminada 0/0",
            definicion: "Cuando la sustitución directa da 0/0, se recurre a álgebra: factorización, racionalización o simplificación para eliminar el factor que causa la indeterminación.",
            ejemplo: "lim(x→2) (x²−4)/(x−2): factor = (x+2)(x−2)/(x−2) = x+2 → límite = 4.",
            etiquetas: ["indeterminación", "factorización"],
          },
          {
            termino: "Sustitución directa",
            definicion: "Si f es continua en a (polinomio, función racional sin cero en denominador, etc.), entonces lim(x→a) f(x) = f(a). Es el método más simple.",
            ejemplo: "lim(x→3) (2x² + 1) = 2(9) + 1 = 19. Sustitución directa válida porque el polinomio es continuo.",
            etiquetas: ["sustitución directa", "evaluación"],
          },
          {
            termino: "Límite al infinito",
            definicion: "lim(x→∞) f(x) describe el comportamiento de f(x) cuando x crece sin límite. Para cocientes de polinomios, el grado del numerador vs. denominador determina el resultado.",
            ejemplo: "lim(x→∞) (5x³)/(2x³+1) = 5/2 (mismos grados). lim(x→∞) (x)/(x²+1) = 0 (grado mayor abajo). lim(x→∞) (x²)/(x+1) = ∞ (grado mayor arriba).",
            etiquetas: ["límite al infinito", "grado"],
          },
          {
            termino: "Límite trigonométrico fundamental",
            definicion: "lim(x→0) sen(x)/x = 1 (x en radianes). Este límite es la base para derivar funciones trigonométricas y no puede obtenerse por sustitución directa (forma 0/0).",
            ejemplo: "lim(x→0) sen(3x)/x = 3 · lim(x→0) sen(3x)/(3x) = 3 · 1 = 3.",
            etiquetas: ["límite trigonométrico", "seno"],
          },
        ],
        actividad_final: "Calcula los siguientes límites: (a) lim(x→4) (x²−16)/(x−4), (b) lim(x→∞) (2x²+3)/(5x²−1), (c) lim(x→0) sen(2x)/(x). Muestra el procedimiento completo para cada uno.",
      },
    },
    {
      titulo: "Completa los espacios — Límites",
      descripcion: "Completa los valores y conceptos clave sobre límites de funciones.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el valor o término correcto.",
        texto_con_huecos: "El límite lim(x→3) (x²−9)/(x−3) se simplifica a x+3, por lo que su valor es ___. Para que lim(x→a) f(x) exista, los límites ___ deben ser iguales. El límite lim(x→0) sen(x)/x = ___. El límite lim(x→∞) (4x²)/(2x²+1) = ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "6",
            alternativas_aceptadas: [],
            pista: "Después de simplificar, lim(x→3) (x+3) = 3+3 = ?",
          },
          {
            posicion: 1,
            respuesta_correcta: "laterales",
            alternativas_aceptadas: ["límites laterales"],
            pista: "Los límites por la izquierda y por la derecha se llaman límites ___ .",
          },
          {
            posicion: 2,
            respuesta_correcta: "1",
            alternativas_aceptadas: [],
            pista: "Este es el límite trigonométrico fundamental: lim(x→0) sen(x)/x = ?",
          },
          {
            posicion: 3,
            respuesta_correcta: "2",
            alternativas_aceptadas: [],
            pista: "Numerador y denominador tienen el mismo grado; el límite es el cociente de coeficientes líderes: 4/2 = ?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Límites de funciones",
      descripcion: "Reflexiona sobre tu comprensión del concepto de límite y tu capacidad para calcularlo en casos sencillos.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esto te ayudará a identificar qué reforzar.",
        criterios: [
          { descripcion: "Explico intuitivamente qué significa lim(x→a) f(x) = L sin recurrir a la definición formal con ε-δ.", escala: escala4 },
          { descripcion: "Calculo límites por sustitución directa cuando la función es continua en el punto.", escala: escala4 },
          { descripcion: "Resuelvo indeterminaciones 0/0 factorizando, racionalizando o simplificando algebraicamente.", escala: escala4 },
          { descripcion: "Calculo límites laterales y determino si el límite bilateral existe comparándolos.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cuál de las técnicas para calcular límites (sustitución directa, factorización, límites trigonométricas) te resulta más difícil? Describe un ejemplo donde esa técnica sea necesaria y cómo la aplicarías.",
      },
    },
  ],

  // ════════════ P02 — Continuidad y discontinuidad de funciones ════════════
  [
    {
      titulo: "Verdadero o Falso — Continuidad de funciones",
      descripcion: "Decide si cada afirmación sobre la continuidad y discontinuidad de funciones, con ejemplos gráficos y algebraicos, es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Una función f es continua en x = a si y solo si: (1) f(a) está definida, (2) lim(x→a) f(x) existe, y (3) lim(x→a) f(x) = f(a).",
            respuesta: true,
            retroalimentacion: "Correcto. Esas son exactamente las tres condiciones necesarias y suficientes para la continuidad en un punto.",
          },
          {
            enunciado: "La función f(x) = (x²−4)/(x−2) es continua en x = 2.",
            respuesta: false,
            retroalimentacion: "Falso. f(2) no está definida (denominador cero), por lo que la condición (1) falla. Existe una discontinuidad evitable en x = 2 (el límite es 4, pero el valor f(2) no existe).",
          },
          {
            enunciado: "Una discontinuidad evitable (removible) ocurre cuando el límite existe en el punto pero la función no está definida ahí o tiene un valor diferente al del límite.",
            respuesta: true,
            retroalimentacion: "Correcto. Se llama evitable porque se puede 'reparar' redefiniendo f en ese punto para que coincida con el valor del límite.",
          },
          {
            enunciado: "La función f(x) = 1/x tiene una discontinuidad evitable en x = 0.",
            respuesta: false,
            retroalimentacion: "Falso. En x = 0, lim(x→0⁺) 1/x = +∞ y lim(x→0⁻) 1/x = −∞. El límite no existe (es infinito), por lo que es una discontinuidad esencial (asíntota vertical), no evitable.",
          },
          {
            enunciado: "Todo polinomio es continuo en todos los números reales.",
            respuesta: true,
            retroalimentacion: "Correcto. Los polinomios son continuos en ℝ porque para cualquier a, lim(x→a) p(x) = p(a) (sustitución directa siempre válida).",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Continuidad y discontinuidad",
      descripcion: "Glosario interactivo sobre los tipos de continuidad y discontinuidad de funciones con ejemplos gráficos y algebraicos.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Continuidad en un punto",
            definicion: "f es continua en x = a si: (1) f(a) existe, (2) lim(x→a) f(x) existe, (3) lim(x→a) f(x) = f(a). Las tres condiciones deben cumplirse.",
            ejemplo: "f(x) = x² + 1 es continua en x = 2: f(2) = 5, lim(x→2) f(x) = 5, y son iguales.",
            etiquetas: ["continuidad", "punto"],
          },
          {
            termino: "Discontinuidad evitable (removible)",
            definicion: "El límite lim(x→a) f(x) = L existe, pero f(a) ≠ L o f(a) no está definida. Se puede eliminar redefiniendo f(a) = L.",
            ejemplo: "f(x) = (x²−1)/(x−1) para x ≠ 1. El límite en x=1 es 2, pero f(1) no existe. Redefiniendo f(1)=2 se elimina la discontinuidad.",
            etiquetas: ["discontinuidad evitable", "removible"],
          },
          {
            termino: "Discontinuidad de salto",
            definicion: "Los límites laterales existen pero son distintos: lim(x→a⁻) f(x) ≠ lim(x→a⁺) f(x). La gráfica presenta un salto finito en x = a.",
            ejemplo: "f(x) = 0 para x < 0, f(x) = 1 para x ≥ 0. En x=0: límite izq. = 0, límite der. = 1. Salto de 1 unidad.",
            etiquetas: ["salto", "límites laterales"],
          },
          {
            termino: "Discontinuidad esencial (infinita)",
            definicion: "Alguno de los límites laterales es ±∞. La gráfica tiene una asíntota vertical en x = a.",
            ejemplo: "f(x) = 1/(x−3): lim(x→3⁻) = −∞ y lim(x→3⁺) = +∞. Discontinuidad esencial en x = 3.",
            etiquetas: ["discontinuidad esencial", "asíntota vertical"],
          },
          {
            termino: "Continuidad en un intervalo",
            definicion: "f es continua en (a, b) si es continua en cada punto del intervalo. En los extremos [a, b] se exige continuidad lateral: desde la derecha en a y desde la izquierda en b.",
            ejemplo: "f(x) = √x es continua en [0, ∞): continua desde la derecha en x = 0 y continua en cada x > 0.",
            etiquetas: ["continuidad en intervalo", "extremos"],
          },
          {
            termino: "Teorema del Valor Intermedio (TVI)",
            definicion: "Si f es continua en [a, b] y N está entre f(a) y f(b), entonces existe al menos un c ∈ (a, b) tal que f(c) = N. Garantiza que una función continua no puede saltar valores.",
            ejemplo: "f(x) = x³ − x − 1: f(1) = −1 < 0 y f(2) = 5 > 0. Por TVI, existe c ∈ (1,2) con f(c) = 0 (hay raíz).",
            etiquetas: ["TVI", "continuidad", "valor intermedio"],
          },
        ],
        actividad_final: "Analiza la función f(x) = (x²−9)/(x−3). (a) ¿Es continua en x = 3? Verifica las tres condiciones. (b) ¿Qué tipo de discontinuidad tiene? (c) ¿Cómo la harías continua? (d) Esboza su gráfica.",
      },
    },
    {
      titulo: "Completa los espacios — Continuidad",
      descripcion: "Completa los conceptos y condiciones clave sobre la continuidad de funciones.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o valor correcto.",
        texto_con_huecos: "Una función es continua en x = a si el límite en ese punto es igual al ___ de la función en a. Cuando el límite existe pero el valor de la función no está definido en x = a, la discontinuidad es de tipo ___. La función f(x) = 1/x tiene una discontinuidad ___ en x = 0 porque el límite es infinito. Todo ___ es continuo en todos los números reales.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "valor",
            alternativas_aceptadas: ["f(a)", "valor de la función"],
            pista: "Tercera condición de continuidad: lim(x→a) f(x) = ___ (la función evaluada en a).",
          },
          {
            posicion: 1,
            respuesta_correcta: "evitable",
            alternativas_aceptadas: ["removible", "discontinuidad evitable"],
            pista: "Cuando el límite existe pero f(a) no está definida, la discontinuidad se llama ___ porque puede eliminarse redefiniendo el valor.",
          },
          {
            posicion: 2,
            respuesta_correcta: "esencial",
            alternativas_aceptadas: ["infinita", "discontinuidad esencial"],
            pista: "Cuando el límite es ±∞ (asíntota vertical), la discontinuidad es de tipo ___ .",
          },
          {
            posicion: 3,
            respuesta_correcta: "polinomio",
            alternativas_aceptadas: ["polinomio"],
            pista: "Las funciones ___ (suma de monomios) son continuas en ℝ porque siempre se puede aplicar sustitución directa.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Continuidad y discontinuidad",
      descripcion: "Reflexiona sobre tu comprensión de la continuidad de funciones y los distintos tipos de discontinuidad.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Verifico las tres condiciones de continuidad en un punto dado (f(a) definida, límite existe, límite = f(a)).", escala: escala4 },
          { descripcion: "Clasifico una discontinuidad como evitable, de salto o esencial, justificando con los límites laterales.", escala: escala4 },
          { descripcion: "Interpreto gráficamente los tipos de discontinuidad (hueco, salto, asíntota vertical).", escala: escala4 },
          { descripcion: "Aplico el Teorema del Valor Intermedio para garantizar la existencia de raíces de funciones continuas.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cuál es la diferencia práctica entre una discontinuidad evitable y una esencial? Da un ejemplo de cada una con su gráfica descrita. ¿Por qué importa la continuidad en ingeniería y física?",
      },
    },
  ],

  // ════════════ P03 — Derivada como límite del cociente diferencial e interpretación geométrica ════════════
  [
    {
      titulo: "Verdadero o Falso — Definición de derivada",
      descripcion: "Decide si cada afirmación sobre la derivada como límite del cociente diferencial y su interpretación geométrica como pendiente de la tangente es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La derivada de f en x = a se define como f'(a) = lim(h→0) [f(a+h) − f(a)]/h, siempre que este límite exista.",
            respuesta: true,
            retroalimentacion: "Correcto. Esa es la definición formal de la derivada como límite del cociente diferencial (o cociente incremental).",
          },
          {
            enunciado: "La derivada de f(x) = x² en x = 3, calculada con la definición, es f'(3) = 6.",
            respuesta: true,
            retroalimentacion: "Correcto. f'(3) = lim(h→0) [(3+h)²−9]/h = lim(h→0) [6h+h²]/h = lim(h→0) (6+h) = 6.",
          },
          {
            enunciado: "La recta tangente a la gráfica de f en el punto (a, f(a)) tiene como pendiente el valor f'(a).",
            respuesta: true,
            retroalimentacion: "Correcto. Geometricamente, la derivada f'(a) es exactamente la pendiente de la recta tangente a la curva en x = a.",
          },
          {
            enunciado: "Si una función es continua en x = a, entonces necesariamente es derivable en x = a.",
            respuesta: false,
            retroalimentacion: "Falso. La continuidad es necesaria pero no suficiente para la derivabilidad. Por ejemplo, f(x) = |x| es continua en x = 0 pero no derivable ahí (la gráfica tiene un pico angular).",
          },
          {
            enunciado: "El cociente diferencial [f(a+h) − f(a)]/h representa la pendiente de la recta secante que pasa por (a, f(a)) y (a+h, f(a+h)).",
            respuesta: true,
            retroalimentacion: "Correcto. La pendiente de la recta secante es precisamente ese cociente. Cuando h → 0, la secante se convierte en la tangente y la pendiente se convierte en la derivada.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Derivada: definición e interpretación geométrica",
      descripcion: "Glosario interactivo sobre la definición de derivada como límite, el cociente incremental, la recta tangente y la interpretación geométrica.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Cociente diferencial (incremental)",
            definicion: "La expresión [f(a+h) − f(a)]/h, donde h ≠ 0. Representa la pendiente de la recta secante que une (a, f(a)) y (a+h, f(a+h)). El numerador es el incremento de y; el denominador es el incremento de x.",
            ejemplo: "Para f(x)=x², en a=2, h=1: [f(3)−f(2)]/1 = (9−4)/1 = 5 (pendiente de la secante).",
            etiquetas: ["cociente diferencial", "secante"],
          },
          {
            termino: "Derivada en un punto",
            definicion: "f'(a) = lim(h→0) [f(a+h) − f(a)]/h. Es el límite del cociente incremental cuando el incremento h tiende a cero. Representa la tasa de cambio instantánea de f en x = a.",
            ejemplo: "f(x)=x²: f'(a) = lim(h→0) [(a+h)²−a²]/h = lim(h→0) (2a+h) = 2a. Así f'(3) = 6.",
            etiquetas: ["derivada", "tasa de cambio"],
          },
          {
            termino: "Función derivada f'(x)",
            definicion: "Cuando se calcula f'(a) para todos los a en el dominio donde el límite existe, se obtiene la función derivada f'(x). Notaciones: f'(x), dy/dx, Df(x).",
            ejemplo: "f(x) = x³: f'(x) = lim(h→0) [(x+h)³−x³]/h = lim(h→0) (3x²+3xh+h²) = 3x².",
            etiquetas: ["función derivada", "notación"],
          },
          {
            termino: "Recta tangente",
            definicion: "La recta tangente a la gráfica de f en (a, f(a)) tiene pendiente m = f'(a). Su ecuación es y − f(a) = f'(a)(x − a).",
            ejemplo: "f(x)=x², tangente en (2,4): m=f'(2)=4. Ecuación: y−4=4(x−2) → y=4x−4.",
            etiquetas: ["recta tangente", "pendiente"],
          },
          {
            termino: "Recta secante vs. recta tangente",
            definicion: "La secante cruza la curva en dos puntos (a, f(a)) y (a+h, f(a+h)). Cuando h→0, la secante gira hasta coincidir con la tangente. La derivada es el límite de las pendientes secantes.",
            ejemplo: "En f(x)=x² en x=1: pendiente secante con h=0.1 es (1.21−1)/0.1=2.1. Con h→0 → pendiente tangente = 2.",
            etiquetas: ["secante", "tangente", "límite"],
          },
          {
            termino: "No derivabilidad",
            definicion: "Una función no es derivable en x = a si el límite del cociente diferencial no existe. Causas: cúspide (pico angular como en |x|), discontinuidad, o tangente vertical.",
            ejemplo: "f(x)=|x|: en x=0, límite izq. de [f(h)−f(0)]/h = −1 y límite der. = 1. Son distintos: f no es derivable en 0.",
            etiquetas: ["no derivable", "cúspide"],
          },
        ],
        actividad_final: "Usando la definición de derivada como límite, calcula f'(x) para f(x) = 3x² − 2x. Luego: (a) evalúa f'(1) y f'(−1), (b) escribe la ecuación de la recta tangente en x = 1, (c) interpreta geométricamente f'(1).",
      },
    },
    {
      titulo: "Completa los espacios — Definición de derivada",
      descripcion: "Completa los valores y conceptos clave sobre la derivada como límite del cociente diferencial.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o valor correcto.",
        texto_con_huecos: "La derivada de f en x = a se define como el ___ del cociente diferencial [f(a+h)−f(a)]/h cuando h→0. Para f(x) = x², la derivada f'(x) calculada por definición es ___. La pendiente de la recta tangente a f en x = a es igual a ___. Si f(x) = |x|, entonces f no es derivable en x = 0 porque los límites ___ son distintos.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "límite",
            alternativas_aceptadas: ["limite"],
            pista: "La derivada es el ___ del cociente diferencial cuando h se aproxima a cero.",
          },
          {
            posicion: 1,
            respuesta_correcta: "2x",
            alternativas_aceptadas: [],
            pista: "lim(h→0)[(x+h)²−x²]/h = lim(h→0)(2x+h) = ?",
          },
          {
            posicion: 2,
            respuesta_correcta: "f'(a)",
            alternativas_aceptadas: ["la derivada en a", "f prima de a"],
            pista: "La pendiente de la tangente en (a, f(a)) es el valor de la ___ evaluada en x = a.",
          },
          {
            posicion: 3,
            respuesta_correcta: "laterales",
            alternativas_aceptadas: ["límites laterales"],
            pista: "La derivada no existe si los límites ___ (izquierdo y derecho) del cociente diferencial son distintos.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Derivada como límite e interpretación geométrica",
      descripcion: "Reflexiona sobre tu comprensión de la derivada como límite del cociente incremental y su significado geométrico.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Enuncio la definición de derivada como lim(h→0) [f(a+h)−f(a)]/h y la interpreto como tasa de cambio instantánea.", escala: escala4 },
          { descripcion: "Calculo la derivada de funciones polinomiales sencillas usando la definición (límite del cociente diferencial).", escala: escala4 },
          { descripcion: "Determino la ecuación de la recta tangente a una curva en un punto dado usando f'(a) como pendiente.", escala: escala4 },
          { descripcion: "Identifico casos de no derivabilidad (cúspides, discontinuidades) y los justifico con los límites laterales.", escala: escala4 },
        ],
        reflexion_final_prompt: "Explica con tus propias palabras por qué la derivada es el 'límite de las pendientes secantes'. ¿Qué relación tiene la derivada con la velocidad instantánea de un objeto en movimiento?",
      },
    },
  ],

  // ════════════ P04 — Reglas básicas de derivación ════════════
  [
    {
      titulo: "Verdadero o Falso — Reglas de derivación",
      descripcion: "Decide si cada afirmación sobre las reglas básicas de derivación (potencia, producto, cociente, cadena) es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La regla de la potencia establece que d/dx[xⁿ] = nxⁿ⁻¹ para cualquier número real n.",
            respuesta: true,
            retroalimentacion: "Correcto. La regla de la potencia es d/dx[xⁿ] = n·xⁿ⁻¹. Por ejemplo, d/dx[x⁵] = 5x⁴.",
          },
          {
            enunciado: "d/dx[f(x)·g(x)] = f'(x)·g'(x) (la derivada del producto es el producto de las derivadas).",
            respuesta: false,
            retroalimentacion: "Falso. La regla del producto es d/dx[f·g] = f'·g + f·g', no f'·g'. Por ejemplo, d/dx[x²·sin x] = 2x·sin x + x²·cos x.",
          },
          {
            enunciado: "La derivada de la función constante f(x) = k es f'(x) = 0.",
            respuesta: true,
            retroalimentacion: "Correcto. Una constante no cambia, por lo que su tasa de cambio (derivada) es cero: d/dx[k] = 0.",
          },
          {
            enunciado: "Usando la regla del cociente, d/dx[x²/(x+1)] = (2x(x+1) − x²·1)/(x+1)² = (x²+2x)/(x+1)².",
            respuesta: true,
            retroalimentacion: "Correcto. Regla del cociente: (f/g)' = (f'g − fg')/g². Aquí f = x², f' = 2x, g = x+1, g' = 1: (2x(x+1)−x²)/(x+1)² = (x²+2x)/(x+1)².",
          },
          {
            enunciado: "La regla de la cadena establece que si h(x) = f(g(x)), entonces h'(x) = f'(g(x)) · g'(x).",
            respuesta: true,
            retroalimentacion: "Correcto. La regla de la cadena: derivada de la función exterior evaluada en la función interior, multiplicada por la derivada de la función interior.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Reglas básicas de derivación",
      descripcion: "Glosario interactivo de las reglas de derivación: potencia, suma, producto, cociente y cadena, con ejemplos concretos.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Regla de la potencia",
            definicion: "d/dx[xⁿ] = n·xⁿ⁻¹. Funciona para cualquier exponente real n (entero, fraccionario, negativo).",
            ejemplo: "d/dx[x⁴] = 4x³. d/dx[x^(1/2)] = (1/2)x^(−1/2) = 1/(2√x). d/dx[x⁻³] = −3x⁻⁴.",
            etiquetas: ["regla potencia", "derivación"],
          },
          {
            termino: "Regla de la suma y diferencia",
            definicion: "d/dx[f(x) ± g(x)] = f'(x) ± g'(x). La derivada se distribuye sobre la suma y la diferencia.",
            ejemplo: "d/dx[3x⁴ − 5x² + 7] = 12x³ − 10x. (Constante: derivada de 7 es 0.)",
            etiquetas: ["suma", "diferencia", "linealidad"],
          },
          {
            termino: "Regla del producto",
            definicion: "d/dx[f·g] = f'·g + f·g'. No es el producto de las derivadas individuales.",
            ejemplo: "d/dx[x³·ln x] = 3x²·ln x + x³·(1/x) = 3x²·ln x + x².",
            etiquetas: ["regla producto", "derivación"],
          },
          {
            termino: "Regla del cociente",
            definicion: "d/dx[f/g] = (f'·g − f·g')/g² (cuando g(x) ≠ 0). Mnemotecnia: 'hi d-lo minus lo d-hi, over hi-hi'.",
            ejemplo: "d/dx[x²/(x²+1)] = (2x·(x²+1) − x²·2x)/(x²+1)² = 2x/(x²+1)².",
            etiquetas: ["regla cociente", "derivación"],
          },
          {
            termino: "Regla de la cadena",
            definicion: "Si h(x) = f(g(x)), entonces h'(x) = f'(g(x))·g'(x). Derivada exterior (evaluada en la interior) por derivada interior.",
            ejemplo: "h(x) = (3x²+1)⁵: exterior f(u)=u⁵, interior g(x)=3x²+1. h'(x) = 5(3x²+1)⁴·6x = 30x(3x²+1)⁴.",
            etiquetas: ["regla cadena", "composición"],
          },
          {
            termino: "Regla de la constante multiplicativa",
            definicion: "d/dx[c·f(x)] = c·f'(x). Las constantes multiplicativas 'salen' de la derivada.",
            ejemplo: "d/dx[7x³] = 7·d/dx[x³] = 7·3x² = 21x². d/dx[−4x] = −4.",
            etiquetas: ["constante", "linealidad"],
          },
        ],
        actividad_final: "Calcula las siguientes derivadas usando las reglas: (a) d/dx[4x³ − 2x + 5], (b) d/dx[x²·(x+3)] usando la regla del producto, (c) d/dx[(x−1)/(x+2)] usando la regla del cociente, (d) d/dx[(2x+3)⁴] usando la regla de la cadena.",
      },
    },
    {
      titulo: "Completa los espacios — Reglas de derivación",
      descripcion: "Completa los resultados de derivadas aplicando las reglas de potencia, producto, cociente y cadena.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el resultado o término correcto.",
        texto_con_huecos: "Aplicando la regla de la potencia, d/dx[x⁶] = ___. La regla del producto establece d/dx[f·g] = f'·g + ___. d/dx[(x²+1)³] por la regla de la cadena es 3(x²+1)² · ___ = 6x(x²+1)². La derivada de la constante f(x) = 8 es ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "6x⁵",
            alternativas_aceptadas: ["6x^5"],
            pista: "d/dx[xⁿ] = n·xⁿ⁻¹. Con n=6: 6·x^(6−1) = ?",
          },
          {
            posicion: 1,
            respuesta_correcta: "f·g'",
            alternativas_aceptadas: ["f(x)·g'(x)"],
            pista: "Regla del producto: d/dx[f·g] = f'·g + ___ (primer término · derivada del segundo).",
          },
          {
            posicion: 2,
            respuesta_correcta: "2x",
            alternativas_aceptadas: [],
            pista: "La derivada de la función interior g(x) = x²+1 es g'(x) = ?",
          },
          {
            posicion: 3,
            respuesta_correcta: "0",
            alternativas_aceptadas: [],
            pista: "La derivada de cualquier constante k es siempre ___ (las constantes no cambian).",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Reglas básicas de derivación",
      descripcion: "Reflexiona sobre tu dominio de las reglas de derivación: potencia, producto, cociente y cadena.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Aplico correctamente la regla de la potencia d/dx[xⁿ] = nxⁿ⁻¹ incluyendo exponentes negativos y fraccionarios.", escala: escala4 },
          { descripcion: "Uso la regla del producto d/dx[f·g] = f'g + fg' sin confundirla con el producto de derivadas.", escala: escala4 },
          { descripcion: "Aplico la regla del cociente (f'g − fg')/g² para diferenciar cocientes de funciones.", escala: escala4 },
          { descripcion: "Uso la regla de la cadena h'(x) = f'(g(x))·g'(x) para derivar funciones compuestas.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cuál de las cuatro reglas de derivación (potencia, producto, cociente, cadena) encuentras más difícil de aplicar? Inventa un ejemplo propio para esa regla y resuélvelo paso a paso.",
      },
    },
  ],

  // ════════════ P05 — Derivadas de funciones trigonométricas, exponenciales y logarítmicas ════════════
  [
    {
      titulo: "Verdadero o Falso — Derivadas de trig, exp y log",
      descripcion: "Decide si cada afirmación sobre las derivadas de funciones trigonométricas, exponenciales y logarítmicas es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "d/dx[sin x] = cos x (la derivada del seno es el coseno).",
            respuesta: true,
            retroalimentacion: "Correcto. Esta es una de las derivadas fundamentales de la trigonometría. Se obtiene del límite lim(h→0)[sin(x+h)−sin x]/h usando la identidad de suma.",
          },
          {
            enunciado: "d/dx[cos x] = sin x (la derivada del coseno es el seno).",
            respuesta: false,
            retroalimentacion: "Falso. d/dx[cos x] = −sin x (hay un signo negativo). La derivada del coseno es el seno negativo.",
          },
          {
            enunciado: "d/dx[eˣ] = eˣ. La función exponencial natural es la única función (no trivial) que es su propia derivada.",
            respuesta: true,
            retroalimentacion: "Correcto. La función eˣ tiene la propiedad extraordinaria de que su derivada es ella misma: d/dx[eˣ] = eˣ.",
          },
          {
            enunciado: "d/dx[ln x] = 1/x para x > 0.",
            respuesta: true,
            retroalimentacion: "Correcto. La derivada del logaritmo natural es d/dx[ln x] = 1/x, válida para x > 0.",
          },
          {
            enunciado: "d/dx[tan x] = sec²x. La derivada de la tangente es la secante al cuadrado.",
            respuesta: true,
            retroalimentacion: "Correcto. d/dx[tan x] = d/dx[sin x/cos x] = (cos²x + sin²x)/cos²x = 1/cos²x = sec²x.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Derivadas de trig, exponencial y logarítmica",
      descripcion: "Glosario interactivo de las derivadas de las principales funciones trigonométricas, exponenciales y logarítmicas, con ejemplos de aplicación de la regla de la cadena.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Derivadas de seno y coseno",
            definicion: "d/dx[sin x] = cos x; d/dx[cos x] = −sin x. Con la cadena: d/dx[sin(g(x))] = cos(g(x))·g'(x).",
            ejemplo: "d/dx[sin(3x²)] = cos(3x²)·6x = 6x·cos(3x²).",
            etiquetas: ["seno", "coseno", "trigonometría"],
          },
          {
            termino: "Derivada de la tangente",
            definicion: "d/dx[tan x] = sec²x = 1/cos²x. Con la cadena: d/dx[tan(g(x))] = sec²(g(x))·g'(x).",
            ejemplo: "d/dx[tan(x²+1)] = sec²(x²+1)·2x.",
            etiquetas: ["tangente", "secante"],
          },
          {
            termino: "Derivadas de secante, cosecante y cotangente",
            definicion: "d/dx[sec x] = sec x·tan x; d/dx[csc x] = −csc x·cot x; d/dx[cot x] = −csc²x.",
            ejemplo: "d/dx[sec(2x)] = sec(2x)·tan(2x)·2 = 2sec(2x)tan(2x).",
            etiquetas: ["secante", "cosecante", "cotangente"],
          },
          {
            termino: "Derivada de la exponencial natural eˣ",
            definicion: "d/dx[eˣ] = eˣ. Con la cadena: d/dx[e^(g(x))] = e^(g(x))·g'(x). La exponencial natural es su propia derivada.",
            ejemplo: "d/dx[e^(x²)] = e^(x²)·2x. d/dx[5eˣ] = 5eˣ.",
            etiquetas: ["exponencial natural", "e"],
          },
          {
            termino: "Derivada de aˣ (base arbitraria)",
            definicion: "d/dx[aˣ] = aˣ·ln(a), para a > 0 y a ≠ 1.",
            ejemplo: "d/dx[2ˣ] = 2ˣ·ln 2 ≈ 2ˣ·0.693. d/dx[10ˣ] = 10ˣ·ln 10 ≈ 10ˣ·2.303.",
            etiquetas: ["exponencial", "base arbitraria"],
          },
          {
            termino: "Derivada del logaritmo",
            definicion: "d/dx[ln x] = 1/x (x > 0). d/dx[log_a x] = 1/(x·ln a). Con la cadena: d/dx[ln(g(x))] = g'(x)/g(x).",
            ejemplo: "d/dx[ln(x²+3)] = 2x/(x²+3). d/dx[log₁₀(x)] = 1/(x·ln 10).",
            etiquetas: ["logaritmo", "logaritmo natural"],
          },
        ],
        actividad_final: "Calcula las siguientes derivadas: (a) d/dx[3sin x − 2cos x], (b) d/dx[e^(2x)·sin x] (usa la regla del producto), (c) d/dx[ln(x² + 1)], (d) d/dx[tan(eˣ)] (usa la cadena dos veces).",
      },
    },
    {
      titulo: "Completa los espacios — Derivadas de trig, exp y log",
      descripcion: "Completa las derivadas de funciones trigonométricas, exponenciales y logarítmicas.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con la derivada o término correcto.",
        texto_con_huecos: "La derivada d/dx[sin x] = ___. La derivada d/dx[eˣ] = ___. La derivada d/dx[ln x] = ___. Aplicando la regla de la cadena, d/dx[sin(5x)] = ___ · 5 = 5cos(5x).",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "cos x",
            alternativas_aceptadas: ["cosx", "cos(x)"],
            pista: "La derivada del seno es el ___ (función trigonométrica complementaria sin cambio de signo).",
          },
          {
            posicion: 1,
            respuesta_correcta: "eˣ",
            alternativas_aceptadas: ["e^x", "ex"],
            pista: "La función exponencial natural es su propia derivada: d/dx[eˣ] = ?",
          },
          {
            posicion: 2,
            respuesta_correcta: "1/x",
            alternativas_aceptadas: ["1/x"],
            pista: "La derivada del logaritmo natural es d/dx[ln x] = ? (válida para x > 0).",
          },
          {
            posicion: 3,
            respuesta_correcta: "cos(5x)",
            alternativas_aceptadas: ["cos 5x", "cos(5x)"],
            pista: "Cadena: derivada de sin(u) = cos(u). Entonces d/dx[sin(5x)] = cos(5x)·d/dx[5x] = cos(5x)·5.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Derivadas de trig, exponencial y logarítmica",
      descripcion: "Reflexiona sobre tu dominio de las derivadas de las funciones trigonométricas, exponencial natural y logarítmica.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Memorizo y aplico d/dx[sin x]=cos x, d/dx[cos x]=−sin x, d/dx[tan x]=sec²x correctamente.", escala: escala4 },
          { descripcion: "Aplico d/dx[eˣ]=eˣ y d/dx[ln x]=1/x, y las combino con la regla de la cadena para funciones compuestas.", escala: escala4 },
          { descripcion: "Derivo funciones compuestas tipo sin(g(x)), e^(g(x)) o ln(g(x)) aplicando correctamente la cadena.", escala: escala4 },
          { descripcion: "Combino reglas del producto, cociente y cadena con las derivadas trigonométricas y trascendentes en una sola expresión.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué la función eˣ es especial en el cálculo diferencial? Explica la propiedad d/dx[eˣ] = eˣ con tus propias palabras y da un ejemplo de aplicación en física o biología.",
      },
    },
  ],

  // ════════════ P06 — Máximos, mínimos y puntos de inflexión ════════════
  [
    {
      titulo: "Verdadero o Falso — Análisis de funciones con la derivada",
      descripcion: "Decide si cada afirmación sobre el uso de la derivada para encontrar máximos, mínimos y puntos de inflexión es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Si f'(c) = 0, entonces x = c es un máximo o mínimo local de f.",
            respuesta: false,
            retroalimentacion: "Falso. Si f'(c) = 0, entonces c es un punto crítico, pero puede ser máximo, mínimo o ninguno de los dos (por ejemplo, un punto de inflexión con tangente horizontal). Se necesita la prueba de la segunda derivada o del cambio de signo para clasificarlo.",
          },
          {
            enunciado: "Si f'(c) = 0 y f''(c) > 0, entonces f tiene un mínimo local en x = c.",
            respuesta: true,
            retroalimentacion: "Correcto. La prueba de la segunda derivada: f''(c) > 0 significa que la función es cóncava hacia arriba en c, lo que indica un mínimo local.",
          },
          {
            enunciado: "Un punto de inflexión es donde la concavidad de f cambia de signo, lo cual ocurre donde f''(x) = 0 o f''(x) no existe.",
            respuesta: true,
            retroalimentacion: "Correcto. Los puntos de inflexión potenciales están donde f''(x) = 0 o no existe. Para confirmar, debe haber cambio de signo en f''(x) a ambos lados del punto.",
          },
          {
            enunciado: "Si f'(x) > 0 en un intervalo (a, b), entonces f es decreciente en ese intervalo.",
            respuesta: false,
            retroalimentacion: "Falso. Si f'(x) > 0 en (a, b), entonces f es CRECIENTE en ese intervalo (la derivada positiva indica pendiente positiva, la función sube).",
          },
          {
            enunciado: "Para f(x) = x³, el punto x = 0 es un punto de inflexión (no es máximo ni mínimo) porque f'(0) = 0 pero f''(0) = 0 también, y f'' cambia de signo en x = 0.",
            respuesta: true,
            retroalimentacion: "Correcto. f'(x)=3x², f'(0)=0; f''(x)=6x, f''(0)=0. Para x<0, f''<0 (cóncava abajo); para x>0, f''>0 (cóncava arriba). Hay cambio de concavidad: es un punto de inflexión.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Máximos, mínimos y puntos de inflexión",
      descripcion: "Glosario interactivo sobre el análisis de funciones usando la primera y segunda derivada: puntos críticos, extremos relativos, concavidad e inflexión.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Punto crítico",
            definicion: "Un punto c es crítico de f si f'(c) = 0 o f'(c) no existe. Todo extremo local está en un punto crítico, pero no todo punto crítico es extremo.",
            ejemplo: "f(x) = x³: f'(x) = 3x², f'(0) = 0 → x=0 es crítico. Pero x=0 es un punto de inflexión, no un extremo.",
            etiquetas: ["punto crítico", "extremo"],
          },
          {
            termino: "Prueba de la primera derivada",
            definicion: "Si f' cambia de + a − en c → máximo local. Si f' cambia de − a + en c → mínimo local. Si f' no cambia de signo en c → no es extremo (posible inflexión).",
            ejemplo: "f(x)=x²−4x+3: f'(x)=2x−4=0 → x=2. Para x<2, f'<0 (decrece); para x>2, f'>0 (crece). Cambio −→+: mínimo local en x=2.",
            etiquetas: ["primera derivada", "extremo local"],
          },
          {
            termino: "Prueba de la segunda derivada",
            definicion: "Si f'(c)=0 y f''(c)>0 → mínimo local (cóncava arriba). Si f'(c)=0 y f''(c)<0 → máximo local (cóncava abajo). Si f''(c)=0 → la prueba es inconclusa.",
            ejemplo: "f(x)=x²−4x+3: f''(x)=2>0 en x=2 → mínimo local confirmado.",
            etiquetas: ["segunda derivada", "prueba"],
          },
          {
            termino: "Concavidad",
            definicion: "Si f''(x) > 0 en (a,b) → f es cóncava hacia arriba (taza de café boca arriba). Si f''(x) < 0 en (a,b) → f es cóncava hacia abajo (taza invertida).",
            ejemplo: "f(x)=x²: f''(x)=2>0 para todo x → siempre cóncava hacia arriba. f(x)=−x²: f''(x)=−2<0 → siempre cóncava hacia abajo.",
            etiquetas: ["concavidad", "segunda derivada"],
          },
          {
            termino: "Punto de inflexión",
            definicion: "Punto (c, f(c)) donde la concavidad cambia de signo. Condición necesaria: f''(c) = 0 o f''(c) no existe, y f'' debe cambiar de signo a ambos lados de c.",
            ejemplo: "f(x)=x³: f''(x)=6x. Para x<0, f''<0 (cóncava abajo); para x>0, f''>0 (cóncava arriba). Cambio de signo en x=0: punto de inflexión en (0,0).",
            etiquetas: ["punto de inflexión", "concavidad"],
          },
          {
            termino: "Análisis completo de una función",
            definicion: "Procedimiento: (1) Dominio; (2) Interceptos; (3) f'(x)=0 → puntos críticos, intervalos crecientes/decrecientes; (4) f''(x)=0 → concavidad, puntos de inflexión; (5) Extremos; (6) Gráfica.",
            ejemplo: "Para f(x)=x³−3x: f'=3x²−3=0→x=±1 (extremos). f''=6x: f''(1)=6>0 (mín), f''(−1)=−6<0 (máx). Inflexión en x=0.",
            etiquetas: ["análisis de función", "procedimiento"],
          },
        ],
        actividad_final: "Analiza completamente f(x) = x³ − 6x² + 9x + 1: (a) calcula f'(x) y encuentra los puntos críticos, (b) clasifícalos con la prueba de la segunda derivada, (c) determina intervalos de concavidad y punto(s) de inflexión, (d) esboza la gráfica.",
      },
    },
    {
      titulo: "Completa los espacios — Máximos, mínimos e inflexión",
      descripcion: "Completa los conceptos del análisis de funciones con la primera y segunda derivada.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o valor correcto.",
        texto_con_huecos: "Si f'(c) = 0 y f''(c) > 0, entonces f tiene un ___ local en x = c. Si f'(x) > 0 en un intervalo, la función es ___ en ese intervalo. Un punto de inflexión ocurre donde la ___ de f cambia de signo. Para f(x) = x² − 6x + 5, la derivada es f'(x) = 2x − 6 = 0 cuando x = ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "mínimo",
            alternativas_aceptadas: ["minimo", "mínimo local"],
            pista: "f''(c) > 0 → función cóncava hacia arriba → el punto crítico es un ___ local.",
          },
          {
            posicion: 1,
            respuesta_correcta: "creciente",
            alternativas_aceptadas: ["creciendo", "crece"],
            pista: "Derivada positiva significa que la función va hacia arriba: es ___ .",
          },
          {
            posicion: 2,
            respuesta_correcta: "concavidad",
            alternativas_aceptadas: ["segunda derivada"],
            pista: "Los puntos de inflexión están donde la ___ (cóncava arriba/abajo) cambia de dirección.",
          },
          {
            posicion: 3,
            respuesta_correcta: "3",
            alternativas_aceptadas: [],
            pista: "2x − 6 = 0 → 2x = 6 → x = ?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Análisis de funciones: máximos, mínimos e inflexión",
      descripcion: "Reflexiona sobre tu capacidad de analizar funciones usando la primera y segunda derivada para encontrar extremos y puntos de inflexión.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Encuentro los puntos críticos de f igualando f'(x) = 0 y los clasifico con la prueba de la primera o segunda derivada.", escala: escala4 },
          { descripcion: "Determino los intervalos donde f es creciente (f'>0) y decreciente (f'<0) a partir de los puntos críticos.", escala: escala4 },
          { descripcion: "Identifico la concavidad de f usando f''(x) y encuentro los puntos de inflexión donde f'' cambia de signo.", escala: escala4 },
          { descripcion: "Realizo un análisis completo de una función (dominio, interceptos, extremos, concavidad, inflexión) y esbozo su gráfica.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cuál es la diferencia entre un máximo absoluto y un máximo local? ¿Cómo determinarías cuál es el máximo absoluto de una función continua en un intervalo cerrado [a, b]?",
      },
    },
  ],

  // ════════════ P07 — Problemas de optimización ════════════
  [
    {
      titulo: "Verdadero o Falso — Optimización con la derivada",
      descripcion: "Decide si cada afirmación sobre la resolución de problemas de optimización usando la derivada en contextos reales es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Para optimizar una función en un intervalo cerrado [a, b], el valor óptimo (máximo o mínimo absoluto) puede ocurrir en un punto crítico interior o en los extremos del intervalo.",
            respuesta: true,
            retroalimentacion: "Correcto. El Teorema del Valor Extremo garantiza que el óptimo absoluto de una función continua en [a, b] está en un punto crítico o en los extremos a o b. Siempre hay que evaluar f en todos estos puntos.",
          },
          {
            enunciado: "Si se quiere maximizar el área de un rectángulo con perímetro fijo P = 40 m, la función a optimizar es A = largo × ancho, sujeta a 2(largo + ancho) = 40.",
            respuesta: true,
            retroalimentacion: "Correcto. El perímetro fijo es la restricción, y el área es la función objetivo. Al despejar, por ejemplo ancho = 20 − largo, se obtiene A(largo) = largo(20 − largo), que se optimiza con A'(largo) = 0.",
          },
          {
            enunciado: "Para maximizar el área de un rectángulo con perímetro fijo, el óptimo es siempre un cuadrado (largo = ancho).",
            respuesta: true,
            retroalimentacion: "Correcto. Para P = 4k fijo, A = x(k−x), A'=k−2x=0 → x=k/2. Así largo = ancho = k/2: el rectángulo óptimo es un cuadrado.",
          },
          {
            enunciado: "En un problema de optimización, después de plantear la función objetivo y la restricción, se debe derivar la función objetivo, igualar a cero y resolver; eso garantiza automáticamente un máximo global.",
            respuesta: false,
            retroalimentacion: "Falso. Igualar la derivada a cero encuentra puntos críticos, pero se debe verificar si son máximos o mínimos (con la segunda derivada o evaluando en los extremos del dominio factible). No hay garantía automática de ser un máximo global sin esa verificación.",
          },
          {
            enunciado: "En economía, el beneficio B(q) se maximiza cuando B'(q) = 0, es decir, cuando el ingreso marginal iguala al costo marginal.",
            respuesta: true,
            retroalimentacion: "Correcto. B(q) = I(q) − C(q), donde I es ingreso y C es costo. B'(q) = I'(q) − C'(q) = 0 → I'(q) = C'(q): ingreso marginal = costo marginal. Este es el principio de optimización en microeconomía.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Optimización con la derivada",
      descripcion: "Glosario interactivo sobre los conceptos clave para resolver problemas de optimización: función objetivo, restricción, método de optimización y contextos reales.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Función objetivo",
            definicion: "La cantidad que se desea maximizar o minimizar en un problema de optimización (área, volumen, costo, beneficio, tiempo, etc.). Se expresa en términos de una o más variables.",
            ejemplo: "Maximizar el área A = l·w de una parcela rectangular. La función objetivo es A(l, w) = l·w.",
            etiquetas: ["función objetivo", "optimización"],
          },
          {
            termino: "Restricción",
            definicion: "Condición que limita los valores posibles de las variables (perímetro fijo, presupuesto fijo, volumen fijo, etc.). Se usa para reducir la función objetivo a una sola variable.",
            ejemplo: "Perímetro fijo P = 2l + 2w = 100 m → w = 50 − l. La restricción convierte A(l,w) en A(l) = l(50−l).",
            etiquetas: ["restricción", "variable", "condición"],
          },
          {
            termino: "Procedimiento de optimización",
            definicion: "1) Identificar la función objetivo Q. 2) Escribir la restricción y despejar para reducir Q a una sola variable. 3) Calcular Q'=0 → puntos críticos. 4) Verificar si es máximo o mínimo. 5) Responder con unidades.",
            ejemplo: "Problema: ¿qué dimensiones de caja sin tapa maximizan el volumen si una plancha cuadrada de lado 12 cm tiene esquinas cuadradas cortadas?",
            etiquetas: ["procedimiento", "pasos", "optimización"],
          },
          {
            termino: "Optimización en geometría",
            definicion: "Problemas clásicos: maximizar área dado el perímetro, minimizar perímetro dada el área, maximizar volumen dado el material superficial. La solución suele ser una figura simétrica (cuadrado, cubo, cilindro).",
            ejemplo: "Maximizar área de rectángulo con P=40: A(x)=x(20−x), A'=20−2x=0 → x=10. Área máxima = 100 m², es un cuadrado de lado 10.",
            etiquetas: ["geometría", "área", "volumen"],
          },
          {
            termino: "Optimización en economía",
            definicion: "Maximizar beneficio B(q) = I(q) − C(q) o minimizar costo promedio C(q)/q. La condición de primer orden B'(q) = 0 da ingreso marginal = costo marginal.",
            ejemplo: "C(q) = q³ − 6q² + 15q, costo marginal C'(q) = 3q² − 12q + 15. Costo mínimo se da en el punto crítico de C'(q) = 0.",
            etiquetas: ["economía", "costo marginal", "beneficio"],
          },
          {
            termino: "Teorema del Valor Extremo",
            definicion: "Toda función continua en [a, b] alcanza su máximo y mínimo absolutos. Estos ocurren en puntos críticos interiores o en los extremos a y b. Siempre se evalúa f en todos esos candidatos.",
            ejemplo: "f(x)=x³−3x en [0,2]: f'=3x²−3=0→x=1. f(0)=0, f(1)=−2, f(2)=2. Máx. abs.=2 en x=2; mín. abs.=−2 en x=1.",
            etiquetas: ["Teorema del Valor Extremo", "máximo absoluto"],
          },
        ],
        actividad_final: "Un granjero dispone de 80 m de malla para cercar una parcela rectangular. Un lado de la parcela colinda con un río y no necesita malla. ¿Qué dimensiones maximizan el área de la parcela? Plantea la función objetivo, aplica la derivada y verifica que es un máximo.",
      },
    },
    {
      titulo: "Completa los espacios — Optimización",
      descripcion: "Completa los pasos y conceptos del proceso de optimización con la derivada.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o valor correcto.",
        texto_con_huecos: "En un problema de optimización, la cantidad que se desea maximizar o minimizar se llama función ___. Para maximizar el área de un rectángulo con perímetro P = 4k, el valor óptimo es largo = ancho = k, es decir, la forma óptima es un ___. El Teorema del Valor Extremo garantiza que el óptimo absoluto de una función continua en [a,b] ocurre en un punto crítico o en los ___ del intervalo. En economía, el beneficio B(q) se maximiza cuando el ingreso marginal ___ al costo marginal.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "objetivo",
            alternativas_aceptadas: ["funcion objetivo", "función objetivo"],
            pista: "La cantidad a maximizar o minimizar es la función ___ del problema.",
          },
          {
            posicion: 1,
            respuesta_correcta: "cuadrado",
            alternativas_aceptadas: ["cuadrado"],
            pista: "Cuando largo = ancho, el rectángulo es un ___ .",
          },
          {
            posicion: 2,
            respuesta_correcta: "extremos",
            alternativas_aceptadas: ["extremos del intervalo"],
            pista: "El óptimo absoluto en [a,b] ocurre en puntos críticos interiores o en los ___ del intervalo (x=a o x=b).",
          },
          {
            posicion: 3,
            respuesta_correcta: "iguala",
            alternativas_aceptadas: ["es igual", "es igual al"],
            pista: "B'(q) = I'(q) − C'(q) = 0 → I'(q) ___ C'(q): ingreso marginal = costo marginal.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Problemas de optimización",
      descripcion: "Reflexiona sobre tu capacidad de plantear y resolver problemas de optimización con la derivada en contextos reales.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico la función objetivo y la restricción en un problema de optimización contextualizado.", escala: escala4 },
          { descripcion: "Reduzco la función objetivo a una sola variable usando la restricción y la derivo para encontrar puntos críticos.", escala: escala4 },
          { descripcion: "Verifico si el punto crítico es máximo o mínimo usando la segunda derivada o el Teorema del Valor Extremo.", escala: escala4 },
          { descripcion: "Interpreto la solución en el contexto del problema (unidades, significado geométrico o económico) y la comunico con claridad.", escala: escala4 },
        ],
        reflexion_final_prompt: "Inventa un problema de optimización de la vida cotidiana (puede ser de construcción, empaque, agricultura, economía o biología). Descríbelo, identifica qué se optimiza y cuál es la restricción. No es necesario que lo resuelvas completamente, pero sí que plantees la función objetivo y la restricción.",
      },
    },
  ],

  // ════════════ P08 — Diferencial y aproximaciones lineales ════════════
  [
    {
      titulo: "Verdadero o Falso — Diferencial y aproximación lineal",
      descripcion: "Decide si cada afirmación sobre la noción de diferencial dy = f'(x)dx y su uso en aproximaciones lineales es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "El diferencial dy se define como dy = f'(x)·dx, donde dx es un incremento arbitrario en x (no necesariamente pequeño).",
            respuesta: true,
            retroalimentacion: "Correcto. La definición de diferencial es dy = f'(x)·dx para cualquier dx. La aproximación f(x+dx) ≈ f(x)+dy es precisa cuando dx es pequeño.",
          },
          {
            enunciado: "La aproximación lineal (linealización) de f cerca de x = a es L(x) = f(a) + f'(a)(x − a), que es la ecuación de la recta tangente en ese punto.",
            respuesta: true,
            retroalimentacion: "Correcto. La linealización L(x) = f(a) + f'(a)(x−a) es precisamente la recta tangente a f en (a, f(a)), y es la mejor aproximación lineal de f cerca de a.",
          },
          {
            enunciado: "Para f(x) = √x, usando el diferencial se puede aproximar √(4.1) ≈ √4 + (1/(2√4))·0.1 = 2 + 0.025 = 2.025.",
            respuesta: true,
            retroalimentacion: "Correcto. f(x)=√x, f'(x)=1/(2√x). En x=4: f'(4)=1/4. dy = (1/4)·0.1 = 0.025. Aproximación: √4.1 ≈ 2+0.025 = 2.025. Valor real: ≈2.02485. Excelente aproximación.",
          },
          {
            enunciado: "El diferencial dy y el incremento real Δy = f(x+Δx) − f(x) son siempre iguales.",
            respuesta: false,
            retroalimentacion: "Falso. dy ≈ Δy solo para Δx pequeño. En general, Δy = f'(x)Δx + ε·Δx donde ε → 0 cuando Δx → 0. El diferencial dy = f'(x)dx es la aproximación lineal del cambio real Δy.",
          },
          {
            enunciado: "La aproximación lineal f(x) ≈ f(a) + f'(a)(x−a) es más precisa cuanto más cerca esté x de a.",
            respuesta: true,
            retroalimentacion: "Correcto. El error de la aproximación lineal es proporcional a (x−a)², por lo que cuanto menor sea la distancia |x−a|, mayor es la precisión de la aproximación.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Diferencial y aproximación lineal",
      descripcion: "Glosario interactivo sobre el diferencial dy = f'(x)dx, la linealización y las aplicaciones de las aproximaciones lineales.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Diferencial dy",
            definicion: "Para y = f(x), el diferencial es dy = f'(x)·dx. Representa el cambio aproximado en y cuando x cambia en dx. Es la 'parte lineal' del cambio real Δy.",
            ejemplo: "y = x³: dy = 3x²·dx. En x=2 con dx=0.1: dy = 3(4)(0.1) = 1.2. Cambio real Δy = 2.1³−8 = 9.261−8 = 1.261.",
            etiquetas: ["diferencial", "dy", "dx"],
          },
          {
            termino: "Incremento real Δy",
            definicion: "Δy = f(x+Δx) − f(x). Es el cambio exacto en y. Para Δx pequeño, Δy ≈ dy = f'(x)·Δx. El error es de orden (Δx)².",
            ejemplo: "f(x)=x²: Δy = (x+Δx)²−x² = 2x·Δx + (Δx)². El diferencial dy = 2x·Δx captura el término principal.",
            etiquetas: ["incremento", "Δy", "cambio exacto"],
          },
          {
            termino: "Linealización (aproximación lineal)",
            definicion: "L(x) = f(a) + f'(a)(x−a). La función lineal L(x) aproxima a f(x) cerca de x = a. Es la recta tangente vista como función aproximante.",
            ejemplo: "f(x)=eˣ, a=0: L(x)=e⁰+e⁰(x−0)=1+x. Así e^(0.1) ≈ 1+0.1=1.1 (valor real: ≈1.10517).",
            etiquetas: ["linealización", "aproximación lineal", "tangente"],
          },
          {
            termino: "Error en la aproximación lineal",
            definicion: "El error cometido es |Δy − dy| ≈ |f''(c)|·(Δx)²/2. Es de orden cuadrático en Δx: para Δx = 0.1, el error es del orden 0.01, mucho menor.",
            ejemplo: "f(x)=x²: Δy=2x·Δx+(Δx)². dy=2x·Δx. Error = (Δx)². Para Δx=0.1: error = 0.01 (1% del incremento de primer orden).",
            etiquetas: ["error", "aproximación", "orden cuadrático"],
          },
          {
            termino: "Aplicación: estimación de raíces y potencias",
            definicion: "El diferencial permite estimar valores difíciles de calcular a mano: ⁿ√(a+h) ≈ ⁿ√a + h/(n·a^((n−1)/n)), usando la linealización de f(x) = x^(1/n).",
            ejemplo: "√(25.3) ≈ √25 + 0.3/(2√25) = 5 + 0.3/10 = 5.03. Valor real: ≈5.0299. Error < 0.001.",
            etiquetas: ["estimación", "raíces", "aplicación"],
          },
          {
            termino: "Diferencial en contextos de error",
            definicion: "Si se mide x con un error Δx, la propagación del error en y = f(x) es aproximadamente |Δy| ≈ |f'(x)|·|Δx|. Útil en laboratorio, topografía, ingeniería.",
            ejemplo: "Radio de esfera medido con error ±0.05 cm. V = (4/3)πr³. dV = 4πr²·dr. Con r=10, dr=0.05: dV = 4π(100)(0.05) ≈ 62.8 cm³ de error en volumen.",
            etiquetas: ["propagación del error", "medición", "aplicación"],
          },
        ],
        actividad_final: "Usando el diferencial, aproxima: (a) ∛(8.1) (f(x)=x^(1/3) en x=8), (b) ln(1.05) (f(x)=ln x en x=1), (c) sin(31°) en radianes (f(x)=sin x en x=π/6=30°). Compara con el valor real de calculadora y calcula el error absoluto.",
      },
    },
    {
      titulo: "Completa los espacios — Diferencial y aproximación lineal",
      descripcion: "Completa los valores y conceptos clave sobre el diferencial y la aproximación lineal de funciones.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el valor o expresión correcto.",
        texto_con_huecos: "El diferencial de y = f(x) se define como dy = ___ · dx. La linealización de f cerca de x = a es L(x) = f(a) + f'(a)·(x − ___). Para f(x) = √x, el diferencial es dy = ___ · dx. Usando la aproximación lineal de eˣ en x = 0, se tiene e^(0.2) ≈ 1 + ___ = 1.2.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "f'(x)",
            alternativas_aceptadas: ["f prima de x", "la derivada de f"],
            pista: "dy = ___ · dx, donde ___ es la derivada de f respecto a x.",
          },
          {
            posicion: 1,
            respuesta_correcta: "a",
            alternativas_aceptadas: [],
            pista: "La linealización en x = a es L(x) = f(a) + f'(a)·(x − ___). El punto de tangencia es x = a.",
          },
          {
            posicion: 2,
            respuesta_correcta: "1/(2√x)",
            alternativas_aceptadas: ["1/2√x", "(1/2)x^(-1/2)"],
            pista: "f(x) = √x = x^(1/2), f'(x) = (1/2)x^(−1/2) = ?",
          },
          {
            posicion: 3,
            respuesta_correcta: "0.2",
            alternativas_aceptadas: [],
            pista: "L(x) = 1 + x en x = 0 (linealización de eˣ). Para x = 0.2: L(0.2) = 1 + ?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Diferencial y aproximación lineal",
      descripcion: "Reflexiona sobre tu comprensión del diferencial dy = f'(x)dx y su uso en la aproximación lineal de funciones.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Calculo el diferencial dy = f'(x)·dx para funciones polinomiales, trigonométricas, exponenciales y logarítmicas.", escala: escala4 },
          { descripcion: "Escribo la linealización L(x) = f(a) + f'(a)(x−a) de una función en un punto dado y la uso para estimar valores.", escala: escala4 },
          { descripcion: "Distingo entre el incremento real Δy y el diferencial dy, y comprendo que dy ≈ Δy cuando dx es pequeño.", escala: escala4 },
          { descripcion: "Aplico el diferencial para estimar la propagación del error en mediciones o para aproximar valores difíciles como raíces o logaritmos.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿En qué situaciones de la vida real sería útil usar la aproximación lineal en lugar de un cálculo exacto? Da dos ejemplos concretos (pueden ser de ingeniería, física, economía o ciencias). ¿Qué tan grande puede ser el error de la aproximación lineal antes de que sea inaceptable?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
