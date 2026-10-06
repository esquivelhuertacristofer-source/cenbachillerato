"use client";
// Ancla en el plan de estudios: IN-IV-P03-A1 (progresión IN-IV-P03).

/**
 * Laboratorio — Habits with reasons: «A week in Maple Falls».
 * Práctica para IN-IV-P03 (Inglés IV): «Describe rutinas y hábitos con
 * conciencia del contexto (explica lo que se hace y por qué, en la escuela, la
 * casa o la comunidad)».
 *
 * EL EXPERIMENTO: Lucía (ficticia, 16 años, de Puebla) llega de intercambio a
 * Maple Falls (pueblo ficticio) con sus hábitos de siempre. La misma agenda que
 * en Puebla dejaba sus cuatro medidores en verde, allá los hunde: el autobús
 * pasa a las 7:00, nieva, la familia anfitriona cena a las 6 p.m. y sus amigos
 * de Puebla chatean una hora «más temprano». El alumno cambia el contexto, ve
 * la consecuencia y reorganiza la semana día por día.
 *
 * Después EXPLICA: arma «On school days, I usually take the school bus because
 * the school is 5 km away.» y el modelo contrasta la oración con la agenda (la
 * frecuencia), con la gramática (posición del adverbio; because / due to / in
 * order to / so that según la forma de la razón) y con el contexto (¿es verdad
 * aquí?). La mamá anfitriona reacciona y la retroalimentación dice POR QUÉ.
 *
 * Modos: «My week» (simulador) · «Explain why» (constructor evaluado) ·
 * «Escribe el término» (glosario A1) · «Complete the text» (A2 y A6) + Reto
 * (V/F A4 y preguntas cerradas A8). La teoría verbatim vive en «Teoría».
 *
 * DOM puro (sin three.js). Las cifras de los medidores son una simulación.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Dato, Deslizador } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino, type ParTermino } from "./_mecanica-termino";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { HABITOS_CONTEXTO_FICHA } from "./habitos-contexto-ficha";
import { HABITOS_CONTEXTO_TEXTOS } from "./habitos-contexto-huecos";
import {
  GLOSARIO_A1,
  GLOSARIO_A5,
  ACTIVIDAD_FINAL_A1,
  ACTIVIDAD_FINAL_A5,
  AUTOEVALUACION_A3,
  AUTOEVALUACION_A7,
  REFLEXION_A3,
  REFLEXION_A7,
  VIDEO_A8,
  PROGRESION_TITULO,
  QUIZ_HABITOS,
} from "./habitos-contexto-data";
import {
  ADVERBIOS,
  CONECTORES,
  CONTEXTOS,
  DIAS,
  DIAS_DOMINIO,
  DOMINIO_TXT,
  FRASES,
  HABITO,
  HABITOS,
  MEDIDORES,
  META,
  armarOracion,
  cuenta,
  diagnosticar,
  enVerde,
  esProposito,
  evaluar,
  medidores,
  planInicial,
  repartir,
  totalDias,
  type Adverbio,
  type Conector,
  type ContextoId,
  type Eleccion,
  type Evaluacion,
  type FraseId,
  type HabitoId,
  type MedidorId,
  type Plan,
  type Posicion,
} from "./habitos-contexto-sim";

const NO = "#FF5E5E";
const AMBAR = "#FBBF24";
const RETO_KEY = "cen-habitos-contexto-ingles-reto";
const RUTA_FOTOS = "/media/labs-sim/habitos-contexto-ingles";

type Modo = "semana" | "explica" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "semana", label: "My week", icono: "fa-calendar-week" },
  { id: "explica", label: "Explain why", icono: "fa-comment-dots" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Complete the text", icono: "fa-pen-to-square" },
];

/** Tapa el término dentro de su propio ejemplo: si no, el ejemplo regala la respuesta. */
function tapar(ejemplo: string, termino: string): string {
  const re = new RegExp(termino.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return ejemplo.replace(re, "___");
}

/** Glosario A1 para escribir (sin «have breakfast / lunch / dinner»: teclear tres comidas no evalúa nada). */
const PARES_GLOSARIO: ParTermino[] = GLOSARIO_A1.filter((t) => t.id !== "have-meals").map((t) => ({
  id: t.id,
  termino: t.termino,
  definicion: t.definicion,
  ejemplo: tapar(t.ejemplo, t.termino),
}));

interface Carta {
  eleccion: Eleccion;
  ctx: ContextoId;
}

const contar = (...xs: boolean[]) => xs.filter(Boolean).length;

export function LabHabitosContextoIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("semana");

  // ── sonido y partida ──────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(() => () => audioRef.current?.dispose(), []);
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
  // Todo acierto y todo fallo del laboratorio pasa por aquí: la partida se lleva en un solo punto.
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };
  const sfxBlip = () => sonido && audioRef.current?.blip();

  // ── estrellas ─────────────────────────────────────────────────────────
  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const registrar = (s: boolean, e: boolean, g: boolean, t: boolean) => registraEstrellas(partida.estrellasCon(contar(s, e, g, t), 4));

  // ── simulador: la semana ──────────────────────────────────────────────
  const [ctx, setCtx] = useState<ContextoId>("maple");
  const [plan, setPlan] = useState<Plan>(planInicial);
  const [vistos, setVistos] = useState<ContextoId[]>(["maple"]);
  const [verdeLogrado, setVerdeLogrado] = useState(false);
  const [selHabito, setSelHabito] = useState<HabitoId>("chat");

  const valores = medidores(plan, ctx);
  const verdes = enVerde(valores);
  const vioAmbos = vistos.includes("puebla") && vistos.includes("maple");

  const revisarVerde = (p: Plan, c: ContextoId) => {
    if (c !== "maple" || verdeLogrado) return;
    if (enVerde(medidores(p, "maple")) === MEDIDORES.length) {
      setVerdeLogrado(true);
      sfxOk();
      registrar(true, explicaDone, glosarioDone, textoDone);
    }
  };
  const cambiarPlan = (p: Plan) => {
    setPlan(p);
    revisarVerde(p, ctx);
  };
  const alternarDia = (h: HabitoId, d: number) => {
    if (!DIAS_DOMINIO[HABITO[h].dominio].includes(d)) return;
    setSelHabito(h);
    sfxBlip();
    cambiarPlan({ ...plan, [h]: plan[h].map((v, i) => (i === d ? !v : v)) });
  };
  const fijarCuenta = (h: HabitoId, n: number) => {
    setSelHabito(h);
    cambiarPlan({ ...plan, [h]: repartir(HABITO[h].dominio, n) });
  };
  const cambiarCtx = (c: ContextoId) => {
    setCtx(c);
    setVistos((v) => (v.includes(c) ? v : [...v, c]));
    sfxBlip();
    revisarVerde(plan, c);
  };
  const resetSemana = () => {
    setPlan(planInicial());
    setSelHabito("chat");
  };

  // ── explicar: oraciones evaluadas contra la agenda ────────────────────
  const [cartas, setCartas] = useState<Partial<Record<HabitoId, Carta>>>({});
  const [explicados, setExplicados] = useState<HabitoId[]>([]);
  const [propositoOk, setPropositoOk] = useState(false);
  const [explicaIntento, setExplicaIntento] = useState(0);
  const explicaDone = explicados.length >= 3;

  const enviarExplicacion = (e: Eleccion, ev: Evaluacion) => {
    if (!ev.ok) {
      sfxNo();
      return;
    }
    sfxPlace();
    setCartas((c) => ({ ...c, [e.habito]: { eleccion: e, ctx } }));
    if (esProposito(e.conector)) setPropositoOk(true);
    if (!explicados.includes(e.habito)) {
      const nuevos = [...explicados, e.habito];
      setExplicados(nuevos);
      if (nuevos.length === 3) {
        sfxOk();
        registrar(verdeLogrado, true, glosarioDone, textoDone);
      }
    }
  };
  const resetExplica = () => {
    setCartas({});
    setExplicaIntento((n) => n + 1);
  };

  // ── escribe el término (glosario A1) ──────────────────────────────────
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  // ── complete the text (A2 y A6) ───────────────────────────────────────
  const [textoSel, setTextoSel] = useState(0);
  const [textosHechos, setTextosHechos] = useState<number[]>([]);
  const [textoIntento, setTextoIntento] = useState(0);
  const textoDone = textosHechos.length >= HABITOS_CONTEXTO_TEXTOS.length;
  const resetTexto = () => {
    setTextosHechos([]);
    setTextoIntento((n) => n + 1);
  };
  const completarTexto = (i: number) => {
    if (textosHechos.includes(i)) return;
    const nuevos = [...textosHechos, i];
    setTextosHechos(nuevos);
    sfxOk();
    if (nuevos.length >= HABITOS_CONTEXTO_TEXTOS.length) registrar(verdeLogrado, explicaDone, glosarioDone, true);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso ──────────────────────────────────────────────────────────
  const modosHechos = (verdeLogrado ? 1 : 0) + (explicaDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  const estrellas = partida.estrellasCon(modosHechos, 4);
  const bestEstrellas = Math.max(estrellas, mejor);

  const objetivos = [
    { txt: "Compara la misma semana de Lucía en Puebla y en Maple Falls", done: vioAmbos, modo: "semana" },
    { txt: "Reorganiza la agenda: los 4 medidores en verde en Maple Falls", done: verdeLogrado, modo: "semana" },
    { txt: "Explica 3 hábitos con la frecuencia y la razón que muestra la agenda", done: explicaDone, modo: "explica" },
    { txt: "Explica un propósito con «so that» o «in order to»", done: propositoOk, modo: "explica" },
    { txt: `Escribe los ${PARES_GLOSARIO.length} términos del glosario`, done: glosarioDone, modo: "glosario" },
    { txt: "Completa los dos textos (Valentina y My school day)", done: textoDone, modo: "texto" },
    { txt: "Consigue 3★ (los cuatro modos con 2 errores o menos)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el reto «True or False»", done: quizAprobado },
  ];

  const resetActual = modo === "semana" ? resetSemana : modo === "explica" ? resetExplica : modo === "glosario" ? resetGlosario : resetTexto;

  const c = CONTEXTOS[ctx];
  const lectura =
    modo === "semana"
      ? `${c.nombre}: ${verdes}/4 medidores en verde`
      : modo === "explica"
        ? `${explicados.length}/3 hábitos explicados a ${c.oyente}`
        : modo === "glosario"
          ? `Glosario: ${glosarioDone ? "completo" : "escribe cada término"}`
          : `Textos completos: ${textosHechos.length}/2`;

  const pistaDe: Record<Modo, string> = {
    semana:
      "Cambia el contexto sin mover nada y mira los medidores: el mismo hábito cuesta distinto en otro lugar. Luego toca los días de la agenda (o usa los deslizadores) hasta dejar los cuatro en verde.",
    explica:
      "Lee la frecuencia en la agenda (cuántos días de cuántos) antes de elegir el adverbio. Después mira la FORMA de la razón: oración completa → because; sustantivo → due to; verbo base → in order to; «I can…» → so that.",
    glosario: "Lee la definición y el ejemplo (con el término tapado) y escribe el término en inglés.",
    texto: "Dos párrafos verbatim de la progresión: escribe la palabra que falta en cada hueco. Usa «Pista» si te atoras.",
  };

  const escena = (
    <div className="hc" style={{ display: "grid", gap: 14, minWidth: 0, color: T.text }}>
      <style>{css(accent, color.rgba)}</style>

      {modo === "semana" && (
        <SemanaPanel
          accent={accent}
          ctx={ctx}
          plan={plan}
          valores={valores}
          selHabito={selHabito}
          onCtx={cambiarCtx}
          onDia={alternarDia}
          onCuenta={fijarCuenta}
          onSel={setSelHabito}
          onReset={resetSemana}
        />
      )}

      {modo === "explica" && (
        <Explicador
          key={explicaIntento}
          accent={accent}
          rgba={color.rgba}
          ctx={ctx}
          plan={plan}
          cartas={cartas}
          onCtx={cambiarCtx}
          onEnviar={enviarExplicacion}
        />
      )}

      {modo === "glosario" && (
        <EscribeTermino
          key={glosIntento}
          pares={PARES_GLOSARIO}
          accent={accent}
          rgba={color.rgba}
          completado={glosarioDone}
          instrucciones="Lee la definición y el ejemplo, y escribe el término del glosario de rutinas y hábitos."
          onCompletado={() => {
            setGlosarioDone(true);
            sfxOk();
            registrar(verdeLogrado, explicaDone, true, textoDone);
          }}
          onAcierto={sfxPlace}
          onError={sfxNo}
        />
      )}

      {modo === "texto" && (
        <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {HABITOS_CONTEXTO_TEXTOS.map((t, i) => (
              <button key={t.id} type="button" className="hc-chip" data-sel={textoSel === i} onClick={() => setTextoSel(i)}>
                {textosHechos.includes(i) && <i className="fa-solid fa-circle-check" aria-hidden style={{ color: OK }} />}
                {t.etiqueta}
              </button>
            ))}
          </div>
          <CompletaTexto
            key={`${textoSel}-${textoIntento}`}
            data={HABITOS_CONTEXTO_TEXTOS[textoSel]!.data}
            accent={accent}
            rgba={color.rgba}
            completado={textosHechos.includes(textoSel)}
            onCompletado={() => completarTexto(textoSel)}
            onAcierto={sfxPlace}
            onError={sfxNo}
          />
        </div>
      )}
    </div>
  );

  return (
    <LabShell
      dom
      accent={accent}
      rgba={color.rgba}
      escena={escena}
      modos={{ opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.label, icono: m.icono })), valor: modo, cambiar: (id) => setModo(id as Modo) }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar este modo" onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      retoKey={RETO_KEY}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" aria-hidden style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "You can explain your habits in context!" : "Cada modo terminado vale 1★; los cuatro con 2 errores o menos dan la tercera."}
                  </span>
                </div>
              </Bloque>
              <Bloque titulo={`Días por hábito · ${c.nombre}`} icono="fa-calendar-week">
                {HABITOS.map((h) => {
                  const n = cuenta(plan, h);
                  return (
                    <Deslizador
                      key={h.id}
                      label={h.etiqueta}
                      icon={h.icono}
                      colr={h.color}
                      valor={`${n}/${totalDias(h)}`}
                      min={0}
                      max={totalDias(h)}
                      step={1}
                      value={n}
                      onChange={(v) => fijarCuenta(h.id, v)}
                      hintL="0"
                      hintR={DOMINIO_TXT[h.dominio]}
                    />
                  );
                })}
              </Bloque>
              <Bloque titulo="Medidores (simulación)" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  {MEDIDORES.map((m) => (
                    <Dato key={m.id} label={m.etiqueta} value={`${valores[m.id]}`} col={valores[m.id] >= META ? OK : valores[m.id] >= 40 ? AMBAR : NO} />
                  ))}
                </div>
              </Bloque>
              <Bloque titulo={`Cómo es la vida en ${c.nombre}`} icono={c.icono}>
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6, fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                  {c.hechos.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <p style={{ margin: 0, fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{pistaDe[modo]}</p>
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
              quiz={QUIZ_HABITOS}
              accent={accent}
              rgba={color.rgba}
              aprobado={quizAprobado}
              onAprobado={() => setQuizAprobado(true)}
              playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
              mensajeAprobado="¡Aprobado! Sabes describir hábitos con su porqué y su contexto."
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: <Teoria accent={accent} rgba={color.rgba} />,
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas visuales
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Imagen con respaldo: si el archivo aún no existe se oculta y queda el degradado + ícono. */
function FotoSim({ clave, icono, color, alto, children }: { clave: string; icono: string; color: string; alto: number; children?: ReactNode }) {
  const [fallo, setFallo] = useState(false);
  return (
    <div className="hc-foto" style={{ height: alto, background: `linear-gradient(135deg, ${color}55, #0b2233)` }}>
      <i className={`fa-solid ${icono}`} aria-hidden style={{ fontSize: Math.round(alto / 3), color: `${color}bb` }} />
      {!fallo && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} />}
      {children}
    </div>
  );
}

function SelectorContexto({ ctx, onCtx }: { ctx: ContextoId; onCtx: (c: ContextoId) => void }) {
  return (
    <div className="hc-ctx" role="radiogroup" aria-label="Contexto">
      {(["puebla", "maple"] as ContextoId[]).map((id) => {
        const k = CONTEXTOS[id];
        return (
          <button key={id} type="button" role="radio" aria-checked={ctx === id} className="hc-ctx-op" data-on={ctx === id} onClick={() => onCtx(id)}>
            <i className={`fa-solid ${k.icono}`} aria-hidden />
            <span>
              <strong>{k.nombre}</strong>
              <small>{k.sub}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function caraDe(valores: Record<MedidorId, number>): { icono: string; color: string; texto: string } {
  const peor = Math.min(...MEDIDORES.map((m) => valores[m.id]));
  if (peor >= META) return { icono: "fa-face-smile-beam", color: OK, texto: "Lucía feels great this week" };
  if (peor >= 40) return { icono: "fa-face-meh", color: AMBAR, texto: "Lucía is getting by" };
  return { icono: "fa-face-tired", color: NO, texto: "Lucía is having a hard week" };
}

function Medidores({ valores }: { valores: Record<MedidorId, number> }) {
  return (
    <div className="hc-medidores">
      {MEDIDORES.map((m) => {
        const v = valores[m.id];
        const col = v >= META ? OK : v >= 40 ? AMBAR : NO;
        return (
          <div key={m.id} className="hc-medidor" data-ok={v >= META}>
            <div className="hc-medidor-top">
              <span>
                <i className={`fa-solid ${m.icono}`} aria-hidden style={{ color: m.color }} /> {m.etiqueta}
              </span>
              <strong style={{ color: col }}>{v}</strong>
            </div>
            <div className="hc-barra" aria-hidden>
              <div style={{ width: `${v}%`, background: col }} />
              <span className="hc-umbral" style={{ left: `${META}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** La agenda de la semana: filas = hábitos, columnas = días. Editable en «My week». */
function Agenda({
  plan,
  sel,
  onDia,
  onSel,
}: {
  plan: Plan;
  sel: HabitoId | null;
  onDia?: (h: HabitoId, d: number) => void;
  onSel?: (h: HabitoId) => void;
}) {
  return (
    <div className="hc-agenda" role="grid" aria-label="Agenda de la semana">
      <div className="hc-ag-fila hc-ag-cab" role="row">
        <span />
        {DIAS.map((d, i) => (
          <span key={d} className="hc-ag-dia" data-finde={i >= 5} role="columnheader">
            {d}
          </span>
        ))}
      </div>
      {HABITOS.map((h) => {
        const dominio = DIAS_DOMINIO[h.dominio];
        return (
          <div key={h.id} className="hc-ag-fila" role="row" data-sel={sel === h.id} style={{ ["--hcc" as string]: h.color }}>
            {onSel ? (
              <button type="button" className="hc-ag-hab" onClick={() => onSel(h.id)} title={h.etiqueta}>
                <i className={`fa-solid ${h.icono}`} aria-hidden />
                <span className="hc-ag-txt">{h.etiqueta}</span>
              </button>
            ) : (
              <span className="hc-ag-hab" title={h.etiqueta}>
                <i className={`fa-solid ${h.icono}`} aria-hidden />
                <span className="hc-ag-txt">{h.etiqueta}</span>
              </span>
            )}
            {DIAS.map((d, i) => {
              const activo = plan[h.id][i] === true;
              if (!dominio.includes(i)) return <span key={d} className="hc-ag-celda" data-fuera="true" aria-hidden />;
              return onDia ? (
                <button
                  key={d}
                  type="button"
                  className="hc-ag-celda"
                  data-on={activo}
                  aria-pressed={activo}
                  aria-label={`${h.etiqueta}, ${d}`}
                  onClick={() => onDia(h.id, i)}
                >
                  {activo && <i className={`fa-solid ${h.icono}`} aria-hidden />}
                </button>
              ) : (
                <span key={d} className="hc-ag-celda" data-on={activo}>
                  {activo && <i className={`fa-solid ${h.icono}`} aria-hidden />}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo «My week»
 * ═══════════════════════════════════════════════════════════════════════════ */
function SemanaPanel({
  accent,
  ctx,
  plan,
  valores,
  selHabito,
  onCtx,
  onDia,
  onCuenta,
  onSel,
  onReset,
}: {
  accent: string;
  ctx: ContextoId;
  plan: Plan;
  valores: Record<MedidorId, number>;
  selHabito: HabitoId;
  onCtx: (c: ContextoId) => void;
  onDia: (h: HabitoId, d: number) => void;
  onCuenta: (h: HabitoId, n: number) => void;
  onSel: (h: HabitoId) => void;
  onReset: () => void;
}) {
  const c = CONTEXTOS[ctx];
  const cara = caraDe(valores);
  const h = HABITO[selHabito];
  const n = cuenta(plan, h);
  const total = totalDias(h);
  const diag = diagnosticar(plan, ctx);
  return (
    <>
      <SelectorContexto ctx={ctx} onCtx={onCtx} />

      <FotoSim key={c.foto} clave={c.foto} icono={c.icono} color={accent} alto={130}>
        <div className="hc-foto-pie">
          <i className={`fa-solid ${cara.icono}`} aria-hidden style={{ color: cara.color, fontSize: 30 }} />
          <span>
            <strong>{cara.texto}</strong>
            <small>
              Lucía en {c.nombre} · {c.sub.toLowerCase()}
            </small>
          </span>
        </div>
      </FotoSim>

      <Medidores valores={valores} />

      <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div className="hc-ceja">Agenda de Lucía — toca un día para quitar o poner el hábito</div>
          <button type="button" className="hc-btn" onClick={onReset}>
            <i className="fa-solid fa-house" aria-hidden /> Volver a sus hábitos de Puebla
          </button>
        </div>
        <Agenda plan={plan} sel={selHabito} onDia={onDia} onSel={onSel} />
      </div>

      <div className="hc-detalle" style={{ ["--hcc" as string]: h.color }}>
        <FotoSim key={h.foto} clave={h.foto} icono={h.icono} color={h.color} alto={96} />
        <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <strong style={{ fontSize: 16 }}>
              <i className={`fa-solid ${h.icono}`} aria-hidden style={{ color: h.color, marginRight: 8 }} />
              {h.etiqueta}
            </strong>
            <span className="hc-paso-n">
              <button type="button" className="hc-mini" aria-label="Un día menos" disabled={n <= 0} onClick={() => onCuenta(h.id, n - 1)}>
                <i className="fa-solid fa-minus" aria-hidden />
              </button>
              <span>
                {n}/{total} {DOMINIO_TXT[h.dominio]}
              </span>
              <button type="button" className="hc-mini" aria-label="Un día más" disabled={n >= total} onClick={() => onCuenta(h.id, n + 1)}>
                <i className="fa-solid fa-plus" aria-hidden />
              </button>
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {MEDIDORES.filter((m) => h.efecto[ctx][m.id] !== undefined).map((m) => {
              const e = h.efecto[ctx][m.id]!;
              return (
                <span key={m.id} className="hc-efecto" data-signo={e > 0 ? "mas" : "menos"}>
                  <i className={`fa-solid ${m.icono}`} aria-hidden /> {m.etiqueta} {e > 0 ? `+${e}` : e} por día
                </span>
              );
            })}
          </div>
          <p style={{ margin: 0, fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
            <strong style={{ color: T.text }}>En {c.nombre}: </strong>
            {h.motivo[ctx]}
          </p>
        </div>
      </div>

      {diag.length > 0 ? (
        <div className="hc-diag" role="status">
          <div className="hc-ceja">Por qué hay medidores en rojo</div>
          {diag.map((d) => (
            <button key={d.medidor} type="button" className="hc-diag-fila" onClick={() => onSel(d.habito)}>
              <i className={`fa-solid ${d.sentido === "menos" ? "fa-arrow-down" : "fa-arrow-up"}`} aria-hidden style={{ color: d.sentido === "menos" ? NO : OK }} />
              <span>{d.texto}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="hc-diag" data-ok="true" role="status">
          <span style={{ fontSize: 15, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" aria-hidden /> Los cuatro medidores están en verde en {c.nombre}.
          </span>
          <span style={{ fontSize: 14, color: T.text2 }}>Ahora ve a «Explain why» y explica en inglés por qué Lucía hace lo que hace.</span>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo «Explain why»
 * ═══════════════════════════════════════════════════════════════════════════ */
function Explicador({
  accent,
  rgba,
  ctx,
  plan,
  cartas,
  onCtx,
  onEnviar,
}: {
  accent: string;
  rgba: string;
  ctx: ContextoId;
  plan: Plan;
  cartas: Partial<Record<HabitoId, Carta>>;
  onCtx: (c: ContextoId) => void;
  onEnviar: (e: Eleccion, ev: Evaluacion) => void;
}) {
  const [habito, setHabito] = useState<HabitoId>("cena");
  const [frase, setFrase] = useState<FraseId | null>(null);
  const [adverbio, setAdverbio] = useState<Adverbio | null>(null);
  const [posicion, setPosicion] = useState<Posicion>("antes");
  const [conector, setConector] = useState<Conector | null>(null);
  const [razon, setRazon] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Evaluacion | null>(null);

  const c = CONTEXTOS[ctx];
  const h = HABITO[habito];
  const eleccion: Eleccion | null =
    frase !== null && adverbio !== null && conector !== null && razon !== null ? { habito, frase, adverbio, posicion, conector, razon } : null;
  const advVista = adverbio ?? "___";

  const elegirHabito = (id: HabitoId) => {
    setHabito(id);
    setRazon(null);
    setResultado(null);
  };
  const decir = () => {
    if (!eleccion) return;
    const ev = evaluar(eleccion, plan, ctx);
    setResultado(ev);
    onEnviar(eleccion, ev);
  };

  const animoInfo = resultado
    ? resultado.animo === "bien"
      ? { icono: "fa-face-smile-beam", color: OK }
      : resultado.animo === "duda"
        ? { icono: "fa-face-rolling-eyes", color: AMBAR }
        : { icono: "fa-face-dizzy", color: NO }
    : { icono: "fa-face-smile", color: T.text2 };

  const cartasLista = HABITOS.filter((x) => cartas[x.id]).map((x) => cartas[x.id]!);

  return (
    <>
      <SelectorContexto ctx={ctx} onCtx={onCtx} />

      <div className="hc-dos">
        <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
          <div className="hc-ceja">La agenda manda: lee cuántos días</div>
          <Agenda plan={plan} sel={habito} onSel={elegirHabito} />
        </div>

        <div className="hc-oyente" style={{ borderColor: `${animoInfo.color}88` }}>
          <i className={`fa-solid ${animoInfo.icono}`} aria-hidden style={{ fontSize: 40, color: animoInfo.color }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>
              {c.oyente}, {c.oyenteRol}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.35 }} aria-live="polite">
              “{resultado ? resultado.reaccion : "So, Lucía, tell me about your week. Why do you do that?"}”
            </div>
          </div>
        </div>
      </div>

      <div className="hc-armar">
        <Paso n={1} titulo="Hábito">
          {HABITOS.map((x) => (
            <button key={x.id} type="button" className="hc-chip" data-sel={habito === x.id} onClick={() => elegirHabito(x.id)}>
              <i className={`fa-solid ${x.icono}`} aria-hidden style={{ color: x.color }} /> {x.etiqueta}
            </button>
          ))}
        </Paso>
        <Paso n={2} titulo="¿Cuándo? (contexto)">
          {FRASES.map((f) => (
            <button key={f.id} type="button" className="hc-chip" data-sel={frase === f.id} onClick={() => setFrase(f.id)}>
              {f.texto.replace(",", "")}
            </button>
          ))}
        </Paso>
        <Paso n={3} titulo="¿Con qué frecuencia? (mira la agenda)">
          {ADVERBIOS.map((a) => (
            <button key={a.id} type="button" className="hc-chip" data-sel={adverbio === a.id} onClick={() => setAdverbio(a.id)}>
              {a.id} <small>{a.pct}</small>
            </button>
          ))}
        </Paso>
        <Paso n={4} titulo="¿Dónde va el adverbio?">
          {(["antes", "despues"] as Posicion[]).map((p) => (
            <button key={p} type="button" className="hc-chip" data-sel={posicion === p} onClick={() => setPosicion(p)}>
              {p === "antes" ? `I ${advVista} ${h.verbo}…` : `I ${h.verbo} ${advVista}…`}
            </button>
          ))}
        </Paso>
        <Paso n={5} titulo="Conector">
          {CONECTORES.map((k) => (
            <button key={k.id} type="button" className="hc-chip" data-sel={conector === k.id} onClick={() => setConector(k.id)}>
              {k.id}
            </button>
          ))}
        </Paso>
        <Paso n={6} titulo="La razón">
          {h.razones.map((r) => (
            <button key={r.id} type="button" className="hc-chip hc-chip-largo" data-sel={razon === r.id} onClick={() => setRazon(r.id)}>
              … {r.texto}
            </button>
          ))}
        </Paso>

        <div className="hc-burbuja" style={{ borderColor: `rgba(${rgba},0.6)` }}>
          <strong style={{ color: accent }}>Lucía: </strong>
          {eleccion ? armarOracion(eleccion, ctx) : "Elige las seis piezas para armar tu explicación."}
        </div>
        <button type="button" className="hc-btn hc-btn-principal" disabled={!eleccion} onClick={decir} style={{ background: eleccion ? accent : undefined }}>
          <i className="fa-solid fa-paper-plane" aria-hidden /> Explícaselo a {c.oyente}
        </button>
      </div>

      {resultado && (
        <div className="hc-resultado" role="status" style={{ borderColor: `${resultado.ok ? OK : resultado.animo === "confuso" ? NO : AMBAR}88` }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: resultado.ok ? OK : resultado.animo === "confuso" ? NO : AMBAR }}>
            {resultado.ok ? "Explicación clara: frecuencia, razón y contexto coinciden" : "Algo no cuadra — revisa lo marcado"}
          </div>
          {resultado.chequeos.map((k) => (
            <div key={k.id} className="hc-chequeo" data-ok={k.ok}>
              <i className={`fa-solid ${k.ok ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden />
              <span>
                <strong>{k.titulo}.</strong> {k.texto}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="hc-carta">
        <div className="hc-ceja">
          <i className="fa-solid fa-envelope-open-text" aria-hidden style={{ marginRight: 8, color: accent }} />
          Lo que Lucía ya explicó ({cartasLista.length})
        </div>
        {cartasLista.length === 0 ? (
          <p style={{ margin: 0, fontSize: 14, color: T.text3 }}>Cada explicación correcta se queda aquí. Si cambias la agenda, se vuelve a revisar.</p>
        ) : (
          cartasLista.map((k) => {
            const ev = evaluar(k.eleccion, plan, k.ctx);
            return (
              <div key={k.eleccion.habito} className="hc-chequeo" data-ok={ev.ok}>
                <i className={`fa-solid ${ev.ok ? "fa-check" : "fa-triangle-exclamation"}`} aria-hidden />
                <span>
                  {ev.oracion}
                  {!ev.ok && <em> — la agenda cambió: esta oración ya no la describe.</em>}
                  {k.ctx !== ctx && <em> ({CONTEXTOS[k.ctx].nombre})</em>}
                </span>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function Paso({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
      <div className="hc-paso">
        {n} · {titulo}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Pestaña «Teoría» (verbatim de la progresión)
 * ═══════════════════════════════════════════════════════════════════════════ */
function Teoria({ accent, rgba }: { accent: string; rgba: string }) {
  const p = { margin: 0, fontSize: 14, color: T.text2, lineHeight: 1.55 } as const;
  return (
    <>
      <Bloque titulo="Propósito de la progresión" icono="fa-flag">
        <p style={p}>{PROGRESION_TITULO}</p>
        <p style={p}>
          <strong style={{ color: T.text }}>{VIDEO_A8.titulo}.</strong> {VIDEO_A8.descripcion}
        </p>
      </Bloque>
      <Bloque titulo="Daily Routines and Habits: Key Vocabulary" icono="fa-spell-check">
        {GLOSARIO_A1.map((t) => (
          <div key={t.id} style={p}>
            <strong style={{ color: T.text }}>{t.termino}.</strong> {t.definicion}
            <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{t.ejemplo}</div>
          </div>
        ))}
      </Bloque>
      <Bloque titulo="Habits, routines & purpose expressions" icono="fa-link">
        {GLOSARIO_A5.map((t) => (
          <div key={t.id} style={p}>
            <strong style={{ color: T.text }}>{t.termino}.</strong> {t.definicion}
            <div style={{ fontStyle: "italic", color: T.text3, marginTop: 2 }}>{t.ejemplo}</div>
          </div>
        ))}
      </Bloque>
      <Bloque titulo="Cómo lo mide este laboratorio" icono="fa-ruler">
        <p style={p}>
          Frecuencia = días marcados entre días posibles. En la simulación: 100 % always; 70 % o más usually (~80 %); 50–69 % often o sometimes;
          25–49 % sometimes; menos de 25 % rarely (~10-20 %); 0 % never.
        </p>
        <p style={p}>
          Conector según la forma de la razón: <strong style={{ color: T.text }}>because</strong> + oración completa;{" "}
          <strong style={{ color: T.text }}>due to</strong> + sustantivo; <strong style={{ color: T.text }}>in order to</strong> + verbo base;{" "}
          <strong style={{ color: T.text }}>so that</strong> + oración con «I can…». Inglés de EE. UU.: «on weekends» (el glosario usa la forma británica «at weekends»).
        </p>
      </Bloque>
      <Bloque titulo="Autoevaluación: ¿qué es «Logrado»?" icono="fa-list-check">
        {AUTOEVALUACION_A3.map((a) => (
          <div key={a.criterio} style={p}>
            <strong style={{ color: T.text }}>{a.criterio}</strong>
            <div style={{ marginTop: 2 }}>{a.logrado}</div>
          </div>
        ))}
        <ul style={{ ...p, paddingLeft: 18, display: "grid", gap: 4 }}>
          {AUTOEVALUACION_A7.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Bloque>
      <Bloque titulo="Tu turno" icono="fa-pen">
        <p style={p}>{ACTIVIDAD_FINAL_A1}</p>
        <p style={p}>{ACTIVIDAD_FINAL_A5}</p>
        <p style={p}>{REFLEXION_A3}</p>
        <p style={p}>{REFLEXION_A7}</p>
        <p style={p}>{VIDEO_A8.preguntaAbierta}</p>
      </Bloque>
      <Bloque titulo="Ficha teórica" icono="fa-book">
        <FichaTeorica data={HABITOS_CONTEXTO_FICHA} accent={accent} rgba={rgba} defaultOpen />
      </Bloque>
    </>
  );
}

const css = (accent: string, rgba: string) => `
  .hc-ceja { margin:0; font-size:14px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; color:${T.text3}; line-height:1.35; }
  .hc-chip { cursor:pointer; display:inline-flex; align-items:center; gap:7px; padding:9px 13px; border-radius:999px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; line-height:1.3;
    transition:border-color .14s, background .14s, transform .14s; text-align:left; max-width:100%; }
  .hc-chip small { font-size:14px; color:${T.text3}; font-weight:600; }
  .hc-chip:hover { border-color:${T.lineStrong}; }
  .hc-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 14px -6px ${accent}; }
  .hc-chip-largo { border-radius:14px; }
  .hc-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:9px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; }
  .hc-btn:hover:not(:disabled) { border-color:${T.lineStrong}; }
  .hc-btn:disabled { opacity:.45; cursor:default; }
  .hc-btn-principal { justify-self:start; color:#04121f; border:none; padding:11px 18px; font-size:15px; }
  .hc-btn-principal:disabled { color:${T.text2}; background:${T.inset}; }
  .hc-mini { cursor:pointer; width:34px; height:34px; border-radius:9px; border:1.5px solid ${T.line}; background:${T.inset}; color:#fff; font-size:14px; }
  .hc-mini:disabled { opacity:.35; cursor:default; }

  .hc-ctx { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; }
  .hc-ctx-op { cursor:pointer; display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:13px; border:1.5px solid ${T.line};
    background:${T.glass}; color:${T.text2}; text-align:left; min-width:0; transition:all .15s; }
  .hc-ctx-op i { font-size:20px; }
  .hc-ctx-op span { display:grid; min-width:0; }
  .hc-ctx-op strong { font-size:15px; color:#fff; }
  .hc-ctx-op small { font-size:14px; color:${T.text3}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .hc-ctx-op[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.18); color:${accent}; }

  .hc-foto { position:relative; border-radius:14px; overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .hc-foto > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .hc-foto-pie { position:absolute; left:0; right:0; bottom:0; display:flex; align-items:center; gap:10px; padding:22px 12px 10px;
    background:linear-gradient(0deg, rgba(2,10,24,.9), transparent); }
  .hc-foto-pie span { display:grid; min-width:0; }
  .hc-foto-pie strong { font-size:16px; color:#fff; }
  .hc-foto-pie small { font-size:14px; color:${T.text2}; }

  .hc-medidores { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:10px; }
  .hc-medidor { display:grid; gap:6px; padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:rgba(2,12,28,0.5); }
  .hc-medidor[data-ok="true"] { border-color:${OK}55; }
  .hc-medidor-top { display:flex; justify-content:space-between; align-items:baseline; gap:6px; font-size:14px; font-weight:800; color:${T.text2}; }
  .hc-medidor-top strong { font-size:19px; font-family:ui-monospace, monospace; }
  .hc-barra { position:relative; height:12px; border-radius:99px; background:rgba(255,255,255,0.12); overflow:visible; }
  .hc-barra > div { height:100%; border-radius:99px; transition:width .5s ease, background .5s ease; }
  .hc-umbral { position:absolute; top:-3px; bottom:-3px; width:2px; background:#fff; opacity:.7; border-radius:2px; }

  .hc-agenda { display:grid; gap:4px; min-width:0; }
  .hc-ag-fila { display:grid; grid-template-columns:minmax(0,1.7fr) repeat(7, minmax(0,1fr)); gap:4px; align-items:center;
    border-radius:10px; padding:2px; }
  .hc-ag-fila[data-sel="true"] { background:rgba(${rgba},0.12); outline:1.5px solid rgba(${rgba},0.5); }
  .hc-ag-cab { padding-bottom:0; }
  .hc-ag-dia { text-align:center; font-size:14px; font-weight:800; color:${T.text3}; }
  .hc-ag-dia[data-finde="true"] { color:${accent}; }
  .hc-ag-hab { display:flex; align-items:center; gap:7px; min-width:0; padding:6px 8px; border-radius:9px; border:1px solid transparent;
    background:transparent; color:${T.text}; font-size:14px; font-weight:700; text-align:left; }
  button.hc-ag-hab { cursor:pointer; }
  button.hc-ag-hab:hover { border-color:${T.line}; }
  .hc-ag-hab i { color:var(--hcc); flex-shrink:0; width:18px; text-align:center; }
  .hc-ag-txt { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .hc-ag-celda { height:38px; border-radius:8px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:flex; align-items:center; justify-content:center; color:#04121f; font-size:14px; padding:0; }
  button.hc-ag-celda { cursor:pointer; transition:background .2s, border-color .2s, transform .12s; }
  button.hc-ag-celda:hover { border-color:var(--hcc); }
  .hc-ag-celda[data-on="true"] { border-style:solid; border-color:var(--hcc); background:var(--hcc); }
  .hc-ag-celda[data-fuera="true"] { border:none; background:repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 6px, transparent 6px 12px); }
  @container lsescena (max-width: 560px) {
    .hc-ag-fila { grid-template-columns:34px repeat(7, minmax(0,1fr)); }
    .hc-ag-txt { display:none; }
    .hc-ag-hab { justify-content:center; padding:6px 0; }
  }

  .hc-detalle { display:grid; grid-template-columns:96px minmax(0,1fr); gap:12px; align-items:start; padding:12px; border-radius:14px;
    border:1.5px solid var(--hcc); background:${T.glass}; }
  .hc-detalle > .hc-foto { width:96px; }
  @container lsescena (max-width: 420px) { .hc-detalle { grid-template-columns:1fr; } .hc-detalle > .hc-foto { width:100%; } }
  .hc-paso-n { display:inline-flex; align-items:center; gap:8px; font-size:14px; font-weight:800; color:${T.text2}; }
  .hc-efecto { display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:999px; font-size:14px; font-weight:800; }
  .hc-efecto[data-signo="mas"] { background:${OK}1f; color:${OK}; border:1px solid ${OK}55; }
  .hc-efecto[data-signo="menos"] { background:${NO}1a; color:${NO}; border:1px solid ${NO}55; }

  .hc-diag { display:grid; gap:8px; padding:12px 14px; border-radius:14px; border:1.5px solid ${NO}55; background:${NO}0d; }
  .hc-diag[data-ok="true"] { border-color:${OK}66; background:${OK}0f; }
  .hc-diag-fila { cursor:pointer; display:flex; align-items:flex-start; gap:9px; padding:0; border:none; background:none;
    color:${T.text2}; font-size:14px; line-height:1.5; text-align:left; }
  .hc-diag-fila i { margin-top:4px; }
  .hc-diag-fila:hover span { color:#fff; }

  .hc-dos { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap:12px; align-items:start; }
  .hc-oyente { display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; }
  .hc-armar { display:grid; gap:12px; padding:14px; border-radius:16px; border:1px solid ${T.line}; background:rgba(255,255,255,0.025); }
  .hc-paso { font-size:14px; font-weight:900; color:${T.text2}; }
  .hc-burbuja { padding:12px 15px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.inset}; font-size:16px; line-height:1.5; color:#fff; }
  .hc-resultado, .hc-carta { display:grid; gap:9px; padding:14px 16px; border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; }
  .hc-chequeo { display:flex; align-items:flex-start; gap:9px; font-size:14px; line-height:1.5; color:${T.text2}; }
  .hc-chequeo i { margin-top:4px; color:${NO}; }
  .hc-chequeo[data-ok="true"] i { color:${OK}; }
  .hc-chequeo strong { color:${T.text}; }
  .hc-chequeo em { color:${AMBAR}; font-style:normal; }

  @media (prefers-reduced-motion: reduce) {
    .hc-barra > div, button.hc-ag-celda, .hc-chip, .hc-ctx-op { transition:none; }
  }
`;
