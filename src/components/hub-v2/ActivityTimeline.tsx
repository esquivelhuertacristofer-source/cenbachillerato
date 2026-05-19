'use client'

import { motion } from 'motion/react'
import { useReducedMotion } from '@/lib/motion/hooks'
import type { AreaColor } from '@/components/hub/hub-colors'

interface Props {
  color: AreaColor
  delay?: number
}

export function ActivityTimeline({ color, delay = 0.4 }: Props) {
  const reducedMotion = useReducedMotion()

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      paddingLeft: 52,
      height: 48,
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <motion.div
          initial={reducedMotion ? {} : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={reducedMotion ? {} : { duration: 0.7, ease: [0.0, 0.0, 0.2, 1], delay }}
          style={{
            width: 2,
            height: 36,
            background: `linear-gradient(to bottom, rgba(${color.rgba}, 0.50), rgba(${color.rgba}, 0.12))`,
            borderRadius: 999,
            transformOrigin: 'top',
          }}
        />
        <motion.div
          initial={reducedMotion ? {} : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={reducedMotion ? {} : { duration: 0.3, delay: delay + 0.5 }}
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: `rgba(${color.rgba}, 0.40)`,
            boxShadow: `0 0 8px rgba(${color.rgba}, 0.30)`,
          }}
        />
      </div>
    </div>
  )
}
