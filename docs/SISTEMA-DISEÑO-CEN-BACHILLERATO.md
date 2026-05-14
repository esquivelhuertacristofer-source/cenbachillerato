# Sistema de Diseño — CEN Bachillerato

> Fecha de implementación: 2026-05-13  
> Basado en: CEN Educación Financiera (referencia estructural)  
> Paleta: Familia de azules (decisión confirmada por cliente)

---

## Paleta de colores

| Token CSS / Tailwind | Hex | Uso primario |
|---------------------|-----|--------------|
| `--cen-navy` / `cen-navy` | `#0B2545` | Color principal — texto, botones primarios, navbar, logo mark |
| `--cen-navy-2` / `cen-navy-2` | `#0E2D56` | Variación hover del navy |
| `--cen-blue` / `cen-blue` | `#1E40AF` | Acento primario — hover de CTAs, focus rings, links |
| `--cen-blue-soft` / `cen-blue-soft` | `#DBEAFE` | Fondos de badges, pills azules suaves |
| `--cen-sky` / `cen-sky` | `#7DD3FC` | Acento secundario — texto sobre fondo oscuro, ProgressRing, destellos |
| `--cen-sky-soft` / `cen-sky-soft` | `#E0F2FE` | Fondos suaves con acento sky |
| `--cen-cool` / `cen-cool` | `#EFF6FF` | Fondo hover en componentes, secciones alternadas |
| `--cen-bg` / `cen-bg` | `#F8FAFC` | **Fondo global de la app** — blanco con leve tono frío |
| `--ink` / `ink` | `#0B2545` | Texto principal (= cen-navy) |
| `--ink-80` / `ink-80` | `rgba(11,37,69,0.85)` | Texto secundario |
| `--ink-60` / `ink-60` | `rgba(11,37,69,0.72)` | Texto muted |
| `--ink-40` / `ink-40` | `rgba(11,37,69,0.50)` | Texto muy muted, subtítulos |
| `--ink-10` / `ink-10` | `rgba(11,37,69,0.12)` | Bordes, separadores |
| Input bg | `#F8FAFC` | Fondo de inputs |
| Input border | `#E2E8F0` | Borde de inputs inactivos |
| Text muted | `#64748B` | Helper text en inputs |
| Text placeholder | `#94A3B8` | Placeholders |

**Paleta semántica:**
- Éxito/completado: `emerald-600` (#059669)
- Warning: `amber-600` (#d97706)
- Error: `red-600` (#dc2626)
- En curso: `cen-blue` (#1E40AF)

**Gradientes de UACCards:**
- Sociocognitivo: `from-[#0B2545] to-[#1E40AF]`
- Área de Conocimiento: `from-[#0E2D56] to-[#2563EB]`
- Socioemocional: `from-[#0B2545] to-[#0369A1]`

---

## Tipografía

- **Font principal:** `Epilogue` (Google Fonts, `next/font/google`)
  - Pesos: 400, 500, 700, 800, 900
  - Variable CSS: `--font-epilogue`
  - Fallback: `ui-sans-serif, system-ui, sans-serif`
- **Font fallback:** sistema (ui-sans-serif)

### Escala tipográfica observada

| Uso | Clases Tailwind |
|-----|----------------|
| Hero title | `text-4xl`–`text-6xl`, `font-black` |
| Section headings | `text-3xl`, `font-black`, `tracking-tight` |
| Subheadings / card titles | `text-xl`–`text-2xl`, `font-bold` |
| Labels de inputs | `text-xs`, `uppercase`, `tracking-[0.15em]`, `font-bold` |
| Eyebrows / badges | `text-[10px]`–`text-[11px]`, `font-black`, `uppercase`, `tracking-[0.2em]`–`tracking-[0.3em]` |
| Body | `text-sm`–`text-base`, `font-medium` |
| Muted / helper | `text-xs`–`text-sm` |

---

## Sistema de espaciado

Sistema Tailwind estándar. Sin custom spacing tokens.
- Contenedor máximo: `max-w-7xl` (80rem)
- Forms: hasta `max-w-sm` (384px)
- Login form panel: `max-w-[480px]`

---

## Border radius

| Uso | Valor Tailwind | px |
|-----|---------------|-----|
| Cards principales (UACCard, landing cards) | `rounded-[2.5rem]` | 40px |
| Cards secundarias (Card component, dashboard) | `rounded-2xl` | 24px |
| Botones | `rounded-2xl` | 24px |
| Inputs | `rounded-2xl` | 24px |
| Logo mark | `rounded-xl` | 12px |
| Pills / badges | `rounded-full` | 9999px |

---

## Shadows

| Nombre | Valor | Uso |
|--------|-------|-----|
| Card rest | `shadow-sm` | Cards en reposo |
| Card hover | `shadow-md shadow-[0_40px_80px_rgba(11,37,69,0.08)]` | Cards hoverable |
| UACCard | `shadow-[0_20px_50px_rgba(11,37,69,0.15)]` | Cards de UAC con gradiente |
| Button primary | `shadow-[0_10px_25px_rgba(11,37,69,0.15)]` | CTAs primarios |
| Button primary hover | `shadow-[0_15px_35px_rgba(11,37,69,0.25)]` | CTA hover |
| Input focus ring | `shadow-[0_0_0_4px_rgba(125,211,252,0.2)]` | Inputs al focus |
| Navbar scrolled | `shadow-[0_2px_20px_rgba(11,37,69,0.08)]` | Header al hacer scroll |

---

## Animaciones

Definidas en `src/app/globals.css`:

| Clase | Duración | Uso |
|-------|----------|-----|
| `animate-float` | 6s ease-in-out infinite | Logo en login, elementos flotantes |
| `animate-marquee` | 20s linear infinite | Banda de aliados/logos |
| `animate-gradient` | 4s linear infinite | Texto degradado animado (login left panel) |
| `animate-shine` | 1.5s ease-in-out infinite | Brillo en Button primary |
| `animate-twinkle` | 4s infinite | Partículas decorativas en login |
| `animate-slide-down` | 0.3s ease-out | Alerts, mensajes de error |

**Efectos JavaScript (no CSS keyframes):**
- **3D Tilt** — `perspective(2000px) rotateX/rotateY` en `UACCard` via `onMouseMove`
- **Mouse Aura Flare** — `radial-gradient` en `mousemove` via ref en `UACCard`
- **Magnetic Button** — `translate(x,y)` en `MagneticButton` via `onMouseMove`

---

## Componentes UI (`src/components/ui/`)

### `Button`
- Variantes: `primary` | `secondary` | `ghost` | `danger`
- Sizes: `sm` | `md` | `lg`
- Props extra: `loading` (spinner + disabled automático)
- Primary: bg-cen-navy, hover:bg-cen-blue, hover:-translate-y-1, shine effect animado
- Secondary: bg-white, border-2 border-cen-navy
- Ghost: bg-transparent
- Todos: `rounded-2xl font-bold uppercase tracking-widest`

### `Card`
- Prop: `hoverable` (agrega hover:shadow-md)
- Subcomponentes: `CardHeader` (mb-4), `CardTitle` (h3), `CardContent`
- Base: `rounded-2xl border border-ink-10 bg-white p-6 shadow-sm`

### `Input`
- Label: `text-xs font-bold uppercase tracking-[0.15em]`, cambia a `text-cen-blue` en group-focus-within
- Input: `rounded-2xl border-2 bg-[#F8FAFC] px-4 py-3`
- Focus: `border-cen-blue shadow-[0_0_0_4px_rgba(125,211,252,0.2)]`
- Error: `animate-slide-down`

### `Select`
- Misma estructura que Input

### `Badge`
- Variantes: `default` (azul soft) | `primary` (navy) | `success` (emerald) | `warning` (amber) | `error` (red) | `muted` (slate)
- Base: `text-[10px] font-black uppercase tracking-[0.15em] rounded-full px-2.5 py-0.5`

### `Alert`
- Variantes: `info` | `success` | `warning` | `error`
- `animate-slide-down` al aparecer

### `Avatar`
- Con `src`: img redonda
- Sin `src`: initials sobre bg-cen-navy
- Sizes: sm, md, lg, xl

### `Skeleton`
- `lines` prop para múltiples líneas

### `MagneticButton`
- Props: `children`, `className`, `strength` (default 40)
- Wrapper div — los estilos del botón van en children

### `ProgressRing`
- SVG circular, `strokeDashoffset` con `transition 0.6s ease`
- Rotado -90deg para empezar desde las 12
- Props: `pct`, `size` (64), `stroke` (6), `color` (#1E40AF), `trackColor` (#e2e8f0)

---

## Componentes Shared

### `Header` (`src/components/shared/Header.tsx`)
- Client component (scroll detection)
- Fixed top, transparente → `bg-white/90 backdrop-blur-md` en scroll
- Logo: cuadrado navy "C" + "CEN" / "BACHILLERATO"
- Nav links: `text-[10px] uppercase tracking-[0.3em]`
- CTA: `MagneticButton` wrapper con Link

### `FooterLegal`
- Fondo `bg-cen-bg`, borde `border-ink-10`
- Copyright + links privacidad/términos/contacto
- Colores: `text-cen-navy` para nombre, `text-ink-40` para texto secundario

---

## Componentes Hub

### `UACCard`
- **Client component** (3D tilt + mouse aura)
- Gradiente por tipo: sociocognitivo/area/socioemocional → combinaciones de navy/blue
- Dot-grid overlay, mouse aura flare, `perspective(2000px) rotateX rotateY scale(1.02)`
- `ProgressRing` (sky sobre fondo translúcido) + emoji del icono
- `rounded-[2.5rem]`, `min-h-[300px]`
- Estados: pct=0 siempre (progreso aún no implementado)

### `SemestreSelector`
- Tabs 1-6: activo (`bg-cen-navy text-white`), disponible (`text-ink-60 hover:bg-cen-cool`), no-disponible (`text-ink-10 cursor-not-allowed`)

### `ProgresionPlaceholder`
- Border dashed cen-blue/30
- Badge "Próximamente" en `bg-cen-blue-soft text-cen-blue`

---

## Login (`src/app/log-in/page.tsx`)

### Layout split (desktop)
- Izquierda (flex-1): `bg-gradient-to-br from-cen-navy to-[#071A35]`
  - Dot-grid overlay
  - Logo mark flotante (`animate-float`)
  - H2 con gradiente animado sky → blue → sky (`animate-gradient`)
  - Stats pills transparentes
  - Twinkle dots decorativos
- Derecha (max-w-[480px]): `bg-white`
  - Form con `Input` premium
  - Checkbox: `accent-cen-blue`
  - Error: `animate-slide-down rounded-2xl bg-red-50`
  - CTA: `Button` primary (shine + lift)
  - Loading state: "Validando acceso..."

---

## Tono visual

**Académico institucional con precisión premium.** Diseñado para:
- Alumnos 15-18 años: animaciones 3D tilt, gradientes, efectos de hover
- Directivos/docentes de bachillerato: paleta navy/azul seria, tipografía Epilogue limpia
- Instituciones SEP: layout profesional en login, terminología curricular correcta

**Lo que diferencia de CEN Financiera:**
- Paleta azul family (vs naranja/cyan de Financiera)
- Sin gamificación explícita (monedas, rangos, "Reto Alcanzado")
- Fondo blanco frío (vs beige cálido de Financiera)
- Sin emojis como iconografía funcional (excepto en contenido)
- Terminología MCCEMS en todas las interfaces

---

## Anti-patrones (NO hacer)

- Colores hardcodeados `text-[#0B2545]` en JSX → usar clases semánticas `text-cen-navy`
- Tailwind `indigo-*` → usar tokens `cen-*` del sistema
- Emojis como iconografía funcional → usar Lucide React con `aria-label`
- Animaciones nuevas no listadas arriba → consultar antes de agregar
- Modificar Business logic (queries, auth, hub layout) al aplicar estilos
