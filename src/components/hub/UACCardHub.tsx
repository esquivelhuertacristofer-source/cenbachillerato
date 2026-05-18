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

  // Unique ID for SVG defs to avoid DOM collisions
  const patternId = `dots-${codigo}`;
  const glowId = `glow-${codigo}`;

  return (
    <Link
      href={`/hub/uac/${codigo}`}
      style={{
        textDecoration: "none",
        display: "block",
        // CSS vars for color-matched glow in CSS
        "--hub-card-hex": color.hex,
        "--hub-card-rgba": `rgba(${color.rgba}, 0.28)`,
        "--hub-card-rgba-soft": `rgba(${color.rgba}, 0.12)`,
      } as React.CSSProperties}
      className="hub-uac-card-link"
    >
      <article
        className="hub-uac-card"
        style={{
          borderRadius: 22,
          overflow: "hidden",
          background: "#fff",
          boxShadow:
            "0 1px 3px rgba(11,37,69,0.07), 0 4px 16px rgba(11,37,69,0.05), 0 0 0 1px rgba(11,37,69,0.055)",
          transition: "box-shadow 0.32s cubic-bezier(.22,1,.36,1), transform 0.32s cubic-bezier(.22,1,.36,1)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* ── Shine overlay (sweeps on hover via CSS) ─────── */}
        <div className="hub-uac-shine" aria-hidden="true" style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          pointerEvents: "none",
          background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.13) 50%, transparent 65%)",
          transform: "translateX(-150%) skewX(-15deg)",
        }} />

        {/* ── Image / cover area ──────────────────────────── */}
        <div
          className="hub-uac-img-area"
          style={{
            height: 210,
            background: color.gradient,
            position: "relative",
            overflow: "hidden",
            transition: "filter 0.32s ease",
          }}
        >
          {/* SVG: dot pattern + geometric decoration + radial glow */}
          <svg
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            viewBox="0 0 340 210"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id={patternId} x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="2.5" cy="2.5" r="1.8" fill="rgba(255,255,255,0.13)" />
              </pattern>
              <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={`rgba(${color.rgba}, 0.30)`} />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Dot grid texture */}
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />

            {/* Center glow */}
            <ellipse cx="170" cy="105" rx="100" ry="80" fill={`url(#${glowId})`} />

            {/* Decorative circles */}
            <circle cx="310" cy="-15" r="100" fill={`rgba(${color.rgba}, 0.20)`} />
            <circle cx="-18" cy="195" r="80" fill={`rgba(${color.rgba}, 0.15)`} />
            <circle cx="52" cy="24" r="28" fill="rgba(255,255,255,0.06)" />
            <circle cx="288" cy="185" r="38" fill={`rgba(${color.rgba}, 0.12)`} />

            {/* Diagonal arc */}
            <path
              d="M -20 180 Q 160 60 360 140"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>

          {/* Icon with pulsing glow ring */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* Outer pulse ring */}
            <div
              className="hub-uac-pulse-ring"
              style={{
                position: "absolute",
                width: 118,
                height: 118,
                borderRadius: "50%",
                border: `1.5px solid rgba(${color.rgba}, 0.22)`,
                opacity: 0,
                transition: "opacity 0.3s ease",
              }}
            />
            {/* Inner ring */}
            <div style={{
              position: "absolute",
              width: 100,
              height: 100,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.10)",
            }} />

            {/* Icon */}
            <div
              className="hub-uac-icon"
              style={{
                width: 80, height: 80,
                borderRadius: 24,
                background: "rgba(255,255,255,0.13)",
                border: "1.5px solid rgba(255,255,255,0.24)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 34,
                color: "#fff",
                boxShadow: `0 8px 32px rgba(0,0,0,0.28), 0 0 0 8px rgba(255,255,255,0.06), 0 0 40px rgba(${color.rgba}, 0.25)`,
                transition: "transform 0.32s cubic-bezier(.22,1,.36,1), box-shadow 0.32s ease",
                position: "relative",
                zIndex: 1,
              }}
            >
              <i className={`fa-solid ${color.faIcon}`} />
            </div>
          </div>

          {/* Code badge — top left */}
          <div style={{ position: "absolute", top: 14, left: 14, zIndex: 2 }}>
            <span style={{
              display: "inline-block",
              borderRadius: 999,
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.18)",
              padding: "4px 12px",
              fontSize: 10,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "0.10em",
            }}>
              {codigo}
            </span>
          </div>

          {/* Status badge — top right */}
          <div style={{ position: "absolute", top: 14, right: 14, zIndex: 2 }}>
            {isComplete ? (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                borderRadius: 999, background: "#16A34A",
                padding: "4px 12px", fontSize: 10, fontWeight: 800, color: "#fff",
              }}>
                <i className="fa-solid fa-check" style={{ fontSize: 8 }} />
                100%
              </span>
            ) : (
              <span style={{
                display: "inline-block",
                borderRadius: 999,
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.18)",
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 900,
                color: "#fff",
              }}>
                {pct}%
              </span>
            )}
          </div>

          {/* Progress bar — image bottom */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "rgba(0,0,0,0.25)", zIndex: 2 }}>
            {pct > 0 && (
              <div style={{
                height: "100%",
                width: `${pct}%`,
                background: `rgba(${color.rgba}, 0.90)`,
                boxShadow: `0 0 10px rgba(${color.rgba}, 0.80)`,
                transition: "width 1s cubic-bezier(.22,1,.36,1)",
              }} />
            )}
          </div>
        </div>

        {/* ── Card body ──────────────────────────────────────── */}
        <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Title */}
          <h3 style={{
            fontSize: 17,
            fontWeight: 800,
            color: "#0B2545",
            margin: 0,
            lineHeight: 1.3,
            letterSpacing: "-0.025em",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {nombre}
          </h3>

          {/* Mini progress bar */}
          <div style={{ height: 5, borderRadius: 999, background: "rgba(11,37,69,0.07)", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${color.hex}, rgba(${color.rgba}, 0.75))`,
              transition: "width 1s cubic-bezier(.22,1,.36,1)",
            }} />
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#0B2545", margin: 0, lineHeight: 1 }}>
                {completadas}
                <span style={{ fontWeight: 400, color: "rgba(11,37,69,0.38)", fontSize: 13 }}>
                  {" "}/ {totalProgresiones}
                </span>
              </p>
              <p style={{
                fontSize: 11, margin: "5px 0 0",
                color: hasActivity ? color.hex : "rgba(11,37,69,0.32)",
                fontWeight: hasActivity ? 600 : 400,
              }}>
                {timeAgo(ultimaActividad)}
              </p>
            </div>

            <div
              className="hub-uac-arrow"
              style={{
                width: 38, height: 38,
                borderRadius: "50%",
                background: `rgba(${color.rgba}, 0.10)`,
                border: `1.5px solid rgba(${color.rgba}, 0.22)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: color.hex,
                fontSize: 13,
                flexShrink: 0,
                transition: "all 0.28s cubic-bezier(.22,1,.36,1)",
              }}
            >
              <i className="fa-solid fa-arrow-right" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
