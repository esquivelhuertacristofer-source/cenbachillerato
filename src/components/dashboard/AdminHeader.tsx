'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/admin/escuelas', label: 'Escuelas', icon: 'fa-solid fa-school' },
  { href: '/admin/grupos', label: 'Grupos', icon: 'fa-solid fa-layer-group' },
  { href: '/admin/usuarios', label: 'Usuarios', icon: 'fa-solid fa-users' },
  { href: '/admin/alta-masiva', label: 'Alta masiva', icon: 'fa-solid fa-file-arrow-up' },
];

export function AdminHeader() {
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
        <Link href="/admin/escuelas" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
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
              Admin
            </div>
          </div>
        </Link>

        <nav data-admin-header-nav="" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
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
                <i className={icon} style={{ fontSize: 12 }} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
