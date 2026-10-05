"use client";

/**
 * Simulador «Find her / Find him» — IN-II-P04 (Describing people, clothes and
 * weather).
 *
 * El experimento: le describes en inglés a un amigo (FICTICIO) a una persona
 * que no conoce, entre seis que esperan en un lugar con clima. Cada frase que
 * eliges cambia lo que se VE: con la gramática correcta (be con adjetivo, have
 * con sustantivo, orden del adjetivo, present continuous para «ahora») el amigo
 * entiende y los candidatos que no encajan se apagan; con un error de gramática
 * el amigo no entiende, nadie se descarta y se le acaba la paciencia.
 *
 * Personas y lugares de la escena: ficticios (los lugares son solo ambientación).
 */

import { useState } from "react";
import { T, OK } from "./_kit";
import type { Condicion } from "./describir-personas-clima-data";

const NO = "#FF5E5E";
export const RUTA_SIM = "/media/labs-sim/describir-personas-clima-ingles";

export type Alt = "alta" | "baja";
export type Pelo = "largo" | "corto";
export type Extra = "none" | "scarf" | "cap";
export type TipoRopa = "jacket" | "tshirt";

export interface PersonaBusca {
  id: string;
  nombre: string;
  alt: Alt;
  pelo: Pelo;
  lentes: boolean;
  extra: Extra;
  /** Id de la prenda: «big-red-jacket». */
  ropa: string;
  tipo: TipoRopa;
  color: string;
  grande: boolean;
}

type Campo = "alt" | "pelo" | "lentes" | "extra" | "ropa";

export interface OpcionTurno {
  texto: string;
  ok: boolean;
  /** Por qué sí / por qué no, en español. */
  porque: string;
  /** Lo que contesta el amigo, en inglés. */
  reaccion: string;
}

export interface TurnoBusca {
  /** Lo que pregunta el amigo. */
  pregunta: string;
  /** Qué atributos descarta la frase CORRECTA. */
  filtra: [Campo, string | boolean][];
  opciones: OpcionTurno[];
}

export interface CasoBusca {
  id: string;
  lugar: string;
  condicion: Condicion;
  clima: string;
  amigo: string;
  pronombre: "She" | "He";
  objetivo: string;
  foto: string;
  personas: PersonaBusca[];
  turnos: TurnoBusca[];
}

const P = (
  id: string, nombre: string, alt: Alt, pelo: Pelo, lentes: boolean, extra: Extra,
  ropa: string, tipo: TipoRopa, color: string, grande: boolean,
): PersonaBusca => ({ id, nombre, alt, pelo, lentes, extra, ropa, tipo, color, grande });

export const CASOS_BUSCA: CasoBusca[] = [
  {
    id: "lluvia",
    lugar: "La parada del camión",
    condicion: "raining",
    clima: "It's raining",
    amigo: "Bruno",
    pronombre: "She",
    objetivo: "mariana",
    foto: "parada-lluvia",
    personas: [
      P("mariana", "Mariana", "alta", "largo", true, "none", "big-red-jacket", "jacket", "#EF4444", true),
      P("lucia", "Lucía", "alta", "largo", true, "none", "small-red-jacket", "jacket", "#EF4444", false),
      P("ana", "Ana", "alta", "largo", false, "none", "big-red-jacket", "jacket", "#EF4444", true),
      P("paola", "Paola", "baja", "largo", true, "none", "big-red-jacket", "jacket", "#EF4444", true),
      P("sofia", "Sofía", "baja", "corto", true, "none", "big-blue-jacket", "jacket", "#3B82F6", true),
      P("daniela", "Daniela", "alta", "corto", false, "none", "big-red-jacket", "jacket", "#EF4444", true),
    ],
    turnos: [
      {
        pregunta: "I'm at the bus stop. Is she tall or short? What about her hair?",
        filtra: [["alt", "alta"], ["pelo", "largo"]],
        opciones: [
          { texto: "She's tall and she has long hair.", ok: true, porque: "«Tall» es un adjetivo: va con be (is). «Hair» es un sustantivo: va con have, y con she se vuelve has.", reaccion: "Oh, tall with long hair. Now I can rule out some people." },
          { texto: "She has tall and she is long hair.", ok: false, porque: "Cruzaste los verbos: adjetivo → be, sustantivo → have. No existe «has tall» ni «is long hair».", reaccion: "Sorry? She has tall? I don't understand." },
          { texto: "She have long hair and she's tall.", ok: false, porque: "Con he / she / it, have se convierte en has: she has.", reaccion: "Hmm, «she have»... Can you say it again?" },
        ],
      },
      {
        pregunta: "OK, three people are left. Does she wear glasses?",
        filtra: [["lentes", true]],
        opciones: [
          { texto: "She is glasses.", ok: false, porque: "«Glasses» es un sustantivo, no un adjetivo: no va con be.", reaccion: "She IS glasses? I'm confused." },
          { texto: "She has glasses.", ok: true, porque: "Sustantivo (glasses) → have; con she, has.", reaccion: "Got it, glasses! Two people left." },
          { texto: "She is have glasses.", ok: false, porque: "Nunca van be y have juntos: elige uno según la clase de palabra que sigue.", reaccion: "«Is have»? That doesn't sound right." },
        ],
      },
      {
        pregunta: "Two women look similar. What is she wearing?",
        filtra: [["ropa", "big-red-jacket"]],
        opciones: [
          { texto: "She's wearing a red big jacket.", ok: false, porque: "El tamaño va antes que el color: big red, nunca red big.", reaccion: "A «red big» jacket? That sounds strange to me." },
          { texto: "She wears a big red jacket right now.", ok: false, porque: "«Right now» pide present continuous (is wearing), no present simple.", reaccion: "Right now? She «wears»? I can't tell what you mean." },
          { texto: "She's wearing a big red jacket.", ok: true, porque: "Present continuous para lo que trae puesto AHORA y orden correcto: tamaño → color → sustantivo.", reaccion: "A big red jacket. I see her. Thank you!" },
        ],
      },
    ],
  },
  {
    id: "calor",
    lugar: "La plaza al mediodía",
    condicion: "hot",
    clima: "It's hot and sunny",
    amigo: "Renata",
    pronombre: "He",
    objetivo: "marco",
    foto: "plaza-calor",
    personas: [
      P("marco", "Marco", "baja", "corto", false, "cap", "new-blue-cotton-tshirt", "tshirt", "#3B82F6", false),
      P("luis", "Luis", "baja", "corto", false, "cap", "old-blue-cotton-tshirt", "tshirt", "#3B82F6", false),
      P("pablo", "Pablo", "baja", "corto", false, "none", "new-blue-cotton-tshirt", "tshirt", "#3B82F6", false),
      P("ivan", "Iván", "alta", "corto", false, "cap", "new-blue-cotton-tshirt", "tshirt", "#3B82F6", false),
      P("hugo", "Hugo", "baja", "largo", true, "cap", "new-blue-cotton-tshirt", "tshirt", "#3B82F6", false),
      P("tomas", "Tomás", "alta", "largo", false, "none", "new-white-cotton-tshirt", "tshirt", "#E2E8F0", false),
    ],
    turnos: [
      {
        pregunta: "I'm in the plaza. How tall is he? What about his hair?",
        filtra: [["alt", "baja"], ["pelo", "corto"]],
        opciones: [
          { texto: "He's short and he's short hair.", ok: false, porque: "«Hair» es sustantivo: no va con be. Lo correcto es he has short hair.", reaccion: "He IS short hair? Sorry, I don't get it." },
          { texto: "He's short and he has short hair.", ok: true, porque: "Adjetivo (short) → be; sustantivo (hair) → have, y con he se vuelve has.", reaccion: "Short, with short hair. That helps a lot." },
          { texto: "He have short hair and he's short.", ok: false, porque: "Con he / she / it, have se convierte en has.", reaccion: "«He have»? Can you repeat that?" },
        ],
      },
      {
        pregunta: "Still three guys. Is he wearing something on his head?",
        filtra: [["extra", "cap"]],
        opciones: [
          { texto: "He's wearing a cap because it's sunny.", ok: true, porque: "Present continuous (is wearing) para ahora, artículo a y la razón con because it's…", reaccion: "A cap! Now only two guys." },
          { texto: "He is wear a cap because it's hot.", ok: false, porque: "Después de is se usa la forma -ing: is wearing, no «is wear».", reaccion: "«Is wear»? I don't understand." },
          { texto: "He's wearing cap because it's sunny.", ok: false, porque: "Falta el artículo: a cap. El sustantivo contable en singular lo necesita.", reaccion: "Cap? A cap? Please say it complete." },
        ],
      },
      {
        pregunta: "Both wear blue. What's he wearing exactly?",
        filtra: [["ropa", "new-blue-cotton-tshirt"]],
        opciones: [
          { texto: "He's wearing a cotton new blue T-shirt.", ok: false, porque: "El orden es edad → color → material: new blue cotton, no cotton new blue.", reaccion: "A «cotton new blue» T-shirt? That sounds odd." },
          { texto: "He's wearing a new blue cotton T-shirt.", ok: true, porque: "Orden correcto: edad → color → material → sustantivo.", reaccion: "New, blue, cotton. I see him! Thanks." },
          { texto: "He wears a new blue cotton T-shirt at the moment.", ok: false, porque: "«At the moment» pide present continuous: he's wearing.", reaccion: "At the moment he «wears»? I can't follow." },
        ],
      },
    ],
  },
  {
    id: "viento",
    lugar: "El mirador del parque eólico",
    condicion: "windy",
    clima: "It's windy",
    amigo: "Iker",
    pronombre: "She",
    objetivo: "valeria",
    foto: "viento-eolico",
    personas: [
      P("valeria", "Valeria", "baja", "corto", true, "scarf", "old-brown-leather-jacket", "jacket", "#92400E", false),
      P("camila", "Camila", "alta", "corto", true, "scarf", "new-brown-leather-jacket", "jacket", "#92400E", false),
      P("regina", "Regina", "baja", "corto", true, "scarf", "old-black-leather-jacket", "jacket", "#1F2937", false),
      P("fernanda", "Fernanda", "baja", "largo", true, "scarf", "old-brown-leather-jacket", "jacket", "#92400E", false),
      P("julia", "Julia", "baja", "corto", true, "none", "old-brown-leather-jacket", "jacket", "#92400E", false),
      P("karla", "Karla", "alta", "largo", false, "none", "old-brown-leather-jacket", "jacket", "#92400E", false),
    ],
    turnos: [
      {
        pregunta: "It's very windy up here. What does she wear on her neck?",
        filtra: [["extra", "scarf"]],
        opciones: [
          { texto: "She is wear a scarf because it's windy.", ok: false, porque: "Después de is se usa -ing: is wearing.", reaccion: "«Is wear»? Sorry, what do you mean?" },
          { texto: "She wears a scarf right now because it's windy.", ok: false, porque: "«Right now» pide present continuous (is wearing); present simple es para hábitos.", reaccion: "Right now she «wears»? I'm lost." },
          { texto: "She's wearing a scarf because it's windy.", ok: true, porque: "Present continuous para lo de ahora, y la razón del clima con because it's windy.", reaccion: "A scarf, of course, because of the wind! Fewer people now." },
        ],
      },
      {
        pregunta: "Four women have scarves. What about her hair and eyes?",
        filtra: [["pelo", "corto"], ["lentes", true]],
        opciones: [
          { texto: "She is short hair and glasses.", ok: false, porque: "Hair y glasses son sustantivos: van con have (has), no con be.", reaccion: "She IS short hair? That's confusing." },
          { texto: "She have short hair and glasses.", ok: false, porque: "Con she el verbo es has, no have.", reaccion: "«She have»... please say it again." },
          { texto: "She has short hair and glasses.", ok: true, porque: "Sustantivos (hair, glasses) → have; con she, has.", reaccion: "Short hair and glasses. Three women left!" },
        ],
      },
      {
        pregunta: "Almost there! Tell me about her jacket.",
        filtra: [["ropa", "old-brown-leather-jacket"]],
        opciones: [
          { texto: "She's wearing a leather old brown jacket.", ok: false, porque: "Orden: edad → color → material → sustantivo. Es old brown leather.", reaccion: "A «leather old brown» jacket? That sounds wrong." },
          { texto: "She's wearing a old brown leather jacket.", ok: false, porque: "Antes de vocal (old) el artículo es an, no a.", reaccion: "A old? An old... I think you mean an old jacket?" },
          { texto: "She's wearing an old brown leather jacket.", ok: true, porque: "an antes de vocal y orden edad → color → material.", reaccion: "An old brown leather jacket. I found her!" },
        ],
      },
    ],
  },
];

export const TOTAL_CASOS_BUSCA = CASOS_BUSCA.length;

const coincide = (p: PersonaBusca, filtra: TurnoBusca["filtra"]) => filtra.every(([c, v]) => p[c] === v);

/** Candidatos que quedan tras aplicar los `n` primeros turnos (correctos). */
export function candidatos(caso: CasoBusca, n: number): PersonaBusca[] {
  return caso.personas.filter((p) => caso.turnos.slice(0, n).every((t) => coincide(p, t.filtra)));
}

const CIELO: Record<Condicion, string> = {
  raining: "linear-gradient(180deg,#334155 0%,#1E293B 70%,#0F172A 100%)",
  snowing: "linear-gradient(180deg,#475569 0%,#334155 70%,#1E293B 100%)",
  hot: "linear-gradient(180deg,#0EA5E9 0%,#7DD3FC 60%,#FDE68A 100%)",
  windy: "linear-gradient(180deg,#0C4A6E 0%,#0369A1 60%,#075985 100%)",
};
const ICONO_CLIMA: Record<Condicion, string> = {
  raining: "fa-cloud-showers-heavy",
  snowing: "fa-snowflake",
  hot: "fa-sun",
  windy: "fa-wind",
};

/** Figura simple. La estatura, el cabello, los lentes, la prenda y su tamaño se VEN. */
export function FiguraPersona({ p }: { p: PersonaBusca }) {
  const k = p.alt === "alta" ? 1 : 0.84;
  const ancho = p.grande ? 50 : 38;
  const x0 = 50 - ancho / 2;
  const largaManga = p.tipo === "jacket";
  return (
    <svg viewBox="0 0 100 150" width="100%" style={{ display: "block", maxHeight: 150 }} role="img" aria-label={`${p.nombre}`}>
      <g transform={`translate(${50 * (1 - k)} ${146 * (1 - k)}) scale(${k})`}>
        <rect x="38" y="104" width="10" height="38" rx="4" fill="#334155" />
        <rect x="52" y="104" width="10" height="38" rx="4" fill="#334155" />
        {/* cabello largo detrás del torso */}
        {p.pelo === "largo" && <rect x="35" y="24" width="30" height="52" rx="10" fill="#3F3A38" />}
        {/* torso y mangas */}
        <rect x={x0} y="52" width={ancho} height={largaManga ? 60 : 48} rx="9" fill={p.color} />
        <rect x={x0 - 9} y="54" width="10" height={largaManga ? 46 : 18} rx="5" fill={p.color} />
        <rect x={x0 + ancho - 1} y="54" width="10" height={largaManga ? 46 : 18} rx="5" fill={p.color} />
        <circle cx={x0 - 4} cy={largaManga ? 102 : 76} r="5" fill="#E0B48A" />
        <circle cx={x0 + ancho + 4} cy={largaManga ? 102 : 76} r="5" fill="#E0B48A" />
        {/* bufanda */}
        {p.extra === "scarf" && (
          <g fill="#F472B6">
            <rect x="38" y="48" width="24" height="9" rx="4" />
            <rect x="52" y="54" width="8" height="22" rx="3" />
          </g>
        )}
        {/* cabeza */}
        <circle cx="50" cy="36" r="14" fill="#E0B48A" />
        <path d="M36 34 A14 14 0 0 1 64 34 L60 30 L40 30 Z" fill="#3F3A38" />
        {p.extra === "cap" && (
          <g fill="#EF4444">
            <path d="M36 32 A14 14 0 0 1 64 32 Z" />
            <rect x="58" y="29" width="18" height="5" rx="2.5" />
          </g>
        )}
        {p.lentes && (
          <g fill="none" stroke="#111827" strokeWidth="2">
            <circle cx="44" cy="38" r="5" />
            <circle cx="56" cy="38" r="5" />
            <line x1="49" y1="38" x2="51" y2="38" />
          </g>
        )}
        {!p.lentes && (
          <g fill="#0F172A">
            <circle cx="45" cy="38" r="1.8" />
            <circle cx="55" cy="38" r="1.8" />
          </g>
        )}
      </g>
    </svg>
  );
}

interface Mensaje {
  mal: boolean;
  txt: string;
  amigo: string;
}

interface Props {
  accent: string;
  rgba: string;
  resueltos: Record<string, boolean>;
  onResuelto: (id: string) => void;
  onAcierto: () => void;
  onError: () => void;
  onGanar: () => void;
}

const PACIENCIA_MAX = 3;

export function BuscaPersona({ accent, rgba, resueltos, onResuelto, onAcierto, onError, onGanar }: Props) {
  const [casoIdx, setCasoIdx] = useState(() => {
    const i = CASOS_BUSCA.findIndex((c) => !resueltos[c.id]);
    return i < 0 ? 0 : i;
  });
  const [turno, setTurno] = useState(0);
  const [paciencia, setPaciencia] = useState(PACIENCIA_MAX);
  const [msg, setMsg] = useState<Mensaje | null>(null);

  const caso = CASOS_BUSCA[casoIdx]!;
  const objetivo = caso.personas.find((p) => p.id === caso.objetivo)!;
  const encontrado = turno >= caso.turnos.length;
  const quedan = candidatos(caso, turno);
  const t = caso.turnos[turno];

  const irCaso = (i: number) => {
    setCasoIdx(i);
    setTurno(0);
    setPaciencia(PACIENCIA_MAX);
    setMsg(null);
  };

  const elegir = (op: OpcionTurno) => {
    if (!t) return;
    if (op.ok) {
      const sig = turno + 1;
      setTurno(sig);
      setMsg({ mal: false, txt: op.porque, amigo: op.reaccion });
      onAcierto();
      if (sig >= caso.turnos.length) {
        onResuelto(caso.id);
        if (CASOS_BUSCA.every((c) => c.id === caso.id || resueltos[c.id])) onGanar();
      }
    } else {
      onError();
      const resto = paciencia - 1;
      if (resto <= 0) {
        setTurno(0);
        setPaciencia(PACIENCIA_MAX);
        setMsg({ mal: true, txt: `${op.porque} A ${caso.amigo} se le acabó la paciencia y se fue a buscar solo: vuelve a empezar la descripción.`, amigo: op.reaccion });
      } else {
        setPaciencia(resto);
        setMsg({ mal: true, txt: op.porque, amigo: op.reaccion });
      }
    }
  };

  return (
    <div className="dpb">
      <style>{`
        .dpb { display:flex; flex-direction:column; gap:14px; min-width:0; }
        .dpb-casos { display:flex; gap:8px; flex-wrap:wrap; }
        .dpb-caso { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:9px 14px; border-radius:11px; border:1px solid ${T.line};
          background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; }
        .dpb-caso[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); color:#fff; }
        .dpb-caso[data-done="true"] { color:${OK}; border-color:${OK}66; }
        .dpb-clima { position:relative; overflow:hidden; border-radius:16px; border:1px solid ${T.line}; padding:14px 16px; min-height:112px;
          display:flex; flex-direction:column; gap:10px; justify-content:flex-end; }
        .dpb-clima img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.55; }
        .dpb-clima-ico { position:absolute; right:16px; top:12px; font-size:34px; color:rgba(255,255,255,0.5); }
        .dpb-clima > *:not(img):not(.dpb-clima-ico) { position:relative; }
        .dpb-lugar { font-size:14px; font-weight:900; color:#fff; text-shadow:0 1px 6px rgba(0,0,0,0.7); }
        .dpb-burbuja { position:relative; align-self:flex-start; max-width:100%; padding:10px 14px; border-radius:14px 14px 14px 4px;
          background:rgba(4,10,22,0.82); border:1px solid ${T.lineStrong}; color:#fff; font-size:15px; font-weight:700; line-height:1.4; }
        .dpb-burbuja span { display:block; font-size:14px; font-weight:800; color:${accent}; margin-bottom:2px; }
        .dpb-multitud { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 104px), 1fr)); gap:10px; }
        .dpb-pers { position:relative; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glassSoft}; padding:8px 6px 8px; text-align:center;
          transition:opacity .35s, filter .35s, border-color .25s; display:flex; flex-direction:column; justify-content:flex-end; }
        .dpb-pers[data-fuera="true"] { opacity:.2; filter:grayscale(1); }
        .dpb-pers[data-objetivo="true"] { border-color:${accent}; box-shadow:0 0 18px -6px ${accent}; }
        .dpb-pers[data-hallada="true"] { border-color:${OK}; background:${OK}18; box-shadow:0 0 22px -6px ${OK}; }
        .dpb-pers strong { font-size:14px; font-weight:800; color:#fff; }
        .dpb-busca { position:absolute; top:-9px; left:50%; transform:translateX(-50%); white-space:nowrap; padding:2px 9px; border-radius:999px;
          background:${accent}; color:#04121f; font-size:14px; font-weight:900; }
        .dpb-pace { display:inline-flex; gap:6px; align-items:center; font-size:14px; font-weight:800; color:${T.text2}; }
        .dpb-pace i { font-size:16px; }
        .dpb-op { cursor:pointer; text-align:left; padding:12px 15px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.inset}; color:#fff;
          font-size:15px; font-weight:700; line-height:1.4; font-family:inherit; transition:all .14s; }
        .dpb-op:hover { border-color:${accent}; transform:translateY(-1px); }
        .dpb-fb { border-radius:13px; padding:12px 14px; display:flex; gap:11px; font-size:14px; line-height:1.5; color:${T.text2}; }
        @media (prefers-reduced-motion: reduce){ .dpb-pers, .dpb-op:hover { transition:none; transform:none; } }
      `}</style>

      <div className="dpb-casos">
        {CASOS_BUSCA.map((c, i) => (
          <button key={c.id} type="button" className="dpb-caso" data-on={casoIdx === i} data-done={!!resueltos[c.id]} onClick={() => irCaso(i)}>
            <i className={`fa-solid ${resueltos[c.id] ? "fa-circle-check" : ICONO_CLIMA[c.condicion]}`} />
            Caso {i + 1}
          </button>
        ))}
      </div>

      <div className="dpb-clima" style={{ background: CIELO[caso.condicion] }}>
        <i className={`fa-solid ${ICONO_CLIMA[caso.condicion]} dpb-clima-ico`} aria-hidden />
        <img src={`${RUTA_SIM}/${caso.foto}.webp`} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = "none")} />
        <div className="dpb-lugar">{caso.lugar} · {caso.clima}</div>
        <div className="dpb-burbuja">
          <span>{caso.amigo} (tu amigo{caso.amigo === "Renata" ? "a" : ""})</span>
          {msg ? msg.amigo : `Hi! I don't know ${objetivo.nombre}. Can you describe ${caso.pronombre === "He" ? "him" : "her"}?`}
          {!encontrado && t ? ` ${t.pregunta}` : ""}
        </div>
      </div>

      <div className="dpb-multitud" role="list" aria-label="Las personas del lugar">
        {caso.personas.map((p) => {
          const fuera = !quedan.includes(p);
          const esObjetivo = p.id === caso.objetivo;
          return (
            <div key={p.id} role="listitem" className="dpb-pers" data-fuera={fuera} data-objetivo={esObjetivo} data-hallada={encontrado && esObjetivo}>
              {esObjetivo && <span className="dpb-busca">★ Busca</span>}
              <FiguraPersona p={p} />
              <strong>{p.nombre}</strong>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>
          Quedan {quedan.length} de {caso.personas.length} posibles
        </span>
        <span className="dpb-pace" aria-label={`Paciencia de ${caso.amigo}: ${paciencia} de ${PACIENCIA_MAX}`}>
          Paciencia de {caso.amigo}
          {Array.from({ length: PACIENCIA_MAX }, (_, i) => (
            <i key={i} className="fa-solid fa-heart" style={{ color: i < paciencia ? NO : "rgba(255,255,255,0.18)" }} />
          ))}
        </span>
      </div>

      {encontrado ? (
        <div className="dpb-fb" style={{ border: `1px solid ${OK}55`, background: `${OK}12` }}>
          <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 17, marginTop: 2 }} />
          <span>
            <strong style={{ color: "#fff" }}>{caso.amigo} encontró a {objetivo.nombre}.</strong> Tus {caso.turnos.length} frases dejaron un solo candidato porque la gramática fue
            correcta en cada una.{" "}
            {casoIdx < CASOS_BUSCA.length - 1 && (
              <button type="button" className="dpb-caso" style={{ marginTop: 8 }} onClick={() => irCaso(casoIdx + 1)}>
                Siguiente caso <i className="fa-solid fa-arrow-right" />
              </button>
            )}
          </span>
        </div>
      ) : (
        t && (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>
              Describe a {objetivo.nombre} ({caso.pronombre === "He" ? "he" : "she"}): elige la frase que {caso.amigo} sí entiende
            </div>
            {t.opciones.map((op) => (
              <button key={op.texto} type="button" className="dpb-op" onClick={() => elegir(op)}>
                {op.texto}
              </button>
            ))}
          </div>
        )
      )}

      {msg && (
        <div className="dpb-fb" style={{ border: `1px solid ${msg.mal ? `${NO}55` : `rgba(${rgba},0.32)`}`, background: msg.mal ? `${NO}12` : `rgba(${rgba},0.09)` }}>
          <i className={`fa-solid ${msg.mal ? "fa-circle-xmark" : "fa-circle-info"}`} style={{ color: msg.mal ? NO : accent, fontSize: 17, marginTop: 2 }} />
          <span>{msg.txt}</span>
        </div>
      )}
    </div>
  );
}
