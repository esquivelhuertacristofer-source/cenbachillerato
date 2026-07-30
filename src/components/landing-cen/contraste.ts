// Umbral de tinta para superficies de color sólido.
//
// El mosaico de materias pinta cada tile con el color pleno de su área. Sobre
// esos colores, el blanco NO es una opción segura: de los 25 colores del
// catálogo de la landing, 23 dejan el texto blanco por debajo del 4.5:1 que
// pide WCAG AA (#FBBF24 llega a 1.67:1). La tinta oscura funciona en la gran
// mayoría, así que se elige por color en vez de fijar una sola.
//
// El cálculo es determinista y barato (25 colores, una vez al cargar el
// módulo): se hace aquí en TS y no con `color-mix`/`oklch()` en CSS, para que
// el resultado sea verificable por tests en vez de depender del navegador.
// Ver src/components/landing-cen/__tests__/contraste.test.ts.

export const TINTA_OSCURA = '#0A1A2F';
export const TINTA_CLARA = '#FFFFFF';

/** Mínimo de WCAG 2.1 AA para texto normal. */
export const CONTRASTE_AA = 4.5;

// WCAG 2.1, definición de "relative luminance": cada canal sRGB se
// des-gammatiza antes de ponderarse.
function canalLineal(canal: number): number {
  return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
}

/** Luminancia relativa (0 = negro, 1 = blanco) de un hex `#RRGGBB`. */
export function luminancia(hex: string): number {
  const r = canalLineal(parseInt(hex.slice(1, 3), 16) / 255);
  const g = canalLineal(parseInt(hex.slice(3, 5), 16) / 255);
  const b = canalLineal(parseInt(hex.slice(5, 7), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razón de contraste WCAG entre dos hex `#RRGGBB`; va de 1 a 21. */
export function contraste(unHex: string, otroHex: string): number {
  const a = luminancia(unHex);
  const b = luminancia(otroHex);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Aplana `capa` con opacidad `alfa` sobre `fondo` y devuelve el hex resultante.
 *
 * Hace falta porque varios fondos de la landing son el acento a baja opacidad
 * sobre blanco (las píldoras van a `rgba(acento, 0.12)`): el contraste real del
 * texto no es contra el acento ni contra el blanco, sino contra la mezcla. Sin
 * aplanar, cualquier verificación de AA sobre esas superficies mide un color
 * que no existe en pantalla.
 */
export function mezclarSobre(fondo: string, capa: string, alfa: number): string {
  const canal = (desde: number): string => {
    const f = parseInt(fondo.slice(desde, desde + 2), 16);
    const c = parseInt(capa.slice(desde, desde + 2), 16);
    return Math.round(c * alfa + f * (1 - alfa))
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  };
  return `#${canal(1)}${canal(3)}${canal(5)}`;
}

/**
 * La tinta que más contrasta sobre `fondo`. Empate a favor de la oscura: sobre
 * color saturado se lee mejor y evita el halo que produce el texto blanco.
 */
export function tintaSobre(fondo: string): string {
  return contraste(fondo, TINTA_OSCURA) >= contraste(fondo, TINTA_CLARA)
    ? TINTA_OSCURA
    : TINTA_CLARA;
}
