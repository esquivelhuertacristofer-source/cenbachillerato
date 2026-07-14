# Plan de Escalabilidad y Uso Recurrente — CEN Bachillerato

**Fecha:** 2026-07-13 (revisión posterior el mismo día: costo cero)
**Sigue a:** `AUDITORIA-GOLD-2026-07-13.md`
**Artifact:** https://claude.ai/code/artifact/4eaec38d-4963-475b-8878-916ce6694c42
**Disparador:** la plataforma está próxima a pilotearse con miles de alumnos de varias escuelas, corriendo sobre las suscripciones **gratuitas** de Cloudflare Workers y Supabase. Revisión posterior: **subir de plan no es una opción** — este documento asume $0 de gasto adicional.

> Cifras de "techo" son las publicadas por Cloudflare/Supabase para el plan Free, verificadas contra su documentación oficial (2 agentes de investigación + 2 de verificación adversarial), no telemetría en vivo del proyecto — confirmar uso real contra ambos dashboards antes de decidir presupuesto.

## 1. Dónde se satura primero

| Recurso | Techo plan Free | Riesgo |
|---|---|---|
| Cloudflare Workers — requests | 100,000 / día (duro) | Sin caché real, cada visita a cualquier página cuenta — incluido contenido idéntico para miles de alumnos. Pasar por la Cache API sigue contando 1 request; solo lo exento es un archivo estático servido por el binding `assets` |
| Worker — CPU por invocación | 10 ms | La espera de red (I/O) hacia Supabase **no** cuenta contra este reloj — 2-3 queries en serie no son el riesgo real. El riesgo es cómputo síncrono denso, ej. parsear 5,000 filas de CSV en un solo hilo en `alta-masiva.ts` |
| Worker — tamaño de bundle | 3 MiB gzip | Ya en 2.14 MiB / 69% (confirmado en la auditoría GOLD) — cada lab 3D nuevo reduce el margen |
| Supabase — pausa automática | 7 días sin actividad API | Riesgo de calendario: si se pausa entre validación y el día del piloto, todo cae hasta reactivación manual |
| Supabase — bandwidth egress | 5 GB uncached + 5 GB cached / mes (cupo unificado: DB+Auth+Storage+Edge Functions+Realtime) | Con `incrementalCache: "dummy"`, cada carga de página con datos cuenta aquí — con miles de alumnos activos, esto se agota **antes** que el cupo de requests de Cloudflare |
| Supabase — base de datos | 500 MB | El menos urgente de los seis |

**Respuesta directa:** el cuello de botella no es cómputo — es que hoy cada visita golpea Supabase en vivo porque el caché de Next está desactivado (`open-next.config.ts`: `incrementalCache: "dummy"`, `tagCache: "dummy"`, `queue: "dummy"`) y no hay una sola ruta con `revalidate` en `src/app`. Arreglar eso multiplica la capacidad efectiva sin gastar un peso.

## 2. ¿Y si subir de plan no es opción?

Sí se puede sostener un piloto de miles de alumnos con **$0 de gasto** — pero hay un número que ningún truco de código mueve: el cupo duro de Cloudflare Workers Free, **100,000 requests/día**. Las palancas gratuitas de la sección 3 no suben ese número; lo que hacen es (a) evitar que Supabase se caiga *mucho antes* de llegar a ese techo por agotar su cupo de egress, y (b) sacar del conteo todo el tráfico que se puede volver estático.

- **Hoy, sin cambios:** el sistema se rompe primero por egress de Supabase (5+5 GB/mes se agota en días con miles de alumnos), no por el propio límite de Cloudflare.
- **Con las palancas de la sección 3:** techo estimado de **≈4,000–8,000 alumnos activos/día** (100,000 requests/día ÷ 12–25 requests por alumno activo: login, hub, 2-4 actividades, 1-3 entregas, navegación). Es una estimación de planeación, no telemetría — confirmar contra uso real en cuanto arranque el piloto.
- **El único número que ninguna palanca gratuita cambia** es el cupo duro de 100,000 requests/día. Si el tráfico dinámico real algún día lo supera, la única palanca que lo mueve es Cloudflare Workers Paid ($5/mes → 10M requests/mes) — **no es parte de este plan por decisión explícita del usuario**, se anota solo como referencia.

## 3. Las palancas gratuitas que sí mueven la aguja

| Palanca | Qué resuelve | Límite real (Free) |
|---|---|---|
| **Exención de archivos estáticos** (binding `assets`, ya activo en `wrangler.toml`) | Requests que calzan con un archivo estático son gratis, ilimitados, y ni siquiera invocan el Worker — no cuentan contra el cupo de 100k/día. Candidatas: `/`, `/bachillerato`, `/privacidad`, `/terminos` y contenido curricular no personalizado convertido a build-time | Sin límite |
| **Cache API** (`caches.default`, cero uso actual en `src`) | Cachear en el edge respuestas de Supabase para contenido compartido (UAC, progresiones, glosario, actividad). Sigue contando como 1 request de Worker, pero ahorra el viaje y el egress a Supabase | 50 llamadas/request (comparte cupo con subrequests), objetos hasta 512 MB |
| **Workers KV** | Cachear contenido curricular que casi nunca cambia, escrito una vez por publicación, leído en cada visita. `open-next.config.ts` ya soporta `incrementalCache: "kv"` en vez de `"dummy"` — solo falta el binding | 100k lecturas/día · 1k escrituras/día · 1 GB |
| **R2** | Mover modelos/texturas de labs 3D e imágenes pesadas fuera de Supabase Storage. Saca esa carga completa del cupo de egress de Supabase | 10 GB almacenamiento · 1M ops Clase A + 10M Clase B/mes · cero egress |
| **Cron Triggers** | Ping periódico que evite la pausa automática de Supabase a los 7 días. Debe ejecutar una consulta real a Postgres — no está documentado que golpear solo un endpoint sin tocar la base cuente como "actividad" | 5 triggers/cuenta (doc oficial de Cloudflare inconsistente sobre si es por cuenta o por Worker) |

Ninguna de estas cinco filas requiere tarjeta de crédito. Todas están disponibles hoy mismo en el plan Free de Cloudflare.

## 4. Qué aprender — y qué no se pudo confirmar — de la plataforma hermana

**Corrección importante:** Educación Financiera corre en **Cloudflare, no en Vercel** (migró después de perder acceso a Vercel). La versión anterior de este documento tenía el dato viejo. No fue posible localizar la configuración actual (post-migración) de Cloudflare de esa plataforma en ningún directorio de trabajo accesible en esta sesión — si se quiere comparar contra su config real (bindings KV/R2, `wrangler.toml`, `open-next.config.ts`), hace falta que el usuario comparta la ruta actual del repo.

Patrones a nivel de código confirmados en sesiones previas, hosting-agnósticos (siguen siendo válidos independientemente de en qué nube corra cada plataforma):

- **`withTimeout()` + fallback silencioso:** toda consulta a Supabase desde `hub.ts` lleva timeout de 3-4s; si Supabase tarda, la UI se degrada en vez de colgarse. No existe en bachillerato.
- **`SyncQueue` offline:** `markActivityComplete` persiste intentos fallidos en `localStorage` y los reintenta solo — el progreso del alumno no se pierde por un corte de red momentáneo.
- **`MAX_IMPORT_ROWS = 200`** en alta masiva, vs. el tope de 5,000 filas de `alta-masiva.ts` en bachillerato — 25x más permisivo, y ahora más urgente de recortar sabiendo que el cómputo síncrono sí cuenta contra los 10ms de CPU del Worker (sección 1).

## 5. Optimizaciones de código (costo $0), por prioridad

1. **P0 — Caché real de OpenNext** (KV o R2 en vez de `dummy`) + `revalidate` en rutas de contenido no personalizado (UAC, progresiones, biblioteca, glosario). Mayor apalancamiento de toda la lista.
2. **P0 — `withTimeout()` + fallback** en cada consulta a Supabase, patrón de financiera, 3-4s.
3. **P0 — Rate limiting** en `entregar-actividad.ts` y `log-in` (ya documentado como OWASP-BACH-007 en la auditoría GOLD). Reglas WAF de Cloudflare o contador en KV.
4. **P0 — Bajar tope de `alta-masiva.ts`** de 5,000 filas — mover el parseo del CSV al navegador (ya usan `papaparse`), mandando al Worker solo lotes de ~100-200 filas ya validadas. No es solo prudencia: la espera de red no cuenta contra los 10ms de CPU, pero un parseo síncrono de 5,000 filas sí, y ese cómputo no se puede subir sin plan pago.
5. **P1 — Revisar el costo por-request de `getUser()`/`getProfile()`** en `supabase-helpers.ts`: el `cache()` de React solo dedupea dentro de un mismo render, así que cada visita nueva vuelve a llamar a Supabase Auth y a la tabla `profiles`. Válido dejarlo así para el piloto; si el volumen se acerca al techo de la sección 2, ahí sí vale considerar verificación local de JWT (pierde chequeo de revocación en tiempo real — evaluar el trade-off antes de aplicarlo).
6. **P1 — Monitoreo real** (Sentry u otro APM compatible con Cloudflare Workers) en vez de `console.error` suelto.
7. **P1 — Pre-comprimir imágenes** a AVIF/WebP en el pipeline de assets. `images: { unoptimized: true }` es correcto en Workers (no hay optimizador de `next/image` gratis ahí), pero eso significa que la compresión ya no es automática.

## 6. Qué recortar / mover sin perder funcionalidad

- **Recortar:** tope de alta masiva 5,000 → lotes de ~100-200 filas parseadas en cliente (arriba); verificar code-splitting por ruta de three.js/drei en cada lab 3D (que no vayan en un chunk compartido siempre descargado).
- **Mover, no eliminar:** assets 3D pesados de Supabase Storage → Cloudflare R2 (cero costo de egress); páginas 100% públicas (`/`, `/bachillerato`, `/privacidad`, `/terminos`) hacia el binding `assets` ya activo en `wrangler.toml` — quedan fuera del cupo de 100k req/día por completo.

## 7. Cómo responde la plataforma ante sobrecarga

| | Hoy | Objetivo |
|---|---|---|
| Corte de Cloudflare por exceder 100k req/día | Página de error genérica de Cloudflare | Página de mantenimiento propia, servida estática, sin depender de Supabase |
| Supabase saturado | Petición colgada sin timeout hasta que el navegador aborta | Timeout explícito (3-4s) + reintento automático con backoff |
| `error.tsx` global | "Algo salió mal" genérico (a veces con mensaje crudo de la excepción) + botón manual "Reintentar" | Mensaje diferenciado ("sistema muy solicitado, tu progreso no se pierde, reintenta") |
| Entrega de actividad fallida | Se pierde si la petición no completa | Cola `SyncQueue` en `localStorage`, reintenta sola en la siguiente sesión |

**Lo que no se pudo confirmar:** la documentación pública de Cloudflare no especifica con precisión qué le pasa a una app 100% SSR (vía OpenNext) exactamente en el request número 100,001 del día — si responde con error propio antes de invocar el Worker (fail-closed, lo más probable) o si hay algún margen de gracia. No asumir "fail-open"; tratar el 100,001 como caída dura hasta confirmar contra el dashboard real de la cuenta.

## 8. Ruta priorizada — sin plan pago

- **Fase 0 (1-2 días, $0):** `revalidate` en rutas públicas, `withTimeout()` + fallback en queries críticas, bajar tope de alta masiva y mover el parseo de CSV al navegador, rate limiting en login y entrega de actividad.
- **Fase 1 (esta semana, $0):** las palancas gratuitas de la sección 3 — caché KV/R2 real en OpenNext (reemplaza los tres `dummy`), mover páginas públicas al binding `assets`, assets 3D pesados a R2.
- **Fase 2 (antes del piloto, $0):** Sentry u otro monitoreo, página de mantenimiento propia, `SyncQueue` offline, Cron Trigger de "ping" semanal a Supabase (con el caveat de la sección 3 — no confirmado que cuente como actividad suficiente).
- **Fase 3 (post-piloto, si el uso real se acerca al techo de 100k req/día):** SSG real para el resto de páginas públicas, verificación local de JWT para `getUser()`/`getProfile()`. Único punto donde un plan pago entra en la conversación: Cloudflare Workers Paid ($5/mes) es la única palanca que mueve el techo de 100k req/día en sí — opcional, solo si las fases 0-2 ya no bastan, y no es parte de este plan por decisión explícita del usuario.

## Pendientes explícitos (no decisiones tomadas)

- No se aplicó ningún cambio de código de este plan todavía — se presenta para decisión antes de tocar el repo dado el volumen de superficie.
- No se contrató ningún plan pago — por decisión explícita del usuario, este plan asume $0 de gasto.
- Migración 18 (fix RLS de `profiles`) sigue sin aplicarse en la base de datos en vivo — pendiente independiente de este plan.
- No fue posible localizar la configuración Cloudflare actual de Educación Financiera para cruzar detalles específicos — pendiente de que el usuario comparta la ruta del repo si se quiere profundizar en la sección 4.
