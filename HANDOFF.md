# HANDOFF — CEN Bachillerato Landing Page
> Documento de continuidad para que otra IA retome el trabajo exactamente donde se dejó.
> Fecha: 2026-05-16 · Proyecto: CEN Bachillerato

---

## 1. CONTEXTO DEL PROYECTO

**Nombre:** Campaña Educativa Nacional (CEN)  
**Producto activo:** CEN Bachillerato  
**Stack:** Next.js 16 (App Router), TypeScript, CSS puro (sin Tailwind), FontAwesome (CDN)  
**Directorio raíz:** `c:\Users\crist\.gemini\antigravity\scratch\NEM BACHILLERATO\cen-bachillerato\`  
**No es repositorio git.** Todos los cambios son locales.

**IMPORTANTE — Next.js 16:**  
Este proyecto usa Next.js 16 con breaking changes. Lee `AGENTS.md` antes de tocar configuración o rutas. El archivo `CLAUDE.md` apunta a `AGENTS.md`.

---

## 2. ARCHIVOS TRABAJADOS

### Archivos principales modificados:

| Archivo | Ruta completa |
|---|---|
| Componente principal | `src/components/landing-cen/LandingPageCEN.tsx` |
| Estilos de la landing | `src/components/landing-cen/LandingCEN.css` |

### Imágenes en `/public` (raíz del servidor):
- `/Logo Cen.png` — logo de la marca
- `/1.png` — foto de estudiante (usada en el Hero, NO en fichas de producto)
- `/bachillerato.png` → ficha 4 (CEN Bachillerato)
- `/2.png` → ficha 5 (Educación Financiera)
- `/3.png` → ficha 6 (Laboratorios Virtuales)
- `/4.png` → ficha 1 (CEN Preescolar)
- `/5.png` → ficha 2 (CEN Primaria)
- `/6.png` → ficha 3 (CEN Secundaria)
- `/7.png` → ficha 7 (CEN Robótica)
- `/8.png` → ficha 8 (CEN Idiomas)

---

## 3. ESTRUCTURA ACTUAL DE LA LANDING (orden de secciones)

```
1. NAV (fijo, floating pill al scroll)
2. HERO (fondo navy, foto estudiante, cycling words, badges SEP/MCCEMS)
3. SUBSISTEMAS MARQUEE (.allies) — franja con marquee de subsistemas compatibles
4. PRODUCTOS (.prod-section) — accordion horizontal de 8 fichas expandibles
5. LEARN SECTION (.learn-section) — "¿Qué quieres aprender hoy?" 4 cards + divider
6. STATS BAND (.stats-band) — 4 estadísticas con count-up animado (34/364/40/7+)
7. FEATURED SECTION (.featured-section) — 2×2 grid de cards + texto + CTA
8. TESTIMONIOS (.testimonios-section) — split layout: orb izquierda + quote derecha con dots
9. CTA FINAL (.cta-final) — fondo muy oscuro (#060A1A), orbs animados, 2 action cards
10. FOOTER (.footer) — mismo fondo que CTA Final (armonizado)
11. MOBILE STICKY CTA (fixed bottom, visible al scroll)
```

---

## 4. ESTADO ACTUAL DEL COMPONENTE TSX

### Constantes de datos:

**`SUBSISTEMAS`** — array de strings con los subsistemas del marquee.

**`PRODUCTS`** — 8 productos en este orden (IMPORTANTE: fue reordenado por nivel educativo):
```
Índice 0: preescolar  → image: /4.png  → color: azul claro  (#1D4ED8→#3B82F6)
Índice 1: primaria    → image: /5.png  → color: azul medio  (#1E40AF→#2563EB)
Índice 2: secundaria  → image: /6.png  → color: azul oscuro (#1E3A8A→#1E40AF)
Índice 3: bachillerato→ image: /bachillerato.png → color: navy profundo (#0A1628→#1E3A8A)
Índice 4: financiera  → image: /2.png  → color: verde esmeralda (#064E3B→#059669)
Índice 5: labs        → image: /3.png  → color: violeta (#2E1065→#6D28D9)
Índice 6: robotica    → image: /7.png  → color: naranja quemado (#7C2D12→#C2410C)
Índice 7: idiomas     → image: /8.png  → color: magenta (#4A044E→#86198F)
```

Cada producto tiene: `id, name, badge, description, meta, icon (FontAwesome fa-*), color (gradient string), accent (hex), image (path), href, available (bool), features? (string[]), external? (bool)`

**`TESTIMONIOS`** — 3 testimoniales de docentes (Verónica Salinas, Alejandro Mendoza, Patricia Guerrero). Cada uno: `nombre, cargo, avatar (2 letras), color (hex), quote`.

**`CYCLING_WORDS`** — `['sí funciona.', 'transforma.', 'inspira.', 'avanza.']`

**`PARTICLES`** — 12 objetos para las partículas flotantes del Hero.

**`LIVE_AVATARS`** — 5 colores hex para los avatares del contador de docentes activos.

**`STATS_TARGETS`** — `[34, 364, 40, 7]` — targets para el count-up de la stats band.

### Estado (useState / useRef):
```ts
mounted: boolean                          // SSR guard
activeTestimonio: number                  // índice del testimonio activo (0-2)
activePanel: number | null               // índice del panel activo en el accordion
accordionVisible: boolean                // true cuando el accordion entró al viewport
accordionRef: RefObject<HTMLDivElement>   // ref del .prod-accordion
wordIdx: number                          // índice de la cycling word del Hero
wordVisible: boolean                     // visibilidad para la transición de cycling word
navScrolled: boolean                     // true cuando scroll > 60px (activa nav pill)
liveCount: number                        // contador animado de "127+ docentes activos"
statNums: number[]                       // [0,0,0,0] → [34,364,40,7] animados
statsBandRef: RefObject<HTMLElement>     // ref del .stats-band para el observer
statsStartedRef: RefObject<boolean>      // guard para no disparar el count-up dos veces
```

### useEffects:
1. `setMounted(true)` — SSR guard
2. Cycling word — interval cada 3200ms con fade de 280ms
3. Nav scroll — listener en `window.scroll`
4. Live count — count-up de 0 a 127 con setInterval(22ms)
5. Stats count-up — IntersectionObserver en `statsBandRef`, dispara count-up cuando entra viewport
6. Scroll reveal — IntersectionObserver en todos los `.reveal`, añade `.reveal--visible`
7. Accordion visibility — IntersectionObserver en `accordionRef`, activa `accordionVisible` → clase `prod-accordion--in`

### Variable derivada antes del return:
```ts
const activeT = TESTIMONIOS[activeTestimonio] ?? TESTIMONIOS[0]!;
```

---

## 5. ANATOMÍA DE LAS SECCIONES CLAVE

### ACCORDION DE PRODUCTOS (`.prod-section` → `.prod-accordion`)

Estructura de cada `.prod-panel`:
```tsx
<div className="prod-panel [active|inactive]" onClick={toggle}>
  <img className="pp-bg-img [pp-bg-img--show]" />   {/* imagen del producto */}
  <div className="pp-color-overlay" style={{background: p.color}} />  {/* tinte de color */}
  <div className="pp-blob pp-blob-1" />
  <div className="pp-blob pp-blob-2" />
  <div className="pp-icon-ring [pp-icon-ring--lg]">  {/* icono, se hace grande al activo */}
    <i className="fas fa-..." />
  </div>
  <div className="pp-collapsed-label">              {/* texto HORIZONTAL del nombre */}
    <span>{p.name}</span>
  </div>
  <button className="pp-discover-btn" onClick={openPanel}>  {/* reemplaza el 01/02 */}
    <i className="fas fa-compass" />
    <span>Descubre</span>                           {/* el <span> se oculta en .inactive */}
  </button>
  <div className="pp-content [pp-content--show]">  {/* contenido expandido */}
    <button className="pp-close" />                {/* solo visible cuando active */}
    <div className="pp-eyebrow">{p.badge}</div>
    <div className="pp-name">{p.name}</div>
    <p className="pp-desc">{p.description}</p>
    <div className="pp-meta">{p.meta}</div>
    {p.features && <div className="pp-chips">...</div>}
    <div className="pp-cta-row">
      {/* pc-cta-btn con background: p.accent O pc-coming */}
    </div>
  </div>
</div>
```

**Comportamiento visual del panel:**
- Base: `background: #06080f` (negro azulado)
- Imagen: siempre visible, opacity 0.38 (colapsado) / 0.55 (activo)
- Color overlay: `p.color` gradient a opacity 0.55 — tinte sobre la imagen
- Cuando activo: imagen visible en la mitad izquierda, contenido en la mitad derecha (`left: 50%`)
- Icono: flex child (centrado top) cuando colapsado; `position: absolute; top:28px; left:28px` cuando activo
- Texto: HORIZONTAL (ya no vertical), centrado, word-break
- Discover button: glassmorphism pill en la parte inferior; al ser `.inactive`, el `<span>` se oculta

### LEARN SECTION (`.learn-section`)
Aparece DESPUÉS del accordion (antes de la stats band).
- Encabezado centrado con eyebrow + heading + divider
- 4 cards del `PRODUCTS.slice(0, 4)` (Preescolar, Primaria, Secundaria, Bachillerato)
- Alternando `.learn-card--dark` (navy `#0B2545→#1E40AF`) y `.learn-card--warm` (sky blue `#0369A1→#38BDF8`)
- Sin naranja. La paleta completa es azul.

### FEATURED SECTION (`.featured-section`)
Aparece después de la stats band.
- Grid 2×2 de feat-cards alternando `.feat-card--dark` (navy) / `.feat-card--warm` (sky blue)
- 4 cards: Currículo Oficial · Seguimiento en Vivo · Sin Instalación · Siempre Actualizado
- Texto derecha: eyebrow + heading + divider + descripción + CTA button → `/bachillerato`

### TESTIMONIOS SPLIT (`.testimonios-section`)
- Fondo blanco (`background: #fff` — override del viejo dot-pattern)
- Layout 2 columnas: `grid-template-columns: 400px 1fr; gap: 80px`
- **Izquierda:** orb flotante (navy gradient, 270px diámetro, animación orbFloat) con texto "Educación que sí funciona", dos puntos decorativos azules
- **Derecha:** comilla decorativa + `.test-quote-text` + `.test-author` (avatar + nombre + cargo) + `.test-dots` (3 botones de navegación)
- La variable `activeT` alimenta la columna derecha; los dots llaman `setActiveTestimonio(i)`

### CTA FINAL y FOOTER
- Ambos usan `background: linear-gradient(160deg, #060A1A 0%, #0B1A3E 55%, #0A1630 100%)`
- Se fusionan visualmente — el footer ya no tiene un tono diferente

---

## 6. PALETA DE COLORES CSS (`:root`)

```css
--cen-navy:           #0B2545
--cen-navy-2:         #0E2D56
--cen-blue:           #1E40AF
--cen-accent:         #7DD3FC   /* sky blue, color de acento principal */
--cen-accent-soft:    #DBEAFE
--cen-highlight:      #1E40AF
--cen-highlight-soft: #EFF6FF
--bg:                 #F8FAFC
--ink:                #0B2545
--ink-80:             rgba(11,37,69,0.85)
--ink-60:             rgba(11,37,69,0.72)
--ink-40:             rgba(11,37,69,0.50)
--ink-10:             rgba(11,37,69,0.12)
```

**Regla de color para los acordeón:** Los 4 niveles educativos van en familia de azules. Financiera, Labs, Robótica e Idiomas mantienen sus propios colores pero se muestran como OVERLAY sobre la imagen, no como bloques sólidos. Nunca usar naranja en secciones generales de la landing (la learn section y featured usan azul para ambas variantes de card).

---

## 7. CLASES CSS PRINCIPALES (referencia rápida)

### Accordion:
`.prod-accordion` · `.prod-panel` · `.prod-panel.active` · `.prod-panel.inactive` · `.prod-accordion--in` (clase que dispara animación de entrada) · `.pp-bg-img` · `.pp-bg-img--show` · `.pp-color-overlay` · `.pp-blob-1/2` · `.pp-icon-ring` · `.pp-icon-ring--lg` · `.pp-collapsed-label` · `.pp-discover-btn` · `.pp-content` · `.pp-content--show` · `.pp-close` · `.pp-eyebrow` · `.pp-name` · `.pp-desc` · `.pp-meta` · `.pp-chips` · `.pp-chip` · `.pp-cta-row` · `.pp-dots` · `.pp-dot` · `.pp-dot--active`

### Learn section:
`.learn-section` · `.learn-inner` · `.learn-header` · `.learn-eyebrow` · `.learn-heading` · `.learn-divider` · `.learn-cards` · `.learn-card` · `.learn-card--dark` · `.learn-card--warm` · `.lc-bg-icon` · `.lc-inner` · `.lc-name` · `.lc-badge` · `.lc-arrow`

### Featured section:
`.featured-section` · `.featured-inner` · `.featured-grid` · `.feat-card` · `.feat-card--dark` · `.feat-card--warm` · `.feat-card-icon` · `.feat-card-title` · `.feat-card-sub` · `.featured-eyebrow` · `.featured-heading` · `.featured-divider` · `.featured-desc` · `.featured-cta`

### Testimonios split:
`.testimonios-section` · `.test-split` · `.test-split-left` · `.test-orb-bg` · `.test-orb-main` · `.test-orb-icon` · `.test-orb-text` · `.test-orb-dot-1/2` · `.test-split-right` · `.test-bigquote` · `.test-quote-text` · `.test-author` · `.test-avatar` · `.test-author-info` · `.test-author-name` · `.test-author-cargo` · `.test-dots` · `.test-dot` · `.test-dot--active`

### CTA Final:
`.cta-final` · `.cta-orbs` · `.cta-orb-1/2/3` · `.cta-final-inner` · `.cta-eyebrow` · `.cta-headline` · `.cta-sub` · `.cta-action-cards` · `.cta-action-card` · `.cta-action-card--primary` · `.cac-icon` · `.cac-text` · `.cac-label` · `.cac-title` · `.cac-arrow` · `.cta-proof-row` · `.cta-proof-item` · `.cta-proof-dot`

### Botones de producto (CTA dentro del accordion expandido):
`.pc-cta-btn` — pill button con `background: p.accent`, usado en accordion cuando el producto tiene href  
`.pc-coming` — span "Próximamente" cuando `href === '#'`

### Reveal animation:
`.reveal` — clase base en elementos que entran con animación  
`.reveal--visible` — clase que añade el IntersectionObserver para activar la animación

---

## 8. DECISIONES DE DISEÑO TOMADAS

| Decisión | Razón |
|---|---|
| Accordion (no lista horizontal) | El usuario rechazó explícitamente la lista horizontal; quiere el accordion original |
| Texto de fichas horizontal | El usuario pidió cambiar del texto vertical rotado |
| Botón "Descubre" en lugar de número | El usuario pidió reemplazar el 01/02/03 con algo más estético |
| Imágenes con overlay de color (no bloques sólidos) | El usuario rechazó los colores sólidos por "no armonizar" |
| Familia de azules para niveles educativos | Indicación explícita del usuario |
| Learn section DESPUÉS del accordion | El usuario pidió moverla "abajo" |
| Sin naranja en ninguna sección general | Indicación explícita: usar el sky blue (`#0369A1→#38BDF8`) como "warm" |
| Footer con mismo gradient que CTA Final | El usuario notó diferencia de tonos y pidió que igualaran |
| Testimonios como split layout (orb + quote) | El usuario rechazó el grid de 3 cards, quería estilo similar a referencia mostrada |

---

## 9. LO QUE FALTA / POSIBLES MEJORAS

El usuario no ha pedido estas cosas explícitamente, pero son tareas pendientes naturales:

1. **Revisar visualmente el accordion en el navegador** — los cambios recientes (overlay de imágenes, texto horizontal, botón Descubre) no han sido verificados en tiempo real. Hay que asegurarse que el texto horizontal no se vea mal en los paneles estrechos.

2. **Mobile responsive del accordion** — existe CSS responsive para el accordion (en `@media (max-width: 768px)`) pero puede necesitar ajustes dados los cambios recientes al layout del panel.

3. **La learn section muestra solo `PRODUCTS.slice(0, 4)`** — actualmente serían Preescolar, Primaria, Secundaria y Bachillerato (los 4 niveles educativos). Esto es intencional y correcto.

4. **Animación de transición del testimonio** — al hacer click en los dots, el texto cambia inmediatamente sin transición suave. Se podría añadir fade.

5. **Build de producción** — no se ha corrido `npm run build`. Se recomienda verificar antes de hacer deploy.

6. **Página `/bachillerato`** — existe como ruta destino del CTA pero su estado es desconocido en este handoff.

---

## 10. COMANDOS ÚTILES

```powershell
# Desde la raíz del proyecto:
cd "c:\Users\crist\.gemini\antigravity\scratch\NEM BACHILLERATO\cen-bachillerato"

# Servidor de desarrollo:
npm run dev

# Verificar tipos TypeScript (0 errores al cierre de esta sesión):
npx tsc --noEmit

# Build de producción:
npm run build
```

---

## 11. INSTRUCCIONES PARA LA IA QUE CONTINÚE

1. **Lee este archivo completo antes de tocar cualquier cosa.**
2. Los dos archivos que debes modificar son `LandingPageCEN.tsx` y `LandingCEN.css`. No hay más archivos involucrados en la landing.
3. Antes de editar el CSS, usa `Grep` para encontrar la clase exacta — el archivo tiene ~4400 líneas y hay clases que aparecen múltiples veces (algunas son overrides intencionales al final del archivo).
4. Los últimos overrides del CSS están al final del archivo (después de la línea ~3937). Si añades CSS nuevo, ponlo al final.
5. **No uses git** — no es un repositorio git.
6. **No hagas push** — el usuario trabaja solo en local por ahora.
7. El usuario es el dueño del producto CEN y toma decisiones de diseño. Propón, no impongas. Si rechaza algo, no lo vuelvas a implementar.
8. Siempre corre `npx tsc --noEmit` después de cambios en el TSX para confirmar 0 errores.
9. El usuario puede ser directo o molestarse si algo se ve mal. Es normal. Corrige sin defenderte.
