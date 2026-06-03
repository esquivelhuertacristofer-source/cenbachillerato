# FASE 2 — Concepto Creativo: Landing CEN (/)

> Propuesta de concepto rector para elevar `LandingPageCEN.tsx` a nivel estudio.  
> **REQUIERE APROBACIÓN antes de codear.**  
> Fecha: 2026-06-01

---

## LA IDEA RECTORA: "ESTRUCTURA VIVA"

CEN hace algo que ningún otro software educativo mexicano hace: toma el currículo oficial de la SEP — ese documento denso, institucional, que vive en PDFs del gobierno — y lo convierte en algo que funciona, que se puede navegar, que avanza progresión a progresión.

La landing debe comunicar exactamente eso. No explicándolo con palabras. **Siendo eso.**

**El concepto:** La landing es una estructura que se puede recorrer. Como un edificio bien diseñado: tiene espacios grandes y solemnes (el hero, el CTA), corredores de transición (el marquee, la franja de stats), y salas de detalle (el accordion, el proceso). Cada sección tiene un peso distinto. Algunas son densas de información — los datos son los protagonistas visuales. Otras casi vacías, solo el texto y el espacio.

**Lo que esto NO es:**
- No es el ed-tech playful/colorido de 2018 (Duolingo palette, bubble icons, ilustraciones)
- No es el SaaS B2B genérico de 2022 (hero centrado, features en 3 columnas, testimonios en carousel)
- No es una landing gubernamental aburrida

**Lo que SÍ es:**
Una institución seria que construyó algo moderno. La densidad es voluntaria. Los números son reales. La plataforma existe y funciona — la landing lo demuestra mostrando la estructura, no prometiéndola.

**Referentes de tono:** Un reporte anual bien diseñado de una universidad de primer nivel. Una publicación educativa institucional que fue intervenida por un buen estudio de diseño. Información densa, tipografía fuerte, espacio negativo intencional.

---

## CARÁCTER VISUAL RESULTANTE

### Lo que se ve diferente

| Antes (genérico) | Después (Estructura Viva) |
|---|---|
| Íconos FA scatter en todos los fondos | Espacio negativo. El vacío es el diseño |
| 3 bancos de orbs/partículas/blobs | UN momento de profundidad visual por sección |
| Cards idénticas en grid | Composición con elemento dominante y subordinados |
| Todo fade-in on scroll | Motion reservado: accordion, heading único, números |
| Gradientes decorativos | El fondo es el fondo — no se disculpa |
| Padding 80px uniforme | Ritmo: TIGHT → NORMAL → LOOSE → BREATH |
| Los datos como texto de cuerpo | Los datos como arquitectura visual ("34", "127+", "08") |

### El número como elemento gráfico

El mayor activo no explotado de CEN son sus propios números: **34 UAC. 342 progresiones. 127+ docentes. 08 plataformas. 364 actividades. 40 simuladores.**

En la landing actual, estos números aparecen dentro de párrafos, en pills, en telemetría. Son texto.

En "Estructura Viva", algunos de estos números son **elementos compositivos** — tan grandes que se convierten en parte del fondo visual de una sección. El `34` en "Por qué CEN" es el elemento dominante de la sección, no el título. El `08` en el heading del accordion es el watermark arquitectónico de la sección. El `127+` en el hero es más grande que el subtítulo.

Esto ya existe en el ecosistema CEN — el `cv2-code` del bachillerato hace exactamente esto con "CF / CFE / CA / CL". Se trata de extender ese principio a la landing principal con más audacia.

---

## SISTEMA TIPOGRÁFICO CONCRETO

Fuente: Epilogue (ya cargada). Sin nuevas fuentes.

```
DISPLAY  → clamp(96px, 11vw, 156px) · weight 900 · tracking -0.05em · lh 0.88
           Uso: números como gráfica (34, 08, 127+), cycling word (solo en hero)
           Aparece en: hero (cycling word), accordion heading (08), por-que-cen (34), cta

HEADING  → clamp(64px, 7.5vw, 96px) · weight 900 · tracking -0.04em · lh 0.92
           Uso: el título principal de cada sección — UNO por sección
           Aparece en: hero-title, proceso-title, testimonios-title, cta-headline

TITLE    → clamp(36px, 4vw, 56px) · weight 900 · tracking -0.035em · lh 0.95
           Uso: h2 de secciones secundarias, nombre del producto en el accordion
           Aparece en: allies heading (si existe), prod-heading-h2

SECTION  → clamp(22px, 2.5vw, 32px) · weight 800 · tracking -0.025em · lh 1.1
           Uso: títulos de pasos, títulos de cards, subtítulos
           Aparece en: paso-title, acc-exp-name, feature-title

LABEL    → 10–12px · weight 800 · tracking +0.14em · uppercase
           Uso: eyebrows, metadata, categorías, badges
           Aparece en: hero-badge, eyebrows, acc-tier, acc-exp-eyebrow

BODY     → clamp(15px, 1.3vw, 17px) · weight 500 · tracking 0 · lh 1.65
           Uso: párrafos de descripción, contenido de sección
```

**Regla crítica:** En una pantalla, máximo 2 tamaños de la escala DISPLAY/HEADING activos simultáneamente. Si el cycling word es DISPLAY (120px), el hero-title es HEADING (80px). No dos elementos DISPLAY compitiendo.

**`text-wrap: balance`** en todos los elementos HEADING y TITLE. Sin excepciones.

---

## SISTEMA DE MOTION

### Lo que se mueve y por qué

| Elemento | Tipo de motion | Timing | Porqué |
|---|---|---|---|
| Hero entry (badge → title → sub → ctas → pills) | Stagger sequential | springs.smooth · 0.05s delay entre cada | El héroe merece una entrada orquestada |
| Cycling word (fade + translateY) | Transition CSS | 280ms ease · cada 3.2s | Comunica el cambio semántico |
| Accordion expand/collapse | spring + CSS transitions | springs.snappy (flex) + 380ms ease (content) | Es el momento de mayor interacción |
| Mouse aura en accordion panels | CSS custom property + requestAnimationFrame | Tiempo real | Feedback de cursor — ya existe, mantener |
| Número count-up ("34", "127+") | setInterval | 22ms step · activado por useInView | Los números crecen porque son reales, no decoración |
| Proceso steps entrada | Stagger via motion.js | springs.smooth · 0.08s stagger | 4 elementos que entran con propósito |
| CTA action cards hover | motion.js whileHover | springs.snappy · y: -4, scale: 1.02 | Feedback de interacción claro |
| Marquee de subsistemas | CSS animation: marquee | 22s linear infinite | Motion continuo — fluidez |
| Dual marquee testimonios | CSS animation · fwd + rev | 28s / 22s linear | Dirección opuesta crea campo visual |

### Lo que NO se mueve

- ~~Partículas flotando hacia arriba~~ → eliminadas
- ~~Orbs flotando con animation~~ → eliminados (o reemplazados por UN elemento estático)
- ~~Íconos decorativos de fondo~~ → eliminados
- ~~Cada item de lista con slide-in~~ → solo el contenedor de la lista
- ~~Count-up en mount~~ → solo cuando el elemento entra al viewport

### Reduced motion

Todos los CSS `@keyframes` tienen su contraparte con `@media (prefers-reduced-motion: reduce)` que detiene o elimina la animación. El hook `useReducedMotion()` ya está implementado — aplicarlo de forma consistente en toda la landing nueva.

---

## TRATAMIENTO DEL HERO — LA PIEZA CLAVE

### Concepto

El hero actual tiene 6 capas visuales superpuestas: fondo navy, dot grid, 3 orbs, 12 partículas, 25 íconos FA, glow radial, foto, bottom fade, wave, 2 float badges, browser mockup, live card, scroll hint.

**El héroe elevado tiene 4 capas:** fondo navy, foto del estudiante, glow radial (un único), texto.

La reducción de capas es el cambio más significativo. No porque las capas estén mal — sino porque se cancelan mutuamente. Cuando hay 6 cosas compitiendo por atención, nada tiene atención.

### Composición

```
┌─────────────────────────────────────────────────────────────┐
│ [NAV — flotante sobre hero]                                  │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│  [EYEBROW: eyebrow text] │  [FOTO /1.png — full-height]    │
│                          │   con mask fade en borde izq.   │
│  Educación que           │                                  │
│  ████████████████        │  ┌─────────────────────────┐    │
│  [CYCLING WORD — 96px+]  │  │ [BADGE: MCCEMS · 34 UAC]│    │
│  color: --cen-accent     │  └─────────────────────────┘    │
│                          │                                  │
│  [párrafo descripción]   │                                  │
│                          │                                  │
│  [CTAs: primary + ghost] │                                  │
│                          │                                  │
│  [pills: SEP · MCCEMS    │  ┌────────────────────────────┐ │
│   Acuerdo · LFPDPPP]     │  │ 🟢 127+ docentes activos   │ │
│                          │  └────────────────────────────┘ │
│  ↓ [scroll hint mínimo]  │                                  │
└──────────────────────────┴──────────────────────────────────┘
```

### Cambios específicos

**Cycling word — el elemento dominante:**
- Tamaño: `clamp(72px, 9vw, 120px)` — casi al nivel DISPLAY en desktop, HEADING en mobile
- Sigue siendo color `--cen-accent` (#7DD3FC) para los pares, outline para los impares
- La transición no es solo opacity+translateY — agrega un subtle `filter: blur(8px) → blur(0)` de 160ms para un efecto de "enfoque", más cinematográfico
- El outline word (`cw-outline`) usa `WebkitTextStroke` que ya está implementado

**Lo que sale:**
- ~~`hero-icons-bg`~~ → eliminado por completo (25 íconos)
- ~~`hero-orbs` (3 elementos)~~ → eliminados
- ~~`hero-particles` (12 spans)~~ → eliminados
- ~~`hero-bg` (SVG decorativo)~~ → eliminado (el dot-grid ::before puede quedar o reducirse a opacity 0.025)

**Lo que queda:**
- `hero-student-glow` → se mantiene (UN único elemento de profundidad)
- `hero-float-badge` x2 → se mantienen, pero con entrada animada (springs.smooth · delay 0.9s)
- `hero-live-card` → se mantiene, puede refinar el layout interno
- `hero-scroll-hint` → se mantiene o simplifica a solo la línea vertical sin chevron

**Browser mockup:**
Hay dos caminos. En el concepto recomiendo **opción A** pero **el usuario decide**:

> **Opción A (recomendada):** Eliminar el mockup pequeño. La foto del estudiante + los 2 float badges ya comunican el producto. El mockup a `scale(0.56)` está en un limbo que no funciona bien.
>
> **Opción B:** Agrandar el mockup significativamente (`scale(0.75)` o más), posicionarlo superpuesto a la foto en un corner con más intención, hacer que sea legible. Si se queda, tiene que poder leerse.

---

## SECCIÓN POR SECCIÓN — MOCKUP EN PALABRAS

---

### SECCIÓN 1 — NAV

**Estado actual:** Correcto y bien ejecutado. Cambios mínimos.

**Mockup:**

```
[Logo CEN — 42px alto, blanco]  [Inicio · Productos · Instituciones · Por qué CEN]  [¡Empieza Ahora! — pill]
```

**En estado inicial (hero oscuro):** Los nav-links NO tienen la pill `#EFF6FF` de fondo — solo texto blanco sobre transparente. La pill de fondo del grupo de links se activa al scrollear (junto con la pill del nav completo). Esto unifica mejor la lectura sobre el hero.

**Al scrollear:** La pill navy ya implementada. Sin cambios.

**Delta de cambio:** Mínimo — solo el estado inicial de los nav-links.

---

### SECCIÓN 2 — HERO

**Concepto:** "El primer argumento."

La landing abre con la pregunta latente del usuario: "¿Esto funciona de verdad, o es otro software mexicano genérico?" El hero responde con la cycling word — *sí funciona* — y con el único elemento de prueba que importa antes del detalle: la foto real de un estudiante usando la plataforma, y los datos concretos (MCCEMS, 34 UAC, 127+ docentes activos).

**Mockup:**

```
─────────────────────────────────────────────────────────────────────────
FONDO: navy gradient (#0B2545 → #0E2D56) · dot-grid ::before a opacity 0.02

COLUMNA IZQUIERDA (55%) · padding: 100px 48px 100px 12vw
─────────────────────────────────────────────────────────────────────────
[badge: 11px · uppercase · tracking 0.18em · color accent]
● CAMPAÑA EDUCATIVA NACIONAL
─ [28px wide · 2px · color accent]

[h1 · weight 900 · clamp(64px, 7.5vw, 96px) · tracking -0.04em · lh 0.92]
"Educación que"

[CYCLING WORD · weight 900 · clamp(72px, 9vw, 120px) · tracking -0.04em]
"sí funciona."  ← color accent, filled
"transforma."   ← outline (cw-outline)
"inspira."      ← color accent, filled
"avanza."       ← outline

[párrafo · 17px · weight 500 · lh 1.65 · color rgba(255,255,255,0.82)]
"CEN reúne el currículo oficial mexicano en una plataforma
moderna para escuelas, docentes y estudiantes."
max-width: 500px

[gap 40px]

[CTAs en row]
  [btn-cta: pill sky · "¡Empieza Ahora! →"]    ← con ctaPulse ring
  [btn-cta-demo: ghost · "Iniciar Sesión ›"]

[gap 28px]

[pills en row · 4 items]
  [• SEP Oficial] [• MCCEMS 2023] [• Acuerdo 09/08/23] [• LFPDPPP]

─────────────────────────────────────────────────────────────────────────
COLUMNA DERECHA (45%) · overflow hidden · full height
─────────────────────────────────────────────────────────────────────────
FOTO /1.png · object-fit: cover · object-position: top center
mask-image: gradient left edge (transparent → black a 20%)

[hero-student-glow: radial gradient sky · opacity 0.12 · un único elemento]

[Float badge TOP-RIGHT · backdrop-blur · border accent]
  🎓 MCCEMS · 34 UAC

[Float badge MID-RIGHT · 44% vertical · backdrop-blur]
  🏫 7+ subsistemas

[Live card BOTTOM-LEFT: enraizado en la columna izquierda · bottom 48px]
  🟢 · [5 avatares stacked] · "127+ docentes activos"

[Hero bottom fade: gradient to bottom · merges with wave]
[Wave SVG a #F8FAFC]
─────────────────────────────────────────────────────────────────────────
```

**Lo que no está:**
- ~~25 íconos scatter~~ — fuera
- ~~3 orbs animados~~ — fuera
- ~~12 partículas~~ — fuera
- ~~browser mockup~~ — fuera (opción A; el usuario puede revertir a opción B)

---

### SECCIÓN 3 — ALLIES (franja subsistemas)

**Concepto:** "Transición editorial." Una franja comprimida que separa el hero de los productos. No es una sección con argumento propio — es ritmo y aceleración visual.

**Mockup:**

```
─────────────────────────────────────────────────────────────────────────
FONDO: navy oscuro (#070D1B) · contraste con el #F8FAFC que viene del hero wave
Padding: 24px 0 · overflow hidden

[Eyebrow centrado · 10px · uppercase · tracking 0.18em · color accent · opacity 0.55]
  "Subsistemas educativos compatibles"

[gap: 16px]

[Marquee a todo ancho · mask fade edges]
  DGB · • · DGETI · • · DGETAyCM · • · CONALEP · • · COBACH · • · CECYT · • · [repeat]
  
  ally-name: 13px · weight 800 · tracking 0.08em · color rgba(255,255,255,0.5)
  ally-dot: 4px · color accent · opacity 0.5 · no glow
─────────────────────────────────────────────────────────────────────────
```

**Delta de cambio:**
- Sale el h2 completo ("Compatible con los principales sistemas educativos...")
- Sale el `allies-divider`
- Salen los 6 íconos de fondo
- Sale el dot-grid de fondo (queda solo el navy plano)
- El fondo cambia de `#F8FAFC` a navy oscuro → crea una franja de contraste entre hero y accordion
- El eyebrow existe pero reducido y con opacidad baja (es sutil, no protagonista)
- Los colores del ally-name y ally-dot se vuelven más sutiles (compatibles con el fondo oscuro)

---

### SECCIÓN 4 — PRODUCTOS (accordion)

**Concepto:** "El ecosistema en detalle." La sección más importante después del hero. Aquí el usuario entiende la escala de CEN: 8 plataformas, de preescolar a robótica.

**Mockup del heading:**

```
─────────────────────────────────────────────────────────────────────────
FONDO: #F8FAFC (light)
Padding top: 100px · padding horizontal: max(48px, 6vw)

LAYOUT: grid 2 columnas → [etiqueta lateral izq · 80px] [contenido · resto]

ETIQUETA LATERAL (rotada 90°, visible solo en desktop):
  "ECOSISTEMA CEN" · 10px · weight 800 · tracking 0.18em · uppercase · ink-40
  Esta es la única decoración de sidebar — y está ahí porque da escala editorial

COLUMNA PRINCIPAL:
  ┌─────────────────────────────────────────────────────────────┐
  │ [eyebrow row: horizontal split]                              │
  │   IZQUIERDA: "Ecosistema CEN" · label style                 │
  │   DERECHA: "08 plataformas" · label style · ink-40          │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │ [h2 · TITLE scale · clamp(40px, 4.5vw, 60px)]              │
  │  "Plataformas educativas para"                              │
  │  "cada etapa de tu vida"          ← text-wrap: balance      │
  │                                                             │
  │ [sub · 17px · weight 500 · max-width 540px · ink-60]       │
  │  "Del preescolar al bachillerato — cada producto..."         │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘

[ ambient glow — color activo · opacity 0.12 · posición absoluta ]

─────────────────────────────────────────────────────────────────────────
ACCORDION (sin cambios estructurales en el componente AccPanel)
─────────────────────────────────────────────────────────────────────────
```

**Elevación del accordion — lo que cambia:**

El componente `AccPanel` se mantiene. Los cambios son en el CSS de los estados:

- **Panel colapsado:** El `acc-tier` ("EMS", "STEM", "K-12") se hace más grande y prominente — era un texto pequeño, pasa a ser el elemento visual del panel estrecho. También aparece el índice numérico como elemento tipográfico: `01`, `02`... en `clamp(28px, 3vw, 40px)` · weight 900 · tracking -0.04em · color rgba(255,255,255,0.2). Este número "fantasma" da escala sin competir.
- **Panel activo:** La transición flex ya implementada. Se refina el timing: los paneles inactivos se comprimen con `springs.snappy` (rápido), el panel activo se expande con `springs.smooth` (cinematográfico). El `acc-exp-inner` hace una entrada con `opacity: 0 → 1` + `translateY(8px → 0)` · `springs.smooth · delay 0.12s`.
- **Glass edge:** Se mantiene — es un detalle de oficio.
- **Mouse aura:** Se mantiene — es un detalle de oficio.

---

### SECCIÓN 5 — PROCESO (cómo empezar)

**Concepto:** "La promesa de velocidad." Esta sección tiene que responder a la objeción implícita del director de plantel: "¿Cuánto tiempo y esfuerzo nos va a costar implementar esto?" La respuesta es "menos de 24 horas". El diseño debe hacer que eso sea CREÍBLE.

**Problema actual:** 4 cards idénticas no son creíbles para una promesa de velocidad. Se ven como todos los demás "3 simples pasos" del mundo SaaS.

**Concepto nuevo: Timeline vertical editorial**

No un grid. Una secuencia. El tiempo fluye hacia abajo.

**Mockup:**

```
─────────────────────────────────────────────────────────────────────────
FONDO: #F8FAFC
Padding: 80px max(48px, 6vw) 120px

[HEADER — centrado]
  [eyebrow · label style · color cen-blue]
    "Proceso de inicio"
  [h2 · HEADING scale · weight 900]
    "Empieza en menos"
    "de 24 horas"
  [sub · 17px · max-width 460px]
    "Sin infraestructura. Sin instalación. Solo un correo."
    ← Este tagline merece ser el h2 secundario, no la sub. El peso lo amerita.

[gap 80px]

[TIMELINE — vertical · max-width 680px · centrado]
─────────────────────────────────────────────────────────────────────────

PASO 01:
┌────────────────────────────────────────────────────────────┐
│  [num: "01" · 96px · weight 900 · color ink-10 · lh 1]     │
│  [icono · 20px · color cen-blue]   [title · SECTION scale] │
│      fa-envelope-open-text          "Solicita acceso"       │
│  [desc · body scale · ink-60 · max-width 520px]             │
│   "Escríbenos con los datos de tu plantel..."               │
└────────────────────────────────────────────────────────────┘

[conector: línea vertical · 40px · 1px · ink-10]

PASO 02:
┌────────────────────────────────────────────────────────────┐
│  [num: "02" · 96px · weight 900 · color ink-10]             │
│  [icono fa-school]   "Configura tu institución"             │
│  [desc]                                                     │
└────────────────────────────────────────────────────────────┘

... (03 y 04 igual)

─────────────────────────────────────────────────────────────────────────
```

**El número "01"–"04" como elemento visual:**
A 96px en `ink-10` (opacity ~12%), el número es visible como watermark sin competir con el contenido. La clave es que cada paso tiene su número PROPIO en tamaño display — no es un counter pequeño en un badge, es el elemento tipográfico dominante del paso. Al entrar en viewport (useInView), los pasos hacen stagger de entrada.

**Mobile (< 768px):** El número baja a `clamp(48px, 10vw, 72px)`. Los pasos son full-width. La línea conectora desaparece.

---

### SECCIÓN 6 — POR QUÉ CEN

**Concepto:** "El argumento definitivo." Esta es la sección donde CEN convierte al escéptico. El diseño actual la desperdicia con el anti-patrón foto/lista. La nueva versión hace que los datos sean el protagonista.

**Nuevo layout: fullbleed navy + número como elemento gráfico**

```
─────────────────────────────────────────────────────────────────────────
FONDO: navy gradient (#0B2545 → #0E2D56) · color: #fff
Padding: 100px max(48px, 6vw)

LAYOUT: 2 columnas [texto izq · 52%] [datos derecha · 48%]
        (asimétrico: izquierda pesa más por el tamaño del texto)

────────────────────────── COLUMNA IZQUIERDA ──────────────────────────

[eyebrow · label style · color accent]
  "Por qué elegir CEN"

[h2 · HEADING scale · weight 900 · tracking -0.04em · color #fff]
  "La plataforma educativa"
  "que México merece"

[gap: 48px]

[FEATURES — 4 items, no cards, no checkmarks]
  Cada feature = eyebrow (label · accent) + title (section · #fff) + desc (body · rgba(255,255,255,0.7))
  
  Layout: lista vertical con separador sutil (border-bottom 1px rgba(255,255,255,0.08))
  NO íconos de check. Solo el número secuencial como microdetalle: "—" o " · "
  
  [Separador]
  Currículo oficial alineado   [title: SECTION]
  Más de 34 UAC del MCCEMS 2023 SEP.   [desc]
  
  [Separador]
  Compatible con todos los subsistemas   [title]
  DGB, DGETI, CONALEP, COBACH...        [desc]
  
  [Separador]
  Evaluación formativa en tiempo real   [title]
  Identifica quién necesita ayuda...    [desc]
  
  [Separador]
  Operativo desde el primer día        [title]
  Sin infraestructura propia...        [desc]

[gap: 48px]
[CTA: "Explorar CEN Bachillerato →" · estilo link con arrow · color accent]

────────────────────────── COLUMNA DERECHA ──────────────────────────

[ELEMENTO COMPOSITIVO: número "34" como gráfica]

  "34" · clamp(120px, 14vw, 200px) · weight 900 · tracking -0.05em · lh 0.88
         color rgba(125,211,252,0.12) [accent muy sutil, casi transparente]
         position: absolute en el corner superior derecho de la columna
         No es texto que se lee — es textura arquitectónica

  Encima del número "34":
  
  [Card de stat · backdrop: rgba(255,255,255,0.06) · border: rgba(255,255,255,0.10) · border-radius: 20px]
    [icono · 20px · color accent] fa-book-open
    [valor · DISPLAY pequeño · 52px · #fff] "34 UAC"
    [label · 11px · uppercase · color rgba(255,255,255,0.55)] "Currículo Fundamental · SEP"

  [gap: 16px]

  [Card de stat similar]
    fa-check-circle
    "100%"
    "Alineación MCCEMS 2023"

  [gap: 16px]

  [Card de stat similar]
    fa-certificate
    "Acuerdo"
    "09/08/23 · SEP"
  
  Estas 3 cards están en columna vertical con el "34" gigante detrás.
  El efecto: profundidad — el número grande es el fondo, las cards son el primer plano.

─────────────────────────────────────────────────────────────────────────
```

**Por qué esto funciona:**
- El fondo navy crea una pausa de contraste entre el accordion (light) y los testimonios (light/white)
- Las features sin checkmarks se leen como hechos institucionales, no como bullets de marketing
- El "34" como watermark tipográfico detrás de las stats cards crea profundidad sin decoración
- No hay foto — la ausencia de foto en esta sección es la decisión compositiva

---

### SECCIÓN 7 — TESTIMONIOS

**Concepto:** "La prueba humana." El dual marquee ya es el concepto correcto. Solo se quita el ruido.

**Mockup:**

```
─────────────────────────────────────────────────────────────────────────
FONDO: #F8FAFC (regresa al light)
Padding: 100px 0 (sin padding horizontal — el marquee va de borde a borde)

[HEADER · centrado · padding horizontal: max(48px, 6vw)]
  [comilla tipográfica decorativa · "❝" · 80px · weight 900 · color cen-accent · opacity 0.4]
  
  [h2 · HEADING scale · weight 900 · tracking -0.04em]
    "Lo que dicen"
    "los docentes"
  
  [sub · body scale · ink-60]
    "127+ docentes activos en todo México."

[gap: 48px]

[MARQUEE FILA 1 — izquierda]
  [mask-image: fade edges · 14%]
  Cards: 320px min-width · padding 28px · background #fff · border ink-10 · border-radius 20px

  card content:
    [bigquote · "❝" · 32px · color cen-accent · opacity 0.3]
    [quote text · 15px · weight 500 · lh 1.65 · ink-80]
    [author row · gap 10px]
      [avatar · 32px · border-radius 50% · bg: t.color · font 11px bold]
      [nombre · 13px · weight 700 · ink]

[gap: 20px]

[MARQUEE FILA 2 — derecha · velocidad ligeramente diferente]
  Igual que fila 1, pero dirección inversa y con testimonios en orden reverso.

─────────────────────────────────────────────────────────────────────────
```

**Lo que sale:**
- ~~10 íconos FA de fondo~~ — fuera
- ~~El header genérico con `fas fa-star` como eyebrow~~ — reemplazado por la comilla tipográfica

**Lo que mejora:**
- Las cards del marquee tienen `box-shadow: 0 2px 16px rgba(11,37,69,0.06)` — sutil elevación
- La velocidad de la fila 1 (28s) vs fila 2 (22s) crea asimetría temporal — las filas no se mueven en sintonía, se desfasan gradualmente

---

### SECCIÓN 8 — CTA FINAL + FOOTER

**Concepto:** "El gran finale." El usuario llegó hasta aquí. Este es el momento de la decisión. El diseño actual es correcto pero moderado. El grand finale de una landing de nivel estudio es el momento de mayor audacia tipográfica.

**Mockup:**

```
─────────────────────────────────────────────────────────────────────────
FONDO: navy profundo · linear-gradient(160deg, #060A1A 0%, #0B1A3E 55%, #0A1630 100%)
Padding: 120px max(48px, 6vw) 80px

LAYOUT: 2 columnas [texto 55%] [acciones 45%]
        (igual que actual, pero con más ambición tipográfica en la columna izquierda)

────────────────────────── COLUMNA IZQUIERDA ──────────────────────────

[eyebrow · label style · gap con punto pulsante verde]
  🟢 Acceso institucional disponible

[HEADLINE · HEADING scale · weight 900 · tracking -0.04em · lh 0.92 · color #fff]
  "¿Listo para dar"
  "el primer paso?"
  
  ← Esto se mantiene. El copy puede evolucionar más adelante con el OK del usuario.
  ← Alternativa más específica (propuesta, no impuesta):
     "Tu plantel listo"
     "en 24 horas."

[sub · body · color rgba(255,255,255,0.65)]
  "Únete a la red de academias y comienza a construir el futuro educativo..."

[WATERMARK TIPOGRÁFICO — posición absolute en la sección]
  "CEN" · clamp(160px, 18vw, 260px) · weight 900 · tracking -0.05em
          color rgba(255,255,255,0.025) · bottom: 40px · left: max(48px, 6vw)
          pointer-events: none · user-select: none
  
  No es texto que se lee. Es la firma arquitectónica de la sección.

────────────────────────── COLUMNA DERECHA ──────────────────────────

[Las 2 action cards — sin cambio estructural]
  [card primary: CEN Bachillerato · background accent/navy · border accent]
  [card secondary: Contactar al equipo · background transparent · border rgba(255,255,255,0.15)]
  
  Elevación: hover state más rico (whileHover: y:-6, box-shadow crece, border-color brightens)

─────────────────────────────────────────────────────────────────────────
FOOTER (mismo fondo — fusión visual ya implementada)
─────────────────────────────────────────────────────────────────────────
3 columnas: brand + links + contacto [ya bien estructurado, sin cambios]
```

---

### MOBILE STICKY CTA

Sin cambios. Funciona.

---

## SISTEMA DE ESPACIADO Y RITMO VERTICAL

(Preview del sistema que se define en detalle en FASE 3)

```
Sección         Padding top   Padding bottom  Fondo           Carácter
──────────────────────────────────────────────────────────────────────
NAV             —             —               transparente    transición
HERO            100px         0               navy            apertura
ALLIES          24px          24px            navy oscuro     transición rápida
PRODUCTOS       100px         120px           #F8FAFC         denso/explorable
PROCESO         80px          120px           #F8FAFC         narrativo
POR QUÉ CEN     100px         100px           navy            argumento
TESTIMONIOS     100px         100px           #F8FAFC         social proof
CTA FINAL       120px         80px            navy profundo   cierre/acción
FOOTER          48px          64px            navy profundo   (fusión)
```

Patrón de ritmo: navy → light → light → navy → light → navy profundo. El patrón de alternancia crea "capítulos" visuales — el usuario siente los saltos de sección como respiraciones.

---

## SPLITTING DEL MONOLITO (FASE 4)

`LandingPageCEN.tsx` pasa de 1100 líneas a ~80 líneas de ensamblador:

```
src/components/landing/
  NavCEN.tsx                  ← nav flotante
  HeroCEN.tsx                 ← hero completo
  AlliesBand.tsx              ← franja marquee
  ProductosSection.tsx        ← accordion heading + AccPanel
  AccPanel.tsx                ← ya existe ✓
  ProcesoSection.tsx          ← timeline vertical editorial
  PorQueCEN.tsx               ← sección navy con features + stats
  TestimoniosSection.tsx      ← dual marquee
  CTAFinal.tsx                ← grande finale + footer

LandingPageCEN.tsx            ← solo importa y ensambla estos componentes
```

El CSS se mantiene en `LandingCEN.css` (o se divide en secciones con comentarios delimitadores claros). La decisión de dividir el CSS en archivos múltiples se toma en FASE 3 según la complejidad que emerja.

---

## PUNTO DE PARADA OBLIGATORIO

Este es el concepto completo.

**Para aprobar, el usuario necesita confirmar o ajustar:**

1. **La idea rectora ("Estructura Viva")** — ¿Es el tono correcto? ¿Demasiado institucional? ¿Suficientemente moderno para los alumnos de bachillerato?

2. **El hero sin browser mockup** — ¿Opción A (eliminar) o Opción B (agrandar significativamente)?

3. **La sección Proceso como timeline vertical** — ¿O hay otra estructura que se prefiera?

4. **"Por qué CEN" en navy con el "34" como watermark** — ¿El navy de fondo en esta sección funciona con el flujo general? (Navy → light → light → NAVY → light → navy profundo)

5. **El CTA copy** — ¿"¿Listo para dar el primer paso?" (actual) o propuesta alternativa como "Tu plantel listo en 24 horas."?

**AGUARDANDO APROBACIÓN. Sin el OK del usuario, no se escribe código.**
