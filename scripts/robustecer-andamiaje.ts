/**
 * robustecer-andamiaje.ts
 * Sesión 7 — Andamiaje global: callouts para lecturas sin ellos.
 *
 * Para cada lectura de cualquier UAC que carezca de callouts en contenido,
 * inyecta un callout contextualmente apropiado según el prefijo de la UAC.
 *
 * Prioridad: UACs no cubiertas por S5/S6 (PM, CS, CD, PFH, CH, CNEYT-I..V).
 * Idempotente: omite lecturas que ya tienen callouts.
 * Uso: npx tsx scripts/robustecer-andamiaje.ts
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

// Mapa de callouts por prefijo de UAC (determinista para reproducibilidad)
const CALLOUTS_POR_PREFIJO: Record<string, Callout[]> = {
  PM: [
    {
      tipo: "info",
      contenido:
        "El INEGI publica datos estadísticos abiertos en datos.gob.mx que permiten " +
        "aplicar el Pensamiento Matemático a fenómenos reales: distribución del ingreso, " +
        "crecimiento demográfico, mortalidad por enfermedades y tendencias educativas.",
    },
    {
      tipo: "sabias",
      contenido:
        "Luis Miramontes fue un químico mexicano que sintetizó la noretisterona en 1951, " +
        "el componente activo de la primera píldora anticonceptiva. Su trabajo transformó " +
        "la medicina y la sociedad global, y es un ejemplo de cómo la matemática y la " +
        "ciencia mexicanas han cambiado el mundo.",
    },
    {
      tipo: "importante",
      contenido:
        "La Olimpiada Mexicana de Matemáticas (OMM) ha formado a generaciones de jóvenes " +
        "talentosos. México ocupa consistentemente los primeros lugares en la Olimpiada " +
        "Iberoamericana de Matemáticas y ha ganado medallas en la Olimpiada Internacional.",
    },
  ],
  CS: [
    {
      tipo: "info",
      contenido:
        "El CONEVAL mide la pobreza en México con un enfoque multidimensional que incluye " +
        "ingreso, rezago educativo, acceso a servicios de salud, vivienda y alimentación. " +
        "En 2022, el 36.3% de la población mexicana vivía en pobreza — datos que ilustran " +
        "la complejidad de los fenómenos sociales.",
    },
    {
      tipo: "sabias",
      contenido:
        "México tiene 68 pueblos indígenas reconocidos constitucionalmente. La CDMX es la " +
        "ciudad con mayor diversidad étnica del país: conviven nahuahablantes, mazahuas, " +
        "otomíes, zapotecos, mixtecas y decenas de comunidades más, haciendo de la capital " +
        "un laboratorio vivo de pluriculturalidad.",
    },
    {
      tipo: "importante",
      contenido:
        "La Encuesta Nacional sobre Discriminación (ENADIS, INEGI/CONAPRED) documenta las " +
        "formas de discriminación más frecuentes en México. Sus datos son herramienta " +
        "fundamental para diseñar políticas públicas de igualdad y para comprender las " +
        "dimensiones sociales del acceso a derechos.",
    },
  ],
  CD: [
    {
      tipo: "importante",
      contenido:
        "Según la ENDUTIH (INEGI, 2023), el 78.6% de los mexicanos de 6 años y más usa " +
        "internet. Sin embargo, la brecha digital entre zonas urbanas (86.7%) y rurales " +
        "(50.8%) muestra que la Cultura Digital no puede pensarse sin abordar desigualdades " +
        "estructurales de acceso.",
    },
    {
      tipo: "sabias",
      contenido:
        "Mexico City fue designada Ciudad Creativa Digital por la UNESCO en 2017. " +
        "La CDMX concentra el 40% de las startups tecnológicas del país y es sede de " +
        "hubs de innovación como el Corredor Digital de Insurgentes, que agrupa a más " +
        "de 500 empresas de tecnología.",
    },
    {
      tipo: "info",
      contenido:
        "El marco de Competencias Digitales definido por la UNESCO organiza las habilidades " +
        "digitales en cinco áreas: alfabetización en información y datos, comunicación y " +
        "colaboración, creación de contenidos digitales, seguridad y resolución de problemas. " +
        "México las integra en el currículo del NEM desde 2023.",
    },
  ],
  PFH: [
    {
      tipo: "sabias",
      contenido:
        "Leopoldo Zea (1912-2004) fue uno de los grandes filósofos mexicanos del siglo XX. " +
        "Su obra La filosofía americana como filosofía sin más (1969) argumenta que América " +
        "Latina tiene una tradición filosófica propia, no derivada de Europa, que debe ser " +
        "reconocida en su especificidad histórica.",
    },
    {
      tipo: "info",
      contenido:
        "El Instituto Nacional de Antropología e Historia (INAH) protege más de 187 zonas " +
        "arqueológicas abiertas al público y 188 museos. Sus investigaciones arqueológicas " +
        "e históricas reescriben continuamente nuestra comprensión de las culturas " +
        "prehispánicas mesoamericanas.",
    },
    {
      tipo: "importante",
      contenido:
        "La Constitución de 1917 fue la primera en el mundo en incluir derechos sociales: " +
        "educación laica, gratuita y obligatoria; propiedad de la nación sobre el subsuelo; " +
        "derechos laborales (jornada de 8 horas, salario mínimo, huelga). Fue un hito " +
        "que influyó en las constituciones del siglo XX en todo el mundo.",
    },
  ],
  CH: [
    {
      tipo: "sabias",
      contenido:
        "La UNAM es la institución de humanidades más grande de América Latina. Sus institutos " +
        "de Historia, Filología, Investigaciones Sociales, Investigaciones Estéticas e " +
        "Investigaciones Antropológicas producen conocimiento que sitúa a México en el " +
        "diálogo humanístico internacional.",
    },
    {
      tipo: "info",
      contenido:
        "La literatura indígena contemporánea de México florece en lenguas como el náhuatl, " +
        "el zapoteco, el maya yucateco y el tzotzil. Autoras como Natalia Toledo (zapoteca) " +
        "y Briceida Canto (maya) publican en su lengua materna y en español, ampliando " +
        "el canon literario nacional.",
    },
    {
      tipo: "importante",
      contenido:
        "El muralismo mexicano — Diego Rivera, José Clemente Orozco y David Alfaro Siqueiros — " +
        "transformó el arte público del siglo XX. Los murales del Palacio Nacional y la " +
        "Escuela Nacional Preparatoria son Patrimonio Cultural de la Humanidad y continúan " +
        "siendo referencia ineludible en la historia del arte latinoamericano.",
    },
  ],
  CNEYT: [
    {
      tipo: "info",
      contenido:
        "El CINVESTAV (Centro de Investigación y de Estudios Avanzados del IPN) es el " +
        "principal centro de ciencia experimental de México, con laboratorios en Biología, " +
        "Química, Física, Ingeniería y Biotecnología. Sus investigadores han publicado en " +
        "las revistas científicas más prestigiosas del mundo.",
    },
    {
      tipo: "sabias",
      contenido:
        "México es megadiverso en biota marina: alberga el 14% de todas las especies marinas " +
        "conocidas en el planeta. El Mar de Cortés —llamado 'el acuario del mundo' por " +
        "Jacques Cousteau— concentra más de 900 especies de peces, 32 de cetáceos y " +
        "millones de aves marinas migratorias.",
    },
    {
      tipo: "importante",
      contenido:
        "La investigación científica en México está coordinada por el CONAHCYT (ex CONACYT). " +
        "El Sistema Nacional de Investigadoras e Investigadores (SNII) agrupa a más de " +
        "35,000 científicos activos en universidades e institutos de todo el país, " +
        "con presencia en todas las áreas del conocimiento.",
    },
  ],
  LC: [
    {
      tipo: "sabias",
      contenido:
        "El Instituto de Investigaciones Filológicas de la UNAM publica el Diccionario del " +
        "Español de México (DEM), que registra el léxico, la semántica y la pragmática del " +
        "español mexicano con más de 100,000 entradas. Es la referencia académica " +
        "más completa sobre el español hablado en México.",
    },
  ],
  IN: [
    {
      tipo: "sabias",
      contenido:
        "Guadalajara es considerada el 'Silicon Valley mexicano'. Alberga sedes de IBM, " +
        "Intel, HP, Oracle, Tata Consultancy y cientos de empresas tecnológicas locales. " +
        "La ciudad produce el 60% del software que México exporta al mercado internacional.",
    },
  ],
};

// Fallback para prefijos no mapeados
const CALLOUT_GENERICO: Callout = {
  tipo: "info",
  contenido:
    "El Plan de Estudios del NEM 2023 organiza el aprendizaje en torno a proyectos " +
    "comunitarios y problemas reales. Las actividades de esta UAC buscan conectar " +
    "el conocimiento académico con contextos auténticos del entorno de los estudiantes.",
};

function getCalloutParaUAC(codigo: string, index: number): Callout {
  // Extract prefix: 'CNEYT-VI-P01-A1' → 'CNEYT', 'PM-III-P02-A1' → 'PM'
  const prefix = codigo.split("-")[0];
  const pool = CALLOUTS_POR_PREFIJO[prefix];
  if (!pool || pool.length === 0) return CALLOUT_GENERICO;
  return pool[index % pool.length];
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

  console.log("\n🏗️  CEN Bachillerato — Sesión 7: Andamiaje global — callouts para lecturas\n");

  const { data: actividades, error } = await sb
    .from("actividades")
    .select("id, codigo, contenido, nivel_revision")
    .eq("tipo", "lectura")
    .order("codigo");

  if (error || !actividades) {
    console.error("Error consultando lecturas:", error?.message);
    process.exit(1);
  }

  console.log(`Total lecturas: ${actividades.length}`);

  const sinCallouts = actividades.filter((a) => {
    const cont = a.contenido as Record<string, unknown>;
    return !(Array.isArray(cont.callouts) && (cont.callouts as unknown[]).length > 0);
  });

  console.log(`Lecturas sin callouts: ${sinCallouts.length}`);
  console.log("Inyectando callouts por UAC...\n");

  let actualizadas = 0;
  let omitidas = actividades.length - sinCallouts.length;
  let errores = 0;

  for (let i = 0; i < sinCallouts.length; i++) {
    const act = sinCallouts[i];
    const cont = act.contenido as Record<string, unknown>;
    const callout = getCalloutParaUAC(act.codigo, i);

    const newContenido = { ...cont, callouts: [callout] };

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
      console.log(`  ✓ ${act.codigo}: +callout [${callout.tipo}]`);
      actualizadas++;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ LISTO — ${actualizadas} lecturas enriquecidas`);
  console.log(`   Ya tenían callouts: ${omitidas} | Errores: ${errores}`);
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
