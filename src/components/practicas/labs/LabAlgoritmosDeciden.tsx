"use client";

/**
 * Laboratorio — Los algoritmos deciden por nosotros
 * Práctica experimental para CD-I-P04-A1 (Cultura Digital I).
 *
 * Tema: los algoritmos de RECOMENDACIÓN que deciden el contenido que vemos
 * (NO los algoritmos de programación). El alumno EXPERIMENTA arrastrando.
 * Tres modos, tres interacciones distintas:
 *  1. «¿Qué decide cada algoritmo?» — clasifica cuatro decisiones (verbatim de
 *     la lectura A1) en la plataforma cuyo algoritmo las toma.
 *  2. «Causa y efecto» — empareja cada idea de la lectura con lo que provoca o
 *     significa (objetivo, contenido emocional, polarización, burbuja de
 *     filtro, usuario consciente).
 *  3. «¿Cómo arma tu feed?» — ordena los pasos con que un algoritmo de
 *     recomendación construye tu feed a partir de tus datos.
 *  + Cuestionario de comprensión (opción múltiple verbatim de A2).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de CD-I·P04.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import {
  DECISIONES,
  PLATAFORMA_INFO,
  PARES_CAUSA,
  PASOS_FEED,
  GLOSARIO,
  QUIZ,
  DATO_ALGORITMOS,
  type Plataforma,
} from "./algoritmos-deciden-data";

const NO = "#FF5E5E";
import { guardarEstrellas } from "@/app/actions/guardarEstrellas";
const RETO_KEY = "cen-algoritmos-deciden-reto";

type Modo = "plataformas" | "causa" | "feed";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "plataformas", label: "¿Qué decide cada algoritmo?", icono: "fa-sliders" },
  { id: "causa", label: "Causa y efecto", icono: "fa-arrows-turn-to-dots" },
  { id: "feed", label: "¿Cómo arma tu feed?", icono: "fa-list-ol" },
];

export function LabAlgoritmosDeciden({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("plataformas");

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

  // ── modo plataformas (clasifica cada decisión por plataforma) ──────────
  const [ubicPlat, setUbicPlat] = useState<Record<string, Plataforma>>({});
  const [selPlat, setSelPlat] = useState<string | null>(null);
  const [shakePlat, setShakePlat] = useState<Plataforma | null>(null);
  const platLibres = DECISIONES.filter((d) => !ubicPlat[d.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarPlat = (decisionId: string, bin: Plataforma) => {
    if (ubicPlat[decisionId]) return;
    const d = DECISIONES.find((x) => x.id === decisionId);
    if (d && d.plataforma === bin) {
      setUbicPlat((e) => ({ ...e, [decisionId]: bin }));
      setSelPlat(null);
      sfxPlace();
      if (Object.keys(ubicPlat).length + 1 >= DECISIONES.length) {
        sfxOk();
        persistMejor(true, causaDone, feedDone);
      }
    } else {
      setShakePlat(bin);
      sfxNo();
      window.setTimeout(() => setShakePlat(null), 420);
    }
  };
  const resetPlat = () => {
    setUbicPlat({});
    setSelPlat(null);
  };

  // ── modo causa (empareja concepto → efecto) ────────────────────────────
  const [empCausa, setEmpCausa] = useState<Record<string, boolean>>({});
  const [selCausa, setSelCausa] = useState<string | null>(null);
  const [shakeCausa, setShakeCausa] = useState<string | null>(null);
  const causaLibres = PARES_CAUSA.filter((c) => !empCausa[c.id]).slice().sort((a, b) => a.concepto.localeCompare(b.concepto, "es"));

  const intentarCausa = (chipId: string, rowId: string) => {
    if (empCausa[rowId]) return;
    if (chipId === rowId) {
      setEmpCausa((e) => ({ ...e, [rowId]: true }));
      setSelCausa(null);
      sfxPlace();
      if (Object.keys(empCausa).length + 1 >= PARES_CAUSA.length) {
        sfxOk();
        persistMejor(platDone, true, feedDone);
      }
    } else {
      setShakeCausa(rowId);
      sfxNo();
      window.setTimeout(() => setShakeCausa(null), 420);
    }
  };
  const resetCausa = () => {
    setEmpCausa({});
    setSelCausa(null);
  };

  // ── modo feed (ordena los pasos) ───────────────────────────────────────
  const [colocados, setColocados] = useState<string[]>([]);
  const [selPaso, setSelPaso] = useState<string | null>(null);
  const [shakeFeed, setShakeFeed] = useState(false);
  const pasosLibres = PASOS_FEED.filter((p) => !colocados.includes(p.id)).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarPaso = (pasoId: string) => {
    if (colocados.includes(pasoId)) return;
    const siguiente = PASOS_FEED[colocados.length];
    if (siguiente && siguiente.id === pasoId) {
      const nuevo = [...colocados, pasoId];
      setColocados(nuevo);
      setSelPaso(null);
      sfxPlace();
      if (nuevo.length >= PASOS_FEED.length) {
        sfxOk();
        persistMejor(platDone, causaDone, true);
      }
    } else {
      setShakeFeed(true);
      sfxNo();
      window.setTimeout(() => setShakeFeed(false), 420);
    }
  };
  const resetFeed = () => {
    setColocados([]);
    setSelPaso(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const platDone = Object.keys(ubicPlat).length >= DECISIONES.length;
  const causaDone = Object.keys(empCausa).length >= PARES_CAUSA.length;
  const feedDone = colocados.length >= PASOS_FEED.length;
  const estrellas = (platDone ? 1 : 0) + (causaDone ? 1 : 0) + (feedDone ? 1 : 0);

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
    { txt: "Clasifica las 4 decisiones por plataforma", done: platDone },
    { txt: "Empareja las 5 ideas con su efecto", done: causaDone },
    { txt: "Ordena los 5 pasos del feed", done: feedDone },
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

  const resetActual = modo === "plataformas" ? resetPlat : modo === "causa" ? resetCausa : resetFeed;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes algdShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes algdPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .algd-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .algd-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .algd-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .algd-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .algd-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .algd-icobtn:hover { background:rgba(255,255,255,0.12); }
        .algd-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13.5px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .algd-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .algd-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .algd-chip:active { cursor:grabbing; }
        .algd-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .algd-row[data-shake="true"] { animation:algdShake .4s; border-color:${NO}; }
        .algd-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .algd-slot { flex-shrink:0; min-width:200px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .algd-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .algd-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:200px; }
        .algd-bin[data-shake="true"] { animation:algdShake .4s; border-color:${NO}; }
        .algd-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .algd-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .algd-q:disabled{ cursor:default; }
        .algd-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .algd-btn:hover { border-color:${T.lineStrong}; }
        .algd-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .algd-row[data-shake="true"], .algd-bin[data-shake="true"] { animation:none; } }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="algd-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="algd-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="algd-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — plataformas */}
          {modo === "plataformas" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada decisión a la plataforma cuyo algoritmo la toma</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: platDone ? OK : T.text3 }}>
                    {Object.keys(ubicPlat).length}/{DECISIONES.length}
                  </span>
                </div>
                {platLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {DECISIONES.length} decisiones!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {platLibres.map((d) => (
                      <button key={d.id} className="algd-chip" data-sel={selPlat === d.id} onClick={() => setSelPlat((s) => (s === d.id ? null : d.id))} {...dragProps(d.id)}>
                        {d.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsPlataformas selPlat={selPlat} shakePlat={shakePlat} ubicPlat={ubicPlat} onMatch={intentarPlat} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — causa */}
          {modo === "causa" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada idea a lo que provoca o significa</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: causaDone ? OK : T.text3 }}>
                    {Object.keys(empCausa).length}/{PARES_CAUSA.length}
                  </span>
                </div>
                {causaLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {PARES_CAUSA.length} ideas!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {causaLibres.map((c) => (
                      <button key={c.id} className="algd-chip" data-sel={selCausa === c.id} onClick={() => setSelCausa((s) => (s === c.id ? null : c.id))} {...dragProps(c.id)}>
                        <i className="fa-solid fa-arrows-turn-to-dots" style={{ fontSize: 11, color: T.text3 }} />
                        {c.concepto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsCausa selCausa={selCausa} shakeCausa={shakeCausa} empCausa={empCausa} onMatch={intentarCausa} dropProps={dropProps} />
            </>
          )}

          {/* MODO 3 — feed (ordenar) */}
          {modo === "feed" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra los pasos en el orden en que el algoritmo arma tu feed</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: feedDone ? OK : T.text3 }}>
                    {colocados.length}/{PASOS_FEED.length}
                  </span>
                </div>
                {pasosLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Ordenaste los {PASOS_FEED.length} pasos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {pasosLibres.map((p) => (
                      <button key={p.id} className="algd-chip" data-sel={selPaso === p.id} onClick={() => setSelPaso((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                        <i className="fa-solid fa-list-ol" style={{ fontSize: 11, color: T.text3 }} />
                        {p.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <ListaFeed colocados={colocados} selPaso={selPaso} shakeFeed={shakeFeed} onPlace={intentarPaso} dropProps={dropProps} />
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

            <div className="algd-divider" />

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
                  {bestEstrellas >= 3 ? "¡Entiendes cómo el algoritmo decide por ti!" : "Completa los tres modos para ganar las estrellas."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "plataformas" && (
                <>Los algoritmos <strong style={{ color: T.text }}>no son neutrales</strong>: cada plataforma decide qué ves con un objetivo específico.</>
              )}
              {modo === "causa" && (
                <>El objetivo suele ser <strong style={{ color: T.text }}>maximizar tu tiempo</strong> en la plataforma; por eso promueven contenido emocional que puede amplificar la <strong style={{ color: T.text }}>desinformación</strong>.</>
              )}
              {modo === "feed" && (
                <>El algoritmo mide lo que haces, aprende tus preferencias y arma tu feed. Buscar fuentes diversas evita la <strong style={{ color: T.text }}>burbuja de filtro</strong>.</>
              )}
            </span>
          </div>

          {/* glosario verbatim A5 */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
              <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 15 }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{GLOSARIO.termino}</span>
            </div>
            <div>{GLOSARIO.definicion}</div>
            <div style={{ marginTop: 6, fontStyle: "italic", color: T.text3 }}>{GLOSARIO.ejemplo}</div>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_ALGORITMOS}</span>
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

function BinsPlataformas({
  selPlat,
  shakePlat,
  ubicPlat,
  onMatch,
  dropProps,
}: {
  selPlat: string | null;
  shakePlat: Plataforma | null;
  ubicPlat: Record<string, Plataforma>;
  onMatch: (decisionId: string, bin: Plataforma) => void;
  dropProps: DropFactory;
}) {
  const bins: Plataforma[] = ["youtube", "instagram", "tiktok", "google"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = PLATAFORMA_INFO[bin];
        const dentro = DECISIONES.filter((d) => ubicPlat[d.id] === bin);
        return (
          <div
            key={bin}
            className="algd-bin"
            data-shake={shakePlat === bin}
            onClick={() => selPlat && onMatch(selPlat, bin)}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <i className={`fa-solid ${info.icono}`} style={{ color: T.text2 }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí&hellip;</div>
              ) : (
                dentro.map((d) => (
                  <span key={d.id} style={{ animation: "algdPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {d.texto}
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

function RowsCausa({
  selCausa,
  shakeCausa,
  empCausa,
  onMatch,
  dropProps,
}: {
  selCausa: string | null;
  shakeCausa: string | null;
  empCausa: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PARES_CAUSA.map((c) => {
        const done = empCausa[c.id];
        return (
          <div
            key={c.id}
            className="algd-row"
            data-shake={shakeCausa === c.id}
            data-done={done}
            onClick={() => !done && selCausa && onMatch(selCausa, c.id)}
            {...dropProps((id) => onMatch(id, c.id))}
          >
            <div className="algd-slot" data-armed={!done && !!selCausa} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "algdPop .25s ease", fontSize: 13, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-arrows-turn-to-dots" />
                  {c.concepto}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> idea
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{c.efecto}</div>
              <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{c.ejemplo}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListaFeed({
  colocados,
  selPaso,
  shakeFeed,
  onPlace,
  dropProps,
}: {
  colocados: string[];
  selPaso: string | null;
  shakeFeed: boolean;
  onPlace: (pasoId: string) => void;
  dropProps: DropFactory;
}) {
  const siguiente = colocados.length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {PASOS_FEED.map((p, idx) => {
        const done = colocados.includes(p.id);
        const esActivo = idx === siguiente;
        return (
          <div
            key={p.id}
            className="algd-row"
            data-shake={esActivo && shakeFeed}
            data-done={done}
            onClick={() => esActivo && selPaso && onPlace(selPaso)}
            {...dropProps((id) => esActivo && onPlace(id))}
          >
            <div
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 900,
                color: done ? "#fff" : T.text3,
                border: `1.5px solid ${done ? OK : T.line}`,
                background: done ? `${OK}1a` : T.inset,
              }}
            >
              {idx + 1}
            </div>
            <div className="algd-slot" data-armed={esActivo && !!selPaso} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "algdPop .25s ease", fontSize: 13, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-list-ol" />
                  {p.texto}
                </span>
              ) : esActivo ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> suelta el paso {idx + 1}
                </span>
              ) : (
                <span style={{ opacity: 0.6 }}>paso {idx + 1}</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, color: done ? T.text2 : T.text3, lineHeight: 1.45 }}>{done ? p.detalle : " "}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Cuestionario de comprensión (A2, opción múltiple verbatim)
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
        Cinco preguntas sobre los algoritmos de recomendación y la burbuja de filtro. Elige la opción correcta y pulsa &laquo;Comprobar&raquo;.
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
                    <button key={oi} className="algd-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="algd-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="algd-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 16px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 13.5, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>&middot; revisa las marcadas e int&eacute;ntalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
