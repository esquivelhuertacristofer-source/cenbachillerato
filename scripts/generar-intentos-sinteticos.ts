/**
 * Genera intentos sintéticos para las 3 cuentas demo de alumno.
 *
 * Distribución temporal:
 *   Bloque 1 — fuerte        (30%): Feb 10 – Mar 10  |  score 76-96
 *   Bloque 2 — bajón         (20%): Mar 10 – Mar 31  |  score 44-63
 *   Bloque 3 — recuperación  (20%): Apr 01 – Apr 22  |  score 66-82
 *   Bloque 4 — sostenido     (20%): Apr 22 – May 24  |  score 73-91
 *   Bloque 5 — vacío         (10%): sin intentos
 *
 * Idempotente: ON CONFLICT (user_id, actividad_id, status) DO NOTHING
 * Uso: npx tsx scripts/generar-intentos-sinteticos.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

// ── Cuentas demo ─────────────────────────────────────────────────────────────

const DEMO_ALUMNOS = [
  { email: "alumno-sem4@cenbachillerato-demo.com", semestre: 4 },
  { email: "alumno-sem5@cenbachillerato-demo.com", semestre: 5 },
  { email: "alumno-sem6@cenbachillerato-demo.com", semestre: 6 },
] as const;

// ── Distribución por bloques ─────────────────────────────────────────────────

const BLOCKS = [
  {
    name: "fuerte",
    fraccion: 0.30,
    scoreMin: 76,
    scoreMax: 96,
    tiempoMin: 300,
    tiempoMax: 900,
    desde: new Date("2026-02-10T00:00:00Z"),
    hasta: new Date("2026-03-10T00:00:00Z"),
  },
  {
    name: "bajón",
    fraccion: 0.20,
    scoreMin: 44,
    scoreMax: 63,
    tiempoMin: 120,
    tiempoMax: 1200,
    desde: new Date("2026-03-10T00:00:00Z"),
    hasta: new Date("2026-03-31T00:00:00Z"),
  },
  {
    name: "recuperación",
    fraccion: 0.20,
    scoreMin: 66,
    scoreMax: 82,
    tiempoMin: 300,
    tiempoMax: 960,
    desde: new Date("2026-04-01T00:00:00Z"),
    hasta: new Date("2026-04-22T00:00:00Z"),
  },
  {
    name: "sostenido",
    fraccion: 0.20,
    scoreMin: 73,
    scoreMax: 91,
    tiempoMin: 240,
    tiempoMax: 720,
    desde: new Date("2026-04-22T00:00:00Z"),
    hasta: new Date("2026-05-24T00:00:00Z"),
  },
  // vacío: fraccion restante (10%) — sin intentos
];

// ── Utilidades ────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDate(desde: Date, hasta: Date): Date {
  const ms = desde.getTime() + Math.random() * (hasta.getTime() - desde.getTime());
  return new Date(ms);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j] as T;
    a[j] = tmp as T;
  }
  return a;
}

function respuestasParaTipo(tipo: string, score: number): unknown {
  switch (tipo) {
    case "quiz_multiple_opcion":
      return {
        respuestas: [
          { id: "1", seleccionada: randInt(0, 3) },
          { id: "2", seleccionada: randInt(0, 3) },
          { id: "3", seleccionada: randInt(0, 3) },
        ],
        score,
      };
    case "quiz_verdadero_falso":
      return {
        respuestas: [
          { id: "1", respuesta: Math.random() > 0.3 },
          { id: "2", respuesta: Math.random() > 0.3 },
          { id: "3", respuesta: Math.random() > 0.5 },
        ],
        score,
      };
    case "reflexion_escrita":
      return {
        texto: "Reflexión completada. El alumno analizó el tema desde múltiples perspectivas.",
        palabras: randInt(80, 280),
      };
    case "autoevaluacion":
      return {
        criterios: [
          { id: "c1", puntuacion: Math.min(score, 100) },
          { id: "c2", puntuacion: Math.max(score - randInt(3, 10), 0) },
          { id: "c3", puntuacion: Math.min(score + randInt(0, 5), 100) },
        ],
      };
    case "fill_blanks":
      return {
        respuestas: [
          { id: "b1", texto: "concepto" },
          { id: "b2", texto: "proceso" },
          { id: "b3", texto: "elemento" },
        ],
        score,
      };
    case "ejercicio_matematico":
      return {
        respuesta: randInt(1, 999),
        pasos: ["Paso 1 completado", "Paso 2 completado"],
        score,
      };
    case "debate_estructurado":
      return {
        posicion: Math.random() > 0.5 ? "a_favor" : "en_contra",
        argumentos: ["Argumento principal desarrollado", "Contraargumento analizado"],
        aportaciones: randInt(2, 6),
      };
    case "video_con_preguntas":
      return {
        porcentaje_visto: randInt(85, 100),
        respuestas: [
          { id: "q1", respuesta: "opcion_a" },
          { id: "q2", respuesta: "opcion_b" },
        ],
      };
    case "simulacion":
      return {
        iteraciones: randInt(3, 8),
        resultado: "completado",
        parametros: { nivel: "intermedio" },
        score,
      };
    case "glosario_interactivo":
      return {
        terminos_revisados: randInt(5, 20),
        completado: true,
      };
    case "infografia":
      return {
        visualizado: true,
        secciones_vistas: randInt(3, 8),
      };
    case "lectura":
      return {
        completado: true,
        tiempo_lectura: randInt(120, 600),
      };
    default:
      return { completado: true, score };
  }
}

// ── Queries ───────────────────────────────────────────────────────────────────

type SB = SupabaseClient<Database>;

async function getUserId(sb: SB, email: string): Promise<string | null> {
  const { data } = await sb
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();
  return data?.id ?? null;
}

async function getActividadesParaSemestre(
  sb: SB,
  semestre: number
): Promise<Array<{ id: string; tipo: string }>> {
  const { data: uacs } = await sb
    .from("uac")
    .select("id")
    .eq("semestre", semestre);

  if (!uacs || uacs.length === 0) return [];

  const uacIds = uacs.map((u) => u.id);
  const { data: progs } = await sb
    .from("progresiones")
    .select("id")
    .in("uac_id", uacIds);

  if (!progs || progs.length === 0) return [];

  const progIds = progs.map((p) => p.id);
  const { data: acts } = await sb
    .from("actividades")
    .select("id, tipo")
    .in("progresion_id", progIds)
    .neq("estado", "archivada");

  return acts ?? [];
}

// ── Procesamiento por alumno ──────────────────────────────────────────────────

async function procesarAlumno(
  sb: SB,
  email: string,
  semestre: number
): Promise<void> {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`Alumno: ${email}  (semestre ${semestre})`);

  const userId = await getUserId(sb, email);
  if (!userId) {
    console.log("  ⚠  Profile no encontrado — ¿la cuenta fue creada?");
    return;
  }
  console.log(`  user_id: ${userId}`);

  const actividades = await getActividadesParaSemestre(sb, semestre);
  console.log(`  Actividades encontradas: ${actividades.length}`);

  if (actividades.length === 0) {
    console.log("  ⚠  Sin actividades para este semestre — skipping");
    return;
  }

  const shuffled = shuffle(actividades);
  let cursor = 0;
  let totalOk = 0;
  let totalErr = 0;

  for (const block of BLOCKS) {
    const count = Math.round(shuffled.length * block.fraccion);
    const slice = shuffled.slice(cursor, cursor + count);
    cursor += count;

    console.log(`\n  [${block.name}] — ${slice.length} actividades`);

    for (const act of slice) {
      const score = randInt(block.scoreMin, block.scoreMax);
      const tiempoSegundos = randInt(block.tiempoMin, block.tiempoMax);
      const completedAt = randDate(block.desde, block.hasta);
      const startedAt = new Date(completedAt.getTime() - tiempoSegundos * 1000);

      const { error } = await sb.from("intentos").upsert(
        {
          user_id: userId,
          actividad_id: act.id,
          status: "completed",
          score,
          tiempo_segundos: tiempoSegundos,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          respuestas: respuestasParaTipo(act.tipo, score) as any,
          started_at: startedAt.toISOString(),
          completed_at: completedAt.toISOString(),
        },
        {
          onConflict: "user_id,actividad_id,status",
          ignoreDuplicates: true,
        }
      );

      if (error) {
        console.log(`    ✗ [${act.id.slice(0, 8)}] ${error.message}`);
        totalErr++;
      } else {
        totalOk++;
        process.stdout.write(".");
      }
    }
    process.stdout.write("\n");
  }

  const vacioCount = shuffled.length - cursor;
  console.log(
    `\n  [vacío] — ${vacioCount} actividades sin intentos (pendientes)`
  );
  console.log(
    `  Resumen: ${totalOk} ok, ${totalErr} errores`
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "ERROR: Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local"
    );
    process.exit(1);
  }

  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("\n🎓 CEN Bachillerato — Generador de Intentos Sintéticos");
  console.log("   Distribución: fuerte → bajón → recuperación → sostenido → vacío");

  for (const alumno of DEMO_ALUMNOS) {
    await procesarAlumno(sb, alumno.email, alumno.semestre);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ LISTO — Datos sintéticos generados");
  console.log(`${"=".repeat(60)}\n`);
}

// ── CLI guard ─────────────────────────────────────────────────────────────────

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((err: unknown) => {
    console.error(
      "\nERROR FATAL:",
      err instanceof Error ? err.message : String(err)
    );
    process.exit(1);
  });
}
