# Auditoría General de Producción — CEN Bachillerato

**Fecha:** 2026-07-24
**Alcance:** revisión de inicio a fin — salud de código, estructura/arquitectura, deuda técnica, seguridad, viabilidad de escala y aptitud para uso real con menores.
**Método:** 4 gates de calidad ejecutados en limpio + 4 auditorías profundas independientes (arquitectura, deuda técnica, seguridad/RLS, dependencias/config/bundle/docs) + verificación cruzada manual de los hallazgos de mayor impacto contra el código.
**Restricción honrada:** solo lectura. No se corrieron migraciones, no se aplicaron cambios, no se hizo push. El estado **vivo** de RLS se aplica manualmente en el SQL Editor y **no se puede confirmar desde una revisión estática** — todo lo que se afirma sobre RLS es "está en el SQL", no "confirmado en la BD".

---

## Veredicto

**APTA PARA PILOTO REAL, condicionada a un checklist de go-live corto.**

El código es de grado producción: gates en verde, arquitectura por encima del promedio, cero defectos críticos o de alto riesgo confirmados como explotables, y las 4 palancas de escalabilidad completas en código. Lo que separa la plataforma de abrirse a menores **no son reescrituras**, sino un conjunto pequeño de comprobaciones operativas y de despliegue — encabezado por **probar que RLS está vivo en la BD** (la única vía por la que podría existir una fuga entre escuelas si la base no coincide con los archivos de migración).

---

## Salud del código (gates, corridos en limpio 2026-07-24)

| Gate | Resultado |
|---|---|
| `tsc --noEmit` (strict + noUncheckedIndexedAccess) | **0 errores** |
| `eslint` | **0 errores** |
| `jest` | **366/366 (26 suites)** |
| `next build` (Turbopack) | **limpio, 0 warnings de bundle** |

**Higiene excepcional (medida, no estimada):** 0 `console.log`, 0 `debugger`, 0 `dangerouslySetInnerHTML`, 0 `catch {}` verdaderamente vacíos, 0 tests deshabilitados (`.skip`/`.only`/`todo`), 0 TODO/FIXME/HACK genuinos, ~0 código comentado muerto. Los ~80 "TODO" del grep son falsos positivos (español "todo/todos" en texto didáctico). Logging solo en error boundaries etiquetados y logs dev-guarded.

---

## Viabilidad de escala (el número que importa)

| Item | Valor | Fuente |
|---|---|---|
| `handler.mjs` gzipped (chunks SSR inlineados) | **1.87 MiB** | **Medido** |
| Worker final estimado (handler + index + middleware + glue CF) | **~2.0 MiB** | Estimado, consistente con la nota previa de ~2.14 MiB |
| Límite duro del Worker (plan de pago Cloudflare) | 3 MiB gzipped | — |
| **Headroom** | **~65% usado — PASS** | — |
| three.js / @react-three en el Worker | **0** (verificado: BufferGeometry/WebGLRenderer/Object3D/PerspectiveCamera = 0 en handler.mjs) | **Medido** ✓ |
| three.js en cliente | chunk estático 1.27 MB, servido por CDN/R2 — **no cuenta** contra el Worker | Medido |

**Las 4 palancas de escalabilidad están completas en código:**
- **#1 Split catálogo/personal (KV cache)** ✅ — el catálogo (idéntico para todos) se sirve de Cloudflare KV, colapsando ~60% de las lecturas del hub.
- **#3 Snapshot denormalizado del progreso** ✅ **APLICADA Y VERIFICADA EN BD** (migración 25 — NO reaplicar): lookup por PK en vez de scan vivo; fail-open al scan de `intentos` si el snapshot es null.
- **#2 Hidratación client-side del shell** ✅ — `/hub`, `/hub/uac/[codigo]`, `/hub/progreso` pintan skeleton al instante y rellenan con queries de navegador.
- **#4 Batching/debouncing de escrituras** ✅ — ya existía.

Con #1 + #3 en producción, el driver de costo real (carga concurrente autenticada contra Postgres) queda colapsado: catálogo desde KV + progreso personal por PK.

**Caveat honesto:** la capacidad concreta (objetivo 15–20k cuentas / 5–7k concurrentes bajo el presupuesto autorizado de ~$13k MXN/año) es una **estimación de planeación, no telemetría**. La arquitectura la soporta con el plan de pago + las palancas; confirmar contra tráfico real cuando arranque el piloto.

---

## Bloqueadores de go-live (resolver ANTES de abrir a menores)

Ninguno es una reescritura de código. Son comprobaciones y pasos operativos.

1. **Probar que RLS está VIVO en la BD (M4 — el único riesgo real de fuga entre escuelas).** Las migraciones se aplican a mano, así que ninguna de las correcciones RLS (16, 18, 19, 20, 25) se puede confirmar activa desde aquí. Correr la prueba por-rol de RLS en vivo (un alumno no puede leer datos de otra escuela; un docente solo su grupo; etc.). **Confirmar además que `21_rls_logros_with_check.sql` NO se aplicó después de la 20** (revive escritura de admin escolar que la 20 cerró) — mitigado si la migración 22 (que elimina las tablas `logros`) sí se aplicó.
2. **Secretos de runtime en el Worker.** Las 3 variables de Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) no están en `wrangler.toml` (correcto). Deben cargarse como Worker secrets (`wrangler secret put`) en prod, y las dos `NEXT_PUBLIC_*` también en **build time**. Un deploy que salte este paso hace que la app dé 401. Los bindings KV/R2/rate-limit sí están completos.
3. **Publicar las ~12 actividades `borrador-video`** (o aceptarlas explícitamente como borradores). Pendiente de checklists previos.

---

## Endurecimiento de alto valor (fuertemente recomendado, no bloqueante estricto)

- **M2 — Rate limiting de login falla abierto.** `rate-limit.ts:92` y `:114` devuelven `allowed:true` ante cualquier error/binding faltante. Deliberado y documentado, pero el throttling de auth desaparece en silencio ante cualquier hipo del binding. **Verificado en código.** → Agregar un backstop fail-closed para `login:*` (Cloudflare WAF/Turnstile) para que el freno de fuerza bruta nunca dependa solo de este módulo.
- **Tests en server actions sensibles a seguridad.** `iniciar-sesion.ts` (login), `cambiar-password.ts` / `resetear-password.ts` (ciclo de contraseña), `crear-escuela.ts` / `crear-admin-escolar.ts` (provisión de escuela/admin) tienen **cero tests**, en una plataforma para menores. La mayor brecha de cobertura. (Los caminos ya cubiertos: `proxy.ts`, `alta-masiva`, `entregar-actividad` + batch, `rate-limit`, `jwt-claims`, `r2-respuestas`, `sync-queue`, y las queries de hub/docente/uac/progreso.)
- **M1 — Dos páginas admin evitan RLS vía service role.** `admin/usuarios/page.tsx:36` y `admin/grupos/page.tsx:22` leen PII de menores con `getSupabaseAdmin()` (RLS se salta por completo); la aislación entre escuelas depende solo del filtro manual `.eq("escuela_id", …)`. Hoy correcto y bien comentado, pero un edit futuro que quite ese filtro fuga PII de todas las escuelas sin backstop de BD. → Preferir el cliente SSR ligado a RLS, o agregar un test de regresión sobre el filtro de escuela.
- **M3 — Puntajes/completado son auto-reportados por el cliente.** `entregar-actividad.ts:26,96` acepta `puntaje` (0–100) del cliente y lo inserta tal cual; el único check de servidor es que la actividad esté `publicada`. **Verificado en código.** Impacto contenido (XP/logros retirados en mig 22, `intentos` append-only). Aceptable como límite conocido de quizzes calificados en cliente, o calificar en servidor donde se conoce la respuesta correcta.

---

## Deuda técnica (post-lanzamiento, no bloqueante)

| # | Deuda | Severidad | Detalle |
|---|---|---|---|
| 1 | **`hub.ts` (1111 L) + `hub-browser.ts` (1090 L) mantenidos por duplicado** | **ALTA** | Confirmado independientemente por 2 auditores. Cada cambio de query del hub hay que hacerlo dos veces; la divergencia server/browser es un riesgo de corrección real. Es la mayor deuda de mantenibilidad fuera del contenido de labs. |
| 2 | **~58 labs re-implementan la persistencia de estrellas inline** mientras el hook `useEstrellas.ts` está escrito pero **importado por 0 labs** | MEDIA | El bloque `persistMejor` (localStorage + `guardarEstrellas`) es byte-a-byte idéntico en decenas de archivos. Un bug en él requiere editar ~58 archivos. Fix: adoptar el hook existente. |
| 3 | **Cluster de type-escapes de Supabase (33 `any`/`as any`/eslint-disable)** | MEDIA | Señala drift de esquema: los tipos generados van atrás de la BD viva (`must_change_password`, tablas de planteamiento). `supabase gen types` eliminaría la mayoría y restauraría seguridad de compilación en los caminos de escritura. |
| 4 | **4 catch silenciosos que tragan errores de BD/red** | MEDIA | `biblioteca.ts:215` (`marcarFichaLeida`), `LatestDeliveries.tsx:92`, `hub/uac/[codigo]/page.tsx:99`, `recursos/laboratorios/page.tsx:251`. Dado que RLS mal configurado devuelve 0 filas **sin error**, estos caminos "vacío silencioso" son exactamente donde una fuga/mala config de RLS se disfrazaría de "no hay contenido". |
| 5 | **jsPDF se filtra al bundle del servidor** pese al import dinámico client-side | MEDIA | `AcroForm`×3 en `handler.mjs`; ~250 KB gz. No es riesgo de límite hoy, pero come headroom. Fix: aislar el código PDF para que Turbopack lo mantenga client-only. |
| 6 | **16 archivos > 800 líneas** | BAJA | Mayormente labs declarativos (Lab*.tsx 1000–1183 L). El par hub.ts/hub-browser.ts (ver #1) es el único preocupante por lógica. |
| 7 | **`@sentry/nextjs` huérfano** (en node_modules, ausente de package.json, no importado en `src`) | BAJA | Observabilidad vía Sentry **no está cableada** pese a que `.env.example` la anuncia. Decidir: integrar o limpiar. |
| 8 | **8 `react-hooks/exhaustive-deps` deshabilitados** | BAJA | Riesgo latente de stale-closure en algunas escenas/quiz. |

---

## Estructura y arquitectura (fortalezas)

Auditor independiente: **"codebase por encima del promedio."**

- **Frontera server/client disciplinada, cero fugas.** three.js totalmente code-split fuera del Worker (imports pesados solo en `*Scene.tsx` `"use client"`, cargados vía `dynamic(..., { ssr:false })`).
- **Modelo de dominio limpio:** unión discriminada de 12 tipos de actividad; dualidad de queries server/browser compartiendo módulos puros (`progreso-shared.ts`).
- **Server actions DRY y validadas:** patrón `getUser()` → `checkRateLimit` → Zod → `{ok:true}|{error}` en cada frontera de confianza.
- **Defensa en profundidad de auth:** `proxy.ts` (sucesor de middleware en Next 16, deny-by-default, decode local de JWT para evitar viaje remoto) + guards de layout server-side (`getUser()` + rol) + RLS + revalidación por server-action. Documenta honestamente que el decode local NO verifica firma; la authz real vive en RLS + guards.
- **TS estricto real:** `strict` + `noUncheckedIndexedAccess` + `noImplicitReturns` + `noFallthroughCasesInSwitch`.
- **Headers HTTP completos:** CSP con `frame-ancestors 'none'`, `connect-src` fijado al proyecto Supabase, HSTS 2y preload, X-Frame-Options DENY, nosniff, Permissions-Policy. `'unsafe-eval'` solo en dev.

Debilidades estructurales menores: naming confuso `hub-v2/` vs `hub/` (MED), registry manual de prácticas ~140 entradas (MED), sin `not-found.tsx` (BAJA).

---

## Riesgos de despliegue (config/tooling)

1. **Fragilidad de los patch-scripts de OpenNext.** `patch-opennext-turbopack.mjs` (postinstall) y `postbuild-turbopack.mjs` son parches por coincidencia de string contra internos de `@opennextjs/cloudflare` (arreglan el bug de `requireChunk` vacío → 500 en toda ruta). Fallan ruidosamente (`process.exit(1)`) — bien — pero un bump menor del adapter (permitido por `^1.19.11`) puede invalidar el match en silencio. **Desplegar solo vía `npm ci` contra el lockfile committeado; re-validar el parche en cualquier upgrade del adapter.**
2. **Doc/README obsoletos.** `README.md` es el boilerplate default de `create-next-app` ("Deploy on Vercel", Geist font) — cero relación con el proyecto real (Cloudflare Workers + Supabase). `AUDITORIA-PLATAFORMA.md` (2026-06-07) sigue siendo la mejor visión de sistema pero tiene conteos obsoletos (`incrementalCache:"dummy"` ya es `kv`; Sentry ya no activo; conteos de actividades/labs drifteados). **Los conteos de todos los docs están internamente inconsistentes — tratar el registry como fuente de verdad, no los docs.**
3. **Headroom de bundle + fuga de jsPDF** (ver deuda #5): ~65% hoy, monitorear el tamaño gzipped reportado por el deploy de wrangler.

---

## Confirmado-seguro (verificado en el código actual)

- **Sin secretos hardcodeados** en `src/` ni `scripts/` (greps de `eyJ…`, `sb_secret_`, `sk_live/test_`, `service_role:` = 0 matches).
- Service-role key solo en `.env.local`/`.dev.vars`, ambos gitignored y **nunca committeados** (`git log -S` = nada).
- Cliente service-role es **server-only** (`supabase-admin.ts` lanza si falta la key; sin `'use client'`; no alcanzable desde ningún client component).
- Los 3 layouts protegidos (`admin`, `hub`, `dashboard/docente`) fuerzan rol server-side. Un alumno no llega a `/admin` ni `/dashboard/docente`.
- `must_change_password` forzado en profundidad (proxy + cada layout + página).
- Zod en cada frontera de server action; contenido de actividad vía `validators.ts`.
- `/api/health` (única `route.ts`) devuelve solo `{status, timestamp}` — sin leak.
- Migraciones 18 y 19 corrigen las fugas cross-school de `profiles` y `alumnos_grupos` **en el SQL** (pendiente confirmar en vivo — ver bloqueador #1).

---

## Resumen de severidad (consolidado)

| Severidad | Conteo | Naturaleza |
|---|---|---|
| **Crítica** | **0** | Ninguna. |
| **Alta (explotable, confirmada)** | **0** | Ninguna fuga cross-tenant ni escalación de privilegios confirmada en el código. |
| **Bloqueadores de go-live** | **3** | Verificación/operativos (RLS vivo, secretos, borradores) — no reescrituras. |
| **Media (seguridad + deuda)** | **~8** | Defensa-en-profundidad/operativas + deuda estructural. |
| **Baja** | **~10** | Higiene, cosmético, docs. |

---

## Cierre

La plataforma está en buena salud de código y estructura, con arquitectura por encima del promedio y las palancas de escala listas. **No hay defectos críticos ni de alto riesgo confirmados como explotables.** El camino a producción real es corto y concreto: probar RLS en vivo (bloqueador #1), cargar los secretos del Worker, publicar los borradores, y — como endurecimiento fuerte — un backstop fail-closed para el login y tests en los server actions de auth. La deuda técnica (duplicación hub, copy-paste de labs, drift de tipos, docs obsoletos) es real pero **post-lanzamiento**: no bloquea el piloto.

*Auditoría generada por Claude Code (Opus 4.8) — 4 auditorías profundas independientes + verificación cruzada manual. Todo hallazgo de RLS es "en el SQL"; el estado vivo de la BD debe confirmarse manualmente antes del go-live.*
