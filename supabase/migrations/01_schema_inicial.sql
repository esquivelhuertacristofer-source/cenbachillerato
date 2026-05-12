-- =============================================================================
-- CEN Bachillerato — Schema inicial
-- Acuerdo 09/08/23 (MCCEMS vigente) + compatibilidad Modelo Educativo 2025
-- =============================================================================

-- TENANT
CREATE TABLE public.escuelas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  cct text UNIQUE,
  subsistema text CHECK (subsistema IN (
    'DGB', 'DGETI', 'DGETA', 'DGBTED', 'CONALEP', 'CECYT',
    'CCH', 'ENP', 'BGE', 'EMSAD', 'BD', 'particular', 'otro'
  )),
  rvoe text,
  estado text,
  municipio text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- USUARIOS
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  role text NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'teacher', 'admin', 'super_admin')),
  escuela_id uuid REFERENCES public.escuelas(id) ON DELETE SET NULL,
  semestre int CHECK (semestre IS NULL OR (semestre >= 1 AND semestre <= 6)),
  area_eleccion text CHECK (
    area_eleccion IS NULL OR
    area_eleccion IN ('ciencias-sociales', 'ciencias-naturales-mate', 'humanidades')
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- GRUPOS
CREATE TABLE public.grupos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  semestre int NOT NULL CHECK (semestre >= 1 AND semestre <= 6),
  escuela_id uuid NOT NULL REFERENCES public.escuelas(id) ON DELETE CASCADE,
  id_docente uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  uac_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (escuela_id, nombre)
);

CREATE TABLE public.alumnos_grupos (
  id_alumno uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  id_grupo uuid NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id_alumno, id_grupo)
);

-- ESTRUCTURA CURRICULAR
CREATE TABLE public.componentes_curriculares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  tipo text NOT NULL CHECK (tipo IN (
    'fundamental', 'fundamental-extendido', 'ampliado', 'laboral'
  ))
);

CREATE TABLE public.recursos_sociocognitivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  color text,
  icono text,
  orden int
);

CREATE TABLE public.areas_conocimiento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  color text,
  icono text,
  orden int
);

CREATE TABLE public.recursos_socioemocionales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  orden int
);

-- UAC (Unidad de Aprendizaje Curricular)
CREATE TABLE public.uac (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  semestre int NOT NULL CHECK (semestre >= 1 AND semestre <= 6),
  componente_id uuid NOT NULL REFERENCES public.componentes_curriculares(id),
  recurso_id uuid REFERENCES public.recursos_sociocognitivos(id),
  area_id uuid REFERENCES public.areas_conocimiento(id),
  orden int,
  total_progresiones int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- PROGRESIONES DE APRENDIZAJE
CREATE TABLE public.progresiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  uac_id uuid NOT NULL REFERENCES public.uac(id) ON DELETE CASCADE,
  numero int NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  meta_aprendizaje text,
  categoria text,
  subcategoria text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (uac_id, numero)
);

-- ACTIVIDADES
CREATE TABLE public.actividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  tipo text NOT NULL,
  contenido jsonb NOT NULL,
  progresion_id uuid REFERENCES public.progresiones(id),
  xp int DEFAULT 10,
  estado text DEFAULT 'borrador'
    CHECK (estado IN ('borrador', 'revision', 'publicada', 'archivada')),
  escuela_owner_id uuid REFERENCES public.escuelas(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- INTENTOS
CREATE TABLE public.intentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actividad_id uuid NOT NULL REFERENCES public.actividades(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'failed', 'abandoned')),
  score int CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  tiempo_segundos int,
  respuestas jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (user_id, actividad_id, status)
);

-- CONSENTIMIENTOS LEGALES
CREATE TABLE public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('privacy', 'terms')),
  document_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- =============================================================================
-- FUNCIONES SECURITY DEFINER (evitan recursión en RLS)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_escuela_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT escuela_id FROM public.profiles WHERE id = auth.uid();
$$;

-- =============================================================================
-- TRIGGER: crear profile automáticamente al registrarse
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _group_id uuid;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, escuela_id, semestre, area_eleccion)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    (NEW.raw_user_meta_data->>'escuela_id')::uuid,
    (NEW.raw_user_meta_data->>'semestre')::int,
    NEW.raw_user_meta_data->>'area_eleccion'
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- TRIGGER: proteger campos sensibles del profile (anti-escalada de privilegios)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.protect_user_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_role text;
BEGIN
  _caller_role := public.get_my_role();

  -- Solo admin/super_admin pueden cambiar el role
  IF NEW.role <> OLD.role AND _caller_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'No tienes permisos para cambiar el rol.';
  END IF;

  -- Solo super_admin puede promover a super_admin
  IF NEW.role = 'super_admin' AND _caller_role <> 'super_admin' THEN
    RAISE EXCEPTION 'Solo un super_admin puede crear otro super_admin.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_profile_fields();

-- =============================================================================
-- RLS
-- =============================================================================

ALTER TABLE public.escuelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumnos_grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.componentes_curriculares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos_sociocognitivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas_conocimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos_socioemocionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uac ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Estructura curricular: lectura pública para usuarios autenticados
CREATE POLICY "authenticated can read componentes"
  ON public.componentes_curriculares FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated can read recursos_sociocognitivos"
  ON public.recursos_sociocognitivos FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated can read areas_conocimiento"
  ON public.areas_conocimiento FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated can read recursos_socioemocionales"
  ON public.recursos_socioemocionales FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated can read uac"
  ON public.uac FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated can read progresiones"
  ON public.progresiones FOR SELECT TO authenticated USING (true);

-- Actividades: lectura de publicadas
CREATE POLICY "authenticated can read actividades publicadas"
  ON public.actividades FOR SELECT TO authenticated
  USING (estado = 'publicada');

CREATE POLICY "admin can manage actividades"
  ON public.actividades FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin', 'super_admin'));

-- Profiles: cada usuario ve su propio perfil; admin ve todos de su escuela
CREATE POLICY "users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users can update own profile (non-role fields)"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "admin can read profiles in their escuela"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.get_my_role() IN ('admin', 'super_admin') AND
    escuela_id = public.get_my_escuela_id()
  );

-- Escuelas: admin de la escuela
CREATE POLICY "admin can read own escuela"
  ON public.escuelas FOR SELECT TO authenticated
  USING (
    id = public.get_my_escuela_id() OR
    public.get_my_role() = 'super_admin'
  );

CREATE POLICY "super_admin can manage escuelas"
  ON public.escuelas FOR ALL TO authenticated
  USING (public.get_my_role() = 'super_admin');

-- Grupos: docente y admin de la misma escuela
CREATE POLICY "admin/teacher can read grupos"
  ON public.grupos FOR SELECT TO authenticated
  USING (
    escuela_id = public.get_my_escuela_id() AND
    public.get_my_role() IN ('teacher', 'admin', 'super_admin')
  );

CREATE POLICY "admin can manage grupos"
  ON public.grupos FOR ALL TO authenticated
  USING (
    escuela_id = public.get_my_escuela_id() AND
    public.get_my_role() IN ('admin', 'super_admin')
  );

-- alumnos_grupos: alumno ve sus grupos
CREATE POLICY "student can read own alumnos_grupos"
  ON public.alumnos_grupos FOR SELECT TO authenticated
  USING (id_alumno = auth.uid());

-- Intentos: propios del alumno
CREATE POLICY "students can manage own intentos"
  ON public.intentos FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "teacher can read intentos in their groups"
  ON public.intentos FOR SELECT TO authenticated
  USING (
    public.get_my_role() IN ('teacher', 'admin', 'super_admin')
  );

-- Consentimientos: propios
CREATE POLICY "users can manage own consents"
  ON public.user_consents FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- SEED: Datos curriculares MCCEMS (estáticos, no cambian)
-- =============================================================================

INSERT INTO public.componentes_curriculares (codigo, nombre, descripcion, tipo) VALUES
  ('CF', 'Currículum Fundamental', 'Tronco común obligatorio para todos los subsistemas de bachillerato.', 'fundamental'),
  ('CFE', 'Currículum Fundamental Extendido', 'Áreas de conocimiento y asignaturas optativas según área de elección.', 'fundamental-extendido'),
  ('CA', 'Currículum Ampliado', 'Recursos socioemocionales y ámbitos de formación integral.', 'ampliado'),
  ('CL', 'Currículum Laboral', 'Formación técnica para bachilleratos tecnológicos y bivalentes.', 'laboral');

INSERT INTO public.recursos_sociocognitivos (codigo, nombre, descripcion, color, icono, orden) VALUES
  ('RSC-LC', 'Lengua y Comunicación', 'Desarrolla competencias comunicativas orales, escritas y digitales en contextos académicos y sociales.', '#2563eb', '📝', 1),
  ('RSC-PM', 'Pensamiento Matemático', 'Fomenta el razonamiento lógico, cuantitativo y espacial para resolver problemas en contextos reales.', '#9333ea', '🔢', 2),
  ('RSC-CH', 'Conciencia Histórica', 'Analiza procesos históricos para comprender el presente y proyectar el futuro con sentido crítico.', '#d97706', '🏛️', 3),
  ('RSC-CD', 'Cultura Digital', 'Desarrolla competencias para el uso ético, crítico y creativo de tecnologías digitales.', '#0d9488', '💻', 4),
  ('RSC-IN', 'Inglés', 'Fortalece la competencia comunicativa en inglés para contextos académicos y laborales globales.', '#dc2626', '🌐', 5);

INSERT INTO public.areas_conocimiento (codigo, nombre, descripcion, color, icono, orden) VALUES
  ('AC-CS', 'Ciencias Sociales', 'Analiza fenómenos sociales, económicos y políticos desde perspectivas multidisciplinarias.', '#ea580c', '🏙️', 1),
  ('AC-CNT', 'Ciencias Naturales, Experimentales y Tecnología', 'Desarrolla pensamiento científico y tecnológico a través de la experimentación y la investigación.', '#16a34a', '🔬', 2),
  ('AC-HUM', 'Humanidades', 'Fomenta la reflexión filosófica, literaria y estética para el pensamiento crítico y la sensibilidad cultural.', '#7c3aed', '📚', 3);

INSERT INTO public.recursos_socioemocionales (codigo, nombre, descripcion, orden) VALUES
  ('RSE-RS', 'Responsabilidad Social', 'Fomenta el compromiso cívico, la participación comunitaria y el sentido de responsabilidad ante los problemas sociales.', 1),
  ('RSE-CFC', 'Cuidado Físico Corporal', 'Promueve hábitos saludables, actividad física y bienestar corporal para una vida plena.', 2),
  ('RSE-BEA', 'Bienestar Emocional Afectivo', 'Desarrolla habilidades socioemocionales para el autoconocimiento, la autorregulación y las relaciones interpersonales.', 3);

-- UAC: insertar con referencia a componentes y recursos
DO $$
DECLARE
  _cf_id uuid;
  _cfe_id uuid;
  _lc_id uuid;
  _pm_id uuid;
  _ch_id uuid;
  _cd_id uuid;
  _in_id uuid;
  _cs_id uuid;
  _cnt_id uuid;
  _hum_id uuid;
BEGIN
  SELECT id INTO _cf_id FROM public.componentes_curriculares WHERE codigo = 'CF';
  SELECT id INTO _cfe_id FROM public.componentes_curriculares WHERE codigo = 'CFE';
  SELECT id INTO _lc_id FROM public.recursos_sociocognitivos WHERE codigo = 'RSC-LC';
  SELECT id INTO _pm_id FROM public.recursos_sociocognitivos WHERE codigo = 'RSC-PM';
  SELECT id INTO _ch_id FROM public.recursos_sociocognitivos WHERE codigo = 'RSC-CH';
  SELECT id INTO _cd_id FROM public.recursos_sociocognitivos WHERE codigo = 'RSC-CD';
  SELECT id INTO _in_id FROM public.recursos_sociocognitivos WHERE codigo = 'RSC-IN';
  SELECT id INTO _cs_id FROM public.areas_conocimiento WHERE codigo = 'AC-CS';
  SELECT id INTO _cnt_id FROM public.areas_conocimiento WHERE codigo = 'AC-CNT';
  SELECT id INTO _hum_id FROM public.areas_conocimiento WHERE codigo = 'AC-HUM';

  -- Lengua y Comunicación
  INSERT INTO public.uac (codigo, nombre, semestre, componente_id, recurso_id, orden, total_progresiones) VALUES
    ('LC-I',   'Lengua y Comunicación I',   1, _cf_id, _lc_id, 1, 10),
    ('LC-II',  'Lengua y Comunicación II',  2, _cf_id, _lc_id, 1, 10),
    ('LC-III', 'Lengua y Comunicación III', 3, _cf_id, _lc_id, 1, 10),
    ('LC-IV',  'Lengua y Comunicación IV',  4, _cf_id, _lc_id, 1, 10),
    ('LC-V',   'Lengua y Comunicación V',   5, _cf_id, _lc_id, 1, 10),
    ('LC-VI',  'Lengua y Comunicación VI',  6, _cf_id, _lc_id, 1, 10);

  -- Pensamiento Matemático
  INSERT INTO public.uac (codigo, nombre, semestre, componente_id, recurso_id, orden, total_progresiones) VALUES
    ('PM-I',   'Pensamiento Matemático I',   1, _cf_id, _pm_id, 2, 10),
    ('PM-II',  'Pensamiento Matemático II',  2, _cf_id, _pm_id, 2, 10),
    ('PM-III', 'Pensamiento Matemático III', 3, _cf_id, _pm_id, 2, 10),
    ('PM-IV',  'Pensamiento Matemático IV',  4, _cf_id, _pm_id, 2, 10),
    ('PM-V',   'Pensamiento Matemático V',   5, _cf_id, _pm_id, 2, 10),
    ('PM-VI',  'Pensamiento Matemático VI',  6, _cf_id, _pm_id, 2, 10);

  -- Conciencia Histórica
  INSERT INTO public.uac (codigo, nombre, semestre, componente_id, recurso_id, orden, total_progresiones) VALUES
    ('CH-I',   'Conciencia Histórica I',   1, _cf_id, _ch_id, 3, 10),
    ('CH-II',  'Conciencia Histórica II',  2, _cf_id, _ch_id, 3, 10),
    ('CH-III', 'Conciencia Histórica III', 3, _cf_id, _ch_id, 3, 10);

  -- Cultura Digital
  INSERT INTO public.uac (codigo, nombre, semestre, componente_id, recurso_id, orden, total_progresiones) VALUES
    ('CD-I',  'Cultura Digital I',  1, _cf_id, _cd_id, 4, 8),
    ('CD-II', 'Cultura Digital II', 2, _cf_id, _cd_id, 4, 8);

  -- Inglés
  INSERT INTO public.uac (codigo, nombre, semestre, componente_id, recurso_id, orden, total_progresiones) VALUES
    ('IN-I',  'Inglés I',  1, _cf_id, _in_id, 5, 12),
    ('IN-II', 'Inglés II', 2, _cf_id, _in_id, 5, 12),
    ('IN-III','Inglés III',3, _cf_id, _in_id, 5, 12),
    ('IN-IV', 'Inglés IV', 4, _cf_id, _in_id, 5, 12);

  -- Ciencias Sociales
  INSERT INTO public.uac (codigo, nombre, semestre, componente_id, area_id, orden, total_progresiones) VALUES
    ('CS-HIS-I',  'Historia I',                       3, _cfe_id, _cs_id, 1, 10),
    ('CS-HIS-II', 'Historia II',                      4, _cfe_id, _cs_id, 1, 10),
    ('CS-ECO-I',  'Economía I',                       5, _cfe_id, _cs_id, 2, 10),
    ('CS-ECO-II', 'Economía II (Política Económica)', 6, _cfe_id, _cs_id, 2, 10),
    ('CS-SOC',    'Sociología',                       5, _cfe_id, _cs_id, 3, 10),
    ('CS-ADM',    'Administración',                   6, _cfe_id, _cs_id, 4, 10);

  -- Ciencias Naturales
  INSERT INTO public.uac (codigo, nombre, semestre, componente_id, area_id, orden, total_progresiones) VALUES
    ('CNT-BIO-I',  'Biología I',           3, _cfe_id, _cnt_id, 1, 12),
    ('CNT-BIO-II', 'Biología II',          4, _cfe_id, _cnt_id, 1, 12),
    ('CNT-QUI-I',  'Química I',            3, _cfe_id, _cnt_id, 2, 12),
    ('CNT-QUI-II', 'Química II',           4, _cfe_id, _cnt_id, 2, 12),
    ('CNT-FIS-I',  'Física I',             5, _cfe_id, _cnt_id, 3, 12),
    ('CNT-FIS-II', 'Física II',            6, _cfe_id, _cnt_id, 3, 12),
    ('CNT-MATE',   'Matemáticas Aplicadas',5, _cfe_id, _cnt_id, 4, 10),
    ('CNT-TC-I',   'Taller de Ciencias I', 5, _cfe_id, _cnt_id, 5, 8),
    ('CNT-TC-II',  'Taller de Ciencias II',6, _cfe_id, _cnt_id, 5, 8);

  -- Humanidades
  INSERT INTO public.uac (codigo, nombre, semestre, componente_id, area_id, orden, total_progresiones) VALUES
    ('HUM-PLT', 'Pensamiento Literario', 3, _cfe_id, _hum_id, 1, 10),
    ('HUM-FIL', 'Filosofía',            4, _cfe_id, _hum_id, 2, 10),
    ('HUM-EST', 'Estética',             5, _cfe_id, _hum_id, 3, 10);
END $$;
