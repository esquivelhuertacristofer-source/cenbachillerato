'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useReducedMotion as useMotionReducedMotion } from 'motion/react'

export function useReducedMotion(): boolean {
  return useMotionReducedMotion() ?? false
}

export function useMouseAura<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    const el = ref.current
    if (!el) return

    function handleMouseMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect()
      el!.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
      el!.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
    }

    el.addEventListener('mousemove', handleMouseMove)
    return () => el.removeEventListener('mousemove', handleMouseMove)
  }, [reducedMotion])

  return ref
}

export function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  const firedRef = useRef(false)

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true
          setInView(true)
          observer.disconnect()
        }
      }
    },
    []
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(handleIntersect, options)
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleIntersect, options])

  return [ref, inView]
}
