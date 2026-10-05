"use client";

/**
 * Laboratorio 3D — "El origen de la vida: hipótesis científicas".
 * Práctica experimental anclada a CNEYT-VI-P01-A1 (lectura "El origen de la
 * vida: hipótesis científicas"; progresión 1, UAC CNEYT-VI "Organismos y
 * evolución biológica"). P01 no tiene A2 manipulable (su A2 es un quiz de opción
 * múltiple), por lo que el laboratorio se ancla a la lectura A1, con datos
 * verbatim del glosario A5 y de los quizzes A2/A4.
 *
 * Tres modos:
 *  (1) Miller-Urey — reconstrucción del aparato de 1953: el océano hierve, la
 *      atmósfera primitiva (CH₄, NH₃, H₂, H₂O) recibe descargas eléctricas y los
 *      aminoácidos se acumulan en la trampa. Sin chispa no hay síntesis.
 *  (2) Ambientes — las cunas candidatas de la vida: caldo primordial,
 *      ventiladeros hidrotermales y panspermia (meteorito de Murchison).
 *  (3) Mundo ARN — la ribozima (información + catálisis) y el coacervado.
 */

import React, { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { ORIGEN_VIDA_FICHA } from "./origen-vida-ficha";
import {
  QUIZ_A2,
  type Modo,
  type Ambiente,
  MODOS,
  MODOS_DEF,
  AMBIENTES,
  AMBIENTES_DEF,
  hipotesisPorId,
  HIPOTESIS,
  GASES_PRIMITIVOS,
  PRODUCTOS_MILLER,
  ETAPAS_MILLER,
  GLOSARIO,
  PROBLEMA,
  DEFINICION_ABIOTICA,
  PREGUNTAS,
  CONTEXTO,
  FUENTE,
  HECHOS,
  DATOS,
  INSTRUCCIONES,
  IDEAS,
} from "./origen-vida-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-origen-vida-3d-reto";

const OrigenVidaScene = dynamic(() => import("./OrigenVidaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask-vial fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando el origen de la vida en 3D…</span>
    </div>
  ),
});

const DIAS_MAX = 7;
const AMINO_VIS = 12; // aminoácidos visibles máximos en la trampa

export function LabOrigenVida({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("miller");
  const [ambiente, setAmbiente] = useState<Ambiente>("caldo");
  const [dias, setDias] = useState<number>(0);
  const [chispa, setChispa] = useState<boolean>(true);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);
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

  const bump = () => setResetNonce((n) => n + 1);

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  // avance automático de "días" en el modo Miller
  useEffect(() => {
    if (modo !== "miller" || !playing) return;
    if (dias >= DIAS_MAX) return;
    const t = setInterval(() => setDias((d) => Math.min(DIAS_MAX, d + 1)), 1100);
    return () => clearInterval(t);
  }, [modo, playing, dias]);

  // aminoácidos: sin energía no hay síntesis (honestidad del modelo)
  const aminoConChispa = Math.round((dias / DIAS_MAX) * AMINO_VIS);
  const nAmino = chispa ? aminoConChispa : 0;
  const productosActivos = chispa ? Math.min(PRODUCTOS_MILLER.length, Math.ceil((dias / DIAS_MAX) * PRODUCTOS_MILLER.length)) : 0;

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setPlaying(true);
    if (m === "miller") setDias(0);
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const cambiarAmbiente = (a: Ambiente) => {
    setAmbiente(a);
    setPlaying(true);
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const alternarChispa = () => {
    setChispa((c) => !c);
    if (sonido) audioRef.current?.blip();
  };
  const reiniciar = () => {
    if (modo === "miller") setDias(0);
    setPlaying(true);
    bump();
  };

  const ambDef = AMBIENTES_DEF[ambiente];
  const hipMiller = hipotesisPorId("miller");
  const hipArn = hipotesisPorId("mundoarn");

  // lectura en vivo (≤10 palabras)
  const lectura: ReactNode =
    modo === "miller"
      ? chispa
        ? <>Día {dias}/{DIAS_MAX} · {nAmino} aminoácidos en la trampa</>
        : <>Día {dias}/{DIAS_MAX} · sin chispa, trampa vacía</>
      : modo === "ambientes"
        ? <>Cuna candidata: {ambDef.etq}</>
        : <>El ARN guarda información y cataliza</>;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {DEFINICION_ABIOTICA}
      </div>
    </div>
  );

  const nota = (col: string, children: ReactNode) => (
    <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${col}44`, background: `${col}14`, lineHeight: 1.5 }}>{children}</p>
  );
  const rotulo: React.CSSProperties = { fontSize: 13, fontWeight: 900, letterSpacing: "0.06em", color: T.text3, textTransform: "uppercase" };

  /* ── Panel de control específico del modo ──────────────────────────── */
  let control: ReactNode = null;
  if (modo === "miller") {
    control = (
      <>
        <Bloque titulo="Variable 1: la energía" icono="fa-bolt">
          <button type="button" className="ov-toggle" data-on={chispa} onClick={alternarChispa} style={{ ["--ovc" as string]: chispa ? "#fbbf24" : "rgba(255,255,255,0.2)" }}>
            <i className={`fa-solid ${chispa ? "fa-bolt" : "fa-bolt-slash"}`} style={{ marginRight: 9, color: chispa ? "#fbbf24" : T.text3 }} aria-hidden />
            {chispa ? "Descarga eléctrica: ENCENDIDA" : "Descarga eléctrica: APAGADA"}
          </button>
        </Bloque>
        <Bloque titulo="Variable 2: el tiempo" icono="fa-hourglass-half">
          <Deslizador label="Días de experimento" icon="fa-calendar-day" colr={modoCol} valor={`${dias} / ${DIAS_MAX}`} min={0} max={DIAS_MAX} step={1} value={dias}
            onChange={(v) => { setPlaying(false); setDias(v); }} hintL="hoy" hintR="una semana" />
        </Bloque>
        <Bloque titulo="Qué se acumula en la trampa" icono="fa-vial-circle-check">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            <Dato label="Con chispa" value={`${aminoConChispa} / ${AMINO_VIS}`} col="#34d399" />
            <Dato label="Sin chispa" value={`0 / ${AMINO_VIS}`} col="#fb7185" />
          </div>
          {nota(chispa ? "#34d399" : "#fb7185", chispa
            ? <>La descarga eléctrica aporta la energía que rompe y recombina los gases: cada día se acumulan más aminoácidos.</>
            : <>Sin energía eléctrica los gases no reaccionan: la trampa queda vacía por muchos días que pasen.</>)}
        </Bloque>
        <Bloque titulo="Atmósfera primitiva (reductora)" icono="fa-wind">
          <div className="ov-chips">
            {GASES_PRIMITIVOS.map((g) => (
              <span key={g.formula} className="ov-chip" style={{ borderColor: `${g.color}66`, background: `${g.color}1e`, color: "#fff" }}>
                <span aria-hidden style={{ width: 10, height: 10, borderRadius: "50%", background: g.color, display: "inline-block" }} />
                <strong style={{ fontFamily: "ui-monospace,monospace" }}>{g.formula}</strong>
                <span style={{ color: T.text3, fontWeight: 700 }}>{g.nombre}</span>
              </span>
            ))}
          </div>
        </Bloque>
        <Bloque titulo="Productos en la trampa" icono="fa-flask">
          <div className="ov-chips">
            {PRODUCTOS_MILLER.map((p, i) => {
              const on = i < productosActivos;
              return (
                <span key={p.abr} className="ov-chip" data-on={on} style={{ borderColor: on ? p.color : "rgba(255,255,255,0.12)", background: on ? `${p.color}1e` : "transparent", color: on ? "#fff" : T.text3 }}>
                  <strong style={{ color: on ? p.color : T.text3 }}>{p.abr}</strong>
                  {p.nombre}
                </span>
              );
            })}
          </div>
          {nota(modoCol, <>{hipMiller.evidencia}</>)}
        </Bloque>
      </>
    );
  } else if (modo === "ambientes") {
    const hip = hipotesisPorId(ambDef.hipotesisId);
    control = (
      <Bloque titulo="Elige una cuna candidata" icono="fa-earth-americas">
        <div className="ov-tabs">
          {AMBIENTES.map((a) => {
            const d = AMBIENTES_DEF[a];
            const col = `#${d.color.replace("#", "")}`;
            const on = a === ambiente;
            return (
              <button key={a} type="button" className="ov-tab" data-on={on} onClick={() => cambiarAmbiente(a)} style={{ ["--ovc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 17, marginBottom: 4, color: on ? col : "inherit" }}><i className={`fa-solid ${d.icono}`} aria-hidden /></div>
                <div style={{ fontSize: 14, fontWeight: 900, lineHeight: 1.15 }}>{d.etq}</div>
              </button>
            );
          })}
        </div>
        <div style={{ padding: "13px 15px", borderRadius: 12, border: `1px solid ${ambDef.color}55`, background: `${ambDef.color}12` }}>
          <div style={{ fontWeight: 900, color: "#fff", marginBottom: 6 }}>
            <i className={`fa-solid ${ambDef.icono}`} style={{ color: ambDef.color, marginRight: 8 }} aria-hidden />
            {hip.nombre} <span style={{ color: T.text3, fontWeight: 700 }}>· {hip.anio}</span>
          </div>
          <div style={{ color: T.text2, lineHeight: 1.55, marginBottom: 10 }}>{hip.descripcion}</div>
          <div style={{ color: "#eaf0fb", lineHeight: 1.5, padding: "9px 11px", borderRadius: 9, background: "rgba(4,10,22,0.4)" }}>
            <i className="fa-solid fa-flask-vial" style={{ color: ambDef.color, marginRight: 7 }} aria-hidden />{hip.evidencia}
          </div>
        </div>
      </Bloque>
    );
  } else {
    control = (
      <Bloque titulo={hipArn.nombre} icono="fa-dna">
        <p style={{ margin: 0, color: T.text2, lineHeight: 1.55 }}>{hipArn.descripcion}</p>
        <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${modoCol}25` }}>
          <i className="fa-solid fa-database" style={{ color: modoCol, marginTop: 4 }} aria-hidden />
          <div><strong>Almacena información</strong><div style={{ color: T.text2 }}>Su secuencia de bases guarda el mensaje genético, como hace el ADN hoy.</div></div>
        </div>
        <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${modoCol}25` }}>
          <i className="fa-solid fa-bolt-lightning" style={{ color: modoCol, marginTop: 4 }} aria-hidden />
          <div><strong>Cataliza reacciones (ribozima)</strong><div style={{ color: T.text2 }}>El ARN catalítico acelera reacciones, papel que hoy cumplen las proteínas.</div></div>
        </div>
        {nota(modoCol, <>{hipArn.evidencia}</>)}
      </Bloque>
    );
  }

  const teoria: ReactNode = (
    <>
      <Bloque titulo="El origen de la vida" icono="fa-seedling">
        <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
      </Bloque>
      <Bloque titulo="Lectura A1 — Hipótesis abióticas" icono="fa-book-open">
        <p style={{ margin: 0, color: T.text2 }}>{DEFINICION_ABIOTICA}</p>
        <div style={rotulo}>Para reflexionar</div>
        <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
          {PREGUNTAS.map((q, i) => <li key={i}>{q}</li>)}
        </ul>
      </Bloque>
      <Bloque titulo="Las hipótesis (lectura A1)" icono="fa-diagram-project">
        {HIPOTESIS.map((h) => (
          <div key={h.id} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${h.color}25` }}>
            <i className={`fa-solid ${h.icono}`} style={{ color: h.color, marginTop: 4 }} aria-hidden />
            <div style={{ minWidth: 0 }}>
              <strong>{h.nombre}</strong> <span style={{ color: T.text3 }}>· {h.anio}</span>
              <div style={{ color: T.text2 }}>{h.descripcion}</div>
            </div>
          </div>
        ))}
      </Bloque>
      <Bloque titulo="El aparato de Miller-Urey paso a paso" icono="fa-gears">
        {ETAPAS_MILLER.map((e) => (
          <div key={e.n} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
            <span style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{e.n}</span>
            <div style={{ minWidth: 0 }}>
              <strong><i className={`fa-solid ${e.icono}`} style={{ marginRight: 7, color: accent }} aria-hidden />{e.titulo}</strong>
              <div style={{ color: T.text2 }}>{e.detalle}</div>
            </div>
          </div>
        ))}
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
      <Bloque titulo="Datos clave" icono="fa-magnifying-glass-chart">
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
      <Bloque titulo="México: país megadiverso (CONABIO)" icono="fa-location-dot">
        <p style={{ margin: 0, color: T.text2 }}>{CONTEXTO}</p>
      </Bloque>
      <Bloque titulo="¿Sabías que? (quizzes A2/A4)" icono="fa-circle-question">
        <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
          {HECHOS.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      </Bloque>
      <Bloque titulo="Glosario (A5)" icono="fa-book">
        {GLOSARIO.map((g, i) => (
          <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}`, color: T.text2 }}>
            <strong style={{ color: accent }}>{g.termino}. </strong>{g.definicion}
            <div style={{ color: T.text3, marginTop: 4 }}><i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} aria-hidden />{g.ejemplo}</div>
          </div>
        ))}
      </Bloque>
      <Bloque titulo="Ficha teórica" icono="fa-book">
        <FichaTeorica data={ORIGEN_VIDA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
      </Bloque>
      <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
        Las cinco hipótesis, la definición de hipótesis abiótica, las preguntas de reflexión y el contexto de la CONABIO son <strong>verbatim</strong> de la lectura A1; el glosario y sus ejemplos son verbatim del glosario A5; los datos de «¿sabías que?» provienen de los quizzes A2/A4. El experimento de Miller-Urey está reconstruido de forma <strong>esquemática</strong>: el aparato (matraces, electrodos, condensador y trampa), la acumulación de aminoácidos y los dioramas de los ambientes son representaciones <strong>ilustrativas</strong> del mecanismo, no simulaciones químicas a escala molecular. La cifra «más de 20 aminoácidos tras una semana» es el resultado histórico verbatim del glosario A5. Fuente: {FUENTE}
      </p>
    </>
  );

  return (
    <>
      <style>{`
        .ov-tabs { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:8px; }
        .ov-tab { cursor:pointer; border:1px solid var(--ovc); border-radius:12px; padding:11px 6px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .ov-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .ov-tab:hover { background:rgba(255,255,255,0.06); }
        .ov-chips { display:flex; flex-wrap:wrap; gap:6px; }
        .ov-chip { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:9px;
          border:1px solid; font-size:14px; font-weight:800; transition:all .12s; }
        .ov-toggle { width:100%; cursor:pointer; border:1px solid var(--ovc); border-radius:11px; padding:12px 14px;
          background:rgba(4,10,22,0.4); color:#fff; font-size:15px; font-weight:900; text-align:left; transition:all .15s; }
        .ov-toggle[data-on="true"] { background:rgba(251,191,36,0.12); }
        .ov-toggle:hover { background:rgba(255,255,255,0.07); }
      `}</style>
      <LabShell
        accent={accent}
        rgba={color.rgba}
        retoKey={RETO_KEY}
        escena={
          <SceneBoundary fallback={sceneFallback}>
            <OrigenVidaScene
              modo={modo}
              ambiente={ambiente}
              dias={dias}
              chispa={chispa}
              nAmino={nAmino}
              playing={playing}
              accent={accent}
              modoColor={modoCol}
              resetNonce={resetNonce}
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
            {modo === "miller" && (
              <BotonHerramienta icono={chispa ? "fa-bolt" : "fa-bolt-slash"} titulo={chispa ? "Apagar chispa" : "Encender chispa"} activo={chispa} onClick={alternarChispa} />
            )}
            <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reanudar"} activo={playing} onClick={() => setPlaying((p) => !p)} />
            <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
          </>
        }
        lectura={lectura}
        objetivos={[
          { txt: "Enciende la chispa y deja pasar 3 días: ¿cuántos aminoácidos aparecen en la trampa?", done: modo === "miller" && chispa && dias >= 3 },
          { txt: "Haz correr el experimento de Miller-Urey hasta ver aminoácidos", done: modo === "miller" && nAmino > 0 },
          { txt: "Apaga la chispa: sin energía no hay síntesis", done: modo === "miller" && !chispa },
          { txt: "Compara los ambientes: caldo, ventilas hidrotermales y panspermia", done: modo === "ambientes" && ambiente !== "caldo" },
          { txt: "Explora el mundo ARN: una molécula que guarda y cataliza", done: modo === "mundoarn" },
          { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
        ]}
        pestanas={[
          { id: "controles", etiqueta: "Controles", icono: "fa-sliders", contenido: control },
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
    </>
  );
}
