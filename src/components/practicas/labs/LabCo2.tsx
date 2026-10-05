"use client";

/**
 * Laboratorio 3D — Reacción vinagre + bicarbonato (desprendimiento de CO₂).
 * Práctica experimental para CNEYT-IV-P08-A2 (simulacion "Simulación:
 * experimentos de química casera"; UAC "Reacciones químicas", progresión 8:
 * "Diseña y realiza experimentos sencillos de química con materiales
 * accesibles"). Modela el Experimento 1 de la simulación.
 *
 * El alumno diseña el experimento: elige la variable independiente (gramos de
 * bicarbonato, % o volumen de vinagre), "reacciona" y mide la variable
 * dependiente (volumen de CO₂ que infla el globo y el tiempo). El cálculo es
 * estequiometría real (1:1) con REACTIVO LIMITANTE; un control con agua
 * permite comprobar que el gas proviene del ácido.
 *
 * Valores caseros (g por cucharada, tiempo de reacción) = aproximados/didácticos.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { REACCION_CO2_FICHA } from "./reaccion-co2-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./reaccion-co2-data";
import { LabSfx } from "./lab-audio";
import {
  VINAGRES, VOLUMENES, VOL_DEF, PCT_DEF,
  BICARB_MIN, BICARB_MAX, BICARB_PASO, BICARB_DEF,
  CUCHARADITA_G, CUCHARADA_G,
  calcula, curvaCO2, gEstequiometrico, tiempoReaccion,
  ECUACION, TIPO_REACCION, DATOS, IDEAS,
  fmt0, fmt1, fmtVol, type PuntoG,
} from "./co2-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-reaccion-co2-reto";

const Co2Scene = dynamic(() => import("./Co2Scene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el material…</span>
    </div>
  ),
});

type Foco = "bicarbonato" | "concentracion" | "volumen";

const FOCOS: { id: Foco; label: string; icono: string }[] = [
  { id: "bicarbonato", label: "Gramos de bicarbonato", icono: "fa-spoon" },
  { id: "concentracion", label: "% del vinagre", icono: "fa-percent" },
  { id: "volumen", label: "Volumen de vinagre", icono: "fa-flask" },
];

export function LabCo2({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const colorGlobo = "#FB7185"; // globo rosado (color del experimento)

  const [volMl, setVolMl] = useState(VOL_DEF);
  const [pct, setPct] = useState(PCT_DEF);
  const [gBicarb, setGBicarb] = useState(BICARB_DEF);
  const [control, setControl] = useState(false);
  const [foco, setFoco] = useState<Foco>("bicarbonato");

  const [reaccionando, setReaccionando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resetNonce, setResetNonce] = useState(0);

  // evaluable, teoría (cajón deslizable) y sonido
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

  // Control = agua en lugar de vinagre → no hay ácido → no hay reacción.
  const res = useMemo(() => calcula(volMl, control ? 0 : pct, gBicarb), [volMl, pct, gBicarb, control]);
  const gEstq = useMemo(() => gEstequiometrico(volMl, pct), [volMl, pct]);
  const tiempo = tiempoReaccion(pct);
  const curva = useMemo(() => curvaCO2(volMl, pct), [volMl, pct]);
  const hayReaccion = res.nCO2 > 0.01;

  // Volumen "en vivo" según el avance de la reacción (lo que muestra el globo).
  const volVivo = res.volCO2mL * progreso;

  // Animación de la reacción (setInterval en useEffect: seguro con React
  // Compiler — no es render ni useFrame).
  useEffect(() => {
    if (!reaccionando) return;
    const id = setInterval(() => {
      setProgreso((p) => {
        if (p >= 1) {
          setReaccionando(false);
          return 1;
        }
        return Math.min(1, p + 0.02);
      });
    }, 40);
    return () => clearInterval(id);
  }, [reaccionando]);

  // Cambiar una variable detiene la reacción y desinfla el globo (hay que
  // volver a "reaccionar" con el nuevo diseño experimental).
  const resetReaccion = () => {
    setReaccionando(false);
    setProgreso(0);
  };
  const cambiarBic = (g: number) => { setGBicarb(g); resetReaccion(); };
  const cambiarPct = (p: number) => { setPct(p); resetReaccion(); };
  const cambiarVol = (v: number) => { setVolMl(v); resetReaccion(); };
  const toggleControl = () => { setControl((c) => !c); resetReaccion(); };

  const reaccionar = () => { if (sonido) audioRef.current?.blip(); setProgreso(0); setReaccionando(true); };
  const reiniciar = () => { setReaccionando(false); setProgreso(0); setResetNonce((n) => n + 1); };

  const limTxt =
    control ? "Control: agua (no reacciona)"
    : res.limitante === "bicarbonato" ? "Bicarbonato (se agota)"
    : res.limitante === "acido" ? "Ácido acético (se agota)"
    : "Cantidades exactas";
  const limCol = control ? T.text3 : res.limitante === "iguales" ? "#A78BFA" : accent;

  const aprox = `≈ ${fmt1(gBicarb / CUCHARADA_G)} cda · ${fmt1(gBicarb / CUCHARADITA_G)} cdta`;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-flask" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Reacción vinagre + bicarbonato</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: con esta mezcla se producen {fmtVol(res.volCO2mL)} de CO₂ ({fmt0(res.nCO2)} mmol). Limitante: {limTxt.toLowerCase()}.
      </div>
    </div>
  );

  const lectura = control
    ? <>Control con agua: no hay ácido, no hay gas</>
    : <>CO₂ {fmtVol(volVivo)} · {limTxt}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <>
          <style>{CSS_CO2}</style>
          <SceneBoundary fallback={sceneFallback}>
            <Co2Scene volCO2mL={control ? 0 : res.volCO2mL} progreso={progreso} reaccionando={reaccionando && hayReaccion} colorGlobo={colorGlobo} accent={accent} resetNonce={resetNonce} />
          </SceneBoundary>
        </>
      }
      modos={{
        opciones: FOCOS.map((f) => ({ id: f.id, etiqueta: f.label, icono: f.icono })),
        valor: foco,
        cambiar: (id) => setFoco(id as Foco),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={reaccionando ? "fa-spinner" : "fa-play"} titulo="¡Reaccionar!" activo={reaccionando} onClick={() => { if (!reaccionando) reaccionar(); }} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      leyenda={
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: colorGlobo, border: "1px solid rgba(255,255,255,0.4)" }} />
            tamaño del globo = CO₂
          </div>
          <div style={{ color: limCol, fontWeight: 800 }}>{limTxt}</div>
          <div style={{ color: T.text2 }}>{control ? "Agua (control)" : `${volMl} mL de vinagre ${pct}%`} + {fmt1(gBicarb)} g NaHCO₃</div>
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Diseña el experimento eligiendo una variable independiente", done: progreso > 0 },
        { txt: "Pasa del punto exacto de bicarbonato y reacciona: ¿el globo sigue creciendo?", done: !control && hayReaccion && progreso >= 1 && gBicarb >= gEstq * 1.1 },
        { txt: "Activa el control con agua para comprobar el origen del CO₂", done: control },
        { txt: "Observa el reactivo limitante en la reacción", done: progreso >= 1 && hayReaccion },
        { txt: "Aprueba el cuestionario de la actividad A4", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Diseña el experimento" icono="fa-vials">
                <p style={{ margin: 0, color: T.text2 }}>
                  Variable independiente: <strong style={{ color: "#fff" }}>{FOCOS.find((f) => f.id === foco)!.label}</strong>. Elígela arriba, sobre la escena.
                </p>
                <Deslizador label="Bicarbonato de sodio" icon="fa-spoon" colr={accent} valor={`${fmt1(gBicarb)} g`} min={BICARB_MIN} max={BICARB_MAX} step={BICARB_PASO} value={gBicarb} onChange={cambiarBic} hintL={aprox} hintR={`punto exacto ≈ ${fmt1(gEstq)} g`} />
                <div className="co2-fila">
                  <div>
                    <div style={{ fontWeight: 800, color: T.text2, marginBottom: 8 }}>Concentración del vinagre</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {VINAGRES.map((v) => (
                        <button key={v.pct} className="co2-pill" data-on={pct === v.pct && !control} disabled={control} onClick={() => cambiarPct(v.pct)} style={{ flex: 1, opacity: control ? 0.4 : 1, cursor: control ? "not-allowed" : "pointer" }}>{v.pct}%</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: T.text2, marginBottom: 8 }}>Volumen de vinagre (mL)</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {VOLUMENES.map((v) => (
                        <button key={v} className="co2-pill" data-on={volMl === v} onClick={() => cambiarVol(v)} style={{ flex: 1 }}>{v}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="co2-chip" data-on={control} onClick={toggleControl} style={{ justifyContent: "center", textAlign: "center" }}>
                  <i className="fa-solid fa-vial-circle-check" style={{ color: control ? accent : T.text3 }} />
                  Usar agua como control (debe NO reaccionar)
                </button>
                <div className="co2-fila">
                  <button className="co2-solve" onClick={reaccionar} disabled={reaccionando}
                    style={{ background: reaccionando ? "rgba(255,255,255,0.06)" : accent, color: reaccionando ? T.text3 : "#04121f", cursor: reaccionando ? "default" : "pointer" }}>
                    <i className={`fa-solid ${reaccionando ? "fa-spinner fa-spin" : "fa-play"}`} />
                    {reaccionando ? "Reaccionando…" : "¡Reaccionar!"}
                  </button>
                  <button className="co2-ghost" onClick={reiniciar}>
                    <i className="fa-solid fa-rotate-left" /> Reiniciar
                  </button>
                </div>
              </Bloque>

              <Bloque titulo="Lo que mides" icono="fa-wind">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="CO₂ producido" value={fmtVol(control ? 0 : res.volCO2mL)} col={colorGlobo} />
                  <Dato label="CO₂ (mmol)" value={control ? "0" : fmt0(res.nCO2)} col={colorGlobo} />
                  <Dato label="ácido (mmol)" value={control ? "0" : fmt0(res.nAcido)} col="#FB7185" />
                  <Dato label="bicarb. (mmol)" value={fmt0(res.nBicarb)} col="#34D399" />
                  <Dato label="masa CO₂ (g)" value={control ? "0" : fmt1(res.masaCO2)} col="#bfe8ff" />
                  <Dato label="tiempo aprox. (s)" value={control ? "—" : `~${tiempo}`} col="#bfe8ff" />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${limCol}55`, background: `${limCol}12` }}>
                  {control
                    ? <>El agua no tiene ácido, así que <strong style={{ color: "#fff" }}>no se produce CO₂</strong>: es el control que confirma que el gas viene del vinagre.</>
                    : res.limitante === "bicarbonato"
                      ? <>Sobra ácido: el <strong style={{ color: "#34D399" }}>bicarbonato se agota</strong> primero y limita el CO₂. Añadir más vinagre no daría más gas.</>
                      : res.limitante === "acido"
                        ? <>Sobra bicarbonato ({fmt0(res.sobranteMmol)} mmol sin reaccionar): el <strong style={{ color: "#FB7185" }}>ácido se agota</strong> y limita el CO₂. <strong>Echar más bicarbonato no produce más gas.</strong></>
                        : <>Cantidades <strong style={{ color: "#A78BFA" }}>estequiométricas</strong>: ambos reactivos se consumen por completo.</>}
                </p>
              </Bloque>

              <Bloque titulo="CO₂ producido vs gramos de bicarbonato" icono="fa-chart-line">
                <CurvaCO2 curva={curva} gActual={gBicarb} gEstq={gEstq} accent={accent} />
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
              <Bloque titulo="Método científico" icono="fa-microscope">
                <MetVar etiqueta="Variable independiente" valor={FOCOS.find((f) => f.id === foco)!.label} sub="la que tú cambias" col={accent} />
                <MetVar etiqueta="Variable dependiente" valor="Volumen de CO₂ y tiempo" sub="lo que mides" col="#bfe8ff" />
                <MetVar etiqueta="Variables controladas" valor={controladas(foco)} sub="lo que mantienes igual" col={T.text2} />
                <MetVar etiqueta="Control" valor={control ? "Activo: agua sin ácido" : "Agua sin ácido (actívalo)"} sub="muestra que no debe reaccionar" col={control ? "#34D399" : T.text3} />
              </Bloque>
              <Bloque titulo="La reacción" icono="fa-atom">
                <div style={{ padding: "12px 14px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}`, fontWeight: 800, color: "#fff", fontFamily: "ui-monospace, monospace", textAlign: "center", lineHeight: 1.5 }}>
                  {ECUACION}
                </div>
                <p style={{ margin: 0, color: T.text2 }}><strong style={{ color: "#fff" }}>Tipo:</strong> {TIPO_REACCION}.</p>
                <p style={{ margin: 0, color: T.text3 }}>
                  <strong style={{ color: accent }}>Conservación de la masa:</strong> los átomos no se crean ni se destruyen. El CO₂ escapa como gas, por eso un frasco abierto pesa menos al terminar.
                </p>
              </Bloque>
              <Bloque titulo="Datos clave" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 10 }}>
                  {DATOS.map((d, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                      <i className={`fa-solid ${d.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                      <div>
                        <div style={{ fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{d.valor}</div>
                        <div style={{ color: T.text2, lineHeight: 1.4 }}>{d.texto}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={REACCION_CO2_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                El volumen de CO₂ se calcula con <strong>estequiometría real</strong> (relación molar 1:1 y reactivo limitante) usando el volumen molar de un gas a 25 °C y 1 atm (24.45 L/mol). Los valores caseros son <strong>aproximados</strong> (1 cucharada ≈ 14 g; 1 cucharadita ≈ 4 g) y el tiempo de reacción es <strong>cualitativo/didáctico</strong> (mayor concentración → más rápido), no una medición. El globo y las burbujas ilustran el gas; su tamaño es proporcional al volumen calculado.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

const CSS_CO2 = `
  .co2-chip { cursor:pointer; padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
    color:${T.text2}; font-size:14px; font-weight:800; transition:all .15s; display:flex; align-items:center; gap:9px; }
  .co2-chip:hover { border-color:rgba(255,255,255,0.4); color:#fff; }
  .co2-chip[data-on="true"] { border-color:var(--lsa); background:rgba(255,255,255,0.1); color:#fff; }
  .co2-pill { cursor:pointer; padding:9px 12px; border-radius:10px; border:1px solid ${T.line}; background:${T.inset};
    color:${T.text2}; font-size:14px; font-weight:900; transition:all .15s; }
  .co2-pill[data-on="true"] { border-color:var(--lsa); background:rgba(255,255,255,0.12); color:#fff; }
  .co2-pill:hover { color:#fff; }
  .co2-fila { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap:12px; }
  .co2-solve { cursor:pointer; flex:1; padding:11px 14px; border-radius:11px; border:none; font-size:14px; font-weight:900;
    display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
  .co2-ghost { cursor:pointer; padding:11px 14px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
    color:${T.text2}; font-size:14px; font-weight:900; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
  .co2-ghost:hover { border-color:rgba(255,255,255,0.3); color:#fff; }
`;

/* ── Texto de variables controladas según el foco ────────────────────────── */
function controladas(foco: Foco): string {
  if (foco === "bicarbonato") return "Vinagre (% y volumen), temperatura";
  if (foco === "concentracion") return "Bicarbonato (g), volumen, temperatura";
  return "Bicarbonato (g), % del vinagre, temperatura";
}

/* ── Fila de variable del método científico ──────────────────────────────── */
function MetVar({ etiqueta, valor, sub, col }: { etiqueta: string; valor: string; sub: string; col: string }) {
  return (
    <div style={{ padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.06em", color: T.text3, textTransform: "uppercase" }}>{etiqueta}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: col, marginTop: 2 }}>{valor}</div>
      <div style={{ fontSize: 14, color: T.text3 }}>{sub}</div>
    </div>
  );
}

/* ── Curva CO₂ vs bicarbonato (SVG inline) ───────────────────────────────── */
function CurvaCO2({ curva, gActual, gEstq, accent }: { curva: PuntoG[]; gActual: number; gEstq: number; accent: string }) {
  const W = 320, H = 150, PL = 38, PB = 24, PT = 10, PR = 10;
  const gMax = curva[curva.length - 1]?.g ?? 1;
  const vMax = Math.max(...curva.map((p) => p.volCO2mL), 1);
  const x = (g: number) => PL + (g / gMax) * (W - PL - PR);
  const y = (v: number) => PT + (1 - v / vMax) * (H - PT - PB);
  const pts = curva.map((p) => `${x(p.g).toFixed(1)},${y(p.volCO2mL).toFixed(1)}`).join(" ");
  const vActual = curva.reduce((best, p) => (Math.abs(p.g - gActual) < Math.abs(best.g - gActual) ? p : best), curva[0]!);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {/* eje Y (volumen) */}
      <text x={4} y={y(vMax) + 3} fontSize={11} fill="rgba(255,255,255,0.5)">{fmtVol(vMax)}</text>
      <text x={4} y={H - PB + 3} fontSize={11} fill="rgba(255,255,255,0.5)">0</text>
      <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      {/* línea del punto estequiométrico (donde deja de subir) */}
      <line x1={x(gEstq)} y1={PT} x2={x(gEstq)} y2={H - PB} stroke={`${accent}66`} strokeWidth={1} strokeDasharray="4 3" />
      <text x={x(gEstq)} y={H - 9} textAnchor="middle" fontSize={11} fill={accent} fontWeight={700}>punto exacto</text>
      {/* curva (sube y luego se aplana = reactivo limitante) */}
      <polyline points={pts} fill="none" stroke={accent} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
      {/* punto actual */}
      <circle cx={x(vActual.g)} cy={y(vActual.volCO2mL)} r={4.5} fill="#fff" stroke={accent} strokeWidth={2} />
      <text x={x(vActual.g)} y={y(vActual.volCO2mL) - 8} textAnchor="middle" fontSize={11} fill="#fff" fontWeight={800}>{fmtVol(vActual.volCO2mL)}</text>
      {/* eje x */}
      <text x={(PL + W - PR) / 2} y={H - 1} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.4)">gramos de bicarbonato →</text>
    </svg>
  );
}
