/**
 * Seed del propósito formativo CNEYT-II·O4 (numero=4) — hueco del re-alineamiento 2025.
 *
 *   Propósito formativo O4 (verbatim, contenido-2025.ts CNEYT-II propositos[3]):
 *     "Analiza la interacción entre la energía y la estructura de la materia para
 *      comprender las formas de propagación de calor."
 *   Contenido formativo C4 (verbatim, contenido-2025.ts CNEYT-II contenidos[3]):
 *     "Propagación de calor: conducción y convección · Transferencia de calor por
 *      radiación · Conductividad calorífica y capacidad térmica específica"
 *
 * Crea la progresión CNEYT-II-P11 (numero=4) + 7 actividades, TODAS estado='borrador'
 * (regla: el contenido nuevo queda sin publicar hasta aprobación explícita).
 * La actividad A2 (ejercicio_matematico) lleva el laboratorio 3D "propagacion-calor".
 *
 * Idempotente: upsert por "codigo". Recuenta uac.total_progresiones al final.
 *
 * Uso:
 *   npx tsx scripts/seed-cneyt2-o4-propagacion-calor.ts            (dry-run: solo describe)
 *   npx tsx scripts/seed-cneyt2-o4-propagacion-calor.ts --apply    (aplica los upserts)
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createSB, upsertActividad, type ActividadInput, type SB } from "./lib/activity-utils";

const UAC_CODIGO = "CNEYT-II";
const PROG_CODIGO = "CNEYT-II-P11";
const PROG_NUMERO = 4;
const LAB_SLUG = "propagacion-calor";

const META = "Comprenda la importancia de la energía para construir explicaciones sobre diversos fenómenos naturales.";

// Propósito y contenido VERBATIM (contenido-2025.ts CNEYT-II)
const O4 = "Analiza la interacción entre la energía y la estructura de la materia para comprender las formas de propagación de calor.";
const C4 = "Propagación de calor: conducción y convección Transferencia de calor por radiación Conductividad calorífica y capacidad térmica específica";

const PROGRESION = {
  codigo: PROG_CODIGO,
  numero: PROG_NUMERO,
  titulo: O4,
  descripcion: "Estudia las tres formas en que el calor se propaga —conducción (átomo a átomo en sólidos), convección (con corrientes en fluidos) y radiación (como onda, sin medio)— y mide el flujo de calor con la conductividad térmica y la energía con la capacidad térmica específica.",
  descripcion_extendida: `${O4} Contenidos formativos: ${C4}.`,
  meta_aprendizaje: META,
  categoria: "Termología",
  subcategoria: "Propagación de calor: conducción, convección y radiación",
  ejes_articuladores: ["Pensamiento crítico", "Apropiación de las culturas a través de la lectura y la escritura"],
  transversalidades: [] as string[],
  tiempo_estimado_horas: 3,
};

type Act = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido"> & { estado: "borrador" };

const ACTIVIDADES: Act[] = [
  // ── A1 — LECTURA ──────────────────────────────────────────────────────────
  {
    titulo: "Los tres caminos del calor: conducción, convección y radiación",
    descripcion: "Lee cómo el calor pasa de lo caliente a lo frío por tres mecanismos distintos y qué propiedades de la materia gobiernan cada uno.",
    tipo: "lectura",
    xp: 10,
    estado: "borrador",
    contenido: {
      texto:
        "El calor es energía que se transfiere espontáneamente de un cuerpo caliente a uno frío hasta que ambos alcanzan la misma temperatura (equilibrio térmico). No hay que confundir CALOR con TEMPERATURA: la temperatura mide la energía cinética promedio de las partículas; el calor es la energía que viaja entre cuerpos a distinta temperatura. ¿Pero por qué camino viaja? Hay tres formas de propagación.\n\n" +
        "CONDUCCIÓN. Es la propagación del calor a través de la materia por contacto directo, SIN que la materia se desplace. Cuando calientas un extremo de una barra metálica, sus átomos vibran con más energía y, al chocar con sus vecinos, les transmiten esa vibración: el calor avanza átomo a átomo. Los METALES conducen muy bien (tienen electrones libres); la madera, el plástico, el aire o el corcho conducen muy mal (son AISLANTES). La rapidez con que un material conduce el calor se mide con su CONDUCTIVIDAD TÉRMICA k (en W/m·K): el cobre tiene k≈401, la madera apenas k≈0.15. La ley de Fourier resume el flujo: Q/t = k·A·ΔT/L, donde A es el área, ΔT la diferencia de temperatura y L el grosor.\n\n" +
        "CONVECCIÓN. Es la propagación del calor en los FLUIDOS (líquidos y gases) mediante el movimiento del propio fluido. Cuando calientas agua por abajo, el fluido del fondo se dilata, pierde densidad y SUBE; arriba se enfría, se vuelve denso y BAJA. Así nace una corriente de convección que transporta el calor CON la materia. La convección explica que el agua hierva formando burbujas que suben, que el humo ascienda, que los radiadores se pongan abajo y el aire acondicionado arriba, y que existan las brisas marinas: de día la tierra se calienta más rápido que el mar y el aire caliente sube, atrayendo aire fresco desde el océano.\n\n" +
        "RADIACIÓN. Es la propagación del calor por ONDAS ELECTROMAGNÉTICAS (sobre todo infrarrojas). A diferencia de las otras dos, NO necesita un medio material: puede viajar incluso en el vacío. Así nos llega el calor del Sol cruzando 150 millones de kilómetros de espacio vacío. Todo cuerpo emite radiación según su temperatura; la ley de Stefan-Boltzmann dice que la potencia emitida crece con la CUARTA potencia de la temperatura absoluta: Q/t = ε·σ·A·T⁴ (con σ = 5.67×10⁻⁸ W/m²·K⁴). Por eso, si la temperatura de un cuerpo se duplica, irradia 16 veces más energía (2⁴ = 16). Una fogata te calienta la cara aunque el aire entre tú y ella siga frío.\n\n" +
        "CONDUCTIVIDAD Y CAPACIDAD TÉRMICA. Dos propiedades de la materia son clave. La CONDUCTIVIDAD TÉRMICA k dice qué tan bien conduce el calor un material. La CAPACIDAD TÉRMICA ESPECÍFICA c dice cuánta energía se necesita para subir 1 °C la temperatura de 1 kg de sustancia (en J/kg·K), según Q = m·c·ΔT. El agua tiene un calor específico altísimo (c≈4186), mucho mayor que el de los metales: por eso tarda en calentarse y en enfriarse, y por eso el mar y los lagos MODERAN el clima de las regiones que los rodean.\n\n" +
        "EN LA VIDA REAL los tres mecanismos suelen actuar a la vez: en una olla sobre la estufa, el metal conduce el calor de la flama, el agua circula por convección y las paredes calientes irradian. Comprender la propagación del calor permite diseñar casas frescas, ropa abrigadora, termos, calentadores solares y motores más eficientes.",
      fuente: "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología II «El poder de la energía», contenido formativo: Propagación de calor: conducción y convección · Transferencia de calor por radiación · Conductividad calorífica y capacidad térmica específica.",
      nivel_lectura: "intermedio",
      tiempo_estimado_minutos: 12,
      preguntas_comprension: [
        { pregunta: "¿Cuál es la diferencia esencial entre conducción y convección?", respuesta_guia: "En la conducción el calor viaja por contacto átomo a átomo sin que la materia se desplace (típico de sólidos); en la convección el propio fluido caliente se mueve formando corrientes que transportan el calor." },
        { pregunta: "¿Por qué la radiación es especial frente a las otras dos formas?", respuesta_guia: "Porque viaja como onda electromagnética y NO necesita un medio material: puede propagarse incluso en el vacío, como el calor del Sol." },
        { pregunta: "¿Por qué el agua modera el clima de las costas?", respuesta_guia: "Porque su capacidad térmica específica c es muy alta: necesita mucha energía para cambiar de temperatura, así que se calienta y se enfría lentamente." },
      ],
    },
  },

  // ── A2 — EJERCICIO MATEMÁTICO (lleva el lab 3D) ───────────────────────────
  {
    titulo: "Calculando el flujo de calor",
    descripcion: "Calcula la conducción con la ley de Fourier y la energía con la capacidad térmica específica, y compruébalo en el laboratorio 3D.",
    tipo: "ejercicio_matematico",
    xp: 15,
    estado: "borrador",
    contenido: {
      instrucciones: "Resuelve a mano y comprueba en el laboratorio 3D: recorre los tres mecanismos y usa la calculadora (elige material, área, grosor y ΔT) para verificar tus resultados.",
      problema:
        "Trabaja con una ventana y con una olla de cocina.\n\n" +
        "a) CONDUCCIÓN. Una ventana de vidrio de A = 1.5 m² y L = 6 mm (0.006 m) separa un interior a 22 °C de un exterior a 4 °C. Si la conductividad térmica del vidrio es k = 0.8 W/m·K, ¿cuánto calor por segundo (Q/t, en watts) se pierde por conducción?\n\n" +
        "b) CAPACIDAD TÉRMICA. ¿Cuánta energía Q (en joules) se necesita para calentar 2 kg de agua (c = 4186 J/kg·K) de 20 °C a 100 °C?\n\n" +
        "c) RADIACIÓN. Si la temperatura absoluta de un cuerpo que irradia se DUPLICA, ¿por qué factor se multiplica la potencia que emite, según la ley de Stefan-Boltzmann (Q/t = ε·σ·A·T⁴)?",
      contexto: "Los tres incisos recorren el contenido formativo de la progresión: conducción (a) con la ley de Fourier y la conductividad k, capacidad térmica específica (b) con Q = m·c·ΔT, y radiación (c) con Stefan-Boltzmann. En el laboratorio 3D cada mecanismo es un modo y la calculadora da estos números para cualquier material.",
      tipo_respuesta: "desarrollo",
      pasos_guia: [
        "a) Fourier: Q/t = k·A·ΔT/L. ΔT = 22 − 4 = 18 °C. Q/t = (0.8 × 1.5 × 18) / 0.006 = 21.6 / 0.006 = 3 600 W.",
        "b) Calor sensible: Q = m·c·ΔT. ΔT = 100 − 20 = 80 °C. Q = 2 × 4186 × 80 = 669 760 J ≈ 6.7 × 10⁵ J.",
        "c) Stefan-Boltzmann: Q/t ∝ T⁴. Si T se duplica, la potencia se multiplica por 2⁴ = 16.",
      ],
      respuesta_final: "a) Q/t = 3 600 W (3.6 kW). b) Q = 669 760 J ≈ 6.7 × 10⁵ J. c) Se multiplica por 16 (2⁴).",
      unidades: "Q/t en watts (W); Q en joules (J); factor adimensional",
      tolerancia_error: 0.01,
    },
  },

  // ── A3 — REFLEXIÓN ESCRITA ────────────────────────────────────────────────
  {
    titulo: "El calor en tu día a día",
    descripcion: "Reflexiona sobre un fenómeno cotidiano y explícalo con la conducción, la convección o la radiación.",
    tipo: "reflexion_escrita",
    xp: 20,
    estado: "borrador",
    contenido: {
      prompt:
        "Elige un fenómeno cotidiano relacionado con el calor (por ejemplo: por qué la cuchara de metal se calienta en la sopa pero la de madera no, por qué el aire acondicionado se pone arriba y el calefactor abajo, por qué sientes el calor de una fogata aunque el aire siga frío, por qué la ropa negra calienta más al sol, por qué un termo conserva la temperatura, o por qué las casas de adobe son frescas). Explícalo indicando cuál de las tres formas de propagación interviene (o cuáles, si son varias), y qué papel juega la conductividad k o la capacidad térmica c. Propón cómo lo confirmarías en el laboratorio 3D.",
      pistas: [
        "Cuchara de metal vs. de madera → conducción: el metal tiene k alta, la madera muy baja (aislante).",
        "Calefactor abajo / aire acondicionado arriba → convección: el aire caliente sube y el frío baja.",
        "Calor de la fogata o del Sol → radiación: viaja como onda, sin necesitar el aire.",
        "Termo o casa de adobe → combinan aislamiento (k baja) y control de convección y radiación.",
      ],
      longitud_minima_palabras: 100,
      formato_esperado: "libre",
      criterios_evaluacion: [
        "Identifica correctamente la(s) forma(s) de propagación del calor implicada(s).",
        "Relaciona el fenómeno con la conductividad térmica k o la capacidad térmica específica c.",
        "Propone una forma de comprobarlo, por ejemplo recorriendo el modo correspondiente del laboratorio 3D.",
      ],
    },
  },

  // ── A4 — QUIZ VERDADERO / FALSO ───────────────────────────────────────────
  {
    titulo: "Verdadero o falso: propagación del calor",
    descripcion: "Pon a prueba lo que entendiste sobre conducción, convección, radiación y las propiedades térmicas.",
    tipo: "quiz_verdadero_falso",
    xp: 10,
    estado: "borrador",
    contenido: {
      preguntas: [
        { enunciado: "En la conducción el calor viaja sin que la materia se desplace, por contacto entre partículas.", respuesta: true, retroalimentacion: "Correcto: la energía pasa de átomo a átomo por choques; es típica de los sólidos, sobre todo metales." },
        { enunciado: "La convección puede ocurrir en cualquier material, incluidos los sólidos rígidos.", respuesta: false, retroalimentacion: "Falso: la convección necesita un FLUIDO (líquido o gas) que pueda moverse formando corrientes." },
        { enunciado: "La radiación es la única forma de propagación del calor que puede viajar en el vacío.", respuesta: true, retroalimentacion: "Correcto: viaja como onda electromagnética; así nos llega el calor del Sol a través del espacio." },
        { enunciado: "Un material con conductividad térmica k muy baja es un buen conductor del calor.", respuesta: false, retroalimentacion: "Falso: una k baja indica un buen AISLANTE (madera, aire, corcho). Los buenos conductores tienen k alta (cobre, aluminio)." },
        { enunciado: "El agua necesita más energía que la mayoría de los metales para subir 1 °C la misma masa.", respuesta: true, retroalimentacion: "Correcto: el agua tiene un calor específico c muy alto (≈4186 J/kg·K), por eso modera el clima." },
        { enunciado: "Según Stefan-Boltzmann, si la temperatura absoluta se duplica, la potencia radiada se duplica.", respuesta: false, retroalimentacion: "Falso: la potencia crece con la CUARTA potencia de T; si T se duplica, la potencia se multiplica por 2⁴ = 16." },
      ],
    },
  },

  // ── A5 — GLOSARIO INTERACTIVO ─────────────────────────────────────────────
  {
    titulo: "Glosario: calor y sus formas de propagación",
    descripcion: "Términos clave para hablar de la conducción, la convección, la radiación y las propiedades térmicas.",
    tipo: "glosario_interactivo",
    xp: 15,
    estado: "borrador",
    contenido: {
      terminos: [
        { termino: "Calor", definicion: "Energía en tránsito entre cuerpos a distinta temperatura; se mide en joules (J).", ejemplo: "El café cede calor al aire frío hasta enfriarse." },
        { termino: "Temperatura", definicion: "Medida de la energía cinética promedio de las partículas; se mide en °C o K.", ejemplo: "El agua hierve a 100 °C (373 K) al nivel del mar." },
        { termino: "Conducción", definicion: "Propagación del calor por contacto directo, sin desplazamiento de la materia.", ejemplo: "Una cuchara metálica que se calienta dentro de una olla." },
        { termino: "Convección", definicion: "Propagación del calor mediante corrientes de un fluido que se mueve.", ejemplo: "El agua que hierve y circula en una olla; la brisa marina." },
        { termino: "Radiación", definicion: "Propagación del calor por ondas electromagnéticas; no necesita medio material.", ejemplo: "El calor del Sol que cruza el vacío del espacio." },
        { termino: "Conductividad térmica (k)", definicion: "Propiedad que indica qué tan bien un material conduce el calor (W/m·K).", ejemplo: "Cobre k≈401 (gran conductor); madera k≈0.15 (aislante)." },
        { termino: "Capacidad térmica específica (c)", definicion: "Energía necesaria para elevar 1 °C la temperatura de 1 kg de sustancia (J/kg·K).", ejemplo: "El agua c≈4186, mucho mayor que la de los metales." },
        { termino: "Equilibrio térmico", definicion: "Estado en que dos cuerpos en contacto llegan a la misma temperatura.", ejemplo: "El hielo en un refresco hasta que todo queda frío." },
        { termino: "Ley de Fourier", definicion: "Relación del flujo de calor por conducción: Q/t = k·A·ΔT/L.", ejemplo: "Una pared más gruesa (mayor L) deja pasar menos calor." },
        { termino: "Ley de Stefan-Boltzmann", definicion: "La potencia radiada crece con la cuarta potencia de la temperatura: Q/t = ε·σ·A·T⁴.", ejemplo: "Una estrella más caliente irradia muchísima más energía." },
      ],
      actividad_final: "Clasifica cada situación según la forma de propagación dominante: (1) el mango metálico de una sartén quema; (2) el humo de una fogata sube; (3) el Sol calienta tu piel; (4) un termo conserva el café caliente. Justifica cada uno.",
    },
  },

  // ── A6 — COMPLETAR ESPACIOS ───────────────────────────────────────────────
  {
    titulo: "Completa: las formas de propagación del calor",
    descripcion: "Completa el texto con los términos correctos sobre la propagación del calor.",
    tipo: "fill_blanks",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Arrastra o escribe la palabra correcta en cada espacio.",
      texto_con_huecos:
        "El calor fluye siempre del cuerpo más caliente al más frío. En los sólidos viaja por ___, transmitiéndose de átomo a átomo sin que la materia se desplace; los metales lo hacen bien porque tienen una ___ térmica alta. En los fluidos viaja por ___, mediante corrientes en las que el fluido caliente sube y el frío baja. Y como onda electromagnética, sin necesitar medio, viaja por ___: así llega el calor del ___. La energía para subir la temperatura de una masa se calcula con Q = m·___·ΔT, donde c es la capacidad térmica específica.",
      huecos: [
        { posicion: 0, respuesta_correcta: "conducción", alternativas_aceptadas: ["conduccion", "Conducción"] },
        { posicion: 1, respuesta_correcta: "conductividad", alternativas_aceptadas: ["conductividad térmica"] },
        { posicion: 2, respuesta_correcta: "convección", alternativas_aceptadas: ["conveccion", "Convección"] },
        { posicion: 3, respuesta_correcta: "radiación", alternativas_aceptadas: ["radiacion", "Radiación"] },
        { posicion: 4, respuesta_correcta: "Sol", alternativas_aceptadas: ["sol"] },
        { posicion: 5, respuesta_correcta: "c", alternativas_aceptadas: ["c"] },
      ],
    },
  },

  // ── A7 — AUTOEVALUACIÓN ───────────────────────────────────────────────────
  {
    titulo: "¿Cómo voy con la propagación del calor?",
    descripcion: "Evalúa tu propio dominio de los conceptos de esta progresión.",
    tipo: "autoevaluacion",
    xp: 10,
    estado: "borrador",
    contenido: {
      instrucciones: "Marca con honestidad qué tan seguro te sientes en cada punto. No hay respuestas correctas: te sirve para saber qué repasar.",
      criterios: [
        {
          descripcion: "Distingo conducción, convección y radiación y doy un ejemplo de cada una.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Calculo el flujo de calor por conducción con la ley de Fourier (Q/t = k·A·ΔT/L).",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Uso la capacidad térmica específica para calcular energía (Q = m·c·ΔT).",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
        {
          descripcion: "Explico por qué la radiación viaja en el vacío y cómo crece con la temperatura.",
          escala: [
            { valor: 1, etiqueta: "Aún no" },
            { valor: 2, etiqueta: "Con ayuda" },
            { valor: 3, etiqueta: "Casi siempre" },
            { valor: 4, etiqueta: "Con seguridad" },
          ],
        },
      ],
      reflexion_final_prompt: "¿Qué forma de propagación del calor te costó más entender y cómo podrías repasarla con un ejemplo de tu casa?",
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

  console.log(`\n🌱 CNEYT-II·O4 — Propagación del calor: conducción, convección y radiación  (${apply ? "APLICAR" : "DRY-RUN"})\n`);

  // UAC
  const { data: uac, error: uacErr } = await sb.from("uac").select("id, total_progresiones").eq("codigo", UAC_CODIGO).single();
  if (uacErr || !uac) throw new Error(`UAC ${UAC_CODIGO} no encontrada: ${uacErr?.message}`);

  // ¿numero=4 libre? (no debe existir otra progresión con ese numero)
  const { data: choque } = await sb.from("progresiones").select("codigo").eq("uac_id", uac.id).eq("numero", PROG_NUMERO).maybeSingle();
  if (choque && choque.codigo !== PROG_CODIGO) {
    throw new Error(`numero=${PROG_NUMERO} ya está ocupado por ${choque.codigo} — abortado para no chocar.`);
  }

  console.log(`Progresión ${PROG_CODIGO} (numero=${PROG_NUMERO}) — categoria "${PROGRESION.categoria}"`);
  console.log(`  titulo (O4 verbatim): ${PROGRESION.titulo}`);
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

  console.log(`\n✅ CNEYT-II·O4 sembrado (borrador). Ruta práctica:`);
  console.log(`   http://localhost:3000/hub/uac/${UAC_CODIGO}/progresion/${PROG_NUMERO}/actividad/2/practica\n`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("❌", e.message); process.exit(1); });
