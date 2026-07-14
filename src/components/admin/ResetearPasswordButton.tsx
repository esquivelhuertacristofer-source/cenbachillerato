'use client';

import { useState, useTransition } from 'react';
import { resetearPassword } from '@/lib/actions/resetear-password';

interface Props {
  userId: string;
  nombre: string;
}

export default function ResetearPasswordButton({ userId, nombre }: Props) {
  const [isPending, startTransition] = useTransition();
  const [confirmando, setConfirmando] = useState(false);
  const [resultado, setResultado] = useState<{ password: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const linkStyle = (color: string): React.CSSProperties => ({
    fontSize: 12,
    fontWeight: 700,
    color,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left',
  });

  function handleReset() {
    setError(null);
    startTransition(async () => {
      const res = await resetearPassword(userId);
      if ('error' in res) {
        setError(res.error);
        setConfirmando(false);
        return;
      }
      setResultado({ password: res.password });
      setConfirmando(false);
    });
  }

  if (resultado) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
        <span style={{
          fontFamily: 'monospace',
          fontSize: 12,
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 8,
          padding: '3px 8px',
          color: '#0B2545',
        }}>
          {resultado.password}
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            style={linkStyle('#1E40AF')}
            onClick={() => {
              navigator.clipboard?.writeText(resultado.password);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 1500);
            }}
          >
            {copiado ? '✓ Copiada' : 'Copiar'}
          </button>
          <button style={linkStyle('#94A3B8')} onClick={() => setResultado(null)}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
      {confirmando ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={linkStyle('#991B1B')} onClick={handleReset} disabled={isPending}>
            {isPending ? 'Restableciendo…' : `Confirmar reset de ${nombre}`}
          </button>
          {!isPending && (
            <button style={linkStyle('#94A3B8')} onClick={() => setConfirmando(false)}>
              Cancelar
            </button>
          )}
        </div>
      ) : (
        <button style={linkStyle('#1E40AF')} onClick={() => setConfirmando(true)}>
          Restablecer contraseña
        </button>
      )}
      {error && (
        <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>⚠ {error}</span>
      )}
    </div>
  );
}
