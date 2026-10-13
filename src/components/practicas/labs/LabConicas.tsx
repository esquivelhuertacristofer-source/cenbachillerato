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
 *
 * Versión «sala de museo» (2026-10): se suman el CONO DE APOLONIO (un plano que
 * se inclina y se desplaza corta un cono de doble napa y la cónica cambia en
 * vivo), los lugares geométricos de la ELIPSE (método del jardinero) y la
 * HIPÉRBOLA, y tres APLICACIONES (antena parabólica, órbita de Kepler, galería
 * de los susurros). El cálculo nuevo vive en conicas-museo-data.ts.
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
import { CREDITO_ESPACIO } from "./_espacio";
import {
  type ModoConicas, type VistaAplicacion, type TipoCorte,
  corteCono, ecuacionCorte, NOMBRE_CORTE, COLOR_CORTE, POR_QUE_CORTE, ANG_GENERATRIZ, ALFA_DEG,
  TH_MIN, TH_MAX, TH_STEP, TH_DEF, DC_MIN, DC_MAX, DC_STEP, DC_DEF,
  calcElipse, puntoElipse, distFocos, ecElipse, AE_MIN, AE_MAX, AE_STEP, AE_DEF, CE_MIN, CE_STEP, CE_DEF,
  calcHiperbola, puntoHiperbola, ecHiperbola, AH_MIN, AH_MAX, AH_STEP, AH_DEF, CH_MAX, CH_STEP, CH_DEF,
  senalAntena, FA_MIN, FA_MAX, FA_STEP, FA_DEF, HR_MIN, HR_MAX, HR_STEP, HR_DEF,
  posicionOrbita, ORBITAS, EO_MIN, EO_MAX, EO_STEP, EO_DEF, A_ORBITA,
  senalGaleria, A_GALERIA, CG_MIN, CG_MAX, CG_STEP, CG_DEF, XL_MIN, XL_MAX, XL_STEP, XL_DEF,
  IDEAS_MUSEO, DATOS_MUSEO, f1, f2, f0,
} from "./conicas-museo-data";
import {
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
      <span style={{ fontSize: 14, fontWeight: 600 }}>Montando la sala de las cónicas…</span>
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

const MODOS: { id: ModoConicas; etiqueta: string; icono: string }[] = [
  { id: "cono", etiqueta: "Cono de Apolonio", icono: "fa-hourglass-half" },
  { id: "circunferencia", etiqueta: "Circunferencia", icono: "fa-circle-dot" },
  { id: "elipse", etiqueta: "Elipse", icono: "fa-circle-nodes" },
  { id: "parabola", etiqueta: "Parábola", icono: "fa-bullseye" },
  { id: "hiperbola", etiqueta: "Hipérbola", icono: "fa-bezier-curve" },
  { id: "aplicaciones", etiqueta: "Aplicaciones", icono: "fa-satellite-dish" },
];

const VISTAS: { id: VistaAplicacion; etiqueta: string; icono: string }[] = [
  { id: "antena", etiqueta: "Antena", icono: "fa-satellite-dish" },
  { id: "orbita", etiqueta: "Órbita", icono: "fa-sun" },
  { id: "galeria", etiqueta: "Susurros", icono: "fa-ear-listen" },
];

/** Ejemplos del cono: cada uno deja el plano en la inclinación que da esa curva. */
const CORTES: { label: string; theta: number; d: number; tipo: TipoCorte }[] = [
  { label: "Circunferencia", theta: 0, d: 2, tipo: "circunferencia" },
  { label: "Elipse", theta: 32, d: 2, tipo: "elipse" },
  { label: "Parábola", theta: ANG_GENERATRIZ, d: 1.6, tipo: "parabola" },
  { label: "Hipérbola", theta: 72, d: 1.4, tipo: "hiperbola" },
  { label: "Punto", theta: 30, d: 0, tipo: "punto" },
  { label: "Recta", theta: ANG_GENERATRIZ, d: 0, tipo: "recta" },
  { label: "Par de rectas", theta: 75, d: 0, tipo: "rectas" },
];

export function LabConicas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<ModoConicas>("cono");
  // cono de Apolonio
  const [theta, setTheta] = useState(TH_DEF);
  const [dCorte, setDCorte] = useState(DC_DEF);
  // elipse (jardinero) e hipérbola
  const [aE, setAE] = useState(AE_DEF);
  const [cE, setCE] = useState(CE_DEF);
  const [aH, setAH] = useState(AH_DEF);
  const [cH, setCH] = useState(CH_DEF);
  // aplicaciones
  const [vista, setVista] = useState<VistaAplicacion>("antena");
  const [fAntena, setFAntena] = useState(FA_DEF);
  const [hReceptor, setHReceptor] = useState(HR_DEF);
  const [eOrbita, setEOrbita] = useState(EO_DEF);
  const [cGaleria, setCGaleria] = useState(CG_DEF);
  const [xOyente, setXOyente] = useState(XL_DEF);
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

  // sala del museo
  const corte = useMemo(() => corteCono(theta, dCorte), [theta, dCorte]);
  const elipse = useMemo(() => calcElipse(aE, cE), [aE, cE]);
  const hiperbola = useMemo(() => calcHiperbola(aH, cH), [aH, cH]);
  const senalA = senalAntena(fAntena, hReceptor);
  const senalG = senalGaleria(A_GALERIA, cGaleria, xOyente);
  const PE = puntoElipse(elipse, fase);
  const dE = distFocos(PE, elipse.c);
  const PH = puntoHiperbola(hiperbola, fase);
  const dH = distFocos(PH, hiperbola.c);
  const orb = posicionOrbita(fase, eOrbita);

  // un clic cuando el corte cambia de familia de curva
  const tipoPrevio = useRef(corte.tipo);
  useEffect(() => {
    if (tipoPrevio.current !== corte.tipo) {
      tipoPrevio.current = corte.tipo;
      if (sonido) audioRef.current?.blip();
    }
  }, [corte.tipo, sonido]);

  const bump = () => setResetNonce((n) => n + 1);
  const cambiarModo = (m: ModoConicas) => { setModo(m); setFase(0); bump(); if (sonido) audioRef.current?.blip(); };
  const cambiarVista = (v: VistaAplicacion) => { setVista(v); setFase(0); if (sonido) audioRef.current?.blip(); };
  const cambiarAE = (v: number) => { setAE(v); setCE((c) => Math.min(c, v - 0.5)); };
  const cambiarAH = (v: number) => { setAH(v); setCH((c) => Math.max(c, v + 0.5)); };
  const aplicarCirc = (e: EscenarioCirc) => { setH(e.h); setK(e.k); setR(e.r); bump(); };
  const aplicarParab = (e: EscenarioParab) => { setP(e.p); bump(); };
  const reset = () => {
    if (modo === "circunferencia") { setH(H_DEF); setK(K_DEF); setR(R_DEF); setQx(QX_DEF); setQy(QY_DEF); }
    else if (modo === "parabola") { setP(P_DEF); }
    else if (modo === "cono") { setTheta(TH_DEF); setDCorte(DC_DEF); }
    else if (modo === "elipse") { setAE(AE_DEF); setCE(CE_DEF); }
    else if (modo === "hiperbola") { setAH(AH_DEF); setCH(CH_DEF); }
    else { setFAntena(FA_DEF); setHReceptor(HR_DEF); setEOrbita(EO_DEF); setCGaleria(CG_DEF); setXOyente(XL_DEF); }
    setFase(0); bump();
  };

  const esCirc = modo === "circunferencia";
  const liveEq = esCirc ? ecCircunferencia(h, k, r) : ecParabFoco(p);
  // La teoría paso a paso de la circunferencia y la parábola: la de la parábola en su modo, la otra en los demás.
  const teoCirc = modo !== "parabola";
  const colCorte = COLOR_CORTE[corte.tipo];
  const relCorte = corte.theta < ANG_GENERATRIZ ? "<" : corte.theta > ANG_GENERATRIZ ? ">" : "=";

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-bezier-curve" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Cónicas como lugares geométricos</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: {modo === "cono"
          ? <>el plano inclinado {Math.round(theta)}° corta el cono en una <strong>{NOMBRE_CORTE[corte.tipo].toLowerCase()}</strong>: {ecuacionCorte(corte)}.</>
          : modo === "elipse" ? <>en la elipse <strong>{ecElipse(elipse)}</strong> la suma de distancias a los focos vale siempre 2a = {f2(2 * elipse.a)}.</>
          : modo === "hiperbola" ? <>en la hipérbola <strong>{ecHiperbola(hiperbola)}</strong> la diferencia de distancias a los focos vale siempre 2a = {f2(2 * hiperbola.a)}.</>
          : modo === "aplicaciones" ? <>los rayos paralelos al eje de una antena parabólica se reflejan al foco; un planeta recorre una elipse con el Sol en un foco.</>
          : esCirc
          ? <>la circunferencia <strong>{ecCircunferencia(h, k, r)}</strong> tiene centro {fmtPar(h, k)} y radio {fmtNum2(r)}; el punto Q {fmtPar(qx, qy)} está <strong>{c.estadoQ}</strong>.</>
          : <>la parábola <strong>{ecParabFoco(p)}</strong> tiene foco {fmtPar(0, par.focoY)} y directriz y = {fmtNum2(par.directrizY)}; todo punto suyo equidista del foco y de la directriz.</>}
      </div>
    </div>
  );

  const colEstadoQ = c.estadoQ === "dentro" ? RADIO_COL : c.estadoQ === "sobre" ? "#fbbf24" : DIR_COL;
  const lectura = modo === "cono"
    ? <><strong style={{ color: colCorte }}>{NOMBRE_CORTE[corte.tipo]}</strong>: plano {Math.round(theta)}° {relCorte} {ANG_GENERATRIZ}° de la generatriz</>
    : modo === "elipse" ? <>d₁ + d₂ = {f2(dE.d1 + dE.d2)} = 2a, en todo punto</>
    : modo === "hiperbola" ? <>|d₁ − d₂| = {f2(Math.abs(dH.d1 - dH.d2))} = 2a, en todo punto</>
    : modo === "aplicaciones"
      ? (vista === "antena" ? <>El receptor capta el {f0(senalA * 100)} % de los rayos</>
        : vista === "orbita" ? <>Rapidez del planeta: ×{f2(orb.vRel)} la de una órbita circular</>
        : <>Al que escucha le llega el {f0(senalG * 100)} % del susurro</>)
    : esCirc
    ? <>Q está <strong style={{ color: colEstadoQ }}>{c.estadoQ}</strong>: dist {fmtNum2(c.distQ)} {c.distQ < r ? "<" : c.distQ > r ? ">" : "="} r {fmtNum2(r)}</>
    : <>d(P, foco) = d(P, directriz) = {fmtNum2(dParab.aFoco)}</>;

  /* ── Controles de los modos de la sala (cono, elipse, hipérbola, aplicaciones) ── */
  const rejilla = (hijos: React.ReactNode) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>{hijos}</div>
  );

  let controlesSala: React.ReactNode = null;
  if (modo === "cono") {
    controlesSala = (
      <>
        <Bloque titulo="Mueve el plano de corte" icono="fa-sliders">
          <Deslizador label="Inclinación del plano θ" icon="fa-angle-up" colr={colCorte}
            valor={`${Math.round(theta)}°`} min={TH_MIN} max={TH_MAX} step={TH_STEP} value={theta} onChange={setTheta} hintL="0° (horizontal)" hintR={`${TH_MAX}°`} />
          <Deslizador label="Altura del plano sobre el vértice d" icon="fa-arrows-up-down" colr="#a8dcff"
            valor={f1(dCorte)} min={DC_MIN} max={DC_MAX} step={DC_STEP} value={dCorte} onChange={(v) => setDCorte(Math.round(v * 10) / 10)} hintL={`${DC_MIN}`} hintR={`${DC_MAX}`} />
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>Ejemplos</div>
          <Chips accent={accent} items={CORTES} activo={(x) => corte.tipo === x.tipo && Math.round(theta) === x.theta && Math.abs(dCorte - x.d) < 1e-6} etiqueta={(x) => x.label} icono={(x) => (x.d === 0 ? "fa-circle-dot" : x.tipo === "hiperbola" ? "fa-bezier-curve" : x.tipo === "parabola" ? "fa-bullseye" : "fa-circle")} al={(x) => { setTheta(x.theta); setDCorte(x.d); }} />
        </Bloque>
        <Bloque titulo={`Salió: ${NOMBRE_CORTE[corte.tipo]}`} icono="fa-lightbulb">
          <MedidorCorte theta={theta} color={colCorte} grande />
          <p style={{ margin: 0, color: T.text2, lineHeight: 1.5 }}>{POR_QUE_CORTE[corte.tipo]}</p>
          {rejilla(<>
            <Dato label="inclinación θ" value={`${Math.round(theta)}°`} col={colCorte} />
            <Dato label="generatriz" value={`${ANG_GENERATRIZ}°`} col="#f8d48a" />
            <Dato label="excentricidad e" value={corte.d === 0 ? "—" : f2(corte.e)} col="#a8dcff" />
            {corte.tipo === "parabola"
              ? <Dato label="parámetro p" value={f2(corte.p)} col={colCorte} />
              : corte.tipo === "circunferencia" ? <Dato label="radio r" value={f2(corte.a)} col={colCorte} />
              : corte.tipo === "elipse" || corte.tipo === "hiperbola" ? <Dato label="semiejes a · b" value={`${f2(corte.a)} · ${f2(corte.b)}`} col={colCorte} />
              : <Dato label="plano por el vértice" value="d = 0" col={colCorte} />}
          </>)}
        </Bloque>
      </>
    );
  } else if (modo === "elipse") {
    controlesSala = (
      <>
        <Bloque titulo="El hilo del jardinero" icono="fa-sliders">
          <Deslizador label="Semieje mayor a (hilo = 2a)" icon="fa-arrows-left-right" colr="#fbbf24"
            valor={f1(aE)} min={AE_MIN} max={AE_MAX} step={AE_STEP} value={aE} onChange={cambiarAE} hintL={`${AE_MIN}`} hintR={`${AE_MAX}`} />
          <Deslizador label="Distancia del centro a cada clavo c" icon="fa-thumbtack" colr={FOCO_COL}
            valor={f1(elipse.c)} min={CE_MIN} max={aE - 0.5} step={CE_STEP} value={elipse.c} onChange={setCE} hintL="0 (juntos)" hintR={f1(aE - 0.5)} />
          <p style={{ margin: 0, color: T.text2, lineHeight: 1.5 }}>
            {elipse.c === 0
              ? <>Con los dos clavos juntos el hilo siempre mide lo mismo desde el centro: sale una <strong>circunferencia</strong>.</>
              : <>El lápiz mantiene el hilo tenso: sus dos tramos cambian, pero <strong>juntos</strong> siempre miden 2a = {f2(2 * elipse.a)}.</>}
          </p>
        </Bloque>
        <Bloque titulo="La suma no cambia" icono="fa-scale-balanced">
          <MedidorSuma d1={dE.d1} d2={dE.d2} total={2 * elipse.a} modo="suma" grande />
          {rejilla(<>
            <Dato label="d₁ (al clavo izq.)" value={f2(dE.d1)} col={DFOCO_COL} />
            <Dato label="d₂ (al clavo der.)" value={f2(dE.d2)} col={DDIR_COL} />
            <Dato label="semieje menor b" value={f2(elipse.b)} col="#a8dcff" />
            <Dato label="excentricidad e" value={f2(elipse.e)} col="#fbbf24" />
          </>)}
        </Bloque>
      </>
    );
  } else if (modo === "hiperbola") {
    controlesSala = (
      <>
        <Bloque titulo="Ajusta la hipérbola" icono="fa-sliders">
          <Deslizador label="Semieje transverso a" icon="fa-arrows-left-right" colr="#f472b6"
            valor={f1(aH)} min={AH_MIN} max={AH_MAX} step={AH_STEP} value={aH} onChange={cambiarAH} hintL={`${AH_MIN}`} hintR={`${AH_MAX}`} />
          <Deslizador label="Distancia del centro a cada foco c" icon="fa-thumbtack" colr={FOCO_COL}
            valor={f1(hiperbola.c)} min={aH + 0.5} max={CH_MAX} step={CH_STEP} value={hiperbola.c} onChange={setCH} hintL={f1(aH + 0.5)} hintR={`${CH_MAX}`} />
          <p style={{ margin: 0, color: T.text2, lineHeight: 1.5 }}>
            P recorre las <strong>dos ramas</strong>. En la derecha d₁ es mayor; en la izquierda, d₂. La diferencia, sin signo, siempre es 2a = {f2(2 * hiperbola.a)}.
          </p>
        </Bloque>
        <Bloque titulo="La diferencia no cambia" icono="fa-scale-balanced">
          <MedidorSuma d1={dH.d1} d2={dH.d2} total={2 * hiperbola.a} modo="resta" grande />
          {rejilla(<>
            <Dato label="d₁" value={f2(dH.d1)} col={DFOCO_COL} />
            <Dato label="d₂" value={f2(dH.d2)} col={DDIR_COL} />
            <Dato label="b = √(c² − a²)" value={f2(hiperbola.b)} col="#a8dcff" />
            <Dato label="asíntotas" value={`y = ±${f2(hiperbola.b / hiperbola.a)}x`} col="#f472b6" />
          </>)}
        </Bloque>
      </>
    );
  } else if (modo === "aplicaciones") {
    const peri = A_ORBITA * (1 - eOrbita), afe = A_ORBITA * (1 + eOrbita);
    controlesSala = (
      <>
        <Bloque titulo="Elige la aplicación" icono="fa-satellite-dish">
          <Chips accent={accent} items={VISTAS} activo={(x) => vista === x.id} etiqueta={(x) => x.etiqueta} icono={(x) => x.icono} al={(x) => cambiarVista(x.id)} />
        </Bloque>
        {vista === "antena" && (
          <Bloque titulo="Antena parabólica" icono="fa-sliders">
            <Deslizador label="Distancia focal f del plato" icon="fa-bullseye" colr={FOCO_COL}
              valor={f1(fAntena)} min={FA_MIN} max={FA_MAX} step={FA_STEP} value={fAntena} onChange={(v) => setFAntena(Math.round(v * 10) / 10)} hintL={`${FA_MIN}`} hintR={`${FA_MAX}`} />
            <Deslizador label="Altura del receptor" icon="fa-tower-broadcast" colr="#34D399"
              valor={f1(hReceptor)} min={HR_MIN} max={HR_MAX} step={HR_STEP} value={hReceptor} onChange={(v) => setHReceptor(Math.round(v * 10) / 10)} hintL={`${HR_MIN}`} hintR={`${HR_MAX}`} />
            <MedidorSenal valor={senalA} rotulo="señal en el receptor" />
            <p style={{ margin: 0, color: T.text2, lineHeight: 1.5 }}>
              {senalA >= 1
                ? <>¡En el foco! Todos los rayos reflejados pasan por ahí, y llegan <strong>a la vez</strong>: cada camino mide lo mismo.</>
                : <>Los rayos rebotan y se cruzan en el foco, a {f1(fAntena)} del fondo del plato. El receptor está a {f1(hReceptor)}: {hReceptor > fAntena ? "bájalo" : "súbelo"}.</>}
            </p>
            <p style={{ margin: 0, color: T.text3, lineHeight: 1.5 }}>
              Así trabaja el Gran Telescopio Milimétrico (GTM) del INAOE en el volcán Sierra Negra, Puebla: un reflector parabólico de 50 m que concentra en su foco las ondas que llegan del universo.
            </p>
          </Bloque>
        )}
        {vista === "orbita" && (
          <Bloque titulo="Órbita de Kepler" icono="fa-sliders">
            <Deslizador label="Excentricidad e de la órbita" icon="fa-circle-half-stroke" colr="#a8dcff"
              valor={f2(eOrbita)} min={EO_MIN} max={EO_MAX} step={EO_STEP} value={eOrbita} onChange={setEOrbita} hintL="0 (circular)" hintR={`${EO_MAX}`} />
            <Chips accent={accent} items={ORBITAS} activo={(x) => Math.abs(eOrbita - x.e) < 0.005} etiqueta={(x) => x.label} icono={(x) => x.icono} al={(x) => setEOrbita(x.e)} titulo={(x) => x.desc} />
            {rejilla(<>
              <Dato label="perihelio a(1−e)" value={f2(peri)} col="#fbbf24" />
              <Dato label="afelio a(1+e)" value={f2(afe)} col="#c4b5fd" />
              <Dato label="r₁ + r₂" value={f2(orb.r + orb.r2)} col={DFOCO_COL} />
              <Dato label="rapidez relativa" value={`×${f2(orb.vRel)}`} col="#7dd3fc" />
            </>)}
            <p style={{ margin: 0, color: T.text2, lineHeight: 1.5 }}>
              El Sol está en un foco; el otro queda vacío. La estela marca posiciones a tiempos iguales: se separa donde el planeta va rápido (cerca del Sol).
            </p>
          </Bloque>
        )}
        {vista === "galeria" && (
          <Bloque titulo="Galería de los susurros" icono="fa-sliders">
            <Deslizador label="Distancia del centro a cada foco c (m)" icon="fa-thumbtack" colr={FOCO_COL}
              valor={f1(cGaleria)} min={CG_MIN} max={CG_MAX} step={CG_STEP} value={cGaleria} onChange={setCGaleria} hintL={`${CG_MIN}`} hintR={`${CG_MAX}`} />
            <Deslizador label="Dónde se para quien escucha (m)" icon="fa-person" colr="#34D399"
              valor={f1(xOyente)} min={XL_MIN} max={XL_MAX} step={XL_STEP} value={xOyente} onChange={setXOyente} hintL={`${XL_MIN}`} hintR={`${XL_MAX}`} />
            <MedidorSenal valor={senalG} rotulo="susurro que llega" />
            <p style={{ margin: 0, color: T.text2, lineHeight: 1.5 }}>
              {senalG >= 1
                ? <>Está en el otro foco: todo lo que rebota en la pared llega ahí, al mismo tiempo, porque cada camino mide 2a = {f0(2 * A_GALERIA)} m.</>
                : <>El sonido rebota y se junta en el otro foco, a {f1(cGaleria)} m del centro. Quien escucha está en {f1(xOyente)} m.</>}
            </p>
          </Bloque>
        )}
      </>
    );
  }

  /* ── Teoría paso a paso del modo de la sala ── */
  let teoriaSala: React.ReactNode = null;
  if (modo === "cono") {
    teoriaSala = (
      <Bloque titulo="El corte del cono, paso a paso" icono="fa-hourglass-half">
        <PasoRow n={1} texto="Semiángulo del cono y su generatriz:" valor={`α = ${ALFA_DEG}°  →  generatriz a ${ANG_GENERATRIZ}° de la horizontal`} col="#f8d48a" />
        <PasoRow n={2} texto="Comparo la inclinación del plano:" valor={`θ = ${Math.round(theta)}° ${relCorte} ${ANG_GENERATRIZ}°  →  ${NOMBRE_CORTE[corte.tipo].toLowerCase()}`} col={colCorte} />
        <PasoRow n={3} texto="Coeficiente que decide (A = cos²θ − tan²α·sen²θ):" valor={`A = ${f2(corte.A)} ${corte.A > 1e-9 ? "> 0" : corte.A < -1e-9 ? "< 0" : "= 0"}`} col="#a8dcff" />
        <PasoRow n={4} texto="Excentricidad e = sen θ / cos α:" valor={corte.d === 0 ? "plano por el vértice: degenerada" : `e = ${f2(corte.e)}`} col="#c4b5fd" />
        <PasoRow n={5} texto="Ecuación en el plano de corte:" valor={ecuacionCorte(corte)} col={accent} />
      </Bloque>
    );
  } else if (modo === "elipse") {
    teoriaSala = (
      <Bloque titulo="La elipse, paso a paso" icono="fa-circle-nodes">
        <PasoRow n={1} texto="Largo del hilo (la constante):" valor={`2a = ${f2(2 * elipse.a)}`} col="#fbbf24" />
        <PasoRow n={2} texto="Focos en (±c, 0):" valor={`F₁ = (−${f2(elipse.c)}, 0),  F₂ = (${f2(elipse.c)}, 0)`} col={FOCO_COL} />
        <PasoRow n={3} texto="Semieje menor b = √(a² − c²):" valor={`b = ${f2(elipse.b)}`} col="#a8dcff" />
        <PasoRow n={4} texto="Ecuación canónica:" valor={ecElipse(elipse)} col={accent} />
        <PasoRow n={5} texto="Compruebo en P:" valor={`${f2(dE.d1)} + ${f2(dE.d2)} = ${f2(dE.d1 + dE.d2)}`} col={DFOCO_COL} />
      </Bloque>
    );
  } else if (modo === "hiperbola") {
    teoriaSala = (
      <Bloque titulo="La hipérbola, paso a paso" icono="fa-bezier-curve">
        <PasoRow n={1} texto="La constante:" valor={`2a = ${f2(2 * hiperbola.a)}`} col="#f472b6" />
        <PasoRow n={2} texto="Focos en (±c, 0):" valor={`c = ${f2(hiperbola.c)}  (c > a)`} col={FOCO_COL} />
        <PasoRow n={3} texto="b = √(c² − a²) y asíntotas:" valor={`b = ${f2(hiperbola.b)},  y = ±${f2(hiperbola.b / hiperbola.a)}x`} col="#a8dcff" />
        <PasoRow n={4} texto="Ecuación canónica:" valor={ecHiperbola(hiperbola)} col={accent} />
        <PasoRow n={5} texto="Compruebo en P:" valor={`|${f2(dH.d1)} − ${f2(dH.d2)}| = ${f2(Math.abs(dH.d1 - dH.d2))}`} col={DFOCO_COL} />
      </Bloque>
    );
  } else if (modo === "aplicaciones") {
    teoriaSala = (
      <Bloque titulo="Las cónicas trabajando" icono="fa-satellite-dish">
        <PasoRow n={1} texto="Antena: el plato es y = x²/4f, foco en (0, f):" valor={`f = ${f1(fAntena)}  →  receptor a ${f1(hReceptor)}: señal ${f0(senalA * 100)} %`} col={FOCO_COL} />
        <PasoRow n={2} texto="Órbita: el Sol en un foco, r₁ + r₂ = 2a:" valor={`e = ${f2(eOrbita)},  perihelio ${f2(A_ORBITA * (1 - eOrbita))},  afelio ${f2(A_ORBITA * (1 + eOrbita))}`} col="#a8dcff" />
        <PasoRow n={3} texto="Galería: de un foco al otro, todos los caminos miden 2a:" valor={`2a = ${f0(2 * A_GALERIA)} m,  focos a ±${f1(cGaleria)} m`} col={DFOCO_COL} />
      </Bloque>
    );
  }

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
            corte={corte}
            elipse={elipse}
            hiperbola={hiperbola}
            vista={vista}
            fAntena={fAntena} hReceptor={hReceptor} senalAntena={senalA}
            eOrbita={eOrbita}
            cGaleria={cGaleria} xOyente={xOyente} senalGaleria={senalG}
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
        opciones: MODOS,
        valor: modo,
        cambiar: (id) => cambiarModo(id as ModoConicas),
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
        modo === "cono" ? (
          <>
            <div style={{ color: colCorte, fontWeight: 900 }}>{NOMBRE_CORTE[corte.tipo]}</div>
            <div style={{ color: T.text2, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{ecuacionCorte(corte)}</div>
            <MedidorCorte theta={theta} color={colCorte} />
          </>
        ) : modo === "elipse" ? (
          <>
            <div style={{ color: T.text2, fontWeight: 800 }}>{ecElipse(elipse)}</div>
            <MedidorSuma d1={dE.d1} d2={dE.d2} total={2 * elipse.a} modo="suma" />
          </>
        ) : modo === "hiperbola" ? (
          <>
            <div style={{ color: T.text2, fontWeight: 800 }}>{ecHiperbola(hiperbola)}</div>
            <MedidorSuma d1={dH.d1} d2={dH.d2} total={2 * hiperbola.a} modo="resta" />
          </>
        ) : modo === "aplicaciones" ? (
          <>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {VISTAS.map((v) => (
                <button key={v.id} type="button" className="ex-vista" data-on={vista === v.id} onClick={() => cambiarVista(v.id)}>
                  <i className={`fa-solid ${v.icono}`} aria-hidden /> {v.etiqueta}
                </button>
              ))}
            </div>
            {vista === "antena" && <MedidorSenal valor={senalA} rotulo="señal en el receptor" />}
            {vista === "galeria" && <MedidorSenal valor={senalG} rotulo="susurro que llega" />}
            {vista === "orbita" && <div style={{ color: T.text2, fontWeight: 800 }}>e = {f2(eOrbita)} · r₁ + r₂ = 2a = {f0(2 * A_ORBITA)}</div>}
          </>
        ) : esCirc ? (
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
        { txt: `Inclina el plano hasta dejarlo paralelo a la generatriz (${ANG_GENERATRIZ}°): el corte se vuelve parábola`, done: modo === "cono" && corte.tipo === "parabola", modo: "cono" },
        { txt: "Inclina el plano más que la generatriz: corta las dos napas y aparece la hipérbola", done: modo === "cono" && corte.tipo === "hiperbola", modo: "cono" },
        { txt: "Deja el punto Q justo SOBRE la curva: su distancia al centro debe ser igual a r", done: esCirc && c.estadoQ === "sobre", modo: "circunferencia" },
        { txt: "Mueve el centro (h, k) de la circunferencia y mira cómo cambia su ecuación", done: h !== H_DEF || k !== K_DEF, modo: "circunferencia" },
        { txt: "Cambia el radio y comprueba que todos los puntos siguen equidistando del centro", done: r !== R_DEF, modo: "circunferencia" },
        { txt: "Pasa a la parábola y localiza su foco y su directriz", done: modo === "parabola", modo: "parabola" },
        { txt: "Cambia p y comprueba que d(P, foco) y d(P, directriz) siempre son iguales", done: modo === "parabola" && p !== P_DEF, modo: "parabola" },
        { txt: "Mueve el punto Q sobre la curva y compara sus dos distancias", done: qx !== QX_DEF || qy !== QY_DEF, modo: "circunferencia" },
        { txt: "Jardinero: separa o junta los clavos y comprueba que d₁ + d₂ sigue valiendo 2a", done: modo === "elipse" && cE !== CE_DEF, modo: "elipse" },
        { txt: "Cambia a o c de la hipérbola y comprueba que |d₁ − d₂| siempre vale 2a", done: modo === "hiperbola" && (aH !== AH_DEF || cH !== CH_DEF), modo: "hiperbola" },
        { txt: "Antena: sube o baja el receptor hasta que capte el 100 % de la señal", done: modo === "aplicaciones" && vista === "antena" && senalA >= 1, modo: "aplicaciones" },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            modo === "circunferencia" || modo === "parabola" ? (
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
            ) : controlesSala
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
              {teoriaSala}
              <Bloque titulo={teoCirc ? "La circunferencia, paso a paso" : "La parábola, paso a paso"} icono={teoCirc ? "fa-circle-dot" : "fa-bullseye"}>
                {teoCirc ? (
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
                {teoCirc ? (
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
                  {teoCirc
                    ? <>La circunferencia es el <strong style={{ color: RADIO_COL }}>lugar geométrico</strong> de los puntos que están a la <strong>misma distancia</strong> (el radio) de un centro fijo.</>
                    : <>La parábola es el <strong style={{ color: DFOCO_COL }}>lugar geométrico</strong> de los puntos que <strong>equidistan</strong> del foco y de la directriz. Esa igualdad <em>es</em> la definición.</>}
                </p>
              </Bloque>
              <Bloque titulo={teoCirc ? "Por qué importa" : "Propiedad focal"} icono="fa-satellite-dish">
                <p style={{ margin: 0, color: T.text2 }}>
                  {teoCirc
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
              <Bloque titulo="La sala de las cónicas" icono="fa-landmark">
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS_MUSEO.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 10 }}>
                  {DATOS_MUSEO.map((dd, i) => (
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
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CONICAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                Cálculo <strong>exacto</strong>: la circunferencia es (x−h)²+(y−k)²=r² y la clasificación de Q sale de comparar su distancia al centro con r; la parábola es x²=4py con foco (0, p) y directriz y=−p, y la igualdad d(P,foco)=d(P,directriz) se cumple para cada punto. El plano se dibuja a <strong>escala fija</strong>, así que las posiciones son reales; los <strong>valores numéricos</strong> de las etiquetas y lecturas son los exactos.
              </p>
              <p style={{ marginTop: 8, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                El corte del cono se calcula cerrado en las coordenadas del plano (cono de semiángulo α = {ALFA_DEG}°); la órbita resuelve la ecuación de Kepler en cada cuadro. {CREDITO_ESPACIO}
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
  .ex-vista { cursor:pointer; display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:9px;
    border:1px solid ${T.line}; background:rgba(255,255,255,0.04); color:${T.text2}; font-size:14px; font-weight:800; }
  .ex-vista[data-on="true"] { background:var(--lsa); color:#04121f; border-color:transparent; }
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

/* ── Fila de botones de ejemplo ─────────────────────────────────────────── */
function Chips<X>({ items, activo, etiqueta, icono, al, titulo, accent }: {
  items: X[]; activo: (x: X) => boolean; etiqueta: (x: X) => string; icono: (x: X) => string;
  al: (x: X) => void; titulo?: (x: X) => string; accent: string;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((x) => (
        <button key={etiqueta(x)} className="ex-chip" title={titulo?.(x)} data-on={activo(x)} onClick={() => al(x)} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <i className={`fa-solid ${icono(x)}`} style={{ color: accent }} /> {etiqueta(x)}
        </button>
      ))}
    </div>
  );
}

/* ── Medidor del corte: la inclinación del plano frente a la de la generatriz ── */
function MedidorCorte({ theta, color, grande = false }: { theta: number; color: string; grande?: boolean }) {
  const pct = (v: number) => `${(v / TH_MAX) * 100}%`;
  return (
    <div style={{ display: "grid", gap: 4, width: grande ? undefined : 210 }}>
      <div style={{ position: "relative", height: grande ? 14 : 10, borderRadius: 7, overflow: "visible",
        background: `linear-gradient(90deg, #34d39955 0%, #38bdf855 ${pct(ANG_GENERATRIZ - 1)}, #fbbf24aa ${pct(ANG_GENERATRIZ)}, #f472b655 ${pct(ANG_GENERATRIZ + 1)}, #f472b655 100%)` }}>
        <div style={{ position: "absolute", left: pct(ANG_GENERATRIZ), top: -4, bottom: -4, width: 2, background: "#f8d48a", borderRadius: 1 }} />
        <div style={{ position: "absolute", left: `calc(${pct(theta)} - 7px)`, top: grande ? -2 : -3, width: 14, height: grande ? 18 : 16, borderRadius: 5,
          background: color, border: "2px solid #04121f", boxShadow: `0 0 10px ${color}`, transition: "left 120ms linear" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: T.text3 }}>
        <span>elipse</span><span style={{ color: "#f8d48a" }}>{ANG_GENERATRIZ}° parábola</span><span>hipérbola</span>
      </div>
    </div>
  );
}

/* ── Medidor de suma / diferencia: los dos tramos cambian, el total no ── */
function MedidorSuma({ d1, d2, total, modo, grande = false }: { d1: number; d2: number; total: number; modo: "suma" | "resta"; grande?: boolean }) {
  const alto = grande ? 16 : 10;
  if (modo === "suma") {
    const p1 = (d1 / Math.max(total, 1e-6)) * 100;
    return (
      <div style={{ display: "grid", gap: 4, width: grande ? undefined : 210 }}>
        <div style={{ display: "flex", height: alto, borderRadius: 7, overflow: "hidden", border: "1px solid rgba(255,255,255,0.25)" }}>
          <div style={{ width: `${p1}%`, background: DFOCO_COL, transition: "width 120ms linear" }} />
          <div style={{ flex: 1, background: DDIR_COL }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800 }}>
          <span style={{ color: DFOCO_COL }}>d₁ {f2(d1)}</span>
          <span style={{ color: "#fbbf24" }}>= {f2(d1 + d2)}</span>
          <span style={{ color: DDIR_COL }}>d₂ {f2(d2)}</span>
        </div>
      </div>
    );
  }
  const tope = Math.max(d1, d2, total, 1e-6);
  const barra = (v: number, c: string) => (
    <div style={{ height: alto * 0.75, borderRadius: 6, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <div style={{ width: `${(v / tope) * 100}%`, height: "100%", background: c, transition: "width 120ms linear" }} />
    </div>
  );
  return (
    <div style={{ display: "grid", gap: 4, width: grande ? undefined : 210 }}>
      {barra(d1, DFOCO_COL)}
      {barra(d2, DDIR_COL)}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800 }}>
        <span style={{ color: T.text2 }}>|{f2(d1)} − {f2(d2)}|</span>
        <span style={{ color: "#f472b6" }}>= {f2(Math.abs(d1 - d2))} = 2a</span>
      </div>
    </div>
  );
}

/* ── Medidor de señal (antena, galería) ── */
function MedidorSenal({ valor, rotulo }: { valor: number; rotulo: string }) {
  const c = valor >= 0.999 ? "#34D399" : valor > 0.3 ? "#fbbf24" : "#fb7185";
  return (
    <div style={{ display: "grid", gap: 4, minWidth: 0, width: "100%", maxWidth: 260 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: T.text2 }}>
        <span>{rotulo}</span><span style={{ color: c, fontFamily: "ui-monospace, monospace" }}>{f0(valor * 100)} %</span>
      </div>
      <div style={{ height: 10, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${valor * 100}%`, height: "100%", background: c, boxShadow: `0 0 10px ${c}`, transition: "width 160ms ease" }} />
      </div>
    </div>
  );
}
