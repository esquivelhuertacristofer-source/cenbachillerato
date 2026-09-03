'use client';

import { useState } from 'react';
import type { ActividadCasoDecision, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';
import { ImagenAmbientacion } from '@/components/activities/ImagenAmbientacion';

const FALLBACK_COLOR: AreaColor = { hex: '#F472B6', rgba: '244,114,182', faIcon: 'fa-route', gradient: '' };
const FONT = 'var(--font-epilogue), sans-serif';

interface Props {
  actividad: ActividadCasoDecision;
  onProgreso?: CallbackProgreso;
  uacCodigo?: string;
  color?: AreaColor;
}

/**
 * Un caso que avanza a golpe de decisiones y devuelve consecuencias.
 *
 * POR QUÉ NO HAY "RESPUESTA CORRECTA" EN PANTALLA. Los temas que traen aquí
 * —una deuda, una fuente dudosa, un dilema de bioética— no se resuelven
 * marcando la casilla buena: se resuelven entendiendo qué pasa después. Cada
 * opción devuelve su consecuencia, y ésa es la enseñanza. La `calidad` (0, 1, 2)
 * sí existe y sí puntúa, pero se dice al final, cuando ya se leyeron todas las
 * consecuencias, no como un "correcto/incorrecto" que corta la lectura.
 *
 * NO SE PUEDE DESHACER UNA DECISIÓN. Es deliberado: el caso enseña justamente
 * que las decisiones tienen consecuencias que uno se queda. Volver a empezar sí
 * se puede, y el botón lo dice con todas sus letras.
 */
export function CasoDecisionActivity({
  actividad, onProgreso, uacCodigo, color = FALLBACK_COLOR,
}: Props) {
  const { contenido } = actividad;
  const escenas = contenido.escenas;

  /** Índice de la opción elegida en cada escena ya resuelta. */
  const [elegidas, setElegidas] = useState<number[]>([]);
  const [reflexion, setReflexion] = useState('');
  const [entregado, setEntregado] = useState(false);

  const escenaActual = elegidas.length;
  const terminado = escenaActual >= escenas.length;

  const puntos = elegidas.reduce((n, opcion, i) => n + (escenas[i]!.opciones[opcion]?.calidad ?? 0), 0);
  const maximo = escenas.length * 2;
  const puntaje = maximo > 0 ? Math.round((puntos / maximo) * 100) : 100;
  const cierre = puntaje >= 80 ? contenido.cierre_bueno
    : puntaje >= 50 ? contenido.cierre_regular
    : contenido.cierre_malo;

  function decidir(i: number) {
    setElegidas((prev) => [...prev, i]);
  }

  async function entregar() {
    setEntregado(true);
    const res = await onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: true,
      puntaje,
      respuestas: {
        decisiones: elegidas.join(','),
        reflexion: reflexion.trim(),
      },
    });
    if (res && !res.ok) setEntregado(false);
  }

  const card: React.CSSProperties = {
    borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)', padding: 20,
  };

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: FONT }}>
      <ImagenAmbientacion
        urlImagen={contenido.url_imagen}
        titulo={actividad.titulo}
        uacCodigo={uacCodigo}
        accentHex={color.hex}
      />

      <div style={card}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: color.hex }}>
          El caso
        </p>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.86)' }}>
          {contenido.contexto}
        </p>
      </div>

      {/* ── Escenas ya decididas, con su consecuencia ── */}
      {elegidas.map((opcion, i) => {
        const escena = escenas[i]!;
        const elegida = escena.opciones[opcion]!;
        const tono = elegida.calidad === 2 ? '#34D399' : elegida.calidad === 1 ? '#FBBF24' : '#F87171';
        return (
          <div key={`escena-${i}`} style={{ ...card, borderColor: `${tono}44` }}>
            <p style={{ margin: '0 0 6px', fontSize: 10.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)' }}>
              Decisión {i + 1} de {escenas.length}
            </p>
            <p style={{ margin: '0 0 12px', fontSize: 13.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.70)' }}>
              {escena.situacion}
            </p>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 800, color: '#fff' }}>
              <i className="fa-solid fa-check" style={{ fontSize: 11, color: tono, marginRight: 8 }} />
              {elegida.texto}
            </p>
            <div
              style={{
                borderRadius: 12, borderLeft: `3px solid ${tono}`,
                background: 'rgba(255,255,255,0.04)', padding: '12px 14px',
              }}
            >
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.84)' }}>
                {elegida.consecuencia}
              </p>
            </div>
          </div>
        );
      })}

      {/* ── Escena en curso ── */}
      {!terminado && (
        <div style={{ ...card, borderColor: `${color.hex}55` }}>
          <p style={{ margin: '0 0 6px', fontSize: 10.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: color.hex }}>
            Decisión {escenaActual + 1} de {escenas.length}
          </p>
          <p style={{ margin: '0 0 14px', fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.86)' }}>
            {escenas[escenaActual]!.situacion}
          </p>
          <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800, color: '#fff' }}>
            {escenas[escenaActual]!.pregunta}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {escenas[escenaActual]!.opciones.map((op, i) => (
              <button
                key={op.texto}
                type="button"
                onClick={() => decidir(i)}
                style={{
                  width: '100%', textAlign: 'left',
                  borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)', padding: '13px 15px',
                  fontSize: 13.5, lineHeight: 1.55, fontWeight: 600, color: '#fff',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'border-color 0.15s ease, background 0.15s ease',
                }}
              >
                {op.texto}
              </button>
            ))}
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 11.5, color: 'rgba(255,255,255,0.40)' }}>
            Una vez que decidas no se puede deshacer, igual que fuera de la pantalla.
          </p>
        </div>
      )}

      {/* ── Desenlace ── */}
      {terminado && (
        <div
          style={{
            ...card,
            borderColor: puntaje >= 80 ? 'rgba(52,211,153,0.45)' : puntaje >= 50 ? 'rgba(251,191,36,0.45)' : 'rgba(248,113,113,0.45)',
            background: puntaje >= 80 ? 'rgba(52,211,153,0.08)' : puntaje >= 50 ? 'rgba(251,191,36,0.07)' : 'rgba(248,113,113,0.07)',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.50)' }}>
            Cómo terminó
          </p>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.88)' }}>
            {cierre}
          </p>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#fff' }}>
            {puntos} de {maximo} puntos de decisión — {puntaje} sobre 100
          </p>

          {contenido.pregunta_reflexion && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.80)' }}>
                {contenido.pregunta_reflexion}
              </span>
              <textarea
                value={reflexion}
                onChange={(e) => setReflexion(e.target.value)}
                disabled={entregado}
                rows={4}
                style={{
                  borderRadius: 12, border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.05)', padding: '11px 13px',
                  fontSize: 13.5, lineHeight: 1.6, color: '#fff',
                  fontFamily: 'inherit', resize: 'vertical',
                }}
              />
            </label>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={entregar}
              disabled={entregado}
              style={{
                padding: '12px 24px', borderRadius: 12,
                fontSize: 13, fontWeight: 800,
                cursor: entregado ? 'default' : 'pointer',
                color: entregado ? 'rgba(255,255,255,0.55)' : '#04121f',
                background: entregado ? 'rgba(255,255,255,0.08)' : color.hex,
                border: 'none',
              }}
            >
              {entregado ? 'Caso registrado' : 'Registrar mi caso'}
            </button>
            <button
              type="button"
              onClick={() => { setElegidas([]); setReflexion(''); setEntregado(false); }}
              style={{
                padding: '12px 20px', borderRadius: 12,
                fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                color: '#fff', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.16)',
              }}
            >
              Volver a empezar el caso
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
