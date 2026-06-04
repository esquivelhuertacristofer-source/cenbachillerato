/**
 * Producto Integrador del semestre para CS-III (Ciencias Sociales III).
 * - Crea 1 capstone (reflexion_escrita) que integra las 3 progresiones:
 *   P01: Crisis social (causas estructurales y actores)
 *   P02: Políticas públicas y participación ciudadana
 *   P03: Juventudes como sujetos históricos y políticos
 * - El PI consiste en una PROPUESTA DE INVESTIGACIÓN APLICADA Y ACCIÓN CIUDADANA:
 *   el alumno analiza una crisis social real, examina la política pública de respuesta
 *   y diseña una propuesta de participación juvenil para incidir en su solución.
 * - Se aloja en la progresión de mayor número (culminante de CS-III).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar CS-III.
 * Uso: npx tsx scripts/seed-csiii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CS-III (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "CS-III");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de CS-III");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "CS-III-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: De la Crisis a la Acción — Análisis Social y Propuesta de Participación Juvenil",
    descripcion: "Capstone del semestre: analiza una crisis social real desde sus causas estructurales, examina la política pública que la atiende y diseña una propuesta de participación juvenil para incidir en su solución.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "PRODUCTO INTEGRADOR — Ciencias Sociales III\n" +
        "De la Crisis a la Acción: Análisis Social y Propuesta de Participación Juvenil\n\n" +
        "A lo largo de este semestre desarrollaste tres grandes lentes para comprender la realidad social: (1) el análisis de las crisis sociales desde múltiples escalas y perspectivas, identificando sus causas estructurales y actores; (2) el estudio del ciclo de las políticas públicas como respuesta institucional a los problemas colectivos, y el papel de la ciudadanía en ese proceso; y (3) el reconocimiento de las juventudes como sujetos históricos y políticos con agencia propia y formas diversas de participación.\n\n" +
        "Ahora es momento de integrar estas tres miradas en un ensayo de propuesta aplicada (mínimo 300 palabras) con la siguiente estructura:\n\n" +
        "1. ANÁLISIS DE LA CRISIS SOCIAL (Propósito 1):\n" +
        "Elige una situación de crisis social real —económica, ambiental, sanitaria o de violencia— que afecte a tu comunidad, municipio, estado o país. Puede ser una crisis que vivas directamente o que hayas investigado. Responde:\n" +
        "a) ¿Qué tipo de crisis es y cuáles son sus manifestaciones concretas? Describe con datos o evidencias específicas.\n" +
        "b) ¿Cuáles son sus causas estructurales? Distingue las causas de fondo (históricas, económicas, políticas) de los detonantes inmediatos.\n" +
        "c) ¿Qué actores están involucrados? Identifica al menos tres: quiénes toman decisiones, quiénes sufren el impacto y quiénes pueden contribuir a la solución.\n" +
        "d) Analiza la crisis desde al menos dos escalas: local y nacional (o global). ¿Cómo se conectan?\n\n" +
        "2. EXAMEN DE LA POLÍTICA PÚBLICA DE RESPUESTA (Propósito 2):\n" +
        "Investiga si existe —o si debería existir— una política pública que atienda la crisis que elegiste. Responde:\n" +
        "a) ¿Cuál es (o sería) el objetivo de esa política pública? ¿En qué fase del ciclo se encuentra: diseño, implementación o evaluación?\n" +
        "b) ¿Qué tan efectiva, eficiente y equitativa ha sido (o podría ser) esa política? Identifica al menos una fortaleza y una limitación.\n" +
        "c) ¿Cómo ha participado (o podría participar) la ciudadanía en el diseño, implementación o evaluación de esa política? ¿Qué mecanismos existen o faltan: consulta pública, contraloría social, presupuesto participativo?\n" +
        "d) ¿Qué cambios propondrías en la política pública para que sea más efectiva y equitativa? Argumenta con al menos un principio de análisis de políticas públicas.\n\n" +
        "3. PROPUESTA DE PARTICIPACIÓN JUVENIL (Propósito 3):\n" +
        "Como joven —sujeto histórico con agencia propia— diseña una propuesta de acción concreta para incidir en la crisis que analizaste. Responde:\n" +
        "a) ¿Qué forma de participación juvenil propones: electoral, comunitaria, cultural o digital? ¿Por qué esa forma es la más adecuada para este problema?\n" +
        "b) Describe la acción con detalle: ¿qué harías?, ¿con qué otros actores juveniles o adultos trabajarías?, ¿en qué espacio (escuela, barrio, plataforma digital, institución)?, ¿en qué plazo?\n" +
        "c) ¿Qué cambio social concreto y medible buscarías producir? ¿Cómo sabrías que la acción tuvo impacto?\n" +
        "d) ¿Qué obstáculos anticipas —estructurales o coyunturales— y cómo los abordarías?\n\n" +
        "4. REFLEXIÓN INTEGRADORA:\n" +
        "En un párrafo final, reflexiona: ¿De qué manera el análisis social riguroso (escala, causas, actores) y el conocimiento de las políticas públicas fortalecen tu capacidad de participar como joven en la transformación de tu entorno? ¿Qué aprendiste de este semestre que cambia la forma en que ves los problemas sociales de tu comunidad?\n\n" +
        "Escribe con claridad y argumentación: usa conceptos de las tres progresiones, sustenta tus afirmaciones con ejemplos o evidencias, y conecta el análisis con la propuesta de acción.",
      pistas: [
        "Para el análisis de la crisis, elige un problema que conozcas de cerca: será más fácil identificar sus causas estructurales y actores. Recuerda distinguir entre el 'síntoma' visible (ej. desempleo juvenil) y las causas de fondo (modelo económico, falta de formación, discriminación).",
        "Para el examen de la política pública, puedes investigar en el portal del gobierno federal, estatal o municipal. Si no existe una política específica para tu crisis, argumenta por qué debería existir y cómo debería diseñarse usando los principios del ciclo de política pública.",
        "Para la propuesta de participación juvenil, sé específico y realista: una acción concreta en tu escuela, barrio o red digital tiene más fuerza que una propuesta vaga. Considera el activismo digital si tu causa tiene alcance más amplio, o la organización comunitaria si el impacto es más local.",
        "Recuerda que 'juventudes' es un concepto plural: en tu propuesta considera si hay otros jóvenes de contextos distintos (rurales, indígenas, con discapacidad) que deberían ser incluidos para que la acción sea más equitativa.",
        "En la reflexión integradora, conecta explícitamente los tres propósitos del semestre: muestra cómo el análisis de la crisis (P1), el conocimiento de políticas públicas (P2) y la agencia juvenil (P3) se articulan en tu propuesta de acción. Este es el núcleo del Producto Integrador.",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Identifica y describe una crisis social real con evidencias o datos específicos, distinguiendo sus causas estructurales de sus detonantes inmediatos (Propósito 1).",
        "Analiza la crisis desde al menos dos escalas de análisis (local y nacional o global) e identifica los actores involucrados con sus respectivos intereses (Propósito 1).",
        "Examina una política pública relacionada con la crisis, evaluando su efectividad, eficiencia y equidad con al menos una fortaleza y una limitación argumentadas (Propósito 2).",
        "Identifica mecanismos de participación ciudadana existentes o propone nuevos para mejorar el diseño, implementación o evaluación de la política pública analizada (Propósito 2).",
        "Diseña una propuesta de participación juvenil concreta —electoral, comunitaria, cultural o digital— que sea específica, realizable y articulada con el análisis social previo (Propósito 3).",
        "Anticipa obstáculos a la propuesta de acción y argumenta cómo abordarlos, reconociendo la diversidad de contextos juveniles (Propósito 3).",
        "El ensayo integra coherentemente los tres propósitos del semestre —crisis social, políticas públicas y participación juvenil— con argumentación clara y uso preciso de conceptos.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador CS-III creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de CS-III (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 CS-III total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
