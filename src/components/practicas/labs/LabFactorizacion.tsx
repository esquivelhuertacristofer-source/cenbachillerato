"use client";

/**
 * Laboratorio 3D — Factorización: el modelo de área.
 * Práctica experimental para PM-II-P03-A2 ("Factorizo polinomios paso a paso").
 *
 * Un trinomio x² + bx + c es el ÁREA de un rectángulo; factorizarlo es hallar
 * sus dos LADOS (x + p) y (x + q). EXPERIMENTO CENTRAL («Armar»): el trinomio
 * pide exactamente b piezas x y c unidades; el alumno mueve p y q y VE si las
 * piezas alcanzan: las que sobran se quedan en un montón, las que faltan se
 * dibujan en rojo, y cuando no sobra ni falta ninguna el contorno se pone verde.
 * Así descubre la relación "suma y producto": b = p + q y c = p·q, y el caso
 * especial del trinomio cuadrado perfecto (p = q → un cuadrado). Un panel reúne
 * las cuatro técnicas de la actividad.
 * Pensamiento Matemático II — Factorización y álgebra aplicada (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { FACTORIZACION_AREA_FICHA } from "./factorizacion-area-ficha";
import { RETO_A2 } from "./factorizacion-area-data";
import {
  ESCENARIOS,
  TECNICAS,
  P_MIN, P_MAX, P_STEP,
  desarrolla,
  formaFactorizada,
  formaDesarrollada,
  type Escenario,
} from "./factorizacion-data";

const FactorizacionScene = dynamic(() => import("./FactorizacionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-table-cells-large fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const TEAL = "#5EE6C5";
const AMBER = "#FFD166";
const ROJO = "#FF6B6B";
const OKC = "#34D399";

const RETO_KEY = "cen-factorizacion-area-reto";

type ModoLab = "armar" | "explorar";

export function LabFactorizacion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<ModoLab>("armar");
  const [escKey, setEscKey] = useState(ESCENARIOS[1]!.key);
  const esc = useMemo<Escenario>(() => ESCENARIOS.find((e) => e.key === escKey) ?? ESCENARIOS[0]!, [escKey]);

  const [p, setP] = useState(1);
  const [q, setQ] = useState(1);
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

  // seguimiento de objetivos
  const [movioLados, setMovioLados] = useState(false);
  const [vioCuadrado, setVioCuadrado] = useState(false);
  const [explorados, setExplorados] = useState<Set<string>>(() => new Set<string>());
  const [armados, setArmados] = useState<Set<string>>(() => new Set<string>());

  const { b, c } = useMemo(() => desarrolla(p, q), [p, q]);
  const esCuadrado = p === q;

  // Trinomio que pide el modo «Armar»: sale del escenario elegido.
  const objetivo = useMemo(() => (modo === "armar" ? desarrolla(esc.p, esc.q) : null), [modo, esc]);
  const dx = objetivo ? b - objetivo.b : 0; // >0 faltan piezas x, <0 sobran
  const du = objetivo ? c - objetivo.c : 0;
  const completo = !!objetivo && dx === 0 && du === 0;

  const revisa = (np: number, nq: number) => {
    if (modo !== "armar" || !objetivo) return;
    if (np + nq === objetivo.b && np * nq === objetivo.c) {
      setArmados((prev) => (prev.has(esc.key) ? prev : new Set(prev).add(esc.key)));
      if (sonido) audioRef.current?.correcto();
    }
  };

  const cambiarP = (np: number) => { setP(np); setMovioLados(true); if (sonido) audioRef.current?.blip(); if (np === q) setVioCuadrado(true); revisa(np, q); };
  const cambiarQ = (nq: number) => { setQ(nq); setMovioLados(true); if (sonido) audioRef.current?.blip(); if (nq === p) setVioCuadrado(true); revisa(p, nq); };

  const cargar = (e: Escenario) => {
    setEscKey(e.key);
    if (modo === "armar") {
      setP(1);
      setQ(1);
    } else {
      setP(e.p);
      setQ(e.q);
      if (e.p === e.q) setVioCuadrado(true);
      setExplorados((prev) => (prev.has(e.key) ? prev : new Set(prev).add(e.key)));
    }
    setResetNonce((n) => n + 1);
  };

  const cambiarModo = (id: string) => {
    const nm = id as ModoLab;
    if (nm === modo) return;
    setModo(nm);
    if (nm === "armar") { setP(1); setQ(1); }
    else { setP(esc.p); setQ(esc.q); setExplorados((prev) => (prev.has(esc.key) ? prev : new Set(prev).add(esc.key))); }
    if (sonido) audioRef.current?.blip();
    setResetNonce((n) => n + 1);
  };

  const reset = () => {
    if (modo === "armar") { setP(1); setQ(1); }
    else { setP(esc.p); setQ(esc.q); }
    setResetNonce((n) => n + 1);
  };

  const objetivos = [
    { txt: "Arma el trinomio objetivo: que no sobre ni falte ninguna pieza", done: armados.size >= 1 },
    { txt: "Mueve los dos lados (p y q) y observa el rectángulo", done: movioLados },
    { txt: "Forma un trinomio cuadrado perfecto (p = q)", done: vioCuadrado },
    { txt: "Comprueba que b = p + q y c = p·q", done: movioLados },
    { txt: "Explora 3 trinomios distintos", done: explorados.size >= 3 || armados.size >= 3 },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${esc.icono}`} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text, ...NUM }}>{`${formaDesarrollada(p, q)} = ${formaFactorizada(p, q)}`}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: el trinomio es el área de un rectángulo de lados{" "}
        <strong>x + {p}</strong> y <strong>x + {q}</strong>.
      </div>
    </div>
  );

  const estadoPiezas = (d: number) => (d === 0 ? "justas" : d > 0 ? `faltan ${d}` : `sobran ${-d}`);

  // Lectura corta sobre la escena (≤ 10 palabras).
  const lectura = objetivo
    ? completo
      ? <>¡Cuadra! {formaDesarrollada(p, q)} = {formaFactorizada(p, q)}</>
      : <>Piezas x: {estadoPiezas(dx)} · unidades: {estadoPiezas(du)}</>
    : <>{formaDesarrollada(p, q)} = {formaFactorizada(p, q)}</>;

  // Frase explicativa (el porqué) para el panel.
  let porque: string;
  if (!objetivo) {
    porque = esCuadrado
      ? `Como p = q = ${p}, los dos lados son iguales: el rectángulo es un CUADRADO y el trinomio es perfecto, (x + ${p})².`
      : `Aquí los lados son distintos (${p} ≠ ${q}): el rectángulo no es cuadrado. Aun así, sus lados ${formaFactorizada(p, q)} son la factorización.`;
  } else if (completo) {
    porque = `Con p = ${p} y q = ${q}: p + q = ${b} piezas x y p·q = ${c} unidades, justo lo que pide el trinomio. Los lados son los factores: ${formaFactorizada(p, q)}.`;
  } else {
    const partes: string[] = [];
    if (dx !== 0) partes.push(`tus lados suman p + q = ${b}, pero el trinomio pide b = ${objetivo.b} (${dx > 0 ? "te pasas de" : "te faltan"} ${Math.abs(dx)} pieza${Math.abs(dx) === 1 ? "" : "s"} x)`);
    if (du !== 0) partes.push(`tu producto es p·q = ${c}, pero pide c = ${objetivo.c} (${du > 0 ? "te pasas de" : "te faltan"} ${Math.abs(du)} unidad${Math.abs(du) === 1 ? "" : "es"})`);
    porque = `Todavía no cuadra: ${partes.join("; ")}. Busca dos números con suma ${objetivo.b} y producto ${objetivo.c}.`;
  }

  const colEstado = completo ? OKC : ROJO;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <FactorizacionScene p={p} q={q} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} objetivo={objetivo} />
        </SceneBoundary>
      }
      modos={{
        opciones: [
          { id: "armar", etiqueta: "Armar", icono: "fa-puzzle-piece" },
          { id: "explorar", etiqueta: "Explorar", icono: "fa-table-cells-large" },
        ],
        valor: modo,
        cambiar: cambiarModo,
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Volver a empezar" onClick={reset} />
        </>
      }
      leyenda={
        objetivo ? (
          <div style={{ display: "grid", gap: 6, width: 190 }}>
            <MedidorPieza etiqueta={`piezas x: ${b} de ${objetivo.b}`} usado={b} pide={objetivo.b} col={TEAL} />
            <MedidorPieza etiqueta={`unidades: ${c} de ${objetivo.c}`} usado={c} pide={objetivo.c} col={AMBER} />
            <div style={{ fontSize: 14, fontWeight: 900, color: colEstado }}>{completo ? "Cuadra: rectángulo completo" : "Aún no cuadra"}</div>
          </div>
        ) : (
          <>
            <LegItem col={accent} txt="1 pieza x²" />
            <LegItem col={TEAL} txt={`${b} piezas x`} />
            <LegItem col={AMBER} txt={`${c} unidades`} />
          </>
        )
      }
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo={modo === "armar" ? `Arma ${formaDesarrollada(esc.p, esc.q)}` : "Los lados del rectángulo"} icono={esc.icono}>
                <Deslizador label="lado ancho · x + p" icon="fa-arrows-left-right" colr={accent} valor={`p = ${p}`} min={P_MIN} max={P_MAX} step={P_STEP} value={p} onChange={cambiarP} />
                <Deslizador label="lado alto · x + q" icon="fa-arrows-up-down" colr={TEAL} valor={`q = ${q}`} min={P_MIN} max={P_MAX} step={P_STEP} value={q} onChange={cambiarQ} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="suma b = p + q" value={String(b)} col={accent} />
                  <Dato label="producto c = p·q" value={String(c)} col={AMBER} />
                  {objetivo && <Dato label="el trinomio pide b" value={String(objetivo.b)} col={TEAL} />}
                  {objetivo && <Dato label="el trinomio pide c" value={String(objetivo.c)} col={AMBER} />}
                </div>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${(objetivo ? colEstado : accent)}55`, background: `${(objetivo ? colEstado : accent)}12` }}>
                  {porque}
                </p>
              </Bloque>

              <Bloque titulo={modo === "armar" ? "Trinomio a armar" : "Trinomios para construir"} icono="fa-list">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                  {ESCENARIOS.map((e) => {
                    const on = e.key === escKey;
                    const hecho = modo === "armar" ? armados.has(e.key) : explorados.has(e.key);
                    return (
                      <button
                        key={e.key}
                        type="button"
                        onClick={() => cargar(e)}
                        style={{
                          cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                          borderRadius: 12, fontSize: 14, fontWeight: 800, color: on ? "#fff" : T.text2,
                          border: `1px solid ${on ? accent : T.line}`, background: on ? `rgba(${color.rgba},0.18)` : T.glass,
                        }}
                      >
                        <i className={`fa-solid ${e.icono}`} style={{ color: on ? accent : T.text3 }} aria-hidden />
                        <span style={{ flex: 1, minWidth: 0, fontFamily: "ui-monospace, monospace" }}>{formaDesarrollada(e.p, e.q)}</span>
                        {hecho && <i className="fa-solid fa-circle-check" style={{ color: OKC }} aria-hidden />}
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
              <Bloque titulo="Por qué funciona" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Multiplicar dos cosas es calcular el <strong style={{ color: T.text }}>área</strong> de un rectángulo cuyos lados son esas cosas. Por eso <strong style={{ color: accent }}>(x + p)(x + q)</strong> es el área de un rectángulo de lados <strong>x + p</strong> y <strong>x + q</strong>, y al partirlo en piezas obtienes <strong style={{ color: T.text }}>x² + (p + q)x + p·q</strong>. <strong>Factorizar es el camino inverso:</strong> tienes el área (el trinomio) y buscas los lados. Por eso conviene hallar dos números cuya <strong style={{ color: accent }}>suma</strong> sea b y cuyo <strong style={{ color: AMBER }}>producto</strong> sea c.
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  La regla de oro para factorizar <strong style={{ color: T.text }}>x² + bx + c</strong>: busca dos números cuya <strong style={{ color: accent }}>suma sea b</strong> y cuyo <strong style={{ color: AMBER }}>producto sea c</strong>. Esos números son p y q, y los factores son <strong style={{ color: TEAL }}>(x + p)(x + q)</strong>.
                </p>
              </Bloque>
              <Bloque titulo="Los trinomios del laboratorio" icono="fa-table-cells">
                <div style={{ display: "grid", gap: 10 }}>
                  {ESCENARIOS.map((e) => (
                    <div key={e.key} style={{ color: T.text2 }}>
                      <strong style={{ color: T.text }}>{e.titulo}.</strong> {e.contexto}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Las 4 técnicas de esta actividad" icono="fa-list-check">
                <div style={{ display: "grid", gap: 9 }}>
                  {TECNICAS.map((t) => (
                    <div key={t.etiqueta} style={{ borderRadius: 11, border: `1px solid ${t.interactivo ? `${accent}55` : T.line}`, background: t.interactivo ? `rgba(${color.rgba},0.08)` : T.glass, padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontWeight: 900, color: accent, ...NUM }}>{t.etiqueta}</span>
                        <span style={{ fontWeight: 800, color: T.text }}>{t.nombre}</span>
                        {t.interactivo && <i className="fa-solid fa-cube" style={{ color: accent, marginLeft: "auto" }} title="Visible en el modelo 3D" aria-label="Visible en el modelo 3D" />}
                      </div>
                      <div style={{ color: T.text2, ...NUM }}>
                        {t.polinomio} = <strong style={{ color: T.text }}>{t.factorizado}</strong>
                      </div>
                      <div style={{ color: T.text3, marginTop: 3 }}>{t.pista}</div>
                    </div>
                  ))}
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  El modelo de área muestra trinomios con términos positivos. Las técnicas <strong style={{ color: T.text }}>(a)</strong> y <strong style={{ color: T.text }}>(b)</strong> y los signos negativos de <strong style={{ color: T.text }}>(d)</strong> se explican aquí.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={FACTORIZACION_AREA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor: piezas que el rectángulo usa vs. las que pide el trinomio ───── */
function MedidorPieza({ etiqueta, usado, pide, col }: { etiqueta: string; usado: number; pide: number; col: string }) {
  const tope = Math.max(usado, pide, 1);
  const ok = usado === pide;
  return (
    <div style={{ display: "grid", gap: 3 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>{etiqueta}</div>
      <div style={{ position: "relative", height: 10, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${(usado / tope) * 100}%`, height: "100%", background: ok ? OKC : usado > pide ? ROJO : col, transition: "width 140ms linear, background 140ms linear" }} />
        <div style={{ position: "absolute", left: `${(pide / tope) * 100}%`, top: 0, bottom: 0, width: 2, background: "#fff" }} />
      </div>
    </div>
  );
}

/* ── Item de leyenda ──────────────────────────────────────────────────────── */
function LegItem({ col, txt }: { col: string; txt: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
      <span style={{ width: 14, height: 14, borderRadius: 4, background: col, flexShrink: 0 }} />
      {txt}
    </div>
  );
}
