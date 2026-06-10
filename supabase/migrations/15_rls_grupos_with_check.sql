-- ============================================================
-- 15_rls_grupos_with_check.sql
-- Endurece las policies de 'grupos': WITH CHECK explícito + super_admin global.
--
-- Contexto:
-- 1) La policy "admin can manage grupos" (01_schema_inicial.sql) era FOR ALL con
--    USING pero SIN WITH CHECK. En Postgres, omitir WITH CHECK hace que se use
--    la expresión USING también como verificación de filas nuevas (INSERT/UPDATE),
--    así que el aislamiento por escuela YA estaba (no era un hueco). Aquí lo
--    hacemos EXPLÍCITO para auditoría/licitación: un revisor no debe depender de
--    esa regla implícita.
-- 2) Bug real corregido: la condición original `escuela_id = get_my_escuela_id()`
--    bloqueaba al super_admin (cuyo escuela_id es NULL ⇒ la comparación nunca es
--    verdadera). El super_admin (operador de la plataforma) debe poder gestionar
--    grupos de cualquier escuela. Mismo patrón de roles que migración 14.
--
-- Idempotente: DROP IF EXISTS + CREATE. Seguro de re-ejecutar.
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor.
-- ============================================================

-- ── SELECT: admin/teacher leen grupos de su escuela; super_admin, todos ──
DROP POLICY IF EXISTS "admin/teacher can read grupos" ON public.grupos;

CREATE POLICY "admin/teacher can read grupos"
  ON public.grupos FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() IN ('teacher', 'admin')
      AND escuela_id = public.get_my_escuela_id()
    )
  );

-- ── ALL (insert/update/delete): admin gestiona SU escuela; super_admin, todo ──
DROP POLICY IF EXISTS "admin can manage grupos" ON public.grupos;

CREATE POLICY "admin can manage grupos"
  ON public.grupos FOR ALL TO authenticated
  USING (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'admin'
      AND escuela_id = public.get_my_escuela_id()
    )
  )
  WITH CHECK (
    public.get_my_role() = 'super_admin'
    OR (
      public.get_my_role() = 'admin'
      AND escuela_id = public.get_my_escuela_id()
    )
  );
