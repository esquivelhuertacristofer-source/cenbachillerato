-- ============================================================
-- 14_rls_admin_intentos_escuela.sql
-- Acota el SELECT de intentos del rol 'admin' a SU PROPIA escuela.
--
-- Contexto (privacidad de datos de menores, LFPDPPP):
-- La migración 13 corrigió el scope del DOCENTE (solo sus grupos), pero dejó
-- a 'admin' viendo TODOS los intentos de TODAS las escuelas:
--
--   public.get_my_role() IN ('admin', 'super_admin')   -- admin = global
--
-- En un modelo multi-tenant, un administrador escolar NO debe ver datos de
-- alumnos de OTRAS escuelas. Es el mismo patrón ya establecido para 'profiles'
-- en 01_schema_inicial.sql (admin acotado a escuela_id = get_my_escuela_id()).
-- super_admin (operador de la plataforma) SÍ conserva visión global.
--
-- Helper get_escuela_of_user(_uid): SECURITY DEFINER, devuelve la escuela del
-- DUEÑO del intento (intentos.user_id), para compararla con la del admin que
-- consulta. Es SECURITY DEFINER + STABLE como get_my_role()/get_my_escuela_id();
-- lee profiles por PK, no referencia de vuelta a intentos ⇒ sin recursión de RLS.
--
-- La policy del alumno ("students can manage own intentos", user_id = auth.uid())
-- y la del docente (migración 13) NO se tocan: se evalúan en OR.
--
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor.
-- ============================================================

-- Nota: cuerpo como string literal (no dollar-quoting $$) — al pegar en el SQL
-- Editor de Supabase, los $$ se mutilan y dan "syntax error at end of input".
CREATE OR REPLACE FUNCTION public.get_escuela_of_user(_uid uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS 'SELECT escuela_id FROM public.profiles WHERE id = _uid';

-- Order-robust: dropea TODAS las variantes previas de la policy SELECT de
-- intentos (migr 01 "in their groups" = la filtrante global, y migr 13
-- "in own groups"). Así esta migración es correcta aunque se aplique saltando
-- la 13, sin dejar una policy vieja conviviendo en OR.
DROP POLICY IF EXISTS "teacher can read intentos in their groups" ON public.intentos;
DROP POLICY IF EXISTS "teacher can read intentos in own groups" ON public.intentos;

CREATE POLICY "teacher can read intentos in own groups"
  ON public.intentos FOR SELECT TO authenticated
  USING (
    -- Operador de la plataforma: visión global.
    public.get_my_role() = 'super_admin'
    OR (
      -- Admin escolar: solo intentos de alumnos de SU escuela.
      public.get_my_role() = 'admin'
      AND public.get_escuela_of_user(intentos.user_id) = public.get_my_escuela_id()
    )
    OR (
      -- Docente: solo intentos de alumnos en SUS grupos (igual que migración 13).
      public.get_my_role() = 'teacher'
      AND EXISTS (
        SELECT 1
        FROM public.alumnos_grupos ag
        JOIN public.grupos g ON g.id = ag.id_grupo
        WHERE ag.id_alumno = intentos.user_id
          AND g.id_docente = auth.uid()
      )
    )
  );

-- Verificación post-migración (ejecutar como un admin escolar, NO en SQL Editor):
-- Debe devolver 0: un admin no debe ver ningún intento de otra escuela.
-- SELECT COUNT(*) FROM intentos
--   WHERE public.get_escuela_of_user(user_id) <> public.get_my_escuela_id();
