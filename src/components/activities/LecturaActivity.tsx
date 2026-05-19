'use client';

import { useState } from 'react';
import type { ActividadLectura, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: "#38BDF8", rgba: "56,189,248", faIcon: "fa-book-open", gradient: "" };

interface Props {
  actividad: ActividadLectura;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
}

export function LecturaActivity({ actividad, onProgreso, color = FALLBACK_COLOR }: Props) {
  const { contenido } = actividad;
  const preguntas = contenido.preguntas_comprension ?? [];
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [entregado, setEntregado] = useState(false);

  const paragraphs = contenido.texto
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

  function handleEntregar() {
    setEntregado(true);
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: true,
      puntaje: 100,
      respuestas: preguntas.length > 0 ? respuestas : undefined,
    });
  }

  const card: React.CSSProperties = {
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(12px)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Metadata strip */}
      {(contenido.fuente || contenido.nivel_lectura || contenido.tiempo_estimado_minutos) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {contenido.fuente && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)",
              padding: "4px 12px", borderRadius: 999,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <i className="fa-solid fa-quote-left" style={{ marginRight: 6, fontSize: 9 }} />
              {contenido.fuente}
            </span>
          )}
          {contenido.nivel_lectura && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: color.hex, textTransform: "capitalize",
              padding: "4px 12px", borderRadius: 999,
              background: `rgba(${color.rgba}, 0.10)`, border: `1px solid rgba(${color.rgba}, 0.20)`,
            }}>
              {contenido.nivel_lectura}
            </span>
          )}
          {contenido.tiempo_estimado_minutos && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)",
              padding: "4px 12px", borderRadius: 999,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <i className="fa-regular fa-clock" style={{ marginRight: 6, fontSize: 10 }} />
              {contenido.tiempo_estimado_minutos} min
            </span>
          )}
        </div>
      )}

      {/* Reading body */}
      <div style={{ ...card, padding: "40px 48px" }}>
        {paragraphs.map((para, i) => (
          <p
            key={i}
            style={{
              fontSize: 18,
              lineHeight: 1.85,
              color: "rgba(255,255,255,0.88)",
              margin: i === paragraphs.length - 1 ? 0 : "0 0 1.5em",
              fontFamily: "var(--font-epilogue), 'Plus Jakarta Sans', sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            {para}
          </p>
        ))}
      </div>

      {/* Comprehension questions */}
      {preguntas.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            fontSize: 12, fontWeight: 900, textTransform: "uppercase",
            letterSpacing: "0.25em", color: color.hex,
          }}>
            <i className="fa-solid fa-circle-question" style={{ fontSize: 14 }} />
            Preguntas de comprensión
          </div>

          {preguntas.map((p, i) => (
            <div key={i} style={{ ...card, padding: "24px 28px" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `rgba(${color.rgba}, 0.12)`,
                  border: `1px solid rgba(${color.rgba}, 0.22)`,
                  fontSize: 13, fontWeight: 900, color: color.hex,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.90)",
                    margin: "0 0 12px", lineHeight: 1.5,
                  }}>
                    {p.pregunta}
                  </p>
                  <textarea
                    value={respuestas[i] ?? ''}
                    onChange={e => setRespuestas(r => ({ ...r, [i]: e.target.value }))}
                    disabled={entregado}
                    rows={3}
                    placeholder="Escribe tu respuesta..."
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 12,
                      padding: "12px 16px",
                      fontSize: 14,
                      color: "rgba(255,255,255,0.85)",
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "var(--font-epilogue), sans-serif",
                      lineHeight: 1.6,
                      boxSizing: "border-box",
                    }}
                  />
                  {p.respuesta_guia && entregado && (
                    <div style={{
                      marginTop: 10, padding: "10px 14px",
                      borderRadius: 10,
                      background: `rgba(${color.rgba}, 0.08)`,
                      border: `1px solid rgba(${color.rgba}, 0.18)`,
                      fontSize: 13, color: color.hex, lineHeight: 1.5,
                    }}>
                      <span style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>Respuesta guía</span>
                      {p.respuesta_guia}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      {!entregado ? (
        <button
          onClick={handleEntregar}
          style={{
            width: "100%",
            padding: "18px 32px",
            borderRadius: 16,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            background: color.hex,
            color: "#011126",
            boxShadow: `0 12px 32px rgba(${color.rgba}, 0.30)`,
            transition: "all 0.2s ease",
            fontFamily: "var(--font-epilogue), sans-serif",
          }}
        >
          <i className="fa-solid fa-check" style={{ marginRight: 10 }} />
          Marcar como leída
        </button>
      ) : (
        <div style={{
          padding: "20px 28px",
          borderRadius: 16,
          background: "rgba(74,222,128,0.10)",
          border: "1px solid rgba(74,222,128,0.22)",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: 24, color: "#4ADE80" }} />
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#4ADE80", margin: 0 }}>
              ¡Lectura completada!
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: "2px 0 0" }}>
              Serás redirigido a la progresión en breve.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
