/**
 * REPONE LOS HUECOS QUE EL ALUMNO NO PODÍA COMPLETAR.
 *
 * Dos actividades `fill_blanks` tenían CINCO marcas `___` en el texto y sólo
 * CUATRO huecos declarados. El quinto no tiene respuesta correcta: quien haga
 * la actividad hoy encuentra un espacio que nunca puede acertar, y ninguna
 * validación lo veía porque el esquema no compara el texto con la lista.
 *
 * Las dos respuestas salen de la MISMA progresión, verbatim:
 *
 *  · LC-III-P02-A6 → "Modernismo". Las propias `instrucciones` de la actividad
 *    enumeran los cinco términos: «Barroco, Romanticismo, Realismo mágico,
 *    Vanguardias, Modernismo», y los glosarios A3 y A5 lo definen como el
 *    movimiento hispanoamericano de refinamiento estético y musicalidad.
 *  · LC-III-P07-A6 → "seguimiento y retroalimentación". El glosario A5 define
 *    ese término como «Evaluación del proceso antes, durante y después de la
 *    exposición…», que es palabra por palabra lo que pide la frase del hueco.
 *
 * Idempotente: si el hueco ya está, no escribe.
 *
 * Uso: npx tsx scripts/reparar-huecos-sin-respuesta.ts [--dry]
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

interface Hueco {
  posicion: number;
  respuesta_correcta: string;
  pista?: string;
  alternativas_aceptadas?: string[];
}

/**
 * Caso aparte: aquí no falta una respuesta, sobra una marca. El texto dice
 * `del ___ ___.` — dos huecos para una sola respuesta de dos palabras
 * («cambio climático»), que ya está declarada. Se corrige el texto.
 */
const TEXTO_A_CORREGIR: { codigo: string; de: string; a: string }[] = [
  {
    codigo: "CNEYT-III-P06-A6",
    de: "es la causa principal del ___ ___.",
    a: "es la causa principal del ___.",
  },
];

const REPARACIONES: { codigo: string; hueco: Hueco }[] = [
  {
    codigo: "LC-III-P02-A6",
    hueco: {
      posicion: 4,
      respuesta_correcta: "Modernismo",
      pista: "Movimiento hispanoamericano de musicalidad y refinamiento estético; Rubén Darío.",
      alternativas_aceptadas: ["modernismo"],
    },
  },
  {
    codigo: "LC-III-P07-A6",
    hueco: {
      posicion: 4,
      respuesta_correcta: "seguimiento y retroalimentación",
      pista: "Evaluación del proceso antes, durante y después de la exposición.",
      alternativas_aceptadas: ["seguimiento", "retroalimentación", "seguimiento y retroalimentacion"],
    },
  },
  // Las instrucciones de la propia actividad enumeran los cinco términos y
  // sólo cuatro estaban declarados; el que falta es el de la última frase.
  {
    codigo: "LC-III-P01-A6",
    hueco: {
      posicion: 4,
      respuesta_correcta: "postura",
      pista: "Argumentar si estás de acuerdo o no con el autor.",
      alternativas_aceptadas: ["opinión", "opinion"],
    },
  },
  {
    codigo: "LC-III-P06-A6",
    hueco: {
      posicion: 4,
      respuesta_correcta: "valoración",
      pista: "Juicio final sobre la calidad o relevancia de la obra.",
      alternativas_aceptadas: ["valoracion"],
    },
  },
  // Inglés: el verbo que cierra la narración, en pasado simple como el resto.
  {
    codigo: "IN-III-P01-A6",
    hueco: {
      posicion: 4,
      respuesta_correcta: "went",
      pista: "Past simple of 'go'.",
      alternativas_aceptadas: [],
    },
  },
  {
    codigo: "IN-V-P06-A6",
    hueco: {
      posicion: 4,
      respuesta_correcta: "hearing",
      pista: "'I look forward to ___ from you' — gerund after 'look forward to'.",
      alternativas_aceptadas: [],
    },
  },
  // El glosario A5 y la columna A9 enseñan la frase de reacción verbatim:
  // «I couldn't believe it».
  {
    codigo: "IN-IV-P07-A6",
    hueco: {
      posicion: 4,
      respuesta_correcta: "couldn't",
      pista: "Reaction phrase: 'I ___ believe how chaotic it was!'",
      alternativas_aceptadas: ["could not", "couldnt"],
    },
  },
  // El debate A3 lo nombra tal cual: «La selección de cuál dato publicar
  // (cherry picking)»; el glosario A5 lo llama «selección parcial».
  {
    codigo: "PM-VI-P08-A6",
    hueco: {
      posicion: 4,
      respuesta_correcta: "cherry picking",
      pista: "Publicar sólo el dato que conviene y callar el que no.",
      alternativas_aceptadas: ["selección parcial", "seleccion parcial", "sesgo de selección", "sesgo de seleccion"],
    },
  },
];

async function main() {
  const dry = process.argv.includes("--dry");
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Primero las correcciones de texto (una marca de más, no una respuesta de menos).
  for (const { codigo, de, a } of TEXTO_A_CORREGIR) {
    const { data, error } = await sb.from("actividades").select("contenido").eq("codigo", codigo).single();
    if (error || !data) { console.log(`✗ ${codigo}: ${error?.message ?? "no encontrada"}`); continue; }
    const contenido = { ...(data.contenido as Record<string, unknown>) };
    const texto = String(contenido.texto_con_huecos ?? "");
    if (!texto.includes(de)) { console.log(`= ${codigo}: el texto ya estaba corregido`); continue; }
    contenido.texto_con_huecos = texto.replace(de, a);
    console.log(`${dry ? "[dry] " : ""}${codigo}: se quita la marca sobrante de «cambio climático»`);
    if (dry) continue;
    const { error: e2 } = await sb.from("actividades").update({ contenido: contenido as never }).eq("codigo", codigo);
    console.log(e2 ? `  ✗ ${e2.message}` : "  ✓ verificado");
  }

  for (const { codigo, hueco } of REPARACIONES) {
    const { data, error } = await sb
      .from("actividades")
      .select("contenido")
      .eq("codigo", codigo)
      .single();
    if (error || !data) { console.log(`✗ ${codigo}: ${error?.message ?? "no encontrada"}`); continue; }

    const contenido = { ...(data.contenido as Record<string, unknown>) };
    const texto = String(contenido.texto_con_huecos ?? "");
    const marcas = (texto.match(/_{2,}/g) ?? []).length;
    const huecos = [...((contenido.huecos as Hueco[] | undefined) ?? [])];

    if (huecos.length >= marcas) {
      console.log(`= ${codigo}: ya tiene ${huecos.length} huecos para ${marcas} marcas`);
      continue;
    }
    if (huecos.some((h) => h.posicion === hueco.posicion)) {
      console.log(`= ${codigo}: la posición ${hueco.posicion} ya estaba`);
      continue;
    }

    huecos.push(hueco);
    huecos.sort((a, b) => a.posicion - b.posicion);
    contenido.huecos = huecos;

    console.log(
      `${dry ? "[dry] " : ""}${codigo}: ${marcas} marcas, ${huecos.length - 1} → ${huecos.length} huecos ` +
        `(+"${hueco.respuesta_correcta}")`
    );
    if (dry) continue;

    const { error: e2 } = await sb
      .from("actividades")
      .update({ contenido: contenido as never })
      .eq("codigo", codigo);
    if (e2) { console.log(`  ✗ no se pudo escribir: ${e2.message}`); continue; }

    const { data: check } = await sb
      .from("actividades").select("contenido").eq("codigo", codigo).single();
    const n = ((check?.contenido as Record<string, unknown> | undefined)?.huecos as unknown[] | undefined)?.length ?? 0;
    console.log(n === huecos.length ? "  ✓ verificado" : `  ✗ quedó en ${n}`);
  }
}

main().catch((e) => { console.error("ERROR:", (e as Error).message); process.exit(1); });
