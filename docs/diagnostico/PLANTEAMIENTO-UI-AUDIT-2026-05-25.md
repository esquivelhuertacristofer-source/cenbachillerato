# Audit UI — Planteamiento Académico
**Fecha:** 2026-05-25 | **Proyecto:** CEN Bachillerato MCCEMS

---

## 1. Estructura actual (Bachillerato)

```
[Fixed Sidebar 260px  z-40 #011C40]
[main md:ml-[260px] flex md:flex-row md:h-screen]
  [LEFT PANEL  width:380px  z-auto  bg-rgba(255,255,255,0.55)  backdropBlur:20px]
  [RIGHT PANEL flex-1  bg-#F4F1EA]
```

### Código exacto — LEFT PANEL (original)
```tsx
<div
  className="hidden md:flex flex-col"
  style={{
    width: 380, flexShrink: 0,
    background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255,255,255,0.5)',
  }}
>
```

**Problemas identificados:**
- No tiene `z-index` explícito → participa en el stacking order como `z-index: auto`
- Toda la presentación en inline styles → difícil de mantener y no respeta el sistema de diseño
- `width: 380` fijo → a 1024px deja solo 384px para el contenido principal
- Sin shadow propio → panel parece "flotante" sin anclaje visual

---

## 2. Root cause del "gap" entre sidebars

El Sidebar principal tiene:
```css
shadow-[20px_0_60px_rgba(1,28,64,0.3)]
```
— sombra rightward de 60px de blur con 30% de opacidad azul oscuro.

El LEFT PANEL tiene `z-index: auto`. El Sidebar está en `z-index: 40`.

**Resultado de pintura:**
En CSS, el Sidebar (z=40) renderiza su box-shadow ENCIMA del LEFT PANEL (z=auto).
La sombra oscura azul del Sidebar se proyecta 20–60px hacia la derecha, pintando
sobre el borde izquierdo del LEFT PANEL. El usuario percibe esto como un "gap oscuro"
o separación visual entre ambos paneles.

**Fix:** `position: relative; z-index: 50` en el LEFT PANEL → su background
se pinta encima de la sombra del Sidebar. La sombra queda oculta detrás del panel.

---

## 3. Patrón Financiera — planeamiento/page.tsx

```tsx
<main className="flex-1 md:ml-[260px] flex h-screen overflow-hidden">
  <div className="w-[380px] bg-white/50 backdrop-blur-xl border-r border-white/40
                  flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.02)] relative z-10">
    <div className="p-8 space-y-6"> ... </div>
    <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-3 custom-scrollbar"> ... </div>
  </div>
  <div className="flex-1 overflow-y-auto bg-[#F4F1EA] custom-scrollbar">
    <div className="p-12 space-y-12"> ... </div>
  </div>
</main>
```

**Lo que Financiera hace bien:**
- Tailwind classes en lugar de inline styles → código mantenible
- `shadow-[20px_0_40px_rgba(0,0,0,0.02)]` en LEFT PANEL: shadow rightward sutil que
  separa visualmente el panel del content area
- `relative z-10` presente (aunque < z-40 del Sidebar, la sombra del Sidebar de
  Financiera tiene el mismo problema — simplemente la sombra azul sobre fondo crema
  es menos perceptible en Financiera quizás por el contexto visual diferente)
- `p-8 space-y-6` → spacing consistente con Tailwind
- `px-6 pb-8 space-y-3` → lista de unidades compacta y bien espaciada

**Diferencias clave:**
| Aspecto              | Financiera         | Bachillerato (original)       |
|----------------------|--------------------|-------------------------------|
| Estilos              | Tailwind classes   | Inline styles                 |
| z-index LEFT PANEL   | relative z-10      | z-auto (no definido)          |
| Shadow LEFT PANEL    | Sí (sutil)         | No                            |
| Ancho LEFT PANEL     | w-[380px] fijo     | 380px fijo                    |
| Padding header       | p-8 space-y-6      | 32px 28px 20px (inline)       |
| Padding content area | p-12 space-y-12    | clamp() (inline)              |
| Hover list items     | bg-[#FFF1D6]/30    | Sin hover state               |

---

## 4. Análisis de breakpoints — problema a 1024px

| Viewport | Sidebar | LEFT PANEL | Contenido disponible |
|----------|---------|------------|----------------------|
| 768px    | 260px   | 380px fijo | **128px ← crítico**  |
| 1024px   | 260px   | 380px fijo | **384px ← estrecho** |
| 1440px   | 260px   | 380px fijo | 800px ✓              |
| 1920px   | 260px   | 380px fijo | 1280px ✓             |

**Fix:** `width: clamp(260px, 26vw, 380px)` en LEFT PANEL.

| Viewport | Sidebar | LEFT PANEL (clamp) | Contenido disponible |
|----------|---------|--------------------|----------------------|
| 768px    | 260px   | 260px (min)        | **248px → aceptable**|
| 1024px   | 260px   | 266px              | **498px ✓**          |
| 1440px   | 260px   | 374px              | 806px ✓              |
| 1920px   | 260px   | 380px (max)        | 1280px ✓             |

---

## 5. Problemas adicionales identificados

### 5.1 Hero bento — grid `2fr 1fr` no collapsa
- `gridTemplateColumns: '2fr 1fr'` sin responsive → a 768px, content area de 128px
  con grid 2fr/1fr = 85px / 43px. Completamente inutilizable.
- **Fix:** `grid-cols-1 xl:grid-cols-[2fr_1fr]`

### 5.2 Quick info cards — stack vertical siempre
- Las dos mini-cards (Duración, Dificultad) están en column siempre
- Cuando el hero collapsa a single column, las cards deberían ir side-by-side
- **Fix:** `grid-cols-2 xl:grid-cols-1`

### 5.3 Tabs — sin overflow horizontal en viewports pequeños
- Los 3 tabs en desktop + right panel estrecho pueden cortarse
- **Fix:** wrapper scrollable `overflow-x-auto`

### 5.4 Content grid `2fr 1fr` — mismo problema
- `gridTemplateColumns: '2fr 1fr'` para main content + Ficha Técnica sidebar
- **Fix:** `grid-cols-1 xl:grid-cols-[2fr_1fr]`

### 5.5 Theory sections — grid `1fr 1fr` roto en estrecho
- **Fix:** `grid-cols-1 sm:grid-cols-2`

### 5.6 Eval questions — grid `1fr 1fr` roto en estrecho
- **Fix:** `grid-cols-1 sm:grid-cols-2`

### 5.7 Sticky nav — inline styles, padding pequeño
- `padding: '14px 24px'` vs Financiera `px-12 py-6` (48px horizontal)
- **Fix:** `px-6 lg:px-12 py-4` con Tailwind

### 5.8 Hover states en progresion list — ausentes
- Los botones no-activos de la lista no tienen hover state
- **Fix:** `hover:bg-[#FFF8F0] hover:shadow-md`

### 5.9 Reduced motion — no implementado
- Ninguna transición respeta `prefers-reduced-motion`
- **Fix:** `motion-safe:transition-all` en items interactivos

---

## 6. Propuestas de mejora (implementadas en FASE 2)

| # | Área           | Cambio                                                    | Razón visual                              |
|---|----------------|-----------------------------------------------------------|-------------------------------------------|
| 1 | LEFT PANEL     | `relative z-[50]` → elimina shadow overlap del Sidebar    | Fix del "gap" reportado                   |
| 2 | LEFT PANEL     | `clamp(260px, 26vw, 380px)` → fluido                      | Usable en 1024px                          |
| 3 | LEFT PANEL     | `shadow-[16px_0_48px_rgba(11,37,69,0.07)]` → right shadow | Anclaje visual, panel "flotante" → "sólido"|
| 4 | LEFT PANEL     | `border-r border-[#0B2545]/10` → separador sutil          | Divide panel interno de content area      |
| 5 | LEFT PANEL     | Inline styles → Tailwind classes                          | Consistencia con Financiera               |
| 6 | LEFT PANEL     | `bg-rgba(255,255,255,0.75)` (era 0.55) → más opaco        | Panel más definido, menos "fantasmal"     |
| 7 | Progresion list| `hover:bg-[#FFF8F0]` en items inactivos                   | Feedback visual                           |
| 8 | Sticky nav     | `px-6 lg:px-12 py-4` Tailwind                             | Coherencia con Financiera                 |
| 9 | Hero + content | `xl:grid-cols-[2fr_1fr]` → collapsa en pantallas pequeñas | Usable en 768-1024px                      |
|10 | Tabs           | Wrapper `overflow-x-auto`                                 | Scroll horizontal si no caben             |
|11 | Reduced motion | `motion-safe:` en transiciones clave                      | Accesibilidad                             |

---

## 7. Lo que NO se cambia

- Estructura del módulo (sidebar interno + content + tabs)
- Lógica JS/TS (estados, handlers, queries)
- Mobile selectors (ya funcionales desde sesión anterior)
- Paleta de colores (#011C40, #D4A574, #7DD3FC, #F4F1EA, #0B2545)
- Funcionalidad del Sidebar principal del dashboard
- Tipografía base
