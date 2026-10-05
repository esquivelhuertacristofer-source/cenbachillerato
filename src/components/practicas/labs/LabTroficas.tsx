"use client";

/**
 * Laboratorio 3D — Redes tróficas y flujo de energía.
 * Práctica experimental para CNEYT-III-P02-A1 (lectura; progresión 2).
 *
 * El alumno fija la ENERGÍA de los productores (kcal) y la EFICIENCIA ECOLÓGICA
 * (%) y ve cómo la energía sube por una pirámide trófica 3D como partículas
 * verdes, mientras el ~90% se escapa como calor (naranja) en cada nivel: la
 * "regla del 10%". Anclado a ecosistemas de México (Mar de Cortés, bosque
 * templado, selva húmeda) y a su megadiversidad marina.
 * EXPERIMENTO CENTRAL (causa → efecto): «quita una especie». Al quitar un nivel,
 * los de arriba se quedan sin alimento y los de abajo cambian de población
 * (cascada trófica): se ve en la cantidad de esferas de biomasa de la pirámide.
 * Ecosistemas, interacciones y energía — flujo de energía (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { REDES_TROFICAS_FICHA } from "./redes-troficas-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./redes-troficas-data";
import { LabSfx } from "./lab-audio";
import {
  NIVELES, DESCOMPONEDORES, ECOSISTEMAS, DATOS_MX, IDEAS, calcularNiveles, cascada,
  ENERGIA_MIN, ENERGIA_MAX, ENERGIA_STEP, ENERGIA_DEFAULT,
  EF_MIN, EF_MAX, EF_STEP, EF_DEFAULT,
  fmt0, fmtKcal, type NivelKey,
} from "./troficas-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-redes-troficas-reto";

const TroficasScene = dynamic(() => import("./TroficasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-seedling fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Encendiendo el flujo de energía…</span>
    </div>
  ),
});

const NARANJA = "#f97316";

export function LabTroficas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [energia, setEnergia] = useState(ENERGIA_DEFAULT);
  const [eficiencia, setEficiencia] = useState(EF_DEFAULT);
  const [ecoIdx, setEcoIdx] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // experimento «quita una especie»
  const [quitado, setQuitado] = useState<number | null>(null);
  const [quitoHerbivoros, setQuitoHerbivoros] = useState(false);
  const [quitoTope, setQuitoTope] = useState(false);

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

  const eco = ECOSISTEMAS[ecoIdx]!;
  const niveles = useMemo(() => calcularNiveles(energia, eficiencia), [energia, eficiencia]);
  const organismos = useMemo(() => NIVELES.map((nv) => eco.organismos[nv.key as NivelKey][0]!), [eco]);
  const casc = useMemo(() => cascada(quitado), [quitado]);

  const quitar = (i: number | null) => {
    setQuitado(i);
    if (i === 1) setQuitoHerbivoros(true);
    if (i === 3) setQuitoTope(true);
    if (sonido) audioRef.current?.blip();
  };

  const reset = () => {
    setEnergia(ENERGIA_DEFAULT);
    setEficiencia(EF_DEFAULT);
    setQuitado(null);
    if (sonido) audioRef.current?.blip();
    bump();
  };

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-seedling" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>La energía fluye y se pierde</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 410, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la pirámide en 3D, pero la idea sigue: la energía del Sol entra por los productores y al subir de un nivel al siguiente solo pasa ~10% —el resto se escapa como calor—. Por eso hay muchos más herbívoros que depredadores. Usa los controles y las lecturas para explorarlo.
      </div>
    </div>
  );

  const lectura = quitado === null
    ? <>{fmtKcal(energia)} kcal abajo → {fmtKcal(niveles[3]!.energia)} kcal arriba</>
    : quitado === 0
      ? <>Sin {organismos[0]}, toda la red colapsa</>
      : <>Sin {organismos[quitado]}: {organismos[quitado - 1]} se multiplica</>;

  const textoCascada = (() => {
    if (quitado === null) return "Quita un nivel y mira cómo cambia la población de los demás.";
    if (quitado === 0) return `Sin ${organismos[0]} no entra energía al ecosistema: todos los niveles se quedan sin alimento.`;
    const arriba = quitado < 3 ? ` Los de arriba (${organismos.slice(quitado + 1).join(", ")}) se quedan sin alimento.` : "";
    return `Sin ${organismos[quitado]}, ${organismos[quitado - 1]} ya no es comido y crece (+60 %).${arriba}${quitado >= 2 ? ` Y ${organismos[quitado - 2]} sufre por ese exceso (−30 %).` : ""}`;
  })();

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <TroficasScene
            energia={energia} eficiencia={eficiencia}
            quitado={quitado} organismos={organismos}
            accent={accent}
            pausado={pausado}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar" : "Pausar"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <div style={{ fontWeight: 900, color: accent }}>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 7 }} />
            Eficiencia {fmt0(eficiencia)}%
          </div>
          <div style={{ color: T.text2 }}>Verde: energía que sube</div>
          <div style={{ color: NARANJA }}>Naranja: calor perdido</div>
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Ajusta la energía inicial y observa el flujo en la pirámide", done: energia !== ENERGIA_DEFAULT },
        { txt: "Modifica la eficiencia ecológica y compara niveles", done: eficiencia !== EF_DEFAULT },
        { txt: "Quita a los herbívoros y mira qué pasa con las plantas y los carnívoros", done: quitoHerbivoros },
        { txt: "Quita al depredador tope y mira cómo se desordena la red", done: quitoTope },
        { txt: "Explora al menos dos ecosistemas mexicanos", done: ecoIdx > 0 },
        { txt: "Resuelve el reto evaluable de la actividad A4", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Quita una especie" icono="fa-circle-minus">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                  {NIVELES.map((nv) => (
                    <button key={nv.key} onClick={() => quitar(quitado === nv.orden ? null : nv.orden)}
                      style={{ cursor: "pointer", padding: "10px 12px", borderRadius: 12, border: `1px solid ${quitado === nv.orden ? nv.color : T.line}`, background: quitado === nv.orden ? `${nv.color}22` : T.inset, color: quitado === nv.orden ? "#fff" : T.text2, fontSize: 14, fontWeight: 800, textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                      <i className={`fa-solid ${nv.icono}`} style={{ color: nv.color }} />
                      Quitar: {organismos[nv.orden]}
                    </button>
                  ))}
                </div>
                <button onClick={() => quitar(null)}
                  style={{ cursor: "pointer", padding: "10px 12px", borderRadius: 12, border: `1px solid ${T.line}`, background: T.inset, color: T.text2, fontSize: 14, fontWeight: 800 }}>
                  <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
                  Devolver todas las especies
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {NIVELES.map((nv) => {
                    const m = casc.mult[nv.orden]!;
                    const est = casc.estado[nv.orden]!;
                    return (
                      <Dato key={nv.key} label={organismos[nv.orden]!}
                        value={est === "quitado" ? "quitado" : est === "hambre" ? "sin alimento" : m === 1 ? "normal" : `${m > 1 ? "+" : "−"}${Math.abs(Math.round((m - 1) * 100))} %`}
                        col={est !== "normal" ? "#9aa7b4" : nv.color} />
                    );
                  })}
                </div>
                <p style={{ margin: 0, color: T.text2 }}>{textoCascada}</p>
                <p style={{ margin: 0, fontSize: 14, color: T.text3 }}>Simulación cualitativa de una cascada trófica; los porcentajes son de ejemplo.</p>
              </Bloque>

              <Bloque titulo="El flujo de energía" icono="fa-sliders">
                <Deslizador label="Energía de los productores" icon="fa-bolt" colr={accent}
                  valor={`${fmtKcal(energia)} kcal`} min={ENERGIA_MIN} max={ENERGIA_MAX} step={ENERGIA_STEP} value={energia}
                  onChange={setEnergia} hintL={`${fmtKcal(ENERGIA_MIN)} kcal`} hintR={`${fmtKcal(ENERGIA_MAX)} kcal`} />
                <Deslizador label="Eficiencia ecológica" icon="fa-gauge-high" colr={NARANJA}
                  valor={`${fmt0(eficiencia)} %`} min={EF_MIN} max={EF_MAX} step={EF_STEP} value={eficiencia}
                  onChange={setEficiencia} hintL={`${EF_MIN}% (poco eficiente)`} hintR={`${EF_MAX}% (muy eficiente)`} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                  {ECOSISTEMAS.map((e, i) => (
                    <button key={e.key} title={e.dato} onClick={() => setEcoIdx(i)}
                      style={{ cursor: "pointer", padding: "10px 12px", borderRadius: 12, border: `1px solid ${i === ecoIdx ? accent : T.line}`, background: i === ecoIdx ? `rgba(${color.rgba},0.18)` : T.inset, color: i === ecoIdx ? "#fff" : T.text2, fontSize: 14, fontWeight: 800, textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                      <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                      {e.nombre}
                    </button>
                  ))}
                </div>
              </Bloque>

              <Bloque titulo={`Pirámide de energía — ${eco.nombre}`} icono="fa-chart-simple">
                <div style={{ display: "grid", gap: 8 }}>
                  {[...NIVELES].reverse().map((nv) => {
                    const calc = niveles[nv.orden]!;
                    const ancho = Math.max(8, Math.pow(eficiencia / 100, nv.orden) * 100);
                    return (
                      <div key={nv.key} style={{ display: "grid", gridTemplateColumns: "minmax(0,110px) minmax(0,1fr)", alignItems: "center", gap: 10 }}>
                        <div style={{ textAlign: "right", fontSize: 14, fontWeight: 800, color: nv.color }}>
                          {organismos[nv.orden]}
                        </div>
                        <div style={{ height: 28, borderRadius: 7, display: "flex", alignItems: "center", paddingLeft: 10, color: "#04121f", fontWeight: 900, fontSize: 14, fontFamily: "ui-monospace, monospace", width: `${ancho}%`, minWidth: 84, background: `linear-gradient(90deg, ${nv.color}, ${nv.color}bb)` }}>
                          {fmtKcal(calc.energia)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Llega a la cima" value={`${fmtKcal(niveles[3]!.porcentaje)} %`} col={NARANJA} />
                  <Dato label="Perdido por nivel" value={`${fmt0(100 - eficiencia)} % calor`} col={NARANJA} />
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
              <Bloque titulo="Niveles tróficos" icono="fa-layer-group">
                {NIVELES.map((nv) => (
                  <div key={nv.key} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${nv.icono}`} style={{ color: nv.color, marginTop: 4 }} aria-hidden />
                    <div>
                      <div style={{ fontWeight: 900, color: "#fff" }}>{nv.nombre} <span style={{ color: nv.color, fontWeight: 700 }}>· {nv.rol}</span></div>
                      <div style={{ color: T.text2 }}>{nv.descripcion}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${DESCOMPONEDORES.icono}`} style={{ color: DESCOMPONEDORES.color, marginTop: 4 }} aria-hidden />
                  <div>
                    <div style={{ fontWeight: 900, color: "#fff" }}>{DESCOMPONEDORES.nombre} <span style={{ color: DESCOMPONEDORES.color, fontWeight: 700 }}>· {DESCOMPONEDORES.rol}</span></div>
                    <div style={{ color: T.text2 }}>{eco.descomponedor}: {DESCOMPONEDORES.descripcion}</div>
                  </div>
                </div>
              </Bloque>
              <Bloque titulo={eco.nombre} icono={eco.icono}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                  {NIVELES.map((nv, i) => (
                    <span key={nv.key} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#eaf2fb", padding: "4px 10px", borderRadius: 999, background: `${nv.color}22`, border: `1px solid ${nv.color}55` }}>
                        {eco.organismos[nv.key as NivelKey].join(" · ")}
                      </span>
                      {i < NIVELES.length - 1 && <i className="fa-solid fa-arrow-right" style={{ color: T.text3 }} />}
                    </span>
                  ))}
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  <i className="fa-solid fa-circle-info" style={{ color: accent, marginRight: 7 }} />
                  {eco.dato}
                </p>
              </Bloque>
              <Bloque titulo="México megadiverso" icono="fa-earth-americas">
                {DATOS_MX.map((cf, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${cf.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                    <div>
                      <strong style={{ fontFamily: "ui-monospace, monospace" }}>{cf.valor}</strong>
                      <div style={{ color: T.text2 }}>{cf.texto}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={REDES_TROFICAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Modelo didáctico: la «regla del 10%» es una simplificación reconocida; la eficiencia ecológica real varía entre 5% y 20% según el ecosistema. Las kcal son valores de referencia para mostrar la proporción entre niveles, no medidas de un sitio concreto. Datos de México verbatim sobre megadiversidad marina (Mar de Cortés, Cousteau).
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
