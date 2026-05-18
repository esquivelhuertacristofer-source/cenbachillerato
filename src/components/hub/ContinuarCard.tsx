import Link from "next/link";
import type { ContinuarData } from "@/lib/queries/hub";
import { getRSCColor, getTipoConfig } from "./hub-colors";

interface ContinuarCardProps {
  data: ContinuarData | null;
  nombre: string;
}

export function ContinuarCard({ data, nombre }: ContinuarCardProps) {
  if (!data) {
    return <ContinuarCardBienvenida nombre={nombre} />;
  }

  const color = getRSCColor(data.uacRscCodigo);
  const tipoConf = getTipoConfig(data.actividadTipo);
  const pct = Math.round((data.actividadesCompletadas / data.totalActividades) * 100);
  const href = `/hub/uac/${data.uacCodigo}/progresion/${data.progresionNumero}/actividad/${data.actividadOrden}`;

  const etiqueta = data.actividadesCompletadas === 0 ? "Empieza aquí" : "Continúa donde te quedaste";

  return (
    <div
      style={{
        borderRadius: 24,
        background: color.gradient,
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)`,
        overflow: "hidden",
        display: "flex",
        minHeight: 180,
      }}
    >
      {/* Left: text content */}
      <div style={{ flex: "1 1 60%", padding: "28px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>

        {/* Eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 999,
            background: `rgba(${color.rgba}, 0.18)`,
            border: `1px solid rgba(${color.rgba}, 0.30)`,
            padding: "4px 12px",
            fontSize: 11,
            fontWeight: 700,
            color: color.hex,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            <i className={`fa-solid ${tipoConf.faIcon}`} style={{ fontSize: 10 }} />
            {etiqueta}
          </span>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            color: `rgba(${color.rgba}, 0.75)`,
            margin: "0 0 4px",
            textTransform: "uppercase",
            letterSpacing: "0.10em",
          }}>
            {data.uacNombre}
          </p>
          <h2 style={{
            fontSize: "clamp(18px, 2.5vw, 24px)",
            fontWeight: 900,
            color: "#fff",
            margin: "0 0 4px",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {data.progresionTitulo}
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0 }}>
            Progresión {data.progresionNumero} · Actividad {data.actividadOrden} de {data.totalActividades}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
              {data.actividadesCompletadas} de {data.totalActividades} actividades
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: color.hex }}>{pct}%</span>
          </div>
          <div style={{
            height: 5,
            borderRadius: 999,
            background: "rgba(255,255,255,0.12)",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 999,
              background: color.hex,
              transition: "width 0.6s ease",
            }} />
          </div>
        </div>

        {/* CTA */}
        <Link
          href={href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            background: color.hex,
            color: "#0B2545",
            padding: "11px 24px",
            fontSize: 14,
            fontWeight: 800,
            textDecoration: "none",
            alignSelf: "flex-start",
            boxShadow: `0 8px 24px rgba(${color.rgba}, 0.40)`,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          className="hub-cta-btn"
        >
          {data.actividadesCompletadas === 0 ? "Comenzar" : "Continuar"}
          <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }} />
        </Link>
      </div>

      {/* Right: UAC icon visual */}
      <div
        style={{
          flex: "0 0 200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
        className="continuar-right-panel"
      >
        {/* Glow background */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at center, rgba(${color.rgba}, 0.22) 0%, transparent 70%)`,
        }} />
        {/* Icon */}
        <div style={{
          position: "relative",
          zIndex: 1,
          width: 96,
          height: 96,
          borderRadius: 28,
          background: `rgba(${color.rgba}, 0.14)`,
          border: `2px solid rgba(${color.rgba}, 0.30)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
          color: color.hex,
          boxShadow: `0 0 40px rgba(${color.rgba}, 0.25)`,
        }}>
          <i className={`fa-solid ${color.faIcon}`} />
        </div>
      </div>
    </div>
  );
}

function ContinuarCardBienvenida({ nombre }: { nombre: string }) {
  return (
    <div style={{
      borderRadius: 24,
      background: "linear-gradient(135deg, #0B2545 0%, #0E2D56 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      padding: "28px 32px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}>
      <div>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          borderRadius: 999,
          background: "rgba(125,211,252,0.15)",
          border: "1px solid rgba(125,211,252,0.25)",
          padding: "4px 12px",
          fontSize: 11,
          fontWeight: 700,
          color: "#7DD3FC",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          <i className="fa-solid fa-sparkles" style={{ fontSize: 10 }} />
          ¡Bienvenido!
        </span>
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
        Hola, {nombre}. Tu semestre te espera.
      </h2>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6 }}>
        Tu semestre tiene 7 áreas de aprendizaje. Elegí cualquier materia para empezar tu recorrido.
      </p>
      <Link
        href="#mis-materias"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 999,
          background: "#7DD3FC",
          color: "#0B2545",
          padding: "11px 24px",
          fontSize: 14,
          fontWeight: 800,
          textDecoration: "none",
          alignSelf: "flex-start",
          boxShadow: "0 8px 24px rgba(125,211,252,0.35)",
        }}
      >
        Conocer mis materias
        <i className="fa-solid fa-arrow-down" style={{ fontSize: 12 }} />
      </Link>
    </div>
  );
}
