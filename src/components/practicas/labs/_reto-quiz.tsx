"use client";

/**
 * Tarjeta evaluable reutilizable — Quiz de opción múltiple (parte B del
 * "tratamiento" de los laboratorios).
 *
 * Reproduce VERBATIM el quiz de la actividad ancla dentro del propio lab: el
 * alumno selecciona una opción por reactivo, comprueba, recibe la
 * retroalimentación verbatim, ve su puntaje y aprueba al alcanzar el mínimo.
 *
 * Es la pieza reutilizable #2 del rediseño: cada Lab*.tsx cuyo ancla sea un
 * quiz le pasa su `QuizEvaluable` (datos puros) y obtiene la misma experiencia.
 *
 * NO importa three: seguro de usar desde cualquier shell.
 */

import { useMemo, useState } from "react";
import { T, NUM, OK, card, Eyebrow } from "./_kit";

/* ── Forma de datos (la llena cada lab, verbatim del quiz ancla) ───────── */
export interface QuizReactivo {
  enunciado: string;
  opciones: string[];
  /** Índice (0-based) de la opción correcta. */
  respuestaCorrecta: number;
  retroalimentacion: string;
}
export interface QuizEvaluable {
  titulo: string;
  /** % mínimo para aprobar (verbatim del quiz ancla). */
  puntajeMinimo: number;
  reactivos: QuizReactivo[];
}

const WARN = "#FF8A3C";

export function RetoQuizCard({
  quiz,
  accent,
  rgba,
  aprobado,
  onAprobado,
  playSfx,
  playPick,
  mensajeAprobado,
}: {
  quiz: QuizEvaluable;
  accent: string;
  rgba: string; // "r,g,b"
  aprobado: boolean;
  onAprobado: () => void;
  /** Sonido al comprobar (ok = aprobó). */
  playSfx?: (ok: boolean) => void;
  /** Sonido al seleccionar una opción. */
  playPick?: () => void;
  /** Mensaje al aprobar (p.ej. "Dominas la estructura del átomo."). Por defecto, genérico. */
  mensajeAprobado?: string;
}) {
  const elogio = mensajeAprobado ?? "¡Aprobado! Dominas el tema.";
  const n = quiz.reactivos.length;
  const [sel, setSel] = useState<(number | null)[]>(() => Array(n).fill(null));
  const [comprobado, setComprobado] = useState(false);

  const elegir = (iReactivo: number, iOpcion: number) => {
    setSel((prev) => {
      const next = [...prev];
      next[iReactivo] = iOpcion;
      return next;
    });
    setComprobado(false);
    playPick?.();
  };

  const aciertos = useMemo(
    () => quiz.reactivos.reduce((acc, r, i) => {
      const selected = sel[i];
      if (selected === null || r.respuestaCorrecta >= r.opciones.length) return acc;
      return acc + (selected === r.respuestaCorrecta ? 1 : 0);
    }, 0),
    [sel, quiz.reactivos],
  );
  const puntaje = Math.round((aciertos / n) * 100);
  const aprueba = puntaje >= quiz.puntajeMinimo;
  const respondioTodo = sel.every((s) => s !== null);

  const comprobar = () => {
    setComprobado(true);
    if (aprueba) onAprobado();
    playSfx?.(aprueba);
  };

  const reintentar = () => {
    setSel(Array(n).fill(null));
    setComprobado(false);
  };

  return (
    <div style={{ ...card, padding: "22px 24px 24px", marginTop: 22 }}>
      <style>{`
        .rq-opt { cursor:pointer; display:flex; align-items:center; gap:12px; width:100%; text-align:left;
          border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-size:13.5px; font-weight:600; padding:11px 14px; transition:all .14s ease; }
        .rq-opt:hover:not(:disabled) { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .rq-opt:disabled { cursor:default; }
        .rq-opt[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.16); color:#fff; box-shadow:0 0 16px -7px ${accent}; }
        .rq-opt[data-ok="true"] { border-color:${OK}; background:${OK}1c; color:#fff; }
        .rq-opt[data-bad="true"] { border-color:${WARN}; background:${WARN}1c; color:#fff; }
        .rq-bullet { flex-shrink:0; width:26px; height:26px; border-radius:8px; display:flex; align-items:center;
          justify-content:center; font-size:12px; font-weight:900; border:1px solid ${T.line}; color:${T.text3}; }
        .rq-opt[data-sel="true"] .rq-bullet { background:${accent}; color:#04121f; border-color:${accent}; }
        .rq-opt[data-ok="true"] .rq-bullet { background:${OK}; color:#04121f; border-color:${OK}; }
        .rq-opt[data-bad="true"] .rq-bullet { background:${WARN}; color:#04121f; border-color:${WARN}; }
        .rq-btn { cursor:pointer; border:none; border-radius:12px; font-size:14px; font-weight:800; padding:13px 18px; transition:all .15s; }
        .rq-btn-primary { background:${accent}; color:#04121f; }
        .rq-btn-primary:hover:not(:disabled) { filter:brightness(1.08); }
        .rq-btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
        .rq-btn-ghost { background:${T.glass}; border:1px solid ${T.line}; color:#fff; }
        .rq-btn-ghost:hover { border-color:${accent}; }
      `}</style>

      <Eyebrow>
        <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
        Reto evaluable · {quiz.titulo}
      </Eyebrow>
      <div style={{ marginTop: 4, fontSize: 13, color: T.text2, lineHeight: 1.5 }}>
        Responde el cuestionario de la actividad. Necesitas{" "}
        <strong style={{ color: T.text, ...NUM }}>{quiz.puntajeMinimo}%</strong> para aprobar.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 18 }}>
        {quiz.reactivos.map((r, i) => {
          const elegida = sel[i];
          return (
            <div key={i}>
              <div id={`rq-q-${i}`} style={{ fontSize: 14.5, fontWeight: 800, color: T.text, lineHeight: 1.45, marginBottom: 10 }}>
                <span style={{ color: accent, ...NUM }}>{i + 1}.</span> {r.enunciado}
              </div>
              <div role="radiogroup" aria-labelledby={`rq-q-${i}`} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {r.opciones.map((op, j) => {
                  const isSel = elegida === j;
                  const showOk = comprobado && j === r.respuestaCorrecta && r.respuestaCorrecta < r.opciones.length;
                  const showBad = comprobado && isSel && j !== r.respuestaCorrecta;
                  return (
                    <button
                      key={j}
                      className="rq-opt"
                      role="radio"
                      aria-checked={isSel}
                      data-sel={isSel && !comprobado}
                      data-ok={showOk}
                      data-bad={showBad}
                      disabled={comprobado}
                      onClick={() => elegir(i, j)}
                    >
                      <span className="rq-bullet">{String.fromCharCode(65 + j)}</span>
                      <span style={{ flex: 1 }}>{op}</span>
                      {showOk && <i className="fa-solid fa-circle-check" style={{ color: OK }} />}
                      {showBad && <i className="fa-solid fa-circle-xmark" style={{ color: WARN }} />}
                    </button>
                  );
                })}
              </div>
              {comprobado && (
                <div
                  style={{
                    marginTop: 9,
                    fontSize: 12.5,
                    color: T.text2,
                    lineHeight: 1.5,
                    borderRadius: 10,
                    border: `1px solid ${T.line}`,
                    background: T.inset,
                    padding: "9px 13px",
                  }}
                >
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: accent }} />
                  {r.retroalimentacion}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Acciones */}
      <div style={{ display: "flex", gap: 10, marginTop: 20, alignItems: "center", flexWrap: "wrap" }}>
        <button className="rq-btn rq-btn-primary" onClick={comprobar} disabled={!respondioTodo}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
          Comprobar
        </button>
        {comprobado && (
          <button className="rq-btn rq-btn-ghost" onClick={reintentar}>
            <i className="fa-solid fa-arrow-rotate-left" style={{ marginRight: 8 }} />
            Reintentar
          </button>
        )}
        {!respondioTodo && !comprobado && (
          <span style={{ fontSize: 12.5, color: T.text3 }}>
            Responde los {n} reactivos para comprobar.
          </span>
        )}
        {aprobado && (
          <span style={{ fontSize: 12.5, fontWeight: 700, color: OK, marginLeft: "auto" }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 7 }} />
            Reto aprobado
          </span>
        )}
      </div>

      {/* Resultado */}
      {comprobado && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: 14,
            borderRadius: 13,
            border: `1px solid ${aprueba ? OK : WARN}66`,
            background: `${aprueba ? OK : WARN}14`,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 13,
          }}
        >
          <i
            className={`fa-solid ${aprueba ? "fa-trophy" : "fa-triangle-exclamation"}`}
            style={{ color: aprueba ? OK : WARN, fontSize: 22 }}
          />
          <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.5 }}>
            <strong style={{ color: aprueba ? OK : WARN, ...NUM }}>
              {aciertos} / {n} correctas · {puntaje}%
            </strong>
            {aprueba ? (
              <span> — {elogio}</span>
            ) : (
              <span> — Aún no llegas al {quiz.puntajeMinimo}%. Revisa la retroalimentación y reintenta.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
