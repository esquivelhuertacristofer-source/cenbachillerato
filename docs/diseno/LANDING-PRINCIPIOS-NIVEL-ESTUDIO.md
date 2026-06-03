# FASE 1 — Principios de nivel estudio + Auditoría CEN Landing

> Documento de trabajo para la elevación de `LandingPageCEN.tsx` (`/`).  
> No es rediseño. Es diagnóstico de ejecución.  
> Fecha: 2026-06-01

---

## 1.1 — Principios concretos: qué hace memorable a una landing de nivel estudio

### PRINCIPIO 1 — Jerarquía tipográfica de 4 capas con contraste real

Una landing de estudio no usa "todos los tamaños razonables". Usa **4 capas con salto dramático**:

| Capa | Tamaño | Propósito |
|---|---|---|
| Display | 120–180px | UN elemento por página, composición gráfica |
| Heading | 72–96px | Título principal de cada sección |
| Title | 36–52px | Subtítulos de sección, eyebrows grandes |
| Body | 15–18px | Párrafos, descripciones |

El problema genérico es tener h1 a 72px, h2 a 56px, h3 a 36px — los saltos son proporcionales pero sin contraste emocional. Un h1 que mide el doble del h2 se siente distinto de uno que mide 3× el h2. La jerarquía es perceptual, no matemática.

**Epilogue (la fuente del proyecto) tiene peso 900 que a 120px se convierte en un elemento compositivo, no solo tipográfico.** Ya está en uso en el sistema (cv2-code del bachillerato). Ese patrón es el correcto — llevar más lejos.

Regla: la letra-tracking a tamaños grandes es `-0.04em` o más. A tamaños pequeños (`<14px`) es positivo (`+0.06–0.18em`). Sin esto, lo grande se ve apretado y lo pequeño ilegible.

---

### PRINCIPIO 2 — Ritmo vertical como composición musical

El ritmo vertical en una landing es equivalente al tempo en música: secciones "comprimidas" (alta densidad) seguidas de secciones "abiertas" (espacio negativo) crean tensión y resolución.

**El error genérico:** `padding: 80px 50px` en todas las secciones. Uniforme = plano = aburrido.

**Escala de ritmo para esta landing:**

```
TIGHT   — 32–48px  → transiciones entre secciones continuas (ally → accordion)
NORMAL  — 64–80px  → secciones estándar de contenido
LOOSE   — 120px    → antes/después de secciones anchor (hero, CTA final)
BREATH  — 160px+   → una sola sección por landing — el momento de pausa mayor
```

La variación misma es el diseño. Si la sección X tiene 120px arriba y 64px abajo, el lector siente que algo importante acaba de pasar.

---

### PRINCIPIO 3 — Composición con tensión (asimetría intencional)

Una landing de nivel estudio tiene **un elemento dominante por sección** y el resto en subordinación. Cuando todo está equilibrado, nada importa.

**Herramientas de tensión:**
- Elementos que sangran fuera del contenedor (imágenes que llegan al edge)
- Tipografía que cruza la división de columnas
- Un número enorme en un corner que "no debería estar ahí"
- Un elemento que no está alineado con el grid pero que claramente fue una decisión

El accordion de productos YA tiene tensión — el panel activo ocupa más espacio que los inactivos. Ese principio debe extenderse a más secciones.

**Anti-tensión:** 4 cards idénticas en row. Todo centrado. Todo con el mismo border-radius. Todo con la misma sombra. El ojo no sabe dónde ir → va a ningún lado.

---

### PRINCIPIO 4 — Espacio negativo como elemento de diseño

El espacio vacío no es "lo que falta" — es el elemento que da peso a lo que hay.

**La trampa:** Cuando algo se ve "incompleto", la reacción habitual es agregar más (íconos de fondo, orbs, partículas, gradientes decorativos). La solución correcta casi siempre es quitar.

**Regla práctica:** Si un elemento decorativo (ícono de fondo, orb, partícula) no tiene una **función compositiva específica** — crear profundidad, dirigir el ojo, establecer escala — no está. No "enriquece", rompe el espacio negativo.

**Los 25 íconos Font Awesome en el hero bg son el ejemplo más claro del anti-patrón.** No tienen composición, no dirigen la mirada, no crean profundidad intencional. Son ruido disfrazado de "detalle".

---

### PRINCIPIO 5 — Motion con propósito (qué animar y qué no)

**Animar SÍ:**
- **Transiciones de estado**: el accordion expand/collapse — el usuario hizo una acción, la UI responde visiblemente. Merece timing cinematográfico.
- **Entrada única de elementos que merecen atención**: el h1 del hero entra UNA vez al cargar — ese momento vale una animación.
- **Feedback de interacción**: hover, focus, press. Respuestas rápidas (< 200ms) que confirman la acción.
- **Motion con información**: el cycling word cambia porque el contenido cambia — la animación comunica el cambio. El dual marquee mueve testimonios porque la información es continua.

**Animar NO:**
- **Fade-in on scroll en absolutamente todo** — cuando todo entra con animación de scroll, nada es especial. Reservar para 2-3 elementos por sección máximo.
- **Decoraciones que flotan indefinidamente** sin propósito semántico (los orbs del hero).
- **Animaciones antes de que el usuario pueda interactuar** con el contenido (el liveCount que corre desde 0 al montar — el usuario no puede hacer nada con eso).
- **Múltiples animaciones simultáneas** que compiten por la atención.

**Timing del proyecto (ya establecido):**
```
springs.snappy  → interacciones (hover, press, accordion toggle)
springs.smooth  → entradas de elementos
springs.gentle  → elementos que "descansan" en posición
durations.fast  → feedback de interacción (0.2s)
durations.slow  → entradas de sección (0.5s)
```
Estos tokens están bien definidos en `src/lib/motion/tokens.ts`. El problema no es el sistema — es aplicarlo con criterio.

---

### PRINCIPIO 6 — Detalles de oficio (lo que nadie nota pero todos sienten)

1. **Optical alignment, no matemático.** Un bloque de texto a 18px y uno a 72px no se "sienten" alineados aunque compartan la misma left position. El más grande necesita 3-4px extra de offset hacia adentro para percibirse alineado.

2. **Color con escasez.** `--cen-accent` (#7DD3FC) es el acento. Si aparece en 20 lugares de la pantalla, deja de ser acento y se convierte en ruido. Studio-level: el acento aparece en **3-5 lugares máximo por sección**, siempre con propósito.

3. **Profundidad solo donde hay jerarquía real.** Las sombras (`box-shadow`) son para crear separación entre capas que tienen relación funcional — no para "hacer que se vea flotante". El nav flotante sobre el contenido → sombra con propósito. Una card de feature en fondo blanco → la sombra no dice nada.

4. **El micro-detalle que nadie copia** — es lo que hace que algo se sienta "hecho a mano". El `ctaPulse` en el botón CTA principal ya es ese detalle. El `--mouse-x/--mouse-y` aura en el accordion también. Necesitamos 2-3 más de esos.

5. **Foco visible elegante.** WCAG AA requiere focus visible. Los studios no lo esconden — lo diseñan. Un ring de `--cen-accent` a 2px offset es más hermoso que el outline del browser y cumple.

6. **`text-wrap: balance`** en todos los h1, h2, h3. Ya está en uso en algunos lugares. Llevarlo a todos. Un título que rompe línea en el lugar equivocado se ve amateurish.

---

### PRINCIPIO 7 — Lo que separa "caro" de "genérico"

| Genérico | Nivel estudio |
|---|---|
| Todo centrado en la sección | Un punto focal dominante, el resto subordinado |
| Cards idénticas en row | Cards con jerarquía interna — una grande, otras pequeñas |
| Gradientes decorativos en todo | Un solo gradiente intencional por sección |
| Padding uniforme en todas las secciones | Ritmo variable — denso → abierto → denso |
| Fade-in on scroll en todo | Motion reservado para lo que merece atención |
| Íconos FA como decoración de fondo | Espacio negativo |
| Hover: scale+shadow en todo | Hover único por tipo de elemento |
| Tipografía de 5 tamaños similares | 4 capas con contraste dramático |
| Hero centrado: título+sub+botón | Hero con composición y punto focal único |

---

## 1.2 — Auditoría de la landing actual (LandingPageCEN.tsx)

> Diagnóstico de **ejecución**, no de identidad. La paleta, fuente y assets son hechos del proyecto.

---

### NAV

**Estado:** Bastante logrado. El floating pill scroll behavior es sofisticado y bien ejecutado.

**Genérico:**
- El estado inicial (sin scroll) tiene brand + links + CTA flotando sobre el hero transparent sin contenedor. Los links se ven sueltos visualmente — la píldora de `nav-links` (fondo `#EFF6FF`) sobre el hero oscuro crea un contraste raro antes de scrollear.
- El `gap: 6vw` entre elementos en estado inicial es inconsistente en viewports intermedios.

**Oportunidad:**
- En estado inicial (hero oscuro), los nav-links podrían no tener su pill de fondo `#EFF6FF` — solo los links blancos sobre transparente. La píldora se activa con el scroll. Unifica mejor la lectura sobre el hero.
- `will-change: transform` en `.nav` para evitar jank en el reposicionamiento.

**Se mantiene:** El scroll → pill animation, el mobile menu overlay, los colores del nav-scrolled.

---

### HERO

**Estado:** La composición split (texto izquierda / foto derecha) es el enfoque correcto. Tiene varios elementos bien concebidos pero la ejecución está en capas.

**Genérico / a eliminar:**
1. **`hero-icons-bg`** — 25+ íconos Font Awesome posicionados con pixel positions hardcodeadas. Sin composición, sin eje visual, sin propósito salvo "llenar". Es el anti-patrón más claro del archivo. **Eliminar completamente.**
2. **`hero-orbs` (3 orbs)** — Círculos gradientes sin identidad. No comunican nada de CEN. El glow puede existir pero como elemento único e intencional, no como 3 blobs flotantes.
3. **`hero-particles`** — 12 puntos flotando hacia arriba. Decoración genérica de circa 2022. Agregan complejidad sin aportar composición.
4. **El browser mockup** (`hero-mockup-sm`) — La idea es buena pero `scale(0.56)` lo hace demasiado pequeño para leerse y demasiado grande para ser puramente decorativo. Está en un limbo. Necesita o agrandarse (como elemento visual real que muestra la plataforma) o integrarse de otra manera.
5. **`hero-scroll-hint`** — El "línea + chevron" en el centro inferior. Genérico universal. Puede refinarse.

**Bien logrado — mantener y elevar:**
- El cycling word (`sí funciona. / transforma. / inspira. / avanza.`) — es el elemento más diferenciador del hero. Merece más protagonismo, más espacio tipográfico, más presencia.
- La alternancia relleno/outline en el cycling word (`cw-outline`) — detalle elegante.
- Las `hero-cred-pills` (SEP Oficial, MCCEMS...) — bien concebidas, pueden refinarse con entrada más elegante.
- La `hero-live-card` (avatares + count) — social proof bien ubicado. Puede pulirse.
- La `hero-student-glow` (radial glow detrás de la foto) — sutil y efectivo.
- El `hero-bottom-fade` + wave SVG — la transición al contenido está bien resuelta.
- La mascara CSS en la foto (`mask-image`) — correcto conceptualmente.

**Oportunidad de elevación:**
- El hero-title a `clamp(56px, 7vw, 104px)` con `line-height: 0.92` ya es display-level — el cycling word puede ir más grande, más audaz.
- Quitar el ruido del fondo libera la composición: foto del estudiante + texto + cycling word como el núcleo visual. Sin distracciones.
- El mockup puede convertirse en un elemento flotante más integrado, no apilado en el corner inferior derecho.

---

### ALLIES MARQUEE (subsistemas)

**Estado:** El marquee técnico está bien ejecutado (mask-image de fade, hover pause). Pero la sección completa es pesada.

**Genérico:**
- El h2 centrado ("Compatible con los principales sistemas educativos de México") + `allies-divider` encima del marquee convierte una franja dinámica en una sección estándar. Mata la velocidad visual.
- El dot-grid de fondo (`radial-gradient(circle, rgba(99,102,241,0.06) 1.5px, transparent 1.5px)`) — patrón sobreutilizado en 2023-2024. Dejar el fondo plano es más elegante.
- Los `allies-bg-icons` (6 íconos FA) — más scatter decorativo.
- El `allies-divider` (línea de 48px con color accent) — elemento ornamental genérico.

**Oportunidad:**
- Esta sección puede ser una **franja editorial rápida**: eyebrow mínimo + marquee. Sin h2, sin divider, sin íconos de fondo. La velocidad del marquee ya comunica el mensaje.
- Alternativamente, darle tratamiento de contraste — franja oscura (navy) entre las secciones light del hero y del accordion.

---

### PRODUCTOS / ACCORDION

**Estado:** El elemento más diferenciador de toda la landing. El concepto del accordion expandible con imagen + overlay de color + telemetría es genuinamente bueno. **Proteger y elevar.**

**Genérico:**
- El `prod-heading` tiene la estructura estándar: eyebrow pequeño + h2 + párrafo de descripción. Sin impacto. Baja jerarquía para una sección tan importante.
- El `prod-side-label` ("Ecosistema CEN" vertical + "08") — es el tipo de elemento editorial sofisticado que puede tener más presencia. Actualmente es casi invisible.
- Los paneles colapsados muestran `acc-tier` + `acc-vname` en texto — funcional pero sin carácter visual.
- El `prod-ambient-glow` (glow que cambia con el panel activo) — detalle bueno pero poco visible.

**Bien logrado:**
- El `AccPanel` como subcomponente con `useMouseAura` — arquitectura correcta y detalle de oficio.
- La `acc-glass-edge` — el borde cristalino es un micro-detalle de calidad.
- La telemetría (`acc-exp-tel`) con 3 items por producto — información densa bien organizada.
- El mouse aura highlight (radial-gradient que sigue el cursor) — detalle que distingue.

**Oportunidad:**
- El heading de esta sección merece tipografía display — algo grande que anuncie "aquí está el ecosistema".
- El panel colapsado puede mostrar el número de índice (`01`–`08`) como elemento tipográfico grande, visible, que dé carácter a la columna estrecha.
- La transición expand → collapse puede ser más cinematográfica con un timing de 0.5s y `ease: emphasized`.

---

### PROCESO (4 pasos)

**Estado:** Es la sección con mayor brecha entre contenido y ejecución. El contenido es poderoso ("en menos de 24 horas"). La ejecución es el anti-patrón puro.

**Genérico:**
- **4 cards idénticas en row horizontal.** Es explícitamente el anti-patrón prohibido: "Cards flotantes redondeadas idénticas sin jerarquía". El ojo no sabe a dónde ir — ve 4 cosas iguales.
- El `paso-num-bg` (número grande gris de fondo: "01", "02"...) — el "typographic watermark" es un truco muy visto que en este contexto no aporta. El número ya está en `paso-step-num` visible.
- El `proceso-connector` (línea horizontal) — es el único elemento que diferencia esto de un grid de features, pero en mobile se rompe y pierde sentido.
- Los íconos `paso-icon-wrap` son todos del mismo tamaño, mismo fondo, mismo tratamiento.

**Oportunidad — mayor potencial de transformación:**
- Un layout de **timeline asimétrico**: el paso 01 como elemento dominante (texto grande, prominente), los pasos 02-04 como elementos más compactos subordinados. La asimetría crea jerarquía.
- Alternativamente: lista vertical editorial — el número del paso muy grande (100px), el título a su lado, la descripción debajo. Simple, fuerte, escalable en mobile.
- El tagline "Sin infraestructura. Sin instalación. Solo un correo." merece ser tipografía grande, no una línea de cuerpo.

---

### FEATURE SPLIT (Por qué CEN)

**Estado:** El anti-patrón más explícito de la landing. "Texto izquierda + imagen derecha" es la composición más usada y más genérica de las landings de 2020-2024.

**Genérico:**
- La foto con `fsf-ring` y `fsf-blob` son decoraciones genéricas alrededor de una foto de stock.
- La lista de `<motion.li>` con `fa-check-circle` es el "lista de beneficios con checkmark" más visto del mundo SaaS.
- El slide-in `x: -20` es el fade-in on scroll aplicado a cada elemento sin criterio.
- El tagline "La plataforma educativa que México merece" es ambicioso pero está embebido en un componente genérico.

**El contenido es poderoso:**
- "34 UAC del currículo oficial, alineadas a la SEP y el MCCEMS 2023"
- "Evaluación formativa en tiempo real que no interrumpe el ritmo de la clase"
- "Operativo desde el primer día"

Estos puntos merecen un layout con más tensión compositiva.

**Oportunidad:**
- Usar la tipografía display: el número "34" como elemento gráfico dominante. Un layout que hace del dato el héroe visual.
- La sección puede ser fullbleed navy con el contenido en blanco — contraste de valor que crea pausa.
- Las checkmarks pueden reemplazarse por algo más propio del sistema de diseño CEN.

---

### TESTIMONIOS (dual marquee)

**Estado:** El dual marquee (fwd + rev) es el segundo elemento más diferenciador de la landing después del accordion. Bien concebido.

**Genérico:**
- El `.test-bg-icons` — 10 íconos Font Awesome scatter. Ya es el tercer banco de íconos decorativos en la landing. **Eliminar.**
- El header es el estándar: eyebrow (`fas fa-star`) + h2 + párrafo. La estrella como ícono del eyebrow es genérica.
- Las tarjetas `test-mq-card` son simples: border-radius + texto + avatar sin carácter propio.

**Bien logrado:**
- El concepto dual-direction marquee — crea un campo visual dinámico único.
- 8 testimonios reales con nombres y quotes específicos — contenido de calidad.
- Los avatares con color individual (`t.color`) — pequeño detalle de personalización.

**Oportunidad:**
- Quitar los íconos de fondo para que el marquee respire.
- Las tarjetas pueden tener variación — algunas con quote muy grande (2-3 palabras, font grande) como highlight, otras con el texto completo.
- El header puede ser más editorial: la comilla tipográfica gigante (`"`) como elemento visual en lugar del eyebrow genérico.

---

### CTA FINAL

**Estado:** Correcto pero no memorable. El último momento de la landing — el que determina si el usuario actúa — tiene el diseño más conservador.

**Genérico:**
- Los 3 `cta-orb` decorativos son los mismos blobs de siempre.
- "¿Listo para dar el primer paso?" es la frase más usada en CTAs SaaS de todos los tiempos.
- Las action cards están bien estructuradas (icon + label + title + arrow) pero el layout total no tiene impacto.

**Bien logrado:**
- El `fv-pulse` (punto verde pulsante "Acceso institucional disponible") — micro-detalle que comunica disponibilidad.
- Las dos action cards tienen jerarquía clara: primary (CEN Bachillerato) vs. secondary (contacto).

**Oportunidad — alto impacto con bajo riesgo:**
- Convertir esta sección en el momento de mayor ambición tipográfica: una headline muy grande que ocupa la pantalla, los CTA como elementos secundarios que entran desde abajo.
- El fondo ya es el navy profundo correcto. Agregar UN elemento de textura intencional (no 3 orbs) — por ejemplo, la tipografía "CEN" muy grande, opacity 0.04, como watermark.
- El copy puede ser más específico: no "primer paso" genérico, sino algo ligado al MCCEMS o a los docentes.

---

## 1.3 — Referencias internas: patrones de calidad del ecosistema CEN

### LandingPageBachillerato.tsx — qué tiene de mejor

| Patrón | Implementación | Cómo aplicar en CEN (/) |
|---|---|---|
| **Identificadores tipográficos grandes** | `cv2-code` — "CF / CFE / CA / CL" como watermarks tipográficos en las cards | Los índices "01"–"08" del accordion como elementos display |
| **Stats row compacto** | `hv2-stats` — 4 datos en row horizontal (334 Progresiones · 34 UAC · 8 RSC · 6 Semestres) | En el hero de CEN (/) puede existir una row similar con datos del ecosistema |
| **Foto fullbleed con overlay** | `students-banner` — foto horizontal a todo ancho con chips flotantes | El feature-split puede reconvertirse en una sección más cinematográfica |
| **Carousel con drag** | `rsc-carousel` — drag/touch support, viewport + track + slides | El accordion ya es más avanzado, pero el patrón de interactividad táctil es aplicable |
| **Hero más limpio** | `hv2-body` — menos elementos, más espacio, la foto no tiene 20 decoraciones | El hero de CEN (/) tiene demasiadas capas; la limpieza del bachillerato es referencia |
| **Densidad de información bien resuelta** | Las cards de currículo tienen mucha info (code + tag + title + desc + meta) pero se leen limpiamente | La telemetría del accordion puede mejorar inspirándose en esto |

### Sistema de motion — ya existe, aplicar con más criterio

```ts
// src/lib/motion/tokens.ts — estos tokens ya están; aplicarlos con propósito:
springs.snappy   → toggles, hover, press
springs.smooth   → entradas de sección (una vez)
springs.gentle   → elementos que "descansan" (floating cards)
springs.bouncy   → celebrate — NO usar en landing pública (demasiado playful)

// useMouseAura, useInView, useReducedMotion ya implementados
// Son primitivas de calidad — usarlas más en la landing nueva
```

### La paleta funciona — el problema es la dosis

```
--cen-navy  (#0B2545) → fondos principales, navbar, footer
--cen-blue  (#1E40AF) → eyebrows, acentos de texto, bordes activos
--cen-accent (#7DD3FC) → ONE hero element, botón CTA principal, active states
--bg (#F8FAFC)         → fondos claros
--ink (#0B2545)        → texto sobre fondo claro
```

El accent `#7DD3FC` está en demasiados lugares simultáneamente: dots del marquee, pills del hero, live dot, float badges, border del nav, active states, CTAs. Cuando aparece en todo, no acenta nada.

---

## Resumen ejecutivo para FASE 2

**Las 3 mayores oportunidades de elevación:**

1. **El hero** — Quitar el ruido (25 íconos scatter, 3 orbs, 12 partículas) y dejar que el cycling word y la foto respiren. El resultado será dramáticamente más limpio y más impactante con exactamente los mismos assets.

2. **La sección "Proceso"** — Transformar las 4 cards idénticas en un layout asimétrico con jerarquía real. Es la sección con mayor delta entre potencial del contenido y calidad de la ejecución.

3. **El feature split** — Reconvertir el layout estándar foto/texto en algo más propio de CEN. El contenido (34 UAC, tiempo real, desde el primer día) merece ser el elemento visual, no solo el texto de un bullet.

**Lo que NO tocar:**
- El accordion de productos — es el diferenciador. Solo refinar, no reconstruir.
- El dual marquee de testimonios — solo quitar el ruido de fondo, mantener el concepto.
- El CTA Final con las action cards — el concepto es correcto, solo el envoltorio necesita más ambición.
- El nav floating pill — está bien logrado.

**El anti-patrón sistémico a resolver:**
Los 3 bancos de íconos Font Awesome decorativos scatter (hero-icons-bg: 25 íconos, allies-bg-icons: 6 íconos, test-bg-icons: 10 íconos) son el síntoma más visible del problema. Su eliminación sola, sin ningún cambio más, mejoraría la landing significativamente.
