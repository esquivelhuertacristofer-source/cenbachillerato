"use client";

/**
 * Laboratorio 3D — "División celular: mitosis y meiosis".
 * Práctica experimental anclada a CNEYT-VI-P09-A2 (ejercicio "Analizando la
 * división celular"; propósito formativo O5, UAC CNEYT-VI). El laboratorio
 * recorre fase por fase cada proceso y deja calcular células hijas, ploidía y
 * combinaciones genéticas con la matemática exacta del módulo de datos.
 *
 * Experimento central: el alumno MUEVE la fase (deslizador o gráfica de barras)
 * y ve en vivo cuántas células hay y cuántos cromosomas lleva cada una: la
 * mitosis los conserva (4 → 4) y la meiosis los reduce a la mitad (4 → 2).
 *
 * Tres modos:
 *  (1) mitosis  — 1 célula → 2 idénticas (2n): crecer, reparar, regenerar.
 *  (2) meiosis  — 1 célula → 4 diversas (n): gametos y variabilidad genética.
 *  (3) comparar — vista estática lado a lado de ambos resultados + tabla.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { DIVISION_CELULAR_FICHA } from "./division-celular-ficha";
import {
  RETO_A2,
  type Modo,
  MODOS,
  MODOS_DEF,
  FASES,
  numFases,
  escenaPara,
  calcularDivision,
  celulasTrasMitosis,
  fmtEntero,
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
} from "./division-celular-data";

const DivisionCelularScene = dynamic(() => import("./DivisionCelularScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-dna fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando la división celular en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-division-celular-reto";

/** Banderas de misión: una vez ganadas no se pierden al cambiar de modo. */
interface Hecho { mit: boolean; mitFin: boolean; mei: boolean; meiFin: boolean; cmp: boolean; calc: boolean }
const HECHO0: Hecho = { mit: false, mitFin: false, mei: false, meiFin: false, cmp: false, calc: false };

/** Actualiza las banderas al llegar a la fase `i` (función pura: sirve en eventos y en el temporizador). */
function avance(h: Hecho, modo: Modo, i: number, total: number): Hecho {
  if (modo === "mitosis") {
    const mit = h.mit || i > 0;
    const mitFin = h.mitFin || i >= total;
    return mit === h.mit && mitFin === h.mitFin ? h : { ...h, mit, mitFin };
  }
  if (modo === "meiosis") {
    const mei = h.mei || i > 0;
    const meiFin = h.meiFin || i >= total;
    return mei === h.mei && meiFin === h.meiFin ? h : { ...h, mei, meiFin };
  }
  return h;
}

/** Mide lo que se ve en una fase: células en la escena y cromosomas por célula. */
function medidas(modo: Modo, i: number): { celulas: number; cromosomas: number } {
  const e = escenaPara(modo, i);
  const unidades = new Set(e.cromatidas.map((c) => c.pos.join(","))); // 2 hermanas unidas cuentan como 1 cromosoma
  const celulas = Math.max(1, e.celulas.length);
  return { celulas, cromosomas: Math.round(unidades.size / celulas) };
}

export function LabDivisionCelular({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("mitosis");
  const [paso, setPaso] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);
  // calculadora de la actividad A2
  const [cel2n, setCel2n] = useState<number>(46);
  const [hecho, setHecho] = useState<Hecho>(HECHO0);

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
  const total = Math.max(0, totalFases - 1); // máximo del slider (índice de fase)
  const idx = Math.min(paso, total);
  const escena = escenaPara(modo, idx);
  const esComparar = modo === "comparar";
  const nombresFase = modo === "comparar" ? [] : FASES[modo];
  const medida = medidas(modo, idx);
  const perfil = esComparar ? [] : nombresFase.map((_, i) => medidas(modo, i));
  const maxCromo = Math.max(1, ...perfil.map((p) => p.cromosomas));

  // avance automático de fases (más lento que el de bases: cada fase es densa)
  useEffect(() => {
    if (!playing || esComparar || total === 0) return;
    if (idx >= total) return;
    const t = setInterval(() => {
      const sig = Math.min(total, idx + 1);
      setPaso(sig);
      setHecho((h) => avance(h, modo, sig, total));
    }, 1500);
    return () => clearInterval(t);
  }, [playing, total, idx, esComparar, modo]);

  const irAFase = (i: number) => {
    const f = Math.max(0, Math.min(total, i));
    setPlaying(false);
    setPaso(f);
    setHecho((h) => avance(h, modo, f, total));
    if (sonido) audioRef.current?.blip();
  };
  const cambiarModo = (m: Modo) => {
    setModo(m);
    setPaso(0);
    setPlaying(m !== "comparar");
    if (m === "comparar") setHecho((h) => (h.cmp ? h : { ...h, cmp: true }));
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const reiniciar = () => {
    setPaso(0);
    setPlaying(!esComparar);
    bump();
  };
  const cambiarCel2n = (v: number) => {
    setCel2n(v);
    if (v !== 46) setHecho((h) => (h.calc ? h : { ...h, calc: true }));
  };

  // resultados de la calculadora (A2)
  const cel2nSafe = Math.max(2, Math.min(200, cel2n % 2 === 0 ? cel2n : cel2n + 1));
  const rMit = calcularDivision("mitosis", cel2nSafe);
  const rMei = calcularDivision("meiosis", cel2nSafe);

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

  const lectura: string = esComparar
    ? "Mitosis: 2 células 2n · Meiosis: 4 células n"
    : `${escena.nombre}: ${medida.celulas} ${medida.celulas === 1 ? "célula" : "células"}, ${medida.cromosomas} cromosomas c/u`;

  const nota = (col: string, children: React.ReactNode) => (
    <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${col}44`, background: `${col}14`, color: "#eaf0fb" }}>{children}</p>
  );

  const celdaTabla: React.CSSProperties = { padding: "8px 8px", fontSize: 14, borderBottom: `1px solid ${T.line}`, verticalAlign: "top", textAlign: "left", overflowWrap: "anywhere" };
  const tablaComparacion = (
    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
      <thead>
        <tr>
          <th style={{ ...celdaTabla, color: T.text3 }}>Rasgo</th>
          <th style={{ ...celdaTabla, color: "#34d399" }}>Mitosis</th>
          <th style={{ ...celdaTabla, color: "#a78bfa" }}>Meiosis</th>
        </tr>
      </thead>
      <tbody>
        {COMPARACION.map((f) => (
          <tr key={f.rasgo}>
            <td style={{ ...celdaTabla, color: T.text2, fontWeight: 700 }}>{f.rasgo}</td>
            <td style={{ ...celdaTabla, color: "#fff" }}>{f.mitosis}</td>
            <td style={{ ...celdaTabla, color: "#fff" }}>{f.meiosis}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  /* ── Calculadora (A2) con barras: cuántos cromosomas lleva cada hija ──── */
  const barra = (pct: number, col: string) => (
    <div style={{ height: 16, borderRadius: 8, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: 8, transition: "width .4s" }} />
    </div>
  );
  const calculadora = (
    <Bloque titulo="Calculadora: divide una célula 2n" icono="fa-calculator">
      <Deslizador
        label="Cromosomas de la célula madre (2n)" icon="fa-list-ol" colr={accent}
        valor={`${cel2nSafe} · n = ${cel2nSafe / 2}`}
        min={2} max={100} step={2} value={cel2nSafe}
        onChange={cambiarCel2n}
        hintL="2" hintR="100"
      />
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontWeight: 800, color: "#34d399" }}>
            <span><i className="fa-solid fa-clone" style={{ marginRight: 6 }} aria-hidden />Mitosis: {rMit.celulasHijas} células</span>
            <span style={{ fontFamily: "ui-monospace, monospace" }}>{rMit.cromosomasPorHija} c/u</span>
          </div>
          {barra(100, "#34d399")}
          <span style={{ color: T.text3 }}>Hijas idénticas a la madre (2n).</span>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontWeight: 800, color: "#a78bfa" }}>
            <span><i className="fa-solid fa-shuffle" style={{ marginRight: 6 }} aria-hidden />Meiosis: {rMei.celulasHijas} células</span>
            <span style={{ fontFamily: "ui-monospace, monospace" }}>{rMei.cromosomasPorHija} c/u</span>
          </div>
          {barra((rMei.cromosomasPorHija / rMit.cromosomasPorHija) * 100, "#a78bfa")}
          <span style={{ color: T.text3 }}>{fmtEntero(rMei.combinaciones)} combinaciones posibles (2ⁿ).</span>
        </div>
      </div>
      {nota(accent, <>Tras <strong>3 rondas de mitosis</strong> a partir de una sola célula tendrías <strong>{celulasTrasMitosis(3)} células</strong> (2³). La meiosis baja la ploidía: por eso al unirse dos gametos (n + n) se restaura el 2n de la especie.</>)}
    </Bloque>
  );

  /* ── Pestaña «Controles» ───────────────────────────────────────────── */
  const controles = (
    <>
      {esComparar ? (
        <Bloque titulo="Mitosis vs. Meiosis" icono="fa-table-list">
          {tablaComparacion}
        </Bloque>
      ) : (
        <>
          <Bloque titulo="Recorre las fases" icono="fa-forward-step">
            <Deslizador
              label="Fase" icon="fa-dna" colr={modoCol}
              valor={`${idx + 1} de ${totalFases} · ${escena.nombre}`}
              min={0} max={total} step={1} value={idx}
              onChange={irAFase}
              hintL={nombresFase[0]} hintR={nombresFase[total]}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
              <Dato label="Células" value={String(medida.celulas)} col={medida.celulas > 1 ? modoCol : undefined} />
              <Dato label="Cromosomas por célula" value={String(medida.cromosomas)} col={modoCol} />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>Cromosomas por célula en cada fase</span>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${perfil.length}, minmax(0,1fr))`, gap: 4, alignItems: "end" }}>
                {perfil.map((p, i) => {
                  const on = i === idx;
                  return (
                    <button key={nombresFase[i]} type="button" onClick={() => irAFase(i)} title={nombresFase[i]} aria-label={`${nombresFase[i]}: ${p.cromosomas} cromosomas por célula`}
                      style={{ cursor: "pointer", display: "grid", gap: 4, justifyItems: "center", padding: "4px 0", borderRadius: 8, border: `1px solid ${on ? modoCol : "transparent"}`, background: on ? `${modoCol}22` : "transparent", color: on ? "#fff" : T.text2, fontSize: 14, fontWeight: 800 }}>
                      <span style={{ fontFamily: "ui-monospace, monospace" }}>{p.cromosomas}</span>
                      <span style={{ width: "70%", height: Math.max(8, (p.cromosomas / maxCromo) * 64), borderRadius: 4, background: on ? modoCol : i < idx ? `${modoCol}88` : "rgba(255,255,255,0.18)", transition: "height .3s" }} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 110px), 1fr))", gap: 6 }}>
              {nombresFase.map((nom, i) => {
                const on = i === idx;
                return (
                  <button key={nom} type="button" onClick={() => irAFase(i)}
                    style={{ cursor: "pointer", padding: "8px 10px", borderRadius: 9, border: `1px solid ${on ? modoCol : "rgba(255,255,255,0.14)"}`, background: on ? `${modoCol}22` : "transparent", color: on ? "#fff" : T.text2, fontSize: 14, fontWeight: 800 }}>
                    {nom}
                  </button>
                );
              })}
            </div>
            {nota(modoCol, <><strong>{escena.nombre}.</strong> {escena.desc}</>)}
            <p style={{ margin: 0, color: T.text3 }}>{escena.ploidia}</p>
          </Bloque>
        </>
      )}
      {calculadora}
    </>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <DivisionCelularScene modo={modo} escena={escena} playing={playing} modoColor={modoCol} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq, icono: MODOS_DEF[m].icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          {!esComparar && (
            <>
              <BotonHerramienta icono="fa-backward-step" titulo="Fase anterior" onClick={() => irAFase(idx - 1)} />
              <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reanudar"} activo={playing} onClick={() => setPlaying((p) => !p)} />
              <BotonHerramienta icono="fa-forward-step" titulo="Fase siguiente" onClick={() => irAFase(idx + 1)} />
              <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
            </>
          )}
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Recorre las fases de la mitosis", done: hecho.mit },
        { txt: "Lleva la mitosis hasta la citocinesis: ¿cuántos cromosomas tiene cada hija?", done: hecho.mitFin },
        { txt: "Recorre las fases de la meiosis y busca el crossing over", done: hecho.mei },
        { txt: "Lleva la meiosis hasta el final: ¿cuántas células y cuántos cromosomas quedan?", done: hecho.meiFin },
        { txt: "Compara mitosis y meiosis en la vista «Comparar»", done: hecho.cmp },
        { txt: "Usa la calculadora con otro número de cromosomas (2n distinto de 46)", done: hecho.calc },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        { id: "controles", etiqueta: "Controles", icono: "fa-sliders", contenido: controles },
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
              playSfx={() => { if (sonido) audioRef.current?.correcto(); }}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="El visor de la división celular" icono="fa-dna">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Mitosis vs. meiosis" icono="fa-table-list">
                {tablaComparacion}
              </Bloque>
              <Bloque titulo="Para reflexionar" icono="fa-circle-question">
                {MODOS.map((m) => (
                  <div key={m} style={{ display: "grid", gap: 6 }}>
                    <strong style={{ color: accent }}>{MODOS_DEF[m].etq}</strong>
                    <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6, color: T.text2 }}>
                      {PREGUNTAS[m].map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ejemplo resuelto (A2)" icono="fa-square-root-variable">
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO.enunciado}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {EJEMPLO.datos.map((d, i) => (
                    <span key={i} style={{ fontWeight: 800, color: "#fff", padding: "4px 9px", borderRadius: 8, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>{d}</span>
                  ))}
                </div>
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO.solucion}</p>
                <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, fontWeight: 800, color: "#86efac" }}>
                  <i className="fa-solid fa-flag-checkered" style={{ marginRight: 7, color: accent }} aria-hidden />{EJEMPLO.resultado}
                </div>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                {MODOS.map((m) => (
                  <div key={m} style={{ display: "grid", gap: 6 }}>
                    <strong style={{ color: accent }}>{MODOS_DEF[m].etq}</strong>
                    <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
                      {INSTRUCCIONES[m].map((p, i) => <li key={i}>{p}</li>)}
                    </ol>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Datos de la división celular" icono="fa-magnifying-glass-chart">
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
              <Bloque titulo="México: salud y biodiversidad" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>{CONTEXTO}</p>
              </Bloque>
              <Bloque titulo="¿Sabías que?" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-book">
                {GLOSARIO.map((g, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}`, color: T.text2 }}>
                    <strong style={{ color: accent }}>{g.termino}. </strong>{g.definicion}
                    <div style={{ color: T.text3, marginTop: 4 }}><i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} aria-hidden />{g.ejemplo}</div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={DIVISION_CELULAR_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                Los conteos de células hijas, la ploidía resultante (2n→2n en mitosis, 2n→n en meiosis), la separación reduccional de homólogos en Anafase I, la separación de cromátidas hermanas en Anafase II y las combinaciones por distribución independiente (2ⁿ) son <strong>exactos</strong>: la calculadora los obtiene para cualquier 2n. El modelo 3D usa <strong>2n = 4</strong> (dos pares de homólogos) y es <strong>esquemático</strong> (no a escala): representa el mecanismo del reparto de cromosomas, no estructuras medidas. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
