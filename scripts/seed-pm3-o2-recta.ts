/**
 * Seed del propósito formativo PM-III·O2 (numero=2) — hueco del re-alineamiento 2025.
 *
 *   Propósito formativo O2 (verbatim, contenido-2025.ts PM-III propositos[1]):
 *     "Aplica la aritmética y el manejo del álgebra para resolver ecuaciones
 *      lineales con dos incógnitas que refieran a situaciones de interés."
 *   Contenido formativo C2 (verbatim, contenido-2025.ts PM-III contenidos[1]):
 *     "Ecuaciones lineales con dos incógnitas · Procedimiento para solucionar
 *      ecuaciones lineales con dos incógnitas · Ecuación de la recta · Concepto
 *      de plano cartesiano: ejes perpendiculares: horizontal (X) y vertical (Y)
 *      · Representación gráfica de la ecuación de la recta"
 *
 * Crea la progresión PM-III-P10 (numero=2) + 7 actividades, TODAS estado='borrador'
 * (regla: el contenido nuevo queda sin publicar hasta aprobación explícita).
 * La actividad A2 (ejercicio_matematico) lleva el laboratorio 3D "ecuacion-recta".
 *
 * Idempotente: upsert por "codigo". Recuenta uac.total_progresiones al final.
 *
 * Uso:
 *   npx tsx scripts/seed-pm3-o2-recta.ts            (dry-run: solo describe)
 *   npx tsx scripts/seed-pm3-o2-recta.ts --apply    (aplica los upserts)
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createSB, upsertActividad, type ActividadInput, type SB } from "./lib/activity-utils";

const UAC_CODIGO = "PM-III";
const PROG_CODIGO = "PM-III-P10";
const PROG_NUMERO = 2;
const LAB_SLUG = "ecuacion-recta";

const META = "Aplique el lenguaje algebraico como herramienta para describir situaciones de la realidad y expresar relaciones matemáticas, y mediante procesos de intuición y razonamiento, logre explicar y resolver problemas.";

// Propósito y contenido VERBATIM (contenido-2025.ts PM-III)
const O2 = "Aplica la aritmética y el manejo del álgebra para resolver ecuaciones lineales con dos incógnitas que refieran a situaciones de interés.";
const C2 = "Ecuaciones lineales con dos incógnitas Procedimiento para solucionar ecuaciones lineales con dos incógnitas Ecuación de la recta Concepto de plano cartesiano: ejes perpendiculares: horizontal (X) y vertical (Y) Representación gráfica de la ecuación de la recta";

const PROGRESION = {
  codigo: PROG_CODIGO,
  numero: PROG_NUMERO,
  titulo: O2,
  descripcion: "Resuelve ecuaciones lineales con dos incógnitas y representa la ecuación de la recta en el plano cartesiano.",
  descripcion_extendida: `${O2} Contenidos formativos: ${C2}.`,
  meta_aprendizaje: META,
  categoria: "Ecuación de la recta",
  subcategoria: "Ecuaciones lineales con dos incógnitas",
  ejes_articuladores: ["Pensamiento matemático y científico", "Resolución de problemas"],
  transversalidades: [] as string[],
  tiempo_estimado_horas: 3,
};

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido"> & { estado: "borrador" };

const ACTIVIDADES: Act[] = [
  // ── A1 — LECTURA ──────────────────────────────────────────────────────────
  {
    titulo: "Una ecuación, dos incógnitas: la recta en el plano",
    descripcion: "Lee cómo una ecuación lineal con dos incógnitas se representa como una recta en el plano cartesiano.",
    tipo: "lectura",
    xp: 10,
    estado: "borrador",
    contenido: {
      texto:
        "Hasta ahora resolviste ecuaciones lineales con UNA incógnita, como 2x + 3 = 11, que tienen una sola respuesta (x = 4). Pero muchas situaciones de la vida relacionan DOS cantidades que cambian juntas: el costo de un viaje en taxi según los kilómetros, el recibo de luz de CFE según el consumo, o el saldo de un ahorro según las semanas. Estas se modelan con una ECUACIÓN LINEAL CON DOS INCÓGNITAS, que suele escribirse en la forma pendiente–ordenada y = m·x + b.\n\n" +
        "En esta forma, x e y son las dos incógnitas, y cada número tiene un significado:\n" +
        "• La PENDIENTE (m) es la inclinación: dice cuánto cambia y por cada unidad que aumenta x. Si m > 0 la relación crece, si m < 0 decrece y si m = 0 se mantiene constante.\n" +
        "• La ORDENADA AL ORIGEN (b) es el valor de y cuando x = 0: el punto de partida.\n\n" +
        "Lo nuevo —y lo importante— es que una ecuación con dos incógnitas NO tiene una sola solución, sino INFINITAS: cada pareja de valores (x, y) que cumple la ecuación es una solución. Por ejemplo, en y = 2x + 1, las parejas (0, 1), (1, 3) y (2, 5) son todas soluciones.\n\n" +
        "Para verlas todas a la vez usamos el PLANO CARTESIANO: dos rectas numéricas perpendiculares que se cruzan en el origen (0, 0). La horizontal es el eje X y la vertical el eje Y; dividen el plano en cuatro cuadrantes. Cada punto se nombra con un par ordenado (x, y): primero cuánto a la derecha o izquierda, luego cuánto arriba o abajo. Si dibujamos TODAS las soluciones de la ecuación, los puntos se alinean formando una RECTA. Por eso decimos que la gráfica de y = m·x + b es una recta: representarla es, simplemente, dibujar todas sus soluciones a la vez.",
      fuente: "MCCEMS 2025 — Pensamiento Matemático III, contenido formativo: Ecuaciones lineales con dos incógnitas · Ecuación de la recta · Plano cartesiano.",
      nivel_lectura: "intermedio",
      tiempo_estimado_minutos: 10,
      preguntas_comprension: [
        { pregunta: "¿Por qué una ecuación lineal con dos incógnitas tiene infinitas soluciones?", respuesta_guia: "Porque cada pareja (x, y) que cumple la ecuación es una solución, y hay infinitas parejas: todas las que caen sobre la recta." },
        { pregunta: "¿Qué representa la ordenada al origen b en la forma y = m·x + b?", respuesta_guia: "El valor de y cuando x = 0, es decir, el punto donde la recta cruza el eje Y: el punto de partida." },
        { pregunta: "¿Cómo se llaman los dos ejes del plano cartesiano y dónde se cruzan?", respuesta_guia: "El eje horizontal X y el eje vertical Y; son perpendiculares y se cruzan en el origen (0, 0)." },
      ],
    },
  },

  // ── A2 — EJERCICIO MATEMÁTICO (lleva el lab 3D) ───────────────────────────
  {
    titulo: "Grafico la ecuación de la recta y sus soluciones",
    descripcion: "Construye la recta y = m·x + b, identifica su pendiente, su ordenada al origen y varias de sus soluciones, y modela la tarifa de un taxi.",
    tipo: "ejercicio_matematico",
    xp: 15,
    estado: "borrador",
    contenido: {
      instrucciones: "Resuelve a mano y comprueba moviendo la pendiente m y la ordenada b en el laboratorio 3D. Apóyate en el triángulo de pendiente y en los puntos de solución que aparecen sobre la recta.",
      problema:
        "La tarifa de un taxi de la Ciudad de México se modela como una ecuación lineal con dos incógnitas: el costo y (en pesos) en función de la distancia x (en cientos de metros) es y = 1.07·x + 8.74.\n\n" +
        "a) ¿Cuál es la ordenada al origen y qué significa en este contexto?\n" +
        "b) ¿Cuál es la pendiente y qué significa?\n" +
        "c) Calcula el costo de un viaje de 3 km (x = 30).\n" +
        "d) Da otras dos soluciones (x, y) de la ecuación distintas de la anterior.\n" +
        "e) Explica por qué esta ecuación tiene infinitas soluciones y cómo se ven todas juntas en el plano cartesiano.",
      contexto: "La forma y = m·x + b separa lo fijo (la ordenada b, el banderazo) de lo variable (la pendiente m, el costo por distancia). Cada punto de la recta es una pareja distancia–costo posible.",
      tipo_respuesta: "desarrollo",
      pasos_guia: [
        "a) La ordenada al origen es b = 8.74: es el costo cuando x = 0 (sin avanzar), es decir, el banderazo de $8.74.",
        "b) La pendiente es m = 1.07: por cada 100 m recorridos (cada unidad de x) el costo sube $1.07.",
        "c) y = 1.07·(30) + 8.74 = 32.10 + 8.74 = $40.84.",
        "d) Por ejemplo (10, 19.44) y (50, 62.24): sustituye x en la ecuación y obtén y. Cualquier x da una solución.",
        "e) Porque a cada valor de x le corresponde un valor de y; hay infinitas parejas (x, y). Dibujadas en el plano cartesiano, todas se alinean formando la recta de la ecuación.",
      ],
      respuesta_final: "b = 8.74 (banderazo); m = 1.07 ($/100 m); viaje de 3 km: y = $40.84; infinitas soluciones = todos los puntos de la recta.",
      unidades: "pesos (y), cientos de metros (x)",
      tolerancia_error: 0.01,
    },
  },

  // ── A3 — REFLEXIÓN ESCRITA ────────────────────────────────────────────────
  {
    titulo: "El significado de la pendiente y la ordenada",
    descripcion: "Reflexiona sobre lo que la pendiente y la ordenada al origen dicen de una situación real.",
    tipo: "reflexion_escrita",
    xp: 20,
    estado: "borrador",
    contenido: {
      prompt:
        "Elige una situación de tu vida que se pueda modelar con una recta y = m·x + b (por ejemplo: el saldo de tu recarga de datos según los días, el costo de copias según cuántas saques, o lo que ahorras cada semana). Identifica qué representa la pendiente m y qué representa la ordenada al origen b en tu caso, y explica por qué la relación tiene infinitas soluciones. ¿Cómo cambiaría la recta si la pendiente fuera mayor? ¿Y si la ordenada fuera negativa?",
      pistas: [
        "La ordenada b es el valor de partida (cuando x = 0): lo fijo.",
        "La pendiente m es el ritmo de cambio: cuánto sube o baja por cada unidad de x.",
        "Una pendiente mayor inclina más la recta; cambiar b la sube o la baja sin girarla.",
      ],
      longitud_minima_palabras: 100,
      formato_esperado: "libre",
      criterios_evaluacion: [
        "Identifica correctamente qué representan m y b en su situación.",
        "Explica por qué la relación tiene infinitas soluciones.",
        "Describe cómo cambia la recta al variar la pendiente y la ordenada.",
      ],
    },
  },

  // ── A4 — QUIZ VERDADERO / FALSO ───────────────────────────────────────────
  {
    titulo: "Verdadero o falso: rectas en el plano",
    descripcion: "Pon a prueba lo que entendiste sobre la ecuación de la recta y el plano cartesiano.",
    tipo: "quiz_verdadero_falso",
    xp: 10,
    estado: "borrador",
    contenido: {
      preguntas: [
        { enunciado: "Una ecuación lineal con dos incógnitas tiene una sola solución.", respuesta: false, retroalimentacion: "Tiene infinitas soluciones: cada pareja (x, y) que cumple la ecuación, es decir, todos los puntos de la recta." },
        { enunciado: "En y = m·x + b, la ordenada al origen b es el valor de y cuando x = 0.", respuesta: true, retroalimentacion: "Correcto: es el punto (0, b) donde la recta cruza el eje Y." },
        { enunciado: "Si la pendiente es negativa, la recta baja de izquierda a derecha.", respuesta: true, retroalimentacion: "Correcto: m < 0 significa que y disminuye cuando x aumenta, así que la recta desciende." },
        { enunciado: "Los ejes del plano cartesiano son paralelos entre sí.", respuesta: false, retroalimentacion: "Son perpendiculares: el eje X (horizontal) y el eje Y (vertical) forman un ángulo de 90° y se cruzan en el origen." },
        { enunciado: "Una recta horizontal (m = 0) siempre cruza el eje X.", respuesta: false, retroalimentacion: "Si m = 0 la recta es y = b; solo cruza el eje X si b = 0. En otro caso es paralela al eje X y no lo toca." },
      ],
    },
  },

  // ── A5 — GLOSARIO INTERACTIVO ─────────────────────────────────────────────
  {
    titulo: "Glosario: la recta y el plano cartesiano",
    descripcion: "Términos clave para hablar de ecuaciones lineales con dos incógnitas y su gráfica.",
    tipo: "glosario_interactivo",
    xp: 15,
    estado: "borrador",
    contenido: {
      terminos: [
        { termino: "Ecuación lineal con dos incógnitas", definicion: "Igualdad que relaciona dos variables (x, y) elevadas a la potencia 1, por ejemplo y = m·x + b. Su gráfica es una recta.", ejemplo: "y = 2x + 1, o de forma equivalente −2x + y = 1." },
        { termino: "Plano cartesiano", definicion: "Sistema de dos ejes numéricos perpendiculares (X horizontal, Y vertical) que se cruzan en el origen y permiten ubicar puntos con pares ordenados (x, y).", ejemplo: "El punto (3, −2) está 3 a la derecha y 2 abajo del origen." },
        { termino: "Pendiente (m)", definicion: "Inclinación de la recta: cuánto cambia y por cada unidad que aumenta x (m = subida ÷ avance). Positiva sube, negativa baja, cero es horizontal.", ejemplo: "En y = 0.5x + 1, m = 0.5: por cada paso en x, y sube media unidad." },
        { termino: "Ordenada al origen (b)", definicion: "Valor de y cuando x = 0; el punto (0, b) donde la recta cruza el eje Y.", ejemplo: "En y = 0.5x + 1, b = 1: la recta cruza el eje Y en (0, 1)." },
        { termino: "Raíz (cero) de la recta", definicion: "Valor de x donde y = 0, es decir, el punto donde la recta cruza el eje X: x = −b/m.", ejemplo: "En y = 2x + 4, la raíz es x = −2: la recta cruza X en (−2, 0)." },
        { termino: "Solución de la ecuación", definicion: "Cualquier pareja (x, y) que cumple la ecuación. Una ecuación con dos incógnitas tiene infinitas: todos los puntos de su recta.", ejemplo: "(0, 1), (1, 3) y (2, 5) son soluciones de y = 2x + 1." },
      ],
      actividad_final: "Dibuja en tu cuaderno los ejes del plano cartesiano y marca la ordenada al origen, la raíz y tres soluciones de la recta y = x − 2.",
    },
  },

  // ── A6 — COMPLETAR ESPACIOS ───────────────────────────────────────────────
  {
    titulo: "Completa: las partes de la recta",
    descripcion: "Completa el texto con los términos correctos sobre la ecuación de la recta.",
    tipo: "fill_blanks",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Arrastra o escribe la palabra correcta en cada espacio.",
      texto_con_huecos:
        "En la forma y = m·x + b, la letra m es la ___ y dice cuánto sube o baja la recta por cada unidad de x. La letra b es la ___ al origen: el punto donde la recta cruza el eje ___. El punto donde la recta cruza el eje X se llama ___. Como cada pareja (x, y) que cumple la ecuación es una solución, una ecuación con dos incógnitas tiene ___ soluciones.",
      huecos: [
        { posicion: 0, respuesta_correcta: "pendiente", alternativas_aceptadas: ["inclinación"] },
        { posicion: 1, respuesta_correcta: "ordenada", alternativas_aceptadas: ["ordenada al origen"] },
        { posicion: 2, respuesta_correcta: "Y", alternativas_aceptadas: ["y", "vertical"] },
        { posicion: 3, respuesta_correcta: "raíz", alternativas_aceptadas: ["cero", "raiz"] },
        { posicion: 4, respuesta_correcta: "infinitas", alternativas_aceptadas: ["muchas"] },
      ],
    },
  },

  // ── A7 — AUTOEVALUACIÓN ───────────────────────────────────────────────────
  {
    titulo: "¿Cómo voy con la ecuación de la recta?",
    descripcion: "Evalúa tu propio dominio de los conceptos de esta progresión.",
    tipo: "autoevaluacion",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Marca con honestidad qué tan seguro te sientes en cada punto. No hay respuestas correctas: te sirve para saber qué repasar.",
      criterios: [
        {
          descripcion: "Identifico la pendiente y la ordenada al origen en una ecuación y = m·x + b.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Ubico puntos (x, y) en el plano cartesiano y reconozco sus cuadrantes.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Explico por qué una ecuación con dos incógnitas tiene infinitas soluciones.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Modelo una situación real (como una tarifa) con una ecuación de la recta.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
      ],
      reflexion_final_prompt: "¿Qué concepto de esta progresión te costó más y cómo podrías repasarlo?",
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

  console.log(`\n🌱 PM-III·O2 — Ecuación de la recta  (${apply ? "APLICAR" : "DRY-RUN"})\n`);

  // UAC
  const { data: uac, error: uacErr } = await sb.from("uac").select("id, total_progresiones").eq("codigo", UAC_CODIGO).single();
  if (uacErr || !uac) throw new Error(`UAC ${UAC_CODIGO} no encontrada: ${uacErr?.message}`);

  // ¿numero=2 libre? (no debe existir otra progresión con ese numero)
  const { data: choque } = await sb.from("progresiones").select("codigo").eq("uac_id", uac.id).eq("numero", PROG_NUMERO).maybeSingle();
  if (choque && choque.codigo !== PROG_CODIGO) {
    throw new Error(`numero=${PROG_NUMERO} ya está ocupado por ${choque.codigo} — abortado para no chocar.`);
  }

  console.log(`Progresión ${PROG_CODIGO} (numero=${PROG_NUMERO}) — categoria "${PROGRESION.categoria}"`);
  console.log(`  titulo (O2 verbatim): ${PROGRESION.titulo}`);
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

  console.log(`\n✅ PM-III·O2 sembrado (borrador). Ruta práctica:`);
  console.log(`   http://localhost:3000/hub/uac/${UAC_CODIGO}/progresion/${PROG_NUMERO}/actividad/2/practica\n`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e.message); process.exit(1); });
