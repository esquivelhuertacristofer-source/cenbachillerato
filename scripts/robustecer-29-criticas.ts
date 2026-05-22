/**
 * robustecer-29-criticas.ts
 * Robustece reflexiones_escritas que carecen de criterios_evaluacion, pistas
 * o longitud_minima_palabras definida — los puntos más críticos detectados en auditoría.
 *
 * Idempotente: omite actividades que ya tienen los tres campos completos.
 * Uso: npx tsx scripts/robustecer-29-criticas.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

type SB = ReturnType<typeof createClient<Database>>;

interface ContenidoReflexion {
  prompt: string;
  pistas?: string[];
  longitud_minima_palabras?: number;
  longitud_maxima_palabras?: number;
  criterios_evaluacion?: string[];
  ejemplo_respuesta?: string;
  formato_esperado?: string;
}

// Criterios pedagógicos estándar para reflexión escrita
const CRITERIOS_BASE = [
  "Claridad y coherencia de las ideas expresadas",
  "Uso de evidencia o ejemplos concretos para fundamentar la postura",
  "Conexión explícita con los contenidos trabajados en la progresión",
  "Reflexión personal genuina que va más allá de la descripción",
];

// Pistas andamiaje para guiar sin responder por el estudiante
const PISTAS_BASE = [
  "Inicia recordando un concepto clave de esta progresión y cómo lo entiendes ahora.",
  "Piensa en un ejemplo de tu vida cotidiana o de tu comunidad que ilustre el tema.",
  "Considera al menos dos perspectivas distintas antes de formular tu conclusión.",
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("\n🔬 CEN Bachillerato — Sesión 2: Robustecimiento reflexiones críticas\n");

  const { data: actividades, error } = await sb
    .from("actividades")
    .select("id, codigo, contenido, nivel_revision")
    .eq("tipo", "reflexion_escrita")
    .order("codigo");

  if (error || !actividades) {
    console.error("Error consultando reflexiones:", error?.message);
    process.exit(1);
  }

  console.log(`Reflexiones encontradas: ${actividades.length}`);
  console.log("Analizando calidad...\n");

  let actualizadas = 0;
  let omitidas = 0;
  let errores = 0;

  for (const act of actividades) {
    const cont = act.contenido as unknown as ContenidoReflexion;

    const tieneCriterios = Array.isArray(cont.criterios_evaluacion) && cont.criterios_evaluacion.length >= 2;
    const tienePistas = Array.isArray(cont.pistas) && cont.pistas.length >= 2;
    const tieneLongitud = typeof cont.longitud_minima_palabras === "number";

    if (tieneCriterios && tienePistas && tieneLongitud) {
      omitidas++;
      continue;
    }

    const newContenido: ContenidoReflexion = {
      ...cont,
      criterios_evaluacion: tieneCriterios ? cont.criterios_evaluacion : CRITERIOS_BASE,
      pistas: tienePistas ? cont.pistas : PISTAS_BASE,
      longitud_minima_palabras: tieneLongitud ? cont.longitud_minima_palabras : 80,
    };

    const { error: upErr } = await sb
      .from("actividades")
      .update({
        contenido: newContenido as never,
        nivel_revision: "robustecida",
      })
      .eq("id", act.id);

    if (upErr) {
      console.error(`  ❌ ${act.codigo}: ${upErr.message}`);
      errores++;
    } else {
      const fixes = [
        !tieneCriterios && "+criterios",
        !tienePistas && "+pistas",
        !tieneLongitud && "+longitud",
      ].filter(Boolean).join(", ");
      console.log(`  ✓ ${act.codigo}: ${fixes}`);
      actualizadas++;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ LISTO — ${actualizadas} robustecidas, ${omitidas} omitidas, ${errores} errores`);
  console.log(`${"=".repeat(60)}\n`);
}

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
