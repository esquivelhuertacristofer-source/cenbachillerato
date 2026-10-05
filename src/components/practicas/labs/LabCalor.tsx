"use client";

/**
 * Laboratorio 3D — "Propagación del calor: conducción, convección y radiación".
 * Práctica experimental anclada a CNEYT-II-P11-A2 (ejercicio; propósito formativo
 * O4, UAC CNEYT-II "El poder de la energía"). Recorre cada mecanismo y calcula el
 * flujo de calor con la conductividad térmica k y la energía con la capacidad
 * térmica específica c, con la matemática exacta del módulo de datos.
 *
 * EL experimento: cambias el material de la barra (k) y el frente de calor viaja
 * más rápido o más lento; subes el calor de la base o la temperatura del cuerpo
 * y la corriente o el brillo de las ondas cambian (T⁴).
 *
 * Cuatro modos: conducción · convección · radiación · comparar.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { PROPAGACION_CALOR_FICHA } from "./propagacion-calor-ficha";
import { RETO_A2 } from "./propagacion-calor-data";
import {
  type Modo,
  MODOS,
  MODOS_DEF,
  FASES,
  numFases,
  escenaPara,
  MATERIALES,
  materialPorNombre,
  conduccion,
  conveccion,
  radiacion,
  cToK,
  calorSensible,
  tiempoCalentar,
  fmtNum,
  COMPARACION,
  PROBLEMA,
  INSTRUCCIONES,
  PREGUNTAS,
  IDEAS,
  GLOSARIO,
  CONTEXTO,
  FUENTE,
  EJEMPLO,
  DATOS,
  HECHOS,
} from "./calor-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-propagacion-calor-reto";

const CalorScene = dynamic(() => import("./CalorScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-fire-flame-curved fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando la propagación del calor en 3D…</span>
    </div>
  ),
});

export function LabCalor({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("conduccion");
  const [paso, setPaso] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  // EL experimento: qué tan fuerte es el calor (base o temperatura) y de qué material es la barra
  const [nivel, setNivel] = useState<number>(0.6);

  // calculadora de la actividad A2
  const [matNombre, setMatNombre] = useState<string>("Cobre");
  const [areaCm2, setAreaCm2] = useState<number>(100);
  const [largoCm, setLargoCm] = useState<number>(20);
  const [deltaT, setDeltaT] = useState<number>(80);
  const [masaKg, setMasaKg] = useState<number>(1);

  // banderas de misión (se activan en eventos y ya no se desactivan)
  const [vistos, setVistos] = useState<Record<string, boolean>>({ conduccion: true });
  const [siguioCond, setSiguioCond] = useState(false);
  const [probaAislante, setProbaAislante] = useState(false);
  const [subioTemp, setSubioTemp] = useState(false);

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

  const bump = () => setResetNonce((n) => n + 1);

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;
  const totalFases = numFases(modo);
  const total = Math.max(0, totalFases - 1);
  const idx = Math.min(paso, total);
  const escena = escenaPara(modo, idx);
  const esComparar = modo === "comparar";
  const nombresFase = esComparar ? [] : FASES[modo];

  useEffect(() => {
    if (!playing || esComparar || total === 0) return;
    if (idx >= total) return;
    const t = setInterval(() => {
      setPaso((p) => Math.min(total, p + 1));
      if (modo === "conduccion") setSiguioCond(true);
    }, 1600);
    return () => clearInterval(t);
  }, [playing, total, idx, esComparar, modo]);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setPaso(0);
    setPlaying(m !== "comparar");
    setVistos((v) => ({ ...v, [m]: true }));
    bump();
    if (sonido) audioRef.current?.blip();
  };
  const reiniciar = () => {
    setPaso(0);
    setPlaying(!esComparar);
    bump();
  };

  // resultados de la calculadora (A2)
  const mat = materialPorNombre(matNombre);
  const areaM2 = Math.max(0.0001, areaCm2) / 10000;
  const largoM = Math.max(0.001, largoCm) / 100;
  const dT = Math.max(0, deltaT);
  const m = Math.max(0.001, masaKg);
  const flujo = conduccion(mat.k, areaM2, dT, largoM); // W
  const energia = calorSensible(m, mat.c, dT); // J
  const tCal = tiempoCalentar(m, mat.c, dT, flujo); // s

  // conductividad relativa (escala log de k) → rapidez del frente de calor en la escena
  const kMin = Math.log10(0.026);
  const kMax = Math.log10(401);
  const kRel = Math.max(0, Math.min(1, (Math.log10(mat.k) - kMin) / (kMax - kMin)));
  const segCruce = 1 / (0.05 + 0.45 * kRel);

  // radiación: la temperatura del cuerpo sale del mismo control
  const tempK = Math.round(300 + nivel * 1200);
  const potRad = radiacion(1, 1, tempK, cToK(20));
  // convección: ΔT de la base (ejemplo con h = 10 W/m²·K y 1 m²)
  const dTBase = Math.round(10 + nivel * 70);
  const potConv = conveccion(10, 1, dTBase);

  const elegirMaterial = (nombre: string) => {
    setMatNombre(nombre);
    if (materialPorNombre(nombre).k < 1) setProbaAislante(true);
    setModo("conduccion");
    setVistos((v) => ({ ...v, conduccion: true }));
    setPaso(0);
    setPlaying(true);
    bump();
    if (sonido) audioRef.current?.blip();
  };

  const cambiarNivel = (v: number) => {
    setNivel(v);
    if (modo === "radiacion" && 300 + v * 1200 >= 1200) setSubioTemp(true);
  };

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {def.subtitulo}.
      </div>
    </div>
  );

  const lectura: React.ReactNode =
    modo === "conduccion" ? (
      <>{mat.nombre} (k = {mat.k}): el calor cruza la barra en ~{fmtNum(segCruce)} s</>
    ) : modo === "conveccion" ? (
      <>Base +{dTBase} °C: corriente {nivel < 0.35 ? "lenta" : nivel < 0.7 ? "media" : "rápida"}</>
    ) : modo === "radiacion" ? (
      <>{tempK} K emite {fmtNum(potRad, 0)} W por m²</>
    ) : (
      <>Sólido, fluido y vacío: tres caminos del calor</>
    );

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", fontFamily: "ui-monospace, monospace", fontSize: 15, fontWeight: 800, color: "#fff",
    background: "rgba(4,10,22,0.55)", border: `1px solid ${accent}`, borderRadius: 9, padding: "9px 10px", outline: "none", textAlign: "center",
  };
  const etqStyle: React.CSSProperties = { fontSize: 14, color: T.text2, fontWeight: 700 };

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <CalorScene modo={modo} escena={escena} playing={playing} modoColor={modoCol} resetNonce={resetNonce} nivel={nivel} kRel={kRel} />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((mm) => ({ id: mm, etiqueta: MODOS_DEF[mm].etq, icono: MODOS_DEF[mm].icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          {!esComparar && (
            <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reanudar"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          )}
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Prueba un aislante (madera o aire): ¿tarda más el calor en llegar al centro?", done: probaAislante },
        { txt: "Sigue la conducción: el calor avanza partícula a partícula", done: siguioCond },
        { txt: "Cambia el material y compara qué tan rápido conduce", done: matNombre !== "Cobre" },
        { txt: "Observa la convección: el fluido caliente sube y el frío baja", done: !!vistos.conveccion },
        { txt: "Observa la radiación: viaja sin necesidad de medio", done: !!vistos.radiacion },
        { txt: "Sube el cuerpo a más de 1 200 K y mira cómo se intensifican las ondas", done: subioTemp },
        { txt: "Compara los tres mecanismos uno al lado del otro", done: !!vistos.comparar },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              {modo === "conduccion" && (
                <Bloque titulo="Material de la barra" icono="fa-cubes">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 110px), 1fr))", gap: 8 }}>
                    {MATERIALES.map((mt) => (
                      <button
                        key={mt.nombre}
                        type="button"
                        onClick={() => elegirMaterial(mt.nombre)}
                        style={{ cursor: "pointer", padding: "10px 8px", borderRadius: 10, fontSize: 14, fontWeight: 800, color: "#fff", textAlign: "center",
                          border: `1px solid ${mt.nombre === matNombre ? modoCol : "rgba(255,255,255,0.14)"}`,
                          background: mt.nombre === matNombre ? `${modoCol}33` : "transparent" }}
                      >
                        {mt.nombre}
                        <div style={{ fontSize: 14, color: T.text3, fontWeight: 600 }}>k = {mt.k}</div>
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                    <Dato label="conductividad k" value={`${mat.k} W/m·K`} col={modoCol} />
                    <Dato label="cruza la barra en" value={`~${fmtNum(segCruce)} s`} col="#fbbf24" />
                  </div>
                  <p style={{ margin: 0, color: T.text2 }}>Elige otro material: el frente de calor cambia de rapidez y el sensor del punto medio lo muestra.</p>
                </Bloque>
              )}

              {modo === "conveccion" && (
                <Bloque titulo="Calor de la base" icono="fa-fire">
                  <Deslizador label="Calor de la base" icon="fa-fire" colr={modoCol} valor={`+${dTBase} °C`} min={0} max={1} step={0.05} value={nivel} onChange={cambiarNivel} hintL="tibia" hintR="muy caliente" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                    <Dato label="ΔT base–fluido" value={`${dTBase} °C`} col={modoCol} />
                    <Dato label="Q/t (h=10, A=1 m²)" value={`${fmtNum(potConv, 0)} W`} col="#fbbf24" />
                  </div>
                  <p style={{ margin: 0, color: T.text2 }}>Más calor en la base: el fluido sube más rápido y la corriente se acelera.</p>
                </Bloque>
              )}

              {modo === "radiacion" && (
                <Bloque titulo="Temperatura del cuerpo" icono="fa-temperature-high">
                  <Deslizador label="Temperatura" icon="fa-temperature-high" colr={modoCol} valor={`${tempK} K`} min={0} max={1} step={0.05} value={nivel} onChange={cambiarNivel} hintL="300 K" hintR="1 500 K" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                    <Dato label="T del cuerpo" value={`${tempK} K`} col={modoCol} />
                    <Dato label="potencia (ε=1)" value={`${fmtNum(potRad, 0)} W/m²`} col="#fbbf24" />
                  </div>
                  <p style={{ margin: 0, color: T.text2 }}>Si la temperatura se duplica, la potencia radiada se multiplica casi por 16 (T⁴). Fíjate en el brillo de los anillos.</p>
                </Bloque>
              )}

              {esComparar && (
                <Bloque titulo="Comparación rápida" icono="fa-table-list">
                  <p style={{ margin: 0, color: T.text2 }}>Cada mecanismo funciona en un medio distinto: sólido, fluido o vacío. La tabla completa está en «Teoría».</p>
                </Bloque>
              )}

              {!esComparar && (
                <Bloque titulo="Qué está pasando" icono="fa-circle-info">
                  <p style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: "#fff" }}>Fase {idx + 1}/{totalFases} — {escena.nombre}.</strong> {escena.desc}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {nombresFase.map((nom, i) => (
                      <button
                        key={nom}
                        type="button"
                        onClick={() => { setPlaying(false); setPaso(i); }}
                        style={{ cursor: "pointer", padding: "8px 11px", borderRadius: 9, fontSize: 14, fontWeight: 800, color: i === idx ? "#fff" : T.text2,
                          border: `1px solid ${i === idx ? modoCol : "rgba(255,255,255,0.14)"}`, background: i === idx ? `${modoCol}22` : "transparent" }}
                      >
                        {nom}
                      </button>
                    ))}
                  </div>
                </Bloque>
              )}

              <Bloque titulo="Calculadora — flujo y energía (A2)" icono="fa-calculator">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={etqStyle}>Material (k, c)</span>
                    <select value={matNombre} onChange={(e) => elegirMaterial(e.target.value)} style={{ ...inputStyle, textAlign: "left", cursor: "pointer" }}>
                      {MATERIALES.map((mt) => (
                        <option key={mt.nombre} value={mt.nombre}>{mt.nombre} — k={mt.k}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={etqStyle}>ΔT (°C)</span>
                    <input type="number" min={0} max={2000} step={5} value={deltaT} onChange={(e) => setDeltaT(Number(e.target.value) || 0)} style={inputStyle} />
                  </label>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={etqStyle}>Área (cm²)</span>
                    <input type="number" min={1} max={100000} step={10} value={areaCm2} onChange={(e) => setAreaCm2(Number(e.target.value) || 1)} style={inputStyle} />
                  </label>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={etqStyle}>Largo / grosor (cm)</span>
                    <input type="number" min={0.1} max={1000} step={1} value={largoCm} onChange={(e) => setLargoCm(Number(e.target.value) || 0.1)} style={inputStyle} />
                  </label>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span style={etqStyle}>Masa a calentar (kg)</span>
                    <input type="number" min={0.01} max={10000} step={0.5} value={masaKg} onChange={(e) => setMasaKg(Number(e.target.value) || 0.01)} style={inputStyle} />
                  </label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Q/t = k·A·ΔT/L" value={`${fmtNum(flujo)} W`} col="#fb923c" />
                  <Dato label={`Q = m·c·ΔT (${m} kg)`} value={`${fmtNum(energia)} J`} col="#38bdf8" />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  Con esa potencia, calentar {m} kg de {mat.nombre.toLowerCase()} (c = {mat.c} J/kg·K) {dT} °C tomaría <strong style={{ color: "#fff" }}>{fmtNum(tCal)} s</strong>. El agua, con c muy alta, necesita mucha más energía: por eso modera el clima.
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
            <RetoNumericoCard
              reto={RETO_A2}
              accent={accent}
              aprobado={ejercicioAprobado}
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={
                sonido
                  ? (ok) => {
                      if (ok) audioRef.current?.correcto();
                      else audioRef.current?.incorrecto();
                    }
                  : undefined
              }
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="El visor de la propagación del calor" icono="fa-fire-flame-curved">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo={`Para reflexionar — ${def.etq}`} icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS[modo].map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {INSTRUCCIONES[modo].map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo="Comparación de mecanismos" icono="fa-table-list">
                <div style={{ display: "grid", gap: 10 }}>
                  {COMPARACION.map((f) => (
                    <div key={f.rasgo} style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.line}`, background: "rgba(4,10,22,0.4)" }}>
                      <strong style={{ color: "#fff" }}>{f.rasgo}</strong>
                      <div style={{ color: "#fb923c" }}>Conducción: <span style={{ color: T.text2 }}>{f.conduccion}</span></div>
                      <div style={{ color: "#38bdf8" }}>Convección: <span style={{ color: T.text2 }}>{f.conveccion}</span></div>
                      <div style={{ color: "#f472b6" }}>Radiación: <span style={{ color: T.text2 }}>{f.radiacion}</span></div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Ejemplo resuelto (A2)" icono="fa-square-root-variable">
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO.enunciado}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {EJEMPLO.datos.map((d, i) => (
                    <span key={i} style={{ fontWeight: 800, color: "#fff", padding: "4px 9px", borderRadius: 8, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>{d}</span>
                  ))}
                </div>
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO.solucion}</p>
                <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${accent}44`, fontWeight: 800, color: "#86efac" }}>
                  <i className="fa-solid fa-flag-checkered" style={{ marginRight: 7, color: accent }} aria-hidden />{EJEMPLO.resultado}
                </div>
              </Bloque>
              <Bloque titulo="Datos" icono="fa-magnifying-glass-chart">
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
              <Bloque titulo="México: clima y vivienda" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>{CONTEXTO}</p>
              </Bloque>
              <Bloque titulo="¿Sabías que?" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-book">
                <div style={{ display: "grid", gap: 8 }}>
                  {GLOSARIO.map((g, i) => (
                    <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                      <span style={{ fontWeight: 900, color: accent }}>{g.termino}. </span>
                      <span style={{ color: T.text2 }}>{g.definicion}</span>
                      <div style={{ color: T.text3, marginTop: 4 }}><i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} aria-hidden />{g.ejemplo}</div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={PROPAGACION_CALOR_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                El flujo de conducción (Q/t = k·A·ΔT/L), la energía sensible (Q = m·c·ΔT) y el tiempo de calentamiento son <strong>exactos</strong> para los valores de k y c reales de cada material. El modelo 3D es <strong>esquemático</strong> (no a escala): la rapidez del frente de calor sigue la escala logarítmica de k, y las corrientes y anillos representan el mecanismo, no medidas físicas. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
