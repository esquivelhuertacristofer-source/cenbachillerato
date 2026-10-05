"use client";

/**
 * Laboratorio 3D — Ley de Senos y Ley de Cosenos (resolución de triángulos
 * oblicuángulos). Práctica experimental para PM-IV-P05-A2 (ejercicio_matematico;
 * progresión 5).
 *
 * El alumno conoce dos lados de un terreno (a y b) y el ángulo C que forman, y
 * halla el tercer lado c —el que cruza un lago/barranco y no puede medir con
 * cinta— con la LEY DE COSENOS: c = √(a²+b²−2ab·cos C). Luego la LEY DE SENOS da
 * los ángulos restantes. Cálculo exacto.
 *
 * EXPERIMENTO CENTRAL: C es un compás que se abre. Al abrirlo, el lado c crece entre
 * |a−b| (C cerrado) y a+b (C abierto) y cruza el valor de Pitágoras justo en C = 90°.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { LEY_SENOS_FICHA } from "./ley-senos-cosenos-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";
import {
  calcTri, LEYES, ESCENARIOS, IDEAS, DATOS,
  A_MIN, A_MAX, A_STEP, A_DEF, B_MIN, B_MAX, B_STEP, B_DEF,
  C_MIN, C_MAX, C_STEP, C_DEF,
  fmtNum2, fmtM, fmtM2, fmtDeg, RETO_A2, type Escenario,
} from "./ley-senos-cosenos-data";

const LeySenosCosenosScene = dynamic(() => import("./LeySenosCosenosScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-draw-polygon fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Levantando el terreno triangular…</span>
    </div>
  ),
});

const A_COL = "#60a5fa";   // lado a
const B_COL = "#34D399";   // lado b
const C_COL = "#f5d36b";   // lado c (incógnita)
const ANGC_COL = "#fbbf24"; // ángulo C

const RETO_KEY = "cen-ley-senos-cosenos-reto";

export function LabLeySenosCosenos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [a, setA] = useState(A_DEF);
  const [b, setB] = useState(B_DEF);
  const [angC, setAngC] = useState(C_DEF);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [mostrarAngulos, setMostrarAngulos] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const dir = useRef(1);

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

  // Barrido automático del ángulo C (rebota entre los límites).
  useEffect(() => {
    if (!reproduciendo) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = ts - last;
      last = ts;
      setAngC((prev) => {
        let next = prev + dt * 0.025 * dir.current; // ~25°/s
        if (next >= C_MAX) { next = C_MAX; dir.current = -1; }
        else if (next <= C_MIN) { next = C_MIN; dir.current = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reproduciendo]);

  const t = useMemo(() => calcTri(a, b, angC), [a, b, angC]);

  const setAman = (v: number) => { setReproduciendo(false); setA(v); };
  const setBman = (v: number) => { setReproduciendo(false); setB(v); };
  const setCman = (v: number) => { setReproduciendo(false); setAngC(v); };
  const aplicar = (e: Escenario) => { setReproduciendo(false); setA(e.a); setB(e.b); setAngC(e.angC); bump(); if (sonido) audioRef.current?.blip(); };
  const reset = () => { setReproduciendo(false); setA(A_DEF); setB(B_DEF); setAngC(C_DEF); bump(); };
  const bump = () => setResetNonce((n) => n + 1);

  const objetivos = [
    { txt: "Cierra el ángulo C al mínimo: el lado c se vuelve el más corto", done: angC <= C_MIN + 2 },
    { txt: "Ábrelo al máximo: el lado c se acerca a a + b", done: angC >= C_MAX - 2 },
    { txt: "Ajusta los lados a y b para explorar el triángulo", done: a !== A_DEF || b !== B_DEF },
    { txt: "Prueba un ángulo C mayor de 90° (triángulo obtuso)", done: angC > 90 },
    { txt: "Prueba un ángulo C menor de 90° (triángulo acutángulo)", done: angC < 90 },
    { txt: "Deja C en 90°: la Ley de Cosenos se vuelve Pitágoras", done: Math.abs(angC - 90) < 0.5 },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];
  // Los objetivos se recuerdan (algunos dependían del modo y se desmarcaban
  // solos) y se convierten en la marca del laboratorio, que antes no se
  // guardaba en ninguna parte.
  const { cumplidos: cumplidosLab, total: totalLab } = useLogros(objetivos.map((o) => o.done));
  const { registraEstrellas } = useEstrellas(RETO_KEY);
  useEffect(() => {
    if (cumplidosLab === 0) return;
    const est = cumplidosLab >= totalLab ? 3 : cumplidosLab >= Math.ceil((totalLab * 2) / 3) ? 2 : 1;
    registraEstrellas(est);
  }, [cumplidosLab, totalLab, registraEstrellas]);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-draw-polygon" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Resuelve el triángulo del terreno</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: con dos lados (a = {fmtM(t.a)}, b = {fmtM(t.b)}) y el ángulo C = {fmtDeg(t.angC)}, la Ley de Cosenos da c = {fmtM(t.c)}.
      </div>
    </div>
  );

  const lectura = <>C = {fmtDeg(t.angC)} → c = {fmtM(t.c)}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <LeySenosCosenosScene
            a={a}
            b={b}
            angC={angC}
            accent={accent}
            mostrarAngulos={mostrarAngulos}
            autoRotate={autoRotate}
            pausado={false}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={reproduciendo ? "fa-pause" : "fa-play"} titulo={reproduciendo ? "Pausar el barrido del ángulo C" : "Barrer el ángulo C"} activo={reproduciendo} onClick={() => setReproduciendo((p) => !p)} />
          <BotonHerramienta icono="fa-angle-up" titulo={mostrarAngulos ? "Ocultar ángulos A y B" : "Ver ángulos A y B"} activo={mostrarAngulos} onClick={() => setMostrarAngulos((v) => !v)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={<MedidorLadoC t={t} compacto />}
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Dos lados y el ángulo entre ellos" icono="fa-ruler-combined">
                <Deslizador label="C · ángulo entre a y b (incluido)" icon="fa-angle-up" colr={ANGC_COL}
                  valor={fmtDeg(t.angC)} min={C_MIN} max={C_MAX} step={C_STEP} value={angC}
                  onChange={setCman} hintL={`${C_MIN}°`} hintR={`${C_MAX}°`} />
                <Deslizador label="a · lado conocido" icon="fa-ruler-horizontal" colr={A_COL}
                  valor={fmtM(t.a)} min={A_MIN} max={A_MAX} step={A_STEP} value={a}
                  onChange={setAman} hintL={`${A_MIN} m`} hintR={`${A_MAX} m`} />
                <Deslizador label="b · lado conocido" icon="fa-ruler-horizontal" colr={B_COL}
                  valor={fmtM(t.b)} min={B_MIN} max={B_MAX} step={B_STEP} value={b}
                  onChange={setBman} hintL={`${B_MIN} m`} hintR={`${B_MAX} m`} />
              </Bloque>

              <Bloque titulo="La consecuencia: el lado c" icono="fa-circle-question">
                <MedidorLadoC t={t} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="lado c" value={fmtM(t.c)} col={C_COL} />
                  <Dato label="área" value={fmtM2(t.area)} col={accent} />
                  <Dato label="ángulo A" value={fmtDeg(t.angA)} col={ANG_LABEL_COL} />
                  <Dato label="ángulo B" value={fmtDeg(t.angB)} col={ANG_LABEL_COL} />
                </div>
              </Bloque>

              <Bloque titulo="Situaciones" icono="fa-bullseye">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))", gap: 8 }}>
                  {ESCENARIOS.map((e) => {
                    const on = Math.abs(t.a - e.a) < 0.5 && Math.abs(t.b - e.b) < 0.5 && Math.abs(t.angC - e.angC) < 0.5;
                    return (
                      <button key={e.label} type="button" title={e.desc} onClick={() => aplicar(e)}
                        style={{
                          cursor: "pointer", display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", borderRadius: 12,
                          fontSize: 14, fontWeight: 800, color: on ? "#fff" : T.text2, textAlign: "left",
                          border: `1px solid ${on ? accent : T.line}`, background: on ? `rgba(${color.rgba},0.2)` : T.inset,
                        }}>
                        <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                        {e.label}
                      </button>
                    );
                  })}
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
            <RetoNumericoCard
              reto={RETO_A2}
              accent={accent}
              aprobado={ejercicioAprobado}
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Las dos leyes de los triángulos oblicuángulos" icono="fa-scroll">
                {LEYES.map((l) => (
                  <div key={l.nombre} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${l.color}33`, background: "rgba(4,10,22,0.4)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: l.color }} />
                      <span style={{ fontWeight: 900, color: "#fff" }}>{l.nombre}</span>
                    </div>
                    <div style={{ fontWeight: 900, color: l.color, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>{l.formula}</div>
                    <div style={{ color: T.text2 }}>{l.uso}</div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="El cálculo, paso a paso" icono="fa-calculator">
                <PasoRow n={1} texto="Conozco dos lados y el ángulo entre ellos:" valor={`a = ${fmtM(t.a)},  b = ${fmtM(t.b)},  C = ${fmtDeg(t.angC)}`} col={A_COL} />
                <PasoRow n={2} texto="Aplico la Ley de Cosenos:" valor={`c² = a² + b² − 2ab·cos C`} col={ANGC_COL} />
                <PasoRow n={3} texto="Sustituyo los valores:" valor={`c² = ${fmtNum2(t.a * t.a + t.b * t.b - 2 * t.a * t.b * Math.cos(t.radC))}`} col={C_COL} />
                <PasoRow n={4} texto="Saco la raíz cuadrada:" valor={`c = ${fmtM(t.c)}`} col={accent} />
                <PasoRow n={5} texto="Con la Ley de Senos hallo los ángulos:" valor={`A = ${fmtDeg(t.angA)},  B = ${fmtDeg(t.angB)}`} col={ANG_LABEL_COL} />
              </Bloque>
              <Bloque titulo="Anatomía del triángulo" icono="fa-vector-square">
                <LadoRow label="Lado a (conocido)" valor={fmtM(t.a)} col={A_COL} icon="fa-ruler" />
                <LadoRow label="Lado b (conocido)" valor={fmtM(t.b)} col={B_COL} icon="fa-ruler" />
                <LadoRow label="Lado c (la incógnita)" valor={fmtM(t.c)} col={C_COL} icon="fa-circle-question" />
                <LadoRow label="Ángulo C (entre a y b)" valor={fmtDeg(t.angC)} col={ANGC_COL} icon="fa-angle-up" />
                <p style={{ margin: 0, color: T.text2 }}>
                  El ángulo <strong style={{ color: ANGC_COL }}>C</strong> está entre los lados conocidos; el lado <strong style={{ color: C_COL }}>c</strong> que buscas es el que está <strong>enfrente</strong> de él (su opuesto).
                </p>
              </Bloque>
              <Bloque titulo="Generaliza a Pitágoras" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Cuando C = 90°, cos 90° = 0 y el término −2ab·cos C desaparece: la Ley de Cosenos se vuelve <strong style={{ color: "#fff" }}>c² = a² + b²</strong>, ¡el Teorema de Pitágoras! Por eso sirve para <strong style={{ color: C_COL }}>cualquier</strong> triángulo, no solo los rectángulos. {t.angC > 88 && t.angC < 92 ? "Estás justo en ese caso ahora." : "Prueba el escenario «Casi recto» para verlo."}
                </p>
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
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={LEY_SENOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Cálculo <strong>exacto</strong>: el lado c sale de la Ley de Cosenos (c = √(a²+b²−2ab·cos C)) y los ángulos A y B de la Ley de Senos/Cosenos; siempre A + B + C = 180°. La escena centra y escala el terreno para encuadrarlo, pero los valores numéricos siempre son reales.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

const ANG_LABEL_COL = "#c4b5fd";

/* ── Medidor: dónde cae c entre |a − b| (C cerrado) y a + b (C abierto) ───── */
function MedidorLadoC({ t, compacto = false }: { t: ReturnType<typeof calcTri>; compacto?: boolean }) {
  const lo = Math.abs(t.a - t.b);
  const hi = t.a + t.b;
  const span = Math.max(0.0001, hi - lo);
  const pos = Math.min(100, Math.max(0, ((t.c - lo) / span) * 100));
  const pit = Math.min(100, Math.max(0, ((Math.hypot(t.a, t.b) - lo) / span) * 100));
  return (
    <div style={{ display: "grid", gap: 4, width: compacto ? 210 : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>Lado c</span><span style={{ fontFamily: "ui-monospace, monospace", color: C_COL }}>{fmtM(t.c)}</span>
      </div>
      <div style={{ position: "relative", height: compacto ? 10 : 14, borderRadius: 7, background: "rgba(255,255,255,0.1)" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${pos}%`, background: C_COL, borderRadius: 7, transition: "width 100ms linear" }} />
        <div title="c² = a² + b² (C = 90°)" style={{ position: "absolute", top: -3, bottom: -3, left: `${pit}%`, width: 3, background: "#fff", borderRadius: 2 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#b7c4dc" }}>
        <span>{fmtM(lo)}</span><span>▎= Pitágoras</span><span>{fmtM(hi)}</span>
      </div>
    </div>
  );
}

/* ── Fila de un paso del cálculo ─────────────────────────────────────────── */
function PasoRow({ n, texto, valor, col }: { n: number; texto: string; valor: string; col: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}30` }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: col, flexShrink: 0 }}>{n}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.35 }}>{texto}</div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", marginTop: 2 }}>{valor}</div>
      </div>
    </div>
  );
}

/* ── Fila de un lado/ángulo del triángulo ────────────────────────────────── */
function LadoRow({ label, valor, col, icon }: { label: string; valor: string; col: string; icon: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${col}33` }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: col, background: `${col}1e`, flexShrink: 0 }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
    </div>
  );
}
