-- =============================================================================
-- CEN Bachillerato — Migración 26: cinco tipos de actividad dinámicos
-- Fecha: 2026-09-01
--
-- POR QUÉ. Los doce tipos de la migración 03 se responden LEYENDO Y ELIGIENDO:
-- todos terminan en marcar una casilla o escribir un texto. Un alumno de
-- bachillerato aprende a atravesarlos en diagonal. Estos cinco se responden
-- MOVIENDO y DECIDIENDO, y cubren cinco cosas que a los otros no les salen:
--   · ordenar_secuencia      — la secuencia de un proceso o una cronología
--   · relacionar_columnas    — la correspondencia entre dos conjuntos
--   · clasificar_categorias  — el criterio con el que se separa un conjunto
--   · caso_decision          — la consecuencia de una decisión (no hay "correcta")
--   · reto_cronometrado      — la recuperación bajo presión de tiempo
--
-- `actividades.tipo` es texto libre y no lleva CHECK, así que lo único que hace
-- falta es dar de alta los códigos en el catálogo `tipos_actividad`, al que
-- apunta la FK `actividades.tipo_codigo`. Sin estas filas, insertar una
-- actividad de estos tipos con su `tipo_codigo` viola la FK.
--
-- Los `schema_validacion` de aquí son el espejo de los validadores Zod de
-- `src/lib/activities/validators.ts`, igual que en la migración 03.
--
-- IDEMPOTENTE: ON CONFLICT DO NOTHING. Se puede reaplicar sin efecto.
-- =============================================================================

INSERT INTO public.tipos_actividad (codigo, nombre, descripcion, icono, orden, schema_validacion) VALUES

('ordenar_secuencia', 'Ordena la secuencia',
 'Tarjetas barajadas que el alumno acomoda en su orden correcto: los pasos de un procedimiento, los hechos de una cronología o los niveles de una jerarquía. Se arrastran o se mueven con flechas (funciona en teléfono y con teclado).',
 'ArrowDownWideNarrow', 13,
 '{
   "type": "object",
   "required": ["pasos"],
   "properties": {
     "instrucciones": { "type": "string" },
     "pasos": {
       "type": "array", "minItems": 3, "maxItems": 10,
       "description": "EN SU ORDEN CORRECTO; la app los baraja al presentarlos",
       "items": {
         "type": "object",
         "required": ["texto"],
         "properties": {
           "texto": { "type": "string" },
           "explicacion": { "type": "string" },
           "marca": { "type": "string" }
         }
       }
     },
     "criterio": { "type": "string", "enum": ["cronologia", "procedimiento", "jerarquia"] },
     "puntaje_minimo_aprobacion": { "type": "integer", "minimum": 0, "maximum": 100 },
     "url_imagen": { "type": "string" }
   }
 }'::jsonb),

('relacionar_columnas', 'Relaciona columnas',
 'Dos columnas que el alumno empareja tocando primero un concepto y después su correspondencia. Admite distractores en la columna derecha que no emparejan con nada.',
 'Link', 14,
 '{
   "type": "object",
   "required": ["parejas"],
   "properties": {
     "instrucciones": { "type": "string" },
     "titulo_izquierda": { "type": "string" },
     "titulo_derecha": { "type": "string" },
     "parejas": {
       "type": "array", "minItems": 3, "maxItems": 10,
       "items": {
         "type": "object",
         "required": ["izquierda", "derecha"],
         "properties": {
           "izquierda": { "type": "string" },
           "derecha": { "type": "string" },
           "explicacion": { "type": "string" }
         }
       }
     },
     "distractores": { "type": "array", "maxItems": 4, "items": { "type": "string" } },
     "puntaje_minimo_aprobacion": { "type": "integer", "minimum": 0, "maximum": 100 },
     "url_imagen": { "type": "string" }
   }
 }'::jsonb),

('clasificar_categorias', 'Clasifica en categorías',
 'Fichas que el alumno reparte entre dos y cuatro categorías, arrastrando o con dos toques. Lo que se evalúa es el criterio de clasificación, no el dato suelto.',
 'Layers', 15,
 '{
   "type": "object",
   "required": ["categorias", "elementos"],
   "properties": {
     "instrucciones": { "type": "string" },
     "categorias": {
       "type": "array", "minItems": 2, "maxItems": 4,
       "items": {
         "type": "object",
         "required": ["nombre"],
         "properties": {
           "nombre": { "type": "string" },
           "descripcion": { "type": "string" }
         }
       }
     },
     "elementos": {
       "type": "array", "minItems": 4, "maxItems": 16,
       "items": {
         "type": "object",
         "required": ["texto", "categoria"],
         "properties": {
           "texto": { "type": "string" },
           "categoria": { "type": "string", "description": "nombre EXACTO de una categoria declarada" },
           "explicacion": { "type": "string" }
         }
       }
     },
     "puntaje_minimo_aprobacion": { "type": "integer", "minimum": 0, "maximum": 100 },
     "url_imagen": { "type": "string" }
   }
 }'::jsonb),

('caso_decision', 'Caso con decisiones',
 'Una situación que avanza según lo que el alumno decide, y cada decision devuelve su consecuencia. No hay respuesta correcta en pantalla: la calidad (0, 1, 2) puntúa al final, cuando ya se leyeron todas las consecuencias.',
 'Route', 16,
 '{
   "type": "object",
   "required": ["contexto", "escenas", "cierre_bueno", "cierre_regular", "cierre_malo"],
   "properties": {
     "contexto": { "type": "string" },
     "escenas": {
       "type": "array", "minItems": 2, "maxItems": 6,
       "items": {
         "type": "object",
         "required": ["situacion", "pregunta", "opciones"],
         "properties": {
           "situacion": { "type": "string" },
           "pregunta": { "type": "string" },
           "opciones": {
             "type": "array", "minItems": 2, "maxItems": 4,
             "items": {
               "type": "object",
               "required": ["texto", "consecuencia", "calidad"],
               "properties": {
                 "texto": { "type": "string" },
                 "consecuencia": { "type": "string" },
                 "calidad": { "type": "integer", "minimum": 0, "maximum": 2 }
               }
             }
           }
         }
       }
     },
     "cierre_bueno": { "type": "string" },
     "cierre_regular": { "type": "string" },
     "cierre_malo": { "type": "string" },
     "pregunta_reflexion": { "type": "string" },
     "url_imagen": { "type": "string" }
   }
 }'::jsonb),

('reto_cronometrado', 'Reto contrarreloj',
 'Ronda rápida con reloj por pregunta y racha visible. No evalúa comprensión —para eso están el quiz y el ejercicio—: entrena la recuperación de lo ya aprendido.',
 'Timer', 17,
 '{
   "type": "object",
   "required": ["preguntas"],
   "properties": {
     "instrucciones": { "type": "string" },
     "segundos_por_pregunta": { "type": "integer", "minimum": 5, "maximum": 60 },
     "preguntas": {
       "type": "array", "minItems": 5, "maxItems": 20,
       "items": {
         "type": "object",
         "required": ["enunciado", "opciones", "respuesta_correcta"],
         "properties": {
           "enunciado": { "type": "string" },
           "opciones": { "type": "array", "minItems": 2, "maxItems": 4, "items": { "type": "string" } },
           "respuesta_correcta": { "type": "integer", "minimum": 0 },
           "pista": { "type": "string" }
         }
       }
     },
     "puntaje_minimo_aprobacion": { "type": "integer", "minimum": 0, "maximum": 100 },
     "url_imagen": { "type": "string" }
   }
 }'::jsonb)

ON CONFLICT (codigo) DO NOTHING;
