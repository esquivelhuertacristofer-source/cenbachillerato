-- =============================================================================
-- Migración 02: Realineación al MCCEMS oficial (Acuerdo 09/08/23 / Gen 2023-2026)
-- Corrige 7 discrepancias estructurales detectadas en auditoría 2026-05-12
-- Ver: docs/AUDITORIA-CURRICULAR.md
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Columna es_placeholder en progresiones (BUG-006)
-- ---------------------------------------------------------------------------
ALTER TABLE public.progresiones
  ADD COLUMN IF NOT EXISTS es_placeholder boolean NOT NULL DEFAULT true;

-- ---------------------------------------------------------------------------
-- 2. Nuevos Recursos Sociocognitivos faltantes (D-003, D-004, D-005)
--    CS, HUM y CNEYT son CF desde semestre 1 en la gen 2023-2026
--    y RSC explícitos en el Modelo Educativo 2025 (gen 2025-2028)
-- ---------------------------------------------------------------------------
INSERT INTO public.recursos_sociocognitivos (codigo, nombre, descripcion, color, icono, orden) VALUES
  ('RSC-CS',
   'Ciencias Sociales',
   'Analiza fenómenos sociales, económicos y políticos desde perspectivas multidisciplinarias para comprender y transformar la realidad.',
   '#ea580c', '🏙️', 6),
  ('RSC-HUM',
   'Humanidades',
   'Fomenta la reflexión filosófica, literaria y estética para el pensamiento crítico y la sensibilidad cultural.',
   '#7c3aed', '📚', 7),
  ('RSC-CNEYT',
   'Ciencias Naturales, Experimentales y Tecnología',
   'Desarrolla pensamiento científico y tecnológico a través de la experimentación, la investigación y la resolución de problemas del entorno.',
   '#16a34a', '🔬', 8)
ON CONFLICT (codigo) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Recursos Socioemocionales: reemplazar NEM 2019 → MCCEMS actual (D-007)
--    El MCCEMS vigente tiene 4 Ámbitos de Formación Socioemocional
-- ---------------------------------------------------------------------------
DELETE FROM public.recursos_socioemocionales
  WHERE codigo IN ('RSE-RS', 'RSE-CFC', 'RSE-BEA');

INSERT INTO public.recursos_socioemocionales (codigo, nombre, descripcion, orden) VALUES
  ('RSE-AFD',  'Actividades físicas y deportivas',
   'Promueve el desarrollo físico, la salud y el trabajo en equipo a través del deporte y la actividad física regular.',
   1),
  ('RSE-AAC',  'Actividades artísticas y culturales',
   'Fomenta la expresión creativa, la identidad cultural y la apreciación estética mediante las artes y la cultura.',
   2),
  ('RSE-IESG', 'Educación integral en sexualidad y género',
   'Desarrolla una comprensión crítica y respetuosa de la sexualidad, el género y las relaciones interpersonales.',
   3),
  ('RSE-ESP',  'Educación para la salud y práctica ciudadana',
   'Promueve hábitos de vida saludable y la participación responsable en la vida democrática y comunitaria.',
   4)
ON CONFLICT (codigo) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. Corregir Conciencia Histórica: sems 1-3 → sems 4-6 (D-002)
-- ---------------------------------------------------------------------------
-- Borrar progresiones placeholder de CH en posición incorrecta
DELETE FROM public.progresiones
  WHERE uac_id IN (SELECT id FROM public.uac WHERE codigo IN ('CH-I', 'CH-II', 'CH-III'));

-- Mover CH a semestres correctos
UPDATE public.uac SET semestre = 4 WHERE codigo = 'CH-I';
UPDATE public.uac SET semestre = 5 WHERE codigo = 'CH-II';
UPDATE public.uac SET semestre = 6 WHERE codigo = 'CH-III';

-- Actualizar componente a CF (ya está en CF pero verificar por consistencia)
UPDATE public.uac u
  SET componente_id = (SELECT id FROM public.componentes_curriculares WHERE codigo = 'CF')
  WHERE u.codigo IN ('CH-I', 'CH-II', 'CH-III');

-- ---------------------------------------------------------------------------
-- 5. Eliminar UAC incorrectas y sus progresiones (ON DELETE CASCADE)
--    D-004: HUM en posición y nombres incorrectos (CFE sem 3-5 → CF sem 1-3)
--    D-005: CS con nombres Historia/Economía/Sociología/Administración
--    D-003: CNT-* reemplazados por CNEYT-I a VI temáticos
-- ---------------------------------------------------------------------------
DELETE FROM public.uac WHERE codigo IN (
  -- Ciencias Sociales incorrectas
  'CS-HIS-I', 'CS-HIS-II',
  'CS-ECO-I', 'CS-ECO-II',
  'CS-SOC', 'CS-ADM',
  -- Ciencias Naturales incorrectas (reemplazadas por CNEYT temáticas)
  'CNT-BIO-I', 'CNT-BIO-II',
  'CNT-QUI-I', 'CNT-QUI-II',
  'CNT-FIS-I', 'CNT-FIS-II',
  'CNT-MATE',
  'CNT-TC-I', 'CNT-TC-II',
  -- Humanidades en posición incorrecta (CFE sem 3-5 → CF sem 1-3)
  'HUM-PLT', 'HUM-FIL', 'HUM-EST'
);

-- ---------------------------------------------------------------------------
-- 6. Insertar UAC correctas: CS, HUM, CNEYT, CD-III
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  _cf_id       uuid;
  _rsc_cs_id   uuid;
  _rsc_hum_id  uuid;
  _rsc_cneyt_id uuid;
  _rsc_cd_id   uuid;
BEGIN
  SELECT id INTO _cf_id        FROM public.componentes_curriculares    WHERE codigo = 'CF';
  SELECT id INTO _rsc_cs_id    FROM public.recursos_sociocognitivos    WHERE codigo = 'RSC-CS';
  SELECT id INTO _rsc_hum_id   FROM public.recursos_sociocognitivos    WHERE codigo = 'RSC-HUM';
  SELECT id INTO _rsc_cneyt_id FROM public.recursos_sociocognitivos    WHERE codigo = 'RSC-CNEYT';
  SELECT id INTO _rsc_cd_id    FROM public.recursos_sociocognitivos    WHERE codigo = 'RSC-CD';

  -- Ciencias Sociales CF (sems 1, 2, 4)
  INSERT INTO public.uac (codigo, nombre, semestre, componente_id, recurso_id, orden, total_progresiones)
  VALUES
    ('CS-I',   'Ciencias Sociales I',   1, _cf_id, _rsc_cs_id, 6, 10),
    ('CS-II',  'Ciencias Sociales II',  2, _cf_id, _rsc_cs_id, 6, 10),
    ('CS-III', 'Ciencias Sociales III', 4, _cf_id, _rsc_cs_id, 6, 10)
  ON CONFLICT (codigo) DO NOTHING;

  -- Humanidades CF (sems 1, 2, 3)
  INSERT INTO public.uac (codigo, nombre, semestre, componente_id, recurso_id, orden, total_progresiones)
  VALUES
    ('HUM-I',   'Humanidades I',   1, _cf_id, _rsc_hum_id, 7, 10),
    ('HUM-II',  'Humanidades II',  2, _cf_id, _rsc_hum_id, 7, 10),
    ('HUM-III', 'Humanidades III', 3, _cf_id, _rsc_hum_id, 7, 10)
  ON CONFLICT (codigo) DO NOTHING;

  -- CNEYT CF con títulos temáticos (sems 1-6)
  INSERT INTO public.uac (codigo, nombre, semestre, componente_id, recurso_id, orden, total_progresiones)
  VALUES
    ('CNEYT-I',   'La materia y sus interacciones',         1, _cf_id, _rsc_cneyt_id, 8, 10),
    ('CNEYT-II',  'Conservación de la energía',             2, _cf_id, _rsc_cneyt_id, 8, 10),
    ('CNEYT-III', 'Ecosistemas, interacciones y energía',   3, _cf_id, _rsc_cneyt_id, 8, 10),
    ('CNEYT-IV',  'Reacciones químicas',                   4, _cf_id, _rsc_cneyt_id, 8, 10),
    ('CNEYT-V',   'La energía en procesos de vida diaria', 5, _cf_id, _rsc_cneyt_id, 8, 10),
    ('CNEYT-VI',  'Organismos y evolución biológica',      6, _cf_id, _rsc_cneyt_id, 8, 10)
  ON CONFLICT (codigo) DO NOTHING;

  -- Cultura Digital III (sem 6 — D-006)
  INSERT INTO public.uac (codigo, nombre, semestre, componente_id, recurso_id, orden, total_progresiones)
  VALUES
    ('CD-III', 'Cultura Digital III', 6, _cf_id, _rsc_cd_id, 4, 8)
  ON CONFLICT (codigo) DO NOTHING;

END $$;

-- ---------------------------------------------------------------------------
-- 7. Verificación final (se muestra en el output de psql)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  total_uac   int;
  total_prog  int;
  sem1_count  int;
BEGIN
  SELECT COUNT(*) INTO total_uac  FROM public.uac;
  SELECT COUNT(*) INTO total_prog FROM public.progresiones;
  SELECT COUNT(*) INTO sem1_count FROM public.uac WHERE semestre = 1;

  RAISE NOTICE '=== Verificación post-migración ===';
  RAISE NOTICE 'Total UAC: % (esperado: ~34)', total_uac;
  RAISE NOTICE 'UAC semestre 1: % (esperado: 7)', sem1_count;
  RAISE NOTICE 'Total progresiones: % (esperado: 0 — se re-seedean con script)', total_prog;
  RAISE NOTICE '====================================';
END $$;

COMMIT;
