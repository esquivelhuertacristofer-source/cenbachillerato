"use client";

/**
 * Laboratorio — A trip to remember
 * Práctica experimental para IN-IV-P01 (Inglés IV, progresión 1).
 *
 * Es un SIMULADOR de narración: el alumno le cuenta un viaje a Beto (un amigo
 * ficticio) y lo que elige cambia lo que se VE y lo que Beto entiende.
 *
 *  1. «Spelling the past» — la MÁQUINA DEL PASADO. Se elige la regla y la
 *     máquina escribe la palabra: con la regla buena aparece el pasado; con la
 *     mala, la palabra rota («stoped», «studyed», «arriveed») tachada.
 *  2. «Background & interruption» — se elige la forma del FONDO y de la
 *     INTERRUPCIÓN y la línea del tiempo se dibuja: past continuous = banda
 *     larga; past simple = un golpe breve. Con la forma equivocada la línea
 *     queda incoherente y Beto no entiende la escena.
 *  3. «Build the trip» — la RUTA: el autobús avanza parada por parada según la
 *     oración que se elige para contar «lo que pasó después»; si se cuenta en
 *     desorden, el autobús no avanza y Beto se pierde. Después, caza del
 *     intruso (la oración que rompe el tiempo verbal).
 *  4. «Write the verb» — SE ESCRIBE: ocho oraciones simple o continuous.
 *  5. «Completa el texto» — los dos textos con huecos (A2 y A6), verbatim.
 *  + Reto evaluable con el True/False verbatim de A4 (pestaña «Reto»).
 *
 * La teoría verbatim (lectura, glosario, ficha…) vive en la pestaña «Teoría».
 * Personas FICTICIAS; lugares reales. Imágenes en /media/labs-sim/.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato } from "./_shell";
import { hablarLab, callarLab } from "./lab-voz";
import { LabSfx } from "./lab-audio";
import { CompletaTexto, normaliza } from "./_mecanica-huecos";
import { PASADO_VIAJE_HUECOS_A2, PASADO_VIAJE_HUECOS_A6 } from "./pasado-viaje-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { PASADO_VIAJE_FICHA } from "./pasado-viaje-ficha";
import {
  VERBOS,
  TOTAL_VERBOS,
  ORDEN_REGLAS,
  REGLA_INFO,
  ESCENAS,
  RELATO,
  RELATO_TITULO,
  CONECTORES_INFO,
  EXPRESIONES_TIEMPO,
  INTRUSOS,
  ESCRITURA,
  LECTURA_A1,
  LECTURA_A1_TITULO,
  NOTA_GRAMATICAL_A1,
  PREGUNTAS_A1,
  DATO_A1,
  TU_TURNO_A3,
  GLOSARIO_A5,
  CIERRE_A5,
  AUTOEVAL_A7,
  AUTOEVAL_A7_CIERRE,
  VIDEO_A8,
  QUIZ,
  DATO_BILINGUE,
  FUENTE,
  MARCO,
  type ReglaEd,
  type EscenaFondo,
  type FichaVerbo,
} from "./pasado-viaje-data";

const NO = "#FF5E5E";
const AVISO = "#FFC75A";
const RETO_KEY = "cen-pasado-viaje-reto";
const RUTA_FOTOS = "/media/labs-sim/pasado-viaje-ingles";

type Modo = "ortografia" | "fondo" | "relato" | "escribir" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "ortografia", label: "Spelling the past", icono: "fa-spell-check" },
  { id: "fondo", label: "Background & interruption", icono: "fa-timeline" },
  { id: "relato", label: "Build the trip", icono: "fa-route" },
  { id: "escribir", label: "Write the verb", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

/** Orden fijo (determinista) en que se ofrecen los verbos de la máquina. */
const ORDEN_VERBOS = [
  "arrive", "go", "study", "stop", "visit", "buy", "carry", "decorate",
  "plan", "see", "try", "walk", "shop", "taste", "take", "play",
];

/** Imagen de cada escena de fondo/interrupción. */
const FOTO_ESCENA: Record<string, { clave: string; icono: string }> = {
  teoti: { clave: "teotihuacan-calzada", icono: "fa-mountain" },
  zocalo: { clave: "zocalo-oaxaca", icono: "fa-music" },
  xochimilco: { clave: "xochimilco-trajinera", icono: "fa-sailboat" },
  mercado: { clave: "mercado-oaxaca", icono: "fa-utensils" },
  montealban: { clave: "monte-alban", icono: "fa-pencil" },
};

/** Imagen del momento del viaje en que va el autobús. */
const FOTO_RELATO: Record<string, { clave: string; icono: string }> = {
  m1: { clave: "teotihuacan-calzada", icono: "fa-mountain" },
  m2: { clave: "camion-madrugada", icono: "fa-bus" },
  m3: { clave: "guia-piramides", icono: "fa-person-chalkboard" },
  m4: { clave: "teotihuacan-calzada", icono: "fa-person-walking" },
  m5: { clave: "lluvia-comida", icono: "fa-cloud-rain" },
  m6: { clave: "camion-madrugada", icono: "fa-house" },
};

/** Lo que escribiría la máquina al aplicar una regla a un verbo base. */
function aplicarRegla(regla: ReglaEd, base: string): string | null {
  if (regla === "irregular") return null;
  if (regla === "ed") return `${base}ed`;
  if (regla === "d") return `${base}d`;
  if (regla === "ied") return base.endsWith("y") ? `${base.slice(0, -1)}ied` : `${base}ied`;
  return `${base}${base.slice(-1)}ed`;
}

/** Por qué esa ficha no va en esa zona de la línea del tiempo. */
function razonZona(ficha: FichaVerbo, zona: "fondo" | "inter"): string {
  if (zona === "fondo") {
    return ficha.tipo === "simple"
      ? "Un past simple es un hecho que ocurrió y se acabó: la línea no puede dibujar una acción larga en marcha."
      : "Esa forma sí está en continuous, pero es del otro verbo de la escena. Mira cuál de los dos duraba.";
  }
  return ficha.tipo === "cont"
    ? "Una acción en continuous dura: no corta nada. Lo que interrumpe ocurre de golpe, en past simple."
    : "Esa forma sí está en past simple, pero es del otro verbo de la escena. Mira cuál fue instantáneo.";
}

type Msg = { ok: boolean; txt: string } | null;

export function LabPasadoViajeIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("ortografia");

  /* ── sonido y partida ─────────────────────────────────────────────── */
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(() => () => audioRef.current?.dispose(), []);
  useEffect(() => callarLab, []);
  const toggleSonido = async () => {
    if (!sonido) {
      if (!audioRef.current) audioRef.current = new LabSfx();
      await audioRef.current.enable();
      setSonido(true);
    } else {
      audioRef.current?.mute();
      setSonido(false);
    }
  };
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  /* ═══ MODO 1 · La máquina del pasado ═══════════════════════════════ */
  const [colocado, setColocado] = useState<Record<string, ReglaEd>>({});
  const [selVerbo, setSelVerbo] = useState<string | null>(null);
  const [intento, setIntento] = useState<{ verbo: string; regla: ReglaEd; ok: boolean } | null>(null);
  const [msgOrt, setMsgOrt] = useState<Msg>(null);

  const verbosLibres = ORDEN_VERBOS.filter((id) => !colocado[id]);
  const verboActualId = selVerbo && !colocado[selVerbo] ? selVerbo : (verbosLibres[0] ?? null);
  const verboActual = VERBOS.find((x) => x.id === verboActualId) ?? null;

  const probarRegla = (regla: ReglaEd) => {
    const v = verboActual;
    if (!v) return;
    if (v.regla === regla) {
      setColocado((prev) => ({ ...prev, [v.id]: regla }));
      setSelVerbo(null);
      setIntento({ verbo: v.id, regla, ok: true });
      setMsgOrt({ ok: true, txt: `${v.base} → ${v.pasado}. ${v.porque}` });
      sfxPlace();
    } else {
      setIntento({ verbo: v.id, regla, ok: false });
      setMsgOrt({ ok: false, txt: `«${REGLA_INFO[regla].titulo}» no es la regla de «${v.base}». ${REGLA_INFO[regla].explica}` });
      sfxNo();
    }
  };

  const colocadosTotal = Object.keys(colocado).length;
  const ortografiaDone = colocadosTotal >= TOTAL_VERBOS;

  const resetOrtografia = () => {
    setColocado({});
    setSelVerbo(null);
    setIntento(null);
    setMsgOrt(null);
  };

  /* ═══ MODO 2 · Background & interruption ═══════════════════════════ */
  const [escIdx, setEscIdx] = useState(0);
  const [sel, setSel] = useState<Record<string, { fondo?: string; inter?: string }>>({});
  const [elegida, setElegida] = useState<Record<string, boolean>>({});
  const [msgEsc, setMsgEsc] = useState<Msg>(null);

  const esc: EscenaFondo = ESCENAS[escIdx] ?? ESCENAS[0]!;
  const selEsc = sel[esc.id] ?? {};
  const armada = (e: EscenaFondo) => sel[e.id]?.fondo === e.fondoId && sel[e.id]?.inter === e.interId;
  const escArmada = armada(esc);
  const fichaDe = (id?: string) => esc.fichas.find((f) => f.id === id);
  const fichaFondo = fichaDe(selEsc.fondo);
  const fichaInter = fichaDe(selEsc.inter);

  const elegirForma = (zona: "fondo" | "inter", fichaId: string) => {
    if (escArmada || selEsc[zona] === fichaId) return;
    const ficha = fichaDe(fichaId);
    if (!ficha) return;
    const esperado = zona === "fondo" ? esc.fondoId : esc.interId;
    const nuevo = { ...selEsc, [zona]: fichaId };
    setSel((prev) => ({ ...prev, [esc.id]: nuevo }));
    if (fichaId === esperado) {
      const completa = nuevo.fondo === esc.fondoId && nuevo.inter === esc.interId;
      setMsgEsc({
        ok: true,
        txt: completa
          ? "Beto: «¡Ya lo veo! Algo larguísimo y, de golpe, algo lo corta.» La línea quedó coherente."
          : zona === "fondo"
            ? `«${ficha.forma}»: past continuous, la banda larga que ya estaba en marcha.`
            : `«${ficha.forma}»: past simple, el golpe breve que corta la banda.`,
      });
      sfxPlace();
    } else {
      setMsgEsc({ ok: false, txt: `Beto frunce el ceño y no entiende. ${razonZona(ficha, zona)}` });
      sfxNo();
    }
  };

  const elegirOracion = (i: number) => {
    if (elegida[esc.id]) return;
    const op = esc.opciones[i === 0 ? 0 : 1];
    if (op.correcta) {
      setElegida((prev) => ({ ...prev, [esc.id]: true }));
      setMsgEsc({ ok: true, txt: `${op.razon} ${esc.explica}` });
      sfxOk();
    } else {
      setMsgEsc({ ok: false, txt: op.razon });
      sfxNo();
    }
  };

  const escenasArmadas = ESCENAS.filter((e) => armada(e)).length;
  const escenasElegidas = ESCENAS.filter((e) => elegida[e.id]).length;
  const fondoDone = escenasArmadas >= ESCENAS.length;
  const oracionesDone = escenasElegidas >= ESCENAS.length;

  const resetFondo = () => {
    setSel({});
    setElegida({});
    setMsgEsc(null);
    setEscIdx(0);
  };

  /* ═══ MODO 3 · Build the trip (la ruta) ════════════════════════════ */
  const [fase, setFase] = useState<"orden" | "intrusos">("orden");
  const [avance, setAvance] = useState<string[]>([]);
  const [msgRelato, setMsgRelato] = useState<Msg>(null);
  const [cazados, setCazados] = useState<Record<string, boolean>>({});
  const [fallado, setFallado] = useState<Record<string, number>>({});
  const [msgIntruso, setMsgIntruso] = useState<Record<string, { ok: boolean; txt: string }>>({});

  const paso = avance.length;
  const siguiente = RELATO[paso];
  const ordenDone = paso >= RELATO.length;
  const cartasLibres = ["m3", "m6", "m1", "m5", "m2", "m4"].filter((id) => !avance.includes(id));

  const contar = (cartaId: string) => {
    if (!siguiente || avance.includes(cartaId)) return;
    if (siguiente.id === cartaId) {
      setAvance((prev) => [...prev, cartaId]);
      setMsgRelato({ ok: true, txt: `El autobús avanza. ${siguiente.pista}` });
      sfxPlace();
    } else {
      const otra = RELATO.find((m) => m.id === cartaId);
      setMsgRelato({
        ok: false,
        txt: `Beto se pierde: «${otra?.texto ?? ""}» no puede contarse ahora. El autobús sigue parado: la parada ${paso + 1} anuncia «${siguiente.conector}».`,
      });
      sfxNo();
    }
  };

  const cazar = (rondaId: string, i: number) => {
    const ronda = INTRUSOS.find((r) => r.id === rondaId);
    if (!ronda || cazados[rondaId]) return;
    if (ronda.intruso === i) {
      setCazados((prev) => ({ ...prev, [rondaId]: true }));
      setMsgIntruso((prev) => ({ ...prev, [rondaId]: { ok: true, txt: `${ronda.explica} Debería decir: «${ronda.correccion}»` } }));
      sfxOk();
    } else {
      setFallado((prev) => ({ ...prev, [rondaId]: i }));
      setMsgIntruso((prev) => ({
        ...prev,
        [rondaId]: { ok: false, txt: "Esa oración sí está en pasado. Busca un verbo en presente o en futuro: es el que rompe la narración." },
      }));
      sfxNo();
    }
  };

  const intrusosDone = Object.keys(cazados).length >= INTRUSOS.length;

  const resetRelato = () => {
    setAvance([]);
    setMsgRelato(null);
    setCazados({});
    setFallado({});
    setMsgIntruso({});
    setFase("orden");
  };

  /* ═══ MODO 4 · Write the verb (se escribe) ═════════════════════════ */
  const [vals, setVals] = useState<Record<string, string>>({});
  const [estados, setEstados] = useState<Record<string, "vacio" | "bien" | "mal">>({});
  const [pistas, setPistas] = useState<Record<string, boolean>>({});
  const [notas, setNotas] = useState<Record<string, string>>({});

  const comprobarEscritura = (id: string) => {
    const item = ESCRITURA.find((x) => x.id === id);
    if (!item || estados[id] === "bien") return;
    const v = (vals[id] ?? "").trim();
    if (v === "") {
      setEstados((prev) => ({ ...prev, [id]: "vacio" }));
      return;
    }
    const bien = [item.respuesta, ...item.alternativas].some((r) => normaliza(r) === normaliza(v));
    setEstados((prev) => ({ ...prev, [id]: bien ? "bien" : "mal" }));
    setNotas((prev) => ({ ...prev, [id]: bien ? item.explica : `Todavía no. ${item.pista}` }));
    if (bien) sfxPlace();
    else sfxNo();
  };

  const escritasBien = ESCRITURA.filter((x) => estados[x.id] === "bien").length;
  const escribirDone = escritasBien >= ESCRITURA.length;

  const resetEscribir = () => {
    setVals({});
    setEstados({});
    setPistas({});
    setNotas({});
  };

  /* ═══ MODO 5 · Completa el texto (A2 y A6 verbatim) ════════════════ */
  const [texto2Done, setTexto2Done] = useState(false);
  const [texto6Done, setTexto6Done] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTexto2Done(false);
    setTexto6Done(false);
    setTextoIntento((n) => n + 1);
  };

  /* ── reto evaluable ───────────────────────────────────────────────── */
  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── objetivos ────────────────────────────────────────────────────── */
  const todoHecho =
    ortografiaDone && fondoDone && oracionesDone && ordenDone && intrusosDone && escribirDone && texto2Done && texto6Done;
  const objetivos = [
    { txt: "Pon a trabajar la máquina: escribe bien el pasado de 4 verbos", done: colocadosTotal >= 4 },
    { txt: `Clasifica los ${TOTAL_VERBOS} verbos por su regla de escritura`, done: ortografiaDone },
    { txt: `Dibuja fondo e interrupción en las ${ESCENAS.length} escenas`, done: fondoDone },
    { txt: "Elige la oración bien armada en cada escena", done: oracionesDone },
    { txt: `Lleva el autobús por las ${RELATO.length} paradas del viaje, en orden`, done: ordenDone },
    { txt: `Caza las ${INTRUSOS.length} oraciones que rompen el tiempo verbal`, done: intrusosDone },
    { txt: `Escribe las ${ESCRITURA.length} formas verbales (simple o continuous)`, done: escribirDone },
    { txt: "Completa el texto de A2 (past simple)", done: texto2Done, modo: "texto" },
    { txt: "Completa el texto de A6 (past continuous)", done: texto6Done, modo: "texto" },
    { txt: "Aprueba el reto evaluable", done: quizAprobado },
    { txt: "Termina con 2 errores o menos", done: todoHecho && partida.errores <= 2 },
  ];

  const resetActual =
    modo === "ortografia"
      ? resetOrtografia
      : modo === "fondo"
        ? resetFondo
        : modo === "relato"
          ? resetRelato
          : modo === "escribir"
            ? resetEscribir
            : resetTexto;

  const lectura =
    modo === "ortografia" ? (
      <>Verbos con su pasado bien escrito: {colocadosTotal}/{TOTAL_VERBOS}</>
    ) : modo === "fondo" ? (
      <>Escenas contadas con claridad: {escenasArmadas}/{ESCENAS.length}</>
    ) : modo === "relato" ? (
      <>Paradas del viaje contadas: {paso}/{RELATO.length}</>
    ) : modo === "escribir" ? (
      <>Formas verbales escritas: {escritasBien}/{ESCRITURA.length}</>
    ) : (
      <>Textos completados: {Number(texto2Done) + Number(texto6Done)}/2</>
    );

  const instruccion = (txt: string, n?: string, ok?: boolean) => (
    <div className="psv-instr">
      <span>{txt}</span>
      {n && <span style={{ color: ok ? OK : T.text3 }}>{n}</span>}
    </div>
  );

  const aviso = (m: Msg) =>
    m && (
      <div className="psv-aviso" data-ok={m.ok} role="status">
        <i className={`fa-solid ${m.ok ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: m.ok ? OK : NO }} />
        <span>{m.txt}</span>
      </div>
    );

  const fotoRelato = FOTO_RELATO[avance[avance.length - 1] ?? "m1"] ?? FOTO_RELATO.m1!;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      dom
      modos={{
        opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.label, icono: m.icono })),
        valor: modo,
        cambiar: (id) => setModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      escena={
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <style>{css(accent, color.rgba)}</style>

          {/* ───────── MODO 1 · La máquina del pasado ───────── */}
          {modo === "ortografia" && (
            <>
              {instruccion("Elige la regla y mira qué escribe la máquina", `${colocadosTotal}/${TOTAL_VERBOS}`, ortografiaDone)}
              {verboActual ? (
                <div className="psv-maq">
                  <div className="psv-maq-verbo">
                    <span className="psv-maq-es">{verboActual.es}</span>
                    <strong>{verboActual.base}</strong>
                  </div>
                  <div className="psv-maq-flecha" aria-hidden>
                    <i className="fa-solid fa-gears" />
                  </div>
                  <div className="psv-maq-salida" data-estado={intento && intento.verbo === verboActual.id ? (intento.ok ? "bien" : "mal") : "espera"}>
                    {intento && intento.verbo === verboActual.id && !intento.ok ? (
                      <>
                        <s>{aplicarRegla(intento.regla, verboActual.base) ?? "¿?"}</s>
                        <small>{aplicarRegla(intento.regla, verboActual.base) ? "así no se escribe" : "esto sí tiene regla"}</small>
                      </>
                    ) : (
                      <>
                        <strong>?</strong>
                        <small>pasado</small>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="psv-ok">
                  <i className="fa-solid fa-circle-check" /> Los {TOTAL_VERBOS} verbos tienen su pasado bien escrito. Cuatro reglas y una lista que se memoriza.
                </div>
              )}

              {verboActual && (
                <div className="psv-reglas">
                  {ORDEN_REGLAS.map((r) => (
                    <button key={r} type="button" className="psv-regla" onClick={() => probarRegla(r)}>
                      <i className={`fa-solid ${REGLA_INFO[r].icono}`} style={{ color: REGLA_INFO[r].color }} />
                      <span>{REGLA_INFO[r].titulo}</span>
                      <em>{REGLA_INFO[r].ejemplo}</em>
                    </button>
                  ))}
                </div>
              )}

              {verbosLibres.length > 0 && (
                <div>
                  <div className="psv-nota">Otro verbo para la máquina:</div>
                  <div className="psv-fichas">
                    {verbosLibres.map((id) => {
                      const v = VERBOS.find((x) => x.id === id);
                      if (!v) return null;
                      return (
                        <button key={id} type="button" className="psv-chip" data-sel={verboActualId === id} onClick={() => setSelVerbo(id)}>
                          {v.base}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {aviso(msgOrt)}

              <div className="psv-historial">
                {ORDEN_REGLAS.map((r) => {
                  const dentro = VERBOS.filter((v) => colocado[v.id] === r);
                  return (
                    <div key={r} className="psv-hist-col" data-full={dentro.length >= VERBOS.filter((v) => v.regla === r).length}>
                      <strong style={{ color: REGLA_INFO[r].color }}>{REGLA_INFO[r].titulo}</strong>
                      {dentro.length === 0 && <span className="psv-nota">vacío</span>}
                      {dentro.map((v) => (
                        <span key={v.id} className="psv-forma">
                          {v.base} <i className="fa-solid fa-arrow-right" aria-hidden /> <b>{v.pasado}</b>
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ───────── MODO 2 · Background & interruption ───────── */}
          {modo === "fondo" && (
            <>
              {instruccion("Elige las formas verbales y mira la línea del tiempo", `${escenasElegidas}/${ESCENAS.length}`, oracionesDone)}
              <div className="psv-pills">
                {ESCENAS.map((e, i) => {
                  const listo = Boolean(elegida[e.id]);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      className="psv-pill"
                      data-on={escIdx === i}
                      data-done={listo}
                      onClick={() => {
                        setEscIdx(i);
                        setMsgEsc(null);
                      }}
                    >
                      <i className={`fa-solid ${listo ? "fa-circle-check" : "fa-location-dot"}`} />
                      {e.lugar.split(",")[0]}
                    </button>
                  );
                })}
              </div>

              <div className="psv-escena">
                <Foto clave={FOTO_ESCENA[esc.id]?.clave ?? "teotihuacan-calzada"} icono={FOTO_ESCENA[esc.id]?.icono ?? "fa-image"} alt={esc.lugar} />
                <div className="psv-escena-txt">
                  <strong>{esc.lugar}</strong>
                  <span>{esc.contexto}</span>
                </div>
              </div>

              <LineaTiempo
                accent={accent}
                sujetoFondo={esc.fondoAntes.trim()}
                sujetoInter={esc.interAntes.trim()}
                fondo={fichaFondo ? { forma: fichaFondo.forma, tipo: fichaFondo.tipo } : null}
                inter={fichaInter ? { forma: fichaInter.forma, tipo: fichaInter.tipo } : null}
              />

              <div className="psv-dos">
                {(["fondo", "inter"] as const).map((zona) => {
                  const puesta = zona === "fondo" ? fichaFondo : fichaInter;
                  const antes = zona === "fondo" ? esc.fondoAntes : esc.interAntes;
                  const despues = zona === "fondo" ? esc.fondoDespues : esc.interDespues;
                  const esperado = zona === "fondo" ? esc.fondoId : esc.interId;
                  return (
                    <div key={zona} className="psv-zona" data-done={puesta?.id === esperado}>
                      <div className="psv-zona-tit" style={{ color: zona === "fondo" ? accent : AVISO }}>
                        <i className={`fa-solid ${zona === "fondo" ? "fa-grip-lines" : "fa-bolt"}`} />
                        {zona === "fondo" ? "Fondo · lo que ya pasaba" : "Interrupción · lo que ocurrió"}
                      </div>
                      <div className="psv-zona-frase">
                        {antes}
                        <span className="psv-hueco" data-ok={puesta?.id === esperado}>{puesta ? puesta.forma : "· · ·"}</span>
                        {despues}
                      </div>
                      <div className="psv-fichas">
                        {esc.fichas.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            className="psv-chip"
                            data-sel={puesta?.id === f.id}
                            disabled={escArmada}
                            onClick={() => elegirForma(zona, f.id)}
                          >
                            {f.forma}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {escArmada && (
                <div>
                  {instruccion(`¿Cuál oración está bien armada con ${esc.opciones[0].texto.startsWith("While") ? "while" : "when"}?`)}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                    {esc.opciones.map((op, i) => (
                      <button
                        key={i}
                        type="button"
                        className="psv-frase"
                        data-e={elegida[esc.id] ? (op.correcta ? "bien" : undefined) : undefined}
                        disabled={Boolean(elegida[esc.id])}
                        onClick={() => elegirOracion(i)}
                      >
                        {op.texto}
                      </button>
                    ))}
                  </div>
                  {elegida[esc.id] && (
                    <button type="button" className="psv-btn" style={{ marginTop: 10 }} onClick={() => hablarLab(esc.opciones.find((o) => o.correcta)?.texto ?? "")}>
                      <i className="fa-solid fa-volume-high" /> Escuchar
                    </button>
                  )}
                </div>
              )}

              {aviso(msgEsc)}
              <div className="psv-nota">
                <i className="fa-solid fa-location-dot" /> {esc.dato}
              </div>
            </>
          )}

          {/* ───────── MODO 3 · Build the trip ───────── */}
          {modo === "relato" && (
            <>
              <div className="psv-pills">
                <button type="button" className="psv-pill" data-on={fase === "orden"} data-done={ordenDone} onClick={() => setFase("orden")}>
                  <i className="fa-solid fa-route" /> 1 · Ruta
                </button>
                <button type="button" className="psv-pill" data-on={fase === "intrusos"} data-done={intrusosDone} onClick={() => setFase("intrusos")}>
                  <i className="fa-solid fa-magnifying-glass" /> 2 · Caza al intruso
                </button>
              </div>

              {fase === "orden" && (
                <>
                  {instruccion(RELATO_TITULO, `${paso}/${RELATO.length}`, ordenDone)}
                  <Foto clave={fotoRelato.clave} icono={fotoRelato.icono} alt={RELATO_TITULO} />
                  <Ruta avance={avance} accent={accent} />
                  <div className="psv-contado">
                    {avance.length === 0 ? (
                      <span className="psv-nota">Beto espera el principio de la historia…</span>
                    ) : (
                      RELATO.filter((m) => avance.includes(m.id)).map((m) => (
                        <span key={m.id}>
                          <b style={{ color: accent }}>{m.conector}</b> {m.texto}{" "}
                        </span>
                      ))
                    )}
                  </div>
                  {siguiente ? (
                    <div>
                      {instruccion(`Parada ${paso + 1}: «${siguiente.conector}» ¿qué pasó?`)}
                      <div className="psv-cartas">
                        {cartasLibres.map((id) => {
                          const m = RELATO.find((x) => x.id === id);
                          if (!m) return null;
                          return (
                            <button key={id} type="button" className="psv-carta" onClick={() => contar(id)}>
                              {m.texto}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="psv-ok" style={{ flexWrap: "wrap" }}>
                      <span>
                        <i className="fa-solid fa-circle-check" /> Beto entendió todo el viaje, de principio a fin.
                      </span>
                      <button type="button" className="psv-btn" onClick={() => hablarLab(RELATO.map((m) => `${m.conector} ${m.texto}`).join(" "))}>
                        <i className="fa-solid fa-volume-high" /> Escuchar el relato
                      </button>
                      <button type="button" className="psv-btn" onClick={() => setFase("intrusos")}>
                        <i className="fa-solid fa-magnifying-glass" /> Caza al intruso
                      </button>
                    </div>
                  )}
                  {aviso(msgRelato)}
                </>
              )}

              {fase === "intrusos" && (
                <>
                  {instruccion("Una oración de cada ronda rompe el tiempo verbal", `${Object.keys(cazados).length}/${INTRUSOS.length}`, intrusosDone)}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {INTRUSOS.map((ronda, n) => {
                      const resuelta = Boolean(cazados[ronda.id]);
                      const msg = msgIntruso[ronda.id];
                      return (
                        <div key={ronda.id} className="psv-ronda" data-done={resuelta}>
                          <div className="psv-nota" style={{ fontWeight: 900 }}>Ronda {n + 1}</div>
                          {ronda.frases.map((f, i) => {
                            const esIntruso = ronda.intruso === i;
                            const estado = resuelta && esIntruso ? "bien" : fallado[ronda.id] === i ? "mal" : undefined;
                            return (
                              <button key={i} type="button" className="psv-frase" data-e={estado} disabled={resuelta} onClick={() => cazar(ronda.id, i)}>
                                {resuelta && esIntruso ? (
                                  <>
                                    <s style={{ opacity: 0.75 }}>{f}</s>
                                    <br />
                                    <span style={{ color: OK, fontWeight: 800 }}>{ronda.correccion}</span>
                                  </>
                                ) : (
                                  f
                                )}
                              </button>
                            );
                          })}
                          {msg && aviso(msg)}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* ───────── MODO 4 · Write the verb ───────── */}
          {modo === "escribir" && (
            <>
              {instruccion("Escribe la forma que pide cada oración", `${escritasBien}/${ESCRITURA.length}`, escribirDone)}
              <div className="psv-nota">Decide si es hecho terminado (past simple) o algo en marcha (past continuous) y escríbelo. Enter comprueba.</div>
              {ESCRITURA.map((item, i) => {
                const est = estados[item.id] ?? "vacio";
                const listo = est === "bien";
                return (
                  <div key={item.id} className="psv-item" data-e={est}>
                    <div className="psv-item-frase">
                      <span className="psv-nota" style={{ fontWeight: 900 }}>{i + 1}</span>
                      <span>{item.antes}</span>
                      <input
                        className="psv-in"
                        data-e={est}
                        value={vals[item.id] ?? ""}
                        disabled={listo}
                        aria-label={`Oración ${i + 1}: forma de «${item.base}»`}
                        placeholder={item.base}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setVals((prev) => ({ ...prev, [item.id]: valor }));
                          if (estados[item.id] === "mal") setEstados((prev) => ({ ...prev, [item.id]: "vacio" }));
                        }}
                        onBlur={() => comprobarEscritura(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            comprobarEscritura(item.id);
                          }
                        }}
                      />
                      <span>{item.despues}</span>
                      <span className="psv-nota">({item.base})</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
                      {!listo && (
                        <button type="button" className="psv-btn" onClick={() => setPistas((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}>
                          <i className="fa-solid fa-lightbulb" /> {pistas[item.id] ? "Ocultar pista" : "Pista"}
                        </button>
                      )}
                      {listo && (
                        <button type="button" className="psv-btn" onClick={() => hablarLab(`${item.antes}${item.respuesta}${item.despues}`)}>
                          <i className="fa-solid fa-volume-high" /> Escuchar
                        </button>
                      )}
                      {pistas[item.id] && !listo && <span className="psv-nota">{item.pista}</span>}
                    </div>
                    {notas[item.id] && (
                      <div className="psv-nota" style={{ marginTop: 8, color: T.text2 }}>
                        <i className={`fa-solid ${listo ? "fa-circle-check" : "fa-circle-info"}`} style={{ color: listo ? OK : NO }} /> {notas[item.id]}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ───────── MODO 5 · Completa el texto (verbatim) ───────── */}
          {modo === "texto" && (
            <>
              {instruccion(`Past simple · ${PASADO_VIAJE_HUECOS_A2.ancla}`)}
              <CompletaTexto
                key={`a2-${textoIntento}`}
                data={PASADO_VIAJE_HUECOS_A2}
                accent={accent}
                rgba={color.rgba}
                completado={texto2Done}
                onCompletado={() => {
                  setTexto2Done(true);
                  sfxOk();
                }}
                onAcierto={sfxPlace}
                onError={sfxNo}
              />
              {instruccion(`Past continuous · ${PASADO_VIAJE_HUECOS_A6.ancla}`)}
              <CompletaTexto
                key={`a6-${textoIntento}`}
                data={PASADO_VIAJE_HUECOS_A6}
                accent={accent}
                rgba={color.rgba}
                completado={texto6Done}
                onCompletado={() => {
                  setTexto6Done(true);
                  sfxOk();
                }}
                onAcierto={sfxPlace}
                onError={sfxNo}
              />
            </>
          )}
        </div>
      }
      pestanas={[
        {
          id: "cuaderno",
          etiqueta: "Cuaderno",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Verbos" value={`${colocadosTotal}/${TOTAL_VERBOS}`} col={ortografiaDone ? OK : undefined} />
                  <Dato label="Escenas" value={`${escenasElegidas}/${ESCENAS.length}`} col={oracionesDone ? OK : undefined} />
                  <Dato label="Paradas" value={`${paso}/${RELATO.length}`} col={ordenDone ? OK : undefined} />
                  <Dato label="Precisión" value={partida.precision === null ? "—" : `${partida.precision}%`} />
                </div>
              </Bloque>
              <Bloque titulo="Qué mover en cada modo" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  {modo === "ortografia" && "Pregúntate en orden: ¿acaba en -e? ¿acaba en consonante + y? ¿es una sílaba con vocal + consonante? Si no, es -ed… o irregular."}
                  {modo === "fondo" && "El fondo duraba (was / were + -ing); lo que lo corta ocurrió y se acabó (past simple). Tras while suele ir el continuous; tras when, el simple."}
                  {modo === "relato" && "Los conectores ordenan: First abre, After that encadena, Finally cierra. Y todo el relato va en el mismo tiempo verbal."}
                  {modo === "escribir" && "Dos decisiones por oración: qué tiempo (simple o continuous) y cómo se escribe. Se acepta didn't y no importan mayúsculas ni acentos."}
                  {modo === "texto" && "Son los dos textos con huecos de la progresión, tal como están publicados."}
                </p>
              </Bloque>
              <Bloque titulo="Conectores de secuencia" icono="fa-arrow-right-long">
                {CONECTORES_INFO.map((c) => (
                  <p key={c.conector} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{c.conector}</strong> — {c.es}. {c.uso}
                  </p>
                ))}
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoQuizCard
              quiz={QUIZ}
              accent={accent}
              rgba={color.rgba}
              aprobado={quizAprobado}
              onAprobado={() => setQuizAprobado(true)}
              playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
              mensajeAprobado="Ya distingues el fondo de la interrupción y sabes con qué anclar una narración pasada."
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={PASADO_VIAJE_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Marco teórico" icono="fa-layer-group">
                {MARCO.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>{p}</p>
                ))}
              </Bloque>
              <Bloque titulo={`Lectura A1 · ${LECTURA_A1_TITULO}`} icono="fa-book-open">
                {LECTURA_A1.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>{p}</p>
                ))}
                <p style={{ margin: 0, color: T.text3 }}>{NOTA_GRAMATICAL_A1}</p>
                <button type="button" className="psv-btn" onClick={() => hablarLab(LECTURA_A1[0] ?? "")}>
                  <i className="fa-solid fa-volume-high" /> Escuchar el primer párrafo
                </button>
              </Bloque>
              <Bloque titulo="Preguntas de comprensión" icono="fa-comments">
                {PREGUNTAS_A1.map((q, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{q.pregunta}</strong> {q.respuesta}
                  </p>
                ))}
                <p style={{ margin: 0, color: T.text3 }}>
                  <strong>¿Sabías?</strong> {DATO_A1}
                </p>
              </Bloque>
              <Bloque titulo="Tu turno" icono="fa-pen-nib">
                <p style={{ margin: 0, color: T.text, whiteSpace: "pre-line" }}>{TU_TURNO_A3.prompt}</p>
                <ul style={{ margin: 0, paddingLeft: 18, color: T.text2 }}>
                  {TU_TURNO_A3.pistas.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
                <p style={{ margin: 0, color: T.text3 }}>
                  Mínimo {TU_TURNO_A3.minimo} palabras. Se evalúa: {TU_TURNO_A3.criterios.join(" · ")}.
                </p>
              </Bloque>
              <Bloque titulo="Expresiones de tiempo" icono="fa-clock-rotate-left">
                {EXPRESIONES_TIEMPO.map((e) => (
                  <p key={e.en} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{e.en}</strong> — {e.es}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Glosario de la progresión" icono="fa-spell-check">
                {GLOSARIO_A5.map((g) => (
                  <p key={g.termino} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{g.termino}.</strong> {g.definicion} <em>{g.ejemplo}</em>
                  </p>
                ))}
                <p style={{ margin: 0, color: T.text3 }}>{CIERRE_A5}</p>
              </Bloque>
              <Bloque titulo="Autoevaluación y video" icono="fa-clipboard-check">
                <ul style={{ margin: 0, paddingLeft: 18, color: T.text2 }}>
                  {AUTOEVAL_A7.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
                <p style={{ margin: 0, color: T.text3 }}>{AUTOEVAL_A7_CIERRE}</p>
                <p style={{ margin: 0, color: T.text }}>
                  <strong>{VIDEO_A8.titulo}</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: 18, color: T.text2 }}>
                  {VIDEO_A8.preguntas.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_BILINGUE}</p>
              </Bloque>
              <Bloque titulo="Nota sobre el contenido" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text3 }}>
                  Son verbatim de la progresión IN-IV-P01: la lectura y su nota, las preguntas, el «¿Sabías?» (A1); los textos con huecos (A2 y A6); el encargo de
                  escritura (A3); el reto True/False (A4); el glosario (A5); la autoevaluación (A7) y el video (A8). Ilustrativos: los dieciséis verbos, las cinco
                  escenas, el itinerario a Teotihuacán, las rondas de intrusos y las oraciones que se escriben. Los lugares son reales; las personas (Sofía,
                  Emiliano, Abril, Tadeo, Beto) son ficticias. Desde 2020 el INAH no permite subir a las pirámides de Teotihuacán, por eso el relato recorre la
                  Calzada de los Muertos. Fuente: {FUENTE}
                </p>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Imagen con respaldo: gradiente + ícono detrás; si la imagen no existe, se oculta.
 * ═══════════════════════════════════════════════════════════════════════════ */
function Foto({ clave, icono, alt }: { clave: string; icono: string; alt: string }) {
  const [fallo, setFallo] = useState<string | null>(null);
  return (
    <div className="psv-foto">
      <i className={`fa-solid ${icono}`} aria-hidden />
      {fallo !== clave && <img key={clave} src={`${RUTA_FOTOS}/${clave}.webp`} alt={alt} loading="lazy" onError={() => setFallo(clave)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * La línea del tiempo: lo que el alumno elige se DIBUJA.
 *   past continuous = banda larga en marcha · past simple = golpe breve.
 * ═══════════════════════════════════════════════════════════════════════════ */
function LineaTiempo({
  accent,
  sujetoFondo,
  sujetoInter,
  fondo,
  inter,
}: {
  accent: string;
  sujetoFondo: string;
  sujetoInter: string;
  fondo: { forma: string; tipo: "cont" | "simple" } | null;
  inter: { forma: string; tipo: "cont" | "simple" } | null;
}) {
  const W = 640;
  const H = 190;
  const yBase = 130;
  const xIni = 40;
  const xFin = 600;
  const xCorte = 430;
  const fondoLargo = fondo?.tipo === "cont";
  const fondoBreve = fondo?.tipo === "simple";
  const interGolpe = inter?.tipo === "simple";
  const interLarga = inter?.tipo === "cont";

  return (
    <div className="psv-linea">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Línea del tiempo: la banda es una acción en marcha y el rayo, un hecho breve">
        <defs>
          <linearGradient id="psvBandaGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0.15" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <line x1={xIni - 18} y1={yBase + 26} x2={xFin + 12} y2={yBase + 26} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <polygon points={`${xFin + 12},${yBase + 26} ${xFin + 3},${yBase + 21} ${xFin + 3},${yBase + 31}`} fill="rgba(255,255,255,0.35)" />
        <text x={xIni - 18} y={yBase + 46} fill="rgba(255,255,255,0.55)" fontSize="14" fontFamily="system-ui, sans-serif">antes</text>
        <text x={xFin - 24} y={yBase + 46} fill="rgba(255,255,255,0.55)" fontSize="14" fontFamily="system-ui, sans-serif">ahora</text>

        {/* banda del fondo */}
        <rect x={xIni} y={yBase - 14} width={xFin - xIni} height={26} rx={13} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)" strokeDasharray="5 5" />
        {fondoLargo && <rect className="psv-banda" x={xIni} y={yBase - 14} width={xFin - xIni} height={26} rx={13} fill="url(#psvBandaGrad)" stroke={accent} strokeOpacity="0.6" />}
        {fondoBreve && <rect className="psv-banda" x={xIni} y={yBase - 14} width={46} height={26} rx={13} fill={NO} fillOpacity="0.7" stroke={NO} />}
        <text x={xIni + (fondoBreve ? 56 : 12)} y={yBase + 5} fill={fondo ? "#fff" : "rgba(255,255,255,0.5)"} fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">
          {fondo ? (fondoBreve ? `${sujetoFondo} ${fondo.forma}… ¡y ya se acabó!` : `${sujetoFondo} ${fondo.forma}…`) : "fondo: ¿qué ya estaba pasando?"}
        </text>

        {/* interrupción */}
        {interGolpe && (
          <>
            <line x1={xCorte} y1={yBase - 44} x2={xCorte} y2={yBase + 26} stroke="#FBBF24" strokeWidth="2.5" />
            <g className="psv-rayo" transform={`translate(${xCorte - 11}, ${yBase - 82})`}>
              <path d="M14 0 L2 20 L11 20 L6 36 L20 14 L11 14 Z" fill="#FBBF24" stroke="#FDE68A" strokeWidth="1" />
            </g>
          </>
        )}
        {interLarga && <rect className="psv-banda" x={xCorte - 140} y={yBase - 54} width={xFin - xCorte + 140} height={22} rx={11} fill="#FBBF24" fillOpacity="0.35" stroke="#FBBF24" />}
        {!inter && <line x1={xCorte} y1={yBase - 44} x2={xCorte} y2={yBase + 26} stroke="rgba(255,255,255,0.16)" strokeWidth="2" strokeDasharray="4 4" />}
        <text x={interLarga ? xCorte - 130 : xCorte + 20} y={interLarga ? yBase - 38 : yBase - 56} fill={inter ? "#FDE68A" : "rgba(255,255,255,0.5)"} fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif">
          {inter ? (interLarga ? `${sujetoInter} ${inter.forma}… (¿y qué corta qué?)` : `…${sujetoInter} ${inter.forma}`) : "interrupción: ¿qué ocurrió de golpe?"}
        </text>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * La ruta de la excursión: el autobús avanza parada por parada.
 * ═══════════════════════════════════════════════════════════════════════════ */
function Ruta({ avance, accent }: { avance: string[]; accent: string }) {
  const n = RELATO.length;
  const xs = RELATO.map((_, i) => 50 + (i * 540) / (n - 1));
  const ys = RELATO.map((_, i) => (i % 2 === 0 ? 70 : 38));
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const tramo = Math.min(avance.length, n);
  const dRecorrido = xs.slice(0, Math.max(tramo, 1)).map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const bx = xs[Math.max(tramo - 1, 0)] ?? 50;
  const by = ys[Math.max(tramo - 1, 0)] ?? 70;
  return (
    <div className="psv-linea">
      <svg viewBox="0 0 640 110" style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={`Ruta del viaje: el autobús va en la parada ${tramo} de ${n}`}>
        <path d={d} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="5" strokeDasharray="2 9" strokeLinecap="round" />
        {tramo > 1 && <path d={dRecorrido} fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />}
        {RELATO.map((m, i) => (
          <g key={m.id}>
            <circle cx={xs[i]} cy={ys[i]} r={14} fill={avance.includes(m.id) ? accent : "rgba(255,255,255,0.08)"} stroke={avance.includes(m.id) ? "#fff" : "rgba(255,255,255,0.3)"} strokeWidth="1.5" />
            <text x={xs[i]} y={(ys[i] ?? 0) + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={avance.includes(m.id) ? "#04121f" : "rgba(255,255,255,0.7)"} fontFamily="system-ui, sans-serif">
              {i + 1}
            </text>
          </g>
        ))}
        <g style={{ transform: `translate(${bx - 17}px, ${by - 40}px)`, transition: "transform .6s cubic-bezier(.4,0,.2,1)" }}>
          <rect width="34" height="20" rx="5" fill="#FBBF24" stroke="#FDE68A" />
          <rect x="4" y="4" width="8" height="7" rx="1.5" fill="#04121f" opacity="0.7" />
          <rect x="15" y="4" width="8" height="7" rx="1.5" fill="#04121f" opacity="0.7" />
          <circle cx="9" cy="21" r="4" fill="#04121f" stroke="#FDE68A" />
          <circle cx="25" cy="21" r="4" fill="#04121f" stroke="#FDE68A" />
        </g>
      </svg>
    </div>
  );
}

const css = (accent: string, rgba: string) => `
  @keyframes psvShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-3px);} 80%{transform:translateX(3px);} }
  @keyframes psvBanda { 0%{opacity:0;} 100%{opacity:1;} }
  @keyframes psvRayo { 0%,100%{opacity:.95;} 50%{opacity:.35;} }
  .psv-instr { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; font-size:15px; font-weight:800; color:${T.text}; }
  .psv-nota { font-size:14px; color:${T.text3}; line-height:1.5; }
  .psv-ok { display:flex; align-items:center; gap:12px; font-size:15px; color:${OK}; font-weight:800; padding:12px 14px; border-radius:13px; border:1.5px solid ${OK}55; background:${OK}10; }
  .psv-aviso { display:flex; gap:11px; font-size:14.5px; line-height:1.5; color:${T.text2}; border-radius:12px; padding:12px 14px; border:1px solid ${NO}55; background:${NO}0e; }
  .psv-aviso[data-ok="true"] { border-color:${OK}55; background:${OK}0e; }
  .psv-aviso i { margin-top:3px; }
  .psv-banda { animation:psvBanda .5s ease-out; }
  .psv-rayo { animation:psvRayo 1.4s ease-in-out infinite; }
  .psv-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 15px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; font-family:inherit; transition:all .14s; }
  .psv-btn:hover { border-color:${T.lineStrong}; }
  .psv-pills { display:flex; gap:8px; flex-wrap:wrap; }
  .psv-pill { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:9px 14px; border-radius:10px; border:1px solid ${T.line};
    background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; font-family:inherit; transition:all .14s; }
  .psv-pill:hover { border-color:${T.lineStrong}; color:#fff; }
  .psv-pill[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); color:#fff; }
  .psv-pill[data-done="true"] { color:${OK}; border-color:${OK}66; }
  .psv-chip { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:10px 15px; border-radius:999px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:#fff; font-size:15px; font-weight:800; font-family:inherit; transition:all .14s; max-width:100%; }
  .psv-chip:hover:not(:disabled) { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
  .psv-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
  .psv-chip:disabled { cursor:default; opacity:.8; }
  .psv-fichas { display:flex; flex-wrap:wrap; gap:9px; margin-top:8px; }
  .psv-foto { position:relative; width:100%; aspect-ratio:16/9; max-height:200px; border-radius:14px; overflow:hidden; border:1px solid ${T.line};
    background:linear-gradient(135deg, rgba(${rgba},0.25) 0%, rgba(8,22,44,0.95) 100%); display:flex; align-items:center; justify-content:center; }
  .psv-foto i { font-size:44px; color:rgba(255,255,255,0.28); }
  .psv-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; }
  .psv-escena { display:flex; flex-direction:column; gap:8px; }
  .psv-escena-txt { display:flex; flex-direction:column; gap:3px; font-size:14.5px; color:${T.text2}; line-height:1.45; }
  .psv-escena-txt strong { color:#fff; font-size:15px; }
  .psv-linea { border-radius:16px; border:1px solid ${T.line}; background:linear-gradient(180deg,rgba(8,22,44,0.85) 0%,rgba(3,11,25,0.9) 100%); padding:8px 6px; }
  .psv-dos { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap:12px; }
  .psv-zona { border-radius:13px; border:1.5px solid ${T.line}; background:${T.inset}; padding:12px 14px; display:flex; flex-direction:column; gap:6px; }
  .psv-zona[data-done="true"] { border-color:${OK}66; background:${OK}10; }
  .psv-zona-tit { font-size:14px; font-weight:900; display:flex; align-items:center; gap:8px; }
  .psv-zona-frase { font-size:15px; color:#fff; font-weight:700; line-height:1.5; }
  .psv-hueco { padding:0 6px; border-bottom:2px solid ${T.lineStrong}; color:${T.text2}; }
  .psv-hueco[data-ok="true"] { color:${OK}; border-bottom-color:${OK}; }
  .psv-frase { cursor:pointer; width:100%; text-align:left; border-radius:11px; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text};
    font-size:15px; font-weight:600; padding:12px 14px; font-family:inherit; line-height:1.45; transition:all .14s; }
  .psv-frase:hover:not(:disabled) { border-color:${accent}; background:rgba(${rgba},0.12); }
  .psv-frase:disabled { cursor:default; }
  .psv-frase[data-e="bien"] { border-color:${OK}; background:${OK}18; }
  .psv-frase[data-e="mal"] { border-color:${NO}66; background:${NO}10; }
  .psv-cartas { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap:10px; margin-top:10px; }
  .psv-carta { cursor:pointer; text-align:left; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text};
    font-size:15px; font-weight:600; padding:12px 14px; font-family:inherit; line-height:1.45; transition:all .14s; }
  .psv-carta:hover { border-color:${accent}; background:rgba(${rgba},0.12); }
  .psv-contado { font-size:15px; line-height:1.6; color:${T.text2}; padding:12px 14px; border-radius:13px; border:1px dashed ${T.lineStrong}; background:${T.inset}; }
  .psv-ronda { display:flex; flex-direction:column; gap:8px; border-radius:14px; border:1px solid ${T.line}; background:${T.glass}; padding:14px; }
  .psv-ronda[data-done="true"] { border-color:${OK}55; background:${OK}0a; }
  .psv-maq { display:grid; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr); gap:10px; align-items:center; }
  .psv-maq-verbo, .psv-maq-salida { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; min-height:110px; padding:12px; border-radius:16px;
    border:1.5px solid ${T.line}; background:${T.glass}; text-align:center; overflow-wrap:anywhere; }
  .psv-maq-verbo strong, .psv-maq-salida strong, .psv-maq-salida s { font-size:30px; color:#fff; font-weight:900; line-height:1.1; }
  .psv-maq-salida s { color:${NO}; }
  .psv-maq-es, .psv-maq-salida small { font-size:14px; color:${T.text3}; }
  .psv-maq-salida[data-estado="mal"] { border-color:${NO}77; background:${NO}10; animation:psvShake .42s; }
  .psv-maq-salida[data-estado="bien"] { border-color:${OK}77; background:${OK}10; }
  .psv-maq-flecha { font-size:26px; color:${accent}; }
  .psv-reglas { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 140px), 1fr)); gap:10px; }
  .psv-regla { cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; padding:12px 8px; border-radius:14px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:#fff; font-size:15px; font-weight:800; font-family:inherit; text-align:center; transition:all .14s; }
  .psv-regla i { font-size:20px; }
  .psv-regla em { font-style:normal; font-size:14px; color:${T.text3}; font-weight:600; }
  .psv-regla:hover { border-color:${accent}; transform:translateY(-2px); }
  .psv-historial { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:10px; }
  .psv-hist-col { display:flex; flex-direction:column; gap:6px; padding:10px 12px; border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; font-size:14px; }
  .psv-hist-col[data-full="true"] { border-style:solid; border-color:${OK}55; background:${OK}0c; }
  .psv-forma { font-size:14px; color:#fff; font-weight:700; }
  .psv-item { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:13px 15px; }
  .psv-item[data-e="bien"] { border-color:${OK}55; background:${OK}0c; }
  .psv-item[data-e="mal"] { border-color:${NO}55; }
  .psv-item-frase { display:flex; align-items:baseline; gap:9px; flex-wrap:wrap; font-size:15px; line-height:2; color:${T.text2}; }
  .psv-in { border-radius:9px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:15px; font-weight:700; padding:6px 11px;
    font-family:inherit; outline:none; width:min(100%, 170px); }
  .psv-in:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${rgba},0.18); }
  .psv-in[data-e="bien"] { border-color:${OK}; background:${OK}1a; color:${OK}; }
  .psv-in[data-e="mal"] { border-color:${NO}; background:${NO}14; }
  .psv-chip:focus-visible, .psv-regla:focus-visible, .psv-carta:focus-visible, .psv-frase:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  @media (max-width: 520px){ .psv-maq { grid-template-columns:minmax(0,1fr); } .psv-maq-flecha { transform:rotate(90deg); justify-self:center; } }
  @media (prefers-reduced-motion: reduce){ .psv-maq-salida[data-estado="mal"], .psv-banda, .psv-rayo { animation:none; } .psv-regla:hover { transform:none; } }
`;
