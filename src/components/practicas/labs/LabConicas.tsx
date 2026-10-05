"use client";

/**
 * Laboratorio 3D — Cónicas: circunferencia y parábola como lugares geométricos.
 * Práctica experimental para PM-IV-P07-A1 (infografía; progresión 7).
 *
 * El alumno explora, sobre un plano cartesiano flotante, las dos cónicas básicas
 * DEFINIDAS como lugares geométricos:
 *   · CIRCUNFERENCIA: ajusta centro (h, k) y radio r; un punto P recorre la curva
 *     con su radio (= r) y un punto de prueba Q se clasifica dentro / sobre / fuera.
 *   · PARÁBOLA: ajusta p; ve el foco (0, p), la directriz y = −p y un punto P cuya
 *     distancia al foco SIEMPRE es igual a su distancia a la directriz. Opcional:
 *     la propiedad focal (rayos paralelos al eje que convergen en el foco).
 * Todos los valores son exactos.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { CONICAS_FICHA } from "./conicas-lugares-geometricos-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./conicas-lugares-geometricos-data";
import { LabSfx } from "./lab-audio";
import {
  type Modo,
  calcCirc, calcParab, distanciasParab,
  ESCENARIOS_CIRC, ESCENARIOS_PARAB, IDEAS, DATOS,
  H_MIN, H_MAX, K_MIN, K_MAX, R_MIN, R_MAX, C_STEP, H_DEF, K_DEF, R_DEF, QX_DEF, QY_DEF,
  P_MIN, P_MAX, P_STEP, P_DEF, PARAB_HALF,
  fmtNum2, fmtInt, fmtPar, ecCircunferencia, ecParabFoco, ecParabAbierta,
  type EscenarioCirc, type EscenarioParab,
} from "./conicas-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-conicas-lugares-geometricos-reto";

const ConicasScene = dynamic(() => import("./ConicasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bezier-curve fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Trazando las cónicas…</span>
    </div>
  ),
});

const CENTRO_COL = "#f5d36b";
const RADIO_COL = "#34D399";
const FOCO_COL = "#f5d36b";
const DIR_COL = "#fb7185";
const VERT_COL = "#60a5fa";
const DFOCO_COL = "#34D399";
const DDIR_COL = "#c4b5fd";

export function LabConicas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("circunferencia");
  // circunferencia
  const [h, setH] = useState(H_DEF);
  const [k, setK] = useState(K_DEF);
  const [r, setR] = useState(R_DEF);
  const [qx, setQx] = useState(QX_DEF);
  const [qy, setQy] = useState(QY_DEF);
  // parábola
  const [p, setP] = useState(P_DEF);
  const [mostrarFocal, setMostrarFocal] = useState(true);
  // común
  const [fase, setFase] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  // tratamiento A+B+C
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

  // animación del punto móvil P (recorre la cónica): fase 0..1 cíclica
  useEffect(() => {
    if (!reproduciendo) return;
    const id = setInterval(() => {
      setFase((f) => (f + 0.008) % 1);
    }, 40);
    return () => clearInterval(id);
  }, [reproduciendo]);

  const c = useMemo(() => calcCirc(h, k, r, qx, qy), [h, k, r, qx, qy]);
  const par = useMemo(() => calcParab(p), [p]);
  // medio-ancho efectivo (mismo cálculo que la escena) y punto P de la parábola
  const halfEff = Math.min(PARAB_HALF, Math.sqrt(4 * p * 7.4));
  const tP = halfEff * Math.sin(fase * Math.PI * 2);
  const dParab = distanciasParab(tP, p);

  const bump = () => setResetNonce((n) => n + 1);
  const cambiarModo = (m: Modo) => { setModo(m); setFase(0); bump(); if (sonido) audioRef.current?.blip(); };
  const aplicarCirc = (e: EscenarioCirc) => { setH(e.h); setK(e.k); setR(e.r); bump(); };
  const aplicarParab = (e: EscenarioParab) => { setP(e.p); bump(); };
  const reset = () => {
    if (modo === "circunferencia") { setH(H_DEF); setK(K_DEF); setR(R_DEF); setQx(QX_DEF); setQy(QY_DEF); }
    else { setP(P_DEF); }
    setFase(0); bump();
  };

  const esCirc = modo === "circunferencia";
  const liveEq = esCirc ? ecCircunferencia(h, k, r) : ecParabFoco(p);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-bezier-curve" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Cónicas como lugares geométricos</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: {esCirc
          ? <>la circunferencia <strong>{ecCircunferencia(h, k, r)}</strong> tiene centro {fmtPar(h, k)} y radio {fmtNum2(r)}; el punto Q {fmtPar(qx, qy)} está <strong>{c.estadoQ}</strong>.</>
          : <>la parábola <strong>{ecParabFoco(p)}</strong> tiene foco {fmtPar(0, par.focoY)} y directriz y = {fmtNum2(par.directrizY)}; todo punto suyo equidista del foco y de la directriz.</>}
      </div>
    </div>
  );

  const colEstadoQ = c.estadoQ === "dentro" ? RADIO_COL : c.estadoQ === "sobre" ? "#fbbf24" : DIR_COL;
  const lectura = esCirc
    ? <>Q está <strong style={{ color: colEstadoQ }}>{c.estadoQ}</strong>: dist {fmtNum2(c.distQ)} {c.distQ < r ? "<" : c.distQ > r ? ">" : "="} r {fmtNum2(r)}</>
    : <>d(P, foco) = d(P, directriz) = {fmtNum2(dParab.aFoco)}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <>
        <style>{CSS_CON}</style>
        <SceneBoundary fallback={sceneFallback}>
          <ConicasScene
            modo={modo}
            h={h} k={k} r={r} qx={qx} qy={qy}
            p={p}
            fase={fase}
            mostrarFocal={mostrarFocal}
            accent={accent}
            autoRotate={autoRotate}
            pausado={false}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
        </>
      }
      modos={{
        opciones: [
          { id: "circunferencia", etiqueta: "Circunferencia", icono: "fa-circle-dot" },
          { id: "parabola", etiqueta: "Parábola", icono: "fa-bullseye" },
        ],
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={reproduciendo ? "fa-pause" : "fa-play"} titulo={reproduciendo ? "Pausar el punto móvil" : "Animar el punto P"} activo={reproduciendo} onClick={() => setReproduciendo((v) => !v)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        esCirc ? (
          <>
            <div style={{ color: T.text2, fontWeight: 800 }}>{liveEq}</div>
            <MedidorDist modo="circ" a={c.distQ} b={r} compacto />
          </>
        ) : (
          <>
            <div style={{ color: T.text2, fontWeight: 800 }}>{liveEq}</div>
            <MedidorDist modo="parab" a={dParab.aFoco} b={dParab.aDirectriz} compacto />
          </>
        )
      }
      lectura={lectura}
      objetivos={[
        { txt: "Deja el punto Q justo SOBRE la curva: su distancia al centro debe ser igual a r", done: esCirc && c.estadoQ === "sobre" },
        { txt: "Mueve el centro (h, k) de la circunferencia y mira cómo cambia su ecuación", done: h !== H_DEF || k !== K_DEF },
        { txt: "Cambia el radio y comprueba que todos los puntos siguen equidistando del centro", done: r !== R_DEF },
        { txt: "Pasa a la parábola y localiza su foco y su directriz", done: modo === "parabola" },
        { txt: "Cambia p y comprueba que d(P, foco) y d(P, directriz) siempre son iguales", done: modo === "parabola" && p !== P_DEF },
        { txt: "Mueve el punto Q sobre la curva y compara sus dos distancias", done: qx !== QX_DEF || qy !== QY_DEF },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo={esCirc ? "Ajusta la circunferencia y el punto de prueba" : "Ajusta la parábola"} icono="fa-sliders">
                {esCirc ? (
                  <>
                    <Deslizador label="Centro h" icon="fa-arrows-left-right" colr={CENTRO_COL}
                      valor={fmtInt(h)} min={H_MIN} max={H_MAX} step={C_STEP} value={h} onChange={setH} hintL={`${H_MIN}`} hintR={`${H_MAX}`} />
                    <Deslizador label="Centro k" icon="fa-arrows-up-down" colr={CENTRO_COL}
                      valor={fmtInt(k)} min={K_MIN} max={K_MAX} step={C_STEP} value={k} onChange={setK} hintL={`${K_MIN}`} hintR={`${K_MAX}`} />
                    <Deslizador label="Radio r" icon="fa-ruler" colr={RADIO_COL}
                      valor={fmtInt(r)} min={R_MIN} max={R_MAX} step={C_STEP} value={r} onChange={setR} hintL={`${R_MIN}`} hintR={`${R_MAX}`} />
                    <Deslizador label="Punto Q · x" icon="fa-arrows-left-right" colr="#fbbf24"
                      valor={fmtInt(qx)} min={H_MIN} max={H_MAX} step={C_STEP} value={qx} onChange={setQx} hintL={`${H_MIN}`} hintR={`${H_MAX}`} />
                    <Deslizador label="Punto Q · y" icon="fa-arrows-up-down" colr="#fbbf24"
                      valor={fmtInt(qy)} min={K_MIN} max={K_MAX} step={C_STEP} value={qy} onChange={setQy} hintL={`${K_MIN}`} hintR={`${K_MAX}`} />
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>Ejemplos</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {ESCENARIOS_CIRC.map((e) => (
                        <button key={e.label} className="ex-chip" title={e.desc}
                          data-on={h === e.h && k === e.k && r === e.r}
                          onClick={() => aplicarCirc(e)} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <i className={`fa-solid ${e.icono}`} style={{ color: accent }} /> {e.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <Deslizador label="Parámetro p (vértice → foco)" icon="fa-up-down" colr={FOCO_COL}
                      valor={fmtNum2(p)} min={P_MIN} max={P_MAX} step={P_STEP} value={p} onChange={setP} hintL={`${P_MIN}`} hintR={`${P_MAX}`} />
                    <button className="ex-tog" onClick={() => setMostrarFocal((v) => !v)} style={{ borderColor: mostrarFocal ? "#7dd3fc88" : T.line, background: mostrarFocal ? "#7dd3fc1a" : T.inset, color: mostrarFocal ? "#fff" : T.text2 }}>
                      <i className={`fa-solid ${mostrarFocal ? "fa-eye" : "fa-eye-slash"}`} style={{ color: "#7dd3fc" }} /> Propiedad focal (rayos)
                    </button>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>Ejemplos</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {ESCENARIOS_PARAB.map((e) => (
                        <button key={e.label} className="ex-chip" title={e.desc}
                          data-on={p === e.p}
                          onClick={() => aplicarParab(e)} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <i className={`fa-solid ${e.icono}`} style={{ color: accent }} /> {e.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </Bloque>

              <Bloque titulo={esCirc ? "¿Q está dentro, sobre o fuera?" : "Las dos distancias"} icono="fa-scale-balanced">
                <MedidorDist modo={esCirc ? "circ" : "parab"} a={esCirc ? c.distQ : dParab.aFoco} b={esCirc ? r : dParab.aDirectriz} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {esCirc ? (
                    <>
                      <Dato label="centro (h,k)" value={fmtPar(h, k)} col={CENTRO_COL} />
                      <Dato label="radio r" value={fmtNum2(r)} col={RADIO_COL} />
                      <Dato label="dist Q→centro" value={fmtNum2(c.distQ)} col="#fbbf24" />
                      <Dato label="Q está" value={c.estadoQ} col={colEstadoQ} />
                    </>
                  ) : (
                    <>
                      <Dato label="foco (0,p)" value={fmtPar(0, par.focoY)} col={FOCO_COL} />
                      <Dato label="directriz" value={`y=${fmtNum2(par.directrizY)}`} col={DIR_COL} />
                      <Dato label="d(P,foco)" value={fmtNum2(dParab.aFoco)} col={DFOCO_COL} />
                      <Dato label="d(P,directriz)" value={fmtNum2(dParab.aDirectriz)} col={DDIR_COL} />
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
              <Bloque titulo={esCirc ? "La circunferencia, paso a paso" : "La parábola, paso a paso"} icono={esCirc ? "fa-circle-dot" : "fa-bullseye"}>
                {esCirc ? (
                  <>
                    <PasoRow n={1} texto="Identifico centro (h, k) y radio r:" valor={`C = ${fmtPar(h, k)},  r = ${fmtNum2(r)}`} col={CENTRO_COL} />
                    <PasoRow n={2} texto="Escribo la ecuación canónica:" valor={ecCircunferencia(h, k, r)} col={accent} />
                    <PasoRow n={3} texto="Distancia del punto Q al centro:" valor={`√((${fmtInt(qx)}−${fmtInt(h)})² + (${fmtInt(qy)}−${fmtInt(k)})²) = ${fmtNum2(c.distQ)}`} col="#fbbf24" />
                    <PasoRow n={4} texto={`Comparo con r = ${fmtNum2(r)}:`} valor={`${fmtNum2(c.distQ)} ${c.distQ < r ? "<" : c.distQ > r ? ">" : "="} ${fmtNum2(r)} → ${c.estadoQ}`} col={colEstadoQ} />
                  </>
                ) : (
                  <>
                    <PasoRow n={1} texto="Identifico el parámetro p (vértice → foco):" valor={`p = ${fmtNum2(p)}`} col={FOCO_COL} />
                    <PasoRow n={2} texto="Ecuación canónica (vértice en el origen):" valor={`${ecParabFoco(p)}   ·   ${ecParabAbierta(p)}`} col={accent} />
                    <PasoRow n={3} texto="Ubico foco y directriz:" valor={`F = ${fmtPar(0, par.focoY)},  directriz y = ${fmtNum2(par.directrizY)}`} col={VERT_COL} />
                    <PasoRow n={4} texto="Compruebo la definición en P:" valor={`d(P,F) = ${fmtNum2(dParab.aFoco)} = d(P, directriz) = ${fmtNum2(dParab.aDirectriz)}`} col={DFOCO_COL} />
                  </>
                )}
              </Bloque>
              <Bloque titulo="Anatomía" icono="fa-vector-square">
                {esCirc ? (
                  <>
                    <LadoRow label="Centro (h, k)" valor={fmtPar(h, k)} col={CENTRO_COL} icon="fa-crosshairs" />
                    <LadoRow label="Radio r" valor={fmtNum2(r)} col={RADIO_COL} icon="fa-ruler" />
                    <LadoRow label="Perímetro 2πr" valor={fmtNum2(c.perimetro)} col="#fbbf24" icon="fa-circle-notch" />
                    <LadoRow label="Área πr²" valor={fmtNum2(c.area)} col="#c4b5fd" icon="fa-circle" />
                  </>
                ) : (
                  <>
                    <LadoRow label="Vértice" valor="(0, 0)" col={VERT_COL} icon="fa-location-dot" />
                    <LadoRow label="Foco (0, p)" valor={fmtPar(0, par.focoY)} col={FOCO_COL} icon="fa-bullseye" />
                    <LadoRow label="Directriz" valor={`y = ${fmtNum2(par.directrizY)}`} col={DIR_COL} icon="fa-ruler-horizontal" />
                    <LadoRow label="Coeficiente a = 1/4p" valor={ecParabAbierta(p).replace("y = ", "").replace(" x²", "")} col="#c4b5fd" icon="fa-superscript" />
                  </>
                )}
                <p style={{ margin: 0, color: T.text2 }}>
                  {esCirc
                    ? <>La circunferencia es el <strong style={{ color: RADIO_COL }}>lugar geométrico</strong> de los puntos que están a la <strong>misma distancia</strong> (el radio) de un centro fijo.</>
                    : <>La parábola es el <strong style={{ color: DFOCO_COL }}>lugar geométrico</strong> de los puntos que <strong>equidistan</strong> del foco y de la directriz. Esa igualdad <em>es</em> la definición.</>}
                </p>
              </Bloque>
              <Bloque titulo={esCirc ? "Por qué importa" : "Propiedad focal"} icono="fa-satellite-dish">
                <p style={{ margin: 0, color: T.text2 }}>
                  {esCirc
                    ? <>La circunferencia aparece en ruedas, rotondas, fuentes y plazas circulares. Saber su centro y radio permite ubicar un punto de interés <strong>dentro, sobre o fuera</strong> de ella — base de mapas y diseño urbano.</>
                    : <>Todo rayo paralelo al eje se refleja exactamente hacia el <strong style={{ color: FOCO_COL }}>foco</strong>. Por eso el <strong>GTM del INAOE</strong> (reflector parabólico de 50 m) y las antenas satelitales domésticas concentran la señal en el receptor, colocado justo en el foco.</>}
                </p>
              </Bloque>
              <Bloque titulo="Datos" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 10 }}>
                  {DATOS.map((dd, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                      <i className={`fa-solid ${dd.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                      <div>
                        <div style={{ fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{dd.valor}</div>
                        <div style={{ color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
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
                <FichaTeorica data={CONICAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                Cálculo <strong>exacto</strong>: la circunferencia es (x−h)²+(y−k)²=r² y la clasificación de Q sale de comparar su distancia al centro con r; la parábola es x²=4py con foco (0, p) y directriz y=−p, y la igualdad d(P,foco)=d(P,directriz) se cumple para cada punto. El plano se dibuja a <strong>escala fija</strong>, así que las posiciones son reales; los <strong>valores numéricos</strong> de las etiquetas y lecturas son los exactos.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor: dos distancias frente a frente ─────────────────────────────── */
function MedidorDist({ modo, a, b, compacto = false }: { modo: "circ" | "parab"; a: number; b: number; compacto?: boolean }) {
  const tope = Math.max(a, b, 1) * 1.1;
  const igual = Math.abs(a - b) < 0.005;
  const rotA = modo === "circ" ? "dist Q → centro" : "d(P, foco)";
  const rotB = modo === "circ" ? "radio r" : "d(P, directriz)";
  const colA = modo === "circ" ? "#fbbf24" : DFOCO_COL;
  const colB = modo === "circ" ? RADIO_COL : DDIR_COL;
  const estado = modo === "circ"
    ? (igual ? "Q está SOBRE la curva" : a < b ? "Q está DENTRO" : "Q está FUERA")
    : "Siempre iguales: es la definición";
  const colEst = modo === "circ" ? (igual ? "#fbbf24" : a < b ? RADIO_COL : DIR_COL) : "#34D399";
  const barra = (txt: string, val: number, c: string) => (
    <div style={{ display: "grid", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>{txt}</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtNum2(val)}</span>
      </div>
      <div style={{ height: compacto ? 8 : 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, (val / tope) * 100)}%`, height: "100%", background: c, transition: "width 120ms linear" }} />
      </div>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: compacto ? 6 : 10, width: compacto ? 190 : undefined, marginTop: compacto ? 4 : 0 }}>
      {barra(rotA, a, colA)}
      {barra(rotB, b, colB)}
      <div style={{ fontSize: 14, fontWeight: 900, color: colEst }}>{estado}</div>
    </div>
  );
}

const CSS_CON = `
  .ex-chip { cursor:pointer; padding:9px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
    color:${T.text2}; font-size:14px; font-weight:800; transition:all .15s; text-align:left; }
  .ex-chip:hover { border-color:rgba(255,255,255,0.4); color:#fff; }
  .ex-chip[data-on="true"] { border-color:var(--lsa); background:rgba(255,255,255,0.1); color:#fff; }
  .ex-tog { cursor:pointer; display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:11px;
    border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .15s; }
`;

/* ── Fila de un paso del cálculo ─────────────────────────────────────────── */
function PasoRow({ n, texto, valor, col }: { n: number; texto: string; valor: string; col: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}30` }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: col, flexShrink: 0 }}>{n}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.35 }}>{texto}</div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", marginTop: 2 }}>{valor}</div>
      </div>
    </div>
  );
}

/* ── Fila de un dato de la anatomía ──────────────────────────────────────── */
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
