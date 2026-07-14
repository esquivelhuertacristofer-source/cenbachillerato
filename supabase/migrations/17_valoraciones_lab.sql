-- ============================================================
-- 17_valoraciones_lab.sql
-- Persiste la mejor marca (0-3 estrellas) de cada reto de lab
-- por alumno. La clave reto_key coincide con la RETO_KEY de
-- cada componente de lab (p.ej. "cen-adn-reto").
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.valoraciones_lab (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reto_key    text        NOT NULL,
  estrellas   smallint    NOT NULL DEFAULT 0
                          CHECK (estrellas BETWEEN 0 AND 3),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(alumno_id, reto_key)
);

CREATE INDEX IF NOT EXISTS idx_val_lab_alumno ON public.valoraciones_lab(alumno_id);

ALTER TABLE public.valoraciones_lab ENABLE ROW LEVEL SECURITY;

-- El alumno lee y escribe solo sus propias valoraciones.
CREATE POLICY "valoraciones_lab_own"
  ON public.valoraciones_lab FOR ALL
  TO authenticated
  USING (alumno_id = auth.uid())
  WITH CHECK (alumno_id = auth.uid());

COMMIT;
