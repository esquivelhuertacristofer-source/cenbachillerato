-- ============================================================
-- 10_practica_experimental.sql
-- Agrega columna practica_slug a actividades.
-- Contexto: una actividad puede tener asociada una "Práctica experimental"
-- (laboratorio/simulador construido como componente React en el repo).
-- Cuando practica_slug != NULL, la app muestra el botón "Práctica experimental"
-- que lleva a la sección /actividad/[orden]/practica, la cual monta el
-- componente registrado bajo ese slug (ver src/components/practicas/registry.tsx).
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor.
-- ============================================================

-- 1. Columna (slug del laboratorio en el registro de prácticas del frontend)
ALTER TABLE public.actividades
  ADD COLUMN IF NOT EXISTS practica_slug text;

CREATE INDEX IF NOT EXISTS idx_actividades_practica_slug
  ON public.actividades(practica_slug)
  WHERE practica_slug IS NOT NULL;

COMMENT ON COLUMN public.actividades.practica_slug IS
  'Slug del laboratorio/práctica experimental asociado (componente React en src/components/practicas/registry.tsx). NULL = sin práctica experimental.';

-- Verificación post-migración
-- SELECT codigo, titulo, practica_slug FROM actividades WHERE practica_slug IS NOT NULL;
