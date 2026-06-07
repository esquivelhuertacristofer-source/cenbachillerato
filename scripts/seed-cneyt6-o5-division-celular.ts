/**
 * Seed del propósito formativo CNEYT-VI·O5 (numero=5) — hueco del re-alineamiento 2025.
 *
 *   Propósito formativo O5 (verbatim, contenido-2025.ts CNEYT-VI propositos[4]):
 *     "Identifica las fases de la mitosis y la meiosis para comprender su
 *      importancia como mecanismos de reproducción celular, y reconocer los
 *      procesos fundamentales de la división celular, así como las situaciones
 *      de interés en donde está implicada."
 *   Contenido formativo C5 (verbatim, contenido-2025.ts CNEYT-VI contenidos[4]):
 *     "Fases e importancia de la mitosis · Fases e importancia de la meiosis ·
 *      Importancia de la recombinación genética como factor de biodiversidad ·
 *      Procesos fundamentales de la división celular y situaciones de interés
 *      en donde la reproducción celular está implicada"
 *
 * Crea la progresión CNEYT-VI-P09 (numero=5) + 7 actividades, TODAS estado='borrador'
 * (regla: el contenido nuevo queda sin publicar hasta aprobación explícita).
 * La actividad A2 (ejercicio_matematico) lleva el laboratorio 3D "division-celular".
 *
 * Idempotente: upsert por "codigo". Recuenta uac.total_progresiones al final.
 *
 * Uso:
 *   npx tsx scripts/seed-cneyt6-o5-division-celular.ts            (dry-run: solo describe)
 *   npx tsx scripts/seed-cneyt6-o5-division-celular.ts --apply    (aplica los upserts)
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createSB, upsertActividad, type ActividadInput, type SB } from "./lib/activity-utils";

const UAC_CODIGO = "CNEYT-VI";
const PROG_CODIGO = "CNEYT-VI-P09";
const PROG_NUMERO = 5;
const LAB_SLUG = "division-celular";

const META = "Comprenda los rasgos que caracterizan a los seres vivos al explorar el origen de la vida, la organización celular, la transmisión de la información genética y los mecanismos de la evolución biológica.";

// Propósito y contenido VERBATIM (contenido-2025.ts CNEYT-VI)
const O5 = "Identifica las fases de la mitosis y la meiosis para comprender su importancia como mecanismos de reproducción celular, y reconocer los procesos fundamentales de la división celular, así como las situaciones de interés en donde está implicada.";
const C5 = "Fases e importancia de la mitosis Fases e importancia de la meiosis Importancia de la recombinación genética como factor de biodiversidad Procesos fundamentales de la división celular y situaciones de interés en donde la reproducción celular está implicada";

const PROGRESION = {
  codigo: PROG_CODIGO,
  numero: PROG_NUMERO,
  titulo: O5,
  descripcion: "Recorre fase por fase la mitosis y la meiosis: por qué la mitosis produce dos células idénticas (crecer, reparar) y la meiosis cuatro células haploides distintas (gametos), y cómo la recombinación genética sostiene la biodiversidad.",
  descripcion_extendida: `${O5} Contenidos formativos: ${C5}.`,
  meta_aprendizaje: META,
  categoria: "Mitosis y meiosis",
  subcategoria: "División celular y recombinación genética",
  ejes_articuladores: ["Pensamiento crítico", "Sustentabilidad"],
  transversalidades: [] as string[],
  tiempo_estimado_horas: 3,
};

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido"> & { estado: "borrador" };

const ACTIVIDADES: Act[] = [
  // ── A1 — LECTURA ──────────────────────────────────────────────────────────
  {
    titulo: "Mitosis y meiosis: cómo una célula se convierte en dos (o en cuatro)",
    descripcion: "Lee en qué se parecen y en qué se diferencian las dos formas de dividirse una célula, y por qué una produce clones y la otra, diversidad.",
    tipo: "lectura",
    xp: 10,
    estado: "borrador",
    contenido: {
      texto:
        "Toda célula proviene de otra célula. Para crecer, sanar una herida o producir descendencia, los seres vivos necesitan que sus células se dividan; pero NO todas las divisiones son iguales. Existen dos grandes mecanismos: la MITOSIS y la MEIOSIS. Ambos comienzan igual —con una célula que primero DUPLICA su ADN en la interfase—, pero terminan de manera muy distinta.\n\n" +
        "RECORDATORIO: PLOIDÍA. Las células de tu cuerpo son DIPLOIDES (2n): tienen dos juegos completos de cromosomas, uno heredado de tu madre y otro de tu padre. En el ser humano, 2n = 46 (23 pares de homólogos). Los gametos —óvulos y espermatozoides— son HAPLOIDES (n): tienen un solo juego, n = 23.\n\n" +
        "MITOSIS (una división → 2 células idénticas). Tras duplicar el ADN, la célula pasa por Profase (los cromosomas se condensan en forma de X, cada uno con dos cromátidas hermanas), Metafase (los cromosomas se alinean en UNA fila en el ecuador), Anafase (las cromátidas hermanas se separan hacia polos opuestos), Telofase y Citocinesis (el citoplasma se divide). Resultado: 2 células hijas genéticamente IDÉNTICAS entre sí y a la madre (2n → 2n). La mitosis sirve para crecer, reparar tejidos y regenerar; es también la base de la reproducción asexual.\n\n" +
        "MEIOSIS (dos divisiones → 4 células distintas). La meiosis hace DOS divisiones seguidas sin volver a duplicar el ADN. En la Profase I los cromosomas homólogos se aparean y ocurre el CROSSING OVER: intercambian fragmentos de ADN. En la Anafase I se separan los homólogos COMPLETOS (división reduccional): de aquí salen dos células haploides. En la segunda división (Anafase II) se separan las cromátidas hermanas, como en una mitosis. Resultado: 4 células haploides (2n → n), todas genéticamente DISTINTAS. La meiosis produce los gametos de la reproducción sexual.\n\n" +
        "POR QUÉ IMPORTA LA RECOMBINACIÓN. El crossing over y la distribución INDEPENDIENTE de los homólogos (que se acomodan al azar en la Metafase I) hacen que cada gameto sea único. Por eso ningún hermano es idéntico a otro (salvo gemelos idénticos) y por eso las poblaciones tienen VARIABILIDAD genética, la materia prima de la evolución y el sustento de la biodiversidad. Cuando dos gametos se unen en la fecundación (n + n), se restaura el número diploide 2n de la especie: la meiosis evita que el número de cromosomas se duplique en cada generación.\n\n" +
        "SITUACIONES DE INTERÉS. El control de la mitosis es vital: cuando falla y las células se dividen sin parar, surge el CÁNCER. Un error al repartir cromosomas en la meiosis (no disyunción) produce gametos con cromosomas de más o de menos, origen de condiciones como la trisomía 21. Entender estas divisiones es clave en medicina, agricultura y conservación.",
      fuente: "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología VI, contenido formativo: Fases e importancia de la mitosis · Fases e importancia de la meiosis · Importancia de la recombinación genética como factor de biodiversidad · Procesos fundamentales de la división celular.",
      nivel_lectura: "intermedio",
      tiempo_estimado_minutos: 12,
      preguntas_comprension: [
        { pregunta: "¿En qué se parecen el inicio de la mitosis y el de la meiosis?", respuesta_guia: "En ambos la célula duplica primero su ADN (interfase), de modo que cada cromosoma queda con dos cromátidas hermanas." },
        { pregunta: "¿Por qué la meiosis reduce a la mitad el número de cromosomas y la mitosis no?", respuesta_guia: "Porque la meiosis hace DOS divisiones tras una sola duplicación del ADN; en la Anafase I se separan los homólogos (división reduccional), dejando células haploides." },
        { pregunta: "¿Cómo contribuye la meiosis a la biodiversidad?", respuesta_guia: "Por el crossing over y la distribución independiente de los homólogos, que generan combinaciones genéticas únicas en cada gameto (recombinación)." },
      ],
    },
  },

  // ── A2 — EJERCICIO MATEMÁTICO (lleva el lab 3D) ───────────────────────────
  {
    titulo: "Analizando la división celular",
    descripcion: "Cuenta células hijas y cromosomas en la mitosis y la meiosis, calcula las combinaciones por distribución independiente (2ⁿ) y compruébalo en el laboratorio 3D.",
    tipo: "ejercicio_matematico",
    xp: 15,
    estado: "borrador",
    contenido: {
      instrucciones: "Resuelve a mano y comprueba recorriendo las fases y usando la calculadora del laboratorio 3D (escribe el 2n de la célula madre y compara mitosis vs. meiosis).",
      problema:
        "Trabaja con una célula somática humana de 2n = 46 cromosomas.\n\n" +
        "a) MITOSIS. Si esta célula se divide por mitosis, ¿cuántas células hijas se obtienen y con cuántos cromosomas cada una? ¿Son iguales o distintas a la madre?\n\n" +
        "b) MEIOSIS. Si en cambio entra en meiosis, ¿cuántas células hijas se obtienen y con cuántos cromosomas cada una? ¿Diploides o haploides?\n\n" +
        "c) RECOMBINACIÓN. Sin contar el crossing over, ¿cuántas combinaciones distintas de cromosomas puede generar la distribución independiente de los 23 pares? ¿Y cuántas células tendrías tras 3 rondas seguidas de mitosis a partir de una sola célula?",
      contexto: "Los tres incisos recorren el contenido formativo de la progresión: fases e importancia de la mitosis (a), de la meiosis (b) y la recombinación como factor de biodiversidad (c). En el laboratorio 3D cada proceso es un modo y la calculadora da estos números para cualquier 2n.",
      tipo_respuesta: "desarrollo",
      pasos_guia: [
        "a) Mitosis: 1 división → 2 células hijas. Cada una conserva el número diploide: 46 cromosomas (2n). Son genéticamente IDÉNTICAS a la madre (clones).",
        "b) Meiosis: 2 divisiones → 4 células hijas. Cada una tiene la mitad: n = 46/2 = 23 cromosomas (haploides). Son genéticamente DISTINTAS entre sí.",
        "c) Distribución independiente de 23 pares: 2ⁿ = 2²³ = 8 388 608 combinaciones posibles. Tras 3 rondas de mitosis: 2³ = 8 células.",
      ],
      respuesta_final: "a) 2 células × 46 cromosomas (2n, idénticas). b) 4 células × 23 cromosomas (n, distintas). c) 2²³ = 8 388 608 combinaciones; 2³ = 8 células tras 3 mitosis.",
      unidades: "células (nº), cromosomas (nº), combinaciones (nº)",
      tolerancia_error: 0,
    },
  },

  // ── A3 — REFLEXIÓN ESCRITA ────────────────────────────────────────────────
  {
    titulo: "La división celular en tu cuerpo y en la vida",
    descripcion: "Reflexiona sobre un fenómeno real y explícalo con la mitosis o la meiosis.",
    tipo: "reflexion_escrita",
    xp: 20,
    estado: "borrador",
    contenido: {
      prompt:
        "Elige un fenómeno cotidiano relacionado con la división celular (por ejemplo: por qué cicatriza una herida, por qué crece tu cabello y tus uñas, por qué los hijos no son idénticos a sus padres, por qué dos hermanos son distintos entre sí, qué es en el fondo un tumor, o por qué una lagartija regenera su cola). Explícalo indicando si interviene la MITOSIS o la MEIOSIS, qué pasa con el número de cromosomas y, si aplica, el papel de la recombinación. Propón cómo lo confirmarías observando las fases en el laboratorio 3D.",
      pistas: [
        "Cicatrizar una herida o crecer → mitosis: produce células idénticas para reponer tejido (2n → 2n).",
        "Hijos distintos a los padres / hermanos distintos → meiosis + recombinación: cada gameto es único.",
        "Un tumor → mitosis sin control: células que se dividen sin detenerse.",
        "Restaurar el 2n de la especie → la fecundación une dos gametos haploides (n + n = 2n).",
      ],
      longitud_minima_palabras: 100,
      formato_esperado: "libre",
      criterios_evaluacion: [
        "Identifica correctamente si el fenómeno se debe a mitosis o a meiosis.",
        "Explica qué ocurre con el número de cromosomas (se conserva 2n o se reduce a n).",
        "Relaciona, cuando aplica, la recombinación con la diversidad, y propone cómo comprobarlo.",
      ],
    },
  },

  // ── A4 — QUIZ VERDADERO / FALSO ───────────────────────────────────────────
  {
    titulo: "Verdadero o falso: mitosis y meiosis",
    descripcion: "Pon a prueba lo que entendiste sobre las fases, la ploidía y la recombinación.",
    tipo: "quiz_verdadero_falso",
    xp: 10,
    estado: "borrador",
    contenido: {
      preguntas: [
        { enunciado: "La mitosis produce dos células hijas genéticamente idénticas a la célula madre.", respuesta: true, retroalimentacion: "Correcto: la mitosis conserva el número y la información (2n → 2n); son clones." },
        { enunciado: "La meiosis produce cuatro células diploides idénticas entre sí.", respuesta: false, retroalimentacion: "Falso: produce cuatro células HAPLOIDES (n) y genéticamente DISTINTAS entre sí." },
        { enunciado: "El ADN se duplica una sola vez, aunque en la meiosis haya dos divisiones seguidas.", respuesta: true, retroalimentacion: "Correcto: por eso la meiosis reduce la ploidía a la mitad (2n → n)." },
        { enunciado: "En la Anafase I de la meiosis se separan las cromátidas hermanas.", respuesta: false, retroalimentacion: "Falso: en la Anafase I se separan los cromosomas HOMÓLOGOS completos (división reduccional). Las cromátidas hermanas se separan hasta la Anafase II." },
        { enunciado: "El crossing over de la Profase I aumenta la variabilidad genética.", respuesta: true, retroalimentacion: "Correcto: al intercambiar fragmentos entre homólogos, genera nuevas combinaciones de genes." },
        { enunciado: "El cáncer puede entenderse como una mitosis sin control.", respuesta: true, retroalimentacion: "Correcto: son células que se dividen sin detenerse porque fallan los controles del ciclo celular." },
      ],
    },
  },

  // ── A5 — GLOSARIO INTERACTIVO ─────────────────────────────────────────────
  {
    titulo: "Glosario: división celular y herencia",
    descripcion: "Términos clave para hablar de la mitosis, la meiosis y la recombinación.",
    tipo: "glosario_interactivo",
    xp: 15,
    estado: "borrador",
    contenido: {
      terminos: [
        { termino: "Cromosoma", definicion: "Estructura de ADN muy compactado que porta los genes; en humanos hay 46 (23 pares).", ejemplo: "Antes de dividirse, cada cromosoma se duplica en dos cromátidas hermanas." },
        { termino: "Cromátida hermana", definicion: "Cada una de las dos copias idénticas de un cromosoma duplicado, unidas por el centrómero.", ejemplo: "En la Anafase mitótica las cromátidas hermanas se separan a polos opuestos." },
        { termino: "Cromosomas homólogos", definicion: "El par de cromosomas con los mismos genes, uno de origen materno y otro paterno.", ejemplo: "En la Profase I los homólogos se aparean formando una tétrada." },
        { termino: "Diploide (2n)", definicion: "Célula con dos juegos completos de cromosomas, uno de cada progenitor.", ejemplo: "Las células del cuerpo humano son diploides: 2n = 46." },
        { termino: "Haploide (n)", definicion: "Célula con un solo juego de cromosomas; es el estado de los gametos.", ejemplo: "Los óvulos y espermatozoides son haploides: n = 23." },
        { termino: "Mitosis", definicion: "División celular que produce dos células hijas idénticas a la madre (2n → 2n).", ejemplo: "La piel se renueva y las heridas cicatrizan gracias a la mitosis." },
        { termino: "Meiosis", definicion: "Dos divisiones sucesivas que producen cuatro células haploides distintas (2n → n).", ejemplo: "La meiosis forma los gametos en ovarios y testículos." },
        { termino: "Crossing over", definicion: "Intercambio de fragmentos de ADN entre cromátidas de homólogos durante la Profase I.", ejemplo: "El crossing over recombina los genes y aumenta la diversidad." },
        { termino: "Recombinación genética", definicion: "Nuevas combinaciones de genes que surgen por crossing over y distribución independiente.", ejemplo: "Por la recombinación, ningún hermano es genéticamente igual a otro." },
        { termino: "Gameto", definicion: "Célula sexual haploide (óvulo o espermatozoide) que se une en la fecundación.", ejemplo: "Al unirse dos gametos haploides se restaura el número diploide (n + n = 2n)." },
      ],
      actividad_final: "Clasifica cada situación según el proceso que la explica: (1) una herida cicatriza; (2) se forman los óvulos; (3) un tumor crece sin control; (4) dos hermanos heredan distintas combinaciones de genes. Justifica cada uno.",
    },
  },

  // ── A6 — COMPLETAR ESPACIOS ───────────────────────────────────────────────
  {
    titulo: "Completa: las dos formas de dividirse",
    descripcion: "Completa el texto con los términos correctos sobre la división celular.",
    tipo: "fill_blanks",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Arrastra o escribe la palabra correcta en cada espacio.",
      texto_con_huecos:
        "La ___ produce dos células hijas idénticas a la madre y sirve para crecer y reparar tejidos. La ___, en cambio, hace dos divisiones seguidas y produce cuatro células ___ (n) que serán los gametos. En la Profase I ocurre el ___, donde los cromosomas homólogos intercambian fragmentos de ADN. En la Anafase I se separan los cromosomas ___, mientras que las cromátidas hermanas no se separan hasta la Anafase ___. Gracias a la ___ genética, cada gameto es único, lo que sostiene la biodiversidad.",
      huecos: [
        { posicion: 0, respuesta_correcta: "mitosis", alternativas_aceptadas: ["Mitosis"] },
        { posicion: 1, respuesta_correcta: "meiosis", alternativas_aceptadas: ["Meiosis"] },
        { posicion: 2, respuesta_correcta: "haploides", alternativas_aceptadas: ["haploide"] },
        { posicion: 3, respuesta_correcta: "crossing over", alternativas_aceptadas: ["entrecruzamiento", "sobrecruzamiento"] },
        { posicion: 4, respuesta_correcta: "homólogos", alternativas_aceptadas: ["homologos"] },
        { posicion: 5, respuesta_correcta: "II", alternativas_aceptadas: ["2", "dos"] },
        { posicion: 6, respuesta_correcta: "recombinación", alternativas_aceptadas: ["recombinacion"] },
      ],
    },
  },

  // ── A7 — AUTOEVALUACIÓN ───────────────────────────────────────────────────
  {
    titulo: "¿Cómo voy con la división celular?",
    descripcion: "Evalúa tu propio dominio de los conceptos de esta progresión.",
    tipo: "autoevaluacion",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Marca con honestidad qué tan seguro te sientes en cada punto. No hay respuestas correctas: te sirve para saber qué repasar.",
      criterios: [
        {
          descripcion: "Distingo las fases de la mitosis y explico por qué produce dos células idénticas.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Distingo las fases de la meiosis y explico por qué produce cuatro células haploides.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Calculo células hijas, cromosomas por célula y combinaciones (2ⁿ) en cada proceso.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Explico cómo la recombinación genética genera diversidad y sostiene la biodiversidad.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
      ],
      reflexion_final_prompt: "¿Qué diferencia entre mitosis y meiosis te costó más entender y cómo podrías repasarla?",
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

  console.log(`\n🌱 CNEYT-VI·O5 — División celular: mitosis y meiosis  (${apply ? "APLICAR" : "DRY-RUN"})\n`);

  // UAC
  const { data: uac, error: uacErr } = await sb.from("uac").select("id, total_progresiones").eq("codigo", UAC_CODIGO).single();
  if (uacErr || !uac) throw new Error(`UAC ${UAC_CODIGO} no encontrada: ${uacErr?.message}`);

  // ¿numero=5 libre? (no debe existir otra progresión con ese numero)
  const { data: choque } = await sb.from("progresiones").select("codigo").eq("uac_id", uac.id).eq("numero", PROG_NUMERO).maybeSingle();
  if (choque && choque.codigo !== PROG_CODIGO) {
    throw new Error(`numero=${PROG_NUMERO} ya está ocupado por ${choque.codigo} — abortado para no chocar.`);
  }

  console.log(`Progresión ${PROG_CODIGO} (numero=${PROG_NUMERO}) — categoria "${PROGRESION.categoria}"`);
  console.log(`  titulo (O5 verbatim): ${PROGRESION.titulo}`);
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

  console.log(`\n✅ CNEYT-VI·O5 sembrado (borrador). Ruta práctica:`);
  console.log(`   http://localhost:3000/hub/uac/${UAC_CODIGO}/progresion/${PROG_NUMERO}/actividad/2/practica\n`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e.message); process.exit(1); });
