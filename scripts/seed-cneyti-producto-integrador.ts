/**
 * Producto Integrador del semestre para CNEYT-I (Ciencias Naturales, Experimentales y Tecnología I).
 * - Crea 1 capstone (reflexion_escrita, formato ensayo) que integra el semestre: método científico y medición,
 *   materia y sus propiedades (densidad), átomo y modelos, clasificación de la materia, enlaces, estados/energía,
 *   y la relación de la materia con la tecnología y el medio ambiente.
 * - Se aloja en la progresión culminante (numero 11: materia, transformaciones y medio ambiente).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar CNEYT-I.
 * Uso: npx tsx scripts/seed-cneyti-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CNEYT-I (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "CNEYT-I");
  const culminante = progs.find((p) => p.numero === 11) ?? progs[progs.length - 1];
  if (!culminante) throw new Error("No se encontró la progresión culminante de CNEYT-I");

  const ok = await upsertActividad(sb, {
    codigo: "CNEYT-I-PRODUCTO-INTEGRADOR",
    progresion_id: culminante.id,
    titulo: "Producto Integrador: la química de un problema de mi entorno",
    descripcion: "Capstone del semestre: explica un fenómeno o problema real de tu entorno usando lo aprendido sobre la materia, sus propiedades, sus transformaciones y la energía.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "Producto Integrador del semestre. A lo largo de Ciencias Naturales, Experimentales y Tecnología I aprendiste a observar la naturaleza como un científico: el método científico y la medición, qué es la materia y cómo se mide (masa, volumen, densidad), de qué está hecha (átomos, modelos atómicos, elementos, compuestos, mezclas y disoluciones), cómo se unen los átomos (iones y enlaces), sus estados y la energía, y cómo todo esto se relaciona con la tecnología y el medio ambiente.\n\nAhora vas a integrarlo eligiendo UN fenómeno o problema real de tu entorno que tenga que ver con la materia y sus transformaciones. Algunos ejemplos: la oxidación de objetos de metal, la potabilización o contaminación del agua, la combustión y la calidad del aire, la basura y los microplásticos, la elaboración de un alimento o una bebida, o el uso de pilas y baterías.\n\nEscribe un texto de entre 250 y 600 palabras que:\n\n1) DESCRIBE el fenómeno o problema y dónde lo observas.\n2) EXPLICA con conceptos del semestre: ¿qué tipo de materia interviene (sustancia, mezcla, disolución)? ¿hay un cambio físico o químico? ¿interviene la energía? Usa al menos cuatro conceptos vistos (por ejemplo: densidad, átomo, enlace, estados de la materia, conservación de la materia, energía, mezcla/disolución).\n3) MIDE o estima algo: incluye al menos un dato cuantitativo (una medición, una densidad, una concentración o una cantidad) y di cómo lo obtendrías.\n4) RELACIONA el fenómeno con la tecnología y/o el medio ambiente, y propón una acción responsable.\n5) Cierra distinguiendo claramente los hechos verificables de tus opiniones.",
      pistas: [
        "Elige un fenómeno que puedas observar de verdad: tendrás más detalles concretos.",
        "Usa al menos cuatro conceptos del semestre y subráyalos para verificarlo.",
        "Recuerda la ley de conservación de la materia: en una transformación, la materia no desaparece.",
        "Incluye al menos un dato numérico (una medida, densidad o concentración) y explica cómo lo obtendrías.",
        "Separa con claridad lo que es un hecho verificable de lo que es tu opinión.",
      ],
      longitud_minima_palabras: 250,
      longitud_maxima_palabras: 600,
      criterios_evaluacion: [
        "Describe un fenómeno o problema concreto de su entorno relacionado con la materia.",
        "Explica el fenómeno usando al menos cuatro conceptos del semestre (materia, densidad, átomo, enlace, estados, energía, mezcla/disolución, conservación de la materia).",
        "Distingue si hay un cambio físico o químico e identifica el papel de la energía.",
        "Incluye al menos un dato cuantitativo y explica cómo lo obtendría.",
        "Relaciona el fenómeno con la tecnología y/o el medio ambiente y propone una acción responsable.",
        "Distingue hechos verificables de opiniones; redacción clara y argumentada.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? `  ✓ Producto Integrador CNEYT-I creado (borrador) en progresión numero ${culminante.numero}\n` : "  ✗ Falló el Producto Integrador\n");

  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 CNEYT-I total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
