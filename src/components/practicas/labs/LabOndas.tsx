"use client";

/**
 * Laboratorio 3D — "Ondas: amplitud, frecuencia y longitud de onda".
 * Práctica experimental para CNEYT-V-P04-A2 (simulación "Simulación de ondas:
 * amplitud, frecuencia y longitud de onda"; progresión 4 "El movimiento
 * ondulatorio: sonido, mar y terremotos", UAC CNEYT-V "La energía en procesos
 * de vida diaria").
 *
 * Experimento central: v = λ·f. El alumno sube la frecuencia (o cambia de
 * medio) y VE cómo la regla de λ se acorta (o se alarga) mientras el producto
 * λ × f sigue valiendo lo mismo en el medidor.
 *
 * Tres modos, según la simulación verbatim del A2:
 *  (a) Onda          — generador de una onda mecánica: amplitud, frecuencia y
 *      medio fijan la longitud de onda por v = λ·f (sube f y λ baja).
 *  (b) Interferencia — dos ondas que se superponen (constructiva/destructiva) o,
 *      en sentidos opuestos, una onda estacionaria con nodos y antinodos.
 *  (c) Doppler       — una fuente en movimiento comprime las ondas por delante
 *      (tono agudo) y las estira por detrás (grave).
 * Toda la física es de cálculo cerrado (v = λ·f y efecto Doppler clásico).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { ONDAS_FICHA } from "./ondas-amplitud-frecuencia-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./ondas-amplitud-frecuencia-data";
import { LabSfx } from "./lab-audio";
import {
  type Modo, resolverOnda, resolverInterferencia, resolverDoppler, medioPorId, MEDIOS,
  A_MIN, A_MAX, A_DEF, F_MIN, F_MAX, F_DEF, MEDIO_DEF,
  FASE_MIN, FASE_MAX, FASE_DEF,
  FD_MIN, FD_MAX, FD_DEF, VS_MIN, VS_MAX, VS_DEF,
  PROBLEMA, INSTRUCCIONES, PREGUNTAS, IDEAS, DATOS, EJEMPLO,
  fmt0, fmt1, fmt2, fmtLambda,
} from "./ondas-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-ondas-amplitud-frecuencia-reto";

const OndasScene = dynamic(() => import("./OndasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-wave-square fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Generando el frente de onda…</span>
    </div>
  ),
});

const C_ONDA = "#7dd3fc";
const C_INTER = "#34D399";
const C_DOPP = "#f59e0b";
const C_ESTAC = "#a78bfa";

const MODOS: { id: Modo; etq: string; icono: string }[] = [
  { id: "onda", etq: "Onda", icono: "fa-wave-square" },
  { id: "interferencia", etq: "Interferencia", icono: "fa-water" },
  { id: "doppler", etq: "Doppler", icono: "fa-tower-broadcast" },
];

const FASE_PRESETS = [
  { etq: "en fase (0)", phi: 0 },
  { etq: "π/2", phi: Math.PI / 2 },
  { etq: "oposición (π)", phi: Math.PI },
  { etq: "3π/2", phi: (3 * Math.PI) / 2 },
];

type Marcas = { f: boolean; medio: boolean; inter: boolean; est: boolean; dopp: boolean; vs: boolean };
const MARCAS_0: Marcas = { f: false, medio: false, inter: false, est: false, dopp: false, vs: false };

export function LabOndas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("onda");
  const [A, setA] = useState<number>(A_DEF);                 // (a) y (b)
  const [f, setF] = useState<number>(F_DEF);                 // (a)
  const [medioId, setMedioId] = useState<string>(MEDIO_DEF); // (a)
  const [phi, setPhi] = useState<number>(FASE_DEF);          // (b)
  const [estacionaria, setEstacionaria] = useState<boolean>(false); // (b)
  const [fd, setFd] = useState<number>(FD_DEF);              // (c)
  const [vs, setVs] = useState<number>(VS_DEF);              // (c)
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  // Misiones «enganchadas»: una vez cumplidas no se des-cumplen al cambiar de modo.
  const [marcas, setMarcas] = useState<Marcas>(MARCAS_0);
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
    if (modo === "onda") { setA(A_DEF); setF(F_DEF); setMedioId(MEDIO_DEF); }
    else if (modo === "interferencia") { setA(A_DEF); setPhi(FASE_DEF); setEstacionaria(false); }
    else { setFd(FD_DEF); setVs(VS_DEF); }
    bump();
  };
  const cambiarModo = (nm: Modo) => {
    setModo(nm);
    if (sonido) audioRef.current?.blip();
    bump();
  };

  // valores en vivo según el modo
  const medio = medioPorId(medioId);
  const onda = resolverOnda(A, f, medio.v);
  const inter = resolverInterferencia(A, phi);
  const dopp = resolverDoppler(fd, vs);

  const tipoCol = estacionaria ? C_ESTAC : inter.tipo === "constructiva" ? C_INTER : inter.tipo === "destructiva" ? "#f87171" : "#fbbf24";

  // Ajuste durante el render (patrón de React): engancha cada misión al cumplirse.
  const ahora: Marcas = {
    f: f !== F_DEF,
    medio: medioId !== MEDIO_DEF,
    inter: modo === "interferencia",
    est: estacionaria,
    dopp: modo === "doppler",
    vs: modo === "doppler" && vs >= 60,
  };
  if ((Object.keys(ahora) as (keyof Marcas)[]).some((k) => ahora[k] && !marcas[k])) {
    setMarcas({
      f: marcas.f || ahora.f, medio: marcas.medio || ahora.medio, inter: marcas.inter || ahora.inter,
      est: marcas.est || ahora.est, dopp: marcas.dopp || ahora.dopp, vs: marcas.vs || ahora.vs,
    });
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-wave-square" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>v = λ · f</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los números siguen aquí.
        {modo === "onda" && ` En ${medio.nombre.toLowerCase()} (v = ${fmt0(medio.v)} m/s) a f = ${fmt0(f)} Hz: λ = ${fmtLambda(onda.lambda)}.`}
        {modo === "interferencia" && ` Con φ = ${fmt2(phi)} rad la resultante es ${inter.tipo} (A_res = ${fmt2(inter.Ares)}).`}
        {modo === "doppler" && ` f = ${fmt0(fd)} Hz, vs = ${fmt0(vs)} m/s → adelante ${fmt0(dopp.fAcerca)} Hz, atrás ${fmt0(dopp.fAleja)} Hz.`}
      </div>
    </div>
  );

  // Lo corto va sobre la escena (≤ 10 palabras).
  const lectura =
    modo === "onda" ? <>f = {fmt0(f)} Hz → λ = {fmtLambda(onda.lambda)}</>
    : modo === "interferencia" ? (estacionaria ? <>Nodos quietos, antinodos al máximo</> : <>{inter.tipo}: A_res = {fmt2(inter.Ares)}</>)
    : <>Adelante {fmt0(dopp.fAcerca)} Hz · atrás {fmt0(dopp.fAleja)} Hz</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <OndasScene modo={modo} A={A} f={f} medioId={medioId} phi={phi} estacionaria={estacionaria} fd={fd} vs={vs} playing={playing} accent={accent} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.etq, icono: m.icono })),
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
      leyenda={
        modo === "onda" ? <MedidorV f={f} lambda={onda.lambda} v={medio.v} col={medio.color} />
        : modo === "interferencia" ? (
          <>
            <LegItem col="#fbbf24" txt="onda 1" />
            <LegItem col="#38bdf8" txt="onda 2" />
            <LegItem col={tipoCol} txt="resultante" />
          </>
        ) : (
          <>
            <LegItem col="#f87171" txt="adelante: agudo" />
            <LegItem col="#60a5fa" txt="atrás: grave" />
          </>
        )
      }
      lectura={lectura}
      objetivos={[
        { txt: "Explora el modo Onda: sube la frecuencia y observa cómo baja λ", done: marcas.f },
        { txt: "Cambia el medio a agua o acero: con la misma f, λ crece (v = λ·f)", done: marcas.medio },
        { txt: "Experimenta con interferencia constructiva y destructiva", done: marcas.inter },
        { txt: "Activa la onda estacionaria y localiza los nodos", done: marcas.est },
        { txt: "Observa el Efecto Doppler con la fuente en movimiento", done: marcas.dopp },
        { txt: "Sube la rapidez de la fuente a 60 m/s o más y compara los dos tonos", done: marcas.vs },
        { txt: "Resuelve el reto evaluable de la actividad", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              {modo === "onda" && (
                <Bloque titulo="Frecuencia, amplitud y medio" icono="fa-sliders">
                  <Deslizador label="frecuencia f" icon="fa-gauge-high" colr={C_ONDA} valor={`${fmt0(f)} Hz`} min={F_MIN} max={F_MAX} step={1} value={f} onChange={setF} hintL={`${fmt0(F_MIN)} Hz`} hintR={`${fmt0(F_MAX)} Hz`} />
                  <Deslizador label="amplitud A" icon="fa-up-down" colr={C_ONDA} valor={fmt2(A)} min={A_MIN} max={A_MAX} step={0.05} value={A} onChange={setA} hintL={fmt1(A_MIN)} hintR={fmt1(A_MAX)} />
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.text3, letterSpacing: "0.04em" }}>MEDIO DE PROPAGACIÓN</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 96px), 1fr))", gap: 8 }}>
                    {MEDIOS.map((me) => {
                      const on = me.id === medioId;
                      return (
                        <button key={me.id} type="button" onClick={() => setMedioId(me.id)}
                          style={{ cursor: "pointer", padding: "10px 6px", borderRadius: 12, textAlign: "center", color: "#fff",
                            border: `1px solid ${on ? me.color : "rgba(255,255,255,0.14)"}`, background: on ? `${me.color}22` : "transparent" }}>
                          <div style={{ fontSize: 17, color: on ? me.color : "inherit" }}><i className={`fa-solid ${me.icono}`} /></div>
                          <div style={{ fontSize: 14, fontWeight: 900 }}>{me.nombre}</div>
                          <div style={{ fontSize: 14, color: T.text2 }}>{fmt0(me.v)} m/s</div>
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${C_ONDA}44`, background: `${C_ONDA}14` }}>
                    Con v = <strong>{fmt0(medio.v)} m/s</strong> y f = <strong>{fmt0(f)} Hz</strong>: λ = v/f = <strong style={{ color: C_ONDA }}>{fmtLambda(onda.lambda)}</strong>. Al <strong>duplicar f</strong>, λ se reduce a la <strong>mitad</strong>.
                  </p>
                </Bloque>
              )}

              {modo === "interferencia" && (
                <Bloque titulo="Desfase y tipo de superposición" icono="fa-sliders">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                    {[
                      { on: !estacionaria, set: () => setEstacionaria(false), col: C_INTER, t: "Superposición", icono: "fa-plus-minus" },
                      { on: estacionaria, set: () => setEstacionaria(true), col: C_ESTAC, t: "Estacionaria", icono: "fa-grip-lines-vertical" },
                    ].map((b) => (
                      <button key={b.t} type="button" onClick={b.set}
                        style={{ cursor: "pointer", padding: "10px 6px", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 900,
                          border: `1px solid ${b.on ? b.col : "rgba(255,255,255,0.14)"}`, background: b.on ? `${b.col}22` : "transparent" }}>
                        <i className={`fa-solid ${b.icono}`} style={{ marginRight: 6, color: b.col }} />{b.t}
                      </button>
                    ))}
                  </div>
                  {!estacionaria ? (
                    <>
                      <Deslizador label="desfase φ" icon="fa-arrows-left-right-to-line" colr={tipoCol} valor={`${fmt2(phi)} rad`} min={FASE_MIN} max={FASE_MAX} step={0.01} value={phi} onChange={setPhi} hintL="0" hintR="2π" />
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 110px), 1fr))", gap: 6 }}>
                        {FASE_PRESETS.map((p) => {
                          const on = Math.abs(phi - p.phi) < 0.02;
                          return (
                            <button key={p.etq} type="button" onClick={() => setPhi(p.phi)}
                              style={{ cursor: "pointer", fontSize: 14, fontWeight: 800, color: on ? "#04121f" : C_INTER, background: on ? C_INTER : `${C_INTER}1f`, border: `1px solid ${C_INTER}55`, borderRadius: 8, padding: "8px 4px" }}>
                              {p.etq}
                            </button>
                          );
                        })}
                      </div>
                      <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${tipoCol}44`, background: `${tipoCol}14` }}>
                        Resultante <strong style={{ color: tipoCol }}>{inter.tipo}</strong>: A_res = |2A·cos(φ/2)| = <strong>{fmt2(inter.Ares)}</strong> ({fmt0(inter.pct * 100)}% del máximo). En fase se <strong>suman</strong>; en oposición se <strong>cancelan</strong>.
                      </p>
                    </>
                  ) : (
                    <>
                      <Deslizador label="amplitud de cada onda A" icon="fa-up-down" colr={C_ESTAC} valor={fmt2(A)} min={A_MIN} max={A_MAX} step={0.05} value={A} onChange={setA} hintL={fmt1(A_MIN)} hintR={fmt1(A_MAX)} />
                      <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${C_ESTAC}44`, background: `${C_ESTAC}14` }}>
                        Dos ondas iguales en <strong>sentidos opuestos</strong> forman una <strong>onda estacionaria</strong>: los <strong>nodos</strong> (grises) nunca se mueven y los <strong>antinodos</strong> (morados) oscilan al máximo, separados <strong>λ/2</strong>.
                      </p>
                    </>
                  )}
                </Bloque>
              )}

              {modo === "doppler" && (
                <Bloque titulo="Frecuencia y rapidez de la fuente" icono="fa-sliders">
                  <Deslizador label="frecuencia de la fuente f" icon="fa-music" colr={C_DOPP} valor={`${fmt0(fd)} Hz`} min={FD_MIN} max={FD_MAX} step={10} value={fd} onChange={setFd} hintL={`${fmt0(FD_MIN)} Hz`} hintR={`${fmt0(FD_MAX)} Hz`} />
                  <Deslizador label="rapidez de la fuente vs" icon="fa-gauge-high" colr={C_DOPP} valor={`${fmt0(vs)} m/s`} min={VS_MIN} max={VS_MAX} step={1} value={vs} onChange={setVs} hintL="0 (reposo)" hintR={`${fmt0(VS_MAX)} m/s`} />
                  <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: "1px solid #f8717144", background: "#f8717114" }}>
                    <i className="fa-solid fa-arrow-right" style={{ color: "#f87171", marginRight: 8 }} />
                    Se acerca: <strong style={{ color: "#f87171" }}>{fmt0(dopp.fAcerca)} Hz</strong> (+{fmt0(dopp.dAcerca)} Hz, más agudo)
                  </p>
                  <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: "1px solid #60a5fa44", background: "#60a5fa14" }}>
                    <i className="fa-solid fa-arrow-left" style={{ color: "#60a5fa", marginRight: 8 }} />
                    Se aleja: <strong style={{ color: "#60a5fa" }}>{fmt0(dopp.fAleja)} Hz</strong> (−{fmt0(dopp.dAleja)} Hz, más grave)
                  </p>
                </Bloque>
              )}

              <Bloque titulo="Lecturas" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {modo === "onda" && (
                    <>
                      <Dato label="frecuencia f" value={`${fmt0(f)} Hz`} col={C_ONDA} />
                      <Dato label="velocidad v" value={`${fmt0(medio.v)} m/s`} col={medio.color} />
                      <Dato label="long. onda λ" value={fmtLambda(onda.lambda)} col={C_ONDA} />
                      <Dato label="período T" value={`${fmt2(onda.T * 1000)} ms`} />
                    </>
                  )}
                  {modo === "interferencia" && (
                    <>
                      <Dato label="amplitud A" value={fmt2(A)} />
                      <Dato label="desfase φ" value={estacionaria ? "—" : `${fmt2(phi)} rad`} col={tipoCol} />
                      <Dato label="A resultante" value={estacionaria ? fmt2(2 * A) : fmt2(inter.Ares)} col={tipoCol} />
                      <Dato label="tipo" value={estacionaria ? "estacionaria" : inter.tipo} col={tipoCol} />
                    </>
                  )}
                  {modo === "doppler" && (
                    <>
                      <Dato label="f fuente" value={`${fmt0(fd)} Hz`} col={C_DOPP} />
                      <Dato label="vs fuente" value={`${fmt0(vs)} m/s`} col={C_DOPP} />
                      <Dato label="se acerca" value={`${fmt0(dopp.fAcerca)} Hz`} col="#f87171" />
                      <Dato label="se aleja" value={`${fmt0(dopp.fAleja)} Hz`} col="#60a5fa" />
                    </>
                  )}
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
              <Bloque titulo="La simulación" icono="fa-wave-square">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Ejemplo resuelto" icono="fa-square-check">
                <p style={{ margin: 0, color: T.text2 }}>{EJEMPLO.enunciado}</p>
                <div style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${C_ONDA}44` }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>λ = {fmt1(EJEMPLO.lambda * 100)} cm (0.5 m)</div>
                  <div style={{ color: T.text2 }}>{EJEMPLO.solucion}</div>
                </div>
              </Bloque>
              <Bloque titulo="Pasos de la simulación" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                  {INSTRUCCIONES.map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo="Para reflexionar" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
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
                <FichaTeorica data={ONDAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Física exacta de cálculo cerrado: v = λ·f, superposición A_res = |2A·cos(φ/2)| y efecto Doppler clásico (f′ = f·v/(v∓vs), v_sonido = 340 m/s). La onda en pantalla es esquemática: su longitud visual está acotada para que quepa (en acero se ve muy larga), pero los valores de λ, T y de las frecuencias Doppler son exactos. Enunciado, instrucciones, ejemplo y preguntas son verbatim de la actividad A2.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor de v = λ·f: λ cae al subir f, el producto no cambia ───────────── */
function MedidorV({ f, lambda, v, col }: { f: number; lambda: number; v: number; col: string }) {
  // λ en escala logarítmica: de 17 m (20 Hz en aire) a 5000 m (1 Hz en acero)
  const pct = Math.max(4, Math.min(100, ((Math.log10(lambda) - 1.2) / (3.7 - 1.2)) * 100));
  return (
    <div style={{ width: 176, display: "grid", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#dce6f5" }}>
        <span>λ</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtLambda(lambda)}</span>
      </div>
      <div style={{ height: 10, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: col, transition: "width 120ms linear" }} />
      </div>
      <div style={{ fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>
        λ × {fmt0(f)} Hz = {fmt0(v)} m/s
      </div>
    </div>
  );
}

/* ── Item de leyenda (visor) ──────────────────────────────────────────────── */
function LegItem({ col, txt }: { col: string; txt: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
      <span style={{ width: 18, height: 0, borderTop: `3px solid ${col}`, flexShrink: 0 }} />
      {txt}
    </div>
  );
}
