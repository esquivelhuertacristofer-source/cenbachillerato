"use client";

/**
 * Laboratorio 3D — Razón y proporción.
 * Práctica experimental para PM-I-P05-A2.
 *
 * Experimento central: el alumno mueve la cantidad X y ve cómo responde Y en la
 * gráfica 3D; lo que NO se mueve es el invariante:
 *   · DIRECTA  →  la razón  Y / X = k  (recta por el origen). Si X sube, Y sube.
 *   · INVERSA  →  el producto X · Y = k (hipérbola). Si X sube, Y baja.
 * El medidor del invariante no cambia aunque el deslizador sí: ese es el "ajá".
 * Pensamiento Matemático I.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RAZON_PROPORCION_FICHA } from "./razon-proporcion-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./razon-proporcion-data";
import { LabSfx } from "./lab-audio";
import { ESCENARIOS, valorY, invariante, yMaxGlobal, type Escenario, type Tipo } from "./proporcion-data";

const ProporcionScene = dynamic(() => import("./ProporcionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-line fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const K_COL = "#FFD166"; // color del invariante

const fmt = (n: number) =>
  Number.isInteger(n) ? n.toLocaleString("es-MX") : n.toLocaleString("es-MX", { maximumFractionDigits: 2 });

const RETO_KEY = "cen-razon-proporcion-reto";

export function LabProporcion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [escKey, setEscKey] = useState(ESCENARIOS[0]!.key);
  const esc = useMemo<Escenario>(() => ESCENARIOS.find((e) => e.key === escKey) ?? ESCENARIOS[0]!, [escKey]);

  const [x, setX] = useState(ESCENARIOS[0]!.xDefault);
  const [autoRotate, setAutoRotate] = useState(false);
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

  // seguimiento de objetivos
  const [movioDeslizador, setMovioDeslizador] = useState(false);
  const [valoresVistos, setValoresVistos] = useState<number[]>([]);
  const [tiposVistos, setTiposVistos] = useState<Set<string>>(() => new Set<string>([ESCENARIOS[0]!.tipo]));

  const elegirEscenario = (e: Escenario) => {
    setEscKey(e.key);
    setX(e.xDefault);
    if (sonido) audioRef.current?.blip();
    setTiposVistos((prev) => {
      if (prev.has(e.tipo)) return prev;
      const next = new Set(prev);
      next.add(e.tipo);
      return next;
    });
  };

  const elegirTipo = (t: Tipo) => {
    const destino = ESCENARIOS.find((e) => e.tipo === t) ?? ESCENARIOS[0]!;
    elegirEscenario(destino);
  };

  const moverX = (v: number) => {
    setX(v);
    setMovioDeslizador(true);
    setValoresVistos((prev) => (prev.includes(v) ? prev : [...prev, v]));
  };

  const reset = () => {
    setX(esc.xDefault);
    setResetNonce((n) => n + 1);
  };

  const y = useMemo(() => valorY(esc, x), [esc, x]);
  const inv = useMemo(() => invariante(esc, x), [esc, x]);
  const yMax = useMemo(() => yMaxGlobal(esc), [esc]);

  const esDirecta = esc.tipo === "directa";
  const invSimbolo = esDirecta ? `${esc.yNombre} ÷ ${esc.xNombre}` : `${esc.xNombre} × ${esc.yNombre}`;
  const unX = esc.xUnidad ? ` ${esc.xUnidad}` : "";
  const unY = esc.yUnidad ? ` ${esc.yUnidad}` : "";

  const objetivos = [
    { txt: "Mueve el deslizador y observa la gráfica", done: movioDeslizador },
    { txt: "Mide el invariante en tres valores distintos: siempre da lo mismo", done: valoresVistos.length >= 3 },
    { txt: "Explora una proporción directa (recta)", done: tiposVistos.has("directa") },
    { txt: "Explora una proporción inversa (hipérbola)", done: tiposVistos.has("inversa") },
    { txt: "Comprueba que el invariante no cambia", done: movioDeslizador && tiposVistos.size >= 2 },
    { txt: "Resuelve el reto de razón y proporción", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${esc.icono}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, ...NUM }}>
        {esc.xNombre} {fmt(x)}{unX} → {esc.yNombre} {fmt(y)}{unY}
      </div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: {esDirecta ? "la razón" : "el producto"} {invSimbolo} se mantiene en <strong>{fmt(inv)}</strong> — esa es la constante de proporcionalidad.
      </div>
    </div>
  );

  const lectura = esDirecta
    ? <>{fmt(y)} ÷ {fmt(x)} = {fmt(inv)}: si X sube, Y sube, la razón no cambia</>
    : <>{fmt(x)} × {fmt(y)} = {fmt(inv)}: si X sube, Y baja, el producto no cambia</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <ProporcionScene
            tipo={esc.tipo}
            x={x}
            y={y}
            k={esc.k}
            xMin={esc.xMin}
            xMax={esc.xMax}
            yMax={yMax}
            accent={accent}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
            rotulos={{
              x: `${esc.xNombre}${esc.xUnidad ? ` (${esc.xUnidad})` : ""}`,
              y: `${esc.yNombre}${esc.yUnidad ? ` (${esc.yUnidad})` : ""}`,
              p: `${fmt(x)}${unX} → ${fmt(y)}${unY}`,
              k: `${esDirecta ? "Y÷X" : "X·Y"} = ${fmt(inv)}`,
            }}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: [
          { id: "directa", etiqueta: "Directa", icono: "fa-arrow-trend-up" },
          { id: "inversa", etiqueta: "Inversa", icono: "fa-arrow-trend-down" },
        ],
        valor: esc.tipo,
        cambiar: (id) => elegirTipo(id as Tipo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={<MedidorInvariante esc={esc} x={x} y={y} inv={inv} yMax={yMax} esDirecta={esDirecta} compacto />}
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo={esc.titulo} icono={esc.icono}>
                <p style={{ margin: 0, color: T.text2 }}>{esc.contexto}</p>
                <Deslizador
                  label={esc.xNombre}
                  icon={esc.icono}
                  colr={accent}
                  valor={`${fmt(x)}${unX}`}
                  min={esc.xMin}
                  max={esc.xMax}
                  step={esc.xStep}
                  value={x}
                  onChange={moverX}
                  hintL={fmt(esc.xMin)}
                  hintR={fmt(esc.xMax)}
                />
              </Bloque>

              <Bloque titulo="El invariante" icono="fa-scale-balanced">
                <MedidorInvariante esc={esc} x={x} y={y} inv={inv} yMax={yMax} esDirecta={esDirecta} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label={esc.xNombre} value={`${fmt(x)}${unX}`} col={accent} />
                  <Dato label={esc.yNombre} value={`${fmt(y)}${unY}`} />
                  <Dato label={esDirecta ? "razón Y ÷ X" : "producto X × Y"} value={fmt(inv)} col={K_COL} />
                  <Dato label={esc.kNombre} value={fmt(esc.k)} col={K_COL} />
                </div>
              </Bloque>

              <Bloque titulo="Otros escenarios" icono="fa-shuffle">
                <div style={{ display: "grid", gap: 8 }}>
                  {ESCENARIOS.filter((e) => e.tipo === esc.tipo).map((e) => (
                    <button
                      key={e.key}
                      type="button"
                      className="lp-esc"
                      data-on={e.key === escKey}
                      onClick={() => elegirEscenario(e)}
                    >
                      <i className={`fa-solid ${e.icono}`} aria-hidden />
                      <span>{e.titulo}</span>
                    </button>
                  ))}
                </div>
                <style>{`
                  .lp-esc { cursor:pointer; text-align:left; display:flex; align-items:center; gap:11px; padding:11px 13px; border-radius:12px;
                    border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:700; width:100%; transition:all .14s; }
                  .lp-esc:hover { border-color:${T.lineStrong}; color:#fff; }
                  .lp-esc[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
                  .lp-esc i { width:20px; text-align:center; color:${accent}; }
                `}</style>
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
              <Bloque titulo="El corazón de la proporción" icono="fa-heart">
                <p style={{ margin: 0, color: T.text2 }}>
                  {esDirecta ? (
                    <>
                      Es proporción <strong style={{ color: accent }}>directa</strong>: {esc.porque} Por eso la gráfica es una <strong style={{ color: T.text }}>recta que sale del origen</strong> y la razón{" "}
                      <strong style={{ color: K_COL, ...NUM }}>{esc.yNombre} ÷ {esc.xNombre}</strong> se queda fija en <strong style={{ color: K_COL, ...NUM }}>{fmt(esc.k)}</strong> ({esc.kNombre}).
                    </>
                  ) : (
                    <>
                      Es proporción <strong style={{ color: accent }}>inversa</strong>: {esc.porque} Por eso la gráfica es una <strong style={{ color: T.text }}>hipérbola</strong> y el producto{" "}
                      <strong style={{ color: K_COL, ...NUM }}>{esc.xNombre} × {esc.yNombre}</strong> se queda fijo en <strong style={{ color: K_COL, ...NUM }}>{fmt(esc.k)}</strong> ({esc.kNombre}).
                    </>
                  )}
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  No siempre que una cantidad sube la otra sube. En la <strong style={{ color: T.text }}>inversa</strong> sucede lo contrario, y aun así algo se conserva.
                </p>
              </Bloque>
              <Bloque titulo="La idea" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Una <strong style={{ color: T.text }}>proporción</strong> dice que dos razones son iguales. Lo importante no es solo si Y sube o baja, sino{" "}
                  <strong style={{ color: K_COL }}>qué se mantiene constante</strong>: la razón <strong style={{ color: T.text, ...NUM }}>Y/X</strong> en la directa, el producto{" "}
                  <strong style={{ color: T.text, ...NUM }}>X·Y</strong> en la inversa.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={RAZON_PROPORCION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor: X y Y como barras, y el invariante que NO se mueve ───────────── */
function MedidorInvariante({ esc, x, y, inv, yMax, esDirecta, compacto = false }: {
  esc: Escenario; x: number; y: number; inv: number; yMax: number; esDirecta: boolean; compacto?: boolean;
}) {
  const barra = (txt: string, val: number, max: number, c: string) => (
    <div style={{ display: "grid", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>{txt}</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{fmt(val)}</span>
      </div>
      <div style={{ height: compacto ? 8 : 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, (val / max) * 100)}%`, height: "100%", background: c, transition: "width 120ms linear" }} />
      </div>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: compacto ? 6 : 10, width: compacto ? 200 : undefined }}>
      {barra(esc.xNombre, x, esc.xMax, "#38bdf8")}
      {barra(esc.yNombre, y, yMax, "#a78bfa")}
      <div style={{ padding: "6px 10px", borderRadius: 10, border: `1.5px solid ${K_COL}`, background: `${K_COL}18`, fontSize: 14, fontWeight: 900, color: K_COL, fontFamily: "ui-monospace, monospace" }}>
        {esDirecta ? "Y ÷ X" : "X × Y"} = {fmt(inv)}
      </div>
    </div>
  );
}
