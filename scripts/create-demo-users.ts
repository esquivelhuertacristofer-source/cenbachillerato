/**
 * Script de creación de usuarios demo para CEN Bachillerato.
 * Uso: npx tsx scripts/create-demo-users.ts
 *
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 * Es idempotente: re-ejecutar no duplica datos.
 */
import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

// ============================================================
// Constantes exportadas (puras, sin efectos laterales)
// ============================================================

export const DEMO_ESCUELA = {
  nombre: "Escuela Demo CEN Bachillerato",
  cct: "DEMO-001",
  subsistema: "particular" as const,
};

export const DEMO_GRUPO = {
  nombre: "Grupo 1A Demo",
  semestre: 1,
};

// Configurable vía DEMO_SEED_PASSWORD (.env.local) para no depender de un
// literal fijo commiteado en el repo; si no se define, usa el valor por
// defecto documentado en docs/DEMO-USERS.md.
export const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD ?? "Demo2026!";

const NOMBRES_ALUMNOS = [
  "Alumno Uno", "Alumno Dos", "Alumno Tres", "Alumno Cuatro", "Alumno Cinco",
  "Alumno Seis", "Alumno Siete", "Alumno Ocho", "Alumno Nueve", "Alumno Diez",
];

export interface DemoUser {
  email: string;
  password: string;
  role: "admin" | "teacher" | "student";
  full_name: string;
  semestre?: number;
}

/** Función pura: construye la lista de usuarios demo sin efectos laterales */
export function buildDemoUsers(): DemoUser[] {
  return [
    { email: "admin@cenbachillerato-demo.com",   password: DEMO_PASSWORD, role: "admin",   full_name: "Admin Demo"   },
    { email: "docente@cenbachillerato-demo.com", password: DEMO_PASSWORD, role: "teacher", full_name: "Docente Demo" },
    ...NOMBRES_ALUMNOS.map((full_name, i) => ({
      email: `alumno${i + 1}@cenbachillerato-demo.com`,
      password: DEMO_PASSWORD,
      role: "student" as const,
      full_name,
      semestre: 1,
    })),
  ];
}

/** Valida que un email tiene formato correcto */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================================
// Lógica de creación (requiere cliente Supabase)
// ============================================================

export interface ResultRow {
  email: string;
  password: string;
  role: string;
  nombre: string;
  estado: string;
}

async function getOrCreateEscuela(sb: SupabaseClient<Database>): Promise<string> {
  const { data: existing } = await sb.from("escuelas").select("id").eq("cct", DEMO_ESCUELA.cct).single();
  if (existing) { console.log(`  ↩  Escuela ya existe (id=${existing.id})`); return existing.id; }

  const { data, error } = await sb
    .from("escuelas")
    .insert({ nombre: DEMO_ESCUELA.nombre, cct: DEMO_ESCUELA.cct, subsistema: DEMO_ESCUELA.subsistema })
    .select("id").single();

  if (error || !data) throw new Error(`Error creando escuela: ${error?.message}`);
  console.log(`  ✓  Escuela creada (id=${data.id})`);
  return data.id;
}

async function getOrCreateGrupo(sb: SupabaseClient<Database>, escuelaId: string): Promise<string> {
  const { data: existing } = await sb
    .from("grupos").select("id").eq("nombre", DEMO_GRUPO.nombre).eq("escuela_id", escuelaId).single();
  if (existing) { console.log(`  ↩  Grupo ya existe (id=${existing.id})`); return existing.id; }

  const { data, error } = await sb
    .from("grupos")
    .insert({ nombre: DEMO_GRUPO.nombre, semestre: DEMO_GRUPO.semestre, escuela_id: escuelaId })
    .select("id").single();

  if (error || !data) throw new Error(`Error creando grupo: ${error?.message}`);
  console.log(`  ✓  Grupo creado (id=${data.id})`);
  return data.id;
}

async function getOrCreateUser(
  sb: SupabaseClient<Database>,
  user: DemoUser,
  escuelaId: string,
  grupoId: string
): Promise<{ id: string; created: boolean }> {
  const { data, error } = await sb.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.full_name, role: user.role, escuela_id: escuelaId, semestre: user.semestre ?? null },
  });

  if (error) {
    // Usuario ya existe
    const msg = error.message.toLowerCase();
    if (msg.includes("already") || msg.includes("422") || msg.includes("exists")) {
      const { data: list } = await sb.auth.admin.listUsers();
      const existing = list?.users.find((u) => u.email === user.email);
      if (existing) return { id: existing.id, created: false };
    }
    throw new Error(`Error creando ${user.email}: ${error.message}`);
  }

  const userId = data.user.id;

  if (user.role === "teacher") {
    await sb.from("grupos").update({ id_docente: userId }).eq("id", grupoId);
  }
  if (user.role === "student") {
    await sb.from("alumnos_grupos")
      .upsert({ id_alumno: userId, id_grupo: grupoId }, { onConflict: "id_alumno,id_grupo" });
  }

  return { id: userId, created: true };
}

export async function runCreateDemoUsers(sb: SupabaseClient<Database>): Promise<ResultRow[]> {
  console.log("\n🚀 CEN Bachillerato — Creando usuarios demo\n");

  console.log("1. Escuela demo:");
  const escuelaId = await getOrCreateEscuela(sb);

  console.log("\n2. Grupo demo:");
  const grupoId = await getOrCreateGrupo(sb, escuelaId);

  console.log("\n3. Usuarios:");
  const results: ResultRow[] = [];

  for (const user of buildDemoUsers()) {
    process.stdout.write(`  → ${user.email} (${user.role})... `);
    try {
      const { created } = await getOrCreateUser(sb, user, escuelaId, grupoId);
      const estado = created ? "CREADO" : "YA EXISTÍA";
      console.log(estado);
      results.push({ email: user.email, password: user.password, role: user.role, nombre: user.full_name, estado });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`ERROR: ${msg}`);
      results.push({ email: user.email, password: user.password, role: user.role, nombre: user.full_name, estado: `ERROR: ${msg}` });
    }
  }

  return results;
}

// ============================================================
// Entry point — solo cuando se ejecuta directamente
// ============================================================

if (process.env.NODE_ENV !== "test" && process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  config({ path: resolve(process.cwd(), ".env.local") });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("ERROR: Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }

  const sb = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  runCreateDemoUsers(sb).then((results) => {
    console.log("\n" + "=".repeat(95));
    console.log("RESUMEN");
    console.log("=".repeat(95));
    console.log("Email".padEnd(45) + "Role".padEnd(10) + "Nombre".padEnd(18) + "Estado");
    console.log("-".repeat(95));
    for (const r of results) {
      console.log(r.email.padEnd(45) + r.role.padEnd(10) + r.nombre.padEnd(18) + r.estado);
    }
    console.log("\nPassword para todos: " + DEMO_PASSWORD);
    console.log("=".repeat(95) + "\n");
    process.exit(0);
  }).catch((err) => {
    console.error("\nERROR FATAL:", err);
    process.exit(1);
  });
}
