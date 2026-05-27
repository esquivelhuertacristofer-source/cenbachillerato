-- =============================================================================
-- CEN Bachillerato — Alta masiva: campo must_change_password
-- Ejecutar en Supabase SQL Editor antes de usar la funcionalidad de alta masiva.
-- =============================================================================

-- 1. Agregar columna a profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.must_change_password IS
  'Si true, el usuario debe cambiar su password en primer login antes de acceder al sistema';

-- 2. Actualizar el trigger handle_new_user para que propague must_change_password
--    desde user_metadata cuando se crea el usuario via admin API.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _group_id uuid;
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, role,
    escuela_id, semestre, area_eleccion,
    must_change_password
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    (NEW.raw_user_meta_data->>'escuela_id')::uuid,
    (NEW.raw_user_meta_data->>'semestre')::int,
    NEW.raw_user_meta_data->>'area_eleccion',
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, false)
  );

  -- Vincular a grupo si viene group_id en metadata
  _group_id := (NEW.raw_user_meta_data->>'group_id')::uuid;
  IF _group_id IS NOT NULL THEN
    INSERT INTO public.alumnos_grupos (id_alumno, id_grupo)
    VALUES (NEW.id, _group_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
