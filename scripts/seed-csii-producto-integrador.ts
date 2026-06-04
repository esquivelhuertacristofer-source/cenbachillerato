/**
 * Producto Integrador CS-II (capstone): reflexion_escrita, 50 XP, estado='borrador'.
 * UAC: CS-II — Ciencias Sociales II "Organización, relaciones sociales y económicas".
 * Se aloja en la progresión de mayor numero. Uso: npx tsx scripts/seed-csii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CS-II\n");
  const progs = await getProgresionesDeUAC(sb, "CS-II");
  if (!progs.length) throw new Error("CS-II sin progresiones");
  const culminante = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);
  log(`  Alojado en progresión culminante: ${culminante.codigo} (numero ${culminante.numero})`);

  const res = await upsertActividad(sb, {
    codigo: "CS-II-PRODUCTO-INTEGRADOR",
    titulo: "Producto Integrador: Diagnóstico de las desigualdades en mi comunidad",
    descripcion: "Ensayo final que integra los aprendizajes de Ciencias Sociales II para analizar el origen de las desigualdades económicas y sociales desde el entorno familiar y comunitario.",
    tipo: "reflexion_escrita",
    progresion_id: culminante.id,
    xp: 50,
    estado: "borrador",
    contenido: {
      instrucciones: "Redacta un ensayo en el que analices las desigualdades económicas y sociales de tu entorno familiar y comunitario integrando los aprendizajes de toda la unidad. Organízalo con introducción, desarrollo y conclusión, y apóyate en ejemplos concretos de tu comunidad.",
      prompt: "Escribe un ensayo que integre estos ejes vistos en el semestre: (1) necesidades vitales, satisfactores y bienestar social desde el enfoque de derechos; (2) formas de organización social (comunitaria, familiar y personal), diversidad cultural y manifestaciones de la discriminación (subordinación, exclusión, dominación, racismo); (3) los factores de producción (tierra, trabajo, capital, organización, tiempo), la distribución desigual, los intercambios desiguales y las diferencias urbano-rural, así como la economía formal e informal y el trabajo remunerado y no remunerado; y (4) las relaciones de poder, la hegemonía, la interseccionalidad (clase, género, raza, origen étnico, orientación sexual, edad) y la relación entre sociedad y naturaleza. Explica cómo se originan las desigualdades económicas y sociales en tu comunidad, cómo participan las personas en los procesos de organización, producción y distribución, y qué acciones propondrías para reducir esas desigualdades.",
      formato_esperado: "ensayo",
      longitud_minima_palabras: 300,
    },
  });
  log(res ? "\n✅ Producto Integrador CS-II creado (borrador).\n" : "\n❌ Falló la creación.\n");
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });
