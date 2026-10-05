"use client";

/**
 * Laboratorio 3D — La función y su derivada: las cuatro reglas.
 * Práctica experimental para PM-V-P04-A2 (ejercicio_matematico "Ejercicios de
 * derivación con todas las reglas"; progresión 4, UAC PM-V Cálculo Diferencial).
 *
 * El alumno elige una función, mueve la sonda x = a y ve a la vez la curva f, la
 * curva de su derivada f' (ámbar) y la recta tangente a f en P: la ALTURA de la
 * derivada en a coincide con la PENDIENTE de esa tangente. Derivar (con las
 * cuatro reglas) es construir esa curva f'. Un medidor con signo muestra si la
 * pendiente sube (verde), baja (rojo) o es plana.
 * Casos verbatim del A2:
 *  (b) g(x)=(x²+1)(3x−2) → 9x²−4x+3              (producto, default)
 *  (a) f(x)=3x⁵−2x³+7x−1 → 15x⁴−6x²+7            (potencia)
 *  (c) h(x)=(x²+1)/(x−1) → (x²−2x−1)/(x−1)²      (cociente)
 *  (d) k(x)=(2x³+1)⁴ → 24x²(2x³+1)³              (cadena)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { REGLAS_FICHA } from "./reglas-derivacion-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./reglas-derivacion-data";
import { LabSfx } from "./lab-audio";
import {
  FUNCIONES, func, evalFunc, deriv, tangente, rectaStr,
  IDEAS, DATOS, fmt2, fmt3,
  FUNC_DEF, type FuncId,
} from "./reglas-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-reglas-derivacion-reto";

const ReglasScene = dynamic(() => import("./ReglasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-superscript fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Derivando…</span>
    </div>
  ),
});

const DER_COL = "#fbbf24";   // curva de la derivada f'
const TAN_COL = "#34D399";   // recta tangente a f
const A_COL = "#7dd3fc";     // sonda x = a
const NEG_COL = "#f87171";   // pendiente negativa

export function LabReglas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [funcId, setFuncId] = useState<FuncId>(FUNC_DEF);
  const [aPos, setAPos] = useState<number>(func(FUNC_DEF).aDef);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // Misiones: lo hecho NO se des-cumple al cambiar de función.
  const [exploro, setExploro] = useState(false);
  const [movio, setMovio] = useState(false);
  const [animo, setAnimo] = useState(false);
  const [vioNegativa, setVioNegativa] = useState(false);
  const [vioPlana, setVioPlana] = useState(false);

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

  // Animación: la sonda x = a barre el dominio de ida y vuelta. La tangente gira
  // y el punto D recorre la curva de la derivada: f' es la "pendiente en cada x".
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      const span = f.aMax - f.aMin;
      setAPos((prev) => {
        let next = prev + dir * dt * span * 0.32;
        if (next <= f.aMin) { next = f.aMin; dir = 1; }
        else if (next >= f.aMax) { next = f.aMax; dir = -1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, f.aMin, f.aMax]);

  const bump = () => setResetNonce((n) => n + 1);
  const elegirFunc = (id: FuncId) => {
    if (sonido) audioRef.current?.blip();
    setPlaying(false);
    setFuncId(id);
    setAPos(func(id).aDef);
    if (id !== FUNC_DEF) setExploro(true);
    bump();
  };
  const reset = () => {
    setPlaying(false);
    setFuncId(FUNC_DEF);
    setAPos(func(FUNC_DEF).aDef);
    bump();
  };

  // valores en vivo
  const fa = evalFunc(funcId, aPos);
  const da = deriv(funcId, aPos);
  const { m: mt, b: bt } = tangente(funcId, aPos);
  const creciente = Number.isFinite(da) ? da > 1e-9 : false;
  const decreciente = Number.isFinite(da) ? da < -1e-9 : false;

  // Ajustes durante el render (patrón de React): marcan hitos sin des-cumplirlos.
  if (!movio && aPos !== f.aDef) setMovio(true);
  if (!vioNegativa && Number.isFinite(da) && da < -0.5) setVioNegativa(true);
  if (!vioPlana && aPos !== f.aDef && Number.isFinite(da) && Math.abs(da) < 0.05) setVioPlana(true);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${f.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{f.titulo}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: aplicando la regla {f.regla.toLowerCase()} se obtiene {f.derivExpr}, y la altura de esa derivada en x = a es la pendiente de la tangente a f.
      </div>
    </div>
  );

  const lectura = Number.isFinite(da)
    ? <>f&apos;({fmt2(aPos)}) = {fmt3(da)}: {creciente ? "f sube" : decreciente ? "f baja" : "tangente plana"}</>
    : <>Mueve la sonda dentro del dominio</>;

  const chip = (activo: boolean, col: string): CSSProperties => ({
    cursor: "pointer", padding: "9px 12px", borderRadius: 12, fontSize: 14, fontWeight: 800,
    border: `1px solid ${activo ? col : T.line}`, background: activo ? `${col}26` : T.inset, color: activo ? "#fff" : T.text2,
    display: "inline-flex", alignItems: "center", gap: 7, minHeight: 40,
  });

  // Medidor con signo de la pendiente: centro = 0, derecha = sube, izquierda = baja.
  const escalaM = f.vista.ymax;
  const pct = Number.isFinite(da) ? Math.max(-1, Math.min(1, da / escalaM)) : 0;
  const colMed = !Number.isFinite(da) ? T.text3 : creciente ? TAN_COL : decreciente ? NEG_COL : DER_COL;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <ReglasScene funcId={funcId} aPos={aPos} accent={accent} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Barrer la sonda (x = a)"} activo={playing} onClick={() => { setPlaying((p) => !p); setAnimo(true); }} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <LegItem col={f.color} txt="f(x)" />
          <LegItem col={DER_COL} txt="f'(x) (derivada)" />
          <LegItem col={TAN_COL} txt="tangente en a" />
          <div style={{ display: "grid", gap: 3, width: 176, marginTop: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>pendiente en a</div>
            <div style={{ position: "relative", height: 10, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, bottom: 0, left: pct >= 0 ? "50%" : `${50 + pct * 50}%`, width: `${Math.abs(pct) * 50}%`, background: colMed, transition: "all 120ms linear" }} />
              <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, background: "rgba(255,255,255,0.6)" }} />
            </div>
          </div>
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Explora las cuatro funciones del A2 en la escena 3D", done: exploro },
        { txt: "Observa cómo la altura de f' iguala la pendiente de la tangente", done: movio },
        { txt: "Barre la sonda con la animación (botón play)", done: animo },
        { txt: "Encuentra un x donde f' sea negativa: la tangente baja", done: vioNegativa },
        { txt: "Encuentra un x donde f' cruce el eje: la tangente queda plana", done: vioPlana },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Mueve la sonda x = a" icono="fa-crosshairs">
                <Deslizador
                  label="sonda  x = a"
                  icon="fa-crosshairs"
                  colr={A_COL}
                  valor={fmt2(aPos)}
                  min={f.aMin} max={f.aMax} step={0.02} value={aPos}
                  onChange={(v) => { setPlaying(false); setAPos(v); }}
                  hintL={fmt2(f.aMin)} hintR={fmt2(f.aMax)}
                />
                <p style={{ margin: 0, color: T.text2 }}>
                  La altura del punto ámbar sobre f&apos; es la pendiente de la tangente verde sobre f.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {FUNCIONES.map((ff) => (
                    <button key={ff.id} type="button" style={chip(funcId === ff.id, ff.color)} onClick={() => elegirFunc(ff.id)} title={ff.titulo}>
                      <i className={`fa-solid ${ff.icono}`} style={{ color: ff.color }} aria-hidden />
                      {ff.label}
                    </button>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo={`Regla: ${f.regla}`} icono={f.icono}>
                <strong style={{ fontFamily: "ui-monospace, monospace", color: f.color }}>{f.reglaFormula}</strong>
                <div style={{ padding: "9px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${f.color}33` }}>
                  <div style={{ fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{f.expr}</div>
                  <div style={{ fontWeight: 900, color: DER_COL, fontFamily: "ui-monospace, monospace", marginTop: 3 }}>{f.derivExpr}</div>
                </div>
              </Bloque>
              <Bloque titulo="Lecturas" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="sonda a" value={fmt2(aPos)} col={A_COL} />
                  <Dato label="f(a)" value={fmt2(fa)} col={f.color} />
                  <Dato label="f'(a) (altura)" value={fmt3(da)} col={DER_COL} />
                  <Dato label="pendiente tangente" value={fmt3(mt)} col={TAN_COL} />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${TAN_COL}55`, background: `${TAN_COL}12` }}>
                  La derivada evaluada en a, <strong style={{ color: DER_COL }}>f&apos;({fmt2(aPos)}) = {fmt3(da)}</strong>, es exactamente la pendiente de la recta tangente <strong style={{ color: TAN_COL, fontFamily: "ui-monospace, monospace" }}>{rectaStr(mt, bt)}</strong>.
                  {" "}
                  {creciente
                    ? "Como f'(a) > 0, f está creciendo aquí."
                    : decreciente
                    ? "Como f'(a) < 0, f está decreciendo aquí."
                    : "Como f'(a) ≈ 0, la tangente es casi horizontal."}
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
              <Bloque titulo={`Regla: ${f.regla}`} icono={f.icono}>
                <p style={{ margin: 0, color: T.text2 }}>{f.contexto}</p>
              </Bloque>
              <Bloque titulo="Aplicando la regla — paso a paso" icono="fa-list-ol">
                {f.pasos.map((p) => (
                  <div key={p.etiqueta} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                    <span style={{ width: 24, height: 24, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</span>
                    <span style={{ minWidth: 0 }}>{p.texto}</span>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Las cuatro reglas básicas" icono="fa-pen-nib">
                <TipoRef icono="fa-superscript" col="#34D399" titulo="Potencia" texto="(xⁿ)' = n·xⁿ⁻¹. La derivada de una suma es la suma; la de una constante, 0." activo={funcId === "potencia"} />
                <TipoRef icono="fa-xmark" col="#FB923C" titulo="Producto" texto="(f·g)' = f'·g + f·g'. Cada factor presta su derivada por turnos." activo={funcId === "producto"} />
                <TipoRef icono="fa-divide" col="#F472B6" titulo="Cociente" texto="(f/g)' = (f'·g − f·g')/g². Numerador cruzado sobre g²." activo={funcId === "cociente"} />
                <TipoRef icono="fa-link" col="#60A5FA" titulo="Cadena" texto="(f∘u)' = f'(u)·u'. Deriva de afuera hacia adentro." activo={funcId === "cadena"} />
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
                <FichaTeorica data={REGLAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                Cálculo <strong>exacto</strong>: las cuatro derivadas son <strong>simbólicas</strong> (las reglas aplicadas a mano) y la tangente usa la pendiente real f&apos;(a). Los cuatro casos —<strong>3x⁵ − 2x³ + 7x − 1</strong> (potencia), <strong>(x² + 1)(3x − 2)</strong> (producto), <strong>(x² + 1)/(x − 1)</strong> (cociente) y <strong>(2x³ + 1)⁴</strong> (cadena)— son verbatim del enunciado A2. El plano dibuja f y f&apos; a una escala propia por caso para que ambas curvas quepan; en el cociente se muestra sólo la rama x &gt; 1 (la asíntota está en x = 1).
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Item de leyenda (visor) ──────────────────────────────────────────────── */
function LegItem({ col, txt }: { col: string; txt: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
      <span style={{ width: 18, height: 0, borderTop: `3px solid ${col}`, flexShrink: 0 }} />
      {txt}
    </div>
  );
}

/* ── Tarjeta de referencia ────────────────────────────────────────────────── */
function TipoRef({ icono, col, titulo, texto, activo }: { icono: string; col: string; titulo: string; texto: string; activo?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: activo ? `${col}1e` : T.glass, border: `1px solid ${activo ? `${col}88` : `${col}33`}` }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: col, background: `${col}1e`, flexShrink: 0 }}>
        <i className={`fa-solid ${icono}`} aria-hidden />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{titulo}{activo ? "  ←" : ""}</div>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.45 }}>{texto}</div>
      </div>
    </div>
  );
}
