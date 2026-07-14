# Auditoría GOLD — CEN Bachillerato (2026-07-13)

Auditoría senior solicitada por el usuario: seguridad, viabilidad de despliegue masivo, gestionabilidad operativa y revisión crítica constructiva, con el objetivo explícito de dejar la plataforma en **estado de venta GOLD**.

**Veredicto:** aún no es GOLD, pero está a dos correcciones puntuales de serlo. Los cimientos son sólidos (RLS bien diseñado en la gran mayoría de las tablas, CI/CD real, 244/244 tests verdes, cabeceras de seguridad completas). Hay 2 hallazgos **CRÍTICOS** con solución acotada y de bajo riesgo, y una lista clara de hallazgos ALTOS que hay que cerrar antes de un despliegue multi-escuela masivo.

Reporte visual completo (recomendado para lectura): https://claude.ai/code/artifact/cfb60de7-6750-47ff-a302-efb028dbf5b9

---

## CRÍTICOS (2)

### C1 — Fuga de PII entre escuelas en `profiles`
**Archivo:** `supabase/migrations/12_rls_docente_profiles_alumnos.sql:38-53`, política "teacher can read profiles of own students".

La rama `get_my_role() IN ('admin','super_admin')` no verifica `escuela_id`. Como Postgres evalúa con OR todas las políticas PERMISSIVE de una tabla, esta rama por sí sola da a **cualquier admin de cualquier escuela** SELECT sin restricción sobre toda `profiles` (nombre, correo, rol, semestre, escuela) de **todos los estudiantes y personal de todas las escuelas**, incluyendo menores. Explotable con el anon key + JWT de cualquier admin, sin service_role ni código de la app. Mismo patrón que el bug ya corregido en `intentos` (migración 13/14), pero en `profiles` nunca se corrigió — ninguna migración posterior la toca.

**Fix:** nueva migración reemplazando la política con el patrón ya usado en `grupos` (migración 15): admin scoped por `escuela_id = get_my_escuela_id()`, con rama explícita para `super_admin`.

### C2 — El cambio de contraseña obligatorio no se ejecuta
**Archivos:** `src/app/log-in/page.tsx`, layouts de `hub`/`dashboard/docente`/`admin`, `src/app/cambiar-password/page.tsx`.

Al eliminarse `src/proxy.ts` (incompatibilidad de runtime Node.js con OpenNext Cloudflare) se perdió la única lógica que redirigía usuarios con `must_change_password=true` a `/cambiar-password`. Nunca se reconstruyó. Toda cuenta de alta-masiva conserva su contraseña temporal indefinidamente.

**Fix:** verificar `user.user_metadata.must_change_password` dentro del guard server-side que los tres layouts de rol ya ejecutan por request (mismo punto donde comprueban rol), sin reintroducir middleware/edge.

---

## ALTOS (5)

1. **Migraciones 13-17 sin confirmación de aplicación en producción** — flujo 100% manual de copiar/pegar en el SQL Editor, sin registro ni checklist. Verificar contra `pg_policies` antes de dar por cerrado cualquier fix.
2. **Sin caché — cada página golpea Supabase en vivo** — `open-next.config.ts` tiene `incrementalCache/tagCache/queue: "dummy"`; cero directivas `revalidate` en 30 rutas. Combinado con el plan Free de Cloudflare (~100k peticiones/día, CPU ajustada), no aguanta uso masivo. Subir a Workers Paid + KV real antes de escalar.
3. **Sin rate limiting** en `entregar-actividad.ts` ni `alta-masiva.ts` (ya documentado como OWASP-BACH-007, sigue pendiente). Fix de cero código: 2 reglas WAF en Cloudflare.
4. **Acciones de administración no implementadas** — crear escuela/admin/grupo, reset de contraseña son botones sin función; el workaround documentado en `ADMIN-FLOW.md §7` es SQL manual. Bus-factor de 1 persona. Construir las 4 Server Actions ya especificadas ahí.
5. **README.md es el boilerplate de create-next-app** — la documentación interna buena (`GUIA-DESARROLLO.md`, `ARQUITECTURA.md`, `ADMIN-FLOW.md`) es invisible desde la puerta de entrada.

## MEDIOS (7)

1. Sentry documentado como integrado pero nunca instalado (0 referencias reales en `src/`).
2. CI/CD despliega a producción en cada push a `main` sin staging ni revisor obligatorio.
3. Documentación con contradicciones activas (`DEUDA-TECNICA.md` afirma "sin CSP"/"123 tests", ambos falsos hoy; `HANDOFF.md` afirma que no es repo git). Solo `AUDITORIA-RECONCILIADA-2026-06-09.md` es confiable.
4. Sin política de backup/PITR documentada para Supabase.
5. 254 scripts con acceso service_role sin índice que distinga reutilizables de uso-único.
6. `npm audit`: dompurify (fix directo disponible) + postcss transitivo vía next (bloqueado, requiere --force que degradaría next).
7. Sin autoservicio de "olvidé mi contraseña" — mismo bus-factor que el hallazgo ALTO #4.

## BAJOS (6)

Colisión de nombre de migración "13" (`13_logros.sql` / `13_rls_docente_intentos.sql`) · `13_logros.sql` sin `WITH CHECK` explícito · advertencia de Jest por colisión de `package.json` · contraseña de demo hardcodeada en `scripts/create-demo-users.ts` · contradicción Turbopack/webpack entre `ARQUITECTURA.md` y `MANIFIESTO-ARQUITECTURAL.md` · `.vercel/project.json` residual inerte.

---

## Ya resuelto — verificado esta sesión (no reabrir)

- Service_role key filtrada (commit `77a3d80`): rotada, purgada del historial, cargada como Cloudflare secret en producción (verificado con `wrangler secret list`).
- Fuga entre escuelas en `intentos`: corregida en migración 14.
- Bloqueo de `super_admin` en `grupos`: corregido en migración 15.
- Cabeceras de seguridad + CSP completas.
- 7 usos de `getSupabaseAdmin()` revisados: todos escopados correctamente.
- Aislamiento de three.js/labs 3D centralizado en `registry.tsx`.
- Suite de tests: 244/244 verdes, 15 suites.
- CI/CD real (lint → typecheck → test → build → verificación de bundle).
- Bundle del Worker: 2.14 MiB gzip / 3 MiB (plan Free) = 69% usado.
- Bandera `must_change_password` se asigna bien en alta masiva (solo falta la redirección, ver C2).

---

## Ruta a GOLD

- **Fase 0 (horas):** C1 + C2.
- **Fase 1 (días):** verificar migraciones aplicadas, Workers Paid + caché, rate limiting WAF, 4 Server Actions de admin.
- **Fase 2 (1-2 semanas):** README, Sentry real, staging + branch protection, `scripts/README.md`, política de backup, self-service password reset.
- **Fase 3 (baja urgencia):** ítems BAJOS.

## Pendiente, fuera del alcance de esta auditoría

El cambio en `ProductosSection.tsx` (enlaces `<a>` planos hacia preescolar/primaria/secundaria) sigue en stage local sin desplegar, a la espera de confirmación. Falta confirmar si `ceneducacion.com.mx/preescolar` y rutas hermanas resuelven correctamente en producción.
