"use client";

/**
 * Laboratorio 3D — "El dogma central de la biología molecular".
 * Práctica experimental anclada a CNEYT-VI-P04-A1 (lectura "El dogma central de
 * la biología molecular"; progresión 4, UAC CNEYT-VI "Organismos y evolución
 * biológica"). P04 no tiene A2 manipulable (su A2 es un quiz V/F), por lo que el
 * laboratorio se ancla a la lectura A1, donde se explica el flujo ADN → ARN →
 * proteína, con datos verbatim del glosario A5 y de los quizzes A2/A4.
 *
 * Tres modos sobre UNA misma secuencia editable:
 *  (1) replicación   — ADN → ADN: la doble hélice se abre y cada hebra molde
 *                      templa una hebra nueva complementaria (A-T, G-C).
 *  (2) transcripción — ADN → ARNm: la hebra molde se transcribe a ARN (T→U).
 *  (3) traducción    — ARNm → proteína: el ribosoma lee codón a codón desde AUG
 *                      hasta el codón de parada y crece la cadena polipeptídica.
 */

import { useState, useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, SceneBoundary } from "./_kit";
import {
  type Modo,
  type Base,
  MODOS,
  MODOS_DEF,
  BASE_COLOR,
  SECUENCIAS,
  secuenciaPorId,
  limpiarADN,
  hebraMolde,
  transcribir,
  traducir,
  enzimasDe,
  CODON_TABLE,
  PROBLEMA,
  DEFINICION_DOGMA,
  CALLOUT_VIRUS,
  INSTRUCCIONES,
  PREGUNTAS,
  IDEAS,
  GLOSARIO,
  CONTEXTO,
  FUENTE,
  DATOS,
  HECHOS,
} from "./adn-dogma-data";

const AdnDogmaScene = dynamic(() => import("./AdnDogmaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-dna fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el dogma central en 3D…</span>
    </div>
  ),
});

/** Codones del código genético más representativos para la mini-tabla lateral. */
const CODON_DEMO: string[] = ["AUG", "UUU", "UUC", "GCA", "AAG", "GGU", "UGU", "UAA", "UAG", "UGA"];

export function LabAdnDogma({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("replicacion");
  const [presetId, setPresetId] = useState<string>("glosario");
  const [seq, setSeq] = useState<string>(secuenciaPorId("glosario").codificante);
  const [progreso, setProgreso] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  const bump = () => setResetNonce((n) => n + 1);

  // moléculas derivadas (matemática pura del módulo de datos)
  const codificante = seq.length > 0 ? seq : "ATG";
  const molde = hebraMolde(codificante);
  const arnm = transcribir(codificante);
  const codones = traducir(arnm);

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;
  const total = modo === "traduccion" ? codones.length : codificante.length;
  const paso = Math.min(progreso, total);

  // avance automático del proceso
  useEffect(() => {
    if (!playing || total === 0) return;
    if (paso >= total) return;
    const t = setInterval(() => setProgreso((p) => Math.min(total, p + 1)), 850);
    return () => clearInterval(t);
  }, [playing, total, paso]);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setProgreso(0);
    setPlaying(true);
    bump();
  };
  const reiniciar = () => {
    setProgreso(0);
    setPlaying(true);
    bump();
  };
  const elegirPreset = (id: string) => {
    setPresetId(id);
    setSeq(secuenciaPorId(id).codificante);
    setProgreso(0);
    setPlaying(true);
    bump();
  };
  const editarSeq = (v: string) => {
    setSeq(limpiarADN(v));
    setPresetId("");
    setProgreso(0);
    setPlaying(true);
    bump();
  };

  // proteína legible (abreviaturas hasta el codón de parada exclusive)
  const proteina = codones.filter((c) => !c.paro).map((c) => c.amino.abr);
  const ultimoCodon = codones[Math.min(paso, codones.length) - 1];
  const preset = presetId ? secuenciaPorId(presetId) : null;

  // pie del visor
  const pie: string =
    modo === "replicacion"
      ? `La helicasa abre la doble hélice y la ADN polimerasa copia ${paso}/${total} pares — A se aparea con T (2 puentes H) y G con C (3 puentes H).`
      : modo === "transcripcion"
        ? `La ARN polimerasa lee la hebra molde y sintetiza el ARNm: ${paso}/${total} bases (la timina T se reemplaza por uracilo U).`
        : `El ribosoma traduce el ARNm codón a codón: ${paso}/${total} codones leídos${ultimoCodon ? ` · último: ${ultimoCodon.codon} → ${ultimoCodon.amino.abr}` : ""}.`;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {DEFINICION_DOGMA}
      </div>
    </div>
  );

  /* ── Tira de bases monoespaciada (valor JSX, no componente) ──────────── */
  const tira = (cadena: string, etiqueta: string, activos: (i: number) => boolean, tenue?: (i: number) => boolean): ReactNode => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, marginBottom: 4, textTransform: "uppercase" }}>{etiqueta}</div>
      <div className="ad-strip">
        {cadena.split("").map((b, i) => (
          <span
            key={i}
            className="ad-base"
            data-on={activos(i)}
            style={{
              color: BASE_COLOR[b as Base] ?? "#fff",
              borderColor: activos(i) ? (BASE_COLOR[b as Base] ?? "#fff") : "transparent",
              opacity: tenue && tenue(i) ? 0.32 : 1,
            }}
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  );

  /* ── Panel de control específico del modo ──────────────────────────── */
  let control: ReactNode = null;
  if (modo === "replicacion") {
    control = (
      <>
        {tira(codificante, "Hebra codificante (sentido) 5'→3'", (i) => i === paso, (i) => i > paso)}
        {tira(molde, "Hebra molde (antiparalela) 3'→5'", (i) => i === paso, (i) => i > paso)}
        <div style={{ marginTop: 6, padding: "11px 13px", borderRadius: 11, border: `1px solid ${modoCol}44`, background: `${modoCol}12`, fontSize: 12, color: "#eaf0fb", lineHeight: 1.5 }}>
          <i className="fa-solid fa-circle-info" style={{ color: modoCol, marginRight: 8 }} />
          Replicación <strong>semiconservativa</strong>: tras copiar las {total} bases obtienes dos moléculas hijas idénticas, cada una con una hebra parental y una nueva.
          {paso >= total && <strong style={{ color: "#86efac" }}> {" "}✓ {paso}/{total} copiadas.</strong>}
        </div>
      </>
    );
  } else if (modo === "transcripcion") {
    control = (
      <>
        {tira(molde, "Hebra molde del ADN 3'→5'", (i) => i === paso, (i) => i > paso)}
        {tira(arnm, "ARN mensajero 5'→3' (T → U)", (i) => i < paso, (i) => i >= paso)}
        <div style={{ marginTop: 6, padding: "11px 13px", borderRadius: 11, border: `1px solid ${modoCol}44`, background: `${modoCol}12`, fontSize: 12, color: "#eaf0fb", lineHeight: 1.5 }}>
          <i className="fa-solid fa-circle-info" style={{ color: modoCol, marginRight: 8 }} />
          La ARN polimerasa sintetiza el ARNm complementario a la hebra molde; la <strong>timina (T)</strong> del ADN se sustituye por <strong>uracilo (U)</strong> en el ARN.
        </div>
      </>
    );
  } else {
    control = (
      <>
        {tira(arnm, "ARN mensajero 5'→3'", (i) => {
          const c = codones[paso - 1];
          if (!c) return false;
          const start = arnm.indexOf("AUG");
          return i >= start + (paso - 1) * 3 && i < start + paso * 3;
        })}
        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "4px 0", textTransform: "uppercase" }}>Proteína (aminoácidos)</div>
        <div className="ad-chips">
          {codones.map((c, i) => {
            const leido = i < paso;
            return (
              <span key={i} className="ad-chip" data-on={leido} style={{ borderColor: leido ? c.amino.color : "rgba(255,255,255,0.12)", background: leido ? `${c.amino.color}1e` : "transparent", color: leido ? "#fff" : T.text3 }}>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, opacity: 0.8 }}>{c.codon}</span>
                <strong style={{ color: leido ? c.amino.color : T.text3 }}>{c.paro ? "STOP" : c.amino.abr}</strong>
              </span>
            );
          })}
          {codones.length === 0 && <span style={{ fontSize: 11.5, color: T.text3 }}>La secuencia no contiene el codón de inicio AUG.</span>}
        </div>
        <div style={{ marginTop: 10, padding: "11px 13px", borderRadius: 11, border: `1px solid ${modoCol}44`, background: `${modoCol}12`, fontSize: 12, color: "#eaf0fb", lineHeight: 1.5 }}>
          <i className="fa-solid fa-circle-info" style={{ color: modoCol, marginRight: 8 }} />
          El ribosoma empieza en <strong>AUG (metionina)</strong> y se detiene en el primer codón de parada (UAA, UAG o UGA). Proteína: <strong style={{ color: "#86efac" }}>{proteina.length > 0 ? proteina.join("-") : "—"}</strong>.
        </div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes adPulse { 0%,100%{ box-shadow:0 0 0 0 var(--add); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ad-live-dot { animation: adPulse 1.6s ease-in-out infinite; }
        .ad-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ad-grid { grid-template-columns: 1fr; } }
        .ad-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ad-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ad-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ad-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .ad-tab { cursor:pointer; border:1px solid var(--adc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .ad-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .ad-tab:hover { background:rgba(255,255,255,0.06); }
        .ad-strip { display:flex; flex-wrap:wrap; gap:3px; }
        .ad-base { font-family:ui-monospace,monospace; font-size:14px; font-weight:900; width:22px; height:26px;
          display:flex; align-items:center; justify-content:center; border-radius:6px; border:1.5px solid transparent;
          background:rgba(4,10,22,0.45); transition:all .12s; }
        .ad-base[data-on="true"] { transform:translateY(-2px); background:rgba(255,255,255,0.06); }
        .ad-chips { display:flex; flex-wrap:wrap; gap:6px; }
        .ad-chip { display:inline-flex; flex-direction:column; align-items:center; gap:1px; padding:5px 9px; border-radius:9px;
          border:1px solid; font-size:11.5px; font-weight:900; transition:all .12s; }
        .ad-range { width:100%; accent-color: var(--adc); cursor:pointer; }
        .ad-seq { width:100%; box-sizing:border-box; font-family:ui-monospace,monospace; font-size:14px; font-weight:800;
          letter-spacing:0.12em; color:#fff; background:rgba(4,10,22,0.55); border:1px solid var(--adc); border-radius:10px;
          padding:10px 12px; outline:none; text-transform:uppercase; }
        @media (max-width: 1000px){ .ad-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="ad-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="ad-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--adc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}><i className={`fa-solid ${d.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="ad-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 58vh, 660px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <AdnDogmaScene
                modo={modo}
                codificante={codificante}
                molde={molde}
                arnm={arnm}
                codones={codones}
                progreso={paso}
                total={total}
                playing={playing}
                accent={accent}
                modoColor={modoCol}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="ad-live-dot" style={{ ["--add" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{def.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ad-icobtn" onClick={() => { setPlaying(false); setProgreso((p) => Math.max(0, p - 1)); }} title="Paso atrás">
                <i className="fa-solid fa-backward-step" />
              </button>
              <button className="ad-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reanudar"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="ad-icobtn" onClick={() => { setPlaying(false); setProgreso((p) => Math.min(total, p + 1)); }} title="Paso adelante">
                <i className="fa-solid fa-forward-step" />
              </button>
              <button className="ad-icobtn" onClick={reiniciar} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>{pie}</div>
            </div>
          </div>

          {/* Panel de control del modo */}
          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                Controles — {def.etq}
              </Eyebrow>
              <span style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: "#7dd3fc", border: "1px solid #7dd3fc55", borderRadius: 6, padding: "3px 7px" }}>
                LECTURA A1
              </span>
            </div>

            {/* Secuencia: presets + edición */}
            <Eyebrow><i className="fa-solid fa-pen-to-square" style={{ marginRight: 8, color: modoCol }} />Secuencia de ADN (codificante)</Eyebrow>
            <div className="ad-tabs" style={{ marginBottom: 10 }}>
              {SECUENCIAS.map((s) => {
                const on = s.id === presetId;
                return (
                  <button key={s.id} className="ad-tab" data-on={on} onClick={() => elegirPreset(s.id)} style={{ ["--adc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                    <div style={{ fontSize: 14, marginBottom: 3, color: on ? modoCol : "inherit" }}><i className={`fa-solid ${s.icono}`} /></div>
                    <div style={{ fontSize: 10.5, fontWeight: 900, lineHeight: 1.15 }}>{s.etq}</div>
                  </button>
                );
              })}
            </div>
            <input className="ad-seq" value={codificante} onChange={(e) => editarSeq(e.target.value)} spellCheck={false} maxLength={30} placeholder="ESCRIBE TU ADN (A, T, G, C)" style={{ ["--adc" as string]: modoCol, marginBottom: preset ? 8 : 14 }} />
            {preset && (
              <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45, marginBottom: 14 }}>
                <i className="fa-solid fa-circle-info" style={{ color: modoCol, marginRight: 7 }} />{preset.nota}
              </div>
            )}

            {/* progreso */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: T.text3 }}>{modo === "traduccion" ? "CODONES" : "BASES"}</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{paso} / {total}</span>
            </div>
            <input type="range" min={0} max={total} value={paso} onChange={(e) => { setPlaying(false); setProgreso(Number(e.target.value)); }} className="ad-range" style={{ ["--adc" as string]: modoCol, marginBottom: 16 }} />

            {control}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Descripción del laboratorio */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-dna" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El visor del dogma central</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Ancla A1 — definición del dogma */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow><i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />Lectura A1 — Dogma central (Crick, 1958)</Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>{DEFINICION_DOGMA}</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA REFLEXIONAR</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{q}</li>
              ))}
            </ul>
          </div>

          {/* Maquinaria del modo */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow><i className="fa-solid fa-gears" style={{ marginRight: 8, color: accent }} />Maquinaria — {def.etq}</Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {enzimasDe(modo).map((e) => (
                <div key={e.nombre} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${modoCol}25` }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: modoCol, background: `${modoCol}1e`, flexShrink: 0 }}>
                    <i className={`fa-solid ${e.icono}`} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff" }}>{e.nombre}</div>
                    <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>{e.funcion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini-tabla del código genético */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow><i className="fa-solid fa-table-cells" style={{ marginRight: 8, color: accent }} />Código genético (muestra)</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 7 }}>
              {CODON_DEMO.map((cod) => {
                const a = CODON_TABLE[cod];
                if (!a) return null;
                const paro = a.abr === "Stop";
                return (
                  <div key={cod} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 9, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                    <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 900, color: a.color }}>{cod}</span>
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: 9, color: T.text3 }} />
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: paro ? "#f87171" : "#fff" }}>{paro ? "Paro" : a.abr}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 10.5, color: T.text3, lineHeight: 1.4, marginTop: 9 }}>64 codones (4³) codifican 20 aminoácidos (código degenerado) más 3 de parada. AUG marca el inicio.</div>
          </div>

          {/* Cómo usar */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow><i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />Cómo usar el laboratorio</Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {INSTRUCCIONES.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Datos + ideas clave ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ad-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow><i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />Datos del genoma</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Callout: virus ARN */}
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: "1px solid #fb718155", background: "rgba(251,113,129,0.07)" }}>
            <Eyebrow><i className="fa-solid fa-virus" style={{ marginRight: 8, color: "#fb7185" }} />Excepción: los virus ARN</Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{CALLOUT_VIRUS}</div>
          </div>

          {/* Contexto mexicano: INMEGEN */}
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow><i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />México: medicina genómica</Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{CONTEXTO}</div>
          </div>

          {/* ¿Sabías que? */}
          <div style={{ marginTop: 16 }}>
            <Eyebrow><i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />¿Sabías que? (quizzes A2/A4)</Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {HECHOS.map((h, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{h}</li>
              ))}
            </ul>
          </div>

          {/* Glosario */}
          <div style={{ marginTop: 16 }}>
            <Eyebrow><i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />Glosario (A5)</Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((g, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{g.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{g.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}><i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} />{g.ejemplo}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow><i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />Ideas clave</Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
            {IDEAS.map((x, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La definición del dogma central, las preguntas de reflexión, el callout de los virus ARN y el contexto del INMEGEN son <strong>verbatim</strong> de la lectura A1 (etiqueta «LECTURA A1»); el glosario y sus ejemplos son verbatim del glosario A5; los datos de «¿sabías que?» provienen de los quizzes A2/A4. El <strong>código genético</strong> (tabla de codones) es la referencia universal estándar: para cualquier secuencia que escribas, la complementariedad (A-T, G-C), la transcripción (T→U) y la traducción (codón→aminoácido) se calculan de forma <strong>exacta</strong>. El modelo 3D de la doble hélice, las enzimas, el ribosoma y los ARNt es <strong>esquemático</strong> (no a escala atómica): representa el mecanismo del flujo de información, no una estructura molecular medida. Fuente: {FUENTE}
        </span>
      </div>
    </div>
  );
}
