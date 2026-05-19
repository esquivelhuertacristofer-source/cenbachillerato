# Estándar de Microstates — CEN Bachillerato

Todo componente interactivo **debe** implementar los 6 microstates definidos aquí.
Los componentes que omitan alguno serán rechazados en code review.

---

## Los 6 Microstates

### 1. Default
Estado base en reposo. Define la identidad visual del componente.

- Color de fondo, borde y texto claros y estables
- No hay transforms activos
- `cursor: default` o `cursor: pointer` según corresponda

### 2. Hover
El usuario posiciona el cursor sobre el elemento (desktop).

- Elevación visual: `translateY(-2px)` a `translateY(-4px)` máximo
- Incremento de brillo en borde o fondo: opacidad +10-15%
- Sombra aparece o se intensifica
- Duración: `transitions.cardHover` (spring snappy)
- **Regla:** hover ≠ active. No usar los mismos estilos para ambos.
- **Regla:** componentes `disabled` NO tienen hover animations.

### 3. Focus
Elemento recibe foco de teclado (`Tab`, `Shift+Tab`, clicks en inputs).

- **Nunca** `outline: none` sin reemplazo visible.
- Reemplazar con: `outline: 2px solid <color.hex>; outline-offset: 3px`
- O border con `box-shadow: 0 0 0 3px rgba(<color.rgba>, 0.35)`
- Visible en modo de alto contraste

### 4. Active / Pressed
El elemento está siendo presionado (mousedown / touch).

- Scale down: `scale(0.97)` o `scale(0.95)` para botones grandes
- Sombra se reduce o desaparece
- Duración: instant (`durations.instant` = 0.1s)
- Más oscuro que hover, nunca más brillante

### 5. Disabled
El elemento no está disponible para interacción.

- `cursor: not-allowed`
- Opacidad reducida: texto a `rgba(255,255,255,0.25)`, fondo a `rgba(255,255,255,0.08)`
- Sin `pointer-events` sobre elementos hijos que puedan interferir
- **Sin** hover animations (véase regla en Hover)
- **Sin** focus ring visible (el elemento no recibe foco)

### 6. Loading
Operación asíncrona en curso.

- Solo para acciones que tardan **más de 300ms**
- Spinner o skeleton según contexto:
  - Botón: reemplazar texto por `<i className="fa-solid fa-spinner fa-spin" />`
  - Card: skeleton shimmer con gradient animado
- Deshabilitar interacciones durante loading (comportarse como Disabled)
- Cursor: `wait` en el botón raíz

---

## Reglas Generales

| Regla | Detalle |
|-------|---------|
| No `outline: none` naked | Siempre reemplazar con focus ring visible |
| Hover ≠ Active | Estilos distintos para cada uno |
| Disabled no hover | `disabled && return null` en handlers hover |
| Loading > 300ms | Solo mostrar spinner si la espera supera 300ms |
| Reducted motion | Todos los transforms y springs respetan `useReducedMotion()` |
| Spring primero | Preferir `transitions.*` de `motion/tokens` sobre duraciones fijas |

---

## Checklist por Componente

Antes de marcar un componente como listo, verificar:

- [ ] **Default**: apariencia definida y estable
- [ ] **Hover**: elevación + brillo, con `transition` correcto
- [ ] **Focus**: `outline` o `box-shadow` visible con `outline-offset`
- [ ] **Active**: scale down o darkening al presionar
- [ ] **Disabled**: opacidad reducida, sin hover, cursor `not-allowed`
- [ ] **Loading**: spinner o skeleton si operación > 300ms
- [ ] `prefers-reduced-motion` respetado en todos los transforms
- [ ] Testado con teclado (Tab → Enter → Shift+Tab)

---

## Tokens de Referencia

```ts
import { springs, transitions, durations } from '@/lib/motion/tokens'

// Hover
transition: transitions.cardHover   // spring snappy

// Active press
transition: { duration: durations.instant }

// Page enter
transition: transitions.pageEnter

// Celebración
transition: transitions.celebrate   // spring bouncy
```

---

## Ejemplo Mínimo — Botón Interactivo

```tsx
<motion.button
  whileHover={!disabled && !reducedMotion ? { y: -2, scale: 1.01 } : {}}
  whileTap={!disabled ? { scale: 0.97 } : {}}
  transition={transitions.cardHover}
  disabled={disabled || isLoading}
  style={{
    cursor: disabled ? 'not-allowed' : 'pointer',
    outline: 'none',
    // focus ring via :focus-visible in CSS
  }}
>
  {isLoading ? <i className="fa-solid fa-spinner fa-spin" /> : children}
</motion.button>
```

CSS complementario:
```css
.mi-boton:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 3px;
}
```
