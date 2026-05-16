-- =============================================================================
-- CEN Bachillerato — Migración 03: Tipos de actividades pedagógicas
-- Fecha: 2026-05-15
-- Descripción:
--   1. Tabla tipos_actividad con 12 tipos base y sus schemas JSON
--   2. Columnas adicionales en progresiones para metadatos MCCEMS
--   3. FK en actividades para referencia a tipo
-- Nota: TODO contenido es_placeholder=true hasta validación pedagógica
-- =============================================================================

-- ── 1. TABLA TIPOS_ACTIVIDAD ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tipos_actividad (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo        text        UNIQUE NOT NULL,
  nombre        text        NOT NULL,
  descripcion   text,
  icono         text,
  schema_validacion jsonb   NOT NULL DEFAULT '{}'::jsonb,
  orden         int         DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tipos_actividad ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer tipos (son de sistema, no tienen datos personales)
CREATE POLICY "tipos_actividad_select_all"
  ON public.tipos_actividad FOR SELECT
  USING (true);

-- Solo super_admin puede modificar tipos
CREATE POLICY "tipos_actividad_admin_only"
  ON public.tipos_actividad FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ── 2. SEED: 12 TIPOS BASE ────────────────────────────────────────────────────

INSERT INTO public.tipos_actividad (codigo, nombre, descripcion, icono, orden, schema_validacion) VALUES

('lectura', 'Lectura', 'Texto con preguntas de comprensión lectora opcionales. Apoya la activación de conocimientos previos y la contextualización temática.', 'BookOpen', 1,
'{
  "type": "object",
  "required": ["texto"],
  "properties": {
    "texto": {"type": "string", "minLength": 50},
    "fuente": {"type": "string"},
    "nivel_lectura": {"type": "string", "enum": ["basico", "intermedio", "avanzado"]},
    "preguntas_comprension": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["pregunta"],
        "properties": {
          "pregunta": {"type": "string"},
          "respuesta_guia": {"type": "string"}
        }
      }
    },
    "tiempo_estimado_minutos": {"type": "integer", "minimum": 1}
  }
}'::jsonb),

('quiz_multiple_opcion', 'Quiz: Opción múltiple', 'Evaluación formativa con preguntas de opción múltiple (4 opciones). Incluye retroalimentación por respuesta.', 'CheckSquare', 2,
'{
  "type": "object",
  "required": ["preguntas"],
  "properties": {
    "preguntas": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["enunciado", "opciones", "respuesta_correcta"],
        "properties": {
          "enunciado": {"type": "string"},
          "opciones": {"type": "array", "minItems": 2, "maxItems": 5, "items": {"type": "string"}},
          "respuesta_correcta": {"type": "integer", "minimum": 0},
          "retroalimentacion": {"type": "string"},
          "imagen_url": {"type": "string"}
        }
      }
    },
    "intentos_maximos": {"type": "integer", "minimum": 1, "default": 3},
    "puntaje_minimo_aprobacion": {"type": "integer", "minimum": 0, "maximum": 100, "default": 70},
    "mezclar_preguntas": {"type": "boolean", "default": false}
  }
}'::jsonb),

('quiz_verdadero_falso', 'Quiz: Verdadero o Falso', 'Evaluación formativa con afirmaciones que el estudiante clasifica como verdaderas o falsas. Útil para verificar comprensión de conceptos clave.', 'ToggleLeft', 3,
'{
  "type": "object",
  "required": ["preguntas"],
  "properties": {
    "preguntas": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["enunciado", "respuesta"],
        "properties": {
          "enunciado": {"type": "string"},
          "respuesta": {"type": "boolean"},
          "retroalimentacion": {"type": "string"}
        }
      }
    },
    "intentos_maximos": {"type": "integer", "minimum": 1, "default": 2},
    "puntaje_minimo_aprobacion": {"type": "integer", "minimum": 0, "maximum": 100, "default": 70}
  }
}'::jsonb),

('fill_blanks', 'Completar espacios', 'Texto con huecos que el estudiante debe completar con la palabra o frase correcta. Refuerza vocabulario y comprensión de conceptos.', 'Edit3', 4,
'{
  "type": "object",
  "required": ["texto_con_huecos", "huecos"],
  "properties": {
    "instrucciones": {"type": "string"},
    "texto_con_huecos": {"type": "string", "description": "Usa ___ para marcar cada hueco"},
    "huecos": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["posicion", "respuesta_correcta"],
        "properties": {
          "posicion": {"type": "integer", "minimum": 0},
          "respuesta_correcta": {"type": "string"},
          "alternativas_aceptadas": {"type": "array", "items": {"type": "string"}},
          "pista": {"type": "string"}
        }
      }
    },
    "distingue_mayusculas": {"type": "boolean", "default": false}
  }
}'::jsonb),

('ejercicio_matematico', 'Ejercicio matemático', 'Problema matemático estructurado con solución paso a paso. Puede requerir respuesta numérica, algebraica o desarrollo de procedimiento.', 'Calculator', 5,
'{
  "type": "object",
  "required": ["problema", "tipo_respuesta"],
  "properties": {
    "instrucciones": {"type": "string"},
    "problema": {"type": "string"},
    "contexto": {"type": "string", "description": "Situación real que da sentido al problema"},
    "tipo_respuesta": {"type": "string", "enum": ["numerica", "algebraica", "desarrollo", "seleccion"]},
    "pasos_guia": {"type": "array", "items": {"type": "string"}},
    "respuesta_final": {"type": "string"},
    "unidades": {"type": "string"},
    "tolerancia_error": {"type": "number", "default": 0},
    "imagen_problema": {"type": "string"}
  }
}'::jsonb),

('reflexion_escrita', 'Reflexión escrita', 'Actividad de producción escrita abierta. El estudiante responde a un prompt reflexivo. Evaluada por el docente o mediante rúbrica.', 'PenLine', 6,
'{
  "type": "object",
  "required": ["prompt"],
  "properties": {
    "prompt": {"type": "string"},
    "pistas": {"type": "array", "items": {"type": "string"}},
    "longitud_minima_palabras": {"type": "integer", "minimum": 10, "default": 80},
    "longitud_maxima_palabras": {"type": "integer"},
    "criterios_evaluacion": {"type": "array", "items": {"type": "string"}},
    "ejemplo_respuesta": {"type": "string"},
    "formato_esperado": {"type": "string", "enum": ["libre", "ensayo", "carta", "diario", "descripcion"], "default": "libre"}
  }
}'::jsonb),

('video_con_preguntas', 'Video con preguntas', 'Video educativo acompañado de preguntas que aparecen en momentos específicos (o al finalizar). Combina contenido audiovisual con verificación de comprensión.', 'Video', 7,
'{
  "type": "object",
  "required": ["url_video", "titulo_video"],
  "properties": {
    "url_video": {"type": "string"},
    "titulo_video": {"type": "string"},
    "descripcion_video": {"type": "string"},
    "duracion_segundos": {"type": "integer", "minimum": 1},
    "subtitulos_disponibles": {"type": "boolean", "default": false},
    "preguntas": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["pregunta"],
        "properties": {
          "tiempo_segundos": {"type": "integer"},
          "pregunta": {"type": "string"},
          "tipo": {"type": "string", "enum": ["abierta", "opcion_multiple", "verdadero_falso"]},
          "opciones": {"type": "array", "items": {"type": "string"}},
          "respuesta_correcta": {}
        }
      }
    }
  }
}'::jsonb),

('infografia', 'Infografía', 'Material visual estructurado que presenta información de forma sintética. Puede usarse como referencia o como base para actividades de análisis.', 'Image', 8,
'{
  "type": "object",
  "required": ["titulo", "url_imagen"],
  "properties": {
    "titulo": {"type": "string"},
    "url_imagen": {"type": "string"},
    "descripcion_accesible": {"type": "string", "description": "Alt text descriptivo para accesibilidad"},
    "puntos_clave": {"type": "array", "minItems": 1, "items": {"type": "string"}},
    "fuente": {"type": "string"},
    "actividad_post": {"type": "string", "description": "Consigna de actividad posterior a la revisión"}
  }
}'::jsonb),

('debate_estructurado', 'Debate estructurado', 'Actividad de argumentación oral/escrita con posiciones asignadas. Desarrolla pensamiento crítico, argumentación y escucha activa.', 'MessageSquare', 9,
'{
  "type": "object",
  "required": ["tema", "posturas"],
  "properties": {
    "tema": {"type": "string"},
    "posturas": {"type": "array", "minItems": 2, "items": {"type": "string"}},
    "argumentos_guia": {
      "type": "object",
      "additionalProperties": {"type": "array", "items": {"type": "string"}}
    },
    "reglas": {"type": "array", "items": {"type": "string"}},
    "tiempo_argumentacion_minutos": {"type": "integer", "minimum": 1, "default": 3},
    "criterios_evaluacion": {"type": "array", "items": {"type": "string"}},
    "modalidad": {"type": "string", "enum": ["oral", "escrito", "hibrido"], "default": "escrito"}
  }
}'::jsonb),

('simulacion', 'Simulación', 'Actividad interactiva que replica un proceso real (laboratorio, fenómeno social, situación matemática). Embebe herramienta externa o provee instrucciones de simulación.', 'FlaskConical', 10,
'{
  "type": "object",
  "required": ["tipo_simulacion", "descripcion"],
  "properties": {
    "tipo_simulacion": {"type": "string", "enum": ["laboratorio", "matematica", "social", "tecnologia", "historica"]},
    "descripcion": {"type": "string"},
    "url_simulacion": {"type": "string"},
    "instrucciones": {"type": "array", "items": {"type": "string"}},
    "variables_a_explorar": {"type": "array", "items": {"type": "string"}},
    "preguntas_reflexion": {"type": "array", "items": {"type": "string"}},
    "reporte_esperado": {"type": "string"}
  }
}'::jsonb),

('glosario_interactivo', 'Glosario interactivo', 'Lista de términos clave con definiciones, ejemplos e imágenes opcionales. El estudiante puede marcar los que domina y practicar con flashcards.', 'BookMarked', 11,
'{
  "type": "object",
  "required": ["terminos"],
  "properties": {
    "terminos": {
      "type": "array",
      "minItems": 3,
      "items": {
        "type": "object",
        "required": ["termino", "definicion"],
        "properties": {
          "termino": {"type": "string"},
          "definicion": {"type": "string"},
          "ejemplo": {"type": "string"},
          "imagen_url": {"type": "string"},
          "etiquetas": {"type": "array", "items": {"type": "string"}}
        }
      }
    },
    "actividad_final": {"type": "string", "description": "Consigna integradora posterior al estudio del glosario"}
  }
}'::jsonb),

('autoevaluacion', 'Autoevaluación', 'El estudiante reflexiona sobre su propio aprendizaje usando criterios definidos (escala Likert o rúbrica). Fomenta la metacognición y la autorregulación.', 'ClipboardCheck', 12,
'{
  "type": "object",
  "required": ["criterios"],
  "properties": {
    "instrucciones": {"type": "string"},
    "criterios": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["descripcion", "escala"],
        "properties": {
          "descripcion": {"type": "string"},
          "escala": {
            "type": "array",
            "minItems": 2,
            "items": {
              "type": "object",
              "required": ["valor", "etiqueta"],
              "properties": {
                "valor": {"type": "integer"},
                "etiqueta": {"type": "string"},
                "descripcion": {"type": "string"}
              }
            }
          }
        }
      }
    },
    "reflexion_final_prompt": {"type": "string"},
    "visible_para_docente": {"type": "boolean", "default": true}
  }
}'::jsonb)

ON CONFLICT (codigo) DO UPDATE SET
  nombre            = EXCLUDED.nombre,
  descripcion       = EXCLUDED.descripcion,
  icono             = EXCLUDED.icono,
  schema_validacion = EXCLUDED.schema_validacion,
  orden             = EXCLUDED.orden;

-- ── 3. COLUMNAS ADICIONALES EN PROGRESIONES (metadatos MCCEMS) ───────────────

ALTER TABLE public.progresiones
  ADD COLUMN IF NOT EXISTS descripcion_extendida  text,
  ADD COLUMN IF NOT EXISTS ejes_articuladores     jsonb  DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS transversalidades      jsonb  DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tiempo_estimado_horas  numeric(4,1);

COMMENT ON COLUMN public.progresiones.descripcion_extendida  IS 'Contexto pedagógico ampliado de la progresión (1-2 párrafos)';
COMMENT ON COLUMN public.progresiones.ejes_articuladores     IS 'Array de ejes articuladores MCCEMS aplicables a esta progresión';
COMMENT ON COLUMN public.progresiones.transversalidades      IS 'Array de áreas/UAC con las que esta progresión tiene conexión transversal';
COMMENT ON COLUMN public.progresiones.tiempo_estimado_horas  IS 'Horas pedagógicas estimadas para completar la progresión';

-- ── 4. COLUMNA tipo_codigo EN ACTIVIDADES (referencia a tipos) ───────────────

-- La tabla actividades ya tiene columna "tipo" (text).
-- Agregamos una referencia normalizada al catálogo como columna adicional
-- para mantener compatibilidad con datos existentes.
ALTER TABLE public.actividades
  ADD COLUMN IF NOT EXISTS tipo_codigo text REFERENCES public.tipos_actividad(codigo)
    ON UPDATE CASCADE ON DELETE SET NULL;

COMMENT ON COLUMN public.actividades.tipo_codigo IS 'FK al catálogo de tipos de actividad (normalizado)';

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_actividades_tipo_codigo ON public.actividades(tipo_codigo);
CREATE INDEX IF NOT EXISTS idx_progresiones_uac_id ON public.progresiones(uac_id);
