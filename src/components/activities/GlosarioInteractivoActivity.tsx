'use client';

import { useState } from 'react';
import type { ActividadGlosarioInteractivo, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: '#A78BFA', rgba: '167,139,250', faIcon: 'fa-circle-dot', gradient: '' };
const FONT = 'var(--font-epilogue), sans-serif';

interface Props {
  actividad: ActividadGlosarioInteractivo;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
}

export function GlosarioInteractivoActivity({ actividad, onProgreso, color = FALLBACK_COLOR }: Props) {
  const { contenido } = actividad;
  const [dominados, setDominados] = useState<Set<number>>(new Set());
  const [modoFlashcard, setModoFlashcard] = useState(false);
  const [flashIdx, setFlashIdx] = useState(0);
  const [mostrandoDefinicion, setMostrandoDefinicion] = useState(false);
  const [completado, setCompletado] = useState(false);

  function toggleDominado(i: number) {
    setDominados(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleCompletar() {
    setCompletado(true);
    onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje: Math.round((dominados.size / contenido.terminos.length) * 100) });
  }

  const navBtn = (disabled: boolean): React.CSSProperties => ({
    flex: 1,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.78)',
    padding: '10px 0',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: FONT,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
  });

  if (modoFlashcard) {
    const termino = contenido.terminos[flashIdx] ?? contenido.terminos[0];
    if (!termino) return null;
    return (
      <div style={{ maxWidth: 448, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16, fontFamily: FONT }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => setModoFlashcard(false)}
            style={{ background: 'none', border: 'none', fontSize: 14, color: color.hex, cursor: 'pointer', fontFamily: FONT }}
          >
            ← Volver a lista
          </button>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>{flashIdx + 1} / {contenido.terminos.length}</span>
        </div>
        <div
          style={{
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.04)',
            padding: 32,
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            gap: 16,
          }}
          onClick={() => setMostrandoDefinicion(v => !v)}
        >
          {!mostrandoDefinicion ? (
            <>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff', textAlign: 'center' }}>{termino.termino}</p>
              <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>Toca para ver la definición</p>
            </>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.82)', textAlign: 'center', lineHeight: 1.6 }}>{termino.definicion}</p>
              {termino.ejemplo && <p style={{ margin: 0, fontSize: 12.5, fontStyle: 'italic', color: 'rgba(255,255,255,0.50)', textAlign: 'center' }}>Ej: {termino.ejemplo}</p>}
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => { setFlashIdx(i => Math.max(0, i - 1)); setMostrandoDefinicion(false); }}
            disabled={flashIdx === 0}
            style={navBtn(flashIdx === 0)}
          >
            ← Anterior
          </button>
          <button
            onClick={() => { setFlashIdx(i => Math.min(contenido.terminos.length - 1, i + 1)); setMostrandoDefinicion(false); }}
            disabled={flashIdx === contenido.terminos.length - 1}
            style={navBtn(flashIdx === contenido.terminos.length - 1)}
          >
            Siguiente →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{dominados.size} / {contenido.terminos.length} términos dominados</p>
        <button
          onClick={() => setModoFlashcard(true)}
          style={{
            borderRadius: 10,
            border: `1px solid rgba(${color.rgba},0.35)`,
            background: `rgba(${color.rgba},0.12)`,
            color: color.hex,
            padding: '7px 12px',
            fontSize: 12.5,
            fontWeight: 700,
            fontFamily: FONT,
            cursor: 'pointer',
          }}
        >
          Modo flashcard
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {contenido.terminos.map((termino, i) => {
          const dominado = dominados.has(i);
          return (
            <div
              key={i}
              style={{
                borderRadius: 16,
                border: `1px solid ${dominado ? 'rgba(74,222,128,0.30)' : 'rgba(255,255,255,0.08)'}`,
                background: dominado ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.04)',
                padding: 16,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: 15 }}>{termino.termino}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.55 }}>{termino.definicion}</p>
                  {termino.ejemplo && (
                    <p style={{ margin: '4px 0 0', fontSize: 12.5, fontStyle: 'italic', color: 'rgba(255,255,255,0.45)' }}>Ej: {termino.ejemplo}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleDominado(i)}
                  disabled={completado}
                  style={{
                    flexShrink: 0,
                    borderRadius: 999,
                    width: 28,
                    height: 28,
                    fontSize: 12,
                    fontWeight: 800,
                    border: dominado ? 'none' : '1px solid rgba(255,255,255,0.25)',
                    background: dominado ? '#4ADE80' : 'transparent',
                    color: dominado ? '#011126' : 'rgba(255,255,255,0.45)',
                    cursor: completado ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {dominado ? '✓' : ''}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!completado && (
        <button
          onClick={handleCompletar}
          disabled={dominados.size === 0}
          style={{
            width: '100%',
            borderRadius: 12,
            border: 'none',
            background: color.hex,
            color: '#011126',
            padding: '14px 0',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: FONT,
            cursor: dominados.size === 0 ? 'not-allowed' : 'pointer',
            opacity: dominados.size === 0 ? 0.4 : 1,
          }}
        >
          Completar glosario
        </button>
      )}
    </div>
  );
}
