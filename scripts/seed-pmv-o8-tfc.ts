/**
 * Seed del propósito formativo PM-V·O8 (numero=8) — hueco del re-alineamiento 2025.
 *
 *   Propósito formativo O8 (verbatim, contenido-2025.ts PM-V propositos[7]):
 *     "Comprende intuitivamente el Teorema Fundamental del Cálculo como conexión
 *      entre derivadas e integrales y su utilidad para analizar fenómenos de
 *      acumulación de cambios continuos."
 *   Contenido formativo C8 (verbatim, contenido-2025.ts PM-V contenidos[7]):
 *     "Integral como función inversa de la derivada · Área bajo la curva de una
 *      función dentro de un intervalo · Representación gráfica"
 *
 * Crea la progresión PM-V-P10 (numero=8) + 7 actividades, TODAS estado='borrador'
 * (regla: el contenido nuevo queda sin publicar hasta aprobación explícita).
 * La actividad A2 (ejercicio_matematico) lleva el laboratorio 3D "teorema-fundamental-calculo".
 *
 * Idempotente: upsert por "codigo". Recuenta uac.total_progresiones al final.
 *
 * Uso:
 *   npx tsx scripts/seed-pmv-o8-tfc.ts            (dry-run: solo describe)
 *   npx tsx scripts/seed-pmv-o8-tfc.ts --apply    (aplica los upserts)
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createSB, upsertActividad, type ActividadInput, type SB } from "./lib/activity-utils";

const UAC_CODIGO = "PM-V";
const PROG_CODIGO = "PM-V-P10";
const PROG_NUMERO = 8;
const LAB_SLUG = "teorema-fundamental-calculo";

const META = "Analice fenómenos donde el cambio es parte central de su estudio con la finalidad de encontrar soluciones óptimas a problemas o situaciones en su entorno u otras áreas del conocimiento.";

// Propósito y contenido VERBATIM (contenido-2025.ts PM-V)
const O8 = "Comprende intuitivamente el Teorema Fundamental del Cálculo como conexión entre derivadas e integrales y su utilidad para analizar fenómenos de acumulación de cambios continuos.";
const C8 = "Integral como función inversa de la derivada Área bajo la curva de una función dentro de un intervalo Representación gráfica";

const PROGRESION = {
  codigo: PROG_CODIGO,
  numero: PROG_NUMERO,
  titulo: O8,
  descripcion: "Conecta la derivada con la integral a través del área bajo la curva: aproxima esa área con sumas de Riemann, reconoce la integral como la operación inversa de derivar (la antiderivada), y usa la función de acumulación F(x) = ∫ₐˣ f para analizar fenómenos donde un cambio continuo se va sumando (velocidad→distancia, caudal→volumen, potencia→energía).",
  descripcion_extendida: `${O8} Contenidos formativos: ${C8}.`,
  meta_aprendizaje: META,
  categoria: "Cálculo diferencial",
  subcategoria: "Teorema Fundamental del Cálculo e integral",
  ejes_articuladores: ["Pensamiento crítico"],
  transversalidades: [] as string[],
  tiempo_estimado_horas: 3,
};

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido"> & { estado: "borrador" };

const ACTIVIDADES: Act[] = [
  // ── A1 — LECTURA ──────────────────────────────────────────────────────────
  {
    titulo: "El Teorema Fundamental del Cálculo: derivar e integrar son inversas",
    descripcion: "Lee qué es el área bajo una curva, cómo se aproxima con sumas de Riemann y por qué derivar e integrar se deshacen mutuamente.",
    tipo: "lectura",
    xp: 10,
    estado: "borrador",
    contenido: {
      texto:
        "Durante este semestre aprendiste a DERIVAR: a medir qué tan rápido cambia una función en cada instante (su pendiente). El cálculo tiene una segunda gran operación, la INTEGRAL, que hace lo contrario: en vez de medir el ritmo del cambio, suma el cambio para obtener un TOTAL acumulado. El Teorema Fundamental del Cálculo (TFC) es el puente que conecta ambas ideas, y es uno de los resultados más importantes de toda la matemática.\n\n" +
        "LA INTEGRAL ES UN ÁREA. La INTEGRAL DEFINIDA de una función f entre x = a y x = b, escrita ∫ₐᵇ f(x) dx, es el ÁREA encerrada entre la curva y el eje X en ese intervalo. ¿Por qué un área? Porque si f representa un ritmo —por ejemplo una velocidad—, el área bajo su gráfica es el total acumulado de ese ritmo: la distancia recorrida. Bajo una gráfica velocidad–tiempo, el área es la distancia; bajo un caudal, el volumen; bajo la potencia eléctrica, la energía.\n\n" +
        "SUMAS DE RIEMANN. ¿Cómo se mide el área bajo una curva que no es un rectángulo ni un triángulo? La idea de Bernhard Riemann fue APROXIMARLA con rectángulos: se parte el intervalo [a, b] en n pedazos iguales de ancho (b−a)/n, sobre cada pedazo se levanta un rectángulo cuya altura es el valor de la función, y se suman sus áreas. Con pocos rectángulos la aproximación es burda (sobra o falta área); pero al usar cada vez MÁS rectángulos, más delgados, la suma se PEGA al área real. El área exacta es el límite de esas sumas cuando n tiende a infinito: esa es la integral.\n\n" +
        "LA ANTIDERIVADA. Sumar infinitos rectángulos sería imposible a mano. Aquí entra la otra cara del teorema: una ANTIDERIVADA (o primitiva) de f es una función F cuya derivada es f, es decir F′(x) = f(x). Por ejemplo, una antiderivada de f(x) = 2x es F(x) = x², porque la derivada de x² es 2x.\n\n" +
        "EL TEOREMA. El Teorema Fundamental del Cálculo dice dos cosas que son la misma vista desde dos lados. (1) Si construimos la FUNCIÓN DE ACUMULACIÓN F(x) = ∫ₐˣ f(t) dt —el área bajo f desde a hasta x—, entonces al derivarla recuperamos la función original: F′(x) = f(x). Derivar la acumulación deshace la integral. (2) Por eso, para calcular un área exacta no hace falta sumar rectángulos: basta encontrar una antiderivada F y restar sus valores en los extremos: ∫ₐᵇ f(x) dx = F(b) − F(a).\n\n" +
        "UN EJEMPLO QUE LO REÚNE TODO. Un objeto se mueve con velocidad v(t) = 2t (m/s). ¿Qué distancia recorre entre t = 0 y t = 4 s? Es el área bajo la gráfica v–t: un triángulo de base 4 y altura v(4) = 8, cuya área es ½·4·8 = 16 m. Con el TFC: una antiderivada de 2t es t², así que ∫₀⁴ 2t dt = [t²]₀⁴ = 16 − 0 = 16 m. Coinciden. Y la función de acumulación, la distancia d(t) = t², cumple d′(t) = 2t = v(t): derivar la distancia devuelve la velocidad. Eso es el Teorema Fundamental del Cálculo: integrar y derivar son operaciones inversas.",
      fuente: "MCCEMS 2025 — Pensamiento Matemático V «Cálculo diferencial», contenido formativo: Integral como función inversa de la derivada · Área bajo la curva de una función dentro de un intervalo · Representación gráfica.",
      nivel_lectura: "intermedio",
      tiempo_estimado_minutos: 13,
      preguntas_comprension: [
        { pregunta: "¿Qué representa geométricamente la integral definida ∫ₐᵇ f(x) dx?", respuesta_guia: "El área encerrada entre la curva y = f(x) y el eje X entre x = a y x = b; si f es un ritmo (velocidad, caudal, potencia), ese área es el total acumulado (distancia, volumen, energía)." },
        { pregunta: "¿Cómo aproximan las sumas de Riemann el área bajo una curva y qué pasa al aumentar n?", respuesta_guia: "Parten el intervalo en n rectángulos y suman sus áreas; al usar más rectángulos (más delgados) la suma se acerca cada vez más al área exacta, que es el límite cuando n→∞." },
        { pregunta: "¿Qué afirma el Teorema Fundamental del Cálculo sobre derivar e integrar?", respuesta_guia: "Que son operaciones inversas: la función de acumulación F(x)=∫ₐˣf cumple F′(x)=f(x), y por eso ∫ₐᵇ f = F(b) − F(a) con F una antiderivada de f." },
      ],
    },
  },

  // ── A2 — EJERCICIO MATEMÁTICO (lleva el lab 3D) ───────────────────────────
  {
    titulo: "Distancia como área: ∫₀⁴ 2t dt y el TFC",
    descripcion: "Calcula el área bajo una gráfica velocidad–tiempo, identifícala como la integral y verifica el Teorema Fundamental del Cálculo en el laboratorio 3D.",
    tipo: "ejercicio_matematico",
    xp: 15,
    estado: "borrador",
    contenido: {
      instrucciones: "Resuelve a mano y comprueba en el laboratorio 3D: elige la función f(x) = 2x del catálogo y lleva el límite a b = 4. En modo «Área» sube el número de rectángulos y mira cómo la suma de Riemann se acerca a 16; en «Acumulación» observa F(b) = 16; en «Conexión» comprueba que la pendiente de F en b es f(b).",
      problema:
        "Un objeto parte del reposo y se mueve con velocidad v(t) = 2t (en m/s, con t en segundos).\n\n" +
        "a) ÁREA = TOTAL. ¿Qué representa el área bajo la gráfica de v(t) entre t = 0 y t = 4 s?\n\n" +
        "b) CÁLCULO. Calcula esa área como la integral ∫₀⁴ 2t dt. Hazlo de dos formas: como el área del triángulo y con una antiderivada (∫ 2t dt = t²).\n\n" +
        "c) EL TEOREMA. La función de acumulación (la distancia) es d(t) = t². Verifica el Teorema Fundamental del Cálculo comprobando que d′(t) = v(t).",
      contexto: "Los tres incisos recorren el contenido formativo de la progresión: el área bajo la curva en un intervalo (a), la integral como cálculo de esa área usando una antiderivada (b), y la integral como función inversa de la derivada (c). En el laboratorio 3D la función v = 2t está en el catálogo y los tres modos —rectángulos de Riemann, función de acumulación y la recta tangente cuya pendiente es f(b)— hacen visible cada inciso sobre el plano cartesiano.",
      tipo_respuesta: "desarrollo",
      pasos_guia: [
        "a) El área bajo la gráfica velocidad–tiempo es la DISTANCIA recorrida: el área acumula la velocidad a lo largo del tiempo. Es un fenómeno de acumulación de un cambio continuo.",
        "b) Como triángulo: base = 4 s, altura = v(4) = 2·4 = 8 m/s, área = ½·4·8 = 16 m. Con antiderivada: ∫₀⁴ 2t dt = [t²]₀⁴ = 4² − 0² = 16 m. Ambas formas dan 16 m.",
        "c) La función de acumulación es d(t) = t²; su derivada es d′(t) = 2t = v(t). Derivar la acumulación devuelve la velocidad: ese es el Teorema Fundamental del Cálculo (integrar y derivar son inversas).",
      ],
      respuesta_final: "a) La distancia recorrida. b) ∫₀⁴ 2t dt = [t²]₀⁴ = 16 m (igual que el triángulo ½·4·8 = 16 m). c) d(t) = t² ⇒ d′(t) = 2t = v(t) ✓: derivar la acumulación devuelve la función original (TFC).",
      unidades: "v en m/s, t en s, distancia (área) en m",
      tolerancia_error: 0.01,
    },
  },

  // ── A3 — REFLEXIÓN ESCRITA ────────────────────────────────────────────────
  {
    titulo: "Acumular el cambio: un total que se suma a cada instante",
    descripcion: "Reflexiona sobre un fenómeno de tu entorno donde un ritmo continuo se acumula en un total, y descríbelo como un área bajo una curva.",
    tipo: "reflexion_escrita",
    xp: 20,
    estado: "borrador",
    contenido: {
      prompt:
        "Elige un fenómeno de tu entorno donde algo se ACUMULE a partir de un ritmo que cambia con el tiempo, y descríbelo como un área bajo una curva. Por ejemplo: la velocidad de un coche que acumula distancia; el caudal de agua que llega a una presa y acumula volumen; la potencia de los aparatos de tu casa que acumula la energía (kWh) que cobra la CFE; la rapidez con que ahorras que acumula tu saldo. Explica qué representa la variable del eje horizontal y qué representa la altura de la curva (el ritmo), qué significa el ÁREA bajo esa curva (el total acumulado), y qué sería la función de acumulación F(x). Relaciónalo con el Teorema Fundamental del Cálculo: ¿qué obtendrías si DERIVARAS ese total acumulado? Indica cómo lo comprobarías en el laboratorio 3D.",
      pistas: [
        "Velocidad (m/s) en el tiempo → el área es la distancia recorrida; derivar la distancia devuelve la velocidad.",
        "Caudal (L/s) en el tiempo → el área es el volumen acumulado; derivar el volumen devuelve el caudal.",
        "Potencia (kW) en el tiempo → el área es la energía (kWh) del recibo; derivar la energía devuelve la potencia.",
        "El área bajo el ritmo es el total; la función de acumulación F(x) mide ese total hasta el instante x, y F′(x) = f(x).",
      ],
      longitud_minima_palabras: 100,
      formato_esperado: "libre",
      criterios_evaluacion: [
        "Identifica un fenómeno real donde un ritmo continuo se acumula en un total y lo describe como área bajo una curva.",
        "Explica qué representan el eje horizontal, la altura de la curva (el ritmo) y el área (el total acumulado), e indica qué sería F(x).",
        "Conecta con el Teorema Fundamental del Cálculo (derivar la acumulación devuelve el ritmo) y propone cómo comprobarlo en el laboratorio 3D.",
      ],
    },
  },

  // ── A4 — QUIZ VERDADERO / FALSO ───────────────────────────────────────────
  {
    titulo: "Verdadero o falso: integral, área y el TFC",
    descripcion: "Pon a prueba lo que entendiste sobre el área bajo la curva, las sumas de Riemann y el Teorema Fundamental del Cálculo.",
    tipo: "quiz_verdadero_falso",
    xp: 10,
    estado: "borrador",
    contenido: {
      preguntas: [
        { enunciado: "La integral definida ∫ₐᵇ f(x) dx representa el área entre la curva y el eje X en [a, b].", respuesta: true, retroalimentacion: "Correcto: la integral definida es esa área (con signo); si f es un ritmo, el área es el total acumulado." },
        { enunciado: "Al aumentar el número de rectángulos, la suma de Riemann se aleja del área exacta.", respuesta: false, retroalimentacion: "Falso: ocurre lo contrario. A más rectángulos (más delgados), la suma se acerca cada vez más al área exacta; el límite cuando n→∞ es la integral." },
        { enunciado: "Una antiderivada de f es una función F tal que F′(x) = f(x).", respuesta: true, retroalimentacion: "Correcto: integrar es la operación inversa de derivar; F es una antiderivada (primitiva) de f si al derivar F se obtiene f." },
        { enunciado: "Según el TFC, ∫ₐᵇ f(x) dx = F(b) − F(a), donde F es una antiderivada de f.", respuesta: true, retroalimentacion: "Correcto: por eso no hace falta sumar infinitos rectángulos; basta evaluar una antiderivada en los extremos y restar." },
        { enunciado: "Si v(t) = 2t, el área bajo su gráfica entre 0 y 4 es 8.", respuesta: false, retroalimentacion: "Falso: es 16. El triángulo tiene base 4 y altura v(4) = 8, así que el área es ½·4·8 = 16 (= ∫₀⁴ 2t dt = [t²]₀⁴ = 16)." },
        { enunciado: "La función de acumulación F(x) = ∫ₐˣ f cumple F′(x) = f(x).", respuesta: true, retroalimentacion: "Correcto: esa es la primera parte del Teorema Fundamental del Cálculo: derivar la acumulación devuelve la función original." },
      ],
    },
  },

  // ── A5 — GLOSARIO INTERACTIVO ─────────────────────────────────────────────
  {
    titulo: "Glosario: integral, área y Teorema Fundamental",
    descripcion: "Términos clave para entender la integral, el área bajo la curva y su conexión con la derivada.",
    tipo: "glosario_interactivo",
    xp: 15,
    estado: "borrador",
    contenido: {
      terminos: [
        { termino: "Integral definida", definicion: "Área con signo bajo y = f(x) entre x = a y x = b; se escribe ∫ₐᵇ f(x) dx.", ejemplo: "∫₀⁴ 2t dt = 16 es el área bajo v = 2t en [0, 4]." },
        { termino: "Área bajo la curva", definicion: "Región encerrada entre la gráfica de una función y el eje X dentro de un intervalo.", ejemplo: "Bajo una gráfica velocidad–tiempo, el área es la distancia recorrida." },
        { termino: "Suma de Riemann", definicion: "Aproximación del área con n rectángulos de ancho (b−a)/n; converge al área exacta cuando n crece.", ejemplo: "Con 4 rectángulos la aproximación es burda; con 40, casi exacta." },
        { termino: "Antiderivada (primitiva)", definicion: "Función F cuya derivada es f, es decir F′(x) = f(x).", ejemplo: "F(x) = x² es una antiderivada de f(x) = 2x." },
        { termino: "Función de acumulación", definicion: "F(x) = ∫ₐˣ f(t) dt: el área acumulada desde a hasta x.", ejemplo: "La distancia d(t) = t² acumula la velocidad v(t) = 2t." },
        { termino: "Teorema Fundamental del Cálculo", definicion: "Conecta derivada e integral: F′(x) = f(x) y ∫ₐᵇ f = F(b) − F(a).", ejemplo: "Permite calcular ∫₀⁴ 2t dt como [t²]₀⁴ = 16." },
        { termino: "Operaciones inversas", definicion: "Integrar y derivar se deshacen mutuamente, como sumar y restar.", ejemplo: "Derivar la distancia t² devuelve la velocidad 2t." },
        { termino: "Acumulación de cambios continuos", definicion: "Sumar un ritmo que varía a cada instante para obtener un total.", ejemplo: "Caudal→volumen, potencia→energía, velocidad→distancia." },
        { termino: "Variable de integración", definicion: "La variable muda (t o x) sobre la que se suma dentro de la integral; el resultado no depende de su nombre.", ejemplo: "∫₀⁴ 2t dt = ∫₀⁴ 2u du = 16." },
        { termino: "Límites de integración", definicion: "Los extremos a (inferior) y b (superior) que delimitan el intervalo donde se mide el área.", ejemplo: "En ∫₀⁴, a = 0 y b = 4." },
      ],
      actividad_final: "Para cada función da una antiderivada F y calcula ∫₀² f con el TFC: (1) f(x) = 3; (2) f(x) = x; (3) f(x) = 2x; (4) f(x) = ½x². Comprueba que F′ = f en cada caso.",
    },
  },

  // ── A6 — COMPLETAR ESPACIOS ───────────────────────────────────────────────
  {
    titulo: "Completa: área, integral y el Teorema Fundamental",
    descripcion: "Completa el texto con los términos correctos sobre la integral y su conexión con la derivada.",
    tipo: "fill_blanks",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Arrastra o escribe la palabra correcta en cada espacio.",
      texto_con_huecos:
        "La integral definida ∫ₐᵇ f(x) dx representa el ___ encerrada entre la curva y el eje X. Para aproximarla se usan sumas de ___, que parten el intervalo en n ___: a más rectángulos, mejor es la aproximación. Una ___ de f es una función F tal que F′(x) = f(x). El Teorema Fundamental del Cálculo dice que la función de acumulación F(x) = ∫ₐˣ f cumple F′(x) = ___, y que ∫ₐᵇ f = F(b) − F(___). Así, integrar y derivar son operaciones ___.",
      huecos: [
        { posicion: 0, respuesta_correcta: "área", alternativas_aceptadas: ["area", "Área"] },
        { posicion: 1, respuesta_correcta: "Riemann", alternativas_aceptadas: ["riemann"] },
        { posicion: 2, respuesta_correcta: "rectángulos", alternativas_aceptadas: ["rectangulos", "Rectángulos"] },
        { posicion: 3, respuesta_correcta: "antiderivada", alternativas_aceptadas: ["primitiva", "Antiderivada"] },
        { posicion: 4, respuesta_correcta: "f(x)", alternativas_aceptadas: ["f (x)", "f"] },
        { posicion: 5, respuesta_correcta: "a", alternativas_aceptadas: ["A"] },
        { posicion: 6, respuesta_correcta: "inversas", alternativas_aceptadas: ["Inversas"] },
      ],
    },
  },

  // ── A7 — AUTOEVALUACIÓN ───────────────────────────────────────────────────
  {
    titulo: "¿Cómo voy con el Teorema Fundamental del Cálculo?",
    descripcion: "Evalúa tu propio dominio de los conceptos de esta progresión.",
    tipo: "autoevaluacion",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Marca con honestidad qué tan seguro te sientes en cada punto. No hay respuestas correctas: te sirve para saber qué repasar.",
      criterios: [
        {
          descripcion: "Entiendo que la integral definida es el área bajo la curva y, si f es un ritmo, el total acumulado.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Aproximo el área bajo una curva con sumas de Riemann y entiendo qué pasa al aumentar el número de rectángulos.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Reconozco una antiderivada y calculo una integral definida con ∫ₐᵇ f = F(b) − F(a).",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Explico el Teorema Fundamental del Cálculo: derivar la función de acumulación devuelve la función original (F′ = f).",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
      ],
      reflexion_final_prompt: "¿Qué idea del Teorema Fundamental del Cálculo te costó más entender y cómo podrías repasarla con un ejemplo de acumulación de tu entorno (distancia, volumen o energía)?",
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

  console.log(`\n🌱 PM-V·O8 — Teorema Fundamental del Cálculo  (${apply ? "APLICAR" : "DRY-RUN"})\n`);

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

  console.log(`\n✅ PM-V·O8 sembrado (borrador). Ruta práctica:`);
  console.log(`   http://localhost:3000/hub/uac/${UAC_CODIGO}/progresion/${PROG_NUMERO}/actividad/2/practica\n`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e.message); process.exit(1); });
