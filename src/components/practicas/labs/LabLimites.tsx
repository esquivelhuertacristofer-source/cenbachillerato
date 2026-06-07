"use client";

/**
 * Laboratorio 3D — El límite: a qué se acerca f(x) cuando x→a.
 * Práctica experimental para PM-V-P01-A2 (ejercicio_matematico "Calculando
 * límites: del límite básico al 0/0 indeterminado"; progresión 1, UAC PM-V).
 *
 * El alumno ACERCA x al punto `a` (por la izquierda o por la derecha) y ve cómo
 * el punto P = (x, f(x)) se desliza sobre la curva hacia el valor del límite L,
 * aunque f(a) no exista (el hueco 0/0). Tres casos verbatim del enunciado:
 *  (a) lim(t→2) s(t)/t = 11 km/h   (sustitución directa)
 *  (b) lim(x→3) (x²−9)/(x−3) = 6   (0/0 → factorización, hueco en x=3)
 *  (c) lim(x→0) sen(2x)/x = 2       (límite notable, hueco en x=0)
 */

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  CASOS, caso, evalCaso, tablaAprox, conUnidad, cercania,
  IDEAS, DATOS, fmt1, fmt2, fmt3,
  CASO_DEF, LADO_DEF, type CasoId, type Lado,
} from "./limites-data";

const LimitesScene = dynamic(() => import("./LimitesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-arrow-right-to-bracket fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Dibujando el plano…</span>
    </div>
  ),
});

const X_COL = "#fbbf24";    // posición de x
const LIM_COL = "#34D399";  // valor del límite L
const HOLE_COL = "#f87171"; // hueco (0/0)

export function LabLimites({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [casoId, setCasoId] = useState<CasoId>(CASO_DEF);
  const [lado, setLado] = useState<Lado>(LADO_DEF);
  const [xPos, setXPos] = useState<number>(caso(CASO_DEF).xDef);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  const c = useMemo(() => caso(casoId), [casoId]);

  // Acercamiento automático: x se aproxima a `a` desde el lado elegido y, al
  // quedar muy cerca, vuelve a alejarse para repetir el barrido (efecto "zeno").
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    const far = lado === "izq"
      ? Math.max(c.domMin, c.a - (c.a - c.domMin) * 0.92)
      : Math.min(c.domMax, c.a + (c.domMax - c.a) * 0.92);
    const sign = lado === "izq" ? -1 : 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setXPos((prev) => {
        const dist = Math.abs(prev - c.a);
        // se acerca el ~92% de la distancia restante por segundo
        let next = prev + (c.a - prev) * Math.min(1, dt * 2.3);
        if (dist < 0.004) next = far; // reinicia el acercamiento desde lejos
        // asegura que se mantenga del lado correcto
        if (sign < 0 && next > c.a) next = c.a - 0.004;
        if (sign > 0 && next < c.a) next = c.a + 0.004;
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, lado, c.a, c.domMin, c.domMax]);

  const bump = () => setResetNonce((n) => n + 1);
  const elegirCaso = (id: CasoId) => {
    setPlaying(false);
    setCasoId(id);
    const nc = caso(id);
    setLado("izq");
    setXPos(nc.xDef);
    bump();
  };
  const elegirLado = (l: Lado) => {
    setPlaying(false);
    setLado(l);
    // coloca x del lado elegido, a media distancia del objetivo
    setXPos(l === "izq" ? (c.a + c.domMin) / 2 : (c.a + c.domMax) / 2);
  };
  const setXman = (v: number) => {
    setPlaying(false);
    setXPos(v);
    setLado(v <= c.a ? "izq" : "der");
  };
  const reset = () => {
    setPlaying(false);
    setCasoId(CASO_DEF);
    setLado("izq");
    setXPos(caso(CASO_DEF).xDef);
    bump();
  };

  const yVal = evalCaso(casoId, xPos);
  const yTxt = conUnidad(yVal, c.unidadY, 2);
  const tabla = useMemo(() => tablaAprox(casoId), [casoId]);
  // ¿coincide f(x) con L hasta el punto de redondeo? (para el "≈ L")
  const muyCerca = Number.isFinite(yVal) && Math.abs(yVal - c.L) < 0.05;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-arrow-right-to-bracket" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{c.titulo}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: {c.limStr} = {fmt2(c.L)}. {c.metodo}
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseLim { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseLim 1.6s ease-in-out infinite; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--exc) 0%, var(--exc) var(--exfill), rgba(255,255,255,0.12) var(--exfill), rgba(255,255,255,0.12) 100%); }
        .ex-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--exc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--exc); cursor:pointer; }
        .ex-chip { cursor:pointer; padding:8px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; display:flex; align-items:center; gap:7px; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
        .ex-seg { cursor:pointer; flex:1; padding:9px 12px; border-radius:10px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .15s; display:flex; align-items:center; justify-content:center; gap:7px; }
        .ex-seg[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.2); color:#fff; }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="ex-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 62vh, 720px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#0b2233 0%,#08131f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <LimitesScene casoId={casoId} xPos={xPos} accent={accent} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{c.limStr} = {fmt2(c.L)}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar el acercamiento" : "Acercar x → a"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className="fa-solid fa-arrow-right-to-bracket" style={{ color: X_COL, marginRight: 7 }} />
                x = <strong style={{ color: X_COL }}>{conUnidad(xPos, c.unidadX, 3)}</strong> (a {cercania(casoId, xPos)} de {fmt1(c.a)})
                &nbsp;&nbsp;→&nbsp;&nbsp;
                <i className="fa-solid fa-bullseye" style={{ color: LIM_COL, marginRight: 7 }} />
                f(x) = <strong style={{ color: muyCerca ? LIM_COL : "#fff" }}>{yTxt}</strong>
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                {muyCerca
                  ? `f(x) se acerca a L = ${fmt2(c.L)} ${c.unidadY} — ese es el límite, aunque ${c.hueco ? "f(" + fmt1(c.a) + ") no exista (0/0)" : "lleguemos justo al punto"}.`
                  : `Acerca x a ${fmt1(c.a)} (con ▶ o el deslizador) y observa hacia qué valor se dirige f(x).`}
              </div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Acerca x al punto y observa a dónde va f(x)
            </Eyebrow>

            {/* selector de lado */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button className="ex-seg" data-on={lado === "izq"} onClick={() => elegirLado("izq")}>
                <i className="fa-solid fa-arrow-right-long" /> Por la izquierda (x → {fmt1(c.a)}⁻)
              </button>
              <button className="ex-seg" data-on={lado === "der"} onClick={() => elegirLado("der")}>
                <i className="fa-solid fa-arrow-left-long" /> Por la derecha (x → {fmt1(c.a)}⁺)
              </button>
            </div>

            {/* deslizador de x */}
            <Deslizador
              label={`posición de x (${c.unidadX || "x"})`}
              icon="fa-arrow-right-to-bracket"
              colr={X_COL}
              valor={conUnidad(xPos, c.unidadX, 3)}
              min={c.domMin} max={c.domMax} step={c.xStep} value={xPos}
              onChange={setXman}
              hintL={fmt1(c.domMin)} hintR={fmt1(c.domMax)}
            />

            {/* casos disponibles */}
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>
              LOS TRES CASOS DEL ENUNCIADO
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CASOS.map((cc) => (
                <button key={cc.id} className="ex-chip" data-on={casoId === cc.id} onClick={() => elegirCaso(cc.id)} title={cc.titulo}>
                  <i className={`fa-solid ${cc.icono}`} style={{ color: cc.color }} />
                  {cc.label}
                  {cc.hueco && <span style={{ fontSize: 9.5, fontWeight: 900, color: HOLE_COL, border: `1px solid ${HOLE_COL}66`, borderRadius: 5, padding: "1px 4px", marginLeft: 2 }}>0/0</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de acercamiento */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-table-list" style={{ marginRight: 8, color: accent }} />
              Tabla de acercamiento: x → {fmt1(c.a)}
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
              <TablaLado titulo={`Por la izquierda (x → ${fmt1(c.a)}⁻)`} filas={tabla.izq} accent={accent} unidadY={c.unidadY} />
              <TablaLado titulo={`Por la derecha (x → ${fmt1(c.a)}⁺)`} filas={tabla.der} accent={accent} unidadY={c.unidadY} />
            </div>
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, border: `1px solid ${LIM_COL}55`, background: `${LIM_COL}12`, fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
              <i className="fa-solid fa-equals" style={{ color: LIM_COL, marginRight: 8 }} />
              Por ambos lados f(x) se acerca al mismo número: <strong style={{ color: LIM_COL }}>L = {fmt2(c.L)} {c.unidadY}</strong>. Como el límite por la izquierda y por la derecha coinciden, el límite existe.
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Veredicto / resultado */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${LIM_COL}66`, background: `${LIM_COL}12` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: c.color }}>
                <i className={`fa-solid ${c.icono}`} />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{c.titulo}</div>
                <div style={{ fontSize: 12.5, color: LIM_COL, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{c.limStr} = {fmt2(c.L)}</div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", marginBottom: 8 }}>{c.expr}</div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{c.metodo}</div>
            <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.5, marginTop: 8 }}>{c.contexto}</div>
          </div>

          {/* Resolución paso a paso (pasos_guia verbatim) */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Resolución paso a paso
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {c.pasos.map((p) => (
                <div key={p.etiqueta} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p.texto}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ¿Qué es un límite? */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              ¿Qué es un límite?
            </Eyebrow>
            <div style={{ fontSize: 12.2, color: T.text2, lineHeight: 1.55 }}>
              El límite de f(x) cuando x se acerca a <strong style={{ color: X_COL }}>a</strong> es <strong style={{ color: LIM_COL }}>L</strong> si los valores f(x) se acercan a L conforme x se aproxima a a (por la izquierda y por la derecha). <strong>La clave es el acercamiento, no la llegada</strong>: el límite puede existir aunque f(a) no esté definida.
            </div>
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, border: `1px solid ${HOLE_COL}44`, background: `${HOLE_COL}10` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", marginBottom: 5 }}>
                <i className="fa-solid fa-circle-notch" style={{ marginRight: 7, color: HOLE_COL }} />
                El hueco 0/0
              </div>
              <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5 }}>
                Cuando la sustitución da 0/0, la fracción no existe en ese punto (el anillo abierto), pero al factorizar y cancelar el límite sí existe.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Lecturas
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Readout label={`posición x`} value={conUnidad(xPos, c.unidadX, 3)} col={X_COL} size={15} />
            <Readout label="|x − a|" value={cercania(casoId, xPos)} col={X_COL} size={15} />
            <Readout label="f(x)" value={yTxt} col={muyCerca ? LIM_COL : T.text} size={15} />
            <Readout label="límite L" value={fmt2(c.L)} col={LIM_COL} size={18} />
          </div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            Ideas clave
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
            {IDEAS.map((x, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Cálculo <strong>exacto</strong>: f(x), el valor del límite L y las tablas de acercamiento salen de la fórmula real (en el caso notable, en radianes). Los tres casos y sus pasos son <strong>verbatim</strong> del enunciado A2 (auto en la autopista México-Querétaro, s(t) = 3t² + 5t). El plano se dibuja a <strong>escala propia</strong> por caso para mostrar valores reales; el anillo abierto señala dónde f(a) no existe (0/0).
        </span>
      </div>
    </div>
  );
}

/* ── Tabla de un lado del acercamiento ────────────────────────────────────── */
function TablaLado({ titulo, filas, accent, unidadY }: {
  titulo: string; filas: { x: number; y: number }[]; accent: string; unidadY: string;
}) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${accent}33`, background: "rgba(4,10,22,0.4)" }}>
      <div style={{ fontSize: 11.5, fontWeight: 900, color: "#fff", marginBottom: 8 }}>{titulo}</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "ui-monospace, monospace", fontSize: 11.5 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", color: T.text3, padding: "2px 4px", fontWeight: 800 }}>x</th>
            <th style={{ textAlign: "right", color: T.text3, padding: "2px 4px", fontWeight: 800 }}>f(x){unidadY ? ` (${unidadY})` : ""}</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i}>
              <td style={{ padding: "2px 4px", color: "#fbbf24", fontWeight: 700 }}>{fmt3(f.x)}</td>
              <td style={{ padding: "2px 4px", textAlign: "right", color: "#34D399", fontWeight: 800 }}>{Number.isFinite(f.y) ? fmt3(f.y) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Deslizador reutilizable ─────────────────────────────────────────────── */
function Deslizador({ label, icon, colr, valor, min, max, step, value, onChange, hintL, hintR }: {
  label: string; icon: string; colr: string; valor: string;
  min: number; max: number; step: number; value: number; onChange: (v: number) => void;
  hintL?: string; hintR?: string;
}) {
  const fill = `${((Math.min(max, Math.max(min, value)) - min) / (max - min)) * 100}%`;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: colr }}>
          <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} />
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 900, color: colr, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
      </div>
      <input type="range" className="ex-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--exc" as string]: colr, ["--exfill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}
