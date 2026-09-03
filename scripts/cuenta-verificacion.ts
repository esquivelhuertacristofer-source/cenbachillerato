/**
 * Crea (o borra) UNA cuenta de alumno para que una persona verifique el hub a
 * mano en producción.
 *
 * ⚠️ ESCRIBE en el Auth y en `profiles` del proyecto Supabase (PROD).
 *
 * Datos de MENORES: la cuenta NO se mezcla con escuelas reales — cuelga de la
 * misma escuela sandbox etiquetada que usa la jornada de carga
 * (`ZZZ Carga Sintética — NO ES ESCUELA REAL`, CCT `LOADTEST-000`), así que es
 * identificable y borrable de un tirón sin tocar datos de nadie.
 *
 * Por qué `role: "student"` y no admin: lo que hay que verificar es lo que ve un
 * alumno (hub, videos, prácticas 3D). Un admin vería otras pantallas y tendría
 * permisos que no hacen falta para esto.
 *
 * `must_change_password` es DEFAULT false (migración 09), así que la cuenta entra
 * directo a /hub sin el redirect forzado a /cambiar-password.
 *
 * Uso:
 *   npx tsx scripts/cuenta-verificacion.ts --crear
 *   npx tsx scripts/cuenta-verificacion.ts --borrar
 *
 * Password: VERIF_PASSWORD del entorno, o el default de abajo.
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const SANDBOX_CCT = "LOADTEST-000";
const SANDBOX_NOMBRE = "ZZZ Carga Sintética — NO ES ESCUELA REAL";

const EMAIL = process.env.VERIF_EMAIL ?? "verificacion@loadtest.cen.local";
const PASSWORD = process.env.VERIF_PASSWORD ?? "Verificacion-CEN-2026!";
const SEMESTRE = 1;

type SB = SupabaseClient<Database>;

function getServiceClient(): SB {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  }
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getOrCreateEscuela(sb: SB): Promise<string> {
  const { data: existing } = await sb
    .from("escuelas")
    .select("id")
    .eq("cct", SANDBOX_CCT)
    .maybeSingle();
  if (existing) return existing.id;
  // "otro" es el único valor del CHECK escuelas_subsistema_check que aplica a una
  // escuela ficticia; la etiqueta de sandbox va en nombre + CCT.
  const { data, error } = await sb
    .from("escuelas")
    .insert({ nombre: SANDBOX_NOMBRE, cct: SANDBOX_CCT, subsistema: "otro" })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Error creando escuela sandbox: ${error?.message}`);
  return data.id;
}

/** Busca el user de auth por email paginando la lista de admin. */
async function buscarUsuario(sb: SB): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    const u = data.users.find((x) => x.email === EMAIL);
    if (u) return u.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function crear(sb: SB) {
  const escuelaId = await getOrCreateEscuela(sb);

  let userId = await buscarUsuario(sb);
  if (userId) {
    // Ya existía (re-corrida): re-fija la contraseña para que el usuario no
    // dependa de recordar la de la corrida anterior.
    const { error } = await sb.auth.admin.updateUserById(userId, { password: PASSWORD });
    if (error) throw new Error(`updateUserById: ${error.message}`);
    console.log("• La cuenta ya existía — contraseña re-fijada.");
  } else {
    const { data, error } = await sb.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true, // sin esto la cuenta queda pendiente de confirmar y no puede entrar
      user_metadata: {
        full_name: "Cuenta de verificación",
        role: "student",
        escuela_id: escuelaId,
        semestre: SEMESTRE,
      },
    });
    if (error || !data.user) throw new Error(`createUser: ${error?.message}`);
    userId = data.user.id;
    console.log("• Cuenta de Auth creada.");
  }

  const { error: perr } = await sb.from("profiles").upsert(
    {
      id: userId,
      email: EMAIL,
      full_name: "Cuenta de verificación",
      role: "student",
      escuela_id: escuelaId,
      semestre: SEMESTRE,
      area_eleccion: null,
    },
    { onConflict: "id" }
  );
  if (perr) throw new Error(`upsert profile: ${perr.message}`);

  const { data: prof } = await sb
    .from("profiles")
    .select("id, email, role, semestre, must_change_password, escuela_id")
    .eq("id", userId)
    .maybeSingle();

  console.log("\n=== CUENTA LISTA ===");
  console.log(`email:    ${EMAIL}`);
  console.log(`password: ${PASSWORD}`);
  console.log(`profile:  ${JSON.stringify(prof)}`);
  console.log("\nBorrarla después:  npx tsx scripts/cuenta-verificacion.ts --borrar");
}

async function borrar(sb: SB) {
  const userId = await buscarUsuario(sb);
  if (!userId) {
    console.log("No existe esa cuenta — nada que borrar.");
    return;
  }
  // El profile cae solo por ON DELETE CASCADE de profiles.id → auth.users(id).
  const { error } = await sb.auth.admin.deleteUser(userId);
  if (error) throw new Error(`deleteUser: ${error.message}`);
  const { data: quedan } = await sb.from("profiles").select("id").eq("id", userId).maybeSingle();
  console.log(`Cuenta borrada. Profile residual: ${quedan ? "SÍ (revisar)" : "no"}`);
}

async function main() {
  const sb = getServiceClient();
  if (process.argv.includes("--borrar")) return borrar(sb);
  if (process.argv.includes("--crear")) return crear(sb);
  console.log("Usa --crear o --borrar");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
