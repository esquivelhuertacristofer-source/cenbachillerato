'use server';

import Papa from 'papaparse';
import { getUser, getProfile } from '@/lib/supabase-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { FilaCSVSchema, type FilaCSV, type ErrorAlta, type Credencial, type ResultadoAlta } from '@/lib/schemas/alta-masiva.schema';
import { generarEmailBase, resolverEmailUnico, generarPassword } from '@/lib/email-generator';

export async function procesarAltaMasiva(csvText: string): Promise<ResultadoAlta | { error: string }> {
  // ── Auth: solo admin/super_admin ────────────────────────────────────────────
  const user = await getUser();
  if (!user) return { error: 'No autorizado' };

  const profile = await getProfile(user.id);
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return { error: 'Solo administradores pueden hacer alta masiva' };
  }

  const escuelaId = (profile as Record<string, unknown>).escuela_id as string | null;
  if (!escuelaId) {
    return { error: 'Tu perfil no tiene escuela asignada. Contacta a un super_admin.' };
  }

  // ── 1. Parsear CSV ─────────────────────────────────────────────────────────
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.data.length === 0) {
    return { error: 'El archivo CSV está vacío o no tiene filas de datos' };
  }

  if (parsed.data.length > 5000) {
    return { error: 'Máximo 5 000 filas por carga' };
  }

  // ── 2. Validar todas las filas con Zod ────────────────────────────────────
  const errores: ErrorAlta[] = [];
  const filasValidas: Array<{ fila: number; data: FilaCSV }> = [];

  parsed.data.forEach((row, idx) => {
    const result = FilaCSVSchema.safeParse(row);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        errores.push({
          fila: idx + 2, // +2: header + 1-based
          columna: issue.path.join('.') || undefined,
          mensaje: issue.message,
        });
      });
    } else {
      filasValidas.push({ fila: idx + 2, data: result.data });
    }
  });

  // ── 3. Abortar si hay errores de validación (transacción atómica) ──────────
  if (errores.length > 0) {
    return {
      total_filas: parsed.data.length,
      docentes_creados: 0,
      alumnos_creados: 0,
      grupos_creados: 0,
      ya_existentes: 0,
      errores,
      credenciales: [],
    };
  }

  // ── 4. Orden crítico: docentes primero, alumnos después ───────────────────
  filasValidas.sort((a, b) => {
    if (a.data.rol === 'docente' && b.data.rol === 'alumno') return -1;
    if (a.data.rol === 'alumno' && b.data.rol === 'docente') return 1;
    return 0;
  });

  const sbAdmin = getSupabaseAdmin();

  // ── 5. Pre-cargar emails existentes (batch, O(1) por usuario) ─────────────
  const { data: profilesExistentes } = await sbAdmin
    .from('profiles')
    .select('email')
    .like('email', '%@cenbachillerato.mx');

  const existingEmails = new Set<string>(
    (profilesExistentes ?? []).map((p: { email: string }) => p.email)
  );

  // ── 6. Crear grupos faltantes ─────────────────────────────────────────────
  const gruposNombresUnicos = [...new Set(filasValidas.map((f) => f.data.grupo_nombre))];

  const { data: gruposExistentes } = await sbAdmin
    .from('grupos')
    .select('nombre, id, semestre')
    .eq('escuela_id', escuelaId)
    .in('nombre', gruposNombresUnicos);

  const gruposMap = new Map<string, { id: string; semestre: number }>(
    (gruposExistentes ?? []).map((g: { nombre: string; id: string; semestre: number }) => [g.nombre, g])
  );

  const gruposACrear: Array<{ nombre: string; semestre: number; escuela_id: string }> = [];
  for (const nombre of gruposNombresUnicos) {
    if (!gruposMap.has(nombre)) {
      const alumnoEjemplo = filasValidas.find(
        (f) => f.data.grupo_nombre === nombre && f.data.rol === 'alumno'
      );
      if (alumnoEjemplo?.data.semestre !== undefined) {
        gruposACrear.push({ nombre, semestre: alumnoEjemplo.data.semestre, escuela_id: escuelaId });
      }
    }
  }

  if (gruposACrear.length > 0) {
    const { data: nuevosGrupos } = await sbAdmin
      .from('grupos')
      .insert(gruposACrear)
      .select('nombre, id, semestre');

    (nuevosGrupos ?? []).forEach((g: { nombre: string; id: string; semestre: number }) =>
      gruposMap.set(g.nombre, g)
    );
  }

  // ── 7. Crear usuarios ─────────────────────────────────────────────────────
  const credenciales: Credencial[] = [];
  const emailsEnEsteLote = new Set<string>();
  const erroresCreacion: ErrorAlta[] = [];
  let docentesCreados = 0;
  let alumnosCreados = 0;
  let yaExistentes = 0;

  for (const { fila, data } of filasValidas) {
    // Idempotencia: si el email base ya existe, omitir esta persona
    const emailBase = generarEmailBase(data.nombre, data.apellido_paterno);
    if (existingEmails.has(emailBase)) {
      yaExistentes++;
      continue;
    }

    let email: string;
    try {
      email = resolverEmailUnico(
        data.nombre,
        data.apellido_paterno,
        data.apellido_materno,
        existingEmails,
        emailsEnEsteLote
      );
    } catch (err: unknown) {
      erroresCreacion.push({
        fila,
        mensaje: err instanceof Error ? err.message : 'Error generando email único',
      });
      continue;
    }

    const password = generarPassword();
    const fullName = `${data.nombre} ${data.apellido_paterno} ${data.apellido_materno}`.trim();
    const role = data.rol === 'docente' ? 'teacher' : 'student';
    const grupo = gruposMap.get(data.grupo_nombre);

    const { data: authData, error: authError } = await sbAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
        escuela_id: escuelaId,
        semestre: data.rol === 'alumno' ? (data.semestre ?? null) : null,
        must_change_password: true,
      },
    });

    if (authError || !authData?.user) {
      erroresCreacion.push({
        fila,
        mensaje: `Error creando usuario: ${authError?.message ?? 'respuesta vacía'}`,
      });
      continue;
    }

    const newUserId = authData.user.id;

    // Marcar email como usado en el lote
    emailsEnEsteLote.add(email);

    // Asignar alumno a grupo
    if (data.rol === 'alumno' && grupo) {
      await sbAdmin.from('alumnos_grupos').insert({
        id_alumno: newUserId,
        id_grupo: grupo.id,
      });
    }

    // Asignar docente al grupo (primer docente asignado gana)
    if (data.rol === 'docente' && grupo) {
      await sbAdmin
        .from('grupos')
        .update({ id_docente: newUserId })
        .eq('id', grupo.id)
        .is('id_docente', null); // no sobreescribir si ya tiene docente
    }

    credenciales.push({
      nombre_completo: fullName,
      rol: data.rol,
      grupo: data.grupo_nombre,
      email,
      password_inicial: password,
    });

    if (data.rol === 'docente') docentesCreados++;
    else alumnosCreados++;
  }

  return {
    total_filas: parsed.data.length,
    docentes_creados: docentesCreados,
    alumnos_creados: alumnosCreados,
    grupos_creados: gruposACrear.length,
    ya_existentes: yaExistentes,
    errores: erroresCreacion,
    credenciales,
  };
}
