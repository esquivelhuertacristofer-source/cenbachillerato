"use client";

/**
 * Laboratorio 3D — La derivada: la secante que se vuelve tangente (cociente de
 * Newton).
 * Práctica experimental para PM-V-P03-A2 (ejercicio_matematico "Derivando desde
 * la definición: el cociente de Newton"; progresión 3, UAC PM-V Cálculo
 * Diferencial).
 *
 * El alumno elige una función, fija el punto de tangencia a y reduce la
 * separación h: la recta SECANTE (cociente de Newton) se confunde con la
 * TANGENTE y su pendiente tiende a la DERIVADA f'(a). Un medidor muestra en
 * vivo cuánto se separan las dos pendientes.
 * Casos verbatim del A2:
 *  (c) f(x)=x²  → tangente en x=2 es y=4x−4   (default)
 *  (a) f(x)=x²+3x → f'(x)=2x+3
 *  (b) f(x)=1/x  → f'(x)=−1/x²
 * + caso físico (verbatim A1): h(t)=−5t²+30t → velocidad h'(t)=−10t+30.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { DERIVADA_FICHA } from "./derivada-secante-tangente-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./derivada-secante-tangente-data";
import { LabSfx } from "./lab-audio";
import {
  FUNCIONES, func, evalFunc, deriv, pendienteSecante, tangente, cruzaCorte,
  tablaSecante, rectaStr, conUnidad,
  IDEAS, DATOS, fmt1, fmt2, fmt3,
  FUNC_DEF, H_MIN, H_MAX, H_DEF, H_STEP, type FuncId,
} from "./derivada-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-derivada-secante-tangente-reto";

const DerivadaScene = dynamic(() => import("./DerivadaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-ruler-combined fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Dibujando el plano…</span>
    </div>
  ),
});

const SEC_COL = "#fbbf24";   // secante (cociente de Newton)
const TAN_COL = "#34D399";   // tangente (derivada)
const Q_COL = "#f472b6";     // segundo punto a+h
const A_COL = "#7dd3fc";     // punto de tangencia a

export function LabDerivada({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [funcId, setFuncId] = useState<FuncId>(FUNC_DEF);
  const [aPos, setAPos] = useState<number>(func(FUNC_DEF).aDef);
  const [hSep, setHSep] = useState<number>(H_DEF);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // Misiones: lo hecho NO se des-cumple al cambiar de función ni de a.
  const [abrio, setAbrio] = useState(false);
  const [cerro, setCerro] = useState(false);
  const [exploro, setExploro] = useState(false);
  const [animo, setAnimo] = useState(false);
  const [verbatim, setVerbatim] = useState(false);

  const toggleSonido = useCallback(async () => {
    if (!audioRef.current) audioRef.current = new LabSfx();
    const sfx = audioRef.current;
    if (sonido) {
      sfx.mute();
      setSonido(false);
    } else {
      await sfx.enable();
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  const f = useMemo(() => func(funcId), [funcId]);

  // Animación: h oscila entre H_MAX y H_MIN → la secante "se cierra" sobre la
  // tangente una y otra vez (ilustra el límite h → 0).
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = -1; // empieza cerrándose hacia h = 0
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setHSep((prev) => {
        let next = prev + dir * dt * (H_MAX - H_MIN) * 0.45;
        if (next <= H_MIN) { next = H_MIN; dir = 1; }
        else if (next >= H_MAX) { next = H_MAX; dir = -1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const bump = () => setResetNonce((n) => n + 1);
  const elegirFunc = (id: FuncId) => {
    if (sonido) audioRef.current?.blip();
    setPlaying(false);
    setFuncId(id);
    setAPos(func(id).aDef);
    setHSep(H_DEF);
    if (id !== FUNC_DEF) setExploro(true);
    bump();
  };
  const reset = () => {
    setPlaying(false);
    setFuncId(FUNC_DEF);
    setAPos(func(FUNC_DEF).aDef);
    setHSep(H_DEF);
    bump();
  };

  // valores en vivo
  const fa = evalFunc(funcId, aPos);
  const mDer = deriv(funcId, aPos);
  const mSec = pendienteSecante(funcId, aPos, hSep);
  const { m: mt, b: bt } = tangente(funcId, aPos);
  const secValida = !cruzaCorte(funcId, aPos, hSep) && Number.isFinite(mSec);
  const tabla = useMemo(() => tablaSecante(funcId, aPos), [funcId, aPos]);
  const esVerbatimTangente = funcId === "cuadratica" && Math.abs(aPos - 2) < 1e-6;
  const brecha = secValida ? Math.abs(mSec - mDer) : NaN;

  // Ajustes durante el render (patrón de React): marcan hitos sin des-cumplirlos.
  if (!abrio && hSep >= 1.5) setAbrio(true);
  if (!cerro && hSep <= 0.15) setCerro(true);
  if (!verbatim && esVerbatimTangente) setVerbatim(true);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${f.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{f.titulo}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: la secante por (a, f(a)) y (a+h, f(a+h)) se vuelve tangente cuando h→0, y su pendiente es la derivada {f.derivExpr}.
      </div>
    </div>
  );

  const lectura = secValida
    ? <>secante {fmt3(mSec)} → derivada {fmt3(mDer)}</>
    : <>La secante cruza un corte; cambia h o a</>;

  const chip = (activo: boolean, col: string): CSSProperties => ({
    cursor: "pointer", padding: "9px 12px", borderRadius: 12, fontSize: 14, fontWeight: 800,
    border: `1px solid ${activo ? col : T.line}`, background: activo ? `${col}26` : T.inset, color: activo ? "#fff" : T.text2,
    display: "inline-flex", alignItems: "center", gap: 7, minHeight: 40,
  });

  // Medidor: qué tan separada está la secante de la tangente (en pendiente).
  const tope = Math.max(Math.abs(mDer), Math.abs(secValida ? mSec : 0), 1) * 1.15;
  const barra = (txt: string, val: number, c: string) => (
    <div style={{ display: "grid", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>{txt}</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{Number.isFinite(val) ? fmt3(val) : "—"}</span>
      </div>
      <div style={{ height: 8, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${Number.isFinite(val) ? Math.min(100, (Math.abs(val) / tope) * 100) : 0}%`, height: "100%", background: c, transition: "width 120ms linear" }} />
      </div>
    </div>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <DerivadaScene funcId={funcId} aPos={aPos} hSep={hSep} accent={accent} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Cerrar la secante (h→0)"} activo={playing} onClick={() => { setPlaying((p) => !p); setAnimo(true); }} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <div style={{ display: "grid", gap: 6, width: 190 }}>
          {barra("pendiente secante", secValida ? mSec : NaN, SEC_COL)}
          {barra("derivada f'(a)", mDer, TAN_COL)}
          <div style={{ fontSize: 14, fontWeight: 900, color: secValida && brecha < 0.1 ? TAN_COL : SEC_COL }}>
            {secValida ? `diferencia: ${fmt3(brecha)}` : "sin secante válida"}
          </div>
        </div>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Abre h al máximo: la secante se aparta de la tangente", done: abrio },
        { txt: "Reduce h hacia 0 y observa la secante → tangente", done: cerro },
        { txt: "Explora las 4 funciones disponibles", done: exploro },
        { txt: "Activa la animación h→0 (botón play)", done: animo },
        { txt: "Observa el caso verbatim A2 (c): x², x=2, y=4x−4", done: verbatim },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Cierra la secante" icono="fa-ruler-combined">
                <Deslizador
                  label="separación h (cociente de Newton)"
                  icon="fa-arrows-left-right-to-line"
                  colr={SEC_COL}
                  valor={fmt2(hSep)}
                  min={H_MIN} max={H_MAX} step={H_STEP} value={hSep}
                  onChange={(v) => { setPlaying(false); setHSep(v); }}
                  hintL={`h→0 (${fmt2(H_MIN)})`} hintR={fmt1(H_MAX)}
                />
                <Deslizador
                  label="punto de tangencia a"
                  icon="fa-crosshairs"
                  colr={A_COL}
                  valor={conUnidad(aPos, f.unidadX, 2)}
                  min={f.aMin} max={f.aMax} step={0.05} value={aPos}
                  onChange={(v) => { setPlaying(false); setAPos(v); }}
                  hintL={conUnidad(f.aMin, f.unidadX, 1)} hintR={conUnidad(f.aMax, f.unidadX, 1)}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {FUNCIONES.map((ff) => (
                    <button key={ff.id} type="button" style={chip(funcId === ff.id, ff.color)} onClick={() => elegirFunc(ff.id)} title={ff.titulo}>
                      <i className={`fa-solid ${ff.icono}`} style={{ color: ff.color }} aria-hidden />
                      {ff.label}
                    </button>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Lecturas" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="punto a" value={conUnidad(aPos, f.unidadX, 2)} col={A_COL} />
                  <Dato label="f(a)" value={conUnidad(fa, f.unidadY, 2)} col={f.color} />
                  <Dato label="secante (h)" value={secValida ? fmt3(mSec) : "—"} col={SEC_COL} />
                  <Dato label={f.esFisica ? "velocidad f'(a)" : "f'(a) derivada"} value={f.esFisica ? conUnidad(mDer, `${f.unidadY}/${f.unidadX}`, 2) : fmt3(mDer)} col={TAN_COL} />
                </div>
                {esVerbatimTangente && (
                  <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${TAN_COL}66`, background: `${TAN_COL}16` }}>
                    Caso verbatim A2 (c): en <strong>x = 2</strong>, m = f&apos;(2) = <strong style={{ color: TAN_COL }}>4</strong>, punto (2, 4), tangente <strong style={{ color: TAN_COL, fontFamily: "ui-monospace, monospace" }}>y = 4x − 4</strong>.
                  </p>
                )}
              </Bloque>
              <Bloque titulo={`Cuando h → 0, la secante → ${fmt3(mDer)}`} icono="fa-table-list">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 10 }}>
                  <TablaLado titulo="derecha (h > 0)" filas={tabla.der} col={SEC_COL} />
                  <TablaLado titulo="izquierda (h < 0)" filas={tabla.izq} col={Q_COL} />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${TAN_COL}55`, background: `${TAN_COL}12` }}>
                  Ambos lados convergen a <strong style={{ color: TAN_COL }}>{fmt3(mDer)}</strong>: ese límite es la derivada f&apos;({fmt2(aPos)}). La recta tangente es <strong style={{ color: TAN_COL, fontFamily: "ui-monospace, monospace" }}>{rectaStr(mt, bt)}</strong>.
                </p>
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoNumericoCard
              reto={RETO_A2}
              accent={accent}
              aprobado={ejercicioAprobado}
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={
                sonido
                  ? (ok) => {
                      if (ok) audioRef.current?.correcto();
                      else audioRef.current?.incorrecto();
                    }
                  : undefined
              }
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo={f.titulo} icono={f.icono}>
                <strong style={{ fontFamily: "ui-monospace, monospace", color: f.color }}>{f.expr} · {f.derivExpr}</strong>
                <p style={{ margin: 0, color: T.text2 }}>{f.contexto}</p>
              </Bloque>
              <Bloque titulo="Derivada por definición — paso a paso" icono="fa-list-ol">
                {f.pasos.map((p) => (
                  <div key={p.etiqueta} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                    <span style={{ width: 24, height: 24, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</span>
                    <span style={{ minWidth: 0 }}>{p.texto}</span>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Cómo se lee la derivada" icono="fa-pen-nib">
                <TipoRef icono="fa-infinity" col="#FB923C" titulo="Como límite" texto="f'(x) = lim(h→0) [f(x+h) − f(x)] / h: el límite del cociente de Newton." />
                <TipoRef icono="fa-ruler-combined" col="#34D399" titulo="Como pendiente" texto="f'(a) es la pendiente de la recta tangente a la curva en (a, f(a))." />
                <TipoRef icono="fa-gauge-high" col="#60A5FA" titulo="Como tasa de cambio" texto="Si s(t) es posición, s'(t) es velocidad: la rapidez instantánea del cambio." />
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Datos" icono="fa-gauge-high">
                {DATOS.map((dd, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${dd.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                    <div>
                      <strong style={{ fontFamily: "ui-monospace, monospace" }}>{dd.valor}</strong>
                      <div style={{ color: T.text2 }}>{dd.texto}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={DERIVADA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                Cálculo <strong>exacto</strong>: la derivada f&apos;(x) es simbólica y el cociente de Newton [f(a+h) − f(a)]/h se evalúa con la fórmula real, así que la secante converge numéricamente a la tangente. Los casos <strong>x² (tangente y = 4x − 4 en x = 2)</strong>, <strong>x² + 3x</strong> y <strong>1/x</strong> son verbatim del enunciado A2; el proyectil <strong>h(t) = −5t² + 30t</strong> es la interpretación física verbatim de la lectura A1 (la derivada como velocidad). El plano se dibuja a escala propia por caso para mostrar valores reales.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Tarjeta de referencia ────────────────────────────────────────────────── */
function TipoRef({ icono, col, titulo, texto }: { icono: string; col: string; titulo: string; texto: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: T.glass, border: `1px solid ${col}33` }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: col, background: `${col}1e`, flexShrink: 0 }}>
        <i className={`fa-solid ${icono}`} aria-hidden />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{titulo}</div>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>{texto}</div>
      </div>
    </div>
  );
}

/* ── Columna de la tabla de acercamiento ──────────────────────────────────── */
function TablaLado({ titulo, filas, col }: {
  titulo: string;
  filas: { h: number; pendiente: number; valido: boolean }[];
  col: string;
}) {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${col}33`, background: "rgba(4,10,22,0.35)", overflow: "hidden" }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: col, padding: "8px 12px", borderBottom: `1px solid ${col}22` }}>{titulo}</div>
      <div style={{ display: "grid", gap: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: 14, color: T.text3, fontWeight: 800, padding: "5px 12px" }}>
          <span>h</span><span style={{ textAlign: "right" }}>pendiente</span>
        </div>
        {filas.map((fila, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: 14, padding: "5px 12px", fontFamily: "ui-monospace, monospace", color: "#fff" }}>
            <span style={{ color: T.text2 }}>{fmt2(fila.h)}</span>
            <span style={{ textAlign: "right", color: fila.valido ? col : T.text3, fontWeight: 700 }}>
              {fila.valido ? fmt3(fila.pendiente) : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
