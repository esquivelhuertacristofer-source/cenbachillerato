"use client";

/**
 * Laboratorio 3D — El ciclo del carbono: equilibrio y desequilibrio.
 * Práctica experimental para CNEYT-III-P04-A1 (progresión 4).
 *
 * Una Tierra rodeada por sus reservorios de carbono (atmósfera, vegetación,
 * animales, suelo, océano y combustibles fósiles); entre ellos viajan átomos de
 * carbono por los procesos del ciclo (fotosíntesis, respiración, descomposición,
 * disolución oceánica, fosilización). El alumno mueve las EMISIONES humanas por
 * quema de fósiles y ve, en vivo, cuánto CO₂ alcanzan a reabsorber océano y
 * bosques y cuánto se acumula en la atmósfera (y cuántas ppm sube al año). A 0
 * el ciclo está en equilibrio; al subir, la atmósfera se tiñe de naranja.
 * Ciencias Naturales, Experimentales y Tecnología III — Ecosistemas y energía
 * (MCCEMS 2025); datos verbatim de INECC 2022 / SEMARNAT / CONAFOR.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { CICLO_CARBONO_FICHA } from "./ciclo-carbono-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./ciclo-carbono-data";
import { EppGate, type EppItem } from "./_epp-gate";
import { LabSfx } from "./lab-audio";
import {
  RESERVORIOS,
  DATOS_MX,
  TIEMPOS,
  acumAtm,
  absorbido,
  ppmAnual,
  fmtGt,
  fmtPpm,
  EMIS_MIN, EMIS_MAX, EMIS_STEP, EMIS_DEFAULT, FRAC_AEREA,
} from "./carbono-data";

const CicloCarbonoScene = dynamic(() => import("./CicloCarbonoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-arrows-spin fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const AZUL = "#38bdf8";
const ROJO = "#ef4444";
const NARANJA = "#f59e0b";
const WARN = "#FF8A3C";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-carbono-reto";

/** Instrumentos para medir el carbono (3 correctos + 3 distractores). */
const INSTRUMENTOS: EppItem[] = [
  { key: "sensor", nombre: "Sensor de CO₂", icono: "fa-gauge-high", ok: true, nota: "Mide la concentración de CO₂ en el aire, en ppm: el dato central del ciclo." },
  { key: "termometro", nombre: "Termómetro", icono: "fa-temperature-half", ok: true, nota: "Registra la temperatura, ligada al efecto invernadero del CO₂." },
  { key: "bascula", nombre: "Báscula", icono: "fa-scale-balanced", ok: true, nota: "Pesa la biomasa para estimar el carbono fijado, en gigatoneladas." },
  { key: "pala", nombre: "Pala", icono: "fa-shovel", ok: false, nota: "Sirve para cavar el suelo, no para medir el carbono." },
  { key: "planta", nombre: "Planta", icono: "fa-seedling", ok: false, nota: "Es un reservorio que estudias, no un instrumento de medición." },
  { key: "regadera", nombre: "Regadera", icono: "fa-shower", ok: false, nota: "Riega las plantas, pero no mide nada del ciclo." },
];

export function LabCicloCarbono({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [emisiones, setEmisiones] = useState(EMIS_DEFAULT);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // compuerta de equipamiento (pilar: equiparse)
  const [eppListo, setEppListo] = useState(false);

  // objetivos
  const [bajoEquilibrio, setBajoEquilibrio] = useState(false);
  const [subioEmisiones, setSubioEmisiones] = useState(false);
  const [llegoAlto, setLlegoAlto] = useState(false); // llevó las emisiones a 50 Gt/año o más
  const [vioMexico, setVioMexico] = useState(false);
  const [arrastro, setArrastro] = useState(false); // arrastró la palanca de emisiones en 3D
  const [predicho, setPredicho] = useState(false); // resolvió el cálculo del carbono al aire

  // récord de estrellas del reto de cálculo (persistido)
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);

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
  const marcaNivel = (v: number) => {
    if (v === 0) setBajoEquilibrio(true);
    if (v > EMIS_DEFAULT) setSubioEmisiones(true);
    if (v >= 50) setLlegoAlto(true);
  };
  const cambiarEmis = (v: number) => {
    setEmisiones(v);
    if (sonido) audioRef.current?.blip();
    marcaNivel(v);
  };
  // la palanca de emisiones arrastrada en 3D entra por aquí (pilar: arrastrar)
  const onEmisionesArrastre = useCallback((v: number) => {
    const nv = Math.round(v);
    setArrastro(true);
    setEmisiones(nv);
    if (nv === 0) setBajoEquilibrio(true);
    if (nv > EMIS_DEFAULT) setSubioEmisiones(true);
    if (nv >= 50) setLlegoAlto(true);
  }, []);
  const onGrabPalanca = useCallback(() => {
    if (sonido) audioRef.current?.blip();
  }, [sonido]);
  const reset = () => { setEmisiones(EMIS_DEFAULT); bump(); };

  const registraEstrellas = useCallback((est: number) => {
    setPredicho(true);
    guardaEstrellas(est);
  }, [guardaEstrellas]);

  const acum = useMemo(() => acumAtm(emisiones), [emisiones]);
  const abs = useMemo(() => absorbido(emisiones), [emisiones]);
  const ppm = useMemo(() => ppmAnual(emisiones), [emisiones]);
  const equilibrio = emisiones === 0;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: VERDE, boxShadow: `0 10px 30px -6px ${VERDE}` }}>
        <i className="fa-solid fa-arrows-spin" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>El carbono no se gasta: circula</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 410, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: el carbono pasa entre atmósfera, plantas, animales, suelo, océano y fósiles. Quemar fósiles añade carbono más rápido de lo que océano y bosques pueden reabsorber.
      </div>
    </div>
  );

  const lectura = equilibrio
    ? <>Equilibrio: el carbono solo circula</>
    : <>{fmtGt(acum)} Gt/año se quedan al aire: +{fmtPpm(ppm)} ppm</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <>
          <SceneBoundary fallback={sceneFallback}>
            <CicloCarbonoScene
              emisiones={emisiones}
              accent={accent}
              pausado={pausado}
              autoRotate={autoRotate}
              resetNonce={resetNonce}
              arrastrable={eppListo}
              onEmisionesChange={onEmisionesArrastre}
              onGrab={onGrabPalanca}
            />
          </SceneBoundary>
          {!eppListo && (
            <EppGate
              accent={accent}
              rgba={color.rgba}
              items={INSTRUMENTOS}
              titulo="Antes de medir: equípate"
              subtitulo="Identifica tus instrumentos de medición"
              verbo="instrumentos de medición"
              intro="Para estudiar el carbono hay que medirlo. Entre el material de abajo, selecciona solo los 3 instrumentos de medición (no la pala, la planta ni la regadera) para entrar."
              onEntrar={() => setEppListo(true)}
            />
          )}
        </>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar los flujos" : "Pausar los flujos"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={<MedidorBalance emisiones={emisiones} abs={abs} acum={acum} ppm={ppm} />}
      lectura={lectura}
      objetivos={[
        { txt: "Equípate: elige los 3 instrumentos de medición", done: eppListo },
        { txt: "Arrastra la palanca de emisiones en 3D", done: arrastro },
        { txt: "Baja las emisiones a cero", done: bajoEquilibrio },
        { txt: "Sube las emisiones (mira la atmósfera)", done: subioEmisiones },
        { txt: "Llévalas a 50 Gt/año o más y mira cuántos ppm sube el CO₂ al año", done: llegoAlto },
        { txt: "Lee el caso de México", done: vioMexico },
        { txt: "Calcula el CO₂ que queda al aire", done: predicho },
        { txt: "Resuelve el reto evaluable de la actividad A3", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Emisiones humanas de CO₂" icono="fa-industry">
                <Deslizador label="Quema de fósiles + cambio de uso de suelo" icon="fa-industry" colr={ROJO}
                  valor={`${emisiones} Gt/año`} min={EMIS_MIN} max={EMIS_MAX} step={EMIS_STEP} value={emisiones} onChange={cambiarEmis}
                  hintL="0: equilibrio natural" hintR={`${EMIS_MAX} Gt/año`} />
                <p style={{ margin: 0, color: T.text2 }}>
                  Hoy el mundo emite <strong style={{ color: T.text }}>~37 Gt de CO₂ al año</strong> (INECC 2022). Llévalo a 0 para ver el ciclo natural en equilibrio, o arrastra la palanca a la izquierda de la Tierra.
                </p>
              </Bloque>

              <Bloque titulo="¿Adónde va el carbono que emitimos?" icono="fa-chart-simple">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Emitido" value={`${fmtGt(emisiones)} Gt`} col={ROJO} />
                  <Dato label="Reabsorbido" value={`${fmtGt(abs)} Gt`} col={AZUL} />
                  <Dato label="Queda al aire" value={`${fmtGt(acum)} Gt`} col={NARANJA} />
                  <Dato label="CO₂ sube" value={`${fmtPpm(ppm)} ppm`} col={ROJO} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  El océano y los bosques son <strong style={{ color: AZUL }}>sumideros</strong>: reabsorben un poco más de la mitad de lo que emitimos. El resto se <strong style={{ color: NARANJA }}>acumula</strong> en la atmósfera año tras año. Si un sumidero se destruye (talar un bosque, calentar el océano), reabsorbe menos y deja de ser sumidero para volverse <strong style={{ color: ROJO }}>fuente</strong>. La fracción aérea (~{Math.round(FRAC_AEREA * 100)} %) es aproximada (IPCC).
                </p>
              </Bloque>

              <Bloque titulo="El carbono en México" icono="fa-earth-americas">
                <div
                  style={{ display: "grid", gap: 12 }}
                  onPointerEnter={() => setVioMexico(true)}
                  onTouchStart={() => setVioMexico(true)}
                  onClick={() => setVioMexico(true)}
                >
                  {DATOS_MX.map((d) => (
                    <div key={d.titulo} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: accent, background: `rgba(${color.rgba},0.16)` }}>
                        <i className={`fa-solid ${d.icono}`} />
                      </div>
                      <div style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.45 }}>
                        <strong style={{ color: T.text }}>{d.titulo}</strong> — {d.texto}
                      </div>
                    </div>
                  ))}
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
            <>
              <PrediccionCarbonoCard
                accent={accent}
                emisLive={emisiones}
                mejor={mejorEstrellas}
                onResultado={registraEstrellas}
                playSfx={sonido ? (ok) => (ok ? audioRef.current?.correcto() : audioRef.current?.incorrecto()) : undefined}
              />
              <div style={{ height: 16 }} />
              <RetoQuizCard
                quiz={QUIZ_A2}
                accent={accent}
                rgba={color.rgba}
                aprobado={ejercicioAprobado}
                onAprobado={() => setEjercicioAprobado(true)}
                playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
                playPick={sonido ? () => audioRef.current?.blip() : undefined}
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
              <Bloque titulo="Los reservorios de carbono" icono="fa-layer-group">
                {RESERVORIOS.map((r) => (
                  <div key={r.key} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: r.color, background: `${r.color}1f` }}>
                      <i className={`fa-solid ${r.icono}`} />
                    </div>
                    <div style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.45 }}>
                      <strong style={{ color: r.color }}>{r.nombre}</strong> <span style={{ color: T.text3, fontFamily: "ui-monospace, monospace" }}>(~{r.gtC.toLocaleString("es-MX")} GtC)</span> — {r.resumen}
                    </div>
                  </div>
                ))}
                <p style={{ margin: 0, fontSize: 14, color: T.text3 }}>
                  Tamaños globales aproximados, en gigatoneladas de carbono (GtC). 1 GtC = mil millones de toneladas.
                </p>
              </Bloque>
              <Bloque titulo="Cada ciclo a su ritmo" icono="fa-hourglass-half">
                {TIEMPOS.map((t) => (
                  <div key={t.ciclo} style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.4 }}>
                    <strong style={{ color: t.color }}>{t.ciclo}:</strong> {t.tiempo}
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Idea clave" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Con las emisiones en <strong style={{ color: VERDE }}>0</strong> los átomos siguen circulando y la atmósfera se mantiene azul (equilibrio). Al subirlas, el flujo rojo de <strong style={{ color: ROJO }}>combustión</strong> se dispara y la capa de aire se vuelve naranja. El carbono no desaparece: solo cambia de reservorio.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CICLO_CARBONO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor: emitido → reabsorbido + queda al aire ───────────────────── */
function MedidorBalance({ emisiones, abs, acum, ppm }: { emisiones: number; abs: number; acum: number; ppm: number }) {
  const barra = (txt: string, val: number, c: string) => (
    <div style={{ display: "grid", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>{txt}</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtGt(val)} Gt</span>
      </div>
      <div style={{ height: 8, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, (val / EMIS_MAX) * 100)}%`, height: "100%", background: c, transition: "width 120ms linear" }} />
      </div>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: 6, minWidth: 190 }}>
      {barra("emitido", emisiones, ROJO)}
      {barra("reabsorbido", abs, AZUL)}
      {barra("queda al aire", acum, NARANJA)}
      <div style={{ fontSize: 14, fontWeight: 900, color: acum > 0 ? ROJO : VERDE }}>
        {acum > 0 ? `CO₂ sube ${fmtPpm(ppm)} ppm/año` : "Equilibrio natural"}
      </div>
    </div>
  );
}

/* ── Reto de cálculo: el CO₂ que queda al aire = emisiones × 0.45 ───────── */
function PrediccionCarbonoCard({
  accent,
  emisLive,
  mejor,
  onResultado,
  playSfx,
}: {
  accent: string;
  emisLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<number | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [check, setCheck] = useState(false);
  const [estrellas, setEstrellas] = useState<number | null>(null);

  const tomarLectura = () => {
    setSnap(emisLive);
    setVal("");
    setIntentos(0);
    setCheck(false);
    setEstrellas(null);
  };

  const esp = snap !== null ? acumAtm(snap) : 0; // emisiones × 0.45
  const num = Number((val || "").trim().replace(",", "."));
  const okActual = snap !== null && val.trim() !== "" && !Number.isNaN(num) && Math.abs(num - esp) <= Math.max(0.5, Math.abs(esp) * 0.04);

  const comprobar = () => {
    if (snap === null) return;
    const intentoN = intentos + 1;
    setIntentos(intentoN);
    setCheck(true);
    if (okActual) {
      const est = intentoN <= 1 ? 3 : intentoN === 2 ? 2 : 1;
      setEstrellas(est);
      onResultado(est);
    }
    playSfx?.(okActual);
  };

  return (
    <div style={{ ...card, padding: "16px" }}>
      <style>{CALC_CSS(accent)}</style>
      <Eyebrow>
        <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />
        Reto de cálculo · El CO₂ que queda al aire
      </Eyebrow>

      <div style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>
        Toma una lectura de las emisiones actuales y calcula cuánto CO₂ se queda en la atmósfera: cerca del{" "}
        <strong style={{ color: NARANJA }}>{Math.round(FRAC_AEREA * 100)} %</strong> de lo emitido, con{" "}
        <strong style={{ color: accent, ...NUM }}>queda al aire = emisiones × {FRAC_AEREA}</strong>. Compruébalo contra la lectura de la escena.
      </div>

      {snap === null ? (
        <button className="calc-btn calc-btn-primary" onClick={tomarLectura}>
          <i className="fa-solid fa-camera" style={{ marginRight: 8 }} />
          Tomar lectura de las emisiones
        </button>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: "1 1 0", minWidth: 100, borderRadius: 11, border: `1px solid ${T.line}`, background: T.inset, padding: "9px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", color: T.text3 }}>EMISIONES</div>
              <div style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: ROJO, ...NUM }}>{fmtGt(snap)} Gt/año</div>
            </div>
            <div style={{ flex: "1 1 0", minWidth: 100, borderRadius: 11, border: `1px solid ${T.line}`, background: T.inset, padding: "9px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", color: T.text3 }}>FRACCIÓN AÉREA</div>
              <div style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: NARANJA, ...NUM }}>{FRAC_AEREA}</div>
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 800, color: T.text2, marginBottom: 7 }}>¿Cuánto CO₂ queda al aire? (Gt/año)</div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", maxWidth: "100%" }}>
            <input
              className="calc-in"
              type="number"
              inputMode="decimal"
              placeholder="Gt"
              value={val}
              onChange={(e) => { setVal(e.target.value); setCheck(false); }}
              style={{ flex: 1, borderColor: check ? (okActual ? OK : WARN) : undefined }}
            />
            <span style={{ fontSize: 14, fontWeight: 900, color: T.text2 }}>Gt</span>
            {check && <i className={`fa-solid ${okActual ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: okActual ? OK : WARN, fontSize: 17 }} />}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
            {!(check && okActual) && (
              <button className="calc-btn calc-btn-primary" onClick={comprobar} disabled={val.trim() === ""}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
                Comprobar
              </button>
            )}
            <button className="calc-btn calc-btn-ghost" onClick={tomarLectura}>
              <i className="fa-solid fa-arrow-rotate-left" style={{ marginRight: 8 }} />
              Otra lectura
            </button>
            {estrellas !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 16, color: s <= estrellas ? "#FBBF24" : "rgba(255,255,255,0.18)" }} />
                  ))}
                </div>
                <span style={{ fontSize: 14, color: T.text3 }}>Mejor: <strong style={{ color: mejor >= 3 ? OK : T.text2 }}>{mejor}★</strong></span>
              </div>
            )}
          </div>

          {check && (
            <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${okActual ? OK : WARN}66`, background: `${okActual ? OK : WARN}14`, padding: "14px 16px", fontSize: 14, color: T.text, lineHeight: 1.5 }}>
              {okActual ? (
                <>
                  <div style={{ fontWeight: 900, color: OK, marginBottom: 6 }}>
                    <i className="fa-solid fa-trophy" style={{ marginRight: 8 }} />
                    ¡Correcto! Quedan {fmtGt(esp)} Gt al aire
                  </div>
                  <div style={{ color: T.text2, ...NUM }}>
                    {fmtGt(snap)} × {FRAC_AEREA} = {fmtGt(esp)} Gt/año se acumulan en la atmósfera, igual que la lectura naranja de la escena. El resto lo reabsorben océano y bosques.
                  </div>
                </>
              ) : (
                <div style={{ color: "#FFB27A" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
                  Aún no. Multiplica las emisiones por la fracción aérea: queda al aire = emisiones × {FRAC_AEREA}. Vuelve a intentarlo.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const CALC_CSS = (accent: string) => `
  .calc-in { width:100%; box-sizing:border-box; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
    color:#fff; font-size:18px; font-weight:900; text-align:center; padding:12px; outline:none; transition:border-color .15s; -moz-appearance:textfield; }
  .calc-in:focus { border-color:${accent}; }
  .calc-in::-webkit-outer-spin-button, .calc-in::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
  .calc-btn { cursor:pointer; border:none; border-radius:12px; font-size:14px; font-weight:800; padding:12px 18px; transition:all .15s; }
  .calc-btn-primary { background:${accent}; color:#04121f; }
  .calc-btn-primary:hover:not(:disabled) { filter:brightness(1.08); }
  .calc-btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
  .calc-btn-ghost { background:${T.glass}; border:1px solid ${T.line}; color:#fff; }
  .calc-btn-ghost:hover { border-color:${accent}; }
`;
