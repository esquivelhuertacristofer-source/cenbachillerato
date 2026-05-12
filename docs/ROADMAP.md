# Roadmap — CEN Bachillerato (6 semanas)

## Entregable principal
- **Semanas 1-3**: CEN Bachillerato → Entrega + cobro $100k MXN
- **Semanas 4-6**: CEN Educación Básica (NEM) → Reutiliza la base de Bachillerato

---

## Semana 1 — Fundación (actual)
**Estado: En progreso**

### Completado hoy (Día 1)
- [x] Proyecto Next.js 16 creado con stack completo
- [x] TypeScript strict, Jest + RTL, GitHub Actions CI
- [x] Schema Supabase con RLS, triggers y seed MCCEMS
- [x] Datos curriculares MCCEMS en TypeScript (`src/lib/mccems/`)
- [x] Landing principal CEN (portfolio de productos)
- [x] Landing Bachillerato (propuesta de valor + estructura MCCEMS)
- [x] Login funcional con Supabase (consentimiento legal integrado)
- [x] Hub estudiantil navegable (sidebar + UAC + progresiones placeholder)
- [x] Dashboard docente estructurado (placeholders)
- [x] Secciones Admin (escuelas, grupos, usuarios — placeholders)
- [x] Páginas legales (privacidad LFPDPPP + términos — en revisión legal)
- [x] Documentación: ARQUITECTURA, MODELO-DE-DATOS, ROADMAP, MANIFIESTO

### Resto de la Semana 1 (Días 2-5)
- [ ] Conectar repo a GitHub y Supabase con credenciales reales
- [ ] Ejecutar migración SQL en Supabase proyecto `cen-bachillerato`
- [ ] Primer deploy en Vercel con variables de entorno
- [ ] Smoke test: login → hub → UAC → progresion funciona end-to-end
- [ ] Proxy (proxy.ts) para manejo de sesión SSR
- [ ] Auth store con Zustand para estado global del usuario
- [ ] Sentry configurado y enviando errores a dashboard

---

## Semana 2 — Contenido y gestión
- [ ] Alta masiva de alumnos por CSV
- [ ] Gestión de grupos en /admin/grupos
- [ ] Asignación docente-grupo-UAC
- [ ] Dashboard docente con métricas reales (alumnos, progreso)
- [ ] Progresiones de aprendizaje reales en DB (mínimo 2 UAC completas)
- [ ] Al menos 1 tipo de actividad funcional (quiz múltiple opción)
- [ ] Registro de intentos con score básico
- [ ] Tests: cobertura >60% en componentes críticos (login, hub, sidebar)

---

## Semana 3 — Validación + Entrega Bachillerato
- [ ] QA interno completo (flujo alumno → docente → admin)
- [ ] Revisión legal de aviso de privacidad y términos
- [ ] Reporte de progreso docente (exportable PDF básico)
- [ ] Onboarding de la primera escuela piloto en producción
- [ ] Entrega formal al cliente + cobro $100k MXN
- [ ] Documentación de usuario final (PDF)

---

## Semanas 4-5 — CEN Educación Básica (NEM)
- [ ] Fork/branch del proyecto base
- [ ] Adaptar schema: primaria y secundaria (NEM)
- [ ] Nuevo seed curricular NEM (grados 1-6 primaria, 1-3 secundaria)
- [ ] Landing específica Educación Básica
- [ ] Hub estudiantil adaptado a NEM (materias, campos formativos)
- [ ] Reutilizar 80% de componentes de Bachillerato

---

## Semana 6 — Entrega Educación Básica
- [ ] QA Educación Básica
- [ ] Deploy producción
- [ ] Onboarding primera escuela de básica
- [ ] Entrega formal

---

## Hitos verificables por semana

| Semana | Hito | Criterio |
|--------|------|---------|
| 1 | Fundación lista | Build verde, CI verde, deploy en Vercel, login funciona |
| 2 | Primera UAC completa | Alumno completa actividad y ve score |
| 3 | Entrega Bachillerato | Escuela piloto operando, cliente firma |
| 4 | Básica iniciada | Schema NEM corriendo, landing lista |
| 5 | Hub básica funcional | Alumno navega materias NEM |
| 6 | Entrega Educación Básica | Segunda escuela piloto operando |
