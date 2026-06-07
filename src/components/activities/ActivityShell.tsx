"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { AreaColor } from "@/components/hub/hub-colors";
import { getTipoConfig } from "@/components/hub/hub-colors";
import type { ActividadConEstado } from "@/lib/queries/hub";

const PHASE_LABELS = ["Activación", "Práctica", "Aplicación"];

export interface ActivityShellProps {
  titulo: string;
  tipo: string;
  xp: number;
  color: AreaColor;
  estado: "no_iniciada" | "en_progreso" | "completada";
  backHref: string;
  uacNombre: string;
  uacCodigo: string;
  progresionNum: number;
  ordenNum: number;
  phaseLabel: string;
  actividadesProg: ActividadConEstado[];
  children: ReactNode;
  nivel_revision?: string | null;
  /** Si la actividad tiene práctica experimental, URL a su sección. */
  practicaHref?: string | null;
}

export function ActivityShell({
  titulo,
  tipo,
  xp,
  color,
  estado,
  backHref,
  uacNombre,
  uacCodigo,
  progresionNum,
  ordenNum,
  phaseLabel,
  actividadesProg,
  children,
  nivel_revision,
  practicaHref,
}: ActivityShellProps) {
  const tc = getTipoConfig(tipo);
  const isCompleta = estado === "completada";
  const isBorrador = nivel_revision === "borrador";

  return (
    <>
      <style>{`
        .ash-back:hover { color: #fff !important; transform: translateX(-3px); }
        .ash-practica:hover { filter: brightness(1.18); transform: translateY(-1px); }
        .ash-sidebar-link:hover { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.12) !important; }
        @media (max-width: 1023px) {
          .ash-sidebar { display: none !important; }
        }
        @media (max-width: 640px) {
          .ash-hero { padding: 32px 20px 36px !important; }
          .ash-nav { padding: 14px 20px !important; }
          .ash-body { padding: 28px 20px 80px !important; }
          .ash-title { font-size: 26px !important; }
          .ash-icon { width: 56px !important; height: 56px !important; font-size: 24px !important; border-radius: 16px !important; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at 85% 0%, rgba(${color.rgba}, 0.07) 0%, transparent 42%),
                     radial-gradient(circle at 10% 100%, rgba(${color.rgba}, 0.04) 0%, transparent 35%),
                     #011126`,
        fontFamily: "var(--font-epilogue), 'Plus Jakarta Sans', sans-serif",
        color: "#fff",
      }}>

        {/* ── HERO BAND ─────────────────────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(180deg, rgba(${color.rgba}, 0.09) 0%, transparent 100%), #011C40`,
          borderBottom: `1px solid rgba(${color.rgba}, 0.14)`,
        }}>

          {/* Sticky nav */}
          <nav
            className="ash-nav"
            style={{
              padding: "18px 48px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              position: "sticky",
              top: 0,
              zIndex: 100,
              background: "rgba(1,17,38,0.90)",
              backdropFilter: "blur(24px)",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Link
              href={backHref}
              className="ash-back"
              style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)",
                textDecoration: "none", whiteSpace: "nowrap",
                transition: "all 0.25s ease",
              }}
            >
              <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} />
              Propósito formativo {progresionNum}
            </Link>
            <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 14, fontWeight: 300 }}>·</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 11, overflow: "hidden", minWidth: 0,
            }}>
              <Link href="/hub" style={{ color: "rgba(255,255,255,0.28)", textDecoration: "none", whiteSpace: "nowrap" }}>Hub</Link>
              <span style={{ color: "rgba(255,255,255,0.16)" }}>/</span>
              <Link
                href={`/hub/uac/${uacCodigo}`}
                style={{
                  color: "rgba(255,255,255,0.28)", textDecoration: "none",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140,
                }}
              >
                {uacNombre}
              </Link>
              <span style={{ color: "rgba(255,255,255,0.16)" }}>/</span>
              <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 700 }}>A{ordenNum} · {phaseLabel}</span>
            </div>
          </nav>

          {/* Hero content */}
          <div
            className="ash-hero"
            style={{ padding: "52px 48px 48px", maxWidth: 1200, margin: "0 auto" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 28 }}>

              {/* Type icon */}
              <div
                className="ash-icon"
                style={{
                  width: 80, height: 80, borderRadius: 22, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32,
                  background: `rgba(${color.rgba}, 0.10)`,
                  border: `1.5px solid rgba(${color.rgba}, 0.22)`,
                  color: color.hex,
                  boxShadow: `0 0 40px rgba(${color.rgba}, 0.12), inset 0 1px 0 rgba(255,255,255,0.06)`,
                }}
              >
                <i className={`fa-solid ${tc.faIcon}`} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.22em",
                    color: color.hex, padding: "5px 14px",
                    background: `rgba(${color.rgba}, 0.10)`,
                    border: `1px solid rgba(${color.rgba}, 0.22)`,
                    borderRadius: 999,
                  }}>
                    A{ordenNum} · {phaseLabel}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em",
                    color: "rgba(255,255,255,0.40)", padding: "5px 14px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 999,
                  }}>
                    <i className={`fa-solid ${tc.faIcon}`} style={{ marginRight: 6, fontSize: 9 }} />
                    {tc.label}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.10em",
                    color: "rgba(255,255,255,0.40)", padding: "5px 14px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 999,
                  }}>
                    +{xp} XP
                  </span>
                  {isCompleta && (
                    <span style={{
                      fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em",
                      color: "#4ADE80", padding: "5px 14px",
                      background: "rgba(74,222,128,0.10)",
                      border: "1px solid rgba(74,222,128,0.22)",
                      borderRadius: 999,
                    }}>
                      <i className="fa-solid fa-check" style={{ marginRight: 5 }} />
                      Completada
                    </span>
                  )}
                  {isBorrador && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.10em",
                      color: "#CA8A04", padding: "5px 14px",
                      background: "rgba(202,138,4,0.10)",
                      border: "1px solid rgba(202,138,4,0.25)",
                      borderRadius: 999,
                    }}>
                      <i className="fa-solid fa-pen-ruler" style={{ marginRight: 5, fontSize: 9 }} />
                      En revisión pedagógica
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1
                  className="ash-title"
                  style={{
                    fontSize: "clamp(26px, 3.2vw, 46px)",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.05,
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  {titulo}
                </h1>

                {/* Botón a la práctica experimental (solo si la actividad la tiene) */}
                {practicaHref && (
                  <Link
                    href={practicaHref}
                    className="ash-practica"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 22,
                      padding: "12px 20px",
                      borderRadius: 14,
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: "0.02em",
                      color: color.hex,
                      textDecoration: "none",
                      background: `rgba(${color.rgba}, 0.12)`,
                      border: `1.5px solid rgba(${color.rgba}, 0.30)`,
                      boxShadow: `0 0 30px rgba(${color.rgba}, 0.10)`,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <i className="fa-solid fa-flask-vial" style={{ fontSize: 14 }} />
                    Práctica experimental
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: 11, opacity: 0.7 }} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY: content + sidebar ───────────────────────────────────── */}
        <div
          className="ash-body"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "44px 48px 100px",
            display: "flex",
            gap: 48,
            alignItems: "flex-start",
          }}
        >
          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {children}
          </div>

          {/* Sidebar */}
          {actividadesProg.length > 0 && (
            <aside
              className="ash-sidebar"
              style={{
                width: 248,
                flexShrink: 0,
                position: "sticky",
                top: 68,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{
                fontSize: 9, fontWeight: 900, textTransform: "uppercase",
                letterSpacing: "0.35em", color: "rgba(255,255,255,0.25)",
                marginBottom: 8, paddingLeft: 4,
              }}>
                En esta progresión
              </div>

              {actividadesProg.map((act, i) => {
                const isActive = act.orden === ordenNum;
                const isDone = act.estado === "completada";
                const tc2 = getTipoConfig(act.tipo);
                const pl = PHASE_LABELS[i] ?? `A${act.orden}`;
                return (
                  <Link
                    key={act.id}
                    href={`/hub/uac/${uacCodigo}/progresion/${progresionNum}/actividad/${act.orden}`}
                    className="ash-sidebar-link"
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px",
                      borderRadius: 14,
                      textDecoration: "none",
                      background: isActive
                        ? `rgba(${color.rgba}, 0.10)`
                        : "rgba(255,255,255,0.03)",
                      border: isActive
                        ? `1.5px solid rgba(${color.rgba}, 0.25)`
                        : "1px solid rgba(255,255,255,0.06)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13,
                      background: isDone
                        ? "rgba(74,222,128,0.12)"
                        : isActive
                          ? `rgba(${color.rgba}, 0.12)`
                          : "rgba(255,255,255,0.05)",
                      color: isDone ? "#4ADE80" : isActive ? color.hex : "rgba(255,255,255,0.35)",
                    }}>
                      {isDone
                        ? <i className="fa-solid fa-check" />
                        : <i className={`fa-solid ${tc2.faIcon}`} />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 9, fontWeight: 800, textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: isActive ? color.hex : "rgba(255,255,255,0.28)",
                        marginBottom: 3,
                      }}>
                        A{act.orden} · {pl}
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 600, lineHeight: 1.3,
                        color: isActive ? "#fff" : isDone ? "rgba(255,255,255,0.60)" : "rgba(255,255,255,0.48)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {act.titulo}
                      </div>
                    </div>
                    {isDone && (
                      <i className="fa-solid fa-circle-check" style={{ fontSize: 12, color: "#4ADE80", flexShrink: 0 }} />
                    )}
                  </Link>
                );
              })}

              <Link
                href={backHref}
                className="ash-sidebar-link"
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  marginTop: 10, padding: "10px 14px",
                  borderRadius: 12, fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.10em",
                  color: "rgba(255,255,255,0.32)", textDecoration: "none",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transition: "all 0.2s ease",
                }}
              >
                <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} />
                Ver progresión
              </Link>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
