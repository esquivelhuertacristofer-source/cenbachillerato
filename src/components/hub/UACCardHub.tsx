import Link from "next/link";
import { getRSCColor } from "./hub-colors";

interface UACCardHubProps {
  codigo: string;
  nombre: string;
  rscCodigo: string;
  totalProgresiones: number;
  completadas: number;
  ultimaActividad: string | null;
  semestre: number;
  /** Optional image URL — when provided, shown as card background */
  imageUrl?: string | null;
}

const DESCRIPCIONES: Record<string, string> = {
  "LC-I":    "Desarrolla competencia lectora y comunicación en contextos reales, literarios y académicos.",
  "PM-I":    "Construye pensamiento matemático para resolver situaciones cotidianas con lógica y precisión.",
  "IN-I":    "Adquiere habilidades comunicativas en inglés como herramienta de conexión global.",
  "CD-I":    "Explora el pensamiento computacional, la ciudadanía digital y las herramientas tecnológicas.",
  "CS-I":    "Analiza fenómenos sociales, históricos y culturales para comprender el mundo contemporáneo.",
  "PFH-I":   "Reflexiona sobre valores, identidad personal y el sentido ético de la vida en comunidad.",
  "CNEYT-I": "Comprende los fenómenos naturales mediante el pensamiento científico y la experimentación.",
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return null as unknown as string;
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
  semestre,
  imageUrl,
}: UACCardHubProps) {
  const color = getRSCColor(rscCodigo);
  const pct = totalProgresiones > 0 ? Math.round((completadas / totalProgresiones) * 100) : 0;
  const isComplete = pct === 100 && totalProgresiones > 0;
  const descripcion = DESCRIPCIONES[codigo] ?? "";
  const lastActivity = timeAgo(ultimaActividad);
  const patternId = `p-${codigo}`;

  return (
    <Link
      href={`/hub/uac/${codigo}`}
      style={{
        textDecoration: "none",
        display: "block",
        "--hub-card-hex": color.hex,
        "--hub-card-rgba": `rgba(${color.rgba}, 0.35)`,
      } as React.CSSProperties}
      className="hub-uac-card-link"
    >
      <article
        className="hub-uac-card"
        style={{
          borderRadius: 20,
          overflow: "hidden",
          position: "relative",
          height: 300,
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)",
          transition:
            "box-shadow 0.34s cubic-bezier(.22,1,.36,1), transform 0.34s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* ── Background: real image or RSC gradient ─── */}
        <div
          className="hub-uac-img-area"
          style={{
            position: "absolute",
            inset: 0,
            background: imageUrl ? undefined : color.gradient,
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "transform 0.50s cubic-bezier(.22,1,.36,1)",
          }}
        >
          {/* SVG decorations (only shown when no real image) */}
          {!imageUrl && (
            <svg
              aria-hidden="true"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
              viewBox="0 0 440 300"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <pattern id={patternId} x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
                  <circle cx="2.5" cy="2.5" r="1.6" fill="rgba(255,255,255,0.11)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
              {/* Big decorative circles (right side "image area") */}
              <circle cx="380" cy="-30" r="160" fill={`rgba(${color.rgba}, 0.22)`} />
              <circle cx="420" cy="330" r="130" fill={`rgba(${color.rgba}, 0.16)`} />
              <circle cx="300" cy="150" r="70"  fill="rgba(255,255,255,0.05)" />
              <circle cx="250" cy="60"  r="40"  fill={`rgba(${color.rgba}, 0.12)`} />
              <path d="M 200 280 Q 340 100 480 180" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" fill="none" />
            </svg>
          )}
        </div>

        {/* ── Gradient overlays for text legibility ─── */}
        {/* Left-to-right: dark left, transparent right */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background:
            "linear-gradient(to right, rgba(6,14,32,0.94) 0%, rgba(6,14,32,0.80) 38%, rgba(6,14,32,0.30) 64%, transparent 100%)",
        }} />
        {/* Bottom-to-top: darken bottom for CTA */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background:
            "linear-gradient(to top, rgba(6,14,32,0.90) 0%, rgba(6,14,32,0.40) 40%, transparent 70%)",
        }} />

        {/* ── Large decorative icon (right side visual) ─── */}
        <div style={{
          position: "absolute",
          right: 24,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          pointerEvents: "none",
          opacity: 0.22,
          fontSize: 120,
          color: "#fff",
          lineHeight: 1,
          userSelect: "none",
          transition: "opacity 0.34s ease, transform 0.50s cubic-bezier(.22,1,.36,1)",
        }}
          className="hub-uac-bg-icon"
        >
          <i className={`fa-solid ${color.faIcon}`} />
        </div>

        {/* ── Shine sweep ─── */}
        <div
          className="hub-uac-shine"
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none",
            background:
              "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.11) 50%, transparent 65%)",
            transform: "translateX(-150%) skewX(-12deg)",
          }}
        />

        {/* ── Content ─── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 3,
          padding: "20px 24px 22px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          {/* TOP: code badge + semester */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              borderRadius: 999,
              background: color.hex,
              padding: "4px 12px",
              fontSize: 10,
              fontWeight: 800,
              color: "#0B2545",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
            }}>
              {codigo}
            </span>
            <span style={{
              borderRadius: 999,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.16)",
              padding: "4px 10px",
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.65)",
            }}>
              Semestre {semestre}
            </span>
          </div>

          {/* BOTTOM: main content */}
          <div>
            {/* Completion badge */}
            {isComplete && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                borderRadius: 999,
                background: "rgba(22,163,74,0.25)",
                border: "1px solid rgba(34,197,94,0.40)",
                padding: "3px 10px",
                fontSize: 10,
                fontWeight: 700,
                color: "#4ADE80",
                marginBottom: 8,
              }}>
                <i className="fa-solid fa-check" style={{ fontSize: 8 }} />
                Completada
              </div>
            )}

            {/* UAC name */}
            <h3 style={{
              fontSize: "clamp(18px, 2.2vw, 22px)",
              fontWeight: 900,
              color: "#fff",
              margin: "0 0 6px",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              textShadow: "0 2px 12px rgba(0,0,0,0.50)",
              maxWidth: "70%",
            }}>
              {nombre}
            </h3>

            {/* Description */}
            <p style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.58)",
              margin: "0 0 14px",
              lineHeight: 1.60,
              maxWidth: "65%",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}>
              {descripcion}
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>{completadas}</span>
                {" "}/ {totalProgresiones} progresiones
              </span>
              {lastActivity && (
                <>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{lastActivity}</span>
                </>
              )}
            </div>

            {/* Progress bar + CTA row */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Acceder button */}
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                borderRadius: 999,
                background: color.hex,
                color: "#0B2545",
                padding: "9px 20px",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "-0.01em",
                boxShadow: `0 6px 20px rgba(${color.rgba}, 0.45)`,
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
              }}
                className="hub-uac-cta"
              >
                {completadas === 0 ? "Comenzar" : "Continuar"}
                <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
              </span>

              {/* Pct pill */}
              <span style={{
                fontSize: 13,
                fontWeight: 800,
                color: pct > 0 ? color.hex : "rgba(255,255,255,0.30)",
                letterSpacing: "-0.01em",
              }}>
                {pct}%
              </span>
            </div>
          </div>
        </div>

        {/* ── Bottom progress strip ─── */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: 3, background: "rgba(255,255,255,0.08)", zIndex: 4,
        }}>
          {pct > 0 && (
            <div style={{
              height: "100%",
              width: `${pct}%`,
              background: color.hex,
              boxShadow: `0 0 8px rgba(${color.rgba}, 0.80)`,
            }} />
          )}
        </div>
      </article>
    </Link>
  );
}
