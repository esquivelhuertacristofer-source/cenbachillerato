"use client";

/**
 * Tarjeta evaluable reutilizable — Ejercicio numérico (parte B del
 * "tratamiento" de los laboratorios de Pensamiento Matemático).
 *
 * Reproduce VERBATIM el ejercicio de la actividad ancla (problema, contexto y
 * pasos guía) dentro del propio lab. El alumno captura el/los resultado(s)
 * numérico(s), comprueba con tolerancia y recibe la retroalimentación verbatim
 * (pasos guía + respuesta final del ejercicio).
 *
 * Es la pieza reutilizable #3 del rediseño: cada Lab*.tsx cuyo ancla sea un
 * `ejercicio_matematico` le pasa su `RetoNumericoData` (datos puros).
 *
 * NO importa three: seguro de usar desde cualquier shell.
 */

import { useState } from "react";
import { T, NUM, OK, card, Eyebrow } from "./_kit";

/* ── Forma de datos (la llena cada lab, verbatim del ejercicio ancla) ──── */
export interface RetoCampo {
  etiqueta: string;
  /** Valor correcto (extraído de la respuesta final verbatim). */
  objetivo: number;
  /** Tolerancia absoluta aceptada. */
  tolerancia: number;
  unidad?: string;
  /** Placeholder opcional del input. */
  placeholder?: string;
}
export interface RetoNumericoData {
  titulo: string;
  /** Contexto verbatim del ejercicio. */
  contexto: string;
  /** Enunciado del problema verbatim. */
  problema: string;
  campos: RetoCampo[];
  /** Pasos guía verbatim (se muestran al acertar). */
  pasosGuia: string[];
  /** Respuesta final verbatim. */
  respuestaFinal: string;
}

const WARN = "#FF8A3C";

export function RetoNumericoCard({
  reto,
  accent,
  aprobado,
  onAprobado,
  playSfx,
}: {
  reto: RetoNumericoData;
  accent: string;
  aprobado: boolean;
  onAprobado: () => void;
  /** Sonido al comprobar (ok = aprobó). */
  playSfx?: (ok: boolean) => void;
}) {
  const [vals, setVals] = useState<string[]>(() => Array(reto.campos.length).fill(""));
  const [comprobado, setComprobado] = useState(false);

  const set = (i: number, v: string) => {
    setVals((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    setComprobado(false);
  };

  const evalCampo = (i: number): boolean => {
    const raw = (vals[i] ?? "").trim().replace(/[\s,$%]/g, (m) => (m === "," ? "." : ""));
    const num = Number(raw);
    if (raw === "" || Number.isNaN(num)) return false;
    const campo = reto.campos[i]!;
    return Math.abs(num - campo.objetivo) <= campo.tolerancia;
  };

  const todoOk = reto.campos.every((_, i) => evalCampo(i));
  const respondioTodo = vals.every((v) => v.trim() !== "");

  const comprobar = () => {
    setComprobado(true);
    if (todoOk) onAprobado();
    playSfx?.(todoOk);
  };

  const reintentar = () => {
    setVals(Array(reto.campos.length).fill(""));
    setComprobado(false);
  };

  return (
    <div style={{ ...card, padding: "22px 24px 24px", marginTop: 22 }}>
      <style>{`
        .rn-num { width:100%; box-sizing:border-box; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:#fff; font-size:18px; font-weight:900; text-align:center; padding:12px 12px; outline:none; transition:border-color .15s; }
        .rn-num:focus { border-color:${accent}; }
        .rn-num::-webkit-outer-spin-button, .rn-num::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
        .rn-num { -moz-appearance:textfield; }
        .rn-btn { cursor:pointer; border:none; border-radius:12px; font-size:14px; font-weight:800; padding:13px 18px; transition:all .15s; }
        .rn-btn-primary { background:${accent}; color:#04121f; }
        .rn-btn-primary:hover:not(:disabled) { filter:brightness(1.08); }
        .rn-btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
        .rn-btn-ghost { background:${T.glass}; border:1px solid ${T.line}; color:#fff; }
        .rn-btn-ghost:hover { border-color:${accent}; }
      `}</style>

      <Eyebrow>
        <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />
        Reto evaluable · {reto.titulo}
      </Eyebrow>

      {/* Enunciado verbatim */}
      <div style={{ marginTop: 6, fontSize: 15, fontWeight: 800, color: T.text, lineHeight: 1.55, whiteSpace: "pre-line" }}>
        {reto.problema}
      </div>
      <div style={{ marginTop: 10, fontSize: 12.5, color: T.text2, lineHeight: 1.5, borderRadius: 12, border: `1px solid ${T.line}`, background: T.inset, padding: "10px 14px" }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: accent }} />
        {reto.contexto}
      </div>

      {/* Campos numéricos */}
      <div style={{ display: "grid", gridTemplateColumns: reto.campos.length > 1 ? "repeat(auto-fit, minmax(180px, 1fr))" : "1fr", gap: 14, marginTop: 18 }}>
        {reto.campos.map((c, i) => {
          const ok = comprobado && evalCampo(i);
          const bad = comprobado && !evalCampo(i);
          return (
            <div key={i}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.text2, marginBottom: 7, lineHeight: 1.35 }}>{c.etiqueta}</div>
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                <input
                  className="rn-num"
                  type="number"
                  inputMode="decimal"
                  placeholder={c.placeholder ?? "?"}
                  value={vals[i] ?? ""}
                  onChange={(e) => set(i, e.target.value)}
                  style={{ flex: 1, borderColor: ok ? OK : bad ? WARN : undefined }}
                />
                {c.unidad && <span style={{ fontSize: 15, fontWeight: 900, color: T.text2, whiteSpace: "nowrap" }}>{c.unidad}</span>}
                {comprobado && (
                  <i className={`fa-solid ${ok ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: ok ? OK : WARN, fontSize: 17 }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Acciones */}
      <div style={{ display: "flex", gap: 10, marginTop: 18, alignItems: "center", flexWrap: "wrap" }}>
        <button className="rn-btn rn-btn-primary" onClick={comprobar} disabled={!respondioTodo}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
          Comprobar
        </button>
        {comprobado && (
          <button className="rn-btn rn-btn-ghost" onClick={reintentar}>
            <i className="fa-solid fa-arrow-rotate-left" style={{ marginRight: 8 }} />
            Reintentar
          </button>
        )}
        {aprobado && (
          <span style={{ fontSize: 12.5, fontWeight: 700, color: OK, marginLeft: "auto" }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 7 }} />
            Reto resuelto
          </span>
        )}
      </div>

      {/* Retroalimentación */}
      {comprobado && (
        <div
          style={{
            marginTop: 14,
            borderRadius: 13,
            border: `1px solid ${todoOk ? OK : WARN}66`,
            background: `${todoOk ? OK : WARN}14`,
            padding: "14px 16px",
            fontSize: 13,
            color: T.text,
            lineHeight: 1.5,
          }}
        >
          {todoOk ? (
            <>
              <div style={{ fontWeight: 900, color: OK, marginBottom: 8 }}>
                <i className="fa-solid fa-trophy" style={{ marginRight: 8 }} />
                ¡Correcto! {reto.respuestaFinal}
              </div>
              <ol style={{ margin: "0 0 0 18px", padding: 0, color: T.text2, display: "flex", flexDirection: "column", gap: 4 }}>
                {reto.pasosGuia.map((p, i) => (
                  <li key={i} style={{ ...NUM }}>{p}</li>
                ))}
              </ol>
            </>
          ) : (
            <div style={{ color: "#FFB27A" }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
              Aún no. Revisa los pasos: las casillas en rojo no coinciden con el resultado esperado. Verifica tu procedimiento y reintenta.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
