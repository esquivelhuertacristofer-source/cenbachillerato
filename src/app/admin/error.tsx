'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AdminError]', error);
  }, [error]);

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0B2545', marginBottom: 8 }}>
          Error en administración
        </h2>
        <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          No se pudieron cargar los datos. Intenta de nuevo.
        </p>
        <button
          onClick={reset}
          style={{
            padding: '10px 24px',
            background: '#1E40AF',
            color: '#fff',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
