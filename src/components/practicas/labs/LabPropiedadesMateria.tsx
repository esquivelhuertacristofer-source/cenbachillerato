"use client";

/**
 * Laboratorio 3D — Propiedades y cambios de la materia.
 * Práctica experimental para CNEYT-I-P02-A2.
 *
 * El estudiante elige una transformación, la APLICA (animación 3D) y luego la
 * CLASIFICA como cambio físico o químico observando la evidencia. Aprende que en
 * un cambio físico la sustancia sigue siendo la misma (cambia forma/estado, suele
 * ser reversible) y en un cambio químico se forman sustancias nuevas (gas, color,
 * calor, ceniza… y no se revierte).
 */

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { TRANSFORMACIONES, clasificaBien, type TipoCambio } from "./propiedades-data";

const PropiedadesMateriaScene = dynamic(() => import("./PropiedadesMateriaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask-vial fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const NO = "#FF5E5E";
const FISICO = "#5BA8FF";
const QUIMICO = "#F2A33C";

const fmt = (n: number, dec = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const STEP = 0.02; // avance por tick de reproducción
const TICK_MS = 32;

export function LabPropiedadesMateria({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [transKey, setTransKey] = useState("fundir-hielo");
  const [progreso, setProgreso] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [eleccion, setEleccion] = useState<TipoCambio | null>(null);
  // seguimiento de objetivos
  const [clasificoAlguna, setClasificoAlguna] = useState(false);
  const [aciertoFisico, setAciertoFisico] = useState(false);
  const [aciertoQuimico, setAciertoQuimico] = useState(false);
  const [acertadas, setAcertadas] = useState<Set<string>>(() => new Set<string>());

  const trans = useMemo(() => TRANSFORMACIONES.find((t) => t.key === transKey)!, [transKey]);

  // Reproducción: la animación avanza 0 → 1 y se detiene al completarse
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgreso((p) => {
        const np = Math.min(1, p + STEP);
        if (np >= 1) setPlaying(false);
        return np;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playing]);

  const elegirTrans = (k: string) => {
    setTransKey(k);
    setProgreso(0);
    setPlaying(false);
    setEleccion(null);
  };
  const aplicar = () => {
    if (progreso >= 1) setProgreso(0);
    setEleccion(null);
    setPlaying(true);
  };
  const clasificar = (tipo: TipoCambio) => {
    setEleccion(tipo);
    setClasificoAlguna(true);
    if (clasificaBien(trans, tipo)) {
      setAcertadas((prev) => {
        if (prev.has(transKey)) return prev;
        const next = new Set(prev);
        next.add(transKey);
        return next;
      });
      if (trans.tipo === "fisico") setAciertoFisico(true);
      else setAciertoQuimico(true);
    }
  };
  const reset = () => {
    setProgreso(0);
    setPlaying(false);
    setEleccion(null);
    setResetNonce((n) => n + 1);
  };

  const completa = progreso >= 1;
  const acerto = eleccion !== null && clasificaBien(trans, eleccion);
  const respondio = eleccion !== null;

  // Cinta del visor
  const estado = playing
    ? "Aplicando transformación…"
    : !completa
      ? "Listo para aplicar"
      : !respondio
        ? "Observa la evidencia y clasifica"
        : acerto
          ? "¡Clasificación correcta!"
          : "Clasificación incorrecta";
  const estadoColor = playing ? "#FBBF24" : !completa ? "#8AB4FF" : !respondio ? "#8AB4FF" : acerto ? OK : NO;

  const objetivos = [
    { txt: "Aplica y clasifica una transformación", done: clasificoAlguna },
    { txt: "Identifica un cambio físico", done: aciertoFisico },
    { txt: "Identifica un cambio químico", done: aciertoQuimico },
    { txt: "Clasifica correctamente las 6", done: acertadas.size >= 6 },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${trans.icono}`} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{trans.nombre}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: observa la evidencia para decidir si la sustancia sigue siendo la misma (cambio físico) o si se formó una nueva (cambio químico).
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
        .ex-tx { position:relative; cursor:pointer; border-radius:12px; border:1px solid ${T.line}; background:${T.glass};
          display:flex; align-items:center; gap:11px; padding:11px 13px; transition:all .14s ease; text-align:left; width:100%; }
        .ex-tx:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; }
        .ex-play { cursor:pointer; width:100%; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:13px 20px;
          border-radius:12px; border:none; background:${accent}; color:#04121f; font-size:14.5px; font-weight:800; transition:all .15s; }
        .ex-play:hover { filter:brightness(1.08); }
        .ex-play:disabled { opacity:0.55; cursor:default; }
        .ex-cls { cursor:pointer; flex:1; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:13px 12px;
          border-radius:12px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .ex-cls:disabled { opacity:0.45; cursor:default; }
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
              <PropiedadesMateriaScene
                transKey={trans.key}
                modo={trans.modo}
                colorInicial={trans.colorInicial}
                colorFinal={trans.colorFinal}
                emite={trans.emite}
                flama={trans.flama}
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

            {/* Etiqueta de la sustancia */}
            <div style={{ position: "absolute", bottom: 16, left: 18, fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", pointerEvents: "none" }}>
              <i className={`fa-solid ${trans.icono}`} style={{ marginRight: 7, color: accent }} />
              {trans.sustancia}
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

          {/* Aplicar + clasificar + resultado */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <Eyebrow>Transformación</Eyebrow>
                <div style={{ fontSize: 17, fontWeight: 900, color: T.text }}>
                  <i className={`fa-solid ${trans.icono}`} style={{ marginRight: 9, color: accent }} />
                  {trans.nombre}
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, marginTop: 4 }}>
                  {trans.flama ? "Se aplica calor" : "Sin calor"} · sustancia: <strong style={{ color: T.text }}>{trans.sustancia}</strong>
                </div>
              </div>
              <div style={{ width: 180 }}>
                <button className="ex-play" onClick={aplicar} disabled={playing}>
                  <i className={`fa-solid ${playing ? "fa-spinner fa-spin" : completa ? "fa-rotate-right" : "fa-play"}`} />
                  {playing ? "Aplicando…" : completa ? "Repetir" : "Aplicar"}
                </button>
              </div>
            </div>

            {/* Botones de clasificación: se habilitan al terminar la animación */}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                className="ex-cls"
                onClick={() => clasificar("fisico")}
                disabled={!completa}
                style={
                  respondio && eleccion === "fisico"
                    ? { borderColor: acerto ? OK : NO, background: `${acerto ? OK : NO}1f`, color: "#fff" }
                    : { borderColor: completa ? FISICO : T.line }
                }
              >
                <i className="fa-solid fa-snowflake" style={{ color: FISICO }} />
                Cambio físico
              </button>
              <button
                className="ex-cls"
                onClick={() => clasificar("quimico")}
                disabled={!completa}
                style={
                  respondio && eleccion === "quimico"
                    ? { borderColor: acerto ? OK : NO, background: `${acerto ? OK : NO}1f`, color: "#fff" }
                    : { borderColor: completa ? QUIMICO : T.line }
                }
              >
                <i className="fa-solid fa-fire-flame-curved" style={{ color: QUIMICO }} />
                Cambio químico
              </button>
            </div>

            {respondio && (
              <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${acerto ? OK : NO}55`, background: `${acerto ? OK : NO}14`, padding: "13px 16px", display: "flex", gap: 12 }}>
                <i className={`fa-solid ${acerto ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: acerto ? OK : NO, fontSize: 18, marginTop: 1 }} />
                <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>
                  <strong style={{ color: T.text }}>
                    {acerto ? "¡Correcto! " : "No exactamente. "}
                    Es un cambio {trans.tipo === "fisico" ? "físico" : "químico"}.
                  </strong>{" "}
                  {trans.explica}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          {/* Evidencia de la transformación actual */}
          <Eyebrow>Evidencia observada</Eyebrow>
          <div style={{ borderRadius: 14, border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.1)`, padding: "14px 16px" }}>
            <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.5, fontWeight: 600 }}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 8, color: accent }} />
              {completa ? trans.evidencia : "Aplica la transformación para observar qué ocurre."}
            </div>
            {completa && (
              <div style={{ fontSize: 12.5, color: trans.reversible ? OK : T.text2, marginTop: 9, fontWeight: 700 }}>
                <i className={`fa-solid ${trans.reversible ? "fa-rotate-left" : "fa-ban"}`} style={{ marginRight: 7 }} />
                {trans.reversible ? "Es reversible" : "No se revierte fácilmente"}
              </div>
            )}
          </div>

          <div className="ex-divider" />

          {/* Lista de transformaciones */}
          <Eyebrow>Elige una transformación</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TRANSFORMACIONES.map((t) => {
              const on = t.key === transKey;
              const done = acertadas.has(t.key);
              return (
                <button
                  key={t.key}
                  className="ex-tx"
                  onClick={() => elegirTrans(t.key)}
                  style={{ borderColor: on ? accent : T.line, background: on ? `rgba(${color.rgba},0.16)` : T.glass, boxShadow: on ? `0 0 16px -6px ${accent}` : "none" }}
                >
                  <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: on ? "#fff" : T.text2, background: on ? `rgba(${color.rgba},0.3)` : T.inset }}>
                    <i className={`fa-solid ${t.icono}`} />
                  </span>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 800, color: on ? "#fff" : T.text }}>{t.nombre}</span>
                  {done && <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 13 }} />}
                </button>
              );
            })}
          </div>

          <div className="ex-divider" />

          {/* Lecturas */}
          <Eyebrow>Marcador</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Avance" value={`${fmt(progreso * 100)}%`} col={accent} size={16} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Tu respuesta" value={respondio ? (acerto ? "Correcta" : "Incorrecta") : "—"} col={respondio ? (acerto ? OK : NO) : T.text3} size={16} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Acertadas" value={`${acertadas.size}/6`} col={acertadas.size >= 6 ? OK : T.text} size={16} />
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
            La clave es preguntarte: <strong style={{ color: T.text }}>¿se formó una sustancia nueva?</strong> Si solo cambió la forma o el estado (y suele poder revertirse), es{" "}
            <strong style={{ color: FISICO }}>físico</strong>. Si hay gas, cambio de color permanente, calor o ceniza, es <strong style={{ color: QUIMICO }}>químico</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}
