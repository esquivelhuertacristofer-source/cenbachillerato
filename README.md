# CEN Bachillerato

Plataforma educativa para bachillerato alineada al Marco Curricular Común de la
Educación Media Superior (MCCEMS) del Modelo 2025 (Nueva Escuela Mexicana). El
contenido se organiza por semestre → UAC → progresión → actividad, e incluye
laboratorios 3D interactivos.

Es **multi-tenant**: cada usuario pertenece a una escuela, con los roles
`student`, `teacher` (docente), `admin` (administrador escolar) y `super_admin`.
El aislamiento entre escuelas se aplica con Row Level Security (RLS) en Supabase.

> **Nota importante sobre Next.js** — este proyecto usa Next.js 16 con Turbopack.
> Hay cambios de API y de convenciones respecto a versiones anteriores (por
> ejemplo `middleware.ts` ahora es `proxy.ts`). Antes de escribir código lee la
> guía correspondiente en `node_modules/next/dist/docs/`. Ver [AGENTS.md](AGENTS.md).

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** (con React Compiler)
- **Supabase** — Auth + Postgres con RLS (`@supabase/ssr` para el cliente con
  sesión de usuario; cliente admin con `service_role` para operaciones que
  omiten RLS del lado servidor)
- **Cloudflare Workers** vía `@opennextjs/cloudflare` (caché en KV, almacenamiento
  en R2, rate limiting). El plan de despliegue es Cloudflare, **no** Vercel.
- **three.js** + `@react-three/fiber` + `@react-three/drei` — laboratorios 3D
- **Zod** — validación de entradas en los Server Actions
- **Tailwind CSS**, **jsPDF**
- **TypeScript** en modo estricto

## Requisitos

- Node.js (versión compatible con Next 16) y npm
- Un proyecto de **Supabase** (URL + claves)
- Para desplegar: cuenta de **Cloudflare** y `wrangler` (ya incluido como devDep)

## Puesta en marcha

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia el archivo de ejemplo de variables de entorno y complétalo con las
   credenciales de tu proyecto de Supabase:

   ```bash
   cp .env.example .env.local
   ```

   Variables obligatorias: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

3. Aplica las migraciones de base de datos. Los archivos viven en
   [`supabase/migrations/`](supabase/migrations/) y se ejecutan **manualmente**
   en el SQL Editor de Supabase, en orden. Las políticas de RLS son delicadas y
   protegen datos de personas menores de edad: revísalas antes de aplicarlas y
   nunca las corras de forma automatizada contra producción.

4. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

   Para los usuarios de prueba en local, consulta [`docs/DEMO-USERS.md`](docs/DEMO-USERS.md).

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint sobre `src/` |
| `npm run typecheck` | `tsc --noEmit` (chequeo de tipos) |
| `npm run test` | Suite de pruebas (Jest) |
| `npm run test:watch` | Jest en modo watch |
| `npm run test:coverage` | Jest con reporte de cobertura |
| `npm run pages:build` | Build para Cloudflare (`@opennextjs/cloudflare`) |
| `npm run pages:dev` | Vista previa local del artefacto de Cloudflare |
| `npm run pages:deploy` | Despliegue a Cloudflare Workers |

## Puertas de calidad antes de desplegar

Los cuatro comandos deben salir en verde antes de un despliegue:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint src/
npm run test        # jest
npm run build       # next build
```

## Estructura del proyecto

```
src/
  app/         Rutas del App Router (páginas y layouts)
  components/  Componentes de UI (incluye actividades y laboratorios 3D)
  context/     Providers de React
  data/        Catálogo curricular y datos de contenido
  lib/         Server Actions, helpers de Supabase, esquemas Zod, utilidades
  types/       Tipos compartidos
scripts/       Scripts de mantenimiento y publicación de contenido (ejecutados con tsx)
supabase/
  migrations/  Migraciones SQL (se aplican manualmente en el SQL Editor)
public/        Assets estáticos
docs/          Documentación del proyecto
```

## Documentación

- [AGENTS.md](AGENTS.md) — nota sobre Next.js 16
- [docs/GUIA-DESARROLLO.md](docs/GUIA-DESARROLLO.md) — guía de desarrollo
- [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) — arquitectura
- [docs/MODELO-DE-DATOS.md](docs/MODELO-DE-DATOS.md) — modelo de datos
- [docs/DEUDA-TECNICA.md](docs/DEUDA-TECNICA.md) — deuda técnica conocida
