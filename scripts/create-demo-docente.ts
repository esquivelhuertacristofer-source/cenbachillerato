/**
 * create-demo-docente.ts
 * Crea una cuenta demo para el rol docente en CEN Bachillerato.
 *
 * Crea:
 *   - Usuario en auth.users con email/password
 *   - Profile con role='teacher'
 *   - Asignación como id_docente en 2 grupos demo del semestre 4 y 5
 *     (si existen grupos sin docente; de lo contrario solo crea el usuario)
 *
 * Uso: npx tsx scripts/create-demo-docente.ts
 * NO ejecutar en producción con datos reales.
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

const DEMO_EMAIL = "docente-demo@cenbachillerato-demo.com";
const DEMO_PASSWORD = "Demo2026!";
const DEMO_NOMBRE = "Prof. Demo Bachillerato";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const sb = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("\n👤  Creando cuenta demo docente...\n");

  // 1. Verificar si el usuario ya existe
  const { data: existing } = await sb
    .from("profiles")
    .select("id, email, role")
    .eq("email", DEMO_EMAIL)
    .maybeSingle();

  if (existing) {
    console.log(`✓  Usuario ya existe: ${existing.email} (${existing.role})`);
    console.log(`   ID: ${existing.id}`);
    await asignarGrupos(sb, existing.id);
    return;
  }

  // 2. Crear usuario en auth
  const { data: authData, error: authErr } = await sb.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: DEMO_NOMBRE,
      role: "teacher",
    },
  });

  if (authErr || !authData.user) {
    console.error("❌ Error creando usuario en auth:", authErr?.message);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log(`✓  Usuario auth creado: ${DEMO_EMAIL}`);
  console.log(`   ID: ${userId}`);

  // 3. Upsert profile con role=teacher
  const { error: profileErr } = await sb.from("profiles").upsert({
    id: userId,
    email: DEMO_EMAIL,
    full_name: DEMO_NOMBRE,
    role: "teacher",
  });

  if (profileErr) {
    console.error("❌ Error creando profile:", profileErr.message);
    process.exit(1);
  }

  console.log(`✓  Profile creado: role=teacher`);

  // 4. Asignar grupos demo
  await asignarGrupos(sb, userId);

  console.log("\n═══════════════════════════════════════════");
  console.log("✅ Cuenta demo docente lista");
  console.log(`   Email:    ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log(`   Role:     teacher`);
  console.log("═══════════════════════════════════════════\n");
}

async function asignarGrupos(
  sb: ReturnType<typeof createClient<Database>>,
  docenteId: string
) {
  // Buscar grupos sin docente asignado, preferir semestres 4, 5, 6
  const { data: gruposSinDocente } = await sb
    .from("grupos")
    .select("id, nombre, semestre")
    .is("id_docente", null)
    .in("semestre", [4, 5, 6])
    .order("semestre")
    .limit(3);

  if (!gruposSinDocente || gruposSinDocente.length === 0) {
    // Intentar con cualquier semestre
    const { data: cualquierGrupo } = await sb
      .from("grupos")
      .select("id, nombre, semestre")
      .is("id_docente", null)
      .order("semestre")
      .limit(2);

    if (!cualquierGrupo || cualquierGrupo.length === 0) {
      console.log("  ⚠  No hay grupos sin docente disponibles para asignar.");
      console.log("     Asignar manualmente en /admin/escuelas");
      return;
    }

    for (const grupo of cualquierGrupo) {
      await asignarUnGrupo(sb, docenteId, grupo);
    }
    return;
  }

  // Tomar hasta 3 grupos (uno de sem 4, uno de sem 5, uno de sem 6 si existen)
  const asignados = new Set<number>();
  const seleccion = gruposSinDocente.filter((g) => {
    if (asignados.has(g.semestre)) return false;
    asignados.add(g.semestre);
    return true;
  });

  for (const grupo of seleccion) {
    await asignarUnGrupo(sb, docenteId, grupo);
  }
}

async function asignarUnGrupo(
  sb: ReturnType<typeof createClient<Database>>,
  docenteId: string,
  grupo: { id: string; nombre: string; semestre: number }
) {
  const { error } = await sb
    .from("grupos")
    .update({ id_docente: docenteId })
    .eq("id", grupo.id);

  if (error) {
    console.log(`  ⚠  No se pudo asignar grupo ${grupo.nombre}: ${error.message}`);
  } else {
    console.log(`✓  Asignado a grupo: ${grupo.nombre} (sem ${grupo.semestre})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
