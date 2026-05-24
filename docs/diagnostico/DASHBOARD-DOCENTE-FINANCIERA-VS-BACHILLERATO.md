# Dashboard Docente — Financiera vs Bachillerato
> Auditoría comparativa · 2026-05-23

---

## 1. Inventario de pantallas — Financiera (`/dashboard/teacher/`)

| Ruta | Archivo | Estado | Descripción |
|------|---------|--------|-------------|
| `/dashboard/teacher` | `page.tsx` | **Funcional** | HUD ejecutivo con 3 KPIs (alumnos, grupos, prácticas), feed de últimas entregas, ranking de alumnos |
| `/dashboard/teacher/alumnos` | `alumnos/page.tsx` | **Funcional** | Grid de tarjetas de alumnos, modal lateral con analytics, exportación PDF individual y grupal |
| `/dashboard/teacher/planeamiento` | `planeamiento/page.tsx` | **Funcional** | Bento grid con selector de unidades + tabs (Estrategia, Teoría, Evaluación). **Datos estáticos JSON** |
| `/dashboard/teacher/modulos` | `modulos/page.tsx` | **Funcional** | Navegador jerárquico de módulos por grado (Primaria/Secundaria) y pilares pedagógicos |
| `/dashboard/teacher/reportes` | `reportes/page.tsx` | **Parcial** | Gráfico de desempeño + KPIs mockeados + CTA exportar SEP |
| `/dashboard/teacher/bibliografia` | `bibliografia/page.tsx` | **Funcional** | 8 recursos pedagógicos externos hardcodeados; filtros por categoría y nivel |

### Módulo Planeamiento de Financiera — detalle

El módulo más robusto. Estructura de datos (JSON estático en `/src/data/pedagogia/`):

```
Unidad pedagógica {
  code, title, level, duration, difficulty,
  metadata: { objective, competencies[], materials[] },
  strategy: { phases: [APERTURA, DESARROLLO, CIERRE] },
  theory: { introduction, sections[] },
  evaluation: { exam_questions[], rubric },
  teacher_tips[]
}
```

**Organización curricular Financiera**: Primaria (P1-P6) → Secundaria (S1-S3). Cada unidad tiene estrategia de 3 fases (apertura/desarrollo/cierre), banco de 10 preguntas y rúbrica.

**Limitación clave**: Sin conexión a DB de intentos. El docente ve el plan pero no sabe qué alumnos han completado qué unidad.

---

## 2. Estado actual — Bachillerato (`/dashboard/docente/`)

| Ruta | Archivo | Estado | Descripción |
|------|---------|--------|-------------|
| `/dashboard/docente` | `page.tsx` | **Funcional** | Métricas reales (alumnos, grupos, semestres), tabla "Mis grupos", accesos rápidos |
| `/dashboard/docente/alumnos` | `alumnos/page.tsx` | **Placeholder** | Solo mensaje "Próximamente" — sin datos |
| `/dashboard/docente/metricas` | `metricas/page.tsx` | **Placeholder** | Solo mensaje "Próximamente" — sin datos |
| `/dashboard/docente/reportes` | `reportes/page.tsx` | **Placeholder** | Solo mensaje "Próximamente" — sin datos |

### Queries existentes (`src/lib/queries/docente.ts`)

```typescript
getGruposDocente(docenteId)   → GrupoConAlumnos[]  // grupos + conteo de alumnos
getMetricasDocente(docenteId) → { totalGrupos, totalAlumnos, uacEnCurso, grupos }
```

Tests: 9 casos en `src/lib/queries/__tests__/docente.test.ts`.

### Componentes docente existentes

- `src/components/dashboard/DocenteHeader.tsx` — nav sticky con 4 enlaces

---

## 3. Tabla docentes_grupos

**Veredicto: NO se necesita.**

La tabla `grupos` ya tiene `id_docente uuid REFERENCES profiles(id)` — relación directa 1:N (un docente → muchos grupos). La tabla intermedia solo sería necesaria si un grupo pudiera tener múltiples docentes simultáneamente, lo cual no está en el modelo MCCEMS.

RLS policies existentes en `grupos` filtran correctamente por `escuela_id` y rol. No se crea migración.

---

## 4. Cuenta demo docente

**Veredicto: NO existe.** No hay script `create-demo-docente.ts` en el proyecto.

Se creará `scripts/create-demo-docente.ts` (sin ejecutar contra DB).

---

## 5. Módulos reutilizables vs adaptados vs descartados

### ✅ Reutilizables tal cual (adaptar visual)

| Módulo Financiera | Uso en Bachillerato |
|------------------|---------------------|
| Patrón auth (role check + redirect) | Idéntico — mismo sistema Supabase Auth |
| PDF export con jsPDF | Reportes de grupo por semestre |
| Tabla de alumnos con búsqueda | Página `/alumnos` |
| Feed de últimas entregas | Actividades recientes en home |
| Top alumnos por score | Ranking en home |

### ⚠️ Requieren adaptación sustantiva

| Módulo Financiera | Adaptación para Bachillerato |
|------------------|------------------------------|
| **Planeamiento** (JSON estático Primaria/Secundaria) | **Real DB**: UAC × progresiones × actividades del semestre del grupo. Mucho más rico porque tiene datos reales de 621 actividades y 207 progresiones |
| Módulos por pilar (Ahorro, Inversión, etc.) | UACs del MCCEMS organizadas por componente curricular |
| Reportes SEP (datos mock) | Reportes reales desde intentos: score promedio, actividades completadas, progresiones cubiertas |
| Bibliografía hardcodeada | `fichas_biblioteca` — 607 fichas reales en DB, filtradas por UAC |

### ❌ Descartados (no aplican a Bachillerato)

| Módulo Financiera | Razón |
|------------------|-------|
| Selector Primaria/Secundaria en sidebar | Bachillerato tiene semestres 1-6 |
| "Diamond State" / KPIs de gamificación Financiera | Sistema XP diferente |
| Contenido de Finanzas (ahorro, AFORE, crypto) | No es el dominio |
| `pedagogia/hub.ts` con unidades Financiera | Bachillerato usa UAC/progresiones/MCCEMS |

### 🆕 Módulos nuevos que necesita Bachillerato (no existen en Financiera)

| Módulo | Justificación |
|--------|---------------|
| **Planteamiento académico con datos reales** | Financiera usa JSON estático; Bachillerato tiene 32 UACs, 207 progresiones, 621 actividades en DB |
| **Detección de dificultades** | Score < 50 / abandon > 20% en actividades específicas |
| **Alumnos en riesgo** | Alumnos con < 30% completion que necesitan intervención |
| **Vista de progresiones MCCEMS** | Timeline de las 207 progresiones oficiales por semestre |
| **Recomendaciones automáticas** | Derivadas de datos reales de intentos |
| **Biblioteca de fichas para docente** | Las 607 fichas de `fichas_biblioteca` filtradas por UAC del grupo |
| **Grupos con semestre** | Bachillerato tiene grupos por semestre (1-6), Financiera por grado/nivel |

---

## 6. Diferencias de esquema DB relevantes

| Entidad | Financiera | Bachillerato |
|---------|------------|--------------|
| Curriculum | JSON estático (pedagogia/hub.ts) | DB: `uac` → `progresiones` → `actividades` |
| Grupos | `grupos` con `id_profesor` | `grupos` con `id_docente` + `semestre` |
| Alumnos-Grupo | `alumnos_grupos` (n:n) | Idéntico |
| Intentos | `intentos` con activity_id, score, status | Idéntico |
| Recursos pedagógicos | `bibliografia` hardcodeada | `fichas_biblioteca` (607 en DB) |
| Nivel educativo | Primaria (P1-P6), Secundaria (S1-S3) | Semestres 1-6 (MCCEMS) |

---

## 7. Conclusión ejecutiva

El dashboard de Financiera tiene **mejor UI y animaciones** pero **datos más pobres** (JSON estático para planeamiento, mocks para reportes).

Bachillerato tiene **schema más rico** (UAC, progresiones, intentos reales) pero **UI incompleta** (3 páginas placeholder).

La adaptación correcta es: tomar la **arquitectura visual** de Financiera + usar los **datos reales** de Bachillerato. El resultado superará a Financiera en funcionalidad porque el planeamiento académico de Bachillerato estará conectado a la DB real.
