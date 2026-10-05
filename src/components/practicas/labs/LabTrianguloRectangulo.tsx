"use client";

/**
 * Laboratorio 3D — Medición indirecta con razones trigonométricas.
 * Práctica experimental para PM-IV-P03-A2 (ejercicio_matematico; progresión 3).
 *
 * El alumno se "para" a una distancia d de un árbol y mide el ángulo de elevación
 * θ a la copa. La escena arma el triángulo rectángulo y, en vivo, calcula la
 * altura inalcanzable: H = (altura del observador) + d·tan θ. Refuerza SOH-CAH-TOA
 * y el concepto de medición indirecta. Cálculo exacto.
 *
 * EXPERIMENTO CENTRAL: con θ fijo, el cateto opuesto crece en proporción a d (triángulos
 * semejantes); con d fijo, crece con tan θ. Un medidor arma H = ojos + d·tan θ en vivo.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { TRIANGULO_FICHA } from "./triangulo-rectangulo-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";
import {
  calcMed, RAZONES, ESCENARIOS, IDEAS, DATOS,
  D_MIN, D_MAX, D_STEP, D_DEF, ANG_MIN, ANG_MAX, ANG_STEP, ANG_DEF,
  fmtNum2, fmtM, fmtDeg, type Escenario,
  RETO_A2,
} from "./triangulo-rectangulo-data";

const TrianguloRectanguloScene = dynamic(() => import("./TrianguloRectanguloScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-ruler-vertical fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Levantando el triángulo de medición…</span>
    </div>
  ),
});

const ADY_COL = "#60a5fa";
const OP_COL = "#34D399";
const HYP_COL = "#f5d36b";

const RETO_KEY = "cen-triangulo-rectangulo-reto";

export function LabTrianguloRectangulo({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [d, setD] = useState(D_DEF);
  const [angDeg, setAngDeg] = useState(ANG_DEF);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [mostrarHip, setMostrarHip] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const dir = useRef(1);

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

  // Barrido automático del ángulo de elevación (rebota entre los límites).
  // rAF en effect → sí actualiza las lecturas; el timestamp lo da rAF.
  useEffect(() => {
    if (!reproduciendo) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = ts - last;
      last = ts;
      setAngDeg((prev) => {
        let next = prev + dt * 0.02 * dir.current; // ~20°/s
        if (next >= ANG_MAX) { next = ANG_MAX; dir.current = -1; }
        else if (next <= ANG_MIN) { next = ANG_MIN; dir.current = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reproduciendo]);

  const m = useMemo(() => calcMed(d, angDeg), [d, angDeg]);

  const setDmanual = (v: number) => { setReproduciendo(false); setD(v); };
  const setAngManual = (v: number) => { setReproduciendo(false); setAngDeg(v); };
  const aplicar = (e: Escenario) => {
    setReproduciendo(false); setD(e.d); setAngDeg(e.angDeg); bump();
    if (sonido) audioRef.current?.blip();
  };
  const reset = () => { setReproduciendo(false); setD(D_DEF); setAngDeg(ANG_DEF); bump(); };
  const bump = () => setResetNonce((n) => n + 1);

  const objetivos = [
    { txt: "Duplica la distancia sin mover el ángulo: el opuesto también se duplica", done: Math.abs(angDeg - ANG_DEF) < 0.5 && d >= 2 * D_DEF },
    { txt: "Sube el ángulo a 45°: el opuesto iguala a la distancia (tan 45° = 1)", done: Math.abs(angDeg - 45) < 0.5 },
    { txt: "Ajusta la distancia d y el ángulo de elevación θ", done: d !== D_DEF || angDeg !== ANG_DEF },
    {
      txt: "Prueba un escenario guiado (árbol, edificio, torre…)",
      done: ESCENARIOS.some((e) => Math.abs(m.d - e.d) < 0.5 && Math.abs(m.angDeg - e.angDeg) < 0.5),
    },
    { txt: "Enciende la hipotenusa: la línea de visión hasta lo alto del objeto", done: mostrarHip },
    { txt: "Deja correr la medición automática y observa cómo cambia la altura", done: reproduciendo },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];
  // Los objetivos se recuerdan (algunos dependían del modo y se desmarcaban
  // solos) y se convierten en la marca del laboratorio, que antes no se
  // guardaba en ninguna parte.
  const { cumplidos: cumplidosLab, total: totalLab } = useLogros(objetivos.map((o) => o.done));
  const { registraEstrellas } = useEstrellas(RETO_KEY);
  useEffect(() => {
    if (cumplidosLab === 0) return;
    const est = cumplidosLab >= totalLab ? 3 : cumplidosLab >= Math.ceil((totalLab * 2) / 3) ? 2 : 1;
    registraEstrellas(est);
  }, [cumplidosLab, totalLab, registraEstrellas]);

  // valores de las razones a partir de los lados reales (en metros)
  const razonVal: Record<string, string> = {
    "sen θ": fmtNum2(m.opuesto / m.hip),
    "cos θ": fmtNum2(m.ady / m.hip),
    "tan θ": fmtNum2(m.opuesto / m.ady),
  };

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-ruler-vertical" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Mide lo que no puedes alcanzar</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: con la distancia d y el ángulo de elevación θ, la altura es H = {fmtM(m.eye)} + d·tan θ. Usa los controles y las lecturas para comprobarlo.
      </div>
    </div>
  );

  const lectura = <>H = {fmtM(m.H)} · opuesto = d · tan θ = {fmtM(m.opuesto)}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <TrianguloRectanguloScene
            d={d}
            angDeg={angDeg}
            accent={accent}
            mostrarHip={mostrarHip}
            autoRotate={autoRotate}
            pausado={false}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={reproduciendo ? "fa-pause" : "fa-play"} titulo={reproduciendo ? "Pausar el barrido del ángulo" : "Barrer el ángulo de elevación"} activo={reproduciendo} onClick={() => setReproduciendo((p) => !p)} />
          <BotonHerramienta icono="fa-eye" titulo={mostrarHip ? "Ocultar la línea de visión" : "Ver la línea de visión"} activo={mostrarHip} onClick={() => setMostrarHip((v) => !v)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={<MedidorAltura m={m} compacto />}
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Mide en campo: distancia y ángulo" icono="fa-ruler-combined">
                <Deslizador label="d · distancia al objeto (cinta)" icon="fa-ruler-horizontal" colr={ADY_COL}
                  valor={fmtM(m.d)} min={D_MIN} max={D_MAX} step={D_STEP} value={d}
                  onChange={setDmanual} hintL={`${D_MIN} m`} hintR={`${D_MAX} m`} />
                <Deslizador label="θ · ángulo de elevación (clinómetro)" icon="fa-angle-up" colr="#fbbf24"
                  valor={fmtDeg(m.angDeg)} min={ANG_MIN} max={ANG_MAX} step={ANG_STEP} value={angDeg}
                  onChange={setAngManual} hintL={`${ANG_MIN}°`} hintR={`${ANG_MAX}°`} />
              </Bloque>

              <Bloque titulo="La consecuencia: ¿qué tan alto es?" icono="fa-tree">
                <MedidorAltura m={m} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="altura H" value={fmtM(m.H)} col={accent} />
                  <Dato label="opuesto" value={fmtM(m.opuesto)} col={OP_COL} />
                  <Dato label="adyacente" value={fmtM(m.ady)} col={ADY_COL} />
                  <Dato label="línea de visión" value={fmtM(m.hip)} col={HYP_COL} />
                </div>
              </Bloque>

              <Bloque titulo="Objetos para medir" icono="fa-bullseye">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))", gap: 8 }}>
                  {ESCENARIOS.map((e) => {
                    const on = Math.abs(m.d - e.d) < 0.5 && Math.abs(m.angDeg - e.angDeg) < 0.5;
                    return (
                      <button key={e.label} type="button" title={e.desc} onClick={() => aplicar(e)}
                        style={{
                          cursor: "pointer", display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", borderRadius: 12,
                          fontSize: 14, fontWeight: 800, color: on ? "#fff" : T.text2, textAlign: "left",
                          border: `1px solid ${on ? accent : T.line}`, background: on ? `rgba(${color.rgba},0.2)` : T.inset,
                        }}>
                        <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                        {e.label}
                      </button>
                    );
                  })}
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
              <Bloque titulo="El cálculo, paso a paso" icono="fa-calculator">
                <PasoRow n={1} texto="Conozco la distancia y el ángulo:" valor={`d = ${fmtM(m.d)},  θ = ${fmtDeg(m.angDeg)}`} col={ADY_COL} />
                <PasoRow n={2} texto="Uso la tangente (opuesto sobre adyacente):" valor={`tan ${fmtDeg(m.angDeg)} = ${fmtNum2(m.tan)}`} col="#fbbf24" />
                <PasoRow n={3} texto="Despejo el cateto opuesto = d · tan θ:" valor={`= ${fmtM(m.opuesto)}`} col={OP_COL} />
                <PasoRow n={4} texto="Sumo la altura del observador:" valor={`H = ${fmtM(m.eye)} + ${fmtM(m.opuesto)} = ${fmtM(m.H)}`} col={accent} />
                <p style={{ margin: 0, color: T.text2 }}>
                  Línea de visión (hipotenusa) = d / cos θ = {fmtM(m.hip)}.
                </p>
              </Bloque>
              <Bloque titulo="Las tres razones: SOH-CAH-TOA" icono="fa-shapes">
                {RAZONES.map((r) => (
                  <div key={r.abrev} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 12, border: `1px solid ${r.color}33`, background: "rgba(4,10,22,0.4)" }}>
                    <div style={{ minWidth: 48, padding: "4px 6px", textAlign: "center", borderRadius: 8, fontSize: 14, fontWeight: 900, color: "#04121f", background: r.color, flexShrink: 0 }}>
                      {r.mnemo}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{r.abrev} = {r.formula}</div>
                      <div style={{ fontSize: 14, color: T.text2 }}>{r.nombre}</div>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 900, color: r.color, fontFamily: "ui-monospace, monospace" }}>{razonVal[r.abrev]}</span>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Anatomía del triángulo" icono="fa-vector-square">
                <LadoRow label="Adyacente (la distancia d)" valor={fmtM(m.ady)} col={ADY_COL} icon="fa-arrows-left-right" />
                <LadoRow label="Opuesto (altura sobre los ojos)" valor={fmtM(m.opuesto)} col={OP_COL} icon="fa-arrows-up-down" />
                <LadoRow label="Hipotenusa (línea de visión)" valor={fmtM(m.hip)} col={HYP_COL} icon="fa-eye" />
                <p style={{ margin: 0, color: T.text2 }}>
                  El cateto <strong style={{ color: OP_COL }}>opuesto</strong> está enfrente del ángulo θ; el <strong style={{ color: ADY_COL }}>adyacente</strong> está pegado a él. El ángulo recto (90°) está donde el árbol toca la horizontal.
                </p>
              </Bloque>
              <Bloque titulo="Medición indirecta" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Nadie trepó el árbol ni el edificio: solo se midió una <strong style={{ color: ADY_COL }}>distancia en el piso</strong> y un <strong style={{ color: "#fbbf24" }}>ángulo</strong> con un clinómetro. Así trabajan la topografía, la astronomía y la ingeniería para medir <strong style={{ color: "#fff" }}>lo inalcanzable</strong>: montañas, edificios, hasta la distancia a la Luna.
                </p>
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
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={TRIANGULO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Cálculo <strong>exacto</strong>: los lados y la altura salen de las razones trigonométricas del triángulo rectángulo (H = altura del observador + d·tan θ). Se toma la altura del observador/clinómetro como {fmtM(EYE_LABEL)} y el terreno horizontal. La escena escala el triángulo para encuadrarlo —su forma depende solo del ángulo θ, por triángulos semejantes—, pero los valores numéricos siempre son reales.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

const EYE_LABEL = 1.6;

/* ── Medidor: la altura H armada con los ojos + el cateto opuesto (0–60 m) ─── */
function MedidorAltura({ m, compacto = false }: { m: ReturnType<typeof calcMed>; compacto?: boolean }) {
  const ESC = 60;
  const pEye = Math.min(100, (m.eye / ESC) * 100);
  const pOp = Math.min(100 - pEye, (m.opuesto / ESC) * 100);
  return (
    <div style={{ display: "grid", gap: 4, width: compacto ? 210 : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>Altura H</span><span style={{ fontFamily: "ui-monospace, monospace", color: "#fff" }}>{fmtM(m.H)}</span>
      </div>
      <div style={{ display: "flex", height: compacto ? 10 : 14, borderRadius: 7, overflow: "hidden", background: "rgba(255,255,255,0.1)" }}>
        <div style={{ width: `${pEye}%`, background: "#cbd5e1", transition: "width 100ms linear" }} />
        <div style={{ width: `${pOp}%`, background: OP_COL, transition: "width 100ms linear" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#b7c4dc" }}>
        <span>ojos {fmtM(m.eye)}</span><span style={{ color: OP_COL }}>+ d·tan θ = {fmtM(m.opuesto)}</span>
      </div>
    </div>
  );
}

/* ── Fila de un paso del cálculo ─────────────────────────────────────────── */
function PasoRow({ n, texto, valor, col }: { n: number; texto: string; valor: string; col: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}30` }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: col, flexShrink: 0 }}>{n}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.35 }}>{texto}</div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", marginTop: 2 }}>{valor}</div>
      </div>
    </div>
  );
}

/* ── Fila de un lado del triángulo ───────────────────────────────────────── */
function LadoRow({ label, valor, col, icon }: { label: string; valor: string; col: string; icon: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${col}33` }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: col, background: `${col}1e`, flexShrink: 0 }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
    </div>
  );
}
