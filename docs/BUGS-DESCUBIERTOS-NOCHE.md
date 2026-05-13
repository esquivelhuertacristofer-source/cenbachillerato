# Bugs Descubiertos — Noche Día 1 / Sesión Día 2

> Prioridades: P0 = bloqueante (resuelto antes de commit), P1 = importante, P2 = menor/cosmético

---

## P0 — Resueltos en el momento

### BUG-001: Lock file desincronizado (× 3 intentos en Cloudflare)
**Síntoma:** `npm ci` en Cloudflare falla con "package.json and package-lock.json are out of sync"
**Causa raíz:** `legacy-peer-deps=true` en `C:\Users\crist\.npmrc` global. webpack es peer dep de eslint-config-next y nunca se escribía al lock file con esta configuración.
**Fix:** Proyecto `.npmrc` con `legacy-peer-deps=false`. Regenerar lock file. 
**Status:** ✅ Resuelto. Commit `0a51521`.

---

### BUG-002: Entry point guard roto en Windows
**Síntoma:** `npx tsx scripts/create-demo-users.ts` no producía output.
**Causa:** La condición `import.meta.url === \`file://${process.argv[1]}\`` falla en Windows porque:
- `process.argv[1]` = `C:\Users\...` (backslashes)
- `import.meta.url` = `file:///C:/Users/...` (forward slashes + triple slash para drives Windows)
**Fix:** `pathToFileURL(process.argv[1]).href` normaliza correctamente. Aplica también a `seed-mccems.ts`.
**Status:** ✅ Resuelto.

---

### BUG-003: Jest testMatch con path `.gemini` en Windows
**Síntoma:** Jest reporta 0 tests encontrados aunque los archivos existen.
**Causa:** `<rootDir>` se expande a `C:/Users/crist\.gemini/...` — la `\.` es interpretada como un escape en micromatch (el engine de glob de Jest), no como separador de directorio. El pattern nunca coincide con los archivos reales.
**Fix:** Cambiar `testMatch` por `testRegex: "(src|scripts)/.*\\.test\\.(ts|tsx)$"`. El engine de regex no tiene este problema con rutas Windows.
**Status:** ✅ Resuelto.

---

### BUG-004: `noUncheckedIndexedAccess` causa TS2532 en tests
**Síntoma:** TypeScript error en `users[0].role` — "Object is possibly 'undefined'".
**Causa:** `tsconfig.json` tiene `noUncheckedIndexedAccess: true`. Los array accesses por índice devuelven `T | undefined`.
**Fix:** `const admin = users[0]; expect(admin?.role).toBe(...)` — optional chaining, o asignar a variable tipada antes.
**Status:** ✅ Resuelto.

---

### BUG-005: proxy.ts bloquea Cloudflare Workers build
**Síntoma:** `npm run pages:build` falla con "Node.js middleware is not currently supported."
**Causa:** Next.js 16 cambió el runtime default del proxy de Edge a Node.js. @opennextjs/cloudflare 1.19.9 solo soporta Edge runtime para middleware/proxy.
**Fix:** Eliminar `proxy.ts`. Auth guards en layouts son suficientes.
**Status:** ✅ Resuelto (con trade-off documentado en DECISIONES-PENDIENTES.md).

---

## P1 — Documentados, requieren acción

### BUG-006: Progresiones sin flag `es_placeholder`
**Síntoma:** Las 402 progresiones sembradas son todos placeholders, pero no hay forma de distinguirlas de progresiones reales en la DB.
**Causa:** El schema `progresiones` no tiene columna `es_placeholder`. El pedido original lo requería.
**Impacto:** Cuando se agregue contenido real, no habrá forma de filtrar "mostrar solo reales" sin un criterio frágil como `descripcion IS NULL`.
**Fix pendiente:** Migración SQL: `ALTER TABLE progresiones ADD COLUMN es_placeholder boolean DEFAULT true;` + actualizar seed + actualizar queries que renderizan progresiones.
**Status:** 🔴 Pendiente — acción requerida en la próxima sesión antes de agregar contenido real.

---

### BUG-007: Doble query auth por request (layout + page)
**Síntoma:** No es un bug visible, pero sí un problema de performance. El `hub/layout.tsx` llama `getUser() + getProfile()`. La `hub/page.tsx` llama `getUser() + getProfile()` de nuevo.
**Causa:** React Server Components no comparten estado entre layout y page sin un mecanismo explícito (como RSC cache o `cache()` de React).
**Impacto:** 2 queries de auth por cada request al hub (4 si se cuenta la page). En Cloudflare Workers con latencia de red a Supabase, esto suma.
**Fix posible:** Usar `cache()` de React para deduplicar. La función `getProfile()` wrapeada con `cache()` devuelve el mismo objeto en el mismo request.
**Status:** 🟡 P1 — optimización, no bloqueante.

---

## P2 — Menores

### BUG-008: `WARN workerd compatibility_date: 2025-05-12`
**Síntoma:** El build de Cloudflare advierte que `compatibility_date` en `wrangler.toml` es viejo.
**Fix:** Actualizar `compatibility_date` en `wrangler.toml` a la fecha actual (o una reciente).
**Status:** 🟢 P2 — cosmético.

---

### BUG-009: Admin/grupos muestra "Docente sin perfil" si el trigger falló
**Síntoma:** Potencial — si el trigger `on_auth_user_created` no crea el perfil del docente correctamente, la página admin/grupos mostrará "Docente sin perfil" en lugar del nombre.
**Causa:** El mapeo de `docenteMap` usa `g.id_docente` para buscar en los perfiles de teachers. Si el profile no existe, retorna `undefined`.
**Verificación necesaria:** Confirmar que el perfil del docente demo tiene `role = 'teacher'` y que la query en admin/grupos lo incluye.
**Status:** 🟢 P2 — verificar en smoke test.

---

### BUG-010: `hub/layout.tsx` doble verificación innecesaria
**Síntoma:** `hub/layout.tsx` llama `getUser()` y luego `getProfile()`. También verifica el rol. Pero `hub/page.tsx` también llama `getUser()` y `getProfile()` para obtener el semestre.
**Fix a futuro:** Implementar `getProfile()` con `React.cache()` para que la segunda llamada use el caché del mismo request.
**Status:** 🟢 P2.
