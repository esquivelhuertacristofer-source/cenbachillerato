'use client';

import { useState } from 'react';
import type { ActividadDebateEstructurado, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: "#D97706", rgba: "217,119,6", faIcon: "fa-comments", gradient: "" };

const POSTURA_COLORS = [
  { hex: "#38BDF8", rgba: "56,189,248" },
  { hex: "#F87171", rgba: "248,113,113" },
  { hex: "#34D399", rgba: "52,211,153" },
  { hex: "#FBBF24", rgba: "251,191,36" },
];

interface Props {
  actividad: ActividadDebateEstructurado;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
}

export function DebateEstructuradoActivity({ actividad, onProgreso, color = FALLBACK_COLOR }: Props) {
  const { contenido } = actividad;
  const [posturaIdx, setPosturaIdx] = useState<number | null>(null);
  const [argumento, setArgumento] = useState('');
  const [entregado, setEntregado] = useState(false);

  const posturaSeleccionada = posturaIdx !== null ? contenido.posturas[posturaIdx] : null;
  const argumentosGuia = posturaSeleccionada && contenido.argumentos_guia
    ? contenido.argumentos_guia[posturaSeleccionada]
    : undefined;

  const minChars = 60;
  const puedeEntregar = posturaIdx !== null && argumento.trim().length >= minChars;

  function handleEntregar() {
    setEntregado(true);
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: true,
      puntaje: 100,
      respuestas: { postura: posturaIdx, posturaNombre: posturaSeleccionada, argumento },
    });
  }

  const card: React.CSSProperties = {
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <style>{`
        @media (max-width: 640px) {
          .deb-posturas { flex-direction: column !important; }
        }
      `}</style>

      {/* Topic hero */}
      <div style={{
        ...card,
        padding: "32px 36px",
        background: `rgba(${color.rgba}, 0.07)`,
        border: `1.5px solid rgba(${color.rgba}, 0.18)`,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.30em",
          color: color.hex, marginBottom: 14, display: "flex", alignItems: "center", gap: 8,
        }}>
          <i className="fa-solid fa-scale-balanced" />
          Tema a debatir
          {contenido.modalidad && (
            <span style={{
              marginLeft: 8, fontSize: 10, fontWeight: 700, textTransform: "capitalize",
              color: "rgba(255,255,255,0.40)", padding: "3px 10px",
              background: "rgba(255,255,255,0.06)", borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              {contenido.modalidad}
            </span>
          )}
        </div>
        <p style={{
          fontSize: "clamp(17px, 2.2vw, 22px)", fontWeight: 800,
          color: "rgba(255,255,255,0.95)", margin: 0, lineHeight: 1.45,
          letterSpacing: "-0.02em",
        }}>
          {contenido.tema}
        </p>
      </div>

      {/* Rules (collapsible) */}
      {contenido.reglas && contenido.reglas.length > 0 && (
        <details style={{ ...card }}>
          <summary style={{
            padding: "16px 24px", cursor: "pointer", listStyle: "none",
            fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.50)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <i className="fa-solid fa-gavel" style={{ fontSize: 12, color: color.hex }} />
            Reglas del debate
            <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, marginLeft: "auto" }} />
          </summary>
          <ol style={{ padding: "0 24px 18px 48px", margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {contenido.reglas.map((r, i) => (
              <li key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", lineHeight: 1.5 }}>{r}</li>
            ))}
          </ol>
        </details>
      )}

      {/* Choose posture */}
      <div>
        <div style={{
          fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.40)", marginBottom: 14,
        }}>
          <i className="fa-solid fa-hand-point-right" style={{ marginRight: 8, color: color.hex }} />
          Elige tu postura
        </div>
        <div className="deb-posturas" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {contenido.posturas.map((postura, i) => {
            const pc = POSTURA_COLORS[i % POSTURA_COLORS.length]!;
            const isSelected = posturaIdx === i;
            return (
              <button
                key={i}
                disabled={entregado}
                onClick={() => setPosturaIdx(i)}
                style={{
                  flex: 1, minWidth: 180,
                  padding: "24px 20px",
                  borderRadius: 18,
                  border: isSelected
                    ? `2px solid rgba(${pc.rgba}, 0.60)`
                    : "1.5px solid rgba(255,255,255,0.08)",
                  background: isSelected
                    ? `rgba(${pc.rgba}, 0.12)`
                    : "rgba(255,255,255,0.03)",
                  cursor: entregado ? "default" : "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-epilogue), sans-serif",
                  transition: "all 0.2s ease",
                  boxShadow: isSelected ? `0 8px 24px rgba(${pc.rgba}, 0.15)` : "none",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, marginBottom: 14,
                  background: isSelected ? `rgba(${pc.rgba}, 0.20)` : "rgba(255,255,255,0.06)",
                  border: isSelected ? `1px solid rgba(${pc.rgba}, 0.30)` : "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isSelected ? pc.hex : "rgba(255,255,255,0.30)",
                  fontSize: 14, fontWeight: 900,
                }}>
                  {isSelected ? <i className="fa-solid fa-check" /> : <i className="fa-solid fa-circle" style={{ fontSize: 8 }} />}
                </div>
                <p style={{
                  fontSize: 14, fontWeight: 700, lineHeight: 1.5, margin: 0,
                  color: isSelected ? "#fff" : "rgba(255,255,255,0.65)",
                }}>
                  {postura}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guide arguments for chosen posture */}
      {posturaIdx !== null && argumentosGuia && argumentosGuia.length > 0 && (
        <div style={{
          ...card,
          padding: "24px 28px",
          background: "rgba(251,191,36,0.07)",
          border: "1px solid rgba(251,191,36,0.18)",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.22em",
            color: "#FBBF24", marginBottom: 14,
          }}>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8 }} />
            Argumentos guía para tu postura
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {argumentosGuia.map((arg, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <i className="fa-solid fa-arrow-right" style={{ fontSize: 11, color: "#FBBF24", marginTop: 3, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.70)", margin: 0, lineHeight: 1.6 }}>
                  {arg}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Argument editor */}
      {posturaIdx !== null && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{
            fontSize: 12, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.15em", color: "rgba(255,255,255,0.40)",
          }}>
            <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: color.hex }} />
            Desarrolla tu argumentación
          </label>
          <textarea
            value={argumento}
            onChange={e => setArgumento(e.target.value)}
            disabled={entregado}
            rows={9}
            placeholder="Argumenta tu postura con evidencias, ejemplos concretos y razonamiento lógico. Sé claro y persuasivo..."
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: `1.5px solid ${argumento.length >= minChars ? `rgba(${color.rgba}, 0.30)` : "rgba(255,255,255,0.10)"}`,
              borderRadius: 16, padding: "20px 24px",
              fontSize: 15, color: "rgba(255,255,255,0.88)",
              outline: "none", resize: "vertical",
              fontFamily: "var(--font-epilogue), sans-serif",
              lineHeight: 1.75, boxSizing: "border-box",
              transition: "border-color 0.25s ease",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: argumento.length >= minChars ? "#4ADE80" : "rgba(255,255,255,0.35)",
            }}>
              {argumento.trim().length} / {minChars} caracteres mínimos
              {argumento.trim().length >= minChars && " ✓"}
            </span>
          </div>
        </div>
      )}

      {/* Evaluation criteria */}
      {contenido.criterios_evaluacion && contenido.criterios_evaluacion.length > 0 && (
        <details style={{ ...card }}>
          <summary style={{
            padding: "16px 24px", cursor: "pointer", listStyle: "none",
            fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.50)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <i className="fa-solid fa-clipboard-list" style={{ fontSize: 12 }} />
            Criterios de evaluación
            <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, marginLeft: "auto" }} />
          </summary>
          <div style={{ padding: "0 24px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            {contenido.criterios_evaluacion.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: 11, color: color.hex, marginTop: 3, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", margin: 0, lineHeight: 1.5 }}>{c}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* CTA */}
      {!entregado ? (
        <button
          onClick={handleEntregar}
          disabled={!puedeEntregar}
          style={{
            width: "100%", padding: "18px 32px", borderRadius: 16, border: "none",
            cursor: puedeEntregar ? "pointer" : "not-allowed",
            fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em",
            background: puedeEntregar ? color.hex : "rgba(255,255,255,0.08)",
            color: puedeEntregar ? "#011126" : "rgba(255,255,255,0.25)",
            boxShadow: puedeEntregar ? `0 12px 32px rgba(${color.rgba}, 0.28)` : "none",
            fontFamily: "var(--font-epilogue), sans-serif",
            transition: "all 0.25s ease",
          }}
        >
          <i className="fa-solid fa-paper-plane" style={{ marginRight: 10 }} />
          Entregar postura y argumentación
        </button>
      ) : (
        <div style={{
          padding: "20px 28px", borderRadius: 16,
          background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.22)",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: 24, color: "#4ADE80" }} />
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#4ADE80", margin: 0 }}>
              Debate entregado para revisión.
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: "2px 0 0" }}>
              Tu docente evaluará tu argumentación.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
