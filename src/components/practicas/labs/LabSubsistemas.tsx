"use client";

/**
 * Laboratorio 3D — Interacciones entre los subsistemas terrestres.
 * Práctica experimental para CNEYT-III-P05-A2 (simulación; progresión 5).
 *
 * El alumno mueve las variables de la actividad —CO₂ atmosférico, cobertura
 * vegetal, actividad volcánica y la retroalimentación del permafrost— sobre una
 * Tierra 3D con sus cuatro subsistemas (atmósfera, hidrosfera, litosfera,
 * biosfera) y observa en vivo cómo el cambio en uno altera a todos:
 * temperatura media, nivel del mar, pH del océano, metano y ciclo del agua.
 * EXPERIMENTO CENTRAL: un termómetro 3D junto a la Tierra sube y cambia de azul
 * a rojo al mover el CO₂; una marca blanca señala el límite de +1,5 °C.
 * Incluye los escenarios guiados de la simulación (referencia 1850, hoy,
 * deforestación, erupción mayor, permafrost y restauración).
 * Ecosistemas, interacciones y energía — subsistemas terrestres (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { SUBSISTEMAS_FICHA } from "./subsistemas-terrestres-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./subsistemas-terrestres-data";
import { LabSfx } from "./lab-audio";
import {
  SUBSISTEMAS, ESCENARIOS, INTERACCIONES, calcularEstado,
  CO2_MIN, CO2_MAX, CO2_STEP, CO2_DEFAULT, CO2_REF, CO2_HOY,
  VEG_MIN, VEG_MAX, VEG_STEP, VEG_DEFAULT,
  VOLC_MIN, VOLC_MAX, VOLC_STEP, VOLC_DEFAULT,
  fmt1, fmt2, fmt0, fmtDelta,
} from "./subsistemas-data";

const SubsistemasScene = dynamic(() => import("./SubsistemasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-earth-americas fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el sistema Tierra…</span>
    </div>
  ),
});

const AZUL = "#7cc4ff";
const AGUA = "#3aa0ff";
const VERDE = "#34D399";
const NARANJA = "#f59e0b";
const ROJO = "#ef4444";
const MORADO = "#c084fc";

const RETO_KEY = "cen-subsistemas-terrestres-reto";

const botonCss = (on: boolean, col: string): React.CSSProperties => ({
  cursor: "pointer", padding: "11px 14px", borderRadius: 12, border: `1px solid ${on ? col : T.line}`,
  background: on ? `${col}22` : T.inset, color: on ? "#fff" : T.text2, fontSize: 14, fontWeight: 800,
  display: "flex", alignItems: "center", justifyContent: "center", gap: 9, transition: "all .15s", textAlign: "left",
});

export function LabSubsistemas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [co2, setCo2] = useState(CO2_DEFAULT);
  const [veg, setVeg] = useState(VEG_DEFAULT);
  const [volc, setVolc] = useState(VOLC_DEFAULT);
  const [permafrost, setPermafrost] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioCO2, setVioCO2] = useState(false);        // CO₂ ≥ 400 ppm: el termómetro sube
  const [vioCalor, setVioCalor] = useState(false);    // ΔT ≥ +1.5
  const [vioDefor, setVioDefor] = useState(false);    // cobertura ≤ 50
  const [vioVolcan, setVioVolcan] = useState(false);  // volcán activo
  const [vioPNR, setVioPNR] = useState(false);        // punto de no retorno

  // reto evaluable + sonido
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

  const est = useMemo(() => calcularEstado(co2, veg, volc, permafrost), [co2, veg, volc, permafrost]);

  // marca objetivos según el estado actual
  if (co2 >= 400 && !vioCO2) setVioCO2(true);
  if (est.deltaT >= 1.5 && !vioCalor) setVioCalor(true);
  if (veg <= 50 && !vioDefor) setVioDefor(true);
  if (volc > 0 && !vioVolcan) setVioVolcan(true);
  if (est.puntoNoRetorno && !vioPNR) setVioPNR(true);

  const cargar = (nco2: number, nveg: number, nvolc: number, nperm: boolean) => {
    if (sonido) audioRef.current?.blip();
    setCo2(nco2); setVeg(nveg); setVolc(nvolc); setPermafrost(nperm); bump();
  };
  const reset = () => cargar(CO2_DEFAULT, VEG_DEFAULT, VOLC_DEFAULT, false);

  // estado de alerta climática
  const alerta = useMemo(() => {
    if (est.puntoNoRetorno) return { txt: "punto de no retorno", col: MORADO };
    if (est.deltaT >= 2.0) return { txt: "calentamiento severo", col: ROJO };
    if (est.deltaT >= 1.0) return { txt: "calentamiento notable", col: NARANJA };
    if (est.deltaT <= -0.3) return { txt: "enfriamiento (aerosoles)", col: AZUL };
    return { txt: "cercano al equilibrio", col: VERDE };
  }, [est.deltaT, est.puntoNoRetorno]);

  const objetivos = [
    { txt: "Sube el CO₂ a 400 ppm o más y mira subir el termómetro", done: vioCO2 },
    { txt: "Calienta el planeta +1.5 °C", done: vioCalor },
    { txt: "Deforesta hasta ≤ 50%", done: vioDefor },
    { txt: "Activa un volcán", done: vioVolcan },
    { txt: "Dispara el permafrost", done: vioPNR },
    { txt: "Resuelve el reto evaluable de la actividad A3", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-earth-americas" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Todo está conectado</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 410, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la Tierra en 3D, pero la idea sigue: atmósfera, hidrosfera, litosfera y biosfera forman un solo sistema. Mover una variable —como el CO₂— cambia la temperatura, el nivel del mar, el pH del océano y la vida.
      </div>
    </div>
  );

  const lectura = <>{fmtDelta(est.deltaT)} °C · mar {fmtDelta(est.nivelMar, 0)} cm · pH {fmt2(est.ph)}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <SubsistemasScene
            co2={co2} veg={veg} volc={volc} permafrost={permafrost}
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
          <BotonHerramienta icono="fa-rotate-left" titulo="Volver a 1850" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <div style={{ fontWeight: 900, color: alerta.col }}>{alerta.txt}</div>
          <div style={{ color: T.text2 }}>Termómetro: marca blanca = +1,5 °C</div>
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Variables de la simulación" icono="fa-sliders">
                <Deslizador label="CO₂ atmosférico" icon="fa-smog" colr={AZUL}
                  valor={`${fmt0(co2)} ppm`} min={CO2_MIN} max={CO2_MAX} step={CO2_STEP} value={co2}
                  onChange={setCo2} hintL={`${CO2_REF} (1850)`} hintR={`${CO2_MAX}`} />
                <Deslizador label="Cobertura vegetal" icon="fa-tree" colr={VERDE}
                  valor={`${fmt0(veg)} %`} min={VEG_MIN} max={VEG_MAX} step={VEG_STEP} value={veg}
                  onChange={setVeg} hintL={`${VEG_MIN}% (deforestado)`} hintR="100% (intacto)" />
                <Deslizador label="Actividad volcánica" icon="fa-volcano" colr={NARANJA}
                  valor={volc === 0 ? "ninguna" : `${fmt0(volc)} / 10`} min={VOLC_MIN} max={VOLC_MAX} step={VOLC_STEP} value={volc}
                  onChange={setVolc} hintL="0" hintR="10 (erupción mayor)" />
                <button onClick={() => { setPermafrost((p) => !p); bump(); }} style={botonCss(permafrost, MORADO)}>
                  <i className={`fa-solid ${permafrost ? "fa-toggle-on" : "fa-toggle-off"}`} style={{ color: permafrost ? MORADO : T.text3, fontSize: 18 }} />
                  Permafrost {permafrost ? "ACTIVADO" : "desactivado"}
                </button>
              </Bloque>

              <Bloque titulo="Escenarios guiados" icono="fa-flag-checkered">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                  {ESCENARIOS.map((e) => (
                    <button key={e.label} title={e.desc} onClick={() => cargar(e.co2, e.veg, e.volc, e.permafrost)} style={botonCss(false, accent)}>
                      <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                      {e.label}
                    </button>
                  ))}
                </div>
              </Bloque>

              <Bloque titulo="Respuesta del sistema" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Temperatura media" value={`${fmt1(est.temperatura)} °C`} col={alerta.col} />
                  <Dato label="Δ vs 1850" value={`${fmtDelta(est.deltaT)} °C`} col={alerta.col} />
                  <Dato label="Nivel del mar" value={`${fmtDelta(est.nivelMar, 0)} cm`} col={AGUA} />
                  <Dato label="pH del océano" value={fmt2(est.ph)} col={est.ph < 8.05 ? ROJO : AGUA} />
                  <Dato label="Metano (CH₄)" value={`${fmt0(est.ch4)} ppb`} col={MORADO} />
                  <Dato label="Precipitación" value={`${fmt0(est.precip)} índ.`} col={VERDE} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  {est.puntoNoRetorno
                    ? <>El deshielo del permafrost libera metano (~{fmt0(est.ch4)} ppb) que amplifica el calentamiento: una retroalimentación que se dispara sola.</>
                    : volc > 0
                      ? <>El volcán inyecta SO₂ (enfría ~{fmt1(est.enfriaVolcan)} °C a corto plazo) y CO₂ que acidifica el océano (pH {fmt2(est.ph)}).</>
                      : veg < 70
                        ? <>Con menos bosque cae el sumidero de CO₂ y la lluvia tierra adentro (índice de precipitación {fmt0(est.precip)}).</>
                        : <>Mueve una variable y observa cómo responden los otros tres subsistemas: todo está conectado.</>}
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
              {SUBSISTEMAS.map((s) => (
                <Bloque key={s.key} titulo={s.nombre} icono={s.icono}>
                  <p style={{ margin: 0, color: T.text2 }}>{s.resumen}</p>
                  <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4, color: T.text3 }}>
                    {s.datos.map((d, j) => <li key={j}>{d}</li>)}
                  </ul>
                </Bloque>
              ))}
              <Bloque titulo="Interacciones clave" icono="fa-arrows-left-right">
                {INTERACCIONES.map((it, i) => (
                  <div key={i} style={{ color: T.text2 }}>
                    <span style={{ fontWeight: 800, color: accent }}>{it.de} → {it.a}: </span>
                    {it.texto}
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Qué hacer" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Lleva el CO₂ de {CO2_REF} a {CO2_HOY} ppm y observa subir el termómetro y el mar mientras baja el pH. Luego prueba la <strong style={{ color: MORADO }}>restauración</strong>: ¿el sistema vuelve por completo? Esa «inercia» es lo que hace urgente actuar.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={SUBSISTEMAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Modelo cualitativo con fines didácticos: usa números de referencia conocidos (sensibilidad climática ~3 °C por duplicación de CO₂, IPCC; pH preindustrial 8.2) para mostrar la dirección y el orden de las interacciones entre subsistemas, no para predecir valores exactos.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
