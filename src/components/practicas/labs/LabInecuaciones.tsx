"use client";

/**
 * Laboratorio 3D — Inecuaciones lineales.
 * Práctica experimental para PM-II-P06-A2
 * ("Planteo y resuelvo inecuaciones lineales"; progresión 103).
 *
 * Una inecuación compara dos cantidades con <, ≤, > o ≥ y su solución es un
 * CONJUNTO, no un punto: un rayo sobre la recta numérica (una variable) o un
 * semiplano en el plano (dos variables). Se resuelve igual que una ecuación con
 * una excepción crítica: al dividir entre un número negativo, el signo se
 * invierte. En la recta, punto abierto (○) si el límite no se incluye, cerrado
 * (●) si sí; en el plano, frontera continua (≤/≥) o punteada (</>).
 * Pensamiento Matemático II — Introducción al Álgebra (MCCEMS 2025).
 *
 * EXPERIMENTO CENTRAL: el alumno mueve una «x de prueba» y ve una báscula 3D:
 * la columna mide a·x+b y la barra dorada marca c. Cuando la columna cruza la
 * barra, la x pasa de no cumplir (rojo) a cumplir (verde): ahí está la frontera.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { INECUACIONES_FICHA } from "./inecuaciones-lineales-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./inecuaciones-lineales-data";
import { LabSfx } from "./lab-audio";
import {
  type ModoKey,
  type Op,
  MODOS,
  OPS,
  getModo,
  getOp,
  DEFAULTS,
  resolverRecta,
  satisfaceRecta,
  fmtNum,
  fmtTerminoX,
  fmtTerminoXY,
  A_MIN, A_MAX, A_STEP, B_MIN, B_MAX, B_STEP, C_MIN, C_MAX, C_STEP,
  RECTA_MIN, RECTA_MAX,
} from "./inecuaciones-data";

const InecuacionesScene = dynamic(() => import("./InecuacionesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-arrows-left-right-to-line fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const ROJO = "#ff7a7a";
const ORO = "#ffd24a";

const RETO_KEY = "cen-inecuaciones-lineales-reto";

export function LabInecuaciones({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<ModoKey>("recta");
  const [a, setA] = useState(DEFAULTS.recta.a);
  const [b, setB] = useState(DEFAULTS.recta.b);
  const [c, setC] = useState(DEFAULTS.recta.c);
  const [op, setOp] = useState<Op>(DEFAULTS.recta.op);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  // x de prueba que el alumno mueve a mano (null = la cuenta barre sola)
  const [xs, setXs] = useState<number | null>(null);

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
  const [vioRecta, setVioRecta] = useState(true);
  const [vioPlano, setVioPlano] = useState(false);
  const [vioFlip, setVioFlip] = useState(false);
  const [cambioOp, setCambioOp] = useState(false);
  const [cruzoFrontera, setCruzoFrontera] = useState(false);

  const md = useMemo(() => getModo(modo), [modo]);
  const esRecta = modo === "recta";
  const opDef = useMemo(() => getOp(op), [op]);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarModo = (k: ModoKey) => {
    setModo(k);
    const d = DEFAULTS[k];
    setA(d.a); setB(d.b); setC(d.c); setOp(d.op);
    setXs(null);
    bump();
    if (k === "recta") setVioRecta(true);
    if (k === "plano") setVioPlano(true);
  };

  // 'a' no puede ser 0 en modo recta (dejaría de ser inecuación en x);
  // en modo plano, no pueden ser 0 a y b a la vez.
  const cambiarA = (v: number) => {
    if (esRecta && v === 0) v = a < 0 ? -1 : 1;
    if (!esRecta && v === 0 && b === 0) v = 1;
    setA(v);
    if (v < 0) setVioFlip(true);
  };
  const cambiarB = (v: number) => {
    if (!esRecta && v === 0 && a === 0) v = 1;
    setB(v);
  };
  const cambiarOp = (k: Op) => { setOp(k); setCambioOp(true); if (sonido) audioRef.current?.blip(); };

  // Mueve la x de prueba; si cambia de cumplir a no cumplir (o al revés), cruzó la frontera.
  const moverSonda = (v: number) => {
    if (xs !== null && satisfaceRecta(xs, a, b, c, op) !== satisfaceRecta(v, a, b, c, op)) {
      setCruzoFrontera(true);
      if (sonido) audioRef.current?.blip();
    }
    setXs(v);
  };

  const reset = () => {
    const d = DEFAULTS[modo];
    setA(d.a); setB(d.b); setC(d.c); setOp(d.op);
    setXs(null);
    bump();
  };

  const sol = useMemo(() => resolverRecta(a, b, c, op), [a, b, c, op]);

  // textos de la inecuación
  const izq = esRecta ? fmtTerminoX(a, b) : fmtTerminoXY(a, b);
  const inecuacion = `${izq} ${opDef.sim} ${fmtNum(c, 0)}`;
  const solucionTxt = `x ${getOp(sol.opFinal).sim} ${fmtNum(sol.k, 2)}`;

  // báscula de la x de prueba
  const lhsSonda = xs === null ? null : a * xs + b;
  const cumpleSonda = xs === null ? null : satisfaceRecta(xs, a, b, c, op);

  const objetivos = [
    { txt: "Mueve la x de prueba hasta que la columna cruce la barra dorada", done: cruzoFrontera },
    { txt: "Resuelve una inecuación de una variable", done: vioRecta },
    { txt: "Pon a negativa y observa el giro del signo", done: vioFlip },
    { txt: "Cambia el símbolo (< ≤ > ≥)", done: cambioOp },
    { txt: "Explora el semiplano con dos variables", done: vioPlano },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-arrows-left-right-to-line" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>La solución de una inecuación es un conjunto, no un punto</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: una inecuación define un rayo en la recta o un semiplano en el plano. Y recuerda: dividir entre un negativo invierte el signo.
      </div>
    </div>
  );

  // lectura corta en vivo
  let lectura: React.ReactNode;
  if (esRecta && xs !== null && lhsSonda !== null) {
    lectura = (
      <>
        x = {fmtNum(xs, 1)}: {fmtNum(lhsSonda, 1)} {opDef.sim} {fmtNum(c, 0)}? <strong style={{ color: cumpleSonda ? VERDE : ROJO }}>{cumpleSonda ? "Sí cumple" : "No cumple"}</strong>
      </>
    );
  } else if (esRecta) {
    lectura = <>Solución: <strong style={{ color: ORO }}>{solucionTxt}</strong></>;
  } else {
    lectura = <>Región verde: <strong style={{ color: ORO }}>{inecuacion}</strong></>;
  }

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <InecuacionesScene
            modo={modo}
            a={a}
            b={b}
            c={c}
            op={op}
            accent={accent}
            pausado={pausado}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
            sonda={esRecta ? xs : null}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m.key, etiqueta: m.nombre, icono: m.icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as ModoKey),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta
            icono={pausado ? "fa-play" : "fa-pause"}
            titulo={xs !== null ? "Volver al barrido automático" : pausado ? "Reanudar" : "Pausar"}
            activo={!pausado}
            onClick={() => { if (xs !== null) setXs(null); else setPausado((p) => !p); }}
          />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
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
              <Bloque titulo="Arma tu inecuación" icono="fa-sliders">
                <div style={{ fontSize: 15, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{inecuacion}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {OPS.map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      className="ex-opbtn"
                      data-on={op === o.key}
                      onClick={() => cambiarOp(o.key)}
                      title={o.lee}
                      aria-label={o.lee}
                    >
                      {o.sim}
                    </button>
                  ))}
                </div>
                <Deslizador label="Coeficiente de x (a)" icon="fa-a" colr={accent}
                  valor={fmtNum(a, 0)} min={A_MIN} max={A_MAX} step={A_STEP} value={a} onChange={cambiarA}
                  hintL={esRecta ? "negativo: el signo gira" : undefined} hintR={esRecta ? "0 no permitido" : undefined} />
                <Deslizador label={esRecta ? "Término independiente (b)" : "Coeficiente de y (b)"} icon="fa-b" colr="#7fb0e0"
                  valor={fmtNum(b, 0)} min={B_MIN} max={B_MAX} step={B_STEP} value={b} onChange={cambiarB} />
                <Deslizador label="Lado derecho (c)" icon="fa-equals" colr={ORO}
                  valor={fmtNum(c, 0)} min={C_MIN} max={C_MAX} step={C_STEP} value={c} onChange={setC} />
              </Bloque>

              {esRecta && (
                <Bloque titulo="Prueba una x" icono="fa-vial">
                  <Deslizador label="x de prueba" icon="fa-location-dot" colr={VERDE}
                    valor={xs === null ? "automática" : fmtNum(xs, 1)} min={RECTA_MIN} max={RECTA_MAX} step={0.5}
                    value={xs ?? 0} onChange={moverSonda}
                    hintL="mueve y mira la columna" hintR="¿cruza la barra dorada?" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                    <Dato label={`${fmtTerminoX(a, b)} =`} value={lhsSonda === null ? "—" : fmtNum(lhsSonda, 1)} col={accent} />
                    <Dato label={`${opDef.sim} c =`} value={fmtNum(c, 0)} col={ORO} />
                  </div>
                  <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${(cumpleSonda === null ? accent : cumpleSonda ? VERDE : ROJO)}55`, background: `${(cumpleSonda === null ? accent : cumpleSonda ? VERDE : ROJO)}12` }}>
                    {cumpleSonda === null
                      ? "Mueve la x de prueba: la columna mide a·x + b y la barra dorada marca c. Cuando la columna pasa la barra del lado correcto, la x cumple."
                      : cumpleSonda
                        ? `La columna queda del lado que pide ${opDef.sim}: x = ${fmtNum(xs ?? 0, 1)} SÍ es solución (verde).`
                        : `La columna queda del otro lado de la barra: x = ${fmtNum(xs ?? 0, 1)} NO es solución (rojo).`}
                  </p>
                </Bloque>
              )}

              <Bloque titulo={esRecta ? "Solución sobre la recta" : "El semiplano solución"} icono="fa-square-root-variable">
                {esRecta ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                      <Dato label="Solución" value={solucionTxt} col={accent} />
                      <Dato label="Frontera x =" value={fmtNum(sol.k, 2)} col={ORO} />
                      <Dato label="Límite" value={sol.incluye ? "● incluido" : "○ abierto"} col={VERDE} />
                    </div>
                    {sol.flipped ? (
                      <p style={{ margin: 0, color: "#ffd9a8", background: "rgba(255,138,58,0.12)", border: "1px solid rgba(255,138,58,0.35)", borderRadius: 10, padding: "10px 12px" }}>
                        <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 7, color: ORO }} />
                        Como <strong>a = {fmtNum(a, 0)}</strong> es negativo, al dividir entre él el signo se <strong>invirtió</strong>: <strong style={{ color: accent }}>{opDef.sim}</strong> pasó a <strong style={{ color: accent }}>{getOp(sol.opFinal).sim}</strong>.
                      </p>
                    ) : (
                      <p style={{ margin: 0, color: T.text2 }}>
                        Despejas la x igual que en una ecuación: <strong style={{ color: T.text }}>{inecuacion}</strong> → <strong style={{ color: accent }}>{solucionTxt}</strong>. La solución son <strong>todos</strong> los valores del rayo, no uno solo.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                      <Dato label="Frontera" value={`${fmtTerminoXY(a, b)} = ${fmtNum(c, 0)}`} col={ORO} />
                      <Dato label="Trazo" value={opDef.incluye ? "continua" : "punteada"} col={VERDE} />
                    </div>
                    <p style={{ margin: 0, color: T.text2 }}>
                      La recta <strong style={{ color: ORO }}>{fmtTerminoXY(a, b)} = {fmtNum(c, 0)}</strong> parte el plano en dos. La región <strong style={{ color: VERDE }}>verde elevada</strong> es el conjunto solución: todos los puntos (x, y) que cumplen <strong style={{ color: accent }}>{inecuacion}</strong>. {opDef.incluye ? "La frontera está incluida (trazo continuo)." : "La frontera no está incluida (trazo punteado)."}
                    </p>
                  </>
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
              <Bloque titulo={md.nombre} icono={md.icono}>
                <p style={{ margin: 0, color: T.text2 }}>{md.resumen}</p>
              </Bloque>
              <Bloque titulo="Ecuación vs. inecuación" icono="fa-not-equal">
                <p style={{ margin: 0, color: T.text2 }}>
                  Una <strong style={{ color: T.text }}>ecuación</strong> (=) tiene una solución única: un punto. Una <strong style={{ color: accent }}>inecuación</strong> (&lt;, ≤, &gt;, ≥) tiene un <strong>conjunto infinito</strong> de soluciones: un <strong>intervalo</strong> sobre la recta (una variable) o un <strong>semiplano</strong> en el plano (dos variables).
                </p>
              </Bloque>
              <Bloque titulo="Los cuatro símbolos" icono="fa-greater-than-equal">
                {OPS.map((o) => (
                  <div key={o.key} style={{ display: "flex", alignItems: "center", gap: 11, color: T.text2 }}>
                    <span style={{ width: 30, textAlign: "center", fontSize: 18, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{o.sim}</span>
                    <span>{o.lee} — límite <strong style={{ color: o.incluye ? VERDE : "#9fb2c8" }}>{o.incluye ? "incluido (●)" : "abierto (○)"}</strong></span>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="¡Cuidado! El giro del signo" icono="fa-triangle-exclamation">
                <p style={{ margin: 0, color: T.text2 }}>
                  Operas igual que en una ecuación, con <strong>una</strong> excepción: al multiplicar o dividir ambos lados por un número <strong style={{ color: ORO }}>negativo</strong>, el signo de la desigualdad se <strong style={{ color: accent }}>invierte</strong>.
                </p>
                <div style={{ padding: "8px 11px", borderRadius: 8, background: T.inset, fontFamily: "ui-monospace, monospace", fontSize: 15, color: T.text }}>
                  −2x &gt; 6 → x <strong style={{ color: accent }}>&lt;</strong> −3
                </div>
                <p style={{ margin: 0, color: T.text2 }}>Pon <strong>a</strong> en negativo y míralo en el panel de solución.</p>
              </Bloque>
              <Bloque titulo="En la vida real (México)" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>
                  Las inecuaciones son el lenguaje de las <strong>restricciones</strong>: el salario mínimo (salario ≥ mínimo), el presupuesto familiar (gastos ≤ ingreso), o las hectáreas de un cultivo (trigo + maíz ≤ 100). Empresas como FEMSA o Bimbo usan sistemas de inecuaciones —<strong>programación lineal</strong>— para optimizar rutas y producción.
                </p>
              </Bloque>
              <Bloque titulo="Cómo leer la escena" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  En <strong style={{ color: accent }}>Una variable</strong>, la cuenta que recorre la recta se pone <strong style={{ color: VERDE }}>verde</strong> justo donde cumple la inecuación: ese tramo es la solución. En <strong style={{ color: accent }}>Dos variables</strong>, la región que se <strong style={{ color: VERDE }}>eleva</strong> es el semiplano solución.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={INECUACIONES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <style>{`
                .ex-opbtn { cursor:pointer; flex:1 1 0; min-width:0; padding:10px 6px; border-radius:11px; border:1px solid ${T.line};
                  background:${T.inset}; color:${T.text2}; font-size:18px; font-weight:900; font-family:ui-monospace,monospace; transition:all .15s; }
                .ex-opbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
                .ex-opbtn[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
              `}</style>
            </>
          ),
        },
      ]}
    />
  );
}
