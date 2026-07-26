/**
 * Provisiona las cuentas SINTÉTICAS para la jornada de carga.
 *
 * Crea (idempotente) una escuela sandbox claramente etiquetada y N alumnos
 * sintéticos con un profile válido (role=student, semestre 1-6) para que RLS los
 * trate como alumnos reales. Opcionalmente siembra intentos por alumno para que
 * las lecturas midan payloads realistas (y para poblar el snapshot vía trigger).
 *
 * ⚠️ ESCRIBE en el Auth y las tablas de tu proyecto Supabase (probable PROD).
 * Solo corre con LOADTEST_CONFIRM=si. Sin eso, imprime el plan y sale.
 *
 * Uso:
 *   # simulacro (no escribe nada):
 *   npx tsx scripts/loadtest/provision-usuarios-carga.ts --users 200 --seed 8
 *   # de verdad:
 *   LOADTEST_CONFIRM=si npx tsx scripts/loadtest/provision-usuarios-carga.ts --users 200 --seed 8
 *
 * Limpieza: scripts/loadtest/limpiar-usuarios-carga.ts
 */
import { pathToFileURL } from "url";
import {
  SANDBOX_CCT,
  SANDBOX_NOMBRE,
  SYNTH_PASSWORD,
  emailParaIndice,
  confirmado,
  getServiceClient,
  targetHost,
  objetivoEsElDeLaApp,
  reintentar,
  esErrorTransitorio,
} from "./config";

type SB = ReturnType<typeof getServiceClient>;

function argNum(flag: string, def: number): number {
  const i = process.argv.indexOf(flag);
  if (i >= 0) {
    const v = Number(process.argv[i + 1]);
    if (Number.isFinite(v) && v >= 0) return v;
  }
  return def;
}

async function mapLimit<T>(items: T[], limite: number, fn: (item: T, i: number) => Promise<void>) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limite, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      await fn(items[i]!, i);
    }
  });
  await Promise.all(workers);
}

async function getOrCreateEscuela(sb: SB): Promise<string> {
  const { data: existing } = await sb
    .from("escuelas")
    .select("id")
    .eq("cct", SANDBOX_CCT)
    .maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await sb
    .from("escuelas")
    // "otro" es el único valor del CHECK escuelas_subsistema_check que aplica a
    // una escuela ficticia; la etiqueta real de sandbox va en nombre + CCT.
    .insert({ nombre: SANDBOX_NOMBRE, cct: SANDBOX_CCT, subsistema: "otro" })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Error creando escuela sandbox: ${error?.message}`);
  return data.id;
}

/** Profiles ya existentes de la escuela sandbox: email -> {id, semestre}. */
async function listarSinteticos(sb: SB, escuelaId: string): Promise<Map<string, { id: string; semestre: number }>> {
  const map = new Map<string, { id: string; semestre: number }>();
  const { data } = await sb
    .from("profiles")
    .select("id, email, semestre")
    .eq("escuela_id", escuelaId);
  for (const p of (data ?? []) as { id: string; email: string; semestre: number | null }[]) {
    map.set(p.email, { id: p.id, semestre: p.semestre ?? 1 });
  }
  return map;
}

/** Busca el id de auth por email paginando (solo se usa en la ruta huérfana). */
async function resolverIdPorEmail(sb: SB, email: string): Promise<string | null> {
  for (let page = 1; page <= 50; page++) {
    const { data } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
    const u = data?.users.find((x) => x.email === email);
    if (u) return u.id;
    if (!data || data.users.length < 1000) break;
  }
  return null;
}

async function actividadesPorSemestre(sb: SB, semestre: number, cache: Map<number, string[]>): Promise<string[]> {
  const hit = cache.get(semestre);
  if (hit) return hit;
  const { data: uacRows } = await sb.from("uac").select("id").eq("semestre", semestre);
  const uacIds = (uacRows ?? []).map((u: { id: string }) => u.id);
  if (uacIds.length === 0) {
    cache.set(semestre, []);
    return [];
  }
  const { data: progRows } = await sb.from("progresiones").select("id").in("uac_id", uacIds);
  const progIds = (progRows ?? []).map((p: { id: string }) => p.id);
  if (progIds.length === 0) {
    cache.set(semestre, []);
    return [];
  }
  const { data: actRows } = await sb.from("actividades").select("id").in("progresion_id", progIds);
  const actIds = (actRows ?? []).map((a: { id: string }) => a.id);
  cache.set(semestre, actIds);
  return actIds;
}

async function main() {
  const nUsers = argNum("--users", 50);
  const seedPorUser = argNum("--seed", 0);

  console.log("\n🏗  CEN Bachillerato — Provisión de cuentas de CARGA (sintéticas)\n");
  console.log(`  Objetivo Supabase : ${targetHost()}${objetivoEsElDeLaApp() ? "  ⚠️ (proyecto de la app / probable PROD)" : ""}`);
  console.log(`  Escuela sandbox   : ${SANDBOX_NOMBRE} (CCT ${SANDBOX_CCT})`);
  console.log(`  Alumnos a asegurar: ${nUsers}`);
  console.log(`  Intentos sembrados: ${seedPorUser} por alumno${seedPorUser === 0 ? "  (ninguno)" : ""}`);
  console.log(`  Contraseña común  : ${SYNTH_PASSWORD}`);

  if (!confirmado()) {
    console.log("\n🟡 SIMULACRO — no se creó nada.");
    console.log("   Para ejecutar de verdad, repite con LOADTEST_CONFIRM=si en el entorno.\n");
    return;
  }

  const sb = getServiceClient();

  console.log("\n1. Escuela sandbox…");
  const escuelaId = await getOrCreateEscuela(sb);
  console.log(`   ✓ id=${escuelaId}`);

  console.log("\n2. Alumnos sintéticos…");
  const existentes = await listarSinteticos(sb, escuelaId);
  const indices = Array.from({ length: nUsers }, (_, k) => k + 1);
  let creados = 0;
  let yaEstaban = 0;

  await mapLimit(indices, 12, async (i) => {
    const email = emailParaIndice(i);
    if (existentes.has(email)) {
      yaEstaban++;
      return;
    }
    const semestre = ((i - 1) % 6) + 1; // reparte 1..6 de forma determinista
    let userId: string | null = null;

    // createUser puede 403 `bad_jwt` de forma intermitente durante propagación de
    // llaves de firma; reintentamos con backoff solo ante ese tipo de error.
    const { data, error } = await reintentar(async () => {
      const res = await sb.auth.admin.createUser({
        email,
        password: SYNTH_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: `Carga ${i}`, role: "student", escuela_id: escuelaId, semestre },
      });
      if (res.error && esErrorTransitorio(res.error.message)) throw res.error;
      return res;
    });
    if (!error && data?.user) {
      userId = data.user.id;
      creados++;
    } else {
      const msg = (error?.message ?? "").toLowerCase();
      if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
        userId = await resolverIdPorEmail(sb, email);
        yaEstaban++;
      } else {
        throw new Error(`createUser ${email}: ${error?.message}`);
      }
    }
    if (!userId) return;

    const { error: pErr } = await sb.from("profiles").upsert(
      { id: userId, email, full_name: `Carga ${i}`, role: "student", escuela_id: escuelaId, semestre, area_eleccion: null },
      { onConflict: "id" }
    );
    if (pErr) throw new Error(`profile ${email}: ${pErr.message}`);
    existentes.set(email, { id: userId, semestre });
  });
  console.log(`   ✓ creados=${creados}  ya_existían=${yaEstaban}  total=${existentes.size}`);

  if (seedPorUser > 0) {
    console.log(`\n3. Sembrando ${seedPorUser} intentos por alumno (pobla el snapshot vía trigger)…`);
    const cacheActs = new Map<number, string[]>();
    const usuarios = [...existentes.values()];
    let filas = 0;
    await mapLimit(usuarios, 8, async (u) => {
      const acts = await actividadesPorSemestre(sb, u.semestre, cacheActs);
      if (acts.length === 0) return;
      const elegidas = new Set<string>();
      while (elegidas.size < Math.min(seedPorUser, acts.length)) {
        elegidas.add(acts[Math.floor(Math.random() * acts.length)]!);
      }
      const ahora = new Date().toISOString();
      const rows = [...elegidas].map((actId) => ({
        user_id: u.id,
        actividad_id: actId,
        status: "completed",
        score: 100,
        tiempo_segundos: 60,
        respuestas: { seed: true } as never,
        started_at: ahora,
        completed_at: ahora,
      }));
      // upsert con ignoreDuplicates → INSERT ... ON CONFLICT DO NOTHING contra la
      // UNIQUE (user_id, actividad_id, status): re-sembrar un alumno ya existente
      // no revienta por choque de llave (provisión idempotente de verdad).
      const { error } = await sb
        .from("intentos")
        .upsert(rows, { onConflict: "user_id,actividad_id,status", ignoreDuplicates: true });
      if (error) throw new Error(`seed intentos ${u.id}: ${error.message}`);
      filas += rows.length;
    });
    console.log(`   ✓ ${filas} intentos sembrados`);
  }

  console.log("\n✅ Provisión lista. Ejecuta la carga con scripts/loadtest/correr-carga.ts");
  console.log("   Al terminar, limpia con scripts/loadtest/limpiar-usuarios-carga.ts\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("\nERROR FATAL:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
