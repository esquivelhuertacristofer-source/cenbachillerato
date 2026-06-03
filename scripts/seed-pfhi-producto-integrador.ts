/**
 * Producto Integrador PFH-I (capstone): reflexion_escrita, 50 XP, estado='borrador'.
 * Se aloja en la progresión de mayor numero. Uso: npx tsx scripts/seed-pfhi-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador PFH-I\n");
  const progs = await getProgresionesDeUAC(sb, "PFH-I");
  if (!progs.length) throw new Error("PFH-I sin progresiones");
  const culminante = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);
  log(`  Alojado en progresión culminante: ${culminante.codigo} (numero ${culminante.numero})`);

  const res = await upsertActividad(sb, {
    codigo: "PFH-I-PRODUCTO-INTEGRADOR",
    titulo: "Producto Integrador: Mi diario filosófico",
    descripcion: "Ensayo final que integra el ejercicio de filosofar, la formulación de preguntas, los problemas filosóficos, la teoría del conocimiento y el diálogo, desde una perspectiva humanista.",
    tipo: "reflexion_escrita",
    progresion_id: culminante.id,
    xp: 50,
    estado: "borrador",
    contenido: {
      instrucciones: "Redacta un ensayo a manera de 'diario filosófico' donde integres los aprendizajes de todo el semestre. Organízalo con introducción, desarrollo y conclusión, partiendo de una experiencia o problema de tu propia vida.",
      prompt: "Escribe tu diario filosófico integrando lo aprendido en el semestre: (1) el ejercicio de filosofar como modo de problematizar la realidad; (2) la formulación de preguntas filosóficas significativas; (3) un problema filosófico que te interese (libertad, tiempo, muerte, felicidad o el sentido de la vida); (4) cómo distingues el conocimiento verdadero del falso en tiempos de posverdad; y (5) el valor del diálogo filosófico y de las distintas tradiciones de pensamiento. Plantea una pregunta filosófica propia, explora al menos dos respuestas posibles y explica cómo este semestre cambió tu forma de pensar y dialogar con los demás.",
      formato_esperado: "ensayo",
      longitud_minima_palabras: 300,
    },
  });
  log(res ? "\n✅ Producto Integrador PFH-I creado (borrador).\n" : "\n❌ Falló la creación.\n");
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });
