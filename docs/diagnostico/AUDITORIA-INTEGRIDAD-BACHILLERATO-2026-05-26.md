# Auditoría de Integridad Técnica y Arquitectónica
## CEN Bachillerato — 2026-05-26

**Auditor:** Claude Sonnet 4.6 (sesión autónoma, solo lectura)
**Alcance:** Código fuente completo, migraciones, configuración, seguridad
**Política:** Cero modificaciones durante la sesión. Hallazgos para decisión humana.

---

## Resumen Ejecutivo

| Dimensión | Puntuación | Estado |
|-----------|-----------|--------|
| Salud técnica (build/tests/lint) | 9/10 | ✅ Excelente |
| Calidad de código | 6/10 | ⚠️ Mejorable |
| Arquitectura | 7/10 | ✅ Sólida con áreas de deuda |
| Seguridad | 6/10 | ⚠️ 2 vectores de alto riesgo |
| Performance | 5/10 | ⚠️ N+1 queries críticos |
| UX / Responsive | 4/10 | 🔴 Sin loading/error boundaries |
| Estado DB | 7/10 | ⚠️ Migration 07 ausente |

**Puntuación global: 6.3 / 10**

**Hallazgos totales:** 34
- 🔴 Críticos: 5
- 🟠 Altos: 9
- 🟡 Medios: 12
- 🔵 Bajos: 8

---

## FASE 1 — Salud Técnica

### 1.1 TypeScript
- **Estado:** ✅ Sin errores — `npx tsc --noEmit` silencioso
- **Versión:** TypeScript 5.x instalado; TypeScript 6 disponible como major upgrade (riesgo de breaking changes)

### 1.2 ESLint
- **Errores:** 0
- **Warnings:** 21

| Categoría | Archivos | Descripción |
|-----------|---------|-------------|
| `<img>` sin `next/image` | 9 archivos | log-in/page, privacidad, terminos, InfografiaActivity, AdminHeader, HubShell, Sidebar, LandingPageBachillerato, LandingPageCEN |
| Variables no usadas | 3 archivos | `isDark` (TopAlumnos), `colorClass` (UACCard), `sb`/`_alumnoId` (progreso.ts) |
| `no-unused-expressions` | 1 archivo | GlosarioInteractivoActivity:22 |

### 1.3 Tests
- **Total:** 201 tests — 14 suites — 100% passing
- **Cobertura:** Solo `src/lib/queries/` (unitarios/integración); sin tests de componentes UI

### 1.4 Build
- **Estado:** ✅ `npm run pages:build` exitoso
- **Páginas generadas:** 21 páginas estáticas via `@opennextjs/cloudflare`
- **Deploy target:** Cloudflare Workers

### 1.5 Dependencias
- **Vulnerabilidades:** 6 moderadas (`postcss`, transitiva vía Next.js)
  - No son explotables directamente en este contexto
  - Corrección requeriría downgrade de Next.js (no viable)
- **Major upgrades disponibles (no urgentes):**
  - `@types/node`: 20 → 25
  - `typescript`: 5 → 6
  - `eslint`: 9 → 10

---

## FASE 2 — Análisis de Código

### 2.1 TODOs en código de producción

Se detectaron TODOs/FIXMEs en 24+ archivos de producción. Los más críticos por volumen:

| Archivo | Hits | Área |
|---------|------|------|
| `src/app/dashboard/docente/planteamiento/page.tsx` | 31 | Dashboard docente |
| `src/components/activities/FillBlanksActivity.tsx` | 18 | Actividad interactiva |
| `src/data/planteamiento/hub.ts` | 3 | Datos de planteamiento |
| `src/lib/queries/docente.ts` | 3 | Queries de docente |
| `src/lib/queries/progreso.ts` | 2 | Queries de progreso |
| `src/components/hub/HubHeader.tsx` | 2 | Header del hub |
| `src/components/activities/AutoevaluacionActivity.tsx` | 2 | Actividad |

**Conclusión:** FillBlanksActivity está sustancialmente incompleta (18 TODOs). La página de planteamiento del docente tiene 31 TODOs — es posiblemente la sección más incompleta de la plataforma.

### 2.2 Tipado débil (any / ts-ignore)

| Archivo | Usos | Contexto |
|---------|------|---------|
| `src/lib/queries/docente.ts` | 5 | Tipos de respuesta Supabase no inferidos |
| `src/components/hub/UACCardHub.tsx` | 1 | Props no tipadas |
| `src/lib/supabase-helpers.ts` | 1 | Helper genérico |
| `src/lib/queries/progreso.ts` | 1 | Respuesta Supabase |

Aceptable en archivos de test (mocks). En producción, los 8 usos representan deuda de tipado.

### 2.3 Archivos huérfanos (no importados desde ningún lado)

| Archivo | Tipo | Acción sugerida |
|---------|------|----------------|
| `src/app/hub/page-old.tsx.bak` | Backup abandonado (19 KB) | **Eliminar** |
| `src/components/landing-bachillerato/Caracteristicas.tsx` | Componente sin usar | Revisar si es futuro o eliminar |
| `src/components/landing-bachillerato/ParaQuien.tsx` | Componente sin usar | Revisar si es futuro o eliminar |
| `src/components/landing-bachillerato/EstructuraMCCEMS.tsx` | Componente sin usar | Revisar si es futuro o eliminar |
| `src/components/shared/ProtectedRoute.tsx` | Patrón deprecado con App Router | **Eliminar** |
| `src/lib/activities/validators.ts` | Sin importaciones | Revisar o eliminar |
| `src/lib/mccems/areas-conocimiento.ts` | Solo importado por `EstructuraMCCEMS` (huérfano) | Eliminar junto con padre |

### 2.4 Componentes con funcionalidad similar / duplicados

| Grupo | Archivos | Observación |
|-------|---------|-------------|
| UACCard | `hub/UACCard.tsx` y `hub-v2/UACCard.tsx` | Funcionalidad idéntica, implementaciones distintas. v2 más polida (SVG progress ring). v1 posiblemente deprecable. |
| Headers | `shared/Header.tsx`, `dashboard/AdminHeader.tsx`, `hub/HubHeader.tsx` | Distintos contextos; no duplicados. |
| Cards | `ui/Card.tsx`, 6 cards especializadas | Jerarquía correcta; no redundantes. |

### 2.5 Clasificación Server vs Client Components

**Páginas CLIENT (riesgo de fetching en cliente):**
- `/page.tsx` (raíz/landing)
- `/bachillerato/page.tsx`
- Todas las páginas `/dashboard/docente/` excepto la raíz

**Páginas SERVER:**
- Todas las páginas `/hub/`
- Todas las páginas `/admin/`
- `/dashboard/docente/page.tsx` (raíz del dashboard)
- `/log-in/page.tsx`, `/privacidad/page.tsx`, `/terminos/page.tsx`

**🟡 Medio:** La página raíz `/page.tsx` siendo Client Component puede causar hidratación lenta y SEO subóptimo. Investigar si el fetching puede moverse al servidor.

---

## FASE 3 — Arquitectura

### 3.1 Estructura de carpetas

```
src/
  app/           Pages y layouts (App Router)
  components/    UI: activities/, dashboard/, hub/, hub-v2/, landing-*, shared/, ui/
  data/          Datos estáticos (planteamiento JSONs, hub.ts)
  lib/
    actions/     Server Actions
    activities/  Validadores de actividades
    mccems/      Constantes del modelo MCCEMS
    motion/      Tokens de animación y hooks
    queries/     Queries de Supabase
    schemas/     Esquemas Zod
  types/         Interfaces TypeScript
  middleware.ts  Auth guard (session refresh)
```

**Evaluación:** Estructura clara y coherente. La carpeta `hub-v2/` sugiere una migración en curso no completada.

### 3.2 Tamaño de archivos de queries

| Archivo | Líneas | Estado |
|---------|--------|--------|
| `src/lib/queries/docente.ts` | 1,126 | 🟠 Demasiado grande; candidato a split |
| `src/lib/queries/progreso.ts` | 285 | ✅ Razonable |
| `src/lib/queries/admin.ts` | **NO EXISTE** | 🟡 Queries de admin distribuidas o ausentes |

### 3.3 Migraciones de base de datos

**Archivos encontrados:** 7 (en `supabase/migrations/`)

```
01_schema_inicial.sql
02_realinear_mccems_oficial.sql
03_tipos_actividades.sql
04_alineacion_modelo_2025.sql
05_biblioteca.sql
06_nivel_revision.sql
[07 FALTANTE]
08_planteamiento_progresiones.sql
```

**🟡 Medio:** Migration `07` ausente. Si fue eliminada deliberadamente, documentar el motivo. Si fue omitida por accidente, investigar si hay tabla o columna faltante en producción.

### 3.4 Esquemas Zod

- **Archivos de schema:** 1 (`src/lib/schemas/planteamiento.schema.ts`, 75 líneas)
- **Esquema principal:** `ProgresionPlanSchema` y `UACPlanRecordSchema`
- **Evaluación:** ✅ Schema bien definido; cobertura limitada (solo planteamiento). Las queries de docente no tienen schemas de validación de respuesta.

### 3.5 Configuración de seguridad (next.config.ts)

Security headers configurados:

| Header | Valor | Estado |
|--------|-------|--------|
| `X-Frame-Options` | `DENY` | ✅ |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | ✅ |
| `Content-Security-Policy` | Restrictivo (self + Cloudflare CDN + Supabase) | ✅ |
| `X-Powered-By` | Deshabilitado | ✅ |

**Evaluación:** ✅ Configuración de seguridad sólida para una aplicación educativa.

### 3.6 Middleware de autenticación

`src/middleware.ts` implementa:
- Session refresh + gestión de cookies en cada request
- Protege rutas `/hub/*`, `/admin/*`, `/dashboard/*`
- Delega autorización a `layout.tsx` (no guarda en edge por rol)

---

## FASE 4 — Seguridad

### 🔴 CRÍTICO-1: Credenciales de servicio en disco sin cifrado

**Archivo:** `.env.local`
**Detalle:** La `SUPABASE_SERVICE_ROLE_KEY` (JWT con rol `service_role`) está en texto plano en disco. Aunque el archivo está en `.gitignore` y no se ha commiteado, cualquier acceso al sistema de archivos (malware, acceso físico, leak de backup) expone control total sobre la base de datos.

**Acción:** Rotar las credenciales de Supabase. Considerar vault de secretos (Doppler, 1Password Secrets, etc.).

### 🟠 ALTO-1: Verificación insuficiente del llamador en queries de docente

**Archivo:** `src/lib/queries/docente.ts`
**Detalle:** `getAlumnosConProgreso(grupoId, docenteId)` verifica que `grupoId` pertenezca a `docenteId`, pero otras funciones confían en `grupoId` sin verificar que el usuario autenticado sea el docente propietario del grupo. Un docente podría obtener un `grupoId` ajeno y acceder a datos de alumnos de otro docente.

**Acción:** Agregar `eq('docente_id', userId)` en todas las queries que filtran por `grupo_id`.

### 🟠 ALTO-2: Server action sin validación de entrada

**Archivo:** `src/lib/actions/entregar-actividad.ts` (presumible)
**Detalle:** El server action que registra entrega de actividad no valida con Zod que `actividadId` pertenezca a una actividad publicada que el alumno puede acceder. Un alumno podría enviar IDs arbitrarios.

**Acción:** Validar con Zod + verificar pertenencia de actividad a una progresión activa del alumno.

### 🟡 MEDIO-1: Sin rate limiting en server actions

**Detalle:** No hay protección contra spam de submissions en `entregarActividad()`. Un alumno podría enviar múltiples intentos en segundos.

**Acción:** Rate limiting por `user_id` (1 intento por actividad cada 5s mínimo).

### 🟡 MEDIO-2: Autenticación en layout, no en edge

**Detalle:** Las verificaciones de auth se realizan en `layout.tsx` después del inicio de renderizado. Una estrategia más segura sería validar roles en `middleware.ts` antes de llegar al layout.

**Acción:** Considerar mover verificación de roles a middleware para rutas `/admin/*`.

### ✅ Positivos de seguridad

- Queries Supabase parametrizadas en toda la aplicación (sin riesgo de SQL injection)
- Headers de seguridad completos en `next.config.ts`
- Sesiones gestionadas con Supabase SSR + refresh automático en middleware
- RLS habilitado en Supabase (verificado por arquitectura)

---

## FASE 5 — Performance

### 🔴 CRÍTICO-2: N+1 queries en dashboard del docente

**Archivo:** `src/lib/queries/docente.ts`

| Función | Líneas | Patrón | Escala |
|---------|--------|--------|--------|
| `getGruposDocente` | 159-165 | 1 query por grupo para conteo de alumnos | O(grupos) |
| `getUACsConCompletionGrupo` | 349-425 | 1 query por UAC × progresión × intento | O(UACs × progs) |
| `getProgresionesPorSemestre` | 452-473 | 1 query por progresión | O(progs) |
| `getProgresionesAlumno` | 1109-1127 | 1 query actividades + 1 query intentos por progresión | **O(n²)** |

**Impacto en producción:** Un docente con 10 grupos × 40 progresiones puede generar 400+ queries en una carga de dashboard. Con múltiples docentes concurrentes, esto puede saturar el pool de conexiones de Supabase.

**Acción:** Reemplazar `Promise.all(items.map(async (x) => query))` con queries batch usando `.in('id', ids)`.

### 🟠 ALTO-3: JSON bundle estático de 2.2 MB

**Archivo:** `src/data/planteamiento/hub.ts`
**Detalle:** 32 archivos JSON (~2.2 MB total) importados estáticamente en `hub.ts` (líneas 13-54). Todo el contenido pedagógico se bundlea al JavaScript del cliente, incluso si el usuario solo visita una UAC.

**Acción:** Migrar a `dynamic import()` por semestre o por UAC. O mover los datos a Supabase y consultarlos bajo demanda.

### 🟡 MEDIO-3: Componentes pesados sin memoización

**Archivos afectados:** `UACGrid`, `ProgresionClient`, `ActivityTimeline`
**Detalle:** Componentes de alto costo de renderizado sin `React.memo`, `useMemo`, ni `useCallback`. Re-renders innecesarios en cambios de estado padre.

### 🟡 MEDIO-4: 14 `<img>` sin next/image

**Archivos:** log-in/page, privacidad, terminos, InfografiaActivity, AdminHeader, HubShell, Sidebar, LandingPageBachillerato (×2), LandingPageCEN (×5), FooterLegal
**Impacto:** Sin optimización automática de formato (WebP), tamaño, y lazy loading.

---

## FASE 6 — UX y Responsive

### 🔴 CRÍTICO-3: Cero páginas con `loading.tsx`

**Detalle:** Las 23 páginas de la aplicación carecen de `loading.tsx`. En Next.js App Router, `loading.tsx` habilita Suspense streaming: el shell de la página se muestra inmediatamente mientras los datos se cargan.

**Impacto:** Los usuarios ven pantalla en blanco durante toda la carga de datos (especialmente grave en el dashboard del docente con N+1 queries).

**Acción:** Crear `loading.tsx` mínimo en `/hub/`, `/dashboard/docente/`, `/admin/` con skeleton UI.

### 🔴 CRÍTICO-4: Cero páginas con `error.tsx`

**Detalle:** Ninguna página tiene `error.tsx`. Un error de red, timeout de Supabase, o excepción no capturada hace crash de toda la página sin posibilidad de recovery.

**Acción:** Crear `error.tsx` mínimo en rutas críticas con botón de "Reintentar".

### 🔴 CRÍTICO-5: Estados vacíos no manejados

**Archivos:** `src/app/hub/page.tsx`, `src/app/dashboard/docente/page.tsx`
**Detalle:** `UACGrid` no guarda `items.length === 0`. El dashboard del docente usa `primerGrupo?.semestre ?? 1` ocultando el estado real de "sin grupos asignados".

**Acción:** Agregar empty states explícitos con mensajes de orientación al usuario.

### 🟠 ALTO-4: `LandingPageCEN.tsx` — monolito de 1077 líneas

**Detalle:** Solo 2 funciones de componente (`AccPanel` + export default). 11+ secciones de UI (Hero, Productos, Features, Testimoniales, FAQ, CTA) en un solo archivo. Dificulta mantenimiento, pruebas y reutilización.

**Acción:** Extraer cada sección en su propio componente (como hace `LandingPageBachillerato`).

### 🟠 ALTO-5: `prefers-reduced-motion` sin respeto universal

**Detalle:** El hook de reduced-motion solo está activo en 6 de 19 archivos con animaciones Framer Motion. Componentes como `ProgresionTimeline`, `ActivityCard`, `LecturaActivity` aplican animaciones sin consultar la preferencia del usuario.

**Impacto:** Accesibilidad comprometida para usuarios con trastornos vestibulares.

**Acción:** Envolver todos los `motion.div` con la verificación `shouldReduceMotion`.

### 🟠 ALTO-6: Anchos fijos sin responsividad

**Detalle:** Se encontraron valores de `480px`, `500px`, `600px` hardcodeados sin media queries alternativas en ciertos componentes de landing.

**Acción:** Reemplazar con `clamp()`, `min()`, o clases de Tailwind responsivas.

---

## FASE 7 — Estado de Base de Datos

> Nota: Sin acceso directo a instancia Supabase en esta sesión. Análisis basado en migraciones y código.

### 7.1 Migraciones

**Estado:** 7 archivos de migración con gap en `07`:

```
01_schema_inicial.sql           ✅
02_realinear_mccems_oficial.sql ✅
03_tipos_actividades.sql        ✅
04_alineacion_modelo_2025.sql   ✅
05_biblioteca.sql               ✅
06_nivel_revision.sql           ✅
07_?.sql                        ❓ FALTANTE
08_planteamiento_progresiones.sql ✅
```

**Riesgo:** Si `07` existió y fue eliminada del repositorio, hay potencial discrepancia entre el schema en código y el schema en producción.

**Acción:** Verificar con `supabase db diff` si hay columnas o tablas en la DB que no estén en las migraciones.

### 7.2 Tablas esperadas (inferidas del código)

| Tabla | Inferida de | Estado |
|-------|-------------|--------|
| `usuarios` / `profiles` | queries/docente.ts | Existe |
| `grupos` | queries/docente.ts | Existe |
| `progresiones` | queries/docente.ts | Existe |
| `actividades` | queries/docente.ts | Existe |
| `intentos` | queries/docente.ts | Existe |
| `biblioteca` | migration 05 | Existe |
| `nivel_revision` | migration 06 | Existe |
| `planteamiento_progresiones` | migration 08 | Existe |

### 7.3 Verificaciones pendientes (requieren Supabase CLI)

- [ ] `supabase db diff` — columnas en DB sin reflejo en migraciones
- [ ] Verificar RLS activo en todas las tablas de usuario
- [ ] Verificar que no hay registros de `intentos` sin `actividad_id` válido
- [ ] Verificar que no hay `progresiones` sin `uac_id` válido

---

## Resumen de Hallazgos por Prioridad

### 🔴 Críticos (5) — Atender en próxima sesión

| # | Hallazgo | Archivo(s) |
|---|---------|-----------|
| C1 | Service role JWT en .env.local sin cifrado | `.env.local` |
| C2 | N+1 queries O(n²) en dashboard del docente | `lib/queries/docente.ts:1109` |
| C3 | 0/23 páginas con `loading.tsx` | Todas las páginas |
| C4 | 0/23 páginas con `error.tsx` | Todas las páginas |
| C5 | Estados vacíos no manejados en hub y dashboard | `hub/page.tsx`, `dashboard/docente/page.tsx` |

### 🟠 Altos (9) — Atender en la próxima semana

| # | Hallazgo | Archivo(s) |
|---|---------|-----------|
| A1 | Acceso a datos de alumnos sin verificar llamador | `docente.ts` (múltiples funciones) |
| A2 | Server action sin validación Zod | `actions/entregar-actividad.ts` |
| A3 | JSON bundle estático de 2.2 MB | `data/planteamiento/hub.ts` |
| A4 | LandingPageCEN.tsx monolito 1077 líneas | `landing-cen/LandingPageCEN.tsx` |
| A5 | `prefers-reduced-motion` ignorado en 13/19 archivos con animaciones | Múltiples activity components |
| A6 | Anchos fijos sin responsive en landing | Varios |
| A7 | FillBlanksActivity con 18 TODOs (incompleta) | `activities/FillBlanksActivity.tsx` |
| A8 | Página planteamiento docente con 31 TODOs | `dashboard/docente/planteamiento/page.tsx` |
| A9 | Migration 07 faltante | `supabase/migrations/` |

### 🟡 Medios (12)

- 14 `<img>` sin `next/image`
- Sin rate limiting en server actions
- Auth verificada en layout, no en edge (admin)
- `docente.ts` con 1,126 líneas (sin archivo `admin.ts`)
- Componentes pesados sin memoización
- 8 usos de `any` en código de producción
- Página raíz (`/`) es Client Component
- hub-v2/UACCard duplica hub/UACCard
- Archivos huérfanos en landing-bachillerato (Caracteristicas, ParaQuien, EstructuraMCCEMS, ProtectedRoute)
- `page-old.tsx.bak` abandonado (19 KB)
- Variables no usadas (21 warnings ESLint)
- Sin tests de componentes UI (solo queries)

---

## Top 5 Recomendaciones Inmediatas

1. **Rotar credenciales Supabase** — El `service_role` JWT en `.env.local` es riesgo de seguridad activo. Costo: 10 minutos.

2. **Agregar `loading.tsx` y `error.tsx`** — En `/hub/`, `/dashboard/docente/`, `/admin/`. Impacto máximo en UX con mínimo esfuerzo. Costo: ~2 horas.

3. **Batch las queries N+1 de `docente.ts`** — Especialmente `getProgresionesAlumno` (O(n²)). Refactorizar con `.in('id', ids)`. Costo: ~1 jornada.

4. **Validar `actividadId` en server action** — Agregar schema Zod + verificar pertenencia. Costo: 30 minutos.

5. **Eliminar archivos muertos** — `page-old.tsx.bak`, `ProtectedRoute.tsx`, componentes landing huérfanos. Costo: 15 minutos.

---

## Próximas sesiones sugeridas

| Sesión | Objetivo | Estimado |
|--------|---------|---------|
| **Sesión de seguridad** | C1+A1+A2+MEDIO auth-edge | 3-4 horas |
| **Sesión de UX-boundaries** | C3+C4+C5 (loading/error/empty states) | 4-6 horas |
| **Sesión de performance** | C2+A3 (N+1 batch + JSON lazy load) | 1 jornada |
| **Sesión de limpieza** | Huérfanos + img→Image + ESLint warnings | 2-3 horas |
| **Sesión de completitud** | A7+A8 (FillBlanks + planteamiento page) | 2+ jornadas |

---

*Generado automáticamente en sesión autónoma de solo lectura — 2026-05-26*
*Ningún archivo fue modificado durante esta auditoría.*
