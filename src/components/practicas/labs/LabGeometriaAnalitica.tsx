"use client";

/**
 * Laboratorio 3D — Geometría analítica: distancia, punto medio y pendiente entre
 * dos puntos. Práctica experimental para PM-IV-P06-A2 (ejercicio_matematico;
 * progresión 6).
 *
 * El alumno coloca dos puntos P₁ y P₂ en un plano cartesiano flotante y, en tres
 * modos, ve cómo se construyen con los mismos catetos Δx y Δy:
 *   · DISTANCIA  d = √(Δx² + Δy²): cuadrados reales sobre los catetos y la
 *     hipotenusa, y un medidor que muestra que Δx² + Δy² llena d²  (EXPERIMENTO
 *     CENTRAL: Pitágoras se ve, no solo se calcula),
 *   · PUNTO MEDIO M = promedio de coordenadas,
 *   · PENDIENTE m = Δy/Δx: la escalera «avanza 1, sube m».
 * Cálculo exacto.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { GEOMETRIA_FICHA } from "./geometria-analitica-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import {
  calcGeom, FORMULAS, ESCENARIOS, IDEAS, DATOS,
  MIN, MAX, STEP, X1_DEF, Y1_DEF, X2_DEF, Y2_DEF,
  fmtNum2, fmtInt, fmtPar, fmtPend, RETO_A2, type Escenario, type Geom,
} from "./geometria-analitica-data";
import type { ModoGeo } from "./GeometriaAnaliticaScene";
import { LabSfx } from "./lab-audio";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-geometria-analitica-reto";

const GeometriaAnaliticaScene = dynamic(() => import("./GeometriaAnaliticaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-line fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Trazando el plano cartesiano…</span>
    </div>
  ),
});

const P1_COL = "#60a5fa";   // punto P₁
const P2_COL = "#f5d36b";   // punto P₂
const SEG_COL = "#f97316";  // distancia
const DX_COL = "#34D399";   // Δx
const DY_COL = "#c4b5fd";   // Δy
const MID_COL = "#fb7185";  // punto medio
const PEND_COL = "#fbbf24"; // pendiente

const MODOS: { id: ModoGeo; etiqueta: string; icono: string }[] = [
  { id: "distancia", etiqueta: "Distancia", icono: "fa-ruler-combined" },
  { id: "medio", etiqueta: "Punto medio", icono: "fa-crosshairs" },
  { id: "pendiente", etiqueta: "Pendiente", icono: "fa-angle-up" },
];

export function LabGeometriaAnalitica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<ModoGeo>("distancia");
  const [x1, setX1] = useState(X1_DEF);
  const [y1, setY1] = useState(Y1_DEF);
  const [x2, setX2] = useState(X2_DEF);
  const [y2, setY2] = useState(Y2_DEF);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [mostrarTriangulo, setMostrarTriangulo] = useState(true);
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

  // Barrido automático de x₂ (rebota entre los límites): distancia y pendiente
  // cambian a la vista; al cruzar x₁ la recta se vuelve vertical (m indefinida).
  useEffect(() => {
    if (!reproduciendo) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = ts - last;
      last = ts;
      setX2((prev) => {
        let next = prev + dt * 0.0028 * dir.current; // ~2.8 u/s
        if (next >= MAX) { next = MAX; dir.current = -1; }
        else if (next <= MIN) { next = MIN; dir.current = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reproduciendo]);

  const g = useMemo(() => calcGeom(x1, y1, x2, y2), [x1, y1, x2, y2]);

  const bump = () => setResetNonce((n) => n + 1);
  const setX1man = (v: number) => { setReproduciendo(false); setX1(v); };
  const setY1man = (v: number) => { setReproduciendo(false); setY1(v); };
  const setX2man = (v: number) => { setReproduciendo(false); setX2(v); };
  const setY2man = (v: number) => { setReproduciendo(false); setY2(v); };
  const aplicar = (e: Escenario) => { setReproduciendo(false); setX1(e.x1); setY1(e.y1); setX2(e.x2); setY2(e.y2); bump(); if (sonido) audioRef.current?.blip(); };
  const reset = () => { setReproduciendo(false); setX1(X1_DEF); setY1(Y1_DEF); setX2(X2_DEF); setY2(Y2_DEF); bump(); };
  const cambiarModo = (id: string) => { setModo(id as ModoGeo); if (sonido) audioRef.current?.blip(); };

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-line" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Mide entre dos puntos del plano</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: entre P₁ {fmtPar(g.x1, g.y1)} y P₂ {fmtPar(g.x2, g.y2)} la distancia es d = {fmtNum2(g.dist)}, el punto medio M = {fmtPar(g.mx, g.my)} y la pendiente m = {fmtPend(g)}.
      </div>
    </div>
  );

  // Una sola frase corta, según el modo
  const lectura =
    modo === "distancia"
      ? <>d = √({fmtNum2(g.dx)}² + {fmtNum2(g.dy)}²) = {fmtNum2(g.dist)}</>
      : modo === "medio"
        ? <>M = {fmtPar(g.mx, g.my)}: el promedio de P₁ y P₂</>
        : <>m = Δy/Δx = {fmtPend(g)}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <GeometriaAnaliticaScene
            modo={modo}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            accent={accent}
            mostrarTriangulo={mostrarTriangulo}
            autoRotate={autoRotate}
            pausado={false}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{ opciones: MODOS, valor: modo, cambiar: cambiarModo }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={reproduciendo ? "fa-pause" : "fa-play"} titulo={reproduciendo ? "Pausar el barrido de x₂" : "Mover x₂ automáticamente"} activo={reproduciendo} onClick={() => setReproduciendo((p) => !p)} />
          <BotonHerramienta icono={mostrarTriangulo ? "fa-eye" : "fa-eye-slash"} titulo="Triángulo Δx / Δy (modo Pendiente)" activo={mostrarTriangulo} onClick={() => setMostrarTriangulo((v) => !v)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <LegItem col={P1_COL} txt="P₁" />
          <LegItem col={P2_COL} txt="P₂" />
          {modo === "distancia" && (
            <>
              <LegItem col={DX_COL} txt="Δx (cateto)" />
              <LegItem col={DY_COL} txt="Δy (cateto)" />
              <LegItem col={SEG_COL} txt="d (hipotenusa)" />
              <MedidorPitagoras g={g} compacto />
            </>
          )}
          {modo === "medio" && <LegItem col={MID_COL} txt="M (punto medio)" />}
          {modo === "pendiente" && <LegItem col={PEND_COL} txt="avanza 1, sube m" />}
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Mueve P₂ y mira cómo los cuadrados verde y morado llenan el naranja (Pitágoras)", done: modo === "distancia" && (x2 !== X2_DEF || y2 !== Y2_DEF) },
        { txt: "Arma el triángulo 3-4-5: Δx = 3 y Δy = 4, ¿cuánto vale d?", done: Math.abs(g.dx) === 3 && Math.abs(g.dy) === 4 },
        { txt: "Mueve P₁ y P₂ sobre el plano cartesiano", done: x1 !== X1_DEF || y1 !== Y1_DEF || x2 !== X2_DEF || y2 !== Y2_DEF },
        { txt: "Mira el triángulo rectángulo: la distancia es su hipotenusa (Pitágoras)", done: mostrarTriangulo },
        { txt: "Consigue una recta horizontal (Δy = 0, pendiente m = 0)", done: Math.abs(g.dy) < 0.05 },
        { txt: "Consigue una recta vertical (Δx = 0, pendiente indefinida)", done: !g.pendienteDef },
        { txt: "Deja correr el barrido automático y sigue cómo cambian d, M y m", done: reproduciendo },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Coloca los dos puntos" icono="fa-sliders">
                <Deslizador label="P₁ · x₁" icon="fa-arrows-left-right" colr={P1_COL} valor={fmtInt(g.x1)} min={MIN} max={MAX} step={STEP} value={x1} onChange={setX1man} hintL={`${MIN}`} hintR={`${MAX}`} />
                <Deslizador label="P₁ · y₁" icon="fa-arrows-up-down" colr={P1_COL} valor={fmtInt(g.y1)} min={MIN} max={MAX} step={STEP} value={y1} onChange={setY1man} hintL={`${MIN}`} hintR={`${MAX}`} />
                <Deslizador label="P₂ · x₂" icon="fa-arrows-left-right" colr={P2_COL} valor={fmtInt(g.x2)} min={MIN} max={MAX} step={STEP} value={x2} onChange={setX2man} hintL={`${MIN}`} hintR={`${MAX}`} />
                <Deslizador label="P₂ · y₂" icon="fa-arrows-up-down" colr={P2_COL} valor={fmtInt(g.y2)} min={MIN} max={MAX} step={STEP} value={y2} onChange={setY2man} hintL={`${MIN}`} hintR={`${MAX}`} />
              </Bloque>

              <Bloque titulo="Situaciones" icono="fa-shapes">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                  {ESCENARIOS.map((e) => {
                    const on = g.x1 === e.x1 && g.y1 === e.y1 && g.x2 === e.x2 && g.y2 === e.y2;
                    return (
                      <button key={e.label} type="button" title={e.desc} onClick={() => aplicar(e)}
                        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, textAlign: "left", fontSize: 14, fontWeight: 800,
                          border: `1px solid ${on ? accent : T.line}`, background: on ? `rgba(${color.rgba},0.2)` : T.inset, color: on ? "#fff" : T.text2 }}>
                        <i className={`fa-solid ${e.icono}`} style={{ color: accent }} aria-hidden />
                        {e.label}
                      </button>
                    );
                  })}
                </div>
              </Bloque>

              <Bloque titulo="Lecturas" icono="fa-gauge-high">
                {modo === "distancia" && <MedidorPitagoras g={g} />}
                {modo === "pendiente" && <DialPendiente g={g} />}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="distancia d" value={fmtNum2(g.dist)} col={SEG_COL} />
                  <Dato label="punto medio M" value={fmtPar(g.mx, g.my)} col={MID_COL} />
                  <Dato label="pendiente m" value={fmtPend(g)} col={PEND_COL} />
                  <Dato label="inclinación" value={`${fmtNum2(g.anguloDeg)}°`} col={accent} />
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
              <Bloque titulo="El cálculo, paso a paso" icono="fa-calculator">
                <p style={{ margin: 0, color: accent, fontWeight: 800 }}>De P₁ {fmtPar(g.x1, g.y1)} a P₂ {fmtPar(g.x2, g.y2)}</p>
                <PasoRow n={1} texto="Calculo los catetos Δx y Δy:" valor={`Δx = ${fmtNum2(g.dx)},  Δy = ${fmtNum2(g.dy)}`} col={DX_COL} />
                <PasoRow n={2} texto="Distancia (Pitágoras):" valor={`d = √(${fmtNum2(g.dx)}² + ${fmtNum2(g.dy)}²) = ${fmtNum2(g.dist)}`} col={SEG_COL} />
                <PasoRow n={3} texto="Punto medio (promedio de coordenadas):" valor={`M = ${fmtPar(g.mx, g.my)}`} col={MID_COL} />
                <PasoRow n={4} texto="Pendiente (inclinación):" valor={g.pendienteDef ? `m = ${fmtNum2(g.dy)} / ${fmtNum2(g.dx)} = ${fmtPend(g)}` : "m = Δy / 0 → indefinida (recta vertical)"} col={PEND_COL} />
              </Bloque>
              <Bloque titulo="Las tres fórmulas" icono="fa-scroll">
                {FORMULAS.map((f) => (
                  <div key={f.nombre} style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${f.color}44`, background: "rgba(4,10,22,0.4)" }}>
                    <div style={{ fontWeight: 900, color: "#fff" }}>{f.nombre}</div>
                    <div style={{ fontWeight: 900, color: f.color, fontFamily: "ui-monospace, monospace", margin: "4px 0", overflowWrap: "anywhere" }}>{f.formula}</div>
                    <div style={{ color: T.text2 }}>{f.uso}</div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Anatomía" icono="fa-vector-square">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="cateto Δx" value={fmtNum2(g.dx)} col={DX_COL} />
                  <Dato label="cateto Δy" value={fmtNum2(g.dy)} col={DY_COL} />
                  <Dato label="hipotenusa d" value={fmtNum2(g.dist)} col={SEG_COL} />
                  <Dato label="pendiente m" value={fmtPend(g)} col={PEND_COL} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  Los <strong style={{ color: DX_COL }}>mismos catetos</strong> Δx y Δy sirven para todo: la <strong style={{ color: SEG_COL }}>distancia</strong> es su hipotenusa y la <strong style={{ color: PEND_COL }}>pendiente</strong> es Δy entre Δx.
                </p>
              </Bloque>
              <Bloque titulo="La distancia es Pitágoras" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  El segmento P₁P₂ es la <strong style={{ color: SEG_COL }}>hipotenusa</strong> de un triángulo rectángulo cuyos catetos son Δx y Δy. Por eso d = √(Δx² + Δy²) <em>es</em> el Teorema de Pitágoras. {Math.abs(g.dx) < 0.05 ? "Ahora Δx = 0: la recta es vertical y la pendiente queda indefinida." : (Math.abs(g.dy) < 0.05 ? "Ahora Δy = 0: la recta es horizontal y la pendiente vale 0." : "Mueve los puntos y observa cómo cambian los tres a la vez.")}
                </p>
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
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={GEOMETRIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Cálculo <strong>exacto</strong>: la distancia sale de d = √(Δx² + Δy²), el punto medio del promedio de coordenadas y la pendiente de m = Δy/Δx (indefinida cuando Δx = 0, recta vertical). El plano se dibuja a <strong>escala fija</strong> sobre una rejilla, así que las posiciones son reales.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor de Pitágoras: Δx² + Δy² llena d² ────────────────────────────── */
function MedidorPitagoras({ g, compacto = false }: { g: Geom; compacto?: boolean }) {
  const ax = g.dx * g.dx;
  const ay = g.dy * g.dy;
  const total = Math.max(ax + ay, 1);
  const h = compacto ? 10 : 16;
  const fila = (children: React.ReactNode) => (
    <div style={{ display: "flex", height: h, borderRadius: 6, overflow: "hidden", background: "rgba(255,255,255,0.1)" }}>{children}</div>
  );
  return (
    <div style={{ display: "grid", gap: compacto ? 5 : 8, width: compacto ? 176 : undefined, marginTop: compacto ? 4 : 0 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#dce6f5", fontFamily: "ui-monospace, monospace" }}>
        {fmtNum2(ax)} + {fmtNum2(ay)} = {fmtNum2(g.dist * g.dist)}
      </div>
      {fila(
        <>
          <div style={{ width: `${(ax / total) * 100}%`, background: DX_COL, transition: "width 120ms linear" }} />
          <div style={{ width: `${(ay / total) * 100}%`, background: DY_COL, transition: "width 120ms linear" }} />
        </>,
      )}
      {fila(<div style={{ width: "100%", background: SEG_COL }} />)}
      {!compacto && (
        <div style={{ fontSize: 14, color: T.text2 }}>
          Los cuadrados de los catetos (Δx² verde + Δy² morado) llenan justo el cuadrado de la hipotenusa (d², naranja).
        </div>
      )}
    </div>
  );
}

/* ── Dial de pendiente: una aguja que se inclina con la recta ─────────────── */
function DialPendiente({ g }: { g: Geom }) {
  const a = (Math.atan2(g.dy, g.dx) * 180) / Math.PI; // −180…180
  const vertical = !g.pendienteDef;
  // pliega a −90…90 (la recta no tiene sentido)
  const t = a > 90 ? a - 180 : a < -90 ? a + 180 : a;
  const rad = (t * Math.PI) / 180;
  const R = 62;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg viewBox="-80 -80 160 100" width="100%" style={{ maxWidth: 200 }} aria-hidden>
        <path d="M -70 0 A 70 70 0 0 1 70 0" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" />
        <line x1={-R * Math.cos(rad)} y1={R * Math.sin(rad)} x2={R * Math.cos(rad)} y2={-R * Math.sin(rad)} stroke={PEND_COL} strokeWidth="6" strokeLinecap="round" />
        <circle cx="0" cy="0" r="6" fill="#fff" />
        <line x1="-70" y1="0" x2="70" y2="0" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
      <div style={{ fontSize: 15, fontWeight: 800, color: PEND_COL }}>
        {vertical ? "Vertical: m indefinida" : g.pendiente === 0 ? "Horizontal: m = 0" : g.pendiente > 0 ? `Sube: m = ${fmtPend(g)}` : `Baja: m = ${fmtPend(g)}`}
      </div>
    </div>
  );
}

/* ── Fila de un paso del cálculo ─────────────────────────────────────────── */
function PasoRow({ n, texto, valor, col }: { n: number; texto: string; valor: string; col: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}40` }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: col, flexShrink: 0 }}>{n}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: T.text2, lineHeight: 1.35 }}>{texto}</div>
        <div style={{ fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", marginTop: 2, overflowWrap: "anywhere" }}>{valor}</div>
      </div>
    </div>
  );
}

/* ── Item de leyenda ─────────────────────────────────────────────────────── */
function LegItem({ col, txt }: { col: string; txt: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
      <span style={{ width: 18, height: 0, borderTop: `3px solid ${col}`, flexShrink: 0 }} />
      {txt}
    </div>
  );
}
