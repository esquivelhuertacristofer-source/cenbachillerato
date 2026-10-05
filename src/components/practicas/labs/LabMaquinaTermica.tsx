"use client";

/**
 * Laboratorio 3D — Máquinas térmicas: motores y refrigeradores.
 * Práctica experimental para CNEYT-II-P03-A1
 * ("Introducción a la termodinámica: leyes y aplicaciones").
 *
 * La primera ley es la conservación de la energía aplicada al calor (ΔU = Q − W).
 * Un motor de calor toma calor de un foco caliente, convierte una parte en
 * trabajo y forzosamente tira el resto a un foco frío: por la segunda ley nunca
 * es 100% eficiente (η = 1 − T_f/T_c). Un refrigerador es el mismo proceso al
 * revés: gasta trabajo para mover calor de frío a caliente, contra su flujo
 * natural (COP = Q_f/W). El lab deja ver ambos como uno el reverso del otro.
 * Ciencias Naturales, Experimentales y Tecnología II (MCCEMS 2025).
 *
 * Experimento central: mover las temperaturas de los dos focos y ver cómo el
 * chorro de trabajo y el medidor de η (o de COP) crecen o se encogen.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { MAQUINA_TERMICA_FICHA } from "./maquina-termica-ciclos-ficha";
import { QUIZ_A2 } from "./maquina-termica-ciclos-data";
import {
  type ModoKey,
  MODOS,
  getModo,
  DEFAULTS,
  balanceMotor,
  balanceRefrigerador,
  eficienciaCarnot,
  copRefrigerador,
  kelvinACelsius,
  fmtNum,
  T_CAL_MIN, T_CAL_MAX, T_FRIO_MIN, T_FRIO_MAX, T_STEP, T_GAP_MIN,
} from "./maquina-termica-data";

const MaquinaTermicaScene = dynamic(() => import("./MaquinaTermicaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-gears fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const CAL = "#ff8a5a";
const FRIO = "#5BC8FF";
const ORO = "#ffd24a";

const RETO_KEY = "cen-maquina-termica-ciclos-reto";

function LegItem({ col, txt }: { col: string; txt: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
      <span style={{ width: 18, height: 0, borderTop: `3px solid ${col}`, flexShrink: 0 }} />
      {txt}
    </div>
  );
}

export function LabMaquinaTermica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<ModoKey>("motor");
  const [tCal, setTCal] = useState(DEFAULTS.motor.tCal);
  const [tFrio, setTFrio] = useState(DEFAULTS.motor.tFrio);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioMotor, setVioMotor] = useState(true); // arranca en motor
  const [vioRefri, setVioRefri] = useState(false);
  const [bajoFrio, setBajoFrio] = useState(false);
  const [subioTCal, setSubioTCal] = useState(false);
  const [acercoFocos, setAcercoFocos] = useState(false);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // sonido
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

  const md = useMemo(() => getModo(modo), [modo]);
  const esMotor = modo === "motor";

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarModo = (k: ModoKey) => {
    setModo(k);
    setTCal(DEFAULTS[k].tCal);
    setTFrio(DEFAULTS[k].tFrio);
    bump();
    if (sonido) audioRef.current?.blip();
    if (k === "motor") setVioMotor(true);
    if (k === "refrigerador") setVioRefri(true);
  };

  // El foco frío nunca puede igualar o superar al caliente (holgura T_GAP_MIN).
  const cambiarTCal = (k: number) => {
    const v = Math.max(T_CAL_MIN, Math.min(T_CAL_MAX, k));
    setTCal(v);
    if (tFrio > v - T_GAP_MIN) setTFrio(v - T_GAP_MIN);
    if (esMotor && v > DEFAULTS.motor.tCal) setSubioTCal(true);
    if (v - tFrio <= 40) setAcercoFocos(true);
  };
  const cambiarTFrio = (k: number) => {
    const v = Math.max(T_FRIO_MIN, Math.min(tCal - T_GAP_MIN, k));
    setTFrio(v);
    if (esMotor && v < DEFAULTS.motor.tFrio) setBajoFrio(true);
    if (tCal - v <= 40) setAcercoFocos(true);
  };

  const reset = () => {
    setTCal(DEFAULTS[modo].tCal);
    setTFrio(DEFAULTS[modo].tFrio);
    bump();
  };

  // Balances energéticos en vivo
  const eta = useMemo(() => eficienciaCarnot(tCal, tFrio), [tCal, tFrio]);
  const cop = useMemo(() => copRefrigerador(tCal, tFrio), [tCal, tFrio]);
  const bMotor = useMemo(() => balanceMotor(tCal, tFrio), [tCal, tFrio]);
  const bRefri = useMemo(() => balanceRefrigerador(tCal, tFrio), [tCal, tFrio]);

  const objetivos = [
    { txt: "Baja la temperatura del foco frío y mira crecer el medidor de eficiencia", done: bajoFrio },
    { txt: "Observa un motor de calor", done: vioMotor },
    { txt: "Invierte el ciclo: refrigerador", done: vioRefri },
    { txt: "Sube T caliente y ve subir η", done: subioTCal },
    { txt: "Acerca los focos y ve caer el rendimiento", done: acercoFocos },
    { txt: "Resuelve el reto evaluable de la actividad A4", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-gears" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Ninguna máquina aprovecha todo el calor</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: un motor toma calor del foco caliente, convierte una parte en trabajo y tira el resto al frío. La segunda ley pone el techo: η = 1 − T_f/T_c.
      </div>
    </div>
  );

  const lectura = esMotor
    ? `De ${fmtNum(bMotor.qCal, 0)} J que entran, ${fmtNum(bMotor.W, 0)} J son trabajo.`
    : `Con ${fmtNum(bRefri.w, 0)} J de trabajo sacas ${fmtNum(bRefri.Qf, 0)} J del interior.`;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <MaquinaTermicaScene
            modo={modo}
            tCal={tCal}
            tFrio={tFrio}
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
        esMotor ? (
          <>
            <LegItem col="#ff4d3a" txt="Q caliente (entra)" />
            <LegItem col="#34d399" txt="W trabajo (sale)" />
            <LegItem col="#ff8a3a" txt="Q frío (desecho)" />
          </>
        ) : (
          <>
            <LegItem col={ORO} txt="W eléctrico (entra)" />
            <LegItem col="#3a86ff" txt="Q frío (se extrae)" />
            <LegItem col="#ff8a3a" txt="Q caliente (se expulsa)" />
          </>
        )
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
              <Bloque titulo={md.nombre} icono={md.icono}>
                <Deslizador
                  label={esMotor ? "Foco caliente (combustión)" : "Exterior (caliente)"} icon="fa-fire" colr={CAL}
                  valor={`${fmtNum(tCal, 0)} K`}
                  min={T_CAL_MIN} max={T_CAL_MAX} step={T_STEP} value={tCal}
                  onChange={cambiarTCal}
                  hintL={`${fmtNum(kelvinACelsius(tCal), 0)} °C`}
                />
                <Deslizador
                  label={esMotor ? "Foco frío (ambiente)" : "Interior (frío)"} icon="fa-snowflake" colr={FRIO}
                  valor={`${fmtNum(tFrio, 0)} K`}
                  min={T_FRIO_MIN} max={T_FRIO_MAX} step={T_STEP} value={tFrio}
                  onChange={cambiarTFrio}
                  hintL={`${fmtNum(kelvinACelsius(tFrio), 0)} °C`}
                  hintR={`holgura mínima ${T_GAP_MIN} K`}
                />
              </Bloque>

              <Bloque titulo="Balance de energía (1.ª ley)" icono="fa-scale-balanced">
                {esMotor ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                      <Dato label="eficiencia η" value={`${fmtNum(eta * 100, 0)} %`} col={accent} />
                      <Dato label="calor que entra" value={`${fmtNum(bMotor.qCal, 0)} J`} col={CAL} />
                      <Dato label="trabajo útil" value={`${fmtNum(bMotor.W, 0)} J`} col={OK} />
                      <Dato label="calor de desecho" value={`${fmtNum(bMotor.Qf, 0)} J`} col={FRIO} />
                    </div>
                    <p style={{ margin: 0, color: T.text2 }}>
                      De cada <strong style={{ color: CAL }}>{fmtNum(bMotor.qCal, 0)} J</strong> que entran, solo <strong style={{ color: OK }}>{fmtNum(bMotor.W, 0)} J</strong> se vuelven trabajo; los otros <strong style={{ color: FRIO }}>{fmtNum(bMotor.Qf, 0)} J</strong> se tiran al foco frío. La 2.ª ley lo exige.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                      <Dato label="COP" value={fmtNum(cop, 1)} col={accent} />
                      <Dato label="trabajo W" value={`${fmtNum(bRefri.w, 0)} J`} col={ORO} />
                      <Dato label="calor extraído" value={`${fmtNum(bRefri.Qf, 0)} J`} col={FRIO} />
                      <Dato label="calor expulsado" value={`${fmtNum(bRefri.Qc, 0)} J`} col={CAL} />
                    </div>
                    <p style={{ margin: 0, color: T.text2 }}>
                      Con <strong style={{ color: ORO }}>{fmtNum(bRefri.w, 0)} J</strong> de trabajo se sacan <strong style={{ color: FRIO }}>{fmtNum(bRefri.Qf, 0)} J</strong> del interior frío y se expulsan <strong style={{ color: CAL }}>{fmtNum(bRefri.Qc, 0)} J</strong> afuera. El COP baja cuando afuera hace más calor.
                    </p>
                  </>
                )}
              </Bloque>

              <Bloque titulo="Qué mirar" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Fíjate en los <strong style={{ color: accent }}>chorros de partículas</strong>: en el motor, el de <strong style={{ color: OK }}>trabajo</strong> que sube nunca es tan grueso como el de <strong style={{ color: CAL }}>calor</strong> que entró. En el refrigerador, todo va al <strong style={{ color: "#fff" }}>revés</strong> y empujado desde arriba.
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
            <RetoQuizCard
              quiz={QUIZ_A2}
              accent={accent}
              rgba={color.rgba}
              aprobado={ejercicioAprobado}
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
              playPick={sonido ? () => audioRef.current?.blip() : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Las leyes en juego" icono="fa-scale-balanced">
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff", background: `rgba(${color.rgba},0.22)` }}>1</div>
                    <div>
                      <div style={{ fontWeight: 800, color: "#fff" }}>Primera ley · ΔU = Q − W</div>
                      <div style={{ color: T.text2 }}>La energía se conserva: el calor que entra se reparte entre energía interna y trabajo. Nada se crea ni se pierde.</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff", background: `rgba(${color.rgba},0.22)` }}>2</div>
                    <div>
                      <div style={{ fontWeight: 800, color: "#fff" }}>Segunda ley · el límite</div>
                      <div style={{ color: T.text2 }}>El calor fluye solo de caliente a frío. Por eso ningún motor es 100% eficiente y un refri necesita gastar trabajo para ir al revés.</div>
                    </div>
                  </div>
                </div>
              </Bloque>
              <Bloque titulo="Eficiencia de Carnot" icono="fa-percent">
                <p style={{ margin: 0, color: T.text2 }}>
                  La eficiencia máxima posible de un motor depende <strong style={{ color: "#fff" }}>solo de las temperaturas</strong>: <strong style={{ color: accent }}>η = 1 − T_f / T_c</strong>. Sube el foco caliente o baja el frío y η crece; pero como T_f nunca llega a 0 K, η <strong style={{ color: FRIO }}>nunca llega a 100%</strong>.
                </p>
              </Bloque>
              <Bloque titulo="El refrigerador (COP)" icono="fa-snowflake">
                <p style={{ margin: 0, color: T.text2 }}>
                  Un refri mueve calor de adentro (frío) hacia afuera (caliente), en <strong style={{ color: "#fff" }}>contra</strong> de su flujo natural. Eso cuesta trabajo eléctrico. Su rendimiento es <strong style={{ color: accent }}>COP = Q_f / W = T_f / (T_c − T_f)</strong>: entre más parecidas las temperaturas, más rinde; en un día de calor afuera, rinde menos.
                </p>
              </Bloque>
              <Bloque titulo="Para pensar" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  <li>¿Por qué ningún motor puede convertir todo el calor en trabajo?</li>
                  <li>¿Por qué un refrigerador calienta la cocina en lugar de enfriarla?</li>
                  <li>¿Qué le pasa al COP cuando sube la temperatura exterior?</li>
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={MAQUINA_TERMICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}
