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
  const isNew = data.actividadesCompletadas === 0;

  return (
    <div style={{
      borderRadius: 28,
      background: color.gradient,
      border: "1px solid rgba(255,255,255,0.07)",
      boxShadow: "0 40px 100px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.05)",
      overflow: "hidden",
      display: "flex",
      minHeight: 300,
      position: "relative",
    }}>
      {/* SVG background */}
      <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="hero-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.5" fill="rgba(255,255,255,0.07)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)" />
        <circle cx="900" cy="-40" r="240" fill={`rgba(${color.rgba}, 0.12)`} />
        <circle cx="700" cy="340" r="180" fill={`rgba(${color.rgba}, 0.08)`} />
        <circle cx="40" cy="280" r="120" fill="rgba(255,255,255,0.03)" />
        <path d="M 0 200 Q 300 80 600 160 Q 800 220 1000 100" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none" />
      </svg>

      {/* Left — text */}
      <div style={{
        flex: "1 1 55%",
        padding: "40px 44px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minWidth: 0,
        position: "relative",
        zIndex: 1,
      }}>
        {/* Eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            borderRadius: 999,
            background: `rgba(${color.rgba}, 0.18)`,
            border: `1px solid rgba(${color.rgba}, 0.28)`,
            padding: "6px 16px",
            fontSize: 11, fontWeight: 700, color: color.hex,
            letterSpacing: "0.10em", textTransform: "uppercase",
          }}>
            <i className={`fa-solid ${tipoConf.faIcon}`} style={{ fontSize: 10 }} />
            {isNew ? "Empieza aquí" : "Continúa donde te quedaste"}
          </span>
        </div>

        {/* Main content */}
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: `rgba(${color.rgba}, 0.70)`,
            margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.14em",
          }}>
            {data.uacNombre}
          </p>
          <h2 style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 900,
            color: "#fff",
            margin: "0 0 8px",
            letterSpacing: "-0.03em",
            lineHeight: 1.12,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {data.progresionTitulo}
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 28px", letterSpacing: "0.01em" }}>
            Propósito formativo {data.progresionNumero} · Actividad {data.actividadOrden} de {data.totalActividades}
          </p>

          {/* Progress bar */}
          <div style={{ maxWidth: 440, marginBottom: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                {data.actividadesCompletadas} de {data.totalActividades} actividades completadas
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: color.hex }}>{pct}%</span>
            </div>
            <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,0.10)", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 999,
                background: color.hex,
                boxShadow: `0 0 14px rgba(${color.rgba}, 0.70)`,
                transition: "width 0.9s cubic-bezier(.22,1,.36,1)",
              }} />
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={href}
          className="hub-cta-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 999,
            background: color.hex,
            color: "#0B2545",
            padding: "14px 32px",
            fontSize: 15,
            fontWeight: 800,
            textDecoration: "none",
            alignSelf: "flex-start",
            boxShadow: `0 12px 36px rgba(${color.rgba}, 0.50)`,
            letterSpacing: "-0.01em",
          }}
        >
          {isNew ? "Comenzar ahora" : "Continuar"}
          <i className="fa-solid fa-arrow-right" style={{ fontSize: 13 }} />
        </Link>
      </div>

      {/* Right — visual */}
      <div
        className="continuar-right-panel"
        style={{
          flex: "0 0 300px",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(circle at 55% 50%, rgba(${color.rgba}, 0.30) 0%, transparent 70%)`,
        }} />

        {/* Floating card */}
        <div style={{
          position: "relative", zIndex: 1,
          borderRadius: 24,
          background: "rgba(255,255,255,0.09)",
          border: "1.5px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "28px 24px",
          width: 190,
          boxShadow: "0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          transform: "rotate(-3deg)",
        }}>
          {/* UAC Icon */}
          <div style={{
            width: 76, height: 76, borderRadius: 22,
            background: `rgba(${color.rgba}, 0.22)`,
            border: `2px solid rgba(${color.rgba}, 0.32)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, color: color.hex,
            boxShadow: `0 0 32px rgba(${color.rgba}, 0.28)`,
          }}>
            <i className={`fa-solid ${color.faIcon}`} />
          </div>

          {/* Donut ring */}
          <div style={{ position: "relative" }}>
            <svg width={72} height={72} viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
              <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={6} />
              {pct > 0 && (
                <circle
                  cx={36} cy={36} r={28}
                  fill="none" stroke={color.hex} strokeWidth={6}
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - pct / 100)}
                  strokeLinecap="round"
                />
              )}
            </svg>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{pct}%</span>
            </div>
          </div>

          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", margin: 0, textAlign: "center", lineHeight: 1.4 }}>
            {data.uacNombre}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Bienvenida ─────────────────────────────────────────────────────────────── */

function ContinuarCardBienvenida({ nombre }: { nombre: string }) {
  const rscEntries = Object.entries(RSC_COLORS).slice(0, 7);

  return (
    <div style={{
      borderRadius: 28,
      background: "linear-gradient(135deg, #060E20 0%, #0B2545 40%, #0D2E64 100%)",
      border: "1px solid rgba(255,255,255,0.07)",
      boxShadow: "0 40px 100px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.05)",
      overflow: "hidden",
      display: "flex",
      minHeight: 300,
      position: "relative",
    }}>
      {/* SVG background */}
      <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="bienvenida-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.5" fill="rgba(255,255,255,0.06)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bienvenida-dots)" />
        <circle cx="880" cy="-60" r="260" fill="rgba(125,211,252,0.06)" />
        <circle cx="700" cy="360" r="200" fill="rgba(30,64,175,0.09)" />
        <path d="M 0 220 Q 350 70 700 180 Q 870 240 1000 120" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" fill="none" />
      </svg>

      {/* Left — content */}
      <div style={{
        flex: "1 1 55%",
        padding: "44px 48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 24,
        minWidth: 0,
        position: "relative",
        zIndex: 1,
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          borderRadius: 999,
          background: "rgba(125,211,252,0.13)",
          border: "1px solid rgba(125,211,252,0.22)",
          padding: "6px 16px",
          fontSize: 11, fontWeight: 700, color: "#7DD3FC",
          letterSpacing: "0.10em", textTransform: "uppercase",
          alignSelf: "flex-start",
        }}>
          <i className="fa-solid fa-sparkles" style={{ fontSize: 10 }} />
          ¡Bienvenido!
        </span>

        <div>
          <h2 style={{
            fontSize: "clamp(24px, 3.2vw, 36px)",
            fontWeight: 900,
            color: "#fff",
            margin: "0 0 12px",
            letterSpacing: "-0.035em",
            lineHeight: 1.10,
          }}>
            Hola, {nombre}.<br />
            <span style={{ color: "#7DD3FC" }}>Tu semestre te espera.</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.70, maxWidth: 420 }}>
            7 áreas de aprendizaje diseñadas para este semestre. Elegí cualquier materia y comenzá tu camino.
          </p>
        </div>

        <Link
          href="#mis-materias"
          className="hub-cta-btn"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            borderRadius: 999,
            background: "#7DD3FC",
            color: "#0B2545",
            padding: "14px 32px",
            fontSize: 15, fontWeight: 800,
            textDecoration: "none",
            alignSelf: "flex-start",
            boxShadow: "0 12px 36px rgba(125,211,252,0.40)",
            letterSpacing: "-0.01em",
          }}
        >
          Explorar materias
          <i className="fa-solid fa-arrow-down" style={{ fontSize: 13 }} />
        </Link>
      </div>

      {/* Right — 7 subject orbs */}
      <div
        className="continuar-right-panel"
        style={{
          flex: "0 0 320px",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(125,211,252,0.10) 0%, transparent 70%)",
        }} />

        {/* 7 subject tiles arranged in a honeycomb-ish pattern */}
        <div style={{ position: "relative", zIndex: 1, width: 240, height: 220 }}>
          {rscEntries.map(([, c], i) => {
            const positions: [number, number][] = [
              [8, 14], [92, 0], [176, 14],
              [50, 94], [136, 94],
              [8, 170], [176, 170],
            ];
            const [left, top] = positions[i] ?? [92, 94];
            const delays = [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8];

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: `rgba(${c.rgba}, 0.16)`,
                  border: `1.5px solid rgba(${c.rgba}, 0.30)`,
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  color: c.hex,
                  boxShadow: `0 4px 20px rgba(${c.rgba}, 0.22), 0 0 0 4px rgba(${c.rgba}, 0.07)`,
                  animation: `hubOrb ${2.4 + i * 0.28}s ease-in-out ${delays[i] ?? 0}s infinite alternate`,
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
