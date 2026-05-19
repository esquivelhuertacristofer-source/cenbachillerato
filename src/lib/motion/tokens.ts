import type { Transition } from 'motion/react'

export const springs = {
  snappy: { type: 'spring', stiffness: 400, damping: 30 } as const,
  smooth: { type: 'spring', stiffness: 260, damping: 28 } as const,
  gentle: { type: 'spring', stiffness: 180, damping: 22 } as const,
  bouncy: { type: 'spring', stiffness: 300, damping: 15 } as const,
} as const

export const easings = {
  standard: [0.4, 0.0, 0.2, 1] as const,
  decelerate: [0.0, 0.0, 0.2, 1] as const,
  accelerate: [0.4, 0.0, 1, 1] as const,
  emphasized: [0.2, 0.0, 0, 1] as const,
} as const

export const durations = {
  instant: 0.1, fast: 0.2, normal: 0.3, slow: 0.5, cinematic: 0.8,
} as const

export const transitions = {
  cardHover: { ...springs.snappy } satisfies Transition,
  pageEnter: { duration: durations.slow, ease: easings.decelerate } satisfies Transition,
  layout: { ...springs.smooth } satisfies Transition,
  celebrate: { ...springs.bouncy } satisfies Transition,
  fade: { duration: durations.normal, ease: easings.standard } satisfies Transition,
} as const

export const stagger = {
  fast: 0.04, normal: 0.08, slow: 0.12,
} as const
