"use client";

/**
 * Laboratorio — Estrategias para buscar información confiable en internet
 * Práctica experimental para CD-II-P01 (Cultura Digital II).
 *
 * Interactividad máxima. Cuatro modos: los tres de arrastrar/clasificar y, al
 * final, uno que se escribe («Completa el texto», verbatim de la progresión):
 *  1. «¿Estrategia o señal de alerta?» — clasifica nueve indicios entre
 *     estrategia de búsqueda confiable y señal de alerta de desinformación.
 *  2. «Las cinco estrategias» — empareja cada estrategia (verificar dominio y
 *     autoría, revisar la fecha, buscar citas, lateral reading, evaluar el tono)
 *     con la pregunta clave que responde (verbatim de A1).
 *  3. «Escribe el término» — lee la definición verbatim (A1/A2) y escribe
 *     de memoria el término del glosario que la nombra.
 *  + Cuestionario de comprensión (opción múltiple verbatim de A2).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de CD-II·P01.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { BUSQUEDA_CONFIABLE_HUECOS } from "./busqueda-confiable-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { BUSQUEDA_CONFIABLE_FICHA } from "./busqueda-confiable-ficha";
import {
  SENALES,
  CATEGORIA_INFO,
  CRITERIOS,
  PARES,
  QUIZ,
  DATO_BUSQUEDA,
  type Categoria,
} from "./busqueda-confiable-data";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-busqueda-confiable-reto";

type Modo = "senales" | "estrategias" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "senales", label: "¿Estrategia o señal de alerta?", icono: "fa-flag" },
  { id: "estrategias", label: "Las cinco estrategias", icono: "fa-magnifying-glass" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabBusquedaConfiable({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("senales");

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

  // ── modo señales (clasifica estrategia / alerta) ───────────────────────
  const [ubicSenal, setUbicSenal] = useState<Record<string, Categoria>>({});
  const [selSenal, setSelSenal] = useState<string | null>(null);
  const [shakeSenal, setShakeSenal] = useState<Categoria | null>(null);
  const senalesLibres = SENALES.filter((s) => !ubicSenal[s.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarSenal = (senalId: string, bin: Categoria) => {
    if (ubicSenal[senalId]) return;
    const s = SENALES.find((x) => x.id === senalId);
    if (s && s.categoria === bin) {
      setUbicSenal((e) => ({ ...e, [senalId]: bin }));
      setSelSenal(null);
      sfxPlace();
      if (Object.keys(ubicSenal).length + 1 >= SENALES.length) {
        sfxOk();
        persistMejor(true, estrategiasDone, glosarioDone);
      }
    } else {
      setShakeSenal(bin);
      sfxNo();
      window.setTimeout(() => setShakeSenal(null), 420);
    }
  };
  const resetSenales = () => {
    setUbicSenal({});
    setSelSenal(null);
  };

  // ── modo estrategias (empareja estrategia → pregunta) ──────────────────
  const [empEstr, setEmpEstr] = useState<Record<string, boolean>>({});
  const [selEstr, setSelEstr] = useState<string | null>(null);
  const [shakeEstr, setShakeEstr] = useState<string | null>(null);
  const estrLibres = CRITERIOS.filter((c) => !empEstr[c.id]).slice().sort((a, b) => a.criterio.localeCompare(b.criterio, "es"));

  const intentarEstr = (chipId: string, rowId: string) => {
    if (empEstr[rowId]) return;
    if (chipId === rowId) {
      setEmpEstr((e) => ({ ...e, [rowId]: true }));
      setSelEstr(null);
      sfxPlace();
      if (Object.keys(empEstr).length + 1 >= CRITERIOS.length) {
        sfxOk();
        persistMejor(senalesDone, true, glosarioDone);
      }
    } else {
      setShakeEstr(rowId);
      sfxNo();
      window.setTimeout(() => setShakeEstr(null), 420);
    }
  };
  const resetEstrategias = () => {
    setEmpEstr({});
    setSelEstr(null);
  };

  // ── modo glosario (lee la definición y ESCRIBE el término) ─────────────
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
  const senalesDone = Object.keys(ubicSenal).length >= SENALES.length;
  const estrategiasDone = Object.keys(empEstr).length >= CRITERIOS.length;
  const modosHechos = (senalesDone ? 1 : 0) + (estrategiasDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Clasifica los 9 indicios (estrategia / alerta)", done: senalesDone },
    { txt: "Empareja las 5 estrategias con su pregunta", done: estrategiasDone },
    { txt: "Escribe los 5 términos del glosario", done: glosarioDone },
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
  const resetActual = modo === "texto" ? resetTexto : modo === "senales" ? resetSenales : modo === "estrategias" ? resetEstrategias : resetGlosario;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes bcShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes bcPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .bc-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .bc-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .bc-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .bc-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .bc-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .bc-icobtn:hover { background:rgba(255,255,255,0.12); }
        .bc-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13.5px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .bc-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .bc-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .bc-chip:active { cursor:grabbing; }
        .bc-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .bc-row[data-shake="true"] { animation:bcShake .4s; border-color:${NO}; }
        .bc-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .bc-slot { flex-shrink:0; min-width:210px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .bc-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .bc-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:260px; }
        .bc-bin[data-shake="true"] { animation:bcShake .4s; border-color:${NO}; }
        .bc-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .bc-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .bc-q:disabled{ cursor:default; }
        .bc-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .bc-btn:hover { border-color:${T.lineStrong}; }
        .bc-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .bc-row[data-shake="true"], .bc-bin[data-shake="true"] { animation:none; } }

        /* Cajón de teoría */
        .bc-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .bc-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .bc-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .bc-drawer[data-open="true"] { transform:translateX(0); }
        .bc-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .bc-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .bc-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .bc-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .bc-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .bc-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .bc-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        /* Identidad del tablero */
        .bc-bin, .bc-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .bc-bin:nth-of-type(6n+1), .bc-row:nth-of-type(6n+1) { --tono:188; }
        .bc-bin:nth-of-type(6n+2), .bc-row:nth-of-type(6n+2) { --tono:262; }
        .bc-bin:nth-of-type(6n+3), .bc-row:nth-of-type(6n+3) { --tono:44; }
        .bc-bin:nth-of-type(6n+4), .bc-row:nth-of-type(6n+4) { --tono:152; }
        .bc-bin:nth-of-type(6n+5), .bc-row:nth-of-type(6n+5) { --tono:330; }
        .bc-bin:nth-of-type(6n+6), .bc-row:nth-of-type(6n+6) { --tono:18; }
        .bc-bin::before, .bc-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .bc-bin[data-done="true"], .bc-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .bc-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .bc-chip:hover { transform:translateY(-2px); }
        .bc-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .bc-chip, .bc-chip:hover, .bc-chip[data-sel="true"] { transform:none; transition:none; }
        }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="bc-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="bc-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="bc-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="bc-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <button className="bc-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="bc-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="bc-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="bc-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="bc-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="bc-drawer-body">
          <FichaTeorica data={BUSQUEDA_CONFIABLE_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — señales */}
          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={BUSQUEDA_CONFIABLE_HUECOS}
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

          {modo === "senales" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada indicio a su categoría</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: senalesDone ? OK : T.text3 }}>
                    {Object.keys(ubicSenal).length}/{SENALES.length}
                  </span>
                </div>
                {senalesLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {SENALES.length} indicios!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {senalesLibres.map((s) => (
                      <button key={s.id} className="bc-chip" data-sel={selSenal === s.id} onClick={() => setSelSenal((v) => (v === s.id ? null : s.id))} {...dragProps(s.id)}>
                        {s.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsSenales selSenal={selSenal} shakeSenal={shakeSenal} ubicSenal={ubicSenal} onMatch={intentarSenal} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — estrategias */}
          {modo === "estrategias" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada estrategia a la pregunta que responde</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: estrategiasDone ? OK : T.text3 }}>
                    {Object.keys(empEstr).length}/{CRITERIOS.length}
                  </span>
                </div>
                {estrLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {CRITERIOS.length} estrategias!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {estrLibres.map((c) => (
                      <button key={c.id} className="bc-chip" data-sel={selEstr === c.id} onClick={() => setSelEstr((v) => (v === c.id ? null : c.id))} {...dragProps(c.id)}>
                        <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 11, color: T.text3 }} />
                        {c.criterio}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsEstrategias selEstr={selEstr} shakeEstr={shakeEstr} empEstr={empEstr} onMatch={intentarEstr} dropProps={dropProps} />
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
                persistMejor(senalesDone, estrategiasDone, true);
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

            <div className="bc-divider" />

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
                  {bestEstrellas >= 3 ? "¡Evalúas fuentes en internet con criterio!" : "Termina los tres modos para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "senales" && (
                <>Una <strong style={{ color: T.text }}>estrategia confiable</strong> ayuda a evaluar la fuente antes de creerla; una <strong style={{ color: T.text }}>señal de alerta</strong> (lenguaje alarmista, titular sensacionalista) invita a desconfiar y verificar.</>
              )}
              {modo === "estrategias" && (
                <>Para evaluar una fuente pregúntate <strong style={{ color: T.text }}>quién</strong> la publicó, <strong style={{ color: T.text }}>cuándo</strong>, si <strong style={{ color: T.text }}>cita</strong> sus fuentes, qué dicen <strong style={{ color: T.text }}>otros sitios</strong> sobre ella y si su <strong style={{ color: T.text }}>tono</strong> es alarmista.</>
              )}
              {modo === "glosario" && (
                <>Ya no se arrastra: lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_BUSQUEDA}</span>
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

function BinsSenales({
  selSenal,
  shakeSenal,
  ubicSenal,
  onMatch,
  dropProps,
}: {
  selSenal: string | null;
  shakeSenal: Categoria | null;
  ubicSenal: Record<string, Categoria>;
  onMatch: (senalId: string, bin: Categoria) => void;
  dropProps: DropFactory;
}) {
  const bins: Categoria[] = ["confiable", "alerta"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = CATEGORIA_INFO[bin];
        const dentro = SENALES.filter((s) => ubicSenal[s.id] === bin);
        const tint = bin === "alerta" ? NO : OK;
        return (
          <div
            key={bin}
            className="bc-bin"
            data-shake={shakeSenal === bin}
            onClick={() => selSenal && onMatch(selSenal, bin)}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <i className={`fa-solid ${info.icono}`} style={{ color: tint }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((s) => (
                  <span key={s.id} style={{ animation: "bcPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {s.texto}
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

function RowsEstrategias({
  selEstr,
  shakeEstr,
  empEstr,
  onMatch,
  dropProps,
}: {
  selEstr: string | null;
  shakeEstr: string | null;
  empEstr: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {CRITERIOS.map((c) => {
        const done = empEstr[c.id];
        return (
          <div
            key={c.id}
            className="bc-row"
            data-shake={shakeEstr === c.id}
            data-done={done}
            onClick={() => !done && selEstr && onMatch(selEstr, c.id)}
            {...dropProps((id) => onMatch(id, c.id))}
          >
            <div className="bc-slot" data-armed={!done && !!selEstr} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "bcPop .25s ease", fontSize: 13, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-magnifying-glass" />
                  {c.criterio}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> estrategia
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{c.pregunta}</div>
              <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{c.ejemplo}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Cuestionario de comprensión (opción múltiple verbatim de A2)
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
        Cinco preguntas sobre cómo buscar y evaluar información confiable en internet. Elige la opción correcta de cada una y pulsa «Comprobar».
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
                    <button key={oi} className="bc-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="bc-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="bc-btn" onClick={reintentar}>
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
