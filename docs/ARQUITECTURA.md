# Arquitectura — CEN Bachillerato

## Stack tecnológico

| Capa | Tecnología | Versión | Notas |
|------|-----------|---------|-------|
| Framework | Next.js | 16.2.x | App Router, sin Turbopack (webpack builds) |
| Lenguaje | TypeScript | 5.x | Strict mode completo |
| Estilos | Tailwind CSS | 4.x | — |
| Auth + DB | Supabase | 2.x | PKCE + cookies httpOnly via @supabase/ssr |
| State global | Zustand | 5.x | Solo cuando aplique, no en Server Components |
| Monitoreo | Sentry | 10.x | DSN en Vercel, instalado desde día 1 |
| Testing | Jest + RTL | 30.x + 16.x | CI bloqueante |
| CI/CD | GitHub Actions | — | tsc + lint + jest + build en cada push |
| Deploy | Vercel | — | Conectado al repo privado |

## Principios arquitecturales

### 1. Server Components por defecto
Usar React Server Components siempre que sea posible. Agregar `"use client"` solo cuando se necesite interactividad (event handlers, hooks de estado, browser APIs).

### 2. Cliente Supabase único por contexto
- **Browser**: `getSupabaseBrowser()` en `src/lib/supabase-browser.ts` — singleton, PKCE
- **Server**: `getSupabaseServer()` en `src/lib/supabase-helpers.ts` — instancia por request
- **Admin**: `getSupabaseAdmin()` en `src/lib/supabase-admin.ts` — service role, solo server-side

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

## Anti-patrones prohibidos

- ❌ `ignoreBuildErrors: true` en tsconfig
- ❌ Cliente Supabase múltiple (browser singleton)
- ❌ `middleware.ts` — renombrado a `proxy.ts` en Next.js 16
- ❌ Operaciones DB sin await + try/catch + logging
- ❌ Escalada de privilegios (protegida por trigger)
- ❌ `next lint` — removido en Next.js 16, usar `eslint` directamente
- ❌ `next build` sin `--webpack` (Turbopack es default en v16, nosotros usamos webpack)
- ❌ Recuperación/cambio de contraseña en código (administrada manualmente)
- ❌ Datos sensibles en Client Components sin `taint`
