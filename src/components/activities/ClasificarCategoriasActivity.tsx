'use client';

import { useMemo, useState } from 'react';
import type { ActividadClasificarCategorias, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';
import { ImagenAmbientacion } from '@/components/activities/ImagenAmbientacion';

const FALLBACK_COLOR: AreaColor = { hex: '#FB923C', rgba: '251,146,60', faIcon: 'fa-layer-group', gradient: '' };
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
  actividad: ActividadClasificarCategorias;
  onProgreso?: CallbackProgreso;
  uacCodigo?: string;
  color?: AreaColor;
}

/**
 * Clasificar arrastrando a cubetas, con un camino sin arrastre al lado.
 *
 * El arrastre HTML5 no existe en un teléfono ni en una tableta, y una parte de
 * las escuelas entra por ahí. Por eso cada ficha se puede también SELECCIONAR y
 * mandar a una categoría con un toque: mismo resultado, un dedo, y funciona con
 * teclado para quien navega sin ratón.
 */
export function ClasificarCategoriasActivity({
  actividad, onProgreso, uacCodigo, color = FALLBACK_COLOR,
}: Props) {
  const { contenido } = actividad;
  const elementos = contenido.elementos;
  const minimo = contenido.puntaje_minimo_aprobacion ?? 70;

  /** Fichas barajadas: el orden del seed delataría la categoría. */
  const fichas = useMemo(
    () => barajarConSemilla(elementos.map((_, i) => i), actividad.id ?? actividad.titulo),
    [elementos, actividad.id, actividad.titulo],
  );

  /** índice del elemento → nombre de la categoría donde lo puso el alumno. */
  const [colocados, setColocados] = useState<Record<number, string>>({});
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [revisado, setRevisado] = useState(false);

  function colocar(idx: number, categoria: string) {
    if (revisado) return;
    setColocados((prev) => ({ ...prev, [idx]: categoria }));
    setSeleccion(null);
  }

  function sacar(idx: number) {
    if (revisado) return;
    setColocados((prev) => { const n = { ...prev }; delete n[idx]; return n; });
    setSeleccion(null);
  }

  const pendientes = fichas.filter((i) => colocados[i] === undefined);
  const aciertos = elementos.filter((e, i) => colocados[i] === e.categoria).length;
  const puntaje = elementos.length > 0 ? Math.round((aciertos / elementos.length) * 100) : 100;
  const aprobado = puntaje >= minimo;

  async function revisar() {
    if (pendientes.length > 0) return;
    setRevisado(true);
    await onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: aprobado,
      puntaje,
      respuestas: Object.fromEntries(Object.entries(colocados).map(([k, v]) => [k, String(v)])),
    });
  }

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
          {contenido.instrucciones ?? 'Lleva cada ficha a la categoría que le corresponde.'}
        </p>
        <p style={{ margin: '10px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          Arrastra la ficha, o tócala y después toca su categoría.
        </p>
      </div>

      {/* ── Fichas por clasificar ── */}
      <div
        style={{
          ...card,
          minHeight: 84,
          display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start',
          borderStyle: pendientes.length ? 'solid' : 'dashed',
        }}
      >
        {pendientes.length === 0 ? (
          <p style={{ margin: 'auto', fontSize: 12.5, color: 'rgba(255,255,255,0.40)' }}>
            No quedan fichas por clasificar.
          </p>
        ) : (
          pendientes.map((i) => (
            <button
              key={elementos[i]!.texto}
              type="button"
              draggable
              onDragStart={() => setSeleccion(i)}
              onClick={() => setSeleccion(seleccion === i ? null : i)}
              aria-pressed={seleccion === i}
              style={ficha(seleccion === i, color.hex)}
            >
              {elementos[i]!.texto}
            </button>
          ))
        )}
      </div>

      {/* ── Cubetas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {contenido.categorias.map((cat) => {
          const dentro = Object.entries(colocados)
            .filter(([, c]) => c === cat.nombre)
            .map(([k]) => Number(k));
          return (
            <div
              key={cat.nombre}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (seleccion !== null) colocar(seleccion, cat.nombre); }}
              onClick={() => { if (seleccion !== null) colocar(seleccion, cat.nombre); }}
              style={{
                borderRadius: 16,
                border: `1px ${seleccion !== null ? 'solid' : 'dashed'} ${seleccion !== null ? color.hex : 'rgba(255,255,255,0.14)'}`,
                background: seleccion !== null ? `${color.hex}12` : 'rgba(255,255,255,0.03)',
                padding: 14, minHeight: 120,
                display: 'flex', flexDirection: 'column', gap: 8,
                cursor: seleccion !== null ? 'copy' : 'default',
                transition: 'border-color 0.15s ease, background 0.15s ease',
              }}
            >
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 800, color: '#fff' }}>{cat.nombre}</p>
              {cat.descripcion && (
                <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.45, color: 'rgba(255,255,255,0.48)' }}>
                  {cat.descripcion}
                </p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {dentro.map((i) => {
                  const el = elementos[i]!;
                  const bien = revisado && el.categoria === cat.nombre;
                  const mal = revisado && el.categoria !== cat.nombre;
                  return (
                    <button
                      key={el.texto}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); sacar(i); }}
                      disabled={revisado}
                      title={revisado ? undefined : 'Quitar de esta categoría'}
                      style={{
                        ...ficha(false, color.hex),
                        borderColor: bien ? 'rgba(52,211,153,0.55)' : mal ? 'rgba(248,113,113,0.55)' : 'rgba(255,255,255,0.14)',
                        background: bien ? 'rgba(52,211,153,0.12)' : mal ? 'rgba(248,113,113,0.10)' : 'rgba(255,255,255,0.06)',
                        cursor: revisado ? 'default' : 'pointer',
                      }}
                    >
                      {el.texto}
                      {mal && (
                        <span style={{ display: 'block', marginTop: 3, fontSize: 10.5, fontWeight: 700, color: '#FCA5A5' }}>
                          va en {el.categoria}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!revisado ? (
        <button
          type="button"
          onClick={revisar}
          disabled={pendientes.length > 0}
          style={{
            alignSelf: 'flex-start', padding: '12px 24px', borderRadius: 12,
            fontSize: 13, fontWeight: 800,
            cursor: pendientes.length > 0 ? 'not-allowed' : 'pointer',
            color: pendientes.length > 0 ? 'rgba(255,255,255,0.35)' : '#04121f',
            background: pendientes.length > 0 ? 'rgba(255,255,255,0.06)' : color.hex,
            border: 'none',
          }}
        >
          {pendientes.length > 0 ? `Faltan ${pendientes.length} fichas` : 'Revisar mi clasificación'}
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
            {aciertos} de {elementos.length} bien clasificadas — {puntaje} puntos
          </p>
          {elementos.some((e, i) => colocados[i] !== e.categoria && e.explicacion) && (
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {elementos.map((e, i) =>
                colocados[i] !== e.categoria && e.explicacion ? (
                  <li key={e.texto} style={{ fontSize: 12.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.72)' }}>
                    <strong style={{ color: '#fff' }}>{e.texto}:</strong> {e.explicacion}
                  </li>
                ) : null,
              )}
            </ul>
          )}
          <button
            type="button"
            onClick={() => { setRevisado(false); setColocados({}); setSeleccion(null); }}
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

function ficha(activa: boolean, accent: string): React.CSSProperties {
  return {
    borderRadius: 10,
    border: `1px solid ${activa ? accent : 'rgba(255,255,255,0.14)'}`,
    background: activa ? `${accent}22` : 'rgba(255,255,255,0.06)',
    padding: '8px 12px', cursor: 'pointer',
    fontSize: 12.5, fontWeight: 700, lineHeight: 1.35, color: '#fff',
    fontFamily: 'inherit', textAlign: 'left',
    transition: 'border-color 0.15s ease, background 0.15s ease',
  };
}
