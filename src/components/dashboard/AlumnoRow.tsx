'use client';

import Link from 'next/link';

interface AlumnoRowProps {
  id: string;
  full_name: string | null;
  email: string;
  actividades_completadas: number;
  score_promedio: number | null;
}

export default function AlumnoRow({ id, full_name, email, actividades_completadas, score_promedio }: AlumnoRowProps) {
  const displayName = full_name ?? email;
  return (
    <Link
      href={`/dashboard/docente/alumnos/${id}`}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px', borderRadius: 12, textDecoration: 'none',
        color: 'inherit', transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(11,37,69,0.04)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 999,
          background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#1E40AF', flexShrink: 0,
        }}>
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0B2545' }}>
            {displayName}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(11,37,69,0.50)' }}>
            {actividades_completadas} completadas
            {score_promedio !== null ? ` · ${score_promedio} pts` : ''}
          </div>
        </div>
      </div>
      <i className="fa-solid fa-chevron-right" style={{ fontSize: 11, color: 'rgba(11,37,69,0.25)' }} />
    </Link>
  );
}
