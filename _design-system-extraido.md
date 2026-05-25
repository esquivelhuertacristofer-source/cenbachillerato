# Design System Extraído — CEN Bachillerato Hub
> Archivo de trabajo. NO commitear.

## Paleta de colores

### Principal (navy / landing)
| Variable | Hex | Uso |
|----------|-----|-----|
| `--cen-navy` | `#0B2545` | Header, sidebar, fondos oscuros |
| `--cen-navy-2` | `#0E2D56` | Cards oscuras, gradiente hero |
| `--cen-blue` | `#1E40AF` | CTAs, badges, links |
| `--cen-accent` | `#7DD3FC` | Sky accent, highlights nav |
| `--cen-accent-soft` | `#DBEAFE` | Fondos de iconos, badges suaves |
| `--cen-highlight-soft` | `#EFF6FF` | Fondos de banners informativos |
| `--bg` | `#F8FAFC` | Background app |
| `--ink` | `#0B2545` | Texto principal |
| `--ink-60` | `rgba(11,37,69,0.72)` | Texto secundario |
| `--ink-40` | `rgba(11,37,69,0.50)` | Texto terciario |
| `--ink-10` | `rgba(11,37,69,0.12)` | Bordes suaves |

### Por área disciplinar (paleta UAC)
| UAC | Hex | rgba | FontAwesome icon |
|-----|-----|------|-----------------|
| LC (Lengua) | `#38BDF8` | `56,189,248` | `fa-book-open` |
| PM (Matemática) | `#FB923C` | `251,146,60` | `fa-square-root-variable` |
| IN (Inglés) | `#A78BFA` | `167,139,250` | `fa-globe` |
| CD (Cultura Digital) | `#34D399` | `52,211,153` | `fa-microchip` |
| CS (Ciencias Sociales) | `#FBBF24` | `251,191,36` | `fa-building-columns` |
| PFH (Filosófico) | `#F87171` | `248,113,113` | `fa-scale-balanced` |
| CNEYT (Ciencias Nat.) | `#22D3EE` | `34,211,238` | `fa-microscope` |
| CH (Conciencia Hist.) | `#D97706` | `217,119,6` | `fa-landmark` |

## Tipografía
- Font: **Epilogue** (importada globalmente)
- h1 hero: `fontSize: clamp(56px, 7vw, 104px)`, `fontWeight: 900`, `letterSpacing: -0.03em`
- h1 página: `fontSize: 26`, `fontWeight: 900`, `letterSpacing: -0.03em`
- h2: `fontSize: 18-22`, `fontWeight: 800`, `letterSpacing: -0.02em`
- h3 card: `fontSize: 14-15`, `fontWeight: 700`
- Label eyebrow: `fontSize: 12`, `fontWeight: 700`, `textTransform: uppercase`, `letterSpacing: 0.14em`
- Body: `fontSize: 14`, `lineHeight: 1.6`
- Caption: `fontSize: 12-13`, `color: rgba(11,37,69,0.55)`

## Border-radius
- `--r-lg: 32px` — cards hero, hero sections
- `--r-md: 22px` / `20px` — cards
- `16px` — cards estándar
- `12px` — elementos internos
- `8px` — badges pequeños
- `999px` — pills, botones, avatares

## Sombras
- Card base: `0 2px 8px rgba(11,37,69,0.06)`
- Card hover: `0 8px 24px rgba(11,37,69,0.12)`
- CTA button: `0 14px 30px rgba(125,211,252,0.35)`
- Hero card: sombras profundas navy

## Animaciones existentes (globals.css)
- `float`: translateY 0 ↔ -14px, 3s ease infinite
- `marquee`: scroll horizontal, 22s linear
- `shine`: efecto brillo botón, 3s ease infinite
- `slideDown`: entrada dropdown, opacity 0→1, translateY -6px→0
- `pulseRing`: escala 1→1.4 + opacity, 2s ease infinite
- `ctaPulse`: glow de botón CTA, 2s ease-out infinite

## Componentes patrón

### Card estándar
```css
borderRadius: 16-20px
border: '1px solid rgba(11,37,69,0.10)'
background: '#fff'
padding: 20-28px
boxShadow: '0 2px 8px rgba(11,37,69,0.06)'
transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
```
Hover: `boxShadow: '0 8px 24px rgba(11,37,69,0.12)'`, `borderColor: rgba(11,37,69,0.18)`

### Botón CTA primario
```css
background: '#7DD3FC'
color: '#0B2545'
padding: '12px 28px'
borderRadius: 999px
fontWeight: 700
fontSize: 14
boxShadow: '0 14px 30px rgba(125,211,252,0.35)'
```

### Botón secundario
```css
background: 'rgba(255,255,255,0.10)'
border: '1px solid rgba(255,255,255,0.20)'
color: '#fff'
```

### Badge pill
```css
borderRadius: 999px
padding: '3px 12px'
fontSize: 11
fontWeight: 700
letterSpacing: '0.04em'
```

### Eyebrow label
```css
fontSize: 12
fontWeight: 700
textTransform: 'uppercase'
letterSpacing: '0.14em'
color: '#1E40AF'
```

## Microinteracciones de la Landing (para replicar)
- Hover cards: `translateY(-2px)` + shadow más profunda
- Click: `scale(0.98)`
- Transiciones: `200-300ms ease-out`
- Tilt 3D: JS en hero cards (mousemove → rotateX/Y) — **replicar en ContinuarCard**
- MouseAura: glow radial que sigue al cursor — **replicar en cards UAC**

## Layout del Hub (nuevo diseño)
```
[HEADER — navy, 72px, full width]
[max-w-1280, mx-auto, px-8]
  [MAIN — flex-1]  [SIDEBAR — 300px, sticky, desktop only]
```
- Sidebar en mobile → se mueve ABAJO del main content
- Cards UAC: 4 cols desktop, 3 tablet, 1 mobile
