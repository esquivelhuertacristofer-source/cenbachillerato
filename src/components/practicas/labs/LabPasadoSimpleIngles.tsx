"use client";

/**
 * Laboratorio — Past Simple: what did you do yesterday?
 * Práctica experimental para IN-III-P01-A4 (Inglés III).
 *
 * Interactividad máxima: el alumno EXPERIMENTA arrastrando. Tres modos, tres
 * interacciones distintas (regla · forma · uso):
 *  1. «Regular or irregular?» — clasifica doce verbos en dos columnas según cómo
 *     forman su pasado (-ed vs. forma especial). La REGLA.
 *  2. «Build the past form» — arrastra la forma de pasado correcta a cada verbo
 *     base (go → went, study → studied…) evitando los errores típicos de
 *     sobre-regularización (eated, buyed, goed, maked). La FORMA.
 *  3. «Complete the sentence» — arrastra el verbo en pasado al hueco de cinco
 *     oraciones verbatim con expresiones de tiempo. El USO en contexto.
 *  + Cuestionario de comprensión (V/F verbatim de A4).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de IN-III·P01.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import {
  VERBOS,
  TIPO_INFO,
  FORMAS,
  DISTRACTORES_FORMA,
  ORACIONES,
  QUIZ,
  DATO_PASADO,
  type TipoVerbo,
} from "./pasado-simple-ingles-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-pasado-simple-reto";

type Modo = "clasificar" | "construir" | "oraciones";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "clasificar", label: "Regular or irregular?", icono: "fa-table-columns" },
  { id: "construir", label: "Build the past form", icono: "fa-screwdriver-wrench" },
  { id: "oraciones", label: "Complete the sentence", icono: "fa-pen-fancy" },
];

/** Fichas del modo «construir»: formas de pasado correctas + distractores. */
const FICHAS_CONSTRUIR: { id: string; label: string }[] = [
  ...FORMAS.map((f) => ({ id: f.id, label: f.pasado })),
  ...DISTRACTORES_FORMA.map((d, i) => ({ id: `xd-${i}`, label: d })),
];

export function LabPasadoSimpleIngles({ color }: PracticaLabProps) {
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

  // ── modo Regular or irregular? (clasifica por tipo) ────────────────────
  const [ubicado, setUbicado] = useState<Record<string, TipoVerbo>>({});
  const [selVerbo, setSelVerbo] = useState<string | null>(null);
  const [shakeBin, setShakeBin] = useState<TipoVerbo | null>(null);
  const verbosLibres = VERBOS.filter((v) => !ubicado[v.id]).slice().sort((a, b) => a.base.localeCompare(b.base, "en"));

  const intentarClasificar = (verboId: string, bin: TipoVerbo) => {
    if (ubicado[verboId]) return;
    const v = VERBOS.find((x) => x.id === verboId);
    if (v && v.tipo === bin) {
      setUbicado((e) => ({ ...e, [verboId]: bin }));
      setSelVerbo(null);
      sfxPlace();
      if (Object.keys(ubicado).length + 1 >= VERBOS.length) {
        sfxOk();
        persistMejor(true, construirDone, oracionesDone);
      }
    } else {
      setShakeBin(bin);
      sfxNo();
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };
  const resetClasificar = () => {
    setUbicado({});
    setSelVerbo(null);
  };

  // ── modo Build the past form (arrastra la forma correcta) ──────────────
  const [construido, setConstruido] = useState<Record<string, boolean>>({});
  const [selConstr, setSelConstr] = useState<string | null>(null);
  const [shakeConstr, setShakeConstr] = useState<string | null>(null);
  const fichasLibres = FICHAS_CONSTRUIR.filter((f) => !construido[f.id]).slice().sort((a, b) => a.label.localeCompare(b.label, "en"));

  const intentarConstruir = (chipId: string, rowId: string) => {
    if (construido[rowId]) return;
    if (chipId === rowId) {
      setConstruido((e) => ({ ...e, [rowId]: true }));
      setSelConstr(null);
      sfxPlace();
      if (Object.keys(construido).length + 1 >= FORMAS.length) {
        sfxOk();
        persistMejor(clasificarDone, true, oracionesDone);
      }
    } else {
      setShakeConstr(rowId);
      sfxNo();
      window.setTimeout(() => setShakeConstr(null), 420);
    }
  };
  const resetConstruir = () => {
    setConstruido({});
    setSelConstr(null);
  };

  // ── modo Complete the sentence (arrastra al hueco) ─────────────────────
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
        persistMejor(clasificarDone, construirDone, true);
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

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const clasificarDone = Object.keys(ubicado).length >= VERBOS.length;
  const construirDone = Object.keys(construido).length >= FORMAS.length;
  const oracionesDone = Object.keys(completado).length >= ORACIONES.length;
  const estrellas = (clasificarDone ? 1 : 0) + (construirDone ? 1 : 0) + (oracionesDone ? 1 : 0);

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
    { txt: "Clasifica los 12 verbos en regular / irregular", done: clasificarDone },
    { txt: "Forma los 6 pasados con la palabra correcta", done: construirDone },
    { txt: "Completa las 5 oraciones en contexto", done: oracionesDone },
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

  const resetActual = modo === "clasificar" ? resetClasificar : modo === "construir" ? resetConstruir : resetOraciones;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes pstShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes pstPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .pst-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .pst-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .pst-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .pst-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .pst-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .pst-icobtn:hover { background:rgba(255,255,255,0.12); }
        .pst-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:all .14s; user-select:none; }
        .pst-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .pst-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .pst-chip:active { cursor:grabbing; }
        .pst-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .pst-row[data-shake="true"] { animation:pstShake .4s; border-color:${NO}; }
        .pst-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .pst-slot { flex-shrink:0; min-width:88px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .pst-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .pst-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:220px; }
        .pst-bin[data-shake="true"] { animation:pstShake .4s; border-color:${NO}; }
        .pst-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .pst-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .pst-q:disabled{ cursor:default; }
        .pst-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .pst-btn:hover { border-color:${T.lineStrong}; }
        .pst-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .pst-row[data-shake="true"], .pst-bin[data-shake="true"] { animation:none; } }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="pst-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="pst-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="pst-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — Regular or irregular? */}
          {modo === "clasificar" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada verbo a su tipo de pasado</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: clasificarDone ? OK : T.text3 }}>
                    {Object.keys(ubicado).length}/{VERBOS.length}
                  </span>
                </div>
                {verbosLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los 12 verbos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {verbosLibres.map((v) => (
                      <button key={v.id} className="pst-chip" data-sel={selVerbo === v.id} onClick={() => setSelVerbo((s) => (s === v.id ? null : v.id))} {...dragProps(v.id)}>
                        {v.base}
                        <span style={{ fontSize: 10.5, fontWeight: 600, color: T.text3 }}>{v.es}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsClasificar selVerbo={selVerbo} shakeBin={shakeBin} ubicado={ubicado} onMatch={intentarClasificar} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — Build the past form */}
          {modo === "construir" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra la forma de pasado correcta a cada verbo</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: construirDone ? OK : T.text3 }}>
                    {Object.keys(construido).length}/{FORMAS.length}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
                  Cuidado: hay formas <strong style={{ color: T.text2 }}>incorrectas</strong> (eated, buyed, goed…) que no encajan en ninguna fila.
                </div>
                {fichasLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Formaste los 6 pasados!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {fichasLibres.map((f) => (
                      <button key={f.id} className="pst-chip" data-sel={selConstr === f.id} onClick={() => setSelConstr((s) => (s === f.id ? null : f.id))} {...dragProps(f.id)}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsConstruir selConstr={selConstr} shakeConstr={shakeConstr} construido={construido} onMatch={intentarConstruir} dropProps={dropProps} />
            </>
          )}

          {/* MODO 3 — Complete the sentence */}
          {modo === "oraciones" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra el verbo en pasado a cada hueco</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: oracionesDone ? OK : T.text3 }}>
                    {Object.keys(completado).length}/{ORACIONES.length}
                  </span>
                </div>
                {oraLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Completaste las 5 oraciones!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {oraLibres.map((o) => (
                      <button key={o.id} className="pst-chip" data-sel={selOra === o.id} onClick={() => setSelOra((s) => (s === o.id ? null : o.id))} {...dragProps(o.id)}>
                        {o.resp}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsOraciones selOra={selOra} shakeOra={shakeOra} completado={completado} onMatch={intentarOra} dropProps={dropProps} />
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

            <div className="pst-divider" />

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
                  {bestEstrellas >= 3 ? "You mastered the Past Simple!" : "Completa los tres modos para ganar las estrellas."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "clasificar" && (
                <>Regular → solo agrega <strong style={{ color: T.text }}>-ed</strong> (walk → walked). Irregular → forma especial (<strong style={{ color: T.text }}>go → went</strong>): hay que memorizarla.</>
              )}
              {modo === "construir" && (
                <>Nunca agregues <strong style={{ color: T.text }}>-ed</strong> a un irregular: es <strong style={{ color: T.text }}>ate</strong>, no «eated»; <strong style={{ color: T.text }}>went</strong>, no «goed».</>
              )}
              {modo === "oraciones" && (
                <>Las expresiones <strong style={{ color: T.text }}>yesterday, last week, two days ago, in 2020</strong> piden el verbo en pasado.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_PASADO}</span>
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
  selVerbo,
  shakeBin,
  ubicado,
  onMatch,
  dropProps,
}: {
  selVerbo: string | null;
  shakeBin: TipoVerbo | null;
  ubicado: Record<string, TipoVerbo>;
  onMatch: (verboId: string, bin: TipoVerbo) => void;
  dropProps: DropFactory;
}) {
  const bins: TipoVerbo[] = ["regular", "irregular"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {bins.map((bin) => {
        const info = TIPO_INFO[bin];
        const dentro = VERBOS.filter((v) => ubicado[v.id] === bin);
        return (
          <div
            key={bin}
            className="pst-bin"
            data-shake={shakeBin === bin}
            onClick={() => selVerbo && onMatch(selVerbo, bin)}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <i className={`fa-solid ${info.icono}`} style={{ color: T.text2 }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 4 }}>{info.subtitulo}</div>
            <div style={{ fontSize: 10.5, color: T.text3, fontStyle: "italic", marginBottom: 12 }}>{info.ejemplo}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((v) => (
                  <span key={v.id} style={{ animation: "pstPop .25s ease", display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 999, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 13.5, fontWeight: 800, color: "#fff" }}>
                    {v.base}
                    <i className="fa-solid fa-arrow-right-long" style={{ fontSize: 10, color: T.text3 }} />
                    {v.pasado}
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

function RowsConstruir({
  selConstr,
  shakeConstr,
  construido,
  onMatch,
  dropProps,
}: {
  selConstr: string | null;
  shakeConstr: string | null;
  construido: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {FORMAS.map((f) => {
        const done = construido[f.id];
        return (
          <div
            key={f.id}
            className="pst-row"
            data-shake={shakeConstr === f.id}
            data-done={done}
            onClick={() => !done && selConstr && onMatch(selConstr, f.id)}
            {...dropProps((id) => onMatch(id, f.id))}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, color: done ? "#fff" : T.text2, lineHeight: 1.4, display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700 }}>{f.base}</span>
                <i className="fa-solid fa-arrow-right-long" style={{ fontSize: 12, color: T.text3 }} />
                {done ? (
                  <span style={{ animation: "pstPop .25s ease", fontWeight: 900, color: OK }}>{f.pasado}</span>
                ) : (
                  <span className="pst-slot" data-armed={!!selConstr}>
                    <i className="fa-solid fa-arrow-down" style={{ fontSize: 11 }} />
                  </span>
                )}
              </div>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, border: `1px solid ${T.line}`, borderRadius: 6, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 }}>
              {f.tipo}
            </span>
            {done && (
              <div style={{ flexBasis: "100%", fontSize: 12, color: T.text3, lineHeight: 1.45, display: "flex", gap: 8 }}>
                <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 2 }} />
                <span>{f.nota}</span>
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
            className="pst-row"
            data-shake={shakeOra === o.id}
            data-done={done}
            onClick={() => !done && selOra && onMatch(selOra, o.id)}
            {...dropProps((id) => onMatch(id, o.id))}
          >
            <div style={{ fontSize: 14.5, color: done ? "#fff" : T.text2, lineHeight: 1.6, display: "inline-flex", alignItems: "center", gap: 7, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
              <span>{o.antes}</span>
              {done ? (
                <span style={{ animation: "pstPop .25s ease", fontWeight: 900, color: OK }}>{o.resp}</span>
              ) : (
                <span className="pst-slot" data-armed={!!selOra} style={{ minWidth: 96 }}>
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
        Cinco afirmaciones sobre el pasado simple. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="pst-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="pst-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="pst-btn" onClick={reintentar}>
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
