'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { ArrowLeft, Clock, BookMarked } from 'lucide-react'
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
  chips: string[]
}

export function ProgresionHero({
  progresion, color, codigo, uacNombre, numParsed, chips,
}: Props) {
  const reducedMotion = useReducedMotion()

  // El título ES el propósito formativo (oración larga). Si la descripción
  // repite ese mismo texto, no la mostramos: sería un eco redundante.
  const norm = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase()
  const mostrarDesc =
    !!progresion.descripcion && norm(progresion.descripcion) !== norm(progresion.titulo)

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
        padding: 'clamp(32px, 5vw, 56px) 0 clamp(36px, 5vw, 52px)',
        background: `linear-gradient(180deg, rgba(${color.rgba}, 0.10) 0%, rgba(${color.rgba}, 0.02) 100%), #011C40`,
        borderBottom: `1px solid rgba(${color.rgba}, 0.14)`,
        borderLeft: `6px solid ${color.hex}`,
        boxShadow: `inset 4px 0 60px rgba(${color.rgba}, 0.05)`,
      }}
    >
      {/* mismo contenedor que la lista de actividades (maxWidth 1100 + padding
          clamp(20px,4vw,48px)) para que el borde izquierdo coincida exacto */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(20px, 4vw, 48px)' }}>

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
          <span style={{ color: color.hex, fontWeight: 700 }}>P-{numParsed}</span>
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

        {/* Eyebrow: encuadra la oración larga como lo que es */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
          }}
        >
          <span style={{
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em',
            color: color.hex,
          }}>
            Propósito formativo {numParsed}
          </span>
          <span aria-hidden style={{
            flex: 1, maxWidth: 120, height: 1,
            background: `linear-gradient(90deg, rgba(${color.rgba},0.35), transparent)`,
          }} />
        </motion.div>

        {/* Título = el propósito formativo (enunciado), tamaño legible,
            enmarcado por una barra de acento a la izquierda. */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex', gap: 'clamp(14px, 1.6vw, 22px)',
            maxWidth: 880, margin: '0 0 22px',
          }}
        >
          <span aria-hidden style={{
            width: 4, borderRadius: 4, flexShrink: 0,
            background: `linear-gradient(180deg, ${color.hex}, rgba(${color.rgba},0.18))`,
          }} />
          <h1 style={{
            fontSize: 'clamp(1.45rem, 2.8vw, 2.3rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            color: '#fff',
            margin: 0,
          }}>
            {progresion.titulo}
          </h1>
        </motion.div>

        {/* Descripción: solo si aporta algo distinto al título */}
        {mostrarDesc && (
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

        {/* Metrics row — stat-pills consistentes */}
        <motion.div
          variants={itemVariants}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28, alignItems: 'center' }}
        >
          {progresion.tiempo_estimado_horas != null && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)',
              padding: '8px 14px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <Clock size={14} style={{ opacity: 0.7 }} />
              {progresion.tiempo_estimado_horas}h estimadas
            </span>
          )}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)',
            padding: '8px 14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <BookMarked size={14} style={{ opacity: 0.7 }} />
            {progresion.actividadesCompletadas} / {progresion.totalActividades} actividades
          </span>

          {/* Progress pill (barra + %) */}
          {progresion.totalActividades > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '8px 14px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <span style={{
                width: 88, height: 5, borderRadius: 999,
                background: 'rgba(255,255,255,0.10)', overflow: 'hidden', display: 'block',
              }}>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.round((progresion.actividadesCompletadas / progresion.totalActividades) * 100)}%`,
                  }}
                  transition={{ duration: 0.8, ease: [0.0, 0.0, 0.2, 1], delay: 0.5 }}
                  style={{
                    height: '100%', borderRadius: 999, display: 'block',
                    background: progresion.estado === 'completada' ? '#4ADE80' : color.hex,
                  }}
                />
              </span>
              <span style={{
                fontSize: 12, fontWeight: 800,
                color: progresion.estado === 'completada' ? '#4ADE80' : color.hex,
              }}>
                {Math.round((progresion.actividadesCompletadas / progresion.totalActividades) * 100)}%
              </span>
            </span>
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
