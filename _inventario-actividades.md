# Inventario de Actividades — CEN Bachillerato
_Generado automáticamente — NO commitear_

## Mapa de renderers

| Tipo | Archivo | Líneas | Estado actual |
|------|---------|--------|---------------|
| `lectura` | `LecturaActivity.tsx` | 72 | Tailwind, fondo blanco. Texto en bloque. Preguntas como `<details>`. Botón azul genérico. |
| `quiz_multiple_opcion` | `QuizMultipleOpcionActivity.tsx` | 105 | Tailwind, fondo blanco. Todas las preguntas apiladas. Radio buttons nativos. Score al final. |
| `fill_blanks` | `FillBlanksActivity.tsx` | 86 | Tailwind, fondo blanco. Inputs inline en el texto. Verifica todos al enviar. |
| `ejercicio_matematico` | `EjercicioMatematicoActivity.tsx` | 107 | Tailwind, fondo blanco. Contexto + problema + input. Pasos colapsables. |
| `reflexion_escrita` | `ReflexionEscritaActivity.tsx` | 94 | Tailwind, fondo blanco. Prompt azul + textarea pequeña + contador. |
| `debate_estructurado` | `DebateEstructuradoActivity.tsx` | 106 | Tailwind, fondo blanco. Tema + selector de postura + textarea. |

## Schema de contenido por tipo

### lectura
```json
{
  "texto": "string",
  "fuente": "string?",
  "nivel_lectura": "'basico'|'intermedio'|'avanzado'?",
  "preguntas_comprension": [{ "pregunta": "string", "respuesta_guia": "string?" }],
  "tiempo_estimado_minutos": "number?"
}
```

### quiz_multiple_opcion
```json
{
  "preguntas": [{
    "enunciado": "string",
    "opciones": "string[]",
    "respuesta_correcta": "number",
    "retroalimentacion": "string?",
    "imagen_url": "string?"
  }],
  "puntaje_minimo_aprobacion": "number? (default 70)",
  "mezclar_preguntas": "boolean?"
}
```

### fill_blanks
```json
{
  "instrucciones": "string?",
  "texto_con_huecos": "string (uses ___ per blank)",
  "huecos": [{ "posicion": "number", "respuesta_correcta": "string", "alternativas_aceptadas": "string[]?", "pista": "string?" }],
  "distingue_mayusculas": "boolean?"
}
```

### ejercicio_matematico
```json
{
  "problema": "string",
  "contexto": "string?",
  "tipo_respuesta": "'numerica'|'algebraica'|'desarrollo'|'seleccion'",
  "pasos_guia": "string[]?",
  "respuesta_final": "string?",
  "unidades": "string?",
  "tolerancia_error": "number?",
  "imagen_problema": "string?"
}
```

### reflexion_escrita
```json
{
  "prompt": "string",
  "pistas": "string[]?",
  "longitud_minima_palabras": "number? (default 80)",
  "criterios_evaluacion": "string[]?",
  "ejemplo_respuesta": "string?",
  "formato_esperado": "'libre'|'ensayo'|'carta'|'diario'|'descripcion'?"
}
```

### debate_estructurado
```json
{
  "tema": "string",
  "posturas": "string[]",
  "argumentos_guia": "Record<string, string[]>?",
  "reglas": "string[]?",
  "criterios_evaluacion": "string[]?",
  "modalidad": "'oral'|'escrito'|'hibrido'?"
}
```

## Carencias identificadas

| Check | Todos 6 tipos |
|-------|--------------|
| Cabecera propia | ✗ — la maneja la page.tsx con fondo BLANCO |
| Consistencia visual con Hub dark | ✗ — Tailwind, fondo blanco |
| Loading states | N/A (client components) |
| Error states | ✗ |
| Feedback visual al responder | Mínimo |
| Microinteracciones | ✗ |
| Dark theme | ✗ |

## Decisiones de diseño adoptadas

- `lucide-react` no está instalado → usar Font Awesome (ya estándar en la codebase)
- Renderers pasan de Tailwind a inline styles para consistencia con hub design system
- `color: AreaColor` prop opcional con fallback sky blue añadida a cada renderer
- Botón "Entregar" permanece dentro de cada renderer (no sticky global) — sticky via CSS
- Quiz: click-to-verify por opción, luego "Siguiente" — flujo tipo Brilliant
- Lectura: comprehension questions con textareas (no details/summary)
- DebateEstructurado: side-by-side en desktop, stacked en mobile (≤768px)
