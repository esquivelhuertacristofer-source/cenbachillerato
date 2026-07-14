-- ============================================================================
-- Migración 19: Fix de fuga multi-tenant en RLS de alumnos_grupos
-- ============================================================================
--
-- BUG (introducido en 11_rls_docente_alumnos_grupos.sql):
--
--   CREATE POLICY "teacher can read alumnos_grupos in own groups"
--     ON public.alumnos_grupos FOR SELECT TO authenticated
--     USING (
--       public.get_my_role() IN ('admin', 'super_admin')   -- ← sin escuela_id
--       OR ( ... rama de teacher, correctamente acotada ... )
--     );
--
-- La rama de 'admin' no filtra por escuela. Un admin de la Escuela A puede
-- leer (SELECT) las filas de alumnos_grupos de CUALQUIER escuela, exponiendo
-- qué alumno está en qué grupo en instituciones ajenas. Mismo patrón de bug
-- ya corregido para grupos (15_rls_grupos_with_check.sql), intentos
-- (14_rls_admin_intentos_escuela.sql) y profiles (18_rls_fix_profiles_leak.sql).
--
-- FIX: separar en tres ramas explícitas, igual que en las migraciones 14/15/18:
--   - super_admin: acceso global sin restricción (correcto, es multi-escuela).
--   - admin: acotado a su propia escuela. alumnos_grupos no tiene columna
--     escuela_id directa (ver 01_schema_inicial.sql), así que se resuelve vía
--     join a grupos.escuela_id (el mismo grupo referenciado por id_grupo).
--   - teacher: sin cambios, ya estaba correctamente acotado a sus propios
--     grupos (g.id_docente = auth.uid()).
--
-- Esta migración es idempotente (DROP POLICY IF EXISTS + CREATE POLICY) y
-- solo toca la policy de SELECT; no modifica INSERT/UPDATE/DELETE de
-- alumnos_grupos (fuera del alcance de este bug).
--
-- NOTA: archivo de código únicamente. NO aplicar contra la base de datos real
-- de Supabase desde este entorno — lo aplica el usuario manualmente.
-- ============================================================================

DROP POLICY IF EXISTS "teacher can read alumnos_grupos in own groups" ON public.alumnos_grupos;
DROP POLICY IF EXISTS "teacher/admin can read alumnos_grupos in their escuela" ON public.alumnos_grupos;

CREATE POLICY "teacher/admin can read alumnos_grupos in their escuela"
  ON public.alumnos_grupos FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'admin'
      AND EXISTS (
        SELECT 1 FROM public.grupos g
        WHERE g.id = alumnos_grupos.id_grupo
          AND g.escuela_id = public.get_my_escuela_id()
      )
    )
    OR (
      public.get_my_role() = 'teacher'
      AND EXISTS (
        SELECT 1 FROM public.grupos g
        WHERE g.id = alumnos_grupos.id_grupo
          AND g.id_docente = auth.uid()
      )
    )
  );

-- ============================================================================
-- Verificación post-migración (ejecutar manualmente en el SQL Editor):
--
--   -- 1. Debe existir exactamente una policy de SELECT en alumnos_grupos:
--   SELECT policyname, cmd FROM pg_policies
--   WHERE tablename = 'alumnos_grupos' AND cmd = 'SELECT';
--
--   -- 2. Como admin de la Escuela A, este SELECT no debe devolver filas de
--   --    alumnos_grupos cuyo grupo pertenezca a otra escuela:
--   SELECT ag.* FROM alumnos_grupos ag
--   JOIN grupos g ON g.id = ag.id_grupo
--   WHERE g.escuela_id <> '<escuela_id del admin de prueba>';
--   -- (debe devolver 0 filas cuando se ejecuta autenticado como ese admin)
-- ============================================================================
