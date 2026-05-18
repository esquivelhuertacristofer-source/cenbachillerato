import type { ProgresoSemestre, RachaData } from "@/lib/queries/hub";

interface ProgressSidebarProps {
  progreso: ProgresoSemestre;
  racha: RachaData;
  semestre: number;
}

const DAY_LABELS = ["D", "L", "M", "X", "J", "V", "S"];

export function ProgressSidebar({ progreso, racha, semestre }: ProgressSidebarProps) {
  const { totalProgresiones, progresionesCompletadas, actividadesEstaSemana, minutosEstaSemana, porcentaje } = progreso;
  const { diasConsecutivos, ultimos7Dias } = racha;

  const R = 44;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - porcentaje / 100);

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>

      {/* ── Mi Progreso ───────────────────────────────────────── */}
      <div style={{
        borderRadius: 24,
        background: "linear-gradient(145deg, #0B2545 0%, #0E2D60 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "24px",
        boxShadow: "0 8px 32px rgba(11,37,69,0.20)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative */}
        <div style={{
          position: "absolute", top: -30, right: -30,
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(125,211,252,0.06)",
          pointerEvents: "none",
        }} />

        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.14em", color: "#7DD3FC", margin: "0 0 20px",
        }}>
          Mi progreso · Sem. {semestre}
        </p>

        {/* Donut + stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Donut */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg width={108} height={108} viewBox="0 0 108 108" style={{ transform: "rotate(-90deg)" }}>
              {/* Track */}
              <circle cx={54} cy={54} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={9} />
              {/* Progress */}
              {porcentaje > 0 && (
                <circle
                  cx={54} cy={54} r={R}
                  fill="none"
                  stroke="#7DD3FC"
                  strokeWidth={9}
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              )}
            </svg>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>
                {porcentaje}%
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.40)", fontWeight: 600, marginTop: 2 }}>
                avance
              </span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: 0, lineHeight: 1, letterSpacing: "-0.03em" }}>
                {progresionesCompletadas}
                <span style={{ fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.35)" }}>
                  /{totalProgresiones}
                </span>
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>
                progresiones
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <MetricaOscura valor={actividadesEstaSemana} label="esta semana" icon="fa-bolt" />
              <MetricaOscura valor={`${minutosEstaSemana}m`} label="dedicados" icon="fa-clock" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Racha ─────────────────────────────────────────────── */}
      <div style={{
        borderRadius: 24,
        border: "1px solid rgba(11,37,69,0.09)",
        background: "#fff",
        padding: "22px 22px 20px",
        boxShadow: "0 2px 12px rgba(11,37,69,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#1E40AF", margin: 0 }}>
            Racha diaria
          </p>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: diasConsecutivos > 0 ? "rgba(251,146,60,0.10)" : "rgba(11,37,69,0.04)",
            border: diasConsecutivos > 0 ? "1px solid rgba(251,146,60,0.22)" : "1px solid rgba(11,37,69,0.08)",
            borderRadius: 999, padding: "4px 12px",
          }}>
            <span style={{ fontSize: 15 }}>🔥</span>
            <span style={{ fontSize: 17, fontWeight: 900, color: diasConsecutivos > 0 ? "#FB923C" : "rgba(11,37,69,0.30)", letterSpacing: "-0.02em" }}>
              {diasConsecutivos}
            </span>
          </div>
        </div>

        <p style={{ fontSize: 12, color: "rgba(11,37,69,0.50)", margin: "0 0 14px", lineHeight: 1.5 }}>
          {diasConsecutivos === 0
            ? "Empezá hoy y construí tu racha 💪"
            : diasConsecutivos === 1
              ? "¡Llevas 1 día seguido!"
              : `¡${diasConsecutivos} días seguidos!`}
        </p>

        {/* 7-day calendar */}
        <div style={{ display: "flex", gap: 5 }}>
          {ultimos7Dias.map((day) => {
            const d = new Date(day.fecha + "T12:00:00");
            const dow = d.getDay();
            return (
              <div
                key={day.fecha}
                title={day.fecha}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}
              >
                <span style={{ fontSize: 10, color: "rgba(11,37,69,0.32)", fontWeight: 600 }}>
                  {DAY_LABELS[dow]}
                </span>
                <div style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: 8,
                  background: day.activo
                    ? "linear-gradient(135deg, #1E40AF, #2563EB)"
                    : "rgba(11,37,69,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: day.activo ? "0 2px 8px rgba(30,64,175,0.30)" : "none",
                  transition: "all 0.2s",
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

      {/* ── Logros ────────────────────────────────────────────── */}
      <div style={{
        borderRadius: 24,
        border: "1px solid rgba(11,37,69,0.09)",
        background: "#fff",
        padding: "22px",
        boxShadow: "0 2px 12px rgba(11,37,69,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#1E40AF", margin: 0 }}>
            Logros
          </p>
          <span style={{ fontSize: 12, color: "rgba(11,37,69,0.30)", cursor: "not-allowed", fontWeight: 500 }}>
            Ver todos
          </span>
        </div>

        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", textAlign: "center",
          padding: "12px 0",
          gap: 10,
        }}>
          {/* Trophy placeholder */}
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.06))",
            border: "1px solid rgba(251,191,36,0.20)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
          }}>
            🏆
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0B2545", margin: "0 0 4px" }}>
              Sin logros todavía
            </p>
            <p style={{ fontSize: 12, color: "rgba(11,37,69,0.45)", margin: 0, lineHeight: 1.55 }}>
              Completá actividades y desbloqueá tus primeros logros.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MetricaOscura({ valor, label, icon }: { valor: string | number; label: string; icon: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: "rgba(125,211,252,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, color: "#7DD3FC", flexShrink: 0,
      }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{valor}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", marginLeft: 5 }}>{label}</span>
      </div>
    </div>
  );
}
