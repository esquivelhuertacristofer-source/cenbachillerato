# Diagnóstico de Salud Técnica — CEN Bachillerato

**Fecha:** 2026-05-17  
**Ejecutado por:** Claude Sonnet 4.6 (diagnóstico automático)  
**Solicitado por:** Cristofer Esquivel Huerta  
**Contexto:** Primer diagnóstico exhaustivo post-migración MCCEMS 2025. Detonado por el descubrimiento de que el deploy automático nunca había existido.  
**Alcance:** Solo lectura. Cero modificaciones de código ni DB.

---

## Resumen ejecutivo

| Severidad | Cantidad |
|-----------|----------|
| CRÍTICO   | 4        |
| ALTO      | 6        |
| MEDIO     | 8        |
| BAJO      | 4        |
| OBSERVACIÓN | 5      |
| **TOTAL** | **27**   |

### Top 5 problemas más serios

1. **[CRÍTICO] Ningún propósito oficial existe en DB** — `es_placeholder=false` = 0 en producción. Los 48 propósitos del Semestre 1 existen solo en archivos TypeScript, nunca se ejecutaron los seeds.
2. **[CRÍTICO] Todas las imágenes del sitio están rotas** — `public/Logo Cen.png`, `bachillerato.png`, `bento_*`, `assets/`, imágenes numeradas 2–8 — nunca fueron commiteadas a git.
3. **[CRÍTICO] `NEXT_PUBLIC_SUPABASE_URL` puede no estar en GitHub Secrets** — Si no está configurado, el CI compila el app con URL placeholder (`https://placeholder.supabase.co`). El sitio deployado hoy no puede conectar a Supabase.
4. **[ALTO] Sentry configurado pero no implementado** — `SENTRY_DSN` y `SENTRY_AUTH_TOKEN` en `.env.local` y CI, pero cero código de Sentry en `src/`. En producción no hay error monitoring.
5. **[ALTO] URL de Supabase hardcodeada en `next.config.ts`** — El CSP header tiene `xmcfuwdanlciqdxqtslv.supabase.co` en texto plano. Si cambia el proyecto Supabase, hay que modificar código y hacer deploy.

### Nivel general de salud técnica: **4 / 10**

La arquitectura de base es sólida (RLS bien diseñado, TypeScript strict, tests existentes, estructura curricular correcta). Pero hay múltiples suposiciones falsas sobre el estado de producción: el deploy nunca existió, el contenido oficial nunca llegó a DB, el monitoring nunca se activó, y los assets visuales no están en el repositorio. El proyecto se ha estado construyendo sobre supuestos no verificados.

---

## CATEGORÍA 1 — Pipeline y Deploy

### Lo que está bien
- El pipeline de CI existe y corre: lint → typecheck → test → build → pages:build → deploy
- El deploy a Cloudflare Workers está configurado correctamente hoy (2026-05-17)
- Si lint o tests fallan, el deploy se detiene (pasos en serie)
- Los secrets de Cloudflare están configurados en GitHub

### Lo que está mal

**[CRÍTICO] C1-001: Deploy automático nunca existió hasta hoy**
El Worker de Cloudflare fue deployado manualmente el 2026-05-13 con `wrangler deploy` desde una máquina local. Ningún push a git desde entonces actualizó el sitio. El CI solo construía, nunca deployaba. Todos los commits de migración y contenido (a918a25 → 146dd1d, 8 commits) nunca llegaron a producción hasta este diagnóstico.

**[ALTO] C1-002: No hay rollback automático**
Si el deploy llega a Cloudflare pero el Worker falla en runtime (JS error, variable faltante), no hay mecanismo de rollback. Cloudflare Workers tiene versioning pero no está configurado para revertir automáticamente.

**[ALTO] C1-003: No hay healthcheck post-deploy**
El CI termina cuando `wrangler deploy` reporta éxito. No hay paso que haga un HTTP request al sitio y verifique que responde 200. Un build exitoso no garantiza un sitio funcional.

**[MEDIO] C1-004: Deploy corre en TODOS los branches**
```yaml
on:
  push:
    branches: ["**"]
```
El CI completo corre en cualquier push a cualquier branch. El deploy tiene un `if: github.ref == 'refs/heads/main'` correcto, pero todos los otros pasos (lint, test, build) corren en branches de feature también, consumiendo minutos de GitHub Actions sin necesidad.

**[MEDIO] C1-005: No hay environments separados (dev / staging / prod)**
Todo va directo a producción. No hay forma de probar un cambio antes de que llegue a usuarios reales. Un bug introducido en un commit llega a prod en ~8 minutos.

**[BAJO] C1-006: `CLOUDFLARE_API_TOKEN` sin rotación**
El token fue creado hoy. No hay fecha de expiración configurada (TTL vacío en el dashboard). Si se compromete, no hay rotación automática ni alerta.

### Requiere decisión humana
- ¿Se crea un branch `develop` o `staging` con deploy a un Worker separado?
- ¿Se configura un healthcheck post-deploy que bloquee el pipeline si falla?

---

## CATEGORÍA 2 — Sincronización entorno local vs producción

### Lo que está bien
- `.env.local` está en `.gitignore` (`.env*` ignorado)
- No hay credenciales hardcodeadas en `src/`
- Los seeds son idempotentes (upsert por `codigo`)

### Lo que está mal

**[CRÍTICO] C2-001: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` pueden no estar en GitHub Secrets**
`NEXT_PUBLIC_*` son variables que Next.js *bake-in* en el bundle en tiempo de build. El CI usa:
```yaml
NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co' }}
```
Si el secret no está configurado en GitHub, el app deployado hoy tiene `https://placeholder.supabase.co` como URL de Supabase. El resultado: login no funciona, hub no carga, nada que use Supabase opera.
**Verificación urgente requerida:** ir a GitHub → Settings → Secrets → verificar si `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` están presentes.

**[ALTO] C2-002: No existe `.env.example`**
No hay archivo `.env.example` en el repositorio. Un desarrollador nuevo que clone el repo no sabe qué variables configurar. La guía de desarrollo (`docs/GUIA-DESARROLLO.md`) menciona las variables, pero no hay un template ejecutable.
Variables en `.env.local` local: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`.

**[ALTO] C2-003: URL de Supabase hardcodeada en `next.config.ts` (CSP)**
```typescript
"connect-src 'self' https://xmcfuwdanlciqdxqtslv.supabase.co wss://xmcfuwdanlciqdxqtslv.supabase.co"
```
El project ID de Supabase está en el código fuente, no en una variable de entorno. Si se migra o renombra el proyecto Supabase, hay que modificar `next.config.ts` y hacer deploy.

**[BAJO] C2-004: Un solo entorno de Supabase**
El entorno local y producción usan la misma DB de Supabase (`xmcfuwdanlciqdxqtslv`). Cualquier script de seed corrido en local afecta datos de producción. No hay DB de desarrollo separada.

### Requiere decisión humana
- ¿Se crea un proyecto Supabase separado para desarrollo?
- ¿Se verifica ahora mismo si los secrets de Supabase están en GitHub?

---

## CATEGORÍA 3 — Estado de la rama main

### Lo que está bien
- Rama única `main` sincronizada con `origin/main` (0 commits pendientes)
- 43 commits totales, historia limpia y con mensajes descriptivos
- `.gitignore` protege `.env*`, `node_modules`, `.next/`, `coverage/`

### Lo que está mal

**[CRÍTICO] C3-001: Assets públicos esenciales no están en git**
Los siguientes archivos existen localmente pero nunca fueron commiteados:
```
public/Logo Cen.png          ← logo principal del sitio
public/bachillerato.png      ← imagen de bachillerato
public/bento_curriculo.png   ← card de landing
public/bento_monitoring.png  ← card de landing
public/assets/               ← directorio completo de assets
public/2.png – 8.png         ← imágenes numeradas usadas en landing
```
Resultado: **todas las imágenes del sitio están rotas en producción** desde que se activó el deploy automático hoy.

**[MEDIO] C3-002: `.open-next/` no está en `.gitignore`**
El directorio `.open-next/` (artefacto del build de Cloudflare Workers, ~50-100MB) está untracked pero no ignorado en `.gitignore`. Un `git add .` accidental lo commitearía. El `.gitignore` tiene `.wrangler` pero no `.open-next`.

**[BAJO] C3-003: Archivos untracked potencialmente importantes**
- `HANDOFF.md` — existe localmente, untracked. ¿Es documentación relevante que debería estar en el repo?
- `docs/SISTEMA-DISEÑO-FINANCIERA.md` — nombre sugiere que pertenece a otro proyecto (CEN Financiera). Contaminación de archivos entre proyectos.

**[BAJO] C3-004: PDFs de programas oficiales en `public/` no commiteados**
12 PDFs de programas oficiales MCCEMS 2025 en `public/` están untracked. Si se commiten, aumentan significativamente el tamaño del repo. Si no, no están disponibles en producción.

---

## CATEGORÍA 4 — Dependencias

### Lo que está bien
- Solo 2 vulnerabilidades, ambas moderadas (no críticas)
- `package-lock.json` existe y está commiteado
- TypeScript en versión reciente (5.9.3)

### Lo que está mal

**[MEDIO] C4-001: Vulnerabilidad en `postcss` via `next`**
```
postcss <8.5.10 — XSS via Unescaped </style> in CSS Stringify Output
Severity: moderate
Affected: next 9.3.4-canary.0 – 16.3.0-canary.5
```
El fix requiere `npm audit fix --force` que instalaría Next.js 9.3.3 (breaking change). En la práctica, esta vulnerabilidad afecta el servidor de desarrollo, no el build de producción (Turbopack no usa este path). De baja probabilidad de explotación en este contexto.

**[BAJO] C4-002: Dependencias con actualizaciones menores disponibles**
| Paquete | Actual | Disponible |
|---------|--------|------------|
| `@opennextjs/cloudflare` | 1.19.9 | 1.19.10 |
| `@types/node` | 20.19.41 | 25.8.0 |
| `react` / `react-dom` | 19.2.4 | 19.2.6 |
| `tsx` | 4.21.0 | 4.22.1 |
| `wrangler` | 4.90.1 | 4.92.0 |
| `typescript` | 5.9.3 | 6.0.3 (major) |

TypeScript 6.0 es un salto mayor — no actualizar sin revisión de breaking changes.

**[BAJO] C4-003: `ts-node` agregado como dependencia hoy sin verificar si era necesario antes**
`ts-node` fue agregado como `devDependency` hoy para que Jest funcione en CI. Localmente funcionaba sin él (posiblemente por instalación global). Esto indica que el entorno local y CI no estaban en paridad desde antes.

---

## CATEGORÍA 5 — Base de datos

### Lo que está bien
- Migración estructural 04 aplicada correctamente: 32 UAC, LC-IV/V/VI eliminadas, HUM→PFH, IN-V creado
- RLS habilitado en **todas las tablas** (13/13)
- Las políticas cubren SELECT, INSERT, UPDATE, DELETE para los casos principales
- Seeds son idempotentes (upsert por `codigo`)

### Lo que está mal

**[CRÍTICO] C5-001: Cero propósitos oficiales en DB**
```
es_placeholder = false:  0 registros
es_placeholder = true:  185 registros
```
Los seeds del Semestre 1 (seed-lci.ts, seed-pmi.ts, etc.) fueron **reescritos** con contenido oficial pero **nunca ejecutados** contra Supabase. El reporte de FASE 4 en el log de migración documentó la creación de los archivos, no su ejecución. La DB tiene 185 progresiones placeholder, todas de semestres anteriores a la migración.
Comparación con lo reportado: el log dice "48 es_placeholder=false en Semestre 1" — esto fue un error de documentación. La realidad es 0.

**[MEDIO] C5-002: `database.types.ts` desactualizado**
El archivo `src/types/database.types.ts` fue generado antes de la migración 02. La columna `es_placeholder` existe en la DB pero no está tipada correctamente en TypeScript. Documentado como DT-001, sin resolver.

**[MEDIO] C5-003: No hay INSERT/UPDATE policies para `progresiones`**
Las migraciones definen solo `SELECT` para `progresiones`:
```sql
CREATE POLICY "authenticated can read progresiones"
  ON public.progresiones FOR SELECT TO authenticated USING (true);
```
No hay política de INSERT o UPDATE. Los seeds usan `service_role` (bypass RLS), lo cual es correcto para seeds. Pero si se quisiera permitir a admins editar progresiones desde la UI, no hay política que lo permita sin service_role.

**[MEDIO] C5-004: No hay índices explícitos en columnas críticas**
Las queries más frecuentes usan `progresiones.uac_id`, `progresiones.es_placeholder`, `progresiones.numero`. El schema inicial no tiene índices explícitos en estas columnas. Supabase puede crear índices automáticos para FKs, pero `es_placeholder` y `numero` probablemente no los tienen.

**[BAJO] C5-005: `actividades` tabla presumiblemente vacía**
No se encontraron seeds de actividades. El sistema de actividades pedagógicas está implementado en código (12 tipos) pero la tabla probablemente está vacía en producción.

### Requiere decisión humana
- ¿Se ejecutan los seeds del Semestre 1 ahora contra producción?
- ¿Se crea una política RLS de INSERT para `progresiones` para admins?

---

## CATEGORÍA 6 — Estructura del código

### Lo que está bien
- `tsconfig.json` tiene `"strict": true` + `noUncheckedIndexedAccess` + `noImplicitReturns` + `noFallthroughCasesInSwitch` — configuración TypeScript excelente
- Cero `@ts-ignore` / `@ts-nocheck` en el código fuente
- `next.config.ts` no tiene `ignoreBuildErrors` ni `ignoreDuringBuilds`
- ESLint corre y bloquea el CI
- Headers de seguridad configurados: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP

### Lo que está mal

**[ALTO] C6-001: Queries de Supabase dispersas fuera de `src/lib/queries/`**
Las páginas de admin acceden a Supabase directamente:
```
src/app/admin/escuelas/page.tsx     → .from("escuelas")
src/app/admin/grupos/page.tsx       → .from("grupos"), .from("escuelas"), .from("profiles")
src/app/admin/usuarios/page.tsx     → .from("profiles")
src/app/log-in/page.tsx             → .from("user_consents"), .from("profiles")
```
Esto rompe la arquitectura establecida de centralizar queries en `src/lib/queries/`. Si cambia el schema, hay que actualizar múltiples archivos. Riesgo de inconsistencias.

**[MEDIO] C6-002: `LandingPageCEN.tsx` tiene 946 líneas**
Un componente de 946 líneas es un megacomponente que mezcla lógica, animaciones, contenido y markup. Difícil de mantener, testear y revisar. El segundo más grande, `LandingPageBachillerato.tsx`, tiene 508 líneas.

**[BAJO] C6-003: Un único TODO en código de producción**
```typescript
// src/types/activities.ts:4
// TODO: Marcar es_placeholder=true en todas las instancias hasta validación
```
No bloquea funcionalidad pero indica trabajo pendiente en el sistema de actividades.

---

## CATEGORÍA 7 — Tests

### Lo que está bien
- 150 tests pasando, 14 suites, 0 fallos
- Tests corren en CI (verificado)
- Coverage thresholds definidos en `jest.config.ts`
- No hay tests deshabilitados (`xit`, `it.skip`, etc.)
- Tests de estructura curricular cubren la migración 2025

### Lo que está mal

**[CRÍTICO] C7-001: Coverage real de componentes es 8%, threshold es 30% — pero CI nunca lo verifica**
```
src/components/ real coverage:
  Statements: 8%  (threshold: 30%)
  Branches:   8%  (threshold: 30%)
  Functions:  9%  (threshold: 30%)
  Lines:      8%  (threshold: 30%)
```
El CI corre `npm run test -- --ci --passWithNoTests` **sin el flag `--coverage`**. Los thresholds de coverage definidos en `jest.config.ts` nunca se evalúan. Si el CI corriera con `--coverage`, fallaría en este mismo momento. Este fallo está completamente oculto.

**[MEDIO] C7-002: Cobertura global: 30% statements, 17% branches**
Las áreas críticas (hub pages, admin pages, log-in) están explícitamente excluidas del coverage (`!src/app/**`). Los componentes hub (Sidebar, UACCard, SemestreSelector) tienen tests, pero el resto de componentes no.

**[BAJO] C7-003: Tests de queries usan mocks extensivos de Supabase**
Los tests de `src/lib/queries/` mockean el cliente de Supabase. Esto garantiza que el código TypeScript compila pero no verifica que las queries funcionen contra la DB real. No hay tests de integración.

---

## CATEGORÍA 8 — Seguridad

### Lo que está bien
- Headers de seguridad configurados en `next.config.ts`
- `.env.local` está en `.gitignore`
- No hay credenciales hardcodeadas en `src/`
- RLS habilitado en todas las tablas
- Auth verificada server-side en layouts de `/admin/*` y `/hub/*`
- `SUPABASE_SERVICE_ROLE_KEY` solo se usa en scripts de seed (no en código de la app)

### Lo que está mal

**[ALTO] C8-001: Credenciales demo commiteadas en el repositorio**
`docs/DEMO-USERS.md` (commiteado en git) contiene:
```
admin@cenbachillerato-demo.com / Demo2026!
docente@cenbachillerato-demo.com / Demo2026!
alumno1@cenbachillerato-demo.com / Demo2026!
```
Si el repo es público, cualquier persona puede acceder al sistema demo. Si el repo es privado, cualquier colaborador con acceso al repo tiene las credenciales.

**[ALTO] C8-002: `script-src 'unsafe-inline' 'unsafe-eval'` en CSP**
```typescript
"script-src 'self' 'unsafe-inline' 'unsafe-eval'"
```
`unsafe-inline` y `unsafe-eval` en `script-src` prácticamente neutralizan el valor del CSP contra XSS. Esta configuración fue probablemente necesaria para Next.js/React, pero debería evaluarse si es posible restringirla con nonces o hashes.

**[MEDIO] C8-003: No hay rate limiting en el endpoint de login**
`src/app/log-in/page.tsx` usa Supabase Auth directamente. Supabase tiene rate limiting por defecto, pero no hay una capa adicional de rate limiting en la app. Un ataque de fuerza bruta solo está limitado por Supabase.

**[BAJO] C8-004: Historial de git no auditado para credenciales**
Solo 43 commits en total. No se auditó el contenido de commits anteriores para verificar que no haya credenciales commiteadas por error en el pasado.

---

## CATEGORÍA 9 — Datos y contenido

### Lo que está bien
- Estructura curricular correcta en DB: 32 UAC, nomenclatura MCCEMS 2025, LC-IV/V/VI eliminadas, PFH en lugar de HUM, IN-V presente
- Scripts de seed escritos con contenido oficial y `es_placeholder=false` para los 7 UAC del Semestre 1
- Scripts de verificación existen (`verify-orphans.ts`, `verify-semestre1.ts`)

### Lo que está mal

**[CRÍTICO] C9-001: Cero propósitos oficiales en DB**
Ya documentado en C5-001. Se reitera aquí porque es el hallazgo de contenido más importante.

**[MEDIO] C9-002: 185 progresiones placeholder en producción**
Los 32 UAC tienen progresiones pero todas son `es_placeholder=true`. El contenido que ven los usuarios (si alguno accede) es inventado, no el oficial MCCEMS 2025. Semestres 2–6 no tienen scripts de seed con contenido oficial.

**[MEDIO] C9-003: `docs/contenido/HUM-I.md` obsoleto**
El archivo documenta propósitos para HUM-I, una UAC que ya no existe (migrada a PFH-I). Puede generar confusión en el equipo pedagógico.

**[BAJO] C9-004: Estado de las cuentas demo desconocido**
Las cuentas demo están documentadas en `docs/DEMO-USERS.md`. No se verificó si siguen funcionales en Supabase. El script `create-demo-users.ts` existe para recrearlas.

---

## CATEGORÍA 10 — Documentación

### Lo que está bien
- `docs/` tiene documentación extensa: arquitectura, deuda técnica, guía de desarrollo, demo users, inventario de contenido, migraciones
- Decisiones de migración bien documentadas con log detallado
- `docs/GUIA-DESARROLLO.md` documenta setup inicial (aunque sin `.env.example`)
- `docs/DEUDA-TECNICA.md` existe y tiene items activos

### Lo que está mal

**[MEDIO] C10-001: No hay README en la raíz del repositorio**
No existe `README.md`. GitHub muestra el repositorio sin descripción ni instrucciones. Cualquier persona que llegue al repo no sabe qué es el proyecto ni cómo ejecutarlo.

**[MEDIO] C10-002: `docs/GUIA-DESARROLLO.md` no documenta el pipeline de deploy**
La guía documenta setup local pero no menciona cómo funciona el CI/CD ahora que existe. "Cómo deployar" no está documentado.

**[BAJO] C10-003: Documentación de backups de DB ausente**
`docs/DEMO-USERS.md` menciona Supabase pero no hay documentación de la política de backups ni de cómo restaurar. Supabase hace backups automáticos pero no se menciona en ningún documento.

---

## CATEGORÍA 11 — Operación

### Lo que está bien
- Cloudflare Workers tiene dashboard con métricas básicas (requests, errores)
- Supabase tiene monitoring básico incorporado

### Lo que está mal

**[ALTO] C11-001: Sentry configurado pero no implementado**
`NEXT_PUBLIC_SENTRY_DSN` y `SENTRY_AUTH_TOKEN` están en `.env.local` y el CI tiene `SENTRY_AUTH_TOKEN`. Pero no hay archivos `sentry.*.config.ts`, ni instrumentación en `src/`. En producción, los errores de runtime (JS errors, failed fetches) son completamente invisibles para el equipo.

**[MEDIO] C11-002: No hay alertas configuradas**
No hay documentación de alertas en Cloudflare ni en Supabase. Si el Worker cae, nadie recibe una notificación proactiva.

**[MEDIO] C11-003: Capacidad de usuarios concurrentes no estimada**
Cloudflare Workers tiene un límite de 50ms de CPU por request (plan gratuito) y 100,000 requests/día gratis. Supabase free tier tiene 500MB de DB y 2GB de transfers. No hay estimación de cuántos alumnos concurrentes puede soportar la plataforma antes de degradación.

**[OBSERVACIÓN] C11-004: `wrangler.toml` usa `compatibility_date` del 2026-05-12**
No es urgente, pero conviene mantener este fecha actualizada periódicamente para recibir mejoras de compatibilidad de Cloudflare Workers.

---

## Mapa de cosas latentes

Las siguientes son bombas de tiempo con probabilidad e impacto estimados:

| Item | Probabilidad | Impacto | Cuándo atender |
|------|-------------|---------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` no está en GitHub Secrets → sitio no conecta a Supabase | ALTA | CRÍTICO | **Urgente** — verificar ahora |
| Primer `git add .` accidental commitea `.open-next/` (~100MB) | MEDIA | ALTO | Pre-demo |
| Coverage real vs threshold: si alguien agrega `--coverage` al CI, falla inmediatamente | ALTA | MEDIO | Pre-demo |
| Seeds de Semestre 1 nunca ejecutados → contenido oficial nunca visible | ALTA | ALTO | **Urgente** |
| Sentry no implementado → un bug en prod es invisible | ALTA | ALTO | Pre-producción real |
| Un solo branch → un commit con bug llega a prod en 8 min | ALTA | MEDIO | Pre-producción real |
| TypeScript types desactualizados → código que filtra por `es_placeholder` no tiene tipo correcto | MEDIA | MEDIO | Antes de features que usen ese campo |
| Credenciales demo en repo → acceso no autorizado al sistema demo | MEDIA | MEDIO | Cuando haya datos reales de usuarios |
| Migración a TypeScript 6.0 pendiente → cuando se quiera actualizar habrá breaking changes | BAJA | BAJO | Cuando haya tiempo |

---

## Hallazgos comparables al deploy (cosas asumidas que funcionaban pero nunca verificadas)

1. **Deploy automático** — Asumido que existía. Realidad: nunca existió.
2. **Seeds del Semestre 1 ejecutados** — El log de migración dice "7/7 UAC con propósitos oficiales". Realidad: `es_placeholder=false` = 0 en DB.
3. **Coverage thresholds de CI** — Definidos en `jest.config.ts`. Realidad: el CI no corre coverage, nunca se verificaron.
4. **Sentry funcionando** — DSN configurada en `.env.local`. Realidad: cero código de Sentry en la app.
5. **Assets públicos en git** — El sitio se veía bien localmente. Realidad: logo, imágenes de landing, assets completos nunca commiteados.
6. **Entorno local = entorno de CI** — Tests pasaban localmente. Realidad: `ts-node` no estaba como devDependency, CI fallaba.

---

## Contradicciones con reportes previos

| Reporte previo dice | Realidad encontrada |
|---------------------|---------------------|
| "es_placeholder=false en Semestre 1: 48" (MIGRACION-COMPLETADA.md) | es_placeholder=false en DB: **0** — los seeds nunca se ejecutaron |
| "FASE 6 — git push: 8 commits pusheados" | Correcto, pero el deploy automático no existía, así que estos commits nunca llegaron a producción |
| "DT-002: Sin Content Security Policy (CSP) — Pendiente" (DEUDA-TECNICA.md) | CSP está implementado en `next.config.ts` — el documento de deuda técnica no fue actualizado |

---

## Opinión honesta

### ¿Qué tan sólida está la base para los próximos 4-6 semanas?

**Regular-mal.** La arquitectura TypeScript es buena (strict, no ts-ignore, RLS), pero el estado de producción no corresponde con lo que el equipo cree que tiene. El sitio está vivo pero con imágenes rotas, sin contenido oficial en DB, y posiblemente sin conexión a Supabase si los secrets no están en GitHub. Construir más funcionalidad encima de esta base sin resolver los items críticos es agravar el problema.

### ¿Qué priorizar antes de generar más contenido?

En este orden:
1. Verificar que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` están en GitHub Secrets
2. Commitear todos los assets de `public/` al repositorio
3. Ejecutar los 7 seeds del Semestre 1 contra Supabase
4. Agregar `.open-next/` al `.gitignore`
5. Crear `.env.example`

### ¿Hay algo para parar todo y arreglar primero?

Sí: **C2-001** (verificar secrets de Supabase en GitHub). Si los secrets no están, el deploy de hoy tiene un sitio que parece funcionar (la página carga) pero no puede autenticar usuarios ni cargar contenido. Esto pasaría desapercibido hasta que alguien intente loguearse.

---

*Diagnóstico generado el 2026-05-17. No se modificó código, DB ni dependencias durante este proceso.*
