-- ============================================================================
-- Migración 21: WITH CHECK explícito en logros_admin_only_write
-- ============================================================================
--
-- ⚠ ADEMÁS SUPERADA POR LA MIGRACIÓN 22 — la 22 elimina las tablas
-- public.logros / public.logros_alumno por completo (se retiró el sistema de
-- logros del producto), lo que vuelve moot cualquier policy sobre ellas. Si ya
-- aplicaste la 22, esta migración (y la 20 en lo referente a logros) no tienen
-- nada sobre qué operar.
--
-- ⚠ SUPERADA POR LA MIGRACIÓN 20 — NO APLICAR SI YA APLICASTE LA 20.
--
-- La migración 20 (20_rls_restringir_escritura_contenido_global.sql) borra
-- "logros_admin_only_write" y crea "logros_super_admin_only_write" (solo
-- super_admin, con WITH CHECK explícito ya incluido). Si esta migración 21 se
-- aplica DESPUÉS de la 20, el DROP POLICY IF EXISTS no encuentra nada que
-- borrar (20 ya renombró la policy) pero el CREATE POLICY de abajo sí corre,
-- recreando "logros_admin_only_write" con la lógica amplia original
-- (admin OR super_admin). Quedarían DOS policies PERMISSIVE activas sobre
-- logros a la vez, y Postgres las combina con OR — es decir, revive el acceso
-- de admin escolar que la 20 acababa de cerrar.
--
-- La 20 ya cubre todo lo que esta migración buscaba (WITH CHECK explícito) y
-- de forma más estricta. Trátala como no-op: no hace falta aplicarla.
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
