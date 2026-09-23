"use client";

/**
 * Laboratorio — In the classroom: interacciones básicas en el aula
 * Progresión IN-I-P02 (Inglés I, semestre 1). Ancla evaluable: IN-I-P02-A4.
 *
 * El riesgo de esta progresión es evidente: una lista de frases sueltas para
 * memorizar. «May I go to the bathroom?» aprendida como cadena de sonidos no
 * sirve de nada el día que lo que hace falta es pedir que repitan. Así que aquí
 * lo manipulable no son las frases: es la INTERACCIÓN con su situación.
 *
 * Cuatro modos, cuatro actos distintos:
 *  1. «Elige el turno adecuado» — una situación real del aula y tres
 *     expresiones que son inglés correcto; sólo una encaja por FUNCIÓN y por
 *     REGISTRO. El error no dice «mal»: dice qué comunica de más o de menos esa
 *     frase (I don't like it habla de gusto, no de comprensión).
 *  2. «Arma el intercambio» — tres diálogos profesor↔alumno de cinco turnos
 *     donde el ORDEN importa: la disculpa antes de la petición, Excuse me antes
 *     de la pregunta, la pregunta antes de la respuesta.
 *  3. «Formal o informal» — la misma intención dicha a un compañero y dicha a
 *     la maestra. Informal no es incorrecto: es para un igual. Al cerrar cada
 *     par se ve qué marca exactamente la diferencia (please, could you, may I,
 *     excuse me).
 *  4. «Completa el texto» — el diálogo de clase de A2, escribiendo.
 *
 * Además: botón «Escuchar» en cada expresión —con la voz grabada de la
 * plataforma, `lab-voz.ts`— porque el classroom language se oye antes de
 * leerse.
 *
 * DOM puro (sin three.js). Interfaz y explicaciones en español de México; el
 * contenido evaluado, en inglés estadounidense estándar.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { hablarLab, callarLab, puedeHablarLab } from "./lab-voz";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { AULA_INGLES_HUECOS } from "./aula-ingles-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { AULA_INGLES_FICHA } from "./aula-ingles-ficha";
import {
  SITUACIONES,
  FOCO_INFO,
  INTERCAMBIOS,
  PARES_REGISTRO,
  REGISTRO_INFO,
  QUIZ_A4,
  HECHOS_A5,
  INSTRUCCIONES_A1,
  NOTA_PRACTICA,
  LECTURA_A1,
  PREGUNTAS_A1,
  type Registro,
  type Quien,
} from "./aula-ingles-data";
import { VinetaTermino } from "./_vineta";

const NO = "#FF5E5E";
const RETO_KEY = "cen-aula-ingles-interacciones-reto";
const META_PRIMERAS = 5;
const META_ESCUCHAS = 5;

type Modo = "turno" | "intercambio" | "registro" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "turno", label: "Elige el turno adecuado", icono: "fa-comments" },
  { id: "intercambio", label: "Arma el intercambio", icono: "fa-arrow-down-up-across-line" },
  { id: "registro", label: "Formal o informal", icono: "fa-user-group" },
  { id: "texto", label: "Completa el texto", icono: "fa-keyboard" },
];

/* ── utilidades puras ─────────────────────────────────────────────────── */

/** PRNG con semilla: el orden inicial es el mismo en cada carga (sin Math.random en render). */
function mulberry32(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function baraja<X>(xs: X[], rnd: () => number): X[] {
  const out = xs.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const a = out[i]!;
    out[i] = out[j]!;
    out[j] = a;
  }
  return out;
}

/** Orden de las opciones de cada situación: fijo, para que la respuesta no esté siempre en el mismo sitio. */
const ORDEN_OPCIONES: Record<string, number[]> = (() => {
  const rnd = mulberry32(20260920);
  const out: Record<string, number[]> = {};
  for (const s of SITUACIONES) out[s.id] = baraja(s.opciones.map((_, i) => i), rnd);
  return out;
})();

/** Orden inicial del montón de turnos de cada intercambio. */
function poolInicial(semilla: number): Record<string, string[]> {
  const rnd = mulberry32(semilla);
  const out: Record<string, string[]> = {};
  for (const d of INTERCAMBIOS) out[d.id] = baraja(d.turnos.map((t) => t.id), rnd);
  return out;
}

/** Las doce fichas del modo de registro, en orden estable. */
const FICHAS_REGISTRO: { id: string; par: string; registro: Registro; texto: string }[] = PARES_REGISTRO.flatMap((p) => [
  { id: `${p.id}-informal`, par: p.id, registro: "informal" as Registro, texto: p.informal },
  { id: `${p.id}-formal`, par: p.id, registro: "formal" as Registro, texto: p.formal },
]).sort((a, b) => a.texto.localeCompare(b.texto, "en"));

function BotonEscuchar({ texto, onPlay }: { texto: string; onPlay: () => void }) {
  // Sin clip grabado Y sin sintetizador el botón no podría cumplir; con
  // cualquiera de los dos sí, así que se enseña.
  if (!puedeHablarLab(texto)) return null;
  return (
    <button
      type="button"
      className="aul-escuchar"
      title="Escuchar en inglés"
      aria-label={`Escuchar: ${texto}`}
      onClick={(e) => {
        // El botón vive dentro de cubetas que también responden al clic: sin
        // esto, escuchar una frase soltaría la ficha seleccionada encima.
        e.stopPropagation();
        hablarLab(texto);
        onPlay();
      }}
    >
      <i className="fa-solid fa-volume-high" />
      Escuchar
    </button>
  );
}

/* ── la escena: un salón de clase ─────────────────────────────────────── */

function Persona({ tipo, activo, accent }: { tipo: Quien; activo: boolean; accent: string }) {
  const esMaestra = tipo === "teacher";
  const col = activo ? accent : "rgba(255,255,255,0.46)";
  return (
    <svg width={esMaestra ? 82 : 72} height={esMaestra ? 112 : 98} viewBox="0 0 82 112" aria-hidden focusable="false">
      <ellipse cx="41" cy="106" rx="27" ry="5" fill="rgba(0,0,0,0.4)" />
      <circle cx="41" cy="25" r="15" fill={col} opacity={activo ? 0.98 : 0.78} />
      <path
        d={esMaestra ? "M19 102 Q19 49 41 47 Q63 49 63 102 Z" : "M21 102 Q21 55 41 53 Q61 55 61 102 Z"}
        fill={col}
        opacity={activo ? 0.9 : 0.62}
      />
      {esMaestra ? (
        // el puntero que señala el pizarrón
        <rect x="61" y="40" width="5" height="38" rx="2.5" fill={col} opacity={activo ? 0.98 : 0.7} />
      ) : (
        // el pupitre del alumno, con su libro abierto encima
        <>
          <rect x="10" y="78" width="62" height="7" rx="3.5" fill="rgba(255,255,255,0.3)" />
          <rect x="16" y="93" width="5" height="14" rx="2" fill="rgba(255,255,255,0.18)" />
          <rect x="61" y="93" width="5" height="14" rx="2" fill="rgba(255,255,255,0.18)" />
          <path d="M26 78 L41 74 L56 78 L41 81 Z" fill="rgba(255,255,255,0.5)" />
        </>
      )}
    </svg>
  );
}

function EscenaAula({
  pizarron,
  hablante,
  burbuja,
  traduccion,
  accent,
  rgba,
}: {
  pizarron: string;
  hablante: Quien | null;
  burbuja: string | null;
  traduccion?: string | null;
  accent: string;
  rgba: string;
}) {
  return (
    <div className="aul-escena">
      <div className="aul-muro">
        <span className="aul-ventana" aria-hidden />
        <div className="aul-pizarron">
          <span className="aul-pizarron-txt">{pizarron}</span>
        </div>
        <span className="aul-reloj" aria-hidden>
          <i className="fa-regular fa-clock" />
        </span>
      </div>
      <div className="aul-piso">
        <div className="aul-persona" data-on={hablante === "teacher"}>
          <Persona tipo="teacher" activo={hablante === "teacher"} accent={accent} />
          <span className="aul-etq">Teacher</span>
        </div>

        <div className="aul-burbuja-zona">
          {burbuja ? (
            <div className="aul-burbuja" data-quien={hablante ?? "student"} style={{ borderColor: `rgba(${rgba},0.45)` }}>
              <span className="aul-burbuja-en">{burbuja}</span>
              {traduccion ? <span className="aul-burbuja-es">{traduccion}</span> : null}
            </div>
          ) : (
            <div className="aul-burbuja aul-burbuja-vacia">
              <i className="fa-solid fa-ellipsis" />
            </div>
          )}
        </div>

        <div className="aul-persona" data-on={hablante === "student"}>
          <Persona tipo="student" activo={hablante === "student"} accent={accent} />
          <span className="aul-etq">You</span>
        </div>
      </div>
      <div className="aul-pupitres" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="aul-pupitre" />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * El laboratorio
 * ═══════════════════════════════════════════════════════════════════════════ */

export function LabAulaIngles({ color }: PracticaLabProps) {
  const accent = color.hex;
  const [modo, setModo] = useState<Modo>("turno");
  const [drawer, setDrawer] = useState(false);
  const [teoriaVista, setTeoriaVista] = useState(false);
  const [escuchados, setEscuchados] = useState(0);
  const partida = usePartida();

  /* ── sonido ───────────────────────────────────────────────────────────── */
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      callarLab();
    };
  }, []);
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
  const sfxBien = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };
  const contarEscucha = () => setEscuchados((n) => n + 1);

  /* ── MODO 1 · Elige el turno adecuado ─────────────────────────────────── */
  const [sitIdx, setSitIdx] = useState(0);
  const [elegidas, setElegidas] = useState<Record<string, number[]>>({});
  const [resueltas, setResueltas] = useState<Record<string, boolean>>({});
  const [primeras, setPrimeras] = useState(0);
  const sitActual = SITUACIONES[Math.min(sitIdx, SITUACIONES.length - 1)]!;
  const elegidasActual = elegidas[sitActual.id] ?? [];
  const sitResuelta = resueltas[sitActual.id] === true;
  const focosResueltos = new Set(SITUACIONES.filter((s) => resueltas[s.id]).map((s) => s.foco));

  const elegirOpcion = (oi: number) => {
    if (sitResuelta || elegidasActual.includes(oi)) return;
    const op = sitActual.opciones[oi];
    if (!op) return;
    const previas = elegidasActual.length;
    setElegidas((e) => ({ ...e, [sitActual.id]: [...(e[sitActual.id] ?? []), oi] }));
    if (op.correcta) {
      setResueltas((r) => ({ ...r, [sitActual.id]: true }));
      if (previas === 0) setPrimeras((n) => n + 1);
      sfxBien();
    } else {
      sfxNo();
    }
  };
  const resetTurno = () => {
    setElegidas({});
    setResueltas({});
    setPrimeras(0);
    setSitIdx(0);
  };

  /* ── MODO 2 · Arma el intercambio ─────────────────────────────────────── */
  const [dlgIdx, setDlgIdx] = useState(0);
  const [pool, setPool] = useState<Record<string, string[]>>(() => poolInicial(4571));
  const [colocados, setColocados] = useState<Record<string, number>>({});
  const [fallosDlg, setFallosDlg] = useState<Record<string, number>>({});
  const [avisoDlg, setAvisoDlg] = useState<string | null>(null);
  const [shakeTurno, setShakeTurno] = useState<string | null>(null);
  const dlgActual = INTERCAMBIOS[Math.min(dlgIdx, INTERCAMBIOS.length - 1)]!;
  const puestos = colocados[dlgActual.id] ?? 0;
  const monton = (pool[dlgActual.id] ?? []).filter((id) => {
    const pos = dlgActual.turnos.findIndex((t) => t.id === id);
    return pos >= puestos;
  });

  const colocarTurno = (turnoId: string) => {
    const esperado = dlgActual.turnos[puestos];
    if (!esperado) return;
    if (turnoId === esperado.id) {
      setColocados((c) => ({ ...c, [dlgActual.id]: puestos + 1 }));
      setAvisoDlg(null);
      sfxBien();
      if (puestos + 1 >= dlgActual.turnos.length) sfxOk();
    } else {
      setFallosDlg((f) => ({ ...f, [dlgActual.id]: (f[dlgActual.id] ?? 0) + 1 }));
      setAvisoDlg(`Todavía no. En el turno ${puestos + 1} falta algo antes: ${esperado.pista}`);
      setShakeTurno(turnoId);
      sfxNo();
      window.setTimeout(() => setShakeTurno(null), 420);
    }
  };
  const resetIntercambio = () => {
    setPool(poolInicial(Math.floor(Math.random() * 100000) + 1));
    setColocados({});
    setFallosDlg({});
    setAvisoDlg(null);
    setDlgIdx(0);
  };

  /* ── MODO 3 · Formal o informal ───────────────────────────────────────── */
  const [ubicadas, setUbicadas] = useState<Record<string, Registro>>({});
  const [selFicha, setSelFicha] = useState<string | null>(null);
  const [shakeBin, setShakeBin] = useState<Registro | null>(null);
  const [avisoReg, setAvisoReg] = useState<string | null>(null);
  const libresRegistro = FICHAS_REGISTRO.filter((f) => !ubicadas[f.id]);

  const clasificar = (fichaId: string, bin: Registro) => {
    const ficha = FICHAS_REGISTRO.find((f) => f.id === fichaId);
    if (!ficha || ubicadas[ficha.id]) return;
    const par = PARES_REGISTRO.find((p) => p.id === ficha.par);
    if (ficha.registro === bin) {
      setUbicadas((u) => ({ ...u, [ficha.id]: bin }));
      setSelFicha(null);
      setAvisoReg(par ? `«${ficha.texto}» — ${par.intencion}.` : null);
      sfxBien();
      if (Object.keys(ubicadas).length + 1 >= FICHAS_REGISTRO.length) sfxOk();
    } else {
      setShakeBin(bin);
      setAvisoReg(
        ficha.registro === "formal"
          ? `«${ficha.texto}» es la versión para la maestra: por eso lleva la pregunta cortés (could / may / please).`
          : `«${ficha.texto}» es la versión para un compañero: corta y directa. No es incorrecta, pero a la maestra se le dice de otro modo.`
      );
      sfxNo();
      window.setTimeout(() => setShakeBin(null), 420);
    }
  };
  const resetRegistro = () => {
    setUbicadas({});
    setSelFicha(null);
    setAvisoReg(null);
  };

  /* ── MODO 4 · Completa el texto ───────────────────────────────────────── */
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  /* ── reto evaluable ───────────────────────────────────────────────────── */
  const [quizAprobado, setQuizAprobado] = useState(false);

  /* ── progreso ─────────────────────────────────────────────────────────── */
  const turnoDone = SITUACIONES.every((s) => resueltas[s.id]);
  const intercambioDone = INTERCAMBIOS.every((d) => (colocados[d.id] ?? 0) >= d.turnos.length);
  const limpioAlguno = INTERCAMBIOS.some((d) => (colocados[d.id] ?? 0) >= d.turnos.length && (fallosDlg[d.id] ?? 0) === 0);
  const registroDone = Object.keys(ubicadas).length >= FICHAS_REGISTRO.length;
  const todoHecho = turnoDone && intercambioDone && registroDone && textoDone && quizAprobado;

  const objetivos = [
    { txt: `Elige el turno adecuado en las ${SITUACIONES.length} situaciones`, done: turnoDone },
    { txt: `Acierta a la primera en ${META_PRIMERAS} situaciones o más`, done: primeras >= META_PRIMERAS },
    { txt: "Resuelve una situación de cada foco (permiso, duda, palabra, cortesía, opinión)", done: focosResueltos.size >= 5 },
    { txt: `Arma los ${INTERCAMBIOS.length} intercambios en su orden`, done: intercambioDone },
    { txt: "Ordena un intercambio completo sin un solo fallo", done: limpioAlguno },
    { txt: `Clasifica las ${FICHAS_REGISTRO.length} fichas en formal e informal`, done: registroDone },
    { txt: `Escucha ${META_ESCUCHAS} expresiones en inglés`, done: escuchados >= META_ESCUCHAS },
    { txt: `Completa el diálogo de A2 con sus ${AULA_INGLES_HUECOS.huecos.length} palabras`, done: textoDone },
    { txt: "Abre la ficha teórica y revisa la lectura A1", done: teoriaVista },
    { txt: "Aprueba el reto evaluable (quiz A4)", done: quizAprobado },
    { txt: "Termina la sesión con 2 errores o menos", done: todoHecho && partida.errores <= 2 },
  ];

  const abrirTeoria = () => {
    setDrawer(true);
    setTeoriaVista(true);
  };

  const resetActual = modo === "turno" ? resetTurno : modo === "intercambio" ? resetIntercambio : modo === "registro" ? resetRegistro : resetTexto;

  /* ── lo que se ve en la escena según el modo ──────────────────────────── */
  const ultimaElegida = elegidasActual[elegidasActual.length - 1] ?? -1;
  const opcionElegida = sitResuelta ? sitActual.opciones.findIndex((o) => o.correcta) : ultimaElegida;
  const burbujaTurno = opcionElegida >= 0 ? sitActual.opciones[opcionElegida]?.texto ?? null : null;
  const turnoPuesto = puestos > 0 ? dlgActual.turnos[puestos - 1] ?? null : null;
  const fichaSel = selFicha ? FICHAS_REGISTRO.find((f) => f.id === selFicha) ?? null : null;

  const escena =
    modo === "turno"
      ? { pizarron: FOCO_INFO[sitActual.foco].titulo, hablante: "student" as Quien | null, burbuja: burbujaTurno, traduccion: null as string | null }
      : modo === "intercambio"
        ? { pizarron: dlgActual.titulo, hablante: (turnoPuesto?.quien ?? null) as Quien | null, burbuja: turnoPuesto?.texto ?? null, traduccion: turnoPuesto?.es ?? null }
        : modo === "registro"
          ? { pizarron: "Formal or informal?", hablante: (fichaSel ? "student" : null) as Quien | null, burbuja: fichaSel?.texto ?? null, traduccion: null as string | null }
          : { pizarron: "What do we say in class?", hablante: null as Quien | null, burbuja: null as string | null, traduccion: null as string | null };

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes aulShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes aulPop { 0%{transform:scale(.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .aul-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 16px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13.5px; font-weight:800; transition:all .14s; }
        .aul-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .aul-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .aul-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .aul-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .aul-icobtn:hover { background:rgba(255,255,255,0.12); }
        .aul-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:10px 16px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:13px; font-weight:800; transition:all .14s; }
        .aul-btn:hover:not(:disabled) { border-color:${accent}; }
        .aul-btn:disabled { opacity:.38; cursor:not-allowed; }
        .aul-escuchar { cursor:pointer; display:inline-flex; align-items:center; gap:6px; padding:5px 11px; border-radius:999px;
          border:1px solid rgba(${color.rgba},0.4); background:rgba(${color.rgba},0.12); color:#fff; font-size:11.5px; font-weight:800; transition:all .14s; }
        .aul-escuchar:hover { background:rgba(${color.rgba},0.26); }
        .aul-divider { height:1px; background:${T.line}; margin:16px 0; }

        /* Escena del salón */
        .aul-escena { border-radius:18px; border:1px solid ${T.line}; overflow:hidden;
          background:linear-gradient(180deg, rgba(${color.rgba},0.13) 0%, rgba(2,12,28,0.72) 62%); }
        .aul-muro { display:flex; align-items:center; gap:16px; padding:18px 22px 0; }
        .aul-ventana { flex-shrink:0; width:54px; height:62px; border-radius:6px; border:2px solid rgba(255,255,255,0.16);
          background:linear-gradient(170deg, rgba(90,170,230,0.32) 0%, rgba(20,60,95,0.22) 100%); position:relative; }
        .aul-ventana::before { content:""; position:absolute; left:50%; top:3px; bottom:3px; width:2px; margin-left:-1px; background:rgba(255,255,255,0.16); }
        .aul-ventana::after { content:""; position:absolute; top:50%; left:3px; right:3px; height:2px; margin-top:-1px; background:rgba(255,255,255,0.16); }
        .aul-reloj { flex-shrink:0; width:40px; height:40px; border-radius:50%; border:2px solid rgba(255,255,255,0.16);
          display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.4); font-size:17px; }
        .aul-pizarron { flex:1; min-width:0; border-radius:12px; border:3px solid rgba(255,255,255,0.14);
          background:linear-gradient(160deg,#102a22 0%,#0a1a16 100%); padding:16px 18px; text-align:center; }
        .aul-pizarron-txt { font-size:15px; font-weight:800; letter-spacing:.04em; color:rgba(255,255,255,0.82); }
        .aul-piso { display:flex; align-items:flex-end; justify-content:space-between; gap:14px; padding:14px 22px 0; }
        .aul-pupitres { display:flex; align-items:flex-end; justify-content:center; gap:18px; padding:0 22px 16px;
          border-top:1px solid rgba(255,255,255,0.07); margin-top:-2px; }
        .aul-pupitre { width:62px; height:9px; border-radius:3px; background:rgba(255,255,255,0.09);
          border-top:2px solid rgba(255,255,255,0.13); margin-top:12px; position:relative; }
        .aul-pupitre::before { content:""; position:absolute; left:8px; top:9px; width:3px; height:12px; background:rgba(255,255,255,0.07); }
        .aul-pupitre::after { content:""; position:absolute; right:8px; top:9px; width:3px; height:12px; background:rgba(255,255,255,0.07); }
        @media (max-width: 640px){ .aul-ventana, .aul-reloj { display:none; } .aul-pupitre:nth-child(n+4) { display:none; } }
        .aul-persona { display:flex; flex-direction:column; align-items:center; gap:5px; flex-shrink:0; opacity:.62; transition:opacity .2s; }
        .aul-persona[data-on="true"] { opacity:1; }
        .aul-etq { font-size:10.5px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:${T.text3}; }
        .aul-burbuja-zona { flex:1; min-width:0; display:flex; justify-content:center; align-items:flex-end; padding-bottom:22px; }
        .aul-burbuja { max-width:100%; border-radius:16px; border:1.5px solid ${T.lineStrong}; background:rgba(2,12,28,0.82);
          padding:12px 17px; display:flex; flex-direction:column; gap:4px; text-align:center; animation:aulPop .22s ease; }
        .aul-burbuja-vacia { color:${T.text3}; font-size:16px; padding:10px 17px; }
        .aul-burbuja-en { font-size:15.5px; font-weight:800; color:#fff; line-height:1.4; }
        .aul-burbuja-es { font-size:12px; color:${T.text3}; font-style:italic; }

        /* Opciones de turno */
        .aul-opt { cursor:pointer; display:flex; align-items:flex-start; gap:12px; width:100%; text-align:left;
          border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-size:14.5px; font-weight:700; padding:13px 16px; transition:all .14s; }
        .aul-opt:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .aul-opt:disabled { cursor:default; }
        .aul-opt[data-ok="true"] { border-color:${OK}; background:${OK}1c; color:#fff; }
        .aul-opt[data-bad="true"] { border-color:${NO}; background:${NO}16; color:#fff; }
        .aul-letra { flex-shrink:0; width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:900; border:1px solid ${T.line}; color:${T.text3}; }

        /* Turnos del intercambio */
        .aul-turno { cursor:pointer; display:flex; align-items:flex-start; gap:11px; text-align:left; width:100%;
          border-radius:14px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff;
          font-size:13.5px; font-weight:700; padding:12px 15px; transition:all .14s; line-height:1.45; }
        .aul-turno:hover { border-color:${accent}; background:rgba(${color.rgba},0.14); }
        .aul-turno[data-shake="true"] { animation:aulShake .4s; border-color:${NO}; }
        .aul-quien { flex-shrink:0; font-size:10px; font-weight:900; letter-spacing:.08em; text-transform:uppercase;
          padding:3px 8px; border-radius:999px; border:1px solid ${T.line}; color:${T.text3}; }
        .aul-hilo { display:flex; flex-direction:column; gap:10px; }
        .aul-msg { border-radius:15px; padding:11px 15px; max-width:86%; animation:aulPop .22s ease; line-height:1.45; }
        .aul-msg[data-quien="teacher"] { align-self:flex-start; background:rgba(255,255,255,0.07); border:1px solid ${T.line}; }
        .aul-msg[data-quien="student"] { align-self:flex-end; background:rgba(${color.rgba},0.16); border:1px solid rgba(${color.rgba},0.38); }

        /* Fichas y cubetas del registro */
        .aul-chip { cursor:grab; display:inline-flex; align-items:center; gap:8px; padding:11px 16px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:all .14s; user-select:none; }
        .aul-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .aul-chip[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .aul-chip:active { cursor:grabbing; }
        .aul-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:230px; cursor:pointer; }
        .aul-bin[data-shake="true"] { animation:aulShake .4s; border-color:${NO}; }
        .aul-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:13px 16px; transition:all .16s; }
        .aul-row[data-done="true"] { border-color:${OK}55; background:${OK}0d; }

        /* Cajón de teoría */
        .aul-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .aul-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .aul-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .aul-drawer[data-open="true"] { transform:translateX(0); }
        .aul-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .aul-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .aul-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .aul-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .aul-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .aul-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .aul-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }
        @media (max-width: 860px){ .aul-piso { flex-wrap:wrap; justify-content:center; } .aul-burbuja-zona { order:-1; width:100%; padding-bottom:10px; } }

        /* Identidad del tablero */
        .aul-bin, .aul-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .aul-bin:nth-of-type(6n+1), .aul-row:nth-of-type(6n+1) { --tono:188; }
        .aul-bin:nth-of-type(6n+2), .aul-row:nth-of-type(6n+2) { --tono:262; }
        .aul-bin:nth-of-type(6n+3), .aul-row:nth-of-type(6n+3) { --tono:44; }
        .aul-bin:nth-of-type(6n+4), .aul-row:nth-of-type(6n+4) { --tono:152; }
        .aul-bin:nth-of-type(6n+5), .aul-row:nth-of-type(6n+5) { --tono:330; }
        .aul-bin:nth-of-type(6n+6), .aul-row:nth-of-type(6n+6) { --tono:18; }
        .aul-bin::before, .aul-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .aul-bin[data-done="true"], .aul-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .aul-chip:hover { transform:translateY(-2px); }
        .aul-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .aul-chip, .aul-chip:hover, .aul-chip[data-sel="true"] { transform:none; transition:none; }
          .aul-turno[data-shake="true"], .aul-bin[data-shake="true"], .aul-burbuja, .aul-msg { animation:none; }
        }
      `}</style>

      {/* selector de modo + barra */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="aul-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="aul-icobtn" data-on={drawer} onClick={abrirTeoria} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="aul-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="aul-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* Cajón de teoría */}
      <button className="aul-teoria-fab" onClick={abrirTeoria}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="aul-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="aul-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="aul-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="aul-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="aul-drawer-body">
          <FichaTeorica data={AULA_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}>
        {/* ── columna principal ───────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <EscenaAula
            pizarron={escena.pizarron}
            hablante={escena.hablante}
            burbuja={escena.burbuja}
            traduccion={escena.traduccion}
            accent={accent}
            rgba={color.rgba}
          />

          {/* MODO 1 — Elige el turno adecuado */}
          {modo === "turno" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  <Eyebrow>
                    Situación {sitIdx + 1} de {SITUACIONES.length} · {FOCO_INFO[sitActual.foco].titulo}
                  </Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: turnoDone ? OK : T.text3 }}>
                    {Object.keys(resueltas).length}/{SITUACIONES.length} resueltas
                  </span>
                </div>

                <div style={{ fontSize: 15, color: T.text, lineHeight: 1.55, fontWeight: 700 }}>{sitActual.situacion}</div>
                <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5, marginTop: 7, display: "flex", gap: 9 }}>
                  <i className="fa-solid fa-bullseye" style={{ color: accent, marginTop: 3 }} />
                  <span>
                    Lo que quieres lograr: <strong style={{ color: T.text }}>{sitActual.intencion}</strong>
                  </span>
                </div>

                <div className="aul-divider" />

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(ORDEN_OPCIONES[sitActual.id] ?? []).map((oi, pos) => {
                    const op = sitActual.opciones[oi]!;
                    const tocada = elegidasActual.includes(oi);
                    const mostrarOk = tocada && op.correcta;
                    const mostrarMal = tocada && !op.correcta;
                    return (
                      <div key={oi}>
                        <button
                          className="aul-opt"
                          data-ok={mostrarOk}
                          data-bad={mostrarMal}
                          disabled={sitResuelta || tocada}
                          onClick={() => elegirOpcion(oi)}
                        >
                          <span className="aul-letra">
                            {mostrarOk ? <i className="fa-solid fa-check" /> : mostrarMal ? <i className="fa-solid fa-xmark" /> : String.fromCharCode(65 + pos)}
                          </span>
                          <span style={{ flex: 1, lineHeight: 1.4 }}>{op.texto}</span>
                        </button>
                        {mostrarOk && (
                          <div style={{ marginTop: 8, marginLeft: 38 }}>
                            <BotonEscuchar texto={op.texto} onPlay={contarEscucha} />
                          </div>
                        )}
                        {tocada && (
                          <div
                            style={{
                              marginTop: 8,
                              marginLeft: 38,
                              fontSize: 12.5,
                              color: T.text2,
                              lineHeight: 1.5,
                              borderRadius: 10,
                              border: `1px solid ${op.correcta ? `${OK}55` : T.line}`,
                              background: op.correcta ? `${OK}12` : T.inset,
                              padding: "9px 13px",
                            }}
                          >
                            <i className={`fa-solid ${op.correcta ? "fa-circle-check" : "fa-circle-info"}`} style={{ marginRight: 8, color: op.correcta ? OK : accent }} />
                            {op.comunica}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {sitResuelta && (
                  <div
                    style={{
                      marginTop: 15,
                      borderRadius: 13,
                      border: `1px solid rgba(${color.rgba},0.34)`,
                      background: `rgba(${color.rgba},0.1)`,
                      padding: "13px 16px",
                      fontSize: 13.5,
                      color: T.text2,
                      lineHeight: 1.55,
                      display: "flex",
                      gap: 11,
                    }}
                  >
                    <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 2 }} />
                    <span>{sitActual.regla}</span>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                  <button className="aul-btn" onClick={() => setSitIdx((i) => Math.max(0, i - 1))} disabled={sitIdx === 0}>
                    <i className="fa-solid fa-arrow-left" /> Anterior
                  </button>
                  <button
                    className="aul-btn"
                    style={sitResuelta ? { background: accent, color: "#04121f", borderColor: accent } : undefined}
                    onClick={() => setSitIdx((i) => Math.min(SITUACIONES.length - 1, i + 1))}
                    disabled={sitIdx >= SITUACIONES.length - 1}
                  >
                    Siguiente <i className="fa-solid fa-arrow-right" />
                  </button>
                  <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
                    {SITUACIONES.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => setSitIdx(i)}
                        title={FOCO_INFO[s.foco].titulo}
                        aria-label={`Ir a la situación ${i + 1}`}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: 900,
                          border: `1.5px solid ${i === sitIdx ? accent : T.line}`,
                          background: resueltas[s.id] ? `${OK}22` : T.glass,
                          color: resueltas[s.id] ? OK : T.text3,
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* MODO 2 — Arma el intercambio */}
          {modo === "intercambio" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <Eyebrow>
                    {dlgActual.titulo} · intercambio {dlgIdx + 1} de {INTERCAMBIOS.length}
                  </Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: puestos >= dlgActual.turnos.length ? OK : T.text3 }}>
                    {puestos}/{dlgActual.turnos.length} turnos
                  </span>
                </div>
                <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>{dlgActual.contexto}</div>

                <div className="aul-hilo">
                  {dlgActual.turnos.slice(0, puestos).map((t, i) => (
                    <div key={t.id} className="aul-msg" data-quien={t.quien}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4, flexWrap: "wrap" }}>
                        <span className="aul-quien">{t.quien === "teacher" ? "Teacher" : "You"}</span>
                        <span style={{ fontSize: 10.5, color: T.text3, fontWeight: 800 }}>#{i + 1}</span>
                        <BotonEscuchar texto={t.texto} onPlay={contarEscucha} />
                      </div>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: "#fff" }}>{t.texto}</div>
                      <div style={{ fontSize: 12, color: T.text3, fontStyle: "italic", marginTop: 3 }}>{t.es}</div>
                    </div>
                  ))}
                  {puestos < dlgActual.turnos.length && (
                    <div
                      style={{
                        alignSelf: "center",
                        borderRadius: 12,
                        border: `1.5px dashed ${T.lineStrong}`,
                        padding: "9px 16px",
                        fontSize: 12.5,
                        color: T.text3,
                        fontWeight: 700,
                      }}
                    >
                      <i className="fa-solid fa-arrow-down" style={{ marginRight: 8 }} />
                      Turno {puestos + 1}: elige abajo el que sigue
                    </div>
                  )}
                </div>

                {avisoDlg && puestos < dlgActual.turnos.length && (
                  <div
                    style={{
                      marginTop: 14,
                      borderRadius: 12,
                      border: `1px solid ${NO}55`,
                      background: `${NO}12`,
                      padding: "11px 14px",
                      fontSize: 12.5,
                      color: T.text2,
                      lineHeight: 1.5,
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <i className="fa-solid fa-circle-exclamation" style={{ color: NO, marginTop: 2 }} />
                    <span>{avisoDlg}</span>
                  </div>
                )}

                {puestos >= dlgActual.turnos.length && (
                  <div
                    style={{
                      marginTop: 14,
                      borderRadius: 12,
                      border: `1px solid ${OK}55`,
                      background: `${OK}12`,
                      padding: "11px 14px",
                      fontSize: 13,
                      color: T.text2,
                      lineHeight: 1.5,
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <i className="fa-solid fa-circle-check" style={{ color: OK, marginTop: 2 }} />
                    <span>
                      Intercambio completo{(fallosDlg[dlgActual.id] ?? 0) === 0 ? ", y sin un solo fallo" : ""}. Fíjate en el orden: nadie contesta antes de que le
                      pregunten y nadie pide sin haber abierto el turno.
                    </span>
                  </div>
                )}
              </div>

              {puestos < dlgActual.turnos.length && (
                <div style={{ ...card, padding: "18px 22px" }}>
                  <Eyebrow>Los turnos, revueltos</Eyebrow>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                    {monton.map((id) => {
                      const t = dlgActual.turnos.find((x) => x.id === id)!;
                      return (
                        <button key={id} className="aul-turno" data-shake={shakeTurno === id} onClick={() => colocarTurno(id)}>
                          <span className="aul-quien">{t.quien === "teacher" ? "Teacher" : "You"}</span>
                          <span style={{ flex: 1 }}>{t.texto}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {INTERCAMBIOS.map((d, i) => {
                  const listo = (colocados[d.id] ?? 0) >= d.turnos.length;
                  return (
                    <button
                      key={d.id}
                      className="aul-btn"
                      data-on={i === dlgIdx}
                      onClick={() => {
                        setDlgIdx(i);
                        setAvisoDlg(null);
                      }}
                      style={i === dlgIdx ? { borderColor: accent, color: "#fff" } : undefined}
                    >
                      <i className={`fa-solid ${listo ? "fa-circle-check" : "fa-comment-dots"}`} style={{ color: listo ? OK : T.text3 }} />
                      {d.titulo}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* MODO 3 — Formal o informal */}
          {modo === "registro" && (
            <>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <Eyebrow>Arrastra o toca cada expresión y suéltala en su columna</Eyebrow>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: registroDone ? OK : T.text3 }}>
                    {Object.keys(ubicadas).length}/{FICHAS_REGISTRO.length}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.5, marginBottom: 14 }}>
                  Las doce son inglés correcto. <strong style={{ color: T.text2 }}>Informal no significa mal dicho</strong>: significa que es para un compañero. Lo
                  que cambia es la marca de cortesía.
                </div>
                {libresRegistro.length === 0 ? (
                  <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {FICHAS_REGISTRO.length} expresiones!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {libresRegistro.map((f) => (
                      <button
                        key={f.id}
                        className="aul-chip"
                        data-sel={selFicha === f.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", f.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onClick={() => setSelFicha((s) => (s === f.id ? null : f.id))}
                      >
                        {f.texto}
                      </button>
                    ))}
                  </div>
                )}
                {avisoReg && (
                  <div
                    style={{
                      marginTop: 14,
                      borderRadius: 12,
                      border: `1px solid ${T.line}`,
                      background: T.inset,
                      padding: "11px 14px",
                      fontSize: 12.5,
                      color: T.text2,
                      lineHeight: 1.5,
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <i className="fa-solid fa-circle-info" style={{ color: accent, marginTop: 2 }} />
                    <span>{avisoReg}</span>
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
                {(["informal", "formal"] as Registro[]).map((bin) => {
                  const info = REGISTRO_INFO[bin];
                  const dentro = FICHAS_REGISTRO.filter((f) => ubicadas[f.id] === bin);
                  return (
                    <div
                      key={bin}
                      className="aul-bin"
                      data-shake={shakeBin === bin}
                      data-done={dentro.length >= PARES_REGISTRO.length}
                      onClick={() => selFicha && clasificar(selFicha, bin)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const id = e.dataTransfer.getData("text/plain");
                        if (id) clasificar(id, bin);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (selFicha) clasificar(selFicha, bin);
                        }
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                        <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 12, lineHeight: 1.45 }}>{info.subtitulo}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {dentro.length === 0 ? (
                          <div style={{ fontSize: 12, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Suelta aquí…</div>
                        ) : (
                          dentro.map((f) => (
                            <span
                              key={f.id}
                              style={{
                                animation: "aulPop .25s ease",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 12px",
                                borderRadius: 11,
                                background: `${OK}1a`,
                                border: `1px solid ${OK}55`,
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#fff",
                              }}
                            >
                              <i className="fa-solid fa-check" style={{ fontSize: 10, color: OK }} />
                              <span style={{ flex: 1 }}>{f.texto}</span>
                              <BotonEscuchar texto={f.texto} onPlay={contarEscucha} />
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ ...card, padding: "18px 22px" }}>
                <Eyebrow>Qué cambia de una a otra</Eyebrow>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                  {PARES_REGISTRO.map((p) => {
                    const listo = ubicadas[`${p.id}-informal`] !== undefined && ubicadas[`${p.id}-formal`] !== undefined;
                    return (
                      <div key={p.id} className="aul-row" data-done={listo}>
                        <div style={{ fontSize: 12, color: T.text3, fontWeight: 800, letterSpacing: ".03em" }}>{p.intencion}</div>
                        {listo ? (
                          <>
                            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 7 }}>
                              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                                <i className="fa-solid fa-user-group" style={{ fontSize: 11, color: T.text3, marginRight: 8 }} />
                                {p.informal}
                              </span>
                              <span style={{ fontSize: 14, fontWeight: 800, color: accent }}>
                                <i className="fa-solid fa-chalkboard-user" style={{ fontSize: 11, color: T.text3, marginRight: 8 }} />
                                {p.formal}
                              </span>
                            </div>
                            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, marginTop: 6 }}>{p.cambio}</div>
                          </>
                        ) : (
                          <div style={{ fontSize: 12.5, color: T.text3, marginTop: 6, fontStyle: "italic" }}>
                            Coloca las dos versiones de esta intención para ver qué las separa.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* MODO 4 — Completa el texto */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={AULA_INGLES_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                sfxOk();
              }}
              onAcierto={sfxBien}
              onError={sfxNo}
            />
          )}
        </div>

        {/* ── columna lateral ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "20px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
              Objetivos de la sesión
            </Eyebrow>
            <TableroObjetivos objetivos={objetivos} retoKey={RETO_KEY} accent={accent} />
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: "16px 18px",
              border: `1px solid rgba(${color.rgba},0.3)`,
              background: `rgba(${color.rgba},0.08)`,
              fontSize: 13,
              color: T.text2,
              lineHeight: 1.55,
              display: "flex",
              gap: 12,
            }}
          >
            <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              {modo === "turno" && (
                <>
                  Las tres opciones son inglés correcto. No busques la que «suena bien»: lee <strong style={{ color: T.text }}>qué dice cada una</strong> y quédate
                  con la que cumple tu intención y le habla a la maestra.
                </>
              )}
              {modo === "intercambio" && (
                <>
                  El orden es la gramática de la conversación: <strong style={{ color: T.text }}>Excuse me</strong> abre el turno, la pregunta va antes de la
                  respuesta y <strong style={{ color: T.text }}>Sorry</strong> se disculpa por lo que ya pasó.
                </>
              )}
              {modo === "registro" && (
                <>
                  Fíjate en cuatro marcas: <strong style={{ color: T.text }}>please</strong>, la pregunta con{" "}
                  <strong style={{ color: T.text }}>could / may</strong> en lugar del imperativo, <strong style={{ color: T.text }}>excuse me</strong> en vez de{" "}
                  <em>hey</em>, y las formas completas en vez de las coloquiales.
                </>
              )}
              {modo === "texto" && (
                <>
                  Este es el diálogo de la actividad <strong style={{ color: T.text }}>A2</strong>, tal cual. Escribe la palabra que falta; no se distinguen
                  mayúsculas.
                </>
              )}
            </span>
          </div>

          {/* Instrucciones del maestro (verbatim A1) */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-chalkboard-user" style={{ marginRight: 8, color: accent }} />
              Lo que dice el maestro
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {INSTRUCCIONES_A1.map((x) => (
                <div key={x.en} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#fff", lineHeight: 1.35 }}>{x.en}</div>
                    <div style={{ fontSize: 12, color: T.text3, fontStyle: "italic", lineHeight: 1.35, marginTop: 2 }}>{x.es}</div>
                  </div>
                  <BotonEscuchar texto={x.en} onPlay={contarEscucha} />
                </div>
              ))}
            </div>
          </div>

          {/* Hechos verbatim A5 */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-check" style={{ marginRight: 8, color: accent }} />
              Hechos comprobados (A5)
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {HECHOS_A5.map((h) => (
                <div key={h.enunciado} style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                  <span
                    style={{
                      display: "inline-block",
                      marginRight: 8,
                      padding: "1px 7px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 900,
                      color: h.respuesta ? OK : NO,
                      border: `1px solid ${h.respuesta ? OK : NO}66`,
                      background: `${h.respuesta ? OK : NO}14`,
                    }}
                  >
                    {h.respuesta ? "TRUE" : "FALSE"}
                  </span>
                  {h.enunciado}
                  <div style={{ fontSize: 11.5, color: T.text3, marginTop: 3, fontStyle: "italic" }}>{h.retro}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Preguntas de comprensión (A1) */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Comprensión de la lectura A1
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {PREGUNTAS_A1.map((p) => (
                <div key={p.pregunta} style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                  <strong style={{ color: T.text }}>{p.pregunta}</strong>
                  <div style={{ marginTop: 3, color: T.text3 }}>{p.respuesta}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Nota verbatim de cierre */}
          <div
            style={{
              borderRadius: 18,
              padding: "16px 18px",
              border: `1px solid ${T.line}`,
              background: T.glass,
              fontSize: 12.5,
              color: T.text2,
              lineHeight: 1.55,
              display: "flex",
              gap: 12,
            }}
          >
            <i className="fa-solid fa-quote-left" style={{ color: accent, fontSize: 15, marginTop: 2 }} />
            <span>{NOTA_PRACTICA}</span>
          </div>
        </div>
      </div>

      <RetoQuizCard
        quiz={QUIZ_A4}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={(ok) => (ok ? sfxOk() : sfxNo())}
        mensajeAprobado="Ya sabes qué decir en clase y a quién decírselo."
      />

      {/* Lectura A1 completa + nota al pie */}
      <div style={{ ...card, padding: "20px 24px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-book-open-reader" style={{ marginRight: 8, color: accent }} />
          Lectura A1 · {AULA_INGLES_FICHA.ancla}
        </Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {LECTURA_A1.map((p, i) => (
            <p key={i} style={{ margin: 0, fontSize: 13.5, color: T.text2, lineHeight: 1.65 }}>
              {p}
            </p>
          ))}
        </div>
        <div className="aul-divider" />
        <p style={{ margin: 0, fontSize: 11.5, color: T.text3, lineHeight: 1.6 }}>
          Verbatim de la progresión IN-I-P02: la lectura (A1), el diálogo con huecos (A2), el quiz evaluable (A4), los hechos verdadero/falso (A5) y el glosario
          (A6). Las ocho situaciones, los tres intercambios y los seis pares formal/informal son material nuevo escrito para esta práctica con las mismas
          funciones y frases de la lectura; los nombres (Ana) son ficticios. Fuente: {AULA_INGLES_FICHA.fuente}.
        </p>
      </div>
    </div>
  );
}
