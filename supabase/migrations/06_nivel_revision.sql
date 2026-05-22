-- ============================================================
-- 06_nivel_revision.sql
-- Agrega columna nivel_revision a actividades y fichas_biblioteca
-- Contexto: sistema de marcado pedagógico post-robustecimiento
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor
-- ============================================================

-- 1. Enum
DO $$ BEGIN
  CREATE TYPE nivel_revision_enum AS ENUM (
    'borrador',
    'robustecida',
    'validada_pedagogicamente'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Columna en actividades
ALTER TABLE public.actividades
  ADD COLUMN IF NOT EXISTS nivel_revision nivel_revision_enum NOT NULL DEFAULT 'borrador';

CREATE INDEX IF NOT EXISTS idx_actividades_nivel_revision
  ON public.actividades(nivel_revision);

COMMENT ON COLUMN public.actividades.nivel_revision IS
  'Estado de revision pedagogica: borrador (generada por IA sin revision), robustecida (mejorada con referencias y estandares), validada_pedagogicamente (revisada y aprobada por docente especialista)';

-- 3. Columna en fichas_biblioteca
ALTER TABLE public.fichas_biblioteca
  ADD COLUMN IF NOT EXISTS nivel_revision nivel_revision_enum NOT NULL DEFAULT 'borrador';

CREATE INDEX IF NOT EXISTS idx_fichas_nivel_revision
  ON public.fichas_biblioteca(nivel_revision);

COMMENT ON COLUMN public.fichas_biblioteca.nivel_revision IS
  'Estado de revision pedagogica: borrador, robustecida, validada_pedagogicamente';

-- Verificacion post-migracion
-- SELECT COUNT(*), nivel_revision FROM actividades GROUP BY nivel_revision;
-- Esperado: 621 en borrador
-- SELECT COUNT(*), nivel_revision FROM fichas_biblioteca GROUP BY nivel_revision;
-- Esperado: 607 en borrador
