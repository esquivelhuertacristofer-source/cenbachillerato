"use client";

/**
 * Laboratorio 3D — "Metabolismo celular en 3D: respiración y fotosíntesis".
 * Práctica experimental para CNEYT-VI-P03-A2 (ejercicio matemático "ATP total en
 * respiración aerobia"; progresión 3 "Explica los procesos de metabolismo celular:
 * respiración celular y fotosíntesis a nivel molecular", UAC CNEYT-VI).
 *
 * Tres procesos:
 *  (a) respiracion  — respiración aerobia (mitocondria): glucólisis → Krebs → cadena.
 *  (b) fotosintesis — cloroplasto: fase lumínica → ciclo de Calvin.
 *  (c) fermentacion — citosol (sin O₂): glucólisis → fermentación.
 * Avanza etapa por etapa con ‹ ›; en respiración y fermentación el contador de ATP
 * acumulado demuestra el ejercicio A2: 2 + 2 + 32 = 36 ATP.
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { METABOLISMO_FICHA } from "./metabolismo-ficha";
import {
  type Proceso, PROCESOS, PROCESOS_DEF, etapasDe,
  PROBLEMA_ATP, RESPUESTA_ATP, DESGLOSE_ATP, RETO_A2,
  PROBLEMA, INSTRUCCIONES, PREGUNTAS, IDEAS, GLOSARIO, CONTEXTO, FUENTE, DATOS,
} from "./metabolismo-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-metabolismo-celular-3d-reto";

const MetabolismoScene = dynamic(() => import("./MetabolismoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bolt fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el metabolismo en 3D…</span>
    </div>
  ),
});

export function LabMetabolismo({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [proceso, setProceso] = useState<Proceso>("respiracion");
  const [idx, setIdx] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable, teoría (cajón deslizable) y sonido
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
  const cambiarProceso = (p: Proceso) => {
    setProceso(p);
    setIdx(0);
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const resetProceso = () => {
    setIdx(0);
    bump();
  };

  // valores en vivo
  const def = PROCESOS_DEF[proceso];
  const etapas = etapasDe(proceso);
  const seguro = etapas.length > 0 ? Math.min(idx, etapas.length - 1) : 0;
  const etapa = etapas[seguro];
  const etapaActiva = etapa ? etapa.id : null;
  const procCol = `#${def.color.replace("#", "")}`;

  // ATP acumulado hasta la etapa actual (respiración / fermentación)
  const muestraAtp = def.atpTotal >= 0; // -1 = fotosíntesis (n/a)
  const atpAcum = etapas.slice(0, seguro + 1).reduce((s, e) => s + e.atp, 0);
  const atpTotal = etapas.reduce((s, e) => s + e.atp, 0);
  const pasoUltimo = seguro >= etapas.length - 1;

  const prev = () => {
    if (sonido) audioRef.current?.blip();
    setIdx((i) => Math.max(0, i - 1));
  };
  const next = () => {
    if (sonido) audioRef.current?.blip();
    setIdx((i) => Math.min(etapas.length - 1, i + 1));
  };

  // Misiones que no se «des-cumplen» al cambiar de proceso o de etapa.
  const llegoA36 = useLatch(proceso === "respiracion" && atpAcum === 36);
  const recorrioResp = useLatch(proceso === "respiracion" && idx > 0);
  const vioFoto = useLatch(proceso === "fotosintesis");
  const vioFerm = useLatch(proceso === "fermentacion");

  const lectura = etapa
    ? <>Etapa {seguro + 1}/{etapas.length}: {etapa.nombre}{muestraAtp ? ` · ${atpAcum} ATP` : ""}</>
    : <>Elige un proceso</>;

  // panel de contador (valor calculado, no componente anidado)
  const contador = muestraAtp ? (
    <div style={{ borderRadius: 14, padding: "14px 16px", border: `1px solid ${procCol}55`, background: `${procCol}14` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: T.text3 }}>ATP ACUMULADO</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>etapa {seguro + 1} / {etapas.length}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 40, fontWeight: 900, color: "#fde047", fontFamily: "ui-monospace, monospace", lineHeight: 1 }}>{atpAcum}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: T.text2 }}>/ {atpTotal} ATP</span>
        {pasoUltimo && atpAcum === 36 && (
          <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 900, color: "#86efac", border: "1px solid #86efac55", borderRadius: 7, padding: "4px 9px" }}>
            <i className="fa-solid fa-check" style={{ marginRight: 6 }} />2 + 2 + 32 = 36
          </span>
        )}
      </div>
      {/* barra segmentada por etapa */}
      <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
        {etapas.map((e, i) => {
          const ec = `#${e.color.replace("#", "")}`;
          const peso = atpTotal > 0 ? Math.max(e.atp / atpTotal, e.atp === 0 ? 0.06 : 0.08) : 1 / etapas.length;
          return (
            <div key={e.id} style={{ flex: peso, height: 10, borderRadius: 4, background: i <= seguro ? ec : "rgba(255,255,255,0.08)", opacity: i <= seguro ? 1 : 0.5, transition: "all .2s" }} title={`${e.nombre}: +${e.atp} ATP`} />
          );
        })}
      </div>
    </div>
  ) : (
    <div style={{ borderRadius: 14, padding: "14px 16px", border: `1px solid ${procCol}55`, background: `${procCol}14` }}>
      <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, marginBottom: 8 }}>BALANCE DE LA FOTOSÍNTESIS</div>
      <div style={{ color: "#eaf0fb", lineHeight: 1.5 }}>
        La fotosíntesis <strong>no rinde ATP neto para la célula</strong>: el ATP que genera la fase lumínica se consume en el ciclo de Calvin para fabricar glucosa. Su producto energético es la <strong>glucosa</strong> (C₆H₁₂O₆), combustible que luego la respiración oxida para liberar ~36 ATP.
      </div>
    </div>
  );

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar el proceso en 3D, pero la información sigue aquí. {def.resumen} {etapa ? `Etapa actual — ${etapa.nombre}: ${etapa.descripcion}` : ""}
      </div>
    </div>
  );

  const lista14: React.CSSProperties = { margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 };
  const chipMol: React.CSSProperties = { fontSize: 14, fontWeight: 700, fontFamily: "ui-monospace, monospace", padding: "4px 9px", borderRadius: 7 };
  const ecEtapa = etapa ? `#${etapa.color.replace("#", "")}` : procCol;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <MetabolismoScene
            proceso={proceso}
            etapaActiva={etapaActiva}
            onSelect={(id) => {
              const i = etapas.findIndex((e) => e.id === id);
              if (i >= 0) setIdx(i);
            }}
            playing={playing}
            accent={accent}
            resetNonce={resetNonce}
            atpAcum={atpAcum}
            atpTotal={def.atpTotal}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: PROCESOS.map((p) => ({ id: p, etiqueta: PROCESOS_DEF[p].etq, icono: PROCESOS_DEF[p].icono })),
        valor: proceso,
        cambiar: (id) => cambiarProceso(id as Proceso),
      }}
      herramientas={
        <>
          <BotonHerramienta icono="fa-chevron-left" titulo="Etapa anterior" onClick={prev} />
          <BotonHerramienta icono="fa-chevron-right" titulo="Siguiente etapa" onClick={next} />
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar animación" : "Reanudar animación"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar la vista" onClick={resetProceso} />
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Avanza etapa por etapa en la respiración hasta que el ATP llegue a 36", done: llegoA36 },
        { txt: "Recorre las etapas de la respiración aerobia", done: recorrioResp },
        { txt: "Pasa a la fotosíntesis y sigue la luz hasta la glucosa", done: vioFoto },
        { txt: "Compara con la fermentación: sin oxígeno, solo 2 ATP", done: vioFerm },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Etapas",
          icono: "fa-shoe-prints",
          contenido: (
            <>
              <Bloque titulo={`Recorrido: ${def.etq}`} icono={def.icono}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))", gap: 8 }}>
                  {etapas.map((e, i) => {
                    const on = i === seguro;
                    const done = i < seguro;
                    const ec = `#${e.color.replace("#", "")}`;
                    return (
                      <button key={e.id} type="button" onClick={() => setIdx(i)}
                        style={{ cursor: "pointer", borderRadius: 10, padding: "9px 8px", textAlign: "center", color: "#fff",
                          border: `1px solid ${on ? ec : done ? `${ec}55` : "rgba(255,255,255,0.12)"}`, background: on ? `${ec}22` : done ? `${ec}10` : "rgba(4,10,22,0.4)" }}>
                        <div style={{ fontSize: 16, marginBottom: 3, color: on || done ? ec : T.text3 }}><i className={`fa-solid ${e.icono}`} /></div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: on ? "#fff" : T.text2, lineHeight: 1.2 }}>{e.nombre}</div>
                        <div style={{ fontSize: 14, fontWeight: 900, marginTop: 3, color: e.atp > 0 ? "#fde047" : T.text3, fontFamily: "ui-monospace, monospace" }}>{e.atp > 0 ? `+${e.atp} ATP` : "0 ATP"}</div>
                      </button>
                    );
                  })}
                </div>
                {contador}
              </Bloque>

              {etapa && (
                <Bloque titulo={etapa.nombre} icono={etapa.icono}>
                  <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${ecEtapa}44`, background: `${ecEtapa}12`, display: "grid", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", color: T.text3 }}>
                      <span><i className="fa-solid fa-location-dot" style={{ marginRight: 5 }} />{etapa.lugar}</span>
                      <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 900, letterSpacing: "0.06em", color: etapa.fuente === "A2" ? "#fcd34d" : etapa.fuente === "A5" ? "#86efac" : T.text3, border: `1px solid ${etapa.fuente === "A2" ? "#fcd34d55" : etapa.fuente === "A5" ? "#86efac55" : T.line}`, borderRadius: 6, padding: "3px 7px" }}>
                        {etapa.fuente === "A2" ? "EJERCICIO A2" : etapa.fuente === "A5" ? "GLOSARIO A5" : "LECTURA A1"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ ...chipMol, color: "#cdd8ec", background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>{etapa.reactivos}</span>
                      <i className="fa-solid fa-arrow-right" style={{ color: procCol }} />
                      <span style={{ ...chipMol, color: "#fff", background: `${procCol}1f`, border: `1px solid ${procCol}55` }}>{etapa.productos}</span>
                      {etapa.atp > 0 && (
                        <span style={{ ...chipMol, fontWeight: 900, color: "#fde047", background: "#fde0471f", border: "1px solid #fde04755" }}>
                          <i className="fa-solid fa-bolt" style={{ marginRight: 5 }} />+{etapa.atp} ATP
                        </span>
                      )}
                    </div>
                    <div style={{ color: "#eaf0fb", lineHeight: 1.55 }}>{etapa.descripcion}</div>
                    {etapa.detalle && (
                      <div style={{ paddingTop: 9, borderTop: `1px solid ${T.line}`, color: T.text2, lineHeight: 1.5 }}>
                        <i className="fa-solid fa-lightbulb" style={{ color: "#fbbf24", marginRight: 7 }} />
                        {etapa.detalle}
                      </div>
                    )}
                  </div>
                </Bloque>
              )}

              <Bloque titulo="Lecturas" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="etapas" value={`${etapas.length}`} col={procCol} />
                  <Dato label="organelo" value={def.organelo.split(" ")[0] ?? def.organelo} />
                  <Dato label="usa O₂" value={def.aerobio ? "Sí" : "No"} col={def.aerobio ? "#86efac" : "#fca5a5"} />
                  <Dato label="ATP / glucosa" value={muestraAtp ? `${atpTotal}` : "n/a"} col="#fde047" />
                </div>
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
              playSfx={() => {
                if (sonido) audioRef.current?.correcto();
              }}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="El visor del metabolismo" icono="fa-bolt">
                <div style={{ color: T.text2 }}>{PROBLEMA}</div>
              </Bloque>
              <Bloque titulo={`Ecuación global: ${def.etq}`} icono="fa-flask-vial">
                <div style={{ fontWeight: 800, color: "#fff", fontFamily: "ui-monospace, monospace", lineHeight: 1.5, padding: "10px 12px", borderRadius: 10, background: "rgba(4,10,22,0.5)", border: `1px solid ${procCol}33` }}>
                  {def.ecuacion}
                </div>
                <div style={{ color: T.text2, lineHeight: 1.55 }}>{def.resumen}</div>
              </Bloque>
              <Bloque titulo="Reto A2: ATP total en respiración aerobia" icono="fa-calculator">
                <div style={{ color: T.text2, lineHeight: 1.55 }}>{PROBLEMA_ATP}</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {DESGLOSE_ATP.map((d, i) => {
                    const pct = Math.max(8, (d.atp / 36) * 100);
                    return (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontWeight: 800, marginBottom: 4 }}>
                          <span style={{ color: "#fff" }}>{d.etapa} <span style={{ color: T.text3, fontWeight: 600 }}>· {d.lugar}</span></span>
                          <span style={{ color: "#fde047", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap" }}>{d.atp} ATP</span>
                        </div>
                        <div style={{ height: 9, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: "#fbbf24" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 11, background: "rgba(252,211,77,0.12)", border: "1px solid #fcd34d44" }}>
                  <span style={{ fontWeight: 800, color: "#fff" }}>2 + 2 + 32 =</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: "#fde047", fontFamily: "ui-monospace, monospace" }}>{RESPUESTA_ATP} ATP</span>
                </div>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={lista14}>{INSTRUCCIONES.map((p, i) => <li key={i}>{p}</li>)}</ol>
              </Bloque>
              <Bloque titulo="Para reflexionar" icono="fa-circle-question">
                <ul style={lista14}>{PREGUNTAS.map((q, i) => <li key={i}>{q}</li>)}</ul>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={lista14}>{IDEAS.map((x, i) => <li key={i}>{x}</li>)}</ul>
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
              <Bloque titulo="México: el equilibrio fotosíntesis–respiración" icono="fa-location-dot">
                <div style={{ color: T.text2 }}>{CONTEXTO}</div>
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-book">
                {GLOSARIO.map((g, i) => (
                  <div key={i}><strong style={{ color: accent }}>{g.termino}. </strong><span style={{ color: T.text2 }}>{g.definicion}</span></div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={METABOLISMO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                El problema, los pasos guía y la respuesta (<strong>2 + 2 + 32 = 36 ATP</strong>) son <strong>verbatim</strong> del ejercicio A2 (etiqueta «EJERCICIO A2»). Las definiciones de las etapas son verbatim del glosario A5 (etiqueta «GLOSARIO A5»). El modelo 3D es <strong>esquemático</strong>: la mitocondria, el cloroplasto y el citosol, los nodos de cada etapa, las moléculas que recorren la ruta, las fichas y el medidor de ATP son representaciones visuales (no a escala, ni con el número real de moléculas). Las ideas clave, el contexto del SINAP y las preguntas para reflexionar son de la lectura A1. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/** Una vez que la condición se cumple, se queda cumplida (cambiar de modo no la deshace). */
function useLatch(cond: boolean): boolean {
  const [l, setL] = useState(false);
  if (cond && !l) setL(true);
  return l || cond;
}
