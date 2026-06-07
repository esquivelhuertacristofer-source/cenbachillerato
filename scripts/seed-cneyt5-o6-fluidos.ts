/**
 * Seed del propósito formativo CNEYT-V·O6 (numero=6) — hueco del re-alineamiento 2025.
 *
 *   Propósito formativo O6 (verbatim, contenido-2025.ts CNEYT-V propositos[5]):
 *     "Analiza el comportamiento de fluidos para comprender sus propiedades físicas."
 *   Contenido formativo C6 (verbatim, contenido-2025.ts CNEYT-V contenidos[5]):
 *     "Principio de Pascal y de Arquímedes · Tensión superficial y capilaridad ·
 *      Ecuación de continuidad y de Bernoulli · Viscosidad"
 *
 * Crea la progresión CNEYT-V-P09 (numero=6) + 7 actividades, TODAS estado='borrador'
 * (regla: el contenido nuevo queda sin publicar hasta aprobación explícita).
 * La actividad A2 (ejercicio_matematico) lleva el laboratorio 3D "fluidos".
 *
 * Idempotente: upsert por "codigo". Recuenta uac.total_progresiones al final.
 *
 * Uso:
 *   npx tsx scripts/seed-cneyt5-o6-fluidos.ts            (dry-run: solo describe)
 *   npx tsx scripts/seed-cneyt5-o6-fluidos.ts --apply    (aplica los upserts)
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createSB, upsertActividad, type ActividadInput, type SB } from "./lib/activity-utils";

const UAC_CODIGO = "CNEYT-V";
const PROG_CODIGO = "CNEYT-V-P09";
const PROG_NUMERO = 6;
const LAB_SLUG = "fluidos";

const META = "Cuestione los fenómenos naturales desde los principios del movimiento mecánico, ondulatorio y óptico, aplicando los modelos de la física clásica para explicar y predecir comportamientos en contextos cotidianos y tecnológicos.";

// Propósito y contenido VERBATIM (contenido-2025.ts CNEYT-V)
const O6 = "Analiza el comportamiento de fluidos para comprender sus propiedades físicas.";
const C6 = "Principio de Pascal y de Arquímedes Tensión superficial y capilaridad Ecuación de continuidad y de Bernoulli Viscosidad";

const PROGRESION = {
  codigo: PROG_CODIGO,
  numero: PROG_NUMERO,
  titulo: O6,
  descripcion: "Analiza el comportamiento de los fluidos: flotación (Arquímedes), presión y principio de Pascal, tensión superficial, capilaridad, continuidad, Bernoulli y viscosidad.",
  descripcion_extendida: `${O6} Contenidos formativos: ${C6}.`,
  meta_aprendizaje: META,
  categoria: "Comportamiento de los fluidos",
  subcategoria: "Principios de Pascal, Arquímedes, continuidad y Bernoulli",
  ejes_articuladores: ["Pensamiento matemático y científico"],
  transversalidades: [] as string[],
  tiempo_estimado_horas: 3,
};

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido"> & { estado: "borrador" };

const ACTIVIDADES: Act[] = [
  // ── A1 — LECTURA ──────────────────────────────────────────────────────────
  {
    titulo: "Los fluidos: por qué flotan los barcos y vuelan los aviones",
    descripcion: "Lee cómo los principios de Arquímedes, Pascal, continuidad y Bernoulli explican el comportamiento de líquidos y gases.",
    tipo: "lectura",
    xp: 10,
    estado: "borrador",
    contenido: {
      texto:
        "Un FLUIDO es toda sustancia que fluye y adopta la forma del recipiente que la contiene: los líquidos y los gases lo son. A diferencia de un sólido, un fluido no resiste el corte; por eso se derrama, se vierte y circula por tuberías. Cuatro principios bastan para entender casi todo lo que hacen.\n\n" +
        "1) PRINCIPIO DE ARQUÍMEDES (flotación). Todo cuerpo sumergido en un fluido recibe un empuje vertical hacia arriba igual al peso del fluido que desaloja: E = ρ_fluido · V_sumergido · g. Si el empuje supera al peso del cuerpo, este flota; si no, se hunde. La clave es la DENSIDAD (ρ = masa/volumen): un cuerpo flota cuando su densidad media es menor que la del fluido. Un barco de acero flota porque su casco hueco encierra aire, de modo que su densidad MEDIA (acero + aire) es menor que la del agua.\n\n" +
        "2) PRINCIPIO DE PASCAL (presión transmitida). La PRESIÓN es la fuerza por unidad de área (P = F/A, en pascales, Pa = N/m²). En un fluido en reposo, la presión aumenta con la profundidad: P = P₀ + ρ·g·h (presión hidrostática). Pascal descubrió además que un aumento de presión aplicado a un fluido confinado se transmite ÍNTEGRO a todos sus puntos. En eso se basan el gato hidráulico y los frenos de un coche: una fuerza pequeña sobre un pistón chico genera una fuerza enorme sobre un pistón grande.\n\n" +
        "3) ECUACIÓN DE CONTINUIDAD Y DE BERNOULLI (fluidos en movimiento). Como un líquido es casi incompresible, lo que entra por una tubería sale por el otro extremo: el caudal se conserva, A₁·v₁ = A₂·v₂. Por eso, al estrechar una manguera con el dedo, el agua sale más rápido. Bernoulli añade que, a lo largo de una línea de corriente, P + ½ρv² + ρgh es constante: donde el fluido va MÁS RÁPIDO, su presión es MENOR. Esa caída de presión sobre el ala curva es parte de lo que sostiene a un avión.\n\n" +
        "4) OTRAS PROPIEDADES. La TENSIÓN SUPERFICIAL hace que la superficie de un líquido actúe como una membrana elástica (un insecto camina sobre el agua); la CAPILARIDAD hace que el agua suba sola por tubos muy finos (así asciende la savia en las plantas); y la VISCOSIDAD mide la resistencia interna a fluir: la miel y la glicerina son muy viscosas, el agua poco. Con estos principios se diseñan presas, acueductos como el Cutzamala, ductos de PEMEX y hasta la jeringa del médico.",
      fuente: "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología V, contenido formativo: Principio de Pascal y de Arquímedes · Tensión superficial y capilaridad · Ecuación de continuidad y de Bernoulli · Viscosidad.",
      nivel_lectura: "intermedio",
      tiempo_estimado_minutos: 12,
      preguntas_comprension: [
        { pregunta: "¿Por qué flota un barco de acero si el acero es más denso que el agua?", respuesta_guia: "Porque su casco hueco encierra aire: su densidad MEDIA (acero + aire) es menor que la del agua, así que el empuje supera al peso." },
        { pregunta: "Según el principio de Pascal, ¿qué ocurre con un aumento de presión aplicado a un fluido confinado?", respuesta_guia: "Se transmite íntegro a todos los puntos del fluido; en eso se basan el gato y los frenos hidráulicos." },
        { pregunta: "Según Bernoulli, ¿qué pasa con la presión donde el fluido va más rápido?", respuesta_guia: "La presión es menor: donde aumenta la velocidad, disminuye la presión (a igual altura)." },
      ],
    },
  },

  // ── A2 — EJERCICIO MATEMÁTICO (lleva el lab 3D) ───────────────────────────
  {
    titulo: "Analizando el comportamiento de los fluidos",
    descripcion: "Calcula empuje y flotación (Arquímedes), presión hidrostática (Pascal) y velocidad en un estrechamiento (continuidad y Bernoulli), y compruébalo en el laboratorio 3D.",
    tipo: "ejercicio_matematico",
    xp: 15,
    estado: "borrador",
    contenido: {
      instrucciones: "Resuelve a mano con g = 9.81 m/s² y comprueba moviendo la densidad, la profundidad, el caudal y el estrechamiento en el laboratorio 3D.",
      problema:
        "Resuelve tres situaciones con fluidos (usa g = 9.81 m/s²; densidad del agua ρ = 1000 kg/m³).\n\n" +
        "a) FLOTACIÓN (Arquímedes). Un bloque de madera de pino de densidad ρ = 500 kg/m³ y volumen V = 8 L = 0.008 m³ se coloca en agua. ¿Flota o se hunde? ¿Qué fracción queda sumergida y cuánto vale el empuje?\n\n" +
        "b) PRESIÓN (Pascal / hidrostática). ¿Cuál es la presión manométrica (debida solo al agua) a una profundidad de h = 8 m en una presa? Si además sobre la superficie actúa la presión atmosférica de 101 325 Pa, ¿cuál es la presión absoluta?\n\n" +
        "c) CONTINUIDAD. Por una tubería de sección A₁ = 0.02 m² circula agua con velocidad v₁ = 1.5 m/s. La tubería se estrecha a A₂ = 0.005 m² (la cuarta parte). ¿Cuál es la velocidad v₂ en la sección estrecha? Según Bernoulli, ¿la presión ahí sube o baja?",
      contexto: "Los tres incisos recorren el contenido formativo de la progresión: Arquímedes (a), Pascal e hidrostática (b) y continuidad/Bernoulli (c). En el laboratorio 3D cada uno corresponde a un modo.",
      tipo_respuesta: "desarrollo",
      pasos_guia: [
        "a) Como ρ_cuerpo (500) < ρ_agua (1000), FLOTA. Fracción sumergida = ρ_cuerpo/ρ_agua = 500/1000 = 0.50 (50 %). En equilibrio el empuje iguala al peso: E = ρ_cuerpo·V·g = 500 × 0.008 × 9.81 = 39.24 N.",
        "b) Presión manométrica: P = ρ·g·h = 1000 × 9.81 × 8 = 78 480 Pa ≈ 78.5 kPa. Presión absoluta: P_abs = P_atm + ρ·g·h = 101 325 + 78 480 = 179 805 Pa ≈ 179.8 kPa.",
        "c) Continuidad A₁·v₁ = A₂·v₂ → v₂ = v₁·(A₁/A₂) = 1.5 × (0.02/0.005) = 1.5 × 4 = 6 m/s. Por Bernoulli, donde la velocidad aumenta la presión BAJA, así que la presión en la sección estrecha es menor.",
      ],
      respuesta_final: "a) Flota, 50 % sumergido, E = 39.24 N. b) Manométrica 78 480 Pa (≈78.5 kPa); absoluta ≈179 805 Pa (≈179.8 kPa). c) v₂ = 6 m/s; la presión baja en el estrechamiento.",
      unidades: "N (empuje), Pa (presión), m/s (velocidad)",
      tolerancia_error: 0.01,
    },
  },

  // ── A3 — REFLEXIÓN ESCRITA ────────────────────────────────────────────────
  {
    titulo: "Los fluidos en tu vida diaria",
    descripcion: "Reflexiona sobre un fenómeno cotidiano y explícalo con uno de los principios de los fluidos.",
    tipo: "reflexion_escrita",
    xp: 20,
    estado: "borrador",
    contenido: {
      prompt:
        "Elige un fenómeno con fluidos que veas a menudo (por ejemplo: por qué flotas mejor en el mar que en una alberca, por qué te duelen los oídos al bucear, por qué el agua sale más lejos cuando tapas con el dedo la manguera, por qué se levanta el techo de lámina con viento fuerte, o cómo funciona el gato hidráulico de un taller). Explícalo usando uno de los principios de la progresión (Arquímedes, Pascal, continuidad o Bernoulli). Di qué cantidad física cambia y por qué, y cómo lo confirmarías con un experimento o con el laboratorio 3D.",
      pistas: [
        "Flotar mejor en el mar → Arquímedes: el agua salada es más densa, así que el empuje es mayor.",
        "Dolor de oídos al bucear → presión hidrostática P = P₀ + ρ·g·h: crece con la profundidad.",
        "Agua que llega más lejos al tapar la manguera → continuidad: al reducir el área, la velocidad sube.",
        "Techo que se levanta con viento → Bernoulli: el aire rápido arriba tiene menos presión que el aire quieto abajo.",
      ],
      longitud_minima_palabras: 100,
      formato_esperado: "libre",
      criterios_evaluacion: [
        "Identifica correctamente qué principio (Arquímedes, Pascal, continuidad o Bernoulli) explica el fenómeno.",
        "Explica qué cantidad física cambia (densidad, presión, velocidad) y por qué.",
        "Propone una forma de comprobarlo (experimento o laboratorio).",
      ],
    },
  },

  // ── A4 — QUIZ VERDADERO / FALSO ───────────────────────────────────────────
  {
    titulo: "Verdadero o falso: el comportamiento de los fluidos",
    descripcion: "Pon a prueba lo que entendiste sobre Arquímedes, Pascal, continuidad, Bernoulli y viscosidad.",
    tipo: "quiz_verdadero_falso",
    xp: 10,
    estado: "borrador",
    contenido: {
      preguntas: [
        { enunciado: "Un cuerpo flota cuando su densidad media es menor que la del fluido.", respuesta: true, retroalimentacion: "Correcto: si ρ_cuerpo < ρ_fluido, el empuje supera al peso y el cuerpo flota." },
        { enunciado: "La presión hidrostática dentro de un líquido disminuye al aumentar la profundidad.", respuesta: false, retroalimentacion: "Al revés: aumenta con la profundidad, P = P₀ + ρ·g·h. Por eso los muros de las presas son más gruesos en la base." },
        { enunciado: "El principio de Pascal dice que un aumento de presión se transmite por igual a todos los puntos de un fluido confinado.", respuesta: true, retroalimentacion: "Correcto: es el fundamento del gato y los frenos hidráulicos." },
        { enunciado: "Según la ecuación de continuidad, cuando una tubería se estrecha el fluido va más lento.", respuesta: false, retroalimentacion: "Va más rápido: como A₁·v₁ = A₂·v₂, al reducir el área la velocidad aumenta." },
        { enunciado: "Según Bernoulli, donde el fluido se mueve más rápido la presión es menor.", respuesta: true, retroalimentacion: "Correcto: a igual altura, mayor velocidad implica menor presión." },
        { enunciado: "La glicerina y la miel tienen menor viscosidad que el agua.", respuesta: false, retroalimentacion: "Tienen MAYOR viscosidad: fluyen con más lentitud porque su resistencia interna es mucho mayor que la del agua." },
      ],
    },
  },

  // ── A5 — GLOSARIO INTERACTIVO ─────────────────────────────────────────────
  {
    titulo: "Glosario: propiedades y principios de los fluidos",
    descripcion: "Términos clave para hablar del comportamiento de los fluidos.",
    tipo: "glosario_interactivo",
    xp: 15,
    estado: "borrador",
    contenido: {
      terminos: [
        { termino: "Fluido", definicion: "Sustancia que fluye y adopta la forma del recipiente que la contiene; incluye líquidos y gases.", ejemplo: "El agua, el aire y el aceite son fluidos." },
        { termino: "Densidad (ρ)", definicion: "Masa por unidad de volumen (kg/m³). Decide si un cuerpo flota o se hunde en un fluido.", ejemplo: "El agua tiene ρ = 1000 kg/m³; el mercurio, 13 600 kg/m³." },
        { termino: "Principio de Arquímedes", definicion: "Todo cuerpo sumergido recibe un empuje hacia arriba igual al peso del fluido que desaloja: E = ρ_fluido·V_sumergido·g.", ejemplo: "Un cuerpo de 8 L sumergido en agua recibe un empuje de unos 78 N." },
        { termino: "Presión (P)", definicion: "Fuerza por unidad de área, en pascales (Pa = N/m²).", ejemplo: "A 8 m de profundidad en agua, la presión manométrica es ≈78.5 kPa." },
        { termino: "Principio de Pascal", definicion: "Un aumento de presión aplicado a un fluido confinado se transmite por igual a todos sus puntos.", ejemplo: "El gato hidráulico multiplica la fuerza usando este principio." },
        { termino: "Ecuación de continuidad", definicion: "El caudal se conserva en una tubería: A₁·v₁ = A₂·v₂. Al estrecharse, el fluido acelera.", ejemplo: "Si el área se reduce a la cuarta parte, la velocidad se cuadruplica." },
        { termino: "Principio de Bernoulli", definicion: "A lo largo de una línea de corriente, P + ½ρv² + ρgh es constante: donde la velocidad sube, la presión baja.", ejemplo: "El ala de un avión y el atomizador se explican con Bernoulli." },
        { termino: "Tensión superficial", definicion: "Fuerza que mantiene cohesionada la superficie de un líquido, como una membrana elástica.", ejemplo: "Un zapatero (insecto) camina sobre el agua sin hundirse." },
        { termino: "Capilaridad", definicion: "Ascenso (o descenso) de un líquido por tubos muy finos debido a la tensión superficial y la adhesión.", ejemplo: "El agua sube sola por una servilleta o por el tallo de una planta." },
        { termino: "Viscosidad", definicion: "Medida de la resistencia interna de un fluido a fluir (Pa·s).", ejemplo: "La glicerina es unas 1400 veces más viscosa que el agua." },
      ],
      actividad_final: "Clasifica estos fenómenos según el principio que los explica: (1) un globo aerostático sube; (2) los frenos del coche; (3) el agua sube por una toalla; (4) el viento levanta un paraguas. Justifica cada uno.",
    },
  },

  // ── A6 — COMPLETAR ESPACIOS ───────────────────────────────────────────────
  {
    titulo: "Completa: los principios de los fluidos",
    descripcion: "Completa el texto con los términos correctos sobre el comportamiento de los fluidos.",
    tipo: "fill_blanks",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Arrastra o escribe la palabra correcta en cada espacio.",
      texto_con_huecos:
        "Un cuerpo sumergido recibe un empuje hacia arriba igual al peso del fluido que desaloja: es el principio de ___. La presión dentro de un líquido ___ con la profundidad según P = P₀ + ρ·g·h. El principio de ___ explica que un aumento de presión se transmite por igual a todo el fluido, como en el gato hidráulico. Por la ecuación de ___, al estrechar una tubería el fluido va más rápido. Y según ___, donde el fluido va más rápido la presión es menor. La resistencia interna de un fluido a fluir se llama ___.",
      huecos: [
        { posicion: 0, respuesta_correcta: "Arquímedes", alternativas_aceptadas: ["arquimedes"] },
        { posicion: 1, respuesta_correcta: "aumenta", alternativas_aceptadas: ["crece", "sube"] },
        { posicion: 2, respuesta_correcta: "Pascal", alternativas_aceptadas: ["pascal"] },
        { posicion: 3, respuesta_correcta: "continuidad", alternativas_aceptadas: [] },
        { posicion: 4, respuesta_correcta: "Bernoulli", alternativas_aceptadas: ["bernoulli"] },
        { posicion: 5, respuesta_correcta: "viscosidad", alternativas_aceptadas: [] },
      ],
    },
  },

  // ── A7 — AUTOEVALUACIÓN ───────────────────────────────────────────────────
  {
    titulo: "¿Cómo voy con el comportamiento de los fluidos?",
    descripcion: "Evalúa tu propio dominio de los conceptos de esta progresión.",
    tipo: "autoevaluacion",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Marca con honestidad qué tan seguro te sientes en cada punto. No hay respuestas correctas: te sirve para saber qué repasar.",
      criterios: [
        {
          descripcion: "Uso el principio de Arquímedes para decidir si un cuerpo flota y calcular el empuje.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Calculo la presión a una profundidad dada y explico el principio de Pascal.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Aplico la ecuación de continuidad y el principio de Bernoulli a un fluido en movimiento.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Distingo tensión superficial, capilaridad y viscosidad con ejemplos.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
      ],
      reflexion_final_prompt: "¿Qué principio de los fluidos te costó más entender y cómo podrías repasarlo?",
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

  console.log(`\n🌱 CNEYT-V·O6 — Comportamiento de los fluidos  (${apply ? "APLICAR" : "DRY-RUN"})\n`);

  // UAC
  const { data: uac, error: uacErr } = await sb.from("uac").select("id, total_progresiones").eq("codigo", UAC_CODIGO).single();
  if (uacErr || !uac) throw new Error(`UAC ${UAC_CODIGO} no encontrada: ${uacErr?.message}`);

  // ¿numero=6 libre? (no debe existir otra progresión con ese numero)
  const { data: choque } = await sb.from("progresiones").select("codigo").eq("uac_id", uac.id).eq("numero", PROG_NUMERO).maybeSingle();
  if (choque && choque.codigo !== PROG_CODIGO) {
    throw new Error(`numero=${PROG_NUMERO} ya está ocupado por ${choque.codigo} — abortado para no chocar.`);
  }

  console.log(`Progresión ${PROG_CODIGO} (numero=${PROG_NUMERO}) — categoria "${PROGRESION.categoria}"`);
  console.log(`  titulo (O6 verbatim): ${PROGRESION.titulo}`);
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

  console.log(`\n✅ CNEYT-V·O6 sembrado (borrador). Ruta práctica:`);
  console.log(`   http://localhost:3000/hub/uac/${UAC_CODIGO}/progresion/${PROG_NUMERO}/actividad/2/practica\n`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e.message); process.exit(1); });
