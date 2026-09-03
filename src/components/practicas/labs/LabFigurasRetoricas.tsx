"use client";

/**
 * Laboratorio — Figuras retóricas: analiza fragmentos de poesía
 * Práctica experimental para LC-III-P05-A1 (Lengua y Comunicación III).
 *
 * Interactividad máxima. Cuatro modos: los tres de arrastrar/clasificar y, al
 * final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «Empareja figura y definición» — arrastra cada figura retórica a su
 *     definición verbatim del glosario A5.
 *  2. «Empareja figura y verso» — arrastra cada figura al ejemplo en verso real
 *     (versos verbatim de la lectura A1, el glosario A5 y el quiz A2).
 *  3. «¿Figura retórica o forma poética?» — clasifica cada recurso por su tipo
 *     según las etiquetas verbatim del glosario A5.
 *  + Cuestionario de comprensión (V/F verbatim de A4).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de LC-III·P05.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { FIGURAS_RETORICAS_HUECOS } from "./figuras-retoricas-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { FIGURAS_RETORICAS_FICHA } from "./figuras-retoricas-ficha";
import {
  PARES_DEF,
  PARES_VERSO,
  RECURSOS,
  TIPO_INFO,
  QUIZ,
  DATO_FIGURAS,
  type TipoRecurso,
} from "./figuras-retoricas-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-figuras-retoricas-reto";

type Modo = "definiciones" | "versos" | "tipos" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "definiciones", label: "Empareja figura y definición", icono: "fa-book-open" },
  { id: "versos", label: "Empareja figura y verso", icono: "fa-feather-pointed" },
  { id: "tipos", label: "¿Figura retórica o forma poética?", icono: "fa-layer-group" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabFigurasRetoricas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("definiciones");

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

  // ── modo definiciones (empareja figura → definición) ───────────────────
  const [empDef, setEmpDef] = useState<Record<string, boolean>>({});
  const [selDef, setSelDef] = useState<string | null>(null);
  const [shakeDef, setShakeDef] = useState<string | null>(null);
  const defLibres = PARES_DEF.filter((p) => !empDef[p.id]).slice().sort((a, b) => a.figura.localeCompare(b.figura, "es"));

  const intentarDef = (chipId: string, rowId: string) => {
    if (empDef[rowId]) return;
    if (chipId === rowId) {
      setEmpDef((e) => ({ ...e, [rowId]: true }));
      setSelDef(null);
      sfxPlace();
      if (Object.keys(empDef).length + 1 >= PARES_DEF.length) {
        sfxOk();
        persistMejor(true, versosDone, tiposDone);
      }
    } else {
      setShakeDef(rowId);
      sfxNo();
      window.setTimeout(() => setShakeDef(null), 420);
    }
  };
  const resetDefiniciones = () => {
    setEmpDef({});
    setSelDef(null);
  };

  // ── modo versos (empareja figura → ejemplo en verso) ───────────────────
  const [empVerso, setEmpVerso] = useState<Record<string, boolean>>({});
  const [selVerso, setSelVerso] = useState<string | null>(null);
  const [shakeVerso, setShakeVerso] = useState<string | null>(null);
  const versoLibres = PARES_VERSO.filter((p) => !empVerso[p.id]).slice().sort((a, b) => a.figura.localeCompare(b.figura, "es"));

  const intentarVerso = (chipId: string, rowId: string) => {
    if (empVerso[rowId]) return;
    if (chipId === rowId) {
      setEmpVerso((e) => ({ ...e, [rowId]: true }));
      setSelVerso(null);
      sfxPlace();
      if (Object.keys(empVerso).length + 1 >= PARES_VERSO.length) {
        sfxOk();
        persistMejor(definicionesDone, true, tiposDone);
      }
    } else {
      setShakeVerso(rowId);
      sfxNo();
      window.setTimeout(() => setShakeVerso(null), 420);
    }
  };
  const resetVersos = () => {
    setEmpVerso({});
    setSelVerso(null);
  };

  // ── modo tipos (clasifica figura / forma) ──────────────────────────────
  const [ubicTipo, setUbicTipo] = useState<Record<string, TipoRecurso>>({});
  const [selTipo, setSelTipo] = useState<string | null>(null);
  const [shakeTipo, setShakeTipo] = useState<TipoRecurso | null>(null);
  const tipoLibres = RECURSOS.filter((r) => !ubicTipo[r.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarTipo = (recursoId: string, bin: TipoRecurso) => {
    if (ubicTipo[recursoId]) return;
    const r = RECURSOS.find((x) => x.id === recursoId);
    if (r && r.tipo === bin) {
      setUbicTipo((e) => ({ ...e, [recursoId]: bin }));
      setSelTipo(null);
      sfxPlace();
      if (Object.keys(ubicTipo).length + 1 >= RECURSOS.length) {
        sfxOk();
        persistMejor(definicionesDone, versosDone, true);
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

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const definicionesDone = Object.keys(empDef).length >= PARES_DEF.length;
  const versosDone = Object.keys(empVerso).length >= PARES_VERSO.length;
  const tiposDone = Object.keys(ubicTipo).length >= RECURSOS.length;
  const modosHechos = (definicionesDone ? 1 : 0) + (versosDone ? 1 : 0) + (tiposDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Empareja las 6 figuras con su definición", done: definicionesDone },
    { txt: "Empareja las 6 figuras con su verso", done: versosDone },
    { txt: "Clasifica los 6 recursos por su tipo", done: tiposDone },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "definiciones" ? resetDefiniciones : modo === "versos" ? resetVersos : resetTipos;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes frShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes frPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .fr-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .fr-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .fr-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .fr-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .fr-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .fr-icobtn:hover { background:rgba(255,255,255,0.12); }
        .fr-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13.5px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .fr-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .fr-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .fr-chip:active { cursor:grabbing; }
        .fr-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .fr-row[data-shake="true"] { animation:frShake .4s; border-color:${NO}; }
        .fr-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .fr-slot { flex-shrink:0; min-width:180px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .fr-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .fr-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:230px; }
        .fr-bin[data-shake="true"] { animation:frShake .4s; border-color:${NO}; }
        .fr-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .fr-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .fr-q:disabled{ cursor:default; }
        .fr-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .fr-btn:hover { border-color:${T.lineStrong}; }
        .fr-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .fr-row[data-shake="true"], .fr-bin[data-shake="true"] { animation:none; } }

        /* Cajón de teoría */
        .fr-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .fr-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .fr-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .fr-drawer[data-open="true"] { transform:translateX(0); }
        .fr-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .fr-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .fr-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .fr-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .fr-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .fr-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .fr-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero */
        .fr-bin, .fr-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .fr-bin:nth-of-type(6n+1), .fr-row:nth-of-type(6n+1) { --tono:188; }
        .fr-bin:nth-of-type(6n+2), .fr-row:nth-of-type(6n+2) { --tono:262; }
        .fr-bin:nth-of-type(6n+3), .fr-row:nth-of-type(6n+3) { --tono:44; }
        .fr-bin:nth-of-type(6n+4), .fr-row:nth-of-type(6n+4) { --tono:152; }
        .fr-bin:nth-of-type(6n+5), .fr-row:nth-of-type(6n+5) { --tono:330; }
        .fr-bin:nth-of-type(6n+6), .fr-row:nth-of-type(6n+6) { --tono:18; }
        .fr-bin::before, .fr-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .fr-bin[data-done="true"], .fr-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .fr-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .fr-chip:hover { transform:translateY(-2px); }
        .fr-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .fr-chip, .fr-chip:hover, .fr-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="fr-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="fr-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="fr-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="fr-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <button className="fr-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="fr-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="fr-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="fr-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="fr-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="fr-drawer-body">
          <FichaTeorica data={FIGURAS_RETORICAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — definiciones */}
          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={FIGURAS_RETORICAS_HUECOS}
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

          {modo === "definiciones" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada figura a su definición</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: definicionesDone ? OK : T.text3 }}>
                    {Object.keys(empDef).length}/{PARES_DEF.length}
                  </span>
                </div>
                {defLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {PARES_DEF.length} figuras!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {defLibres.map((p) => (
                      <button key={p.id} className="fr-chip" data-sel={selDef === p.id} onClick={() => setSelDef((v) => (v === p.id ? null : p.id))} {...dragProps(p.id)}>
                        <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 11, color: T.text3 }} />
                        {p.figura}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsDefiniciones selDef={selDef} shakeDef={shakeDef} empDef={empDef} onMatch={intentarDef} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — versos */}
          {modo === "versos" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada figura al verso que la ilustra</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: versosDone ? OK : T.text3 }}>
                    {Object.keys(empVerso).length}/{PARES_VERSO.length}
                  </span>
                </div>
                {versoLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {PARES_VERSO.length} figuras con su verso!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {versoLibres.map((p) => (
                      <button key={p.id} className="fr-chip" data-sel={selVerso === p.id} onClick={() => setSelVerso((v) => (v === p.id ? null : p.id))} {...dragProps(p.id)}>
                        <i className="fa-solid fa-feather-pointed" style={{ fontSize: 11, color: T.text3 }} />
                        {p.figura}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsVersos selVerso={selVerso} shakeVerso={shakeVerso} empVerso={empVerso} onMatch={intentarVerso} dropProps={dropProps} />
            </>
          )}

          {/* MODO 3 — tipos */}
          {modo === "tipos" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada recurso a su tipo</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: tiposDone ? OK : T.text3 }}>
                    {Object.keys(ubicTipo).length}/{RECURSOS.length}
                  </span>
                </div>
                {tipoLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {RECURSOS.length} recursos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {tipoLibres.map((r) => (
                      <button key={r.id} className="fr-chip" data-sel={selTipo === r.id} onClick={() => setSelTipo((v) => (v === r.id ? null : r.id))} {...dragProps(r.id)}>
                        {r.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsTipos selTipo={selTipo} shakeTipo={shakeTipo} ubicTipo={ubicTipo} onMatch={intentarTipo} dropProps={dropProps} />
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

            <div className="fr-divider" />

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
                  {bestEstrellas >= 3 ? "¡Lees poesía como un crítico literario!" : "Termina los tres modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "definiciones" && (
                <>La <strong style={{ color: T.text }}>metáfora</strong> identifica sin «como»; el <strong style={{ color: T.text }}>símil</strong> compara con «como»; la <strong style={{ color: T.text }}>prosopopeya</strong> humaniza; la <strong style={{ color: T.text }}>hipérbole</strong> exagera.</>
              )}
              {modo === "versos" && (
                <>Lee el verso en voz alta: el sonido y la imagen revelan la figura. Pregúntate qué transforma cada verso del significado ordinario.</>
              )}
              {modo === "tipos" && (
                <>Las <strong style={{ color: T.text }}>figuras retóricas</strong> transforman el significado de las palabras; la <strong style={{ color: T.text }}>forma poética</strong> (rima y métrica) organiza el sonido y la medida del verso.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_FIGURAS}</span>
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

function RowsDefiniciones({
  selDef,
  shakeDef,
  empDef,
  onMatch,
  dropProps,
}: {
  selDef: string | null;
  shakeDef: string | null;
  empDef: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PARES_DEF.map((p) => {
        const done = empDef[p.id];
        return (
          <div
            key={p.id}
            className="fr-row"
            data-shake={shakeDef === p.id}
            data-done={done}
            onClick={() => !done && selDef && onMatch(selDef, p.id)}
            {...dropProps((id) => onMatch(id, p.id))}
          >
            <div className="fr-slot" data-armed={!done && !!selDef} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "frPop .25s ease", fontSize: 13, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-wand-magic-sparkles" />
                  {p.figura}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> figura
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>{p.definicion}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RowsVersos({
  selVerso,
  shakeVerso,
  empVerso,
  onMatch,
  dropProps,
}: {
  selVerso: string | null;
  shakeVerso: string | null;
  empVerso: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PARES_VERSO.map((p) => {
        const done = empVerso[p.id];
        return (
          <div
            key={p.id}
            className="fr-row"
            data-shake={shakeVerso === p.id}
            data-done={done}
            onClick={() => !done && selVerso && onMatch(selVerso, p.id)}
            {...dropProps((id) => onMatch(id, p.id))}
          >
            <div className="fr-slot" data-armed={!done && !!selVerso} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "frPop .25s ease", fontSize: 13, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-feather-pointed" />
                  {p.figura}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> figura
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, fontStyle: "italic", color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>{p.verso}</div>
              {done && (
                <div style={{ animation: "frPop .25s ease", fontSize: 11.5, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>{p.nota}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BinsTipos({
  selTipo,
  shakeTipo,
  ubicTipo,
  onMatch,
  dropProps,
}: {
  selTipo: string | null;
  shakeTipo: TipoRecurso | null;
  ubicTipo: Record<string, TipoRecurso>;
  onMatch: (recursoId: string, bin: TipoRecurso) => void;
  dropProps: DropFactory;
}) {
  const bins: TipoRecurso[] = ["figura", "forma"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = TIPO_INFO[bin];
        const dentro = RECURSOS.filter((r) => ubicTipo[r.id] === bin);
        return (
          <div
            key={bin}
            className="fr-bin"
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
                dentro.map((r) => (
                  <span key={r.id} style={{ animation: "frPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {r.texto}
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
        Cinco afirmaciones sobre las figuras retóricas, la rima y la métrica del género lírico. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="fr-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="fr-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="fr-btn" onClick={reintentar}>
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
