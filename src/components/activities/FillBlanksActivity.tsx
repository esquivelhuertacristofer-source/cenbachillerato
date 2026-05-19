'use client';

import { useState, useMemo } from 'react';
import type { ActividadFillBlanks, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: "#34D399", rgba: "52,211,153", faIcon: "fa-pen-line", gradient: "" };

interface Props {
  actividad: ActividadFillBlanks;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
}

export function FillBlanksActivity({ actividad, onProgreso, color = FALLBACK_COLOR }: Props) {
  const { contenido } = actividad;
  const [valores, setValores] = useState<Record<number, string>>({});
  const [enviado, setEnviado] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  const partes = useMemo(() => contenido.texto_con_huecos.split('___'), [contenido.texto_con_huecos]);
  const numHuecos = partes.length - 1;

  function esCorrecta(hueco: number) {
    const h = contenido.huecos[hueco];
    if (!h) return false;
    const v = valores[hueco]?.trim() ?? '';
    const cmp = (a: string, b: string) =>
      contenido.distingue_mayusculas ? a === b : a.toLowerCase() === b.toLowerCase();
    return cmp(v, h.respuesta_correcta) ||
      (h.alternativas_aceptadas ?? []).some(alt => cmp(v, alt));
  }

  function handleEnviar() {
    const correctas = Array.from({ length: numHuecos }, (_, i) => esCorrecta(i)).filter(Boolean).length;
    const puntaje = Math.round((correctas / numHuecos) * 100);
    setEnviado(true);
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: puntaje >= 70,
      puntaje,
      respuestas: valores,
    });
  }

  const completadas = Object.values(valores).filter(v => v.trim().length > 0).length;
  const pct = numHuecos > 0 ? Math.round((completadas / numHuecos) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <style>{`
        .fb-input::placeholder { color: rgba(255,255,255,0.25); }
        .fb-input:focus { outline: none; }
      `}</style>

      {/* Instructions */}
      {contenido.instrucciones && (
        <div style={{
          padding: "16px 20px", borderRadius: 14,
          background: `rgba(${color.rgba}, 0.08)`,
          border: `1px solid rgba(${color.rgba}, 0.18)`,
          fontSize: 14, color: "rgba(255,255,255,0.70)", lineHeight: 1.6, fontStyle: "italic",
        }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: color.hex }} />
          {contenido.instrucciones}
        </div>
      )}

      {/* Text with inline blanks */}
      <div style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        padding: "36px 40px",
        fontSize: 18,
        lineHeight: 2.1,
        color: "rgba(255,255,255,0.85)",
        fontFamily: "var(--font-epilogue), sans-serif",
      }}>
        {partes.map((parte, i) => (
          <span key={i}>
            <span style={{ letterSpacing: "-0.01em" }}>{parte}</span>
            {i < numHuecos && (
              <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", margin: "0 4px", verticalAlign: "middle" }}>
                <input
                  type="text"
                  className="fb-input"
                  disabled={enviado}
                  value={valores[i] ?? ''}
                  onChange={e => setValores(v => ({ ...v, [i]: e.target.value }))}
                  onFocus={() => setFocusedIdx(i)}
                  onBlur={() => setFocusedIdx(null)}
                  placeholder={contenido.huecos[i]?.pista ?? '···'}
                  style={{
                    display: "inline-block",
                    minWidth: 90,
                    width: Math.max(90, (valores[i]?.length ?? 3) * 11 + 20),
                    background: "transparent",
                    border: "none",
                    borderBottom: `2.5px solid ${
                      enviado
                        ? esCorrecta(i) ? "#4ADE80" : "#F87171"
                        : focusedIdx === i ? color.hex : "rgba(255,255,255,0.28)"
                    }`,
                    color: enviado
                      ? esCorrecta(i) ? "#4ADE80" : "#F87171"
                      : "rgba(255,255,255,0.90)",
                    fontSize: 17,
                    fontWeight: 700,
                    fontFamily: "var(--font-epilogue), sans-serif",
                    textAlign: "center",
                    padding: "2px 6px",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                />
                {enviado && !esCorrecta(i) && (
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: "#4ADE80",
                    display: "block", marginTop: 2,
                  }}>
                    ({contenido.huecos[i]?.respuesta_correcta})
                  </span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 999, background: color.hex,
            width: `${pct}%`, transition: "width 0.3s ease",
          }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.40)", whiteSpace: "nowrap" }}>
          {completadas} / {numHuecos} completados
        </span>
      </div>

      {/* CTA */}
      {!enviado ? (
        <button
          onClick={handleEnviar}
          disabled={completadas < numHuecos}
          style={{
            width: "100%", padding: "18px 32px", borderRadius: 16, border: "none",
            cursor: completadas >= numHuecos ? "pointer" : "not-allowed",
            fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em",
            background: completadas >= numHuecos ? color.hex : "rgba(255,255,255,0.08)",
            color: completadas >= numHuecos ? "#011126" : "rgba(255,255,255,0.25)",
            boxShadow: completadas >= numHuecos ? `0 12px 32px rgba(${color.rgba}, 0.28)` : "none",
            fontFamily: "var(--font-epilogue), sans-serif",
            transition: "all 0.25s ease",
          }}
        >
          <i className="fa-solid fa-check-double" style={{ marginRight: 10 }} />
          Verificar respuestas
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
              ¡Actividad completada!
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: "2px 0 0" }}>
              Correctas:{" "}
              {Array.from({ length: numHuecos }, (_, i) => esCorrecta(i)).filter(Boolean).length}
              {" "}de {numHuecos}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
