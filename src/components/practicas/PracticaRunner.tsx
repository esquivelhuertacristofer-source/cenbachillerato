"use client";

import Link from "next/link";
import type { AreaColor } from "@/components/hub/hub-colors";
import { getPractica } from "./registry";

interface PracticaRunnerProps {
  slug: string;
  color: AreaColor;
  /** Vuelve a la actividad de la que cuelga la práctica. */
  backHref: string;
  uacNombre: string;
  uacCodigo: string;
  progresionNum: number;
  ordenNum: number;
  actividadCodigo: string;
  actividadTitulo: string;
}

export function PracticaRunner({
  slug,
  color,
  backHref,
  uacNombre,
  uacCodigo,
  progresionNum,
  ordenNum,
  actividadCodigo,
  actividadTitulo,
}: PracticaRunnerProps) {
  const practica = getPractica(slug);

  return (
    <>
      <style>{`
        .prac-back:hover { color: #fff !important; transform: translateX(-3px); }
        @media (max-width: 640px) {
          .prac-hero { padding: 32px 20px 36px !important; }
          .prac-nav { padding: 14px 20px !important; }
          .prac-body { padding: 28px 20px 80px !important; }
          .prac-title { font-size: 26px !important; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: `radial-gradient(circle at 85% 0%, rgba(${color.rgba}, 0.07) 0%, transparent 42%),
                       radial-gradient(circle at 10% 100%, rgba(${color.rgba}, 0.04) 0%, transparent 35%),
                       #011126`,
          fontFamily: "var(--font-epilogue), 'Plus Jakarta Sans', sans-serif",
          color: "#fff",
        }}
      >
        {/* ── HERO BAND ─────────────────────────────────────────────── */}
        <div
          style={{
            background: `linear-gradient(180deg, rgba(${color.rgba}, 0.09) 0%, transparent 100%), #011C40`,
            borderBottom: `1px solid rgba(${color.rgba}, 0.14)`,
          }}
        >
          {/* Sticky nav */}
          <nav
            className="prac-nav"
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
              className="prac-back"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.45)",
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "all 0.25s ease",
              }}
            >
              <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} />
              Volver al ejercicio
            </Link>
            <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 14, fontWeight: 300 }}>·</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, overflow: "hidden", minWidth: 0 }}>
              <Link href="/hub" style={{ color: "rgba(255,255,255,0.28)", textDecoration: "none", whiteSpace: "nowrap" }}>Hub</Link>
              <span style={{ color: "rgba(255,255,255,0.16)" }}>/</span>
              <Link
                href={`/hub/uac/${uacCodigo}`}
                style={{ color: "rgba(255,255,255,0.28)", textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}
              >
                {uacNombre}
              </Link>
              <span style={{ color: "rgba(255,255,255,0.16)" }}>/</span>
              <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 700, whiteSpace: "nowrap" }}>P{progresionNum} · A{ordenNum} · Práctica</span>
            </div>
          </nav>

          {/* Hero content */}
          <div className="prac-hero" style={{ padding: "52px 48px 48px", maxWidth: 1560, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 28 }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 22,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  background: `rgba(${color.rgba}, 0.10)`,
                  border: `1.5px solid rgba(${color.rgba}, 0.22)`,
                  color: color.hex,
                  boxShadow: `0 0 40px rgba(${color.rgba}, 0.12), inset 0 1px 0 rgba(255,255,255,0.06)`,
                }}
              >
                <i className="fa-solid fa-flask-vial" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.22em",
                      color: color.hex,
                      padding: "5px 14px",
                      background: `rgba(${color.rgba}, 0.10)`,
                      border: `1px solid rgba(${color.rgba}, 0.22)`,
                      borderRadius: 999,
                    }}
                  >
                    <i className="fa-solid fa-flask-vial" style={{ marginRight: 6, fontSize: 9 }} />
                    Práctica experimental
                  </span>
                </div>

                <h1
                  className="prac-title"
                  style={{
                    fontSize: "clamp(26px, 3.2vw, 46px)",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.05,
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  {practica?.titulo ?? actividadTitulo}
                </h1>
                {practica?.descripcion && (
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: "12px 0 0", maxWidth: 640, lineHeight: 1.5 }}>
                    {practica.descripcion}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ──────────────────────────────────────────────────── */}
        <div className="prac-body" style={{ maxWidth: 1560, margin: "0 auto", padding: "44px 48px 100px" }}>
          {practica ? (
            <practica.Component
              color={color}
              actividadCodigo={actividadCodigo}
              actividadTitulo={actividadTitulo}
            />
          ) : (
            <div
              style={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                padding: "48px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 12,
              }}
            >
              <i className="fa-solid fa-flask-vial" style={{ fontSize: 40, color: "rgba(255,255,255,0.18)" }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>Práctica en construcción</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", margin: 0, maxWidth: 380 }}>
                El laboratorio «{slug}» aún no está registrado. Regístralo en
                src/components/practicas/registry.tsx.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
