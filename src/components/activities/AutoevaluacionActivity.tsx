'use client';

import { useState } from 'react';
import type { ActividadAutoevaluacion, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: '#A78BFA', rgba: '167,139,250', faIcon: 'fa-circle-dot', gradient: '' };
const FONT = 'var(--font-epilogue), sans-serif';

interface Props {
  actividad: ActividadAutoevaluacion;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
}

export function AutoevaluacionActivity({ actividad, onProgreso, color = FALLBACK_COLOR }: Props) {
  const { contenido } = actividad;
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [reflexion, setReflexion] = useState('');
  const [entregado, setEntregado] = useState(false);

  const totalCriterios = contenido.criterios.length;
  const respondidos = Object.keys(respuestas).length;
  const todosRespondidos = respondidos === totalCriterios;

  function handleSeleccion(criterioIdx: number, valor: number) {
    if (entregado) return;
    setRespuestas(prev => ({ ...prev, [criterioIdx]: valor }));
  }

  function handleEntregar() {
    setEntregado(true);
    const puntaje = totalCriterios > 0
      ? Math.round((Object.values(respuestas).reduce((a, b) => a + b, 0) / (totalCriterios * Math.max(...contenido.criterios.flatMap(c => c.escala.map(e => e.valor))))) * 100)
      : 100;
    onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje, respuestas: { criterios: respuestas, reflexion } });
  }

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONT }}>
      {contenido.instrucciones && (
        <div style={{ borderRadius: 14, border: `1px solid rgba(${color.rgba},0.25)`, background: `rgba(${color.rgba},0.08)`, padding: 16 }}>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.55 }}>{contenido.instrucciones}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {contenido.criterios.map((criterio, ci) => {
          const seleccionado = respuestas[ci];
          return (
            <div
              key={ci}
              style={{
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: '#fff', lineHeight: 1.5 }}>{criterio.descripcion}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {criterio.escala.map((nivel) => {
                  const activo = seleccionado === nivel.valor;
                  return (
                    <button
                      key={nivel.valor}
                      disabled={entregado}
                      onClick={() => handleSeleccion(ci, nivel.valor)}
                      title={nivel.descripcion}
                      style={{
                        borderRadius: 10,
                        border: `1.5px solid ${activo ? color.hex : 'rgba(255,255,255,0.12)'}`,
                        background: activo ? color.hex : 'transparent',
                        color: activo ? '#011126' : 'rgba(255,255,255,0.70)',
                        padding: '8px 12px',
                        fontSize: 12.5,
                        fontWeight: 600,
                        fontFamily: FONT,
                        cursor: entregado ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {nivel.etiqueta}
                    </button>
                  );
                })}
              </div>
              {seleccionado !== undefined && (
                <p style={{ margin: 0, fontSize: 12.5, fontStyle: 'italic', color: 'rgba(255,255,255,0.50)' }}>
                  {criterio.escala.find(e => e.valor === seleccionado)?.descripcion}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {contenido.reflexion_final_prompt && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.82)' }}>{contenido.reflexion_final_prompt}</label>
          <textarea
            value={reflexion}
            onChange={e => setReflexion(e.target.value)}
            disabled={entregado}
            rows={4}
            placeholder="Escribe tu reflexión..."
            style={{
              width: '100%',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              padding: '12px 16px',
              fontSize: 14,
              fontFamily: FONT,
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>
        <span>{respondidos} / {totalCriterios} criterios evaluados</span>
        {contenido.visible_para_docente && (
          <span style={{ borderRadius: 999, background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.30)', color: '#FBBF24', padding: '2px 10px' }}>
            Visible para docente
          </span>
        )}
      </div>

      {!entregado ? (
        <button
          onClick={handleEntregar}
          disabled={!todosRespondidos}
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
            cursor: todosRespondidos ? 'pointer' : 'not-allowed',
            opacity: todosRespondidos ? 1 : 0.4,
            transition: 'opacity 0.15s ease',
          }}
        >
          Entregar autoevaluación
        </button>
      ) : (
        <div style={{ borderRadius: 12, background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.30)', padding: 12, textAlign: 'center', fontSize: 14, color: '#4ADE80', fontWeight: 600 }}>
          Autoevaluación entregada ✓
        </div>
      )}
    </div>
  );
}
