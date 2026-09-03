'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActividadRetoCronometrado, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';
import { ImagenAmbientacion } from '@/components/activities/ImagenAmbientacion';

const FALLBACK_COLOR: AreaColor = { hex: '#FBBF24', rgba: '251,191,36', faIcon: 'fa-stopwatch', gradient: '' };
const FONT = 'var(--font-epilogue), sans-serif';

interface Props {
  actividad: ActividadRetoCronometrado;
  onProgreso?: CallbackProgreso;
  uacCodigo?: string;
  color?: AreaColor;
}

type Fase = 'antes' | 'jugando' | 'final';

/**
 * Ronda rápida contra el reloj, con racha.
 *
 * PARA QUÉ SIRVE Y PARA QUÉ NO. Esto no evalúa comprensión —para eso están el
 * quiz y el ejercicio—: entrena RECUPERACIÓN, que es lo que separa a quien
 * "reconoce" una fórmula de quien la tiene disponible. Por eso el tiempo es
 * corto y no hay vuelta atrás: se responde con lo que ya está aprendido o no se
 * responde.
 *
 * EL RELOJ NO CASTIGA DOS VECES. Si se acaba el tiempo, la pregunta se cuenta
 * como fallada y se sigue: no se descuenta de las demás ni se corta el reto. Un
 * alumno que se traba en la tres tiene que poder llegar a la diez.
 *
 * LA RACHA ES LO QUE ENGANCHA, y por eso se rompe visiblemente. Se muestra
 * mientras crece y se apaga al fallar, que es la señal que hace que el alumno
 * quiera repetir el reto.
 */
export function RetoCronometradoActivity({
  actividad, onProgreso, uacCodigo, color = FALLBACK_COLOR,
}: Props) {
  const { contenido } = actividad;
  const preguntas = contenido.preguntas;
  const segundos = contenido.segundos_por_pregunta ?? 20;
  const minimo = contenido.puntaje_minimo_aprobacion ?? 60;

  const [fase, setFase] = useState<Fase>('antes');
  const [indice, setIndice] = useState(0);
  const [restante, setRestante] = useState(segundos);
  const [aciertos, setAciertos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  /** Índice elegido en la pregunta actual, o -1 si se acabó el tiempo. */
  const [ultima, setUltima] = useState<number | null>(null);
  const [respuestas, setRespuestas] = useState<number[]>([]);

  const preguntaActual = preguntas[indice];

  const siguiente = useCallback((elegida: number) => {
    setUltima(elegida);
    setRespuestas((prev) => [...prev, elegida]);
    const bien = elegida === preguntas[indice]?.respuesta_correcta;
    if (bien) {
      setAciertos((n) => n + 1);
      setRacha((r) => {
        const nueva = r + 1;
        setMejorRacha((m) => Math.max(m, nueva));
        return nueva;
      });
    } else {
      setRacha(0);
    }
    // Medio segundo para ver el color de la respuesta antes de pasar. Sin esa
    // pausa el reto se siente como si las preguntas se saltaran solas.
    window.setTimeout(() => {
      setUltima(null);
      if (indice + 1 >= preguntas.length) setFase('final');
      else { setIndice((i) => i + 1); setRestante(segundos); }
    }, 550);
  }, [indice, preguntas, segundos]);

  const siguienteRef = useRef(siguiente);
  useEffect(() => { siguienteRef.current = siguiente; }, [siguiente]);

  /* El reloj. Un solo intervalo por pregunta; al llegar a cero responde -1
     (ninguna opción), que cuenta como fallo y avanza igual. */
  useEffect(() => {
    if (fase !== 'jugando' || ultima !== null) return;
    const id = window.setInterval(() => {
      setRestante((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          siguienteRef.current(-1);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [fase, indice, ultima]);

  const puntaje = preguntas.length > 0 ? Math.round((aciertos / preguntas.length) * 100) : 100;
  const aprobado = puntaje >= minimo;

  const entregadoRef = useRef(false);
  useEffect(() => {
    if (fase !== 'final' || entregadoRef.current) return;
    entregadoRef.current = true;
    void onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: aprobado,
      puntaje,
      respuestas: {
        elegidas: respuestas.join(','),
        mejor_racha: String(mejorRacha),
      },
    });
  }, [fase, onProgreso, actividad.id, aprobado, puntaje, respuestas, mejorRacha]);

  function empezar() {
    entregadoRef.current = false;
    setFase('jugando');
    setIndice(0); setRestante(segundos);
    setAciertos(0); setRacha(0); setMejorRacha(0);
    setUltima(null); setRespuestas([]);
  }

  const card: React.CSSProperties = {
    borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)', padding: 20,
  };

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: FONT }}>
      {fase === 'antes' && (
        <ImagenAmbientacion
          urlImagen={contenido.url_imagen}
          titulo={actividad.titulo}
          uacCodigo={uacCodigo}
          accentHex={color.hex}
        />
      )}

      {fase === 'antes' && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.80)' }}>
            {contenido.instrucciones
              ?? 'Responde de memoria y a buen ritmo. No es para pensarlo mucho: es para comprobar qué tienes ya a la mano.'}
          </p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Dato etiqueta="Preguntas" valor={String(preguntas.length)} accent={color.hex} />
            <Dato etiqueta="Por pregunta" valor={`${segundos} s`} accent={color.hex} />
            <Dato etiqueta="Para aprobar" valor={`${minimo} pts`} accent={color.hex} />
          </div>
          <button
            type="button"
            onClick={empezar}
            style={{
              alignSelf: 'flex-start', padding: '13px 28px', borderRadius: 12,
              fontSize: 13.5, fontWeight: 800, cursor: 'pointer',
              color: '#04121f', background: color.hex, border: 'none',
            }}
          >
            Empezar el reto
          </button>
        </div>
      )}

      {fase === 'jugando' && preguntaActual && (
        <>
          {/* Barra de tiempo y marcador */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.50)' }}>
                {indice + 1} / {preguntas.length}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {racha >= 2 && (
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#FB923C' }}>
                    <i className="fa-solid fa-fire" style={{ marginRight: 5 }} />
                    racha {racha}
                  </span>
                )}
                <span
                  aria-live="off"
                  style={{
                    fontSize: 15, fontWeight: 900, fontVariantNumeric: 'tabular-nums',
                    color: restante <= 5 ? '#F87171' : '#fff',
                  }}
                >
                  {restante}s
                </span>
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', width: `${(restante / segundos) * 100}%`,
                  background: restante <= 5 ? '#F87171' : color.hex,
                  transition: 'width 1s linear, background 0.3s ease',
                }}
              />
            </div>
          </div>

          <div style={card}>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, fontWeight: 700, color: '#fff' }}>
              {preguntaActual.enunciado}
            </p>
            {preguntaActual.pista && restante <= Math.floor(segundos / 3) && (
              <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'rgba(255,255,255,0.50)' }}>
                <i className="fa-solid fa-lightbulb" style={{ marginRight: 6, color: '#FBBF24' }} />
                {preguntaActual.pista}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {preguntaActual.opciones.map((op, i) => {
              const revelando = ultima !== null;
              const esCorrecta = i === preguntaActual.respuesta_correcta;
              const esElegida = ultima === i;
              const borde = revelando
                ? esCorrecta ? 'rgba(52,211,153,0.65)' : esElegida ? 'rgba(248,113,113,0.65)' : 'rgba(255,255,255,0.10)'
                : 'rgba(255,255,255,0.12)';
              const fondo = revelando
                ? esCorrecta ? 'rgba(52,211,153,0.14)' : esElegida ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.04)'
                : 'rgba(255,255,255,0.05)';
              return (
                <button
                  key={op}
                  type="button"
                  onClick={() => { if (ultima === null) siguiente(i); }}
                  disabled={revelando}
                  style={{
                    width: '100%', textAlign: 'left',
                    borderRadius: 12, border: `1px solid ${borde}`, background: fondo,
                    padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#fff',
                    cursor: revelando ? 'default' : 'pointer', fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease, background 0.15s ease',
                  }}
                >
                  {op}
                </button>
              );
            })}
          </div>
          {ultima === -1 && (
            <p role="status" style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#F87171' }}>
              Se acabó el tiempo en ésta. Sigue con la siguiente.
            </p>
          )}
        </>
      )}

      {fase === 'final' && (
        <div
          role="status"
          style={{
            ...card,
            borderColor: aprobado ? 'rgba(52,211,153,0.45)' : 'rgba(251,191,36,0.45)',
            background: aprobado ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.07)',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}
        >
          <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#fff' }}>
            {aciertos} de {preguntas.length} — {puntaje} puntos
          </p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Dato etiqueta="Mejor racha" valor={String(mejorRacha)} accent="#FB923C" />
            <Dato etiqueta="Resultado" valor={aprobado ? 'Aprobado' : 'A repasar'} accent={aprobado ? '#34D399' : '#FBBF24'} />
          </div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.78)' }}>
            {aprobado
              ? 'Tienes el tema a la mano. Repite el reto de vez en cuando para no perderlo.'
              : 'Todavía hay que buscarlo en vez de recordarlo. Vuelve a la lectura de esta progresión y repite el reto después.'}
          </p>
          <button
            type="button"
            onClick={empezar}
            style={{
              alignSelf: 'flex-start', padding: '12px 24px', borderRadius: 12,
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              color: '#04121f', background: color.hex, border: 'none',
            }}
          >
            Repetir el reto
          </button>
        </div>
      )}
    </div>
  );
}

function Dato({ etiqueta, valor, accent }: { etiqueta: string; valor: string; accent: string }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)' }}>
        {etiqueta}
      </span>
      <span style={{ fontSize: 16, fontWeight: 900, color: accent }}>{valor}</span>
    </span>
  );
}
