"use client";

/**
 * Laboratorio 3D — "El diferencial: la recta tangente como aproximación".
 * Práctica experimental para PM-V-P08-A2 (ejercicio_matematico "Aplicando
 * diferenciales para estimar errores y valores"; progresión 8, UAC PM-V
 * Cálculo Diferencial).
 *
 * Dos modos:
 *  · ESTIMAR UN VALOR — el alumno mueve x sobre la curva (√x o eˣ) y compara el
 *    valor real f(x) con el estimado por la linealización L(x) = f(a)+f'(a)(x−a).
 *    La brecha es el error; cerca del punto base es diminuta (√9.04 ≈ 3.0067,
 *    e^0.1 ≈ 1.1). dy = f'(a)·dx es el diferencial (cambio sobre la tangente).
 *  · ESTIMAR UN ERROR — esfera r = 5.0 ± 0.05 cm; dV = 4π r²·dr = 5π ≈ 15.71 cm³
 *    es el volumen de una cáscara delgada (superficie × grosor); dV/V = 3·dr/r = 3 %.
 *
 * Todos los valores son de cálculo cerrado / funciones exactas.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { DIFERENCIAL_FICHA } from "./diferencial-linealizacion-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./diferencial-linealizacion-data";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";
import {
  LIN_CASOS, linCaso, linLectura,
  esferaLectura, R_BASE, DR_BASE, R_MIN, R_MAX, DR_MIN, DR_MAX,
  PASOS_ESFERA, IDEAS, DATOS, fmt1, fmt2, fmt3, fmt4,
  type LinId,
} from "./diferencial-data";

const DiferencialScene = dynamic(() => import("./DiferencialScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-ruler-combined fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Trazando la tangente…</span>
    </div>
  ),
});

const TAN_COL = "#7dd3fc";    // linealización
const REAL_COL = "#34D399";   // valor real f(x)
const EST_COL = "#f472b6";    // valor estimado L(x)
const ERR_COL = "#f87171";    // error
const DY_COL = "#fbbf24";     // diferencial dy

type Modo = "valor" | "esfera";

const RETO_KEY = "cen-diferencial-linealizacion-reto";

export function LabDiferencial({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("valor");
  const [casoId, setCasoId] = useState<LinId>("raiz");
  const [xPos, setXPos] = useState<number>(12);       // sonda x (modo valor)
  const [r, setR] = useState<number>(R_BASE);          // modo esfera
  const [dr, setDr] = useState<number>(DR_BASE);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable, teoría (cajón deslizable) y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [drawer, setDrawer] = useState(false);
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

  const caso = linCaso(casoId);

  // Animación: en "valor" barre x; en "esfera" barre el radio r.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      if (modo === "valor") {
        const span = caso.xmax - caso.xmin;
        setXPos((prev) => {
          let next = prev + dir * dt * span * 0.22;
          if (next <= caso.xmin) { next = caso.xmin; dir = 1; }
          else if (next >= caso.xmax) { next = caso.xmax; dir = -1; }
          return next;
        });
      } else {
        const span = R_MAX - R_MIN;
        setR((prev) => {
          let next = prev + dir * dt * span * 0.18;
          if (next <= R_MIN) { next = R_MIN; dir = 1; }
          else if (next >= R_MAX) { next = R_MAX; dir = -1; }
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, modo, caso.xmin, caso.xmax]);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarModo = (m: Modo) => { setPlaying(false); setModo(m); bump(); };
  const cambiarCaso = (id: LinId) => {
    setPlaying(false);
    setCasoId(id);
    const c = linCaso(id);
    setXPos(c.a + (c.xmax - c.a) * 0.5);
    bump();
  };
  const irAlProblema = () => { setPlaying(false); if (sonido) audioRef.current?.blip(); setXPos(caso.xEval); bump(); };
  const medidaProblema = () => { setPlaying(false); if (sonido) audioRef.current?.blip(); setR(R_BASE); setDr(DR_BASE); bump(); };
  const reset = () => {
    setPlaying(false);
    if (modo === "valor") setXPos(caso.a + (caso.xmax - caso.a) * 0.5);
    else { setR(R_BASE); setDr(DR_BASE); }
    bump();
  };

  const objetivos = [
    { txt: "Mueve el punto x para explorar la linealización", done: false },
    { txt: "Activa el modo Estimar un error (esfera)", done: false },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];
  // Los objetivos se recuerdan (algunos dependían del modo y se desmarcaban
  // solos) y se convierten en la marca del laboratorio, que antes no se
  // guardaba en ninguna parte.
  const { logros: logrosLab, cumplidos: cumplidosLab, total: totalLab } = useLogros(objetivos.map((o) => o.done));
  const { registraEstrellas } = useEstrellas(RETO_KEY);
  useEffect(() => {
    if (cumplidosLab === 0) return;
    const est = cumplidosLab >= totalLab ? 3 : cumplidosLab >= Math.ceil((totalLab * 2) / 3) ? 2 : 1;
    registraEstrellas(est);
  }, [cumplidosLab, totalLab, registraEstrellas]);

  // lecturas en vivo
  const lv = linLectura(caso, xPos);
  const le = esferaLectura(r, dr);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-ruler-combined" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>L(x) = f(a) + f&apos;(a)(x − a)</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 430, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena 3D, pero la idea sigue: cerca del punto base a, la recta tangente aproxima la curva. Así √9.04 ≈ 3 + (1/6)(0.04) ≈ 3.0067 y, para la esfera, dV = 4πr²·dr = 5π ≈ 15.71 cm³.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes dfPulse { 0%,100%{ box-shadow:0 0 0 0 var(--dfc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .df-live-dot { animation: dfPulse 1.6s ease-in-out infinite; }
        .df-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .df-grid { grid-template-columns: 1fr; } }
        .df-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .df-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .df-icobtn:hover { background:rgba(255,255,255,0.12); }
        .df-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--dfc) 0%, var(--dfc) var(--dffill), rgba(255,255,255,0.12) var(--dffill), rgba(255,255,255,0.12) 100%); }
        .df-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--dfc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .df-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--dfc); cursor:pointer; }
        .df-chip { cursor:pointer; padding:8px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; display:flex; align-items:center; gap:7px; }
        .df-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .df-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
        .df-seg { cursor:pointer; flex:1; padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12.5px; font-weight:900; transition:all .15s; text-align:center; display:flex; align-items:center; justify-content:center; gap:8px; }
        .df-seg[data-on="true"] { border-color:rgba(${color.rgba},0.8); background:rgba(${color.rgba},0.2); color:#fff; }
        @media (max-width: 1000px){ .df-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .ex-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ex-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ex-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .ex-drawer[data-open="true"] { transform:translateX(0); }
        .ex-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ex-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ex-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ex-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ex-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .ex-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      <div className="df-grid">
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
              <DiferencialScene modo={modo} casoId={casoId} xPos={xPos} r={r} dr={dr} accent={accent} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="df-live-dot" style={{ ["--dfc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>
                {modo === "valor" ? "L(x) = f(a) + f′(a)(x − a)" : "dV = 4π r²·dr"}
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="df-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="df-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="df-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : (modo === "valor" ? "Barrer x" : "Barrer el radio")}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="df-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Leyenda */}
            <div style={{ position: "absolute", top: 60, left: 16, display: "flex", flexDirection: "column", gap: 6, padding: "9px 12px", borderRadius: 12, background: "rgba(4,10,22,0.7)", border: `1px solid ${T.line}`, backdropFilter: "blur(8px)" }}>
              {modo === "valor" ? (
                <>
                  <LegItem col={caso.color} txt={`curva  ${caso.fExpr.replace("f(x) = ", "")}`} />
                  <LegItem col={TAN_COL} txt="linealización L(x)" dashed />
                  <LegItem col={REAL_COL} txt="valor real f(x)" />
                  <LegItem col={EST_COL} txt="estimado L(x)" />
                  <LegItem col={ERR_COL} txt="error" />
                </>
              ) : (
                <>
                  <LegItem col={accent} txt="esfera (radio r)" />
                  <LegItem col={ERR_COL} txt="cáscara = dV" />
                </>
              )}
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              {modo === "valor" ? (
                <>
                  <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                    <i className="fa-solid fa-ruler-combined" style={{ color: TAN_COL, marginRight: 7 }} />
                    En x = {fmt2(xPos)}: real f(x) = {fmt4(lv.real)} · estimado L(x) = {fmt4(lv.estimado)} · error = {fmt4(lv.error)}.
                  </div>
                  <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                    Diferencial dy = f′(a)·dx = {fmt4(lv.dy)} · cambio real Δy = {fmt4(lv.deltaY)} (con dx = {fmt2(lv.dx)}). Cuanto más cerca del punto base a = {fmt1(caso.a)}, menor el error.
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                    <i className="fa-solid fa-globe" style={{ color: ERR_COL, marginRight: 7 }} />
                    r = {fmt2(r)} cm, dr = {fmt2(dr)} cm → dV = 4πr²·dr = {fmt2(le.dV)} cm³ (incremento real ΔV = {fmt2(le.dVreal)} cm³).
                  </div>
                  <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                    Volumen V = (4/3)πr³ = {fmt1(le.V)} cm³ · error relativo dV/V = 3·dr/r = {fmt2(le.pct)} %.
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Selector de modo */}
          <div style={{ ...card, padding: "16px 18px" }}>
            <div style={{ display: "flex", gap: 9 }}>
              <button className="df-seg" data-on={modo === "valor"} onClick={() => cambiarModo("valor")}>
                <i className="fa-solid fa-chart-line" /> Estimar un valor
              </button>
              <button className="df-seg" data-on={modo === "esfera"} onClick={() => cambiarModo("esfera")}>
                <i className="fa-solid fa-globe" /> Estimar un error
              </button>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            {modo === "valor" ? (
              <>
                <Eyebrow>
                  <i className="fa-solid fa-function" style={{ marginRight: 8, color: accent }} />
                  Elige la función y mueve x para ver el error de la aproximación
                </Eyebrow>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {LIN_CASOS.map((c) => (
                    <button key={c.id} className="df-chip" data-on={casoId === c.id} onClick={() => cambiarCaso(c.id)}>
                      <i className="fa-solid fa-square-root-variable" style={{ color: c.color }} />
                      {c.titulo}
                    </button>
                  ))}
                  <button className="df-chip" onClick={irAlProblema} title="Va al punto del enunciado del A2">
                    <i className="fa-solid fa-bullseye" style={{ color: REAL_COL }} />
                    Ir al punto del problema (x = {fmt2(caso.xEval)})
                  </button>
                </div>
                <Deslizador
                  label="punto  x"
                  icon="fa-arrows-left-right-to-line"
                  colr={TAN_COL}
                  valor={`${fmt2(xPos)}`}
                  min={caso.xmin} max={caso.xmax} step={(caso.xmax - caso.xmin) / 600} value={xPos}
                  onChange={(v) => { setPlaying(false); setXPos(v); }}
                  hintL={`${fmt1(caso.xmin)}`} hintR={`${fmt1(caso.xmax)}`}
                />
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${TAN_COL}55`, background: `${TAN_COL}12`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-circle-info" style={{ color: TAN_COL, marginRight: 8 }} />
                  Punto base <strong style={{ color: REAL_COL }}>a = {fmt1(caso.a)}</strong>. {caso.lExpr}. La recta tangente <strong style={{ color: TAN_COL }}>es</strong> la linealización: pega con la curva en a y se separa al alejarte (ahí crece el error).
                </div>
              </>
            ) : (
              <>
                <Eyebrow>
                  <i className="fa-solid fa-globe" style={{ marginRight: 8, color: accent }} />
                  Mide la esfera: el radio r y su incertidumbre dr
                </Eyebrow>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  <button className="df-chip" onClick={medidaProblema} title="Datos del enunciado del A2">
                    <i className="fa-solid fa-bullseye" style={{ color: REAL_COL }} />
                    Medida del problema (r = 5.0, dr = 0.05)
                  </button>
                </div>
                <Deslizador
                  label="radio  r (cm)"
                  icon="fa-circle-dot"
                  colr={accent}
                  valor={`${fmt2(r)} cm`}
                  min={R_MIN} max={R_MAX} step={0.05} value={r}
                  onChange={(v) => { setPlaying(false); setR(v); }}
                  hintL={`${fmt1(R_MIN)} cm`} hintR={`${fmt1(R_MAX)} cm`}
                />
                <div style={{ height: 14 }} />
                <Deslizador
                  label="incertidumbre  dr (cm)"
                  icon="fa-plus-minus"
                  colr={ERR_COL}
                  valor={`± ${fmt3(dr)} cm`}
                  min={DR_MIN} max={DR_MAX} step={0.005} value={dr}
                  onChange={(v) => { setPlaying(false); setDr(v); }}
                  hintL={`${fmt2(DR_MIN)}`} hintR={`${fmt2(DR_MAX)}`}
                />
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${ERR_COL}55`, background: `${ERR_COL}12`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-circle-info" style={{ color: ERR_COL, marginRight: 8 }} />
                  La cáscara roja es el diferencial <strong style={{ color: ERR_COL, fontFamily: "ui-monospace, monospace" }}>dV = 4πr²·dr</strong>: superficie × grosor. Su grosor se ve exagerado para apreciarlo; el valor real dr = {fmt3(dr)} cm es minúsculo frente a r.
                </div>
              </>
            )}
          </div>

          {/* Tarjeta de comparación en vivo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
              {modo === "valor" ? "Diferencial dy  vs  cambio real Δy" : "Diferencial dV  vs  incremento real ΔV"}
            </Eyebrow>
            {modo === "valor" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <MiniVal label="dy = f′(a)·dx" value={fmt4(lv.dy)} col={DY_COL} />
                <MiniVal label="Δy real" value={fmt4(lv.deltaY)} col={REAL_COL} />
                <MiniVal label="error |f − L|" value={fmt4(lv.error)} col={ERR_COL} />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <MiniVal label="dV diferencial" value={`${fmt2(le.dV)} cm³`} col={DY_COL} />
                <MiniVal label="ΔV real" value={`${fmt2(le.dVreal)} cm³`} col={REAL_COL} />
                <MiniVal label="error dV/V" value={`${fmt2(le.pct)} %`} col={ERR_COL} />
              </div>
            )}
            <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 12, border: `1px solid ${REAL_COL}55`, background: `${REAL_COL}12`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
              <i className="fa-solid fa-bolt" style={{ color: REAL_COL, marginRight: 8 }} />
              {modo === "valor"
                ? <>El diferencial <strong style={{ color: DY_COL }}>dy</strong> (medido sobre la recta tangente) aproxima el cambio real <strong style={{ color: REAL_COL }}>Δy</strong>. Para dx pequeño casi coinciden: por eso L(x) sirve para estimar.</>
                : <>Un error del 1 % en el radio se convierte en 3 % en el volumen (el exponente 3 de r³ amplifica). Aquí dr/r = {fmt2((dr / r) * 100)} % → dV/V = {fmt2(le.pct)} %.</>}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* El modelo */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${TAN_COL}66`, background: `${TAN_COL}12` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: TAN_COL }}>
                <i className="fa-solid fa-ruler-combined" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El diferencial y la linealización</div>
            </div>
            <div style={{ display: "grid", gap: 7 }}>
              <ExprRow col={TAN_COL} txt="L(x) = f(a) + f′(a)(x − a)" />
              <ExprRow col={DY_COL} txt="dy = f′(a)·dx   (sobre la tangente)" />
              <ExprRow col={REAL_COL} txt="Δy = f(a + dx) − f(a)   (real)" />
              <ExprRow col={ERR_COL} txt="dV = 4π r²·dr  →  dV/V = 3·dr/r" />
            </div>
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${REAL_COL}44` }}>
                <i className="fa-solid fa-square-root-variable" style={{ color: REAL_COL, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>√(9.04) ≈ 3.0067</div>
                  <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>3 + (1/6)(0.04). Real ≈ 3.00666: error &lt; 0.0001.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${DY_COL}44` }}>
                <i className="fa-solid fa-e" style={{ color: DY_COL, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>e^(0.1) ≈ 1.1</div>
                  <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>1 + x con L(x) = 1 + x. Real ≈ 1.1052: error &lt; 0.5 %.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Resolución paso a paso (verbatim A2) */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              {modo === "valor" ? caso.titulo + " — paso a paso" : "El error de la esfera — paso a paso"}
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {(modo === "valor" ? caso.pasos.map((t, i) => ({ etiqueta: String(i + 1), texto: t })) : PASOS_ESFERA).map((p) => (
                <div key={p.etiqueta} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p.texto}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="df-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Lecturas
          </Eyebrow>
          {modo === "valor" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="x" value={`${fmt2(xPos)}`} col={TAN_COL} size={15} />
              <Readout label="real f(x)" value={`${fmt3(lv.real)}`} col={REAL_COL} size={15} />
              <Readout label="estimado L(x)" value={`${fmt3(lv.estimado)}`} col={EST_COL} size={15} />
              <Readout label="error" value={`${fmt4(lv.error)}`} col={ERR_COL} size={15} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="volumen V" value={`${fmt1(le.V)}`} col={REAL_COL} size={15} />
              <Readout label="dV diferencial" value={`${fmt2(le.dV)}`} col={DY_COL} size={15} />
              <Readout label="ΔV real" value={`${fmt2(le.dVreal)}`} col={TAN_COL} size={15} />
              <Readout label="error %" value={`${fmt2(le.pct)}`} col={ERR_COL} size={15} />
            </div>
          )}
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
          Cálculo <strong>exacto</strong>: las funciones (√x, eˣ) y la esfera son verbatim del enunciado A2. La linealización L(x) = f(a) + f&apos;(a)(x − a) y el diferencial dV = 4πr²·dr son simbólicos cerrados. En el modo esfera, el <strong>grosor dr se dibuja exagerado</strong> para que la cáscara sea visible (el valor real ±0.05 cm es minúsculo frente a r = 5 cm); los números en cm y cm³ son los reales.
        </span>
      </div>

      {/* ── Objetivos ─────────────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: "10px 24px" }}>
          {objetivos.map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: logrosLab[i] ? "#4ADE80" : T.text2 }}>
              <i className={`fa-solid ${logrosLab[i] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: logrosLab[i] ? 1 : 0.3 }} />
              <span style={{ fontWeight: logrosLab[i] ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reto evaluable: el ejercicio verbatim del ancla A2 ──────────── */}
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

      {/* ── Cajón de teoría ──────────────────────────────────────────────── */}
      <div className="ex-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ex-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ex-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ex-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ex-drawer-body">
          <FichaTeorica data={DIFERENCIAL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Mini valor ───────────────────────────────────────────────────────────── */
function MiniVal({ label, value, col }: { label: string; value: string; col: string }) {
  return (
    <div style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}33` }}>
      <div style={{ fontSize: 10, color: T.text3, fontWeight: 800, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>{value}</div>
    </div>
  );
}

/* ── Fila de expresión ────────────────────────────────────────────────────── */
function ExprRow({ col, txt }: { col: string; txt: string }) {
  return (
    <div style={{ padding: "9px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}33` }}>
      <div style={{ fontSize: 12.5, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>{txt}</div>
    </div>
  );
}

/* ── Item de leyenda (visor) ──────────────────────────────────────────────── */
function LegItem({ col, txt, dashed }: { col: string; txt: string; dashed?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, fontWeight: 800, color: "#dce6f5" }}>
      <span style={{ width: 18, height: 0, borderTop: `${dashed ? "2px dashed" : "3px solid"} ${col}`, flexShrink: 0 }} />
      {txt}
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
      <input type="range" className="df-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--dfc" as string]: colr, ["--dffill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}
