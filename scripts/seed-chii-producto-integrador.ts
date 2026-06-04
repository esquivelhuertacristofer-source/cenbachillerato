/**
 * Producto Integrador del semestre para CH-II (Conciencia Histórica II —
 * historicidad, hipótesis históricas, sentido histórico y procesos históricos
 * de México y el mundo en perspectiva multicausal e interconectada).
 * - Crea 1 capstone (reflexion_escrita) que integra las 4 progresiones:
 *   P01 historicidad/sujeto histórico, P02 hipótesis y fuentes,
 *   P03 sentido histórico/pasado-presente, P04 multicausalidad/interconexión.
 *   Se aloja en la progresión de mayor número (culminante de CH-II).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar.
 * Uso: npx tsx scripts/seed-chii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CH-II (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "CH-II");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de CH-II");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "CH-II-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: Ensayo Histórico — Un Proceso que Cambió al Mundo y Sigue Cambiando Mi Realidad",
    descripcion: "Capstone del semestre: integra las cuatro progresiones de CH-II (historicidad y sujeto histórico; hipótesis históricas, fuentes y evidencias; sentido histórico y relación pasado-presente; multicausalidad e interconexión de procesos históricos) en un ensayo histórico analítico sobre un proceso de México o del mundo.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "PRODUCTO INTEGRADOR — CH-II: Conciencia Histórica II\n\n" +
        "A lo largo del semestre desarrollaste cuatro grandes competencias históricas: (1) reconocer tu propia historicidad como sujeto inscrito en procesos sociales, culturales e históricos; (2) formular hipótesis históricas a partir de la interpretación crítica de fuentes y evidencias del pasado; (3) ejercer el sentido histórico como capacidad para comprender el presente desde el pasado; y (4) analizar procesos históricos de México y el mundo en su contexto multicausal e interconectado.\n\n" +
        "TAREA: Escribe un ensayo histórico analítico (mínimo 300 palabras) que demuestre que dominas las cuatro competencias anteriores, aplicándolas de manera integrada al análisis de UN proceso histórico de tu elección.\n\n" +
        "PROCESO HISTÓRICO A ELEGIR (elige uno de los siguientes, u otro que acuerdes con tu docente):\n" +
        "— La Conquista de México (1519-1521) y sus consecuencias de larga duración\n" +
        "— La Independencia de México (1810-1821) en el contexto de las Revoluciones Atlánticas\n" +
        "— La Reforma Liberal y la Guerra de Reforma (1855-1861) bajo Benito Juárez\n" +
        "— La Revolución Mexicana (1910-1920): causas, actores y legado\n" +
        "— La Segunda Guerra Mundial (1939-1945) y sus efectos globales y en México\n" +
        "— La Guerra Fría (1947-1991) y su impacto en América Latina y México\n" +
        "— El Movimiento Estudiantil de 1968 en México (Tlatelolco) en perspectiva global\n" +
        "— La globalización económica (desde 1980) y sus efectos en México y el mundo\n\n" +
        "ESTRUCTURA OBLIGATORIA DEL ENSAYO:\n\n" +
        "1) INTRODUCCIÓN E HISTORICIDAD (Progresión 1): Presenta el proceso histórico elegido. Explica por qué como sujeto histórico situado en el siglo XXI mexicano te parece relevante estudiar ese proceso. ¿Qué aspectos de tu identidad, cultura o realidad cotidiana conectan con ese proceso? Demuestra que reconoces tu propia historicidad: ¿qué condicionamientos históricos (familia, región, lengua, instituciones) te sitúan frente a ese tema de una manera particular y no desde un punto de vista 'neutral'?\n\n" +
        "2) HIPÓTESIS E INTERPRETACIÓN DE FUENTES (Progresión 2): Formula una hipótesis histórica clara y verificable sobre el proceso elegido. Debe ser una proposición que explique causas, consecuencias o características del proceso, y que pueda sustentarse con evidencias. Ejemplo de forma: 'El proceso X ocurrió/tuvo las consecuencias Y principalmente porque Z'. Identifica al menos DOS tipos de fuentes (una primaria y una secundaria) que utilizarías para sustentarla o refutarla, explicando: a) qué tipo de fuente es cada una; b) qué información aportaría; c) qué limitaciones o sesgos podría tener; y d) cómo las contrastarías para evitar depender de una sola perspectiva.\n\n" +
        "3) SENTIDO HISTÓRICO: PASADO Y PRESENTE (Progresión 3): Demuestra el sentido histórico aplicado a tu proceso elegido. Explica cómo ese proceso del pasado sigue presente en la realidad de México o del mundo hoy. Identifica AL MENOS DOS consecuencias o herencias de ese proceso que sean visibles en la actualidad (instituciones, estructuras sociales, prácticas culturales, conflictos vigentes, desigualdades, logros). Distingue qué elementos del pasado son continuidades (permanecen) y cuáles representaron rupturas (quiebres con el orden anterior). Evita el presentismo: contextualiza los hechos del pasado en su época antes de juzgarlos con criterios actuales.\n\n" +
        "4) ANÁLISIS MULTICAUSAL E INTERCONEXIÓN GLOBAL (Progresión 4): Analiza el proceso elegido desde la perspectiva de la multicausalidad y la historia global. Identifica CUATRO causas del proceso de tipos distintos (al menos: una causa política, una económica, una social y una cultural/ideológica). Explica cómo se interrelacionan entre sí estas causas: ¿cuáles son más estructurales (de larga duración) y cuáles son más coyunturales (eventos detonadores)? Conecta tu proceso con al menos UN fenómeno histórico de otra región del mundo que lo haya influido o con el que sea comparable: ¿qué aprendemos al ver tu proceso en perspectiva global que no veríamos si lo estudiamos de manera aislada?\n\n" +
        "5) CONCLUSIÓN Y REFLEXIÓN CRÍTICA: Cierra el ensayo con una reflexión en la que: a) sintetices la hipótesis histórica que planteaste y si el análisis realizado la sustenta; b) respondas: ¿qué significa que este proceso sea parte de tu herencia histórica como sujeto del siglo XXI?; c) plantees UNA pregunta histórica que tu análisis dejó abierta o que te gustaría seguir investigando; y d) reflexiones sobre cómo el estudio de este proceso histórico transforma tu comprensión del presente y eventualmente puede orientar decisiones o acciones futuras.\n\n" +
        "REQUISITOS FORMALES: El ensayo debe tener mínimo 300 palabras. Usa vocabulario histórico preciso (cita los conceptos trabajados en el semestre: historicidad, sujeto histórico, hipótesis histórica, fuentes primarias y secundarias, sentido histórico, multicausalidad, larga duración, etc.). Presenta argumentos sustentados, no solo opiniones. Si citas una fuente o dato específico, indícalo brevemente. Puedes incluir ejemplos históricos concretos con fechas y protagonistas.",
      pistas: [
        "Para la sección de HISTORICIDAD (Progresión 1): no te limites a decir 'me interesa la historia'. Piensa concretamente: ¿hablas una lengua que tiene raíces en ese proceso? ¿Tu región fue escenario de ese evento? ¿Hay tradiciones en tu familia o comunidad que vengan de esa época? ¿Alguna institución que uses (escuela, gobierno local, mercado) surgió de ese proceso? Cuanto más específico y personal seas, mejor demostrarás que reconoces tu historicidad.",
        "Para la HIPÓTESIS (Progresión 2): una buena hipótesis histórica NO es una afirmación obvia ni una opinión personal. Debe explicar algo, ser falseable (que alguien pudiera refutarla con evidencias) y ser específica. Evita hipótesis como 'la Revolución Mexicana fue importante'; prueba con 'La Revolución Mexicana fracasó en sus objetivos agrarios porque las élites posrevolucionarias reinstauraron el latifundismo bajo nuevas formas'. Luego busca fuentes que la pongan a prueba.",
        "Para el SENTIDO HISTÓRICO (Progresión 3): conecta el proceso histórico con fenómenos CONCRETOS y actuales, no con generalidades. Por ejemplo, si elegiste la Conquista: el hecho de que México tenga 68 agrupaciones lingüísticas indígenas reconocidas por el INALI, pero que la mayor parte de la población hable español como lengua dominante, es una consecuencia directa de la Conquista y la evangelización colonial que puedes analizar hoy.",
        "Para el ANÁLISIS MULTICAUSAL (Progresión 4): usa un organizador mental para no confundir causas con consecuencias. Las causas son las condiciones y eventos ANTERIORES al proceso que lo hicieron posible o lo desencadenaron. Las consecuencias son lo que cambió DESPUÉS. Por ejemplo, para la Independencia: causas son la Ilustración, la crisis de la Corona española (1808), la desigualdad colonial; consecuencias son la nueva nación, las guerras civiles del siglo XIX, la Constitución de 1824.",
        "Para la CONEXIÓN GLOBAL (Progresión 4): si elegiste un proceso mexicano, busca su paralelo o influencia internacional. La Revolución Mexicana fue la primera revolución social del siglo XX y anticipó cambios que luego ocurrieron en Rusia (1917) y China (1949). La Reforma de Juárez se inspiró en el liberalismo europeo y coincidió con procesos de unificación nacional en Italia y Alemania. Ver esas conexiones enriquece enormemente el análisis histórico.",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Demuestra conciencia de su propia historicidad: explica con ejemplos concretos y personales cómo procesos históricos han moldeado su identidad, cultura y contexto actual, reconociéndose como sujeto situado en el tiempo histórico (Progresión 1).",
        "Formula una hipótesis histórica clara, específica y verificable; identifica fuentes primarias y secundarias pertinentes; evalúa críticamente sus posibilidades y limitaciones; y propone estrategias de corroboración mediante el contraste de evidencias (Progresión 2).",
        "Aplica el sentido histórico identificando continuidades y rupturas entre el pasado y el presente; conecta el proceso histórico con fenómenos actuales concretos; contextualiza los hechos en su época evitando el presentismo; y distingue memoria colectiva de análisis histórico crítico (Progresión 3).",
        "Analiza el proceso histórico con perspectiva multicausal (causas políticas, económicas, sociales e ideológicas) e interconectada (lo vincula con al menos un proceso histórico de otra región del mundo), demostrando comprensión de que los procesos locales y globales se influyen mutuamente (Progresión 4).",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador CH-II creado (borrador)\n" : "  ✗ Falló el Producto Integrador CH-II\n");

  // Estado actual de CH-II (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 CH-II total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
