'use client';

import { useState } from 'react';
import type { ActividadSimulacion, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: '#A78BFA', rgba: '167,139,250', faIcon: 'fa-circle-dot', gradient: '' };
const FONT = 'var(--font-epilogue), sans-serif';

interface Props {
  actividad: ActividadSimulacion;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
}

export function SimulacionActivity({ actividad, onProgreso, color = FALLBACK_COLOR }: Props) {
  const { contenido } = actividad;
  const [reporte, setReporte] = useState('');
  const [completado, setCompletado] = useState(false);

  function handleCompletar() {
    setCompletado(true);
    onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje: 100, respuestas: { reporte } });
  }

  const etiquetaTipo: Record<typeof contenido.tipo_simulacion, string> = {
    laboratorio: 'Laboratorio virtual',
    matematica:  'Simulación matemática',
    social:      'Simulación social',
    tecnologia:  'Simulación tecnológica',
    historica:   'Simulación histórica',
  };

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ borderRadius: 999, background: `rgba(${color.rgba},0.14)`, border: `1px solid rgba(${color.rgba},0.32)`, color: color.hex, padding: '3px 12px', fontSize: 12.5, fontWeight: 600 }}>
          {etiquetaTipo[contenido.tipo_simulacion]}
        </span>
      </div>

      <div style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', padding: 20 }}>
        <p style={{ margin: 0, fontSize: 14.5, color: 'rgba(255,255,255,0.80)', lineHeight: 1.6 }}>{contenido.descripcion}</p>
      </div>

      {contenido.instrucciones && contenido.instrucciones.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.82)' }}>Instrucciones</p>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {contenido.instrucciones.map((inst, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>
                <span style={{ display: 'flex', height: 20, width: 20, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 999, background: `rgba(${color.rgba},0.16)`, fontSize: 11, fontWeight: 800, color: color.hex }}>{i + 1}</span>
                {inst}
              </li>
            ))}
          </ol>
        </div>
      )}

      {contenido.url_simulacion && (
        <a
          href={contenido.url_simulacion}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            borderRadius: 12,
            border: `2px solid ${color.hex}`,
            color: color.hex,
            padding: '13px 0',
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'none',
            fontFamily: FONT,
          }}
        >
          Abrir simulación ↗
        </a>
      )}

      {contenido.variables_a_explorar && contenido.variables_a_explorar.length > 0 && (
        <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.025)', padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Variables a explorar</p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {contenido.variables_a_explorar.map((v, i) => (
              <li key={i} style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>• {v}</li>
            ))}
          </ul>
        </div>
      )}

      {contenido.preguntas_reflexion && contenido.preguntas_reflexion.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.82)' }}>Preguntas de reflexión</p>
          {contenido.preguntas_reflexion.map((q, i) => (
            <p key={i} style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.72)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', padding: 12 }}>{i + 1}. {q}</p>
          ))}
        </div>
      )}

      {contenido.reporte_esperado && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.82)' }}>Reporte a entregar</p>
          <p style={{ margin: 0, fontSize: 12.5, fontStyle: 'italic', color: 'rgba(255,255,255,0.50)' }}>{contenido.reporte_esperado}</p>
          <textarea
            value={reporte}
            onChange={e => setReporte(e.target.value)}
            disabled={completado}
            rows={6}
            placeholder="Escribe tu reporte aquí..."
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
          Completar simulación
        </button>
      )}
    </div>
  );
}
