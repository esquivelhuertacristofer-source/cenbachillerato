"use client";

/**
 * Laboratorio 3D — "La célula en 3D: organelos y funciones".
 * Práctica experimental para CNEYT-VI-P02-A1 (infografía "Células procariota y
 * eucariota: organelos y funciones"; progresión 2 "Explica la estructura y
 * función de la célula: procariota y eucariota, animal y vegetal", UAC CNEYT-VI).
 *
 * Tres modos (tipos de célula):
 *  (a) animal     — eucariota animal (núcleo, mitocondria, RE, Golgi, lisosomas).
 *  (b) vegetal    — eucariota vegetal (+ pared, cloroplastos, vacuola central).
 *  (c) procariota — sin núcleo: ADN circular flotante (nucleoide) y ribosomas.
 * Haz clic en cada organelo para ver su función (verbatim del glosario A5/A1).
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { CELULA_FICHA } from "./celula-ficha";
import {
  type Modo, MODOS, organelosDe, organeloPorId, CELULAS,
  COMPARACION, TAMANOS,
  PROBLEMA, INSTRUCCIONES, PREGUNTAS, IDEAS, GLOSARIO, CONTEXTO, FUENTE, DATOS, QUIZ_A2,
} from "./celula-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-celula-organelos-3d-reto";

const CelulaScene = dynamic(() => import("./CelulaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bacterium fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Ensamblando la célula en 3D…</span>
    </div>
  ),
});

export function LabCelula({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("animal");
  const [selected, setSelected] = useState<string | null>("nucleo");
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // teoría (cajón deslizable) y sonido
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
  const cambiarModo = (m: Modo) => {
    setModo(m);
    const primero = organelosDe(m)[0];
    setSelected(primero ? primero.id : null);
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const resetModo = () => {
    const primero = organelosDe(modo)[0];
    setSelected(primero ? primero.id : null);
    bump();
  };

  // valores en vivo
  const cel = CELULAS[modo];
  const lista = organelosDe(modo);
  const sel = selected ? organeloPorId(selected) : undefined;
  // si el organelo seleccionado no existe en este modo, no se resalta
  const selEnModo = sel && sel.modos.includes(modo) ? sel : undefined;

  const modoCol = `#${cel.color.replace("#", "")}`;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${cel.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{cel.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la célula en 3D, pero la información sigue aquí. {cel.subtitulo} · tamaño {cel.tamano} · {lista.length} estructuras etiquetadas. {selEnModo ? `${selEnModo.nombre}: ${selEnModo.funcion}` : ""}
      </div>
    </div>
  );

  // Misiones que no se «des-cumplen» al cambiar de tipo de célula.
  const recorrioAnimal = useLatch(modo === "animal" && selected !== "nucleo");
  const vioCloroplasto = useLatch(modo === "vegetal" && selected === "cloroplasto");
  const vioVegetal = useLatch(modo === "vegetal");
  const vioProcariota = useLatch(modo === "procariota");

  const lectura = <>{cel.etq} · {lista.length} estructuras{selEnModo ? ` · ${selEnModo.nombre.replace(" (RE)", "").replace(" (nucleoide)", "")}` : ""}</>;

  const lista14: React.CSSProperties = { margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 };
  const celdaCmp: React.CSSProperties = { padding: "8px 10px", background: "rgba(4,10,22,0.35)", fontSize: 14, lineHeight: 1.3, color: T.text2, minWidth: 0 };
  const colSel = selEnModo ? `#${selEnModo.color.replace("#", "")}` : accent;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <CelulaScene
            modo={modo}
            selected={selEnModo ? selEnModo.id : null}
            onSelect={(id) => setSelected(id)}
            playing={playing}
            accent={accent}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m, etiqueta: CELULAS[m].etq, icono: CELULAS[m].icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar giro" : "Reanudar giro"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar la vista" onClick={resetModo} />
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "En la célula vegetal, toca el cloroplasto: es lo que la animal no tiene", done: vioCloroplasto },
        { txt: "Recorre los organelos de la célula animal", done: recorrioAnimal },
        { txt: "Pasa a la célula vegetal y busca el cloroplasto y la pared celular", done: vioVegetal },
        { txt: "Compara con la procariota: sin núcleo y con ADN circular", done: vioProcariota },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Organelos",
          icono: "fa-hand-pointer",
          contenido: (
            <>
              <Bloque titulo={`Organelos: ${cel.etq}`} icono={cel.icono}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 8 }}>
                  {lista.map((o) => {
                    const on = selEnModo?.id === o.id;
                    const oc = `#${o.color.replace("#", "")}`;
                    return (
                      <button key={o.id} type="button" onClick={() => setSelected(o.id)}
                        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 9, textAlign: "left", width: "100%", borderRadius: 10, padding: "9px 11px", border: `1px solid ${on ? oc : "rgba(255,255,255,0.12)"}`, background: on ? `${oc}1f` : "rgba(4,10,22,0.4)" }}>
                        <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: on ? "#04121f" : oc, background: on ? oc : `${oc}22` }}>
                          <i className={`fa-solid ${o.icono}`} />
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: on ? "#fff" : T.text2, lineHeight: 1.2, minWidth: 0 }}>{o.nombre}</span>
                      </button>
                    );
                  })}
                </div>
                {selEnModo ? (
                  <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${colSel}44`, background: `${colSel}12` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#04121f", background: colSel }}>
                        <i className={`fa-solid ${selEnModo.icono}`} />
                      </span>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{selEnModo.nombre}</div>
                      <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 900, letterSpacing: "0.06em", color: selEnModo.fuente === "A5" ? "#86efac" : T.text3, border: `1px solid ${selEnModo.fuente === "A5" ? "#86efac55" : T.line}`, borderRadius: 6, padding: "3px 7px" }}>
                        {selEnModo.fuente === "A5" ? "GLOSARIO A5" : "INFOGRAFÍA A1"}
                      </span>
                    </div>
                    <div style={{ color: "#eaf0fb", lineHeight: 1.55 }}>{selEnModo.funcion}</div>
                    {selEnModo.ejemplo && (
                      <div style={{ marginTop: 9, paddingTop: 9, borderTop: `1px solid ${T.line}`, color: T.text2, lineHeight: 1.5 }}>
                        <i className="fa-solid fa-lightbulb" style={{ color: "#fbbf24", marginRight: 7 }} />
                        {selEnModo.ejemplo}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: T.text2 }}>Toca un organelo en la célula o en la lista para ver su función.</p>
                )}
              </Bloque>

              <Bloque titulo="Lecturas" icono={cel.icono}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="estructuras" value={`${lista.length}`} col={modoCol} />
                  <Dato label="núcleo" value={cel.conNucleo ? "Sí" : "No"} col={cel.conNucleo ? "#86efac" : "#fca5a5"} />
                  <Dato label="pared celular" value={cel.conPared ? "Sí" : "No"} col={cel.conPared ? "#86efac" : "#fca5a5"} />
                  <Dato label="tamaño" value={cel.tamano} />
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
            <RetoQuizCard
              quiz={QUIZ_A2}
              accent={accent}
              rgba={color.rgba}
              aprobado={ejercicioAprobado}
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
              playPick={sonido ? () => audioRef.current?.blip() : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="El visor de la célula" icono="fa-microscope">
                <div style={{ color: T.text2 }}>{PROBLEMA}</div>
              </Bloque>
              <Bloque titulo="Procariota vs eucariota" icono="fa-code-compare">
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr) minmax(0,1fr)", gap: 1, background: T.line, borderRadius: 10, overflow: "hidden", border: `1px solid ${T.line}` }}>
                  <div style={celdaCmp}> </div>
                  <div style={{ ...celdaCmp, fontWeight: 900, color: "#7dd3fc" }}>Procariota</div>
                  <div style={{ ...celdaCmp, fontWeight: 900, color: "#f9a8d4" }}>Eucariota</div>
                  {COMPARACION.map((f, i) => (
                    <FilaCmp key={i} f={f} celda={celdaCmp} />
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Comparación de tamaño" icono="fa-ruler-horizontal">
                <div style={{ display: "grid", gap: 11 }}>
                  {TAMANOS.map((t, i) => {
                    const pct = Math.max(6, (t.micras / 100) * 100);
                    const tc = `#${t.color.replace("#", "")}`;
                    return (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontWeight: 800, marginBottom: 4 }}>
                          <span style={{ color: "#fff" }}>{t.etq}</span>
                          <span style={{ color: tc, fontFamily: "ui-monospace, monospace" }}>{t.rango}</span>
                        </div>
                        <div style={{ height: 9, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: tc }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.45 }}>
                  Las procariotas (0.5–5 μm) son hasta 20 veces más pequeñas que las eucariotas (10–100 μm). Barra a escala lineal respecto a 100 μm.
                </div>
              </Bloque>
              <Bloque titulo="Pasos para explorar" icono="fa-list-ol">
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
              <Bloque titulo="El ajolote de Xochimilco" icono="fa-location-dot">
                <div style={{ color: T.text2 }}>{CONTEXTO}</div>
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-book">
                {GLOSARIO.map((g, i) => (
                  <div key={i}><strong style={{ color: accent }}>{g.termino}. </strong><span style={{ color: T.text2 }}>{g.definicion}</span></div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CELULA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                Las funciones de cada organelo son <strong>verbatim</strong>: las del núcleo, mitocondria, cloroplasto, RE y Golgi provienen del glosario A5 (etiqueta «GLOSARIO A5»); las de membrana, pared, ribosomas, lisosomas, vacuola y nucleoide se basan en la infografía A1 (etiqueta «INFOGRAFÍA A1»). La tabla comparativa y la barra de tamaño son verbatim de A5 y A1. La célula en 3D es <strong>esquemática</strong>: formas, colores y posiciones son representaciones visuales (no a escala ni con número real de organelos). Fuente: {FUENTE}
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

/* ── Fila de la tabla comparativa ─────────────────────────────────────────── */
function FilaCmp({ f, celda }: { f: { caracteristica: string; procariota: string; eucariota: string }; celda: React.CSSProperties }) {
  return (
    <>
      <div style={{ ...celda, fontWeight: 800, color: "#fff" }}>{f.caracteristica}</div>
      <div style={celda}>{f.procariota}</div>
      <div style={celda}>{f.eucariota}</div>
    </>
  );
}
