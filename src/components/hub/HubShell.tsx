"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface ShellProfile {
  full_name: string | null;
  email: string | null;
  role: string;
  semestre?: number | null;
}

interface HubShellProps {
  profile: ShellProfile;
  racha: number;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/hub",            icon: "fa-house",      label: "Inicio",     exact: true  },
  { href: "/hub/biblioteca", icon: "fa-book-open",  label: "Biblioteca", exact: false },
  { href: "/hub/progreso",   icon: "fa-chart-line", label: "Progreso",   exact: false },
] as const;

function SidebarContent({
  pathname,
  profile,
  racha,
  onClose,
}: {
  pathname: string;
  profile: ShellProfile;
  racha: number;
  onClose?: () => void;
}) {
  const nombre = profile.full_name?.split(" ")[0] ?? "Alumno";
  const initials = ((profile.full_name ?? profile.email ?? "A")[0] ?? "A").toUpperCase();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* ── Logo ─── */}
      <div style={{
        padding: "28px 20px 22px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <Link
          href="/hub"
          onClick={onClose}
          style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0,0,0,0.20)",
            flexShrink: 0,
          }}>
            <img
              src="/Logo%20Cen.png"
              alt="CEN"
              style={{ width: 26, height: 26, objectFit: "contain" }}
            />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05 }}>
              CEN
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.40)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Bachillerato
            </div>
          </div>
        </Link>

        {/* Semestre pill */}
        <div style={{ marginTop: 16 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(56,189,248,0.10)",
            border: "1px solid rgba(56,189,248,0.20)",
            borderRadius: 999,
            padding: "5px 12px",
            fontSize: 11, fontWeight: 800, color: "#7DD3FC",
            letterSpacing: "0.06em",
          }}>
            <i className="fa-solid fa-graduation-cap" style={{ fontSize: 9 }} />
            Semestre {profile.semestre ?? 1}
          </span>
        </div>
      </div>

      {/* ── Nav ─── */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`hub-nav-item${active ? " active" : ""}`}
            >
              <span className="hub-nav-icon">
                <i className={`fa-solid ${item.icon}`} />
              </span>
              {item.label}
              {active && (
                <span style={{
                  marginLeft: "auto",
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#38BDF8",
                  flexShrink: 0,
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Racha ─── */}
      {racha > 0 && (
        <div style={{ margin: "0 10px 8px", borderRadius: 14, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.14)", padding: "11px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>🔥</span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#FB923C", lineHeight: 1, letterSpacing: "-0.02em" }}>
                {racha}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 600, marginTop: 2 }}>
                días seguidos
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile + logout ─── */}
      <div style={{ padding: "10px 10px 18px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 8px", borderRadius: 11 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #38BDF8, #0EA5E9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#0B2545",
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {nombre}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile.email ?? "alumno"}
            </div>
          </div>
        </div>
        <Link
          href="/log-in"
          className="hub-logout-btn"
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 8px", borderRadius: 10, fontSize: 12, fontWeight: 600 }}
        >
          <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: 11 }} />
          Cerrar sesión
        </Link>
      </div>
    </>
  );
}

export function HubShell({ profile, racha, children }: HubShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Desktop sidebar ─── */}
      <div className="hub-sidebar-panel">
        <SidebarContent pathname={pathname} profile={profile} racha={racha} />
      </div>

      {/* ── Mobile drawer ─── */}
      {mobileOpen && (
        <div className="hub-drawer-overlay" onClick={() => setMobileOpen(false)}>
          <div className="hub-drawer" onClick={(e) => e.stopPropagation()}>
            <SidebarContent
              pathname={pathname}
              profile={profile}
              racha={racha}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Main panel ─── */}
      <div className="hub-main-panel hub-root">
        {/* Mobile top bar */}
        <div className="hub-mobile-bar">
          <button
            onClick={() => setMobileOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.80)", fontSize: 17, padding: 4, lineHeight: 1 }}
          >
            <i className="fa-solid fa-bars" />
          </button>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", flex: 1, letterSpacing: "-0.02em" }}>
            CEN Bachillerato
          </span>
          {racha > 0 && (
            <span style={{ fontSize: 13, fontWeight: 700, color: "#FB923C" }}>🔥 {racha}</span>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
