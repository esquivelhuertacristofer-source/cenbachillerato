# Auditoría Visual — Dashboard Docente CEN Bachillerato
**Fecha:** 2026-05-25  
**Referencia:** CEN Financiera (`CEN-FINANCIERA-ENTREGA-UAEMEX-20260513-173334`)  
**Severidades:** ALTA / MEDIA / BAJA

---

## Resumen ejecutivo

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| ALTA      | 4        | Pendiente fix |
| MEDIA     | 6        | Pendiente fix |
| BAJA      | 4        | Pendiente fix |
| **Total** | **14**   | |

**Top 5 críticos:**
1. Sin navegación mobile (hamburger/drawer) — ALTA
2. Planteamiento izquierdo invisible en mobile — ALTA
3. Padding no escalado (`p-12` fijo en todos los breakpoints) — ALTA
4. Headings no responsive (`text-7xl`/`text-8xl` sin modificadores) — ALTA
5. `h-screen overflow-y-auto` en main rompe comportamiento con MobileNav — MEDIA

---

## Páginas auditadas

### 1. `/dashboard/docente/` — Panel Principal
**Archivo:** `src/app/dashboard/docente/page.tsx`  
**Tema:** Oscuro (`bg-[#011C40]`)

#### A. Layout y espaciados
- ✅ `md:ml-[260px]` correcto, no deja espacio lateral injustificado
- ❌ **ALTA** — `p-12 space-y-24` en `<main>`: 48px padding y 96px vertical gaps sin reducirse en breakpoints pequeños
- ❌ **ALTA** — HUD bar `px-12 py-5`: en mobile 375px quedan solo 279px útiles (375-96=279px)
- Vs Financiera: teacher/page.tsx usa `px-4 md:px-8 lg:px-12` en su HUD bar — **replicar**

#### B. Responsive (375px → 1920px)
- ❌ **ALTA (Mobile)** — Sin navegación mobile. Sidebar `hidden md:flex`. En 375px el usuario no puede navegar a ninguna página.
- ✅ `flex-1 md:ml-[260px]` sin ml en mobile — correcto, no hay offset inútil
- ✅ Bento grid `lg:grid-cols-12` → col-span en mobile apila correctamente
- ❌ **MEDIA** — `h-screen overflow-y-auto` en main: si se agrega MobileNav fixed, el contenido queda 56px bajo el fold sin compensación

#### C. Jerarquía visual
- ✅ WelcomeBanner es visualmente dominante y claro
- ✅ "Resumen Ejecutivo" h2 `text-4xl` correcto
- ✅ MetricCards, LatestDeliveries, TopAlumnos en bento grid bien jerarquizados

#### D. Elementos faltantes
- ❌ **BAJA** — No hay breadcrumb explícito (el HUD bar muestra "CEN Bachillerato MCCEMS" pero sin ubicación dentro del nav)
- ✅ Loading: el layout.tsx protege auth antes de render, no hay flash de contenido

#### E. Microinteracciones
- ✅ Hover states en componentes (MetricCards, TopAlumnos)
- ❌ **BAJA** — `animate-pulse` en background blobs sin `@media (prefers-reduced-motion: reduce)`

---

### 2. `/dashboard/docente/alumnos/` — Mis Alumnos
**Archivo:** `src/app/dashboard/docente/alumnos/page.tsx`  
**Tema:** Claro (`bg-[#F4F1EA]`)

#### A. Layout y espaciados
- ✅ Contenedor sin `max-width` artificial — usa el ancho disponible
- ❌ **ALTA** — `p-12` en loading state y main sin escalar a mobile
- ❌ **ALTA** — Header `p-16`: 128px de padding total horizontal en el card oscuro
- ❌ **MEDIA** — Cards de alumnos con `p-12` (48px): muy generosas en mobile, pierden espacio sin dar información extra

#### B. Responsive
- ❌ **ALTA** — Sin nav mobile (mismo problema global)
- ✅ Grid `md:grid-cols-2 xl:grid-cols-3` — bien responsivo
- ❌ **ALTA** — H1 "Mis Alumnos" `text-7xl` sin modificadores responsive. En 375px puede desbordarse o quedar en 3 líneas
- ✅ Search bar `w-full xl:w-96` — responsivo
- ❌ **MEDIA** — Modal `xl:flex-row`: en 768px-1280px el modal se apila (flex-col) y el sidebar interno ocupa todo el alto visible, el historial queda fuera de vista inicial

#### C. Jerarquía visual
- ✅ Header dark con logo de sección y search integrado — buena jerarquía
- ✅ Cards con initials, badges, métricas y CTA bien estructurados
- ✅ Empty state con icono Users y mensaje — existe

#### D. Elementos faltantes
- ✅ Loading state completo (skeletons de cards animate-pulse)
- ✅ Empty state existe
- ❌ **BAJA** — Falta estado de error si Supabase falla (actualmente silencioso)

#### E. Microinteracciones
- ✅ Cards `hover:-translate-y-3 hover:shadow-2xl` — buen feedback
- ✅ Focus ring `focus:ring-2 focus:ring-[#D4A574]` — accesible
- ✅ Botón descargar PDF con `active:scale-95`

---

### 3. `/dashboard/docente/planteamiento/` — Planteamiento MCCEMS
**Archivo:** `src/app/dashboard/docente/planteamiento/page.tsx`  
**Tema:** Claro (`#F4F1EA`)

#### A. Layout y espaciados
- ✅ Layout 2 paneles (380px left + flex-1 right) eficiente para desktop
- ❌ **ALTA** — Left panel `hidden md:flex width:380px` — completamente invisible en mobile. **El usuario mobile no puede cambiar UAC ni progresión.**
- ❌ **ALTA** — Sticky nav con padding `18px 48px` — 96px de padding horizontal. En tablet (768px) disponible: 768-260(sidebar)-96(padding)=412px — ajustado pero funcional
- ❌ **MEDIA** — Main `flex h-screen overflow-hidden`: sin compensación para MobileNav en mobile

#### B. Responsive
- ❌ **ALTA (Crítico)** — En 375px: solo se ve el right panel sin selector de UAC ni progresión. El visor no muestra nada diferente si el usuario no puede elegir.
- ❌ **ALTA** — No hay forma de cambiar tab (Estrategia/Teoría/Evaluación) intuitivamente en mobile — los tabs son visibles pero el botón tab strip no tiene scroll horizontal
- Vs Financiera planeamiento: tiene `mounted` check pero mismo problema de left panel hidden

#### C. Jerarquía visual
- ✅ Left panel con código UAC y búsqueda — claro
- ✅ Hero bento con título, duración y dificultad — bien jerarquizados
- ✅ Tabs centrados con glassmorphism — se ven bien
- ❌ **MEDIA** — Sticky nav muestra solo "Contenido MCCEMS" — poca información sobre contexto en mobile

#### D. Elementos faltantes
- ✅ `PendingPlaceholder` y `EmptyContent` para contenido stub
- ❌ **BAJA** — No hay estado de carga (no necesita DB, pero hay una micro-delay en JS)

#### E. Microinteracciones
- ✅ Cards de progresión con scale y shadow al activar
- ✅ Tabs con scale y color transition

---

### 4. `/dashboard/docente/modulos/` — Módulos CEN
**Archivo:** `src/app/dashboard/docente/modulos/page.tsx`  
**Tema:** Oscuro (`bg-[#011C40]`)

#### A. Layout y espaciados
- ✅ Usa `flex-1 md:ml-[260px]` correctamente
- ❌ **ALTA** — `p-12 space-y-16` sin escalar. En mobile 375px: 279px útiles con 96px de gaps
- ❌ **ALTA** — HUD bar `px-12` mismo problema global

#### B. Responsive
- ❌ **ALTA** — Sin nav mobile
- ✅ Grid semestres `md:grid-cols-2 xl:grid-cols-3` — buen responsive
- ❌ **ALTA** — H1 "Módulos CEN" `text-7xl` sin modifiers
- ✅ Cards semestre `h-[400px]` — en mobile (1 col) 400px de alto funciona
- ❌ **MEDIA** — `h-screen overflow-y-auto` en main — mismo problema con MobileNav

#### C. Jerarquía visual
- ✅ Cards de semestre con gradientes diferenciados — jerarquía clara
- ✅ Vista detalle UAC con breadcrumb y back button — buen flujo
- ✅ UAC items con código, nombre, progresiones y botón "Ver UAC"

#### D. Elementos faltantes
- ✅ Empty state para UAC vacías (Sparkles icon + mensaje)
- ❌ **BAJA** — Botón "Ver UAC" no navega a ningún lado (funcionalidad pendiente)

#### E. Microinteracciones
- ✅ Cards semestre `hover:-translate-y-4 hover:shadow-[...]` — excelente
- ✅ UAC items `group-hover:translate-x-2` en nombre

---

### 5. `/dashboard/docente/reportes/` — Reportes Académicos
**Archivo:** `src/app/dashboard/docente/reportes/page.tsx`  
**Tema:** Oscuro (`bg-[#011C40]`)

#### A. Layout y espaciados
- ✅ Grid `grid-cols-12 col-span-8/4` — bien balanceado para desktop
- ❌ **ALTA** — HUD bar `px-12`, content `p-12 space-y-16` sin escalar
- Vs Financiera: teacher/reportes/page.tsx usa misma estructura pero con theme toggle

#### B. Responsive
- ❌ **ALTA** — Sin nav mobile
- ✅ `col-span-12 lg:col-span-8` — en mobile/tablet apila correctamente
- ❌ **ALTA** — H1 "Reportes Académicos" `text-7xl` sin modifiers
- ✅ Bottom grid `md:grid-cols-3` — responsivo
- ❌ **MEDIA** — `h-screen overflow-y-auto` en main

#### C. Jerarquía visual
- ✅ HUD bar con "ANALÍTICA ACTIVA" y botón descarga — funcional
- ✅ PerformanceChart ocupa 8/12 cols — proporción correcta
- ✅ Meta alcanzada 84% y distribución MCCEMS en sidebar — datos complementarios

#### D. Elementos faltantes
- ❌ **MEDIA** — KPIs son todos datos hardcoded (84%, 15 Junio, etc.) — no conectados a datos reales
- ❌ **BAJA** — Sin loading skeleton para el teacherName (aparece undefined brevemente)

#### E. Microinteracciones
- ✅ HUD Download button `hover:scale-105 active:scale-95`
- ✅ Target card hover rotation

---

### 6. `/dashboard/docente/biblioteca/` — Biblioteca Maestra
**Archivo:** `src/app/dashboard/docente/biblioteca/page.tsx`  
**Tema:** Claro (`bg-[#F4F1EA]`)

#### A. Layout y espaciados
- ✅ `p-8 md:p-12` — ya tiene algo de responsividad (mejor que otras páginas)
- ❌ **MEDIA** — Header `p-16` dentro del card oscuro — demasiado en tablet
- ✅ Resource grid `md:grid-cols-2 2xl:grid-cols-3` — buen responsive

#### B. Responsive
- ❌ **ALTA** — Sin nav mobile
- ❌ **ALTA** — H1 `text-6xl md:text-8xl` — empieza responsivo pero 6xl (60px) en mobile sigue siendo grande
- ❌ **MEDIA** — Filter bar: 6 categorías + botón de filtro en `flex-wrap`. En 768px puede quedar en 2-3 líneas y solapar contenido
- ❌ **MEDIA** — `sticky top-8` en filter bar: 8=32px. Con MobileNav (56px fixed), el sticky queda a 32px del top visible, lo que lo posiciona debajo de MobileNav. Corregir a `top-0` o `top-14`
- ✅ Sin `h-screen overflow-y-auto` — página con scroll natural (bien para mobile)

#### C. Jerarquía visual
- ✅ Header hero oscuro con search integrado — impactante visualmente
- ✅ Filter bar sticky con pill buttons — rápido de usar
- ✅ Resource cards con CEN Choice badge, icon, tags y CTA

#### D. Elementos faltantes
- ✅ Empty state con icono, texto y botón "Restablecer Filtros" — completo

#### E. Microinteracciones
- ✅ Cards `hover:-translate-y-4` — buen feedback
- ✅ Resource links `group-hover/btn:translate-x-1` en ArrowUpRight
- ❌ **BAJA** — `animationDelay` en cards sin @keyframes animation asociada — el delay no produce efecto visible

---

## Comparación con CEN Financiera

| Aspecto | Financiera | Bachillerato | Acción |
|---------|-----------|-------------|--------|
| Mobile nav | `hidden md:flex` (mismo) | `hidden md:flex` | Fix en ambos — implementar en Bachillerato |
| Padding HUD | `px-4 md:px-8 lg:px-12` | `px-12` fijo | ✅ Replicar Financiera |
| Heading responsive | `text-5xl md:text-7xl` | `text--7xl` sin prefix | ✅ Replicar Financiera |
| Theme toggle | Sí (light/dark) | No (fijo por página) | Nice-to-have, no en scope |
| Filter scroll mobile | Sin scroll | Sin scroll | Fix en Bachillerato |
| Empty states | ✅ Completos | ✅ Completos | ✓ Paridad |
| Focus visible | Parcial | Parcial | Mejorar |
| Reduced motion | No | No | Fix en ambos |

---

## Lista consolidada de problemas

### ALTA (bloqueantes de calidad)

| # | Problema | Archivo(s) | Línea aprox. |
|---|----------|-----------|--------------|
| A1 | Sin navegación mobile — Sidebar `hidden md:flex` sin alternativa | `Sidebar.tsx:46` | L46 |
| A2 | Planteamiento: left panel `hidden md:flex` en mobile | `planteamiento/page.tsx:91` | L91 |
| A3 | `p-12` / `px-12` sin breakpoints en todos los main + HUD bars | Todas las páginas | múltiples |
| A4 | Headings `text-7xl`/`text-8xl` sin modificadores responsive | alumnos, modulos, reportes, biblioteca | múltiples |

### MEDIA

| # | Problema | Archivo(s) |
|---|----------|-----------|
| M1 | `h-screen overflow-y-auto` en main sin compensar MobileNav | home, modulos, reportes, planteamiento |
| M2 | Filter bar biblioteca overflow en tablet + sticky top incorrecto | `biblioteca/page.tsx:203` |
| M3 | Modal alumnos: sidebar ocupa full height en 768-1280px | `alumnos/page.tsx:519` |
| M4 | HUD bar info oculta con `hidden xl:flex` — en tablet nada intermedio | modulos/page.tsx, reportes/page.tsx |
| M5 | KPIs de reportes hardcodeados (84%, fecha, etc.) | `reportes/page.tsx:127-194` |
| M6 | Espaciado vertical `space-y-24` excesivo en home en pantallas medianas | `page.tsx:108` |

### BAJA

| # | Problema | Archivo(s) |
|---|----------|-----------|
| B1 | Sin `prefers-reduced-motion` — `animate-pulse` en toda la app | Sidebar, todas las páginas |
| B2 | Background blobs `w-[1400px]` — impacto GPU en mobile | home, modulos, reportes |
| B3 | `animationDelay` en cards sin @keyframes — no produce efecto | modulos, biblioteca, alumnos |
| B4 | Botón "Ver UAC" no navega — funcionalidad pendiente | `modulos/page.tsx:219` |

---

## Plan de fixes (FASE 2)

1. **`MobileNav.tsx`** — Hamburger + drawer, incluye todos los nav items
2. **`layout.tsx`** — Importar MobileNav, pasar teacherName, añadir wrapper `pt-14 md:pt-0`
3. **Todas las páginas** — Padding responsive, headings responsive, `md:h-screen md:overflow-y-auto`
4. **`planteamiento/page.tsx`** — Mobile selector UAC + progresión arriba del right panel
5. **`biblioteca/page.tsx`** — Filter bar scrollable horizontal en mobile, sticky top fix
