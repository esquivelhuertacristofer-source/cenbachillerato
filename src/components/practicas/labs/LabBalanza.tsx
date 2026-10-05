"use client";

/**
 * Laboratorio 3D — Ecuación lineal de una variable (la balanza).
 * Práctica experimental para PM-II-P09-A8.
 *
 * Una ecuación a·x + b = c es una BALANZA en equilibrio. El estudiante despeja x
 * aplicando la PROPIEDAD DE UNIFORMIDAD: quita las mismas unidades de AMBOS lados
 * (la balanza sigue nivelada) y luego reparte en partes iguales. Si opera en un
 * SOLO lado, la balanza se inclina: rompió la igualdad. Cuando queda una sola x
 * frente a su valor, el problema está resuelto.
 * Pensamiento Matemático II — Ecuación, igualdad y sus propiedades (MCCEMS 2025).
 *
 * Experimento central: el brazo se inclina o se nivela según lo que el alumno
 * haga en uno o en ambos lados; el medidor del brazo lo muestra en vivo.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { ECUACION_BALANZA_FICHA } from "./ecuacion-lineal-balanza-ficha";
import { RETO_A2 } from "./ecuacion-lineal-balanza-data";
import {
  ESCENARIOS,
  solucion,
  ladoIzq,
  estadoInicial,
  type Escenario,
  type Estado,
} from "./balanza-data";

const BalanzaScene = dynamic(() => import("./BalanzaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-scale-balanced fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const GOLD = "#FFD166";
const WARN = "#F97066";

const RETO_KEY = "cen-ecuacion-lineal-balanza-reto";

export function LabBalanza({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [escKey, setEscKey] = useState(ESCENARIOS[0]!.key);
  const esc = useMemo<Escenario>(() => ESCENARIOS.find((e) => e.key === escKey) ?? ESCENARIOS[0]!, [escKey]);

  const xTrue = useMemo(() => solucion(esc), [esc]);
  const [st, setSt] = useState<Estado>(() => estadoInicial(ESCENARIOS[0]!));
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
  const [usoUniformidad, setUsoUniformidad] = useState(false);
  const [rompioIgualdad, setRompioIgualdad] = useState(false);
  const [resueltos, setResueltos] = useState<Set<string>>(() => new Set<string>());

  const equilibrada = st.aCount * xTrue + st.leftUnits === st.rightUnits;
  const resuelto = st.aCount === 1 && st.leftUnits === 0 && equilibrada;

  const cargar = (e: Escenario) => {
    setEscKey(e.key);
    setSt(estadoInicial(e));
    setResetNonce((n) => n + 1);
  };

  const reset = () => {
    setSt(estadoInicial(esc));
    setResetNonce((n) => n + 1);
  };

  const marcarResuelto = (e: Estado) => {
    if (e.aCount === 1 && e.leftUnits === 0 && e.aCount * xTrue + e.leftUnits === e.rightUnits) {
      setResueltos((prev) => (prev.has(esc.key) ? prev : new Set(prev).add(esc.key)));
    }
  };

  // Operaciones
  const quitarAmbos = () => {
    if (st.leftUnits <= 0 || st.rightUnits <= 0) return;
    const e = { ...st, leftUnits: st.leftUnits - 1, rightUnits: st.rightUnits - 1 };
    setSt(e);
    setUsoUniformidad(true);
    if (sonido) audioRef.current?.blip();
    marcarResuelto(e);
  };

  const dividir = () => {
    if (st.leftUnits !== 0 || st.aCount <= 1 || st.rightUnits % st.aCount !== 0) return;
    const e = { ...st, rightUnits: st.rightUnits / st.aCount, aCount: 1 };
    setSt(e);
    setUsoUniformidad(true);
    if (sonido) audioRef.current?.blip();
    marcarResuelto(e);
  };

  const quitarIzq = () => {
    if (st.leftUnits <= 0) return;
    setSt({ ...st, leftUnits: st.leftUnits - 1 });
    setRompioIgualdad(true);
  };

  const quitarDer = () => {
    if (st.rightUnits <= 0) return;
    setSt({ ...st, rightUnits: st.rightUnits - 1 });
    setRompioIgualdad(true);
  };

  const leftLabel = ladoIzq(st.aCount, st.leftUnits);
  const rightLabel = String(st.rightUnits);

  const puedeAmbos = st.leftUnits > 0 && st.rightUnits > 0;
  const puedeDividir = st.leftUnits === 0 && st.aCount > 1 && st.rightUnits % st.aCount === 0;

  // Pista del siguiente paso
  const pista = resuelto
    ? `¡x está despejada! En "${esc.titulo}" la incógnita vale ${xTrue} ${esc.unidad}.`
    : !equilibrada
    ? "La balanza está inclinada: rompiste la igualdad. Aplica la MISMA operación en el otro lado o reinicia."
    : st.leftUnits > 0
    ? `Quita las ${st.leftUnits} unidad${st.leftUnits === 1 ? "" : "es"} sueltas de AMBOS lados para dejar sola la x.`
    : st.aCount > 1
    ? `Tienes ${st.aCount} cajas iguales. Reparte en partes iguales: divide AMBOS lados entre ${st.aCount}.`
    : "Quita peso de ambos lados hasta despejar la x.";

  const estadoColor = resuelto ? GOLD : equilibrada ? OK : WARN;
  const estadoTxt = resuelto ? "x despejada" : equilibrada ? "En equilibrio" : "Igualdad rota";

  const objetivos = [
    { txt: "Quita 1 solo de un lado y mira cómo se inclina la balanza", done: rompioIgualdad },
    { txt: "Quita unidades de ambos lados (uniformidad)", done: usoUniformidad },
    { txt: "Despeja la x en este problema", done: resuelto },
    { txt: "Resuelve 2 problemas distintos", done: resueltos.size >= 2 },
    { txt: "Resuelve el reto evaluable de la actividad A8", done: ejercicioAprobado },
  ];

  // Medidor del brazo: lo que se VE en la escena, sin revelar el valor de x.
  const desbalance = st.aCount * xTrue + st.leftUnits - st.rightUnits;
  const inclin = Math.max(-1, Math.min(1, desbalance / 6));
  const brazoTxt = desbalance === 0 ? "Brazo nivelado" : desbalance > 0 ? "Baja la izquierda" : "Baja la derecha";

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${esc.icono}`} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{`${leftLabel} = ${rightLabel}`}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: una balanza con{" "}
        <strong>{leftLabel}</strong> de un lado y <strong>{rightLabel}</strong> del otro. Quita lo mismo de ambos lados hasta dejar sola la x.
      </div>
    </div>
  );

  const opStyle = (kind: "ok" | "warn", off: boolean) => ({
    cursor: off ? "not-allowed" : "pointer",
    opacity: off ? 0.4 : 1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 13px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    color: T.text,
    textAlign: "left" as const,
    border: `1px solid ${kind === "ok" ? OK : WARN}55`,
    background: "rgba(255,255,255,0.04)",
    width: "100%",
  });

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <BalanzaScene
            xTrue={xTrue}
            aCount={st.aCount}
            leftUnits={st.leftUnits}
            rightUnits={st.rightUnits}
            leftLabel={leftLabel}
            rightLabel={rightLabel}
            resuelto={resuelto}
            accent={accent}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: ESCENARIOS.map((e) => ({ id: e.key, etiqueta: e.titulo, icono: e.icono })),
        valor: escKey,
        cambiar: (id) => {
          const e = ESCENARIOS.find((x) => x.key === id);
          if (e) cargar(e);
        },
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar el problema" onClick={reset} />
        </>
      }
      leyenda={
        <div style={{ width: 168, display: "grid", gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: estadoColor }}>{brazoTxt}</div>
          <div style={{ position: "relative", height: 10, borderRadius: 6, background: "rgba(255,255,255,0.12)" }}>
            <div style={{ position: "absolute", left: "50%", top: -2, width: 2, height: 14, background: "rgba(255,255,255,0.5)" }} />
            <div style={{ position: "absolute", top: -3, width: 16, height: 16, borderRadius: "50%", background: estadoColor, left: `calc(${50 + inclin * 45}% - 8px)`, transition: "left 200ms ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: T.text2 }}>
            <span>izq</span>
            <span>der</span>
          </div>
        </div>
      }
      lectura={
        <>
          <span style={{ color: accent, ...NUM }}>{leftLabel}</span> = <span style={{ color: resuelto ? GOLD : "#c8d6e6", ...NUM }}>{rightLabel}</span> · {estadoTxt}
        </>
      }
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 10 }}>
                  <button type="button" style={opStyle("ok", !puedeAmbos)} onClick={quitarAmbos} disabled={!puedeAmbos}>
                    <i className="fa-solid fa-minus" style={{ color: OK }} aria-hidden />
                    <span>Quitar 1 de <strong>ambos</strong> lados</span>
                  </button>
                  <button type="button" style={opStyle("ok", !puedeDividir)} onClick={dividir} disabled={!puedeDividir}>
                    <i className="fa-solid fa-divide" style={{ color: OK }} aria-hidden />
                    <span>Dividir ambos entre {st.aCount > 1 ? st.aCount : esc.a}</span>
                  </button>
                </div>
              </Bloque>
              <Bloque titulo="Prueba romper la igualdad" icono="fa-triangle-exclamation">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 10 }}>
                  <button type="button" style={opStyle("warn", st.leftUnits <= 0)} onClick={quitarIzq} disabled={st.leftUnits <= 0}>
                    <i className="fa-solid fa-arrow-left" style={{ color: WARN }} aria-hidden />
                    <span>Quitar 1 solo a la izquierda</span>
                  </button>
                  <button type="button" style={opStyle("warn", st.rightUnits <= 0)} onClick={quitarDer} disabled={st.rightUnits <= 0}>
                    <i className="fa-solid fa-arrow-right" style={{ color: WARN }} aria-hidden />
                    <span>Quitar 1 solo a la derecha</span>
                  </button>
                </div>
              </Bloque>
              <Bloque titulo="La balanza ahora" icono="fa-scale-balanced">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Lado izquierdo" value={leftLabel} col={accent} />
                  <Dato label="Lado derecho" value={rightLabel} col="#c8d6e6" />
                  <Dato label="Balanza" value={estadoTxt} col={estadoColor} />
                  <Dato label="Resueltos" value={`${resueltos.size}/${ESCENARIOS.length}`} col={OK} />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${estadoColor}55`, background: `${estadoColor}14`, fontWeight: 700 }}>
                  <i className={`fa-solid ${resuelto ? "fa-circle-check" : equilibrada ? "fa-lightbulb" : "fa-triangle-exclamation"}`} style={{ color: estadoColor, marginRight: 8 }} aria-hidden />
                  {pista}
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
              <Bloque titulo="La propiedad de uniformidad" icono="fa-equals">
                <p style={{ margin: 0, color: T.text2 }}>
                  Una ecuación es una <strong style={{ color: T.text }}>igualdad</strong>: los dos platos pesan lo mismo. Si haces algo de un lado <strong style={{ color: T.text }}>tienes que hacerlo del otro</strong>, así la balanza sigue nivelada. Por eso para despejar la <strong style={{ color: accent }}>x</strong> quitas las mismas unidades de ambos lados y luego repartes en partes iguales: cuando queda una sola x, el otro plato muestra su valor.
                </p>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.10)`, fontWeight: 700 }}>{esc.porque}</p>
              </Bloque>
              <Bloque titulo="Cómo se despeja" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  <li>Quita las unidades sueltas de <strong>ambos</strong> lados (resta lo mismo en los dos).</li>
                  <li>Si quedan varias cajas iguales, <strong>divide</strong> ambos lados entre cuántas son.</li>
                  <li>Queda una sola x: el otro plato muestra su valor.</li>
                </ol>
              </Bloque>
              <Bloque titulo="Operaciones de un solo lado" icono="fa-triangle-exclamation">
                <p style={{ margin: 0, color: T.text2 }}>
                  Sirven para comprobar el error: la balanza se inclina porque rompiste la igualdad. Resolver una ecuación es <strong style={{ color: T.text }}>mantener el equilibrio</strong>: lo que haces de un lado, hazlo del otro.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ECUACION_BALANZA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}
