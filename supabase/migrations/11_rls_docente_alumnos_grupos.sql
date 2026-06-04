-- ============================================================
-- 11_rls_docente_alumnos_grupos.sql
-- Agrega política RLS de SELECT sobre alumnos_grupos para docentes/admin.
--
-- Contexto del bug: el Panel Principal del docente mostraba "Sin grupos
-- asignados" y los conteos de alumnos salían en 0, aunque los datos existen
-- en la DB (verificable en el SQL Editor, que ignora RLS).
--
-- Causa raíz #2 (latente): la tabla alumnos_grupos SOLO tenía la política
-- "student can read own alumnos_grupos" (id_alumno = auth.uid()). NO existía
-- ninguna política que dejara a un docente leer las membresías de SUS grupos,
-- por lo que cualquier query del docente a alumnos_grupos regresaba 0 filas
-- (sin error) → conteo de alumnos siempre 0.
--
-- Esta migración agrega esa política, alineada con la de grupos:
-- un docente/admin puede leer las membresías de los grupos de SU escuela.
--
-- (La causa raíz #1 — "Sin grupos asignados" — es de DATOS: el profile del
--  docente demo tiene escuela_id NULL/distinto al de sus grupos, por lo que
--  la política de grupos lo filtra. Esa parte se corrige con el SQL de datos
--  entregado aparte, no con esta migración de esquema.)
--
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor.
-- ============================================================

-- alumnos_grupos: docente/admin ve las membresías de los grupos de su escuela
CREATE POLICY "teacher/admin can read alumnos_grupos in their escuela"
  ON public.alumnos_grupos FOR SELECT TO authenticated
  USING (
    public.get_my_role() IN ('teacher', 'admin', 'super_admin') AND
    EXISTS (
      SELECT 1 FROM public.grupos g
      WHERE g.id = alumnos_grupos.id_grupo
        AND g.escuela_id = public.get_my_escuela_id()
    )
  );

-- Verificación post-migración (ejecutar como el docente demo, NO en SQL Editor):
-- SELECT COUNT(*) FROM alumnos_grupos
--   WHERE id_grupo IN (SELECT id FROM grupos WHERE id_docente = auth.uid());
