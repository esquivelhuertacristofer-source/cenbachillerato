-- ============================================================================
-- MIGRACIONES PENDIENTES EN PRODUCCIÓN — comprobado el 2026-10-06 con una sonda
-- de solo lectura (scripts/tmp-sonda-migraciones.ts):
--
--   18  RLS profiles        → el admin demo ve 15 perfiles de OTRAS escuelas
--   19  RLS alumnos_grupos  → el admin demo ve 9 de 36 filas de otras escuelas
--   20  escritura de contenido global solo para super_admin
--   23  RPC resumen_stats_alumno (+ columna duracion_estimada_minutos);
--       sin ella /hub/progreso deja un 404 en la consola en cada visita
--
-- CÓMO: Supabase → SQL Editor → pegar TODO este archivo → Run.
-- Es idempotente (DROP ... IF EXISTS / CREATE OR REPLACE / ADD COLUMN IF NOT
-- EXISTS) y va en una sola transacción: o entra todo o no entra nada.
-- La 21 se omite a propósito (la sustituyen la 20 y la 22).
-- La 22 (borrar las tablas logros/logros_alumno, sin uso en el código; logros
-- tiene 12 filas de catálogo) va al final COMENTADA: solo si quieres borrarlas.
-- ============================================================================

BEGIN;

-- ───────────── 18_rls_fix_profiles_leak.sql ─────────────
DROP POLICY IF EXISTS "admin can read profiles in their escuela" ON public.profiles;
CREATE POLICY "admin can read profiles in their escuela"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'admin'
      AND escuela_id = public.get_my_escuela_id()
    )
  );
DROP POLICY IF EXISTS "teacher can read profiles of own students" ON public.profiles;
CREATE POLICY "teacher can read profiles of own students"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR (
      public.get_my_role() = 'teacher'
      AND EXISTS (
        SELECT 1
        FROM public.alumnos_grupos ag
        JOIN public.grupos g ON g.id = ag.id_grupo
        WHERE ag.id_alumno = profiles.id
          AND g.id_docente = auth.uid()
      )
    )
  );

-- ───────────── 19_rls_fix_alumnos_grupos_leak.sql ─────────────
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

-- ───────────── 20_rls_restringir_escritura_contenido_global.sql ─────────────
DROP POLICY IF EXISTS "admin can manage actividades" ON public.actividades;
CREATE POLICY "super_admin can manage actividades"
  ON public.actividades FOR ALL TO authenticated
  USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS "fichas_admin_only_write" ON public.fichas_biblioteca;
CREATE POLICY "fichas_super_admin_only_write"
  ON public.fichas_biblioteca FOR ALL TO authenticated
  USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS "logros_admin_only_write" ON public.logros;
CREATE POLICY "logros_super_admin_only_write"
  ON public.logros FOR ALL TO authenticated
  USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS "admin_gestiona_planteamiento" ON public.planteamiento_progresiones;
CREATE POLICY "super_admin_gestiona_planteamiento"
  ON public.planteamiento_progresiones FOR ALL TO authenticated
  USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');

-- ───────────── 23_rpc_resumen_stats_alumno.sql ─────────────
ALTER TABLE public.actividades
  ADD COLUMN IF NOT EXISTS duracion_estimada_minutos int;
COMMENT ON COLUMN public.actividades.duracion_estimada_minutos IS
  'Minutos estimados de la actividad; NULL ⇒ se asume 5 (stats de progreso del alumno).';
CREATE OR REPLACE FUNCTION public.resumen_stats_alumno()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $fn$
  WITH base AS (
    SELECT
      i.completed_at,
      COALESCE(a.duracion_estimada_minutos, 5) AS minutos,
      a.tipo_codigo,
      u.codigo AS uac_codigo,
      u.nombre AS uac_nombre
    FROM public.intentos i
    JOIN public.actividades a ON a.id = i.actividad_id
    LEFT JOIN public.progresiones p ON p.id = a.progresion_id
    LEFT JOIN public.uac u ON u.id = p.uac_id
    WHERE i.user_id = auth.uid()
      AND i.status = 'completed'
      AND i.completed_at IS NOT NULL
  ),
  tipos AS (
    SELECT b.tipo_codigo, COUNT(*)::int AS cantidad, MAX(b.completed_at) AS ultimo
    FROM base b
    GROUP BY b.tipo_codigo
    ORDER BY COUNT(*) DESC, MAX(b.completed_at) DESC
    LIMIT 5
  ),
  materia AS (
    SELECT b.uac_nombre AS nombre, COUNT(*)::int AS cantidad
    FROM base b
    WHERE b.uac_codigo IS NOT NULL
    GROUP BY b.uac_codigo, b.uac_nombre
    ORDER BY COUNT(*) DESC, MAX(b.completed_at) DESC
    LIMIT 1
  )
  SELECT jsonb_build_object(
    'totalActividades', (SELECT COUNT(*)::int FROM base),
    'totalMinutos',     (SELECT COALESCE(SUM(b.minutos), 0)::int FROM base b),
    'materiaMasFuerte', (SELECT jsonb_build_object('nombre', m.nombre, 'cantidad', m.cantidad) FROM materia m),
    'tipoActividades',  COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('tipo', t.tipo_codigo, 'cantidad', t.cantidad)
                        ORDER BY t.cantidad DESC, t.ultimo DESC)
       FROM tipos t),
      '[]'::jsonb
    )
  );
$fn$;
REVOKE ALL ON FUNCTION public.resumen_stats_alumno() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resumen_stats_alumno() TO authenticated;

COMMIT;

-- ───────────── 22_retirar_logros.sql (OPCIONAL, destructiva) ─────────────
-- DROP TABLE IF EXISTS public.logros_alumno;
-- DROP TABLE IF EXISTS public.logros;
