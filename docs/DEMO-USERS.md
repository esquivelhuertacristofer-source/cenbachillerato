# Usuarios Demo — CEN Bachillerato

Credenciales para entorno de desarrollo/demo. Todos los usuarios están en Supabase proyecto `xmcfuwdanlciqdxqtslv`.

**Para recrear:** `npx tsx scripts/create-demo-users.ts` (idempotente)

---

## Escuela y grupo demo

| Campo | Valor |
|-------|-------|
| Nombre escuela | Escuela Demo CEN Bachillerato |
| CCT | DEMO-001 |
| Subsistema | particular |
| Nombre grupo | Grupo 1A Demo |
| Semestre | 1 |

---

## Credenciales y experiencia por rol

### 👤 Admin

| Campo | Valor |
|-------|-------|
| Email | admin@cenbachillerato-demo.com |
| Password | Demo2026! |
| Rol | admin |
| Nombre | Admin Demo |

**Cómo loguearse:** Ir a `/log-in` → ingresar credenciales → aceptar aviso de privacidad → click "Acceder"

**Qué se ve después del login:**
- Redirección automática a `/admin/escuelas`
- Header: "Panel de Administración — CEN Bachillerato" con nav Escuelas / Grupos / Usuarios
- `/admin/escuelas`: tabla con 1 escuela (Escuela Demo CEN Bachillerato, CCT=DEMO-001, subsistema=particular)
- `/admin/grupos`: tabla con 1 grupo (Grupo 1A Demo, semestre 1°, docente=Docente Demo)
- `/admin/usuarios`: resumen 10 alumnos / 1 docente / 1 admin + tabla completa de 12 usuarios con badges de rol

---

### 👤 Docente

| Campo | Valor |
|-------|-------|
| Email | docente@cenbachillerato-demo.com |
| Password | Demo2026! |
| Rol | teacher |
| Nombre | Docente Demo |

**Cómo loguearse:** `/log-in` → credenciales → checkbox → "Acceder"

**Qué se ve después del login:**
- Redirección a `/dashboard/docente`
- Header: "Dashboard Docente — Bienvenido, Docente"
- 4 tarjetas de métricas:
  - 👥 **10** Alumnos activos
  - 🏫 **1** Grupos asignados
  - 📚 **1** Semestres en curso
  - 📊 **—** Promedio de avance (sin actividades aún)
- Tabla "Mis grupos": Grupo 1A Demo — 1° — 10 alumnos
- 3 cards de accesos rápidos (Alta de alumnos, Reportes SEP, Gestión de grupos — todos "próximamente")

---

### 👤 Alumnos Semestre 6 (cuenta dedicada)

| Email | Password | Nombre | Semestre | Script |
|-------|----------|--------|---------|--------|
| alumno-sem6@cenbachillerato-demo.com | Demo2026! | Alumno Sem 6 Demo | 6 | `npx tsx scripts/create-demo-alumno-sem6.ts` |

**Grupo asignado:** Grupo 6A Demo (semestre=6)
**Qué se ve después del login:** Hub con UACs de Semestre 6 (CD-III, CH-III, CNEYT-VI, PM-VI)

---

### 👤 Alumnos Semestre 5 (cuenta dedicada)

| Email | Password | Nombre | Semestre | Script |
|-------|----------|--------|---------|--------|
| alumno-sem5@cenbachillerato-demo.com | Demo2026! | Alumno Sem 5 Demo | 5 | `npx tsx scripts/create-demo-alumno-sem5.ts` |

**Grupo asignado:** Grupo 5A Demo (semestre=5)
**Qué se ve después del login:** Hub con UACs de Semestre 5 (CH-II, CNEYT-V, IN-V, PM-V)

---

### 👤 Alumnos Semestre 4 (cuenta dedicada)

| Email | Password | Nombre | Semestre | Script |
|-------|----------|--------|---------|--------|
| alumno-sem4@cenbachillerato-demo.com | Demo2026! | Alumno Sem 4 Demo | 4 | `npx tsx scripts/create-demo-alumno-sem4.ts` |

**Grupo asignado:** Grupo 4A Demo (semestre=4)
**Qué se ve después del login:** Hub con UACs de Semestre 4 (LC-IV, PM-IV, IN-IV, CH-I, CNEYT-IV, CS-III)

---

### 👤 Alumnos Semestre 3 (cuenta dedicada)

| Email | Password | Nombre | Semestre | Script |
|-------|----------|--------|---------|--------|
| alumno-sem3@cenbachillerato-demo.com | Demo2026! | Alumno Sem 3 Demo | 3 | `npx tsx scripts/create-demo-alumno-sem3.ts` |

**Grupo asignado:** Grupo 3A Demo (semestre=3)
**Qué se ve después del login:** Hub con UACs de Semestre 3 (LC-III, PM-III, IN-III, PFH-III, CNEYT-III)

---

### 👤 Alumnos Semestre 2 (cuenta dedicada)

| Email | Password | Nombre | Semestre | Script |
|-------|----------|--------|---------|--------|
| alumno-sem2@cenbachillerato-demo.com | Demo2026! | Alumno Sem 2 Demo | 2 | `npx tsx scripts/create-demo-alumno-sem2.ts` |

**Grupo asignado:** Grupo 2A Demo (semestre=2)
**Qué se ve después del login:** Hub con UACs de Semestre 2 (LC-II, PM-II, IN-II, CD-II, CS-II, PFH-II, CNEYT-II)

---

### 👤 Alumnos Semestre 1 (10 cuentas)

| Email | Password | Nombre | Semestre |
|-------|----------|--------|---------|
| alumno1@cenbachillerato-demo.com | Demo2026! | Alumno Uno | 1 |
| alumno2@cenbachillerato-demo.com | Demo2026! | Alumno Dos | 1 |
| alumno3@cenbachillerato-demo.com | Demo2026! | Alumno Tres | 1 |
| alumno4@cenbachillerato-demo.com | Demo2026! | Alumno Cuatro | 1 |
| alumno5@cenbachillerato-demo.com | Demo2026! | Alumno Cinco | 1 |
| alumno6@cenbachillerato-demo.com | Demo2026! | Alumno Seis | 1 |
| alumno7@cenbachillerato-demo.com | Demo2026! | Alumno Siete | 1 |
| alumno8@cenbachillerato-demo.com | Demo2026! | Alumno Ocho | 1 |
| alumno9@cenbachillerato-demo.com | Demo2026! | Alumno Nueve | 1 |
| alumno10@cenbachillerato-demo.com | Demo2026! | Alumno Diez | 1 |

**Cómo loguearse:** `/log-in` → credenciales → checkbox → "Acceder"

**Qué se ve después del login:**
- Redirección a `/hub`
- Layout con sidebar izquierdo + contenido principal
- **Sidebar:** Avatar con inicial del nombre, "Semestre 1", lista de 5 UAC del semestre, logout button
- **Hub principal:**
  - "Hola, Alumno 👋 — Semestre 1"
  - Banner azul: "Contenido pedagógico en desarrollo"
  - Grid de 5 UAC: Lengua y Comunicación I, Pensamiento Matemático I, Conciencia Histórica I, Cultura Digital I, Inglés I
  - Sección: 3 Recursos Socioemocionales (Responsabilidad Social, Cuidado Físico Corporal, Bienestar Emocional Afectivo)
- **Al hacer click en una UAC** (e.g., `/hub/uac/LC-I`):
  - Breadcrumb: Mi Hub / Semestre 1 / Lengua y Comunicación I
  - Header UAC con icono 📝, badge "Recurso Sociocognitivo", "10 progresiones de aprendizaje"
  - Lista de 10 progresiones (placeholder: "Progresión 1 — Lengua y Comunicación I", etc.)
  - Cada progresión es clickeable → `/hub/uac/LC-I/progresion/1`

---

## Notas

- Ninguno de los alumnos tiene `area_eleccion` asignada (se necesita en semestres 3-6)
- El dominio `@cenbachillerato-demo.com` no es real — solo para demo
- **No compartir estas credenciales fuera del equipo de desarrollo**
- Password cumple: 8+ chars, mayúscula, número, especial (!@#$%^&*)
