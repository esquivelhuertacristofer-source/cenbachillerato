# Decisiones de Diseño — Sesión rediseño actividades (2026-05-18)

## DEC-01: lucide-react no instalado → Font Awesome

**Contexto:** La especificación menciona `lucide-react` como librería de iconografía.

**Hallazgo:** `lucide-react` no está en `package.json`. El stack ya usa Font Awesome (clases `fa-solid`, `fa-regular`) en todos los componentes del hub.

**Decisión:** Usar Font Awesome a lo largo de todos los renderers y ActivityShell. Consistencia con hub existente.

**Criterio de revisión:** Si se instala `lucide-react` en el futuro, evaluar migración.

---

## DEC-02: Dark theme completo vs. contenido claro en fondo oscuro

**Contexto:** La especificación pide fondo navy oscuro (#011C40) y glassmorphism.

**Decisión:** Dark theme completo en toda la vista de actividad y progresión.
Todos los renderers usan inline styles con glassmorphism dark (bg rgba(255,255,255,0.04), border rgba(255,255,255,0.08)).

**Razón:** Consistencia con Hub clonado. Fondo blanco en contexto dark se siente disruptivo.

---

## DEC-03: Botón "Entregar" — dentro de cada renderer (no sticky global)

**Contexto:** La spec pide un "sticky footer CTA". 

**Decisión:** Cada renderer controla su propio botón de entrega. El botón usa `position: sticky` mediante el propio CSS del renderer (bottom del scroll).

**Razón:** La lógica de habilitación del botón es específica de cada tipo (ej: fill_blanks necesita todos los huecos, reflexión necesita mínimo de palabras). Centralizar este estado en el shell crearía acoplamiento innecesario.

---

## DEC-04: Quiz — click-to-verify inmediato, luego "Siguiente"

**Contexto:** La spec pide pregunta por pantalla con "Siguiente" button deshabilitado hasta responder.

**Decisión:** Al hacer click en una opción, se verifica inmediatamente (sin botón "Verificar" intermedio). Luego aparece "Siguiente" o "Ver resultados".

**Razón:** Flujo tipo Brilliant/Duolingo — más fluido, reduce pasos.

---

## DEC-05: Sidebar de progresión — solo desktop (≥1024px)

**Contexto:** La spec pide sidebar sticky opcional en desktop.

**Decisión:** CSS `@media (max-width: 1023px) { .ash-sidebar { display: none } }`. En mobile el contenido ocupa todo el ancho.

**Razón:** Mobile tiene espacio insuficiente para sidebar de 248px junto al contenido del renderer.

---

## DEC-06: Lectura — preguntas de comprensión con textarea libre

**Contexto:** Actualmente preguntas de comprensión como `<details>` (mostrar/ocultar respuesta guía).

**Decisión:** Textareas para capturar la respuesta del alumno. La respuesta_guia aparece DESPUÉS de entregar.

**Razón:** Más pedagógico — el alumno reflexiona antes de ver la respuesta guía.

---

## DEC-07: EjercicioMatematico con respuesta incorrecta — no navega de vuelta

**Contexto:** Si el alumno responde incorrectamente, `entregarActividad` NO se llama (completada=false). El alumno permanece en la pantalla.

**Decisión:** Sin cambiar la lógica actual. El alumno puede ver la solución correcta pero la actividad queda sin completar hasta que... no hay reintento en la UI actual.

**TODO para próxima sesión:** Agregar botón "Reintentar" que resetea el estado del renderer. Actualmente el alumno debe recargar la página para reintentar.
