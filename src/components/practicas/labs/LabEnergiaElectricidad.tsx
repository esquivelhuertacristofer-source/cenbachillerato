"use client";

/**
 * Laboratorio 3D — Energía, partículas y electricidad.
 * Práctica experimental para CNEYT-I-P11-A1.
 *
 * El estudiante arma un circuito simple: cierra el INTERRUPTOR, elige el VOLTAJE
 * de la pila y prueba distintos MATERIALES. Ve que la corriente es el FLUJO de
 * electrones (partículas con carga) y que solo circula con un conductor y el
 * circuito cerrado. Al circular, la energía eléctrica se transforma en luz: el
 * foco brilla más a mayor voltaje (P = V·I).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { MATERIALES, VOLTAJES, corriente, potencia, brilloDe } from "./electricidad-data";
import { FichaTeorica } from "./_ficha";
import { ENERGIA_ELECTRICIDAD_FICHA } from "./energia-electricidad-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./energia-electricidad-data";
import { LabSfx } from "./lab-audio";

const EnergiaElectricidadScene = dynamic(() => import("./EnergiaElectricidadScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bolt fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const NO = "#FF5E5E";
const FOCO_GLOW = "#FFD66B";

const fmt = (n: number, dec = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });

export function LabEnergiaElectricidad({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [switchClosed, setSwitchClosed] = useState(false);
  const [materialKey, setMaterialKey] = useState("cobre");
  const [voltaje, setVoltaje] = useState(4.5);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // teoría (cajón deslizable) y sonido
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

  // seguimiento de objetivos
  const [cerro, setCerro] = useState(false);
  const [encendio, setEncendio] = useState(false);
  const [proboAislante, setProboAislante] = useState(false);
  const [voltajesProbados, setVoltajesProbados] = useState<Set<number>>(() => new Set<number>([4.5]));

  const material = useMemo(() => MATERIALES.find((m) => m.key === materialKey)!, [materialKey]);
  const conduce = switchClosed && material.conductor;
  const corrienteA = conduce ? corriente(voltaje) : 0;
  const potenciaW = conduce ? potencia(voltaje) : 0;
  const brillo = conduce ? brilloDe(voltaje) : 0;

  const toggleSwitch = () => {
    const next = !switchClosed;
    setSwitchClosed(next);
    if (sonido) audioRef.current?.blip();
    if (next) setCerro(true);
    if (next && material.conductor) setEncendio(true);
  };
  const elegirVoltaje = (v: number) => {
    setVoltaje(v);
    setVoltajesProbados((prev) => {
      if (prev.has(v)) return prev;
      const nx = new Set(prev);
      nx.add(v);
      return nx;
    });
    if (switchClosed && material.conductor) setEncendio(true);
  };
  const elegirMaterial = (k: string) => {
    setMaterialKey(k);
    const m = MATERIALES.find((mm) => mm.key === k)!;
    if (!m.conductor) setProboAislante(true);
    if (switchClosed && m.conductor) setEncendio(true);
  };
  const reset = () => {
    setSwitchClosed(false);
    setResetNonce((n) => n + 1);
  };

  // Estado del circuito (para la cinta del visor)
  const estado = !switchClosed ? "Circuito abierto" : conduce ? "Corriente fluyendo" : "Sin conducir";
  const estadoColor = !switchClosed ? "#8AB4FF" : conduce ? OK : NO;

  const objetivos = [
    { txt: "Cierra el interruptor", done: cerro },
    { txt: "Enciende el foco con un conductor", done: encendio },
    { txt: "Comprueba que un aislante no conduce", done: proboAislante },
    { txt: "Prueba los 4 voltajes", done: voltajesProbados.size >= 4 },
    { txt: "Resuelve el reto de energía y electricidad", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-bolt" />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>Circuito eléctrico</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: la corriente es el <strong style={{ color: T.text }}>flujo de electrones</strong> y solo circula con un conductor y el circuito cerrado.
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
        .ex-mat { position:relative; cursor:pointer; border-radius:12px; border:1px solid ${T.line}; background:${T.glass};
          display:flex; align-items:center; gap:10px; padding:11px 13px; transition:all .14s ease; text-align:left; width:100%; }
        .ex-mat:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; }
        .ex-volt { cursor:pointer; flex:1; padding:10px 4px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:14px; font-weight:800; transition:all .15s; }
        .ex-volt:hover { color:#fff; border-color:${T.lineStrong}; }
        .ex-bigbtn { cursor:pointer; width:100%; display:inline-flex; align-items:center; justify-content:center; gap:10px; padding:14px 20px;
          border-radius:13px; border:none; font-size:15px; font-weight:800; transition:all .15s; }
        .ex-bigbtn:hover { filter:brightness(1.08); }
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
              <EnergiaElectricidadScene
                conduce={conduce}
                switchClosed={switchClosed}
                voltaje={voltaje}
                brillo={brillo}
                materialColor={material.color}
                materialConductor={material.conductor}
                accent={accent}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO + estado */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${estadoColor}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${estadoColor}aa`, width: 9, height: 9, borderRadius: "50%", background: estadoColor }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: estadoColor }}>{estado}</span>
            </div>

            {/* Etiquetas de componentes */}
            <div style={{ position: "absolute", top: 56, left: 16, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", pointerEvents: "none" }}>↑ Foco</div>
            <div style={{ position: "absolute", bottom: 52, left: 16, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", pointerEvents: "none" }}>↓ Pila (energía)</div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
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

            {/* Foco status (esquina inferior) */}
            <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 12, padding: "9px 18px", borderRadius: 13, background: "rgba(2,12,28,0.7)", border: `1px solid ${T.line}`, backdropFilter: "blur(8px)", pointerEvents: "none", whiteSpace: "nowrap" }}>
              <i className="fa-solid fa-lightbulb" style={{ color: brillo > 0.001 ? FOCO_GLOW : T.text3, fontSize: 15, textShadow: brillo > 0.001 ? `0 0 14px ${FOCO_GLOW}` : "none" }} />
              <span style={{ fontSize: 14, fontWeight: 800, color: brillo > 0.001 ? FOCO_GLOW : T.text3 }}>
                {brillo > 0.001 ? `Foco encendido · ${fmt(brillo * 100)}%` : "Foco apagado"}
              </span>
            </div>
          </div>

          {/* Interruptor */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>Interruptor</Eyebrow>
            <button
              className="ex-bigbtn"
              onClick={toggleSwitch}
              style={{ background: switchClosed ? accent : T.inset, color: switchClosed ? "#04121f" : T.text2, border: switchClosed ? "none" : `1px solid ${T.lineStrong}` }}
            >
              <i className={`fa-solid ${switchClosed ? "fa-toggle-on" : "fa-toggle-off"}`} style={{ fontSize: 18 }} />
              {switchClosed ? "Circuito cerrado — abrir" : "Circuito abierto — cerrar"}
            </button>
            <p style={{ margin: "12px 0 0", fontSize: 12.5, color: T.text2, lineHeight: 1.45 }}>
              El circuito debe estar <strong style={{ color: T.text }}>cerrado</strong> para que los electrones tengan un camino completo por donde fluir.
            </p>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          {/* Voltaje */}
          <Eyebrow>
            <i className="fa-solid fa-car-battery" style={{ marginRight: 8, color: accent }} />
            Voltaje de la pila
          </Eyebrow>
          <div style={{ display: "flex", gap: 8 }}>
            {VOLTAJES.map((v) => {
              const on = v === voltaje;
              return (
                <button
                  key={v}
                  className="ex-volt"
                  onClick={() => elegirVoltaje(v)}
                  style={{ borderColor: on ? accent : T.line, background: on ? `rgba(${color.rgba},0.18)` : T.inset, color: on ? "#fff" : T.text2, boxShadow: on ? `0 0 14px -6px ${accent}` : "none", ...NUM }}
                >
                  {fmt(v, v % 1 === 0 ? 0 : 1)} V
                </button>
              );
            })}
          </div>
          <p style={{ margin: "11px 0 0", fontSize: 12.5, color: T.text2, lineHeight: 1.45 }}>
            Más voltaje = los electrones se empujan con más energía → el foco brilla más.
          </p>

          <div className="ex-divider" />

          {/* Material */}
          <Eyebrow>
            <i className="fa-solid fa-cubes-stacked" style={{ marginRight: 8, color: accent }} />
            Material en el circuito
          </Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MATERIALES.map((m) => {
              const on = m.key === materialKey;
              return (
                <button
                  key={m.key}
                  className="ex-mat"
                  onClick={() => elegirMaterial(m.key)}
                  style={{ borderColor: on ? accent : T.line, background: on ? `rgba(${color.rgba},0.16)` : T.glass, boxShadow: on ? `0 0 16px -6px ${accent}` : "none" }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: 5, background: m.color, border: "1px solid rgba(255,255,255,0.25)", flexShrink: 0, boxShadow: `0 0 8px -2px ${m.color}` }} />
                  <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: on ? "#fff" : T.text }}>{m.nombre}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: m.conductor ? OK : NO }}>{m.conductor ? "Conductor" : "Aislante"}</span>
                  </span>
                  <i className={`fa-solid ${m.conductor ? "fa-bolt" : "fa-ban"}`} style={{ fontSize: 13, color: m.conductor ? OK : NO }} />
                </button>
              );
            })}
          </div>
          <p style={{ margin: "11px 0 0", fontSize: 12, color: T.text3, lineHeight: 1.45, fontStyle: "italic" }}>{material.nota}</p>

          <div className="ex-divider" />

          {/* Lecturas */}
          <Eyebrow>Mediciones del circuito</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Voltaje" value={fmt(voltaje, voltaje % 1 === 0 ? 0 : 1)} unit="V" col={accent} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Corriente" value={fmt(corrienteA, 2)} unit="A" col={conduce ? OK : T.text3} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Potencia" value={fmt(potenciaW, 1)} unit="W" col={conduce ? OK : T.text3} />
          </div>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 10 }}>
            <Readout label="Circuito" value={switchClosed ? "Cerrado" : "Abierto"} col={switchClosed ? OK : "#8AB4FF"} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="¿Conduce?" value={conduce ? "Sí" : "No"} col={conduce ? OK : NO} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Foco" value={brillo > 0.001 ? "Encendido" : "Apagado"} col={brillo > 0.001 ? FOCO_GLOW : T.text3} />
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
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? OK : T.text2 }}>
                <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
                <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: "18px 20px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 13 }}>
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            La <strong style={{ color: T.text }}>corriente eléctrica</strong> es el flujo de electrones por un conductor. La pila les da{" "}
            <strong style={{ color: T.text }}>energía</strong>, que al pasar por el foco se transforma en{" "}
            <strong style={{ color: T.text }}>luz y calor</strong> (P = V · I).
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
          <FichaTeorica data={ENERGIA_ELECTRICIDAD_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
