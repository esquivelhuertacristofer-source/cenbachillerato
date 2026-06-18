'use client';

import { useState } from 'react';
import type { ActividadVideoConPreguntas, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: '#A78BFA', rgba: '167,139,250', faIcon: 'fa-circle-dot', gradient: '' };
const FONT = 'var(--font-epilogue), sans-serif';

interface Props {
  actividad: ActividadVideoConPreguntas;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
}

export function VideoConPreguntasActivity({ actividad, onProgreso, color = FALLBACK_COLOR }: Props) {
  const { contenido } = actividad;
  const preguntas = contenido.preguntas ?? [];
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [completado, setCompletado] = useState(false);

  function handleCompletar() {
    setCompletado(true);
    onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje: 100, respuestas });
  }

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONT }}>
      <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#000', aspectRatio: '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {contenido.url_video ? (
          <iframe
            src={contenido.url_video}
            title={contenido.titulo_video}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Video no disponible</p>
        )}
      </div>

      {contenido.descripcion_video && (
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>{contenido.descripcion_video}</p>
      )}

      {preguntas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Preguntas de comprensión</h3>
          {preguntas.map((p, i) => (
            <div key={i} style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff', lineHeight: 1.5 }}>{i + 1}. {p.pregunta}</p>
              {p.tipo === 'opcion_multiple' && p.opciones ? (
                p.opciones.map((op, oi) => (
                  <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.78)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name={`vq-${i}`}
                      disabled={completado}
                      onChange={() => setRespuestas(r => ({ ...r, [i]: String(oi) }))}
                      style={{ accentColor: color.hex }}
                    />
                    {op}
                  </label>
                ))
              ) : (
                <textarea
                  disabled={completado}
                  rows={3}
                  placeholder="Tu respuesta..."
                  onChange={e => setRespuestas(r => ({ ...r, [i]: e.target.value }))}
                  style={{
                    width: '100%',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#fff',
                    padding: '8px 12px',
                    fontSize: 14,
                    fontFamily: FONT,
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {!completado && (
        <button
          onClick={handleCompletar}
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
            cursor: 'pointer',
          }}
        >
          Completar actividad
        </button>
      )}
      {completado && (
        <div style={{ borderRadius: 12, background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.30)', padding: 12, textAlign: 'center', fontSize: 14, color: '#4ADE80', fontWeight: 600 }}>
          Actividad completada ✓
        </div>
      )}
    </div>
  );
}
