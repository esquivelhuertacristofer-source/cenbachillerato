"use client";

/**
 * Laboratorio 3D — "Mutaciones: tipos, causas y consecuencias".
 * Práctica experimental anclada a CNEYT-VI-P06-A1 (lectura "Mutaciones: tipos,
 * causas y consecuencias"; progresión 6, UAC CNEYT-VI "Organismos y evolución
 * biológica"). P06 no tiene A2 manipulable (su A2 es un quiz de opción múltiple),
 * por lo que el laboratorio se ancla a la lectura A1, con el glosario verbatim A5
 * y los hechos de los quizzes A2/A4.
 *
 * Tres modos:
 *  (1) Puntuales — EDITOR: el alumno elige el tipo (sustitución / inserción /
 *      deleción), la posición (1-24) y la base sobre una secuencia real de la
 *      β-globina; la proteína mutada se recalcula con el código genético y la
 *      clase (silenciosa, missense, nonsense, frameshift) sale del resultado.
 *  (2) Cromosómicas — deleción, duplicación, inversión, translocación y
 *      aneuploidía (trisomía 21) sobre un cromosoma "modelo" de bandas.
 *  (3) Mutágenos — UV (dímero de timina), radiación ionizante, químicos y
 *      biológicos, y la reparación del ADN (NER).
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";
import { MUTACIONES_FICHA } from "./mutaciones-ficha";
import {
  type Modo,
  type ClasePuntual,
  type TipoCromo,
  type TipoMutageno,
  type OpMutacion,
  type AnalisisPuntual,
  MODOS,
  MODOS_DEF,
  MUTACIONES_PUNTUALES,
  mutPuntualPorId,
  BASE_CODIFICANTE,
  aplicarMutacion,
  aminoacidosDe,
  MUTACIONES_CROMO,
  mutCromoPorId,
  resultadoCromo,
  MUTAGENOS,
  mutagenoPorId,
  REPARACION,
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
  QUIZ_A2,
} from "./mutaciones-data";
import { transcribir } from "./adn-dogma-data";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-mutaciones-3d-reto";

const MutacionesScene = dynamic(() => import("./MutacionesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-dna fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando las mutaciones en 3D…</span>
    </div>
  ),
});

const OPS: { id: OpMutacion["op"]; etq: string; icono: string }[] = [
  { id: "sub", etq: "Sustitución", icono: "fa-right-left" },
  { id: "ins", etq: "Inserción", icono: "fa-plus" },
  { id: "del", etq: "Deleción", icono: "fa-minus" },
];
const BASES = ["A", "C", "G", "T"] as const;

/**
 * Analiza CUALQUIER mutación puntual sobre la secuencia base: traduce con el
 * código genético y deduce la clase a partir del RESULTADO (no de una etiqueta).
 */
function analizarEspecifica(spec: OpMutacion | null): AnalisisPuntual {
  const codMutada = aplicarMutacion(BASE_CODIFICANTE, spec);
  const protOriginal = aminoacidosDe(BASE_CODIFICANTE);
  const protMutada = aminoacidosDe(codMutada);
  const arnmOriginal = transcribir(BASE_CODIFICANTE);
  const arnmMutado = transcribir(codMutada);

  let cambioIdx = -1;
  const n = Math.max(protOriginal.length, protMutada.length);
  for (let i = 0; i < n; i++) {
    const a = protOriginal[i];
    const b = protMutada[i];
    if (!a || !b || a.codon !== b.codon) { cambioIdx = i; break; }
  }

  const iguales = protOriginal.length === protMutada.length && protOriginal.every((c, i) => c.amino.abr === protMutada[i]!.amino.abr && c.paro === protMutada[i]!.paro);
  const sinInicio = arnmMutado.indexOf("AUG") !== 0;
  let id: ClasePuntual;
  if (!spec || codMutada === BASE_CODIFICANTE) id = "ninguna";
  else if (sinInicio) id = "nonsense";
  else if (iguales) id = "silenciosa";
  else if (spec.op !== "sub") id = "frameshift";
  else if (protMutada.some((c) => c.paro)) id = "nonsense";
  else id = "missense";

  let efecto: string;
  if (id === "nonsense" && sinInicio) efecto = "Se pierde el codón de inicio AUG: no se fabrica la proteína.";
  else if (id === "silenciosa") efecto = "Proteína idéntica — el cambio no se nota en el fenotipo.";
  else if (id === "missense") efecto = "Un aminoácido cambia — puede alterar la función de la proteína.";
  else if (id === "nonsense") efecto = `Parada prematura — proteína truncada (${protMutada.filter((c) => !c.paro).length} aa en vez de ${protOriginal.filter((c) => !c.paro).length}).`;
  else if (id === "frameshift") efecto = "Se corre el marco — todos los aminoácidos siguientes cambian.";
  else efecto = spec ? "Esa base ya estaba ahí: el gen no cambia." : "Sin cambios: secuencia de referencia.";

  const def = { ...mutPuntualPorId(id), spec };
  return { def, codMutada, arnmOriginal, arnmMutado, protOriginal, protMutada, cambioIdx, efecto };
}

/** Cuántos aminoácidos de la proteína original quedan distintos (o perdidos). */
function contarDistintos(a: AnalisisPuntual): { distintos: number; total: number } {
  const total = a.protOriginal.length;
  let distintos = 0;
  for (let i = 0; i < total; i++) {
    const o = a.protOriginal[i]!;
    const m = a.protMutada[i];
    if (!m || m.amino.abr !== o.amino.abr || m.paro !== o.paro) distintos++;
  }
  return { distintos, total };
}

/** Botón de opción del panel (tamaño táctil, texto de 14 px). */
function Opcion({ on, col, icono, etq, onClick, disabled = false }: { on: boolean; col: string; icono: string; etq: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      style={{ cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, textAlign: "left", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: on ? "#04121f" : "#fff", background: on ? col : `${col}1a`, border: `1px solid ${col}66`, borderRadius: 10, padding: "10px 12px", lineHeight: 1.25 }}>
      <i className={`fa-solid ${icono}`} style={{ color: on ? "#04121f" : col }} aria-hidden />
      <span style={{ minWidth: 0 }}>{etq}</span>
    </button>
  );
}

const GENES_REALES = "ABCDE";

export function LabMutaciones({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("puntuales");
  // editor de mutación puntual (posición 1-based)
  const [op, setOp] = useState<OpMutacion["op"]>("sub");
  const [pos, setPos] = useState(19);
  const [base, setBase] = useState<string>("T");
  const [aplicada, setAplicada] = useState(false);
  const [tipoCromo, setTipoCromo] = useState<TipoCromo>("delecion");
  const [tipoMutageno, setTipoMutageno] = useState<TipoMutageno>("uv");
  const [dimero, setDimero] = useState<boolean>(true); // UV: daño formado
  const [reparar, setReparar] = useState<boolean>(false); // NER aplicado
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // misiones: banderas que, una vez ganadas, no se pierden al cambiar de modo
  const [hecho, setHecho] = useState({ editor: false, puntual: false, silenciosa: false, frame: false, cromo: false, mutag: false, reparo: false });
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

  const spec: OpMutacion | null = aplicada ? { op, pos: pos - 1, base: op === "del" ? undefined : base } : null;
  const analisis = analizarEspecifica(spec);
  const puntualDef = analisis.def;
  const { distintos, total } = contarDistintos(analisis);
  const resCromo = resultadoCromo(tipoCromo);
  const cromoDef = mutCromoPorId(tipoCromo);
  const mutageno = mutagenoPorId(tipoMutageno);

  // dosis de genes A–E tras la mutación cromosómica (normal = 5)
  const dosis = [...resCromo.principal, ...(resCromo.secundario ?? [])].filter((b) => GENES_REALES.includes(b.gen)).length * resCromo.copias;
  const orden = resCromo.principal.map((b) => b.gen).join("–") + (resCromo.secundario ? ` | ${resCromo.secundario.map((b) => b.gen).join("–")}` : "");

  /** Registra en las misiones lo que produjo una mutación puntual. */
  const registrar = (sp: OpMutacion | null, editor: boolean) => {
    const id = analizarEspecifica(sp).def.id;
    if (editor) marca("editor");
    if (id !== "ninguna") marca("puntual");
    if (id === "silenciosa") marca("silenciosa");
    if (id === "frameshift") marca("frame");
  };
  const aplicarEditor = (o: OpMutacion["op"], p: number, b: string) => {
    setOp(o); setPos(p); setBase(b); setAplicada(true); setPlaying(true);
    registrar({ op: o, pos: p - 1, base: o === "del" ? undefined : b }, true);
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const elegirCaso = (id: ClasePuntual) => {
    const m = mutPuntualPorId(id);
    if (!m.spec) { setAplicada(false); bump(); return; }
    setOp(m.spec.op); setPos(m.spec.pos + 1); if (m.spec.base) setBase(m.spec.base);
    setAplicada(true); setPlaying(true);
    registrar(m.spec, false);
    if (sonido) audioRef.current?.blip();
    bump();
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setPlaying(true);
    if (m === "cromosomicas") marca("cromo");
    if (sonido) audioRef.current?.blip();
    bump();
  };
  const elegirCromo = (t: TipoCromo) => { setTipoCromo(t); setPlaying(true); bump(); };
  const elegirMutageno = (t: TipoMutageno) => {
    setTipoMutageno(t); setReparar(false); setDimero(true); setPlaying(true);
    if (t !== "uv") marca("mutag");
    bump();
  };
  const alternarDimero = () => { setDimero((d) => !d); setReparar(false); };
  const alternarReparar = () => {
    const nuevo = !reparar;
    setReparar(nuevo);
    if (nuevo) marca("reparo");
  };
  const reiniciar = () => {
    setReparar(false);
    setAplicada(false);
    if (modo === "mutagenos") setDimero(true);
    setPlaying(true);
    bump();
  };

  // lectura breve sobre la escena
  const lectura: string =
    modo === "puntuales"
      ? aplicada ? `${puntualDef.etq}: ${distintos} de ${total} aminoácidos cambian` : "Gen sano: aplica una mutación para compararlo"
      : modo === "cromosomicas"
        ? `${cromoDef.etq}: ${dosis} de 5 genes (A–E)`
        : mutageno.id === "uv"
          ? reparar ? "NER retiró el dímero: hélice restaurada" : dimero ? "Dímero de timina: la hélice se deforma" : "Hélice intacta: aplica UV"
          : `${mutageno.categoria}: ${mutageno.agentes[0]}`;

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

  const codonK = Math.floor((pos - 1) / 3);
  const codOrig = BASE_CODIFICANTE.slice(codonK * 3, codonK * 3 + 3);
  const codMut = analisis.codMutada.slice(codonK * 3, codonK * 3 + 3);

  /* ── Pestaña «Controles», según el modo ────────────────────────────── */
  const controles = (
    <>
      {modo === "puntuales" && (
        <>
          <Bloque titulo="Edita el gen de la β-globina" icono="fa-pen-to-square">
            <div style={rejilla(120)}>
              {OPS.map((o) => <Opcion key={o.id} on={aplicada && op === o.id} col={modoCol} icono={o.icono} etq={o.etq} onClick={() => aplicarEditor(o.id, pos, base)} />)}
            </div>
            <Deslizador
              label="Posición en el gen" icon="fa-arrows-left-right" colr={modoCol}
              valor={`${pos} · ${BASE_CODIFICANTE[pos - 1]} · codón ${codonK + 1}`}
              min={1} max={24} step={1} value={pos}
              onChange={(v) => aplicarEditor(op, v, base)}
              hintL="inicio (ATG)" hintR="final"
            />
            {op !== "del" && (
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: modoCol }}>
                  {op === "sub" ? "Nueva base" : "Base que se inserta"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 6 }}>
                  {BASES.map((b) => {
                    const on = aplicada && base === b;
                    return (
                      <button key={b} type="button" onClick={() => aplicarEditor(op, pos, b)}
                        style={{ cursor: "pointer", fontSize: 16, fontWeight: 900, fontFamily: "ui-monospace, monospace", color: on ? "#04121f" : modoCol, background: on ? modoCol : `${modoCol}1f`, border: `1px solid ${modoCol}55`, borderRadius: 9, padding: "10px 4px" }}>
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {!aplicada && <p style={{ margin: 0, color: T.text2 }}>Toca un tipo, mueve la posición o elige una base: la proteína de abajo se recalcula al instante.</p>}
          </Bloque>

          <Bloque titulo="Resultado en la proteína" icono="fa-gauge-high">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
              <Dato label="Clase" value={aplicada ? puntualDef.etq.split(" (")[0]! : "Original"} col={`#${puntualDef.color.replace("#", "")}`} />
              <Dato label="Aminoácidos distintos" value={`${distintos} de ${total}`} col={distintos > 0 ? "#fca5a5" : "#86efac"} />
              <Dato label={op === "sub" ? `Codón ${codonK + 1}` : "Desde el codón"} value={op === "sub" && aplicada ? `${codOrig}→${codMut}` : String(codonK + 1)} />
              <Dato label="Largo de la proteína" value={`${analisis.protMutada.filter((c) => !c.paro).length} aa`} />
            </div>
            {nota(modoCol, <><i className={`fa-solid ${puntualDef.icono}`} style={{ color: modoCol, marginRight: 8 }} aria-hidden />{analisis.efecto}</>)}
            <p style={{ margin: 0, color: T.text3, fontFamily: "ui-monospace, monospace", wordBreak: "break-all" }}>ARNm: {analisis.arnmMutado}</p>
          </Bloque>

          <Bloque titulo="Casos reales (un clic)" icono="fa-vial">
            <div style={rejilla(160)}>
              {MUTACIONES_PUNTUALES.map((m) => {
                const c = `#${m.color.replace("#", "")}`;
                const on = m.id === "ninguna" ? !aplicada : aplicada && puntualDef.id === m.id;
                return <Opcion key={m.id} on={on} col={c} icono={m.icono} etq={m.etq} onClick={() => elegirCaso(m.id)} />;
              })}
            </div>
            <p style={{ margin: 0, color: T.text2 }}>{puntualDef.descripcion}</p>
          </Bloque>
        </>
      )}

      {modo === "cromosomicas" && (
        <>
          <Bloque titulo="Tipo de mutación cromosómica" icono="fa-grip-lines-vertical">
            <div style={rejilla(150)}>
              {MUTACIONES_CROMO.filter((m) => m.id !== "normal").map((m) =>
                <Opcion key={m.id} on={m.id === tipoCromo} col={`#${m.color.replace("#", "")}`} icono={m.icono} etq={m.etq} onClick={() => elegirCromo(m.id)} />)}
            </div>
          </Bloque>
          <Bloque titulo="Qué le pasa a los genes" icono="fa-gauge-high">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
              <Dato label="Genes A–E" value={`${dosis} de 5`} col={dosis === 5 ? "#86efac" : "#fca5a5"} />
              <Dato label="Copias" value={String(resCromo.copias)} col={resCromo.copias > 1 ? "#c084fc" : undefined} />
            </div>
            <Dato label="Orden de las bandas" value={orden} />
            {nota(modoCol, <><strong>{cromoDef.etq}</strong> ({cromoDef.clase}). {cromoDef.descripcion}</>)}
            <p style={{ margin: 0, color: T.text2 }}><i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: modoCol }} aria-hidden />{cromoDef.ejemplo}</p>
          </Bloque>
        </>
      )}

      {modo === "mutagenos" && (
        <>
          <Bloque titulo="Agente mutágeno" icono="fa-radiation">
            <div style={rejilla(150)}>
              {MUTAGENOS.map((m) => <Opcion key={m.id} on={m.id === tipoMutageno} col={`#${m.color.replace("#", "")}`} icono={m.icono} etq={m.etq} onClick={() => elegirMutageno(m.id)} />)}
            </div>
          </Bloque>
          {mutageno.id === "uv" && (
            <Bloque titulo="Daño y reparación" icono="fa-scissors">
              <div style={rejilla(200)}>
                <Opcion on={dimero} col="#fbbf24" icono={dimero ? "fa-sun" : "fa-ban"} etq={dimero ? "UV aplicada: dímero formado" : "Sin daño: aplica UV"} onClick={alternarDimero} />
                <Opcion on={reparar} col="#34d399" icono="fa-scissors" etq={reparar ? "NER activada" : "Reparar con NER"} onClick={alternarReparar} disabled={!dimero} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                <Dato label="Timinas T–T" value={dimero && !reparar ? "unidas" : "libres"} col={dimero && !reparar ? "#fbbf24" : "#86efac"} />
                <Dato label="Hélice" value={dimero && !reparar ? "deformada" : "normal"} col={dimero && !reparar ? "#fca5a5" : "#86efac"} />
              </div>
            </Bloque>
          )}
          <Bloque titulo="Cómo daña el ADN" icono="fa-circle-info">
            {nota(modoCol, mutageno.mecanismo)}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {mutageno.agentes.map((a) => (
                <span key={a} style={{ padding: "6px 10px", borderRadius: 9, border: `1px solid ${modoCol}66`, background: `${modoCol}1e`, color: "#fff", fontSize: 14, fontWeight: 800 }}>{a}</span>
              ))}
            </div>
            <p style={{ margin: 0, color: T.text2 }}>{mutageno.ejemplo}</p>
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
          <MutacionesScene
            modo={modo}
            analisis={analisis}
            resultadoCromo={resCromo}
            cromoDef={cromoDef}
            mutageno={mutageno}
            dimero={dimero}
            reparar={reparar}
            playing={playing}
            accent={accent}
            modoColor={modoCol}
            resetNonce={resetNonce}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq.replace("Mutaciones ", "").replace(" y daño al ADN", ""), icono: MODOS_DEF[m].icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          {modo === "mutagenos" && mutageno.id === "uv" && (
            <BotonHerramienta icono={dimero ? "fa-sun" : "fa-ban"} titulo={dimero ? "Quitar daño UV" : "Aplicar radiación UV"} activo={dimero} onClick={alternarDimero} />
          )}
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reanudar"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Mueve la posición o cambia la base de la mutación y mira qué aminoácido se afecta", done: hecho.editor },
        { txt: "Aplica una mutación puntual y compara la proteína original con la mutada", done: hecho.puntual },
        { txt: "Encuentra una sustitución silenciosa: la proteína queda idéntica", done: hecho.silenciosa },
        { txt: "Provoca un corrimiento del marco de lectura (frameshift)", done: hecho.frame },
        { txt: "Explora las mutaciones cromosómicas (deleción, inversión, trisomía…)", done: hecho.cromo },
        { txt: "Prueba los mutágenos: UV, radiación ionizante, químico y biológico", done: hecho.mutag },
        { txt: "Repara el daño del ADN con el sistema NER", done: hecho.reparo },
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
              <Bloque titulo="Mutaciones del ADN" icono="fa-dna">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Lectura A1 — ¿Qué es una mutación?" icono="fa-book-open">
                {LECTURA_A1.map((p, i) => <p key={i} style={{ margin: 0, color: T.text2 }}>{p}</p>)}
                <h5 style={{ margin: "6px 0 0", fontSize: 14, color: T.text3, letterSpacing: "0.08em" }}>PARA REFLEXIONAR</h5>
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {PREGUNTAS.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Reparación del ADN (A5)" icono="fa-screwdriver-wrench">
                <p style={{ margin: 0, color: T.text2 }}>{REPARACION}</p>
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
              <Bloque titulo="México: medicina genómica (INMEGEN)" icono="fa-location-dot">
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
                <FichaTeorica data={MUTACIONES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                La lectura A1, las preguntas de reflexión, el glosario A5 (con sus ejemplos) y los hechos de «¿sabías que?» (quizzes A2/A4) son <strong>verbatim</strong> del MCCEMS 2025. En el modo de mutaciones puntuales, la secuencia, la traducción a aminoácidos y el efecto de cada mutación se <strong>calculan</strong> sobre el inicio real del gen de la β-globina humana usando el código genético universal estándar; la clase (silenciosa, missense, nonsense, frameshift) se deduce del resultado. Los cromosomas de bandas, la doble hélice y el dímero de timina son representaciones <strong>esquemáticas</strong> del mecanismo, no modelos a escala molecular. El contexto del INMEGEN es informativo. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
