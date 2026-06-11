# 🎬 Guion de Demostración — CEN Bachillerato
### Audiencia: Inversión / Negocio · Cuenta de muestra: **Semestre 1** · Fecha: 2026-06-10

> **Objetivo de la sesión:** que el cliente perciba una plataforma **terminada, viva y robusta** — datos reales, laboratorios 3D de nivel, y un panel docente con métricas graficables. Duración sugerida: **12–15 min**.

---

## 🔑 Credenciales (todas con contraseña `Demo2026!`)

| Rol | Correo | Lleva a | Para mostrar |
|-----|--------|---------|--------------|
| 🧑‍🎓 **Alumno héroe** | `alumno1@cenbachillerato-demo.com` | `/hub` | Avance 71%, racha 18🔥, 24 fichas |
| 🧑‍🏫 **Docente** | `docente@cenbachillerato-demo.com` | `/dashboard/docente` | Grupo 1A Demo (10 alumnos, sem 1) |
| (respaldo) Alumno top | `alumno2@cenbachillerato-demo.com` | `/hub` | 90% — el mejor de la clase |
| (respaldo) Alumno en riesgo | `alumno9@cenbachillerato-demo.com` | `/hub` | 19% — caso "en riesgo" |

> Base URL local: `http://localhost:3000` · Producción: *(usar dominio de despliegue)*

---

## 🟢 ESCENA 0 — Landing (60 s) · *"La promesa"*

1. Abrir **`/`** (landing de bachillerato) sin sesión.
2. Narrar el pitch: bachillerato alineado al **Modelo Educativo MCCEMS 2025**, 6 semestres completos, contenido **verbatim oficial** + laboratorios 3D interactivos.
3. Scroll a las características (UAC → Propósito formativo → Actividad) y al bloque de áreas de conocimiento.

**Frase ancla:** *"Todo lo que verán a continuación ya está construido y poblado con datos reales de un grupo en operación."*

---

## 🧑‍🎓 ESCENA 1 — Experiencia del alumno (4–5 min) · *"El estudiante"*

**Login:** `alumno1@cenbachillerato-demo.com` / `Demo2026!` → cae en **`/hub`**

1. **Hero del hub:** señalar avance **71%**, **racha de 18 días 🔥** y **24 fichas**. Es un alumno comprometido — los números no son de relleno.
2. **Continuar aprendiendo:** mostrar la tarjeta de continuidad (retoma donde se quedó).
3. **Entrar a un laboratorio 3D estrella.** Elegir 1–2 de estos (todos publicados y verificados):

   | Lab | UAC (Sem 1) | URL |
   |-----|-------------|-----|
   | 🧊 **Estados de la materia** | CNEYT-I «Los estados de la materia y sus cambios» | `/hub/uac/CNEYT-I/progresion/7/actividad/1/practica` |
   | ⚛️ **Modelos atómicos** | CNEYT-I «El átomo: la unidad fundamental de la materia» | `/hub/uac/CNEYT-I/progresion/5/actividad/1/practica` |
   | ⚖️ **Densidad y flotación** | CNEYT-I «Cálculo de densidad» | `/hub/uac/CNEYT-I/progresion/3/actividad/6/practica` |

   **Cómo demostrarlo (Estados de la materia — el más visual):**
   - Mover el control de **temperatura** y ver la transición sólido→líquido→gas en 3D en tiempo real.
   - Señalar el **termómetro de fases** y el desglose de energía / lecturas en vivo.
   - Mencionar el **fallback WebGL** (si el equipo no soporta 3D, degrada con gracia) → robustez técnica.

4. **Biblioteca y referencias:**
   - **`/hub/biblioteca`** — catálogo de fichas de estudio por asignatura (UAC); entrar a una ficha (`/hub/biblioteca/[uac]/ficha/[id]`) para mostrar el contenido teórico de respaldo.
   - **`/hub/recursos`** — material de apoyo y fuentes oficiales citadas (referencias verbatim del Modelo 2025).

**Frase ancla:** *"No es un video ni una simulación grabada: el alumno manipula las variables y la física responde."*

---

## 🧪 ESCENA 2 — Segundo semestre, pico de "wow" (1–2 min) · *"Profundidad"*

> Para mostrar que la plataforma no se queda en lo básico. (Sigue con la misma sesión de alumno o navega directo.)

| Lab | UAC (Sem 2) | URL |
|-----|-------------|-----|
| 🎈 **Gas ideal — PV=nRT (pistón)** | CNEYT-II «Gas ideal y primera ley de la termodinámica» | `/hub/uac/CNEYT-II/progresion/6/actividad/1/practica` |

- Comprimir/expandir el **pistón** y ver cómo presión, volumen y temperatura se relacionan en vivo.
- Cerrar la idea: *"De primero a sexto semestre, cada asignatura de ciencias tiene laboratorios así — 77 prácticas 3D en total."*

---

## 🧑‍🏫 ESCENA 3 — Panel del docente (4–5 min) · *"El control"*

**Cerrar sesión** → **Login:** `docente@cenbachillerato-demo.com` / `Demo2026!` → cae en **`/dashboard/docente`**

1. **Dashboard principal:** vista del **Grupo 1A Demo** con % de avance por asignatura (UAC) en semáforo (verde ≥70 / amarillo ≥40 / rojo).
2. **Ir a Reportes:** **`/dashboard/docente/reportes`** — *aquí está la joya de métricas:*
   - 🍩 **Donut de distribución** de desempeño (alumnos activos por nivel, animado).
   - 📊 **Barras "Avance por Asignatura"** (porcentaje real por UAC del grupo).
   - 📈 **Engagement semanal** (actividad de la cohorte en el tiempo).
   - Todo calculado de los **intentos reales** sembrados — no son mockups.
3. **Lectura pedagógica de la curva** (esto vende el valor docente):
   - **alumno2** (90%) lidera; **alumno1** (71%) es el más constante (racha 18).
   - **alumno8/alumno9** aparecen **desenganchados / en riesgo** → el docente los detecta de un vistazo.
   - **alumno10** "**aún no inicia**" → caso de intervención temprana.
4. **Hall of Fame / XP:** mostrar el ranking por puntaje acumulado (gamificación que motiva al grupo).

**Frase ancla:** *"El docente no solo entrega contenido: ve en segundos quién avanza, quién se atora y a quién hay que llamar hoy."*

---

## 🔵 CIERRE (30 s) · *"Lo que compran"*

- **6 semestres completos** · 32 UAC · 1601 actividades · **77 laboratorios 3D**.
- **Alineado al Modelo MCCEMS 2025**, contenido **verbatim oficial**.
- **Listo para operar:** datos vivos, panel docente con métricas, multi-escuela (RLS por escuela).

---

## ✅ Checklist pre-demo (5 min antes)

- [ ] Servidor corriendo: `npm run dev` → `http://localhost:3000` responde.
- [ ] Probar login alumno1 y docente (que `Demo2026!` funcione).
- [ ] Abrir **una vez** cada lab antes de la demo (precarga el chunk 3D → arranque instantáneo en vivo).
- [ ] Pestañas pre-abiertas en orden: landing → hub alumno1 → lab Estados → reportes docente.
- [ ] Equipo con **WebGL** disponible (verificar en `chrome://gpu` si hay duda).
- [ ] Conexión a Supabase activa (las gráficas leen datos en vivo).

> ⚠️ **Datos demo marcados como no oficiales** donde aplica. Las cuentas `@cenbachillerato-demo.com` y el "Grupo 1A Demo" son exclusivamente para demostración.
