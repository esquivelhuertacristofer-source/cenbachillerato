import Link from "next/link";
import { getRSCColor } from "./hub-colors";

interface UACCardHubProps {
  codigo: string;
  nombre: string;
  rscCodigo: string;
  totalProgresiones: number;
  completadas: number;
  ultimaActividad: string | null;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Sin actividad aún";
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 2) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Ayer";
  if (diffD < 7) return `Hace ${diffD} días`;
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export function UACCardHub({
  codigo,
  nombre,
  rscCodigo,
  totalProgresiones,
  completadas,
  ultimaActividad,
}: UACCardHubProps) {
  const color = getRSCColor(rscCodigo);
  const pct = totalProgresiones > 0 ? Math.round((completadas / totalProgresiones) * 100) : 0;
  const isComplete = pct === 100 && totalProgresiones > 0;
  const hasActivity = completadas > 0;

  return (
    <Link
      href={`/hub/uac/${codigo}`}
      style={{ textDecoration: "none", display: "block" }}
      className="hub-uac-card-link"
    >
      <article
        style={{
          borderRadius: 24,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(11,37,69,0.07), 0 0 0 1px rgba(11,37,69,0.06)",
          transition: "box-shadow 0.28s ease, transform 0.28s ease",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
        }}
        className="hub-uac-card"
      >
        {/* ── Image / visual area ────────────────────────────────── */}
        <div
          style={{
            height: 196,
            background: color.gradient,
            position: "relative",
            overflow: "hidden",
          }}
          className="hub-uac-img-area"
        >
          {/* Decorative SVG geometry */}
          <svg
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            viewBox="0 0 340 196"
            preserveAspectRatio="xMidYMid slice"
          >
            <circle cx="300" cy="-18" r="110" fill={`rgba(${color.rgba}, 0.22)`} />
            <circle cx="-28" cy="180" r="88" fill={`rgba(${color.rgba}, 0.16)`} />
            <circle cx="170" cy="98" r="52" fill="rgba(255,255,255,0.04)" />
            <circle cx="54" cy="28" r="32" fill="rgba(255,255,255,0.05)" />
            <circle cx="290" cy="170" r="42" fill={`rgba(${color.rgba}, 0.12)`} />
          </svg>

          {/* Icon */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: 26,
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.22)",
                backdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 38,
                color: "#fff",
                boxShadow: "0 8px 32px rgba(0,0,0,0.28), 0 0 0 10px rgba(255,255,255,0.05)",
              }}
              className="hub-uac-icon"
            >
              <i className={`fa-solid ${color.faIcon}`} />
            </div>
          </div>

          {/* Code badge — top left */}
          <div style={{ position: "absolute", top: 14, left: 14 }}>
            <span style={{
              display: "inline-block",
              borderRadius: 999,
              background: "rgba(0,0,0,0.32)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.18)",
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.07em",
            }}>
              {codigo}
            </span>
          </div>

          {/* Status badge — top right */}
          <div style={{ position: "absolute", top: 14, right: 14 }}>
            {isComplete ? (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                borderRadius: 999,
                background: "#16A34A",
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.04em",
              }}>
                <i className="fa-solid fa-check" style={{ fontSize: 9 }} />
                Completada
              </span>
            ) : (
              <span style={{
                display: "inline-block",
                borderRadius: 999,
                background: "rgba(0,0,0,0.32)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.18)",
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 800,
                color: "#fff",
              }}>
                {pct}%
              </span>
            )}
          </div>

          {/* Progress bar — bottom of image */}
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 4,
            background: "rgba(0,0,0,0.20)",
          }}>
            {pct > 0 && (
              <div style={{
                height: "100%",
                width: `${pct}%`,
                background: color.hex,
                boxShadow: `0 0 8px rgba(${color.rgba}, 0.70)`,
                transition: "width 0.8s cubic-bezier(.22,1,.36,1)",
              }} />
            )}
          </div>
        </div>

        {/* ── Card body ──────────────────────────────────────────── */}
        <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Name */}
          <h3 style={{
            fontSize: 17,
            fontWeight: 800,
            color: "#0B2545",
            margin: 0,
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {nombre}
          </h3>

          {/* Footer */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0B2545", margin: 0, lineHeight: 1 }}>
                {completadas}
                <span style={{ fontWeight: 400, color: "rgba(11,37,69,0.40)", fontSize: 13 }}>
                  {" "}/ {totalProgresiones}
                </span>
              </p>
              <p style={{
                fontSize: 11,
                color: hasActivity ? `rgba(${color.rgba}, 0.85)` : "rgba(11,37,69,0.35)",
                margin: "4px 0 0",
                fontWeight: hasActivity ? 600 : 400,
              }}>
                {timeAgo(ultimaActividad)}
              </p>
            </div>

            {/* Arrow CTA */}
            <div style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: `rgba(${color.rgba}, 0.12)`,
              border: `1px solid rgba(${color.rgba}, 0.20)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color.hex,
              fontSize: 13,
              flexShrink: 0,
              transition: "background 0.2s, transform 0.2s",
            }}
              className="hub-uac-arrow"
            >
              <i className="fa-solid fa-arrow-right" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
