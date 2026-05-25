# Anatomía del Módulo de Planeamiento — CEN Financiera

> Análisis exhaustivo de `src/app/dashboard/teacher/planeamiento/page.tsx` (Financiera)
> para replicación exacta en Bachillerato MCCEMS.

---

## Sección 1: Estructura Visual

### Layout General
- `flex min-h-screen` con dos paneles principales:
  - **Panel izquierdo** (380px fijo): `bg-white/50 backdrop-blur-xl border-r` — selector de unidades
  - **Panel derecho** (flex-1): `bg-[#F4F1EA]` — contenido principal scrolleable

### Panel Izquierdo (Unit Selector / Bento Sidebar)
1. **Header** (p-8):
   - Ícono `ListTodo` en cuadro `bg-[#011C40]` + texto "Plan Maestro / CEN Sistema"
   - **Selector de grado** (dropdown `<select>`) con `bg-[#FF8C00]` (naranja) — opciones p1-p6, s1-s3
2. **Barra de búsqueda** (`Search` icon, placeholder "Buscar en el currículo...")
3. **Lista scrolleable** de unidades (cards):
   - Activa: `bg-[#011C40] text-white scale-[1.02] -translate-y-1`
   - Inactiva: `bg-white hover:bg-[#FFF1D6]/30 hover:border-[#FFE3BF]`
   - Contenido: código (color `#42E8E0` si activo, `#FF8C00` si inactivo) + duración + título + "Ver planeamiento completo →"

### Panel Derecho — Sticky Top Nav
- `sticky top-0 z-30 bg-[#F4F1EA]/80 backdrop-blur-xl px-12 py-6`
- Izquierda: avatares apilados + "24 Profesores utilizando esta guía hoy"
- Derecha: botón Monitor (ícono) + botón **"Exportar para SEP"** (`bg-[#011C40]` + ícono `Download` en `#42E8E0`)

### Panel Derecho — Hero Section (Bento Grid 12 cols)
- **Col 8**: Tarjeta principal con:
  - Badge "Nivel: {level}" en `bg-[#FFF1D6] text-[#FF8C00]`
  - Badge ID: {code} en gris
  - Título h1 (`text-6xl font-black`) + subtítulo italic en `premium-gradient-text`
- **Col 4**: Grid 2×2:
  - Celda 1: `bg-[#011C40]` + ícono `Clock` (`#42E8E0`) + "Duración" + valor
  - Celda 2: `bg-white` + ícono `BarChart` (`#FF8C00`) + "Dificultad" + valor
  - Celda 3 (col-span-2): Gradient `from-[#42E8E0] to-[#011C40]` + "Metodología / CEN Sistema" + `Sparkles`

### Panel Derecho — Tab Navigation (3 tabs en píldora centrada)
- Contenedor: `bg-white/50 backdrop-blur-md p-2 rounded-[32px] border border-white shadow-xl flex gap-2`
- **Tab 1 — Estrategia** (`Zap` icon): muestra `strategy.phases`
- **Tab 2 — Marco Teórico** (`BookOpen` icon): muestra `theory`
- **Tab 3 — Evaluación** (`CheckCircle2` icon): muestra `evaluation`
- Tab activo: `bg-[#011C40] text-white shadow-2xl scale-105`

### Panel Derecho — Contenido Principal (12 cols)

#### Columna izquierda (8 cols) — Contenido del tab

**Tab: Estrategia**
- Lista de `strategy.phases[]` (cards):
  - Borde lateral de color (naranja/azul/teal según índice)
  - Número de fase en badge
  - `phase.title` + `phase.description` + caja "Actividad Sugerida" con `phase.activity`
  - Badge tiempo `phase.duration` a la derecha

**Tab: Marco Teórico**
- Línea decorativa `bg-[#42E8E0]` + h2 "Introducción al Marco Teórico"
- Cita en italic: `theory.introduction`
- Grid 2 cols: secciones `theory.sections[]` (número + subtitle + content)

**Tab: Evaluación**
- Bloque banco de evaluación (fondo blanco):
  - Header "Banco de Evaluación" + badge "Auditado Diamond State"
  - Lista `evaluation.exam_questions[]`:
    - `Q{i+1}. question`
    - Grid 2×2 de opciones; opción correcta: `bg-emerald-50 border-emerald-500/20`
- Tarjeta Rúbrica (fondo `#011C40` oscuro):
  - Ícono `Target` en `bg-[#42E8E0]` + "Rúbrica de Éxito"
  - Texto `evaluation.rubric`

#### Columna derecha (4 cols) — Sidebar fijo

**Tarjeta Ficha Técnica** (`bg-white rounded-[40px] p-10`):
- Ícono `FileText` en `bg-[#011C40]` + título "Ficha Técnica"
- **Objetivo Pedagógico**: `metadata.objective` (label `#FF8C00`)
- **Competencias**: `metadata.competencies[]` (badges grises)
- **Recursos Necesarios**: `metadata.materials[]` (lista con dot `#42E8E0`)

**Tarjeta Tips Docente** (`bg-[#FFF1D6] rounded-[40px] p-10 border-[#FFE3BF]`):
- Ícono `Lightbulb` en `bg-[#FF8C00]` + "Consejo de Expertos"
- Lista `teacher_tips[]` en italic entrecomillado

**Tarjeta CTA** (`bg-gradient-to-br from-[#011C40] to-[#042a5e]`):
- Ícono `Monitor` + "¿Listo para proyectar esta sesión?"

---

## Sección 2: Funcionalidades Exactas

| Funcionalidad | Descripción | Datos | Interacción |
|---|---|---|---|
| Selector de grado | Dropdown naranja, cambia el conjunto de unidades | `pedagogiaData[grade]` | `onChange → setSelectedGrade` |
| Buscador | Filtra unidades por title o code | `filteredUnits` | `onChange → setSearchQuery` |
| Lista de unidades | Cards scrolleables, selección activa | Todas las keys del Record | `onClick → setActiveUnit` |
| Tab Estrategia | 3 fases pedagógicas con actividades | `strategy.phases[]` | Tab click |
| Tab Marco Teórico | Introducción + secciones teóricas | `theory.{introduction, sections[]}` | Tab click |
| Tab Evaluación | Banco de preguntas + rúbrica | `evaluation.{exam_questions[], rubric}` | Tab click |
| Ficha Técnica | Objetivo + competencias + materiales | `metadata.{objective, competencies[], materials[]}` | Sticky visible |
| Tips docente | Consejos para la sesión | `teacher_tips[]` | Sticky visible |
| Exportar SEP | Botón de descarga (decorativo actualmente) | — | Click |
| Proyectar sesión | CTA interactivo (decorativo) | — | Click |

---

## Sección 3: Estructura del JSON pedagogiaData

```json
{
  "CODIGO-UNIDAD": {
    "code": "S1-1-1",                    // string, ID único de la unidad
    "title": "Título: subtítulo",         // string, dividido por ':'
    "level": "Secundaria 1",             // string, nivel educativo
    "duration": "60 min",               // string, duración total
    "difficulty": "Intermedio",          // string, "Básico" | "Intermedio" | "Avanzado"
    "category": "Categoría temática",    // string, categoría del tema
    "metadata": {
      "objective": "...",               // string, objetivo pedagógico
      "competencies": ["...", "..."],   // string[], competencias a desarrollar
      "materials": ["...", "..."]       // string[], recursos necesarios
    },
    "strategy": {
      "timeline": [                     // array, resumen de fases (opcional)
        { "phase": "Apertura", "duration": "10 min", "label": "..." }
      ],
      "phases": [                       // array, descripción detallada
        {
          "title": "FASE I: APERTURA Y ENGANCHE",
          "duration": "10 min",
          "description": "...",         // string, descripción de la fase
          "activity": "..."             // string, actividad sugerida concreta
        }
      ]
    },
    "theory": {
      "introduction": "...",            // string, párrafo introductorio (cita en italics)
      "sections": [                     // array de 2-4 secciones
        { "subtitle": "...", "content": "..." }
      ]
    },
    "evaluation": {
      "exam_questions": [              // array de 5-10 preguntas
        {
          "question": "...",           // string
          "options": ["...", "..."],   // string[], 3-4 opciones
          "correct": "..."            // string, debe coincidir con una opción
        }
      ],
      "rubric": "..."                 // string, criterio de éxito resumido
    },
    "teacher_tips": ["...", "...", "..."]  // string[], 2-4 consejos
  }
}
```

---

## Sección 4: Mapeo Financiera → Bachillerato

| Campo Financiera | Equivalente Bachillerato | Notas |
|---|---|---|
| Grade selector (p1-p6, s1-s3) | UAC selector (PM-I, LC-I, IN-I, CNEYT-I…) | Agrupados por semestre |
| `code` | Código de progresión (e.g., "PM-I-P01") | |
| `title` | Título de progresión MCCEMS | |
| `level` | Nombre del UAC (e.g., "Pensamiento Matemático I") | |
| `duration` | "~3h (2 sesiones de 50 min)" | Estándar MCCEMS |
| `difficulty` | "Fundamental" \| "Intermedio" \| "Avanzado" | Según complejidad |
| `category` | `categoria` del seed (e.g., "Aritmética") | |
| `metadata.objective` | `meta_aprendizaje` del UAC | |
| `metadata.competencies` | `ejes_articuladores` + competencias MCCEMS | |
| `metadata.materials` | Materiales concretos para esa progresión | |
| `strategy.phases[0]` | Apertura (10 min) — enganche con contexto mexicano | |
| `strategy.phases[1]` | Desarrollo (30-35 min) — exploración del contenido | |
| `strategy.phases[2]` | Cierre (10-15 min) — metacognición y evaluación | |
| `theory.introduction` | Marco conceptual de la progresión | Referencia a MCCEMS 2025 |
| `theory.sections[]` | Bloques temáticos clave de la progresión | |
| `evaluation.exam_questions[]` | Preguntas alineadas al propósito formativo | |
| `evaluation.rubric` | Criterio de éxito MCCEMS para la progresión | |
| `teacher_tips[]` | Estrategias docentes específicas para MCCEMS | |

---

## Sección 5: Componentes UI

La página de Financiera es un componente monolítico `'use client'` que incluye:
- `Sidebar` (de `components/dashboard/Sidebar`)
- `Image` (de `next/image`, para avatares)
- Lucide icons: `Search`, `Clock`, `BarChart`, `Zap`, `FileText`, `Target`, `Lightbulb`, `Download`, `Monitor`, `CheckCircle2`, `ListTodo`, `BookOpen`, `ArrowRight`, `Sparkles`, `Info`
- `pedagogiaData` importado de `data/pedagogia/hub`

**No hay sub-componentes separados** — toda la UI está inline en `page.tsx`.

En Bachillerato replicaremos la misma arquitectura: un único archivo `page.tsx` de ~450-500 líneas, sin sub-componentes.

---

## Sustituciones de Paleta CEN

| Color Financiera | Color Bachillerato | Uso |
|---|---|---|
| `#FF8C00` (naranja) | `#D4A574` (dorado) | Selector, badges activos, labels, fase colores |
| `#42E8E0` (teal) | `#7DD3FC` (azul claro) | Acentos, iconos activos, metodología gradient |
| `#FFF1D6` (fondo naranja suave) | `rgba(212,165,116,0.10)` | Fondo tips, badge nivel |
| `#FFE3BF` (borde naranja) | `rgba(212,165,116,0.25)` | Borde tips card |
| `from-[#42E8E0] to-[#011C40]` | `from-[#7DD3FC] to-[#011C40]` | Gradient celda metodología |
| `shadow-orange-500/20` | `shadow-[#D4A574]/20` | Sombra naranja → dorado |
| Texto "CEN Sistema" | "CEN Bachillerato MCCEMS" | Label metodología |
| "24 Profesores utilizando…" | "Plan de Estudios 2022 MCCEMS" | Texto top nav (simplificado) |
| Grade codes: p1-p6, s1-s3 | UAC codes: PM-I, LC-I, IN-I… | Selector |
