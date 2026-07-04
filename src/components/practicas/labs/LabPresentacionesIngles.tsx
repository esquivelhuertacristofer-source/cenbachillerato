"use client";

/**
 * Laboratorio — English Lab: Greetings & introductions.
 * Práctica experimental para IN-I-P01-A2 (Inglés I · presentaciones).
 *
 * Interactividad máxima: el alumno EXPERIMENTA con la lengua. Tres modos:
 *  1. «Build the sentence»: arrastra las palabras hasta ordenar cada oración
 *     (My name is Valeria / I am from Guadalajara / This is my friend Diego /
 *     Nice to meet you). Solo avanza con la palabra correcta a continuación.
 *  2. «The verb to be»: arrastra cada sujeto (I, You, He, She, It, We, They) a
 *     su forma del verbo to be (am / is / are).
 *  3. «Greeting, introduction or farewell?»: arrastra cada frase a su función.
 *  + Cuestionario de comprensión.
 *
 * DOM puro (sin three.js): no infla el bundle del Worker y funciona con ratón,
 * teclado y pantalla táctil (clic-para-seleccionar y clic-para-colocar).
 *
 * Contenido VERBATIM de las actividades A1/A2/A4/A6 de IN-I·P01.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import {
  ORACIONES,
  SUJETOS,
  TOBE_INFO,
  FRASES,
  FUNCION_INFO,
  QUIZ,
  DATO_INGLES,
  type ToBe,
  type Funcion,
} from "./ingles-presentaciones-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-ingles-presentaciones-reto";

type Modo = "construir" | "tobe" | "funciones";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "construir", label: "Build the sentence", icono: "fa-quote-right" },
  { id: "tobe", label: "The verb to be", icono: "fa-equals" },
  { id: "funciones", label: "Greeting or farewell?", icono: "fa-comments" },
];

const porTexto = (a: { texto: string }, b: { texto: string }) => a.texto.localeCompare(b.texto, "en");

export function LabPresentacionesIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("construir");

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

  // ── modo Construir (ordenar palabras) ─────────────────────────────────
  const [oraIdx, setOraIdx] = useState(0);
  const [colocadas, setColocadas] = useState<Record<string, number[]>>({});
  const [armadas, setArmadas] = useState<Set<string>>(() => new Set<string>());
  const [selWord, setSelWord] = useState<number | null>(null);
  const [shakeWord, setShakeWord] = useState(false);

  const oracion = ORACIONES[oraIdx]!;
  const placed = colocadas[oracion.id] ?? [];
  const libresIdx = oracion.palabras
    .map((palabra, idx) => ({ palabra, idx }))
    .filter((w) => !placed.includes(w.idx))
    .sort((a, b) => a.palabra.localeCompare(b.palabra, "en"));

  const intentarPalabra = (idx: number) => {
    if (placed.includes(idx)) return;
    const nextPos = placed.length;
    if (oracion.palabras[idx] === oracion.palabras[nextPos]) {
      const nuevo = [...placed, idx];
      setColocadas((c) => ({ ...c, [oracion.id]: nuevo }));
      setSelWord(null);
      sfxPlace();
      if (nuevo.length >= oracion.palabras.length) {
        const nuevasArmadas = new Set(armadas).add(oracion.id);
        setArmadas(nuevasArmadas);
        sfxOk();
        persistMejor(nuevasArmadas.size >= ORACIONES.length, tobeDone, funcionesDone);
      }
    } else {
      setShakeWord(true);
      sfxNo();
      window.setTimeout(() => setShakeWord(false), 420);
    }
  };
  const resetOracion = () => {
    setColocadas((c) => ({ ...c, [oracion.id]: [] }));
    setSelWord(null);
  };

  // ── modo To be (sujeto → am/is/are) ───────────────────────────────────
  const [ubicSuj, setUbicSuj] = useState<Record<string, ToBe>>({});
  const [selSuj, setSelSuj] = useState<string | null>(null);
  const [shakeBe, setShakeBe] = useState<ToBe | null>(null);
  const sujLibres = SUJETOS.filter((s) => !ubicSuj[s.id]);

  const intentarBe = (sujId: string, forma: ToBe) => {
    const s = SUJETOS.find((x) => x.id === sujId);
    if (!s || ubicSuj[sujId]) return;
    if (s.forma === forma) {
      setUbicSuj((u) => ({ ...u, [sujId]: forma }));
      setSelSuj(null);
      sfxPlace();
      if (Object.keys(ubicSuj).length + 1 >= SUJETOS.length) {
        sfxOk();
        persistMejor(armarDone, true, funcionesDone);
      }
    } else {
      setShakeBe(forma);
      sfxNo();
      window.setTimeout(() => setShakeBe(null), 420);
    }
  };
  const resetBe = () => {
    setUbicSuj({});
    setSelSuj(null);
  };

  // ── modo Funciones (frase → greeting/introduction/farewell) ───────────
  const [ubicFra, setUbicFra] = useState<Record<string, Funcion>>({});
  const [selFra, setSelFra] = useState<string | null>(null);
  const [shakeFun, setShakeFun] = useState<Funcion | null>(null);
  const fraLibres = FRASES.filter((f) => !ubicFra[f.id]).slice().sort(porTexto);

  const intentarFuncion = (fraId: string, fun: Funcion) => {
    const f = FRASES.find((x) => x.id === fraId);
    if (!f || ubicFra[fraId]) return;
    if (f.funcion === fun) {
      setUbicFra((u) => ({ ...u, [fraId]: fun }));
      setSelFra(null);
      sfxPlace();
      if (Object.keys(ubicFra).length + 1 >= FRASES.length) {
        sfxOk();
        persistMejor(armarDone, tobeDone, true);
      }
    } else {
      setShakeFun(fun);
      sfxNo();
      window.setTimeout(() => setShakeFun(null), 420);
    }
  };
  const resetFunciones = () => {
    setUbicFra({});
    setSelFra(null);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const armarDone = armadas.size >= ORACIONES.length;
  const tobeDone = Object.keys(ubicSuj).length >= SUJETOS.length;
  const funcionesDone = Object.keys(ubicFra).length >= FRASES.length;
  const estrellas = (armarDone ? 1 : 0) + (tobeDone ? 1 : 0) + (funcionesDone ? 1 : 0);

  const [mejor, setMejor] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      return Number(window.localStorage.getItem(RETO_KEY)) || 0;
    } catch {
      return 0;
    }
  });
  const bestEstrellas = Math.max(estrellas, mejor);

  // Persiste la mejor marca al completar un modo (en el handler, no en un efecto).
  const persistMejor = (a: boolean, t: boolean, f: boolean) => {
    const est = (a ? 1 : 0) + (t ? 1 : 0) + (f ? 1 : 0);
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
    { txt: "Arma las 4 oraciones en inglés", done: armarDone },
    { txt: "Clasifica los 7 sujetos por su forma de «to be»", done: tobeDone },
    { txt: "Clasifica las 10 frases (saludo/presentación/despedida)", done: funcionesDone },
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

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes enShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes enPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .en-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .en-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .en-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .en-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .en-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .en-icobtn:hover { background:rgba(255,255,255,0.12); }
        .en-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; padding:11px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:15px; font-weight:800; transition:all .14s; user-select:none; }
        .en-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .en-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .en-chip:active { cursor:grabbing; }
        .en-bin { border-radius:16px; border:2px dashed ${T.lineStrong}; padding:16px; min-height:140px; transition:all .16s; }
        .en-bin[data-shake="true"] { animation:enShake .4s; }
        .en-slot { border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-width:74px; min-height:48px; padding:0 12px;
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:13px; gap:6px; transition:all .16s; }
        .en-slot[data-active="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); cursor:pointer; }
        .en-slot[data-shake="true"] { animation:enShake .4s; border-color:${NO}; }
        .en-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .en-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .en-q:disabled{ cursor:default; }
        .en-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .en-btn:hover { border-color:${T.lineStrong}; }
        .en-prob { cursor:pointer; padding:8px 13px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .en-prob:hover { border-color:${T.lineStrong}; color:#fff; }
        .en-prob[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .en-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }
        .en-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .en-slot[data-shake="true"], .en-bin[data-shake="true"] { animation:none; } }
      `}</style>

      {/* selector de modo + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="en-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="en-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button
          className="en-icobtn"
          onClick={modo === "construir" ? resetOracion : modo === "tobe" ? resetBe : resetFunciones}
          title="Reiniciar este modo"
        >
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }} className="en-grid">
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {modo === "construir" && (
            <ConstruirPanel
              accent={accent}
              oracion={oracion}
              oraIdx={oraIdx}
              armadas={armadas}
              placed={placed}
              libresIdx={libresIdx}
              selWord={selWord}
              shakeWord={shakeWord}
              onSelOracion={(i) => setOraIdx(i)}
              onSelWord={(idx) => setSelWord((p) => (p === idx ? null : idx))}
              onSlot={() => {
                if (selWord !== null) intentarPalabra(selWord);
              }}
              onDropSlot={(id) => intentarPalabra(Number(id))}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "tobe" && (
            <BinsPanel<ToBe>
              titulo="Arrastra cada sujeto a su forma del verbo «to be»"
              items={sujLibres.map((s) => ({ id: s.id, texto: s.texto, sub: s.traduccion }))}
              total={SUJETOS.length}
              colocados={Object.keys(ubicSuj).length}
              bins={(["am", "is", "are"] as ToBe[]).map((b) => ({
                key: b,
                info: TOBE_INFO[b],
                dentro: SUJETOS.filter((s) => ubicSuj[s.id] === b).map((s) => ({ id: s.id, texto: s.texto })),
              }))}
              sel={selSuj}
              shake={shakeBe}
              onSel={(id) => setSelSuj((p) => (p === id ? null : id))}
              onBin={(b) => {
                if (selSuj) intentarBe(selSuj, b);
              }}
              onDropBin={(id, b) => intentarBe(id, b)}
              dragProps={dragProps}
              dropProps={dropProps}
              hechoMsg="¡Clasificaste los 7 sujetos!"
            />
          )}

          {modo === "funciones" && (
            <BinsPanel<Funcion>
              titulo="Arrastra cada frase a su función comunicativa"
              items={fraLibres.map((f) => ({ id: f.id, texto: f.texto }))}
              total={FRASES.length}
              colocados={Object.keys(ubicFra).length}
              bins={(["greeting", "introduction", "farewell"] as Funcion[]).map((b) => ({
                key: b,
                info: FUNCION_INFO[b],
                dentro: FRASES.filter((f) => ubicFra[f.id] === b).map((f) => ({ id: f.id, texto: f.texto })),
              }))}
              sel={selFra}
              shake={shakeFun}
              onSel={(id) => setSelFra((p) => (p === id ? null : id))}
              onBin={(b) => {
                if (selFra) intentarFuncion(selFra, b);
              }}
              onDropBin={(id, b) => intentarFuncion(id, b)}
              dragProps={dragProps}
              dropProps={dropProps}
              hechoMsg="¡Clasificaste las 10 frases!"
            />
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

            <div className="en-divider" />

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
                  {bestEstrellas >= 3 ? "Great job! You did it!" : "Completa los tres modos para ganar las estrellas."}
                </div>
              </div>
            </div>
          </div>

          {/* pista del modo actual */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "construir" && (
                <>Lee la traducción y arrastra las palabras una por una. El orden básico en inglés es <strong style={{ color: T.text }}>sujeto + verbo + complemento</strong>.</>
              )}
              {modo === "tobe" && (
                <>El verbo <strong style={{ color: T.text }}>to be</strong>: <strong style={{ color: T.text }}>I am</strong>, <strong style={{ color: T.text }}>he/she/it is</strong>, <strong style={{ color: T.text }}>you/we/they are</strong>.</>
              )}
              {modo === "funciones" && (
                <>Un <strong style={{ color: T.text }}>greeting</strong> abre la conversación, una <strong style={{ color: T.text }}>introduction</strong> presenta a alguien y un <strong style={{ color: T.text }}>farewell</strong> la cierra.</>
              )}
            </span>
          </div>

          {/* dato verbatim */}
          <div style={{ borderRadius: 18, padding: "16px 18px", border: `1px solid ${T.line}`, background: T.glass, fontSize: 12.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 12 }}>
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>{DATO_INGLES}</span>
          </div>
        </div>
      </div>

      <QuizCard
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel «Build the sentence» (ordenar palabras)
 * ═══════════════════════════════════════════════════════════════════════════ */
function ConstruirPanel({
  accent,
  oracion,
  oraIdx,
  armadas,
  placed,
  libresIdx,
  selWord,
  shakeWord,
  onSelOracion,
  onSelWord,
  onSlot,
  onDropSlot,
  dragProps,
  dropProps,
}: {
  accent: string;
  oracion: (typeof ORACIONES)[number];
  oraIdx: number;
  armadas: Set<string>;
  placed: number[];
  libresIdx: { palabra: string; idx: number }[];
  selWord: number | null;
  shakeWord: boolean;
  onSelOracion: (i: number) => void;
  onSelWord: (idx: number) => void;
  onSlot: () => void;
  onDropSlot: (id: string) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const completado = armadas.has(oracion.id);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {ORACIONES.map((o, i) => (
          <button key={o.id} className="en-prob" data-on={oraIdx === i} data-done={armadas.has(o.id)} onClick={() => onSelOracion(i)}>
            {armadas.has(o.id) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {i + 1}
          </button>
        ))}
      </div>

      <div style={{ ...card, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 10, flexWrap: "wrap" }}>
          <Eyebrow>
            <i className="fa-solid fa-language" style={{ marginRight: 8, color: accent }} />
            Traducción
          </Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: completado ? OK : T.text3 }}>
            {completado ? "Sentence complete ✓" : `${placed.length}/${oracion.palabras.length} words`}
          </span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 }}>«{oracion.traduccion}»</div>

        {/* slots de la oración */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 4 }}>
          {oracion.palabras.map((_, i) => {
            const colocadaIdx = placed[i];
            const palabra = colocadaIdx !== undefined ? oracion.palabras[colocadaIdx] : null;
            const esActivo = i === placed.length;
            if (palabra != null) {
              return (
                <span key={i} style={{ animation: "enPop .25s ease", display: "inline-flex", alignItems: "center", padding: "11px 16px", borderRadius: 11, border: `1.5px solid ${accent}`, background: `${accent}1f`, fontSize: 15, fontWeight: 800, color: "#fff" }}>
                  {palabra}
                </span>
              );
            }
            return (
              <span
                key={i}
                className="en-slot"
                data-active={esActivo}
                data-shake={esActivo && shakeWord}
                onClick={() => esActivo && onSlot()}
                {...(esActivo ? dropProps((id) => onDropSlot(id)) : {})}
              >
                {esActivo ? <i className="fa-solid fa-arrow-down" /> : <span style={{ opacity: 0.35 }}>·</span>}
              </span>
            );
          })}
        </div>
      </div>

      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Palabras — arrástralas en orden</Eyebrow>
        {libresIdx.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> Well done! Cambia de oración arriba para armar otra.
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {libresIdx.map((w) => (
              <button key={w.idx} className="en-chip" data-sel={selWord === w.idx} onClick={() => onSelWord(w.idx)} {...dragProps(String(w.idx))}>
                {w.palabra}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Panel genérico de clasificación por contenedores (to be / funciones)
 * ═══════════════════════════════════════════════════════════════════════════ */
type BinInfo = { label: string; descripcion: string; icono: string; color: string };
function BinsPanel<K extends string>({
  titulo,
  items,
  total,
  colocados,
  bins,
  sel,
  shake,
  onSel,
  onBin,
  onDropBin,
  dragProps,
  dropProps,
  hechoMsg,
}: {
  titulo: string;
  items: { id: string; texto: string; sub?: string }[];
  total: number;
  colocados: number;
  bins: { key: K; info: BinInfo; dentro: { id: string; texto: string }[] }[];
  sel: string | null;
  shake: K | null;
  onSel: (id: string) => void;
  onBin: (k: K) => void;
  onDropBin: (id: string, k: K) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
  hechoMsg: string;
}) {
  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>{titulo}</Eyebrow>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: colocados >= total ? OK : T.text3 }}>{colocados}/{total}</span>
        </div>
        {items.length === 0 ? (
          <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <i className="fa-solid fa-circle-check" /> {hechoMsg}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {items.map((it) => (
              <button key={it.id} className="en-chip" data-sel={sel === it.id} onClick={() => onSel(it.id)} {...dragProps(it.id)}>
                {it.texto}
                {it.sub && <span style={{ marginLeft: 7, fontSize: 11, fontWeight: 600, color: T.text3 }}>· {it.sub}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="en-bins">
        {bins.map((bin) => (
          <div
            key={bin.key}
            className="en-bin"
            data-shake={shake === bin.key}
            onClick={() => onBin(bin.key)}
            {...dropProps((id) => onDropBin(id, bin.key))}
            style={{ borderColor: `${bin.info.color}66`, background: `${bin.info.color}0d`, cursor: sel ? "pointer" : "default" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", background: `${bin.info.color}33` }}>
                <i className={`fa-solid ${bin.info.icono}`} />
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{bin.info.label}</div>
                <div style={{ fontSize: 10, color: T.text3, lineHeight: 1.3 }}>{bin.info.descripcion}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {bin.dentro.map((d) => (
                <span key={d.id} style={{ animation: "enPop .25s ease", fontSize: 13, fontWeight: 800, color: "#fff", padding: "6px 12px", borderRadius: 999, background: `${bin.info.color}26`, border: `1px solid ${bin.info.color}55` }}>
                  {d.texto}
                </span>
              ))}
              {bin.dentro.length === 0 && <span style={{ fontSize: 11.5, color: T.text3, fontStyle: "italic" }}>Empty</span>}
            </div>
          </div>
        ))}
      </div>
    </>
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
          Check your English
        </Eyebrow>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 12.5, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Cinco preguntas sobre saludos, el verbo «to be» y presentaciones. Responde y pulsa «Comprobar».
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
                    <button key={oi} className="en-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="en-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="en-btn" onClick={reintentar}>
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
