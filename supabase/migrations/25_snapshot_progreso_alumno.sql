-- ============================================================
-- 25_snapshot_progreso_alumno.sql
-- Snapshot denormalizado del progreso del alumno (1 fila por alumno) para que
-- el hub resuelva "qué actividades completó" con UN lookup por PK en vez de un
-- scan `intentos ... WHERE user_id AND actividad_id IN (…decenas de ids…)` por
-- cada navegación.
--
-- Contexto (escalabilidad a costo cero, ~5-7k alumnos concurrentes):
-- El driver de gasto NO es el tamaño de los datos sino la carga concurrente
-- autenticada contra Postgres. El catálogo ya se sirve cacheado desde KV
-- (catalog-cache.ts) y no toca la base. Lo que queda tocándola son las lecturas
-- PERSONALES del hub (getProgresionesConEstado, getProgresoSemestre, racha,
-- última actividad…), que hoy escanean `intentos` con un IN sobre los ids de
-- actividad de la UAC/semestre en cada request. Este snapshot colapsa todas esas
-- lecturas a un solo SELECT por PK (user_id) contra una fila pequeña.
--
-- `intentos` SIGUE siendo la fuente de verdad. El snapshot es una CACHÉ
-- derivada, reconstruible en cualquier momento desde `intentos` — nunca una
-- segunda fuente de verdad.
--
-- Diseño de SEGURIDAD (datos de menores; RLS extremadamente delicada):
--   · El alumno solo puede LEER su propia fila (SELECT own). No hay policy de
--     INSERT/UPDATE/DELETE para el alumno ⇒ denegadas por defecto. Esto es
--     deliberado: la migración 16 volvió `intentos` append-only para el alumno
--     justamente para que no pudiera forjar su historial y auto-desbloquear
--     contenido. Un snapshot ESCRIBIBLE por el cliente reintroduciría ese vector
--     (falsificar "ya completé X"). Por eso el snapshot lo mantiene SOLO un
--     trigger SECURITY DEFINER del lado del servidor, disparado por el INSERT
--     legítimo en `intentos`. El alumno nunca lo escribe.
--   · El trigger es AFTER INSERT: un INSERT duplicado (23505 por el UNIQUE
--     (user_id, actividad_id, status)) NO inserta fila ⇒ NO dispara el trigger
--     ⇒ no hay doble conteo.
--   · GARANTÍA CRÍTICA: el trigger corre en la MISMA transacción que el INSERT
--     del intento. Bajo ninguna circunstancia debe abortarlo (perder una entrega
--     es inaceptable). Todo el cuerpo va envuelto en EXCEPTION WHEN OTHERS THEN
--     RETURN NEW: si el mantenimiento del snapshot falla, el intento se registra
--     igual y el snapshot queda ligeramente desfasado hasta la próxima entrega o
--     una reconstrucción manual. La caché puede desfasarse; el historial no.
--
-- FALLA ABIERTO en la app: el read path de hub.ts intenta el snapshot y, si la
-- fila no existe / la tabla no existe todavía / hay cualquier error, cae al scan
-- vivo de `intentos` (comportamiento actual). Por eso el CÓDIGO es seguro de
-- desplegar ANTES de aplicar esta migración: sin la tabla, todo el hub se
-- comporta exactamente como hoy.
--
-- Idempotente y re-ejecutable: CREATE TABLE IF NOT EXISTS, CREATE OR REPLACE
-- FUNCTION, DROP POLICY/TRIGGER IF EXISTS. Volver a correr el bloque de
-- reconstrucción del final es una operación segura (rehace el snapshot desde
-- `intentos`).
--
-- Nota de dollar-quoting: etiqueta ($snap$ / $rebuild$), no $$ pelado — al pegar
-- en el SQL Editor los $$ se mutilan (ver 14_ y 16_); la etiqueta sobrevive.
--
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor.
-- ============================================================

-- ── Tabla: 1 fila por alumno ───────────────────────────────────────────────
-- `completadas` es un objeto jsonb { "<actividad_id>": {"i","s","t"} } donde:
--   i = id del intento (uuid como texto)  → alimenta ActividadConEstado.intentoId
--   s = started_at (timestamptz)          → racha, stats de la semana, ordenamiento
--   t = tiempo_segundos (int|null)         → minutos de la semana
-- Solo entran actividades con intento 'completed' (paridad con el "set de
-- completadas" que deriva el hub; no existe estado 'in_progress' persistido).
CREATE TABLE IF NOT EXISTS public.progreso_alumno_snapshot (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  completadas jsonb NOT NULL DEFAULT '{}'::jsonb,
  actualizado_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.progreso_alumno_snapshot IS
  'Caché derivada y reconstruible del progreso por alumno (1 fila/alumno). Fuente de verdad: public.intentos. Mantenida por trigger SECURITY DEFINER; el alumno solo la lee.';

ALTER TABLE public.progreso_alumno_snapshot ENABLE ROW LEVEL SECURITY;

-- ── RLS: el alumno SOLO lee su propia fila ─────────────────────────────────
-- Sin policy de INSERT/UPDATE/DELETE para authenticated ⇒ denegadas. El trigger
-- (SECURITY DEFINER) y la reconstrucción (rol postgres en el SQL Editor)
-- escriben saltándose RLS; el alumno jamás escribe aquí.
DROP POLICY IF EXISTS "students can read own snapshot" ON public.progreso_alumno_snapshot;
CREATE POLICY "students can read own snapshot"
  ON public.progreso_alumno_snapshot FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ── Trigger: mantener el snapshot al insertar un intento ───────────────────
-- SECURITY DEFINER para escribir la tabla saltándose RLS. search_path = '' +
-- referencias schema-cualificadas (inmune a suplantación por search_path).
CREATE OR REPLACE FUNCTION public.actualizar_snapshot_progreso()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $snap$
BEGIN
  -- Solo los intentos 'completed' alimentan el snapshot. Un status distinto no
  -- representa una actividad completada y no debe entrar al "set de completadas".
  IF NEW.status IS DISTINCT FROM 'completed' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.progreso_alumno_snapshot AS s (user_id, completadas, actualizado_at)
  VALUES (
    NEW.user_id,
    jsonb_build_object(
      NEW.actividad_id::text,
      jsonb_build_object(
        'i', NEW.id::text,
        's', NEW.started_at,
        't', NEW.tiempo_segundos
      )
    ),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
    -- Concatenación jsonb: conserva las demás actividades y agrega/sobrescribe
    -- solo la de este intento. Idempotente por actividad.
    SET completadas = s.completadas || excluded.completadas,
        actualizado_at = now();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- El snapshot es una caché reconstruible: JAMÁS abortar el INSERT del
    -- intento (garantía de no perder entregas). Se traga el error; el intento
    -- se registra igual y el snapshot se repara en la próxima entrega o con una
    -- reconstrucción manual (ver función y bloque de abajo).
    RETURN NEW;
END;
$snap$;

REVOKE ALL ON FUNCTION public.actualizar_snapshot_progreso() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_snapshot_progreso ON public.intentos;
CREATE TRIGGER trg_snapshot_progreso
  AFTER INSERT ON public.intentos
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_snapshot_progreso();

-- ── Reconstrucción / backfill ──────────────────────────────────────────────
-- Rehace el snapshot desde `intentos` (fuente de verdad). Con p_user_id NULL
-- rehace TODOS los alumnos (backfill inicial); con un uuid, solo ese alumno
-- (reparación puntual de desfase). SECURITY DEFINER + revoke total: solo se
-- corre desde el SQL Editor (rol postgres) — no expuesta a la app.
CREATE OR REPLACE FUNCTION public.reconstruir_snapshot_progreso(p_user_id uuid DEFAULT NULL)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $rebuild$
DECLARE
  _filas int;
BEGIN
  INSERT INTO public.progreso_alumno_snapshot (user_id, completadas, actualizado_at)
  SELECT
    i.user_id,
    jsonb_object_agg(
      i.actividad_id::text,
      jsonb_build_object('i', i.id::text, 's', i.started_at, 't', i.tiempo_segundos)
    ),
    now()
  FROM (
    -- Si por algún motivo hubiera más de un intento 'completed' por
    -- (user, actividad) —no debería, por el UNIQUE (user_id, actividad_id,
    -- status)— nos quedamos con el más reciente por started_at, igual que el
    -- "order by started_at desc" del hub.
    SELECT DISTINCT ON (i2.user_id, i2.actividad_id)
      i2.user_id, i2.actividad_id, i2.id, i2.started_at, i2.tiempo_segundos
    FROM public.intentos i2
    WHERE i2.status = 'completed'
      AND (p_user_id IS NULL OR i2.user_id = p_user_id)
    ORDER BY i2.user_id, i2.actividad_id, i2.started_at DESC
  ) i
  GROUP BY i.user_id
  ON CONFLICT (user_id) DO UPDATE
    SET completadas = excluded.completadas,
        actualizado_at = now();

  GET DIAGNOSTICS _filas = ROW_COUNT;
  RETURN _filas;
END;
$rebuild$;

REVOKE ALL ON FUNCTION public.reconstruir_snapshot_progreso(uuid) FROM PUBLIC, anon, authenticated;

-- Backfill inicial de todos los alumnos con intentos existentes.
SELECT public.reconstruir_snapshot_progreso();

-- Recargar el schema cache de PostgREST para que la app vea la tabla nueva.
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- Verificación post-migración:
--   1) La tabla existe y tiene filas para alumnos con historial:
--        SELECT count(*) FROM public.progreso_alumno_snapshot;
--   2) El snapshot de un alumno concreto cuadra con sus intentos completados:
--        SELECT (SELECT count(*) FROM jsonb_object_keys(completadas))
--        FROM public.progreso_alumno_snapshot WHERE user_id = '<uuid-alumno>';
--        -- debe igualar:
--        SELECT count(DISTINCT actividad_id) FROM public.intentos
--        WHERE user_id = '<uuid-alumno>' AND status = 'completed';
--   3) El trigger mantiene el snapshot: inserta un intento nuevo (como ese
--      alumno, desde la app) y verifica que su actividad aparece en completadas.
--   4) RLS: como ALUMNO, SELECT sobre progreso_alumno_snapshot de OTRO user_id
--      devuelve 0 filas; UPDATE/INSERT/DELETE fallan (sin policy).
--   5) Si el snapshot de algún alumno se desfasa, repararlo con:
--        SELECT public.reconstruir_snapshot_progreso('<uuid-alumno>');
--      o TODOS con:  SELECT public.reconstruir_snapshot_progreso();
-- ============================================================
