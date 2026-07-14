"use client";

/**
 * Laboratorio — Concordancia y conectores: el hilo del texto.
 * Práctica experimental para LC-I-P06-A4 (Lengua y Comunicación I).
 *
 * Interactividad máxima: el alumno EXPERIMENTA arrastrando. Tres modos, tres
 * interacciones distintas:
 *  1. «Repara la concordancia» — arrastra la forma correcta para corregir el
 *     error de concordancia de cada oración.
 *  2. «Conectores en su lugar» — arrastra el conector adecuado al hueco de cada
 *     oración según su sentido (causa, adición, comparación, consecuencia).
 *  3. «Glosario» — empareja cada término con su definición.
 *  + Cuestionario de comprensión.
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de LC-I·P06
 * (A1 lectura, A2 quiz, A4 fill_blanks, A5 V/F, A6 glosario).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import {
  REPARACIONES,
  FRASES,
  GLOSARIO,
  QUIZ,
  DATO_CONCORDANCIA,
} from "./concordancia-conectores-data";

const NO = "#FF5E5E";
import { guardarEstrellas } from "@/app/actions/guardarEstrellas";
const RETO_KEY = "cen-concordancia-conectores-reto";

type Modo = "reparar" | "conectores" | "glosario";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "reparar", label: "Repara la concordancia", icono: "fa-screwdriver-wrench" },
  { id: "conectores", label: "Conectores en su lugar", icono: "fa-link" },
  { id: "glosario", label: "Glosario", icono: "fa-book-open" },
];

export function LabConcordanciaConectores({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("reparar");

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

  // ── modo Reparar (arrastra la forma correcta) ─────────────────────────
  const [reparado, setReparado] = useState<Record<string, boolean>>({});
  const [selRep, setSelRep] = useState<string | null>(null);
  const [shakeRep, setShakeRep] = useState<string | null>(null);
  const repLibres = REPARACIONES.filter((r) => !reparado[r.id]).slice().sort((a, b) => a.bien.localeCompare(b.bien, "es"));

  const intentarRep = (chipId: string, rowId: string) => {
    if (reparado[rowId]) return;
    if (chipId === rowId) {
      setReparado((e) => ({ ...e, [rowId]: true }));
      setSelRep(null);
      sfxPlace();
      if (Object.keys(reparado).length + 1 >= REPARACIONES.length) {
        sfxOk();
        persistMejor(true, conectoresDone, glosarioDone);
      }
    } else {
      setShakeRep(rowId);
      sfxNo();
      window.setTimeout(() => setShakeRep(null), 420);
    }
  };
  const resetReparar = () => {
    setReparado({});
    setSelRep(null);
  };

  // ── modo Conectores (arrastra el conector al hueco) ───────────────────
  const [colocado, setColocado] = useState<Record<string, boolean>>({});
  const [selCon, setSelCon] = useState<string | null>(null);
  const [shakeFrase, setShakeFrase] = useState<string | null>(null);
  const conLibres = FRASES.filter((f) => !colocado[f.id]).slice().sort((a, b) => a.conector.localeCompare(b.conector, "es"));

  const intentarCon = (chipId: string, rowId: string) => {
    if (colocado[rowId]) return;
    if (chipId === rowId) {
      setColocado((e) => ({ ...e, [rowId]: true }));
      setSelCon(null);
      sfxPlace();
      if (Object.keys(colocado).length + 1 >= FRASES.length) {
        sfxOk();
        persistMejor(reparadoDone, true, glosarioDone);
      }
    } else {
      setShakeFrase(rowId);
      sfxNo();
      window.setTimeout(() => setShakeFrase(null), 420);
    }
  };
  const resetConectores = () => {
    setColocado({});
    setSelCon(null);
  };

  // ── modo Glosario (emparejar término → definición) ────────────────────
  const [empGlos, setEmpGlos] = useState<Record<string, boolean>>({});
  const [selGlos, setSelGlos] = useState<string | null>(null);
  const [shakeGlosRow, setShakeGlosRow] = useState<string | null>(null);
  const glosLibres = GLOSARIO.filter((g) => !empGlos[g.id]).slice().sort((a, b) => a.termino.localeCompare(b.termino, "es"));

  const intentarGlos = (chipId: string, rowId: string) => {
    if (empGlos[rowId]) return;
    if (chipId === rowId) {
      setEmpGlos((e) => ({ ...e, [rowId]: true }));
      setSelGlos(null);
      sfxPlace();
      if (Object.keys(empGlos).length + 1 >= GLOSARIO.length) {
        sfxOk();
        persistMejor(reparadoDone, conectoresDone, true);
      }
    } else {
      setShakeGlosRow(rowId);
      sfxNo();
      window.setTimeout(() => setShakeGlosRow(null), 420);
    }
  };
  const resetGlosario = () => {
    setEmpGlos({});
    setSelGlos(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const reparadoDone = Object.keys(reparado).length >= REPARACIONES.length;
  const conectoresDone = Object.keys(colocado).length >= FRASES.length;
  const glosarioDone = Object.keys(empGlos).length >= GLOSARIO.length;
  const estrellas = (reparadoDone ? 1 : 0) + (conectoresDone ? 1 : 0) + (glosarioDone ? 1 : 0);

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
    { txt: "Repara las 4 oraciones con error de concordancia", done: reparadoDone },
    { txt: "Coloca los 4 conectores en su lugar", done: conectoresDone },
    { txt: "Empareja los 5 términos del glosario", done: glosarioDone },
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

  const resetActual = modo === "reparar" ? resetReparar : modo === "conectores" ? resetConectores : resetGlosario;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes ccShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes ccPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .cc-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .cc-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .cc-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .cc-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .cc-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .cc-icobtn:hover { background:rgba(255,255,255,0.12); }
        .cc-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:all .14s; user-select:none; }
        .cc-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .cc-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .cc-chip:active { cursor:grabbing; }
        .cc-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .cc-row[data-shake="true"] { animation:ccShake .4s; border-color:${NO}; }
        .cc-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .cc-slot { flex-shrink:0; min-width:118px; min-height:44px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 12px; }
        .cc-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .cc-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .cc-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .cc-q:disabled{ cursor:default; }
        .cc-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .cc-btn:hover { border-color:${T.lineStrong}; }
        .cc-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .cc-row[data-shake="true"] { animation:none; } }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="cc-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="cc-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="cc-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — reparar concordancia */}
          {modo === "reparar" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra la forma correcta sobre la palabra tachada</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: reparadoDone ? OK : T.text3 }}>
                    {Object.keys(reparado).length}/{REPARACIONES.length}
                  </span>
                </div>
                {repLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Reparaste las 4 oraciones!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {repLibres.map((r) => (
                      <button key={r.id} className="cc-chip" data-sel={selRep === r.id} onClick={() => setSelRep((s) => (s === r.id ? null : r.id))} {...dragProps(r.id)}>
                        <i className="fa-solid fa-pen" style={{ fontSize: 12, opacity: 0.7 }} />
                        {r.bien}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsReparar selRep={selRep} shakeRep={shakeRep} reparado={reparado} onMatch={intentarRep} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — conectores en su lugar */}
          {modo === "conectores" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada conector al hueco según el sentido</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: conectoresDone ? OK : T.text3 }}>
                    {Object.keys(colocado).length}/{FRASES.length}
                  </span>
                </div>
                {conLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Colocaste los 4 conectores!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {conLibres.map((f) => (
                      <button key={f.id} className="cc-chip" data-sel={selCon === f.id} onClick={() => setSelCon((s) => (s === f.id ? null : f.id))} {...dragProps(f.id)}>
                        <i className="fa-solid fa-link" style={{ fontSize: 12, opacity: 0.7 }} />
                        {f.conector}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsConectores selCon={selCon} shakeFrase={shakeFrase} colocado={colocado} onMatch={intentarCon} dropProps={dropProps} accent={accent} />
            </>
          )}

          {/* MODO 3 — glosario (emparejar) */}
          {modo === "glosario" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada término hasta su definición</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: glosarioDone ? OK : T.text3 }}>
                    {Object.keys(empGlos).length}/{GLOSARIO.length}
                  </span>
                </div>
                {glosLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste los 5 términos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {glosLibres.map((g) => (
                      <button key={g.id} className="cc-chip" data-sel={selGlos === g.id} onClick={() => setSelGlos((s) => (s === g.id ? null : g.id))} {...dragProps(g.id)}>
                        <i className="fa-solid fa-tag" style={{ fontSize: 12, opacity: 0.7 }} />
                        {g.termino}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsGlosario selGlos={selGlos} shakeGlosRow={shakeGlosRow} empGlos={empGlos} onMatch={intentarGlos} dropProps={dropProps} />
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

            <div className="cc-divider" />

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
                  {bestEstrellas >= 3 ? "¡Dominas la concordancia y los conectores!" : "Completa los tres modos para ganar las estrellas."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "reparar" && (
                <>El sustantivo y el adjetivo concuerdan en <strong style={{ color: T.text }}>género y número</strong>; el sujeto y el verbo, en <strong style={{ color: T.text }}>número y persona</strong>.</>
              )}
              {modo === "conectores" && (
                <><strong style={{ color: T.text }}>porque</strong> = causa · <strong style={{ color: T.text }}>además</strong> = adición · <strong style={{ color: T.text }}>como</strong> = comparación. Lee la frase completa para captar el sentido.</>
              )}
              {modo === "glosario" && (
                <>Los <strong style={{ color: T.text }}>conectores</strong> son los puentes que unen ideas; la <strong style={{ color: T.text }}>concordancia</strong> es el acuerdo entre las partes de la oración.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_CONCORDANCIA}</span>
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

function RowsReparar({
  selRep,
  shakeRep,
  reparado,
  onMatch,
  dropProps,
}: {
  selRep: string | null;
  shakeRep: string | null;
  reparado: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {REPARACIONES.map((r) => {
        const done = reparado[r.id];
        return (
          <div
            key={r.id}
            className="cc-row"
            data-shake={shakeRep === r.id}
            data-done={done}
            onClick={() => !done && selRep && onMatch(selRep, r.id)}
            {...dropProps((id) => onMatch(id, r.id))}
          >
            <div style={{ fontSize: 14, color: done ? "#fff" : T.text2, lineHeight: 1.5, display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>{r.antes}</span>
              {done ? (
                <span style={{ animation: "ccPop .25s ease", fontWeight: 900, color: OK }}>{r.bien}</span>
              ) : (
                <>
                  <span style={{ textDecoration: "line-through", color: NO, fontWeight: 700, opacity: 0.85 }}>{r.mal}</span>
                  <span className="cc-slot" data-armed={!!selRep} style={{ minWidth: 80 }}>
                    <i className="fa-solid fa-arrow-down" style={{ fontSize: 11 }} />
                  </span>
                </>
              )}
              <span>{r.despues}</span>
            </div>
            {done && (
              <div style={{ flexBasis: "100%", fontSize: 12, color: T.text3, lineHeight: 1.45, display: "flex", gap: 8 }}>
                <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 2 }} />
                <span>{r.regla}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RowsConectores({
  selCon,
  shakeFrase,
  colocado,
  onMatch,
  dropProps,
  accent,
}: {
  selCon: string | null;
  shakeFrase: string | null;
  colocado: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
  accent: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {FRASES.map((f) => {
        const done = colocado[f.id];
        return (
          <div
            key={f.id}
            className="cc-row"
            data-shake={shakeFrase === f.id}
            data-done={done}
            onClick={() => !done && selCon && onMatch(selCon, f.id)}
            {...dropProps((id) => onMatch(id, f.id))}
          >
            <div style={{ fontSize: 14, color: done ? "#fff" : T.text2, lineHeight: 1.6, display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>{f.antes}</span>
              {done ? (
                <span style={{ animation: "ccPop .25s ease", fontWeight: 900, color: OK }}>{f.conector}</span>
              ) : (
                <span className="cc-slot" data-armed={!!selCon}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <i className="fa-solid fa-link" style={{ fontSize: 11 }} /> conector
                  </span>
                </span>
              )}
              <span>{f.despues}</span>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: done ? OK : T.text3, border: `1px solid ${done ? `${OK}55` : T.line}`, borderRadius: 6, padding: "1px 7px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {f.tipo}
              </span>
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45, display: "flex", gap: 8, marginTop: 2 }}>
        <i className="fa-solid fa-circle-info" style={{ color: accent, marginTop: 2 }} />
        <span>La etiqueta de la derecha indica el tipo de relación que debe expresar el conector.</span>
      </div>
    </div>
  );
}

function RowsGlosario({
  selGlos,
  shakeGlosRow,
  empGlos,
  onMatch,
  dropProps,
}: {
  selGlos: string | null;
  shakeGlosRow: string | null;
  empGlos: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {GLOSARIO.map((g) => {
        const done = empGlos[g.id];
        return (
          <div
            key={g.id}
            className="cc-row"
            data-shake={shakeGlosRow === g.id}
            data-done={done}
            onClick={() => !done && selGlos && onMatch(selGlos, g.id)}
            {...dropProps((id) => onMatch(id, g.id))}
          >
            <div className="cc-slot" data-armed={!done && !!selGlos} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a`, minWidth: 150 } : { minWidth: 150 }}>
              {done ? (
                <span style={{ animation: "ccPop .25s ease", fontSize: 13, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
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
        Cinco preguntas sobre concordancia gramatical y uso de conectores. Responde y pulsa «Comprobar».
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
                    <button key={oi} className="cc-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="cc-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="cc-btn" onClick={reintentar}>
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
