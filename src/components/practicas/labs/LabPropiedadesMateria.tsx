"use client";

/**
 * Laboratorio 3D — Propiedades y cambios de la materia.
 * Práctica experimental para CNEYT-I-P02-A2.
 *
 * EXPERIMENTO CENTRAL: el alumno ARRASTRA el avance de una transformación y mira
 * un medidor de dos barras, «sustancia original» y «sustancia nueva». En un cambio
 * físico la barra original no baja (sigue siendo la misma sustancia); en uno
 * químico se vacía mientras la nueva se llena. Esa diferencia VISIBLE es lo que
 * después clasifica como cambio físico o químico.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { TRANSFORMACIONES, clasificaBien, QUIZ_COMPRENSION, type TipoCambio } from "./propiedades-data";
import { LabSfx } from "./lab-audio";
import { FichaTeorica } from "./_ficha";
import { PROPIEDADES_FICHA } from "./propiedades-ficha";
import { useEstrellas } from "@/lib/hooks/useEstrellas";

const PropiedadesMateriaScene = dynamic(() => import("./PropiedadesMateriaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask-vial fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const NO = "#FF5E5E";
const FISICO = "#5BA8FF";
const QUIMICO = "#F2A33C";
const C_ORIG = "#7dd3fc";
const C_NUEVA = "#fb923c";
const RETO_KEY = "cen-propiedades-reto";

const fmt = (n: number, dec = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const STEP = 0.02; // avance por tick de reproducción
const TICK_MS = 32;

export function LabPropiedadesMateria({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [transKey, setTransKey] = useState("fundir-hielo");
  const [progreso, setProgreso] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [eleccion, setEleccion] = useState<TipoCambio | null>(null);
  // seguimiento de objetivos
  const [tocoAvance, setTocoAvance] = useState(false);
  const [vistos, setVistos] = useState<Set<TipoCambio>>(() => new Set<TipoCambio>());
  const [clasificoAlguna, setClasificoAlguna] = useState(false);
  const [aciertoFisico, setAciertoFisico] = useState(false);
  const [aciertoQuimico, setAciertoQuimico] = useState(false);
  const [acertadas, setAcertadas] = useState<Set<string>>(() => new Set<string>());
  // reto + puntuación
  const [intentadas, setIntentadas] = useState<Set<string>>(() => new Set<string>());
  const [primeros, setPrimeros] = useState<Set<string>>(() => new Set<string>());
  const [estrellas, setEstrellas] = useState(0);
  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  // sonido + etiquetas
  const [sonido, setSonido] = useState(false);
  const [etiquetas, setEtiquetas] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  // cuestionario de comprensión (interactividad ampliada — quiz A2 verbatim)
  const [quizAprobado, setQuizAprobado] = useState(false);

  const trans = useMemo(() => TRANSFORMACIONES.find((t) => t.key === transKey)!, [transKey]);

  // Reproducción: la animación avanza 0 → 1 y se detiene al completarse
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgreso((p) => {
        const np = Math.min(1, p + STEP);
        if (np >= 1) setPlaying(false);
        return np;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playing]);

  // Sonido del proceso: qué efecto continuo corresponde a la transformación.
  const sfxLoop: "fuego" | "burbujas" | "vapor" | "gotas" | null = trans.emite === "burbujas"
    ? "burbujas"
    : trans.emite === "humo"
      ? "fuego"
      : trans.modo === "gas"
        ? "vapor"
        : trans.modo === "estado" && trans.flama
          ? "gotas"
          : null;

  const detenerSonidos = () => {
    const a = audioRef.current;
    if (!a) return;
    a.fuego(false);
    a.burbujas(false);
    a.vapor(false);
    a.gotas(false);
  };

  // Mientras se reproduce la animación, suena el proceso correspondiente.
  useEffect(() => {
    if (!sonido) return;
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      if (sfxLoop === "fuego") a.fuego(true);
      else if (sfxLoop === "burbujas") a.burbujas(true);
      else if (sfxLoop === "vapor") a.vapor(true);
      else if (sfxLoop === "gotas") a.gotas(true);
      else if (trans.modo === "fragmenta") a.romper();
    } else {
      detenerSonidos();
    }
    // `audioRef.current` and `detenerSonidos` are refs/stable functions, not reactive; only the listed deps actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sonido, playing, transKey]);

  useEffect(() => () => audioRef.current?.dispose(), []);

  const toggleSonido = async () => {
    if (!sonido) {
      if (!audioRef.current) audioRef.current = new LabSfx();
      await audioRef.current.enable();
      setSonido(true);
    } else {
      detenerSonidos();
      audioRef.current?.mute();
      setSonido(false);
    }
  };

  const elegirTrans = (k: string) => {
    setTransKey(k);
    setProgreso(0);
    setPlaying(false);
    setEleccion(null);
    if (sonido) detenerSonidos();
  };
  const aplicar = () => {
    if (progreso >= 1) setProgreso(0);
    setEleccion(null);
    setPlaying(true);
  };
  const arrastrarAvance = (v: number) => {
    setPlaying(false);
    setTocoAvance(true);
    setEleccion(null);
    setProgreso(v);
  };
  const clasificar = (tipo: TipoCambio) => {
    const bien = clasificaBien(trans, tipo);
    setEleccion(tipo);
    setClasificoAlguna(true);
    if (sonido) {
      if (bien) audioRef.current?.correcto();
      else audioRef.current?.incorrecto();
    }

    const primeraVez = !intentadas.has(transKey);
    if (primeraVez) {
      const ni = new Set(intentadas);
      ni.add(transKey);
      setIntentadas(ni);
    }

    if (!bien) return;

    if (trans.tipo === "fisico") setAciertoFisico(true);
    else setAciertoQuimico(true);

    const nextAcertadas = new Set(acertadas);
    nextAcertadas.add(transKey);
    setAcertadas(nextAcertadas);

    let nextPrimeros = primeros;
    if (primeraVez) {
      nextPrimeros = new Set(primeros);
      nextPrimeros.add(transKey);
      setPrimeros(nextPrimeros);
    }

    // Reto: al clasificar correctamente las 6, se otorgan estrellas.
    if (nextAcertadas.size >= TRANSFORMACIONES.length) {
      const est = nextPrimeros.size >= TRANSFORMACIONES.length ? 3 : nextPrimeros.size >= 4 ? 2 : 1;
      setEstrellas(est);
      registraEstrellas(est);
    }
  };
  const reset = () => {
    setProgreso(0);
    setPlaying(false);
    setEleccion(null);
    setResetNonce((n) => n + 1);
    if (sonido) detenerSonidos();
  };

  const completa = progreso >= 1;
  const acerto = eleccion !== null && clasificaBien(trans, eleccion);
  const respondio = eleccion !== null;

  // Ajuste durante el render: anota qué tipo de cambio ya vio completarse.
  if (completa && !vistos.has(trans.tipo)) {
    setVistos(new Set(vistos).add(trans.tipo));
  }

  // El experimento: cuánta sustancia ORIGINAL queda y cuánta NUEVA se forma.
  // (Simplificación didáctica lineal: en un cambio físico la sustancia no se toca.)
  const original = trans.tipo === "fisico" ? 1 : 1 - progreso;
  const nueva = trans.tipo === "fisico" ? 0 : progreso;

  const lecturaCorta = progreso < 0.02
    ? "Arrastra el avance y vigila las dos barras"
    : trans.tipo === "fisico"
      ? `Sustancia original: ${fmt(original * 100)} % (no cambia)`
      : `Original ${fmt(original * 100)} % · nueva ${fmt(nueva * 100)} %`;

  const objetivos = [
    { txt: "Arrastra el avance de una transformación y mira las dos barras", done: tocoAvance },
    { txt: "Completa un cambio físico y uno químico y compara cómo quedan las barras", done: vistos.size >= 2 },
    { txt: "Aplica y clasifica una transformación", done: clasificoAlguna },
    { txt: "Identifica un cambio físico", done: aciertoFisico },
    { txt: "Identifica un cambio químico", done: aciertoQuimico },
    { txt: "Clasifica correctamente las 6", done: acertadas.size >= 6 },
    { txt: "Consigue 3★ (acierta todo a la primera)", done: Math.max(estrellas, mejor) >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${trans.icono}`} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{trans.nombre}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: observa la evidencia para decidir si la sustancia sigue siendo la misma (cambio físico) o si se formó una nueva (cambio químico).
      </div>
    </div>
  );

  return (
    <>
      <style>{CSS(accent)}</style>
      <LabShell
        accent={accent}
        rgba={color.rgba}
        retoKey={RETO_KEY}
        escena={
          <SceneBoundary fallback={sceneFallback}>
            <PropiedadesMateriaScene
              transKey={trans.key}
              modo={trans.modo}
              colorInicial={trans.colorInicial}
              colorFinal={trans.colorFinal}
              emite={trans.emite}
              flama={trans.flama}
              progreso={progreso}
              accent={accent}
              autoRotate={autoRotate}
              resetNonce={resetNonce}
              sustancia={trans.sustancia}
              etiquetas={etiquetas}
            />
          </SceneBoundary>
        }
        modos={{
          opciones: TRANSFORMACIONES.map((t) => ({ id: t.key, etiqueta: t.nombre, icono: t.icono })),
          valor: transKey,
          cambiar: elegirTrans,
        }}
        herramientas={
          <>
            <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
            <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Aplicar la transformación"} activo={playing} onClick={() => (playing ? setPlaying(false) : aplicar())} />
            <BotonHerramienta icono="fa-tags" titulo="Mostrar etiquetas" activo={etiquetas} onClick={() => setEtiquetas((v) => !v)} />
            <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
            <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
          </>
        }
        leyenda={<MedidorSustancia original={original} nueva={nueva} compacto />}
        lectura={lecturaCorta}
        objetivos={objetivos}
        pestanas={[
          {
            id: "controles",
            etiqueta: "Controles",
            icono: "fa-sliders",
            contenido: (
              <>
                <Bloque titulo={trans.nombre} icono={trans.icono}>
                  <div style={{ color: T.text2 }}>
                    {trans.flama ? "Se aplica calor" : "Sin calor"} · sustancia: <strong style={{ color: "#fff" }}>{trans.sustancia}</strong>
                  </div>
                  <Deslizador
                    label="Avance de la transformación"
                    icon="fa-hourglass-half"
                    colr={accent}
                    valor={`${fmt(progreso * 100)} %`}
                    min={0}
                    max={1}
                    step={0.01}
                    value={progreso}
                    onChange={arrastrarAvance}
                    hintL="antes"
                    hintR="después"
                  />
                  <button type="button" className="pm-play" onClick={aplicar} disabled={playing}>
                    <i className={`fa-solid ${playing ? "fa-spinner fa-spin" : completa ? "fa-rotate-right" : "fa-play"}`} aria-hidden />
                    {playing ? "Aplicando…" : completa ? "Repetir" : "Aplicar"}
                  </button>
                </Bloque>

                <Bloque titulo="¿Sigue siendo la misma sustancia?" icono="fa-scale-balanced">
                  <MedidorSustancia original={original} nueva={nueva} />
                  <div style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.1)`, fontWeight: 600 }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 8, color: accent }} aria-hidden />
                    {completa ? trans.evidencia : "Mueve el avance hasta el final para ver la evidencia."}
                    {completa && (
                      <div style={{ color: trans.reversible ? OK : T.text2, marginTop: 8, fontWeight: 700 }}>
                        <i className={`fa-solid ${trans.reversible ? "fa-rotate-left" : "fa-ban"}`} style={{ marginRight: 7 }} aria-hidden />
                        {trans.reversible ? "Se puede revertir: regresa el avance a 0 %" : "No se revierte fácilmente"}
                      </div>
                    )}
                  </div>
                </Bloque>

                <Bloque titulo="Clasifícalo" icono="fa-list-check">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 10 }}>
                    <button
                      type="button"
                      className="pm-cls"
                      onClick={() => clasificar("fisico")}
                      disabled={!completa}
                      style={respondio && eleccion === "fisico" ? { borderColor: acerto ? OK : NO, background: `${acerto ? OK : NO}1f` } : { borderColor: completa ? FISICO : T.line }}
                    >
                      <i className="fa-solid fa-snowflake" style={{ color: FISICO }} aria-hidden />
                      Cambio físico
                    </button>
                    <button
                      type="button"
                      className="pm-cls"
                      onClick={() => clasificar("quimico")}
                      disabled={!completa}
                      style={respondio && eleccion === "quimico" ? { borderColor: acerto ? OK : NO, background: `${acerto ? OK : NO}1f` } : { borderColor: completa ? QUIMICO : T.line }}
                    >
                      <i className="fa-solid fa-fire-flame-curved" style={{ color: QUIMICO }} aria-hidden />
                      Cambio químico
                    </button>
                  </div>
                  {!completa && <div style={{ color: T.text3 }}>Se habilita cuando la transformación llega al 100 %.</div>}
                  {respondio && (
                    <div style={{ borderRadius: 13, border: `1px solid ${acerto ? OK : NO}55`, background: `${acerto ? OK : NO}14`, padding: "12px 14px", display: "flex", gap: 12 }}>
                      <i className={`fa-solid ${acerto ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: acerto ? OK : NO, fontSize: 18, marginTop: 2 }} aria-hidden />
                      <div style={{ color: T.text2 }}>
                        <strong style={{ color: T.text }}>
                          {acerto ? "¡Correcto! " : "No exactamente. "}
                          Es un cambio {trans.tipo === "fisico" ? "físico" : "químico"}.
                        </strong>{" "}
                        {trans.explica}
                      </div>
                    </div>
                  )}
                </Bloque>

                <Bloque titulo="Marcador" icono="fa-star">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                    <Dato label="Avance" value={`${fmt(progreso * 100)} %`} col={accent} />
                    <Dato label="Tu respuesta" value={respondio ? (acerto ? "Correcta" : "Incorrecta") : "—"} col={respondio ? (acerto ? OK : NO) : undefined} />
                    <Dato label="Acertadas" value={`${acertadas.size}/6`} col={acertadas.size >= 6 ? OK : undefined} />
                    <Dato label="Estrellas (mejor)" value={`${"★".repeat(estrellas) || "—"} (${mejor > 0 ? `${mejor}★` : "—"})`} col="#FFC75A" />
                  </div>
                  <div style={{ color: T.text3 }}>
                    {estrellas >= 3
                      ? "¡Perfecto! Clasificaste las 6 a la primera."
                      : acertadas.size >= 6
                        ? "¡Completaste las 6! Acierta todo a la primera para 3★."
                        : "Clasifica las 6 transformaciones; acertar a la primera da más estrellas."}
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
              <QuizCard
                accent={accent}
                rgba={color.rgba}
                aprobado={quizAprobado}
                onAprobado={() => setQuizAprobado(true)}
                playSfx={
                  sonido
                    ? (ok) => {
                        if (ok) audioRef.current?.correcto();
                        else audioRef.current?.incorrecto();
                      }
                    : undefined
                }
              />
            ),
          },
          {
            id: "teoria",
            etiqueta: "Teoría",
            icono: "fa-book-open",
            contenido: (
              <>
                <Bloque titulo="La clave" icono="fa-lightbulb">
                  <p style={{ margin: 0, color: T.text2 }}>
                    La clave es preguntarte: <strong style={{ color: T.text }}>¿se formó una sustancia nueva?</strong> Si solo cambió la forma o el estado (y suele poder revertirse), es{" "}
                    <strong style={{ color: FISICO }}>físico</strong>. Si hay gas, cambio de color permanente, calor o ceniza, es <strong style={{ color: QUIMICO }}>químico</strong>.
                  </p>
                </Bloque>
                <Bloque titulo="Ficha teórica" icono="fa-book">
                  <FichaTeorica data={PROPIEDADES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
                </Bloque>
              </>
            ),
          },
        ]}
      />
    </>
  );
}

/* ── Medidor del experimento: sustancia original vs sustancia nueva ───────── */
function MedidorSustancia({ original, nueva, compacto = false }: { original: number; nueva: number; compacto?: boolean }) {
  const barra = (txt: string, v: number, c: string) => (
    <div style={{ display: "grid", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>{txt}</span>
        <span style={{ fontFamily: "ui-monospace, monospace" }}>{fmt(v * 100)} %</span>
      </div>
      <div style={{ height: compacto ? 8 : 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${v * 100}%`, height: "100%", background: c, transition: "width 120ms linear" }} />
      </div>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: compacto ? 6 : 10, width: compacto ? 200 : undefined }}>
      {barra("Sustancia original", original, C_ORIG)}
      {barra("Sustancia nueva", nueva, C_NUEVA)}
    </div>
  );
}

const CSS = (accent: string) => `
.pm-play { cursor:pointer; width:100%; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:13px 20px;
  border-radius:12px; border:none; background:${accent}; color:#04121f; font-size:15px; font-weight:800; transition:all .15s; }
.pm-play:hover { filter:brightness(1.08); }
.pm-play:disabled { opacity:0.55; cursor:default; }
.pm-cls { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:13px 12px;
  border-radius:12px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
.pm-cls:disabled { opacity:0.45; cursor:default; }
.pm-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
  border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600;
  text-align:left; width:100%; transition:all .14s; }
.pm-q:hover:not(:disabled) { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
.pm-q:disabled { cursor:default; }
`;

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión — reproduce el quiz A2 (verbatim) como
 * "interactividad ampliada": el alumno responde aquí mismo y recibe
 * retroalimentación por reactivo, igual que la tarjeta de cálculos del
 * laboratorio de destilación.
 * ──────────────────────────────────────────────────────────────────────── */
function QuizCard({
  accent,
  rgba,
  aprobado,
  onAprobado,
  playSfx,
}: {
  accent: string;
  rgba: string;
  aprobado: boolean;
  onAprobado: () => void;
  playSfx?: (ok: boolean) => void;
}) {
  const NO = "#FF5E5E";
  const [resp, setResp] = useState<(number | null)[]>(() => QUIZ_COMPRENSION.map(() => null));
  const [comprobado, setComprobado] = useState(false);

  const aciertos = resp.filter((r, i) => r === QUIZ_COMPRENSION[i]!.correcta).length;
  const total = QUIZ_COMPRENSION.length;
  const todasContestadas = resp.every((r) => r !== null);
  const aprobadoAhora = aciertos === total;

  const elegir = (qi: number, oi: number) => {
    if (comprobado) return;
    setResp((prev) => prev.map((v, i) => (i === qi ? oi : v)));
  };

  const comprobar = () => {
    setComprobado(true);
    const ok = aciertos === total;
    playSfx?.(ok);
    if (ok) onAprobado();
  };

  const reintentar = () => {
    setResp(QUIZ_COMPRENSION.map(() => null));
    setComprobado(false);
  };

  return (
    <div style={{ padding: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: T.text3 }}>
          <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
          Comprueba lo aprendido
        </div>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Cinco preguntas sobre las propiedades físicas y químicas de la materia. Responde y pulsa «Comprobar».
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ_COMPRENSION.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
                <span style={{ color: accent }}>{qi + 1}.</span>
                <span>{q.pregunta}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 9 }}>
                {q.opciones.map((op, oi) => {
                  const sel = elegida === oi;
                  const esCorrecta = oi === q.correcta;
                  let borde = T.line;
                  let fondo = T.glass;
                  let colorTxt = T.text2;
                  if (comprobado && esCorrecta) {
                    borde = OK;
                    fondo = `${OK}1c`;
                    colorTxt = "#fff";
                  } else if (comprobado && sel && !esCorrecta) {
                    borde = NO;
                    fondo = `${NO}1c`;
                    colorTxt = "#fff";
                  } else if (!comprobado && sel) {
                    borde = accent;
                    fondo = `rgba(${rgba},0.16)`;
                    colorTxt = "#fff";
                  }
                  return (
                    <button
                      key={oi}
                      className="pm-q"
                      onClick={() => elegir(qi, oi)}
                      disabled={comprobado}
                      style={{ borderColor: borde, background: fondo, color: colorTxt }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          flexShrink: 0,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 900,
                          border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}`,
                        }}
                      >
                        {comprobado && esCorrecta ? <i className="fa-solid fa-check" /> : comprobado && sel ? <i className="fa-solid fa-xmark" /> : String.fromCharCode(65 + oi)}
                      </span>
                      <span style={{ flex: 1, lineHeight: 1.35 }}>{op}</span>
                    </button>
                  );
                })}
              </div>
              {comprobado && (
                <div style={{ marginTop: 9, fontSize: 14, color: T.text2, lineHeight: 1.5, display: "flex", gap: 9, padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
                  <i className="fa-solid fa-circle-info" style={{ color: accent, marginTop: 2 }} />
                  <span>{q.retro}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
        {!comprobado ? (
          <button className="pm-play" style={{ width: "auto", padding: "12px 24px" }} onClick={comprobar} disabled={!todasContestadas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="pm-cls" style={{ flex: "0 0 auto", padding: "12px 22px" }} onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              borderRadius: 12,
              padding: "10px 16px",
              border: `1px solid ${aprobadoAhora ? OK : NO}55`,
              background: `${aprobadoAhora ? OK : NO}14`,
              fontSize: 14,
              fontWeight: 800,
              color: aprobadoAhora ? OK : NO,
            }}
          >
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas e inténtalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
