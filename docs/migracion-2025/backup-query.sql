-- Ejecutar en Supabase SQL Editor ANTES de la migración.
-- Guardar el resultado como backup-estructura-pre-migracion-LIVE.json

SELECT json_build_object(
  'metadata', json_build_object(
    'fecha', now()::text,
    'fuente', 'Supabase live DB — pre-migración Modelo Educativo 2025'
  ),
  'uac', json_agg(
    json_build_object(
      'codigo', u.codigo,
      'nombre', u.nombre,
      'semestre', u.semestre,
      'total_progresiones', u.total_progresiones,
      'progresiones', (
        SELECT json_agg(
          json_build_object(
            'codigo', p.codigo,
            'numero', p.numero,
            'titulo', p.titulo,
            'es_placeholder', p.es_placeholder,
            'meta_aprendizaje', p.meta_aprendizaje,
            'descripcion_extendida', p.descripcion_extendida
          ) ORDER BY p.numero
        )
        FROM progresiones p WHERE p.uac_id = u.id
      )
    ) ORDER BY u.semestre, u.codigo
  )
)
FROM uac u;
