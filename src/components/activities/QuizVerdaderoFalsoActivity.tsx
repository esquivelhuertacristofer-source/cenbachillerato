'use client';

import { useState } from 'react';
import type { ActividadQuizVerdaderoFalso, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: '#A78BFA', rgba: '167,139,250', faIcon: 'fa-circle-dot', gradient: '' };
const FONT = 'var(--font-epilogue), sans-serif';

interface Props {
  actividad: ActividadQuizVerdaderoFalso;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
}

export function QuizVerdaderoFalsoActivity({ actividad, onProgreso, color = FALLBACK_COLOR }: Props) {
  const { contenido } = actividad;
  const [respuestas, setRespuestas] = useState<Record<number, boolean>>({});
  const [enviado, setEnviado] = useState(false);

  const total = contenido.preguntas.length;
  const respondidas = Object.keys(respuestas).length;

  function calcularPuntaje() {
    let correctas = 0;
    contenido.preguntas.forEach((p, i) => {
      if (respuestas[i] === p.respuesta) correctas++;
    });
    return Math.round((correctas / total) * 100);
  }

  function handleEnviar() {
    if (respondidas < total) return;
    const puntaje = calcularPuntaje();
    setEnviado(true);
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: puntaje >= (contenido.puntaje_minimo_aprobacion ?? 70),
      puntaje,
      respuestas,
    });
  }

  const puntaje = enviado ? calcularPuntaje() : null;
  const aprobado = puntaje !== null && puntaje >= (contenido.puntaje_minimo_aprobacion ?? 70);

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONT }}>
      {enviado && puntaje !== null && (
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${aprobado ? 'rgba(74,222,128,0.30)' : 'rgba(248,113,113,0.30)'}`,
            background: aprobado ? 'rgba(74,222,128,0.10)' : 'rgba(248,113,113,0.10)',
            padding: '20px 16px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 30, fontWeight: 800, margin: 0, color: aprobado ? '#4ADE80' : '#F87171' }}>{puntaje}%</p>
          <p style={{ fontSize: 14, margin: '4px 0 0', color: aprobado ? '#4ADE80' : '#F87171' }}>
            {aprobado ? 'Aprobado ✓' : 'Sigue intentando'}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {contenido.preguntas.map((pregunta, pi) => {
          const seleccionada = respuestas[pi];
          const esCorrecta = enviado && seleccionada === pregunta.respuesta;

          return (
            <div
              key={pi}
              style={{
                borderRadius: 16,
                border: `1px solid ${enviado ? (esCorrecta ? 'rgba(74,222,128,0.30)' : 'rgba(248,113,113,0.30)') : 'rgba(255,255,255,0.08)'}`,
                background: enviado ? (esCorrecta ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)') : 'rgba(255,255,255,0.04)',
                padding: 20,
              }}
            >
              <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#fff', fontSize: 15, lineHeight: 1.5 }}>
                {pi + 1}. {pregunta.enunciado}
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {([true, false] as const).map((valor) => {
                  const seleccionadaEsta = seleccionada === valor;
                  const correctaEsta = enviado && valor === pregunta.respuesta;
                  const errorEsta = enviado && seleccionadaEsta && valor !== pregunta.respuesta;

                  let bg = 'transparent';
                  let borderColor = 'rgba(255,255,255,0.12)';
                  let textColor = 'rgba(255,255,255,0.70)';
                  if (correctaEsta) {
                    bg = 'rgba(74,222,128,0.14)'; borderColor = 'rgba(74,222,128,0.55)'; textColor = '#4ADE80';
                  } else if (errorEsta) {
                    bg = 'rgba(248,113,113,0.14)'; borderColor = 'rgba(248,113,113,0.55)'; textColor = '#F87171';
                  } else if (seleccionadaEsta) {
                    bg = `rgba(${color.rgba},0.14)`; borderColor = color.hex; textColor = '#fff';
                  }

                  return (
                    <button
                      key={String(valor)}
                      disabled={enviado}
                      onClick={() => setRespuestas(r => ({ ...r, [pi]: valor }))}
                      style={{
                        flex: 1,
                        borderRadius: 12,
                        border: `1.5px solid ${borderColor}`,
                        background: bg,
                        color: textColor,
                        padding: '11px 0',
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: FONT,
                        cursor: enviado ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {valor ? 'Verdadero' : 'Falso'}
                    </button>
                  );
                })}
              </div>
              {enviado && pregunta.retroalimentacion && (
                <p style={{ margin: '10px 0 0', fontSize: 12.5, fontStyle: 'italic', color: 'rgba(255,255,255,0.55)' }}>
                  {pregunta.retroalimentacion}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!enviado && (
        <button
          onClick={handleEnviar}
          disabled={respondidas < total}
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
            cursor: respondidas < total ? 'not-allowed' : 'pointer',
            opacity: respondidas < total ? 0.4 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          Enviar respuestas ({respondidas}/{total})
        </button>
      )}
    </div>
  );
}
