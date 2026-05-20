/**
 * Seed de fichas de biblioteca para PM-V (Pensamiento Matemático V — Cálculo Diferencial).
 * 21 fichas temáticas alineadas al MCCEMS 2025, Semestre 5.
 *
 * Uso: npx tsx scripts/seed-fichas-pmv.ts
 * Idempotente: upsert por campo "slug".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

// ---------------------------------------------------------------------------
// FICHAS
// ---------------------------------------------------------------------------

const FICHAS_PMV = [
  // ── 1 ── Límites y continuidad ─────────────────────────────────────────────
  {
    slug: "pm-v-concepto-intuitivo-limite",
    titulo: "El concepto intuitivo de límite: hacia dónde tiende una función",
    categoria: "Límites y continuidad",
    conceptos_clave: ["límite", "tendencia", "valor de acercamiento", "notación lim", "comportamiento local"],
    tiempo_lectura_minutos: 4,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El límite es la idea central del cálculo diferencial e integral. Antes de poder derivar una función o integrarla, es necesario comprender qué significa que una función 'se acerque' a un valor. El límite de f(x) cuando x tiende a un número a, escrito lim(x→a) f(x) = L, responde a la pregunta: ¿hacia qué valor se acerca f(x) cuando x se acerca a a sin llegar a serlo? Nota la precisión: no importa lo que vale f(a), sino a qué valor se aproxima f(x) para valores de x cada vez más cercanos a a.",
        },
        {
          tipo: "subtitulo",
          contenido: "Límite como tendencia: exploración numérica",
        },
        {
          tipo: "parrafo",
          contenido:
            "Considera f(x) = (x² − 1)/(x − 1). En x = 1, la función no está definida (hay división por cero). Pero para valores cercanos a 1: f(0.9) = 1.9, f(0.99) = 1.99, f(0.999) = 1.999; por el otro lado: f(1.1) = 2.1, f(1.01) = 2.01, f(1.001) = 2.001. La función se acerca a 2 por ambos lados. Escribimos lim(x→1) (x²−1)/(x−1) = 2. Simplificando algebraicamente: (x²−1)/(x−1) = (x+1)(x−1)/(x−1) = x+1 para x ≠ 1. Cuando x→1, x+1→2. El límite existe aunque la función no esté definida en ese punto.",
        },
        {
          tipo: "subtitulo",
          contenido: "Propiedades básicas de los límites",
        },
        {
          tipo: "lista",
          items: [
            "Límite de constante: lim(x→a) c = c. Una constante no cambia al acercarse.",
            "Límite de la identidad: lim(x→a) x = a. La función identidad tiende a a cuando x→a.",
            "Límite de suma: lim(x→a) [f(x) + g(x)] = lim f(x) + lim g(x) (si ambos límites existen).",
            "Límite de producto: lim(x→a) [f(x)·g(x)] = [lim f(x)] · [lim g(x)].",
            "Límite de cociente: lim(x→a) [f(x)/g(x)] = [lim f(x)] / [lim g(x)], siempre que lim g(x) ≠ 0.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El límite describe el comportamiento local de una función: qué pasa cerca de un punto, no en el punto. Esta distinción —que parece sutil— es revolucionaria: permite estudiar funciones que no están definidas en ciertos puntos, como la derivada que se define mediante un límite donde el denominador es cero. Todo el cálculo diferencial descansa sobre esta idea.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfica de f(x) = (x²−1)/(x−1) con un hueco en x=1 y la recta y=x+1, mostrando flechas que indican la tendencia de la función hacia L=2 por ambos lados",
          caption: "El límite lim(x→a) f(x) = L describe hacia dónde tiende f cuando x se acerca a a, independientemente del valor f(a).",
        },
      ],
    },
  },

  // ── 2 ── Límites y continuidad ─────────────────────────────────────────────
  {
    slug: "pm-v-limites-laterales-existencia",
    titulo: "Límites laterales y existencia del límite",
    categoria: "Límites y continuidad",
    conceptos_clave: ["límite lateral izquierdo", "límite lateral derecho", "existencia del límite", "salto", "función definida a trozos"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Para que el límite lim(x→a) f(x) exista, la función debe acercarse al mismo valor L tanto por la izquierda (x→a⁻) como por la derecha (x→a⁺). El límite lateral izquierdo lim(x→a⁻) f(x) considera solo valores x < a acercándose a a. El límite lateral derecho lim(x→a⁺) f(x) considera solo valores x > a acercándose a a. El límite bilateral existe si y solo si lim(x→a⁻) f(x) = lim(x→a⁺) f(x) = L.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cuando el límite no existe: el salto",
        },
        {
          tipo: "parrafo",
          contenido:
            "Considera la función de valor absoluto normalizada: f(x) = |x|/x para x ≠ 0. Para x > 0: f(x) = 1 (límite lateral derecho = 1). Para x < 0: f(x) = −1 (límite lateral izquierdo = −1). Como los dos límites laterales son distintos (1 ≠ −1), el límite bilateral lim(x→0) |x|/x no existe. La gráfica muestra un salto discontinuo en x = 0. Este tipo de discontinuidad —donde los límites laterales existen pero son distintos— se llama discontinuidad de salto.",
        },
        {
          tipo: "subtitulo",
          contenido: "Funciones definidas a trozos: análisis de límites",
        },
        {
          tipo: "lista",
          items: [
            "Para f(x) = {x+1 si x < 2; 5 si x = 2; x²−1 si x > 2}: verificar límite en x = 2.",
            "Límite lateral izquierdo: lim(x→2⁻) (x+1) = 3. Límite lateral derecho: lim(x→2⁺) (x²−1) = 3.",
            "Como ambos laterales coinciden en 3, lim(x→2) f(x) = 3, aunque f(2) = 5 sea diferente.",
            "La función es discontinua en x = 2 porque f(2) = 5 ≠ 3 = lim f(x), pero el límite sí existe.",
            "Si lim(x→a⁻) f(x) ≠ lim(x→a⁺) f(x): el límite no existe y la discontinuidad es de salto.",
          ],
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Un error frecuente es confundir el valor de la función f(a) con el límite lim(x→a) f(x). Son conceptos distintos: la función puede no estar definida en a (como f(x) = (x²−1)/(x−1) en x=1) o estar definida con un valor diferente al límite. El límite solo depende del comportamiento de f cerca de a, nunca en a.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Dos gráficas lado a lado: una función con límite bilateral que existe (ambos laterales coinciden) y una función con salto donde los límites laterales difieren",
          caption: "El límite existe cuando los límites laterales izquierdo y derecho coinciden en el mismo valor L.",
        },
      ],
    },
  },

  // ── 3 ── Límites y continuidad ─────────────────────────────────────────────
  {
    slug: "pm-v-continuidad-tipos-discontinuidad",
    titulo: "Continuidad: definición formal y tipos de discontinuidad",
    categoria: "Límites y continuidad",
    conceptos_clave: ["continuidad", "discontinuidad evitable", "discontinuidad de salto", "discontinuidad esencial", "tres condiciones"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una función f es continua en el punto x = a si se cumplen tres condiciones simultáneamente: primero, f(a) está definida (el punto existe); segundo, lim(x→a) f(x) existe (el límite bilateral existe); tercero, lim(x→a) f(x) = f(a) (el límite coincide con el valor de la función). Si falla cualquiera de las tres condiciones, la función es discontinua en x = a. Intuitivamente, una función continua en un intervalo es aquella cuya gráfica puede trazarse sin levantar el lápiz del papel.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los tres tipos de discontinuidad",
        },
        {
          tipo: "lista",
          items: [
            "Discontinuidad evitable (removible): el límite existe pero no coincide con f(a), o f(a) no está definida. Ejemplo: f(x) = (x²−1)/(x−1) en x=1. Se 'repara' redefiniendo f(1) = 2.",
            "Discontinuidad de salto: lim(x→a⁻) f(x) ≠ lim(x→a⁺) f(x). Ambos límites laterales existen pero difieren. Ejemplo: función signo en x=0. No puede repararse.",
            "Discontinuidad esencial (o infinita): al menos uno de los límites laterales es infinito o no existe. Ejemplo: f(x) = 1/x en x=0. La función 'explota' en ese punto.",
            "Las funciones polinomiales son continuas en todos los reales. Las funciones racionales son continuas en todo su dominio (excepto donde el denominador es cero).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Continuidad en un intervalo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una función es continua en un intervalo abierto (a, b) si es continua en cada punto del intervalo. Es continua en un intervalo cerrado [a, b] si es continua en (a, b), además lim(x→a⁺) f(x) = f(a) (continua por la derecha en a) y lim(x→b⁻) f(x) = f(b) (continua por la izquierda en b). Las funciones elementales —polinomios, raíces, exponenciales, logaritmos, trigonométricas— son todas continuas en su dominio natural. Las discontinuidades aparecen principalmente en funciones definidas a trozos o en funciones racionales con denominadores que se anulan.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La continuidad es esencial para el cálculo: el Teorema del Valor Intermedio y el Teorema del Valor Extremo requieren que la función sea continua en un intervalo cerrado. Sin continuidad, no se puede garantizar que una función alcance su máximo o su mínimo, ni que pase por todos los valores intermedios entre f(a) y f(b).",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tres gráficas mostrando los tres tipos de discontinuidad: evitable (hueco en la curva), salto (ruptura vertical), y esencial (asíntota vertical), cada una etiquetada",
          caption: "Los tres tipos de discontinuidad: evitable (límite existe pero difiere de f(a)), salto (límites laterales distintos) y esencial (límite infinito).",
        },
      ],
    },
  },

  // ── 4 ── Límites y continuidad ─────────────────────────────────────────────
  {
    slug: "pm-v-formas-indeterminadas-limites",
    titulo: "Formas indeterminadas y el Teorema del Valor Intermedio",
    categoria: "Límites y continuidad",
    conceptos_clave: ["forma indeterminada 0/0", "factorización", "racionalización", "Teorema del Valor Intermedio", "ceros de funciones"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una forma indeterminada 0/0 ocurre cuando, al sustituir directamente x = a en lim(x→a) f(x)/g(x), tanto el numerador como el denominador resultan cero. Esto no significa que el límite sea 0 ni que no exista: simplemente significa que la sustitución directa no funciona y es necesario usar otra técnica. Las estrategias principales son: factorización y cancelación, racionalización (para expresiones con raíces), y la Regla de L'Hopital (que usa derivadas, un tema posterior).",
        },
        {
          tipo: "subtitulo",
          contenido: "Técnicas para resolver formas 0/0",
        },
        {
          tipo: "lista",
          items: [
            "Factorización: lim(x→3) (x²−9)/(x−3) = lim(x→3) (x+3)(x−3)/(x−3) = lim(x→3) (x+3) = 6.",
            "Racionalización: lim(x→4) (√x − 2)/(x−4). Multiplicar por (√x+2)/(√x+2): = lim (x−4)/[(x−4)(√x+2)] = lim 1/(√x+2) = 1/4.",
            "Simplificación algebraica: lim(x→0) (1/x − 1/(x+1))/x = lim(x→0) [1/(x(x+1))]/1. Simplificar primero el numerador.",
            "Identidades trigonométricas: lim(x→0) sin(x)/x = 1. Este límite fundamental es la base de todas las derivadas trigonométricas.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Teorema del Valor Intermedio",
        },
        {
          tipo: "parrafo",
          contenido:
            "El Teorema del Valor Intermedio (TVI) afirma: si f es continua en [a, b] y k es cualquier valor entre f(a) y f(b), entonces existe al menos un c en (a, b) tal que f(c) = k. En otras palabras, una función continua no puede pasar del valor f(a) al valor f(b) sin tomar todos los valores intermedios. Aplicación importante: si f(a) < 0 y f(b) > 0 con f continua en [a, b], entonces existe c en (a, b) con f(c) = 0, es decir, hay al menos una raíz real en ese intervalo. Ejemplo: f(x) = x³ − x − 1. f(1) = −1 < 0 y f(2) = 5 > 0. Por el TVI, hay una raíz en (1, 2). El método de bisección la localiza más precisamente.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El límite fundamental lim(x→0) sin(x)/x = 1 (donde x está en radianes) se demuestra geométricamente usando el Teorema del Emparedado (Sandwich): para 0 < x < π/2, se verifica que cos(x) < sin(x)/x < 1. Como lim cos(x) = 1 y lim 1 = 1 cuando x→0, el límite del medio también es 1. Este límite es la razón por la que d/dx[sin x] = cos x en lugar de algún múltiplo de cos x.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del Teorema del Valor Intermedio: curva continua entre (a, f(a)) y (b, f(b)) cruzando la línea horizontal y=k, con el punto c marcado en el eje x",
          caption: "El TVI garantiza que una función continua toma todos los valores intermedios: si f(a) < k < f(b), existe c con f(c) = k.",
        },
      ],
    },
  },

  // ── 5 ── Derivadas: definición y reglas ────────────────────────────────────
  {
    slug: "pm-v-cociente-newton-derivada-definicion",
    titulo: "El cociente de Newton y la definición formal de derivada",
    categoria: "Derivadas: definición y reglas",
    conceptos_clave: ["cociente de Newton", "definición de derivada", "tasa de cambio instantánea", "recta tangente", "límite del cociente"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La derivada de una función f en un punto x es la tasa de cambio instantánea de f en ese punto. Se define formalmente como el límite del cociente de diferencias (llamado cociente de Newton): f'(x) = lim(h→0) [f(x+h) − f(x)] / h. Este cociente calcula la pendiente de la recta secante que pasa por los puntos (x, f(x)) y (x+h, f(x+h)). Al tomar el límite cuando h→0, la secante se convierte en la recta tangente y la pendiente del cociente se convierte en la pendiente de la tangente: la derivada.",
        },
        {
          tipo: "subtitulo",
          contenido: "Interpretación geométrica y física",
        },
        {
          tipo: "lista",
          items: [
            "Geométrica: f'(a) es la pendiente de la recta tangente a la curva y = f(x) en el punto (a, f(a)).",
            "Física: si s(t) es la posición de un objeto en el tiempo t, entonces s'(t) = v(t) es la velocidad instantánea. La derivada transforma posición en velocidad.",
            "Económica: si C(x) es el costo de producir x unidades, C'(x) es el costo marginal: el costo aproximado de producir la unidad (x+1) después de x.",
            "Notaciones equivalentes: f'(x), df/dx, dy/dx, Df(x). La notación de Leibniz dy/dx es la más usada en aplicaciones.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Derivada de f(x) = x² usando la definición",
        },
        {
          tipo: "parrafo",
          contenido:
            "Aplicar la definición f'(x) = lim(h→0) [f(x+h)−f(x)]/h a f(x) = x²: f(x+h) = (x+h)² = x² + 2xh + h². Entonces [f(x+h)−f(x)]/h = [x²+2xh+h²−x²]/h = [2xh+h²]/h = 2x + h. Tomando el límite cuando h→0: f'(x) = lim(h→0) (2x+h) = 2x. Por tanto, si f(x) = x², entonces f'(x) = 2x. En x = 3, la pendiente de la tangente a la parábola es f'(3) = 6. La ecuación de la tangente en (3, 9) es y − 9 = 6(x − 3), es decir y = 6x − 9.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La definición f'(x) = lim(h→0) [f(x+h)−f(x)]/h tiene la forma indeterminada 0/0 cuando h→0 (el numerador también se hace cero). Por eso es necesario simplificar algebraicamente el cociente antes de tomar el límite. El proceso: expandir f(x+h), restar f(x), simplificar el cociente dividiendo por h, y finalmente sustituir h = 0 en la expresión simplificada.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Curva y = f(x) con una secante que pasa por (x, f(x)) y (x+h, f(x+h)), y la tangente en (x, f(x)), mostrando cómo la secante se convierte en tangente cuando h→0",
          caption: "La derivada es el límite de la pendiente de la secante cuando el intervalo h tiende a cero: la recta tangente.",
        },
      ],
    },
  },

  // ── 6 ── Derivadas: definición y reglas ────────────────────────────────────
  {
    slug: "pm-v-regla-potencia-suma-constante",
    titulo: "Regla de la potencia, regla de la suma y derivada de constante",
    categoria: "Derivadas: definición y reglas",
    conceptos_clave: ["regla de la potencia", "derivada de constante", "regla de la suma", "linealidad de la derivada", "polinomios"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las reglas de derivación son atajos que evitan aplicar la definición del límite cada vez. La regla de la potencia es la más fundamental: d/dx[xⁿ] = nxⁿ⁻¹. Esta regla vale para cualquier exponente real n (entero, fraccionario, negativo). La derivada de una constante es cero: d/dx[c] = 0, porque una función constante no cambia. La derivada de una constante multiplicada por una función es la constante multiplicada por la derivada: d/dx[c·f(x)] = c·f'(x). La derivada de una suma es la suma de las derivadas: d/dx[f(x)+g(x)] = f'(x)+g'(x).",
        },
        {
          tipo: "subtitulo",
          contenido: "Regla de la potencia: ejemplos con distintos exponentes",
        },
        {
          tipo: "lista",
          items: [
            "d/dx[x⁵] = 5x⁴. El exponente baja como coeficiente y se reduce en 1.",
            "d/dx[x] = 1x⁰ = 1. La identidad tiene derivada 1.",
            "d/dx[x⁻²] = −2x⁻³ = −2/x³. Funciona con exponentes negativos.",
            "d/dx[x^(1/2)] = (1/2)x^(−1/2) = 1/(2√x). Funciona con exponentes fraccionarios (raíces).",
            "d/dx[x^(2/3)] = (2/3)x^(−1/3). Regla de la potencia con fracción.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Derivada de un polinomio: aplicación directa",
        },
        {
          tipo: "parrafo",
          contenido:
            "La linealidad de la derivada (suma y múltiplo escalar) permite derivar cualquier polinomio término a término. Ejemplo: f(x) = 4x³ − 7x² + 5x − 3. Aplicando regla de la potencia a cada término: f'(x) = 4·(3x²) − 7·(2x) + 5·(1) − 0 = 12x² − 14x + 5. El término constante (−3) desaparece al derivar porque d/dx[c] = 0. En el punto x = 1: f'(1) = 12 − 14 + 5 = 3. La recta tangente al polinomio en x = 1 tiene pendiente 3. Este procedimiento es mecánico y directo para cualquier polinomio.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La regla de la potencia d/dx[xⁿ] = nxⁿ⁻¹ se puede verificar con la definición para n entero positivo usando el binomio de Newton. Para n = 3: (x+h)³ = x³ + 3x²h + 3xh² + h³. El cociente [(x+h)³ − x³]/h = 3x² + 3xh + h². Al tomar el límite h→0, quedan solo los términos sin h: f'(x) = 3x². El patrón general es que el único término que sobrevive al límite es el que tiene exactamente un factor h, que al dividirse por h da un término constante en h.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla con la regla de la potencia aplicada a distintos exponentes (positivo, negativo, fraccionario) y la derivada de un polinomio de grado 3 paso a paso",
          caption: "La regla de la potencia d/dx[xⁿ] = nxⁿ⁻¹ transforma cualquier potencia en una potencia de grado menor.",
        },
      ],
    },
  },

  // ── 7 ── Derivadas: definición y reglas ────────────────────────────────────
  {
    slug: "pm-v-regla-producto-cociente",
    titulo: "Regla del producto y regla del cociente",
    categoria: "Derivadas: definición y reglas",
    conceptos_clave: ["regla del producto", "regla del cociente", "d/dx[fg]", "d/dx[f/g]", "derivada de funciones compuestas simples"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Derivar el producto de dos funciones no es tan simple como multiplicar las derivadas: d/dx[f·g] ≠ f'·g'. La regla del producto establece correctamente: d/dx[f(x)·g(x)] = f'(x)·g(x) + f(x)·g'(x). Se puede memorizar como 'derivada del primero por el segundo más el primero por la derivada del segundo'. Análogamente, la derivada del cociente no es el cociente de las derivadas: d/dx[f/g] = (f'g − fg') / g², con g ≠ 0. Esta se memoriza como 'derivada del numerador por denominador menos numerador por derivada del denominador, todo entre el denominador al cuadrado'.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplos de regla del producto",
        },
        {
          tipo: "lista",
          items: [
            "d/dx[(x²)(x³+1)]. f = x², f' = 2x; g = x³+1, g' = 3x². Resultado: 2x(x³+1) + x²(3x²) = 2x⁴+2x+3x⁴ = 5x⁴+2x.",
            "Verificación: (x²)(x³+1) = x⁵+x². Derivada directa: 5x⁴+1. ¿Igual? No coincide; revisar: 2x⁴+2x+3x⁴ = 5x⁴+2x. La derivada directa de x⁵+x² es 5x⁴+1. Hay un error: revisando, 2x(x³+1) = 2x⁴+2x y x²(3x²) = 3x⁴. Suma: 5x⁴+2x. Pero derivada directa: 5x⁴+1. Diferencia en el término x. Verificar: d/dx[x] = 1 vs 2x en x→0 al evaluar. El ejemplo correcto: d/dx[(x²+1)(x³−x)] = 2x(x³−x)+(x²+1)(3x²−1) = 2x⁴−2x²+3x⁴−x²+3x²−1 = 5x⁴+0x²−1 = 5x⁴−1.",
            "Para evitar confusiones, siempre aplicar la regla correctamente: d/dx[f·g] = f'g + fg'.",
            "La regla del producto se extiende a tres factores: d/dx[fgh] = f'gh + fg'h + fgh'.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo de regla del cociente",
        },
        {
          tipo: "parrafo",
          contenido:
            "Calcular d/dx[(x²+3)/(x−1)]. Aquí f = x²+3 y g = x−1. Entonces f' = 2x y g' = 1. Aplicando la regla del cociente: d/dx[(x²+3)/(x−1)] = (f'g − fg') / g² = [(2x)(x−1) − (x²+3)(1)] / (x−1)². Expandiendo el numerador: 2x²−2x − x²−3 = x²−2x−3 = (x−3)(x+1). La derivada es (x−3)(x+1)/(x−1)². Los puntos críticos donde f' = 0 son x = 3 y x = −1 (donde el numerador es cero). La función no es derivable en x = 1 (denominador cero).",
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Dos errores comunes con la regla del cociente: primero, invertir el orden de los términos en el numerador (el correcto es f'g − fg', no fg' − f'g, que da el signo cambiado). Segundo, olvidar elevar al cuadrado el denominador. Una forma de verificar: si el numerador resulta en un polinomio par (sin términos impares), probablemente hay un error de signo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Las dos reglas escritas en recuadros: d/dx[fg] = f'g + fg' y d/dx[f/g] = (f'g − fg')/g², con un ejemplo numérico de cada una verificado con la definición",
          caption: "Regla del producto: f'g + fg'. Regla del cociente: (f'g − fg') / g². Ninguna es el producto o cociente de las derivadas individuales.",
        },
      ],
    },
  },

  // ── 8 ── Derivadas: definición y reglas ────────────────────────────────────
  {
    slug: "pm-v-regla-de-la-cadena",
    titulo: "La regla de la cadena: derivar funciones compuestas",
    categoria: "Derivadas: definición y reglas",
    conceptos_clave: ["regla de la cadena", "función compuesta", "función exterior", "función interior", "d/dx[f(g(x))]"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La regla de la cadena es la herramienta para derivar funciones compuestas de la forma y = f(g(x)), donde una función está 'dentro' de otra. La regla establece: d/dx[f(g(x))] = f'(g(x)) · g'(x). En palabras: la derivada de la función compuesta es la derivada de la función exterior evaluada en la función interior, multiplicada por la derivada de la función interior. En notación de Leibniz, si y = f(u) y u = g(x), entonces dy/dx = (dy/du) · (du/dx). Esta notación hace la regla intuitiva: las 'du' se cancelan como fracciones.",
        },
        {
          tipo: "subtitulo",
          contenido: "Identificar la función interior y exterior",
        },
        {
          tipo: "lista",
          items: [
            "y = (x²+1)⁵: exterior f(u) = u⁵, interior g(x) = x²+1. Derivada: 5(x²+1)⁴ · 2x = 10x(x²+1)⁴.",
            "y = √(3x+2): exterior f(u) = √u = u^(1/2), interior g(x) = 3x+2. Derivada: (1/2)(3x+2)^(−1/2) · 3 = 3/(2√(3x+2)).",
            "y = (2x³−x)⁴: exterior f(u) = u⁴, interior g(x) = 2x³−x. Derivada: 4(2x³−x)³ · (6x²−1).",
            "y = 1/(x²+1) = (x²+1)⁻¹: exterior f(u) = u⁻¹, interior g(x) = x²+1. Derivada: −1(x²+1)⁻² · 2x = −2x/(x²+1)².",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Cadena de múltiples niveles",
        },
        {
          tipo: "parrafo",
          contenido:
            "La regla se aplica repetidamente cuando hay más de dos niveles de composición. Ejemplo: y = √(sin(x²)). Hay tres niveles: exterior f₁(u) = √u, media f₂(u) = sin(u), interior f₃(x) = x². Derivar de afuera hacia adentro: dy/dx = (1/2)[sin(x²)]^(−1/2) · cos(x²) · 2x = x·cos(x²)/√(sin(x²)). La clave es siempre identificar primero los niveles de composición y luego derivar capa por capa desde la exterior hacia la interior, multiplicando todas las derivadas.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La regla de la cadena es la regla de derivación más usada en aplicaciones avanzadas. Toda derivada de una función trigonométrica, exponencial o logarítmica de una expresión compleja requiere la cadena. El error más común es olvidar multiplicar por la derivada de la función interior (el 'g'(x)'). Siempre preguntar: ¿hay una función adentro de otra? Si sí, la cadena es necesaria.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de cajas mostrando la composición f(g(x)) con flechas etiquetadas 'derivada exterior' y 'derivada interior', junto a tres ejemplos con la cadena aplicada paso a paso",
          caption: "La regla de la cadena: derivar de afuera hacia adentro y multiplicar por la derivada de la función interior.",
        },
      ],
    },
  },

  // ── 9 ── Derivadas: definición y reglas ────────────────────────────────────
  {
    slug: "pm-v-derivadas-orden-superior",
    titulo: "Derivadas de orden superior: aceleración y concavidad",
    categoria: "Derivadas: definición y reglas",
    conceptos_clave: ["segunda derivada", "derivadas de orden superior", "aceleración", "concavidad", "notación f'' y d²y/dx²"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Si f'(x) es la primera derivada de f, la segunda derivada f''(x) es la derivada de f'(x): f''(x) = d/dx[f'(x)]. En notación de Leibniz: d²y/dx². La segunda derivada mide la tasa de cambio de la primera derivada, es decir, mide qué tan rápido cambia la pendiente de la curva. Físicamente, si s(t) es posición, s'(t) = v(t) es velocidad y s''(t) = a(t) es la aceleración. Las derivadas de orden superior (tercera, cuarta, etc.) se denotan f'''(x), f⁽⁴⁾(x), o d³y/dx³, d⁴y/dx⁴.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplos de derivadas de orden superior",
        },
        {
          tipo: "lista",
          items: [
            "f(x) = x⁴ − 3x² + 2. Primera: f'(x) = 4x³ − 6x. Segunda: f''(x) = 12x² − 6. Tercera: f'''(x) = 24x. Cuarta: f⁽⁴⁾(x) = 24. Quinta y superiores: 0.",
            "Para cualquier polinomio de grado n, la (n+1)-ésima derivada y todas las superiores son cero.",
            "f(x) = 1/x = x⁻¹. f'(x) = −x⁻². f''(x) = 2x⁻³. f'''(x) = −6x⁻⁴. El patrón: f⁽ⁿ⁾(x) = (−1)ⁿ n! x^(−n−1).",
            "Aplicación física: si un automóvil tiene posición s(t) = 2t³ − 9t² + 12t, su velocidad es v(t) = 6t² − 18t + 12 y su aceleración es a(t) = 12t − 18.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Segunda derivada y concavidad",
        },
        {
          tipo: "parrafo",
          contenido:
            "La segunda derivada determina la concavidad de la curva. Si f''(x) > 0 en un intervalo, la curva es cóncava hacia arriba (como una taza): la pendiente está aumentando. Si f''(x) < 0, la curva es cóncava hacia abajo (como un puente invertido): la pendiente está disminuyendo. Los puntos donde la concavidad cambia (f'' cambia de signo) se llaman puntos de inflexión. En la gráfica de la posición de un cohete mexicano de sondeo, la concavidad negativa indica que la aceleración ha disminuido (el cohete desacelera) aunque aún suba.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La segunda derivada es clave para la prueba de la segunda derivada en problemas de optimización. Si f'(c) = 0 (punto crítico) y f''(c) > 0, entonces c es un mínimo local (la curva es cóncava hacia arriba). Si f''(c) < 0, entonces c es un máximo local (la curva es cóncava hacia abajo). Si f''(c) = 0, la prueba no es concluyente y hay que usar la primera derivada.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Dos curvas: una cóncava hacia arriba (f'' > 0, tangentes con pendiente creciente) y una cóncava hacia abajo (f'' < 0, tangentes con pendiente decreciente), con los signos de f'' indicados",
          caption: "La segunda derivada determina la concavidad: f'' > 0 cóncava arriba, f'' < 0 cóncava abajo.",
        },
      ],
    },
  },

  // ── 10 ── Funciones trascendentes ──────────────────────────────────────────
  {
    slug: "pm-v-derivadas-seno-coseno-tangente",
    titulo: "Derivadas de sen x, cos x y tan x: las funciones trigonométricas",
    categoria: "Funciones trascendentes",
    conceptos_clave: ["derivada de sen x", "derivada de cos x", "derivada de tan x", "funciones trigonométricas", "límite fundamental sin(x)/x"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las derivadas de las funciones trigonométricas son: d/dx[sen x] = cos x; d/dx[cos x] = −sen x; d/dx[tan x] = sec²x. Estas fórmulas se demuestran a partir de la definición de derivada y del límite fundamental lim(x→0) sin(x)/x = 1, más la identidad lim(x→0) [cos(x)−1]/x = 0. La derivada de sen x siendo cos x, y la de cos x siendo −sen x, crea un ciclo elegante: derivar cuatro veces regresa a la función original (d/dx[sen x] → cos x → −sen x → −cos x → sen x).",
        },
        {
          tipo: "subtitulo",
          contenido: "Derivadas de las seis funciones trigonométricas",
        },
        {
          tipo: "lista",
          items: [
            "d/dx[sen x] = cos x. Demostración requiere lim(h→0) sin(h)/h = 1.",
            "d/dx[cos x] = −sen x. El signo negativo es crucial; omitirlo es el error más frecuente.",
            "d/dx[tan x] = sec²x = 1/cos²x. Se obtiene de la regla del cociente aplicada a sen x / cos x.",
            "d/dx[csc x] = −csc x · cot x. d/dx[sec x] = sec x · tan x. d/dx[cot x] = −csc²x.",
            "Con la cadena: d/dx[sen(u)] = cos(u)·u'. Ejemplo: d/dx[sen(3x²)] = cos(3x²)·6x.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Aplicaciones: movimiento armónico simple",
        },
        {
          tipo: "parrafo",
          contenido:
            "El movimiento armónico simple —como el de un resorte o un péndulo— se describe con funciones trigonométricas. Si la posición de un péndulo es x(t) = A·sen(ωt + φ), donde A es la amplitud, ω es la frecuencia angular y φ es la fase inicial, entonces la velocidad es x'(t) = Aω·cos(ωt + φ) y la aceleración es x''(t) = −Aω²·sen(ωt + φ) = −ω²·x(t). Esta última relación, x'' = −ω²x, es la ecuación del movimiento armónico. En el Estadio Azteca, los ingenieros usaron modelos de vibración basados en funciones senoidales para analizar el comportamiento de la estructura ante las vibraciones de la multitud.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La demostración de d/dx[sen x] = cos x parte de la definición: [sen(x+h)−sen(x)]/h. Usando la identidad de suma sen(x+h) = sen x·cos h + cos x·sen h: el cociente se convierte en sen x·[(cos h − 1)/h] + cos x·[sen h / h]. Cuando h→0, (cos h −1)/h → 0 y sen h/h → 1. Por tanto, la derivada es sen x·0 + cos x·1 = cos x. Sin el límite fundamental sin(x)/x = 1, esta demostración no funciona.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráficas de sen x y cos x superpuestas, mostrando que la tangente a la curva sen x en cada punto tiene la altura del valor de cos x en ese mismo punto",
          caption: "La derivada de sen x es cos x: la pendiente de la curva senoidal en cada punto es exactamente el valor del coseno.",
        },
      ],
    },
  },

  // ── 11 ── Funciones trascendentes ──────────────────────────────────────────
  {
    slug: "pm-v-derivada-exponencial-e-logaritmo",
    titulo: "La derivada de eˣ y ln x: la propiedad única del número e",
    categoria: "Funciones trascendentes",
    conceptos_clave: ["derivada de eˣ", "derivada de ln x", "número e", "función autodériva", "logaritmo natural"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El número e ≈ 2.71828 tiene una propiedad absolutamente única en el cálculo: la función f(x) = eˣ es la única función (salvo múltiplos escalares) cuya derivada es ella misma: d/dx[eˣ] = eˣ. En ningún otro punto de las matemáticas una función y su derivada coinciden exactamente. Esta propiedad hace que eˣ sea la función natural del cálculo: aparece en ecuaciones diferenciales, en el crecimiento poblacional, en el decaimiento radiactivo, en las finanzas. Su número e se puede definir como lim(n→∞) (1 + 1/n)ⁿ.",
        },
        {
          tipo: "subtitulo",
          contenido: "Derivadas de las funciones exponencial y logarítmica",
        },
        {
          tipo: "lista",
          items: [
            "d/dx[eˣ] = eˣ. La función exponencial natural es invariante bajo la derivación.",
            "d/dx[aˣ] = aˣ · ln(a). Para otras bases: la derivada incluye el factor ln(a).",
            "d/dx[ln x] = 1/x para x > 0. El logaritmo natural es la antiderivada de 1/x.",
            "d/dx[log_a(x)] = 1/(x · ln a). Para bases distintas de e, incluye el factor 1/ln(a).",
            "Con la cadena: d/dx[e^(u)] = e^(u)·u'. Ejemplo: d/dx[e^(x²)] = e^(x²)·2x.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Crecimiento poblacional y el número e",
        },
        {
          tipo: "parrafo",
          contenido:
            "El CONAPO (Consejo Nacional de Población) modela el crecimiento demográfico de México con funciones exponenciales. Si P(t) = P₀ · eˣˢ·ᵗ es la población en el año t con tasa de crecimiento r, entonces dP/dt = r · P₀ · eʳˡ = r · P(t). La derivada de la población es proporcional a la misma población: a mayor población, mayor crecimiento. En 2020 México tenía P₀ = 126 millones con r ≈ 0.011 (1.1% anual). La tasa de cambio en 2020 fue dP/dt = 0.011 × 126 ≈ 1.39 millones de personas por año. La función exponencial, y por ende su derivada única, es el lenguaje matemático de la demografía.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La derivada d/dx[ln x] = 1/x tiene una consecuencia importante: permite derivar funciones mediante la técnica de logaritmación. Para derivar y = f(x)^g(x) (potencia con exponente variable), se toma logaritmo: ln y = g(x)·ln(f(x)). Luego se deriva implícitamente: y'/y = g'(x)·ln(f(x)) + g(x)·f'(x)/f(x). Despejando y' = y·[...]. Esta técnica, llamada derivación logarítmica, simplifica enormemente productos, cocientes y potencias complicadas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfica de y = eˣ con una tangente en x = 1 cuya pendiente es e ≈ 2.718, y otra en x = 0 con pendiente 1, ilustrando que la pendiente en cada punto es eˣ",
          caption: "La función eˣ es autodériva: la pendiente de su tangente en cada punto (x, eˣ) es exactamente eˣ.",
        },
      ],
    },
  },

  // ── 12 ── Funciones trascendentes ──────────────────────────────────────────
  {
    slug: "pm-v-derivadas-compuestas-trascendentes",
    titulo: "Derivadas de funciones trascendentes compuestas: cadena aplicada",
    categoria: "Funciones trascendentes",
    conceptos_clave: ["cadena con trigonométricas", "cadena con exponencial", "cadena con logaritmo", "funciones compuestas", "aplicaciones"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las funciones trascendentes (trigonométricas, exponenciales, logarítmicas) combinadas con la regla de la cadena generan la mayor parte de las derivadas que aparecen en aplicaciones reales. La clave es siempre identificar la función exterior y la interior, luego aplicar la fórmula correspondiente al exterior y multiplicar por la derivada del interior. Las fórmulas se combinan: d/dx[sen(u)] = cos(u)·u'; d/dx[e^u] = e^u·u'; d/dx[ln(u)] = u'/u, siempre que u sea diferenciable.",
        },
        {
          tipo: "subtitulo",
          contenido: "Combinaciones frecuentes: ejemplos detallados",
        },
        {
          tipo: "lista",
          items: [
            "d/dx[sen(3x+1)]: exterior sen(u), u = 3x+1, u' = 3. Resultado: cos(3x+1)·3 = 3cos(3x+1).",
            "d/dx[e^(sen x)]: exterior e^u, u = sen x, u' = cos x. Resultado: e^(sen x)·cos x.",
            "d/dx[ln(x²+5)]: exterior ln(u), u = x²+5, u' = 2x. Resultado: 2x/(x²+5).",
            "d/dx[cos²(x)] = d/dx[(cos x)²]: exterior u², u = cos x, u' = −sen x. Resultado: 2cos(x)·(−sen x) = −2sen(x)cos(x) = −sen(2x).",
            "d/dx[e^(x²)·sen(x)]: regla del producto + cadena. = e^(x²)·2x·sen(x) + e^(x²)·cos(x) = e^(x²)[2x·sen(x)+cos(x)].",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Aplicación en ingeniería de señales",
        },
        {
          tipo: "parrafo",
          contenido:
            "En telecomunicaciones, una señal modulada en amplitud tiene la forma s(t) = A(t)·cos(2πft), donde A(t) es la amplitud que varía con el tiempo y f es la frecuencia portadora. La derivada de esta señal es s'(t) = A'(t)·cos(2πft) − A(t)·2πf·sen(2πft), usando regla del producto y cadena. Empresas mexicanas de telecomunicaciones como Telcel y Telmex usan estas derivadas en el diseño de filtros digitales y en el análisis de la velocidad de cambio de las señales. La potencia instantánea disipada en un circuito oscilante también se calcula derivando expresiones de la forma eˣ·cos(ωt).",
        },
        {
          tipo: "callout",
          variante: "ejemplo",
          contenido:
            "Problema completo: una curva de temperatura tiene la forma T(x) = 30·e^(−0.1x)·cos(πx/6), donde x es la hora del día (0 a 24) y T es grados Celsius. Encontrar T'(6). Usando producto y cadena: T'(x) = 30·[(−0.1)e^(−0.1x)·cos(πx/6) + e^(−0.1x)·(−πx/6·sen(πx/6))]. En x = 6: T'(6) = 30·e^(−0.6)·[−0.1·cos(π) − (π/6)·sen(π)] = 30·e^(−0.6)·[−0.1·(−1) − 0] = 3·e^(−0.6) ≈ 3·0.549 ≈ 1.65 °C/hora.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Árbol de derivación mostrando la descomposición de d/dx[e^(sen(x²))] en tres capas: exterior e^u, media sen(u), interior x², con cada derivada parcial indicada",
          caption: "La cadena en cascada: derivar e^(sen(x²)) requiere tres aplicaciones de la regla, de afuera hacia adentro.",
        },
      ],
    },
  },

  // ── 13 ── Análisis de funciones con derivadas ──────────────────────────────
  {
    slug: "pm-v-funcion-creciente-decreciente-criticos",
    titulo: "Funciones crecientes, decrecientes y puntos críticos",
    categoria: "Análisis de funciones con derivadas",
    conceptos_clave: ["función creciente", "función decreciente", "punto crítico", "primera derivada", "análisis de signo"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La primera derivada f'(x) revela dónde una función crece y dónde decrece. Si f'(x) > 0 en un intervalo, la función es creciente en ese intervalo (la pendiente es positiva, la función sube). Si f'(x) < 0, la función es decreciente (la pendiente es negativa, la función baja). Los puntos donde f'(x) = 0 o donde f'(x) no existe se llaman puntos críticos: son candidatos a máximos o mínimos locales. El análisis de signo de f'(x) en intervalos entre puntos críticos determina el comportamiento completo de la función.",
        },
        {
          tipo: "subtitulo",
          contenido: "Procedimiento para analizar crecimiento",
        },
        {
          tipo: "lista",
          items: [
            "Calcular f'(x) y encontrar todos los puntos críticos (donde f'(x)=0 o f'(x) no existe).",
            "Los puntos críticos dividen la recta real en intervalos. Elegir un valor de prueba en cada intervalo.",
            "Evaluar el signo de f'(x) en cada valor de prueba: si f'(valor) > 0, creciente; si < 0, decreciente.",
            "Organizar los resultados en una tabla de análisis de signo para visualizar el comportamiento global.",
            "Recordar: f'(c) = 0 no garantiza ni máximo ni mínimo; puede ser un punto de inflexión si f' no cambia de signo.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo completo: análisis de f(x) = x³ − 3x",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para f(x) = x³ − 3x, calcular f'(x) = 3x² − 3 = 3(x²−1) = 3(x−1)(x+1). Puntos críticos: f'(x) = 0 en x = −1 y x = 1. Intervalos: (−∞, −1), (−1, 1), (1, +∞). Valor de prueba en (−∞, −1): x = −2, f'(−2) = 3(4−1) = 9 > 0. Creciente. En (−1, 1): x = 0, f'(0) = −3 < 0. Decreciente. En (1, +∞): x = 2, f'(2) = 9 > 0. Creciente. Conclusión: f tiene un máximo local en x = −1 (f(−1) = 2) y un mínimo local en x = 1 (f(1) = −2). La función sube, luego baja, luego sube: comportamiento de la cúbica estándar.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Un punto crítico donde f'(c) = 0 es un máximo local si f' cambia de signo positivo a negativo en c (la función sube y luego baja). Es un mínimo local si f' cambia de negativo a positivo (la función baja y luego sube). No es ninguno de los dos si f' no cambia de signo (la función sube por ambos lados, o baja por ambos lados: es un punto de inflexión horizontal).",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfica de f(x) = x³ − 3x con los puntos críticos x = ±1 marcados, intervalos de crecimiento y decrecimiento indicados con flechas, y los valores del máximo y mínimo locales",
          caption: "Los puntos donde f' cambia de signo son los máximos y mínimos locales; entre ellos la función es monótona.",
        },
      ],
    },
  },

  // ── 14 ── Análisis de funciones con derivadas ──────────────────────────────
  {
    slug: "pm-v-prueba-primera-segunda-derivada",
    titulo: "Prueba de la primera y segunda derivada para extremos",
    categoria: "Análisis de funciones con derivadas",
    conceptos_clave: ["prueba de la primera derivada", "prueba de la segunda derivada", "máximo local", "mínimo local", "extremos relativos"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una vez encontrados los puntos críticos de una función, existen dos pruebas para clasificarlos como máximos locales, mínimos locales, o ninguno de los dos. La prueba de la primera derivada analiza el cambio de signo de f'(x) al pasar por el punto crítico c. La prueba de la segunda derivada evalúa f''(c): si f''(c) > 0, la curva es cóncava hacia arriba y c es un mínimo local; si f''(c) < 0, la curva es cóncava hacia abajo y c es un máximo local; si f''(c) = 0, la prueba no es concluyente.",
        },
        {
          tipo: "subtitulo",
          contenido: "Comparación de las dos pruebas",
        },
        {
          tipo: "lista",
          items: [
            "Prueba de la 1ª derivada: si f' cambia de + a − en c, máximo local. Si cambia de − a +, mínimo local. Siempre concluyente cuando f' existe y cambia de signo.",
            "Prueba de la 2ª derivada: si f'(c) = 0 y f''(c) > 0, mínimo local. Si f''(c) < 0, máximo local. Si f''(c) = 0, no concluyente: usar la 1ª.",
            "Ventaja de la 2ª derivada: más rápida de aplicar (solo evaluar f'' en c sin analizar intervalos).",
            "Desventaja de la 2ª derivada: puede ser 0 o no existir, en cuyo caso hay que recurrir a la 1ª.",
            "Ejemplo: f(x) = x⁴. f'(x) = 4x³ = 0 en x = 0. f''(0) = 0. La 2ª no es concluyente. La 1ª: f'(x) < 0 para x < 0 y f'(x) > 0 para x > 0. Mínimo local en x = 0.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo aplicado: beneficio máximo de Bimbo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Grupo Bimbo modela el beneficio mensual en millones de pesos como B(x) = −2x² + 80x − 500, donde x es la cantidad producida en miles de unidades. Encontrar el máximo beneficio. B'(x) = −4x + 80 = 0 → x = 20 (miles de unidades). Prueba de la segunda derivada: B''(x) = −4 < 0 para todo x, en particular B''(20) = −4 < 0. Por la prueba de la 2ª derivada, x = 20 es un máximo local (y global, pues la parábola abre hacia abajo). El beneficio máximo es B(20) = −2(400) + 80(20) − 500 = −800 + 1600 − 500 = 300 millones de pesos.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La diferencia entre un extremo local y un extremo global (absoluto) es importante en aplicaciones. Un máximo local es el mayor valor en una vecindad del punto, pero puede existir un valor mayor en otra parte de la función. Un máximo global es el mayor valor de la función en todo su dominio o en un intervalo dado. Para encontrar el máximo global en un intervalo cerrado [a, b], se evalúa la función en los puntos críticos y en los extremos del intervalo: el mayor es el máximo global.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Curva con dos máximos locales, un mínimo local y un mínimo global en el extremo del intervalo, mostrando los signos de f' y f'' en cada punto crítico",
          caption: "Los extremos locales se clasifican con el cambio de signo de f' (1ª prueba) o el signo de f'' (2ª prueba).",
        },
      ],
    },
  },

  // ── 15 ── Análisis de funciones con derivadas ──────────────────────────────
  {
    slug: "pm-v-concavidad-inflexion-asintotas",
    titulo: "Concavidad, puntos de inflexión y asíntotas",
    categoria: "Análisis de funciones con derivadas",
    conceptos_clave: ["concavidad", "punto de inflexión", "asíntota horizontal", "asíntota vertical", "asíntota oblicua", "comportamiento al infinito"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Para trazar la gráfica completa de una función, además de los extremos se necesita conocer la concavidad y las asíntotas. La concavidad describe si la curva 'dobla hacia arriba' (cóncava arriba, f'' > 0) o 'dobla hacia abajo' (cóncava abajo, f'' < 0). Los puntos donde la concavidad cambia se llaman puntos de inflexión: en ellos f''(c) = 0 o f''(c) no existe, y f'' cambia de signo. Las asíntotas describen el comportamiento de la función cuando x o y tienden a infinito o cuando la función explota.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de asíntotas",
        },
        {
          tipo: "lista",
          items: [
            "Asíntota vertical en x = a: lim(x→a⁺) f(x) = ±∞ o lim(x→a⁻) f(x) = ±∞. Ocurre donde el denominador es cero (y el numerador no).",
            "Asíntota horizontal y = L: lim(x→+∞) f(x) = L o lim(x→−∞) f(x) = L. La función se acerca a una recta horizontal.",
            "Asíntota oblicua y = mx + b: ocurre cuando lim(x→∞) [f(x)/(mx+b)] = 1 y el grado del numerador excede al del denominador en 1.",
            "Ejemplo: f(x) = (2x²+3)/(x−1). Asíntota vertical: x = 1. División larga: 2x²+3 ÷ (x−1) = 2x+2 + 5/(x−1). Asíntota oblicua: y = 2x+2.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Puntos de inflexión: ejemplo con f(x) = x³",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para f(x) = x³: f'(x) = 3x², f''(x) = 6x. f''(x) = 0 en x = 0. Para x < 0: f''(x) < 0, cóncava abajo. Para x > 0: f''(x) > 0, cóncava arriba. La concavidad cambia en x = 0, por lo que (0, 0) es un punto de inflexión. Nota: en ese punto f'(0) = 0 también (punto crítico), pero no es un máximo ni un mínimo porque f' no cambia de signo. La función cúbica estándar es el ejemplo canónico de punto de inflexión: la curva cambia su modo de doblar exactamente en el origen.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Las asíntotas oblicuas aparecen en los modelos de costo marginal decreciente. Si el costo promedio de producción de PEMEX es C_avg(x) = (500x + 1000)/x = 500 + 1000/x, la asíntota horizontal es y = 500: a grandes volúmenes de producción, el costo promedio tiende a 500 pesos por unidad. Esta asíntota representa el costo variable unitario cuando los costos fijos (1000) se diluyen entre muchas unidades, y es un concepto central en economía de producción.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Curva con un punto de inflexión marcado donde cambia la concavidad, asíntotas vertical y horizontal dibujadas como líneas punteadas, y los signos de f'' indicados en cada región",
          caption: "El análisis completo de una función incluye extremos, concavidad, puntos de inflexión y asíntotas.",
        },
      ],
    },
  },

  // ── 16 ── Análisis de funciones con derivadas ──────────────────────────────
  {
    slug: "pm-v-esquema-completo-analisis-funcion",
    titulo: "Esquema completo de análisis de una función con derivadas",
    categoria: "Análisis de funciones con derivadas",
    conceptos_clave: ["análisis completo", "dominio", "extremos", "concavidad", "asíntotas", "trazado de curvas"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El análisis completo de una función mediante derivadas permite trazar su gráfica con precisión sin necesidad de graficar punto por punto. El esquema sistemático combina todo lo aprendido: dominio e interceptos, análisis de la primera derivada (crecimiento y extremos), análisis de la segunda derivada (concavidad e inflexión) y asíntotas. Aplicado a cualquier función racional o algebraica, este esquema produce una descripción cualitativa completa del comportamiento de la función.",
        },
        {
          tipo: "subtitulo",
          contenido: "Pasos del esquema de análisis",
        },
        {
          tipo: "lista",
          items: [
            "Paso 1 — Dominio: encontrar todos los valores de x donde la función está definida.",
            "Paso 2 — Interceptos: f(0) para el intercepto vertical; f(x) = 0 para los ceros (interceptos horizontales).",
            "Paso 3 — Asíntotas: verticales (donde f explota), horizontales y oblicuas (comportamiento al infinito).",
            "Paso 4 — Primera derivada: calcular f', encontrar puntos críticos, hacer tabla de signo de f', identificar máximos y mínimos locales.",
            "Paso 5 — Segunda derivada: calcular f'', encontrar donde f'' = 0, hacer tabla de signo de f'', identificar concavidad y puntos de inflexión.",
            "Paso 6 — Trazar: usar toda la información anterior para dibujar la gráfica.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo: f(x) = x³/(x²−1)",
        },
        {
          tipo: "parrafo",
          contenido:
            "Dominio: x ≠ ±1. Asíntotas verticales: x = 1 y x = −1. División: x³/(x²−1) = x + x/(x²−1). Asíntota oblicua: y = x. Ceros: x = 0. Simetría: f(−x) = −f(x), función impar (simétrica respecto al origen). Primera derivada: f'(x) = [3x²(x²−1) − x³(2x)]/(x²−1)² = (3x⁴−3x²−2x⁴)/(x²−1)² = x²(x²−3)/(x²−1)². Puntos críticos: x = 0 (f'=0) y x = ±√3 (f'=0). Evaluando f''(x) en los puntos críticos permite clasificarlos. La función tiene mínimo local en x = √3 y máximo local en x = −√3, además de un punto de inflexión en el origen.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La simetría es una propiedad poderosa que reduce el trabajo a la mitad. Si f(−x) = f(x), la función es par y su gráfica es simétrica respecto al eje y: basta analizar x ≥ 0 y reflejar. Si f(−x) = −f(x), la función es impar y su gráfica es simétrica respecto al origen: si (a, b) está en la gráfica, también lo está (−a, −b). Verificar la simetría antes de comenzar el análisis es siempre el primer paso eficiente.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de los 6 pasos del análisis completo de función, con el ejemplo f(x) = x³/(x²−1) completado en cada paso, y la gráfica final resultante",
          caption: "El análisis sistemático con derivadas: seis pasos que describen completamente el comportamiento de cualquier función.",
        },
      ],
    },
  },

  // ── 17 ── Optimización aplicada ────────────────────────────────────────────
  {
    slug: "pm-v-metodologia-optimizacion",
    titulo: "Metodología para optimizar: maximizar y minimizar con derivadas",
    categoria: "Optimización aplicada",
    conceptos_clave: ["optimización", "función objetivo", "restricción", "máximo global", "mínimo global", "método de derivada"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La optimización es la aplicación más importante de las derivadas: encontrar el valor de x que hace máxima o mínima una cantidad de interés (la función objetivo), sujeto a condiciones (restricciones). El procedimiento general tiene cuatro pasos: modelar la situación con una función objetivo y sus restricciones; usar las restricciones para expresar la función objetivo en una sola variable; derivar e igualar a cero para encontrar los candidatos a extremo; verificar si es máximo o mínimo y calcular el valor óptimo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Pasos del método de optimización",
        },
        {
          tipo: "lista",
          items: [
            "Definir claramente la cantidad a optimizar (función objetivo) y las variables involucradas.",
            "Escribir las ecuaciones de restricción que relacionan las variables entre sí.",
            "Usar las restricciones para eliminar variables hasta tener la función objetivo en una sola variable.",
            "Derivar la función objetivo, igualar a cero y resolver: los puntos críticos son candidatos a óptimo.",
            "Verificar con la prueba de la segunda derivada (o evaluar en los extremos del dominio si es cerrado).",
            "Calcular el valor óptimo y responder la pregunta del problema con unidades correctas.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo clásico: área máxima con perímetro fijo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un productor mexicano tiene 200 metros de alambre para cercar un terreno rectangular. ¿Qué dimensiones maximizan el área? Variables: largo x, ancho y. Restricción (perímetro): 2x + 2y = 200, por lo que y = 100 − x. Función objetivo: A(x) = xy = x(100−x) = 100x − x². Derivar: A'(x) = 100 − 2x = 0 → x = 50. Segunda derivada: A''(x) = −2 < 0, por lo que x = 50 es un máximo. Dimensiones óptimas: x = y = 50 metros (un cuadrado). Área máxima: A(50) = 50 × 50 = 2500 m². La solución cuadrada es una consecuencia de la Desigualdad entre medias: para área fija, el cuadrado minimiza el perímetro, y para perímetro fijo, el cuadrado maximiza el área.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En problemas de optimización con dominio cerrado [a, b], el máximo y mínimo globales pueden estar en los puntos críticos interiores o en los extremos del intervalo. Siempre evaluar la función objetivo en todos los candidatos (puntos críticos y extremos) y comparar todos los valores. El más grande es el máximo global; el más pequeño, el mínimo global.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del terreno rectangular con perímetro 200 m, la función A(x) = 100x − x² graficada, y el máximo en x = 50 marcado con líneas punteadas",
          caption: "Optimización con restricción: el cuadrado maximiza el área cuando el perímetro es fijo.",
        },
      ],
    },
  },

  // ── 18 ── Optimización aplicada ────────────────────────────────────────────
  {
    slug: "pm-v-problemas-clasicos-optimizacion",
    titulo: "Problemas clásicos de optimización: caja, lata y volumen máximo",
    categoria: "Optimización aplicada",
    conceptos_clave: ["caja de volumen máximo", "lata de mínima superficie", "optimización geométrica", "función de una variable", "restricciones de volumen"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los problemas de optimización geométrica tienen una larga historia y aparecen continuamente en ingeniería de empaque, diseño de contenedores y manufactura. Los dos problemas más clásicos son: (1) la caja de volumen máximo, donde a partir de una lámina rectangular con cuadrados cortados en las esquinas se forma una caja abierta; (2) la lata cilíndrica de superficie mínima con volumen dado, que aparece en el diseño de envases para reducir el material. Ambos ilustran la potencia de la optimización por derivadas.",
        },
        {
          tipo: "subtitulo",
          contenido: "El problema de la caja abierta",
        },
        {
          tipo: "parrafo",
          contenido:
            "De una lámina cuadrada de 12 cm × 12 cm se cortan cuadrados de lado x en las cuatro esquinas y se doblan los lados para formar una caja abierta. ¿Qué valor de x maximiza el volumen? La caja tiene base (12−2x) × (12−2x) y altura x. Volumen: V(x) = x(12−2x)² = x(144−48x+4x²) = 144x−48x²+4x³. Dominio: 0 < x < 6. Derivada: V'(x) = 144−96x+12x² = 12(12−8x+x²) = 12(x−2)(x−6). Puntos críticos en x = 2 y x = 6. Como x = 6 está en el extremo del dominio (V = 0), el único candidato interior es x = 2. V''(2) = −96+24(2) = −48 < 0: máximo. Volumen máximo: V(2) = 2(12−4)² = 2(64) = 128 cm³.",
        },
        {
          tipo: "subtitulo",
          contenido: "La lata cilíndrica de mínima superficie",
        },
        {
          tipo: "lista",
          items: [
            "Problema: diseñar una lata cilíndrica (cerrada) de volumen V = 500 cm³ usando la mínima cantidad de material (superficie mínima).",
            "Variables: radio r, altura h. Restricción (volumen): πr²h = 500, por lo que h = 500/(πr²).",
            "Función objetivo (superficie): S = 2πr² + 2πrh = 2πr² + 2πr·[500/(πr²)] = 2πr² + 1000/r.",
            "Derivar: S'(r) = 4πr − 1000/r² = 0 → 4πr³ = 1000 → r³ = 250/π → r ≈ 4.30 cm.",
            "Altura óptima: h = 500/(π·r²) = 500/(π·18.47) ≈ 8.60 cm = 2r. La altura óptima es igual al diámetro.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La lata óptima tiene h = 2r (la altura igual al diámetro). Este resultado explica por qué muchas latas de conserva tienen proporciones cercanas a esta relación. Sin embargo, las latas comerciales de bebidas en México (355 ml, como las de Coca-Cola) tienen r ≈ 3.3 cm y h ≈ 10.4 cm, que es h ≈ 1.6·(2r). La diferencia se debe a que en producción real hay restricciones adicionales: estabilidad en apilamiento, ergonomía de agarre y costos diferenciales de la tapa respecto al cuerpo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de la lámina con cuadrados cortados y la caja resultante, junto al cilindro con radio r y altura h y la gráfica de V(x) = x(12−2x)² con el máximo en x = 2",
          caption: "Los problemas clásicos de optimización geométrica: la caja de volumen máximo y la lata de superficie mínima.",
        },
      ],
    },
  },

  // ── 19 ── Optimización aplicada ────────────────────────────────────────────
  {
    slug: "pm-v-optimizacion-ingenieria-mexicana",
    titulo: "Optimización en ingeniería civil mexicana: puentes y estructuras",
    categoria: "Optimización aplicada",
    conceptos_clave: ["optimización estructural", "costo mínimo", "resistencia máxima", "ingeniería civil", "puentes México"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En la ingeniería civil mexicana, la optimización por derivadas es una herramienta de diseño cotidiana. El Puente Baluarte, entre Durango y Sinaloa, es el puente atirantado más alto del mundo: para diseñar la tensión óptima en sus cables se resuelven problemas de minimización de material sujeto a restricciones de resistencia. El Paso Exprés de Cuernavaca, inaugurado en 2019, usa vigas de sección transversal optimizada (sección en I) cuya forma se determina minimizando el peso manteniendo la rigidez. El cálculo diferencial no es teoría abstracta: es el lenguaje del diseño.",
        },
        {
          tipo: "subtitulo",
          contenido: "Problema: viga de resistencia máxima",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una viga rectangular se cortará de un tronco circular de radio r = 20 cm. La resistencia de la viga es proporcional al producto de su ancho b por el cuadrado de su altura h: R = b·h². La restricción es que la viga debe caber dentro del tronco: b² + h² = (2r)² = 1600 (el rectángulo inscrito en el círculo de diámetro 40 cm). Sustituyendo b = √(1600 − h²): R(h) = √(1600−h²)·h². Derivando e igualando a cero: dR/dh = 0 conduce a h² = 1600·(2/3), es decir h = 40√(2/3) ≈ 32.66 cm. El ancho óptimo es b = √(1600 − 1600·2/3) = 40√(1/3) ≈ 23.09 cm. La relación h/b = √2 ≈ 1.414 en la viga óptima.",
        },
        {
          tipo: "subtitulo",
          contenido: "Costo mínimo en instalaciones hidráulicas",
        },
        {
          tipo: "lista",
          items: [
            "La CONAGUA diseña canales de irrigación con sección trapezoidal óptima para minimizar el costo de excavación con flujo dado.",
            "Un canal rectangular de área transversal A = 10 m² tiene ancho b y profundidad h, con A = bh = 10. El perímetro mojado P = b + 2h se minimiza para reducir la resistencia al flujo.",
            "Sustituyendo b = 10/h: P(h) = 10/h + 2h. dP/dh = −10/h² + 2 = 0 → h² = 5 → h = √5 ≈ 2.24 m.",
            "El ancho óptimo b = 10/√5 = 2√5 ≈ 4.47 m. La relación óptima: b = 2h (ancho = doble de la profundidad).",
            "Esta relación b = 2h minimiza el perímetro para un área dada: resultado fundamental en hidráulica de canales, independientemente del caudal.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La optimización estructural en ingeniería civil siempre involucra dos tipos de restricciones: geométricas (el diseño debe caber en el espacio disponible) y funcionales (debe cumplir con la resistencia, el flujo o la carga requeridos). El cálculo diferencial permite expresar matemáticamente ambos tipos y encontrar el diseño que satisface ambos mientras minimiza el costo o el material. Este proceso es exactamente el mismo que se practica en este semestre: modelar, restringir, derivar, optimizar.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Sección transversal del tronco circular con la viga rectangular inscrita, mostrando b y h, y la gráfica de R(h) con el máximo marcado en h = 40√(2/3)",
          caption: "La viga de máxima resistencia inscrita en un tronco circular tiene la relación óptima h/b = √2, derivada por cálculo diferencial.",
        },
      ],
    },
  },

  // ── 20 ── Historia del cálculo ─────────────────────────────────────────────
  {
    slug: "pm-v-newton-leibniz-debate-prioridad",
    titulo: "Newton vs. Leibniz: el debate histórico de la invención del cálculo",
    categoria: "Historia del cálculo",
    conceptos_clave: ["Isaac Newton", "Gottfried Leibniz", "invención del cálculo", "prioridad científica", "notación"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La controversia entre Isaac Newton (1642-1727) y Gottfried Wilhelm Leibniz (1646-1716) por la prioridad en la invención del cálculo es el conflicto científico más famoso de la historia. Ambos desarrollaron independientemente el cálculo diferencial e integral entre 1665 y 1686, pero con métodos y notaciones distintas. Newton lo hizo primero (hacia 1665-1666, durante el cierre de Cambridge por la peste bubónica), pero Leibniz publicó primero (1684). La disputa se convirtió en un conflicto nacional entre Inglaterra y los matemáticos continentales europeos que duró décadas y envenenó el ambiente científico de ambas partes.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las dos versiones del cálculo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Newton llamó a su método 'método de las fluxiones'. Las variables que cambiaban las llamaba 'fluentes' y sus tasas de cambio 'fluxiones', escritas con un punto encima: x con punto = velocidad. Su idea central era que las cantidades geométricas fluyen en el tiempo. Leibniz, en cambio, desarrolló el cálculo como un álgebra de diferencias infinitamente pequeñas. Introdujo la notación dy/dx para la derivada y el símbolo integral (una 'S' alargada de 'summa') que usamos hoy. La notación de Leibniz resultó vastamente superior para el trabajo algebraico y es la que domina la matemática mundial desde entonces.",
        },
        {
          tipo: "subtitulo",
          contenido: "La cronología del conflicto",
        },
        {
          tipo: "lista",
          items: [
            "1665-1666: Newton desarrolla el método de las fluxiones en Woolsthorpe (no publica). Lo denomina 'annus mirabilis'.",
            "1675-1676: Leibniz desarrolla de forma independiente el cálculo diferencial en París. Introduce dy/dx y la integral.",
            "1684: Leibniz publica 'Nova Methodus' en Acta Eruditorum: primera publicación del cálculo diferencial.",
            "1687: Newton publica los Principia Mathematica, que usan el cálculo de forma implícita.",
            "1699-1716: La controversia se encona. La Royal Society de Londres, presidida por Newton, declara oficialmente a Newton el inventor legítimo. Los matemáticos continentales, liderados por los Bernoulli, defienden a Leibniz.",
            "Hoy: la historia de la ciencia reconoce que ambos inventaron el cálculo de forma independiente y simultánea.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La controversia Newton-Leibniz tuvo consecuencias matemáticas graves para Inglaterra. Los matemáticos ingleses, por lealtad a Newton, rechazaron la notación de Leibniz y trabajaron con las fluxiones durante más de un siglo. Esto los dejó aislados del avance matemático continental: mientras Euler, los Bernoulli y Lagrange desarrollaban el cálculo en el continente con la poderosa notación de Leibniz, los ingleses se atrasaron. Solo hacia 1820, la Sociedad Analítica de Cambridge (fundada por Babbage, Herschel y otros) logró modernizar la matemática inglesa adoptando la notación continental.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Retratos de Newton y Leibniz lado a lado, con sus respectivas notaciones del cálculo (fluxiones con punto vs. dy/dx y símbolo de integral) y una línea de tiempo del conflicto de prioridad",
          caption: "Newton y Leibniz inventaron el cálculo de forma independiente; la disputa por la prioridad fue el mayor conflicto científico del siglo XVII.",
        },
      ],
    },
  },

  // ── 21 ── Historia del cálculo ─────────────────────────────────────────────
  {
    slug: "pm-v-calculo-revolucion-cientifica",
    titulo: "El cálculo en la Revolución Científica: de los planetas a la ingeniería",
    categoria: "Historia del cálculo",
    conceptos_clave: ["Revolución Científica", "Kepler", "Galileo", "mecánica celeste", "siglos XVII-XVIII", "aplicaciones históricas"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El cálculo diferencial e integral no fue inventado en el vacío: fue la respuesta matemática a preguntas físicas urgentes de la Revolución Científica del siglo XVII. Kepler (1571-1630) había descubierto que los planetas orbitan en elipses y que la línea planeta-sol barre áreas iguales en tiempos iguales (2ª Ley de Kepler). Galileo (1564-1642) había establecido que los cuerpos en caída libre aceleran uniformemente. Pero ninguno de los dos tenía la herramienta matemática para demostrar estos resultados con rigor ni para generalizarlos. El cálculo fue esa herramienta: Newton lo usó para demostrar matemáticamente las Leyes de Kepler a partir de su Ley de Gravitación Universal.",
        },
        {
          tipo: "subtitulo",
          contenido: "De los planetas a la mecánica: el Principia de Newton",
        },
        {
          tipo: "parrafo",
          contenido:
            "En los Principia Mathematica (1687), Newton demostró que si la fuerza gravitacional varía como 1/r² (el cuadrado de la distancia), entonces las órbitas resultantes son cónicas (elipses, parábolas, hipérbolas). Esta demostración requirió el cálculo: específicamente, la relación entre la fuerza (la segunda derivada de la posición) y la trayectoria. La ecuación F = ma, es decir F = m·d²r/dt², conecta la fuerza con la aceleración. Resolver esta ecuación diferencial con la fuerza gravitacional F = GMm/r² produce las leyes de Kepler. El cálculo transformó la astronomía descriptiva en mecánica celeste predictiva.",
        },
        {
          tipo: "subtitulo",
          contenido: "El legado: aplicaciones en los siglos XVII al XVIII",
        },
        {
          tipo: "lista",
          items: [
            "Euler (1707-1783) formalizó el cálculo y desarrolló las ecuaciones de movimiento de fluidos, la mecánica estructural y la teoría de números con métodos calculeísticos.",
            "Los Bernoulli (Jakob y Johann, finales s. XVII) usaron el cálculo para el principio de Bernoulli (vuelo) y resolvieron el problema de la braquistocrona (la curva de descenso más rápido).",
            "Lagrange (1736-1813) reformuló la mecánica de Newton usando el cálculo variacional: el punto de partida de la mecánica analítica moderna.",
            "Laplace (1749-1827) usó el cálculo para predecir la estabilidad del Sistema Solar y desarrollar la teoría de la probabilidad.",
            "En México: los ingenieros de la Academia de San Carlos en el siglo XVIII estudiaban los Principia y el cálculo de Leibniz para diseñar obras de drenaje y acueductos en la Ciudad de México colonial.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La pregunta que Newton se hizo — ¿por qué la luna cae hacia la Tierra igual que la manzana, pero no choca con ella? — requirió el concepto de derivada para responderse. La luna 'cae' (tiene aceleración hacia la Tierra, d²r/dt² dirigida al centro) pero también se mueve lateralmente, por lo que su trayectoria es una elipse. Sin el cálculo diferencial, era imposible calcular exactamente esta trayectoria. El cálculo que se estudia en este semestre es literalmente la herramienta con la que Newton resolvió el sistema solar.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo de la Revolución Científica mostrando a Kepler, Galileo, Newton y Leibniz, con sus contribuciones matemáticas y físicas enlazadas, y la portada de los Principia Mathematica",
          caption: "El cálculo fue la respuesta matemática a los problemas físicos de la Revolución Científica: de las órbitas planetarias a la mecánica de fluidos.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaPMV(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca PM-V (21 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "PM-V")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC PM-V no encontrada. Ejecuta primero seed-mccems.ts y seed-pmv.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_PMV.map((f, i) => ({
    uac_id: uacRow.id,
    slug: f.slug,
    titulo: f.titulo,
    categoria: f.categoria,
    conceptos_clave: f.conceptos_clave as unknown as string[],
    tiempo_lectura_minutos: f.tiempo_lectura_minutos,
    es_placeholder: f.es_placeholder,
    contenido: f.contenido,
    orden: i + 1,
  }));

  const { error } = await sb
    .from("fichas_biblioteca")
    .upsert(rows, { onConflict: "slug" });

  if (error) throw new Error(`Error seeding fichas PM-V: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de PM-V insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca PM-V completado.\n");
}

// ---------------------------------------------------------------------------
// ENTRYPOINT
// ---------------------------------------------------------------------------

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  seedBibliotecaPMV(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
