# ADMIN-FLOW — Registro de escuelas y onboarding en CEN Bachillerato

Documento interno de referencia técnica. Describe el estado actual del sistema de administración, los flujos propuestos para el onboarding completo y los datos que respaldan cada decisión. No es copy de usuario final.

---

## 1. Roles de usuario

| Valor en BD (`profiles.role`) | Acceso |
|-------------------------------|--------|
| `super_admin` | Visión global de todas las escuelas. Único que puede registrar nuevas escuelas o crear admins escolares. |
| `admin` | Admin escolar. Ve y gestiona únicamente la escuela asignada en `profiles.escuela_id`. |
| `teacher` | Docente. Accede a `/dashboard/docente`. Solo ve sus propios grupos. |
| `student` | Alumno. Accede a `/hub`. |

El `AdminLayout` en `src/app/admin/layout.tsx` redirige a `student` → `/hub` y a `teacher` → `/dashboard/docente`. Cualquier rol `admin` o `super_admin` puede acceder a las rutas bajo `/admin/`.

---

## 2. Estado actual — qué está implementado

### Rutas de admin existentes

| Ruta | Archivo | Estado |
|------|---------|--------|
| `/admin/escuelas` | `src/app/admin/escuelas/page.tsx` | Lectura de escuelas (tabla). Botón "Agregar escuela" renderizado pero sin acción. |
| `/admin/grupos` | `src/app/admin/grupos/page.tsx` | Lectura de grupos con filtro multi-tenant. Botón "Agregar grupo" renderizado pero sin acción. Muestra escuela y docente asignado. |
| `/admin/usuarios` | `src/app/admin/usuarios/page.tsx` | Lectura de perfiles filtrada por escuela del admin (o global para `super_admin`). Solo lectura. |
| `/admin/alta-masiva` | `src/app/admin/alta-masiva/page.tsx` | **Completamente funcional.** Formulario conectado a `procesarAltaMasiva`. |

### Server Action de alta masiva

`src/lib/actions/alta-masiva.ts` — `procesarAltaMasiva(csvText: string)`

Capacidades confirmadas en código:
- Valida que el llamante sea `admin` o `super_admin` con `escuela_id` asignada.
- Parsea CSV con PapaParse (header normalizado a minúsculas).
- Valida cada fila con Zod (`FilaCSVSchema`). Aborta si hay errores de validación (transaccional).
- Límite: 5 000 filas por carga.
- Crea los grupos faltantes de la escuela automáticamente.
- Procesa primero a docentes, luego a alumnos (orden crítico para asignación).
- Genera emails bajo `@cenbachillerato.mx` con estrategia de desempate (ver sección 4).
- Genera contraseña inicial con `crypto.getRandomValues` (formato `Bachi-XXXXXXXX`).
- Asigna alumnos a grupo via tabla `alumnos_grupos`.
- Asigna docente al grupo via `grupos.id_docente` (primer docente gana; no sobreescribe si ya hay uno).
- Devuelve `ResultadoAlta`: conteos + lista de credenciales + errores.

### Consultas de docente

`src/lib/queries/docente.ts` expone las queries que alimentan el dashboard del docente. Confirma el modelo de datos: grupos → alumnos via `alumnos_grupos`, intentos en `intentos`, métricas de progreso por UAC y progresión.

---

## 3. Modelo de datos — relaciones clave

```
escuelas
  id          uuid PK
  nombre      text
  cct         text          -- Clave de Centro de Trabajo (SEP)
  subsistema  text
  estado      text
  municipio   text
  created_at  timestamptz

grupos
  id          uuid PK
  nombre      text
  semestre    int (1–6)
  escuela_id  uuid FK → escuelas.id
  id_docente  uuid FK → profiles.id   (nullable)

profiles                              -- espeja auth.users de Supabase
  id          uuid PK (= auth.users.id)
  email       text
  full_name   text
  role        text ('student'|'teacher'|'admin'|'super_admin')
  escuela_id  uuid FK → escuelas.id   (nullable para super_admin)
  semestre    int                      (alumno; nullable para teacher/admin)

alumnos_grupos                        -- tabla de unión M:N
  id_alumno   uuid FK → profiles.id
  id_grupo    uuid FK → grupos.id

intentos                              -- registros de actividad
  id          uuid PK
  user_id     uuid FK → profiles.id
  actividad_id uuid FK → actividades.id
  score       int
  tiempo_segundos int
  status      text ('completed'|'abandoned'|'failed')
  started_at  timestamptz
  completed_at timestamptz
```

Relación resumida:

```
escuelas 1──N grupos 1──N alumnos_grupos N──1 profiles (student)
                     └──1 profiles (teacher, via id_docente)
profiles (admin) ──→ escuelas (via escuela_id)
```

---

## 4. Flujo de alta masiva (CSV) — formato y comportamiento

### Columnas del CSV

| Columna | Tipo | Requerido | Notas |
|---------|------|-----------|-------|
| `rol` | `"docente"` \| `"alumno"` | Sí | Determina el rol Supabase creado (`teacher` / `student`). |
| `nombre` | string (1–100 chars) | Sí | Primer nombre(s). |
| `apellido_paterno` | string (1–100 chars) | Sí | Apellido paterno. |
| `apellido_materno` | string (1–100 chars) | Sí | Apellido materno. |
| `semestre` | entero 1–6 | Solo alumnos | Obligatorio para `rol=alumno`; ignorado para `rol=docente`. |
| `grupo_nombre` | string (1–100 chars) | Sí | Nombre del grupo (p. ej. `"1A"`, `"3B"`). Si no existe, se crea automáticamente. |

El parser de PapaParse normaliza los encabezados a minúsculas y recorta espacios, así que `Rol`, `ROL`, `rol ` son equivalentes.

### Ejemplo de CSV válido

```csv
rol,nombre,apellido_paterno,apellido_materno,semestre,grupo_nombre
docente,Juana,López,Hernández,,3A
alumno,Carlos,Martínez,Pérez,3,3A
alumno,Ana,García,Flores,3,3A
alumno,Luis,Ramírez,Torres,3,3B
```

### Estrategia de generación de email

La función `resolverEmailUnico` en `src/lib/email-generator.ts` aplica la siguiente lógica:

1. `nombre.apellidoPaterno@cenbachillerato.mx`
2. Si ya existe: `nombre.apellidoPaterno.apellidoMaterno@cenbachillerato.mx`
3. Si ya existe: `nombre.apellidoPaterno.apellidoMaterno2@cenbachillerato.mx` (incrementa hasta 99)

Todos los caracteres se normalizan a ASCII sin acentos (`á→a`, `ñ→n`, etc.) y se eliminan caracteres no alfanuméricos.

### Contraseña inicial

Formato: `Bachi-` + 8 caracteres alfanuméricos en minúsculas (p. ej. `Bachi-x3k9mn2q`). Generada con `crypto.getRandomValues` (sin sesgo de módulo). La flag `must_change_password: true` se establece en `user_metadata`.

### Salida del proceso

El Server Action devuelve:

```typescript
{
  total_filas: number,
  docentes_creados: number,
  alumnos_creados: number,
  grupos_creados: number,    // grupos nuevos creados automáticamente
  ya_existentes: number,     // filas omitidas por email base ya registrado
  errores: Array<{ fila, columna?, mensaje }>,
  credenciales: Array<{ nombre_completo, rol, grupo, email, password_inicial }>
}
```

Si hay cualquier error de validación Zod, el proceso **aborta completamente** antes de tocar la base de datos. Los errores de creación individual (después de la validación) son no-fatales: el proceso continúa y los reporta en `errores`.

---

## 5. Flujos propuestos — onboarding completo

### 5.1. Super-admin registra una escuela

**Estado actual:** La página `/admin/escuelas` muestra la tabla y el botón "Agregar escuela", pero el botón no tiene acción conectada. El registro debe hacerse directamente en Supabase (dashboard o script SQL).

**Flujo propuesto:**
1. `super_admin` abre `/admin/escuelas` y hace clic en "Agregar escuela".
2. Modal/formulario solicita: `nombre`, `cct` (Clave de Centro de Trabajo SEP), `subsistema`, `estado`, `municipio`.
3. Server Action inserta en tabla `escuelas` y devuelve el nuevo registro.
4. La escuela aparece en la tabla con `created_at` reciente.

**Datos necesarios en `escuelas`:** `nombre`, `cct`, `subsistema`, `estado`, `municipio`.

### 5.2. Super-admin crea el admin escolar (director/coordinador)

**Estado actual:** No existe ninguna UI para crear un usuario `admin` individualmente. Debe hacerse via Supabase Auth dashboard o script.

**Flujo propuesto:**
1. `super_admin` va a `/admin/usuarios` y hace clic en "Nuevo usuario" (botón por añadir).
2. Formulario solicita: nombre, apellidos, email, rol (`admin`), escuela (selector de la tabla `escuelas`).
3. Server Action llama `supabase.auth.admin.createUser` con `email_confirm: true` y `role: 'admin'`.
4. El perfil en `profiles` debe quedar con `escuela_id` asignada; sin esto el admin escolar no puede operar (`alta-masiva` lo bloquea explícitamente).

### 5.3. Admin escolar crea grupos manualmente

**Estado actual:** La página `/admin/grupos` muestra grupos y el botón "Agregar grupo", pero sin acción conectada. Los grupos se pueden crear de forma implícita durante la alta masiva (si el nombre de grupo en el CSV no existe, se crea automáticamente con el semestre del primer alumno del lote).

**Flujo propuesto:**
1. `admin` abre `/admin/grupos`.
2. Formulario solicita: `nombre` (p. ej. `3A`), `semestre` (1–6). La `escuela_id` se toma del perfil del admin.
3. Server Action inserta en `grupos` (`nombre`, `semestre`, `escuela_id`). El campo `id_docente` queda nulo hasta la asignación.

### 5.4. Admin escolar asigna docente a un grupo

**Estado actual:** La asignación se puede hacer implícitamente a través de la alta masiva (si el CSV incluye una fila con `rol=docente` y el `grupo_nombre` correspondiente). No existe un flujo de asignación directa en la UI.

**Flujo propuesto:**
1. `admin` abre `/admin/grupos`, selecciona un grupo con `id_docente = null`.
2. Desplegable de docentes existentes en la misma escuela (query: `profiles WHERE role='teacher' AND escuela_id=?`).
3. Server Action hace `UPDATE grupos SET id_docente = ? WHERE id = ?`.
4. La restricción del código actual: el alta masiva no sobreescribe `id_docente` si ya hay uno asignado.

### 5.5. Admin escolar carga alumnos (alta masiva)

**Estado actual:** Completamente funcional en `/admin/alta-masiva`.

**Flujo:**
1. `admin` con `escuela_id` asignado abre `/admin/alta-masiva`.
2. Prepara CSV con columnas: `rol, nombre, apellido_paterno, apellido_materno, semestre, grupo_nombre`.
3. Incluye primero las filas de docentes (o mezcla libremente; el sistema las ordena internamente).
4. Sube el CSV. El sistema valida todas las filas antes de crear ningún registro.
5. Si hay errores de validación, se devuelven por fila y no se crea nada.
6. Si la validación pasa: se crean grupos faltantes, luego docentes, luego alumnos.
7. El sistema descarga o muestra la tabla de credenciales generadas.
8. El admin distribuye las credenciales a docentes y alumnos. Todos deben cambiar su contraseña en el primer acceso (`must_change_password: true` en `user_metadata`).

### 5.6. Docente accede por primera vez

**Estado actual:** El cambio de contraseña forzado está parcialmente implementado. Existe `src/lib/actions/cambiar-password.ts` y la ruta `/cambiar-password`. El flujo completo de detección y redirección debe verificarse en la UI de login.

**Flujo propuesto:**
1. Docente recibe email + contraseña del admin escolar.
2. Abre `/log-in` e ingresa credenciales.
3. Si `must_change_password = true` en `user_metadata`, la app redirige a `/cambiar-password`.
4. Tras cambiar la contraseña, el docente llega a `/dashboard/docente`.
5. En el dashboard el docente ve sus grupos asignados (via `grupos.id_docente`) y el progreso de sus alumnos.

### 5.7. Alumno accede por primera vez

1. Alumno recibe email + contraseña del docente o del admin.
2. Ingresa a `/log-in`.
3. Si `must_change_password = true`, redirige a `/cambiar-password`.
4. Tras cambiar contraseña, accede a `/hub` donde ve sus UACs del semestre.

---

## 6. Registro de docentes por autoservicio

**Estado actual:** No implementado. No existe ningún flujo de auto-registro para docentes. Todos los usuarios son creados por un admin/super_admin.

**Consideración de diseño:** Dado que los emails se generan automáticamente bajo `@cenbachillerato.mx` y las contraseñas son temporales, el modelo actual es de "aprovisionamiento centralizado". Un flujo de autoservicio requeriría:
- Definir qué email real del docente usar (diferente del `@cenbachillerato.mx`).
- Un mecanismo de invitación (código de escuela o link firmado).
- Validación de que la escuela existe y el docente pertenece a ella.

---

## 7. Endpoints / Server Actions pendientes de construir

Las siguientes operaciones no tienen implementación en código. Las páginas muestran botones pero sin acción conectada.

| Funcionalidad | Tipo | Descripción |
|---------------|------|-------------|
| Crear escuela | Server Action | `INSERT INTO escuelas (nombre, cct, subsistema, estado, municipio)` |
| Crear admin escolar | Server Action | `supabase.auth.admin.createUser` + `UPDATE profiles SET role='admin', escuela_id=?` |
| Crear grupo individual | Server Action | `INSERT INTO grupos (nombre, semestre, escuela_id)` |
| Asignar docente a grupo | Server Action | `UPDATE grupos SET id_docente=? WHERE id=?` |
| Editar grupo | Server Action | Nombre, semestre, reasignación de docente |
| Eliminar/archivar usuario | Server Action | `supabase.auth.admin.deleteUser` o flag `activo` |
| Mover alumno entre grupos | Server Action | `UPDATE alumnos_grupos SET id_grupo=? WHERE id_alumno=?` |
| Exportar credenciales post alta-masiva | UI | Botón de descarga CSV de credenciales generadas |
| Reset de contraseña individual | Server Action | `supabase.auth.admin.generateLink` tipo `recovery` |

---

## 8. Aislamiento multi-tenant

El sistema implementa aislamiento por escuela en el capa de aplicación (no solo RLS):

- `/admin/usuarios`: filtra `profiles WHERE escuela_id = profile.escuela_id` cuando el llamante es `admin`. El `super_admin` no filtra (visión global).
- `/admin/grupos`: mismo patrón. Usa `service_role` (salta RLS) por lo que el filtro manual es obligatorio para no exponer PII de menores de otras escuelas (LFPDPPP).
- `procesarAltaMasiva`: toma `escuela_id` del perfil del admin; no acepta `escuela_id` como parámetro del cliente.

Un `admin` sin `escuela_id` asignado no puede crear usuarios (el Server Action lo bloquea con un error explícito) ni ver usuarios o grupos (la query devuelve 0 resultados al filtrar por un UUID imposible).

---

## 9. Consideraciones de seguridad relevantes

- **Credenciales en tránsito:** La respuesta de `procesarAltaMasiva` devuelve contraseñas en texto plano en el JSON de respuesta. Esto es intencional (el admin necesita distribuirlas), pero la pantalla de resultados no debe persistirse en logs del servidor.
- **`service_role` en admin pages:** Las páginas admin usan `getSupabaseAdmin()` que carga la `service_role` key solo en el servidor. Esta key NO debe estar en variables de entorno de cliente ni en el bundle de Cloudflare Worker. Ver `feedback_cloudflare_worker_size.md`.
- **`must_change_password`:** Se guarda en `user_metadata` (accesible desde el cliente). El forzamiento real del cambio depende de la lógica de redirección en el middleware/layout; si no se verifica en cada ruta protegida, un usuario podría saltar el cambio modificando la URL.
