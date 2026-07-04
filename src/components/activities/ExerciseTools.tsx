"use client";

/**
 * Herramientas flotantes para los ejercicios que requieren cálculo:
 *   · Calculadora científica (Matemáticas y Ciencias) — usa el evaluador puro
 *     de `@/lib/herramientas/calc` (sin eval, seguro).
 *   · Tabla periódica interactiva (Química / CNEyT) — 118 elementos.
 *
 * Es un FAB (botón flotante) abajo a la derecha que abre un panel con pestañas.
 * Cliente puro; no toca el DOM en render; respeta prefers-reduced-motion.
 */

import { useCallback, useMemo, useState } from "react";
import { evaluar, formatearResultado, type ModoAngulo } from "@/lib/herramientas/calc";
import {
  ELEMENTOS,
  CATEGORIA_INFO,
  masaTexto,
  type Elemento,
  type CategoriaElemento,
} from "@/lib/herramientas/tabla-periodica-data";

export type Herramienta = "calc" | "tabla";

export interface ExerciseToolsProps {
  /** Qué herramientas mostrar. Vacío ⇒ no se renderiza nada. */
  tools: Herramienta[];
  /** Color de acento del área (hex). */
  accentHex?: string;
}

/* ────────────────────────────── Calculadora ────────────────────────────── */

type Tecla =
  | { tipo: "ins"; etq: string; val: string }
  | { tipo: "accion"; etq: string; accion: "igual" | "limpiar" | "borrar" };

const TECLAS: Tecla[] = [
  { tipo: "ins", etq: "sin", val: "sin(" },
  { tipo: "ins", etq: "cos", val: "cos(" },
  { tipo: "ins", etq: "tan", val: "tan(" },
  { tipo: "ins", etq: "(", val: "(" },
  { tipo: "ins", etq: ")", val: ")" },

  { tipo: "ins", etq: "ln", val: "ln(" },
  { tipo: "ins", etq: "log", val: "log(" },
  { tipo: "ins", etq: "√", val: "√(" },
  { tipo: "ins", etq: "xʸ", val: "^" },
  { tipo: "ins", etq: "x!", val: "!" },

  { tipo: "ins", etq: "7", val: "7" },
  { tipo: "ins", etq: "8", val: "8" },
  { tipo: "ins", etq: "9", val: "9" },
  { tipo: "ins", etq: "÷", val: "÷" },
  { tipo: "ins", etq: "%", val: "%" },

  { tipo: "ins", etq: "4", val: "4" },
  { tipo: "ins", etq: "5", val: "5" },
  { tipo: "ins", etq: "6", val: "6" },
  { tipo: "ins", etq: "×", val: "×" },
  { tipo: "ins", etq: "π", val: "π" },

  { tipo: "ins", etq: "1", val: "1" },
  { tipo: "ins", etq: "2", val: "2" },
  { tipo: "ins", etq: "3", val: "3" },
  { tipo: "ins", etq: "−", val: "-" },
  { tipo: "ins", etq: "e", val: "e" },

  { tipo: "ins", etq: "0", val: "0" },
  { tipo: "ins", etq: ".", val: "." },
  { tipo: "accion", etq: "⌫", accion: "borrar" },
  { tipo: "ins", etq: "+", val: "+" },
  { tipo: "accion", etq: "=", accion: "igual" },
];

interface EntradaHist {
  expr: string;
  res: string;
}

function Calculadora({ accentHex }: { accentHex: string }) {
  const [expr, setExpr] = useState("");
  const [modo, setModo] = useState<ModoAngulo>("deg");
  const [error, setError] = useState<string | null>(null);
  const [hist, setHist] = useState<EntradaHist[]>([]);

  // Vista previa en vivo del resultado (no destructiva).
  const preview = useMemo(() => {
    if (!expr.trim()) return "";
    const r = evaluar(expr, modo);
    return r.ok ? formatearResultado(r.value) : "";
  }, [expr, modo]);

  const calcular = useCallback(() => {
    if (!expr.trim()) return;
    const r = evaluar(expr, modo);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    const res = formatearResultado(r.value);
    setHist((h) => [{ expr, res }, ...h].slice(0, 12));
    setExpr(res);
    setError(null);
  }, [expr, modo]);

  const onTecla = useCallback(
    (t: Tecla) => {
      setError(null);
      if (t.tipo === "ins") {
        setExpr((e) => e + t.val);
        return;
      }
      if (t.accion === "limpiar") setExpr("");
      else if (t.accion === "borrar") setExpr((e) => e.slice(0, -1));
      else if (t.accion === "igual") calcular();
    },
    [calcular],
  );

  return (
    <div className="et-calc">
      {/* Visor */}
      <div className="et-visor">
        <div className="et-visor-modos">
          <button
            type="button"
            className={`et-modo ${modo === "deg" ? "et-modo-on" : ""}`}
            onClick={() => setModo("deg")}
            aria-pressed={modo === "deg"}
          >
            DEG
          </button>
          <button
            type="button"
            className={`et-modo ${modo === "rad" ? "et-modo-on" : ""}`}
            onClick={() => setModo("rad")}
            aria-pressed={modo === "rad"}
          >
            RAD
          </button>
          <button
            type="button"
            className="et-modo et-modo-clear"
            onClick={() => {
              setExpr("");
              setError(null);
            }}
            aria-label="Limpiar"
          >
            C
          </button>
        </div>
        <input
          className="et-entrada"
          value={expr}
          onChange={(e) => {
            setExpr(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              calcular();
            }
          }}
          placeholder="Escribe o usa el teclado…"
          inputMode="text"
          aria-label="Expresión"
          spellCheck={false}
        />
        <div className="et-resultado">
          {error ? (
            <span className="et-err">{error}</span>
          ) : preview ? (
            <span className="et-prev">= {preview}</span>
          ) : (
            <span className="et-prev et-prev-vacio">= 0</span>
          )}
        </div>
      </div>

      {/* Teclado */}
      <div className="et-teclado">
        {TECLAS.map((t, i) => {
          const esIgual = t.tipo === "accion" && t.accion === "igual";
          return (
            <button
              key={i}
              type="button"
              className={`et-tecla ${esIgual ? "et-tecla-igual" : ""} ${
                t.tipo === "accion" ? "et-tecla-accion" : ""
              }`}
              style={esIgual ? { background: accentHex, borderColor: accentHex } : undefined}
              onClick={() => onTecla(t)}
            >
              {t.etq}
            </button>
          );
        })}
      </div>

      {/* Historial */}
      {hist.length > 0 && (
        <div className="et-hist">
          <div className="et-hist-cab">
            <span>Historial</span>
            <button type="button" className="et-hist-clear" onClick={() => setHist([])}>
              Limpiar
            </button>
          </div>
          {hist.map((h, i) => (
            <button
              key={i}
              type="button"
              className="et-hist-item"
              onClick={() => setExpr(h.res)}
              title="Usar este resultado"
            >
              <span className="et-hist-expr">{h.expr}</span>
              <span className="et-hist-res">= {h.res}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────── Tabla periódica ──────────────────────────── */

function TablaPeriodica({ accentHex }: { accentHex: string }) {
  const [sel, setSel] = useState<Elemento | null>(null);
  const [filtro, setFiltro] = useState<CategoriaElemento | null>(null);

  return (
    <div className="et-tabla-wrap">
      {/* Leyenda / filtro por categoría */}
      <div className="et-leyenda">
        {(Object.keys(CATEGORIA_INFO) as CategoriaElemento[]).map((cat) => {
          const info = CATEGORIA_INFO[cat];
          const activo = filtro === cat;
          return (
            <button
              key={cat}
              type="button"
              className={`et-ley ${activo ? "et-ley-on" : ""}`}
              onClick={() => setFiltro(activo ? null : cat)}
              style={{ ["--c" as string]: info.color }}
            >
              <span className="et-ley-pip" style={{ background: info.color }} />
              {info.label}
            </button>
          );
        })}
      </div>

      {/* Rejilla 18×10 */}
      <div className="et-grid" role="grid" aria-label="Tabla periódica">
        {ELEMENTOS.map((el) => {
          const info = CATEGORIA_INFO[el.categoria];
          const atenuado = filtro !== null && el.categoria !== filtro;
          return (
            <button
              key={el.z}
              type="button"
              className={`et-el ${atenuado ? "et-el-off" : ""}`}
              style={{
                gridColumn: el.x,
                gridRow: el.y,
                ["--c" as string]: info.color,
              }}
              onClick={() => setSel(el)}
              title={`${el.nombre} (${el.sym})`}
            >
              <span className="et-el-z">{el.z}</span>
              <span className="et-el-sym">{el.sym}</span>
            </button>
          );
        })}
        {/* Marcadores del bloque f */}
        <span className="et-fmark" style={{ gridColumn: 3, gridRow: 6 }}>
          57–71
        </span>
        <span className="et-fmark" style={{ gridColumn: 3, gridRow: 7 }}>
          89–103
        </span>
      </div>

      {/* Detalle del elemento seleccionado */}
      {sel && (
        <div
          className="et-detalle"
          style={{ borderColor: CATEGORIA_INFO[sel.categoria].color }}
        >
          <button
            type="button"
            className="et-detalle-x"
            onClick={() => setSel(null)}
            aria-label="Cerrar"
          >
            <i className="fa-solid fa-xmark" />
          </button>
          <div
            className="et-detalle-sym"
            style={{ color: CATEGORIA_INFO[sel.categoria].color }}
          >
            {sel.sym}
          </div>
          <div className="et-detalle-info">
            <div className="et-detalle-nombre">{sel.nombre}</div>
            <div className="et-detalle-cat" style={{ color: CATEGORIA_INFO[sel.categoria].color }}>
              {CATEGORIA_INFO[sel.categoria].label}
            </div>
            <div className="et-detalle-datos">
              <span>
                <strong>Z</strong> {sel.z}
              </span>
              <span>
                <strong>Masa</strong> {masaTexto(sel)}
              </span>
              <span>
                <strong>Periodo</strong> {sel.periodo}
              </span>
              <span>
                <strong>Grupo</strong> {sel.grupo ?? "—"}
              </span>
            </div>
          </div>
        </div>
      )}
      {!sel && (
        <p className="et-hint" style={{ color: accentHex }}>
          Toca un elemento para ver sus datos.
        </p>
      )}
    </div>
  );
}

/* ──────────────────────────────── Wrapper ───────────────────────────────── */

export function ExerciseTools({ tools, accentHex = "#38BDF8" }: ExerciseToolsProps) {
  const [abierto, setAbierto] = useState(false);
  const [tab, setTab] = useState<Herramienta>(tools[0] ?? "calc");

  if (tools.length === 0) return null;

  return (
    <>
      <style>{estilos}</style>

      {/* FAB */}
      <button
        type="button"
        className="et-fab"
        style={{ background: accentHex, boxShadow: `0 8px 28px ${accentHex}55` }}
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-label={abierto ? "Cerrar herramientas" : "Abrir herramientas"}
      >
        <i className={`fa-solid ${abierto ? "fa-xmark" : "fa-calculator"}`} />
        {!abierto && <span className="et-fab-txt">Herramientas</span>}
      </button>

      {/* Panel */}
      {abierto && (
        <>
          <div className="et-backdrop" onClick={() => setAbierto(false)} aria-hidden />
          <div className="et-panel" role="dialog" aria-label="Herramientas del ejercicio">
            <div className="et-panel-cab">
              <div className="et-tabs">
                {tools.includes("calc") && (
                  <button
                    type="button"
                    className={`et-tab ${tab === "calc" ? "et-tab-on" : ""}`}
                    onClick={() => setTab("calc")}
                    style={tab === "calc" ? { color: accentHex, borderColor: accentHex } : undefined}
                  >
                    <i className="fa-solid fa-calculator" /> Calculadora
                  </button>
                )}
                {tools.includes("tabla") && (
                  <button
                    type="button"
                    className={`et-tab ${tab === "tabla" ? "et-tab-on" : ""}`}
                    onClick={() => setTab("tabla")}
                    style={tab === "tabla" ? { color: accentHex, borderColor: accentHex } : undefined}
                  >
                    <i className="fa-solid fa-table-cells" /> Tabla periódica
                  </button>
                )}
              </div>
              <button
                type="button"
                className="et-cerrar"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="et-panel-body">
              {tab === "calc" && tools.includes("calc") && <Calculadora accentHex={accentHex} />}
              {tab === "tabla" && tools.includes("tabla") && <TablaPeriodica accentHex={accentHex} />}
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ──────────────────────────────── Estilos ───────────────────────────────── */

const estilos = `
.et-fab {
  position: fixed; right: 22px; bottom: 22px; z-index: 1200;
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 18px; border: none; border-radius: 999px;
  color: #021018; font-weight: 800; font-size: 14px; cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
  font-family: inherit;
}
.et-fab:hover { transform: translateY(-2px); filter: brightness(1.08); }
.et-fab i { font-size: 16px; }
.et-fab-txt { letter-spacing: 0.01em; }

.et-backdrop {
  position: fixed; inset: 0; z-index: 1199;
  background: rgba(1,8,20,0.55); backdrop-filter: blur(2px);
  animation: et-fade 0.18s ease;
}
.et-panel {
  position: fixed; right: 22px; bottom: 92px; z-index: 1201;
  width: min(440px, calc(100vw - 32px));
  max-height: min(78vh, 720px);
  display: flex; flex-direction: column;
  background: #06182E;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 22px; overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.55);
  animation: et-pop 0.2s cubic-bezier(0.2,0.9,0.3,1.2);
  color: #fff;
  font-family: var(--font-epilogue), 'Plus Jakarta Sans', sans-serif;
}
.et-panel-cab {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}
.et-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.et-tab {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 13px; border-radius: 11px;
  background: rgba(255,255,255,0.04);
  border: 1.5px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.55); font-weight: 700; font-size: 12px;
  cursor: pointer; transition: all 0.18s ease; font-family: inherit;
}
.et-tab:hover { background: rgba(255,255,255,0.08); }
.et-tab-on { background: rgba(255,255,255,0.06); }
.et-cerrar {
  width: 34px; height: 34px; flex-shrink: 0; border-radius: 10px;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.18s ease;
}
.et-cerrar:hover { background: rgba(255,255,255,0.1); color: #fff; }
.et-panel-body { padding: 14px; overflow-y: auto; }

/* Calculadora */
.et-visor {
  background: rgba(0,0,0,0.28); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 12px; margin-bottom: 12px;
}
.et-visor-modos { display: flex; gap: 6px; margin-bottom: 8px; }
.et-modo {
  padding: 4px 11px; border-radius: 8px; font-size: 10px; font-weight: 800;
  letter-spacing: 0.08em; cursor: pointer; font-family: inherit;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.45); transition: all 0.16s ease;
}
.et-modo-on { background: rgba(255,255,255,0.14); color: #fff; }
.et-modo-clear { margin-left: auto; color: #FCA5A5; }
.et-entrada {
  width: 100%; background: transparent; border: none; outline: none;
  color: #fff; font-size: 22px; font-weight: 700; text-align: right;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.et-resultado { text-align: right; min-height: 20px; margin-top: 4px; }
.et-prev { color: #4ADE80; font-size: 15px; font-weight: 700; font-family: ui-monospace, monospace; }
.et-prev-vacio { color: rgba(255,255,255,0.25); }
.et-err { color: #FCA5A5; font-size: 12px; font-weight: 600; }

.et-teclado {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;
}
.et-tecla {
  padding: 13px 0; border-radius: 11px; cursor: pointer;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  color: #fff; font-size: 15px; font-weight: 700; font-family: inherit;
  transition: transform 0.1s ease, background 0.16s ease;
}
.et-tecla:hover { background: rgba(255,255,255,0.11); }
.et-tecla:active { transform: scale(0.94); }
.et-tecla-accion { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.08); }
.et-tecla-igual { color: #021018 !important; font-weight: 900; }

.et-hist { margin-top: 14px; }
.et-hist-cab {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 10px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.12em; color: rgba(255,255,255,0.35); margin-bottom: 8px;
}
.et-hist-clear {
  background: none; border: none; color: rgba(255,255,255,0.35);
  font-size: 10px; font-weight: 700; cursor: pointer; font-family: inherit;
  text-transform: uppercase; letter-spacing: 0.08em;
}
.et-hist-clear:hover { color: #FCA5A5; }
.et-hist-item {
  display: flex; align-items: baseline; justify-content: space-between; gap: 10px;
  width: 100%; padding: 9px 12px; margin-bottom: 5px; border-radius: 10px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer; font-family: ui-monospace, monospace; transition: all 0.16s ease;
}
.et-hist-item:hover { background: rgba(255,255,255,0.07); }
.et-hist-expr { color: rgba(255,255,255,0.5); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.et-hist-res { color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0; }

/* Tabla periódica */
.et-tabla-wrap { display: flex; flex-direction: column; gap: 12px; }
.et-leyenda { display: flex; flex-wrap: wrap; gap: 5px; }
.et-ley {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 9px; border-radius: 999px; cursor: pointer; font-family: inherit;
  font-size: 9.5px; font-weight: 700;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.55); transition: all 0.16s ease;
}
.et-ley:hover { background: rgba(255,255,255,0.08); }
.et-ley-on { border-color: var(--c); color: #fff; background: rgba(255,255,255,0.08); }
.et-ley-pip { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }

.et-grid {
  display: grid;
  grid-template-columns: repeat(18, 1fr);
  grid-auto-rows: 1fr;
  gap: 2px;
  width: 100%;
  aspect-ratio: 18 / 10;
}
.et-el {
  position: relative; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  border-radius: 3px; cursor: pointer; padding: 0;
  background: color-mix(in srgb, var(--c) 20%, transparent);
  border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
  color: #fff; font-family: inherit; overflow: hidden;
  transition: transform 0.12s ease, background 0.16s ease, box-shadow 0.16s ease;
}
.et-el:hover {
  background: color-mix(in srgb, var(--c) 55%, transparent);
  transform: scale(1.18); z-index: 5;
  box-shadow: 0 4px 14px rgba(0,0,0,0.5);
}
.et-el-off { opacity: 0.18; filter: grayscale(0.6); }
.et-el-z { font-size: clamp(4px, 0.8vw, 7px); line-height: 1; opacity: 0.75; }
.et-el-sym { font-size: clamp(7px, 1.5vw, 13px); font-weight: 800; line-height: 1.1; }
.et-fmark {
  display: flex; align-items: center; justify-content: center;
  border-radius: 3px; font-size: clamp(4px, 0.8vw, 7px); font-weight: 700;
  color: rgba(255,255,255,0.3); border: 1px dashed rgba(255,255,255,0.12);
}

.et-detalle {
  display: flex; align-items: center; gap: 16px; position: relative;
  padding: 16px; border-radius: 16px; border: 1.5px solid;
  background: rgba(255,255,255,0.03);
}
.et-detalle-x {
  position: absolute; top: 10px; right: 10px;
  width: 26px; height: 26px; border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5); cursor: pointer; font-size: 11px;
}
.et-detalle-x:hover { color: #fff; background: rgba(255,255,255,0.12); }
.et-detalle-sym { font-size: 46px; font-weight: 900; line-height: 1; flex-shrink: 0; }
.et-detalle-info { flex: 1; min-width: 0; }
.et-detalle-nombre { font-size: 18px; font-weight: 800; }
.et-detalle-cat { font-size: 11px; font-weight: 700; margin-bottom: 8px; }
.et-detalle-datos { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 14px; }
.et-detalle-datos span { font-size: 12px; color: rgba(255,255,255,0.7); }
.et-detalle-datos strong {
  display: inline-block; min-width: 52px; font-size: 9px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4);
}
.et-hint { text-align: center; font-size: 12px; font-weight: 600; margin: 4px 0 0; opacity: 0.7; }

@keyframes et-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes et-pop { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: none; } }

@media (max-width: 640px) {
  .et-fab-txt { display: none; }
  .et-panel { right: 12px; left: 12px; width: auto; bottom: 84px; max-height: 80vh; }
}
@media (prefers-reduced-motion: reduce) {
  .et-fab, .et-backdrop, .et-panel, .et-el, .et-tecla { animation: none !important; transition: none !important; }
}
`;
