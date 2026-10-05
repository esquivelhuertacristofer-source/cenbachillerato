"use client";

/**
 * Laboratorio 3D — Funciones de variable real y su simetría.
 * Práctica experimental para PM-V-P09-A2
 * ("Grafico funciones de variable real e identifico sus simetrías";
 *  progresión 3 / propósito formativo O3).
 *
 * El alumno elige una función de un catálogo y la ve graficada en el plano
 * cartesiano. Marca sus RASGOS —raíces, intersección con Y, máximos y mínimos
 * locales— y analiza su SIMETRÍA: al reflejar la curva descubre si es PAR
 * (espejo en el eje Y, f(−x) = f(x)), IMPAR (giro de 180° en el origen,
 * f(−x) = −f(x)) o NINGUNA. Pensamiento Matemático V — «Cálculo diferencial»,
 * propósito formativo 3 (MCCEMS 2025).
 *
 * Experimento central: la SONDA. El alumno mueve x y la escena pone el punto
 * (x, f(x)) y su gemelo (−x, f(−x)); un medidor compara las dos alturas y dice
 * si coinciden (par), son opuestas (impar) o ninguna de las dos.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { FUNCIONES_VR_FICHA } from "./funciones-variable-real-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./funciones-variable-real-data";
import { LabSfx } from "./lab-audio";
import {
  FUNCIONES,
  FUNCION_DEFAULT,
  funcionPorId,
  raices,
  interseccionY,
  extremos,
  simetria,
  simetriaTexto,
  raicesTexto,
  relacionSonda,
  fmtNum,
} from "./funciones-data";

const FuncionesScene = dynamic(() => import("./FuncionesScene"), {
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
const MAGENTA = "#f0a6ff";
const ROJO = "#ff7a7a";

const RETO_KEY = "cen-funciones-variable-real-reto";

const X0_DEF = 1.5;

export function LabFunciones({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [funcionId, setFuncionId] = useState(FUNCION_DEFAULT);
  const [x0, setX0] = useState(X0_DEF);
  const [showSimetria, setShowSimetria] = useState(true);
  const [showRasgos, setShowRasgos] = useState(true);
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
  const [movioSonda, setMovioSonda] = useState(false);
  const [cambioFuncion, setCambioFuncion] = useState(false);
  const [vioRasgos, setVioRasgos] = useState(true);
  const [vioSimetria, setVioSimetria] = useState(true);
  const [vioImpar, setVioImpar] = useState(false);

  const bump = () => setResetNonce((n) => n + 1);

  const elegir = (id: string) => {
    setFuncionId(id);
    setCambioFuncion(true);
    if (sonido) audioRef.current?.blip();
    if (simetria(funcionPorId(id)) === "impar") setVioImpar(true);
  };
  const cambiarX = (v: number) => { setX0(v); setMovioSonda(true); if (sonido) audioRef.current?.blip(); };
  const toggleSimetria = () => { setShowSimetria((s) => !s); setVioSimetria(true); };
  const toggleRasgos = () => { setShowRasgos((s) => !s); setVioRasgos(true); };

  const reset = () => {
    setFuncionId(FUNCION_DEFAULT);
    setX0(X0_DEF);
    setShowSimetria(true); setShowRasgos(true);
    bump();
  };

  // magnitudes matemáticas (deterministas)
  const fn = useMemo(() => funcionPorId(funcionId), [funcionId]);
  const rs = useMemo(() => raices(fn), [fn]);
  const iy = useMemo(() => interseccionY(fn), [fn]);
  const exs = useMemo(() => extremos(fn), [fn]);
  const sim = useMemo(() => simetria(fn), [fn]);

  const maxs = exs.filter((e) => e.tipo === "max");
  const mins = exs.filter((e) => e.tipo === "min");
  const extremosTxt =
    exs.length === 0
      ? "ninguno (no cambia de sentido)"
      : [
          maxs.length ? `máx en ${maxs.map((e) => `(${fmtNum(e.x, 1)}, ${fmtNum(e.y, 1)})`).join(", ")}` : "",
          mins.length ? `mín en ${mins.map((e) => `(${fmtNum(e.x, 1)}, ${fmtNum(e.y, 1)})`).join(", ")}` : "",
        ].filter(Boolean).join(" · ");

  const simColor = sim === "par" ? ORO : sim === "impar" ? CIAN : ROJO;
  const simEtiqueta = sim === "par" ? "PAR" : sim === "impar" ? "IMPAR" : "NINGUNA";

  // sonda: f(x) frente a f(−x)
  const yP = fn.f(x0);
  const yQ = fn.f(-x0);
  const rel = relacionSonda(fn, x0);
  const relColor = rel === "igual" ? ORO : rel === "opuesto" ? CIAN : ROJO;
  const relTexto = rel === "igual" ? "f(−x) = f(x): iguales, apunta a PAR" : rel === "opuesto" ? "f(−x) = −f(x): opuestas, apunta a IMPAR" : "f(−x) ≠ ± f(x): ninguna aquí";
  const relCorto = rel === "igual" ? "iguales → par" : rel === "opuesto" ? "opuestas → impar" : "distintas → ninguna";

  const objetivos = [
    { txt: "Mueve la sonda x y compara f(x) con f(−x)", done: movioSonda },
    { txt: "Grafica una función del catálogo", done: cambioFuncion },
    { txt: "Localiza sus raíces y su corte con Y", done: vioRasgos },
    { txt: "Analiza si es par, impar o ninguna", done: vioSimetria },
    { txt: "Encuentra una función impar", done: vioImpar },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-line" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Cada función tiene su forma en el plano</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: la gráfica de y = f(x) es el conjunto de puntos (x, f(x)). En ella se leen sus raíces, su corte con Y, sus máximos y mínimos, y su simetría (par, impar o ninguna).
      </div>
    </div>
  );

  // Medidor de la sonda: dos barras con signo, f(x) arriba y f(−x) abajo.
  const medidor = (compacto: boolean) => {
    const tope = 5;
    const barra = (txt: string, val: number, c: string) => {
      const frac = Math.min(1, Math.abs(val) / tope);
      return (
        <div style={{ display: "grid", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
            <span>{txt}</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtNum(val, 2)}</span>
          </div>
          <div style={{ position: "relative", height: compacto ? 9 : 12, borderRadius: 6, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, bottom: 0, left: val >= 0 ? "50%" : `${50 - frac * 50}%`, width: `${frac * 50}%`, background: c, transition: "all 120ms linear" }} />
            <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, background: "#fff" }} />
          </div>
        </div>
      );
    };
    return (
      <div style={{ display: "grid", gap: compacto ? 6 : 10, width: compacto ? 200 : undefined }}>
        {barra(`f(${fmtNum(x0, 2)})`, yP, "#ffffff")}
        {barra(`f(${fmtNum(-x0, 2)})`, yQ, relColor)}
        <div style={{ fontSize: 14, fontWeight: 900, color: relColor }}>{compacto ? relCorto : relTexto}</div>
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
          <FuncionesScene
            funcionId={funcionId}
            accent={accent}
            showSimetria={showSimetria}
            showRasgos={showRasgos}
            x0={x0}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-arrows-left-right-to-line" titulo={showSimetria ? "Ocultar el reflejo de simetría" : "Analizar simetría"} activo={showSimetria} onClick={toggleSimetria} />
          <BotonHerramienta icono="fa-location-dot" titulo={showRasgos ? "Ocultar rasgos" : "Mostrar rasgos"} activo={showRasgos} onClick={toggleRasgos} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <div style={{ fontSize: 15, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{fn.formula}</div>
          {medidor(true)}
        </>
      }
      lectura={<>f({fmtNum(x0, 2)}) = {fmtNum(yP, 2)} · f({fmtNum(-x0, 2)}) = {fmtNum(yQ, 2)}</>}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="La sonda de simetría" icono="fa-crosshairs">
                <Deslizador label="Punto x de la sonda" icon="fa-location-dot" colr="#ffffff"
                  valor={fmtNum(x0, 2)} min={0.25} max={4.5} step={0.25} value={x0} onChange={cambiarX}
                  hintL="cerca del eje Y" hintR="lejos" />
                {medidor(false)}
                <p style={{ margin: 0, color: T.text2 }}>
                  Compara el punto blanco en <strong>x</strong> con su gemelo en <strong>−x</strong>. Si están a la <strong style={{ color: ORO }}>misma altura</strong> en todo x, la función es par; si están a alturas <strong style={{ color: CIAN }}>opuestas</strong>, impar.
                </p>
              </Bloque>

              <Bloque titulo="Elige una función" icono="fa-shapes">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                  {FUNCIONES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => elegir(f.id)}
                      aria-pressed={funcionId === f.id}
                      style={{
                        cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 2, padding: "10px 12px", borderRadius: 11,
                        border: `1px solid ${funcionId === f.id ? accent : T.line}`,
                        background: funcionId === f.id ? `rgba(${color.rgba},0.16)` : T.inset,
                        color: funcionId === f.id ? "#fff" : T.text2,
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 900, color: funcionId === f.id ? accent : T.text, fontFamily: "ui-monospace, monospace" }}>{f.formula}</span>
                      <span style={{ fontSize: 14, color: T.text3 }}>{f.nombre}</span>
                    </button>
                  ))}
                </div>
              </Bloque>

              <Bloque titulo={`Los rasgos de ${fn.formula}`} icono="fa-magnifying-glass-chart">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="raíces (cruces con X)" value={raicesTexto(rs)} col={VERDE} />
                  <Dato label="intersección con Y" value={`(0, ${fmtNum(iy, 1)})`} col={ORO} />
                  <Dato label="simetría" value={simEtiqueta} col={simColor} />
                  <Dato label="máx. y mín. locales" value={extremosTxt} col={MAGENTA} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  {fn.nota} <strong style={{ color: simColor }}>{simetriaTexto(sim)}</strong>
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
              <Bloque titulo="Qué es una función" icono="fa-chart-line">
                <p style={{ margin: 0, color: T.text2 }}>
                  Una <strong style={{ color: T.text }}>función de variable real</strong> asigna a cada número <strong>x</strong> un único valor <strong>y = f(x)</strong>. Su <strong style={{ color: accent }}>gráfica</strong> es el conjunto de todos los puntos (x, f(x)) en el plano cartesiano: una imagen donde se leen todos sus comportamientos de un vistazo.
                </p>
              </Bloque>

              <Bloque titulo="Los rasgos a leer" icono="fa-list-check">
                <Parte col={VERDE} icon="fa-circle-dot" titulo="Raíces (ceros)">
                  Donde la curva cruza el eje X (f(x) = 0). Una función puede tener varias, una o ninguna.
                </Parte>
                <Parte col={ORO} icon="fa-arrow-up-from-bracket" titulo="Intersección con Y">
                  El punto (0, f(0)) donde la curva corta el eje vertical: el valor cuando x = 0.
                </Parte>
                <Parte col={MAGENTA} icon="fa-mountain" titulo="Máximos y mínimos">
                  Cumbres y valles donde la función deja de crecer y empieza a decrecer (o al revés).
                </Parte>
                <Parte col={CIAN} icon="fa-arrows-left-right-to-line" titulo="Simetría (par / impar)">
                  Par: espejo en el eje Y (f(−x) = f(x)). Impar: giro de 180° en el origen (f(−x) = −f(x)).
                </Parte>
              </Bloque>

              <Bloque titulo="¿Qué dice la simetría?" icono="fa-shield-halved">
                <p style={{ margin: 0, color: T.text2 }}>
                  Una función es <strong style={{ color: ORO }}>PAR</strong> si su gráfica es un <strong>espejo respecto al eje Y</strong> (f(−x) = f(x)); es <strong style={{ color: CIAN }}>IMPAR</strong> si gira <strong>180° alrededor del origen</strong> (f(−x) = −f(x)). Con el reflejo activado: si es par o impar, la curva punteada se <strong>encima</strong> a la sólida; si no hay simetría, el reflejo <strong style={{ color: ROJO }}>no coincide</strong>.
                </p>
              </Bloque>

              <Bloque titulo="Crecer y decrecer" icono="fa-arrow-trend-up">
                <p style={{ margin: 0, color: T.text2 }}>
                  Una función <strong style={{ color: T.text }}>crece</strong> donde la curva sube al avanzar en x y <strong>decrece</strong> donde baja. Entre un tramo creciente y uno decreciente hay un <strong style={{ color: MAGENTA }}>máximo</strong>; entre uno decreciente y uno creciente, un <strong style={{ color: CIAN }}>mínimo</strong>. Hallar esos extremos —optimizar— es uno de los grandes usos del cálculo.
                </p>
              </Bloque>

              <Bloque titulo="En la vida real (México)" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>
                  Una <strong>parábola</strong> describe el clavado en Acapulco o el chorro de una fuente; una <strong>recta</strong>, un ritmo constante como la tarifa del taxi o el recibo de CFE; una función <strong>senoidal</strong>, ciclos que se repiten: la temperatura del día en la CDMX, las mareas del Golfo o la corriente alterna a 60 Hz de la red eléctrica. Reconocer la forma —y su simetría— ayuda a predecir el fenómeno.
                </p>
              </Bloque>

              <Bloque titulo="Pista para el reto" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Para el ejercicio de A2 elige <strong style={{ color: accent }}>f(x) = x³ − 3x</strong>: con el reflejo activado verás que el giro por el origen se encima (es <strong style={{ color: CIAN }}>impar</strong>), y con los rasgos aparecerán sus tres raíces (−√3, 0, √3) y sus extremos (−1, 2) y (1, −2).
                </p>
              </Bloque>

              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={FUNCIONES_VR_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
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
