'use client';

import { useState } from 'react';
import type { ActividadEjercicioMatematico, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: "#FB923C", rgba: "251,146,60", faIcon: "fa-calculator", gradient: "" };

interface Props {
  actividad: ActividadEjercicioMatematico;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
}

export function EjercicioMatematicoActivity({ actividad, onProgreso, color = FALLBACK_COLOR }: Props) {
  const { contenido } = actividad;
  const [respuesta, setRespuesta] = useState('');
  const [verificado, setVerificado] = useState(false);
  const [correcto, setCorrecto] = useState(false);
  const [pasosVisible, setPasosVisible] = useState(false);

  function handleVerificar() {
    if (contenido.tipo_respuesta === 'desarrollo') {
      setCorrecto(true);
      setVerificado(true);
      onProgreso?.({ actividadId: actividad.id ?? '', completada: true, puntaje: 100 });
      return;
    }
    const tolerancia = contenido.tolerancia_error ?? 0;
    const esperada = parseFloat(contenido.respuesta_final ?? '');
    const dada = parseFloat(respuesta);
    const esCorrecta = !isNaN(esperada) && !isNaN(dada) && Math.abs(dada - esperada) <= tolerancia;
    setCorrecto(esCorrecta);
    setVerificado(true);
    onProgreso?.({ actividadId: actividad.id ?? '', completada: esCorrecta, puntaje: esCorrecta ? 100 : 0 });
  }

  const card: React.CSSProperties = {
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Context */}
      {contenido.contexto && (
        <div style={{
          ...card,
          padding: "24px 28px",
          background: "rgba(251,191,36,0.07)",
          border: "1px solid rgba(251,191,36,0.18)",
          borderLeft: "4px solid #FBBF24",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.25em",
            color: "#FBBF24", marginBottom: 10,
          }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 8 }} />
            Contexto
          </div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.65 }}>
            {contenido.contexto}
          </p>
        </div>
      )}

      {/* Problem statement */}
      <div style={{ ...card, padding: "32px 36px" }}>
        <div style={{
          fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.25em",
          color: color.hex, marginBottom: 16,
        }}>
          <i className="fa-solid fa-square-root-variable" style={{ marginRight: 8 }} />
          Problema
        </div>
        <p style={{
          fontSize: 18, color: "rgba(255,255,255,0.90)", margin: 0, lineHeight: 1.75,
          fontWeight: 600, letterSpacing: "-0.01em",
        }}>
          {contenido.problema}
        </p>
        {contenido.unidades && (
          <div style={{ marginTop: 14 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: color.hex,
              background: `rgba(${color.rgba}, 0.10)`, padding: "4px 12px",
              borderRadius: 999, border: `1px solid rgba(${color.rgba}, 0.20)`,
            }}>
              Unidades: {contenido.unidades}
            </span>
          </div>
        )}
      </div>

      {/* Guided steps (collapsible) */}
      {contenido.pasos_guia && contenido.pasos_guia.length > 0 && (
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <button
            onClick={() => setPasosVisible(v => !v)}
            style={{
              width: "100%", padding: "18px 24px",
              background: "transparent", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12,
              fontFamily: "var(--font-epilogue), sans-serif",
            }}
          >
            <i className="fa-solid fa-stairs" style={{ fontSize: 13, color: color.hex }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.60)" }}>
              {pasosVisible ? "Ocultar guía de resolución" : "Ver guía paso a paso"}
            </span>
            <i
              className={`fa-solid fa-chevron-${pasosVisible ? "up" : "down"}`}
              style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: "auto" }}
            />
          </button>
          {pasosVisible && (
            <div style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              padding: "20px 24px",
              display: "flex", flexDirection: "column", gap: 14,
            }}>
              {contenido.pasos_guia.map((paso, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: `rgba(${color.rgba}, 0.12)`,
                    border: `1px solid rgba(${color.rgba}, 0.22)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 900, color: color.hex,
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.70)", margin: 0, lineHeight: 1.6 }}>
                    {paso}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Answer input */}
      {contenido.tipo_respuesta !== 'desarrollo' ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{
            fontSize: 12, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.15em", color: "rgba(255,255,255,0.40)",
          }}>
            Tu respuesta {contenido.unidades && `(${contenido.unidades})`}
          </label>
          <input
            type="text"
            value={respuesta}
            onChange={e => setRespuesta(e.target.value)}
            disabled={verificado}
            placeholder="Escribe tu resultado aquí..."
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: `1.5px solid ${
                verificado
                  ? correcto ? "rgba(74,222,128,0.40)" : "rgba(248,113,113,0.40)"
                  : "rgba(255,255,255,0.12)"
              }`,
              borderRadius: 14,
              padding: "16px 20px",
              fontSize: 20,
              fontWeight: 700,
              color: "rgba(255,255,255,0.90)",
              outline: "none",
              fontFamily: "var(--font-epilogue), sans-serif",
              letterSpacing: "0.02em",
              boxSizing: "border-box",
              textAlign: "center",
              transition: "border-color 0.25s ease",
            }}
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{
            fontSize: 12, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.15em", color: "rgba(255,255,255,0.40)",
          }}>
            Desarrollo de tu solución
          </label>
          <textarea
            value={respuesta}
            onChange={e => setRespuesta(e.target.value)}
            disabled={verificado}
            rows={7}
            placeholder="Escribe tu procedimiento y razonamiento aquí..."
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1.5px solid rgba(255,255,255,0.10)",
              borderRadius: 16, padding: "16px 20px",
              fontSize: 15, color: "rgba(255,255,255,0.85)",
              outline: "none", resize: "vertical",
              fontFamily: "var(--font-epilogue), sans-serif",
              lineHeight: 1.7, boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {/* Feedback after verify */}
      {verificado && (
        <div style={{
          padding: "20px 24px", borderRadius: 16,
          background: correcto ? "rgba(74,222,128,0.10)" : "rgba(248,113,113,0.08)",
          border: correcto ? "1px solid rgba(74,222,128,0.22)" : "1px solid rgba(248,113,113,0.22)",
          display: "flex", alignItems: "flex-start", gap: 16,
        }}>
          <i
            className={`fa-solid ${correcto ? "fa-circle-check" : "fa-circle-xmark"}`}
            style={{ fontSize: 22, color: correcto ? "#4ADE80" : "#F87171", flexShrink: 0, marginTop: 2 }}
          />
          <div>
            <p style={{
              fontSize: 14, fontWeight: 800, margin: "0 0 4px",
              color: correcto ? "#4ADE80" : "#F87171",
            }}>
              {correcto ? "¡Respuesta correcta!" : "Respuesta incorrecta"}
            </p>
            {!correcto && contenido.respuesta_final && (
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: 0 }}>
                Solución: <strong style={{ color: "#fff" }}>{contenido.respuesta_final} {contenido.unidades}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Verify / done CTA */}
      {!verificado ? (
        <button
          onClick={handleVerificar}
          disabled={respuesta.trim().length === 0}
          style={{
            width: "100%", padding: "18px 32px", borderRadius: 16, border: "none",
            cursor: respuesta.trim() ? "pointer" : "not-allowed",
            fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em",
            background: respuesta.trim() ? color.hex : "rgba(255,255,255,0.08)",
            color: respuesta.trim() ? "#011126" : "rgba(255,255,255,0.25)",
            boxShadow: respuesta.trim() ? `0 12px 32px rgba(${color.rgba}, 0.28)` : "none",
            fontFamily: "var(--font-epilogue), sans-serif",
            transition: "all 0.25s ease",
          }}
        >
          <i className="fa-solid fa-check-double" style={{ marginRight: 10 }} />
          {contenido.tipo_respuesta === 'desarrollo' ? 'Ver solución' : 'Verificar respuesta'}
        </button>
      ) : correcto ? (
        <div style={{
          padding: "20px 28px", borderRadius: 16,
          background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.22)",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: 24, color: "#4ADE80" }} />
          <p style={{ fontSize: 15, fontWeight: 800, color: "#4ADE80", margin: 0 }}>
            Ejercicio completado. Serás redirigido.
          </p>
        </div>
      ) : null}
    </div>
  );
}
