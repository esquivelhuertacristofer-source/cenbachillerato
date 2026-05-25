# Plan de Adaptación: Dashboard Docente — Financiera → Bachillerato

**Fecha:** 2026-05-24  
**Estado:** BORRADOR — pendiente aprobación antes de Turno 3

> **Regla fundamental:** SI FINANCIERA TIENE X, BACHILLERATO DEBE TENER X ADAPTADO. NO IMPROVISAR.
> Fuente de verdad: `C:\Users\crist\Desktop\CEN-FINANCIERA-ENTREGA-UAEMEX-20260513-173334`

---

## Sección 1 — Componentes a replicar en Bachillerato

Cada componente se copia de Financiera y se adapta solo en: nombres de entidades DB, rutas de navegación, etiquetas de texto y paleta (azul MCCEMS en lugar de naranja financiero donde aplique).

| Componente Financiera | Ruta Financiera | Ruta destino Bachillerato | Adaptaciones necesarias |
|---|---|---|---|
| `Sidebar.tsx` | `src/components/dashboard/Sidebar.tsx` | `src/components/dashboard/Sidebar.tsx` | Nav items: Panel → `/dashboard/docente`, Mis Alumnos → `/dashboard/docente/alumnos`, **Módulos CEN** → `/dashboard/docente/modulos`, Planteamiento → `/dashboard/docente/planteamiento`, Reportes → `/dashboard/docente/reportes`, Bibliografía → `/dashboard/docente/biblioteca`. Eliminar selector primaria/secundaria — reemplazar por selector semestre (1-6). |
| `MetricCards.tsx` | `src/components/dashboard/MetricCards.tsx` | `src/components/dashboard/MetricCards.tsx` | Cards: Alumnos Activos, Grupos Asignados, UAC en Curso. Supabase queries → adaptar a tablas Bachillerato (`grupos`, `alumnos_grupos`, `intentos`). |
| `WelcomeBanner.tsx` | `src/components/dashboard/WelcomeBanner.tsx` | `src/components/dashboard/WelcomeBanner.tsx` | Texto: "MCCEMS Bachillerato" en lugar de financiero. Quitar referencia a nivel primaria/secundaria. Mantener estructura hero + % avance + insight. |
| `CalendarPanel.tsx` | `src/components/dashboard/CalendarPanel.tsx` | `src/components/dashboard/CalendarPanel.tsx` | Sin cambios funcionales — es UI puro. Ajuste de paleta si colores naranja presentes. |
| `PerformanceChart.tsx` | `src/components/dashboard/PerformanceChart.tsx` | `src/components/dashboard/PerformanceChart.tsx` | Sin cambios funcionales — gráfica estática. Ajuste de paleta si necesario. |
| `GroupRadarChart.tsx` | `src/components/dashboard/GroupRadarChart.tsx` | `src/components/dashboard/GroupRadarChart.tsx` | Labels del radar: cambiar de "Ahorro, Inversión, Riesgo, Plan" → "Comprensión, Aplicación, Análisis, Logro" (o equivalente MCCEMS). |
| `LabProgressRings.tsx` | `src/components/dashboard/LabProgressRings.tsx` | `src/components/dashboard/LabProgressRings.tsx` | Adaptar query de `progress` table → tabla Bachillerato equivalente. Labels de 4 áreas → áreas MCCEMS. |
| `LatestDeliveries.tsx` | `src/components/dashboard/LatestDeliveries.tsx` | `src/components/dashboard/LatestDeliveries.tsx` | Tablas fuente: `intentos` (Bachillerato ya tiene esta tabla). Mantener suscripción Supabase realtime. Clickable → `StudentRecordModal`. |
| `TopAlumnos.tsx` | `src/components/dashboard/TopAlumnos.tsx` | `src/components/dashboard/TopAlumnos.tsx` | Fuente: `intentos` (misma tabla). Paleta naranja (`#FF8C00`) → puede mantenerse como acento o cambiarse a azul CEN. |
| `StudentRecordModal.tsx` | `src/components/dashboard/StudentRecordModal.tsx` | `src/components/dashboard/StudentRecordModal.tsx` | Queries → `intentos` Bachillerato. Labels: "Misiones" → "Actividades". |

---

## Sección 2 — Páginas a replicar en Bachillerato

Financiera tiene **6 páginas** de teacher. Bachillerato tendrá **6 páginas** de docente equivalentes.

| Página Financiera | Ruta Financiera | Ruta destino Bachillerato | Diferencias clave |
|---|---|---|---|
| Panel Principal | `teacher/page.tsx` | `docente/page.tsx` | Layout: `<Sidebar>` + `<main className="flex-1 md:ml-[260px]">`. Secciones: WelcomeBanner → MetricCards → bento grid (LatestDeliveries + TopAlumnos). Quitar status bar HUD si no hay equivalente Bachillerato. |
| Mis Alumnos | `teacher/alumnos/page.tsx` | `docente/alumnos/page.tsx` | Grid de cards de alumnos. Modal con KPIs + historial de intentos. PDF export vía jsPDF. Fuente: `intentos` + `profiles` Bachillerato. |
| Bibliografía | `teacher/bibliografia/page.tsx` | `docente/biblioteca/page.tsx` (**nota: ruta ya existe como `biblioteca`**) | Lista hardcodeada de 8 recursos → reemplazar con recursos MCCEMS/SEP relevantes (DGETI, SEP, COSDAC, etc.). Misma estructura de filtros y cards. |
| Módulos CEN | `teacher/modulos/page.tsx` | `docente/modulos/page.tsx` (**nueva ruta**) | Selector de semestre (1-6) en lugar de grado. UAC list en lugar de pillar list. Usa `getPillarsForGrade` → crear equivalente `getUACsForSemestre` que lea datos MCCEMS. |
| Planteamiento | `teacher/planeamiento/page.tsx` | `docente/planteamiento/page.tsx` | RIESGO CRÍTICO (ver Sección 8). Requiere datos JSON equivalentes a `pedagogiaData` pero para MCCEMS. Sin esos archivos, la página no puede implementarse idéntica. |
| Reportes Académicos | `teacher/reportes/page.tsx` | `docente/reportes/page.tsx` | PerformanceChart + stats cards. Quitar "Reporte SEP" o adaptar. Fuente: `intentos` Bachillerato. |

---

## Sección 3 — Archivos a ELIMINAR del dashboard docente actual de Bachillerato

Confirmado con grep que ninguno de estos archivos es referenciado desde rutas fuera del propio dashboard docente.

### Páginas (7 páginas)
```
src/app/dashboard/docente/actividades/          ← carpeta completa
src/app/dashboard/docente/configuracion/        ← carpeta completa
src/app/dashboard/docente/dificultades/         ← carpeta completa
src/app/dashboard/docente/grupos/               ← carpeta completa (incluyendo [grupoId]/)
src/app/dashboard/docente/alumnos/[alumnoId]/   ← sub-ruta (mantener alumnos/page.tsx para reescribir)
src/app/dashboard/docente/metricas/             ← carpeta completa
```

### Componentes (7 componentes)
```
src/components/dashboard/AlumnoRow.tsx          ← reemplazado por StudentRecordModal
src/components/dashboard/GrupoCard.tsx          ← reemplazado por layout de Financiera
src/components/dashboard/QuickLinkCard.tsx      ← reemplazado por Sidebar
src/components/dashboard/GrupoSelectorClient.tsx ← si existe
src/components/dashboard/PlanteamientoTabs.tsx  ← si existe
src/components/dashboard/DocenteHeader.tsx      ← si existe
src/components/dashboard/AdminHeader.tsx        ← si existe
```

> **Nota:** Los 3 últimos componentes aparecieron en el inventario inicial pero el grep no los encontró como archivos existentes. Verificar antes de intentar eliminar.

---

## Sección 4 — Archivos a MANTENER del dashboard docente actual

Estos archivos se **sobreescriben con contenido nuevo** (no se borran, no se crean desde cero):

| Archivo | Acción |
|---|---|
| `src/app/dashboard/docente/page.tsx` | Sobreescribir con clone de `teacher/page.tsx` adaptado |
| `src/app/dashboard/docente/alumnos/page.tsx` | Sobreescribir con clone de `teacher/alumnos/page.tsx` adaptado |
| `src/app/dashboard/docente/biblioteca/page.tsx` | Sobreescribir con clone de `teacher/bibliografia/page.tsx` con recursos MCCEMS |
| `src/app/dashboard/docente/planteamiento/page.tsx` | Sobreescribir con clone de `teacher/planeamiento/page.tsx` (sujeto a decisión de datos) |
| `src/app/dashboard/docente/reportes/page.tsx` | Sobreescribir con clone de `teacher/reportes/page.tsx` adaptado |
| `src/lib/queries/docente.ts` | Extender/actualizar queries para soportar nuevas páginas |

---

## Sección 5 — Nuevos archivos a crear

### Componentes nuevos (10 archivos)
```
src/components/dashboard/Sidebar.tsx              ← clone + adaptación nav Bachillerato
src/components/dashboard/MetricCards.tsx          ← clone + tablas Bachillerato
src/components/dashboard/WelcomeBanner.tsx        ← clone + texto MCCEMS
src/components/dashboard/CalendarPanel.tsx        ← clone sin cambios funcionales
src/components/dashboard/PerformanceChart.tsx     ← clone sin cambios funcionales
src/components/dashboard/GroupRadarChart.tsx      ← clone + labels MCCEMS
src/components/dashboard/LabProgressRings.tsx     ← clone + query adaptada
src/components/dashboard/LatestDeliveries.tsx     ← clone + tablas Bachillerato
src/components/dashboard/TopAlumnos.tsx           ← clone + tablas Bachillerato
src/components/dashboard/StudentRecordModal.tsx   ← clone + tablas Bachillerato
```

### Páginas nuevas (1 archivo)
```
src/app/dashboard/docente/modulos/page.tsx        ← clone de teacher/modulos adaptado para semestres/UAC
```

### Datos estáticos (condicional — ver Sección 8)
```
src/data/mccems/hub.ts                            ← si se decide crear equivalente a pedagogiaData
src/data/mccems/s1.json … s6.json                ← datos curriculares MCCEMS por semestre (193-305KB cada uno)
```

### CSS utilities (en globals.css existente)
Agregar al final de `src/app/globals.css`:
```css
/* --- Financiera → Bachillerato utilities --- */
.noise-texture { ... }
.premium-gradient-text { ... }
.bento-card { ... }
.dashboard-gradient-orange { ... }
.dashboard-scrollbar-thin { ... }
.dashboard-serif-premium { ... }
```

### Dependencia jsPDF
```bash
npm install jspdf
```

---

## Sección 6 — Queries necesarias en Bachillerato

Revisar `src/lib/queries/docente.ts` y añadir o confirmar:

| Query | Ya existe en Bachillerato | Acción |
|---|---|---|
| `getGruposDocente(userId)` | Sí | Mantener |
| `getAlumnosConProgreso(grupoId, userId)` | Sí | Mantener + verificar score_promedio |
| `getUACsConCompletionGrupo(grupoId)` | Sí | Mantener |
| `getMetricasDocente(userId)` | Sí | Mantener |
| `getIntentosRecientesDocente(userId, limit)` | Sí | Mantener (alimenta LatestDeliveries) |
| `getTopAlumnosDocente(userId, limit)` | No | Crear: agregar XP/score de `intentos` por alumno |
| `getAlumnoDetalle(alumnoId)` | Parcial | Ampliar: historial completo + stats para StudentRecordModal |
| `getUACsForSemestre(semestre)` | No | Crear: listar UACs por semestre para página módulos |
| `getProgresionesAlumno(alumnoId, grupoId)` | No | Crear: para LabProgressRings adaptado |

**Nota sobre arquitectura:** Financiera usa `"use client"` en todas las páginas con fetching en el browser. Bachillerato puede mantener Server Components en las páginas y pasar data como props a los componentes clientes, o puede convertir páginas a `"use client"` para igualar exactamente la arquitectura de Financiera. **Decisión pendiente de confirmación del usuario antes de Turno 3.**

---

## Sección 7 — Orden de ejecución propuesto para Turno 3

**Paso 1 — Dependencias y CSS** (5 min)
- `npm install jspdf`
- Agregar 6 utilities CSS en `globals.css`

**Paso 2 — Componentes base sin datos** (20 min)
- Crear: `CalendarPanel.tsx`, `PerformanceChart.tsx`, `GroupRadarChart.tsx`
- Estos son UI puros, sin queries — mínimo riesgo

**Paso 3 — Sidebar** (15 min)
- Crear `Sidebar.tsx` con nav Bachillerato
- Es el esqueleto de todas las páginas

**Paso 4 — Componentes con datos** (30 min)
- Crear: `MetricCards.tsx`, `WelcomeBanner.tsx`, `LatestDeliveries.tsx`, `TopAlumnos.tsx`, `LabProgressRings.tsx`
- Añadir queries faltantes en `docente.ts`

**Paso 5 — StudentRecordModal** (15 min)
- Crear `StudentRecordModal.tsx`
- Depende de queries de alumno detalle

**Paso 6 — Eliminar archivos obsoletos** (5 min)
- Eliminar 7 páginas listadas en Sección 3
- Eliminar componentes listados en Sección 3

**Paso 7 — Reescribir 5 páginas existentes** (40 min)
- `page.tsx` (panel principal)
- `alumnos/page.tsx`
- `biblioteca/page.tsx`
- `reportes/page.tsx`
- `planteamiento/page.tsx` (condicionado a decisión de datos MCCEMS)

**Paso 8 — Crear página nueva** (15 min)
- `modulos/page.tsx`

**Paso 9 — Verificación** (15 min)
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run pages:build`
- Revisar en browser: cada ruta docente

**Total estimado:** ~2.5 horas de Turno 3

---

## Sección 8 — Riesgos identificados

### RIESGO 1 — CRÍTICO: Datos MCCEMS para Planteamiento
**Problema:** La página `planeamiento` de Financiera consume archivos JSON de 193-305KB por grado (`p1-p6.json`, `s1-s3.json`) que contienen currículum completo: fases estratégicas, marco teórico, preguntas de examen, rúbricas, competencias, materiales, teacher tips. Bachillerato NO tiene archivos equivalentes para MCCEMS.

**Opciones:**
- A) Crear los archivos JSON MCCEMS (trabajo de contenido fuera del scope de código)
- B) Implementar la página `planteamiento` con datos parciales/placeholder y nota pendiente
- C) Mantener la `planteamiento` actual de Bachillerato (la ya existente, basada en Supabase)
- D) Omitir planteamiento en Turno 3 y tratarlo como Turno 4 separado

**Decisión requerida del usuario antes de Turno 3.**

---

### RIESGO 2 — MEDIO: Arquitectura Server vs Client Components
**Problema:** Financiera usa `"use client"` + fetching browser-side en todas las páginas de teacher. Bachillerato usa Server Components + queries en servidor.

**Impacto:** Si se copian los componentes de Financiera tal cual (con `supabase` desde `@/lib/supabase-browser`), funcionarán en Bachillerato porque ambos usan Supabase. Sin embargo, el patrón difiere de lo ya construido en Bachillerato.

**Recomendación:** Mantener el patrón de Financiera (`"use client"`) en los 10 nuevos componentes para máxima fidelidad. Las páginas pueden ser Server Components que pasan `userId`/`groupId` como props a los componentes clientes.

---

### RIESGO 3 — MEDIO: Tailwind v3 (Financiera) vs Tailwind v4 (Bachillerato)
**Problema:** Financiera usa Tailwind v3 con `tailwind.config.js`. Bachillerato usa Tailwind v4 con config CSS-first.

**Impacto:** Las clases de Tailwind en los componentes copiados (e.g., `rounded-[3.5rem]`, `font-['Epilogue']`, `bg-[#011C40]`) funcionarán en v4 porque son valores arbitrarios. Los custom utilities (`noise-texture`, etc.) sí requieren migración manual a CSS.

**Acción:** Copiar las utilities de `globals.css` de Financiera al `globals.css` de Bachillerato como clases CSS planas (sin `@apply`).

---

### RIESGO 4 — BAJO: layout.tsx de Bachillerato
**Problema:** Bachillerato tiene `src/app/dashboard/docente/layout.tsx` que puede envolver las páginas con un layout existente. Financiera NO tiene layout — cada página renderiza `<Sidebar>` directamente.

**Impacto:** Si el layout de Bachillerato ya incluye algún sidebar o header, podría duplicarse con el nuevo `<Sidebar>` de Financiera.

**Acción:** Leer `layout.tsx` al inicio de Turno 3 y decidir: vaciar el layout o eliminarlo y mover `<Sidebar>` a cada página individualmente (como Financiera).

---

## Checklist de confirmaciones requeridas antes de Turno 3

- [ ] **MCCEMS data:** ¿Cuál de las 4 opciones para planteamiento? (A/B/C/D)
- [ ] **Arquitectura:** ¿Confirmas mantener patrón Financiera (`"use client"`) en componentes nuevos?
- [ ] **TopAlumnos paleta:** ¿Mantener naranja (`#FF8C00`) o cambiar a azul CEN?
- [ ] **radar labels:** ¿Cuáles son las 4 dimensiones de evaluación MCCEMS para `GroupRadarChart`?
- [ ] **jsPDF:** ¿Confirmas instalar jsPDF para export PDF en página alumnos?
