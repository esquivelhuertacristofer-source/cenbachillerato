-- ============================================================
-- 13_rls_docente_intentos.sql
-- Corrige el SCOPE de la policy de SELECT sobre intentos para docentes.
--
-- Bug de aislamiento (privacidad de datos de menores): la policy original
--   "teacher can read intentos in their groups" (01_schema_inicial.sql)
-- decía "in their groups" en el nombre pero su USING NO filtraba por grupo
-- ni por escuela:
--
--   USING ( public.get_my_role() IN ('teacher','admin','super_admin') )
--
-- Efecto: CUALQUIER docente autenticado podía leer los intentos (avance,
-- calificaciones, tiempos) de TODOS los alumnos de TODAS las escuelas, no
-- solo de los suyos. Es el mismo patrón que ya corrigieron las migraciones
-- 11 (alumnos_grupos) y 12 (profiles), pero a intentos se le había omitido.
--
-- Esta migración reescribe la policy con scope por DOCENTE: cada docente lee
-- SOLO los intentos de los alumnos que están en SUS propios grupos
-- (grupos.id_docente = auth.uid()). admin/super_admin siguen viendo todo.
-- La policy "students can manage own intentos" (user_id = auth.uid()) NO se
-- toca: las policies se evalúan en OR, así que el alumno sigue viendo lo suyo.
--
-- Seguridad de recursión: la subconsulta usa alumnos_grupos y grupos, cuyas
-- policies resuelven vía get_my_role()/auth.uid() (SECURITY DEFINER); ninguna
-- referencia de vuelta a intentos, por lo que no hay recursión de RLS.
--
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor.
-- ============================================================

DROP POLICY IF EXISTS "teacher can read intentos in their groups" ON public.intentos;
DROP POLICY IF EXISTS "teacher can read intentos in own groups" ON public.intentos;

CREATE POLICY "teacher can read intentos in own groups"
  ON public.intentos FOR SELECT TO authenticated
  USING (
    public.get_my_role() IN ('admin', 'super_admin')
    OR (
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

-- Verificación post-migración (ejecutar como el docente demo, NO en SQL Editor):
-- Debe devolver solo intentos de SUS alumnos:
-- SELECT COUNT(*) FROM intentos
--   WHERE user_id IN (
--     SELECT ag.id_alumno FROM alumnos_grupos ag
--     JOIN grupos g ON g.id = ag.id_grupo
--     WHERE g.id_docente = auth.uid()
--   );
-- Y un SELECT * FROM intentos NO debe traer intentos de alumnos de otra escuela.
