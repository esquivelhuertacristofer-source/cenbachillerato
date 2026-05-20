/**
 * Seed de fichas de biblioteca para PM-IV (Pensamiento Matemático IV).
 * 19 fichas temáticas alineadas al MCCEMS 2025, Semestre 4.
 *
 * Uso: npx tsx scripts/seed-fichas-pmiv.ts
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

const FICHAS_PMIV = [
  // ── 1 ── Funciones ─────────────────────────────────────────────────────────
  {
    slug: "pm-iv-concepto-funcion",
    titulo: "El concepto de función: dominio, rango y tipos",
    categoria: "Funciones",
    conceptos_clave: ["función", "dominio", "rango", "relación", "criterio vertical"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una función es una relación entre dos conjuntos (dominio y rango) en la que a cada elemento del dominio le corresponde exactamente un elemento del rango. Esta definición tan precisa es la piedra angular del análisis matemático moderno. La clave está en la palabra 'exactamente': si un valor de entrada produce dos salidas distintas, la relación no es una función. Funciones hay en todas partes: la temperatura en función del tiempo, el precio en función de la cantidad, la altura de un cohete en función del instante.",
        },
        {
          tipo: "subtitulo",
          contenido: "Dominio, rango y la prueba de la línea vertical",
        },
        {
          tipo: "parrafo",
          contenido:
            "El dominio es el conjunto de todos los valores de entrada (x) para los que la función está definida. El rango (o imagen) es el conjunto de todos los valores de salida (y) que la función produce. Para verificar gráficamente si una curva representa una función, se usa el criterio de la línea vertical: si cualquier recta vertical toca la gráfica en más de un punto, la curva no es una función. Un círculo, por ejemplo, no pasa esta prueba; una parábola vertical sí.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de funciones más comunes",
        },
        {
          tipo: "lista",
          items: [
            "Función lineal: f(x) = mx + b. Gráfica: línea recta. Dominio: todos los reales.",
            "Función cuadrática: f(x) = ax² + bx + c. Gráfica: parábola. Dominio: todos los reales.",
            "Función raíz cuadrada: f(x) = √x. Dominio: x ≥ 0. Rango: y ≥ 0.",
            "Función racional: f(x) = 1/x. Dominio: x ≠ 0. Rango: y ≠ 0.",
            "Función trigonométrica: f(x) = sin(x). Dominio: todos los reales. Rango: [−1, 1].",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El concepto de función unifica toda la matemática del bachillerato y la universidad. Las funciones trigonométricas, las funciones exponenciales, las funciones logarítmicas: todas son casos particulares de la misma idea. Comprender bien qué es una función, cuál es su dominio y cómo leer su gráfica es la habilidad más fundamental del pensamiento matemático de nivel medio superior.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de una función como 'máquina': entrada x → caja de función → salida f(x), junto a la prueba de la línea vertical aplicada a una parábola y a un círculo",
          caption: "La función es una correspondencia que asigna exactamente una salida a cada entrada.",
        },
      ],
    },
  },

  // ── 2 ── Funciones ─────────────────────────────────────────────────────────
  {
    slug: "pm-iv-funciones-lineales-pendiente",
    titulo: "Funciones lineales: pendiente, ordenada al origen e interpretación",
    categoria: "Funciones",
    conceptos_clave: ["función lineal", "pendiente", "ordenada al origen", "tasa de cambio", "proporcionalidad"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una función lineal tiene la forma f(x) = mx + b, donde m es la pendiente y b es la ordenada al origen (el valor de f cuando x = 0). Su gráfica es siempre una línea recta. La pendiente m representa la tasa de cambio: cuánto aumenta (o disminuye) la función por cada unidad que aumenta x. Si m > 0, la función crece; si m < 0, decrece; si m = 0, es constante. Las funciones lineales modelan relaciones de proporcionalidad directa cuando b = 0, y relaciones afines cuando b ≠ 0.",
        },
        {
          tipo: "subtitulo",
          contenido: "Interpretación de la pendiente en contextos reales",
        },
        {
          tipo: "lista",
          items: [
            "Velocidad constante: si un automóvil recorre 90 km/h, la distancia d = 90t es lineal con pendiente m = 90.",
            "Tarifa de taxi: si el banderazo cuesta $18 y cada kilómetro cuesta $12, el costo es C = 12x + 18. Pendiente = 12 pesos/km.",
            "Temperatura en función de la altitud: disminuye aproximadamente 6.5°C por cada 1000 metros. Pendiente = −6.5/1000.",
            "Factura de electricidad: cargo fijo (b) más cargo variable por kWh (m × consumo).",
            "Pendiente cero: f(x) = 5 es una función constante; su gráfica es una línea horizontal.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Cálculo de la pendiente entre dos puntos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Si se conocen dos puntos (x₁, y₁) y (x₂, y₂) de una recta, la pendiente se calcula como m = (y₂ − y₁) / (x₂ − x₁). Esta fórmula mide el 'cambio en y dividido entre el cambio en x', es decir, cuánto sube (o baja) la recta por cada unidad que avanza horizontalmente. Por ejemplo, si los puntos son (2, 5) y (6, 13): m = (13 − 5) / (6 − 2) = 8 / 4 = 2. La función es f(x) = 2x + b. Sustituyendo (2, 5): 5 = 4 + b, entonces b = 1. La función es f(x) = 2x + 1.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En ingeniería civil mexicana, la pendiente de una carretera se expresa como porcentaje: una pendiente del 8% significa que por cada 100 metros horizontales, la carretera sube 8 metros (m = 8/100 = 0.08). El Reglamento de Carreteras de la SCT establece pendientes máximas del 10% en zonas montañosas. La Supercarretera México-Acapulco cruza la Sierra Madre del Sur con pendientes que superan ese límite en varios tramos.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tres rectas con distintas pendientes (positiva, negativa y cero) graficadas en el mismo sistema de coordenadas, con la fórmula m = (y₂ − y₁)/(x₂ − x₁) marcada",
          caption: "La pendiente es la tasa de cambio de la función lineal: cuánto sube o baja por cada unidad horizontal.",
        },
      ],
    },
  },

  // ── 3 ── Funciones ─────────────────────────────────────────────────────────
  {
    slug: "pm-iv-funciones-cuadraticas-vertice",
    titulo: "Funciones cuadráticas: vértice, eje de simetría y forma canónica",
    categoria: "Funciones",
    conceptos_clave: ["función cuadrática", "vértice", "eje de simetría", "forma canónica", "máximo y mínimo"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una función cuadrática tiene la forma f(x) = ax² + bx + c con a ≠ 0. Su gráfica es siempre una parábola. El signo de a determina todo: si a > 0, la parábola abre hacia arriba y tiene un mínimo; si a < 0, abre hacia abajo y tiene un máximo. El punto más alto (o más bajo) se llama vértice. Identificar el vértice permite resolver problemas de optimización: encontrar la ganancia máxima, la altura máxima de un proyectil o el área máxima de un terreno.",
        },
        {
          tipo: "subtitulo",
          contenido: "Formas de una función cuadrática",
        },
        {
          tipo: "lista",
          items: [
            "Forma estándar: f(x) = ax² + bx + c. El vértice está en x = −b/2a; y_vértice = f(−b/2a).",
            "Forma canónica (vértice): f(x) = a(x − h)² + k. El vértice es directamente (h, k).",
            "Forma factorizada: f(x) = a(x − r₁)(x − r₂). Los ceros son r₁ y r₂; el vértice está en x = (r₁ + r₂)/2.",
            "Conversión estándar → canónica: completar el cuadrado en la expresión ax² + bx.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo de optimización: área máxima",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un agricultor tiene 100 metros de malla para cercar un terreno rectangular, usando una pared como cuarto lado. Si el lado perpendicular a la pared mide x metros, los dos lados perpendiculares miden 2x en total y el lado paralelo mide 100 − 2x. El área es A(x) = x(100 − 2x) = 100x − 2x². Esta es una función cuadrática con a = −2 < 0, por lo que tiene máximo. El vértice está en x = −100 / (2 × −2) = 25 metros. El área máxima es A(25) = 25 × 50 = 1250 m². El agricultor maximiza el área eligiendo x = 25 metros.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La forma canónica f(x) = a(x − h)² + k revela directamente el vértice (h, k) sin ningún cálculo adicional. Además, muestra que el valor mínimo (o máximo) de la función es k, alcanzado cuando x = h. Si necesitas graficar o analizar una función cuadrática rápidamente, la forma canónica es la más informativa. El proceso de pasar de la forma estándar a la canónica —completar el cuadrado— es una de las habilidades algebraicas más útiles del semestre.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Parábola con vértice (h, k), eje de simetría x = h, ceros r₁ y r₂ marcados, y las tres formas de la función escritas en un recuadro lateral",
          caption: "Las tres formas de la función cuadrática destacan distintos aspectos: estándar, canónica y factorizada.",
        },
      ],
    },
  },

  // ── 4 ── Trigonometría ──────────────────────────────────────────────────────
  {
    slug: "pm-iv-razones-trigonometricas-basicas",
    titulo: "Razones trigonométricas en el triángulo rectángulo",
    categoria: "Trigonometría",
    conceptos_clave: ["seno", "coseno", "tangente", "triángulo rectángulo", "hipotenusa", "catetos"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las razones trigonométricas son proporciones entre los lados de un triángulo rectángulo que dependen únicamente del ángulo considerado. Para un ángulo agudo θ en un triángulo rectángulo, el seno (sin θ) es el cociente entre el cateto opuesto y la hipotenusa, el coseno (cos θ) es el cociente entre el cateto adyacente y la hipotenusa, y la tangente (tan θ) es el cociente entre el cateto opuesto y el cateto adyacente. Estas tres razones son el fundamento de toda la trigonometría aplicada.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las tres razones fundamentales",
        },
        {
          tipo: "lista",
          items: [
            "sin θ = cateto opuesto / hipotenusa. Mnemotecnia: 'opuesto sobre hipotenusa'.",
            "cos θ = cateto adyacente / hipotenusa. Mnemotecnia: 'adyacente sobre hipotenusa'.",
            "tan θ = cateto opuesto / cateto adyacente. Equivalente: tan θ = sin θ / cos θ.",
            "Razones recíprocas: csc θ = 1/sin θ, sec θ = 1/cos θ, cot θ = 1/tan θ.",
            "Relación fundamental: sin²θ + cos²θ = 1 (para cualquier ángulo θ).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Aplicación: calcular lados desconocidos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para calcular lados desconocidos en un triángulo rectángulo, se identifica el ángulo conocido y los lados relevantes. Ejemplo: un árbol proyecta una sombra de 8 metros. El ángulo de elevación del sol es 35°. ¿Cuál es la altura del árbol? El cateto opuesto al ángulo de 35° es la altura h, el cateto adyacente es la sombra (8 m). Entonces tan(35°) = h / 8, por lo que h = 8 × tan(35°) ≈ 8 × 0.700 ≈ 5.60 metros. Este mismo principio permite a los topógrafos mexicanos medir alturas de edificios, torres y cerros sin escalarlos.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La identidad fundamental sin²θ + cos²θ = 1 se deriva directamente del Teorema de Pitágoras aplicado a un triángulo rectángulo con hipotenusa 1. Si el cateto opuesto mide sin θ y el cateto adyacente mide cos θ, entonces (sin θ)² + (cos θ)² = 1² = 1. Esta identidad es válida para cualquier ángulo, no solo para ángulos en triángulos rectángulos, y es la base de todas las identidades trigonométricas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Triángulo rectángulo con el ángulo θ marcado, los lados etiquetados como cateto opuesto, cateto adyacente e hipotenusa, y las tres razones trigonométricas escritas",
          caption: "Las razones trigonométricas relacionan los ángulos de un triángulo rectángulo con las proporciones de sus lados.",
        },
      ],
    },
  },

  // ── 5 ── Trigonometría ──────────────────────────────────────────────────────
  {
    slug: "pm-iv-angulos-especiales-30-45-60",
    titulo: "Ángulos especiales: valores exactos de 30°, 45° y 60°",
    categoria: "Trigonometría",
    conceptos_clave: ["ángulos especiales", "sin 30°", "cos 45°", "tan 60°", "triángulo equilátero", "triángulo isósceles"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los ángulos de 30°, 45° y 60° son los ángulos trigonométricos especiales por excelencia. Sus razones trigonométricas tienen valores exactos expresables con raíces cuadradas sencillas, lo que los convierte en los ángulos de referencia en cálculos exactos de trigonometría. Memorizar estos valores —y entender por qué son así— es una habilidad fundamental que ahorra tiempo en exámenes y problemas de aplicación, y que se usa constantemente en ingeniería, arquitectura y física.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tabla de valores exactos",
        },
        {
          tipo: "lista",
          items: [
            "30°: sin(30°) = 1/2 = 0.500; cos(30°) = √3/2 ≈ 0.866; tan(30°) = √3/3 ≈ 0.577.",
            "45°: sin(45°) = √2/2 ≈ 0.707; cos(45°) = √2/2 ≈ 0.707; tan(45°) = 1.",
            "60°: sin(60°) = √3/2 ≈ 0.866; cos(60°) = 1/2 = 0.500; tan(60°) = √3 ≈ 1.732.",
            "Nota: sin(30°) = cos(60°) y sin(60°) = cos(30°). Los ángulos complementarios intercambian seno y coseno.",
            "Verificación con la identidad fundamental: sin²(45°) + cos²(45°) = (√2/2)² + (√2/2)² = 1/2 + 1/2 = 1. ✓",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Derivación geométrica: los dos triángulos especiales",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los valores de 45° se obtienen del triángulo isósceles rectángulo (catetos = 1, hipotenusa = √2). Los de 30° y 60° se obtienen del triángulo equilátero de lado 2: trazando la altura, se divide en dos triángulos rectángulos con catetos 1 y √3, e hipotenusa 2. En el ángulo de 30°: opuesto = 1, adyacente = √3, hipotenusa = 2, por lo que sin(30°) = 1/2 y cos(30°) = √3/2. En el ángulo de 60°: opuesto = √3, adyacente = 1, por lo que sin(60°) = √3/2 y cos(60°) = 1/2.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los constructores de la Pirámide del Sol en Teotihuacán (construida hacia el año 100 d.C.) trabajaron con inclinaciones de las caras de aproximadamente 43° a 45°. Esto no es coincidencia: los ángulos cercanos a 45° optimizan la estabilidad estructural de las pirámides de sección triangular. La razón sin(45°) = cos(45°) garantiza que la pendiente es exactamente 1:1, la más fácil de verificar con cuerdas y plomadas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Los dos triángulos especiales (isósceles rectángulo y mitad del equilátero) con todos sus lados y ángulos marcados, y la tabla de valores exactos de 30°, 45° y 60°",
          caption: "Los valores de los ángulos especiales se derivan de los dos triángulos más simples de la geometría.",
        },
      ],
    },
  },

  // ── 6 ── Trigonometría ──────────────────────────────────────────────────────
  {
    slug: "pm-iv-circulo-unitario",
    titulo: "El círculo unitario: extensión de las razones trigonométricas",
    categoria: "Trigonometría",
    conceptos_clave: ["círculo unitario", "ángulos en radianes", "cuadrantes", "signos de sin y cos", "ángulo de referencia"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El círculo unitario es la circunferencia de radio 1 centrada en el origen del plano cartesiano. Es el puente que extiende las razones trigonométricas —originalmente definidas solo para ángulos agudos en triángulos rectángulos— a cualquier ángulo real, incluyendo ángulos mayores de 90°, ángulos negativos y múltiplos de 360°. Para un ángulo θ medido desde el eje positivo x en sentido antihorario, el punto donde el rayo terminal intersecta el círculo unitario tiene coordenadas (cos θ, sin θ). Esto redefine el seno y el coseno para cualquier ángulo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los cuatro cuadrantes y los signos de sin y cos",
        },
        {
          tipo: "lista",
          items: [
            "Cuadrante I (0° a 90°): sin θ > 0, cos θ > 0, tan θ > 0. Todos positivos.",
            "Cuadrante II (90° a 180°): sin θ > 0, cos θ < 0, tan θ < 0. Solo seno positivo.",
            "Cuadrante III (180° a 270°): sin θ < 0, cos θ < 0, tan θ > 0. Solo tangente positivo.",
            "Cuadrante IV (270° a 360°): sin θ < 0, cos θ > 0, tan θ < 0. Solo coseno positivo.",
            "Mnemotecnia: 'ACTS' (en sentido antihorario desde el cuadrante I): Todos, Coseno, Tangente, Seno... o 'Todos Santos Tienen Coco'.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Radianes: la medida natural de los ángulos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un radián es el ángulo central que subtiende un arco de longitud igual al radio. Como la circunferencia completa mide 2π radios, una vuelta completa equivale a 2π radianes. Conversión: 180° = π rad; 1° = π/180 rad; 1 rad = 180°/π ≈ 57.3°. Ángulos importantes: 30° = π/6, 45° = π/4, 60° = π/3, 90° = π/2, 180° = π, 270° = 3π/2, 360° = 2π. La medida en radianes hace que las fórmulas de arco, área de sector y cálculo diferencial sean más sencillas: longitud de arco = rθ, área de sector = (1/2)r²θ (con θ en radianes).",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La periodicidad de las funciones trigonométricas surge naturalmente del círculo unitario: después de dar una vuelta completa (360° o 2π), se regresa al mismo punto. Por eso sin(θ + 2π) = sin(θ) y cos(θ + 2π) = cos(θ). Esta propiedad hace que las funciones trigonométricas sean perfectas para modelar fenómenos periódicos: mareas, oscilaciones, ondas sonoras, corriente alterna.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Círculo unitario con los cuatro cuadrantes marcados, los ángulos especiales (30°, 45°, 60°, 90°, 120°...) y sus coordenadas (cos θ, sin θ) indicadas en cada punto",
          caption: "El círculo unitario muestra que (cos θ, sin θ) son las coordenadas del punto en la circunferencia para cada ángulo θ.",
        },
      ],
    },
  },

  // ── 7 ── Trigonometría ──────────────────────────────────────────────────────
  {
    slug: "pm-iv-ley-de-senos",
    titulo: "Ley de Senos: resolver triángulos no rectángulos",
    categoria: "Trigonometría",
    conceptos_clave: ["Ley de Senos", "triángulo oblicuángulo", "ángulo opuesto", "topografía", "navegación"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La Ley de Senos establece que en cualquier triángulo (no solo en el rectángulo), el cociente entre cada lado y el seno del ángulo opuesto es constante: a/sin(A) = b/sin(B) = c/sin(C). Esta constante es igual al diámetro del círculo circunscrito al triángulo. La Ley de Senos es la herramienta principal para resolver triángulos oblicuángulos (sin ángulo recto) cuando se conocen dos ángulos y un lado, o dos lados y un ángulo opuesto.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cuándo usar la Ley de Senos",
        },
        {
          tipo: "lista",
          items: [
            "Caso AAL (Ángulo-Ángulo-Lado): se conocen dos ángulos y cualquier lado. Siempre tiene solución única.",
            "Caso ALA (Ángulo-Lado-Ángulo): se conocen dos ángulos y el lado entre ellos. Solución única.",
            "Caso LAA (Lado-Ángulo-Ángulo): se conocen dos lados y el ángulo opuesto al mayor. Puede tener dos soluciones (caso ambiguo).",
            "No se usa para el caso LLL (tres lados) ni LAL (dos lados y ángulo comprendido): en esos casos se usa la Ley de Cosenos.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo aplicado: medición topográfica",
        },
        {
          tipo: "parrafo",
          contenido:
            "En topografía, la Ley de Senos permite medir distancias inaccesibles. Ejemplo: dos observadores, A y B, separados 500 m, observan la cima de un cerro C. Desde A, el ángulo hacia C es 62°; desde B, el ángulo hacia C es 48°. El ángulo en C es 180° − 62° − 48° = 70°. Por la Ley de Senos: c/sin(C) = b/sin(B), es decir, 500/sin(70°) = AC/sin(48°). Por tanto AC = 500 × sin(48°)/sin(70°) ≈ 500 × 0.743/0.940 ≈ 395 m. Este método de triangulación es usado por el INEGI de México para cartografiar el territorio.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La Ley de Senos a/sin(A) = b/sin(B) = c/sin(C) tiene una demostración elegante: desde cada vértice, se traza la altura correspondiente. La altura desde B es h = c·sin(A) = a·sin(C), lo que da directamente a/sin(A) = c/sin(C). Repetir el proceso desde otro vértice completa la demostración. Esta derivación muestra que la Ley de Senos no es una fórmula arbitraria, sino una consecuencia directa de la definición del seno.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Triángulo oblicuángulo con lados a, b, c y ángulos opuestos A, B, C marcados, junto a la fórmula a/sin(A) = b/sin(B) = c/sin(C) y el diagrama de la triangulación topográfica",
          caption: "La Ley de Senos permite calcular lados y ángulos desconocidos en cualquier tipo de triángulo.",
        },
      ],
    },
  },

  // ── 8 ── Trigonometría ──────────────────────────────────────────────────────
  {
    slug: "pm-iv-ley-de-cosenos",
    titulo: "Ley de Cosenos: generalización del Teorema de Pitágoras",
    categoria: "Trigonometría",
    conceptos_clave: ["Ley de Cosenos", "generalización de Pitágoras", "caso LLL", "caso LAL", "ingeniería"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La Ley de Cosenos establece que en cualquier triángulo con lados a, b, c y ángulo C opuesto al lado c: c² = a² + b² − 2ab·cos(C). Esta fórmula es la generalización directa del Teorema de Pitágoras: cuando C = 90°, cos(90°) = 0 y la fórmula se reduce a c² = a² + b², exactamente el teorema de Pitágoras. Cuando C es agudo, cos(C) > 0 y c² < a² + b²; cuando C es obtuso, cos(C) < 0 y c² > a² + b². La Ley de Cosenos permite resolver triángulos en los casos donde la Ley de Senos no aplica directamente.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cuándo usar la Ley de Cosenos",
        },
        {
          tipo: "lista",
          items: [
            "Caso LLL (tres lados conocidos): despejar el ángulo. cos(C) = (a² + b² − c²) / (2ab).",
            "Caso LAL (dos lados y ángulo comprendido): calcular el tercer lado. c² = a² + b² − 2ab·cos(C).",
            "Verificación: si el ángulo calculado es mayor de 90°, la Ley de Senos podría dar el caso ambiguo; la Ley de Cosenos evita esa ambigüedad.",
            "Para calcular el área de un triángulo con dos lados y ángulo comprendido: Área = (1/2)ab·sin(C).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo: ingeniería de plataformas PEMEX",
        },
        {
          tipo: "parrafo",
          contenido:
            "En las plataformas offshore de PEMEX en el Golfo de México, los ingenieros calculan longitudes de estructuras diagonales usando la Ley de Cosenos. Ejemplo: dos soportes de 12 m y 15 m forman un ángulo de 110° entre sí. ¿Cuánto mide la viga que los une? c² = 12² + 15² − 2(12)(15)·cos(110°) = 144 + 225 − 360·(−0.342) = 369 + 123.1 = 492.1. Por lo tanto c = √492.1 ≈ 22.2 metros. Nótese que el ángulo obtuso (110°) hace que cos(C) sea negativo, lo que hace que c sea mayor que en un triángulo rectángulo con los mismos catetos: c_rect = √(144 + 225) = √369 ≈ 19.2 m.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La Ley de Cosenos en su forma despejada para el ángulo, cos(C) = (a² + b² − c²) / (2ab), permite calcular ángulos en triángulos cuando se conocen los tres lados. Esto es especialmente útil en geodesia y cartografía: cuando las tres distancias entre puntos son conocidas (medidas con GPS o teodolito), los ángulos se calculan con esta fórmula, sin necesidad de medirlos directamente.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Triángulo con el ángulo C y los lados a, b, c marcados, la fórmula c² = a² + b² − 2ab·cos(C) escrita en grande, y el caso especial C = 90° que da el Teorema de Pitágoras",
          caption: "La Ley de Cosenos generaliza el Teorema de Pitágoras a cualquier triángulo: cuando C = 90°, se recupera exactamente a² + b² = c².",
        },
      ],
    },
  },

  // ── 9 ── Trigonometría ──────────────────────────────────────────────────────
  {
    slug: "pm-iv-identidades-trigonometricas",
    titulo: "Identidades trigonométricas fundamentales",
    categoria: "Trigonometría",
    conceptos_clave: ["identidades trigonométricas", "identidad fundamental", "identidades de suma", "identidad de doble ángulo", "simplificación"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las identidades trigonométricas son ecuaciones que son verdaderas para todos los valores del ángulo en su dominio. A diferencia de las ecuaciones ordinarias (que son verdaderas solo para ciertos valores de la incógnita), las identidades son siempre verdaderas. Sirven para simplificar expresiones trigonométricas, demostrar otras identidades y resolver ecuaciones más complejas. La más fundamental es sin²θ + cos²θ = 1, que se deriva del Teorema de Pitágoras aplicado al círculo unitario.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las identidades pitagóricas",
        },
        {
          tipo: "lista",
          items: [
            "Identidad fundamental: sin²θ + cos²θ = 1. Válida para todo θ.",
            "Primera variante (dividir entre cos²θ): tan²θ + 1 = sec²θ.",
            "Segunda variante (dividir entre sin²θ): 1 + cot²θ = csc²θ.",
            "Aplicación: si sin θ = 3/5 (θ en el primer cuadrante), entonces cos θ = √(1 − 9/25) = √(16/25) = 4/5.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Identidades de suma y doble ángulo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las identidades de suma de ángulos permiten calcular el seno y coseno de la suma o diferencia de dos ángulos: sin(A ± B) = sin A·cos B ± cos A·sin B; cos(A ± B) = cos A·cos B ∓ sin A·sin B. De estas se derivan las identidades de doble ángulo (A = B): sin(2A) = 2·sin A·cos A; cos(2A) = cos²A − sin²A = 1 − 2sin²A = 2cos²A − 1. Verificación con ángulos conocidos: sin(60°) = sin(2 × 30°) = 2·sin(30°)·cos(30°) = 2·(1/2)·(√3/2) = √3/2. ✓",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Al simplificar expresiones trigonométricas, la estrategia más efectiva es convertir todo en senos y cosenos usando las definiciones: tan θ = sin θ/cos θ, cot θ = cos θ/sin θ, sec θ = 1/cos θ, csc θ = 1/sin θ. Una vez en términos de seno y coseno, se aplican las identidades pitagóricas para reducir potencias. Este método resuelve la gran mayoría de los problemas de simplificación trigonométrica.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla organizada con las identidades trigonométricas fundamentales: pitagóricas, suma de ángulos, doble ángulo y mitad de ángulo, con verificaciones numéricas",
          caption: "Las identidades trigonométricas son herramientas de simplificación que se derivan todas de sin²θ + cos²θ = 1.",
        },
      ],
    },
  },

  // ── 10 ── Geometría analítica ───────────────────────────────────────────────
  {
    slug: "pm-iv-formula-distancia-punto-medio",
    titulo: "Fórmula de la distancia y el punto medio entre dos puntos",
    categoria: "Geometría analítica",
    conceptos_clave: ["fórmula de distancia", "punto medio", "plano cartesiano", "coordenadas", "Pitágoras generalizado"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La geometría analítica estudia las figuras geométricas mediante coordenadas y ecuaciones algebraicas. Sus herramientas más básicas son la fórmula de la distancia entre dos puntos y la fórmula del punto medio. La distancia entre dos puntos P₁(x₁, y₁) y P₂(x₂, y₂) se calcula como d = √((x₂ − x₁)² + (y₂ − y₁)²), que es directamente el Teorema de Pitágoras aplicado al triángulo rectángulo formado por los dos puntos y el punto (x₂, y₁). El punto medio M de un segmento P₁P₂ tiene coordenadas M = ((x₁ + x₂)/2, (y₁ + y₂)/2).",
        },
        {
          tipo: "subtitulo",
          contenido: "Aplicaciones de distancia y punto medio",
        },
        {
          tipo: "lista",
          items: [
            "Longitud de un segmento: d(A, B) = √((xB − xA)² + (yB − yA)²).",
            "Verificar si un triángulo es rectángulo: calcular los tres lados y verificar si el mayor es la hipotenusa (Pitágoras).",
            "Encontrar el centro de un segmento: M = ((x₁+x₂)/2, (y₁+y₂)/2).",
            "Determinar si un punto está sobre un círculo: comparar su distancia al centro con el radio.",
            "Problema de ubicación: encontrar el punto equidistante de tres puntos dados (circuncentro del triángulo).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo: planificación urbana en la CDMX",
        },
        {
          tipo: "parrafo",
          contenido:
            "En un plano de la Ciudad de México donde 1 unidad = 1 km, el Zócalo está en las coordenadas (0, 0) y el Aeropuerto Internacional Felipe Ángeles se encuentra aproximadamente en (22, 28). La distancia real es d = √(22² + 28²) = √(484 + 784) = √1268 ≈ 35.6 km. El punto medio entre ambos, que sería un punto conveniente para una estación de transporte intermedia, es M = ((0+22)/2, (0+28)/2) = (11, 14). Estas herramientas básicas son el fundamento de los Sistemas de Información Geográfica (SIG) que usa el INEGI.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La fórmula de distancia d = √((x₂−x₁)² + (y₂−y₁)²) se extiende naturalmente a tres dimensiones: d = √((x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²). Esta versión 3D es la base del cálculo de distancias en GPS, robótica y gráficos por computadora. La idea es siempre la misma: la distancia es la raíz cuadrada de la suma de los cuadrados de las diferencias en cada dimensión.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Plano cartesiano con dos puntos P₁ y P₂, el triángulo rectángulo auxiliar formado por ellos, la distancia marcada como hipotenusa y el punto medio M señalado",
          caption: "La fórmula de distancia es el Teorema de Pitágoras aplicado directamente al plano cartesiano.",
        },
      ],
    },
  },

  // ── 11 ── Geometría analítica ───────────────────────────────────────────────
  {
    slug: "pm-iv-ecuacion-recta-pendiente",
    titulo: "Ecuación de la recta: pendiente y formas canónicas",
    categoria: "Geometría analítica",
    conceptos_clave: ["ecuación de la recta", "forma pendiente-ordenada", "forma punto-pendiente", "forma general", "pendiente"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una recta en el plano cartesiano puede describirse por una ecuación algebraica. Hay varias formas equivalentes de escribir esta ecuación, cada una útil en distintos contextos. La forma pendiente-ordenada (y = mx + b) es la más intuitiva para graficar. La forma punto-pendiente (y − y₁ = m(x − x₁)) es la más útil cuando se conoce un punto y la pendiente. La forma general (Ax + By + C = 0) es la más compacta y útil para calcular distancias y para el álgebra. Saber convertir entre estas formas es una habilidad fundamental.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las tres formas de la ecuación de la recta",
        },
        {
          tipo: "lista",
          items: [
            "Pendiente-ordenada: y = mx + b. Ventaja: m y b son inmediatos. La recta vertical x = k no tiene esta forma.",
            "Punto-pendiente: y − y₁ = m(x − x₁). Ventaja: se usa directamente cuando se conoce un punto (x₁, y₁) y la pendiente m.",
            "General: Ax + By + C = 0. Ventaja: incluye rectas verticales. La pendiente es m = −A/B (si B ≠ 0).",
            "Simétrica (interceptos): x/a + y/b = 1. Ventaja: a y b son los interceptos en x e y directamente.",
            "Dos puntos: la pendiente se calcula primero como m = (y₂−y₁)/(x₂−x₁) y se usa la forma punto-pendiente.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Construcción de ecuaciones de recta: ejemplos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Ejemplo 1: Recta con pendiente m = 3 que pasa por (2, 5). Forma punto-pendiente: y − 5 = 3(x − 2) → y = 3x − 1. Ejemplo 2: Recta que pasa por (1, 4) y (3, 10). Pendiente: m = (10 − 4)/(3 − 1) = 3. Ecuación: y − 4 = 3(x − 1) → y = 3x + 1. Ejemplo 3: Recta vertical que pasa por x = 4. Ecuación: x = 4 (no tiene pendiente definida). Ejemplo 4: Recta horizontal y = −2. Pendiente cero. En trazo de planos arquitectónicos, las rectas de referencia se expresan en la forma general Ax + By + C = 0 para evitar problemas con rectas verticales.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La distancia de un punto P(x₀, y₀) a una recta Ax + By + C = 0 se calcula con la fórmula: d = |Ax₀ + By₀ + C| / √(A² + B²). Esta fórmula tiene aplicaciones directas en ingeniería: la distancia de seguridad entre una tubería y una estructura, la distancia entre una carretera y un edificio, la tolerancia de fabricación de una pieza respecto a su eje de diseño.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "La misma recta representada en sus tres formas: pendiente-ordenada, punto-pendiente y general, con los parámetros m, b, x₁, y₁, A, B, C señalados",
          caption: "Las distintas formas de la ecuación de la recta son equivalentes: cada una revela distintos aspectos de la línea.",
        },
      ],
    },
  },

  // ── 12 ── Geometría analítica ───────────────────────────────────────────────
  {
    slug: "pm-iv-rectas-paralelas-perpendiculares",
    titulo: "Rectas paralelas y perpendiculares: condiciones y aplicaciones",
    categoria: "Geometría analítica",
    conceptos_clave: ["rectas paralelas", "rectas perpendiculares", "pendientes inversas recíprocas", "diseño", "ingeniería"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Dos rectas en el plano tienen una relación algebraica precisa entre sus pendientes cuando son paralelas o perpendiculares. Dos rectas son paralelas si y solo si tienen la misma pendiente (m₁ = m₂) pero distinta ordenada al origen, es decir, no son la misma recta. Dos rectas son perpendiculares si y solo si el producto de sus pendientes es −1 (m₁ × m₂ = −1), lo que equivale a decir que m₂ = −1/m₁: las pendientes son inversos opuestos (recíprocos negativos).",
        },
        {
          tipo: "subtitulo",
          contenido: "Condiciones algebraicas",
        },
        {
          tipo: "lista",
          items: [
            "Paralelas: m₁ = m₂ y b₁ ≠ b₂. Ejemplo: y = 2x + 3 y y = 2x − 5 son paralelas (m = 2 en ambas).",
            "Perpendiculares: m₁ × m₂ = −1. Ejemplo: y = 3x + 1 y y = −(1/3)x + 2 son perpendiculares (3 × −1/3 = −1).",
            "Recta horizontal (m = 0) es perpendicular a recta vertical (no definida). Excepción al criterio m₁ × m₂ = −1.",
            "Para encontrar la recta perpendicular a y = mx + b que pasa por (x₀, y₀): la nueva recta tiene pendiente m' = −1/m y pasa por (x₀, y₀).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Aplicaciones en diseño y arquitectura",
        },
        {
          tipo: "parrafo",
          contenido:
            "En el diseño arquitectónico de la Catedral Metropolitana de la Ciudad de México, las columnas y arcos forman sistemas de rectas paralelas y perpendiculares que distribuyen las cargas uniformemente. En ingeniería civil, las carreteras que se intersectan en ángulo recto optimizan el flujo vehicular: la condición de perpendicularidad garantiza que los vehículos de ambas vías tienen igual visibilidad del cruce. En diseño de circuitos electrónicos (PCB), las pistas paralelas minimizan la interferencia electromagnética. La condición algebraica m₁ × m₂ = −1 es la expresión de la perpendicularidad en el lenguaje de la geometría analítica.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La condición de perpendicularidad m₁ × m₂ = −1 tiene una demostración geométrica elegante. Si una recta tiene pendiente m = Δy/Δx, rotar el vector dirección 90° intercambia las componentes y cambia un signo: el nuevo vector dirección es (−Δy, Δx), que corresponde a una pendiente de Δx/(−Δy) = −1/m. Por eso la pendiente de la recta perpendicular es exactamente −1/m.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Dos pares de rectas en el plano cartesiano: un par paralelo con la misma pendiente marcada, y un par perpendicular con las pendientes m y −1/m indicadas y el ángulo recto señalado",
          caption: "Paralelas tienen la misma pendiente; perpendiculares tienen pendientes cuyo producto es −1.",
        },
      ],
    },
  },

  // ── 13 ── Geometría analítica ───────────────────────────────────────────────
  {
    slug: "pm-iv-circunferencia-ecuacion",
    titulo: "La circunferencia: ecuación, centro y radio",
    categoria: "Geometría analítica",
    conceptos_clave: ["circunferencia", "ecuación canónica", "ecuación general", "centro", "radio", "cónicas"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La circunferencia es el lugar geométrico de todos los puntos del plano que están a la misma distancia (radio r) de un punto fijo (centro). Usando la fórmula de la distancia, si el centro es (h, k) y un punto genérico de la circunferencia es (x, y), entonces la distancia de (x, y) al centro es √((x − h)² + (y − k)²) = r. Elevando al cuadrado, se obtiene la ecuación canónica de la circunferencia: (x − h)² + (y − k)² = r². Esta ecuación, junto con la de la parábola, forma la base de las secciones cónicas del semestre.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ecuación canónica y ecuación general",
        },
        {
          tipo: "lista",
          items: [
            "Ecuación canónica: (x − h)² + (y − k)² = r². Centro (h, k) y radio r son directamente visibles.",
            "Circunferencia centrada en el origen: x² + y² = r². Caso especial con h = k = 0.",
            "Ecuación general: x² + y² + Dx + Ey + F = 0. Se obtiene expandiendo la forma canónica.",
            "Conversión general → canónica: completar el cuadrado en x y en y por separado.",
            "Identificación: D = −2h, E = −2k, F = h² + k² − r². El radio es r = √(h² + k² − F).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo: completar el cuadrado",
        },
        {
          tipo: "parrafo",
          contenido:
            "Convertir x² + y² − 6x + 4y − 3 = 0 a forma canónica. Agrupar: (x² − 6x) + (y² + 4y) = 3. Completar el cuadrado en x: x² − 6x + 9 = (x − 3)². Completar el cuadrado en y: y² + 4y + 4 = (y + 2)². Agregar los mismos valores al lado derecho: (x − 3)² + (y + 2)² = 3 + 9 + 4 = 16. La circunferencia tiene centro (3, −2) y radio r = √16 = 4. Para verificar: el punto (7, −2) está en la circunferencia porque (7−3)² + (−2+2)² = 16 + 0 = 16. ✓",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La circunferencia es la primera de las cuatro secciones cónicas que se estudian en el bachillerato (junto con la elipse, la hipérbola y la parábola). Todas se obtienen como intersecciones de un cono con un plano en distintos ángulos. En astronomía, las órbitas de los planetas son elipses (Kepler); en telecomunicaciones, las antenas parabólicas usan la parábola; en arquitectura, las bóvedas de las catedrales usan arcos elípticos. Las cónicas conectan la geometría analítica con la física del universo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Circunferencia en el plano cartesiano con centro (h, k) y radio r marcados, junto al proceso de completar el cuadrado mostrado paso a paso",
          caption: "La ecuación canónica (x − h)² + (y − k)² = r² revela directamente el centro y el radio de la circunferencia.",
        },
      ],
    },
  },

  // ── 14 ── Aplicaciones ─────────────────────────────────────────────────────
  {
    slug: "pm-iv-trigonometria-ingenieria",
    titulo: "Trigonometría en ingeniería: ángulos de inclinación y estructuras",
    categoria: "Aplicaciones",
    conceptos_clave: ["ángulo de inclinación", "componentes de fuerza", "estructuras inclinadas", "PEMEX", "ingeniería civil"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La trigonometría es la herramienta indispensable del ingeniero para analizar fuerzas, calcular longitudes de elementos estructurales y determinar ángulos de inclinación. Cada vez que una fuerza, un cable, una viga o un camino tiene una dirección que no es horizontal ni vertical, las componentes trigonométricas permiten descomponer esa dirección en partes manejables. Sin la trigonometría, sería imposible diseñar puentes, torres de transmisión, plataformas marinas o cualquier estructura con elementos inclinados.",
        },
        {
          tipo: "subtitulo",
          contenido: "Descomposición de fuerzas en componentes",
        },
        {
          tipo: "lista",
          items: [
            "Una fuerza F con ángulo θ respecto a la horizontal tiene componente horizontal Fx = F·cos(θ) y componente vertical Fy = F·sin(θ).",
            "Verificación: |F|² = Fx² + Fy² = (F·cos θ)² + (F·sin θ)² = F²(cos²θ + sin²θ) = F². ✓",
            "Un cable de tensión T a 35° de la horizontal: Tx = T·cos(35°) ≈ 0.819T (componente horizontal); Ty = T·sin(35°) ≈ 0.574T (componente vertical).",
            "En plataformas inclinadas (rampas): la fuerza de gravedad mg se descompone en componente paralela (mg·sin θ) y perpendicular (mg·cos θ) al plano.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Plataformas offshore de PEMEX: ángulos y estructuras",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las plataformas de extracción de petróleo de PEMEX en el Golfo de México, como las de la Sonda de Campeche, emplean perforaciones direccionales: los pozos no son verticales, sino que se inclinan hasta 45° o más para alcanzar yacimientos horizontalmente alejados del punto de perforación. Si un pozo perfora a un ángulo de inclinación de 40° y debe alcanzar un yacimiento a 800 m de profundidad vertical, la longitud real del pozo es: L = profundidad / cos(40°) = 800 / 0.766 ≈ 1044 m. El desplazamiento horizontal del extremo del pozo es: d = 800 × tan(40°) = 800 × 0.839 ≈ 671 m. La trigonometría es literalmente la guía de la broca.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El Puente Tampico, sobre el Río Pánuco en Tamaulipas, tiene tirantes de acero que forman ángulos específicamente calculados para distribuir la tensión de forma óptima. Los tirantes principales forman ángulos de aproximadamente 25° a 60° con la horizontal; la componente vertical de la tensión sostiene el peso del tablero, mientras la componente horizontal se equilibra con la compresión en las torres. Cada milímetro de longitud de tirante y cada décima de grado de ángulo están calculados trigonométricamente.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de una plataforma offshore con un pozo de perforación direccional, mostrando el ángulo de inclinación de 40°, la profundidad vertical de 800 m y la longitud real del pozo calculada",
          caption: "Las perforaciones direccionales de PEMEX usan trigonometría para calcular la longitud y el desplazamiento del pozo.",
        },
      ],
    },
  },

  // ── 15 ── Aplicaciones ─────────────────────────────────────────────────────
  {
    slug: "pm-iv-topografia-medicion-indirecta",
    titulo: "Topografía y medición indirecta: triangulación en México",
    categoria: "Aplicaciones",
    conceptos_clave: ["triangulación", "ángulo de elevación", "ángulo de depresión", "topografía", "INEGI"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La medición indirecta es la capacidad de calcular distancias o alturas que no se pueden medir directamente, usando ángulos y distancias conocidas junto con las leyes trigonométricas. Es el principio fundamental de la topografía: un topógrafo rara vez puede ir hasta el punto que quiere medir (la cima de un volcán, el otro lado de un río, el fondo de un barranco), pero puede medirlo indirectamente desde puntos accesibles. México, con su topografía montañosa y su biodiversidad geográfica, ha requerido de la topografía trigonométrica desde tiempos prehispánicos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ángulos de elevación y depresión",
        },
        {
          tipo: "lista",
          items: [
            "Ángulo de elevación: ángulo que forma la visual hacia un punto alto con respecto a la horizontal. Siempre positivo.",
            "Ángulo de depresión: ángulo que forma la visual hacia un punto bajo con respecto a la horizontal. Siempre positivo.",
            "Desde el punto A a la base de un edificio (ángulo de elevación α): h = d × tan(α), donde d es la distancia horizontal.",
            "Desde la cima de un faro (ángulo de depresión β): la distancia al barco es d = H / tan(β), donde H es la altura del faro.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "El Pico de Orizaba: triangulación clásica",
        },
        {
          tipo: "parrafo",
          contenido:
            "El Pico de Orizaba (Citlaltépetl), el volcán más alto de México con 5636 metros sobre el nivel del mar, fue medido en el siglo XIX mediante triangulación. Dos observadores, A y B, separados por una línea de base de 10 km en tierra llana, miden los ángulos de elevación hacia la cima: α desde A es 18.5°, β desde B es 22.3°. Con la Ley de Senos aplicada al triángulo A-B-Cima, primero se calcula la distancia de cada observador a la base de la montaña, y luego la altura se obtiene multiplicando esa distancia por el seno del ángulo de elevación. Este método, aplicado sistemáticamente a toda la Sierra Madre, permitió al INEGI cartografiar México con precisión.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El teodolito es el instrumento topográfico que mide ángulos horizontales y verticales con precisión de segundos de arco (1/3600 de grado). Con un teodolito y una cinta métrica (o hoy en día un GPS y un medidor láser de distancias), cualquier punto del territorio puede ubicarse con precisión centimétrica. La trigonometría es el lenguaje matemático que transforma las lecturas angulares del teodolito en distancias y alturas concretas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de triangulación con dos observadores A y B midiendo ángulos hacia la cima de un volcán, con las fórmulas de la Ley de Senos aplicadas y la altura calculada",
          caption: "La triangulación topográfica permite calcular alturas inaccesibles midiendo solo ángulos desde puntos base conocidos.",
        },
      ],
    },
  },

  // ── 16 ── Aplicaciones ─────────────────────────────────────────────────────
  {
    slug: "pm-iv-arquitectura-prehispanica-geometria",
    titulo: "Geometría y astronomía en la arquitectura prehispánica mexicana",
    categoria: "Aplicaciones",
    conceptos_clave: ["Pirámide del Sol", "Teotihuacán", "orientación astronómica", "ángulos solares", "geometría sagrada"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las grandes construcciones prehispánicas de México no son simples monumentos: son instrumentos astronómicos y geométricos de precisión extraordinaria. Los constructores de Teotihuacán, Chichén Itzá, Monte Albán y Uxmal incorporaron en sus edificios relaciones angulares precisas con los movimientos del sol, la luna, Venus y las estrellas. Para lograr estas orientaciones, necesitaban conocer y aplicar razones trigonométricas, aunque no en la notación que conocemos hoy. La arquitectura era su calculadora y su observatorio.",
        },
        {
          tipo: "subtitulo",
          contenido: "La Pirámide del Sol: geometría y ángulos",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Pirámide del Sol en Teotihuacán tiene una base cuadrada de aproximadamente 222 metros por lado y una altura de 65 metros. El ángulo de inclinación de sus caras se puede calcular: si la mitad de la base es 111 m y la altura es 65 m, el ángulo de la cara con respecto a la horizontal es arctan(65/111) ≈ arctan(0.586) ≈ 30.3°. No es coincidencia que este ángulo sea cercano a 30°: los constructores teotihuacanos diseñaron conscientemente la inclinación de las pirámides en relación con los ángulos de elevación del sol en el solsticio y el equinoccio. El 19 de agosto, el sol se pone exactamente perpendicular al eje de la Calzada de los Muertos.",
        },
        {
          tipo: "subtitulo",
          contenido: "El Caracol de Chichén Itzá: el observatorio maya",
        },
        {
          tipo: "lista",
          items: [
            "El Caracol (siglo X d.C.) es el observatorio astronómico maya más famoso. Sus ventanas están orientadas hacia los puntos de salida y puesta de Venus.",
            "El ángulo de 21.5° norte del oeste de la ventana principal coincide con el punto del horizonte donde Venus se pone en su elongación máxima.",
            "El Templo de Kukulkán (El Castillo) en Chichén Itzá: en los equinoccios, la sombra de la escalera crea el efecto de una serpiente descendiendo, usando ángulos de 45° en los escalones.",
            "Monte Albán (zapoteca): el Edificio J está orientado 45° fuera del eje cardinal para observar la estrella Capella al cénit, lo que señalaba el inicio del año agrícola.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los arquitectos prehispánicos usaban el gnomon (una vara vertical) y su sombra para medir ángulos solares. Si en el mediodía del solsticio de verano una vara de 2 metros proyecta una sombra de 0.73 metros, el ángulo de elevación solar es arctan(2/0.73) ≈ 70°, lo que indica que el lugar está a aproximadamente 20° de latitud norte — exactamente la latitud de Teotihuacán. Con este método, los constructores conocían su latitud con precisión de menos de 1° sin ninguna tabla trigonométrica formalizada.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Sección transversal de la Pirámide del Sol con el ángulo de inclinación de 30.3° marcado, y un diagrama del Caracol con sus ventanas orientadas hacia Venus",
          caption: "Las pirámides prehispánicas son instrumentos astronómicos: sus ángulos de inclinación fueron diseñados en relación con los movimientos solares y estelares.",
        },
      ],
    },
  },

  // ── 17 ── Aplicaciones ─────────────────────────────────────────────────────
  {
    slug: "pm-iv-parabola-geometria-analitica",
    titulo: "La parábola en geometría analítica: foco, directriz y ecuación",
    categoria: "Aplicaciones",
    conceptos_clave: ["parábola", "foco", "directriz", "vértice", "ecuación canónica", "antena parabólica"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En geometría analítica, la parábola se define como el lugar geométrico de todos los puntos del plano que equidistan de un punto fijo llamado foco y de una recta fija llamada directriz. Esta definición geométrica se traduce en la ecuación canónica x² = 4py (parábola vertical con vértice en el origen), donde p es la distancia del vértice al foco y también del vértice a la directriz. El foco está en (0, p) y la directriz es la recta y = −p. Esta ecuación conecta la geometría del lugar geométrico con la propiedad óptica fundamental de la parábola.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ecuaciones canónicas de la parábola",
        },
        {
          tipo: "lista",
          items: [
            "Parábola vertical, vértice en origen: x² = 4py. Foco (0, p), directriz y = −p. Abre hacia arriba si p > 0.",
            "Parábola horizontal, vértice en origen: y² = 4px. Foco (p, 0), directriz x = −p. Abre a la derecha si p > 0.",
            "Parábola vertical, vértice en (h, k): (x − h)² = 4p(y − k). Foco en (h, k + p).",
            "Parábola horizontal, vértice en (h, k): (y − k)² = 4p(x − h). Foco en (h + p, k).",
            "Relación con la forma f(x) = ax²: comparando x² = 4py con y = ax², se obtiene a = 1/(4p), es decir p = 1/(4a).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La propiedad del foco y sus aplicaciones tecnológicas",
        },
        {
          tipo: "parrafo",
          contenido:
            "La propiedad óptica de la parábola es: todo rayo paralelo al eje de simetría se refleja hacia el foco. Esta propiedad, combinada con la ecuación canónica, permite diseñar antenas parabólicas con precisión. Ejemplo: una antena parabólica tiene diámetro 2.4 m y profundidad 0.45 m. El vértice está en el origen y la parábola sigue x² = 4py. El extremo de la parábola es el punto (1.2, 0.45). Sustituyendo: 1.2² = 4p(0.45), es decir 1.44 = 1.8p, entonces p = 0.8 m. El receptor (LNB) debe colocarse a 0.8 m del vértice, en el foco (0, 0.8).",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La parábola es simultáneamente una curva algebraica (y = ax²), una sección cónica (intersección de un cono con un plano paralelo a la generatriz) y un lugar geométrico (puntos equidistantes del foco y la directriz). Estas tres descripciones son completamente equivalentes. El valor p = 1/(4a) conecta la forma algebraica con la geométrica. Comprender esta triple naturaleza de la parábola es una de las ideas más ricas del bachillerato de matemáticas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Parábola con foco F, directriz d, vértice V y un punto P de la curva, mostrando que la distancia de P al foco es igual a la distancia de P a la directriz",
          caption: "La parábola es el lugar geométrico donde la distancia al foco y a la directriz son iguales para todo punto de la curva.",
        },
      ],
    },
  },

  // ── 18 ── Historia matemática ──────────────────────────────────────────────
  {
    slug: "pm-iv-historia-trigonometria-arabia",
    titulo: "El origen árabe de la trigonometría: Al-Battani y Al-Juarismi",
    categoria: "Historia matemática",
    conceptos_clave: ["Al-Battani", "Al-Juarismi", "matemáticas árabes", "seno", "álgebra", "Casa de la Sabiduría"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La trigonometría tal como la conocemos hoy —con las funciones seno, coseno y tangente definidas para cualquier ángulo, con tablas trigonométricas y con aplicaciones en astronomía y cartografía— es en gran medida una creación del mundo árabe-islámico de los siglos VIII al XII. Mientras Europa vivía la Edad Media temprana con poco desarrollo científico, la Casa de la Sabiduría en Bagdad concentraba a los mejores matemáticos, astrónomos y traductores del mundo, que sintetizaron y superaron el conocimiento griego, indio y persa.",
        },
        {
          tipo: "subtitulo",
          contenido: "Al-Battani: el astrónomo que perfeccionó el seno",
        },
        {
          tipo: "parrafo",
          contenido:
            "Muhammad ibn Jabir Al-Battani (858-929 d.C.), conocido en Europa medieval como Albategnius, fue uno de los mayores astrónomos y matemáticos del mundo árabe. Introdujo el uso del seno (jiba en árabe) en lugar de la cuerda de Ptolomeo para el cálculo astronómico, estableciendo la función trigonométrica en la forma que usamos hoy. Calculó tablas de seno y coseno con gran precisión, midió la oblicuidad de la eclíptica como 23° 35' (casi exacta al valor moderno de 23° 27'), y calculó la longitud del año solar como 365 días, 5 horas, 46 minutos y 24 segundos, con un error de solo 2 minutos y 22 segundos respecto al valor actual.",
        },
        {
          tipo: "subtitulo",
          contenido: "Al-Juarismi y el álgebra: la herramienta de la trigonometría",
        },
        {
          tipo: "lista",
          items: [
            "Muhammad ibn Musa Al-Juarismi (c. 780-850 d.C.) escribió Al-kitab al-mukhtasar fi hisab al-jabr wal-muqabala: el libro que dio nombre al álgebra.",
            "Su nombre latinizado, 'Algoritmi', dio origen a la palabra 'algoritmo'.",
            "Al-Juarismi desarrolló métodos sistemáticos para resolver ecuaciones lineales y cuadráticas, con y sin notación algebraica.",
            "Sus tablas de seno, coseno y tangente, adaptadas del sistema indio, fueron la referencia astronómica de Europa medieval durante siglos.",
            "Introdujo en Europa el sistema de numeración posicional indo-arábigo (los 'números árabes' que usamos hoy).",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La palabra 'seno' tiene una historia de traducción fascinante. En sánscrito, la cuerda del ángulo se llamaba jya-ardha. Los árabes la transliteraron como jiba, que en árabe no tenía significado. Cuando los traductores europeos medievales, al traducir del árabe al latín, encontraron la palabra jiba sin sentido, la leyeron como jaib (que significa 'seno de la camisa', 'bolsillo'). Tradujeron jaib al latín como sinus (que significa 'curva, pecho, bahía'). De sinus viene nuestra palabra 'seno'. Un error de traducción quedó fijado para siempre en el nombre de una función matemática.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Retrato de Al-Battani con una esfera armilar, junto a una página de manuscrito árabe con tablas trigonométricas y la ecuación al-jabr que da nombre al álgebra",
          caption: "Al-Battani y Al-Juarismi transformaron el conocimiento griego en la trigonometría y el álgebra que usamos hoy.",
        },
      ],
    },
  },

  // ── 19 ── Historia matemática ──────────────────────────────────────────────
  {
    slug: "pm-iv-matematicas-astronomia-azteca",
    titulo: "Matemáticas y astronomía azteca: el Calendario y los ángulos solares",
    categoria: "Historia matemática",
    conceptos_clave: ["calendario azteca", "Tonalpohualli", "Xiuhpohualli", "ángulos solares", "Piedra del Sol", "astronomía mexica"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los aztecas (mexicas) desarrollaron un sistema astronómico-matemático de notable precisión que integraba el calendario, la arquitectura y la cosmovisión religiosa. La Piedra del Sol, esculpida hacia 1479 d.C. y hoy en el Museo Nacional de Antropología de la Ciudad de México, no es simplemente un 'calendario': es una representación simbólica del sistema cosmológico mexica que requirió de observaciones astronómicas sistemáticas durante generaciones y de cálculos matemáticos que involucran lo que hoy llamamos trigonometría y geometría circular.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los dos calendarios aztecas: ciclos y cálculos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los aztecas usaban simultáneamente dos calendarios. El Tonalpohualli era el calendario ritual de 260 días: 20 trecenas (períodos de 13 días) × 20 signos = 260 días. El Xiuhpohualli era el calendario solar de 365 días: 18 meses de 20 días + 5 días nemontemi (nefastos) = 365 días. El ciclo combinado (el Xiuhpohualli o 'atadura de años') duraba 52 × 365 = 18 980 días, el mínimo común múltiplo de 260 y 365, pues MCM(260, 365) = MCM(4×5×13, 5×73) = 5×4×13×73 = 18 980. Después de 18 980 días (52 años solares = 73 ciclos rituales), los calendarios se sincronizaban exactamente: una señal de que el mundo continuaría.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ángulos solares y arquitectura mexica",
        },
        {
          tipo: "lista",
          items: [
            "El Templo Mayor de Tenochtitlan estaba orientado para que el sol naciera exactamente entre sus dos templos superiores en los equinoccios (marzo y septiembre).",
            "El ángulo azimutal del sol al amanecer del equinoccio de primavera es exactamente 90° (este puro), lo que los mexicas usaron como referencia de orientación.",
            "La latitud de Tenochtitlan (19.4° N) determina que el sol alcanza su cénit (directamente arriba, ángulo de elevación = 90°) exactamente dos veces al año, en mayo y julio.",
            "El paso del sol por el cénit era crucial: en ese instante, una vara vertical (gnomon) no proyecta sombra. Los mexicas lo llamaban 'el sol sin sombra' y lo usaban para fijar el calendario agrícola.",
            "Las sombras del Templo Mayor se calculaban para los días rituales más importantes: los sacerdotes astronómicos debían predecir la longitud de las sombras para cada fiesta.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El paso cenital del sol en Tenochtitlan (19.4° N) ocurría cuando el ángulo de elevación solar al mediodía era máximo: el sol estaba directamente en el cénit. Si la latitud φ es la de Tenochtitlan y la declinación solar δ es igual a φ (lo que ocurre cuando el sol pasa por el cénit), la elevación del sol al mediodía es 90° − |φ − δ| = 90°. Esto requería que los sacerdotes-astrónomos conocieran que la declinación solar varía entre −23.5° (solsticio de diciembre) y +23.5° (solsticio de junio), y supieran interpollar la fecha de paso por el cénit. Esta es trigonometría esférica en la práctica.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "La Piedra del Sol azteca con sus cuatro soles cosmológicos y el sol central Tonatiuh, junto a un diagrama del amanecer equinoccial entre los dos templos del Templo Mayor",
          caption: "La arquitectura azteca integraba orientaciones astronómicas precisas: el Templo Mayor estaba alineado con el sol del equinoccio.",
        },
        {
          tipo: "cita",
          contenido:
            "En el quinto sol, el sol se mueve: hay movimiento de la tierra, hay hambre y con esto perecemos.",
          fuente: "Leyenda de los Soles, texto náhuatl del siglo XVI, sobre la cosmología mexica de los cinco soles",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaPMIV(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca PM-IV (19 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "PM-IV")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC PM-IV no encontrada. Ejecuta primero seed-mccems.ts y seed-pmiv.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_PMIV.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas PM-IV: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de PM-IV insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca PM-IV completado.\n");
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
  seedBibliotecaPMIV(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}
