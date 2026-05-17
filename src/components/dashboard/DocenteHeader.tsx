'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dashboard/docente', label: 'Inicio' },
  { href: '/dashboard/docente/alumnos', label: 'Alumnos' },
  { href: '/dashboard/docente/metricas', label: 'Métricas' },
  { href: '/dashboard/docente/reportes', label: 'Reportes' },
];

export function DocenteHeader() {
  const pathname = usePathname();

  return (
    <header style={{
      background: '#0B2545',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/dashboard/docente" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <img
            src="/Logo%20Cen.png"
            alt="CEN"
            style={{ width: 32, height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.92 }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              CEN Bachillerato
            </div>
            <div style={{ color: 'rgba(125,211,252,0.75)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Docente
            </div>
          </div>
        </Link>

        <nav data-docente-header-nav="" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: active ? '#7DD3FC' : 'rgba(255,255,255,0.70)',
                  background: active ? 'rgba(125,211,252,0.12)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
