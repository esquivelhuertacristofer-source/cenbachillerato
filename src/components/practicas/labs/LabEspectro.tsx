"use client";

/**
 * Laboratorio 3D — "El espectro electromagnético".
 * Práctica experimental para CNEYT-V-P05-A1 (infografía "El espectro
 * electromagnético: de las ondas de radio a los rayos gamma"; progresión 5
 * "Describe el espectro electromagnético y sus aplicaciones tecnológicas y
 * biomédicas", UAC CNEYT-V "La energía en procesos de vida diaria").
 *
 * Experimento central: el alumno sube la frecuencia y VE que la onda se
 * apreta (λ = c/f), que el medidor de energía del fotón (E = h·f) sube y que,
 * al cruzar el umbral, se vuelve ionizante.
 *
 * Tres modos:
 *  (a) Espectro     — recorre la frecuencia (10⁴–10²² Hz) y ve cambiar la
 *      longitud de onda, la energía del fotón y la banda.
 *  (b) Visible      — acerca la franja visible (380–700 nm): color, frecuencia
 *      y energía.
 *  (c) Aplicaciones — ubica aplicaciones reales de México (WiFi, 5G, GTM del
 *      INAOE, rayos X del IMSS, gamma del ININ…) sobre el espectro.
 * Toda la física es de cálculo cerrado (c = λ·f y E = h·f, con c = 3×10⁸ m/s).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { ESPECTRO_FICHA } from "./espectro-electromagnetico-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./espectro-electromagnetico-data";
import { LabSfx } from "./lab-audio";
import {
  type Modo, resolverEM, resolverVisible, aplicacionPorId, APLICACIONES,
  bandaPorFrecuencia, CAT_COLOR, CAT_ETQ,
  LOGF_MIN, LOGF_MAX, LOGF_DEF, NM_MIN, NM_MAX, NM_DEF, APL_DEF, C_LUZ, F_IONIZANTE,
  PROBLEMA, INSTRUCCIONES, PREGUNTAS, IDEAS, DATOS, EJEMPLO, GLOSARIO,
  fmt0, fmtFrec, fmtLambda, fmtEnergia, colorVisible,
} from "./espectro-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-espectro-electromagnetico-reto";

const EspectroScene = dynamic(() => import("./EspectroScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-wave-square fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Desplegando el espectro…</span>
    </div>
  ),
});

const C_ESP = "#a78bfa";

const MODOS: { id: Modo; etq: string; icono: string }[] = [
  { id: "espectro", etq: "Espectro", icono: "fa-bars-staggered" },
  { id: "visible", etq: "Visible", icono: "fa-eye" },
  { id: "aplicaciones", etq: "Aplicaciones", icono: "fa-satellite-dish" },
];

const PRESETS = [
  { etq: "FM 100 MHz", lf: 8 },
  { etq: "WiFi 2.4 GHz", lf: Math.log10(2.4e9) },
  { etq: "Visible", lf: LOGF_DEF },
  { etq: "UV", lf: Math.log10(1e15) },
  { etq: "Rayos X", lf: Math.log10(3e18) },
  { etq: "Gamma", lf: Math.log10(1e20) },
];

type Marcas = { f: boolean; fmwifi: boolean; baja: boolean; ioniz: boolean; vis: boolean; apl: boolean };
const MARCAS_0: Marcas = { f: false, fmwifi: false, baja: false, ioniz: false, vis: false, apl: false };

export function LabEspectro({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("espectro");
  const [logF, setLogF] = useState<number>(LOGF_DEF);  // (a)
  const [nm, setNm] = useState<number>(NM_DEF);        // (b)
  const [aplId, setAplId] = useState<string>(APL_DEF); // (c)
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  // Misiones «enganchadas»: una vez cumplidas no se des-cumplen al cambiar de modo.
  const [marcas, setMarcas] = useState<Marcas>(MARCAS_0);
  // Para la misión nueva: ¿ya pasó por FM y por WiFi?
  const [vistoFM, setVistoFM] = useState(false);
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
    if (modo === "espectro") setLogF(LOGF_DEF);
    else if (modo === "visible") setNm(NM_DEF);
    else setAplId(APL_DEF);
    bump();
  };
  const cambiarModo = (nm2: Modo) => { setModo(nm2); bump(); if (sonido) audioRef.current?.blip(); };

  // valores en vivo
  const f = Math.pow(10, logF);
  const pt = resolverEM(f);
  const cv = resolverVisible(nm);
  const apl = aplicacionPorId(aplId);
  const aplPt = resolverEM(apl.f);
  const aplBanda = bandaPorFrecuencia(apl.f);

  const colVisLive = cv.hex;
  const colEspLive = pt.banda.esVisible ? colorVisible((C_LUZ / f) * 1e9) : pt.banda.color;

  // Ajuste durante el render (patrón de React): engancha cada misión al cumplirse.
  const enFM = Math.abs(logF - 8) < 0.3;
  const enWifi = Math.abs(logF - Math.log10(2.4e9)) < 0.3;
  if (!vistoFM && enFM) setVistoFM(true);
  const ahora: Marcas = {
    f: logF !== LOGF_DEF,
    fmwifi: (vistoFM || enFM) && enWifi,
    baja: pt.banda.id === "radio" || pt.banda.id === "micro",
    ioniz: pt.ionizante,
    vis: modo === "visible",
    apl: modo === "aplicaciones",
  };
  if ((Object.keys(ahora) as (keyof Marcas)[]).some((k) => ahora[k] && !marcas[k])) {
    setMarcas({
      f: marcas.f || ahora.f, fmwifi: marcas.fmwifi || ahora.fmwifi, baja: marcas.baja || ahora.baja,
      ioniz: marcas.ioniz || ahora.ioniz, vis: marcas.vis || ahora.vis, apl: marcas.apl || ahora.apl,
    });
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-wave-square" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>c = λ · f</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los números siguen aquí.
        {modo === "espectro" && ` ${pt.banda.nombre}: f = ${fmtFrec(f)}, λ = ${fmtLambda(pt.lambda)}, E = ${fmtEnergia(pt.E_eV)}.`}
        {modo === "visible" && ` Luz ${cv.nombre}: ${fmt0(nm)} nm → f = ${fmtFrec(cv.f)}, E = ${fmtEnergia(cv.E_eV)}.`}
        {modo === "aplicaciones" && ` ${apl.nombre} (${aplBanda.nombre}): f = ${fmtFrec(apl.f)}, λ = ${fmtLambda(aplPt.lambda)}.`}
      </div>
    </div>
  );

  // Lo corto va sobre la escena (≤ 10 palabras).
  const lectura =
    modo === "espectro" ? <>{pt.banda.nombre}: λ = {fmtLambda(pt.lambda)} · {pt.ionizante ? "ionizante" : "no ionizante"}</>
    : modo === "visible" ? <>Luz {cv.nombre}: {fmt0(nm)} nm · {fmtEnergia(cv.E_eV)}</>
    : <>{apl.nombre}: {aplBanda.nombre} · {aplPt.ionizante ? "ionizante" : "no ionizante"}</>;

  // Energía que mide el medidor de la esquina (la del modo activo).
  const eMedidor = modo === "espectro" ? pt.E_eV : modo === "visible" ? cv.E_eV : aplPt.E_eV;
  const colMedidor = modo === "espectro" ? colEspLive : modo === "visible" ? colVisLive : CAT_COLOR[apl.categoria];

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <EspectroScene modo={modo} logF={logF} nm={nm} aplId={aplId} playing={playing} accent={accent} resetNonce={resetNonce} />
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
      leyenda={<MedidorEnergia eV={eMedidor} col={colMedidor} />}
      lectura={lectura}
      objetivos={[
        { txt: "Pon la frecuencia en FM (100 MHz) y luego en WiFi (2.4 GHz): λ pasa de metros a centímetros", done: marcas.fmwifi },
        { txt: "Recorre el espectro moviendo la frecuencia (c = λ·f)", done: marcas.f },
        { txt: "Llega a las ondas de radio o microondas, en el extremo de baja frecuencia", done: marcas.baja },
        { txt: "Cruza el umbral: alcanza radiación ionizante (rayos X o gamma)", done: marcas.ioniz },
        { txt: "Explora la franja visible (380–700 nm) y sus colores", done: marcas.vis },
        { txt: "Ubica aplicaciones reales de México en el espectro", done: marcas.apl },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              {modo === "espectro" && (
                <Bloque titulo="Frecuencia (escala logarítmica)" icono="fa-sliders">
                  <Deslizador label="frecuencia f" icon="fa-gauge-high" colr={colEspLive} valor={fmtFrec(f)} min={LOGF_MIN} max={LOGF_MAX} step={0.01} value={logF} onChange={setLogF} hintL="10⁴ Hz (radio)" hintR="10²² Hz (gamma)" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 120px), 1fr))", gap: 6 }}>
                    {PRESETS.map((p) => {
                      const on = Math.abs(logF - p.lf) < 0.05;
                      return (
                        <button key={p.etq} type="button" onClick={() => setLogF(p.lf)}
                          style={{ cursor: "pointer", fontSize: 14, fontWeight: 800, color: on ? "#04121f" : C_ESP, background: on ? C_ESP : `${C_ESP}1f`, border: `1px solid ${C_ESP}55`, borderRadius: 8, padding: "8px 4px" }}>
                          {p.etq}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${colEspLive}44`, background: `${colEspLive}14` }}>
                    En <strong>{pt.banda.nombre}</strong>: con f = <strong>{fmtFrec(f)}</strong> → λ = c/f = <strong style={{ color: colEspLive }}>{fmtLambda(pt.lambda)}</strong> y E = h·f = <strong>{fmtEnergia(pt.E_eV)}</strong>. {pt.ionizante ? "Es radiación ionizante (puede dañar el ADN)." : "No es ionizante."}
                  </p>
                </Bloque>
              )}

              {modo === "visible" && (
                <Bloque titulo="Longitud de onda de la luz" icono="fa-sliders">
                  <Deslizador label="longitud de onda λ" icon="fa-ruler-horizontal" colr={colVisLive} valor={`${fmt0(nm)} nm`} min={NM_MIN} max={NM_MAX} step={1} value={nm} onChange={setNm} hintL="380 nm (violeta)" hintR="700 nm (rojo)" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 5 }}>
                    {[410, 470, 490, 540, 580, 610, 670].map((v) => (
                      <button key={v} type="button" onClick={() => setNm(v)} title={`${v} nm`} aria-label={`${v} nm`}
                        style={{ cursor: "pointer", height: 36, borderRadius: 8, border: Math.abs(nm - v) < 6 ? "2px solid #fff" : "1px solid rgba(255,255,255,0.2)", background: colorVisible(v) }} />
                    ))}
                  </div>
                  <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${colVisLive}66`, background: `${colVisLive}18` }}>
                    <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: colVisLive, marginRight: 8, verticalAlign: "middle" }} />
                    Luz <strong>{cv.nombre}</strong> de <strong>{fmt0(nm)} nm</strong>: f = c/λ = <strong>{fmtFrec(cv.f)}</strong>, E = h·f = <strong>{fmtEnergia(cv.E_eV)}</strong>. El violeta tiene más energía que el rojo.
                  </p>
                </Bloque>
              )}

              {modo === "aplicaciones" && (
                <Bloque titulo="Aplicación sobre el espectro" icono="fa-sliders">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                    {APLICACIONES.map((a) => {
                      const on = a.id === aplId;
                      const c = CAT_COLOR[a.categoria];
                      return (
                        <button key={a.id} type="button" onClick={() => setAplId(a.id)}
                          style={{ cursor: "pointer", textAlign: "left", display: "flex", gap: 10, alignItems: "center", padding: "9px 11px", borderRadius: 12, color: "#fff",
                            border: `1px solid ${on ? c : "rgba(255,255,255,0.14)"}`, background: on ? `${c}22` : "transparent" }}>
                          <i className={`fa-solid ${a.icono}`} style={{ fontSize: 16, color: on ? c : "inherit", width: 20, textAlign: "center" }} />
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: "block", fontSize: 14, fontWeight: 900 }}>{a.nombre}</span>
                            <span style={{ display: "block", fontSize: 13, color: T.text3 }}>{CAT_ETQ[a.categoria]} · {fmtFrec(a.f)}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${CAT_COLOR[apl.categoria]}44`, background: `${CAT_COLOR[apl.categoria]}14` }}>
                    <i className={`fa-solid ${apl.icono}`} style={{ color: CAT_COLOR[apl.categoria], marginRight: 8 }} />
                    <strong>{apl.nombre}</strong> ({aplBanda.nombre}, f = {fmtFrec(apl.f)}): {apl.detalle}
                  </p>
                </Bloque>
              )}

              <Bloque titulo="Lecturas" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {modo === "espectro" && (
                    <>
                      <Dato label="frecuencia f" value={fmtFrec(f)} col={colEspLive} />
                      <Dato label="long. onda λ" value={fmtLambda(pt.lambda)} col={colEspLive} />
                      <Dato label="energía E" value={fmtEnergia(pt.E_eV)} />
                      <Dato label="radiación" value={pt.ionizante ? "ionizante" : "no ioniz."} col={pt.ionizante ? "#f87171" : "#34D399"} />
                    </>
                  )}
                  {modo === "visible" && (
                    <>
                      <Dato label="long. onda λ" value={`${fmt0(nm)} nm`} col={colVisLive} />
                      <Dato label="color" value={cv.nombre} col={colVisLive} />
                      <Dato label="frecuencia f" value={fmtFrec(cv.f)} />
                      <Dato label="energía E" value={fmtEnergia(cv.E_eV)} />
                    </>
                  )}
                  {modo === "aplicaciones" && (
                    <>
                      <Dato label="aplicación" value={apl.nombre} col={CAT_COLOR[apl.categoria]} />
                      <Dato label="banda" value={aplBanda.nombre} col={CAT_COLOR[apl.categoria]} />
                      <Dato label="frecuencia f" value={fmtFrec(apl.f)} />
                      <Dato label="long. onda λ" value={fmtLambda(aplPt.lambda)} />
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
              <Bloque titulo="El explorador" icono="fa-wave-square">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Ejemplo resuelto" icono="fa-square-check">
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO.enunciado}</p>
                <div style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${C_ESP}44` }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>λ = {fmt0(EJEMPLO.lambda)} m</div>
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
                <FichaTeorica data={ESPECTRO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Física exacta de cálculo cerrado: c = λ·f y E = h·f, con c = 3×10⁸ m/s (≈299 792 km/s) y h = 6.626×10⁻³⁴ J·s. Los valores de frecuencia, longitud de onda y energía son exactos. La onda y la barra son esquemáticas: la longitud de onda visual está comprimida (escala logarítmica de frecuencia) para que las 18 décadas del espectro quepan en una sola imagen, y los colores de las bandas invisibles son convencionales. La luz visible (380–700 nm) es apenas una franja diminuta de todo el espectro. Las ideas clave, el glosario y las preguntas son verbatim de la infografía A1.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor de la energía del fotón (log) con el umbral ionizante marcado ─── */
const EV_MIN = Math.log10(4e-11);   // 10⁴ Hz
const EV_MAX = Math.log10(4.2e7);   // 10²² Hz
function MedidorEnergia({ eV, col }: { eV: number; col: string }) {
  const lg = Math.log10(Math.max(eV, 1e-12));
  const pos = Math.max(0, Math.min(100, ((lg - EV_MIN) / (EV_MAX - EV_MIN)) * 100));
  const eUmbral = resolverEM(F_IONIZANTE).E_eV;
  const posU = ((Math.log10(eUmbral) - EV_MIN) / (EV_MAX - EV_MIN)) * 100;
  const ioniza = eV >= eUmbral;
  return (
    <div style={{ width: 176, display: "grid", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#dce6f5" }}>
        <span>energía E = h·f</span>
      </div>
      <div style={{ position: "relative", height: 12, borderRadius: 6, overflow: "hidden", background: `linear-gradient(90deg, rgba(52,211,153,0.35) 0%, rgba(52,211,153,0.35) ${posU}%, rgba(248,113,113,0.5) ${posU}%, rgba(248,113,113,0.5) 100%)` }}>
        <div style={{ position: "absolute", left: `calc(${pos}% - 5px)`, top: 0, width: 10, height: "100%", borderRadius: 5, background: col, border: "2px solid #fff", boxSizing: "border-box", transition: "left 120ms linear" }} />
      </div>
      <div style={{ fontWeight: 900, color: ioniza ? "#fca5a5" : "#86efac" }}>
        {ioniza ? "Pasó el umbral: IONIZANTE" : "Bajo el umbral: no ionizante"}
      </div>
    </div>
  );
}
