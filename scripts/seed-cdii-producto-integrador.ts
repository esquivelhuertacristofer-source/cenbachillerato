/**
 * Producto Integrador CD-II (capstone): reflexion_escrita, 50 XP, estado='borrador'.
 * Se aloja en la progresión de mayor numero. Uso: npx tsx scripts/seed-cdii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CD-II\n");
  const progs = await getProgresionesDeUAC(sb, "CD-II");
  if (!progs.length) throw new Error("CD-II sin progresiones");
  const culminante = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);
  log(`  Alojado en progresión culminante: ${culminante.codigo} (numero ${culminante.numero})`);

  const res = await upsertActividad(sb, {
    codigo: "CD-II-PRODUCTO-INTEGRADOR",
    titulo: "Producto Integrador: Proyecto digital colaborativo de divulgación",
    descripcion: "Ensayo final que integra los aprendizajes de Cultura Digital II para usar las TICCAD en un proyecto colaborativo de investigación y difusión, con perspectiva ética y crítica.",
    tipo: "reflexion_escrita",
    progresion_id: culminante.id,
    xp: 50,
    estado: "borrador",
    contenido: {
      instrucciones: "Redacta un ensayo en el que describas un proyecto digital colaborativo de divulgación (real o propuesto) que integre los aprendizajes de toda la unidad. Organízalo con introducción, desarrollo y conclusión, y apóyate en tu propia experiencia usando las TICCAD para aprender de forma autónoma y colaborativa.",
      prompt: "Escribe un ensayo que integre los ejes de Cultura Digital II: (1) herramientas digitales de trabajo colaborativo libre (Cryptpad, Riseup pad) para acceder al conocimiento de diferentes asignaturas de forma transversal; (2) uso de las TICCAD de libre acceso para interactuar, comunicar y buscar, discriminar y gestionar información sobre una problemática personal, social o ambiental; (3) técnicas y métodos de investigación digital (ciberetnografía, análisis de contenido en línea, grupo focal, entrevista, observación) y licencias permisivas como LibreOffice; (4) procesamiento de datos con software estadístico libre (Jamovi, JASP, XLSTAT Free): medidas de tendencia central, de dispersión y representaciones gráficas; y (5) creación de páginas web de diseño simple (WordPress, Blogspot) para difundir información. Explica qué problemática elegirías, cómo investigarías y analizarías la información en equipo, cómo la difundirías en una página web y por qué es importante hacerlo con una perspectiva ética y crítica, potenciando tu aprendizaje autónomo y colaborativo.",
      formato_esperado: "ensayo",
      longitud_minima_palabras: 300,
    },
  });
  log(res ? "\n✅ Producto Integrador CD-II creado (borrador).\n" : "\n❌ Falló la creación.\n");
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });
