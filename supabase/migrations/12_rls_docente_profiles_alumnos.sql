-- ============================================================
-- 12_rls_docente_profiles_alumnos.sql
-- Agrega política RLS de SELECT sobre profiles para que un docente
-- pueda leer los perfiles de SUS PROPIOS alumnos.
--
-- Contexto del bug: tras aplicar la migración 11, el Panel Principal y
-- Planteamiento del docente ya funcionan (cuentan alumnos_grupos / leen
-- intentos, NO leen profiles de alumnos). Pero /dashboard/docente/alumnos
-- seguía mostrando "No hay alumnos en tus grupos aún".
--
-- Causa raíz: la página construye las tarjetas de alumno a partir de un
-- SELECT a public.profiles (.in('id', studentIds)). La tabla profiles SOLO
-- tenía estas policies de SELECT:
--   - "users can read own profile"            (id = auth.uid())
--   - "admin can read profiles in their escuela" (admin/super_admin)
-- NO existía ninguna policy que dejara a un docente leer los perfiles de
-- sus alumnos → ese SELECT regresaba 0 filas (sin error) → tarjetas vacías.
-- Es el MISMO patrón de la migración 11, pero sobre la tabla profiles.
--
-- Esta migración agrega esa policy con scope por DOCENTE (privacidad de
-- datos de menores): cada docente lee SOLO los perfiles de los alumnos que
-- están en SUS propios grupos (grupos.id_docente = auth.uid()). admin y
-- super_admin siguen viendo todo; cualquier usuario sigue viendo su propio
-- perfil. Las policies se evalúan en OR, así que esto NO rompe las dos
-- policies existentes.
--
-- Seguridad de recursión: la subconsulta usa alumnos_grupos y grupos, cuyas
-- policies resuelven vía get_my_role()/get_my_escuela_id() (SECURITY DEFINER)
-- y auth.uid(); ninguna referencia de vuelta a profiles, por lo que no hay
-- recursión de RLS.
--
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor.
-- ============================================================

-- profiles: docente lee SOLO los perfiles de los alumnos de SUS grupos
DROP POLICY IF EXISTS "teacher can read profiles of own students" ON public.profiles;

CREATE POLICY "teacher can read profiles of own students"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.get_my_role() IN ('admin', 'super_admin')
    OR id = auth.uid()
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

-- Verificación post-migración (ejecutar como el docente demo, NO en SQL Editor):
-- SELECT id, full_name, email FROM profiles
--   WHERE id IN (
--     SELECT ag.id_alumno FROM alumnos_grupos ag
--     JOIN grupos g ON g.id = ag.id_grupo
--     WHERE g.id_docente = auth.uid()
--   );
-- Debe devolver los 3 alumnos del docente demo.
