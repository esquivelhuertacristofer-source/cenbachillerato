-- ============================================================
-- 05_biblioteca.sql
-- Tablas de Biblioteca de fichas pedagógicas + lecturas
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor
-- ============================================================

BEGIN;

-- ── Fichas de biblioteca ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fichas_biblioteca (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  uac_id                uuid        NOT NULL REFERENCES public.uac(id) ON DELETE CASCADE,
  categoria             text,
  titulo                text        NOT NULL,
  slug                  text        UNIQUE NOT NULL,
  imagen_destacada      text,
  contenido             jsonb       NOT NULL DEFAULT '{}'::jsonb,
  conceptos_clave       jsonb       DEFAULT '[]'::jsonb,
  fichas_relacionadas   jsonb       DEFAULT '[]'::jsonb,
  orden                 int         DEFAULT 0,
  tiempo_lectura_minutos int        DEFAULT 5,
  es_placeholder        boolean     DEFAULT true,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fichas_uac    ON public.fichas_biblioteca(uac_id);
CREATE INDEX IF NOT EXISTS idx_fichas_slug   ON public.fichas_biblioteca(slug);
CREATE INDEX IF NOT EXISTS idx_fichas_orden  ON public.fichas_biblioteca(uac_id, orden);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_fichas_search ON public.fichas_biblioteca
  USING gin(to_tsvector('spanish', coalesce(titulo,'') || ' ' || coalesce(categoria,'')));

-- RLS
ALTER TABLE public.fichas_biblioteca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fichas_select_authenticated"
  ON public.fichas_biblioteca FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "fichas_admin_only_write"
  ON public.fichas_biblioteca FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ── Lecturas de fichas ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fichas_lecturas (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id       uuid        NOT NULL REFERENCES auth.users(id)          ON DELETE CASCADE,
  ficha_id        uuid        NOT NULL REFERENCES public.fichas_biblioteca(id) ON DELETE CASCADE,
  primera_lectura timestamptz DEFAULT now(),
  ultima_lectura  timestamptz DEFAULT now(),
  UNIQUE(alumno_id, ficha_id)
);

CREATE INDEX IF NOT EXISTS idx_lecturas_alumno ON public.fichas_lecturas(alumno_id);
CREATE INDEX IF NOT EXISTS idx_lecturas_ficha  ON public.fichas_lecturas(ficha_id);

ALTER TABLE public.fichas_lecturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lecturas_own_only"
  ON public.fichas_lecturas FOR ALL
  TO authenticated
  USING (alumno_id = auth.uid())
  WITH CHECK (alumno_id = auth.uid());

-- ── Trigger: updated_at automático ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_fichas_updated_at ON public.fichas_biblioteca;
CREATE TRIGGER trg_fichas_updated_at
  BEFORE UPDATE ON public.fichas_biblioteca
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;
