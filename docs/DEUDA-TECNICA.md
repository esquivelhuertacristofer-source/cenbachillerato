# Deuda Técnica — CEN Bachillerato

> Registra deuda técnica conocida, su impacto y el camino de resolución. No bloquea el uso de la plataforma salvo donde se indica.

---

## DT-001: `database.types.ts` desactualizado tras migración 02

**Estado:** 🔴 Activo  
**Impacto:** Medio — La columna `es_placeholder` existe en la DB pero no en los tipos TypeScript generados. El seed usa el DEFAULT de la DB en lugar de tiparlo explícitamente.

**Causa:** `database.types.ts` fue generado antes de ejecutar la migración 02. Para regenerarlo se requiere acceso a la CLI de Supabase autenticada con el proyecto.

**Resolución:**
```bash
npx supabase login
npx supabase gen types typescript \
  --project-id xmcfuwdanlciqdxqtslv \
  --schema public \
  > src/types/database.types.ts
```

**Cuándo resolver:** Antes de escribir código que filtre por `es_placeholder` en TypeScript.

---

## DT-002: Sin Content Security Policy (CSP)

**Estado:** 🟡 Pendiente  
**Impacto:** Bajo-Medio — Sin CSP, un XSS podría cargar scripts externos. Los headers básicos (X-Frame-Options, X-Content-Type-Options) están implementados, pero CSP requiere mapear todas las fuentes externas.

**Causa:** CSP es complejo de configurar sin romper Supabase Realtime, Sentry, y los scripts inline de Next.js.

**Resolución propuesta:**
1. Agregar `Content-Security-Policy` en `next.config.ts` con modo report-only (`Content-Security-Policy-Report-Only`) para detectar violaciones sin romper nada.
2. Ajustar las directivas iterativamente en base a los reportes.
3. Promover a modo enforcing cuando no haya violaciones.

**Cuándo resolver:** Antes de lanzamiento público (beta cerrada no es urgente).

---

## DT-003: ISR no implementado — cada request re-renderiza Server Components

**Estado:** 🟢 Aceptado  
**Impacto:** Bajo — Los datos curriculares del MCCEMS son estáticos (mismos para todos los usuarios del mismo semestre). Sin ISR/cache, cada request al hub re-ejecuta los Server Components.

**Causa:** La configuración de caché en `open-next.config.ts` usa `"dummy"` por simplicidad. ISR con Cloudflare KV requiere configuración adicional.

**Resolución:** Agregar `export const revalidate = 3600;` a páginas con datos mayormente estáticos (hub/semestre/[num]). Configurar Cloudflare KV para tag-based cache invalidation.

**Cuándo resolver:** Con 1000+ usuarios concurrentes se empezará a notar la latencia.

---

## DT-004: Sin tests de integración para flujos de autenticación

**Estado:** 🟡 Pendiente  
**Impacto:** Medio — Los tests actuales (123 tests unitarios) cubren lib/ y components/ pero no el flujo completo login → hub → navegación.

**Causa:** Los tests de integración requieren Playwright/Cypress y un entorno de Supabase staging. No implementados en la auditoría inicial.

**Resolución:** Agregar Playwright con 3-5 tests E2E críticos:
1. Login exitoso → redirige al hub
2. Login fallido → mensaje de error
3. Usuario no autenticado → redirige a /log-in
4. Alumno ve sus UAC del semestre correcto

**Cuándo resolver:** Antes de la primera demo con usuarios reales (Semana 2).

---

## DT-005: `Progresion.categoria` y `Progresion.subcategoria` sin uso

**Estado:** 🟢 Aceptado  
**Impacto:** Ninguno funcional — Las columnas existen en el schema pero no se usan en el seed ni en el UI.

**Causa:** Fueron diseñadas para una futura categorización de progresiones (p.ej. "conceptual", "procedimental"). No hay contenido real todavía.

**Resolución:** Cuando se cargue contenido real de progresiones, decidir si estas columnas tienen utilidad o si se eliminan.

**Cuándo resolver:** Cuando el cliente provea los programas de estudio reales.

---

## DT-006: `SemestreData.area_uacs` tipado como opcional pero sin implementación

**Estado:** 🟢 Aceptado  
**Impacto:** Ninguno — `SemestreData` en `domain.types.ts` tiene `area_uacs?: UAC[]` pero no hay lógica de CFE electivas implementada. El UI ya no muestra secciones de CFE.

**Resolución:** Eliminar `area_uacs` del type cuando se confirme que CFE electivas no se implementarán, o implementarlas correctamente cuando el cliente lo requiera.

**Cuándo resolver:** Decisión del cliente sobre CFE electivas (ver DECISIONES-PENDIENTES.md).
