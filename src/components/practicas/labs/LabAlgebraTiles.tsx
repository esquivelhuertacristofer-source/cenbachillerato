"use client";

/**
 * Laboratorio 3D — Álgebra con mosaicos (algebra tiles).
 * Pensamiento Matemático II («Introducción al álgebra»).
 *
 * UN mismo visor sirve a tres propósitos formativos; cada slug entra con su modo:
 *   • P01 «lenguaje»     — traduce una frase verbal a una expresión y la evalúa.
 *   • P02 «clasificacion» — cuenta términos: monomio / binomio / trinomio / polinomio.
 *   • P03 «operaciones»  — multiplica binomios con el modelo de área de mosaicos.
 *
 * Contenido VERBATIM del Modelo MCCEMS 2025 (anclas PM-II-P01/P02, A1 y A2).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { EppGate, type EppItem } from "./_epp-gate";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { ALGEBRA_TILES_FICHA } from "./algebra-tiles-ficha";
import {
  VARIANTES,
  IDEAS,
  GLOSARIO,
  CONTEXTO,
  FUENTE,
  OBJETIVOS,
  FRASES,
  EXPRESIONES,
  PRODUCTOS_PRESET,
  SEMEJANTES,
  CLASE_DESC,
  clasifica,
  evalTerminos,
  productoBinomios,
  RETO_POR_VARIANTE,
  type Variante,
} from "./algebra-tiles-data";

const AlgebraTilesScene = dynamic(() => import("./AlgebraTilesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-shapes fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const AZUL = "#5fb0ff";
const VERDE = "#34D399";
const ORO = "#ffd24a";

// Pilar EQUIPARSE: la "mesa" del álgebra con mosaicos (3 correctos + 3 distractores).
const INSTRUMENTOS: EppItem[] = [
  { key: "mosaicos", nombre: "Mosaicos algebraicos", icono: "fa-shapes", ok: true, nota: "Piezas x², x y unidad que representan cada término." },
  { key: "tablero", nombre: "Tablero de trabajo", icono: "fa-table-cells", ok: true, nota: "Donde se acomodan y agrupan los mosaicos." },
  { key: "marcadores", nombre: "Marcadores de color", icono: "fa-palette", ok: true, nota: "Distinguen los términos positivos de los negativos." },
  { key: "probeta", nombre: "Probeta", icono: "fa-flask", ok: false, nota: "Mide volúmenes de líquido; aquí no se usa." },
  { key: "iman", nombre: "Imán", icono: "fa-magnet", ok: false, nota: "Mide campos magnéticos; no interviene en álgebra." },
  { key: "termo", nombre: "Termómetro", icono: "fa-temperature-half", ok: false, nota: "Mide temperatura; no aporta a operar expresiones." },
];

function LabAlgebraTilesBase({ color, varianteInicial }: PracticaLabProps & { varianteInicial: Variante }) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Variante>(varianteInicial);
  const [fraseIdx, setFraseIdx] = useState(0);
  const [xValue, setXValue] = useState(3);
  const [exprIdx, setExprIdx] = useState(0);
  const [ab, setAb] = useState<{ a: number; b: number }>({ a: 3, b: -2 });

  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioLenguaje, setVioLenguaje] = useState(varianteInicial === "lenguaje");
  const [vioClasificacion, setVioClasificacion] = useState(varianteInicial === "clasificacion");
  const [vioOperaciones, setVioOperaciones] = useState(varianteInicial === "operaciones");
  const [evaluo, setEvaluo] = useState(false);

  const [eppListo, setEppListo] = useState(false);
  const [aprobados, setAprobados] = useState<Record<Variante, boolean>>({ lenguaje: false, clasificacion: false, operaciones: false });
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

  const marcarVisto = useCallback((m: Variante) => {
    if (m === "lenguaje") setVioLenguaje(true);
    else if (m === "clasificacion") setVioClasificacion(true);
    else setVioOperaciones(true);
  }, []);

  const elegirModo = (m: Variante) => {
    setModo(m);
    marcarVisto(m);
    if (sonido) audioRef.current?.blip();
  };

  const reset = () => {
    setFraseIdx(0);
    setExprIdx(0);
    setAb({ a: 3, b: -2 });
    setXValue(3);
    setResetNonce((k) => k + 1);
  };

  const frase = FRASES[fraseIdx]!;
  const expr = EXPRESIONES[exprIdx]!;
  const prod = useMemo(() => productoBinomios(ab.a, ab.b), [ab]);
  const valorFrase = useMemo(() => evalTerminos(frase.terminos, xValue), [frase, xValue]);

  const modoActual = VARIANTES.find((v) => v.id === modo) ?? VARIANTES[0]!;
  const retoActual = RETO_POR_VARIANTE[modo];
  const maxFrase = evalTerminos(frase.terminos, 10);

  // props para la escena según el modo
  const sceneProps = useMemo(() => {
    if (modo === "lenguaje") return { terminos: frase.terminos, exprLabel: frase.expresion, claseLabel: undefined, a: 0, b: 0, expandLabel: "" };
    if (modo === "clasificacion") return { terminos: expr.terminos, exprLabel: expr.expresion, claseLabel: `${clasifica(expr.terminos.length)} · grado ${expr.grado}`, a: 0, b: 0, expandLabel: "" };
    return { terminos: [], exprLabel: prod.ecuacion, claseLabel: undefined, a: ab.a, b: ab.b, expandLabel: prod.expandido };
  }, [modo, frase, expr, prod, ab]);

  const objetivos = [
    { txt: "Equípate con la mesa de álgebra con mosaicos", done: eppListo },
    { txt: "Sube x hasta 8 o más y mira cómo crecen las tiras y los cuadrados, pero no el 1", done: evaluo && xValue >= 8 },
    { txt: "Traduce una frase al lenguaje algebraico", done: vioLenguaje },
    { txt: "Clasifica una expresión (monomio…polinomio)", done: vioClasificacion },
    { txt: "Multiplica binomios con el modelo de área", done: vioOperaciones },
    { txt: "Evalúa una expresión para un valor de x", done: evaluo, modo: "lenguaje" },
    { txt: "Resuelve el reto evaluable", done: aprobados.lenguaje || aprobados.clasificacion || aprobados.operaciones },
  ];
  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-shapes" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Álgebra con mosaicos</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 400, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: cada término del álgebra es una pieza geométrica. x² es un cuadrado de lado x, x es una tira y la unidad es un cuadrito. Con ellos se traduce el lenguaje, se clasifican expresiones y se multiplican binomios como áreas: (x + 3)(x − 2) = x² + x − 6.
      </div>
    </div>
  );

  const valorTxt = Number.isInteger(valorFrase) ? `${valorFrase}` : valorFrase.toFixed(2);
  const lecturaCorta = modo === "lenguaje"
    ? <>x = {xValue} → {frase.expresion} = {valorTxt}</>
    : modo === "clasificacion"
      ? <>{expr.expresion}: {clasifica(expr.terminos.length)}, grado {expr.grado}</>
      : <>{prod.ecuacion} = {prod.expandido}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <>
          <SceneBoundary fallback={sceneFallback}>
            <AlgebraTilesScene
              modo={modo}
              terminos={sceneProps.terminos}
              exprLabel={sceneProps.exprLabel}
              claseLabel={sceneProps.claseLabel}
              a={sceneProps.a}
              b={sceneProps.b}
              expandLabel={sceneProps.expandLabel}
              xValor={xValue}
              accent={accent}
              pausado={pausado}
              autoRotate={autoRotate}
              resetNonce={resetNonce}
            />
          </SceneBoundary>
          {!eppListo && (
            <EppGate
              accent={accent}
              rgba={color.rgba}
              items={INSTRUMENTOS}
              titulo="Prepara tu mesa de álgebra con mosaicos"
              subtitulo="Antes de operar con expresiones, equípate con lo correcto"
              intro={`Para representar cada término como una pieza geométrica y agruparlos necesitas el material adecuado. Selecciona solo las ${INSTRUMENTOS.filter((i) => i.ok).length} piezas que sirven (deja fuera lo que mide otra cosa).`}
              verbo="modelado algebraico"
              onEntrar={() => {
                setEppListo(true);
                if (sonido) audioRef.current?.blip();
              }}
            />
          )}
        </>
      }
      modos={{
        opciones: VARIANTES.map((v) => ({ id: v.id, etiqueta: v.nombre, icono: v.icon })),
        valor: modo,
        cambiar: (id) => elegirModo(id as Variante),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar" : "Pausar"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <span className="atl-tilekey"><span className="atl-swatch" style={{ background: AZUL }} /> x²</span>
          <span className="atl-tilekey"><span className="atl-swatch" style={{ background: VERDE }} /> x</span>
          <span className="atl-tilekey"><span className="atl-swatch" style={{ background: ORO }} /> 1</span>
          <span className="atl-tilekey"><span className="atl-swatch" style={{ background: "#f0667d" }} /> negativo</span>
          {modo === "lenguaje" && <MedidorValor valor={valorFrase} max={maxFrase} x={xValue} compacto />}
          <style>{`.atl-tilekey{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:800;color:#dce6f5}.atl-swatch{width:14px;height:14px;border-radius:4px;display:inline-block}`}</style>
        </>
      }
      lectura={lecturaCorta}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo={modoActual.nombre} icono={modoActual.icon}>
                <p style={{ margin: 0, color: T.text2 }}>{modoActual.desc}</p>

                {modo === "lenguaje" && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 8 }}>
                      {FRASES.map((f, i) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => { setFraseIdx(i); if (sonido) audioRef.current?.blip(); }}
                          style={{ cursor: "pointer", textAlign: "left", display: "grid", gap: 2, padding: "10px 12px", borderRadius: 11, border: `1px solid ${fraseIdx === i ? accent : T.line}`, background: fraseIdx === i ? `rgba(${color.rgba},0.14)` : T.inset, color: T.text2, fontSize: 14 }}
                        >
                          <span>{f.frase}</span>
                          <span style={{ fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{f.expresion}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {modo === "clasificacion" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 8 }}>
                    {EXPRESIONES.map((ex, i) => {
                      const c = clasifica(ex.terminos.length);
                      return (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => { setExprIdx(i); if (sonido) audioRef.current?.blip(); }}
                          style={{ cursor: "pointer", textAlign: "left", display: "grid", gap: 2, padding: "10px 12px", borderRadius: 11, border: `1px solid ${exprIdx === i ? accent : T.line}`, background: exprIdx === i ? `rgba(${color.rgba},0.14)` : T.inset, color: T.text2, fontSize: 14 }}
                        >
                          <span style={{ fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{ex.expresion}</span>
                          <span>{c} · {ex.terminos.length} {ex.terminos.length === 1 ? "término" : "términos"} · grado {ex.grado}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {modo === "operaciones" && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                      {PRODUCTOS_PRESET.map((p) => {
                        const on = ab.a === p.a && ab.b === p.b;
                        return (
                          <button
                            key={p.etiqueta}
                            type="button"
                            onClick={() => { setAb({ a: p.a, b: p.b }); if (sonido) audioRef.current?.blip(); }}
                            style={{ cursor: "pointer", textAlign: "left", padding: "10px 12px", borderRadius: 11, border: `1px solid ${on ? accent : T.line}`, background: on ? `rgba(${color.rgba},0.14)` : T.inset, color: accent, fontSize: 14, fontWeight: 900, fontFamily: "ui-monospace, monospace" }}
                          >
                            {p.etiqueta}
                          </button>
                        );
                      })}
                    </div>
                    <Deslizador label="a (en x + a)" icon="fa-plus-minus" colr={VERDE} valor={ab.a >= 0 ? `+${ab.a}` : `${ab.a}`} min={-4} max={4} step={1} value={ab.a} onChange={(v) => setAb((s) => ({ ...s, a: v }))} />
                    <Deslizador label="b (en x + b)" icon="fa-plus-minus" colr={ORO} valor={ab.b >= 0 ? `+${ab.b}` : `${ab.b}`} min={-4} max={4} step={1} value={ab.b} onChange={(v) => setAb((s) => ({ ...s, b: v }))} />
                  </>
                )}
              </Bloque>

              {modo === "lenguaje" && (
                <Bloque titulo="El experimento: ¿cuánto vale x?" icono="fa-ruler-horizontal">
                  <MedidorValor valor={valorFrase} max={maxFrase} x={xValue} />
                  <Deslizador
                    label="valor de x"
                    icon="fa-x"
                    colr={VERDE}
                    valor={`${xValue}`}
                    min={1}
                    max={10}
                    step={1}
                    value={xValue}
                    hintL="x corto"
                    hintR="x largo"
                    onChange={(v) => { setXValue(v); setEvaluo(true); }}
                  />
                  <p style={{ margin: 0, color: T.text2 }}>
                    Al cambiar x, las tiras verdes y los cuadrados azules cambian de tamaño; los cuadritos dorados (el 1) no.
                  </p>
                </Bloque>
              )}

              <Bloque titulo={modo === "lenguaje" ? "Del lenguaje al símbolo" : modo === "clasificacion" ? "Anatomía de la expresión" : "El producto como área"} icono="fa-magnifying-glass-chart">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {modo === "lenguaje" ? (
                    <>
                      <Dato label="expresión" value={frase.expresion} col={accent} />
                      <Dato label={`valor en x = ${xValue}`} value={valorTxt} col={VERDE} />
                    </>
                  ) : modo === "clasificacion" ? (
                    <>
                      <Dato label="clase" value={clasifica(expr.terminos.length)} col={accent} />
                      <Dato label="términos" value={`${expr.terminos.length}`} col={AZUL} />
                      <Dato label="grado" value={`${expr.grado}`} col={VERDE} />
                    </>
                  ) : (
                    <>
                      <Dato label="producto" value={prod.ecuacion} col={accent} />
                      <Dato label="coef. de x" value={`${prod.coefX >= 0 ? "+" : ""}${prod.coefX}`} col={VERDE} />
                      <Dato label="constante" value={`${prod.constante >= 0 ? "+" : ""}${prod.constante}`} col={ORO} />
                    </>
                  )}
                </div>
                {modo === "lenguaje" ? (
                  <p style={{ margin: 0, color: T.text2 }}>{frase.explica}</p>
                ) : modo === "clasificacion" ? (
                  <p style={{ margin: 0, color: T.text2 }}>
                    {CLASE_DESC[clasifica(expr.terminos.length)]} En el primer término el <strong style={{ color: ORO }}>coeficiente</strong> es {expr.anatomia.coeficiente}, la <strong style={{ color: VERDE }}>variable</strong> es {expr.anatomia.variable} y el <strong style={{ color: AZUL }}>exponente</strong> es {expr.anatomia.exponente}.
                  </p>
                ) : (
                  <>
                    <p style={{ margin: 0, color: T.text2 }}>
                      Área total = <strong style={{ color: accent }}>{prod.expandido}</strong>. El cuadrado azul es x²; las tiras verdes suman (a + b)x = {prod.coefX}x; los cuadritos dorados son a·b = {prod.constante}.
                    </p>
                    <p style={{ margin: 0, padding: "10px 12px", borderRadius: 11, background: T.inset, border: `1px solid ${T.line}`, color: T.text2 }}>
                      <strong style={{ color: T.text }}>Términos semejantes: </strong>{SEMEJANTES.entrada} = <strong style={{ color: accent }}>{SEMEJANTES.resultado}</strong>. {SEMEJANTES.pasos}: solo se suman los que tienen la misma variable y exponente.
                    </p>
                  </>
                )}
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
              key={modo}
              reto={retoActual}
              accent={accent}
              aprobado={aprobados[modo]}
              onAprobado={() => setAprobados((s) => ({ ...s, [modo]: true }))}
              playSfx={() => {
                if (sonido) audioRef.current?.correcto();
              }}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Qué es el lenguaje algebraico" icono="fa-language">
                <p style={{ margin: 0, color: T.text2 }}>
                  El <strong style={{ color: T.text }}>álgebra</strong> usa letras para representar cantidades que no conocemos o que cambian. Cada término es una pieza: <strong style={{ color: AZUL }}>x²</strong> un cuadrado de lado x, <strong style={{ color: VERDE }}>x</strong> una tira y <strong style={{ color: ORO }}>1</strong> un cuadrito. Verlos como mosaicos hace tangible el lenguaje, su clasificación y sus operaciones.
                </p>
              </Bloque>
              <Bloque titulo="Las cuatro clases" icono="fa-layer-group">
                <Parte col={ORO} icon="fa-1" titulo="Monomio — 1 término">7x³, 5x², −4. Un solo bloque de mosaicos.</Parte>
                <Parte col={VERDE} icon="fa-2" titulo="Binomio — 2 términos">3x + 7, x² − 9. Dos grupos.</Parte>
                <Parte col={AZUL} icon="fa-3" titulo="Trinomio — 3 términos">x² + 4x − 2. Tres grupos.</Parte>
                <Parte col="#f0a6ff" icon="fa-list-ol" titulo="Polinomio — 4 o más">2x³ + x² − 5x + 1. Muchos grupos.</Parte>
              </Bloque>
              <Bloque titulo="En la vida real (México)" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>
                  Un arquitecto del <strong>INFONAVIT</strong> escribe el área de un lote como <strong style={{ color: ORO }}>x·(2x + 5) = 2x² + 5x</strong> para ajustar la vivienda; una hoja de cálculo evalúa fórmulas algebraicas; los patrones de costo de n productos se generalizan con expresiones.
                </p>
              </Bloque>
              <Bloque titulo="Para multiplicar binomios" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  <strong style={{ color: VERDE }}>(x + a)(x + b) = x² + (a + b)x + a·b</strong>. Los signos importan: en (x + 3)(x − 2), a + b = 1 y a·b = −6, así que el resultado es <strong style={{ color: accent }}>x² + x − 6</strong>.
                </p>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-flask-vial">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((idea, i) => <li key={i}>{idea}</li>)}
                </ul>
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)`, color: T.text }}>
                  <strong style={{ color: accent }}>Contexto. </strong>{CONTEXTO}
                </p>
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-spell-check">
                {GLOSARIO.map((g) => (
                  <div key={g.termino} style={{ padding: "10px 12px", borderRadius: 11, background: T.inset, border: `1px solid ${T.line}` }}>
                    <div style={{ fontWeight: 800, color: T.text }}>{g.termino}</div>
                    <div style={{ color: T.text2 }}>{g.definicion}</div>
                    <div style={{ color: T.text3, marginTop: 4 }}><i className="fa-solid fa-angle-right" style={{ marginRight: 5, color: accent }} aria-hidden />{g.ejemplo}</div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ALGEBRA_TILES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                <i className="fa-solid fa-book" style={{ marginRight: 6 }} aria-hidden />{FUENTE}
              </p>
              {/* objetivos verbatim (referencia para lectura) */}
              <div style={{ display: "none" }} aria-hidden>{OBJETIVOS.join(" · ")}</div>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor: el valor de la expresión crece con x ────────────────────── */
function MedidorValor({ valor, max, x, compacto = false }: { valor: number; max: number; x: number; compacto?: boolean }) {
  const pct = Math.max(2, Math.min(100, (Math.abs(valor) / Math.max(1, Math.abs(max))) * 100));
  return (
    <div style={{ display: "grid", gap: 6, width: compacto ? 176 : undefined, marginTop: compacto ? 4 : 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>valor con x = {x}</span>
        <span style={{ fontFamily: "ui-monospace, monospace", color: VERDE }}>{Number.isInteger(valor) ? valor : valor.toFixed(2)}</span>
      </div>
      <div style={{ height: compacto ? 8 : 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: valor < 0 ? "#f0667d" : VERDE, transition: "width 120ms linear" }} />
      </div>
    </div>
  );
}

/* ── Tarjeta de "parte" en la teoría ──────────────────────────────────── */
function Parte({ col, icon, titulo, children }: { col: string; icon: string; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: col, background: `${col}1f` }}>
        <i className={`fa-solid ${icon}`} aria-hidden />
      </div>
      <div style={{ color: T.text2 }}>
        <strong style={{ color: T.text, display: "block", marginBottom: 2 }}>{titulo}</strong>
        {children}
      </div>
    </div>
  );
}

/* ── Wrappers por slug (un mismo motor, modo inicial distinto) ─────────── */
const RETO_KEY = "cen-clasificacion-expresiones-mosaicos-reto";

export function LabLenguajeAlgebraico(props: PracticaLabProps) {
  return <LabAlgebraTilesBase {...props} varianteInicial="lenguaje" />;
}
export function LabClasificacionExpresiones(props: PracticaLabProps) {
  return <LabAlgebraTilesBase {...props} varianteInicial="clasificacion" />;
}
export function LabOperacionesMonomiosBinomios(props: PracticaLabProps) {
  return <LabAlgebraTilesBase {...props} varianteInicial="operaciones" />;
}

export default LabLenguajeAlgebraico;
