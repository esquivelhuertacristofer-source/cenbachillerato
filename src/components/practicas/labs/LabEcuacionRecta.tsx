"use client";

/**
 * Laboratorio 3D — Ecuación de la recta en el plano cartesiano.
 * Práctica experimental para PM-III-P10-A2
 * ("Grafico la ecuación de la recta y sus soluciones"; progresión 2 / O2).
 *
 * Una ecuación lineal con DOS incógnitas se DIBUJA como una RECTA en el plano
 * cartesiano. La forma pendiente–ordenada y = m·x + b da sentido geométrico a
 * cada número: la PENDIENTE m es la inclinación (sube/baja por cada paso en x),
 * la ORDENADA b es donde cruza el eje Y (0, b) y la RAÍZ es donde cruza X. Cada
 * punto de la recta es una solución: una ecuación con dos incógnitas tiene
 * infinitas soluciones.
 *
 * Experimento central: el alumno mueve m y b y ve cómo gira y se desplaza la
 * recta, y desliza una SONDA (x) para LEER una solución (x, y) con guías hasta
 * los ejes; un medidor muestra cuánto cambia y por cada paso de 1 en x.
 * Pensamiento Matemático III — relación álgebra↔geometría (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { ECUACION_RECTA_FICHA } from "./ecuacion-recta-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import {
  DEFAULTS,
  TAXI,
  evalY,
  raizX,
  solucionesEnteras,
  sentido,
  fmtNum,
  fmtRecta,
  fmtEstandar,
  M_MIN, M_MAX, M_STEP, B_MIN, B_MAX, B_STEP,
  RETO_A2,
  RANGO,
} from "./ecuacion-recta-data";
import { LabSfx } from "./lab-audio";

const EcuacionRectaScene = dynamic(() => import("./EcuacionRectaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-line fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const ORO = "#ffd24a";
const CIAN = "#7fd4ff";

const RETO_KEY = "cen-ecuacion-recta-reto";

const X0_DEF = 2;

export function LabEcuacionRecta({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [m, setM] = useState(DEFAULTS.m);
  const [b, setB] = useState(DEFAULTS.b);
  const [x0, setX0] = useState(X0_DEF);
  const [showTriangulo, setShowTriangulo] = useState(true);
  const [showSoluciones, setShowSoluciones] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);

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

  // objetivos
  const [vioOrdenada] = useState(true);
  const [movioX, setMovioX] = useState(false);
  const [movioM, setMovioM] = useState(false);
  const [movioB, setMovioB] = useState(false);
  const [vioSoluciones, setVioSoluciones] = useState(true);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarX = (v: number) => { setX0(v); setMovioX(true); if (sonido) audioRef.current?.blip(); };
  const cambiarM = (v: number) => { setM(v); setMovioM(true); if (sonido) audioRef.current?.blip(); };
  const cambiarB = (v: number) => { setB(v); setMovioB(true); if (sonido) audioRef.current?.blip(); };
  const toggleTriangulo = () => { setShowTriangulo((t) => !t); if (sonido) audioRef.current?.blip(); };
  const toggleSoluciones = () => { setShowSoluciones((s) => !s); setVioSoluciones(true); if (sonido) audioRef.current?.blip(); };

  const reset = () => {
    setM(DEFAULTS.m); setB(DEFAULTS.b); setX0(X0_DEF);
    setShowTriangulo(true); setShowSoluciones(true);
    bump();
  };

  // magnitudes matemáticas (deterministas)
  const xr = useMemo(() => raizX(m, b), [m, b]);
  const sols = useMemo(() => solucionesEnteras(m, b), [m, b]);
  const recta = useMemo(() => fmtRecta(m, b), [m, b]);
  const estandar = useMemo(() => fmtEstandar(m, b), [m, b]);
  const dir = useMemo(() => sentido(m), [m]);
  const y0 = evalY(m, b, x0);
  const fuera = Math.abs(y0) > RANGO;

  const raizTxt = xr === null ? "no cruza el eje X" : `x = ${fmtNum(xr, 2)}`;
  const dirTxt = dir === "sube" ? "la recta SUBE" : dir === "baja" ? "la recta BAJA" : "la recta es HORIZONTAL";

  // escenario del taxi: costo y = 1.07·x + 8.74 a una distancia dada (en cientos de metros)
  const taxiX = 30; // 30 × 100 m = 3 km
  const costoTaxi = useMemo(() => evalY(TAXI.m, TAXI.b, taxiX), []);

  const objetivos = [
    { txt: "Desliza el punto: mueve x y lee la solución (x, y) sobre la recta", done: movioX },
    { txt: "Identifica la ordenada al origen (0, b)", done: vioOrdenada },
    { txt: "Gira la recta moviendo la pendiente m", done: movioM },
    { txt: "Desliza la recta moviendo b", done: movioB },
    { txt: "Observa que hay muchas soluciones", done: vioSoluciones },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-line" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Una ecuación lineal se dibuja como una recta</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: y = m·x + b traza una recta en el plano cartesiano. La pendiente m la inclina y la ordenada b la corre arriba o abajo; cada punto de la recta es una solución.
      </div>
    </div>
  );

  // Medidor: por cada paso de 1 en x, cuánto cambia y (barra desde el centro).
  const medidor = (compacto: boolean) => {
    const frac = Math.min(1, Math.abs(m) / Math.max(Math.abs(M_MIN), Math.abs(M_MAX)));
    const col = m > 0 ? VERDE : m < 0 ? "#fb923c" : T.text3;
    return (
      <div style={{ display: "grid", gap: 4, width: compacto ? 190 : undefined }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>Por cada paso de 1 en x, y cambia</div>
        <div style={{ position: "relative", height: 12, borderRadius: 6, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: m >= 0 ? "50%" : `${50 - frac * 50}%`, width: `${frac * 50}%`, background: col, transition: "all 120ms linear" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, background: "#fff" }} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>
          {m > 0 ? "+" : ""}{fmtNum(m, 2)} · {dir}
        </div>
      </div>
    );
  };

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <EcuacionRectaScene
            m={m}
            b={b}
            x0={x0}
            accent={accent}
            showTriangulo={showTriangulo}
            showSoluciones={showSoluciones}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-ruler-combined" titulo={showTriangulo ? "Ocultar el triángulo de pendiente" : "Ver el triángulo de pendiente"} activo={showTriangulo} onClick={toggleTriangulo} />
          <BotonHerramienta icono="fa-braille" titulo={showSoluciones ? "Ocultar soluciones enteras" : "Mostrar soluciones enteras"} activo={showSoluciones} onClick={toggleSoluciones} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <div style={{ fontSize: 15, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{recta}</div>
          {medidor(true)}
        </>
      }
      lectura={fuera ? <>x = {fmtNum(x0, 1)} cae fuera del plano</> : <>{recta} → en x = {fmtNum(x0, 1)}, y = {fmtNum(y0, 2)}</>}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Mueve los números de y = m·x + b" icono="fa-sliders">
                <Deslizador label="Punto sobre la recta (x)" icon="fa-location-dot" colr="#ffffff"
                  valor={fmtNum(x0, 1)} min={-RANGO} max={RANGO} step={0.5} value={x0} onChange={cambiarX}
                  hintL="izquierda" hintR="derecha" />
                <Deslizador label="Pendiente (m)" icon="fa-angle-up" colr={accent}
                  valor={fmtNum(m, 2)} min={M_MIN} max={M_MAX} step={M_STEP} value={m} onChange={cambiarM}
                  hintL="negativa: baja" hintR="positiva: sube" />
                <Deslizador label="Ordenada al origen (b)" icon="fa-arrows-up-down" colr={ORO}
                  valor={fmtNum(b, 1)} min={B_MIN} max={B_MAX} step={B_STEP} value={b} onChange={cambiarB}
                  hintL="recta hacia abajo" hintR="hacia arriba" />
              </Bloque>

              <Bloque titulo="La pendiente, medida" icono="fa-gauge-high">
                {medidor(false)}
                <p style={{ margin: 0, color: T.text2 }}>
                  Con <strong style={{ color: accent }}>m = {fmtNum(m, 2)}</strong>, {dirTxt}. La <strong style={{ color: ORO }}>ordenada b = {fmtNum(b, 1)}</strong> dice dónde cruza el eje Y.
                </p>
              </Bloque>

              <Bloque titulo="Las partes de la recta" icono="fa-square-root-variable">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="ordenada (0, b)" value={`(0, ${fmtNum(b, 1)})`} col={ORO} />
                  <Dato label="pendiente m" value={fmtNum(m, 2)} col={accent} />
                  <Dato label="raíz (cruce con X)" value={raizTxt} col={CIAN} />
                  <Dato label="soluciones enteras" value={`${sols.length}`} col={VERDE} />
                  <Dato label="punto elegido" value={fuera ? "fuera del plano" : `(${fmtNum(x0, 1)}, ${fmtNum(y0, 2)})`} col="#ffffff" />
                  <Dato label="forma con dos incógnitas" value={estandar} col={VERDE} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  Cada punto de la recta es una <strong style={{ color: VERDE }}>solución</strong>: por eso una ecuación con dos incógnitas tiene <strong>infinitas</strong> soluciones.
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
              <Bloque titulo="Del álgebra a la geometría" icono="fa-chart-line">
                <p style={{ margin: 0, color: T.text2 }}>
                  La ecuación <strong style={{ color: T.text }}>y = m·x + b</strong> y la <strong style={{ color: accent }}>recta</strong> son lo mismo visto de dos formas. Una <strong>ecuación con dos incógnitas</strong> (x, y) no tiene una sola respuesta: tiene <em>todas</em> las parejas (x, y) que caen sobre la recta.
                </p>
              </Bloque>

              <Bloque titulo="Las partes" icono="fa-puzzle-piece">
                <Parte col={accent} icon="fa-angle-up" titulo="Pendiente (m)">
                  La inclinación: cuánto sube o baja y por cada paso de 1 en x (m = subida ÷ avance). m &gt; 0 sube, m &lt; 0 baja, m = 0 es horizontal.
                </Parte>
                <Parte col={ORO} icon="fa-arrows-up-down" titulo="Ordenada al origen (b)">
                  El punto (0, b) donde la recta cruza el eje Y. Cambiar b corre la recta arriba o abajo sin girarla.
                </Parte>
                <Parte col={CIAN} icon="fa-arrows-left-right-to-line" titulo="Raíz (x = −b/m)">
                  Donde la recta cruza el eje X (y = 0). Una recta horizontal (m = 0) no tiene raíz.
                </Parte>
                <Parte col={VERDE} icon="fa-braille" titulo="Soluciones (los puntos)">
                  Cada punto de la recta es un par (x, y) que cumple la ecuación: hay infinitas soluciones.
                </Parte>
              </Bloque>

              <Bloque titulo="El plano cartesiano" icono="fa-border-all">
                <p style={{ margin: 0, color: T.text2 }}>
                  Dos ejes <strong style={{ color: T.text }}>perpendiculares</strong> —horizontal <strong>(X)</strong> y vertical <strong>(Y)</strong>— se cruzan en el <strong>origen (0, 0)</strong> y dividen el plano en cuatro <strong>cuadrantes</strong>. Cada punto se nombra con un par ordenado (x, y): primero cuánto a la derecha/izquierda, luego cuánto arriba/abajo.
                </p>
              </Bloque>

              <Bloque titulo="En la vida real (México)" icono="fa-taxi">
                <p style={{ margin: 0, color: T.text2 }}>
                  Una recta modela <strong>todo lo que crece a ritmo constante</strong>: la tarifa de un taxi de la CDMX (banderazo + costo por distancia), el recibo de luz de CFE (cargo fijo + consumo), el saldo de un ahorro semanal, o la distancia de un autobús a velocidad constante. La <strong>ordenada</strong> es el punto de partida; la <strong>pendiente</strong>, el ritmo.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="banderazo (ordenada b)" value={`$${fmtNum(TAXI.b, 2)}`} col={ORO} />
                  <Dato label="por cada 100 m (m)" value={`$${fmtNum(TAXI.m, 2)}`} col={accent} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  El costo es <strong style={{ color: accent, fontFamily: "ui-monospace, monospace" }}>y = {fmtNum(TAXI.m, 2)}·x + {fmtNum(TAXI.b, 2)}</strong>. A x = 0 (sin avanzar) ya cobra el <strong style={{ color: ORO }}>banderazo</strong>; en un viaje de <strong>3 km</strong> (x = {taxiX}) el costo es <strong style={{ color: VERDE, fontFamily: "ui-monospace, monospace" }}>${fmtNum(costoTaxi, 2)}</strong>. La ordenada es lo fijo; la pendiente, lo que sube por distancia.
                </p>
              </Bloque>

              <Bloque titulo="Pista" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Empieza con la recta por defecto <strong style={{ color: accent }}>y = 0.5x + 1</strong>: cruza Y en <strong style={{ color: ORO }}>(0, 1)</strong> y sube media unidad por cada paso. Luego sube <strong>m</strong> para inclinarla más, o mueve <strong>b</strong> para deslizarla sin girarla.
                </p>
              </Bloque>

              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ECUACION_RECTA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Tarjeta de "parte" en la teoría ─────────────────────────────────── */
function Parte({ col, icon, titulo, children }: { col: string; icon: string; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: col, background: `${col}1f` }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
        <strong style={{ color: T.text, display: "block", marginBottom: 2 }}>{titulo}</strong>
        {children}
      </div>
    </div>
  );
}
