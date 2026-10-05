"use client";

/**
 * Laboratorio — About me: dar y pedir información personal en inglés.
 * Práctica interactiva para IN-I-P04 (Inglés I, 1.er semestre).
 *
 * Por qué NO es un laboratorio 3D: lo que hay que aprender aquí es un
 * INTERCAMBIO —alguien pregunta, alguien contesta, alguien llena un formulario
 * con esos datos—, y ese intercambio ocurre en campos, preguntas y oraciones.
 * Una escena tridimensional sería decoración alrededor de un formulario. DOM
 * puro: ligero y accesible con ratón, teclado y pantalla táctil.
 *
 * Y por qué no es un formulario muerto: en los cinco modos el alumno DECIDE y
 * el laboratorio le explica en español la regla que falló, con el ejemplo en
 * inglés. El error que se persigue no es «no sé el dato», es el de verdad: el
 * apellido en «First name», el país en «Nationality», «I have 16 years», «He
 * name is», «You are…?» en vez de «Are you…?».
 *
 * Seis modos:
 *  1. «Llena el formulario» — Mateo dicta sus datos para inscribirse a un curso
 *     de verano; cada dato va a un campo, y cada confusión típica tiene su
 *     explicación propia (Mexican no es Mexico; 16 no es un teléfono).
 *  2. «Pregunta y respuesta» — todas las opciones son inglés correcto, pero
 *     solo una contesta la pregunta que se hizo; las otras contestan otra.
 *  3. «To be en su sitio» — una misma idea, transformada: cambia el sujeto y
 *     cambia el verbo; cambia la forma y cambia el ORDEN.
 *  4. «Preséntalo a alguien más» — el salto de «I am…» a «She is… / His name
 *     is…», sobre la ficha de dos personajes que se pueden intercambiar.
 *  5. «Escribe el término» — las etiquetas del formulario en inglés, a partir
 *     de su definición en español (glosario A6).
 *  6. «Completa el texto» — los huecos verbatim de A2.
 *  + Hechos verdadero/falso (A5), la lectura A1 con sus preguntas, la consigna
 *    de A3 y el reto evaluable (A4).
 *
 * Datos personales: el alumno nunca escribe los suyos. Todo ocurre sobre
 * personajes ficticios, que es además lo que pide el criterio de A7 («Sé qué
 * datos personales debo proteger al compartirlos»).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, NUM, card, Eyebrow } from "./_kit";
import { hablarLab, callarLab } from "./lab-voz";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { usePartida, MarcadorPartida } from "./_partida";
import { LabShell, Bloque, BotonHerramienta, Dato } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { PERFIL_PERSONAL_FICHA } from "./perfil-personal-ingles-ficha";
import { PERFIL_PERSONAL_HUECOS } from "./perfil-personal-ingles-huecos";
import {
  PERSONAJES,
  CAMPOS_FORMULARIO,
  DATOS_FICHA,
  errorGenerico,
  RONDAS_PREGUNTA,
  RONDAS_TOBE,
  explicaTobe,
  ORACIONES_TERCERA,
  OPCIONES_RANURA,
  palabraCorrecta,
  explicaTercera,
  rellena,
  GLOSARIO,
  HECHOS,
  COMPRENSION_A1,
  CONSIGNA_A3,
  ACTIVIDAD_FINAL_A6,
  RETO_QUIZ,
  type Personaje,
  type RondaToBe,
  type RanuraTipo,
} from "./perfil-personal-ingles-data";
import { TURNOS_MOSTRADOR, type AnimoRegistrador } from "./perfil-personal-ingles-sim";
import { FondoTermino, VinetaTermino } from "./_vineta";

const NO = "#FF5E5E";
const RETO_KEY = "cen-perfil-personal-ingles-reto";
const RUTA_SIM = "/media/labs-sim/perfil-personal-ingles";

type Modo = "mostrador" | "formulario" | "preguntas" | "tobe" | "tercera" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "mostrador", label: "En el mostrador", icono: "fa-id-card" },
  { id: "formulario", label: "Llena el formulario", icono: "fa-rectangle-list" },
  { id: "preguntas", label: "Pregunta y respuesta", icono: "fa-comments" },
  { id: "tobe", label: "To be en su sitio", icono: "fa-equals" },
  { id: "tercera", label: "Preséntalo a alguien más", icono: "fa-user-group" },
  { id: "glosario", label: "Escribe el término", icono: "fa-spell-check" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

/** Botón «Escuchar» reutilizado por los modos que producen una oración. */
function BotonEscuchar({ txt, accent }: { txt: string; accent: string }) {
  return (
    <button type="button" className="prf-mini" onClick={() => hablarLab(txt)} title="Escuchar en inglés">
      <i className="fa-solid fa-volume-high" style={{ marginRight: 7, color: accent }} />
      Escuchar
    </button>
  );
}

export function LabPerfilPersonalIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("mostrador");

  // ── sonido y partida ──────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  useEffect(() => () => audioRef.current?.dispose(), []);
  // `callarLab()` ya se traga sus propios fallos: no hace falta envolverlo.
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

  /** El pie del laboratorio: la última explicación, siempre a la vista. */
  const [pie, setPie] = useState<{ ok: boolean; txt: string } | null>(null);

  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = (txt?: string) => {
    partida.error();
    if (txt) setPie({ ok: false, txt });
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = (txt?: string) => {
    partida.acierto();
    if (txt) setPie({ ok: true, txt });
    return sonido && audioRef.current?.blip();
  };

  // ── modo 1: llena el formulario ───────────────────────────────────────
  const [asignado, setAsignado] = useState<Record<string, string>>({});
  const [selDato, setSelDato] = useState<string | null>(null);
  const [shakeCampo, setShakeCampo] = useState<string | null>(null);

  const formDone = Object.keys(asignado).length >= CAMPOS_FORMULARIO.length;
  const natPaisDone = asignado["f-nat"] === "d-nat" && asignado["f-country"] === "d-country";

  const soltar = (campoId: string, datoId: string) => {
    const campo = CAMPOS_FORMULARIO.find((c) => c.id === campoId);
    const dato = DATOS_FICHA.find((d) => d.id === datoId);
    if (!campo || !dato || asignado[campoId]) return;
    if (Object.values(asignado).includes(datoId)) return;

    if (campo.correcto === datoId) {
      const siguiente = { ...asignado, [campoId]: datoId };
      setAsignado(siguiente);
      setSelDato(null);
      sfxPlace(campo.porque);
      if (Object.keys(siguiente).length >= CAMPOS_FORMULARIO.length) {
        sfxOk();
        setPie({
          ok: true,
          txt: "Formulario completo. Fíjate en lo que acabas de separar: el nombre del apellido, la nacionalidad del país y el teléfono del correo. Esos tres pares son los que más se equivocan.",
        });
      }
    } else {
      setShakeCampo(campoId);
      sfxNo(campo.errores[datoId] ?? errorGenerico(campo, dato));
      window.setTimeout(() => setShakeCampo(null), 420);
    }
  };

  const resetFormulario = () => {
    setAsignado({});
    setSelDato(null);
    setPie(null);
  };

  // ── modo 2: pregunta y respuesta ──────────────────────────────────────
  const [qIdx, setQIdx] = useState(0);
  const [qOk, setQOk] = useState<Record<string, boolean>>({});
  const [qFallo, setQFallo] = useState<Record<string, number>>({});

  const ronda = RONDAS_PREGUNTA[qIdx] ?? RONDAS_PREGUNTA[0]!;
  const preguntasDone = Object.keys(qOk).length >= RONDAS_PREGUNTA.length;

  const responderPregunta = (i: number) => {
    if (qOk[ronda.id]) return;
    const op = ronda.opciones[i];
    if (!op) return;
    if (i === ronda.correcta) {
      const siguiente = { ...qOk, [ronda.id]: true };
      setQOk(siguiente);
      sfxPlace(`«${op.texto}» ${ronda.porque}`);
      if (Object.keys(siguiente).length >= RONDAS_PREGUNTA.length) sfxOk();
    } else {
      setQFallo((prev) => ({ ...prev, [`${ronda.id}:${i}`]: i }));
      sfxNo(
        `«${op.texto}» es inglés correcto, pero contesta a otra pregunta: «${op.contesta}». Lo que te preguntaron fue «${ronda.pregunta}».`
      );
    }
  };

  const irPregunta = (i: number) => {
    const n = RONDAS_PREGUNTA.length;
    setQIdx(((i % n) + n) % n);
  };

  const resetPreguntas = () => {
    setQIdx(0);
    setQOk({});
    setQFallo({});
    setPie(null);
  };

  // ── modo 3: to be en su sitio ─────────────────────────────────────────
  const [tbIdx, setTbIdx] = useState(0);
  const [tbArmado, setTbArmado] = useState<Record<string, string[]>>({});
  const [shakePieza, setShakePieza] = useState<string | null>(null);

  const rondaTb = RONDAS_TOBE[tbIdx] ?? RONDAS_TOBE[0]!;
  const armadoActual = tbArmado[rondaTb.id] ?? [];
  const tbListo = (r: RondaToBe) => (tbArmado[r.id]?.length ?? 0) >= r.solucion.length;
  const tobeDone = RONDAS_TOBE.every((r) => tbListo(r));
  const tobeFormasDone = RONDAS_TOBE.filter((r) => r.forma !== "afirmativa").every((r) => tbListo(r));

  const ponerPieza = (pieza: string, iPieza: number) => {
    const pos = armadoActual.length;
    if (pos >= rondaTb.solucion.length) return;
    const esperada = rondaTb.solucion[pos]!;
    if (pieza === esperada) {
      const siguiente = [...armadoActual, pieza];
      setTbArmado((prev) => ({ ...prev, [rondaTb.id]: siguiente }));
      if (siguiente.length >= rondaTb.solucion.length) {
        sfxPlace(`${rondaTb.solucion.join(" ")}${rondaTb.forma === "interrogativa" ? "?" : "."} — ${rondaTb.regla}`);
        sfxOk();
      } else {
        sfxPlace();
      }
    } else {
      setShakePieza(`${rondaTb.id}:${iPieza}`);
      sfxNo(explicaTobe(rondaTb, pieza, pos));
      window.setTimeout(() => setShakePieza(null), 420);
    }
  };

  const borrarUltima = () => {
    if (armadoActual.length === 0) return;
    setTbArmado((prev) => ({ ...prev, [rondaTb.id]: armadoActual.slice(0, -1) }));
  };

  const irTobe = (i: number) => {
    const n = RONDAS_TOBE.length;
    setTbIdx(((i % n) + n) % n);
  };

  const resetTobe = () => {
    setTbIdx(0);
    setTbArmado({});
    setPie(null);
  };

  // ── modo 4: preséntalo a alguien más ──────────────────────────────────
  const [personajeId, setPersonajeId] = useState<Personaje["id"]>("sofia");
  const [terceraOk, setTerceraOk] = useState<Record<string, string>>({});
  const [shakeRanura, setShakeRanura] = useState<string | null>(null);

  const personaje = PERSONAJES.find((p) => p.id === personajeId) ?? PERSONAJES[0]!;

  const claveRanura = (pid: string, oracionId: string, k: number) => `${pid}:${oracionId}:${k}`;
  const terceraCompleta = (pid: string) =>
    ORACIONES_TERCERA.every((o) => o.ranuras.every((_, k) => terceraOk[claveRanura(pid, o.id, k)] !== undefined));
  const terceraSofia = terceraCompleta("sofia");
  const terceraMateo = terceraCompleta("mateo");

  const elegirRanura = (oracionId: string, k: number, tipo: RanuraTipo, palabra: string) => {
    const clave = claveRanura(personaje.id, oracionId, k);
    if (terceraOk[clave]) return;
    const buena = palabraCorrecta(tipo, personaje);
    if (palabra === buena) {
      const siguiente = { ...terceraOk, [clave]: palabra };
      setTerceraOk(siguiente);
      const oracion = ORACIONES_TERCERA.find((o) => o.id === oracionId);
      const completa =
        oracion !== undefined &&
        oracion.ranuras.every((_, j) => siguiente[claveRanura(personaje.id, oracionId, j)] !== undefined);
      if (completa && oracion) {
        const texto = oracion.partes
          .map((parte, j) => rellena(parte, personaje) + (j < oracion.ranuras.length ? siguiente[claveRanura(personaje.id, oracionId, j)] ?? "" : ""))
          .join("");
        sfxPlace(`«${texto}» — ${rellena(oracion.traduccion, personaje)}`);
        sfxOk();
      } else {
        sfxPlace();
      }
    } else {
      setShakeRanura(clave);
      sfxNo(explicaTercera(tipo, palabra, personaje));
      window.setTimeout(() => setShakeRanura(null), 420);
    }
  };

  const resetTercera = () => {
    setPersonajeId("sofia");
    setTerceraOk({});
    setPie(null);
  };

  // ── modo 5: escribe el término ────────────────────────────────────────
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosarioIntento, setGlosarioIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosarioIntento((n) => n + 1);
    setPie(null);
  };

  // ── modo 6: completa el texto ─────────────────────────────────────────
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
    setPie(null);
  };

  // ── hechos (A5, verbatim) ─────────────────────────────────────────────
  const [hechos, setHechos] = useState<(boolean | null)[]>(() => HECHOS.map(() => null));
  const hechosDone = hechos.filter((h, i) => h !== null && h === HECHOS[i]!.respuesta).length >= HECHOS.length;
  const responderHecho = (i: number, valor: boolean) => {
    const h = HECHOS[i]!;
    if (hechos[i] === h.respuesta) return;
    setHechos((prev) => prev.map((v, j) => (j === i ? valor : v)));
    if (valor === h.respuesta) sfxPlace(h.retro);
    else sfxNo(h.retro);
  };

  // ── reto evaluable (A4) ───────────────────────────────────────────────
  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── modo 0: en el mostrador (simulador) ───────────────────────────────
  const [mIdx, setMIdx] = useState(0);
  const [mProbados, setMProbados] = useState<Record<string, number[]>>({});
  const [mOk, setMOk] = useState<Record<string, number>>({});
  const turnoM = TURNOS_MOSTRADOR[mIdx] ?? TURNOS_MOSTRADOR[0]!;
  const mCorrectos = Object.keys(mOk).length;
  const mDone = mCorrectos >= TURNOS_MOSTRADOR.length;
  const mALaPrimera = TURNOS_MOSTRADOR.filter((t) => mOk[t.id] !== undefined && (mProbados[t.id]?.length ?? 0) === 1).length;
  const mFalloVisto = TURNOS_MOSTRADOR.some((t) => (mProbados[t.id] ?? []).some((i) => !t.opciones[i]!.ok));

  const elegirMostrador = (i: number) => {
    const op = turnoM.opciones[i];
    if (!op || mOk[turnoM.id] !== undefined) return;
    if ((mProbados[turnoM.id] ?? []).includes(i)) return;
    setMProbados((prev) => ({ ...prev, [turnoM.id]: [...(prev[turnoM.id] ?? []), i] }));
    if (op.ok) {
      const siguiente = { ...mOk, [turnoM.id]: i };
      setMOk(siguiente);
      sfxPlace();
      if (Object.keys(siguiente).length >= TURNOS_MOSTRADOR.length) sfxOk();
    } else {
      sfxNo();
    }
  };
  const irMostrador = (i: number) => {
    const n = TURNOS_MOSTRADOR.length;
    setMIdx(((i % n) + n) % n);
  };
  const resetMostrador = () => {
    setMIdx(0);
    setMProbados({});
    setMOk({});
    setPie(null);
  };

  // ── objetivos de la sesión ────────────────────────────────────────────
  const objetivos = [
    { txt: "En el mostrador, equivócate a propósito una vez y mira qué teclea el registrador", done: mFalloVisto },
    { txt: "Atiende los 6 turnos del mostrador hasta dejar la ficha correcta", done: mDone },
    { txt: "Deja la ficha con al menos 5 de 6 campos a la primera", done: mALaPrimera >= 5 },
    { txt: "Coloca los 8 datos en su campo del formulario", done: formDone },
    { txt: "Separa Nationality (Mexican) de Country (Mexico)", done: natPaisDone },
    { txt: "Contesta las 8 rondas de «Pregunta y respuesta»", done: preguntasDone },
    { txt: "Arma las 6 oraciones con am / is / are", done: tobeDone },
    { txt: "Construye la negativa y las dos preguntas con to be", done: tobeFormasDone },
    { txt: "Presenta a Sofía en tercera persona (she / her)", done: terceraSofia },
    { txt: "Presenta a Mateo en tercera persona (he / his)", done: terceraMateo },
    { txt: "Escribe los 6 términos del formulario en inglés", done: glosarioDone, modo: "glosario" },
    { txt: "Completa el texto de A2", done: textoDone, modo: "texto" },
    { txt: "Acierta los 4 hechos verdadero o falso (A5)", done: hechosDone },
    { txt: "Aprueba el reto evaluable (70 %)", done: quizAprobado },
  ];

  const resetActual =
    modo === "mostrador"
      ? resetMostrador
      : modo === "formulario"
      ? resetFormulario
      : modo === "preguntas"
        ? resetPreguntas
        : modo === "tobe"
          ? resetTobe
          : modo === "tercera"
            ? resetTercera
            : modo === "glosario"
              ? resetGlosario
              : resetTexto;

  // arrastre nativo (ratón) + clic para seleccionar y clic para colocar (táctil)
  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      // El hueco que deja la tarjeta mientras viaja. Por atributo y no por
      // estado: un render por cada gesto de arrastre se nota con 20 tarjetas.
      e.currentTarget.setAttribute("data-arrastrando", "true");
    },
    onDragEnd: (e: React.DragEvent) => {
      // También cuando se suelta FUERA de cualquier zona; si no, la tarjeta se
      // queda medio borrada para siempre.
      e.currentTarget.removeAttribute("data-arrastrando");
      document.querySelectorAll('[data-sobre="true"]').forEach((z) => z.removeAttribute("data-sobre"));
    },
  });
  const dropProps = (onDrop: (id: string) => void) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      e.currentTarget.setAttribute("data-sobre", "true");
    },
    onDragLeave: (e: React.DragEvent) => {
      // `dragleave` salta también al pasar sobre un HIJO de la zona. Apagar sin
      // comprobar deja la zona parpadeando mientras mueves la mano por dentro.
      const r = e.currentTarget.getBoundingClientRect();
      const fuera = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (fuera) e.currentTarget.removeAttribute("data-sobre");
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.currentTarget.removeAttribute("data-sobre");
      const id = e.dataTransfer.getData("text/plain");
      if (id) onDrop(id);
    },
    "data-zona": "true" as const,
    role: "button" as const,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        (e.currentTarget as HTMLElement).click();
      }
    },
  });

  const pieExplicacion = (
    <div
      role="status"
      aria-live="polite"
      style={{
        borderRadius: 14,
        border: `1px solid ${pie ? (pie.ok ? `${OK}55` : `${NO}55`) : T.line}`,
        background: pie ? (pie.ok ? `${OK}12` : `${NO}12`) : T.glass,
        padding: "13px 16px",
        fontSize: 14,
        lineHeight: 1.55,
        color: T.text2,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        transition: "all .2s",
      }}
    >
      <i
        className={`fa-solid ${pie ? (pie.ok ? "fa-circle-check" : "fa-circle-exclamation") : "fa-comment-dots"}`}
        style={{ color: pie ? (pie.ok ? OK : NO) : T.text3, fontSize: 15, marginTop: 2 }}
      />
      <span>
        {pie ? pie.txt : "Aquí aparece el porqué de cada decisión: qué campo, qué pregunta o qué regla del verbo to be se te escapó."}
      </span>
    </div>
  );

  const pista =
    modo === "mostrador" ? (
      <>
        El registrador teclea <strong style={{ color: T.text }}>lo que entiende</strong>, no lo que quisiste decir. Equivócate a
        propósito una vez y mira la ficha: así se ve el costo de un «I have 17 years» o de contestar otra pregunta.
      </>
    ) : modo === "formulario" ? (
      <>
        <strong style={{ color: T.text }}>First name</strong> es el nombre de pila y <strong style={{ color: T.text }}>Last name</strong>{" "}
        el apellido: en inglés van en ese orden.
      </>
    ) : modo === "preguntas" ? (
      <>
        Las cuatro opciones son inglés correcto; <strong style={{ color: T.text }}>tres contestan otra pregunta</strong>. Lee la
        pregunta dos veces.
      </>
    ) : modo === "tobe" ? (
      <>
        El verbo <strong style={{ color: T.text }}>cambia con el sujeto</strong> (I am, he/she is, you/we/they are) y en la pregunta{" "}
        <strong style={{ color: T.text }}>se adelanta al sujeto</strong>.
      </>
    ) : modo === "tercera" ? (
      <>
        <strong style={{ color: T.text }}>He / She</strong> son el sujeto; <strong style={{ color: T.text }}>His / Her</strong> son «su».
        Cambia de personaje: todo lo que dependía de él o de ella cambia contigo.
      </>
    ) : modo === "glosario" ? (
      <>Recordar la etiqueta enseña más que reconocerla. Si te atoras, usa la pista o abre el banco de términos.</>
    ) : (
      <>
        Lee la ficha completa antes de escribir: el contexto decide la palabra. <strong style={{ color: T.text }}>Enter</strong> comprueba
        cada hueco.
      </>
    );

  const lectura =
    modo === "mostrador" ? (
      <>
        Turno {Math.min(mIdx + 1, TURNOS_MOSTRADOR.length)}/{TURNOS_MOSTRADOR.length} · ficha correcta: {mCorrectos}/
        {TURNOS_MOSTRADOR.length}
      </>
    ) : modo === "formulario" ? (
      <>
        Campos colocados: {Object.keys(asignado).length}/{CAMPOS_FORMULARIO.length}
      </>
    ) : modo === "preguntas" ? (
      <>
        Rondas resueltas: {Object.keys(qOk).length}/{RONDAS_PREGUNTA.length}
      </>
    ) : modo === "tobe" ? (
      <>
        Oraciones armadas: {RONDAS_TOBE.filter((r) => tbListo(r)).length}/{RONDAS_TOBE.length}
      </>
    ) : modo === "tercera" ? (
      <>Presenta a {personaje.firstName} en tercera persona</>
    ) : (
      <>Repaso de la ficha de inscripción</>
    );

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
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <style>{css(accent, color.rgba)}</style>

          {modo === "mostrador" && (
            <MostradorPanel
              accent={accent}
              indice={mIdx}
              probados={mProbados}
              resueltos={mOk}
              onElegir={elegirMostrador}
              onIr={irMostrador}
            />
          )}

          {modo === "formulario" && (
            <FormularioPanel
              accent={accent}
              asignado={asignado}
              selDato={selDato}
              shakeCampo={shakeCampo}
              onSelDato={(id) => setSelDato((v) => (v === id ? null : id))}
              onSoltar={soltar}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "preguntas" && (
            <PreguntasPanel
              accent={accent}
              indice={qIdx}
              resueltas={qOk}
              fallos={qFallo}
              onResponder={responderPregunta}
              onIr={irPregunta}
            />
          )}

          {modo === "tobe" && (
            <TobePanel
              accent={accent}
              indice={tbIdx}
              armado={armadoActual}
              listas={tbArmado}
              shakePieza={shakePieza}
              onPieza={ponerPieza}
              onBorrar={borrarUltima}
              onIr={irTobe}
            />
          )}

          {modo === "tercera" && (
            <TerceraPanel
              accent={accent}
              personaje={personaje}
              elegidas={terceraOk}
              shakeRanura={shakeRanura}
              onPersonaje={setPersonajeId}
              onElegir={elegirRanura}
            />
          )}

          {modo === "glosario" && (
            <div style={{ ...card, padding: "20px 22px" }}>
              <Eyebrow>
                <i className="fa-solid fa-spell-check" style={{ marginRight: 8, color: accent }} />
                Las etiquetas del formulario · IN-I-P04-A6
              </Eyebrow>
              <EscribeTermino
                key={glosarioIntento}
                pares={GLOSARIO}
                accent={accent}
                rgba={color.rgba}
                completado={glosarioDone}
                instrucciones="Lee la definición en español y su ejemplo en inglés, y escribe cómo se llama ese campo en un formulario en inglés. Se ignoran acentos y mayúsculas, y los sinónimos también valen."
                onCompletado={() => {
                  setGlosarioDone(true);
                  setPie({
                    ok: true,
                    txt: `Los seis campos, escritos de memoria. Con eso ya puedes hacer lo que pide A6: «${ACTIVIDAD_FINAL_A6}»`,
                  });
                  sfxOk();
                }}
                onAcierto={() => sfxPlace()}
                onError={() => sfxNo()}
              />
            </div>
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={PERFIL_PERSONAL_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                setPie({
                  ok: true,
                  txt: "Texto completo. Es la ficha de Ana García, la que trae la actividad A2: los mismos ocho campos que acabas de separar en el formulario.",
                });
                sfxOk();
              }}
              onAcierto={() => sfxPlace()}
              onError={() => sfxNo()}
            />
          )}

          {modo !== "mostrador" && pieExplicacion}
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
                  <Dato label="Mostrador" value={`${mCorrectos}/${TURNOS_MOSTRADOR.length}`} col={mDone ? OK : undefined} />
                  <Dato label="A la primera" value={`${mALaPrimera}/${TURNOS_MOSTRADOR.length}`} />
                  <Dato label="Formulario" value={`${Object.keys(asignado).length}/${CAMPOS_FORMULARIO.length}`} col={formDone ? OK : undefined} />
                  <Dato label="Preguntas" value={`${Object.keys(qOk).length}/${RONDAS_PREGUNTA.length}`} col={preguntasDone ? OK : undefined} />
                </div>
              </Bloque>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>{pista}</p>
              </Bloque>
              <Bloque titulo="Tus datos no se escriben aquí" icono="fa-shield-halved">
                <p style={{ margin: 0, color: T.text2 }}>
                  Todo el laboratorio trabaja sobre personajes ficticios. Saber llenar un formulario en inglés incluye saber cuándo
                  no llenarlo: teléfono, domicilio y fecha de nacimiento no se dan a cualquier sitio (criterio de A7).
                </p>
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
              <HechosCard accent={accent} respuestas={hechos} onResponder={responderHecho} />
              <RetoQuizCard
                quiz={RETO_QUIZ}
                accent={accent}
                rgba={color.rgba}
                aprobado={quizAprobado}
                onAprobado={() => setQuizAprobado(true)}
                playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
                mensajeAprobado="Ya puedes dar y pedir información personal en inglés sin confundir los campos."
              />
            </>
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              <Bloque titulo="La tarea que viene · A3" icono="fa-pen-nib">
                <p style={{ margin: 0, color: T.text2 }}>{CONSIGNA_A3.prompt}</p>
                {CONSIGNA_A3.pistas.map((p, i) => (
                  <p key={i} style={{ margin: 0, color: T.text2 }}>
                    <i className="fa-solid fa-angle-right" style={{ color: accent, marginRight: 8 }} />
                    {p}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Lectura A1 · para pensar" icono="fa-book-open-reader">
                {COMPRENSION_A1.map((c, i) => (
                  <details key={i} style={{ borderRadius: 11, border: `1px solid ${T.line}`, background: T.inset, padding: "10px 13px" }}>
                    <summary style={{ cursor: "pointer", fontWeight: 700, color: T.text2, lineHeight: 1.45 }}>{c.pregunta}</summary>
                    <p style={{ margin: "9px 0 0", color: T.text3 }}>{c.guia}</p>
                  </details>
                ))}
              </Bloque>
              <Bloque titulo="Qué es verbatim" icono="fa-quote-right">
                <p style={{ margin: 0, color: T.text3 }}>
                  <strong style={{ color: T.text2 }}>Verbatim de IN-I-P04:</strong> la lectura A1 «About me» con sus preguntas, el texto con
                  huecos (A2), la consigna de A3, el reto de cinco reactivos (A4), los cuatro enunciados verdadero/falso (A5) y el glosario
                  (A6). <strong style={{ color: T.text2 }}>Escrito para este laboratorio:</strong> las fichas de Sofía Ramírez Torres y
                  Mateo Herrera Solís, el mostrador, las rondas de pregunta y respuesta, las transformaciones de to be y las oraciones
                  de tercera persona. Personas, domicilios, teléfonos y correos son <strong style={{ color: T.text2 }}>ficticios</strong>;
                  Ana García y sus datos son los de la actividad A2. Inglés estadounidense estándar.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={PERFIL_PERSONAL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Imagen de escena: gradiente + icono detrás, la foto encima si existe
 * ═══════════════════════════════════════════════════════════════════════════ */
function EscenaImg({ clave, icono }: { clave: string; icono: string }) {
  const [fallo, setFallo] = useState(false);
  return (
    <div className="prf-img" aria-hidden>
      <i className={`fa-solid ${icono}`} />
      {!fallo && (
        <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} />
      )}
    </div>
  );
}

const ANIMO_ICONO: Record<AnimoRegistrador, { icono: string; col: string }> = {
  feliz: { icono: "fa-face-smile", col: OK },
  duda: { icono: "fa-face-meh", col: "#FFC75A" },
  confuso: { icono: "fa-face-frown-open", col: NO },
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 0 — En el mostrador (simulador: la ficha refleja lo que dices)
 * ═══════════════════════════════════════════════════════════════════════════ */
function MostradorPanel({
  accent,
  indice,
  probados,
  resueltos,
  onElegir,
  onIr,
}: {
  accent: string;
  indice: number;
  probados: Record<string, number[]>;
  resueltos: Record<string, number>;
  onElegir: (i: number) => void;
  onIr: (i: number) => void;
}) {
  const turno = TURNOS_MOSTRADOR[indice] ?? TURNOS_MOSTRADOR[0]!;
  const intentos = probados[turno.id] ?? [];
  const resuelto = resueltos[turno.id] !== undefined;
  const ultimo = intentos.length > 0 ? turno.opciones[intentos[intentos.length - 1]!] : undefined;
  const hechos = TURNOS_MOSTRADOR.filter((t) => resueltos[t.id] !== undefined).length;
  const todos = hechos >= TURNOS_MOSTRADOR.length;
  const animo = ultimo ? ANIMO_ICONO[ultimo.animo] : { icono: "fa-user-tie", col: accent };

  return (
    <>
      <div className="prf-card" data-done={resuelto} style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Eyebrow>
            Mostrador de inscripción · turno {indice + 1} de {TURNOS_MOSTRADOR.length}
          </Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: todos ? OK : T.text3, ...NUM }}>
            {hechos}/{TURNOS_MOSTRADOR.length}
          </span>
        </div>

        <EscenaImg clave={turno.imagen} icono="fa-building-columns" />

        <div className="prf-habla">
          <span className="prf-cara" style={{ color: animo.col, borderColor: animo.col }}>
            <i className={`fa-solid ${animo.icono}`} />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>Mr. Hale, registrador</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <p style={{ margin: 0, fontSize: 19, lineHeight: 1.4, color: "#fff", fontWeight: 800 }}>{turno.pregunta}</p>
              <BotonEscuchar txt={turno.pregunta} accent={accent} />
            </div>
            <p style={{ margin: "5px 0 0", fontSize: 14, color: T.text3 }}>{turno.traduccion}</p>
          </div>
        </div>

        {ultimo && (
          <div className="prf-reac" data-ok={ultimo.ok}>
            <strong style={{ color: ultimo.ok ? OK : NO }}>«{ultimo.reaccion}»</strong> {ultimo.porque}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Eyebrow>Sofía responde: elige qué dice</Eyebrow>
        {turno.opciones.map((op, i) => {
          const probada = intentos.includes(i);
          const buena = resuelto && resueltos[turno.id] === i;
          const mala = probada && !op.ok;
          return (
            <button
              key={op.texto}
              type="button"
              className="prf-op"
              data-ok={buena}
              data-bad={mala}
              disabled={resuelto || probada}
              onClick={() => onElegir(i)}
            >
              <i
                className={`fa-solid ${buena ? "fa-circle-check" : mala ? "fa-circle-xmark" : "fa-comment"}`}
                style={{ fontSize: 14, marginTop: 3, color: buena ? OK : mala ? NO : T.text3, opacity: buena || mala ? 1 : 0.5 }}
              />
              <span style={{ flex: 1 }}>{op.texto}</span>
            </button>
          );
        })}
      </div>

      <div className="prf-card" style={{ padding: "16px 18px" }}>
        <Eyebrow>Application form · lo que teclea el registrador</Eyebrow>
        <div className="prf-ficha">
          {TURNOS_MOSTRADOR.map((t) => {
            const ok = resueltos[t.id];
            const ints = probados[t.id] ?? [];
            const op = ok !== undefined ? t.opciones[ok] : ints.length > 0 ? t.opciones[ints[ints.length - 1]!] : undefined;
            const estado = ok !== undefined ? "ok" : op ? "mal" : "vacio";
            return (
              <div key={t.id} className="prf-fila" data-estado={estado}>
                <span>{t.campo}</span>
                <strong>{op ? op.escrito : "—"}</strong>
              </div>
            );
          })}
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 14, color: todos ? OK : T.text3, fontWeight: 700 }}>
          {todos
            ? `Ficha aceptada: ${TURNOS_MOSTRADOR.filter((t) => (probados[t.id]?.length ?? 0) === 1).length} de ${TURNOS_MOSTRADOR.length} campos a la primera. Simulación con datos inventados.`
            : "Rojo = el registrador entendió otra cosa. Verde = dato correcto. Simulación con datos inventados."}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button className="prf-mini" onClick={() => onIr(indice - 1)} title="Turno anterior">
          <i className="fa-solid fa-angle-left" style={{ marginRight: 7 }} />
          Anterior
        </button>
        {TURNOS_MOSTRADOR.map((t, i) => (
          <button
            key={t.id}
            className="prf-mini"
            data-on={i === indice}
            data-done={resueltos[t.id] !== undefined}
            onClick={() => onIr(i)}
            title={t.campo}
            style={{ minWidth: 40 }}
          >
            {resueltos[t.id] !== undefined ? <i className="fa-solid fa-check" /> : i + 1}
          </button>
        ))}
        <button className="prf-mini" onClick={() => onIr(indice + 1)} title="Siguiente turno">
          Siguiente
          <i className="fa-solid fa-angle-right" style={{ marginLeft: 7 }} />
        </button>
      </div>
    </>
  );
}

const css = (accent: string, rgba: string) => `
        @keyframes prfShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        .prf-card { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px 18px; transition:all .16s; }
        .prf-card[data-done="true"] { border-color:${OK}66; }

        /* Fichas de dato del formulario */
        .prf-chip { cursor:grab; display:inline-flex; align-items:center; gap:9px; padding:9px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700;
          transition:all .14s; user-select:none; font-family:inherit; }
        .prf-chip:hover:not(:disabled) { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .prf-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.22); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px); }
        .prf-chip:disabled { opacity:.32; cursor:default; }
        .prf-chip:active:not(:disabled) { cursor:grabbing; }

        /* Campo del formulario */
        .prf-campo { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:11px 14px;
          display:flex; flex-direction:column; gap:7px; transition:all .16s; }
        .prf-campo[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.09); cursor:pointer; }
        .prf-campo[data-shake="true"] { animation:prfShake .4s; border-color:${NO}; }
        .prf-campo[data-ok="true"] { border-color:${OK}66; background:${OK}10; }
        .prf-slot { min-height:38px; border-radius:9px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:flex; align-items:center; padding:0 12px; font-size:14px; font-weight:700; color:${T.text3}; }
        .prf-slot[data-ok="true"] { border-style:solid; border-color:${OK}; color:#fff; background:${OK}14; }

        /* Opciones (respuestas, piezas, palabras) */
        .prf-op { cursor:pointer; display:flex; align-items:flex-start; gap:11px; width:100%; text-align:left; border-radius:12px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; padding:11px 14px;
          line-height:1.45; transition:all .14s; font-family:inherit; }
        .prf-op:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .prf-op:disabled { cursor:default; }
        .prf-op[data-ok="true"] { border-color:${OK}; background:${OK}1c; color:#fff; }
        .prf-op[data-bad="true"] { border-color:${NO}; background:${NO}16; }

        /* Piezas del constructor de oraciones */
        .prf-pieza { cursor:pointer; border-radius:10px; border:1.5px solid ${T.lineStrong}; background:${T.glassSoft};
          color:#fff; font-size:15px; font-weight:800; padding:9px 15px; transition:all .14s; font-family:inherit; }
        .prf-pieza:hover:not(:disabled) { border-color:${accent}; background:rgba(${rgba},0.18); transform:translateY(-2px); }
        .prf-pieza:disabled { opacity:.3; cursor:default; }
        .prf-pieza[data-shake="true"] { animation:prfShake .4s; border-color:${NO}; background:${NO}18; }

        .prf-linea { border-radius:13px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-height:56px;
          padding:10px 14px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; transition:all .16s; }
        .prf-linea[data-ok="true"] { border-style:solid; border-color:${OK}; background:${OK}10; }
        .prf-palabra { font-size:16px; font-weight:800; color:#fff; }

        /* Ranuras de la tercera persona */
        .prf-ranura { display:inline-flex; align-items:center; gap:6px; border-radius:9px; border:1.5px dashed ${T.lineStrong};
          background:${T.inset}; padding:2px 9px; font-size:15px; font-weight:800; color:${T.text3}; transition:all .16s; }
        .prf-ranura[data-ok="true"] { border-style:solid; border-color:${OK}; color:${OK}; background:${OK}14; }
        .prf-ranura[data-shake="true"] { animation:prfShake .4s; border-color:${NO}; }

        .prf-mini { cursor:pointer; padding:7px 13px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; font-family:inherit; }
        .prf-mini:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .prf-mini:disabled { opacity:.45; cursor:not-allowed; }
        .prf-mini[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.16); color:#fff; }
        .prf-mini[data-done="true"] { color:${OK}; border-color:${OK}66; }

        .prf-vf { cursor:pointer; padding:8px 16px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:14px; font-weight:800; transition:all .14s; font-family:inherit; }
        .prf-vf:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .prf-vf:disabled { cursor:default; opacity:.85; }
        .prf-vf[data-on="true"] { border-color:${OK}; background:${OK}1f; color:#fff; }
        .prf-vf[data-bad="true"] { border-color:${NO}; background:${NO}1f; color:#fff; }

        .prf-img { position:relative; width:100%; aspect-ratio:16/6; max-height:170px; border-radius:14px; overflow:hidden;
          display:flex; align-items:center; justify-content:center; margin-bottom:12px;
          background:linear-gradient(135deg, rgba(${rgba},0.28) 0%, rgba(8,19,31,0.9) 100%); border:1px solid ${T.line}; }
        .prf-img i { font-size:44px; color:rgba(255,255,255,0.22); }
        .prf-img img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .prf-habla { display:flex; gap:14px; align-items:flex-start; }
        .prf-cara { flex-shrink:0; width:52px; height:52px; border-radius:50%; border:2px solid; display:flex; align-items:center;
          justify-content:center; font-size:28px; background:${T.inset}; transition:all .2s; }
        .prf-reac { margin-top:14px; border-radius:13px; border:1px solid ${NO}55; background:${NO}12; padding:12px 15px;
          font-size:14px; line-height:1.55; color:${T.text2}; }
        .prf-reac[data-ok="true"] { border-color:${OK}55; background:${OK}12; }
        .prf-ficha { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:8px; margin-top:12px; }
        .prf-fila { display:grid; gap:2px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; padding:9px 12px; min-width:0; }
        .prf-fila span { font-size:14px; font-weight:800; color:${T.text3}; }
        .prf-fila strong { font-size:15px; font-weight:800; color:${T.text3}; overflow-wrap:anywhere; }
        .prf-fila[data-estado="ok"] { border-style:solid; border-color:${OK}; background:${OK}12; }
        .prf-fila[data-estado="ok"] strong { color:#fff; }
        .prf-fila[data-estado="mal"] { border-style:solid; border-color:${NO}; background:${NO}14; }
        .prf-fila[data-estado="mal"] strong { color:${NO}; }

        /* Identidad del tablero: cada tarjeta lleva su franja de color */
        .prf-campo, .prf-card { --tono:196; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.10) 0%, transparent 62%); }
        .prf-campo:nth-of-type(6n+1), .prf-card:nth-of-type(6n+1) { --tono:196; }
        .prf-campo:nth-of-type(6n+2), .prf-card:nth-of-type(6n+2) { --tono:268; }
        .prf-campo:nth-of-type(6n+3), .prf-card:nth-of-type(6n+3) { --tono:42; }
        .prf-campo:nth-of-type(6n+4), .prf-card:nth-of-type(6n+4) { --tono:150; }
        .prf-campo:nth-of-type(6n+5), .prf-card:nth-of-type(6n+5) { --tono:328; }
        .prf-campo:nth-of-type(6n+6), .prf-card:nth-of-type(6n+6) { --tono:16; }
        .prf-campo::before, .prf-card::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }

        @media (prefers-reduced-motion: reduce){
          .prf-campo[data-shake="true"], .prf-pieza[data-shake="true"], .prf-ranura[data-shake="true"] { animation:none; }
          .prf-chip, .prf-chip:hover, .prf-chip[data-sel="true"], .prf-pieza:hover { transform:none; transition:none; }
        }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Tipos de los ayudantes de arrastre (los paneles los reciben como props)
 * ═══════════════════════════════════════════════════════════════════════════ */
type DragFactory = (id: string) => {
  draggable: boolean;
  onDragStart: (e: React.DragEvent) => void;
};
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  role: "button";
  tabIndex: number;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — Llena el formulario
 * ═══════════════════════════════════════════════════════════════════════════ */
function FormularioPanel({
  accent,
  asignado,
  selDato,
  shakeCampo,
  onSelDato,
  onSoltar,
  dragProps,
  dropProps,
}: {
  accent: string;
  asignado: Record<string, string>;
  selDato: string | null;
  shakeCampo: string | null;
  onSelDato: (id: string) => void;
  onSoltar: (campoId: string, datoId: string) => void;
  dragProps: DragFactory;
  dropProps: DropFactory;
}) {
  const puestos = Object.keys(asignado).length;

  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <Eyebrow>Summer course application form · los datos que dicta Mateo</Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: puestos >= CAMPOS_FORMULARIO.length ? OK : T.text3, ...NUM }}>
            {puestos}/{CAMPOS_FORMULARIO.length} campos
          </span>
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.6, color: T.text2 }}>
          Mateo se inscribe en línea a un curso de verano y el formulario está en inglés. Arrastra cada dato al campo que le
          corresponde —o toca el dato y después el campo—. Ojo: dos de estos datos se parecen mucho y no son lo mismo.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
          {DATOS_FICHA.map((d) => {
            const usado = Object.values(asignado).includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                className="prf-chip"
                data-sel={selDato === d.id}
                disabled={usado}
                title={usado ? "Ya está en su campo" : "Tócalo y después toca su campo"}
                onClick={() => onSelDato(d.id)}
                {...dragProps(d.id)}
              >
                <i className="fa-solid fa-grip-vertical" style={{ fontSize: 14, color: T.text3 }} />
                {d.valor}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 12 }}>
        {CAMPOS_FORMULARIO.map((c) => {
          const datoId = asignado[c.id];
          const dato = datoId ? DATOS_FICHA.find((d) => d.id === datoId) : undefined;
          return (
            <div
              key={c.id}
              className="prf-campo"
              data-ok={dato !== undefined}
              data-shake={shakeCampo === c.id}
              data-armed={dato === undefined && selDato !== null}
              onClick={() => {
                if (!dato && selDato) onSoltar(c.id, selDato);
              }}
              style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onSoltar(c.id, id))}
            >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={c.label} />
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <VinetaTermino termino={c.label} color={dato ? OK : accent} icono={c.icono} tam={29} radio={8} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{c.label}</span>
              </div>
              <span style={{ fontSize: 14, color: T.text3, lineHeight: 1.4 }}>{c.ayuda}</span>
              <div className="prf-slot" data-ok={dato !== undefined}>
                {dato ? dato.valor : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — Pregunta y respuesta
 * ═══════════════════════════════════════════════════════════════════════════ */
function PreguntasPanel({
  accent,
  indice,
  resueltas,
  fallos,
  onResponder,
  onIr,
}: {
  accent: string;
  indice: number;
  resueltas: Record<string, boolean>;
  fallos: Record<string, number>;
  onResponder: (i: number) => void;
  onIr: (i: number) => void;
}) {
  const ronda = RONDAS_PREGUNTA[indice] ?? RONDAS_PREGUNTA[0]!;
  const resuelta = resueltas[ronda.id] === true;
  const hechas = Object.keys(resueltas).length;

  return (
    <>
      <div className="prf-card" data-done={resuelta} style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Eyebrow>
            Ronda {indice + 1} de {RONDAS_PREGUNTA.length} · alguien te pregunta
          </Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: hechas >= RONDAS_PREGUNTA.length ? OK : T.text3, ...NUM }}>
            {hechas}/{RONDAS_PREGUNTA.length}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: 21, lineHeight: 1.4, color: "#fff", fontWeight: 800 }}>{ronda.pregunta}</p>
          <BotonEscuchar txt={ronda.pregunta} accent={accent} />
        </div>
        <p style={{ margin: "7px 0 0", fontSize: 14, color: T.text3 }}>{ronda.traduccion}</p>

        {resuelta && (
          <div
            style={{
              marginTop: 14,
              borderRadius: 13,
              border: `1px solid ${OK}55`,
              background: `${OK}12`,
              padding: "12px 15px",
              fontSize: 14,
              lineHeight: 1.55,
              color: T.text2,
            }}
          >
            <span style={{ fontWeight: 800, color: OK, marginRight: 7 }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: 7 }} />
              {ronda.opciones[ronda.correcta]?.texto}
            </span>
            {ronda.porque}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ronda.opciones.map((op, i) => {
          const buena = resuelta && i === ronda.correcta;
          const mala = fallos[`${ronda.id}:${i}`] !== undefined;
          return (
            <button
              key={op.texto}
              type="button"
              className="prf-op"
              data-ok={buena}
              data-bad={mala && !buena}
              disabled={resuelta}
              onClick={() => onResponder(i)}
            >
              <i
                className={`fa-solid ${buena ? "fa-circle-check" : mala ? "fa-circle-xmark" : "fa-circle"}`}
                style={{ fontSize: 14, marginTop: 3, color: buena ? OK : mala ? NO : T.text3, opacity: buena || mala ? 1 : 0.35 }}
              />
              <span style={{ flex: 1 }}>
                {op.texto}
                {mala && !buena && (
                  <span style={{ display: "block", fontSize: 14, color: T.text3, marginTop: 4, fontWeight: 600 }}>
                    Contesta a: {op.contesta}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button className="prf-mini" onClick={() => onIr(indice - 1)} title="Pregunta anterior">
          <i className="fa-solid fa-angle-left" style={{ marginRight: 7 }} />
          Anterior
        </button>
        {RONDAS_PREGUNTA.map((r, i) => (
          <button
            key={r.id}
            className="prf-mini"
            data-on={i === indice}
            data-done={resueltas[r.id] === true}
            onClick={() => onIr(i)}
            title={r.pregunta}
            style={{ minWidth: 38 }}
          >
            {resueltas[r.id] ? <i className="fa-solid fa-check" /> : i + 1}
          </button>
        ))}
        <button className="prf-mini" onClick={() => onIr(indice + 1)} title="Siguiente pregunta">
          Siguiente
          <i className="fa-solid fa-angle-right" style={{ marginLeft: 7 }} />
        </button>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — To be en su sitio
 * ═══════════════════════════════════════════════════════════════════════════ */
const FORMA_INFO: Record<string, { label: string; icono: string }> = {
  afirmativa: { label: "Afirmativa", icono: "fa-plus" },
  negativa: { label: "Negativa", icono: "fa-minus" },
  interrogativa: { label: "Pregunta", icono: "fa-question" },
};

function TobePanel({
  accent,
  indice,
  armado,
  listas,
  shakePieza,
  onPieza,
  onBorrar,
  onIr,
}: {
  accent: string;
  indice: number;
  armado: string[];
  listas: Record<string, string[]>;
  shakePieza: string | null;
  onPieza: (pieza: string, iPieza: number) => void;
  onBorrar: () => void;
  onIr: (i: number) => void;
}) {
  const ronda = RONDAS_TOBE[indice] ?? RONDAS_TOBE[0]!;
  const completa = armado.length >= ronda.solucion.length;
  const hechas = RONDAS_TOBE.filter((r) => (listas[r.id]?.length ?? 0) >= r.solucion.length).length;
  const cierre = ronda.forma === "interrogativa" ? "?" : ".";
  const oracion = `${armado.join(" ")}${completa ? cierre : ""}`;
  const info = FORMA_INFO[ronda.forma] ?? FORMA_INFO["afirmativa"]!;

  return (
    <>
      <div className="prf-card" data-done={completa} style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Eyebrow>
            Transformación {indice + 1} de {RONDAS_TOBE.length}
          </Eyebrow>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                borderRadius: 999,
                border: `1px solid rgba(255,255,255,0.14)`,
                padding: "4px 12px",
                fontSize: 14,
                fontWeight: 800,
                color: accent,
              }}
            >
              <i className={`fa-solid ${info.icono}`} style={{ fontSize: 14 }} />
              {info.label}
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: hechas >= RONDAS_TOBE.length ? OK : T.text3, ...NUM }}>
              {hechas}/{RONDAS_TOBE.length}
            </span>
          </span>
        </div>

        {ronda.partida !== "—" && (
          <div style={{ fontSize: 14, color: T.text3, marginBottom: 10 }}>
            <i className="fa-solid fa-arrow-turn-down" style={{ marginRight: 9, transform: "rotate(-90deg)" }} />
            Partes de: <strong style={{ color: T.text2, fontWeight: 700 }}>{ronda.partida}</strong>
          </div>
        )}

        <p style={{ margin: "0 0 14px", fontSize: 15.5, lineHeight: 1.6, color: "#fff", fontWeight: 600 }}>{ronda.consigna}</p>

        <div className="prf-linea" data-ok={completa}>
          {armado.length === 0 ? (
            <span style={{ fontSize: 14, color: T.text3 }}>Toca las piezas en el orden correcto…</span>
          ) : (
            armado.map((p, i) => (
              <span key={`${p}-${i}`} className="prf-palabra">
                {p}
                {i === armado.length - 1 && completa ? cierre : ""}
              </span>
            ))
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button className="prf-mini" onClick={onBorrar} disabled={armado.length === 0 || completa} title="Quitar la última pieza">
            <i className="fa-solid fa-delete-left" style={{ marginRight: 7 }} />
            Borrar la última
          </button>
          {completa && <BotonEscuchar txt={oracion} accent={accent} />}
        </div>

        {completa && (
          <div
            style={{
              marginTop: 14,
              borderRadius: 13,
              border: `1px solid ${OK}55`,
              background: `${OK}12`,
              padding: "12px 15px",
              fontSize: 14,
              lineHeight: 1.55,
              color: T.text2,
            }}
          >
            <strong style={{ color: OK, marginRight: 7 }}>{ronda.traduccion}</strong>
            {ronda.regla}
          </div>
        )}
      </div>

      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Las piezas · tócalas en orden</Eyebrow>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 12 }}>
          {ronda.banco.map((p, i) => (
            <button
              key={`${ronda.id}-${p}-${i}`}
              type="button"
              className="prf-pieza"
              data-shake={shakePieza === `${ronda.id}:${i}`}
              disabled={completa}
              onClick={() => onPieza(p, i)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button className="prf-mini" onClick={() => onIr(indice - 1)} title="Transformación anterior">
          <i className="fa-solid fa-angle-left" style={{ marginRight: 7 }} />
          Anterior
        </button>
        {RONDAS_TOBE.map((r, i) => (
          <button
            key={r.id}
            className="prf-mini"
            data-on={i === indice}
            data-done={(listas[r.id]?.length ?? 0) >= r.solucion.length}
            onClick={() => onIr(i)}
            title={r.consigna}
            style={{ minWidth: 38 }}
          >
            {(listas[r.id]?.length ?? 0) >= r.solucion.length ? <i className="fa-solid fa-check" /> : i + 1}
          </button>
        ))}
        <button className="prf-mini" onClick={() => onIr(indice + 1)} title="Siguiente transformación">
          Siguiente
          <i className="fa-solid fa-angle-right" style={{ marginLeft: 7 }} />
        </button>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 4 — Preséntalo a alguien más (tercera persona)
 * ═══════════════════════════════════════════════════════════════════════════ */
function TerceraPanel({
  accent,
  personaje,
  elegidas,
  shakeRanura,
  onPersonaje,
  onElegir,
}: {
  accent: string;
  personaje: Personaje;
  elegidas: Record<string, string>;
  shakeRanura: string | null;
  onPersonaje: (id: Personaje["id"]) => void;
  onElegir: (oracionId: string, k: number, tipo: RanuraTipo, palabra: string) => void;
}) {
  const clave = (oracionId: string, k: number) => `${personaje.id}:${oracionId}:${k}`;
  const listas = ORACIONES_TERCERA.filter((o) => o.ranuras.every((_, k) => elegidas[clave(o.id, k)] !== undefined)).length;

  return (
    <>
      <div style={{ ...card, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Eyebrow>La ficha de tu compañera o compañero · preséntala en inglés</Eyebrow>
          <span style={{ fontSize: 14, fontWeight: 800, color: listas >= ORACIONES_TERCERA.length ? OK : T.text3, ...NUM }}>
            {listas}/{ORACIONES_TERCERA.length}
          </span>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 14 }}>
          {PERSONAJES.map((p) => (
            <button key={p.id} className="prf-mini" data-on={p.id === personaje.id} onClick={() => onPersonaje(p.id)}>
              <i className={`fa-solid ${p.pronombre === "She" ? "fa-person-dress" : "fa-person"}`} style={{ marginRight: 8 }} />
              {p.nombre} · {p.pronombre.toLowerCase()} / {p.posesivo.toLowerCase()}
            </button>
          ))}
        </div>

        <div
          style={{
            borderRadius: 14,
            border: `1px solid ${T.line}`,
            background: T.inset,
            padding: "14px 17px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))",
            gap: "9px 18px",
          }}
        >
          {[
            ["First name", personaje.firstName],
            ["Last name", personaje.lastName],
            ["Age", personaje.age],
            ["Nationality", personaje.nationality],
            ["Occupation", personaje.occupation],
            ["Email address", personaje.email],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase" }}>{k}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 2, wordBreak: "break-word" }}>{v}</div>
            </div>
          ))}
        </div>

        <p style={{ margin: "14px 0 0", fontSize: 14, lineHeight: 1.6, color: T.text2 }}>
          {personaje.firstName} habla de sí {personaje.pronombre === "She" ? "misma" : "mismo"}. Tú tienes que presentar
          {personaje.pronombre === "She" ? "la" : "lo"} a alguien más: elige en cada hueco la palabra que hace falta al pasar a la
          tercera persona.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ORACIONES_TERCERA.map((o) => {
          const completa = o.ranuras.every((_, k) => elegidas[clave(o.id, k)] !== undefined);
          const textoFinal = o.partes
            .map((parte, k) => rellena(parte, personaje) + (k < o.ranuras.length ? elegidas[clave(o.id, k)] ?? "" : ""))
            .join("");
          return (
            <div key={o.id} className="prf-card" data-done={completa} style={{ padding: "15px 18px" }}>
              <div style={{ fontSize: 14, color: T.text3, marginBottom: 9 }}>
                <i className="fa-solid fa-quote-left" style={{ fontSize: 14, marginRight: 8, color: accent }} />
                {personaje.firstName} dice: <strong style={{ color: T.text2, fontWeight: 700 }}>{rellena(o.primera, personaje)}</strong>
              </div>

              <p style={{ margin: 0, fontSize: 16, lineHeight: 2.1, color: "#fff", fontWeight: 600 }}>
                {o.partes.map((parte, k) => (
                  <span key={k}>
                    {rellena(parte, personaje)}
                    {k < o.ranuras.length && (
                      <span
                        className="prf-ranura"
                        data-ok={elegidas[clave(o.id, k)] !== undefined}
                        data-shake={shakeRanura === clave(o.id, k)}
                      >
                        {elegidas[clave(o.id, k)] ?? "____"}
                      </span>
                    )}
                  </span>
                ))}
              </p>

              {completa ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
                  <span style={{ fontSize: 14, color: T.text2 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: OK, marginRight: 8 }} />
                    {rellena(o.traduccion, personaje)}
                  </span>
                  <BotonEscuchar txt={textoFinal} accent={accent} />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  {o.ranuras.map((tipo, k) =>
                    elegidas[clave(o.id, k)] !== undefined ? null : (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: T.text3, minWidth: 74 }}>Hueco {k + 1}</span>
                        {(OPCIONES_RANURA[tipo] ?? []).map((palabra) => (
                          <button
                            key={palabra}
                            type="button"
                            className="prf-pieza"
                            style={{ fontSize: 14, padding: "7px 13px" }}
                            onClick={() => onElegir(o.id, k, tipo, palabra)}
                          >
                            {palabra}
                          </button>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Hechos verdadero / falso (A5, verbatim)
 * ═══════════════════════════════════════════════════════════════════════════ */
function HechosCard({
  accent,
  respuestas,
  onResponder,
}: {
  accent: string;
  respuestas: (boolean | null)[];
  onResponder: (i: number, valor: boolean) => void;
}) {
  const aciertos = respuestas.filter((r, i) => r !== null && r === HECHOS[i]!.respuesta).length;

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
        <Eyebrow>
          <i className="fa-solid fa-scale-unbalanced" style={{ marginRight: 8, color: accent }} />
          True or False · About me (A5, verbatim)
        </Eyebrow>
        <span style={{ fontSize: 14, fontWeight: 800, color: aciertos >= HECHOS.length ? OK : T.text3, ...NUM }}>
          {aciertos}/{HECHOS.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
        {HECHOS.map((h, i) => {
          const r = respuestas[i];
          const resuelto = r !== null && r !== undefined && r === h.respuesta;
          const fallado = r !== null && r !== undefined && r !== h.respuesta;
          return (
            <div
              key={h.enunciado}
              style={{
                borderRadius: 13,
                border: `1px solid ${resuelto ? `${OK}55` : fallado ? `${NO}55` : T.line}`,
                background: resuelto ? `${OK}0f` : T.glass,
                padding: "13px 16px",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.5 }}>{h.enunciado}</div>
                {r !== null && r !== undefined && (
                  <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, marginTop: 7 }}>
                    <i
                      className={`fa-solid ${resuelto ? "fa-circle-check" : "fa-circle-exclamation"}`}
                      style={{ color: resuelto ? OK : NO, marginRight: 8 }}
                    />
                    {h.retro}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="prf-vf"
                  data-on={resuelto && h.respuesta === true}
                  data-bad={fallado && r === true}
                  disabled={resuelto}
                  onClick={() => onResponder(i, true)}
                >
                  Verdadero
                </button>
                <button
                  className="prf-vf"
                  data-on={resuelto && h.respuesta === false}
                  data-bad={fallado && r === false}
                  disabled={resuelto}
                  onClick={() => onResponder(i, false)}
                >
                  Falso
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
