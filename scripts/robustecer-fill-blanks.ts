/**
 * robustecer-fill-blanks.ts
 * Sesión 4 — Enriquecimiento de actividades fill_blanks.
 *
 * Agrega a cada fill_blanks:
 *   - instrucciones claras si no existen
 *   - pista a cada hueco que carezca de ella
 *   - alternativas_aceptadas con variantes ortográficas/sinónimos básicos
 *
 * Idempotente: solo toca huecos sin pista y actividades sin instrucciones.
 * Uso: npx tsx scripts/robustecer-fill-blanks.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

type SB = ReturnType<typeof createClient<Database>>;

interface Hueco {
  posicion: number;
  respuesta_correcta: string;
  alternativas_aceptadas?: string[];
  pista?: string;
}

interface ContenidoFillBlanks {
  instrucciones?: string;
  texto_con_huecos: string;
  huecos: Hueco[];
  distingue_mayusculas?: boolean;
}

const INSTRUCCIONES_BASE =
  "Lee el texto con atención y completa cada espacio en blanco (___)  " +
  "con la palabra o frase más adecuada. Puedes releer el texto cuantas veces necesites.";

/** Genera una pista genérica a partir de la respuesta correcta. */
function generarPista(respuesta: string): string {
  const r = respuesta.trim();
  if (r.length === 0) return "Piensa en el concepto central del párrafo.";

  const primeraLetra = r[0].toUpperCase();
  const longitud = r.split(/\s+/).length;

  if (longitud === 1) {
    return `La respuesta es una sola palabra que empieza con "${primeraLetra}".`;
  }
  return `La respuesta tiene ${longitud} palabras y empieza con "${primeraLetra}".`;
}

/** Genera alternativas aceptadas básicas (minúsculas, sin tildes en variantes comunes). */
function generarAlternativas(respuesta: string): string[] {
  const base = respuesta.trim();
  const lower = base.toLowerCase();
  const alts: Set<string> = new Set([base, lower]);

  // Variante sin tilde para palabras comunes
  const sinTilde = lower
    .replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i")
    .replace(/ó/g, "o").replace(/ú/g, "u").replace(/ü/g, "u");
  alts.add(sinTilde);

  return [...alts].filter((a) => a !== base);
}

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

  console.log("\n✏️  CEN Bachillerato — Sesión 4: Robustecimiento fill_blanks\n");

  const { data: actividades, error } = await sb
    .from("actividades")
    .select("id, codigo, contenido, nivel_revision")
    .eq("tipo", "fill_blanks")
    .order("codigo");

  if (error || !actividades) {
    console.error("Error consultando fill_blanks:", error?.message);
    process.exit(1);
  }

  console.log(`Fill_blanks encontradas: ${actividades.length}`);
  console.log("Analizando calidad de huecos...\n");

  let actualizadas = 0;
  let omitidas = 0;
  let errores = 0;
  let totalHuecosMejorados = 0;

  for (const act of actividades) {
    const cont = act.contenido as unknown as ContenidoFillBlanks;

    const tieneInstrucciones = Boolean(cont.instrucciones?.trim());
    const huecosSinPista = cont.huecos.filter((h) => !h.pista?.trim());
    const huecosSinAlts = cont.huecos.filter(
      (h) => !Array.isArray(h.alternativas_aceptadas) || h.alternativas_aceptadas.length === 0
    );

    if (tieneInstrucciones && huecosSinPista.length === 0 && huecosSinAlts.length === 0) {
      omitidas++;
      continue;
    }

    const nuevosHuecos: Hueco[] = cont.huecos.map((h) => ({
      ...h,
      pista: h.pista?.trim() ? h.pista : generarPista(h.respuesta_correcta),
      alternativas_aceptadas:
        Array.isArray(h.alternativas_aceptadas) && h.alternativas_aceptadas.length > 0
          ? h.alternativas_aceptadas
          : generarAlternativas(h.respuesta_correcta),
    }));

    const newContenido: ContenidoFillBlanks = {
      ...cont,
      instrucciones: tieneInstrucciones ? cont.instrucciones : INSTRUCCIONES_BASE,
      huecos: nuevosHuecos,
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
      const mejorados = huecosSinPista.length + huecosSinAlts.length;
      totalHuecosMejorados += mejorados;
      const fixes = [
        !tieneInstrucciones && "+instrucciones",
        huecosSinPista.length > 0 && `+pistas(${huecosSinPista.length})`,
        huecosSinAlts.length > 0 && `+alternativas(${huecosSinAlts.length})`,
      ].filter(Boolean).join(", ");
      console.log(`  ✓ ${act.codigo}: ${fixes}`);
      actualizadas++;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ LISTO — ${actualizadas} actividades robustecidas`);
  console.log(`   Huecos mejorados: ${totalHuecosMejorados}`);
  console.log(`   Omitidas: ${omitidas} | Errores: ${errores}`);
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
