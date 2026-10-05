"use client";

/**
 * Laboratorio 3D — Funciones de 1.º y 2.º grado y sus transformaciones.
 * Práctica experimental para PM-IV-P02-A2 (ejercicio_matematico "Modelo la
 * trayectoria de un balón con una función cuadrática"; progresión 2).
 *
 * El alumno parte de la función PADRE (y = x² o y = x) y la transforma con la
 * forma de vértice f(x) = a(x−h)² + k, viendo en vivo cómo cada parámetro la
 * mueve o deforma:  a estira/refleja,  h traslada horizontal,  k traslada
 * vertical. EXPERIMENTO CENTRAL: con a < 0 un balón recorre la parábola y su punto
 * más alto (vértice) es exactamente (h, k); los medidores muestran cuánto se
 * movió el vértice respecto al origen. Cálculo exacto.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { TRANSFORMACIONES_FICHA } from "./transformaciones-funciones-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import {
  calcFuncion, ecuacion, TRANSFORMACIONES, ESCENARIOS, IDEAS, DATOS,
  A_MIN, A_MAX, A_STEP, A_DEF, H_MIN, H_MAX, H_STEP, H_DEF,
  K_MIN, K_MAX, K_STEP, K_DEF, MODO_DEF,
  fmtNum2, fmtNum1, fmtCoord, fmtPar, type Escenario, type Modo,
  RETO_A2,
} from "./transformaciones-funciones-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-transformaciones-funciones-reto";

const TransformacionesFuncionesScene = dynamic(() => import("./TransformacionesFuncionesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-line fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Graficando la función…</span>
    </div>
  ),
});

const A_COL = "#f97316";   // a (estiramiento/reflexión)
const H_COL = "#34D399";   // h (traslación horizontal)
const K_COL = "#c4b5fd";   // k (traslación vertical)
const VERT_COL = "#f5d36b"; // vértice
const PADRE_COL = "#64748b"; // padre

const MODOS = [
  { id: "cuadratica", etiqueta: "Cuadrática (2.º)", icono: "fa-square-root-variable" },
  { id: "lineal", etiqueta: "Lineal (1.º)", icono: "fa-slash" },
];

export function LabTransformacionesFunciones({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>(MODO_DEF);
  const [a, setA] = useState(A_DEF);
  const [h, setH] = useState(H_DEF);
  const [k, setK] = useState(K_DEF);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [mostrarPadre, setMostrarPadre] = useState(true);
  const [balon, setBalon] = useState(false);
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

  // Barrido automático de h (traslación horizontal): la gráfica completa se
  // desliza de un lado al otro del plano sin deformarse.
  useEffect(() => {
    if (!reproduciendo) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = ts - last;
      last = ts;
      setH((prev) => {
        let next = prev + dt * 0.0024 * dir.current; // ~2.4 u/s
        if (next >= H_MAX) { next = H_MAX; dir.current = -1; }
        else if (next <= H_MIN) { next = H_MIN; dir.current = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reproduciendo]);

  const f = useMemo(() => calcFuncion(modo, a, h, k), [modo, a, h, k]);

  const bump = () => setResetNonce((n) => n + 1);
  const setAman = (v: number) => { setReproduciendo(false); setA(v); };
  const setHman = (v: number) => { setReproduciendo(false); setH(v); };
  const setKman = (v: number) => { setReproduciendo(false); setK(v); };
  const setModoMan = (id: string) => { setReproduciendo(false); setModo(id as Modo); if (sonido) audioRef.current?.blip(); bump(); };
  const aplicar = (e: Escenario) => { setReproduciendo(false); setModo(e.modo); setA(e.a); setH(e.h); setK(e.k); if (sonido) audioRef.current?.blip(); bump(); };
  const reset = () => { setReproduciendo(false); setModo(MODO_DEF); setA(A_DEF); setH(H_DEF); setK(K_DEF); bump(); };

  const formaTexto = f.reflejada
    ? (modo === "cuadratica" ? "Abre hacia abajo (a < 0)" : "Recta que baja (a < 0)")
    : (modo === "cuadratica" ? "Abre hacia arriba (a > 0)" : "Recta que sube (a > 0)");

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-line" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Transforma la función</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: {ecuacion(modo, a, h, k)}; el {modo === "cuadratica" ? "vértice" : "punto ancla"} está en {fmtPar(f.h, f.k)}.
      </div>
    </div>
  );

  const lectura = <>{modo === "cuadratica" ? "Vértice" : "Punto ancla"} en {fmtPar(f.h, f.k)} · {f.reflejada ? "refleja" : "normal"}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <TransformacionesFuncionesScene
            modo={modo}
            a={a}
            h={h}
            k={k}
            accent={accent}
            mostrarPadre={mostrarPadre}
            balon={balon}
            autoRotate={autoRotate}
            pausado={false}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{ opciones: MODOS, valor: modo, cambiar: setModoMan }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-futbol" titulo={balon ? "Quitar el balón" : "Lanzar un balón por la gráfica"} activo={balon} onClick={() => setBalon((v) => !v)} />
          <BotonHerramienta icono={reproduciendo ? "fa-pause" : "fa-play"} titulo={reproduciendo ? "Pausar la traslación" : "Trasladar (mover h)"} activo={reproduciendo} onClick={() => setReproduciendo((p) => !p)} />
          <BotonHerramienta icono={mostrarPadre ? "fa-eye" : "fa-eye-slash"} titulo="Función padre y flechas" activo={mostrarPadre} onClick={() => setMostrarPadre((v) => !v)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <LegItem col={A_COL} txt="f(x) transformada" />
          <LegItem col={PADRE_COL} txt="función padre" />
          <LegItem col={H_COL} txt="h (horizontal)" />
          <LegItem col={K_COL} txt="k (vertical)" />
          <MedidorVertice h={f.h} k={f.k} compacto />
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Lanza el balón (⚽) con a < 0: la parábola es su trayectoria", done: balon && modo === "cuadratica" && a < 0 },
        { txt: "Lleva el vértice a (3, 4): mueve h hasta 3 y deja k = 4", done: modo === "cuadratica" && h === 3 && k === 4 },
        { txt: "Muestra la función padre y compárala con la transformada", done: mostrarPadre },
        { txt: "Desplaza la gráfica hacia arriba o hacia abajo (cambia k)", done: k !== K_DEF },
        { txt: "Desplázala a los lados (cambia h) y cuida el signo", done: h !== H_DEF },
        { txt: "Estira, comprime o refleja la gráfica (cambia a)", done: a !== A_DEF },
        { txt: "Cambia entre la función lineal y la cuadrática", done: modo !== MODO_DEF },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Transforma la gráfica" icono="fa-sliders">
                <Deslizador label="a · estira / refleja" icon="fa-up-right-and-down-left-from-center" colr={A_COL} valor={fmtNum2(a)} min={A_MIN} max={A_MAX} step={A_STEP} value={a} onChange={setAman} hintL={`${A_MIN}`} hintR={`${A_MAX}`} />
                <Deslizador label="h · traslada horizontal →" icon="fa-arrows-left-right" colr={H_COL} valor={fmtNum1(h)} min={H_MIN} max={H_MAX} step={H_STEP} value={h} onChange={setHman} hintL={`${H_MIN}`} hintR={`${H_MAX}`} />
                <Deslizador label="k · traslada vertical ↑" icon="fa-arrows-up-down" colr={K_COL} valor={fmtNum1(k)} min={K_MIN} max={K_MAX} step={K_STEP} value={k} onChange={setKman} hintL={`${K_MIN}`} hintR={`${K_MAX}`} />
              </Bloque>

              <Bloque titulo="¿Cuánto se movió el vértice?" icono="fa-location-dot">
                <MedidorVertice h={f.h} k={f.k} />
                <p style={{ margin: 0, color: T.text2 }}>
                  <span style={{ color: A_COL, fontWeight: 800 }}>{formaTexto}</span>. {modo === "cuadratica" && f.reflejada ? `El balón sube hasta una altura de ${fmtNum1(f.k)} en x = ${fmtNum1(f.h)}.` : "Con a < 0 y el balón encendido, la cima es el vértice."}
                </p>
              </Bloque>

              <Bloque titulo="Situaciones" icono="fa-shapes">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                  {ESCENARIOS.map((e) => {
                    const on = modo === e.modo && Math.abs(a - e.a) < 0.13 && Math.abs(h - e.h) < 0.26 && Math.abs(k - e.k) < 0.26;
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="grado" value={`${f.grado}.º`} col={accent} />
                  <Dato label={modo === "cuadratica" ? "vértice" : "punto"} value={fmtPar(f.h, f.k)} col={VERT_COL} />
                  <Dato label="corta eje Y en" value={fmtCoord(f.ordenadaOrigen)} col={H_COL} />
                  <Dato label="forma" value={f.reflejada ? "↓ refleja" : "↑ normal"} col={A_COL} />
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
              <Bloque titulo="Del padre a la transformada" icono="fa-list-ol">
                <p style={{ margin: 0, color: accent, fontWeight: 800 }}>{modo === "cuadratica" ? "Parto de y = x²" : "Parto de y = x"}</p>
                <PasoRow n={1} texto="Función padre (sin transformar):" valor={modo === "cuadratica" ? "y = x²" : "y = x"} col={PADRE_COL} />
                <PasoRow n={2} texto={`Aplico a = ${fmtNum2(a)} (${f.reflejada ? "refleja" : "no refleja"}, ${f.estirada ? "estira" : f.comprimida ? "comprime" : "igual"}):`} valor={modo === "cuadratica" ? `y = ${fmtNum2(a)}·x²` : `y = ${fmtNum2(a)}·x`} col={A_COL} />
                <PasoRow n={3} texto={`Traslado h = ${fmtNum1(h)} en horizontal y k = ${fmtNum1(k)} en vertical:`} valor={ecuacion(modo, a, h, k)} col={H_COL} />
                <PasoRow n={4} texto={modo === "cuadratica" ? "El vértice queda en (h, k):" : "La recta pasa por el punto (h, k):"} valor={fmtPar(f.h, f.k)} col={VERT_COL} />
              </Bloque>
              <Bloque titulo="Qué hace cada parámetro" icono="fa-wand-magic-sparkles">
                {TRANSFORMACIONES.map((tr) => (
                  <div key={tr.param} style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${tr.color}44`, background: "rgba(4,10,22,0.4)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                      <span style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, fontStyle: "italic", color: "#04121f", background: tr.color }}>{tr.param}</span>
                      <span style={{ fontWeight: 900, color: "#fff" }}>{tr.nombre}</span>
                    </div>
                    <div style={{ color: T.text2 }}>{tr.efecto}</div>
                  </div>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: A_COL }}>a</strong> cambia la <strong>forma</strong>; <strong style={{ color: H_COL }}>h</strong> y <strong style={{ color: K_COL }}>k</strong> solo cambian la <strong>posición</strong> (deslizan la gráfica sin deformarla).
                </p>
              </Bloque>
              <Bloque titulo="Aplicación: la trayectoria del balón" icono="fa-futbol">
                <p style={{ margin: 0, color: T.text2 }}>
                  Una pelota lanzada describe una <strong style={{ color: A_COL }}>parábola con a &lt; 0</strong> (abre hacia abajo). Su punto más alto es el <strong style={{ color: VERT_COL }}>vértice (h, k)</strong>: h es dónde alcanza la cima y k qué tan alto llega.
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
                      <strong style={{ fontFamily: "ui-monospace, monospace", overflowWrap: "anywhere" }}>{dd.valor}</strong>
                      <div style={{ color: T.text2 }}>{dd.texto}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={TRANSFORMACIONES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Cálculo <strong>exacto</strong>: la gráfica se evalúa punto por punto con f(x) = a(x−h)² + k (o a(x−h) + k en lineal); el vértice es exactamente (h, k). El plano se dibuja a <strong>escala fija</strong> y la curva se <strong>recorta</strong> al rango visible, pero los valores numéricos siempre son los exactos.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor: cuánto se movió el vértice (h → derecha, k → arriba) ───────────── */
function MedidorVertice({ h, k, compacto = false }: { h: number; k: number; compacto?: boolean }) {
  const barra = (txt: string, v: number, lim: number, c: string) => {
    const pct = Math.min(50, (Math.abs(v) / lim) * 50);
    return (
      <div style={{ display: "grid", gap: 3 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: compacto ? 12 : 14, fontWeight: 800, color: "#dce6f5" }}>
          <span>{txt}</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtNum1(v)}</span>
        </div>
        <div style={{ position: "relative", height: compacto ? 8 : 12, borderRadius: 6, background: "rgba(255,255,255,0.1)" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: v >= 0 ? "50%" : `${50 - pct}%`, width: `${pct}%`, background: c, borderRadius: 6, transition: "all 120ms linear" }} />
          <div style={{ position: "absolute", top: -2, bottom: -2, left: "50%", width: 2, background: "rgba(255,255,255,0.6)" }} />
        </div>
      </div>
    );
  };
  return (
    <div style={{ display: "grid", gap: compacto ? 6 : 10, width: compacto ? 176 : undefined, marginTop: compacto ? 4 : 0 }}>
      {barra("h (← →)", h, H_MAX, H_COL)}
      {barra("k (↓ ↑)", k, K_MAX, K_COL)}
    </div>
  );
}

/* ── Fila de un paso del razonamiento ────────────────────────────────────── */
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
