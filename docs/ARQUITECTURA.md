# Arquitectura — CEN Bachillerato

## Stack tecnológico

| Capa | Tecnología | Versión | Notas |
|------|-----------|---------|-------|
| Framework | Next.js | 16.2.x | App Router, Turbopack (default en v16) |
| Lenguaje | TypeScript | 5.x | Strict mode completo |
| Estilos | Tailwind CSS | 4.x | — |
| Auth + DB | Supabase | 2.x | PKCE + cookies httpOnly via @supabase/ssr |
| State global | Zustand | 5.x | Solo cuando aplique, no en Server Components |
| Monitoreo | Sentry | 10.x | Instalado, DSN pendiente de configurar |
| Testing | Jest + RTL | 30.x + 16.x | CI bloqueante |
| CI/CD | GitHub Actions | — | lint + tsc + jest + next build + cloudflare build |
| Deploy | Cloudflare Workers | — | via @opennextjs/cloudflare, wrangler.toml |

## Principios arquitecturales

### 1. Server Components por defecto
Usar React Server Components siempre que sea posible. Agregar `"use client"` solo cuando se necesite interactividad (event handlers, hooks de estado, browser APIs).

### 2. Cliente Supabase único por contexto
- **Browser**: `getSupabaseBrowser()` en `src/lib/supabase-browser.ts` — singleton, PKCE
- **Server**: `getSupabaseServer()` en `src/lib/supabase-helpers.ts` — instancia por request
- **Admin**: `getSupabaseAdmin()` en `src/lib/supabase-admin.ts` — service role, solo server-side

`getUser()` y `getProfile()` están wrapeados con `React.cache()` para deduplicar queries auth dentro del mismo request tree (layout + page comparten el resultado).

### 3b. Security headers
Configurados en `next.config.ts` para todas las rutas:
- `X-Frame-Options: DENY` — anti-clickjacking
- `X-Content-Type-Options: nosniff` — anti-MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 3. Async params en Next.js 16
Los `params` y `searchParams` en páginas/layouts son `Promise`. Siempre usar `await`:
```tsx
// Correcto en Next.js 16
export default async function Page({ params }: Props) {
  const { id } = await params
}
```

### 4. Datos estáticos en TypeScript
Los datos curriculares del MCCEMS (UAC, recursos, áreas) viven en `src/lib/mccems/`.
Son constantes TypeScript, no requieren fetch a la DB para renderizar.
La DB tiene los mismos datos para queries de progreso de alumnos.

### 5. Multi-tenant via RLS
Cada escuela está aislada por Row Level Security en Supabase.
Las funciones `get_my_role()` y `get_my_escuela_id()` son SECURITY DEFINER para evitar recursión.

## Estructura de rutas

```
/                          → Landing principal CEN (portfolio)
/bachillerato              → Landing específica MCCEMS
/log-in                    → Autenticación
/hub                       → Hub estudiantil (role: student)
/hub/semestre/[num]        → Vista por semestre
/hub/uac/[codigo]          → UAC con progresiones
/hub/uac/[codigo]/progresion/[id] → Actividades (placeholder)
/dashboard/docente         → Dashboard docente
/dashboard/docente/alumnos
/dashboard/docente/metricas
/dashboard/docente/reportes
/admin/escuelas            → Gestión institucional
/admin/grupos
/admin/usuarios
/privacidad                → Aviso de privacidad LFPDPPP
/terminos                  → Términos de uso
```

## Infraestructura — Cloudflare Workers

### Por qué Cloudflare Workers (no Vercel)

| Factor | Vercel Hobby | Cloudflare Workers |
|--------|-------------|-------------------|
| Uso comercial | ❌ Prohibido | ✅ Permitido |
| Bandwidth | 100 GB/mes | Ilimitado |
| Solicitudes/mes | 100 GB equivalente | 10M gratis, luego $0.30/M |
| CDN en México | Buena | Excelente (edge global) |
| DDoS protection | Básica | Enterprise, incluida |
| ISR / Caching | Nativo | Configurable (dummy por ahora) |

### Adaptador: @opennextjs/cloudflare

```
npm run pages:build   → npx @opennextjs/cloudflare build
                         Produce: .open-next/worker.js
                                  .open-next/assets/
npm run pages:dev     → npx @opennextjs/cloudflare preview (Wrangler dev server)
npm run pages:deploy  → npx @opennextjs/cloudflare deploy  (wrangler deploy)
```

**Configuración** (`open-next.config.ts`):
- `wrapper: "cloudflare-node"` — Runtime Node.js compatible en Workers
- `converter: "edge"` — Convierte requests al formato Workers
- `edgeExternals: ["node:crypto"]` — Expuesto para que Supabase funcione
- `incrementalCache/tagCache: "dummy"` — Sin ISR en esta etapa

**wrangler.toml**:
```toml
name = "cen-bachillerato"
main = ".open-next/worker.js"
compatibility_date = "2026-05-12"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
```

### Conectar repo a Cloudflare Workers Builds (deploy automático)

1. Dashboard → Workers & Pages → Create → Connect to Git
2. Seleccionar repo `cenbachillerato`
3. Build command: `npm run pages:build`
4. Build output directory: `.open-next` (no se usa para Workers, el `main` del wrangler.toml lo maneja)
5. Variables de entorno: igual que las de GitHub Secrets

### Limitaciones del edge runtime con este stack

- ❌ `fs`, `child_process`, APIs nativas de Node.js (no usadas en este proyecto)
- ❌ ISR (Incremental Static Regeneration) — configurado como "dummy", sin caché distribuida
- ✅ `fetch`, `cookies`, `crypto` — todos funcionan via `nodejs_compat`
- ✅ Supabase SSR (`createBrowserClient`, `createServerClient`) — compatibles
- ✅ Zustand — client-only, no afecta edge runtime

### Advertencia: Windows local

`@opennextjs/cloudflare` muestra warning en Windows sin WSL. El build pasa, pero para
desarrollo local con simulación de Workers, correr `npm run pages:dev` desde WSL o en CI.

## Sistema de Diseño

### Tokens de color (globals.css / Tailwind v4)

| Token Tailwind | Hex | Uso |
|---------------|-----|-----|
| `cen-navy` | `#0B2545` | Color principal — texto, botones primarios, navbar, fondo side panel |
| `cen-navy-2` | `#0E2D56` | Hover/variación del navy |
| `cen-blue` | `#1E40AF` | Acento primario — CTAs hover, links, focus rings |
| `cen-blue-soft` | `#DBEAFE` | Fondos de badges, pills azules |
| `cen-sky` | `#7DD3FC` | Acento secundario — destellos, ilustraciones, texto sobre fondo oscuro |
| `cen-sky-soft` | `#E0F2FE` | Fondos suaves |
| `cen-cool` | `#EFF6FF` | Fondos de hover, secciones alternadas |
| `cen-bg` | `#F8FAFC` | Fondo global de la app |
| `ink` | `#0B2545` | Texto principal (= cen-navy) |
| `ink-80/60/40/10` | rgba(11,37,69,0.X) | Escala de opacidad del texto |

### Tipografía

- **Font principal:** `Epilogue` (Google Fonts) — pesos 400, 500, 700, 800, 900
- Importado via `next/font/google` en `src/app/layout.tsx` (CSS variable `--font-epilogue`)

### Componentes UI (`src/components/ui/`)

| Componente | Descripción |
|------------|-------------|
| `Button` | Variantes: primary, secondary, ghost, danger. Shine effect animado en primary |
| `Card` | `hoverable` prop — sombra en hover. Subcomponentes: CardHeader, CardTitle, CardContent |
| `Input` | Labels uppercase + tracking. Focus ring sky-blue. Group-focus-within label coloreado |
| `Select` | Mismo estilo que Input |
| `Badge` | Variantes: default, primary, success, warning, error, muted |
| `Alert` | Variantes: info, success, warning, error. `animate-slide-down` |
| `Avatar` | Initials fallback + img src |
| `Skeleton` | `lines` prop para múltiples líneas |
| `MagneticButton` | Wrapper con efecto magnético de cursor |
| `ProgressRing` | SVG circular de progreso — usado en UACCard |

### Componentes Hub

- `UACCard` — Client component con 3D tilt + mouse aura flare (igual que PillarCard de Financiera)
- `SemestreSelector` — Tabs 1-6 con estados activo/disponible/bloqueado

### Animaciones

Definidas en `globals.css` como `@layer utilities` y `@keyframes`:
- `animate-float` — 6s ease-in-out infinite (elementos flotantes)
- `animate-marquee` — 20s linear infinite (banda de logos)
- `animate-gradient` — 4s linear infinite (texto degradado animado)
- `animate-shine` — 1.5s ease-in-out infinite (brillo en botones)
- `animate-twinkle` — 4s infinite (partículas decorativas)
- `animate-slide-down` — 0.3s ease-out (alerts, errores)

---

## Anti-patrones prohibidos

- ❌ `ignoreBuildErrors: true` en tsconfig
- ❌ Cliente Supabase múltiple (browser singleton)
- ❌ `middleware.ts` — renombrado a `proxy.ts` en Next.js 16
- ❌ Operaciones DB sin await + try/catch + logging
- ❌ Escalada de privilegios (protegida por trigger)
- ❌ `next lint` — removido en Next.js 16, usar `eslint` directamente
- ❌ `next build --webpack` — Turbopack es ahora el default correcto en v16
- ❌ Recuperación/cambio de contraseña en código (administrada manualmente)
- ❌ Datos sensibles en Client Components sin `taint`
- ❌ `@cloudflare/next-on-pages` — deprecated, requiere WSL en Windows, usar OpenNext
