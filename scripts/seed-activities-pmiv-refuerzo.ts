/**
 * Refuerzo de actividades para PM-IV (Pensamiento Matemático IV — funciones,
 * trigonometría, geometría analítica y cónicas) según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 7 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 7 progresiones × 4 = 28 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial PM-IV (MCCEMS 2025): funciones, polinomiales de grado 1 y 2,
 * razones trigonométricas, círculo unitario, Ley de Senos y Cosenos, geometría analítica, cónicas.
 * Uso: npx tsx scripts/seed-activities-pmiv-refuerzo.ts
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
  log("\n🌱 Refuerzo PM-IV — Pensamiento Matemático IV: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "PM-IV");
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

  log(`\n✅ PM-IV refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Concepto de función y sus representaciones ════════════
  [
    {
      titulo: "Verdadero o Falso — Concepto de función",
      descripcion: "Decide si cada afirmación sobre el concepto de función, dominio, codominio y sus representaciones (tabular, gráfica, algebraica, verbal) es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Una función es una relación donde a cada elemento del dominio le corresponde exactamente un elemento del codominio.",
            respuesta: true,
            retroalimentacion: "Correcto. Esa es la definición formal de función: unicidad en la asignación de cada elemento del dominio.",
          },
          {
            enunciado: "La relación {(1,2), (1,3), (2,4)} es una función porque cada par ordenado tiene dos componentes.",
            respuesta: false,
            retroalimentacion: "Falso. El elemento 1 del dominio está asociado con dos valores (2 y 3), lo que viola la definición de función.",
          },
          {
            enunciado: "La prueba de la línea vertical permite determinar gráficamente si una curva representa una función: si ninguna línea vertical toca la curva más de una vez, es función.",
            respuesta: true,
            retroalimentacion: "Correcto. La prueba de la línea vertical verifica que cada valor de x tenga exactamente un valor de y.",
          },
          {
            enunciado: "Para la función f(x) = x² definida en todos los reales, el dominio es ℝ y el rango es también ℝ.",
            respuesta: false,
            retroalimentacion: "Falso. El dominio de f(x) = x² es ℝ, pero el rango es [0, +∞) porque x² ≥ 0 para todo x real.",
          },
          {
            enunciado: "Una tabla de valores puede representar una función si en la columna x no se repite ningún valor.",
            respuesta: true,
            retroalimentacion: "Correcto. En una representación tabular, si cada valor de x aparece exactamente una vez, la relación es una función.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Concepto de función",
      descripcion: "Glosario interactivo de los conceptos fundamentales de función: dominio, codominio, rango y representaciones.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Función",
            definicion: "Relación entre dos conjuntos (dominio y codominio) que asigna a cada elemento del dominio exactamente un elemento del codominio.",
            ejemplo: "f: ℝ → ℝ, f(x) = 2x + 1 es una función. A cada x ∈ ℝ le corresponde un único y = 2x + 1.",
            etiquetas: ["definición", "función"],
          },
          {
            termino: "Dominio",
            definicion: "Conjunto de todos los valores de entrada (x) para los cuales la función está definida.",
            ejemplo: "Para f(x) = √x, el dominio es [0, +∞) porque la raíz de un número negativo no es real.",
            etiquetas: ["dominio", "conjunto"],
          },
          {
            termino: "Codominio y rango (imagen)",
            definicion: "El codominio es el conjunto de posibles salidas. El rango (o imagen) es el conjunto de valores que la función realmente toma.",
            ejemplo: "f(x) = x², codominio = ℝ, rango = [0, +∞). No todos los reales son alcanzados.",
            etiquetas: ["codominio", "rango", "imagen"],
          },
          {
            termino: "Representación tabular",
            definicion: "Tabla de pares (x, f(x)) que muestra correspondencias concretas entre entradas y salidas de la función.",
            ejemplo: "x: 0, 1, 2, 3 → f(x) = x²: 0, 1, 4, 9.",
            etiquetas: ["representación", "tabla"],
          },
          {
            termino: "Representación gráfica",
            definicion: "Conjunto de puntos (x, f(x)) graficados en el plano cartesiano. Se verifica con la prueba de la línea vertical.",
            ejemplo: "La parábola y = x² pasa la prueba de la línea vertical: es función.",
            etiquetas: ["gráfica", "plano cartesiano"],
          },
          {
            termino: "Notación f(x) y evaluación",
            definicion: "f(x) denota el valor de la función en x. Evaluar f(a) significa sustituir x = a en la expresión algebraica.",
            ejemplo: "Si f(x) = 3x − 2, entonces f(4) = 3(4) − 2 = 10.",
            etiquetas: ["notación", "evaluación"],
          },
        ],
        actividad_final: "Dada la función f(x) = 2x² − 3, determina: (a) f(0), (b) f(−1), (c) f(3). Luego construye una tabla con x ∈ {−2, −1, 0, 1, 2} y esboza su gráfica.",
      },
    },
    {
      titulo: "Completa los espacios — Funciones y sus representaciones",
      descripcion: "Completa los conceptos clave sobre el concepto de función, dominio, rango y evaluación.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o valor correcto.",
        texto_con_huecos: "Una función asigna a cada elemento del ___ exactamente un elemento del codominio. La prueba de la línea ___ determina gráficamente si una curva es función. Para f(x) = x² + 1, el valor f(3) = ___. El rango de f(x) = x² sobre ℝ es el intervalo [___, +∞).",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "dominio",
            alternativas_aceptadas: [],
            pista: "El conjunto de valores de entrada de una función se llama ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "vertical",
            alternativas_aceptadas: [],
            pista: "Prueba de la línea ___ : si corta la curva en más de un punto, no es función.",
          },
          {
            posicion: 2,
            respuesta_correcta: "10",
            alternativas_aceptadas: [],
            pista: "f(3) = (3)² + 1 = 9 + 1 = ?",
          },
          {
            posicion: 3,
            respuesta_correcta: "0",
            alternativas_aceptadas: [],
            pista: "x² ≥ 0 para todo x ∈ ℝ; el mínimo valor es x² = 0 cuando x = 0.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Concepto de función",
      descripcion: "Reflexiona sobre tu comprensión del concepto de función y sus cuatro representaciones.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esto te ayudará a identificar qué reforzar.",
        criterios: [
          { descripcion: "Enuncio la definición de función y la distingo de una relación que no lo es.", escala: escala4 },
          { descripcion: "Identifico dominio y rango de una función dada algebraica o gráficamente.", escala: escala4 },
          { descripcion: "Represento una función en sus formas tabular, gráfica, algebraica y verbal.", escala: escala4 },
          { descripcion: "Evalúo f(a) sustituyendo valores y aplico la prueba de la línea vertical.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Puedes pensar en una situación de la vida cotidiana que pueda modelarse con una función? Describe la variable de entrada, la variable de salida y la regla de correspondencia.",
      },
    },
  ],

  // ════════════ P02 — Funciones polinomiales de primer y segundo grado ════════════
  [
    {
      titulo: "Verdadero o Falso — Funciones lineales y cuadráticas",
      descripcion: "Decide si cada afirmación sobre las funciones polinomiales de primer grado (lineales) y segundo grado (cuadráticas) y sus transformaciones es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La función f(x) = 3x − 5 es de primer grado; su gráfica es una recta con pendiente 3 e intercepto −5.",
            respuesta: true,
            retroalimentacion: "Correcto. En f(x) = mx + b, m = 3 es la pendiente y b = −5 es el intercepto en y.",
          },
          {
            enunciado: "La transformación g(x) = f(x) + k desplaza la gráfica de f(x) horizontalmente k unidades.",
            respuesta: false,
            retroalimentacion: "Falso. g(x) = f(x) + k desplaza la gráfica verticalmente k unidades. El desplazamiento horizontal corresponde a g(x) = f(x − h).",
          },
          {
            enunciado: "Para la función cuadrática f(x) = −2x² + 4x − 1, la parábola abre hacia abajo porque el coeficiente de x² es negativo.",
            respuesta: true,
            retroalimentacion: "Correcto. Si a < 0 en ax² + bx + c, la parábola abre hacia abajo y tiene un máximo.",
          },
          {
            enunciado: "La función f(x) = (x − 3)² + 2 tiene su vértice en (3, 2) y la parábola abre hacia arriba.",
            respuesta: true,
            retroalimentacion: "Correcto. En la forma vertex f(x) = a(x − h)² + k, el vértice es (h, k) = (3, 2) y con a = 1 > 0 abre hacia arriba.",
          },
          {
            enunciado: "La pendiente de la recta que pasa por los puntos (2, 5) y (6, 13) es m = 3.",
            respuesta: false,
            retroalimentacion: "Falso: m = (13 − 5)/(6 − 2) = 8/4 = 2. La pendiente es 2, no 3.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Funciones lineales y cuadráticas",
      descripcion: "Glosario interactivo sobre las funciones polinomiales de primer y segundo grado y sus transformaciones geométricas.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Función lineal (primer grado)",
            definicion: "Función de la forma f(x) = mx + b donde m ≠ 0. Su gráfica es una recta con pendiente m e intercepto b en el eje y.",
            ejemplo: "f(x) = 2x − 3: pendiente m = 2, intercepto b = −3. Pasa por (0, −3) y (1.5, 0).",
            etiquetas: ["lineal", "recta", "primer grado"],
          },
          {
            termino: "Pendiente de una recta",
            definicion: "Razón de cambio m = (y₂ − y₁)/(x₂ − x₁). Indica la inclinación y dirección de la recta.",
            ejemplo: "Entre (1, 3) y (4, 9): m = (9−3)/(4−1) = 6/3 = 2.",
            etiquetas: ["pendiente", "razón de cambio"],
          },
          {
            termino: "Función cuadrática (segundo grado)",
            definicion: "Función de la forma f(x) = ax² + bx + c (a ≠ 0). Su gráfica es una parábola que abre hacia arriba (a > 0) o hacia abajo (a < 0).",
            ejemplo: "f(x) = x² − 4x + 3: parábola con a = 1 > 0, vértice en (2, −1).",
            etiquetas: ["cuadrática", "parábola", "segundo grado"],
          },
          {
            termino: "Forma vértice de la parábola",
            definicion: "f(x) = a(x − h)² + k, donde (h, k) es el vértice. Facilita identificar transformaciones: desplazamientos y reflexiones.",
            ejemplo: "f(x) = 2(x − 1)² − 3: vértice (1, −3), abre hacia arriba, desplazada 1 unidad a la derecha y 3 hacia abajo.",
            etiquetas: ["forma vértice", "transformaciones"],
          },
          {
            termino: "Desplazamiento vertical y horizontal",
            definicion: "g(x) = f(x) + k desplaza f verticalmente k unidades. g(x) = f(x − h) desplaza f horizontalmente h unidades (hacia la derecha si h > 0).",
            ejemplo: "g(x) = x² + 3 desplaza y = x² tres unidades hacia arriba.",
            etiquetas: ["transformación", "desplazamiento"],
          },
          {
            termino: "Reflexión y dilatación",
            definicion: "g(x) = −f(x) refleja la gráfica respecto al eje x. g(x) = af(x) estira (|a| > 1) o comprime (|a| < 1) verticalmente.",
            ejemplo: "g(x) = −x² refleja y = x² en el eje x, convirtiendo el mínimo en máximo.",
            etiquetas: ["reflexión", "dilatación", "transformación"],
          },
        ],
        actividad_final: "Para f(x) = x² − 4x + 3 convierte a forma vértice y determina: (a) vértice, (b) apertura, (c) ceros. Luego describe las transformaciones respecto a y = x².",
      },
    },
    {
      titulo: "Completa los espacios — Funciones de primer y segundo grado",
      descripcion: "Completa los datos clave de funciones lineales y cuadráticas: pendiente, vértice y transformaciones.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el valor o término correcto.",
        texto_con_huecos: "Para f(x) = 3x + 7, la pendiente es ___ y el intercepto en y es 7. La función g(x) = f(x) + k realiza un desplazamiento ___ . Para f(x) = (x − 2)² + 5, el vértice de la parábola es (2, ___). Si a < 0 en f(x) = ax² + bx + c, la parábola abre hacia ___ .",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "3",
            alternativas_aceptadas: [],
            pista: "En f(x) = mx + b, m es la pendiente. Aquí f(x) = 3x + 7, entonces m = ?",
          },
          {
            posicion: 1,
            respuesta_correcta: "vertical",
            alternativas_aceptadas: [],
            pista: "g(x) = f(x) + k mueve la gráfica en la dirección del eje y: desplazamiento ___ .",
          },
          {
            posicion: 2,
            respuesta_correcta: "5",
            alternativas_aceptadas: [],
            pista: "En f(x) = a(x − h)² + k, el vértice es (h, k). Aquí h = 2 y k = ?",
          },
          {
            posicion: 3,
            respuesta_correcta: "abajo",
            alternativas_aceptadas: ["hacia abajo"],
            pista: "Si el coeficiente de x² es negativo (a < 0), la parábola abre hacia ___ .",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Funciones polinomiales de primer y segundo grado",
      descripcion: "Reflexiona sobre tu comprensión de las funciones lineales, cuadráticas y sus transformaciones geométricas.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico y grafico funciones lineales f(x) = mx + b, calculando pendiente e intercepto.", escala: escala4 },
          { descripcion: "Determino el vértice, la apertura y los ceros de una función cuadrática f(x) = ax² + bx + c.", escala: escala4 },
          { descripcion: "Convierto entre la forma estándar y la forma vértice de una función cuadrática.", escala: escala4 },
          { descripcion: "Describo e identifico transformaciones (desplazamiento, reflexión, dilatación) en gráficas de funciones.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué diferencia fundamental hay entre la gráfica de una función lineal y una cuadrática? ¿Puedes dar un ejemplo de cada una en un contexto real?",
      },
    },
  ],

  // ════════════ P03 — Razones trigonométricas en triángulos rectángulos ════════════
  [
    {
      titulo: "Verdadero o Falso — Razones trigonométricas en el triángulo rectángulo",
      descripcion: "Decide si cada afirmación sobre seno, coseno, tangente y sus aplicaciones en triángulos rectángulos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "En un triángulo rectángulo, el seno de un ángulo agudo θ se define como sen(θ) = cateto opuesto / hipotenusa.",
            respuesta: true,
            retroalimentacion: "Correcto. La razón trigonométrica seno se define como la relación entre el cateto opuesto al ángulo y la hipotenusa.",
          },
          {
            enunciado: "Para un ángulo de 30°, el coseno vale cos(30°) = √3/2 y el seno vale sen(30°) = 1/2.",
            respuesta: true,
            retroalimentacion: "Correcto. En el triángulo 30-60-90°: sen(30°) = 1/2 y cos(30°) = √3/2. Son valores exactos fundamentales.",
          },
          {
            enunciado: "La tangente de un ángulo θ se puede calcular como tan(θ) = sen(θ) × cos(θ).",
            respuesta: false,
            retroalimentacion: "Falso. La tangente es tan(θ) = sen(θ)/cos(θ) = cateto opuesto/cateto adyacente. No es el producto sino el cociente.",
          },
          {
            enunciado: "Si en un triángulo rectángulo el cateto opuesto a θ mide 6 y la hipotenusa mide 10, entonces sen(θ) = 0.6.",
            respuesta: true,
            retroalimentacion: "Correcto: sen(θ) = 6/10 = 0.6.",
          },
          {
            enunciado: "La identidad pitagórica fundamental de la trigonometría establece que sen²(θ) − cos²(θ) = 1.",
            respuesta: false,
            retroalimentacion: "Falso. La identidad pitagórica es sen²(θ) + cos²(θ) = 1 (suma, no resta).",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Razones trigonométricas",
      descripcion: "Glosario interactivo de las razones trigonométricas básicas (seno, coseno, tangente) y sus aplicaciones en medición indirecta.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Seno (sen θ)",
            definicion: "Razón entre el cateto opuesto al ángulo θ y la hipotenusa del triángulo rectángulo: sen(θ) = opuesto/hipotenusa.",
            ejemplo: "En un △ rectángulo con θ = 30°, cateto opuesto = 5 e hipotenusa = 10: sen(30°) = 5/10 = 0.5.",
            etiquetas: ["seno", "trigonometría"],
          },
          {
            termino: "Coseno (cos θ)",
            definicion: "Razón entre el cateto adyacente al ángulo θ y la hipotenusa: cos(θ) = adyacente/hipotenusa.",
            ejemplo: "En el mismo △ con θ = 30°, cateto adyacente = 5√3: cos(30°) = 5√3/10 = √3/2 ≈ 0.866.",
            etiquetas: ["coseno", "trigonometría"],
          },
          {
            termino: "Tangente (tan θ)",
            definicion: "Razón entre el cateto opuesto y el cateto adyacente: tan(θ) = opuesto/adyacente = sen(θ)/cos(θ).",
            ejemplo: "tan(45°) = 1 porque el cateto opuesto y el adyacente son iguales en un triángulo isósceles rectángulo.",
            etiquetas: ["tangente", "trigonometría"],
          },
          {
            termino: "Ángulos notables: 30°, 45°, 60°",
            definicion: "Valores exactos: sen(30°)=1/2, cos(30°)=√3/2, tan(30°)=1/√3; sen(45°)=cos(45°)=√2/2, tan(45°)=1; sen(60°)=√3/2, cos(60°)=1/2, tan(60°)=√3.",
            ejemplo: "Para calcular la altura de un árbol con ángulo de elevación 60° a 10 m: altura = 10·tan(60°) = 10√3 ≈ 17.3 m.",
            etiquetas: ["ángulos notables", "valores exactos"],
          },
          {
            termino: "Identidad pitagórica trigonométrica",
            definicion: "sen²(θ) + cos²(θ) = 1 para todo ángulo θ. Se deriva directamente del Teorema de Pitágoras aplicado al triángulo rectángulo unitario.",
            ejemplo: "sen(30°) = 1/2, cos(30°) = √3/2: (1/2)² + (√3/2)² = 1/4 + 3/4 = 1. ✓",
            etiquetas: ["identidad", "pitágoras", "trigonometría"],
          },
          {
            termino: "Medición indirecta",
            definicion: "Técnica que usa razones trigonométricas para calcular distancias o alturas inaccesibles mediante ángulos de elevación o depresión.",
            ejemplo: "Ángulo de elevación 45° a distancia horizontal 50 m: altura = 50·tan(45°) = 50·1 = 50 m.",
            etiquetas: ["aplicación", "medición indirecta"],
          },
        ],
        actividad_final: "Desde un punto a 20 m de la base de un edificio, el ángulo de elevación a la cima es 60°. Calcula la altura del edificio usando tan(60°) = √3.",
      },
    },
    {
      titulo: "Completa los espacios — Razones trigonométricas",
      descripcion: "Completa los valores y definiciones de las razones trigonométricas en el triángulo rectángulo.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el valor o término correcto.",
        texto_con_huecos: "El seno de un ángulo θ se define como el cociente entre el cateto ___ y la hipotenusa. Para θ = 30°, sen(30°) = ___. La identidad trigonométrica fundamental es sen²(θ) + cos²(θ) = ___. Si el cateto opuesto mide 8 y la hipotenusa mide 17, entonces sen(θ) = ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "opuesto",
            alternativas_aceptadas: [],
            pista: "sen(θ) = lado ___ al ángulo θ / hipotenusa.",
          },
          {
            posicion: 1,
            respuesta_correcta: "1/2",
            alternativas_aceptadas: ["0.5", "0,5"],
            pista: "En el triángulo 30-60-90°, sen(30°) = cateto opuesto/hipotenusa = 1/2.",
          },
          {
            posicion: 2,
            respuesta_correcta: "1",
            alternativas_aceptadas: [],
            pista: "La suma sen²(θ) + cos²(θ) siempre vale ___ (proviene del Teorema de Pitágoras).",
          },
          {
            posicion: 3,
            respuesta_correcta: "8/17",
            alternativas_aceptadas: ["0.47"],
            pista: "sen(θ) = cateto opuesto / hipotenusa = 8 / 17.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Razones trigonométricas en el triángulo rectángulo",
      descripcion: "Reflexiona sobre tu dominio del seno, coseno y tangente y su aplicación en medición indirecta.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Defino y calculo sen(θ), cos(θ) y tan(θ) a partir de los lados del triángulo rectángulo.", escala: escala4 },
          { descripcion: "Recuerdo y uso los valores exactos de las razones trigonométricas para 30°, 45° y 60°.", escala: escala4 },
          { descripcion: "Aplico la identidad sen²(θ) + cos²(θ) = 1 para obtener razones desconocidas.", escala: escala4 },
          { descripcion: "Resuelvo problemas de medición indirecta (altura, distancia) usando ángulos de elevación o depresión.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cómo usarías las razones trigonométricas para medir la altura de un edificio sin subir a él? Describe el procedimiento paso a paso.",
      },
    },
  ],

  // ════════════ P04 — Razones trigonométricas en el círculo unitario ════════════
  [
    {
      titulo: "Verdadero o Falso — Trigonometría en el círculo unitario",
      descripcion: "Decide si cada afirmación sobre las razones trigonométricas en el círculo unitario, sus signos por cuadrante y los ángulos de referencia es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "En el círculo unitario (radio = 1), el coseno de un ángulo θ corresponde a la coordenada x del punto en la circunferencia.",
            respuesta: true,
            retroalimentacion: "Correcto. En el círculo unitario, el punto (cos θ, sen θ) representa el ángulo θ, por lo que la coordenada x es cos θ.",
          },
          {
            enunciado: "En el segundo cuadrante (90° < θ < 180°), tanto el seno como el coseno son positivos.",
            respuesta: false,
            retroalimentacion: "Falso. En el segundo cuadrante, sen(θ) > 0 pero cos(θ) < 0 (la coordenada x es negativa).",
          },
          {
            enunciado: "sen(150°) = sen(30°) = 1/2 porque 150° y 30° son suplementarios y comparten el mismo ángulo de referencia.",
            respuesta: true,
            retroalimentacion: "Correcto. El ángulo de referencia de 150° es 30°. En el segundo cuadrante el seno es positivo, así que sen(150°) = sen(30°) = 1/2.",
          },
          {
            enunciado: "cos(270°) = 0 porque en el eje y negativo la coordenada x del punto del círculo unitario es 0.",
            respuesta: true,
            retroalimentacion: "Correcto. El punto correspondiente a 270° en el círculo unitario es (0, −1), por lo que cos(270°) = 0.",
          },
          {
            enunciado: "La función seno tiene período 90°, es decir, se repite cada 90°.",
            respuesta: false,
            retroalimentacion: "Falso. La función seno (y coseno) tiene período 360° (o 2π radianes). Se necesita una vuelta completa para repetirse.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Círculo unitario y trigonometría extendida",
      descripcion: "Glosario interactivo sobre el círculo unitario, ángulos en posición estándar, cuadrantes y valores trigonométricos extendidos.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Círculo unitario",
            definicion: "Circunferencia de radio 1 centrada en el origen del plano cartesiano. Cada punto de la circunferencia es (cos θ, sen θ) para un ángulo θ.",
            ejemplo: "Para θ = 0°: punto (1, 0). Para θ = 90°: punto (0, 1). Para θ = 180°: punto (−1, 0).",
            etiquetas: ["círculo unitario", "trigonometría"],
          },
          {
            termino: "Ángulo en posición estándar",
            definicion: "Ángulo con vértice en el origen y lado inicial sobre el eje x positivo. Se mide en sentido antihorario (positivo) o horario (negativo).",
            ejemplo: "Un ángulo de 120° está en posición estándar con lado terminal en el segundo cuadrante.",
            etiquetas: ["ángulo estándar", "medición"],
          },
          {
            termino: "Signo por cuadrante (regla ACTS)",
            definicion: "Cuadrante I: todas positivas. Cuadrante II: solo seno (+). Cuadrante III: solo tangente (+). Cuadrante IV: solo coseno (+). Regla mnemotécnica: 'Todos Saben Tomar Café'.",
            ejemplo: "cos(210°) < 0 porque 210° está en el tercer cuadrante (solo tangente es positiva).",
            etiquetas: ["signos", "cuadrantes"],
          },
          {
            termino: "Ángulo de referencia",
            definicion: "Ángulo agudo (0° a 90°) formado entre el lado terminal del ángulo y el eje x más cercano. Permite calcular razones trigonométricas de cualquier ángulo.",
            ejemplo: "Ángulo de referencia de 150°: 180° − 150° = 30°. Ángulo de referencia de 225°: 225° − 180° = 45°.",
            etiquetas: ["ángulo de referencia", "cálculo"],
          },
          {
            termino: "Valores en los ejes (ángulos cuadrantales)",
            definicion: "Para 0°, 90°, 180°, 270°, 360°: los puntos del círculo unitario dan valores exactos sin necesidad de ángulo de referencia.",
            ejemplo: "0°→(1,0): cos=1,sen=0. 90°→(0,1): cos=0,sen=1. 180°→(−1,0). 270°→(0,−1).",
            etiquetas: ["ángulos cuadrantales", "valores exactos"],
          },
          {
            termino: "Período de seno y coseno",
            definicion: "Las funciones seno y coseno son periódicas con período 360° (2π rad): sen(θ + 360°) = sen(θ) y cos(θ + 360°) = cos(θ).",
            ejemplo: "sen(390°) = sen(390° − 360°) = sen(30°) = 1/2.",
            etiquetas: ["período", "función periódica"],
          },
        ],
        actividad_final: "Determina el valor exacto de: (a) sen(210°), (b) cos(330°), (c) tan(135°). Indica el cuadrante y el ángulo de referencia para cada uno.",
      },
    },
    {
      titulo: "Completa los espacios — Círculo unitario",
      descripcion: "Completa los valores trigonométricos y conceptos del círculo unitario.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el valor o término correcto.",
        texto_con_huecos: "En el círculo unitario, el punto correspondiente a θ = 90° es (0, ___). El seno es ___ en el segundo cuadrante. El ángulo de referencia de 210° es ___°. El período de la función coseno es ___°.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "1",
            alternativas_aceptadas: [],
            pista: "El punto en θ = 90° es (cos 90°, sen 90°) = (0, ?).",
          },
          {
            posicion: 1,
            respuesta_correcta: "positivo",
            alternativas_aceptadas: ["positiva"],
            pista: "En el segundo cuadrante la coordenada y (= seno) es ___ .",
          },
          {
            posicion: 2,
            respuesta_correcta: "30",
            alternativas_aceptadas: [],
            pista: "210° está en el tercer cuadrante. Ángulo de referencia = 210° − 180° = ?°",
          },
          {
            posicion: 3,
            respuesta_correcta: "360",
            alternativas_aceptadas: [],
            pista: "Las funciones seno y coseno se repiten cada ___ ° (una vuelta completa).",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Trigonometría en el círculo unitario",
      descripcion: "Reflexiona sobre tu comprensión de las razones trigonométricas extendidas al círculo unitario y los ángulos de cualquier magnitud.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Ubico ángulos en posición estándar e identifico el cuadrante donde se encuentra su lado terminal.", escala: escala4 },
          { descripcion: "Determino el ángulo de referencia de cualquier ángulo y lo uso para calcular las razones trigonométricas.", escala: escala4 },
          { descripcion: "Identifico el signo de sen, cos y tan en cada cuadrante usando la regla ACTS o equivalente.", escala: escala4 },
          { descripcion: "Calculo valores exactos de razones trigonométricas para ángulos notables (0°, 30°, 45°, 60°, 90°, 180°, 270°, 360°).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué el círculo unitario es una herramienta más poderosa que la definición de razones trigonométricas solo en el triángulo rectángulo? Explica qué permite hacer que la definición original no permitía.",
      },
    },
  ],

  // ════════════ P05 — Ley de Senos y Ley de Cosenos ════════════
  [
    {
      titulo: "Verdadero o Falso — Ley de Senos y Ley de Cosenos",
      descripcion: "Decide si cada afirmación sobre la Ley de Senos, la Ley de Cosenos y su aplicación en triángulos oblicuángulos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La Ley de Senos establece que en cualquier triángulo, a/sen(A) = b/sen(B) = c/sen(C).",
            respuesta: true,
            retroalimentacion: "Correcto. La Ley de Senos relaciona cada lado con el seno del ángulo opuesto a él.",
          },
          {
            enunciado: "La Ley de Cosenos se puede usar cuando se conocen dos lados y el ángulo comprendido entre ellos (caso LAL).",
            respuesta: true,
            retroalimentacion: "Correcto. El caso LAL (dos lados y el ángulo entre ellos) es uno de los casos en que se aplica la Ley de Cosenos: c² = a² + b² − 2ab·cos(C).",
          },
          {
            enunciado: "La Ley de Senos solo es válida para triángulos rectángulos.",
            respuesta: false,
            retroalimentacion: "Falso. La Ley de Senos es válida para cualquier triángulo (rectángulo, acutángulo u obtusángulo).",
          },
          {
            enunciado: "En un triángulo con a = 7, b = 5 y C = 90°, la Ley de Cosenos se reduce al Teorema de Pitágoras: c² = a² + b².",
            respuesta: true,
            retroalimentacion: "Correcto: c² = a² + b² − 2ab·cos(90°) = a² + b² − 0 = a² + b². La Ley de Cosenos generaliza el Teorema de Pitágoras.",
          },
          {
            enunciado: "Para resolver un triángulo con los datos AAL (dos ángulos y un lado), se usa la Ley de Cosenos.",
            respuesta: false,
            retroalimentacion: "Falso. El caso AAL se resuelve con la Ley de Senos, no con la Ley de Cosenos.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Ley de Senos y Ley de Cosenos",
      descripcion: "Glosario interactivo sobre las leyes trigonométricas para triángulos oblicuángulos y los casos de resolución.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Triángulo oblicuángulo",
            definicion: "Triángulo que no tiene ningún ángulo recto. Puede ser acutángulo (todos los ángulos < 90°) u obtusángulo (un ángulo > 90°). Se resuelve con Ley de Senos o Cosenos.",
            ejemplo: "Un triángulo con ángulos 40°, 75° y 65° es oblicuángulo acutángulo.",
            etiquetas: ["triángulo", "oblicuángulo"],
          },
          {
            termino: "Ley de Senos",
            definicion: "En cualquier triángulo △ABC: a/sen(A) = b/sen(B) = c/sen(C). Aplica en casos: AAL (dos ángulos y un lado) y LAL ambiguo.",
            ejemplo: "Si A=30°, B=70°, a=10, entonces b = 10·sen(70°)/sen(30°) = 10·0.94/0.5 ≈ 18.8.",
            etiquetas: ["ley de senos", "triángulo"],
          },
          {
            termino: "Ley de Cosenos",
            definicion: "c² = a² + b² − 2ab·cos(C). Generaliza el Teorema de Pitágoras. Aplica en casos: LAL (dos lados y el ángulo comprendido) y LLL (tres lados conocidos).",
            ejemplo: "a=5, b=8, C=60°: c² = 25 + 64 − 2(5)(8)cos(60°) = 89 − 40 = 49 → c = 7.",
            etiquetas: ["ley de cosenos", "pitágoras"],
          },
          {
            termino: "Caso LAL (Ley de Cosenos)",
            definicion: "Se conocen dos lados y el ángulo comprendido. Se usa la Ley de Cosenos para hallar el tercer lado y luego la Ley de Senos para los demás ángulos.",
            ejemplo: "Dados a=6, b=9, C=50°: c² = 36+81−2(6)(9)cos(50°) → c ≈ 6.94.",
            etiquetas: ["LAL", "caso"],
          },
          {
            termino: "Caso LLL (Ley de Cosenos)",
            definicion: "Se conocen los tres lados. Se despeja el coseno de cualquier ángulo: cos(C) = (a² + b² − c²)/(2ab).",
            ejemplo: "a=5, b=7, c=8: cos(C) = (25+49−64)/(2·5·7) = 10/70 ≈ 0.143 → C ≈ 81.8°.",
            etiquetas: ["LLL", "caso"],
          },
          {
            termino: "Caso ambiguo (Ley de Senos)",
            definicion: "En el caso LAA con el lado dado opuesto al ángulo dado, puede haber 0, 1 o 2 triángulos solución. Se verifica comparando el lado dado con la altura h = b·sen(A).",
            ejemplo: "Si A=30°, a=4, b=9: h = 9·sen(30°) = 4.5 > a = 4 → 0 soluciones. Si a=6 > h → 2 soluciones.",
            etiquetas: ["caso ambiguo", "senos"],
          },
        ],
        actividad_final: "Resuelve el triángulo con a = 8, b = 11 y C = 40°. Encuentra el lado c usando la Ley de Cosenos y luego los ángulos A y B con la Ley de Senos.",
      },
    },
    {
      titulo: "Completa los espacios — Ley de Senos y Ley de Cosenos",
      descripcion: "Completa los enunciados clave sobre las leyes trigonométricas para triángulos oblicuángulos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con la expresión, valor o término correcto.",
        texto_con_huecos: "La Ley de Cosenos establece c² = a² + b² − 2ab·cos(___). Cuando C = 90°, la Ley de Cosenos se reduce al Teorema de ___. La Ley de Senos se expresa a/sen(A) = b/___. El caso LAL (dos lados y ángulo comprendido) se resuelve con la Ley de ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "C",
            alternativas_aceptadas: ["c"],
            pista: "c² = a² + b² − 2ab·cos(___), donde ___ es el ángulo opuesto al lado c.",
          },
          {
            posicion: 1,
            respuesta_correcta: "Pitágoras",
            alternativas_aceptadas: ["pitágoras"],
            pista: "Cuando C=90°, cos(90°)=0 y la fórmula se convierte en el Teorema de ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "sen(B)",
            alternativas_aceptadas: ["Sen(B)", "SEN(B)"],
            pista: "La Ley de Senos: a/sen(A) = b/___ = c/sen(C).",
          },
          {
            posicion: 3,
            respuesta_correcta: "Cosenos",
            alternativas_aceptadas: ["cosenos"],
            pista: "Para el caso LAL (dos lados y el ángulo entre ellos) se usa la Ley de ___.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Ley de Senos y Ley de Cosenos",
      descripcion: "Reflexiona sobre tu dominio de las leyes trigonométricas para resolver triángulos oblicuángulos.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Enuncio la Ley de Senos (a/sen A = b/sen B = c/sen C) y sé en qué casos aplicarla.", escala: escala4 },
          { descripcion: "Enuncio la Ley de Cosenos (c² = a² + b² − 2ab·cos C) y la aplico en los casos LAL y LLL.", escala: escala4 },
          { descripcion: "Resuelvo triángulos oblicuángulos encontrando todos los lados y ángulos desconocidos.", escala: escala4 },
          { descripcion: "Identifico el caso ambiguo de la Ley de Senos y determino cuántas soluciones existen.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cómo decidirías qué ley (Senos o Cosenos) usar para resolver un triángulo dado? Describe tu razonamiento o crea un diagrama de decisión.",
      },
    },
  ],

  // ════════════ P06 — Geometría analítica: distancia, punto medio y ecuación de la recta ════════════
  [
    {
      titulo: "Verdadero o Falso — Geometría analítica: distancia y recta",
      descripcion: "Decide si cada afirmación sobre la fórmula de distancia, punto medio y las ecuaciones de la recta en el plano cartesiano es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La distancia entre los puntos P₁(3, 4) y P₂(7, 1) es d = √((7−3)² + (1−4)²) = √(16+9) = 5.",
            respuesta: true,
            retroalimentacion: "Correcto: d = √(4² + (−3)²) = √(16 + 9) = √25 = 5.",
          },
          {
            enunciado: "El punto medio entre (2, 6) y (8, 2) es (5, 5) porque se promedian las coordenadas: ((2+8)/2, (6+2)/2).",
            respuesta: false,
            retroalimentacion: "Falso. M = ((2+8)/2, (6+2)/2) = (5, 4). La coordenada y del punto medio es 4, no 5.",
          },
          {
            enunciado: "La ecuación punto-pendiente de una recta que pasa por (3, −1) con pendiente 2 es y − (−1) = 2(x − 3).",
            respuesta: true,
            retroalimentacion: "Correcto. La forma punto-pendiente es y − y₁ = m(x − x₁), con (x₁, y₁) = (3, −1) y m = 2.",
          },
          {
            enunciado: "Dos rectas son paralelas si y solo si sus pendientes son iguales y sus interceptos también son iguales.",
            respuesta: false,
            retroalimentacion: "Falso. Dos rectas paralelas tienen la misma pendiente pero diferentes interceptos. Si los interceptos también fueran iguales, serían la misma recta.",
          },
          {
            enunciado: "Dos rectas perpendiculares tienen pendientes cuyo producto es −1, es decir, m₁ · m₂ = −1.",
            respuesta: true,
            retroalimentacion: "Correcto. La condición de perpendicularidad entre dos rectas no verticales es m₁ · m₂ = −1.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Geometría analítica básica",
      descripcion: "Glosario interactivo sobre la fórmula de distancia, punto medio, pendiente y las formas de la ecuación de la recta en el plano cartesiano.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Fórmula de la distancia",
            definicion: "La distancia entre P₁(x₁, y₁) y P₂(x₂, y₂) es d = √((x₂−x₁)² + (y₂−y₁)²). Se deriva del Teorema de Pitágoras.",
            ejemplo: "d entre (0, 0) y (5, 12): d = √(25 + 144) = √169 = 13.",
            etiquetas: ["distancia", "fórmula"],
          },
          {
            termino: "Punto medio",
            definicion: "El punto medio M entre P₁(x₁, y₁) y P₂(x₂, y₂) es M = ((x₁+x₂)/2, (y₁+y₂)/2).",
            ejemplo: "Punto medio entre (1, 3) y (7, 9): M = ((1+7)/2, (3+9)/2) = (4, 6).",
            etiquetas: ["punto medio", "segmento"],
          },
          {
            termino: "Pendiente de la recta",
            definicion: "m = (y₂−y₁)/(x₂−x₁). Mide la inclinación de la recta. Rectas horizontales tienen m = 0; rectas verticales tienen pendiente indefinida.",
            ejemplo: "Entre (2, 1) y (6, 9): m = (9−1)/(6−2) = 8/4 = 2.",
            etiquetas: ["pendiente", "inclinación"],
          },
          {
            termino: "Forma pendiente-intercepto",
            definicion: "y = mx + b, donde m es la pendiente y b es el intercepto en y. Es la forma más usada para graficar una recta.",
            ejemplo: "y = −3x + 5: pendiente −3 (decrece) e intercepto 5 (pasa por (0, 5)).",
            etiquetas: ["ecuación de la recta", "intercepto"],
          },
          {
            termino: "Forma punto-pendiente",
            definicion: "y − y₁ = m(x − x₁), donde (x₁, y₁) es un punto conocido y m es la pendiente. Útil cuando se conoce un punto y la pendiente.",
            ejemplo: "Recta con m = 3 que pasa por (2, −1): y − (−1) = 3(x − 2) → y = 3x − 7.",
            etiquetas: ["forma punto-pendiente", "ecuación"],
          },
          {
            termino: "Rectas paralelas y perpendiculares",
            definicion: "Paralelas: misma pendiente (m₁ = m₂) pero diferente intercepto. Perpendiculares: pendientes son recíprocas negativas (m₁ · m₂ = −1).",
            ejemplo: "y = 2x + 3 y y = 2x − 5 son paralelas. y = 2x + 1 y y = −(1/2)x + 4 son perpendiculares.",
            etiquetas: ["paralelas", "perpendiculares"],
          },
        ],
        actividad_final: "Dados los puntos A(1, 2) y B(7, 10): (a) calcula la distancia AB, (b) encuentra el punto medio M, (c) halla la ecuación de la recta AB en forma pendiente-intercepto.",
      },
    },
    {
      titulo: "Completa los espacios — Geometría analítica",
      descripcion: "Completa los valores clave de la geometría analítica: distancia, punto medio y ecuación de la recta.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el valor o expresión correcta.",
        texto_con_huecos: "La distancia entre (0, 0) y (3, 4) es d = ___. El punto medio entre (2, 6) y (8, 2) es (5, ___). La pendiente de la recta que pasa por (1, 3) y (5, 11) es m = ___. Dos rectas perpendiculares satisfacen m₁ · m₂ = ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "5",
            alternativas_aceptadas: [],
            pista: "d = √(3² + 4²) = √(9 + 16) = √25 = ?",
          },
          {
            posicion: 1,
            respuesta_correcta: "4",
            alternativas_aceptadas: [],
            pista: "Coordenada y del punto medio = (6 + 2)/2 = ?",
          },
          {
            posicion: 2,
            respuesta_correcta: "2",
            alternativas_aceptadas: [],
            pista: "m = (y₂ − y₁)/(x₂ − x₁) = (11 − 3)/(5 − 1) = 8/4 = ?",
          },
          {
            posicion: 3,
            respuesta_correcta: "-1",
            alternativas_aceptadas: ["−1"],
            pista: "La condición de perpendicularidad es m₁ · m₂ = ?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Geometría analítica: distancia, punto medio y recta",
      descripcion: "Reflexiona sobre tu dominio de los conceptos de geometría analítica en el plano cartesiano.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Aplico la fórmula de distancia d = √((x₂−x₁)² + (y₂−y₁)²) para calcular distancias entre dos puntos.", escala: escala4 },
          { descripcion: "Calculo el punto medio de un segmento usando M = ((x₁+x₂)/2, (y₁+y₂)/2).", escala: escala4 },
          { descripcion: "Determino la ecuación de una recta en las formas pendiente-intercepto y punto-pendiente.", escala: escala4 },
          { descripcion: "Identifico si dos rectas son paralelas (m₁ = m₂) o perpendiculares (m₁ · m₂ = −1) a partir de sus pendientes.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cómo conecta la geometría analítica el álgebra con la geometría? Da un ejemplo concreto donde calcular una distancia o una ecuación de recta tenga una aplicación práctica.",
      },
    },
  ],

  // ════════════ P07 — Cónicas: circunferencia y parábola ════════════
  [
    {
      titulo: "Verdadero o Falso — Circunferencia y parábola como cónicas",
      descripcion: "Decide si cada afirmación sobre la circunferencia y la parábola como lugares geométricos en el plano cartesiano es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La ecuación estándar de una circunferencia con centro (h, k) y radio r es (x − h)² + (y − k)² = r².",
            respuesta: true,
            retroalimentacion: "Correcto. Esa es la ecuación canónica de la circunferencia, derivada de la definición: todos los puntos a distancia r del centro (h, k).",
          },
          {
            enunciado: "La circunferencia x² + y² = 25 tiene centro en (0, 0) y radio 5.",
            respuesta: true,
            retroalimentacion: "Correcto: es la forma estándar con h = k = 0 y r = √25 = 5.",
          },
          {
            enunciado: "La parábola y = x² tiene su vértice en el origen y abre hacia la derecha.",
            respuesta: false,
            retroalimentacion: "Falso. y = x² tiene vértice en el origen (0, 0) pero abre hacia arriba (eje de simetría vertical), no hacia la derecha.",
          },
          {
            enunciado: "La ecuación (x − 2)² + (y + 3)² = 16 representa una circunferencia con centro (2, −3) y radio 4.",
            respuesta: true,
            retroalimentacion: "Correcto: h = 2, k = −3 y r = √16 = 4.",
          },
          {
            enunciado: "Una parábola horizontal de la forma x = ay² + by + c tiene su eje de simetría paralelo al eje x.",
            respuesta: true,
            retroalimentacion: "Correcto. Las parábolas horizontales (x en función de y) tienen el eje de simetría horizontal, paralelo al eje x.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Circunferencia y parábola",
      descripcion: "Glosario interactivo sobre circunferencia y parábola como lugares geométricos (cónicas) en el plano cartesiano.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Circunferencia (lugar geométrico)",
            definicion: "Conjunto de todos los puntos en el plano que equidistan de un punto fijo llamado centro. Ecuación estándar: (x − h)² + (y − k)² = r².",
            ejemplo: "Circunferencia con centro (3, −1) y radio 6: (x − 3)² + (y + 1)² = 36.",
            etiquetas: ["circunferencia", "cónica"],
          },
          {
            termino: "Forma general de la circunferencia",
            definicion: "x² + y² + Dx + Ey + F = 0. Se convierte a forma estándar completando el cuadrado en x y en y.",
            ejemplo: "x² + y² − 4x + 6y − 3 = 0 → (x−2)² + (y+3)² = 16. Centro (2,−3), radio 4.",
            etiquetas: ["circunferencia", "forma general"],
          },
          {
            termino: "Parábola como lugar geométrico",
            definicion: "Conjunto de puntos equidistantes de un punto fijo (foco) y una recta fija (directriz). Ecuación con vértice en origen: y = ax² (vertical) o x = ay² (horizontal).",
            ejemplo: "y = (1/4p)x² es la parábola con foco (0, p) y directriz y = −p.",
            etiquetas: ["parábola", "foco", "directriz"],
          },
          {
            termino: "Vértice y eje de simetría de la parábola",
            definicion: "El vértice es el punto de la parábola más cercano a la directriz. El eje de simetría pasa por el vértice y el foco, perpendicular a la directriz.",
            ejemplo: "y = 2(x − 3)² + 1: vértice (3, 1), eje de simetría x = 3.",
            etiquetas: ["vértice", "eje de simetría", "parábola"],
          },
          {
            termino: "Interceptos de cónicas",
            definicion: "Los interceptos en x se obtienen haciendo y = 0 y resolviendo; los interceptos en y haciendo x = 0. Útiles para graficar.",
            ejemplo: "Circunferencia x² + y² = 25: interceptos en x: (±5, 0); interceptos en y: (0, ±5).",
            etiquetas: ["interceptos", "gráfica"],
          },
          {
            termino: "Sección cónica",
            definicion: "Las cónicas (circunferencia, elipse, parábola, hipérbola) se obtienen cortando un cono doble con un plano. Representan curvas fundamentales en matemáticas y física.",
            ejemplo: "La trayectoria de los planetas es una elipse; la de una pelota lanzada es una parábola.",
            etiquetas: ["cónicas", "sección cónica", "aplicación"],
          },
        ],
        actividad_final: "Dada la ecuación x² + y² − 6x + 4y − 12 = 0: completa el cuadrado para obtener la forma estándar, identifica el centro y el radio, y determina si el punto (6, −2) pertenece a la circunferencia.",
      },
    },
    {
      titulo: "Completa los espacios — Circunferencia y parábola",
      descripcion: "Completa los datos clave de circunferencias y parábolas en el plano cartesiano.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el valor o término correcto.",
        texto_con_huecos: "La ecuación estándar de una circunferencia con centro (h, k) y radio r es (x − h)² + (y − k)² = ___. La circunferencia x² + y² = 49 tiene radio ___. La parábola y = 3(x − 2)² + 5 tiene su vértice en (2, ___). El eje de simetría de la parábola y = (x − 4)² − 1 es la recta x = ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "r²",
            alternativas_aceptadas: ["r^2"],
            pista: "La forma estándar de la circunferencia termina en = ___ (radio al cuadrado).",
          },
          {
            posicion: 1,
            respuesta_correcta: "7",
            alternativas_aceptadas: [],
            pista: "x² + y² = 49 → r² = 49 → r = √49 = ?",
          },
          {
            posicion: 2,
            respuesta_correcta: "5",
            alternativas_aceptadas: [],
            pista: "En y = a(x−h)²+k, el vértice es (h, k). Aquí h=2, k=?",
          },
          {
            posicion: 3,
            respuesta_correcta: "4",
            alternativas_aceptadas: [],
            pista: "El eje de simetría de y = (x−4)²−1 pasa por x = h = ?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Cónicas: circunferencia y parábola",
      descripcion: "Reflexiona sobre tu comprensión de la circunferencia y la parábola como lugares geométricos en el plano cartesiano.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Escribo la ecuación estándar de una circunferencia dado su centro y radio, y la interpreto gráficamente.", escala: escala4 },
          { descripcion: "Convierto la ecuación general de una circunferencia a forma estándar completando el cuadrado.", escala: escala4 },
          { descripcion: "Identifico el vértice, eje de simetría y apertura de una parábola en cualquiera de sus formas.", escala: escala4 },
          { descripcion: "Relaciono la circunferencia y la parábola con sus definiciones como lugares geométricos (foco, directriz, radio).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿En qué aplicaciones del mundo real encuentras circunferencias o parábolas? (Por ejemplo: antenas parabólicas, arcos de puentes, ruedas.) Elige una y explica por qué esa cónica es la forma adecuada para esa aplicación.",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
