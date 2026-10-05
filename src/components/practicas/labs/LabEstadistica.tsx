"use client";

/**
 * Laboratorio 3D — Estadística descriptiva.
 * Pensamiento Matemático VI («Pensamiento estadístico y probabilístico»).
 *
 * Un mismo conjunto de datos se visualiza como un "dot plot" 3D sobre la recta
 * numérica y según el modo se marcan:
 *   • TENDENCIA — la MEDIA como fulcro de una balanza (la inclina el atípico),
 *     la MEDIANA como corte central y la(s) MODA(s) como columna(s) más altas;
 *   • DISPERSIÓN — la banda media ± σ y el rango [mín, máx];
 *   • HISTOGRAMA — el agrupamiento de los datos en intervalos (clases).
 *
 * Sirve a tres propósitos formativos de PM-VI mediante un único shell con tres
 * variantes iniciales:
 *   tendencia  → PM-VI-P03-A2 (medidas de tendencia central),
 *   dispersion → PM-VI-P04-A2 (medidas de dispersión),
 *   graficas   → PM-VI-P02-A2 (tablas de frecuencia e histogramas).
 * Contenido VERBATIM del Modelo MCCEMS 2025; nada se inventa.
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
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";
import { ESTADISTICA_FICHA } from "./estadistica-ficha";
import {
  CONJUNTOS,
  CONJUNTO_DEFAULT,
  conjuntoPorId,
  VARIANTES,
  IDEAS,
  GLOSARIO,
  CONTEXTO,
  resumen,
  histograma,
  fmt,
  RETO_TENDENCIA,
  RETO_DISPERSION,
  RETO_GRAFICAS,
  type Variante,
  type RetoNumericoData,
} from "./estadistica-data";

const EstadisticaScene = dynamic(() => import("./EstadisticaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-simple fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const ORO = "#ffd24a";
const VERDE = "#34D399";
const AZUL = "#5fb0ff";
const MAGENTA = "#f0a6ff";

// La mejor marca del reto se guarda por variante (cada slug tiene su ancla A2).
const RETO_POR_VARIANTE: Record<Variante, { reto: RetoNumericoData; key: string }> = {
  tendencia: { reto: RETO_TENDENCIA, key: "cen-estadistica-reto-tendencia" },
  dispersion: { reto: RETO_DISPERSION, key: "cen-estadistica-reto-dispersion" },
  graficas: { reto: RETO_GRAFICAS, key: "cen-estadistica-reto-graficas" },
};

// Conjunto recomendado para arrancar cada variante (la data del propio ejercicio).
const CONJUNTO_POR_VARIANTE: Record<Variante, string> = {
  tendencia: "salarios",
  dispersion: "grupoA",
  graficas: "examen20",
};

// Pilar EQUIPARSE: en un estudio estadístico el “equipo” es el instrumental para
// RECOLECTAR datos y CALCULAR (3 correctos + 3 distractores que miden otra cosa).
const INSTRUMENTOS: EppItem[] = [
  { key: "hoja", nombre: "Hoja de registro", icono: "fa-table-list", ok: true, nota: "Anota cada dato de la muestra para luego ordenarlos y contarlos." },
  { key: "calc", nombre: "Calculadora científica", icono: "fa-calculator", ok: true, nota: "Calcula la suma, la media, la varianza y la desviación estándar." },
  { key: "regla", nombre: "Regla y papel cuadriculado", icono: "fa-ruler", ok: true, nota: "Construye la tabla de frecuencias y traza el histograma a escala." },
  { key: "dado", nombre: "Dado", icono: "fa-dice", ok: false, nota: "Genera azar artificial; aquí trabajas con datos ya recolectados." },
  { key: "termo", nombre: "Termómetro", icono: "fa-temperature-half", ok: false, nota: "Mide temperatura; no es el instrumento para resumir un conjunto de datos." },
  { key: "balanza", nombre: "Balanza de laboratorio", icono: "fa-scale-unbalanced", ok: false, nota: "Mide masa; el «equilibrio» de la media es una analogía, no se pesa nada." },
];

/** Shell base; cada slug fija su `varianteInicial`. */
function LabEstadistica({ color, varianteInicial }: PracticaLabProps & { varianteInicial: Variante }) {
  const accent = `#${color.hex.replace("#", "")}`;

  const conjuntoArranque = CONJUNTO_POR_VARIANTE[varianteInicial] ?? CONJUNTO_DEFAULT;
  const [conjuntoId, setConjuntoId] = useState(conjuntoArranque);
  const [modo, setModo] = useState<Variante>(varianteInicial);
  const [verMedia, setVerMedia] = useState(true);
  const [verMediana, setVerMediana] = useState(true);
  const [verModa, setVerModa] = useState(true);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [cambioConjunto, setCambioConjunto] = useState(false);
  const [vioTendencia, setVioTendencia] = useState(varianteInicial === "tendencia");
  const [vioDispersion, setVioDispersion] = useState(varianteInicial === "dispersion");
  const [vioGraficas, setVioGraficas] = useState(varianteInicial === "graficas");

  // compuerta de equipamiento (pilar EQUIPARSE)
  const [eppListo, setEppListo] = useState(false);

  // reto evaluable, teoría (cajón deslizable) y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  const retoActual = RETO_POR_VARIANTE[varianteInicial];

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

  const bump = () => setResetNonce((k) => k + 1);

  const conjunto = useMemo(() => conjuntoPorId(conjuntoId), [conjuntoId]);
  const base = conjunto.valores;
  const statsBase = useMemo(() => resumen(base), [base]);

  // Experimento central: el valor más alto (el atípico) se puede mover y se ve
  // que la media lo sigue pero la mediana no.
  const [atipico, setAtipico] = useState<number | null>(null);
  const [movioAtipico, setMovioAtipico] = useState(false);
  const idxMax = useMemo(() => base.indexOf(Math.max(...base)), [base]);
  const maxOrig = base[idxMax] ?? 0;
  const segundo = useMemo(() => {
    const resto = base.filter((_, i) => i !== idxMax);
    return resto.length ? Math.max(...resto) : maxOrig;
  }, [base, idxMax, maxOrig]);
  const sliderMax = maxOrig > 0 ? maxOrig * 1.5 : maxOrig + Math.abs(maxOrig || 1);
  const valorAtipico = atipico ?? maxOrig;
  const datos = useMemo(
    () => (atipico === null ? base : base.map((v, i) => (i === idxMax ? atipico : v))),
    [base, atipico, idxMax],
  );
  const dominio = useMemo<[number, number]>(() => [Math.min(...base), Math.max(sliderMax, maxOrig)], [base, sliderMax, maxOrig]);
  const stats = useMemo(() => resumen(datos), [datos]);
  const histo = useMemo(() => histograma(datos), [datos]);
  if (!movioAtipico && Math.abs(stats.media - statsBase.media) > 1e-6 && Math.abs(stats.mediana - statsBase.mediana) < 1e-9) {
    setMovioAtipico(true);
  }
  const dec = conjunto.dec;

  const elegirConjunto = (id: string) => {
    setConjuntoId(id);
    setAtipico(null);
    setCambioConjunto(true);
    if (sonido) audioRef.current?.blip();
    bump();
  };

  const elegirModo = (m: Variante) => {
    setModo(m);
    if (sonido) audioRef.current?.blip();
    if (m === "tendencia") setVioTendencia(true);
    if (m === "dispersion") setVioDispersion(true);
    if (m === "graficas") setVioGraficas(true);
  };

  const reset = () => {
    setModo(varianteInicial);
    setConjuntoId(conjuntoArranque);
    setAtipico(null);
    setVerMedia(true);
    setVerMediana(true);
    setVerModa(true);
    bump();
  };

  const modoActual = VARIANTES.find((v) => v.id === modo) ?? VARIANTES[0]!;

  const modaTxt =
    stats.moda.tipo === "amodal"
      ? "sin moda"
      : stats.moda.valores.map((v) => fmt(v, dec)).join(", ");

  const objetivos = [
    { txt: "Equípate con el instrumental de recolección y cálculo", done: eppListo },
    { txt: "Arrastra el valor atípico: la media se desplaza, la mediana no", done: movioAtipico },
    { txt: "Carga distintos conjuntos de datos reales", done: cambioConjunto },
    { txt: "Identifica la media, la mediana y la moda", done: vioTendencia },
    { txt: "Mide la dispersión: rango, varianza y desviación σ", done: vioDispersion },
    { txt: "Agrupa los datos y lee el histograma", done: vioGraficas },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];
  // Los objetivos se recuerdan (algunos dependían del modo y se desmarcaban
  // solos) y se convierten en la marca del laboratorio, que antes no se
  // guardaba en ninguna parte.
  const { cumplidos: cumplidosLab, total: totalLab } = useLogros(objetivos.map((o) => o.done));
  const { registraEstrellas } = useEstrellas(RETO_KEY);
  useEffect(() => {
    if (cumplidosLab === 0) return;
    const est = cumplidosLab >= totalLab ? 3 : cumplidosLab >= Math.ceil((totalLab * 2) / 3) ? 2 : 1;
    registraEstrellas(est);
  }, [cumplidosLab, totalLab, registraEstrellas]);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-simple" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Resumir muchos datos en pocos números</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: la MEDIA es el promedio (sensible a valores atípicos), la MEDIANA es el valor central (resistente a ellos) y la MODA es el valor más frecuente. La dispersión —rango, varianza y desviación σ— mide qué tan esparcidos están los datos.
      </div>
    </div>
  );

  const lecturaCorta =
    modo === "dispersion"
      ? <>σ = {fmt(stats.desviacion, dec)} · rango = {fmt(stats.rango, dec)}</>
      : modo === "graficas"
        ? <>{stats.n} datos en {histo.barras.length} clases</>
        : <>media {fmt(stats.media, dec)} · mediana {fmt(stats.mediana, dec)}</>;

  return (
    <>
      <style>{`
        .est-chip { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:9px 14px; border-radius:999px;
          border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:14px; font-weight:800; transition:all .15s; }
        .est-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .est-chip[data-on="true"] { color:#04121f; }
        .est-cat { cursor:pointer; text-align:left; display:flex; flex-direction:column; gap:2px; width:100%;
          padding:10px 12px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; transition:all .15s; }
        .est-cat:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .est-cat[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.14); color:#fff; }
        .est-cols { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; }
      `}</style>
      <LabShell
        accent={accent}
        rgba={color.rgba}
        retoKey={RETO_KEY}
        escena={
          <>
            <SceneBoundary fallback={sceneFallback}>
              <EstadisticaScene
                valores={datos}
                dominio={dominio}
                accent={accent}
                modo={modo}
                unidad={conjunto.simbolo}
                dec={dec}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
                verMedia={verMedia}
                verMediana={verMediana}
                verModa={verModa}
              />
            </SceneBoundary>
            {!eppListo && (
              <EppGate
                accent={accent}
                rgba={color.rgba}
                items={INSTRUMENTOS}
                titulo="Prepara tu mesa de análisis de datos"
                subtitulo="Antes de resumir los datos, equípate con lo correcto"
                intro={`Para ordenar la muestra, calcular media, mediana, moda y desviación, y trazar el histograma necesitas el instrumental adecuado. Selecciona solo las ${INSTRUMENTOS.filter((i) => i.ok).length} piezas que sirven para recolectar y calcular (deja fuera las que miden otra cosa o generan azar).`}
                verbo="recolección y cálculo"
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
            <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar el movimiento" : "Pausar el movimiento"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
            <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
            <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
          </>
        }
        leyenda={<MedidorCentro stats={stats} base={statsBase} dec={dec} compacto />}
        lectura={lecturaCorta}
        objetivos={objetivos}
        pestanas={[
          {
            id: "controles",
            etiqueta: "Controles",
            icono: "fa-sliders",
            contenido: (
              <>
                <Bloque titulo="El valor atípico" icono="fa-hand-pointer">
                  <Deslizador
                    label="Valor más alto"
                    icon="fa-arrow-up-right-dots"
                    colr={ORO}
                    valor={`${fmt(valorAtipico, dec)} ${conjunto.simbolo}`}
                    min={segundo}
                    max={sliderMax}
                    step={(sliderMax - segundo) / 100 || 1}
                    value={valorAtipico}
                    onChange={setAtipico}
                    hintL="deja de ser atípico"
                    hintR="muy atípico"
                  />
                  <MedidorCentro stats={stats} base={statsBase} dec={dec} />
                  <p style={{ margin: 0, color: T.text2 }}>{modoActual.desc}</p>
                </Bloque>

                {modo === "tendencia" && (
                  <Bloque titulo="Medidas visibles" icono="fa-eye">
                    <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                      <button type="button" className="est-chip" data-on={verMedia} onClick={() => setVerMedia((v) => !v)} style={{ background: verMedia ? ORO : T.inset, borderColor: verMedia ? ORO : T.line }}>
                        <i className={`fa-solid ${verMedia ? "fa-eye" : "fa-eye-slash"}`} /> Media
                      </button>
                      <button type="button" className="est-chip" data-on={verMediana} onClick={() => setVerMediana((v) => !v)} style={{ background: verMediana ? VERDE : T.inset, borderColor: verMediana ? VERDE : T.line }}>
                        <i className={`fa-solid ${verMediana ? "fa-eye" : "fa-eye-slash"}`} /> Mediana
                      </button>
                      <button type="button" className="est-chip" data-on={verModa} onClick={() => setVerModa((v) => !v)} style={{ background: verModa ? MAGENTA : T.inset, borderColor: verModa ? MAGENTA : T.line }}>
                        <i className={`fa-solid ${verModa ? "fa-eye" : "fa-eye-slash"}`} /> Moda
                      </button>
                    </div>
                  </Bloque>
                )}

                <Bloque titulo={`${conjunto.nombre} — n = ${stats.n}`} icono="fa-magnifying-glass-chart">
                  <div className="est-cols">
                    <Dato label="Media x̄" value={fmt(stats.media, dec)} col={ORO} />
                    <Dato label="Mediana" value={fmt(stats.mediana, dec)} col={VERDE} />
                    <Dato label="Moda" value={modaTxt} col={MAGENTA} />
                    <Dato label="Rango" value={fmt(stats.rango, dec)} col={AZUL} />
                    <Dato label="Varianza σ²" value={fmt(stats.varianza, dec)} col={AZUL} />
                    <Dato label="Desviación σ" value={fmt(stats.desviacion, dec)} col={AZUL} />
                    <Dato label="CV" value={`${fmt(stats.cv, 1)} %`} col={AZUL} />
                  </div>
                  <p style={{ margin: 0, color: T.text2 }}>
                    {modo === "dispersion" ? (
                      <>
                        El <strong style={{ color: AZUL }}>rango</strong> es máx − mín; la <strong style={{ color: AZUL }}>varianza σ²</strong> es el promedio de los cuadrados de las distancias a la media; la <strong style={{ color: AZUL }}>desviación σ</strong> está en las mismas unidades que los datos. El coeficiente de variación CV = σ/x̄ permite comparar dispersiones de conjuntos distintos.
                      </>
                    ) : modo === "graficas" ? (
                      <>
                        Al agrupar los {stats.n} datos en intervalos (clases) nace el <strong style={{ color: accent }}>histograma</strong>: cada barra cuenta cuántos datos caen en su intervalo. La forma revela dónde se concentran los datos y si la distribución es simétrica o sesgada.
                      </>
                    ) : (
                      <>
                        La <strong style={{ color: ORO }}>media</strong> es el punto de equilibrio; un valor atípico la jala. La <strong style={{ color: VERDE }}>mediana</strong> parte los datos ordenados en dos mitades y resiste a los extremos. La <strong style={{ color: MAGENTA }}>moda</strong> ({modaTxt}) es el valor más frecuente.
                      </>
                    )}
                  </p>
                </Bloque>

                {modo === "graficas" && (
                  <Bloque titulo="Tabla de frecuencias" icono="fa-table">
                    <div className="est-cols">
                      {histo.barras.map((b, i) => (
                        <Dato key={i} label={b.etiqueta} value={`${b.conteo} datos`} col={accent} />
                      ))}
                    </div>
                  </Bloque>
                )}

                <Bloque titulo="Elige un conjunto de datos" icono="fa-database">
                  {CONJUNTOS.map((c) => (
                    <button key={c.id} type="button" className="est-cat" data-on={conjuntoId === c.id} onClick={() => elegirConjunto(c.id)}>
                      <span style={{ fontSize: 15, fontWeight: 900, color: conjuntoId === c.id ? accent : T.text }}>{c.nombre}</span>
                      <span style={{ fontSize: 14, color: T.text3, fontFamily: "ui-monospace, monospace" }}>n = {c.valores.length} · {c.unidad}</span>
                    </button>
                  ))}
                  <p style={{ margin: 0, color: T.text2 }}>{conjunto.contexto}</p>
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
                <Bloque titulo="Pista para el reto A2" icono="fa-lightbulb">
                  <p style={{ margin: 0, color: T.text2 }}>
                    Carga el conjunto recomendado y compara: en <strong style={{ color: ORO }}>Salarios</strong> la media (12 666.67) y la mediana (8 500) difieren mucho por el atípico de 45 000; en <strong style={{ color: VERDE }}>Grupo A</strong> la σ vale 10; en <strong style={{ color: accent }}>Examen 20</strong> la ojiva del último intervalo llega al 100 %.
                  </p>
                </Bloque>
                <div style={{ marginTop: 12 }}>
                  <RetoNumericoCard
                    reto={retoActual.reto}
                    accent={accent}
                    aprobado={ejercicioAprobado}
                    onAprobado={() => setEjercicioAprobado(true)}
                    playSfx={() => {
                      if (sonido) audioRef.current?.correcto();
                    }}
                  />
                </div>
              </>
            ),
          },
          {
            id: "teoria",
            etiqueta: "Teoría",
            icono: "fa-book-open",
            contenido: (
              <>
                <Bloque titulo="Qué es la estadística descriptiva" icono="fa-chart-simple">
                  <p style={{ margin: 0, color: T.text2 }}>
                    La <strong style={{ color: T.text }}>estadística descriptiva</strong> resume un conjunto de datos en pocos números: las <strong style={{ color: accent }}>medidas de tendencia central</strong> (dónde está el centro) y las <strong style={{ color: AZUL }}>medidas de dispersión</strong> (qué tan esparcidos están). Elegir la medida correcta evita conclusiones engañosas.
                  </p>
                </Bloque>
                <Bloque titulo="Las ideas a leer" icono="fa-lightbulb">
                  <Parte col={ORO} icon="fa-scale-balanced" titulo="Media — punto de equilibrio">
                    x̄ = Σx / n. Es el promedio; un solo valor atípico la jala hacia el extremo y deja de representar al grupo típico.
                  </Parte>
                  <Parte col={VERDE} icon="fa-scissors" titulo="Mediana — corte central">
                    El valor central de los datos ordenados. Deja la mitad a cada lado y es resistente a los valores extremos.
                  </Parte>
                  <Parte col={MAGENTA} icon="fa-ranking-star" titulo="Moda — el más frecuente">
                    El valor que más se repite. Única medida útil para variables cualitativas; un conjunto puede ser amodal o multimodal.
                  </Parte>
                  <Parte col={AZUL} icon="fa-arrows-left-right-to-line" titulo="Dispersión — rango, σ²,  σ">
                    El rango es máx − mín; la varianza σ² = Σ(x − x̄)²/n promedia las distancias al cuadrado; σ = √σ² está en las unidades de los datos.
                  </Parte>
                </Bloque>
                <Bloque titulo="Media vs mediana en México" icono="fa-scale-unbalanced">
                  <p style={{ margin: 0, color: T.text2 }}>
                    El ejemplo más claro es el <strong style={{ color: T.text }}>salario</strong>. El ingreso laboral <strong style={{ color: ORO }}>promedio</strong> (media) se eleva por los sueldos extremadamente altos del decil 10. El <strong style={{ color: VERDE }}>salario mediano</strong> —donde la mitad gana más y la mitad menos— es menor y refleja mejor a la mayoría. Los datos de la <strong>ENOE</strong> (INEGI) muestran esa brecha.
                  </p>
                </Bloque>
                <Bloque titulo="En la vida real (México)" icono="fa-location-dot">
                  <p style={{ margin: 0, color: T.text2 }}>
                    El <strong>promedio escolar</strong> mexicano pondera las calificaciones por créditos; el <strong>INPC</strong> del INEGI es una media ponderada de precios; el <strong>ingreso mediano</strong> de los hogares (ENIGH) describe mejor que el promedio la situación típica. Saber qué medida usar es leer bien los datos.
                  </p>
                </Bloque>
                <Bloque titulo="Ideas clave" icono="fa-key">
                  <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6, color: T.text2 }}>
                    {IDEAS.map((idea, i) => <li key={i}>{idea}</li>)}
                  </ul>
                  <div style={{ padding: "11px 14px", borderRadius: 11, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)`, color: T.text }}>
                    <strong style={{ color: accent }}>Contexto. </strong>{CONTEXTO}
                  </div>
                </Bloque>
                <Bloque titulo="Glosario" icono="fa-spell-check">
                  {GLOSARIO.map((g) => (
                    <div key={g.termino} style={{ padding: "10px 12px", borderRadius: 11, background: T.inset, border: `1px solid ${T.line}` }}>
                      <div style={{ fontWeight: 800, color: T.text, marginBottom: 3 }}>{g.termino}</div>
                      <div style={{ color: T.text2 }}>{g.definicion}</div>
                      <div style={{ color: T.text3, marginTop: 4 }}><i className="fa-solid fa-angle-right" style={{ marginRight: 5, color: accent }} />{g.ejemplo}</div>
                    </div>
                  ))}
                </Bloque>
                <Bloque titulo="Ficha teórica" icono="fa-book">
                  <FichaTeorica data={ESTADISTICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
                </Bloque>
              </>
            ),
          },
        ]}
      />
    </>
  );
}

/* ── Medidor: cuánto se movió cada medida cuando se mueve el atípico ───── */
function MedidorCentro({ stats, base, dec, compacto = false }: {
  stats: ReturnType<typeof resumen>; base: ReturnType<typeof resumen>; dec: number; compacto?: boolean;
}) {
  const dMedia = stats.media - base.media;
  const dMediana = stats.mediana - base.mediana;
  const escala = Math.max(Math.abs(dMedia), Math.abs(dMediana), (base.max - base.min) * 0.25, 1e-9);
  const fs = compacto ? 14 : 15;
  const barra = (txt: string, val: number, delta: number, c: string) => (
    <div style={{ display: "grid", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: fs, fontWeight: 800, color: "#dce6f5" }}>
        <span>{txt}</span>
        <span style={{ fontFamily: "ui-monospace, monospace", color: c }}>{fmt(val, dec)}</span>
      </div>
      <div style={{ height: compacto ? 8 : 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, (Math.abs(delta) / escala) * 100)}%`, height: "100%", background: c, transition: "width 120ms linear" }} />
      </div>
      <div style={{ fontSize: fs, color: "#9fb2c8" }}>
        {Math.abs(delta) < 1e-9 ? "no se movió" : `se movió ${delta > 0 ? "+" : "−"}${fmt(Math.abs(delta), dec)}`}
      </div>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: compacto ? 6 : 10, width: compacto ? 200 : undefined }}>
      {barra("Media x̄", stats.media, dMedia, ORO)}
      {barra("Mediana", stats.mediana, dMediana, VERDE)}
    </div>
  );
}

/* ── Tarjeta de "parte" en el panel lateral ──────────────────────────── */
function Parte({ col, icon, titulo, children }: { col: string; icon: string; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: col, background: `${col}1f` }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
        <strong style={{ color: T.text, display: "block", marginBottom: 2 }}>{titulo}</strong>
        {children}
      </div>
    </div>
  );
}

/* ── Wrappers por slug (la firma del registry es PracticaLabProps) ────── */
const RETO_KEY = "cen-datos-graficas-estadisticas-reto";

export function LabTendenciaCentral(props: PracticaLabProps) {
  return <LabEstadistica {...props} varianteInicial="tendencia" />;
}
export function LabDispersion(props: PracticaLabProps) {
  return <LabEstadistica {...props} varianteInicial="dispersion" />;
}
export function LabHistograma(props: PracticaLabProps) {
  return <LabEstadistica {...props} varianteInicial="graficas" />;
}
