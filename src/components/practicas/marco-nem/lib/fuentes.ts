// Tipografía de títulos de las aventuras. next/font la auto-aloja (no es CDN)
// y solo se descarga en las páginas que la usan.
import { Fraunces } from 'next/font/google'

export const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-aventura',
  display: 'swap',
  axes: ['SOFT', 'opsz'],
})
