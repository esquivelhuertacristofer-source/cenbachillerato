# Modelo de Datos — CEN Bachillerato

## Diagrama de relaciones

```
auth.users
    │
    └─ profiles (1:1)
           │
           ├─ escuelas (N:1) ──── grupos (N:1 escuela)
           │                           │
           └─ alumnos_grupos (N:N) ────┘
                     │
                     └─ grupos.id_docente → profiles

componentes_curriculares
    │
    └─ uac (N:1 componente)
           ├─ recursos_sociocognitivos (N:1, nullable)
           ├─ areas_conocimiento (N:1, nullable)
           └─ progresiones (1:N)
                     │
                     └─ actividades (N:1 progresion)
                               │
                               └─ intentos (N:M user_profiles)
```

## Tablas principales

### `escuelas` — Tenant
Cada institución educativa es un tenant. El `cct` (Clave de Centro de Trabajo) es el identificador oficial SEP.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| nombre | text | Nombre oficial de la institución |
| cct | text | Clave de Centro de Trabajo (UNIQUE) |
| subsistema | enum | DGB/DGETI/DGETA/CONALEP/CECYT/CCH/ENP/BGE/EMSAD/BD/particular/otro |
| rvoe | text | Reconocimiento de Validez Oficial (particulares) |
| estado | text | Estado de la república |
| municipio | text | Municipio |

### `profiles` — Usuario
Extiende `auth.users`. Un profile vincula al usuario con su escuela, semestre y área.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | FK → auth.users.id |
| role | enum | student/teacher/admin/super_admin |
| escuela_id | uuid | FK → escuelas |
| semestre | int | 1-6 (students) |
| area_eleccion | enum | ciencias-sociales/ciencias-naturales-mate/humanidades |

### `uac` — Unidad de Aprendizaje Curricular
Unidad pedagógica base del MCCEMS. Cada UAC pertenece a un componente curricular y opcionalmente a un recurso sociocognitivo o área de conocimiento.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| codigo | text | Identificador único (LC-I, PM-III, etc.) |
| semestre | int | 1-6 |
| componente_id | uuid | FK → componentes_curriculares |
| recurso_id | uuid | FK → recursos_sociocognitivos (Currículum Fundamental) |
| area_id | uuid | FK → areas_conocimiento (Currículum Extendido) |
| total_progresiones | int | Número esperado de progresiones |

## RLS

Todas las tablas tienen RLS habilitado. Las políticas siguen el principio de mínimo privilegio:
- Estudiantes ven solo sus propios datos
- Docentes ven datos de alumnos en su escuela
- Admin ven datos de su escuela
- Super admin tienen acceso total

## Funciones SECURITY DEFINER

- `get_my_role()` — retorna el role del usuario autenticado sin recursión
- `get_my_escuela_id()` — retorna la escuela del usuario autenticado sin recursión

## Triggers

- `on_auth_user_created` → `handle_new_user()`: crea profile automáticamente al registrarse
- `protect_profile_role` → `protect_user_profile_fields()`: previene escalada de privilegios en role
