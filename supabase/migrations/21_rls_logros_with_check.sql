-- ============================================================================
-- Migración 21: WITH CHECK explícito en logros_admin_only_write
-- ============================================================================
--
-- HALLAZGO (docs/diagnostico/AUDITORIA-GOLD-2026-07-13.md):
--
--   CREATE POLICY "logros_admin_only_write"
--     ON public.logros FOR ALL
--     USING ( ... admin/super_admin ... );
--
-- La policy (13a_logros.sql, antes 13_logros.sql) es FOR ALL con USING pero
-- sin WITH CHECK explícito. Postgres reutiliza el USING como WITH CHECK
-- implícito en este caso, así que no hay fuga funcional — pero depender de
-- ese comportamiento implícito es frágil (p. ej. si alguien reescribe la
-- policy a futuro separando ramas, o audita el catálogo de policies
-- buscando WITH CHECK explícito y asume que su ausencia es un bug real).
--
-- FIX: mismo criterio que USING, declarado explícitamente en WITH CHECK.
-- No cambia el comportamiento actual, solo lo hace explícito y auditable.
--
-- Esta migración es idempotente (DROP POLICY IF EXISTS + CREATE POLICY).
--
-- NOTA: archivo de código únicamente. NO aplicar contra la base de datos real
-- de Supabase desde este entorno — lo aplica el usuario manualmente.
-- ============================================================================

DROP POLICY IF EXISTS "logros_admin_only_write" ON public.logros;

CREATE POLICY "logros_admin_only_write"
  ON public.logros FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- Verificación post-migración (ejecutar manualmente en el SQL Editor):
--
--   SELECT policyname, cmd, qual, with_check FROM pg_policies
--   WHERE tablename = 'logros' AND policyname = 'logros_admin_only_write';
--   -- with_check no debe ser NULL.
-- ============================================================================
