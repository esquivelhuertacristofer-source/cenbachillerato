-- =============================================================================
-- CEN Bachillerato — Migración 24: url_imagen en schema_validacion (refuerzo visual)
-- Fecha: 2026-07-17
-- Descripción:
--   Agrega la propiedad opcional "url_imagen" (string) al schema_validacion
--   de los 9 tipos de actividad que aún no tenían campo de imagen propio.
--   Espejo de los cambios ya aplicados en:
--     - src/types/activities.ts (interfaces Contenido*)
--     - src/lib/activities/validators.ts (Contenido*Schema)
--   No afecta 'infografia' (ya tiene url_imagen requerido), 'video_con_preguntas'
--   (usa url_miniatura) ni 'simulacion' (fuera de alcance). jsonb_set solo toca
--   la ruta {properties,url_imagen}: no altera campos anidados existentes como
--   quiz_multiple_opcion.preguntas[].imagen_url, ejercicio_matematico.imagen_problema
--   o glosario_interactivo.terminos[].imagen_url.
-- =============================================================================

UPDATE public.tipos_actividad
SET schema_validacion = jsonb_set(
  schema_validacion,
  '{properties,url_imagen}',
  '{"type": "string", "description": "Imagen de ambientación específica para esta actividad (fallback: pool temático por UAC)"}'::jsonb,
  true
)
WHERE codigo IN (
  'lectura',
  'quiz_multiple_opcion',
  'quiz_verdadero_falso',
  'fill_blanks',
  'ejercicio_matematico',
  'reflexion_escrita',
  'debate_estructurado',
  'glosario_interactivo',
  'autoevaluacion'
);
