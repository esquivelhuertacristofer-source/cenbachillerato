"use client";

/**
 * Laboratorio 3D — Calor, temperatura y mecanismos de transferencia.
 * Práctica experimental para CNEYT-II-P04-A1
 * ("Calor, temperatura y mecanismos de transferencia").
 *
 * La temperatura mide el movimiento promedio de las partículas; el calor es
 * energía en tránsito que fluye del cuerpo caliente al frío hasta el equilibrio
 * térmico. Esa energía viaja por tres caminos: conducción (contacto, partícula a
 * partícula), convección (el fluido caliente sube y el frío baja) y radiación
 * (ondas que cruzan incluso el vacío). El lab los hace visibles uno por uno y
 * deja comparar conductores y aislantes.
 * Ciencias Naturales, Experimentales y Tecnología II (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { TRANSFERENCIA_CALOR_FICHA } from "./transferencia-calor-mecanismos-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./transferencia-calor-mecanismos-data";
import { LabSfx } from "./lab-audio";
import {
  type MecanismoKey,
  MECANISMOS,
  getMecanismo,
  MATERIALES,
  getMaterial,
  celsiusAKelvin,
  celsiusAFahrenheit,
  fmtNum,
  T_FUENTE_MIN, T_FUENTE_MAX, T_FUENTE_STEP,
} from "./transferencia-calor-data";

const TransferenciaCalorScene = dynamic(() => import("./TransferenciaCalorScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-fire fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const FUEGO = "#FF7A45";

const RETO_KEY = "cen-transferencia-calor-mecanismos-reto";

export function LabTransferenciaCalor({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [mecanismo, setMecanismo] = useState<MecanismoKey>("conduccion");
  const [materialKey, setMaterialKey] = useState("cobre");
  const [tFuente, setTFuente] = useState(250); // °C
  const [pausado, setPausado] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioConduccion, setVioConduccion] = useState(false);
  const [vioConveccion, setVioConveccion] = useState(false);
  const [vioRadiacion, setVioRadiacion] = useState(false);
  const [comparoMaterial, setComparoMaterial] = useState(false);
  const [llegoConductor, setLlegoConductor] = useState(false); // el calor llegó al extremo lejano de un conductor
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

  const mec = useMemo(() => getMecanismo(mecanismo), [mecanismo]);
  const mat = useMemo(() => getMaterial(materialKey), [materialKey]);
  const tK = useMemo(() => celsiusAKelvin(tFuente), [tFuente]);
  const tF = useMemo(() => celsiusAFahrenheit(tFuente), [tFuente]);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarMecanismo = (k: MecanismoKey) => {
    setMecanismo(k);
    if (sonido) audioRef.current?.blip();
    if (k === "conduccion") setVioConduccion(true);
    if (k === "conveccion") setVioConveccion(true);
    if (k === "radiacion") setVioRadiacion(true);
  };
  const cambiarMaterial = (k: string) => {
    setMaterialKey(k);
    if (k !== "cobre") setComparoMaterial(true);
  };
  const reset = () => { setTFuente(250); bump(); };
  const onLlego = useCallback((conductor: boolean) => { if (conductor) setLlegoConductor(true); }, []);

  const objetivos = [
    { txt: "Con la barra de cobre, espera a que el calor llegue al extremo lejano", done: llegoConductor },
    { txt: "Observa la conducción en la barra", done: vioConduccion },
    { txt: "Mira cómo circula el fluido (convección)", done: vioConveccion },
    { txt: "Comprueba la radiación en el vacío", done: vioRadiacion },
    { txt: "Compara un metal con un aislante", done: comparoMaterial },
    { txt: "Resuelve el reto evaluable de la actividad A4", done: ejercicioAprobado },
  ];
  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-fire" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>El calor siempre viaja de lo caliente a lo frío</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: la energía se transfiere por conducción (contacto), convección (el fluido que circula) y radiación (ondas que cruzan el vacío).
      </div>
    </div>
  );

  const lecturaVivo = mecanismo === "conduccion"
    ? <>Contacto: el calor pasa de partícula a partícula</>
    : mecanismo === "conveccion"
      ? <>El fluido caliente sube y el frío baja</>
      : <>Ondas que cruzan el vacío, sin materia</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <TransferenciaCalorScene
            mecanismo={mecanismo}
            materialKey={materialKey}
            tFuente={tFuente}
            accent={accent}
            pausado={pausado}
            autoRotate={false}
            resetNonce={resetNonce}
            onLlego={onLlego}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: MECANISMOS.map((m) => ({ id: m.key, etiqueta: m.nombre, icono: m.icono })),
        valor: mecanismo,
        cambiar: (id) => cambiarMecanismo(id as MecanismoKey),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar" : "Pausar"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <div style={{ fontSize: 14, fontWeight: 800, color: FUEGO }}>
            <i className="fa-solid fa-fire-flame-curved" style={{ marginRight: 7 }} />
            Fuente · {tFuente} °C
          </div>
          {mecanismo === "conduccion" && (
            <div style={{ fontSize: 14, fontWeight: 800, color: mat.conductor ? OK : "#9fb6d6" }}>
              {mat.nombre} · {mat.conductor ? "conductor" : "aislante"}
            </div>
          )}
        </>
      }
      lectura={lecturaVivo}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <style>{`
                .tc-mats { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 120px), 1fr)); gap:8px; }
                .tc-mat { cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:3px; padding:10px 8px; border-radius:12px;
                  border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .15s; }
                .tc-mat:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
                .tc-mat[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.14); color:#fff; }
              `}</style>
              <Bloque titulo={mec.nombre} icono={mec.icono}>
                <p style={{ margin: 0, color: T.text2 }}>{mec.resumen}</p>
                {mecanismo === "conduccion" && (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>
                      <i className="fa-solid fa-cubes-stacked" style={{ marginRight: 7, color: accent }} />
                      Material de la barra
                    </div>
                    <div className="tc-mats">
                      {MATERIALES.map((m) => (
                        <button key={m.key} type="button" className="tc-mat" data-on={materialKey === m.key} onClick={() => cambiarMaterial(m.key)}>
                          <span>{m.nombre}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: m.conductor ? OK : "#9fb6d6" }}>
                            {m.conductor ? "conductor" : "aislante"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <Deslizador label="Temperatura de la fuente" icon="fa-fire-flame-curved" colr={FUEGO} valor={`${tFuente} °C`} min={T_FUENTE_MIN} max={T_FUENTE_MAX} step={T_FUENTE_STEP} value={tFuente} onChange={setTFuente} />
              </Bloque>
              <Bloque titulo="Escalas de temperatura" icono="fa-temperature-half">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Celsius" value={`${fmtNum(tFuente, 0)} °C`} col={FUEGO} />
                  <Dato label="Kelvin" value={`${fmtNum(tK, 0)} K`} col={accent} />
                  <Dato label="Fahrenheit" value={`${fmtNum(tF, 0)} °F`} col="#9fb6d6" />
                  {mecanismo === "conduccion" && (
                    <Dato label="Conductividad" value={`${fmtNum(mat.k, mat.k < 1 ? 2 : 0)} W/m·K`} col={mat.conductor ? OK : "#9fb6d6"} />
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
              <Bloque titulo="Calor y temperatura no son lo mismo" icono="fa-fire">
                <p style={{ margin: 0, color: T.text2 }}>
                  La <strong style={{ color: accent }}>temperatura</strong> mide qué tan rápido se mueven las partículas en promedio. El <strong style={{ color: FUEGO }}>calor</strong> es energía en tránsito: fluye <strong style={{ color: T.text }}>siempre</strong> del cuerpo más caliente al más frío, hasta que ambos quedan a la misma temperatura (equilibrio térmico).
                </p>
                <div style={{ borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, padding: "11px 14px" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, marginBottom: 5 }}>EN ESTE MECANISMO</div>
                  <div style={{ color: T.text2 }}>
                    <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
                    {mec.necesitaMedio}
                  </div>
                  <div style={{ marginTop: 8, color: T.text2 }}>
                    <i className="fa-solid fa-lightbulb" style={{ marginRight: 7, color: FUEGO }} />
                    {mec.ejemplo}
                  </div>
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  <i className="fa-solid fa-lightbulb" style={{ marginRight: 7, color: accent }} />
                  En conducción, cambia de <strong style={{ color: OK }}>cobre</strong> a <strong style={{ color: T.text }}>madera</strong>: con el aislante el calor casi no avanza. Esa es la diferencia entre un <strong style={{ color: accent }}>conductor</strong> y un <strong style={{ color: accent }}>aislante</strong>.
                </p>
              </Bloque>
              <Bloque titulo="Los tres mecanismos" icono="fa-route">
                <div style={{ display: "grid", gap: 12 }}>
                  {MECANISMOS.map((m) => (
                    <div key={m.key} style={{ display: "flex", gap: 11, alignItems: "flex-start", opacity: mecanismo === m.key ? 1 : 0.7 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: mecanismo === m.key ? "#fff" : accent, background: mecanismo === m.key ? accent : `rgba(${color.rgba},0.14)` }}>
                        <i className={`fa-solid ${m.icono}`} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: T.text }}>{m.nombre}</div>
                        <div style={{ color: T.text2 }}>{m.necesitaMedio}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="El cero absoluto" icono="fa-snowflake">
                <p style={{ margin: 0, color: T.text2 }}>
                  La escala <strong style={{ color: accent }}>Kelvin</strong> empieza en el <strong style={{ color: T.text }}>cero absoluto</strong> (−273.15 °C): el punto donde las partículas tendrían el mínimo movimiento posible. No existe una temperatura más baja.
                </p>
              </Bloque>
              <Bloque titulo="Para pensar" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  <li>¿Por qué el mango de metal de una olla quema y el de madera no?</li>
                  <li>Si el espacio es vacío, ¿cómo nos llega el calor del Sol?</li>
                  <li>¿Por qué el aire caliente de un cuarto se va hacia arriba?</li>
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={TRANSFERENCIA_CALOR_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}
