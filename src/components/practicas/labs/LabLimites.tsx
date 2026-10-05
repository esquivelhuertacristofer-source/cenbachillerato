"use client";

/**
 * Laboratorio 3D — El límite: a qué se acerca f(x) cuando x→a.
 * Práctica experimental para PM-V-P01-A2 (ejercicio_matematico "Calculando
 * límites: del límite básico al 0/0 indeterminado"; progresión 1, UAC PM-V).
 *
 * El alumno ACERCA x al punto `a` (por la izquierda o por la derecha) y ve cómo
 * el punto P = (x, f(x)) se desliza sobre la curva hacia el valor del límite L,
 * aunque f(a) no exista (el hueco 0/0). Un medidor muestra cómo se cierra la
 * distancia |f(x) − L|. Tres casos verbatim del enunciado:
 *  (a) lim(t→2) s(t)/t = 11 km/h   (sustitución directa)
 *  (b) lim(x→3) (x²−9)/(x−3) = 6   (0/0 → factorización, hueco en x=3)
 *  (c) lim(x→0) sen(2x)/x = 2       (límite notable, hueco en x=0)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { LIMITES_FICHA } from "./limites-acercamiento-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./limites-acercamiento-data";
import { LabSfx } from "./lab-audio";
import {
  CASOS, caso, evalCaso, tablaAprox, conUnidad, cercania,
  IDEAS, DATOS, fmt1, fmt2, fmt3,
  CASO_DEF, LADO_DEF, type CasoId, type Lado,
} from "./limites-data";


/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-limites-acercamiento-reto";


const LimitesScene = dynamic(() => import("./LimitesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-arrow-right-to-bracket fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Dibujando el plano…</span>
    </div>
  ),
});

const X_COL = "#fbbf24";    // posición de x
const LIM_COL = "#34D399";  // valor del límite L
const HOLE_COL = "#f87171"; // hueco (0/0)

export function LabLimites({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [casoId, setCasoId] = useState<CasoId>(CASO_DEF);
  const [lado, setLado] = useState<Lado>(LADO_DEF);
  const [xPos, setXPos] = useState<number>(caso(CASO_DEF).xDef);
  const [playing, setPlaying] = useState(false);
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

  const c = useMemo(() => caso(casoId), [casoId]);

  // Acercamiento automático: x se aproxima a `a` desde el lado elegido y, al
  // quedar muy cerca, vuelve a alejarse para repetir el barrido (efecto "zeno").
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    const far = lado === "izq"
      ? Math.max(c.domMin, c.a - (c.a - c.domMin) * 0.92)
      : Math.min(c.domMax, c.a + (c.domMax - c.a) * 0.92);
    const sign = lado === "izq" ? -1 : 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setXPos((prev) => {
        const dist = Math.abs(prev - c.a);
        // se acerca el ~92% de la distancia restante por segundo
        let next = prev + (c.a - prev) * Math.min(1, dt * 2.3);
        if (dist < 0.004) next = far; // reinicia el acercamiento desde lejos
        // asegura que se mantenga del lado correcto
        if (sign < 0 && next > c.a) next = c.a - 0.004;
        if (sign > 0 && next < c.a) next = c.a + 0.004;
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, lado, c.a, c.domMin, c.domMax]);

  const bump = () => setResetNonce((n) => n + 1);
  const elegirCaso = (id: CasoId) => {
    if (sonido) audioRef.current?.blip();
    setPlaying(false);
    setCasoId(id);
    const nc = caso(id);
    setLado("izq");
    setXPos(nc.xDef);
    bump();
  };
  const elegirLado = (l: Lado) => {
    setPlaying(false);
    setLado(l);
    // coloca x del lado elegido, a media distancia del objetivo
    setXPos(l === "izq" ? (c.a + c.domMin) / 2 : (c.a + c.domMax) / 2);
  };
  const setXman = (v: number) => {
    setPlaying(false);
    setXPos(v);
    setLado(v <= c.a ? "izq" : "der");
  };
  const reset = () => {
    setPlaying(false);
    setCasoId(CASO_DEF);
    setLado("izq");
    setXPos(caso(CASO_DEF).xDef);
    bump();
  };

  const yVal = evalCaso(casoId, xPos);
  const yTxt = conUnidad(yVal, c.unidadY, 2);
  const tabla = useMemo(() => tablaAprox(casoId), [casoId]);
  // ¿coincide f(x) con L hasta el punto de redondeo? (para el "≈ L")
  const muyCerca = Number.isFinite(yVal) && Math.abs(yVal - c.L) < 0.1;

  // Medidor: distancia |f(x) − L| respecto de la distancia en la posición más lejana del dominio.
  const brecha = Number.isFinite(yVal) ? Math.abs(yVal - c.L) : 0;
  const brechaMax = Math.max(
    1e-9,
    Math.abs(evalCaso(casoId, c.domMin) - c.L) || 0,
    Math.abs(evalCaso(casoId, c.domMax) - c.L) || 0,
  );
  const pctBrecha = Math.min(100, (brecha / brechaMax) * 100);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-arrow-right-to-bracket" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{c.titulo}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: {c.limStr} = {fmt2(c.L)}. {c.metodo}
      </div>
    </div>
  );

  const lectura = muyCerca
    ? <>f(x) ≈ {fmt2(c.L)}: ese es el límite</>
    : <>x = {conUnidad(xPos, c.unidadX, 2)} → f(x) = {yTxt}</>;

  const chip = (on: boolean): React.CSSProperties => ({
    cursor: "pointer", padding: "10px 12px", borderRadius: 12, fontSize: 14, fontWeight: 800, textAlign: "left",
    display: "flex", alignItems: "center", gap: 8, minHeight: 44, color: on ? "#fff" : T.text2,
    border: `1px solid ${on ? `rgba(${color.rgba},0.7)` : T.line}`,
    background: on ? `rgba(${color.rgba},0.18)` : T.inset,
  });

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <LimitesScene casoId={casoId} xPos={xPos} accent={accent} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      modos={{
        opciones: CASOS.map((cc) => ({ id: cc.id, etiqueta: cc.label, icono: cc.icono })),
        valor: casoId,
        cambiar: (id) => elegirCaso(id as CasoId),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar el acercamiento" : "Acercar x → a"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Acerca x tanto a a que f(x) llegue a L (la distancia casi se cierra)", done: muyCerca },
        { txt: "Acerca x al punto a y observa hacia dónde va f(x)", done: xPos !== caso(casoId).xDef },
        { txt: "Acércate por los dos lados: por la izquierda y por la derecha", done: lado !== LADO_DEF },
        { txt: "Llega al caso indeterminado 0/0 y factoriza", done: casoId === "indeterminada", modo: "indeterminada" },
        { txt: "Llega al límite notable sen(x)/x → 1", done: casoId === "notable", modo: "notable" },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Acerca x al punto y observa a dónde va f(x)" icono="fa-sliders">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                  <button type="button" style={chip(lado === "izq")} onClick={() => elegirLado("izq")}>
                    <i className="fa-solid fa-arrow-right-long" /> Por la izquierda (x → {fmt1(c.a)}⁻)
                  </button>
                  <button type="button" style={chip(lado === "der")} onClick={() => elegirLado("der")}>
                    <i className="fa-solid fa-arrow-left-long" /> Por la derecha (x → {fmt1(c.a)}⁺)
                  </button>
                </div>
                <Deslizador
                  label={`posición de x (${c.unidadX || "x"})`}
                  icon="fa-arrow-right-to-bracket"
                  colr={X_COL}
                  valor={conUnidad(xPos, c.unidadX, 3)}
                  min={c.domMin} max={c.domMax} step={c.xStep} value={xPos}
                  onChange={setXman}
                  hintL={fmt1(c.domMin)} hintR={fmt1(c.domMax)}
                />
              </Bloque>

              <Bloque titulo="Medidor: la distancia a L se cierra" icono="fa-bullseye">
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
                    <span>|f(x) − L|</span>
                    <span style={{ fontFamily: "ui-monospace, monospace", color: muyCerca ? LIM_COL : "#fff" }}>{fmt3(brecha)}</span>
                  </div>
                  <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                    <div style={{ width: `${pctBrecha}%`, height: "100%", background: muyCerca ? LIM_COL : X_COL, transition: "width 120ms linear, background 120ms linear" }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: muyCerca ? LIM_COL : T.text2 }}>
                    {muyCerca ? `f(x) ya casi vale L = ${fmt2(c.L)} ${c.unidadY}` : `Acerca x a ${fmt1(c.a)} y la barra se vacía`}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="posición x" value={conUnidad(xPos, c.unidadX, 3)} col={X_COL} />
                  <Dato label="|x − a|" value={cercania(casoId, xPos)} col={X_COL} />
                  <Dato label="f(x)" value={yTxt} col={muyCerca ? LIM_COL : "#fff"} />
                  <Dato label="límite L" value={fmt2(c.L)} col={LIM_COL} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  {muyCerca
                    ? `f(x) se acerca a L = ${fmt2(c.L)} ${c.unidadY} — ese es el límite, aunque ${c.hueco ? "f(" + fmt1(c.a) + ") no exista (0/0)" : "lleguemos justo al punto"}.`
                    : `Observa hacia qué valor se dirige f(x) al acercarte a a = ${fmt1(c.a)}.`}
                </p>
              </Bloque>

              <Bloque titulo={`Tabla de acercamiento: x → ${fmt1(c.a)}`} icono="fa-table-list">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 10 }}>
                  <TablaLado titulo={`Izquierda (x → ${fmt1(c.a)}⁻)`} filas={tabla.izq} accent={accent} unidadY={c.unidadY} />
                  <TablaLado titulo={`Derecha (x → ${fmt1(c.a)}⁺)`} filas={tabla.der} accent={accent} unidadY={c.unidadY} />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${LIM_COL}55`, background: `${LIM_COL}12`, color: T.text2 }}>
                  Por ambos lados f(x) se acerca al mismo número: <strong style={{ color: LIM_COL }}>L = {fmt2(c.L)} {c.unidadY}</strong>. Como coinciden, el límite existe.
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
              <Bloque titulo={c.titulo} icono={c.icono}>
                <div style={{ fontSize: 15, fontWeight: 800, color: LIM_COL, fontFamily: "ui-monospace, monospace" }}>{c.limStr} = {fmt2(c.L)}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{c.expr}</div>
                <p style={{ margin: 0, color: T.text2 }}>{c.metodo}</p>
                <p style={{ margin: 0, color: T.text3 }}>{c.contexto}</p>
              </Bloque>
              <Bloque titulo="Resolución paso a paso" icono="fa-list-ol">
                {c.pasos.map((p) => (
                  <div key={p.etiqueta} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <strong style={{ color: accent }}>{p.etiqueta}</strong>
                    <div style={{ color: T.text2 }}>{p.texto}</div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="¿Qué es un límite?" icono="fa-circle-question">
                <p style={{ margin: 0, color: T.text2 }}>
                  El límite de f(x) cuando x se acerca a <strong style={{ color: X_COL }}>a</strong> es <strong style={{ color: LIM_COL }}>L</strong> si los valores f(x) se acercan a L conforme x se aproxima a a (por la izquierda y por la derecha). <strong>La clave es el acercamiento, no la llegada</strong>: el límite puede existir aunque f(a) no esté definida.
                </p>
              </Bloque>
              <Bloque titulo="El hueco 0/0" icono="fa-circle-notch">
                <p style={{ margin: 0, color: T.text2 }}>
                  Cuando la sustitución da 0/0, la fracción no existe en ese punto (el anillo abierto <span style={{ color: HOLE_COL }}>rojo</span>), pero al factorizar y cancelar el límite sí existe.
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
                <FichaTeorica data={LIMITES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Cálculo exacto: f(x), el valor del límite L y las tablas de acercamiento salen de la fórmula real (en el caso notable, en radianes). Los tres casos y sus pasos son verbatim del enunciado A2 (auto en la autopista México-Querétaro, s(t) = 3t² + 5t). El plano se dibuja a escala propia por caso; el anillo abierto señala dónde f(a) no existe (0/0).
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Tabla de un lado del acercamiento ────────────────────────────────────── */
function TablaLado({ titulo, filas, accent, unidadY }: {
  titulo: string; filas: { x: number; y: number }[]; accent: string; unidadY: string;
}) {
  return (
    <div style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${accent}33`, background: "rgba(4,10,22,0.4)", minWidth: 0, overflowX: "auto" }}>
      <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 8 }}>{titulo}</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "ui-monospace, monospace", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", color: T.text3, padding: "2px 4px", fontWeight: 800 }}>x</th>
            <th style={{ textAlign: "right", color: T.text3, padding: "2px 4px", fontWeight: 800 }}>f(x){unidadY ? ` (${unidadY})` : ""}</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i}>
              <td style={{ padding: "2px 4px", color: "#fbbf24", fontWeight: 700 }}>{fmt3(f.x)}</td>
              <td style={{ padding: "2px 4px", textAlign: "right", color: "#34D399", fontWeight: 800 }}>{Number.isFinite(f.y) ? fmt3(f.y) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
