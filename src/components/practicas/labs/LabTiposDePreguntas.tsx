"use client";

/**
 * Laboratorio — Tipos de preguntas: científicas, cotidianas y filosóficas.
 * Práctica interactiva para PFH-I-P02 (Pensamiento Filosófico y Humanidades I).
 *
 * Interactividad máxima. Cuatro modos: los tres de arrastrar/clasificar y, al
 * final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «3 tipos» — clasifica doce preguntas en tres cestas según su tipo:
 *     COTIDIANA / CIENTÍFICA / FILOSÓFICA.
 *  2. «Ramas filosóficas» — clasifica preguntas filosóficas en sus cinco ramas:
 *     ONTOLOGÍA / EPISTEMOLOGÍA / ÉTICA / ESTÉTICA / POLÍTICA.
 *  3. «De cotidiana a filosófica» — empareja cada pregunta cotidiana con su
 *     versión filosófica profundizada.
 *  + Cuestionario de comprensión (verbatim de A1/A2).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de PFH-I·P02.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { TIPOS_DE_PREGUNTAS_HUECOS } from "./tipos-de-preguntas-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { TIPOS_DE_PREGUNTAS_FICHA } from "./tipos-de-preguntas-ficha";
import {
  PREGUNTAS,
  TIPO_INFO,
  PREGUNTAS_RAMA,
  RAMA_INFO,
  PARES,
  QUIZ,
  DATO_PREGUNTAS,
  type TipoPregunta,
  type RamaFilosofica,
} from "./tipos-de-preguntas-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-tipos-de-preguntas-reto";

type Modo = "tipos" | "ramas" | "profundizar" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "tipos", label: "3 tipos de preguntas", icono: "fa-layer-group" },
  { id: "ramas", label: "Ramas filosóficas", icono: "fa-code-branch" },
  { id: "profundizar", label: "De cotidiana a filosófica", icono: "fa-arrow-up-right-dots" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabTiposDePreguntas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("tipos");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const [drawer, setDrawer] = useState(false);
  // Modo «Completa el texto». El contador sirve de `key`: subirlo remonta
  // el componente y devuelve todos los huecos en blanco.
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(() => () => audioRef.current?.dispose(), []);
  const toggleSonido = async () => {
    if (!sonido) {
      if (!audioRef.current) audioRef.current = new LabSfx();
      await audioRef.current.enable();
      setSonido(true);
    } else {
      audioRef.current?.mute();
      setSonido(false);
    }
  };
  // Los tres ayudantes son el único punto por el que pasan todos los aciertos
  // y todos los fallos del laboratorio, así que la partida se lleva aquí.
  // `sfxOk` no cuenta: marca el fin de un modo, no una respuesta suelta.
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  // ── modo tipos (clasifica por tipo de pregunta) ────────────────────────
  const [ubicTipo, setUbicTipo] = useState<Record<string, TipoPregunta>>({});
  const [selTipo, setSelTipo] = useState<string | null>(null);
  const [shakeTipo, setShakeTipo] = useState<TipoPregunta | null>(null);
  const tiposLibres = PREGUNTAS.filter((p) => !ubicTipo[p.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarTipo = (preguntaId: string, bin: TipoPregunta) => {
    if (ubicTipo[preguntaId]) return;
    const p = PREGUNTAS.find((x) => x.id === preguntaId);
    if (p && p.tipo === bin) {
      setUbicTipo((e) => ({ ...e, [preguntaId]: bin }));
      setSelTipo(null);
      sfxPlace();
      if (Object.keys(ubicTipo).length + 1 >= PREGUNTAS.length) {
        sfxOk();
        persistMejor(true, ramasDone, profundizarDone);
      }
    } else {
      setShakeTipo(bin);
      sfxNo();
      window.setTimeout(() => setShakeTipo(null), 420);
    }
  };
  const resetTipos = () => {
    setUbicTipo({});
    setSelTipo(null);
  };

  // ── modo ramas (clasifica pregunta filosófica por su rama) ─────────────
  const [ubicRama, setUbicRama] = useState<Record<string, RamaFilosofica>>({});
  const [selRama, setSelRama] = useState<string | null>(null);
  const [shakeRama, setShakeRama] = useState<RamaFilosofica | null>(null);
  const ramasLibres = PREGUNTAS_RAMA.filter((p) => !ubicRama[p.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarRama = (preguntaId: string, bin: RamaFilosofica) => {
    if (ubicRama[preguntaId]) return;
    const p = PREGUNTAS_RAMA.find((x) => x.id === preguntaId);
    if (p && p.rama === bin) {
      setUbicRama((e) => ({ ...e, [preguntaId]: bin }));
      setSelRama(null);
      sfxPlace();
      if (Object.keys(ubicRama).length + 1 >= PREGUNTAS_RAMA.length) {
        sfxOk();
        persistMejor(tiposDone, true, profundizarDone);
      }
    } else {
      setShakeRama(bin);
      sfxNo();
      window.setTimeout(() => setShakeRama(null), 420);
    }
  };
  const resetRamas = () => {
    setUbicRama({});
    setSelRama(null);
  };

  // ── modo profundizar (empareja cotidiana → filosófica) ─────────────────
  const [empPar, setEmpPar] = useState<Record<string, boolean>>({});
  const [selPar, setSelPar] = useState<string | null>(null);
  const [shakePar, setShakePar] = useState<string | null>(null);
  const paresLibres = PARES.filter((g) => !empPar[g.id]).slice().sort((a, b) => a.cotidiana.localeCompare(b.cotidiana, "es"));

  const intentarPar = (chipId: string, rowId: string) => {
    if (empPar[rowId]) return;
    if (chipId === rowId) {
      setEmpPar((e) => ({ ...e, [rowId]: true }));
      setSelPar(null);
      sfxPlace();
      if (Object.keys(empPar).length + 1 >= PARES.length) {
        sfxOk();
        persistMejor(tiposDone, ramasDone, true);
      }
    } else {
      setShakePar(rowId);
      sfxNo();
      window.setTimeout(() => setShakePar(null), 420);
    }
  };
  const resetProfundizar = () => {
    setEmpPar({});
    setSelPar(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const tiposDone = Object.keys(ubicTipo).length >= PREGUNTAS.length;
  const ramasDone = Object.keys(ubicRama).length >= PREGUNTAS_RAMA.length;
  const profundizarDone = Object.keys(empPar).length >= PARES.length;
  const modosHechos = (tiposDone ? 1 : 0) + (ramasDone ? 1 : 0) + (profundizarDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Clasifica las 12 preguntas por su tipo", done: tiposDone },
    { txt: "Clasifica las preguntas en sus 5 ramas", done: ramasDone },
    { txt: "Empareja cada pregunta cotidiana con su versión filosófica", done: profundizarDone },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  // arrastre nativo
  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    },
  });
  const dropProps = (onDrop: (id: string) => void) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      if (id) onDrop(id);
    },
    role: "button" as const,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        (e.currentTarget as HTMLElement).click();
      }
    },
  });

  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };
  const resetActual = modo === "texto" ? resetTexto : modo === "tipos" ? resetTipos : modo === "ramas" ? resetRamas : resetProfundizar;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes tdpShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes tdpPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .tdp-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .tdp-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .tdp-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .tdp-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .tdp-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .tdp-icobtn:hover { background:rgba(255,255,255,0.12); }
        .tdp-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13.5px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .tdp-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .tdp-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .tdp-chip:active { cursor:grabbing; }
        .tdp-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .tdp-row[data-shake="true"] { animation:tdpShake .4s; border-color:${NO}; }
        .tdp-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .tdp-slot { flex-shrink:0; min-width:200px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .tdp-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .tdp-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:200px; }
        .tdp-bin[data-shake="true"] { animation:tdpShake .4s; border-color:${NO}; }
        .tdp-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .tdp-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .tdp-q:disabled{ cursor:default; }
        .tdp-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .tdp-btn:hover { border-color:${T.lineStrong}; }
        .tdp-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .tdp-row[data-shake="true"], .tdp-bin[data-shake="true"] { animation:none; } }

        /* Cajón de teoría */
        .tdp-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .tdp-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .tdp-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .tdp-drawer[data-open="true"] { transform:translateX(0); }
        .tdp-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .tdp-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .tdp-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .tdp-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .tdp-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .tdp-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .tdp-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero */
        .tdp-bin, .tdp-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .tdp-bin:nth-of-type(6n+1), .tdp-row:nth-of-type(6n+1) { --tono:188; }
        .tdp-bin:nth-of-type(6n+2), .tdp-row:nth-of-type(6n+2) { --tono:262; }
        .tdp-bin:nth-of-type(6n+3), .tdp-row:nth-of-type(6n+3) { --tono:44; }
        .tdp-bin:nth-of-type(6n+4), .tdp-row:nth-of-type(6n+4) { --tono:152; }
        .tdp-bin:nth-of-type(6n+5), .tdp-row:nth-of-type(6n+5) { --tono:330; }
        .tdp-bin:nth-of-type(6n+6), .tdp-row:nth-of-type(6n+6) { --tono:18; }
        .tdp-bin::before, .tdp-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .tdp-bin[data-done="true"], .tdp-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .tdp-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .tdp-chip:hover { transform:translateY(-2px); }
        .tdp-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .tdp-chip, .tdp-chip:hover, .tdp-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="tdp-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="tdp-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="tdp-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="tdp-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <button className="tdp-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="tdp-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="tdp-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="tdp-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="tdp-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="tdp-drawer-body">
          <FichaTeorica data={TIPOS_DE_PREGUNTAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — tipos */}
          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={TIPOS_DE_PREGUNTAS_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                sfxOk();
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}

          {modo === "tipos" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada pregunta a su tipo</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: tiposDone ? OK : T.text3 }}>
                    {Object.keys(ubicTipo).length}/{PREGUNTAS.length}
                  </span>
                </div>
                {tiposLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {PREGUNTAS.length} preguntas!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {tiposLibres.map((p) => (
                      <button key={p.id} className="tdp-chip" data-sel={selTipo === p.id} onClick={() => setSelTipo((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                        {p.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsTipos selTipo={selTipo} shakeTipo={shakeTipo} ubicTipo={ubicTipo} onMatch={intentarTipo} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — ramas */}
          {modo === "ramas" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada pregunta filosófica a su rama</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: ramasDone ? OK : T.text3 }}>
                    {Object.keys(ubicRama).length}/{PREGUNTAS_RAMA.length}
                  </span>
                </div>
                {ramasLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {PREGUNTAS_RAMA.length} preguntas!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {ramasLibres.map((p) => (
                      <button key={p.id} className="tdp-chip" data-sel={selRama === p.id} onClick={() => setSelRama((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                        <i className="fa-solid fa-brain" style={{ fontSize: 11, color: T.text3 }} />
                        {p.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsRamas selRama={selRama} shakeRama={shakeRama} ubicRama={ubicRama} onMatch={intentarRama} dropProps={dropProps} />
            </>
          )}

          {/* MODO 3 — profundizar */}
          {modo === "profundizar" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada pregunta cotidiana a su versión filosófica</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: profundizarDone ? OK : T.text3 }}>
                    {Object.keys(empPar).length}/{PARES.length}
                  </span>
                </div>
                {paresLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {PARES.length} preguntas!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {paresLibres.map((g) => (
                      <button key={g.id} className="tdp-chip" data-sel={selPar === g.id} onClick={() => setSelPar((s) => (s === g.id ? null : g.id))} {...dragProps(g.id)}>
                        <i className="fa-solid fa-mug-hot" style={{ fontSize: 11, color: T.text3 }} />
                        {g.cotidiana}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsProfundizar selPar={selPar} shakePar={shakePar} empPar={empPar} onMatch={intentarPar} dropProps={dropProps} />
            </>
          )}
        </div>

        {/* ── Columna lateral ───────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "20px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
              Objetivos
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {objetivos.map((o, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? OK : T.text2 }}>
                  <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
                  <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
                </div>
              ))}
            </div>

            <div className="tdp-divider" />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: T.text3, textTransform: "uppercase" }}>Puntuación</div>
                <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 18, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right", maxWidth: 180 }}>
                <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45 }}>
                  {bestEstrellas >= 3 ? "¡Distingues los tipos de preguntas como un filósofo!" : "Termina los tres modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "tipos" && (
                <>La pregunta <strong style={{ color: T.text }}>cotidiana</strong> tiene respuesta inmediata; la <strong style={{ color: T.text }}>científica</strong> se responde con evidencia empírica; la <strong style={{ color: T.text }}>filosófica</strong> exige reflexión conceptual.</>
              )}
              {modo === "ramas" && (
                <>Cada rama pregunta por algo distinto: la <strong style={{ color: T.text }}>ontología</strong> por el ser, la <strong style={{ color: T.text }}>epistemología</strong> por el conocer, la <strong style={{ color: T.text }}>ética</strong> por el bien, la <strong style={{ color: T.text }}>estética</strong> por lo bello y la <strong style={{ color: T.text }}>política</strong> por el poder y la justicia.</>
              )}
              {modo === "profundizar" && (
                <>Muchas preguntas cotidianas se vuelven filosóficas cuando profundizamos en ellas: lleva cada pregunta práctica a su versión de fondo.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_PREGUNTAS}</span>
          </div>
        </div>
      </div>

      <QuizCard accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsTipos({
  selTipo,
  shakeTipo,
  ubicTipo,
  onMatch,
  dropProps,
}: {
  selTipo: string | null;
  shakeTipo: TipoPregunta | null;
  ubicTipo: Record<string, TipoPregunta>;
  onMatch: (preguntaId: string, bin: TipoPregunta) => void;
  dropProps: DropFactory;
}) {
  const bins: TipoPregunta[] = ["cotidiana", "cientifica", "filosofica"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = TIPO_INFO[bin];
        const dentro = PREGUNTAS.filter((p) => ubicTipo[p.id] === bin);
        return (
          <div
            key={bin}
            className="tdp-bin"
            data-shake={shakeTipo === bin}
            onClick={() => selTipo && onMatch(selTipo, bin)}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <i className={`fa-solid ${info.icono}`} style={{ color: T.text2 }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((p) => (
                  <span key={p.id} style={{ animation: "tdpPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {p.texto}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BinsRamas({
  selRama,
  shakeRama,
  ubicRama,
  onMatch,
  dropProps,
}: {
  selRama: string | null;
  shakeRama: RamaFilosofica | null;
  ubicRama: Record<string, RamaFilosofica>;
  onMatch: (preguntaId: string, bin: RamaFilosofica) => void;
  dropProps: DropFactory;
}) {
  const bins: RamaFilosofica[] = ["ontologia", "epistemologia", "etica", "estetica", "politica"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = RAMA_INFO[bin];
        const dentro = PREGUNTAS_RAMA.filter((p) => ubicRama[p.id] === bin);
        return (
          <div
            key={bin}
            className="tdp-bin"
            data-shake={shakeRama === bin}
            onClick={() => selRama && onMatch(selRama, bin)}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <i className={`fa-solid ${info.icono}`} style={{ color: T.text2 }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((p) => (
                  <span key={p.id} style={{ animation: "tdpPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {p.texto}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RowsProfundizar({
  selPar,
  shakePar,
  empPar,
  onMatch,
  dropProps,
}: {
  selPar: string | null;
  shakePar: string | null;
  empPar: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PARES.map((g) => {
        const done = empPar[g.id];
        return (
          <div
            key={g.id}
            className="tdp-row"
            data-shake={shakePar === g.id}
            data-done={done}
            onClick={() => !done && selPar && onMatch(selPar, g.id)}
            {...dropProps((id) => onMatch(id, g.id))}
          >
            <div className="tdp-slot" data-armed={!done && !!selPar} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "tdpPop .25s ease", fontSize: 12.5, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-mug-hot" />
                  {g.cotidiana}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> pregunta cotidiana
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: done ? "#fff" : T.text2, lineHeight: 1.4, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-brain" style={{ fontSize: 12, color: T.text3 }} />
                {g.filosofica}
              </div>
              <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{g.pista}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Cuestionario de comprensión (soporta V/F y opción múltiple)
 * ═══════════════════════════════════════════════════════════════════════════ */
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
  const [resp, setResp] = useState<(number | null)[]>(() => QUIZ.map(() => null));
  const [comprobado, setComprobado] = useState(false);

  const aciertos = resp.filter((r, i) => r === QUIZ[i]!.correcta).length;
  const total = QUIZ.length;
  const todas = resp.every((r) => r !== null);
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
    setResp(QUIZ.map(() => null));
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
        Cinco preguntas sobre los tipos de preguntas y las ramas de la filosofía. Elige la respuesta correcta y pulsa «Comprobar».
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
                <span style={{ color: accent }}>{qi + 1}.</span>
                <span>{q.pregunta}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: q.opciones.length === 2 ? "1fr 1fr" : "repeat(auto-fit, minmax(150px, 1fr))", gap: 9 }}>
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
                    <button key={oi} className="tdp-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                      <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}` }}>
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
          <button className="tdp-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="tdp-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 16px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 13.5, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas e inténtalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
