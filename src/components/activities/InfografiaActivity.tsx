'use client';

import { useMemo, useState } from 'react';
import type { ActividadInfografia, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';
import { LaminaInfografia } from '@/components/activities/LaminaInfografia';
import {
  useRegistrarNarracion,
  useRegistrarSegmentosVoz,
} from '@/components/activities/NarracionContext';
import { segmentosDeInfografia } from '@/lib/voz/segmentos';

const FALLBACK_COLOR: AreaColor = { hex: '#A78BFA', rgba: '167,139,250', faIcon: 'fa-circle-dot', gradient: '' };
const FONT = 'var(--font-epilogue), sans-serif';

interface Props {
  actividad: ActividadInfografia;
  onProgreso?: CallbackProgreso;
  /**
   * Código de la UAC. Ya no se usa para elegir imagen —la lámina se dibuja con
   * los datos de la propia infografía—, pero se conserva en la firma porque
   * `ActivityRunner` la pasa a todos los tipos por igual.
   */
  uacCodigo?: string;
  color?: AreaColor;
}

export function InfografiaActivity({ actividad, onProgreso, color = FALLBACK_COLOR }: Props) {
  const { contenido } = actividad;
  const [respuesta, setRespuesta] = useState('');
  const [completado, setCompletado] = useState(false);
  const [glosarioAbierto, setGlosarioAbierto] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Los SVG de placeholder ya no existen en disco; cualquier url que contenga
  // "placeholder" se trata como "sin lámina" para ir directo a la imagen temática
  // (evita una petición 404 y el ícono de imagen rota).
  const urlImagen = contenido.url_imagen ?? '';
  const tieneImagen = urlImagen.length > 0 && !/placeholder/i.test(urlImagen) && !imgError;

  /* LA INFOGRAFÍA TAMBIÉN SE ESCUCHA.
     42 de las 240 progresiones no tienen lectura: su pieza expositiva es una
     infografía o un video. Dejar la infografía sin narrar significaba que en esas
     progresiones el alumno que depende del audio se quedaba sin el contenido
     principal.
     Los trozos se calculan con `segmentosDeInfografia` —la MISMA función que usó
     el extractor— sobre el MISMO título y los MISMOS puntos clave, para que la
     clave que se pide aquí sea la del MP3 que se grabó allá. */
  const segmentosVoz = useMemo(
    () => segmentosDeInfografia(contenido.titulo, contenido.puntos_clave),
    [contenido.titulo, contenido.puntos_clave],
  );
  useRegistrarSegmentosVoz(segmentosVoz);
  /* Respaldo para el narrador del navegador (las actividades sin grabación, o
     un fallo de red al pedir el MP3): la misma prosa, en una sola cadena. */
  useRegistrarNarracion(
    useMemo(() => segmentosVoz.map((s) => s.texto).join('. '), [segmentosVoz]),
  );

  const tieneContexto = Boolean(contenido.contexto_mexicano?.trim());
  const tieneGlosario = Array.isArray(contenido.glosario) && contenido.glosario.length > 0;
  const tienePreguntas = Array.isArray(contenido.preguntas_reflexion) && contenido.preguntas_reflexion.length > 0;

  async function handleCompletar() {
    setCompletado(true);
    // Persiste la respuesta escrita del estudiante (antes se descartaba).
    const res = await onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: true,
      puntaje: 100,
      respuestas: { respuesta: respuesta.trim() },
    });
    // Si la escritura falló, revierte el estado para que pueda reintentar.
    if (res && !res.ok) setCompletado(false);
  }

  const card: React.CSSProperties = {
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    padding: 20,
  };

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONT }}>

      {/* Lámina: la propia de la actividad si existe; si no, se DIBUJA con sus datos.
          Una foto de stock encabezando una infografía de ciclos biogeoquímicos no
          informa nada; la rejilla de puntos clave sí, y además se lee con lector
          de pantalla y no puede dar 404. */}
      {tieneImagen ? (
        <div style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
          <img
            src={urlImagen}
            alt={contenido.descripcion_accesible ?? contenido.titulo}
            style={{ width: '100%', objectFit: 'contain', maxHeight: 500, display: 'block' }}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <LaminaInfografia
          titulo={contenido.titulo}
          puntosClave={contenido.puntos_clave ?? []}
          fuente={contenido.fuente}
          color={color}
        />
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
