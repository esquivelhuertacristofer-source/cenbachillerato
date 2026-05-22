/**
 * robustecer-refs-mexicanas-lc-in.ts
 * Sesión 5 — Contextualización mexicana en lecturas de LC e IN.
 *
 * Agrega un callout con referencia académica o cultural mexicana a cada lectura
 * de Lengua y Comunicación (LC-*) e Informática (IN-*) que carezca de callouts.
 *
 * Idempotente: omite actividades que ya tienen callouts en contenido.
 * Uso: npx tsx scripts/robustecer-refs-mexicanas-lc-in.ts
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

interface ContenidoLectura {
  texto: string;
  fuente?: string;
  nivel_lectura?: string;
  preguntas_comprension?: unknown[];
  tiempo_estimado_minutos?: number;
  callouts?: Callout[];
}

// Pool de callouts para LC — Lengua y Comunicación
const CALLOUTS_LC: Callout[] = [
  {
    tipo: "sabias",
    contenido:
      "México reconoce 68 lenguas nacionales además del español, según el catálogo del INALI " +
      "(Instituto Nacional de Lenguas Indígenas). Cada una tiene variantes dialectales propias: " +
      "el náhuatl, por ejemplo, tiene más de 30 variantes distribuidas desde Guerrero hasta Veracruz.",
  },
  {
    tipo: "info",
    contenido:
      "La FUNDÉU México (Fundación del Español Urgente) ofrece asesoramiento gratuito sobre el " +
      "uso correcto del español en contextos digitales, periodísticos y cotidianos. Su glosario de " +
      "tecnicismos adaptados al español mexicano es un recurso de referencia para comunicadores.",
  },
  {
    tipo: "sabias",
    contenido:
      "Juan Rulfo escribió toda su obra con sólo dos libros: El Llano en llamas (1953) y Pedro Páramo " +
      "(1955). A pesar de su brevedad, su influencia en la narrativa latinoamericana es comparable a la de " +
      "Borges. Gabriel García Márquez afirmó que Pedro Páramo le enseñó cómo se podía escribir.",
  },
  {
    tipo: "importante",
    contenido:
      "El español de México incorpora más de 10,000 voces de origen náhuatl que usamos a diario: " +
      "chocolate, tomate, aguacate, chile, copal, petate, chicle, guajolote. Estas palabras cruzaron " +
      "el Atlántico y hoy forman parte del español global y de decenas de otros idiomas.",
  },
  {
    tipo: "info",
    contenido:
      "Elena Poniatowska es una de las periodistas y escritoras mexicanas más influyentes del siglo XX. " +
      "Su libro La noche de Tlatelolco (1971) documenta la masacre estudiantil del 2 de octubre de 1968 " +
      "a través de testimonios orales — un hito del periodismo narrativo en lengua española.",
  },
  {
    tipo: "sabias",
    contenido:
      "El Instituto de Investigaciones Filológicas de la UNAM publica el Diccionario del Español de México " +
      "(DEM), que registra las particularidades léxicas, semánticas y pragmáticas del español hablado " +
      "en México — una herramienta imprescindible para investigadores y docentes de Lengua.",
  },
  {
    tipo: "info",
    contenido:
      "Octavio Paz, Premio Nobel de Literatura 1990, analizó la identidad mexicana en El laberinto " +
      "de la soledad (1950). Sus reflexiones sobre la máscara, la fiesta y la muerte como rasgos " +
      "culturales siguen siendo referencia en los estudios de comunicación y humanidades.",
  },
  {
    tipo: "sabias",
    contenido:
      "México es el cuarto país hispanohablante con mayor producción editorial en español. La Feria " +
      "Internacional del Libro de Guadalajara (FIL) es la más grande del mundo en lengua española, " +
      "con más de 800,000 visitantes anuales y más de 2,000 editoriales participantes.",
  },
];

// Pool de callouts para IN — Informática
const CALLOUTS_IN: Callout[] = [
  {
    tipo: "sabias",
    contenido:
      "México cuenta con más de 120,000 desarrolladores de software activos. " +
      "Guadalajara —llamada el 'Silicon Valley mexicano'— alberga sedes de IBM, Intel, HP, Oracle " +
      "y cientos de startups tecnológicas que exportan software al mercado norteamericano y europeo.",
  },
  {
    tipo: "info",
    contenido:
      "El INEGI publica datos abiertos en datos.gob.mx que permiten practicar análisis de datos " +
      "con información real de México: demografía, economía, educación, salud y medio ambiente. " +
      "Es un recurso fundamental para proyectos de Informática aplicada al contexto nacional.",
  },
  {
    tipo: "importante",
    contenido:
      "Según la ENDUTIH (INEGI, 2023), el 78.6% de la población mexicana de 6 años y más usa " +
      "internet, pero la brecha digital entre zonas urbanas (86.7%) y rurales (50.8%) persiste. " +
      "La Informática tiene un papel clave en reducir esta inequidad de acceso al conocimiento.",
  },
  {
    tipo: "sabias",
    contenido:
      "El CINVESTAV (Centro de Investigación y de Estudios Avanzados del IPN) es uno de los " +
      "centros de investigación en cómputo e ingeniería más reconocidos de América Latina. " +
      "Sus laboratorios de Computación, Robótica e Inteligencia Artificial son referencia mundial.",
  },
  {
    tipo: "info",
    contenido:
      "La UNAM ofrece cursos abiertos en línea (MOOCs) de programación, ciencia de datos e " +
      "inteligencia artificial a través de su plataforma MassivX. Miles de estudiantes mexicanos " +
      "acceden a formación tecnológica de nivel universitario de forma gratuita.",
  },
  {
    tipo: "sabias",
    contenido:
      "México es el país latinoamericano con mayor número de certificaciones en tecnologías " +
      "de la información (Microsoft, Google, Oracle, AWS). El mercado de TI mexicano supera " +
      "los 20,000 millones de dólares anuales y crece al 8% anual según la AMITI.",
  },
  {
    tipo: "importante",
    contenido:
      "La Estrategia Digital Nacional de México busca garantizar conectividad, habilidades " +
      "digitales e innovación tecnológica en todo el territorio. Iniciativas como Internet para " +
      "Todos y los Centros Comunitarios de Aprendizaje llevan conectividad a comunidades rurales.",
  },
  {
    tipo: "info",
    contenido:
      "El Tec de Monterrey es una de las universidades con mayor producción de patentes tecnológicas " +
      "en América Latina. Su modelo de aprendizaje basado en retos (Challenge-Based Learning) " +
      "integra la Informática como herramienta para resolver problemas sociales reales.",
  },
];

function pickCallout(pool: Callout[], index: number): Callout {
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

  console.log("\n🇲🇽  CEN Bachillerato — Sesión 5: Referencias mexicanas en LC e IN\n");

  // Fetch LC and IN lecturas
  const { data: actividades, error } = await sb
    .from("actividades")
    .select("id, codigo, contenido, nivel_revision")
    .eq("tipo", "lectura")
    .or("codigo.ilike.LC-%,codigo.ilike.IN-%")
    .order("codigo");

  if (error || !actividades) {
    console.error("Error consultando actividades:", error?.message);
    process.exit(1);
  }

  const lcActvs = actividades.filter((a) => a.codigo.startsWith("LC-"));
  const inActvs = actividades.filter((a) => a.codigo.startsWith("IN-"));

  console.log(`Lecturas LC encontradas: ${lcActvs.length}`);
  console.log(`Lecturas IN encontradas: ${inActvs.length}`);
  console.log("Filtrando las que carecen de callouts...\n");

  let actualizadas = 0;
  let omitidas = 0;
  let errores = 0;

  const allActividades = [...lcActvs, ...inActvs];

  for (let i = 0; i < allActividades.length; i++) {
    const act = allActividades[i];
    const cont = act.contenido as unknown as ContenidoLectura;

    // Skip if already has callouts
    if (Array.isArray((cont as Record<string, unknown>).callouts) &&
        ((cont as Record<string, unknown>).callouts as unknown[]).length > 0) {
      omitidas++;
      continue;
    }

    const isLC = act.codigo.startsWith("LC-");
    const pool = isLC ? CALLOUTS_LC : CALLOUTS_IN;
    const callout = pickCallout(pool, i);

    const newContenido = {
      ...cont,
      callouts: [callout],
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
      console.log(`  ✓ ${act.codigo}: +callout [${callout.tipo}]`);
      actualizadas++;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ LISTO — ${actualizadas} enriquecidas, ${omitidas} omitidas, ${errores} errores`);
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
