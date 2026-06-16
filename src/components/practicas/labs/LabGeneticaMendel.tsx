"use client";

/**
 * Laboratorio 3D — "Genética mendeliana: cuadro de Punnett".
 * Práctica experimental para CNEYT-VI-P05-A2 (ejercicio matemático "Cruce
 * monohíbrido Aa×Aa"; progresión 5 "Analiza los patrones de herencia genética:
 * leyes de Mendel y herencia no mendeliana", UAC CNEYT-VI).
 *
 * Tres modos:
 *  (a) Monohíbrido    — un gen (Aa × Aa). Cuadro de Punnett 2×2; proporción
 *      genotípica 1:2:1 y fenotípica 3:1; P(aa) = 25 %. Incluye herencia no
 *      mendeliana (dominancia incompleta y codominancia). Es el ejercicio A2.
 *  (b) Dihíbrido      — dos genes (AaBb × AaBb). Cuadro 4×4; proporción 9:3:3:1.
 *  (c) Ligado al sexo — daltonismo (X^D X^d × X^D Y). Cuadro 2×2 con cromosomas
 *      sexuales; probabilidad de daltonismo y de ser portadora.
 * Toda la genética es de conteo cerrado (probabilidad de cada casilla).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { GENETICA_MENDEL_FICHA } from "./genetica-mendel-ficha";
import {
  type Modo, type Geno1, type Herencia, type GenoMadre, type GenoPadre,
  resolverMono, resolverDi, resolverLig, HERENCIAS,
  CASOS_MONO, CASOS_DI, CASOS_LIG,
  PROBLEMA, INSTRUCCIONES, PREGUNTAS, IDEAS, DATOS, GLOSARIO,
  EJEMPLO_A2, EJEMPLO_LIG, fmtPct, RETO_A2,
} from "./genetica-mendel-data";

const GeneticaMendelScene = dynamic(() => import("./GeneticaMendelScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-dna fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando la mesa de cruzamientos…</span>
    </div>
  ),
});

type GenoB = "BB" | "Bb" | "bb";

const C_MONO = "#a78bfa";
const C_DI = "#fcd34d";
const C_LIG = "#60a5fa";

const MODOS: { id: Modo; etq: string; icono: string; col: string; desc: string }[] = [
  { id: "monohibrido", etq: "Monohíbrido",    icono: "fa-seedling",    col: C_MONO, desc: "Un gen · Aa × Aa (3:1)" },
  { id: "dihibrido",   etq: "Dihíbrido",      icono: "fa-table-cells", col: C_DI,   desc: "Dos genes · 9:3:3:1" },
  { id: "ligado",      etq: "Ligado al sexo", icono: "fa-venus-mars",  col: C_LIG,  desc: "Daltonismo (cromosoma X)" },
];

const OPC_A: { v: Geno1; etq: string }[] = [{ v: "AA", etq: "AA" }, { v: "Aa", etq: "Aa" }, { v: "aa", etq: "aa" }];
const OPC_B: { v: GenoB; etq: string }[] = [{ v: "BB", etq: "BB" }, { v: "Bb", etq: "Bb" }, { v: "bb", etq: "bb" }];
const OPC_MADRE: { v: GenoMadre; etq: string }[] = [{ v: "XDXD", etq: "XᴰXᴰ" }, { v: "XDXd", etq: "XᴰXᵈ" }, { v: "XdXd", etq: "XᵈXᵈ" }];
const OPC_PADRE: { v: GenoPadre; etq: string }[] = [{ v: "XDY", etq: "XᴰY" }, { v: "XdY", etq: "XᵈY" }];

const HER_OPC: { v: Herencia; etq: string }[] = [
  { v: "completa", etq: "Completa" },
  { v: "incompleta", etq: "Incompleta" },
  { v: "codominancia", etq: "Codominancia" },
];

export function LabGeneticaMendel({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("monohibrido");
  // (a) monohíbrido
  const [monoP1, setMonoP1] = useState<Geno1>("Aa");
  const [monoP2, setMonoP2] = useState<Geno1>("Aa");
  const [herencia, setHerencia] = useState<Herencia>("completa");
  // (b) dihíbrido
  const [diA1, setDiA1] = useState<Geno1>("Aa");
  const [diB1, setDiB1] = useState<GenoB>("Bb");
  const [diA2, setDiA2] = useState<Geno1>("Aa");
  const [diB2, setDiB2] = useState<GenoB>("Bb");
  // (c) ligado al sexo
  const [madre, setMadre] = useState<GenoMadre>("XDXd");
  const [padre, setPadre] = useState<GenoPadre>("XDY");

  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable, teoría (cajón deslizable) y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  const toggleSonido = useCallback(async () => {
    if (!audioRef.current) audioRef.current = new LabSfx();
    const sfx = audioRef.current;
    if (sonido) {
      sfx.mute();
      setSonido(false);
    } else {
      await sfx.enable();
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  const bump = () => setResetNonce((n) => n + 1);
  const resetModo = () => {
    if (modo === "monohibrido") { setMonoP1("Aa"); setMonoP2("Aa"); setHerencia("completa"); }
    else if (modo === "dihibrido") { setDiA1("Aa"); setDiB1("Bb"); setDiA2("Aa"); setDiB2("Bb"); }
    else { setMadre("XDXd"); setPadre("XDY"); }
    bump();
  };
  const cambiarModo = (m: Modo) => { setModo(m); bump(); if (sonido) audioRef.current?.blip(); };

  // valores en vivo
  const mono = resolverMono(monoP1, monoP2, herencia);
  const di = resolverDi(diA1 + diB1, diA2 + diB2);
  const lig = resolverLig(madre, padre);

  const ratioFeno = mono.fenotipos.map((f) => f.n).join(" : ");

  const modoActual = MODOS.find((x) => x.id === modo)!;
  const modoCol = modoActual.col;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-dna" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Cuadro de Punnett</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los números siguen aquí.
        {modo === "monohibrido" && ` ${monoP1} × ${monoP2}: genotípica ${mono.propGeno}, fenotípica ${ratioFeno}, P(aa) = ${fmtPct(mono.paa)}.`}
        {modo === "dihibrido" && ` ${diA1}${diB1} × ${diA2}${diB2}: proporción fenotípica ${di.prop}.`}
        {modo === "ligado" && ` Hijo varón daltónico: ${fmtPct(lig.pDaltonicoEntreVarones)} de los varones; hija portadora: ${fmtPct(lig.pHijaPortadora)} del total.`}
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes gmPulse { 0%,100%{ box-shadow:0 0 0 0 var(--gmc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .gm-live-dot { animation: gmPulse 1.6s ease-in-out infinite; }
        .gm-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .gm-grid { grid-template-columns: 1fr; } }
        .gm-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .gm-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .gm-icobtn:hover { background:rgba(255,255,255,0.12); }
        .gm-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .gm-tab { cursor:pointer; border:1px solid var(--gmc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .gm-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.6); }
        .gm-tab:hover { background:rgba(255,255,255,0.06); }
        @media (max-width: 1000px){ .gm-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .gm-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .gm-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .gm-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06121e 0%,#040a16 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .gm-drawer[data-open="true"] { transform:translateX(0); }
        .gm-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .gm-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .gm-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .gm-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .gm-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .gm-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="gm-tabs">
          {MODOS.map((mo) => {
            const on = mo.id === modo;
            return (
              <button key={mo.id} className="gm-tab" data-on={on} onClick={() => cambiarModo(mo.id)}
                style={{ ["--gmc" as string]: mo.col, background: on ? `${mo.col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? mo.col : "inherit" }}><i className={`fa-solid ${mo.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{mo.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{mo.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="gm-grid">
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
              <GeneticaMendelScene
                modo={modo}
                monoP1={monoP1} monoP2={monoP2} herencia={herencia}
                diP1={diA1 + diB1} diP2={diA2 + diB2}
                madre={madre} padre={padre}
                playing={playing} accent={accent} resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="gm-live-dot" style={{ ["--gmc" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{modoActual.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="gm-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="gm-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="gm-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reproducir"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="gm-icobtn" onClick={resetModo} title="Reiniciar a los valores de inicio">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="gm-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              {modo === "monohibrido" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-seedling" style={{ color: modoCol, marginRight: 7 }} />
                  {monoP1} × {monoP2} · {HERENCIAS[herencia].titulo} → genotípica {mono.propGeno} · fenotípica {ratioFeno} · P(aa) = {fmtPct(mono.paa)}
                </div>
              )}
              {modo === "dihibrido" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-table-cells" style={{ color: modoCol, marginRight: 7 }} />
                  {diA1}{diB1} × {diA2}{diB2} · 16 casillas → proporción fenotípica {di.prop}
                </div>
              )}
              {modo === "ligado" && (
                <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                  <i className="fa-solid fa-venus-mars" style={{ color: modoCol, marginRight: 7 }} />
                  Hijo daltónico: {fmtPct(lig.pDaltonicoEntreVarones)} de varones · hija daltónica: {fmtPct(lig.pHijaDaltonica)} · hija portadora: {fmtPct(lig.pHijaPortadora)}
                </div>
              )}
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                {modo === "monohibrido" && "Cada progenitor aporta un alelo al azar (segregación). Cuenta las casillas: solo aa es recesivo (1 de 4 = 25 %). Cambia el tipo de herencia para ver el heterocigoto intermedio (rosa) o codominante."}
                {modo === "dihibrido" && "Dos genes en cromosomas distintos se heredan independientes (2.ª ley). De las 16 casillas: 9 dominan en ambos rasgos, 3 + 3 en uno solo y 1 es doble recesiva → 9 : 3 : 3 : 1."}
                {modo === "ligado" && "El gen del daltonismo viaja en el cromosoma X. El padre da Y a sus hijos varones, así que el alelo X^d que reciben de la madre se expresa: por eso afecta más a los hombres."}
              </div>
            </div>
          </div>

          {/* Controles del modo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                {modo === "monohibrido" ? "Genotipos y tipo de herencia" : modo === "dihibrido" ? "Genotipos de los dos genes" : "Genotipos de madre y padre"}
              </Eyebrow>
            </div>

            {modo === "monohibrido" && (
              <>
                <SelGeno label="Tipo de herencia" icon="fa-shuffle" colr={C_MONO} opciones={HER_OPC} value={herencia} onChange={(v) => setHerencia(v as Herencia)} />
                <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45, margin: "8px 2px 16px" }}>{HERENCIAS[herencia].ejemplo}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <SelGeno label="Progenitor ♀" icon="fa-venus" colr={C_MONO} opciones={OPC_A} value={monoP1} onChange={(v) => setMonoP1(v as Geno1)} />
                  <SelGeno label="Progenitor ♂" icon="fa-mars" colr={C_MONO} opciones={OPC_A} value={monoP2} onChange={(v) => setMonoP2(v as Geno1)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6, marginTop: 14 }}>
                  {CASOS_MONO.map((cs) => {
                    const on = cs.p1 === monoP1 && cs.p2 === monoP2 && cs.herencia === herencia;
                    return (
                      <button key={cs.id} onClick={() => { setMonoP1(cs.p1); setMonoP2(cs.p2); setHerencia(cs.herencia); }}
                        style={{ cursor: "pointer", textAlign: "left", fontSize: 10.5, fontWeight: 800, color: on ? "#04121f" : C_MONO, background: on ? C_MONO : `${C_MONO}1f`, border: `1px solid ${C_MONO}55`, borderRadius: 8, padding: "8px 10px", lineHeight: 1.3 }}>
                        {cs.etq}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${C_MONO}44`, background: `${C_MONO}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-seedling" style={{ color: C_MONO, marginRight: 8 }} />
                  Genotípica <strong style={{ color: C_MONO }}>{mono.propGeno}</strong> · fenotípica <strong>{ratioFeno}</strong> · P(aa) = <strong style={{ color: "#fca5a5" }}>{fmtPct(mono.paa)}</strong>.
                </div>
              </>
            )}

            {modo === "dihibrido" && (
              <>
                <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45, margin: "0 2px 14px" }}>
                  Gen A: color de semilla (A = amarilla domina sobre a = verde). Gen B: forma (B = lisa domina sobre b = rugosa).
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <SelGeno label="♀ — gen A (color)" icon="fa-venus" colr={C_DI} opciones={OPC_A} value={diA1} onChange={(v) => setDiA1(v as Geno1)} />
                  <SelGeno label="♀ — gen B (forma)" icon="fa-venus" colr={C_DI} opciones={OPC_B} value={diB1} onChange={(v) => setDiB1(v as GenoB)} />
                  <SelGeno label="♂ — gen A (color)" icon="fa-mars" colr={C_DI} opciones={OPC_A} value={diA2} onChange={(v) => setDiA2(v as Geno1)} />
                  <SelGeno label="♂ — gen B (forma)" icon="fa-mars" colr={C_DI} opciones={OPC_B} value={diB2} onChange={(v) => setDiB2(v as GenoB)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
                  {CASOS_DI.map((cs) => {
                    const on = cs.p1 === diA1 + diB1 && cs.p2 === diA2 + diB2;
                    return (
                      <button key={cs.id} onClick={() => {
                        setDiA1(cs.p1.slice(0, 2) as Geno1); setDiB1(cs.p1.slice(2, 4) as GenoB);
                        setDiA2(cs.p2.slice(0, 2) as Geno1); setDiB2(cs.p2.slice(2, 4) as GenoB);
                      }}
                        style={{ cursor: "pointer", textAlign: "left", fontSize: 10.5, fontWeight: 800, color: on ? "#04121f" : "#92710f", background: on ? C_DI : `${C_DI}1f`, border: `1px solid ${C_DI}55`, borderRadius: 8, padding: "8px 10px", lineHeight: 1.3 }}>
                        {cs.etq}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${C_DI}44`, background: `${C_DI}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-table-cells" style={{ color: C_DI, marginRight: 8 }} />
                  Proporción fenotípica <strong style={{ color: C_DI }}>{di.prop}</strong> (amarilla-lisa : amarilla-rugosa : verde-lisa : verde-rugosa).
                </div>
              </>
            )}

            {modo === "ligado" && (
              <>
                <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45, margin: "0 2px 14px" }}>
                  X<sup>D</sup> = visión normal (dominante), X<sup>d</sup> = daltonismo (recesivo). El cromosoma Y no lleva el gen.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <SelGeno label="Madre (XX)" icon="fa-venus" colr={C_LIG} opciones={OPC_MADRE} value={madre} onChange={(v) => setMadre(v as GenoMadre)} />
                  <SelGeno label="Padre (XY)" icon="fa-mars" colr={C_LIG} opciones={OPC_PADRE} value={padre} onChange={(v) => setPadre(v as GenoPadre)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6, marginTop: 14 }}>
                  {CASOS_LIG.map((cs) => {
                    const on = cs.madre === madre && cs.padre === padre;
                    return (
                      <button key={cs.id} onClick={() => { setMadre(cs.madre); setPadre(cs.padre); }}
                        style={{ cursor: "pointer", textAlign: "left", fontSize: 10.5, fontWeight: 800, color: on ? "#04121f" : C_LIG, background: on ? C_LIG : `${C_LIG}1f`, border: `1px solid ${C_LIG}55`, borderRadius: 8, padding: "8px 10px", lineHeight: 1.3 }}>
                        {cs.etq}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${C_LIG}44`, background: `${C_LIG}14`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                  <i className="fa-solid fa-venus-mars" style={{ color: C_LIG, marginRight: 8 }} />
                  De los hijos varones, <strong style={{ color: "#fca5a5" }}>{fmtPct(lig.pDaltonicoEntreVarones)}</strong> son daltónicos; de las hijas, <strong style={{ color: "#fb7185" }}>{fmtPct(lig.pDaltonicaEntreMujeres)}</strong> daltónicas. Hija portadora: <strong style={{ color: "#c084fc" }}>{fmtPct(lig.pHijaPortadora)}</strong> del total.
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* La mesa de cruzamientos */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-dna" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>La mesa de cruzamientos</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Ejemplo resuelto (A2) */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-square-check" style={{ marginRight: 8, color: accent }} />
              Ejemplo resuelto (A2)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 9 }}>{EJEMPLO_A2.enunciado}</div>
            <ul style={{ margin: "0 0 10px", paddingLeft: 16, display: "grid", gap: 4 }}>
              {EJEMPLO_A2.pasos.map((p, i) => (
                <li key={i} style={{ fontSize: 11, color: T.text2, lineHeight: 1.4, fontFamily: "ui-monospace, monospace" }}>{p}</li>
              ))}
            </ul>
            <div style={{ padding: "8px 11px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${C_MONO}44`, fontSize: 11.5, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", lineHeight: 1.4, marginBottom: 14 }}>
              {EJEMPLO_A2.resultado}
            </div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 9 }}>{EJEMPLO_LIG.enunciado}</div>
            <ul style={{ margin: "0 0 10px", paddingLeft: 16, display: "grid", gap: 4 }}>
              {EJEMPLO_LIG.pasos.map((p, i) => (
                <li key={i} style={{ fontSize: 11, color: T.text2, lineHeight: 1.4, fontFamily: "ui-monospace, monospace" }}>{p}</li>
              ))}
            </ul>
            <div style={{ padding: "8px 11px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${C_LIG}44`, fontSize: 11.5, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", lineHeight: 1.4 }}>
              {EJEMPLO_LIG.resultado}
            </div>
          </div>

          {/* Pasos para explorar */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Pasos para explorar
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {INSTRUCCIONES.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Preguntas de reflexión */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Para reflexionar
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
              {PREGUNTAS.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="gm-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className={`fa-solid ${modoActual.icono}`} style={{ marginRight: 8, color: modoCol }} />
            Lecturas — {modoActual.etq}
          </Eyebrow>
          {modo === "monohibrido" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="P(AA)" value={fmtPct(mono.pAA)} col={modoCol} size={14} />
              <Readout label="P(Aa)" value={fmtPct(mono.pAa)} col="#fff" size={14} />
              <Readout label="P(aa)" value={fmtPct(mono.paa)} col="#fca5a5" size={14} />
              <Readout label="genotípica" value={mono.propGeno} col="#86efac" size={14} />
            </div>
          )}
          {modo === "dihibrido" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="amarilla-lisa" value={`${di.conteo.AB}/16`} col="#fcd34d" size={14} />
              <Readout label="amarilla-rugosa" value={`${di.conteo.Ab}/16`} col="#fde68a" size={14} />
              <Readout label="verde-lisa" value={`${di.conteo.aB}/16`} col="#86efac" size={14} />
              <Readout label="verde-rugosa" value={`${di.conteo.ab}/16`} col="#4ade80" size={14} />
            </div>
          )}
          {modo === "ligado" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="hijo daltónico" value={fmtPct(lig.pHijoDaltonico)} col="#fca5a5" size={14} />
              <Readout label="hija daltónica" value={fmtPct(lig.pHijaDaltonica)} col="#fb7185" size={14} />
              <Readout label="hija portadora" value={fmtPct(lig.pHijaPortadora)} col="#c084fc" size={14} />
              <Readout label="entre varones" value={fmtPct(lig.pDaltonicoEntreVarones)} col={modoCol} size={14} />
            </div>
          )}
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Glosario */}
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((g, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{g.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{g.definicion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            Ideas clave
          </Eyebrow>
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
          Genética <strong>exacta</strong> de conteo cerrado: el cuadro de Punnett combina los gametos de cada progenitor y cada casilla tiene la misma probabilidad. Las proporciones (1:2:1 genotípica, 3:1 fenotípica, 9:3:3:1 dihíbrida) y los porcentajes de los paneles son <strong>exactos</strong>. La escena 3D es <strong>esquemática</strong>: las flores, las semillas y los cromosomas son representaciones visuales (no a escala biológica) para distinguir los fenotipos y los sexos. El ejemplo resuelto es verbatim del ejercicio A2 y de la actividad final del glosario A5; las ideas clave, el glosario y el contexto se basan en la lectura A1; las preguntas para reflexionar se derivan de ese mismo contenido.
        </span>
      </div>

      {/* ── Reto evaluable: el ejercicio verbatim del ancla A2 ────────── */}
      <RetoNumericoCard
        reto={RETO_A2}
        accent={accent}
        aprobado={ejercicioAprobado}
        onAprobado={() => setEjercicioAprobado(true)}
        playSfx={() => { if (sonido) audioRef.current?.correcto(); }}
      />

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <div className="gm-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="gm-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="gm-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="gm-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="gm-drawer-body">
          <FichaTeorica data={GENETICA_MENDEL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

/* ── Selector de genotipo (segmentado) ───────────────────────────────────── */
function SelGeno({ label, icon, colr, opciones, value, onChange }: {
  label: string; icon: string; colr: string;
  opciones: { v: string; etq: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: colr, marginBottom: 8 }}>
        <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} />
        {label}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${opciones.length}, 1fr)`, gap: 6 }}>
        {opciones.map((o) => {
          const on = o.v === value;
          return (
            <button key={o.v} onClick={() => onChange(o.v)}
              style={{ cursor: "pointer", fontSize: 13, fontWeight: 900, fontFamily: "ui-monospace, monospace", color: on ? "#04121f" : colr, background: on ? colr : `${colr}1f`, border: `1px solid ${colr}55`, borderRadius: 9, padding: "9px 6px" }}>
              {o.etq}
            </button>
          );
        })}
      </div>
    </div>
  );
}
