# FUNDACIÓN — Patrones replicables de CEN Bachillerato

> **Propósito de este documento.** CEN Bachillerato está pensada como un *edificio
> bien cimentado*: una base que se puede **clonar** para construir plataformas
> educativas hermanas. Aquí se documentan los patrones que **deben copiarse tal
> cual** y los errores que **no deben repetirse**. No es un tour del código (para
> eso está [ARQUITECTURA.md](ARQUITECTURA.md)); es el *por qué* de las decisiones
> que sostienen la seguridad, la multi-escuela y el cumplimiento legal.
>
> Si vas a levantar la plataforma hermana, lee esto **antes** de copiar archivos.

Stack base: **Next.js 16 (App Router) + React 19 + @supabase/ssr + Cloudflare
Workers (`@opennextjs/cloudflare`)**. Cada patrón abajo asume ese stack, pero la
idea es portable.

---

## 1. Modelo multi-tenant: 4 roles + `escuela_id`

La unidad de aislamiento es la **escuela** (`escuela_id` en `profiles`). Hay
cuatro roles, y la distinción crítica para la seguridad es **global vs. acotado**:

| Rol           | Alcance                          | `escuela_id`         |
|---------------|----------------------------------|----------------------|
| `super_admin` | **Global** — ve todas las escuelas | `NULL`               |
| `admin`       | **Una** escuela                  | el `uuid` de su escuela |
| `teacher`     | Sus grupos dentro de su escuela  | el `uuid` de su escuela |
| `student`     | Solo sus propios datos           | el `uuid` de su escuela |

**Regla de oro:** `super_admin` tiene `escuela_id = NULL`. Eso significa que
**cualquier filtro `escuela_id = X` lo excluye por accidente**. Todo código que
filtra por escuela debe ramificar primero por `super_admin`:

```ts
const esGlobal = profile.role === "super_admin";
// para roles acotados, si escuela_id viniera NULL (dato corrupto) usamos un
// uuid imposible para que NO vean nada, en vez de verlo todo (fail-closed).
const escuelaScope = esGlobal ? null : (profile.escuela_id ?? "00000000-0000-0000-0000-000000000000");

let query = sb.from("grupos").select("...");
if (escuelaScope) query = query.eq("escuela_id", escuelaScope);
```

El `?? "00000000-…"` es **fail-closed**: ante un dato inesperado, el usuario ve
*cero* filas, nunca las de otra escuela. Esto es lo correcto cuando los datos son
PII de menores de edad.

---

## 2. Doble capa de aislamiento: App **y** RLS (no una u otra)

Este es el patrón de seguridad más importante de la plataforma, y el que más
fácil se rompe al clonar. Hay **dos** clientes de Supabase y se comportan
distinto frente a Row-Level Security:

| Cliente                       | Llave         | ¿Respeta RLS? | Uso                                    |
|-------------------------------|---------------|---------------|----------------------------------------|
| `getSupabaseServer()`         | `anon` + JWT  | **Sí**        | Lecturas/escrituras normales del usuario |
| `getSupabaseAdmin()`          | `service_role`| **NO — la salta** | Operaciones administrativas (alta masiva) |

> ⚠️ **El error que más cuesta:** `getSupabaseAdmin()` usa `service_role`, que
> **bypassa RLS por completo**. Una página que use el admin client **no está
> protegida por las policies** — *tú* tienes que poner el filtro `escuela_id`
> a mano. Si copias una página de admin sin el filtro explícito, expones la PII
> de todas las escuelas. (Esto fue un bug real en `admin/usuarios` y
> `admin/grupos`; ver §1 para el patrón correcto.)

**La defensa correcta es en las dos capas, no en una:**

1. **Capa App** — toda página/acción valida sesión, carga `profile`, y aplica el
   filtro de escuela explícito (sobre todo si usa el admin client).
2. **Capa RLS** — las policies en la base son la red de seguridad por si la capa
   App tiene un hueco. Nunca se confía solo en la App.

Plantilla de toda página autenticada:

```ts
const user = await getUser();
if (!user) redirect("/log-in");
const profile = await getProfile(user.id);
if (!profile) redirect("/log-in");
// ...a partir de aquí, filtra por escuelaScope (§1)
```

`getUser` y `getProfile` están envueltos en `cache()` de React, así que llamarlos
en cada página no multiplica las queries dentro del mismo render.

---

## 3. RLS con helpers `SECURITY DEFINER` (evita la recursión infinita)

El problema clásico de RLS: una policy sobre `profiles` que necesita leer el rol
del usuario… consultando `profiles` → recursión infinita. La solución es
encapsular esas lecturas en funciones `SECURITY DEFINER STABLE`, que corren con
los privilegios del *dueño* (saltan RLS) y se memoizan por statement:

```sql
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE
AS 'SELECT role FROM public.profiles WHERE id = auth.uid()';

CREATE OR REPLACE FUNCTION public.get_my_escuela_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE
AS 'SELECT escuela_id FROM public.profiles WHERE id = auth.uid()';

-- para comprobar la escuela de OTRO usuario (p.ej. dueño de un intento)
CREATE OR REPLACE FUNCTION public.get_escuela_of_user(_uid uuid)
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE
AS 'SELECT escuela_id FROM public.profiles WHERE id = _uid';
```

Con ellas, una policy se lee casi como una frase:

```sql
CREATE POLICY "admin lee intentos de su escuela" ON public.intentos
FOR SELECT USING (
  get_my_role() = 'super_admin'                              -- global
  OR (get_my_role() = 'admin'
      AND get_escuela_of_user(user_id) = get_my_escuela_id()) -- misma escuela
);
```

**Dos lecciones aprendidas, grabadas a fuego:**

1. **`FOR ALL` con `USING` pero sin `WITH CHECK`** → PostgreSQL usa la expresión
   `USING` *también* como `WITH CHECK` implícito en INSERT/UPDATE. No es un hueco.
   Pero para **auditoría** (y para que un revisor de licitación lo vea claro),
   escribe el `WITH CHECK` **explícito** de todos modos. Ver
   `15_rls_grupos_with_check.sql`.

2. **El Editor SQL de Supabase rompe el dollar-quoting** `$$ … $$` al pegar
   (da `ERROR 42601: syntax error at end of input LINE 0`). Solución: escribe el
   cuerpo de la función como **string literal** `AS '…'` (como arriba), no como
   `$$ … $$`. Funciona idéntico y se pega sin corromperse.

---

## 4. Flujo de alta masiva con cambio de contraseña forzado

Las escuelas dan de alta a sus alumnos en lote. El admin sube un padrón; el
sistema crea las cuentas con contraseña temporal y **obliga** a cambiarla en el
primer acceso. Piezas:

- `src/lib/actions/alta-masiva.ts` — server action que crea los usuarios con
  `getSupabaseAdmin()` (necesita `service_role` para crear cuentas), asignándoles
  el `escuela_id` del admin que ejecuta y `must_change_password = true`.
- `src/middleware.ts` — intercepta toda navegación: si el perfil tiene
  `must_change_password = true`, redirige a `/cambiar-password` y no lo deja
  entrar a ningún otro lado.
- `src/lib/actions/cambiar-password.ts` — al cambiarla, baja el flag.
- Migración `09_alta_masiva_must_change_password.sql` añade la columna.

> En Next.js 16 el "middleware" se llama conceptualmente **proxy** (heed la nota
> de deprecación). Lee `node_modules/next/dist/docs/` antes de tocarlo.

Patrón replicable: **toda credencial generada por el sistema (no elegida por el
usuario) nace con `must_change_password = true`.**

---

## 5. Aviso de privacidad LFPDPPP para menores de edad

La plataforma maneja PII de **menores**, así que el cumplimiento de la
**LFPDPPP** (Ley Federal de Protección de Datos Personales en Posesión de los
Particulares) no es opcional — es requisito de licitación. Patrón:

- Aviso de privacidad y términos versionados en `src/app/privacidad/`.
- Tabla `user_consents` registra **qué** documento (`document_type`:
  `privacy` / `terms`), **qué versión** (`document_version`) y **cuándo** aceptó
  cada usuario. Versionar permite re-pedir consentimiento si cambia el aviso.
- El consentimiento se inserta en el primer login (`src/app/log-in/page.tsx`).

> **Detalle de @supabase/ssr:** `supabase-js` **no lanza** en error de query —
> devuelve `{ error }`. Un `try/catch` solo no basta; hay que revisar `error`:
> ```ts
> const { error } = await supabase.from("user_consents").insert([...]);
> if (error) console.error("[Login] consentimiento no registrado:", error.message);
> ```

---

## 6. Manejo de errores: fire-and-forget **con señal**, nunca silencioso

Regla: una operación secundaria (que no debe bloquear el render) se deja
fire-and-forget, **pero registra el fallo**. Un `.catch(() => {})` vacío tira a la
basura señales de errores reales (RLS mal configurada, red caída):

```ts
// ✅ no bloquea el render, pero no perdemos la señal
marcarFichaLeida(ficha.id, user.id).catch((err) => {
  console.error("[FichaPage] no se pudo marcar la ficha como leída:", err);
});
```

**Única excepción legítima al catch vacío:** APIs del navegador que pueden
rechazar por permiso del usuario y donde de verdad no hay nada que hacer
(p.ej. `el.requestFullscreen().catch(() => {})`). Si dudas, registra.

**Datos que vienen de JSONB / fuentes externas** se parsean a la defensiva
(optional-chaining + default) para que un dato sucio no lance ni rompa el orden:

```ts
const num = parseInt(plan.code?.split('-P')[1] ?? '0', 10) || 0; // nunca NaN, nunca throw
```

---

## 7. Secretos: `service_role` jamás sale del servidor

- La llave `service_role` (y cualquier `sb_secret_…`) vive **solo** en
  `.env.local` (gitignored). **Nunca** con prefijo `NEXT_PUBLIC_` (eso la
  embebería en el bundle del cliente).
- `.dev.vars` (formato de Cloudflare Workers) **también** debe estar en
  `.gitignore` — `.env*` *no* lo cubre. Un descuido aquí filtró una llave al
  historial de git en este proyecto; ver
  [project_seguridad_llaves](../../../.claude/projects/.../memory/) en memoria.
- Si una llave se filtra: **rótala en Supabase** (deshabilita las legacy JWT
  keys) — purgar el historial de git no basta, porque pudo clonarse.

Checklist al clonar:
```
[ ] .gitignore incluye .env*, .dev.vars, y *.local
[ ] ninguna llave secreta tiene prefijo NEXT_PUBLIC_
[ ] getSupabaseAdmin() solo se importa en código server-side
[ ] grep del repo por la llave antes del primer push
```

---

## 8. Disciplina de migraciones

- Archivos `NN_descripcion.sql` numerados y ordenados en `supabase/migrations/`.
- **Idempotencia:** `CREATE OR REPLACE FUNCTION`, `DROP POLICY IF EXISTS` antes
  de `CREATE POLICY`. Re-correr una migración no debe romper nada.
- **Sin colisiones de número.** *(Resuelto: `13_logros.sql` se renombró a
  `13a_logros.sql` — `13_rls_docente_intentos.sql` conserva el número por
  encajar en la secuencia de endurecimiento de RLS 11→12→13→14→15→16. En la
  plataforma hermana, garantiza números únicos desde el inicio — el orden de
  aplicación importa.)*
- Toda policy nueva: prueba que `super_admin` (escuela_id NULL) **no** queda
  bloqueado por accidente (ver §1). Fue un bug real corregido en la migr. 15.

---

## 9. Cloudflare Worker: límite de 3 MiB gzipped (plan Free)

El bundle SSR del Worker no puede pasar de **3 MiB gzipped**. Implicaciones para
el contenido:

- El contenido pedagógico vive en **la base de datos**, no en el bundle. Se carga
  vía server action (`getPlanteamientoPorUAC`), no por `import` estático de JSON.
- Los módulos de datos puros (p.ej. `contenido-2025.ts`) **no** importan `three`
  ni se importan en SSR pesado.
- Las escenas 3D usan `<Html>` de drei, **no** `<Text>` (troika monta un worker
  que cuelga el chunk con Turbopack → carga infinita). Ver memoria
  `feedback_drei_text_troika`.

---

## Apéndice — Orden de copiado para la plataforma hermana

1. Esquema + RLS: `01_schema_inicial.sql` y los helpers `SECURITY DEFINER` (§3).
2. Clientes Supabase: `supabase-helpers.ts` (`getUser`/`getProfile` con `cache()`)
   y `supabase-admin.ts`.
3. Middleware/proxy de `must_change_password` (§4).
4. Aviso de privacidad + `user_consents` (§5) — **ajusta el texto legal** al
   nuevo responsable de los datos.
5. Páginas de admin **con el filtro `escuela_id` ya puesto** (§1, §2).
6. Verifica el checklist de secretos (§7) **antes** del primer commit.

> Si copias una sola idea de aquí, que sea ésta: **el admin client salta RLS;
> filtra por escuela a mano, y deja RLS como red de seguridad.** Todo lo demás es
> consecuencia de tomarse esa frase en serio.
