'use client';

import { useState } from 'react';
import { imagenDeLectura } from '@/lib/contenido/lectura-imagenes';

/**
 * La imagen de cabecera de una actividad, con sus tres niveles de caída.
 *
 * Los doce tipos originales llevan estas mismas 40 líneas copiadas una por una.
 * Los tipos dinámicos (migración 26) la comparten desde aquí: es el mismo
 * comportamiento y hacerlo tres veces más habría sido copiarlo tres veces más.
 *
 * LOS TRES NIVELES, y por qué hay tres:
 *   1. Lámina propia de la actividad (`url_imagen`).
 *   2. Imagen temática de la materia, cuando no hay lámina propia.
 *   3. Un bloque de color con el título, cuando tampoco hay temática en disco.
 * El tercero existe porque un `<img>` roto en el proyector del salón se ve peor
 * que no poner imagen: el ícono gris de imagen rota le dice al grupo que la
 * plataforma está incompleta.
 *
 * Cualquier `url_imagen` que contenga "placeholder" se trata como "sin lámina":
 * los SVG de relleno se borraron del disco y pedirlos es un 404 seguro.
 */
export function ImagenAmbientacion({
  urlImagen,
  titulo,
  uacCodigo,
  accentHex,
}: {
  urlImagen?: string;
  titulo: string;
  uacCodigo?: string;
  accentHex: string;
}) {
  const [errorPropia, setErrorPropia] = useState(false);
  const [errorTematica, setErrorTematica] = useState(false);

  const url = urlImagen ?? '';
  const tienePropia = url.length > 0 && !/placeholder/i.test(url) && !errorPropia;
  const tematica = imagenDeLectura(uacCodigo, titulo);

  const marco: React.CSSProperties = {
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.04)',
    position: 'relative',
  };

  if (tienePropia) {
    return (
      <div style={marco}>
        <img
          src={url}
          alt={titulo}
          style={{ width: '100%', objectFit: 'contain', maxHeight: 500, display: 'block' }}
          onError={() => setErrorPropia(true)}
        />
      </div>
    );
  }

  if (!errorTematica) {
    return (
      <div style={marco}>
        <img
          src={tematica}
          alt={titulo}
          style={{ width: '100%', objectFit: 'cover', height: 224, display: 'block' }}
          onError={() => setErrorTematica(true)}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(to top, rgba(1,17,38,0.55) 0%, rgba(1,17,38,0.10) 40%, transparent 70%)',
          }}
        />
        <p
          style={{
            position: 'absolute', bottom: 12, left: 16, right: 16, margin: 0,
            fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
          }}
        >
          {titulo}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        ...marco,
        height: 140,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${accentHex}22, rgba(255,255,255,0.03))`,
      }}
    >
      <p style={{ margin: 0, padding: '0 20px', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
        {titulo}
      </p>
    </div>
  );
}
