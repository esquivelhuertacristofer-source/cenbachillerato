/**
 * fix-debates-argumentos-guia.ts
 * Sesión 3 — Enriquecimiento de debates estructurados.
 *
 * Agrega a cada debate_estructurado que lo necesite:
 *   - reglas de debate claras
 *   - criterios_evaluacion pedagógicos
 *   - modalidad explícita
 *
 * Idempotente: omite debates que ya tienen reglas y criterios completos.
 * Uso: npx tsx scripts/fix-debates-argumentos-guia.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

type SB = ReturnType<typeof createClient<Database>>;

interface ContenidoDebate {
  tema: string;
  posturas: string[];
  argumentos_guia?: Record<string, string[]>;
  reglas?: string[];
  tiempo_argumentacion_minutos?: number;
  criterios_evaluacion?: string[];
  modalidad?: "oral" | "escrito" | "hibrido";
}

const REGLAS_BASE = [
  "Escucha activamente la postura contraria antes de responder.",
  "Fundamenta cada argumento con evidencia o ejemplos concretos.",
  "Usa un lenguaje respetuoso, aunque el desacuerdo sea profundo.",
  "No interrumpas a quien tiene la palabra.",
  "Cita fuentes cuando afirmes datos o hechos verificables.",
];

const CRITERIOS_DEBATE_BASE = [
  "Solidez y pertinencia de los argumentos presentados",
  "Uso de evidencia concreta para respaldar cada postura",
  "Capacidad de respuesta a los contraargumentos",
  "Claridad y organización en la exposición de ideas",
  "Actitud de escucha y respeto durante el intercambio",
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

  console.log("\n💬 CEN Bachillerato — Sesión 3: Enriquecimiento de debates estructurados\n");

  const { data: actividades, error } = await sb
    .from("actividades")
    .select("id, codigo, contenido, nivel_revision")
    .eq("tipo", "debate_estructurado")
    .order("codigo");

  if (error || !actividades) {
    console.error("Error consultando debates:", error?.message);
    process.exit(1);
  }

  console.log(`Debates encontrados: ${actividades.length}`);
  console.log("Analizando calidad...\n");

  let actualizadas = 0;
  let omitidas = 0;
  let errores = 0;

  for (const act of actividades) {
    const cont = act.contenido as unknown as ContenidoDebate;

    const tieneReglas = Array.isArray(cont.reglas) && cont.reglas.length >= 3;
    const tieneCriterios = Array.isArray(cont.criterios_evaluacion) && cont.criterios_evaluacion.length >= 3;
    const tieneModalidad = Boolean(cont.modalidad);
    const tieneTiempo = typeof cont.tiempo_argumentacion_minutos === "number";

    if (tieneReglas && tieneCriterios && tieneModalidad && tieneTiempo) {
      omitidas++;
      continue;
    }

    const newContenido: ContenidoDebate = {
      ...cont,
      reglas: tieneReglas ? cont.reglas : REGLAS_BASE,
      criterios_evaluacion: tieneCriterios ? cont.criterios_evaluacion : CRITERIOS_DEBATE_BASE,
      modalidad: cont.modalidad ?? "escrito",
      tiempo_argumentacion_minutos: cont.tiempo_argumentacion_minutos ?? 5,
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
        !tieneReglas && "+reglas",
        !tieneCriterios && "+criterios",
        !tieneModalidad && "+modalidad",
        !tieneTiempo && "+tiempo",
      ].filter(Boolean).join(", ");
      console.log(`  ✓ ${act.codigo}: ${fixes}`);
      actualizadas++;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ LISTO — ${actualizadas} enriquecidos, ${omitidas} omitidos, ${errores} errores`);
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
