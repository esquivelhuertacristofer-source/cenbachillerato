"use client";

/**
 * Laboratorio 3D — "Reacciones redox y combustión".
 * Práctica experimental anclada a CNEYT-IV-P09-A2 (ejercicio; propósito formativo
 * O5, UAC CNEYT-IV "El poder de la química"). Recorre cada proceso paso a paso y
 * calcula el potencial de una pila (E°pila = E°cátodo − E°ánodo) y la energía que
 * libera un combustible, con la química exacta del módulo de datos.
 *
 * EL experimento: eliges los dos metales de la pila y el foco brilla más o menos
 * según E°pila; eliges combustible y moles y la llama crece con |ΔH|·n.
 *
 * Cuatro modos: óxido-reducción · combustión · pila galvánica · comparar.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { REDOX_FICHA } from "./redox-combustion-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./redox-combustion-data";
import { LabSfx } from "./lab-audio";
import {
  type Modo,
  MODOS,
  MODOS_DEF,
  FASES,
  numFases,
  escenaPara,
  PARES_REDOX,
  parPorSimbolo,
  celdaEspontanea,
  COMBUSTIBLES,
  combustiblePorNombre,
  energiaCombustion,
  energiaElectrica,
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
} from "./redox-data";

const RedoxScene = dynamic(() => import("./RedoxScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-atom fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando las reacciones redox en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-redox-combustion-reto";

export function LabRedox({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

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

  const [modo, setModo] = useState<Modo>("redox");
  const [paso, setPaso] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  // calculadora de la actividad A2
  const [catSimbolo, setCatSimbolo] = useState<string>("Cu²⁺/Cu");
  const [anoSimbolo, setAnoSimbolo] = useState<string>("Zn²⁺/Zn");
  const [combNombre, setCombNombre] = useState<string>("Metano");
  const [moles, setMoles] = useState<number>(1);

  // banderas de misión (se activan en eventos y ya no se desactivan)
  const [vistos, setVistos] = useState<Record<string, boolean>>({ redox: true });
  const [siguioRedox, setSiguioRedox] = useState(false);
  const [focoEncendido, setFocoEncendido] = useState(false);

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
      const sig = Math.min(total, idx + 1);
      setPaso(sig);
      if (modo === "redox") setSiguioRedox(true);
      if (modo === "pila" && sig >= 2) setFocoEncendido(true);
    }, 1600);
    return () => clearInterval(t);
  }, [playing, total, idx, esComparar, modo]);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setPaso(0);
    setPlaying(m !== "comparar");
    setVistos((v) => ({ ...v, [m]: true }));
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const reiniciar = () => {
    setPaso(0);
    setPlaying(!esComparar);
    bump();
  };

  // resultados de la calculadora (A2)
  const parA = parPorSimbolo(catSimbolo);
  const parB = parPorSimbolo(anoSimbolo);
  const celda = celdaEspontanea(parA, parB);
  const espontaneaEnOrden = parA.eRed >= parB.eRed; // ¿el elegido como cátodo realmente lo es?
  const nElec = Math.max(parA.n, parB.n);
  const wElec = energiaElectrica(nElec, celda.ePila); // J por avance de reacción

  const comb = combustiblePorNombre(combNombre);
  const mol = Math.max(0, moles);
  const energiaQuema = energiaCombustion(comb.deltaH, mol); // kJ
  const potencia = Math.sqrt(Math.max(0, Math.min(1, energiaQuema / 20000)));

  // al elegir otro par, la pila queda funcionando para que se vea el efecto en el foco
  const alElegirPar = () => {
    if (modo === "pila") {
      setPaso((p) => Math.max(p, 3));
      setPlaying(true);
      setFocoEncendido(true);
    }
    if (sonido) audioRef.current?.blip();
  };
  const elegirCatodo = (v: string) => {
    setCatSimbolo(v);
    alElegirPar();
  };
  const elegirAnodo = (v: string) => {
    setAnoSimbolo(v);
    alElegirPar();
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
    modo === "pila" ? (
      <>{celda.anodo.nombre} → {celda.catodo.nombre}: E°pila = {fmtNum(celda.ePila)} V</>
    ) : modo === "combustion" ? (
      <>{comb.nombre}: {fmtNum(energiaQuema)} kJ liberados</>
    ) : esComparar ? (
      <>Tres caras de la transferencia de electrones</>
    ) : (
      <>Fase {idx + 1}/{totalFases} — {escena.nombre}</>
    );

  const selStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", fontSize: 15, fontWeight: 700, color: "#fff", background: "rgba(4,10,22,0.55)",
    border: `1px solid ${accent}`, borderRadius: 9, padding: "10px 10px", outline: "none", cursor: "pointer",
  };
  const etqStyle: React.CSSProperties = { fontSize: 14, color: T.text2, fontWeight: 700 };

  const selectoresPila = (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 10 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span style={etqStyle}>Cátodo (se reduce)</span>
          <select value={catSimbolo} onChange={(e) => elegirCatodo(e.target.value)} style={selStyle}>
            {PARES_REDOX.map((p) => (
              <option key={p.simbolo} value={p.simbolo}>{p.simbolo} — E°={p.eRed} V</option>
            ))}
          </select>
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span style={etqStyle}>Ánodo (se oxida)</span>
          <select value={anoSimbolo} onChange={(e) => elegirAnodo(e.target.value)} style={selStyle}>
            {PARES_REDOX.map((p) => (
              <option key={p.simbolo} value={p.simbolo}>{p.simbolo} — E°={p.eRed} V</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
        <Dato label="E°pila = E°cát − E°ánodo" value={`${fmtNum(celda.ePila)} V`} col="#38bdf8" />
        <Dato label={`W = n·F·E° (${nElec} e⁻)`} value={`${fmtNum(wElec / 1000)} kJ`} col="#a78bfa" />
      </div>
      {!espontaneaEnOrden && (
        <p style={{ margin: 0, padding: "9px 12px", borderRadius: 10, border: "1px solid #fbbf2444", background: "rgba(251,191,36,0.08)", color: "#fde68a" }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 7 }} aria-hidden />
          Elegiste como cátodo el par de menor E°: la celda real invierte los electrodos para ser espontánea. El módulo ya toma {celda.catodo.simbolo} como cátodo (mayor E°).
        </p>
      )}
    </>
  );

  const selectoresComb = (
    <>
      <label style={{ display: "grid", gap: 4 }}>
        <span style={etqStyle}>Combustible (ΔH)</span>
        <select value={combNombre} onChange={(e) => setCombNombre(e.target.value)} style={selStyle}>
          {COMBUSTIBLES.map((c) => (
            <option key={c.nombre} value={c.nombre}>{c.nombre} ({c.formula}) — ΔH={c.deltaH} kJ/mol</option>
          ))}
        </select>
      </label>
      <Deslizador label="Moles que se queman" icon="fa-fire" colr="#fb923c" valor={`${fmtNum(mol)} mol`} min={0.5} max={10} step={0.5} value={mol} onChange={setMoles} hintL="0.5 mol" hintR="10 mol" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
        <Dato label="Q = |ΔH|·n" value={`${fmtNum(energiaQuema)} kJ`} col="#fb923c" />
        <Dato label="ΔH por mol" value={`${comb.deltaH} kJ`} col="#fbbf24" />
      </div>
      <p style={{ margin: 0, color: T.text2, fontFamily: "ui-monospace, monospace", overflowWrap: "anywhere" }}>{comb.ecuacion}</p>
    </>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <RedoxScene
            modo={modo}
            escena={escena}
            playing={playing}
            modoColor={modoCol}
            resetNonce={resetNonce}
            ePila={celda.ePila}
            anodoTxt={celda.anodo.nombre}
            catodoTxt={celda.catodo.nombre}
            potencia={potencia}
            combTxt={`${comb.formula} + O₂ → calor`}
          />
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
        { txt: "Cierra el circuito de la pila y enciende el foco", done: focoEncendido, modo: "pila" },
        { txt: "Explora el modo Óxido-reducción y sigue el viaje de los electrones", done: siguioRedox, modo: "redox" },
        { txt: "Explora el modo Combustión", done: !!vistos.combustion },
        { txt: "Quema un combustible más energético que el metano y compara la llama", done: combNombre !== "Metano" },
        { txt: "Explora el modo Pila galvánica", done: !!vistos.pila },
        { txt: "Cambia el par del cátodo en la calculadora de E°pila", done: catSimbolo !== "Cu²⁺/Cu" },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              {modo === "pila" && (
                <Bloque titulo="Elige los dos metales de la pila" icono="fa-car-battery">
                  {selectoresPila}
                  <p style={{ margin: 0, color: T.text2 }}>Mientras mayor sea la diferencia de E° entre los metales, más brilla el foco y más rápido corren los electrones.</p>
                </Bloque>
              )}

              {modo === "combustion" && (
                <Bloque titulo="Combustible y cantidad" icono="fa-fire">
                  {selectoresComb}
                  <p style={{ margin: 0, color: T.text2 }}>Más ΔH y más moles: la llama crece y se libera más calor.</p>
                </Bloque>
              )}

              {(modo === "redox" || esComparar) && (
                <>
                  <Bloque titulo="Pila galvánica — E°pila" icono="fa-car-battery">
                    {selectoresPila}
                  </Bloque>
                  <Bloque titulo="Combustión — energía liberada" icono="fa-fire">
                    {selectoresComb}
                  </Bloque>
                </>
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
                        onClick={() => {
                          setPlaying(false);
                          setPaso(i);
                          if (modo === "pila" && i >= 2) setFocoEncendido(true);
                        }}
                        style={{ cursor: "pointer", padding: "8px 11px", borderRadius: 9, fontSize: 14, fontWeight: 800, color: i === idx ? "#fff" : T.text2,
                          border: `1px solid ${i === idx ? modoCol : "rgba(255,255,255,0.14)"}`, background: i === idx ? `${modoCol}22` : "transparent" }}
                      >
                        {nom}
                      </button>
                    ))}
                  </div>
                </Bloque>
              )}

              <p style={{ margin: 0, color: T.text2 }}>
                La pila Zn–Cu da +1.10 V porque el cobre (E° = +0.34) se reduce y el zinc (E° = −0.76) se oxida. Quemar {fmtNum(mol)} mol de {comb.nombre.toLowerCase()} libera <strong style={{ color: "#fff" }}>{fmtNum(energiaQuema)} kJ</strong>: en ambos casos hay transferencia de electrones.
              </p>
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
              <Bloque titulo="El visor de las reacciones redox" icono="fa-atom">
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
              <Bloque titulo="Comparación: redox · combustión · pila" icono="fa-table-list">
                <div style={{ display: "grid", gap: 10 }}>
                  {COMPARACION.map((f) => (
                    <div key={f.rasgo} style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.line}`, background: "rgba(4,10,22,0.4)" }}>
                      <strong style={{ color: "#fff" }}>{f.rasgo}</strong>
                      <div style={{ color: "#34d399" }}>Redox: <span style={{ color: T.text2 }}>{f.redox}</span></div>
                      <div style={{ color: "#fb923c" }}>Combustión: <span style={{ color: T.text2 }}>{f.combustion}</span></div>
                      <div style={{ color: "#38bdf8" }}>Pila: <span style={{ color: T.text2 }}>{f.pila}</span></div>
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
              <Bloque titulo="Datos del redox y la combustión" icono="fa-magnifying-glass-chart">
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
              <Bloque titulo="México: energía, corrosión y baterías" icono="fa-location-dot">
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
                <FichaTeorica data={REDOX_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                El potencial de la pila (E°pila = E°cátodo − E°ánodo), la energía eléctrica (W = n·F·E°) y el calor de combustión (Q = |ΔH|·n) son <strong>exactos</strong> para los potenciales estándar y las entalpías reales de cada especie. El modelo 3D es <strong>esquemático</strong> (no a escala): el brillo del foco y el tamaño de la llama siguen E°pila y |ΔH|·n, pero las esferas, electrones y llama representan el mecanismo, no medidas físicas. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
