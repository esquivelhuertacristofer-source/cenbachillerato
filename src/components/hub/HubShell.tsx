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
  { href: "/hub",                       icon: "fa-house",       label: "Inicio",       exact: true  },
  { href: "/hub/recursos/laboratorios", icon: "fa-flask",       label: "Laboratorios", exact: false },
  { href: "/hub/recursos",              icon: "fa-layer-group", label: "Recursos",     exact: false },
  { href: "/hub/biblioteca",            icon: "fa-book-open",   label: "Biblioteca",   exact: false },
  { href: "/hub/progreso",              icon: "fa-chart-line",  label: "Progreso",     exact: false },
] as const;

/** Coincidencia por prefijo más largo: solo un item se ilumina aunque varias
 *  rutas compartan prefijo (p.ej. /hub/recursos vs /hub/recursos/laboratorios). */
function activeHrefFor(pathname: string): string | null {
  let best: string | null = null;
  for (const item of NAV_ITEMS) {
    const matches = item.exact ? pathname === item.href : pathname.startsWith(item.href);
    if (matches && (best === null || item.href.length > best.length)) {
      best = item.href;
    }
  }
  return best;
}

const SEMESTRES = [1, 2, 3, 4, 5, 6] as const;

/** Selector de semestre del sidebar (tema oscuro). La etiqueta refleja el
 *  semestre que se está viendo (deriva del pathname); el chip del semestre
 *  del propio alumno lleva un punto para no perder su identidad. El propio
 *  semestre lleva a /hub (con progreso); los demás a /hub/semestre/{s}. */
function SemestreSwitcher({
  pathname,
  semestreActual,
  onNavigate,
}: {
  pathname: string;
  semestreActual: number;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const match = pathname.match(/\/hub\/semestre\/(\d+)/);
  const viendo = match?.[1] ? parseInt(match[1], 10) : semestreActual;

  return (
    <div style={{ marginTop: 16 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Cambiar de semestre"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(56,189,248,0.10)",
          border: "1px solid rgba(56,189,248,0.20)",
          borderRadius: 999,
          padding: "5px 12px",
          fontSize: 11,
          fontWeight: 800,
          color: "#7DD3FC",
          letterSpacing: "0.06em",
          cursor: "pointer",
        }}
      >
        <i className="fa-solid fa-graduation-cap" style={{ fontSize: 9 }} />
        Semestre {viendo}
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"}`} style={{ fontSize: 8, marginLeft: 1, opacity: 0.7 }} />
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SEMESTRES.map((s) => {
              const activo = s === viendo;
              const propio = s === semestreActual;
              return (
                <Link
                  key={s}
                  href={propio ? "/hub" : `/hub/semestre/${s}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  aria-current={activo ? "page" : undefined}
                  title={propio ? "Tu semestre" : `Explorar ${s}.º semestre`}
                  style={{
                    position: "relative",
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 800,
                    textDecoration: "none",
                    background: activo ? "rgba(56,189,248,0.18)" : "rgba(255,255,255,0.04)",
                    border: activo ? "1px solid rgba(56,189,248,0.55)" : "1px solid rgba(255,255,255,0.08)",
                    color: activo ? "#7DD3FC" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {s}
                  {propio && (
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: 3,
                        right: 3,
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#FB923C",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
          <div style={{ marginTop: 7, fontSize: 9.5, color: "rgba(255,255,255,0.32)", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FB923C", flexShrink: 0 }} />
            Tu semestre · los demás son solo de exploración
          </div>
        </div>
      )}
    </div>
  );
}

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

  const activeHref = activeHrefFor(pathname);

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
          style={{ display: "block", textDecoration: "none" }}
        >
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            CEN Bachillerato
          </div>
        </Link>

        {/* Selector de semestre (antes era un pill estático) */}
        <SemestreSwitcher
          pathname={pathname}
          semestreActual={profile.semestre ?? 1}
          onNavigate={onClose}
        />
      </div>

      {/* ── Nav ─── */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = item.href === activeHref;
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
