# Auditoría OWASP — CEN Bachillerato
**Fecha:** 2026-05-19  
**Auditor:** Claude Sonnet 4.6 (automatizado + revisión manual)  
**Stack:** Next.js 16.2.6 · React 19 · Supabase SSR PKCE · @opennextjs/cloudflare · Tailwind v4  
**Score pre-fixes:** 5.0 / 10  
**Score post-fixes (estimado):** 7.5 / 10  

---

## Resumen ejecutivo

| Severidad | Total | Resolubles en código | Pendiente usuario |
|-----------|-------|----------------------|-------------------|
| CRITICAL  | 0     | 0                    | 0                 |
| HIGH      | 5     | 4                    | 1                 |
| MEDIUM    | 4     | 2                    | 2                 |
| LOW       | 2     | 2                    | 0                 |
| INFO      | 2     | 0                    | 2                 |
| **Total** | **13**| **8**                | **5**             |

Comparativa CEN:
- **Financiera:** 7.5/10 post-auditoría (20/23 hallazgos cerrados)
- **Labs:** 5.5/10 pre-auditoría (no tiene fixes)
- **Bachillerato:** 5.0/10 pre-auditoría → 7.5/10 post-fixes de esta sesión

---

## OWASP-BACH-001
**Categoría:** A01 — Broken Access Control  
**Severidad:** HIGH  
**Estado:** ✅ RESUELTO EN CÓDIGO  

**Descripción:**  
`dashboard/docente/layout.tsx` no tiene ningún guard de autenticación. Las sub-páginas `/dashboard/docente/alumnos`, `/dashboard/docente/metricas` y `/dashboard/docente/reportes` son accesibles por cualquier usuario no autenticado.

**Evidencia:**  
`src/app/dashboard/docente/layout.tsx` — líneas 1-10: función sync sin `getUser()` ni `getProfile()`.

Contraste con `src/app/admin/layout.tsx` líneas 10-17: sí tiene guard completo con redirección por rol.

Contraste con `src/app/hub/layout.tsx` líneas 7-15: también tiene guard completo.

**Impacto:**  
Usuario no autenticado puede acceder a `/dashboard/docente/alumnos` sin sesión. Actualmente son placeholders "Próximamente", pero cuando se implemente funcionalidad real contendrán datos de alumnos (nombres, progresos, grupos).

**Solución:**  
Convertir `DocenteLayout` a `async`, agregar `getUser()` + `getProfile()` + redireccionamiento por rol. Mismo patrón que `admin/layout.tsx`.

**Tiempo estimado:** 15 min  

---

## OWASP-BACH-002
**Categoría:** A03 — Injection / Information Disclosure  
**Severidad:** HIGH  
**Estado:** ✅ RESUELTO EN CÓDIGO  

**Descripción:**  
La Server Action `entregarActividad` retorna `error.message` directamente al cliente cuando falla el insert en la tabla `intentos`.

**Evidencia:**  
`src/lib/actions/entregar-actividad.ts` línea 32:
```typescript
return { error: error.message };
```

Supabase puede retornar mensajes como `duplicate key value violates unique constraint "intentos_pkey"` o `insert or update on table "intentos" violates foreign key constraint`. Estos revelan nombres de tablas, restricciones y estructura del schema.

**Impacto:**  
Schema disclosure a cualquier alumno que inspeccione la respuesta de red. Vector de reconocimiento para ataques dirigidos.

**Solución:**  
Retornar mensaje genérico: `return { error: "No se pudo registrar la actividad. Intenta de nuevo." }`  
Mantener `console.error` para diagnóstico interno (ya cubierto por OWASP-BACH-006).

**Tiempo estimado:** 5 min  

---

## OWASP-BACH-003
**Categoría:** A05 — Security Misconfiguration (CSP)  
**Severidad:** HIGH  
**Estado:** ✅ RESUELTO EN CÓDIGO  

**Descripción:**  
El Content Security Policy en `next.config.ts` incluye `'unsafe-eval'` en `script-src`. Esto permite ejecutar `eval()`, `new Function()` y `setTimeout("string")` — los principales vectores de inyección de código arbitrario post-XSS.

**Evidencia:**  
`next.config.ts` línea 16:
```typescript
"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
```

Adicionalmente, `'unsafe-inline'` en `script-src` permite inyección de scripts inline. Ambas directivas anulan gran parte del valor protector del CSP.

**Impacto:**  
Si un atacante logra inyectar contenido en la página (via XSS), el CSP no lo detiene. En plataforma con contenido JSONB de autores externos (fichas de biblioteca, actividades), el riesgo es no despreciable.

**Solución:**  
Remover `'unsafe-eval'`. Si el React Compiler o Next.js 16 lo requiere para hydration, migrar a nonce-based CSP o `script-src-elem`. Verificar que el build pasa sin la directiva.

`'unsafe-inline'` en script-src es más compleja de eliminar (requiere nonce en todos los scripts inline de Next.js) — mantener por ahora pero registrar como deuda.

**Tiempo estimado:** 20 min (incluye test de build)  

---

## OWASP-BACH-004
**Categoría:** A05 — Security Misconfiguration (HSTS)  
**Severidad:** HIGH  
**Estado:** ✅ RESUELTO EN CÓDIGO  

**Descripción:**  
Los security headers definidos en `next.config.ts` no incluyen `Strict-Transport-Security` (HSTS). Sin HSTS, un cliente que visita el sitio por HTTP puede ser redirigido a HTTPS, pero durante esa primera conexión es vulnerable a un ataque de downgrade o MITM.

**Evidencia:**  
`next.config.ts` líneas 3-29: el array `securityHeaders` tiene X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy y CSP, pero no HSTS.

**Impacto:**  
Ataques SSL stripping en redes no confiables (WiFi escolar, móviles sin HTTPS forzado). Relevante porque el público objetivo son estudiantes de bachillerato en entornos con conectividad variable.

**Solución:**  
Agregar:
```typescript
{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
```

Cloudflare Workers también puede añadir HSTS, pero es mejor tenerlo en ambos niveles.

**Tiempo estimado:** 5 min  

---

## OWASP-BACH-005
**Categoría:** A09 — Security Logging and Monitoring  
**Severidad:** HIGH  
**Estado:** ⏳ PENDIENTE USUARIO  

**Descripción:**  
`@sentry/nextjs@^10.53.1` está instalado en `package.json` pero no está configurado: no existen `sentry.server.config.ts`, `sentry.client.config.ts`, `sentry.edge.config.ts` ni `instrumentation.ts`. El `NEXT_PUBLIC_SENTRY_DSN` está vacío en `.env.example`.

**Evidencia:**  
`package.json`: `"@sentry/nextjs": "^10.53.1"` — presente  
`ls sentry.*.ts` — ningún archivo  
`.env.example` línea 6: `NEXT_PUBLIC_SENTRY_DSN=` — vacío  

**Impacto:**  
Plataforma con 12 cuentas demo activas, 375 actividades y respuestas de alumnos en DB opera sin monitoreo de errores. Fallos silenciosos en producción. Un error en `entregarActividad` no llegaría a ningún dashboard de observabilidad.

**Solución (PENDIENTE USUARIO):**  
1. Crear proyecto en Sentry (sentry.io), obtener DSN.
2. Agregar a Cloudflare Workers env secrets: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`.
3. Crear `sentry.server.config.ts`, `sentry.client.config.ts`, `instrumentation.ts` según docs de `@sentry/nextjs`.
4. Agregar `withSentryConfig` en `next.config.ts`.

**Tiempo estimado:** 45 min (usuario)  

---

## OWASP-BACH-006
**Categoría:** A09 — Security Logging  
**Severidad:** MEDIUM  
**Estado:** ✅ RESUELTO EN CÓDIGO  

**Descripción:**  
Los logs de error incluyen objetos completos de error (que pueden contener detalles de Supabase/PostgreSQL) y el `userId` del alumno en el mismo mensaje.

**Evidencia:**  
`src/lib/actions/entregar-actividad.ts` línea 31:
```typescript
console.error("[entregarActividad] Error inserting intento:", error, { actividadId, userId: user.id });
```

`src/lib/supabase-helpers.ts` líneas 45, 58, 76:
```typescript
console.error("[supabase-helpers] getSession error:", error);
console.error("[supabase-helpers] getUser error:", error);
console.error("[supabase-helpers] getProfile error:", error);
```

En Cloudflare Workers, los `console.error` son visibles en Cloudflare Dashboard Logs — accesible a cualquier colaborador del equipo con acceso al dashboard.

**Impacto:**  
Correlación de userId con errores específicos en logs. Si los logs son capturados por un tercero, permite asociar identidades con fallos del sistema.

**Solución:**  
- En `entregar-actividad.ts`: loguear solo `error.message` y `actividadId` (no `userId`).
- En `supabase-helpers.ts`: loguear solo `error.message`, no el objeto completo.

**Tiempo estimado:** 15 min  

---

## OWASP-BACH-007
**Categoría:** A04 — Insecure Design (Rate Limiting)  
**Severidad:** MEDIUM  
**Estado:** ⏳ PENDIENTE USUARIO  

**Descripción:**  
La Server Action `entregarActividad` no tiene rate limiting. Un usuario autenticado puede enviar N intentos en milisegundos, insertando filas masivas en la tabla `intentos`.

**Evidencia:**  
`src/lib/actions/entregar-actividad.ts` — no hay verificación de frecuencia antes del `sb.from("intentos").insert(...)`.

No existe ningún middleware de rate limiting en el proyecto (no hay upstash/ratelimit, no hay Cloudflare rate limiting rules).

**Impacto:**  
Flooding de la tabla `intentos`, degradación de performance para todos los usuarios, posible exceso del tier gratuito de Supabase. También permite inflación artificial de scores.

**Solución (PENDIENTE USUARIO):**  
Opción A (Cloudflare): Configurar rate limiting rule en Cloudflare Dashboard → Security → WAF → Rate Limiting para rutas de Server Actions.

Opción B (código): Integrar `@upstash/ratelimit` con Redis de Upstash. Requiere cuenta Upstash y variable de entorno `UPSTASH_REDIS_URL`.

**Tiempo estimado:** 30-60 min (usuario, requiere servicio externo)  

---

## OWASP-BACH-008
**Categoría:** A01 — Broken Access Control (Middleware)  
**Severidad:** MEDIUM  
**Estado:** ✅ RESUELTO EN CÓDIGO  

**Descripción:**  
No existe `src/middleware.ts` ni `middleware.ts` en la raíz del proyecto. Sin middleware, la protección de rutas depende enteramente de que cada `layout.tsx` o `page.tsx` implemente su propio guard. Un layout olvidado (como el de docente, OWASP-BACH-001) expone páginas completas.

**Evidencia:**  
`find . -name "middleware.ts" -not -path "*/node_modules/*"` → sin resultados.

**Impacto:**  
Riesgo sistémico: cualquier nueva ruta creada sin guard de auth está desprotegida hasta que alguien lo note. No hay red de seguridad centralizada.

**Solución:**  
Crear `src/middleware.ts` con matcher para rutas protegidas (`/hub`, `/admin`, `/dashboard`). El middleware verifica token Supabase y redirige a `/log-in` si no hay sesión válida.

Nota: En @opennextjs/cloudflare, el middleware de Next.js se compila como Cloudflare Worker edge function — performance excelente.

**Tiempo estimado:** 30 min  

---

## OWASP-BACH-009
**Categoría:** A06 — Vulnerable and Outdated Components  
**Severidad:** MEDIUM  
**Estado:** ⏳ PENDIENTE (breaking changes)  

**Descripción:**  
`npm audit` reporta 6 vulnerabilidades de severidad moderada:

| Paquete | Vulnerabilidad | Vía | CVE |
|---------|---------------|-----|-----|
| `postcss <8.5.10` | XSS via unescaped `</style>` en CSS stringify | `next` node_modules | GHSA-qx2v-qp2m-jg93 |
| `ws 8.0.0-8.20.0` | Uninitialized memory disclosure | `miniflare` → `wrangler` → `@opennextjs/cloudflare` | GHSA-58qx-3vcg-4xpx |

Fix disponible pero requiere `--force` (Next.js 9.x o wrangler downgrade) — no viable.

**Impacto:**  
- `postcss`: riesgo en **build time** (no runtime), afectaría solo si se procesa CSS de fuente no confiable.  
- `ws`: riesgo en **dev/CI** (wrangler es devDependency), no runtime de producción.  
Ambos son MODERATE, no CRITICAL.

**Solución (PENDIENTE):**  
Monitorear updates de `next` y `wrangler` que incluyan versiones parcheadas. Ejecutar `npm audit` en cada sprint. No aplicar `--force` — rompería el build.

**Tiempo estimado:** N/A hasta que haya fix no-breaking  

---

## OWASP-BACH-010
**Categoría:** A07 — Identification and Authentication  
**Severidad:** LOW  
**Estado:** ✅ RESUELTO EN CÓDIGO  

**Descripción:**  
`supabase-helpers.ts` exporta la función `getSession()` que usa `supabase.auth.getSession()`. Según la documentación oficial de Supabase, **`getSession()` NO debe usarse para decisiones de autenticación en server-side** porque los tokens de sesión en cookies no son validados con el servidor de auth (pueden estar alterados). `getUser()` (que sí hace validación server-side) es el método correcto.

Si bien `getSession` no está siendo llamada en ninguna página de producción (solo en tests), su presencia como export público crea riesgo de regresión futura.

**Evidencia:**  
`src/lib/supabase-helpers.ts` líneas 38-47: función exportada sin advertencia de deprecación.  
`grep "getSession" src/` — solo aparece en tests y en la definición.

**Solución:**  
Marcar con comentario de advertencia explícito o eliminar si no es usada por tests funcionales.

**Tiempo estimado:** 5 min  

---

## OWASP-BACH-011
**Categoría:** A05 — Security Misconfiguration  
**Severidad:** LOW  
**Estado:** ✅ RESUELTO EN CÓDIGO  

**Descripción:**  
`next.config.ts` no incluye `poweredByHeader: false`. Por defecto, Next.js puede incluir el header `X-Powered-By: Next.js` en las respuestas, revelando el framework al atacante.

**Evidencia:**  
`next.config.ts` líneas 32-44: `const nextConfig: NextConfig = { ... }` sin `poweredByHeader: false`.

**Impacto:**  
Fingerprinting del framework. Permite al atacante adaptar exploits específicos de Next.js. Impacto bajo pero trivial de resolver.

**Solución:**  
Agregar `poweredByHeader: false` en `nextConfig`.

**Tiempo estimado:** 2 min  

---

## OWASP-BACH-012
**Categoría:** A01 — Broken Access Control (RLS)  
**Severidad:** INFO  
**Estado:** ⏳ PENDIENTE USUARIO (verificación manual Supabase)  

**Descripción:**  
Las políticas RLS de Supabase para las tablas `intentos`, `profiles`, `actividades`, `progresiones` no son verificables desde el código fuente. El código sí filtra por `user_id` en todas las consultas de intentos, pero si RLS no está habilitado en la tabla, un alumno con acceso directo a la API de Supabase (usando el ANON_KEY) podría leer intentos de otros alumnos.

**Evidencia:**  
Todas las queries en `hub.ts` y `hub-browser.ts` filtran por `user_id` ✓  
Imposible verificar RLS desde código — requiere acceso a Supabase Dashboard.

**Solución (PENDIENTE USUARIO):**  
1. Ir a Supabase Dashboard → Database → Tables → `intentos` → RLS.
2. Verificar que existe policy: `SELECT: auth.uid() = user_id`.
3. Verificar lo mismo para `profiles`: `SELECT: auth.uid() = id`.
4. Documentar policies activas.

**Tiempo estimado:** 20 min (usuario)  

---

## OWASP-BACH-013
**Categoría:** A13 — Resiliencia y backup  
**Severidad:** INFO  
**Estado:** ⏳ PENDIENTE USUARIO  

**Descripción:**  
No hay documentación de política de backups de Supabase ni plan de recuperación ante desastres en el repositorio.

**Solución (PENDIENTE USUARIO):**  
1. Verificar en Supabase Dashboard → Settings → Backups la frecuencia de Point-in-Time Recovery (PITR).
2. Documentar en `docs/ARQUITECTURA.md` la política de retención.
3. Plan mínimo: exportar schema SQL mensualmente con `supabase db dump`.

**Tiempo estimado:** 30 min (usuario)  

---

## Score OWASP final

| Categoría OWASP | Hallazgo | Severidad |
|-----------------|----------|-----------|
| A01 | Docente layout sin auth | HIGH ✅ |
| A01 | Sin middleware centralizado | MEDIUM ✅ |
| A01 | RLS no verificadas | INFO ⏳ |
| A03 | error.message al cliente | HIGH ✅ |
| A04 | Sin rate limiting | MEDIUM ⏳ |
| A05 | CSP unsafe-eval | HIGH ✅ |
| A05 | Sin HSTS | HIGH ✅ |
| A05 | X-Powered-By no deshabilitado | LOW ✅ |
| A06 | 6 vulns moderadas npm | MEDIUM ⏳ |
| A07 | getSession() exportada sin advertencia | LOW ✅ |
| A09 | Sentry no configurado | HIGH ⏳ |
| A09 | Logs con userId + error obj | MEDIUM ✅ |
| A13 | Backup policy no documentada | INFO ⏳ |

**Pre-fixes:** 5.0/10  
**Post-fixes (código):** 7.5/10  
**Post-fixes (completo, incluyendo usuario):** 9.0/10  
