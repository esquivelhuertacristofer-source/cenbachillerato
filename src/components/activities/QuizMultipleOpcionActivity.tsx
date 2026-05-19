'use client';

import { useState } from 'react';
import type { ActividadQuizMultipleOpcion, CallbackProgreso } from '@/types/activities';
import type { AreaColor } from '@/components/hub/hub-colors';

const FALLBACK_COLOR: AreaColor = { hex: "#A78BFA", rgba: "167,139,250", faIcon: "fa-circle-dot", gradient: "" };
const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

interface Props {
  actividad: ActividadQuizMultipleOpcion;
  onProgreso?: CallbackProgreso;
  color?: AreaColor;
}

export function QuizMultipleOpcionActivity({ actividad, onProgreso, color = FALLBACK_COLOR }: Props) {
  const { contenido } = actividad;
  const preguntas = contenido.preguntas;
  const total = preguntas.length;
  const minPuntaje = contenido.puntaje_minimo_aprobacion ?? 70;

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [verified, setVerified] = useState<Set<number>>(new Set());
  const [showSummary, setShowSummary] = useState(false);
  const [entregado, setEntregado] = useState(false);

  const pregunta = preguntas[currentQ]!;
  const isVerified = verified.has(currentQ);
  const seleccionadaIdx = selected[currentQ];
  const isLast = currentQ === total - 1;

  function handleSelectOption(oi: number) {
    if (isVerified) return;
    setSelected(s => ({ ...s, [currentQ]: oi }));
    setVerified(v => new Set([...v, currentQ]));
  }

  function handleNext() {
    if (isLast) {
      setShowSummary(true);
    } else {
      setCurrentQ(q => q + 1);
    }
  }

  function calcPuntaje() {
    let correctas = 0;
    preguntas.forEach((p, i) => {
      if (selected[i] === p.respuesta_correcta) correctas++;
    });
    return Math.round((correctas / total) * 100);
  }

  function handleEntregar() {
    const puntaje = calcPuntaje();
    setEntregado(true);
    onProgreso?.({
      actividadId: actividad.id ?? '',
      completada: puntaje >= minPuntaje,
      puntaje,
      respuestas: selected,
    });
  }

  const card: React.CSSProperties = {
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
  };

  /* ── SUMMARY SCREEN ── */
  if (showSummary) {
    const puntaje = calcPuntaje();
    const aprobado = puntaje >= minPuntaje;
    const correctas = preguntas.filter((p, i) => selected[i] === p.respuesta_correcta).length;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Score hero */}
        <div style={{
          ...card,
          padding: "40px 32px",
          textAlign: "center",
          background: aprobado ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
          border: aprobado ? "1px solid rgba(74,222,128,0.20)" : "1px solid rgba(248,113,113,0.20)",
        }}>
          <div style={{
            fontSize: 72, fontWeight: 900, letterSpacing: "-0.05em",
            color: aprobado ? "#4ADE80" : "#F87171",
            lineHeight: 1, marginBottom: 8,
          }}>
            {puntaje}%
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: aprobado ? "#4ADE80" : "#F87171", margin: "0 0 4px" }}>
            {aprobado ? "¡Aprobado!" : "No aprobado"}
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            {correctas} de {total} correctas · Mínimo: {minPuntaje}%
          </p>
        </div>

        {/* Per-question summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {preguntas.map((p, i) => {
            const isOk = selected[i] === p.respuesta_correcta;
            return (
              <div key={i} style={{
                ...card,
                padding: "16px 20px",
                background: isOk ? "rgba(74,222,128,0.06)" : "rgba(248,113,113,0.06)",
                border: isOk ? "1px solid rgba(74,222,128,0.16)" : "1px solid rgba(248,113,113,0.16)",
                display: "flex", alignItems: "flex-start", gap: 14,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12,
                  background: isOk ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)",
                  color: isOk ? "#4ADE80" : "#F87171",
                }}>
                  <i className={`fa-solid ${isOk ? "fa-check" : "fa-xmark"}`} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.80)", margin: "0 0 4px", lineHeight: 1.4 }}>
                    {p.enunciado}
                  </p>
                  {!isOk && (
                    <p style={{ fontSize: 12, color: "#4ADE80", margin: 0 }}>
                      Correcta: {OPTION_LETTERS[p.respuesta_correcta]} — {p.opciones[p.respuesta_correcta]}
                    </p>
                  )}
                  {p.retroalimentacion && (
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", margin: "4px 0 0", fontStyle: "italic" }}>
                      {p.retroalimentacion}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!entregado ? (
          <button
            onClick={handleEntregar}
            style={{
              width: "100%", padding: "18px 32px", borderRadius: 16, border: "none",
              cursor: "pointer", fontSize: 14, fontWeight: 900, textTransform: "uppercase",
              letterSpacing: "0.12em", background: aprobado ? "#4ADE80" : color.hex,
              color: "#011126", boxShadow: `0 12px 32px rgba(${color.rgba}, 0.28)`,
              fontFamily: "var(--font-epilogue), sans-serif",
            }}
          >
            <i className="fa-solid fa-paper-plane" style={{ marginRight: 10 }} />
            Entregar quiz
          </button>
        ) : (
          <div style={{
            padding: "20px 28px", borderRadius: 16,
            background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.22)",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: 24, color: "#4ADE80" }} />
            <p style={{ fontSize: 15, fontWeight: 800, color: "#4ADE80", margin: 0 }}>
              Quiz entregado correctamente.
            </p>
          </div>
        )}
      </div>
    );
  }

  /* ── ONE QUESTION PER SCREEN ── */
  const progPct = ((currentQ + (isVerified ? 1 : 0)) / total) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Progress bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.40)" }}>
            Pregunta {currentQ + 1} de {total}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: color.hex }}>
            {Math.round(progPct)}%
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.08)" }}>
          <div style={{
            height: "100%", borderRadius: 999,
            background: color.hex,
            width: `${progPct}%`,
            transition: "width 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
          }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ ...card, padding: "32px 36px" }}>
        <p style={{
          fontSize: "clamp(17px, 2.2vw, 22px)",
          fontWeight: 700,
          color: "rgba(255,255,255,0.95)",
          margin: 0,
          lineHeight: 1.5,
          letterSpacing: "-0.02em",
        }}>
          {pregunta.enunciado}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pregunta.opciones.map((opcion, oi) => {
          const isSelected = seleccionadaIdx === oi;
          const isCorrect = pregunta.respuesta_correcta === oi;
          const showCorrect = isVerified && isCorrect;
          const showWrong = isVerified && isSelected && !isCorrect;

          let bg = "rgba(255,255,255,0.04)";
          let border = "1px solid rgba(255,255,255,0.08)";
          let textColor = "rgba(255,255,255,0.75)";
          let letterBg = "rgba(255,255,255,0.08)";
          let letterColor = "rgba(255,255,255,0.40)";

          if (showCorrect) {
            bg = "rgba(74,222,128,0.10)"; border = "1.5px solid rgba(74,222,128,0.35)";
            textColor = "#fff"; letterBg = "rgba(74,222,128,0.20)"; letterColor = "#4ADE80";
          } else if (showWrong) {
            bg = "rgba(248,113,113,0.10)"; border = "1.5px solid rgba(248,113,113,0.35)";
            textColor = "#fff"; letterBg = "rgba(248,113,113,0.20)"; letterColor = "#F87171";
          } else if (isSelected) {
            bg = `rgba(${color.rgba}, 0.10)`; border = `1.5px solid rgba(${color.rgba}, 0.35)`;
            textColor = "#fff"; letterBg = `rgba(${color.rgba}, 0.20)`; letterColor = color.hex;
          }

          return (
            <button
              key={oi}
              onClick={() => handleSelectOption(oi)}
              disabled={isVerified}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 16,
                padding: "18px 20px", borderRadius: 16,
                background: bg, border, cursor: isVerified ? "default" : "pointer",
                textAlign: "left", transition: "all 0.2s ease",
                fontFamily: "var(--font-epilogue), sans-serif",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 900, background: letterBg, color: letterColor,
                transition: "all 0.2s ease",
              }}>
                {showCorrect ? <i className="fa-solid fa-check" /> : showWrong ? <i className="fa-solid fa-xmark" /> : OPTION_LETTERS[oi]}
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: textColor, lineHeight: 1.4 }}>
                {opcion}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {isVerified && pregunta.retroalimentacion && (
        <div style={{
          padding: "16px 20px", borderRadius: 14,
          background: `rgba(${color.rgba}, 0.08)`,
          border: `1px solid rgba(${color.rgba}, 0.18)`,
          fontSize: 13, color: "rgba(255,255,255,0.70)", lineHeight: 1.5, fontStyle: "italic",
        }}>
          <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: color.hex }} />
          {pregunta.retroalimentacion}
        </div>
      )}

      {/* Next button */}
      {isVerified && (
        <button
          onClick={handleNext}
          style={{
            width: "100%", padding: "18px 32px", borderRadius: 16, border: "none",
            cursor: "pointer", fontSize: 14, fontWeight: 900, textTransform: "uppercase",
            letterSpacing: "0.12em", background: color.hex, color: "#011126",
            boxShadow: `0 12px 32px rgba(${color.rgba}, 0.28)`,
            fontFamily: "var(--font-epilogue), sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          {isLast ? "Ver resultados" : "Siguiente pregunta"}
          <i className={`fa-solid ${isLast ? "fa-chart-bar" : "fa-arrow-right"}`} style={{ fontSize: 12 }} />
        </button>
      )}
    </div>
  );
}
