/**
 * Producto Integrador del semestre para LC-I + publicación de LC-I al 100%.
 * - Crea 1 capstone (reflexion_escrita, formato ensayo) que integra las 8 progresiones.
 *   Se aloja en P08 (progresión culminante: exposición oral).
 * - Publica todas las actividades de LC-I (borrador -> publicada).
 * Uso: npx tsx scripts/seed-lci-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador + publicación LC-I\n");

  const progs = await getProgresionesDeUAC(sb, "LC-I");
  const p8 = progs.find((p) => p.numero === 8);
  if (!p8) throw new Error("No se encontró la progresión 8 de LC-I");

  const ok = await upsertActividad(sb, {
    codigo: "LC-I-PRODUCTO-INTEGRADOR",
    progresion_id: p8.id,
    titulo: "Producto Integrador: mi texto para la comunidad",
    descripcion: "Capstone del semestre: integra lectura, escritura, párrafos, conectores y exposición oral en un solo producto.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "publicada",
    contenido: {
      prompt:
        "Producto Integrador del semestre. A lo largo de Lengua y Comunicación I exploraste los vínculos entre leer y escribir, los gustos lectores de tu comunidad, cómo distinguir información de opiniones, los tipos de párrafo, la información significativa, la concordancia y los conectores, la lectura en voz alta y la exposición oral. Ahora vas a integrarlo todo en un solo producto.\n\nElige un tema que le importe a tu comunidad (por ejemplo: el cuidado del agua, la convivencia en tu colonia, un problema de tu escuela, una tradición local). Escribe un texto de entre 150 y 500 palabras que cumpla con lo siguiente:\n\n1) Tenga una introducción que presente el tema, un desarrollo con al menos dos párrafos (uno puede ser argumentativo) y una conclusión.\n2) Use por lo menos un conector causal, uno de adición y uno comparativo, y cuide la concordancia.\n3) Distinga claramente la información (datos verificables) de tus ideas y opiniones.\n\nAl final del texto, agrega un breve apartado titulado 'Para mi exposición oral' donde anotes: qué apoyo visual usarías (diapositiva, mapa mental, cartel) y dos cuidados de tu voz al leerlo en voz alta (por ejemplo, dicción y pausas).",
      pistas: [
        "Empieza eligiendo un tema que conozcas bien: te será más fácil distinguir datos de opiniones.",
        "Revisa tu texto buscando errores de concordancia antes de entregar.",
        "Marca con un color los conectores que usaste para verificar que estén los tres tipos.",
        "Para el apartado de exposición, piensa qué imagen resumiría tu tema en una sola diapositiva.",
      ],
      longitud_minima_palabras: 150,
      longitud_maxima_palabras: 500,
      criterios_evaluacion: [
        "El texto tiene estructura clara: introducción, desarrollo y conclusión.",
        "Usa al menos un conector causal, uno de adición y uno comparativo, con concordancia correcta.",
        "Distingue información verificable de ideas y opiniones.",
        "Incluye el apartado 'Para mi exposición oral' con apoyo visual y cuidados de la voz.",
        "Redacción coherente, clara y bien puntuada.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador creado (publicada)\n" : "  ✗ Falló el Producto Integrador\n");

  // Publicar todo LC-I: borrador -> publicada
  const ids = progs.map((p) => p.id);
  const { data: updated, error } = await sb
    .from("actividades")
    .update({ estado: "publicada" })
    .in("progresion_id", ids)
    .eq("estado", "borrador")
    .select("codigo");
  if (error) throw error;
  log(`  ✓ Publicadas ${updated?.length ?? 0} actividades que estaban en borrador.\n`);

  // Estado final
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 LC-I total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
