'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import {
  BookOpen, ListChecks, PenLine, Calculator, TextCursor, MessagesSquare,
  ArrowRight, RotateCcw, Play, CheckCircle2, Star,
} from 'lucide-react'
import { springs } from '@/lib/motion/tokens'
import { useMouseAura, useReducedMotion } from '@/lib/motion/hooks'
import type { AreaColor } from '@/components/hub/hub-colors'
import type { ActividadConEstado } from '@/lib/queries/hub'

export type VisualState = 'disponible' | 'en_progreso' | 'completada' | 'actual'

interface Props {
  actividad: ActividadConEstado
  visualState: VisualState
  uacCodigo: string
  progresionNum: number
  areaColor: AreaColor
  phaseLabel: string
}

const TIPO_ICONS: Record<string, React.ElementType> = {
  lectura:              BookOpen,
  quiz_multiple_opcion: ListChecks,
  reflexion_escrita:    PenLine,
  ejercicio_matematico: Calculator,
  fill_blanks:          TextCursor,
  debate_estructurado:  MessagesSquare,
}

const TIPO_LABELS: Record<string, string> = {
  lectura:              'Lectura',
  quiz_multiple_opcion: 'Quiz',
  quiz_verdadero_falso: 'V o F',
  reflexion_escrita:    'Reflexión',
  ejercicio_matematico: 'Ejercicio',
  fill_blanks:          'Rellena huecos',
  debate_estructurado:  'Debate',
}

export function ActivityCard({ actividad, visualState, uacCodigo, progresionNum, areaColor, phaseLabel }: Props) {
  const reducedMotion = useReducedMotion()
  const auraRef = useMouseAura<HTMLDivElement>()

  const isCompletada = visualState === 'completada'
  const isEnProgreso = visualState === 'en_progreso'
  const isActual     = visualState === 'actual'

  const Icon = TIPO_ICONS[actividad.tipo] ?? Star
  const tipoLabel = TIPO_LABELS[actividad.tipo] ?? actividad.tipo

  const href = `/hub/uac/${uacCodigo}/progresion/${progresionNum}/actividad/${actividad.orden}`

  // CTA config per state
  const cta = isCompletada
    ? { text: 'Volver a hacer', Icon: RotateCcw }
    : isEnProgreso
      ? { text: 'Continuar', Icon: Play }
      : { text: 'Empezar', Icon: ArrowRight }

  // Border color per state
  const borderColor = isCompletada
    ? 'rgba(74,222,128,0.25)'
    : isEnProgreso
      ? `rgba(${areaColor.rgba}, 0.35)`
      : isActual
        ? `rgba(${areaColor.rgba}, 0.30)`
        : 'rgba(255,255,255,0.08)'

  // Icon colors
  const iconBg = isCompletada
    ? 'rgba(74,222,128,0.12)'
    : `rgba(${areaColor.rgba}, 0.12)`
  const iconBorder = isCompletada
    ? 'rgba(74,222,128,0.28)'
    : `rgba(${areaColor.rgba}, 0.25)`
  const iconColor = isCompletada ? '#4ADE80' : areaColor.hex

  return (
    <>
      <style>{`
        .act-card-link { outline: none; display: block; text-decoration: none; }
        .act-card-link:focus-visible .act-card-wrap {
          outline: 2px solid var(--ac-focus);
          outline-offset: 3px;
        }
        .act-badge-pulse {
          animation: acBadgePulse 2.2s ease-in-out infinite;
        }
        @keyframes acBadgePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        @media (max-width: 640px) {
          .act-card-layout { flex-direction: column !important; }
          .act-card-icon-panel { width: 100% !important; min-height: 140px !important; }
        }
      `}</style>

      <Link
        href={href}
        prefetch
        className="act-card-link"
        style={{ '--ac-focus': areaColor.hex } as React.CSSProperties}
      >
        {/* Outer ring for "actual" state */}
        {isActual && !reducedMotion && (
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: -3,
              borderRadius: 31,
              border: `2px solid rgba(${areaColor.rgba}, 0.50)`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        <motion.div
          ref={auraRef}
          className={`aura-card aura-accent act-card-wrap`}
          whileHover={reducedMotion ? {} : { y: -4, scale: 1.01 }}
          whileTap={reducedMotion ? {} : { scale: 0.99 }}
          transition={springs.snappy}
          style={{
            position: 'relative', zIndex: 1,
            borderRadius: 28,
            border: `1.5px solid ${borderColor}`,
            overflow: 'hidden',
            display: 'flex',
            opacity: isCompletada ? 0.88 : 1,
            boxShadow: isActual
              ? `0 0 40px rgba(${areaColor.rgba}, 0.10), 0 8px 32px rgba(0,0,0,0.20)`
              : isEnProgreso
                ? `0 8px 32px rgba(${areaColor.rgba}, 0.10), 0 4px 16px rgba(0,0,0,0.15)`
                : '0 4px 20px rgba(0,0,0,0.12)',
            cursor: 'pointer',
            // CSS var for aura-accent
            '--aura-color': areaColor.rgba,
          } as React.CSSProperties}
        >

          {/* Left icon panel */}
          <div
            className="act-card-icon-panel act-card-layout"
            style={{
              width: '38%', minWidth: 160, minHeight: 220, flexShrink: 0,
              background: `linear-gradient(145deg, #011C40 0%, rgba(${areaColor.rgba}, 0.12) 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Background glow blob */}
            <div style={{
              position: 'absolute',
              width: 130, height: 130, borderRadius: '50%',
              background: `rgba(${areaColor.rgba}, 0.07)`,
              filter: 'blur(50px)',
            }} />

            {/* Order badge */}
            <div style={{
              position: 'absolute', top: 16, left: 16,
              background: `rgba(${areaColor.rgba}, 0.12)`,
              border: `1px solid rgba(${areaColor.rgba}, 0.22)`,
              borderRadius: 8, padding: '4px 10px',
              fontSize: 10, fontWeight: 900, color: areaColor.hex,
              letterSpacing: '0.12em',
            }}>
              A-{actividad.orden}
            </div>

            {/* Main icon */}
            <motion.div
              whileHover={reducedMotion ? {} : { scale: 1.08, rotate: isCompletada ? 0 : 5 }}
              transition={springs.smooth}
              style={{
                width: 90, height: 90, borderRadius: '50%',
                background: iconBg,
                border: `2px solid ${iconBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                boxShadow: `0 0 32px ${iconBg}`,
              }}
            >
              {isCompletada ? (
                <CheckCircle2 size={38} color="#4ADE80" />
              ) : (
                <Icon size={38} color={iconColor} />
              )}
            </motion.div>
          </div>

          {/* Right content panel */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '28px 36px',
            background: '#011C40',
            minWidth: 0,
            position: 'relative',
          }}>
            <div>
              {/* En progreso badge (pulsing) */}
              {isEnProgreso && (
                <div style={{
                  position: 'absolute', top: 20, right: 20,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span className="act-badge-pulse" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em',
                    color: areaColor.hex, padding: '4px 10px',
                    background: `rgba(${areaColor.rgba}, 0.12)`,
                    border: `1px solid rgba(${areaColor.rgba}, 0.28)`,
                    borderRadius: 999,
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: areaColor.hex,
                    }} />
                    En curso
                  </span>
                </div>
              )}

              {/* Actual badge */}
              {isActual && (
                <div style={{ position: 'absolute', top: 20, right: 20 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em',
                    color: areaColor.hex, padding: '4px 10px',
                    background: `rgba(${areaColor.rgba}, 0.08)`,
                    border: `1px solid rgba(${areaColor.rgba}, 0.20)`,
                    borderRadius: 999,
                  }}>
                    Siguiente
                  </span>
                </div>
              )}

              {/* Eyebrow */}
              <div style={{
                fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.35em', marginBottom: 12,
                color: isCompletada
                  ? '#4ADE80'
                  : isEnProgreso || isActual
                    ? areaColor.hex
                    : 'rgba(255,255,255,0.28)',
              }}>
                A{actividad.orden} · {phaseLabel}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: 'clamp(16px, 2vw, 22px)',
                fontWeight: 900, color: '#fff',
                margin: '0 0 14px', lineHeight: 1.25,
                letterSpacing: '-0.02em',
              }}>
                {actividad.titulo}
              </h3>

              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 10, fontWeight: 700,
                  color: 'rgba(255,255,255,0.50)',
                  padding: '4px 10px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <Icon size={9} />
                  {tipoLabel}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#FBBF24',
                  padding: '4px 10px', borderRadius: 999,
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.16)',
                }}>
                  +{actividad.xp} XP
                </span>
                {isCompletada && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 10, fontWeight: 800, color: '#4ADE80',
                    padding: '4px 10px', borderRadius: 999,
                    background: 'rgba(74,222,128,0.10)',
                    border: '1px solid rgba(74,222,128,0.22)',
                  }}>
                    <CheckCircle2 size={9} />
                    Completada
                  </span>
                )}
              </div>
            </div>

            {/* CTA row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              paddingTop: 20,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              marginTop: 20,
            }}>
              <motion.div
                whileHover={reducedMotion ? {} : { gap: 14 }}
                transition={springs.snappy}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '12px 24px', borderRadius: 24,
                  background: isCompletada
                    ? 'rgba(74,222,128,0.10)'
                    : isEnProgreso
                      ? areaColor.hex
                      : `rgba(${areaColor.rgba}, 0.12)`,
                  border: isCompletada
                    ? '1px solid rgba(74,222,128,0.25)'
                    : isEnProgreso
                      ? 'none'
                      : `1px solid rgba(${areaColor.rgba}, 0.22)`,
                  fontSize: 11, fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  color: isEnProgreso
                    ? '#011126'
                    : isCompletada
                      ? '#4ADE80'
                      : areaColor.hex,
                  boxShadow: isEnProgreso
                    ? `0 8px 24px rgba(${areaColor.rgba}, 0.30)`
                    : 'none',
                }}
              >
                {cta.text}
                <cta.Icon size={11} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Link>
    </>
  )
}
