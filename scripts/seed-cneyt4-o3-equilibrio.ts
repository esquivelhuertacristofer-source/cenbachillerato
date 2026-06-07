/**
 * Seed del propósito formativo CNEYT-IV·O3 (numero=3) — hueco del re-alineamiento 2025.
 *
 *   Propósito formativo O3 (verbatim, contenido-2025.ts CNEYT-IV propositos[2]):
 *     "Comprende el concepto de equilibrio químico y la dinámica de las
 *      reacciones reversibles e irreversibles, para identificarlas en fenómenos
 *      naturales cotidianos o de interés."
 *   Contenido formativo C3 (verbatim, contenido-2025.ts CNEYT-IV contenidos[2]):
 *     "Reacciones reversibles e irreversibles · Constante y ecuación de
 *      equilibrio químico · Identificación de reacciones reversibles e
 *      irreversibles en la naturaleza"
 *
 * Crea la progresión CNEYT-IV-P10 (numero=3) + 7 actividades, TODAS estado='borrador'
 * (regla: el contenido nuevo queda sin publicar hasta aprobación explícita).
 * La actividad A2 (ejercicio_matematico) lleva el laboratorio 3D "equilibrio-quimico".
 *
 * Idempotente: upsert por "codigo". Recuenta uac.total_progresiones al final.
 *
 * Uso:
 *   npx tsx scripts/seed-cneyt4-o3-equilibrio.ts            (dry-run: solo describe)
 *   npx tsx scripts/seed-cneyt4-o3-equilibrio.ts --apply    (aplica los upserts)
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createSB, upsertActividad, type ActividadInput, type SB } from "./lib/activity-utils";

const UAC_CODIGO = "CNEYT-IV";
const PROG_CODIGO = "CNEYT-IV-P10";
const PROG_NUMERO = 3;
const LAB_SLUG = "equilibrio-quimico";

const META = "Comprenda la química como el estudio de la estructura, propiedades y transformación de la materia, para construir explicaciones sobre diversos fenómenos naturales.";

// Propósito y contenido VERBATIM (contenido-2025.ts CNEYT-IV)
const O3 = "Comprende el concepto de equilibrio químico y la dinámica de las reacciones reversibles e irreversibles, para identificarlas en fenómenos naturales cotidianos o de interés.";
const C3 = "Reacciones reversibles e irreversibles Constante y ecuación de equilibrio químico Identificación de reacciones reversibles e irreversibles en la naturaleza";

const PROGRESION = {
  codigo: PROG_CODIGO,
  numero: PROG_NUMERO,
  titulo: O3,
  descripcion: "Distingue las reacciones reversibles (⇌) de las irreversibles (→) y comprende el equilibrio químico como un estado dinámico en que las velocidades directa e inversa se igualan y las concentraciones se mantienen constantes. Escribe y usa la constante de equilibrio Kc = [productos]^coef / [reactivos]^coef, compara el cociente Q con Kc para predecir el sentido del avance, y aplica el principio de Le Châtelier ante perturbaciones (concentración, presión, temperatura), sobre fenómenos reales de México (proceso Haber-Bosch, esmog, bicarbonato en la sangre).",
  descripcion_extendida: `${O3} Contenidos formativos: ${C3}.`,
  meta_aprendizaje: META,
  categoria: "El poder de la química",
  subcategoria: "Equilibrio químico y reacciones reversibles",
  ejes_articuladores: ["Pensamiento crítico"],
  transversalidades: [] as string[],
  tiempo_estimado_horas: 3,
};

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido"> & { estado: "borrador" };

const ACTIVIDADES: Act[] = [
  // ── A1 — LECTURA ──────────────────────────────────────────────────────────
  {
    titulo: "El equilibrio químico: cuando una reacción nunca se detiene",
    descripcion: "Lee qué distingue a una reacción reversible de una irreversible, qué es el equilibrio dinámico, cómo se escribe la constante Kc y qué dice el principio de Le Châtelier.",
    tipo: "lectura",
    xp: 10,
    estado: "borrador",
    contenido: {
      texto:
        "Cuando piensas en una reacción química imaginas que los reactivos se transforman en productos y ahí acaba todo. Eso ocurre en las reacciones IRREVERSIBLES, que avanzan en un solo sentido hasta agotar un reactivo: la combustión de la gasolina o el oxidado (herrumbre) del hierro no se devuelven solos. Se escriben con una flecha sencilla →. Pero muchísimas reacciones son REVERSIBLES: ocurren a la vez en los dos sentidos, los productos vuelven a formar reactivos. Se escriben con una doble flecha ⇌, y pueden alcanzar un estado especial llamado EQUILIBRIO QUÍMICO.\n\n" +
        "EL EQUILIBRIO ES DINÁMICO. Al principio de una reacción reversible solo hay reactivos, así que únicamente ocurre la reacción DIRECTA (reactivos → productos) a gran velocidad. A medida que se acumulan productos, empieza también la reacción INVERSA (productos → reactivos), cada vez más rápida. Llega un momento en que ambas velocidades se IGUALAN: por cada molécula de producto que se forma, otra se descompone. Eso es el equilibrio químico. Es DINÁMICO, no un reposo: las moléculas siguen reaccionando sin parar en ambos sentidos, pero como lo hacen al mismo ritmo, las CONCENTRACIONES de reactivos y productos ya no cambian. Ojo: que sean constantes no significa que sean iguales entre sí.\n\n" +
        "LA CONSTANTE DE EQUILIBRIO Kc. Para una reacción general a A + b B ⇌ c C + d D, la constante de equilibrio se define como Kc = [C]^c · [D]^d / ([A]^a · [B]^b): el producto de las concentraciones de los productos, cada una elevada a su coeficiente, dividido entre el de los reactivos. Su valor SOLO depende de la temperatura. Un Kc GRANDE significa que en el equilibrio dominan los productos (la reacción «se va a la derecha»); un Kc PEQUEÑO, que dominan los reactivos. Una reacción «irreversible» en realidad solo tiene una Kc gigantesca: el equilibrio existe, pero está tan corrido a productos que no se nota.\n\n" +
        "EL COCIENTE Q PREDICE EL SENTIDO. El cociente de reacción Q se calcula con la MISMA fórmula que Kc, pero usando las concentraciones de CUALQUIER instante (no solo las del equilibrio). Comparar Q con Kc dice hacia dónde se moverá el sistema: si Q < Kc faltan productos, así que la reacción avanza a la DERECHA; si Q > Kc sobran productos y avanza a la IZQUIERDA; si Q = Kc, el sistema ya está en equilibrio.\n\n" +
        "EL PRINCIPIO DE LE CHÂTELIER. Si un sistema en equilibrio se PERTURBA, responde desplazándose en el sentido que CONTRARRESTA el cambio. Si agregas reactivo, el equilibrio se mueve a la derecha para consumirlo; si agregas producto, a la izquierda. Si SUBES LA PRESIÓN (comprimiendo un gas), se desplaza hacia el lado con MENOS moles de gas. Si SUBES LA TEMPERATURA, se desplaza hacia el lado que ABSORBE calor: hacia los productos si la reacción directa es endotérmica (ΔH > 0), hacia los reactivos si es exotérmica (ΔH < 0). Un CATALIZADOR, en cambio, acelera por igual ambas reacciones: hace que el equilibrio llegue antes, pero NO lo desplaza ni cambia Kc.\n\n" +
        "EN MÉXICO Y EN LA NATURALEZA. El equilibrio químico está por todas partes. El proceso Haber-Bosch (N₂ + 3 H₂ ⇌ 2 NH₃) sintetiza el amoniaco de los fertilizantes que alimentan al campo mexicano; se trabaja a alta presión justamente para desplazar el equilibrio hacia el NH₃ (menos moles de gas). El NO₂ pardo del esmog del Valle de México proviene del equilibrio N₂O₄ ⇌ 2 NO₂. Y en tu propia sangre, el equilibrio del bicarbonato (CO₂ + H₂O ⇌ H₂CO₃ ⇌ HCO₃⁻ + H⁺) mantiene estable el pH para que puedas vivir. Entender el equilibrio químico permite explicar y controlar fenómenos naturales, industriales y biológicos.",
      fuente: "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología IV «El poder de la química», contenido formativo: Reacciones reversibles e irreversibles · Constante y ecuación de equilibrio químico · Identificación de reacciones reversibles e irreversibles en la naturaleza.",
      nivel_lectura: "intermedio",
      tiempo_estimado_minutos: 13,
      preguntas_comprension: [
        { pregunta: "¿Por qué se dice que el equilibrio químico es dinámico si las concentraciones ya no cambian?", respuesta_guia: "Porque las reacciones directa e inversa siguen ocurriendo sin parar, pero a la MISMA velocidad: por cada producto que se forma otro se descompone, así que las concentraciones se mantienen constantes aunque las moléculas no dejan de reaccionar." },
        { pregunta: "¿Qué información da comparar el cociente Q con la constante Kc?", respuesta_guia: "El sentido del avance: si Q<Kc faltan productos y la reacción va a la derecha; si Q>Kc sobran productos y va a la izquierda; si Q=Kc el sistema ya está en equilibrio. Q usa las concentraciones del momento y Kc las del equilibrio." },
        { pregunta: "Según Le Châtelier, ¿hacia dónde se desplaza un equilibrio si subes la presión, y por qué?", respuesta_guia: "Hacia el lado con MENOS moles de gas, para contrarrestar el aumento de presión reduciendo el número de partículas gaseosas. Si hay los mismos moles de gas en ambos lados (o es en disolución), la presión no lo desplaza." },
      ],
    },
  },

  // ── A2 — EJERCICIO MATEMÁTICO (lleva el lab 3D) ───────────────────────────
  {
    titulo: "¿Está en equilibrio? Calcula Q y compáralo con Kc (H₂ + I₂ ⇌ 2 HI)",
    descripcion: "Calcula el cociente de reacción Q, compáralo con la constante Kc para predecir el sentido y aplica Le Châtelier; compruébalo en el laboratorio 3D.",
    tipo: "ejercicio_matematico",
    xp: 15,
    estado: "borrador",
    contenido: {
      instrucciones: "Resuelve a mano y comprueba en el laboratorio 3D: en el modo «Constante Kc» observa cómo Q se acerca a Kc; en la calculadora elige la reacción H₂ + I₂ ⇌ 2 HI, escribe [H₂]=0.20, [I₂]=0.20, [HI]=0.50 y compara Q con Kc; luego usa el modo «Le Châtelier» y la calculadora para predecir el efecto de cada perturbación.",
      problema:
        "En un recipiente cerrado a 448 °C se estudia el equilibrio H₂ + I₂ ⇌ 2 HI, cuya constante es Kc = 50.5.\n\n" +
        "a) COCIENTE Q. En cierto instante se miden [H₂] = 0.20 M, [I₂] = 0.20 M y [HI] = 0.50 M. Calcula el cociente de reacción Q.\n\n" +
        "b) SENTIDO. Compara Q con Kc: ¿está el sistema en equilibrio? Si no, ¿hacia qué lado se desplaza?\n\n" +
        "c) LE CHÂTELIER. Para el proceso Haber N₂ + 3 H₂ ⇌ 2 NH₃ (exotérmico, ΔH = −92 kJ; pasa de 4 a 2 moles de gas), predice hacia dónde se desplaza el equilibrio si (i) se aumenta la presión y (ii) se aumenta la temperatura.",
      contexto: "Los tres incisos recorren el contenido formativo de la progresión: la constante y ecuación de equilibrio (Kc), el cociente Q que predice el sentido de una reacción reversible, y el principio de Le Châtelier sobre un proceso industrial real (Haber-Bosch). En el laboratorio 3D el modo «Constante Kc» muestra a Q acercándose a Kc, la calculadora computa Q y lo compara con Kc, y el modo «Le Châtelier» visualiza el desplazamiento por presión.",
      tipo_respuesta: "desarrollo",
      pasos_guia: [
        "a) Q = [HI]² / ([H₂]·[I₂]) = (0.50)² / (0.20 × 0.20) = 0.25 / 0.04 = 6.25.",
        "b) Q = 6.25 es MENOR que Kc = 50.5 ⇒ el sistema NO está en equilibrio: faltan productos, así que se desplaza hacia la DERECHA (forma más HI) hasta que Q llegue a 50.5.",
        "c.i) Aumentar la presión favorece el lado con MENOS moles de gas. Haber pasa de 4 moles (N₂ + 3 H₂) a 2 moles (2 NH₃), así que el equilibrio se desplaza a la DERECHA (más amoniaco).",
        "c.ii) La reacción directa es exotérmica (ΔH < 0). Subir la temperatura favorece el sentido que absorbe calor, es decir la reacción INVERSA: el equilibrio se desplaza a la IZQUIERDA (menos amoniaco). Por eso la industria usa presión alta pero temperatura moderada.",
      ],
      respuesta_final: "a) Q = 6.25. b) Q (6.25) < Kc (50.5) ⇒ no está en equilibrio; se desplaza a la derecha (forma HI). c) En el Haber: (i) más presión ⇒ derecha (4→2 mol de gas, más NH₃); (ii) más temperatura ⇒ izquierda (la directa es exotérmica).",
      unidades: "concentraciones en mol/L; Q y Kc adimensionales en este uso didáctico",
      tolerancia_error: 0.01,
    },
  },

  // ── A3 — REFLEXIÓN ESCRITA ────────────────────────────────────────────────
  {
    titulo: "Un equilibrio químico en tu vida diaria",
    descripcion: "Reflexiona sobre una reacción reversible o un equilibrio químico de tu entorno y razona cómo lo desplazarías a tu favor.",
    tipo: "reflexion_escrita",
    xp: 20,
    estado: "borrador",
    contenido: {
      prompt:
        "Elige un equilibrio químico o una reacción reversible presente en tu vida diaria —por ejemplo: el gas (CO₂) disuelto en un refresco cerrado, el bicarbonato que regula el pH de tu sangre o de un antiácido, la cal y el dióxido de carbono en una cueva o en el fraguado del concreto, o el amoniaco de los fertilizantes— y descríbelo con su doble flecha ⇌. Explica cómo distingues que es reversible y no irreversible, qué representaría su constante Kc, y aplica el principio de Le Châtelier: ¿qué perturbación (cambiar concentración, presión o temperatura) lo desplazaría hacia los productos, y cuál hacia los reactivos? Conecta tu razonamiento con una decisión práctica (por ejemplo, cómo conservar el gas de un refresco, o por qué la industria usa cierta presión) e indica cómo lo comprobarías en el laboratorio 3D.",
      pistas: [
        "Reversible (⇌): coexisten reactivos y productos y puede ir en ambos sentidos. Irreversible (→): se agota un reactivo y no se devuelve.",
        "Kc grande ⇒ dominan productos; Kc pequeña ⇒ dominan reactivos. Solo depende de la temperatura.",
        "Le Châtelier: agregar reactivo → derecha; agregar producto → izquierda; más presión → menos moles de gas; más temperatura → lado endotérmico.",
        "Ejemplo: un refresco cerrado tiene CO₂(g) ⇌ CO₂(ac) a presión; al abrirlo baja la presión y el equilibrio se desplaza liberando el gas.",
      ],
      longitud_minima_palabras: 100,
      formato_esperado: "libre",
      criterios_evaluacion: [
        "Identifica un equilibrio o reacción reversible real y lo escribe con doble flecha, distinguiéndolo de una reacción irreversible.",
        "Explica qué representa su constante Kc y qué significaría que sea grande o pequeña.",
        "Aplica el principio de Le Châtelier para predecir hacia dónde se desplaza ante al menos dos perturbaciones, y conecta el razonamiento con una decisión práctica y con el laboratorio 3D.",
      ],
    },
  },

  // ── A4 — QUIZ VERDADERO / FALSO ───────────────────────────────────────────
  {
    titulo: "Verdadero o falso: equilibrio, Kc, Q y Le Châtelier",
    descripcion: "Pon a prueba lo que entendiste sobre reacciones reversibles, el equilibrio dinámico, la constante Kc y el principio de Le Châtelier.",
    tipo: "quiz_verdadero_falso",
    xp: 10,
    estado: "borrador",
    contenido: {
      preguntas: [
        { enunciado: "Una reacción reversible se escribe con doble flecha (⇌) y puede ocurrir en ambos sentidos a la vez.", respuesta: true, retroalimentacion: "Correcto: la doble flecha indica que reactivos y productos se interconvierten y la reacción puede alcanzar un equilibrio." },
        { enunciado: "En el equilibrio químico las moléculas dejan de reaccionar por completo.", respuesta: false, retroalimentacion: "Falso: el equilibrio es DINÁMICO. Las reacciones directa e inversa siguen ocurriendo, pero a la misma velocidad, por eso las concentraciones no cambian." },
        { enunciado: "En el equilibrio, las concentraciones de reactivos y productos son siempre iguales entre sí.", respuesta: false, retroalimentacion: "Falso: las concentraciones se mantienen CONSTANTES, pero no necesariamente iguales. Su relación la fija la constante Kc." },
        { enunciado: "La constante Kc se calcula como [productos]^coef / [reactivos]^coef y solo depende de la temperatura.", respuesta: true, retroalimentacion: "Correcto: cada concentración se eleva a su coeficiente; el valor de Kc cambia únicamente si cambia la temperatura." },
        { enunciado: "Si el cociente Q es menor que Kc, la reacción se desplaza hacia los productos (a la derecha).", respuesta: true, retroalimentacion: "Correcto: Q<Kc significa que faltan productos, así que el sistema avanza hacia la derecha hasta que Q alcance a Kc." },
        { enunciado: "Según Le Châtelier, subir la temperatura de una reacción exotérmica desplaza el equilibrio hacia los productos.", respuesta: false, retroalimentacion: "Falso: en una reacción exotérmica (ΔH<0) el calor es como un «producto». Subir la temperatura desplaza el equilibrio hacia los REACTIVOS (la inversa, que absorbe calor)." },
      ],
    },
  },

  // ── A5 — GLOSARIO INTERACTIVO ─────────────────────────────────────────────
  {
    titulo: "Glosario: equilibrio químico, Kc, Q y Le Châtelier",
    descripcion: "Términos clave para entender las reacciones reversibles, el equilibrio dinámico y su desplazamiento.",
    tipo: "glosario_interactivo",
    xp: 15,
    estado: "borrador",
    contenido: {
      terminos: [
        { termino: "Reacción reversible", definicion: "La que ocurre en ambos sentidos y puede alcanzar un equilibrio; se escribe con doble flecha ⇌.", ejemplo: "N₂O₄ ⇌ 2 NO₂." },
        { termino: "Reacción irreversible", definicion: "La que avanza prácticamente en un solo sentido hasta agotar un reactivo; se escribe con →.", ejemplo: "La combustión: CH₄ + 2 O₂ → CO₂ + 2 H₂O." },
        { termino: "Equilibrio químico", definicion: "Estado en que las velocidades directa e inversa son iguales y las concentraciones permanecen constantes.", ejemplo: "Un refresco cerrado: CO₂(g) ⇌ CO₂(ac)." },
        { termino: "Equilibrio dinámico", definicion: "El equilibrio no es reposo: las moléculas siguen reaccionando en ambos sentidos al mismo ritmo.", ejemplo: "Por cada N₂O₄ que se rompe, otro se forma." },
        { termino: "Constante de equilibrio (Kc)", definicion: "Cociente [productos]^coef / [reactivos]^coef en el equilibrio; depende solo de la temperatura.", ejemplo: "Para H₂ + I₂ ⇌ 2 HI, Kc = 50.5 a 448 °C." },
        { termino: "Cociente de reacción (Q)", definicion: "Mismo cociente que Kc pero con las concentraciones de cualquier instante; predice el sentido del avance.", ejemplo: "Si Q < Kc, la reacción avanza hacia los productos." },
        { termino: "Principio de Le Châtelier", definicion: "Si se altera un sistema en equilibrio, este se desplaza en el sentido que contrarresta la alteración.", ejemplo: "Más presión sobre N₂ + 3 H₂ ⇌ 2 NH₃ favorece el amoniaco." },
        { termino: "Reacción endotérmica / exotérmica", definicion: "La que absorbe (ΔH>0) o libera (ΔH<0) calor; determina el efecto de la temperatura sobre el equilibrio.", ejemplo: "N₂O₄ ⇌ 2 NO₂ es endotérmica: calentar produce más NO₂ pardo." },
        { termino: "Catalizador", definicion: "Sustancia que acelera ambas reacciones por igual; acerca el equilibrio sin desplazarlo ni cambiar Kc.", ejemplo: "El hierro cataliza el proceso Haber-Bosch." },
        { termino: "Proceso Haber-Bosch", definicion: "Síntesis industrial del amoniaco (N₂ + 3 H₂ ⇌ 2 NH₃) a alta presión, base de los fertilizantes.", ejemplo: "Alta presión desplaza el equilibrio hacia el NH₃ (menos moles de gas)." },
      ],
      actividad_final: "Para el equilibrio N₂O₄ ⇌ 2 NO₂ (endotérmico): (1) escribe su constante Kc; (2) predice qué pasa si subes la temperatura; (3) predice qué pasa si comprimes el gas. Comprueba cada uno en el laboratorio 3D.",
    },
  },

  // ── A6 — COMPLETAR ESPACIOS ───────────────────────────────────────────────
  {
    titulo: "Completa: equilibrio dinámico, Kc y desplazamiento",
    descripcion: "Completa el texto con los términos correctos sobre el equilibrio químico y su desplazamiento.",
    tipo: "fill_blanks",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Arrastra o escribe la palabra correcta en cada espacio.",
      texto_con_huecos:
        "Una reacción ___ ocurre en ambos sentidos y se escribe con doble flecha ⇌. Alcanza el ___ químico cuando la velocidad de la reacción directa es ___ a la de la inversa; entonces las ___ permanecen constantes. La constante de equilibrio se calcula como [productos]^coef entre [___]^coef y solo depende de la ___. Si el cociente Q es menor que Kc, la reacción se desplaza hacia la ___. Según el principio de Le ___, al subir la presión el equilibrio se mueve hacia el lado con ___ moles de gas.",
      huecos: [
        { posicion: 0, respuesta_correcta: "reversible", alternativas_aceptadas: ["Reversible"] },
        { posicion: 1, respuesta_correcta: "equilibrio", alternativas_aceptadas: ["Equilibrio"] },
        { posicion: 2, respuesta_correcta: "igual", alternativas_aceptadas: ["la misma", "idéntica"] },
        { posicion: 3, respuesta_correcta: "concentraciones", alternativas_aceptadas: ["concentración"] },
        { posicion: 4, respuesta_correcta: "reactivos", alternativas_aceptadas: ["reactantes"] },
        { posicion: 5, respuesta_correcta: "temperatura", alternativas_aceptadas: ["Temperatura"] },
        { posicion: 6, respuesta_correcta: "derecha", alternativas_aceptadas: ["los productos"] },
        { posicion: 7, respuesta_correcta: "Châtelier", alternativas_aceptadas: ["Chatelier", "Châtelier"] },
        { posicion: 8, respuesta_correcta: "menos", alternativas_aceptadas: ["menor"] },
      ],
    },
  },

  // ── A7 — AUTOEVALUACIÓN ───────────────────────────────────────────────────
  {
    titulo: "¿Cómo voy con el equilibrio químico?",
    descripcion: "Evalúa tu propio dominio de los conceptos de esta progresión.",
    tipo: "autoevaluacion",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Marca con honestidad qué tan seguro te sientes en cada punto. No hay respuestas correctas: te sirve para saber qué repasar.",
      criterios: [
        {
          descripcion: "Distingo una reacción reversible (⇌) de una irreversible (→) y reconozco el equilibrio como un estado dinámico.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Escribo y uso la constante de equilibrio Kc = [productos]^coef / [reactivos]^coef.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Calculo el cociente Q y lo comparo con Kc para predecir el sentido de la reacción.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Aplico el principio de Le Châtelier para predecir el efecto de cambiar concentración, presión o temperatura.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
      ],
      reflexion_final_prompt: "¿Qué idea del equilibrio químico te costó más entender (el carácter dinámico, la constante Kc, el cociente Q o Le Châtelier) y cómo podrías repasarla con un ejemplo real de tu entorno?",
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

  console.log(`\n🌱 CNEYT-IV·O3 — Equilibrio químico  (${apply ? "APLICAR" : "DRY-RUN"})\n`);

  // UAC
  const { data: uac, error: uacErr } = await sb.from("uac").select("id, total_progresiones").eq("codigo", UAC_CODIGO).single();
  if (uacErr || !uac) throw new Error(`UAC ${UAC_CODIGO} no encontrada: ${uacErr?.message}`);

  // ¿numero=3 libre? (no debe existir otra progresión con ese numero)
  const { data: choque } = await sb.from("progresiones").select("codigo").eq("uac_id", uac.id).eq("numero", PROG_NUMERO).maybeSingle();
  if (choque && choque.codigo !== PROG_CODIGO) {
    throw new Error(`numero=${PROG_NUMERO} ya está ocupado por ${choque.codigo} — abortado para no chocar.`);
  }

  // ¿codigo CNEYT-IV-P10 libre? (no debe pisar otra progresión existente)
  const { data: choqueCod } = await sb.from("progresiones").select("numero").eq("codigo", PROG_CODIGO).maybeSingle();
  if (choqueCod && choqueCod.numero !== PROG_NUMERO) {
    throw new Error(`codigo ${PROG_CODIGO} ya existe con numero=${choqueCod.numero} — abortado para no pisar.`);
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

  console.log(`\n✅ CNEYT-IV·O3 sembrado (borrador). Ruta práctica:`);
  console.log(`   http://localhost:3000/hub/uac/${UAC_CODIGO}/progresion/${PROG_NUMERO}/actividad/2/practica\n`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e.message); process.exit(1); });
