-- ============================================================
-- 23_rpc_resumen_stats_alumno.sql
-- Agregados de "Mi Progreso" calculados EN Postgres (control de egress).
--
-- Contexto (escalabilidad a costo cero; plan Free de Supabase = 5 GB egress/mes):
-- getResumenActividadAlumno (src/lib/queries/progreso.ts) bajaba el HISTORIAL
-- COMPLETO de intentos del alumno (join intentos→actividades→progresiones→uac,
-- sin limit) solo para derivar 4 agregados en memoria: totalActividades,
-- totalMinutos, materiaMasFuerte y tipoActividades (top 5). Con 15-20k alumnos
-- activos eso son decenas de GB/mes que viajan por red. Esta RPC calcula los
-- agregados en la base y devuelve ~200 bytes de jsonb por request.
--
-- Diseño de seguridad:
--   · SECURITY INVOKER + auth.uid() adentro y SIN parámetro de user_id: cada
--     quien solo puede calcular SUS propias stats; no hay forma de pedir las
--     de otro alumno ni manipulando el request a mano.
--   · Al ser INVOKER, las policies de RLS siguen aplicando en los joins
--     (p. ej. el alumno solo "ve" actividades con estado 'publicada') — igual
--     que cuando el cliente hacía el select anidado vía PostgREST.
--   · SET search_path = '' + referencias schema-cualificadas (public.*):
--     inmune a suplantación de objetos vía search_path.
--   · REVOKE de PUBLIC y anon; GRANT EXECUTE solo a authenticated.
--
-- Réplica EXACTA de las fórmulas del TS que sustituye (deriveStats):
--   · totalActividades = nº de intentos status='completed' con completed_at no
--     nulo y actividad visible (el JOIN interno equivale al filtro
--     `i.actividades` del código).
--   · totalMinutos     = Σ coalesce(duracion_estimada_minutos, 5)  ← el "?? 5".
--   · materiaMasFuerte = la UAC con más intentos; los empates los gana la UAC
--     con el intento MÁS RECIENTE (el TS recorría el historial en orden
--     completed_at DESC y solo reemplazaba con ">" estricto ⇒ la primera
--     aparición ganaba). Aquí: ORDER BY count DESC, max(completed_at) DESC.
--   · tipoActividades  = top 5 de tipos por nº de intentos, mismo desempate.
--     (Si dos tipos empataran también en su completed_at máximo, el orden
--     entre ellos era indefinido en JS y sigue siéndolo aquí — caso degenerado
--     sin efecto visible.)
--
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor.
-- ============================================================

-- La columna duracion_estimada_minutos que el TS siempre leyó (con `?? 5`) no
-- aparece en NINGUNA migración del repo. Si ya existe en la BD viva, esto es
-- un no-op; si no existía, queda toda en NULL y coalesce(...,5) reproduce
-- exactamente el comportamiento del código (5 min por actividad). Sin esto,
-- el CREATE FUNCTION de abajo fallaría al validar el cuerpo (LANGUAGE sql
-- valida las columnas referenciadas al crear la función).
ALTER TABLE public.actividades
  ADD COLUMN IF NOT EXISTS duracion_estimada_minutos int;

COMMENT ON COLUMN public.actividades.duracion_estimada_minutos IS
  'Minutos estimados de la actividad; NULL ⇒ se asume 5 (stats de progreso del alumno).';

-- Nota: dollar-quoting CON etiqueta ($fn$), no $$ pelado — al pegar en el SQL
-- Editor los $$ se mutilan (ver nota en 14_rls_admin_intentos_escuela.sql);
-- la etiqueta sí sobrevive (16_rls_lock_profile_y_intentos.sql usa $protect$).
CREATE OR REPLACE FUNCTION public.resumen_stats_alumno()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $fn$
  WITH base AS (
    -- Universo idéntico al del select anidado que había en progreso.ts:
    -- intentos completados del alumno con su actividad visible. progresiones y
    -- uac van en LEFT JOIN porque una actividad sin UAC sí cuenta para totales
    -- y tipos (el TS hacía act.progresiones?.uac y solo la excluía de
    -- materiaMasFuerte).
    SELECT
      i.completed_at,
      COALESCE(a.duracion_estimada_minutos, 5) AS minutos,
      a.tipo_codigo,
      u.codigo AS uac_codigo,
      u.nombre AS uac_nombre
    FROM public.intentos i
    JOIN public.actividades a ON a.id = i.actividad_id
    LEFT JOIN public.progresiones p ON p.id = a.progresion_id
    LEFT JOIN public.uac u ON u.id = p.uac_id
    WHERE i.user_id = auth.uid()
      AND i.status = 'completed'
      AND i.completed_at IS NOT NULL
  ),
  tipos AS (
    SELECT b.tipo_codigo, COUNT(*)::int AS cantidad, MAX(b.completed_at) AS ultimo
    FROM base b
    GROUP BY b.tipo_codigo
    ORDER BY COUNT(*) DESC, MAX(b.completed_at) DESC
    LIMIT 5
  ),
  materia AS (
    SELECT b.uac_nombre AS nombre, COUNT(*)::int AS cantidad
    FROM base b
    WHERE b.uac_codigo IS NOT NULL
    GROUP BY b.uac_codigo, b.uac_nombre
    ORDER BY COUNT(*) DESC, MAX(b.completed_at) DESC
    LIMIT 1
  )
  SELECT jsonb_build_object(
    -- Claves EXACTAS de la interfaz EstadisticasProgreso: el TS consume este
    -- jsonb tal cual (normalizarStatsRpc solo blinda contra nulos).
    'totalActividades', (SELECT COUNT(*)::int FROM base),
    'totalMinutos',     (SELECT COALESCE(SUM(b.minutos), 0)::int FROM base b),
    'materiaMasFuerte', (SELECT jsonb_build_object('nombre', m.nombre, 'cantidad', m.cantidad) FROM materia m),
    'tipoActividades',  COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('tipo', t.tipo_codigo, 'cantidad', t.cantidad)
                        ORDER BY t.cantidad DESC, t.ultimo DESC)
       FROM tipos t),
      '[]'::jsonb
    )
  );
$fn$;

-- Solo usuarios con sesión pueden ejecutarla (y solo ven lo suyo por auth.uid()).
REVOKE ALL ON FUNCTION public.resumen_stats_alumno() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resumen_stats_alumno() TO authenticated;

-- ============================================================
-- Verificación post-migración:
--   1) En el SQL Editor (rol postgres ⇒ auth.uid() = NULL) debe devolver vacío:
--        SELECT public.resumen_stats_alumno();
--        -- {"totalMinutos": 0, "totalActividades": 0,
--        --  "materiaMasFuerte": null, "tipoActividades": []}
--   2) Con la sesión de un ALUMNO real (desde la app), los números de
--      /hub/progreso deben coincidir con los que mostraba antes de la
--      migración (mismo total, minutos, materia más fuerte y top de tipos).
--   3) Si el Worker sigue registrando el warn "[progreso] La RPC
--      resumen_stats_alumno no existe aún" después de aplicar esto, recargar
--      el schema cache de PostgREST:  NOTIFY pgrst, 'reload schema';
--   4) La llamada anónima debe fallar (sin GRANT a anon):
--        curl -X POST "$SUPABASE_URL/rest/v1/rpc/resumen_stats_alumno" \
--          -H "apikey: $ANON_KEY"   → 401/403 (permission denied).
-- ============================================================
