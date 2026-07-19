-- ============================================================
-- monitoreo-supabase.sql
--
-- Consultas de SOLO LECTURA para pegar en el SQL Editor de Supabase.
-- Objetivo: vigilar los techos del plan Free ANTES de que un piloto con
-- miles de alumnos los alcance en producción, sin depender de recordar
-- revisar el dashboard.
--
-- Uso: correr cada bloque por separado (el SQL Editor de Supabase solo
-- muestra el resultado de la ÚLTIMA sentencia si se pega el archivo entero
-- de un tirón). Cero DROP/UPDATE/DELETE/ALTER — no modifica nada.
--
-- Ver también:
--   - docs/diagnostico/OPTIMIZACION-ESCALA-2026-07-17.md (contexto completo
--     de la campaña de optimización a costo cero).
--   - .github/workflows/backup-supabase.yml y scripts/backup-supabase.ps1
--     (el respaldo real; este archivo solo mide, no protege datos).
-- ============================================================

-- 1) Tamaño total de la base de datos, formateado legible + porcentaje del
--    techo de 500 MB del plan Free de Supabase.
SELECT
  pg_size_pretty(pg_database_size(current_database())) AS tamano_bd,
  round(
    100.0 * pg_database_size(current_database()) / (500.0 * 1024 * 1024),
    1
  ) AS porcentaje_de_500mb;

-- 2) Top 10 tablas por tamaño TOTAL (datos + índices + TOAST) — para
--    identificar qué tabla empuja el crecimiento antes de que sea urgente.
SELECT
  schemaname || '.' || relname AS tabla,
  pg_size_pretty(pg_total_relation_size(relid)) AS tamano_total
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;

-- 3) Conteo de filas de public.intentos — la tabla de mayor escritura de
--    toda la plataforma (una fila por actividad completada, por alumno).
SELECT count(*) AS total_intentos FROM public.intentos;

-- 4) Peso real acumulado de las respuestas guardadas en
--    public.intentos.respuestas (jsonb) — el candidato #1 a crecer sin
--    control si un alumno pega texto largo en una actividad de reflexión
--    abierta. Desde la campaña de optimización (ver
--    docs/diagnostico/OPTIMIZACION-ESCALA-2026-07-17.md), las respuestas de
--    más de 2 KB se descargan a R2 y aquí solo queda un marcador liviano
--    ({"__r2": 1}), así que este número debería mantenerse acotado incluso
--    con miles de reflexiones largas.
SELECT
  pg_size_pretty(sum(pg_column_size(respuestas))) AS peso_total_respuestas,
  pg_size_pretty(coalesce(avg(pg_column_size(respuestas)), 0)::bigint) AS peso_promedio_por_intento
FROM public.intentos;

-- ============================================================
-- UMBRALES DE DECISIÓN — revisar contra estas consultas periódicamente
-- (recomendado: antes de dar de alta cada escuela nueva, y una vez al mes
-- durante el piloto):
--
--   · Tamaño de BD ≥ 350 MB (70% de los 500 MB del plan Free)
--       → contratar Supabase Pro ($25/mes; sube a 8 GB + backups
--         automáticos/PITR reales, lo que además vuelve redundante — pero
--         no innecesario de mantener como respaldo adicional — el workflow
--         de backup-supabase.yml).
--
--   · Egress (bandwidth) — NO hay una consulta SQL para esto; Supabase no
--     lo expone vía pg_catalog. Vigilar el dashboard de Supabase
--     (Project Settings → Usage). Umbral de alerta: ≥4 GB/mes del cupo de
--     5 GB uncached + 5 GB cached (cupo COMPARTIDO entre DB, Auth, Storage,
--     Edge Functions y Realtime — cualquiera de esos consume del mismo
--     total).
--
--   · Cloudflare Workers ≥ 80,000 requests/día (80% del techo duro de
--     100,000/día del plan Free) → contratar Workers Paid ($5/mes; sube a
--     10M requests/mes). Se verifica en el dashboard de Cloudflare
--     (Workers & Pages → Analytics), no con SQL — no es dato de Supabase.
-- ============================================================
