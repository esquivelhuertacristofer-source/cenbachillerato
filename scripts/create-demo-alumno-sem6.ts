/**
 * Crea la cuenta demo de alumno para Semestre 6.
 * Uso: npx tsx scripts/create-demo-alumno-sem6.ts
 *
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 * Idempotente: re-ejecutar es seguro. No toca las cuentas de otros semestres.
 */
import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

// ── Constantes ───────────────────────────────────────────────────────────────

const DEMO_EMAIL    = "alumno-sem6@cenbachillerato-demo.com";
// Configurable vía DEMO_SEED_PASSWORD (.env.local); si no, usa el valor
// documentado en docs/DEMO-USERS.md.
const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD ?? "Demo2026!";
const DEMO_NOMBRE   = "Alumno Sem 6 Demo";
const DEMO_ESCUELA_CCT = "DEMO-001";
const DEMO_GRUPO_SEM6  = "Grupo 6A Demo";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getOrCreateEscuela(sb: SupabaseClient<Database>): Promise<string> {
  const { data: existing } = await sb
    .from("escuelas").select("id").eq("cct", DEMO_ESCUELA_CCT).single();

  if (existing) {
    console.log(`  ↩  Escuela ya existe (id=${existing.id})`);
    return existing.id;
  }

  const { data, error } = await sb
    .from("escuelas")
    .insert({ nombre: "Escuela Demo CEN Bachillerato", cct: DEMO_ESCUELA_CCT, subsistema: "particular" })
    .select("id").single();

  if (error || !data) throw new Error(`Error creando escuela: ${error?.message}`);
  console.log(`  ✓  Escuela creada (id=${data.id})`);
  return data.id;
}

async function getOrCreateGrupoSem6(sb: SupabaseClient<Database>, escuelaId: string): Promise<string> {
  const { data: existing } = await sb
    .from("grupos").select("id")
    .eq("nombre", DEMO_GRUPO_SEM6).eq("escuela_id", escuelaId).single();

  if (existing) {
    console.log(`  ↩  Grupo Sem 6 ya existe (id=${existing.id})`);
    return existing.id;
  }

  const { data, error } = await sb
    .from("grupos")
    .insert({ nombre: DEMO_GRUPO_SEM6, semestre: 6, escuela_id: escuelaId })
    .select("id").single();

  if (error || !data) throw new Error(`Error creando grupo Sem 6: ${error?.message}`);
  console.log(`  ✓  Grupo "${DEMO_GRUPO_SEM6}" creado (id=${data.id})`);
  return data.id;
}

async function getOrCreateAuthUser(sb: SupabaseClient<Database>, escuelaId: string): Promise<{ id: string; created: boolean }> {
  const { data, error } = await sb.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: DEMO_NOMBRE,
      role: "student",
      escuela_id: escuelaId,
      semestre: 6,
    },
  });

  if (!error) {
    console.log(`  ✓  Usuario Auth creado (id=${data.user.id})`);
    return { id: data.user.id, created: true };
  }

  // Ya existe — recuperar por email
  const msg = error.message.toLowerCase();
  if (msg.includes("already") || msg.includes("422") || msg.includes("exists")) {
    const { data: list } = await sb.auth.admin.listUsers();
    const existing = list?.users.find((u) => u.email === DEMO_EMAIL);
    if (existing) {
      console.log(`  ↩  Usuario Auth ya existe (id=${existing.id})`);
      return { id: existing.id, created: false };
    }
  }

  throw new Error(`Error creando usuario Auth: ${error.message}`);
}

async function upsertProfile(sb: SupabaseClient<Database>, userId: string, escuelaId: string): Promise<void> {
  const { error } = await sb.from("profiles").upsert({
    id: userId,
    email: DEMO_EMAIL,
    full_name: DEMO_NOMBRE,
    role: "student",
    escuela_id: escuelaId,
    semestre: 6,
    area_eleccion: null,
  }, { onConflict: "id" });

  if (error) throw new Error(`Error en upsert de profile: ${error.message}`);
  console.log(`  ✓  Profile upsertado (semestre=6)`);
}

async function assignToGrupo(sb: SupabaseClient<Database>, userId: string, grupoId: string): Promise<void> {
  const { error } = await sb
    .from("alumnos_grupos")
    .upsert({ id_alumno: userId, id_grupo: grupoId }, { onConflict: "id_alumno,id_grupo" });

  if (error) throw new Error(`Error asignando alumno al grupo: ${error.message}`);
  console.log(`  ✓  Alumno asignado a "${DEMO_GRUPO_SEM6}"`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("ERROR: Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }

  const sb = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  console.log("\n🚀 CEN Bachillerato — Demo Alumno Semestre 6\n");

  console.log("1. Escuela demo:");
  const escuelaId = await getOrCreateEscuela(sb);

  console.log("\n2. Grupo Semestre 6:");
  const grupoId = await getOrCreateGrupoSem6(sb, escuelaId);

  console.log("\n3. Usuario Auth:");
  const { id: userId } = await getOrCreateAuthUser(sb, escuelaId);

  console.log("\n4. Profile:");
  await upsertProfile(sb, userId, escuelaId);

  console.log("\n5. Asignación a grupo:");
  await assignToGrupo(sb, userId, grupoId);

  console.log("\n" + "=".repeat(60));
  console.log("✅ LISTO — Cuenta demo Semestre 6 creada/verificada");
  console.log("=".repeat(60));
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log(`  Semestre: 6`);
  console.log(`  Grupo:    ${DEMO_GRUPO_SEM6}`);
  console.log("=".repeat(60) + "\n");
}

// ── CLI guard ────────────────────────────────────────────────────────────────

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((err) => {
    console.error("\nERROR FATAL:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
