"use client";

/**
 * Laboratorio 3D — Fracciones, decimales y porcentajes.
 * Práctica experimental para PM-I-P04-A1.
 *
 * EXPERIMENTO CENTRAL: equivalencia. El alumno fija una fracción como
 * REFERENCIA (aparece un poste en la barra y un radio en el pastel) y arma OTRA
 * con distinto denominador: si llena la barra hasta el poste, son la misma
 * cantidad (1/2 = 2/4 = 50 %). Además lee cada fracción como decimal y
 * porcentaje y aplica el porcentaje a una cantidad real. Pensamiento Matemático I.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { FRACCIONES_PORCENTAJES_FICHA } from "./fracciones-porcentajes-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./fracciones-porcentajes-data";
import { LabSfx } from "./lab-audio";
import {
  CANTIDADES,
  CONTEXTOS,
  DENOMINADORES,
  type ContextoKey,
  decimalDe,
  porcentajeDe,
  simplifica,
} from "./fracciones-data";

const FraccionesScene = dynamic(() => import("./FraccionesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-pie fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const fmtDec = (n: number) => n.toLocaleString("es-MX", { maximumFractionDigits: 4 });
const fmtPct = (n: number) => n.toLocaleString("es-MX", { maximumFractionDigits: 1 });
const fmtMXN = (n: number) => n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const RETO_KEY = "cen-fracciones-porcentajes-reto";
const C_REF = "#FDE68A";

export function LabFracciones({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [numerador, setNumerador] = useState(1);
  const [denominador, setDenominador] = useState(2);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [cantidad, setCantidad] = useState<number>(CANTIDADES[0]);
  // La fracción fijada como referencia para el experimento de equivalencia.
  const [ref, setRef] = useState<{ n: number; d: number } | null>(null);
  const [refCoincide, setRefCoincide] = useState(false);

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

  const [contextoKey, setContextoKey] = useState<ContextoKey>("descuento");
  // seguimiento de objetivos
  const [interactuo, setInteractuo] = useState(false);
  const [vioFormas, setVioFormas] = useState(false);
  const [encontroEquiv, setEncontroEquiv] = useState(false);
  const [aplicoPorcentaje, setAplicoPorcentaje] = useState(false);
  // valores decimales ya vistos → denominadores con que se alcanzaron (para detectar equivalentes)
  const [vistos, setVistos] = useState<Record<string, number[]>>({});

  /** Fija la fracción, registra objetivos y detecta fracciones equivalentes. */
  const setFrac = (n: number, d: number) => {
    const dd = Math.max(1, d);
    const nn = Math.max(0, Math.min(dd, n));
    setNumerador(nn);
    setDenominador(dd);
    setInteractuo(true);
    if (nn > 0) setVioFormas(true);
    if (nn > 0) {
      const key = (nn / dd).toFixed(5);
      const arr = vistos[key];
      // si ya vimos este mismo valor con OTRO denominador → son fracciones equivalentes
      if (arr && arr.length >= 1 && !arr.includes(dd)) setEncontroEquiv(true);
      setVistos((prev) => {
        const prevArr = prev[key] ?? [];
        if (prevArr.includes(dd)) return prev;
        return { ...prev, [key]: [...prevArr, dd] };
      });
    }
  };

  const cambiarNumerador = (delta: number) => {
    if (sonido) audioRef.current?.blip();
    setFrac(numerador + delta, denominador);
  };
  const cambiarDenominador = (d: number) => {
    if (sonido) audioRef.current?.blip();
    setFrac(numerador, d); // setFrac re-acota el numerador a ≤ d
  };
  const elegirCantidad = (c: number) => {
    setCantidad(c);
    setAplicoPorcentaje(true);
  };
  const elegirContexto = (k: ContextoKey) => {
    setContextoKey(k);
    setAplicoPorcentaje(true);
  };
  const reset = () => {
    setFrac(1, 2);
    setRef(null);
    setResetNonce((n) => n + 1);
  };

  // valores derivados
  const decimal = useMemo(() => decimalDe(numerador, denominador), [numerador, denominador]);
  const porcentaje = useMemo(() => porcentajeDe(numerador, denominador), [numerador, denominador]);
  const [sn, sd] = useMemo(() => simplifica(numerador, denominador), [numerador, denominador]);
  const esReducible = numerador > 0 && (sn !== numerador || sd !== denominador);
  const contexto = useMemo(() => CONTEXTOS.find((c) => c.key === contextoKey)!, [contextoKey]);
  const parte = cantidad * decimal;
  const totalAplicado = contexto.op === "resta" ? cantidad - parte : cantidad + parte;


  const refValor = ref ? decimalDe(ref.n, ref.d) : null;
  const coincideAhora = ref !== null && numerador > 0 && Math.abs(decimal - decimalDe(ref.n, ref.d)) < 1e-9;
  const mismaFraccion = ref !== null && ref.n === numerador && ref.d === denominador;
  // Ajuste durante el render: armó OTRA fracción (distinto denominador) que llega a la misma marca.
  if (coincideAhora && ref && denominador !== ref.d && !refCoincide) setRefCoincide(true);

  const fijarReferencia = () => {
    if (ref) setRef(null);
    else if (numerador > 0) setRef({ n: numerador, d: denominador });
    if (sonido) audioRef.current?.blip();
  };

  const objetivos = [
    { txt: "Fija una fracción como referencia y arma otra que llegue a la misma marca", done: refCoincide },
    { txt: "Construye y modifica una fracción", done: interactuo },
    { txt: "Léela como fracción, decimal y %", done: vioFormas },
    { txt: "Descubre dos fracciones equivalentes", done: encontroEquiv },
    { txt: "Aplica un porcentaje a una cantidad", done: aplicoPorcentaje },
    { txt: "Resuelve el reto de fracciones y porcentajes", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-pie" />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, ...NUM }}>
        {numerador}/{denominador} = {fmtDec(decimal)} = {fmtPct(porcentaje)}%
      </div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: la fracción, el decimal y el porcentaje son tres formas de escribir la misma cantidad.
      </div>
    </div>
  );

  const lectura = (
    <span style={NUM}>
      {numerador}/{denominador} = {fmtDec(decimal)} = {fmtPct(porcentaje)}%
      {ref && (coincideAhora ? (mismaFraccion ? " · es la referencia" : " · ¡llega a la marca!") : " · no llega a la marca")}
    </span>
  );

  return (
    <>
      <style>{CSS(accent, color.rgba)}</style>
      <LabShell
        accent={accent}
        rgba={color.rgba}
        retoKey={RETO_KEY}
        escena={
          <SceneBoundary fallback={sceneFallback}>
            <FraccionesScene numerador={numerador} denominador={denominador} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} referencia={refValor} referenciaTxt={ref ? `${ref.n}/${ref.d}` : undefined} />
          </SceneBoundary>
        }
        herramientas={
          <>
            <BotonHerramienta icono="fa-thumbtack" titulo={ref ? "Quitar la referencia" : "Fijar esta fracción como referencia"} activo={ref !== null} onClick={fijarReferencia} />
            <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
            <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
            <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
          </>
        }
        leyenda={ref ? <MedidorReferencia ref0={ref} n={numerador} d={denominador} coincide={coincideAhora} /> : undefined}
        lectura={lectura}
        objetivos={objetivos}
        pestanas={[
          {
            id: "controles",
            etiqueta: "Controles",
            icono: "fa-sliders",
            contenido: (
              <>
                <Bloque titulo="Construye la fracción" icono="fa-chart-pie">
                  <div style={{ fontWeight: 700, color: T.text2 }}>Numerador: partes que tomas</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <button type="button" className="fr-step" onClick={() => cambiarNumerador(-1)} disabled={numerador <= 0} title="Quitar una parte" aria-label="Quitar una parte">
                      <i className="fa-solid fa-minus" aria-hidden />
                    </button>
                    <div style={{ textAlign: "center", lineHeight: 1 }}>
                      <div style={{ fontSize: 40, fontWeight: 900, color: accent, ...NUM, textShadow: `0 0 22px ${accent}55` }}>{numerador}</div>
                      <div style={{ height: 2, background: T.lineStrong, margin: "6px auto", width: 54 }} />
                      <div style={{ fontSize: 28, fontWeight: 800, color: T.text2, ...NUM }}>{denominador}</div>
                    </div>
                    <button type="button" className="fr-step" onClick={() => cambiarNumerador(1)} disabled={numerador >= denominador} title="Tomar una parte más" aria-label="Tomar una parte más">
                      <i className="fa-solid fa-plus" aria-hidden />
                    </button>
                  </div>
                  <div style={{ fontWeight: 700, color: T.text2 }}>Denominador: en cuántas partes divides</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 52px), 1fr))", gap: 8 }}>
                    {DENOMINADORES.map((d) => (
                      <button key={d} type="button" className="fr-chip" data-on={d === denominador} onClick={() => cambiarDenominador(d)}>
                        {d}
                      </button>
                    ))}
                  </div>
                </Bloque>

                <Bloque titulo="Experimento: ¿misma cantidad?" icono="fa-thumbtack">
                  <button type="button" className="fr-ref" data-on={ref !== null} onClick={fijarReferencia} disabled={!ref && numerador === 0}>
                    <i className="fa-solid fa-thumbtack" aria-hidden />
                    {ref ? `Quitar referencia ${ref.n}/${ref.d}` : `Fijar ${numerador}/${denominador} como referencia`}
                  </button>
                  <div style={{ color: T.text2 }}>
                    {!ref
                      ? "Fija la fracción actual: aparece un poste amarillo en la barra y un radio en el pastel. Luego cambia el denominador y arma otra fracción que llegue a la misma marca."
                      : coincideAhora && !mismaFraccion
                        ? <><strong style={{ color: OK }}>¡Misma cantidad!</strong> {numerador}/{denominador} y {ref.n}/{ref.d} llegan a la misma marca: son fracciones equivalentes ({fmtPct(porcentaje)}%).</>
                        : mismaFraccion
                          ? "Esta es la referencia. Cambia el denominador y ajusta el numerador hasta llegar a la marca amarilla."
                          : <>{numerador}/{denominador} = {fmtPct(porcentaje)}% y la referencia vale {fmtPct((refValor ?? 0) * 100)}%: no llegan a la misma marca.</>}
                  </div>
                </Bloque>

                <Bloque titulo="La misma cantidad, tres formas" icono="fa-equals">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                    <Dato label="Fracción" value={`${numerador}/${denominador}`} col={accent} />
                    <Dato label="Decimal" value={fmtDec(decimal)} />
                    <Dato label="Porcentaje" value={`${fmtPct(porcentaje)}%`} />
                    <Dato label="Equivalentes" value={encontroEquiv ? "Sí" : "—"} col={encontroEquiv ? OK : undefined} />
                  </div>
                  <div style={{ color: esReducible ? T.text : T.text2 }}>
                    {esReducible ? (
                      <>
                        La fracción <strong style={{ color: T.text, ...NUM }}>{numerador}/{denominador}</strong> equivale a la simplificada{" "}
                        <strong style={{ color: accent, ...NUM }}>{sn}/{sd}</strong>: ambas son la misma parte del todo.
                      </>
                    ) : numerador === 0 ? (
                      <>No tomas ninguna parte: la fracción vale <strong style={{ color: T.text }}>0</strong> (0%).</>
                    ) : numerador === denominador ? (
                      <>Tomas todas las partes: la fracción vale <strong style={{ color: T.text }}>1</strong> (100%), el entero completo.</>
                    ) : (
                      <>Esta fracción ya está en su forma más simple: no se puede reducir más.</>
                    )}
                  </div>
                </Bloque>

                <Bloque titulo="Aplica el porcentaje a una cantidad" icono="fa-tag">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 64px), 1fr))", gap: 8 }}>
                    {CANTIDADES.map((c) => (
                      <button key={c} type="button" className="fr-chip" data-on={c === cantidad} onClick={() => elegirCantidad(c)}>
                        ${c}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 96px), 1fr))", gap: 8 }}>
                    {CONTEXTOS.map((c) => (
                      <button key={c.key} type="button" className="fr-ctx" data-on={c.key === contextoKey} onClick={() => elegirContexto(c.key)}>
                        <i className={`fa-solid ${c.icono}`} style={{ fontSize: 15, color: c.key === contextoKey ? accent : T.text3 }} aria-hidden />
                        {c.nombre}
                      </button>
                    ))}
                  </div>
                  <div style={{ borderRadius: 13, border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.1)`, padding: "12px 14px" }}>
                    <div style={{ color: T.text2 }}>
                      El <strong style={{ color: T.text }}>{contexto.nombre.toLowerCase()}</strong> es el{" "}
                      <strong style={{ color: accent, ...NUM }}>{fmtPct(porcentaje)}%</strong> de{" "}
                      <strong style={{ color: T.text, ...NUM }}>${fmtMXN(cantidad)}</strong> ={" "}
                      <strong style={{ color: accent, ...NUM }}>${fmtMXN(parte)}</strong>.
                    </div>
                    <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: T.text3 }}>{contexto.etiqueta}</span>
                      <span style={{ fontSize: 24, fontWeight: 900, color: T.text, ...NUM, textShadow: `0 0 18px ${accent}44` }}>${fmtMXN(totalAplicado)}</span>
                    </div>
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
                <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                  <p style={{ margin: 0, color: T.text2 }}>
                    Para pasar de fracción a porcentaje, <strong style={{ color: T.text }}>divide y multiplica por 100</strong>: 3/4 = 0.75 = 75%. Por eso el{" "}
                    <strong style={{ color: T.text }}>porcentaje es una fracción con denominador 100</strong>.
                  </p>
                  <p style={{ margin: 0, color: T.text2 }}>
                    Prueba <strong style={{ color: T.text }}>1/2</strong> y luego <strong style={{ color: T.text }}>2/4</strong>: distinta fracción, mismo valor.
                  </p>
                </Bloque>
                <Bloque titulo="Ficha teórica" icono="fa-book">
                  <FichaTeorica data={FRACCIONES_PORCENTAJES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
                </Bloque>
              </>
            ),
          },
        ]}
      />
    </>
  );
}

/* ── Medidor de la referencia: dos barras de longitud proporcional al valor ─── */
function MedidorReferencia({ ref0, n, d, coincide }: { ref0: { n: number; d: number }; n: number; d: number; coincide: boolean }) {
  const vr = ref0.n / ref0.d;
  const va = n / d;
  const fila = (txt: string, v: number, c: string) => (
    <div style={{ display: "grid", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>{txt}</span>
        <span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtPct(v * 100)}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${v * 100}%`, height: "100%", background: c, transition: "width 120ms linear" }} />
      </div>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: 6, width: 200 }}>
      {fila(`Referencia ${ref0.n}/${ref0.d}`, vr, C_REF)}
      {fila(`Tu fracción ${n}/${d}`, va, coincide ? OK : "#7dd3fc")}
      <div style={{ fontSize: 14, fontWeight: 900, color: coincide ? OK : "#fb923c" }}>{coincide ? "Misma cantidad" : "Distinta cantidad"}</div>
    </div>
  );
}

const CSS = (accent: string, rgba: string) => `
.fr-chip { cursor:pointer; border-radius:11px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
  font-size:15px; font-weight:800; padding:11px 0; transition:all .14s ease; }
.fr-chip:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
.fr-chip[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.18); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
.fr-step { cursor:pointer; width:52px; height:52px; border-radius:12px; border:1px solid ${T.lineStrong}; background:${T.inset};
  color:#fff; font-size:18px; display:flex; align-items:center; justify-content:center; transition:all .14s; flex-shrink:0; }
.fr-step:hover:not(:disabled) { background:rgba(${rgba},0.2); border-color:${accent}; }
.fr-step:disabled { opacity:0.35; cursor:default; }
.fr-ctx { cursor:pointer; border-radius:11px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
  font-size:14px; font-weight:800; padding:11px 6px; transition:all .14s ease; display:flex; flex-direction:column; align-items:center; gap:6px; }
.fr-ctx:hover { border-color:${T.lineStrong}; color:#fff; }
.fr-ctx[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.18); color:#fff; }
.fr-ref { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 14px; border-radius:12px;
  border:1.5px solid ${C_REF}88; background:rgba(253,230,138,0.1); color:#fff; font-size:14px; font-weight:800; transition:all .14s; }
.fr-ref:hover:not(:disabled) { background:rgba(253,230,138,0.2); }
.fr-ref[data-on="true"] { background:rgba(253,230,138,0.22); border-color:${C_REF}; }
.fr-ref i { color:${C_REF}; }
.fr-ref:disabled { opacity:0.45; cursor:default; }
`;
