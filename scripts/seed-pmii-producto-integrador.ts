/**
 * Producto Integrador PM-II (capstone): reflexion_escrita, 50 XP, estado='borrador'.
 * Se aloja en la progresión OFICIAL de mayor numero (numero < 100) → PM-II-P09 (numero 6).
 * Uso: npx tsx scripts/seed-pmii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador PM-II\n");
  const progs = await getProgresionesDeUAC(sb, "PM-II");
  if (!progs.length) throw new Error("PM-II sin progresiones");
  const oficiales = progs.filter((p) => p.numero < 100);
  const culminante = oficiales.reduce((a, b) => (b.numero > a.numero ? b : a), oficiales[0]);
  log(`  Alojado en progresión culminante oficial: ${culminante.codigo} (numero ${culminante.numero})`);

  const res = await upsertActividad(sb, {
    codigo: "PM-II-PRODUCTO-INTEGRADOR",
    titulo: "Producto Integrador: El álgebra en mi vida cotidiana",
    descripcion: "Ensayo final que integra el lenguaje algebraico, la clasificación de expresiones, las operaciones, la factorización y la igualdad para modelar y resolver una situación cotidiana.",
    tipo: "reflexion_escrita",
    progresion_id: culminante.id,
    xp: 50,
    estado: "borrador",
    contenido: {
      instrucciones: "Redacta un ensayo donde modeles y resuelvas una situación cotidiana usando el álgebra que aprendiste en el semestre. Organízalo con introducción, desarrollo (planteamiento y solución) y conclusión. Muestra los cálculos y explica cada paso con tus palabras.",
      prompt: "Elige una situación real de tu vida (por ejemplo, organizar un presupuesto personal, ajustar las proporciones de una receta para más personas, o calcular precios con descuentos y porcentajes). Resuélvela integrando lo aprendido: (1) traduce la situación al lenguaje algebraico definiendo la incógnita; (2) clasifica y escribe las expresiones que aparecen (monomios, binomios, etc.); (3) realiza las operaciones necesarias (suma, resta, multiplicación o división de términos) y, si aplica, factoriza por factor común; (4) plantea una igualdad o ecuación y resuélvela usando las propiedades de la igualdad para encontrar el valor buscado; y (5) comprueba tu resultado y explica si tiene sentido en la situación. Cierra reflexionando sobre cómo el álgebra te ayuda a tomar decisiones en la vida diaria.",
      formato_esperado: "ensayo",
      longitud_minima_palabras: 300,
    },
  });
  log(res ? "\n✅ Producto Integrador PM-II creado (borrador).\n" : "\n❌ Falló la creación.\n");
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });
