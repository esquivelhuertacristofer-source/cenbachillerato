'use client';

import { useState } from 'react';
import type { ActividadReflexionEscrita, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: "#F87171", rgba: "248,113,113", faIcon: "fa-feather-pointed", gradient: "" };

interface Props {
  actividad: ActividadReflexionEscrita;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
}

export function ReflexionEscritaActivity({ actividad, onProgreso, color = FALLBACK_COLOR }: Props) {
  const { contenido } = actividad;
  const [texto, setTexto] = useState('');
  const [enviado, setEnviado] = useState(false);

  const palabras = texto.trim() === '' ? 0 : texto.trim().split(/\s+/).length;
  const minPalabras = contenido.longitud_minima_palabras ?? 80;
  const cumpleMinimo = palabras >= minPalabras;
  const pct = Math.min(100, Math.round((palabras / minPalabras) * 100));

  function handleEnviar() {
    setEnviado(true);
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: true,
      puntaje: 100,
      respuestas: { texto },
    });
  }

  const card: React.CSSProperties = {
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Prompt */}
      <div style={{
        ...card,
        padding: "32px 36px",
        background: `rgba(${color.rgba}, 0.07)`,
        border: `1.5px solid rgba(${color.rgba}, 0.18)`,
        borderLeft: `4px solid ${color.hex}`,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.25em",
          color: color.hex, marginBottom: 12,
        }}>
          <i className="fa-solid fa-feather-pointed" style={{ marginRight: 8 }} />
          Tu tarea de reflexión
        </div>
        <p style={{
          fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.92)",
          margin: 0, lineHeight: 1.7, letterSpacing: "-0.01em",
        }}>
          {contenido.prompt}
        </p>
        {contenido.formato_esperado && contenido.formato_esperado !== 'libre' && (
          <span style={{
            display: "inline-block", marginTop: 14, fontSize: 11, fontWeight: 700,
            textTransform: "capitalize", color: color.hex, padding: "4px 12px",
            background: `rgba(${color.rgba}, 0.12)`, borderRadius: 999,
            border: `1px solid rgba(${color.rgba}, 0.20)`,
          }}>
            {contenido.formato_esperado}
          </span>
        )}
      </div>

      {/* Hints */}
      {contenido.pistas && contenido.pistas.length > 0 && (
        <div style={{ ...card, padding: "24px 28px" }}>
          <div style={{
            fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.35)", marginBottom: 14,
          }}>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: "#FBBF24" }} />
            Pistas para guiar tu reflexión
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {contenido.pistas.map((pista, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: "rgba(251,191,36,0.15)", color: "#FBBF24",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 900,
                }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.6 }}>
                  {pista}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluation criteria */}
      {contenido.criterios_evaluacion && contenido.criterios_evaluacion.length > 0 && (
        <details style={{ ...card, padding: "0" }}>
          <summary style={{
            padding: "18px 24px", cursor: "pointer",
            fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.55)",
            listStyle: "none", display: "flex", alignItems: "center", gap: 10,
          }}>
            <i className="fa-solid fa-clipboard-list" style={{ fontSize: 12 }} />
            Ver criterios de evaluación
            <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, marginLeft: "auto" }} />
          </summary>
          <div style={{ padding: "0 24px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            {contenido.criterios_evaluacion.map((criterio, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: 11, color: color.hex, marginTop: 3, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", margin: 0, lineHeight: 1.5 }}>
                  {criterio}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Editor */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          disabled={enviado}
          rows={12}
          placeholder="Escribe tu reflexión aquí. Tómate el tiempo necesario para desarrollar tus ideas con profundidad..."
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: `1.5px solid ${cumpleMinimo ? `rgba(${color.rgba}, 0.30)` : "rgba(255,255,255,0.10)"}`,
            borderRadius: 16,
            padding: "20px 24px",
            fontSize: 16,
            color: "rgba(255,255,255,0.88)",
            outline: "none",
            resize: "vertical",
            fontFamily: "var(--font-epilogue), sans-serif",
            lineHeight: 1.75,
            boxSizing: "border-box",
            transition: "border-color 0.25s ease",
          }}
        />

        {/* Word counter with progress bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 999,
              background: cumpleMinimo ? "#4ADE80" : color.hex,
              width: `${pct}%`,
              transition: "width 0.3s ease, background 0.3s ease",
            }} />
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
            color: cumpleMinimo ? "#4ADE80" : "rgba(255,255,255,0.40)",
          }}>
            {palabras} / {minPalabras} palabras
            {cumpleMinimo && " ✓"}
          </span>
        </div>
      </div>

      {/* CTA */}
      {enviado ? (
        <div style={{
          padding: "20px 28px", borderRadius: 16,
          background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.22)",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: 24, color: "#4ADE80" }} />
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#4ADE80", margin: 0 }}>
              ¡Reflexión entregada!
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: "2px 0 0" }}>
              Tu docente la revisará pronto.
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={handleEnviar}
          disabled={!cumpleMinimo}
          style={{
            width: "100%", padding: "18px 32px", borderRadius: 16, border: "none",
            cursor: cumpleMinimo ? "pointer" : "not-allowed",
            fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em",
            background: cumpleMinimo ? color.hex : "rgba(255,255,255,0.08)",
            color: cumpleMinimo ? "#011126" : "rgba(255,255,255,0.25)",
            boxShadow: cumpleMinimo ? `0 12px 32px rgba(${color.rgba}, 0.28)` : "none",
            fontFamily: "var(--font-epilogue), sans-serif",
            transition: "all 0.25s ease",
          }}
        >
          <i className="fa-solid fa-paper-plane" style={{ marginRight: 10 }} />
          {cumpleMinimo ? "Entregar reflexión" : `Faltan ${minPalabras - palabras} palabras`}
        </button>
      )}
    </div>
  );
}
