/**
 * Producto Integrador del semestre para CNEYT-IV
 * (Ciencias Naturales, Experimentales y Tecnología IV — Reacciones Químicas).
 * - Crea 1 capstone (reflexion_escrita) que integra las 8 progresiones:
 *   1) balanceo de ecuaciones, 2) tipos de reacciones, 3) pH/ácidos y bases,
 *   4) compuestos orgánicos, 5) biomoléculas, 6) química orgánica industrial,
 *   7) contaminantes y plásticos, 8) experimentos de química.
 *   Se aloja en la progresión de mayor número (culminante de CNEYT-IV).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar.
 * Uso: npx tsx scripts/seed-cneytiv-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CNEYT-IV (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-IV");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de CNEYT-IV");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "CNEYT-IV-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: Investigación Química Aplicada — Del Laboratorio a la Sociedad",
    descripcion: "Capstone del semestre: integra balanceo de ecuaciones, tipos de reacciones, pH, química orgánica, biomoléculas, industria química, contaminantes y diseño experimental en una investigación aplicada de química.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "PRODUCTO INTEGRADOR — CNEYT-IV: Reacciones Químicas\n\n" +
        "A lo largo del semestre exploraste los grandes ejes de la química moderna: interpretaste y balanceaste ecuaciones químicas aplicando la ley de conservación de la masa; clasificaste los tipos de reacciones químicas y predijiste sus productos; analizaste el pH y el papel de ácidos y bases en contextos cotidianos y biológicos; describiste las propiedades de los compuestos orgánicos básicos (alcanos, alquenos, alcoholes y ácidos carboxílicos); identificaste las biomoléculas y sus funciones en los seres vivos; relacionaste la química orgánica con la industria farmacéutica, alimentaria y de materiales; evaluaste el impacto de contaminantes químicos y plásticos en el ambiente; y diseñaste experimentos sencillos con materiales accesibles.\n\n" +
        "Ahora integrarás todos esos aprendizajes en una INVESTIGACIÓN QUÍMICA APLICADA que conecte la química del laboratorio con un problema o fenómeno real de tu comunidad o entorno.\n\n" +
        "INSTRUCCIONES\n\n" +
        "Elige UNO de los siguientes escenarios de investigación aplicada:\n\n" +
        "  A) Calidad del agua en tu comunidad: analiza el pH del agua de tu localidad, identifica las reacciones de tratamiento del agua (cloración, floculación), relaciona los contaminantes químicos presentes y propón experimentos sencillos de purificación.\n\n" +
        "  B) La química de los alimentos que consumes: selecciona un alimento procesado de tu dieta habitual y analiza sus ingredientes desde la perspectiva de la química orgánica, las biomoléculas que contiene, las reacciones de conservación o cocción involucradas y el impacto de sus aditivos en la salud.\n\n" +
        "  C) Residuos plásticos y química ambiental: realiza un inventario de los plásticos en tu hogar o escuela, identifica la química de su degradación, evalúa su impacto como contaminantes, propón alternativas desde la economía circular y diseña un experimento para comparar la solubilidad o degradación de distintos plásticos.\n\n" +
        "ESTRUCTURA DEL ENSAYO (mínimo 300 palabras)\n\n" +
        "1. INTRODUCCIÓN Y PLANTEAMIENTO DEL PROBLEMA (aprox. 80 palabras)\n" +
        "   Describe el escenario elegido y el problema químico central. ¿Por qué es relevante para tu comunidad o para la sociedad? Plantea una pregunta de investigación clara.\n\n" +
        "2. MARCO TEÓRICO INTEGRADO (aprox. 300 palabras)\n" +
        "   Desarrolla los conceptos químicos del semestre que sustentan tu investigación. Debes incluir obligatoriamente:\n" +
        "   a) Al menos UNA ecuación química balanceada relevante al escenario (con sus reactivos y productos identificados y su tipo de reacción).\n" +
        "   b) El papel del pH en el fenómeno estudiado: ¿qué valor de pH es relevante y por qué?\n" +
        "   c) La estructura y función de al menos UN compuesto orgánico o biomolécula involucrado.\n" +
        "   d) La conexión con la industria química (farmacéutica, alimentaria o de materiales) o con el impacto ambiental de contaminantes.\n\n" +
        "3. DISEÑO EXPERIMENTAL (aprox. 150 palabras)\n" +
        "   Propón un experimento sencillo con materiales accesibles que te permita responder tu pregunta de investigación. Incluye:\n" +
        "   - Hipótesis (formulada como 'Si… entonces…').\n" +
        "   - Variables: independiente, dependiente y al menos dos controladas.\n" +
        "   - Materiales (todos deben ser de fácil acceso).\n" +
        "   - Procedimiento paso a paso (mínimo 5 pasos).\n" +
        "   - Tabla de resultados esperados.\n" +
        "   - Medidas de seguridad (EPP y manejo de residuos).\n\n" +
        "4. ANÁLISIS Y DISCUSIÓN (aprox. 150 palabras)\n" +
        "   Interpreta los resultados esperados o reales de tu experimento a la luz de la química. ¿Cómo se relacionan con los conceptos del semestre? ¿Qué reacciones químicas explican los resultados? ¿En qué difieren de tu hipótesis si aplica?\n\n" +
        "5. CONCLUSIONES Y PROPUESTA DE ACCIÓN (aprox. 100 palabras)\n" +
        "   Sintetiza lo aprendido: ¿qué responde tu investigación a la pregunta inicial? Propón al menos UNA acción concreta (individual, escolar o comunitaria) que aplique los conocimientos químicos del semestre para abordar el problema real identificado.\n\n" +
        "6. REFLEXIÓN PERSONAL (aprox. 80 palabras)\n" +
        "   ¿Cómo cambió tu comprensión de la química después de CNEYT-IV? Menciona el concepto que más te sorprendió y explica cómo lo puedes aplicar en tu vida cotidiana.\n\n" +
        "CRITERIOS DE CALIDAD\n" +
        "- Usa vocabulario químico preciso aprendido en el semestre.\n" +
        "- Apoya tus afirmaciones con la teoría química (no solo opiniones).\n" +
        "- Relaciona explícitamente al menos 5 de los 8 propósitos del semestre.\n" +
        "- El experimento propuesto debe ser seguro y reproducible con materiales de hogar o escuela.",
      pistas: [
        "Para el marco teórico, recuerda que toda ecuación química balanceada debe cumplir la ley de conservación de la masa: los átomos de cada elemento deben ser iguales en reactivos y productos. Identifica el tipo de reacción (síntesis, descomposición, ácido-base, combustión) y justifica la clasificación.",
        "Al analizar el pH en tu escenario, recuerda que la escala va de 0 a 14: menor de 7 es ácido, mayor de 7 es básico. Si estudias la calidad del agua, el pH óptimo para consumo humano es 6.5-8.5; si estudias alimentos, el pH afecta la actividad de enzimas digestivas y la conservación por acidificación.",
        "Para la sección de compuestos orgánicos o biomoléculas, conecta la estructura molecular con la función: los carbohidratos aportan energía rápida (glucosa), los lípidos forman membranas y reservas, las proteínas catalizan reacciones (enzimas) y los ácidos nucleicos codifican la información genética. Identifica cuál aparece en tu escenario elegido.",
        "En el diseño experimental, asegúrate de que tu hipótesis sea falsable (en formato 'Si [variable independiente]… entonces [variable dependiente]…'). Define claramente qué cambias, qué mides y qué mantienes constante. Piensa en indicadores naturales de pH (repollo morado, jamaica) si el experimento involucra acidez o basicidad.",
        "Para las conclusiones y la propuesta de acción, conecta tu investigación con el contexto de la economía circular (si trabajas con plásticos), con la importancia de la regulación del pH en organismos vivos (si trabajas con alimentos o agua), o con el uso responsable de compuestos químicos. Apoya tu propuesta en datos o evidencias del marco teórico.",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Plantea una pregunta de investigación clara y relevante para su comunidad, con conexión explícita a la química estudiada en el semestre (P01-P02: ecuaciones y tipos de reacciones).",
        "Incluye al menos una ecuación química balanceada correctamente, identifica el tipo de reacción y la justifica dentro de su escenario de investigación (P01-P02).",
        "Analiza el papel del pH en el fenómeno estudiado con valores concretos y argumenta su importancia en contextos cotidianos o biológicos (P03).",
        "Identifica y describe la estructura y función de al menos un compuesto orgánico básico o biomolécula relevante para su escenario de investigación (P04-P05).",
        "Relaciona su investigación con aplicaciones de la química orgánica en la industria o evalúa el impacto de contaminantes químicos y plásticos en el ambiente (P06-P07).",
        "Diseña un experimento con hipótesis falsable, variables claramente definidas, materiales accesibles, procedimiento seguro y tabla de resultados esperados (P08).",
        "Propone una acción concreta fundamentada en evidencia química para abordar el problema identificado, y reflexiona sobre el impacto de la química en su vida cotidiana y en la sociedad.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador CNEYT-IV creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de CNEYT-IV (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 CNEYT-IV total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
