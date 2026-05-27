-- ============================================================
-- 07_fix_tipo_codigo_actividades.sql
-- Llena tipo_codigo NULL en actividades de Sem 2 y Sem 3
--
-- Contexto: las actividades de Sem 2 y Sem 3 fueron insertadas
-- sin el campo tipo_codigo. La regla es tipo_codigo = tipo
-- (copia directa, sin transformación).
--
-- Este cambio fue aplicado originalmente vía script TypeScript
-- (scripts/migrate-fix-tipo-codigo-sem2-sem3.ts, commit e6c071a).
-- Esta migración lo versiona para consistencia del historial.
--
-- IDEMPOTENTE: solo toca filas con tipo_codigo IS NULL.
-- NO ejecutar si tipo_codigo ya fue poblado (no causará daño,
-- pero tampoco hará nada).
-- ============================================================

UPDATE public.actividades
SET tipo_codigo = tipo
WHERE tipo_codigo IS NULL
  AND tipo IS NOT NULL;

-- Verificación post-aplicación (informativa):
-- SELECT COUNT(*) FROM actividades WHERE tipo_codigo IS NULL;
-- Esperado: 0
