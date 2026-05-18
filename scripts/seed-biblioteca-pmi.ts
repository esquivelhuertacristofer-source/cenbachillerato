/**
 * Seed de fichas de biblioteca para PM-I (Pensamiento Matemático I).
 * 22 fichas temáticas alineadas al MCCEMS 2025, Semestre 1.
 *
 * Uso: npx tsx scripts/seed-biblioteca-pmi.ts
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

const FICHAS_PMI = [
  // ── 1 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-numeros-naturales",
    titulo: "Los números naturales y sus operaciones",
    descripcion:
      "Repasa las propiedades de los números naturales y las cuatro operaciones básicas con sus propiedades fundamentales.",
    categoria: "Aritmética",
    conceptos_clave: ["número natural", "adición", "multiplicación", "divisibilidad"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los números naturales son el conjunto más básico de la matemática: {0, 1, 2, 3, 4, …}. Surgieron de la necesidad humana de contar objetos y ordenar colecciones. Sobre ellos se definen las cuatro operaciones aritméticas fundamentales que son la base de toda la matemática posterior.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las cuatro operaciones y sus propiedades",
        },
        {
          tipo: "lista",
          items: [
            "Adición (suma): es conmutativa (a+b = b+a), asociativa ((a+b)+c = a+(b+c)) y tiene elemento neutro (a+0 = a).",
            "Sustracción (resta): no es conmutativa ni asociativa. Es la operación inversa de la adición.",
            "Multiplicación: es conmutativa, asociativa, distributiva sobre la suma y tiene elemento neutro (a×1 = a).",
            "División: es la operación inversa de la multiplicación. El divisor nunca puede ser cero.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Divisibilidad y criterios prácticos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un número es divisible por otro si el residuo de la división es cero. Existen criterios rápidos de divisibilidad: un número es divisible entre 2 si termina en cifra par; entre 3 si la suma de sus dígitos es múltiplo de 3; entre 5 si termina en 0 o 5; entre 10 si termina en 0. Estos criterios son especialmente útiles para la factorización y el cálculo del MCD y MCM.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El orden de las operaciones es fundamental: primero paréntesis, luego potencias y raíces, después multiplicación y división (de izquierda a derecha), y finalmente adición y sustracción (de izquierda a derecha). El acrónimo PEMDAS (Paréntesis, Exponentes, Multiplicación, División, Adición, Sustracción) ayuda a recordarlo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de multiplicar del 1 al 10 con filas y columnas coloreadas, destacando los patrones de divisibilidad en diagonal",
          caption: "Tabla de multiplicar: herramienta base para la aritmética.",
        },
        {
          tipo: "cita",
          contenido:
            "Las matemáticas son el alfabeto con el que Dios ha escrito el universo.",
          fuente: "Galileo Galilei, físico y astrónomo italiano",
        },
      ],
    },
  },

  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-numeros-enteros",
    titulo: "Números enteros: positivos, negativos y el cero",
    descripcion:
      "Comprende el conjunto de los números enteros, la recta numérica y las operaciones con números negativos.",
    categoria: "Aritmética",
    conceptos_clave: ["número entero", "número negativo", "valor absoluto", "recta numérica"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los números enteros amplían a los naturales incorporando los números negativos y el cero: ℤ = {…, -3, -2, -1, 0, 1, 2, 3, …}. Son esenciales para representar situaciones donde los naturales no alcanzan: temperaturas bajo cero, deudas económicas, altitudes bajo el nivel del mar o desplazamientos en sentido contrario.",
        },
        {
          tipo: "subtitulo",
          contenido: "La recta numérica",
        },
        {
          tipo: "parrafo",
          contenido:
            "La recta numérica es una representación gráfica donde el cero ocupa el centro, los positivos se extienden hacia la derecha y los negativos hacia la izquierda. La distancia de un número al cero es su valor absoluto: |−5| = |5| = 5. En la recta numérica, cuanto más a la derecha está un número, mayor es su valor: −1 > −5 aunque ambos sean negativos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Operaciones con enteros",
        },
        {
          tipo: "lista",
          items: [
            "Suma con igual signo: se suman los valores absolutos y se conserva el signo. Ej.: (−3) + (−4) = −7.",
            "Suma con diferente signo: se restan los valores absolutos y se toma el signo del mayor. Ej.: (−7) + 4 = −3.",
            "Resta: se convierte en suma del opuesto. Ej.: 5 − (−3) = 5 + 3 = 8.",
            "Multiplicación y división: si los signos son iguales, el resultado es positivo; si son distintos, negativo.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los números negativos tardaron siglos en ser aceptados por los matemáticos europeos. En la Edad Media se les llamaba 'números absurdos' o 'deudas'. Fue en el siglo XVII cuando Leibniz y Newton comenzaron a usarlos sistemáticamente en el cálculo, consolidando su legitimidad matemática.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Recta numérica horizontal con flechas en ambos extremos, marcas desde -6 hasta +6, cero en el centro resaltado, y ejemplos de sumas de enteros representados como desplazamientos sobre la recta",
          caption: "La recta numérica: representación visual de los números enteros.",
        },
      ],
    },
  },

  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-fracciones",
    titulo: "Fracciones: concepto, tipos y operaciones",
    descripcion:
      "Domina el concepto de fracción, sus tipos y las operaciones básicas con fracciones.",
    categoria: "Aritmética",
    conceptos_clave: ["numerador", "denominador", "fracción equivalente", "mínimo común múltiplo"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una fracción representa una parte de un entero o la razón entre dos cantidades. Se escribe como a/b, donde a es el numerador (indica cuántas partes se toman) y b es el denominador (indica en cuántas partes iguales se divide el entero). El denominador nunca puede ser cero, pues la división entre cero no está definida.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de fracciones",
        },
        {
          tipo: "lista",
          items: [
            "Propia: el numerador es menor que el denominador. Valor menor que 1. Ej.: 3/5.",
            "Impropia: el numerador es mayor o igual que el denominador. Valor mayor o igual a 1. Ej.: 7/3.",
            "Mixta: combina un número entero y una fracción propia. Ej.: 2 1/3.",
            "Equivalentes: representan la misma cantidad con numeradores y denominadores distintos. Ej.: 1/2 = 2/4 = 3/6.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Operaciones con fracciones",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para sumar o restar fracciones se necesita un denominador común, preferentemente el mínimo común múltiplo (MCM) de los denominadores. Se convierte cada fracción a términos equivalentes con ese denominador y luego se operan los numeradores. Para multiplicar, se multiplican numeradores entre sí y denominadores entre sí. Para dividir, se multiplica la primera fracción por el recíproco de la segunda (se invierten numerador y denominador de la segunda).",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Siempre simplifica la fracción resultado a su mínima expresión dividiendo numerador y denominador entre su Máximo Común Divisor (MCD). Una fracción está en mínima expresión cuando su MCD es 1. Por ejemplo, 12/18 se simplifica a 2/3 dividiendo ambos entre 6.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Círculo dividido en 8 partes iguales con 3 partes sombreadas (representando 3/8), junto a una recta numérica que muestra la posición de varias fracciones entre 0 y 1",
          caption: "Representación visual de fracciones: área y recta numérica.",
        },
      ],
    },
  },

  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-decimales-y-porcentajes",
    titulo: "Números decimales y porcentajes",
    descripcion:
      "Comprende los números decimales, su relación con las fracciones y el cálculo de porcentajes en situaciones reales.",
    categoria: "Aritmética",
    conceptos_clave: ["número decimal", "porcentaje", "fracción decimal", "tanto por ciento"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los números decimales son una forma de representar fracciones cuyo denominador es una potencia de 10 (10, 100, 1000…). Se escriben separando la parte entera de la fraccionaria con un punto (en México y muchos países) o una coma (en España y otros): 3.75 o 3,75. Son indispensables en la vida cotidiana: precios, medidas, estadísticas y muchos cálculos científicos se expresan en decimales.",
        },
        {
          tipo: "subtitulo",
          contenido: "Relación entre decimales, fracciones y porcentajes",
        },
        {
          tipo: "lista",
          items: [
            "Decimal a fracción: 0.75 = 75/100 = 3/4.",
            "Fracción a decimal: divide el numerador entre el denominador. 3/4 = 3 ÷ 4 = 0.75.",
            "Porcentaje a decimal: divide entre 100. 35% = 0.35.",
            "Decimal a porcentaje: multiplica por 100. 0.6 = 60%.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Cálculo de porcentajes",
        },
        {
          tipo: "parrafo",
          contenido:
            "El porcentaje (%) indica una proporción respecto a 100. Para calcular el X% de una cantidad N, se multiplica N × X/100. Por ejemplo, el 15% de $840 = 840 × 0.15 = $126. Para calcular a qué porcentaje corresponde una parte respecto a un total, se divide la parte entre el total y se multiplica por 100. Los porcentajes son fundamentales en descuentos comerciales, impuestos, tasas de crecimiento y estadística.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En México, el IVA (Impuesto al Valor Agregado) es del 16%. Cuando ves un precio de $200 'más IVA', el precio total es: 200 + 200×0.16 = 200 + 32 = $232. O más directo: 200 × 1.16 = $232. Saber calcular porcentajes te permite verificar si las cuentas cuadran antes de pagar.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de conversión circular con flechas que conectan fracción, decimal y porcentaje, con ejemplos numéricos en cada flecha",
          caption: "Conversión entre fracciones, decimales y porcentajes.",
        },
      ],
    },
  },

  // ── 5 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-proporcionalidad",
    titulo: "Proporcionalidad directa e inversa",
    descripcion:
      "Aprende a reconocer y resolver situaciones de proporcionalidad directa e inversa con aplicaciones reales.",
    categoria: "Aritmética",
    conceptos_clave: ["proporción", "razón", "proporcionalidad directa", "proporcionalidad inversa"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Dos magnitudes son proporcionales cuando existe una relación constante entre sus valores. La proporcionalidad es uno de los conceptos matemáticos más presentes en la vida diaria: recetas de cocina, mezcla de colores, conversión de monedas, velocidad y tiempo de viaje son solo algunos ejemplos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Proporcionalidad directa",
        },
        {
          tipo: "parrafo",
          contenido:
            "Dos magnitudes son directamente proporcionales cuando al multiplicar una de ellas por un número, la otra queda multiplicada por el mismo número. La constante de proporcionalidad k se calcula dividiendo y entre x: k = y/x. Su gráfica es una línea recta que pasa por el origen. Ejemplo: si 4 bolígrafos cuestan $24, la constante es k = 6. Entonces 7 bolígrafos costarán 7 × 6 = $42.",
        },
        {
          tipo: "subtitulo",
          contenido: "Proporcionalidad inversa",
        },
        {
          tipo: "parrafo",
          contenido:
            "Dos magnitudes son inversamente proporcionales cuando al multiplicar una de ellas por un número, la otra queda dividida entre ese mismo número. El producto de ambas es constante: x × y = k. Ejemplo: si 3 trabajadores terminan una obra en 12 días, la constante es 3 × 12 = 36. Con 6 trabajadores, tardarán 36/6 = 6 días. Su gráfica es una hipérbola.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Para resolver un problema de regla de tres, primero determina si es directa o inversa. Pregúntate: si la primera magnitud aumenta, ¿la segunda aumenta también (directa) o disminuye (inversa)? Este análisis previo evita los errores más frecuentes.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Dos gráficas lado a lado: la izquierda muestra una línea recta creciente (proporcionalidad directa) y la derecha muestra una hipérbola decreciente (proporcionalidad inversa), con valores de ejemplo marcados",
          caption: "Gráficas de proporcionalidad directa (línea) e inversa (hipérbola).",
        },
      ],
    },
  },

  // ── 6 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-introduccion-algebra",
    titulo: "Introducción al álgebra: variables y expresiones algebraicas",
    descripcion:
      "Da el primer paso al álgebra entendiendo qué son las variables, los términos y las expresiones algebraicas.",
    categoria: "Álgebra",
    conceptos_clave: ["variable", "expresión algebraica", "término semejante", "coeficiente"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El álgebra es la rama de las matemáticas que generaliza la aritmética usando letras para representar números desconocidos o que pueden variar. Esas letras se llaman variables. Gracias al álgebra podemos escribir relaciones generales que son válidas para infinitos casos, no solo para un número específico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Variables, coeficientes y términos",
        },
        {
          tipo: "parrafo",
          contenido:
            "En la expresión 3x + 5y − 7, las letras x e y son variables; los números 3 y 5 que las acompañan son coeficientes; el número −7 es un término independiente (no tiene variable). Cada parte de la suma o resta es un término. Para simplificar expresiones algebraicas se suman los términos semejantes, es decir, aquellos que tienen la misma variable elevada al mismo exponente: 4x + 2x = 6x, pero 4x + 2x² no se puede simplificar porque las variables tienen distinto exponente.",
        },
        {
          tipo: "subtitulo",
          contenido: "Evaluación de expresiones",
        },
        {
          tipo: "parrafo",
          contenido:
            "Evaluar una expresión algebraica significa sustituir las variables por valores numéricos y calcular el resultado. Si f(x) = 2x² − 3x + 1 y queremos evaluar en x = 4: f(4) = 2(4²) − 3(4) + 1 = 2(16) − 12 + 1 = 32 − 12 + 1 = 21. Este proceso conecta el álgebra con la aritmética y es la base de las funciones.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La palabra 'álgebra' proviene del árabe al-jabr, que significa 'restitución' o 'reunión de partes fracturadas'. Fue tomada del título del libro Kitāb al-mukhtaṣar fī hisāb al-jabr waʾl-muqābala, escrito por el matemático persa Al-Juarizmí (al-Khwārizmī) hacia el año 820 d.C. De su nombre latinizado, Algoritmi, deriva también la palabra 'algoritmo'.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Expresión algebraica 5x² − 3x + 7 con flechas que señalan y etiquetan cada componente: coeficiente (5), variable (x), exponente (2), signo, y término independiente (7)",
          caption: "Anatomía de una expresión algebraica.",
        },
      ],
    },
  },

  // ── 7 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-ecuaciones-lineales",
    titulo: "Ecuaciones lineales de primer grado",
    descripcion:
      "Aprende a plantear y resolver ecuaciones lineales con una incógnita usando propiedades de la igualdad.",
    categoria: "Álgebra",
    conceptos_clave: ["ecuación", "incógnita", "solución", "principios de equivalencia"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una ecuación es una igualdad que contiene al menos una incógnita (variable cuyo valor desconocemos). Una ecuación lineal de primer grado tiene la forma ax + b = c, donde a, b y c son constantes y x es la incógnita. 'Linear' se refiere a que la incógnita aparece solo a la primera potencia; no hay x², x³ ni términos con x en el denominador.",
        },
        {
          tipo: "subtitulo",
          contenido: "Propiedades de la igualdad",
        },
        {
          tipo: "lista",
          items: [
            "Propiedad simétrica: si a = b, entonces b = a.",
            "Propiedad aditiva: si a = b, entonces a + c = b + c. (Se puede sumar o restar lo mismo de ambos lados.)",
            "Propiedad multiplicativa: si a = b, entonces a × c = b × c. (Se puede multiplicar o dividir lo mismo en ambos lados, siempre que c ≠ 0.)",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Procedimiento de resolución",
        },
        {
          tipo: "parrafo",
          contenido:
            "El objetivo es aislar la incógnita en un lado de la igualdad. Ejemplo: 3x − 5 = 10. Paso 1: sumamos 5 a ambos lados → 3x = 15. Paso 2: dividimos ambos lados entre 3 → x = 5. Verificación: 3(5) − 5 = 15 − 5 = 10. ✓ Siempre verifica sustituyendo la solución en la ecuación original.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Plantear una ecuación es tan importante como resolverla. Para problemas de texto, identifica la incógnita, asígnale una variable, traduce las relaciones del problema en expresiones algebraicas y escribe la ecuación que las iguala. Una buena traducción del lenguaje verbal al algebraico es la mitad de la solución.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Balanza de dos platillos en equilibrio representando la ecuación 3x − 5 = 10, con los pasos de resolución escritos debajo mostrando cómo se mantiene el equilibrio al operar en ambos lados",
          caption: "La ecuación como balanza: lo que se hace en un lado debe hacerse en el otro.",
        },
      ],
    },
  },

  // ── 8 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-desigualdades-e-inecuaciones",
    titulo: "Desigualdades e inecuaciones",
    descripcion:
      "Aprende a resolver inecuaciones lineales y a representar sus soluciones en la recta numérica.",
    categoria: "Álgebra",
    conceptos_clave: ["inecuación", "desigualdad", "conjunto solución", "intervalo"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una inecuación es una desigualdad que contiene al menos una incógnita. A diferencia de las ecuaciones, que tienen una solución (o un número finito de ellas), las inecuaciones lineales tienen infinitas soluciones que forman un intervalo en la recta numérica. Se usan signos como < (menor que), > (mayor que), ≤ (menor o igual) y ≥ (mayor o igual).",
        },
        {
          tipo: "subtitulo",
          contenido: "Resolución de inecuaciones",
        },
        {
          tipo: "parrafo",
          contenido:
            "El procedimiento es similar al de las ecuaciones, con una regla crucial adicional: al multiplicar o dividir ambos lados por un número negativo, el signo de la desigualdad se invierte. Ejemplo: −2x < 8. Dividimos entre −2 e invertimos: x > −4. La solución es el conjunto de todos los números mayores que −4, que se escribe como (−4, +∞) o como x > −4.",
        },
        {
          tipo: "lista",
          items: [
            "Intervalo abierto (a, b): no incluye los extremos. Se usa con < o >.",
            "Intervalo cerrado [a, b]: incluye los extremos. Se usa con ≤ o ≥.",
            "Intervalo semiabierto (a, b] o [a, b): incluye solo uno de los extremos.",
            "En la recta numérica, los extremos excluidos se marcan con círculo vacío (○) y los incluidos con círculo relleno (●).",
          ],
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "El error más frecuente al resolver inecuaciones es olvidar invertir el signo al multiplicar o dividir por un número negativo. Ejemplo incorrecto: −3x > 9 → x > −3. Correcto: x < −3 (se invierte el signo porque se dividió entre −3).",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Recta numérica con cuatro ejemplos de representación de intervalos: abierto, cerrado y semiabiertos, con puntos vacíos y rellenos en los extremos",
          caption: "Representación de intervalos en la recta numérica.",
        },
      ],
    },
  },

  // ── 9 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-factorizacion",
    titulo: "Factorización de expresiones algebraicas básicas",
    descripcion:
      "Aprende las técnicas de factorización más comunes para simplificar y resolver expresiones algebraicas.",
    categoria: "Álgebra",
    conceptos_clave: ["factor común", "trinomio", "diferencia de cuadrados", "factorización"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Factorizar una expresión algebraica es escribirla como un producto de factores más simples. Es la operación inversa de expandir o desarrollar. La factorización es fundamental para simplificar fracciones algebraicas, resolver ecuaciones cuadráticas y analizar funciones.",
        },
        {
          tipo: "subtitulo",
          contenido: "Factor común monomio",
        },
        {
          tipo: "parrafo",
          contenido:
            "Si todos los términos de una expresión comparten un factor común, se extrae afuera del paréntesis. Ejemplo: 6x³ + 9x² − 3x. El MCD de los coeficientes (6, 9, 3) es 3; la variable común de menor grado es x. Factor común: 3x. Resultado: 3x(2x² + 3x − 1). Verificación: expandir el resultado debe reproducir la expresión original.",
        },
        {
          tipo: "subtitulo",
          contenido: "Diferencia de cuadrados perfectos",
        },
        {
          tipo: "parrafo",
          contenido:
            "La diferencia de cuadrados tiene la forma a² − b² y se factoriza como (a + b)(a − b). Ejemplo: x² − 25 = (x + 5)(x − 5). Reconocerla requiere identificar que ambos términos son cuadrados perfectos y están restando.",
        },
        {
          tipo: "subtitulo",
          contenido: "Trinomio cuadrado perfecto",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un trinomio cuadrado perfecto tiene la forma a² ± 2ab + b² y se factoriza como (a ± b)². Para reconocerlo: el primer y último término deben ser cuadrados perfectos, y el término del medio debe ser el doble del producto de sus raíces cuadradas. Ejemplo: x² + 6x + 9 = (x + 3)².",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Siempre busca primero el factor común antes de aplicar cualquier otra técnica. Extraer el factor común simplifica la expresión y hace más fácil identificar la técnica correcta para continuar la factorización.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Árbol de decisión para elegir técnica de factorización: ¿hay factor común? → ¿es diferencia de cuadrados? → ¿es trinomio cuadrado perfecto? → ¿es trinomio general?",
          caption: "Árbol de decisión para seleccionar la técnica de factorización.",
        },
      ],
    },
  },

  // ── 10 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-potencias-y-raices",
    titulo: "Potencias y raíces: propiedades",
    descripcion:
      "Comprende las propiedades de las potencias y las raíces para simplificar y calcular expresiones con exponentes.",
    categoria: "Aritmética",
    conceptos_clave: ["potencia", "exponente", "raíz cuadrada", "propiedades de exponentes"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una potencia aⁿ representa el producto de a (base) multiplicado n veces (exponente): aⁿ = a × a × … × a (n veces). Las potencias son una notación compacta y poderosa que aparece en toda la matemática: en álgebra, en geometría, en probabilidad y en ciencias.",
        },
        {
          tipo: "subtitulo",
          contenido: "Propiedades de las potencias",
        },
        {
          tipo: "lista",
          items: [
            "Producto de potencias de igual base: aᵐ × aⁿ = aᵐ⁺ⁿ. Ej.: 3² × 3⁴ = 3⁶ = 729.",
            "Cociente de potencias de igual base: aᵐ ÷ aⁿ = aᵐ⁻ⁿ (con a ≠ 0). Ej.: 5⁵ ÷ 5² = 5³ = 125.",
            "Potencia de una potencia: (aᵐ)ⁿ = aᵐˣⁿ. Ej.: (2³)⁴ = 2¹² = 4096.",
            "Exponente cero: a⁰ = 1 para cualquier a ≠ 0.",
            "Exponente negativo: a⁻ⁿ = 1/aⁿ. Ej.: 2⁻³ = 1/8.",
            "Exponente fraccionario: a^(1/n) = ⁿ√a (raíz n-ésima de a). Ej.: 8^(1/3) = ³√8 = 2.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Raíces",
        },
        {
          tipo: "parrafo",
          contenido:
            "La raíz cuadrada de un número a es el número b tal que b² = a: √a = b. Solo los números no negativos tienen raíz cuadrada real. La raíz cúbica ³√a es el número b tal que b³ = a, y puede aplicarse a números negativos: ³√(−8) = −2. Para simplificar raíces se factoriza el radicando buscando cuadrados perfectos dentro de él: √72 = √(36 × 2) = 6√2.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El número √2 fue el primero en demostrarse irracional, hace más de 2500 años. La leyenda cuenta que el matemático pitagórico Hipaso de Metaponto fue arrojado al mar por sus propios compañeros como castigo por revelar que √2 no podía expresarse como cociente de dos números enteros, perturbando así la doctrina de que 'todo es número racional'.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de cuadrados perfectos del 1 al 15 y sus raíces cuadradas, junto a un ejemplo visual de cómo simplificar √50 = √(25×2) = 5√2",
          caption: "Cuadrados perfectos y simplificación de raíces.",
        },
      ],
    },
  },

  // ── 11 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-notacion-cientifica",
    titulo: "Notación científica y orden de magnitud",
    descripcion:
      "Aprende a expresar números muy grandes o muy pequeños en notación científica y a compararlos por orden de magnitud.",
    categoria: "Aritmética",
    conceptos_clave: ["notación científica", "potencia de 10", "orden de magnitud", "cifras significativas"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En ciencias naturales y tecnología frecuentemente se trabaja con números extremadamente grandes (la distancia de la Tierra al Sol: 150,000,000,000 metros) o extremadamente pequeños (el diámetro de un átomo de hidrógeno: 0.0000000001 metros). La notación científica es una forma compacta y estandarizada de expresar esos números.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo escribir un número en notación científica",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un número en notación científica se escribe como a × 10ⁿ, donde 1 ≤ |a| < 10 y n es un entero. Para convertir: coloca el punto decimal después del primer dígito significativo no nulo y cuenta cuántos lugares se movió. Si se movió a la izquierda, el exponente es positivo; si se movió a la derecha, es negativo. Ejemplos: 150,000,000,000 = 1.5 × 10¹¹; 0.0000000001 = 1 × 10⁻¹⁰.",
        },
        {
          tipo: "subtitulo",
          contenido: "Operaciones en notación científica",
        },
        {
          tipo: "lista",
          items: [
            "Multiplicación: se multiplican las partes decimales y se suman los exponentes. (3 × 10⁴)(2 × 10³) = 6 × 10⁷.",
            "División: se dividen las partes decimales y se restan los exponentes. (8 × 10⁶) ÷ (2 × 10²) = 4 × 10⁴.",
            "Suma y resta: primero hay que igualar los exponentes y luego operar las partes decimales.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Las calculadoras científicas muestran la notación científica con 'E' o 'e': 1.5E11 significa 1.5 × 10¹¹. No confundas la 'E' de la calculadora con el número e de Euler (≈ 2.718), que es completamente diferente.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Regla graduada en potencias de 10 desde 10⁻¹⁵ hasta 10¹⁵, con ejemplos de objetos del mundo real ubicados en su escala: átomo, bacteria, hormiga, humano, ciudad, planeta",
          caption: "Escala de órdenes de magnitud: de lo subatómico a lo astronómico.",
        },
      ],
    },
  },

  // ── 12 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-estadistica-descriptiva",
    titulo: "Estadística descriptiva: media, mediana y moda",
    descripcion:
      "Aprende a calcular e interpretar las tres medidas de tendencia central para describir conjuntos de datos.",
    categoria: "Estadística y probabilidad",
    conceptos_clave: ["media aritmética", "mediana", "moda", "medidas de tendencia central"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La estadística descriptiva organiza, resume y presenta conjuntos de datos de forma comprensible. Las medidas de tendencia central son valores representativos que resumen toda la distribución en un solo número. Las tres más usadas son la media, la mediana y la moda, y cada una captura un aspecto distinto del 'centro' de los datos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Media aritmética (promedio)",
        },
        {
          tipo: "parrafo",
          contenido:
            "La media aritmética se calcula sumando todos los valores y dividiendo entre la cantidad de datos: x̄ = (Σxᵢ)/n. Es el valor que 'equilibraría' los datos si los colocáramos en una balanza. Su desventaja es que es muy sensible a valores extremos (atípicos): si un dato es muy diferente a los demás, la media se desplaza hacia él y deja de ser representativa.",
        },
        {
          tipo: "subtitulo",
          contenido: "Mediana",
        },
        {
          tipo: "parrafo",
          contenido:
            "La mediana es el valor central cuando los datos están ordenados de menor a mayor. Si la cantidad de datos es impar, la mediana es el valor del centro. Si es par, es el promedio de los dos valores centrales. La mediana no se ve afectada por valores extremos, por lo que es más representativa que la media cuando hay datos atípicos. Por eso, los salarios y los precios de vivienda suelen reportarse con la mediana, no con la media.",
        },
        {
          tipo: "subtitulo",
          contenido: "Moda",
        },
        {
          tipo: "parrafo",
          contenido:
            "La moda es el valor (o valores) que aparece con mayor frecuencia en el conjunto de datos. Un conjunto puede ser unimodal (una sola moda), bimodal (dos modas) o multimodal (varias). Si ningún valor se repite, el conjunto no tiene moda. La moda es especialmente útil en datos cualitativos o cuando interesa saber cuál es el valor más popular.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Un ejemplo clásico que muestra la diferencia: en una empresa de 10 empleados que ganan $10,000 mensuales cada uno y un director que gana $200,000, la media salarial es de aproximadamente $27,000 —que no representa a nadie—, mientras que la mediana es $10,000 —que sí representa a la mayoría.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Conjunto de datos numéricos ordenado en una fila, con la mediana señalada en el centro, la moda resaltada por frecuencia y la media representada como punto de equilibrio de una balanza",
          caption: "Media, mediana y moda en un mismo conjunto de datos.",
        },
      ],
    },
  },

  // ── 13 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-graficas-estadisticas",
    titulo: "Gráficas estadísticas: barras, líneas y circulares",
    descripcion:
      "Aprende a leer, interpretar y construir los tres tipos de gráficas estadísticas más comunes.",
    categoria: "Estadística y probabilidad",
    conceptos_clave: ["gráfica de barras", "gráfica de líneas", "gráfica circular", "visualización de datos"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una imagen vale más que mil números. Las gráficas estadísticas transforman tablas de datos en representaciones visuales que permiten identificar tendencias, comparar grupos y comunicar resultados de manera clara e impactante. Saber interpretarlas es una competencia básica para participar en la sociedad de la información.",
        },
        {
          tipo: "subtitulo",
          contenido: "Gráfica de barras",
        },
        {
          tipo: "parrafo",
          contenido:
            "Se usa para comparar cantidades de distintas categorías. Cada barra representa una categoría; su altura (barras verticales) o longitud (barras horizontales) indica el valor. Las barras no deben tocarse entre sí. Ideal para responder: ¿cuál categoría tiene más? ¿cuál tiene menos? Ejemplo: número de estudiantes por UAC inscrita.",
        },
        {
          tipo: "subtitulo",
          contenido: "Gráfica de líneas",
        },
        {
          tipo: "parrafo",
          contenido:
            "Se usa para mostrar la evolución de una variable a lo largo del tiempo. Los puntos de datos se conectan con segmentos de línea que permiten ver la tendencia: creciente, decreciente, estable o irregular. Ideal para responder: ¿cómo ha cambiado esta variable con el tiempo? Ejemplo: temperatura promedio mensual a lo largo de un año.",
        },
        {
          tipo: "subtitulo",
          contenido: "Gráfica circular (pie chart)",
        },
        {
          tipo: "parrafo",
          contenido:
            "Representa proporciones o porcentajes de un todo. El círculo completo equivale al 100%; cada sector es proporcional a la frecuencia relativa de su categoría. Es ideal para responder: ¿qué parte del total corresponde a cada categoría? Limitación: no es recomendable con más de 5-6 categorías, porque los sectores pequeños son difíciles de leer.",
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Las gráficas pueden manipularse para dar una impresión falsa. Truncar el eje Y (no empezar desde cero) hace que diferencias pequeñas parezcan enormes. Cambiar la escala o usar gráficas tridimensionales puede distorsionar las proporciones. Analiza siempre los ejes y la escala antes de interpretar una gráfica.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tres gráficas comparativas con el mismo conjunto de datos representado como gráfica de barras, gráfica de líneas y gráfica circular, mostrando cuál es más adecuada para cada tipo de pregunta",
          caption: "El mismo conjunto de datos en tres tipos de gráfica.",
        },
      ],
    },
  },

  // ── 14 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-probabilidad-basica",
    titulo: "Probabilidad básica y espacio muestral",
    descripcion:
      "Comprende los conceptos fundamentales de la probabilidad y calcula probabilidades de eventos simples.",
    categoria: "Estadística y probabilidad",
    conceptos_clave: ["probabilidad", "espacio muestral", "evento", "resultado favorable"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La probabilidad mide la posibilidad de que ocurra un evento en un experimento aleatorio —uno cuyo resultado no puede predecirse con certeza. Se expresa como un número entre 0 y 1: probabilidad 0 significa que el evento es imposible; probabilidad 1 significa que es seguro. En la vida diaria usamos la probabilidad para tomar decisiones bajo incertidumbre: el pronóstico del tiempo, el riesgo médico o el análisis financiero se basan en ella.",
        },
        {
          tipo: "subtitulo",
          contenido: "Conceptos fundamentales",
        },
        {
          tipo: "lista",
          items: [
            "Experimento aleatorio: proceso cuyo resultado no es predecible con certeza. Ej.: lanzar un dado.",
            "Espacio muestral (Ω): conjunto de todos los resultados posibles. Lanzar un dado: Ω = {1, 2, 3, 4, 5, 6}.",
            "Evento (A): cualquier subconjunto del espacio muestral. Ej.: obtener número par = {2, 4, 6}.",
            "Resultado favorable: elemento del espacio muestral que pertenece al evento de interés.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Fórmula de la probabilidad clásica",
        },
        {
          tipo: "parrafo",
          contenido:
            "Cuando todos los resultados del espacio muestral son igualmente probables, la probabilidad de un evento A es: P(A) = (número de resultados favorables) / (número total de resultados posibles). Ejemplo: la probabilidad de obtener un número par al lanzar un dado: P(par) = 3/6 = 1/2 = 0.5 = 50%.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La probabilidad de que un evento NO ocurra es el complemento: P(A') = 1 − P(A). Si hay 30% de probabilidad de lluvia, hay 70% de probabilidad de que no llueva. Los eventos complementarios siempre suman 1 (o 100%). Esta relación es muy útil para simplificar cálculos.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de Venn con el espacio muestral de un dado (Ω con 6 elementos), el evento 'número par' resaltado en color y el evento complementario 'número impar' en otro color",
          caption: "Espacio muestral y evento complementario en el lanzamiento de un dado.",
        },
      ],
    },
  },

  // ── 15 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-perimetro-y-area",
    titulo: "Perímetro y área de figuras geométricas planas",
    descripcion:
      "Calcula el perímetro y el área de las figuras geométricas planas más comunes con sus fórmulas.",
    categoria: "Geometría",
    conceptos_clave: ["perímetro", "área", "unidades de medida", "figura plana"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El perímetro de una figura es la longitud total de su contorno; se mide en unidades lineales (cm, m, km). El área es la medida de la superficie encerrada por la figura; se mide en unidades cuadradas (cm², m², km²). Conocer estas medidas es indispensable en arquitectura, diseño, agricultura, ingeniería y la vida cotidiana.",
        },
        {
          tipo: "subtitulo",
          contenido: "Fórmulas para figuras comunes",
        },
        {
          tipo: "lista",
          items: [
            "Cuadrado (lado l): Perímetro = 4l; Área = l².",
            "Rectángulo (base b, altura h): Perímetro = 2(b+h); Área = b×h.",
            "Triángulo (lados a, b, c; base b, altura h): Perímetro = a+b+c; Área = (b×h)/2.",
            "Círculo (radio r): Perímetro (circunferencia) = 2πr; Área = πr².",
            "Trapecio (bases b₁ y b₂, altura h, lados l₁ y l₂): Perímetro = b₁+b₂+l₁+l₂; Área = ((b₁+b₂)×h)/2.",
            "Rombo (diagonales d₁ y d₂, lado l): Perímetro = 4l; Área = (d₁×d₂)/2.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "π (pi) ≈ 3.14159… es un número irracional; su valor exacto no puede escribirse como fracción. Para cálculos de bachillerato se usa generalmente 3.14 o la tecla π de la calculadora científica. No confundas el radio (distancia del centro a la circunferencia) con el diámetro (distancia entre dos puntos opuestos de la circunferencia); el diámetro es el doble del radio: d = 2r.",
        },
        {
          tipo: "subtitulo",
          contenido: "Conversión de unidades de área",
        },
        {
          tipo: "parrafo",
          contenido:
            "Al convertir unidades de longitud, la relación es lineal (1 m = 100 cm). Pero al convertir unidades de área, la relación es cuadrática: 1 m² = 10,000 cm² (porque 100 cm × 100 cm = 10,000 cm²). Este error de escala es muy frecuente: recuerda que las unidades de área se convierten elevando al cuadrado el factor de conversión lineal.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Galería de figuras geométricas planas (cuadrado, rectángulo, triángulo, círculo, trapecio) con sus fórmulas de perímetro y área escritas debajo de cada una y dimensiones etiquetadas",
          caption: "Fórmulas de perímetro y área de las figuras planas más comunes.",
        },
      ],
    },
  },

  // ── 16 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-teorema-de-pitagoras",
    titulo: "El teorema de Pitágoras y sus aplicaciones",
    descripcion:
      "Comprende el teorema de Pitágoras y aplícalo para resolver problemas de medición en triángulos rectángulos.",
    categoria: "Geometría",
    conceptos_clave: ["triángulo rectángulo", "hipotenusa", "cateto", "teorema de Pitágoras"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El teorema de Pitágoras es uno de los resultados más conocidos y útiles de toda la matemática. Establece que en todo triángulo rectángulo (el que tiene un ángulo de 90°), el cuadrado de la hipotenusa (el lado opuesto al ángulo recto) es igual a la suma de los cuadrados de los catetos: a² + b² = c², donde c es la hipotenusa y a, b son los catetos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Aplicación: calcular la hipotenusa o un cateto",
        },
        {
          tipo: "lista",
          items: [
            "Para encontrar la hipotenusa dado los catetos: c = √(a² + b²). Si a = 3 y b = 4, entonces c = √(9 + 16) = √25 = 5.",
            "Para encontrar un cateto dada la hipotenusa y el otro cateto: a = √(c² − b²). Si c = 13 y b = 5, entonces a = √(169 − 25) = √144 = 12.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ternas pitagóricas",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las ternas pitagóricas son conjuntos de tres números enteros que satisfacen el teorema de Pitágoras. Las más comunes son: (3, 4, 5), (5, 12, 13), (8, 15, 17) y (7, 24, 25). Sus múltiplos también son ternas: (6, 8, 10), (9, 12, 15), etc. Reconocerlas permite resolver problemas de forma rápida sin necesidad de calcular raíces.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El teorema se atribuye al matemático griego Pitágoras de Samos (siglo VI a.C.), pero evidencias arqueológicas muestran que babilonios y egipcios ya lo conocían y usaban prácticamente más de mil años antes. Las tablillas de arcilla babilónicas como Plimpton 322 (circa 1800 a.C.) contienen listas de ternas pitagóricas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Triángulo rectángulo con los catetos a y b y la hipotenusa c, con cuadrados construidos sobre cada lado para demostrar visualmente que la suma de las áreas de los cuadrados de los catetos iguala el área del cuadrado de la hipotenusa",
          caption: "Demostración visual del teorema de Pitágoras.",
        },
      ],
    },
  },

  // ── 17 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-angulos-y-triangulos",
    titulo: "Ángulos, triángulos y sus propiedades",
    descripcion:
      "Estudia los tipos de ángulos y triángulos y sus propiedades más importantes.",
    categoria: "Geometría",
    conceptos_clave: ["ángulo", "triángulo", "clasificación", "suma de ángulos"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La geometría es el estudio de las formas, el espacio y sus propiedades. Los ángulos y los triángulos son sus elementos más fundamentales y aparecen en la arquitectura, el diseño, la ingeniería y la naturaleza. Comprender sus propiedades es la base de toda la geometría plana y del trigonometría.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de ángulos",
        },
        {
          tipo: "lista",
          items: [
            "Agudo: mide entre 0° y 90°.",
            "Recto: mide exactamente 90°. Se marca con un cuadradito.",
            "Obtuso: mide entre 90° y 180°.",
            "Llano: mide exactamente 180°. Es una línea recta.",
            "Completo: mide 360°.",
            "Complementarios: dos ángulos que suman 90°. Suplementarios: dos ángulos que suman 180°.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Clasificación de triángulos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Por sus ángulos: equilátero (los tres iguales a 60°), isósceles (dos ángulos iguales), escaleno (los tres ángulos diferentes). Por sus lados: rectángulo (tiene un ángulo recto), acutángulo (los tres ángulos son agudos), obtusángulo (tiene un ángulo obtuso). La suma de los ángulos interiores de cualquier triángulo es siempre 180°, un resultado fundamental de la geometría plana.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El ángulo exterior de un triángulo es igual a la suma de los dos ángulos interiores no adyacentes. Si los ángulos interiores son 40°, 70° y 70°, el ángulo exterior adyacente al de 70° mide 40° + 70° = 110°. Esta propiedad es muy útil para resolver problemas de geometría sin calcular todos los ángulos del triángulo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Galería de seis triángulos clasificados: tres por sus ángulos (acutángulo, rectángulo, obtusángulo) y tres por sus lados (equilátero, isósceles, escaleno), con medidas de ángulos marcadas",
          caption: "Clasificación de triángulos por ángulos y por lados.",
        },
      ],
    },
  },

  // ── 18 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-plano-cartesiano",
    titulo: "El plano cartesiano: coordenadas y cuadrantes",
    descripcion:
      "Aprende a ubicar puntos en el plano cartesiano e identificar los cuatro cuadrantes.",
    categoria: "Geometría",
    conceptos_clave: ["plano cartesiano", "par ordenado", "cuadrante", "coordenadas"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El plano cartesiano es un sistema de referencia formado por dos rectas numéricas perpendiculares entre sí: el eje horizontal X (abscisas) y el eje vertical Y (ordenadas). Se intersecan en el punto (0, 0) llamado origen. Fue introducido por René Descartes en el siglo XVII y conectó por primera vez la geometría con el álgebra, dando origen a la geometría analítica.",
        },
        {
          tipo: "subtitulo",
          contenido: "Coordenadas y pares ordenados",
        },
        {
          tipo: "parrafo",
          contenido:
            "La posición de cualquier punto en el plano se describe con un par ordenado (x, y): x indica cuántas unidades se mueve horizontalmente desde el origen, e y cuántas verticalmente. El orden importa: (3, 5) y (5, 3) son puntos distintos. Para graficar el punto (3, 5): parte del origen, muévete 3 unidades a la derecha sobre el eje X, luego 5 unidades hacia arriba.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los cuatro cuadrantes",
        },
        {
          tipo: "lista",
          items: [
            "Cuadrante I (Q1): x > 0 e y > 0. Arriba a la derecha.",
            "Cuadrante II (Q2): x < 0 e y > 0. Arriba a la izquierda.",
            "Cuadrante III (Q3): x < 0 e y < 0. Abajo a la izquierda.",
            "Cuadrante IV (Q4): x > 0 e y < 0. Abajo a la derecha.",
            "Los puntos en los ejes no pertenecen a ningún cuadrante.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El plano cartesiano recibe ese nombre en honor a René Descartes (1596-1650), filósofo y matemático francés. Según la leyenda, estando en cama observó una mosca en el techo y pensó en cómo describir su posición exacta usando dos números: la distancia a dos paredes perpendiculares. De ese insight nació el sistema de coordenadas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Plano cartesiano con ejes X e Y numerados del -5 al 5, los cuatro cuadrantes etiquetados con números romanos y colores distintos, y cinco puntos de ejemplo graficados con sus pares ordenados",
          caption: "El plano cartesiano con sus cuatro cuadrantes y puntos de ejemplo.",
        },
      ],
    },
  },

  // ── 19 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-funciones-concepto",
    titulo: "Funciones: concepto, dominio y rango",
    descripcion:
      "Comprende qué es una función matemática, cómo representarla y qué son el dominio y el rango.",
    categoria: "Funciones",
    conceptos_clave: ["función", "dominio", "rango", "variable dependiente"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una función es una relación entre dos conjuntos donde a cada elemento del primer conjunto (dominio) le corresponde exactamente un elemento del segundo conjunto (codominio o rango). Las funciones son el concepto central del cálculo y el análisis matemático, y describen relaciones cuantitativas en física, economía, biología y otras ciencias.",
        },
        {
          tipo: "subtitulo",
          contenido: "Definición formal y notación",
        },
        {
          tipo: "parrafo",
          contenido:
            "Se escribe f: A → B o simplemente y = f(x), donde x es la variable independiente (del dominio A) e y es la variable dependiente (del codominio B). Leer f(3) = 7 significa 'la función f, evaluada en x = 3, produce el valor 7'. La condición esencial es que cada x tenga asignada una y única; un x no puede tener dos y distintas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Dominio y rango",
        },
        {
          tipo: "lista",
          items: [
            "Dominio: conjunto de todos los valores de x para los cuales la función está definida.",
            "Rango (o imagen): conjunto de todos los valores de y que la función puede producir.",
            "Para f(x) = √x, el dominio es [0, +∞) porque la raíz de negativos no es real; el rango también es [0, +∞).",
            "Para f(x) = 1/x, el dominio es ℝ\\{0} (todos los reales excepto cero) porque no se puede dividir entre cero.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Representaciones de una función",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una función puede representarse de cuatro formas: (1) algebraicamente, con una fórmula como y = 2x + 3; (2) numéricamente, con una tabla de valores; (3) gráficamente, en el plano cartesiano; (4) verbalmente, con una descripción en palabras. La prueba de la recta vertical en la gráfica permite verificar si una curva representa una función: si cualquier línea vertical toca la curva en más de un punto, no es función.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "No toda relación entre variables es una función. La relación que asocia a cada persona sus padres (puede tener dos padres) no es una función. La que asocia a cada persona su número de CURP (uno por persona) sí lo es. La clave es que cada entrada tenga exactamente una salida.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Cuatro representaciones de la función f(x) = 2x − 1: diagrama de flechas entre conjuntos, tabla de valores, gráfica en plano cartesiano y expresión algebraica, todas mostrando el mismo objeto matemático",
          caption: "Cuatro formas de representar la función f(x) = 2x − 1.",
        },
      ],
    },
  },

  // ── 20 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-sistemas-ecuaciones",
    titulo: "Sistemas de ecuaciones lineales 2×2",
    descripcion:
      "Aprende a resolver sistemas de dos ecuaciones con dos incógnitas por los métodos de sustitución, igualación y eliminación.",
    categoria: "Álgebra",
    conceptos_clave: ["sistema de ecuaciones", "método de sustitución", "método de eliminación", "solución única"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un sistema de ecuaciones lineales 2×2 es un conjunto de dos ecuaciones con dos incógnitas que deben satisfacerse simultáneamente. Geométricamente, cada ecuación representa una línea recta en el plano; la solución del sistema es el punto donde ambas rectas se intersectan (si son paralelas, no hay solución; si son la misma línea, hay infinitas soluciones).",
        },
        {
          tipo: "subtitulo",
          contenido: "Método de sustitución",
        },
        {
          tipo: "parrafo",
          contenido:
            "Pasos: 1) Despeja una variable en una de las ecuaciones. 2) Sustituye esa expresión en la otra ecuación. 3) Resuelve la ecuación resultante en una variable. 4) Sustituye el valor encontrado para hallar la otra variable. 5) Verifica en ambas ecuaciones originales.",
        },
        {
          tipo: "subtitulo",
          contenido: "Método de eliminación (reducción)",
        },
        {
          tipo: "parrafo",
          contenido:
            "Pasos: 1) Multiplica una o ambas ecuaciones por constantes para que los coeficientes de una variable sean opuestos. 2) Suma las ecuaciones; una variable se elimina. 3) Resuelve para la variable restante. 4) Sustituye para hallar la otra. Ejemplo: Si el sistema es 2x + y = 7 y x − y = 2, sumando directamente: 3x = 9 → x = 3; luego y = 1.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Los sistemas de ecuaciones tienen tres posibles tipos de solución: solución única (las rectas se cruzan en un punto), infinitas soluciones (las rectas son la misma) o sin solución (las rectas son paralelas). Antes de resolver algebraicamente, es útil analizar si los coeficientes de las ecuaciones son proporcionales para anticipar cuál es el caso.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Plano cartesiano con dos rectas graficadas que se intersecan en el punto (3, 1), representando la solución del sistema 2x+y=7 y x−y=2, con las rectas etiquetadas",
          caption: "Solución gráfica de un sistema 2×2: el punto de intersección.",
        },
      ],
    },
  },

  // ── 21 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-razones-proporciones-regla-de-tres",
    titulo: "Razones, proporciones y regla de tres",
    descripcion:
      "Comprende las razones y proporciones matemáticas y aplica la regla de tres en situaciones cotidianas.",
    categoria: "Aritmética",
    conceptos_clave: ["razón", "proporción", "regla de tres simple", "factor de conversión"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una razón es la comparación entre dos cantidades por medio de una división: a/b o a:b. Una proporción es la igualdad entre dos razones: a/b = c/d. En una proporción, el producto de los extremos iguala al producto de los medios: a × d = b × c. Este principio es la base de la regla de tres.",
        },
        {
          tipo: "subtitulo",
          contenido: "Regla de tres simple directa",
        },
        {
          tipo: "parrafo",
          contenido:
            "Se usa cuando las magnitudes son directamente proporcionales. Si 5 litros de pintura cubren 30 m², ¿cuántos litros necesito para cubrir 54 m²? Planteamos la proporción: 5/30 = x/54. Despejando: x = (5 × 54)/30 = 270/30 = 9 litros.",
        },
        {
          tipo: "subtitulo",
          contenido: "Regla de tres simple inversa",
        },
        {
          tipo: "parrafo",
          contenido:
            "Se usa cuando las magnitudes son inversamente proporcionales. Si 4 obreros terminan un trabajo en 15 días, ¿cuántos días tardarán 10 obreros? Producto constante: 4 × 15 = 10 × x → x = 60/10 = 6 días.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Las razones son fundamentales en la cocina, la química, la música y la fotografía. La razón áurea φ ≈ 1.618 aparece en la naturaleza (espirales de caracoles, disposición de semillas en girasoles) y en el arte y la arquitectura desde la antigua Grecia. Se define por la proporción a/b = (a+b)/a.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de proporcionalidad con dos columnas (litros de pintura y metros cuadrados cubiertos) mostrando cómo se forma la proporción y se despeja la incógnita con flechas de cross-multiplication",
          caption: "Planteamiento de una regla de tres directa con tabla de proporcionalidad.",
        },
      ],
    },
  },

  // ── 22 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-i-matematicas-financieras",
    titulo: "Matemáticas financieras: interés simple y compuesto",
    descripcion:
      "Aprende a calcular el interés simple y el interés compuesto y comprende su impacto en el ahorro y el crédito.",
    categoria: "Matemáticas financieras",
    conceptos_clave: ["interés simple", "interés compuesto", "capital", "tasa de interés"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las matemáticas financieras son una aplicación directa de la aritmética y el álgebra a situaciones económicas reales: ahorros, préstamos, inversiones y créditos. Comprender cómo funciona el interés te permite tomar mejores decisiones con tu dinero a lo largo de toda la vida.",
        },
        {
          tipo: "subtitulo",
          contenido: "Interés simple",
        },
        {
          tipo: "parrafo",
          contenido:
            "El interés simple se calcula siempre sobre el capital inicial (C₀). La fórmula es: I = C₀ × r × t, donde r es la tasa de interés (expresada como decimal) y t es el tiempo. El monto final (capital + interés) es: M = C₀(1 + r × t). Ejemplo: $10,000 a una tasa del 8% anual durante 3 años generan un interés simple de I = 10,000 × 0.08 × 3 = $2,400. Monto final: $12,400.",
        },
        {
          tipo: "subtitulo",
          contenido: "Interés compuesto",
        },
        {
          tipo: "parrafo",
          contenido:
            "En el interés compuesto, los intereses generados en cada período se suman al capital y generan nuevos intereses en el siguiente período: 'el interés sobre el interés'. La fórmula es: M = C₀(1 + r)ᵗ. Ejemplo: los mismos $10,000 al 8% anual durante 3 años con capitalización anual: M = 10,000(1.08)³ = 10,000 × 1.2597 ≈ $12,597. La diferencia con el interés simple ($197) puede parecer pequeña en 3 años, pero en 30 años la diferencia es enorme.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Albert Einstein (aunque la cita es probablemente apócrifa) habría dicho: 'El interés compuesto es la octava maravilla del mundo. El que lo entiende, lo gana; el que no, lo paga.' Esta idea es profundamente cierta: el interés compuesto trabaja a tu favor cuando ahorras, pero en tu contra cuando tienes deudas con tarjeta de crédito. Las tasas de interés de las tarjetas en México pueden superar el 60% anual.",
        },
        {
          tipo: "subtitulo",
          contenido: "Comparación práctica",
        },
        {
          tipo: "lista",
          items: [
            "$10,000 a 10% simple durante 20 años → interés: $20,000 → monto final: $30,000.",
            "$10,000 a 10% compuesto anual durante 20 años → monto final ≈ $67,275.",
            "La diferencia: más de $37,000 gracias al efecto del interés sobre el interés.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Gráfica de líneas que muestra el crecimiento de $10,000 a lo largo de 20 años, con una línea recta (interés simple) y una curva exponencial (interés compuesto) que se separan progresivamente con el tiempo",
          caption: "Crecimiento del capital con interés simple vs. compuesto a lo largo del tiempo.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaPMI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca PM-I (22 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "PM-I")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC PM-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_PMI.map((f) => ({
    uac_id: uacRow.id,
    slug: f.slug,
    titulo: f.titulo,
    categoria: f.categoria,
    conceptos_clave: f.conceptos_clave as unknown as string[],
    tiempo_lectura_minutos: f.tiempo_lectura_minutos,
    es_placeholder: f.es_placeholder,
    contenido: f.contenido,
  }));

  const { error } = await sb
    .from("fichas_biblioteca")
    .upsert(rows, { onConflict: "slug" });

  if (error) throw new Error(`Error seeding fichas PM-I: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de PM-I insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca PM-I completado.\n");
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
  seedBibliotecaPMI(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
