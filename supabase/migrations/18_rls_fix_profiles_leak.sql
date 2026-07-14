-- ============================================================
-- 18_rls_fix_profiles_leak.sql
-- CRÍTICO: cierra una fuga de PII entre escuelas en 'profiles' encontrada en
-- la auditoría GOLD 2026-07-13 (docs/diagnostico/AUDITORIA-GOLD-2026-07-13.md).
--
-- Contexto del bug:
-- La migración 12 agregó la policy "teacher can read profiles of own
-- students" con esta rama:
--
--   public.get_my_role() IN ('admin', 'super_admin')   -- SIN escuela_id
--   OR id = auth.uid()
--   OR (... docente acotado a sus grupos, correcto ...)
--
-- Postgres evalúa TODAS las policies PERMISSIVE de una tabla con OR, así que
-- esta rama por sí sola le daba a CUALQUIER admin de CUALQUIER escuela SELECT
-- sin restricción sobre 'profiles' completa (nombre, correo, rol, semestre,
-- escuela de TODOS los alumnos y personal de TODAS las escuelas), sin
-- necesidad de service_role — alcanza con el anon key + el JWT de un admin.
-- Es el mismo patrón que ya se corrigió para 'intentos' en la migración 14,
-- pero nunca se corrigió aquí.
--
-- Además, la policy separada "admin can read profiles in their escuela"
-- (01_schema_inicial.sql) estaba correctamente acotada para admin, pero rota
-- para super_admin: su escuela_id es NULL, y `NULL = get_my_escuela_id()`
-- (que también da NULL) nunca evalúa TRUE en SQL. Mismo bug que ya se
-- corrigió en 'grupos' (migración 15) e 'intentos' (migración 14).
--
-- Esta migración corrige ambas policies con el mismo patrón ya establecido:
--   - admin: acotado a escuela_id = get_my_escuela_id()
--   - super_admin: rama explícita, visión global
--   - docente: SOLO perfiles de alumnos en SUS grupos (sin tocar, ya correcto)
--   - cualquier usuario: su propio perfil (sin tocar, ya correcto)
--
-- Idempotente: DROP POLICY IF EXISTS + CREATE. Seguro de re-ejecutar.
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor.
-- ============================================================

-- ── "admin can read profiles in their escuela" (01_schema_inicial.sql) ────
-- Fix: super_admin con rama explícita de visión global.
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

-- ── "teacher can read profiles of own students" (migración 12) ────────────
-- Fix: se elimina la rama admin/super_admin sin escoping (era el hueco). La
-- visibilidad de admin/super_admin ya la cubre la policy anterior, evaluada
-- en OR con esta — no se pierde ningún acceso legítimo.
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

-- ============================================================
-- Verificación post-migración (ejecutar como un admin de UNA escuela,
-- NO en SQL Editor con service_role):
--   -- Debe devolver 0: un admin no debe ver perfiles de otra escuela.
--   SELECT COUNT(*) FROM profiles
--     WHERE escuela_id IS DISTINCT FROM (
--       SELECT escuela_id FROM profiles WHERE id = auth.uid()
--     );
--
-- Ejecutar como super_admin: debe seguir devolviendo TODOS los perfiles.
--   SELECT COUNT(*) FROM profiles;
-- ============================================================
