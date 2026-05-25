# Análisis Sistema de Diseño — CEN Educación Financiera

## Origen
Repo: https://github.com/esquivelhuertacristofer-source/cenfinancierafinal.git  
Commit analizado: `0fa8dbd6b36f722b59cf20ade578688b21dc16a4`  
Fecha: 2026-05-13

---

## Tokens de diseño

### Paleta de colores

| Nombre | Hex | Uso primario |
|--------|-----|--------------|
| `cen-blue` / `--cen-blue` | `#011C40` | Color principal — texto, botones primarios, navbar, fondo side panel |
| `cen-blue-2` | `#042a5e` | Variación más clara del azul principal (hover states) |
| `cen-orange` / `--cen-orange` | `#FF8C00` | Acento primario — CTAs, highlights, gradients de texto, íconos en botones |
| `cen-orange-soft` | `#FFE3BF` | Fondos de badges, pills de acento suave |
| `cen-cyan` / `--cen-cyan` | `#42E8E0` | Acento secundario — detalles del logo, destellos, ilustraciones |
| `cen-cyan-soft` | `#D6FAF8` | Fondos suaves con acento cyan |
| `cen-cream` / `--cream` | `#FFF1D6` | Fondos cálidos, secciones alternadas |
| `cen-bg` / `--bg` | `#F4F1EA` | **Fondo global de la app** — beige/lino cálido |
| `ink` (text principal) | `#011C40` | Texto principal (igual que cen-blue) |
| `ink-80` | `rgba(1,28,64,0.85)` | Texto secundario oscuro |
| `ink-60` | `rgba(1,28,64,0.72)` | Texto muted |
| `ink-40` | `rgba(1,28,64,0.50)` | Texto muy muted, placeholders |
| `ink-10` | `rgba(1,28,64,0.15)` | Bordes, separadores |
| `cen-navy` | `#1a1a2e` | Casi negro para strips decorativos |
| `cen-dark` | `#2d2d1e` | Oliva oscuro para elementos decorativos |
| Input bg | `#F8FAFC` / `#F8F9FB` | Fondo de inputs |
| Input border | `#E2E8F0` | Borde de inputs inactivos |
| Text muted | `#64748B` | Subtítulos, helper text |
| Text placeholder | `#94A3B8` | Placeholders |

**Paleta secundaria del dashboard** (usada en teacher dashboard):
- Verde éxito: `emerald-400` (#34d399)
- Rojo peligro: `red-500` (#ef4444)
- Naranja warning: `amber-500` (#f59e0b)

### Tipografía

- **Display / UI font:** `Epilogue` — Variable font, pesos 400, 500, 700, 800, 900
- **Serif / Editorial:** `Instrument Serif` — Solo en algunos elementos editoriales de la landing
- **Body alt:** `Plus Jakarta Sans` — pesos 400, 500, 600, 700 (usado en elementos más formales)
- **Font fallback:** `ui-sans-serif, system-ui, sans-serif`
- **Importación:** Google Fonts via `@import url('https://fonts.googleapis.com/')` en globals.css

Escala de tamaños observada:
- Hero title: `text-[40px]` a `text-[48px]`, font-weight 900
- Headings: `text-2xl` (1.5rem) a `text-3xl` (1.875rem), font-black
- Labels de inputs: `text-xs uppercase tracking-[0.15em]`, font-bold
- Body: `text-base` (1rem) o `text-lg` (1.125rem), font-medium/semibold
- Muted/helper: `text-sm` (0.875rem) a `text-xs` (0.75rem)
- Eyebrows/tags: `text-[9px]` a `text-[11px]`, font-black, uppercase, tracking-[0.3em]

### Sistema de espaciado
Usa el sistema de Tailwind estándar. Sin custom spacing en tailwind.config.  
Máximos contenedores: `max-w-7xl` (80rem), `max-w-4xl` (56rem), `max-w-[440px]` para forms.

### Border radius

| Nombre | Valor | Uso |
|--------|-------|-----|
| `--r-lg` / personalizado | `32px` / `rounded-[2.5rem]` | Cards principales (bento-cards, pillar cards) |
| `--r-md` | `22px` / `rounded-2xl` | Botones, inputs, cards medianas |
| `rounded-xl` | 12px | Elementos secundarios |
| `rounded-full` | 9999px | Pills, badges, avatares |
| Logo mark | `12px` / `rounded-xl` | Cuadrado del logo |

### Shadows

| Nombre | Valor | Uso |
|--------|-------|-----|
| Card rest | `shadow-lg` (Tailwind) | Cards en reposo |
| Card hover | `shadow-[0_40px_80px_rgba(1,28,64,0.08)]` | Cards en hover |
| premium-shadow | `box-shadow: 0 50px 100px rgba(1,28,64,0.08)` | Dashboard panels |
| Button primary | `shadow-[0_10px_25px_rgba(1,28,64,0.15)]` → `shadow-[0_15px_35px_rgba(1,28,64,0.25)]` | CTA buttons |
| Input focus ring | `shadow-[0_0_0_4px_rgba(255,140,0,0.1)]` | Inputs al focus |
| Glass / bento | `shadow-[0_20px_50px_rgba(1,28,64,0.03)]` | Bento cards |

### Transiciones y animaciones

| Nombre | Timing | Uso |
|--------|--------|-----|
| Standard | `duration-300` / `duration-150` | Hover states |
| Premium | `duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]` | Bento cards, 3D tilt |
| Button UP | `hover:-translate-y-1 transition-all duration-300` | CTAs principales |
| Gradient text | `animate-[gradient_4s_linear_infinite] bg-[length:200%_auto]` | Texto naranja animado |
| Float | `animation: float 6s ease-in-out infinite` | Ilustraciones hero |
| Marquee | `animation: marquee 20s linear infinite` | Banda de aliados |
| Twinkle | `animation: twinkle 4s infinite` | Partículas decorativas |
| Spin slow | `animation: spin 60s linear infinite` | Elementos orbitales |
| Shine | `animate-[shine_1.5s_ease-in-out_infinite]` | Efecto brillo en botones |
| 3D Tilt | `perspective(2000px) rotateX rotateY` | PillarCard, UnitCard |
| Mouse Aura | `radial-gradient` en `mousemove` | PillarCard flare |

---

## Componentes UI identificados

### `MagneticButton` (`src/components/ui/MagneticButton.tsx`)
- Efecto magnético: sigue al cursor dentro del botón con translate X/Y
- Props: `children`, `className`, `strength` (default 40)
- Wrapper div sin semántica propia — los estilos del botón van en children

### `ProgressRing` (`src/components/ui/ProgressRing.tsx`)
- SVG circular de progreso
- Props: `pct` (0-100), `size` (default 64), `stroke` (default 6), `color` (`#FF8C00`), `trackColor` (`#e2e8f0`)
- Animación: `strokeDashoffset` con `transition 0.6s ease`
- Rotado -90deg para iniciar desde las 12

### `PillarCard` (`src/components/hub/PillarCard.tsx`)
- Card de módulo curricular con fondo de gradiente del pilar
- Efectos: 3D tilt + mouse aura flare + scale en hover
- Dot-grid texture overlay (radial-gradient de puntos blancos)
- Progress ring pequeño sobre emoji del módulo
- Estados: started, complete (ring verde), not-started
- Rounded: `rounded-[2.5rem]`, min-h: `350px`

### `UnitCard` (`src/components/hub/UnitCard.tsx`)
- Card de unidad/actividad en timeline vertical
- Estados: locked, available, completed
- 3D tilt + mouse aura (solo cuando no está locked)
- Íconos de tipo de actividad (video, reading, simulator, quiz, etc.) via Lucide
- Thumbnail imagen aleatoria de `/assets/units/N.webp`

### `Navbar` (`src/components/Navbar.tsx`)
- Fixed top, transparente → white/90 con blur en scroll
- Logo: cuadrado azul "C" + texto "CEN EDUCACIÓN FINANCIERA"
- Links: text-[10px] uppercase tracking-[0.3em]
- CTA: `bg-cen-blue → hover:bg-cen-orange`, rounded-2xl, uppercase, tracking-widest

### Login (`src/app/log-in/page.tsx`)
- Layout split: left branding (azul marino) + right form (blanco)
- Left: ilustración flotante, título H2 con gradiente naranja, dot-grid background
- Right: form con inputs estilo premium
  - Labels: uppercase, tracking, font-bold, cambian a naranja en focus del grupo
  - Inputs: `bg-[#F8FAFC] border-2 rounded-2xl focus:border-[#FF8C00] focus:shadow-ring-orange`
  - Checkbox: `accent-[#FF8C00]`
  - CTA button: `bg-[#011C40]`, `hover:-translate-y-1`, shine effect en hover
  - Error: `bg-red-50 border-red-100 rounded-2xl animate-[slideDown]`

### `MetricCards` (dashboard)
- Cards con métricas: alumnos, grupos, prácticas completadas
- Soporte dark/light mode via prop `isDark`
- Iconos de Lucide React

### `WelcomeBanner` (dashboard)
- Banner de bienvenida con nombre del docente
- Insights "AI" (strings hardcodeados según nivel)
- Stats de completion rate

### `FooterLegal`
- Footer blanco con borde top
- Copyright + links privacidad/términos
- Texto legal largo sobre derechos de autor LFDA

---

## Estructura de Landing

### Hero
- Layout: dos columnas (`hero-left` texto, `hero-right` ilustración)
- Background: `#F4F1EA` (beige/lino)
- H1: font-black, multi-línea, acento naranja en una palabra
- Subtítulo: text-lg, font-medium, muted
- CTAs: botón sólido azul (`btn-cta`) + botón ghost con ícono play (`btn-cta-demo`)
- Hero illustration: personaje 3D PNG, bills animados orbitando (b1-b14), floaters con datos
- Floaters: pills flotantes con ícono + etiqueta + valor (e.g. "Reto Alcanzado / +50 Monedas")

### Marquee / Aliados
- Banda de logos en scroll infinito
- Eyebrow: "Nuestra Red de Confianza"

### Sección de niveles (tabbed)
- Tabs: Primaria / Secundaria
- Grid de productos/módulos por nivel

### Metodología / Features
- Secciones alternadas con iconos grandes

### Diagrama/path
- Vista alternativa "path" al grid (toggle viewMode)

### Footer
- Sencillo: copyright + links legales + texto legal

---

## Login screen
Ver sección de componentes arriba. Puntos clave:
- Split 50/50 en desktop, full-width en mobile
- Branding side: `bg-gradient-to-br from-[#011C40] to-[#011126]`
- Ilustración animada del personaje CEN con `animate-[float_6s]`
- Form side: blanco, inputs con focus ring naranja
- Consent checkbox obligatorio para habilitar el botón
- Loading state con spinner + texto "Validando acceso..."

---

## Tono visual general

**Muy juvenil-lúdico con barniz premium.** Diseñado para niños y adolescentes de 6-15 años:
- Emojis prominentes en cards
- Ilustraciones 3D tipo "game character" (PNGs de personajes)
- Gradientes vibrantes en cards de módulos
- Animaciones de flotación, brillo, tilt 3D
- Efectos de videojuego: "Ahorrador Jr.", "Rango Actual", "Meta Alcanzada"
- Gamificación visible: progress rings, completion states, monedas

**Lo que sí es institucional/premium:**
- Paleta base seria (`#011C40` + beige `#F4F1EA`)
- Tipografía `Epilogue` — no es infantil ni redondeada
- Layout del login es profesional y limpio
- Dashboard del docente es funcional y oscuro

---

## Imágenes e Ilustraciones
- `public/assets/landing-v3/`: personajes 3D (helper.png, player.png, client.png, landing.png), objetos (money.png, crate.png, stand.png)
- `public/assets/units/`: 33 imágenes `.webp` para thumbnails de actividades
- `public/assets/temas/`: imágenes por tema (ahorro, banco, deuda, etc.)
- `public/assets/hub-v5/`: assets del hub
- Sin SVG illustrations inline; todo son PNGs externos
- **Iconografía:** Font Awesome (`fas fa-*`) en el login; Lucide React en el dashboard

---

## Anti-patrones observados (a NO replicar en Bachillerato)
- Colores hardcodeados como `text-[#011C40]` en lugar de clases semánticas — muy difícil de tematizar
- Font Awesome via CDN en el login (crea dependencia externa y bloqueo de render)
- `window.location.href` en lugar de `router.push` para navegación post-login
- `TEST_ACCOUNTS` importado directamente en el login page (datos de prueba en producción)
- `localStorage` para `cen_test_profile` — no usar en Bachillerato
- CSS personalizado en archivos `.css` separados (`LandingV3.css`) mezclado con Tailwind — mantener Tailwind-only en Bachillerato
- Emoji directamente en JSX para iconografía funcional — en Bachillerato usar Lucide o SVG con aria-label
