"use client";

/**
 * Laboratorio 3D — "Biotecnología y bioética: CRISPR, OGM y clonación".
 * Práctica experimental anclada a CNEYT-VI-P08-A1 (infografía "Biotecnología y
 * bioética en México"; progresión 8, UAC CNEYT-VI). La parte MANIPULABLE es la
 * biotecnología (las tres técnicas que nombra la infografía: «transgénicos,
 * CRISPR o clonación»); la dimensión ética se conserva como debate verbatim,
 * porque es deliberación, no un mecanismo que se pueda «correr».
 *
 * Tres modos:
 *  (1) CRISPR-Cas9 — EXPERIMENTO: el alumno DESLIZA la ARN guía sobre el ADN;
 *      las bases que encajan se ven de su color y las que no, en rojo. Cas9 solo
 *      corta si todas encajan y hay PAM; después elige NHEJ (knockout) o HDR
 *      (edición precisa) y ve cuántas bases cambia el sitio.
 *  (2) Transgénico / OGM — ADN recombinante por etapas: el plásmido se abre, el
 *      gen entra, se cierra y el hospedero produce la proteína.
 *  (3) Clonación — transferencia nuclear por etapas: reproductiva (clon) vs
 *      terapéutica (células madre).
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { BIOTECNOLOGIA_FICHA } from "./biotecnologia-ficha";
import {
  type Modo,
  type Reparacion,
  type TipoClon,
  MODOS,
  MODOS_DEF,
  REPARACIONES,
  reparacionPorId,
  resultadoCrispr,
  ETAPAS_CRISPR,
  TRANSGENES,
  transgenPorId,
  ETAPAS_TRANSGEN,
  CLONES,
  clonPorId,
  ETAPAS_CLONACION,
  DESFASE_MAX,
  HEBRA_TOP,
  analizarGuia,
  DEFINICION,
  TITULO_A1,
  PUNTOS_CLAVE,
  HITOS,
  PRINCIPIOS_BIOETICA,
  CASOS_CRITICOS,
  GERMINAL_VS_SOMATICA,
  GLOSARIO,
  HECHOS,
  DATOS,
  PREGUNTAS,
  CONTEXTO,
  FUENTE,
  QUIZ_A2,
} from "./biotecnologia-data";

const BiotecnologiaScene = dynamic(() => import("./BiotecnologiaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-dna fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando la biotecnología en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-biotecnologia-crispr-3d-reto";

/** Botón de opción del panel (tamaño táctil, texto de 14 px). */
function Opcion({ on, col, icono, etq, onClick }: { on: boolean; col: string; icono: string; etq: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{ cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: on ? "#04121f" : "#fff", background: on ? col : `${col}1a`, border: `1px solid ${col}66`, borderRadius: 10, padding: "10px 12px", lineHeight: 1.25 }}>
      <i className={`fa-solid ${icono}`} style={{ color: on ? "#04121f" : col }} aria-hidden />
      <span style={{ minWidth: 0 }}>{etq}</span>
    </button>
  );
}

export function LabBiotecnologia({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("crispr");
  const [reparacion, setReparacion] = useState<Reparacion>("hdr");
  const [cortar, setCortar] = useState<boolean>(false);
  const [desfase, setDesfase] = useState(2); // la guía empieza fuera de lugar: hay que alinearla
  const [etapa, setEtapa] = useState(1);
  const [transgenId, setTransgenId] = useState<string>("insulina");
  const [clonId, setClonId] = useState<TipoClon>("reproductiva");
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  // misiones: banderas que, una vez ganadas, no se pierden al cambiar de modo
  const [hecho, setHecho] = useState({ deslizo: false, intento: false, corto: false, transg: false, clon: false });
  const marca = (k: keyof typeof hecho) => setHecho((h) => (h[k] ? h : { ...h, [k]: true }));
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

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  const repDef = reparacionPorId(reparacion);
  const resCrispr = resultadoCrispr(reparacion);
  const transgen = transgenPorId(transgenId);
  const clon = clonPorId(clonId);
  const guia = analizarGuia(desfase);

  const etapas = modo === "crispr" ? ETAPAS_CRISPR : modo === "transgenico" ? ETAPAS_TRANSGEN : ETAPAS_CLONACION;
  const etapaDef = etapas[Math.min(etapas.length, etapa) - 1]!;

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setEtapa(1);
    setAviso(null);
    if (m === "crispr") setCortar(false);
    if (m === "transgenico") marca("transg");
    if (m === "clonacion") marca("clon");
    setPlaying(true);
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const reiniciar = () => {
    if (modo === "crispr") { setCortar(false); setDesfase(2); }
    setEtapa(1);
    setAviso(null);
    setPlaying(true);
    bump();
  };

  const moverGuia = (v: number) => {
    setDesfase(v);
    setCortar(false); // al mover la guía, el corte anterior deja de aplicar
    setAviso(null);
    marca("deslizo");
  };
  const intentarCorte = () => {
    if (cortar) { setCortar(false); setAviso(null); return; }
    if (guia.corta) {
      setCortar(true);
      setAviso(null);
      marca("corto");
      if (sonido) audioRef.current?.correcto();
    } else {
      marca("intento");
      setAviso(`Cas9 no cortó: solo ${guia.encajan} de ${guia.total} bases de la guía encajan con el ADN. Sin coincidencia total no hay corte, y así no se editan lugares equivocados.`);
    }
    setPlaying(true);
  };

  // lectura breve sobre la escena
  const lectura: string =
    modo === "crispr"
      ? cortar
        ? `${resCrispr.rep.etq}: ${resCrispr.titulo}`
        : guia.corta ? "Guía alineada: Cas9 lista para cortar" : `La guía encaja ${guia.encajan} de ${guia.total}: no corta`
      : modo === "transgenico"
        ? `${etapaDef.etq} — ${transgen.etq}`
        : `${etapaDef.etq} — clonación ${clon.etq.toLowerCase()}`;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {DEFINICION}
      </div>
    </div>
  );

  const rejilla = (min: number): React.CSSProperties => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: 8 });
  const nota = (col: string, children: React.ReactNode) => (
    <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${col}44`, background: `${col}14`, color: "#eaf0fb" }}>{children}</p>
  );
  const sliderEtapa = (
    <Deslizador
      label="Etapa del proceso" icon="fa-list-ol" colr={modoCol}
      valor={`${etapa} de ${etapas.length}`}
      min={1} max={etapas.length} step={1} value={etapa}
      onChange={(v) => { setEtapa(v); setPlaying(true); }}
      hintL={etapas[0]!.etq.replace(/^1 · /, "")} hintR={etapas[etapas.length - 1]!.etq.replace(/^\d · /, "")}
    />
  );

  /* ── Pestaña «Controles», según el modo ────────────────────────────── */
  const controles = (
    <>
      {modo === "crispr" && (
        <>
          <Bloque titulo="Desliza la ARN guía" icono="fa-arrows-left-right">
            <Deslizador
              label="Posición de la guía" icon="fa-dna" colr={modoCol}
              valor={desfase === 0 ? "sobre la diana" : `${desfase > 0 ? "+" : ""}${desfase} bases`}
              min={-DESFASE_MAX} max={DESFASE_MAX} step={1} value={desfase}
              onChange={moverGuia}
              hintL="← izquierda" hintR="derecha →"
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
              <Dato label="Bases que encajan" value={`${guia.encajan} de ${guia.total}`} col={guia.corta ? "#86efac" : "#fca5a5"} />
              <Dato label="PAM (NGG) detrás" value={guia.pam ? "sí" : "no"} col={guia.pam ? "#86efac" : "#fca5a5"} />
            </div>
            {nota(guia.corta ? "#34d399" : "#f87171", guia.corta
              ? "Todas las bases encajan y hay PAM: Cas9 puede cortar 3 pb antes del PAM."
              : "Faltan bases por encajar: la ARN guía en rojo no se aparea. Mueve el deslizador hasta alinearla con la diana.")}
            <button type="button" onClick={intentarCorte}
              style={{ cursor: "pointer", fontSize: 15, fontWeight: 900, color: "#04121f", background: cortar ? "#fca5a5" : "#34d399", border: "none", borderRadius: 10, padding: "12px 14px" }}>
              <i className={`fa-solid ${cortar ? "fa-rotate-left" : "fa-scissors"}`} style={{ marginRight: 9 }} aria-hidden />
              {cortar ? "Reponer la doble cadena" : "Cortar con Cas9"}
            </button>
            {aviso && nota("#f87171", <><i className="fa-solid fa-ban" style={{ color: "#fca5a5", marginRight: 8 }} aria-hidden />{aviso}</>)}
          </Bloque>

          <Bloque titulo="Reparación tras el corte" icono="fa-wrench">
            <div style={rejilla(150)}>
              {REPARACIONES.map((r) => (
                <Opcion key={r.id} on={r.id === reparacion} col={`#${r.color.replace("#", "")}`} icono={r.icono} etq={`${r.etq} · ${r.nombre}`}
                  onClick={() => { setReparacion(r.id); setPlaying(true); bump(); }} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
              <Dato label="Sitio diana" value={cortar ? `${HEBRA_TOP.length} → ${resCrispr.editada.length} pb` : `${HEBRA_TOP.length} pb`} col={cortar ? `#${repDef.color.replace("#", "")}` : undefined} />
              <Dato label="Resultado" value={cortar ? (reparacion === "nhej" ? "knockout" : "edición") : "sin cortar"} col={cortar ? `#${repDef.color.replace("#", "")}` : undefined} />
            </div>
            {nota(modoCol, <><i className={`fa-solid ${repDef.icono}`} style={{ color: `#${repDef.color.replace("#", "")}`, marginRight: 8 }} aria-hidden />{repDef.descripcion}</>)}
            <p style={{ margin: 0, color: T.text2 }}><i className="fa-solid fa-arrow-right-long" style={{ marginRight: 8, color: modoCol }} aria-hidden />{repDef.uso}</p>
          </Bloque>
        </>
      )}

      {modo === "transgenico" && (
        <>
          <Bloque titulo="Recorre el proceso" icono="fa-list-ol">
            {sliderEtapa}
            {nota(modoCol, <><strong>{etapaDef.etq}.</strong> {etapaDef.detalle}</>)}
          </Bloque>
          <Bloque titulo="Organismo transgénico (ADN recombinante)" icono="fa-seedling">
            <div style={rejilla(140)}>
              {TRANSGENES.map((tg) => (
                <Opcion key={tg.id} on={tg.id === transgenId} col={`#${tg.color.replace("#", "")}`} icono={tg.icono} etq={tg.etq}
                  onClick={() => { setTransgenId(tg.id); setPlaying(true); bump(); }} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
              <Dato label="Año" value={transgen.anio} col={`#${transgen.color.replace("#", "")}`} />
              <Dato label="Hospedero" value={transgen.hospedero.split(" (")[0]!} />
            </div>
            <p style={{ margin: 0, color: T.text2 }}>{transgen.descripcion}</p>
            <p style={{ margin: 0, color: T.text2 }}><strong style={{ color: "#eaf0fb" }}>Gen:</strong> {transgen.gen}. <strong style={{ color: "#eaf0fb" }}>Produce:</strong> {transgen.producto}.</p>
            {nota(modoCol, <><i className="fa-solid fa-flask-vial" style={{ color: modoCol, marginRight: 8 }} aria-hidden />{transgen.ejemplo}</>)}
          </Bloque>
        </>
      )}

      {modo === "clonacion" && (
        <>
          <Bloque titulo="Recorre el proceso" icono="fa-list-ol">
            {sliderEtapa}
            {nota(modoCol, <><strong>{etapaDef.etq}.</strong> {etapaDef.detalle}</>)}
          </Bloque>
          <Bloque titulo="Tipo de clonación (transferencia nuclear)" icono="fa-clone">
            <div style={rejilla(150)}>
              {CLONES.map((cl) => (
                <Opcion key={cl.id} on={cl.id === clonId} col={`#${cl.color.replace("#", "")}`} icono={cl.icono} etq={cl.etq}
                  onClick={() => { setClonId(cl.id); setPlaying(true); bump(); }} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
              <Dato label="Se obtiene" value={clon.id === "reproductiva" ? "un clon" : "células madre"} col={`#${clon.color.replace("#", "")}`} />
              <Dato label="¿Se implanta?" value={clon.id === "reproductiva" ? "sí" : "no"} />
            </div>
            <p style={{ margin: 0, color: T.text2 }}>{clon.descripcion}</p>
            {nota(modoCol, <><i className="fa-solid fa-arrow-right-long" style={{ color: modoCol, marginRight: 8 }} aria-hidden />{clon.resultado}</>)}
            {nota("#f87171", <><i className="fa-solid fa-triangle-exclamation" style={{ color: "#fca5a5", marginRight: 8 }} aria-hidden />{GERMINAL_VS_SOMATICA}</>)}
          </Bloque>
        </>
      )}
    </>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <BiotecnologiaScene
            modo={modo}
            resultadoCrispr={resCrispr}
            reparacion={reparacion}
            cortar={cortar}
            desfase={desfase}
            transgen={transgen}
            clon={clon}
            etapa={etapa}
            playing={playing}
            accent={accent}
            modoColor={modoCol}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq, icono: MODOS_DEF[m].icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          {modo === "crispr" && <BotonHerramienta icono="fa-scissors" titulo={cortar ? "Reponer la doble cadena" : "Cortar con Cas9"} activo={cortar} onClick={intentarCorte} />}
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reanudar"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Desliza la ARN guía y mira cuántas bases encajan con el ADN diana", done: hecho.deslizo },
        { txt: "Prueba a cortar con la guía fuera de lugar: Cas9 no debe cortar", done: hecho.intento },
        { txt: "Explora CRISPR-Cas9 (ARN guía, corte y reparación)", done: hecho.corto },
        { txt: "Revisa un organismo transgénico (OGM)", done: hecho.transg },
        { txt: "Distingue clonación reproductiva y terapéutica", done: hecho.clon },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        { id: "controles", etiqueta: "Controles", icono: "fa-sliders", contenido: controles },
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
              playSfx={() => { if (sonido) audioRef.current?.correcto(); }}
              playPick={() => { if (sonido) audioRef.current?.blip(); }}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Biotecnología moderna" icono="fa-dna">
                <p style={{ margin: 0, color: T.text2 }}>{DEFINICION}</p>
              </Bloque>
              <Bloque titulo={`Infografía A1 — ${TITULO_A1}`} icono="fa-circle-info">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PUNTOS_CLAVE.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Para reflexionar (debate ético)" icono="fa-comments">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Principios de la bioética (A1)" icono="fa-scale-balanced">
                {PRINCIPIOS_BIOETICA.map((p, i) => (
                  <p key={i} style={{ margin: 0, padding: "8px 11px", borderRadius: 9, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}`, color: T.text2 }}>
                    <strong style={{ color: accent }}>{p.nombre}. </strong>{p.definicion}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Casos críticos en México y el mundo (A1)" icono="fa-gavel">
                {CASOS_CRITICOS.map((c, i) => (
                  <div key={i} style={{ padding: "11px 13px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                    <div style={{ fontWeight: 900, color: "#fff", marginBottom: 4 }}>
                      <i className={`fa-solid ${c.icono}`} style={{ color: accent, marginRight: 8 }} aria-hidden />{c.titulo}
                    </div>
                    <div style={{ color: T.text2 }}>{c.texto}</div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Etapas de cada técnica" icono="fa-list-ol">
                {[
                  { t: "CRISPR-Cas9", e: ETAPAS_CRISPR },
                  { t: "ADN recombinante", e: ETAPAS_TRANSGEN },
                  { t: "Transferencia nuclear", e: ETAPAS_CLONACION },
                ].map((g) => (
                  <div key={g.t} style={{ display: "grid", gap: 6 }}>
                    <strong style={{ color: accent }}>{g.t}</strong>
                    <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6, color: T.text2 }}>
                      {g.e.map((e, i) => <li key={i}><strong style={{ color: "#fff" }}>{e.etq}.</strong> {e.detalle}</li>)}
                    </ol>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Línea de tiempo (A1)" icono="fa-timeline">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6, color: T.text2 }}>
                  {HITOS.map((h, i) => <li key={i}><strong style={{ color: "#fff", fontFamily: "ui-monospace, monospace" }}>{h.anio}</strong> — {h.texto}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Datos clave" icono="fa-magnifying-glass-chart">
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
              <Bloque titulo="México: la «zona gris» (LANGEBIO, Irapuato)" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>{CONTEXTO}</p>
              </Bloque>
              <Bloque titulo="¿Sabías que? (quizzes A2/A4)" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario (A5)" icono="fa-book">
                {GLOSARIO.map((g, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}`, color: T.text2 }}>
                    <strong style={{ color: accent }}>{g.termino}. </strong>{g.definicion}
                    <div style={{ color: T.text3, marginTop: 4 }}><i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} aria-hidden />{g.ejemplo}</div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={BIOTECNOLOGIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                La infografía A1, las preguntas de reflexión, los principios de bioética, los casos críticos, el glosario A5 (con sus ejemplos) y los hechos de «¿sabías que?» (quizzes A2/A4) son <strong>verbatim</strong> del MCCEMS 2025. El mecanismo de CRISPR-Cas9 (ARN guía, PAM 5′-NGG-3′, corte de Cas9 ~3 pb antes del PAM, reparación NHEJ/HDR), el ADN recombinante y la transferencia nuclear son representaciones <strong>esquemáticas</strong> con biología estándar, no modelos a escala molecular; las bases a cada lado del sitio diana son ilustrativas. La dimensión ética se conserva como <strong>debate</strong>, no como mecanismo manipulable. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
