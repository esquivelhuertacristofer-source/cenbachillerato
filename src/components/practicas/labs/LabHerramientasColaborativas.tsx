"use client";

/**
 * Laboratorio — Trabajar juntos en la nube: herramientas colaborativas
 * Práctica interactiva para CD-II-P02 (Ciudadanía Digital II).
 *
 * Interactividad máxima: el alumno EXPERIMENTA arrastrando. Tres modos, tres
 * interacciones distintas:
 *  1. «¿Qué herramienta uso?» — arrastra cada tarea escolar a la categoría de
 *     herramienta colaborativa adecuada (documento, presentación, hoja de
 *     cálculo, pizarrón visual, gestión de tareas, comunicación).
 *  2. «Funciones de la nube» — empareja cada función (edición simultánea,
 *     historial de versiones, comentarios, sincronización) con su descripción
 *     verbatim de la lectura.
 *  3. «Buenas prácticas vs. errores» — clasifica cada acción en una de las dos
 *     cestas según sea una buena práctica o un error.
 *  + Cuestionario de comprensión (V/F verbatim de A4).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de CD-II·P02.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import {
  TAREAS,
  CATEGORIA_INFO,
  FUNCIONES,
  ACCIONES,
  JUICIO_INFO,
  QUIZ,
  DATO_NUBE,
  type Categoria,
  type Juicio,
} from "./herramientas-colaborativas-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-herramientas-colaborativas-reto";

type Modo = "herramienta" | "funciones" | "practicas";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "herramienta", label: "¿Qué herramienta uso?", icono: "fa-cloud" },
  { id: "funciones", label: "Funciones de la nube", icono: "fa-arrows-rotate" },
  { id: "practicas", label: "Buenas prácticas vs. errores", icono: "fa-scale-balanced" },
];

export function LabHerramientasColaborativas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("herramienta");

  // ── sonido ────────────────────────────────────────────────────────────
  const [sonido, setSonido] = useState(false);
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
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => sonido && audioRef.current?.incorrecto();
  const sfxPlace = () => sonido && audioRef.current?.blip();

  // ── modo herramienta (clasifica cada tarea por categoría) ───────────────
  const [ubicTarea, setUbicTarea] = useState<Record<string, Categoria>>({});
  const [selTarea, setSelTarea] = useState<string | null>(null);
  const [shakeCat, setShakeCat] = useState<Categoria | null>(null);
  const tareasLibres = TAREAS.filter((t) => !ubicTarea[t.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarTarea = (tareaId: string, bin: Categoria) => {
    if (ubicTarea[tareaId]) return;
    const t = TAREAS.find((x) => x.id === tareaId);
    if (t && t.categoria === bin) {
      setUbicTarea((e) => ({ ...e, [tareaId]: bin }));
      setSelTarea(null);
      sfxPlace();
      if (Object.keys(ubicTarea).length + 1 >= TAREAS.length) {
        sfxOk();
        persistMejor(true, funcionesDone, practicasDone);
      }
    } else {
      setShakeCat(bin);
      sfxNo();
      window.setTimeout(() => setShakeCat(null), 420);
    }
  };
  const resetTareas = () => {
    setUbicTarea({});
    setSelTarea(null);
  };

  // ── modo funciones (empareja función → descripción) ─────────────────────
  const [empFunc, setEmpFunc] = useState<Record<string, boolean>>({});
  const [selFunc, setSelFunc] = useState<string | null>(null);
  const [shakeFunc, setShakeFunc] = useState<string | null>(null);
  const funcLibres = FUNCIONES.filter((f) => !empFunc[f.id]).slice().sort((a, b) => a.funcion.localeCompare(b.funcion, "es"));

  const intentarFunc = (chipId: string, rowId: string) => {
    if (empFunc[rowId]) return;
    if (chipId === rowId) {
      setEmpFunc((e) => ({ ...e, [rowId]: true }));
      setSelFunc(null);
      sfxPlace();
      if (Object.keys(empFunc).length + 1 >= FUNCIONES.length) {
        sfxOk();
        persistMejor(herramientaDone, true, practicasDone);
      }
    } else {
      setShakeFunc(rowId);
      sfxNo();
      window.setTimeout(() => setShakeFunc(null), 420);
    }
  };
  const resetFunciones = () => {
    setEmpFunc({});
    setSelFunc(null);
  };

  // ── modo prácticas (clasifica acción en buena práctica / error) ─────────
  const [ubicAccion, setUbicAccion] = useState<Record<string, Juicio>>({});
  const [selAccion, setSelAccion] = useState<string | null>(null);
  const [shakeJuicio, setShakeJuicio] = useState<Juicio | null>(null);
  const accionesLibres = ACCIONES.filter((a) => !ubicAccion[a.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarAccion = (accionId: string, bin: Juicio) => {
    if (ubicAccion[accionId]) return;
    const a = ACCIONES.find((x) => x.id === accionId);
    if (a && a.juicio === bin) {
      setUbicAccion((e) => ({ ...e, [accionId]: bin }));
      setSelAccion(null);
      sfxPlace();
      if (Object.keys(ubicAccion).length + 1 >= ACCIONES.length) {
        sfxOk();
        persistMejor(herramientaDone, funcionesDone, true);
      }
    } else {
      setShakeJuicio(bin);
      sfxNo();
      window.setTimeout(() => setShakeJuicio(null), 420);
    }
  };
  const resetAcciones = () => {
    setUbicAccion({});
    setSelAccion(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const herramientaDone = Object.keys(ubicTarea).length >= TAREAS.length;
  const funcionesDone = Object.keys(empFunc).length >= FUNCIONES.length;
  const practicasDone = Object.keys(ubicAccion).length >= ACCIONES.length;
  const estrellas = (herramientaDone ? 1 : 0) + (funcionesDone ? 1 : 0) + (practicasDone ? 1 : 0);

  const [mejor, setMejor] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      return Number(window.localStorage.getItem(RETO_KEY)) || 0;
    } catch {
      return 0;
    }
  });
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    setMejor((m) => {
      if (est <= m) return m;
      try {
        window.localStorage.setItem(RETO_KEY, String(est));
      } catch {
        /* localStorage no disponible */
      }
      return est;
    });
  };

  const objetivos = [
    { txt: "Clasifica las 8 tareas por herramienta", done: herramientaDone },
    { txt: "Empareja las 4 funciones de la nube", done: funcionesDone },
    { txt: "Clasifica las 8 acciones: buena práctica o error", done: practicasDone },
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
  });

  const resetActual = modo === "herramienta" ? resetTareas : modo === "funciones" ? resetFunciones : resetAcciones;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes hcolShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes hcolPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .hcol-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .hcol-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .hcol-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .hcol-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .hcol-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .hcol-icobtn:hover { background:rgba(255,255,255,0.12); }
        .hcol-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13.5px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .hcol-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .hcol-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .hcol-chip:active { cursor:grabbing; }
        .hcol-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .hcol-row[data-shake="true"] { animation:hcolShake .4s; border-color:${NO}; }
        .hcol-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .hcol-slot { flex-shrink:0; min-width:170px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .hcol-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .hcol-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:230px; }
        .hcol-bin[data-shake="true"] { animation:hcolShake .4s; border-color:${NO}; }
        .hcol-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .hcol-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .hcol-q:disabled{ cursor:default; }
        .hcol-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .hcol-btn:hover { border-color:${T.lineStrong}; }
        .hcol-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .hcol-row[data-shake="true"], .hcol-bin[data-shake="true"] { animation:none; } }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="hcol-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="hcol-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="hcol-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — herramienta */}
          {modo === "herramienta" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada tarea a la herramienta adecuada</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: herramientaDone ? OK : T.text3 }}>
                    {Object.keys(ubicTarea).length}/{TAREAS.length}
                  </span>
                </div>
                {tareasLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {TAREAS.length} tareas!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {tareasLibres.map((t) => (
                      <button key={t.id} className="hcol-chip" data-sel={selTarea === t.id} onClick={() => setSelTarea((s) => (s === t.id ? null : t.id))} {...dragProps(t.id)}>
                        {t.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsTareas selTarea={selTarea} shakeCat={shakeCat} ubicTarea={ubicTarea} onMatch={intentarTarea} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — funciones */}
          {modo === "funciones" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada función a su descripción</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: funcionesDone ? OK : T.text3 }}>
                    {Object.keys(empFunc).length}/{FUNCIONES.length}
                  </span>
                </div>
                {funcLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {FUNCIONES.length} funciones!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {funcLibres.map((f) => (
                      <button key={f.id} className="hcol-chip" data-sel={selFunc === f.id} onClick={() => setSelFunc((s) => (s === f.id ? null : f.id))} {...dragProps(f.id)}>
                        <i className="fa-solid fa-cloud" style={{ fontSize: 11, color: T.text3 }} />
                        {f.funcion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsFunciones selFunc={selFunc} shakeFunc={shakeFunc} empFunc={empFunc} onMatch={intentarFunc} dropProps={dropProps} />
            </>
          )}

          {/* MODO 3 — prácticas */}
          {modo === "practicas" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada acción a su cesta</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: practicasDone ? OK : T.text3 }}>
                    {Object.keys(ubicAccion).length}/{ACCIONES.length}
                  </span>
                </div>
                {accionesLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {ACCIONES.length} acciones!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {accionesLibres.map((a) => (
                      <button key={a.id} className="hcol-chip" data-sel={selAccion === a.id} onClick={() => setSelAccion((s) => (s === a.id ? null : a.id))} {...dragProps(a.id)}>
                        {a.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsAcciones selAccion={selAccion} shakeJuicio={shakeJuicio} ubicAccion={ubicAccion} onMatch={intentarAccion} dropProps={dropProps} />
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

            <div className="hcol-divider" />

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
                  {bestEstrellas >= 3 ? "¡Colaboras en la nube como un profesional!" : "Completa los tres modos para ganar las estrellas."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "herramienta" && (
                <>Para <strong style={{ color: T.text }}>escribir juntos</strong> usa un documento; para <strong style={{ color: T.text }}>lluvia de ideas</strong> un pizarrón; para <strong style={{ color: T.text }}>organizar tareas</strong> un tablero kanban.</>
              )}
              {modo === "funciones" && (
                <>La nube ofrece <strong style={{ color: T.text }}>edición simultánea</strong>, <strong style={{ color: T.text }}>historial de versiones</strong>, <strong style={{ color: T.text }}>comentarios</strong> y <strong style={{ color: T.text }}>sincronización</strong> entre dispositivos.</>
              )}
              {modo === "practicas" && (
                <>Define roles, nombra bien los archivos y comenta para sugerir: así el trabajo en equipo fluye sin perder información.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_NUBE}</span>
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

function BinsTareas({
  selTarea,
  shakeCat,
  ubicTarea,
  onMatch,
  dropProps,
}: {
  selTarea: string | null;
  shakeCat: Categoria | null;
  ubicTarea: Record<string, Categoria>;
  onMatch: (tareaId: string, bin: Categoria) => void;
  dropProps: DropFactory;
}) {
  const bins: Categoria[] = ["documento", "presentacion", "hoja", "pizarron", "gestion", "comunicacion"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = CATEGORIA_INFO[bin];
        const dentro = TAREAS.filter((t) => ubicTarea[t.id] === bin);
        return (
          <div
            key={bin}
            className="hcol-bin"
            data-shake={shakeCat === bin}
            onClick={() => selTarea && onMatch(selTarea, bin)}
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
                dentro.map((t) => (
                  <span key={t.id} style={{ animation: "hcolPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {t.texto}
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

function RowsFunciones({
  selFunc,
  shakeFunc,
  empFunc,
  onMatch,
  dropProps,
}: {
  selFunc: string | null;
  shakeFunc: string | null;
  empFunc: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {FUNCIONES.map((f) => {
        const done = empFunc[f.id];
        return (
          <div
            key={f.id}
            className="hcol-row"
            data-shake={shakeFunc === f.id}
            data-done={done}
            onClick={() => !done && selFunc && onMatch(selFunc, f.id)}
            {...dropProps((id) => onMatch(id, f.id))}
          >
            <div className="hcol-slot" data-armed={!done && !!selFunc} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "hcolPop .25s ease", fontSize: 13, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-cloud" />
                  {f.funcion}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> función
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{f.descripcion}</div>
              <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{f.ejemplo}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BinsAcciones({
  selAccion,
  shakeJuicio,
  ubicAccion,
  onMatch,
  dropProps,
}: {
  selAccion: string | null;
  shakeJuicio: Juicio | null;
  ubicAccion: Record<string, Juicio>;
  onMatch: (accionId: string, bin: Juicio) => void;
  dropProps: DropFactory;
}) {
  const bins: Juicio[] = ["buena", "error"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = JUICIO_INFO[bin];
        const dentro = ACCIONES.filter((a) => ubicAccion[a.id] === bin);
        return (
          <div
            key={bin}
            className="hcol-bin"
            data-shake={shakeJuicio === bin}
            onClick={() => selAccion && onMatch(selAccion, bin)}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <i className={`fa-solid ${info.icono}`} style={{ color: bin === "buena" ? OK : NO }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((a) => (
                  <span key={a.id} style={{ animation: "hcolPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {a.texto}
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
        Cuatro afirmaciones sobre la nube y las herramientas colaborativas. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="hcol-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="hcol-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="hcol-btn" onClick={reintentar}>
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
