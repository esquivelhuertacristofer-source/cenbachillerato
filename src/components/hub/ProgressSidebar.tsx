import type { ProgresoSemestre, RachaData } from "@/lib/queries/hub";

interface ProgressSidebarProps {
  progreso: ProgresoSemestre;
  racha: RachaData;
  semestre: number;
}

const DAY_LABELS = ["D", "L", "M", "X", "J", "V", "S"];

function getDonutPath(pct: number): string {
  const R = 40;
  const cx = 52, cy = 52;
  const angle = (pct / 100) * 2 * Math.PI;
  const x1 = cx + R * Math.cos(-Math.PI / 2);
  const y1 = cy + R * Math.sin(-Math.PI / 2);
  const x2 = cx + R * Math.cos(angle - Math.PI / 2);
  const y2 = cy + R * Math.sin(angle - Math.PI / 2);
  const large = angle > Math.PI ? 1 : 0;
  if (pct >= 100) {
    // Full circle: two arcs
    return `M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - 0.001} ${cy - R}`;
  }
  if (pct <= 0) return "";
  return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
}

export function ProgressSidebar({ progreso, racha, semestre }: ProgressSidebarProps) {
  const { totalProgresiones, progresionesCompletadas, actividadesEstaSemana, minutosEstaSemana, porcentaje } = progreso;
  const { diasConsecutivos, ultimos7Dias } = racha;
  const R = 40;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - porcentaje / 100);

  return (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
      }}
    >
      {/* 4.1 Mi progreso */}
      <div style={{
        borderRadius: 20,
        border: "1px solid rgba(11,37,69,0.10)",
        background: "#fff",
        padding: "20px 20px 22px",
        boxShadow: "0 2px 8px rgba(11,37,69,0.06)",
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#1E40AF", margin: "0 0 16px" }}>
          Mi progreso
        </p>

        {/* Donut ring */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg width={104} height={104} viewBox="0 0 104 104" style={{ transform: "rotate(-90deg)" }}>
              <circle cx={52} cy={52} r={R} fill="none" stroke="rgba(11,37,69,0.07)" strokeWidth={8} />
              {porcentaje > 0 && (
                <circle
                  cx={52}
                  cy={52}
                  r={R}
                  fill="none"
                  stroke="#1E40AF"
                  strokeWidth={8}
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              )}
            </svg>
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#0B2545", lineHeight: 1 }}>
                {porcentaje}%
              </span>
              <span style={{ fontSize: 10, color: "rgba(11,37,69,0.45)", fontWeight: 600 }}>
                Sem. {semestre}
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#0B2545", margin: 0, lineHeight: 1 }}>
                {progresionesCompletadas}
                <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(11,37,69,0.45)" }}>/{totalProgresiones}</span>
              </p>
              <p style={{ fontSize: 12, color: "rgba(11,37,69,0.50)", margin: 0 }}>progresiones</p>
            </div>
            <div style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}>
              <Metrica valor={actividadesEstaSemana} label="esta semana" />
              <Metrica valor={`${minutosEstaSemana}m`} label="dedicados" />
            </div>
          </div>
        </div>
      </div>

      {/* 4.2 Racha */}
      <div style={{
        borderRadius: 20,
        border: "1px solid rgba(11,37,69,0.10)",
        background: "#fff",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(11,37,69,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#1E40AF", margin: 0 }}>
            Racha
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#FB923C", letterSpacing: "-0.02em" }}>
              {diasConsecutivos}
            </span>
          </div>
        </div>

        <p style={{ fontSize: 12, color: "rgba(11,37,69,0.55)", margin: "0 0 12px" }}>
          {diasConsecutivos === 0
            ? "Empezá hoy y construí tu racha 💪"
            : diasConsecutivos === 1
              ? "¡Llevas 1 día seguido!"
              : `Llevas ${diasConsecutivos} días seguidos`}
        </p>

        {/* Mini calendar */}
        <div style={{ display: "flex", gap: 4 }}>
          {ultimos7Dias.map((day, i) => {
            const d = new Date(day.fecha + "T12:00:00");
            const dow = d.getDay();
            return (
              <div
                key={day.fecha}
                title={day.fecha}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 10, color: "rgba(11,37,69,0.35)", fontWeight: 600 }}>
                  {DAY_LABELS[dow]}
                </span>
                <div style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: 6,
                  background: day.activo ? "#1E40AF" : "rgba(11,37,69,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}>
                  {day.activo && (
                    <i className="fa-solid fa-check" style={{ fontSize: 8, color: "#fff" }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4.3 Logros */}
      <div style={{
        borderRadius: 20,
        border: "1px solid rgba(11,37,69,0.10)",
        background: "#fff",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(11,37,69,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#1E40AF", margin: 0 }}>
            Logros
          </p>
          {/* TODO: Link to /hub/logros when implemented */}
          <span style={{ fontSize: 12, color: "rgba(11,37,69,0.35)", cursor: "not-allowed" }}>
            Ver todos
          </span>
        </div>

        {/* TODO: Query logros table when available */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "16px 0",
          gap: 8,
        }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: "50%",
            background: "rgba(251,191,36,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}>
            🏆
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0B2545", margin: 0 }}>
            Sin logros todavía
          </p>
          <p style={{ fontSize: 12, color: "rgba(11,37,69,0.50)", margin: 0, lineHeight: 1.5 }}>
            Completá actividades y desbloqueá tus primeros logros.
          </p>
        </div>
      </div>
    </aside>
  );
}

function Metrica({ valor, label }: { valor: string | number; label: string }) {
  return (
    <div style={{
      borderRadius: 10,
      background: "#F8FAFC",
      border: "1px solid rgba(11,37,69,0.08)",
      padding: "6px 10px",
    }}>
      <p style={{ fontSize: 15, fontWeight: 800, color: "#0B2545", margin: 0, lineHeight: 1 }}>{valor}</p>
      <p style={{ fontSize: 10, color: "rgba(11,37,69,0.45)", margin: 0, marginTop: 1 }}>{label}</p>
    </div>
  );
}
