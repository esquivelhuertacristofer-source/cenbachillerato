'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  { href: '/dashboard/docente', label: 'Inicio', icon: 'fa-solid fa-house', exact: true },
  { href: '/dashboard/docente/grupos', label: 'Grupos', icon: 'fa-solid fa-users-rectangle' },
  { href: '/dashboard/docente/planteamiento', label: 'Planteamiento', icon: 'fa-solid fa-map' },
  { href: '/dashboard/docente/alumnos', label: 'Alumnos', icon: 'fa-solid fa-user-graduate' },
  { href: '/dashboard/docente/actividades', label: 'Actividades', icon: 'fa-solid fa-list-check' },
  { href: '/dashboard/docente/reportes', label: 'Reportes', icon: 'fa-solid fa-chart-bar' },
  { href: '/dashboard/docente/biblioteca', label: 'Biblioteca', icon: 'fa-solid fa-book-open' },
];

function isActive(pathname: string | null, href: string, exact?: boolean) {
  if (!pathname) return false;
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export function DocenteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
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
          padding: '0 20px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          {/* Logo */}
          <Link href="/dashboard/docente" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <img
              src="/Logo%20Cen.png"
              alt="CEN"
              style={{ width: 30, height: 30, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.92 }}
            />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>
                CEN Bachillerato
              </div>
              <div style={{ color: 'rgba(125,211,252,0.75)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Docente
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label="Navegación docente"
            style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}
            className="docente-nav-desktop"
          >
            {NAV.map(({ href, label, icon, exact }) => {
              const active = isActive(pathname, href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: active ? 700 : 600,
                    textDecoration: 'none',
                    color: active ? '#7DD3FC' : 'rgba(255,255,255,0.68)',
                    background: active ? 'rgba(125,211,252,0.13)' : 'transparent',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <i className={icon} style={{ fontSize: 12 }} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Burger — mobile only */}
          <button
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.85)',
              padding: 8,
              borderRadius: 8,
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="docente-burger"
          >
            <i className={menuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} style={{ fontSize: 18 }} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 39,
          }}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        >
          <div
            style={{
              position: 'absolute',
              top: 64,
              left: 0,
              right: 0,
              background: '#0B2545',
              borderBottom: '1px solid rgba(255,255,255,0.10)',
              padding: '12px 20px 20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {NAV.map(({ href, label, icon, exact }) => {
              const active = isActive(pathname, href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    borderRadius: 12,
                    textDecoration: 'none',
                    color: active ? '#7DD3FC' : 'rgba(255,255,255,0.80)',
                    background: active ? 'rgba(125,211,252,0.10)' : 'transparent',
                    fontWeight: active ? 700 : 500,
                    fontSize: 15,
                    marginBottom: 4,
                  }}
                >
                  <i className={icon} style={{ width: 20, textAlign: 'center', fontSize: 14 }} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .docente-nav-desktop { display: none !important; }
          .docente-burger { display: flex !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .docente-nav-desktop a { transition: none !important; }
        }
      `}</style>
    </>
  );
}
