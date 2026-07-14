"use client";

/**
 * Laboratorio — Factores de producción y la cadena productiva
 * Práctica experimental para CS-II-P03-A4 (Ciencias Sociales II).
 *
 * Interactividad máxima: el alumno EXPERIMENTA arrastrando. Tres modos, tres
 * interacciones distintas (factores · sectores · cadena):
 *  1. «Los factores de producción» — clasifica diez ejemplos (panadería y
 *     milpa) en las cinco columnas: tierra, trabajo, capital, organización,
 *     tiempo.
 *  2. «¿Formal o informal?» — clasifica ocho actividades económicas en dos
 *     columnas según pertenezcan a la economía formal o a la informal.
 *  3. «La cadena productiva» — ordena de la producción al consumo los cinco
 *     eslabones que recorre el tomate de Sinaloa hasta llegar a la mesa.
 *  + Cuestionario de comprensión (V/F verbatim de A4 y A2).
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de CS-II·P03.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import {
  ITEMS_FACTOR,
  FACTOR_INFO,
  ITEMS_SECTOR,
  SECTOR_INFO,
  CADENA,
  QUIZ,
  DATO_PRODUCCION,
  type Factor,
  type Sector,
} from "./factores-produccion-data";

const NO = "#FF5E5E";
import { guardarEstrellas } from "@/app/actions/guardarEstrellas";
const RETO_KEY = "cen-factores-produccion-reto";

type Modo = "factores" | "sectores" | "cadena";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "factores", label: "Los factores de producción", icono: "fa-table-columns" },
  { id: "sectores", label: "¿Formal o informal?", icono: "fa-scale-balanced" },
  { id: "cadena", label: "La cadena productiva", icono: "fa-arrow-down-up-across-line" },
];

export function LabFactoresProduccion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("factores");

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

  // ── modo Factores (clasifica en 5 columnas) ────────────────────────────
  const [ubicadoF, setUbicadoF] = useState<Record<string, Factor>>({});
  const [selF, setSelF] = useState<string | null>(null);
  const [shakeF, setShakeF] = useState<Factor | null>(null);
  const factorLibres = ITEMS_FACTOR.filter((x) => !ubicadoF[x.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarFactor = (itemId: string, bin: Factor) => {
    if (ubicadoF[itemId]) return;
    const it = ITEMS_FACTOR.find((x) => x.id === itemId);
    if (it && it.factor === bin) {
      setUbicadoF((e) => ({ ...e, [itemId]: bin }));
      setSelF(null);
      sfxPlace();
      if (Object.keys(ubicadoF).length + 1 >= ITEMS_FACTOR.length) {
        sfxOk();
        persistMejor(true, sectoresDone, cadenaDone);
      }
    } else {
      setShakeF(bin);
      sfxNo();
      window.setTimeout(() => setShakeF(null), 420);
    }
  };
  const resetFactores = () => {
    setUbicadoF({});
    setSelF(null);
  };

  // ── modo Sectores (clasifica formal/informal) ──────────────────────────
  const [ubicadoS, setUbicadoS] = useState<Record<string, Sector>>({});
  const [selS, setSelS] = useState<string | null>(null);
  const [shakeS, setShakeS] = useState<Sector | null>(null);
  const sectorLibres = ITEMS_SECTOR.filter((x) => !ubicadoS[x.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarSector = (itemId: string, bin: Sector) => {
    if (ubicadoS[itemId]) return;
    const it = ITEMS_SECTOR.find((x) => x.id === itemId);
    if (it && it.sector === bin) {
      setUbicadoS((e) => ({ ...e, [itemId]: bin }));
      setSelS(null);
      sfxPlace();
      if (Object.keys(ubicadoS).length + 1 >= ITEMS_SECTOR.length) {
        sfxOk();
        persistMejor(factoresDone, true, cadenaDone);
      }
    } else {
      setShakeS(bin);
      sfxNo();
      window.setTimeout(() => setShakeS(null), 420);
    }
  };
  const resetSectores = () => {
    setUbicadoS({});
    setSelS(null);
  };

  // ── modo Cadena (ordena secuencialmente) ───────────────────────────────
  const [cadenaPos, setCadenaPos] = useState(0);
  const [selC, setSelC] = useState<string | null>(null);
  const [shakeC, setShakeC] = useState(false);
  const cadenaLibres = CADENA.filter((c) => c.orden >= cadenaPos).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarCadena = (pasoId: string) => {
    if (cadenaPos >= CADENA.length) return;
    const esperado = CADENA[cadenaPos]!;
    if (pasoId === esperado.id) {
      setCadenaPos((p) => p + 1);
      setSelC(null);
      sfxPlace();
      if (cadenaPos + 1 >= CADENA.length) {
        sfxOk();
        persistMejor(factoresDone, sectoresDone, true);
      }
    } else {
      setShakeC(true);
      sfxNo();
      window.setTimeout(() => setShakeC(false), 420);
    }
  };
  const resetCadena = () => {
    setCadenaPos(0);
    setSelC(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const factoresDone = Object.keys(ubicadoF).length >= ITEMS_FACTOR.length;
  const sectoresDone = Object.keys(ubicadoS).length >= ITEMS_SECTOR.length;
  const cadenaDone = cadenaPos >= CADENA.length;
  const estrellas = (factoresDone ? 1 : 0) + (sectoresDone ? 1 : 0) + (cadenaDone ? 1 : 0);

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
    { txt: "Clasifica los 10 ejemplos en sus 5 factores", done: factoresDone },
    { txt: "Separa las 8 actividades en formal/informal", done: sectoresDone },
    { txt: "Ordena la cadena de la producción al consumo", done: cadenaDone },
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

  const resetActual = modo === "factores" ? resetFactores : modo === "sectores" ? resetSectores : resetCadena;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes fpShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes fpPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .fp-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .fp-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .fp-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .fp-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .fp-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .fp-icobtn:hover { background:rgba(255,255,255,0.12); }
        .fp-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13.5px; font-weight:800; transition:all .14s; user-select:none; text-align:center; }
        .fp-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .fp-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .fp-chip:active { cursor:grabbing; }
        .fp-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:15px; transition:all .16s; min-height:170px; }
        .fp-bin[data-shake="true"] { animation:fpShake .4s; border-color:${NO}; }
        .fp-slot { border-radius:13px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; padding:14px 16px; transition:all .16s;
          display:flex; align-items:center; gap:12px; color:${T.text3}; font-size:13.5px; cursor:pointer; }
        .fp-slot[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); color:#fff; }
        .fp-slot[data-shake="true"] { animation:fpShake .4s; border-color:${NO}; }
        .fp-step { border-radius:13px; border:1.5px solid ${OK}66; background:${OK}0f; padding:13px 16px; display:flex; align-items:center; gap:12px; animation:fpPop .25s ease; }
        .fp-locked { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:13px 16px; display:flex; align-items:center; gap:12px; opacity:0.45; }
        .fp-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .fp-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .fp-q:disabled{ cursor:default; }
        .fp-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .fp-btn:hover { border-color:${T.lineStrong}; }
        .fp-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .fp-bin[data-shake="true"], .fp-slot[data-shake="true"] { animation:none; } }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="fp-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="fp-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="fp-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — Factores de producción */}
          {modo === "factores" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada ejemplo a su factor de producción</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: factoresDone ? OK : T.text3 }}>
                    {Object.keys(ubicadoF).length}/{ITEMS_FACTOR.length}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
                  Toda producción combina <strong style={{ color: T.text2 }}>tierra, trabajo, capital, organización y tiempo</strong>.
                </div>
                {factorLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los 10 ejemplos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {factorLibres.map((x) => (
                      <button key={x.id} className="fp-chip" data-sel={selF === x.id} onClick={() => setSelF((s) => (s === x.id ? null : x.id))} {...dragProps(x.id)}>
                        {x.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsFactor selF={selF} shakeF={shakeF} ubicadoF={ubicadoF} onMatch={intentarFactor} dropProps={dropProps} />
            </>
          )}

          {/* MODO 2 — Formal o informal */}
          {modo === "sectores" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada actividad a la economía que le corresponde</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: sectoresDone ? OK : T.text3 }}>
                    {Object.keys(ubicadoS).length}/{ITEMS_SECTOR.length}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
                  En México, cerca del <strong style={{ color: T.text2 }}>55%</strong> del empleo es informal: sin contrato ni seguridad social.
                </div>
                {sectorLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Separaste las 8 actividades!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {sectorLibres.map((x) => (
                      <button key={x.id} className="fp-chip" data-sel={selS === x.id} onClick={() => setSelS((s) => (s === x.id ? null : x.id))} {...dragProps(x.id)}>
                        {x.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsSector selS={selS} shakeS={shakeS} ubicadoS={ubicadoS} onMatch={intentarSector} dropProps={dropProps} />
            </>
          )}

          {/* MODO 3 — La cadena productiva */}
          {modo === "cadena" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Ordena la cadena: del campo a la mesa</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: cadenaDone ? OK : T.text3 }}>
                    {cadenaPos}/{CADENA.length}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
                  Arrastra el <strong style={{ color: T.text2 }}>siguiente eslabón</strong> al hueco activo, en orden de producción → distribución → consumo.
                </div>
                {cadenaLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Reconstruiste la cadena del tomate!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {cadenaLibres.map((c) => (
                      <button key={c.id} className="fp-chip" data-sel={selC === c.id} onClick={() => setSelC((s) => (s === c.id ? null : c.id))} {...dragProps(c.id)}>
                        {c.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <CadenaOrden selC={selC} shakeC={shakeC} cadenaPos={cadenaPos} onMatch={intentarCadena} dropProps={dropProps} />
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

            <div className="fp-divider" />

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
                  {bestEstrellas >= 3 ? "¡Dominas los factores y la cadena productiva!" : "Completa los tres modos para ganar las estrellas."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "factores" && (
                <>En una panadería: la <strong style={{ color: T.text }}>harina</strong> es tierra, los <strong style={{ color: T.text }}>panaderos</strong> trabajo, el <strong style={{ color: T.text }}>horno</strong> capital.</>
              )}
              {modo === "sectores" && (
                <>Lo <strong style={{ color: T.text }}>formal</strong> está registrado y regulado (IMSS, facturas); lo <strong style={{ color: T.text }}>informal</strong> queda fuera del sistema.</>
              )}
              {modo === "cadena" && (
                <>Entre el productor y tú hay <strong style={{ color: T.text }}>intermediarios</strong> y <strong style={{ color: T.text }}>transportistas</strong>: cada eslabón se queda con una parte.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_PRODUCCION}</span>
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

function BinsFactor({
  selF,
  shakeF,
  ubicadoF,
  onMatch,
  dropProps,
}: {
  selF: string | null;
  shakeF: Factor | null;
  ubicadoF: Record<string, Factor>;
  onMatch: (itemId: string, bin: Factor) => void;
  dropProps: DropFactory;
}) {
  const bins: Factor[] = ["tierra", "trabajo", "capital", "organizacion", "tiempo"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = FACTOR_INFO[bin];
        const dentro = ITEMS_FACTOR.filter((x) => ubicadoF[x.id] === bin);
        return (
          <div
            key={bin}
            className="fp-bin"
            data-shake={shakeF === bin}
            onClick={() => selF && onMatch(selF, bin)}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <i className={`fa-solid ${info.icono}`} style={{ color: T.text2 }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 12 }}>{info.descripcion}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((x) => (
                  <span key={x.id} style={{ animation: "fpPop .25s ease", display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 999, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff" }}>
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

function BinsSector({
  selS,
  shakeS,
  ubicadoS,
  onMatch,
  dropProps,
}: {
  selS: string | null;
  shakeS: Sector | null;
  ubicadoS: Record<string, Sector>;
  onMatch: (itemId: string, bin: Sector) => void;
  dropProps: DropFactory;
}) {
  const bins: Sector[] = ["formal", "informal"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {bins.map((bin) => {
        const info = SECTOR_INFO[bin];
        const dentro = ITEMS_SECTOR.filter((x) => ubicadoS[x.id] === bin);
        return (
          <div
            key={bin}
            className="fp-bin"
            data-shake={shakeS === bin}
            onClick={() => selS && onMatch(selS, bin)}
            {...dropProps((id) => onMatch(id, bin))}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <i className={`fa-solid ${info.icono}`} style={{ color: T.text2 }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 12 }}>{info.descripcion}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((x) => (
                  <span key={x.id} style={{ animation: "fpPop .25s ease", display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 13px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 12.5, fontWeight: 700, color: "#fff", lineHeight: 1.35 }}>
                    <i className="fa-solid fa-check" style={{ color: OK, fontSize: 11, flexShrink: 0 }} />
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

function CadenaOrden({
  selC,
  shakeC,
  cadenaPos,
  onMatch,
  dropProps,
}: {
  selC: string | null;
  shakeC: boolean;
  cadenaPos: number;
  onMatch: (pasoId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {CADENA.map((c, i) => {
        const num = (
          <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, border: `1.5px solid ${T.lineStrong}`, color: T.text2 }}>
            {i + 1}
          </span>
        );
        if (i < cadenaPos) {
          // ya colocado
          return (
            <div key={c.id} className="fp-step">
              <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, background: OK, color: "#04121f" }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "#fff", lineHeight: 1.35 }}>{c.texto}</div>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: OK, border: `1px solid ${OK}55`, borderRadius: 6, padding: "3px 9px", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 }}>
                {c.etapa}
              </span>
            </div>
          );
        }
        if (i === cadenaPos) {
          // hueco activo
          return (
            <div
              key={c.id}
              className="fp-slot"
              data-armed={!!selC}
              data-shake={shakeC}
              onClick={() => selC && onMatch(selC)}
              {...dropProps((id) => onMatch(id))}
            >
              {num}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-arrow-down" style={{ fontSize: 12 }} />
                <span style={{ fontWeight: 700 }}>Suelta aquí el siguiente eslabón</span>
              </div>
            </div>
          );
        }
        // bloqueado
        return (
          <div key={c.id} className="fp-locked">
            {num}
            <span style={{ fontSize: 13, color: T.text3 }}>
              <i className="fa-solid fa-lock" style={{ marginRight: 8, fontSize: 11 }} />
              Eslabón {i + 1}
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
        Cinco afirmaciones sobre los factores de producción y la cadena productiva. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
                    <button key={oi} className="fp-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="fp-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="fp-btn" onClick={reintentar}>
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
