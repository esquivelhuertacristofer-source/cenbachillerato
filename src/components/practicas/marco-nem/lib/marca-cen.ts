// =============================================================================
// NEM Plataforma — Marca CEN (Campaña Educativa Nacional)
// =============================================================================
// No hay manual de marca ni archivos del logo: los colores se midieron píxel a
// píxel en el cartel oficial del «Taller de robótica» (octubre 2026). La letra
// del cartel es una grotesca geométrica muy pesada sin nombre conocido;
// Montserrat (libre) es la más parecida y se auto-aloja con next/font.
// =============================================================================
import { Montserrat } from 'next/font/google'

export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-cen',
  display: 'swap',
})

export const CEN = {
  azul: '#004AC1',
  navy: '#00153B',
  lima: '#B8EB50',
  verdeLogo: '#93C400',
  celeste: '#D0E8F8',
  fuente: "var(--font-cen), 'Montserrat', system-ui, sans-serif",
} as const

/** Laboratorios que llevan la piel de marca CEN completa. */
export const LABS_MARCA_CEN = new Set(['atlas-cuerpo-humano-3d', 'sistema-solar-3d'])
