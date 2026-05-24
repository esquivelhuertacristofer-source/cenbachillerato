'use client';

import { useRouter } from 'next/navigation';

export function GrupoSelectorClient({
  grupos,
  selectedId,
  basePath = '/dashboard/docente/planteamiento',
}: {
  grupos: { id: string; nombre: string; semestre: number }[];
  selectedId: string;
  basePath?: string;
}) {
  const router = useRouter();

  if (grupos.length <= 1) return null;

  return (
    <select
      value={selectedId}
      onChange={(e) => router.push(`${basePath}?grupo=${e.target.value}`)}
      style={{
        background: '#fff',
        border: '1px solid rgba(11,37,69,0.18)',
        borderRadius: 10,
        padding: '8px 36px 8px 14px',
        fontSize: 14,
        fontWeight: 600,
        color: '#0B2545',
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230B2545' opacity='.45' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        outline: 'none',
      }}
    >
      {grupos.map((g) => (
        <option key={g.id} value={g.id}>
          {g.nombre} — Sem. {g.semestre}°
        </option>
      ))}
    </select>
  );
}
