"use client";

/**
 * Laboratorio 3D — "Respiración aerobia y anaerobia".
 * Práctica experimental anclada a CNEYT-IV·O8 (UAC "El poder de la química").
 * Recorre los procesos químicos de la respiración celular paso a paso y calcula
 * el balance de ATP, el O₂ consumido y el CO₂/H₂O producido por mol de glucosa,
 * con la estequiometría exacta del módulo de datos.
 *
 * Cuatro modos: glucólisis · respiración aerobia · fermentación · comparar.
 *
 * EXPERIMENTO CENTRAL: en «Comparar» el alumno baja el oxígeno disponible y VE
 * cómo se apagan las monedas de ATP de la célula aerobia (de 38 a 2) mientras
 * se acumula lactato. Modelo simplificado: la fracción f de la glucosa que se
 * oxida con O₂ rinde 38 ATP y el resto 2 ATP.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RESPIRACION_FICHA } from "./respiracion-celular-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./respiracion-celular-data";
import { LabSfx } from "./lab-audio";
import {
  type Modo,
  MODOS,
  MODOS_DEF,
  FASES,
  numFases,
  escenaPara,
  RUTAS,
  rutaPorId,
  balanceVia,
  ventajaAerobia,
  DESGLOSE_AEROBIA,
  totalDesglose,
  fmtNum,
  fmtPorcentaje,
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
  DELTA_G_GLUCOSA,
  ENERGIA_ATP,
} from "./respiracion-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-respiracion-celular-reto";

const RespiracionScene = dynamic(() => import("./RespiracionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-arrows-rotate fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando la respiración celular en 3D…</span>
    </div>
  ),
});

const th: React.CSSProperties = { padding: "8px 9px", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: T.text3, textAlign: "left", borderBottom: `1px solid ${T.line}` };
const td: React.CSSProperties = { padding: "8px 9px", fontSize: 14, borderBottom: `1px solid ${T.line}`, verticalAlign: "top", textAlign: "left" };

export function LabRespiracion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("glucolisis");
  const [paso, setPaso] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  // oxígeno disponible (0 → 100 %): la variable del experimento central
  const [o2Pct, setO2Pct] = useState<number>(100);

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

  // calculadora de la actividad A2
  const [rutaId, setRutaId] = useState<string>("aerobia");
  const [molGlucosa, setMolGlucosa] = useState<number>(5);

  const bump = () => setResetNonce((n) => n + 1);

  const def = MODOS_DEF[modo];
  const totalFases = numFases(modo);
  const total = Math.max(0, totalFases - 1);
  const idx = Math.min(paso, total);
  const escena = escenaPara(modo, idx);
  const esComparar = modo === "comparar";
  const nombresFase = esComparar ? [] : FASES[modo as Exclude<Modo, "comparar">];
  const modoCol = `#${def.color.replace("#", "")}`;

  useEffect(() => {
    if (!playing || esComparar || total === 0) return;
    if (idx >= total) return;
    const t = setInterval(() => setPaso((p) => Math.min(total, p + 1)), 1700);
    return () => clearInterval(t);
  }, [playing, total, idx, esComparar]);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setPaso(0);
    setPlaying(m !== "comparar");
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const reiniciar = () => {
    setPaso(0);
    setPlaying(!esComparar);
    bump();
  };

  // ── Experimento central: ATP según el oxígeno disponible ──────────────────
  const f = o2Pct / 100;
  const atpO2 = 2 + 36 * f; // ATP por glucosa
  const efiO2 = (atpO2 * ENERGIA_ATP) / DELTA_G_GLUCOSA;

  // ── Calculadora A2: balance de ATP / O₂ / CO₂ ────────────────────────────
  const ruta = rutaPorId(rutaId);
  const bal = useMemo(() => balanceVia(ruta, molGlucosa), [ruta, molGlucosa]);
  const ventaja = ventajaAerobia();
  const totalAtp = totalDesglose();

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

  const lectura = esComparar
    ? <>Con {o2Pct} % de O₂: {fmtNum(atpO2, 0)} ATP por glucosa</>
    : <>Fase {idx + 1}/{totalFases}: {escena.nombre}</>;

  const leyendas: Record<Modo, [string, string][]> = {
    glucolisis: [["#4ade80", "Glucosa"], ["#fbbf24", "Piruvato"], ["#a78bfa", "NADH"]],
    aerobia: [["#38bdf8", "O₂"], ["#94a3b8", "CO₂"], ["#60a5fa", "H₂O"], ["#fde047", "ATP"]],
    fermentacion: [["#f472b6", "Lactato"], ["#2dd4bf", "Etanol"], ["#94a3b8", "CO₂"]],
    comparar: [["#38bdf8", "O₂"], ["#f472b6", "Lactato"], ["#fde047", "ATP"]],
  };

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <RespiracionScene modo={modo} escena={escena} playing={playing} modoColor={modoCol} resetNonce={resetNonce} o2={f} />
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
            <>
              <BotonHerramienta icono="fa-backward-step" titulo="Fase anterior" onClick={() => { setPlaying(false); setPaso((p) => Math.max(0, p - 1)); }} />
              <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reanudar"} activo={playing} onClick={() => setPlaying((p) => !p)} />
              <BotonHerramienta icono="fa-forward-step" titulo="Fase siguiente" onClick={() => { setPlaying(false); setPaso((p) => Math.min(total, p + 1)); }} />
              <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
            </>
          )}
        </>
      }
      leyenda={
        <>
          {leyendas[modo].map(([c, t]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: c, flexShrink: 0 }} />
              {t}
            </div>
          ))}
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Observa las cuatro fases de la glucólisis en el modo Glucólisis", done: modo !== "glucolisis" || paso > 0 },
        { txt: "Recorre las etapas de Krebs y cadena transportadora (Aerobia)", done: modo === "aerobia" || modo === "comparar" },
        { txt: "Compara aerobia vs fermentación en el modo Comparar", done: modo === "comparar" },
        { txt: "En Comparar, baja el oxígeno a 0 %: ¿cuántas monedas de ATP quedan?", done: o2Pct === 0 },
        { txt: "Usa la calculadora para ver el balance de ATP, O₂ y CO₂", done: molGlucosa !== 5 || rutaId !== "aerobia" },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Experimento: el oxígeno disponible" icono="fa-wind">
                <Deslizador
                  label="Oxígeno disponible"
                  icon="fa-wind"
                  colr="#38bdf8"
                  valor={`${o2Pct} %`}
                  min={0}
                  max={100}
                  step={5}
                  value={o2Pct}
                  onChange={setO2Pct}
                  hintL="sin O₂"
                  hintR="con O₂"
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="ATP por glucosa" value={fmtNum(atpO2, 0)} col="#fde047" />
                  <Dato label="eficiencia" value={fmtPorcentaje(efiO2)} col="#34d399" />
                  <Dato label="O₂ consumido" value={`${fmtNum(6 * f, 1)} mol`} col="#38bdf8" />
                  <Dato label="ácido láctico" value={`${fmtNum(2 * (1 - f), 1)} mol`} col="#f472b6" />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  {esComparar
                    ? <>Las monedas amarillas de la célula aerobia se apagan al bajar el O₂ y aparece lactato. Modelo simplificado: la fracción de glucosa que se oxida con O₂ rinde 38 ATP; el resto, 2.</>
                    : <>Cambia a <strong>Comparar</strong> para ver el efecto en 3D (por glucosa, modelo simplificado).</>}
                </p>
              </Bloque>

              {!esComparar && (
                <Bloque titulo={`Fases — ${def.etq}`} icono="fa-list-ol">
                  <Deslizador
                    label="Fase"
                    icon="fa-forward-step"
                    colr={modoCol}
                    valor={`${idx + 1} / ${totalFases}`}
                    min={0}
                    max={total}
                    step={1}
                    value={idx}
                    onChange={(v) => { setPlaying(false); setPaso(v); }}
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {nombresFase.map((nom, i) => {
                      const on = i === idx;
                      const visto = i < idx;
                      return (
                        <button
                          key={nom}
                          type="button"
                          onClick={() => { setPlaying(false); setPaso(i); }}
                          style={{
                            cursor: "pointer", padding: "8px 11px", borderRadius: 10, border: "1px solid", fontSize: 14, fontWeight: 800,
                            borderColor: on ? modoCol : visto ? `${modoCol}55` : "rgba(255,255,255,0.12)",
                            background: on ? `${modoCol}22` : "transparent",
                            color: on ? "#fff" : visto ? "#cdd8ec" : T.text2,
                          }}
                        >
                          {nom}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ margin: 0, color: T.text2 }}>{escena.desc}</p>
                </Bloque>
              )}

              <Bloque titulo="Calculadora — balance de ATP, O₂ y CO₂ (A2)" icono="fa-calculator">
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 14, color: T.text2, fontWeight: 700 }}>Vía metabólica</span>
                  <select
                    value={rutaId}
                    onChange={(e) => setRutaId(e.target.value)}
                    style={{ boxSizing: "border-box", width: "100%", fontSize: 16, fontWeight: 700, color: "#fff", background: "rgba(4,10,22,0.55)", border: `1px solid ${accent}`, borderRadius: 10, padding: "10px 12px" }}
                  >
                    {RUTAS.map((r) => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </select>
                </label>
                <Deslizador
                  label="Glucosa"
                  icon="fa-cubes-stacked"
                  colr={accent}
                  valor={`${molGlucosa} mol`}
                  min={0}
                  max={100}
                  step={1}
                  value={molGlucosa}
                  onChange={setMolGlucosa}
                />
                <div style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, color: "#eaf0fb", fontFamily: "ui-monospace, monospace", overflowWrap: "anywhere" }}>
                  {ruta.ecuacion}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="ATP total" value={fmtNum(bal.atp)} col="#fde047" />
                  <Dato label="ATP por glucosa" value={String(ruta.atpPorGlucosa)} />
                  <Dato label="O₂ consumido" value={`${fmtNum(bal.o2)} mol`} col="#38bdf8" />
                  <Dato label="CO₂ liberado" value={`${fmtNum(bal.co2)} mol`} col="#94a3b8" />
                  <Dato label="H₂O formada" value={`${fmtNum(bal.h2o)} mol`} col="#60a5fa" />
                  <Dato label="eficiencia" value={fmtPorcentaje(bal.eficiencia)} col="#34d399" />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  {ruta.aerobica
                    ? `La aerobia captura ~${fmtNum(bal.energiaKJ)} kJ como ATP de los ${fmtNum(molGlucosa * 2870)} kJ disponibles en la glucosa. Rinde ${fmtNum(ventaja)}× más ATP que la fermentación.`
                    : `La fermentación solo aprovecha los 2 ATP de la glucólisis: ${fmtNum(ventaja)} veces menos que la respiración aerobia. ${ruta.contexto}`}
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
              <Bloque titulo="El visor de la respiración celular" icono="fa-lungs">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo={`Cómo usar — ${def.etq}`} icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {INSTRUCCIONES[modo].map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo={`Para reflexionar — ${def.etq}`} icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS[modo].map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Aerobia (con O₂) vs anaerobia (sin O₂)" icono="fa-table-list">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr><th style={th}>Rasgo</th><th style={{ ...th, color: "#34d399" }}>Aerobia</th><th style={{ ...th, color: "#a78bfa" }}>Anaerobia</th></tr>
                  </thead>
                  <tbody>
                    {COMPARACION.map((fila) => (
                      <tr key={fila.rasgo}>
                        <td style={{ ...td, color: T.text2, fontWeight: 700 }}>{fila.rasgo}</td>
                        <td style={{ ...td, color: "#fff" }}>{fila.aerobia}</td>
                        <td style={{ ...td, color: "#fff" }}>{fila.anaerobia}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Bloque>
              <Bloque titulo={`De dónde salen los ${totalAtp} ATP (por glucosa)`} icono="fa-layer-group">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr><th style={th}>Etapa</th><th style={th}>Fuente</th><th style={{ ...th, textAlign: "right" }}>ATP</th></tr>
                  </thead>
                  <tbody>
                    {DESGLOSE_AEROBIA.map((fila, i) => (
                      <tr key={i}>
                        <td style={{ ...td, color: T.text2, fontWeight: 700 }}>{fila.etapa}</td>
                        <td style={{ ...td, color: "#cdd8ec" }}>{fila.fuente}</td>
                        <td style={{ ...td, color: "#fde047", fontWeight: 900, textAlign: "right", fontFamily: "ui-monospace, monospace" }}>{fila.atp}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={2} style={{ ...td, color: "#fff", fontWeight: 900 }}>Total</td>
                      <td style={{ ...td, color: "#34d399", fontWeight: 900, textAlign: "right", fontFamily: "ui-monospace, monospace" }}>{totalAtp}</td>
                    </tr>
                  </tbody>
                </table>
              </Bloque>
              <Bloque titulo="Ejemplo resuelto (A2)" icono="fa-square-root-variable">
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO.enunciado}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {EJEMPLO.datos.map((d, i) => (
                    <span key={i} style={{ fontSize: 14, fontWeight: 800, color: "#fff", padding: "4px 9px", borderRadius: 8, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>{d}</span>
                  ))}
                </div>
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO.solucion}</p>
                <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, fontWeight: 800, color: "#86efac" }}>
                  <i className="fa-solid fa-flag-checkered" style={{ marginRight: 7, color: accent }} aria-hidden />{EJEMPLO.resultado}
                </div>
              </Bloque>
              <Bloque titulo="Datos de la respiración celular" icono="fa-magnifying-glass-chart">
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
              <Bloque titulo="México: tequila, pan, yogur y biogás" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>{CONTEXTO}</p>
              </Bloque>
              <Bloque titulo="¿Sabías que?" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-book">
                {GLOSARIO.map((g, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                    <span style={{ fontWeight: 900, color: accent }}>{g.termino}. </span>
                    <span style={{ color: T.text2 }}>{g.definicion}</span>
                    <div style={{ color: T.text3, marginTop: 4 }}><i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} aria-hidden />{g.ejemplo}</div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book-open">
                <FichaTeorica data={RESPIRACION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                El balance de ATP, el O₂ consumido, el CO₂/H₂O producido y la eficiencia que devuelve la calculadora usan la <strong>estequiometría estándar</strong> y el <strong>rendimiento teórico máximo</strong> (38 ATP/glucosa). Las estimaciones modernas, contando el costo de transportar protones, lo sitúan en <strong>~30–32 ATP</strong>. El control de oxígeno es un <strong>modelo simplificado</strong> (fracción de glucosa que se oxida con O₂). El modelo 3D es <strong>esquemático</strong> (no a escala): las esferas, la mitocondria, la cadena de complejos y las monedas de ATP representan el mecanismo, no medidas físicas. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
