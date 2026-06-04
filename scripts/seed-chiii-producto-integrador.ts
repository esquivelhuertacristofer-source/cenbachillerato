/**
 * Producto Integrador del semestre para CH-III (Conciencia Histórica III —
 * crítica y corroboración de fuentes, narrativa histórica argumentada y
 * comunicación histórica con rigor y creatividad).
 * - Crea 1 capstone (reflexion_escrita) que integra las 4 progresiones:
 *   Selección/evaluación/contraste de fuentes, corroboración de fuentes,
 *   narraciones históricas argumentadas y comunicación histórica.
 *   Se aloja en la progresión de mayor número (culminante de CH-III).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar.
 * Uso: npx tsx scripts/seed-chiii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CH-III (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "CH-III");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de CH-III");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "CH-III-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: Investigación Histórica Argumentada — Fuentes, Corroboración, Narrativa y Comunicación",
    descripcion: "Capstone del semestre: integra las cuatro progresiones de CH-III (selección y evaluación de fuentes históricas, corroboración de evidencias, elaboración de narraciones históricas argumentadas y comunicación histórica con rigor y creatividad) en un ensayo de investigación histórica sobre un proceso del pasado relevante para el presente.",
    tipo: "reflexion_escrita",
    xp: 50,
    contenido: {
      prompt:
        "PRODUCTO INTEGRADOR — CH-III: Conciencia Histórica III\n\n" +
        "A lo largo del semestre desarrollaste cuatro competencias fundamentales del pensamiento histórico: " +
        "(1) seleccionar, evaluar y contrastar fuentes históricas diversas para construir interpretaciones informadas; " +
        "(2) aplicar el procedimiento de corroboración de fuentes para validar evidencias históricas; " +
        "(3) elaborar narraciones históricas argumentadas que incorporan causas, consecuencias y perspectivas múltiples; " +
        "y (4) comunicar tu interpretación histórica de manera escrita con rigor y creatividad.\n\n" +
        "SITUACIÓN INTEGRADORA — INVESTIGACIÓN HISTÓRICA ARGUMENTADA:\n" +
        "Elabora un ensayo de investigación histórica (mínimo 300 palabras) sobre un proceso histórico de tu elección " +
        "que tenga conexión con el presente: puede ser local, nacional o mundial. El proceso debe tener una duración " +
        "de al menos diez años y contar con fuentes documentales disponibles. Ejemplos posibles: la Revolución Mexicana " +
        "y sus consecuencias sociales; el proceso de industrialización en México (siglo XX); los movimientos estudiantiles " +
        "de 1968; la globalización económica desde los años noventa; los procesos de migración en tu región; " +
        "las revoluciones independentistas latinoamericanas; la Segunda Guerra Mundial y el orden mundial posterior. " +
        "Puedes elegir cualquier proceso histórico siempre que puedas identificar fuentes y argumentar con evidencias.\n\n" +
        "Tu ensayo debe desarrollar de manera integrada los siguientes CUATRO componentes, " +
        "que corresponden a las cuatro progresiones de CH-III:\n\n" +
        "COMPONENTE 1 — SELECCIÓN Y EVALUACIÓN DE FUENTES:\n" +
        "Selecciona al menos tres fuentes sobre el proceso histórico elegido: mínimo una fuente primaria " +
        "(documento, carta, crónica, fotografía, objeto de la época, relato de testigo) y al menos una fuente secundaria " +
        "(libro, artículo académico, documental, análisis historiográfico). Para cada fuente, presenta: " +
        "(a) tipo de fuente (primaria o secundaria) y subtipo (escrita, iconográfica, oral, material); " +
        "(b) datos de identificación: autor, fecha, origen o lugar de publicación; " +
        "(c) propósito o intención de la fuente: ¿para qué fue creada y para quién?; " +
        "(d) sesgo identificado: ¿qué perspectiva privilegia? ¿qué omite o minimiza?; " +
        "(e) aportación específica que hace esa fuente a tu investigación. " +
        "Explica por qué elegiste ese conjunto de fuentes y no otras.\n\n" +
        "COMPONENTE 2 — CORROBORACIÓN DE FUENTES Y VALIDACIÓN DE EVIDENCIAS:\n" +
        "Aplica el procedimiento de corroboración: presenta al menos un hecho central de tu proceso histórico " +
        "y demuestra cómo lo corroboras con dos o más fuentes distintas. Responde explícitamente: " +
        "¿en qué coinciden las fuentes respecto a ese hecho? ¿en qué divergen o se contradicen? " +
        "¿cómo resuelves la contradicción o qué tipo de fuente adicional necesitarías para resolverla? " +
        "Si hay un aspecto del proceso sobre el que las evidencias son insuficientes o contradictorias, " +
        "practica la suspensión del juicio: reconoce explícitamente la incertidumbre histórica en lugar " +
        "de imponer una conclusión arbitraria. Explica cómo la corroboración fortaleció o modificó " +
        "tu interpretación inicial del proceso.\n\n" +
        "COMPONENTE 3 — NARRACIÓN HISTÓRICA ARGUMENTADA:\n" +
        "Desarrolla el cuerpo central del ensayo como una narración histórica argumentada que incluya:\n" +
        "(a) TESIS: una afirmación interpretativa específica y debatible que defines al inicio y defiendes " +
        "a lo largo del ensayo. No basta con describir el proceso; debes tomar una posición interpretativa;\n" +
        "(b) MULTICAUSALIDAD: identifica y analiza al menos tres causas del proceso histórico, " +
        "clasificándolas en estructurales (de largo plazo), coyunturales (de corto plazo) y contingentes " +
        "(imprevisibles o dependientes de decisiones individuales);\n" +
        "(c) CONSECUENCIAS: analiza al menos dos consecuencias del proceso en el corto y en el largo plazo. " +
        "Incluye al menos una consecuencia que sigue siendo relevante en la actualidad;\n" +
        "(d) PERSPECTIVAS MÚLTIPLES: incorpora al menos dos perspectivas de actores sociales distintos " +
        "(por ejemplo: élites vs. clases populares; colonizadores vs. colonizados; hombres vs. mujeres; " +
        "perspectiva local vs. perspectiva global). Muestra cómo el mismo proceso fue vivido o interpretado " +
        "de manera diferente desde cada perspectiva;\n" +
        "(e) EVIDENCIAS: sustenta cada argumento con al menos una cita o referencia a las fuentes " +
        "que seleccionaste en el Componente 1.\n\n" +
        "COMPONENTE 4 — COMUNICACIÓN HISTÓRICA CON RIGOR Y CREATIVIDAD:\n" +
        "En la presentación de tu ensayo demuestra tanto rigor como creatividad. Para el RIGOR: " +
        "cita correctamente todas las fuentes utilizadas (indica autor, obra y fragmento o dato citado); " +
        "usa terminología histórica precisa (fuente primaria, corroboración, multicausalidad, historiografía, etc.); " +
        "distingue claramente entre hechos documentados e interpretaciones tuyas; " +
        "y señala las limitaciones de tu investigación (qué fuentes no pudiste consultar, qué aspectos quedan sin resolver). " +
        "Para la CREATIVIDAD: elige un título atractivo que refleje tu tesis; " +
        "usa al menos un recurso expresivo que haga tu ensayo más accesible y memorable " +
        "(una anécdota bien fundamentada, una comparación iluminadora, una cita directa de una fuente primaria " +
        "que abra o cierre el ensayo, una pregunta retórica que involucre al lector). " +
        "Cierra el ensayo con un párrafo de 'historia del presente': " +
        "explica cómo el proceso histórico que investigaste conecta o explica algo del mundo actual.\n\n" +
        "REFLEXIÓN METACOGNITIVA FINAL:\n" +
        "Agrega un párrafo final (fuera del ensayo) en el que reflexiones sobre tu propio proceso de aprendizaje: " +
        "¿Cuál de las cuatro competencias de CH-III te resultó más difícil de aplicar y por qué? " +
        "¿Cómo cambió tu comprensión del proceso histórico elegido al trabajar con fuentes reales y aplicar " +
        "el método histórico crítico? ¿Qué pregunta histórica te quedó pendiente y cómo la investigarías " +
        "si tuvieras más tiempo y recursos?\n\n" +
        "Escribe con claridad y precisión, con párrafos bien estructurados. " +
        "Cita las fuentes que utilizas. Puedes incluir fragmentos breves de fuentes primarias entrecomillados.",
      pistas: [
        "Para seleccionar tus fuentes: recuerda que una fuente primaria NO tiene que ser un documento escrito; puede ser una fotografía, un objeto, una canción de la época, un testimonio oral grabado o transcrito, una pintura, un mapa o un cartel. La clave es que fue producida durante el período o por alguien que participó directamente. Evalúa cada fuente preguntándote: ¿quién la produjo?, ¿para qué?, ¿qué perspectiva favorece?, ¿qué omite?",
        "Para la corroboración: busca puntos concretos donde tus fuentes coincidan Y puntos donde difieran. Las divergencias son especialmente valiosas: te indican que el hecho es interpretado de manera distinta según la perspectiva del autor. Practica la suspensión del juicio en lugar de elegir arbitrariamente: escribe algo como 'No es posible determinar con las fuentes disponibles si...' o 'La evidencia sugiere, aunque no confirma definitivamente, que...'",
        "Para tu tesis: evita afirmaciones obvias o descriptivas ('La Revolución Mexicana fue un movimiento armado'). Una buena tesis es debatible: alguien podría estar en desacuerdo contigo. Ejemplo de tesis fuerte: 'Las consecuencias sociales de la Revolución Mexicana fueron más profundas para las comunidades rurales indígenas que para la clase media urbana que lideró el movimiento'. Define tu tesis en la primera oración del componente 3 y retómala en la conclusión.",
        "Para la multicausalidad: las causas estructurales son las condiciones de larga duración que hacen posible el proceso (por ejemplo, desigualdad económica acumulada durante décadas). Las causas coyunturales son factores del corto plazo que activan el proceso (una crisis económica repentina, una mala cosecha). Las causas contingentes dependen de decisiones individuales o hechos imprevisibles (la decisión de un líder, un accidente, una enfermedad). Necesitas al menos una de cada tipo.",
        "Para la comunicación creativa: una forma efectiva de abrir un ensayo histórico es con una cita directa de una fuente primaria que capture la atmósfera del período o la voz de un actor histórico. También puedes cerrar con una pregunta que conecte el proceso histórico con una situación actual que el lector reconozca. Recuerda: creatividad no significa inventar hechos, sino elegir la manera más efectiva de presentar los hechos reales.",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Selecciona y evalúa al menos tres fuentes históricas (mínimo una primaria y una secundaria), identifica el tipo, propósito y sesgo de cada una, y justifica su relevancia para la investigación.",
        "Aplica el procedimiento de corroboración sobre al menos un hecho central: demuestra coincidencias y divergencias entre fuentes, practica la suspensión del juicio ante evidencias insuficientes y explica cómo la corroboración afectó su interpretación.",
        "Elabora una narración histórica argumentada con tesis específica y debatible, multicausalidad (estructural, coyuntural y contingente), consecuencias en el corto y largo plazo, y perspectivas múltiples de al menos dos actores sociales distintos, sustentadas con evidencias de las fuentes seleccionadas.",
        "Comunica su interpretación histórica con rigor (cita de fuentes, terminología precisa, distinción entre hechos e interpretaciones, reconocimiento de limitaciones) y creatividad (recurso expresivo que enriquece la presentación), conectando el proceso histórico estudiado con la realidad del presente en el párrafo de cierre.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador CH-III creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de CH-III (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 CH-III total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
