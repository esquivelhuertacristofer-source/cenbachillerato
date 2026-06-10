'use client';

import { useEffect } from 'react';

/**
 * Boundary de último recurso: solo se activa si falla el RootLayout o un
 * error.tsx de segmento. Debe renderizar su propio <html>/<body> porque
 * reemplaza al layout raíz por completo. Mantiene el estilo CEN sin depender
 * de globals.css (que podría no haber cargado en el fallo).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError:root]', error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: '#011C40',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>⚠️</div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#ffffff',
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
            }}
          >
            Algo salió mal
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '2rem',
              fontSize: '0.875rem',
              lineHeight: 1.6,
            }}
          >
            Ocurrió un error inesperado. Intenta de nuevo o recarga la página.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#D4A574',
              color: '#011C40',
              border: 'none',
              borderRadius: '0.75rem',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
