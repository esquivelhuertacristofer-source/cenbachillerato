"use client";

/**
 * Laboratorio 3D — Medición indirecta con razones trigonométricas.
 * Práctica experimental para PM-IV-P03-A2 (ejercicio_matematico; progresión 3).
 *
 * El alumno se "para" a una distancia d de un árbol y mide el ángulo de elevación
 * θ a la copa. La escena arma el triángulo rectángulo y, en vivo, calcula la
 * altura inalcanzable: H = (altura del observador) + d·tan θ. Refuerza SOH-CAH-TOA
 * y el concepto de medición indirecta. Cálculo exacto.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { TRIANGULO_FICHA } from "./triangulo-rectangulo-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import {
  calcMed, RAZONES, ESCENARIOS, IDEAS, DATOS,
  D_MIN, D_MAX, D_STEP, D_DEF, ANG_MIN, ANG_MAX, ANG_STEP, ANG_DEF,
  fmtNum2, fmtM, fmtDeg, type Escenario,
  RETO_A2,
} from "./triangulo-rectangulo-data";

const TrianguloRectanguloScene = dynamic(() => import("./TrianguloRectanguloScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-ruler-vertical fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Levantando el triángulo de medición…</span>
    </div>
  ),
});

const ADY_COL = "#60a5fa";
const OP_COL = "#34D399";
const HYP_COL = "#f5d36b";

export function LabTrianguloRectangulo({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [d, setD] = useState(D_DEF);
  const [angDeg, setAngDeg] = useState(ANG_DEF);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [mostrarHip, setMostrarHip] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const dir = useRef(1);

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

  // Barrido automático del ángulo de elevación (rebota entre los límites).
  // rAF en effect → sí actualiza las lecturas; el timestamp lo da rAF.
  useEffect(() => {
    if (!reproduciendo) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = ts - last;
      last = ts;
      setAngDeg((prev) => {
        let next = prev + dt * 0.02 * dir.current; // ~20°/s
        if (next >= ANG_MAX) { next = ANG_MAX; dir.current = -1; }
        else if (next <= ANG_MIN) { next = ANG_MIN; dir.current = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reproduciendo]);

  const m = useMemo(() => calcMed(d, angDeg), [d, angDeg]);

  const setDmanual = (v: number) => { setReproduciendo(false); setD(v); };
  const setAngManual = (v: number) => { setReproduciendo(false); setAngDeg(v); };
  const aplicar = (e: Escenario) => {
    setReproduciendo(false); setD(e.d); setAngDeg(e.angDeg); bump();
    if (sonido) audioRef.current?.blip();
  };
  const reset = () => { setReproduciendo(false); setD(D_DEF); setAngDeg(ANG_DEF); bump(); };
  const bump = () => setResetNonce((n) => n + 1);

  const objetivos = [
    { txt: "Ajusta la distancia d y el ángulo de elevación θ", done: d !== D_DEF || angDeg !== ANG_DEF },
    { txt: "Prueba un escenario guiado (árbol, edificio, torre…)", done: false },
    { txt: "Comprueba las tres razones SOH-CAH-TOA en vivo", done: true },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  // valores de las razones a partir de los lados reales (en metros)
  const razonVal: Record<string, string> = {
    "sen θ": fmtNum2(m.opuesto / m.hip),
    "cos θ": fmtNum2(m.ady / m.hip),
    "tan θ": fmtNum2(m.opuesto / m.ady),
  };

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-ruler-vertical" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Mide lo que no puedes alcanzar</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: con la distancia d y el ángulo de elevación θ, la altura es H = {fmtM(m.eye)} + d·tan θ. Usa los controles y las lecturas para comprobarlo.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseTri { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseTri 1.6s ease-in-out infinite; }
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
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
        .ex-tog { cursor:pointer; display:flex; align-items:center; gap:8px; padding:9px 12px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }

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
              <TrianguloRectanguloScene
                d={d}
                angDeg={angDeg}
                accent={accent}
                mostrarHip={mostrarHip}
                autoRotate={autoRotate}
                pausado={false}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: "#fff" }}>H = {fmtM(m.H)}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={reproduciendo} onClick={() => setReproduciendo((p) => !p)} title={reproduciendo ? "Pausar el barrido del ángulo" : "Barrer el ángulo de elevación"}>
                <i className={`fa-solid ${reproduciendo ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((vv) => !vv)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: ecuación en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 13.5, color: "#eaf0fb", fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>
                H = {fmtM(m.eye)} + <span style={{ color: ADY_COL }}>{fmtM(m.d)}</span> · tan {fmtDeg(m.angDeg)} = {fmtM(m.eye)} + <span style={{ color: OP_COL }}>{fmtM(m.opuesto)}</span> = <span style={{ color: accent }}>{fmtM(m.H)}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                <i className="fa-solid fa-eye" style={{ color: HYP_COL, marginRight: 7 }} />
                Línea de visión (hipotenusa) = d / cos θ = {fmtM(m.hip)}.
              </div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Mide en campo: distancia y ángulo
            </Eyebrow>
            <div style={{ display: "grid", gap: 16 }}>
              <Deslizador label="d · distancia al objeto (cinta)" icon="fa-ruler-horizontal" colr={ADY_COL}
                valor={fmtM(m.d)} min={D_MIN} max={D_MAX} step={D_STEP} value={d}
                onChange={setDmanual} hintL={`${D_MIN} m`} hintR={`${D_MAX} m`} />
              <Deslizador label="θ · ángulo de elevación (clinómetro)" icon="fa-angle-up" colr="#fbbf24"
                valor={fmtDeg(m.angDeg)} min={ANG_MIN} max={ANG_MAX} step={ANG_STEP} value={angDeg}
                onChange={setAngManual} hintL={`${ANG_MIN}°`} hintR={`${ANG_MAX}°`} />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              <button className="ex-tog" data-on={mostrarHip} onClick={() => setMostrarHip((v) => !v)} style={{ borderColor: mostrarHip ? `${HYP_COL}88` : T.line, background: mostrarHip ? `${HYP_COL}1a` : T.inset, color: mostrarHip ? "#fff" : T.text2 }}>
                <i className={`fa-solid ${mostrarHip ? "fa-eye" : "fa-eye-slash"}`} style={{ color: HYP_COL }} /> Línea de visión
              </button>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>OBJETOS PARA MEDIR</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ESCENARIOS.map((e) => (
                <button key={e.label} className="ex-chip" title={e.desc}
                  data-on={Math.abs(m.d - e.d) < 0.5 && Math.abs(m.angDeg - e.angDeg) < 0.5}
                  onClick={() => aplicar(e)}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* SOH-CAH-TOA */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-shapes" style={{ marginRight: 8, color: accent }} />
              Las tres razones: SOH-CAH-TOA
            </Eyebrow>
            <div style={{ display: "grid", gap: 10 }}>
              {RAZONES.map((r) => (
                <div key={r.abrev} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 12, border: `1px solid ${r.color}33`, background: "rgba(4,10,22,0.4)" }}>
                  <div style={{ width: 44, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#04121f", background: r.color, flexShrink: 0 }}>
                    {r.mnemo}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{r.abrev} = {r.formula}</div>
                    <div style={{ fontSize: 11, color: T.text2 }}>{r.nombre}</div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 900, color: r.color, fontFamily: "ui-monospace, monospace" }}>{razonVal[r.abrev]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* El cálculo paso a paso */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}55`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-calculator" />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El cálculo, paso a paso</div>
                <div style={{ fontSize: 11.5, color: accent, fontWeight: 800 }}>medición indirecta</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 9 }}>
              <PasoRow n={1} texto="Conozco la distancia y el ángulo:" valor={`d = ${fmtM(m.d)},  θ = ${fmtDeg(m.angDeg)}`} col={ADY_COL} />
              <PasoRow n={2} texto="Uso la tangente (opuesto sobre adyacente):" valor={`tan ${fmtDeg(m.angDeg)} = ${fmtNum2(m.tan)}`} col="#fbbf24" />
              <PasoRow n={3} texto="Despejo el cateto opuesto = d · tan θ:" valor={`= ${fmtM(m.opuesto)}`} col={OP_COL} />
              <PasoRow n={4} texto="Sumo la altura del observador:" valor={`H = ${fmtM(m.eye)} + ${fmtM(m.opuesto)} = ${fmtM(m.H)}`} col={accent} />
            </div>
          </div>

          {/* Anatomía del triángulo */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-vector-square" style={{ marginRight: 8, color: accent }} />
              Anatomía del triángulo
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              <LadoRow label="Adyacente (la distancia d)" valor={fmtM(m.ady)} col={ADY_COL} icon="fa-arrows-left-right" />
              <LadoRow label="Opuesto (altura sobre los ojos)" valor={fmtM(m.opuesto)} col={OP_COL} icon="fa-arrows-up-down" />
              <LadoRow label="Hipotenusa (línea de visión)" valor={fmtM(m.hip)} col={HYP_COL} icon="fa-eye" />
            </div>
            <div style={{ fontSize: 11.8, color: T.text2, lineHeight: 1.5, marginTop: 11 }}>
              El cateto <strong style={{ color: OP_COL }}>opuesto</strong> está enfrente del ángulo θ; el <strong style={{ color: ADY_COL }}>adyacente</strong> está pegado a él. El ángulo recto (90°) está donde el árbol toca la horizontal.
            </div>
          </div>

          {/* Por qué importa */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
              Medición indirecta
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
              Nadie trepó el árbol ni el edificio: solo se midió una <strong style={{ color: ADY_COL }}>distancia en el piso</strong> y un <strong style={{ color: "#fbbf24" }}>ángulo</strong> con un clinómetro. Así trabajan la topografía, la astronomía y la ingeniería para medir <strong style={{ color: "#fff" }}>lo inalcanzable</strong>: montañas, edificios, hasta la distancia a la Luna.
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
            <Readout label="altura H" value={fmtM(m.H)} col={accent} size={18} />
            <Readout label="opuesto" value={fmtM(m.opuesto)} col={OP_COL} size={18} />
            <Readout label="hipotenusa" value={fmtM(m.hip)} col={HYP_COL} size={18} />
            <Readout label="tan θ" value={fmtNum2(m.tan)} col="#fbbf24" size={18} />
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
          Cálculo <strong>exacto</strong>: los lados y la altura salen directamente de las razones trigonométricas del triángulo rectángulo (H = altura del observador + d·tan θ). Se toma la altura del observador/clinómetro como {fmtM(EYE_LABEL)} y el terreno horizontal. La escena escala el triángulo para encuadrarlo —su forma depende solo del ángulo θ, por triángulos semejantes—, pero los <strong>valores numéricos</strong> de las lecturas siempre son reales.
        </span>
      </div>

      {/* ── Objetivos ────────────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {objetivos.map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#4ade80" : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reto evaluable: ejercicio verbatim del ancla A2 ───────────────── */}
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
          <FichaTeorica data={TRIANGULO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

const EYE_LABEL = 1.6;

/* ── Fila de un paso del cálculo ─────────────────────────────────────────── */
function PasoRow({ n, texto, valor, col }: { n: number; texto: string; valor: string; col: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}30` }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: col, flexShrink: 0 }}>{n}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.35 }}>{texto}</div>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", marginTop: 2 }}>{valor}</div>
      </div>
    </div>
  );
}

/* ── Fila de un lado del triángulo ───────────────────────────────────────── */
function LadoRow({ label, valor, col, icon }: { label: string; valor: string; col: string; icon: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${col}33` }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: col, background: `${col}1e`, flexShrink: 0 }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 800, color: T.text2 }}>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
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
