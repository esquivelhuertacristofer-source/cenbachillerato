/**
 * Publica en la BD las imágenes generadas (ComfyUI, local) para las actividades
 * de Semestre 6 servidas desde public/media/sem6/. Recorre cada subcarpeta
 * (excepto labs/, que se sirve directo vía lab-imagenes.ts y no tiene fila en
 * `actividades`), deriva el codigo de actividad del nombre de archivo y
 * actualiza contenido.url_imagen (o url_miniatura para video_con_preguntas).
 * Idempotente: solo escribe si el valor cambia. Mismo patrón que
 * publish-media-sem1.ts (Sem6 sí tiene ejercicio_matematico y
 * video_con_preguntas sueltos, a diferencia de Sem4/Sem5).
 *
 * Uso: npx tsx scripts/publish-media-sem6.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { readdirSync } from "fs";
import { createSB, log } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

const MEDIA_ROOT = resolve(process.cwd(), "public/media/sem6");

/** carpeta en disco → campo de `contenido` a actualizar. */
const CARPETA_CAMPO: Record<string, string> = {
  lecturas: "url_imagen",
  quiz_multiple_opcion: "url_imagen",
  quiz_verdadero_falso: "url_imagen",
  fill_blanks: "url_imagen",
  ejercicio_matematico: "url_imagen",
  reflexion_escrita: "url_imagen",
  debate_estructurado: "url_imagen",
  glosario_interactivo: "url_imagen",
  autoevaluacion: "url_imagen",
  video_con_preguntas: "url_miniatura",
  // labs/ se excluye a propósito: no tiene fila en `actividades` (ver lab-imagenes.ts)
};

async function main() {
  const sb = createSB();
  let ok = 0, sinCambio = 0, noEncontrada = 0, fallo = 0;

  for (const [carpeta, campo] of Object.entries(CARPETA_CAMPO)) {
    const dir = resolve(MEDIA_ROOT, carpeta);
    const archivos = readdirSync(dir).filter((f) => f.endsWith(".webp"));
    log(`\n📁 ${carpeta} (${archivos.length} archivos) → contenido.${campo}`);

    for (const archivo of archivos) {
      const codigo = archivo.replace(/\.webp$/, "");
      const rutaPublica = `/media/sem6/${carpeta}/${archivo}`;

      const { data: act, error: e1 } = await sb
        .from("actividades")
        .select("contenido")
        .eq("codigo", codigo)
        .single();
      if (e1 || !act) { log(`  ✗ ${codigo}: no encontrada en BD`); noEncontrada++; continue; }

      const contenidoActual = act.contenido as Record<string, unknown>;
      if (contenidoActual?.[campo] === rutaPublica) {
        log(`  = ${codigo}: ya publicada`);
        sinCambio++;
        continue;
      }

      const contenido = { ...contenidoActual, [campo]: rutaPublica };
      const { error: e2 } = await sb.from("actividades").update({ contenido }).eq("codigo", codigo);
      if (e2) { log(`  ✗ ${codigo}: update falló — ${e2.message}`); fallo++; continue; }

      log(`  ✓ ${codigo} → ${rutaPublica}`);
      ok++;
    }
  }

  log(`\n✅ Publicación Sem6: ${ok} nuevas, ${sinCambio} ya al día, ${noEncontrada} sin actividad, ${fallo} fallidas.\n`);
  if (fallo > 0) process.exit(1);
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
