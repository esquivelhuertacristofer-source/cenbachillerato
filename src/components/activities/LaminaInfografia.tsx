'use client';

import type { AreaColor } from '@/components/hub/hub-colors';

/**
 * LA LÁMINA DE UNA INFOGRAFÍA, DIBUJADA CON SUS PROPIOS DATOS.
 *
 * POR QUÉ EXISTE. De las 29 actividades de tipo `infografia`, 27 apuntaban a
 * `/placeholder/infografia.svg`, un archivo que se borró del disco hace meses.
 * El componente lo detectaba y caía a una foto temática de la materia: una foto
 * de un laboratorio genérico encabezando "Ciclos biogeoquímicos y crisis
 * climática". No estaba rota, estaba vacía.
 *
 * La salida no era generar 27 imágenes: era darse cuenta de que la infografía
 * YA ESTABA ESCRITA. Cada una trae `titulo`, `puntos_clave`, `fuente` y su
 * contexto; eso es exactamente el contenido de una lámina. Lo que faltaba era
 * dibujarlo en vez de ilustrarlo.
 *
 * QUÉ GANA CON SER DOM Y NO UNA IMAGEN:
 *   · se lee en un proyector y en un teléfono, porque el texto reflowea;
 *   · lo lee un lector de pantalla, cosa que un PNG con letras nunca hace;
 *   · se puede corregir una cifra editando la actividad, sin volver a exportar;
 *   · pesa dos kilobytes y no se puede romper con un 404.
 */
export function LaminaInfografia({
  titulo,
  puntosClave,
  fuente,
  color,
}: {
  titulo: string;
  puntosClave: string[];
  fuente?: string;
  color: AreaColor;
}) {
  const puntos = puntosClave.slice(0, 8);

  return (
    <figure
      style={{
        margin: 0,
        borderRadius: 18,
        overflow: 'hidden',
        border: `1px solid rgba(${color.rgba},0.30)`,
        background: `linear-gradient(160deg, rgba(${color.rgba},0.16) 0%, rgba(2,12,28,0.55) 55%, rgba(2,12,28,0.75) 100%)`,
      }}
    >
      {/* Banda de título */}
      <div
        style={{
          padding: '20px 22px 16px',
          borderBottom: `1px solid rgba(${color.rgba},0.22)`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            flexShrink: 0,
            width: 38, height: 38, borderRadius: 11,
            display: 'grid', placeItems: 'center',
            background: `rgba(${color.rgba},0.18)`,
            border: `1px solid rgba(${color.rgba},0.40)`,
          }}
        >
          <i className="fa-solid fa-chart-pie" style={{ fontSize: 17, color: color.hex }} />
        </span>
        <span>
          <span
            style={{
              display: 'block', fontSize: 10, fontWeight: 800,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: color.hex, marginBottom: 4,
            }}
          >
            Infografía de estudio
          </span>
          <span style={{ display: 'block', fontSize: 17, fontWeight: 800, lineHeight: 1.35, color: '#fff' }}>
            {titulo}
          </span>
        </span>
      </div>

      {/* Rejilla de puntos clave: es el cuerpo de la lámina */}
      {puntos.length > 0 && (
        <ol
          style={{
            listStyle: 'none', margin: 0, padding: 18,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 12,
          }}
        >
          {puntos.map((p, i) => (
            <li
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 11,
                borderRadius: 13,
                border: '1px solid rgba(255,255,255,0.09)',
                background: 'rgba(255,255,255,0.045)',
                padding: '13px 14px',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0, width: 25, height: 25, borderRadius: 8,
                  display: 'grid', placeItems: 'center',
                  fontSize: 11.5, fontWeight: 900,
                  color: color.hex,
                  background: `rgba(${color.rgba},0.16)`,
                  border: `1px solid rgba(${color.rgba},0.35)`,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 13.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.84)' }}>
                {p}
              </span>
            </li>
          ))}
        </ol>
      )}

      {fuente && (
        <figcaption
          style={{
            padding: '0 22px 18px',
            fontSize: 11.5, lineHeight: 1.5,
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          Fuente: {fuente}
        </figcaption>
      )}
    </figure>
  );
}
