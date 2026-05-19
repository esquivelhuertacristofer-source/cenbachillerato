import type confettiModule from 'canvas-confetti'

type ConfettiVariant = 'small' | 'medium' | 'large'

async function getConfetti(): Promise<typeof confettiModule> {
  const mod = await import('canvas-confetti')
  return mod.default
}

export async function celebrate(variant: ConfettiVariant = 'medium'): Promise<void> {
  const confetti = await getConfetti()

  const configs: Record<ConfettiVariant, confettiModule.Options> = {
    small: {
      particleCount: 30,
      spread: 55,
      origin: { y: 0.7 },
      disableForReducedMotion: true,
    },
    medium: {
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      disableForReducedMotion: true,
    },
    large: {
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      disableForReducedMotion: true,
    },
  }

  confetti(configs[variant])
}

export async function fireworks(): Promise<void> {
  const confetti = await getConfetti()
  const end = Date.now() + 3000

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      disableForReducedMotion: true,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}
