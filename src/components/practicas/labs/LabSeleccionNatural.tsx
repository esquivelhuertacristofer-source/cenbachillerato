"use client";

/**
 * Laboratorio 3D — "Selección natural en 3D: conejos, tipos y evidencias".
 * Práctica experimental para CNEYT-VI-P07-A2 (simulación "Selección natural en
 * conejos"; progresión 7 "Explica la teoría de la evolución por selección natural
 * y la evidencia que la sustenta", UAC CNEYT-VI).
 *
 * Tres modos:
 *  (1) conejos     — selección sobre el color del pelaje; el ambiente y la
 *                    presión depredadora cambian las frecuencias alélicas
 *                    generación a generación (ancla A2).
 *  (2) tipos       — selección estabilizadora / direccional / disruptiva (A5).
 *  (3) evidencias  — homología: mismos huesos en humano, ballena y murciélago.
 */

import React, { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";
import { SELECCION_NATURAL_FICHA } from "./seleccion-natural-ficha";
import {
  type Modo,
  MODOS,
  MODOS_DEF,
  AMBIENTES,
  ambientePorId,
  PREDACION,
  predacionPorId,
  simular,
  MAXGEN_CONEJOS,
  TIPOS_SEL,
  tipoSelPorId,
  distribucionTipo,
  fitnessTipo,
  MAXGEN_TIPOS,
  ANIMALES,
  animalPorId,
  HUESOS_LEYENDA,
  HOMOLOGAS_DEF,
  ANALOGAS_DEF,
  A2_DESCRIPCION,
  PREGUNTAS_A2,
  POSTULADOS,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  GLOSARIO,
  CONTEXTO,
  FUENTE,
  DATOS,
  QUIZ_A2,
} from "./seleccion-natural-data";

const SeleccionNaturalScene = dynamic(() => import("./SeleccionNaturalScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-paw fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando la selección natural en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-seleccion-natural-evolucion-3d-reto";

export function LabSeleccionNatural({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("conejos");
  const [ambienteId, setAmbienteId] = useState<string>("pradera");
  const [predacionId, setPredacionId] = useState<string>("media");
  const [tipoId, setTipoId] = useState<string>("estabilizadora");
  const [animalId, setAnimalId] = useState<string>("humano");
  const [gen, setGen] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // sonido
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

  // valores en vivo ─ conejos
  const amb = ambientePorId(ambienteId);
  const pred = predacionPorId(predacionId);
  const traj = simular(amb.favorece, pred.s);
  // valores en vivo ─ tipos
  const tipo = tipoSelPorId(tipoId);
  const dists = distribucionTipo(tipoId);
  const fit = fitnessTipo(tipoId);
  // valores en vivo ─ evidencias
  const animal = animalPorId(animalId);

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;
  const maxGen = modo === "conejos" ? MAXGEN_CONEJOS : modo === "tipos" ? MAXGEN_TIPOS : 0;
  const genActual = Math.min(gen, maxGen);

  const cur = traj[genActual] ?? traj[0]!;
  const barras = dists[genActual] ?? dists[0]!;

  // avance del tiempo (generaciones) por temporizador
  useEffect(() => {
    if (!playing || maxGen === 0) return;
    if (genActual >= maxGen) return;
    const t = setInterval(() => setGen((g) => Math.min(maxGen, g + 1)), 950);
    return () => clearInterval(t);
  }, [playing, maxGen, genActual]);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setGen(0);
    bump();
    if (sonido) audioRef.current?.blip();
  };
  const reiniciar = () => {
    setGen(0);
    setPlaying(true);
    bump();
  };
  const cambiarAmbiente = (id: string) => {
    setAmbienteId(id);
    setGen(0);
    bump();
  };
  const cambiarPredacion = (id: string) => {
    setPredacionId(id);
    setGen(0);
  };
  const cambiarTipo = (id: string) => {
    setTipoId(id);
    setGen(0);
    bump();
  };

  // porcentajes para la lectura en vivo (conejos)
  const pctClaro = Math.round(cur.fClaro * 100);
  const pctOscuro = Math.round(cur.fOscuro * 100);
  const pctD = Math.round(cur.pD * 100);
  const morfoDominante = cur.fClaro > cur.fOscuro ? "claro" : "oscuro";
  const camuflado = amb.favorece;

  // ── Objetivos guiados (se marcan en vivo) ──────────────────────────
  const objetivos = [
    { txt: "Elige el Campo nevado y deja correr 6 generaciones: ¿qué pelaje queda?", done: modo === "conejos" && ambienteId === "nieve" && genActual >= 6 },
    { txt: "Sube la presión depredadora a Alta y compara qué tan rápido cambia la población", done: modo === "conejos" && predacionId === "alta" && genActual >= 4 },
    { txt: "Recorre los tres modos del visor de la evolución", done: modo === "evidencias" },
    { txt: "Avanza generaciones y observa cambiar las frecuencias alélicas", done: genActual >= 1 },
    { txt: "Compara los tipos de selección y las evidencias", done: modo === "tipos" || modo === "evidencias" },
    { txt: "Resuelve el reto evaluable de la actividad A4", done: ejercicioAprobado },
  ];
  // Los objetivos se recuerdan (algunos dependían del modo y se desmarcaban
  // solos) y se convierten en la marca del laboratorio, que antes no se
  // guardaba en ninguna parte.
  const { cumplidos: cumplidosLab, total: totalLab } = useLogros(objetivos.map((o) => o.done));
  const { registraEstrellas } = useEstrellas(RETO_KEY);
  useEffect(() => {
    if (cumplidosLab === 0) return;
    const est = cumplidosLab >= totalLab ? 3 : cumplidosLab >= Math.ceil((totalLab * 2) / 3) ? 2 : 1;
    registraEstrellas(est);
  }, [cumplidosLab, totalLab, registraEstrellas]);
  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {modo === "conejos" ? A2_DESCRIPCION : modo === "tipos" ? tipo.definicion : HOMOLOGAS_DEF}
      </div>
    </div>
  );

  // lectura en vivo (≤10 palabras)
  const lectura: ReactNode =
    modo === "conejos"
      ? <>Gen {genActual}/{maxGen} · claros {pctClaro}% · oscuros {pctOscuro}%</>
      : modo === "tipos"
        ? <>Selección {tipo.etq.toLowerCase()} · generación {genActual}/{maxGen}</>
        : <>Mismos huesos en humano, ballena y murciélago</>;

  // selección de tipo: porcentaje del rasgo en cada tercio de la distribución
  const nBarras = barras.length;
  const tercio = (a: number, b: number) => Math.round(barras.slice(a, b).reduce((x, y) => x + y, 0));
  const pPeq = tercio(0, Math.floor(nBarras / 3));
  const pMed = tercio(Math.floor(nBarras / 3), Math.ceil((nBarras * 2) / 3));
  const pGra = tercio(Math.ceil((nBarras * 2) / 3), nBarras);

  const sel = (on: boolean, col: string): React.CSSProperties => ({
    cursor: "pointer", textAlign: "center", fontSize: 14, fontWeight: 800, lineHeight: 1.25, padding: "10px 6px", borderRadius: 11,
    border: `1px solid ${on ? col : "rgba(255,255,255,0.14)"}`, background: on ? `${col}26` : "transparent", color: on ? "#fff" : T.text2,
  });
  const rejilla3: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 };
  const nota = (col: string, children: ReactNode) => (
    <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${col}44`, background: `${col}14` }}>{children}</p>
  );

  const controles: ReactNode = (
    <>
      {modo === "conejos" && (
        <>
          <Bloque titulo="Ambiente: ¿dónde viven?" icono="fa-globe">
            <div style={rejilla3}>
              {AMBIENTES.map((a) => (
                <button key={a.id} type="button" onClick={() => cambiarAmbiente(a.id)} style={sel(a.id === ambienteId, modoCol)}>
                  <div style={{ fontSize: 17, marginBottom: 3, color: a.id === ambienteId ? modoCol : "inherit" }}><i className={`fa-solid ${a.icono}`} aria-hidden /></div>
                  {a.etq}
                </button>
              ))}
            </div>
            <p style={{ margin: 0, color: T.text2 }}>{amb.descripcion}</p>
          </Bloque>
          <Bloque titulo="Presión depredadora" icono="fa-crow">
            <div style={rejilla3}>
              {PREDACION.map((p) => (
                <button key={p.id} type="button" onClick={() => cambiarPredacion(p.id)} style={sel(p.id === predacionId, modoCol)}>
                  {p.etq}
                  <div style={{ fontSize: 14, color: T.text3, fontWeight: 600 }}>{p.predadores} {p.predadores === 1 ? "ave" : "aves"}</div>
                </button>
              ))}
            </div>
          </Bloque>
          <Bloque titulo="Tiempo" icono="fa-hourglass-half">
            <Deslizador label="Generación" icon="fa-clock" colr={modoCol} valor={`${genActual} / ${maxGen}`} min={0} max={maxGen} step={1} value={genActual}
              onChange={(v) => { setPlaying(false); setGen(v); }} hintL="hoy" hintR={`${maxGen} generaciones después`} />
          </Bloque>
          <Bloque titulo="Qué pasa con la población" icono="fa-chart-line">
            <ChartFrecuencias traj={traj} gen={genActual} />
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", color: T.text2 }}>
              <span><span aria-hidden style={{ display: "inline-block", width: 14, height: 4, borderRadius: 2, background: "#e9eef4", marginRight: 6, verticalAlign: "middle" }} />claros</span>
              <span><span aria-hidden style={{ display: "inline-block", width: 14, height: 4, borderRadius: 2, background: "#c9a98a", marginRight: 6, verticalAlign: "middle" }} />oscuros</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
              <Dato label="Pelaje oscuro" value={`${pctOscuro}%`} col="#c9a98a" />
              <Dato label="Pelaje claro" value={`${pctClaro}%`} col="#e9eef4" />
              <Dato label="Alelo D (osc.)" value={`${pctD}%`} col={modoCol} />
              <Dato label="Aptitud media" value={cur.wbar.toFixed(2)} col="#fbbf24" />
            </div>
            {nota(modoCol, <>En {amb.etq.toLowerCase()} se camufla el pelaje <strong>{camuflado}</strong>: los depredadores ven mejor al otro y se lo comen. Tras {genActual} generaciones predomina el <strong>{morfoDominante}</strong> ({morfoDominante === "claro" ? pctClaro : pctOscuro}%).</>)}
          </Bloque>
        </>
      )}

      {modo === "tipos" && (
        <>
          <Bloque titulo="Tipo de selección" icono="fa-chart-column">
            <div style={rejilla3}>
              {TIPOS_SEL.map((tp) => {
                const c = `#${tp.color.replace("#", "")}`;
                return (
                  <button key={tp.id} type="button" onClick={() => cambiarTipo(tp.id)} style={sel(tp.id === tipoId, c)}>
                    <div style={{ fontSize: 17, marginBottom: 3, color: tp.id === tipoId ? c : "inherit" }}><i className={`fa-solid ${tp.icono}`} aria-hidden /></div>
                    {tp.etq}
                  </button>
                );
              })}
            </div>
            {nota(modoCol, <><strong style={{ color: modoCol }}>{tipo.etq}.</strong> Selección {tipo.definicion}. <span style={{ color: T.text2 }}>{tipo.ejemplo}</span></>)}
          </Bloque>
          <Bloque titulo="Tiempo" icono="fa-hourglass-half">
            <Deslizador label="Generación" icon="fa-clock" colr={modoCol} valor={`${genActual} / ${maxGen}`} min={0} max={maxGen} step={1} value={genActual}
              onChange={(v) => { setPlaying(false); setGen(v); }} hintL="población inicial" hintR={`${maxGen} generaciones`} />
          </Bloque>
          <Bloque titulo="Dónde está el rasgo" icono="fa-gauge-high">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
              <Dato label="Rasgo pequeño" value={`${pPeq}%`} />
              <Dato label="Rasgo mediano" value={`${pMed}%`} col={modoCol} />
              <Dato label="Rasgo grande" value={`${pGra}%`} />
            </div>
            <p style={{ margin: 0, color: T.text2 }}>Las barras altas y brillantes son las más aptas; la esfera marca la aptitud de cada una.</p>
          </Bloque>
        </>
      )}

      {modo === "evidencias" && (
        <>
          <Bloque titulo="Extremidad a resaltar" icono="fa-bone">
            <div style={rejilla3}>
              {ANIMALES.map((a) => (
                <button key={a.id} type="button" onClick={() => setAnimalId(a.id)} style={sel(a.id === animalId, modoCol)}>
                  <div style={{ fontSize: 17, marginBottom: 3, color: a.id === animalId ? modoCol : "inherit" }}><i className={`fa-solid ${a.icono}`} aria-hidden /></div>
                  {a.etq}
                </button>
              ))}
            </div>
            {nota(modoCol, <><strong style={{ color: modoCol }}>{animal.etq}</strong> <span style={{ color: T.text3 }}>· {animal.funcion}</span><br />{animal.descripcion}</>)}
          </Bloque>
          <Bloque titulo="Mismos huesos, mismo color" icono="fa-palette">
            {HUESOS_LEYENDA.map((h) => (
              <div key={h.tipo} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span aria-hidden style={{ width: 16, height: 16, borderRadius: 4, background: h.color, flexShrink: 0, boxShadow: `0 0 8px ${h.color}88` }} />
                <span style={{ fontWeight: 900, color: "#fff" }}>{h.tipo}</span>
                <span style={{ color: T.text3 }}>· {h.nota}</span>
              </div>
            ))}
          </Bloque>
        </>
      )}
    </>
  );

  const teoria: ReactNode = (
    <>
      <Bloque titulo="El visor de la evolución" icono="fa-dna">
        <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
      </Bloque>
      <Bloque titulo="Simulación A2 — Selección natural en conejos" icono="fa-flask-vial">
        <p style={{ margin: 0, color: T.text2 }}>{A2_DESCRIPCION}</p>
        <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
          {PREGUNTAS_A2.map((q, i) => <li key={i}>{q}</li>)}
        </ul>
      </Bloque>
      <Bloque titulo="Los 4 postulados de Darwin" icono="fa-list-check">
        <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
          {POSTULADOS.map((p) => <li key={p.n}>{p.texto}</li>)}
        </ol>
      </Bloque>
      <Bloque titulo="Tres tipos de selección (A5)" icono="fa-layer-group">
        {TIPOS_SEL.map((tp) => {
          const c = `#${tp.color.replace("#", "")}`;
          return (
            <p key={tp.id} style={{ margin: 0, padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}`, color: T.text2 }}>
              <strong style={{ color: c }}>{tp.etq}. </strong>Selección {tp.definicion}.
            </p>
          );
        })}
      </Bloque>
      <Bloque titulo="Homólogas vs. análogas (A5)" icono="fa-code-branch">
        <p style={{ margin: 0, color: T.text2 }}>{HOMOLOGAS_DEF}</p>
        <p style={{ margin: 0, color: T.text2 }}>{ANALOGAS_DEF}</p>
        <Dato label="ADN humano–chimpancé" value="~98.7%" col={accent} />
      </Bloque>
      <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
        <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
          {INSTRUCCIONES.map((p, i) => <li key={i}>{p}</li>)}
        </ol>
      </Bloque>
      <Bloque titulo="Ideas clave" icono="fa-lightbulb">
        <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
          {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </Bloque>
      <Bloque titulo="Datos y evidencias" icono="fa-magnifying-glass-chart">
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
      <Bloque titulo="México: un país megadiverso" icono="fa-location-dot">
        <p style={{ margin: 0, color: T.text2 }}>{CONTEXTO}</p>
      </Bloque>
      <Bloque titulo="Glosario" icono="fa-book">
        {GLOSARIO.map((g, i) => (
          <p key={i} style={{ margin: 0, padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}`, color: T.text2 }}>
            <strong style={{ color: accent }}>{g.termino}. </strong>{g.definicion}
          </p>
        ))}
      </Bloque>
      <Bloque titulo="Ficha teórica" icono="fa-book">
        <FichaTeorica data={SELECCION_NATURAL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
      </Bloque>
      <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
        La descripción y las preguntas de reflexión del modo «conejos» son <strong>verbatim</strong> de la simulación A2. Los tres tipos de selección y el glosario son verbatim del glosario A5; los cuatro postulados, las evidencias (homología, ~98.7% de ADN compartido con el chimpancé) y el contexto de la CONABIO son verbatim de la lectura A1. El modelo 3D es <strong>esquemático</strong>: las frecuencias alélicas siguen un modelo de un gen con dos alelos (D dominante oscuro, d recesivo claro) y selección sobre el fenotipo con el coeficiente <i>s</i> de la presión elegida; los conejos, los depredadores, las barras del rasgo y los huesos son representaciones visuales (no a escala) para entender el mecanismo, no medidas reales de una población concreta. Fuente: {FUENTE}
      </p>
    </>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <SeleccionNaturalScene
            modo={modo}
            terreno={amb.terreno}
            cielo={amb.cielo}
            fClaro={cur.fClaro}
            predadores={pred.predadores}
            barras={barras}
            fitness={fit}
            tipoColor={`#${tipo.color.replace("#", "")}`}
            animalSel={animalId}
            playing={playing}
            accent={accent}
            resetNonce={resetNonce}
            gen={genActual}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq, icono: MODOS_DEF[m].icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reanudar"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        { id: "controles", etiqueta: "Controles", icono: "fa-sliders", contenido: controles },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoQuizCard
              quiz={QUIZ_A2}
              accent={accent}
              rgba={color.rgba}
              aprobado={ejercicioAprobado}
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={() => {
                if (sonido) audioRef.current?.correcto();
              }}
              playPick={() => {
                if (sonido) audioRef.current?.blip();
              }}
            />
          ),
        },
        { id: "teoria", etiqueta: "Teoría", icono: "fa-book-open", contenido: teoria },
      ]}
    />
  );
}

/* ── Gráfica: frecuencia de cada pelaje a lo largo de las generaciones ──── */
function ChartFrecuencias({ traj, gen }: { traj: { fClaro: number; fOscuro: number }[]; gen: number }) {
  const W = 300;
  const H = 120;
  const n = Math.max(1, traj.length - 1);
  const x = (i: number) => 8 + (i / n) * (W - 16);
  const y = (f: number) => H - 8 - f * (H - 16);
  const linea = (k: "fClaro" | "fOscuro") => traj.map((g, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(g[k]).toFixed(1)}`).join(" ");
  const cur = traj[Math.min(gen, n)] ?? traj[0]!;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", borderRadius: 12, background: "rgba(2,12,28,0.5)", border: `1px solid ${T.line}` }} role="img" aria-label="Porcentaje de conejos claros y oscuros por generación">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={8} x2={W - 8} y1={y(f)} y2={y(f)} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 4" />
      ))}
      <path d={linea("fClaro")} fill="none" stroke="#e9eef4" strokeWidth={3} strokeLinejoin="round" />
      <path d={linea("fOscuro")} fill="none" stroke="#c9a98a" strokeWidth={3} strokeLinejoin="round" />
      <line x1={x(gen)} x2={x(gen)} y1={6} y2={H - 6} stroke="#fcd34d" strokeWidth={2} />
      <circle cx={x(gen)} cy={y(cur.fClaro)} r={5} fill="#e9eef4" stroke="#04121f" strokeWidth={1.5} />
      <circle cx={x(gen)} cy={y(cur.fOscuro)} r={5} fill="#c9a98a" stroke="#04121f" strokeWidth={1.5} />
    </svg>
  );
}
