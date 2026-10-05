"use client";

/**
 * Laboratorio 3D — Trabajo y potencia mecánica.
 * Práctica experimental para CNEYT-II-P05-A1
 * ("Trabajo y potencia mecánica: fórmulas y contexto real").
 *
 * En física, TRABAJO (W) es la transferencia de energía cuando una fuerza
 * desplaza un objeto en la dirección de esa fuerza: W = F · d · cos θ (Joules).
 * Solo cuenta la parte de la fuerza alineada con el movimiento; si la fuerza es
 * perpendicular (θ = 90°), el trabajo es cero. La POTENCIA (P) mide qué tan
 * rápido se hace ese trabajo: P = W / t (Watts; 1 hp ≈ 746 W). El lab deja ver
 * la descomposición de la fuerza y una carrera de potencia entre dos máquinas.
 * Ciencias Naturales, Experimentales y Tecnología II (MCCEMS 2025).
 *
 * Experimento central: mover F, d y θ y ver llenarse (o vaciarse) la barra de
 * trabajo; y en «Potencia», ver llegar primero al elevador de más potencia.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { TRABAJO_POTENCIA_FICHA } from "./trabajo-potencia-mecanica-ficha";
import { RETO_A2 } from "./trabajo-potencia-mecanica-data";
import {
  type ModoKey,
  MODOS,
  getModo,
  DEFAULTS,
  trabajo,
  fuerzaUtil,
  fuerzaPerp,
  tiempo,
  wattAHp,
  fmtNum,
  W_POTENCIA,
  F_MIN, F_MAX, F_STEP, D_MIN, D_MAX, D_STEP, THETA_MIN, THETA_MAX, THETA_STEP,
  P_MIN, P_MAX, P_STEP,
} from "./trabajo-potencia-data";

const TrabajoPotenciaScene = dynamic(() => import("./TrabajoPotenciaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-gauge-high fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const UTILC = "#34D399";
const ORO = "#ffd24a";
const PERPC = "#9fb2c8";

const RETO_KEY = "cen-trabajo-potencia-mecanica-reto";

function LegItem({ col, txt }: { col: string; txt: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
      <span style={{ width: 18, height: 0, borderTop: `3px solid ${col}`, flexShrink: 0 }} />
      {txt}
    </div>
  );
}

export function LabTrabajoPotencia({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<ModoKey>("trabajo");
  const [F, setF] = useState<number>(DEFAULTS.F);
  const [d, setD] = useState<number>(DEFAULTS.d);
  const [theta, setTheta] = useState<number>(DEFAULTS.theta);
  const [pA, setPA] = useState<number>(DEFAULTS.pA);
  const [pB, setPB] = useState<number>(DEFAULTS.pB);
  const [pausado, setPausado] = useState(false);
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

  // objetivos
  const [vioTrabajo, setVioTrabajo] = useState(true);
  const [vioPotencia, setVioPotencia] = useState(false);
  const [subioFuerza, setSubioFuerza] = useState(false);
  const [puso90, setPuso90] = useState(false);
  const [cambioPot, setCambioPot] = useState(false);

  const md = useMemo(() => getModo(modo), [modo]);
  const esTrabajo = modo === "trabajo";

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarModo = (k: ModoKey) => {
    setModo(k);
    bump();
    if (sonido) audioRef.current?.blip();
    if (k === "trabajo") setVioTrabajo(true);
    if (k === "potencia") setVioPotencia(true);
  };

  const cambiarF = (v: number) => {
    setF(v);
    if (v >= 2 * DEFAULTS.F) setSubioFuerza(true);
  };
  const cambiarTheta = (v: number) => {
    setTheta(v);
    if (v >= 90) setPuso90(true);
  };
  const cambiarPA = (v: number) => { setPA(v); setCambioPot(true); };
  const cambiarPB = (v: number) => { setPB(v); setCambioPot(true); };

  const reset = () => {
    if (esTrabajo) { setF(DEFAULTS.F); setD(DEFAULTS.d); setTheta(DEFAULTS.theta); }
    else { setPA(DEFAULTS.pA); setPB(DEFAULTS.pB); }
    bump();
  };

  // cálculos en vivo
  const W = useMemo(() => trabajo(F, d, theta), [F, d, theta]);
  const Fu = useMemo(() => fuerzaUtil(F, theta), [F, theta]);
  const Fp = useMemo(() => fuerzaPerp(F, theta), [F, theta]);
  const tA = useMemo(() => tiempo(W_POTENCIA, pA), [pA]);
  const tB = useMemo(() => tiempo(W_POTENCIA, pB), [pB]);

  const objetivos = [
    { txt: "Duplica la fuerza (80 N o más) y mira crecer la barra de trabajo", done: subioFuerza },
    { txt: "Calcula un trabajo con W = F·d·cos θ", done: vioTrabajo },
    { txt: "Pon θ = 90° y ve el trabajo en cero", done: puso90 },
    { txt: "Compara dos potencias (carrera)", done: vioPotencia },
    { txt: "Cambia una potencia y ve el tiempo", done: cambioPot },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-person-walking" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Trabajo es fuerza por distancia… en la misma dirección</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: W = F·d·cos θ. Solo la parte de la fuerza que va con el movimiento hace trabajo; la potencia (P = W/t) dice qué tan rápido se hace.
      </div>
    </div>
  );

  const lectura = esTrabajo
    ? `W = ${fmtNum(F, 0)} × ${fmtNum(d, 1)} × cos ${fmtNum(theta, 0)}° = ${fmtNum(W, 0)} J`
    : `A tarda ${fmtNum(tA, 1)} s; B tarda ${fmtNum(tB, 1)} s.`;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <TrabajoPotenciaScene
            modo={modo}
            F={F}
            d={d}
            theta={theta}
            pA={pA}
            pB={pB}
            accent={accent}
            pausado={pausado}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
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
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar" : "Pausar"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        esTrabajo ? (
          <>
            <LegItem col={accent} txt="fuerza F" />
            <LegItem col={UTILC} txt="útil F·cos θ" />
            <LegItem col={PERPC} txt="perpendicular F·sen θ" />
          </>
        ) : undefined
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
              <Bloque titulo={esTrabajo ? "Fuerza, distancia y ángulo" : "Potencia de cada máquina"} icono={md.icono}>
                {esTrabajo ? (
                  <>
                    <Deslizador label="Fuerza aplicada (F)" icon="fa-hand-fist" colr={accent}
                      valor={`${fmtNum(F, 0)} N`} min={F_MIN} max={F_MAX} step={F_STEP} value={F}
                      onChange={cambiarF} />
                    <Deslizador label="Distancia (d)" icon="fa-ruler-horizontal" colr={accent}
                      valor={`${fmtNum(d, 1)} m`} min={D_MIN} max={D_MAX} step={D_STEP} value={d}
                      onChange={setD} />
                    <Deslizador label="Ángulo fuerza–movimiento (θ)" icon="fa-rotate" colr={ORO}
                      valor={`${fmtNum(theta, 0)}°`} min={THETA_MIN} max={THETA_MAX} step={THETA_STEP} value={theta}
                      onChange={cambiarTheta}
                      hintL="0° (todo cuenta)" hintR="90° (W = 0)" />
                  </>
                ) : (
                  <>
                    <Deslizador label="Máquina A" icon="fa-gauge-high" colr={accent}
                      valor={`${fmtNum(pA, 0)} W`} min={P_MIN} max={P_MAX} step={P_STEP} value={pA}
                      onChange={cambiarPA} hintL={`${fmtNum(wattAHp(pA), 2)} hp`} />
                    <Deslizador label="Máquina B" icon="fa-gauge-high" colr={ORO}
                      valor={`${fmtNum(pB, 0)} W`} min={P_MIN} max={P_MAX} step={P_STEP} value={pB}
                      onChange={cambiarPB} hintL={`${fmtNum(wattAHp(pB), 2)} hp`} />
                  </>
                )}
              </Bloque>

              <Bloque titulo={esTrabajo ? "Trabajo realizado" : "¿Quién llega primero?"} icono="fa-calculator">
                {esTrabajo ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                      <Dato label="trabajo W" value={`${fmtNum(W, 0)} J`} col={accent} />
                      <Dato label="útil F·cos θ" value={`${fmtNum(Fu, 0)} N`} col={UTILC} />
                      <Dato label="perpendicular F·sen θ" value={`${fmtNum(Fp, 0)} N`} col={PERPC} />
                    </div>
                    <p style={{ margin: 0, color: T.text2 }}>
                      W = <strong style={{ color: accent }}>{fmtNum(F, 0)}</strong> N × <strong style={{ color: accent }}>{fmtNum(d, 1)}</strong> m × cos(<strong style={{ color: ORO }}>{fmtNum(theta, 0)}°</strong>) = <strong style={{ color: accent }}>{fmtNum(W, 0)} J</strong>. La parte perpendicular (<strong style={{ color: PERPC }}>{fmtNum(Fp, 0)} N</strong>) no aporta trabajo.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                      <Dato label="tiempo máquina A" value={`${fmtNum(tA, 1)} s`} col={accent} />
                      <Dato label="tiempo máquina B" value={`${fmtNum(tB, 1)} s`} col={ORO} />
                    </div>
                    <p style={{ margin: 0, color: T.text2 }}>
                      Las dos hacen el mismo trabajo (<strong style={{ color: "#fff" }}>{fmtNum(W_POTENCIA, 0)} J</strong>), pero{" "}
                      {tA < tB ? (
                        <>la <strong style={{ color: accent }}>máquina A</strong> llega primero: más potencia = menos tiempo (t = W/P).</>
                      ) : tB < tA ? (
                        <>la <strong style={{ color: ORO }}>máquina B</strong> llega primero: más potencia = menos tiempo (t = W/P).</>
                      ) : (
                        <>las dos tardan lo mismo: igual potencia, igual tiempo (t = W/P).</>
                      )}
                    </p>
                  </>
                )}
              </Bloque>

              <Bloque titulo="Qué mirar" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  En <strong style={{ color: accent }}>Trabajo</strong>, mira la flecha <strong style={{ color: UTILC }}>verde</strong> (F·cos θ): es la única que llena la barra. Sube θ hacia 90° y verás cómo el trabajo cae a cero aunque la caja siga avanzando.
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
              <Bloque titulo="Las dos fórmulas" icono="fa-square-root-variable">
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", background: `rgba(${color.rgba},0.22)` }}>
                      <i className="fa-solid fa-person-walking" aria-hidden />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: "#fff" }}>Trabajo · W = F · d · cos θ</div>
                      <div style={{ color: T.text2 }}>Energía transferida al desplazar un objeto con una fuerza. Se mide en Joules (1 J = 1 N·m).</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", background: `rgba(${color.rgba},0.22)` }}>
                      <i className="fa-solid fa-gauge-high" aria-hidden />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: "#fff" }}>Potencia · P = W / t</div>
                      <div style={{ color: T.text2 }}>Qué tan rápido se hace el trabajo. Se mide en Watts (1 W = 1 J/s); 1 hp ≈ 746 W.</div>
                    </div>
                  </div>
                </div>
              </Bloque>
              <Bloque titulo="El papel del ángulo θ" icono="fa-rotate">
                <p style={{ margin: 0, color: T.text2 }}>
                  Solo la parte de la fuerza alineada con el movimiento hace trabajo: <strong style={{ color: UTILC }}>F·cos θ</strong>. Si empujas justo en la dirección del movimiento (<strong style={{ color: "#fff" }}>θ = 0°</strong>, cos 0° = 1) todo cuenta; si la fuerza es <strong style={{ color: PERPC }}>perpendicular</strong> (θ = 90°, cos 90° = 0) el trabajo es <strong style={{ color: "#fff" }}>cero</strong>. Por eso cargar una mochila sin caminar no hace trabajo.
                </p>
              </Bloque>
              <Bloque titulo="Comparar máquinas" icono="fa-gauge-high">
                <p style={{ margin: 0, color: T.text2 }}>
                  Un motor de <strong style={{ color: accent }}>2000 W</strong> hace el mismo trabajo que uno de <strong style={{ color: ORO }}>1000 W</strong>, pero en <strong style={{ color: "#fff" }}>la mitad del tiempo</strong>. Por eso las bombillas, electrodomésticos y motores se etiquetan en Watts: indican cuánta energía consumen o producen por segundo.
                </p>
              </Bloque>
              <Bloque titulo="Para pensar" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  <li>¿Por qué sostener un peso sin moverlo no realiza trabajo mecánico?</li>
                  <li>Si un motor de 500 W trabaja 10 s, ¿cuántos Joules realiza?</li>
                  <li>¿Dos máquinas con la misma potencia siempre hacen el mismo trabajo?</li>
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={TRABAJO_POTENCIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}
