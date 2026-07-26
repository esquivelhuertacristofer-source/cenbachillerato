'use client';

import { useState } from 'react';
import type { ActividadVideoConPreguntas, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: '#A78BFA', rgba: '167,139,250', faIcon: 'fa-circle-dot', gradient: '' };
const FONT = 'var(--font-epilogue), sans-serif';

/** Video propio (archivo estático servido por la app) vs. embed externo (YouTube/Vimeo). */
const esVideoArchivo = (url: string) => url.startsWith('/videos/') || /\.mp4($|\?)/i.test(url);

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

  // Una pregunta es "calificable" si declara respuesta correcta y es de opción.
  const esCalificable = (p: typeof preguntas[number]) =>
    (p.tipo === 'opcion_multiple' || p.tipo === 'verdadero_falso') && p.respuesta_correcta != null;

  const totalPreguntas = preguntas.length;
  const respondidas = preguntas.filter((_, i) => (respuestas[i] ?? '').trim().length > 0).length;
  const todasRespondidas = respondidas === totalPreguntas;

  function calcularPuntaje() {
    const calificables = preguntas.filter(esCalificable);
    // Sin preguntas calificables → actividad de participación (100 al completarse).
    if (calificables.length === 0) return 100;
    let correctas = 0;
    preguntas.forEach((p, i) => {
      if (esCalificable(p) && respuestas[i] === String(p.respuesta_correcta)) correctas++;
    });
    return Math.round((correctas / calificables.length) * 100);
  }

  async function handleCompletar() {
    if (!todasRespondidas) return;
    setCompletado(true);
    const puntaje = calcularPuntaje();
    const res = await onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje, respuestas });
    if (res && !res.ok) setCompletado(false);
  }

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONT }}>
      <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#000', aspectRatio: '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {contenido.url_video && esVideoArchivo(contenido.url_video) ? (
          <video
            src={contenido.url_video}
            poster={contenido.url_miniatura}
            controls
            preload="metadata"
            style={{ width: '100%', height: '100%' }}
          />
        ) : contenido.url_video ? (
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
                      checked={respuestas[i] === String(oi)}
                      onChange={() => setRespuestas(r => ({ ...r, [i]: String(oi) }))}
                      style={{ accentColor: color.hex }}
                    />
                    {op}
                  </label>
                ))
              ) : p.tipo === 'verdadero_falso' ? (
                ([['true', 'Verdadero'], ['false', 'Falso']] as const).map(([valor, etiqueta]) => (
                  <label key={valor} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.78)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name={`vq-${i}`}
                      disabled={completado}
                      checked={respuestas[i] === valor}
                      onChange={() => setRespuestas(r => ({ ...r, [i]: valor }))}
                      style={{ accentColor: color.hex }}
                    />
                    {etiqueta}
                  </label>
                ))
              ) : (
                <textarea
                  disabled={completado}
                  rows={3}
                  placeholder="Tu respuesta..."
                  value={respuestas[i] ?? ''}
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
          disabled={!todasRespondidas}
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
            cursor: todasRespondidas ? 'pointer' : 'not-allowed',
            opacity: todasRespondidas ? 1 : 0.4,
            transition: 'opacity 0.15s ease',
          }}
        >
          {totalPreguntas > 0 ? `Completar actividad (${respondidas}/${totalPreguntas})` : 'Completar actividad'}
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
