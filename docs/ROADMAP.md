# Roadmap — CEN Bachillerato (6 semanas)

## Entregable principal
- **Semanas 1-3**: CEN Bachillerato → Entrega + cobro $100k MXN
- **Semanas 4-6**: CEN Educación Básica (NEM) → Reutiliza la base de Bachillerato

---

## Semana 1 — Fundación
**Estado: ~85% completado**

### ✅ Completado — Día 1 (commit d8d2756)
- [x] Proyecto Next.js 16 con stack completo (TypeScript strict, Tailwind 4, Zustand 5, Jest 30)
- [x] Schema Supabase con RLS, triggers y funciones de seguridad
- [x] Datos curriculares MCCEMS en TypeScript (`src/lib/mccems/`)
- [x] Landing principal CEN (portfolio de productos)
- [x] Landing Bachillerato (propuesta de valor + estructura MCCEMS)
- [x] Login funcional con Supabase (consentimiento legal integrado)
- [x] Hub estudiantil navegable (sidebar + UAC + progresiones)
- [x] Dashboard docente estructurado
- [x] Secciones Admin (escuelas, grupos, usuarios)
- [x] Páginas legales (privacidad LFPDPPP + términos)
- [x] Documentación inicial: ARQUITECTURA, MODELO-DE-DATOS, ROADMAP, MANIFIESTO
- [x] GitHub Actions CI (lint + typecheck + test + build)

### ✅ Completado — Días 2-3 (commits 1eadd6c, 0a51521, 9bac319)
- [x] Migración a Cloudflare Workers con @opennextjs/cloudflare
- [x] Fix lock file definitivo (proyecto .npmrc con legacy-peer-deps=false)
- [x] Schema SQL ejecutado en Supabase proyecto xmcfuwdanlciqdxqtslv
- [x] 12 usuarios demo creados en Supabase (create-demo-users.ts)
- [x] Seed MCCEMS completo: 39 UAC + 402 progresiones placeholder en DB
- [x] Hub estudiantil con queries reales (progresiones desde DB)
- [x] Dashboard docente con métricas reales (alumnos, grupos, semestres)
- [x] Admin con datos reales (escuelas, grupos, usuarios desde DB)
- [x] Auth guards en layouts (admin solo admin/super_admin, hub solo student)
- [x] Login redirige por rol al destino correcto
- [x] Documentación: DEMO-USERS, AVANCES-NOCHE, DECISIONES-PENDIENTES, BUGS, INVENTARIO-PROGRESIONES

### ❌ Pendiente Semana 1
- [ ] **Conectar repo a Cloudflare** (Workers & Pages → Connect to Git). La URL de producción no está activa.
- [ ] **GitHub Secrets** configurados (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.)
- [ ] **Smoke test end-to-end en producción** (login → hub → UAC → progresión)
- [ ] **Flag `es_placeholder`** en tabla progresiones (BUG-006)
- [ ] Auth store con Zustand para estado global del usuario
- [ ] Sentry DSN configurado

---

## Semana 2 — Contenido y gestión
**Estado: No iniciado**

- [ ] Alta masiva de alumnos por CSV (Server Action + Zod)
- [ ] Gestión de grupos en /admin/grupos (crear, editar, asignar docente)
- [ ] Asignación docente-grupo-UAC
- [ ] **Progresiones reales en DB** (mínimo LC-I y PM-I completas — requiere material del cliente)
- [ ] Al menos 1 tipo de actividad funcional (quiz múltiple opción)
- [ ] Registro de intentos con score básico
- [ ] Tests: cobertura >60% en login, hub, sidebar (actualmente 0% en src/)
- [ ] Decidir y resolver estrategia proxy.ts (ver DECISIONES-PENDIENTES.md)
- [ ] `React.cache()` en `getProfile()` para eliminar doble query por request (BUG-007)

---

## Semana 3 — Validación + Entrega Bachillerato
**Estado: No iniciado**

- [ ] QA interno completo (flujo alumno → docente → admin)
- [ ] Revisión legal de aviso de privacidad y términos
- [ ] Reporte de progreso docente (exportable PDF básico)
- [ ] Onboarding de la primera escuela piloto en producción
- [ ] Entrega formal al cliente + cobro $100k MXN
- [ ] Documentación de usuario final (PDF)

---

## Semanas 4-5 — CEN Educación Básica (NEM)
**Estado: No iniciado**

- [ ] Fork/branch del proyecto base
- [ ] Adaptar schema: primaria y secundaria (NEM)
- [ ] Nuevo seed curricular NEM (grados 1-6 primaria, 1-3 secundaria)
- [ ] Landing específica Educación Básica
- [ ] Hub estudiantil adaptado a NEM (materias, campos formativos)
- [ ] Reutilizar 80% de componentes de Bachillerato

---

## Semana 6 — Entrega Educación Básica
**Estado: No iniciado**

- [ ] QA Educación Básica
- [ ] Deploy producción
- [ ] Onboarding primera escuela de básica
- [ ] Entrega formal

---

## Hitos verificables por semana

| Semana | Hito | Criterio | Estado |
|--------|------|---------|--------|
| 1 | Fundación lista | Build verde, CI verde, deploy activo, login funciona | ⚠️ Deploy pendiente |
| 2 | Primera UAC completa | Alumno completa actividad y ve score | No iniciado |
| 3 | Entrega Bachillerato | Escuela piloto operando, cliente firma | No iniciado |
| 4 | Básica iniciada | Schema NEM corriendo, landing lista | No iniciado |
| 5 | Hub básica funcional | Alumno navega materias NEM | No iniciado |
| 6 | Entrega Educación Básica | Segunda escuela piloto operando | No iniciado |

---

## Velocidad actual (referencia)

| Período | Trabajo hecho |
|---------|---------------|
| Día 1 (sesión ~4h) | Fundación completa: 45+ archivos, CI, schema, todas las pages base |
| Día 2 (sesión ~6h) | Infra Cloudflare + 8 fases de contenido + seed MCCEMS + docs |
| **Total acumulado** | 6 commits, 4,270 líneas, 14 tests, 39 UAC + 402 progresiones en DB |
