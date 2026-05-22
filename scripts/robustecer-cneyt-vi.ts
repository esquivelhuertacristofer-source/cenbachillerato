/**
 * robustecer-cneyt-vi.ts
 * Sesión 6 — Robustecimiento de CNEYT-VI (Biología, Semestre 6).
 *
 * Para cada actividad de CNEYT-VI con nivel_revision = 'borrador':
 *   - Lecturas: agrega callout con referencia a CONABIO, biodiversidad o ecología mexicana
 *   - Todas: marca nivel_revision = 'robustecida'
 *
 * Idempotente: omite las que ya son 'robustecida' o 'validada_pedagogicamente'.
 * Uso: npx tsx scripts/robustecer-cneyt-vi.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

type SB = ReturnType<typeof createClient<Database>>;

interface Callout {
  tipo: "info" | "importante" | "sabias";
  contenido: string;
}

// Callouts sobre biodiversidad y ecología mexicana (CONABIO, SEMARNAT, etc.)
const CALLOUTS_BIODIVERSIDAD: Callout[] = [
  {
    tipo: "sabias",
    contenido:
      "México es uno de los 17 países megadiversos del planeta según la CONABIO " +
      "(Comisión Nacional para el Conocimiento y Uso de la Biodiversidad). Alberga " +
      "el 10% de las especies conocidas en la Tierra, con más de 200,000 especies registradas " +
      "en su territorio: el mayor número en el mundo en relación a su extensión.",
  },
  {
    tipo: "info",
    contenido:
      "La NOM-059-SEMARNAT-2010 lista las especies de flora y fauna silvestres de México " +
      "bajo diferentes categorías de riesgo: Probablemente Extinta en el Medio Silvestre, " +
      "En Peligro de Extinción, Amenazada, y Sujeta a Protección Especial. " +
      "Actualmente protege a más de 2,600 especies nativas.",
  },
  {
    tipo: "sabias",
    contenido:
      "El ajolote (Ambystoma mexicanum) es endémico del sistema lacustre de Xochimilco, " +
      "Ciudad de México. Es un anfibio axolotl con capacidad de regenerar extremidades, " +
      "corazón e incluso partes del cerebro — una propiedad única que lo convierte en " +
      "objeto de investigación biomédica de primer nivel mundial.",
  },
  {
    tipo: "importante",
    contenido:
      "La deforestación en México avanza a una tasa de aproximadamente 155,000 hectáreas " +
      "por año según el INEGI. La pérdida de hábitat es la principal amenaza para la " +
      "biodiversidad: el 68% de las especies en riesgo en México lo están principalmente " +
      "por destrucción y fragmentación de su hábitat.",
  },
  {
    tipo: "info",
    contenido:
      "El Sistema Nacional de Áreas Naturales Protegidas (SINAP) de México protege más de " +
      "90 millones de hectáreas terrestres y marinas — el 19% del territorio nacional. " +
      "Incluye 182 áreas naturales protegidas, entre ellas la Reserva de la Biosfera " +
      "Monarca y la Isla Guadalupe.",
  },
  {
    tipo: "sabias",
    contenido:
      "México es el país con mayor diversidad de pinos (Pinus spp.) en el mundo, con más de " +
      "50 especies nativas de un total global de 115. Los bosques de pino-encino cubren el " +
      "23% del territorio nacional y son hábitat crítico para especies como el puma, " +
      "el venado cola blanca y la mariposa monarca.",
  },
  {
    tipo: "importante",
    contenido:
      "Los arrecifes de coral del Caribe mexicano — incluyendo el Sistema Arrecifal " +
      "Mesoamericano, el segundo más grande del mundo — enfrentan amenazas severas por el " +
      "calentamiento oceánico. La temperatura del mar en el Caribe ha aumentado 1.2°C " +
      "en los últimos 50 años, causando episodios masivos de blanqueamiento coralino.",
  },
  {
    tipo: "info",
    contenido:
      "La Reserva de la Biosfera El Pinacate y Gran Desierto de Altar en Sonora es Patrimonio " +
      "de la Humanidad (UNESCO, 2013). Este ecosistema desértico alberga el cráter volcánico " +
      "de El Elegante y especies únicas como el berrendo sonorense (Antilocapra americana " +
      "sonoriensis), con solo 200 individuos en estado silvestre.",
  },
  {
    tipo: "sabias",
    contenido:
      "El maíz (Zea mays) es originario de México y fue domesticado hace más de 9,000 años " +
      "por culturas del sur de México a partir del teocintle silvestre. México sigue siendo el " +
      "centro de mayor diversidad genética del maíz en el mundo, con más de 60 razas nativas " +
      "documentadas por el CIMMYT.",
  },
  {
    tipo: "info",
    contenido:
      "Los manglares mexicanos son los cuartos más extensos del mundo, con más de 900,000 " +
      "hectáreas en costas del Pacífico, Golfo y Caribe. Funcionan como guardería para " +
      "el 70% de las especies comerciales de peces y camarones, y son barreras naturales " +
      "contra huracanes que reducen el impacto sobre comunidades costeras.",
  },
  {
    tipo: "sabias",
    contenido:
      "La mariposa monarca (Danaus plexippus) realiza una de las migraciones más espectaculares " +
      "del planeta: viaja más de 4,000 km desde Canadá y Estados Unidos hasta los bosques de " +
      "oyamel en Michoacán y Estado de México. Los santuarios del Bosque de la Monarca reciben " +
      "hasta 300 millones de mariposas cada invierno.",
  },
];

function pickCallout(index: number): Callout {
  return CALLOUTS_BIODIVERSIDAD[index % CALLOUTS_BIODIVERSIDAD.length];
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

  console.log("\n🌿 CEN Bachillerato — Sesión 6: Robustecimiento CNEYT-VI (Biología)\n");

  const { data: actividades, error } = await sb
    .from("actividades")
    .select("id, codigo, tipo, contenido, nivel_revision")
    .ilike("codigo", "CNEYT-VI-%")
    .order("codigo");

  if (error || !actividades) {
    console.error("Error consultando CNEYT-VI:", error?.message);
    process.exit(1);
  }

  console.log(`Actividades CNEYT-VI encontradas: ${actividades.length}`);

  const borradores = actividades.filter((a) => a.nivel_revision === "borrador");
  console.log(`Con nivel_revision=borrador: ${borradores.length}`);
  console.log("Procesando...\n");

  let actualizadas = 0;
  let omitidas = 0;
  let errores = 0;

  for (let i = 0; i < borradores.length; i++) {
    const act = borradores[i];

    if (act.tipo === "lectura") {
      const cont = act.contenido as Record<string, unknown>;
      const yaCallouts =
        Array.isArray(cont.callouts) && (cont.callouts as unknown[]).length > 0;

      const newContenido = yaCallouts
        ? cont
        : { ...cont, callouts: [pickCallout(i)] };

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
        const tag = yaCallouts ? "(ya tenía callout, solo nivel)" : "+callout biodiversidad";
        console.log(`  ✓ ${act.codigo} [lectura]: ${tag} → robustecida`);
        actualizadas++;
      }
    } else {
      // Non-lectura: just update nivel_revision
      const { error: upErr } = await sb
        .from("actividades")
        .update({ nivel_revision: "robustecida" })
        .eq("id", act.id);

      if (upErr) {
        console.error(`  ❌ ${act.codigo}: ${upErr.message}`);
        errores++;
      } else {
        console.log(`  ✓ ${act.codigo} [${act.tipo}]: → robustecida`);
        actualizadas++;
      }
    }
  }

  const yaOk = actividades.filter((a) => a.nivel_revision !== "borrador").length;
  omitidas = yaOk;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ LISTO — ${actualizadas} robustecidas, ${omitidas} ya estaban ok, ${errores} errores`);
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
