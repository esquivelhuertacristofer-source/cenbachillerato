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
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Deslizador, Dato } from "./_shell";
import type { ObjetivoLab } from "./_objetivos";
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
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando el diagrama de Venn en 3D…</span>
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
          <span style={{ fontSize: 14.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((s) => (
            <i key={s} className="fa-solid fa-star" style={{ fontSize: 14, color: s <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>

      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, marginBottom: 14 }}>
        En un grupo de <strong style={{ color: "#fff", ...NUM }}>{enc.total}</strong> estudiantes, <strong style={{ color: COL_A, ...NUM }}>{enc.f}</strong> practican
        fútbol, <strong style={{ color: COL_B, ...NUM }}>{enc.b}</strong> practican básquetbol y <strong style={{ color: "#c084fc", ...NUM }}>{enc.ambos}</strong> practican
        ambos. ¿Cuántos practican al menos uno, y cuántos ninguno? Tres estrellas si aciertas al primer intento.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, alignItems: "end" }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14.5, fontWeight: 900, letterSpacing: "0.06em", color: T.text3 }}>F ∪ B (AL MENOS UNO)</span>
          <input value={union} onChange={(e) => setUnion(e.target.value)} inputMode="numeric" disabled={resuelto !== null} style={inputStyle} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14.5, fontWeight: 900, letterSpacing: "0.06em", color: T.text3 }}>(F ∪ B)ᶜ (NINGUNO)</span>
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
            style={{ cursor: "pointer", padding: "12px 18px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.18)`, color: "#fff", fontSize: 14, fontWeight: 900 }}
          >
            <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
            Comprobar
          </button>
        ) : (
          <button
            onClick={otra}
            style={{ cursor: "pointer", padding: "12px 18px", borderRadius: 10, border: `1px solid ${T.lineStrong}`, background: "transparent", color: "#fff", fontSize: 14, fontWeight: 900 }}
          >
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Otra encuesta
          </button>
        )}
      </div>

      {fallo && resuelto === null && (
        <div style={{ marginTop: 12, fontSize: 14, color: "#FF8A3C", lineHeight: 1.5 }}>
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
            <span style={{ fontSize: 14.5, fontWeight: 900, color: OK, marginLeft: 4 }}>{intentos === 1 ? "Al primer intento" : `En ${intentos} intentos`}</span>
          </div>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, ...NUM }}>
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
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // Logros pegajosos: se marcan cuando ocurren y no se pierden al reiniciar.
  const [tocoFicha, setTocoFicha] = useState(false);
  const [opsVistas, setOpsVistas] = useState<Set<string>>(() => new Set([OPERACIONES[0]!.id]));
  const [leyesCompletas, setLeyesCompletas] = useState<Set<string>>(() => new Set());
  const [encuestaCompleta, setEncuestaCompleta] = useState(false);
  const [predicho, setPredicho] = useState(false);
  const [movioAmbos, setMovioAmbos] = useState(false);

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
    if (campo === "ambos") setMovioAmbos(true);
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
  const objetivos: ObjetivoLab[] = [
    { txt: "Mover al menos una ficha a otra zona y ver cómo se reescriben A y B", done: tocoFicha },
    { txt: "Probar al menos cuatro operaciones distintas", done: opsVistas.size >= 4 },
    { txt: "Construir la primera ley de De Morgan hasta comparar las zonas", done: leyesCompletas.has("ley1") },
    { txt: "Construir la segunda ley de De Morgan", done: leyesCompletas.has("ley2") },
    { txt: "En la encuesta, sube «ambos» y mira cuántos se contaban dos veces", done: movioAmbos },
    { txt: "Acomodar una encuesta completa empezando por la intersección", done: encuestaCompleta },
    { txt: "Resolver una encuesta sorpresa y ganar estrellas", done: predicho },
    { txt: "Resolver el reto evaluable (ejercicio A2)", done: ejercicioAprobado },
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
      <div style={{ fontSize: 14.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {DEFINICION}
      </div>
    </div>
  );

  const sub = (txt: string, extra?: ReactNode) => (
    <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>
      {txt}
      {extra}
    </div>
  );

  /* ── Panel de control por modo ─────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "operaciones") {
    control = (
      <>
        <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "0 0 8px", textTransform: "uppercase" }}>Juego de conjuntos</div>
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
        <div style={{ marginTop: 8, fontSize: 14.5, color: T.text3, lineHeight: 1.5 }}>{preset.nota}</div>

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
              <span style={{ fontSize: 14, color: COLOR_ZONA[e.zona], fontWeight: 800 }}>{ZONA_ETQ[e.zona]}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12`, fontFamily: "ui-monospace, monospace", fontSize: 14.5, lineHeight: 1.75, color: "#eaf0fb", ...NUM }}>
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
        <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "0 0 8px", textTransform: "uppercase" }}>Ley</div>
        <div className="cv-opts">
          {LEYES.map((l) => {
            const on = l.id === leyId;
            return (
              <button key={l.id} className="cv-opt" data-on={on} onClick={() => elegirLey(l.id)} style={{ ["--cvc" as string]: modoCol, background: on ? `${modoCol}1f` : "transparent", fontSize: 14 }}>
                {l.enunciado}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: T.text2 }}>{ley.enPalabras}</div>

        {sub("Construcción", <span style={{ color: "#fff", ...NUM }}> — paso {paso + 1} de {totalPasos}</span>)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 10 }}>
          {[
            { lado: ley.izquierda, actual: pasoIzq },
            { lado: ley.derecha, actual: pasoDer },
          ].map(({ lado, actual }, k) => (
            <div key={k} style={{ padding: "10px 12px", borderRadius: 11, border: `1px solid ${T.line}`, background: "rgba(4,10,22,0.4)" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 6 }}>{lado.notacion}</div>
              <div style={{ display: "grid", gap: 5 }}>
                {lado.pasos.map((p, j) => {
                  const hecho = j <= Math.min(paso, lado.pasos.length - 1);
                  const esActual = p === actual;
                  return (
                    <div key={j} style={{ fontSize: 14.5, color: esActual ? "#fff" : hecho ? T.text2 : T.text3, fontWeight: esActual ? 800 : 600, display: "flex", gap: 7 }}>
                      <i className={`fa-solid ${hecho ? "fa-circle-check" : "fa-circle"}`} style={{ marginTop: 2, fontSize: 14, color: hecho ? modoCol : "rgba(255,255,255,0.2)" }} />
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
            <div style={{ fontSize: 14.5, fontWeight: 900, color: coinciden ? OK : "#f87171", marginBottom: 6 }}>
              <i className={`fa-solid ${coinciden ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginRight: 8 }} />
              {coinciden ? "Mismas zonas: la ley se cumple" : "Las zonas no coinciden"}
            </div>
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, fontFamily: "ui-monospace, monospace", ...NUM }}>
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
      <Deslizador label={etq} colr={col} valor={String(enc[campo])} min={campo === "total" ? 10 : 0} max={Math.max(max, campo === "total" ? 10 : 1)} step={1} value={enc[campo]} onChange={(v) => cambiarEnc(campo, v)} />
    );
    const escala = Math.max(enc.total, enc.f + enc.b, 1);
    const pct = (n: number) => `${(Math.max(n, 0) / escala) * 100}%`;
    control = (
      <>
        <div style={{ display: "grid", gap: 4 }}>
          {deslizador("Estudiantes del grupo (U)", "total", ENCUESTA_MAX, "#e2e8f0")}
          {deslizador("Practican fútbol (F)", "f", enc.total, COL_A)}
          {deslizador("Practican básquetbol (B)", "b", enc.total, COL_B)}
          {deslizador("Practican ambos (F ∩ B)", "ambos", Math.min(enc.f, enc.b), "#c084fc")}
        </div>
        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>El doble conteo: sube «ambos» y mira la barra roja</div>
          <div style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 14, color: T.text2 }}>F + B = {enc.f + enc.b} (sumando sin cuidado)</span>
            <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,0.1)" }}>
              <div style={{ width: pct(reparto.union), background: accent, transition: "width 160ms linear" }} />
              <div style={{ width: pct(enc.ambos), background: "#f87171", transition: "width 160ms linear" }} title="contados dos veces" />
            </div>
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 14, color: T.text2 }}>F ∪ B = {errorEnc ? "—" : reparto.union} (cada estudiante una vez)</span>
            <div style={{ height: 16, borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,0.1)" }}>
              <div style={{ width: pct(reparto.union), height: "100%", background: accent, transition: "width 160ms linear" }} />
            </div>
          </div>
          <span style={{ fontSize: 14, color: "#f87171" }}>Rojo: {enc.ambos} estudiante{enc.ambos === 1 ? "" : "s"} contado{enc.ambos === 1 ? "" : "s"} dos veces.</span>
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
          <div style={{ marginTop: 10, fontSize: 14, color: "#f87171", lineHeight: 1.5 }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            <Dato label="Solo F" value={errorEnc ? "—" : String(reparto.soloF)} col={COL_A} />
            <Dato label="Ambos" value={String(reparto.ambos)} col="#c084fc" />
            <Dato label="Solo B" value={errorEnc ? "—" : String(reparto.soloB)} col={COL_B} />
            <Dato label="F ∪ B" value={errorEnc ? "—" : String(reparto.union)} col={accent} />
            <Dato label="Ninguno" value={errorEnc ? "—" : String(reparto.ninguno)} />
          </div>
          {!errorEnc && (
            <div style={{ marginTop: 4, fontSize: 14, color: T.text2, lineHeight: 1.55, fontFamily: "ui-monospace, monospace", ...NUM }}>
              |F ∪ B| = |F| + |B| − |F ∩ B| = {enc.f} + {enc.b} − {enc.ambos} = {reparto.union}
            </div>
          )}
        </div>
      </>
    );
  }

  const lectura: ReactNode =
    modo === "operaciones"
      ? `${op.notacion} = ${resultado}`
      : modo === "demorgan"
        ? ultimoPaso
          ? coinciden
            ? "Las dos construcciones marcan las mismas zonas"
            : "Las zonas no coinciden"
          : `Izquierda: ${pasoIzq.etq}`
        : errorEnc
          ? "Datos imposibles: ajusta los deslizadores"
          : `F ∪ B = ${reparto.union} · ninguno = ${reparto.ninguno}`;

  const sonidoOk = (ok: boolean) => {
    if (!sonido) return;
    if (ok) audioRef.current?.correcto();
    else audioRef.current?.incorrecto();
  };

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
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
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq, icono: MODOS_DEF[m].icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          {modo === "demorgan" && <BotonHerramienta icono="fa-forward-step" titulo="Siguiente paso" onClick={avanzarPaso} />}
          {modo === "encuesta" && <BotonHerramienta icono="fa-forward-step" titulo="Acomodar la siguiente zona" onClick={avanzarFase} />}
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
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
              <style>{`
                .cv-opts { display:flex; flex-wrap:wrap; gap:7px; }
                .cv-opt { cursor:pointer; border:1px solid var(--cvc); border-radius:10px; padding:9px 12px; font-size:14px;
                  font-weight:800; color:#fff; background:transparent; transition:all .15s; }
                .cv-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.66); }
                .cv-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
                .cv-chip { cursor:pointer; display:grid; gap:2px; text-align:center; min-width:62px; padding:7px 9px; border-radius:10px;
                  border:1px solid; font-size:14px; transition:transform .12s; }
                .cv-chip:hover { transform:translateY(-1px); }
              `}</style>
              <Bloque titulo={def.etq} icono={def.icono}>
                {control}
              </Bloque>
              <Bloque titulo="Lo que se lee en el tablero" icono="fa-eye">
                <p style={{ margin: 0, color: T.text2 }}>{pie}</p>
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
              <EncuestaSorpresaCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sonidoOk} />
              <RetoNumericoCard reto={RETO_A2} accent={accent} aprobado={ejercicioAprobado} onAprobado={() => setEjercicioAprobado(true)} playSfx={sonidoOk} />
            </>
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Conjuntos y diagramas de Venn" icono="fa-circle-nodes">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Lectura A1 — Conjuntos" icono="fa-book-open">
                {LECTURA_A1.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>{p}</p>
                ))}
              </Bloque>
              <Bloque titulo="Para reflexionar" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                  {INSTRUCCIONES.map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Las cuatro zonas" icono="fa-table-cells">
                {ZONAS.map((z) => (
                  <div key={z} style={{ display: "flex", alignItems: "center", gap: 9, color: T.text2 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: COLOR_ZONA[z], flexShrink: 0 }} />
                    {ZONA_ETQ[z]}
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Datos clave" icono="fa-magnifying-glass-chart">
                {DATOS.map((dd, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${dd.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontFamily: "ui-monospace, monospace", overflowWrap: "anywhere" }}>{dd.valor}</strong>
                      <div style={{ color: T.text2 }}>{dd.texto}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="De Morgan fuera del aula" icono="fa-database">
                <p style={{ margin: 0, color: T.text2 }}>{CONTEXTO}</p>
              </Bloque>
              <Bloque titulo="¿Sabías que? (quiz A4)" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario (A5)" icono="fa-book">
                {GLOSARIO.map((gi, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                    <span style={{ fontWeight: 900, color: accent }}>{gi.termino}. </span>
                    <span style={{ color: T.text2 }}>{gi.definicion}</span>
                    <div style={{ fontSize: 14, color: T.text3, marginTop: 4 }}>
                      <i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} aria-hidden />
                      {gi.ejemplo}
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={CONJUNTOS_VENN_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                La lectura A1, las preguntas de reflexión, el glosario A5, los hechos del quiz A4 y el ejercicio A2 son verbatim del MCCEMS 2025. Los conjuntos escritos por extensión se calculan a partir de la zona de cada ficha, y las zonas iluminadas salen de evaluar cada operación punto por punto. Los muñecos de la encuesta son una representación esquemática del grupo. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
