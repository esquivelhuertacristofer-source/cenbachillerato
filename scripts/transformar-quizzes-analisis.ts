/**
 * transformar-quizzes-analisis.ts
 * Sesión 8 — Mejora pedagógica de quizzes: retroalimentación y parámetros.
 *
 * Para quiz_multiple_opcion y quiz_verdadero_falso:
 *   - Agrega retroalimentacion a preguntas que no la tienen
 *   - Asegura intentos_maximos y puntaje_minimo_aprobacion razonables
 *   - Para MC: retroalimentacion indica la opción correcta y pide releer
 *   - Para VF: retroalimentacion orienta hacia el concepto en la progresión
 *
 * Idempotente: omite preguntas que ya tienen retroalimentacion.
 * Uso: npx tsx scripts/transformar-quizzes-analisis.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

type SB = ReturnType<typeof createClient<Database>>;

// ── Tipos ────────────────────────────────────────────────────────────────────

interface PreguntaMC {
  enunciado: string;
  opciones: string[];
  respuesta_correcta: number;
  retroalimentacion?: string;
  imagen_url?: string;
}

interface ContenidoMC {
  preguntas: PreguntaMC[];
  intentos_maximos?: number;
  puntaje_minimo_aprobacion?: number;
  mezclar_preguntas?: boolean;
}

interface PreguntaVF {
  enunciado: string;
  respuesta: boolean;
  retroalimentacion?: string;
}

interface ContenidoVF {
  preguntas: PreguntaVF[];
  intentos_maximos?: number;
  puntaje_minimo_aprobacion?: number;
}

// ── Generadores de retroalimentación ─────────────────────────────────────────

function retroMC(p: PreguntaMC): string {
  const opcionCorrecta = p.opciones[p.respuesta_correcta];
  // Trim long options for readability in feedback
  const label =
    opcionCorrecta && opcionCorrecta.length <= 80
      ? `"${opcionCorrecta}"`
      : `la opción ${p.respuesta_correcta + 1}`;
  return (
    `La respuesta correcta es ${label}. ` +
    "Si no la seleccionaste, regresa al texto de la progresión y busca el concepto " +
    "que responde esta pregunta antes de intentarlo nuevamente."
  );
}

function retroVF(p: PreguntaVF): string {
  const correcta = p.respuesta ? "Verdadero" : "Falso";
  return (
    `La afirmación es ${correcta}. ` +
    "Si tu respuesta fue distinta, revisa el concepto clave mencionado en el enunciado " +
    "dentro del texto de la progresión para confirmar el razonamiento correcto."
  );
}

// ── Procesadores por tipo ─────────────────────────────────────────────────────

function procesarMC(cont: ContenidoMC): { newContenido: ContenidoMC; mejoradas: number } {
  let mejoradas = 0;
  const newPreguntas: PreguntaMC[] = cont.preguntas.map((p) => {
    if (p.retroalimentacion?.trim()) return p;
    mejoradas++;
    return { ...p, retroalimentacion: retroMC(p) };
  });

  return {
    newContenido: {
      ...cont,
      preguntas: newPreguntas,
      intentos_maximos: cont.intentos_maximos ?? 3,
      puntaje_minimo_aprobacion: cont.puntaje_minimo_aprobacion ?? 70,
    },
    mejoradas,
  };
}

function procesarVF(cont: ContenidoVF): { newContenido: ContenidoVF; mejoradas: number } {
  let mejoradas = 0;
  const newPreguntas: PreguntaVF[] = cont.preguntas.map((p) => {
    if (p.retroalimentacion?.trim()) return p;
    mejoradas++;
    return { ...p, retroalimentacion: retroVF(p) };
  });

  return {
    newContenido: {
      ...cont,
      preguntas: newPreguntas,
      intentos_maximos: cont.intentos_maximos ?? 2,
      puntaje_minimo_aprobacion: cont.puntaje_minimo_aprobacion ?? 70,
    },
    mejoradas,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

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

  console.log("\n🧠 CEN Bachillerato — Sesión 8: Mejora pedagógica de quizzes\n");

  // Fetch both quiz types
  const { data: actividades, error } = await sb
    .from("actividades")
    .select("id, codigo, tipo, contenido, nivel_revision")
    .in("tipo", ["quiz_multiple_opcion", "quiz_verdadero_falso"])
    .order("codigo");

  if (error || !actividades) {
    console.error("Error consultando quizzes:", error?.message);
    process.exit(1);
  }

  const mcActvs = actividades.filter((a) => a.tipo === "quiz_multiple_opcion");
  const vfActvs = actividades.filter((a) => a.tipo === "quiz_verdadero_falso");

  console.log(`Quiz MC encontrados: ${mcActvs.length}`);
  console.log(`Quiz VF encontrados: ${vfActvs.length}`);
  console.log("Procesando retroalimentación...\n");

  let actualizadas = 0;
  let omitidas = 0;
  let errores = 0;
  let totalPreguntasMejoradas = 0;

  // Procesar MC
  for (const act of mcActvs) {
    const cont = act.contenido as unknown as ContenidoMC;
    const sinRetro = cont.preguntas.filter((p) => !p.retroalimentacion?.trim());
    const sinParams =
      !cont.intentos_maximos || !cont.puntaje_minimo_aprobacion;

    if (sinRetro.length === 0 && !sinParams) {
      omitidas++;
      continue;
    }

    const { newContenido, mejoradas } = procesarMC(cont);
    totalPreguntasMejoradas += mejoradas;

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
      console.log(
        `  ✓ ${act.codigo} [MC]: +retro(${mejoradas}/${cont.preguntas.length} preguntas)${sinParams ? " +params" : ""}`
      );
      actualizadas++;
    }
  }

  // Procesar VF
  for (const act of vfActvs) {
    const cont = act.contenido as unknown as ContenidoVF;
    const sinRetro = cont.preguntas.filter((p) => !p.retroalimentacion?.trim());
    const sinParams =
      !cont.intentos_maximos || !cont.puntaje_minimo_aprobacion;

    if (sinRetro.length === 0 && !sinParams) {
      omitidas++;
      continue;
    }

    const { newContenido, mejoradas } = procesarVF(cont);
    totalPreguntasMejoradas += mejoradas;

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
      console.log(
        `  ✓ ${act.codigo} [VF]: +retro(${mejoradas}/${cont.preguntas.length} preguntas)${sinParams ? " +params" : ""}`
      );
      actualizadas++;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ LISTO — ${actualizadas} quizzes mejorados`);
  console.log(`   Preguntas con nueva retroalimentación: ${totalPreguntasMejoradas}`);
  console.log(`   Omitidos (ya completos): ${omitidas} | Errores: ${errores}`);
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
