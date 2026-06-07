/**
 * Seed del propósito formativo CNEYT-IV·O8 (numero=8) — hueco del re-alineamiento 2025.
 *
 *   Propósito formativo O8 (verbatim, contenido-2025.ts CNEYT-IV propositos[7]):
 *     "Comprende los procesos químicos involucrados en la respiración aerobia y
 *      anaerobia, para identificar su importancia para los seres vivos y el
 *      bienestar humano y desarrollos tecnológicos vinculados."
 *   Contenido formativo C8 (verbatim, contenido-2025.ts CNEYT-IV contenidos[7]):
 *     "Aspectos químicos de la glucólisis, ciclo de Krebs y cadena transportadora
 *      de electrones · Aspectos químicos de la fermentación · Desarrollos
 *      tecnológicos vinculados con la respiración aerobia y anaerobia"
 *
 * Crea la progresión CNEYT-IV-P11 (numero=8) + 7 actividades, TODAS estado='borrador'
 * (regla: el contenido nuevo queda sin publicar hasta aprobación explícita).
 * La actividad A2 (ejercicio_matematico) lleva el laboratorio 3D "respiracion-celular".
 *
 * Idempotente: upsert por "codigo". Recuenta uac.total_progresiones al final.
 *
 * Uso:
 *   npx tsx scripts/seed-cneyt4-o8-respiracion.ts            (dry-run: solo describe)
 *   npx tsx scripts/seed-cneyt4-o8-respiracion.ts --apply    (aplica los upserts)
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createSB, upsertActividad, type ActividadInput, type SB } from "./lib/activity-utils";

const UAC_CODIGO = "CNEYT-IV";
const PROG_CODIGO = "CNEYT-IV-P11";
const PROG_NUMERO = 8;
const LAB_SLUG = "respiracion-celular";

const META = "Comprenda la química como el estudio de la estructura, propiedades y transformación de la materia, para construir explicaciones sobre diversos fenómenos naturales.";

// Propósito y contenido VERBATIM (contenido-2025.ts CNEYT-IV)
const O8 = "Comprende los procesos químicos involucrados en la respiración aerobia y anaerobia, para identificar su importancia para los seres vivos y el bienestar humano y desarrollos tecnológicos vinculados.";
const C8 = "Aspectos químicos de la glucólisis, ciclo de Krebs y cadena transportadora de electrones Aspectos químicos de la fermentación Desarrollos tecnológicos vinculados con la respiración aerobia y anaerobia";

const PROGRESION = {
  codigo: PROG_CODIGO,
  numero: PROG_NUMERO,
  titulo: O8,
  descripcion: "Estudia cómo las células obtienen energía (ATP) de la glucosa. Sigue la glucólisis (glucosa → 2 piruvato, +2 ATP netos), y según haya o no oxígeno: la respiración AEROBIA (oxidación del piruvato, ciclo de Krebs y cadena transportadora de electrones, ~38 ATP teóricos, ecuación global C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O) o la FERMENTACIÓN anaerobia (láctica → ácido láctico; alcohólica → etanol + CO₂, solo 2 ATP). Compara su rendimiento energético y conecta con desarrollos tecnológicos de México: tequila y mezcal, pan, yogur y biogás.",
  descripcion_extendida: `${O8} Contenidos formativos: ${C8}.`,
  meta_aprendizaje: META,
  categoria: "El poder de la química",
  subcategoria: "Respiración aerobia y anaerobia",
  ejes_articuladores: ["Pensamiento crítico"],
  transversalidades: [] as string[],
  tiempo_estimado_horas: 3,
};

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido"> & { estado: "borrador" };

const ACTIVIDADES: Act[] = [
  // ── A1 — LECTURA ──────────────────────────────────────────────────────────
  {
    titulo: "Cómo la célula saca energía a la glucosa: respiración aerobia y anaerobia",
    descripcion: "Lee cómo la glucólisis, el ciclo de Krebs y la cadena transportadora producen ATP con oxígeno (aerobia), y cómo la fermentación lo logra sin él (anaerobia).",
    tipo: "lectura",
    xp: 10,
    estado: "borrador",
    contenido: {
      texto:
        "Cada célula de tu cuerpo necesita energía para vivir, y la obtiene de un combustible químico: la glucosa (C₆H₁₂O₆), un azúcar de seis carbonos. Pero la célula no «quema» la glucosa de golpe como una fogata; la desarma poco a poco en muchos pasos, y va guardando la energía liberada en una molécula recargable: el ATP (adenosín trifosfato), la «moneda energética» de la vida. Romper la glucosa hasta CO₂ y agua libera muchísima energía (ΔG ≈ −2870 kJ por mol), y la célula la captura en forma de ATP. Hay dos grandes rutas para hacerlo: la respiración AEROBIA (con oxígeno) y la respiración ANAEROBIA o fermentación (sin oxígeno).\n\n" +
        "PASO COMÚN: LA GLUCÓLISIS. Toda degradación de glucosa empieza igual, en el citoplasma y sin necesidad de oxígeno: la GLUCÓLISIS («ruptura del azúcar»). En una serie de reacciones, la glucosa (6 carbonos) se parte en dos moléculas de PIRUVATO (3 carbonos cada una). El balance neto es modesto pero clave: se gastan 2 ATP al inicio y se producen 4, así que quedan 2 ATP NETOS, más 2 moléculas de NADH (un transportador de electrones «cargado»). Lo que pase después con el piruvato depende de si hay oxígeno.\n\n" +
        "CON OXÍGENO: LA RESPIRACIÓN AEROBIA. Si hay O₂, el piruvato entra a la mitocondria y la célula extrae casi toda la energía restante en tres etapas. (1) OXIDACIÓN DEL PIRUVATO: cada piruvato se convierte en acetil-CoA, liberando CO₂ y generando NADH. (2) CICLO DE KREBS (o del ácido cítrico): el acetil-CoA se oxida por completo, soltando más CO₂ y cargando muchos transportadores (NADH y FADH₂), además de algo de ATP/GTP. (3) CADENA TRANSPORTADORA DE ELECTRONES: los NADH y FADH₂ entregan sus electrones a una cadena de proteínas en la membrana mitocondrial interna; la energía de esos electrones bombea protones y, al final, el O₂ actúa como ACEPTOR FINAL de electrones, combinándose con ellos y con protones para formar AGUA. Este flujo impulsa la síntesis de la mayor parte del ATP. La ecuación global de la respiración aerobia resume todo: C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O. El rendimiento teórico clásico es de unos 38 ATP por glucosa (en las células reales suele ser ~30–32 por los costos de transporte): muchísimo más que sin oxígeno.\n\n" +
        "SIN OXÍGENO: LA FERMENTACIÓN. Cuando falta O₂, la cadena transportadora se detiene y el NADH no puede descargarse ahí. La célula recurre a la FERMENTACIÓN: una ruta anaerobia que NO produce más ATP que la glucólisis (solo esos 2 ATP netos), pero que regenera el NAD⁺ para que la glucólisis no se frene. Hay dos tipos principales. En la FERMENTACIÓN LÁCTICA el piruvato se convierte en ácido láctico (lactato): ocurre en tus músculos durante un esfuerzo intenso —el ardor de un sprint— y en las bacterias que hacen el yogur y los quesos. En la FERMENTACIÓN ALCOHÓLICA el piruvato se transforma en etanol y CO₂: la realizan las levaduras, y es la base del pan (el CO₂ esponja la masa) y de bebidas como el pulque, el tequila y la cerveza.\n\n" +
        "AEROBIA vs ANAEROBIA: ¿POR QUÉ IMPORTA? La diferencia de rendimiento es enorme: ~38 ATP con oxígeno frente a solo 2 sin él, es decir unas 19 veces más energía por glucosa. Por eso los organismos que respiran con oxígeno pueden sostener actividades costosas. Pero la fermentación es vital cuando el oxígeno escasea (en tus músculos al límite, o en microorganismos del suelo y del agua) y es la base de enormes desarrollos tecnológicos. En México, la fermentación sostiene industrias con denominación de origen como el tequila y el mezcal (a partir del agave de Jalisco y Oaxaca), además del pan, el yogur, el queso y la producción de BIOGÁS en biodigestores que convierten residuos orgánicos en combustible. Entender la química de la respiración —glucólisis, Krebs, cadena transportadora y fermentación— explica desde por qué respiras hasta cómo se hace una bebida o se genera energía limpia.",
      fuente: "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología IV «El poder de la química», contenido formativo: Aspectos químicos de la glucólisis, ciclo de Krebs y cadena transportadora de electrones · Aspectos químicos de la fermentación · Desarrollos tecnológicos vinculados con la respiración aerobia y anaerobia.",
      nivel_lectura: "intermedio",
      tiempo_estimado_minutos: 14,
      preguntas_comprension: [
        { pregunta: "¿Por qué la glucólisis es un paso común a la respiración aerobia y a la fermentación?", respuesta_guia: "Porque ambas rutas empiezan rompiendo la glucosa en 2 piruvato en el citoplasma, sin necesidad de oxígeno, con un saldo neto de 2 ATP y 2 NADH. Lo que cambia es el destino posterior del piruvato según haya (aerobia) o no (fermentación) oxígeno." },
        { pregunta: "¿Qué papel juega el oxígeno en la respiración aerobia y qué se forma con él?", respuesta_guia: "El O₂ es el aceptor final de electrones en la cadena transportadora: recibe los electrones que vienen del NADH y FADH₂ y, junto con protones, forma agua (H₂O). Sin ese aceptor la cadena se detiene y no se produce la mayor parte del ATP." },
        { pregunta: "¿Por qué la respiración aerobia rinde mucho más ATP que la fermentación?", respuesta_guia: "Porque la aerobia oxida por completo la glucosa hasta CO₂ y H₂O (glucólisis + Krebs + cadena transportadora), extrayendo ~38 ATP; la fermentación solo aprovecha la glucólisis (2 ATP netos) y usa el resto de los pasos únicamente para regenerar NAD⁺, sin generar más ATP. Son unas 19 veces más con oxígeno." },
      ],
    },
  },

  // ── A2 — EJERCICIO MATEMÁTICO (lleva el lab 3D) ───────────────────────────
  {
    titulo: "Balance de ATP: respiración aerobia vs fermentación (C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O)",
    descripcion: "Calcula el ATP que rinde cada vía, cuántas veces gana la aerobia y el O₂/CO₂ implicados; compruébalo en el laboratorio 3D.",
    tipo: "ejercicio_matematico",
    xp: 15,
    estado: "borrador",
    contenido: {
      instrucciones: "Resuelve a mano y comprueba en el laboratorio 3D: en el modo «Aerobia» recorre glucólisis → Krebs → cadena transportadora y observa el conteo de ATP; en la calculadora elige la vía y escribe los moles de glucosa para ver ATP, O₂, CO₂, H₂O y la eficiencia; usa el modo «Fermentación» y «Comparar» para contrastar el rendimiento.",
      problema:
        "La degradación de la glucosa rinde distinta energía según haya o no oxígeno.\n\n" +
        "a) FERMENTACIÓN. La fermentación (anaerobia) aprovecha solo la glucólisis. ¿Cuántos ATP netos se obtienen por molécula de glucosa?\n\n" +
        "b) RESPIRACIÓN AEROBIA. Con oxígeno, la oxidación completa rinde el máximo teórico clásico. ¿Cuántos ATP por glucosa?\n\n" +
        "c) VENTAJA. ¿Cuántas veces más ATP rinde la respiración aerobia que la fermentación?\n\n" +
        "d) GASES. Según la ecuación global C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O, si una célula oxida por completo 5 mol de glucosa, ¿cuántos moles de O₂ consume y cuántos de CO₂ produce?",
      contexto: "Los incisos recorren el contenido formativo: los aspectos químicos de la glucólisis (a), de Krebs y la cadena transportadora que completan la aerobia (b), el contraste con la fermentación (c) y la estequiometría de la ecuación global (d). En el laboratorio 3D el modo «Aerobia» anima las tres etapas hasta el agua, el modo «Fermentación» muestra la vía láctica/alcohólica, y la calculadora computa ATP, O₂, CO₂ y eficiencia para los moles que elijas.",
      tipo_respuesta: "desarrollo",
      pasos_guia: [
        "a) La glucólisis gasta 2 ATP y produce 4 ⇒ saldo NETO = 2 ATP por glucosa. La fermentación no añade más ATP (solo regenera NAD⁺), así que rinde 2 ATP.",
        "b) Respiración aerobia (teórico clásico): 2 (glucólisis) + 2 (Krebs, GTP) + ~34 de la cadena transportadora a partir de NADH y FADH₂ ≈ 38 ATP por glucosa. (En células reales suele ser ~30–32 por los costos de transporte.)",
        "c) Ventaja = 38 / 2 = 19 ⇒ la respiración aerobia rinde unas 19 veces más ATP que la fermentación.",
        "d) La ecuación es 1:6 entre glucosa y O₂, y 1:6 entre glucosa y CO₂. Para 5 mol de glucosa: O₂ = 5 × 6 = 30 mol; CO₂ = 5 × 6 = 30 mol (y H₂O = 30 mol).",
      ],
      respuesta_final: "a) 2 ATP (solo la glucólisis). b) ~38 ATP teóricos (aerobia completa; ~30–32 reales). c) 19 veces más (38 ÷ 2). d) 30 mol de O₂ y 30 mol de CO₂ (y 30 mol de H₂O).",
      unidades: "ATP por molécula de glucosa; gases en mol",
      tolerancia_error: 0.01,
    },
  },

  // ── A3 — REFLEXIÓN ESCRITA ────────────────────────────────────────────────
  {
    titulo: "Aerobia o anaerobia en tu vida diaria",
    descripcion: "Reflexiona sobre un proceso de respiración aerobia o de fermentación de tu entorno y razona su química y su rendimiento energético.",
    tipo: "reflexion_escrita",
    xp: 20,
    estado: "borrador",
    contenido: {
      prompt:
        "Elige un proceso de tu vida diaria donde ocurra respiración aerobia o fermentación —por ejemplo: el ardor muscular de un sprint o de subir escaleras corriendo (fermentación láctica), la masa de pan que esponja o una bebida fermentada como el pulque/tequila (fermentación alcohólica), o simplemente tu respiración en reposo (aerobia)— y descríbelo químicamente. Indica de dónde sale la energía (glucosa → ATP), si interviene o no el oxígeno, y qué productos se forman (CO₂ y H₂O en la aerobia; ácido láctico o etanol + CO₂ en la fermentación). Compara su rendimiento (~38 ATP con oxígeno vs 2 sin él) y explica por qué el cuerpo o el microorganismo usa esa vía en ese momento. Conéctalo con un desarrollo tecnológico (pan, yogur, tequila, biogás) e indica cómo lo comprobarías en el laboratorio 3D.",
      pistas: [
        "Glucólisis: glucosa (6C) → 2 piruvato (3C), +2 ATP netos, sin oxígeno. Es el punto de partida común.",
        "Aerobia (con O₂): piruvato → Krebs → cadena transportadora; O₂ es el aceptor final y forma H₂O. ~38 ATP. Ecuación: C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O.",
        "Fermentación (sin O₂): láctica → ácido láctico (músculos, yogur); alcohólica → etanol + CO₂ (levaduras, pan, tequila). Solo 2 ATP.",
        "Ejemplo: en un sprint el músculo agota el O₂ y fermenta a lactato (rápido pero poco ATP); en reposo respira aerobiamente (lento pero mucho ATP).",
      ],
      longitud_minima_palabras: 100,
      formato_esperado: "libre",
      criterios_evaluacion: [
        "Identifica un proceso real de respiración aerobia o fermentación y lo describe químicamente (glucosa, ATP, papel del oxígeno, productos).",
        "Explica el rendimiento energético y por qué se usa esa vía en ese contexto (con o sin oxígeno).",
        "Conecta el proceso con un desarrollo tecnológico y con lo que mostraría el laboratorio 3D.",
      ],
    },
  },

  // ── A4 — QUIZ VERDADERO / FALSO ───────────────────────────────────────────
  {
    titulo: "Verdadero o falso: glucólisis, Krebs, cadena transportadora y fermentación",
    descripcion: "Pon a prueba lo que entendiste sobre la respiración aerobia, la fermentación y su rendimiento de ATP.",
    tipo: "quiz_verdadero_falso",
    xp: 10,
    estado: "borrador",
    contenido: {
      preguntas: [
        { enunciado: "La glucólisis parte la glucosa en dos moléculas de piruvato y ocurre sin necesidad de oxígeno.", respuesta: true, retroalimentacion: "Correcto: la glucólisis sucede en el citoplasma, no requiere oxígeno y rinde 2 piruvato más 2 ATP netos y 2 NADH." },
        { enunciado: "En la respiración aerobia el oxígeno es el aceptor final de electrones y se combina para formar agua.", respuesta: true, retroalimentacion: "Correcto: al final de la cadena transportadora el O₂ recibe los electrones y, con protones, forma H₂O." },
        { enunciado: "La fermentación produce mucho más ATP que la respiración aerobia.", respuesta: false, retroalimentacion: "Falso: es al revés. La fermentación rinde solo 2 ATP netos (los de la glucólisis), mientras la aerobia rinde ~38; unas 19 veces más." },
        { enunciado: "La ecuación global de la respiración aerobia es C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O.", respuesta: true, retroalimentacion: "Correcto: una glucosa se oxida con 6 O₂ produciendo 6 CO₂ y 6 H₂O." },
        { enunciado: "La fermentación alcohólica convierte el piruvato en ácido láctico.", respuesta: false, retroalimentacion: "Falso: la alcohólica produce etanol y CO₂ (levaduras, pan, tequila). La que produce ácido láctico es la fermentación láctica (músculos, yogur)." },
        { enunciado: "El ciclo de Krebs y la cadena transportadora de electrones ocurren en la mitocondria.", respuesta: true, retroalimentacion: "Correcto: tras la glucólisis (citoplasma), el piruvato entra a la mitocondria, donde suceden Krebs y la cadena transportadora." },
      ],
    },
  },

  // ── A5 — GLOSARIO INTERACTIVO ─────────────────────────────────────────────
  {
    titulo: "Glosario: ATP, glucólisis, Krebs, cadena transportadora y fermentación",
    descripcion: "Términos clave para entender cómo la célula obtiene energía con y sin oxígeno.",
    tipo: "glosario_interactivo",
    xp: 15,
    estado: "borrador",
    contenido: {
      terminos: [
        { termino: "ATP (adenosín trifosfato)", definicion: "La «moneda energética» de la célula; almacena y libera energía al ganar o perder un grupo fosfato.", ejemplo: "La respiración aerobia rinde ~38 ATP por glucosa." },
        { termino: "Glucosa", definicion: "Azúcar de seis carbonos (C₆H₁₂O₆) que sirve de combustible principal de la célula.", ejemplo: "Su oxidación completa libera ΔG ≈ −2870 kJ/mol." },
        { termino: "Glucólisis", definicion: "Primera etapa, en el citoplasma y sin oxígeno: la glucosa se parte en 2 piruvato con saldo de 2 ATP netos y 2 NADH.", ejemplo: "Es el paso común a la aerobia y a la fermentación." },
        { termino: "Piruvato", definicion: "Molécula de tres carbonos producto de la glucólisis; su destino depende de si hay oxígeno.", ejemplo: "Con O₂ va a la mitocondria; sin O₂ se fermenta." },
        { termino: "Respiración aerobia", definicion: "Oxidación completa de la glucosa con oxígeno (glucólisis + Krebs + cadena transportadora); rinde ~38 ATP.", ejemplo: "C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O." },
        { termino: "Ciclo de Krebs", definicion: "Etapa mitocondrial que oxida el acetil-CoA liberando CO₂ y cargando NADH y FADH₂.", ejemplo: "También se llama ciclo del ácido cítrico." },
        { termino: "Cadena transportadora de electrones", definicion: "Serie de proteínas de la membrana mitocondrial donde los electrones del NADH/FADH₂ impulsan la síntesis de la mayor parte del ATP; el O₂ es el aceptor final.", ejemplo: "Produce agua al combinar electrones, protones y O₂." },
        { termino: "Fermentación", definicion: "Respiración anaerobia (sin oxígeno) que solo aprovecha la glucólisis (2 ATP) y regenera NAD⁺.", ejemplo: "Permite a la célula seguir obteniendo algo de energía sin O₂." },
        { termino: "Fermentación láctica", definicion: "El piruvato se convierte en ácido láctico (lactato).", ejemplo: "El ardor muscular en un sprint; el yogur y el queso." },
        { termino: "Fermentación alcohólica", definicion: "El piruvato se convierte en etanol y CO₂, realizada por levaduras.", ejemplo: "El pan que esponja; el pulque, el tequila y la cerveza." },
        { termino: "NADH / FADH₂", definicion: "Transportadores que llevan electrones «cargados» a la cadena transportadora.", ejemplo: "Cada NADH rinde ~3 ATP y cada FADH₂ ~2 ATP." },
      ],
      actividad_final: "Para 2 mol de glucosa: (1) calcula el ATP por fermentación y por respiración aerobia; (2) indica el O₂ consumido y el CO₂ producido en la aerobia; (3) di qué producto da la fermentación láctica y cuál la alcohólica. Comprueba cada uno en el laboratorio 3D.",
    },
  },

  // ── A6 — COMPLETAR ESPACIOS ───────────────────────────────────────────────
  {
    titulo: "Completa: de la glucosa al ATP, con y sin oxígeno",
    descripcion: "Completa el texto con los términos correctos sobre la respiración aerobia y la fermentación.",
    tipo: "fill_blanks",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Arrastra o escribe la palabra correcta en cada espacio.",
      texto_con_huecos:
        "La degradación de la glucosa empieza con la ___, que la parte en dos moléculas de ___ y rinde 2 ATP netos sin necesidad de oxígeno. Si hay oxígeno, ocurre la respiración ___: el ciclo de ___ y la cadena transportadora de electrones, donde el ___ es el aceptor final y forma ___. Su ecuación global es C₆H₁₂O₆ + 6 O₂ → 6 ___ + 6 H₂O y rinde unos ___ ATP. Sin oxígeno ocurre la ___, que rinde solo 2 ATP: la láctica produce ácido ___ y la alcohólica produce etanol y CO₂.",
      huecos: [
        { posicion: 0, respuesta_correcta: "glucólisis", alternativas_aceptadas: ["glucolisis", "Glucólisis"] },
        { posicion: 1, respuesta_correcta: "piruvato", alternativas_aceptadas: ["piruvatos"] },
        { posicion: 2, respuesta_correcta: "aerobia", alternativas_aceptadas: ["aeróbica", "aerobica"] },
        { posicion: 3, respuesta_correcta: "Krebs", alternativas_aceptadas: ["krebs", "del ácido cítrico"] },
        { posicion: 4, respuesta_correcta: "oxígeno", alternativas_aceptadas: ["oxigeno", "O₂", "O2"] },
        { posicion: 5, respuesta_correcta: "agua", alternativas_aceptadas: ["H₂O", "H2O"] },
        { posicion: 6, respuesta_correcta: "CO₂", alternativas_aceptadas: ["CO2", "dióxido de carbono"] },
        { posicion: 7, respuesta_correcta: "38", alternativas_aceptadas: ["treinta y ocho"] },
        { posicion: 8, respuesta_correcta: "fermentación", alternativas_aceptadas: ["fermentacion", "respiración anaerobia"] },
        { posicion: 9, respuesta_correcta: "láctico", alternativas_aceptadas: ["lactico", "láctico (lactato)"] },
      ],
    },
  },

  // ── A7 — AUTOEVALUACIÓN ───────────────────────────────────────────────────
  {
    titulo: "¿Cómo voy con la respiración aerobia y anaerobia?",
    descripcion: "Evalúa tu propio dominio de los conceptos de esta progresión.",
    tipo: "autoevaluacion",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Marca con honestidad qué tan seguro te sientes en cada punto. No hay respuestas correctas: te sirve para saber qué repasar.",
      criterios: [
        {
          descripcion: "Explico la glucólisis como el paso común que parte la glucosa en 2 piruvato con 2 ATP netos.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Describo la respiración aerobia (Krebs y cadena transportadora) y su ecuación global C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Distingo la fermentación láctica de la alcohólica y sé que rinden solo 2 ATP.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Comparo el rendimiento energético (aerobia ~38 ATP vs fermentación 2 ATP) y lo conecto con desarrollos tecnológicos.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
      ],
      reflexion_final_prompt: "¿Qué idea de la respiración celular te costó más entender (la glucólisis, el ciclo de Krebs, la cadena transportadora o la fermentación) y cómo podrías repasarla con un ejemplo real de tu entorno?",
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

  console.log(`\n🌱 CNEYT-IV·O8 — Respiración aerobia y anaerobia  (${apply ? "APLICAR" : "DRY-RUN"})\n`);

  // UAC
  const { data: uac, error: uacErr } = await sb.from("uac").select("id, total_progresiones").eq("codigo", UAC_CODIGO).single();
  if (uacErr || !uac) throw new Error(`UAC ${UAC_CODIGO} no encontrada: ${uacErr?.message}`);

  // ¿numero=8 libre? (no debe existir otra progresión con ese numero)
  const { data: choque } = await sb.from("progresiones").select("codigo").eq("uac_id", uac.id).eq("numero", PROG_NUMERO).maybeSingle();
  if (choque && choque.codigo !== PROG_CODIGO) {
    throw new Error(`numero=${PROG_NUMERO} ya está ocupado por ${choque.codigo} — abortado para no chocar.`);
  }

  // ¿codigo CNEYT-IV-P11 libre? (no debe pisar otra progresión existente)
  const { data: choqueCod } = await sb.from("progresiones").select("numero").eq("codigo", PROG_CODIGO).maybeSingle();
  if (choqueCod && choqueCod.numero !== PROG_NUMERO) {
    throw new Error(`codigo ${PROG_CODIGO} ya existe con numero=${choqueCod.numero} — abortado para no pisar.`);
  }

  console.log(`Progresión ${PROG_CODIGO} (numero=${PROG_NUMERO}) — categoria "${PROGRESION.categoria}"`);
  console.log(`  titulo (O8 verbatim): ${PROGRESION.titulo}`);
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

  console.log(`\n✅ CNEYT-IV·O8 sembrado (borrador). Ruta práctica:`);
  console.log(`   http://localhost:3000/hub/uac/${UAC_CODIGO}/progresion/${PROG_NUMERO}/actividad/2/practica\n`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e.message); process.exit(1); });
