-- ============================================================
-- 13_logros.sql
-- Sistema de logros (achievements) del alumno
--   · public.logros          → catálogo de definiciones (qué logros existen)
--   · public.logros_alumno   → qué alumno desbloqueó qué logro y cuándo
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor
-- ============================================================

BEGIN;

-- ── Catálogo de logros ──────────────────────────────────────────────────────
-- criterio_tipo + criterio_valor permiten otorgar logros automáticamente desde
-- métricas que YA se rastrean (intentos completados, XP, racha, minutos).
CREATE TABLE IF NOT EXISTS public.logros (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo         text        UNIQUE NOT NULL,   -- clave estable (no cambia)
  nombre         text        NOT NULL,
  descripcion    text        NOT NULL,
  icono          text        NOT NULL,          -- emoji
  criterio_tipo  text        NOT NULL,          -- 'actividades' | 'xp' | 'racha' | 'minutos'
  criterio_valor int         NOT NULL,          -- umbral a alcanzar (>=)
  orden          int         DEFAULT 0,
  activo         boolean     DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  CONSTRAINT logros_criterio_tipo_chk
    CHECK (criterio_tipo IN ('actividades', 'xp', 'racha', 'minutos'))
);

CREATE INDEX IF NOT EXISTS idx_logros_orden  ON public.logros(orden);
CREATE INDEX IF NOT EXISTS idx_logros_activo ON public.logros(activo);

ALTER TABLE public.logros ENABLE ROW LEVEL SECURITY;

-- Catálogo legible por cualquier autenticado.
CREATE POLICY "logros_select_authenticated"
  ON public.logros FOR SELECT
  TO authenticated
  USING (true);

-- Solo admin/super_admin modifica el catálogo.
CREATE POLICY "logros_admin_only_write"
  ON public.logros FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ── Logros desbloqueados por alumno ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.logros_alumno (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id       uuid        NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  logro_id        uuid        NOT NULL REFERENCES public.logros(id) ON DELETE CASCADE,
  desbloqueado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE(alumno_id, logro_id)
);

CREATE INDEX IF NOT EXISTS idx_logros_alumno_alumno ON public.logros_alumno(alumno_id);
CREATE INDEX IF NOT EXISTS idx_logros_alumno_logro  ON public.logros_alumno(logro_id);

ALTER TABLE public.logros_alumno ENABLE ROW LEVEL SECURITY;

-- El alumno solo ve / inserta sus propios logros (el otorgamiento corre con su
-- sesión: alumno_id = auth.uid()). Idempotente vía UNIQUE(alumno_id, logro_id).
CREATE POLICY "logros_alumno_own_only"
  ON public.logros_alumno FOR ALL
  TO authenticated
  USING (alumno_id = auth.uid())
  WITH CHECK (alumno_id = auth.uid());

-- ── Seed del catálogo (definiciones de producto, no datos de alumno) ─────────
INSERT INTO public.logros (codigo, nombre, descripcion, icono, criterio_tipo, criterio_valor, orden) VALUES
  ('primera_actividad', 'Primer paso',      'Completaste tu primera actividad.',          '🎯', 'actividades',     1,  10),
  ('constante',         'Constante',         'Completaste 10 actividades.',                '📚', 'actividades',    10,  20),
  ('erudito',           'Erudito',           'Completaste 50 actividades.',                '🏅', 'actividades',    50,  30),
  ('centurion',         'Centurión',         'Completaste 100 actividades.',               '💯', 'actividades',   100,  40),
  ('racha_3',           'En llamas',         'Racha de 3 días seguidos.',                  '🔥', 'racha',           3,  50),
  ('racha_7',           'Imparable',         'Racha de 7 días seguidos.',                  '⚡', 'racha',           7,  60),
  ('racha_30',          'Volcán',            'Racha de 30 días seguidos.',                 '🌋', 'racha',          30,  70),
  ('xp_500',            'Aprendiz',          'Acumulaste 500 XP.',                         '⭐', 'xp',            500,  80),
  ('xp_2000',           'Veterano',          'Acumulaste 2 000 XP.',                       '🌟', 'xp',           2000,  90),
  ('xp_10000',          'Leyenda',           'Acumulaste 10 000 XP.',                      '👑', 'xp',          10000, 100),
  ('dedicado',          'Dedicado',          'Acumulaste 10 horas de estudio.',            '⏱️', 'minutos',       600, 110),
  ('maraton',           'Maratonista',       'Acumulaste 50 horas de estudio.',            '🧠', 'minutos',      3000, 120)
ON CONFLICT (codigo) DO NOTHING;

COMMIT;
