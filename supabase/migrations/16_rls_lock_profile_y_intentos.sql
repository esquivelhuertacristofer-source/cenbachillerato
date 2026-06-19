-- ============================================================
-- 16_rls_lock_profile_y_intentos.sql
-- Cierra dos vectores de manipulación que el alumno podía explotar con SOLO
-- su sesión (anon key + JWT), sin pasar por las server actions:
--
--   (A) Auto-cambio de escuela_id / semestre en su propio profile.
--       El trigger protect_user_profile_fields (01_schema_inicial.sql) solo
--       protegía 'role'. La policy "users can update own profile (non-role
--       fields)" permite UPDATE con WITH CHECK (id = auth.uid()), así que un
--       alumno podía moverse de escuela (escuela_id) o saltar de semestre
--       (desbloqueando contenido) editando su propia fila. Esta migración
--       extiende el trigger para bloquear ambos campos a quien no sea
--       admin/super_admin (mismo patrón NULL-safe que 'role').
--
--   (B) Borrado / alteración de sus propios intentos.
--       La policy "students can manage own intentos" era FOR ALL, es decir
--       INSERT + UPDATE + DELETE. Un alumno podía DELETE un intento reprobado
--       (ocultarlo del docente) o UPDATE el score de un intento ya guardado
--       (falsificar su calificación histórica). El INSERT legítimo lo hace la
--       server action entregarActividad bajo el JWT del propio alumno (el
--       cliente usa anon key, no service_role), así que INSERT debe seguir
--       permitido; pero UPDATE y DELETE no tienen ningún flujo legítimo desde
--       el cliente. Esta migración divide la policy: INSERT + SELECT propios
--       siguen permitidos; UPDATE y DELETE quedan denegados por defecto.
--
-- Nota: esta migración NO impide que el alumno mande un score inflado en el
-- INSERT (el puntaje se calcula en el cliente y se envía a la server action;
-- RLS no puede distinguir un INSERT "honesto" de uno forjado bajo el mismo
-- JWT). Ese endurecimiento requeriría calificación server-side y queda fuera
-- de alcance. Lo que esta migración SÍ garantiza es que el historial es
-- append-only para el alumno: no puede borrar ni reescribir lo ya registrado.
--
-- Idempotente y re-ejecutable: CREATE OR REPLACE FUNCTION + DROP POLICY IF
-- EXISTS antes de cada CREATE POLICY. El trigger protect_profile_role ya
-- existe y referencia la función por nombre, así que basta reemplazar el
-- cuerpo de la función.
--
-- NO ejecutar automáticamente — pegar en Supabase SQL Editor.
-- ============================================================

-- ── (A) Trigger: bloquear cambios de role, escuela_id y semestre ──────────
CREATE OR REPLACE FUNCTION public.protect_user_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $protect$
DECLARE
  _caller_role text;
BEGIN
  _caller_role := public.get_my_role();

  -- Solo admin/super_admin pueden cambiar el role.
  -- (Para service_role / contexto interno, _caller_role es NULL ⇒ la condición
  --  evalúa a NULL ⇒ no levanta excepción, igual que el comportamiento previo.)
  IF NEW.role <> OLD.role AND _caller_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'No tienes permisos para cambiar el rol.';
  END IF;

  -- Solo super_admin puede promover a super_admin.
  IF NEW.role = 'super_admin' AND _caller_role <> 'super_admin' THEN
    RAISE EXCEPTION 'Solo un super_admin puede crear otro super_admin.';
  END IF;

  -- Solo admin/super_admin pueden mover de escuela. IS DISTINCT FROM maneja
  -- correctamente los NULL (escuela_id es nullable).
  IF NEW.escuela_id IS DISTINCT FROM OLD.escuela_id
     AND _caller_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'No tienes permisos para cambiar la escuela.';
  END IF;

  -- Solo admin/super_admin pueden cambiar el semestre (evita auto-desbloqueo
  -- de contenido por avance de semestre).
  IF NEW.semestre IS DISTINCT FROM OLD.semestre
     AND _caller_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'No tienes permisos para cambiar el semestre.';
  END IF;

  RETURN NEW;
END;
$protect$;

-- El trigger protect_profile_role ya está creado en 01_schema_inicial.sql y
-- apunta a esta función por nombre; al reemplazar el cuerpo, toma la nueva
-- lógica sin recrear el trigger.

-- ── (B) Intentos: append-only para el alumno (sin UPDATE ni DELETE) ───────
DROP POLICY IF EXISTS "students can manage own intentos" ON public.intentos;
DROP POLICY IF EXISTS "students can insert own intentos" ON public.intentos;
DROP POLICY IF EXISTS "students can read own intentos" ON public.intentos;

CREATE POLICY "students can insert own intentos"
  ON public.intentos FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "students can read own intentos"
  ON public.intentos FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- No se crea policy de UPDATE ni DELETE para el alumno: por RLS, sin policy
-- que las permita, ambas quedan denegadas. Las server actions de escritura
-- corren bajo el JWT del alumno y solo hacen INSERT, así que no se rompe nada.

-- ============================================================
-- Verificación post-migración (ejecutar como un ALUMNO, NO en SQL Editor):
--   -- Debe FALLAR (permission denied / new row violates policy):
--   UPDATE profiles SET semestre = semestre + 1 WHERE id = auth.uid();
--   UPDATE profiles SET escuela_id = '<otra-escuela>' WHERE id = auth.uid();
--   DELETE FROM intentos WHERE user_id = auth.uid();
--   UPDATE intentos SET score = 100 WHERE user_id = auth.uid();
--   -- Debe SEGUIR funcionando:
--   INSERT INTO intentos (user_id, actividad_id, status, score, completed_at)
--     VALUES (auth.uid(), '<actividad-publicada>', 'completed', 80, now());
--   SELECT * FROM intentos WHERE user_id = auth.uid();
-- ============================================================
