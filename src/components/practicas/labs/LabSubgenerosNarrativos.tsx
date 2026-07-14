"use client";

/**
 * Laboratorio — Subgéneros narrativos: del suspenso al Antropoceno
 * Práctica experimental para LC-III-P04-A1 (Lenguaje y Comunicación III).
 *
 * Interactividad máxima: el alumno EXPERIMENTA arrastrando. Tres modos, tres
 * interacciones distintas:
 *  1. «¿A qué subgénero pertenece?» — clasifica doce obras y rasgos entre los
 *     seis subgéneros narrativos de la fuente (suspenso, terror, ciencia
 *     ficción, autoficción, neorrealismo urbano y literaturas del Antropoceno).
 *  2. «El rasgo de cada subgénero» — empareja cada subgénero con su rasgo
 *     definitorio (verbatim de la lectura A1).
 *  3. «Empareja término y definición» — arrastra cada concepto del glosario a
 *     su definición verbatim (A5).
 *  + Cuestionario de comprensión (V/F verbatim de A4).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de LC-III·P04.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import {
  OBRAS,
  SUBGENERO_INFO,
  RASGOS,
  PARES,
  QUIZ,
  DATO_SUBGENEROS,
  type Subgenero,
} from "./subgeneros-narrativos-data";

const NO = "#FF5E5E";
import { guardarEstrellas } from "@/app/actions/guardarEstrellas";
const RETO_KEY = "cen-subgeneros-narrativos-reto";

type Modo = "obras" | "rasgos" | "glosario";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "obras", label: "¿A qué subgénero pertenece?", icono: "fa-book-open-reader" },
  { id: "rasgos", label: "El rasgo de cada subgénero", icono: "fa-list-check" },
  { id: "glosario", label: "Empareja término y definición", icono: "fa-book-open" },
];

export function LabSubgenerosNarrativos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("obras");

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

  // ── modo obras (clasifica por subgénero) ───────────────────────────────
  const [ubicObra, setUbicObra] = useState<Record<string, Subgenero>>({});
  const [selObra, setSelObra] = useState<string | null>(null);
  const [shakeObra, setShakeObra] = useState<Subgenero | null>(null);
  const obrasLibres = OBRAS.filter((o) => !ubicObra[o.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarObra = (obraId: string, bin: Subgenero) => {
    if (ubicObra[obraId]) return;
    const o = OBRAS.find((x) => x.id === obraId);
    if (o && o.subgenero === bin) {
      setUbicObra((e) => ({ ...e, [obraId]: bin }));
      setSelObra(null);
      sfxPlace();
      if (Object.keys(ubicObra).length + 1 >= OBRAS.length) {
        sfxOk();
        persistMejor(true, rasgosDone, glosarioDone);
      }
    } else {
      setShakeObra(bin);
      sfxNo();
      window.setTimeout(() => setShakeObra(null), 420);
    }
  };
  const resetObras = () => {
    setUbicObra({});
    setSelObra(null);
  };

  // ── modo rasgos (empareja subgénero → rasgo) ───────────────────────────
  const [empRasgo, setEmpRasgo] = useState<Record<string, boolean>>({});
  const [selRasgo, setSelRasgo] = useState<string | null>(null);
  const [shakeRasgo, setShakeRasgo] = useState<string | null>(null);
  const rasgosLibres = RASGOS.filter((r) => !empRasgo[r.id]).slice().sort((a, b) => a.subgenero.localeCompare(b.subgenero, "es"));

  const intentarRasgo = (chipId: string, rowId: string) => {
    if (empRasgo[rowId]) return;
    if (chipId === rowId) {
      setEmpRasgo((e) => ({ ...e, [rowId]: true }));
      setSelRasgo(null);
      sfxPlace();
      if (Object.keys(empRasgo).length + 1 >= RASGOS.length) {
        sfxOk();
        persistMejor(obrasDone, true, glosarioDone);
      }
    } else {
      setShakeRasgo(rowId);
      sfxNo();
      window.setTimeout(() => setShakeRasgo(null), 420);
    }
  };
  const resetRasgos = () => {
    setEmpRasgo({});
    setSelRasgo(null);
  };

  // ── modo glosario (empareja término → definición) ──────────────────────
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
        persistMejor(obrasDone, rasgosDone, true);
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
  const obrasDone = Object.keys(ubicObra).length >= OBRAS.length;
  const rasgosDone = Object.keys(empRasgo).length >= RASGOS.length;
  const glosarioDone = Object.keys(empGlos).length >= PARES.length;
  const estrellas = (obrasDone ? 1 : 0) + (rasgosDone ? 1 : 0) + (glosarioDone ? 1 : 0);

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
    { txt: `Clasifica las ${OBRAS.length} obras y rasgos por subgénero`, done: obrasDone },
    { txt: `Empareja los ${RASGOS.length} subgéneros con su rasgo`, done: rasgosDone },
    { txt: `Empareja los ${PARES.length} términos del glosario`, done: glosarioDone },
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

  const resetActual = modo === "obras" ? resetObras : modo === "rasgos" ? resetRasgos : resetGlosario;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes snShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes snPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .sn-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .sn-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .sn-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .sn-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .sn-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .sn-icobtn:hover { background:rgba(255,255,255,0.12); }
        .sn-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13.5px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .sn-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .sn-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .sn-chip:active { cursor:grabbing; }
        .sn-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .sn-row[data-shake="true"] { animation:snShake .4s; border-color:${NO}; }
        .sn-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .sn-slot { flex-shrink:0; min-width:190px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .sn-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .sn-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:200px; }
        .sn-bin[data-shake="true"] { animation:snShake .4s; border-color:${NO}; }
        .sn-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .sn-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .sn-q:disabled{ cursor:default; }
        .sn-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .sn-btn:hover { border-color:${T.lineStrong}; }
        .sn-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .sn-row[data-shake="true"], .sn-bin[data-shake="true"] { animation:none; } }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="sn-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="sn-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="sn-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — obras */}
          {modo === "obras" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada obra o rasgo a su subgénero narrativo</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: obrasDone ? OK : T.text3 }}>
                    {Object.keys(ubicObra).length}/{OBRAS.length}
                  </span>
                </div>
                {obrasLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {OBRAS.length} obras y rasgos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {obrasLibres.map((o) => (
                      <button key={o.id} className="sn-chip" data-sel={selObra === o.id} onClick={() => setSelObra((s) => (s === o.id ? null : o.id))} {...dragProps(o.id)}>
                        {o.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsObras selObra={selObra} shakeObra={shakeObra} ubicObra={ubicObra} onMatch={intentarObra} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — rasgos */}
          {modo === "rasgos" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada subgénero a su rasgo definitorio</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: rasgosDone ? OK : T.text3 }}>
                    {Object.keys(empRasgo).length}/{RASGOS.length}
                  </span>
                </div>
                {rasgosLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {RASGOS.length} subgéneros!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {rasgosLibres.map((r) => (
                      <button key={r.id} className="sn-chip" data-sel={selRasgo === r.id} onClick={() => setSelRasgo((s) => (s === r.id ? null : r.id))} {...dragProps(r.id)}>
                        <i className="fa-solid fa-feather" style={{ fontSize: 11, color: T.text3 }} />
                        {r.subgenero}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsRasgos selRasgo={selRasgo} shakeRasgo={shakeRasgo} empRasgo={empRasgo} onMatch={intentarRasgo} dropProps={dropProps} />
            </>
          )}

          {/* MODO 3 — glosario */}
          {modo === "glosario" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada término a su definición</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: glosarioDone ? OK : T.text3 }}>
                    {Object.keys(empGlos).length}/{PARES.length}
                  </span>
                </div>
                {glosLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {PARES.length} términos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {glosLibres.map((g) => (
                      <button key={g.id} className="sn-chip" data-sel={selGlos === g.id} onClick={() => setSelGlos((s) => (s === g.id ? null : g.id))} {...dragProps(g.id)}>
                        <i className="fa-solid fa-tag" style={{ fontSize: 11, color: T.text3 }} />
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

            <div className="sn-divider" />

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
                  {bestEstrellas >= 3 ? "¡Distingues los subgéneros narrativos como un crítico!" : "Completa los tres modos para ganar las estrellas."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "obras" && (
                <>El <strong style={{ color: T.text }}>suspenso</strong> tensa; el <strong style={{ color: T.text }}>terror</strong> asusta; la <strong style={{ color: T.text }}>ciencia ficción</strong> imagina futuros; la <strong style={{ color: T.text }}>autoficción</strong> mezcla vida e invención; el <strong style={{ color: T.text }}>neorrealismo urbano</strong> retrata la ciudad; el <strong style={{ color: T.text }}>Antropoceno</strong> narra la crisis ecológica.</>
              )}
              {modo === "rasgos" && (
                <>Pregúntate qué hace cada subgénero: ¿<strong style={{ color: T.text }}>tensa</strong>, <strong style={{ color: T.text }}>asusta</strong>, <strong style={{ color: T.text }}>especula</strong>, <strong style={{ color: T.text }}>se confiesa</strong>, <strong style={{ color: T.text }}>retrata la urbe</strong> o <strong style={{ color: T.text }}>narra el colapso</strong>?</>
              )}
              {modo === "glosario" && (
                <>Lee primero la definición y su ejemplo; luego suelta el término que le corresponde.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_SUBGENEROS}</span>
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

function BinsObras({
  selObra,
  shakeObra,
  ubicObra,
  onMatch,
  dropProps,
}: {
  selObra: string | null;
  shakeObra: Subgenero | null;
  ubicObra: Record<string, Subgenero>;
  onMatch: (obraId: string, bin: Subgenero) => void;
  dropProps: DropFactory;
}) {
  const bins: Subgenero[] = ["suspenso", "terror", "cienciaficcion", "autoficcion", "neorrealismo", "antropoceno"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = SUBGENERO_INFO[bin];
        const dentro = OBRAS.filter((o) => ubicObra[o.id] === bin);
        return (
          <div
            key={bin}
            className="sn-bin"
            data-shake={shakeObra === bin}
            onClick={() => selObra && onMatch(selObra, bin)}
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
                dentro.map((o) => (
                  <span key={o.id} style={{ animation: "snPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
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

function RowsRasgos({
  selRasgo,
  shakeRasgo,
  empRasgo,
  onMatch,
  dropProps,
}: {
  selRasgo: string | null;
  shakeRasgo: string | null;
  empRasgo: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {RASGOS.map((r) => {
        const done = empRasgo[r.id];
        return (
          <div
            key={r.id}
            className="sn-row"
            data-shake={shakeRasgo === r.id}
            data-done={done}
            onClick={() => !done && selRasgo && onMatch(selRasgo, r.id)}
            {...dropProps((id) => onMatch(id, r.id))}
          >
            <div className="sn-slot" data-armed={!done && !!selRasgo} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "snPop .25s ease", fontSize: 13, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-feather" />
                  {r.subgenero}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> subgénero
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{r.rasgo}</div>
              <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{r.ejemplo}</div>
            </div>
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
            className="sn-row"
            data-shake={shakeGlos === g.id}
            data-done={done}
            onClick={() => !done && selGlos && onMatch(selGlos, g.id)}
            {...dropProps((id) => onMatch(id, g.id))}
          >
            <div className="sn-slot" data-armed={!done && !!selGlos} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "snPop .25s ease", fontSize: 13, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-tag" />
                  {g.termino}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> término
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
        Cinco afirmaciones sobre los subgéneros narrativos y sus elementos discursivos. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="sn-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="sn-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="sn-btn" onClick={reintentar}>
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
