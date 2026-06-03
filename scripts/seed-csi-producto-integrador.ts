/**
 * Producto Integrador del semestre para CS-I (Ciencias Sociales I).
 * - Crea 1 capstone (reflexion_escrita, formato ensayo) que integra las 4 progresiones:
 *   Estado, ciudadanía, normas sociales y diversidad/democracia.
 *   Se aloja en P04 (progresión culminante: diversidad y democracia).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar CS-I.
 * Uso: npx tsx scripts/seed-csi-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CS-I (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "CS-I");
  const p4 = progs.find((p) => p.numero === 4);
  if (!p4) throw new Error("No se encontró la progresión 4 de CS-I");

  const ok = await upsertActividad(sb, {
    codigo: "CS-I-PRODUCTO-INTEGRADOR",
    progresion_id: p4.id,
    titulo: "Producto Integrador: un problema de mi comunidad",
    descripcion: "Capstone del semestre: analiza un problema social real de tu comunidad integrando Estado, ciudadanía, normas y diversidad.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "Producto Integrador del semestre. A lo largo de Ciencias Sociales I estudiaste el Estado y sus instituciones, la ciudadanía formal y sustantiva, las normas sociales como construcciones históricas, y la diversidad como valor democrático. Ahora vas a integrarlo todo analizando un problema real de tu comunidad.\n\nElige un problema social concreto de tu colonia, comunidad o escuela (por ejemplo: falta de agua, inseguridad, discriminación, basura, falta de espacios públicos, exclusión de algún grupo). Escribe un texto de entre 250 y 600 palabras que cumpla con lo siguiente:\n\n1) DESCRIBE el problema: a quién afecta y desde cuándo.\n2) ANALIZA con los conceptos del semestre: ¿qué papel tiene (o no) el Estado y sus instituciones? ¿Qué normas formales o informales intervienen? ¿Cómo se relaciona con la ciudadanía (formal vs. real) y con la diversidad?\n3) PROPÓN al menos dos acciones: una que puedas hacer tú como ciudadano/a (aunque aún no votes) y otra que correspondería al Estado o a una institución.\n4) Cierra distinguiendo claramente los datos o hechos de tus opiniones.",
      pistas: [
        "Elige un problema que conozcas de primera mano: tendrás más ejemplos concretos.",
        "Usa al menos cuatro conceptos del semestre y subráyalos para verificarlo.",
        "En las propuestas, distingue lo que te toca a ti de lo que le toca al Estado.",
        "Separa con claridad lo que es un hecho verificable de lo que es tu opinión.",
      ],
      longitud_minima_palabras: 250,
      longitud_maxima_palabras: 600,
      criterios_evaluacion: [
        "Describe un problema social concreto y a quién afecta.",
        "Analiza el problema usando al menos cuatro conceptos del semestre (Estado, instituciones, ciudadanía, normas, diversidad).",
        "Propone una acción ciudadana propia y una que corresponde al Estado/instituciones.",
        "Distingue hechos verificables de opiniones.",
        "Redacción clara, coherente y argumentada con respeto.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador CS-I creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 CS-I total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
