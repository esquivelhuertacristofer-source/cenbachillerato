"use client";

/**
 * Laboratorio 3D — Reacción vinagre + bicarbonato (desprendimiento de CO₂).
 * Práctica experimental para CNEYT-IV-P08-A2 (simulacion "Simulación:
 * experimentos de química casera"; UAC "Reacciones químicas", progresión 8:
 * "Diseña y realiza experimentos sencillos de química con materiales
 * accesibles"). Modela el Experimento 1 de la simulación.
 *
 * El alumno diseña el experimento: elige la variable independiente (gramos de
 * bicarbonato, % o volumen de vinagre), "reacciona" y mide la variable
 * dependiente (volumen de CO₂ que infla el globo y el tiempo). El cálculo es
 * estequiometría real (1:1) con REACTIVO LIMITANTE; un control con agua
 * permite comprobar que el gas proviene del ácido.
 *
 * Valores caseros (g por cucharada, tiempo de reacción) = aproximados/didácticos.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { REACCION_CO2_FICHA } from "./reaccion-co2-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./reaccion-co2-data";
import { LabSfx } from "./lab-audio";
import {
  VINAGRES, VOLUMENES, VOL_DEF, PCT_DEF,
  BICARB_MIN, BICARB_MAX, BICARB_PASO, BICARB_DEF,
  CUCHARADITA_G, CUCHARADA_G,
  calcula, curvaCO2, gEstequiometrico, tiempoReaccion,
  ECUACION, TIPO_REACCION, DATOS, IDEAS,
  fmt0, fmt1, fmtVol, type PuntoG,
} from "./co2-data";

const Co2Scene = dynamic(() => import("./Co2Scene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el material…</span>
    </div>
  ),
});

type Foco = "bicarbonato" | "concentracion" | "volumen";

const FOCOS: { id: Foco; label: string; icono: string }[] = [
  { id: "bicarbonato", label: "Gramos de bicarbonato", icono: "fa-spoon" },
  { id: "concentracion", label: "% del vinagre", icono: "fa-percent" },
  { id: "volumen", label: "Volumen de vinagre", icono: "fa-flask" },
];

export function LabCo2({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const colorGlobo = "#FB7185"; // globo rosado (color del experimento)

  const [volMl, setVolMl] = useState(VOL_DEF);
  const [pct, setPct] = useState(PCT_DEF);
  const [gBicarb, setGBicarb] = useState(BICARB_DEF);
  const [control, setControl] = useState(false);
  const [foco, setFoco] = useState<Foco>("bicarbonato");

  const [reaccionando, setReaccionando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resetNonce, setResetNonce] = useState(0);

  // evaluable, teoría (cajón deslizable) y sonido
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

  // Control = agua en lugar de vinagre → no hay ácido → no hay reacción.
  const res = useMemo(() => calcula(volMl, control ? 0 : pct, gBicarb), [volMl, pct, gBicarb, control]);
  const gEstq = useMemo(() => gEstequiometrico(volMl, pct), [volMl, pct]);
  const tiempo = tiempoReaccion(pct);
  const curva = useMemo(() => curvaCO2(volMl, pct), [volMl, pct]);
  const hayReaccion = res.nCO2 > 0.01;

  // Volumen "en vivo" según el avance de la reacción (lo que muestra el globo).
  const volVivo = res.volCO2mL * progreso;

  // Animación de la reacción (setInterval en useEffect: seguro con React
  // Compiler — no es render ni useFrame).
  useEffect(() => {
    if (!reaccionando) return;
    const id = setInterval(() => {
      setProgreso((p) => {
        if (p >= 1) {
          setReaccionando(false);
          return 1;
        }
        return Math.min(1, p + 0.02);
      });
    }, 40);
    return () => clearInterval(id);
  }, [reaccionando]);

  // Cambiar una variable detiene la reacción y desinfla el globo (hay que
  // volver a "reaccionar" con el nuevo diseño experimental).
  const resetReaccion = () => {
    setReaccionando(false);
    setProgreso(0);
  };
  const cambiarBic = (g: number) => { setGBicarb(g); resetReaccion(); };
  const cambiarPct = (p: number) => { setPct(p); resetReaccion(); };
  const cambiarVol = (v: number) => { setVolMl(v); resetReaccion(); };
  const toggleControl = () => { setControl((c) => !c); resetReaccion(); };

  const reaccionar = () => { if (sonido) audioRef.current?.blip(); setProgreso(0); setReaccionando(true); };
  const reiniciar = () => { setReaccionando(false); setProgreso(0); setResetNonce((n) => n + 1); };

  const limTxt =
    control ? "Control: agua (no reacciona)"
    : res.limitante === "bicarbonato" ? "Bicarbonato (se agota)"
    : res.limitante === "acido" ? "Ácido acético (se agota)"
    : "Cantidades exactas";
  const limCol = control ? T.text3 : res.limitante === "iguales" ? "#A78BFA" : accent;

  const aprox = `≈ ${fmt1(gBicarb / CUCHARADA_G)} cda · ${fmt1(gBicarb / CUCHARADITA_G)} cdta`;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-flask" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Reacción vinagre + bicarbonato</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: con esta mezcla se producen {fmtVol(res.volCO2mL)} de CO₂ ({fmt0(res.nCO2)} mmol). Limitante: {limTxt.toLowerCase()}.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes co2Pulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .co2-live-dot { animation: co2Pulse 1.6s ease-in-out infinite; }
        .co2-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .co2-grid { grid-template-columns: 1fr; } }
        .co2-chip { cursor:pointer; padding:9px 11px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; display:flex; align-items:center; gap:9px; }
        .co2-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .co2-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.16); color:#fff; }
        .co2-pill { cursor:pointer; padding:8px 14px; border-radius:10px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12.5px; font-weight:900; transition:all .15s; }
        .co2-pill[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.2); color:#fff; }
        .co2-pill:hover { color:#fff; }
        .co2-solve { cursor:pointer; flex:1; padding:11px 14px; border-radius:11px; border:none; font-size:13px; font-weight:900;
          display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
        .co2-ghost { cursor:pointer; padding:11px 14px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:13px; font-weight:900; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
        .co2-ghost:hover { border-color:rgba(255,255,255,0.3); color:#fff; }
        .co2-range { -webkit-appearance:none; appearance:none; width:100%; height:8px; border-radius:6px;
          background:linear-gradient(90deg, rgba(${color.rgba},0.6), rgba(${color.rgba},0.2)); outline:none; }
        .co2-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:22px; height:22px; border-radius:50%;
          background:#fff; border:3px solid ${accent}; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .co2-range::-moz-range-thumb { width:22px; height:22px; border-radius:50%; background:#fff; border:3px solid ${accent}; cursor:pointer; }
        @media (max-width: 1000px){ .co2-bottom { grid-template-columns: 1fr !important; } }

        /* Toolbar icon buttons */
        .co2-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .co2-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .co2-icobtn:hover { background:rgba(255,255,255,0.12); }

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

      <div className="co2-grid">
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
              <Co2Scene volCO2mL={control ? 0 : res.volCO2mL} progreso={progreso} reaccionando={reaccionando && hayReaccion} colorGlobo={colorGlobo} accent={accent} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO: CO₂ que infla el globo */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="co2-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>CO₂ {fmtVol(control ? 0 : volVivo)}</span>
            </div>

            {/* Badge reactivo limitante */}
            <div style={{ position: "absolute", top: 58, left: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${limCol}88`, backdropFilter: "blur(10px)" }}>
              <i className="fa-solid fa-flask-vial" style={{ color: limCol, fontSize: 11 }} />
              <span style={{ fontSize: 11.5, fontWeight: 900, color: limCol }}>{limTxt}</span>
            </div>

            {/* Toolbar: teoría + sonido */}
            <div
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                display: "flex",
                gap: 2,
                padding: 4,
                borderRadius: 12,
                background: "rgba(2,12,28,0.74)",
                border: `1px solid ${T.line}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <button className="co2-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="co2-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: lectura */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: colorGlobo, border: "1px solid rgba(255,255,255,0.4)" }} />
                El globo se infla con el <strong>CO₂</strong> producido
                <span style={{ color: T.text3, fontWeight: 600 }}>· su tamaño = volumen de gas</span>
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                <i className="fa-solid fa-spoon" style={{ color: accent, marginRight: 7 }} />
                {control ? "Agua (control)" : `${volMl} mL de vinagre ${pct}%`} + {fmt1(gBicarb)} g de NaHCO₃
              </div>
            </div>
          </div>

          {/* ── Diseña el experimento ───────────────────────────── */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-vials" style={{ marginRight: 8, color: accent }} />
              Diseña el experimento
            </Eyebrow>

            {/* Variable independiente */}
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "2px 0 9px" }}>
              VARIABLE INDEPENDIENTE (la que vas a cambiar)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 18 }}>
              {FOCOS.map((f) => (
                <button key={f.id} className="co2-chip" data-on={f.id === foco} onClick={() => setFoco(f.id)} style={{ justifyContent: "center", textAlign: "center" }}>
                  <i className={`fa-solid ${f.icono}`} style={{ color: accent }} /> {f.label}
                </button>
              ))}
            </div>

            {/* Slider bicarbonato */}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: foco === "bicarbonato" ? "#fff" : T.text2 }}>
                Bicarbonato de sodio {foco === "bicarbonato" && <span style={{ color: accent }}>· independiente</span>}
              </span>
              <span style={{ fontSize: 13, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{fmt1(gBicarb)} g <span style={{ color: T.text3, fontWeight: 600, fontSize: 11 }}>{aprox}</span></span>
            </div>
            <input className="co2-range" type="range" min={BICARB_MIN} max={BICARB_MAX} step={BICARB_PASO} value={gBicarb} onChange={(e) => cambiarBic(parseFloat(e.target.value))} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.text3, marginTop: 4 }}>
              <span>0 g</span>
              <span>punto exacto ≈ {fmt1(gEstq)} g</span>
              <span>{BICARB_MAX} g</span>
            </div>

            {/* Concentración + volumen del vinagre */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: foco === "concentracion" ? "#fff" : T.text2, marginBottom: 8 }}>
                  Concentración {foco === "concentracion" && <span style={{ color: accent }}>· indep.</span>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {VINAGRES.map((v) => (
                    <button key={v.pct} className="co2-pill" data-on={pct === v.pct && !control} disabled={control} onClick={() => cambiarPct(v.pct)} style={{ flex: 1, opacity: control ? 0.4 : 1, cursor: control ? "not-allowed" : "pointer" }}>{v.pct}%</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: foco === "volumen" ? "#fff" : T.text2, marginBottom: 8 }}>
                  Volumen {foco === "volumen" && <span style={{ color: accent }}>· indep.</span>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {VOLUMENES.map((v) => (
                    <button key={v} className="co2-pill" data-on={volMl === v} onClick={() => cambiarVol(v)} style={{ flex: 1 }}>{v}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Control + acciones */}
            <button className="co2-chip" data-on={control} onClick={toggleControl} style={{ width: "100%", marginTop: 16, justifyContent: "center", textAlign: "center" }}>
              <i className="fa-solid fa-vial-circle-check" style={{ color: control ? accent : T.text3 }} />
              Usar agua como control (debe NO reaccionar)
            </button>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="co2-solve" onClick={reaccionar} disabled={reaccionando}
                style={{ background: reaccionando ? "rgba(255,255,255,0.06)" : accent, color: reaccionando ? T.text3 : "#04121f", cursor: reaccionando ? "default" : "pointer" }}>
                <i className={`fa-solid ${reaccionando ? "fa-spinner fa-spin" : "fa-play"}`} />
                {reaccionando ? "Reaccionando…" : "¡Reaccionar!"}
              </button>
              <button className="co2-ghost" onClick={reiniciar}>
                <i className="fa-solid fa-rotate-left" /> Reiniciar
              </button>
            </div>

            {/* Curva CO₂ vs bicarbonato */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, marginBottom: 8 }}>CO₂ PRODUCIDO vs GRAMOS DE BICARBONATO</div>
              <CurvaCO2 curva={curva} gActual={gBicarb} gEstq={gEstq} accent={accent} />
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Lecturas en vivo */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${limCol}55`, background: `rgba(${color.rgba},0.08)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#04121f", background: colorGlobo, boxShadow: `0 6px 18px -6px ${colorGlobo}` }}>
                <i className="fa-solid fa-wind" />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1, fontFamily: "ui-monospace, monospace" }}>{fmtVol(control ? 0 : res.volCO2mL)}</div>
                <div style={{ fontSize: 12, color: T.text2, fontWeight: 800 }}>de CO₂ ({control ? "0" : fmt0(res.nCO2)} mmol)</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              <Readout label="ácido (mmol)" value={control ? "0" : fmt0(res.nAcido)} col="#FB7185" size={15} />
              <Readout label="bicarb. (mmol)" value={fmt0(res.nBicarb)} col="#34D399" size={15} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 4 }}>
              <Readout label="masa CO₂" value={control ? "0" : fmt1(res.masaCO2)} unit="g" col="#bfe8ff" size={15} />
              <Readout label="tiempo aprox." value={control ? "—" : `~${tiempo}`} unit="s" col="#bfe8ff" size={15} />
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5, marginTop: 13, paddingTop: 13, borderTop: `1px solid ${T.line}` }}>
              {control
                ? <>El agua no tiene ácido, así que <strong style={{ color: "#fff" }}>no se produce CO₂</strong>: es el control que confirma que el gas viene del vinagre.</>
                : res.limitante === "bicarbonato"
                  ? <>Sobra ácido: el <strong style={{ color: "#34D399" }}>bicarbonato se agota</strong> primero y limita el CO₂. Añadir más vinagre no daría más gas.</>
                  : res.limitante === "acido"
                    ? <>Sobra bicarbonato ({fmt0(res.sobranteMmol)} mmol sin reaccionar): el <strong style={{ color: "#FB7185" }}>ácido se agota</strong> y limita el CO₂. <strong>Echar más bicarbonato no produce más gas.</strong></>
                    : <>Cantidades <strong style={{ color: "#A78BFA" }}>estequiométricas</strong>: ambos reactivos se consumen por completo.</>}
            </div>
          </div>

          {/* Método científico */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-microscope" style={{ marginRight: 8, color: accent }} />
              Método científico
            </Eyebrow>
            <div style={{ display: "grid", gap: 10 }}>
              <MetVar etiqueta="Variable independiente" valor={FOCOS.find((f) => f.id === foco)!.label} sub="la que tú cambias" col={accent} />
              <MetVar etiqueta="Variable dependiente" valor="Volumen de CO₂ y tiempo" sub="lo que mides" col="#bfe8ff" />
              <MetVar etiqueta="Variables controladas" valor={controladas(foco)} sub="lo que mantienes igual" col={T.text2} />
              <MetVar etiqueta="Control" valor={control ? "Activo: agua sin ácido" : "Agua sin ácido (actívalo)"} sub="muestra que no debe reaccionar" col={control ? "#34D399" : T.text3} />
            </div>
          </div>

          {/* La reacción */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-atom" style={{ marginRight: 8, color: accent }} />
              La reacción
            </Eyebrow>
            <div style={{ padding: "12px 14px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}`, fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: "ui-monospace, monospace", textAlign: "center", lineHeight: 1.5 }}>
              {ECUACION}
            </div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginTop: 12 }}>
              <strong style={{ color: "#fff" }}>Tipo:</strong> {TIPO_REACCION}.
            </div>
            <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.5, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
              <strong style={{ color: accent }}>Conservación de la masa:</strong> los átomos no se crean ni se destruyen. El CO₂ escapa como gas, por eso un frasco abierto pesa menos al terminar.
            </div>
          </div>
        </div>
      </div>

      {/* ── Objetivos ──────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {[
            { txt: "Diseña el experimento eligiendo una variable independiente", done: progreso > 0 },
            { txt: "Activa el control con agua para comprobar el origen del CO₂", done: control },
            { txt: "Observa el reactivo limitante en la reacción", done: progreso >= 1 && hayReaccion },
            { txt: "Aprueba el cuestionario de la actividad A4", done: ejercicioAprobado },
          ].map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#34D399" : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Datos + ideas clave ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="co2-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Datos clave
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{d.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{d.texto}</div>
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
          El volumen de CO₂ se calcula con <strong>estequiometría real</strong> (relación molar 1:1 y reactivo limitante) usando el volumen molar de un gas a 25 °C y 1 atm (24.45 L/mol). Los valores caseros son <strong>aproximados</strong> (1 cucharada ≈ 14 g; 1 cucharadita ≈ 4 g) y el tiempo de reacción es <strong>cualitativo/didáctico</strong> (mayor concentración → más rápido), no una medición. El globo y las burbujas ilustran el gas; su tamaño es proporcional al volumen calculado.
        </span>
      </div>

      {/* ── Reto evaluable: quiz verbatim A4 ─────────────────────────── */}
      <RetoQuizCard
        quiz={QUIZ_A2}
        accent={accent}
        rgba={color.rgba}
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
        playPick={sonido ? () => audioRef.current?.blip() : undefined}
      />

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
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
          <FichaTeorica data={REACCION_CO2_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Texto de variables controladas según el foco ────────────────────────── */
function controladas(foco: Foco): string {
  if (foco === "bicarbonato") return "Vinagre (% y volumen), temperatura";
  if (foco === "concentracion") return "Bicarbonato (g), volumen, temperatura";
  return "Bicarbonato (g), % del vinagre, temperatura";
}

/* ── Fila de variable del método científico ──────────────────────────────── */
function MetVar({ etiqueta, valor, sub, col }: { etiqueta: string; valor: string; sub: string; col: string }) {
  return (
    <div style={{ padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", color: T.text3, textTransform: "uppercase" }}>{etiqueta}</div>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: col, marginTop: 2 }}>{valor}</div>
      <div style={{ fontSize: 10.5, color: T.text3 }}>{sub}</div>
    </div>
  );
}

/* ── Curva CO₂ vs bicarbonato (SVG inline) ───────────────────────────────── */
function CurvaCO2({ curva, gActual, gEstq, accent }: { curva: PuntoG[]; gActual: number; gEstq: number; accent: string }) {
  const W = 320, H = 150, PL = 38, PB = 24, PT = 10, PR = 10;
  const gMax = curva[curva.length - 1]?.g ?? 1;
  const vMax = Math.max(...curva.map((p) => p.volCO2mL), 1);
  const x = (g: number) => PL + (g / gMax) * (W - PL - PR);
  const y = (v: number) => PT + (1 - v / vMax) * (H - PT - PB);
  const pts = curva.map((p) => `${x(p.g).toFixed(1)},${y(p.volCO2mL).toFixed(1)}`).join(" ");
  const vActual = curva.reduce((best, p) => (Math.abs(p.g - gActual) < Math.abs(best.g - gActual) ? p : best), curva[0]!);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {/* eje Y (volumen) */}
      <text x={4} y={y(vMax) + 3} fontSize={8.5} fill="rgba(255,255,255,0.5)">{fmtVol(vMax)}</text>
      <text x={4} y={H - PB + 3} fontSize={8.5} fill="rgba(255,255,255,0.5)">0</text>
      <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      {/* línea del punto estequiométrico (donde deja de subir) */}
      <line x1={x(gEstq)} y1={PT} x2={x(gEstq)} y2={H - PB} stroke={`${accent}66`} strokeWidth={1} strokeDasharray="4 3" />
      <text x={x(gEstq)} y={H - 9} textAnchor="middle" fontSize={8} fill={accent} fontWeight={700}>punto exacto</text>
      {/* curva (sube y luego se aplana = reactivo limitante) */}
      <polyline points={pts} fill="none" stroke={accent} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
      {/* punto actual */}
      <circle cx={x(vActual.g)} cy={y(vActual.volCO2mL)} r={4.5} fill="#fff" stroke={accent} strokeWidth={2} />
      <text x={x(vActual.g)} y={y(vActual.volCO2mL) - 8} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={800}>{fmtVol(vActual.volCO2mL)}</text>
      {/* eje x */}
      <text x={(PL + W - PR) / 2} y={H - 1} textAnchor="middle" fontSize={8.5} fill="rgba(255,255,255,0.4)">gramos de bicarbonato →</text>
    </svg>
  );
}
