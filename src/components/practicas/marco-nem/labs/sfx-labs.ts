'use client'
// =============================================================================
// NEM Plataforma — El sonido de los laboratorios, en un solo sitio
// =============================================================================
// Los 59 laboratorios no sonaban. El repertorio existía (`LabSfx` en
// lab-audio.ts: fuego, burbujeo, vapor, goteo, vidrio…) y no lo usaba ninguno:
// se movían palancas, se soltaban objetos en el agua y se mezclaban reactivos
// en silencio. Es lo primero que reclamó el colegio.
//
// Montarlo lab por lab serían 59 refactores. En vez de eso el sonido se declara
// EN EL HTML que los labs ya pintan, y esta capa lo escucha:
//
//   · `data-sfx="gota"` en un botón    → al pulsarlo suena una gota.
//   · `data-sfx-loop="burbujas"` en un elemento presente solo mientras algo
//     hierve → el burbujeo empieza y acaba con él, sin tocar el estado del lab.
//
// Y si un control no declara nada, suena el toque neutro de interacción. Así
// los 59 tienen sonido con una sola pieza, y los que hablan de líquidos o de
// química declaran el suyo con un atributo por control.
//
// UN SOLO AudioContext para toda la aplicación (los navegadores limitan cuántos
// se pueden abrir) y UN SOLO interruptor: el mismo `nem:efectos-activos` que ya
// gobierna los efectos de las actividades. Si el alumno lo apaga, calla todo.
// =============================================================================

import { efectosActivos } from '../lib/efectos-sonoros'
import { LabSfx } from './lab-audio'

/* ── Los nombres que se pueden escribir en `data-sfx` ─────────────────────── */

/** One-shots: suenan una vez, al interactuar. */
export const UNA_VEZ = {
  clic: (s) => s.clic(),
  gota: (s) => s.gota(),
  verter: (s) => s.verter(),
  agitar: (s) => s.agitar(),
  medir: (s) => s.medir(),
  caer: (s) => s.caer(),
  chapoteo: (s) => s.chapoteo(),
  burbuja: (s) => s.blip(),
  chispa: (s) => s.chispa(),
  vidrio: (s) => s.romper(),
  bien: (s) => s.correcto(),
  mal: (s) => s.incorrecto(),
} satisfies Record<string, (s: LabSfx) => void>

/** Bucles: suenan mientras el elemento que los declara siga en la pantalla. */
export const BUCLES = {
  fuego: (s, on) => s.fuego(on),
  vapor: (s, on) => s.vapor(on),
  burbujas: (s, on) => s.burbujas(on),
  gotas: (s, on) => s.gotas(on),
  electrico: (s, on) => s.electrico(on),
} satisfies Record<string, (s: LabSfx, on: boolean) => void>

export type NombreUnaVez = keyof typeof UNA_VEZ
export type NombreBucle = keyof typeof BUCLES

export const esUnaVez = (n: string | null | undefined): n is NombreUnaVez =>
  !!n && Object.hasOwn(UNA_VEZ, n)
export const esBucle = (n: string | null | undefined): n is NombreBucle =>
  !!n && Object.hasOwn(BUCLES, n)

/* ── Qué suena al tocar un elemento ───────────────────────────────────────── */

/** Controles que son «algo que se usa» y por tanto suenan solos. */
const CONTROLES = 'button, [role="button"], a[href], input, select, textarea, label, summary, canvas, svg'

/**
 * El sonido que le toca a lo que el alumno acaba de tocar, o `null` si no es un control.
 *
 * Manda lo que declare el lab (`data-sfx`, heredado del ancestro más cercano, para poder
 * marcar una rejilla entera de una vez). Si no declara nada, los deslizadores tienen su
 * propia muesca y todo lo demás el toque neutro: el alumno recibe respuesta de que SÍ pulsó,
 * que es justo lo que faltaba.
 *
 * Función pura sobre el DOM: se puede probar con un documento de mentira.
 */
export function sonidoDeElemento(destino: Element | null): NombreUnaVez | 'deslizar' | 'onda' | null {
  if (!destino) return null
  const declarado = destino.closest<HTMLElement>('[data-sfx]')
  if (declarado) {
    const n = declarado.dataset.sfx
    if (n === 'ninguno') return null
    if (n === 'onda') return 'onda'
    if (esUnaVez(n)) return n
  }
  const control = destino.closest<HTMLElement>(CONTROLES)
  if (!control) return null
  if (control.closest('[data-sfx="ninguno"]')) return null
  const esRango = control instanceof HTMLInputElement && control.type === 'range'
  return esRango ? 'deslizar' : 'clic'
}

/** Posición de un deslizador de 0 a 1, para que el tono siga a la palanca. */
export function razonDeRango(el: Element | null): number {
  if (!(el instanceof HTMLInputElement) || el.type !== 'range') return 0.5
  const min = Number(el.min || 0)
  const max = Number(el.max || 100)
  const v = Number(el.value)
  if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) return 0.5
  return Math.min(1, Math.max(0, (v - min) / (max - min)))
}

/** Los bucles que están declarados ahora mismo dentro de un contenedor. */
export function buclesDeclarados(raiz: ParentNode | null): Set<NombreBucle> {
  const vivos = new Set<NombreBucle>()
  if (!raiz) return vivos
  for (const el of raiz.querySelectorAll('[data-sfx-loop]')) {
    const n = (el as HTMLElement).dataset.sfxLoop
    if (esBucle(n)) vivos.add(n)
  }
  return vivos
}

/* ── El reproductor ───────────────────────────────────────────────────────── */

let sfx: LabSfx | null = null
let encendido = false

/**
 * El reproductor compartido, o `null` si el alumno tiene los efectos apagados.
 *
 * `enable()` solo funciona dentro de un gesto del usuario (política de autoplay), y por eso
 * se llama aquí: a esto se entra desde un `pointerdown`, no desde un efecto de montaje.
 */
export function reproductor(): LabSfx | null {
  if (typeof window === 'undefined') return null
  if (!efectosActivos()) {
    if (sfx && encendido) { sfx.mute(); encendido = false }
    return null
  }
  if (!sfx) sfx = new LabSfx()
  if (!encendido) { void sfx.enable(); encendido = true }
  return sfx
}

/** Silencia sin destruir nada: lo llama el interruptor al apagarse. */
export function silenciar() {
  if (sfx) { sfx.mute(); encendido = false }
}

/** Dispara un one-shot por su nombre. `razon` solo lo usa el deslizador. */
export function sonar(nombre: NombreUnaVez | 'deslizar' | 'onda', razon = 0.5) {
  const s = reproductor()
  if (!s) return
  if (nombre === 'deslizar') { s.deslizar(razon); return }
  /*
   * `onda`: el tono de la propia onda que el alumno está dibujando. La palanca de frecuencia
   * del laboratorio de ondas va de 1 a 10 y la plataforma la presenta como 50-500 Hz
   * (`frecReal = frecuencia * 50`, LabOndas.tsx); 50 + razón × 450 da exactamente esa
   * frecuencia, así que lo que se oye es lo que dice la pantalla.
   */
  if (nombre === 'onda') { s.pitido(50 + razon * 450); return }
  UNA_VEZ[nombre](s)
}

/**
 * Pone en marcha los bucles que toquen y apaga los que ya no, comparando lo declarado en la
 * pantalla con lo que suena. Devuelve lo que quedó sonando, que es lo que hace comprobable
 * la reconciliación sin oír nada.
 */
export function ajustarBucles(declarados: Set<NombreBucle>, sonando: Set<NombreBucle>): Set<NombreBucle> {
  const s = reproductor()
  if (!s) {
    // Sin reproductor (efectos apagados): se apaga lo que hubiera y no se arranca nada.
    apagarBucles(sonando)
    return new Set()
  }
  for (const n of sonando) if (!declarados.has(n)) BUCLES[n](s, false)
  for (const n of declarados) if (!sonando.has(n)) BUCLES[n](s, true)
  return new Set(declarados)
}

/** Apaga todos los bucles: al desmontar el laboratorio. */
export function apagarBucles(sonando: Set<NombreBucle>) {
  if (!sfx) return
  for (const n of sonando) BUCLES[n](sfx, false)
}
