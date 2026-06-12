'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Trophy } from 'lucide-react'
import { springs, stagger as staggerTokens } from '@/lib/motion/tokens'
import { useReducedMotion } from '@/lib/motion/hooks'
import { celebrate, fireworks } from '@/lib/motion/celebrate'
import { ProgresionHero } from './ProgresionHero'
import { ActivityCard } from './ActivityCard'
import { ActivityTimeline } from './ActivityTimeline'
import { HubBreadcrumb } from '@/components/hub/HubBreadcrumb'
import type { AreaColor } from '@/components/hub/hub-colors'
import type { ProgresionConEstado, ActividadConEstado } from '@/lib/queries/hub'
import type { VisualState } from './ActivityCard'

const PHASE_LABELS = ['Activación', 'Práctica', 'Aplicación']

interface Props {
  uacNombre: string
  uacCodigo: string
  progresion: ProgresionConEstado
  actividades: ActividadConEstado[]
  color: AreaColor
  numParsed: number
  /** Siguiente propósito formativo de la UAC (null si éste es el último). */
  siguiente: { numero: number; titulo: string } | null
}

function computeVisualState(
  act: ActividadConEstado,
  firstNonCompletedId: string | null,
): VisualState {
  if (act.estado === 'completada') return 'completada'
  if (act.estado === 'en_progreso') return 'en_progreso'
  if (act.id === firstNonCompletedId) return 'actual'
  return 'disponible'
}

export function ProgresionClient({
  uacNombre, uacCodigo, progresion, actividades, color, numParsed, siguiente,
}: Props) {
  const reducedMotion = useReducedMotion()
  const isCompleta = progresion.estado === 'completada'
  const xpTotal = actividades.reduce((sum, a) => sum + a.xp, 0)
  const chips = [
    ...(progresion.ejes_articuladores ?? []).slice(0, 2),
    ...(progresion.transversalidades ?? []).slice(0, 1),
  ]

  const firstNonCompleted = actividades.find(a => a.estado !== 'completada') ?? null

  // Celebration effects
  useEffect(() => {
    const key = `completadas:${progresion.id}`
    const celebratedKey = `celebrated:progresion:${progresion.id}`
    const completadasAhora = actividades.filter(a => a.estado === 'completada').length
    const prevNum = parseInt(sessionStorage.getItem(key) ?? '0', 10)

    if (completadasAhora > prevNum) {
      if (completadasAhora === actividades.length) {
        const alreadyCelebrated = sessionStorage.getItem(celebratedKey)
        if (!alreadyCelebrated) {
          sessionStorage.setItem(celebratedKey, '1')
          if (!reducedMotion) fireworks()
        }
      } else {
        if (!reducedMotion) celebrate('medium')
      }
    }

    sessionStorage.setItem(key, String(completadasAhora))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cardContainerVariants = {
    hidden: { opacity: reducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: reducedMotion
        ? {}
        : {
            staggerChildren: staggerTokens.normal,
            delayChildren: 0.4,
          },
    },
  }

  const cardItemVariants = {
    hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reducedMotion ? {} : { ...springs.gentle },
    },
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at 80% 0%, rgba(${color.rgba}, 0.07) 0%, transparent 45%), #011126`,
      fontFamily: "var(--font-epilogue), 'Plus Jakarta Sans', sans-serif",
      color: '#fff',
    }}>

      {/* Sticky nav */}
      <motion.nav
        initial={reducedMotion ? {} : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.0, 0.0, 0.2, 1] }}
        style={{
          padding: 'clamp(14px, 2vw, 18px) clamp(20px, 4vw, 48px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(1,17,38,0.92)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Link
          href={`/hub/uac/${uacCodigo}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.42)', textDecoration: 'none',
          }}
        >
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} />
          {uacNombre}
        </Link>
        <HubBreadcrumb
          accentHex={color.hex}
          items={[
            { label: 'Hub', href: '/hub' },
            { label: uacCodigo, href: `/hub/uac/${uacCodigo}` },
            { label: `P-${numParsed}` },
          ]}
        />
      </motion.nav>

      {/* Hero */}
      <ProgresionHero
        progresion={progresion}
        color={color}
        codigo={uacCodigo}
        uacNombre={uacNombre}
        numParsed={numParsed}
        xpTotal={xpTotal}
        chips={chips}
      />

      {/* Cards section */}
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: 'clamp(28px, 4vw, 48px) clamp(20px, 4vw, 48px) 80px',
      }}>

        {/* Section label */}
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32,
            fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.30em',
            color: 'rgba(255,255,255,0.28)',
          }}
        >
          <i className="fa-solid fa-route" style={{ fontSize: 12, color: color.hex }} />
          Tu ruta de aprendizaje
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </motion.div>

        {actividades.length === 0 ? (
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              borderRadius: 24,
              border: '1.5px dashed rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.03)',
              padding: '64px 32px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center', gap: 14,
            }}
          >
            <i className="fa-regular fa-clock" style={{ fontSize: 44, color: 'rgba(255,255,255,0.15)' }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.50)', margin: 0 }}>
              Las actividades estarán disponibles pronto
            </p>
            <Link href={`/hub/uac/${uacCodigo}`} style={{
              marginTop: 8, borderRadius: 999,
              background: color.hex, color: '#011126',
              padding: '12px 24px', fontSize: 13, fontWeight: 800, textDecoration: 'none',
              textTransform: 'uppercase', letterSpacing: '0.10em',
            }}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight: 8 }} />
              Volver a {uacNombre}
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardContainerVariants}
          >
            {actividades.map((act, i) => {
              const visualState = computeVisualState(act, firstNonCompleted?.id ?? null)
              const phaseLabel = PHASE_LABELS[i] ?? `Actividad ${act.orden}`
              return (
                <div key={act.id} style={{ position: 'relative' }}>
                  <motion.div variants={cardItemVariants}>
                    <ActivityCard
                      actividad={act}
                      visualState={visualState}
                      uacCodigo={uacCodigo}
                      progresionNum={numParsed}
                      areaColor={color}
                      phaseLabel={phaseLabel}
                    />
                  </motion.div>
                  {i < actividades.length - 1 && (
                    <ActivityTimeline color={color} delay={0.5 + i * 0.12} />
                  )}
                </div>
              )
            })}
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{
            marginTop: 48,
            display: 'flex', alignItems: 'flex-start',
            flexDirection: 'column', gap: 16,
          }}
        >
          {isCompleta && (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springs.bouncy}
              style={{
                width: '100%', padding: '28px 32px', borderRadius: 24,
                background: 'linear-gradient(135deg, rgba(74,222,128,0.10) 0%, rgba(74,222,128,0.05) 100%)',
                border: '1.5px solid rgba(74,222,128,0.25)',
                display: 'flex', alignItems: 'center', gap: 20,
                flexWrap: 'wrap',
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                background: 'rgba(74,222,128,0.12)',
                border: '1.5px solid rgba(74,222,128,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trophy size={26} color="#4ADE80" />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: 18, fontWeight: 900, color: '#4ADE80', margin: '0 0 4px' }}>
                  ¡Propósito formativo completado!
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', margin: 0 }}>
                  Ganaste <strong style={{ color: '#FBBF24' }}>+{xpTotal} XP</strong> en este propósito formativo.
                </p>
                {siguiente && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', margin: '8px 0 0', lineHeight: 1.4 }}>
                    Sigue · Propósito {siguiente.numero}:{' '}
                    <strong style={{ color: 'rgba(255,255,255,0.68)', fontWeight: 700 }}>{siguiente.titulo}</strong>
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
                {siguiente ? (
                  <>
                    <Link
                      href={`/hub/uac/${uacCodigo}/progresion/${siguiente.numero}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '12px 24px', borderRadius: 999,
                        background: '#4ADE80', color: '#011126',
                        fontSize: 12, fontWeight: 900, textDecoration: 'none',
                        textTransform: 'uppercase', letterSpacing: '0.12em',
                      }}
                    >
                      Siguiente propósito
                      <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
                    </Link>
                    <Link
                      href={`/hub/uac/${uacCodigo}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '12px 22px', borderRadius: 999,
                        background: 'rgba(74,222,128,0.10)', color: '#4ADE80',
                        border: '1px solid rgba(74,222,128,0.30)',
                        fontSize: 12, fontWeight: 800, textDecoration: 'none',
                        textTransform: 'uppercase', letterSpacing: '0.12em',
                      }}
                    >
                      Volver a la materia
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/hub/uac/${uacCodigo}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '12px 24px', borderRadius: 999,
                      background: '#4ADE80', color: '#011126',
                      fontSize: 12, fontWeight: 900, textDecoration: 'none',
                      textTransform: 'uppercase', letterSpacing: '0.12em',
                    }}
                  >
                    Volver a {uacNombre}
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          <Link
            href={`/hub/uac/${uacCodigo}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.38)', textDecoration: 'none',
              padding: '12px 20px', borderRadius: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} />
            Ver todas las progresiones
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
