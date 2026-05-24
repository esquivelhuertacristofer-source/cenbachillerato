# Dashboard Docente Bachillerato — Spec de Diseño
> Versión 1.0 · 2026-05-23

---

## 1. Principios de diseño

- **Datos reales sobre mocks**: cada métrica viene de DB. Si no hay datos, mostrar "—" o "Sin actividad" honestamente.
- **MCCEMS primero**: el lenguaje de la UI usa UAC, progresión, semestre — no "módulo", "nivel", "grado".
- **Planteamiento como corazón**: el módulo `/planteamiento` es la pantalla más importante. Concentra el 40% del esfuerzo de diseño.
- **Mobile responsive**: breakpoints consistentes con `/hub` (320 → 768 → 1280).
- **Reduced motion**: todas las animaciones respetan `prefers-reduced-motion`.

---

## 2. Estructura de rutas — final

```
/dashboard/docente/
├── layout.tsx                      # Auth guard + DocenteHeader expandido
├── page.tsx                        # Home: KPIs, mis grupos, actividad reciente
│
├── grupos/
│   ├── page.tsx                    # Lista de grupos con métricas básicas
│   └── [grupoId]/
│       └── page.tsx                # Detalle del grupo: alumnos, UAC, intentos recientes
│
├── alumnos/
│   ├── page.tsx                    # Buscador + lista de todos los alumnos del docente
│   └── [alumnoId]/
│       └── page.tsx                # Perfil del alumno: progreso por UAC y actividad
│
├── planteamiento/                  ← CORAZÓN DEL DASHBOARD
│   └── page.tsx                    # Vista principal con 3 tabs
│                                   #   Tab 1: Plan General (UAC × semestre, avance real vs esperado)
│                                   #   Tab 2: Progresiones (207 MCCEMS, completadas por la cohorte)
│                                   #   Tab 3: Recomendaciones (automáticas desde intentos)
│
├── actividades/
│   └── page.tsx                    # Seguimiento de actividades: scores, tiempos, completion
│
├── dificultades/
│   └── page.tsx                    # Actividades con score < 50 o abandon rate > 20%
│
├── reportes/
│   └── page.tsx                    # Vista de reportes: KPIs exportables por grupo
│
└── biblioteca/
    └── page.tsx                    # Fichas de biblioteca filtradas por semestre del grupo
```

**Rutas eliminadas**: `/metricas` (reemplazada por `/actividades` con mejor semántica).

---

## 3. Módulos — descripción detallada

### 3.1 Home (`/dashboard/docente`)

**KPIs** (4 tarjetas, datos reales):
- Alumnos activos (suma de alumnos en todos los grupos del docente)
- Grupos asignados (count)
- Semestres en curso (semestres únicos de los grupos)
- Promedio de avance (% avg de actividades completadas / actividades totales por grupo)

**Mis grupos** (tabla con link a detalle):
- Nombre del grupo | Semestre | Alumnos | Acceso rápido → planteamiento

**Actividad reciente** (últimos 10 intentos de los alumnos del docente):
- Alumno | Actividad | Score | Tiempo | Hace X tiempo

### 3.2 Grupos (`/dashboard/docente/grupos`)

Lista de grupos asignados al docente. Para cada grupo:
- Nombre, semestre, escuela
- Total alumnos
- UACs del semestre (count desde DB)
- % de actividades completadas (promedio de alumnos del grupo)
- Link → detalle del grupo

**Detalle de grupo** (`/grupos/[grupoId]`):
- Header: nombre, semestre, escuela, docente
- Tab "Alumnos": lista con progress bar por alumno (% actividades completadas del semestre)
- Tab "UAC del semestre": lista de UACs del semestre con progresiones y actividades disponibles
- Tab "Actividad reciente": últimos intentos del grupo

### 3.3 Alumnos (`/dashboard/docente/alumnos`)

Buscador + lista de todos los alumnos del docente (todos sus grupos):
- Buscar por nombre o email
- Filtrar por grupo / semestre
- Cada fila: avatar inicial, nombre, grupo, semestre, actividades completadas, score promedio, último acceso

**Perfil de alumno** (`/alumnos/[alumnoId]`):
- Cabecera: nombre, email, grupo, semestre
- Progreso por UAC: barra de progreso con % de actividades completadas
- Historial de intentos: tabla cronológica con actividad, score, tiempo, estado
- Resumen estadístico: total completadas, score promedio, tiempo total, racha

### 3.4 Planteamiento Académico (`/dashboard/docente/planteamiento`) ← CORAZÓN

El módulo más robusto. Todos los datos vienen de DB.

**Selector de grupo** (dropdown, filtro global del módulo):
- Si el docente tiene múltiples grupos, puede cambiar entre ellos

#### Tab 1 — Plan General

Vista de todas las UAC del semestre del grupo seleccionado:

```
UAC            Progresiones  Actividades  Completadas  % Cohorte  Estado
────────────────────────────────────────────────────────────────────────────
CD-IV          8             24           18           75%        ✓ En buen camino
LC-IV          6             18           8            44%        ⚠ Atención
PM-IV          7             21           3            14%        🔴 Crítico
```

- Barra de progreso visual por UAC
- Color coded: verde ≥ 70%, amarillo 40-69%, rojo < 40%
- Clic en UAC → expande progresiones de esa UAC

#### Tab 2 — Progresiones MCCEMS

Vista de árbol: UAC → progresiones ordenadas por número.

Para cada progresión:
- Código (ej: CD-IV-P03)
- Título
- Actividades disponibles en la plataforma (count)
- Alumnos que la completaron (≥ 1 intento completado) / Total alumnos grupo
- Barra de avance

#### Tab 3 — Recomendaciones

Tarjetas de recomendación automática generadas desde datos reales:

**Tipos de recomendación**:
1. `UAC_BAJO`: "La UAC PM-IV tiene 14% de completion — considera reforzar antes del cierre del bloque"
2. `ACTIVIDAD_DIFICIL`: "La actividad LC-IV-P02-A3 tiene score promedio de 42/100 — revisar dificultad o dar apoyo previo"
3. `ALUMNO_RIESGO`: "5 alumnos no han completado ninguna actividad en los últimos 7 días"
4. `PROGRESION_PENDIENTE`: "P05 de CD-IV no tiene ningún alumno que la haya iniciado"

Cada tarjeta tiene:
- Tipo (badge coloreado)
- Descripción clara en español
- Dato de respaldo (el número real que motivó la recomendación)
- Acción sugerida (texto)

**Criterios de generación** (server-side, con datos reales):
- UAC con completion < 60% → recomendación tipo `UAC_BAJO`
- Actividades con score_promedio < 50 (donde hay ≥ 3 intentos) → `ACTIVIDAD_DIFICIL`
- Alumnos sin ningún intento en los últimos 7 días → `ALUMNO_RIESGO`
- Progresiones sin ningún intento → `PROGRESION_PENDIENTE`

Si no hay datos de intentos (grupo nuevo), mostrar estado vacío honesto + instrucción.

### 3.5 Actividades (`/dashboard/docente/actividades`)

Seguimiento de actividades completadas por el grupo:

**Filtros**: por UAC, por tipo de actividad, por rango de fechas, por score

**Tabla principal**:
- Actividad | UAC | Tipo | Alumnos que la completaron | Score promedio | Tiempo promedio | Última actividad

**Métricas de cabecera** (para el grupo seleccionado):
- Total actividades disponibles en semestre
- Actividades con al menos 1 completion
- Score promedio global
- Alumnos con ≥ 80% completion

### 3.6 Dificultades (`/dashboard/docente/dificultades`)

Actividades problemáticas detectadas automáticamente:

**Criterios**:
- Score promedio < 50 (con ≥ 3 intentos)
- Tasa de abandono > 30% (`status = 'abandoned'`)
- Tasa de fallo > 40% (`status = 'failed'`)

**Vista**: cards con semáforo rojo, descripción del problema, datos de respaldo, enlace a la actividad.

Estado vacío si no hay suficientes datos — no generar falsas alertas.

### 3.7 Reportes (`/dashboard/docente/reportes`)

Vista para revisar progreso del grupo exportable:

**Métricas por grupo**:
- Alumnos totales / activos (han intentado ≥ 1 actividad)
- Actividades completadas / disponibles
- Score promedio del grupo
- Distribución de scores (rangos: 0-39, 40-59, 60-79, 80-100)
- UAC con mejor y peor rendimiento

**Tabla de alumnos** (exportable):
- Nombre | Actividades completadas | Score promedio | Tiempo total | Estado

**Acciones**:
- "Copiar resumen" (texto formateado para pegar en SEP o correo)
- Estructura lista para exportación PDF en iteración futura

### 3.8 Biblioteca (`/dashboard/docente/biblioteca`)

Fichas pedagógicas de `fichas_biblioteca` filtradas por UAC del semestre del grupo:

**Cabecera**: selector de grupo → muestra semestre → filtra fichas de las UAC de ese semestre

**Grid de fichas** (3 columnas en desktop, 1 en móvil):
- Título, categoría, tiempo de lectura, UAC relacionada
- Botón "Ver ficha" → link al hub (si existe ruta pública) o preview inline

**Búsqueda**: por título o categoría (text search en `fichas_biblioteca.titulo`)

---

## 4. Queries nuevas a implementar (`src/lib/queries/docente.ts`)

```typescript
// Alumnos del docente (todos sus grupos)
getAlumnosDelDocente(docenteId: string): Promise<AlumnoConGrupo[]>

// Alumnos de un grupo con su progreso
getAlumnosConProgreso(grupoId: string, docenteId: string): Promise<AlumnoConProgreso[]>

// UACs del semestre de un grupo con actividades y completion
getUACsConCompletionGrupo(grupoId: string): Promise<UACCompletionData[]>

// Progresiones de un semestre con completion por cohorte
getProgresionesPorSemestre(semestre: number, grupoId: string): Promise<ProgresionData[]>

// Actividades con stats de intentos para un grupo
getActividadesStatsGrupo(grupoId: string, docenteId: string): Promise<ActividadStats[]>

// Actividades con mayor dificultad (score < 50 o abandon rate alto)
getActividadesDificiles(grupoId: string, docenteId: string): Promise<ActividadDificil[]>

// Alumnos en riesgo (sin intentos en 7 días)
getAlumnosEnRiesgo(grupoId: string): Promise<AlumnoRiesgo[]>

// Recomendaciones automáticas derivadas de datos reales
getRecomendacionesGrupo(grupoId: string, docenteId: string): Promise<Recomendacion[]>

// Planteamiento completo (combina UACs + progresiones + recomendaciones)
getPlanteamientoGrupo(grupoId: string, docenteId: string): Promise<PlanteamientoData>

// Fichas de biblioteca por semestre
getFichasBibliotecaPorSemestre(semestre: number): Promise<FichaBiblioteca[]>

// Intentos recientes de alumnos del docente (para home + actividades)
getIntentosRecientesDocente(docenteId: string, limit?: number): Promise<IntentoReciente[]>
```

---

## 5. Tests nuevos a agregar

Objetivo: 175 → 183+ tests.

Nuevos describe blocks:
- `getAlumnosDelDocente` (2 tests)
- `getUACsConCompletionGrupo` (2 tests)
- `getActividadesDificiles` (2 tests)
- `getAlumnosEnRiesgo` (2 tests)
Total: +8 tests mínimo.

---

## 6. Navegación actualizada (`DocenteHeader`)

Expandir de 4 a 6+ links con indicador activo para rutas anidadas:

```
[Logo CEN] [Inicio] [Grupos] [Planteamiento] [Alumnos] [Actividades] [Reportes] [Biblioteca]
```

En mobile (< 768px): menú hamburguesa con drawer lateral.

Indicador activo: `pathname.startsWith(href)` en lugar de `pathname === href` para manejar sub-rutas.

---

## 7. Componentes nuevos a crear

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| `GrupoCard` | `src/components/dashboard/GrupoCard.tsx` | Card de grupo con métricas y link |
| `AlumnoRow` | `src/components/dashboard/AlumnoRow.tsx` | Fila de alumno con progreso inline |
| `UACProgressRow` | `src/components/dashboard/UACProgressRow.tsx` | Fila de UAC con barra de progreso |
| `ProgresionRow` | `src/components/dashboard/ProgresionRow.tsx` | Fila de progresión con cohorte completion |
| `RecomendacionCard` | `src/components/dashboard/RecomendacionCard.tsx` | Card de recomendación con tipo y acción |
| `ActividadStatsRow` | `src/components/dashboard/ActividadStatsRow.tsx` | Fila de actividad con score/abandon |
| `FichaCard` | `src/components/dashboard/FichaCard.tsx` | Card de ficha biblioteca |
| `DocenteTabBar` | `src/components/dashboard/DocenteTabBar.tsx` | Barra de tabs reutilizable (cliente) |
| `EmptyState` | `src/components/dashboard/EmptyState.tsx` | Estado vacío reutilizable |

---

## 8. Calidad objetivo vs Financiera

| Dimensión | Financiera | Bachillerato (objetivo) |
|-----------|------------|------------------------|
| Datos planeamiento | JSON estático | DB real (UAC + progresiones + intentos) |
| Recomendaciones | No existen | Automáticas desde datos reales |
| Detección de dificultades | No existe | Algoritmo sobre intentos |
| Reportes | Datos mock | Datos reales exportables |
| Biblioteca | 8 URLs hardcodeadas | 607 fichas reales de DB |
| UX visual | Premium (dark + animaciones) | Premium (mismo estilo base, data-driven) |
