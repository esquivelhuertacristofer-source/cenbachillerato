"use client";

/**
 * Laboratorio 3D — Separación de mezclas.
 * Práctica experimental para CNEYT-I-P04-A1.
 *
 * El estudiante elige una MEZCLA y un MÉTODO de separación, y ejecuta el proceso.
 * Si el método aprovecha la propiedad física que diferencia a los componentes
 * (tamaño, densidad, punto de ebullición, magnetismo) la mezcla se separa en dos
 * vasos; si no, se queda revuelta. Así descubre que el método correcto depende de
 * las propiedades de la materia.
 */

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import type { CompVisual } from "./SeparacionMezclasScene";
import { MEZCLAS, METODOS, COMPONENTES, separa, type MetodoKey } from "./separacion-data";

const SeparacionMezclasScene = dynamic(() => import("./SeparacionMezclasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-filter fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const NO = "#FF5E5E";

const fmt = (n: number, dec = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const STEP = 0.02; // avance por tick de reproducción
const TICK_MS = 32;

export function LabSeparacionMezclas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [mezclaKey, setMezclaKey] = useState("arena-agua");
  const [metodoKey, setMetodoKey] = useState<MetodoKey>("filtracion");
  const [progreso, setProgreso] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  // seguimiento de objetivos
  const [interactuo, setInteractuo] = useState(false);
  const [exitos, setExitos] = useState<Set<string>>(() => new Set<string>());
  const [falloAlguna, setFalloAlguna] = useState(false);

  const mezcla = useMemo(() => MEZCLAS.find((m) => m.key === mezclaKey)!, [mezclaKey]);
  const metodo = METODOS.find((m) => m.key === metodoKey)!;
  const funciona = separa(mezcla, metodoKey);

  const comps = useMemo<[CompVisual, CompVisual]>(
    () => [
      { key: mezcla.comps[0].c, nombre: COMPONENTES[mezcla.comps[0].c].nombre, color: COMPONENTES[mezcla.comps[0].c].color },
      { key: mezcla.comps[1].c, nombre: COMPONENTES[mezcla.comps[1].c].nombre, color: COMPONENTES[mezcla.comps[1].c].color },
    ],
    [mezcla],
  );

  // Reproducción: al llegar al 100% se detiene y registra el resultado
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgreso((p) => {
        const np = Math.min(1, p + STEP);
        if (np >= 1) {
          setPlaying(false);
          if (funciona) {
            setExitos((prev) => {
              if (prev.has(mezclaKey)) return prev;
              const next = new Set(prev);
              next.add(mezclaKey);
              return next;
            });
          } else {
            setFalloAlguna(true);
          }
        }
        return np;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playing, funciona, mezclaKey]);

  const elegirMezcla = (k: string) => {
    setMezclaKey(k);
    setProgreso(0);
    setPlaying(false);
  };
  const elegirMetodo = (k: MetodoKey) => {
    setMetodoKey(k);
    setProgreso(0);
    setPlaying(false);
  };
  const separar = () => {
    setInteractuo(true);
    if (progreso >= 1) {
      setProgreso(0);
    }
    setPlaying(true);
  };
  const reset = () => {
    setProgreso(0);
    setPlaying(false);
    setResetNonce((n) => n + 1);
  };

  const completa = progreso >= 1;
  const exito = completa && funciona;

  // Cinta del visor
  const estado = !completa ? (playing ? "Separando…" : "Listo para separar") : exito ? "¡Separación lograda!" : "No se separó";
  const estadoColor = !completa ? (playing ? "#FBBF24" : "#8AB4FF") : exito ? OK : NO;

  const objetivos = [
    { txt: "Ejecuta una separación", done: interactuo },
    { txt: "Separa una mezcla correctamente", done: exitos.size >= 1 },
    { txt: "Comprueba que un método equivocado no separa", done: falloAlguna },
    { txt: "Separa correctamente las 4 mezclas", done: exitos.size >= 4 },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-filter" />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{mezcla.nombre}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: cada mezcla se separa con el método que aprovecha la propiedad en que difieren sus componentes.
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
        .ex-mx { position:relative; cursor:pointer; border-radius:12px; border:1px solid ${T.line}; background:${T.glass};
          display:flex; align-items:center; gap:10px; padding:11px 13px; transition:all .14s ease; text-align:left; width:100%; }
        .ex-mx:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; }
        .ex-met { cursor:pointer; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          display:flex; flex-direction:column; align-items:center; gap:6px; padding:13px 8px; transition:all .14s ease; text-align:center; }
        .ex-met:hover { border-color:${T.lineStrong}; color:#fff; }
        .ex-play { cursor:pointer; width:100%; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:13px 20px;
          border-radius:12px; border:none; background:${accent}; color:#04121f; font-size:14.5px; font-weight:800; transition:all .15s; }
        .ex-play:hover { filter:brightness(1.08); }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }
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
              <SeparacionMezclasScene
                mezclaKey={mezcla.key}
                comps={comps}
                funciona={funciona}
                metodoKey={metodoKey}
                progreso={progreso}
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

            {/* Etiquetas de los vasos */}
            <div style={{ position: "absolute", bottom: 16, left: 18, maxWidth: 150, fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: completa && funciona ? OK : "rgba(255,255,255,0.32)", textTransform: "uppercase", pointerEvents: "none", lineHeight: 1.3 }}>
              ← {comps[0].nombre}
            </div>
            <div style={{ position: "absolute", bottom: 16, right: 18, maxWidth: 150, textAlign: "right", fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: completa && funciona ? OK : "rgba(255,255,255,0.32)", textTransform: "uppercase", pointerEvents: "none", lineHeight: 1.3 }}>
              {comps[1].nombre} →
            </div>
            <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: "rgba(255,255,255,0.32)", textTransform: "uppercase", pointerEvents: "none" }}>
              Mezcla
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>
          </div>

          {/* Ejecutar separación + resultado */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <Eyebrow>Método aplicado</Eyebrow>
                <div style={{ fontSize: 17, fontWeight: 900, color: T.text }}>
                  <i className={`fa-solid ${metodo.icono}`} style={{ marginRight: 9, color: accent }} />
                  {metodo.nombre}
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, marginTop: 4 }}>
                  Aprovecha: <strong style={{ color: T.text }}>{metodo.propiedad}</strong>
                </div>
              </div>
              <div style={{ width: 180 }}>
                <button className="ex-play" onClick={separar} disabled={playing}>
                  <i className={`fa-solid ${playing ? "fa-spinner fa-spin" : completa ? "fa-rotate-right" : "fa-play"}`} />
                  {playing ? "Separando…" : completa ? "Repetir" : "Separar"}
                </button>
              </div>
            </div>

            {completa && (
              <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${exito ? OK : NO}55`, background: `${exito ? OK : NO}14`, padding: "13px 16px", display: "flex", gap: 12 }}>
                <i className={`fa-solid ${exito ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: exito ? OK : NO, fontSize: 18, marginTop: 1 }} />
                <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>
                  {exito ? (
                    <>
                      <strong style={{ color: T.text }}>¡Separación lograda!</strong> {mezcla.explica}
                    </>
                  ) : (
                    <>
                      <strong style={{ color: T.text }}>Este método no separa esta mezcla.</strong> Para «{mezcla.nombre}» necesitas un método que aproveche su propiedad:{" "}
                      <strong style={{ color: T.text }}>{mezcla.propiedad}</strong>.
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          {/* Mezcla actual */}
          <Eyebrow>Mezcla a separar</Eyebrow>
          <div style={{ borderRadius: 14, border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.1)`, padding: "16px 18px" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text, lineHeight: 1.15 }}>{mezcla.nombre}</div>
            <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
              {comps.map((c) => (
                <span key={c.key} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: T.text2 }}>
                  <span style={{ width: 13, height: 13, borderRadius: "50%", background: c.color, border: "1px solid rgba(255,255,255,0.25)", boxShadow: `0 0 8px -2px ${c.color}` }} />
                  {c.nombre}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 12.5, color: accent, marginTop: 11, fontWeight: 700 }}>
              <i className="fa-solid fa-flask-vial" style={{ marginRight: 7 }} />
              Difieren en: {mezcla.propiedad}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {MEZCLAS.map((m) => {
              const on = m.key === mezclaKey;
              const done = exitos.has(m.key);
              return (
                <button
                  key={m.key}
                  className="ex-mx"
                  onClick={() => elegirMezcla(m.key)}
                  style={{ borderColor: on ? accent : T.line, background: on ? `rgba(${color.rgba},0.16)` : T.glass, boxShadow: on ? `0 0 16px -6px ${accent}` : "none" }}
                >
                  <span style={{ display: "flex", gap: 4 }}>
                    <span style={{ width: 13, height: 13, borderRadius: "50%", background: COMPONENTES[m.comps[0].c].color, border: "1px solid rgba(255,255,255,0.25)" }} />
                    <span style={{ width: 13, height: 13, borderRadius: "50%", background: COMPONENTES[m.comps[1].c].color, border: "1px solid rgba(255,255,255,0.25)" }} />
                  </span>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 800, color: on ? "#fff" : T.text }}>{m.nombre}</span>
                  {done && <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 13 }} />}
                </button>
              );
            })}
          </div>

          <div className="ex-divider" />

          {/* Método */}
          <Eyebrow>Elige el método de separación</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {METODOS.map((m) => {
              const on = m.key === metodoKey;
              return (
                <button
                  key={m.key}
                  className="ex-met"
                  onClick={() => elegirMetodo(m.key)}
                  style={{ borderColor: on ? accent : T.line, background: on ? `rgba(${color.rgba},0.18)` : T.inset, color: on ? "#fff" : T.text2, boxShadow: on ? `0 0 14px -6px ${accent}` : "none" }}
                >
                  <i className={`fa-solid ${m.icono}`} style={{ fontSize: 18, color: on ? accent : T.text3 }} />
                  <span style={{ fontSize: 12.5, fontWeight: 800 }}>{m.nombre}</span>
                </button>
              );
            })}
          </div>
          <p style={{ margin: "11px 0 0", fontSize: 12, color: T.text3, lineHeight: 1.45, fontStyle: "italic" }}>{metodo.desc}</p>

          <div className="ex-divider" />

          {/* Lecturas */}
          <Eyebrow>Resultado</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Avance" value={`${fmt(progreso * 100)}%`} col={accent} size={16} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="¿Separa?" value={funciona ? "Sí" : "No"} col={funciona ? OK : NO} size={16} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Logradas" value={`${exitos.size}/4`} col={exitos.size >= 4 ? OK : T.text} size={16} />
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
            Una mezcla se separa por <strong style={{ color: T.text }}>métodos físicos</strong> (no cambia la naturaleza de las sustancias). El método correcto aprovecha la{" "}
            <strong style={{ color: T.text }}>propiedad en que difieren</strong> sus componentes: tamaño, densidad, punto de ebullición o magnetismo.
          </span>
        </div>
      </div>
    </div>
  );
}
