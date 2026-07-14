'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { crearEscuela } from '@/lib/actions/crear-escuela';
import { SUBSISTEMAS_ESCUELA } from '@/lib/schemas/crear-escuela.schema';

const s = {
  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    padding: '1.5rem',
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

export default function CrearEscuelaForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nombre, setNombre] = useState('');
  const [cct, setCct] = useState('');
  const [subsistema, setSubsistema] = useState('');
  const [estado, setEstado] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await crearEscuela({ nombre, cct, subsistema, estado, municipio });
      if ('error' in res) {
        setError(res.error);
        return;
      }
      router.push('/admin/escuelas');
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} style={s.card}>
      <div style={s.field}>
        <label style={s.label}>Nombre de la escuela *</label>
        <input
          style={s.input}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Bachillerato General Estatal N.° 1"
          required
          disabled={isPending}
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Clave de Centro de Trabajo (CCT)</label>
        <input
          style={s.input}
          value={cct}
          onChange={(e) => setCct(e.target.value)}
          placeholder="09DBH0001Z"
          disabled={isPending}
        />
      </div>

      <div style={s.field}>
        <label style={s.label}>Subsistema</label>
        <select
          style={s.input}
          value={subsistema}
          onChange={(e) => setSubsistema(e.target.value)}
          disabled={isPending}
        >
          <option value="">— Selecciona —</option>
          {SUBSISTEMAS_ESCUELA.map((s2) => (
            <option key={s2} value={s2}>{s2}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={s.field}>
          <label style={s.label}>Estado</label>
          <input
            style={s.input}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            placeholder="Puebla"
            disabled={isPending}
          />
        </div>
        <div style={s.field}>
          <label style={s.label}>Municipio</label>
          <input
            style={s.input}
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            placeholder="Puebla"
            disabled={isPending}
          />
        </div>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 600, margin: '4px 0 16px' }}>
          ⚠ {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" style={s.btn(isPending || !nombre.trim())} disabled={isPending || !nombre.trim()}>
          {isPending ? 'Guardando…' : 'Registrar escuela'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/escuelas')}
          style={{ ...s.btn(false), background: '#F1F5F9', color: '#0B2545' }}
          disabled={isPending}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
