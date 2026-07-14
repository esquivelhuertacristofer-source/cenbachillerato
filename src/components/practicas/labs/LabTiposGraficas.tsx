"use client";

/**
 * Laboratorio — Tipos de gráficas y cuándo usarlas
 * Práctica experimental para CD-II-P04 (Cultura Digital II).
 *
 * Interactividad máxima: el alumno EXPERIMENTA arrastrando. Tres modos:
 *  1. «Tipo de gráfica y su propósito» — empareja cada tipo de gráfica con el
 *     propósito de datos para el que sirve (comparar, tendencia, proporción,
 *     correlación, volumen acumulado).
 *  2. «¿Qué gráfica usarías?» — clasifica escenarios de datos reales (INEGI,
 *     PIB, redes sociales, escolaridad) por la gráfica apropiada.
 *  3. «Empareja término y definición» — glosario verbatim de A5.
 *  + Cuestionario de comprensión (V/F verbatim de A4).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Cada tipo de gráfica lleva un
 * pequeño glifo SVG dibujado a mano. Contenido VERBATIM de CD-II·P04.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import {
  GRAFICAS,
  ESCENARIOS,
  TRAMPAS,
  PARES,
  QUIZ,
  DATO_GRAFICAS,
  type Glyph,
} from "./tipos-graficas-data";

const NO = "#FF5E5E";
import { guardarEstrellas } from "@/app/actions/guardarEstrellas";
const RETO_KEY = "cen-tipos-graficas-reto";

type Modo = "tipos" | "escenarios" | "glosario";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "tipos", label: "Tipo de gráfica y su propósito", icono: "fa-chart-pie" },
  { id: "escenarios", label: "¿Qué gráfica usarías?", icono: "fa-table-list" },
  { id: "glosario", label: "Empareja término y definición", icono: "fa-book-open" },
];

const GLYPH_INFO: Record<Glyph, { titulo: string; icono: string }> = {
  barras: { titulo: "Barras", icono: "fa-chart-column" },
  linea: { titulo: "Línea", icono: "fa-chart-line" },
  circular: { titulo: "Circular (pastel)", icono: "fa-chart-pie" },
  dispersion: { titulo: "Dispersión", icono: "fa-braille" },
  area: { titulo: "Área", icono: "fa-chart-area" },
};

/* ── Glifo SVG dibujado a mano para cada tipo de gráfica (sin dependencias) ── */
function ChartGlyph({ glyph, color, size = 46 }: { glyph: Glyph; color: string; size?: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
      <line x1="8" y1="40" x2="42" y2="40" stroke={T.text3} strokeWidth="1.5" />
      <line x1="8" y1="40" x2="8" y2="8" stroke={T.text3} strokeWidth="1.5" />
      {glyph === "barras" && (
        <>
          <rect x="12" y="26" width="6" height="14" fill={color} rx="1" />
          <rect x="21" y="18" width="6" height="22" fill={color} rx="1" opacity="0.8" />
          <rect x="30" y="30" width="6" height="10" fill={color} rx="1" opacity="0.6" />
        </>
      )}
      {glyph === "linea" && (
        <polyline points="10,34 18,22 26,28 34,14 42,18" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {glyph === "circular" && (
        <>
          <circle cx="26" cy="24" r="13" fill={color} opacity="0.35" />
          <path d="M26 24 L26 11 A13 13 0 0 1 38 28 Z" fill={color} />
          <path d="M26 24 L38 28 A13 13 0 0 1 18 35 Z" fill={color} opacity="0.65" />
        </>
      )}
      {glyph === "dispersion" && (
        <>
          {[
            [13, 33], [18, 26], [22, 30], [27, 20], [31, 24], [36, 14], [16, 31], [29, 27],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2.1" fill={color} opacity={0.55 + (i % 3) * 0.15} />
          ))}
        </>
      )}
      {glyph === "area" && (
        <>
          <polygon points="10,34 18,22 26,28 34,14 42,18 42,40 10,40" fill={color} opacity="0.35" />
          <polyline points="10,34 18,22 26,28 34,14 42,18" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

export function LabTiposGraficas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("tipos");

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

  // ── modo tipos (empareja tipo de gráfica → propósito) ──────────────────
  const [empTipo, setEmpTipo] = useState<Record<string, boolean>>({});
  const [selTipo, setSelTipo] = useState<string | null>(null);
  const [shakeTipo, setShakeTipo] = useState<string | null>(null);
  const tiposLibres = GRAFICAS.filter((g) => !empTipo[g.id]).slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const intentarTipo = (chipId: string, rowId: string) => {
    if (empTipo[rowId]) return;
    if (chipId === rowId) {
      setEmpTipo((e) => ({ ...e, [rowId]: true }));
      setSelTipo(null);
      sfxPlace();
      if (Object.keys(empTipo).length + 1 >= GRAFICAS.length) {
        sfxOk();
        persistMejor(true, escenariosDone, glosarioDone);
      }
    } else {
      setShakeTipo(rowId);
      sfxNo();
      window.setTimeout(() => setShakeTipo(null), 420);
    }
  };
  const resetTipos = () => {
    setEmpTipo({});
    setSelTipo(null);
  };

  // ── modo escenarios (clasifica escenario → gráfica apropiada) ──────────
  const [ubicEsc, setUbicEsc] = useState<Record<string, Glyph>>({});
  const [selEsc, setSelEsc] = useState<string | null>(null);
  const [shakeEsc, setShakeEsc] = useState<Glyph | null>(null);
  const escLibres = ESCENARIOS.filter((e) => !ubicEsc[e.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarEsc = (escId: string, bin: Glyph) => {
    if (ubicEsc[escId]) return;
    const e = ESCENARIOS.find((x) => x.id === escId);
    if (e && e.tipo === bin) {
      setUbicEsc((m) => ({ ...m, [escId]: bin }));
      setSelEsc(null);
      sfxPlace();
      if (Object.keys(ubicEsc).length + 1 >= ESCENARIOS.length) {
        sfxOk();
        persistMejor(tiposDone, true, glosarioDone);
      }
    } else {
      setShakeEsc(bin);
      sfxNo();
      window.setTimeout(() => setShakeEsc(null), 420);
    }
  };
  const resetEscenarios = () => {
    setUbicEsc({});
    setSelEsc(null);
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
        persistMejor(tiposDone, escenariosDone, true);
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
  const tiposDone = Object.keys(empTipo).length >= GRAFICAS.length;
  const escenariosDone = Object.keys(ubicEsc).length >= ESCENARIOS.length;
  const glosarioDone = Object.keys(empGlos).length >= PARES.length;
  const estrellas = (tiposDone ? 1 : 0) + (escenariosDone ? 1 : 0) + (glosarioDone ? 1 : 0);

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
    { txt: "Empareja los 5 tipos de gráfica con su propósito", done: tiposDone },
    { txt: "Clasifica los 7 escenarios por su gráfica", done: escenariosDone },
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

  const resetActual = modo === "tipos" ? resetTipos : modo === "escenarios" ? resetEscenarios : resetGlosario;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes tgShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes tgPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .tg-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,28vw,400px); gap:22px; align-items:start; }
        @media (max-width:1000px){ .tg-grid { grid-template-columns:1fr; } }
        .tg-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .tg-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .tg-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .tg-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .tg-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .tg-icobtn:hover { background:rgba(255,255,255,0.12); }
        .tg-chip { cursor:grab; display:inline-flex; align-items:center; gap:10px; padding:10px 14px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13.5px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .tg-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .tg-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .tg-chip:active { cursor:grabbing; }
        .tg-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .tg-row[data-shake="true"] { animation:tgShake .4s; border-color:${NO}; }
        .tg-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .tg-slot { flex-shrink:0; min-width:190px; min-height:54px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .tg-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .tg-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:210px; }
        .tg-bin[data-shake="true"] { animation:tgShake .4s; border-color:${NO}; }
        .tg-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .tg-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .tg-q:disabled{ cursor:default; }
        .tg-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .tg-btn:hover { border-color:${T.lineStrong}; }
        .tg-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .tg-row[data-shake="true"], .tg-bin[data-shake="true"] { animation:none; } }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="tg-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="tg-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="tg-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      <div className="tg-grid">
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — tipos */}
          {modo === "tipos" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada gráfica al propósito que cumple</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: tiposDone ? OK : T.text3 }}>
                    {Object.keys(empTipo).length}/{GRAFICAS.length}
                  </span>
                </div>
                {tiposLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {GRAFICAS.length} tipos de gráfica!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {tiposLibres.map((g) => (
                      <button key={g.id} className="tg-chip" data-sel={selTipo === g.id} onClick={() => setSelTipo((s) => (s === g.id ? null : g.id))} {...dragProps(g.id)}>
                        <ChartGlyph glyph={g.glyph} color={accent} size={34} />
                        {g.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsTipos accent={accent} selTipo={selTipo} shakeTipo={shakeTipo} empTipo={empTipo} onMatch={intentarTipo} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — escenarios */}
          {modo === "escenarios" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada escenario a la gráfica apropiada</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: escenariosDone ? OK : T.text3 }}>
                    {Object.keys(ubicEsc).length}/{ESCENARIOS.length}
                  </span>
                </div>
                {escLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {ESCENARIOS.length} escenarios!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {escLibres.map((e) => (
                      <button key={e.id} className="tg-chip" data-sel={selEsc === e.id} onClick={() => setSelEsc((s) => (s === e.id ? null : e.id))} {...dragProps(e.id)}>
                        <i className="fa-solid fa-database" style={{ fontSize: 11, color: T.text3 }} />
                        {e.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsEscenarios accent={accent} rgba={color.rgba} selEsc={selEsc} shakeEsc={shakeEsc} ubicEsc={ubicEsc} onMatch={intentarEsc} dropProps={dropProps} />
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
                      <button key={g.id} className="tg-chip" data-sel={selGlos === g.id} onClick={() => setSelGlos((s) => (s === g.id ? null : g.id))} {...dragProps(g.id)}>
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

            <div className="tg-divider" />

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
                  {bestEstrellas >= 3 ? "¡Eliges la gráfica correcta como un estadístico!" : "Completa los tres modos para ganar las estrellas."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "tipos" && (
                <>Las <strong style={{ color: T.text }}>barras</strong> comparan categorías; la <strong style={{ color: T.text }}>línea</strong> muestra tendencias en el tiempo; la <strong style={{ color: T.text }}>circular</strong> reparte un todo; la <strong style={{ color: T.text }}>dispersión</strong> relaciona dos variables.</>
              )}
              {modo === "escenarios" && (
                <>Pregúntate qué quieres comunicar: ¿<strong style={{ color: T.text }}>comparar</strong>, ver una <strong style={{ color: T.text }}>tendencia</strong>, mostrar <strong style={{ color: T.text }}>proporciones</strong> o una <strong style={{ color: T.text }}>relación</strong> entre variables?</>
              )}
              {modo === "glosario" && (
                <>Lee primero la definición y su ejemplo; luego suelta el término que le corresponde.</>
              )}
            </span>
          </div>

          {/* trampas visuales verbatim de A1 */}
          <div style={{ ...card, padding: "16px 18px" }}>
            <Eyebrow>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8, color: NO }} />
              Trampas visuales
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {TRAMPAS.map((t) => (
                <div key={t.id} style={{ display: "flex", gap: 10, fontSize: 11.8, color: T.text2, lineHeight: 1.45 }}>
                  <i className={`fa-solid ${t.icono}`} style={{ color: NO, fontSize: 13, marginTop: 2, flexShrink: 0 }} />
                  <span>
                    <strong style={{ color: T.text }}>{t.titulo}.</strong> {t.texto}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-chart-simple" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_GRAFICAS}</span>
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

function RowsTipos({
  accent,
  selTipo,
  shakeTipo,
  empTipo,
  onMatch,
  dropProps,
}: {
  accent: string;
  selTipo: string | null;
  shakeTipo: string | null;
  empTipo: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {GRAFICAS.map((g) => {
        const done = empTipo[g.id];
        return (
          <div
            key={g.id}
            className="tg-row"
            data-shake={shakeTipo === g.id}
            data-done={done}
            onClick={() => !done && selTipo && onMatch(selTipo, g.id)}
            {...dropProps((id) => onMatch(id, g.id))}
          >
            <div className="tg-slot" data-armed={!done && !!selTipo} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "tgPop .25s ease", fontSize: 13, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 9 }}>
                  <ChartGlyph glyph={g.glyph} color={accent} size={30} />
                  {g.nombre}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> gráfica
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{g.proposito}</div>
              <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{g.detalle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BinsEscenarios({
  accent,
  rgba,
  selEsc,
  shakeEsc,
  ubicEsc,
  onMatch,
  dropProps,
}: {
  accent: string;
  rgba: string;
  selEsc: string | null;
  shakeEsc: Glyph | null;
  ubicEsc: Record<string, Glyph>;
  onMatch: (escId: string, bin: Glyph) => void;
  dropProps: DropFactory;
}) {
  const bins: Glyph[] = ["barras", "linea", "circular", "dispersion", "area"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = GLYPH_INFO[bin];
        const dentro = ESCENARIOS.filter((e) => ubicEsc[e.id] === bin);
        return (
          <div
            key={bin}
            className="tg-bin"
            data-shake={shakeEsc === bin}
            onClick={() => selEsc && onMatch(selEsc, bin)}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: `rgba(${rgba},0.14)` }}>
                <ChartGlyph glyph={bin} color={accent} size={30} />
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((e) => (
                  <span key={e.id} style={{ animation: "tgPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK, marginTop: 3 }} />
                    {e.texto}
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
            className="tg-row"
            data-shake={shakeGlos === g.id}
            data-done={done}
            onClick={() => !done && selGlos && onMatch(selGlos, g.id)}
            {...dropProps((id) => onMatch(id, g.id))}
          >
            <div className="tg-slot" data-armed={!done && !!selGlos} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "tgPop .25s ease", fontSize: 13, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
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
        Cuatro afirmaciones sobre medidas estadísticas, gráficas y software libre. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="tg-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="tg-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="tg-btn" onClick={reintentar}>
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
