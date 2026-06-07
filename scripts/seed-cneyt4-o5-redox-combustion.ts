/**
 * Seed del propósito formativo CNEYT-IV·O5 (numero=5) — hueco del re-alineamiento 2025.
 *
 *   Propósito formativo O5 (verbatim, contenido-2025.ts CNEYT-IV propositos[4]):
 *     "Comprende las reacciones químicas de óxido-reducción y combustión para
 *      identificar su ocurrencia en la naturaleza, la vida cotidiana, así como su
 *      importancia para los seres vivos y la industria."
 *   Contenido formativo C5 (verbatim, contenido-2025.ts CNEYT-IV contenidos[4]):
 *     "Reacciones de oxidación-reducción · Reacciones de combustión · Reacciones
 *      redox y de combustión en la naturaleza y la vida cotidiana · Importancia de
 *      las reacciones redox y de combustión para los seres vivos y la industria"
 *
 * Crea la progresión CNEYT-IV-P09 (numero=5) + 7 actividades, TODAS estado='borrador'
 * (regla: el contenido nuevo queda sin publicar hasta aprobación explícita).
 * La actividad A2 (ejercicio_matematico) lleva el laboratorio 3D "redox-combustion".
 *
 * Idempotente: upsert por "codigo". Recuenta uac.total_progresiones al final.
 *
 * Uso:
 *   npx tsx scripts/seed-cneyt4-o5-redox-combustion.ts            (dry-run: solo describe)
 *   npx tsx scripts/seed-cneyt4-o5-redox-combustion.ts --apply    (aplica los upserts)
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createSB, upsertActividad, type ActividadInput, type SB } from "./lib/activity-utils";

const UAC_CODIGO = "CNEYT-IV";
const PROG_CODIGO = "CNEYT-IV-P09";
const PROG_NUMERO = 5;
const LAB_SLUG = "redox-combustion";

const META = "Comprenda la química como el estudio de la estructura, propiedades y transformación de la materia, para construir explicaciones sobre diversos fenómenos naturales.";

// Propósito y contenido VERBATIM (contenido-2025.ts CNEYT-IV)
const O5 = "Comprende las reacciones químicas de óxido-reducción y combustión para identificar su ocurrencia en la naturaleza, la vida cotidiana, así como su importancia para los seres vivos y la industria.";
const C5 = "Reacciones de oxidación-reducción Reacciones de combustión Reacciones redox y de combustión en la naturaleza y la vida cotidiana Importancia de las reacciones redox y de combustión para los seres vivos y la industria";

const PROGRESION = {
  codigo: PROG_CODIGO,
  numero: PROG_NUMERO,
  titulo: O5,
  descripcion: "Estudia las reacciones de óxido-reducción —en las que una especie cede electrones (se oxida) y otra los gana (se reduce)— y reconoce la combustión como un redox rápido y exotérmico; analiza el potencial de una pila galvánica y la energía que liberan los combustibles, y su importancia para la vida y la industria.",
  descripcion_extendida: `${O5} Contenidos formativos: ${C5}.`,
  meta_aprendizaje: META,
  categoria: "Química inorgánica",
  subcategoria: "Reacciones de óxido-reducción y combustión",
  ejes_articuladores: ["Pensamiento crítico", "Apropiación de las culturas a través de la lectura y la escritura"],
  transversalidades: [] as string[],
  tiempo_estimado_horas: 3,
};

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido"> & { estado: "borrador" };

const ACTIVIDADES: Act[] = [
  // ── A1 — LECTURA ──────────────────────────────────────────────────────────
  {
    titulo: "Ganar y perder electrones: óxido-reducción y combustión",
    descripcion: "Lee qué es una reacción redox, por qué la combustión es un caso de redox y cómo estos procesos sostienen la vida y la industria.",
    tipo: "lectura",
    xp: 10,
    estado: "borrador",
    contenido: {
      texto:
        "Muchas de las reacciones que mueven el mundo —desde la respiración de tus células hasta el motor de un autobús— son reacciones de ÓXIDO-REDUCCIÓN (o redox). La idea central es sencilla: en ellas hay TRANSFERENCIA DE ELECTRONES de una sustancia a otra. Siempre ocurren dos cosas al mismo tiempo: una especie se OXIDA (pierde electrones) y otra se REDUCE (gana electrones). No puede haber una sin la otra; por eso hablamos de óxido-REDUCCIÓN.\n\n" +
        "OXIDACIÓN Y REDUCCIÓN. Una regla para recordarlo: «OPERA» (Oxidación Pierde Electrones; Reducción Añade). Quien cede electrones se oxida y se llama AGENTE REDUCTOR (porque provoca la reducción del otro). Quien gana electrones se reduce y se llama AGENTE OXIDANTE. Para llevar la cuenta usamos el NÚMERO DE OXIDACIÓN: una carga aparente que SUBE cuando un átomo se oxida y BAJA cuando se reduce. Ejemplo clásico: si sumerges una lámina de zinc en una disolución azul de sulfato de cobre, el zinc se oxida (Zn → Zn²⁺ + 2e⁻) y los iones cobre se reducen (Cu²⁺ + 2e⁻ → Cu). La reacción global es Zn + Cu²⁺ → Zn²⁺ + Cu: la lámina se cubre de cobre rojizo y la disolución se decolora.\n\n" +
        "LA COMBUSTIÓN ES UN REDOX. Quemar algo es hacerlo reaccionar rápidamente con el oxígeno. En la combustión del metano, CH₄ + 2O₂ → CO₂ + 2H₂O, el carbono se oxida (pasa de número de oxidación −4 en CH₄ a +4 en CO₂) y el oxígeno se reduce. Es una reacción EXOTÉRMICA: libera mucha energía en forma de calor y luz (ΔH = −890 kJ/mol). Si hay oxígeno suficiente, la combustión es COMPLETA y produce CO₂ y agua; si falta oxígeno, es INCOMPLETA y genera monóxido de carbono (CO, un gas tóxico) y hollín. Por eso los calentadores de gas mal ventilados son peligrosos.\n\n" +
        "LAS PILAS: REDOX QUE DA CORRIENTE. Si separamos las dos mitades de un redox en electrodos distintos y las unimos por un cable, los electrones se ven obligados a viajar por ese cable: eso es una PILA GALVÁNICA. En la pila de Daniell, el zinc se oxida en el ÁNODO (−) y los iones cobre se reducen en el CÁTODO (+); los electrones que circulan encienden un foco. La fuerza con que cada especie tiende a reducirse se mide con su POTENCIAL ESTÁNDAR DE REDUCCIÓN E° (en volts). El voltaje de la pila es E°pila = E°cátodo − E°ánodo. Para el Daniell: 0.34 − (−0.76) = +1.10 V. Que el resultado sea positivo indica que la reacción es espontánea.\n\n" +
        "EN LA NATURALEZA Y LA VIDA. El redox está en todas partes. La RESPIRACIÓN CELULAR oxida la glucosa (C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O) para obtener energía: es la misma ecuación que la combustión, pero realizada por pasos y de forma controlada en tus células. La FOTOSÍNTESIS es el redox inverso: usa la energía del Sol para reducir el CO₂ a glucosa y liberar O₂. La HERRUMBRE es hierro que se oxida lentamente con el oxígeno y la humedad; se combate con galvanizado (recubrir con zinc, que se oxida «en su lugar»).\n\n" +
        "IMPORTANCIA INDUSTRIAL. La combustión de hidrocarburos mueve coches, aviones y termoeléctricas; la metalurgia obtiene metales reduciendo sus minerales; las pilas y baterías —de la AA al litio del celular y a la batería del auto— almacenan energía como redox controlado. Comprender estas reacciones permite producir energía, proteger los metales de la corrosión y diseñar mejores baterías.",
      fuente: "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología IV «El poder de la química», contenido formativo: Reacciones de oxidación-reducción · Reacciones de combustión · Reacciones redox y de combustión en la naturaleza y la vida cotidiana · Importancia de las reacciones redox y de combustión para los seres vivos y la industria.",
      nivel_lectura: "intermedio",
      tiempo_estimado_minutos: 12,
      preguntas_comprension: [
        { pregunta: "¿Qué se transfiere en una reacción redox y qué les pasa a las dos especies que participan?", respuesta_guia: "Se transfieren electrones: una especie se oxida (pierde electrones, es el agente reductor) y, al mismo tiempo, otra se reduce (gana electrones, es el agente oxidante)." },
        { pregunta: "¿Por qué la combustión se considera una reacción de óxido-reducción?", respuesta_guia: "Porque el combustible se oxida rápidamente al reaccionar con el oxígeno (que se reduce); por ejemplo, el carbono del CH₄ pasa de número de oxidación −4 a +4 en el CO₂, liberando calor." },
        { pregunta: "¿Cómo se calcula el voltaje de una pila y qué significa que sea positivo?", respuesta_guia: "Con E°pila = E°cátodo − E°ánodo. Si el resultado es positivo, la reacción es espontánea; en la pila de Daniell da +1.10 V." },
      ],
    },
  },

  // ── A2 — EJERCICIO MATEMÁTICO (lleva el lab 3D) ───────────────────────────
  {
    titulo: "Calculando el potencial de una pila y la energía de un combustible",
    descripcion: "Calcula el voltaje de una pila con los potenciales estándar y la energía que libera una combustión, y compruébalo en el laboratorio 3D.",
    tipo: "ejercicio_matematico",
    xp: 15,
    estado: "borrador",
    contenido: {
      instrucciones: "Resuelve a mano y comprueba en el laboratorio 3D: recorre el redox, la combustión y la pila, y usa la calculadora (elige los pares redox y el combustible) para verificar tus resultados.",
      problema:
        "Trabaja con la pila de Daniell y con la combustión de un gas doméstico.\n\n" +
        "a) PILA. Se arma una pila con un electrodo de zinc en Zn²⁺ y uno de cobre en Cu²⁺. Datos: E°(Cu²⁺/Cu) = +0.34 V; E°(Zn²⁺/Zn) = −0.76 V. Indica cuál se oxida y cuál se reduce, y calcula el potencial estándar de la pila, E°pila = E°cátodo − E°ánodo.\n\n" +
        "b) IDENTIFICAR REDOX. En la reacción global Zn + Cu²⁺ → Zn²⁺ + Cu, ¿quién es el agente reductor y quién el agente oxidante?\n\n" +
        "c) COMBUSTIÓN. ¿Cuánta energía libera la combustión completa de 3 moles de metano, si su entalpía de combustión es ΔH = −890 kJ/mol? Usa Q = |ΔH|·n.",
      contexto: "Los tres incisos recorren el contenido formativo de la progresión: la pila (a) con el potencial estándar, la identificación del redox (b) con los agentes oxidante/reductor, y la combustión (c) con la energía liberada. En el laboratorio 3D cada proceso es un modo y la calculadora da estos números para cualquier par redox y cualquier combustible.",
      tipo_respuesta: "desarrollo",
      pasos_guia: [
        "a) El cobre tiene mayor E° (+0.34), así que es el cátodo (se reduce); el zinc, con menor E° (−0.76), es el ánodo (se oxida). E°pila = 0.34 − (−0.76) = 0.34 + 0.76 = +1.10 V.",
        "b) El zinc cede electrones (Zn → Zn²⁺ + 2e⁻): se oxida, es el agente REDUCTOR. El Cu²⁺ gana electrones (Cu²⁺ + 2e⁻ → Cu): se reduce, es el agente OXIDANTE.",
        "c) Q = |ΔH|·n = 890 × 3 = 2 670 kJ.",
      ],
      respuesta_final: "a) E°pila = +1.10 V (espontánea). b) Reductor: Zn (se oxida); oxidante: Cu²⁺ (se reduce). c) Q = 2 670 kJ.",
      unidades: "E° en volts (V); energía en kilojoules (kJ)",
      tolerancia_error: 0.01,
    },
  },

  // ── A3 — REFLEXIÓN ESCRITA ────────────────────────────────────────────────
  {
    titulo: "El redox en tu día a día",
    descripcion: "Reflexiona sobre un fenómeno cotidiano y explícalo como una reacción de óxido-reducción o de combustión.",
    tipo: "reflexion_escrita",
    xp: 20,
    estado: "borrador",
    contenido: {
      prompt:
        "Elige un fenómeno cotidiano relacionado con el redox o la combustión (por ejemplo: por qué se oxida una reja de hierro a la intemperie, por qué la estufa de gas calienta, por qué una pila se «agota», por qué respiramos para obtener energía, por qué una manzana cortada se pone café, o por qué un calentador de gas mal ventilado es peligroso). Explícalo indicando quién se oxida y quién se reduce (o qué se quema y con qué), y si interviene un agente oxidante como el oxígeno. Propón cómo lo confirmarías en el laboratorio 3D.",
      pistas: [
        "Reja oxidada → el hierro se oxida (pierde electrones) con el O₂ y la humedad: es corrosión, un redox lento.",
        "Estufa de gas → combustión: el metano se oxida con O₂ y libera calor (CH₄ + 2O₂ → CO₂ + 2H₂O).",
        "Pila que se agota → se consumieron los reactivos del redox que generaba la corriente.",
        "Respiración / manzana café → redox lentos con oxígeno; el calentador mal ventilado produce CO por combustión incompleta.",
      ],
      longitud_minima_palabras: 100,
      formato_esperado: "libre",
      criterios_evaluacion: [
        "Identifica correctamente que se trata de una reacción de óxido-reducción o de combustión.",
        "Señala quién se oxida y quién se reduce (o el combustible y el oxígeno) y el papel del agente oxidante.",
        "Propone una forma de comprobarlo, por ejemplo recorriendo el modo correspondiente del laboratorio 3D.",
      ],
    },
  },

  // ── A4 — QUIZ VERDADERO / FALSO ───────────────────────────────────────────
  {
    titulo: "Verdadero o falso: óxido-reducción y combustión",
    descripcion: "Pon a prueba lo que entendiste sobre el redox, la combustión y las pilas.",
    tipo: "quiz_verdadero_falso",
    xp: 10,
    estado: "borrador",
    contenido: {
      preguntas: [
        { enunciado: "En toda reacción redox una especie se oxida y, al mismo tiempo, otra se reduce.", respuesta: true, retroalimentacion: "Correcto: no hay oxidación sin reducción; los electrones que pierde una los gana la otra." },
        { enunciado: "El agente reductor es la especie que gana electrones y se reduce.", respuesta: false, retroalimentacion: "Falso: el agente reductor es quien CEDE electrones y se OXIDA (provoca la reducción del otro). Quien gana electrones es el agente oxidante." },
        { enunciado: "La combustión es una reacción de óxido-reducción exotérmica con oxígeno.", respuesta: true, retroalimentacion: "Correcto: el combustible se oxida rápidamente con O₂ y libera calor y luz (ΔH negativa)." },
        { enunciado: "La combustión incompleta, por falta de oxígeno, produce monóxido de carbono (CO).", respuesta: true, retroalimentacion: "Correcto: con poco O₂ se forma CO (tóxico) y hollín en lugar de solo CO₂; por eso es peligrosa." },
        { enunciado: "El número de oxidación de un átomo disminuye cuando ese átomo se oxida.", respuesta: false, retroalimentacion: "Falso: el número de oxidación SUBE al oxidarse (pierde electrones) y baja al reducirse." },
        { enunciado: "En la pila de Daniell, E°pila = E°cátodo − E°ánodo = 0.34 − (−0.76) = +1.10 V.", respuesta: true, retroalimentacion: "Correcto: el cobre (cátodo, +0.34) se reduce y el zinc (ánodo, −0.76) se oxida; la pila da +1.10 V y es espontánea." },
      ],
    },
  },

  // ── A5 — GLOSARIO INTERACTIVO ─────────────────────────────────────────────
  {
    titulo: "Glosario: óxido-reducción y combustión",
    descripcion: "Términos clave para hablar del redox, la combustión y las pilas.",
    tipo: "glosario_interactivo",
    xp: 15,
    estado: "borrador",
    contenido: {
      terminos: [
        { termino: "Óxido-reducción (redox)", definicion: "Reacción en la que hay transferencia de electrones entre especies.", ejemplo: "Zn + Cu²⁺ → Zn²⁺ + Cu." },
        { termino: "Oxidación", definicion: "Proceso en que una especie pierde electrones; su número de oxidación aumenta.", ejemplo: "Zn → Zn²⁺ + 2e⁻ (el zinc se oxida)." },
        { termino: "Reducción", definicion: "Proceso en que una especie gana electrones; su número de oxidación disminuye.", ejemplo: "Cu²⁺ + 2e⁻ → Cu (el cobre se reduce)." },
        { termino: "Agente reductor", definicion: "Especie que cede electrones (se oxida) y provoca la reducción de otra.", ejemplo: "El zinc en la reacción con el cobre." },
        { termino: "Agente oxidante", definicion: "Especie que gana electrones (se reduce) y provoca la oxidación de otra.", ejemplo: "El O₂ en una combustión; el Cu²⁺ frente al zinc." },
        { termino: "Número de oxidación", definicion: "Carga aparente de un átomo; sube al oxidarse y baja al reducirse.", ejemplo: "El C pasa de −4 en CH₄ a +4 en CO₂." },
        { termino: "Combustión", definicion: "Reacción redox rápida de un combustible con oxígeno que libera calor y luz.", ejemplo: "CH₄ + 2O₂ → CO₂ + 2H₂O + energía." },
        { termino: "Reacción exotérmica", definicion: "Reacción que libera energía al entorno; su ΔH es negativa.", ejemplo: "Toda combustión: el gas de la estufa al arder." },
        { termino: "Pila galvánica", definicion: "Dispositivo que aprovecha un redox espontáneo para producir corriente eléctrica.", ejemplo: "La pila de Daniell Zn|Zn²⁺‖Cu²⁺|Cu, +1.10 V." },
        { termino: "Potencial estándar de reducción (E°)", definicion: "Tendencia de una semirreacción a reducirse, medida en volts frente al electrodo de hidrógeno.", ejemplo: "E°(Cu²⁺/Cu) = +0.34 V; E°(Zn²⁺/Zn) = −0.76 V." },
      ],
      actividad_final: "Clasifica cada caso e indica quién se oxida y quién se reduce: (1) una reja de hierro que se herrumbra; (2) el gas de una estufa que arde; (3) la pila de un control remoto; (4) la respiración celular que oxida glucosa. Justifica cada uno.",
    },
  },

  // ── A6 — COMPLETAR ESPACIOS ───────────────────────────────────────────────
  {
    titulo: "Completa: óxido-reducción y combustión",
    descripcion: "Completa el texto con los términos correctos sobre el redox y la combustión.",
    tipo: "fill_blanks",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Arrastra o escribe la palabra correcta en cada espacio.",
      texto_con_huecos:
        "En una reacción de óxido-reducción hay transferencia de ___. La especie que los pierde se ___ y actúa como agente reductor; la que los gana se ___ y actúa como agente oxidante. La combustión es un redox rápido con ___ que libera calor: es una reacción ___. Cuando separamos un redox en dos electrodos unidos por un cable construimos una ___ galvánica, cuyo voltaje es E°pila = E°cátodo − E°___.",
      huecos: [
        { posicion: 0, respuesta_correcta: "electrones", alternativas_aceptadas: ["Electrones"] },
        { posicion: 1, respuesta_correcta: "oxida", alternativas_aceptadas: ["Oxida"] },
        { posicion: 2, respuesta_correcta: "reduce", alternativas_aceptadas: ["Reduce"] },
        { posicion: 3, respuesta_correcta: "oxígeno", alternativas_aceptadas: ["oxigeno", "O₂", "O2"] },
        { posicion: 4, respuesta_correcta: "exotérmica", alternativas_aceptadas: ["exotermica", "Exotérmica"] },
        { posicion: 5, respuesta_correcta: "pila", alternativas_aceptadas: ["Pila", "celda"] },
        { posicion: 6, respuesta_correcta: "ánodo", alternativas_aceptadas: ["anodo", "Ánodo"] },
      ],
    },
  },

  // ── A7 — AUTOEVALUACIÓN ───────────────────────────────────────────────────
  {
    titulo: "¿Cómo voy con el redox y la combustión?",
    descripcion: "Evalúa tu propio dominio de los conceptos de esta progresión.",
    tipo: "autoevaluacion",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Marca con honestidad qué tan seguro te sientes en cada punto. No hay respuestas correctas: te sirve para saber qué repasar.",
      criterios: [
        {
          descripcion: "Distingo oxidación y reducción e identifico el agente oxidante y el reductor.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Explico por qué la combustión es un redox exotérmico y distingo la completa de la incompleta.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Calculo el potencial de una pila con E°pila = E°cátodo − E°ánodo.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Reconozco el redox y la combustión en la naturaleza, la vida cotidiana y la industria.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
      ],
      reflexion_final_prompt: "¿Qué idea del redox o la combustión te costó más entender y cómo podrías repasarla con un ejemplo de tu casa?",
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

  console.log(`\n🌱 CNEYT-IV·O5 — Reacciones redox y combustión  (${apply ? "APLICAR" : "DRY-RUN"})\n`);

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

  console.log(`\n✅ CNEYT-IV·O5 sembrado (borrador). Ruta práctica:`);
  console.log(`   http://localhost:3000/hub/uac/${UAC_CODIGO}/progresion/${PROG_NUMERO}/actividad/2/practica\n`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e.message); process.exit(1); });
