"use client";

/**
 * Simulador «Radio Prepa» — IN-II-P02 (Free time activities).
 *
 * El experimento: eres el entrevistador de una radio escolar ficticia y le
 * cuentas al público qué hace cada persona en su tiempo libre. Cada frase que
 * eliges cambia lo que se VE: si la -s de la tercera persona, el auxiliar o el
 * adverbio están bien, la casilla de la agenda de esa persona se llena con su
 * actividad; si hay un error, entra estática, la casilla queda con ruido y la
 * señal de la radio pierde una barra. Sin señal, la entrevista se repite.
 *
 * Personas, nombres y la radio son FICTICIOS.
 */

import { useState } from "react";
import { T, OK } from "./_kit";

const NO = "#FF5E5E";
export const RUTA_RADIO = "/media/labs-sim/tiempo-libre-ingles";

export interface OpcionRadio {
  texto: string;
  ok: boolean;
  /** Por qué sí / por qué no, en español. */
  porque: string;
  /** Lo que entiende el público, en inglés. */
  oyente: string;
}

export interface TurnoRadio {
  pregunta: string;
  actividad: { icono: string; etiqueta: string; cuando: string; niega?: boolean };
  opciones: OpcionRadio[];
}

export interface EntrevistaRadio {
  id: string;
  titulo: string;
  invitado: string;
  foto: string;
  tono: string;
  turnos: TurnoRadio[];
}

export const ENTREVISTAS: EntrevistaRadio[] = [
  {
    id: "ana",
    titulo: "Ana, la jugadora",
    invitado: "Ana",
    foto: "estudio-radio",
    tono: "#7C3AED",
    turnos: [
      {
        pregunta: "Welcome to Radio Prepa! What does Ana do on Saturdays?",
        actividad: { icono: "fa-futbol", etiqueta: "soccer", cuando: "Saturday" },
        opciones: [
          { texto: "She plays soccer with her friends.", ok: true, porque: "Ana es she (tercera persona del singular): el verbo lleva -s. Play termina en vocal + y, así que solo agrega -s.", oyente: "Soccer on Saturdays! Great." },
          { texto: "She play soccer with her friends.", ok: false, porque: "Con he / she / it el verbo en presente simple lleva -s: plays.", oyente: "Who play soccer? The signal is breaking up..." },
          { texto: "She does plays soccer with her friends.", ok: false, porque: "Does ya marca la tercera persona y no se usa en las afirmativas; el verbo no lleva -s.", oyente: "«Does plays»? I can't understand." },
        ],
      },
      {
        pregunta: "And how does she prepare for her exams?",
        actividad: { icono: "fa-book", etiqueta: "study English", cuando: "every day" },
        opciones: [
          { texto: "She studys English every day.", ok: false, porque: "Study termina en consonante + y: la y cambia a i y se agrega -es (studies).", oyente: "«Studys»? That word doesn't exist." },
          { texto: "She studies English every day.", ok: true, porque: "Consonante + y: la y cambia a ies.", oyente: "Studying English every day. Very good!" },
          { texto: "She study English every day.", ok: false, porque: "Con she el verbo se marca: studies.", oyente: "She study? Please say it again." },
        ],
      },
      {
        pregunta: "Does Ana watch a lot of TV?",
        actividad: { icono: "fa-tv", etiqueta: "TV", cuando: "never", niega: true },
        opciones: [
          { texto: "No, she doesn't watches TV.", ok: false, porque: "La -s ya viajó a doesn't; el verbo vuelve a su forma base: watch.", oyente: "Doesn't watches? I'm confused." },
          { texto: "No, she doesn't watch TV.", ok: true, porque: "Negativa con she: doesn't + verbo en forma base.", oyente: "No TV for Ana. Understood!" },
          { texto: "No, she don't watch TV.", ok: false, porque: "Con she el auxiliar es doesn't, no don't.", oyente: "She don't? Something is wrong with the line." },
        ],
      },
      {
        pregunta: "Where does she go on Sunday mornings?",
        actividad: { icono: "fa-tree", etiqueta: "the park", cuando: "usually" },
        opciones: [
          { texto: "She goes usually to the park.", ok: false, porque: "El adverbio de frecuencia va antes del verbo principal, no después.", oyente: "Hmm, that sounds a little odd." },
          { texto: "She usually go to the park.", ok: false, porque: "Con she el verbo lleva -es: go → goes.", oyente: "She usually go? I lost the end of that." },
          { texto: "She usually goes to the park.", ok: true, porque: "El adverbio va antes del verbo principal y go termina en -o: goes.", oyente: "The park on Sundays. Nice!" },
        ],
      },
    ],
  },
  {
    id: "torres",
    titulo: "La familia Torres",
    invitado: "los Torres",
    foto: "tianguis-domingo",
    tono: "#F59E0B",
    turnos: [
      {
        pregunta: "What does Luis do after school?",
        actividad: { icono: "fa-bicycle", etiqueta: "fix bikes", cuando: "weekdays" },
        opciones: [
          { texto: "He fix bikes at the tianguis.", ok: false, porque: "Con he el verbo lleva marca de tercera persona: fixes.", oyente: "He fix bikes? The line is noisy." },
          { texto: "He fixs bikes at the tianguis.", ok: false, porque: "Tras -x se agrega -es, no solo -s (fixs no se puede pronunciar).", oyente: "«Fixs»? I didn't catch that word." },
          { texto: "He fixes bikes at the tianguis.", ok: true, porque: "Los verbos que terminan en -x agregan -es.", oyente: "Fixing bikes after school. Cool job!" },
        ],
      },
      {
        pregunta: "And his parents? What do they do on Sundays?",
        actividad: { icono: "fa-utensils", etiqueta: "cook", cuando: "Sunday" },
        opciones: [
          { texto: "They cooks on Sundays.", ok: false, porque: "They es plural: el verbo no lleva -s. La -s es solo para he / she / it.", oyente: "They cooks? Too many people for one «s»." },
          { texto: "They cook on Sundays.", ok: true, porque: "Con they el verbo queda en forma base.", oyente: "A family Sunday lunch. Lovely!" },
          { texto: "They does cook on Sundays.", ok: false, porque: "En las afirmativas no se usa does, y con they ni siquiera sería la forma correcta.", oyente: "They «does»? I can't follow you." },
        ],
      },
      {
        pregunta: "Is Luis busy all the time?",
        actividad: { icono: "fa-clock", etiqueta: "busy", cuando: "always" },
        opciones: [
          { texto: "He always is busy.", ok: false, porque: "Con el verbo to be el adverbio de frecuencia va DESPUÉS: is always.", oyente: "«Always is»? That sounds strange." },
          { texto: "He always be busy.", ok: false, porque: "Con he, to be es is (no be), y el adverbio va después.", oyente: "«He be»? The signal is bad." },
          { texto: "He is always busy.", ok: true, porque: "Con to be, el adverbio va después del verbo.", oyente: "Always busy. I understand!" },
        ],
      },
      {
        pregunta: "Does his sister play any sport?",
        actividad: { icono: "fa-person-swimming", etiqueta: "swim", cuando: "Friday" },
        opciones: [
          { texto: "Yes, she swim on Fridays.", ok: false, porque: "Con she el verbo lleva -s: swims.", oyente: "She swim? I need the ending of that verb." },
          { texto: "Yes, she does swims on Fridays.", ok: false, porque: "En una afirmativa no se agrega does; el verbo lleva la -s: swims.", oyente: "«Does swims»? I'm lost." },
          { texto: "Yes, she swims on Fridays.", ok: true, porque: "Tercera persona: swim + s.", oyente: "Swimming on Fridays. Splash!" },
        ],
      },
    ],
  },
  {
    id: "mia",
    titulo: "Mía, la artista",
    invitado: "Mía",
    foto: "taller-arte",
    tono: "#14B8A6",
    turnos: [
      {
        pregunta: "You want to know if Mía paints. Ask her.",
        actividad: { icono: "fa-palette", etiqueta: "paint?", cuando: "Sunday" },
        opciones: [
          { texto: "Do she paint on Sundays?", ok: false, porque: "Con she el auxiliar es Does, no Do.", oyente: "«Do she»? Could you repeat the question?" },
          { texto: "Does she paints on Sundays?", ok: false, porque: "En la pregunta la -s viaja a Does; el verbo queda en base: paint.", oyente: "«Does she paints»? That question is unclear." },
          { texto: "Does she paint on Sundays?", ok: true, porque: "Does + sujeto + verbo en forma base.", oyente: "Good question! Let me answer..." },
        ],
      },
      {
        pregunta: "She says no. What does Mía do instead?",
        actividad: { icono: "fa-music", etiqueta: "dance", cuando: "Sunday" },
        opciones: [
          { texto: "No, she doesn't paint. She dances.", ok: true, porque: "Negativa con doesn't + verbo base; en la afirmativa dances lleva -s.", oyente: "No painting, but dancing. Got it!" },
          { texto: "No, she doesn't paints. She dances.", ok: false, porque: "Tras doesn't el verbo queda en base: paint.", oyente: "Doesn't paints? I'm confused." },
          { texto: "No, she don't paint. She dances.", ok: false, porque: "Con she el auxiliar negativo es doesn't.", oyente: "«She don't»? The line is cutting out." },
        ],
      },
      {
        pregunta: "What does she do every Saturday night?",
        actividad: { icono: "fa-film", etiqueta: "watch movies", cuando: "Saturday" },
        opciones: [
          { texto: "She watchs movies with her cousin.", ok: false, porque: "Los verbos que terminan en -ch agregan -es: watches.", oyente: "«Watchs»? Nobody can say that." },
          { texto: "She watch movies with her cousin.", ok: false, porque: "Con she el verbo lleva marca: watches.", oyente: "She watch? Please repeat." },
          { texto: "She watches movies with her cousin.", ok: true, porque: "Terminación -ch: se agrega -es.", oyente: "Movie night with her cousin. Fun!" },
        ],
      },
    ],
  },
];

export const TOTAL_ENTREVISTAS = ENTREVISTAS.length;

interface Mensaje {
  mal: boolean;
  txt: string;
  oyente: string;
}

interface Props {
  accent: string;
  rgba: string;
  resueltas: Record<string, boolean>;
  onResuelta: (id: string) => void;
  onAcierto: () => void;
  onError: () => void;
  onGanar: () => void;
}

const SENAL_MAX = 3;

export function RadioPrepa({ accent, rgba, resueltas, onResuelta, onAcierto, onError, onGanar }: Props) {
  const [idx, setIdx] = useState(() => {
    const i = ENTREVISTAS.findIndex((e) => !resueltas[e.id]);
    return i < 0 ? 0 : i;
  });
  const [turno, setTurno] = useState(0);
  const [senal, setSenal] = useState(SENAL_MAX);
  const [ruido, setRuido] = useState(false);
  const [msg, setMsg] = useState<Mensaje | null>(null);

  const ent = ENTREVISTAS[idx]!;
  const terminada = turno >= ent.turnos.length;
  const t = ent.turnos[turno];

  const irA = (i: number) => {
    setIdx(i);
    setTurno(0);
    setSenal(SENAL_MAX);
    setRuido(false);
    setMsg(null);
  };

  const elegir = (op: OpcionRadio) => {
    if (!t) return;
    if (op.ok) {
      const sig = turno + 1;
      setTurno(sig);
      setRuido(false);
      setMsg({ mal: false, txt: op.porque, oyente: op.oyente });
      onAcierto();
      if (sig >= ent.turnos.length) {
        onResuelta(ent.id);
        if (ENTREVISTAS.every((e) => e.id === ent.id || resueltas[e.id])) onGanar();
      }
    } else {
      onError();
      setRuido(true);
      const resto = senal - 1;
      if (resto <= 0) {
        setTurno(0);
        setSenal(SENAL_MAX);
        setRuido(false);
        setMsg({ mal: true, txt: `${op.porque} Se perdió la señal de la radio: la entrevista con ${ent.invitado} vuelve a empezar.`, oyente: op.oyente });
      } else {
        setSenal(resto);
        setMsg({ mal: true, txt: op.porque, oyente: op.oyente });
      }
    }
  };

  return (
    <div className="rdp">
      <style>{`
        .rdp { display:flex; flex-direction:column; gap:14px; min-width:0; }
        .rdp-casos { display:flex; gap:8px; flex-wrap:wrap; }
        .rdp-caso { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:9px 14px; border-radius:11px; border:1px solid ${T.line};
          background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; font-family:inherit; }
        .rdp-caso[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); color:#fff; }
        .rdp-caso[data-done="true"] { color:${OK}; border-color:${OK}66; }
        .rdp-estudio { position:relative; overflow:hidden; border-radius:16px; border:1px solid ${T.line}; padding:14px 16px; min-height:120px;
          display:flex; flex-direction:column; gap:10px; justify-content:flex-end; }
        .rdp-estudio img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.5; }
        .rdp-estudio > *:not(img) { position:relative; }
        .rdp-aire { display:inline-flex; align-items:center; gap:8px; align-self:flex-start; padding:4px 11px; border-radius:999px; background:rgba(4,10,22,0.8);
          font-size:14px; font-weight:900; color:#fff; }
        .rdp-aire b { width:10px; height:10px; border-radius:50%; background:${NO}; animation:rdpLatido 1.4s ease-in-out infinite; }
        @keyframes rdpLatido { 0%,100% { opacity:1; } 50% { opacity:.3; } }
        .rdp-burbuja { align-self:flex-start; max-width:100%; padding:10px 14px; border-radius:14px 14px 14px 4px; background:rgba(4,10,22,0.84);
          border:1px solid ${T.lineStrong}; color:#fff; font-size:15px; font-weight:700; line-height:1.4; }
        .rdp-burbuja span { display:block; font-size:14px; font-weight:800; color:${accent}; margin-bottom:2px; }
        .rdp-agenda { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 130px), 1fr)); gap:10px; }
        .rdp-casilla { position:relative; border-radius:14px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; padding:12px 8px; min-height:112px;
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; text-align:center; color:${T.text3}; transition:all .25s; }
        .rdp-casilla[data-actual="true"] { border-color:${accent}; color:#fff; }
        .rdp-casilla[data-hecha="true"] { border-style:solid; border-color:${ent.tono}; background:${ent.tono}22; color:#fff; }
        .rdp-casilla[data-ruido="true"] { border-color:${NO}; background:repeating-linear-gradient(45deg, ${NO}22 0 6px, transparent 6px 12px); animation:rdpRuido .4s; }
        @keyframes rdpRuido { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-5px); } 50% { transform:translateX(5px); } 75% { transform:translateX(-3px); } }
        .rdp-casilla i.rdp-ico { font-size:30px; }
        .rdp-casilla strong { font-size:14px; font-weight:800; }
        .rdp-casilla small { font-size:14px; color:${T.text2}; font-weight:700; }
        .rdp-tacha { position:absolute; left:14%; right:14%; top:36%; height:3px; border-radius:2px; background:${NO}; transform:rotate(-24deg); }
        .rdp-barras { display:inline-flex; align-items:flex-end; gap:4px; height:22px; }
        .rdp-barras span { width:8px; border-radius:2px; background:rgba(255,255,255,0.18); transition:background .25s; }
        .rdp-barras span[data-on="true"] { background:${OK}; }
        .rdp-op { cursor:pointer; text-align:left; padding:12px 15px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.inset}; color:#fff;
          font-size:15px; font-weight:700; line-height:1.4; font-family:inherit; transition:all .14s; }
        .rdp-op:hover { border-color:${accent}; transform:translateY(-1px); }
        .rdp-fb { border-radius:13px; padding:12px 14px; display:flex; gap:11px; font-size:14px; line-height:1.5; color:${T.text2}; }
        @media (prefers-reduced-motion: reduce){ .rdp-casilla, .rdp-op:hover { transition:none; transform:none; animation:none; } .rdp-aire b { animation:none; } }
      `}</style>

      <div className="rdp-casos">
        {ENTREVISTAS.map((e, i) => (
          <button key={e.id} type="button" className="rdp-caso" data-on={idx === i} data-done={!!resueltas[e.id]} onClick={() => irA(i)}>
            <i className={`fa-solid ${resueltas[e.id] ? "fa-circle-check" : "fa-microphone"}`} />
            {e.titulo}
          </button>
        ))}
      </div>

      <div className="rdp-estudio" style={{ background: `linear-gradient(160deg, ${ent.tono}55 0%, #0b1220 100%)` }}>
        <img src={`${RUTA_RADIO}/${ent.foto}.webp`} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = "none")} />
        <span className="rdp-aire">
          <b /> EN VIVO · Radio Prepa
        </span>
        <div className="rdp-burbuja">
          <span>{msg ? "Público" : "Tú, el entrevistador"}</span>
          {msg ? msg.oyente : "Today we talk about free time."}
          {!terminada && t ? ` ${t.pregunta}` : ""}
        </div>
      </div>

      <div className="rdp-agenda" role="list" aria-label={`Agenda de ${ent.invitado}`}>
        {ent.turnos.map((x, i) => {
          const hecha = i < turno;
          const actual = i === turno && !terminada;
          return (
            <div key={i} role="listitem" className="rdp-casilla" data-hecha={hecha} data-actual={actual} data-ruido={actual && ruido}>
              {hecha ? (
                <>
                  <i className={`fa-solid ${x.actividad.icono} rdp-ico`} style={{ color: x.actividad.niega ? T.text3 : "#fff" }} />
                  {x.actividad.niega && <span className="rdp-tacha" aria-hidden />}
                  <strong>{x.actividad.niega ? `no ${x.actividad.etiqueta}` : x.actividad.etiqueta}</strong>
                  <small>{x.actividad.cuando}</small>
                </>
              ) : actual && ruido ? (
                <>
                  <i className="fa-solid fa-wave-square rdp-ico" style={{ color: NO }} />
                  <strong>¿? Sin señal</strong>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-question rdp-ico" />
                  <small>{actual ? "Aquí va tu frase" : `Pregunta ${i + 1}`}</small>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>
          Agenda de {ent.invitado}: {Math.min(turno, ent.turnos.length)}/{ent.turnos.length}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 14, fontWeight: 800, color: T.text2 }} aria-label={`Señal de la radio: ${senal} de ${SENAL_MAX}`}>
          Señal
          <span className="rdp-barras">
            {Array.from({ length: SENAL_MAX }, (_, i) => (
              <span key={i} data-on={i < senal} style={{ height: 8 + i * 7 }} />
            ))}
          </span>
        </span>
      </div>

      {terminada ? (
        <div className="rdp-fb" style={{ border: `1px solid ${OK}55`, background: `${OK}12` }}>
          <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 17, marginTop: 2 }} />
          <span>
            <strong style={{ color: "#fff" }}>Entrevista completa.</strong> La agenda de {ent.invitado} se llenó porque la -s, el auxiliar y el adverbio estuvieron en su lugar.{" "}
            {idx < ENTREVISTAS.length - 1 && (
              <button type="button" className="rdp-caso" style={{ marginTop: 8 }} onClick={() => irA(idx + 1)}>
                Siguiente entrevista <i className="fa-solid fa-arrow-right" />
              </button>
            )}
          </span>
        </div>
      ) : (
        t && (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Elige la frase que el público sí entiende</div>
            {t.opciones.map((op) => (
              <button key={op.texto} type="button" className="rdp-op" onClick={() => elegir(op)}>
                {op.texto}
              </button>
            ))}
          </div>
        )
      )}

      {msg && (
        <div className="rdp-fb" style={{ border: `1px solid ${msg.mal ? `${NO}55` : `rgba(${rgba},0.32)`}`, background: msg.mal ? `${NO}12` : `rgba(${rgba},0.09)` }}>
          <i className={`fa-solid ${msg.mal ? "fa-circle-xmark" : "fa-circle-info"}`} style={{ color: msg.mal ? NO : accent, fontSize: 17, marginTop: 2 }} />
          <span>{msg.txt}</span>
        </div>
      )}
    </div>
  );
}
