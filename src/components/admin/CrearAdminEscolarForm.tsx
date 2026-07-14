'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { crearAdminEscolar } from '@/lib/actions/crear-admin-escolar';

interface Escuela {
  id: string;
  nombre: string;
}

interface Props {
  escuelas: Escuela[];
}

const s = {
  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    padding: '1.5rem',
    marginBottom: 24,
    maxWidth: 560,
  } as React.CSSProperties,
  label: {
    fontSize: 11,
    fontWeight: 900,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: '#64748B',
    marginBottom: 6,
    display: 'block',
  },
  input: {
    width: '100%',
    borderRadius: 10,
    border: '1px solid #CBD5E1',
    padding: '10px 14px',
    fontSize: 14,
    color: '#0B2545',
    outline: 'none',
  } as React.CSSProperties,
  field: { marginBottom: 16 },
  btn: (disabled?: boolean) => ({
    padding: '10px 22px',
    borderRadius: 999,
    border: 'none',
    fontSize: 13,
    fontWeight: 800,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    background: '#0B2545',
    color: '#FFFFFF',
  } as React.CSSProperties),
};

export default function CrearAdminEscolarForm({ escuelas }: Props) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [escuelaId, setEscuelaId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ email: string; password: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  function reset() {
    setAbierto(false);
    setFullName('');
    setEmail('');
    setEscuelaId('');
    setError(null);
    setResultado(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await crearAdminEscolar({ full_name: fullName, email, escuela_id: escuelaId });
      if ('error' in res) {
        setError(res.error);
        return;
      }
      setResultado(res);
      router.refresh();
    });
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        style={{
          borderRadius: 999, background: '#0B2545', padding: '10px 22px',
          fontSize: 13, fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer',
        }}
      >
        <i className="fa-solid fa-user-plus" style={{ marginRight: 8 }} />
        Nuevo administrador escolar
      </button>
    );
  }

  if (resultado) {
    return (
      <div style={s.card}>
        <p style={{ fontSize: 14, fontWeight: 800, color: '#0B2545', marginBottom: 12 }}>
          ✓ Administrador creado
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: '#64748B' }}>{resultado.email}</span>
          <span style={{
            fontFamily: 'monospace', fontSize: 13, background: '#F8FAFC',
            border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', color: '#0B2545',
            width: 'fit-content',
          }}>
            {resultado.password}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            style={{ ...s.btn(false), background: '#F1F5F9', color: '#0B2545' }}
            onClick={() => {
              navigator.clipboard?.writeText(resultado.password);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 1500);
            }}
          >
            {copiado ? '✓ Copiada' : 'Copiar contraseña'}
          </button>
          <button style={{ ...s.btn(false), background: '#F1F5F9', color: '#0B2545' }} onClick={reset}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={s.card}>
      <div style={s.field}>
        <label style={s.label}>Nombre completo *</label>
        <input
          style={s.input}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nombre y apellidos"
          required
          disabled={isPending}
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Correo electrónico *</label>
        <input
          style={s.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@escuela.mx"
          required
          disabled={isPending}
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Escuela *</label>
        <select
          style={s.input}
          value={escuelaId}
          onChange={(e) => setEscuelaId(e.target.value)}
          required
          disabled={isPending}
        >
          <option value="">— Selecciona —</option>
          {escuelas.map((esc) => (
            <option key={esc.id} value={esc.id}>{esc.nombre}</option>
          ))}
        </select>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 600, margin: '4px 0 16px' }}>
          ⚠ {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="submit"
          style={s.btn(isPending || !fullName.trim() || !email.trim() || !escuelaId)}
          disabled={isPending || !fullName.trim() || !email.trim() || !escuelaId}
        >
          {isPending ? 'Creando…' : 'Crear administrador'}
        </button>
        <button
          type="button"
          onClick={reset}
          style={{ ...s.btn(false), background: '#F1F5F9', color: '#0B2545' }}
          disabled={isPending}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
