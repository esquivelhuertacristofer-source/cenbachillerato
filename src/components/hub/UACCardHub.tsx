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

  // SVG progress ring
  const R = 22;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - pct / 100);

  return (
    <Link
      href={`/hub/uac/${codigo}`}
      style={{ textDecoration: "none", display: "block" }}
      className="hub-uac-card-link"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          borderRadius: 20,
          border: `1px solid rgba(11,37,69,0.10)`,
          background: "#fff",
          padding: "20px 20px 16px",
          boxShadow: "0 2px 8px rgba(11,37,69,0.06)",
          transition: "box-shadow 0.22s ease, border-color 0.22s ease, transform 0.22s ease",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
        className="hub-uac-card"
      >
        {/* Completed badge */}
        {isComplete && (
          <div style={{
            position: "absolute",
            top: 12,
            right: 12,
            borderRadius: 999,
            background: "#DCFCE7",
            border: "1px solid rgba(34,197,94,0.30)",
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 700,
            color: "#16A34A",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}>
            <i className="fa-solid fa-check" style={{ fontSize: 9 }} />
            ¡Completada!
          </div>
        )}

        {/* Top row: ring + icon */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 58, height: 58, flexShrink: 0 }}>
            {/* Icon circle */}
            <div style={{
              position: "absolute",
              inset: 8,
              borderRadius: "50%",
              background: `rgba(${color.rgba}, 0.12)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              color: color.hex,
            }}>
              <i className={`fa-solid ${color.faIcon}`} />
            </div>
            {/* SVG ring */}
            <svg
              width={58}
              height={58}
              viewBox="0 0 58 58"
              style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
            >
              <circle cx={29} cy={29} r={R} fill="none" stroke={`rgba(${color.rgba}, 0.14)`} strokeWidth={3.5} />
              {pct > 0 && (
                <circle
                  cx={29}
                  cy={29}
                  r={R}
                  fill="none"
                  stroke={color.hex}
                  strokeWidth={3.5}
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: color.hex, margin: "0 0 3px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {codigo}
            </p>
            <h3 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#0B2545",
              margin: 0,
              lineHeight: 1.35,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}>
              {nombre}
            </h3>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(11,37,69,0.07)",
          paddingTop: 12,
          gap: 8,
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0B2545", margin: 0 }}>
              {completadas} <span style={{ fontWeight: 400, color: "rgba(11,37,69,0.45)" }}>de {totalProgresiones}</span>
            </p>
            <p style={{ fontSize: 11, color: "rgba(11,37,69,0.40)", margin: 0, marginTop: 1 }}>
              {timeAgo(ultimaActividad)}
            </p>
          </div>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: color.hex,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}>
            {pct}%
            <i className="fa-solid fa-chevron-right" style={{ fontSize: 10, color: "rgba(11,37,69,0.25)" }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
