'use client';

const SEM_COLOR: Record<number, string> = {
  1: '#6366f1', 2: '#8b5cf6', 3: '#06b6d4',
  4: '#10b981', 5: '#f59e0b', 6: '#ef4444',
};

interface GrupoCardProps {
  nombre: string;
  semestre: number;
  total_alumnos: number;
}

export default function GrupoCard({ nombre, semestre, total_alumnos }: GrupoCardProps) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(11,37,69,0.10)',
        borderRadius: 20,
        padding: '28px 32px',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(11,37,69,0.12)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(11,37,69,0.20)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(11,37,69,0.10)';
      }}
    >
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: SEM_COLOR[semestre] ?? '#6366f1',
        color: '#fff', borderRadius: 999,
        padding: '4px 12px', fontSize: 12, fontWeight: 700,
        marginBottom: 16, letterSpacing: '0.04em',
      }}>
        <i className="fa-solid fa-layer-group" style={{ fontSize: 10 }} />
        Semestre {semestre}
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0B2545', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        {nombre}
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(11,37,69,0.65)', fontSize: 14 }}>
          <i className="fa-solid fa-user-graduate" style={{ color: '#1E40AF', fontSize: 13 }} />
          <span><strong style={{ color: '#0B2545' }}>{total_alumnos}</strong> alumno{total_alumnos !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)' }}>
        <i className="fa-solid fa-chevron-right" style={{ color: 'rgba(11,37,69,0.25)', fontSize: 14 }} />
      </div>
    </div>
  );
}
