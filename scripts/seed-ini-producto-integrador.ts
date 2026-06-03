/**
 * Producto Integrador del semestre para IN-I (Inglés I — A1).
 * - Crea 1 capstone (reflexion_escrita) que integra las 8 progresiones (presentación
 *   personal: saludos, info personal, gustos, descripciones, posesión).
 *   Se aloja en P08 (progresión culminante: posesión y pertenencia).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar IN-I.
 * Uso: npx tsx scripts/seed-ini-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador IN-I (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "IN-I");
  const p8 = progs.find((p) => p.numero === 8);
  if (!p8) throw new Error("No se encontró la progresión 8 de IN-I");

  const ok = await upsertActividad(sb, {
    codigo: "IN-I-PRODUCTO-INTEGRADOR",
    progresion_id: p8.id,
    titulo: "Producto Integrador: All About Me",
    descripcion: "Capstone del semestre: integra saludos, información personal, gustos, descripciones y posesión en una sola presentación personal en inglés.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "Producto Integrador del semestre. A lo largo de Inglés I aprendiste a saludar y presentarte, a interactuar en clase, a describir objetos y espacios, a dar tu información personal, a hacer preguntas sencillas, a describir personas y el clima, a hablar de tus gustos y a expresar posesión. Ahora vas a integrarlo todo en una sola presentación personal escrita en inglés.\n\nWrite a text titled 'All About Me' (between 80 and 200 words) in English that includes:\n\n1) A greeting and a self-introduction (name, age, where you are from).\n2) A short physical description of yourself and what you usually wear.\n3) Two or three things you like and DON'T like, each one with a reason using 'because'.\n4) A description of one important object that belongs to you, using the Saxon genitive or a possessive (for example: 'This is my phone' / 'It's mine').\n\nWrite in English. It's okay to make mistakes — the goal is to communicate everything you learned this semester. Al final, agrega en español una línea: '¿Qué parte me costó más escribir en inglés?'",
      pistas: [
        "Empieza con un saludo: 'Hello! My name is...'.",
        "Para los gustos usa 'I like / I don't like ... because ...'.",
        "Para la posesión recuerda: 'my', 'mine' o el genitivo (Ana's).",
        "Revisa que el verbo 'to be' (am/is/are) esté bien usado en cada oración.",
      ],
      longitud_minima_palabras: 80,
      longitud_maxima_palabras: 200,
      criterios_evaluacion: [
        "Incluye saludo y presentación personal (nombre, edad, origen).",
        "Incluye una descripción física y de vestimenta.",
        "Expresa gustos y disgustos con razones usando 'because'.",
        "Expresa posesión con genitivo sajón o pronombres/adjetivos posesivos.",
        "El verbo 'to be' y el vocabulario del semestre se usan de forma comprensible.",
      ],
      formato_esperado: "descripcion",
    },
  });
  log(ok ? "  ✓ Producto Integrador IN-I creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de IN-I (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 IN-I total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
