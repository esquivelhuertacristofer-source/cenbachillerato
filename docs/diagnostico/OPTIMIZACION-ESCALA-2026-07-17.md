# Optimización a Escala (costo cero) — CEN Bachillerato

**Fecha:** 2026-07-17
**Sigue a:** `AUDITORIA-GOLD-2026-07-13.md` y `PLAN-ESCALABILIDAD-2026-07-13.md`
**Contexto:** el plan de escalabilidad del 13 de julio identificó el cuello de botella real para un piloto de miles de alumnos corriendo en las suscripciones **gratuitas** de Cloudflare Workers y Supabase: no es cómputo, es que cada visita golpeaba Supabase en vivo (sin caché, sin límites en las consultas) y que Realtime y el rate limiting basado en KV no sostienen ese volumen. Este documento resume las mitigaciones de código que se aplicaron sobre esa lista de palancas de "Fase 0/Fase 1", y qué queda pendiente de aplicar a mano.

**Importante — qué NO afirma este documento:** estas son mitigaciones que mueven los techos del plan Free hacia arriba, no una garantía de que la plataforma soporte cualquier volumen. Los umbrales de la sección 3 siguen existiendo; solo se alcanzan más tarde. Confirmar contra uso real (dashboards de Cloudflare y Supabase, y `scripts/monitoreo-supabase.sql`) en cuanto arranque el piloto, no dar los números de este documento por definitivos.

---

## 1. Qué se cambió y por qué

| Cambio | Archivo(s) | Por qué |
|---|---|---|
| **Realtime → sondeo cada 60 s** en el dashboard docente | `src/components/dashboard/LatestDeliveries.tsx` | El widget "Últimas Entregas" se suscribía vía `postgres_changes` a **todos** los INSERT de `public.intentos`, sin filtro. Con 15-20k alumnos activos, cada entrega de cualquier escuela del país disparaba un mensaje Realtime por cada dashboard docente abierto — a esa escala se revienta el cupo de 2M mensajes/mes del plan Free en horas, no en un mes. Un sondeo fijo de 60 s (pausado cuando la pestaña está oculta, refresco inmediato al volver a foco) da una sensación equivalente de "casi en vivo" para una lista de últimas entregas, con costo constante y predecible por pestaña abierta. |
| **`/hub/progreso` acotado** a consultas con límite explícito | `src/lib/queries/progreso.ts` | El resumen de progreso del alumno bajaba el **historial completo** de intentos (join `intentos→actividades→progresiones→uac`, sin `.limit()`) solo para derivar 4 agregados en memoria. Con 15-20k alumnos eso son decenas de GB/mes de egress contra un cupo de 5 GB del plan Free. Ahora son 3 consultas en paralelo, cada una acotada a lo que realmente pinta la pantalla: **15** intentos recientes (lista), **30 días** de calendario (heatmap), y los agregados totales calculados **en Postgres** vía la RPC `resumen_stats_alumno()` (~200 bytes de respuesta en vez del historial entero). |
| **Rate limiting migrado al binding nativo de Cloudflare** | `wrangler.toml` (`LOGIN_RATE_LIMITER`, `ENTREGA_RATE_LIMITER`) | El limiter respaldado en Workers KV está limitado a **1,000 escrituras/día por cuenta** en el plan Free — a escala se agota a media mañana y, si el código no lo contempla, falla abierto en silencio (deja de limitar sin avisar). El binding nativo de Rate Limiting de Cloudflare Workers (GA desde 2025-09-19) no consume ese cupo de KV; los límites reales (login: 10/60s, entrega de actividad: 30/60s) viven en `wrangler.toml`, no en el código de la app. |
| **Respuestas de texto largo (>2 KB) a R2** | `src/lib/actions/entregar-actividad.ts`, `src/lib/r2-respuestas.ts` | El jsonb `intentos.respuestas` es el único campo de tamaño variable que persiste el alumno: quizzes/ejercicios son objetos chicos, pero una reflexión escrita es texto libre sin tope real en el cliente. Con 15-20k alumnos ese campo es el que más infla la tabla frente al techo de 500 MB (Free) / 8 GB (Pro) de Supabase. Respuestas serializadas por encima de 2 KB se suben a R2 (10 GB gratis, cero egress) y en Postgres solo queda un marcador liviano (`{"__r2": 1}`); si la subida a R2 falla por cualquier razón (binding ausente, error transitorio), se guarda el jsonb completo como antes — la entrega del alumno **nunca** se pierde por un problema de R2. |
| **`SyncQueue` con cola por usuario** (no global) | `src/lib/sync-queue.ts` | La cola de reintentos vivía bajo una clave global de `localStorage`. En las PCs compartidas de escuela eso producía un bug de atribución grave: una entrega encolada del alumno A podía insertarse bajo la sesión del alumno B que iniciara sesión después en la misma máquina (el flush automático corre con la sesión activa en ese instante). Ahora cada usuario tiene su propia clave (`cen.syncQueue.entregas.<userId>`); la clave global antigua se migra a una cuarentena que **nunca** se flushea automáticamente (una entrega perdida se puede rehacer; una calificación atribuida al alumno equivocado corrompe datos académicos de dos personas). |
| **Sin descarte silencioso** en `SyncQueue` | `src/lib/sync-queue.ts` | Antes, una entrada que agotaba sus reintentos se borraba de la cola — si la caída de Supabase duraba más que la ventana de reintentos, la entrega del alumno se perdía sin que nadie se enterara. Ahora una entrada agotada se marca `varada` (deja de martillar el servidor cada 30 s) pero **se conserva**, y se reintenta al volver la conexión (evento `online`) o al recargar la página — momentos en los que las condiciones sí cambiaron. |
| **Entrega en lote** | `src/lib/actions/entregar-actividades-batch.ts` | Cuando `SyncQueue` acumula varias entregas offline, reenviarlas una por una gastaba una unidad del límite de 30/60s por cada item. La variante en lote resuelve autenticación y rate limit **una sola vez** para todo el lote (tope de 20 entregas por request) y reutiliza el mismo núcleo de validación (`procesarEntregaValidada`) que la entrega individual, así que el volcado a R2 y el manejo de reintentos duplicados (23505 → éxito idempotente) se comportan idéntico item por item. |
| **`hub-browser.ts` consolidado** de ~24-28 queries a ≤3 por carga | `src/lib/queries/hub-browser.ts` | Las tarjetas de UAC, el héroe y los tiles de recursos del hub se armaban con una cascada de ~4 queries por cada UAC del semestre (6-7 UAC ⇒ ~24-28 queries por carga de página). Ahora un núcleo consolidado trae los datos del semestre completo en 3 queries en paralelo, sin importar cuántas UAC tenga. |
| **Proxy con verificación local de expiración del JWT** | `src/proxy.ts` | Antes, cada verificación de sesión implicaba una llamada de refresh a Supabase Auth. Ahora el Proxy decodifica el JWT localmente para comprobar su expiración (`exp`) y solo dispara un refresh remoto contra Supabase cuando el token efectivamente ya expiró, no en cada request. Esto reduce llamadas a Supabase Auth que antes contaban contra el cupo de egress compartido sin necesidad — el trade-off (pierde el chequeo de revocación en tiempo real entre un login y el siguiente refresh) ya estaba anotado como aceptable para el piloto en `PLAN-ESCALABILIDAD-2026-07-13.md`, sección 5. |

---

## 2. Pasos manuales del usuario — EN ORDEN

Ninguno de estos pasos se ejecutó automáticamente. Aplicarlos en este orden antes de considerar el piloto operativo:

1. **Aplicar la migración 22** (`supabase/migrations/22_retirar_logros.sql`) — pegar en el SQL Editor de Supabase. Retira `logros_alumno` y `logros`: el producto recortó la gamificación a solo la racha, y estas tablas ya no las usa ningún código vigente.
2. **Aplicar la migración 23** (`supabase/migrations/23_rpc_resumen_stats_alumno.sql`) — pegar en el SQL Editor de Supabase. Crea la RPC `resumen_stats_alumno()` que usa `/hub/progreso` (ver sección 1). **El código ya funciona sin ella** — `progreso.ts` tiene un fallback en memoria (`statsLegacyEnMemoria`) que reproduce el cálculo antiguo si la RPC todavía no existe — pero mientras no se aplique, `/hub/progreso` sigue pagando el costo de egress completo que esta migración existe para eliminar. Verificar tras aplicarla: si el Worker sigue registrando el warning `[progreso] La RPC resumen_stats_alumno no existe aún`, recargar el schema cache de PostgREST con `NOTIFY pgrst, 'reload schema';`.
3. **Crear el bucket R2 `cen-respuestas`** en el dashboard de Cloudflare (R2 → Create bucket) y confirmar que `wrangler.toml` tiene el binding `RESPUESTAS_BUCKET` apuntando a ese bucket antes del siguiente deploy. Sin el bucket (o sin el binding), `putRespuestas()` no lanza error — cae a guardar el jsonb completo en Postgres como antes (fail-safe intencional, ver `src/lib/r2-respuestas.ts`), así que nada se rompe, pero tampoco se obtiene el ahorro de espacio hasta que el bucket exista.
4. **Deploy** — `npm run pages:build && npm run pages:deploy` (o dejar que el pipeline de `.github/workflows/ci.yml` lo haga en el próximo push a `main`, una vez confirmados los pasos 1-3).
5. **Configurar el secret `SUPABASE_DB_URL`** en GitHub (Settings del repo → Secrets and variables → Actions) para que `.github/workflows/backup-supabase.yml` pueda correr. Ver las instrucciones detalladas en el comentario al inicio de ese archivo. Sin este secret, Supabase Free sigue sin ningún respaldo automático — este paso no es opcional antes de dar de alta escuelas reales.
6. **Opcional: dominio propio (~$10 USD/año)** — hoy el Worker sirve desde `*.workers.dev`. Un dominio custom no cambia ningún techo del plan Free por sí solo, pero es **prerrequisito** para poder usar la Cache API de Cloudflare en el futuro (la Cache API no cachea consistentemente sobre subdominios `*.workers.dev` compartidos). No es urgente para el piloto; sí conviene planearlo si se decide implementar la palanca de Cache API descrita en `PLAN-ESCALABILIDAD-2026-07-13.md`, sección 3.

---

## 3. Umbrales de escalamiento — cuándo sí pagar

Estas mitigaciones mueven los techos hacia arriba; no los eliminan. Los siguientes números siguen siendo el punto en el que un plan gratuito deja de alcanzar:

| Recurso | Umbral | Acción | Costo |
|---|---|---|---|
| Base de datos de Supabase | ≥ 350 MB (70% de los 500 MB del plan Free) | Contratar Supabase Pro (sube a 8 GB + backups automáticos/PITR reales) | **$25 USD/mes** |
| Cloudflare Workers — requests | ≥ 80,000 requests/día (80% del techo duro de 100,000/día) | Contratar Workers Paid (sube a 10M requests/mes) | **$5 USD/mes** |
| Egress de Supabase (bandwidth) | ≥ 4 GB/mes del cupo de 5 GB uncached + 5 GB cached | Vigilar el dashboard de Supabase (Project Settings → Usage); no hay una consulta SQL para este dato — ver nota al final de `scripts/monitoreo-supabase.sql` | Depende — mismo umbral que empuja hacia Supabase Pro si se sostiene |

**Piso realista de gasto anual una vez que ambos umbrales se cruzan** (proyección de planeación en un rango de 15,000-20,000 alumnos activos, no telemetría en vivo):

```
Supabase Pro:     $25 USD/mes × 12 = $300 USD/año
Workers Paid:      $5 USD/mes × 12 =  $60 USD/año
                                     ─────────────
                                      $360 USD/año
Dominio propio (opcional, paso 6):   + $10 USD/año
                                     ─────────────
                                      $370 USD/año
```

Este piso de **~$360-370 USD/año** es el costo mínimo realista de operar a ese volumen — no un techo: egress adicional, almacenamiento de Supabase por encima de los 8 GB de Pro, o R2/KV por encima de sus propios cupos gratuitos sumarían aparte. Confirmar contra uso real antes de presupuestar, tal como ya advertía `PLAN-ESCALABILIDAD-2026-07-13.md`.

---

## Pendientes explícitos (no decisiones tomadas)

- Los 6 pasos de la sección 2 siguen sin ejecutarse — este documento los describe, no los aplicó.
- No se contrató ningún plan pago. La sección 3 son umbrales de decisión, no un plan de gasto aprobado.
- Migración 18 (fix RLS de `profiles`, hallazgo CRÍTICO C1 de la auditoría GOLD) sigue pendiente de confirmación de aplicación en producción — independiente de esta campaña, no reabrir aquí, verificar contra `AUDITORIA-GOLD-2026-07-13.md`.
- Los umbrales de la sección 3 son cifras publicadas por Cloudflare/Supabase para sus planes Free/Pro, no telemetría en vivo de este proyecto — confirmar uso real contra ambos dashboards en cuanto arranque el piloto.
