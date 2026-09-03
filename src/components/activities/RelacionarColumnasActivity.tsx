'use client';

import { useMemo, useState } from 'react';
import type { ActividadRelacionarColumnas, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';
import { ImagenAmbientacion } from '@/components/activities/ImagenAmbientacion';

const FALLBACK_COLOR: AreaColor = { hex: '#7DD3FC', rgba: '125,211,252', faIcon: 'fa-link', gradient: '' };
const FONT = 'var(--font-epilogue), sans-serif';

/** Baraja estable sembrada con un texto (ver OrdenarSecuenciaActivity). */
function barajarConSemilla<T>(items: T[], semilla: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < semilla.length; i++) {
    h ^= semilla.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rnd = () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

interface Props {
  actividad: ActividadRelacionarColumnas;
  onProgreso?: CallbackProgreso;
  uacCodigo?: string;
  color?: AreaColor;
}

/**
 * Relacionar columnas SIN líneas que cruzan la pantalla.
 *
 * Se probó el patrón clásico —trazar una línea de una columna a la otra— y en
 * un teléfono no funciona: los renglones quedan a dos dedos de distancia y la
 * línea tapa el texto que hay que leer. Aquí se toca primero un concepto y
 * después su pareja; el par se pinta con el mismo color y número, que es lo que
 * ya hace un alumno con lápiz cuando resuelve esto en papel.
 */
export function RelacionarColumnasActivity({
  actividad, onProgreso, uacCodigo, color = FALLBACK_COLOR,
}: Props) {
  const { contenido } = actividad;
  const parejas = contenido.parejas;
  const minimo = contenido.puntaje_minimo_aprobacion ?? 70;

  /** Opciones de la derecha, barajadas y con los distractores mezclados. */
  const derechas = useMemo(() => {
    const todas = [...parejas.map((p) => p.derecha), ...(contenido.distractores ?? [])];
    return barajarConSemilla(todas, actividad.id ?? actividad.titulo);
  }, [parejas, contenido.distractores, actividad.id, actividad.titulo]);

  /** izquierda (índice en `parejas`) → texto elegido de la derecha. */
  const [enlaces, setEnlaces] = useState<Record<number, string>>({});
  const [seleccionIzq, setSeleccionIzq] = useState<number | null>(null);
  const [revisado, setRevisado] = useState(false);

  function tocarIzquierda(i: number) {
    if (revisado) return;
    if (enlaces[i] !== undefined) {
      // Tocar una fila ya emparejada la deshace: es el gesto de corregirse.
      setEnlaces((prev) => { const n = { ...prev }; delete n[i]; return n; });
      setSeleccionIzq(null);
      return;
    }
    setSeleccionIzq(seleccionIzq === i ? null : i);
  }

  function tocarDerecha(texto: string) {
    if (revisado || seleccionIzq === null) return;
    setEnlaces((prev) => {
      const n = { ...prev };
      // Una opción de la derecha sólo puede estar en un par: si ya estaba
      // usada, se le quita a quien la tenía en vez de duplicarla.
      for (const k of Object.keys(n)) if (n[Number(k)] === texto) delete n[Number(k)];
      n[seleccionIzq] = texto;
      return n;
    });
    setSeleccionIzq(null);
  }

  const emparejadas = Object.keys(enlaces).length;
  const aciertos = parejas.filter((p, i) => enlaces[i] === p.derecha).length;
  const puntaje = parejas.length > 0 ? Math.round((aciertos / parejas.length) * 100) : 100;
  const aprobado = puntaje >= minimo;

  async function revisar() {
    if (emparejadas < parejas.length) return;
    setRevisado(true);
    await onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: aprobado,
      puntaje,
      respuestas: Object.fromEntries(Object.entries(enlaces).map(([k, v]) => [k, String(v)])),
    });
  }

  /** Número de par de una opción de la derecha (para pintarla igual que su izquierda). */
  const numeroDePar = (texto: string): number | null => {
    for (const [k, v] of Object.entries(enlaces)) if (v === texto) return Number(k) + 1;
    return null;
  };

  const card: React.CSSProperties = {
    borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)', padding: 20,
  };

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, fontFamily: FONT }}>
      <ImagenAmbientacion
        urlImagen={contenido.url_imagen}
        titulo={actividad.titulo}
        uacCodigo={uacCodigo}
        accentHex={color.hex}
      />

      <div style={card}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.78)' }}>
          {contenido.instrucciones ?? 'Toca un elemento de la izquierda y después su pareja en la derecha.'}
        </p>
        <p style={{ margin: '10px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          Para deshacer un par, vuelve a tocar el elemento de la izquierda.
          {(contenido.distractores?.length ?? 0) > 0 && ' Ojo: hay opciones de la derecha que no emparejan con nada.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {/* ── Columna izquierda ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={cabecera(color.hex)}>{contenido.titulo_izquierda ?? 'Concepto'}</p>
          {parejas.map((p, i) => {
            const elegida = enlaces[i];
            const acierta = revisado && elegida === p.derecha;
            const falla = revisado && elegida !== undefined && elegida !== p.derecha;
            return (
              <div key={p.izquierda}>
                <button
                  type="button"
                  onClick={() => tocarIzquierda(i)}
                  aria-pressed={seleccionIzq === i}
                  style={fila({
                    activo: seleccionIzq === i,
                    ligado: elegida !== undefined,
                    acierta, falla, accent: color.hex,
                  })}
                >
                  <span style={insignia(elegida !== undefined, color.hex)}>{i + 1}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{p.izquierda}</span>
                  {revisado && (
                    <i
                      className={`fa-solid ${acierta ? 'fa-check' : 'fa-xmark'}`}
                      style={{ fontSize: 12, color: acierta ? '#34D399' : '#F87171' }}
                    />
                  )}
                </button>
                {revisado && !acierta && (
                  <p style={{ margin: '6px 0 0 8px', fontSize: 12.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.62)' }}>
                    Va con: <strong style={{ color: '#fff' }}>{p.derecha}</strong>
                    {p.explicacion ? `. ${p.explicacion}` : ''}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Columna derecha ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={cabecera(color.hex)}>{contenido.titulo_derecha ?? 'Corresponde con'}</p>
          {derechas.map((texto) => {
            const n = numeroDePar(texto);
            return (
              <button
                key={texto}
                type="button"
                onClick={() => tocarDerecha(texto)}
                disabled={revisado || seleccionIzq === null}
                style={fila({
                  activo: false,
                  ligado: n !== null,
                  acierta: false, falla: false,
                  accent: color.hex,
                  atenuado: !revisado && seleccionIzq === null && n === null,
                })}
              >
                {n !== null ? <span style={insignia(true, color.hex)}>{n}</span> : <span style={{ width: 24 }} />}
                <span style={{ flex: 1, textAlign: 'left' }}>{texto}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!revisado ? (
        <button
          type="button"
          onClick={revisar}
          disabled={emparejadas < parejas.length}
          style={{
            alignSelf: 'flex-start', padding: '12px 24px', borderRadius: 12,
            fontSize: 13, fontWeight: 800,
            cursor: emparejadas < parejas.length ? 'not-allowed' : 'pointer',
            color: emparejadas < parejas.length ? 'rgba(255,255,255,0.35)' : '#04121f',
            background: emparejadas < parejas.length ? 'rgba(255,255,255,0.06)' : color.hex,
            border: 'none',
          }}
        >
          {emparejadas < parejas.length
            ? `Faltan ${parejas.length - emparejadas} por relacionar`
            : 'Revisar mis parejas'}
        </button>
      ) : (
        <div
          role="status"
          style={{
            borderRadius: 16,
            border: `1px solid ${aprobado ? 'rgba(52,211,153,0.45)' : 'rgba(251,191,36,0.45)'}`,
            background: aprobado ? 'rgba(52,211,153,0.10)' : 'rgba(251,191,36,0.08)',
            padding: 20, display: 'flex', flexDirection: 'column', gap: 10,
          }}
        >
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#fff' }}>
            {aciertos} de {parejas.length} bien relacionadas — {puntaje} puntos
          </p>
          <button
            type="button"
            onClick={() => { setRevisado(false); setEnlaces({}); setSeleccionIzq(null); }}
            style={{
              alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 10,
              fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
              color: '#fff', background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.16)',
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}

function cabecera(accent: string): React.CSSProperties {
  return {
    margin: '0 0 2px', fontSize: 10.5, fontWeight: 800,
    letterSpacing: '0.12em', textTransform: 'uppercase', color: accent,
  };
}

function insignia(visible: boolean, accent: string): React.CSSProperties {
  return {
    flexShrink: 0, width: 24, height: 24, borderRadius: 7,
    display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 900,
    color: visible ? accent : 'transparent',
    background: visible ? `${accent}1f` : 'transparent',
    border: visible ? `1px solid ${accent}44` : '1px solid transparent',
  };
}

function fila(o: {
  activo: boolean; ligado: boolean; acierta: boolean; falla: boolean;
  accent: string; atenuado?: boolean;
}): React.CSSProperties {
  const borde = o.acierta ? 'rgba(52,211,153,0.55)'
    : o.falla ? 'rgba(248,113,113,0.55)'
    : o.activo ? o.accent
    : o.ligado ? `${o.accent}55`
    : 'rgba(255,255,255,0.10)';
  return {
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    borderRadius: 12, border: `1px solid ${borde}`,
    background: o.acierta ? 'rgba(52,211,153,0.10)'
      : o.falla ? 'rgba(248,113,113,0.08)'
      : o.activo ? `${o.accent}1a`
      : 'rgba(255,255,255,0.04)',
    padding: '11px 13px', cursor: 'pointer',
    fontSize: 13.5, lineHeight: 1.45, fontWeight: 600,
    color: '#fff', opacity: o.atenuado ? 0.55 : 1,
    transition: 'border-color 0.15s ease, background 0.15s ease, opacity 0.15s ease',
    fontFamily: 'inherit',
  };
}
