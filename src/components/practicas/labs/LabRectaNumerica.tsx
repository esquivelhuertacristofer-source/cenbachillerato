"use client";

/**
 * Laboratorio 3D — Recta numérica.
 * Práctica experimental para PM-I-P02-A2.
 *
 * Experimento central: el alumno desliza un número sobre la recta y VE tres
 * cosas a la vez: el SIGNO (de qué lado del cero cae), el OPUESTO −a (su
 * reflejo, a la misma distancia del otro lado) y el VALOR ABSOLUTO |a| (el
 * segmento que mide esa distancia). En el modo OPERAR, sumar es un salto a la
 * derecha y restar un salto a la izquierda: restar es sumar el opuesto.
 * Pensamiento Matemático I.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RECTA_NUMERICA_FICHA } from "./recta-numerica-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./recta-numerica-data";
import { LabSfx } from "./lab-audio";
import {
  CONTEXTOS,
  RANGO,
  RANGO_OP,
  opuesto,
  absoluto,
  operar,
  fmtNum,
  type Contexto,
  type Modo,
  type Operacion,
} from "./recta-data";

const RectaScene = dynamic(() => import("./RectaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-ruler-horizontal fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const OPP_COL = "#22D3EE";
const ABS_COL = "#FFD166";

const RETO_KEY = "cen-recta-numerica-reto";

export function LabRectaNumerica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [ctxKey, setCtxKey] = useState(CONTEXTOS[0]!.key);
  const ctx = useMemo<Contexto>(() => CONTEXTOS.find((c) => c.key === ctxKey) ?? CONTEXTOS[0]!, [ctxKey]);
  const [modo, setModo] = useState<Modo>("ubicar");
  const [a, setA] = useState(3);
  const [b, setB] = useState(5);
  const [op, setOp] = useState<Operacion>("suma");
  const [showOpuesto, setShowOpuesto] = useState(false);
  const [showAbsoluto, setShowAbsoluto] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

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

  // seguimiento de objetivos
  const [movioA, setMovioA] = useState(false);
  const [vioNegativo, setVioNegativo] = useState(false);
  const [vioOpuesto, setVioOpuesto] = useState(false);
  const [vioAbsoluto, setVioAbsoluto] = useState(false);
  const [vioEspejo, setVioEspejo] = useState(false);
  const [vioSuma, setVioSuma] = useState(false);
  const [vioResta, setVioResta] = useState(false);

  const fmtVal = (n: number) => (ctx.unidad ? `${fmtNum(n)} ${ctx.unidad}` : fmtNum(n));
  const resultado = useMemo(() => operar(a, b, op), [a, b, op]);
  const opp = useMemo(() => opuesto(a), [a]);
  const abs = useMemo(() => absoluto(a), [a]);

  const moverA = (v: number) => {
    setA(v);
    setMovioA(true);
    if (v < 0) setVioNegativo(true);
    // El experimento central: con el opuesto visible, el reflejo cruza el cero al mover a.
    if (modo === "ubicar" && showOpuesto && v !== 0) setVioEspejo(true);
  };
  const moverB = (v: number) => {
    setB(v);
    setMovioA(true);
  };
  const elegirOp = (o: Operacion) => {
    setOp(o);
    if (sonido) audioRef.current?.blip();
    if (o === "suma") setVioSuma(true);
    else setVioResta(true);
    if (operar(a, b, o) < 0) setVioNegativo(true);
  };
  const elegirModo = (m: Modo) => {
    setModo(m);
    if (sonido) audioRef.current?.blip();
    if (m === "operar") {
      if (op === "suma") setVioSuma(true);
      else setVioResta(true);
    }
  };
  const toggleOpuesto = () => {
    if (sonido) audioRef.current?.blip();
    setShowOpuesto((v) => {
      if (!v) setVioOpuesto(true);
      return !v;
    });
  };
  const toggleAbsoluto = () => {
    if (sonido) audioRef.current?.blip();
    setShowAbsoluto((v) => {
      if (!v) setVioAbsoluto(true);
      return !v;
    });
  };
  const reset = () => {
    setResetNonce((n) => n + 1);
  };

  const sumando = op === "suma";

  const objetivos = [
    { txt: "Activa el opuesto y desliza el número: mira cómo su reflejo cruza el cero", done: vioEspejo, modo: "ubicar" },
    { txt: "Mueve un número sobre la recta", done: movioA },
    { txt: "Coloca un número negativo (izquierda del cero)", done: vioNegativo },
    { txt: "Activa el opuesto y el valor absoluto", done: vioOpuesto && vioAbsoluto },
    { txt: "Haz una suma y una resta como saltos", done: vioSuma && vioResta },
    { txt: "Resuelve el reto de operaciones con enteros", done: ejercicioAprobado },
  ];

  const liveTxt =
    modo === "operar"
      ? `${fmtNum(a)} ${sumando ? "+" : "−"} ${fmtNum(b)} = ${fmtNum(resultado)}`
      : `${ctx.titulo === "Número puro" ? "" : `${ctx.titulo}: `}${fmtVal(a)}`;

  const lectura =
    modo === "operar"
      ? <>{liveTxt}: salto a la {sumando ? "derecha" : "izquierda"} de {fmtNum(b)}</>
      : a === 0
        ? <>0 es el origen: no tiene signo y su distancia es 0</>
        : <>{fmtNum(a)} está a {fmtNum(abs)} del cero, a la {a > 0 ? "derecha" : "izquierda"}; su opuesto es {fmtNum(opp)}</>;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${ctx.icono}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, ...NUM }}>{liveTxt}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la recta 3D, pero la idea sigue: cada número ocupa un único lugar según su signo y su distancia al cero.
      </div>
    </div>
  );

  const toggleEstilo = (on: boolean, col: string): React.CSSProperties | undefined =>
    on ? { borderColor: col, background: `${col}1f`, color: "#fff" } : undefined;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <RectaScene
            modo={modo}
            a={a}
            b={b}
            op={op}
            resultado={resultado}
            showOpuesto={showOpuesto}
            showAbsoluto={showAbsoluto}
            unidad={ctx.unidad}
            accent={accent}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: [
          { id: "ubicar", etiqueta: "Ubicar", icono: "fa-location-dot" },
          { id: "operar", etiqueta: "Operar", icono: "fa-plus-minus" },
        ],
        valor: modo,
        cambiar: (id) => elegirModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          {modo === "ubicar" && (
            <>
              <BotonHerramienta icono="fa-left-right" titulo={showOpuesto ? "Ocultar el opuesto" : "Mostrar el opuesto −a"} activo={showOpuesto} onClick={toggleOpuesto} />
              <BotonHerramienta icono="fa-ruler" titulo={showAbsoluto ? "Ocultar el valor absoluto" : "Mostrar el valor absoluto |a|"} activo={showAbsoluto} onClick={toggleAbsoluto} />
            </>
          )}
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar vista" onClick={reset} />
        </>
      }
      leyenda={<MiniRecta modo={modo} a={a} resultado={resultado} rango={modo === "ubicar" ? RANGO : RANGO_OP * 2} accent={accent} compacto />}
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              {modo === "ubicar" ? (
                <Bloque titulo="Ubica el número" icono="fa-location-dot">
                  <Deslizador label="número en la recta" icon="fa-location-dot" colr={accent} valor={fmtVal(a)} min={-RANGO} max={RANGO} step={0.5} value={a} onChange={moverA} hintL={`−${RANGO}`} hintR={`+${RANGO}`} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 10 }}>
                    <button type="button" className="lr-toggle" data-on={showOpuesto} onClick={toggleOpuesto} style={toggleEstilo(showOpuesto, OPP_COL)}>
                      <i className="fa-solid fa-left-right" style={{ color: OPP_COL }} aria-hidden />
                      Opuesto −a
                    </button>
                    <button type="button" className="lr-toggle" data-on={showAbsoluto} onClick={toggleAbsoluto} style={toggleEstilo(showAbsoluto, ABS_COL)}>
                      <i className="fa-solid fa-ruler" style={{ color: ABS_COL }} aria-hidden />
                      Valor absoluto |a|
                    </button>
                  </div>
                </Bloque>
              ) : (
                <Bloque titulo="Opera con saltos" icono="fa-plus-minus">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
                    <button type="button" className="lr-toggle" data-on={sumando} onClick={() => elegirOp("suma")} style={toggleEstilo(sumando, accent)}>
                      <i className="fa-solid fa-plus" aria-hidden /> Sumar
                    </button>
                    <button type="button" className="lr-toggle" data-on={!sumando} onClick={() => elegirOp("resta")} style={toggleEstilo(!sumando, accent)}>
                      <i className="fa-solid fa-minus" aria-hidden /> Restar
                    </button>
                  </div>
                  <Deslizador label="inicio (a)" icon="fa-location-dot" colr="#9fb4c6" valor={fmtVal(a)} min={-RANGO_OP} max={RANGO_OP} step={0.5} value={a} onChange={moverA} hintL={`−${RANGO_OP}`} hintR={`+${RANGO_OP}`} />
                  <Deslizador label={`cantidad (${sumando ? "salto a la derecha" : "salto a la izquierda"})`} icon="fa-arrow-right-long" colr={ABS_COL} valor={fmtNum(b)} min={0} max={RANGO_OP} step={0.5} value={b} onChange={moverB} hintL="0" hintR={`+${RANGO_OP}`} />
                </Bloque>
              )}

              <Bloque titulo="Los números ahora" icono="fa-hashtag">
                {modo === "ubicar" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                    <Dato label="número a" value={fmtNum(a)} col={accent} />
                    <Dato label="opuesto −a" value={fmtNum(opp)} col={OPP_COL} />
                    <Dato label="valor absoluto |a|" value={fmtNum(abs)} col={ABS_COL} />
                    <Dato label="lado del cero" value={a > 0 ? "derecha" : a < 0 ? "izquierda" : "origen"} />
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                    <Dato label="inicio" value={fmtNum(a)} />
                    <Dato label={sumando ? "sumas" : "restas"} value={`${sumando ? "+" : "−"}${fmtNum(b)}`} col={ABS_COL} />
                    <Dato label="resultado" value={fmtNum(resultado)} col={accent} />
                    <Dato label="equivale a" value={`${fmtNum(a)} + (${fmtNum(sumando ? b : -b)})`} />
                  </div>
                )}
                <p style={{ margin: 0, color: T.text2 }}>
                  {modo === "ubicar" ? (
                    <>
                      Un número {a > 0 ? <strong style={{ color: T.text }}>positivo</strong> : a < 0 ? <strong style={{ color: T.text }}>negativo</strong> : <strong style={{ color: T.text }}>cero</strong>}{" "}
                      vive {a > 0 ? "a la derecha" : a < 0 ? "a la izquierda" : "en el origen"} del cero ({ctx.cero}). Su <strong style={{ color: OPP_COL }}>opuesto</strong> es{" "}
                      <strong style={{ color: OPP_COL, ...NUM }}>{fmtNum(opp)}</strong>: la misma distancia, del otro lado. Su <strong style={{ color: ABS_COL }}>valor absoluto</strong>{" "}
                      <strong style={{ color: ABS_COL, ...NUM }}>|{fmtNum(a)}| = {fmtNum(abs)}</strong> es esa distancia: nunca es negativa.
                    </>
                  ) : sumando ? (
                    <>
                      <strong style={{ color: T.text }}>Sumar</strong> es avanzar a la <strong style={{ color: T.text }}>derecha</strong>: partes de{" "}
                      <strong style={{ color: T.text, ...NUM }}>{fmtNum(a)}</strong> y das un salto de <strong style={{ color: ABS_COL, ...NUM }}>{fmtNum(b)}</strong>.
                    </>
                  ) : (
                    <>
                      <strong style={{ color: T.text }}>Restar</strong> es avanzar a la <strong style={{ color: T.text }}>izquierda</strong>: partes de{" "}
                      <strong style={{ color: T.text, ...NUM }}>{fmtNum(a)}</strong> y retrocedes <strong style={{ color: ABS_COL, ...NUM }}>{fmtNum(b)}</strong>. Restar{" "}
                      {fmtNum(b)} es lo mismo que sumar su opuesto, −{fmtNum(b)}.
                    </>
                  )}
                </p>
              </Bloque>

              <Bloque titulo="Contexto: ¿qué significa el signo?" icono="fa-temperature-half">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {CONTEXTOS.map((c) => (
                    <button key={c.key} type="button" className="lr-toggle" data-on={c.key === ctxKey} onClick={() => setCtxKey(c.key)} style={toggleEstilo(c.key === ctxKey, accent)}>
                      <i className={`fa-solid ${c.icono}`} style={{ color: c.key === ctxKey ? accent : T.text3 }} aria-hidden />
                      {c.titulo}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gap: 6, color: T.text2 }}>
                  <div><strong style={{ color: accent }}>+</strong> Derecha del cero: <strong style={{ color: T.text }}>{ctx.positivo}</strong>.</div>
                  <div><strong style={{ color: OPP_COL }}>−</strong> Izquierda del cero: <strong style={{ color: T.text }}>{ctx.negativo}</strong>.</div>
                  <div><strong style={{ color: T.text3 }}>0</strong> El origen: <strong style={{ color: T.text }}>{ctx.cero}</strong>.</div>
                </div>
              </Bloque>
              <style>{`
                .lr-toggle { cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; padding:12px 10px; border-radius:12px;
                  border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:700; transition:all .14s ease; }
                .lr-toggle:hover { border-color:${T.lineStrong}; color:#fff; }
              `}</style>
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
              playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="La idea" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Cada número tiene <strong style={{ color: T.text }}>un solo lugar</strong> en la recta: su <strong style={{ color: T.text }}>signo</strong> dice de qué lado del cero, y su{" "}
                  <strong style={{ color: ABS_COL }}>distancia al cero</strong> (el valor absoluto) dice qué tan lejos. Operar es <strong style={{ color: T.text }}>moverse</strong> sobre ella.
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  El cero no es el menor de todos: a su izquierda los números siguen, cada vez más pequeños (−1, −2, −3…).
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={RECTA_NUMERICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Mini recta: dónde está a, su reflejo y (en operar) el resultado ─────────── */
function MiniRecta({ modo, a, resultado, rango, accent, compacto = false }: {
  modo: Modo; a: number; resultado: number; rango: number; accent: string; compacto?: boolean;
}) {
  const pos = (v: number) => `${((Math.max(-rango, Math.min(rango, v)) + rango) / (2 * rango)) * 100}%`;
  const punto = (v: number, col: string, key: string, hueco = false) => (
    <span key={key} style={{ position: "absolute", top: "50%", left: pos(v), width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: "50%", background: hueco ? "transparent" : col, border: `3px solid ${col}`, transition: "left 120ms linear" }} />
  );
  const a0 = Math.min(a, 0), a1 = Math.max(a, 0);
  return (
    <div style={{ display: "grid", gap: 6, width: compacto ? 200 : undefined }}>
      <div style={{ position: "relative", height: 26 }}>
        <span style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 4, marginTop: -2, borderRadius: 2, background: "rgba(255,255,255,0.25)" }} />
        <span style={{ position: "absolute", top: 3, bottom: 3, left: "50%", width: 2, background: "#fff" }} />
        {modo === "ubicar" && (
          <span style={{ position: "absolute", top: "50%", height: 6, marginTop: -3, left: pos(a0), width: `${((a1 - a0) / (2 * rango)) * 100}%`, background: ABS_COL, borderRadius: 3 }} />
        )}
        {modo === "ubicar" && a !== 0 && punto(-a, OPP_COL, "opp", true)}
        {modo === "operar" && punto(a, "#9fb4c6", "ini", true)}
        {punto(modo === "operar" ? resultado : a, accent, "main")}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5", fontFamily: "ui-monospace, monospace" }}>
        <span>−{rango}</span><span>0</span><span>+{rango}</span>
      </div>
    </div>
  );
}
