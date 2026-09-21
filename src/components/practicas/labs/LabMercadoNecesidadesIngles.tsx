"use client";

/**
 * Laboratorio 3D — "Needs and wishes: el tianguis y el centro de acopio".
 * Práctica anclada a IN-II-P07-A2 (quiz «Would Like, How Much and How Many»)
 * de la progresión 7 de Inglés II: «Participa en intercambios cotidianos sobre
 * necesidades personales o comunitarias (expresa deseos, elige y muestra
 * empatía)». El marco teórico es la lectura A1, los hechos salen del
 * verdadero/falso A4, el glosario del A5, el texto del fill_blanks A6, la
 * autoevaluación del A7, la frase de empatía del video A8 y «Tu turno» de la
 * escritura A3.
 *
 * Tres modos:
 *  (1) I'd like… — comprar la lista de Doña Carmen en un tianguis: much /
 *      many, pedido escrito con «I'd like…», ofertas «Would you like some…?»
 *      según el presupuesto y «How much is it?».
 *  (2) Choose and explain — la asamblea vecinal: preguntar datos con how much /
 *      how many, elegir entre dos opciones y justificar con fichas
 *      («I'd rather… / I'd like to… because…»).
 *  (3) Help your community — el centro de acopio: responder con empatía,
 *      escribir una oferta de ayuda y armar la caja con lo que pide el vecino.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { hablarLab, callarLab, puedeHablarLab } from "./lab-voz";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { MERCADO_NECESIDADES_INGLES_FICHA } from "./mercado-necesidades-ingles-ficha";
import type { VistaMercado, FaseAcopio } from "./MercadoNecesidadesInglesScene";
import {
  type Modo,
  type ProductoId,
  type Lado,
  type FichaElegir,
  type Caja,
  type Conteo,
  type Revision,
  MODOS,
  MODOS_DEF,
  mulberry32,
  estrellasPorErrores,
  PRODUCTOS,
  LISTA,
  NOTA_LISTA,
  PRESUPUESTO,
  itemDe,
  subtotal,
  revisaPedido,
  revisaMuchMany,
  OFERTAS,
  explicaOferta,
  revisaPreguntaPrecio,
  revisaMonto,
  TOTAL_EN,
  CAMBIO_EN,
  TOTAL_FINAL,
  DILEMAS,
  FICHAS_DILEMA,
  INICIOS,
  textoFichaElegir,
  oracionElegir,
  opcionDe,
  revisaEleccion,
  revisaPreguntaDilema,
  INSUMOS,
  CAJA_VACIA,
  VECINOS,
  ORDEN_RESPUESTAS,
  revisaOferta,
  revisaCaja,
  textoPedido,
  SUSTANTIVOS,
  rondaConteo,
  A3,
  analizaA3,
  A7,
  TITULO_A1,
  LECTURA_A1,
  PREGUNTAS_A1,
  QUIZ_A2,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  HUECOS_A6,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
} from "./mercado-necesidades-ingles-data";

const MercadoScene = dynamic(() => import("./MercadoNecesidadesInglesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-basket-shopping fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Montando el tianguis en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-mercado-necesidades-ingles-reto";
const WARN = "#FF8A3C";
const RONDA_INICIAL = rondaConteo(mulberry32(9));
const ORDEN_OFERTA: ("yes" | "no")[] = ["yes", "no"];

function BotonEscuchar({ texto, col }: { texto: string; col: string }) {
  // Sin clip grabado Y sin sintetizador el botón no podría cumplir; con
  // cualquiera de los dos sí, así que se enseña.
  if (!puedeHablarLab(texto)) return null;
  return (
    <button className="mn-escuchar" onClick={() => hablarLab(texto)} title="Escuchar en inglés" aria-label={`Escuchar: ${texto}`} style={{ ["--mnc" as string]: col }}>
      <i className="fa-solid fa-volume-high" style={{ marginRight: 6 }} />
      Escuchar
    </button>
  );
}

const capitaliza = (s: string) => {
  const t = s.trim().replace(/\s+/g, " ");
  return t ? `${t.charAt(0).toUpperCase()}${t.slice(1)}` : t;
};

function Entrada(props: { label: string; value: string; onChange: (v: string) => void; onEnter: () => void; placeholder: string; estado: Revision | null; disabled?: boolean }) {
  return (
    <input
      className="mn-in"
      aria-label={props.label}
      value={props.value}
      placeholder={props.placeholder}
      disabled={props.disabled}
      data-e={props.estado ? (props.estado.ok ? "bien" : "mal") : ""}
      onChange={(e) => props.onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          props.onEnter();
        }
      }}
      autoComplete="off"
      spellCheck={false}
      style={{ flex: 1, minWidth: 200 }}
    />
  );
}

function BotonComprobar({ onClick, etq = "Comprobar", disabled = false, col }: { onClick: () => void; etq?: string; disabled?: boolean; col: string }) {
  return (
    <button className="mn-opt mn-comprobar" data-on="true" onClick={onClick} disabled={disabled} style={{ ["--mnc" as string]: col, background: `${col}1f` }}>
      <i className="fa-solid fa-check" style={{ marginRight: 8 }} />
      {etq}
    </button>
  );
}

/* ── Tarjeta de estrellas: Countable or uncountable? ─────────────────── */
function ConteoCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = SUSTANTIVOS[ronda[pos] ?? 0]!;

  const responder = (t: Conteo) => {
    if (resuelto !== null) return;
    const ok = t === actual.tipo;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`«${actual.w}» es ${actual.tipo === "countable" ? "contable" : "incontable"}: ${actual.explica}`);
      return;
    }
    setAviso(null);
    if (pos + 1 >= ronda.length) {
      const est = estrellasPorErrores(errores);
      setResuelto(est);
      onResultado(est);
    } else setPos((p) => p + 1);
  };
  const otra = () => {
    setRonda(rondaConteo(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setResuelto(null);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          Countable or uncountable? How much or how many?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 12 }}>
        Los sustantivos salen de la lectura A1, el quiz A2, el glosario A5 y el diálogo A6. Decide si se cuentan (how many) o no (how much). Cero errores = 3 estrellas.
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
            Sustantivo {pos + 1} de {ronda.length}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <div style={{ fontSize: 18, color: "#fff", fontWeight: 900 }}>How ___ {actual.w}?</div>
            <BotonEscuchar texto={actual.w} col={accent} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(
              [
                ["countable", "Countable · how many", "Se cuenta: one, two, three…", "fa-list-ol", OK],
                ["uncountable", "Uncountable · how much", "No se cuenta directo: se mide", "fa-glass-water", "#38bdf8"],
              ] as const
            ).map(([id, etq, desc, ic, col]) => (
              <button key={id} className="mn-opt mn-conteo" data-on="true" onClick={() => responder(id)} style={{ ["--mnc" as string]: col, textAlign: "left" }}>
                <div style={{ fontSize: 12.5 }}>
                  <i className={`fa-solid ${ic}`} style={{ marginRight: 8 }} />
                  {etq}
                </div>
                <div style={{ fontSize: 10.5, color: T.text3, fontWeight: 700, marginTop: 3 }}>{desc}</div>
              </button>
            ))}
          </div>
          {aviso && <div style={{ marginTop: 10, fontSize: 12, color: WARN, lineHeight: 1.5 }}>{aviso} Inténtalo de nuevo.</div>}
        </>
      ) : (
        <div style={{ padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 12.5, fontWeight: 900, color: OK, marginLeft: 4 }}>Ronda con {errores === 0 ? "cero errores" : `${errores} ${errores === 1 ? "error" : "errores"}`}</span>
          </span>
          <button onClick={otra} style={{ cursor: "pointer", padding: "9px 14px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 12.5, fontWeight: 900 }}>
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Otra ronda
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Tu turno: escritura A3 con revisión orientativa ──────────────────── */
function TuTurnoCard({ accent, logrado, onLogrado, playSfx }: { accent: string; logrado: boolean; onLogrado: () => void; playSfx?: (ok: boolean) => void }) {
  const [texto, setTexto] = useState("");
  const [revisado, setRevisado] = useState(false);
  const an = analizaA3(texto);
  const criterios: { t: string; ok: boolean }[] = [
    { t: `Entre ${A3.min} y ${A3.max} palabras (llevas ${an.palabras})`, ok: an.palabras >= A3.min && an.palabras <= A3.max },
    { t: `Usa «would like» o «'d like» al menos una vez (llevas ${an.wouldLike})`, ok: an.wouldLike >= 1 },
    { t: "Pregunta o dice cuánto se necesita: how much / how many o una cantidad (3 more buses, more water)", ok: an.cantidad },
    { t: "Explica por qué es importante (because…, This is important because…)", ok: an.razon },
    { t: an.errores.length ? `Revisa: ${an.errores.join(" · ")}` : "Sin errores detectados de much / many ni de «would like to» + sustantivo", ok: an.errores.length === 0 },
  ];
  const todo = criterios.every((c) => c.ok);
  const revisar = () => {
    setRevisado(true);
    playSfx?.(todo);
    if (todo && !logrado) onLogrado();
  };
  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <Eyebrow>
        <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
        Tu turno: What My Community Needs (A3)
      </Eyebrow>
      <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, lineHeight: 1.5 }}>{A3.prompt}</div>
      <ul style={{ margin: "8px 0 12px", paddingLeft: 18, display: "grid", gap: 3 }}>
        {A3.pistas.map((p) => (
          <li key={p} style={{ fontSize: 12, color: T.text2 }}>
            {p}
          </li>
        ))}
      </ul>
      <textarea
        className="mn-area"
        aria-label="Las necesidades de tu comunidad en inglés"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setRevisado(false);
        }}
        placeholder="My community would like to have a library. We need about 500 books…"
        rows={6}
        style={{ ["--mnc" as string]: accent }}
      />
      <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
        {criterios.map((c) => (
          <div key={c.t} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: c.ok ? OK : revisado ? WARN : T.text2, lineHeight: 1.4 }}>
            <i className={`fa-solid ${c.ok ? "fa-circle-check" : revisado ? "fa-circle-exclamation" : "fa-circle"}`} style={{ marginTop: 2 }} />
            {c.t}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
        <button className="mn-opt mn-a3" data-on="true" onClick={revisar} style={{ ["--mnc" as string]: accent }}>
          <i className="fa-solid fa-spell-check" style={{ marginRight: 8 }} />
          Revisar mi texto
        </button>
        {revisado && <span style={{ fontSize: 12, color: todo ? OK : WARN, fontWeight: 800 }}>{todo ? "¡Listo! Tu texto cumple los criterios que se pueden revisar automáticamente." : "Todavía falta algo: revisa los puntos en naranja."}</span>}
      </div>
      <div style={{ fontSize: 11, color: T.text3, marginTop: 10, lineHeight: 1.5 }}>
        Criterios de la actividad: {A3.criterios.join(" · ")}. La revisión automática es orientativa: cuenta palabras, busca «would like», cantidades y una razón, y detecta errores comunes de much / many; tu docente evalúa la claridad y el contenido.
      </div>
    </div>
  );
}

/* ── Autoevaluación A7 ─────────────────────────────────────────────────── */
function AutoevaluacionCard({ accent }: { accent: string }) {
  const [nivel, setNivel] = useState<(number | null)[]>(() => A7.criterios.map(() => null));
  return (
    <div style={{ ...card, padding: "18px 22px" }}>
      <Eyebrow>
        <i className="fa-solid fa-clipboard-check" style={{ marginRight: 8, color: accent }} />
        Autoevaluación (A7)
      </Eyebrow>
      <div style={{ fontSize: 12, color: T.text2, marginBottom: 10 }}>{A7.instrucciones}</div>
      <div style={{ display: "grid", gap: 10 }}>
        {A7.criterios.map((c, i) => (
          <div key={c}>
            <div style={{ fontSize: 12, color: "#fff", fontWeight: 700, marginBottom: 5 }}>{c}</div>
            <div className="mn-opts">
              {A7.escala.map((e) => (
                <button
                  key={e.valor}
                  className="mn-opt mn-a7"
                  data-on={nivel[i] === e.valor}
                  title={e.descripcion}
                  onClick={() => setNivel((xs) => xs.map((x, k) => (k === i ? e.valor : x)))}
                  style={{ ["--mnc" as string]: accent, padding: "6px 9px", fontSize: 11, background: nivel[i] === e.valor ? `${accent}22` : "transparent" }}
                >
                  {e.valor} · {e.etiqueta}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: T.text2, marginTop: 10 }}>
        <strong style={{ color: "#fff" }}>Reflexión:</strong> {A7.reflexion}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabMercadoNecesidadesIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("mercado");

  // ── I'd like…
  const [comprados, setComprados] = useState<ProductoId[]>([]);
  const [sel, setSel] = useState<ProductoId | null>(null);
  const [mmOk, setMmOk] = useState(false);
  const [avisoMM, setAvisoMM] = useState<Revision | null>(null);
  const [pedidoTxt, setPedidoTxt] = useState("");
  const [pedidoRes, setPedidoRes] = useState<Revision | null>(null);
  const [ultimoPedido, setUltimoPedido] = useState<string | null>(null);
  const [dichoCliente, setDichoCliente] = useState<string | null>(null);
  const [ofertaIdx, setOfertaIdx] = useState(-1);
  const [ofertasAcept, setOfertasAcept] = useState<ProductoId[]>([]);
  const [ofertaRes, setOfertaRes] = useState<Revision | null>(null);
  const [precioTxt, setPrecioTxt] = useState("");
  const [precioRes, setPrecioRes] = useState<Revision | null>(null);
  const [preguntado, setPreguntado] = useState(false);
  const [montoTxt, setMontoTxt] = useState("");
  const [montoRes, setMontoRes] = useState<Revision | null>(null);
  const [pagado, setPagado] = useState(false);

  // ── Choose and explain
  const [dIdx, setDIdx] = useState(0);
  const [reveladas, setReveladas] = useState<Record<string, [boolean, boolean]>>({});
  const [avisoQ, setAvisoQ] = useState<Revision | null>(null);
  const [elegidas, setElegidas] = useState<Record<string, Lado>>({});
  const [fichas, setFichas] = useState<FichaElegir[]>([]);
  const [revE, setRevE] = useState<string[] | null>(null);
  const [resueltos, setResueltos] = useState<Record<string, string>>({});
  const [usoRather, setUsoRather] = useState(false);
  const [usoLikeTo, setUsoLikeTo] = useState(false);

  // ── Help your community
  const [vIdx, setVIdx] = useState(0);
  const [empOk, setEmpOk] = useState<Record<string, string>>({});
  const [avisoEmp, setAvisoEmp] = useState<string | null>(null);
  const [ofertaTxt, setOfertaTxt] = useState("");
  const [ofertaAyudaRes, setOfertaAyudaRes] = useState<Revision | null>(null);
  const [ofertasOk, setOfertasOk] = useState<Record<string, string>>({});
  const [caja, setCaja] = useState<Caja>(CAJA_VACIA);
  const [cajaRes, setCajaRes] = useState<string[] | null>(null);
  const [entregados, setEntregados] = useState<string[]>([]);

  // ── Evaluables
  const [identifico, setIdentifico] = useState(false);
  const [quizOk, setQuizOk] = useState(false);
  const [textoA6, setTextoA6] = useState(false);
  const [a3Ok, setA3Ok] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setIdentifico(true);
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
      callarLab();
    };
  }, []);

  const blip = () => {
    if (sonido) audioRef.current?.blip();
  };
  const sfx = (ok: boolean) => {
    if (!sonido) return;
    if (ok) audioRef.current?.correcto();
    else audioRef.current?.incorrecto();
  };

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── I'd like… ─────────────────────────────────────────────────────── */
  const item = sel ? (itemDe(sel) ?? null) : null;
  const faseMercado: "lista" | "ofertas" | "precio" | "monto" | "listo" = comprados.length < LISTA.length ? "lista" : ofertaIdx < OFERTAS.length ? "ofertas" : !preguntado ? "precio" : !pagado ? "monto" : "listo";
  const oferta = faseMercado === "ofertas" && ofertaIdx >= 0 ? OFERTAS[ofertaIdx]! : null;
  const auxMM = item && PRODUCTOS[item.prod].contable ? "many" : "much";
  const preguntaVendedor = item ? `${item.pregunta[0]}${mmOk ? auxMM : "___"}${item.pregunta[1]}` : "";
  const cuentaParcial = comprados.reduce((a, id) => a + subtotal(itemDe(id)!), 0) + ofertasAcept.reduce((a, id) => a + (OFERTAS.find((o) => o.prod === id)?.precio ?? 0), 0);

  let dichoVendedor: string;
  if (faseMercado === "lista") dichoVendedor = item ? preguntaVendedor : comprados.length ? "Here you are! Anything else?" : "Good morning! What would you like?";
  else if (faseMercado === "ofertas") dichoVendedor = oferta!.pregunta;
  else if (faseMercado === "precio") dichoVendedor = "OK. Anything else?";
  else if (faseMercado === "monto") dichoVendedor = TOTAL_EN;
  else dichoVendedor = CAMBIO_EN;

  const elegirProducto = (id: ProductoId) => {
    if (faseMercado !== "lista" || comprados.includes(id) || !itemDe(id)) return;
    setSel(id);
    setMmOk(false);
    setAvisoMM(null);
    setPedidoTxt("");
    setPedidoRes(null);
    setDichoCliente(null);
    blip();
  };
  const elegirMM = (x: "much" | "many") => {
    if (!item || mmOk) return;
    const r = revisaMuchMany(item, x);
    setAvisoMM(r);
    sfx(r.ok);
    if (r.ok) setMmOk(true);
  };
  const comprobarPedido = () => {
    if (!item || !mmOk) return;
    const r = revisaPedido(item, pedidoTxt);
    setPedidoRes(r);
    sfx(r.ok);
    if (!r.ok) return;
    const nx = [...comprados, item.prod];
    setComprados(nx);
    setDichoCliente(capitaliza(pedidoTxt));
    setUltimoPedido(r.msg);
    setSel(null);
    setMmOk(false);
    setAvisoMM(null);
    setPedidoTxt("");
    setPedidoRes(null);
    if (nx.length === LISTA.length) setOfertaIdx(0);
  };
  const responderOferta = (ans: "yes" | "no") => {
    if (!oferta) return;
    const r = explicaOferta(oferta, ans);
    setOfertaRes(r);
    sfx(r.ok);
    if (!r.ok) return;
    if (ans === "yes") setOfertasAcept((xs) => [...xs, oferta.prod]);
    setDichoCliente(ans === "yes" ? "Yes, please." : "No, thank you.");
    setOfertaIdx((k) => k + 1);
  };
  const preguntarPrecio = () => {
    const r = revisaPreguntaPrecio(precioTxt);
    setPrecioRes(r);
    sfx(r.ok);
    if (r.ok) {
      setPreguntado(true);
      setDichoCliente(capitaliza(precioTxt));
    }
  };
  const pagar = () => {
    const r = revisaMonto(montoTxt);
    setMontoRes(r);
    sfx(r.ok);
    if (r.ok) {
      setPagado(true);
      setDichoCliente(`Here you are: ${PRESUPUESTO} pesos.`);
    }
  };
  const reiniciarMercado = () => {
    setComprados([]);
    setSel(null);
    setMmOk(false);
    setAvisoMM(null);
    setPedidoTxt("");
    setPedidoRes(null);
    setUltimoPedido(null);
    setDichoCliente(null);
    setOfertaIdx(-1);
    setOfertasAcept([]);
    setOfertaRes(null);
    setPrecioTxt("");
    setPrecioRes(null);
    setPreguntado(false);
    setMontoTxt("");
    setMontoRes(null);
    setPagado(false);
  };

  /* ── Choose and explain ────────────────────────────────────────────── */
  const dil = DILEMAS[dIdx]!;
  const rev: [boolean, boolean] = reveladas[dil.id] ?? [false, false];
  const elegida: Lado | null = elegidas[dil.id] ?? null;
  const resuelto = !!resueltos[dil.id];
  const qActual = rev[0] ? (rev[1] ? -1 : 1) : 0;
  const oracion = resuelto ? resueltos[dil.id]! : oracionElegir(dil, fichas);

  const preguntarDilema = (x: "much" | "many") => {
    if (qActual < 0) return;
    const q = dil.preguntas[qActual as 0 | 1];
    const r = revisaPreguntaDilema(q, x);
    setAvisoQ(r);
    sfx(r.ok);
    if (r.ok) setReveladas((m) => ({ ...m, [dil.id]: qActual === 0 ? [true, false] : [true, true] }));
  };
  const elegirLado = (l: Lado) => {
    if (!rev[0] || !rev[1] || resuelto) return;
    setElegidas((m) => ({ ...m, [dil.id]: l }));
    setRevE(null);
  };
  const irDilema = (i: number) => {
    setDIdx(i);
    setFichas([]);
    setRevE(null);
    setAvisoQ(null);
    blip();
  };
  const ponerFicha = (f: FichaElegir) => {
    if (resuelto || !elegida || fichas.includes(f)) return;
    setFichas((xs) => [...xs, f]);
    setRevE(null);
    blip();
  };
  const quitarFicha = (i: number) => {
    if (resuelto) return;
    setFichas((xs) => xs.filter((_, k) => k !== i));
    setRevE(null);
  };
  const comprobarEleccion = () => {
    if (!elegida) return;
    const errs = revisaEleccion(dil, elegida, fichas);
    setRevE(errs);
    const ok = errs.length === 0;
    sfx(ok);
    if (!ok) return;
    setResueltos((m) => ({ ...m, [dil.id]: oracionElegir(dil, fichas) }));
    if (fichas[0] === "rather") setUsoRather(true);
    if (fichas[0] === "likeTo") setUsoLikeTo(true);
  };

  /* ── Help your community ───────────────────────────────────────────── */
  const vec = VECINOS[vIdx]!;
  const faseAcopio: FaseAcopio = !empOk[vec.id] ? "empatia" : !ofertasOk[vec.id] ? "oferta" : !entregados.includes(vec.id) ? "caja" : "listo";
  const dichoTu = faseAcopio === "empatia" ? null : faseAcopio === "oferta" ? empOk[vec.id]! : faseAcopio === "caja" ? ofertasOk[vec.id]! : `Here you are: ${textoPedido(vec)}.`;

  const irVecino = (i: number) => {
    setVIdx(i);
    setAvisoEmp(null);
    setOfertaTxt("");
    setOfertaAyudaRes(null);
    setCaja(CAJA_VACIA);
    setCajaRes(null);
    blip();
  };
  const elegirEmpatia = (k: number) => {
    if (empOk[vec.id]) return;
    const r = vec.respuestas[k]!;
    sfx(r.ok);
    if (r.ok) {
      setEmpOk((m) => ({ ...m, [vec.id]: r.en }));
      setAvisoEmp(r.porque);
    } else setAvisoEmp(`«${r.en}» no es una buena respuesta: ${r.porque}`);
  };
  const comprobarOferta = () => {
    const r = revisaOferta(vec, ofertaTxt);
    setOfertaAyudaRes(r);
    sfx(r.ok);
    if (r.ok) setOfertasOk((m) => ({ ...m, [vec.id]: capitaliza(ofertaTxt) }));
  };
  const cambiarCaja = (id: keyof Caja, delta: number) => {
    if (faseAcopio !== "caja") return;
    const x = INSUMOS.find((y) => y.id === id)!;
    setCaja((c) => ({ ...c, [id]: Math.max(0, Math.min(x.max, c[id] + delta)) }));
    setCajaRes(null);
    blip();
  };
  const comprobarCaja = () => {
    const errs = revisaCaja(vec, caja);
    setCajaRes(errs);
    sfx(errs.length === 0);
    if (errs.length === 0) {
      setEntregados((xs) => [...xs, vec.id]);
      setCaja(CAJA_VACIA);
    }
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "mercado") reiniciarMercado();
    if (modo === "elegir") {
      setFichas([]);
      setRevE(null);
      setAvisoQ(null);
    }
    if (modo === "acopio") {
      setCaja(CAJA_VACIA);
      setCajaRes(null);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const nRev = DILEMAS.filter((d) => reveladas[d.id]?.[0] && reveladas[d.id]?.[1]).length;
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Pedir los cinco productos de la lista: how much / how many y «I'd like…»", done: comprados.length === LISTA.length },
    { t: "Decidir las ofertas «Would you like some…?» según el presupuesto, preguntar «How much is it?» y pagar", done: pagado },
    { t: "Descubrir los datos de las cuatro necesidades preguntando con how much / how many", done: nRev === DILEMAS.length },
    { t: "Elegir y justificar las cuatro decisiones con una razón verdadera", done: Object.keys(resueltos).length === DILEMAS.length },
    { t: "Justificar al menos una vez con «I'd rather…» y otra con «I'd like to…»", done: usoRather && usoLikeTo },
    { t: "Responder con empatía a los cinco vecinos", done: Object.keys(empOk).length === VECINOS.length },
    { t: "Ofrecer ayuda por escrito a los cinco vecinos", done: Object.keys(ofertasOk).length === VECINOS.length },
    { t: "Armar y entregar las cinco cajas con lo que pidió cada vecino", done: entregados.length === VECINOS.length },
    { t: "Clasificar sustantivos contables e incontables y ganar estrellas", done: identifico },
    { t: "Aprobar el quiz A2 y completar el diálogo A6", done: quizOk && textoA6 },
    { t: "Escribir qué necesita tu comunidad (A3) y pasar la revisión", done: a3Ok },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaMercado = modo;
  let chipVivo = "";
  let pie: ReactNode = "";
  if (modo === "mercado") {
    chipVivo = `bolsa ${comprados.length + ofertasAcept.length} · lista ${comprados.length}/${LISTA.length} · $${cuentaParcial} de $${PRESUPUESTO}`;
    if (faseMercado === "lista") {
      pie = item
        ? mmOk
          ? `Don Beto pregunta «${preguntaVendedor}» Contesta con la oración completa: la lista dice ${item.listaEs}.`
          : `«${preguntaVendedor}» ¿Much o many? Piensa si ${PRODUCTOS[item.prod].en} se puede contar.`
        : "Toca en el puesto (o en el panel) un producto de la lista de Doña Carmen. Los letreros están en inglés: busca cómo se llama cada cosa.";
    } else if (faseMercado === "ofertas") pie = `Don Beto ofrece: «${oferta!.pregunta}» Revisa el ticket y la nota de Doña Carmen antes de contestar.`;
    else if (faseMercado === "precio") pie = "Ya tienes todo. Pregunta cuánto es en inglés para que Don Beto te diga el total.";
    else if (faseMercado === "monto") pie = `Don Beto dice «${TOTAL_EN}» Escribe con números cuánto tienes que pagar.`;
    else pie = `Pagaste ${TOTAL_FINAL} pesos con ${PRESUPUESTO} y te dieron ${PRESUPUESTO - TOTAL_FINAL} de cambio. «${CAMBIO_EN}»`;
  } else if (modo === "elegir") {
    chipVivo = `need ${dIdx + 1}/${DILEMAS.length} · ${elegida ? `option ${elegida}` : rev[1] ? "A or B?" : `question ${qActual + 1}/2`} · resueltas ${Object.keys(resueltos).length}/${DILEMAS.length}`;
    pie = resuelto ? (
      <>
        <strong style={{ color: OK }}>«{oracion}»</strong> Mira la consecuencia en la plaza{elegida ? ` (${opcionDe(dil, elegida).es})` : ""}.
      </>
    ) : qActual >= 0 ? (
      `«${dil.necesidad}» Antes de decidir, pregunta: «${dil.preguntas[qActual as 0 | 1].partes[0]}___${dil.preguntas[qActual as 0 | 1].partes[1]}» ¿much o many?`
    ) : !elegida ? (
      "Ya conoces los datos de las dos opciones. Toca la plataforma A o B (o el botón del panel) para elegir."
    ) : (
      `Elegiste ${elegida}: ${opcionDe(dil, elegida).es}. Arma con fichas por qué: inicio + lo que eliges + because + una razón verdadera.`
    );
  } else {
    chipVivo = `${vec.nombre} · ${faseAcopio === "empatia" ? "escucha" : faseAcopio === "oferta" ? "ofrece ayuda" : faseAcopio === "caja" ? "arma la caja" : "entregado"} · ${entregados.length}/${VECINOS.length} familias`;
    pie =
      faseAcopio === "empatia"
        ? `${vec.nombre} (${vec.quien}) dice: «${vec.dice}» Elige una respuesta empática.`
        : faseAcopio === "oferta"
          ? `Ahora ofrécele ayuda por escrito. Necesita ${vec.necesidadEs}.`
          : faseAcopio === "caja"
            ? `${vec.nombre} contestó: «${vec.contesta}» Pon en la caja exactamente lo que pidió.`
            : `La caja de ${vec.nombre} ya está en la zona de entregas. ${entregados.length < VECINOS.length ? "Atiende al siguiente vecino." : "¡Atendiste a las cinco familias!"}`;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y la retroalimentación siguen aquí. {typeof pie === "string" ? pie : ""}</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const notaRev = (r: Revision | null) => r && nota(r.msg, r.ok ? OK : WARN, r.ok ? "fa-circle-check" : "fa-lightbulb");
  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "mercado") {
    control = (
      <>
        <div className="mn-nota-lista">
          <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "0.1em", color: "#92400e", marginBottom: 6 }}>
            <i className="fa-solid fa-receipt" style={{ marginRight: 6 }} />
            LA LISTA DE DOÑA CARMEN · billete de ${PRESUPUESTO}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "3px 12px" }}>
            {LISTA.map((it) => (
              <div key={it.prod} style={{ fontSize: 13.5, fontWeight: 800, color: comprados.includes(it.prod) ? "#15803d" : "#1c1917", textDecoration: comprados.includes(it.prod) ? "line-through" : "none" }}>
                {comprados.includes(it.prod) ? "✓ " : "☐ "}
                {it.listaEs}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#57534e", fontStyle: "italic", marginTop: 6 }}>{NOTA_LISTA}</div>
        </div>
        {faseMercado === "lista" && (
          <>
            {sub(`1 · Elige un producto del puesto (${comprados.length}/${LISTA.length})`)}
            <div className="mn-opts">
              {LISTA.map((it) => {
                const p = PRODUCTOS[it.prod];
                const hecho = comprados.includes(it.prod);
                return (
                  <button key={it.prod} className="mn-opt mn-prod" data-on={sel === it.prod} disabled={hecho} onClick={() => elegirProducto(it.prod)} style={{ ["--mnc" as string]: hecho ? OK : modoCol, background: sel === it.prod ? `${modoCol}22` : "transparent" }}>
                    <i className={`fa-solid ${hecho ? "fa-check" : p.icono}`} style={{ marginRight: 7, color: hecho ? OK : modoCol }} />
                    {p.en}
                  </button>
                );
              })}
            </div>
            {!item && ultimoPedido && nota(ultimoPedido, OK, "fa-circle-check")}
            {item && (
              <div className="mn-caja-paso" style={{ ["--mnc" as string]: modoCol }}>
                {sub("2 · Don Beto pregunta: ¿much o many?")}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 16, color: "#fff", fontWeight: 800 }}>{preguntaVendedor}</div>
                  {mmOk && <BotonEscuchar texto={preguntaVendedor} col={modoCol} />}
                </div>
                <div className="mn-opts" style={{ marginTop: 8 }}>
                  {(["much", "many"] as const).map((x) => (
                    <button key={x} className="mn-opt mn-mm" data-on={mmOk && x === auxMM} disabled={mmOk} onClick={() => elegirMM(x)} style={{ ["--mnc" as string]: mmOk && x === auxMM ? OK : modoCol, minWidth: 76 }}>
                      {x}
                    </button>
                  ))}
                </div>
                {notaRev(avisoMM)}
                <div style={{ opacity: mmOk ? 1 : 0.4, pointerEvents: mmOk ? "auto" : "none" }}>
                  {sub(`3 · Pide en inglés (la lista dice ${item.listaEs})`)}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <Entrada {...{
                      label: "Tu pedido en inglés",
                      value: pedidoTxt,
                      onChange: (v) => {
                        setPedidoTxt(v);
                        setPedidoRes(null);
                      },
                      onEnter: comprobarPedido,
                      placeholder: "I'd like…",
                      estado: pedidoRes,
                      disabled: !mmOk,
                    }} />
                    {<BotonComprobar onClick={comprobarPedido} etq="Pedir" disabled={!mmOk} col={modoCol} />}
                  </div>
                  {notaRev(pedidoRes)}
                </div>
              </div>
            )}
          </>
        )}
        {faseMercado === "ofertas" && oferta && (
          <>
            {sub(`Oferta ${ofertaIdx + 1} de ${OFERTAS.length} · ¿la aceptas?`)}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontSize: 15, color: "#f9a8d4", fontWeight: 800 }}>Don Beto: «{oferta.pregunta}»</div>
              <BotonEscuchar texto={oferta.pregunta} col="#f472b6" />
            </div>
            <div style={{ fontSize: 12, color: T.text2, marginTop: 6, ...NUM }}>
              Llevas en el ticket: {LISTA.map((it) => `${it.listaEs} $${subtotal(it)}`).join(" · ")}
              {ofertasAcept.length ? ` · ${ofertasAcept.map((id) => `${PRODUCTOS[id].es} $${OFERTAS.find((o) => o.prod === id)?.precio}`).join(" · ")}` : ""}
            </div>
            <div className="mn-opts" style={{ marginTop: 10 }}>
              {ORDEN_OFERTA.map((ans) => (
                <button key={ans} className="mn-opt mn-oferta" data-on="true" onClick={() => responderOferta(ans)} style={{ ["--mnc" as string]: ans === "yes" ? OK : "#f87171" }}>
                  <i className={`fa-solid ${ans === "yes" ? "fa-thumbs-up" : "fa-hand"}`} style={{ marginRight: 8 }} />
                  {ans === "yes" ? "Yes, please." : "No, thank you."}
                </button>
              ))}
            </div>
            {notaRev(ofertaRes)}
          </>
        )}
        {faseMercado !== "lista" && faseMercado !== "ofertas" && ofertaRes?.ok && nota(ofertaRes.msg, OK, "fa-circle-check")}
        {(faseMercado === "precio" || faseMercado === "monto" || faseMercado === "listo") && (
          <>
            {sub("4 · Pregunta el total")}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <Entrada {...{
                label: "Pregunta del precio en inglés",
                value: precioTxt,
                onChange: (v) => {
                  setPrecioTxt(v);
                  setPrecioRes(null);
                },
                onEnter: preguntarPrecio,
                placeholder: "How…?",
                estado: precioRes,
                disabled: preguntado,
              }} />
              {!preguntado && <BotonComprobar onClick={preguntarPrecio} etq="Preguntar" col={modoCol} />}
            </div>
            {notaRev(precioRes)}
          </>
        )}
        {(faseMercado === "monto" || faseMercado === "listo") && (
          <>
            {sub("5 · ¿Cuánto dijo? Escríbelo con números")}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <div style={{ fontSize: 15, color: "#f9a8d4", fontWeight: 800 }}>Don Beto: «{TOTAL_EN}»</div>
              <BotonEscuchar texto={TOTAL_EN} col="#f472b6" />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: T.text2 }}>$</span>
              <Entrada {...{
                label: "Total en pesos",
                value: montoTxt,
                onChange: (v) => {
                  setMontoTxt(v);
                  setMontoRes(null);
                },
                onEnter: pagar,
                placeholder: "000",
                estado: montoRes,
                disabled: pagado,
              }} />
              {!pagado && <BotonComprobar onClick={pagar} etq="Pagar" col={modoCol} />}
            </div>
            {notaRev(montoRes)}
            {pagado && (
              <div className="mn-opts" style={{ marginTop: 10 }}>
                <BotonEscuchar texto={CAMBIO_EN} col={OK} />
                <button className="mn-opt" data-on="false" onClick={reiniciarMercado} style={{ ["--mnc" as string]: modoCol }}>
                  <i className="fa-solid fa-rotate-left" style={{ marginRight: 8 }} />
                  Hacer el mandado otra vez
                </button>
              </div>
            )}
          </>
        )}
        {nota("Regla: would like + sustantivo para pedir (I'd like six oranges). Contables: número + plural (twelve eggs). Incontables: medida + of (two kilos of rice).", T.text3)}
      </>
    );
  } else if (modo === "elegir") {
    const opActual = elegida ? opcionDe(dil, elegida) : null;
    control = (
      <>
        <div className="mn-opts">
          {DILEMAS.map((d, i) => (
            <button key={d.id} className="mn-opt mn-dilema" data-on={i === dIdx} onClick={() => irDilema(i)} style={{ ["--mnc" as string]: modoCol, background: i === dIdx ? `${modoCol}1f` : "transparent" }} aria-label={`Necesidad ${i + 1}`}>
              <i className={`fa-solid ${d.icono}`} style={{ marginRight: 6 }} />
              {i + 1}
              {resueltos[d.id] && <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 900 }}>{dil.necesidad}</div>
          <BotonEscuchar texto={dil.necesidad} col={modoCol} />
        </div>
        <div style={{ fontSize: 12, color: T.text3, marginTop: 3 }}>{dil.es}</div>
        {sub("1 · Pregunta antes de decidir")}
        {dil.preguntas.map((q, k) => {
          const hecha = rev[k];
          const activa = qActual === k;
          return (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6, opacity: hecha || activa ? 1 : 0.4 }}>
              <span style={{ fontSize: 14.5, color: "#fff", fontWeight: 800, minWidth: 220 }}>
                {q.partes[0]}
                <span style={{ color: hecha ? OK : modoCol }}>{hecha ? q.aux : "___"}</span>
                {q.partes[1]}
              </span>
              {activa && (
                <button className="mn-opt mn-mmq" data-on="true" onClick={() => preguntarDilema("much")} style={{ ["--mnc" as string]: modoCol, minWidth: 64 }}>
                  much
                </button>
              )}
              {activa && (
                <button className="mn-opt mn-mmq" data-on="true" onClick={() => preguntarDilema("many")} style={{ ["--mnc" as string]: modoCol, minWidth: 64 }}>
                  many
                </button>
              )}
              {hecha && <BotonEscuchar texto={`${q.partes[0]}${q.aux}${q.partes[1]}`} col={OK} />}
            </div>
          );
        })}
        {notaRev(avisoQ)}
        {rev[0] && rev[1] && (
          <>
            {sub("2 · Compara y elige")}
            <div className="mn-comparar">
              {dil.opciones.map((o) => (
                <button key={o.lado} className="mn-opt mn-lado" data-on={elegida === o.lado} disabled={resuelto} onClick={() => elegirLado(o.lado)} style={{ ["--mnc" as string]: elegida === o.lado ? modoCol : "rgba(255,255,255,0.3)", textAlign: "left", background: elegida === o.lado ? `${modoCol}1f` : "transparent" }}>
                  <div style={{ fontSize: 13, fontWeight: 900 }}>
                    {o.lado} · {o.verbo}
                  </div>
                  <div style={{ fontSize: 11, color: T.text3, fontWeight: 700, margin: "2px 0 4px" }}>{o.es}</div>
                  {o.datos.map((x) => (
                    <div key={x} style={{ fontSize: 11.5, color: T.text2, fontWeight: 700 }}>
                      • {x}
                    </div>
                  ))}
                  <div style={{ fontSize: 11.5, color: "#bae6fd", fontWeight: 700 }}>• {o.rasgo}</div>
                </button>
              ))}
            </div>
          </>
        )}
        {elegida && opActual && (
          <>
            {sub("3 · ¿Por qué? Arma la oración (toca las fichas en orden)")}
            <div className="mn-linea" data-e={resuelto ? "bien" : revE ? (revE.length ? "mal" : "bien") : ""}>
              {resuelto ? (
                <span style={{ fontSize: 14, color: OK, fontWeight: 900 }}>{oracion}</span>
              ) : fichas.length ? (
                fichas.map((f, i) => (
                  <button key={f} className="mn-ficha mn-puesta" onClick={() => quitarFicha(i)} title="Quitar">
                    {textoFichaElegir(dil, f)}
                  </button>
                ))
              ) : (
                <span style={{ fontSize: 12.5, color: T.text3 }}>Tu oración aparece aquí y sobre el tablero 3D. Toca una ficha colocada para quitarla.</span>
              )}
            </div>
            {!resuelto && (
              <div className="mn-opts mn-banco" style={{ marginTop: 10 }}>
                {(FICHAS_DILEMA[dIdx] ?? []).map((f) => (
                  <button key={f} className="mn-ficha" data-tipo={INICIOS.includes(f) ? "inicio" : f === "because" ? "because" : f.startsWith("r") ? "razon" : "frase"} disabled={fichas.includes(f)} onClick={() => ponerFicha(f)}>
                    {textoFichaElegir(dil, f)}
                  </button>
                ))}
              </div>
            )}
            <div className="mn-opts" style={{ marginTop: 10 }}>
              {!resuelto && <BotonComprobar onClick={comprobarEleccion} etq="Comprobar la oración" disabled={fichas.length === 0} col={modoCol} />}
              {!resuelto && (
                <button className="mn-opt" data-on="false" onClick={() => { setFichas([]); setRevE(null); }} style={{ ["--mnc" as string]: modoCol }}>
                  <i className="fa-solid fa-eraser" style={{ marginRight: 8 }} />
                  Borrar
                </button>
              )}
              {resuelto && <BotonEscuchar texto={oracion} col={OK} />}
              {resuelto && dIdx < DILEMAS.length - 1 && (
                <button className="mn-opt mn-sig" data-on="true" onClick={() => irDilema(dIdx + 1)} style={{ ["--mnc" as string]: modoCol }}>
                  Siguiente necesidad
                  <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
                </button>
              )}
            </div>
            {revE && revE.length > 0 && nota(revE.join(" "), WARN, "fa-lightbulb")}
            {resuelto && nota(<>¡Bien justificado! La razón es verdadera para la opción {elegida}. Las dos opciones eran válidas: lo importante es explicar tu elección con datos.</>, OK, "fa-circle-check")}
          </>
        )}
        {nota("Regla: I'd like + sustantivo · I'd like to + verbo · I'd rather + verbo (sin to).", T.text3)}
      </>
    );
  } else {
    const orden = ORDEN_RESPUESTAS[vIdx] ?? [0, 1, 2];
    control = (
      <>
        <div className="mn-opts">
          {VECINOS.map((x, i) => (
            <button key={x.id} className="mn-opt mn-vecino" data-on={i === vIdx} onClick={() => irVecino(i)} style={{ ["--mnc" as string]: x.camisa, background: i === vIdx ? `${x.camisa}22` : "transparent" }}>
              {x.nombre}
              {entregados.includes(x.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 6, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 800 }}>
            <span style={{ color: vec.camisa }}>{vec.nombre}:</span> «{vec.dice}»
          </div>
          <BotonEscuchar texto={vec.dice} col={vec.camisa} />
        </div>
        <div style={{ fontSize: 12, color: T.text3, marginTop: 3 }}>
          {vec.quien} · {vec.es}
        </div>
        {sub("1 · Responde con empatía")}
        <div style={{ display: "grid", gap: 7 }}>
          {orden.map((k) => {
            const r = vec.respuestas[k]!;
            const elegidaOk = empOk[vec.id] === r.en;
            return (
              <button key={k} className="mn-opt mn-emp" data-on={elegidaOk} disabled={!!empOk[vec.id]} onClick={() => elegirEmpatia(k)} style={{ ["--mnc" as string]: elegidaOk ? OK : modoCol, textAlign: "left", background: elegidaOk ? `${OK}14` : "transparent" }}>
                «{r.en}»
              </button>
            );
          })}
        </div>
        {avisoEmp && nota(avisoEmp, empOk[vec.id] ? OK : WARN, empOk[vec.id] ? "fa-circle-check" : "fa-lightbulb")}
        <div style={{ opacity: empOk[vec.id] ? 1 : 0.4, pointerEvents: empOk[vec.id] ? "auto" : "none" }}>
          {sub("2 · Ofrece ayuda (escríbelo)")}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Entrada {...{
              label: "Tu oferta de ayuda en inglés",
              value: ofertasOk[vec.id] ?? ofertaTxt,
              onChange: (v) => {
                setOfertaTxt(v);
                setOfertaAyudaRes(null);
              },
              onEnter: comprobarOferta,
              placeholder: "Would you like me to…? / Can I help you with…?",
              estado: ofertasOk[vec.id] ? { ok: true, msg: "" } : ofertaAyudaRes,
              disabled: !empOk[vec.id] || !!ofertasOk[vec.id],
            }} />
            {!ofertasOk[vec.id] && <BotonComprobar onClick={comprobarOferta} etq="Ofrecer" disabled={!empOk[vec.id]} col={modoCol} />}
          </div>
          {faseAcopio === "oferta" || ofertaAyudaRes?.ok ? notaRev(ofertaAyudaRes) : null}
        </div>
        <div style={{ opacity: ofertasOk[vec.id] ? 1 : 0.4, pointerEvents: faseAcopio === "caja" || faseAcopio === "listo" ? "auto" : "none" }}>
          {sub("3 · Arma su caja con lo que te dice")}
          {ofertasOk[vec.id] && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <div style={{ fontSize: 14.5, color: "#fbcfe8", fontWeight: 800 }}>
                {vec.nombre}: «{vec.contesta}»
              </div>
              <BotonEscuchar texto={vec.contesta} col={vec.camisa} />
            </div>
          )}
          <div className="mn-insumos">
            {INSUMOS.map((x) => (
              <div key={x.id} className="mn-insumo">
                <i className={`fa-solid ${x.icono}`} style={{ color: x.color, width: 16 }} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 800, color: "#fff" }}>{x.en}</span>
                <button className="mn-paso" aria-label={`Quitar ${x.en}`} onClick={() => cambiarCaja(x.id, -1)} disabled={faseAcopio !== "caja" || caja[x.id] === 0}>
                  −
                </button>
                <span style={{ minWidth: 18, textAlign: "center", fontWeight: 900, ...NUM }} aria-label={`Cantidad de ${x.en}`}>
                  {caja[x.id]}
                </span>
                <button className="mn-paso" aria-label={`Agregar ${x.en}`} onClick={() => cambiarCaja(x.id, 1)} disabled={faseAcopio !== "caja" || caja[x.id] >= x.max}>
                  +
                </button>
              </div>
            ))}
          </div>
          <div className="mn-opts" style={{ marginTop: 10 }}>
            {faseAcopio === "caja" && <BotonComprobar onClick={comprobarCaja} etq="Entregar la caja" col={modoCol} />}
            {faseAcopio === "listo" && vIdx < VECINOS.length - 1 && (
              <button className="mn-opt mn-sig" data-on="true" onClick={() => irVecino(vIdx + 1)} style={{ ["--mnc" as string]: modoCol }}>
                Siguiente vecino
                <i className="fa-solid fa-forward" style={{ marginLeft: 8 }} />
              </button>
            )}
          </div>
          {cajaRes && cajaRes.length > 0 && nota(cajaRes.join(" "), WARN, "fa-lightbulb")}
          {faseAcopio === "listo" && nota(`¡Entregada! ${vec.nombre} pidió ${textoPedido(vec)}.`, OK, "fa-circle-check")}
        </div>
        {nota("Empatía primero (I'm sorry to hear that · That sounds really hard · I understand how you feel, A8) y después una oferta concreta: Would you like me to…? · Can I help you with…?", T.text3)}
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes mnPulse { 0%,100%{ box-shadow:0 0 0 0 var(--mnd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .mn-live-dot { animation: mnPulse 1.6s ease-in-out infinite; }
        @keyframes mnShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-4px);} 75%{transform:translateX(4px);} }
        @media (prefers-reduced-motion: reduce){ .mn-live-dot { animation:none; } .mn-in[data-e="mal"], .mn-linea[data-e="mal"] { animation:none !important; } }
        .mn-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .mn-grid { grid-template-columns: 1fr; } }
        .mn-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .mn-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .mn-icobtn:hover { background:rgba(255,255,255,0.12); }
        .mn-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .mn-tab { cursor:pointer; border:1px solid var(--mnc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .mn-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .mn-tab:hover { background:rgba(255,255,255,0.06); }
        .mn-opts { display:flex; flex-wrap:wrap; gap:7px; align-items:center; }
        .mn-opt { cursor:pointer; border:1px solid var(--mnc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; font-family:inherit; }
        .mn-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.78); }
        .mn-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .mn-opt:disabled { cursor:default; }
        .mn-opt:disabled[data-on="false"] { opacity:0.55; }
        .mn-escuchar { cursor:pointer; border:1px solid var(--mnc); border-radius:999px; padding:5px 11px; font-size:11px; font-weight:800; color:#fff; background:rgba(4,10,22,0.45); transition:all .15s; }
        .mn-escuchar:hover { background:rgba(255,255,255,0.08); }
        .mn-in { border-radius:9px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:15px; font-weight:700; padding:8px 11px; font-family:inherit; outline:none; transition:all .15s; }
        .mn-in:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${color.rgba},0.18); }
        .mn-in:disabled { opacity:0.85; }
        .mn-in[data-e="bien"] { border-color:${OK}; background:${OK}1a; color:${OK}; }
        .mn-in[data-e="mal"] { border-color:${WARN}; background:${WARN}14; animation:mnShake .35s; }
        .mn-nota-lista { padding:12px 14px; border-radius:8px; background:linear-gradient(180deg,#fffbeb 0%,#fef3c7 100%); box-shadow:0 8px 20px -12px #000; transform:rotate(-0.4deg); }
        .mn-caja-paso { margin-top:12px; padding:2px 14px 14px; border-radius:12px; background:rgba(4,10,22,0.45); border:1px solid color-mix(in srgb, var(--mnc) 30%, transparent); }
        .mn-comparar { display:grid; grid-template-columns: 1fr 1fr; gap:8px; }
        @media (max-width: 560px){ .mn-comparar { grid-template-columns: 1fr; } }
        .mn-linea { min-height:48px; display:flex; flex-wrap:wrap; gap:7px; align-items:center; padding:9px 11px; border-radius:12px; border:1.5px dashed rgba(255,255,255,0.2); background:rgba(4,10,22,0.45); }
        .mn-linea[data-e="bien"] { border-style:solid; border-color:${OK}; }
        .mn-linea[data-e="mal"] { border-style:solid; border-color:${WARN}; animation:mnShake .35s; }
        .mn-ficha { cursor:pointer; border:1.5px solid rgba(255,255,255,0.22); border-radius:9px; padding:7px 11px; font-size:13px; font-weight:800; color:#fff; background:rgba(255,255,255,0.05); transition:all .14s; font-family:inherit; }
        .mn-ficha[data-tipo="inicio"] { border-color:#38bdf888; color:#bae6fd; }
        .mn-ficha[data-tipo="because"] { border-color:#fbbf2488; color:#fde68a; }
        .mn-ficha[data-tipo="razon"] { border-color:#34d39988; color:#bbf7d0; }
        .mn-ficha:hover:not(:disabled) { border-color:${accent}; background:rgba(${color.rgba},0.14); }
        .mn-ficha:disabled { opacity:0.3; cursor:default; }
        .mn-puesta { background:rgba(56,189,248,0.16); border-color:#38bdf8; }
        .mn-insumos { display:grid; grid-template-columns: repeat(auto-fill, minmax(190px,1fr)); gap:6px; }
        .mn-insumo { display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:10px; background:rgba(4,10,22,0.45); border:1px solid ${T.line}; }
        .mn-paso { cursor:pointer; width:28px; height:28px; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.05); color:#fff; font-size:16px; font-weight:900; line-height:1; font-family:inherit; }
        .mn-paso:disabled { opacity:0.3; cursor:default; }
        .mn-paso:hover:not(:disabled) { border-color:${accent}; }
        .mn-area { width:100%; box-sizing:border-box; border-radius:12px; border:1.5px solid ${T.lineStrong}; background:${T.inset}; color:#fff; font-size:14px; line-height:1.55; padding:12px 14px; font-family:inherit; outline:none; resize:vertical; }
        .mn-area:focus { border-color:var(--mnc); }
        .mn-opt:focus-visible, .mn-tab:focus-visible, .mn-icobtn:focus-visible, .mn-ficha:focus-visible, .mn-escuchar:focus-visible, .mn-paso:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .mn-bottom { grid-template-columns: 1fr !important; } }
        .mn-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .mn-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .mn-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .mn-drawer[data-open="true"] { transform:translateX(0); }
        .mn-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .mn-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .mn-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .mn-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .mn-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .mn-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        .mn-guia summary { cursor:pointer; color:${accent}; font-size:11.5px; font-weight:800; }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="mn-tabs">
          {MODOS.map((m) => {
            const dd = MODOS_DEF[m];
            const col = `#${dd.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="mn-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--mnc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{dd.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{dd.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mn-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(460px, 62vh, 700px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <MercadoScene
                vista={vista}
                modoColor={modoCol}
                resetNonce={resetNonce}
                comprados={comprados}
                seleccionado={sel}
                elegible={faseMercado === "lista"}
                dichoVendedor={dichoVendedor}
                dichoCliente={dichoCliente}
                ofertaIdx={faseMercado === "ofertas" ? ofertaIdx : -1}
                ofertasAceptadas={ofertasAcept}
                totalVisible={preguntado}
                pagado={pagado}
                onProducto={elegirProducto}
                dilemaIdx={dIdx}
                reveladas={rev}
                elegida={elegida}
                resuelto={resuelto}
                oracion={oracion}
                estadoOracion={resuelto ? "ok" : revE ? (revE.length ? "mal" : "ok") : null}
                onLado={elegirLado}
                vecinoIdx={vIdx}
                fase={faseAcopio}
                dichoTu={dichoTu}
                caja={caja}
                estadoCaja={cajaRes ? (cajaRes.length ? "mal" : "ok") : null}
                entregados={entregados}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="mn-live-dot" style={{ ["--mnd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="mn-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="mn-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="mn-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6, ...NUM }}>{pie}</div>
            </div>

            <button className="mn-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
              Controles — {def.etq}
            </Eyebrow>
            <div style={{ marginTop: 4 }}>{control}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-hand-holding-heart" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>What would you like? How can I help?</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />
              Lectura A1
            </Eyebrow>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 800, lineHeight: 1.4, marginBottom: 10 }}>{TITULO_A1}</div>
            <div style={{ display: "grid", gap: 9, marginBottom: 12 }}>
              {LECTURA_A1.map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: i === 1 || i === 2 ? "#fff" : T.text2, lineHeight: 1.55, whiteSpace: "pre-line" }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>COMPRENSIÓN</div>
            <div style={{ display: "grid", gap: 8 }}>
              {PREGUNTAS_A1.map((x) => (
                <details key={x.pregunta} className="mn-guia">
                  <summary>{x.pregunta}</summary>
                  <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45, marginTop: 4, paddingLeft: 12 }}>{x.respuesta}</div>
                </details>
              ))}
            </div>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="mn-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
            Hechos (verdadero o falso, A4)
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
            {HECHOS.map((h, i) => (
              <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                {h}
              </li>
            ))}
          </ul>
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
                  <span style={{ fontSize: 10, color: T.text3, marginLeft: 6 }}>#{gi.etiqueta}</span>
                  <div style={{ fontSize: 11.5, color: "#fff", lineHeight: 1.4, marginTop: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span>
                      <i className="fa-solid fa-quote-left" style={{ marginRight: 6, color: accent }} />
                      {gi.ejemplo}
                    </span>
                    <BotonEscuchar texto={gi.ejemplo} col={accent} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, marginTop: 10 }}>
              <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
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
          </div>
          <AutoevaluacionCard accent={accent} />
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Son <strong>verbatim</strong> del material de la plataforma: la lectura A1 con sus preguntas (sin la nota sobre el INEGI, que pertenece a otra asignatura), el quiz A2, la consigna, pistas y criterios de A3, los
          hechos A4, el glosario A5, el diálogo A6 (sin el espacio que dejaba el hueco antes de «?»), la autoevaluación A7 y la frase de empatía del video A8; los sustantivos de las estrellas vienen de A1, A2, A5 y A6. Son{" "}
          <strong>ilustrativos</strong>: Doña Carmen, Don Beto, los cinco vecinos, la colonia Las Flores y su centro de acopio (personas y lugares ficticios); los precios del tianguis, redondeados y del orden de un tianguis
          del centro de México en 2025 (cambian por región y temporada); y las cifras de los cuatro dilemas de la asamblea (costos, libros, años de sombra, familias y litros), elegidas para que la comparación sea clara, no
          cotizaciones reales. «Would rather», las medidas de los incontables, some / any y las fórmulas para ofrecer ayuda son ampliación del laboratorio. Fuente: {FUENTE}
        </span>
      </div>

      <ConteoCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <div style={{ marginTop: 22 }}>
        <RetoQuizCard quiz={QUIZ_A2} accent={accent} rgba={color.rgba} aprobado={quizOk} onAprobado={() => setQuizOk(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Ya usas would like, how much y how many." />
      </div>

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el diálogo (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoA6} onCompletado={() => { setTextoA6(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <TuTurnoCard accent={accent} logrado={a3Ok} onLogrado={() => setA3Ok(true)} playSfx={sfx} />

      <div className="mn-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="mn-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="mn-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="mn-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="mn-drawer-body">
          <FichaTeorica data={MERCADO_NECESIDADES_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
