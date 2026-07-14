-- ============================================================================
-- Migración 20: restringir a super_admin la escritura sobre contenido
-- curricular GLOBAL (compartido entre TODAS las escuelas)
-- ============================================================================
--
-- CONTEXTO (auditoría de despliegue multi-escuela):
--
-- A diferencia de datos operativos por-escuela (grupos, alumnos_grupos,
-- intentos, profiles — todos ya acotados a escuela_id en migraciones
-- 14/15/18/19), las siguientes tablas son CATÁLOGO/CONTENIDO COMPARTIDO: el
-- mismo currículo (NEM) se sirve a TODAS las escuelas por igual. No existe
-- aislamiento por escuela_id porque no debe existirlo — todas las escuelas
-- ven las mismas actividades, fichas, logros y planteamientos.
--
-- El problema NO es una fuga de datos entre escuelas (no hay "otra escuela"
-- de la que proteger este contenido, es el mismo para todas). El problema es
-- de RADIO DE IMPACTO ("blast radius"): estas policies usan FOR ALL con
--
--   role IN ('admin', 'super_admin')
--
-- lo que le da a CUALQUIER admin de CUALQUIER escuela individual permiso para
-- editar/borrar contenido curricular que consumen TODAS las demás escuelas.
-- Una sola cuenta de admin escolar comprometida o un error de un admin junior
-- puede dañar el currículo de la plataforma entera, no solo el de su escuela.
--
-- Esto ya se identificó y se corrigió correctamente para 'escuelas'
-- ("super_admin can manage escuelas", 01_schema_inicial.sql) y para
-- 'tipos_actividad' ("tipos_actividad_admin_only", 03_tipos_actividades.sql):
-- ambas son catálogo global y ambas YA restringen la escritura a super_admin.
-- Esta migración aplica el mismo criterio, ya establecido en el proyecto, a
-- las cuatro tablas de catálogo/contenido global que quedaron con 'admin'
-- (escolar) incluido en la escritura:
--
--   - actividades              (01_schema_inicial.sql: "admin can manage actividades")
--   - fichas_biblioteca         (05_biblioteca.sql: "fichas_admin_only_write")
--   - logros                    (13a_logros.sql: "logros_admin_only_write")
--   - planteamiento_progresiones (08_planteamiento_progresiones.sql: "admin_gestiona_planteamiento")
--
-- Ningún flujo de producto actual depende de que un admin ESCOLAR escriba en
-- estas tablas (la Alta Masiva, gestión de escuelas/usuarios/grupos, etc. no
-- tocan actividades/fichas_biblioteca/logros/planteamiento_progresiones). El
-- SELECT de estas tablas NO cambia — sigue siendo público para todo usuario
-- autenticado (o filtrado por 'estado = publicada' en actividades), así que
-- ningún alumno/docente/admin pierde acceso de lectura al currículo.
--
-- Idempotente: DROP POLICY IF EXISTS + CREATE. Seguro de re-ejecutar.
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor (lo aplica el
-- usuario manualmente).
-- ============================================================================

-- ── actividades ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin can manage actividades" ON public.actividades;

CREATE POLICY "super_admin can manage actividades"
  ON public.actividades FOR ALL TO authenticated
  USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');

-- ── fichas_biblioteca ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "fichas_admin_only_write" ON public.fichas_biblioteca;

CREATE POLICY "fichas_super_admin_only_write"
  ON public.fichas_biblioteca FOR ALL TO authenticated
  USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');

-- ── logros ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "logros_admin_only_write" ON public.logros;

CREATE POLICY "logros_super_admin_only_write"
  ON public.logros FOR ALL TO authenticated
  USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');

-- ── planteamiento_progresiones ──────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_gestiona_planteamiento" ON public.planteamiento_progresiones;

CREATE POLICY "super_admin_gestiona_planteamiento"
  ON public.planteamiento_progresiones FOR ALL TO authenticated
  USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');

-- ============================================================================
-- Verificación post-migración (ejecutar como un admin ESCOLAR, no super_admin):
--   -- Debe fallar (0 filas afectadas / error de policy), no debe poder escribir:
--   UPDATE actividades SET titulo = titulo WHERE id = '<cualquier id>';
--   UPDATE fichas_biblioteca SET titulo = titulo WHERE id = '<cualquier id>';
--   UPDATE logros SET nombre = nombre WHERE id = '<cualquier id>';
--   UPDATE planteamiento_progresiones SET ... WHERE id = '<cualquier id>';
--
--   -- El SELECT de estas 4 tablas debe seguir funcionando igual para todos
--   -- los roles (no se tocaron las policies de SELECT).
-- ============================================================================
