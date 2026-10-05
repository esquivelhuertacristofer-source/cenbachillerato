"use client";

/**
 * Laboratorio 3D — "El dogma central de la biología molecular".
 * Práctica experimental anclada a CNEYT-VI-P04-A1 (lectura "El dogma central de
 * la biología molecular"; progresión 4, UAC CNEYT-VI "Organismos y evolución
 * biológica"). P04 no tiene A2 manipulable (su A2 es un quiz V/F), por lo que el
 * laboratorio se ancla a la lectura A1, donde se explica el flujo ADN → ARN →
 * proteína, con datos verbatim del glosario A5 y de los quizzes A2/A4.
 *
 * Tres modos sobre UNA misma secuencia editable:
 *  (1) replicación   — ADN → ADN: la doble hélice se abre y cada hebra molde
 *                      templa una hebra nueva complementaria (A-T, G-C).
 *  (2) transcripción — ADN → ARNm: la hebra molde se transcribe a ARN (T→U).
 *  (3) traducción    — ARNm → proteína: el ribosoma lee codón a codón desde AUG
 *                      hasta el codón de parada y crece la cadena polipeptídica.
 */

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, SceneBoundary, OK, NUM } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { EppGate, type EppItem } from "./_epp-gate";
import { LabSfx } from "./lab-audio";
import { ADN_DOGMA_FICHA } from "./adn-dogma-ficha";
import {
  type Modo,
  type Base,
  MODOS,
  MODOS_DEF,
  BASE_COLOR,
  SECUENCIAS,
  secuenciaPorId,
  limpiarADN,
  hebraMolde,
  transcribir,
  traducir,
  ENZIMAS,
  CODON_TABLE,
  PROBLEMA,
  DEFINICION_DOGMA,
  CALLOUT_VIRUS,
  INSTRUCCIONES,
  PREGUNTAS,
  IDEAS,
  GLOSARIO,
  CONTEXTO,
  FUENTE,
  DATOS,
  HECHOS,
  QUIZ_A2,
} from "./adn-dogma-data";

const AdnDogmaScene = dynamic(() => import("./AdnDogmaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-dna fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando el dogma central en 3D…</span>
    </div>
  ),
});

/** Codones del código genético más representativos para la mini-tabla lateral. */
const CODON_DEMO: string[] = ["AUG", "UUU", "UUC", "GCA", "AAG", "GGU", "UGU", "UAA", "UAG", "UGA"];

/** Registro local del mejor desempeño en el reto de traducción de codones. */
import { useEstrellas } from "@/lib/hooks/useEstrellas";
const RETO_KEY = "cen-adn-reto";

/** Equipo de protección y bioseguridad de un laboratorio de biología molecular. */
const INSTRUMENTOS: EppItem[] = [
  { key: "guantes", nombre: "Guantes de nitrilo", icono: "fa-mitten", ok: true, nota: "Protegen tu piel y evitan contaminar las muestras de ADN con tus propias nucleasas." },
  { key: "bata", nombre: "Bata de laboratorio", icono: "fa-user-doctor", ok: true, nota: "Barrera contra salpicaduras de reactivos y bromuro de etidio." },
  { key: "gafas", nombre: "Gafas de seguridad", icono: "fa-glasses", ok: true, nota: "Protegen los ojos de la luz UV del transiluminador y de los reactivos." },
  { key: "sandalias", nombre: "Sandalias abiertas", icono: "fa-shoe-prints", ok: false, nota: "Nunca: dejan el pie expuesto a derrames y vidrio roto. Usa zapato cerrado." },
  { key: "comida", nombre: "Bebida y comida", icono: "fa-mug-hot", ok: false, nota: "Prohibidas en el laboratorio: riesgo de ingerir reactivos tóxicos." },
  { key: "lentes-contacto", nombre: "Lentes de contacto", icono: "fa-eye", ok: false, nota: "Desaconsejados: atrapan vapores químicos contra la córnea." },
];

/* ── Reto de cálculo: traducir un codón a su aminoácido (con estrellas) ──── */
function PrediccionCodonCard({
  accent,
  rgba,
  codones,
  paso,
  mejor,
  onResultado,
  playSfx,
  playPick,
}: {
  accent: string;
  rgba: string;
  codones: { codon: string; abr: string; paro: boolean }[];
  paso: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
  playPick?: () => void;
}) {
  const [snap, setSnap] = useState<{ codon: string; abr: string; paro: boolean } | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [estrellas, setEstrellas] = useState(0);
  const [msg, setMsg] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);

  const hayCodones = codones.length > 0;

  const tomar = () => {
    if (!hayCodones) return;
    const idx = Math.min(Math.max(paso, 0), codones.length - 1);
    const c = codones[idx];
    if (!c) return;
    setSnap({ codon: c.codon, abr: c.abr, paro: c.paro });
    setVal("");
    setIntentos(0);
    setEstrellas(0);
    setMsg(null);
    playPick?.();
  };

  const comprobar = () => {
    if (!snap) return;
    const limpio = val.trim().toLowerCase();
    if (!limpio) return;
    const esperado = snap.paro ? ["stop", "paro", "alto", "fin", "*"] : [snap.abr.toLowerCase()];
    const ok = esperado.includes(limpio);
    const next = intentos + 1;
    setIntentos(next);
    if (ok) {
      const est = next <= 1 ? 3 : next === 2 ? 2 : 1;
      setEstrellas(est);
      setMsg({ tipo: "ok", texto: snap.paro ? `¡Correcto! ${snap.codon} es un codón de PARO: detiene la traducción.` : `¡Correcto! El codón ${snap.codon} codifica ${snap.abr}.` });
      onResultado(est);
      playSfx?.(true);
    } else {
      setMsg({ tipo: "err", texto: `Aún no. Traduce ${snap.codon} con la tabla del código genético (columna lateral). Intento ${next}.` });
      playSfx?.(false);
    }
  };

  return (
    <div style={{ ...card, padding: "20px 22px", border: `1px solid ${accent}55`, background: `rgba(${rgba},0.06)` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <Eyebrow><i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />Reto de cálculo — traduce el codón</Eyebrow>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#fbbf24" }}>
          Mejor: {mejor > 0 ? "★".repeat(mejor) + "☆".repeat(3 - mejor) : "—"}
        </span>
      </div>
      <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>
        Aplica el <strong>código genético</strong>: toma el siguiente codón del ARNm y predice qué aminoácido produce <em>antes</em> de que el ribosoma lo lea. Escribe la abreviatura de 3 letras (p. ej. <strong>Met</strong>, <strong>Pro</strong>) o <strong>Stop</strong> si es codón de parada.
      </div>

      {!hayCodones ? (
        <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.5, padding: "12px 14px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: "#fbbf24", marginRight: 7 }} />
          Elige o escribe una secuencia que contenga el codón de inicio <strong>AUG</strong> para generar codones traducibles.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <button className="ad-calc-btn ad-calc-ghost" onClick={tomar}>
              <i className="fa-solid fa-crosshairs" style={{ marginRight: 7 }} />Tomar siguiente codón
            </button>
            {snap && (
              <span style={{ ...NUM, fontSize: 22, fontWeight: 900, color: accent, letterSpacing: "0.12em" }}>{snap.codon}</span>
            )}
          </div>

          {snap && (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <input
                  className="ad-calc-in"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") comprobar(); }}
                  placeholder="p. ej. Met"
                  spellCheck={false}
                  style={{ ["--adc" as string]: accent }}
                />
                <button className="ad-calc-btn ad-calc-primary" onClick={comprobar} style={{ ["--adc" as string]: accent }}>
                  <i className="fa-solid fa-check" style={{ marginRight: 7 }} />Comprobar
                </button>
              </div>

              {estrellas > 0 && (
                <div style={{ marginTop: 12, fontSize: 22, letterSpacing: "0.1em", color: "#fbbf24" }}>
                  {"★".repeat(estrellas)}<span style={{ color: "rgba(255,255,255,0.18)" }}>{"★".repeat(3 - estrellas)}</span>
                </div>
              )}
              {msg && (
                <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 10, fontSize: 14, lineHeight: 1.5, border: `1px solid ${msg.tipo === "ok" ? OK : "#fbbf24"}55`, background: msg.tipo === "ok" ? `${OK}14` : "rgba(251,191,36,0.08)", color: "#eaf0fb" }}>
                  <i className={`fa-solid ${msg.tipo === "ok" ? "fa-circle-check" : "fa-circle-info"}`} style={{ color: msg.tipo === "ok" ? OK : "#fbbf24", marginRight: 8 }} />
                  {msg.texto}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export function LabAdnDogma({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("replicacion");
  const [presetId, setPresetId] = useState<string>("glosario");
  const [seq, setSeq] = useState<string>(secuenciaPorId("glosario").codificante);
  // secuencia «original» contra la que se compara cada mutación
  const [original, setOriginal] = useState<string>(secuenciaPorId("glosario").codificante);
  const [mutado, setMutado] = useState(false);
  const [progreso, setProgreso] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);
  // reto evaluable (B) y sonido (C)
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // pilares de interactividad: equiparse, arrastrar, calcular, explorar
  const [eppListo, setEppListo] = useState(false);
  const [arrastro, setArrastro] = useState(false);
  const [predicho, setPredicho] = useState(false);
  const [modosVistos, setModosVistos] = useState<Set<Modo>>(() => new Set<Modo>(["replicacion"]));
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);

  const onArrastraPaso = useCallback((p: number) => {
    setPlaying(false);
    setArrastro(true);
    setProgreso(p);
  }, []);
  const onGrabAdn = useCallback(() => {
    if (sonido) audioRef.current?.blip();
  }, [sonido]);
  const registraEstrellas = useCallback((estrellas: number) => {
    setPredicho(true);
    guardaEstrellas(estrellas);
  }, [guardaEstrellas]);

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

  // moléculas derivadas (matemática pura del módulo de datos)
  const codificante = seq.length > 0 ? seq : "ATG";
  const molde = hebraMolde(codificante);
  const arnm = transcribir(codificante);
  const codones = traducir(arnm);

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;
  const total = modo === "traduccion" ? codones.length : codificante.length;
  const paso = Math.min(progreso, total);

  // avance automático del proceso
  useEffect(() => {
    if (!playing || total === 0) return;
    if (paso >= total) return;
    const t = setInterval(() => setProgreso((p) => Math.min(total, p + 1)), 850);
    return () => clearInterval(t);
  }, [playing, total, paso]);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setProgreso(0);
    setPlaying(true);
    setModosVistos((prev) => (prev.has(m) ? prev : new Set(prev).add(m)));
    bump();
    if (sonido) audioRef.current?.blip();
  };
  const reiniciar = () => {
    setProgreso(0);
    setPlaying(true);
    bump();
  };
  const elegirPreset = (id: string) => {
    const nueva = secuenciaPorId(id).codificante;
    setPresetId(id);
    setSeq(nueva);
    setOriginal(nueva);
    setProgreso(0);
    setPlaying(true);
    bump();
  };
  const editarSeq = (v: string) => {
    setSeq(limpiarADN(v));
    setPresetId("");
    setProgreso(0);
    setPlaying(true);
    bump();
  };
  /** Clic en una letra: A → T → G → C → A (mutación puntual). */
  const mutarBase = (i: number) => {
    const ciclo = ["A", "T", "G", "C"];
    const actual = codificante[i] ?? "A";
    const siguiente = ciclo[(ciclo.indexOf(actual) + 1) % 4] as string;
    setSeq(codificante.slice(0, i) + siguiente + codificante.slice(i + 1));
    setPresetId("");
    setMutado(true);
    setProgreso(0);
    setPlaying(true);
    bump();
    if (sonido) audioRef.current?.blip();
  };
  const restaurar = () => {
    setSeq(original);
    setPresetId(SECUENCIAS.find((s) => s.codificante === original)?.id ?? "");
    setProgreso(0);
    setPlaying(true);
    bump();
  };

  // proteína legible (abreviaturas hasta el codón de parada exclusive)
  const proteina = codones.filter((c) => !c.paro).map((c) => c.amino.abr);
  const ultimoCodon = codones[Math.min(paso, codones.length) - 1];
  const preset = presetId ? secuenciaPorId(presetId) : null;

  // proteína de la secuencia original, para medir el efecto de la mutación
  const codonesOrig = traducir(transcribir(original));
  const proteinaOrig = codonesOrig.filter((c) => !c.paro).map((c) => c.amino.abr);
  const cambioSeq = codificante !== original;
  const termina = codones.length > 0 && codones[codones.length - 1]!.paro;
  const paroPrematuro = mutado && cambioSeq && termina && proteina.length < proteinaOrig.length;
  const efecto: { col: string; txt: string } | null = !cambioSeq
    ? null
    : codones.length === 0
      ? { col: "#fb7185", txt: "Sin AUG no hay inicio de traducción: la célula no fabrica esta proteína." }
      : paroPrematuro
        ? { col: "#fb7185", txt: `Codón de paro prematuro: la proteína se corta en ${proteina.length} aminoácidos (antes eran ${proteinaOrig.length}).` }
        : proteina.join("-") === proteinaOrig.join("-")
          ? { col: "#86efac", txt: "Mutación silenciosa: cambió el ADN pero la proteína es la misma (el código genético es degenerado)." }
          : { col: "#fbbf24", txt: "Mutación de sentido erróneo o de longitud distinta: la proteína cambió." };

  // codones simplificados para el reto de cálculo (codón → aminoácido)
  const codonesReto = codones.map((c) => ({ codon: c.codon, abr: c.amino.abr, paro: c.paro }));

  const explorados = modosVistos.size >= 3;
  const objetivos = [
    { txt: "Equiparme con guantes, bata y gafas de seguridad", done: eppListo },
    { txt: "Haz clic en una letra del ADN para cambiar esa base: ¿cambia la proteína?", done: mutado },
    { txt: "Provoca un codón de paro prematuro y mira cómo se acorta la proteína", done: paroPrematuro },
    { txt: "Manipular en 3D la maquinaria del dogma central arrastrándola", done: arrastro },
    { txt: "Observar los tres procesos: ADN→ADN, ADN→ARNm y ARNm→proteína", done: explorados },
    { txt: "Editar o elegir una secuencia de ADN distinta", done: presetId !== "glosario" },
    { txt: "Traducir un codón a su aminoácido con la tabla del código genético", done: predicho },
    { txt: "Aprobar el reto evaluable (verdadero/falso del A2)", done: ejercicioAprobado },
  ];

  const lectura: ReactNode =
    modo === "replicacion"
      ? <>Copiadas {paso}/{total} bases · A–T, G–C</>
      : modo === "transcripcion"
        ? <>ARNm: {paso}/{total} bases · T pasa a U</>
        : <>{paso}/{total} codones{ultimoCodon ? ` · ${ultimoCodon.codon} → ${ultimoCodon.paro ? "paro" : ultimoCodon.amino.abr}` : ""}</>;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {DEFINICION_DOGMA}
      </div>
    </div>
  );

  /* ── Tira de bases monoespaciada (valor JSX, no componente) ──────────── */
  const tira = (cadena: string, etiqueta: string, activos: (i: number) => boolean, tenue?: (i: number) => boolean): ReactNode => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.06em", color: T.text3, marginBottom: 4, textTransform: "uppercase" }}>{etiqueta}</div>
      <div className="ad-strip">
        {cadena.split("").map((b, i) => (
          <span
            key={i}
            className="ad-base"
            data-on={activos(i)}
            style={{
              color: BASE_COLOR[b as Base] ?? "#fff",
              borderColor: activos(i) ? (BASE_COLOR[b as Base] ?? "#fff") : "transparent",
              opacity: tenue && tenue(i) ? 0.32 : 1,
            }}
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  );
  const nota = (col: string, children: ReactNode) => (
    <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${col}44`, background: `${col}14`, lineHeight: 1.5 }}>{children}</p>
  );

  /* ── Hebras del modo activo ───────────────────────────────────────────── */
  let hebras: ReactNode;
  if (modo === "replicacion") {
    hebras = (
      <>
        {tira(codificante, "Hebra codificante (sentido) 5'→3'", (i) => i === paso, (i) => i > paso)}
        {tira(molde, "Hebra molde (antiparalela) 3'→5'", (i) => i === paso, (i) => i > paso)}
        {nota(modoCol, <>Replicación <strong>semiconservativa</strong>: tras copiar las {total} bases obtienes dos moléculas hijas idénticas, cada una con una hebra parental y una nueva.{paso >= total && <strong style={{ color: "#86efac" }}> ✓ {paso}/{total} copiadas.</strong>}</>)}
      </>
    );
  } else if (modo === "transcripcion") {
    hebras = (
      <>
        {tira(molde, "Hebra molde del ADN 3'→5'", (i) => i === paso, (i) => i > paso)}
        {tira(arnm, "ARN mensajero 5'→3' (T → U)", (i) => i < paso, (i) => i >= paso)}
        {nota(modoCol, <>La ARN polimerasa sintetiza el ARNm complementario a la hebra molde; la <strong>timina (T)</strong> del ADN se sustituye por <strong>uracilo (U)</strong> en el ARN.</>)}
      </>
    );
  } else {
    hebras = (
      <>
        {tira(arnm, "ARN mensajero 5'→3'", (i) => {
          const c = codones[paso - 1];
          if (!c) return false;
          const start = arnm.indexOf("AUG");
          return i >= start + (paso - 1) * 3 && i < start + paso * 3;
        })}
        <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.06em", color: T.text3, margin: "4px 0", textTransform: "uppercase" }}>Proteína (aminoácidos)</div>
        <div className="ad-chips">
          {codones.map((c, i) => {
            const leido = i < paso;
            return (
              <span key={i} className="ad-chip" data-on={leido} style={{ borderColor: leido ? c.amino.color : "rgba(255,255,255,0.12)", background: leido ? `${c.amino.color}1e` : "transparent", color: leido ? "#fff" : T.text3 }}>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 14, opacity: 0.8 }}>{c.codon}</span>
                <strong style={{ color: leido ? c.amino.color : T.text3 }}>{c.paro ? "STOP" : c.amino.abr}</strong>
              </span>
            );
          })}
          {codones.length === 0 && <span style={{ color: T.text3 }}>La secuencia no contiene el codón de inicio AUG.</span>}
        </div>
        <div style={{ height: 10 }} />
        {nota(modoCol, <>El ribosoma empieza en <strong>AUG (metionina)</strong> y se detiene en el primer codón de parada (UAA, UAG o UGA). Proteína: <strong style={{ color: "#86efac" }}>{proteina.length > 0 ? proteina.join("-") : "—"}</strong>.</>)}
      </>
    );
  }

  const controles: ReactNode = (
    <>
      <Bloque titulo="Muta el ADN" icono="fa-dna">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
          {SECUENCIAS.map((s) => {
            const on = s.id === presetId;
            return (
              <button key={s.id} type="button" onClick={() => elegirPreset(s.id)}
                style={{ cursor: "pointer", textAlign: "center", fontSize: 14, fontWeight: 800, lineHeight: 1.2, padding: "10px 6px", borderRadius: 11, border: `1px solid ${on ? modoCol : "rgba(255,255,255,0.14)"}`, background: on ? `${modoCol}26` : "transparent", color: on ? "#fff" : T.text2 }}>
                <div style={{ fontSize: 17, marginBottom: 3, color: on ? modoCol : "inherit" }}><i className={`fa-solid ${s.icono}`} aria-hidden /></div>
                {s.etq}
              </button>
            );
          })}
        </div>
        <div style={{ color: T.text2 }}>
          <i className="fa-solid fa-hand-pointer" style={{ color: modoCol, marginRight: 7 }} aria-hidden />
          Toca una letra para cambiar esa base (A → T → G → C).
        </div>
        <div className="ad-strip" role="group" aria-label="Bases de la hebra codificante">
          {codificante.split("").map((b, i) => {
            const distinta = (original[i] ?? b) !== b || codificante.length !== original.length;
            return (
              <button key={i} type="button" className="ad-mut" onClick={() => mutarBase(i)}
                aria-label={`Base ${i + 1}: ${b}. Cambiar`} data-mut={distinta && (original[i] ?? b) !== b}
                style={{ color: BASE_COLOR[b as Base] ?? "#fff", borderColor: BASE_COLOR[b as Base] ?? "#fff" }}>
                {b}
              </button>
            );
          })}
        </div>
        <input className="ad-seq" value={codificante} onChange={(e) => editarSeq(e.target.value)} spellCheck={false} maxLength={30} aria-label="Secuencia de ADN" placeholder="ESCRIBE TU ADN (A, T, G, C)" style={{ ["--adc" as string]: modoCol }} />
        {preset && <div style={{ color: T.text2 }}><i className="fa-solid fa-circle-info" style={{ color: modoCol, marginRight: 7 }} aria-hidden />{preset.nota}</div>}
        {cambioSeq && (
          <button type="button" onClick={restaurar}
            style={{ cursor: "pointer", fontSize: 14, fontWeight: 800, color: "#fff", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "10px 14px" }}>
            <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} aria-hidden />Restaurar la secuencia original
          </button>
        )}
      </Bloque>

      <Bloque titulo="Qué le pasa a la proteína" icono="fa-cubes-stacked">
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 8 }}>
          <Dato label="Original" value={proteinaOrig.length > 0 ? proteinaOrig.join("-") : "—"} />
          <Dato label="Con tu ADN" value={proteina.length > 0 ? proteina.join("-") : "—"} col={efecto?.col ?? modoCol} />
        </div>
        {efecto
          ? nota(efecto.col, <>{efecto.txt}</>)
          : <p style={{ margin: 0, color: T.text2 }}>Cambia una base y compara: este es el efecto de una mutación puntual.</p>}
      </Bloque>

      <Bloque titulo="Avance del proceso" icono="fa-forward-step">
        <Deslizador label={modo === "traduccion" ? "Codones leídos" : "Bases procesadas"} icon="fa-ruler-horizontal" colr={modoCol}
          valor={`${paso} / ${total}`} min={0} max={Math.max(1, total)} step={1} value={paso}
          onChange={(v) => { setPlaying(false); setProgreso(v); }} hintL="inicio" hintR="final" />
        <div style={{ color: T.text2 }}>
          <i className="fa-solid fa-hand-pointer" style={{ marginRight: 8, color: modoCol }} aria-hidden />
          También puedes <strong style={{ color: "#fff" }}>arrastrar la perilla brillante</strong> en la escena 3D.
        </div>
      </Bloque>

      <Bloque titulo={`Moléculas — ${def.etq}`} icono={def.icono}>
        {hebras}
      </Bloque>
    </>
  );

  const teoria: ReactNode = (
    <>
      <Bloque titulo="El visor del dogma central" icono="fa-dna">
        <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
      </Bloque>
      <Bloque titulo="Lectura A1 — Dogma central (Crick, 1958)" icono="fa-book-open">
        <p style={{ margin: 0, color: T.text2 }}>{DEFINICION_DOGMA}</p>
        <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
          {PREGUNTAS.map((q, i) => <li key={i}>{q}</li>)}
        </ul>
      </Bloque>
      <Bloque titulo="Maquinaria" icono="fa-gears">
        {ENZIMAS.map((e) => (
          <div key={e.nombre} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <i className={`fa-solid ${e.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
            <div>
              <strong>{e.nombre}</strong>
              <div style={{ color: T.text2 }}>{e.funcion}</div>
            </div>
          </div>
        ))}
      </Bloque>
      <Bloque titulo="Código genético (muestra)" icono="fa-table-cells">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))", gap: 7 }}>
          {CODON_DEMO.map((cod) => {
            const a = CODON_TABLE[cod];
            if (!a) return null;
            const paro = a.abr === "Stop";
            return (
              <div key={cod} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 9, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                <span style={{ fontFamily: "ui-monospace,monospace", fontWeight: 900, color: a.color }}>{cod}</span>
                <i className="fa-solid fa-arrow-right" style={{ fontSize: 12, color: T.text3 }} aria-hidden />
                <span style={{ fontWeight: 800, color: paro ? "#f87171" : "#fff" }}>{paro ? "Paro" : a.abr}</span>
              </div>
            );
          })}
        </div>
        <p style={{ margin: 0, color: T.text3 }}>64 codones (4³) codifican 20 aminoácidos (código degenerado) más 3 de parada. AUG marca el inicio.</p>
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
      <Bloque titulo="Datos del genoma" icono="fa-magnifying-glass-chart">
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
      <Bloque titulo="Excepción: los virus ARN" icono="fa-virus">
        <p style={{ margin: 0, color: T.text2 }}>{CALLOUT_VIRUS}</p>
      </Bloque>
      <Bloque titulo="México: medicina genómica" icono="fa-location-dot">
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
        <FichaTeorica data={ADN_DOGMA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
      </Bloque>
      <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
        La definición del dogma central, las preguntas de reflexión, el callout de los virus ARN y el contexto del INMEGEN son <strong>verbatim</strong> de la lectura A1; el glosario y sus ejemplos son verbatim del glosario A5; los datos de «¿sabías que?» provienen de los quizzes A2/A4. El <strong>código genético</strong> (tabla de codones) es la referencia universal estándar: para cualquier secuencia que escribas, la complementariedad (A-T, G-C), la transcripción (T→U) y la traducción (codón→aminoácido) se calculan de forma <strong>exacta</strong>. El modelo 3D de la doble hélice, las enzimas, el ribosoma y los ARNt es <strong>esquemático</strong> (no a escala atómica): representa el mecanismo del flujo de información, no una estructura molecular medida. Fuente: {FUENTE}
      </p>
    </>
  );

  return (
    <>
      <style>{`
        .ad-strip { display:flex; flex-wrap:wrap; gap:4px; }
        .ad-base { font-family:ui-monospace,monospace; font-size:15px; font-weight:900; width:24px; height:28px;
          display:flex; align-items:center; justify-content:center; border-radius:6px; border:1.5px solid transparent;
          background:rgba(4,10,22,0.45); transition:all .12s; }
        .ad-base[data-on="true"] { transform:translateY(-2px); background:rgba(255,255,255,0.06); }
        .ad-mut { cursor:pointer; font-family:ui-monospace,monospace; font-size:17px; font-weight:900; width:36px; height:42px;
          display:flex; align-items:center; justify-content:center; border-radius:9px; border:1.5px solid;
          background:rgba(4,10,22,0.55); transition:transform .12s, background .12s; }
        .ad-mut:hover { transform:translateY(-2px); background:rgba(255,255,255,0.1); }
        .ad-mut[data-mut="true"] { box-shadow:0 0 0 3px rgba(251,113,133,0.75); }
        .ad-chips { display:flex; flex-wrap:wrap; gap:6px; }
        .ad-chip { display:inline-flex; flex-direction:column; align-items:center; gap:1px; padding:5px 9px; border-radius:9px;
          border:1px solid; font-size:14px; font-weight:900; transition:all .12s; }
        .ad-seq { width:100%; box-sizing:border-box; font-family:ui-monospace,monospace; font-size:15px; font-weight:800;
          letter-spacing:0.12em; color:#fff; background:rgba(4,10,22,0.55); border:1px solid var(--adc); border-radius:10px;
          padding:10px 12px; outline:none; text-transform:uppercase; }
        .ad-gate { position:absolute; inset:0; z-index:20; overflow-y:auto; }
        .ad-gate > div { position:relative !important; inset:auto !important; min-height:100%; }

        /* Reto de cálculo */
        .ad-calc-in { flex:1; min-width:130px; box-sizing:border-box; font-family:ui-monospace,monospace; font-size:15px;
          font-weight:800; color:#fff; background:rgba(4,10,22,0.55); border:1px solid var(--adc); border-radius:10px;
          padding:10px 12px; outline:none; }
        .ad-calc-btn { cursor:pointer; border-radius:10px; padding:10px 16px; font-size:14px; font-weight:800;
          border:1px solid transparent; transition:all .15s; }
        .ad-calc-primary { color:#04121f; background:var(--adc); }
        .ad-calc-primary:hover { filter:brightness(1.08); }
        .ad-calc-ghost { color:#fff; background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.16); }
        .ad-calc-ghost:hover { background:rgba(255,255,255,0.12); }
      `}</style>
      <LabShell
        accent={accent}
        rgba={color.rgba}
        retoKey={RETO_KEY}
        escena={
          <>
            <SceneBoundary fallback={sceneFallback}>
              <AdnDogmaScene
                modo={modo}
                codificante={codificante}
                molde={molde}
                arnm={arnm}
                codones={codones}
                progreso={paso}
                total={total}
                playing={playing}
                accent={accent}
                modoColor={modoCol}
                resetNonce={resetNonce}
                arrastrable={eppListo}
                onScrub={onArrastraPaso}
                onGrab={onGrabAdn}
              />
            </SceneBoundary>

            {/* Pilar: equiparse — pórtico de bioseguridad */}
            {!eppListo && (
              <div className="ad-gate">
                <EppGate
                  accent={accent}
                  rgba={color.rgba}
                  items={INSTRUMENTOS}
                  titulo="Antes de entrar al laboratorio de biología molecular"
                  subtitulo="Selecciona el equipo de protección y bioseguridad correcto."
                  verbo="equipo de bioseguridad"
                  onEntrar={() => {
                    setEppListo(true);
                    if (sonido) audioRef.current?.blip();
                  }}
                />
              </div>
            )}
          </>
        }
        modos={{
          opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq, icono: MODOS_DEF[m].icono })),
          valor: modo,
          cambiar: (id) => cambiarModo(id as Modo),
        }}
        herramientas={
          <>
            <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
            <BotonHerramienta icono="fa-backward-step" titulo="Paso atrás" onClick={() => { setPlaying(false); setProgreso((p) => Math.max(0, p - 1)); }} />
            <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reanudar"} activo={playing} onClick={() => setPlaying((p) => !p)} />
            <BotonHerramienta icono="fa-forward-step" titulo="Paso adelante" onClick={() => { setPlaying(false); setProgreso((p) => Math.min(total, p + 1)); }} />
            <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
          </>
        }
        lectura={lectura}
        objetivos={objetivos}
        pestanas={[
          { id: "controles", etiqueta: "Controles", icono: "fa-sliders", contenido: controles },
          {
            id: "reto",
            etiqueta: "Reto",
            icono: "fa-trophy",
            contenido: (
              <div style={{ display: "grid", gap: 16 }}>
                <PrediccionCodonCard
                  accent={accent}
                  rgba={color.rgba}
                  codones={codonesReto}
                  paso={paso}
                  mejor={mejorEstrellas}
                  onResultado={registraEstrellas}
                  playSfx={(ok) => {
                    if (!sonido) return;
                    if (ok) audioRef.current?.correcto();
                    else audioRef.current?.incorrecto();
                  }}
                  playPick={() => {
                    if (sonido) audioRef.current?.blip();
                  }}
                />
                <RetoQuizCard
                  quiz={QUIZ_A2}
                  accent={accent}
                  rgba={color.rgba}
                  aprobado={ejercicioAprobado}
                  onAprobado={() => setEjercicioAprobado(true)}
                  playSfx={() => {
                    if (sonido) audioRef.current?.correcto();
                  }}
                  playPick={() => {
                    if (sonido) audioRef.current?.blip();
                  }}
                />
              </div>
            ),
          },
          { id: "teoria", etiqueta: "Teoría", icono: "fa-book-open", contenido: teoria },
        ]}
      />
    </>
  );
}
