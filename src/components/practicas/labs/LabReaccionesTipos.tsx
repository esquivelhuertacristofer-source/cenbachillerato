"use client";

/**
 * Laboratorio 3D — Clasificador de tipos de reacciones químicas.
 * Práctica experimental para CNEYT-IV-P02-A1 (infografía "Tipos de reacciones
 * químicas: de la síntesis a la combustión"; UAC "Reacciones químicas",
 * progresión 2: "Clasifica los tipos de reacciones químicas y predice sus
 * productos").
 *
 * El alumno elige uno de los CINCO tipos de reacción (síntesis, descomposición,
 * desplazamiento simple, doble desplazamiento, combustión) y una reacción
 * representativa, y la reproduce: los MISMOS átomos viajan de los reactivos a los
 * productos mientras unos enlaces se rompen y otros se forman. El panel de
 * conservación muestra que el conteo de átomos por elemento es idéntico antes y
 * después (ley de conservación de la masa, Lavoisier). Las ecuaciones son
 * exactas y están balanceadas; las geometrías son representaciones didácticas.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import {
  TIPOS, ELEMS, reaccion, tipoInfo, reaccionesDe, conteo, faseDe,
  IDEAS, DATOS, RETO, REACCION_DEF, type TipoId,
} from "./reacciones-tipos-data";
import { FichaTeorica } from "./_ficha";
import { REACCIONES_TIPOS_FICHA } from "./tipos-reacciones-quimicas-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./tipos-reacciones-quimicas-data";
import { LabSfx } from "./lab-audio";
import { VinetaTermino } from "./_vineta";

const ReaccionesTiposScene = dynamic(() => import("./ReaccionesTiposScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-atom fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando la reacción…</span>
    </div>
  ),
});

const RETO_KEY = "cen-tipos-reacciones-quimicas-reto";

export function LabReaccionesTipos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [reaccId, setReaccId] = useState(REACCION_DEF);
  const [progreso, setProgreso] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [girar, setGirar] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
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

  const r = useMemo(() => reaccion(reaccId), [reaccId]);
  const tipo = useMemo(() => tipoInfo(r.tipo), [r.tipo]);
  const conteos = useMemo(() => conteo(r), [r]);
  const tc = tipo.color;
  const fase = faseDe(progreso);

  // reproducir: avanza el progreso 0→1 con setInterval (permitido en useEffect).
  // Al llegar a 1 se detiene desde el propio callback del intervalo —no en el
  // cuerpo del efecto— para no disparar setState dentro del efecto.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgreso((p) => {
        const next = Math.min(1, p + 0.018);
        if (next >= 1) setPlaying(false);
        return next;
      });
    }, 28);
    return () => clearInterval(id);
  }, [playing]);

  const togglePlay = () => {
    if (playing) { setPlaying(false); return; }
    if (progreso >= 1) setProgreso(0);
    setPlaying(true);
  };
  const elegirReaccion = (id: string) => {
    setReaccId(id);
    setProgreso(0);
    setPlaying(false);
    if (sonido) audioRef.current?.blip();
  };
  const elegirTipo = (id: TipoId) => {
    const lista = reaccionesDe(id);
    if (lista.length > 0) elegirReaccion(lista[0]!.id);
  };
  const reiniciar = () => { setProgreso(0); setPlaying(false); setResetNonce((n) => n + 1); };

  const objetivos = [
    { txt: "Lleva el avance a la mitad: los enlaces grises se rompen y los verdes aparecen", done: progreso > 0.4 && progreso < 0.6 },
    { txt: "Explora los 5 tipos de reacción", done: TIPOS.every((tp) => reaccionesDe(tp.id).length > 0) },
    { txt: "Reproduce una reacción completa (llega al 100%)", done: progreso >= 1 },
    { txt: "Observa la conservación de la masa (Lavoisier)", done: progreso > 0.5 },
    { txt: "Aprueba el cuestionario de la actividad A2", done: ejercicioAprobado },
  ];
  const faseLabel = fase === "reactivos" ? "REACTIVOS" : fase === "productos" ? "PRODUCTOS" : "REACCIONANDO";
  const faseColor = fase === "reactivos" ? "#9DB4CE" : fase === "productos" ? "#7DF0C0" : tc;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: tc, boxShadow: `0 10px 30px -6px ${tc}` }}>
        <i className={`fa-solid ${tipo.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text, fontFamily: "ui-monospace, monospace" }}>{r.ecuacion}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: es una reacción de {tipo.label.toLowerCase()} ({tipo.patron}).
      </div>
    </div>
  );

  // Crossfade de enlaces (misma ventana que la escena): cuántos enlaces siguen y cuántos ya existen.
  const rOp = progreso < 0.3 ? 1 : progreso > 0.7 ? 0 : 1 - (progreso - 0.3) / 0.4;
  const pOp = progreso < 0.3 ? 0 : progreso > 0.7 ? 1 : (progreso - 0.3) / 0.4;
  const enlacesViejos = Math.round(r.rbonds.length * rOp);
  const enlacesNuevos = Math.round(r.pbonds.length * pOp);

  const lecturaCorta = fase === "reactivos"
    ? <>Reactivos: {r.reactivos}. Mueve el avance.</>
    : fase === "productos"
      ? <>Productos: {r.productos}. {r.atoms.length} átomos, ninguno nuevo.</>
      : <>Enlaces viejos {enlacesViejos}/{r.rbonds.length} · nuevos {enlacesNuevos}/{r.pbonds.length}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <ReaccionesTiposScene
            reaccionId={r.id}
            atoms={r.atoms}
            rbonds={r.rbonds}
            pbonds={r.pbonds}
            reactivos={r.reactivos}
            productos={r.productos}
            progreso={progreso}
            accent={accent}
            girar={girar}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: TIPOS.map((tp) => ({ id: tp.id, etiqueta: tp.label, icono: tp.icono })),
        valor: r.tipo,
        cambiar: (id) => elegirTipo(id as TipoId),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo="Reproducir la reacción" activo={playing} onClick={togglePlay} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar el modelo" activo={girar} onClick={() => setGirar((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      leyenda={<MedidorEnlaces viejos={enlacesViejos} totalViejos={r.rbonds.length} nuevos={enlacesNuevos} totalNuevos={r.pbonds.length} compacto />}
      lectura={lecturaCorta}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="El experimento: avanza la reacción" icono="fa-arrow-right-long">
                <MedidorEnlaces viejos={enlacesViejos} totalViejos={r.rbonds.length} nuevos={enlacesNuevos} totalNuevos={r.pbonds.length} />
                <Deslizador
                  label={`avance (${faseLabel.toLowerCase()})`}
                  icon="fa-arrow-right-long"
                  colr={faseColor === "#9DB4CE" ? tc : faseColor}
                  valor={`${Math.round(progreso * 100)}%`}
                  min={0}
                  max={1}
                  step={0.01}
                  value={progreso}
                  hintL={r.reactivos}
                  hintR={r.productos}
                  onChange={(v) => { setPlaying(false); setProgreso(v); }}
                />
                <p style={{ margin: 0, color: T.text2 }}>
                  Los mismos {r.atoms.length} átomos viajan de un lado al otro: los enlaces grises se rompen y los verdes se forman.
                </p>
              </Bloque>

              <Bloque titulo="Reacciones de este tipo" icono="fa-shapes">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {reaccionesDe(r.tipo).map((rr) => (
                    <button
                      key={rr.id}
                      type="button"
                      onClick={() => elegirReaccion(rr.id)}
                      title={rr.nombre}
                      style={{ cursor: "pointer", padding: "9px 14px", borderRadius: 999, border: `1px solid ${rr.id === reaccId ? tc : T.line}`, background: rr.id === reaccId ? `color-mix(in srgb, ${tc} 18%, transparent)` : T.inset, color: rr.id === reaccId ? "#fff" : T.text2, fontSize: 14, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}
                    >
                      {rr.ecuacion}
                    </button>
                  ))}
                </div>
              </Bloque>

              <Bloque titulo="Conservación de la masa" icono="fa-scale-balanced">
                <p style={{ margin: 0, color: T.text2 }}>
                  Los <strong style={{ color: "#fff" }}>mismos átomos</strong> están antes y después: solo se reorganizan. Por eso el conteo por elemento es idéntico (Lavoisier).
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {conteos.map((c) => (
                    <Dato key={c.el} label={ELEMS[c.el].nombre} value={`${c.el} ×${c.n}`} col={ELEMS[c.el].color} />
                  ))}
                  <Dato label="átomos antes / después" value={`${r.atoms.length} = ${r.atoms.length}`} col={accent} />
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
              playSfx={
                sonido
                  ? (ok) => {
                      if (ok) audioRef.current?.correcto();
                      else audioRef.current?.incorrecto();
                    }
                  : undefined
              }
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
              <Bloque titulo={`Esta reacción: ${r.nombre}`} icono={tipo.icono}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <VinetaTermino termino={tipo.label} color={tc} icono={tipo.icono} tam={34} radio={9} />
                  <div>
                    <div style={{ fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{r.ecuacion}</div>
                    <div style={{ color: tc, fontWeight: 800 }}>{tipo.label} · {tipo.patron}</div>
                  </div>
                </div>
                <p style={{ margin: 0, color: T.text2 }}>{r.contexto}</p>
              </Bloque>
              <Bloque titulo={`¿Qué es una reacción de ${tipo.label.toLowerCase()}?`} icono={tipo.icono}>
                <p style={{ margin: 0, color: T.text2 }}>{tipo.definicion}</p>
              </Bloque>
              <Bloque titulo="Reto: predice los productos" icono="fa-wand-magic-sparkles">
                <p style={{ margin: 0, color: T.text2 }}>{RETO.intro}</p>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: 7 }}>
                  {RETO.items.map((it, i) => (
                    <li key={i} style={{ color: "#fff", fontWeight: 700, fontFamily: "ui-monospace, monospace", padding: "8px 12px", borderRadius: 9, background: T.inset, border: `1px solid ${T.line}` }}>{it}</li>
                  ))}
                </ul>
                <p style={{ margin: 0, color: T.text3 }}>Pista: identifica primero el TIPO (el patrón) y luego reorganiza los átomos.</p>
              </Bloque>
              <Bloque titulo="Lo esencial de las reacciones" icono="fa-flask-vial">
                {DATOS.map((dd, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${dd.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                    <div>
                      <strong style={{ color: "#fff" }}>{dd.valor}</strong>
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
                <FichaTeorica data={REACCIONES_TIPOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Las <strong>ecuaciones químicas son exactas y están balanceadas</strong>, y el conteo de átomos por elemento es real (igual en reactivos y productos). El movimiento de los átomos y las distancias entre ellos son una representación <strong>didáctica</strong> de bolas y barras: sirven para ver cómo se rompen y se forman enlaces, no son las geometrías ni las trayectorias reales. Reacciones tomadas de la progresión 2 (CNEYT-IV).
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor: enlaces que se rompen vs. enlaces que se forman ─────────── */
function MedidorEnlaces({ viejos, totalViejos, nuevos, totalNuevos, compacto = false }: { viejos: number; totalViejos: number; nuevos: number; totalNuevos: number; compacto?: boolean }) {
  const barra = (txt: string, val: number, total: number, c: string) => (
    <div style={{ display: "grid", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: compacto ? 13 : 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>{txt}</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{val}/{total}</span>
      </div>
      <div style={{ height: compacto ? 8 : 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${total > 0 ? (val / total) * 100 : 0}%`, height: "100%", background: c, transition: "width 120ms linear" }} />
      </div>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: compacto ? 6 : 10, width: compacto ? 176 : undefined, marginTop: compacto ? 4 : 0 }}>
      {barra("enlaces de reactivos", viejos, totalViejos, "#C4CDD8")}
      {barra("enlaces de productos", nuevos, totalNuevos, "#7DF0C0")}
    </div>
  );
}
