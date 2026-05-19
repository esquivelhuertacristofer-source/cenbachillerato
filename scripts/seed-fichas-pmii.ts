/**
 * Seed de fichas de biblioteca para PM-II (Pensamiento Matemático II).
 * 20 fichas temáticas alineadas al MCCEMS 2025, Semestre 2.
 *
 * Uso: npx tsx scripts/seed-fichas-pmii.ts
 * Idempotente: upsert por campo "slug".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

// ---------------------------------------------------------------------------
// META EDUCATIVA
// ---------------------------------------------------------------------------
// "Comprenda y aplique el lenguaje algebraico para modelar situaciones, resolver
//  ecuaciones y sistemas de ecuaciones, analizando patrones y relaciones matemáticas."
//
// Propósitos de PM-II (6):
//  1. Patrones algebraicos y generalización
//  2. Monomios y polinomios
//  3. Factorización
//  4. Ecuaciones lineales
//  5. Sistemas de ecuaciones
//  6. Inecuaciones
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// FICHAS
// ---------------------------------------------------------------------------

const FICHAS_PMII = [
  // ── 1 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-lenguaje-algebraico",
    titulo: "El lenguaje algebraico: del lenguaje cotidiano a las expresiones",
    categoria: "Álgebra",
    conceptos_clave: ["lenguaje algebraico", "traducción", "expresión algebraica", "variable"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El álgebra es, ante todo, un lenguaje: un sistema simbólico que nos permite expresar relaciones matemáticas de forma general y precisa. Antes de resolver ecuaciones o sistemas, es necesario dominar el arte de traducir enunciados del lenguaje cotidiano al lenguaje algebraico. Esta habilidad es tan fundamental como aprender a leer: sin ella, los problemas matemáticos del mundo real permanecen inaccesibles.",
        },
        {
          tipo: "subtitulo",
          contenido: "De las palabras a los símbolos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las operaciones aritméticas tienen equivalentes verbales que conviene memorizar. 'La suma de x y cinco' se escribe x + 5. 'El triple de un número disminuido en dos' se escribe 3n − 2. 'El cociente de a entre b, aumentado en uno' se escribe a/b + 1. 'El cuadrado de la diferencia de m y tres' se escribe (m − 3)². El dominio de estas traducciones es el puente entre el texto de un problema y su solución algebraica.",
        },
        {
          tipo: "lista",
          items: [
            "Suma o adición: 'más', 'aumentado en', 'la suma de', 'excede en', 'la cantidad mayor'.",
            "Resta o sustracción: 'menos', 'disminuido en', 'la diferencia de', 'rebajado en', 'faltan'.",
            "Multiplicación: 'veces', 'el triple de', 'el producto de', 'el doble', 'la mitad de' (×½).",
            "División: 'entre', 'el cociente de', 'partido entre', 'la razón de', 'dividido'.",
            "Potencia: 'el cuadrado de', 'elevado al cubo', 'la n-ésima potencia de'.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El orden de las palabras importa. 'La diferencia de x y 5' es x − 5, pero 'la diferencia de 5 y x' es 5 − x. Ambas expresiones tienen valores distintos para cualquier x ≠ 5. Lee con cuidado el enunciado antes de escribir la expresión algebraica.",
        },
        {
          tipo: "subtitulo",
          contenido: "Identificación de la incógnita",
        },
        {
          tipo: "parrafo",
          contenido:
            "El primer paso para resolver cualquier problema algebraico es identificar qué cantidad se desconoce y asignarle una variable, generalmente x o n. Una vez nombrada la incógnita, las demás cantidades del problema pueden expresarse en términos de ella. Por ejemplo: 'La edad de Ana es tres años más que el doble de la edad de Beto.' Si la edad de Beto es b, la edad de Ana es 2b + 3. Esta traducción convierte el problema de lenguaje en un problema algebraico tratable.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de dos columnas que muestra en la izquierda frases en lenguaje cotidiano y en la derecha su equivalente en expresión algebraica, con flechas de traducción entre ambas columnas",
          caption: "Diccionario de traducción: del lenguaje cotidiano al algebraico.",
        },
      ],
    },
  },

  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-variables-y-expresiones",
    titulo: "Variables y expresiones algebraicas: evaluación y simplificación",
    categoria: "Álgebra",
    conceptos_clave: ["variable", "coeficiente", "término semejante", "evaluación"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una expresión algebraica es una combinación de números, variables y operaciones matemáticas. A diferencia de una ecuación, no contiene signo de igual ni afirma que dos cosas son iguales: simplemente representa una cantidad que depende del valor de la variable. Comprender cómo evaluar y simplificar expresiones es el primer paso del álgebra formal.",
        },
        {
          tipo: "subtitulo",
          contenido: "Anatomía de una expresión algebraica",
        },
        {
          tipo: "parrafo",
          contenido:
            "En la expresión 4x² − 7x + 3, existen tres términos. El término 4x² tiene coeficiente 4, variable x y exponente 2. El término −7x tiene coeficiente −7 y variable x a la primera potencia. El término 3 es el término independiente (o constante). Los términos semejantes son aquellos con la misma variable elevada al mismo exponente; solo ellos pueden combinarse en la simplificación.",
        },
        {
          tipo: "subtitulo",
          contenido: "Simplificación de expresiones",
        },
        {
          tipo: "lista",
          items: [
            "Identificar todos los términos semejantes.",
            "Agruparlos y sumar o restar sus coeficientes.",
            "El resultado es la expresión simplificada.",
            "Ejemplo: 5x² + 3x − 2x² + 7 − x = (5x² − 2x²) + (3x − x) + 7 = 3x² + 2x + 7.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Evaluación de expresiones",
        },
        {
          tipo: "parrafo",
          contenido:
            "Evaluar una expresión significa sustituir la variable por un valor numérico y calcular el resultado siguiendo el orden correcto de las operaciones (paréntesis, potencias, multiplicación/división, adición/sustracción). Ejemplo: evaluar 3x² − 2x + 1 en x = −2: 3(−2)² − 2(−2) + 1 = 3(4) + 4 + 1 = 12 + 4 + 1 = 17.",
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Error frecuente: −2² ≠ (−2)². La expresión −2² equivale a −(2²) = −4, pues la potencia se aplica antes del signo negativo. En cambio, (−2)² = 4 porque el cuadrado de un número negativo es positivo. Cuando sustituyas un valor negativo en una expresión algebraica, enciérralo siempre entre paréntesis.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Expresión algebraica 4x² − 7x + 3 con flechas de colores que etiquetan cada término: coeficiente (4), variable (x), exponente (2), signo negativo, y término constante (3)",
          caption: "Anatomía de una expresión algebraica con tres términos.",
        },
      ],
    },
  },

  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-monomios-operaciones",
    titulo: "Monomios: operaciones fundamentales",
    categoria: "Álgebra",
    conceptos_clave: ["monomio", "grado", "multiplicación de monomios", "división de monomios"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un monomio es una expresión algebraica formada por un solo término: el producto de un número (coeficiente) y una o más variables con exponentes enteros no negativos. Ejemplos de monomios: 5x, −3y², 7x²y, 1/2ab³. Ejemplos de lo que NO son monomios: x + 3 (dos términos), √x (exponente no entero), 1/x (exponente negativo). Los monomios son los 'átomos' de las expresiones algebraicas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Grado de un monomio",
        },
        {
          tipo: "parrafo",
          contenido:
            "El grado de un monomio es la suma de los exponentes de todas sus variables. El monomio 5x³ tiene grado 3. El monomio −4x²y tiene grado 2 + 1 = 3. El monomio 7 (sin variables) tiene grado 0. Conocer el grado es útil para clasificar polinomios y anticipar el comportamiento de funciones.",
        },
        {
          tipo: "subtitulo",
          contenido: "Operaciones con monomios",
        },
        {
          tipo: "lista",
          items: [
            "Suma y resta: solo se pueden sumar o restar monomios semejantes (misma variable, mismo exponente). (3x²) + (5x²) = 8x², pero 3x² + 5x no se simplifica.",
            "Multiplicación: se multiplican los coeficientes y se suman los exponentes de variables iguales. (4x²)(3x³) = 12x⁵.",
            "División: se dividen los coeficientes y se restan los exponentes de variables iguales. (12x⁵) ÷ (4x²) = 3x³.",
            "Potencia de un monomio: se eleva el coeficiente a la potencia y se multiplican los exponentes. (2x³)⁴ = 2⁴ · x¹² = 16x¹².",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La palabra 'monomio' proviene del griego mono (uno) y onoma (nombre o término). El prefijo griego también aparece en 'monocultivo', 'monarca' y 'monólogo'. El término fue popularizado por los matemáticos europeos del siglo XVII al sistematizar el álgebra.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla con cuatro filas mostrando las operaciones con monomios (suma, multiplicación, división y potencia), con un ejemplo resuelto paso a paso en cada fila",
          caption: "Las cuatro operaciones fundamentales con monomios.",
        },
      ],
    },
  },

  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-polinomios-clasificacion",
    titulo: "Polinomios: clasificación y operaciones básicas",
    categoria: "Álgebra",
    conceptos_clave: ["polinomio", "binomio", "trinomio", "grado del polinomio"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un polinomio es una expresión algebraica formada por la suma de dos o más monomios, llamados términos. Los polinomios son el objeto de estudio central del álgebra elemental: cualquier expresión que involucra variables y operaciones básicas puede reducirse, en última instancia, a un polinomio. Su estudio es el puente entre la aritmética y el cálculo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Clasificación por número de términos",
        },
        {
          tipo: "lista",
          items: [
            "Monomio: 1 término. Ej.: 5x³.",
            "Binomio: 2 términos. Ej.: 3x² − 7.",
            "Trinomio: 3 términos. Ej.: x² + 5x − 6.",
            "Polinomio (genérico): 4 o más términos. Ej.: 2x³ − x² + 4x − 1.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Grado de un polinomio",
        },
        {
          tipo: "parrafo",
          contenido:
            "El grado de un polinomio es el mayor exponente de sus términos una vez que está completamente simplificado. El polinomio 4x³ − 2x + 7 tiene grado 3. Un polinomio de grado 1 (ax + b) se llama lineal; de grado 2 (ax² + bx + c) se llama cuadrático; de grado 3 se llama cúbico. El coeficiente del término de mayor grado es el coeficiente principal; si es 1, el polinomio se llama mónico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Suma y resta de polinomios",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para sumar o restar polinomios, se agrupan los términos semejantes y se operan sus coeficientes. Ejemplo: (3x² + 5x − 2) + (x² − 3x + 8) = (3x² + x²) + (5x − 3x) + (−2 + 8) = 4x² + 2x + 6. En la resta, se cambia el signo de todos los términos del polinomio sustraendo antes de agrupar: (3x² + 5x − 2) − (x² − 3x + 8) = 3x² + 5x − 2 − x² + 3x − 8 = 2x² + 8x − 10.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Al restar polinomios, el error más frecuente es distribuir mal el signo negativo. Recuerda: −(x² − 3x + 8) = −x² + 3x − 8. El signo negativo afecta a todos y cada uno de los términos dentro del paréntesis.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Cuadro de clasificación de polinomios con ejemplos de monomio, binomio, trinomio y polinomio general, con el grado de cada uno resaltado",
          caption: "Clasificación de polinomios por número de términos y grado.",
        },
      ],
    },
  },

  // ── 5 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-multiplicacion-polinomios",
    titulo: "Multiplicación de polinomios y productos notables",
    categoria: "Álgebra",
    conceptos_clave: ["trinomio cuadrado perfecto", "diferencia de cuadrados", "distributividad", "FOIL"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La multiplicación de polinomios se basa en la propiedad distributiva: cada término del primer polinomio multiplica a cada término del segundo. Para multiplicar dos binomios, se aplica la regla FOIL (First, Outer, Inner, Last): primeros, externos, internos, últimos. Ejemplo: (x + 3)(x − 5) = x·x + x·(−5) + 3·x + 3·(−5) = x² − 5x + 3x − 15 = x² − 2x − 15.",
        },
        {
          tipo: "subtitulo",
          contenido: "Productos notables",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los productos notables son multiplicaciones de binomios cuyos resultados siguen un patrón predecible. Dominarlos permite expandir o factorizar expresiones algebraicas rápidamente, sin necesidad de multiplicar término a término. Son tres los productos notables fundamentales del bachillerato.",
        },
        {
          tipo: "lista",
          items: [
            "Cuadrado de un binomio suma: (a + b)² = a² + 2ab + b². Ej.: (x + 4)² = x² + 8x + 16.",
            "Cuadrado de un binomio diferencia: (a − b)² = a² − 2ab + b². Ej.: (2x − 3)² = 4x² − 12x + 9.",
            "Producto de una suma por una diferencia: (a + b)(a − b) = a² − b². Ej.: (x + 5)(x − 5) = x² − 25.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El error más común con el cuadrado de un binomio es escribir (a + b)² = a² + b², olvidando el término del medio 2ab. Recuerda: el cuadrado de una suma NO es la suma de los cuadrados. Ejemplo incorrecto: (x + 3)² = x² + 9. Correcto: (x + 3)² = x² + 6x + 9.",
        },
        {
          tipo: "subtitulo",
          contenido: "Multiplicación de un polinomio por un monomio",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para multiplicar un monomio por un polinomio, se distribuye el monomio a cada término del polinomio. Ejemplo: 3x²(2x³ − 5x + 4) = 3x²·2x³ + 3x²·(−5x) + 3x²·4 = 6x⁵ − 15x³ + 12x². Esta operación es el fundamento de la factorización por factor común.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de los tres productos notables con la fórmula general en la primera columna, un ejemplo numérico en la segunda y la comprobación mediante FOIL en la tercera",
          caption: "Los tres productos notables fundamentales con ejemplos y comprobación.",
        },
      ],
    },
  },

  // ── 6 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-factorizacion-factor-comun",
    titulo: "Factorización: factor común y agrupación de términos",
    categoria: "Álgebra",
    conceptos_clave: ["factorización", "factor común monomio", "factor común polinomio", "agrupación"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Factorizar una expresión algebraica es escribirla como un producto de factores. Es la operación inversa de la multiplicación: si multiplicar es expandir, factorizar es compactar. La factorización simplifica expresiones, permite resolver ecuaciones cuadráticas y es indispensable para el trabajo con fracciones algebraicas. El primer paso siempre es buscar el factor común máximo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Factor común monomio",
        },
        {
          tipo: "parrafo",
          contenido:
            "Cuando todos los términos de un polinomio comparten un factor, se extrae fuera del paréntesis. Procedimiento: 1) Calcular el MCD de los coeficientes. 2) Identificar la variable de menor grado presente en todos los términos. 3) El factor común es el producto de ambos. Ejemplo: 12x⁴ − 8x³ + 4x². MCD de coeficientes: 4. Variable de menor grado: x². Factor común: 4x². Resultado: 4x²(3x² − 2x + 1).",
        },
        {
          tipo: "subtitulo",
          contenido: "Factor común polinomio y agrupación",
        },
        {
          tipo: "parrafo",
          contenido:
            "A veces el factor común es un polinomio, no un monomio. Ejemplo: x(y + 2) + 3(y + 2) = (y + 2)(x + 3). El factor (y + 2) es común a ambos términos y se extrae. Cuando ningún término es común a toda la expresión, se puede intentar factorizar por agrupación: se agrupan los términos de dos en dos y se busca el factor común en cada grupo. Ejemplo: ax + ay + bx + by = a(x + y) + b(x + y) = (x + y)(a + b).",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Siempre verifica tu factorización multiplicando los factores. El resultado debe ser idéntico a la expresión original. Si no coincide, hay un error en el proceso. La comprobación es el único método seguro de confirmar que la factorización es correcta.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de árbol que muestra el proceso de factorización: expresión original en la raíz, factor común en la primera rama, polinomio resultante en la segunda, y la comprobación mediante multiplicación debajo",
          caption: "Proceso de factorización por factor común con comprobación.",
        },
      ],
    },
  },

  // ── 7 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-productos-notables",
    titulo: "Factorización por productos notables inversos",
    categoria: "Álgebra",
    conceptos_clave: ["diferencia de cuadrados", "trinomio cuadrado perfecto", "factorización inversa", "cuadrado perfecto"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Así como los productos notables permiten expandir binomios siguiendo un patrón, sus inversas permiten factorizar ciertos polinomios con rapidez. Reconocer si un polinomio corresponde a un producto notable es una habilidad central del álgebra de bachillerato, pues evita el largo proceso de la factorización general.",
        },
        {
          tipo: "subtitulo",
          contenido: "Factorización de diferencia de cuadrados",
        },
        {
          tipo: "parrafo",
          contenido:
            "Reconocer el patrón: a² − b² = (a + b)(a − b). Condiciones para aplicarla: (1) la expresión tiene exactamente dos términos que se restan, (2) ambos son cuadrados perfectos. Ejemplos: x² − 49 = (x + 7)(x − 7). 9x² − 25y² = (3x + 5y)(3x − 5y). 4x⁴ − 1 = (2x² + 1)(2x² − 1). Nota: la suma de cuadrados a² + b² NO se factoriza sobre los números reales.",
        },
        {
          tipo: "subtitulo",
          contenido: "Factorización de trinomio cuadrado perfecto",
        },
        {
          tipo: "parrafo",
          contenido:
            "El patrón es: a² ± 2ab + b² = (a ± b)². Para reconocerlo: (1) el primer y último término son cuadrados perfectos, (2) el término del medio es el doble del producto de sus raíces cuadradas. Ejemplos: x² + 10x + 25 = (x + 5)². 4x² − 12x + 9 = (2x − 3)². Si el signo del término del medio es negativo, el factor es (a − b)².",
        },
        {
          tipo: "lista",
          items: [
            "Paso 1: ¿Hay solo dos términos que se restan y ambos son cuadrados perfectos? → Diferencia de cuadrados.",
            "Paso 2: ¿Hay tres términos, el primero y el último son cuadrados perfectos, y el del medio es 2ab? → Trinomio cuadrado perfecto.",
            "Paso 3: Si ninguno aplica, busca factor común o usa factorización por trinomio general.",
            "Paso 4: Siempre comprueba multiplicando los factores.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los productos notables no son solo un truco algebraico: tienen una interpretación geométrica directa. El cuadrado de un binomio (a + b)² corresponde al área de un cuadrado de lado (a + b), que puede visualizarse como la suma de cuatro rectángulos. Esta interpretación geométrica era la forma en que los matemáticos árabes medievales demostraban estas identidades.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Árbol de decisión para factorizar: cuadro inicial con la expresión, primera bifurcación hacia diferencia de cuadrados o trinomio cuadrado perfecto, con ejemplos resueltos en cada rama",
          caption: "Árbol de decisión para reconocer y aplicar factorización por productos notables.",
        },
      ],
    },
  },

  // ── 8 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-ecuacion-lineal-definicion",
    titulo: "La ecuación lineal: definición, tipos y principios de equivalencia",
    categoria: "Álgebra",
    conceptos_clave: ["ecuación lineal", "solución", "principios de equivalencia", "verificación"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una ecuación es una igualdad entre dos expresiones algebraicas que contiene al menos una incógnita. Una ecuación lineal (o de primer grado) en una variable es aquella donde la incógnita aparece elevada únicamente a la primera potencia, sin multiplicarse por sí misma ni aparecer en denominadores con otra incógnita. Su forma general es ax + b = c, con a ≠ 0. Resolver la ecuación significa encontrar el valor de x que hace verdadera la igualdad.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de ecuaciones según su solución",
        },
        {
          tipo: "lista",
          items: [
            "Ecuación determinada: tiene una solución única. Ej.: 2x − 4 = 8 → x = 6.",
            "Ecuación indeterminada (identidad): es verdadera para cualquier valor de x. Ej.: 2(x + 1) = 2x + 2.",
            "Ecuación imposible (contradictoria): no tiene solución. Ej.: 3x + 5 = 3x − 2 → 5 = −2 (absurdo).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Principios de equivalencia",
        },
        {
          tipo: "parrafo",
          contenido:
            "Dos ecuaciones son equivalentes si tienen exactamente el mismo conjunto de soluciones. Los principios de equivalencia garantizan que ciertas operaciones transforman una ecuación en otra equivalente: (1) Principio aditivo: sumar o restar la misma cantidad en ambos miembros. (2) Principio multiplicativo: multiplicar o dividir ambos miembros por una misma cantidad distinta de cero. Estos principios son la base de todos los métodos de resolución.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Verificar la solución sustituyendo el valor encontrado en la ecuación original es un paso obligatorio, no opcional. Puede ocurrir que un error de cálculo produzca un valor que no satisface la ecuación. La sustitución revela el error y te da la oportunidad de corregirlo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Balanza de dos platillos representando la ecuación 2x − 4 = 8, con los pasos de resolución escritos debajo: sumar 4 a ambos lados, dividir entre 2, obtener x = 6 y verificar",
          caption: "La ecuación como balanza: los principios de equivalencia mantienen el equilibrio.",
        },
      ],
    },
  },

  // ── 9 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-ecuaciones-con-fracciones",
    titulo: "Ecuaciones lineales con fracciones y paréntesis",
    categoria: "Álgebra",
    conceptos_clave: ["mínimo común denominador", "eliminar denominadores", "distributividad", "ecuación con paréntesis"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las ecuaciones con fracciones y paréntesis son una extensión natural de las ecuaciones lineales básicas. El procedimiento de resolución añade pasos previos para eliminar los denominadores y expandir los paréntesis, dejando la ecuación en su forma estándar. Dominar estos pasos es esencial, pues este tipo de ecuaciones aparece constantemente en problemas de aplicación.",
        },
        {
          tipo: "subtitulo",
          contenido: "Resolución de ecuaciones con fracciones",
        },
        {
          tipo: "parrafo",
          contenido:
            "El método más eficiente consiste en multiplicar todos los términos de la ecuación por el Mínimo Común Denominador (MCD) de todas las fracciones involucradas. Esto elimina todos los denominadores y convierte la ecuación en una sin fracciones, que es más fácil de resolver. Ejemplo: x/3 + (x−1)/4 = 5. MCD de 3 y 4 es 12. Multiplicamos todo por 12: 4x + 3(x−1) = 60 → 4x + 3x − 3 = 60 → 7x = 63 → x = 9.",
        },
        {
          tipo: "subtitulo",
          contenido: "Resolución de ecuaciones con paréntesis",
        },
        {
          tipo: "lista",
          items: [
            "Paso 1: Expandir todos los paréntesis aplicando la propiedad distributiva.",
            "Paso 2: Simplificar cada miembro de la ecuación combinando términos semejantes.",
            "Paso 3: Pasar todos los términos con incógnita al miembro izquierdo y los independientes al derecho.",
            "Paso 4: Despejar la incógnita.",
            "Paso 5: Verificar sustituyendo en la ecuación original.",
          ],
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Al multiplicar para eliminar denominadores, el factor debe multiplicar a todos los términos de ambos miembros, no solo a los que tienen denominador. Omitir un término es el error más frecuente y produce un resultado incorrecto. Escribe el paso de multiplicación de forma explícita antes de simplificar.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ecuación x/3 + (x−1)/4 = 5 resuelta paso a paso: identificación del MCD (12), multiplicación de todos los términos, expansión de paréntesis, simplificación y solución x = 9",
          caption: "Resolución paso a paso de una ecuación con fracciones.",
        },
      ],
    },
  },

  // ── 10 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-problemas-con-ecuaciones",
    titulo: "Resolución de problemas con ecuaciones lineales",
    categoria: "Metodología matemática",
    conceptos_clave: ["planteamiento algebraico", "modelado", "traducción verbal", "verificación en contexto"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Resolver una ecuación lineal es una habilidad mecánica; plantearla correctamente a partir de un problema real es una habilidad intelectual de mayor nivel. El planteamiento algebraico es el proceso de traducir un problema enunciado en lenguaje natural a una ecuación (o sistema de ecuaciones) que lo modela matemáticamente. Esta habilidad conecta la matemática con todas las ciencias y con la vida cotidiana.",
        },
        {
          tipo: "subtitulo",
          contenido: "Método de resolución de problemas de George Pólya",
        },
        {
          tipo: "lista",
          items: [
            "Comprender el problema: ¿qué se pide? ¿Qué datos se proporcionan? ¿Hay condiciones implícitas?",
            "Trazar un plan: asignar variables a las incógnitas y expresar las relaciones del problema como ecuaciones.",
            "Ejecutar el plan: resolver el sistema algebraico con los métodos conocidos.",
            "Revisar: verificar que la solución satisface la ecuación y que tiene sentido en el contexto del problema (por ejemplo, una longitud no puede ser negativa).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo resuelto: problema de edades",
        },
        {
          tipo: "parrafo",
          contenido:
            "Problema: 'La edad de Rosa es el doble de la de su hermano Luis. Dentro de 6 años, la suma de sus edades será 51. ¿Cuántos años tiene cada uno ahora?' Solución: Sea L = edad actual de Luis. Entonces la edad de Rosa es 2L. Dentro de 6 años: (L + 6) + (2L + 6) = 51. Simplificando: 3L + 12 = 51 → 3L = 39 → L = 13. Luis tiene 13 años y Rosa tiene 26 años. Verificación: 13 + 6 = 19 y 26 + 6 = 32; 19 + 32 = 51. ✓",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El paso más crítico y el que más errores produce es la traducción. Lee el enunciado con cuidado, identifica qué cantidad desconocida es más conveniente llamar x, y exprésalo todo en términos de esa variable. A menudo, dibujar un esquema o tabla ayuda a organizar la información antes de plantear la ecuación.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de flujo del método Pólya aplicado al problema de edades: cuadro de comprensión con los datos, cuadro de planeación con la variable y la ecuación, cuadro de resolución con los pasos algebraicos, cuadro de revisión con la verificación",
          caption: "Aplicación del método Pólya a un problema de edades.",
        },
      ],
    },
  },

  // ── 11 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-sistemas-de-ecuaciones",
    titulo: "Sistemas de ecuaciones lineales 2×2: concepto y tipos",
    categoria: "Álgebra",
    conceptos_clave: ["sistema de ecuaciones", "solución única", "sistema incompatible", "sistema dependiente"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un sistema de ecuaciones lineales 2×2 es un conjunto de dos ecuaciones lineales con dos incógnitas que deben satisfacerse de forma simultánea. Geométricamente, cada ecuación representa una recta en el plano cartesiano; la solución del sistema es el punto (o conjunto de puntos) donde ambas rectas coinciden. Los sistemas de ecuaciones modelan una enorme variedad de situaciones reales donde dos condiciones deben cumplirse al mismo tiempo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de sistemas según su solución",
        },
        {
          tipo: "lista",
          items: [
            "Sistema compatible determinado: las dos rectas se cruzan en un único punto. El sistema tiene exactamente una solución (x₀, y₀). Es el caso más frecuente.",
            "Sistema compatible indeterminado: las dos rectas son la misma (coincidentes). El sistema tiene infinitas soluciones (todos los puntos de la recta).",
            "Sistema incompatible: las dos rectas son paralelas y no se cruzan. El sistema no tiene solución.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Identificación sin resolver",
        },
        {
          tipo: "parrafo",
          contenido:
            "Dado el sistema a₁x + b₁y = c₁ y a₂x + b₂y = c₂, se puede anticipar el tipo comparando las razones entre los coeficientes: si a₁/a₂ ≠ b₁/b₂, el sistema es compatible determinado (una solución). Si a₁/a₂ = b₁/b₂ = c₁/c₂, es compatible indeterminado (infinitas soluciones). Si a₁/a₂ = b₁/b₂ ≠ c₁/c₂, es incompatible (sin solución).",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los sistemas de ecuaciones lineales tienen aplicaciones directas en la economía: calcular el punto de equilibrio entre oferta y demanda requiere resolver un sistema de dos ecuaciones. El economista que encuentra ese punto determina el precio y la cantidad en que el mercado se 'vacía' sin exceso ni escasez.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tres planos cartesianos comparativos: el primero con dos rectas cruzándose (solución única), el segundo con dos rectas coincidentes (infinitas soluciones) y el tercero con dos rectas paralelas (sin solución)",
          caption: "Los tres tipos de sistemas 2×2 y su interpretación gráfica.",
        },
      ],
    },
  },

  // ── 12 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-metodo-sustitucion",
    titulo: "Método de sustitución para sistemas de ecuaciones",
    categoria: "Álgebra",
    conceptos_clave: ["método de sustitución", "despejar variable", "back-substitution", "solución del sistema"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El método de sustitución es una de las técnicas algebraicas clásicas para resolver sistemas de ecuaciones 2×2. Consiste en despejar una variable en una de las ecuaciones y sustituir esa expresión en la otra ecuación, reduciendo el sistema a una sola ecuación con una sola incógnita. Es el método preferido cuando una de las ecuaciones tiene un coeficiente igual a 1 (o −1) frente a alguna variable, lo que facilita el despeje.",
        },
        {
          tipo: "subtitulo",
          contenido: "Algoritmo paso a paso",
        },
        {
          tipo: "lista",
          items: [
            "Paso 1: Elegir una de las dos ecuaciones y despejar una variable (la más sencilla).",
            "Paso 2: Sustituir la expresión obtenida en la otra ecuación.",
            "Paso 3: Resolver la ecuación resultante, que tiene una sola incógnita.",
            "Paso 4: Sustituir el valor encontrado en la expresión despejada del Paso 1 para hallar la segunda variable (back-substitution).",
            "Paso 5: Verificar la solución en ambas ecuaciones originales.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo resuelto",
        },
        {
          tipo: "parrafo",
          contenido:
            "Sistema: x − 2y = 4 y 3x + y = 5. Paso 1: de la primera ecuación, x = 2y + 4. Paso 2: sustituimos en la segunda: 3(2y + 4) + y = 5 → 6y + 12 + y = 5 → 7y = −7 → y = −1. Paso 4: x = 2(−1) + 4 = 2. Solución: (2, −1). Paso 5: 2 − 2(−1) = 4 ✓ y 3(2) + (−1) = 5 ✓.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La verificación en ambas ecuaciones originales es obligatoria. Es posible que un error en el Paso 2 produzca un valor de y que satisfaga la ecuación reducida pero no el sistema original. Solo sustituyendo en las dos ecuaciones puedes estar seguro de que la solución es correcta.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Sistema de ecuaciones resuelto por sustitución con cinco pasos claramente etiquetados: despeje de x, sustitución en la segunda ecuación, resolución de y, back-substitution para x, y verificación en ambas ecuaciones",
          caption: "Método de sustitución: los cinco pasos con el sistema x − 2y = 4 y 3x + y = 5.",
        },
      ],
    },
  },

  // ── 13 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-metodo-eliminacion",
    titulo: "Método de eliminación (reducción) para sistemas de ecuaciones",
    categoria: "Álgebra",
    conceptos_clave: ["método de eliminación", "reducción", "multiplicar ecuaciones", "variable opuesta"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El método de eliminación, también llamado método de reducción o de Gauss, resuelve sistemas de ecuaciones sumando las ecuaciones de tal forma que una variable desaparece (se 'elimina'). Para lograrlo, se multiplican una o ambas ecuaciones por constantes que hagan que los coeficientes de una variable sean opuestos (uno positivo y el otro negativo con el mismo valor absoluto). Es el método preferido cuando los coeficientes de las variables son similares.",
        },
        {
          tipo: "subtitulo",
          contenido: "Algoritmo paso a paso",
        },
        {
          tipo: "lista",
          items: [
            "Paso 1: Decidir qué variable se eliminará.",
            "Paso 2: Multiplicar una o ambas ecuaciones por las constantes necesarias para que los coeficientes de esa variable sean opuestos.",
            "Paso 3: Sumar las dos ecuaciones. La variable elegida desaparece.",
            "Paso 4: Resolver la ecuación resultante.",
            "Paso 5: Sustituir en cualquiera de las ecuaciones originales para hallar la otra variable.",
            "Paso 6: Verificar en ambas ecuaciones.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo resuelto",
        },
        {
          tipo: "parrafo",
          contenido:
            "Sistema: 3x + 2y = 16 y 5x − 2y = 8. Los coeficientes de y ya son opuestos (2 y −2). Sumamos directamente: 8x = 24 → x = 3. Sustituimos en la primera ecuación: 3(3) + 2y = 16 → 9 + 2y = 16 → 2y = 7 → y = 3.5. Solución: (3, 3.5). Verificación: 3(3) + 2(3.5) = 9 + 7 = 16 ✓ y 5(3) − 2(3.5) = 15 − 7 = 8 ✓.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Cuando necesites multiplicar ambas ecuaciones, usa las constantes adecuadas para el MCM de los coeficientes de la variable a eliminar. Por ejemplo, para eliminar x de 2x + 3y = 7 y 3x − y = 5, multiplica la primera por 3 y la segunda por −2, obteniendo 6x y −6x que suman cero.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Sistema 3x + 2y = 16 y 5x − 2y = 8 resuelto por eliminación: las dos ecuaciones escritas una encima de otra con flechas de suma, la ecuación reducida 8x = 24, la solución x = 3 y la sustitución para y = 3.5",
          caption: "Método de eliminación: suma directa de ecuaciones con coeficientes opuestos.",
        },
      ],
    },
  },

  // ── 14 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-aplicaciones-sistemas",
    titulo: "Aplicaciones de sistemas de ecuaciones en problemas reales",
    categoria: "Aplicaciones",
    conceptos_clave: ["mezclas", "movimiento uniforme", "punto de equilibrio", "modelado con sistemas"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los sistemas de ecuaciones 2×2 son herramientas poderosas para modelar situaciones reales donde dos condiciones deben satisfacerse simultáneamente. Problemas de mezclas, movimiento, economía, química y muchas otras áreas se reducen a sistemas lineales. Aprender a plantear estas situaciones como sistemas es una competencia transferible a toda la educación superior y a la vida profesional.",
        },
        {
          tipo: "subtitulo",
          contenido: "Problemas de mezclas",
        },
        {
          tipo: "parrafo",
          contenido:
            "Problema: un almacén tiene café tipo A a $120/kg y tipo B a $80/kg. Se quiere preparar 50 kg de mezcla que cueste $96/kg. ¿Cuántos kilogramos de cada tipo se necesitan? Sistema: x + y = 50 (kilogramos totales) y 120x + 80y = 4800 (costo total: 96 × 50 = 4800). Resolviendo: x = 20 kg de tipo A e y = 30 kg de tipo B. Este tipo de problema es frecuente en la industria alimentaria y farmacéutica.",
        },
        {
          tipo: "subtitulo",
          contenido: "Problemas de movimiento uniforme",
        },
        {
          tipo: "parrafo",
          contenido:
            "Usando la fórmula d = vt (distancia = velocidad × tiempo), se plantean sistemas cuando hay dos móviles o dos tramos de recorrido. Ejemplo: dos trenes parten en sentidos opuestos desde ciudades distanciadas 420 km; uno viaja a 90 km/h y el otro a 60 km/h. ¿Cuándo se encuentran? Sistema: t₁ = t₂ = t (mismo tiempo transcurrido) y 90t + 60t = 420 → 150t = 420 → t = 2.8 horas (2 h 48 min).",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Antes de plantear el sistema, identifica claramente las dos incógnitas y las dos condiciones del problema. Cada condición generará una ecuación. Un problema bien planteado tiene exactamente tantas condiciones independientes como incógnitas. Si hay más condiciones que incógnitas, puede ser incompatible; si hay menos, indeterminado.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Dos ilustraciones: a la izquierda, dos sacos de café etiquetados 'Tipo A' y 'Tipo B' con flechas hacia una báscula que muestra 50 kg y $96/kg; a la derecha, dos trenes sobre una vía con 420 km de separación",
          caption: "Sistemas de ecuaciones aplicados a mezclas y movimiento.",
        },
      ],
    },
  },

  // ── 15 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-inecuaciones-definicion",
    titulo: "Inecuaciones lineales: definición y propiedades",
    categoria: "Inecuaciones",
    conceptos_clave: ["inecuación", "desigualdad estricta", "conjunto solución", "intervalo"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una inecuación es una desigualdad que contiene al menos una incógnita. A diferencia de las ecuaciones, que tienen soluciones puntuales, las inecuaciones lineales tienen como solución un conjunto infinito de valores que forman un intervalo en la recta numérica. Los signos de comparación que se usan son: < (menor que), > (mayor que), ≤ (menor o igual que) y ≥ (mayor o igual que).",
        },
        {
          tipo: "subtitulo",
          contenido: "Propiedades de las desigualdades",
        },
        {
          tipo: "lista",
          items: [
            "Propiedad aditiva: si a < b, entonces a + c < b + c para cualquier c. (Sumar o restar no cambia el sentido de la desigualdad.)",
            "Propiedad multiplicativa positiva: si a < b y c > 0, entonces ac < bc. (Multiplicar por positivo conserva el sentido.)",
            "Propiedad multiplicativa negativa: si a < b y c < 0, entonces ac > bc. (Multiplicar por negativo invierte el sentido.)",
            "Transitividad: si a < b y b < c, entonces a < c.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de intervalos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las soluciones de las inecuaciones lineales se expresan como intervalos. Un intervalo abierto (a, b) no incluye los extremos; se usa con < o >. Un intervalo cerrado [a, b] los incluye; se usa con ≤ o ≥. Los intervalos semiabiertos como (a, b] o [a, b) incluyen solo uno de los extremos. Los intervalos infinitos se expresan con el símbolo ∞, siempre con paréntesis: (−∞, a) significa 'todos los valores menores que a'.",
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "La regla más olvidada de las inecuaciones: al multiplicar o dividir ambos miembros por un número NEGATIVO, el sentido de la desigualdad se invierte. Si −2x < 8, al dividir entre −2 obtenemos x > −4 (el signo cambia de < a >). Olvidar esta inversión es el error más frecuente y produce soluciones completamente incorrectas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Recta numérica con cuatro ejemplos de intervalos: abierto (a, b) con círculos vacíos, cerrado [a, b] con círculos rellenos, semiabierto (a, b] y semiabierto [a, b), junto a su notación de intervalo",
          caption: "Tipos de intervalos y su representación en la recta numérica.",
        },
      ],
    },
  },

  // ── 16 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-resolucion-inecuaciones",
    titulo: "Resolución de inecuaciones lineales y representación gráfica",
    categoria: "Inecuaciones",
    conceptos_clave: ["resolución de inecuaciones", "inversión del signo", "recta numérica", "inecuaciones compuestas"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Resolver una inecuación lineal sigue el mismo procedimiento que resolver una ecuación, con una diferencia crucial: al multiplicar o dividir por un número negativo, el signo de desigualdad se invierte. La solución se expresa como un intervalo y se representa gráficamente en la recta numérica, donde los extremos excluidos se marcan con un círculo vacío y los incluidos con un círculo relleno.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplos de resolución",
        },
        {
          tipo: "lista",
          items: [
            "Ejemplo 1: 3x − 7 > 8. Sumamos 7: 3x > 15. Dividimos entre 3: x > 5. Solución: (5, +∞).",
            "Ejemplo 2: −4x + 2 ≤ 18. Restamos 2: −4x ≤ 16. Dividimos entre −4 (invertir signo): x ≥ −4. Solución: [−4, +∞).",
            "Ejemplo 3: −3 < 2x + 1 ≤ 7. Restamos 1 en toda la inecuación: −4 < 2x ≤ 6. Dividimos entre 2: −2 < x ≤ 3. Solución: (−2, 3].",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Inecuaciones compuestas",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una inecuación compuesta combina dos desigualdades. Las del tipo a < f(x) < b se resuelven operando en los tres miembros simultáneamente, como en el Ejemplo 3. Las del tipo f(x) < a o f(x) > b se resuelven por separado y la solución es la unión de los dos intervalos. Ejemplo: 2x − 1 < −3 o 2x − 1 > 5. Primera: x < −1. Segunda: x > 3. Solución: (−∞, −1) ∪ (3, +∞).",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Las inecuaciones son fundamentales en la programación lineal, una rama de las matemáticas aplicadas usada para optimizar recursos. Las empresas de logística, aerolíneas y bancos usan programación lineal para maximizar ganancias o minimizar costos bajo restricciones expresadas como inecuaciones lineales. Este campo fue desarrollado en los años 1940 por el matemático soviético Leonid Kantórovich.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tres rectas numéricas correspondientes a los tres ejemplos de resolución: la primera con flecha a la derecha de 5 (círculo vacío), la segunda con flecha a la derecha de −4 (círculo relleno), y la tercera con segmento entre −2 y 3",
          caption: "Representación gráfica de inecuaciones simples y compuestas.",
        },
      ],
    },
  },

  // ── 17 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-historia-algebra-al-khwarizmi",
    titulo: "Al-Juarizmí y el origen del álgebra",
    categoria: "Historia de la matemática",
    conceptos_clave: ["Al-Juarizmí", "al-jabr", "matemáticas árabes", "algoritmo"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Muhammad ibn Musa al-Juarizmí (c. 780–850 d.C.), conocido en Occidente como Al-Khuarismi o Al-Khwarizmi, fue un matemático, astrónomo y geógrafo persa al servicio de la Casa de la Sabiduría (Bayt al-Hikma) en Bagdad. Su obra Kitab al-mukhtasar fi hisab al-jabr wa-l-muqabala ('Libro compendioso sobre el cálculo por al-jabr y al-muqabala'), escrita hacia 820 d.C., es considerada el texto fundacional del álgebra como disciplina matemática autónoma.",
        },
        {
          tipo: "subtitulo",
          contenido: "Al-jabr: el nombre que define una disciplina",
        },
        {
          tipo: "parrafo",
          contenido:
            "La palabra 'álgebra' proviene directamente del árabe al-jabr, que significa 'reunión de partes fracturadas' o 'restitución'. Se refería a la operación de pasar un término de un lado de la ecuación al otro cambiando su signo, lo que 'restaura' el equilibrio de la igualdad. La palabra 'algoritmo', que hoy designa toda secuencia finita de instrucciones para resolver un problema, viene de la latinización del nombre del propio Al-Juarizmí: Algoritmi.",
        },
        {
          tipo: "subtitulo",
          contenido: "Contribuciones al conocimiento matemático",
        },
        {
          tipo: "lista",
          items: [
            "Sistematizó la resolución de ecuaciones de primer y segundo grado con métodos geométricos y algebraicos.",
            "Clasificó los seis tipos de ecuaciones cuadráticas posibles con coeficientes positivos.",
            "Difundió en Occidente el sistema numérico posicional hindú (0-9), que hoy llamamos 'números arábigos'.",
            "Escribió el primer libro de aritmética de posición en árabe, cuya traducción latina comenzó con: 'Dixit Algoritmi…' ('Dijo Al-Juarizmí...').",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La Casa de la Sabiduría de Bagdad (siglos VIII-XIII) fue el mayor centro intelectual del mundo medieval. Allí se tradujeron y conservaron obras de matemáticos griegos, hindúes y persas cuando gran parte de Europa vivía en el oscurantismo. El legado matemático árabe fue retransmitido a Europa a través de España y Sicilia, impulsando el Renacimiento científico.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo desde el año 820 d.C. mostrando la trayectoria del álgebra de Bagdad a España, a Italia medieval, y a la Europa del Renacimiento, con los nombres clave de cada etapa",
          caption: "Trayectoria del álgebra árabe desde Bagdad hasta la matemática moderna.",
        },
      ],
    },
  },

  // ── 18 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-modelado-matematico",
    titulo: "El modelado matemático: traducir la realidad al álgebra",
    categoria: "Metodología matemática",
    conceptos_clave: ["modelo matemático", "variable de estado", "supuestos", "validación del modelo"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El modelado matemático es el proceso de representar una situación del mundo real mediante estructuras matemáticas (ecuaciones, sistemas, funciones, inecuaciones) con el propósito de analizar, predecir o optimizar su comportamiento. Es una de las actividades más importantes de la matemática aplicada y está en la base de la ingeniería, la economía, la biología computacional, la epidemiología y muchas otras disciplinas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ciclo del modelado matemático",
        },
        {
          tipo: "lista",
          items: [
            "1. Formulación: identificar el fenómeno real, sus variables relevantes y los supuestos simplificadores.",
            "2. Matematización: traducir las relaciones del fenómeno a expresiones, ecuaciones o sistemas algebraicos.",
            "3. Resolución: aplicar los métodos matemáticos pertinentes para obtener la solución del modelo.",
            "4. Interpretación: traducir la solución matemática de vuelta al contexto real y verificar que tiene sentido.",
            "5. Validación: comparar las predicciones del modelo con datos reales y ajustar si hay discrepancias.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo en contexto mexicano: consumo de agua",
        },
        {
          tipo: "parrafo",
          contenido:
            "En una ciudad del Valle de México, el consumo de agua doméstico tiene un costo fijo de $85/mes más $14.50 por cada m³ consumido. Un hogar quiere gastar a lo sumo $600 al mes en agua. Modelado: 85 + 14.50x ≤ 600, donde x es el consumo en m³. Resolviendo: 14.50x ≤ 515 → x ≤ 35.5 m³. El modelo indica que el consumo debe limitarse a 35 m³ mensuales (redondeando al entero menor). Este tipo de modelo lineal es exactamente el que usan los organismos operadores de agua para diseñar tarifas.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Todo modelo matemático simplifica la realidad. Los supuestos que se hacen al construirlo determinan su utilidad y sus límites. Un buen modelo captura lo esencial del fenómeno sin incluir tanta complejidad que sea imposible de resolver. La capacidad de decidir qué simplificar y qué conservar es la habilidad central del matemático aplicado.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama circular del ciclo de modelado matemático con cinco fases: Fenómeno real → Formulación → Modelo matemático → Resolución → Interpretación → Validación → Fenómeno real, con flechas de retroalimentación",
          caption: "El ciclo completo del modelado matemático.",
        },
      ],
    },
  },

  // ── 19 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-errores-frecuentes-algebra",
    titulo: "Errores frecuentes en álgebra y cómo evitarlos",
    categoria: "Metodología matemática",
    conceptos_clave: ["error de signo", "distributividad incorrecta", "confusión de operaciones", "metacognición"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El álgebra es una materia donde errores aparentemente pequeños producen resultados completamente incorrectos. Aprender a identificar los errores más frecuentes y sus causas es una forma eficaz de mejorar el desempeño matemático. Estudiar los errores propios (metacognición) es, según la investigación educativa, una de las estrategias de aprendizaje más efectivas disponibles para los estudiantes.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los errores más frecuentes",
        },
        {
          tipo: "lista",
          items: [
            "Error 1: (a + b)² = a² + b². Incorrecto. Correcto: (a + b)² = a² + 2ab + b². Se omite el término del medio.",
            "Error 2: Cancelar sumandos en fracciones. Incorrecto: (x² + 4)/4 = x². Correcto: la fracción no simplifica porque 4 no es factor de todo el numerador.",
            "Error 3: No invertir el signo al dividir por negativo en inecuaciones. Si −3x > 9, la solución NO es x > −3, sino x < −3.",
            "Error 4: Distribuir mal el signo negativo. −(3x − 5) ≠ −3x − 5. Correcto: −3x + 5.",
            "Error 5: Confundir 'el doble de x más tres' (2x + 3) con 'el doble de la suma de x y tres' (2(x + 3) = 2x + 6).",
            "Error 6: Operar variables con diferente exponente. 3x² + 2x ≠ 5x³. Son términos no semejantes.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Estrategias de prevención",
        },
        {
          tipo: "parrafo",
          contenido:
            "La principal estrategia preventiva es la verificación sistemática: siempre sustituye tu solución en la expresión o ecuación original para comprobar que es correcta. Para las identidades algebraicas, verifica con valores numéricos específicos antes de generalizar. Llevar un 'diario de errores' —una lista de los errores que cometes con más frecuencia— y revisarlo antes de cada examen es otra técnica altamente efectiva.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La investigación en didáctica de la matemática (como la de Guy Brousseau en Francia o de Dora Alicia Romero en México) muestra que los errores algebraicos de los estudiantes no son aleatorios: responden a concepciones previas o a generalizaciones incorrectas de reglas aritméticas. Entender por qué ocurre un error, no solo que es incorrecto, es lo que permite corregirlo de forma duradera.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de dos columnas con seis errores frecuentes en álgebra: en la columna izquierda la versión incorrecta tachada en rojo, en la columna derecha la versión correcta en verde",
          caption: "Los seis errores más frecuentes en álgebra y sus correcciones.",
        },
      ],
    },
  },

  // ── 20 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pm-ii-algebra-y-programacion",
    titulo: "Álgebra y programación: las matemáticas detrás del código",
    categoria: "Aplicaciones",
    conceptos_clave: ["variable en programación", "condicional", "bucle", "pensamiento algebraico"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El álgebra y la programación comparten una raíz conceptual profunda: ambas son lenguajes simbólicos para expresar relaciones, procesos y reglas de transformación. No es casualidad que la palabra 'algoritmo' —el concepto central de la informática— derive del nombre del matemático Al-Juarizmí, quien sistematizó los procedimientos algebraicos. Aprender álgebra es, en parte, aprender a pensar como un programador.",
        },
        {
          tipo: "subtitulo",
          contenido: "Variables en matemáticas y en programación",
        },
        {
          tipo: "parrafo",
          contenido:
            "En álgebra, una variable representa una cantidad desconocida o que puede tomar diferentes valores. En programación, una variable es un espacio de memoria con un nombre que almacena un valor que puede cambiar durante la ejecución del programa. En ambos casos, la variable es un contenedor con nombre. La diferencia es que en álgebra una ecuación como x = x + 1 es una contradicción (ningún número es igual a sí mismo más uno), pero en programación x = x + 1 es una instrucción válida que significa 'aumenta el valor almacenado en x en una unidad'.",
        },
        {
          tipo: "subtitulo",
          contenido: "Álgebra en la lógica condicional y los bucles",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las inecuaciones algebraicas aparecen directamente en los condicionales de los programas. La instrucción 'si temperatura > 37.5, entonces mostrar alerta de fiebre' es una inecuación en acción. Los bucles (for, while) usan ecuaciones de recurrencia: en un bucle que suma los primeros n números, la fórmula S = n(n+1)/2 (suma de los primeros n enteros) es álgebra pura. La capacidad de derivar esa fórmula antes de escribir el bucle distingue a un programador matemáticamente formado de uno que solo sabe escribir código.",
        },
        {
          tipo: "lista",
          items: [
            "Cálculo de descuentos: precio_final = precio_base * (1 − descuento/100). Álgebra directa.",
            "Conversión de unidades: fahrenheit = celsius * 9/5 + 32. Función lineal.",
            "Validación de rango: si 0 ≤ calificacion ≤ 100. Sistema de inecuaciones compuestas.",
            "Progresión aritmética: suma_n = n * (primero + ultimo) / 2. Fórmula algebraica.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En México, la demanda de programadores con sólidos fundamentos matemáticos supera con creces la oferta. Según datos del INEGI y la AMITI (Asociación Mexicana de la Industria de Tecnologías de Información), el sector TI crecía a más de un 8% anual antes de 2024, y las posiciones mejor remuneradas corresponden a quienes combinan habilidades de programación con matemáticas, estadística o inteligencia artificial. El álgebra que estudias hoy es la base de esa formación.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Comparación en dos columnas: a la izquierda, una expresión algebraica como 'precio = costo * (1 + margen)'; a la derecha, la línea de código equivalente en Python, mostrando la correspondencia directa entre el lenguaje algebraico y el lenguaje de programación",
          caption: "El álgebra como lenguaje: de la expresión matemática al código de programación.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaPMII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca PM-II (20 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "PM-II")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC PM-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_PMII.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas PM-II: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de PM-II insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca PM-II completado.\n");
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
  seedBibliotecaPMII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
