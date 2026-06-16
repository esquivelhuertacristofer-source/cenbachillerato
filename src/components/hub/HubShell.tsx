"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, LayoutGroup } from "motion/react";
import type { ContinuarData } from "@/lib/queries/hub";
import { getRSCColor, getTipoConfig } from "./hub-colors";

interface ShellProfile {
  full_name: string | null;
  email: string | null;
  role: string;
  semestre?: number | null;
}

interface DiaRacha {
  fecha: string;
  activo: boolean;
}

interface HubShellProps {
  profile: ShellProfile;
  racha: number;
  ultimos7Dias: DiaRacha[];
  continuar: ContinuarData | null;
  children: React.ReactNode;
}

/** Inicial del día de la semana a partir de "YYYY-MM-DD".
 *  Se parsea con componentes locales (new Date(y, m-1, d)) para evitar el
 *  corrimiento de día que provoca interpretar la fecha como UTC. */
const DOW_INICIAL = ["D", "L", "M", "M", "J", "V", "S"] as const;
function inicialDia(fecha: string): string {
  const [y, m, d] = fecha.split("-").map(Number);
  if (!y || !m || !d) return "·";
  return DOW_INICIAL[new Date(y, m - 1, d).getDay()] ?? "·";
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

/** Tarjeta compacta de "seguir donde lo dejaste" — vive en el hueco entre
 *  el nav y la racha. Toma el color del RSC de la UAC para mantener identidad
 *  de área y enlaza directo a la actividad pendiente. */
function ContinuarSidebarCard({ data, onClose }: { data: ContinuarData; onClose?: () => void }) {
  const color = getRSCColor(data.uacRscCodigo);
  const tipo = getTipoConfig(data.actividadTipo);
  const total = data.totalActividades || 0;
  const hechas = data.actividadesCompletadas || 0;
  const pct = total > 0 ? Math.round((hechas / total) * 100) : 0;
  const href = `/hub/uac/${data.uacCodigo}/progresion/${data.progresionNumero}/actividad/${data.actividadOrden}`;

  return (
    <Link
      href={href}
      onClick={onClose}
      className="hub-continuar-card"
      style={{
        background: `linear-gradient(150deg, rgba(${color.rgba},0.16) 0%, rgba(255,255,255,0.03) 70%)`,
        border: `1px solid rgba(${color.rgba},0.28)`,
        padding: "12px 13px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{
          fontSize: 8.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em",
          color: color.hex,
        }}>
          Continúa
        </span>
        <span className="hub-continuar-go" style={{
          width: 22, height: 22, borderRadius: 7, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `rgba(${color.rgba},0.18)`, color: color.hex, fontSize: 10,
        }}>
          <i className="fa-solid fa-play" />
        </span>
      </div>

      <div style={{
        fontSize: 12.5, fontWeight: 800, color: "#fff", lineHeight: 1.25, marginTop: 7,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {data.actividadTitulo}
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginTop: 6,
        fontSize: 9.5, fontWeight: 600, color: "rgba(255,255,255,0.45)",
      }}>
        <i className={`fa-solid ${tipo.faIcon}`} style={{ fontSize: 9, color: tipo.color }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {data.uacNombre}
        </span>
      </div>

      {/* Barra de progreso de la progresión */}
      <div style={{ marginTop: 9 }}>
        <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: color.hex }} />
        </div>
        <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.40)", marginTop: 4 }}>
          {hechas}/{total} actividades · {pct}%
        </div>
      </div>
    </Link>
  );
}

function SidebarContent({
  pathname,
  profile,
  racha,
  ultimos7Dias,
  continuar,
  instanceId,
  onClose,
}: {
  pathname: string;
  profile: ShellProfile;
  racha: number;
  ultimos7Dias: DiaRacha[];
  continuar: ContinuarData | null;
  instanceId: string;
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
        <Link href="/hub" onClick={onClose} className="hub-brand">
          <span className="hub-brand-badge" aria-hidden>
            <i className="fa-solid fa-graduation-cap" />
          </span>
          <span>
            <span className="hub-brand-title" style={{ display: "block" }}>CEN Bachillerato</span>
            <span className="hub-brand-sub" style={{ display: "block" }}>Hub del alumno</span>
          </span>
        </Link>

        {/* Selector de semestre (antes era un pill estático) */}
        <SemestreSwitcher
          pathname={pathname}
          semestreActual={profile.semestre ?? 1}
          onNavigate={onClose}
        />
      </div>

      {/* ── Nav ─── */}
      <nav style={{ padding: "14px 10px 6px", display: "flex", flexDirection: "column", gap: 3 }}>
        <p className="hub-nav-section-label" style={{ margin: 0 }}>Navegación</p>
        <LayoutGroup id={`hub-nav-${instanceId}`}>
          {NAV_ITEMS.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`hub-nav-item${active ? " active" : ""}`}
              >
                {active && (
                  <motion.span
                    layoutId={`hub-nav-active-${instanceId}`}
                    className="hub-nav-active-bg"
                    transition={{ type: "spring", stiffness: 520, damping: 38 }}
                  />
                )}
                <span className="hub-nav-icon">
                  <i className={`fa-solid ${item.icon}`} />
                </span>
                <span className="hub-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </LayoutGroup>
      </nav>

      {/* ── Continuar (rellena el hueco central) ─── */}
      <div style={{ flex: 1, minHeight: 8, padding: "8px 10px", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
        {continuar ? <ContinuarSidebarCard data={continuar} onClose={onClose} /> : null}
      </div>

      {/* ── Racha (con semana L M M J V S D) ─── */}
      {(racha > 0 || ultimos7Dias.some((d) => d.activo)) && (
        <div style={{
          margin: "0 10px 8px",
          borderRadius: 14,
          background: "linear-gradient(135deg, rgba(251,146,60,0.16) 0%, rgba(251,146,60,0.05) 100%)",
          border: "1px solid rgba(251,146,60,0.22)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
          padding: "11px 13px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, lineHeight: 1,
              background: "rgba(251,146,60,0.16)",
              border: "1px solid rgba(251,146,60,0.28)",
            }}>🔥</span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#FB923C", lineHeight: 1, letterSpacing: "-0.02em" }}>
                {racha} <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(251,146,60,0.75)" }}>{racha === 1 ? "día" : "días"}</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", fontWeight: 600, marginTop: 3 }}>
                de racha · ¡sigue así!
              </div>
            </div>
          </div>

          {/* Semana: un punto por día, el último es hoy */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 4, marginTop: 11 }}>
            {ultimos7Dias.map((dia, i) => {
              const hoy = i === ultimos7Dias.length - 1;
              return (
                <div key={dia.fecha} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                  <span style={{
                    fontSize: 8.5, fontWeight: 800, letterSpacing: "0.02em",
                    color: dia.activo ? "rgba(251,146,60,0.85)" : "rgba(255,255,255,0.28)",
                  }}>
                    {inicialDia(dia.fecha)}
                  </span>
                  <span
                    title={dia.activo ? "Activo" : "Sin actividad"}
                    style={{
                      width: 9, height: 9, borderRadius: "50%",
                      background: dia.activo ? "#FB923C" : "rgba(255,255,255,0.10)",
                      boxShadow: dia.activo ? "0 0 8px rgba(251,146,60,0.55)" : "none",
                      outline: hoy ? "2px solid rgba(251,146,60,0.45)" : "none",
                      outlineOffset: 1.5,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Profile + logout ─── */}
      <div style={{ padding: "10px 10px 18px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 12,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, #7DD3FC, #38BDF8, #0EA5E9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#011C40",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(56,189,248,0.30), inset 0 1px 0 rgba(255,255,255,0.4)",
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

export function HubShell({ profile, racha, ultimos7Dias, continuar, children }: HubShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Desktop sidebar ─── */}
      <div className="hub-sidebar-panel">
        <SidebarContent
          pathname={pathname}
          profile={profile}
          racha={racha}
          ultimos7Dias={ultimos7Dias}
          continuar={continuar}
          instanceId="desktop"
        />
      </div>

      {/* ── Mobile drawer ─── */}
      {mobileOpen && (
        <div className="hub-drawer-overlay" onClick={() => setMobileOpen(false)}>
          <div className="hub-drawer" onClick={(e) => e.stopPropagation()}>
            <SidebarContent
              pathname={pathname}
              profile={profile}
              racha={racha}
              ultimos7Dias={ultimos7Dias}
              continuar={continuar}
              instanceId="mobile"
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
