-- =============================================================================
-- CEN Bachillerato — Migración 27: la imagen de una infografía es opcional
-- =============================================================================
-- QUÉ CAMBIA
--   `tipos_actividad.schema_validacion` del tipo 'infografia' deja de exigir
--   "url_imagen": pasa de required ["titulo","url_imagen"] a required ["titulo"].
--
-- POR QUÉ
--   El campo era obligatorio desde la migración 03, y por eso 27 de las 29
--   infografías apuntaban a `/placeholder/infografia.svg` — un archivo que se
--   borró del disco hace meses. El esquema pedía una URL y recibió una que no
--   lleva a ningún lado: la peor forma de cumplir una restricción.
--
--   Al limpiar esos marcadores (2026-09-02), esas 27 filas quedaron
--   incumpliendo su propio esquema. Devolverles una URL falsa habría repetido
--   el error. Lo correcto es reconocer que una infografía NO NECESITA imagen:
--   `<LaminaInfografia>` la dibuja con sus propios `puntos_clave`, y esa lámina
--   reflowea en un teléfono, la lee un lector de pantalla y no puede dar 404.
--   La imagen es el caso especial; la lámina dibujada es el caso normal.
--
-- ESPEJO EN CÓDIGO
--   `src/lib/activities/validators.ts` → `ContenidoInfografiaSchema.url_imagen`
--   ya es `.optional()`. Los dos tienen que decir lo mismo.
--
-- IDEMPOTENTE: reescribe `required` a un valor fijo; correrla dos veces no
-- cambia nada.
-- =============================================================================

UPDATE tipos_actividad
SET schema_validacion = jsonb_set(
      schema_validacion,
      '{required}',
      '["titulo"]'::jsonb,
      true
    )
WHERE codigo = 'infografia';

-- Comprobación:
--   SELECT codigo, schema_validacion->'required' FROM tipos_actividad
--   WHERE codigo = 'infografia';
--   -- esperado: ["titulo"]
