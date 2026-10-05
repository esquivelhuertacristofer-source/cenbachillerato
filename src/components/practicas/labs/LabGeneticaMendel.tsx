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

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, BotonHerramienta } from "./_shell";
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
  categoriasMono, categoriasDi, categoriasLig, muestrear, type MuestraCruce,
} from "./genetica-mendel-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-genetica-mendeliana-punnett-reto";

const GeneticaMendelScene = dynamic(() => import("./GeneticaMendelScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-dna fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando la mesa de cruzamientos…</span>
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

  // reto evaluable y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
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

  // experimento: cruzar (animación) y sembrar descendencia
  const [cruzarNonce, setCruzarNonce] = useState(0);
  const [nSiembra, setNSiembra] = useState<20 | 50 | 100>(100);
  const [siembra, setSiembra] = useState<{ firma: string; n: number; id: number } | null>(null);
  const [siembras, setSiembras] = useState(0);
  const [genero100, setGenero100] = useState(false);

  const bump = () => { setResetNonce((n) => n + 1); setCruzarNonce(0); };
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

  // firma del cruce vigente: si cambia un genotipo, la siembra anterior ya no aplica
  const firma = modo === "monohibrido" ? `m|${monoP1}|${monoP2}|${herencia}`
    : modo === "dihibrido" ? `d|${diA1}${diB1}|${diA2}${diB2}`
      : `l|${madre}|${padre}`;
  const cats = useMemo(() => {
    if (modo === "monohibrido") return categoriasMono(resolverMono(monoP1, monoP2, herencia));
    if (modo === "dihibrido") return categoriasDi(resolverDi(diA1 + diB1, diA2 + diB2));
    return categoriasLig(resolverLig(madre, padre));
  }, [modo, monoP1, monoP2, herencia, diA1, diB1, diA2, diB2, madre, padre]);
  const muestra: MuestraCruce | null = useMemo(() => {
    if (!siembra || siembra.firma !== firma) return null;
    // semilla estable por clic: misma secuencia de clics, misma siembra
    return muestrear(cats, siembra.n, 1000 + siembra.id * 7919 + (modo === "dihibrido" ? 104729 : modo === "ligado" ? 209459 : 0), siembra.id);
  }, [siembra, firma, cats, modo]);

  const cruzar = () => { setCruzarNonce((n) => n + 1); if (sonido) audioRef.current?.blip(); };
  const sembrar = () => {
    const id = siembras + 1;
    setSiembras(id);
    setSiembra({ firma, n: nSiembra, id });
    if (nSiembra === 100) setGenero100(true);
    if (sonido) audioRef.current?.blip();
  };
  const palabra = modo === "dihibrido" ? "semillas" : modo === "ligado" ? "descendientes" : "plantas";

  const modoActual = MODOS.find((x) => x.id === modo)!;
  const modoCol = modoActual.col;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-dna" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Cuadro de Punnett</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los números siguen aquí.
        {modo === "monohibrido" && ` ${monoP1} × ${monoP2}: genotípica ${mono.propGeno}, fenotípica ${ratioFeno}, P(aa) = ${fmtPct(mono.paa)}.`}
        {modo === "dihibrido" && ` ${diA1}${diB1} × ${diA2}${diB2}: proporción fenotípica ${di.prop}.`}
        {modo === "ligado" && ` Hijo varón daltónico: ${fmtPct(lig.pDaltonicoEntreVarones)} de los varones; hija portadora: ${fmtPct(lig.pHijaPortadora)} del total.`}
      </div>
    </div>
  );

  const lecturaCorta = modo === "monohibrido"
    ? <>{monoP1} × {monoP2}: fenotipos {ratioFeno}</>
    : modo === "dihibrido"
      ? <>{diA1}{diB1} × {diA2}{diB2}: {di.prop}</>
      : <>Hijo daltónico {fmtPct(lig.pDaltonicoEntreVarones)} · hija portadora {fmtPct(lig.pHijaPortadora)}</>;

  const casoBtn = (on: boolean, col: string, etq: string, click: () => void) => (
    <button key={etq} type="button" onClick={click}
      style={{ cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 800, color: on ? "#04121f" : col, background: on ? col : `${col}1f`, border: `1px solid ${col}55`, borderRadius: 10, padding: "9px 12px", lineHeight: 1.3 }}>
      {etq}
    </button>
  );
  const nota = (col: string, children: ReactNode) => (
    <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${col}44`, background: `${col}14` }}>{children}</p>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <GeneticaMendelScene
            modo={modo}
            monoP1={monoP1} monoP2={monoP2} herencia={herencia}
            diP1={diA1 + diB1} diP2={diA2 + diB2}
            madre={madre} padre={padre}
            playing={playing} accent={accent} resetNonce={resetNonce}
            cruzarNonce={cruzarNonce} muestra={muestra}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((mo) => ({ id: mo.id, etiqueta: mo.etq, icono: mo.icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reproducir"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={resetModo} />
        </>
      }
      lectura={lecturaCorta}
      objetivos={[
        { txt: "Arma un cruce monohíbrido y lee la proporción 3:1 en el cuadro de Punnett", done: modo === "monohibrido" },
        { txt: "Cambia la herencia a incompleta o codominancia y mira cómo cambia el fenotipo", done: herencia !== "completa" },
        { txt: "Pasa al cruce dihíbrido y encuentra la proporción 9:3:3:1", done: modo === "dihibrido" },
        { txt: "Explora la herencia ligada al sexo (daltonismo)", done: modo === "ligado" },
        { txt: "Genera 100 descendientes y compara lo observado con lo esperado", done: genero100 },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo={modo === "monohibrido" ? "Genotipos y herencia" : modo === "dihibrido" ? "Genotipos de los dos genes" : "Genotipos de madre y padre"} icono={modoActual.icono}>
                {modo === "monohibrido" && (
                  <>
                    <SelGeno label="Tipo de herencia" icon="fa-shuffle" colr={C_MONO} opciones={HER_OPC} value={herencia} onChange={(v) => setHerencia(v as Herencia)} />
                    <p style={{ margin: 0, color: T.text2 }}>{HERENCIAS[herencia].ejemplo}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
                      <SelGeno label="Progenitor ♀" icon="fa-venus" colr={C_MONO} opciones={OPC_A} value={monoP1} onChange={(v) => setMonoP1(v as Geno1)} />
                      <SelGeno label="Progenitor ♂" icon="fa-mars" colr={C_MONO} opciones={OPC_A} value={monoP2} onChange={(v) => setMonoP2(v as Geno1)} />
                    </div>
                    <div style={{ display: "grid", gap: 6 }}>
                      {CASOS_MONO.map((cs) => casoBtn(cs.p1 === monoP1 && cs.p2 === monoP2 && cs.herencia === herencia, C_MONO, cs.etq,
                        () => { setMonoP1(cs.p1); setMonoP2(cs.p2); setHerencia(cs.herencia); }))}
                    </div>
                  </>
                )}
                {modo === "dihibrido" && (
                  <>
                    <p style={{ margin: 0, color: T.text2 }}>
                      Gen A: color de semilla (A = amarilla domina sobre a = verde). Gen B: forma (B = lisa domina sobre b = rugosa).
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
                      <SelGeno label="♀ gen A (color)" icon="fa-venus" colr={C_DI} opciones={OPC_A} value={diA1} onChange={(v) => setDiA1(v as Geno1)} />
                      <SelGeno label="♀ gen B (forma)" icon="fa-venus" colr={C_DI} opciones={OPC_B} value={diB1} onChange={(v) => setDiB1(v as GenoB)} />
                      <SelGeno label="♂ gen A (color)" icon="fa-mars" colr={C_DI} opciones={OPC_A} value={diA2} onChange={(v) => setDiA2(v as Geno1)} />
                      <SelGeno label="♂ gen B (forma)" icon="fa-mars" colr={C_DI} opciones={OPC_B} value={diB2} onChange={(v) => setDiB2(v as GenoB)} />
                    </div>
                    <div style={{ display: "grid", gap: 6 }}>
                      {CASOS_DI.map((cs) => casoBtn(cs.p1 === diA1 + diB1 && cs.p2 === diA2 + diB2, C_DI, cs.etq, () => {
                        setDiA1(cs.p1.slice(0, 2) as Geno1); setDiB1(cs.p1.slice(2, 4) as GenoB);
                        setDiA2(cs.p2.slice(0, 2) as Geno1); setDiB2(cs.p2.slice(2, 4) as GenoB);
                      }))}
                    </div>
                  </>
                )}
                {modo === "ligado" && (
                  <>
                    <p style={{ margin: 0, color: T.text2 }}>
                      X<sup>D</sup> = visión normal (dominante), X<sup>d</sup> = daltonismo (recesivo). El cromosoma Y no lleva el gen.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
                      <SelGeno label="Madre (XX)" icon="fa-venus" colr={C_LIG} opciones={OPC_MADRE} value={madre} onChange={(v) => setMadre(v as GenoMadre)} />
                      <SelGeno label="Padre (XY)" icon="fa-mars" colr={C_LIG} opciones={OPC_PADRE} value={padre} onChange={(v) => setPadre(v as GenoPadre)} />
                    </div>
                    <div style={{ display: "grid", gap: 6 }}>
                      {CASOS_LIG.map((cs) => casoBtn(cs.madre === madre && cs.padre === padre, C_LIG, cs.etq, () => { setMadre(cs.madre); setPadre(cs.padre); }))}
                    </div>
                  </>
                )}
              </Bloque>

              <Bloque titulo="Experimento: cruza y siembra" icono="fa-flask">
                <p style={{ margin: 0, color: T.text2 }}>
                  El cuadro de Punnett predice; el campo comprueba. Cruza para ver cómo los gametos llenan las casillas y siembra para ver qué sale de verdad cuando el azar decide.
                </p>
                <button type="button" onClick={cruzar}
                  style={{ cursor: "pointer", fontSize: 15, fontWeight: 900, color: "#04121f", background: modoCol, border: "none", borderRadius: 10, padding: "11px 14px" }}>
                  <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} aria-hidden />Cruzar
                </button>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: modoCol, marginBottom: 8 }}>
                    <i className="fa-solid fa-seedling" style={{ marginRight: 6 }} aria-hidden />Tamaño de la muestra
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 6 }}>
                    {([20, 50, 100] as const).map((v) => {
                      const on = v === nSiembra;
                      return (
                        <button key={v} type="button" onClick={() => setNSiembra(v)}
                          style={{ cursor: "pointer", fontSize: 15, fontWeight: 900, fontFamily: "ui-monospace, monospace", color: on ? "#04121f" : modoCol, background: on ? modoCol : `${modoCol}1f`, border: `1px solid ${modoCol}55`, borderRadius: 9, padding: "10px 4px" }}>
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button type="button" onClick={sembrar}
                  style={{ cursor: "pointer", fontSize: 15, fontWeight: 900, color: modoCol, background: `${modoCol}1f`, border: `1px solid ${modoCol}77`, borderRadius: 10, padding: "11px 14px" }}>
                  <i className="fa-solid fa-leaf" style={{ marginRight: 8 }} aria-hidden />
                  {muestra ? `Sembrar otra vez (${nSiembra} ${palabra})` : `Sembrar ${nSiembra} ${palabra}`}
                </button>
                {muestra ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
                      Observado vs esperado · {muestra.n} {palabra} · siembra n.º {muestra.id}
                    </div>
                    {muestra.cats.map((c, k) => {
                      const obs = muestra.conteo[k] ?? 0;
                      const pObs = (obs / muestra.n) * 100;
                      const esp = (c.pct / 100) * muestra.n;
                      return (
                        <div key={k} style={{ display: "grid", gap: 4 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14, color: T.text2 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                              <span aria-hidden style={{ width: 12, height: 12, borderRadius: 99, background: c.color, border: "1px solid rgba(255,255,255,0.4)", flexShrink: 0 }} />
                              {c.etq}
                            </span>
                            <strong style={{ color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap" }}>{obs} <span style={{ color: T.text3 }}>/ {fmtEsp(esp)}</span></strong>
                          </div>
                          <div style={{ position: "relative", height: 14, borderRadius: 7, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                            <div style={{ position: "absolute", inset: 0, width: `${pObs}%`, background: c.color, opacity: 0.9, borderRadius: 7, transition: "width .5s" }} />
                            <div title={`esperado ${fmtPct(c.pct)}`} style={{ position: "absolute", top: 0, bottom: 0, left: `calc(${c.pct}% - 1.5px)`, width: 3, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,0.6)" }} />
                          </div>
                          <div style={{ fontSize: 14, color: T.text3 }}>
                            observado {fmtPct(Math.round(pObs * 10) / 10)} · esperado {fmtPct(c.pct)}
                          </div>
                        </div>
                      );
                    })}
                    <p style={{ margin: 0, color: T.text2 }}>
                      La marca blanca es lo esperado. Vuelve a sembrar: cada siembra sale distinta. Con pocas {palabra} el azar se nota; con 100 el resultado se acerca a lo esperado. Por eso Mendel necesitó muestras grandes.
                    </p>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: T.text3 }}>Aún no has sembrado: el campo aparecerá junto al cuadro.</p>
                )}
              </Bloque>

              <Bloque titulo={`Lecturas — ${modoActual.etq}`} icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {modo === "monohibrido" && (
                    <>
                      <Dato label="P(AA)" value={fmtPct(mono.pAA)} col={modoCol} />
                      <Dato label="P(Aa)" value={fmtPct(mono.pAa)} />
                      <Dato label="P(aa)" value={fmtPct(mono.paa)} col="#fca5a5" />
                      <Dato label="genotípica" value={mono.propGeno} col="#86efac" />
                    </>
                  )}
                  {modo === "dihibrido" && (
                    <>
                      <Dato label="amarilla-lisa" value={`${di.conteo.AB}/16`} col="#fcd34d" />
                      <Dato label="amarilla-rugosa" value={`${di.conteo.Ab}/16`} col="#fde68a" />
                      <Dato label="verde-lisa" value={`${di.conteo.aB}/16`} col="#86efac" />
                      <Dato label="verde-rugosa" value={`${di.conteo.ab}/16`} col="#4ade80" />
                    </>
                  )}
                  {modo === "ligado" && (
                    <>
                      <Dato label="hijo daltónico" value={fmtPct(lig.pHijoDaltonico)} col="#fca5a5" />
                      <Dato label="hija daltónica" value={fmtPct(lig.pHijaDaltonica)} col="#fb7185" />
                      <Dato label="hija portadora" value={fmtPct(lig.pHijaPortadora)} col="#c084fc" />
                      <Dato label="entre varones" value={fmtPct(lig.pDaltonicoEntreVarones)} col={modoCol} />
                    </>
                  )}
                </div>
                {modo === "monohibrido" && nota(C_MONO, <>Genotípica <strong style={{ color: C_MONO }}>{mono.propGeno}</strong> · fenotípica <strong>{ratioFeno}</strong> · P(aa) = <strong style={{ color: "#fca5a5" }}>{fmtPct(mono.paa)}</strong>.</>)}
                {modo === "dihibrido" && nota(C_DI, <>Proporción fenotípica <strong style={{ color: C_DI }}>{di.prop}</strong> (amarilla-lisa : amarilla-rugosa : verde-lisa : verde-rugosa).</>)}
                {modo === "ligado" && nota(C_LIG, <>De los hijos varones, <strong style={{ color: "#fca5a5" }}>{fmtPct(lig.pDaltonicoEntreVarones)}</strong> son daltónicos; de las hijas, <strong style={{ color: "#fb7185" }}>{fmtPct(lig.pDaltonicaEntreMujeres)}</strong> daltónicas. Hija portadora: <strong style={{ color: "#c084fc" }}>{fmtPct(lig.pHijaPortadora)}</strong> del total.</>)}
                <p style={{ margin: 0, color: T.text2 }}>
                  {modo === "monohibrido" && "Cada progenitor aporta un alelo al azar (segregación). Cuenta las casillas: solo aa es recesivo (1 de 4 = 25 %). Cambia el tipo de herencia para ver el heterocigoto intermedio (rosa) o codominante."}
                  {modo === "dihibrido" && "Dos genes en cromosomas distintos se heredan independientes (2.ª ley). De las 16 casillas: 9 dominan en ambos rasgos, 3 + 3 en uno solo y 1 es doble recesiva → 9 : 3 : 3 : 1."}
                  {modo === "ligado" && "El gen del daltonismo viaja en el cromosoma X. El padre da Y a sus hijos varones, así que el alelo X^d que reciben de la madre se expresa: por eso afecta más a los hombres."}
                </p>
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoNumericoCard
              reto={RETO_A2}
              accent={accent}
              aprobado={ejercicioAprobado}
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={() => { if (sonido) audioRef.current?.correcto(); }}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="La mesa de cruzamientos" icono="fa-dna">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Ejemplo resuelto (A2)" icono="fa-square-check">
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO_A2.enunciado}</p>
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6, color: T.text2, fontFamily: "ui-monospace, monospace" }}>
                  {EJEMPLO_A2.pasos.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
                <div style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${C_MONO}44`, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>
                  {EJEMPLO_A2.resultado}
                </div>
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO_LIG.enunciado}</p>
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6, color: T.text2, fontFamily: "ui-monospace, monospace" }}>
                  {EJEMPLO_LIG.pasos.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
                <div style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${C_LIG}44`, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>
                  {EJEMPLO_LIG.resultado}
                </div>
              </Bloque>
              <Bloque titulo="Pasos para explorar" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                  {INSTRUCCIONES.map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Para reflexionar" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Datos" icono="fa-gauge-high">
                {DATOS.map((dd, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${dd.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                    <div>
                      <strong style={{ fontFamily: "ui-monospace, monospace" }}>{dd.valor}</strong>
                      <div style={{ color: T.text2 }}>{dd.texto}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-book">
                {GLOSARIO.map((g, i) => (
                  <p key={i} style={{ margin: 0, padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}`, color: T.text2 }}>
                    <strong style={{ color: accent }}>{g.termino}. </strong>{g.definicion}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={GENETICA_MENDEL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Genética <strong>exacta</strong> de conteo cerrado: el cuadro de Punnett combina los gametos de cada progenitor y cada casilla tiene la misma probabilidad. Las proporciones (1:2:1 genotípica, 3:1 fenotípica, 9:3:3:1 dihíbrida) y los porcentajes de los paneles son <strong>exactos</strong>. La escena 3D es <strong>esquemática</strong>: las flores, las semillas y los cromosomas son representaciones visuales (no a escala biológica) para distinguir los fenotipos y los sexos. El ejemplo resuelto es verbatim del ejercicio A2 y de la actividad final del glosario A5; las ideas clave, el glosario y el contexto se basan en la lectura A1; las preguntas para reflexionar se derivan de ese mismo contenido.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/** Valor esperado (puede ser decimal, por ejemplo 18,75). */
const fmtEsp = (x: number) => (Number.isInteger(x) ? String(x) : x.toLocaleString("es-MX", { maximumFractionDigits: 2 }));

/* ── Selector de genotipo (segmentado) ───────────────────────────────────── */
function SelGeno({ label, icon, colr, opciones, value, onChange }: {
  label: string; icon: string; colr: string;
  opciones: { v: string; etq: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 800, color: colr, marginBottom: 8 }}>
        <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} aria-hidden />
        {label}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${opciones.length}, minmax(0,1fr))`, gap: 6 }}>
        {opciones.map((o) => {
          const on = o.v === value;
          return (
            <button key={o.v} type="button" onClick={() => onChange(o.v)}
              style={{ cursor: "pointer", fontSize: 15, fontWeight: 900, fontFamily: "ui-monospace, monospace", color: on ? "#04121f" : colr, background: on ? colr : `${colr}1f`, border: `1px solid ${colr}55`, borderRadius: 9, padding: "10px 4px" }}>
              {o.etq}
            </button>
          );
        })}
      </div>
    </div>
  );
}
