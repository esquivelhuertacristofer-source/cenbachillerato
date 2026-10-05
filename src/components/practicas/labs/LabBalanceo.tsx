"use client";

/**
 * Laboratorio 3D — Balanceo de ecuaciones químicas.
 * Práctica experimental para CNEYT-IV-P01-A2 (ejercicio_matematico "Balancea:
 * ejercicio paso a paso con ecuaciones reales"; UAC "Reacciones químicas",
 * progresión 1: Ley de conservación de la masa).
 *
 * El alumno ajusta los COEFICIENTES de cada fórmula (nunca los subíndices) y ve
 * en 3D aparecer/desaparecer copias enteras de cada molécula. Los contadores de
 * átomos por elemento (izquierda vs derecha) se igualan y la flecha se pone
 * verde cuando la ecuación queda balanceada: misma cantidad de cada átomo →
 * la masa se conserva. Las tres ecuaciones son EXACTAMENTE las de la actividad.
 * Conteo y masas: cálculo exacto.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import {
  REACCIONES_BAL, MOLS_B, ELEMS_B, calcBalance, ecuacion, IDEAS, DATOS,
  fmtMasa, fmtInt, COEF_MIN, COEF_MAX, REACCION_DEF,
} from "./balanceo-data";
import { FichaTeorica } from "./_ficha";
import { BALANCEO_FICHA } from "./balanceo-ecuaciones-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./balanceo-ecuaciones-data";
import { LabSfx } from "./lab-audio";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-balanceo-ecuaciones-reto";

const BalanceoScene = dynamic(() => import("./BalanceoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask-vial fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Montando las moléculas…</span>
    </div>
  ),
});

const OK_COL = "#34D399";
const NO_COL = "#FB923C";

const unos = (n: number) => Array.from({ length: n }, () => 1);

export function LabBalanceo({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [idx, setIdx] = useState(REACCION_DEF);
  const r = REACCIONES_BAL[idx]!;

  const [coefR, setCoefR] = useState<number[]>(() => unos(REACCIONES_BAL[REACCION_DEF]!.reactivos.length));
  const [coefP, setCoefP] = useState<number[]>(() => unos(REACCIONES_BAL[REACCION_DEF]!.productos.length));
  const [resolviendo, setResolviendo] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

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

  const bump = () => setResetNonce((n) => n + 1);
  const bal = useMemo(() => calcBalance(r, coefR, coefP), [r, coefR, coefP]);

  // Cambiar de reacción: reinicia coeficientes a 1 (el reto auténtico parte
  // desbalanceado) y detiene cualquier animación.
  const elegirReaccion = (i: number) => {
    if (sonido) audioRef.current?.blip();
    setResolviendo(false);
    setIdx(i);
    setCoefR(unos(REACCIONES_BAL[i]!.reactivos.length));
    setCoefP(unos(REACCIONES_BAL[i]!.productos.length));
    bump();
  };

  const reiniciar = () => {
    setResolviendo(false);
    setCoefR(unos(r.reactivos.length));
    setCoefP(unos(r.productos.length));
    bump();
  };

  const resolver = () => {
    if (bal.balanceada && bal.minima) return;
    setResolviendo(true);
  };

  // Animación "Resolver": cada tick acerca un paso cada coeficiente a su valor
  // de la solución (método de tanteo visto en cámara lenta). setInterval dentro
  // de useEffect es seguro con React Compiler (no es render ni useFrame).
  useEffect(() => {
    if (!resolviendo) return;
    const id = setInterval(() => {
      let listo = true;
      setCoefR((prev) => prev.map((c, i) => {
        const meta = r.solR[i] ?? c;
        if (c === meta) return c;
        listo = false;
        return c < meta ? c + 1 : c - 1;
      }));
      setCoefP((prev) => prev.map((c, i) => {
        const meta = r.solP[i] ?? c;
        if (c === meta) return c;
        listo = false;
        return c < meta ? c + 1 : c - 1;
      }));
      if (listo) setResolviendo(false);
    }, 440);
    return () => clearInterval(id);
  }, [resolviendo, r]);

  const setCoefAbs = (lado: "R" | "P", i: number, valor: number) => {
    setResolviendo(false);
    const v = Math.max(COEF_MIN, Math.min(COEF_MAX, Math.round(valor)));
    if (lado === "R") setCoefR((prev) => prev.map((c, j) => (j === i ? v : c)));
    else setCoefP((prev) => prev.map((c, j) => (j === i ? v : c)));
  };

  const estadoCol = bal.balanceada ? OK_COL : NO_COL;
  const estadoTxt = bal.balanceada
    ? (bal.minima ? "¡Balanceada! (mínima expresión)" : "Balanceada (se puede simplificar)")
    : "Aún desbalanceada";

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-flask-vial" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Balancea la ecuación</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: {ecuacion(r, coefR, coefP)} — {estadoTxt.toLowerCase()}.
      </div>
    </div>
  );

  const lecturaCorta = bal.balanceada
    ? <>Balanceada: {fmtInt(bal.totalAtomosIzq)} átomos a cada lado</>
    : <>Desbalanceada: {fmtInt(bal.totalAtomosIzq)} átomos contra {fmtInt(bal.totalAtomosDer)}</>;

  const bloqueada = bal.balanceada && bal.minima;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <BalanceoScene
            reaccionKey={r.key}
            reactivos={r.reactivos}
            productos={r.productos}
            coefReact={coefR}
            coefProd={coefP}
            balanceada={bal.balanceada}
            accent={accent}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: REACCIONES_BAL.map((rr) => ({ id: rr.key, etiqueta: rr.nombre, icono: "fa-vial" })),
        valor: r.key,
        cambiar: (id) => elegirReaccion(Math.max(0, REACCIONES_BAL.findIndex((rr) => rr.key === id))),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={resolviendo ? "fa-spinner fa-spin" : "fa-wand-magic-sparkles"} titulo="Resolver paso a paso" activo={resolviendo} onClick={resolver} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((vv) => !vv)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar (todos a 1)" onClick={reiniciar} />
        </>
      }
      leyenda={
        <>
          {bal.filas.map((f) => (
            <LegItem key={f.el} col={ELEMS_B[f.el].color} txt={`${f.el} ${ELEMS_B[f.el].nombre}`} />
          ))}
        </>
      }
      lectura={lecturaCorta}
      objetivos={[
        { txt: "Balancea la ecuación de H₂ + O₂ → H₂O", done: bal.balanceada && idx === 0 },
        { txt: "Balancea la combustión CH₄ + O₂ → CO₂ + H₂O", done: bal.balanceada && idx === 1 },
        { txt: "Balancea la herrumbre Fe + O₂ → Fe₂O₃", done: bal.balanceada && idx === 2 },
        { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Coeficientes (los subíndices no se tocan)" icono="fa-flask-vial">
                <div style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${estadoCol}55`, background: `${estadoCol}12`, fontFamily: "ui-monospace, monospace", fontWeight: 900, color: "#fff", overflowWrap: "anywhere" }}>
                  {ecuacion(r, coefR, coefP)}
                </div>
                {r.reactivos.map((s, i) => (
                  <Deslizador key={`R${i}`} label={`${MOLS_B[s.mol]!.formula} (${MOLS_B[s.mol]!.nombre})`} icon="fa-circle-dot" colr={accent} valor={String(coefR[i] ?? 1)}
                    min={COEF_MIN} max={COEF_MAX} step={1} value={coefR[i] ?? 1} onChange={(v) => setCoefAbs("R", i, v)} />
                ))}
                {r.productos.map((s, i) => (
                  <Deslizador key={`P${i}`} label={`${MOLS_B[s.mol]!.formula} (${MOLS_B[s.mol]!.nombre})`} icon="fa-circle-dot" colr="#a78bfa" valor={String(coefP[i] ?? 1)}
                    min={COEF_MIN} max={COEF_MAX} step={1} value={coefP[i] ?? 1} onChange={(v) => setCoefAbs("P", i, v)} />
                ))}
                <button type="button" onClick={resolver} disabled={bloqueada}
                  style={{ cursor: bloqueada ? "default" : "pointer", padding: "12px 14px", borderRadius: 12, border: "none", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: bloqueada ? "rgba(255,255,255,0.06)" : accent, color: bloqueada ? T.text3 : "#04121f" }}>
                  <i className={`fa-solid ${resolviendo ? "fa-spinner fa-spin" : "fa-wand-magic-sparkles"}`} aria-hidden />
                  {bloqueada ? "Ya está balanceada" : resolviendo ? "Balanceando…" : "Resolver paso a paso"}
                </button>
              </Bloque>

              <Bloque titulo="Átomos de cada elemento" icono="fa-scale-balanced">
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto auto", gap: "0 14px", alignItems: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>ELEMENTO</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text3, textAlign: "center" }}>IZQ</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text3, textAlign: "center" }}>DER</div>
                  <div style={{ width: 18 }} />
                  {bal.filas.map((f) => (
                    <FilaBalance key={f.el} el={f.el} izq={f.izq} der={f.der} ok={f.ok} />
                  ))}
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  {bal.balanceada
                    ? <>Cada elemento tiene <strong style={{ color: OK_COL }}>el mismo número de átomos</strong> a ambos lados: la <strong>masa se conserva</strong>.{!bal.minima && " Se puede dividir entre un factor común."}</>
                    : <>Sube o baja coeficientes hasta que <strong style={{ color: NO_COL }}>cada fila</strong> iguale IZQ y DER.</>}
                </p>
              </Bloque>

              <Bloque titulo="Lecturas" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="átomos izq" value={fmtInt(bal.totalAtomosIzq)} col={accent} />
                  <Dato label="átomos der" value={fmtInt(bal.totalAtomosDer)} col={estadoCol} />
                  <Dato label="moléculas" value={`${fmtInt(bal.nMolIzq)} → ${fmtInt(bal.nMolDer)}`} col="#bfe8ff" />
                  <Dato label="estado" value={bal.balanceada ? "✓" : "✗"} col={estadoCol} />
                  <Dato label="masa reactivos" value={fmtMasa(bal.masaIzq)} />
                  <Dato label="masa productos" value={fmtMasa(bal.masaDer)} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  {bal.balanceada
                    ? <>La masa total <strong style={{ color: OK_COL }}>coincide</strong>: lo que entra como reactivos sale como productos (Lavoisier).</>
                    : <>Mientras no esté balanceada, las masas <strong style={{ color: NO_COL }}>no cuadran</strong>: faltan o sobran átomos.</>}
                </p>
              </Bloque>

              <Bloque titulo="Pista: cómo balancear esta" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>{r.descripcion}</p>
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
              <Bloque titulo="Dónde ocurre esta reacción" icono="fa-vial">
                <p style={{ margin: 0, color: T.text2 }}>{r.contexto}</p>
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
                <FichaTeorica data={BALANCEO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Conteo de átomos y masas: <strong>cálculo exacto</strong> a partir de las fórmulas y masas atómicas (u). Las moléculas se dibujan como modelos de <strong>bolas y barras a escala fija</strong> (las geometrías son representaciones didácticas, no las distancias de enlace reales), pero el número de átomos, la condición de balance y la igualdad de masas son siempre los valores exactos.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Item de leyenda (visor) ──────────────────────────────────────────────── */
function LegItem({ col, txt }: { col: string; txt: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
      <span style={{ width: 12, height: 12, borderRadius: "50%", background: col, border: "1px solid rgba(255,255,255,0.35)", flexShrink: 0 }} />
      {txt}
    </div>
  );
}

/* ── Fila de la tabla de balance por elemento ────────────────────────────── */
function FilaBalance({ el, izq, der, ok }: { el: string; izq: number; der: number; ok: boolean }) {
  const elColor = ELEMS_B[el as keyof typeof ELEMS_B].color;
  const nombre = ELEMS_B[el as keyof typeof ELEMS_B].nombre;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", minWidth: 0 }}>
        <span style={{ width: 16, height: 16, borderRadius: "50%", background: elColor, border: "1px solid rgba(255,255,255,0.35)", flexShrink: 0 }} />
        <span style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{el}</span>
        <span style={{ fontSize: 14, color: T.text3 }}>{nombre}</span>
      </div>
      <div style={{ textAlign: "center", fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{izq}</div>
      <div style={{ textAlign: "center", fontSize: 16, fontWeight: 900, color: ok ? OK_COL : NO_COL, fontFamily: "ui-monospace, monospace" }}>{der}</div>
      <div style={{ textAlign: "center", width: 18 }}>
        <i className={`fa-solid ${ok ? "fa-check" : "fa-xmark"}`} style={{ color: ok ? OK_COL : NO_COL, fontSize: 14 }} />
      </div>
    </>
  );
}
