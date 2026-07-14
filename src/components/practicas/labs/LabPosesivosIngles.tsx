"use client";

/**
 * Laboratorio — Possession: mine or yours?
 * Práctica experimental para IN-I-P08-A4 (Inglés I).
 *
 * Interactividad máxima: el alumno EXPERIMENTA arrastrando. Tres modos, tres
 * interacciones distintas:
 *  1. «Saxon genitive» — arrastra el marcador correcto ('s singular / ' plural)
 *     al hueco tras el poseedor para formar el genitivo sajón.
 *  2. «Complete the sentence» — arrastra el posesivo o genitivo adecuado al
 *     hueco de cada oración según el contexto (¿va antes de un sustantivo o solo?).
 *  3. «Adjective or pronoun?» — clasifica diez posesivos en dos columnas:
 *     adjetivo posesivo (va antes de un sustantivo) vs pronombre posesivo (va solo).
 *  + Cuestionario de comprensión.
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de IN-I·P08
 * (A1 lectura, A2 fill_blanks, A4 quiz, A5 V/F, A6 glosario).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import {
  GENITIVOS,
  MARCADORES,
  ORACIONES,
  POSESIVOS,
  BIN_INFO,
  QUIZ,
  DATO_POSESION,
  type BinPos,
} from "./posesivos-ingles-data";

const NO = "#FF5E5E";
import { guardarEstrellas } from "@/app/actions/guardarEstrellas";
const RETO_KEY = "cen-posesivos-ingles-reto";

type Modo = "genitivo" | "oraciones" | "clasifica";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "genitivo", label: "Saxon genitive", icono: "fa-quote-right" },
  { id: "oraciones", label: "Complete the sentence", icono: "fa-pen-fancy" },
  { id: "clasifica", label: "Adjective or pronoun?", icono: "fa-table-columns" },
];

export function LabPosesivosIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("genitivo");

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

  // ── modo Saxon genitive (arrastra el marcador correcto) ───────────────
  const [marcado, setMarcado] = useState<Record<string, boolean>>({});
  const [selMarker, setSelMarker] = useState<string | null>(null); // label "'s" | "'"
  const [shakeGen, setShakeGen] = useState<string | null>(null);

  const intentarGen = (markerLabel: string, rowId: string) => {
    if (marcado[rowId]) return;
    const row = GENITIVOS.find((g) => g.id === rowId);
    if (row && markerLabel === row.marker) {
      setMarcado((e) => ({ ...e, [rowId]: true }));
      setSelMarker(null);
      sfxPlace();
      if (Object.keys(marcado).length + 1 >= GENITIVOS.length) {
        sfxOk();
        persistMejor(true, oracionesDone, clasificaDone);
      }
    } else {
      setShakeGen(rowId);
      sfxNo();
      window.setTimeout(() => setShakeGen(null), 420);
    }
  };
  const resetGenitivo = () => {
    setMarcado({});
    setSelMarker(null);
  };

  // ── modo Complete the sentence (arrastra la palabra al hueco) ──────────
  const [completado, setCompletado] = useState<Record<string, boolean>>({});
  const [selOra, setSelOra] = useState<string | null>(null);
  const [shakeOra, setShakeOra] = useState<string | null>(null);
  const oraLibres = ORACIONES.filter((o) => !completado[o.id]).slice().sort((a, b) => a.resp.localeCompare(b.resp, "en"));

  const intentarOra = (chipId: string, rowId: string) => {
    if (completado[rowId]) return;
    if (chipId === rowId) {
      setCompletado((e) => ({ ...e, [rowId]: true }));
      setSelOra(null);
      sfxPlace();
      if (Object.keys(completado).length + 1 >= ORACIONES.length) {
        sfxOk();
        persistMejor(genitivoDone, true, clasificaDone);
      }
    } else {
      setShakeOra(rowId);
      sfxNo();
      window.setTimeout(() => setShakeOra(null), 420);
    }
  };
  const resetOraciones = () => {
    setCompletado({});
    setSelOra(null);
  };

  // ── modo Adjective or pronoun (clasifica en dos columnas) ──────────────
  const [ubicado, setUbicado] = useState<Record<string, BinPos>>({});
  const [selPos, setSelPos] = useState<string | null>(null);
  const [shakeBin, setShakeBin] = useState<BinPos | null>(null);
  const posLibres = POSESIVOS.filter((p) => !ubicado[p.id]).slice().sort((a, b) => a.palabra.localeCompare(b.palabra, "en"));

  const intentarPos = (posId: string, bin: BinPos) => {
    if (ubicado[posId]) return;
    const p = POSESIVOS.find((x) => x.id === posId);
    if (p && p.bin === bin) {
      setUbicado((e) => ({ ...e, [posId]: bin }));
      setSelPos(null);
      sfxPlace();
      if (Object.keys(ubicado).length + 1 >= POSESIVOS.length) {
        sfxOk();
        persistMejor(genitivoDone, oracionesDone, true);
      }
    } else {
      setShakeBin(bin);
      sfxNo();
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };
  const resetClasifica = () => {
    setUbicado({});
    setSelPos(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const genitivoDone = Object.keys(marcado).length >= GENITIVOS.length;
  const oracionesDone = Object.keys(completado).length >= ORACIONES.length;
  const clasificaDone = Object.keys(ubicado).length >= POSESIVOS.length;
  const estrellas = (genitivoDone ? 1 : 0) + (oracionesDone ? 1 : 0) + (clasificaDone ? 1 : 0);

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
    { txt: "Forma los 4 genitivos sajones con el marcador correcto", done: genitivoDone },
    { txt: "Completa las 8 oraciones con el posesivo adecuado", done: oracionesDone },
    { txt: "Clasifica los 10 posesivos (adjetivo / pronombre)", done: clasificaDone },
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

  const resetActual = modo === "genitivo" ? resetGenitivo : modo === "oraciones" ? resetOraciones : resetClasifica;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes posShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes posPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .pos-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .pos-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .pos-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .pos-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .pos-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .pos-icobtn:hover { background:rgba(255,255,255,0.12); }
        .pos-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:all .14s; user-select:none; }
        .pos-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .pos-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .pos-chip:active { cursor:grabbing; }
        .pos-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .pos-row[data-shake="true"] { animation:posShake .4s; border-color:${NO}; }
        .pos-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .pos-slot { flex-shrink:0; min-width:64px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .pos-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .pos-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:190px; }
        .pos-bin[data-shake="true"] { animation:posShake .4s; border-color:${NO}; }
        .pos-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .pos-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .pos-q:disabled{ cursor:default; }
        .pos-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .pos-btn:hover { border-color:${T.lineStrong}; }
        .pos-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .pos-row[data-shake="true"], .pos-bin[data-shake="true"] { animation:none; } }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="pos-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="pos-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="pos-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — Saxon genitive */}
          {modo === "genitivo" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra el marcador correcto tras el poseedor</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: genitivoDone ? OK : T.text3 }}>
                    {Object.keys(marcado).length}/{GENITIVOS.length}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
                  Usa <strong style={{ color: T.text2 }}>&apos;s</strong> con un poseedor singular y solo <strong style={{ color: T.text2 }}>&apos;</strong> con un plural que ya termina en s.
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {MARCADORES.map((m) => (
                    <button key={m.id} className="pos-chip" data-sel={selMarker === m.label} onClick={() => setSelMarker((s) => (s === m.label ? null : m.label))} {...dragProps(m.label)} style={{ minWidth: 120 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 16 }}>{m.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.text3 }}>{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <RowsGenitivo selMarker={selMarker} shakeGen={shakeGen} marcado={marcado} onMatch={intentarGen} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — Complete the sentence */}
          {modo === "oraciones" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra el posesivo adecuado a cada hueco</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: oracionesDone ? OK : T.text3 }}>
                    {Object.keys(completado).length}/{ORACIONES.length}
                  </span>
                </div>
                {oraLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Completaste las 8 oraciones!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {oraLibres.map((o) => (
                      <button key={o.id} className="pos-chip" data-sel={selOra === o.id} onClick={() => setSelOra((s) => (s === o.id ? null : o.id))} {...dragProps(o.id)}>
                        {o.resp}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsOraciones selOra={selOra} shakeOra={shakeOra} completado={completado} onMatch={intentarOra} dropProps={dropProps} />
            </>
          )}

          {/* MODO 3 — Adjective or pronoun */}
          {modo === "clasifica" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada posesivo a su columna</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: clasificaDone ? OK : T.text3 }}>
                    {Object.keys(ubicado).length}/{POSESIVOS.length}
                  </span>
                </div>
                {posLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los 10 posesivos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {posLibres.map((p) => (
                      <button key={p.id} className="pos-chip" data-sel={selPos === p.id} onClick={() => setSelPos((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                        {p.palabra}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsClasifica selPos={selPos} shakeBin={shakeBin} ubicado={ubicado} onMatch={intentarPos} dropProps={dropProps} />
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

            <div className="pos-divider" />

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
                  {bestEstrellas >= 3 ? "You mastered possession in English!" : "Completa los tres modos para ganar las estrellas."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "genitivo" && (
                <><strong style={{ color: T.text }}>Ana&apos;s book</strong> = el libro de Ana. Si el poseedor es plural y termina en s (<strong style={{ color: T.text }}>the students</strong>), solo añades el apóstrofo: <strong style={{ color: T.text }}>the students&apos; notebooks</strong>.</>
              )}
              {modo === "oraciones" && (
                <>¿Hay un sustantivo después? Usa un <strong style={{ color: T.text }}>adjetivo</strong> (my, his, our…). ¿Va solo? Usa un <strong style={{ color: T.text }}>pronombre</strong> (mine, hers…). <strong style={{ color: T.text }}>Whose…?</strong> pregunta de quién es.</>
              )}
              {modo === "clasifica" && (
                <><strong style={{ color: T.text }}>my book</strong> (adjetivo + sustantivo) vs <strong style={{ color: T.text }}>it&apos;s mine</strong> (pronombre solo). Nota: <strong style={{ color: T.text }}>his</strong> es idéntico en ambas formas.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_POSESION}</span>
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

function RowsGenitivo({
  selMarker,
  shakeGen,
  marcado,
  onMatch,
  dropProps,
}: {
  selMarker: string | null;
  shakeGen: string | null;
  marcado: Record<string, boolean>;
  onMatch: (markerLabel: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {GENITIVOS.map((g) => {
        const done = marcado[g.id];
        return (
          <div
            key={g.id}
            className="pos-row"
            data-shake={shakeGen === g.id}
            data-done={done}
            onClick={() => !done && selMarker && onMatch(selMarker, g.id)}
            {...dropProps((id) => onMatch(id, g.id))}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 5 }}>{g.es}</div>
              <div style={{ fontSize: 15.5, color: done ? "#fff" : T.text2, lineHeight: 1.4, display: "inline-flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700 }}>{g.dueno}</span>
                {done ? (
                  <span style={{ animation: "posPop .25s ease", fontWeight: 900, color: OK, fontFamily: "monospace" }}>{g.marker}</span>
                ) : (
                  <span className="pos-slot" data-armed={!!selMarker}>
                    <i className="fa-solid fa-arrow-down" style={{ fontSize: 11 }} />
                  </span>
                )}
                <span style={{ marginLeft: 4 }}>{g.noun}</span>
              </div>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: g.plural ? "#FFC75A" : T.text3, border: `1px solid ${g.plural ? "#FFC75A55" : T.line}`, borderRadius: 6, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 }}>
              {g.plural ? "plural" : "singular"}
            </span>
            {done && (
              <div style={{ flexBasis: "100%", fontSize: 12, color: T.text3, lineHeight: 1.45, display: "flex", gap: 8 }}>
                <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 2 }} />
                <span>{g.regla}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RowsOraciones({
  selOra,
  shakeOra,
  completado,
  onMatch,
  dropProps,
}: {
  selOra: string | null;
  shakeOra: string | null;
  completado: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {ORACIONES.map((o) => {
        const done = completado[o.id];
        return (
          <div
            key={o.id}
            className="pos-row"
            data-shake={shakeOra === o.id}
            data-done={done}
            onClick={() => !done && selOra && onMatch(selOra, o.id)}
            {...dropProps((id) => onMatch(id, o.id))}
          >
            <div style={{ fontSize: 14.5, color: done ? "#fff" : T.text2, lineHeight: 1.6, display: "inline-flex", alignItems: "center", gap: 7, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
              {o.antes && <span>{o.antes}</span>}
              {done ? (
                <span style={{ animation: "posPop .25s ease", fontWeight: 900, color: OK }}>{o.resp}</span>
              ) : (
                <span className="pos-slot" data-armed={!!selOra} style={{ minWidth: 76 }}>
                  <i className="fa-solid fa-arrow-down" style={{ fontSize: 11 }} />
                </span>
              )}
              <span>{o.despues}</span>
            </div>
            {!done && (
              <span style={{ fontSize: 11, color: T.text3, fontStyle: "italic", flexShrink: 0 }}>{o.nota}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BinsClasifica({
  selPos,
  shakeBin,
  ubicado,
  onMatch,
  dropProps,
}: {
  selPos: string | null;
  shakeBin: BinPos | null;
  ubicado: Record<string, BinPos>;
  onMatch: (posId: string, bin: BinPos) => void;
  dropProps: DropFactory;
}) {
  const bins: BinPos[] = ["adj", "pron"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {bins.map((bin) => {
        const info = BIN_INFO[bin];
        const dentro = POSESIVOS.filter((p) => ubicado[p.id] === bin);
        return (
          <div
            key={bin}
            className="pos-bin"
            data-shake={shakeBin === bin}
            onClick={() => selPos && onMatch(selPos, bin)}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <i className={`fa-solid ${info.icono}`} style={{ color: T.text2 }} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 4 }}>{info.subtitulo}</div>
            <div style={{ fontSize: 11, color: T.text3, fontStyle: "italic", marginBottom: 12 }}>{info.ejemplo}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((p) => (
                  <span key={p.id} style={{ animation: "posPop .25s ease", display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 999, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 13.5, fontWeight: 800, color: "#fff" }}>
                    {p.palabra}
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: T.text3 }}>{p.es}</span>
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
        Cinco preguntas sobre el genitivo sajón y los pronombres posesivos. Responde y pulsa «Comprobar».
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
                    <button key={oi} className="pos-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="pos-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="pos-btn" onClick={reintentar}>
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
