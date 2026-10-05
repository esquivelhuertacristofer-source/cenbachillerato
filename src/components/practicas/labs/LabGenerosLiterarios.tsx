"use client";

/**
 * Laboratorio — Géneros literarios: formas de contar y decir
 * Práctica experimental para LC-III-P03-A1 (Lenguaje y Comunicación III).
 *
 * EXPERIMENTO CENTRAL: el «transformador de géneros». Una misma semilla de
 * historia (ficticia, escrita para el laboratorio) se vuelve texto lírico,
 * narrativo o dramático según la voz, la forma y los rasgos que el alumno
 * elige; la vista previa se reformatea (párrafos, versos, escena con
 * acotaciones) y un medidor enciende los rasgos de cada género.
 *
 * Modos: transformador · clasifica las obras · empareja el rasgo · escribe el
 * término (glosario A5) · completa el texto. Cuestionario V/F en «Reto».
 * Contenido curricular VERBATIM de LC-III·P03 (ahora en la pestaña «Teoría»).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { GENEROS_LITERARIOS_HUECOS } from "./generos-literarios-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { LabShell, Bloque, BotonHerramienta, Mesa } from "./_shell";
import { GENEROS_LITERARIOS_FICHA } from "./generos-literarios-ficha";
import {
  OBRAS,
  GENERO_INFO,
  RASGOS,
  PARES,
  QUIZ,
  DATO_GENEROS,
  type Genero,
} from "./generos-literarios-data";
import {
  ELECCION_INICIAL,
  SEMILLA,
  VOCES,
  FORMAS,
  RASGOS as RASGOS_SIM,
  NOMBRE_GENERO,
  componer,
  medir,
  diagnosticar,
  generoLogrado,
  alternarRasgo,
  type EleccionGenero,
  type GeneroSim,
  type Linea,
} from "./generos-literarios-sim";

const NO = "#FF5E5E";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-generos-literarios-reto";
const RUTA_SIM = "/media/labs-sim/generos-literarios";

type Modo = "transformador" | "obras" | "rasgos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "transformador", label: "Transforma la historia", icono: "fa-wand-magic-sparkles" },
  { id: "obras", label: "¿A qué género pertenece?", icono: "fa-book-open-reader" },
  { id: "rasgos", label: "La característica de cada género", icono: "fa-list-check" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const COLOR_GENERO: Record<GeneroSim, string> = {
  narrativo: "#4FC3F7",
  lirico: "#F48FB1",
  dramatico: "#FFB74D",
  ensayistico: "#A5D6A7",
};

/** Foto de escena con respaldo: gradiente + ícono detrás; si la imagen falta, se oculta. */
function FotoSim({ clave, icono }: { clave: string; icono: string }) {
  const [fallo, setFallo] = useState(false);
  return (
    <span className="gl-foto" aria-hidden>
      <i className={`fa-solid ${icono}`} />
      {!fallo && <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} />}
    </span>
  );
}

function VistaPrevia({ lineas, forma }: { lineas: Linea[]; forma: string }) {
  return (
    <div className="gl-previa" data-forma={forma} aria-live="polite">
      {lineas.map((l, i) => {
        if (l.tipo === "titulo") return <div key={i} className="gl-l-titulo">{l.texto}</div>;
        if (l.tipo === "verso") return <div key={i} className="gl-l-verso">{l.texto}</div>;
        if (l.tipo === "acotacion") return <p key={i} className="gl-l-acot">{l.texto}</p>;
        if (l.tipo === "ensayo") return <p key={i} className="gl-l-ensayo">{l.texto}</p>;
        if (l.tipo === "dialogo") {
          const corte = l.texto.indexOf(": ");
          return corte > 0 ? (
            <p key={i} className="gl-l-dialogo"><strong>{l.texto.slice(0, corte)}:</strong> {l.texto.slice(corte + 2)}</p>
          ) : (
            <p key={i} className="gl-l-dialogo">{l.texto}</p>
          );
        }
        return <p key={i} className="gl-l-parrafo">{l.texto}</p>;
      })}
    </div>
  );
}

export function LabGenerosLiterarios({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("transformador");

  // ── transformador de géneros ───────────────────────────────────────────
  const [eleccion, setEleccion] = useState<EleccionGenero>(ELECCION_INICIAL);
  const [logros, setLogros] = useState<Record<GeneroSim, boolean>>({ narrativo: false, lirico: false, dramatico: false, ensayistico: false });
  const cambiarEleccion = (sig: EleccionGenero) => {
    setEleccion(sig);
    const g = generoLogrado(sig);
    if (g && !logros[g]) {
      setLogros((l) => ({ ...l, [g]: true }));
      sfxPlace();
    }
  };
  const lineas = componer(eleccion);
  const medidor = medir(eleccion);
  const diag = diagnosticar(eleccion);

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  // Modo «Completa el texto». El contador sirve de `key`: subirlo remonta
  // el componente y devuelve todos los huecos en blanco.
  const [textoDone, setTextoDone] = useState(false);
  const [textoIntento, setTextoIntento] = useState(0);
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
  // Los tres ayudantes son el único punto por el que pasan todos los aciertos
  // y todos los fallos del laboratorio, así que la partida se lleva aquí.
  // `sfxOk` no cuenta: marca el fin de un modo, no una respuesta suelta.
  const sfxOk = () => sonido && audioRef.current?.correcto();
  const sfxNo = () => {
    partida.error();
    return sonido && audioRef.current?.incorrecto();
  };
  const sfxPlace = () => {
    partida.acierto();
    return sonido && audioRef.current?.blip();
  };

  // ── modo obras (clasifica por género) ──────────────────────────────────
  const [ubicObra, setUbicObra] = useState<Record<string, Genero>>({});
  const [selObra, setSelObra] = useState<string | null>(null);
  const [shakeObra, setShakeObra] = useState<Genero | null>(null);
  const obrasLibres = OBRAS.filter((o) => !ubicObra[o.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarObra = (obraId: string, bin: Genero) => {
    if (ubicObra[obraId]) return;
    const o = OBRAS.find((x) => x.id === obraId);
    if (o && o.genero === bin) {
      setUbicObra((e) => ({ ...e, [obraId]: bin }));
      setSelObra(null);
      sfxPlace();
      if (Object.keys(ubicObra).length + 1 >= OBRAS.length) {
        sfxOk();
        persistMejor(true, rasgosDone, glosarioDone);
      }
    } else {
      setShakeObra(bin);
      sfxNo();
      window.setTimeout(() => setShakeObra(null), 420);
    }
  };
  const resetObras = () => {
    setUbicObra({});
    setSelObra(null);
  };

  // ── modo rasgos (empareja género → rasgo) ──────────────────────────────
  const [empRasgo, setEmpRasgo] = useState<Record<string, boolean>>({});
  const [selRasgo, setSelRasgo] = useState<string | null>(null);
  const [shakeRasgo, setShakeRasgo] = useState<string | null>(null);
  const rasgosLibres = RASGOS.filter((r) => !empRasgo[r.id]).slice().sort((a, b) => a.genero.localeCompare(b.genero, "es"));

  const intentarRasgo = (chipId: string, rowId: string) => {
    if (empRasgo[rowId]) return;
    if (chipId === rowId) {
      setEmpRasgo((e) => ({ ...e, [rowId]: true }));
      setSelRasgo(null);
      sfxPlace();
      if (Object.keys(empRasgo).length + 1 >= RASGOS.length) {
        sfxOk();
        persistMejor(obrasDone, true, glosarioDone);
      }
    } else {
      setShakeRasgo(rowId);
      sfxNo();
      window.setTimeout(() => setShakeRasgo(null), 420);
    }
  };
  const resetRasgos = () => {
    setEmpRasgo({});
    setSelRasgo(null);
  };

  // ── modo glosario (lee la definición y ESCRIBE el término) ─────────────
  // El contador hace de `key`: subirlo remonta el componente y deja todas
  // las tarjetas en blanco.
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const obrasDone = Object.keys(ubicObra).length >= OBRAS.length;
  const rasgosDone = Object.keys(empRasgo).length >= RASGOS.length;
  const modosHechos = (obrasDone ? 1 : 0) + (rasgosDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Transforma la semilla en un texto lírico coherente", done: logros.lirico },
    { txt: "Logra también uno narrativo y uno dramático", done: logros.narrativo && logros.dramatico },
    { txt: "Clasifica las 10 obras por su género", done: obrasDone },
    { txt: "Empareja los 4 géneros con su rasgo", done: rasgosDone },
    { txt: "Escribe los 6 términos del glosario", done: glosarioDone, modo: "glosario" },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  // arrastre nativo
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

  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };
  const resetTransformador = () => setEleccion(ELECCION_INICIAL);
  const resetActual = modo === "transformador" ? resetTransformador : modo === "texto" ? resetTexto : modo === "obras" ? resetObras : modo === "rasgos" ? resetRasgos : resetGlosario;


  const lectura =
    modo === "transformador"
      ? `Tu texto: ${diag.coherente ? NOMBRE_GENERO[diag.genero] + " coherente" : "mezclado, lee el medidor"}`
      : modo === "obras"
        ? `${Object.keys(ubicObra).length} de ${OBRAS.length} obras clasificadas`
        : modo === "rasgos"
          ? `${Object.keys(empRasgo).length} de ${RASGOS.length} géneros emparejados`
          : undefined;

  const pista =
    modo === "transformador" ? (
      <>Cambia la <strong style={{ color: T.text }}>voz</strong>, la <strong style={{ color: T.text }}>forma</strong> y los <strong style={{ color: T.text }}>rasgos</strong>: el texto se reescribe y el medidor te dice a qué género se inclina.</>
    ) : modo === "obras" ? (
      <>Lo <strong style={{ color: T.text }}>narrativo</strong> cuenta historias; lo <strong style={{ color: T.text }}>lírico</strong> expresa estados interiores; lo <strong style={{ color: T.text }}>dramático</strong> se escribe para representarse; lo <strong style={{ color: T.text }}>ensayístico</strong> reflexiona con voz propia.</>
    ) : modo === "rasgos" ? (
      <>Pregúntate qué hace cada género: ¿<strong style={{ color: T.text }}>cuenta</strong>, <strong style={{ color: T.text }}>canta</strong>, <strong style={{ color: T.text }}>representa</strong> o <strong style={{ color: T.text }}>reflexiona</strong>?</>
    ) : modo === "glosario" ? (
      <>Lee la definición y su ejemplo y escribe el término. Si te atoras, la pista te da la inicial y las letras.</>
    ) : (
      <>Escribe en cada hueco la palabra que completa la idea sobre los géneros.</>
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

          {/* MODO — transformador de géneros */}
          {modo === "transformador" && (
            <div className="gl-sim">
              <div className="gl-semilla">
                <FotoSim clave="semilla-plaza" icono="fa-cloud-rain" />
                <div>
                  <div className="gl-ceja">Semilla de la historia (ficticia)</div>
                  <p style={{ margin: 0 }}>{SEMILLA}</p>
                </div>
              </div>

              <div className="gl-sim-cols">
                <div className="gl-sim-controles">
                  <div className="gl-ceja">1 · ¿Quién habla?</div>
                  <div className="gl-opciones">
                    {VOCES.map((v) => (
                      <button key={v.id} type="button" className="gl-op" data-on={eleccion.voz === v.id} onClick={() => cambiarEleccion({ ...eleccion, voz: v.id })}>
                        <i className={`fa-solid ${v.icono}`} aria-hidden />
                        <span><strong>{v.titulo}</strong><small>{v.ayuda}</small></span>
                      </button>
                    ))}
                  </div>

                  <div className="gl-ceja">2 · ¿En qué forma se escribe?</div>
                  <div className="gl-opciones gl-formas">
                    {FORMAS.map((f) => (
                      <button key={f.id} type="button" className="gl-op gl-op-foto" data-on={eleccion.forma === f.id} onClick={() => cambiarEleccion({ ...eleccion, forma: f.id })}>
                        <FotoSim clave={f.foto} icono={f.icono} />
                        <span><strong>{f.titulo}</strong><small>{f.ayuda}</small></span>
                      </button>
                    ))}
                  </div>

                  <div className="gl-ceja">3 · ¿Qué rasgos le añades?</div>
                  <div className="gl-opciones gl-rasgos">
                    {RASGOS_SIM.map((r) => (
                      <button key={r.id} type="button" className="gl-chip gl-toggle" data-sel={eleccion.rasgos.includes(r.id)} aria-pressed={eleccion.rasgos.includes(r.id)} onClick={() => cambiarEleccion(alternarRasgo(eleccion, r.id))}>
                        <i className={`fa-solid ${r.icono}`} aria-hidden />
                        {r.titulo}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gl-sim-resultado">
                  <div className="gl-ceja">El texto, ya transformado</div>
                  <VistaPrevia lineas={lineas} forma={eleccion.forma} />

                  <div className="gl-ceja">Medidor de géneros</div>
                  <div className="gl-medidor">
                    {medidor.map((m) => (
                      <div key={m.genero} className="gl-med" data-on={m.puntos > 0} data-top={m.genero === diag.genero && m.puntos > 0}>
                        <span>{NOMBRE_GENERO[m.genero]}</span>
                        <div className="gl-barra"><div style={{ width: `${(m.puntos / m.maximo) * 100}%`, background: COLOR_GENERO[m.genero] }} /></div>
                        <b>{m.puntos}/{m.maximo}</b>
                      </div>
                    ))}
                  </div>
                  <div className="gl-diag" data-ok={diag.coherente}>
                    <i className={`fa-solid ${diag.coherente ? "fa-circle-check" : "fa-triangle-exclamation"}`} aria-hidden />
                    <span>{diag.mensajes[0] ?? "Elige voz, forma y rasgos para ver qué género resulta."}</span>
                  </div>
                  {diag.mensajes.slice(1).map((t, i) => (
                    <div key={i} className="gl-diag" data-ok="false"><i className="fa-solid fa-circle-info" aria-hidden /><span>{t}</span></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODO — completa el texto (fill_blanks verbatim de la progresión) */}
          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={GENEROS_LITERARIOS_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                sfxOk();
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
          )}

          {modo === "obras" && (
            <Mesa>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada obra o subgénero a su género literario</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: obrasDone ? OK : T.text3 }}>
                    {Object.keys(ubicObra).length}/{OBRAS.length}
                  </span>
                </div>
                {obrasLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {OBRAS.length} obras!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {obrasLibres.map((o) => (
                      <button key={o.id} className="gl-chip" data-sel={selObra === o.id} onClick={() => setSelObra((s) => (s === o.id ? null : o.id))} {...dragProps(o.id)}>
                        {o.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BinsObras selObra={selObra} shakeObra={shakeObra} ubicObra={ubicObra} onMatch={intentarObra} dropProps={dropProps} />
            </Mesa>
          )}

          {modo === "rasgos" && (
            <Mesa>
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <Eyebrow>Arrastra cada género a su característica definitoria</Eyebrow>
                  <span style={{ fontSize: 14, fontWeight: 800, color: rasgosDone ? OK : T.text3 }}>
                    {Object.keys(empRasgo).length}/{RASGOS.length}
                  </span>
                </div>
                {rasgosLibres.length === 0 ? (
                  <div style={{ fontSize: 14, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste los {RASGOS.length} géneros!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {rasgosLibres.map((r) => (
                      <button key={r.id} className="gl-chip" data-sel={selRasgo === r.id} onClick={() => setSelRasgo((s) => (s === r.id ? null : r.id))} {...dragProps(r.id)}>
                        <i className="fa-solid fa-feather" style={{ fontSize: 14, color: T.text3 }} />
                        {r.genero}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <RowsRasgos selRasgo={selRasgo} shakeRasgo={shakeRasgo} empRasgo={empRasgo} onMatch={intentarRasgo} dropProps={dropProps} />
            </Mesa>
          )}

          {modo === "glosario" && (
            <EscribeTermino
              key={glosIntento}
              pares={PARES}
              accent={accent}
              rgba={color.rgba}
              completado={glosarioDone}
              instrucciones="Lee la definición y escribe el término del glosario que le corresponde."
              onCompletado={() => {
                setGlosarioDone(true);
                sfxOk();
                persistMejor(obrasDone, rasgosDone, true);
              }}
              onAcierto={sfxPlace}
              onError={sfxNo}
            />
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
                <p style={{ margin: 0, color: T.text2 }}>
                  Transformaciones logradas:{" "}
                  {(["lirico", "narrativo", "dramatico"] as GeneroSim[]).map((g) => (
                    <span key={g} style={{ marginRight: 10, color: logros[g] ? OK : T.text3, fontWeight: 800 }}>
                      <i className={`fa-solid ${logros[g] ? "fa-circle-check" : "fa-circle"}`} aria-hidden /> {NOMBRE_GENERO[g]}
                    </span>
                  ))}
                </p>
              </Bloque>
              <Bloque titulo="Pista" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>{pista}</p>
              </Bloque>
              {modo === "transformador" && (
                <Bloque titulo="Lo que dice el medidor" icono="fa-gauge-high">
                  {diag.mensajes.map((t, i) => (
                    <p key={i} style={{ margin: 0, color: T.text2 }}>{t}</p>
                  ))}
                </Bloque>
              )}
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: <QuizCard accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined} />,
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book",
          contenido: (
            <>
              {(Object.keys(GENERO_INFO) as Genero[]).map((g) => (
                <Bloque key={g} titulo={GENERO_INFO[g].titulo} icono={GENERO_INFO[g].icono}>
                  <p style={{ margin: 0, color: T.text2 }}>{GENERO_INFO[g].subtitulo}</p>
                </Bloque>
              ))}
              <Bloque titulo="La característica de cada género" icono="fa-list-check">
                {RASGOS.map((r) => (
                  <p key={r.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{r.genero}.</strong> {r.rasgo} <em>{r.ejemplo}</em>
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_GENEROS}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={GENEROS_LITERARIOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

const css = (accent: string, rgba: string) => `
        @keyframes glShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes glPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .gl-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:700; transition:all .14s; user-select:none; max-width:360px; text-align:left; line-height:1.4; }
        .gl-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); }
        .gl-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; }
        .gl-chip:active { cursor:grabbing; }
        .gl-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .gl-row[data-shake="true"] { animation:glShake .4s; border-color:${NO}; }
        .gl-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
        .gl-slot { flex-shrink:0; min-width:180px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
          display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
        .gl-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
        .gl-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:200px; }
        .gl-bin[data-shake="true"] { animation:glShake .4s; border-color:${NO}; }
        .gl-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
          border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
        .gl-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
        .gl-q:disabled{ cursor:default; }
        .gl-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
          border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .gl-btn:hover { border-color:${T.lineStrong}; }
        .gl-divider { height:1px; background:${T.line}; margin:18px 0; }
        @media (prefers-reduced-motion: reduce){ .gl-row[data-shake="true"], .gl-bin[data-shake="true"] { animation:none; } }

        /* Transformador de géneros */
        .gl-sim { display:flex; flex-direction:column; gap:14px; min-width:0; }
        .gl-semilla { display:grid; grid-template-columns:minmax(0,150px) minmax(0,1fr); gap:14px; align-items:center; padding:12px; border-radius:14px;
          border:1px solid ${T.line}; background:${T.glass}; font-size:15px; line-height:1.5; }
        .gl-ceja { font-size:14px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; color:${T.text3}; margin:4px 0 6px; }
        .gl-foto { position:relative; display:flex; align-items:center; justify-content:center; width:100%; aspect-ratio:16/10; overflow:hidden; border-radius:10px;
          background:linear-gradient(135deg, rgba(${rgba},0.35) 0%, rgba(8,19,31,0.9) 100%); color:rgba(255,255,255,0.55); font-size:26px; }
        .gl-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .gl-sim-cols { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap:16px; align-items:start; }
        .gl-sim-controles, .gl-sim-resultado { display:flex; flex-direction:column; gap:8px; min-width:0; }
        .gl-opciones { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:8px; }
        .gl-op { cursor:pointer; display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; text-align:left; color:#fff; font-size:14px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; transition:all .14s; min-width:0; }
        .gl-op:hover { border-color:${T.lineStrong}; }
        .gl-op[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -6px ${accent}; }
        .gl-op > i { font-size:18px; color:${accent}; flex-shrink:0; }
        .gl-op span { display:flex; flex-direction:column; gap:2px; min-width:0; }
        .gl-op small { font-size:14px; color:${T.text2}; line-height:1.3; }
        .gl-op-foto { flex-direction:column; align-items:stretch; padding:8px; }
        .gl-toggle { max-width:none; }
        .gl-rasgos { display:flex; flex-wrap:wrap; }
        .gl-previa { padding:14px 16px; border-radius:14px; border:1px solid ${T.line}; background:rgba(2,12,28,0.55); font-size:15px; line-height:1.55;
          display:flex; flex-direction:column; gap:6px; min-height:120px; transition:all .2s; }
        .gl-previa p { margin:0; }
        .gl-previa[data-forma="prosa"] .gl-l-parrafo { text-align:justify; }
        .gl-previa[data-forma="verso"] { font-style:italic; border-left:4px solid #F48FB1; gap:2px; }
        .gl-previa[data-forma="escena"] { font-family:ui-monospace, monospace; border-left:4px solid #FFB74D; font-size:14px; }
        .gl-l-titulo { font-weight:900; letter-spacing:.12em; color:#FFB74D; font-size:14px; }
        .gl-l-dialogo strong { color:#FFB74D; }
        .gl-l-acot { font-style:italic; color:${T.text3}; }
        .gl-l-ensayo { color:#A5D6A7; border-top:1px dashed ${T.line}; padding-top:6px; }
        .gl-medidor { display:grid; gap:6px; }
        .gl-med { display:grid; grid-template-columns:minmax(0,92px) minmax(0,1fr) 40px; gap:8px; align-items:center; font-size:14px; color:${T.text3}; }
        .gl-med[data-on="true"] { color:#fff; }
        .gl-med[data-top="true"] span { color:${OK}; font-weight:900; }
        .gl-med b { font-family:ui-monospace, monospace; font-size:14px; text-align:right; }
        .gl-barra { height:10px; border-radius:99px; background:rgba(255,255,255,0.1); overflow:hidden; }
        .gl-barra div { height:100%; border-radius:99px; transition:width .35s ease; }
        .gl-diag { display:flex; gap:10px; align-items:flex-start; padding:10px 12px; border-radius:12px; font-size:14px; line-height:1.45; color:${T.text2};
          border:1px solid ${T.line}; background:${T.inset}; }
        .gl-diag[data-ok="true"] { border-color:${OK}66; background:${OK}14; color:#fff; }
        .gl-diag i { margin-top:3px; color:${accent}; }
        .gl-diag[data-ok="true"] i { color:${OK}; }
        @media (prefers-reduced-motion: reduce){ .gl-barra div, .gl-previa { transition:none; } }

        /* Identidad del tablero */
        .gl-bin, .gl-row { --tono:188; position:relative;
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
        .gl-bin:nth-of-type(6n+1), .gl-row:nth-of-type(6n+1) { --tono:188; }
        .gl-bin:nth-of-type(6n+2), .gl-row:nth-of-type(6n+2) { --tono:262; }
        .gl-bin:nth-of-type(6n+3), .gl-row:nth-of-type(6n+3) { --tono:44; }
        .gl-bin:nth-of-type(6n+4), .gl-row:nth-of-type(6n+4) { --tono:152; }
        .gl-bin:nth-of-type(6n+5), .gl-row:nth-of-type(6n+5) { --tono:330; }
        .gl-bin:nth-of-type(6n+6), .gl-row:nth-of-type(6n+6) { --tono:18; }
        .gl-bin::before, .gl-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
          background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
        .gl-bin[data-done="true"], .gl-row[data-done="true"] {
          background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
        .gl-chip { transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
        .gl-chip:hover { transform:translateY(-2px); }
        .gl-chip[data-sel="true"] { transform:translateY(-3px) scale(1.02); }
        @media (prefers-reduced-motion: reduce){
          .gl-chip, .gl-chip:hover, .gl-chip[data-sel="true"] { transform:none; transition:none; }
        }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsObras({
  selObra,
  shakeObra,
  ubicObra,
  onMatch,
  dropProps,
}: {
  selObra: string | null;
  shakeObra: Genero | null;
  ubicObra: Record<string, Genero>;
  onMatch: (obraId: string, bin: Genero) => void;
  dropProps: DropFactory;
}) {
  const bins: Genero[] = ["narrativo", "lirico", "dramatico", "ensayistico"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = GENERO_INFO[bin];
        const dentro = OBRAS.filter((o) => ubicObra[o.id] === bin);
        return (
          <div
            key={bin}
            className="gl-bin"
            data-shake={shakeObra === bin}
            onClick={() => selObra && onMatch(selObra, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.6, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((o) => (
                  <span key={o.id} style={{ animation: "glPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 3 }} />
                    {o.texto}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RowsRasgos({
  selRasgo,
  shakeRasgo,
  empRasgo,
  onMatch,
  dropProps,
}: {
  selRasgo: string | null;
  shakeRasgo: string | null;
  empRasgo: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {RASGOS.map((r) => {
        const done = empRasgo[r.id];
        return (
          <div
            key={r.id}
            className="gl-row"
            data-shake={shakeRasgo === r.id}
            data-done={done}
            onClick={() => !done && selRasgo && onMatch(selRasgo, r.id)}
            {...dropProps((id) => onMatch(id, r.id))}
          >
            <div className="gl-slot" data-armed={!done && !!selRasgo} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "glPop .25s ease", fontSize: 14, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-feather" />
                  {r.genero}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> género
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{r.rasgo}</div>
              <div style={{ fontSize: 14, color: T.text3, lineHeight: 1.4, marginTop: 3 }}>{r.ejemplo}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Cuestionario de comprensión
 * ═══════════════════════════════════════════════════════════════════════════ */
function QuizCard({
  accent,
  rgba,
  aprobado,
  onAprobado,
  playSfx,
}: {
  accent: string;
  rgba: string;
  aprobado: boolean;
  onAprobado: () => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [resp, setResp] = useState<(number | null)[]>(() => QUIZ.map(() => null));
  const [comprobado, setComprobado] = useState(false);

  const aciertos = resp.filter((r, i) => r === QUIZ[i]!.correcta).length;
  const total = QUIZ.length;
  const todas = resp.every((r) => r !== null);
  const aprobadoAhora = aciertos === total;

  const elegir = (qi: number, oi: number) => {
    if (comprobado) return;
    setResp((prev) => prev.map((v, i) => (i === qi ? oi : v)));
  };
  const comprobar = () => {
    setComprobado(true);
    const ok = aciertos === total;
    playSfx?.(ok);
    if (ok) onAprobado();
  };
  const reintentar = () => {
    setResp(QUIZ.map(() => null));
    setComprobado(false);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 24px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
          Comprueba lo aprendido
        </Eyebrow>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Seis afirmaciones sobre los géneros literarios y sus características. Decide si son verdaderas o falsas y pulsa «Comprobar».
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
                <span style={{ color: accent }}>{qi + 1}.</span>
                <span>{q.pregunta}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                {q.opciones.map((op, oi) => {
                  const sel = elegida === oi;
                  const esCorrecta = oi === q.correcta;
                  let borde = T.line;
                  let fondo = T.glass;
                  let colorTxt = T.text2;
                  if (comprobado && esCorrecta) {
                    borde = OK;
                    fondo = `${OK}1c`;
                    colorTxt = "#fff";
                  } else if (comprobado && sel && !esCorrecta) {
                    borde = NO;
                    fondo = `${NO}1c`;
                    colorTxt = "#fff";
                  } else if (!comprobado && sel) {
                    borde = accent;
                    fondo = `rgba(${rgba},0.16)`;
                    colorTxt = "#fff";
                  }
                  return (
                    <button key={oi} className="gl-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                      <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}` }}>
                        {comprobado && esCorrecta ? <i className="fa-solid fa-check" /> : comprobado && sel ? <i className="fa-solid fa-xmark" /> : String.fromCharCode(65 + oi)}
                      </span>
                      <span style={{ flex: 1, lineHeight: 1.35 }}>{op}</span>
                    </button>
                  );
                })}
              </div>
              {comprobado && (
                <div style={{ marginTop: 9, fontSize: 14, color: T.text2, lineHeight: 1.5, display: "flex", gap: 9, padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
                  <i className="fa-solid fa-circle-info" style={{ color: accent, marginTop: 2 }} />
                  <span>{q.retro}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
        {!comprobado ? (
          <button className="gl-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="gl-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 16px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 14, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas e inténtalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
