/**
 * Producto Integrador del semestre para PFH-III (Pensamiento Filosófico y Humanidades III).
 * - Crea 1 capstone (reflexion_escrita) que integra las 4 progresiones:
 *   P01: Lógica y argumentación · P02: Filosofía política · P03: Estética · P04: Praxis filosófica transformadora.
 * - El PI consiste en diseñar una PROPUESTA DE PRAXIS FILOSÓFICA TRANSFORMADORA para la comunidad,
 *   fundamentada con herramientas de lógica/argumentación, un concepto de filosofía política
 *   y una reflexión estética/ética.
 * - Se aloja en la progresión de mayor número (culminante de PFH-III).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar PFH-III.
 * Uso: npx tsx scripts/seed-pfhiii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador PFH-III (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "PFH-III");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de PFH-III");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "PFH-III-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: Propuesta de Praxis Filosófica Transformadora",
    descripcion: "Capstone del semestre: diseña y fundamenta filosóficamente una propuesta de acción transformadora para tu comunidad, integrando herramientas de lógica y argumentación, filosofía política, estética y praxis filosófica.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "Producto Integrador de Pensamiento Filosófico y Humanidades III.\n\nA lo largo de este semestre desarrollaste cuatro grandes herramientas filosóficas: (1) lógica y argumentación, para construir y evaluar razonamientos; (2) filosofía política, para comprender el poder, la justicia y la ciudadanía; (3) estética, para reconocer el arte y la belleza como formas de conocimiento; y (4) praxis filosófica, para transformar la realidad desde el pensamiento crítico.\n\nAhora integrarás todo esto en una PROPUESTA DE PRAXIS FILOSÓFICA TRANSFORMADORA. Tu tarea es diseñar y redactar un ensayo argumentado (mínimo 300 palabras) con la siguiente estructura:\n\n1. DIAGNÓSTICO FILOSÓFICO (lógica y argumentación): Identifica un problema real de tu escuela o comunidad. Construye al menos UN argumento deductivo o inductivo que justifique por qué ese problema es filosóficamente relevante. Señala si en el debate público sobre ese problema hay alguna falacia lógica que debas evitar.\n\n2. FUNDAMENTACIÓN POLÍTICO-FILOSÓFICA: Aplica al menos UN concepto de filosofía política (justicia, democracia deliberativa, derechos/capacidades, desobediencia civil, etc.) para analizar el problema. Menciona a al menos UN filósofo o filósofa del programa (Rawls, Nussbaum, Dussel u otro) y explica cómo su pensamiento ilumina el problema.\n\n3. DIMENSIÓN ESTÉTICA Y ÉTICA: Reflexiona sobre el papel que pueden jugar el arte, la cultura o la expresión estética en tu propuesta transformadora. ¿Cómo puede la experiencia estética (mural, música, teatro comunitario, diseño participativo) fortalecer tu acción? Fundamenta tu respuesta con al menos un concepto estético filosófico.\n\n4. PROPUESTA DE ACCIÓN CONCRETA (praxis): Describe una acción específica, realizable y fundamentada que podrías llevar a cabo en tu comunidad. Explica: ¿qué harías?, ¿con quiénes?, ¿cuándo y dónde?, ¿qué cambio filosófico-social buscarías producir?\n\n5. REFLEXIÓN CRÍTICA: Evalúa los alcances y limitaciones éticas de tu propuesta. ¿Qué valores filosóficos guían tu acción? ¿Qué obstáculos deberías anticipar?\n\nEscribe con rigor filosófico: cita conceptos con precisión, construye argumentos válidos y sé honesto sobre las dificultades de transformar la realidad desde la filosofía.",
      pistas: [
        "Para el diagnóstico, formula el problema como una proposición filosófica: ¿qué valor o principio está siendo violado? Luego construye un argumento deductivo o inductivo para justificarlo.",
        "Para la fundamentación política, elige a Rawls (justicia como equidad), Nussbaum (capacidades) o Dussel (perspectiva de los excluidos) según cuál ilumine mejor tu problema concreto.",
        "Para la dimensión estética, piensa en expresiones artísticas de tu comunidad (murales, música tradicional, artesanía) que ya estén transformando la realidad o que podrían hacerlo en tu propuesta.",
        "La propuesta de acción debe ser concreta y realizable: evita generalidades. Especifica el público, el lugar, el momento y el cambio esperado.",
        "En la reflexión crítica, usa herramientas de ética filosófica: ¿tu acción respeta la autonomía de las personas? ¿Promueve la justicia? ¿Es coherente con los principios que argumentaste antes?",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Identifica un problema real de la comunidad y lo formula como un problema filosófico relevante con claridad conceptual.",
        "Construye al menos un argumento deductivo o inductivo válido para justificar la relevancia filosófica del problema.",
        "Aplica correctamente al menos un concepto de filosofía política y cita a un filósofo o filósofa del programa con precisión.",
        "Integra al menos un concepto estético filosófico para fundamentar el papel del arte o la cultura en la propuesta transformadora.",
        "Diseña una propuesta de acción concreta, específica y realizable, articulada con el análisis filosófico previo.",
        "Evalúa críticamente los alcances y limitaciones éticas de la propuesta con argumentos filosóficos.",
        "El ensayo integra coherentemente las cuatro progresiones del semestre: lógica, filosofía política, estética y praxis.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador PFH-III creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de PFH-III (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 PFH-III total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
