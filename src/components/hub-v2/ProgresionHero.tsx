'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { ArrowLeft, Clock, Zap, BookMarked } from 'lucide-react'
import { springs, stagger as staggerTokens } from '@/lib/motion/tokens'
import { useReducedMotion } from '@/lib/motion/hooks'
import type { AreaColor } from '@/components/hub/hub-colors'
import type { ProgresionConEstado } from '@/lib/queries/hub'

interface Props {
  progresion: ProgresionConEstado
  color: AreaColor
  codigo: string
  uacNombre: string
  numParsed: number
  xpTotal: number
  chips: string[]
}

export function ProgresionHero({
  progresion, color, codigo, uacNombre, numParsed, xpTotal, chips,
}: Props) {
  const reducedMotion = useReducedMotion()

  const itemVariants = reducedMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { ...springs.gentle } },
      }

  const containerVariants = {
    hidden: { opacity: reducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: reducedMotion
        ? {}
        : { staggerChildren: staggerTokens.normal, delayChildren: 0.1 },
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        padding: 'clamp(32px, 5vw, 56px) clamp(20px, 5vw, 48px) clamp(36px, 5vw, 52px)',
        background: `linear-gradient(180deg, rgba(${color.rgba}, 0.10) 0%, rgba(${color.rgba}, 0.02) 100%), #011C40`,
        borderBottom: `1px solid rgba(${color.rgba}, 0.14)`,
        borderLeft: `6px solid ${color.hex}`,
        boxShadow: `inset 4px 0 60px rgba(${color.rgba}, 0.05)`,
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Back button */}
        <motion.div variants={itemVariants} style={{ marginBottom: 28 }}>
          <Link href={`/hub/uac/${codigo}`} style={{ textDecoration: 'none', display: 'inline-flex' }}>
            <motion.span
              whileHover={reducedMotion ? {} : { x: -4 }}
              transition={springs.snappy}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
              }}
            >
              <ArrowLeft size={13} />
              {uacNombre}
            </motion.span>
          </Link>
        </motion.div>

        {/* Breadcrumb */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'rgba(255,255,255,0.30)', marginBottom: 22,
          }}
        >
          <Link href="/hub" style={{ color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}>Hub</Link>
          <span>/</span>
          <Link href={`/hub/uac/${codigo}`} style={{ color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}>{codigo}</Link>
          <span>/</span>
          <span style={{ color: color.hex, fontWeight: 700 }}>Progresión {numParsed}</span>
        </motion.div>

        {/* Completion badge */}
        {progresion.estado === 'completada' && (
          <motion.div variants={itemVariants} style={{ marginBottom: 18 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em',
              color: '#4ADE80', padding: '5px 14px',
              background: 'rgba(74,222,128,0.10)',
              border: '1px solid rgba(74,222,128,0.22)',
              borderRadius: 999,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
              Completada
            </span>
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: '#fff',
            margin: '0 0 18px',
            maxWidth: 820,
          }}
        >
          {progresion.titulo}
        </motion.h1>

        {/* Description */}
        {progresion.descripcion && (
          <motion.p
            variants={itemVariants}
            style={{
              fontSize: 16, color: 'rgba(255,255,255,0.52)', lineHeight: 1.65,
              margin: '0 0 28px', maxWidth: 680,
            }}
          >
            {progresion.descripcion}
          </motion.p>
        )}

        {/* Metrics row */}
        <motion.div
          variants={itemVariants}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 28, alignItems: 'center' }}
        >
          {progresion.tiempo_estimado_horas != null && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.48)',
            }}>
              <Clock size={14} />
              {progresion.tiempo_estimado_horas}h estimadas
            </span>
          )}
          {xpTotal > 0 && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 700, color: '#FBBF24',
            }}>
              <Zap size={14} />
              +{xpTotal} XP disponibles
            </span>
          )}
          <span style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: 'rgba(255,255,255,0.38)',
          }}>
            <BookMarked size={14} />
            {progresion.actividadesCompletadas} / {progresion.totalActividades} actividades
          </span>

          {/* Progress bar */}
          {progresion.totalActividades > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 100, height: 5, borderRadius: 999,
                background: 'rgba(255,255,255,0.10)', overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.round((progresion.actividadesCompletadas / progresion.totalActividades) * 100)}%`,
                  }}
                  transition={{ duration: 0.8, ease: [0.0, 0.0, 0.2, 1], delay: 0.5 }}
                  style={{
                    height: '100%', borderRadius: 999,
                    background: progresion.estado === 'completada' ? '#4ADE80' : color.hex,
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Tags */}
        {chips.length > 0 && (
          <motion.div variants={itemVariants} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {chips.map((chip, i) => (
              <motion.span
                key={i}
                initial={reducedMotion ? {} : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={reducedMotion ? {} : { ...springs.gentle, delay: 0.35 + i * staggerTokens.normal }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.42)', padding: '5px 14px',
                  background: 'rgba(255,255,255,0.05)', borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: color.hex, boxShadow: `0 0 6px ${color.hex}`,
                  flexShrink: 0,
                }} />
                {chip}
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
