'use client'
// =============================================================================
// NEM Plataforma — La capa de sonido que envuelve a CUALQUIER laboratorio
// =============================================================================
// Se monta una vez en cada sitio donde se abre un lab (LabStandaloneShell y
// PracticaRunner) y cubre los 59 sin tocar ninguno:
//
//   · escucha los gestos que ocurren dentro y hace sonar lo que toque
//     (`sonidoDeElemento`: lo que declare el lab, o el toque neutro);
//   · vigila la pantalla y enciende o apaga los bucles que el lab declare con
//     `data-sfx-loop` (burbujeo, vapor, fuego, goteo, zumbido eléctrico);
//   · al salir del laboratorio lo calla todo, que si no el burbujeo se queda
//     sonando en la siguiente pantalla.
//
// Los oyentes van en fase de CAPTURA y son pasivos: no interfieren con los
// controles del lab —ni con el arrastre de los canvas de three.js—, solo se
// enteran. Si algo de esto fallara, el laboratorio sigue funcionando: todo va
// dentro de try/catch porque un fallo de audio no puede quitarle la clase a
// nadie.
// =============================================================================

import { useEffect, useRef } from 'react'
import {
  ajustarBucles,
  apagarBucles,
  buclesDeclarados,
  razonDeRango,
  sonar,
  sonidoDeElemento,
  type NombreBucle,
} from './sfx-labs'

export function SfxLaboratorio({ children }: { children: React.ReactNode }) {
  const caja = useRef<HTMLDivElement | null>(null)
  const sonando = useRef<Set<NombreBucle>>(new Set())

  useEffect(() => {
    const nodo = caja.current
    if (!nodo) return

    /* ── Los gestos ──────────────────────────────────────────────────────── */
    const alTocar = (e: Event) => {
      try {
        const nombre = sonidoDeElemento(e.target as Element | null)
        if (nombre) sonar(nombre, razonDeRango(e.target as Element | null))
      } catch {
        /* el audio nunca interrumpe el laboratorio */
      }
    }
    /* Arrastrar un deslizador emite `input` decenas de veces por segundo. Se deja pasar uno
       cada 60 ms: suficiente para que suene a muescas y no a zumbido. */
    let ultimo = 0
    const alMover = (e: Event) => {
      try {
        const el = e.target as Element | null
        if (!(el instanceof HTMLInputElement) || el.type !== 'range') return
        const ahora = Date.now()
        if (ahora - ultimo < 60) return
        ultimo = ahora
        /* Arrastrando solo manda `onda` —el tono de la onda que se está dibujando—; cualquier
           otro sonido declarado se queda para el toque inicial, que si no una gota por muesca
           son treinta gotas por segundo. */
        const declarado = el.closest<HTMLElement>('[data-sfx]')?.dataset.sfx
        sonar(declarado === 'onda' ? 'onda' : 'deslizar', razonDeRango(el))
      } catch {
        /* idem */
      }
    }

    nodo.addEventListener('pointerdown', alTocar, { capture: true, passive: true })
    nodo.addEventListener('input', alMover, { capture: true, passive: true })
    nodo.addEventListener('change', alTocar, { capture: true, passive: true })

    /* ── Los bucles ──────────────────────────────────────────────────────── */
    const revisar = () => {
      try {
        sonando.current = ajustarBucles(buclesDeclarados(nodo), sonando.current)
      } catch {
        /* idem */
      }
    }
    const observador = new MutationObserver(revisar)
    observador.observe(nodo, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-sfx-loop'] })
    revisar()

    return () => {
      nodo.removeEventListener('pointerdown', alTocar, { capture: true })
      nodo.removeEventListener('input', alMover, { capture: true })
      nodo.removeEventListener('change', alTocar, { capture: true })
      observador.disconnect()
      try {
        apagarBucles(sonando.current)
      } catch {
        /* idem */
      }
      sonando.current = new Set()
    }
  }, [])

  /*
   * `display: contents` a propósito: este div NO genera caja, así que se puede meter dentro de
   * cualquier maqueta sin mover un pixel. En el DOM sigue estando, que es lo único que necesita
   * —los gestos pasan por él y el observador lo vigila—.
   */
  return (
    <div ref={caja} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}
