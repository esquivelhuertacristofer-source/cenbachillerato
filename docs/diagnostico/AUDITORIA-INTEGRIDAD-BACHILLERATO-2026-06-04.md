# Auditoría de Integridad Técnica — CEN Bachillerato

**Fecha:** 2026-06-04
**Tipo:** Auditoría completa de integridad técnica (solo lectura)
**Alcance:** FASE 1–7 (build/lint/test/tipos, deuda de código, features nuevas, seguridad, performance, estado de BD, comparación histórica)
**Auditoría previa de referencia:** [`AUDITORIA-INTEGRIDAD-BACHILLERATO-2026-05-26.md`](./AUDITORIA-INTEGRIDAD-BACHILLERATO-2026-05-26.md) — score **6.3/10**
**Regla de la sesión:** NO se modificó código, BD ni configuración. Este documento es el único entregable escrito.

---

## 0. Veredicto global

| Métrica | 2026-05-26 | 2026-06-04 | Δ |
|---|---|---|---|
| **Score global** | 6.3 / 10 | **6.6 / 10** | **+0.3** |
| Build de producción | ✅ verde | ✅ verde (exit 0) | = |
| Tests (jest) | verde | ✅ 235/235 | ↑ |
| Lint | limpio | ⚠️ **8 errores + 24 warnings** | ↓ (regresión nueva) |
| Bundle JSON planteamiento | 🔴 2.2 MB estático | ✅ **diferido (lazy)** | ↑↑ |
| Feature "Práctica experimental" 3D | — | ⚠️ nueva, sin fallback WebGL | nuevo |
| Alta masiva CSV | — | 🔴 **HTTP 500 en prod** | nuevo bloqueante |

**Resumen de una línea:** la plataforma mejoró estructuralmente (bundle de planteamiento resuelto, suite de tests sólida, build estable), pero **introdujo dos riesgos nuevos de severidad alta/crítica**: el **500 de alta masiva** (entregable comercial bloqueado) y la **falta de fallback WebGL** en los laboratorios 3D. La nota sube poco porque las mejoras de fondo se compensan con deuda nueva visible.

---

## FASE 1 — Salud de build, lint, tipos y dependencias

| Comando | Resultado | Nota |
|---|---|---|
| `eslint src/` | ⚠️ **8 errores, 24 warnings** | Ver detalle abajo |
| `jest` | ✅ **235/235 passing** | Suite sólida |
| `tsc --noEmit` | ⚠️ exit 2 — **falso positivo** | Solo `TS6053` (`.next/types/cache-life.d.ts` / `validator.ts` no encontrados): artefactos generados en carrera con el build de Cloudflare concurrente. `next build` type-checkea limpio (exit 0). |
| `next build` | ✅ **exit 0** | Producción desplegable |
| `npm run pages:build` (OpenNext/CF) | ✅ **exit 0** | Bundle Cloudflare válido |
| `npm audit` | ⚠️ **6 vulnerabilidades moderate** | Transitivas; sin fix mayor disponible sin breaking |
| `npm outdated` | varios majors atrasados | No bloqueante |

### 1.1 Lint — 8 errores (🔴 REGRESIÓN INTRODUCIDA ESTA SESIÓN)

Los 8 errores son **`react-hooks/static-components`** ("Cannot create components during render") en
[`src/components/practicas/labs/LabDensidad.tsx`](../../src/components/practicas/labs/LabDensidad.tsx) — los subcomponentes `Eyebrow`, `Tile`, `Readout` (y el helper `card`) se declararon **dentro del cuerpo** de la función `LabDensidad` durante el rediseño de la interfaz.

- **Causa:** definir componentes en cada render rompe la identidad de tipo y desmonta/remonta el árbol en cada actualización.
- **Por qué el build pasa igual:** [`next.config.ts`](../../next.config.ts) no tiene bloque `eslint`, así que `next build` **no bloquea** por lint.
- **Severidad:** ALTO (deuda nueva, no de feature) — **corregible en minutos** elevando esos componentes fuera de `LabDensidad` y pasando `accent`/`color`/tokens como props.

### 1.2 Lint — 24 warnings
Mayoría `@typescript-eslint/no-explicit-any` y dependencias de hooks. Pre-existentes, no bloqueantes.

---

## FASE 2 — Deuda de código

| Hallazgo | Cantidad | Severidad |
|---|---|---|
| TODOs en código | ~11 | BAJO |
| Escapes de tipo (`any` / `as` assertions) | ~7 | MEDIO |
| Componentes huérfanos / no referenciados | ~10 | BAJO |
| Separación server/client components | ✅ limpia | — |

- **TODO relevante** en el flujo de actividades: marcar `es_placeholder=true` en instancias hasta validación — **no se está aplicando**, lo que explica la discrepancia de BD de FASE 6 (ver §6).
- **`plantilla-demo`** sigue mapeada en [`src/components/practicas/registry.tsx`](../../src/components/practicas/registry.tsx) (placeholder enviado a producción). MEDIO.

---

## FASE 3 — Features nuevas

### 3.1 🔴 CRÍTICO — Alta masiva CSV: HTTP 500 en producción (entregable comercial bloqueado)

**Diagnóstico definitivo con evidencia:**

**Causa raíz:** la variable de entorno **`SUPABASE_SERVICE_ROLE_KEY` no está provista en el runtime del Worker de Cloudflare**, y `getSupabaseAdmin()` **lanza una excepción no capturada** → 500.

Cadena de evidencia (archivo + línea):

1. [`src/lib/supabase-admin.ts:10`](../../src/lib/supabase-admin.ts#L10) — `getSupabaseAdmin()` lee `process.env.SUPABASE_SERVICE_ROLE_KEY`.
2. [`src/lib/supabase-admin.ts:12-16`](../../src/lib/supabase-admin.ts#L12-L16) — **lanza `throw new Error(...)` si la key falta** (no devuelve error manejable).
3. [`src/lib/actions/alta-masiva.ts:78`](../../src/lib/actions/alta-masiva.ts#L78) — el server action llama `getSupabaseAdmin()` **fuera del `try/catch`** → el throw se propaga sin capturar → respuesta 500.
4. [`wrangler.toml`](../../wrangler.toml) — **no declara** `[vars]` ni binding de secret para `SUPABASE_SERVICE_ROLE_KEY`.
5. [`.github/workflows/ci.yml:52-57`](../../.github/workflows/ci.yml#L52-L57) — el step de deploy inyecta **solo** `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`; **nunca** la service role key.

**Por qué falla solo en prod y no en local:** en local la key vive en `.dev.vars`/`.env`; en el Worker desplegado no existe → primer uso (alta masiva) revienta.

**Candidato secundario (verificar):** [`supabase/migrations/09_alta_masiva_must_change_password.sql`](../../supabase/migrations/09_alta_masiva_must_change_password.sql) añade `must_change_password` y reescribe `handle_new_user`; es de **aplicación manual**. Si no se aplicó en prod, el `INSERT`/`createUser` también fallaría aunque la key estuviera presente.

**Plan de corrección (para próxima sesión, NO ejecutado):**
1. `wrangler secret put SUPABASE_SERVICE_ROLE_KEY` (o añadir al step de deploy de CI).
2. Confirmar migración 09 aplicada en Supabase prod.
3. Endurecer `getSupabaseAdmin()` para **devolver `{ error }`** en vez de `throw`, y envolver la llamada de [`alta-masiva.ts:78`](../../src/lib/actions/alta-masiva.ts#L78) en `try/catch` con mensaje al usuario.

### 3.2 🔴 CRÍTICO — Laboratorios 3D: sin fallback de WebGL

[`src/components/practicas/labs/LabDensidad.tsx`](../../src/components/practicas/labs/LabDensidad.tsx) monta [`DensidadScene.tsx`](../../src/components/practicas/labs/DensidadScene.tsx) vía `next/dynamic({ ssr:false })` **sin ErrorBoundary**. En un dispositivo sin WebGL (equipos viejos de escuela), `<Canvas>` lanza y **tumba la página completa** en vez de degradar a un mensaje.

- **Aislamiento de bundle:** ✅ CORRECTO — `three`/R3F se importan **solo** en `DensidadScene.tsx`, cargado de forma diferida; **ninguna otra ruta descarga three.js** (confirmado por análisis de imports y por la tabla de rutas del build — el chunk pesado solo cuelga de `…/actividad/[orden]/practica`).
- **Riesgo de performance (ALTO):** [`DensidadScene.tsx:301-319`](../../src/components/practicas/labs/DensidadScene.tsx#L301-L319) recalcula normales (`computeVertexNormals`) sobre ~1764 vértices **cada frame**; `frameloop` siempre activo; `dpr={[1,2]}` ([línea 423](../../src/components/practicas/labs/DensidadScene.tsx#L423)) sin degradación adaptativa; Bloom+Vignette ([482-485](../../src/components/practicas/labs/DensidadScene.tsx#L482-L485)). En GPUs integradas habrá caída de FPS / calentamiento.

### 3.3 ✅ Planteamiento Sem 2–6 — deuda de bundle RESUELTA
El loader estático de 32 JSON (2.2 MB) que la auditoría previa marcó 🔴 fue reemplazado por [`src/data/planteamiento/hub-index.ts`](../../src/data/planteamiento/hub-index.ts) con `LOADERS` (dynamic `import()` perezoso). **Mejora real y verificada.**

- ⚠️ Deuda residual (BAJO): [`src/data/planteamiento/hub.ts`](../../src/data/planteamiento/hub.ts) (loader estático viejo) **sigue en el repo como código muerto** — footgun, recomendado eliminar.

### 3.4 Landing
Implementada en código. Sin hallazgos críticos.

---

## FASE 4 — Seguridad

| Control | Estado |
|---|---|
| Secretos en repo (`.env*`, service role key) | ✅ **No expuestos / no commiteados** |
| Auth en server actions | ✅ [`alta-masiva.ts:11-17`](../../src/lib/actions/alta-masiva.ts#L11-L17) verifica sesión + rol admin |
| Validación de input (Zod) | ✅ `FilaCSVSchema.safeParse` [`alta-masiva.ts:44`](../../src/lib/actions/alta-masiva.ts#L44) |
| RLS Supabase | ✅ activa (verificación de tablas individuales requiere SQL editor) |
| CSP | ✅ estricta en [`next.config.ts`](../../next.config.ts), sin `eval`, sin fetch externos |

- **MEDIO:** archivo `.dev.vars` local con la service role key — correcto que exista para dev, verificar que esté en `.gitignore` (lo está). Riesgo solo si se commitea por error.

**Veredicto FASE 4: PASS.**

---

## FASE 5 — Performance

| Hallazgo | Severidad | Evidencia |
|---|---|---|
| N+1 en detalle de progreso por UAC | 🟠 **ALTO** | [`src/lib/queries/progreso.ts:58`](../../src/lib/queries/progreso.ts#L58) — bucle anidado ~90+ queries |
| Imágenes vía `<img>` nativo (sin `next/image`) | 🟡 MEDIO | [`InfografiaActivity.tsx:31`](../../src/components/activities/InfografiaActivity.tsx#L31), [`…/ficha/[id]/page.tsx:97`](../../src/app/hub/biblioteca/[uac]/ficha/[id]/page.tsx#L97) — probable causa de imágenes lentas en prod |
| N+1 del hub | ✅ RESUELTO | [`src/lib/queries/hub.ts:436-482`](../../src/lib/queries/hub.ts#L436-L482) — batch con `.in()` confirmado intacto |
| Aislamiento bundle 3D | ✅ OK | Ver §3.2 |

---

## FASE 6 — Estado de la base de datos (producción, solo lectura)

| Métrica | Esperado (usuario) | **Real (medido)** | Estado |
|---|---|---|---|
| UAC | 32 | **32** | ✅ |
| Fichas biblioteca | 607 | **607** | ✅ |
| Planteamiento (progresiones con contenido) | 207 | **207** | ✅ |
| Actividades con práctica | 1 | **1** | ✅ |
| Progresiones (no placeholder) | 207 | **222** | ⚠️ **+15** |
| Actividades publicadas | ~609 | **1586** | ⚠️ **+977** |
| Simulaciones (`tipo='simulacion'`) | 0 | **13** | 🟠 **discrepancia** |

**Interpretación honesta:**

1. **Actividades publicadas 1586 vs ~609 esperadas — NO es un error, es crecimiento.** Coincide con el build completo de los 6 semestres (≥7 act/progresión + producto integrador en 32 UAC). El "~609" del usuario era una base previa. **Sin acción**, salvo confirmar que el conteo casa con lo planeado.

2. **Progresiones 222 vs 207 — 15 progresiones sin planteamiento.** Hay 222 progresiones pero solo 207 tienen contenido de planteamiento. Esas 15 son stubs **no marcados `es_placeholder=true`** (el TODO de FASE 2). Recomendado: marcarlas o completarlas.

3. 🟠 **Simulaciones 13 vs 0 esperadas — la limpieza NO se reflejó en producción.** El [`INFORME-SESION-2026-06-04.md`](../../../INFORME-SESION-2026-06-04.md) (§4) afirma que se eliminaron 12 actividades `tipo='simulacion'`, pero producción **todavía tiene 13**. Posibilidades: el script `del-sem1-simuladores.ts` corrió en *dry-run*/local y **nunca se ejecutó contra prod**, o hay simulaciones de otros semestres. **Verificar antes de afirmar que la limpieza está hecha.**

> Notas: `actividades_total=1598`, `publicada=1586` → **12 en estado no publicado** (borrador). Conteos de RLS por tabla e integridad relacional (huérfanos `intentos`/`progreso` sin user) **requieren ejecución manual en el SQL editor** (PostgREST no soporta los anti-joins necesarios); no se pudieron completar en esta sesión de solo lectura vía REST.

---

## FASE 7 — Comparación con auditoría previa (2026-05-26, 6.3/10)

### Mejoró ✅
- Bundle de planteamiento: 2.2 MB estático → diferido (mayor mejora).
- N+1 del hub: resuelto con batching.
- Suite de tests: 235/235 verde.
- Build de producción y bundle Cloudflare: estables (exit 0).

### Empeoró ↓
- **Lint:** de limpio a **8 errores** (regresión de esta sesión en `LabDensidad.tsx`) + 24 warnings.
- **Código muerto nuevo:** `hub.ts` viejo y `plantilla-demo` en prod.

### Nuevo 🆕
- 🔴 **500 de alta masiva** (service role key ausente en Worker) — bloqueante comercial.
- 🔴 **Labs 3D sin fallback WebGL** — riesgo de crash en equipos viejos.
- 🟠 **Riesgo de performance 3D** (normales por frame, frameloop siempre activo).
- 🟠 **Discrepancia de simulaciones** en BD (13 vs 0).

---

## Recomendaciones priorizadas (Top 15)

| # | Acción | Severidad |
|---|---|---|
| 1 | Provisionar `SUPABASE_SERVICE_ROLE_KEY` en el Worker (`wrangler secret put` o CI) | 🔴 CRÍTICO |
| 2 | Endurecer `getSupabaseAdmin()` → devolver `{error}` en vez de `throw`; envolver `alta-masiva.ts:78` en try/catch | 🔴 CRÍTICO |
| 3 | Confirmar migración 09 aplicada en Supabase prod | 🔴 CRÍTICO |
| 4 | Añadir ErrorBoundary + fallback WebGL alrededor de `DensidadScene` | 🔴 CRÍTICO |
| 5 | Corregir los 8 errores de lint (hoistear `Eyebrow`/`Tile`/`Readout` fuera de `LabDensidad`) | 🟠 ALTO |
| 6 | Optimizar 3D: degradación adaptativa de `dpr`, normales solo al cambiar, considerar `frameloop="demand"` | 🟠 ALTO |
| 7 | Resolver N+1 en `progreso.ts:58` con batching `.in()` | 🟠 ALTO |
| 8 | Verificar/ejecutar limpieza de las 13 simulaciones en prod (o documentar que son válidas) | 🟠 ALTO |
| 9 | Marcar `es_placeholder=true` en las 15 progresiones stub | 🟡 MEDIO |
| 10 | Migrar `<img>` → `next/image` en infografías y fichas | 🟡 MEDIO |
| 11 | Quitar `plantilla-demo` del registry de producción | 🟡 MEDIO |
| 12 | Eliminar código muerto `src/data/planteamiento/hub.ts` | 🟡 BAJO |
| 13 | Revisar las 6 vulnerabilidades moderate de `npm audit` | 🟡 BAJO |
| 14 | Limpiar los ~7 escapes de tipo (`any`/assertions) | 🟡 BAJO |
| 15 | Añadir bloque `eslint` a `next.config.ts` para que el build falle ante errores de lint | 🟡 BAJO |

---

*Auditoría de solo lectura. No se modificó código, base de datos ni configuración. Evidencia citada con archivo:línea. Conteos de BD medidos en producción vía consultas de solo lectura.*
