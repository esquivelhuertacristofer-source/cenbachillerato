import Link from "next/link";

interface UACCardProps {
  codigo: string;
  nombre: string;
  icono?: string;
  colorClass?: string;
  totalProgresiones: number;
  semestre: number;
  tipo: "sociocognitivo" | "area" | "socioemocional";
}

export function UACCard({
  codigo,
  nombre,
  icono = "📚",
  totalProgresiones,
  semestre,
  tipo,
}: UACCardProps) {
  const tipoBadge: Record<typeof tipo, string> = {
    sociocognitivo: "Recurso Sociocognitivo",
    area: "Área de Conocimiento",
    socioemocional: "Recurso Socioemocional",
  };

  return (
    <Link href={`/hub/uac/${codigo}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        borderRadius: 16,
        border: '1px solid rgba(11,37,69,0.10)',
        background: '#fff',
        padding: 20,
        boxShadow: '0 2px 8px rgba(11,37,69,0.06)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{
            width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 12,
            background: '#DBEAFE',
            fontSize: 20,
            flexShrink: 0,
          }}>
            {icono}
          </div>
          <span style={{
            borderRadius: 999,
            background: 'rgba(11,37,69,0.07)',
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(11,37,69,0.55)',
          }}>
            Sem. {semestre}
          </span>
        </div>

        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF', margin: '0 0 4px', letterSpacing: '0.04em' }}>
            {tipoBadge[tipo]}
          </p>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0B2545', margin: 0, lineHeight: 1.4 }}>
            {nombre}
          </h3>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(11,37,69,0.07)',
          paddingTop: 12,
        }}>
          <span style={{ fontSize: 12, color: 'rgba(11,37,69,0.50)' }}>
            {totalProgresiones} progresiones
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF' }}>
            Ver contenido <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
          </span>
        </div>
      </div>
    </Link>
  );
}
