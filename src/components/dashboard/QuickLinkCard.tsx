'use client';

interface QuickLinkCardProps {
  icon: string;
  title: string;
  desc: string;
}

export default function QuickLinkCard({ icon, title, desc }: QuickLinkCardProps) {
  return (
    <div
      style={{
        background: '#fff', border: '1px solid rgba(11,37,69,0.10)',
        borderRadius: 18, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,64,175,0.25)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(11,37,69,0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(11,37,69,0.10)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: '#EFF6FF', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className={icon} style={{ fontSize: 18, color: '#1E40AF' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#0B2545' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'rgba(11,37,69,0.50)', marginTop: 2 }}>{desc}</div>
      </div>
      <i className="fa-solid fa-chevron-right" style={{ fontSize: 12, color: 'rgba(11,37,69,0.25)' }} />
    </div>
  );
}
