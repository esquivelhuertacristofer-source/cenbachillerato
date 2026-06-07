/**
 * Seed del propósito formativo PM-VI·O8 (numero=8) — hueco del re-alineamiento 2025.
 *
 *   Propósito formativo O8 (verbatim, contenido-2025.ts PM-VI propositos[7]):
 *     "Explica un evento aleatorio cuyo comportamiento puede describirse a través
 *      del estudio de la distribución normal, para calcular la probabilidad."
 *   Contenido formativo C8 (verbatim, contenido-2025.ts PM-VI contenidos[7]):
 *     "Distribución normal · Medidas de tendencia central · Medidas de dispersión"
 *
 * Crea la progresión PM-VI-P09 (numero=8) + 7 actividades, TODAS estado='borrador'
 * (regla: el contenido nuevo queda sin publicar hasta aprobación explícita).
 * La actividad A2 (ejercicio_matematico) lleva el laboratorio 3D "distribucion-normal".
 *
 * Idempotente: upsert por "codigo". Recuenta uac.total_progresiones al final.
 *
 * Uso:
 *   npx tsx scripts/seed-pmvi-o8-normal.ts            (dry-run: solo describe)
 *   npx tsx scripts/seed-pmvi-o8-normal.ts --apply    (aplica los upserts)
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createSB, upsertActividad, type ActividadInput, type SB } from "./lib/activity-utils";

const UAC_CODIGO = "PM-VI";
const PROG_CODIGO = "PM-VI-P09";
const PROG_NUMERO = 8;
const LAB_SLUG = "distribucion-normal";

const META = "Aplique procedimientos, técnicas y lenguaje matemático para plantear posibles soluciones a problemas derivados de fenómenos naturales o sociales, cuyo comportamiento puede describirse probabilísticamente y contribuir a una toma de decisiones fundamentada.";

// Propósito y contenido VERBATIM (contenido-2025.ts PM-VI)
const O8 = "Explica un evento aleatorio cuyo comportamiento puede describirse a través del estudio de la distribución normal, para calcular la probabilidad.";
const C8 = "Distribución normal Medidas de tendencia central Medidas de dispersión";

const PROGRESION = {
  codigo: PROG_CODIGO,
  numero: PROG_NUMERO,
  titulo: O8,
  descripcion: "Modela un evento aleatorio con la distribución normal (campana de Gauss): la describe con su media μ (tendencia central) y su desviación estándar σ (dispersión), usa la regla empírica 68-95-99.7 y la puntuación z = (x−μ)/σ para estandarizar, y calcula la probabilidad como el área bajo la curva entre dos valores, sobre fenómenos reales de México (estaturas ENSANUT, puntajes PLANEA/PISA, CI).",
  descripcion_extendida: `${O8} Contenidos formativos: ${C8}.`,
  meta_aprendizaje: META,
  categoria: "Pensamiento estadístico y probabilístico",
  subcategoria: "Distribución normal y probabilidad",
  ejes_articuladores: ["Pensamiento crítico"],
  transversalidades: [] as string[],
  tiempo_estimado_horas: 3,
};

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido"> & { estado: "borrador" };

const ACTIVIDADES: Act[] = [
  // ── A1 — LECTURA ──────────────────────────────────────────────────────────
  {
    titulo: "La distribución normal: la campana que describe el mundo",
    descripcion: "Lee qué es la distribución normal, cómo la definen la media μ y la desviación σ, qué dice la regla empírica y cómo el área bajo la curva es una probabilidad.",
    tipo: "lectura",
    xp: 10,
    estado: "borrador",
    contenido: {
      texto:
        "Si mides la estatura de miles de personas, el peso de los costales de maíz de una cosecha o las calificaciones de un examen nacional, descubres algo asombroso: los valores no se reparten al azar de cualquier manera, sino que se AMONTONAN cerca de un promedio y se vuelven cada vez más raros en los extremos. Al graficar cuántos casos hay de cada valor aparece una curva suave en forma de campana simétrica: la DISTRIBUCIÓN NORMAL, también llamada campana de Gauss. Es el modelo de probabilidad más importante de la estadística porque describe innumerables fenómenos naturales y sociales.\n\n" +
        "DOS NÚMEROS LA DEFINEN. Una distribución normal queda totalmente determinada por dos cantidades. La MEDIA μ (mu) es una medida de tendencia central: marca el CENTRO de la campana, su eje de simetría, el valor más típico. La DESVIACIÓN ESTÁNDAR σ (sigma) es una medida de dispersión: dice qué tan ANCHA es la campana, es decir qué tan lejos del centro suelen estar los datos. Si σ es pequeña, la campana es alta y angosta (los datos se parecen mucho entre sí); si σ es grande, la campana es baja y ancha (hay mucha variación). Cambiar μ DESPLAZA la campana a izquierda o derecha sin deformarla; cambiar σ la ENSANCHA o la estrecha.\n\n" +
        "MEDIA, MEDIANA Y MODA COINCIDEN. Como la campana es perfectamente simétrica respecto a μ, en una distribución normal las tres medidas de tendencia central —media, mediana y moda— caen en el mismo punto: μ. Ese es un sello de la normalidad.\n\n" +
        "LA REGLA EMPÍRICA 68-95-99.7. La forma de la campana hace que las áreas a cierto número de desviaciones del centro sean siempre las mismas, sin importar el fenómeno. Aproximadamente el 68 % de los datos cae dentro de μ ± 1σ (a una desviación de la media); cerca del 95 % cae en μ ± 2σ; y el 99.7 % en μ ± 3σ. Es decir, casi todo (el 99.7 %) está a menos de tres desviaciones del centro, y salirse de ese rango es rarísimo. Esta «regla empírica» permite estimar probabilidades de memoria.\n\n" +
        "EL ÁREA ES LA PROBABILIDAD. Bajo la curva normal, el ÁREA total vale 1 (el 100 % de los casos). Y el área entre dos valores a y b es exactamente la PROBABILIDAD de que la variable caiga en ese rango: P(a ≤ X ≤ b). Calcular probabilidades con la normal es, literalmente, medir áreas bajo la campana.\n\n" +
        "LA PUNTUACIÓN z. ¿Cómo comparar un dato de un fenómeno con otro de un fenómeno distinto, o cómo calcular esas áreas? Se ESTANDARIZA con la puntuación z = (x − μ)/σ, que dice cuántas desviaciones estándar está un valor por encima (z > 0) o por debajo (z < 0) de la media. La z convierte CUALQUIER normal en la NORMAL ESTÁNDAR (μ = 0, σ = 1), para la que existen tablas y la función Φ(z) = P(Z ≤ z). Así, una estatura de 184 cm en una población con μ = 170 y σ = 7 tiene z = (184 − 170)/7 = 2: está dos desviaciones por encima del promedio, igual de excepcional que un 700 en una prueba con μ = 500 y σ = 100.\n\n" +
        "EN MÉXICO Y EN EL MUNDO. La ENSANUT (INEGI y Secretaría de Salud) describe estaturas y pesos de la población con campanas normales; las pruebas PLANEA (SEP) y PISA (OCDE) escalan sus puntajes a una normal con media y desviación fijas para comparar generaciones y países; las escalas de coeficiente intelectual se diseñan normales con μ = 100 y σ = 15. Entender la distribución normal permite estimar qué tan común o raro es un valor y tomar decisiones fundamentadas con probabilidades.",
      fuente: "MCCEMS 2025 — Pensamiento Matemático VI «Pensamiento estadístico y probabilístico», contenido formativo: Distribución normal · Medidas de tendencia central · Medidas de dispersión.",
      nivel_lectura: "intermedio",
      tiempo_estimado_minutos: 13,
      preguntas_comprension: [
        { pregunta: "¿Qué representan la media μ y la desviación estándar σ en una distribución normal?", respuesta_guia: "μ es una medida de tendencia central: el centro y eje de simetría de la campana. σ es una medida de dispersión: qué tan ancha es la campana, es decir qué tan lejos del centro suelen estar los datos." },
        { pregunta: "¿Qué dice la regla empírica 68-95-99.7?", respuesta_guia: "Que aprox. el 68 % de los datos cae en μ±1σ, el 95 % en μ±2σ y el 99.7 % en μ±3σ; casi todo está a menos de tres desviaciones del centro." },
        { pregunta: "¿Cómo se relacionan el área bajo la curva y la puntuación z con la probabilidad?", respuesta_guia: "El área bajo la campana entre a y b es la probabilidad P(a≤X≤b) (el área total vale 1). La puntuación z=(x−μ)/σ estandariza cualquier normal a la normal estándar (μ=0, σ=1) para calcular esa área con Φ(z)." },
      ],
    },
  },

  // ── A2 — EJERCICIO MATEMÁTICO (lleva el lab 3D) ───────────────────────────
  {
    titulo: "Estaturas en México: probabilidad bajo la campana (μ = 170, σ = 7)",
    descripcion: "Usa la regla empírica y la puntuación z para calcular probabilidades sobre una distribución normal real, y compruébalo en el laboratorio 3D.",
    tipo: "ejercicio_matematico",
    xp: 15,
    estado: "borrador",
    contenido: {
      instrucciones: "Resuelve a mano y comprueba en el laboratorio 3D: elige el fenómeno «estaturas» (μ = 170 cm, σ = 7 cm). En modo «Regla 68-95-99.7» observa las bandas; en «Probabilidad / z» mueve los extremos a [163, 177] y luego lleva b a 184 para ver el área y las puntuaciones z.",
      problema:
        "La estatura de los hombres adultos en México se modela con una distribución normal de media μ = 170 cm y desviación estándar σ = 7 cm.\n\n" +
        "a) REGLA EMPÍRICA. ¿Qué porcentaje de la población mide entre 163 cm y 177 cm?\n\n" +
        "b) PUNTUACIÓN z. ¿Qué probabilidad hay de que una persona mida menos de 184 cm? Estandariza con z = (x − μ)/σ y usa Φ(2) ≈ 0.9772.\n\n" +
        "c) INTERVALO CENTRAL. ¿Entre qué dos estaturas se encuentra el 95 % central de la población?",
      contexto: "Los tres incisos recorren el contenido formativo de la progresión: la distribución normal descrita por sus medidas de tendencia central (μ) y de dispersión (σ), la regla empírica, y el cálculo de probabilidad como área bajo la curva con la puntuación z. En el laboratorio 3D el fenómeno «estaturas» trae justo estos parámetros, y los modos «Regla 68-95-99.7» y «Probabilidad / z» hacen visible cada inciso sobre la campana.",
      tipo_respuesta: "desarrollo",
      pasos_guia: [
        "a) 163 = 170 − 7 = μ − σ y 177 = 170 + 7 = μ + σ: es el intervalo μ ± 1σ. Por la regla empírica, ahí cae el 68 % (más exacto, 68.27 %) de la población.",
        "b) Estandariza 184 cm: z = (184 − 170)/7 = 14/7 = 2. P(X < 184) = P(Z < 2) = Φ(2) ≈ 0.9772 = 97.72 %. Casi todos miden menos de 184 cm.",
        "c) El 95 % central corresponde a μ ± 2σ = 170 ± 2·7 = 170 ± 14, es decir el intervalo [156, 184] cm.",
      ],
      respuesta_final: "a) 68 % (68.27 %), porque [163, 177] = μ ± 1σ. b) z = 2 ⇒ P(X < 184) = Φ(2) ≈ 97.72 %. c) μ ± 2σ = [156, 184] cm contiene el 95 % central.",
      unidades: "estatura en cm; probabilidades en % (o fracción de 1)",
      tolerancia_error: 0.5,
    },
  },

  // ── A3 — REFLEXIÓN ESCRITA ────────────────────────────────────────────────
  {
    titulo: "¿Qué fenómeno de tu entorno se distribuye como una campana?",
    descripcion: "Reflexiona sobre un fenómeno real que pueda modelarse con una distribución normal y razona qué decisiones permite tomar.",
    tipo: "reflexion_escrita",
    xp: 20,
    estado: "borrador",
    contenido: {
      prompt:
        "Elige un fenómeno aleatorio de tu entorno que creas que se distribuye de forma aproximadamente normal —por ejemplo: las estaturas o pesos de tu grupo, los tiempos que tardas en llegar a la escuela, las calificaciones de un examen, el contenido real de los paquetes de un producto— y descríbelo como una campana. Explica qué representarían la media μ (el valor típico, una medida de tendencia central) y la desviación estándar σ (qué tan dispersos están los datos), y aplica la regla empírica: ¿entre qué valores caería el 68 % y el 95 % de los casos? Luego plantea una pregunta de probabilidad sobre tu fenómeno (por ejemplo «¿qué tan raro sería un valor por encima de μ + 2σ?»), explica cómo la responderías con la puntuación z = (x−μ)/σ y el área bajo la curva, y qué DECISIÓN fundamentada permitiría esa probabilidad. Indica cómo lo comprobarías en el laboratorio 3D.",
      pistas: [
        "μ es el centro de la campana (media = mediana = moda); σ mide qué tan ancha es.",
        "Regla empírica: ~68 % en μ±1σ, ~95 % en μ±2σ, ~99.7 % en μ±3σ.",
        "La puntuación z = (x−μ)/σ dice a cuántas desviaciones del centro está un valor; con ella se calcula el área (probabilidad).",
        "Un valor por encima de μ + 2σ ocurre en menos del 2.5 % de los casos: es raro, y eso puede justificar una decisión (revisar, alertar, premiar).",
      ],
      longitud_minima_palabras: 100,
      formato_esperado: "libre",
      criterios_evaluacion: [
        "Identifica un fenómeno real plausible de modelar con una distribución normal y describe qué representan μ (tendencia central) y σ (dispersión).",
        "Aplica la regla empírica para acotar dónde cae el 68 % y el 95 % de los casos.",
        "Plantea una pregunta de probabilidad, explica cómo resolverla con la puntuación z y el área bajo la curva, y conecta la respuesta con una decisión fundamentada y con el laboratorio 3D.",
      ],
    },
  },

  // ── A4 — QUIZ VERDADERO / FALSO ───────────────────────────────────────────
  {
    titulo: "Verdadero o falso: la campana de Gauss, μ, σ y la probabilidad",
    descripcion: "Pon a prueba lo que entendiste sobre la distribución normal, la regla empírica, la puntuación z y el área como probabilidad.",
    tipo: "quiz_verdadero_falso",
    xp: 10,
    estado: "borrador",
    contenido: {
      preguntas: [
        { enunciado: "Una distribución normal queda totalmente definida por su media μ y su desviación estándar σ.", respuesta: true, retroalimentacion: "Correcto: μ fija el centro y σ el ancho; con esos dos números la campana queda completamente determinada." },
        { enunciado: "Cuanto mayor es σ, más alta y angosta es la campana.", respuesta: false, retroalimentacion: "Falso: al revés. A mayor σ la campana es más ANCHA y baja (más dispersión); a menor σ, más alta y angosta." },
        { enunciado: "En una distribución normal, la media, la mediana y la moda coinciden en μ.", respuesta: true, retroalimentacion: "Correcto: como la campana es simétrica respecto a μ, las tres medidas de tendencia central caen en el mismo punto." },
        { enunciado: "Según la regla empírica, alrededor del 95 % de los datos cae dentro de μ ± 1σ.", respuesta: false, retroalimentacion: "Falso: dentro de μ±1σ cae ~68 %. El ~95 % corresponde a μ±2σ y el ~99.7 % a μ±3σ." },
        { enunciado: "El área bajo la curva normal entre a y b es la probabilidad P(a ≤ X ≤ b), y el área total vale 1.", respuesta: true, retroalimentacion: "Correcto: calcular probabilidades con la normal es medir áreas bajo la campana; el área total (100 %) vale 1." },
        { enunciado: "La puntuación z = (x − μ)/σ indica cuántas desviaciones estándar está un valor respecto de la media.", respuesta: true, retroalimentacion: "Correcto: z estandariza el valor (z>0 por encima, z<0 por debajo de μ) y convierte cualquier normal en la normal estándar μ=0, σ=1." },
      ],
    },
  },

  // ── A5 — GLOSARIO INTERACTIVO ─────────────────────────────────────────────
  {
    titulo: "Glosario: distribución normal, tendencia central y dispersión",
    descripcion: "Términos clave para entender la campana de Gauss, sus parámetros y el cálculo de probabilidad.",
    tipo: "glosario_interactivo",
    xp: 15,
    estado: "borrador",
    contenido: {
      terminos: [
        { termino: "Distribución normal", definicion: "Modelo de probabilidad en forma de campana simétrica, definido por su media μ y su desviación σ.", ejemplo: "Estaturas, errores de medición y puntajes estandarizados suelen seguirla." },
        { termino: "Media (μ)", definicion: "Medida de tendencia central; el centro y eje de simetría de la campana.", ejemplo: "μ = 170 cm en las estaturas de adultos." },
        { termino: "Desviación estándar (σ)", definicion: "Medida de dispersión; qué tan lejos de la media suelen estar los datos. A mayor σ, más ancha la campana.", ejemplo: "σ = 7 cm en las estaturas." },
        { termino: "Varianza (σ²)", definicion: "El cuadrado de la desviación estándar; también mide la dispersión de los datos.", ejemplo: "σ = 7 cm ⇒ σ² = 49 cm²." },
        { termino: "Regla empírica 68-95-99.7", definicion: "En una normal, ~68 % de los datos caen en μ±1σ, ~95 % en μ±2σ y ~99.7 % en μ±3σ.", ejemplo: "Entre 156 y 184 cm cae el 95 % de las estaturas." },
        { termino: "Puntuación z", definicion: "z = (x − μ)/σ: número de desviaciones estándar que un valor está por encima (z>0) o por debajo (z<0) de la media.", ejemplo: "184 cm con μ=170, σ=7 ⇒ z = 2." },
        { termino: "Área = probabilidad", definicion: "El área bajo la curva entre a y b es P(a ≤ X ≤ b); el área total vale 1.", ejemplo: "P(163 ≤ X ≤ 177) ≈ 0.68." },
        { termino: "Normal estándar", definicion: "La normal con μ = 0 y σ = 1; cualquier normal se convierte a ella con la puntuación z.", ejemplo: "Φ(z) = P(Z ≤ z); Φ(2) ≈ 0.9772." },
        { termino: "Medidas de tendencia central", definicion: "Media, mediana y moda; en una normal perfecta las tres coinciden en μ.", ejemplo: "media = mediana = moda = 170 cm." },
        { termino: "Medidas de dispersión", definicion: "Rango, varianza y desviación estándar; cuantifican qué tan esparcidos están los datos.", ejemplo: "Una σ mayor significa datos más dispersos." },
      ],
      actividad_final: "Para una normal con μ = 100 y σ = 15 (escala de CI): (1) ¿entre qué valores cae el 68 %? (2) ¿y el 95 %? (3) calcula la z de 130 y di qué tan raro es. Comprueba cada uno en el laboratorio 3D con el fenómeno «CI».",
    },
  },

  // ── A6 — COMPLETAR ESPACIOS ───────────────────────────────────────────────
  {
    titulo: "Completa: la campana, sus parámetros y la probabilidad",
    descripcion: "Completa el texto con los términos correctos sobre la distribución normal y el cálculo de probabilidad.",
    tipo: "fill_blanks",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Arrastra o escribe la palabra correcta en cada espacio.",
      texto_con_huecos:
        "La distribución ___ tiene forma de campana simétrica y queda definida por dos números: la media ___, que marca el centro, y la desviación estándar ___, que mide la dispersión. Por la regla empírica, alrededor del ___ % de los datos cae dentro de μ ± 1σ y el 95 % dentro de μ ± ___σ. El ___ bajo la curva entre dos valores es la probabilidad de caer en ese rango, y el área total vale ___. Para calcularla se estandariza con la puntuación ___ = (x − μ)/σ.",
      huecos: [
        { posicion: 0, respuesta_correcta: "normal", alternativas_aceptadas: ["Normal"] },
        { posicion: 1, respuesta_correcta: "μ", alternativas_aceptadas: ["mu", "media"] },
        { posicion: 2, respuesta_correcta: "σ", alternativas_aceptadas: ["sigma", "desviación estándar"] },
        { posicion: 3, respuesta_correcta: "68", alternativas_aceptadas: ["68%"] },
        { posicion: 4, respuesta_correcta: "2", alternativas_aceptadas: ["dos"] },
        { posicion: 5, respuesta_correcta: "área", alternativas_aceptadas: ["area", "Área"] },
        { posicion: 6, respuesta_correcta: "1", alternativas_aceptadas: ["uno", "100%"] },
        { posicion: 7, respuesta_correcta: "z", alternativas_aceptadas: ["Z"] },
      ],
    },
  },

  // ── A7 — AUTOEVALUACIÓN ───────────────────────────────────────────────────
  {
    titulo: "¿Cómo voy con la distribución normal?",
    descripcion: "Evalúa tu propio dominio de los conceptos de esta progresión.",
    tipo: "autoevaluacion",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Marca con honestidad qué tan seguro te sientes en cada punto. No hay respuestas correctas: te sirve para saber qué repasar.",
      criterios: [
        {
          descripcion: "Entiendo que la distribución normal es una campana definida por su media μ (centro) y su desviación σ (ancho).",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Uso la regla empírica 68-95-99.7 para acotar dónde cae la mayoría de los datos.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Calculo la puntuación z = (x − μ)/σ e interpreto qué tan lejos del centro está un valor.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Interpreto el área bajo la curva como la probabilidad de que un valor caiga en un rango.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
      ],
      reflexion_final_prompt: "¿Qué idea de la distribución normal te costó más entender y cómo podrías repasarla con un ejemplo real de tu entorno (estaturas, calificaciones o tiempos)?",
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

  console.log(`\n🌱 PM-VI·O8 — Distribución normal  (${apply ? "APLICAR" : "DRY-RUN"})\n`);

  // UAC
  const { data: uac, error: uacErr } = await sb.from("uac").select("id, total_progresiones").eq("codigo", UAC_CODIGO).single();
  if (uacErr || !uac) throw new Error(`UAC ${UAC_CODIGO} no encontrada: ${uacErr?.message}`);

  // ¿numero=8 libre? (no debe existir otra progresión con ese numero)
  const { data: choque } = await sb.from("progresiones").select("codigo").eq("uac_id", uac.id).eq("numero", PROG_NUMERO).maybeSingle();
  if (choque && choque.codigo !== PROG_CODIGO) {
    throw new Error(`numero=${PROG_NUMERO} ya está ocupado por ${choque.codigo} — abortado para no chocar.`);
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

  console.log(`\n✅ PM-VI·O8 sembrado (borrador). Ruta práctica:`);
  console.log(`   http://localhost:3000/hub/uac/${UAC_CODIGO}/progresion/${PROG_NUMERO}/actividad/2/practica\n`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e.message); process.exit(1); });
