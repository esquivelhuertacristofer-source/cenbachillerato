/**
 * Refuerzo de actividades para PM-III (Pensamiento Matemático III — álgebra y geometría plana,
 * ecuaciones de segundo grado) según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 6 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 6 progresiones × 4 = 24 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial PM-III (MCCEMS 2025): Pitágoras, ecuaciones cuadráticas,
 * discriminante, perímetros/áreas/volúmenes, semejanza/congruencia, álgebra-geometría (parábolas).
 * Uso: npx tsx scripts/seed-activities-pmiii-refuerzo.ts
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
  log("\n🌱 Refuerzo PM-III — Pensamiento Matemático III: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "PM-III");
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

  log(`\n✅ PM-III refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Teorema de Pitágoras ════════════
  [
    {
      titulo: "Verdadero o Falso — Teorema de Pitágoras",
      descripcion: "Decide si cada afirmación sobre el Teorema de Pitágoras, su demostración y los triples pitagóricos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "En un triángulo rectángulo con catetos a y b e hipotenusa c, se cumple que a² + b² = c².",
            respuesta: true,
            retroalimentacion: "Correcto. Ese es exactamente el enunciado del Teorema de Pitágoras: la suma de los cuadrados de los catetos iguala el cuadrado de la hipotenusa.",
          },
          {
            enunciado: "El triple pitagórico (3, 4, 5) cumple el Teorema de Pitágoras porque 3² + 4² = 5², es decir, 9 + 16 = 25.",
            respuesta: true,
            retroalimentacion: "Correcto: 9 + 16 = 25 = 5². Es el triple pitagórico más conocido.",
          },
          {
            enunciado: "El triple (5, 12, 13) NO es pitagórico porque 5² + 12² ≠ 13².",
            respuesta: false,
            retroalimentacion: "Falso: 5² + 12² = 25 + 144 = 169 = 13². Sí es un triple pitagórico válido.",
          },
          {
            enunciado: "La hipotenusa es el lado más corto del triángulo rectángulo.",
            respuesta: false,
            retroalimentacion: "Falso. La hipotenusa es el lado más largo; es el lado opuesto al ángulo recto.",
          },
          {
            enunciado: "Si en un triángulo se cumple a² + b² = c², entonces el triángulo es necesariamente rectángulo (recíproco del Teorema de Pitágoras).",
            respuesta: true,
            retroalimentacion: "Correcto. El recíproco del Teorema de Pitágoras afirma que si a² + b² = c², el triángulo es rectángulo con hipotenusa c.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Teorema de Pitágoras",
      descripcion: "Glosario interactivo de conceptos clave del Teorema de Pitágoras, sus elementos y sus aplicaciones.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Teorema de Pitágoras",
            definicion: "En todo triángulo rectángulo, la suma de los cuadrados de los catetos es igual al cuadrado de la hipotenusa: a² + b² = c².",
            ejemplo: "Si a = 6 cm y b = 8 cm, entonces c = √(36 + 64) = √100 = 10 cm.",
            etiquetas: ["teorema", "triángulo rectángulo"],
          },
          {
            termino: "Hipotenusa",
            definicion: "El lado más largo del triángulo rectángulo; el lado opuesto al ángulo de 90°.",
            ejemplo: "En el triángulo con catetos 3 y 4, la hipotenusa mide 5.",
            etiquetas: ["geometría", "triángulo rectángulo"],
          },
          {
            termino: "Cateto",
            definicion: "Cada uno de los dos lados que forman el ángulo recto en un triángulo rectángulo.",
            ejemplo: "Los catetos del triple (3, 4, 5) son 3 y 4.",
            etiquetas: ["geometría", "triángulo rectángulo"],
          },
          {
            termino: "Triple pitagórico",
            definicion: "Conjunto de tres enteros positivos (a, b, c) que satisfacen a² + b² = c².",
            ejemplo: "(3, 4, 5) y (5, 12, 13) son triples pitagóricos clásicos.",
            etiquetas: ["números", "aplicación"],
          },
          {
            termino: "Recíproco del Teorema de Pitágoras",
            definicion: "Si los lados a, b, c de un triángulo cumplen a² + b² = c², entonces el triángulo es rectángulo.",
            ejemplo: "Como 6² + 8² = 100 = 10², el triángulo (6, 8, 10) es rectángulo.",
            etiquetas: ["demostración", "recíproco"],
          },
          {
            termino: "Aplicación: distancia entre puntos",
            definicion: "La distancia entre dos puntos (x₁, y₁) y (x₂, y₂) en el plano se obtiene con el Teorema de Pitágoras: d = √((x₂−x₁)² + (y₂−y₁)²).",
            ejemplo: "Distancia de (0,0) a (3,4): d = √(9+16) = 5.",
            etiquetas: ["aplicación", "coordenadas"],
          },
        ],
        actividad_final: "Dado un triángulo rectángulo con catetos de 8 cm y 15 cm, calcula la hipotenusa y verifica si (8, 15, 17) es un triple pitagórico.",
      },
    },
    {
      titulo: "Completa los espacios — Pitágoras en acción",
      descripcion: "Completa los valores numéricos y términos clave del Teorema de Pitágoras.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el número o término correcto. Recuerda la fórmula a² + b² = c².",
        texto_con_huecos: "El Teorema de Pitágoras establece que en un triángulo ___, a² + b² = c², donde c es la ___. En el triple pitagórico (3, 4, 5), la hipotenusa mide ___, pues 9 + 16 = ___. Para el triple (5, 12, 13) se cumple que 25 + 144 = ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "rectángulo",
            alternativas_aceptadas: ["recto"],
            pista: "El teorema aplica a triángulos con un ángulo de 90°: triángulo ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "hipotenusa",
            alternativas_aceptadas: [],
            pista: "El lado más largo del triángulo rectángulo, opuesto al ángulo recto.",
          },
          {
            posicion: 2,
            respuesta_correcta: "5",
            alternativas_aceptadas: [],
            pista: "√(3² + 4²) = √(9 + 16) = √25 = ?",
          },
          {
            posicion: 3,
            respuesta_correcta: "25",
            alternativas_aceptadas: [],
            pista: "9 + 16 = ?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Teorema de Pitágoras",
      descripcion: "Reflexiona sobre tu dominio del Teorema de Pitágoras: demostración, triples pitagóricos y aplicaciones.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esto te ayudará a identificar qué reforzar.",
        criterios: [
          { descripcion: "Enuncio y comprendo el Teorema de Pitágoras (a² + b² = c²).", escala: escala4 },
          { descripcion: "Calculo la hipotenusa o un cateto desconocido aplicando el teorema.", escala: escala4 },
          { descripcion: "Identifico y verifico triples pitagóricos como (3,4,5) y (5,12,13).", escala: escala4 },
          { descripcion: "Aplico el Teorema de Pitágoras para calcular distancias en problemas reales.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿En qué situación de la vida cotidiana o de otra materia podrías usar el Teorema de Pitágoras?",
      },
    },
  ],

  // ════════════ P02 — Ecuaciones cuadráticas ════════════
  [
    {
      titulo: "Verdadero o Falso — Ecuaciones cuadráticas",
      descripcion: "Decide si cada afirmación sobre la factorización, la fórmula general y el método de completar el cuadrado es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La ecuación cuadrática x² − 5x + 6 = 0 puede factorizarse como (x − 2)(x − 3) = 0.",
            respuesta: true,
            retroalimentacion: "Correcto: (x−2)(x−3) = x²−3x−2x+6 = x²−5x+6. Las raíces son x=2 y x=3.",
          },
          {
            enunciado: "La fórmula general para resolver ax² + bx + c = 0 es x = (−b ± √(b²−4ac)) / (2a).",
            respuesta: true,
            retroalimentacion: "Correcto. Esa es la fórmula cuadrática general (fórmula de Bhaskara).",
          },
          {
            enunciado: "Al completar el cuadrado en x² + 6x + 5 = 0, se obtiene (x + 3)² = 4.",
            respuesta: true,
            retroalimentacion: "Correcto: x² + 6x + 5 = 0 → x² + 6x = −5 → (x+3)² = −5+9 = 4. Bien.",
          },
          {
            enunciado: "La ecuación x² + 1 = 0 tiene dos soluciones reales.",
            respuesta: false,
            retroalimentacion: "Falso. x² = −1 no tiene solución real; el discriminante b²−4ac = 0−4(1)(1) = −4 < 0.",
          },
          {
            enunciado: "En la ecuación 2x² − 4x = 0, una solución siempre es x = 0.",
            respuesta: true,
            retroalimentacion: "Correcto: 2x(x−2) = 0, entonces x = 0 o x = 2. Sí, x = 0 es solución.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Ecuaciones cuadráticas",
      descripcion: "Glosario interactivo de métodos de resolución de ecuaciones de segundo grado.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Ecuación cuadrática",
            definicion: "Ecuación de la forma ax² + bx + c = 0 con a ≠ 0. También llamada ecuación de segundo grado.",
            ejemplo: "2x² − 3x + 1 = 0 es una ecuación cuadrática con a=2, b=−3, c=1.",
            etiquetas: ["definición", "álgebra"],
          },
          {
            termino: "Factorización",
            definicion: "Método para resolver ax² + bx + c = 0 expresándola como producto de dos factores lineales.",
            ejemplo: "x² − 5x + 6 = (x−2)(x−3) = 0 → x = 2 o x = 3.",
            etiquetas: ["método", "factorización"],
          },
          {
            termino: "Fórmula general (cuadrática)",
            definicion: "x = (−b ± √(b²−4ac)) / (2a). Resuelve cualquier ecuación cuadrática.",
            ejemplo: "Para x²−5x+6=0: x = (5 ± √(25−24))/2 = (5±1)/2 → x=3 o x=2.",
            etiquetas: ["método", "fórmula"],
          },
          {
            termino: "Completar el cuadrado",
            definicion: "Método algebraico que transforma ax²+bx+c=0 en la forma (x+h)²=k para despejar x.",
            ejemplo: "x²+6x+5=0 → (x+3)²=4 → x+3=±2 → x=−1 o x=−5.",
            etiquetas: ["método", "álgebra"],
          },
          {
            termino: "Raíces (soluciones) de la ecuación",
            definicion: "Los valores de x que satisfacen ax²+bx+c=0. Una ecuación cuadrática tiene a lo más dos raíces reales.",
            ejemplo: "Las raíces de x²−5x+6=0 son x=2 y x=3.",
            etiquetas: ["solución", "raíces"],
          },
          {
            termino: "Verificación de una raíz",
            definicion: "Sustituir la solución encontrada en la ecuación original para confirmar que la igualdad se cumple.",
            ejemplo: "Para x=2: (2)²−5(2)+6 = 4−10+6 = 0. ✓",
            etiquetas: ["verificación", "álgebra"],
          },
        ],
        actividad_final: "Resuelve x² − 7x + 12 = 0 por factorización y verifica ambas raíces sustituyendo en la ecuación original.",
      },
    },
    {
      titulo: "Completa los espacios — Resolviendo ecuaciones cuadráticas",
      descripcion: "Completa los pasos clave para resolver ecuaciones cuadráticas por los distintos métodos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el número o término correcto. Verifica tus cálculos antes de responder.",
        texto_con_huecos: "Para resolver x² − 5x + 6 = 0 por factorización se escribe (x − 2)(x − ___) = 0, dando raíces x = 2 y x = 3. Usando la fórmula general con a=1, b=−5, c=6, el discriminante es b²−4ac = 25 − ___ = 1. Las soluciones son x = (5 ± ___) / 2. Al completar el cuadrado en x² + 6x + 5 = 0 se obtiene (x + 3)² = ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "3",
            alternativas_aceptadas: [],
            pista: "¿Qué número multiplicado con −2 da +6 y sumado con −2 da −5? Es x − ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "24",
            alternativas_aceptadas: [],
            pista: "4ac = 4×1×6 = ?",
          },
          {
            posicion: 2,
            respuesta_correcta: "1",
            alternativas_aceptadas: [],
            pista: "√(discriminante) = √1 = ?",
          },
          {
            posicion: 3,
            respuesta_correcta: "4",
            alternativas_aceptadas: [],
            pista: "x²+6x+5=0 → x²+6x=−5 → añade (6/2)²=9 → (x+3)²= −5+9 = ?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Ecuaciones cuadráticas",
      descripcion: "Reflexiona sobre tu dominio de los métodos para resolver ecuaciones de segundo grado.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico los coeficientes a, b y c de una ecuación cuadrática en forma estándar.", escala: escala4 },
          { descripcion: "Resuelvo ecuaciones cuadráticas por factorización cuando es posible.", escala: escala4 },
          { descripcion: "Aplico la fórmula general para obtener las raíces de cualquier ecuación cuadrática.", escala: escala4 },
          { descripcion: "Uso el método de completar el cuadrado para transformar y resolver la ecuación.", escala: escala4 },
        ],
        reflexion_final_prompt: "De los tres métodos (factorización, fórmula general, completar el cuadrado), ¿cuál te resulta más sencillo y por qué?",
      },
    },
  ],

  // ════════════ P03 — Naturaleza de las raíces (discriminante) ════════════
  [
    {
      titulo: "Verdadero o Falso — Discriminante y naturaleza de raíces",
      descripcion: "Decide si cada afirmación sobre el discriminante b²−4ac y la naturaleza de las raíces es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Si el discriminante b²−4ac > 0, la ecuación cuadrática tiene dos raíces reales distintas.",
            respuesta: true,
            retroalimentacion: "Correcto. Un discriminante positivo garantiza dos soluciones reales y diferentes.",
          },
          {
            enunciado: "Si b²−4ac = 0, la ecuación tiene una raíz doble (raíz repetida) igual a x = −b/(2a).",
            respuesta: true,
            retroalimentacion: "Correcto. Cuando el discriminante es cero, ambas raíces coinciden: x = −b/(2a).",
          },
          {
            enunciado: "Si b²−4ac < 0, la ecuación cuadrática tiene dos raíces reales negativas.",
            respuesta: false,
            retroalimentacion: "Falso. Cuando el discriminante es negativo, la ecuación NO tiene raíces reales (las raíces son complejas).",
          },
          {
            enunciado: "Para x² − 4x + 4 = 0, el discriminante es (−4)²−4(1)(4) = 0, por lo que tiene raíz doble x = 2.",
            respuesta: true,
            retroalimentacion: "Correcto: Δ = 16 − 16 = 0, y x = −(−4)/(2·1) = 4/2 = 2. Raíz doble x = 2.",
          },
          {
            enunciado: "El discriminante de 3x² + 2x + 5 = 0 es 2²−4(3)(5) = 4−60 = −56, lo que indica que tiene dos raíces reales.",
            respuesta: false,
            retroalimentacion: "Falso. El discriminante −56 < 0 indica que NO hay raíces reales, sino complejas.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Discriminante y naturaleza de raíces",
      descripcion: "Glosario interactivo sobre el discriminante b²−4ac y sus tres casos para determinar la naturaleza de las raíces.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Discriminante (Δ)",
            definicion: "Expresión Δ = b²−4ac que determina la naturaleza de las raíces de ax²+bx+c=0 sin necesidad de resolverla.",
            ejemplo: "Para x²−5x+6=0: Δ = 25−24 = 1 > 0 → dos raíces reales distintas.",
            etiquetas: ["discriminante", "álgebra"],
          },
          {
            termino: "Δ > 0: dos raíces reales distintas",
            definicion: "Cuando el discriminante es positivo, la ecuación tiene exactamente dos soluciones reales y diferentes.",
            ejemplo: "x²−5x+6=0, Δ=1 > 0 → x=2 y x=3.",
            etiquetas: ["caso", "discriminante"],
          },
          {
            termino: "Δ = 0: raíz doble (real repetida)",
            definicion: "Cuando el discriminante es cero, la ecuación tiene una única raíz real (repetida): x = −b/(2a).",
            ejemplo: "x²−4x+4=0, Δ=0 → x = 4/2 = 2 (raíz doble).",
            etiquetas: ["caso", "discriminante"],
          },
          {
            termino: "Δ < 0: sin raíces reales",
            definicion: "Cuando el discriminante es negativo, la ecuación no tiene soluciones en los números reales.",
            ejemplo: "x²+x+1=0, Δ=1−4=−3 < 0 → sin raíces reales.",
            etiquetas: ["caso", "discriminante"],
          },
          {
            termino: "Raíz doble",
            definicion: "Cuando Δ=0, la única raíz es x=−b/(2a). La parábola correspondiente es tangente al eje x.",
            ejemplo: "x²−6x+9=(x−3)²=0 → raíz doble x=3.",
            etiquetas: ["raíz", "geometría"],
          },
          {
            termino: "Uso práctico del discriminante",
            definicion: "Permite clasificar las raíces antes de resolver y anticipar la cantidad de intersecciones de la parábola con el eje x.",
            ejemplo: "Si Δ>0, la parábola corta al eje x en dos puntos; si Δ=0, en uno; si Δ<0, no lo corta.",
            etiquetas: ["aplicación", "parábola"],
          },
        ],
        actividad_final: "Para cada ecuación, calcula el discriminante y determina la naturaleza de las raíces sin resolver: (a) x²−2x−3=0, (b) 4x²−4x+1=0, (c) x²+3x+5=0.",
      },
    },
    {
      titulo: "Completa los espacios — Analizando el discriminante",
      descripcion: "Completa los cálculos del discriminante y la clasificación de raíces para distintas ecuaciones cuadráticas.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el valor numérico o la clasificación correcta de las raíces.",
        texto_con_huecos: "Para x²−2x−3=0, el discriminante es b²−4ac = 4+12 = ___, lo que indica dos raíces reales ___. Para x²−4x+4=0, Δ = 16−16 = ___, lo que indica raíz ___. Para x²+x+1=0, Δ = 1−4 = ___, lo que indica que no hay raíces ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "16",
            alternativas_aceptadas: [],
            pista: "b²−4ac = (−2)²−4(1)(−3) = 4+12 = ?",
          },
          {
            posicion: 1,
            respuesta_correcta: "distintas",
            alternativas_aceptadas: ["diferentes", "reales distintas"],
            pista: "Δ > 0 implica que hay dos raíces reales ___ .",
          },
          {
            posicion: 2,
            respuesta_correcta: "0",
            alternativas_aceptadas: [],
            pista: "(−4)²−4(1)(4) = 16−16 = ?",
          },
          {
            posicion: 3,
            respuesta_correcta: "doble",
            alternativas_aceptadas: ["repetida"],
            pista: "Δ = 0 indica una raíz ___ (repetida).",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Discriminante y naturaleza de raíces",
      descripcion: "Reflexiona sobre tu comprensión del discriminante y su uso para clasificar las soluciones de una ecuación cuadrática.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Calculo el discriminante Δ = b²−4ac correctamente identificando a, b y c.", escala: escala4 },
          { descripcion: "Determino si la ecuación tiene dos raíces reales distintas (Δ > 0).", escala: escala4 },
          { descripcion: "Identifico el caso de raíz doble (Δ = 0) y calculo su valor con x = −b/(2a).", escala: escala4 },
          { descripcion: "Reconozco que Δ < 0 implica ausencia de raíces reales y lo relaciono con la gráfica de la parábola.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué es útil calcular el discriminante antes de intentar resolver una ecuación cuadrática?",
      },
    },
  ],

  // ════════════ P04 — Perímetros, áreas y volúmenes ════════════
  [
    {
      titulo: "Verdadero o Falso — Perímetros, áreas y volúmenes",
      descripcion: "Decide si cada afirmación sobre las fórmulas de perímetro, área y volumen de figuras geométricas es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "El área de un círculo de radio r es A = πr².",
            respuesta: true,
            retroalimentacion: "Correcto. La fórmula del área de un círculo es A = πr².",
          },
          {
            enunciado: "El volumen de un cilindro de radio r y altura h es V = πr²h.",
            respuesta: true,
            retroalimentacion: "Correcto: V = área de la base × altura = πr²·h.",
          },
          {
            enunciado: "El perímetro de un rectángulo de lados a y b es P = a·b.",
            respuesta: false,
            retroalimentacion: "Falso. El perímetro es P = 2(a+b), no el producto. El producto a·b es el área.",
          },
          {
            enunciado: "El volumen de una esfera de radio r es V = (4/3)πr³.",
            respuesta: true,
            retroalimentacion: "Correcto. La fórmula del volumen de una esfera es V = (4/3)πr³.",
          },
          {
            enunciado: "El área de un triángulo de base b y altura h es A = b·h (sin dividir entre 2).",
            respuesta: false,
            retroalimentacion: "Falso. El área del triángulo es A = (b·h)/2. Se divide entre 2 porque el triángulo es la mitad del rectángulo equivalente.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Perímetros, áreas y volúmenes",
      descripcion: "Glosario interactivo de las fórmulas esenciales de medición de figuras planas y cuerpos geométricos.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Perímetro de polígonos",
            definicion: "Suma de la longitud de todos sus lados. Para un rectángulo: P = 2(a+b); para un cuadrado: P = 4l.",
            ejemplo: "Rectángulo 5×3 cm: P = 2(5+3) = 16 cm.",
            etiquetas: ["perímetro", "polígono"],
          },
          {
            termino: "Área de figuras planas",
            definicion: "Superficie encerrada. Triángulo: A=(b·h)/2; rectángulo: A=a·b; círculo: A=πr².",
            ejemplo: "Triángulo b=6 cm, h=4 cm: A=(6·4)/2=12 cm².",
            etiquetas: ["área", "figuras planas"],
          },
          {
            termino: "Circunferencia y círculo",
            definicion: "Circunferencia (perímetro): C=2πr. Área del círculo: A=πr².",
            ejemplo: "Radio 5 cm: C=2π(5)≈31.4 cm; A=π(25)≈78.5 cm².",
            etiquetas: ["círculo", "área"],
          },
          {
            termino: "Volumen de prismas y cilindros",
            definicion: "V = área de la base × altura. Prisma rectangular: V=l·a·h; cilindro: V=πr²h.",
            ejemplo: "Cilindro r=3, h=10: V=π(9)(10)=90π≈282.7 unidades³.",
            etiquetas: ["volumen", "cilindro", "prisma"],
          },
          {
            termino: "Volumen de pirámide y cono",
            definicion: "V = (1/3) × área de la base × altura. Pirámide cuadrada: V=(1/3)l²h; cono: V=(1/3)πr²h.",
            ejemplo: "Cono r=3, h=4: V=(1/3)π(9)(4)=12π≈37.7 unidades³.",
            etiquetas: ["volumen", "cono", "pirámide"],
          },
          {
            termino: "Volumen de la esfera",
            definicion: "V = (4/3)πr³. La superficie de una esfera es S = 4πr².",
            ejemplo: "Esfera r=6 cm: V=(4/3)π(216)=288π≈904.8 cm³.",
            etiquetas: ["volumen", "esfera"],
          },
        ],
        actividad_final: "Calcula el área lateral y el volumen de un cilindro con radio 4 cm y altura 10 cm. Usa π ≈ 3.1416.",
      },
    },
    {
      titulo: "Completa los espacios — Fórmulas de áreas y volúmenes",
      descripcion: "Completa los resultados de cálculos de perímetro, área y volumen de figuras geométricas.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el valor numérico correcto (usa π ≈ 3.1416 donde sea necesario, deja tu respuesta en términos de π si el hueco lo indica).",
        texto_con_huecos: "El área de un triángulo con base 8 cm y altura 5 cm es A = ___ cm². El perímetro de un cuadrado de lado 7 cm es P = ___ cm. El volumen de un prisma rectangular de 3×4×5 cm es V = ___ cm³. El volumen de una esfera de radio 3 cm es V = ___ π cm³.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "20",
            alternativas_aceptadas: [],
            pista: "A = (base × altura) / 2 = (8 × 5) / 2 = ?",
          },
          {
            posicion: 1,
            respuesta_correcta: "28",
            alternativas_aceptadas: [],
            pista: "P = 4 × lado = 4 × 7 = ?",
          },
          {
            posicion: 2,
            respuesta_correcta: "60",
            alternativas_aceptadas: [],
            pista: "V = largo × ancho × alto = 3 × 4 × 5 = ?",
          },
          {
            posicion: 3,
            respuesta_correcta: "36",
            alternativas_aceptadas: [],
            pista: "V = (4/3)πr³ = (4/3)π(27) = (4×27)/3 × π = ___ π.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Perímetros, áreas y volúmenes",
      descripcion: "Reflexiona sobre tu manejo de las fórmulas de medición de figuras planas y cuerpos geométricos.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Calculo el perímetro y el área de polígonos comunes (triángulo, cuadrado, rectángulo).", escala: escala4 },
          { descripcion: "Aplico las fórmulas del círculo (C=2πr y A=πr²) correctamente.", escala: escala4 },
          { descripcion: "Calculo el volumen de prismas, cilindros, pirámides y conos usando V=A_base×h o V=(1/3)A_base×h.", escala: escala4 },
          { descripcion: "Calculo el volumen de una esfera con V=(4/3)πr³ y distingo cuándo usar cada fórmula.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué figura geométrica encuentras más difícil de calcular y qué estrategia usarías para recordar su fórmula?",
      },
    },
  ],

  // ════════════ P05 — Semejanza y congruencia de triángulos ════════════
  [
    {
      titulo: "Verdadero o Falso — Semejanza y congruencia de triángulos",
      descripcion: "Decide si cada afirmación sobre los criterios de congruencia (LLL, LAL, ALA) y semejanza de triángulos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Dos triángulos son congruentes si sus tres lados correspondientes son iguales (criterio LLL).",
            respuesta: true,
            retroalimentacion: "Correcto. El criterio LLL (Lado-Lado-Lado) garantiza la congruencia si los tres pares de lados correspondientes son iguales.",
          },
          {
            enunciado: "El criterio LAL de congruencia establece que dos lados iguales y el ángulo comprendido entre ellos determinan triángulos congruentes.",
            respuesta: true,
            retroalimentacion: "Correcto. LAL (Lado-Ángulo-Lado): dos lados y el ángulo formado entre ellos determinan unívocamente un triángulo.",
          },
          {
            enunciado: "Dos triángulos semejantes tienen los mismos ángulos y los mismos lados.",
            respuesta: false,
            retroalimentacion: "Falso. Los triángulos semejantes tienen los mismos ángulos, pero los lados son proporcionales, no necesariamente iguales.",
          },
          {
            enunciado: "Si dos triángulos tienen sus tres ángulos iguales (AAA), son semejantes pero no necesariamente congruentes.",
            respuesta: true,
            retroalimentacion: "Correcto. AAA garantiza semejanza (misma forma) pero no congruencia (los tamaños pueden diferir).",
          },
          {
            enunciado: "En triángulos semejantes, la razón de sus áreas es igual a la razón de semejanza.",
            respuesta: false,
            retroalimentacion: "Falso. La razón de las áreas es el cuadrado de la razón de semejanza. Si la razón de lados es k, la razón de áreas es k².",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Semejanza y congruencia de triángulos",
      descripcion: "Glosario interactivo de los criterios de congruencia y semejanza de triángulos y sus aplicaciones.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Congruencia de triángulos",
            definicion: "Dos triángulos son congruentes si tienen exactamente la misma forma y el mismo tamaño (todos los lados y ángulos correspondientes son iguales).",
            ejemplo: "△ABC ≅ △DEF si AB=DE, BC=EF, CA=FD y sus ángulos correspondientes son iguales.",
            etiquetas: ["congruencia", "triángulo"],
          },
          {
            termino: "Criterio LLL",
            definicion: "Lado-Lado-Lado: si los tres lados de un triángulo son iguales a los tres lados correspondientes de otro, los triángulos son congruentes.",
            ejemplo: "Si a=a', b=b' y c=c', entonces △ABC ≅ △A'B'C'.",
            etiquetas: ["criterio", "congruencia"],
          },
          {
            termino: "Criterio LAL",
            definicion: "Lado-Ángulo-Lado: si dos lados y el ángulo comprendido entre ellos son iguales en ambos triángulos, son congruentes.",
            ejemplo: "AB=DE, ∠A=∠D, AC=DF → △ABC ≅ △DEF.",
            etiquetas: ["criterio", "congruencia"],
          },
          {
            termino: "Criterio ALA",
            definicion: "Ángulo-Lado-Ángulo: si dos ángulos y el lado comprendido son iguales en ambos triángulos, son congruentes.",
            ejemplo: "∠A=∠D, AB=DE, ∠B=∠E → △ABC ≅ △DEF.",
            etiquetas: ["criterio", "congruencia"],
          },
          {
            termino: "Semejanza de triángulos",
            definicion: "Dos triángulos son semejantes si tienen los mismos ángulos y sus lados son proporcionales. La razón de proporcionalidad se llama razón de semejanza.",
            ejemplo: "Si △ABC ~ △DEF con razón k=2, entonces DE=2·AB, EF=2·BC, FD=2·CA.",
            etiquetas: ["semejanza", "proporcionalidad"],
          },
          {
            termino: "Razón de semejanza y áreas",
            definicion: "Si la razón de semejanza es k, la razón de los perímetros es k y la razón de las áreas es k².",
            ejemplo: "Razón k=3: el área del triángulo mayor es 9 veces la del menor.",
            etiquetas: ["razón", "área", "semejanza"],
          },
        ],
        actividad_final: "Dos triángulos semejantes tienen lados de 3, 4, 5 cm y 6, 8, 10 cm respectivamente. Determina la razón de semejanza y la razón de sus áreas.",
      },
    },
    {
      titulo: "Completa los espacios — Criterios de congruencia y semejanza",
      descripcion: "Completa los enunciados sobre los criterios de congruencia y semejanza de triángulos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o valor correcto.",
        texto_con_huecos: "El criterio ___ (Lado-Lado-Lado) establece que dos triángulos con tres lados iguales son congruentes. El criterio ALA establece que si dos ___ y el lado comprendido son iguales, los triángulos son congruentes. En triángulos semejantes los lados son ___ (no necesariamente iguales). Si la razón de semejanza es 3, la razón de sus áreas es ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "LLL",
            alternativas_aceptadas: ["l-l-l", "lado-lado-lado"],
            pista: "Criterio de tres lados iguales: sus siglas son ___ .",
          },
          {
            posicion: 1,
            respuesta_correcta: "ángulos",
            alternativas_aceptadas: ["angulos"],
            pista: "ALA = Ángulo-Lado-Ángulo: dos ___ y el lado comprendido.",
          },
          {
            posicion: 2,
            respuesta_correcta: "proporcionales",
            alternativas_aceptadas: [],
            pista: "En semejanza los lados correspondientes guardan la misma razón: son ___ .",
          },
          {
            posicion: 3,
            respuesta_correcta: "9",
            alternativas_aceptadas: [],
            pista: "Razón de áreas = k² = 3² = ?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Semejanza y congruencia de triángulos",
      descripcion: "Reflexiona sobre tu comprensión de los criterios de congruencia y semejanza de triángulos.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo entre triángulos congruentes (misma forma y tamaño) y semejantes (misma forma, tamaños proporcionales).", escala: escala4 },
          { descripcion: "Aplico los criterios LLL, LAL y ALA para verificar la congruencia de triángulos.", escala: escala4 },
          { descripcion: "Determino si dos triángulos son semejantes y calculo la razón de semejanza.", escala: escala4 },
          { descripcion: "Calculo la razón de perímetros y áreas a partir de la razón de semejanza (k y k²).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿En qué situación práctica (arquitectura, mapas, planos) se aplica la semejanza de triángulos?",
      },
    },
  ],

  // ════════════ P06 — Relación álgebra-geometría: gráfica de cuadráticas (parábolas) ════════════
  [
    {
      titulo: "Verdadero o Falso — Parábolas y funciones cuadráticas",
      descripcion: "Decide si cada afirmación sobre la gráfica de funciones cuadráticas (parábolas), vértice, eje de simetría y ceros es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La gráfica de una función cuadrática f(x) = ax² + bx + c es siempre una parábola.",
            respuesta: true,
            retroalimentacion: "Correcto. Toda función cuadrática tiene como gráfica una parábola.",
          },
          {
            enunciado: "Si a > 0 en f(x) = ax² + bx + c, la parábola abre hacia arriba y tiene un mínimo.",
            respuesta: true,
            retroalimentacion: "Correcto. Con a > 0 la parábola es cóncava hacia arriba y el vértice es un mínimo.",
          },
          {
            enunciado: "El vértice de la parábola f(x) = ax² + bx + c tiene coordenada x igual a −b/(2a).",
            respuesta: true,
            retroalimentacion: "Correcto. La abscisa del vértice es x_v = −b/(2a) y la ordenada es f(x_v).",
          },
          {
            enunciado: "Los ceros de la función cuadrática son los valores de x donde la parábola intersecta el eje y (eje de las ordenadas).",
            respuesta: false,
            retroalimentacion: "Falso. Los ceros (o raíces) son donde la parábola intersecta el eje x (f(x)=0), no el eje y.",
          },
          {
            enunciado: "Si el discriminante Δ < 0, la parábola no intersecta al eje x y la función cuadrática no tiene ceros reales.",
            respuesta: true,
            retroalimentacion: "Correcto. Δ < 0 implica que no hay raíces reales, es decir, la parábola no toca el eje x.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Parábolas y funciones cuadráticas",
      descripcion: "Glosario interactivo sobre la relación álgebra-geometría en las funciones cuadráticas: vértice, eje de simetría, ceros y apertura.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Función cuadrática",
            definicion: "Función de la forma f(x) = ax² + bx + c (a ≠ 0). Su gráfica es una parábola.",
            ejemplo: "f(x) = x² − 4x + 3. Con a=1 > 0, la parábola abre hacia arriba.",
            etiquetas: ["función", "cuadrática"],
          },
          {
            termino: "Parábola",
            definicion: "Curva simétrica con forma de 'U' (o '∩') que es la gráfica de toda función cuadrática.",
            ejemplo: "f(x) = x² es la parábola más sencilla, con vértice en el origen.",
            etiquetas: ["gráfica", "geometría"],
          },
          {
            termino: "Vértice de la parábola",
            definicion: "Punto de máximo (a<0) o mínimo (a>0) de la parábola. Su abscisa es x_v = −b/(2a) y su ordenada es f(x_v).",
            ejemplo: "f(x)=x²−4x+3: x_v=4/2=2, y_v=4−8+3=−1. Vértice: (2, −1).",
            etiquetas: ["vértice", "máximo", "mínimo"],
          },
          {
            termino: "Eje de simetría",
            definicion: "Recta vertical x = −b/(2a) que divide la parábola en dos mitades simétricas.",
            ejemplo: "Para f(x)=x²−4x+3, el eje de simetría es la recta x=2.",
            etiquetas: ["simetría", "parábola"],
          },
          {
            termino: "Ceros (raíces) de la función",
            definicion: "Valores de x donde f(x) = 0; son los puntos donde la parábola cruza el eje x. Se obtienen resolviendo ax²+bx+c=0.",
            ejemplo: "f(x)=x²−4x+3=0 → (x−1)(x−3)=0 → ceros: x=1 y x=3.",
            etiquetas: ["ceros", "raíces", "eje x"],
          },
          {
            termino: "Intersección con el eje y",
            definicion: "El punto donde la parábola cruza el eje y se obtiene evaluando f(0) = c.",
            ejemplo: "f(x)=x²−4x+3: f(0)=3. La parábola cruza el eje y en (0, 3).",
            etiquetas: ["intersección", "eje y"],
          },
        ],
        actividad_final: "Para f(x) = x² − 6x + 8, determina: (a) el vértice, (b) el eje de simetría, (c) los ceros y (d) la intersección con el eje y. Luego esboza la gráfica.",
      },
    },
    {
      titulo: "Completa los espacios — Analizando una parábola",
      descripcion: "Completa los datos clave (vértice, eje de simetría, ceros) de una función cuadrática dada.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Para f(x) = x² − 4x + 3, completa los huecos con los valores correctos.",
        texto_con_huecos: "La función f(x) = x² − 4x + 3 tiene a = 1, b = −4, c = 3. La abscisa del vértice es x_v = −b/(2a) = ___. La ordenada del vértice es f(2) = 4 − 8 + 3 = ___. Los ceros se obtienen de (x−1)(x−3)=0: x = ___ y x = 3. La intersección con el eje y es el punto (0, ___).",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "2",
            alternativas_aceptadas: [],
            pista: "x_v = −(−4)/(2·1) = 4/2 = ?",
          },
          {
            posicion: 1,
            respuesta_correcta: "-1",
            alternativas_aceptadas: ["−1"],
            pista: "f(2) = (2)²−4(2)+3 = 4−8+3 = ?",
          },
          {
            posicion: 2,
            respuesta_correcta: "1",
            alternativas_aceptadas: [],
            pista: "(x−1)(x−3)=0 → x=___ o x=3.",
          },
          {
            posicion: 3,
            respuesta_correcta: "3",
            alternativas_aceptadas: [],
            pista: "f(0) = (0)²−4(0)+3 = ?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Parábolas y funciones cuadráticas",
      descripcion: "Reflexiona sobre tu comprensión de la relación entre las funciones cuadráticas y su representación gráfica (parábola).",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Identifico el vértice, eje de simetría y apertura de una parábola a partir de f(x)=ax²+bx+c.", escala: escala4 },
          { descripcion: "Calculo los ceros de la función cuadrática y los interpreto como puntos de corte con el eje x.", escala: escala4 },
          { descripcion: "Relaciono el discriminante con la cantidad de intersecciones de la parábola con el eje x.", escala: escala4 },
          { descripcion: "Esbozo la gráfica de una parábola usando vértice, ceros e intersección con el eje y.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cómo se conecta la parábola con la solución de la ecuación cuadrática? Explica con tus propias palabras.",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
