'use client';

import { useState } from 'react';
import type { ActividadInfografia, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';
import { imagenDeLectura } from '@/lib/contenido/lectura-imagenes';

const FALLBACK_COLOR: AreaColor = { hex: '#A78BFA', rgba: '167,139,250', faIcon: 'fa-circle-dot', gradient: '' };
const FONT = 'var(--font-epilogue), sans-serif';

interface Props {
  actividad: ActividadInfografia;
  onProgreso?: CallbackProgreso;
  /** Código de la UAC, para elegir una imagen temática cuando no hay lámina propia. */
  uacCodigo?: string;
  color?: AreaColor;
}

export function InfografiaActivity({ actividad, onProgreso, uacCodigo, color = FALLBACK_COLOR }: Props) {
  const { contenido } = actividad;
  const [respuesta, setRespuesta] = useState('');
  const [completado, setCompletado] = useState(false);
  const [glosarioAbierto, setGlosarioAbierto] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgTematicaError, setImgTematicaError] = useState(false);

  // El placeholder genérico no existe en disco; evita el ícono de imagen rota.
  const urlImagen = contenido.url_imagen ?? '';
  const tieneImagen = urlImagen.length > 0 && !urlImagen.includes('/placeholder/') && !imgError;
  // Sin lámina propia → imagen temática con licencia libre acorde a la materia.
  const imagenTematica = imagenDeLectura(uacCodigo, contenido.titulo);

  const tieneContexto = Boolean(contenido.contexto_mexicano?.trim());
  const tieneGlosario = Array.isArray(contenido.glosario) && contenido.glosario.length > 0;
  const tienePreguntas = Array.isArray(contenido.preguntas_reflexion) && contenido.preguntas_reflexion.length > 0;

  function handleCompletar() {
    setCompletado(true);
    onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje: 100 });
  }

  const card: React.CSSProperties = {
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    padding: 20,
  };

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONT }}>

      {/* Imagen principal */}
      {tieneImagen ? (
        <div style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
          <img
            src={urlImagen}
            alt={contenido.descripcion_accesible ?? contenido.titulo}
            style={{ width: '100%', objectFit: 'contain', maxHeight: 500, display: 'block' }}
            onError={() => setImgError(true)}
          />
        </div>
      ) : !imgTematicaError ? (
        <div style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
          <img
            src={imagenTematica}
            alt={contenido.descripcion_accesible ?? contenido.titulo}
            style={{ width: '100%', objectFit: 'cover', height: 224, display: 'block' }}
            onError={() => setImgTematicaError(true)}
          />
          <div
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to top, rgba(1,17,38,0.55) 0%, rgba(1,17,38,0.10) 40%, transparent 70%)' }}
          />
          <p style={{ position: 'absolute', bottom: 12, left: 16, right: 16, margin: 0, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
            {contenido.titulo}
          </p>
        </div>
      ) : (
        // Fallback honesto si tampoco hay imagen temática en disco: bloque temático sin <img> roto.
        <div
          style={{
            borderRadius: 16,
            border: `1px solid rgba(${color.rgba},0.25)`,
            background: `linear-gradient(135deg, rgba(${color.rgba},0.14), rgba(${color.rgba},0.04))`,
            height: 180,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <i className="fa-solid fa-chart-pie" style={{ fontSize: 34, color: `rgba(${color.rgba},0.55)` }} />
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.70)', textAlign: 'center', maxWidth: 320 }}>
            {contenido.titulo}
          </p>
        </div>
      )}

      {tieneImagen && contenido.fuente && (
        <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>Fuente: {contenido.fuente}</p>
      )}

      {/* Puntos clave */}
      {contenido.puntos_clave && contenido.puntos_clave.length > 0 && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.82)' }}>Puntos clave</p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {contenido.puntos_clave.map((punto, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.55 }}>
                <span style={{ color: color.hex, marginTop: 1, flexShrink: 0 }}>›</span>
                {punto}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contexto mexicano */}
      {tieneContexto && (
        <div style={{ borderRadius: 16, border: '1px solid rgba(251,191,36,0.28)', background: 'rgba(251,191,36,0.08)', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }} aria-hidden="true">🇲🇽</span>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#FBBF24' }}>Contexto mexicano</p>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>
            {contenido.contexto_mexicano}
          </p>
        </div>
      )}

      {/* Glosario expandible */}
      {tieneGlosario && (
        <div style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => setGlosarioAbierto((prev) => !prev)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              textAlign: 'left',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: FONT,
            }}
            aria-expanded={glosarioAbierto}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }} aria-hidden="true">📖</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.82)' }}>
                Glosario ({contenido.glosario!.length} términos)
              </span>
            </div>
            <span
              style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, transition: 'transform 0.2s', transform: glosarioAbierto ? 'rotate(180deg)' : 'rotate(0deg)' }}
              aria-hidden="true"
            >
              ▼
            </span>
          </button>

          {glosarioAbierto && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {contenido.glosario!.map((item, i) => (
                <div key={i} style={{ padding: '12px 20px', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff' }}>{item.termino}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.60)' }}>{item.definicion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actividad posterior */}
      {contenido.actividad_post && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ borderRadius: 14, border: `1px solid rgba(${color.rgba},0.25)`, background: `rgba(${color.rgba},0.08)`, padding: 16 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{contenido.actividad_post}</p>
          </div>
          <textarea
            value={respuesta}
            onChange={e => setRespuesta(e.target.value)}
            disabled={completado}
            rows={4}
            placeholder="Escribe tu respuesta..."
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

      {/* Preguntas para reflexionar */}
      {tienePreguntas && (
        <div style={{ borderRadius: 16, border: '1px solid rgba(167,139,250,0.28)', background: 'rgba(167,139,250,0.08)', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }} aria-hidden="true">🔍</span>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#C4B5FD' }}>Preguntas para reflexionar</p>
          </div>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {contenido.preguntas_reflexion!.map((pregunta, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>
                <span style={{ fontWeight: 700, flexShrink: 0, color: '#A78BFA' }}>{i + 1}.</span>
                {pregunta}
              </li>
            ))}
          </ol>
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
          Marcar como revisado
        </button>
      )}
    </div>
  );
}
