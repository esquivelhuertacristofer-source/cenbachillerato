# Avances — Noche Día 1 / Día 2

> **Nota de nomenclatura:** Este doc cubre el trabajo realizado en la sesión que empezó con el commit `1eadd6c` (migración a Cloudflare) y cerró con `9bac319` (contenido funcional). En el ROADMAP aparece como "Semana 1, Días 2-5".

---

## Resumen ejecutivo

En esta sesión se resolvieron 3 problemas de infraestructura críticos (lock file desincronizado × 3 intentos) y se implementaron las Fases 1-7 de la lista de trabajo. El proyecto pasó de tener todas las páginas con placeholders estáticos a tener datos reales de Supabase en hub, dashboard docente y módulo admin. Se sembró el currículum MCCEMS completo (39 UAC, 402 progresiones placeholder) en la DB.

---

## Tabla de estado por fase

| Fase | Descripción | Status | Tiempo estimado | Archivos modificados | Tests agregados |
|------|-------------|--------|-----------------|---------------------|-----------------|
| Infra | Migración Vercel → Cloudflare Workers | ✅ Completo | 2h | open-next.config.ts, wrangler.toml, package.json, .npmrc | 0 |
| 1 | Script create-demo-users + tests | ✅ Completo | 1h | scripts/create-demo-users.ts, scripts/__tests__/create-demo-users.test.ts | 14 |
| 2 | Hub estudiantil con queries reales | ✅ Completo | 30min | src/lib/queries/uac.ts, hub/uac/[codigo]/page.tsx | 0 |
| 3 | Dashboard docente con datos reales | ✅ Completo | 30min | src/lib/queries/docente.ts, dashboard/docente/page.tsx | 0 |
| 4 | Módulo admin funcional | ✅ Completo | 45min | admin/layout.tsx, admin/escuelas, admin/grupos, admin/usuarios | 0 |
| 5 | Login + redirección por rol | ✅ Parcial | — | (ya implementado en Día 1; proxy.ts descartado — ver DECISIONES-PENDIENTES.md) | 0 |
| 6 | Seed MCCEMS real | ✅ Completo | 45min | scripts/seed-mccems.ts | 0 |
| 7 | Testing integral + builds | ✅ Completo | 30min | jest.config.ts (bugfix) | — |
| 8 | Documentación | ⚠️ Parcial | — | docs/DEMO-USERS.md, _diagnostico-dia2.log | — |

---

## Métricas

| Métrica | Valor |
|---------|-------|
| Total commits esta sesión | 5 (3 fix lock file + 1 infra + 1 contenido) |
| Total tests en el proyecto | 14 (todos pasando) |
| Líneas de código (src/ + scripts/) | 4,270 |
| UAC sembradas en DB | 39 |
| Progresiones sembradas en DB | 402 (todas placeholder — ver INVENTARIO-PROGRESIONES.md) |
| Usuarios demo en DB | 12 |
| Escuelas en DB | 1 (DEMO-001) |
| Grupos en DB | 1 |

---

## Funcionalidades nuevas y cómo probarlas

### 1. Login con redirección por rol

**Cómo probar:** Ir a `/log-in` y usar cada credencial de DEMO-USERS.md.

| Credencial | Redirige a | Qué se ve |
|-----------|-----------|-----------|
| admin@cenbachillerato-demo.com / Demo2026! | /admin/escuelas | Tabla con 1 escuela (DEMO-001) |
| docente@cenbachillerato-demo.com / Demo2026! | /dashboard/docente | Métricas: 10 alumnos, 1 grupo, semestre 1° |
| alumno1@cenbachillerato-demo.com / Demo2026! | /hub | Hub semestre 1 con 5 UAC |

### 2. Hub estudiantil con UAC reales

**Cómo probar:** Login como alumno → `/hub` → click en cualquier UAC.

- `/hub`: muestra 5 UAC del semestre 1 (datos estáticos MCCEMS, perfil desde DB)
- `/hub/uac/LC-I`: lista 10 progresiones desde DB (placeholder, pero reales en DB)
- `/hub/uac/PM-I`: lista 10 progresiones matemáticas
- Sidebar muestra nombre real del alumno y semestre desde profile en DB

### 3. Dashboard docente con métricas reales

**Cómo probar:** Login como docente → `/dashboard/docente`.

- Tarjetas: "10 alumnos activos", "1 grupo asignado", "1 semestre en curso"
- Tabla de grupos: "Grupo 1A Demo — Semestre 1 — 10 alumnos"

### 4. Admin con datos reales

**Cómo probar:** Login como admin → navegar entre las 3 secciones.

- `/admin/escuelas`: tabla con "Escuela Demo CEN Bachillerato", CCT=DEMO-001, subsistema=particular
- `/admin/grupos`: tabla con "Grupo 1A Demo", semestre 1, docente=Docente Demo
- `/admin/usuarios`: 10 alumnos + 1 docente + 1 admin con badges de rol

### 5. Seed scripts (para operaciones de mantenimiento)

```bash
# Crear/repoblar usuarios demo
npx tsx scripts/create-demo-users.ts

# Re-sembrar estructura curricular MCCEMS
npx tsx scripts/seed-mccems.ts
```

Ambos son idempotentes.

---

## Bugs encontrados durante la sesión

Ver `docs/BUGS-DESCUBIERTOS-NOCHE.md` para detalle completo.

Resumen: 4 bugs encontrados y resueltos en el momento (P0). 2 gaps documentados como P2.
