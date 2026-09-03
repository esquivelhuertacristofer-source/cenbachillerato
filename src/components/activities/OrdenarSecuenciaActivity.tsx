'use client';

import { useMemo, useState } from 'react';
import type { ActividadOrdenarSecuencia, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';
import { ImagenAmbientacion } from '@/components/activities/ImagenAmbientacion';

const FALLBACK_COLOR: AreaColor = { hex: '#34D399', rgba: '52,211,153', faIcon: 'fa-arrow-down-1-9', gradient: '' };
const FONT = 'var(--font-epilogue), sans-serif';

const ROTULO: Record<string, { titulo: string; ayuda: string }> = {
  cronologia: {
    titulo: 'Del más antiguo al más reciente',
    ayuda: 'Arriba lo que pasó primero; abajo lo último.',
  },
  procedimiento: {
    titulo: 'Del primer paso al último',
    ayuda: 'Arriba lo que se hace primero; abajo lo que cierra el procedimiento.',
  },
  jerarquia: {
    titulo: 'De lo más general a lo más particular',
    ayuda: 'Arriba lo que engloba a lo demás; abajo el caso más específico.',
  },
};

/**
 * Baraja estable: se calcula UNA vez y no cambia entre renders.
 *
 * Se siembra con el id de la actividad en vez de `Math.random()` para que el
 * alumno que recarga la página encuentre las tarjetas donde las dejó. Un orden
 * distinto en cada render haría imposible arrastrar nada (React repintaría la
 * lista debajo del dedo) y además borraría el avance al recargar.
 *
 * También se garantiza que el barajado NO devuelva el orden correcto: empezar
 * con el ejercicio ya resuelto lo convierte en un botón de "Revisar".
 */
function barajarConSemilla<T>(items: T[], semilla: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < semilla.length; i++) {
    h ^= semilla.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rnd = () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
  const idx = items.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j]!, idx[i]!];
  }
  // Si por casualidad salió ordenado, se giran los dos primeros.
  if (idx.every((v, i) => v === i) && idx.length > 1) [idx[0], idx[1]] = [idx[1]!, idx[0]!];
  return idx;
}

interface Props {
  actividad: ActividadOrdenarSecuencia;
  onProgreso?: CallbackProgreso;
  uacCodigo?: string;
  color?: AreaColor;
}

export function OrdenarSecuenciaActivity({
  actividad, onProgreso, uacCodigo, color = FALLBACK_COLOR,
}: Props) {
  const { contenido } = actividad;
  const pasos = contenido.pasos;
  const criterio = contenido.criterio ?? 'procedimiento';
  const rotulo = ROTULO[criterio] ?? ROTULO.procedimiento!;
  const minimo = contenido.puntaje_minimo_aprobacion ?? 70;

  const inicial = useMemo(
    () => barajarConSemilla(pasos, actividad.id ?? actividad.titulo),
    [pasos, actividad.id, actividad.titulo],
  );
  /** Orden actual como lista de índices dentro de `contenido.pasos`. */
  const [orden, setOrden] = useState<number[]>(inicial);
  const [revisado, setRevisado] = useState(false);
  const [arrastrando, setArrastrando] = useState<number | null>(null);

  function mover(desde: number, hasta: number) {
    if (hasta < 0 || hasta >= orden.length || desde === hasta) return;
    setOrden((prev) => {
      const next = [...prev];
      const [x] = next.splice(desde, 1);
      next.splice(hasta, 0, x!);
      return next;
    });
    setRevisado(false);
  }

  const aciertos = orden.filter((idxPaso, posicion) => idxPaso === posicion).length;
  const puntaje = pasos.length > 0 ? Math.round((aciertos / pasos.length) * 100) : 100;
  const aprobado = puntaje >= minimo;

  async function revisar() {
    setRevisado(true);
    await onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: aprobado,
      puntaje,
      respuestas: { orden: orden.map(String) },
    });
  }

  function reintentar() {
    setRevisado(false);
    setOrden(barajarConSemilla(pasos, `${actividad.id ?? actividad.titulo}-${Date.now()}`));
  }

  const card: React.CSSProperties = {
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    padding: 20,
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
        <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: color.hex }}>
          {rotulo.titulo}
        </p>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.78)' }}>
          {contenido.instrucciones ?? rotulo.ayuda}
        </p>
        <p style={{ margin: '10px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          Arrastra las tarjetas, o usa las flechas para moverlas.
        </p>
      </div>

      <ol
        aria-label="Secuencia a ordenar"
        style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {orden.map((idxPaso, posicion) => {
          const paso = pasos[idxPaso]!;
          const correcta = idxPaso === posicion;
          const borde = revisado
            ? correcta ? 'rgba(52,211,153,0.55)' : 'rgba(248,113,113,0.55)'
            : arrastrando === posicion ? `${color.hex}88` : 'rgba(255,255,255,0.10)';
          const fondo = revisado
            ? correcta ? 'rgba(52,211,153,0.10)' : 'rgba(248,113,113,0.08)'
            : 'rgba(255,255,255,0.04)';

          return (
            <li
              key={`${idxPaso}-${paso.texto.slice(0, 12)}`}
              draggable={!revisado}
              onDragStart={() => setArrastrando(posicion)}
              onDragEnd={() => setArrastrando(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (arrastrando !== null) mover(arrastrando, posicion);
                setArrastrando(null);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                borderRadius: 14, border: `1px solid ${borde}`, background: fondo,
                padding: '12px 14px',
                cursor: revisado ? 'default' : 'grab',
                transition: 'border-color 0.15s ease, background 0.15s ease',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0, width: 26, height: 26, borderRadius: 8,
                  display: 'grid', placeItems: 'center',
                  fontSize: 12, fontWeight: 900,
                  color: color.hex, background: `${color.hex}1f`, border: `1px solid ${color.hex}44`,
                }}
              >
                {posicion + 1}
              </span>

              <span style={{ flex: 1, minWidth: 0 }}>
                {paso.marca && (
                  <span style={{ display: 'block', fontSize: 10.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
                    {paso.marca}
                  </span>
                )}
                <span style={{ display: 'block', fontSize: 14, lineHeight: 1.5, color: '#fff' }}>
                  {paso.texto}
                </span>
                {revisado && paso.explicacion && (
                  <span style={{ display: 'block', marginTop: 6, fontSize: 12.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.62)' }}>
                    {correcta ? '✓ ' : `Va en la posición ${idxPaso + 1}. `}{paso.explicacion}
                  </span>
                )}
              </span>

              {!revisado && (
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => mover(posicion, posicion - 1)}
                    disabled={posicion === 0}
                    aria-label={`Subir "${paso.texto.slice(0, 40)}"`}
                    style={botonFlecha(posicion === 0)}
                  >
                    <i className="fa-solid fa-chevron-up" style={{ fontSize: 10 }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(posicion, posicion + 1)}
                    disabled={posicion === orden.length - 1}
                    aria-label={`Bajar "${paso.texto.slice(0, 40)}"`}
                    style={botonFlecha(posicion === orden.length - 1)}
                  >
                    <i className="fa-solid fa-chevron-down" style={{ fontSize: 10 }} />
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {!revisado ? (
        <button
          type="button"
          onClick={revisar}
          style={{
            alignSelf: 'flex-start', padding: '12px 24px', borderRadius: 12,
            fontSize: 13, fontWeight: 800, cursor: 'pointer',
            color: '#04121f', background: color.hex, border: 'none',
          }}
        >
          Revisar mi orden
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
            {aciertos} de {pasos.length} en su lugar — {puntaje} puntos
          </p>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.78)' }}>
            {aprobado
              ? 'La secuencia quedó bien armada. Lee las notas de cada tarjeta para fijar por qué va en ese lugar.'
              : 'Las tarjetas en rojo están fuera de su sitio; cada una dice en qué posición va. Vuelve a intentarlo.'}
          </p>
          <button
            type="button"
            onClick={reintentar}
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

function botonFlecha(deshabilitado: boolean): React.CSSProperties {
  return {
    width: 26, height: 22, borderRadius: 6,
    display: 'grid', placeItems: 'center',
    cursor: deshabilitado ? 'default' : 'pointer',
    color: deshabilitado ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.70)',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
  };
}
