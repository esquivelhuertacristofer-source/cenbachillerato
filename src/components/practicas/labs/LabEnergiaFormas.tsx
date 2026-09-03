"use client";

/**
 * Laboratorio 3D — Formas y transformación de la energía.
 * Práctica experimental para CNEYT-II-P01-A1
 * ("Formas de energía en el mundo cotidiano"; progresión 1).
 *
 * La energía no se crea ni se destruye: solo se TRANSFORMA de una forma a otra
 * (conservación de la energía). Los aparatos cotidianos son transformadores que
 * convierten una forma en otra, y en cada paso una parte se disipa como calor;
 * por eso ninguno es 100% eficiente, pero la energía total siempre se conserva:
 * entrada = salida útil + calor disipado. El estudiante elige un transformador,
 * regula la energía de entrada y ve fluir la energía cambiando de forma (color)
 * mientras el calor se escapa hacia arriba.
 * Ciencias Naturales, Experimentales y Tecnología II — "El poder de la energía"
 * (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";
import { FORMAS_ENERGIA_FICHA } from "./formas-energia-transformacion-ficha";
import { QUIZ_A2 } from "./formas-energia-transformacion-data";
import {
  TRANSFORMADORES,
  FORMAS,
  CASOS_IDENTIF,
  getTransformador,
  getForma,
  calcularBalance,
  fmtNum,
  fmtPct,
  DEFAULT_TRANSFORMADOR,
  E_MIN, E_MAX, E_STEP, E_DEFAULT,
} from "./energia-formas-data";

const EnergiaFormasScene = dynamic(() => import("./EnergiaFormasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bolt fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const ORO = "#ffd24a";
const CALOR = "#ff7a4a";

const RETO_KEY = "cen-formas-energia-transformacion-reto";

export function LabEnergiaFormas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [transformadorKey, setTransformadorKey] = useState<string>(DEFAULT_TRANSFORMADOR);
  const [entrada, setEntrada] = useState(E_DEFAULT);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioCadena, setVioCadena] = useState(false);
  const [vioFoco, setVioFoco] = useState(false);
  const [cambioEnergia, setCambioEnergia] = useState(false);
  const [vioVarios, setVioVarios] = useState(false);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);

  // teoría (cajón deslizable) y sonido
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const t = useMemo(() => getTransformador(transformadorKey), [transformadorKey]);
  const balance = useMemo(() => calcularBalance(t, entrada), [t, entrada]);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarTransformador = (k: string) => {
    setTransformadorKey(k);
    bump();
    if (sonido) audioRef.current?.blip();
    setVioCadena(true);
    if (k === "bombilla") setVioFoco(true);
    if (k !== DEFAULT_TRANSFORMADOR) setVioVarios(true);
  };

  const cambiarEntrada = (v: number) => { setEntrada(v); setCambioEnergia(true); };

  const reset = () => { setEntrada(E_DEFAULT); bump(); };

  const formaEntrada = getForma(balance.formaEntrada);
  const formaFinal = getForma(balance.formaFinal);

  const objetivos = [
    { txt: "Observa una cadena de transformación", done: vioCadena },
    { txt: "Mira el foco: solo 5% se vuelve luz", done: vioFoco },
    { txt: "Cambia la energía de entrada", done: cambioEnergia },
    { txt: "Compara varios transformadores", done: vioVarios },
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

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-bolt" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>La energía no se destruye: se transforma</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: en cada conversión, la entrada se reparte entre energía útil y calor. La suma siempre se conserva.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulse 1.6s ease-in-out infinite; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-divider { height:1px; background:${T.line}; margin:18px 0; }
        .ex-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--exc) 0%, var(--exc) var(--exfill), rgba(255,255,255,0.12) var(--exfill), rgba(255,255,255,0.12) 100%); }
        .ex-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--exc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--exc); cursor:pointer; }
        .ex-seg { display:flex; gap:6px; flex-wrap:wrap; }
        .ex-segbtn { cursor:pointer; flex:1 1 calc(50% - 6px); min-width:120px; display:flex; flex-direction:column; align-items:center; gap:5px;
          padding:11px 8px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2};
          font-size:12.5px; font-weight:700; transition:all .15s; }
        .ex-segbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-segbtn[data-on="true"] { border-color:var(--exc); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--exc); }
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
              height: "clamp(460px, 66vh, 780px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 50% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06182f 0%,#020d1d 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <EnergiaFormasScene
                transformadorKey={transformadorKey}
                entrada={entrada}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 15, fontWeight: 900, color: accent }}>
                <i className={`fa-solid ${t.icono}`} style={{ marginRight: 8 }} />
                {t.nombre}
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawerOpen} onClick={() => setDrawerOpen(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={!pausado} onClick={() => setPausado((p) => !p)} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: resumen del transformador */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.88) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#dCE8F6", lineHeight: 1.5, maxWidth: 620 }}>{t.resumen}</div>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawerOpen(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Selector de transformador + entrada */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Elige un transformador
            </Eyebrow>
            <div className="ex-seg" style={{ marginBottom: 18 }}>
              {TRANSFORMADORES.map((tr) => (
                <button
                  key={tr.key}
                  className="ex-segbtn"
                  data-on={transformadorKey === tr.key}
                  onClick={() => cambiarTransformador(tr.key)}
                  style={{ ["--exc" as string]: accent }}
                >
                  <i className={`fa-solid ${tr.icono}`} style={{ fontSize: 18, color: transformadorKey === tr.key ? accent : T.text3 }} />
                  {tr.nombre}
                </button>
              ))}
            </div>

            <Deslizador label="Energía de entrada" icon="fa-battery-full" colr={accent}
              valor={`${fmtNum(entrada)} J`} min={E_MIN} max={E_MAX} step={E_STEP} value={entrada} onChange={cambiarEntrada}
              hintL={`${formaEntrada.nombre} (entrada)`} hintR={`${formaFinal.nombre} (salida)`} />
          </div>

          {/* Balance de energía (conservación) */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
              Balance de energía · se conserva
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 14 }}>
              <Readout label="Entra" value={`${fmtNum(balance.entrada)} J`} col={accent} size={16} />
              <Readout label="Útil (sale)" value={`${fmtNum(balance.util)} J`} col={VERDE} size={16} />
              <Readout label="Calor disipado" value={`${fmtNum(balance.calorTotal)} J`} col={CALOR} size={16} />
            </div>

            {/* Barra útil vs calor */}
            <div style={{ display: "flex", height: 22, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.line}`, marginBottom: 8 }}>
              <div style={{ width: `${balance.eficienciaGlobal * 100}%`, background: VERDE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04241a", minWidth: 0, overflow: "hidden", whiteSpace: "nowrap" }}>
                {balance.eficienciaGlobal >= 0.12 ? `${fmtPct(balance.eficienciaGlobal)} útil` : ""}
              </div>
              <div style={{ flex: 1, background: CALOR, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#3a1404", minWidth: 0, overflow: "hidden", whiteSpace: "nowrap" }}>
                {(1 - balance.eficienciaGlobal) >= 0.12 ? `${fmtPct(1 - balance.eficienciaGlobal)} calor` : ""}
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
              Eficiencia global: <strong style={{ color: VERDE }}>{fmtPct(balance.eficienciaGlobal)}</strong>. La energía útil más el calor disipan exactamente lo que entró: <strong style={{ color: T.text }}>{fmtNum(balance.util)} + {fmtNum(balance.calorTotal)} = {fmtNum(balance.entrada)} J</strong>. {t.verbatim ? (
                <span style={{ color: "#ffd9a8" }}> Las cifras de este caso son <strong>dato de la actividad</strong> (5% luz / 95% calor).</span>
              ) : (
                <span style={{ color: T.text3 }}> Eficiencias aproximadas típicas (valores reales orientativos).</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Conservación de la energía</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            La energía es la capacidad de producir cambios. <strong style={{ color: T.text }}>No se crea ni se destruye</strong>: solo se transforma de una forma a otra. En cada transformación real una parte se vuelve <strong style={{ color: CALOR }}>calor</strong>, así que ningún aparato es 100% eficiente, pero la suma siempre se conserva.
          </div>

          <div className="ex-divider" />

          <Eyebrow>Las seis formas de energía</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {FORMAS.map((f) => (
              <div key={f.key} style={{ display: "flex", alignItems: "flex-start", gap: 11, fontSize: 12.5, color: T.text2 }}>
                <span style={{ width: 22, textAlign: "center", color: f.color, fontSize: 14, marginTop: 1 }}>
                  <i className={`fa-solid ${f.icono}`} />
                </span>
                <span><strong style={{ color: f.color }}>{f.nombre}</strong>{f.formula ? <span style={{ color: T.text3, fontFamily: "ui-monospace, monospace" }}> · {f.formula}</span> : null} — {f.descripcion}</span>
              </div>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Identifica la forma</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {CASOS_IDENTIF.map((c, i) => (
              <div key={i} style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.45 }}>
                <strong style={{ color: T.text }}>{c.caso}</strong> → <strong style={{ color: accent }}>{c.forma}</strong>
                <span style={{ display: "block", color: T.text3, fontSize: 11.5 }}>{c.detalle}</span>
              </div>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>En la vida real (México)</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Las presas como <strong>Chicoasén</strong> convierten energía potencial del agua en eléctrica; los <strong>paneles solares</strong> que crecen en Sonora transforman luz en electricidad; y cambiar focos incandescentes por <strong style={{ color: ORO }}>LED</strong> ahorra porque el viejo foco tiraba el 95% de la energía en calor.
          </div>
        </div>
      </div>

      {/* ── Objetivos + pista ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
            Objetivos
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {objetivos.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: logrosLab[i] ? OK : T.text2 }}>
                <i className={`fa-solid ${logrosLab[i] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: logrosLab[i] ? 1 : 0.3 }} />
                <span style={{ fontWeight: logrosLab[i] ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: "18px 20px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 13 }}>
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            Fíjate en el <strong style={{ color: accent }}>grosor del río</strong>: tras cada aparato se adelgaza porque parte de la energía se fue como <strong style={{ color: CALOR }}>calor</strong> (las partículas que suben). En el <strong>foco</strong> el río casi desaparece: solo el 5% sale como luz.
          </span>
        </div>
      </div>

      {/* ── Reto evaluable: el quiz verbatim del ancla ───────────────── */}
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
      <div className="ex-scrim" data-open={drawerOpen} onClick={() => setDrawerOpen(false)} />
      <aside className="ex-drawer" data-open={drawerOpen} aria-hidden={!drawerOpen}>
        <div className="ex-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ex-close" onClick={() => setDrawerOpen(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ex-drawer-body">
          <FichaTeorica data={FORMAS_ENERGIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Deslizador reutilizable ─────────────────────────────────────────── */
function Deslizador({ label, icon, colr, valor, min, max, step, value, onChange, hintL, hintR }: {
  label: string; icon: string; colr: string; valor: string;
  min: number; max: number; step: number; value: number; onChange: (v: number) => void;
  hintL?: string; hintR?: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: colr }}>
          <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} />
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 900, color: colr, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
      </div>
      <input type="range" className="ex-range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--exc" as string]: colr, ["--exfill" as string]: `${((value - min) / (max - min)) * 100}%` }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}
