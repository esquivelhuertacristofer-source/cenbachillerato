-- ============================================================
-- 22_retirar_logros.sql
-- Retira el sistema de logros (achievements) del alumno.
--   · Se decidió recortar la superficie de gamificación a solo la racha
--     (señal de compromiso genuina); XP y logros se retiran del producto.
--   · public.logros_alumno se elimina primero por la FK hacia public.logros
--     (aunque el ON DELETE CASCADE de logro_id lo permitiría en cualquier
--     orden, se deja explícito por claridad).
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor
-- ============================================================

BEGIN;

DROP TABLE IF EXISTS public.logros_alumno;
DROP TABLE IF EXISTS public.logros;

COMMIT;
