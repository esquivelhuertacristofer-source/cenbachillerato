/**
 * Seed del propósito formativo PM-V·O3 (numero=3) — hueco del re-alineamiento 2025.
 *
 *   Propósito formativo O3 (verbatim, contenido-2025.ts PM-V propositos[2]):
 *     "Revisa situaciones o fenómenos donde el cambio es la parte central en su
 *      estudio y aplica funciones de variable real para modelarlas e identificar
 *      simetrías en su representación gráfica."
 *   Contenido formativo C3 (verbatim, contenido-2025.ts PM-V contenidos[2]):
 *     "Funciones de variable real · Representación gráfica de funciones de variable
 *      real · Conceptos de continuidad, crecimiento, decrecimiento, máximos y
 *      mínimos · Desigualdades"
 *
 * Crea la progresión PM-V-P09 (numero=3) + 7 actividades, TODAS estado='borrador'
 * (regla: el contenido nuevo queda sin publicar hasta aprobación explícita).
 * La actividad A2 (ejercicio_matematico) lleva el laboratorio 3D "funciones-variable-real".
 *
 * Idempotente: upsert por "codigo". Recuenta uac.total_progresiones al final.
 *
 * Uso:
 *   npx tsx scripts/seed-pmv-o3-funciones.ts            (dry-run: solo describe)
 *   npx tsx scripts/seed-pmv-o3-funciones.ts --apply    (aplica los upserts)
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createSB, upsertActividad, type ActividadInput, type SB } from "./lib/activity-utils";

const UAC_CODIGO = "PM-V";
const PROG_CODIGO = "PM-V-P09";
const PROG_NUMERO = 3;
const LAB_SLUG = "funciones-variable-real";

const META = "Analice fenómenos donde el cambio es parte central de su estudio con la finalidad de encontrar soluciones óptimas a problemas o situaciones en su entorno u otras áreas del conocimiento.";

// Propósito y contenido VERBATIM (contenido-2025.ts PM-V)
const O3 = "Revisa situaciones o fenómenos donde el cambio es la parte central en su estudio y aplica funciones de variable real para modelarlas e identificar simetrías en su representación gráfica.";
const C3 = "Funciones de variable real Representación gráfica de funciones de variable real Conceptos de continuidad, crecimiento, decrecimiento, máximos y mínimos Desigualdades";

const PROGRESION = {
  codigo: PROG_CODIGO,
  numero: PROG_NUMERO,
  titulo: O3,
  descripcion: "Modela situaciones de cambio con funciones de variable real y lee su comportamiento en la gráfica: dominio y rango, continuidad, raíces e intersección con los ejes, crecimiento y decrecimiento, máximos y mínimos locales, y simetrías (funciones pares e impares).",
  descripcion_extendida: `${O3} Contenidos formativos: ${C3}.`,
  meta_aprendizaje: META,
  categoria: "Cálculo diferencial",
  subcategoria: "Funciones de variable real y simetría",
  ejes_articuladores: ["Pensamiento crítico"],
  transversalidades: [] as string[],
  tiempo_estimado_horas: 3,
};

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido"> & { estado: "borrador" };

const ACTIVIDADES: Act[] = [
  // ── A1 — LECTURA ──────────────────────────────────────────────────────────
  {
    titulo: "Funciones de variable real: la forma del cambio",
    descripcion: "Lee qué es una función de variable real, cómo se lee su gráfica y qué significa que sea par o impar.",
    tipo: "lectura",
    xp: 10,
    estado: "borrador",
    contenido: {
      texto:
        "Casi todo lo que estudiamos cambia: la posición de un balón en el aire, la temperatura a lo largo del día, el costo de un viaje según la distancia. Para estudiar el CAMBIO con precisión usamos FUNCIONES. Una FUNCIÓN DE VARIABLE REAL es una regla que asigna a cada número real x un único número real y = f(x). A x se le llama variable independiente (la que «movemos») y a y, variable dependiente (la que «responde»).\n\n" +
        "LA GRÁFICA. La forma más poderosa de entender una función es su REPRESENTACIÓN GRÁFICA: el conjunto de todos los puntos (x, f(x)) dibujados en el plano cartesiano. La gráfica convierte una fórmula en una imagen, y en esa imagen se leen de un vistazo todos los comportamientos de la función. Por ejemplo, la gráfica de f(x) = x² es una parábola; la de f(x) = x³, una curva que sube siempre con una «S» suave.\n\n" +
        "QUÉ SE LEE EN LA GRÁFICA. (1) Las RAÍCES o ceros: los valores de x donde la curva cruza el eje X, es decir, donde f(x) = 0. (2) La INTERSECCIÓN CON Y: el punto (0, f(0)) donde la curva corta el eje vertical. (3) El CRECIMIENTO y DECRECIMIENTO: la función crece donde la curva sube al avanzar en x y decrece donde baja. (4) Los MÁXIMOS y MÍNIMOS locales: las cumbres y los valles, los puntos donde la función deja de crecer y empieza a decrecer (máximo) o al revés (mínimo). (5) La CONTINUIDAD: una función es continua si su gráfica se puede dibujar sin levantar el lápiz; las rectas y las parábolas lo son.\n\n" +
        "SIMETRÍA: PARES E IMPARES. Muchas funciones tienen una simetría que ayuda a entenderlas y a graficarlas con menos trabajo. Una función es PAR si f(−x) = f(x): su gráfica es un ESPEJO respecto al eje Y. Lo que ocurre a la derecha se repite igual a la izquierda. Son pares f(x) = x², f(x) = |x| y f(x) = cos(x). Una función es IMPAR si f(−x) = −f(x): su gráfica gira 180° alrededor del ORIGEN; lo de la derecha aparece «de cabeza» a la izquierda. Son impares f(x) = x³, f(x) = 2x y f(x) = sen(x). Si no cumple ninguna de las dos condiciones, la función no tiene simetría (por ejemplo, f(x) = 2x + 1).\n\n" +
        "POR QUÉ IMPORTA. Distintas funciones modelan distintos cambios: una RECTA modela un ritmo constante (la tarifa de un taxi), una PARÁBOLA un tiro o un clavado, una función SENOIDAL un ciclo que se repite (la temperatura del día, las mareas). Reconocer la forma de la gráfica —y su simetría— permite predecir cómo se comportará el fenómeno y, sobre todo, encontrar sus valores óptimos: los máximos y mínimos. Ese es el corazón del cálculo diferencial que estudiarás este semestre.",
      fuente: "MCCEMS 2025 — Pensamiento Matemático V «Cálculo diferencial», contenido formativo: Funciones de variable real · Representación gráfica de funciones de variable real · Conceptos de continuidad, crecimiento, decrecimiento, máximos y mínimos · Desigualdades.",
      nivel_lectura: "intermedio",
      tiempo_estimado_minutos: 12,
      preguntas_comprension: [
        { pregunta: "¿Qué es una función de variable real y qué es su gráfica?", respuesta_guia: "Es una regla que asigna a cada número real x un único valor y = f(x); su gráfica es el conjunto de todos los puntos (x, f(x)) dibujados en el plano cartesiano." },
        { pregunta: "¿Qué se puede leer directamente en la gráfica de una función?", respuesta_guia: "Las raíces (cruces con X donde f(x)=0), la intersección con Y (0, f(0)), los tramos de crecimiento y decrecimiento, los máximos y mínimos locales, y la continuidad." },
        { pregunta: "¿Qué diferencia hay entre una función par y una impar?", respuesta_guia: "Una función par cumple f(−x)=f(x) y su gráfica es un espejo respecto al eje Y; una impar cumple f(−x)=−f(x) y su gráfica gira 180° alrededor del origen." },
      ],
    },
  },

  // ── A2 — EJERCICIO MATEMÁTICO (lleva el lab 3D) ───────────────────────────
  {
    titulo: "Analizando f(x) = x³ − 3x: simetría, raíces y extremos",
    descripcion: "Determina la simetría, las raíces y los máximos y mínimos de una función, y compruébalo en el laboratorio 3D.",
    tipo: "ejercicio_matematico",
    xp: 15,
    estado: "borrador",
    contenido: {
      instrucciones: "Resuelve a mano y comprueba en el laboratorio 3D: elige la función del catálogo, activa «Analizar simetría» para ver el reflejo y «Mostrar rasgos» para marcar las raíces, la intersección con Y y los máximos/mínimos.",
      problema:
        "Dada la función f(x) = x³ − 3x, analiza su gráfica:\n\n" +
        "a) SIMETRÍA. Calcula f(−x) y compáralo con f(x). ¿La función es par, impar o ninguna? ¿Qué simetría tiene su gráfica?\n\n" +
        "b) RAÍCES. Halla los valores de x para los que f(x) = 0 (dónde la curva cruza el eje X).\n\n" +
        "c) EXTREMOS. La función sube, baja y vuelve a subir. ¿Tiene máximos o mínimos locales y en qué puntos?",
      contexto: "Los tres incisos recorren el contenido formativo de la progresión: la simetría (a) con las funciones pares e impares, las raíces (b) con la lectura de la gráfica, y los extremos (c) con los máximos y mínimos locales. En el laboratorio 3D la función está en el catálogo y los rasgos y el reflejo se marcan en vivo sobre el plano cartesiano.",
      tipo_respuesta: "desarrollo",
      pasos_guia: [
        "a) f(−x) = (−x)³ − 3(−x) = −x³ + 3x = −(x³ − 3x) = −f(x). Como f(−x) = −f(x), la función es IMPAR: su gráfica es simétrica respecto al origen (gira 180° alrededor de (0,0)).",
        "b) x³ − 3x = x(x² − 3) = 0 ⇒ x = 0, o x² = 3 ⇒ x = ±√3 ≈ ±1.73. Tres raíces: −√3, 0 y √3.",
        "c) Derivando, f'(x) = 3x² − 3 = 0 ⇒ x = ±1. En x = −1 hay un MÁXIMO local en (−1, 2) y en x = 1 un MÍNIMO local en (1, −2).",
      ],
      respuesta_final: "a) Es IMPAR (f(−x) = −f(x)), simétrica respecto al origen. b) Raíces en −√3 ≈ −1.73, 0 y √3 ≈ 1.73. c) Máximo local (−1, 2) y mínimo local (1, −2).",
      unidades: "x e y son números reales (sin unidades)",
      tolerancia_error: 0.01,
    },
  },

  // ── A3 — REFLEXIÓN ESCRITA ────────────────────────────────────────────────
  {
    titulo: "El cambio que te rodea, modelado con funciones",
    descripcion: "Reflexiona sobre un fenómeno de cambio de tu entorno y descríbelo con la función que mejor lo modela.",
    tipo: "reflexion_escrita",
    xp: 20,
    estado: "borrador",
    contenido: {
      prompt:
        "Elige un fenómeno de tu entorno donde algo cambie y piensa qué tipo de función lo modela mejor (por ejemplo: la altura de un balón o de un clavadista en el tiempo → parábola; el costo de un viaje en taxi según la distancia → recta; la temperatura a lo largo del día o las mareas → función senoidal; el saldo de un ahorro semanal → recta). Describe el fenómeno, di qué representa la x y qué representa la y, indica qué forma tendría su gráfica y, si la tiene, qué simetría. Explica qué información útil podrías leer de esa gráfica (raíces, máximos, mínimos) y cómo lo comprobarías en el laboratorio 3D.",
      pistas: [
        "Clavado / tiro de un balón → parábola: sube, alcanza un máximo (la altura mayor) y baja.",
        "Tarifa de taxi o recibo de CFE → recta: parte de un valor fijo y crece a ritmo constante.",
        "Temperatura del día o mareas → senoidal: sube y baja en ciclos que se repiten.",
        "Pregúntate: ¿lo que ocurre a la derecha del cero se parece a lo de la izquierda? Eso es la simetría.",
      ],
      longitud_minima_palabras: 100,
      formato_esperado: "libre",
      criterios_evaluacion: [
        "Identifica un fenómeno de cambio real y la función que lo modela (recta, parábola, senoidal, etc.).",
        "Explica qué representan la variable independiente x y la dependiente y, y describe la forma de la gráfica y su simetría.",
        "Propone qué leería en la gráfica (raíces, máximos o mínimos) y cómo lo comprobaría en el laboratorio 3D.",
      ],
    },
  },

  // ── A4 — QUIZ VERDADERO / FALSO ───────────────────────────────────────────
  {
    titulo: "Verdadero o falso: funciones y simetría",
    descripcion: "Pon a prueba lo que entendiste sobre las funciones de variable real, sus rasgos y su simetría.",
    tipo: "quiz_verdadero_falso",
    xp: 10,
    estado: "borrador",
    contenido: {
      preguntas: [
        { enunciado: "Una función de variable real asigna a cada x un único valor y = f(x).", respuesta: true, retroalimentacion: "Correcto: a cada entrada x le corresponde una y solo una salida y; esa es la definición de función." },
        { enunciado: "Las raíces de una función son los puntos donde su gráfica cruza el eje Y.", respuesta: false, retroalimentacion: "Falso: las raíces son donde la gráfica cruza el eje X (f(x) = 0). El cruce con el eje Y es la intersección (0, f(0))." },
        { enunciado: "Una función es PAR si f(−x) = f(x); su gráfica es un espejo respecto al eje Y.", respuesta: true, retroalimentacion: "Correcto: x², |x| y cos(x) son pares y su gráfica es simétrica respecto al eje Y." },
        { enunciado: "Una función es IMPAR si f(−x) = −f(x); su gráfica es simétrica respecto al origen.", respuesta: true, retroalimentacion: "Correcto: x³, 2x y sen(x) son impares y su gráfica gira 180° alrededor del origen." },
        { enunciado: "La función f(x) = x³ − 3x es par.", respuesta: false, retroalimentacion: "Falso: f(−x) = −x³ + 3x = −f(x), así que es IMPAR (simétrica respecto al origen), no par." },
        { enunciado: "Un máximo local es un punto donde la función deja de crecer y empieza a decrecer.", respuesta: true, retroalimentacion: "Correcto: es una «cumbre» de la gráfica; entre un tramo creciente y uno decreciente hay un máximo local." },
      ],
    },
  },

  // ── A5 — GLOSARIO INTERACTIVO ─────────────────────────────────────────────
  {
    titulo: "Glosario: funciones de variable real",
    descripcion: "Términos clave para describir funciones, sus gráficas y sus simetrías.",
    tipo: "glosario_interactivo",
    xp: 15,
    estado: "borrador",
    contenido: {
      terminos: [
        { termino: "Función de variable real", definicion: "Regla que asigna a cada número real x un único número real y = f(x).", ejemplo: "f(x) = x² − 4 asigna a x = 3 el valor y = 5." },
        { termino: "Gráfica de una función", definicion: "Conjunto de todos los puntos (x, f(x)) dibujados en el plano cartesiano.", ejemplo: "La gráfica de f(x) = x² es una parábola." },
        { termino: "Raíz o cero", definicion: "Valor de x donde f(x) = 0; la gráfica cruza o toca el eje X.", ejemplo: "x² − 4 = 0 tiene raíces x = −2 y x = 2." },
        { termino: "Intersección con el eje Y", definicion: "El punto (0, f(0)) donde la gráfica corta el eje vertical.", ejemplo: "Para f(x) = x² − 4 es (0, −4)." },
        { termino: "Crecimiento / decrecimiento", definicion: "Tramo donde la función sube (crece) o baja (decrece) al avanzar en x.", ejemplo: "x² decrece para x < 0 y crece para x > 0." },
        { termino: "Máximo local", definicion: "Punto donde la función deja de crecer y empieza a decrecer (una cumbre).", ejemplo: "x³ − 3x tiene un máximo local en (−1, 2)." },
        { termino: "Mínimo local", definicion: "Punto donde la función deja de decrecer y empieza a crecer (un valle).", ejemplo: "x³ − 3x tiene un mínimo local en (1, −2)." },
        { termino: "Función par", definicion: "Cumple f(−x) = f(x); su gráfica es simétrica respecto al eje Y.", ejemplo: "x², |x| y cos(x) son pares." },
        { termino: "Función impar", definicion: "Cumple f(−x) = −f(x); su gráfica es simétrica respecto al origen.", ejemplo: "x³, 2x y sen(x) son impares." },
        { termino: "Continuidad", definicion: "Una función es continua si su gráfica se dibuja sin levantar el lápiz.", ejemplo: "Las parábolas y las rectas son continuas en todos los reales." },
      ],
      actividad_final: "Clasifica cada función como par, impar o ninguna y di una raíz suya: (1) f(x) = x²; (2) f(x) = x³; (3) f(x) = 2x + 1; (4) f(x) = cos(x). Justifica cada clasificación con f(−x).",
    },
  },

  // ── A6 — COMPLETAR ESPACIOS ───────────────────────────────────────────────
  {
    titulo: "Completa: funciones, gráficas y simetría",
    descripcion: "Completa el texto con los términos correctos sobre funciones de variable real.",
    tipo: "fill_blanks",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Arrastra o escribe la palabra correcta en cada espacio.",
      texto_con_huecos:
        "Una función de variable real asigna a cada x un único valor y = f(x). Su gráfica es el conjunto de puntos (x, f(x)) en el plano ___. Las ___ son los valores de x donde la curva cruza el eje X (f(x) = 0), y la intersección con Y es el punto (0, ___). La función ___ donde la curva sube y decrece donde baja; en una cumbre hay un ___ local. Una función es ___ si f(−x) = f(x) (espejo en el eje Y) e ___ si f(−x) = −f(x) (giro de 180° en el origen).",
      huecos: [
        { posicion: 0, respuesta_correcta: "cartesiano", alternativas_aceptadas: ["Cartesiano"] },
        { posicion: 1, respuesta_correcta: "raíces", alternativas_aceptadas: ["raices", "Raíces", "raíz", "raiz"] },
        { posicion: 2, respuesta_correcta: "f(0)", alternativas_aceptadas: ["f (0)"] },
        { posicion: 3, respuesta_correcta: "crece", alternativas_aceptadas: ["Crece"] },
        { posicion: 4, respuesta_correcta: "máximo", alternativas_aceptadas: ["maximo", "Máximo"] },
        { posicion: 5, respuesta_correcta: "par", alternativas_aceptadas: ["Par"] },
        { posicion: 6, respuesta_correcta: "impar", alternativas_aceptadas: ["Impar"] },
      ],
    },
  },

  // ── A7 — AUTOEVALUACIÓN ───────────────────────────────────────────────────
  {
    titulo: "¿Cómo voy con las funciones de variable real?",
    descripcion: "Evalúa tu propio dominio de los conceptos de esta progresión.",
    tipo: "autoevaluacion",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Marca con honestidad qué tan seguro te sientes en cada punto. No hay respuestas correctas: te sirve para saber qué repasar.",
      criterios: [
        {
          descripcion: "Entiendo qué es una función de variable real y reconozco su gráfica en el plano cartesiano.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Localizo en la gráfica las raíces, la intersección con Y y los tramos de crecimiento y decrecimiento.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Identifico los máximos y mínimos locales de una función a partir de su gráfica.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Determino si una función es par, impar o ninguna usando f(−x) y su simetría en la gráfica.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
      ],
      reflexion_final_prompt: "¿Qué idea sobre las funciones o su simetría te costó más entender y cómo podrías repasarla con un ejemplo de tu entorno?",
    },
  },
];

async function recontarProgresiones(sb: SB, uacId: string): Promise<number> {
  const { count, error } = await sb
    .from("progresiones")
    .select("id", { count: "exact", head: true })
    .eq("uac_id", uacId);
  if (error) throw new Error(`Error contando progresiones: ${error.message}`);
  return count ?? 0;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const sb = createSB();

  console.log(`\n🌱 PM-V·O3 — Funciones de variable real y simetría  (${apply ? "APLICAR" : "DRY-RUN"})\n`);

  // UAC
  const { data: uac, error: uacErr } = await sb.from("uac").select("id, total_progresiones").eq("codigo", UAC_CODIGO).single();
  if (uacErr || !uac) throw new Error(`UAC ${UAC_CODIGO} no encontrada: ${uacErr?.message}`);

  // ¿numero=3 libre? (no debe existir otra progresión con ese numero)
  const { data: choque } = await sb.from("progresiones").select("codigo").eq("uac_id", uac.id).eq("numero", PROG_NUMERO).maybeSingle();
  if (choque && choque.codigo !== PROG_CODIGO) {
    throw new Error(`numero=${PROG_NUMERO} ya está ocupado por ${choque.codigo} — abortado para no chocar.`);
  }

  console.log(`Progresión ${PROG_CODIGO} (numero=${PROG_NUMERO}) — categoria "${PROGRESION.categoria}"`);
  console.log(`  titulo (O3 verbatim): ${PROGRESION.titulo}`);
  console.log(`Actividades (todas estado='borrador'):`);
  for (let i = 0; i < ACTIVIDADES.length; i++) {
    const a = ACTIVIDADES[i]!;
    const cod = `${PROG_CODIGO}-A${i + 1}`;
    const lab = a.tipo === "ejercicio_matematico" ? `  ← lab "${LAB_SLUG}"` : "";
    console.log(`  ${cod} | ${a.tipo} | xp${a.xp} | ${a.titulo}${lab}`);
  }

  if (!apply) {
    console.log("\n(DRY-RUN) No se escribió nada. Repite con --apply para aplicar.\n");
    return;
  }

  // 1) progresión
  const { error: pErr } = await sb.from("progresiones").upsert({
    codigo: PROGRESION.codigo,
    uac_id: uac.id,
    numero: PROGRESION.numero,
    titulo: PROGRESION.titulo,
    descripcion: PROGRESION.descripcion,
    meta_aprendizaje: PROGRESION.meta_aprendizaje,
    categoria: PROGRESION.categoria,
    subcategoria: PROGRESION.subcategoria,
    descripcion_extendida: PROGRESION.descripcion_extendida,
    ejes_articuladores: PROGRESION.ejes_articuladores,
    transversalidades: PROGRESION.transversalidades,
    tiempo_estimado_horas: PROGRESION.tiempo_estimado_horas,
    es_placeholder: false,
  }, { onConflict: "codigo" });
  if (pErr) throw new Error(`Error upsert progresión: ${pErr.message}`);
  console.log(`\n  ✓ progresión ${PROG_CODIGO}`);

  // id de la progresión recién upserteada
  const { data: prog, error: gErr } = await sb.from("progresiones").select("id").eq("codigo", PROG_CODIGO).single();
  if (gErr || !prog) throw new Error(`No se pudo releer la progresión: ${gErr?.message}`);

  // 2) actividades
  let ok = 0;
  for (let i = 0; i < ACTIVIDADES.length; i++) {
    const a = ACTIVIDADES[i]!;
    const exito = await upsertActividad(sb, {
      codigo: `${PROG_CODIGO}-A${i + 1}`,
      titulo: a.titulo,
      descripcion: a.descripcion,
      tipo: a.tipo,
      contenido: a.contenido,
      progresion_id: prog.id,
      xp: a.xp,
      estado: a.estado,
    });
    if (exito) ok++;
  }
  console.log(`\n  ${ok}/${ACTIVIDADES.length} actividades upserteadas`);
  if (ok !== ACTIVIDADES.length) throw new Error("Alguna actividad falló validación — revisa el log.");

  // 3) asociar el laboratorio a A2
  const A2 = `${PROG_CODIGO}-A2`;
  const { error: labErr } = await sb.from("actividades").update({ practica_slug: LAB_SLUG }).eq("codigo", A2);
  if (labErr) throw new Error(`Error asociando lab a ${A2}: ${labErr.message}`);
  console.log(`  ✓ lab "${LAB_SLUG}" asociado a ${A2}`);

  // 4) recontar total_progresiones
  const total = await recontarProgresiones(sb, uac.id);
  const { error: uErr } = await sb.from("uac").update({ total_progresiones: total }).eq("id", uac.id);
  if (uErr) throw new Error(`Error actualizando total_progresiones: ${uErr.message}`);
  console.log(`  ✓ uac.total_progresiones = ${total} (antes ${uac.total_progresiones})`);

  console.log(`\n✅ PM-V·O3 sembrado (borrador). Ruta práctica:`);
  console.log(`   http://localhost:3000/hub/uac/${UAC_CODIGO}/progresion/${PROG_NUMERO}/actividad/2/practica\n`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e.message); process.exit(1); });
