"use client";

/**
 * Laboratorio 3D — "Electromagnetismo: Ohm, Faraday y motores".
 * Práctica experimental para CNEYT-V-P07-A2 (ejercicio matemático "Calculando
 * electromagnetismo: Ohm, Faraday y motores"; progresión 7 "Examina los
 * principios del electromagnetismo y su aplicación en motores, generadores y
 * tecnologías cotidianas", UAC CNEYT-V "La energía en procesos de vida diaria").
 *
 * Tres modos:
 *  (a) Circuito   — ley de Ohm V = I·R y potencia P = V·I = I²R = V²/R; energía
 *      (kWh) y costo en pesos. Es la parte (a) del ejercicio A2.
 *  (b) Generador  — inducción de Faraday: FEM = N·B·A·ω·sen(ωt) de una bobina que
 *      gira en un campo magnético (las hidroeléctricas, como Chicoasén).
 *  (c) Motor      — conversión eléctrica → mecánica con eficiencia η; el resto se
 *      pierde como calor. Es la parte (b) del ejercicio A2 (Metro CDMX).
 * Toda la física es de cálculo cerrado (ley de Ohm, potencia, FEM de Faraday y
 * balance de eficiencia).
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { ELECTROMAGNETISMO_FICHA } from "./electromagnetismo-ohm-faraday-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./electromagnetismo-ohm-faraday-data";
import { LabSfx } from "./lab-audio";
import {
  type Modo,
  resolverCircuito, resolverGenerador, resolverMotor,
  CASOS_CIRCUITO, CASOS_GENERADOR, CASOS_MOTOR,
  V_MIN, V_MAX, V_DEF, R_MIN, R_MAX, R_DEF, H_MIN, H_MAX, H_DEF,
  PRECIO_MIN, PRECIO_MAX, PRECIO_DEF,
  N_MIN, N_MAX, N_DEF, B_MIN, B_MAX, B_DEF, AREA_MIN, AREA_MAX, AREA_DEF, F_MIN, F_MAX, F_DEF,
  PEL_MIN, PEL_MAX, PEL_DEF, EFIC_MIN, EFIC_MAX, EFIC_DEF,
  PROBLEMA, INSTRUCCIONES, PREGUNTAS, IDEAS, DATOS, GLOSARIO, EJEMPLO_A, EJEMPLO_B,
  fmt2, fmt3, fmtV, fmtA, fmtR, fmtW, fmtKw, fmtKwh, fmtMXN, fmtPct, fmtHz, fmtHp,
} from "./electromagnetismo-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-electromagnetismo-ohm-faraday-reto";

const ElectromagnetismoScene = dynamic(() => import("./ElectromagnetismoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bolt fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Conectando el banco electromagnético…</span>
    </div>
  ),
});

/** Corriente de referencia del ejemplo A2 (120 V sobre 470 Ω). */
const I_REF = V_DEF / R_DEF;

const C_CIR = "#38bdf8";
const C_GEN = "#a78bfa";
const C_MOT = "#34d399";

const MODOS: { id: Modo; etq: string; icono: string; col: string; desc: string }[] = [
  { id: "circuito",  etq: "Circuito",  icono: "fa-plug-circle-bolt", col: C_CIR, desc: "Ley de Ohm, potencia y costo" },
  { id: "generador", etq: "Generador", icono: "fa-bolt",             col: C_GEN, desc: "Inducción de Faraday (FEM)" },
  { id: "motor",     etq: "Motor",     icono: "fa-gears",            col: C_MOT, desc: "Eficiencia: útil vs. calor" },
];

export function LabElectromagnetismo({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("circuito");
  // (a) circuito
  const [V, setV] = useState<number>(V_DEF);
  const [R, setR] = useState<number>(R_DEF);
  const [horas, setHoras] = useState<number>(H_DEF);
  const [precio, setPrecio] = useState<number>(PRECIO_DEF);
  // (b) generador
  const [N, setN] = useState<number>(N_DEF);
  const [B, setB] = useState<number>(B_DEF);
  const [area, setArea] = useState<number>(AREA_DEF);
  const [f, setF] = useState<number>(F_DEF);
  // (c) motor
  const [pElec, setPElec] = useState<number>(PEL_DEF);
  const [efic, setEfic] = useState<number>(EFIC_DEF);

  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable, teoría (cajón deslizable) y sonido
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

  const bump = () => setResetNonce((n) => n + 1);
  const resetModo = () => {
    if (modo === "circuito") { setV(V_DEF); setR(R_DEF); setHoras(H_DEF); setPrecio(PRECIO_DEF); }
    else if (modo === "generador") { setN(N_DEF); setB(B_DEF); setArea(AREA_DEF); setF(F_DEF); }
    else { setPElec(PEL_DEF); setEfic(EFIC_DEF); }
    bump();
  };
  const cambiarModo = (m: Modo) => {
    if (sonido) audioRef.current?.blip();
    setModo(m);
    bump();
  };

  // valores en vivo
  const cir = resolverCircuito(V, R, horas, precio);
  const gen = resolverGenerador(N, B, area, f);
  const mot = resolverMotor(pElec, efic);

  const modoActual = MODOS.find((x) => x.id === modo)!;
  const modoCol = modoActual.col;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-bolt" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>V = I·R</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los números siguen aquí.
        {modo === "circuito" && ` Circuito: I = ${fmtA(cir.I)}, P = ${fmtW(cir.P)}, energía = ${fmtKwh(cir.energiaKwh)}, costo = ${fmtMXN(cir.costo)}.`}
        {modo === "generador" && ` Generador: FEM_pico = ${fmtV(gen.femPico)}, FEM_eficaz = ${fmtV(gen.femRms)} a ${fmtHz(f)}.`}
        {modo === "motor" && ` Motor: P_mec = ${fmtKw(mot.pMec)} (${fmtHp(mot.hp)}), calor perdido = ${fmtKw(mot.pPerdida)}.`}
      </div>
    </div>
  );

  // Misiones que no se «des-cumplen» al cambiar de modo o de valor.
  const exploroCircuito = useLatch(modo === "circuito" && (V !== V_DEF || R !== R_DEF));
  const bajoCorriente = useLatch(modo === "circuito" && cir.I <= I_REF / 2 + 0.005);
  const vioGenerador = useLatch(modo === "generador");
  const cambioBobina = useLatch(N !== N_DEF || B !== B_DEF);
  const vioMotor = useLatch(modo === "motor");

  const lectura =
    modo === "circuito" ? <>I = {fmtA(cir.I)} · P = {fmtW(cir.P)}</>
    : modo === "generador" ? <>FEM máxima = {fmtV(gen.femPico)}</>
    : <>Útil {fmtKw(mot.pMec)} · calor {fmtKw(mot.pPerdida)}</>;

  const chip = (col: string, on: boolean): React.CSSProperties => ({
    cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 800, color: on ? "#04121f" : col,
    background: on ? col : `${col}1f`, border: `1px solid ${col}55`, borderRadius: 10, padding: "10px 12px", lineHeight: 1.3,
  });
  const rejilla: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8, marginTop: 14 };
  const caja = (col: string): React.CSSProperties => ({ margin: 0, marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${col}44`, background: `${col}14`, lineHeight: 1.5 });
  const par: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 };
  const lista: React.CSSProperties = { margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 };
  const mono: React.CSSProperties = { fontFamily: "ui-monospace, monospace", fontSize: 14, lineHeight: 1.4 };

  const ejemplo = (e: typeof EJEMPLO_A, col: string) => (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ color: T.text2 }}>{e.enunciado}</div>
      <ul style={{ ...lista, ...mono }}>{e.pasos.map((p, i) => <li key={i}>{p}</li>)}</ul>
      <div style={{ padding: "8px 11px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}44`, fontWeight: 900, color: "#fff", ...mono }}>{e.resultado}</div>
    </div>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <ElectromagnetismoScene
            modo={modo}
            V={V} R={R} horas={horas} precio={precio}
            N={N} B={B} area={area} f={f}
            pElec={pElec} efic={efic}
            playing={playing} accent={accent} resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((mo) => ({ id: mo.id, etiqueta: mo.etq, icono: mo.icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reproducir"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar a los valores de inicio" onClick={resetModo} />
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Duplica la resistencia R: los electrones se frenan y la corriente baja a la mitad", done: bajoCorriente },
        { txt: "Explora el modo Circuito y ajusta V y R", done: exploroCircuito },
        { txt: "Explora el modo Generador (FEM de Faraday)", done: vioGenerador },
        { txt: "Cambia las vueltas N o el campo B y observa la FEM inducida", done: cambioBobina },
        { txt: "Explora el modo Motor y varía la eficiencia", done: vioMotor },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo={modo === "circuito" ? "Fuente, resistencia y consumo" : modo === "generador" ? "Bobina, campo y giro" : "Potencia y eficiencia"} icono={modoActual.icono}>
                {modo === "circuito" && (
                  <>
                    <Deslizador label="tensión V" icon="fa-bolt" colr={C_CIR} valor={fmtV(V)} min={V_MIN} max={V_MAX} step={1.5} value={V} onChange={setV} hintL="1.5 V (pila)" hintR="240 V" />
                    <Deslizador label="resistencia R" icon="fa-wave-square" colr={C_CIR} valor={fmtR(R)} min={R_MIN} max={R_MAX} step={1} value={R} onChange={setR} hintL="poca: pasa mucha" hintR="mucha: pasa poca" />
                    <Deslizador label="horas de uso" icon="fa-clock" colr={C_CIR} valor={`${horas} h`} min={H_MIN} max={H_MAX} step={1} value={horas} onChange={setHoras} />
                    <Deslizador label="precio $/kWh" icon="fa-coins" colr={C_CIR} valor={fmtMXN(precio)} min={PRECIO_MIN} max={PRECIO_MAX} step={0.1} value={precio} onChange={setPrecio} />
                    <div style={rejilla}>
                      {CASOS_CIRCUITO.map((cs) => (
                        <button key={cs.id} type="button" onClick={() => { setV(cs.V); setR(cs.R); }} style={chip(C_CIR, Math.abs(cs.V - V) < 0.5 && Math.abs(cs.R - R) < 0.5)}>{cs.etq}</button>
                      ))}
                    </div>
                    <p style={caja(C_CIR)}>
                      I = V/R = <strong style={{ color: C_CIR }}>{fmtA(cir.I)}</strong>; P = V²/R = <strong>{fmtW(cir.P)}</strong>. En {horas} h: <strong>{fmtKwh(cir.energiaKwh)}</strong> → <strong style={{ color: "#fde047" }}>{fmtMXN(cir.costo)}</strong>.
                    </p>
                  </>
                )}
                {modo === "generador" && (
                  <>
                    <Deslizador label="vueltas de la bobina N" icon="fa-arrows-spin" colr={C_GEN} valor={`${N}`} min={N_MIN} max={N_MAX} step={5} value={N} onChange={setN} hintL="pocas" hintR="muchas" />
                    <Deslizador label="campo magnético B" icon="fa-magnet" colr={C_GEN} valor={`${fmt2(B)} T`} min={B_MIN} max={B_MAX} step={0.05} value={B} onChange={setB} hintL="imán débil" hintR="imán fuerte" />
                    <Deslizador label="área A" icon="fa-vector-square" colr={C_GEN} valor={`${fmt3(area)} m²`} min={AREA_MIN} max={AREA_MAX} step={0.005} value={area} onChange={setArea} />
                    <Deslizador label="frecuencia f" icon="fa-rotate" colr={C_GEN} valor={fmtHz(f)} min={F_MIN} max={F_MAX} step={1} value={f} onChange={setF} />
                    <div style={rejilla}>
                      {CASOS_GENERADOR.map((cs) => (
                        <button key={cs.id} type="button" onClick={() => { setN(cs.N); setB(cs.B); setArea(cs.A); setF(cs.f); }} style={chip(C_GEN, cs.N === N && Math.abs(cs.B - B) < 0.03 && Math.abs(cs.f - f) < 0.5)}>{cs.etq}</button>
                      ))}
                    </div>
                    <p style={caja(C_GEN)}>
                      ω = 2πf = <strong>{fmt2(gen.omega)} rad/s</strong>; FEM_pico = N·B·A·ω = <strong style={{ color: C_GEN }}>{fmtV(gen.femPico)}</strong>; FEM_eficaz = FEM_pico/√2 = <strong>{fmtV(gen.femRms)}</strong>.
                    </p>
                  </>
                )}
                {modo === "motor" && (
                  <>
                    <Deslizador label="potencia eléctrica P_elec" icon="fa-plug" colr={C_MOT} valor={fmtKw(pElec)} min={PEL_MIN} max={PEL_MAX} step={1} value={pElec} onChange={setPElec} hintL="motor pequeño" hintR="motor grande" />
                    <Deslizador label="eficiencia η" icon="fa-gauge-high" colr={C_MOT} valor={fmtPct(efic)} min={EFIC_MIN} max={EFIC_MAX} step={1} value={efic} onChange={setEfic} hintL="combustión (~35 %)" hintR="eléctrico (≤99 %)" />
                    <div style={rejilla}>
                      {CASOS_MOTOR.map((cs) => (
                        <button key={cs.id} type="button" onClick={() => { setPElec(cs.pElec); setEfic(cs.efic); }} style={chip(C_MOT, Math.abs(cs.pElec - pElec) < 0.5 && Math.abs(cs.efic - efic) < 0.5)}>{cs.etq}</button>
                      ))}
                    </div>
                    <p style={caja(C_MOT)}>
                      P_mec = η·P_elec = <strong style={{ color: C_MOT }}>{fmtKw(mot.pMec)}</strong> ({fmtHp(mot.hp)}); se pierden como calor <strong style={{ color: "#fb7185" }}>{fmtKw(mot.pPerdida)}</strong> ({fmtPct(100 - efic)}).
                    </p>
                  </>
                )}
              </Bloque>

              <Bloque titulo={`Lecturas: ${modoActual.etq}`} icono={modoActual.icono}>
                {modo === "circuito" && (
                  <div style={par}>
                    <Dato label="corriente I" value={fmtA(cir.I)} col={modoCol} />
                    <Dato label="potencia P" value={fmtW(cir.P)} />
                    <Dato label="energía" value={fmtKwh(cir.energiaKwh)} col={modoCol} />
                    <Dato label="costo" value={fmtMXN(cir.costo)} col="#fde047" />
                  </div>
                )}
                {modo === "generador" && (
                  <div style={par}>
                    <Dato label="FEM máxima" value={fmtV(gen.femPico)} col={modoCol} />
                    <Dato label="FEM eficaz" value={fmtV(gen.femRms)} />
                    <Dato label="ω = 2πf" value={`${fmt2(gen.omega)} rad/s`} col={modoCol} />
                    <Dato label="frecuencia" value={fmtHz(f)} col="#86efac" />
                  </div>
                )}
                {modo === "motor" && (
                  <div style={par}>
                    <Dato label="pot. mecánica" value={fmtKw(mot.pMec)} col={modoCol} />
                    <Dato label="en caballos" value={fmtHp(mot.hp)} />
                    <Dato label="calor perdido" value={fmtKw(mot.pPerdida)} col="#fb7185" />
                    <Dato label="eficiencia" value={fmtPct(efic)} col="#86efac" />
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
              <Bloque titulo="El banco electromagnético" icono="fa-bolt">
                <div style={{ color: T.text2 }}>{PROBLEMA}</div>
              </Bloque>
              <Bloque titulo="Ejemplo resuelto (A2)" icono="fa-square-check">
                {ejemplo(EJEMPLO_A, C_CIR)}
                {ejemplo(EJEMPLO_B, C_MOT)}
              </Bloque>
              <Bloque titulo="Pasos para explorar" icono="fa-list-ol">
                <ol style={lista}>{INSTRUCCIONES.map((p, i) => <li key={i}>{p}</li>)}</ol>
              </Bloque>
              <Bloque titulo="Para reflexionar" icono="fa-circle-question">
                <ul style={lista}>{PREGUNTAS.map((q, i) => <li key={i}>{q}</li>)}</ul>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={lista}>{IDEAS.map((x, i) => <li key={i}>{x}</li>)}</ul>
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
              <Bloque titulo="Glosario" icono="fa-book">
                {GLOSARIO.map((g, i) => (
                  <div key={i}><strong style={{ color: accent }}>{g.termino}. </strong><span style={{ color: T.text2 }}>{g.definicion}</span></div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ELECTROMAGNETISMO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                Física <strong>exacta</strong> de cálculo cerrado: ley de Ohm V = I·R, potencia P = V·I = I²R = V²/R, energía = P·t (kWh), FEM senoidal FEM = N·B·A·ω·sen(ωt) con ω = 2πf y balance de eficiencia P_mec = η·P_elec. Los valores del panel son <strong>exactos</strong>. La animación 3D es <strong>esquemática</strong>: la rapidez de los electrones, la rotación de la bobina/rotor y el brillo de las lámparas usan escalas visuales; los electrodomésticos se modelan como una resistencia equivalente a la red de CFE (127 V). El ejemplo resuelto es verbatim del ejercicio A2; las ideas clave, el glosario y el contexto se basan en la lectura A1.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/** Una vez que la condición se cumple, se queda cumplida (cambiar de modo no la deshace). */
function useLatch(cond: boolean): boolean {
  const [l, setL] = useState(false);
  if (cond && !l) setL(true);
  return l || cond;
}
