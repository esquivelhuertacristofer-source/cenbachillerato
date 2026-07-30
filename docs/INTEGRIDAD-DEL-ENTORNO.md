# Integridad del entorno — CEN Bachillerato

**Fecha:** 2026-07-30
**Motivo:** a partir de hoy existe un segundo despliegue de la plataforma (cliente **UVEG**),
con su propio Supabase y su propia cuenta de Cloudflare. Este documento inventaria todo lo
que hace funcionar a CEN Bachillerato y que **no vive en el repositorio**, y fija las reglas
que impiden que los dos entornos se toquen.

## 0. Qué protege este documento

Mientras hubo un solo despliegue, correr un script era inofensivo: solo existía una base a la
que apuntar. Con dos entornos eso deja de ser cierto. `npx tsx scripts/<loquesea>.ts` toma las
credenciales del **entorno del shell**, y la llave que usan esos scripts es `service_role`, que
**salta RLS**. Una terminal con las variables del proyecto equivocado escribe en la base
equivocada, con permisos totales, sin pedir confirmación y sin dejar rastro evidente.

Los datos de esta plataforma son de **menores de edad**. El costo de esa equivocación no es
técnico.

---

## 1. Inventario del entorno de producción

### 1.1 Identidades y recursos

| Recurso | Valor | Dónde está declarado |
|---|---|---|
| Repositorio | `github.com/esquivelhuertacristofer-source/cenbachillerato` | `git remote` |
| Cuenta Cloudflare | `campanaeducativanacional@gmail.com` → `226aa1ea2896760a5b68180a66c3170f` | **en ningún archivo** (ver R1) |
| Worker | `cen-bachillerato` | `wrangler.toml:1` |
| Proyecto Supabase | `xmcfuwdanlciqdxqtslv` | `next.config.ts:31` (CSP) y `.env.local` |
| KV `NEXT_INC_CACHE_KV` | `0da92b588ccb44aa9af534d2596f541b` | `wrangler.toml:9-11` |
| KV `RATE_LIMIT_KV` | `8ede628e17004471b6301940af3f43b4` | `wrangler.toml:13-15` |
| R2 privado | `cen-respuestas` (binding `RESPUESTAS_BUCKET`) | `wrangler.toml:21-23` |
| R2 público | `nem-videos`, prefijo `bachillerato/` → `pub-94a8196c0c59456a89cf72193424c9d1.r2.dev` | `next.config.ts:37`, `scripts/wire-videos-actividades.ts:31` |
| Rate limiters nativos | `LOGIN_RATE_LIMITER` (10/60s), `ENTREGA_RATE_LIMITER` (30/60s) | `wrangler.toml:32-40` |
| Dominios | `cen.com.mx` → hub general · `cenbachillerato.com.mx` → bachillerato | `src/lib/platform.server.ts:5-10` |

**Nota sobre KV:** el cupo de escrituras de KV Free es **por cuenta**, no por namespace. Crear
namespaces nuevos no da más cupo (por eso `catalog-cache.ts` reutiliza `NEXT_INC_CACHE_KV` con
prefijo propio). Cuando UVEG viva en **otra cuenta**, tendrá su propio cupo — eso es una razón
más para no compartir cuenta entre clientes.

### 1.2 Dónde vive cada credencial

No hay un solo lugar de credenciales: hay **cuatro destinos distintos** y cada uno se llena a
mano por separado. Perder de vista esto es la causa más común de "funciona en local y no en
producción".

| Variable | `.env.local`<br>(dev + scripts `tsx`) | `.dev.vars`<br>(`wrangler preview`) | Secreto del Worker<br>(producción) | GitHub Actions |
|---|:--:|:--:|:--:|:--:|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | — (se hornea en build) | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | — (se hornea en build) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | ✅ **verificado 2026-07-30** | ❌ a propósito |
| `CLOUDFLARE_API_TOKEN` | — | — | — | ✅ |
| `CLOUDFLARE_ACCOUNT_ID` | — | — | — | ✅ |
| `SUPABASE_DB_URL` | — | — | — | ⚠️ **nunca se creó** |

Las `NEXT_PUBLIC_*` se compilan dentro del bundle: no son secretos de runtime, por eso van como
secretos de **GitHub Actions** (build) y no como secretos del Worker. Que `deploy` en
`ci.yml:77-81` solo inyecte `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` es **correcto**:
la `service_role` no debe pasar por CI.

**Estado verificado con `wrangler secret list` (2026-07-30):** el Worker tiene exactamente un
secreto, `SUPABASE_SERVICE_ROLE_KEY`. Correcto y suficiente.

> ⚠️ **`SUPABASE_DB_URL` no existe como secreto de GitHub**, así que
> `.github/workflows/backup-supabase.yml` nunca ha corrido con éxito. **Hoy no hay respaldo
> automático de la base.** Es el hueco más grande de este inventario.

### 1.3 La `service_role` SÍ se usa en runtime — no es solo de scripts

`src/lib/supabase-admin.ts` lanza excepción si falta la llave, y lo llaman rutas que un usuario
real ejercita:

- `src/lib/actions/alta-masiva.ts:92` — **el alta de los 15–20 mil alumnos**
- `src/lib/actions/cambiar-password.ts:48` — el cambio obligatorio de primer ingreso, que
  **todo alumno dado de alta masivamente atraviesa**
- `src/lib/actions/crear-escuela.ts:28`
- `src/lib/actions/crear-admin-escolar.ts:36`
- `src/lib/actions/resetear-password.ts:32`
- `src/app/admin/usuarios/page.tsx:36` y `src/app/admin/grupos/page.tsx:22`

Si ese secreto falta en el Worker, el síntoma no es "el admin no entra": es que **la carga de
alumnos y el primer login de todos ellos truenan**. Es lo primero que hay que verificar en un
despliegue nuevo, antes de prometer una fecha de arranque.

### 1.4 Variables muertas (no confiar en ellas)

`.env.local` declara variables que **ningún archivo de `src/` lee**:

- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` — **no hay ningún paquete de Sentry instalado**
  ni una sola referencia en el código. **Hoy no hay monitoreo de errores en producción.** El
  cliente UVEG pidió su propio Sentry; ese trabajo está por hacerse en ambos lados, no solo en
  el suyo.
- `NEXT_PUBLIC_URL_PREESCOLAR`, `NEXT_PUBLIC_URL_PRIMARIA`, `NEXT_PUBLIC_URL_SECUNDARIA` — sin
  referencias en `src/`.

Dejarlas ahí es peor que no tenerlas: sugieren una capacidad que no existe.

---

## 2. Estado de secretos en el historial de git

**Verificado el 2026-07-30 sobre los 313 commits de todas las ramas:**

```
git log --all --oneline -- .dev.vars .env .env.local .env.production   → vacío
git log --all --oneline -S "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"      → vacío
git log --all --oneline -S "sb_secret_"                                → 3 commits, todos prosa
```

Los tres aciertos de `sb_secret_` son **documentación** (auditorías que describen el formato de
la llave o registran su rotación con el prefijo truncado). **Ningún valor de llave real vive en
el historial**, y ningún archivo de entorno fue commiteado nunca.

`.gitignore:36-40` cubre el hueco original del incidente:

```
.env*
!.env.example
.dev.vars
```

**Único archivo sin versionar hoy:** `scripts/cuenta-verificacion.ts`, que trae una contraseña
por defecto escrita en el código. No commitear tal cual — o se le quita el valor por defecto y
se le exige `VERIF_EMAIL`/`VERIF_PASSWORD` del entorno, o se queda local.

---

## 3. Riesgos de contaminación cruzada, y su guard

Estos riesgos **nacen el día que existe UVEG**. Ninguno es teórico; todos salen de cómo está
armado el proyecto hoy.

### R1 — `wrangler.toml` no fija `account_id`

El destino de un `npm run pages:deploy` local lo decide la sesión de wrangler, no el archivo.
Hoy la sesión resuelve una sola cuenta y por eso no muerde. El día que el mismo correo tenga
acceso a la cuenta de UVEG, el destino se vuelve ambiguo y el error es silencioso: despliegas
el Worker de un cliente en la cuenta del otro.

**Guard:** `account_id` explícito en el `wrangler.toml` de cada proyecto. Si el token no tiene
acceso a esa cuenta, wrangler falla ruidosamente en vez de adivinar.

```toml
account_id = "226aa1ea2896760a5b68180a66c3170f"   # CEN — Campanaeducativanacional@gmail.com
```

### R2 — Los scripts toman credenciales del shell (el riesgo grande)

**107 archivos de `scripts/`** leen `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`
del entorno (medido el 2026-07-30). Ninguno verifica **a qué proyecto** está apuntando. Una
variable exportada en la terminal para el otro cliente convierte cualquier script de
mantenimiento en una escritura a la base equivocada, saltándose RLS.

**Guard:** un preflight en `scripts/lib/activity-utils.ts` —el helper compartido que ya
construye el cliente tipado— que aborte si el project ref no es el esperado. Cuesta diez líneas
y cubre de golpe a todos los scripts que pasan por ahí:

```ts
const REF_ESPERADO = "xmcfuwdanlciqdxqtslv";   // CEN Bachillerato
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ref = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
if (ref !== REF_ESPERADO) {
  throw new Error(
    `ABORTADO: este repo es CEN Bachillerato (${REF_ESPERADO}) pero el entorno ` +
    `apunta a "${ref ?? url}". Revisa qué .env.local cargaste.`
  );
}
```

### R3 — La CSP hardcodea el host de Supabase y el de R2

`next.config.ts:31` y `:37` traen escritos el host de Supabase y el bucket público de CEN. Una
copia que no los cambie **bloquea en el navegador** las llamadas al Supabase nuevo. El síntoma
engaña: el servidor responde 200 y la página se ve vacía, sin error de servidor.

**Guard:** derivar el host desde `NEXT_PUBLIC_SUPABASE_URL` en vez de escribirlo, o —como
mínimo— que la copia lo cambie en el mismo movimiento en que cambia el `.env`.

### R4 — Los IDs de KV y los nombres de R2 se heredan al copiar

Son identificadores de la cuenta de CEN. Un `wrangler.toml` copiado tal cual hace que el Worker
del cliente escriba en **el caché y el bucket de CEN**, gastando su cupo y mezclando datos.

**Guard:** los IDs de KV y buckets van en la checklist de neutralización de toda copia, y el
`wrangler.toml` de la copia arranca con placeholders que **no son IDs válidos**, para que falle
antes de conectarse a nada ajeno.

### R5 — Compartir cupo de plan Free entre clientes

KV Free: 1,000 escrituras/día **por cuenta**. R2 Free: 10 GB **por cuenta**. Dos clientes en una
misma cuenta compiten por el mismo cupo y el que se quede sin él falla **abierto y en
silencio** (así está escrito el fallback del rate limiter en `wrangler.toml:25-31`).

**Guard:** cuenta de Cloudflare separada por cliente. Ya es el plan para UVEG; queda escrito
aquí para que no se relaje después "por comodidad".

---

## 4. Reglas de operación que no se infieren leyendo el código

Estas reglas costaron incidentes. No están en el código porque no son código.

- **Las migraciones se aplican A MANO en el SQL Editor de Supabase, nunca automáticamente.**
  Hay 25 migraciones (`supabase/migrations/01_*` … `25_*`). En el Supabase de CEN, **la 25 ya
  está aplicada: NO reaplicar.**
- **Nunca martillar el Worker con SSR seguidas.** 211 peticiones a ritmo libre provocaron
  `1102 Worker exceeded resource limits` y **tiraron el sitio ~3 minutos**. El ritmo de
  muestreo es 4 s entre peticiones (documentado en `scripts/muestreo-hub.ps1`). Los assets de
  R2 se verifican **directo contra el bucket público**, no a través del Worker.
- **Las subidas a R2 requieren `--remote`.** Sin esa bandera escriben en el simulador local y
  el objeto nunca existe en producción.
- **Las pruebas de carga van tras `LOADTEST_CONFIRM=si`**, solo con cuentas sintéticas y
  colgadas de la escuela sandbox `LOADTEST-000` ("ZZZ Carga Sintética — NO ES ESCUELA REAL").
  Jamás colgar cuentas sintéticas de una escuela real: los datos son de menores.
- **El alcance de lint es `npm run lint` (= `eslint src/`), nunca `eslint .`.**
- **No correr `npm run build` con el servidor de dev encendido** — esa combinación mató al dev
  server por falta de memoria (exit 134).
- **Arrancar `npm run dev` con el heap por defecto**, sin `NODE_OPTIONS=--max-old-space-size`.
- **No hacer `git push` automáticamente.** Se trabaja en local hasta que se pida.
- **No reejecutar los seeders históricos `scripts/seed-sem*-videos*.ts`** — apuntan a los
  códigos viejos `-VID01` e insertarían duplicados vía `upsertActividad`.
- **`exit code 0` no significa éxito de punta a punta.** Verificar por elemento leyendo la
  salida, no el código de salida.
- **`src/components/hub/hub-colors.ts` no se modifica.**

---

## 5. Compuertas de verificación

El estado sano del proyecto, en orden. Los cuatro deben quedar en verde antes de considerar
cualquier cambio terminado:

```powershell
npm run typecheck     # tsc --noEmit           → 0 errores
npm run lint          # eslint src/            → 0 errores
npm test              # jest                   → 406 pruebas
npm run build         # next build             → 0 errores
npm run pages:build   # OpenNext + postbuild   → .open-next/worker.js
```

Y la medida que decide si el despliegue cabe en el plan: **el Worker gzipped debe quedar por
debajo de 3 MiB.** Última medición: **1.87 MiB gz (~65% del límite)**. Cualquier dependencia
nueva que entre a `src/` se mide contra ese techo.

---

## 6. Reconstrucción del entorno desde cero

Si se pierde la máquina, esto es lo mínimo para volver a tener el proyecto corriendo. El
repositorio **no basta**.

1. `git clone` del repositorio.
2. `npm install` (el `postinstall` parcha OpenNext; si falla, el build a Cloudflare no sirve).
3. Crear `.env.local` con las 3 variables de Supabase (§1.2). Sin ellas ni el build pasa.
4. Crear `.dev.vars` con las mismas 3 para `wrangler preview`.
5. Recuperar el acceso a la cuenta de Cloudflare `campanaeducativanacional@gmail.com` — ahí
   viven el Worker, los 2 KV, los 2 buckets R2 y los dominios. **Los IDs de §1.1 no se pueden
   regenerar: si se pierde la cuenta, se pierde el caché y el bucket de respuestas.**
6. Verificar que el Worker conserva el secreto `SUPABASE_SERVICE_ROLE_KEY` (§1.3).
7. Recuperar el acceso al proyecto Supabase `xmcfuwdanlciqdxqtslv`. **Aquí no hay respaldo
   automático (§1.2): esta es la pieza sin red.**
8. Compuertas de §5 en verde.

**Lo que no se puede reconstruir desde el repositorio:** los datos de alumnos, escuelas,
intentos y progreso. Solo viven en Supabase. Mientras `SUPABASE_DB_URL` no exista como secreto
de GitHub, esos datos dependen de una sola copia.

---

## 7. Punto de corte con UVEG

El proyecto de UVEG es un **repositorio independiente**, no una rama ni un workspace. Se
separó en el estado etiquetado aquí como:

```
git tag fork-uveg-2026-07-30
```

Para saber después qué cambió en la base desde la separación, y decidir qué vale la pena
portar:

```powershell
git log --oneline fork-uveg-2026-07-30..main          # commits de CEN desde el corte
git diff --no-index <ruta-cen>\src\lib\<archivo>.ts <ruta-uveg>\src\lib\<archivo>.ts
```

Ambos repositorios conservan **la misma estructura de carpetas**. Un archivo que UVEG no haya
remodelado vive en la ruta idéntica en los dos, así que portar un arreglo es copiar un archivo,
no reconstruirlo.

**La dirección del porte es una sola: de CEN hacia UVEG.** Nada de lo que se construya para el
cliente entra a este repositorio sin pasar por las compuertas de §5 y por una decisión
explícita — este proyecto es la base y no se mueve al ritmo de un cliente.
