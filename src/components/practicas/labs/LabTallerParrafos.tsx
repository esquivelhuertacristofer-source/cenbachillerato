"use client";

/**
 * Laboratorio — Taller de párrafos.
 * Práctica experimental para LC-I-P04-A2 (Lengua y Comunicación I · tipos de párrafo).
 *
 * Interactividad máxima: el alumno EXPERIMENTA con la estructura del texto. Tres modos:
 *  1. «Arma el texto»: arrastra los párrafos hasta ordenarlos coherentemente
 *     (introductorio → desarrollo → conclusión). Solo avanza con el orden correcto.
 *  2. «Clasifica los párrafos»: lee cada párrafo y arrástralo a su función
 *     (introductorio / de desarrollo / de conclusión).
 *  3. «Clasifica los conectores»: arrastra cada conector a su relación
 *     (adición / contraste / causa-consecuencia).
 *  + Cuestionario de comprensión.
 *
 * DOM puro (sin three.js): no infla el bundle del Worker y funciona con ratón,
 * teclado y pantalla táctil (clic-para-seleccionar y clic-para-colocar).
 *
 * Contenido VERBATIM de las actividades A1/A2/A6 de LC-I·P04.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { TALLER_PARRAFOS_HUECOS } from "./taller-parrafos-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { TALLER_PARRAFOS_FICHA } from "./taller-parrafos-ficha";
import {
  TEXTOS,
  PARRAFOS,
  FUNCION_INFO,
  CONECTORES,
  RELACION_INFO,
  QUIZ,
  DATO_PARRAFOS,
  type Funcion,
  type Relacion,
} from "./tipos-parrafo-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-parrafos-reto";

type Modo = "armar" | "tipos" | "conectores" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "armar", label: "Arma el texto", icono: "fa-layer-group" },
  { id: "tipos", label: "Clasifica los párrafos", icono: "fa-paragraph" },
  { id: "conectores", label: "Clasifica los conectores", icono: "fa-link" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const porTexto = (a: { texto: string }, b: { texto: string }) => a.texto.localeCompare(b.texto, "es");

export function LabTallerParrafos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("armar");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const [drawer, setDrawer] = useState(false);
  // Modo «Completa el texto». El contador sirve de `key`: subirlo remonta
  // el componente y devuelve todos los huecos en blanco.
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetHuecos = () => {
    setTextoDone(false);
    setTextoIntento((v) => v + 1);
  };
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

  // ── modo Armar (ordenar texto) ────────────────────────────────────────
  const [txtIdx, setTxtIdx] = useState(0);
  const [colocados, setColocados] = useState<Record<string, string[]>>({});
  const [armados, setArmados] = useState<Set<string>>(() => new Set<string>());
  const [selPar, setSelPar] = useState<string | null>(null);
  const [shakePar, setShakePar] = useState(false);

  const texto = TEXTOS[txtIdx]!;
  const ordenActual = colocados[texto.id] ?? [];
  const parrafosLibres = texto.parrafos.filter((p) => !ordenActual.includes(p.id)).sort(porTexto);

  const intentarPar = (parId: string) => {
    if (ordenActual.includes(parId)) return;
    const siguiente = texto.parrafos[ordenActual.length];
    if (siguiente && siguiente.id === parId) {
      const nuevoOrden = [...ordenActual, parId];
      setColocados((c) => ({ ...c, [texto.id]: nuevoOrden }));
      setSelPar(null);
      sfxPlace();
      if (nuevoOrden.length >= texto.parrafos.length) {
        const nuevosArmados = new Set(armados).add(texto.id);
        setArmados(nuevosArmados);
        sfxOk();
        persistMejor(nuevosArmados.size >= TEXTOS.length, tiposDone, conectoresDone);
      }
    } else {
      setShakePar(true);
      sfxNo();
      window.setTimeout(() => setShakePar(false), 420);
    }
  };
  const resetTexto = () => {
    setColocados((c) => ({ ...c, [texto.id]: [] }));
    setSelPar(null);
  };

  // ── modo Tipos (clasificar párrafos por función) ──────────────────────
  const [ubicPar, setUbicPar] = useState<Record<string, Funcion>>({});
  const [selParCls, setSelParCls] = useState<string | null>(null);
  const [shakeFun, setShakeFun] = useState<Funcion | null>(null);
  const parLibres = PARRAFOS.filter((p) => !ubicPar[p.id]);

  const intentarTipo = (parId: string, fun: Funcion) => {
    const p = PARRAFOS.find((x) => x.id === parId);
    if (!p || ubicPar[parId]) return;
    if (p.funcion === fun) {
      setUbicPar((u) => ({ ...u, [parId]: fun }));
      setSelParCls(null);
      sfxPlace();
      if (Object.keys(ubicPar).length + 1 >= PARRAFOS.length) {
        sfxOk();
        persistMejor(armarDone, true, conectoresDone);
      }
    } else {
      setShakeFun(fun);
      sfxNo();
      window.setTimeout(() => setShakeFun(null), 420);
    }
  };
  const resetTipos = () => {
    setUbicPar({});
    setSelParCls(null);
  };

  // ── modo Conectores ───────────────────────────────────────────────────
  const [ubicCon, setUbicCon] = useState<Record<string, Relacion>>({});
  const [selCon, setSelCon] = useState<string | null>(null);
  const [shakeRel, setShakeRel] = useState<Relacion | null>(null);
  const conLibres = CONECTORES.filter((c) => !ubicCon[c.id]);

  const intentarCon = (conId: string, rel: Relacion) => {
    const c = CONECTORES.find((x) => x.id === conId);
    if (!c || ubicCon[conId]) return;
    if (c.relacion === rel) {
      setUbicCon((u) => ({ ...u, [conId]: rel }));
      setSelCon(null);
      sfxPlace();
      if (Object.keys(ubicCon).length + 1 >= CONECTORES.length) {
        sfxOk();
        persistMejor(armarDone, tiposDone, true);
      }
    } else {
      setShakeRel(rel);
      sfxNo();
      window.setTimeout(() => setShakeRel(null), 420);
    }
  };
  const resetCon = () => {
    setUbicCon({});
    setSelCon(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const armarDone = armados.size >= TEXTOS.length;
  const tiposDone = Object.keys(ubicPar).length >= PARRAFOS.length;
  const conectoresDone = Object.keys(ubicCon).length >= CONECTORES.length;
  const modosHechos = (armarDone ? 1 : 0) + (tiposDone ? 1 : 0) + (conectoresDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  // Persiste la mejor marca al completar un modo (en el handler, no en un efecto).
  const persistMejor = (a: boolean, t: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (t ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Arma los textos en orden coherente", done: armarDone },
    { txt: "Clasifica los 6 párrafos por su función", done: tiposDone },
    { txt: "Clasifica los 9 conectores por su relación", done: conectoresDone },
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

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes tpShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes tpPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .tp-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .tp-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .tp-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .tp-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .tp-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .tp-icobtn:hover { background:rgba(255,255,255,0.12); }
        .tp-card { cursor:grab; display:block; padding:12px 15px; border-radius:13px; border:1.5px solid ${T.line};
          background:${T.glassSoft}; color:${T.text}; font-size:13px; line-height:1.5; text-align:left; transition:all .14s; user-select:none; width:100%; }
        .tp-card:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); }
        .tp-card[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); box-shadow:0 0 16px -5px ${accent}; }
        .tp-card:active { cursor:grabbing; }
        .tp-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; padding:11px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:all .14s; user-select:none; }
        .tp-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .tp-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .tp-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:16px; min-height:130px; transition:all .16s; }
        .tp-bin[data-shake="true"] { animation:tpShake .4s; }
        .tp-slot { border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-height:60px;
          display:flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; gap:8px; transition:all .16s; }
        .tp-slot[data-active="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); cursor:pointer; }
        .tp-slot[data-shake="true"] { animation:tpShake .4s; border-color:${NO}; }
        .tp-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .tp-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .tp-q:disabled{ cursor:default; }
        .tp-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .tp-btn:hover { border-color:${T.lineStrong}; }
        .tp-prob { cursor:pointer; padding:8px 13px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .tp-prob:hover { border-color:${T.lineStrong}; color:#fff; }
        .tp-prob[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .tp-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }
        .tp-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .tp-slot[data-shake="true"], .tp-bin[data-shake="true"] { animation:none; } }

        /* Cajón de teoría */
        .tp-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .tp-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .tp-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .tp-drawer[data-open="true"] { transform:translateX(0); }
        .tp-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .tp-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .tp-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .tp-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .tp-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .tp-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .tp-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero */
        .tp-bin { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .tp-bin:nth-of-type(6n+1) { --tono:188; }
        .tp-bin:nth-of-type(6n+2) { --tono:262; }
        .tp-bin:nth-of-type(6n+3) { --tono:44; }
        .tp-bin:nth-of-type(6n+4) { --tono:152; }
        .tp-bin:nth-of-type(6n+5) { --tono:330; }
        .tp-bin:nth-of-type(6n+6) { --tono:18; }
        .tp-bin::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .tp-bin[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .tp-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .tp-chip:hover { transform:translateY(-2px); }
        .tp-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .tp-chip, .tp-chip:hover, .tp-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="tp-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="tp-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="tp-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button
          className="tp-icobtn"
          onClick={modo === "texto" ? resetHuecos : modo === "armar" ? resetTexto : modo === "tipos" ? resetTipos : resetCon}
          title="Reiniciar este modo"
        >
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <button className="tp-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="tp-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="tp-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="tp-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="tp-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="tp-drawer-body">
          <FichaTeorica data={TALLER_PARRAFOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }} className="tp-grid">
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={TALLER_PARRAFOS_HUECOS}
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

          {modo === "armar" && (
            <ArmarPanel
              accent={accent}
              texto={texto}
              txtIdx={txtIdx}
              armados={armados}
              ordenActual={ordenActual}
              parrafosLibres={parrafosLibres}
              selPar={selPar}
              shakePar={shakePar}
              onSelTexto={(i) => setTxtIdx(i)}
              onSelPar={(id) => setSelPar((p) => (p === id ? null : id))}
              onSlot={() => {
                if (selPar) intentarPar(selPar);
              }}
              onDropSlot={(id) => intentarPar(id)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "tipos" && (
            <TiposPanel
              ubicPar={ubicPar}
              selParCls={selParCls}
              shakeFun={shakeFun}
              parLibres={parLibres}
              accent={accent}
              rgba={color.rgba}
              onSelPar={(id) => setSelParCls((p) => (p === id ? null : id))}
              onBin={(fun) => {
                if (selParCls) intentarTipo(selParCls, fun);
              }}
              onDropBin={(parId, fun) => intentarTipo(parId, fun)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "conectores" && (
            <ConectoresPanel
              ubicCon={ubicCon}
              selCon={selCon}
              shakeRel={shakeRel}
              conLibres={conLibres}
              onSelCon={(id) => setSelCon((p) => (p === id ? null : id))}
              onBin={(rel) => {
                if (selCon) intentarCon(selCon, rel);
              }}
              onDropBin={(conId, rel) => intentarCon(conId, rel)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
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

            <div className="tp-divider" />

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
                  {bestEstrellas >= 3 ? "¡Dominaste el párrafo!" : "Termina los tres modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "armar" && (
                <>Un texto coherente suele seguir el orden <strong style={{ color: T.text }}>introductorio → desarrollo → conclusión</strong>. Lee cada párrafo y colócalo en su lugar.</>
              )}
              {modo === "tipos" && (
                <>El párrafo <strong style={{ color: T.text }}>introductorio</strong> presenta el tema, el de <strong style={{ color: T.text }}>desarrollo</strong> amplía o explica, y el de <strong style={{ color: T.text }}>conclusión</strong> cierra el texto.</>
              )}
              {modo === "conectores" && (
                <>Los conectores de <strong style={{ color: T.text }}>adición</strong> suman, los de <strong style={{ color: T.text }}>contraste</strong> oponen y los de <strong style={{ color: T.text }}>causa-consecuencia</strong> relacionan causa y efecto.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_PARRAFOS}</span>
          </div>
        </div>
      </div>

      <QuizCard
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Arma el texto» (ordenar párrafos)
 * ═══════════════════════════════════════════════════════════════════════════ */
function ArmarPanel({
  accent,
  texto,
  txtIdx,
  armados,
  ordenActual,
  parrafosLibres,
  selPar,
  shakePar,
  onSelTexto,
  onSelPar,
  onSlot,
  onDropSlot,
  dragProps,
  dropProps,
}: {
  accent: string;
  texto: (typeof TEXTOS)[number];
  txtIdx: number;
  armados: Set<string>;
  ordenActual: string[];
  parrafosLibres: (typeof TEXTOS)[number]["parrafos"];
  selPar: string | null;
  shakePar: boolean;
  onSelTexto: (i: number) => void;
  onSelPar: (id: string) => void;
  onSlot: () => void;
  onDropSlot: (id: string) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const completado = armados.has(texto.id);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {TEXTOS.map((t, i) => (
          <button key={t.id} className="tp-prob" data-on={txtIdx === i} data-done={armados.has(t.id)} onClick={() => onSelTexto(i)}>
            {armados.has(t.id) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {t.titulo}
          </button>
        ))}
      </div>

      <div style={{ ...card, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
          <Eyebrow>
            <i className="fa-solid fa-layer-group" style={{ marginRight: 8, color: accent }} />
            «{texto.titulo}» — ordena los párrafos
          </Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: completado ? OK : T.text3 }}>
            {completado ? "Texto completo ✓" : `${ordenActual.length}/${texto.parrafos.length} párrafos`}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {texto.parrafos.map((_, i) => {
            const colocadoId = ordenActual[i];
            const par = colocadoId ? texto.parrafos.find((p) => p.id === colocadoId) : null;
            const esActivo = i === ordenActual.length;
            const info = par ? FUNCION_INFO[par.funcion] : null;
            return (
              <div key={i}>
                {i > 0 && (
                  <div style={{ textAlign: "center", color: T.text3, lineHeight: 0.6, margin: "1px 0" }}>
                    <i className="fa-solid fa-arrow-down" style={{ fontSize: 11, opacity: par || i <= ordenActual.length ? 0.7 : 0.2 }} />
                  </div>
                )}
                {par && info ? (
                  <div style={{ animation: "tpPop .25s ease", padding: "12px 15px", borderRadius: 13, border: `1.5px solid ${info.color}`, background: `${info.color}1a` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                      <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, background: `${info.color}33`, color: "#fff" }}>{i + 1}</span>
                      <i className={`fa-solid ${info.icono}`} style={{ color: info.color, fontSize: 13 }} />
                      <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.05em", color: info.color, textTransform: "uppercase" }}>{info.label}</span>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: "#fff" }}>{par.texto}</div>
                  </div>
                ) : (
                  <div
                    className="tp-slot"
                    data-active={esActivo}
                    data-shake={esActivo && shakePar}
                    onClick={() => esActivo && onSlot()}
                    {...(esActivo ? dropProps((id) => onDropSlot(id)) : {})}
                  >
                    {esActivo ? (
                      <>
                        <i className="fa-solid fa-arrow-down-to-bracket" /> Suelta aquí el párrafo {i + 1}
                      </>
                    ) : (
                      <span style={{ opacity: 0.4 }}>Párrafo {i + 1}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Párrafos disponibles — arrástralos en orden</Eyebrow>
        {parrafosLibres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Texto coherente armado! Cambia de texto arriba para armar otro.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {parrafosLibres.map((p) => (
              <button key={p.id} className="tp-card" data-sel={selPar === p.id} onClick={() => onSelPar(p.id)} {...dragProps(p.id)}>
                {p.texto}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Clasifica los párrafos» (por función)
 * ═══════════════════════════════════════════════════════════════════════════ */
function TiposPanel({
  ubicPar,
  selParCls,
  shakeFun,
  parLibres,
  accent,
  rgba,
  onSelPar,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
}: {
  ubicPar: Record<string, Funcion>;
  selParCls: string | null;
  shakeFun: Funcion | null;
  parLibres: typeof PARRAFOS;
  accent: string;
  rgba: string;
  onSelPar: (id: string) => void;
  onBin: (fun: Funcion) => void;
  onDropBin: (parId: string, fun: Funcion) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const funciones: Funcion[] = ["introductorio", "desarrollo", "conclusion"];
  const colocados = Object.keys(ubicPar).length;
  const sel = parLibres.find((p) => p.id === selParCls) ?? null;
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Lee cada párrafo y arrástralo a su función</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: colocados >= PARRAFOS.length ? OK : T.text3 }}>{colocados}/{PARRAFOS.length}</span>
        </div>
        {parLibres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Clasificaste los 6 párrafos!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {parLibres.map((p) => (
              <button key={p.id} className="tp-card" data-sel={selParCls === p.id} onClick={() => onSelPar(p.id)} {...dragProps(p.id)}>
                {p.texto}
              </button>
            ))}
          </div>
        )}
        {sel && (
          <div style={{ marginTop: 12, fontSize: 12, color: accent, display: "flex", gap: 8, alignItems: "center" }}>
            <i className="fa-solid fa-magnifying-glass" /> Pista: {sel.pista}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="tp-bins">
        {funciones.map((fun) => {
          const info = FUNCION_INFO[fun];
          const dentro = PARRAFOS.filter((p) => ubicPar[p.id] === fun);
          return (
            <div
              key={fun}
              className="tp-bin"
              data-shake={shakeFun === fun}
              onClick={() => onBin(fun)}
              {...dropProps((parId) => onDropBin(parId, fun))}
              style={{ borderColor: `${info.color}66`, background: `${info.color}0d`, cursor: selParCls ? "pointer" : "default" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", background: `${info.color}33` }}>
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{info.label}</div>
                  <div style={{ fontSize: 10, color: T.text3, lineHeight: 1.3 }}>{info.descripcion}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {dentro.map((p) => (
                  <span key={p.id} style={{ animation: "tpPop .25s ease", fontSize: 11.5, lineHeight: 1.4, color: "#fff", padding: "8px 10px", borderRadius: 9, background: `${info.color}1f`, border: `1px solid ${info.color}55` }}>
                    {p.texto.length > 90 ? p.texto.slice(0, 88) + "…" : p.texto}
                  </span>
                ))}
                {dentro.length === 0 && <span style={{ fontSize: 11.5, color: T.text3, fontStyle: "italic" }}>Vacío</span>}
              </div>
            </div>
          );
        })}
      </div>
      <span style={{ display: "none" }}>{rgba}</span>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Clasifica los conectores»
 * ═══════════════════════════════════════════════════════════════════════════ */
function ConectoresPanel({
  ubicCon,
  selCon,
  shakeRel,
  conLibres,
  onSelCon,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
}: {
  ubicCon: Record<string, Relacion>;
  selCon: string | null;
  shakeRel: Relacion | null;
  conLibres: typeof CONECTORES;
  onSelCon: (id: string) => void;
  onBin: (rel: Relacion) => void;
  onDropBin: (conId: string, rel: Relacion) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const relaciones: Relacion[] = ["adicion", "contraste", "causa"];
  const colocados = Object.keys(ubicCon).length;
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>Arrastra cada conector a su relación</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: colocados >= CONECTORES.length ? OK : T.text3 }}>{colocados}/{CONECTORES.length}</span>
        </div>
        {conLibres.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> ¡Clasificaste los 9 conectores!
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {conLibres.map((c) => (
              <button key={c.id} className="tp-chip" data-sel={selCon === c.id} onClick={() => onSelCon(c.id)} {...dragProps(c.id)}>
                {c.texto}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="tp-bins">
        {relaciones.map((rel) => {
          const info = RELACION_INFO[rel];
          const dentro = CONECTORES.filter((c) => ubicCon[c.id] === rel);
          return (
            <div
              key={rel}
              className="tp-bin"
              data-shake={shakeRel === rel}
              onClick={() => onBin(rel)}
              {...dropProps((conId) => onDropBin(conId, rel))}
              style={{ borderColor: `${info.color}66`, background: `${info.color}0d`, cursor: selCon ? "pointer" : "default" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", background: `${info.color}33` }}>
                  <i className={`fa-solid ${info.icono}`} />
                </span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff" }}>{info.label}</div>
                  <div style={{ fontSize: 10, color: T.text3 }}>{info.descripcion}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {dentro.map((c) => (
                  <span key={c.id} style={{ animation: "tpPop .25s ease", fontSize: 13, fontWeight: 800, color: "#fff", padding: "6px 12px", borderRadius: 999, background: `${info.color}26`, border: `1px solid ${info.color}55` }}>
                    {c.texto}
                  </span>
                ))}
                {dentro.length === 0 && <span style={{ fontSize: 11.5, color: T.text3, fontStyle: "italic" }}>Vacío</span>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Cuestionario de comprensión
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
        Cinco preguntas sobre la oración temática, los tipos de párrafo y los conectores. Responde y pulsa «Comprobar».
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
                    <button key={oi} className="tp-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="tp-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="tp-btn" onClick={reintentar}>
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
