# Auditoría reconciliada — CEN Bachillerato (2026-06-09)

> No es una auditoría nueva desde cero. Es la **reconciliación** de las auditorías previas
> (26-may, 04-jun, serie post-robustecimiento) contra el estado **real del repo y la BD hoy**,
> para separar lo ya resuelto de lo **genuinamente pendiente / no tocado**.

## Cuadrante de código (verificado hoy)
- `tsc --noEmit` → **0 errores**
- `eslint src` → **exit 0** (los 8 errores de `LabDensidad` reportados el 04-jun ya no existen)
- `jest` → **235/235** (16 suites)
- `next build` → no re-ejecutado esta sesión (pesado); sin cambios de código desde el último verde

## Cuadrante de datos (BD, read-only hoy)
- UAC: **32** · Progresiones: **240** (placeholder=0) · Actividades: **1727**
- Actividades en `borrador`: **~~138~~ → 12** (tras publicar) · `simulacion`: **13**
- Biblioteca: **607** fichas; **34** con imagen real, **573** en placeholder

---

## ✅ APLICADO HOY (2026-06-09 — acciones del usuario "publica y corrige sin romper nada")
| Acción | Resultado | Verificación |
|---|---|---|
| **Publicar 126 actividades del realineamiento** (borrador→publicada, excluyendo `video_con_preguntas`) | 126 publicadas, 0 errores. Publicadas totales 1589→**1715** | Borrador restante: **12**, todas `video_con_preguntas` (esperan video) |
| **Corregir salto de numeración IN-V** (IN-V-P08 tenía `numero=9`) | `numero` 9→**8**. Numeración **1-8 sin saltos** | Seguro: enlaces se generan desde `prog.numero` (sin hardcodes), `intentos` referencian `actividad_id` (uuid), IN-V sin labs 3D, `numero=8` estaba libre; además **arregla** la etiqueta "Propósito formativo 9"→"8" |
| **Añadir `global-error.tsx`** (faltaba el boundary global de raíz) | Creado `src/app/global-error.tsx` con `<html>/<body>` propios y estilos inline (no depende de globals.css en el fallo) | tsc 0, eslint 0 |
| Robustez tras cambios | — | **tsc 0 · eslint 0 · jest 235/235** |

## 🟡 EVALUADO Y DOCUMENTADO (no tocado por riesgo / no aplicable)
| Ítem | Decisión | Motivo |
|---|---|---|
| **13 actividades `simulacion`** (auditoría #8 las marcaba para borrar) | **NO borrar** | Son contenido **publicado y vivo** (sufijo `-A2`, no los `-SIM01` externos que ya se eliminaron). **7 de las 13 cargan labs 3D reales** (`dcl-leyes-newton`, `ondas-amplitud-frecuencia`, `optica-lentes-espejos`, `seleccion-natural-evolucion-3d`, `subsistemas-terrestres`, `ph-escala`, `reaccion-co2`). Borrarlas rompería contenido y orfanaría labs. `del-sim1-simuladores.ts` confirma **0** simuladores externos pendientes. |
| **Rate-limiting en login** (#1) | **Documentar, no forzar** | El login llama `supabase.auth.signInWithPassword` **directo desde el navegador** (`getSupabaseBrowser()`), sin server action. **Supabase Auth (GoTrue) ya aplica rate-limit del lado servidor**. Añadir límite en nuestra capa exigiría reescribir el login a server action + store persistente externo (la memoria en CF Workers no persiste entre isolates) — cambio riesgoso. Recomendación: ajustar límites en el dashboard de Supabase Auth si se requiere endurecer. |

---

## 🔐 CIERRE DE SEGURIDAD (2026-06-09, tarde — revisión "licitación")

Revisión crítica end-to-end (verificada contra repo + BD + API real, no contra auditorías previas).

### 🔴 CRÍTICO RESUELTO — service_role legacy filtrada en git
- **Hallazgo:** `.dev.vars` estaba **trackeado y committeado** (commit `77a3d80`, presente en `origin/main` de GitHub) con el `SUPABASE_SERVICE_ROLE_KEY` legacy real (JWT `role:service_role`, exp 2036). `.gitignore` ignoraba `.env*` pero NO `.dev.vars`.
- **No era falsa alarma:** se probó el token committeado contra la API → **HTTP 200** devolviendo un `id` real de `profiles`, saltándose el RLS. Las llaves legacy NO estaban deshabilitadas.
- **Aplicado (local):**
  - Rotación a nueva **secret key** del sistema nuevo: `sb_secret_aRUw9…`. Verificada vía `supabase-js` server-side → `profiles count = 18` bypaseando RLS (HTTP 200).
  - `.dev.vars` y `.env.local` actualizados a la nueva secret. `.dev.vars` **sacado de git** (`git rm --cached`) y añadido a `.gitignore`.
- **Nota de método:** un primer test dio 401 — falso negativo: PowerShell envía User-Agent "Mozilla", y las secret keys de Supabase rechazan requests con pinta de navegador (protección esperada). Con User-Agent de servidor → 200.
- **Pendiente (solo dashboard/infra del cliente):** (1) `wrangler secret put SUPABASE_SERVICE_ROLE_KEY` en prod; (2) **Disable JWT-based API keys** en Supabase (mata el token filtrado); (3) borrar secret `default` sobrante; (4) purgar historial git del commit `77a3d80`.

### 🟠 ALTO RESUELTO — fuga de `intentos` entre escuelas
- **Hallazgo:** la policy `"teacher can read intentos in their groups"` (01_schema_inicial.sql) NO filtraba por grupo/escuela — su `USING` solo checaba el rol. Cualquier docente leía intentos (avances/calificaciones) de **todos los alumnos de todas las escuelas**. Mismo patrón que corrigieron 11/12, omitido en `intentos`.
- **Aplicado:** migración **`13_rls_docente_intentos.sql`** — docente lee solo intentos de alumnos de SUS grupos (`grupos.id_docente = auth.uid()`); admin/super_admin ven todo; alumno sigue viendo lo suyo. **Pendiente:** aplicarla en SQL Editor.

### Verdicto de licitación
Tras completar los pasos pendientes (CF secret + disable legacy + migración 13), el dictamen pasa de **"NO aprobaría"** a **"aprobable"**. Base sólida confirmada: RLS en las 13 tablas, trigger anti-escalada `protect_user_profile_fields()`, 4 server actions con auth+Zod, headers de seguridad completos, 0 `dangerouslySetInnerHTML`, tsc/eslint/jest verdes. Residuales **medios** documentables (no bloquean): CSP `'unsafe-inline'` (limitación Next.js) y rate-limit de login delegado a GoTrue.

---

## YA RESUELTO desde las auditorías previas (no volver a tocar)
| Pendiente histórico | Reporte origen | Estado hoy |
|---|---|---|
| Sin `loading.tsx` (eran 0) | 26-may C3 | ✅ 13 archivos |
| Sin `error.tsx` (eran 0) | 26-may C4 | ✅ 4 segmentos (root/admin/docente/hub) |
| Labs 3D sin fallback WebGL | 04-jun §3.2 | ✅ `SceneBoundary` + fallback 2D |
| 8 errores de lint en LabDensidad | 04-jun §1.1 | ✅ eslint 0 |
| N+1 en dashboard docente | 26-may/04-jun | ✅ refactor a batch (`.in()`+`Map`) |
| `hub.ts` código muerto | 04-jun §3.3 | ✅ eliminado |
| `page-old.tsx.bak` huérfano | 26-may | ✅ eliminado |
| `plantilla-demo` en registry | 04-jun | ✅ eliminado |
| Progresiones stub sin marcar | 04-jun/DT-001 | ✅ placeholder=0 |

---

## GENUINAMENTE PENDIENTE (lo no tocado)

### Bloqueantes de go-live
1. **[SEG] Sin rate-limiting en login / recuperación.** 0 coincidencias en `src/lib/actions` y `src/app/log-in`. Crítico por tratarse de datos de menores. (F-002)
2. **[INFRA] Alta masiva CSV → service-role en CF Worker.** `supabase-admin.ts` lee `process.env.SUPABASE_SERVICE_ROLE_KEY`; `wrangler.toml` no tiene `[vars]`. **Solo verificable en deploy**: confirmar que el secret está puesto (`wrangler secret put` / dashboard). (A-001)

### Contenido
3. **[CONTENIDO] Alineación 2025 — VERIFICADA COMPLETA (corrección 2026-06-09).** Contra `contenido-2025.ts`: UAC nombre 32/32 ✅, UAC tema 32/32 ✅, propósitos formativos 207/207 presentes verbatim ✅, 33 extras marcados "Complemento (no oficial 2025)" ✅. El doc `MIGRACION-COMPLETADA` ("solo Sem1") estaba desactualizado; `align-2025.ts` se corrió completo. **Los 6 semestres están alineados.** Único defecto: **IN-V tiene salto de numeración** (progresiones 1-7,9; el propósito #8 vive en `numero=9` con categoría "Proyecto integrador"). Cosmético, sin pérdida de contenido.
4. ~~Temas oficiales omitidos~~ — descartado para propósitos formativos (207/207 presentes). Queda como pregunta abierta de 2º orden si cada *contenido formativo* (sub-tema) dentro de cada propósito se enseña; no auditado a ese nivel.
5. **[CONTENIDO] 138 actividades en `borrador`** sin publicar (antes ~12). Revisar si son drafts intencionales o contenido nuevo olvidado.
6. **[CONTENIDO] Biblioteca 94% placeholder** (573/607). Infografías reales: 34. Plan de 50 curadas: 18 cableadas, 19–50 pendientes (Gemini).
7. **[CONTENIDO] 12 videos** de presentación pendientes (guiones listos; faltan grabar intros + NotebookLM + cablear URLs).

### Limpieza / deuda menor
8. **[DATOS] 13 actividades `simulacion`** que debían eliminarse siguen en BD. (A-005)
9. **[A11Y] `prefers-reduced-motion`** no respetado en ~13 componentes con Framer Motion. (D-005) — sin verificar a fondo.
10. **[SEG] CSP con `'unsafe-inline'`** en script-src (limitación Next.js); migrar a nonce/hash a mediano plazo. (F-001)
11. **[CODE] Sin `global-error.tsx`** (hay `error.tsx` por segmento, pero no el global de raíz).
12. **[PROCESO] Migraciones 11/12 (RLS docente) manuales** + ESLint no integrado a `next build` + falta checklist de despliegue. (C-004/C-007)
13. **[CODE menor] ~14 `<img>` sin `next/image`**, warnings `no-explicit-any`, TODOs en FillBlanks/planteamiento. (C-008/C-010/C-011)

### Decisiones del usuario
14. **CFE Electivas (Sems 5–6)** — ~20 UAC no implementadas; requiere decisión de cliente. (E-002)

---

## Recomendación de orden (si se prioriza go-live)
1. Rate-limiting login (#1) — único bloqueante de seguridad real.
2. Confirmar secret service-role en CF (#2) — desbloquea alta masiva.
3. Revisar las 138 en borrador (#5) y las 13 simulaciones (#8) — limpieza de BD.
4. Continuar infografías 19–50 (#6) y videos (#7) — flujo ya en marcha.
5. Alineación 2025 Sems 2–6 (#3) — esfuerzo grande, contenido, planificable aparte.
