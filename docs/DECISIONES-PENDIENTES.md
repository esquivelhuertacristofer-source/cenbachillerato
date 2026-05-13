# Decisiones Pendientes — CEN Bachillerato

> Documento de arquitectura y trade-offs. Actualizar después de cada sesión de trabajo. Las decisiones marcadas con 🔴 requieren input del usuario antes de continuar.

---

## 🔴 DECISIÓN 1: Estrategia de auth en el edge (proxy.ts vs layouts)

**Contexto:** Next.js 16 renombró `middleware.ts` a `proxy.ts` y cambió su runtime default a Node.js. @opennextjs/cloudflare 1.19.9 solo soporta Edge runtime para el proxy. Resultado: el proxy se construye pero el Cloudflare build falla con "Node.js middleware is not currently supported."

**Lo que se implementó:** Auth guards en Server Component layouts (hub/layout.tsx, admin/layout.tsx). Sin proxy.

---

### Opción A: Auth guard solo en layouts (implementado actualmente)

**Cómo funciona:** Cada layout verifica la sesión con `getUser()` + `getProfile()`. Si no hay sesión o el rol es incorrecto, `redirect()`.

**Pros:**
- Funciona con Cloudflare Workers sin cambios
- Código explícito y fácil de auditar por ruta
- TypeScript safe — el tipo `Profile` está disponible en el layout y se puede pasar a los hijos
- Sin overhead en rutas estáticas (landing, log-in)
- Compatible con Next.js 16 sin workarounds

**Contras:**
- **Riesgo real:** Si se agrega una ruta nueva y no se le pone layout con auth guard, queda expuesta. Requiere disciplina. No hay enforcement automático.
- **Doble query:** layout llama `getUser()` + `getProfile()`, y la page puede llamarlas de nuevo si las necesita (no hay context sharing sin Zustand/RSC context)
- **Token refresh:** el access token de Supabase (1h de vida) no se refresca automáticamente en SSR sin proxy. En la práctica el Supabase client maneja el refresh via `getUser()`, pero solo si la sesión está activa

**Implicaciones de seguridad:**
- Layout auth guard es suficiente para la mayoría de casos. El riesgo real es omitir el guard en una ruta nueva.
- Los Server Actions también deben validar rol internamente (el doc de Next.js lo aclara explícitamente: "Always verify authentication and authorization inside each Server Function rather than relying on Proxy alone").
- RLS en Supabase es la última línea de defensa y está activa. Incluso si un layout falla, las queries a la DB devuelven solo los datos que el usuario tiene permiso de leer.

---

### Opción B: proxy.ts con workaround para Cloudflare Workers

**Opciones concretas de workaround:**
1. **Esperar @opennextjs/cloudflare 1.20+**: la librería está en desarrollo activo y probablemente soporte Node.js proxy pronto. El workaround sería agregar `proxy.ts` ahora y hacer el build pasar con un feature flag.
2. **Cambiar el proxy runtime a edge**: Next.js 16 no expone `runtime` en el proxy file, pero podría haber una opción en `next.config.ts` (no verificada).
3. **Usar solo el proxy para checks de cookie**: El proxy puede hacer un check ligero (¿existe la cookie de sesión?) sin llamar a Supabase, y dejar el check profundo (rol, escuela) al layout.

**Pros:**
- Enforcement automático en todas las rutas
- Una sola ubicación para la lógica de refresh de sesión
- Patrón estándar de Supabase SSR

**Contras:**
- Actualmente bloquea el Cloudflare Workers build
- Requiere investigar workaround (½ día de trabajo)
- El proxy de Next.js 16 NO puede acceder al DB (edge runtime sin node:crypto para queries SQL)

---

### Opción C: Híbrido (proxy lightweight + layout profundo)

**Cómo funciona:**
- `proxy.ts`: solo verifica si existe la cookie `sb-*-auth-token`. Si no existe y la ruta es protegida, `redirect("/log-in")`. Sin llamadas a DB.
- Layouts: verifican `getUser()` + `getProfile()` + rol específico.

**Pros:**
- El proxy hace un check rápido (sin DB) compatible con Edge runtime
- El layout hace el check profundo

**Contras:**
- El check del proxy es superficial — la cookie puede existir pero haber expirado o ser inválida
- No resuelve el problema del Cloudflare Workers Node.js runtime (el proxy sigue sin poder correr en CF)
- Complejidad adicional sin beneficio real dado que la Opción A ya es segura con RLS

---

### Mi recomendación

**Corto plazo (ahora):** Quedarse con Opción A. RLS + layout guards es suficientemente seguro para el MVP.

**Medio plazo (semana 2):** Evaluar si @opennextjs/cloudflare 1.20+ resolvió el Node.js proxy support. Si sí, agregar proxy.ts para token refresh automático. Si no, mantener Opción A y documentar que el token refresh es responsabilidad del cliente (Supabase auto-refresh via `getUser()` en cada request SSR).

**La decisión real para mañana:** ¿Querés explorar el workaround de edge-runtime para el proxy ahora, o priorizamos funcionalidad (actividades, quiz, etc.)?

---

## 🔴 DECISIÓN 2: Flag `es_placeholder` en progresiones

**Contexto:** El pedido original era agregar `es_placeholder: true` a las progresiones generadas para poder identificarlas y filtrarlas cuando se agregue contenido real.

**Lo que se hizo:** Las 402 progresiones se sembraron SIN este flag. El schema de la DB no tiene columna `es_placeholder`.

**Opciones:**
- **A (recomendada):** Agregar migración SQL: `ALTER TABLE progresiones ADD COLUMN es_placeholder boolean DEFAULT false;` y actualizar el seed para que asigne `true`. Costo: 1 migración + actualizar seed + actualizar queries.
- **B:** No agregar el flag. En su lugar, identificar placeholders por `descripcion IS NULL AND meta_aprendizaje IS NULL`. Más frágil pero sin migración.
- **C:** Agregar una tabla separada `progresiones_oficiales` para contenido real, manteniendo `progresiones` como catálogo estructural.

**Mi recomendación:** Opción A, en la próxima sesión antes de que haya contenido real.

---

## 🟡 DECISIÓN 3: Discrepancia en conteo de UAC semestre 1

**Contexto:** El pedido mencionó "50+ progresiones para 8 UAC del semestre 1". El MCCEMS oficial tiene **5 UAC en semestre 1** (LC-I, PM-I, CH-I, CD-I, IN-I) con un total de **50 progresiones**.

Las UAC de Áreas de Conocimiento (Ciencias Sociales, Naturales, Humanidades) empiezan en **semestre 3**, no en semestre 1.

**Posibles interpretaciones del pedido original:**
1. "8 UAC" era un error tipográfico — lo correcto es 5 UAC del CF en semestre 1
2. Se querían incluir UAC de todos los semestres para una cuenta total diferente
3. El plan original contemplaba una estructura curricular diferente al MCCEMS oficial

**Acción:** Verificar con el usuario si los 5 UAC de semestre 1 son correctos o si se esperaba una distribución diferente.

---

## ✅ DECISIONES TOMADAS (sin pendiente)

### Migración Vercel → Cloudflare Workers
- **Decisión:** Usar @opennextjs/cloudflare v1.19.9
- **Razón:** Gratuito en producción, mejor latencia en México, @cloudflare/next-on-pages está deprecado y requiere WSL
- **Impacto:** Build funciona en Windows sin WSL

### Lock file: legacy-peer-deps
- **Decisión:** Proyecto `.npmrc` con `legacy-peer-deps=false`
- **Razón:** El `.npmrc` global del usuario tiene `legacy-peer-deps=true`, causando que webpack (peer dep de eslint-config-next) no se escribiera al lock file
- **Impacto:** El lock file ahora es determinístico en CI y en la máquina del usuario

### Auth admin: usar service role key
- **Decisión:** Las páginas `/admin/usuarios` y `/admin/grupos` usan `getSupabaseAdmin()` (service role) para bypassear RLS y ver todos los usuarios
- **Razón:** RLS de profiles solo expone el profile propio. Admin necesita ver todos.
- **Impacto:** El service role key solo está disponible server-side (nunca expuesto al cliente). Correcto.
