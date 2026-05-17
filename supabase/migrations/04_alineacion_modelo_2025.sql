-- =============================================================================
-- Migración 04: Alineación a Modelo Educativo 2025
-- Fecha: 2026-05-17
-- Fuente: docs/programas-oficiales/extraidos/
-- =============================================================================
--
-- Cambios aplicados:
--   1. Verificar que LC-IV/V/VI no tienen actividades reales
--   2. Eliminar UAC ficticias LC-IV, LC-V, LC-VI (con sus progresiones)
--   3. Actualizar RSC-HUM → RSC-PFH (codigo + nombre)
--   4. Eliminar progresiones placeholder de HUM-I/II/III (se re-seedean en FASE 4)
--   5. Renombrar HUM-I/II/III → PFH-I/II/III (codigo + nombre oficial)
--   6. Crear IN-V (Inglés V, semestre 5)
--   7. Ajustar total_progresiones en todos los UAC al conteo oficial 2025
--   8. Eliminar progresiones placeholder excedentes (numero > conteo_oficial)
--   9. Verificación final
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Verificar que LC-IV, LC-V, LC-VI no tienen actividades reales
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_count_actividades int;
BEGIN
  SELECT COUNT(*) INTO v_count_actividades
  FROM actividades a
  JOIN progresiones p ON p.id = a.progresion_id
  JOIN uac u ON u.id = p.uac_id
  WHERE u.codigo IN ('LC-IV', 'LC-V', 'LC-VI');

  IF v_count_actividades > 0 THEN
    RAISE EXCEPTION 'BLOQUEADO: hay % actividades asociadas a LC-IV/V/VI. Revisar antes de continuar.', v_count_actividades;
  END IF;

  RAISE NOTICE 'OK: LC-IV/V/VI sin actividades asociadas (%).', v_count_actividades;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Eliminar UAC ficticias (progresiones se eliminan por ON DELETE CASCADE)
-- ---------------------------------------------------------------------------
DELETE FROM public.uac WHERE codigo IN ('LC-IV', 'LC-V', 'LC-VI');

-- ---------------------------------------------------------------------------
-- 3. Actualizar RSC-HUM → RSC-PFH
-- ---------------------------------------------------------------------------
UPDATE public.recursos_sociocognitivos
SET
  codigo  = 'RSC-PFH',
  nombre  = 'Pensamiento Filosófico y Humanidades'
WHERE codigo = 'RSC-HUM';

-- ---------------------------------------------------------------------------
-- 4. Eliminar progresiones placeholder de HUM-I/II/III
--    (se re-seedean con contenido oficial PFH en FASE 4)
-- ---------------------------------------------------------------------------
DELETE FROM public.progresiones
WHERE uac_id IN (
  SELECT id FROM public.uac WHERE codigo IN ('HUM-I', 'HUM-II', 'HUM-III')
);

-- ---------------------------------------------------------------------------
-- 5. Renombrar HUM-I/II/III → PFH-I/II/III (codigo + nombre + recurso)
-- ---------------------------------------------------------------------------
UPDATE public.uac
SET
  codigo     = 'PFH-I',
  nombre     = 'Pensamiento Filosófico y Humanidades I',
  recurso_id = (SELECT id FROM public.recursos_sociocognitivos WHERE codigo = 'RSC-PFH')
WHERE codigo = 'HUM-I';

UPDATE public.uac
SET
  codigo     = 'PFH-II',
  nombre     = 'Pensamiento Filosófico y Humanidades II',
  recurso_id = (SELECT id FROM public.recursos_sociocognitivos WHERE codigo = 'RSC-PFH')
WHERE codigo = 'HUM-II';

UPDATE public.uac
SET
  codigo     = 'PFH-III',
  nombre     = 'Pensamiento Filosófico y Humanidades III',
  recurso_id = (SELECT id FROM public.recursos_sociocognitivos WHERE codigo = 'RSC-PFH')
WHERE codigo = 'HUM-III';

-- ---------------------------------------------------------------------------
-- 6. Crear IN-V (Inglés V, semestre 5)
-- ---------------------------------------------------------------------------
INSERT INTO public.uac (codigo, nombre, semestre, componente_id, recurso_id, orden, total_progresiones)
SELECT
  'IN-V',
  'Inglés V',
  5,
  cf.id,
  rsc_in.id,
  3,
  8
FROM
  public.componentes_curriculares cf,
  public.recursos_sociocognitivos rsc_in
WHERE
  cf.codigo    = 'CF'
  AND rsc_in.codigo = 'RSC-IN'
ON CONFLICT (codigo) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 7. Ajustar total_progresiones a conteos oficiales 2025
-- ---------------------------------------------------------------------------

-- Lengua y Comunicación (sems 1-3): 8, 8, 7
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'LC-I';
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'LC-II';
UPDATE public.uac SET total_progresiones = 7 WHERE codigo = 'LC-III';

-- Pensamiento Matemático (sems 1-6): 7, 6, 6, 7, 8, 8
UPDATE public.uac SET total_progresiones = 7 WHERE codigo = 'PM-I';
UPDATE public.uac SET total_progresiones = 6 WHERE codigo = 'PM-II';
UPDATE public.uac SET total_progresiones = 6 WHERE codigo = 'PM-III';
UPDATE public.uac SET total_progresiones = 7 WHERE codigo = 'PM-IV';
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'PM-V';
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'PM-VI';

-- Inglés (sems 1-5): 8 cada uno
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'IN-I';
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'IN-II';
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'IN-III';
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'IN-IV';
-- IN-V ya se creó con total_progresiones = 8 en paso 6

-- Cultura Digital (sems 1, 2, 6): 8, 5, 4
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'CD-I';
UPDATE public.uac SET total_progresiones = 5 WHERE codigo = 'CD-II';
UPDATE public.uac SET total_progresiones = 4 WHERE codigo = 'CD-III';

-- Conciencia Histórica (sems 4-6): 4, 4, 4
UPDATE public.uac SET total_progresiones = 4 WHERE codigo = 'CH-I';
UPDATE public.uac SET total_progresiones = 4 WHERE codigo = 'CH-II';
UPDATE public.uac SET total_progresiones = 4 WHERE codigo = 'CH-III';

-- Ciencias Sociales (sems 1, 2, 4): 4, 4, 3
UPDATE public.uac SET total_progresiones = 4 WHERE codigo = 'CS-I';
UPDATE public.uac SET total_progresiones = 4 WHERE codigo = 'CS-II';
UPDATE public.uac SET total_progresiones = 3 WHERE codigo = 'CS-III';

-- Pensamiento Filosófico y Humanidades (sems 1-3): 5, 5, 4
-- (PFH-I/II/III fueron renombrados en paso 5; progresiones se re-seedean en FASE 4)
UPDATE public.uac SET total_progresiones = 5 WHERE codigo = 'PFH-I';
UPDATE public.uac SET total_progresiones = 5 WHERE codigo = 'PFH-II';
UPDATE public.uac SET total_progresiones = 4 WHERE codigo = 'PFH-III';

-- CNEYT (sems 1-6): 8 cada uno
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'CNEYT-I';
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'CNEYT-II';
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'CNEYT-III';
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'CNEYT-IV';
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'CNEYT-V';
UPDATE public.uac SET total_progresiones = 8 WHERE codigo = 'CNEYT-VI';

-- ---------------------------------------------------------------------------
-- 8. Eliminar progresiones placeholder excedentes (numero > conteo oficial)
--    Solo afecta is_placeholder = true — no toca contenido real
-- ---------------------------------------------------------------------------

-- LC-I: eliminar numeros 9, 10
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'LC-I')
  AND es_placeholder = true AND numero > 8;

-- LC-II: eliminar numeros 9, 10
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'LC-II')
  AND es_placeholder = true AND numero > 8;

-- LC-III: eliminar numeros 8, 9, 10
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'LC-III')
  AND es_placeholder = true AND numero > 7;

-- PM-I: eliminar numeros 8, 9, 10
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'PM-I')
  AND es_placeholder = true AND numero > 7;

-- PM-II: eliminar numeros 7, 8, 9, 10
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'PM-II')
  AND es_placeholder = true AND numero > 6;

-- PM-III: eliminar numeros 7, 8, 9, 10
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'PM-III')
  AND es_placeholder = true AND numero > 6;

-- PM-IV: eliminar numeros 8, 9, 10
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'PM-IV')
  AND es_placeholder = true AND numero > 7;

-- PM-V: eliminar numeros 9, 10
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'PM-V')
  AND es_placeholder = true AND numero > 8;

-- PM-VI: eliminar numeros 9, 10
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'PM-VI')
  AND es_placeholder = true AND numero > 8;

-- IN-II: eliminar numeros 9, 10, 11, 12
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'IN-II')
  AND es_placeholder = true AND numero > 8;

-- IN-III: eliminar numeros 9, 10, 11, 12
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'IN-III')
  AND es_placeholder = true AND numero > 8;

-- IN-IV: eliminar numeros 9, 10, 11, 12
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'IN-IV')
  AND es_placeholder = true AND numero > 8;

-- CD-II: eliminar numeros 6, 7, 8
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'CD-II')
  AND es_placeholder = true AND numero > 5;

-- CD-III: eliminar numeros 5, 6, 7, 8
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'CD-III')
  AND es_placeholder = true AND numero > 4;

-- CH-I: eliminar numeros 5, 6, 7, 8, 9, 10
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'CH-I')
  AND es_placeholder = true AND numero > 4;

-- CH-II: eliminar numeros 5-10
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'CH-II')
  AND es_placeholder = true AND numero > 4;

-- CH-III: eliminar numeros 5-10
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'CH-III')
  AND es_placeholder = true AND numero > 4;

-- CS-I: eliminar numeros 5, 6, 7, 8
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'CS-I')
  AND es_placeholder = true AND numero > 4;

-- CS-II: eliminar numeros 5-10
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'CS-II')
  AND es_placeholder = true AND numero > 4;

-- CS-III: eliminar numeros 4-10
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'CS-III')
  AND es_placeholder = true AND numero > 3;

-- CNEYT-I a VI: eliminar numeros 9, 10 de cada uno
DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'CNEYT-I')
  AND es_placeholder = true AND numero > 8;

DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'CNEYT-II')
  AND es_placeholder = true AND numero > 8;

DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'CNEYT-III')
  AND es_placeholder = true AND numero > 8;

DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'CNEYT-IV')
  AND es_placeholder = true AND numero > 8;

DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'CNEYT-V')
  AND es_placeholder = true AND numero > 8;

DELETE FROM public.progresiones
WHERE uac_id = (SELECT id FROM public.uac WHERE codigo = 'CNEYT-VI')
  AND es_placeholder = true AND numero > 8;

-- ---------------------------------------------------------------------------
-- 9. Verificación final
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_total_uac    int;
  v_total_prog   int;
  v_sem1_count   int;
  v_lc_count     int;
  v_pfh_count    int;
  v_inv_count    int;
BEGIN
  SELECT COUNT(*)  INTO v_total_uac  FROM public.uac;
  SELECT COUNT(*)  INTO v_total_prog FROM public.progresiones;
  SELECT COUNT(*)  INTO v_sem1_count FROM public.uac WHERE semestre = 1;
  SELECT COUNT(*)  INTO v_lc_count   FROM public.uac WHERE codigo LIKE 'LC-%';
  SELECT COUNT(*)  INTO v_pfh_count  FROM public.uac WHERE codigo LIKE 'PFH-%';
  SELECT COUNT(*)  INTO v_inv_count  FROM public.uac WHERE codigo IN ('LC-IV','LC-V','LC-VI','HUM-I','HUM-II','HUM-III');

  RAISE NOTICE '=== Verificación post-migración Modelo Educativo 2025 ===';
  RAISE NOTICE 'Total UAC:           % (esperado: 32)', v_total_uac;
  RAISE NOTICE 'UAC semestre 1:      % (esperado: 7)',  v_sem1_count;
  RAISE NOTICE 'UAC LC-*:            % (esperado: 3)',  v_lc_count;
  RAISE NOTICE 'UAC PFH-*:           % (esperado: 3)',  v_pfh_count;
  RAISE NOTICE 'UAC invalidas (0):   %',                v_inv_count;
  RAISE NOTICE 'Total progresiones:  % (variable, depende de seeds previos)', v_total_prog;

  IF v_inv_count > 0 THEN
    RAISE EXCEPTION 'FALLO: todavía existen % UAC con códigos obsoletos.', v_inv_count;
  END IF;

  IF v_total_uac != 32 THEN
    RAISE EXCEPTION 'FALLO: total UAC es % pero se esperaban 32.', v_total_uac;
  END IF;

  RAISE NOTICE '======================================================';
  RAISE NOTICE 'Migración 04 aplicada correctamente.';
  RAISE NOTICE 'Próximo paso: ejecutar seed scripts de FASE 4 para Semestre 1.';
  RAISE NOTICE '======================================================';
END $$;

COMMIT;
