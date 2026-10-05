"use client";

/**
 * Laboratorio 3D — Continuidad: las 3 condiciones, los tipos de discontinuidad
 * y el Teorema del Valor Intermedio.
 * Práctica experimental para PM-V-P02-A2 (ejercicio_matematico "Analizando
 * discontinuidades: evitable, salto y esencial"; progresión 2, UAC PM-V).
 *
 * Dos modos:
 *  · CONTINUIDAD — el alumno elige una función (evitable / salto / esencial /
 *    continua), mueve el punto x hacia a y dos sondas (izquierda y derecha) a la
 *    misma distancia de a muestran si los lados llegan a la misma altura; un
 *    semáforo evalúa las 3 condiciones en x = a.
 *    Caso ancla verbatim: f(x) = (x²−4)/(x−2), evitable en x = 2 (lim = 4,
 *    reparable con F(2) = 4).
 *  · TVI — g(x) = x³ − x − 1 en [1,2]; g(1) = −1 < 0 < 5 = g(2), así que existe
 *    c ∈ (1,2) con g(c) = N (verbatim A2 parte d).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { CONTINUIDAD_FICHA } from "./continuidad-tres-condiciones-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./continuidad-tres-condiciones-data";
import { LabSfx } from "./lab-audio";
import {
  FUNCIONES, func, evalFunc, condiciones, valOInf,
  TVI, bisectN,
  IDEAS, DATOS, fmt0, fmt1, fmt2,
  MODO_DEF, FUNC_DEF, type Modo, type FuncId,
} from "./continuidad-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-continuidad-tres-condiciones-reto";

const ContinuidadScene = dynamic(() => import("./ContinuidadScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-traffic-light fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Dibujando el plano…</span>
    </div>
  ),
});

const X_COL = "#fbbf24";
const OK_COL = "#34D399";
const HOLE_COL = "#f87171";
const IZQ_COL = "#60a5fa";
const DER_COL = "#f472b6";

export function LabContinuidad({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>(MODO_DEF);
  const [funcId, setFuncId] = useState<FuncId>(FUNC_DEF);
  const [xPos, setXPos] = useState<number>(func(FUNC_DEF).xDef);
  const [nObj, setNObj] = useState<number>(0); // valor objetivo N del TVI (raíz)
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // Misiones: lo hecho NO se des-cumple al cambiar de modo o de función.
  const [movio, setMovio] = useState(false);
  const [acerco, setAcerco] = useState(false);
  const [vistos, setVistos] = useState<FuncId[]>([FUNC_DEF]);
  const [tviVisto, setTviVisto] = useState(false);
  const [raizHallada, setRaizHallada] = useState(false);

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
  const conds = useMemo(() => condiciones(funcId), [funcId]);

  // Modo continuidad: barrido de x que se acerca a `a` (efecto acercamiento).
  useEffect(() => {
    if (!playing || modo !== "continuidad") return;
    let raf = 0;
    let last = 0;
    let dir = -1; // empieza acercándose desde la izquierda
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setXPos((prev) => {
        let next = prev + dir * dt * (f.domMax - f.domMin) * 0.28;
        if (next >= f.domMax) { next = f.domMax; dir = -1; }
        else if (next <= f.domMin) { next = f.domMin; dir = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, modo, f.domMin, f.domMax]);

  // Modo TVI: barrido del valor objetivo N entre g(1) y g(2).
  useEffect(() => {
    if (!playing || modo !== "tvi") return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setNObj((prev) => {
        let next = prev + dir * dt * (TVI.gb - TVI.ga) * 0.3;
        if (next >= TVI.gb) { next = TVI.gb; dir = -1; }
        else if (next <= TVI.ga) { next = TVI.ga; dir = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, modo]);

  const bump = () => setResetNonce((n) => n + 1);
  const elegirModo = (m: Modo) => {
    if (sonido) audioRef.current?.blip();
    setPlaying(false);
    setModo(m);
    if (m === "tvi") setTviVisto(true);
    bump();
  };
  const elegirFunc = (id: FuncId) => {
    if (sonido) audioRef.current?.blip();
    setPlaying(false);
    setFuncId(id);
    setXPos(func(id).xDef);
    setVistos((v) => (v.includes(id) ? v : [...v, id]));
    bump();
  };
  const reset = () => {
    setPlaying(false);
    setModo(MODO_DEF);
    setFuncId(FUNC_DEF);
    setXPos(func(FUNC_DEF).xDef);
    setNObj(0);
    bump();
  };

  // valores en vivo (modo continuidad)
  const yVal = evalFunc(funcId, xPos);
  const delta = Math.max(Math.abs(xPos - f.a), 0.02);
  const yIzq = evalFunc(funcId, f.a - delta);
  const yDer = evalFunc(funcId, f.a + delta);
  // valores en vivo (modo TVI)
  const cTvi = bisectN(nObj);

  // Ajustes durante el render (patrón de React): marcan hitos sin des-cumplirlos.
  if (modo === "continuidad" && !movio && xPos !== f.xDef) setMovio(true);
  if (modo === "continuidad" && !acerco && Math.abs(xPos - f.a) <= 0.2) setAcerco(true);
  if (modo === "tvi" && !raizHallada && Math.abs(nObj) <= 0.05) setRaizHallada(true);

  const txtVal = (y: number) => (Number.isFinite(y) ? fmt2(y) : "no existe");
  const sondaOk = (y: number) => Number.isFinite(y) && Math.abs(y) < 1e3;
  const veredicto = f.continua ? OK_COL : HOLE_COL;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-traffic-light" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>
        {modo === "tvi" ? "Teorema del Valor Intermedio" : f.titulo}
      </div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        {modo === "tvi"
          ? "Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: g es continua en [1,2], g(1)=−1 y g(2)=5, así que existe c∈(1,2) con g(c)=0."
          : `Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: ${f.tipoLabel}. ${f.contexto}`}
      </div>
    </div>
  );

  const lectura = modo === "continuidad"
    ? <>x = {fmt2(xPos)} → f(x) = {txtVal(yVal)}</>
    : <>N = {fmt2(nObj)} → existe c ≈ {fmt2(cTvi)}</>;

  const chip = (activo: boolean, col: string): CSSProperties => ({
    cursor: "pointer", padding: "9px 12px", borderRadius: 12, fontSize: 14, fontWeight: 800,
    border: `1px solid ${activo ? col : T.line}`, background: activo ? `${col}26` : T.inset, color: activo ? "#fff" : T.text2,
    display: "inline-flex", alignItems: "center", gap: 7, minHeight: 40,
  });

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <ContinuidadScene modo={modo} funcId={funcId} xPos={xPos} nObj={nObj} accent={accent} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      modos={{
        opciones: [
          { id: "continuidad", etiqueta: "Continuidad", icono: "fa-traffic-light" },
          { id: "tvi", etiqueta: "Valor Intermedio", icono: "fa-arrow-down-up-across-line" },
        ],
        valor: modo,
        cambiar: (id) => elegirModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Animar el acercamiento"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        modo === "continuidad" ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
              {conds.map((cd) => (
                <span key={cd.etiqueta} title={cd.texto} style={{ width: 22, height: 22, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#04121f", background: cd.cumple ? OK_COL : HOLE_COL }}>
                  <i className={`fa-solid ${cd.cumple ? "fa-check" : "fa-xmark"}`} />
                </span>
              ))}
              <span>{f.continua ? "continua en a" : "discontinua en a"}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
              <span style={{ color: IZQ_COL }}>● izq</span> {sondaOk(yIzq) ? fmt2(yIzq) : "—"} · <span style={{ color: DER_COL }}>● der</span> {sondaOk(yDer) ? fmt2(yDer) : "—"}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>g(1) = −1 &lt; N &lt; g(2) = 5</div>
        )
      }
      lectura={lectura}
      objetivos={[
        { txt: "Acerca x al punto a por ambos lados: ¿los dos puntos coinciden en la altura?", done: acerco },
        { txt: "Mueve x y observa las 3 condiciones de continuidad en acción", done: movio },
        { txt: "Examina la discontinuidad evitable (el hueco que se puede tapar)", done: vistos.includes("evitable") },
        { txt: "Examina la discontinuidad de salto y la esencial (asíntota)", done: vistos.includes("salto") || vistos.includes("esencial") },
        { txt: "Compara con una función continua en todo su dominio", done: vistos.includes("continua") },
        { txt: "Verifica el TVI: g(1) < 0 < g(2) garantiza raíz en (1,2)", done: tviVisto },
        { txt: "En el TVI pon N = 0 y localiza la raíz de g", done: raizHallada },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: modo === "continuidad" ? (
            <>
              <Bloque titulo="Acércate al punto a" icono="fa-location-crosshairs">
                <Deslizador
                  label="posición de x"
                  icon="fa-location-crosshairs"
                  colr={X_COL}
                  valor={fmt2(xPos)}
                  min={f.domMin} max={f.domMax} step={f.xStep} value={xPos}
                  onChange={(v) => { setPlaying(false); setXPos(v); }}
                  hintL={fmt1(f.domMin)} hintR={fmt1(f.domMax)}
                />
                <p style={{ margin: 0, color: T.text2 }}>
                  Los puntos azul y rosa están a la misma distancia de x = {fmt0(f.a)}, uno por cada lado. Si terminan a la misma altura, el límite existe.
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
              <Bloque titulo={`Semáforo en x = ${fmt0(f.a)}`} icono="fa-traffic-light">
                {conds.map((cd) => (
                  <div key={cd.etiqueta} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 12px", borderRadius: 11, background: cd.cumple ? `${OK_COL}12` : `${HOLE_COL}10`, border: `1px solid ${cd.cumple ? OK_COL : HOLE_COL}44` }}>
                    <span style={{ width: 26, height: 26, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#04121f", background: cd.cumple ? OK_COL : HOLE_COL, flexShrink: 0 }}>
                      <i className={`fa-solid ${cd.cumple ? "fa-check" : "fa-xmark"}`} aria-hidden />
                    </span>
                    <span><strong>({cd.etiqueta})</strong> {cd.texto}</span>
                  </div>
                ))}
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${veredicto}55`, background: `${veredicto}12` }}>
                  {f.continua
                    ? `Las tres se cumplen: f es CONTINUA en x = ${fmt0(f.a)}.`
                    : `Falla al menos una: discontinuidad ${f.tipoLabel}.`}
                  {f.reparable && f.reparacion ? ` Se repara: ${f.reparacion}` : ""}
                  {!f.continua && !f.reparable ? " No es reparable." : ""}
                </p>
              </Bloque>
              <Bloque titulo="Lecturas" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="x" value={fmt2(xPos)} col={X_COL} />
                  <Dato label="f(x)" value={txtVal(yVal)} col={Number.isFinite(yVal) ? OK_COL : HOLE_COL} />
                  <Dato label="f(a − δ), izquierda" value={sondaOk(yIzq) ? fmt2(yIzq) : "no existe"} col={IZQ_COL} />
                  <Dato label="f(a + δ), derecha" value={sondaOk(yDer) ? fmt2(yDer) : "no existe"} col={DER_COL} />
                  <Dato label="lím izq" value={valOInf(f.limIzq, f.infIzq)} col={X_COL} />
                  <Dato label="lím der" value={valOInf(f.limDer, f.infDer)} col={X_COL} />
                  <Dato label={`f(${fmt0(f.a)})`} value={f.fa !== null ? fmt2(f.fa) : "no existe"} col={f.fa !== null ? OK_COL : HOLE_COL} />
                  <Dato label="¿continua en a?" value={f.continua ? "sí" : "no"} col={veredicto} />
                </div>
              </Bloque>
            </>
          ) : (
            <>
              <Bloque titulo="Valor objetivo N" icono="fa-arrows-up-down">
                <Deslizador
                  label="valor objetivo N"
                  icon="fa-arrows-up-down"
                  colr={Math.abs(nObj) < 1e-9 ? OK_COL : X_COL}
                  valor={fmt2(nObj)}
                  min={TVI.ga} max={TVI.gb} step={0.05} value={nObj}
                  onChange={(v) => { setPlaying(false); setNObj(v); }}
                  hintL="−1 = g(1)" hintR="5 = g(2)"
                />
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${OK_COL}55`, background: `${OK_COL}12` }}>
                  Para cualquier N en [−1, 5] siempre existe un <strong style={{ color: OK_COL }}>c ∈ (1,2)</strong> con g(c) = N. En N = 0, ese c ≈ {fmt2(bisectN(0))} es la raíz de g.
                </p>
              </Bloque>
              <Bloque titulo="Lecturas" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="g(1)" value={fmt0(TVI.ga)} col={HOLE_COL} />
                  <Dato label="g(2)" value={fmt0(TVI.gb)} col={OK_COL} />
                  <Dato label="N (objetivo)" value={fmt2(nObj)} col={X_COL} />
                  <Dato label="c con g(c) = N" value={fmt2(cTvi)} col={OK_COL} />
                </div>
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
              <Bloque titulo={modo === "tvi" ? "Teorema del Valor Intermedio" : f.tipoLabel} icono={modo === "tvi" ? "fa-arrow-down-up-across-line" : f.icono}>
                <strong style={{ fontFamily: "ui-monospace, monospace", color: modo === "tvi" ? OK_COL : veredicto }}>{modo === "tvi" ? `${TVI.expr} en [1, 2]` : f.expr}</strong>
                <p style={{ margin: 0, color: T.text2 }}>{modo === "tvi" ? TVI.contexto : f.contexto}</p>
              </Bloque>
              <Bloque titulo={modo === "tvi" ? "Pasos del TVI" : "Análisis paso a paso"} icono="fa-list-ol">
                {(modo === "tvi" ? TVI.pasos : f.pasos).map((p) => (
                  <div key={p.etiqueta} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                    <span style={{ width: 24, height: 24, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</span>
                    <span style={{ minWidth: 0 }}>{p.texto}</span>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Los tipos de discontinuidad" icono="fa-shapes">
                <TipoRef icono="fa-circle-notch" col="#FB923C" titulo="Evitable (removible)" texto="El límite existe pero f(a) no, o difiere. Se repara redefiniendo f(a) = límite." />
                <TipoRef icono="fa-stairs" col="#60A5FA" titulo="De salto (1.ª especie)" texto="Los límites laterales existen pero son distintos. La función salta (tarifas CFE)." />
                <TipoRef icono="fa-bolt" col="#F472B6" titulo="Esencial (2.ª especie)" texto="Un límite lateral es infinito o no existe (asíntota vertical, como 1/x). No se repara." />
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
                <FichaTeorica data={CONTINUIDAD_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                Cálculo <strong>exacto</strong>: f(x), los límites laterales, las 3 condiciones y la raíz del TVI (por bisección sobre g(x) = x³ − x − 1) salen de la fórmula real. El caso ancla <strong>(x²−4)/(x−2)</strong> y el TVI sobre <strong>g en [1,2]</strong> son verbatim del enunciado A2; los ejemplos de salto y esencial son <strong>didácticos</strong> (alineados con la infografía A1). El plano se dibuja a escala propia por caso; el anillo abierto señala dónde el límite no se alcanza y la línea punteada en la esencial marca la asíntota vertical.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Tarjeta de tipo de discontinuidad ────────────────────────────────────── */
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
