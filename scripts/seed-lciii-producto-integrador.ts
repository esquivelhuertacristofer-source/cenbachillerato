/**
 * Producto Integrador del semestre para LC-III (Lengua y Comunicación III — "Describir culturas, apropiarse de las palabras").
 * - Crea 1 capstone (reflexion_escrita) que integra las 7 progresiones: análisis textual, movimientos
 *   literarios, géneros, subgéneros narrativos, poesía y figuras retóricas, reseña crítica y exposición oral.
 *   Se aloja en la progresión de mayor número (culminante de LC-III).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar LC-III.
 * Uso: npx tsx scripts/seed-lciii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador LC-III (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "LC-III");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de LC-III");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "LC-III-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: Reseña crítica de una obra literaria",
    descripcion: "Capstone del semestre: integra el análisis textual, la identificación del movimiento literario, el género y subgénero, las figuras retóricas y la preparación para una exposición oral, a través de la escritura de una reseña crítica de una obra literaria elegida libremente.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "Producto Integrador del semestre. A lo largo de Lengua y Comunicación III aprendiste a analizar textos con sentido crítico, a reconocer los movimientos literarios y sus características, a leer los géneros y subgéneros narrativos, a identificar figuras retóricas en la poesía, y a escribir y exponer una reseña crítica. Ahora integrarás todo en una sola producción escrita.\n\nEscribe una RESEÑA CRÍTICA (mínimo 300 palabras) de una obra literaria de tu elección. Tu reseña debe incluir:\n\n1) Presentación de la obra: título, autor, género literario (novela, cuento, poesía, drama o ensayo) y subgénero si aplica (suspenso, terror, ciencia ficción, autoficción, etc.).\n2) Contextualización: movimiento literario al que pertenece la obra (Barroco, Romanticismo, Realismo, Modernismo, Vanguardias, Realismo mágico u otro) y época o contexto histórico-cultural.\n3) Análisis del texto: identifica la intención del autor, el sentido global de la obra y al menos una idea que puedas parafrasear con tus propias palabras.\n4) Análisis de figuras retóricas (si la obra lo permite): identifica y explica al menos dos figuras retóricas presentes en un fragmento (metáfora, hipérbole, prosopopeya, hipérbaton, ironía).\n5) Interpretación crítica: desarrolla tu lectura personal y argumentada de los temas centrales y los recursos literarios más significativos de la obra.\n6) Valoración: emite un juicio global sobre la calidad, relevancia o impacto de la obra, justificado con argumentos concretos.\n7) Cierre con postura: expresa tu postura personal frente al autor o a la obra, indicando si estás de acuerdo o en desacuerdo con su visión del mundo o sus recursos, y por qué.\n\nAl terminar la reseña escrita, agrega un apartado breve (máximo 100 palabras) donde expliques: ¿Cómo presentarías esta reseña en un coloquio, simposio o foro? ¿Qué partes destacarías en tu exposición oral y qué materiales de apoyo utilizarías?",
      pistas: [
        "Para la contextualización recuerda las características de cada movimiento literario: época, estilo, autores representativos y visión del mundo.",
        "Para el análisis del texto pregúntate: ¿qué quiso lograr el autor con esta obra? ¿Qué intención tiene? ¿Cuál es el sentido global?",
        "Para las figuras retóricas busca en el texto comparaciones sin 'como' (metáfora), exageraciones (hipérbole), cosas que hablan o sienten (prosopopeya), alteraciones del orden de las palabras (hipérbaton) o afirmaciones que dicen lo contrario de lo que se piensa (ironía).",
        "Para la interpretación ve más allá del argumento: ¿qué dice la obra sobre la sociedad, la identidad, el poder o la naturaleza humana?",
        "Para la exposición oral piensa en el formato más adecuado según tu tema: el coloquio invita al debate, el simposio a presentar perspectivas distintas y el foro a la participación del público.",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Presenta la obra con título, autor, género literario y subgénero correctamente identificados.",
        "Contextualiza la obra en su movimiento literario y época con precisión y pertinencia.",
        "Analiza la intención del autor y el sentido global de la obra con argumentos textuales.",
        "Identifica y explica al menos dos figuras retóricas presentes en un fragmento de la obra.",
        "Desarrolla una interpretación crítica argumentada de los temas y recursos literarios centrales.",
        "Emite una valoración global justificada sobre la calidad o relevancia de la obra.",
        "Expresa una postura crítica clara frente al autor o a la obra y planea su presentación oral.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador LC-III creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de LC-III (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 LC-III total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
