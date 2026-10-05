"use client";

/**
 * Laboratorio 3D — "Óptica geométrica: lentes, espejos y formación de imágenes".
 * Práctica experimental para CNEYT-V-P06-A2 (simulación "Simulación de óptica:
 * lentes, espejos y formación de imágenes"; progresión 6 "Óptica geométrica:
 * reflexión, refracción y la ley de Snell", UAC CNEYT-V "La energía en procesos
 * de vida diaria").
 *
 * Experimento central: el alumno desliza el objeto frente a la lente (o el
 * espejo) y VE que la imagen cambia de real/invertida a virtual/derecha justo
 * al cruzar el foco; en refracción, que el rayo deja de salir al cruzar el
 * ángulo crítico. Un medidor en la escena marca la zona en que está.
 *
 * Tres modos:
 *  (a) Lentes      — lente convergente o divergente: coloca el objeto a la
 *      distancia dₒ, traza los rayos principales y forma la imagen. Verifica
 *      1/f = 1/dₒ + 1/dᵢ y el aumento M = −dᵢ/dₒ.
 *  (b) Espejos     — espejo plano, cóncavo o convexo: la imagen real se forma del
 *      mismo lado del objeto (reflexión).
 *  (c) Refracción  — ley de Snell n₁·sen θ₁ = n₂·sen θ₂ entre dos medios y la
 *      reflexión total interna al superar el ángulo crítico (fibra óptica).
 * Toda la física es de cálculo cerrado (ecuación de Gauss y ley de Snell).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { OPTICA_FICHA } from "./optica-lentes-espejos-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./optica-lentes-espejos-data";
import { LabSfx } from "./lab-audio";
import {
  type Modo, type TipoLente, type TipoEspejo,
  resolverGauss, resolverSnell, medioPorId, MEDIOS, CASOS_LENTE, CASOS_ESPEJO,
  F_LENTE_MIN, F_LENTE_MAX, F_LENTE_DEF, DO_MIN, DO_MAX, DO_LENTE_DEF,
  DO_ESPEJO_DEF, F_ESPEJO_DEF, H_OBJ,
  THETA_MIN, THETA_MAX, THETA_DEF, MEDIO1_DEF, MEDIO2_DEF,
  PROBLEMA, INSTRUCCIONES, PREGUNTAS, IDEAS, DATOS, EJEMPLO, GLOSARIO,
  fmt2, fmtAng, fmtDist, fmtAumento,
} from "./optica-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-optica-lentes-espejos-reto";

const OpticaScene = dynamic(() => import("./OpticaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-glasses fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Montando el banco óptico…</span>
    </div>
  ),
});

const C_LEN = "#a78bfa";
const C_LEN_DIV = "#f472b6";
const C_ESP = "#5eead4";
const C_REF = "#38bdf8";
const C_CRIT = "#fde047";

const MODOS: { id: Modo; etq: string; icono: string; col: string }[] = [
  { id: "lentes", etq: "Lentes", icono: "fa-glasses", col: C_LEN },
  { id: "espejos", etq: "Espejos", icono: "fa-mirror", col: C_ESP },
  { id: "refraccion", etq: "Refracción", icono: "fa-water", col: C_REF },
];

const TIPOS_ESPEJO: { id: TipoEspejo; etq: string; icono: string }[] = [
  { id: "plano", etq: "Plano", icono: "fa-grip-lines-vertical" },
  { id: "concavo", etq: "Cóncavo", icono: "fa-circle-half-stroke" },
  { id: "convexo", etq: "Convexo", icono: "fa-circle-dot" },
];

type Marcas = { gauss: boolean; dentro: boolean; diverg: boolean; esp: boolean; ref: boolean; tir: boolean };
const MARCAS_0: Marcas = { gauss: false, dentro: false, diverg: false, esp: false, ref: false, tir: false };

export function LabOptica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("lentes");
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  // Misiones «enganchadas»: una vez cumplidas no se des-cumplen al cambiar de modo.
  const [marcas, setMarcas] = useState<Marcas>(MARCAS_0);
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
  // (a) lentes
  const [tipoLente, setTipoLente] = useState<TipoLente>("convergente");
  const [fLente, setFLente] = useState<number>(F_LENTE_DEF);
  const [doLente, setDoLente] = useState<number>(DO_LENTE_DEF);
  // (b) espejos
  const [tipoEspejo, setTipoEspejo] = useState<TipoEspejo>("concavo");
  const [fEspejo, setFEspejo] = useState<number>(F_ESPEJO_DEF);
  const [doEspejo, setDoEspejo] = useState<number>(DO_ESPEJO_DEF);
  // (c) refracción
  const [medio1, setMedio1] = useState<string>(MEDIO1_DEF);
  const [medio2, setMedio2] = useState<string>(MEDIO2_DEF);
  const [thetaInc, setThetaInc] = useState<number>(THETA_DEF);

  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  const bump = () => setResetNonce((n) => n + 1);
  const resetModo = () => {
    if (modo === "lentes") { setTipoLente("convergente"); setFLente(F_LENTE_DEF); setDoLente(DO_LENTE_DEF); }
    else if (modo === "espejos") { setTipoEspejo("concavo"); setFEspejo(F_ESPEJO_DEF); setDoEspejo(DO_ESPEJO_DEF); }
    else { setMedio1(MEDIO1_DEF); setMedio2(MEDIO2_DEF); setThetaInc(THETA_DEF); }
    bump();
  };
  const cambiarModo = (m: Modo) => { setModo(m); if (sonido) audioRef.current?.blip(); bump(); };

  // valores en vivo
  const fLentSign = tipoLente === "convergente" ? Math.abs(fLente) : -Math.abs(fLente);
  const rLente = resolverGauss(fLentSign, doLente, H_OBJ);
  const fEspSign = tipoEspejo === "plano" ? Infinity : tipoEspejo === "concavo" ? Math.abs(fEspejo) : -Math.abs(fEspejo);
  const rEspejo = resolverGauss(fEspSign, doEspejo, H_OBJ);
  const m1 = medioPorId(medio1);
  const m2 = medioPorId(medio2);
  const snell = resolverSnell(m1.n, m2.n, thetaInc);

  const modoCol = modo === "lentes" ? (tipoLente === "convergente" ? C_LEN : C_LEN_DIV) : modo === "espejos" ? C_ESP : C_REF;

  // Ajuste durante el render (patrón de React): engancha cada misión al cumplirse.
  const ahora: Marcas = {
    gauss: modo === "lentes" && doLente !== DO_LENTE_DEF,
    dentro: modo === "lentes" && tipoLente === "convergente" && doLente < Math.abs(fLente),
    diverg: tipoLente !== "convergente",
    esp: modo === "espejos",
    ref: modo === "refraccion",
    tir: snell.reflexionTotal === true,
  };
  if ((Object.keys(ahora) as (keyof Marcas)[]).some((k) => ahora[k] && !marcas[k])) {
    setMarcas({
      gauss: marcas.gauss || ahora.gauss, dentro: marcas.dentro || ahora.dentro, diverg: marcas.diverg || ahora.diverg,
      esp: marcas.esp || ahora.esp, ref: marcas.ref || ahora.ref, tir: marcas.tir || ahora.tir,
    });
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-glasses" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>1/f = 1/dₒ + 1/dᵢ</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los números siguen aquí.
        {modo === "lentes" && ` Lente ${tipoLente}: dᵢ = ${fmtDist(rLente.di)}, M = ${fmtAumento(rLente.M)} → imagen ${rLente.tipoImagen}, ${rLente.orientacion}, ${rLente.tamano}.`}
        {modo === "espejos" && ` Espejo ${tipoEspejo}: dᵢ = ${fmtDist(rEspejo.di)}, M = ${fmtAumento(rEspejo.M)} → imagen ${rEspejo.tipoImagen}, ${rEspejo.orientacion}, ${rEspejo.tamano}.`}
        {modo === "refraccion" && ` ${m1.nombre} → ${m2.nombre} a θ₁ = ${fmtAng(thetaInc)}: ${snell.reflexionTotal ? "reflexión total interna" : `θ₂ = ${fmtAng(snell.thetaRefDeg)}`}.`}
      </div>
    </div>
  );

  // Lo corto va sobre la escena (≤ 10 palabras).
  const lectura =
    modo === "lentes" ? <>Imagen {rLente.tipoImagen}, {rLente.orientacion}, {rLente.tamano}</>
    : modo === "espejos" ? <>Imagen {rEspejo.tipoImagen}, {rEspejo.orientacion}, {rEspejo.tamano}</>
    : snell.reflexionTotal ? <>Reflexión total interna: no sale rayo</> : <>θ₁ = {fmtAng(thetaInc)} → θ₂ = {fmtAng(snell.thetaRefDeg)}</>;

  const rImg = modo === "lentes" ? rLente : rEspejo;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <OpticaScene
            modo={modo}
            tipoLente={tipoLente} fLente={fLente} doLente={doLente}
            tipoEspejo={tipoEspejo} fEspejo={fEspejo} doEspejo={doEspejo}
            medio1={medio1} medio2={medio2} thetaInc={thetaInc}
            playing={playing} accent={accent} resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.etq, icono: m.icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reproducir"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar a los valores de inicio" onClick={resetModo} />
        </>
      }
      leyenda={
        modo === "refraccion"
          ? <MedidorAngulo theta={thetaInc} critico={snell.thetaCriticoDeg} total={snell.reflexionTotal === true} />
          : modo === "lentes"
            ? <MedidorObjeto d={doLente} f={Math.abs(fLente)} concentra={tipoLente === "convergente"} col={modoCol} r={rLente.tipoImagen} />
            : <MedidorObjeto d={doEspejo} f={Math.abs(fEspejo)} concentra={tipoEspejo === "concavo"} col={modoCol} r={rEspejo.tipoImagen} plano={tipoEspejo === "plano"} />
      }
      lectura={lectura}
      objetivos={[
        { txt: "Pon el objeto dentro del foco de la lente convergente: la imagen se vuelve virtual, derecha y mayor", done: marcas.dentro },
        { txt: "Verifica la ecuación de Gauss moviendo el objeto ante la lente", done: marcas.gauss },
        { txt: "Prueba la lente divergente y compara con la convergente", done: marcas.diverg },
        { txt: "Explora los espejos: plano, cóncavo y convexo", done: marcas.esp },
        { txt: "Pasa al modo refracción y dobla el rayo con la ley de Snell", done: marcas.ref },
        { txt: "Supera el ángulo crítico y observa la reflexión total interna", done: marcas.tir },
        { txt: "Resuelve el reto evaluable de la actividad", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              {modo === "lentes" && (
                <Bloque titulo="Lente y posición del objeto" icono="fa-sliders">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                    {(["convergente", "divergente"] as TipoLente[]).map((tp) => {
                      const on = tipoLente === tp;
                      const c = tp === "convergente" ? C_LEN : C_LEN_DIV;
                      return (
                        <button key={tp} type="button" onClick={() => setTipoLente(tp)}
                          style={{ cursor: "pointer", padding: "10px 6px", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 900,
                            border: `1px solid ${on ? c : "rgba(255,255,255,0.14)"}`, background: on ? `${c}22` : "transparent" }}>
                          {tp === "convergente" ? "Convergente (f > 0)" : "Divergente (f < 0)"}
                        </button>
                      );
                    })}
                  </div>
                  <Deslizador label="distancia focal |f|" icon="fa-bullseye" colr={modoCol} valor={fmtDist(Math.abs(fLente))} min={F_LENTE_MIN} max={F_LENTE_MAX} step={0.1} value={fLente} onChange={setFLente} hintL="foco corto" hintR="foco largo" />
                  <Deslizador label="distancia objeto dₒ" icon="fa-arrows-left-right" colr={modoCol} valor={fmtDist(doLente)} min={DO_MIN} max={DO_MAX} step={0.1} value={doLente} onChange={setDoLente} hintL="cerca de la lente" hintR="lejos de la lente" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: 6 }}>
                    {CASOS_LENTE.map((cs) => {
                      const on = cs.tipo === tipoLente && Math.abs(cs.f - fLente) < 0.05 && Math.abs(cs.do_ - doLente) < 0.05;
                      const c = cs.tipo === "convergente" ? C_LEN : C_LEN_DIV;
                      return (
                        <button key={cs.id} type="button" onClick={() => { setTipoLente(cs.tipo); setFLente(cs.f); setDoLente(cs.do_); }}
                          style={{ cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 800, color: on ? "#04121f" : c, background: on ? c : `${c}1f`, border: `1px solid ${c}55`, borderRadius: 8, padding: "8px 10px", lineHeight: 1.3 }}>
                          {cs.etq}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${modoCol}44`, background: `${modoCol}14` }}>
                    1/f = 1/dₒ + 1/dᵢ → dᵢ = <strong style={{ color: modoCol }}>{fmtDist(rLente.di)}</strong>, M = −dᵢ/dₒ = <strong>{fmtAumento(rLente.M)}</strong>. Imagen <strong>{rLente.tipoImagen}</strong>, <strong>{rLente.orientacion}</strong> y <strong>{rLente.tamano}</strong>.
                  </p>
                </Bloque>
              )}

              {modo === "espejos" && (
                <Bloque titulo="Espejo y posición del objeto" icono="fa-sliders">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
                    {TIPOS_ESPEJO.map((tp) => {
                      const on = tipoEspejo === tp.id;
                      return (
                        <button key={tp.id} type="button" onClick={() => setTipoEspejo(tp.id)}
                          style={{ cursor: "pointer", padding: "10px 4px", borderRadius: 12, color: "#fff", textAlign: "center",
                            border: `1px solid ${on ? C_ESP : "rgba(255,255,255,0.14)"}`, background: on ? `${C_ESP}22` : "transparent" }}>
                          <div style={{ fontSize: 16, color: on ? C_ESP : "inherit" }}><i className={`fa-solid ${tp.icono}`} /></div>
                          <div style={{ fontSize: 14, fontWeight: 900 }}>{tp.etq}</div>
                        </button>
                      );
                    })}
                  </div>
                  {tipoEspejo !== "plano" && (
                    <Deslizador label="distancia focal |f|" icon="fa-bullseye" colr={C_ESP} valor={fmtDist(Math.abs(fEspejo))} min={F_LENTE_MIN} max={F_LENTE_MAX} step={0.1} value={fEspejo} onChange={setFEspejo} hintL="muy curvo" hintR="casi plano" />
                  )}
                  <Deslizador label="distancia objeto dₒ" icon="fa-arrows-left-right" colr={C_ESP} valor={fmtDist(doEspejo)} min={DO_MIN} max={DO_MAX} step={0.1} value={doEspejo} onChange={setDoEspejo} hintL="cerca del espejo" hintR="lejos del espejo" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: 6 }}>
                    {CASOS_ESPEJO.map((cs) => {
                      const on = cs.tipo === tipoEspejo && Math.abs(cs.do_ - doEspejo) < 0.05 && (cs.tipo === "plano" || Math.abs(cs.f - fEspejo) < 0.05);
                      return (
                        <button key={cs.id} type="button" onClick={() => { setTipoEspejo(cs.tipo); if (cs.tipo !== "plano") setFEspejo(cs.f); setDoEspejo(cs.do_); }}
                          style={{ cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 800, color: on ? "#04121f" : C_ESP, background: on ? C_ESP : `${C_ESP}1f`, border: `1px solid ${C_ESP}55`, borderRadius: 8, padding: "8px 10px", lineHeight: 1.3 }}>
                          {cs.etq}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${C_ESP}44`, background: `${C_ESP}14` }}>
                    Espejo <strong>{tipoEspejo}</strong>: dᵢ = <strong style={{ color: C_ESP }}>{fmtDist(rEspejo.di)}</strong>, M = <strong>{fmtAumento(rEspejo.M)}</strong>. Imagen <strong>{rEspejo.tipoImagen}</strong>, <strong>{rEspejo.orientacion}</strong> y <strong>{rEspejo.tamano}</strong>.
                  </p>
                </Bloque>
              )}

              {modo === "refraccion" && (
                <Bloque titulo="Medios y ángulo de incidencia" icono="fa-sliders">
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Medio 1 (incidencia)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 80px), 1fr))", gap: 6 }}>
                    {MEDIOS.map((md) => {
                      const on = md.id === medio1;
                      return (
                        <button key={`a${md.id}`} type="button" onClick={() => setMedio1(md.id)}
                          style={{ cursor: "pointer", fontSize: 14, fontWeight: 800, color: on ? "#04121f" : md.color, background: on ? md.color : `${md.color}1f`, border: `1px solid ${md.color}66`, borderRadius: 8, padding: "8px 4px", lineHeight: 1.2 }}>
                          {md.nombre}<br /><span style={{ fontSize: 13, opacity: 0.85 }}>n = {fmt2(md.n)}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Medio 2</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 80px), 1fr))", gap: 6 }}>
                    {MEDIOS.map((md) => {
                      const on = md.id === medio2;
                      return (
                        <button key={`b${md.id}`} type="button" onClick={() => setMedio2(md.id)}
                          style={{ cursor: "pointer", fontSize: 14, fontWeight: 800, color: on ? "#04121f" : md.color, background: on ? md.color : `${md.color}1f`, border: `1px dashed ${md.color}66`, borderRadius: 8, padding: "8px 4px", lineHeight: 1.2 }}>
                          {md.nombre}<br /><span style={{ fontSize: 13, opacity: 0.85 }}>n = {fmt2(md.n)}</span>
                        </button>
                      );
                    })}
                  </div>
                  <Deslizador label="ángulo de incidencia θ₁" icon="fa-angle-up" colr={C_REF} valor={fmtAng(thetaInc)} min={THETA_MIN} max={THETA_MAX} step={1} value={thetaInc} onChange={setThetaInc} hintL="0° (normal)" hintR="89° (rasante)" />
                  {snell.thetaCriticoDeg != null && (
                    <button type="button" onClick={() => setThetaInc(Math.min(THETA_MAX, Math.ceil(snell.thetaCriticoDeg! + 2)))}
                      style={{ cursor: "pointer", width: "100%", fontSize: 14, fontWeight: 800, color: "#fde047", background: "rgba(251,191,36,0.12)", border: "1px solid #fbbf2466", borderRadius: 9, padding: "10px" }}>
                      <i className="fa-solid fa-rotate-left" style={{ marginRight: 7 }} />
                      Superar el ángulo crítico θ_c = {fmtAng(snell.thetaCriticoDeg)}
                    </button>
                  )}
                  <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${snell.reflexionTotal ? "#fbbf24" : C_REF}44`, background: `${snell.reflexionTotal ? "#fbbf24" : C_REF}14` }}>
                    {snell.reflexionTotal
                      ? <>n₁ = {fmt2(m1.n)} &gt; n₂ = {fmt2(m2.n)} y θ₁ = {fmtAng(thetaInc)} supera θ_c = {snell.thetaCriticoDeg != null ? fmtAng(snell.thetaCriticoDeg) : "—"}: <strong style={{ color: "#fde047" }}>reflexión total interna</strong>. La luz no escapa (fibra óptica).</>
                      : <>{fmt2(m1.n)}·sen {fmtAng(thetaInc)} = {fmt2(m2.n)}·sen θ₂ → θ₂ = <strong style={{ color: C_REF }}>{fmtAng(snell.thetaRefDeg)}</strong>. El rayo se {snell.seAcerca ? "acerca" : "aleja"} de la normal.</>}
                  </p>
                </Bloque>
              )}

              <Bloque titulo="Lecturas" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {modo !== "refraccion" && (
                    <>
                      <Dato label="dist. focal f" value={fmtDist(modo === "lentes" ? fLentSign : fEspSign)} col={modoCol} />
                      <Dato label="dist. objeto dₒ" value={fmtDist(modo === "lentes" ? doLente : doEspejo)} />
                      <Dato label="dist. imagen dᵢ" value={fmtDist(rImg.di)} col={modoCol} />
                      <Dato label="aumento M" value={fmtAumento(rImg.M)} col={rImg.orientacion === "invertida" ? "#fca5a5" : "#86efac"} />
                    </>
                  )}
                  {modo === "refraccion" && (
                    <>
                      <Dato label="índice n₁" value={fmt2(m1.n)} col={m1.color} />
                      <Dato label="índice n₂" value={fmt2(m2.n)} col={m2.color} />
                      <Dato label="ángulo θ₂" value={snell.reflexionTotal ? "—" : fmtAng(snell.thetaRefDeg)} col={snell.reflexionTotal ? "#fca5a5" : C_REF} />
                      <Dato label="ángulo crítico" value={snell.thetaCriticoDeg != null ? fmtAng(snell.thetaCriticoDeg) : "—"} col={C_CRIT} />
                    </>
                  )}
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
              <Bloque titulo="El banco óptico" icono="fa-glasses">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Ejemplo resuelto" icono="fa-square-check">
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO.enunciado}</p>
                <div style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${C_REF}44` }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>θ₂ ≈ {fmtAng(EJEMPLO.thetaRef)}</div>
                  <div style={{ color: T.text2 }}>{EJEMPLO.solucion}</div>
                </div>
              </Bloque>
              <Bloque titulo="Pasos para explorar" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                  {INSTRUCCIONES.map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo="Para reflexionar" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
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
                <div style={{ display: "grid", gap: 8 }}>
                  {GLOSARIO.map((g, i) => (
                    <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                      <span style={{ fontWeight: 900, color: accent }}>{g.termino}. </span>
                      <span style={{ color: T.text2 }}>{g.definicion}</span>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={OPTICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Física exacta de cálculo cerrado: ecuación de las lentes y espejos delgados 1/f = 1/dₒ + 1/dᵢ (óptica paraxial de Gauss), aumento M = −dᵢ/dₒ y ley de Snell n₁·sen θ₁ = n₂·sen θ₂, con el ángulo crítico θ_c = arcsen(n₂/n₁). Los valores de los paneles son exactos. El trazado de rayos en pantalla es esquemático (construcción paraxial con dos rayos principales): las distancias usan una escala visual y los símbolos de lente/espejo son convencionales. Las instrucciones y las preguntas de reflexión son verbatim de la simulación A2; el ejemplo es la pregunta de comprensión 2 de la lectura A1; las ideas clave y el glosario se basan en la lectura A1.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor de posición del objeto: ¿dentro del foco, entre f y 2f, o más allá? ─ */
function MedidorObjeto({ d, f, concentra, col, r, plano = false }: { d: number; f: number; concentra: boolean; col: string; r: "real" | "virtual"; plano?: boolean }) {
  const pos = (v: number) => `${Math.max(0, Math.min(100, (v / DO_MAX) * 100))}%`;
  const zona = plano ? "Espejo plano: siempre virtual"
    : !concentra ? "Siempre imagen virtual"
    : d < f ? "Dentro del foco: virtual" : d < 2 * f ? "Entre f y 2f: real, mayor" : "Más allá de 2f: real, menor";
  return (
    <div style={{ width: 176, display: "grid", gap: 6 }}>
      <div style={{ fontWeight: 800, color: "#dce6f5" }}>objeto dₒ = {fmtDist(d)}</div>
      <div style={{ position: "relative", height: 12, borderRadius: 6, background: "rgba(255,255,255,0.12)" }}>
        {concentra && !plano && (
          <>
            <span style={{ position: "absolute", left: pos(f), top: -2, width: 3, height: 16, background: "#fbbf24" }} />
            <span style={{ position: "absolute", left: pos(2 * f), top: -2, width: 3, height: 16, background: "#fbbf24", opacity: 0.6 }} />
          </>
        )}
        <span style={{ position: "absolute", left: `calc(${pos(d)} - 6px)`, top: -2, width: 12, height: 16, borderRadius: 4, background: col, border: "2px solid #fff", boxSizing: "border-box", transition: "left 120ms linear" }} />
      </div>
      {concentra && !plano && <div style={{ display: "flex", justifyContent: "space-between", color: "#fbbf24", fontWeight: 800 }}><span>f</span><span>2f</span></div>}
      <div style={{ fontWeight: 900, color: r === "virtual" ? "#fca5a5" : "#fde047" }}>{zona}</div>
    </div>
  );
}

/* ── Medidor del ángulo de incidencia frente al ángulo crítico ───────────────── */
function MedidorAngulo({ theta, critico, total }: { theta: number; critico: number | null | undefined; total: boolean }) {
  const pos = (v: number) => `${Math.max(0, Math.min(100, (v / THETA_MAX) * 100))}%`;
  return (
    <div style={{ width: 176, display: "grid", gap: 6 }}>
      <div style={{ fontWeight: 800, color: "#dce6f5" }}>θ₁ = {fmtAng(theta)}</div>
      <div style={{ position: "relative", height: 12, borderRadius: 6, overflow: "hidden",
        background: critico != null
          ? `linear-gradient(90deg, rgba(56,189,248,0.35) 0%, rgba(56,189,248,0.35) ${pos(critico)}, rgba(251,191,36,0.5) ${pos(critico)}, rgba(251,191,36,0.5) 100%)`
          : "rgba(56,189,248,0.35)" }}>
        <span style={{ position: "absolute", left: `calc(${pos(theta)} - 5px)`, top: 0, width: 10, height: "100%", borderRadius: 5, background: total ? "#fde047" : C_REF, border: "2px solid #fff", boxSizing: "border-box", transition: "left 120ms linear" }} />
      </div>
      <div style={{ fontWeight: 900, color: total ? "#fde047" : "#7dd3fc" }}>
        {critico == null ? "Sin ángulo crítico (n₁ ≤ n₂)" : total ? `Pasó θ_c = ${fmtAng(critico)}: no sale rayo` : `θ_c = ${fmtAng(critico)}: aún sale rayo`}
      </div>
    </div>
  );
}
