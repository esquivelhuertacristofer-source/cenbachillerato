"use client";

/**
 * Laboratorio 3D — Ecuaciones lineales: el modelo de barras.
 * Práctica experimental para PM-II-P04-A2 ("Planteo y resuelvo ecuaciones lineales").
 *
 * El reto de esta actividad es PLANTEAR un problema en palabras como una ecuación
 * a·x + b = c y luego resolverlo. EXPERIMENTO CENTRAL: el alumno mueve la incógnita
 * x y VE crecer la barra a·x + b hasta tocar la meta c; si se pasa, el exceso se
 * pone rojo y el medidor dice cuánto sobra; si se queda corto, dice cuánto falta.
 * Se complementa con el despeje x = (c − b) / a. Es un enfoque distinto al
 * laboratorio de la balanza (PM-II-P09-A8), que enfatiza el equilibrio al despejar.
 * Pensamiento Matemático II — Ecuaciones lineales en una variable (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { ECUACION_LINEAL_FICHA } from "./ecuacion-lineal-barras-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./ecuacion-lineal-barras-data";
import { LabSfx } from "./lab-audio";
import {
  ESCENARIOS,
  solucion,
  total,
  ecuacionStr,
  fmtNum,
  type Escenario,
} from "./ecuaciones-data";

const EcuacionesScene = dynamic(() => import("./EcuacionesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-ruler-horizontal fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const AMBER = "#FFD166";
const OKC = "#34D399";
const ROJO = "#FF6B6B";
const META = "#9fc0e0";

const RETO_KEY = "cen-ecuacion-lineal-barras-reto";

const BTN = (accent: string, rgba: string): CSSProperties => ({
  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 11,
  border: `1px solid ${accent}66`, background: `rgba(${rgba},0.14)`, color: "#fff", fontSize: 14, fontWeight: 800,
});

export function LabEcuaciones({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [escKey, setEscKey] = useState(ESCENARIOS[0]!.key);
  const esc = useMemo<Escenario>(() => ESCENARIOS.find((e) => e.key === escKey) ?? ESCENARIOS[0]!, [escKey]);

  const [x, setX] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [verDespeje, setVerDespeje] = useState(false);

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
  const [movioX, setMovioX] = useState(false);
  const [sePaso, setSePaso] = useState(false);
  const [resueltos, setResueltos] = useState<Set<string>>(() => new Set<string>());

  const sol = useMemo(() => solucion(esc), [esc]);
  const totalActual = total(esc.a, esc.b, x);
  const resuelto = totalActual === esc.c;
  const dif = esc.c - totalActual; // >0 falta, <0 sobra

  const cambiarX = (nx: number) => {
    setX(nx);
    setMovioX(true);
    const t = esc.a * nx + esc.b;
    if (t > esc.c) setSePaso(true);
    if (t === esc.c) {
      setResueltos((prev) => (prev.has(esc.key) ? prev : new Set(prev).add(esc.key)));
      if (sonido) audioRef.current?.correcto();
    } else if (sonido) {
      audioRef.current?.blip();
    }
  };

  const cargar = (id: string) => {
    const e = ESCENARIOS.find((s) => s.key === id);
    if (!e) return;
    if (sonido) audioRef.current?.blip();
    setEscKey(e.key);
    setX(0);
    setVerDespeje(false);
    setResetNonce((n) => n + 1);
  };

  const reset = () => {
    setX(0);
    setResetNonce((n) => n + 1);
  };

  const resolver = () => {
    setX(sol);
    setMovioX(true);
    setResueltos((prev) => (prev.has(esc.key) ? prev : new Set(prev).add(esc.key)));
  };

  const objetivos = [
    { txt: "Pásate de la meta a propósito: la barra se pone roja y marca cuánto sobra", done: sePaso },
    { txt: "Mueve la incógnita y observa cómo crece la barra", done: movioX },
    { txt: "Haz que la barra llegue justo a la meta (resuelve uno)", done: resueltos.size >= 1 },
    { txt: "Resuelve los 3 problemas planteados", done: resueltos.size >= ESCENARIOS.length },
    { txt: "Descubre el despeje x = (c − b) / a", done: verDespeje },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${esc.icono}`} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text, ...NUM }}>{ecuacionStr(esc)}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: despeja{" "}
        <strong>{esc.xNombre} = (c − b) / a = {fmtNum(sol, 2)} {esc.unidad}</strong>.
      </div>
    </div>
  );

  const colEstado = resuelto ? OKC : dif < 0 ? ROJO : accent;
  const lectura = resuelto
    ? <>¡Resuelto! {esc.xNombre} = {fmtNum(x)} {esc.unidad}</>
    : dif < 0
      ? <>Te pasas {fmtNum(-dif)}: baja {esc.xNombre}</>
      : <>Faltan {fmtNum(dif)} para la meta: sube {esc.xNombre}</>;

  const porque = resuelto
    ? `${ecuacionStr(esc)} se cumple: ${esc.a === 1 ? "" : `${fmtNum(esc.a)}·`}${fmtNum(x)} + ${fmtNum(esc.b)} = ${fmtNum(esc.c)}. Esa es la solución.`
    : dif < 0
      ? `La barra mide ${fmtNum(totalActual)} y la meta es ${fmtNum(esc.c)}: sobran ${fmtNum(-dif)}. Cada unidad que bajas ${esc.xNombre} acorta la barra ${fmtNum(esc.a)}.`
      : `La barra mide ${fmtNum(totalActual)} y la meta es ${fmtNum(esc.c)}: faltan ${fmtNum(dif)}. Cada unidad que subes ${esc.xNombre} alarga la barra ${fmtNum(esc.a)}.`;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <EcuacionesScene a={esc.a} b={esc.b} c={esc.c} x={x} xMax={esc.xMax} xNombre={esc.xNombre} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      modos={{
        opciones: ESCENARIOS.map((e) => ({ id: e.key, etiqueta: e.titulo, icono: e.icono })),
        valor: escKey,
        cambiar: cargar,
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar la incógnita a 0" onClick={reset} />
        </>
      }
      leyenda={
        <div style={{ display: "grid", gap: 6, width: 190 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", ...NUM }}>{ecuacionStr(esc)}</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
            <span>barra</span>
            <span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtNum(totalActual)} / {fmtNum(esc.c)}</span>
          </div>
          <div style={{ position: "relative", height: 10, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, (totalActual / Math.max(esc.c, totalActual)) * 100)}%`, height: "100%", background: colEstado, transition: "width 140ms linear, background 140ms linear" }} />
            {totalActual > esc.c && <div style={{ position: "absolute", left: `${(esc.c / totalActual) * 100}%`, top: 0, bottom: 0, width: 2, background: "#fff" }} />}
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: colEstado }}>
            {resuelto ? "Justo en la meta" : dif < 0 ? `Sobran ${fmtNum(-dif)}` : `Faltan ${fmtNum(dif)}`}
          </div>
        </div>
      }
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
                <p style={{ margin: 0, color: T.text, fontWeight: 600 }}>{esc.historia}</p>
                <Deslizador
                  label={`incógnita · ${esc.xNombre}${esc.unidad ? ` (${esc.unidad})` : ""}`}
                  icon="fa-ruler-horizontal"
                  colr={accent}
                  valor={`${esc.xNombre} = ${fmtNum(x)}`}
                  min={esc.xMin}
                  max={esc.xMax}
                  step={esc.xStep}
                  value={x}
                  onChange={cambiarX}
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label={`${esc.a === 1 ? "" : `${fmtNum(esc.a)}·`}${esc.xNombre}`} value={fmtNum(esc.a * x)} col={accent} />
                  <Dato label="+ constante" value={`+ ${fmtNum(esc.b)}`} col={AMBER} />
                  <Dato label="total de la barra" value={fmtNum(totalActual)} col={resuelto ? OKC : "#fff"} />
                  <Dato label={resuelto ? "diferencia" : dif < 0 ? "sobra" : "falta"} value={fmtNum(Math.abs(dif))} col={colEstado} />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${colEstado}55`, background: `${colEstado}12` }}>
                  {porque}
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" style={BTN(accent, color.rgba)} onClick={resolver}>
                    <i className="fa-solid fa-wand-magic-sparkles" aria-hidden /> Resolver
                  </button>
                  <button type="button" style={BTN(accent, color.rgba)} onClick={() => setVerDespeje((v) => !v)}>
                    <i className="fa-solid fa-square-root-variable" aria-hidden /> {verDespeje ? "Ocultar" : "Ver"} despeje
                  </button>
                </div>
                {verDespeje && (
                  <div style={{ borderRadius: 13, border: `1px solid ${accent}55`, background: `rgba(${color.rgba},0.10)`, padding: "12px 14px", lineHeight: 1.7, ...NUM }}>
                    <div>{ecuacionStr(esc)}</div>
                    <div style={{ color: T.text2 }}>{esc.a === 1 ? "" : esc.a + esc.xNombre} {esc.b ? `= ${fmtNum(esc.c)} − ${fmtNum(esc.b)} = ${fmtNum(esc.c - esc.b)}` : `= ${fmtNum(esc.c)}`}</div>
                    <div style={{ color: accent, fontWeight: 900 }}>{esc.xNombre} = {esc.a === 1 ? "" : `${fmtNum(esc.c - esc.b)} / ${esc.a} = `}{fmtNum(sol, 2)} {esc.unidad}</div>
                    {esc.key === "hermanos" && (
                      <div style={{ color: T.text2, marginTop: 4 }}>menor = {fmtNum(sol)} años · mayor = {fmtNum(sol + 9)} años</div>
                    )}
                  </div>
                )}
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
              <Bloque titulo="Cómo plantearlo" icono="fa-pen">
                <p style={{ margin: 0, color: T.text2 }}>{esc.comoPlantear}</p>
                <div style={{ fontSize: 18, fontWeight: 900, color: accent, ...NUM }}>{ecuacionStr(esc)}</div>
              </Bloque>
              <Bloque titulo="Por qué funciona" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Plantear una ecuación es <strong style={{ color: T.text }}>traducir la historia a una barra</strong>: la parte que depende de la incógnita es <strong style={{ color: accent }}>a·{esc.xNombre}</strong>, lo que se suma siempre es la <strong style={{ color: AMBER }}>constante b</strong>, y el total conocido es la <strong style={{ color: META }}>meta c</strong>. Resolver es encontrar el valor de {esc.xNombre} que hace que la barra mida justo c. Despejando: primero quitas la constante (c − b) y luego repartes entre a, es decir <strong style={{ color: T.text }}>{esc.xNombre} = (c − b) / a</strong>.
                </p>
              </Bloque>
              <Bloque titulo="Cómo plantear y resolver" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  <li>Nombra la incógnita: «sea {esc.xNombre} …».</li>
                  <li>Traduce cada dato a un segmento: <strong>a·{esc.xNombre}</strong> y la constante <strong>b</strong>.</li>
                  <li>Iguala a la meta: <strong>a·{esc.xNombre} + b = c</strong>.</li>
                  <li>Despeja: <strong>{esc.xNombre} = (c − b) / a</strong>.</li>
                </ol>
                <p style={{ margin: 0, color: T.text2 }}>
                  La clave de un problema con palabras es nombrar la incógnita y traducir cada frase a un segmento de la barra. Este lab va de <strong style={{ color: T.text }}>plantear</strong>; para profundizar en el <strong style={{ color: T.text }}>despeje</strong> con equilibrio, está el laboratorio de la balanza.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ECUACION_LINEAL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}
