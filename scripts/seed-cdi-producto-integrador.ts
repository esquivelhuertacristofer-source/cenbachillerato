/**
 * Producto Integrador CD-I (capstone): reflexion_escrita, 50 XP, estado='borrador'.
 * Se aloja en la progresión de mayor numero. Uso: npx tsx scripts/seed-cdi-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CD-I\n");
  const progs = await getProgresionesDeUAC(sb, "CD-I");
  if (!progs.length) throw new Error("CD-I sin progresiones");
  const culminante = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);
  log(`  Alojado en progresión culminante: ${culminante.codigo} (numero ${culminante.numero})`);

  const res = await upsertActividad(sb, {
    codigo: "CD-I-PRODUCTO-INTEGRADOR",
    titulo: "Producto Integrador: Mi manifiesto de ciudadanía digital",
    descripcion: "Ensayo final que integra todo lo aprendido en Cultura Digital I para ejercer una ciudadanía digital crítica, responsable y ética.",
    tipo: "reflexion_escrita",
    progresion_id: culminante.id,
    xp: 50,
    estado: "borrador",
    contenido: {
      instrucciones: "Redacta un ensayo a modo de 'manifiesto de ciudadanía digital' en el que integres los aprendizajes de toda la unidad. Organízalo con introducción, desarrollo y conclusión, y apóyate en ejemplos de tu propia experiencia con la tecnología.",
      prompt: "Escribe tu manifiesto de ciudadanía digital integrando estos ejes vistos en el semestre: (1) hardware, software e historia de la tecnología; (2) licenciamiento y acceso a servicios digitales; (3) impacto social de las tecnologías (colonialismo de datos, mercantilización de la atención, brecha digital); (4) software libre y sus cuatro libertades; (5) normatividad, privacidad y seguridad digital; (6) uso responsable de la inteligencia artificial, copyleft y contaminación digital; (7) resolución de problemas, identidad y credenciales digitales; y (8) lenguaje algorítmico. Explica qué tipo de ciudadano o ciudadana digital quieres ser, qué prácticas vas a cuidar (seguridad, ética, sostenibilidad, respeto) y por qué el acceso crítico al ciberespacio importa para ti y tu comunidad.",
      formato_esperado: "ensayo",
      longitud_minima_palabras: 300,
    },
  });
  log(res ? "\n✅ Producto Integrador CD-I creado (borrador).\n" : "\n❌ Falló la creación.\n");
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });
