# Manual de Alta Masiva de Usuarios — CEN Bachillerato

## Flujo de negocio

1. La escuela arma un archivo CSV con todos sus maestros y alumnos (formato especificado abajo).
2. El administrador de la escuela lo sube en **Admin → Alta Masiva** (`/admin/alta-masiva`).
3. El sistema valida, genera emails y contraseñas, crea cuentas y asigna grupos.
4. El sistema devuelve un CSV con credenciales (email + contraseña inicial por persona).
5. La escuela entrega esas credenciales a cada maestro y alumno.
6. En el primer login, cada usuario **debe cambiar su contraseña obligatoriamente** antes de acceder al sistema.

---

## Formato del CSV de entrada

6 columnas obligatorias (encabezados en minúsculas):

```
rol,nombre,apellido_paterno,apellido_materno,semestre,grupo_nombre
```

| Columna | Obligatorio | Valores | Notas |
|---------|-------------|---------|-------|
| `rol` | Sí | `docente` o `alumno` | Exactamente esos valores |
| `nombre` | Sí | texto | 1-100 caracteres |
| `apellido_paterno` | Sí | texto | 1-100 caracteres |
| `apellido_materno` | Sí | texto | 1-100 caracteres |
| `semestre` | Solo alumnos | 1–6 | Vacío para docentes |
| `grupo_nombre` | Sí | texto | Ejemplo: `Grupo 1A` |

### Ejemplo válido

```csv
rol,nombre,apellido_paterno,apellido_materno,semestre,grupo_nombre
docente,Juan,Pérez,García,,Grupo 1A
alumno,María,López,Hernández,1,Grupo 1A
alumno,Carlos,Rodríguez,Sánchez,1,Grupo 1A
docente,Ana,Martínez,Torres,,Grupo 2A
alumno,Pedro,González,Ruiz,2,Grupo 2A
```

### Límites

- Máximo **10 MB** por archivo
- Máximo **5 000 filas** por carga
- Encoding recomendado: **UTF-8**

---

## Generación automática de emails

El email se genera a partir del nombre y apellido paterno:

```
nombre.apellido_paterno@cenbachillerato.mx
```

Normalización aplicada:
- Convertir a minúsculas
- Quitar acentos (á → a, é → e, etc.)
- Convertir ñ → n
- Eliminar espacios y caracteres especiales

**Ejemplos:**
| Nombre | Apellido paterno | Email generado |
|--------|-----------------|----------------|
| María | López | `maria.lopez@cenbachillerato.mx` |
| José | García | `jose.garcia@cenbachillerato.mx` |
| Iñaki | Núñez | `inaki.nunez@cenbachillerato.mx` |

---

## Manejo de duplicados de email

Cuando dos personas generarían el mismo email base, el sistema aplica esta estrategia en orden:

1. **Intento 1** — email base: `nombre.apellido_paterno@cenbachillerato.mx`
2. **Intento 2** — con apellido materno: `nombre.apellido_paterno.apellido_materno@cenbachillerato.mx`
3. **Intento 3+** — sufijo numérico incremental: `nombre.apellido_paterno.apellido_materno2@cenbachillerato.mx`, `...3`, etc.

**Ejemplo:** Si ya existe `maria.lopez@cenbachillerato.mx`, una nueva María López Hernández recibe:
→ `maria.lopez.hernandez@cenbachillerato.mx`

Si también existe esa, recibe:
→ `maria.lopez.hernandez2@cenbachillerato.mx`

---

## Generación automática de contraseñas

Formato: `Bachi-` + 8 caracteres alfanuméricos aleatorios en minúsculas.

**Ejemplo:** `Bachi-x7a3kpqn`

La contraseña es **temporal**. El usuario debe cambiarla en el primer login.

---

## Formato del CSV de retorno (credenciales)

5 columnas:

```csv
nombre_completo,rol,grupo,email,password_inicial
Juan Pérez García,docente,Grupo 1A,juan.perez@cenbachillerato.mx,Bachi-x7a3kpqn
María López Hernández,alumno,Grupo 1A,maria.lopez@cenbachillerato.mx,Bachi-q9p2mwkl
```

> ⚠️ **Guardar este archivo de forma segura.** Las contraseñas se muestran solo una vez y no quedan almacenadas en texto plano.

---

## Cambio obligatorio de contraseña en primer login

Al ingresar por primera vez, el sistema detecta que la contraseña es temporal y redirige automáticamente a `/cambiar-password`. El usuario no puede acceder a ninguna otra página hasta establecer su contraseña personal.

Tras el cambio exitoso:
- Alumnos → `/hub`
- Docentes → `/dashboard/docente`
- Admins → `/admin/escuelas`

---

## Idempotencia: agregar más usuarios después

Re-subir el mismo CSV **no duplica usuarios**. Si el email base de una persona ya existe en el sistema, esa fila se omite (se cuenta como "ya existente").

Para agregar alumnos o docentes adicionales, incluir **solo las nuevas filas** en el CSV. Los ya existentes se omiten sin errores.

---

## Recuperación de contraseña

> TODO (decisión pendiente del cliente): el flujo de recuperación de contraseña por email externo no está implementado en esta versión. Contactar a soporte CEN para reestablecer manualmente si un usuario pierde su contraseña.

---

## Orden de procesamiento

El sistema siempre procesa **docentes antes que alumnos**, independientemente del orden en el CSV. Esto garantiza que el grupo ya tenga docente asignado cuando se vinculan los alumnos.

---

## Validación atómica

Si **cualquier fila del CSV tiene un error de validación**, el sistema **no crea ningún usuario**. Se devuelve la lista completa de errores para corregir el CSV antes de re-intentar.

Esto garantiza que la carga sea consistente: o se procesan todos, o no se procesa ninguno.
