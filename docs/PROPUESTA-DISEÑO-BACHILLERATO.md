# Propuesta Sistema de Diseño — CEN Bachillerato

> Basado en el análisis de CEN Educación Financiera (`docs/SISTEMA-DISEÑO-FINANCIERA.md`)  
> Fecha: 2026-05-13 | Estado: **PENDIENTE DECISIÓN USUARIO**

---

## 1. Qué se hereda de Financiera (sin cambios)

| Elemento | Valor | Justificación |
|----------|-------|---------------|
| Tipografía principal | `Epilogue` variable (400–900) | Versátil, legible, no infantil — funciona igual para 15-18 años |
| Navbar pattern | Fixed top, transparente → blur en scroll | Patrón UX establecido, re-implementar limpio |
| Layout split login | 50/50 branding + form | Profesional, aplica igual para bachillerato |
| Border radius cards | `rounded-[2.5rem]` (32px) | Da carácter al sistema sin ser infantil |
| Border radius botones | `rounded-2xl` (16px) | Consistente con cards |
| Sistema de sombras | Tres niveles (card, hover, premium) | Jerarquía visual clara |
| Labels de inputs | `text-xs uppercase tracking-[0.15em]` | Detalle premium, funciona en cualquier audiencia |
| Componente ProgressRing | SVG circular, `strokeDashoffset` | Reutilizable para progresión de UAC |
| Estructura de animaciones | `duration-300` hover, `duration-700` premium | Valores ya calibrados |
| Eyebrow text style | `text-[10px]–[11px]`, uppercase, `tracking-[0.3em]` | Funciona en contextos institucionales |

---

## 2. Qué se adapta (diferencias Financiera vs. Bachillerato)

| Aspecto | Financiera (6–15 años) | Bachillerato (15–18 años + institucional) |
|---------|----------------------|------------------------------------------|
| Tono del fondo | Beige cálido `#F4F1EA` (lúdico) | Neutro frío o blanco roto (más serio) |
| Cyan `#42E8E0` | Acento secundario prominente | Reducido o sustituido (muy primario) |
| Gamificación | Monedas, rangos, "Reto Alcanzado" | Eliminada — reemplazar con progresión académica |
| Emojis funcionales | En cards de módulos | Sustituir por Lucide SVG con aria-label |
| Animaciones 3D tilt | Obligatoria en PillarCard/UnitCard | Opcional — sólo en landing, no en hub |
| Mouse aura flare | Efecto de videojuego | Sólo en landing hero si se usa |
| Marquee de aliados | Scroll de logos | Mantener patrón, nuevo contenido (SEP, CENEVAL) |
| Dashboard docente | Oscuro, data-heavy | Mantener oscuro — ya es apropiado |
| Font secundaria | `Plus Jakarta Sans` (formal alt) | Mantener como alt para elementos MCCEMS |

---

## 3. Componentes nuevos que Bachillerato necesita

Financiera NO tiene estos — hay que diseñarlos desde cero:

| Componente | Descripción | Prioridad |
|------------|-------------|-----------|
| `UACCard` | Card de UAC con código, nombre, semestre, tipo, estado de progresión | P0 — ya existe, necesita rediseño |
| `SemestreSelector` | Tabs/selector de 1-6 semestres con estado activo/disponible/bloqueado | P0 — ya existe, necesita rediseño |
| `ProgresionCard` | Card de progresión individual (placeholder vs real, estado completado) | P0 — ya existe, necesita rediseño |
| `MCCEMSSidebar` | Navegación lateral por Área de Conocimiento / Recurso Sociocognitivo | P1 |
| `BreadcrumbMCCEMS` | `Hub → Semestre N → UAC: código` | P1 |
| `ProgressBar` horizontal | Barra lineal de progreso (alternativa al ring) | P1 |
| `RoleBadge` | Pill de rol: Estudiante / Docente / Admin | P1 |
| `PlaceholderState` | Estado vacío para secciones sin contenido real todavía | P1 |
| `AlertMCCEMS` | Alerta informativa sobre alineación curricular | P2 |

---

## 4. Opciones de paleta

> **Decide una opción (1, 2 o 3) antes de avanzar a Fase 3.**  
> Puedes pedir ajustes específicos a cualquiera de ellas.

---

### Opción 1 — Fidelidad de Marca (Conservadora)

**Premisa:** Misma paleta que Financiera, adaptación solo en tono (eliminar gamificación, no en colores). El cliente reconoce CEN como una sola familia visual.

| Token | Color | Hex |
|-------|-------|-----|
| `--primary` | Navy CEN | `#011C40` |
| `--accent` | Orange CEN | `#FF8C00` |
| `--accent-2` | Cyan CEN | `#42E8E0` |
| `--bg` | Beige/Lino | `#F4F1EA` |
| `--surface` | Blanco roto | `#FFFCF7` |
| `--accent-soft` | Orange pastel | `#FFE3BF` |
| `--accent-2-soft` | Cyan pastel | `#D6FAF8` |
| `--cream` | Crema cálida | `#FFF1D6` |
| `--text` | Ink (= primary) | `#011C40` |
| `--text-muted` | Slate | `#64748B` |
| `--border` | Slate light | `#E2E8F0` |

**Paleta secundaria** (estados MCCEMS):
- Completado: `#059669` (emerald-600)
- En progreso: `#FF8C00` (accent)
- Sin iniciar: `#94A3B8` (slate-400)
- Bloqueado: `#E2E8F0` (slate-200)

**Pros:** Coherencia total con Financiera, re-uso del catálogo visual, cliente reconoce la marca.  
**Contras:** El beige `#F4F1EA` puede percibirse infantil para directores de bachillerato que lo comparen con sistemas SEP.

---

### Opción 2 — Institucional (Seria)

**Premisa:** Mantiene el navy y el naranja (identidad CEN), pero reemplaza el cyan y el beige por tonos más formales y neutros. Apropiada para presentaciones institucionales con SEP, CENEVAL, o directivos.

| Token | Color | Hex | Diferencia |
|-------|-------|-----|-----------|
| `--primary` | Navy CEN | `#011C40` | = Financiera |
| `--accent` | Orange profundo | `#E07000` | Más oscuro/serio que `#FF8C00` |
| `--accent-2` | Azul acero | `#1E6FA8` | Reemplaza cyan |
| `--bg` | Gris frío | `#F0F2F5` | Reemplaza beige cálido |
| `--surface` | Blanco puro | `#FFFFFF` | Más limpio |
| `--accent-soft` | Naranja suave | `#FDE8CC` | Más apagado |
| `--accent-2-soft` | Azul suave | `#DBEAFE` | Tailwind blue-100 |
| `--cream` | (eliminado) | — | No aplica para bachillerato |
| `--text` | Ink (= primary) | `#011C40` | = Financiera |
| `--text-muted` | Slate | `#475569` | Ligeramente más oscuro |
| `--border` | Gris medio | `#CBD5E1` | Más definido |

**Paleta secundaria:**
- Completado: `#16A34A` (green-600)
- En progreso: `#E07000` (accent)
- Sin iniciar: `#94A3B8`
- Bloqueado: `#E2E8F0`

**Pros:** Proyecta seriedad institucional. El azul acero `#1E6FA8` como secundario es más "académico" que el cyan.  
**Contras:** Pierde la calidez y personalidad de marca que tiene Financiera. El naranja `#E07000` es menos vibrante.

---

### Opción 3 — Académica Moderna

**Premisa:** Re-interpreta CEN para un contexto de educación media superior contemporánea. Navy más profundo, naranja moderno, sin cyan, fondo casi-blanco. Referencia: plataformas EdTech tipo Khan Academy o Duolingo for Schools — sin ser infantil.

| Token | Color | Hex | Diferencia |
|-------|-------|-----|-----------|
| `--primary` | Navy rico | `#0F2A5E` | Más profundo que `#011C40` |
| `--accent` | Naranja moderno | `#F97316` | Tailwind orange-500 — vibrante pero maduro |
| `--accent-2` | Verde MCCEMS | `#059669` | Reemplaza cyan — verde=aprendizaje/logro |
| `--bg` | Blanco cálido | `#FAFAF8` | Casi blanco, muy ligero |
| `--surface` | Blanco | `#FFFFFF` | Puro para cards |
| `--accent-soft` | Naranja muy suave | `#FFF7ED` | Tailwind orange-50 |
| `--accent-2-soft` | Verde muy suave | `#ECFDF5` | Tailwind emerald-50 |
| `--accent-3` | Azul cielo | `#0EA5E9` | Para estados informativos |
| `--text` | Slate profundo | `#1E293B` | slate-800 — no navy puro |
| `--text-muted` | Slate | `#64748B` | = Financiera |
| `--border` | Slate claro | `#E2E8F0` | = Financiera |

**Paleta secundaria:**
- Completado: `#059669` (= accent-2)
- En progreso: `#F97316` (= accent)
- Sin iniciar: `#94A3B8`
- Bloqueado: `#F1F5F9`

**Pros:** Diferencia a Bachillerato de Financiera como producto separado y más maduro. El verde como accent-2 funciona semánticamente para logros académicos.  
**Contras:** Se aleja más de la identidad visual existente de CEN. El navy `#0F2A5E` puede no ser reconocido como "el mismo CEN". Requiere decisión de si ambas plataformas deben verse relacionadas.

---

## 5. Análisis de tono visual

| Dimensión | Opción 1 | Opción 2 | Opción 3 |
|-----------|----------|----------|----------|
| Calidez del fondo | Alta (beige) | Baja (gris frío) | Media (blanco cálido) |
| Reconocimiento de marca | 100% | 80% | 60% |
| Apropiado para directivos SEP | Medio | Alto | Alto |
| Apropiado para alumnos 15-18 | Alto | Medio | Alto |
| Diferenciación de Financiera | Baja | Media | Alta |
| Complejidad de implementación | Baja | Media | Media |

---

## 6. Recomendación técnica

La **Opción 1** tiene el menor riesgo: reutiliza todos los valores documentados, el cliente reconoce la marca, y los alumnos de bachillerato no perciben el beige como infantil (el beige es neutro — los emojis y las monedas son lo infantil, no el color).

La **Opción 3** tiene el mayor potencial de diferenciación si el cliente quiere posicionar CEN Bachillerato como una plataforma distinta y más madura.

La **Opción 2** es la opción segura para demos con instituciones del sector público.

---

## Decisiones requeridas

> **Antes de avanzar a FASE 3, necesito dos respuestas:**
>
> 1. **¿Qué paleta?** Opción 1, Opción 2, Opción 3, o ajustes a una de ellas.
> 2. **¿Tono visual?** ¿Se mantienen animaciones 3D tilt en el hub, o sólo en la landing? ¿Mouse aura en hub o sólo landing?

No se escribe una sola línea de código de implementación hasta tener estas dos respuestas.
