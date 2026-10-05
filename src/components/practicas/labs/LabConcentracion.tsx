"use client";

/**
 * Laboratorio 3D — Concentración de una disolución (% en masa).
 * Práctica experimental para CNEYT-I-P04-A6.
 *
 * Experimento central: ¿cuánto soluto aguanta el agua? El alumno agrega soluto
 * y ve subir la barra de capacidad; al pasar la marca de solubilidad el
 * excedente cae al fondo como cristales (disolución SATURADA) y la
 * concentración deja de subir. % en masa = (soluto / disolución) × 100.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { SOLUTOS, AGUAS, SOLUTO_MAX, SOLUTO_PASO, disolver, nivelDisolucion, EJERCICIO_A6 } from "./concentracion-data";
import { FichaTeorica } from "./_ficha";
import { CONCENTRACION_FICHA } from "./concentracion-ficha";
import { LabSfx } from "./lab-audio";

const ConcentracionScene = dynamic(() => import("./ConcentracionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const SAT = "#FF8A3C"; // color de saturación

const fmtG = (n: number) => `${n % 1 === 0 ? n.toLocaleString("es-MX") : n.toLocaleString("es-MX", { maximumFractionDigits: 1 })} g`;
const fmtPct = (n: number) => `${n.toLocaleString("es-MX", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;

const RETO_KEY = "cen-concentracion-disolucion-reto";

export function LabConcentracion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [solutoKey, setSolutoKey] = useState(SOLUTOS[0]!.key);
  const [masaSoluto, setMasaSoluto] = useState(20);
  const [masaAgua, setMasaAgua] = useState<number>(100);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  // seguimiento de objetivos
  const [interactuo, setInteractuo] = useState(false);
  const [vioConcentrada, setVioConcentrada] = useState(false);
  const [diluyo, setDiluyo] = useState(false);
  const [saturo, setSaturo] = useState(false);
  const [solutosSaturados, setSolutosSaturados] = useState<string[]>([]);
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
      sfx.burbujas(true);
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  // efecto de sonido al manipular el soluto/agua (sólo si el audio está activo).
  const playGota = useCallback(() => {
    if (sonido) audioRef.current?.gota();
  }, [sonido]);

  // marca objetivos a partir del resultado de una combinación
  const marcar = (soluto: number, aguaG: number, key: string) => {
    const s = SOLUTOS.find((x) => x.key === key)!;
    const dd = disolver(soluto, aguaG, s.solubilidad);
    if (dd.concentracion >= 20) setVioConcentrada(true);
    if (dd.saturada) {
      setSaturo(true);
      setSolutosSaturados((prev) => (prev.includes(key) ? prev : [...prev, key]));
    }
  };

  const elegirSoluto = (key: string) => {
    setSolutoKey(key);
    setInteractuo(true);
    playGota();
    marcar(masaSoluto, masaAgua, key);
  };
  const cambiarSoluto = (g: number) => {
    const n = Math.max(0, Math.min(SOLUTO_MAX, g));
    setMasaSoluto(n);
    setInteractuo(true);
    playGota();
    marcar(n, masaAgua, solutoKey);
  };
  const elegirAgua = (g: number) => {
    if (g > masaAgua && masaSoluto > 0) setDiluyo(true);
    setMasaAgua(g);
    setInteractuo(true);
    playGota();
    marcar(masaSoluto, g, solutoKey);
  };
  const reset = () => {
    setSolutoKey(SOLUTOS[0]!.key);
    setMasaSoluto(20);
    setMasaAgua(100);
    setResetNonce((n) => n + 1);
  };

  const soluto = useMemo(() => SOLUTOS.find((x) => x.key === solutoKey)!, [solutoKey]);
  const d = useMemo(() => disolver(masaSoluto, masaAgua, soluto.solubilidad), [masaSoluto, masaAgua, soluto.solubilidad]);
  const nivelInfo = useMemo(() => nivelDisolucion(masaSoluto, d), [masaSoluto, d]);

  const nivel = 0.28 + ((masaAgua - 50) / 150) * 0.6; // 50 g → 0.28, 200 g → 0.88
  const intensidad = Math.min(1, d.concentracion / 35);
  const excedenteFrac = Math.min(1, d.excedente / 40);

  const objetivos = [
    { txt: "Agrega soluto y prepara una disolución", done: interactuo && masaSoluto > 0 },
    { txt: "Llega a una disolución concentrada (≥ 20 %)", done: vioConcentrada },
    { txt: "Diluye agregando más agua (baja el %)", done: diluyo },
    { txt: "Satura: deja soluto sin disolver", done: saturo },
    { txt: "Compara: lleva dos solutos distintos a su límite y mira que no aguantan lo mismo", done: solutosSaturados.length >= 2 },
    { txt: "Resuelve el reto de concentración", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${soluto.icono}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, ...NUM }}>{fmtPct(d.concentracion)}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: {fmtG(d.disuelto)} de {soluto.nombre} disueltos en {fmtG(masaAgua)} de agua dan una disolución del {fmtPct(d.concentracion)} en masa.
      </div>
    </div>
  );

  const lectura = d.saturada
    ? <>Saturada: el agua admite solo {fmtG(d.maxDisuelto)}; {fmtG(d.excedente)} caen al fondo</>
    : <>{fmtG(d.disuelto)} en {fmtG(d.masaDisolucion)} de disolución = {fmtPct(d.concentracion)}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <ConcentracionScene
            nivel={nivel}
            solutoColor={soluto.color}
            intensidad={intensidad}
            saturada={d.saturada}
            excedenteFrac={excedenteFrac}
            accent={accent}
            autoRotate={autoRotate}
            resetNonce={resetNonce}
            rotulos={{
              agua: `Agua ${fmtG(masaAgua)}`,
              soluto: `Disuelto ${fmtG(d.disuelto)}`,
              sinDisolver: d.saturada ? `Sin disolver ${fmtG(d.excedente)}` : null,
              pct: fmtPct(d.concentracion),
            }}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: SOLUTOS.map((s) => ({ id: s.key, etiqueta: s.nombre, icono: s.icono })),
        valor: solutoKey,
        cambiar: elegirSoluto,
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={<MedidorSaturacion soluto={masaSoluto} d={d} compacto />}
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Prepara la disolución" icono="fa-flask">
                <Deslizador label={`soluto: ${soluto.nombre}`} icon={soluto.icono} colr={accent} valor={fmtG(masaSoluto)} min={0} max={SOLUTO_MAX} step={SOLUTO_PASO} value={masaSoluto} onChange={cambiarSoluto} />
                <Deslizador label="agua (disolvente)" icon="fa-droplet" colr="#5BC8FF" valor={fmtG(masaAgua)} min={AGUAS[0]} max={AGUAS[AGUAS.length - 1]!} step={50} value={masaAgua} onChange={elegirAgua} />
              </Bloque>
              <Bloque titulo="¿Cuánto aguanta el agua?" icono="fa-gauge-high">
                <MedidorSaturacion soluto={masaSoluto} d={d} />
                <p style={{ margin: 0, color: T.text2 }}>
                  Con {fmtG(masaAgua)} de agua, el {soluto.nombre} se disuelve hasta <strong style={{ color: "#fff" }}>{fmtG(d.maxDisuelto)}</strong>. Lo que pase de esa marca no se disuelve.
                </p>
              </Bloque>
              <Bloque titulo="La concentración ahora" icono="fa-percent">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="soluto disuelto" value={fmtG(d.disuelto)} col={accent} />
                  <Dato label="disolvente" value={fmtG(masaAgua)} col="#5BC8FF" />
                  <Dato label="disolución" value={fmtG(d.masaDisolucion)} />
                  <Dato label="% en masa" value={fmtPct(d.concentracion)} col={nivelInfo.color} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  % en masa = ({fmtG(d.disuelto).replace(" g", "")} ÷ {fmtG(d.masaDisolucion).replace(" g", "")}) × 100 ={" "}
                  <strong style={{ color: nivelInfo.color, ...NUM }}>{fmtPct(d.concentracion)}</strong>. Estado: <strong style={{ color: nivelInfo.color }}>{nivelInfo.texto}</strong>.
                </p>
                {d.saturada && (
                  <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${SAT}66`, background: `${SAT}14` }}>
                    Disolución <span style={{ color: SAT, fontWeight: 800 }}>saturada</span>: el agua solo disuelve {fmtG(d.maxDisuelto)} de {soluto.nombre}. Agregar más soluto ya no sube el porcentaje; para disolverlo hay que agregar agua.
                  </p>
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
            <RetoDisolucionCard
              accent={accent}
              rgba={color.rgba}
              aprobado={ejercicioAprobado}
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
              playDrop={sonido ? () => audioRef.current?.gota() : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="La idea" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  La <strong style={{ color: T.text }}>concentración</strong> sube si agregas soluto y baja si agregas agua (la diluyes). Pero el agua tiene un límite: al rebasar la{" "}
                  <strong style={{ color: SAT }}>solubilidad</strong>, el soluto extra se queda sin disolver y la disolución está saturada.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CONCENTRACION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor: soluto agregado vs lo máximo que el agua disuelve ─────────────── */
function MedidorSaturacion({ soluto, d, compacto = false }: { soluto: number; d: ReturnType<typeof disolver>; compacto?: boolean }) {
  const tope = Math.max(soluto, d.maxDisuelto, 1) * 1.1;
  const marca = (d.maxDisuelto / tope) * 100;
  const col = d.saturada ? SAT : "#34D399";
  return (
    <div style={{ display: "grid", gap: compacto ? 6 : 8, width: compacto ? 190 : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>soluto agregado</span>
        <span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtG(soluto)}</span>
      </div>
      <div style={{ position: "relative", height: compacto ? 10 : 14, borderRadius: 7, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, (soluto / tope) * 100)}%`, height: "100%", background: col, transition: "width 120ms linear, background 120ms linear" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${marca}%`, width: 3, background: "#fff" }} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 900, color: col }}>
        {d.saturada ? `Pasó la marca (${fmtG(d.maxDisuelto)}): SATURADA` : `Aún cabe: límite ${fmtG(d.maxDisuelto)}`}
      </div>
    </div>
  );
}

const RETO_CSS = (accent: string, rgba: string) => `
  .rd-grid { display:grid; grid-template-columns: minmax(0,1fr); gap:18px; align-items:start; }
  .rd-chip { cursor:grab; user-select:none; border-radius:12px; border:1px solid ${T.line}; background:${T.glass};
    color:#fff; font-weight:800; font-size:14px; padding:12px 8px; display:flex; flex-direction:column; align-items:center; gap:4px;
    transition:all .14s ease; }
  .rd-chip:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; transform:translateY(-1px); }
  .rd-chip:active { cursor:grabbing; }
  .rd-chip[data-kind="soluto"]:hover { border-color:${accent}; box-shadow:0 0 16px -7px ${accent}; }
  .rd-chip[data-kind="agua"]:hover { border-color:#5BC8FF; box-shadow:0 0 16px -7px #5BC8FF; }
  .rd-vaso { border-radius:16px; border:2px dashed ${T.lineStrong}; background:${T.inset};
    min-height:158px; padding:16px; display:flex; flex-direction:column; justify-content:flex-end; transition:all .16s ease; position:relative; overflow:hidden; }
  .rd-vaso[data-over="true"] { border-color:${accent}; background:rgba(${rgba},0.12); }
  .rd-num { width:100%; box-sizing:border-box; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
    color:#fff; font-size:20px; font-weight:900; text-align:center; padding:13px 12px; outline:none; transition:border-color .15s; }
  .rd-num:focus { border-color:${accent}; }
  .rd-num::-webkit-outer-spin-button, .rd-num::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
  .rd-num { -moz-appearance:textfield; }
  .rd-btn { cursor:pointer; border:none; border-radius:12px; font-size:14px; font-weight:800; padding:13px 18px; transition:all .15s; }
  .rd-btn-primary { background:${accent}; color:#04121f; }
  .rd-btn-primary:hover:not(:disabled) { filter:brightness(1.08); }
  .rd-btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
  .rd-btn-ghost { background:${T.glass}; border:1px solid ${T.line}; color:#fff; }
  .rd-btn-ghost:hover { border-color:${accent}; }
`;

/* ── Tarjeta evaluable: arrastrar y soltar + calcular % m/m ──────────────── */

interface RetoProps {
  accent: string;
  rgba: string;
  aprobado: boolean;
  onAprobado: () => void;
  playSfx?: (ok: boolean) => void;
  playDrop?: () => void;
}

/** Fichas que el alumno puede arrastrar (o tocar) hacia el vaso. */
const CHIPS_SOLUTO = [5, 10, 20] as const;
const CHIPS_AGUA = [20, 40, 80] as const;

function RetoDisolucionCard({ accent, rgba, aprobado, onAprobado, playSfx, playDrop }: RetoProps) {
  const ej = EJERCICIO_A6;
  const [soluto, setSoluto] = useState(0);
  const [agua, setAgua] = useState(0);
  const [over, setOver] = useState(false);
  const [respuesta, setRespuesta] = useState("");
  const [comprobado, setComprobado] = useState(false);

  const masaDisol = soluto + agua;
  const pct = masaDisol > 0 ? (soluto / masaDisol) * 100 : 0;
  const num = Number(respuesta.replace(",", "."));

  const solutoOk = Math.abs(soluto - ej.solutoObjetivo) < 0.5;
  const aguaOk = Math.abs(agua - ej.aguaObjetivo) < 0.5;
  const pctOk = respuesta.trim() !== "" && !Number.isNaN(num) && Math.abs(num - ej.porcentajeObjetivo) <= ej.toleranciaError;
  const todoOk = solutoOk && aguaOk && pctOk;
  const puedeComprobar = masaDisol > 0 && respuesta.trim() !== "";

  const agregar = (kind: "soluto" | "agua", g: number) => {
    if (kind === "soluto") setSoluto((v) => v + g);
    else setAgua((v) => v + g);
    setComprobado(false);
    playDrop?.();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setOver(false);
    try {
      const raw = e.dataTransfer.getData("text/plain");
      if (!raw) return;
      const { kind, g } = JSON.parse(raw) as { kind: "soluto" | "agua"; g: number };
      if ((kind === "soluto" || kind === "agua") && typeof g === "number") agregar(kind, g);
    } catch {
      /* payload inválido: ignorar */
    }
  };

  const vaciar = () => {
    setSoluto(0);
    setAgua(0);
    setComprobado(false);
  };

  const comprobar = () => {
    setComprobado(true);
    if (todoOk) onAprobado();
    playSfx?.(todoOk);
  };

  const fmt1 = (n: number) => n.toLocaleString("es-MX", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div>
      <style>{RETO_CSS(accent, rgba)}</style>
      <Eyebrow>
        <i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: accent }} />
        Reto · arma la disolución y calcula el porcentaje
      </Eyebrow>

      {/* Enunciado verbatim del A6 */}
      <div style={{ marginTop: 4, fontSize: 15, fontWeight: 800, color: T.text, lineHeight: 1.5 }}>{ej.problema}</div>
      <div style={{ marginTop: 8, fontSize: 14, color: T.text2, lineHeight: 1.5, borderRadius: 12, border: `1px solid ${T.line}`, background: T.inset, padding: "10px 14px" }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: accent }} />
        {ej.contexto}
      </div>

      <div className="rd-grid" style={{ marginTop: 18 }}>
        {/* Columna izquierda: fichas arrastrables + vaso */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: T.text3, marginBottom: 8 }}>
            Arrastra (o toca) al vaso
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 9 }}>
            {CHIPS_SOLUTO.map((g) => (
              <div
                key={`s${g}`}
                className="rd-chip"
                data-kind="soluto"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ kind: "soluto", g }))}
                onClick={() => agregar("soluto", g)}
                title="Agregar sal (soluto)"
              >
                <i className="fa-solid fa-cubes-stacked" style={{ color: accent, fontSize: 15 }} />
                <span>{g} g sal</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
            {CHIPS_AGUA.map((g) => (
              <div
                key={`a${g}`}
                className="rd-chip"
                data-kind="agua"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ kind: "agua", g }))}
                onClick={() => agregar("agua", g)}
                title="Agregar agua (disolvente)"
              >
                <i className="fa-solid fa-droplet" style={{ color: "#5BC8FF", fontSize: 15 }} />
                <span>{g} g agua</span>
              </div>
            ))}
          </div>

          {/* Vaso (zona de soltado) */}
          <div
            className="rd-vaso"
            data-over={over}
            style={{ marginTop: 12 }}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
          >
            <div style={{ position: "absolute", top: 10, left: 14, fontSize: 14, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: T.text3 }}>
              <i className="fa-solid fa-prescription-bottle" style={{ marginRight: 6, color: accent }} />
              Vaso de la disolución
            </div>
            {masaDisol === 0 ? (
              <div style={{ textAlign: "center", color: T.text3, fontSize: 14, paddingBottom: 18 }}>
                Suelta aquí el soluto y el disolvente
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span style={{ borderRadius: 999, padding: "6px 12px", background: `rgba(${rgba},0.18)`, color: "#fff", fontWeight: 800, fontSize: 14, ...NUM }}>
                  <i className="fa-solid fa-cubes-stacked" style={{ marginRight: 7, color: accent }} />
                  {soluto} g sal
                </span>
                <span style={{ borderRadius: 999, padding: "6px 12px", background: "rgba(91,200,255,0.16)", color: "#fff", fontWeight: 800, fontSize: 14, ...NUM }}>
                  <i className="fa-solid fa-droplet" style={{ marginRight: 7, color: "#5BC8FF" }} />
                  {agua} g agua
                </span>
              </div>
            )}
          </div>

          <button className="rd-btn rd-btn-ghost" onClick={vaciar} disabled={masaDisol === 0} style={{ marginTop: 10, width: "100%", opacity: masaDisol === 0 ? 0.4 : 1 }}>
            <i className="fa-solid fa-arrow-rotate-left" style={{ marginRight: 8 }} />
            Vaciar el vaso
          </button>
        </div>

        {/* Columna derecha: lectura en vivo + respuesta */}
        <div>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Soluto" value={`${soluto} g`} col={accent} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Disolución" value={`${masaDisol} g`} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="% calculado" value={`${fmt1(pct)} %`} col={OK} />
          </div>
          <div style={{ marginTop: 11, fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            Masa de la disolución = soluto + disolvente ={" "}
            <strong style={{ color: T.text, ...NUM }}>{soluto} + {agua} = {masaDisol} g</strong>.
          </div>

          <div style={{ marginTop: 16, fontSize: 14, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: T.text3, marginBottom: 7 }}>
            Tu respuesta · {ej.unidades}
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <input
              className="rd-num"
              type="number"
              inputMode="decimal"
              placeholder="% m/m"
              value={respuesta}
              onChange={(e) => {
                setRespuesta(e.target.value);
                setComprobado(false);
              }}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 18, fontWeight: 900, color: T.text2 }}>%</span>
          </div>

          <button className="rd-btn rd-btn-primary" onClick={comprobar} disabled={!puedeComprobar} style={{ marginTop: 12, width: "100%" }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
            Comprobar
          </button>

          {/* Retroalimentación */}
          {comprobado && (
            <div
              style={{
                marginTop: 13,
                borderRadius: 13,
                border: `1px solid ${todoOk ? OK : "#FF8A3C"}66`,
                background: `${todoOk ? OK : "#FF8A3C"}14`,
                padding: "13px 16px",
                fontSize: 14,
                color: T.text,
                lineHeight: 1.5,
              }}
            >
              {todoOk ? (
                <>
                  <div style={{ fontWeight: 900, color: OK, marginBottom: 7 }}>
                    <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} />
                    ¡Correcto! {ej.respuestaFinal}.
                  </div>
                  <ol style={{ margin: "0 0 0 18px", padding: 0, color: T.text2, display: "flex", flexDirection: "column", gap: 3 }}>
                    {ej.pasosGuia.map((p, i) => (
                      <li key={i} style={{ ...NUM }}>{p}</li>
                    ))}
                  </ol>
                </>
              ) : (
                <div style={{ color: "#FFB27A" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
                  Aún no. {!solutoOk && "Necesitas 20 g de sal en el vaso. "}
                  {!aguaOk && "Necesitas 80 g de agua en el vaso. "}
                  {solutoOk && aguaOk && !pctOk && "El soluto y el agua están bien; revisa el cálculo: % = (soluto ÷ disolución) × 100."}
                </div>
              )}
            </div>
          )}

          {aprobado && !comprobado && (
            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 700, color: OK }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: 7 }} />
              Reto resuelto.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
