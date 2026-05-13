# Usuarios Demo — CEN Bachillerato

Credenciales para entorno de desarrollo/demo. Todos los usuarios están en Supabase proyecto `xmcfuwdanlciqdxqtslv`.

## Escuela y grupo demo

| Campo | Valor |
|-------|-------|
| Nombre escuela | Escuela Demo CEN Bachillerato |
| CCT | DEMO-001 |
| Subsistema | particular |
| Nombre grupo | Grupo 1A Demo |
| Semestre | 1 |

## Credenciales

| Email | Role | Nombre | Password |
|-------|------|--------|----------|
| admin@cenbachillerato-demo.com | admin | Admin Demo | Demo2026! |
| docente@cenbachillerato-demo.com | teacher | Docente Demo | Demo2026! |
| alumno1@cenbachillerato-demo.com | student | Alumno Uno | Demo2026! |
| alumno2@cenbachillerato-demo.com | student | Alumno Dos | Demo2026! |
| alumno3@cenbachillerato-demo.com | student | Alumno Tres | Demo2026! |
| alumno4@cenbachillerato-demo.com | student | Alumno Cuatro | Demo2026! |
| alumno5@cenbachillerato-demo.com | student | Alumno Cinco | Demo2026! |
| alumno6@cenbachillerato-demo.com | student | Alumno Seis | Demo2026! |
| alumno7@cenbachillerato-demo.com | student | Alumno Siete | Demo2026! |
| alumno8@cenbachillerato-demo.com | student | Alumno Ocho | Demo2026! |
| alumno9@cenbachillerato-demo.com | student | Alumno Nueve | Demo2026! |
| alumno10@cenbachillerato-demo.com | student | Alumno Diez | Demo2026! |

## Recrear usuarios

```bash
npx tsx scripts/create-demo-users.ts
```

El script es idempotente: re-ejecutar muestra `YA EXISTÍA` sin duplicar datos.

## Notas

- Todos los alumnos están asignados a Grupo 1A Demo (semestre 1).
- El docente está asignado como `id_docente` en ese grupo.
- Los emails usan el dominio `@cenbachillerato-demo.com` (no real) para evitar colisiones con cuentas reales.
- **No compartir estas credenciales fuera del equipo de desarrollo.**
