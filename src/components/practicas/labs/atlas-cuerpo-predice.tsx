"use client";
/**
 * «Predice» del Atlas del cuerpo humano: una apuesta por modo.
 *
 * Predecir → observar → explicar. El alumno apuesta antes de mover nada; la
 * tarjeta le dice qué mover para comprobarlo y SOLO revela el porqué cuando el
 * atlas registra que ya lo vio (tocó la pieza, cortó el plano, completó el
 * recorrido, dejó respirar el modelo…). Sin componente compartido para esto en
 * el shell, vive aquí.
 */
import { T, OK } from "./_kit";
import type { PrediceModo } from "./atlas-cuerpo-modos";

const MAL = "#f87171";

export function TarjetaPredice({
  p,
  color,
  eleccion,
  comprobado,
  onElegir,
}: {
  p: PrediceModo;
  color: string;
  eleccion: string | null;
  comprobado: boolean;
  onElegir: (id: string) => void;
}) {
  const revelada = eleccion !== null && comprobado;
  const acerto = eleccion === p.correcta;
  return (
    <div
      className="acp"
      style={{
        display: "grid",
        gap: 10,
        padding: "14px 14px 12px",
        borderRadius: 14,
        border: `1px solid ${revelada ? (acerto ? `${OK}88` : `${MAL}88`) : `${color}66`}`,
        background: revelada ? (acerto ? "rgba(52,211,153,0.10)" : "rgba(248,113,113,0.10)") : `${color}14`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", color }}>
        <i className="fa-solid fa-wand-magic-sparkles" aria-hidden /> Predice
      </div>
      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>{p.escena}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.35 }}>{p.pregunta}</div>
      <div role="radiogroup" aria-label="Tu predicción" style={{ display: "grid", gap: 6 }}>
        {p.opciones.map((o) => {
          const on = eleccion === o.id;
          const esCorrecta = revelada && o.id === p.correcta;
          const esError = revelada && on && !acerto;
          const borde = esCorrecta ? OK : esError ? MAL : on ? color : "rgba(255,255,255,0.14)";
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={revelada}
              onClick={() => onElegir(o.id)}
              style={{
                cursor: revelada ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                textAlign: "left",
                minHeight: 44,
                padding: "8px 12px",
                borderRadius: 10,
                border: `1px solid ${borde}`,
                background: on || esCorrecta ? `${borde}22` : "rgba(4,10,22,0.45)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", background: on || esCorrecta ? borde : "rgba(255,255,255,0.08)", color: on || esCorrecta ? "#04121f" : T.text2, fontSize: 13 }}>
                <i className={`fa-solid ${esCorrecta ? "fa-check" : esError ? "fa-xmark" : o.icono}`} aria-hidden />
              </span>
              <span style={{ minWidth: 0 }}>{o.texto}</span>
            </button>
          );
        })}
      </div>
      <div aria-live="polite" style={{ fontSize: 14, lineHeight: 1.5 }}>
        {eleccion === null ? (
          <span style={{ color: T.text3 }}>Elige una respuesta antes de mover nada.</span>
        ) : !comprobado ? (
          <span style={{ color: "#e6eefb" }}>
            <i className="fa-solid fa-flask" aria-hidden style={{ color, marginRight: 7 }} />
            <strong>Compruébalo:</strong> {p.comoComprobarlo}
          </span>
        ) : (
          <span style={{ color: "#e6eefb" }}>
            <strong style={{ color: acerto ? OK : MAL }}>{acerto ? "¡Acertaste! " : "No era esa. "}</strong>
            {p.porque}
          </span>
        )}
      </div>
    </div>
  );
}
