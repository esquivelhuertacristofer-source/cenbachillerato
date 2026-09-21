"use client";

/**
 * Laboratorio 3D — "Conjuntos y diagramas de Venn".
 * Práctica experimental anclada a PM-VI-P10-A2 (ejercicio «Encuesta con
 * diagrama de Venn: deportes en un grupo»; progresión 3 de la UAC PM-VI
 * "Pensamiento Matemático VI"). El marco teórico es la lectura A1 y el
 * glosario el A5, ambos verbatim.
 *
 * Tres modos:
 *  (1) Operaciones — fichas numeradas sobre un tablero de Venn; se mueven de
 *      zona con un toque y la operación elegida ilumina su zona exacta.
 *  (2) Leyes de De Morgan — cada lado de la igualdad se construye por separado
 *      en su propio tablero; al final se comparan las zonas marcadas.
 *  (3) Encuesta con Venn — el grupo del ejercicio A2 se acomoda empezando por
 *      la intersección, como indica la lectura.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { CONJUNTOS_VENN_FICHA } from "./conjuntos-venn-ficha";
import type { CapaVenn } from "./ConjuntosVennScene";
import {
  type Modo,
  type Zona,
  type Elemento,
  type Encuesta,
  type PasoDeMorgan,
  MODOS,
  MODOS_DEF,
  ZONAS,
  ZONA_ETQ,
  enAdeZona,
  enBdeZona,
  OPERACIONES,
  operacionPorId,
  zonasDe,
  mismasZonas,
  LEYES,
  leyPorId,
  pasosTotales,
  PRESETS,
  presetPorId,
  siguienteZona,
  porExtension,
  ENCUESTA_MAX,
  ENCUESTA_A2,
  repartir,
  encuestaValida,
  encuestaAleatoria,
  FASES_ENCUESTA,
  PROBLEMA,
  DEFINICION,
  LECTURA_A1,
  PREGUNTAS,
  INSTRUCCIONES,
  IDEAS,
  GLOSARIO,
  HECHOS,
  DATOS,
  CONTEXTO,
  FUENTE,
  RETO_A2,
} from "./conjuntos-venn-data";

const ConjuntosScene = dynamic(() => import("./ConjuntosVennScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-circle-nodes fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el diagrama de Venn en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-conjuntos-venn-reto";

const COL_A = "#60a5fa";
const COL_B = "#f472b6";
const COLOR_ZONA: Record<Zona, string> = { soloA: COL_A, soloB: COL_B, ambos: "#c084fc", ninguno: "#94a3b8" };

/** Capas de un lado de la ley en el paso i: los pasos intermedios con su color, el final con el del modo. */
function capasLado(pasos: PasoDeMorgan[], i: number, colorFinal: string): CapaVenn[] {
  const ultimo = pasos.length - 1;
  const k = Math.min(i, ultimo);
  if (k === ultimo) return [{ f: pasos[ultimo]!.f, color: colorFinal, alpha: 0.62 }];
  const paleta = pasos.length === 2 ? ["#94a3b8"] : [COL_A, COL_B];
  return pasos.slice(0, k + 1).map((p, j) => ({ f: p.f, color: paleta[j % paleta.length]!, alpha: 0.42 }));
}

function extensionDe(elementos: Elemento[], f: (a: boolean, b: boolean) => boolean): string {
  return porExtension(elementos.filter((e) => f(enAdeZona(e.zona), enBdeZona(e.zona))).map((e) => e.etq));
}

/* ── Tarjeta de estrellas: una encuesta sorpresa ──────────────────────── */
function EncuestaSorpresaCard({
  accent,
  rgba,
  mejor,
  onResultado,
  playSfx,
}: {
  accent: string;
  rgba: string;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [enc, setEnc] = useState<Encuesta>(() => encuestaAleatoria());
  const [union, setUnion] = useState("");
  const [ninguno, setNinguno] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const [fallo, setFallo] = useState(false);

  const rep = repartir(enc);

  const comprobar = () => {
    const u = Number(union.trim());
    const n = Number(ninguno.trim());
    if (!Number.isFinite(u) || !Number.isFinite(n) || union.trim() === "" || ninguno.trim() === "") return;
    const n1 = intentos + 1;
    setIntentos(n1);
    if (u === rep.union && n === rep.ninguno) {
      const est = Math.max(1, 4 - n1);
      setResuelto(est);
      setFallo(false);
      playSfx?.(true);
      onResultado(est);
    } else {
      setFallo(true);
      playSfx?.(false);
    }
  };

  const otra = () => {
    setEnc(encuestaAleatoria());
    setUnion("");
    setNinguno("");
    setIntentos(0);
    setResuelto(null);
    setFallo(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 13px",
    borderRadius: 10,
    border: `1px solid ${T.lineStrong}`,
    background: "rgba(2,12,28,0.55)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 800,
    ...NUM,
  } as const;

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          Encuesta sorpresa
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((s) => (
            <i key={s} className="fa-solid fa-star" style={{ fontSize: 13, color: s <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>

      <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, marginBottom: 14 }}>
        En un grupo de <strong style={{ color: "#fff", ...NUM }}>{enc.total}</strong> estudiantes, <strong style={{ color: COL_A, ...NUM }}>{enc.f}</strong> practican
        fútbol, <strong style={{ color: COL_B, ...NUM }}>{enc.b}</strong> practican básquetbol y <strong style={{ color: "#c084fc", ...NUM }}>{enc.ambos}</strong> practican
        ambos. ¿Cuántos practican al menos uno, y cuántos ninguno? Tres estrellas si aciertas al primer intento.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, alignItems: "end" }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "0.06em", color: T.text3 }}>F ∪ B (AL MENOS UNO)</span>
          <input value={union} onChange={(e) => setUnion(e.target.value)} inputMode="numeric" disabled={resuelto !== null} style={inputStyle} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "0.06em", color: T.text3 }}>(F ∪ B)ᶜ (NINGUNO)</span>
          <input
            value={ninguno}
            onChange={(e) => setNinguno(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") comprobar();
            }}
            inputMode="numeric"
            disabled={resuelto !== null}
            style={inputStyle}
          />
        </label>
        {resuelto === null ? (
          <button
            onClick={comprobar}
            style={{ cursor: "pointer", padding: "12px 18px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.18)`, color: "#fff", fontSize: 13, fontWeight: 900 }}
          >
            <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
            Comprobar
          </button>
        ) : (
          <button
            onClick={otra}
            style={{ cursor: "pointer", padding: "12px 18px", borderRadius: 10, border: `1px solid ${T.lineStrong}`, background: "transparent", color: "#fff", fontSize: 13, fontWeight: 900 }}
          >
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Otra encuesta
          </button>
        )}
      </div>

      {fallo && resuelto === null && (
        <div style={{ marginTop: 12, fontSize: 12, color: "#FF8A3C", lineHeight: 1.5 }}>
          <i className="fa-solid fa-rotate-left" style={{ marginRight: 7 }} />
          Todavía no. Pista: al sumar fútbol y básquetbol, los {enc.ambos} que practican ambos quedaron contados dos veces. Intento {intentos}.
        </div>
      )}
      {resuelto !== null && (
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            {[1, 2, 3].map((s) => (
              <i key={s} className="fa-solid fa-star" style={{ fontSize: 15, color: s <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 12.5, fontWeight: 900, color: OK, marginLeft: 4 }}>{intentos === 1 ? "Al primer intento" : `En ${intentos} intentos`}</span>
          </div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, ...NUM }}>
            F ∪ B = {enc.f} + {enc.b} − {enc.ambos} = {rep.union}. Ninguno = {enc.total} − {rep.union} = {rep.ninguno}.
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabConjuntosVenn({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("operaciones");

  // ── Operaciones
  const [presetId, setPresetId] = useState(PRESETS[0]!.id);
  const [elementos, setElementos] = useState<Elemento[]>(() => PRESETS[0]!.elementos.map((e) => ({ ...e })));
  const [opId, setOpId] = useState(OPERACIONES[0]!.id);

  // ── De Morgan
  const [leyId, setLeyId] = useState<string>(LEYES[0]!.id);
  const [paso, setPaso] = useState(0);

  // ── Encuesta
  const [enc, setEnc] = useState<Encuesta>(ENCUESTA_A2);
  const [fase, setFase] = useState(0);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // Logros pegajosos: se marcan cuando ocurren y no se pierden al reiniciar.
  const [tocoFicha, setTocoFicha] = useState(false);
  const [opsVistas, setOpsVistas] = useState<Set<string>>(() => new Set([OPERACIONES[0]!.id]));
  const [leyesCompletas, setLeyesCompletas] = useState<Set<string>>(() => new Set());
  const [encuestaCompleta, setEncuestaCompleta] = useState(false);
  const [predicho, setPredicho] = useState(false);

  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setPredicho(true);
      guardaEstrellas(est);
    },
    [guardaEstrellas],
  );

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

  const blip = () => {
    if (sonido) audioRef.current?.blip();
  };

  /* ── Derivados ─────────────────────────────────────────────────────── */
  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  const preset = presetPorId(presetId);
  const op = operacionPorId(opId);
  const conjA = elementos.filter((e) => enAdeZona(e.zona)).map((e) => e.etq);
  const conjB = elementos.filter((e) => enBdeZona(e.zona)).map((e) => e.etq);
  const conjU = elementos.map((e) => e.etq);
  const resultado = extensionDe(elementos, op.f);
  const nResultado = elementos.filter((e) => op.f(enAdeZona(e.zona), enBdeZona(e.zona))).length;

  const ley = leyPorId(leyId);
  const totalPasos = pasosTotales(ley);
  const ultimoPaso = paso >= totalPasos - 1;
  const capasIzq = useMemo(() => capasLado(ley.izquierda.pasos, paso, modoCol), [ley, paso, modoCol]);
  const capasDer = useMemo(() => capasLado(ley.derecha.pasos, paso, modoCol), [ley, paso, modoCol]);
  const finalIzq = ley.izquierda.pasos[ley.izquierda.pasos.length - 1]!;
  const finalDer = ley.derecha.pasos[ley.derecha.pasos.length - 1]!;
  const coinciden = ultimoPaso ? mismasZonas(zonasDe(finalIzq.f), zonasDe(finalDer.f)) : null;
  const pasoIzq = ley.izquierda.pasos[Math.min(paso, ley.izquierda.pasos.length - 1)]!;
  const pasoDer = ley.derecha.pasos[Math.min(paso, ley.derecha.pasos.length - 1)]!;

  const reparto = repartir(enc);
  const errorEnc = encuestaValida(enc);

  /* ── Acciones ──────────────────────────────────────────────────────── */
  const bump = () => setResetNonce((n) => n + 1);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
    bump();
  };

  const elegirPreset = (id: string) => {
    setPresetId(id);
    setElementos(presetPorId(id).elementos.map((e) => ({ ...e })));
    blip();
  };

  const tocarElemento = useCallback(
    (i: number) => {
      setElementos((prev) => prev.map((e, k) => (k === i ? { ...e, zona: siguienteZona(e.zona) } : e)));
      setTocoFicha(true);
      if (sonido) audioRef.current?.blip();
    },
    [sonido],
  );

  const elegirOp = (id: string) => {
    setOpId(id);
    setOpsVistas((s) => (s.has(id) ? s : new Set(s).add(id)));
    blip();
  };

  const elegirLey = (id: string) => {
    setLeyId(id);
    setPaso(0);
    blip();
  };

  const avanzarPaso = () => {
    const nx = Math.min(paso + 1, totalPasos - 1);
    setPaso(nx);
    if (nx === totalPasos - 1) {
      setLeyesCompletas((s) => (s.has(leyId) ? s : new Set(s).add(leyId)));
      if (sonido) audioRef.current?.correcto();
    } else blip();
  };

  const cambiarEnc = (campo: keyof Encuesta, v: number) => {
    setEnc((prev) => {
      const next = { ...prev, [campo]: v };
      next.f = Math.min(next.f, next.total);
      next.b = Math.min(next.b, next.total);
      next.ambos = Math.min(next.ambos, next.f, next.b);
      return next;
    });
  };

  const avanzarFase = () => {
    if (errorEnc) return;
    const nx = Math.min(fase + 1, FASES_ENCUESTA.length - 1);
    setFase(nx);
    if (nx === FASES_ENCUESTA.length - 1) {
      setEncuestaCompleta(true);
      if (sonido) audioRef.current?.correcto();
    } else blip();
  };

  const reiniciar = () => {
    if (modo === "operaciones") setElementos(preset.elementos.map((e) => ({ ...e })));
    else if (modo === "demorgan") setPaso(0);
    else setFase(0);
    bump();
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Mover al menos una ficha a otra zona y ver cómo se reescriben A y B", done: tocoFicha },
    { t: "Probar al menos cuatro operaciones distintas", done: opsVistas.size >= 4 },
    { t: "Construir la primera ley de De Morgan hasta comparar las zonas", done: leyesCompletas.has("ley1") },
    { t: "Construir la segunda ley de De Morgan", done: leyesCompletas.has("ley2") },
    { t: "Acomodar una encuesta completa empezando por la intersección", done: encuestaCompleta },
    { t: "Resolver una encuesta sorpresa y ganar estrellas", done: predicho },
    { t: "Resolver el reto evaluable (ejercicio A2)", done: ejercicioAprobado },
  ];

  /* ── Pie del visor ─────────────────────────────────────────────────── */
  const pie: string =
    modo === "operaciones"
      ? `${op.notacion} = ${resultado}. ${op.lectura} Con A = ${porExtension(conjA)} y B = ${porExtension(conjB)} dentro de U = ${porExtension(conjU)}.`
      : modo === "demorgan"
        ? ultimoPaso
          ? `${ley.enunciado}: ${ley.enPalabras}. Las dos construcciones ${coinciden ? "marcan las mismas zonas" : "no marcan las mismas zonas"}.`
          : `Izquierda: ${pasoIzq.etq}. Derecha: ${pasoDer.etq}.`
        : errorEnc
          ? errorEnc
          : `${FASES_ENCUESTA[fase]!.etq}. Solo F ${reparto.soloF}, solo B ${reparto.soloB}, ambos ${reparto.ambos}; F ∪ B = ${enc.f} + ${enc.b} − ${enc.ambos} = ${reparto.union}; ninguno = ${enc.total} − ${reparto.union} = ${reparto.ninguno}.`;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {DEFINICION}
      </div>
    </div>
  );

  const sub = (txt: string, extra?: ReactNode) => (
    <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>
      {txt}
      {extra}
    </div>
  );

  /* ── Panel de control por modo ─────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "operaciones") {
    control = (
      <>
        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "0 0 8px", textTransform: "uppercase" }}>Juego de conjuntos</div>
        <div className="cv-opts">
          {PRESETS.map((p) => {
            const on = p.id === presetId;
            return (
              <button key={p.id} className="cv-opt" data-on={on} onClick={() => elegirPreset(p.id)} style={{ ["--cvc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent" }}>
                {p.etq}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>{preset.nota}</div>

        {sub("Operación")}
        <div className="cv-opts">
          {OPERACIONES.map((o) => {
            const on = o.id === opId;
            return (
              <button key={o.id} className="cv-opt" data-on={on} onClick={() => elegirOp(o.id)} style={{ ["--cvc" as string]: accent, background: on ? `rgba(${color.rgba},0.18)` : "transparent", fontSize: 14, minWidth: 64 }}>
                {o.notacion}
              </button>
            );
          })}
        </div>

        {sub("Elementos de U — toca uno para cambiarlo de zona")}
        <div className="cv-opts">
          {elementos.map((e, i) => (
            <button
              key={e.etq}
              className="cv-chip"
              onClick={() => tocarElemento(i)}
              title={`${e.etq}: ${ZONA_ETQ[e.zona]}`}
              style={{ borderColor: `${COLOR_ZONA[e.zona]}88`, background: `${COLOR_ZONA[e.zona]}22` }}
            >
              <span style={{ fontWeight: 900, color: "#fff", ...NUM }}>{e.etq}</span>
              <span style={{ fontSize: 10, color: COLOR_ZONA[e.zona], fontWeight: 800 }}>{ZONA_ETQ[e.zona]}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12`, fontFamily: "ui-monospace, monospace", fontSize: 12.5, lineHeight: 1.75, color: "#eaf0fb", ...NUM }}>
          <div>
            U = {porExtension(conjU)}
          </div>
          <div>
            <span style={{ color: COL_A }}>A</span> = {porExtension(conjA)}
          </div>
          <div>
            <span style={{ color: COL_B }}>B</span> = {porExtension(conjB)}
          </div>
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${T.line}`, color: "#fff", fontWeight: 900 }}>
            <span style={{ color: accent }}>{op.notacion}</span> = {resultado} <span style={{ color: T.text3, fontWeight: 700 }}>· {nResultado} elemento{nResultado === 1 ? "" : "s"}</span>
          </div>
        </div>
      </>
    );
  } else if (modo === "demorgan") {
    control = (
      <>
        <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "0 0 8px", textTransform: "uppercase" }}>Ley</div>
        <div className="cv-opts">
          {LEYES.map((l) => {
            const on = l.id === leyId;
            return (
              <button key={l.id} className="cv-opt" data-on={on} onClick={() => elegirLey(l.id)} style={{ ["--cvc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent", fontSize: 13 }}>
                {l.enunciado}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: T.text2 }}>{ley.enPalabras}</div>

        {sub("Construcción", <span style={{ color: "#fff", ...NUM }}> — paso {paso + 1} de {totalPasos}</span>)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { lado: ley.izquierda, actual: pasoIzq },
            { lado: ley.derecha, actual: pasoDer },
          ].map(({ lado, actual }, k) => (
            <div key={k} style={{ padding: "10px 12px", borderRadius: 11, border: `1px solid ${T.line}`, background: "rgba(4,10,22,0.4)" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 6 }}>{lado.notacion}</div>
              <div style={{ display: "grid", gap: 5 }}>
                {lado.pasos.map((p, j) => {
                  const hecho = j <= Math.min(paso, lado.pasos.length - 1);
                  const esActual = p === actual;
                  return (
                    <div key={j} style={{ fontSize: 11.5, color: esActual ? "#fff" : hecho ? T.text2 : T.text3, fontWeight: esActual ? 800 : 600, display: "flex", gap: 7 }}>
                      <i className={`fa-solid ${hecho ? "fa-circle-check" : "fa-circle"}`} style={{ marginTop: 2, fontSize: 10, color: hecho ? modoCol : "rgba(255,255,255,0.2)" }} />
                      {p.etq}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="cv-opts" style={{ marginTop: 12 }}>
          <button className="cv-opt" data-on={!ultimoPaso} disabled={ultimoPaso} onClick={avanzarPaso} style={{ ["--cvc" as string]: modoCol, background: !ultimoPaso ? `${modoCol}1f` : "transparent", opacity: ultimoPaso ? 0.45 : 1 }}>
            <i className="fa-solid fa-forward-step" style={{ marginRight: 8, color: modoCol }} />
            Siguiente paso
          </button>
          <button className="cv-opt" data-on={false} onClick={() => setPaso(0)} style={{ ["--cvc" as string]: "rgba(255,255,255,0.2)" }}>
            <i className="fa-solid fa-rotate-left" style={{ marginRight: 8, color: T.text3 }} />
            Desde el principio
          </button>
        </div>

        {ultimoPaso && (
          <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, border: `1px solid ${coinciden ? `${OK}66` : "#f8717166"}`, background: coinciden ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)" }}>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: coinciden ? OK : "#f87171", marginBottom: 6 }}>
              <i className={`fa-solid ${coinciden ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginRight: 8 }} />
              {coinciden ? "Mismas zonas: la ley se cumple" : "Las zonas no coinciden"}
            </div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.6, fontFamily: "ui-monospace, monospace", ...NUM }}>
              Con el juego «{preset.etq}»:
              <br />
              {ley.izquierda.notacion} = {extensionDe(elementos, finalIzq.f)}
              <br />
              {ley.derecha.notacion} = {extensionDe(elementos, finalDer.f)}
            </div>
          </div>
        )}
      </>
    );
  } else {
    const deslizador = (etq: string, campo: keyof Encuesta, max: number, col: string) => (
      <label style={{ display: "grid", gap: 4 }}>
        <span style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800, color: T.text2 }}>
          <span>{etq}</span>
          <span style={{ color: col, ...NUM }}>{enc[campo]}</span>
        </span>
        <input type="range" min={campo === "total" ? 10 : 0} max={max} value={enc[campo]} onChange={(e) => cambiarEnc(campo, Number(e.target.value))} style={{ width: "100%", accentColor: col }} aria-label={etq} />
      </label>
    );
    control = (
      <>
        <div style={{ display: "grid", gap: 10 }}>
          {deslizador("Estudiantes del grupo (U)", "total", ENCUESTA_MAX, "#e2e8f0")}
          {deslizador("Practican fútbol (F)", "f", enc.total, COL_A)}
          {deslizador("Practican básquetbol (B)", "b", enc.total, COL_B)}
          {deslizador("Practican ambos (F ∩ B)", "ambos", Math.min(enc.f, enc.b), "#c084fc")}
        </div>
        <div className="cv-opts" style={{ marginTop: 12 }}>
          <button
            className="cv-opt"
            data-on={enc.total === ENCUESTA_A2.total && enc.f === ENCUESTA_A2.f && enc.b === ENCUESTA_A2.b && enc.ambos === ENCUESTA_A2.ambos}
            onClick={() => setEnc(ENCUESTA_A2)}
            style={{ ["--cvc" as string]: modoCol }}
          >
            <i className="fa-solid fa-file-lines" style={{ marginRight: 8, color: modoCol }} />
            Datos del ejercicio A2
          </button>
        </div>

        {errorEnc && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#f87171", lineHeight: 1.5 }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 7 }} />
            {errorEnc}
          </div>
        )}

        {sub("Acomodar el grupo", <span style={{ color: "#fff" }}> — {FASES_ENCUESTA[fase]!.etq}</span>)}
        <div className="cv-opts">
          <button
            className="cv-opt"
            data-on={fase < FASES_ENCUESTA.length - 1 && !errorEnc}
            disabled={fase >= FASES_ENCUESTA.length - 1 || !!errorEnc}
            onClick={avanzarFase}
            style={{ ["--cvc" as string]: modoCol, background: fase < FASES_ENCUESTA.length - 1 && !errorEnc ? `${modoCol}1f` : "transparent", opacity: fase >= FASES_ENCUESTA.length - 1 || errorEnc ? 0.45 : 1 }}
          >
            <i className="fa-solid fa-forward-step" style={{ marginRight: 8, color: modoCol }} />
            {fase === 0 ? "Empezar por la intersección" : "Acomodar la siguiente zona"}
          </button>
          <button className="cv-opt" data-on={false} onClick={() => setFase(0)} style={{ ["--cvc" as string]: "rgba(255,255,255,0.2)" }}>
            <i className="fa-solid fa-rotate-left" style={{ marginRight: 8, color: T.text3 }} />
            Volver a empezar
          </button>
        </div>

        <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Readout label="Solo F" value={errorEnc ? "—" : String(reparto.soloF)} col={COL_A} />
            <Readout label="Ambos" value={String(reparto.ambos)} col="#c084fc" />
            <Readout label="Solo B" value={errorEnc ? "—" : String(reparto.soloB)} col={COL_B} />
            <Readout label="F ∪ B" value={errorEnc ? "—" : String(reparto.union)} col={accent} />
            <Readout label="Ninguno" value={errorEnc ? "—" : String(reparto.ninguno)} />
          </div>
          {!errorEnc && (
            <div style={{ marginTop: 4, fontSize: 12, color: T.text2, lineHeight: 1.55, fontFamily: "ui-monospace, monospace", ...NUM }}>
              |F ∪ B| = |F| + |B| − |F ∩ B| = {enc.f} + {enc.b} − {enc.ambos} = {reparto.union}
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes cvPulse { 0%,100%{ box-shadow:0 0 0 0 var(--cvd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .cv-live-dot { animation: cvPulse 1.6s ease-in-out infinite; }
        .cv-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .cv-grid { grid-template-columns: 1fr; } }
        .cv-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .cv-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .cv-icobtn:hover { background:rgba(255,255,255,0.12); }
        .cv-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .cv-tab { cursor:pointer; border:1px solid var(--cvc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .cv-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .cv-tab:hover { background:rgba(255,255,255,0.06); }
        .cv-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .cv-opt { cursor:pointer; border:1px solid var(--cvc); border-radius:10px; padding:9px 12px; font-size:12px;
          font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .cv-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.66); }
        .cv-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .cv-chip { cursor:pointer; display:grid; gap:2px; text-align:center; min-width:62px; padding:7px 9px; border-radius:10px;
          border:1px solid; font-size:14px; transition:transform .12s; }
        .cv-chip:hover { transform:translateY(-1px); }
        @media (max-width: 1000px){ .cv-bottom { grid-template-columns: 1fr !important; } }

        .cv-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .cv-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .cv-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06121e 0%,#040a16 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .cv-drawer[data-open="true"] { transform:translateX(0); }
        .cv-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .cv-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .cv-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .cv-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .cv-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .cv-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="cv-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="cv-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--cvc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="cv-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 58vh, 660px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <ConjuntosScene
                modo={modo}
                elementos={elementos}
                operacion={op.f}
                onTocarElemento={tocarElemento}
                capasIzq={capasIzq}
                capasDer={capasDer}
                notacionIzq={ley.izquierda.notacion}
                notacionDer={ley.derecha.notacion}
                coinciden={coinciden}
                reparto={reparto}
                total={errorEnc ? 0 : enc.total}
                fase={errorEnc ? 0 : fase}
                accent={accent}
                modoColor={modoCol}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="cv-live-dot" style={{ ["--cvd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", ...NUM }}>
                {modo === "operaciones" ? op.notacion : modo === "demorgan" ? ley.enunciado : `U = ${enc.total}`}
              </span>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="cv-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="cv-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              {modo === "demorgan" && (
                <button className="cv-icobtn" onClick={avanzarPaso} disabled={ultimoPaso} title="Siguiente paso">
                  <i className="fa-solid fa-forward-step" />
                </button>
              )}
              {modo === "encuesta" && (
                <button className="cv-icobtn" onClick={avanzarFase} disabled={fase >= FASES_ENCUESTA.length - 1 || !!errorEnc} title="Acomodar la siguiente zona">
                  <i className="fa-solid fa-forward-step" />
                </button>
              )}
              <button className="cv-icobtn" onClick={reiniciar} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>{pie}</div>
            </div>

            <button className="cv-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                Controles — {def.etq}
              </Eyebrow>
              <span style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: "#7dd3fc", border: "1px solid #7dd3fc55", borderRadius: 6, padding: "3px 7px" }}>
                {def.fuente === "A2" ? "EJERCICIO A2" : def.fuente === "A5" ? "GLOSARIO A5" : "LECTURA A1"}
              </span>
            </div>
            {control}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-circle-nodes" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Conjuntos y diagramas de Venn</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />
              Lectura A1 — Conjuntos
            </Eyebrow>
            <div style={{ display: "grid", gap: 9, marginBottom: 12 }}>
              {LECTURA_A1.map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA REFLEXIONAR</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  {q}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Cómo usar el laboratorio
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {INSTRUCCIONES.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Eyebrow>
                <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
                Objetivos de la sesión
              </Eyebrow>
              <span style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
                {objetivos.filter((o) => o.done).length}/{objetivos.length}
              </span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {objetivos.map((o, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ marginTop: 2, fontSize: 13, color: o.done ? OK : "rgba(255,255,255,0.22)" }} />
                  <span style={{ fontSize: 12, color: o.done ? "#fff" : T.text2, lineHeight: 1.4 }}>{o.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Datos + ideas clave ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="cv-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />
            Datos clave
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", overflowWrap: "anywhere" }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-database" style={{ marginRight: 8, color: accent }} />
              De Morgan fuera del aula
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{CONTEXTO}</div>
          </div>

          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              ¿Sabías que? (quiz A4)
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {HECHOS.map((h, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario (A5)
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                    <i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} />
                    {gi.ejemplo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            Ideas clave
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
            {IDEAS.map((x, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                {x}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-table-cells" style={{ marginRight: 8, color: accent }} />
              Las cuatro zonas
            </Eyebrow>
            <div style={{ display: "grid", gap: 6 }}>
              {ZONAS.map((z) => (
                <div key={z} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, color: T.text2 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: COLOR_ZONA[z], flexShrink: 0 }} />
                  {ZONA_ETQ[z]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1, las preguntas de reflexión, el glosario A5, los hechos del quiz A4 y el ejercicio A2 son <strong>verbatim</strong> del
          MCCEMS 2025. Los conjuntos que aparecen escritos por extensión se <strong>calculan</strong> a partir de la zona de cada ficha, y las zonas
          iluminadas salen de evaluar la condición de cada operación punto por punto del tablero. Que las dos construcciones de una ley de De
          Morgan coincidan es un resultado calculado, no un letrero. Los muñecos de la encuesta son una representación <strong>esquemática</strong>{" "}
          del grupo. Fuente: {FUENTE}
        </span>
      </div>

      <EncuestaSorpresaCard
        accent={accent}
        rgba={color.rgba}
        mejor={mejorEstrellas}
        onResultado={registraEstrellas}
        playSfx={(ok) => {
          if (!sonido) return;
          if (ok) audioRef.current?.correcto();
          else audioRef.current?.incorrecto();
        }}
      />

      <RetoNumericoCard
        reto={RETO_A2}
        accent={accent}
        aprobado={ejercicioAprobado}
        onAprobado={() => setEjercicioAprobado(true)}
        playSfx={(ok) => {
          if (!sonido) return;
          if (ok) audioRef.current?.correcto();
          else audioRef.current?.incorrecto();
        }}
      />

      <div className="cv-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="cv-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="cv-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="cv-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="cv-drawer-body">
          <FichaTeorica data={CONJUNTOS_VENN_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
