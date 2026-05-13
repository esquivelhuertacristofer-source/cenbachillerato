# Guía de Desarrollo — CEN Bachillerato

## Prerequisitos

- Node.js 20+
- npm (no pnpm ni yarn — CI usa npm ci)
- Cuenta en Supabase con acceso al proyecto `xmcfuwdanlciqdxqtslv`
- Cuenta en Cloudflare con acceso al worker `cen-bachillerato`

---

## Setup inicial

```bash
# 1. Clonar e instalar
git clone <repo>
cd cen-bachillerato
npm install

# 2. Variables de entorno
cp .env.example .env.local   # si no existe, crearlo manualmente
# Editar .env.local con los valores reales:
# NEXT_PUBLIC_SUPABASE_URL=https://xmcfuwdanlciqdxqtslv.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key de Supabase Dashboard>
# SUPABASE_SERVICE_ROLE_KEY=<service role key — solo para scripts, nunca al browser>

# 3. Verificar que todo funciona
npm run typecheck
npm test
npm run dev
```

---

## Comandos disponibles

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Dev server (Next.js con Turbopack) |
| `npm run build` | Build de producción Next.js |
| `npm run lint` | ESLint sobre src/ |
| `npm run typecheck` | TypeScript sin emitir archivos |
| `npm test` | Jest (todos los tests) |
| `npm run test:watch` | Jest en modo watch |
| `npm run test:coverage` | Jest con reporte de cobertura |
| `npm run pages:build` | Build para Cloudflare Workers |
| `npm run pages:dev` | Preview local con Wrangler |
| `npm run pages:deploy` | Deploy a Cloudflare Workers |

---

## Flujo de trabajo diario

### Cambios al código TypeScript / componentes

```bash
npm run typecheck   # verificar antes de commitear
npm test            # CI falla si tests fallan
```

### Cambios al schema de la DB

1. Escribir la migración en `supabase/migrations/0N_nombre.sql`
2. Ejecutarla manualmente en Supabase SQL Editor (o con `supabase db push` si tienes la CLI)
3. Regenerar los tipos TypeScript:
   ```bash
   npx supabase gen types typescript \
     --project-id xmcfuwdanlciqdxqtslv \
     --schema public \
     > src/types/database.types.ts
   ```
4. Actualizar el seed si es necesario: `npx tsx scripts/seed-mccems.ts`

### Cambios a datos curriculares (MCCEMS)

Los datos viven en `src/lib/mccems/`:
- `estructura.ts` — UAC_BASE y RECURSOS_SOCIOEMOCIONALES
- `recursos-sociocognitivos.ts` — RECURSOS_SOCIOCOGNITIVOS
- `areas-conocimiento.ts` — AREAS_CONOCIMIENTO

Después de cambiar, correr los tests de validación:
```bash
npx jest scripts/__tests__/validate-mccems-structure.test.ts
```

---

## Estructura del proyecto

```
src/
├── app/                    # Next.js App Router pages (Server Components)
│   ├── hub/                # Hub estudiantil (role: student)
│   ├── dashboard/docente/  # Dashboard del docente
│   ├── admin/              # Panel administrativo
│   └── ...
├── components/
│   ├── hub/               # Componentes del hub estudiantil
│   ├── ui/                # Componentes UI reutilizables (Button, Card, Input)
│   ├── shared/            # Header, FooterLegal, ProtectedRoute
│   └── landing-*/         # Componentes de las landing pages
├── lib/
│   ├── supabase-admin.ts  # Cliente admin (service role, server-only)
│   ├── supabase-browser.ts # Cliente browser (singleton)
│   ├── supabase-helpers.ts # getUser(), getProfile(), getSession()
│   ├── queries/           # Queries de negocio (getGruposDocente, getProgresionesDeUAC)
│   └── mccems/            # Datos curriculares estáticos del MCCEMS
└── types/
    ├── database.types.ts  # Generado por Supabase CLI (no editar manualmente)
    └── domain.types.ts    # Tipos derivados + tipos de dominio custom
```

---

## Convenciones

### Componentes

- Por defecto: Server Components (sin `"use client"`)
- Agregar `"use client"` solo para: hooks de estado, event handlers, browser APIs
- Nombrar archivos en PascalCase para componentes: `UACCard.tsx`
- No crear componentes de una sola línea que solo wrapen un elemento

### Supabase en Server Components

```tsx
// ✅ Correcto — await getUser() / getProfile() son cacheados por React
const user = await getUser();
const profile = await getProfile(user.id);

// ❌ Incorrecto — no crear instancias del cliente directamente en páginas
const sb = createClient(...);
```

### Tests

- Tests de unidad en `src/**/__tests__/` (extensión `.test.ts` o `.test.tsx`)
- Tests de scripts en `scripts/__tests__/`
- Mock de `getSupabaseServer` con el patrón de chain establecido en `uac.test.ts`
- Sin snapshots — assertions explícitas
- Sin `@testing-library/user-event` para eventos simples que no requieren simulación real

### TypeScript

- `noUncheckedIndexedAccess: true` → usar optional chaining en array accesses
- No usar `as any` — si TypeScript no puede inferir el tipo, agregar un type assertion con comentario
- Los datos del MCCEMS son `as const` cuando sea posible

---

## Agregar progresiones reales

Cuando el cliente provea los programas de estudio:

1. Crear `scripts/import-progresiones.ts` basado en el script de seed
2. Para cada UAC: generar progresiones con `es_placeholder = false`, `titulo` y `descripcion` reales
3. Usar upsert por `codigo` para ser idempotente
4. Actualizar las UI de `hub/uac/[codigo]/page.tsx` para filtrar por `es_placeholder`

---

## Depuración en producción

Los errores en Server Components y API routes van a **Sentry** (instalado, DSN pendiente de configurar).

Para ver logs del Worker en producción:
```bash
npx wrangler tail --name cen-bachillerato
```

Para revisar el estado de la DB directamente:
- Supabase Dashboard → proyecto → SQL Editor
- Supabase Dashboard → Table Editor
