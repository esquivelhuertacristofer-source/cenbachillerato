"use client";

/**
 * Laboratorio 3D — El círculo unitario genera las ondas seno y coseno.
 * Práctica experimental para PM-IV-P04-A2 (ejercicio_matematico; progresión 4).
 *
 * EXPERIMENTO CENTRAL: el alumno gira el radio y ve que la ALTURA del punto P
 * dibuja la onda SENO y su posición HORIZONTAL la onda COSENO. Dos medidores con
 * signo (sen θ y cos θ entre −1 y +1) y la barra «sen² + cos² = 1» muestran la
 * consecuencia en vivo: siempre suman 1, en cualquier ángulo y cuadrante.
 * Matemática exacta (valores cerrados en los ángulos notables).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { CIRCULO_FICHA } from "./circulo-unitario-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { EppGate, type EppItem } from "./_epp-gate";
import { LabSfx } from "./lab-audio";
import {
  calcTrig, valorExacto, CUADRANTES, ESCENARIOS, IDEAS, DATOS,
  THETA_MIN, THETA_MAX, THETA_STEP, THETA_DEF,
  RETO_A2,
  fmtNum, fmtNum2, fmtDeg, fmtTan, type Escenario,
} from "./circulo-unitario-data";

const CirculoUnitarioScene = dynamic(() => import("./CirculoUnitarioScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-compass-drafting fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Dibujando el círculo unitario…</span>
    </div>
  ),
});

const SIN_COL = "#34D399";
const COS_COL = "#60a5fa";
const TAN_COL = "#f472b6";
const WARN = "#FF8A3C";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-circulo-reto";

/* Instrumentos de trazo (pilar EQUIPARSE) — 3 correctos + 3 distractores. */
const INSTRUMENTOS: EppItem[] = [
  { key: "transportador", nombre: "Transportador", icono: "fa-ruler-combined", ok: true, nota: "Mide el ángulo θ en grados sobre el círculo." },
  { key: "compas", nombre: "Compás", icono: "fa-compass-drafting", ok: true, nota: "Traza el círculo de radio 1 con precisión." },
  { key: "regla", nombre: "Regla graduada", icono: "fa-ruler", ok: true, nota: "Mide los catetos sen θ y cos θ del triángulo." },
  { key: "audifonos", nombre: "Audífonos", icono: "fa-headphones", ok: false, nota: "Te distraen; no sirven para trazar ni medir ángulos." },
  { key: "chicle", nombre: "Goma de mascar", icono: "fa-cookie-bite", ok: false, nota: "No es un instrumento de trazo geométrico." },
  { key: "mochila", nombre: "Mochila", icono: "fa-bag-shopping", ok: false, nota: "Guárdala: no se usa para construir el círculo." },
];

export function LabCirculoUnitario({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [theta, setTheta] = useState(THETA_DEF);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [mostrarCos, setMostrarCos] = useState(true);
  const [mostrarHelice, setMostrarHelice] = useState(true);
  const [mostrarTan, setMostrarTan] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // pilares: equiparse, arrastrar, calcular
  const [eppListo, setEppListo] = useState(false);
  const [arrastro, setArrastro] = useState(false);
  const [predicho, setPredicho] = useState(false);
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);

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

  // Barrido automático del ángulo (oscilloscopio): rAF en effect → sí actualiza
  // las lecturas. El timestamp lo da requestAnimationFrame (no Date.now()).
  useEffect(() => {
    if (!reproduciendo) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = ts - last;
      last = ts;
      setTheta((prev) => (prev + dt * 0.05) % 360); // ~50°/s → vuelta en ~7 s
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reproduciendo]);

  const t = useMemo(() => calcTrig(theta), [theta]);
  const exacto = useMemo(() => valorExacto(theta), [theta]);
  const pit = useMemo(() => t.sin * t.sin + t.cos * t.cos, [t]);

  const cuad = t.cuadrante === "eje" ? null : CUADRANTES[t.cuadrante - 1]!;
  const cuadColor = cuad?.color ?? "#94a3b8";

  const setManual = (v: number) => { setReproduciendo(false); setTheta(v); };
  const aplicar = (e: Escenario) => {
    setReproduciendo(false);
    setTheta(e.deg);
    bump();
    if (sonido) audioRef.current?.blip();
  };
  const reset = () => { setReproduciendo(false); setTheta(THETA_DEF); bump(); };
  const bump = () => setResetNonce((n) => n + 1);

  // arrastre del punto P en la escena 3D (pilar "manipular")
  const onArrastraTheta = useCallback((deg: number) => {
    setReproduciendo(false);
    setArrastro(true);
    setTheta(((deg % 360) + 360) % 360);
  }, []);
  const onGrabPunto = useCallback(() => { if (sonido) audioRef.current?.blip(); }, [sonido]);

  // registro del reto de cálculo (estrellas + récord local)
  const registraEstrellas = useCallback((est: number) => {
    setPredicho(true);
    guardaEstrellas(est);
  }, [guardaEstrellas]);

  const senStr = exacto ? exacto.sinStr : fmtNum(t.sin);
  const cosStr = exacto ? exacto.cosStr : fmtNum(t.cos);
  const tanStr = exacto ? (exacto.tanStr === "∄" ? "∄ (indef.)" : exacto.tanStr) : fmtTan(t.tan);
  const radStr = exacto ? `${exacto.radStr} rad` : `${fmtNum2(t.rad)} rad`;

  const aplicado = ESCENARIOS.some((e) => Math.abs(theta - e.deg) < 0.5);

  const objetivos = [
    { txt: "Equípate con los instrumentos de trazo correctos", done: eppListo },
    { txt: "Lleva P al punto más alto del círculo: el seno vale 1", done: t.sin > 0.995 },
    { txt: "Da una vuelta casi completa y mira las dos ondas dibujarse", done: theta >= 340 },
    { txt: "Arrastra el punto P y observa P = (cos θ, sen θ)", done: arrastro },
    { txt: "Aplica un ángulo clave (30°, 45°, 60°, 90°, 135°, 210° o 300°)", done: aplicado },
    { txt: "Identifica el cuadrante activo y su regla de signos", done: t.cuadrante !== "eje" },
    { txt: "Verifica la identidad pitagórica en un ángulo notable", done: Math.abs(pit - 1) < 0.001 },
    { txt: "Calcula sen θ en el reto y gana estrellas", done: predicho },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-compass-drafting" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>El punto que gira es (cos θ, sen θ)</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar el círculo en 3D, pero la idea sigue: en el círculo unitario (radio 1) el punto vale siempre (cos θ, sen θ). Su altura es el seno y su base el coseno; al girar, esas medidas dibujan las ondas. Usa el control y las lecturas para comprobarlo.
      </div>
    </div>
  );

  const lectura = <>θ = {fmtDeg(t.deg)} · sen = {fmtNum2(t.sin)} · cos = {fmtNum2(t.cos)}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <>
          <SceneBoundary fallback={sceneFallback}>
            <CirculoUnitarioScene
              thetaDeg={theta}
              accent={accent}
              mostrarCos={mostrarCos}
              mostrarHelice={mostrarHelice}
              mostrarTan={mostrarTan}
              autoRotate={autoRotate}
              pausado={false}
              resetNonce={resetNonce}
              arrastrable={eppListo}
              onThetaChange={onArrastraTheta}
              onGrab={onGrabPunto}
            />
          </SceneBoundary>
          {/* Compuerta de equipamiento (pilar EQUIPARSE) */}
          {!eppListo && (
            <EppGate
              accent={accent}
              rgba={color.rgba}
              items={INSTRUMENTOS}
              titulo="Antes de trazar: equípate"
              subtitulo="Elige tus instrumentos de trazo"
              intro="Para construir y medir ángulos en el círculo unitario necesitas tus instrumentos de trazo. Selecciona los 3 instrumentos correctos (no los distractores) para entrar."
              verbo="instrumentos de trazo"
              onEntrar={() => { setEppListo(true); if (sonido) audioRef.current?.blip(); }}
            />
          )}
        </>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={reproduciendo ? "fa-pause" : "fa-play"} titulo={reproduciendo ? "Pausar el giro" : "Girar el radio (barrido)"} activo={reproduciendo} onClick={() => setReproduciendo((p) => !p)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={<MedidorCirculo sen={t.sin} cos={t.cos} compacto />}
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Gira el radio: ángulo θ" icono="fa-rotate">
                <Deslizador label="θ · ángulo del radio" icon="fa-rotate" colr={accent}
                  valor={fmtDeg(t.deg)} min={THETA_MIN} max={THETA_MAX} step={THETA_STEP} value={theta}
                  onChange={setManual} hintL="0°" hintR="360° (vuelta completa)" />
                <p style={{ margin: 0, color: T.text2 }}>
                  También puedes <strong style={{ color: "#fff" }}>arrastrar el punto P</strong> sobre el círculo en la escena.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Interruptor activo={mostrarCos} col={COS_COL} etiqueta="Onda coseno" onClick={() => setMostrarCos((v) => !v)} />
                  <Interruptor activo={mostrarHelice} col="#f5d36b" etiqueta="Hélice" onClick={() => setMostrarHelice((v) => !v)} />
                  <Interruptor activo={mostrarTan} col={TAN_COL} etiqueta="Tangente" onClick={() => setMostrarTan((v) => !v)} />
                </div>
              </Bloque>

              <Bloque titulo="Ángulos clave" icono="fa-bullseye">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 96px), 1fr))", gap: 8 }}>
                  {ESCENARIOS.map((e) => (
                    <button key={e.label} type="button" title={e.desc} onClick={() => aplicar(e)}
                      style={{
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", borderRadius: 12,
                        fontSize: 14, fontWeight: 800, color: Math.abs(t.deg - e.deg) < 0.5 ? "#fff" : T.text2,
                        border: `1px solid ${Math.abs(t.deg - e.deg) < 0.5 ? accent : T.line}`,
                        background: Math.abs(t.deg - e.deg) < 0.5 ? `rgba(${color.rgba},0.2)` : T.inset,
                      }}>
                      <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                      {e.label}
                    </button>
                  ))}
                </div>
              </Bloque>

              <Bloque titulo="La consecuencia: sen² + cos² = 1" icono="fa-scale-balanced">
                <MedidorCirculo sen={t.sin} cos={t.cos} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="sen θ" value={senStr} col={SIN_COL} />
                  <Dato label="cos θ" value={cosStr} col={COS_COL} />
                  <Dato label="tan θ" value={tanStr} col={TAN_COL} />
                  <Dato label="θ en radianes" value={radStr} col={accent} />
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${cuadColor}55`, background: `${cuadColor}12` }}>
                  <i className="fa-solid fa-compass" style={{ color: cuadColor, marginRight: 8 }} />
                  {cuad ? `Cuadrante ${cuad.q} (${cuad.rango}): ${cuad.positivas}.` : "Sobre un eje: una de las razones vale 0 (o ±1)."}
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
            <>
              <PrediccionTrigCard
                accent={accent}
                degLive={t.deg}
                sinLive={t.sin}
                mejor={mejorEstrellas}
                onResultado={registraEstrellas}
                playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
              />
              <RetoNumericoCard
                reto={RETO_A2}
                accent={accent}
                aprobado={ejercicioAprobado}
                onAprobado={() => setEjercicioAprobado(true)}
                playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
              />
            </>
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Regla de signos por cuadrante" icono="fa-compass">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 10 }}>
                  {CUADRANTES.map((q) => {
                    const on = cuad?.q === q.q;
                    return (
                      <div key={q.q} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 13px", borderRadius: 12, border: `1px solid ${on ? q.color + "88" : T.line}`, background: on ? `${q.color}18` : T.inset }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: on ? "#04121f" : q.color, background: on ? q.color : `${q.color}22`, flexShrink: 0 }}>
                          Q{q.q}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 900, color: on ? "#fff" : T.text2, fontFamily: "ui-monospace, monospace" }}>
                            sen {q.sin} · cos {q.cos} · tan {q.tan}
                          </div>
                          <div style={{ fontSize: 14, color: T.text2 }}>{q.rango} · {q.positivas}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Bloque>
              <Bloque titulo="Identidad pitagórica" icono="fa-square-root-variable">
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "ui-monospace, monospace", textAlign: "center", padding: "12px 8px", borderRadius: 12, background: T.inset, border: `1px solid ${T.line}` }}>
                  sen²θ + cos²θ = 1
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
                  <span style={{ color: T.text2 }}>Comprobación ahora</span>
                  <span style={{ fontWeight: 900, color: OK, fontFamily: "ui-monospace, monospace" }}>
                    {fmtNum2(t.sin * t.sin)} + {fmtNum2(t.cos * t.cos)} = {fmtNum2(pit)}
                  </span>
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  Es el <strong style={{ color: accent }}>Teorema de Pitágoras</strong> del triángulo dentro del círculo: los catetos son <strong style={{ color: SIN_COL }}>sen θ</strong> y <strong style={{ color: COS_COL }}>cos θ</strong>, y la hipotenusa es el radio = 1.
                </p>
              </Bloque>
              <Bloque titulo="Del triángulo al círculo" icono="fa-circle-nodes">
                <p style={{ margin: 0, color: T.text2 }}>
                  En el triángulo rectángulo el seno y el coseno solo existen de 0° a 90°. El círculo unitario los <strong style={{ color: "#fff" }}>extiende a cualquier ángulo</strong>: más allá de 90° el punto sigue teniendo coordenadas, así que sen y cos siguen definidos —solo cambian de signo según el cuadrante—. Por eso son <strong style={{ color: accent }}>funciones periódicas</strong>.
                </p>
              </Bloque>
              <Bloque titulo="Seno y coseno: desfase 90°" icono="fa-wave-square">
                <p style={{ margin: 0, color: T.text2 }}>
                  Activa la <strong style={{ color: "#f5d36b" }}>hélice</strong>: es la curva que traza el punto al girar mientras avanza el tiempo. Su sombra en el muro es la <strong style={{ color: SIN_COL }}>onda seno</strong> y su sombra en el piso es la <strong style={{ color: COS_COL }}>onda coseno</strong>. Por eso van desfasadas 90°: cuando una vale 1, la otra vale 0.
                </p>
              </Bloque>
              <Bloque titulo="Datos" icono="fa-gauge-high">
                {DATOS.map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${d.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                    <div>
                      <strong style={{ fontFamily: "ui-monospace, monospace" }}>{d.valor}</strong>
                      <div style={{ color: T.text2 }}>{d.texto}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CIRCULO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Cálculo <strong>exacto</strong>: el seno, el coseno y la tangente salen de las coordenadas del punto en el círculo de radio 1; en los ángulos notables se muestran sus valores cerrados (√3/2, √2/2, π/6…). La escena usa unidades de pantalla para encuadrar las ondas, pero los valores numéricos siempre son reales.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor: sen θ y cos θ con signo, y la barra que siempre suma 1 ──────── */
function MedidorCirculo({ sen, cos, compacto = false }: { sen: number; cos: number; compacto?: boolean }) {
  const barra = (txt: string, v: number, c: string) => (
    <div style={{ display: "grid", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>{txt}</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtNum2(v)}</span>
      </div>
      <div style={{ position: "relative", height: compacto ? 8 : 12, borderRadius: 6, background: "rgba(255,255,255,0.1)" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: v >= 0 ? "50%" : `${50 + v * 50}%`, width: `${Math.abs(v) * 50}%`, background: c, borderRadius: 6, transition: "all 100ms linear" }} />
        <div style={{ position: "absolute", top: -2, bottom: -2, left: "50%", width: 2, background: "rgba(255,255,255,0.55)" }} />
      </div>
    </div>
  );
  const s2 = sen * sen, c2 = cos * cos;
  return (
    <div style={{ display: "grid", gap: compacto ? 6 : 10, width: compacto ? 200 : undefined }}>
      {barra("sen θ (altura)", sen, SIN_COL)}
      {barra("cos θ (base)", cos, COS_COL)}
      <div style={{ display: "grid", gap: 3 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
          <span>sen² + cos²</span><span style={{ fontFamily: "ui-monospace, monospace", color: OK }}>= {fmtNum2(s2 + c2)}</span>
        </div>
        <div style={{ display: "flex", height: compacto ? 8 : 12, borderRadius: 6, overflow: "hidden", background: "rgba(255,255,255,0.1)" }}>
          <div style={{ width: `${s2 * 100}%`, background: SIN_COL, transition: "width 100ms linear" }} />
          <div style={{ width: `${c2 * 100}%`, background: COS_COL, transition: "width 100ms linear" }} />
        </div>
      </div>
    </div>
  );
}

function Interruptor({ activo, col, etiqueta, onClick }: { activo: boolean; col: string; etiqueta: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={activo}
      style={{
        cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 11, fontSize: 14, fontWeight: 800,
        color: activo ? "#fff" : T.text2, border: `1px solid ${activo ? `${col}88` : T.line}`, background: activo ? `${col}1a` : T.inset,
      }}>
      <i className={`fa-solid ${activo ? "fa-eye" : "fa-eye-slash"}`} style={{ color: col }} /> {etiqueta}
    </button>
  );
}

/* ── Reto de cálculo en vivo: predecir sen θ ─────────────────────────────── */
function PrediccionTrigCard({
  accent, degLive, sinLive, mejor, onResultado, playSfx,
}: {
  accent: string;
  degLive: number;
  sinLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<{ deg: number; sin: number } | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [estrellas, setEstrellas] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const tomarLectura = () => {
    setSnap({ deg: degLive, sin: sinLive });
    setVal("");
    setIntentos(0);
    setEstrellas(null);
    setMsg(null);
  };

  const comprobar = () => {
    if (!snap) return;
    const num = Number(val.replace(",", "."));
    if (val.trim() === "" || Number.isNaN(num)) {
      setMsg("Escribe tu valor de sen θ (por ejemplo 0.5 o −0.87).");
      return;
    }
    const n = intentos + 1;
    setIntentos(n);
    const ok = Math.abs(num - snap.sin) <= 0.04;
    if (ok) {
      const est = n <= 1 ? 3 : n === 2 ? 2 : 1;
      setEstrellas(est);
      setMsg(null);
      onResultado(est);
      playSfx?.(true);
    } else {
      const cerca = Math.abs(num - snap.sin) <= 0.12;
      setMsg(cerca ? "Muy cerca. Revisa el redondeo y vuelve a intentar." : "Aún no. Recuerda: sen θ es la ALTURA del punto (y su signo depende del cuadrante).");
      playSfx?.(false);
    }
  };

  return (
    <div style={{ ...card, padding: "20px 22px 22px", marginTop: 22, border: `1px solid ${accent}55` }}>
      <Eyebrow>
        <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />
        Reto de cálculo: predice sen θ
      </Eyebrow>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        {[1, 2, 3].map((s) => (
          <i key={s} className="fa-solid fa-star" style={{ fontSize: 15, color: (estrellas ?? 0) >= s ? "#fbbf24" : "rgba(255,255,255,0.18)" }} />
        ))}
        <span style={{ marginLeft: 8, fontSize: 14, color: T.text3, fontWeight: 700 }}>Mejor: {mejor}★</span>
      </div>

      {!snap ? (
        <>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>
            Coloca el punto P en un ángulo (arrástralo, usa el deslizador o aplica un ángulo notable) y captura la lectura. Luego tú calculas <strong style={{ color: "#fff" }}>sen θ</strong> con tu transportador y tu calculadora —sin mirar la lectura del seno— y lo verificas.
          </div>
          <button className="calc-btn calc-btn-primary" onClick={tomarLectura}>
            <i className="fa-solid fa-camera" style={{ marginRight: 8 }} /> Capturar el ángulo actual (θ = {fmtDeg(degLive)})
          </button>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: T.inset, border: `1px solid ${T.line}`, marginBottom: 14 }}>
            <i className="fa-solid fa-compass" style={{ fontSize: 18, color: accent }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", color: T.text3 }}>ÁNGULO CAPTURADO</div>
              <div style={{ ...NUM, fontSize: 17, fontWeight: 900, color: "#fff" }}>θ = {fmtDeg(snap.deg)}</div>
            </div>
            <button className="calc-btn calc-btn-ghost" style={{ marginLeft: "auto", padding: "8px 12px", fontSize: 14 }} onClick={tomarLectura}>
              <i className="fa-solid fa-rotate-left" style={{ marginRight: 6 }} /> Otro ángulo
            </button>
          </div>

          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginBottom: 10 }}>
            ¿Cuánto vale <strong style={{ color: SIN_COL }}>sen {fmtDeg(snap.deg)}</strong>? Escribe tu resultado (2 decimales; usa signo negativo si el punto está debajo del eje).
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              className="calc-in"
              style={{ flex: "1 1 160px" }}
              inputMode="decimal"
              placeholder="sen θ = …"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") comprobar(); }}
              disabled={estrellas !== null}
            />
            <button className="calc-btn calc-btn-primary" onClick={comprobar} disabled={estrellas !== null || val.trim() === ""}>
              <i className="fa-solid fa-check" style={{ marginRight: 8 }} /> Verificar
            </button>
          </div>

          {msg && (
            <div style={{ marginTop: 12, fontSize: 14, color: WARN, lineHeight: 1.45, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
              <span>{msg}</span>
            </div>
          )}

          {estrellas !== null && (
            <div style={{ marginTop: 14, padding: "13px 15px", borderRadius: 12, background: `${OK}14`, border: `1px solid ${OK}55` }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: OK }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} /> ¡Correcto!
              </div>
              <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 6 }}>
                sen {fmtDeg(snap.deg)} = <strong style={{ ...NUM, color: "#fff" }}>{fmtNum2(snap.sin)}</strong>. Es la altura (coordenada y) del punto en el círculo de radio 1. Captura otro ángulo para seguir practicando.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
