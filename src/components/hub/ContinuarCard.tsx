import Link from "next/link";
import type { ContinuarData } from "@/lib/queries/hub";
import { getRSCColor, getTipoConfig, RSC_COLORS } from "./hub-colors";

interface ContinuarCardProps {
  data: ContinuarData | null;
  nombre: string;
}

export function ContinuarCard({ data, nombre }: ContinuarCardProps) {
  if (!data) return <ContinuarCardBienvenida nombre={nombre} />;

  const color = getRSCColor(data.uacRscCodigo);
  const tipoConf = getTipoConfig(data.actividadTipo);
  const pct = data.totalActividades > 0
    ? Math.round((data.actividadesCompletadas / data.totalActividades) * 100)
    : 0;
  const href = `/hub/uac/${data.uacCodigo}/progresion/${data.progresionNumero}/actividad/${data.actividadOrden}`;
  const label = data.actividadesCompletadas === 0 ? "Empieza aquí" : "Continúa donde te quedaste";

  return (
    <div style={{
      borderRadius: 28,
      background: color.gradient,
      border: "1px solid rgba(255,255,255,0.07)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.05)",
      overflow: "hidden",
      display: "flex",
      minHeight: 240,
      position: "relative",
    }}>
      {/* Decorative SVG background */}
      <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 900 240" preserveAspectRatio="xMidYMid slice">
        <circle cx="820" cy="-40" r="180" fill={`rgba(${color.rgba}, 0.12)`} />
        <circle cx="640" cy="280" r="140" fill={`rgba(${color.rgba}, 0.08)`} />
        <circle cx="50" cy="240" r="100" fill="rgba(255,255,255,0.03)" />
        <circle cx="750" cy="60" r="60" fill="rgba(255,255,255,0.04)" />
      </svg>

      {/* Left — text content */}
      <div style={{
        flex: "1 1 55%",
        padding: "32px 36px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minWidth: 0,
        position: "relative",
        zIndex: 1,
      }}>
        {/* Eyebrow */}
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          borderRadius: 999,
          background: `rgba(${color.rgba}, 0.18)`,
          border: `1px solid rgba(${color.rgba}, 0.28)`,
          padding: "5px 14px",
          fontSize: 11,
          fontWeight: 700,
          color: color.hex,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          alignSelf: "flex-start",
          marginBottom: 20,
        }}>
          <i className={`fa-solid ${tipoConf.faIcon}`} style={{ fontSize: 10 }} />
          {label}
        </span>

        {/* Headline */}
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            color: `rgba(${color.rgba}, 0.70)`,
            margin: "0 0 6px",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}>
            {data.uacNombre}
          </p>
          <h2 style={{
            fontSize: "clamp(20px, 2.8vw, 28px)",
            fontWeight: 900,
            color: "#fff",
            margin: "0 0 6px",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {data.progresionTitulo}
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", margin: "0 0 22px" }}>
            Progresión {data.progresionNumero} · Actividad {data.actividadOrden} de {data.totalActividades}
          </p>

          {/* Progress */}
          <div style={{ marginBottom: 28, maxWidth: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.48)" }}>
                {data.actividadesCompletadas} de {data.totalActividades} actividades completadas
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: color.hex }}>{pct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.10)", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 999,
                background: color.hex,
                boxShadow: `0 0 12px rgba(${color.rgba}, 0.60)`,
                transition: "width 0.8s cubic-bezier(.22,1,.36,1)",
              }} />
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 999,
            background: color.hex,
            color: "#0B2545",
            padding: "13px 28px",
            fontSize: 15,
            fontWeight: 800,
            textDecoration: "none",
            alignSelf: "flex-start",
            boxShadow: `0 10px 30px rgba(${color.rgba}, 0.45)`,
            transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
            letterSpacing: "-0.01em",
          }}
          className="hub-cta-btn"
        >
          {data.actividadesCompletadas === 0 ? "Comenzar ahora" : "Continuar"}
          <i className="fa-solid fa-arrow-right" style={{ fontSize: 13 }} />
        </Link>
      </div>

      {/* Right — visual panel */}
      <div style={{
        flex: "0 0 280px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
        className="continuar-right-panel"
      >
        {/* Glow */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 60% 50%, rgba(${color.rgba}, 0.28) 0%, transparent 70%)`,
        }} />

        {/* Floating card */}
        <div style={{
          position: "relative",
          zIndex: 1,
          borderRadius: 24,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.16)",
          backdropFilter: "blur(16px)",
          padding: "24px",
          width: 180,
          boxShadow: "0 20px 60px rgba(0,0,0,0.30)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: `rgba(${color.rgba}, 0.20)`,
            border: `2px solid rgba(${color.rgba}, 0.30)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, color: color.hex,
            boxShadow: `0 0 28px rgba(${color.rgba}, 0.30)`,
          }}>
            <i className={`fa-solid ${color.faIcon}`} />
          </div>
          {/* Mini progress ring */}
          <div style={{ position: "relative" }}>
            <svg width={56} height={56} viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
              <circle cx={28} cy={28} r={22} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={5} />
              {pct > 0 && (
                <circle
                  cx={28} cy={28} r={22}
                  fill="none"
                  stroke={color.hex}
                  strokeWidth={5}
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - pct / 100)}
                  strokeLinecap="round"
                />
              )}
            </svg>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 800, color: "#fff",
            }}>
              {pct}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Bienvenida (sin actividad) ───────────────────────────────────────────── */

function ContinuarCardBienvenida({ nombre }: { nombre: string }) {
  const rscEntries = Object.values(RSC_COLORS).slice(0, 7);

  return (
    <div style={{
      borderRadius: 28,
      background: "linear-gradient(135deg, #060E20 0%, #0B2545 45%, #0D2F60 100%)",
      border: "1px solid rgba(255,255,255,0.07)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.05)",
      overflow: "hidden",
      display: "flex",
      minHeight: 240,
      position: "relative",
    }}>
      {/* Decorative SVG */}
      <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 900 240" preserveAspectRatio="xMidYMid slice">
        <circle cx="800" cy="-60" r="200" fill="rgba(125,211,252,0.06)" />
        <circle cx="620" cy="290" r="150" fill="rgba(30,64,175,0.12)" />
        <circle cx="30" cy="220" r="110" fill="rgba(255,255,255,0.02)" />
      </svg>

      {/* Left — content */}
      <div style={{
        flex: "1 1 55%",
        padding: "36px 40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 20,
        minWidth: 0,
        position: "relative",
        zIndex: 1,
      }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          borderRadius: 999,
          background: "rgba(125,211,252,0.14)",
          border: "1px solid rgba(125,211,252,0.24)",
          padding: "5px 14px",
          fontSize: 11,
          fontWeight: 700,
          color: "#7DD3FC",
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          alignSelf: "flex-start",
        }}>
          <i className="fa-solid fa-sparkles" style={{ fontSize: 10 }} />
          ¡Bienvenido!
        </span>

        <div>
          <h2 style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 900,
            color: "#fff",
            margin: "0 0 10px",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}>
            Hola, {nombre}.<br />
            <span style={{ color: "#7DD3FC" }}>Tu semestre te espera.</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.48)", margin: 0, lineHeight: 1.65, maxWidth: 400 }}>
            Tenés 7 áreas de aprendizaje este semestre. Elegí cualquier materia y empezá tu recorrido.
          </p>
        </div>

        <Link
          href="#mis-materias"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 999,
            background: "#7DD3FC",
            color: "#0B2545",
            padding: "13px 28px",
            fontSize: 15,
            fontWeight: 800,
            textDecoration: "none",
            alignSelf: "flex-start",
            boxShadow: "0 10px 32px rgba(125,211,252,0.38)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
            letterSpacing: "-0.01em",
          }}
          className="hub-cta-btn"
        >
          Explorar materias
          <i className="fa-solid fa-arrow-down" style={{ fontSize: 13 }} />
        </Link>
      </div>

      {/* Right — 7 RSC subject orbs */}
      <div style={{
        flex: "0 0 300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
        className="continuar-right-panel"
      >
        {/* Glow center */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(125,211,252,0.12) 0%, transparent 70%)",
        }} />

        {/* 7 subject orbs in a pattern */}
        <div style={{ position: "relative", zIndex: 1, width: 220, height: 200 }}>
          {rscEntries.map((c, i) => {
            // Arrange 7 orbs: 3 top row + 1 center + 3 bottom row
            const positions: [number, number][] = [
              [18, 20], [88, 4], [158, 20],
              [88, 88],
              [18, 156], [88, 172], [158, 156],
            ];
            const [left, top] = positions[i] ?? [88, 88];
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `rgba(${c.rgba}, 0.18)`,
                  border: `1.5px solid rgba(${c.rgba}, 0.32)`,
                  backdropFilter: "blur(8px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: c.hex,
                  boxShadow: `0 4px 16px rgba(${c.rgba}, 0.25), 0 0 0 4px rgba(${c.rgba}, 0.08)`,
                  animation: `hubOrb ${2.2 + i * 0.3}s ease-in-out infinite alternate`,
                }}
              >
                <i className={`fa-solid ${c.faIcon}`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
