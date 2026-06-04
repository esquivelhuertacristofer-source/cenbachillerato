/**
 * Producto Integrador LC-II (capstone): reflexion_escrita, 50 XP, estado='borrador'.
 * Se aloja en la progresión de mayor numero. Uso: npx tsx scripts/seed-lcii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador LC-II\n");
  const progs = await getProgresionesDeUAC(sb, "LC-II");
  if (!progs.length) throw new Error("LC-II sin progresiones");
  const culminante = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);
  log(`  Alojado en progresión culminante: ${culminante.codigo} (numero ${culminante.numero})`);

  const res = await upsertActividad(sb, {
    codigo: "LC-II-PRODUCTO-INTEGRADOR",
    titulo: "Producto Integrador: Mi relato libre — de la imaginación al pódcast",
    descripcion: "Ensayo final que integra los aprendizajes de Lengua y Comunicación II: narrar, describir y crear un texto libre propio reconociendo tus capacidades creativas y comunicativas.",
    tipo: "reflexion_escrita",
    progresion_id: culminante.id,
    xp: 50,
    estado: "borrador",
    contenido: {
      instrucciones: "Redacta un ensayo en el que integres lo aprendido en toda la unidad y reflexiones sobre tu propio proceso creativo y comunicativo. Organízalo con introducción, desarrollo y conclusión, y apóyate en ejemplos de los textos y narrativas que trabajaste durante el semestre.",
      prompt: "Escribe un ensayo titulado 'Libertad para imaginar, poder para comunicar' en el que integres estos ejes vistos en el semestre: (1) narrar y describir situaciones de tu historia de vida distinguiendo ideas prioritarias y secundarias, y ficción y realidad; (2) la escritura de un texto propio definiendo su sentido comunicativo; (3) las narrativas populares, la oralidad y sus adaptaciones modernas (cómics, creepypastas, leyendas, mitos, teatro); (4) la relevancia de los personajes y escenarios y su caracterización; (5) la distinción entre tema, idea principal e ideas secundarias; (6) la reescritura con conectores textuales, trama, conflicto, tipos de narración y tonos narrativos; (7) el análisis y la construcción colaborativa de textos mediante el diálogo entre pares; y (8) la integración de lectura, escritura y oralidad en un proyecto creativo (guion, grabación, edición y elementos extralingüísticos). Explica cómo reconoces hoy tus capacidades creativas y comunicativas, qué texto libre crearías para expresarte y por qué imaginar y comunicar te dan poder para participar en tu comunidad.",
      formato_esperado: "ensayo",
      longitud_minima_palabras: 300,
    },
  });
  log(res ? "\n✅ Producto Integrador LC-II creado (borrador).\n" : "\n❌ Falló la creación.\n");
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });
