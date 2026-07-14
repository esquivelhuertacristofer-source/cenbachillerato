"use client";

/**
 * Laboratorio — Advice in English: should, shouldn't and imperatives
 * Práctica experimental para IN-IV-P04-A1 (Inglés IV — A2+).
 *
 * Interactividad máxima: el alumno EXPERIMENTA arrastrando. Tres modos, tres
 * interacciones distintas (forma · uso · estructura):
 *  1. «Should, shouldn't or imperative?» — clasifica nueve oraciones de consejo
 *     en tres columnas según su forma (should / shouldn't / imperative). La FORMA.
 *  2. «Complete the advice» — arrastra la forma correcta a cada hueco de los
 *     ejemplos (should, shouldn't, Don't, should) evitando los distractores
 *     (should to, must, shoulds, musn't). El USO en contexto.
 *  3. «Match the structure» — empareja cada estructura del glosario A5 con su
 *     definición. Las ESTRUCTURAS para dar y pedir consejos con empatía.
 *  + Cuestionario de comprensión (V/F verbatim de A4, ampliado con A2).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de IN-IV·P04.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import {
  ORACIONES,
  FORMA_INFO,
  HUECOS,
  DISTRACTORES_HUECO,
  PARES,
  QUIZ,
  DATO_CONSEJOS,
  type Forma,
} from "./consejos-ingles-data";

const NO = "#FF5E5E";
import { guardarEstrellas } from "@/app/actions/guardarEstrellas";
const RETO_KEY = "cen-consejos-ingles-reto";

type Modo = "clasificar" | "completar" | "glosario";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "clasificar", label: "Should, shouldn't or imperative?", icono: "fa-layer-group" },
  { id: "completar", label: "Complete the advice", icono: "fa-pen-fancy" },
  { id: "glosario", label: "Match the structure", icono: "fa-book-open" },
];

/** Fichas del modo «completar»: formas correctas + distractores. */
const FICHAS_HUECO: { id: string; label: string }[] = [
  ...HUECOS.map((h) => ({ id: h.id, label: h.resp })),
  ...DISTRACTORES_HUECO.map((d, i) => ({ id: `xd-${i}`, label: d })),
];

export function LabConsejosIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("clasificar");

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

  // ── modo Should, shouldn't or imperative? (clasifica por forma) ────────
  const [ubicado, setUbicado] = useState<Record<string, Forma>>({});
  const [selOracion, setSelOracion] = useState<string | null>(null);
  const [shakeBin, setShakeBin] = useState<Forma | null>(null);
  const oracionesLibres = ORACIONES.filter((o) => !ubicado[o.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarClasificar = (oracionId: string, bin: Forma) => {
    if (ubicado[oracionId]) return;
    const o = ORACIONES.find((x) => x.id === oracionId);
    if (o && o.forma === bin) {
      setUbicado((e) => ({ ...e, [oracionId]: bin }));
      setSelOracion(null);
      sfxPlace();
      if (Object.keys(ubicado).length + 1 >= ORACIONES.length) {
        sfxOk();
        persistMejor(true, completarDone, glosarioDone);
      }
    } else {
      setShakeBin(bin);
      sfxNo();
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };
  const resetClasificar = () => {
    setUbicado({});
    setSelOracion(null);
  };

  // ── modo Complete the advice (arrastra al hueco) ───────────────────────
  const [completado, setCompletado] = useState<Record<string, boolean>>({});
  const [selFicha, setSelFicha] = useState<string | null>(null);
  const [shakeHueco, setShakeHueco] = useState<string | null>(null);
  const fichasLibres = FICHAS_HUECO.filter((f) => !completado[f.id]).slice().sort((a, b) => a.label.localeCompare(b.label, "es"));

  const intentarCompletar = (chipId: string, rowId: string) => {
    if (completado[rowId]) return;
    if (chipId === rowId) {
      setCompletado((e) => ({ ...e, [rowId]: true }));
      setSelFicha(null);
      sfxPlace();
      if (Object.keys(completado).length + 1 >= HUECOS.length) {
        sfxOk();
        persistMejor(clasificarDone, true, glosarioDone);
      }
    } else {
      setShakeHueco(rowId);
      sfxNo();
      window.setTimeout(() => setShakeHueco(null), 420);
    }
  };
  const resetCompletar = () => {
    setCompletado({});
    setSelFicha(null);
  };

  // ── modo Match the structure (empareja término → definición) ───────────
  const [empGlos, setEmpGlos] = useState<Record<string, boolean>>({});
  const [selGlos, setSelGlos] = useState<string | null>(null);
  const [shakeGlos, setShakeGlos] = useState<string | null>(null);
  const glosLibres = PARES.filter((g) => !empGlos[g.id]).slice().sort((a, b) => a.termino.localeCompare(b.termino, "es"));

  const intentarGlos = (chipId: string, rowId: string) => {
    if (empGlos[rowId]) return;
    if (chipId === rowId) {
      setEmpGlos((e) => ({ ...e, [rowId]: true }));
      setSelGlos(null);
      sfxPlace();
      if (Object.keys(empGlos).length + 1 >= PARES.length) {
        sfxOk();
        persistMejor(clasificarDone, completarDone, true);
      }
    } else {
      setShakeGlos(rowId);
      sfxNo();
      window.setTimeout(() => setShakeGlos(null), 420);
    }
  };
  const resetGlosario = () => {
    setEmpGlos({});
    setSelGlos(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const clasificarDone = Object.keys(ubicado).length >= ORACIONES.length;
  const completarDone = Object.keys(completado).length >= HUECOS.length;
  const glosarioDone = Object.keys(empGlos).length >= PARES.length;
  const estrellas = (clasificarDone ? 1 : 0) + (completarDone ? 1 : 0) + (glosarioDone ? 1 : 0);

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
    void guardarEstrellas(RETO_KEY, est);
  };

  const objetivos = [
    { txt: "Clasifica las 9 oraciones por su forma (should / shouldn't / imperative)", done: clasificarDone },
    { txt: "Completa los 4 huecos de los consejos en contexto", done: completarDone },
    { txt: "Empareja las 6 estructuras del glosario", done: glosarioDone },
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

  const resetActual = modo === "clasificar" ? resetClasificar : modo === "completar" ? resetCompletar : resetGlosario;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes advShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes advPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .adv-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .adv-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .adv-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .adv-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .adv-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .adv-icobtn:hover { background:rgba(255,255,255,0.12); }
        .adv-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13.5px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .adv-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .adv-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .adv-chip:active { cursor:grabbing; }
        .adv-chip-sm { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:all .14s; user-select:none; }
        .adv-chip-sm:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .adv-chip-sm[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .adv-chip-sm:active { cursor:grabbing; }
        .adv-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .adv-row[data-shake="true"] { animation:advShake .4s; border-color:${NO}; }
        .adv-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .adv-slot { flex-shrink:0; min-width:96px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .adv-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .adv-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:240px; }
        .adv-bin[data-shake="true"] { animation:advShake .4s; border-color:${NO}; }
        .adv-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .adv-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .adv-q:disabled{ cursor:default; }
        .adv-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .adv-btn:hover { border-color:${T.lineStrong}; }
        .adv-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .adv-row[data-shake="true"], .adv-bin[data-shake="true"] { animation:none; } }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="adv-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="adv-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="adv-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — Should, shouldn't or imperative? */}
          {modo === "clasificar" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada consejo a su forma</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: clasificarDone ? OK : T.text3 }}>
                    {Object.keys(ubicado).length}/{ORACIONES.length}
                  </span>
                </div>
                {oracionesLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {ORACIONES.length} oraciones!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {oracionesLibres.map((o) => (
                      <button key={o.id} className="adv-chip" data-sel={selOracion === o.id} onClick={() => setSelOracion((s) => (s === o.id ? null : o.id))} {...dragProps(o.id)}>
                        {o.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsClasificar selOracion={selOracion} shakeBin={shakeBin} ubicado={ubicado} onMatch={intentarClasificar} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — Complete the advice */}
          {modo === "completar" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra la forma correcta a cada hueco</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: completarDone ? OK : T.text3 }}>
                    {Object.keys(completado).length}/{HUECOS.length}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
                  Cuidado: hay formas <strong style={{ color: T.text2 }}>incorrectas</strong> (should to, must, shoulds, musn&apos;t) que no encajan en ningún hueco.
                </div>
                {fichasLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Completaste los {HUECOS.length} huecos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {fichasLibres.map((f) => (
                      <button key={f.id} className="adv-chip-sm" data-sel={selFicha === f.id} onClick={() => setSelFicha((s) => (s === f.id ? null : f.id))} {...dragProps(f.id)}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsCompletar selFicha={selFicha} shakeHueco={shakeHueco} completado={completado} onMatch={intentarCompletar} dropProps={dropProps} />
            </>
          )}

          {/* MODO 3 — Match the structure */}
          {modo === "glosario" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada estructura a su definición</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: glosarioDone ? OK : T.text3 }}>
                    {Object.keys(empGlos).length}/{PARES.length}
                  </span>
                </div>
                {glosLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {PARES.length} estructuras!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {glosLibres.map((g) => (
                      <button key={g.id} className="adv-chip" data-sel={selGlos === g.id} onClick={() => setSelGlos((s) => (s === g.id ? null : g.id))} {...dragProps(g.id)}>
                        <i className="fa-solid fa-quote-left" style={{ fontSize: 11, color: T.text3 }} />
                        {g.termino}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsGlosario selGlos={selGlos} shakeGlos={shakeGlos} empGlos={empGlos} onMatch={intentarGlos} dropProps={dropProps} />
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

            <div className="adv-divider" />

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
                  {bestEstrellas >= 3 ? "You can give advice like a pro!" : "Completa los tres modos para ganar las estrellas."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "clasificar" && (
                <><strong style={{ color: T.text }}>Should</strong> + verbo base recomienda una acción; <strong style={{ color: T.text }}>shouldn&apos;t</strong> + verbo base aconseja en contra; el <strong style={{ color: T.text }}>imperativo</strong> da una instrucción directa (con o sin <strong style={{ color: T.text }}>Don&apos;t</strong>).</>
              )}
              {modo === "completar" && (
                <>Recuerda: <strong style={{ color: T.text }}>should</strong> y <strong style={{ color: T.text }}>shouldn&apos;t</strong> van con el verbo base SIN <strong style={{ color: T.text }}>to</strong>; el imperativo negativo empieza por <strong style={{ color: T.text }}>Don&apos;t</strong>.</>
              )}
              {modo === "glosario" && (
                <>Lee la definición y su ejemplo; luego suelta la estructura que le corresponde para dar o pedir un consejo con empatía.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_CONSEJOS}</span>
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

function BinsClasificar({
  selOracion,
  shakeBin,
  ubicado,
  onMatch,
  dropProps,
}: {
  selOracion: string | null;
  shakeBin: Forma | null;
  ubicado: Record<string, Forma>;
  onMatch: (oracionId: string, bin: Forma) => void;
  dropProps: DropFactory;
}) {
  const bins: Forma[] = ["should", "shouldnt", "imperative"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = FORMA_INFO[bin];
        const dentro = ORACIONES.filter((o) => ubicado[o.id] === bin);
        return (
          <div
            key={bin}
            className="adv-bin"
            data-shake={shakeBin === bin}
            onClick={() => selOracion && onMatch(selOracion, bin)}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <i className={`fa-solid ${info.icono}`} style={{ color: T.text2 }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 4, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ fontSize: 10.5, color: T.text3, fontStyle: "italic", marginBottom: 12 }}>{info.ejemplo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((o) => (
                  <span key={o.id} style={{ animation: "advPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {o.texto}
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

function RowsCompletar({
  selFicha,
  shakeHueco,
  completado,
  onMatch,
  dropProps,
}: {
  selFicha: string | null;
  shakeHueco: string | null;
  completado: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {HUECOS.map((h) => {
        const done = completado[h.id];
        return (
          <div
            key={h.id}
            className="adv-row"
            data-shake={shakeHueco === h.id}
            data-done={done}
            onClick={() => !done && selFicha && onMatch(selFicha, h.id)}
            {...dropProps((id) => onMatch(id, h.id))}
          >
            <div style={{ fontSize: 14.5, color: done ? "#fff" : T.text2, lineHeight: 1.6, display: "inline-flex", alignItems: "center", gap: 7, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
              {h.antes && <span>{h.antes}</span>}
              {done ? (
                <span style={{ animation: "advPop .25s ease", fontWeight: 900, color: OK }}>{h.resp}</span>
              ) : (
                <span className="adv-slot" data-armed={!!selFicha} style={{ minWidth: 96 }}>
                  <i className="fa-solid fa-arrow-down" style={{ fontSize: 11 }} />
                </span>
              )}
              <span>{h.despues}</span>
            </div>
            {!done && (
              <span style={{ fontSize: 11, color: T.text3, fontStyle: "italic", flexShrink: 0, maxWidth: 220, lineHeight: 1.4 }}>{h.pista}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RowsGlosario({
  selGlos,
  shakeGlos,
  empGlos,
  onMatch,
  dropProps,
}: {
  selGlos: string | null;
  shakeGlos: string | null;
  empGlos: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PARES.map((g) => {
        const done = empGlos[g.id];
        return (
          <div
            key={g.id}
            className="adv-row"
            data-shake={shakeGlos === g.id}
            data-done={done}
            onClick={() => !done && selGlos && onMatch(selGlos, g.id)}
            {...dropProps((id) => onMatch(id, g.id))}
          >
            <div className="adv-slot" data-armed={!done && !!selGlos} style={{ minWidth: 200, ...(done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : {}) }}>
              {done ? (
                <span style={{ animation: "advPop .25s ease", fontSize: 12.5, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7, lineHeight: 1.35 }}>
                  <i className="fa-solid fa-quote-left" />
                  {g.termino}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> estructura
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>{g.definicion}</div>
              <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.4, marginTop: 3, fontStyle: "italic" }}>{g.ejemplo}</div>
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
        Siete afirmaciones sobre cómo dar y pedir consejos en inglés (should, shouldn&apos;t e imperativos). Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="adv-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="adv-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="adv-btn" onClick={reintentar}>
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
