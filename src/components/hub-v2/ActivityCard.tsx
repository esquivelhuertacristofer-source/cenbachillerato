'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import {
  BookOpen, ListChecks, PenLine, Calculator, TextCursor, MessagesSquare,
  ArrowRight, RotateCcw, Play, CheckCircle2, Star,
  type LucideIcon,
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

const TIPO_ICONS: Record<string, LucideIcon> = {
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
        @media (max-width: 560px) {
          .act-card-footer { flex-direction: column !important; align-items: stretch !important; }
          .act-card-footer .act-card-cta { justify-content: center !important; }
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
              borderRadius: 25,
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
            borderRadius: 22,
            border: `1.5px solid ${borderColor}`,
            overflow: 'hidden',
            opacity: isCompletada ? 0.9 : 1,
            background: `linear-gradient(180deg, rgba(${areaColor.rgba}, 0.05) 0%, #011C40 60%)`,
            padding: '20px 26px',
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
          {/* Estado badge (top-right) */}
          {(isEnProgreso || isActual) && (
            <div style={{ position: 'absolute', top: 18, right: 20 }}>
              <span className={isEnProgreso ? 'act-badge-pulse' : undefined} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em',
                color: areaColor.hex, padding: '4px 10px',
                background: `rgba(${areaColor.rgba}, ${isEnProgreso ? 0.12 : 0.08})`,
                border: `1px solid rgba(${areaColor.rgba}, ${isEnProgreso ? 0.28 : 0.20})`,
                borderRadius: 999,
              }}>
                {isEnProgreso && (
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: areaColor.hex }} />
                )}
                {isEnProgreso ? 'En curso' : 'Siguiente'}
              </span>
            </div>
          )}

          {/* Header: ícono + (eyebrow / título) */}
          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
            {/* Ícono */}
            <motion.div
              whileHover={reducedMotion ? {} : { scale: 1.06, rotate: isCompletada ? 0 : 4 }}
              transition={springs.smooth}
              style={{
                width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                background: iconBg,
                border: `2px solid ${iconBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 24px ${iconBg}`,
              }}
            >
              {isCompletada ? (
                <CheckCircle2 size={26} color="#4ADE80" />
              ) : (
                <Icon size={26} color={iconColor} />
              )}
            </motion.div>

            {/* Texto */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Eyebrow: A-N · fase formativa */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.18em', marginBottom: 8,
                color: isCompletada
                  ? '#4ADE80'
                  : isEnProgreso || isActual
                    ? areaColor.hex
                    : 'rgba(255,255,255,0.34)',
              }}>
                <span style={{
                  padding: '2px 7px', borderRadius: 6,
                  background: isCompletada ? 'rgba(74,222,128,0.12)' : `rgba(${areaColor.rgba}, 0.12)`,
                  letterSpacing: '0.10em',
                }}>
                  A-{actividad.orden}
                </span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', opacity: 0.6 }} />
                {phaseLabel}
              </div>

              {/* Título */}
              <h3 style={{
                fontSize: 'clamp(16px, 1.7vw, 20px)',
                fontWeight: 900, color: '#fff',
                margin: 0, lineHeight: 1.28,
                letterSpacing: '-0.02em',
                paddingRight: isEnProgreso || isActual ? 90 : 0,
              }}>
                {actividad.titulo}
              </h3>
            </div>
          </div>

          {/* Footer: badges (izq) + CTA (der) en una sola fila */}
          <div
            className="act-card-footer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 14, flexWrap: 'wrap',
              paddingTop: 16, marginTop: 16,
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
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

            {/* CTA */}
            <motion.div
              className="act-card-cta"
              whileHover={reducedMotion ? {} : { gap: 14 }}
              transition={springs.snappy}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                padding: '10px 20px', borderRadius: 999,
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
        </motion.div>
      </Link>
    </>
  )
}
