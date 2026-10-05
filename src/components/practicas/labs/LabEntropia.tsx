"use client";

/**
 * Laboratorio 3D — Entropía y leyes de la termodinámica.
 * Práctica experimental para CNEYT-II-P10-A1
 * ("Entropía, entalpía y leyes de la termodinámica").
 *
 * La primera ley dice que la energía se conserva, pero no explica por qué los
 * procesos ocurren en un solo sentido. La ENTROPÍA (S) mide el desorden —la
 * dispersión de la energía— y la SEGUNDA LEY afirma que en todo proceso
 * espontáneo la entropía total del universo aumenta: el calor fluye de lo
 * caliente a lo frío, dos gases se mezclan pero no se separan solos. La TERCERA
 * LEY dice que la entropía de un cristal perfecto en el cero absoluto es cero,
 * y que 0 K es inalcanzable. El lab hace visible la flecha del tiempo.
 * Ciencias Naturales, Experimentales y Tecnología II (MCCEMS 2025).
 *
 * Experimento central: quitar la pared (o poner en contacto lo caliente y lo
 * frío) y ver cómo la BARRA de entropía de la escena sube y nunca baja sola.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { ENTROPIA_FICHA } from "./entropia-segunda-ley-ficha";
import { QUIZ_A2 } from "./entropia-segunda-ley-data";
import {
  type ProcesoKey,
  PROCESOS,
  getProceso,
  LEYES,
  kelvinACelsius,
  fmtNum,
  entropiaCristal,
  T_CRISTAL_MIN, T_CRISTAL_MAX, T_CRISTAL_STEP,
} from "./entropia-data";

const EntropiaScene = dynamic(() => import("./EntropiaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-snowflake fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const FRIO = "#5BC8FF";

const RETO_KEY = "cen-entropia-segunda-ley-reto";

export function LabEntropia({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [proceso, setProceso] = useState<ProcesoKey>("mezcla");
  const [activo, setActivo] = useState(false); // pared quitada / en contacto
  const [tempCristal, setTempCristal] = useState(220); // K
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioMezcla, setVioMezcla] = useState(false);
  const [vioCalor, setVioCalor] = useState(false);
  const [vioCristal, setVioCristal] = useState(false);
  const [vioContacto, setVioContacto] = useState(false);
  const [enfrioCerca, setEnfrioCerca] = useState(false);

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

  const proc = useMemo(() => getProceso(proceso), [proceso]);
  const tC = useMemo(() => kelvinACelsius(tempCristal), [tempCristal]);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarProceso = (k: ProcesoKey) => {
    setProceso(k);
    setActivo(false); // cada proceso arranca en su estado inicial
    bump();
    if (sonido) audioRef.current?.blip();
    if (k === "mezcla") setVioMezcla(true);
    if (k === "calor") setVioCalor(true);
    if (k === "cristal") setVioCristal(true);
  };

  const cambiarTemp = (k: number) => {
    setTempCristal(k);
    if (k <= 40) setEnfrioCerca(true);
  };

  const alternarActivo = () => {
    const nuevo = !activo;
    setActivo(nuevo);
    if (nuevo && proceso === "calor") setVioContacto(true);
    if (sonido) audioRef.current?.blip();
  };

  const reset = () => {
    setActivo(false);
    if (proceso === "cristal") setTempCristal(220);
    bump();
  };

  const esCristal = proceso === "cristal";

  const objetivos = [
    { txt: "Mezcla dos gases y ve que no se separan", done: vioMezcla && activo },
    { txt: "Pon en contacto lo caliente y lo frío: la barra sube hasta el equilibrio", done: vioContacto, modo: "calor" },
    { txt: "Deja que el calor fluya al equilibrio", done: vioCalor },
    { txt: "Ordena un cristal cerca de 0 K", done: vioCristal },
    { txt: "Acércate al cero absoluto (S → 0)", done: enfrioCerca },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-shuffle" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>El desorden del universo siempre aumenta</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: en todo proceso espontáneo la entropía total sube. Por eso el calor va de lo caliente a lo frío y los gases se mezclan, pero nunca al revés.
      </div>
    </div>
  );

  // Una frase corta sobre la escena: lo que se está viendo ahora.
  let lectura: string;
  if (proceso === "mezcla") lectura = activo ? "Sin pared: los gases se mezclan y S sube." : "Con la pared puesta, nada se mezcla.";
  else if (proceso === "calor") lectura = activo ? "El calor fluye al frío hasta igualarse." : "Separados: cada bloque guarda su temperatura.";
  else lectura = tempCristal <= 40 ? "Casi sin vibrar: el orden es casi total." : "Más calor, más vibración, más desorden.";

  const sCristal = entropiaCristal(tempCristal);

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <EntropiaScene
            proceso={proceso}
            activo={activo}
            tempCristal={tempCristal}
            accent={accent}
            pausado={pausado}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: PROCESOS.map((p) => ({ id: p.key, etiqueta: p.nombre, icono: p.icono })),
        valor: proceso,
        cambiar: (id) => cambiarProceso(id as ProcesoKey),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar" : "Pausar"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
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
              <Bloque titulo={proc.nombre} icono={proc.icono}>
                {!esCristal && (
                  <button
                    type="button"
                    onClick={alternarActivo}
                    style={{
                      cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                      padding: "14px 16px", borderRadius: 13, fontSize: 15, fontWeight: 800,
                      border: `1px solid ${activo ? OK : accent}`,
                      background: activo ? "rgba(52,211,153,0.14)" : `rgba(${color.rgba},0.14)`,
                      color: activo ? OK : "#fff",
                    }}
                  >
                    <i className={`fa-solid ${activo ? "fa-rotate-left" : "fa-play"}`} aria-hidden />
                    {activo ? (proc.accionOff ?? "Reiniciar") : (proc.accionOn ?? "Iniciar")}
                  </button>
                )}
                {esCristal && (
                  <>
                    <Deslizador
                      label="Temperatura del cristal" icon="fa-temperature-half" colr={FRIO}
                      valor={`${fmtNum(tempCristal, 0)} K`}
                      min={T_CRISTAL_MIN} max={T_CRISTAL_MAX} step={T_CRISTAL_STEP} value={tempCristal}
                      onChange={cambiarTemp}
                      hintL="≈ 0 K (orden total)" hintR={`${T_CRISTAL_MAX} K (caliente)`}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                      <Dato label="en grados Celsius" value={`${fmtNum(tC, 0)} °C`} col={FRIO} />
                      <Dato label="entropía relativa" value={`${fmtNum(sCristal * 100, 0)} %`} col={accent} />
                    </div>
                  </>
                )}
                <p style={{ margin: 0, color: T.text2 }}>{proc.resumen}</p>
              </Bloque>
              <Bloque titulo="Qué mirar" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Fíjate en la <strong style={{ color: accent }}>barra de entropía</strong>: en la mezcla y el flujo de calor solo <strong style={{ color: "#fff" }}>sube</strong>. Solo al enfriar el cristal hacia 0 K la verás <strong style={{ color: FRIO }}>bajar</strong> hacia cero.
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
              <Bloque titulo="La entropía y la flecha del tiempo" icono="fa-shuffle">
                <p style={{ margin: 0, color: T.text2 }}>
                  La <strong style={{ color: accent }}>entropía (S)</strong> mide el desorden: qué tan dispersa está la energía. La primera ley dice que la energía se <strong style={{ color: "#fff" }}>conserva</strong>, pero no explica el sentido de los procesos. La <strong style={{ color: accent }}>segunda ley</strong> sí: en todo cambio espontáneo, la entropía total del universo <strong style={{ color: "#fff" }}>aumenta</strong>. Esa es la flecha del tiempo.
                </p>
              </Bloque>
              <Bloque titulo="Las leyes de la termodinámica" icono="fa-scale-balanced">
                <div style={{ display: "grid", gap: 12 }}>
                  {LEYES.map((l, i) => (
                    <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff", background: `rgba(${color.rgba},0.22)` }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: "#fff" }}>{l.nombre}</div>
                        <div style={{ color: T.text2 }}>{l.enunciado}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Entalpía: exo y endotérmico" icono="fa-fire-flame-curved">
                <p style={{ margin: 0, color: T.text2 }}>
                  La <strong style={{ color: accent }}>entalpía (H = U + PV)</strong> es el calor que se intercambia a presión constante. Si el proceso <strong style={{ color: "#ff8a5a" }}>libera</strong> calor es <strong style={{ color: "#ff8a5a" }}>exotérmico</strong> (como la combustión); si <strong style={{ color: FRIO }}>absorbe</strong> calor es <strong style={{ color: FRIO }}>endotérmico</strong> (como disolver ciertas sales, que enfrían el agua).
                </p>
              </Bloque>
              <Bloque titulo="El cero absoluto" icono="fa-snowflake">
                <p style={{ margin: 0, color: T.text2 }}>
                  La escala <strong style={{ color: accent }}>Kelvin</strong> empieza en el <strong style={{ color: "#fff" }}>cero absoluto</strong> (−273.15 °C): el punto donde un cristal perfecto tendría su entropía mínima (cero). Puedes acercarte cuanto quieras, pero <strong style={{ color: FRIO }}>nunca llegar</strong>.
                </p>
              </Bloque>
              <Bloque titulo="Para pensar" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  <li>¿Por qué nunca ves que una taza fría caliente sola a la mesa que la rodea?</li>
                  <li>Si la energía se conserva, ¿por qué no se puede deshacer la mezcla?</li>
                  <li>¿Por qué ninguna máquina térmica puede ser 100% eficiente?</li>
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ENTROPIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}
