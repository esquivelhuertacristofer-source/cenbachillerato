"use client";

/**
 * Laboratorio — Tipos de tiempo histórico: el tiempo que medimos y el que
 * sentimos.
 * Práctica experimental para CH-I-P02 (Conciencia Histórica I).
 *
 * Interactividad máxima. Cuatro modos: los tres de arrastrar/clasificar y, al
 * final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «¿Larga, mediana o corta duración?» — clasifica seis casos en las tres
 *     duraciones de Braudel (larga / mediana / corta), las únicas categorías de
 *     duración que define la fuente (A5).
 *  2. «La línea del tiempo cronológico» — ordena de lo más antiguo a lo más
 *     reciente los cuatro hitos de la historia mexicana que la infografía (A1)
 *     ubica en su línea del tiempo (mecánica de orden: hueco activo + eslabones
 *     bloqueados; mezcla determinista por clave de texto, NO por fecha).
 *  3. «Escribe el término» — lee la definición verbatim (A5) y escribe
 *     de memoria el término del glosario que la nombra.
 *  + Cuestionario de comprensión (V/F verbatim de A4).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de CH-I·P02.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { TIEMPO_HISTORICO_HUECOS } from "./tiempo-historico-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { TIEMPO_HISTORICO_FICHA } from "./tiempo-historico-ficha";
import {
  ITEMS_DURACION,
  DURACION_INFO,
  HITOS,
  PARES,
  QUIZ,
  DATO_TIEMPO,
  type Duracion,
} from "./tiempo-historico-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-tiempo-historico-reto";

type Modo = "duracion" | "linea" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "duracion", label: "¿Larga, mediana o corta duración?", icono: "fa-layer-group" },
  { id: "linea", label: "La línea del tiempo cronológico", icono: "fa-timeline" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabTiempoHistorico({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("duracion");

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

  // ── modo Duración (clasifica en 3 columnas de Braudel) ──────────────────
  const [ubicDur, setUbicDur] = useState<Record<string, Duracion>>({});
  const [selDur, setSelDur] = useState<string | null>(null);
  const [shakeDur, setShakeDur] = useState<Duracion | null>(null);
  const durLibres = ITEMS_DURACION.filter((x) => !ubicDur[x.id])
    .slice()
    .sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarDur = (itemId: string, bin: Duracion) => {
    if (ubicDur[itemId]) return;
    const it = ITEMS_DURACION.find((x) => x.id === itemId);
    if (it && it.duracion === bin) {
      setUbicDur((e) => ({ ...e, [itemId]: bin }));
      setSelDur(null);
      sfxPlace();
      if (Object.keys(ubicDur).length + 1 >= ITEMS_DURACION.length) {
        sfxOk();
        persistMejor(true, lineaDone, glosarioDone);
      }
    } else {
      setShakeDur(bin);
      sfxNo();
      window.setTimeout(() => setShakeDur(null), 420);
    }
  };
  const resetDuracion = () => {
    setUbicDur({});
    setSelDur(null);
  };

  // ── modo Línea (ordena cronológicamente) ───────────────────────────────
  const [lineaPos, setLineaPos] = useState(0);
  const [selL, setSelL] = useState<string | null>(null);
  const [shakeL, setShakeL] = useState(false);
  // mezcla determinista: por una clave de texto, NO por fecha (localeCompare)
  const lineaLibres = HITOS.filter((h) => h.orden >= lineaPos)
    .slice()
    .sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarLinea = (hitoId: string) => {
    if (lineaPos >= HITOS.length) return;
    const esperado = HITOS[lineaPos]!;
    if (hitoId === esperado.id) {
      setLineaPos((p) => p + 1);
      setSelL(null);
      sfxPlace();
      if (lineaPos + 1 >= HITOS.length) {
        sfxOk();
        persistMejor(duracionDone, true, glosarioDone);
      }
    } else {
      setShakeL(true);
      sfxNo();
      window.setTimeout(() => setShakeL(false), 420);
    }
  };
  const resetLinea = () => {
    setLineaPos(0);
    setSelL(null);
  };

  // ── modo Glosario (empareja término → definición) ──────────────────────
  // El contador hace de `key`: subirlo remonta el componente y deja todas
  // las tarjetas en blanco.
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const duracionDone = Object.keys(ubicDur).length >= ITEMS_DURACION.length;
  const lineaDone = lineaPos >= HITOS.length;
  const modosHechos = (duracionDone ? 1 : 0) + (lineaDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Clasifica los 6 casos por su duración (Braudel)", done: duracionDone },
    { txt: "Ordena la línea del tiempo cronológico", done: lineaDone },
    { txt: "Escribe los 6 conceptos del glosario", done: glosarioDone },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "duracion" ? resetDuracion : modo === "linea" ? resetLinea : resetGlosario;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes tihShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes tihPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .tih-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .tih-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .tih-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .tih-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .tih-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .tih-icobtn:hover { background:rgba(255,255,255,0.12); }
        .tih-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13.5px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .tih-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .tih-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .tih-chip:active { cursor:grabbing; }
        .tih-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .tih-row[data-shake="true"] { animation:tihShake .4s; border-color:${NO}; }
        .tih-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .tih-slot { flex-shrink:0; min-width:185px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .tih-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .tih-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:230px; }
        .tih-bin[data-shake="true"] { animation:tihShake .4s; border-color:${NO}; }
        .tih-step { border-radius:13px; border:1.5px solid ${OK}66; background:${OK}0f; padding:13px 16px; display:flex; align-items:flex-start; gap:12px; animation:tihPop .25s ease; }
        .tih-fslot { border-radius:13px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; padding:14px 16px; transition:all .16s;
          display:flex; align-items:center; gap:12px; color:${T.text3}; font-size:13.5px; cursor:pointer; }
        .tih-fslot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); color:#fff; }
        .tih-fslot[data-shake="true"] { animation:tihShake .4s; border-color:${NO}; }
        .tih-locked { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:13px 16px; display:flex; align-items:center; gap:12px; opacity:0.45; }
        .tih-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .tih-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .tih-q:disabled{ cursor:default; }
        .tih-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .tih-btn:hover { border-color:${T.lineStrong}; }
        .tih-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .tih-row[data-shake="true"], .tih-bin[data-shake="true"], .tih-fslot[data-shake="true"] { animation:none; } }

        /* Cajón de teoría */
        .tih-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .tih-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .tih-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .tih-drawer[data-open="true"] { transform:translateX(0); }
        .tih-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .tih-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .tih-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .tih-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .tih-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .tih-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .tih-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero */
        .tih-bin, .tih-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .tih-bin:nth-of-type(6n+1), .tih-row:nth-of-type(6n+1) { --tono:188; }
        .tih-bin:nth-of-type(6n+2), .tih-row:nth-of-type(6n+2) { --tono:262; }
        .tih-bin:nth-of-type(6n+3), .tih-row:nth-of-type(6n+3) { --tono:44; }
        .tih-bin:nth-of-type(6n+4), .tih-row:nth-of-type(6n+4) { --tono:152; }
        .tih-bin:nth-of-type(6n+5), .tih-row:nth-of-type(6n+5) { --tono:330; }
        .tih-bin:nth-of-type(6n+6), .tih-row:nth-of-type(6n+6) { --tono:18; }
        .tih-bin::before, .tih-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .tih-bin[data-done="true"], .tih-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .tih-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .tih-chip:hover { transform:translateY(-2px); }
        .tih-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .tih-chip, .tih-chip:hover, .tih-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="tih-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="tih-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="tih-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="tih-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <button className="tih-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="tih-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="tih-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="tih-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="tih-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="tih-drawer-body">
          <FichaTeorica data={TIEMPO_HISTORICO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — duración */}
          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={TIEMPO_HISTORICO_HUECOS}
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

          {modo === "duracion" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada caso a su duración histórica</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: duracionDone ? OK : T.text3 }}>
                    {Object.keys(ubicDur).length}/{ITEMS_DURACION.length}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
                  Braudel distingue tres tiempos: la <strong style={{ color: T.text2 }}>larga duración</strong> (estructuras lentas), la <strong style={{ color: T.text2 }}>mediana duración</strong> (coyunturas) y el <strong style={{ color: T.text2 }}>tiempo corto</strong> (eventos concretos).
                </div>
                {durLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {ITEMS_DURACION.length} casos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {durLibres.map((x) => (
                      <button key={x.id} className="tih-chip" data-sel={selDur === x.id} onClick={() => setSelDur((s) => (s === x.id ? null : x.id))} {...dragProps(x.id)}>
                        {x.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsDuracion selDur={selDur} shakeDur={shakeDur} ubicDur={ubicDur} onMatch={intentarDur} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — línea del tiempo */}
          {modo === "linea" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Ordena los hitos del más antiguo al más reciente</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: lineaDone ? OK : T.text3 }}>
                    {lineaPos}/{HITOS.length}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
                  Arrastra el <strong style={{ color: T.text2 }}>siguiente hito</strong> al hueco activo, en orden cronológico, como en la línea del tiempo de la infografía (del siglo XVI al XX).
                </div>
                {lineaLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Reconstruiste la línea del tiempo cronológico!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {lineaLibres.map((h) => (
                      <button key={h.id} className="tih-chip" data-sel={selL === h.id} onClick={() => setSelL((s) => (s === h.id ? null : h.id))} {...dragProps(h.id)}>
                        <i className="fa-solid fa-calendar-days" style={{ fontSize: 11, color: T.text3 }} />
                        {h.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <LineaOrden selL={selL} shakeL={shakeL} lineaPos={lineaPos} onMatch={intentarLinea} dropProps={dropProps} />
            </>
          )}

          {/* MODO 3 — glosario */}
          {modo === "glosario" && (
            <EscribeTermino
              key={glosIntento}
              pares={PARES}
              accent={accent}
              rgba={color.rgba}
              completado={glosarioDone}
              instrucciones="Lee la definición y escribe el término del glosario que le corresponde."
              onCompletado={() => {
                setGlosarioDone(true);
                sfxOk();
                persistMejor(duracionDone, lineaDone, true);
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
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

            <div className="tih-divider" />

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
                  {bestEstrellas >= 3 ? "¡Distingues el tiempo que medimos del que sentimos!" : "Termina los tres modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "duracion" && (
                <>El <strong style={{ color: T.text }}>clima</strong> y la geografía son de larga duración; una <strong style={{ color: T.text }}>crisis económica</strong> es de mediana duración; una <strong style={{ color: T.text }}>batalla</strong> es de tiempo corto.</>
              )}
              {modo === "linea" && (
                <>Sigue las fechas: la caída de Tenochtitlan (<strong style={{ color: T.text }}>1521</strong>), la Independencia (<strong style={{ color: T.text }}>1821</strong>), la Revolución (<strong style={{ color: T.text }}>1910</strong>) y la Constitución (<strong style={{ color: T.text }}>1917</strong>).</>
              )}
              {modo === "glosario" && (
                <>Ya no se arrastra: lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_TIEMPO}</span>
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

function BinsDuracion({
  selDur,
  shakeDur,
  ubicDur,
  onMatch,
  dropProps,
}: {
  selDur: string | null;
  shakeDur: Duracion | null;
  ubicDur: Record<string, Duracion>;
  onMatch: (itemId: string, bin: Duracion) => void;
  dropProps: DropFactory;
}) {
  const bins: Duracion[] = ["larga", "mediana", "corta"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = DURACION_INFO[bin];
        const dentro = ITEMS_DURACION.filter((x) => ubicDur[x.id] === bin);
        return (
          <div
            key={bin}
            className="tih-bin"
            data-shake={shakeDur === bin}
            onClick={() => selDur && onMatch(selDur, bin)}
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
                dentro.map((x) => (
                  <span key={x.id} style={{ animation: "tihPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {x.texto}
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

function LineaOrden({
  selL,
  shakeL,
  lineaPos,
  onMatch,
  dropProps,
}: {
  selL: string | null;
  shakeL: boolean;
  lineaPos: number;
  onMatch: (hitoId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {HITOS.map((h, i) => {
        const num = (
          <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, border: `1.5px solid ${T.lineStrong}`, color: T.text2 }}>
            {i + 1}
          </span>
        );
        if (i < lineaPos) {
          // ya colocado
          return (
            <div key={h.id} className="tih-step">
              <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, background: OK, color: "#04121f", marginTop: 1 }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{h.anio}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: OK, border: `1px solid ${OK}55`, borderRadius: 6, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {h.etapa}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.4 }}>{h.texto}</div>
              </div>
            </div>
          );
        }
        if (i === lineaPos) {
          // hueco activo
          return (
            <div
              key={h.id}
              className="tih-fslot"
              data-armed={!!selL}
              data-shake={shakeL}
              onClick={() => selL && onMatch(selL)}
              {...dropProps((id) => onMatch(id))}
            >
              {num}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-arrow-down" style={{ fontSize: 12 }} />
                <span style={{ fontWeight: 700 }}>Suelta aquí el siguiente hito</span>
              </div>
            </div>
          );
        }
        // bloqueado
        return (
          <div key={h.id} className="tih-locked">
            {num}
            <span style={{ fontSize: 13, color: T.text3 }}>
              <i className="fa-solid fa-lock" style={{ marginRight: 8, fontSize: 11 }} />
              Hito {i + 1}
            </span>
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
        Cinco afirmaciones sobre el tiempo cronológico, cíclico y subjetivo. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="tih-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="tih-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="tih-btn" onClick={reintentar}>
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
