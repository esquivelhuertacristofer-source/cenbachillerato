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

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { TRANSFORMACIONES, clasificaBien, QUIZ_COMPRENSION, type TipoCambio } from "./propiedades-data";
import { LabSfx } from "./lab-audio";
import { FichaTeorica } from "./_ficha";
import { PROPIEDADES_FICHA } from "./propiedades-ficha";

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
const RETO_KEY = "cen-propiedades-reto";

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
  // reto + puntuación
  const [intentadas, setIntentadas] = useState<Set<string>>(() => new Set<string>());
  const [primeros, setPrimeros] = useState<Set<string>>(() => new Set<string>());
  const [estrellas, setEstrellas] = useState(0);
  const [mejor, setMejor] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const r = window.localStorage.getItem(RETO_KEY);
      return r ? Number(r) || 0 : 0;
    } catch {
      return 0;
    }
  });
  // sonido + etiquetas + teoría
  const [sonido, setSonido] = useState(false);
  const [etiquetas, setEtiquetas] = useState(false);
  const [drawer, setDrawer] = useState(false); // cajón de teoría
  const audioRef = useRef<LabSfx | null>(null);
  // cuestionario de comprensión (interactividad ampliada — quiz A2 verbatim)
  const [quizAprobado, setQuizAprobado] = useState(false);

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

  // Sonido del proceso: qué efecto continuo corresponde a la transformación.
  const sfxLoop: "fuego" | "burbujas" | "vapor" | "gotas" | null = trans.emite === "burbujas"
    ? "burbujas"
    : trans.emite === "humo"
      ? "fuego"
      : trans.modo === "gas"
        ? "vapor"
        : trans.modo === "estado" && trans.flama
          ? "gotas"
          : null;

  const detenerSonidos = () => {
    const a = audioRef.current;
    if (!a) return;
    a.fuego(false);
    a.burbujas(false);
    a.vapor(false);
    a.gotas(false);
  };

  // Mientras se reproduce la animación, suena el proceso correspondiente.
  useEffect(() => {
    if (!sonido) return;
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      if (sfxLoop === "fuego") a.fuego(true);
      else if (sfxLoop === "burbujas") a.burbujas(true);
      else if (sfxLoop === "vapor") a.vapor(true);
      else if (sfxLoop === "gotas") a.gotas(true);
      else if (trans.modo === "fragmenta") a.romper();
    } else {
      detenerSonidos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sonido, playing, transKey]);

  useEffect(() => () => audioRef.current?.dispose(), []);

  const toggleSonido = async () => {
    if (!sonido) {
      if (!audioRef.current) audioRef.current = new LabSfx();
      await audioRef.current.enable();
      setSonido(true);
    } else {
      detenerSonidos();
      audioRef.current?.mute();
      setSonido(false);
    }
  };

  const elegirTrans = (k: string) => {
    setTransKey(k);
    setProgreso(0);
    setPlaying(false);
    setEleccion(null);
    if (sonido) detenerSonidos();
  };
  const aplicar = () => {
    if (progreso >= 1) setProgreso(0);
    setEleccion(null);
    setPlaying(true);
  };
  const clasificar = (tipo: TipoCambio) => {
    const bien = clasificaBien(trans, tipo);
    setEleccion(tipo);
    setClasificoAlguna(true);
    if (sonido) {
      if (bien) audioRef.current?.correcto();
      else audioRef.current?.incorrecto();
    }

    const primeraVez = !intentadas.has(transKey);
    if (primeraVez) {
      const ni = new Set(intentadas);
      ni.add(transKey);
      setIntentadas(ni);
    }

    if (!bien) return;

    if (trans.tipo === "fisico") setAciertoFisico(true);
    else setAciertoQuimico(true);

    const nextAcertadas = new Set(acertadas);
    nextAcertadas.add(transKey);
    setAcertadas(nextAcertadas);

    let nextPrimeros = primeros;
    if (primeraVez) {
      nextPrimeros = new Set(primeros);
      nextPrimeros.add(transKey);
      setPrimeros(nextPrimeros);
    }

    // Reto: al clasificar correctamente las 6, se otorgan estrellas.
    if (nextAcertadas.size >= TRANSFORMACIONES.length) {
      const est = nextPrimeros.size >= TRANSFORMACIONES.length ? 3 : nextPrimeros.size >= 4 ? 2 : 1;
      setEstrellas(est);
      setMejor((m) => {
        if (est <= m) return m;
        try {
          window.localStorage.setItem(RETO_KEY, String(est));
        } catch {
          /* localStorage no disponible */
        }
        return est;
      });
    }
  };
  const reset = () => {
    setProgreso(0);
    setPlaying(false);
    setEleccion(null);
    setResetNonce((n) => n + 1);
    if (sonido) detenerSonidos();
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
    { txt: "Consigue 3★ (acierta todo a la primera)", done: Math.max(estrellas, mejor) >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
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
        .pm-drawer { position:absolute; top:0; right:0; height:100%; width:min(540px, 94%); transform:translateX(102%);
          transition:transform .34s cubic-bezier(.22,.61,.36,1); z-index:30; display:flex; flex-direction:column;
          background:linear-gradient(180deg, rgba(6,18,38,0.97), rgba(3,12,26,0.98)); border-left:1px solid rgba(${color.rgba},0.3);
          box-shadow:-20px 0 60px -20px rgba(0,0,0,0.6); }
        .pm-drawer[data-open="true"] { transform:translateX(0); }
        .pm-scrim { position:absolute; inset:0; background:rgba(2,8,18,0.5); backdrop-filter:blur(2px); z-index:20; opacity:0;
          pointer-events:none; transition:opacity .3s; }
        .pm-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .pm-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600;
          text-align:left; width:100%; transition:all .14s; }
        .pm-q:hover:not(:disabled) { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .pm-q:disabled { cursor:default; }
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
                sustancia={trans.sustancia}
                etiquetas={etiquetas && !drawer}
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
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={etiquetas} onClick={() => setEtiquetas((v) => !v)} title="Mostrar etiquetas">
                <i className="fa-solid fa-tags" />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer((v) => !v)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
            </div>

            {/* Botón Teoría destacado (cuando el cajón está cerrado) */}
            {!drawer && (
              <button
                onClick={() => setDrawer(true)}
                style={{ position: "absolute", top: 62, right: 14, display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 12, cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 800, background: "rgba(2,12,28,0.74)", border: `1px solid rgba(${color.rgba},0.4)`, backdropFilter: "blur(10px)", zIndex: 5 }}
              >
                <i className="fa-solid fa-book-open" style={{ color: accent }} />
                Teoría
              </button>
            )}

            {/* ── CAJÓN DE TEORÍA ── */}
            <div className="pm-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
            <div className="pm-drawer" data-open={drawer}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: `1px solid ${T.line}` }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 900, color: "#fff" }}>
                  <i className="fa-solid fa-book-open" style={{ color: accent }} /> Teoría de la práctica
                </span>
                <button className="ex-icobtn" onClick={() => setDrawer(false)} title="Cerrar">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "18px" }}>
                <FichaTeorica data={PROPIEDADES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </div>
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

          {/* Puntuación del reto */}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 13, background: `rgba(${color.rgba},0.1)`, border: `1px solid rgba(${color.rgba},0.28)`, padding: "11px 15px" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: T.text3, textTransform: "uppercase" }}>Puntuación</div>
              <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                {[1, 2, 3].map((s) => (
                  <i
                    key={s}
                    className="fa-solid fa-star"
                    style={{ fontSize: 18, color: s <= estrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }}
                  />
                ))}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: T.text3, textTransform: "uppercase" }}>Mejor</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: mejor > 0 ? "#FFC75A" : T.text3, marginTop: 3 }}>
                {mejor > 0 ? `${mejor}★` : "—"}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: T.text3, marginTop: 8, lineHeight: 1.45 }}>
            {estrellas >= 3
              ? "¡Perfecto! Clasificaste las 6 a la primera."
              : acertadas.size >= 6
                ? "¡Completaste las 6! Acierta todo a la primera para 3★."
                : "Clasifica las 6 transformaciones; acertar a la primera da más estrellas."}
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

      {/* ── Cuestionario de comprensión (interactividad ampliada) ─────────── */}
      <QuizCard
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={
          sonido
            ? (ok) => {
                if (ok) audioRef.current?.correcto();
                else audioRef.current?.incorrecto();
              }
            : undefined
        }
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión — reproduce el quiz A2 (verbatim) como
 * "interactividad ampliada": el alumno responde aquí mismo y recibe
 * retroalimentación por reactivo, igual que la tarjeta de cálculos del
 * laboratorio de destilación.
 * ──────────────────────────────────────────────────────────────────────── */
function QuizCard({
  accent,
  rgba,
  aprobado,
  onAprobado,
  playSfx,
}: {
  accent: string;
  rgba: string;
  aprobado: boolean;
  onAprobado: () => void;
  playSfx?: (ok: boolean) => void;
}) {
  const NO = "#FF5E5E";
  const [resp, setResp] = useState<(number | null)[]>(() => QUIZ_COMPRENSION.map(() => null));
  const [comprobado, setComprobado] = useState(false);

  const aciertos = resp.filter((r, i) => r === QUIZ_COMPRENSION[i]!.correcta).length;
  const total = QUIZ_COMPRENSION.length;
  const todasContestadas = resp.every((r) => r !== null);
  const aprobadoAhora = aciertos === total;

  const elegir = (qi: number, oi: number) => {
    if (comprobado) return;
    setResp((prev) => prev.map((v, i) => (i === qi ? oi : v)));
  };

  const comprobar = () => {
    setComprobado(true);
    const ok = aciertos === total;
    playSfx?.(ok);
    if (ok) onAprobado();
  };

  const reintentar = () => {
    setResp(QUIZ_COMPRENSION.map(() => null));
    setComprobado(false);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 24px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
          Comprueba lo aprendido
        </Eyebrow>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Cinco preguntas sobre las propiedades físicas y químicas de la materia. Responde y pulsa «Comprobar».
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ_COMPRENSION.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
                <span style={{ color: accent }}>{qi + 1}.</span>
                <span>{q.pregunta}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                {q.opciones.map((op, oi) => {
                  const sel = elegida === oi;
                  const esCorrecta = oi === q.correcta;
                  let borde = T.line;
                  let fondo = T.glass;
                  let colorTxt = T.text2;
                  if (comprobado && esCorrecta) {
                    borde = OK;
                    fondo = `${OK}1c`;
                    colorTxt = "#fff";
                  } else if (comprobado && sel && !esCorrecta) {
                    borde = NO;
                    fondo = `${NO}1c`;
                    colorTxt = "#fff";
                  } else if (!comprobado && sel) {
                    borde = accent;
                    fondo = `rgba(${rgba},0.16)`;
                    colorTxt = "#fff";
                  }
                  return (
                    <button
                      key={oi}
                      className="pm-q"
                      onClick={() => elegir(qi, oi)}
                      disabled={comprobado}
                      style={{ borderColor: borde, background: fondo, color: colorTxt }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          flexShrink: 0,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 900,
                          border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}`,
                        }}
                      >
                        {comprobado && esCorrecta ? <i className="fa-solid fa-check" /> : comprobado && sel ? <i className="fa-solid fa-xmark" /> : String.fromCharCode(65 + oi)}
                      </span>
                      <span style={{ flex: 1, lineHeight: 1.35 }}>{op}</span>
                    </button>
                  );
                })}
              </div>
              {comprobado && (
                <div style={{ marginTop: 9, fontSize: 12.5, color: T.text2, lineHeight: 1.5, display: "flex", gap: 9, padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
                  <i className="fa-solid fa-circle-info" style={{ color: accent, marginTop: 2 }} />
                  <span>{q.retro}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
        {!comprobado ? (
          <button className="ex-play" style={{ width: "auto", padding: "12px 24px" }} onClick={comprobar} disabled={!todasContestadas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="ex-cls" style={{ flex: "0 0 auto", padding: "12px 22px" }} onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              borderRadius: 12,
              padding: "10px 16px",
              border: `1px solid ${aprobadoAhora ? OK : NO}55`,
              background: `${aprobadoAhora ? OK : NO}14`,
              fontSize: 13.5,
              fontWeight: 800,
              color: aprobadoAhora ? OK : NO,
            }}
          >
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas e inténtalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
