"use client";

/**
 * Laboratorio — El Estado mexicano: elementos, poderes y conceptos.
 * Práctica experimental para CS-I-P01-A4 (Ciencias Sociales I · el Estado).
 *
 * Interactividad máxima: el alumno EXPERIMENTA arrastrando. Tres modos, tres
 * interacciones distintas:
 *  1. «Arma el Estado»       — arrastra los tres elementos constitutivos
 *     (territorio, población, gobierno) y rechaza los símbolos patrios.
 *  2. «División de poderes»  — clasifica cargos y funciones en los tres poderes
 *     (Ejecutivo / Legislativo / Judicial).
 *  3. «Conceptos clave»      — empareja cada concepto con su definición.
 *  + Cuestionario de comprensión.
 *
 * DOM puro (sin three.js): ligero, accesible (ratón, teclado y táctil mediante
 * clic-para-seleccionar / clic-para-colocar). Contenido VERBATIM de CS-I·P01
 * (A1 lectura, A4 quiz, A5 V/F, A6 glosario).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import {
  ELEMENTOS,
  ITEMS_PODER,
  PODER_INFO,
  CONCEPTOS,
  QUIZ,
  DATO_ESTADO,
  type Poder,
} from "./estado-mexicano-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-estado-mexicano-reto";

type Modo = "armar" | "poderes" | "conceptos";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "armar", label: "Arma el Estado", icono: "fa-cubes-stacked" },
  { id: "poderes", label: "División de poderes", icono: "fa-scale-balanced" },
  { id: "conceptos", label: "Conceptos clave", icono: "fa-link" },
];

const porNombre = (a: { nombre: string }, b: { nombre: string }) => a.nombre.localeCompare(b.nombre, "es");
const porTexto = (a: { texto: string }, b: { texto: string }) => a.texto.localeCompare(b.texto, "es");
const porTermino = (a: { termino: string }, b: { termino: string }) => a.termino.localeCompare(b.termino, "es");

export function LabEstadoMexicano({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("armar");

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

  // ── modo Armar (elementos constitutivos vs símbolos patrios) ──────────
  const NUM_CONSTITUTIVOS = ELEMENTOS.filter((e) => e.constitutivo).length;
  const [dentroEstado, setDentroEstado] = useState<string[]>([]);
  const [selEl, setSelEl] = useState<string | null>(null);
  const [shakeEstado, setShakeEstado] = useState(false);
  const [rechazo, setRechazo] = useState<string | null>(null);
  const elementosLibres = ELEMENTOS.filter((e) => !dentroEstado.includes(e.id)).slice().sort(porNombre);

  const intentarEl = (elId: string) => {
    const el = ELEMENTOS.find((x) => x.id === elId);
    if (!el || dentroEstado.includes(elId)) return;
    if (el.constitutivo) {
      const nuevo = [...dentroEstado, elId];
      setDentroEstado(nuevo);
      setSelEl(null);
      setRechazo(null);
      sfxPlace();
      if (nuevo.length >= NUM_CONSTITUTIVOS) {
        sfxOk();
        persistMejor(true, poderesDone, conceptosDone);
      }
    } else {
      setShakeEstado(true);
      setRechazo(el.detalle);
      sfxNo();
      window.setTimeout(() => setShakeEstado(false), 420);
    }
  };
  const resetArmar = () => {
    setDentroEstado([]);
    setSelEl(null);
    setRechazo(null);
  };

  // ── modo Poderes (clasificar en 3 poderes) ────────────────────────────
  const [ubicPoder, setUbicPoder] = useState<Record<string, Poder>>({});
  const [selItem, setSelItem] = useState<string | null>(null);
  const [shakePoder, setShakePoder] = useState<Poder | null>(null);
  const itemsLibres = ITEMS_PODER.filter((i) => !ubicPoder[i.id]).slice().sort(porTexto);

  const intentarItem = (itemId: string, poder: Poder) => {
    const it = ITEMS_PODER.find((x) => x.id === itemId);
    if (!it || ubicPoder[itemId]) return;
    if (it.poder === poder) {
      setUbicPoder((u) => ({ ...u, [itemId]: poder }));
      setSelItem(null);
      sfxPlace();
      if (Object.keys(ubicPoder).length + 1 >= ITEMS_PODER.length) {
        sfxOk();
        persistMejor(armarDone, true, conceptosDone);
      }
    } else {
      setShakePoder(poder);
      sfxNo();
      window.setTimeout(() => setShakePoder(null), 420);
    }
  };
  const resetPoderes = () => {
    setUbicPoder({});
    setSelItem(null);
  };

  // ── modo Conceptos (emparejar concepto → definición) ──────────────────
  const [empConcepto, setEmpConcepto] = useState<Record<string, boolean>>({});
  const [selConcepto, setSelConcepto] = useState<string | null>(null);
  const [shakeConRow, setShakeConRow] = useState<string | null>(null);
  const conceptosLibres = CONCEPTOS.filter((c) => !empConcepto[c.id]).slice().sort(porTermino);

  const intentarConcepto = (conId: string, rowId: string) => {
    if (empConcepto[rowId]) return;
    if (conId === rowId) {
      setEmpConcepto((e) => ({ ...e, [rowId]: true }));
      setSelConcepto(null);
      sfxPlace();
      if (Object.keys(empConcepto).length + 1 >= CONCEPTOS.length) {
        sfxOk();
        persistMejor(armarDone, poderesDone, true);
      }
    } else {
      setShakeConRow(rowId);
      sfxNo();
      window.setTimeout(() => setShakeConRow(null), 420);
    }
  };
  const resetConceptos = () => {
    setEmpConcepto({});
    setSelConcepto(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const armarDone = dentroEstado.length >= NUM_CONSTITUTIVOS;
  const poderesDone = Object.keys(ubicPoder).length >= ITEMS_PODER.length;
  const conceptosDone = Object.keys(empConcepto).length >= CONCEPTOS.length;
  const estrellas = (armarDone ? 1 : 0) + (poderesDone ? 1 : 0) + (conceptosDone ? 1 : 0);

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
    { txt: "Arma el Estado con sus 3 elementos constitutivos", done: armarDone },
    { txt: "Clasifica los cargos en los 3 poderes", done: poderesDone },
    { txt: "Empareja los 5 conceptos con su definición", done: conceptosDone },
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

  const resetActual = modo === "armar" ? resetArmar : modo === "poderes" ? resetPoderes : resetConceptos;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes estShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes estPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .est-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .est-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .est-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .est-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .est-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .est-icobtn:hover { background:rgba(255,255,255,0.12); }
        .est-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:all .14s; user-select:none; }
        .est-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .est-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .est-chip:active { cursor:grabbing; }
        .est-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:16px; min-height:140px; transition:all .16s; }
        .est-bin[data-shake="true"] { animation:estShake .4s; }
        .est-zona { border-radius:18px; border:2.5px dashed ${T.lineStrong}; padding:22px; min-height:180px; transition:all .16s; }
        .est-zona[data-shake="true"] { animation:estShake .4s; border-color:${NO}; }
        .est-zona[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.07); }
        .est-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:13px 15px; transition:all .16s; display:flex; align-items:center; gap:14px; }
        .est-row[data-shake="true"] { animation:estShake .4s; border-color:${NO}; }
        .est-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .est-drop { flex-shrink:0; min-width:170px; min-height:46px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; transition:all .16s; cursor:pointer; padding:4px 10px; text-align:center; }
        .est-drop[data-armed="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); }
        .est-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .est-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .est-q:disabled{ cursor:default; }
        .est-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .est-btn:hover { border-color:${T.lineStrong}; }
        .est-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .est-bin[data-shake="true"], .est-zona[data-shake="true"], .est-row[data-shake="true"] { animation:none; } }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="est-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="est-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="est-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* MODO 1 — armar el Estado */}
          {modo === "armar" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra al Estado solo sus elementos constitutivos</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: armarDone ? OK : T.text3 }}>
                    {dentroEstado.length}/{NUM_CONSTITUTIVOS}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>
                  El Estado clásico se define por tres elementos. Cuidado: hay distractores que <strong style={{ color: T.text2 }}>parecen</strong> parte del Estado pero no lo son.
                </div>
                {elementosLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Solo quedaron los elementos correctos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {elementosLibres.map((e) => (
                      <button key={e.id} className="est-chip" data-sel={selEl === e.id} onClick={() => setSelEl((s) => (s === e.id ? null : e.id))} {...dragProps(e.id)}>
                        <i className={`fa-solid ${e.icono}`} style={{ fontSize: 13, opacity: 0.85 }} />
                        {e.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <EstadoZona
                dentroEstado={dentroEstado}
                selEl={selEl}
                shakeEstado={shakeEstado}
                rechazo={rechazo}
                onDropEl={intentarEl}
                dropProps={dropProps}
                accent={accent}
              />
            </>
          )}

          {/* MODO 2 — división de poderes (clasificar) */}
          {modo === "poderes" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada cargo o función a su poder</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: poderesDone ? OK : T.text3 }}>
                    {Object.keys(ubicPoder).length}/{ITEMS_PODER.length}
                  </span>
                </div>
                {itemsLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {ITEMS_PODER.length} elementos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {itemsLibres.map((it) => (
                      <button key={it.id} className="est-chip" data-sel={selItem === it.id} onClick={() => setSelItem((s) => (s === it.id ? null : it.id))} {...dragProps(it.id)}>
                        <i className={`fa-solid ${it.esFuncion ? "fa-gears" : "fa-user"}`} style={{ fontSize: 12, opacity: 0.7 }} />
                        {it.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsPoderes selItem={selItem} shakePoder={shakePoder} ubicPoder={ubicPoder} onBin={intentarItem} dropProps={dropProps} />
            </>
          )}

          {/* MODO 3 — conceptos clave (emparejar) */}
          {modo === "conceptos" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada concepto hasta su definición</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: conceptosDone ? OK : T.text3 }}>
                    {Object.keys(empConcepto).length}/{CONCEPTOS.length}
                  </span>
                </div>
                {conceptosLibres.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {CONCEPTOS.length} conceptos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {conceptosLibres.map((c) => (
                      <button key={c.id} className="est-chip" data-sel={selConcepto === c.id} onClick={() => setSelConcepto((s) => (s === c.id ? null : c.id))} {...dragProps(c.id)}>
                        <i className="fa-solid fa-tag" style={{ fontSize: 12, opacity: 0.7 }} />
                        {c.termino}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsConceptos selConcepto={selConcepto} shakeConRow={shakeConRow} empConcepto={empConcepto} onMatch={intentarConcepto} dropProps={dropProps} />
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

            <div className="est-divider" />

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
                  {bestEstrellas >= 3 ? "¡Entiendes cómo se organiza el Estado!" : "Completa los tres modos para ganar las estrellas."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "armar" && (
                <>El Estado clásico tiene tres elementos: <strong style={{ color: T.text }}>territorio</strong>, <strong style={{ color: T.text }}>población</strong> y <strong style={{ color: T.text }}>gobierno</strong>. La bandera, el himno y el escudo son símbolos patrios, no elementos constitutivos.</>
              )}
              {modo === "poderes" && (
                <>Recuerda: el <strong style={{ color: T.text }}>Ejecutivo</strong> aplica las leyes, el <strong style={{ color: T.text }}>Legislativo</strong> las hace y el <strong style={{ color: T.text }}>Judicial</strong> imparte justicia. Se controlan mutuamente (pesos y contrapesos).</>
              )}
              {modo === "conceptos" && (
                <>Lee la definición y arrastra el concepto correcto. Ojo con <strong style={{ color: T.text }}>captura del Estado</strong> e <strong style={{ color: T.text }}>impunidad</strong>: describen fallas del Estado.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_ESTADO}</span>
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

function EstadoZona({
  dentroEstado,
  selEl,
  shakeEstado,
  rechazo,
  onDropEl,
  dropProps,
  accent,
}: {
  dentroEstado: string[];
  selEl: string | null;
  shakeEstado: boolean;
  rechazo: string | null;
  onDropEl: (id: string) => void;
  dropProps: DropFactory;
  accent: string;
}) {
  const dentro = ELEMENTOS.filter((e) => dentroEstado.includes(e.id));
  return (
    <div
      className="est-zona"
      data-shake={shakeEstado}
      data-armed={!!selEl}
      onClick={() => selEl && onDropEl(selEl)}
      {...dropProps((id) => onDropEl(id))}
      style={{ cursor: selEl ? "pointer" : "default" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
        <span style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "#fff", background: `${accent}33` }}>
          <i className="fa-solid fa-building-columns" />
        </span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>El Estado</div>
          <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.3 }}>Suelta aquí sus elementos constitutivos</div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {dentro.map((d) => (
          <span key={d.id} style={{ animation: "estPop .25s ease", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 800, color: "#fff", padding: "9px 15px", borderRadius: 999, background: `${OK}26`, border: `1px solid ${OK}66` }}>
            <i className={`fa-solid ${d.icono}`} style={{ fontSize: 13 }} />
            {d.nombre}
          </span>
        ))}
        {dentro.length === 0 && <span style={{ fontSize: 12, color: T.text3, fontStyle: "italic" }}>Aún no has colocado ningún elemento…</span>}
      </div>

      {rechazo && (
        <div style={{ marginTop: 14, fontSize: 12.5, color: "#fff", lineHeight: 1.45, display: "flex", gap: 9, padding: "10px 13px", borderRadius: 10, background: `${NO}1c`, border: `1px solid ${NO}55` }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: NO, marginTop: 2 }} />
          <span>{rechazo}</span>
        </div>
      )}
    </div>
  );
}

function BinsPoderes({
  selItem,
  shakePoder,
  ubicPoder,
  onBin,
  dropProps,
}: {
  selItem: string | null;
  shakePoder: Poder | null;
  ubicPoder: Record<string, Poder>;
  onBin: (itemId: string, poder: Poder) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
      {(["ejecutivo", "legislativo", "judicial"] as Poder[]).map((poder) => {
        const info = PODER_INFO[poder];
        const dentro = ITEMS_PODER.filter((i) => ubicPoder[i.id] === poder);
        return (
          <div
            key={poder}
            className="est-bin"
            data-shake={shakePoder === poder}
            onClick={() => selItem && onBin(selItem, poder)}
            {...dropProps((id) => onBin(id, poder))}
            style={{ borderColor: `${info.color}66`, background: `${info.color}0d`, cursor: selItem ? "pointer" : "default" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", background: `${info.color}33` }}>
                <i className={`fa-solid ${info.icono}`} />
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 900, color: "#fff" }}>{info.label}</div>
                <div style={{ fontSize: 10, color: T.text3, lineHeight: 1.25 }}>{info.descripcion}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {dentro.map((d) => (
                <span key={d.id} style={{ animation: "estPop .25s ease", fontSize: 12, fontWeight: 700, color: "#fff", padding: "6px 11px", borderRadius: 999, background: `${info.color}26`, border: `1px solid ${info.color}55` }}>
                  {d.texto}
                </span>
              ))}
              {dentro.length === 0 && <span style={{ fontSize: 11, color: T.text3, fontStyle: "italic" }}>Suelta aquí…</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RowsConceptos({
  selConcepto,
  shakeConRow,
  empConcepto,
  onMatch,
  dropProps,
}: {
  selConcepto: string | null;
  shakeConRow: string | null;
  empConcepto: Record<string, boolean>;
  onMatch: (conId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {CONCEPTOS.map((c) => {
        const done = empConcepto[c.id];
        return (
          <div
            key={c.id}
            className="est-row"
            data-shake={shakeConRow === c.id}
            data-done={done}
            onClick={() => !done && selConcepto && onMatch(selConcepto, c.id)}
            {...dropProps((id) => onMatch(id, c.id))}
          >
            <div className="est-drop" data-armed={!done && !!selConcepto} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "estPop .25s ease", fontSize: 13, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-tag" />
                  {c.termino}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} /> concepto
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: done ? "#fff" : T.text2, lineHeight: 1.45 }}>{c.definicion}</div>
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
        Cinco preguntas sobre el Estado, sus elementos, los tres poderes y sus conceptos clave. Responde y pulsa «Comprobar».
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
                    <button key={oi} className="est-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="est-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="est-btn" onClick={reintentar}>
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
