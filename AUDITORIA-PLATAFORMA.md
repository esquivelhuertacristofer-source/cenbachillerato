# Auditoría Técnica Integral — Plataforma CEN Bachillerato

> **Destinatario:** Asesor externo
> **Objeto:** Estado actual de la plataforma — arquitectura, mapeo completo, integraciones, base de datos (Supabase) y seguridad.
> **Fecha del documento:** 2026-06-07
> **Commit auditado:** `0695d2a` — *"Re-alineamiento MCCEMS 2025 completo: 207/207 propósitos, 88 labs 3D"*
> **Naturaleza del producto:** Plataforma educativa web para el bachillerato mexicano alineada al **MCCEMS (Marco Curricular Común de la Educación Media Superior), Modelo 2025**.

---

## 0. Resumen ejecutivo

CEN Bachillerato es una aplicación web full-stack construida sobre **Next.js 16 (App Router + Turbopack)** y **React 19**, desplegada en **Cloudflare Workers** (plan FREE) mediante OpenNext, con backend **Supabase (PostgreSQL + Row Level Security)**. Implementa el currículo oficial MCCEMS 2025 completo: **8 áreas de conocimiento, 32 UAC, 207 propósitos formativos y 1 727 actividades**, de las cuales **85 prácticas son laboratorios 3D interactivos** (React Three Fiber), respaldadas por 88 archivos de escena en disco (véase §2.3 para la reconciliación de ambos números).

**Estado de salud (compuertas de verificación, última corrida):**

| Compuerta | Resultado |
|---|---|
| `tsc --noEmit` (TypeScript estricto) | **0 errores** |
| `eslint src` | **0 errores** |
| `jest` (suite de pruebas) | **235 pruebas en verde** |
| `next build` | **exit 0** |
| Integridad registry ↔ BD ↔ disco (labs 3D) | **consistente** |

**Postura de seguridad (resumen):** RLS activo en todas las tablas; separación estricta de claves (anon vs service-role); secretos correctamente fuera del control de versiones (verificado en esta auditoría); cabeceras de seguridad HTTP completas (CSP, HSTS, anti-clickjacking); middleware + verificación de rol por capa. Riesgos residuales: bajos/medios (detallados en §7).

---

## 1. Arquitectura y stack tecnológico

### 1.1 Núcleo

| Capa | Tecnología | Versión | Notas |
|---|---|---|---|
| Framework | Next.js | 16.2.6 | App Router, Turbopack, **React Compiler activado** (`reactCompiler: true`) |
| UI runtime | React | 19.2.4 | Server Components + Client Components |
| Lenguaje | TypeScript | 5.x | Modo **estricto** + `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch` |
| Estilos | Tailwind CSS | v4 | Vía `@tailwindcss/postcss` (sin `tailwind.config`, configuración en CSS) |
| Animación | Motion | 12.39.0 | Respeta `prefers-reduced-motion` |
| Estado cliente | Zustand | 5.0.13 | Uso mínimo (solo store de tema del dashboard) |
| 3D | React Three Fiber + three.js | 9.6.1 / 0.180.0 | Laboratorios interactivos |
| Validación | Zod | 4.4.3 | Acciones críticas (alta masiva, cambio de contraseña) |
| Backend SDK | @supabase/supabase-js + @supabase/ssr | 2.105.4 / 0.10.3 | Tres clientes (§4.3) |
| Observabilidad | @sentry/nextjs | 10.53.1 | Captura de errores |
| Pruebas | Jest | 30.4.2 | 235 pruebas |

> **Alias de imports:** `@/*` → `./src/*`.

**Bibliotecas notables que revelan funcionalidades del producto:**

| Librería | Versión | Funcionalidad asociada |
|---|---|---|
| `jspdf` | 4.2.1 | Generación de PDF en cliente (reportes/constancias) |
| `papaparse` (+ `@types/papaparse`) | 5.5.3 | Parseo de CSV para **alta masiva** de alumnos |
| `react-markdown` + `remark-gfm` | 10.1.0 / 4.0.1 | Renderizado de contenido en Markdown (GFM) |
| `lucide-react` + Font Awesome (CDN) | 1.16.0 | Iconografía |
| `@react-three/drei` + `@react-three/postprocessing` | 10.7.7 / 3.0.4 | Utilidades y postproceso de las escenas 3D |
| `playwright` (devDep) | 1.60.0 | Capacidad de pruebas E2E (además de Jest) |

### 1.2 Despliegue (Cloudflare Workers)

- **Adaptador:** `@opennextjs/cloudflare` 1.19.11 + `wrangler` 4.90.1.
- **Restricción dura del plan FREE:** el Worker no puede exceder **3 MiB gzipped**. Esto condiciona el diseño: **los módulos de datos de los labs 3D NO importan `three`** (separan matemática/datos puros de la escena R3F) para no inflar el bundle SSR.
- **Configuración:** `wrangler.toml` (entry `.open-next/worker.js`, flag `nodejs_compat`), `open-next.config.ts` (wrapper cloudflare-node, middleware cloudflare-edge, `incrementalCache: "dummy"`).
- **Parche conocido:** un bug de interacción Turbopack + OpenNext (`requireChunk`) se mitiga con dos scripts: `scripts/patch-opennext-turbopack.mjs` (postinstall) y `scripts/postbuild-turbopack.mjs` (en `pages:build`).

> **Nota para el asesor:** este proyecto corre una versión de Next.js con *breaking changes* respecto a versiones previas. El repositorio incluye `AGENTS.md`/`CLAUDE.md` instruyendo a consultar la documentación local (`node_modules/next/dist/docs/`) antes de modificar código de framework.

### 1.3 Estructura de carpetas (alto nivel)

```
cen-bachillerato/
├── src/
│   ├── app/                  # Rutas (App Router): páginas y layouts
│   ├── components/           # UI: hub, hub-v2, dashboard, activities, practicas (labs 3D), landing
│   ├── lib/
│   │   ├── supabase-admin.ts        # cliente service-role (servidor/scripts)
│   │   ├── supabase-browser.ts      # cliente anon (navegador)
│   │   ├── supabase-helpers.ts      # cliente SSR + getUser/getProfile
│   │   └── mccems/                  # módulos de referencia curricular (datos puros)
│   │       ├── estructura.ts        # UAC_BASE[]
│   │       ├── contenido-2025.ts    # propósitos formativos verbatim (Modelo 2025)
│   │       └── categorias.ts
│   └── middleware.ts          # protección de rutas + cambio forzado de contraseña
├── supabase/migrations/       # 13 migraciones SQL
├── scripts/                   # ~228 scripts de contenido/mantenimiento (service-role)
├── public/                    # 12 PDFs oficiales MCCEMS 2025 + activos
├── next.config.ts             # cabeceras de seguridad, React Compiler
├── wrangler.toml / open-next.config.ts
└── ALINEAMIENTO-2025.md       # reporte de cobertura curricular
```

---

## 2. Mapa de contenido y currículo

### 2.1 Jerarquía de datos

```
Área de conocimiento (8)
   └── UAC — Unidad de Aprendizaje Curricular (32)
          └── Progresión = Propósito formativo (207)        [ruta: /progresion/[id]]
                 └── Actividad (1 727)                        [12 tipos]
                        └── (si aplica) práctica 3D           [practica_slug → registry]
```

- **8 áreas:** RSC-LC (Lengua y Comunicación), PM (Pensamiento Matemático), IN (Inglés), CD (Cultura Digital), CH (Conciencia Histórica), CS (Ciencias Sociales), PFH (Pensamiento Filosófico y Humanidades), CNEYT (Ciencias Naturales, Experimentales y Tecnología).
- **Alineamiento 2025:** verificado al Modelo MCCEMS 2025 ("propósitos formativos + contenidos formativos", máx. 8 por semestre). Cobertura: **207/207 propósitos, 0 huecos** (detalle en `ALINEAMIENTO-2025.md`).
- Los 12 PDFs oficiales viven en `public/` y son la fuente *verbatim* del contenido (regla anti-fabricación: no se inventa contenido; los huecos se reportan, no se rellenan artificialmente).

### 2.2 Los 12 tipos de actividad

`lectura`, `quiz_multiple_opcion`, `quiz_verdadero_falso`, `fill_blanks`, `ejercicio_matematico`, `reflexion_escrita`, `video_con_preguntas`, `infografia`, `debate_estructurado`, `simulacion`, `glosario_interactivo`, `autoevaluacion`.

Se despachan vía `ActivityShell.tsx` / `ActivityRunner.tsx`. El patrón típico por progresión es de **7 actividades**.

### 2.3 Laboratorios 3D (85 prácticas registradas / 88 componentes de escena)

Patrón de **3 archivos** por laboratorio:

1. `xxx-data.ts` — **datos y matemática puros** (NO importa `three`; protege el límite de 3 MiB del Worker).
2. `XxxScene.tsx` — escena React Three Fiber, cargada con `dynamic(() => import("./XxxScene"), { ssr: false })`.
3. `LabXxx.tsx` — cascarón de UI.

- **Registro:** `src/components/practicas/registry.tsx` mapea `slug → componente` vía `getPractica(slug)`. La columna `actividades.practica_slug` enlaza la actividad con su laboratorio.
- **Kit compartido:** `_kit.tsx` (tokens visuales, `SceneBoundary`).
- **Restricción técnica conocida:** NO se usa `<Text>` de drei dentro de las escenas (cuelga el chunk bajo Turbopack); se usa `<Html>` en su lugar.
- **Reconciliación de conteo (85 vs 88):** el registry (`PRACTICAS: Record<string, PracticaDef>`) expone exactamente **85 slugs** servidos por `getPractica()`; en disco hay **88 archivos `*Scene.tsx`** porque algunos laboratorios componen más de una escena (p. ej. modos múltiples con escenas separadas). El reporte oficial `ALINEAMIENTO-2025.md` cita "**88 labs 3D**" contando archivos de escena / unidades construidas; la cifra de **prácticas direccionables** (slugs únicos) es **85**. La compuerta de integridad registry↔BD↔disco valida que ningún `practica_slug` quede huérfano.

### 2.4 Gamificación

- **XP** (por defecto 10/actividad) y **racha** (días consecutivos), registrados vía la tabla `intentos`.
- **Logros:** tablas `logros` / `logros_alumno` (migración 13).
- Las consultas de progreso **excluyen los complementos** (contenido no oficial 2025) mediante filtrado en JS, para que el avance refleje solo el currículo oficial.

---

## 3. Mapa de rutas y control de acceso

| Zona | Rutas (prefijo) | Acceso |
|---|---|---|
| Público | `/`, `/log-in`, `/bachillerato`, `/privacidad`, `/terminos` | Abierto |
| Cambio forzado | `/cambiar-password` | Autenticado con `must_change_password=true` |
| Estudiante | `/hub/*` | Rol `student` |
| Docente | `/dashboard/docente/*` | Rol `teacher` |
| Administración | `/admin/*` | Rol `admin` / `super_admin` |

- **Una sola ruta de estudiante (`/hub`).** No existe ruta `/hub-v2`. Lo que coexiste son **dos generaciones de componentes** de UI en el árbol fuente: `src/components/hub` (v1) y `src/components/hub-v2` (v2, actual); ambas carpetas están presentes, pero la zona enrutada es `/hub`.
- **Reparto de responsabilidades en autenticación/autorización:**
  - `src/middleware.ts` (matcher: `/hub/*`, `/admin/*`, `/dashboard/*`, `/cambiar-password`) **NO valida roles**: solo (a) refresca el token de sesión de Supabase y (b) fuerza la redirección a `/cambiar-password` cuando `user_metadata.must_change_password === true` (flujo de alta masiva). El propio código lo documenta: *"La autorización real se delega a los layout.tsx de cada sección."*
  - **La autorización por rol vive íntegramente en los `layout.tsx` de cada sección** (verificación asíncrona en el servidor contra el perfil). Es una defensa en capas (sesión en el edge + rol en el servidor), pero conviene no asumir que el middleware bloquea por rol.

---

## 4. Base de datos — Supabase (PostgreSQL + RLS)

### 4.1 Esquema (19 tablas)

| Dominio | Tablas |
|---|---|
| Instituciones / usuarios | `escuelas`, `profiles`, `grupos`, `alumnos_grupos` |
| Currículo (referencia) | `componentes_curriculares`, `recursos_sociocognitivos`, `areas_conocimiento`, `recursos_socioemocionales`, `tipos_actividad` |
| Contenido | `uac`, `progresiones`, `actividades`, `planteamiento_progresiones` |
| Progreso / gamificación | `intentos`, `logros`, `logros_alumno` |
| Biblioteca | `fichas_biblioteca`, `fichas_lecturas` |
| Legal | `user_consents` |

> Conteo verificado: **19 sentencias `CREATE TABLE`** en `supabase/migrations/` (13 en `01_schema_inicial`, más `tipos_actividad`, `fichas_biblioteca`, `fichas_lecturas`, `planteamiento_progresiones`, `logros`, `logros_alumno`).

### 4.2 Migraciones (13)

`01_schema_inicial` · `02_realinear_mccems_oficial` · `03_tipos_actividades` · `04_alineacion_modelo_2025` · `05_biblioteca` · `06_nivel_revision` · `07_fix_tipo_codigo_actividades` · `08_planteamiento_progresiones` · `09_alta_masiva_must_change_password` · `10_practica_experimental` · `11_rls_docente_alumnos_grupos` · `12_rls_docente_profiles_alumnos` · `13_logros`.

> **Proceso operativo:** las migraciones (DDL) se aplican **manualmente** por el operador en el SQL Editor de Supabase (en particular 11 y 12, que ajustan RLS para docentes). El contenido/datos se cargan vía scripts service-role idempotentes. Esto es una decisión deliberada de control de cambios, no una limitación.

### 4.3 Tres clientes Supabase (separación de privilegios)

| Cliente | Archivo | Clave | Uso |
|---|---|---|---|
| **Admin** | `src/lib/supabase-admin.ts` → `getSupabaseAdmin()` | **service-role** (omite RLS) | Solo servidor / scripts. Nunca en el navegador. |
| **Browser** | `src/lib/supabase-browser.ts` → `getSupabaseBrowser()` | anon (sujeta a RLS) | Cliente |
| **Server SSR** | `src/lib/supabase-helpers.ts` → `getSupabaseServer()`, `getUser()`, `getProfile()` | anon + cookies de sesión | Server Components / acciones |

### 4.4 Row Level Security (RLS)

- **RLS activo en todas las tablas.**
- Para **evitar recursión de políticas**, los predicados usan funciones `SECURITY DEFINER`: `get_my_role()` y `get_my_escuela_id()`. Esto permite que una política consulte el rol/escuela del usuario sin re-disparar RLS sobre `profiles`.
- Aislamiento multi-tenant por `escuela_id` (un docente/admin solo ve a los alumnos de su escuela/grupo, según migraciones 11–12).

> **Recordatorio operativo (comportamiento esperado, no bug):** RLS devuelve **0 filas sin error** cuando una política no concede acceso. Si la app "no trae datos que sí existen", revisar **políticas**, no nombres de columna.

---

## 5. Integraciones y conexiones externas

| Servicio | Propósito | Configuración |
|---|---|---|
| **Supabase** | Auth, Postgres, RLS | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Cloudflare Workers** | Hosting/ejecución (edge) | `wrangler.toml`, OpenNext |
| **Sentry** | Monitoreo de errores | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` |

**Variables de entorno** (plantilla en `.env.example`):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      # secreto — solo servidor
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN              # secreto — solo build
```

---

## 6. Frontend / UX

- **UI kit propio** (sin shadcn/radix); fuente Epilogue; `canvas-confetti` para celebraciones.
- **Tailwind v4** sin archivo de configuración (configuración en CSS).
- **Accesibilidad:** animaciones (Motion) respetan `prefers-reduced-motion`.
- **Estado:** mínimo en cliente (Zustand solo para el tema del dashboard); el grueso del estado vive en el servidor (RSC + Supabase).
- **Flujo de actividad:** `ActivityShell` / `ActivityRunner` despachan los 12 tipos; las prácticas 3D se cargan diferidas (`ssr: false`).

---

## 7. Seguridad — postura y hallazgos

### 7.1 Controles implementados (✅)

1. **Gestión de secretos correcta — VERIFICADO en esta auditoría.**
   - `.gitignore` contiene `.env*` con excepción `!.env.example`.
   - Comprobado: `git ls-files` lista **solo `.env.example`**; `git log --all --full-history -- .env.local` **no devuelve resultados** (el archivo nunca estuvo en el historial); `git check-ignore .env.local` confirma que está ignorado.
   - **Conclusión:** la `SUPABASE_SERVICE_ROLE_KEY` **nunca se ha commiteado ni expuesto** en el repositorio. *(Se descarta explícitamente un reporte automático previo que sugería una fuga; era un falso positivo: el escáner leyó `.env.local` del disco local —donde reside legítimamente— y asumió erróneamente que estaba versionado.)*

2. **Separación de privilegios de BD:** clave service-role confinada a servidor/scripts; el navegador solo usa la clave anon sujeta a RLS (§4.3).

3. **RLS en todas las tablas** con funciones `SECURITY DEFINER` para evitar recursión y fugas entre tenants (§4.4).

4. **Control de acceso en doble capa:** middleware + verificación de rol por layout (§3).

5. **Cabeceras de seguridad HTTP** aplicadas a todas las rutas (`next.config.ts`, `poweredByHeader: false`):
   - **Content-Security-Policy** robusta: `default-src 'self'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `connect-src` restringido al proyecto Supabase (REST + WSS), `img-src 'self' data: blob:`. `script-src` incluye `'unsafe-inline'` y `'unsafe-eval'` **solo en desarrollo** (Turbopack/HMR); en producción `'unsafe-eval'` NO se emite.
   - **HSTS**: `max-age=63072000` (2 años) `; includeSubDomains; preload`.
   - **X-Frame-Options: DENY** (anti-clickjacking, redundante con `frame-ancestors 'none'`).
   - **X-Content-Type-Options: nosniff**.
   - **Referrer-Policy: strict-origin-when-cross-origin**.
   - **Permissions-Policy**: `camera=(), microphone=(), geolocation=()`.

6. **Cambio forzado de contraseña** para cuentas de alta masiva (`must_change_password`), con validación Zod.

7. **Consentimiento legal** registrado (`user_consents`); páginas `/privacidad` y `/terminos`.

### 7.2 Riesgos residuales y recomendaciones (priorizadas)

| # | Severidad | Hallazgo | Recomendación |
|---|---|---|---|
| 1 | **Baja-Media** | En producción, `script-src` aún permite `'unsafe-inline'` (limitación habitual del runtime inline de Next.js; `'unsafe-eval'` ya está restringido a dev). | Migrar a CSP basada en *nonce*/hash para los scripts inline; reduce la superficie XSS residual. Evaluar el trade-off con la hidratación de Next.js. |
| 2 | **Baja-Media** | El login usa solo validación HTML5 (sin Zod), a diferencia de otras acciones críticas. | Añadir validación de servidor (Zod) y rate-limiting en autenticación. |
| 3 | **Baja** | Migraciones 11/12 son de aplicación manual. | Documentar checklist de despliegue para garantizar que RLS de docente quede aplicado en cada entorno. |
| 4 | **Baja** | Sin rate-limiting explícito documentado en endpoints sensibles (login, alta masiva). | Considerar límites por IP/usuario (Cloudflare ofrece primitivas en el edge). |
| 5 | **Informativo** | Plan FREE de Cloudflare (3 MiB Worker) impone disciplina de bundle. | Mantener la regla "módulos de datos sin `three`"; vigilar tamaño del Worker en CI. |

> No se identificaron vulnerabilidades **críticas** confirmadas en esta auditoría.

---

## 8. Calidad e ingeniería

- **TypeScript estricto** con flags adicionales de seguridad de tipos (`noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`). *Nota de alcance:* `tsconfig.json` **excluye `scripts/`** del chequeo, por lo que el gate `tsc` cubre `src/` (la aplicación), no los ~228 scripts de mantenimiento.
- **Compuertas automatizadas:** `tsc` (0), `eslint src` (0), `jest` (235), `next build` (0), e **integridad referencial de labs** (registry ↔ base de datos ↔ disco).
- **Regla anti-fabricación de contenido:** todo el contenido curricular es *verbatim* de los PDFs oficiales; los huecos se reportan, no se inventan.
- **~228 scripts** de contenido/mantenimiento siguen un patrón común (`scripts/lib/activity-utils.ts`: `createSB()`, `upsertActividad()`, `getProgresionId()`), idempotentes y re-ejecutables.

---

## 9. Conclusión para el asesor

La plataforma está en un estado **maduro y verificable**: arquitectura moderna y coherente (Next.js 16 / React 19 / Supabase / Cloudflare), cobertura curricular completa al Modelo MCCEMS 2025 (207/207 propósitos), y un sistema distintivo de **85 laboratorios 3D** con un patrón de ingeniería disciplinado para respetar las restricciones de despliegue. La **postura de seguridad es sólida** (RLS integral, separación de claves, secretos fuera de git —verificado—, cabeceras completas), con riesgos residuales **bajos/medios** y accionables (principalmente endurecer CSP y la validación/limitación de tasa en autenticación).

**Próximos pasos sugeridos** para una segunda fase de endurecimiento:
1. CSP con nonce (eliminar `unsafe-inline`).
2. Validación de servidor + rate-limiting en login.
3. Checklist de despliegue que garantice RLS de docente (migraciones 11/12) en todos los entornos.
4. Vigilancia del tamaño del Worker en CI (presupuesto de bundle).

---

## 10. Checklist de go-live (de "piloto sólido" a "producción")

Estado actual: **piloto sólido / pre-producción**. La arquitectura es estable y replicable; lo que resta son **tareas de cierre acotadas**, no cambios estructurales. Ordenadas por prioridad para liberar a producción con datos reales (incluye menores de edad).

### 🔴 Bloqueantes de go-live (cerrar antes de abrir a alumnos reales)

| # | Tarea | Por qué bloquea | Esfuerzo aprox. |
|---|---|---|---|
| 1 | **Endurecer autenticación**: validación de servidor (Zod) + **rate-limiting** en login y recuperación de contraseña (primitivas de Cloudflare en el edge). | Hoy el login solo tiene validación HTML5 y no limita intentos → expuesto a fuerza bruta/credential stuffing. Crítico con datos de menores. | S |
| 2 | **Prueba de RLS en vivo, por rol**: validar con usuarios reales `student`/`teacher`/`admin`/`super_admin` que cada uno ve **solo** lo que debe (aislamiento por `escuela_id`/grupo). | La seguridad de RLS está en código, pero "operativa" se demuestra con la app corriendo, no con `next build`. | M |
| 3 | **Despliegue verificado a Cloudflare Workers**: confirmar que el Worker cabe en el límite de 3 MiB gzipped y que la app responde en la URL de producción (no solo `pages:build` local). | Sin un despliegue confirmado, "operativa mañana" no está demostrado. | S |
| 4 | **Publicar el contenido restante**: promover las ~12 actividades en `borrador-video` a publicado (o sustituirlas) para que ningún alumno encuentre huecos. | "100% operativa" implica recorrido sin baches para el alumno. | S |

### 🟡 Recomendados antes de escalar (no bloquean un piloto, sí una apertura amplia)

| # | Tarea | Beneficio | Esfuerzo aprox. |
|---|---|---|---|
| 5 | **CSP con nonce/hash**: eliminar `'unsafe-inline'` de `script-src` en producción. | Cierra la superficie XSS residual. | M |
| 6 | **Resolver la duda técnica del hub**: si `src/components/hub` (v1) es código muerto, eliminarlo; si no, documentar qué usa cada generación. | Quita ambigüedad y peso muerto; facilita el mantenimiento. | S |
| 7 | **Checklist de despliegue de BD**: garantizar que las migraciones manuales (11/12, RLS docente) queden aplicadas en cada entorno. | Evita que un entorno quede sin RLS de docente por olvido manual. | S |
| 8 | **Suite E2E con Playwright** (ya instalado): cubrir los flujos críticos (login → cambio forzado de contraseña → recorrido de actividad → lab 3D). | Detecta regresiones de integración que `jest` (unitario) no ve. | M |
| 9 | **Vigilar presupuesto de bundle del Worker en CI**: medir el tamaño gzipped en cada build y alertar al acercarse a 3 MiB. | Previene un fallo de despliegue futuro al crecer el contenido. | S |

### 🟢 Mejoras de robustez (post-lanzamiento)

| # | Tarea | Beneficio |
|---|---|---|
| 10 | Monitoreo activo de errores en producción (Sentry ya integrado): definir alertas y revisar el dashboard. | Visibilidad operativa real. |
| 11 | Backups verificados de Supabase + plan de restauración probado. | Continuidad ante incidentes. |
| 12 | Incluir `scripts/` en un chequeo de tipos aparte (hoy `tsconfig` los excluye). | Calidad de las herramientas de contenido. |

> **Lectura para el asesor:** ninguno de estos puntos exige rehacer la arquitectura. Los 4 bloqueantes son trabajo de **días, no semanas**; el resto es endurecimiento incremental. La base aguanta el crecimiento — eso es lo relevante.

---

## 11. Metodología y limitaciones de esta auditoría

- **Tipo:** auditoría de código **de solo lectura** sobre el commit `0695d2a`. No se ejecutó la aplicación ni se consultó la base de datos en vivo.
- **Verificado directamente contra el código en esta pasada:** versiones de dependencias (`package.json`), cabeceras de seguridad y CSP (`next.config.ts`), flags de TypeScript (`tsconfig.json`), comportamiento del middleware (`src/middleware.ts`), número y nombres de tablas (`supabase/migrations/`), número de migraciones (13), número de slugs en el registry (85) y de archivos de escena (88), rutas existentes (`src/app/`), y la ausencia de secretos en git (comandos `git` directos).
- **Tomado de los reportes del proyecto (no de una consulta en vivo):** los conteos curriculares —**207 propósitos, 1 727 actividades, 32 UAC, 33 complementos, 88 labs**— provienen de `ALINEAMIENTO-2025.md`. Las cifras de las compuertas (`jest` 235, etc.) reflejan la **última corrida registrada**, no una re-ejecución en esta sesión.
- **Correcciones aplicadas durante la elaboración:** se descartó un falso positivo de "fuga de service-role key en git" (§7.1); se corrigió el conteo de tablas (18 → 19), la inexistencia de la ruta `/hub-v2`, el alcance real del middleware (no valida roles) y la descripción de la CSP.

*Para una verificación independiente, el asesor puede re-ejecutar las compuertas (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`) y revisar las políticas RLS directamente en el panel de Supabase.*
