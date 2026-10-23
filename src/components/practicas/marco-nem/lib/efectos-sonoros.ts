'use client'
// =============================================================================
// NEM Plataforma — Efectos sonoros de actividades (Web Audio puro, Regla #6)
// =============================================================================
// Sin librerías: un único AudioContext compartido, creado perezosamente en el
// primer gesto del usuario (evita el bloqueo de autoplay). `fxPop`/`fxAcierto`/
// `fxError` son autónomos: cada uno consulta la preferencia del usuario antes
// de sonar, así que quien los llama nunca necesita chequear el mute.
// La preferencia (sonido + confeti, una sola bandera) se comparte entre
// componentes vía useSyncExternalStore, mismo patrón que Narrador.tsx usa
// para detectar soporte de TTS — pero aquí el valor es mutable en runtime.
// =============================================================================

import { useCallback, useSyncExternalStore } from 'react'

let audioCtx: AudioContext | null = null

function obtenerContexto(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

/** Oscilador de un solo tono con envolvente simple (ataque rápido, caída exponencial). */
function tono(ctx: AudioContext, freq: number, dur: number, tipo: OscillatorType = 'sine', vol = 0.2, retardo = 0) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = tipo
  osc.frequency.value = freq
  const inicio = ctx.currentTime + retardo
  gain.gain.setValueAtTime(0, inicio)
  gain.gain.linearRampToValueAtTime(vol, inicio + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, inicio + dur)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(inicio)
  osc.stop(inicio + dur + 0.02)
}

/** Tap neutro: no revela si la respuesta es correcta o incorrecta. */
export function fxPop() {
  if (!efectosActivos()) return
  const ctx = obtenerContexto()
  if (!ctx) return
  tono(ctx, 500, 0.08, 'sine', 0.12)
}

/** Acorde ascendente de 3 notas — acierto/completado. */
export function fxAcierto() {
  if (!efectosActivos()) return
  const ctx = obtenerContexto()
  if (!ctx) return
  tono(ctx, 523.25, 0.15, 'triangle', 0.2, 0)
  tono(ctx, 659.25, 0.15, 'triangle', 0.2, 0.09)
  tono(ctx, 783.99, 0.25, 'triangle', 0.22, 0.18)
}

/**
 * Ruido blanco reutilizable, para los sonidos que no son un tono: el papel de una hoja al
 * girar no tiene nota, es un roce. Se genera una vez y se reutiliza (dos segundos basta).
 */
let ruido: AudioBuffer | null = null
function bufferDeRuido(ctx: AudioContext): AudioBuffer {
  if (ruido && ruido.sampleRate === ctx.sampleRate) return ruido
  const largo = Math.floor(ctx.sampleRate * 2)
  const buf = ctx.createBuffer(1, largo, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < largo; i++) d[i] = Math.random() * 2 - 1
  ruido = buf
  return buf
}

/**
 * EL SONIDO DE PASAR LA HOJA, en los Libros de Texto Gratuitos.
 *
 * Lo pidió un colegio: el lector hojea con una animación de hoja que gira en 3D y lo hacía en
 * silencio. No es un archivo de audio —no hay ninguno en el proyecto y no hace falta—: es ruido
 * filtrado cuyo filtro sube y baja mientras la amplitud cae, que es lo que hace el roce del
 * papel, más un golpecito grave al final, que es la hoja al asentarse.
 *
 * Dura menos que el giro (620 ms en `LectorLibro`) a propósito: el sonido acompaña el gesto y
 * no se arrastra detrás de él.
 */
export function fxHoja() {
  if (!efectosActivos()) return
  const ctx = obtenerContexto()
  if (!ctx) return
  const t = ctx.currentTime

  const src = ctx.createBufferSource()
  src.buffer = bufferDeRuido(ctx)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 0.7
  bp.frequency.setValueAtTime(900, t)
  bp.frequency.linearRampToValueAtTime(3400, t + 0.12)
  bp.frequency.linearRampToValueAtTime(1100, t + 0.34)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.085, t + 0.03)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.36)
  src.connect(bp).connect(g).connect(ctx.destination)
  src.start(t)
  src.stop(t + 0.4)

  // La hoja que se asienta: un golpe sordo y corto.
  const o = ctx.createOscillator()
  o.type = 'sine'
  const og = ctx.createGain()
  const tt = t + 0.3
  o.frequency.setValueAtTime(150, tt)
  o.frequency.exponentialRampToValueAtTime(70, tt + 0.1)
  og.gain.setValueAtTime(0.0001, tt)
  og.gain.exponentialRampToValueAtTime(0.05, tt + 0.008)
  og.gain.exponentialRampToValueAtTime(0.0001, tt + 0.13)
  o.connect(og).connect(ctx.destination)
  o.start(tt)
  o.stop(tt + 0.15)
}

/** Tono grave — intento sin ningún acierto. */
export function fxError() {
  if (!efectosActivos()) return
  const ctx = obtenerContexto()
  if (!ctx) return
  tono(ctx, 196, 0.3, 'sawtooth', 0.15, 0)
}

// ── Preferencia de efectos (sonido + confeti), compartida y persistida ──────

const CLAVE_STORAGE = 'nem:efectos-activos'
type Escucha = () => void
const escuchas = new Set<Escucha>()

let cache = true
if (typeof window !== 'undefined') {
  const guardado = window.localStorage.getItem(CLAVE_STORAGE)
  cache = guardado === null ? true : guardado === '1'
}

function suscribirse(cb: Escucha) {
  escuchas.add(cb)
  return () => {
    escuchas.delete(cb)
  }
}

function obtenerSnapshotCliente() {
  return cache
}

function obtenerSnapshotServidor() {
  return true
}

/** Hook: [efectosActivos, alternar]. Sincronizado en vivo entre todos los componentes montados. */
export function usePreferenciaEfectos(): [boolean, () => void] {
  const activos = useSyncExternalStore(suscribirse, obtenerSnapshotCliente, obtenerSnapshotServidor)
  const alternar = useCallback(() => {
    cache = !cache
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CLAVE_STORAGE, cache ? '1' : '0')
    }
    escuchas.forEach((cb) => cb())
  }, [])
  return [activos, alternar]
}

/** Lectura síncrona de la preferencia — para código no-React (p. ej. Confeti.tsx). */
export function efectosActivos(): boolean {
  return cache
}
