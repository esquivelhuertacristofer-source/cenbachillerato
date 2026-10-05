"use client";

/**
 * Laboratorio — Navegar seguro en internet
 * Práctica experimental para CD-I-P06-A1 (Cultura Digital I).
 *
 * Cinco modos:
 *  1. «Tu teléfono» (SIMULADOR) — llegan ocho avisos a un teléfono simulado
 *     (mensajes, enlaces, descargas, permisos y redes Wi-Fi ficticios). El
 *     alumno puede revisar las señales y decide: abrir, ignorar o reportar. Los
 *     medidores de seguridad del dispositivo y de datos expuestos reaccionan, y
 *     las consecuencias se marcan como simulación. Modelo en `navegacion-segura-sim.ts`.
 *  2. «¿Práctica segura o riesgosa?» — clasifica doce hábitos de navegación.
 *  3. «Amenaza y defensa» — empareja cada riesgo con su defensa (verbatim A1).
 *  4. «Escribe el término» — definición verbatim (A5) → término del glosario.
 *  5. «Completa el texto» — fill_blanks verbatim de la progresión.
 *  + Reto: cuestionario de comprensión (V/F verbatim de A4 + A2).
 *
 * DOM puro (sin three.js). Contenido curricular VERBATIM de CD-I·P06 en «Teoría».
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { NAVEGACION_SEGURA_HUECOS } from "./navegacion-segura-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { NAVEGACION_SEGURA_FICHA } from "./navegacion-segura-ficha";
import {
  PRACTICAS,
  CATEGORIA_INFO,
  AMENAZAS,
  PARES,
  QUIZ,
  DATO_SEGURIDAD,
  type Categoria,
} from "./navegacion-segura-data";
import {
  AVISOS,
  calcular,
  efectoDe,
  nivelDatos,
  nivelSeguridad,
  type Accion,
  type Aviso,
  type Decision,
} from "./navegacion-segura-sim";

const NO = "#FF5E5E";
const AVISO = "#FFC75A";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-navegacion-segura-reto";
const RUTA_FOTOS = "/media/labs-sim/navegacion-segura";

type Modo = "telefono" | "practicas" | "amenazas" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "telefono", label: "Tu teléfono", icono: "fa-mobile-screen-button" },
  { id: "practicas", label: "¿Práctica segura o riesgosa?", icono: "fa-shield-halved" },
  { id: "amenazas", label: "Amenaza y defensa", icono: "fa-user-shield" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

export function LabNavegacionSegura({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("telefono");

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

  // ── modo teléfono (simulador) ──────────────────────────────────────────
  const [decisiones, setDecisiones] = useState<Decision[]>([]);
  const [revisados, setRevisados] = useState<Record<string, boolean>>({});
  const [indice, setIndice] = useState(0);
  const sim = calcular(decisiones);
  const aviso = indice < AVISOS.length ? AVISOS[indice]! : null;
  const decidido = aviso ? decisiones.find((d) => d.id === aviso.id) : undefined;

  const revisar = () => {
    if (!aviso || decidido) return;
    setRevisados((r) => ({ ...r, [aviso.id]: true }));
  };
  const decidir = (accion: Accion) => {
    if (!aviso || decidido) return;
    setDecisiones((d) => [...d, { id: aviso.id, accion, revisado: !!revisados[aviso.id] }]);
    const e = efectoDe(aviso, accion);
    if (e.val === "bien") sfxPlace();
    else sfxNo();
    if (decisiones.length + 1 >= AVISOS.length) sfxOk();
  };
  const reiniciarTelefono = () => {
    setDecisiones([]);
    setRevisados({});
    setIndice(0);
    partida.reiniciar();
  };

  // ── modo practicas (clasifica por categoría) ───────────────────────────
  const [ubicPract, setUbicPract] = useState<Record<string, Categoria>>({});
  const [selPract, setSelPract] = useState<string | null>(null);
  const [shakePract, setShakePract] = useState<Categoria | null>(null);
  const practLibres = PRACTICAS.filter((p) => !ubicPract[p.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarPract = (practId: string, bin: Categoria) => {
    if (ubicPract[practId]) return;
    const p = PRACTICAS.find((x) => x.id === practId);
    if (p && p.cat === bin) {
      setUbicPract((e) => ({ ...e, [practId]: bin }));
      setSelPract(null);
      sfxPlace();
      if (Object.keys(ubicPract).length + 1 >= PRACTICAS.length) {
        sfxOk();
        persistMejor(true, amenazasDone, glosarioDone);
      }
    } else {
      setShakePract(bin);
      sfxNo();
      window.setTimeout(() => setShakePract(null), 420);
    }
  };
  const resetPracticas = () => {
    setUbicPract({});
    setSelPract(null);
  };

  // ── modo amenazas (empareja amenaza → defensa) ─────────────────────────
  const [empAmen, setEmpAmen] = useState<Record<string, boolean>>({});
  const [selAmen, setSelAmen] = useState<string | null>(null);
  const [shakeAmen, setShakeAmen] = useState<string | null>(null);
  const amenLibres = AMENAZAS.filter((a) => !empAmen[a.id]).slice().sort((a, b) => a.amenaza.localeCompare(b.amenaza, "es"));

  const intentarAmen = (chipId: string, rowId: string) => {
    if (empAmen[rowId]) return;
    if (chipId === rowId) {
      setEmpAmen((e) => ({ ...e, [rowId]: true }));
      setSelAmen(null);
      sfxPlace();
      if (Object.keys(empAmen).length + 1 >= AMENAZAS.length) {
        sfxOk();
        persistMejor(practicasDone, true, glosarioDone);
      }
    } else {
      setShakeAmen(rowId);
      sfxNo();
      window.setTimeout(() => setShakeAmen(null), 420);
    }
  };
  const resetAmenazas = () => {
    setEmpAmen({});
    setSelAmen(null);
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
  const practicasDone = Object.keys(ubicPract).length >= PRACTICAS.length;
  const amenazasDone = Object.keys(empAmen).length >= AMENAZAS.length;
  const modosHechos = (practicasDone ? 1 : 0) + (amenazasDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Decide qué hacer con los 8 avisos de tu teléfono", done: sim.cerrado },
    { txt: "Termina con el dispositivo protegido y pocos datos expuestos", done: sim.cerrado && sim.seguridad >= 60 && sim.datos <= 20 },
    { txt: "Clasifica las 12 prácticas como seguras o riesgosas", done: practicasDone },
    { txt: "Empareja las 3 amenazas con su defensa", done: amenazasDone },
    { txt: "Escribe los 5 términos del glosario", done: glosarioDone },
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
  const resetActual =
    modo === "texto" ? resetTexto : modo === "practicas" ? resetPracticas : modo === "amenazas" ? resetAmenazas : modo === "telefono" ? reiniciarTelefono : resetGlosario;

  const instruccion = (txt: string, n?: string, ok?: boolean) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 15, fontWeight: 800, color: T.text }}>
      <span>{txt}</span>
      {n && <span style={{ fontSize: 15, fontWeight: 900, color: ok ? OK : T.text3 }}>{n}</span>}
    </div>
  );

  const nSeg = nivelSeguridad(sim.seguridad);
  const nDat = nivelDatos(sim.datos);
  const lectura =
    modo === "telefono" ? (
      <>
        {aviso ? `Aviso ${indice + 1} de ${AVISOS.length}` : "Bandeja vacía"} · Dispositivo: {nSeg.texto} ({sim.seguridad})
      </>
    ) : modo === "practicas" ? (
      <>Prácticas clasificadas: {Object.keys(ubicPract).length}/{PRACTICAS.length}</>
    ) : modo === "amenazas" ? (
      <>Amenazas emparejadas: {Object.keys(empAmen).length}/{AMENAZAS.length}</>
    ) : (
      <>Repaso de los términos de seguridad digital</>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <style>{css(accent, color.rgba)}</style>

          {modo === "telefono" && (
            <Telefono
              indice={indice}
              aviso={aviso}
              decisiones={decisiones}
              decidido={decidido}
              revisado={!!(aviso && revisados[aviso.id])}
              resumen={sim}
              onRevisar={revisar}
              onDecidir={decidir}
              onSiguiente={() => setIndice((i) => i + 1)}
              onReiniciar={reiniciarTelefono}
              onVer={(i) => setIndice(i)}
            />
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={NAVEGACION_SEGURA_HUECOS}
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

          {modo === "practicas" && (
            <Mesa>
              <div>
                {instruccion("Arrastra cada hábito a su categoría", `${Object.keys(ubicPract).length}/${PRACTICAS.length}`, practicasDone)}
                {practLibres.length === 0 ? (
                  <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste las {PRACTICAS.length} prácticas!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {practLibres.map((p) => (
                      <button key={p.id} className="seg-chip" data-sel={selPract === p.id} onClick={() => setSelPract((s) => (s === p.id ? null : p.id))} {...dragProps(p.id)}>
                        {p.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <BinsPracticas selPract={selPract} shakePract={shakePract} ubicPract={ubicPract} onMatch={intentarPract} dropProps={dropProps} />
            </Mesa>
          )}

          {modo === "amenazas" && (
            <Mesa>
              <div>
                {instruccion("Arrastra cada amenaza a la defensa que la neutraliza", `${Object.keys(empAmen).length}/${AMENAZAS.length}`, amenazasDone)}
                {amenLibres.length === 0 ? (
                  <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Emparejaste las {AMENAZAS.length} amenazas!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {amenLibres.map((a) => (
                      <button key={a.id} className="seg-chip" data-sel={selAmen === a.id} onClick={() => setSelAmen((s) => (s === a.id ? null : a.id))} {...dragProps(a.id)}>
                        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 14, color: T.text3 }} />
                        {a.amenaza}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <RowsAmenazas selAmen={selAmen} shakeAmen={shakeAmen} empAmen={empAmen} onMatch={intentarAmen} dropProps={dropProps} />
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
                persistMejor(practicasDone, amenazasDone, true);
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Dispositivo (simulación)" value={`${sim.seguridad}/100`} col={nSeg.color} />
                  <Dato label="Datos expuestos (simulación)" value={`${sim.datos}/100`} col={nDat.color} />
                  <Dato label="Decisiones acertadas" value={`${sim.bien}/${AVISOS.length}`} col={sim.bien >= 6 ? OK : undefined} />
                  <Dato label="Revisó antes de decidir" value={`${sim.informadas}/${sim.procesados}`} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Navegas con higiene digital!" : "Termina los tres modos de clasificar y escribir para ganar 2★; la tercera pide 2 errores o menos."}
                  </span>
                </div>
              </Bloque>
              <Bloque titulo="Datos expuestos (simulación)" icono="fa-user-secret">
                {sim.expuestos.length === 0 ? (
                  <p style={{ margin: 0, color: T.text3 }}>Por ahora no se ha expuesto ningún dato.</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {sim.expuestos.map((x) => (
                      <span key={x} className="seg-dato">{x}</span>
                    ))}
                  </div>
                )}
              </Bloque>
              {decisiones.map((d, i) => {
                const a = AVISOS.find((x) => x.id === d.id)!;
                const e = efectoDe(a, d.accion);
                return (
                  <Bloque key={d.id} titulo={`${i + 1}. ${a.remitente}`} icono={e.val === "bien" ? "fa-circle-check" : e.val === "mal" ? "fa-circle-xmark" : "fa-circle-minus"}>
                    <p style={{ margin: 0, color: T.text2 }}>
                      <strong style={{ color: T.text }}>Elegiste:</strong> {a.botones[d.accion === "abrir" ? 0 : d.accion === "ignorar" ? 1 : 2]}.
                    </p>
                    <p style={{ margin: 0, color: T.text2 }}>{e.texto}</p>
                  </Bloque>
                );
              })}
              {decisiones.length === 0 && (
                <Bloque titulo="Tus decisiones" icono="fa-mobile-screen-button">
                  <p style={{ margin: 0, color: T.text3 }}>Aún no hay decisiones. Decide qué hacer con el primer aviso en «Tu teléfono».</p>
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
              <Bloque titulo="Práctica segura y riesgosa" icono="fa-shield-halved">
                {(Object.keys(CATEGORIA_INFO) as Categoria[]).map((c) => (
                  <p key={c} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{CATEGORIA_INFO[c].titulo}.</strong> {CATEGORIA_INFO[c].subtitulo}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Amenazas y defensas" icono="fa-user-shield">
                {AMENAZAS.map((a) => (
                  <p key={a.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{a.amenaza}.</strong> {a.descripcion} <em>Defensa: {a.defensa}</em>
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_SEGURIDAD}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={NAVEGACION_SEGURA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Imagen con respaldo: degradado + ícono detrás; si la imagen no existe, se oculta.
 * ═══════════════════════════════════════════════════════════════════════════ */
function Foto({ clave, icono, alt }: { clave: string; icono: string; alt: string }) {
  const [falla, setFalla] = useState(false);
  return (
    <span className="seg-foto">
      <i className={`fa-solid ${icono}`} aria-hidden />
      {!falla && <img src={`${RUTA_FOTOS}/${clave}.webp`} alt={alt} loading="lazy" onError={() => setFalla(true)} />}
    </span>
  );
}

function Medidor({ label, valor, texto, color, icono }: { label: string; valor: number; texto: string; color: string; icono: string }) {
  return (
    <div className="seg-med" role="group" aria-label={`${label}: ${valor} de 100`}>
      <span className="seg-med-top">
        <span>
          <i className={`fa-solid ${icono}`} style={{ color, marginRight: 7 }} aria-hidden />
          {label}
        </span>
        <strong style={{ color }}>{texto}</strong>
      </span>
      <span className="seg-med-barra">
        <span style={{ width: `${valor}%`, background: color }} />
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Simulador: tu teléfono
 * ═══════════════════════════════════════════════════════════════════════════ */
function Telefono({
  indice,
  aviso,
  decisiones,
  decidido,
  revisado,
  resumen,
  onRevisar,
  onDecidir,
  onSiguiente,
  onReiniciar,
  onVer,
}: {
  indice: number;
  aviso: Aviso | null;
  decisiones: Decision[];
  decidido: Decision | undefined;
  revisado: boolean;
  resumen: ReturnType<typeof calcular>;
  onRevisar: () => void;
  onDecidir: (a: Accion) => void;
  onSiguiente: () => void;
  onReiniciar: () => void;
  onVer: (i: number) => void;
}) {
  const nSeg = nivelSeguridad(resumen.seguridad);
  const nDat = nivelDatos(resumen.datos);
  const efecto = aviso && decidido ? efectoDe(aviso, decidido.accion) : null;
  const ultimo = indice >= AVISOS.length - 1;
  const redAbierta = decisiones.some((d) => d.id === "a3" && d.accion === "abrir");
  const mostrarSenales = !!aviso && (revisado || !!decidido);
  const acciones: Accion[] = ["abrir", "ignorar", "reportar"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <div className="seg-meds">
        <Medidor label="Seguridad del dispositivo" valor={resumen.seguridad} texto={`${nSeg.texto} · ${resumen.seguridad}`} color={nSeg.color} icono="fa-shield-halved" />
        <Medidor label="Datos personales expuestos" valor={resumen.datos} texto={`${nDat.texto} · ${resumen.datos}`} color={nDat.color} icono="fa-user-secret" />
      </div>
      <div className="seg-sim">Medidores y consecuencias de simulación: nada de esto ocurre de verdad.</div>

      <div className="seg-ronda" role="tablist" aria-label="Avisos del teléfono">
        {AVISOS.map((a, i) => {
          const d = decisiones.find((x) => x.id === a.id);
          const val = d ? efectoDe(a, d.accion).val : null;
          const col = val === "bien" ? OK : val === "mal" ? NO : AVISO;
          return (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={i === indice}
              className="seg-pto"
              data-sel={i === indice}
              disabled={i > decisiones.length}
              onClick={() => onVer(i)}
              style={val ? { borderColor: col } : undefined}
            >
              {i + 1}
              {val && <i className={`fa-solid ${val === "bien" ? "fa-check" : val === "mal" ? "fa-xmark" : "fa-minus"}`} aria-hidden style={{ color: col }} />}
            </button>
          );
        })}
      </div>

      <div className="seg-tel">
        <div className="seg-barra">
          <span>9:41</span>
          <span className="seg-barra-ico">
            <i className="fa-solid fa-wifi" aria-hidden style={{ color: redAbierta ? NO : undefined }} />
            {redAbierta && <em>red abierta</em>}
            <i className="fa-solid fa-signal" aria-hidden />
            <i className="fa-solid fa-battery-three-quarters" aria-hidden />
          </span>
        </div>

        {aviso ? (
          <div className="seg-cuerpo">
            {aviso.foto && <Foto clave={aviso.foto} icono={aviso.icono} alt="Escena relacionada con el aviso" />}
            <article className="seg-aviso">
              <header>
                <span className="seg-aviso-ico"><i className={`fa-solid ${aviso.icono}`} aria-hidden /></span>
                <strong>{aviso.remitente}</strong>
                <span className="seg-aviso-ahora">ahora</span>
              </header>
              <p>{aviso.texto}</p>
            </article>

            {mostrarSenales && (
              <div className="seg-senales">
                <strong>Señales que se ven al revisar</strong>
                {aviso.senales.map((s) => (
                  <div key={s.id} className="seg-senal" data-alerta={s.alerta}>
                    <i className={`fa-solid ${s.icono}`} aria-hidden />
                    <span>
                      <strong>{s.titulo}.</strong> {s.texto}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!decidido && (
              <>
                {!revisado && (
                  <button type="button" className="seg-btn" onClick={onRevisar}>
                    <i className="fa-solid fa-magnifying-glass" aria-hidden /> Revisar con calma (dominio, https, urgencia, permisos)
                  </button>
                )}
                <div className="seg-acc">
                  {acciones.map((ac, i) => (
                    <button key={ac} type="button" className="seg-ac" onClick={() => onDecidir(ac)}>
                      <i className={`fa-solid ${ac === "abrir" ? "fa-hand-pointer" : ac === "ignorar" ? "fa-eye-slash" : "fa-flag"}`} aria-hidden />
                      <span>{aviso.botones[i]}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="seg-cuerpo">
            <p className="seg-vacio">
              <i className="fa-solid fa-inbox" aria-hidden /> Bandeja vacía. Procesaste los {AVISOS.length} avisos.
            </p>
          </div>
        )}
      </div>

      {aviso && decidido && efecto && (
        <div className="seg-retro" data-val={efecto.val}>
          <strong>
            <i className={`fa-solid ${efecto.val === "bien" ? "fa-circle-check" : efecto.val === "mal" ? "fa-triangle-exclamation" : "fa-circle-minus"}`} aria-hidden />{" "}
            {efecto.val === "bien" ? "Buena decisión" : efecto.val === "mal" ? "Mala decisión" : "Resultado regular"} · {aviso.trampa ? "Era un engaño o un riesgo" : "Era legítimo"}
          </strong>
          {decidido.accion === "abrir" && aviso.trampa && aviso.incidente && (
            <span className="seg-incidente">
              <i className="fa-solid fa-skull-crossbones" aria-hidden /> {aviso.incidente} (simulación)
            </span>
          )}
          <span>{efecto.texto}</span>
          <span className="seg-cambios">
            Dispositivo <strong style={{ color: efecto.seg >= 0 ? OK : NO }}>{efecto.seg > 0 ? `+${efecto.seg}` : efecto.seg}</strong> · Datos expuestos{" "}
            <strong style={{ color: efecto.datos <= 0 ? OK : NO }}>{efecto.datos > 0 ? `+${efecto.datos}` : efecto.datos}</strong>
          </span>
          <button type="button" className="seg-btn" style={{ background: "var(--lsa)", color: "#04121f", border: "none" }} onClick={onSiguiente}>
            <i className={`fa-solid ${ultimo ? "fa-flag-checkered" : "fa-arrow-right"}`} aria-hidden /> {ultimo ? "Ver el resultado" : "Siguiente aviso"}
          </button>
        </div>
      )}

      {!aviso && (
        <div className="seg-retro" data-val={resumen.seguridad >= 60 && resumen.datos <= 20 ? "bien" : "mal"}>
          <strong>
            <i className="fa-solid fa-flag-checkered" aria-hidden /> Resultado: dispositivo {nSeg.texto.toLowerCase()} ({resumen.seguridad}/100) · datos {nDat.texto.toLowerCase()} ({resumen.datos}/100)
          </strong>
          <span>
            Acertaste {resumen.bien} de {AVISOS.length} decisiones; revisaste las señales antes de decidir en {resumen.informadas}.{" "}
            {resumen.incidentes.length > 0 ? `Incidentes (simulación): ${resumen.incidentes.join(", ")}.` : "No hubo ningún incidente."}
          </span>
          <span className="seg-sim">Todo es simulación: dominios, apps y cifras ficticios.</span>
          <button type="button" className="seg-btn" onClick={onReiniciar}>
            <i className="fa-solid fa-rotate-left" aria-hidden /> Repetir con otra estrategia
          </button>
        </div>
      )}
    </div>
  );
}

const css = (accent: string, rgba: string) => `
  @keyframes segShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes segPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .seg-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:700; user-select:none; max-width:100%; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .seg-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .seg-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .seg-chip:active { cursor:grabbing; }
  .seg-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .seg-row[data-shake="true"] { animation:segShake .4s; border-color:${NO}; }
  .seg-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .seg-slot { flex-shrink:0; min-width:min(100%, 170px); min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .seg-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .seg-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:200px; }
  .seg-bin[data-shake="true"] { animation:segShake .4s; border-color:${NO}; }
  .seg-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .seg-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .seg-q:disabled{ cursor:default; }
  .seg-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px; text-align:left;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14.5px; font-weight:800; transition:all .14s; }
  .seg-btn:hover { border-color:${T.lineStrong}; }

  /* Simulador del teléfono */
  .seg-meds { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap:10px; }
  .seg-med { display:grid; gap:6px; padding:10px 12px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glass}; min-width:0; }
  .seg-med-top { display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px 8px; font-size:14px; font-weight:800; color:${T.text2}; }
  .seg-med-top strong { font-size:14.5px; font-variant-numeric:tabular-nums; }
  .seg-med-barra { display:block; height:8px; border-radius:6px; background:${T.inset}; overflow:hidden; }
  .seg-med-barra > span { display:block; height:100%; border-radius:6px; transition:width .4s; }
  .seg-sim { font-size:14px; color:${AVISO}; font-weight:700; }
  .seg-ronda { display:flex; gap:8px; flex-wrap:wrap; }
  .seg-pto { cursor:pointer; display:inline-flex; align-items:center; gap:5px; min-width:44px; height:40px; justify-content:center; border-radius:12px; border:2px solid ${T.line};
    background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:900; }
  .seg-pto[data-sel="true"] { border-color:${accent}; box-shadow:0 0 14px -5px ${accent}; }
  .seg-pto:disabled { opacity:.45; cursor:default; }
  .seg-tel { width:100%; max-width:520px; margin:0 auto; border-radius:26px; border:3px solid ${T.lineStrong}; background:#060d18; overflow:hidden; min-width:0; }
  .seg-barra { display:flex; justify-content:space-between; align-items:center; padding:8px 16px; font-size:14px; font-weight:800; color:${T.text2}; background:rgba(255,255,255,0.04); }
  .seg-barra-ico { display:inline-flex; gap:8px; align-items:center; }
  .seg-barra-ico em { font-style:normal; font-size:14px; color:${NO}; font-weight:800; }
  .seg-cuerpo { display:flex; flex-direction:column; gap:12px; padding:12px; }
  .seg-foto { position:relative; display:block; overflow:hidden; border-radius:14px; aspect-ratio:16/8; max-height:min(26vh, 200px); width:100%;
    background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(8,19,31,0.9)); }
  .seg-foto > i { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:30px; color:rgba(255,255,255,0.5); }
  .seg-foto > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; }
  .seg-aviso { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; padding:12px 14px; min-width:0; }
  .seg-aviso header { display:flex; align-items:center; gap:10px; }
  .seg-aviso header strong { flex:1; min-width:0; font-size:15px; color:#fff; overflow-wrap:anywhere; }
  .seg-aviso-ico { flex-shrink:0; width:34px; height:34px; border-radius:10px; background:rgba(${rgba},0.25); display:flex; align-items:center; justify-content:center; color:#fff; font-size:15px; }
  .seg-aviso-ahora { font-size:14px; color:${T.text3}; }
  .seg-aviso p { margin:8px 0 0; font-size:15.5px; line-height:1.5; color:#fff; overflow-wrap:anywhere; }
  .seg-senales { display:grid; gap:8px; padding:12px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.inset}; }
  .seg-senales > strong { font-size:14px; color:${T.text3}; letter-spacing:.04em; }
  .seg-senal { display:flex; gap:10px; align-items:flex-start; font-size:14.5px; line-height:1.45; color:${T.text2}; }
  .seg-senal i { flex-shrink:0; width:20px; text-align:center; margin-top:3px; color:${OK}; }
  .seg-senal[data-alerta="true"] i { color:${NO}; }
  .seg-senal strong { color:#fff; }
  .seg-acc { display:grid; grid-template-columns:minmax(0,1fr); gap:10px; }
  .seg-ac { cursor:pointer; display:flex; align-items:center; gap:10px; min-height:52px; padding:10px 12px; border-radius:13px; border:1.5px solid ${T.line};
    background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:800; text-align:left; line-height:1.3; transition:all .14s; }
  .seg-ac i { flex-shrink:0; font-size:17px; color:${accent}; width:22px; text-align:center; }
  .seg-ac:hover { border-color:${accent}; transform:translateY(-2px); }
  .seg-ac:focus-visible, .seg-pto:focus-visible, .seg-btn:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  .seg-vacio { margin:0; padding:18px 8px; text-align:center; font-size:15px; color:${T.text2}; }
  .seg-retro { display:flex; flex-direction:column; gap:8px; align-items:flex-start; padding:13px 15px; border-radius:13px; font-size:14.5px; line-height:1.5; color:${T.text2};
    border:1.5px solid ${NO}66; background:${NO}10; }
  .seg-retro[data-val="bien"] { border-color:${OK}66; background:${OK}10; }
  .seg-retro[data-val="regular"] { border-color:${AVISO}66; background:${AVISO}10; }
  .seg-retro strong { color:#fff; font-size:15px; }
  .seg-incidente { padding:6px 10px; border-radius:10px; background:${NO}22; border:1.5px solid ${NO}88; color:#fff; font-weight:800; font-size:14.5px; }
  .seg-cambios { font-size:14px; color:${T.text2}; }
  .seg-dato { padding:6px 12px; border-radius:999px; border:1.5px solid ${NO}88; background:${NO}18; color:#fff; font-size:14px; font-weight:700; }

  /* Identidad del tablero */
  .seg-bin, .seg-row { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .seg-bin:nth-of-type(6n+1), .seg-row:nth-of-type(6n+1) { --tono:188; }
  .seg-bin:nth-of-type(6n+2), .seg-row:nth-of-type(6n+2) { --tono:262; }
  .seg-bin:nth-of-type(6n+3), .seg-row:nth-of-type(6n+3) { --tono:44; }
  .seg-bin:nth-of-type(6n+4), .seg-row:nth-of-type(6n+4) { --tono:152; }
  .seg-bin:nth-of-type(6n+5), .seg-row:nth-of-type(6n+5) { --tono:330; }
  .seg-bin:nth-of-type(6n+6), .seg-row:nth-of-type(6n+6) { --tono:18; }
  .seg-bin::before, .seg-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .seg-bin[data-done="true"], .seg-row[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  @media (prefers-reduced-motion: reduce){ .seg-row[data-shake="true"], .seg-bin[data-shake="true"] { animation:none; } .seg-chip, .seg-chip:hover, .seg-chip[data-sel="true"], .seg-ac:hover { transform:none; transition:none; } .seg-med-barra > span { transition:none; } }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsPracticas({
  selPract,
  shakePract,
  ubicPract,
  onMatch,
  dropProps,
}: {
  selPract: string | null;
  shakePract: Categoria | null;
  ubicPract: Record<string, Categoria>;
  onMatch: (practId: string, bin: Categoria) => void;
  dropProps: DropFactory;
}) {
  const bins: Categoria[] = ["segura", "riesgosa"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = CATEGORIA_INFO[bin];
        const dentro = PRACTICAS.filter((p) => ubicPract[p.id] === bin);
        return (
          <div
            key={bin}
            className="seg-bin"
            data-shake={shakePract === bin}
            onClick={() => selPract && onMatch(selPract, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <VinetaTermino termino={info.titulo} color={bin === "segura" ? OK : NO} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((p) => (
                  <span key={p.id} style={{ animation: "segPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 2 }} />
                    {p.texto}
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

function RowsAmenazas({
  selAmen,
  shakeAmen,
  empAmen,
  onMatch,
  dropProps,
}: {
  selAmen: string | null;
  shakeAmen: string | null;
  empAmen: Record<string, boolean>;
  onMatch: (chipId: string, rowId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {AMENAZAS.map((a) => {
        const done = empAmen[a.id];
        return (
          <div
            key={a.id}
            className="seg-row"
            data-shake={shakeAmen === a.id}
            data-done={done}
            onClick={() => !done && selAmen && onMatch(selAmen, a.id)}
            {...dropProps((id) => onMatch(id, a.id))}
          >
            <div className="seg-slot" data-armed={!done && !!selAmen} style={done ? { borderStyle: "solid", borderColor: OK, background: `${OK}1a` } : undefined}>
              {done ? (
                <span style={{ animation: "segPop .25s ease", fontSize: 14.5, fontWeight: 900, color: "#fff", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <i className="fa-solid fa-triangle-exclamation" />
                  {a.amenaza}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 14 }} /> amenaza
                </span>
              )}
            </div>
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: done ? "#fff" : T.text2, lineHeight: 1.4 }}>{a.descripcion}</div>
              <div style={{ fontSize: 14, color: done ? OK : T.text3, lineHeight: 1.45, marginTop: 5, display: "flex", gap: 7 }}>
                <i className="fa-solid fa-shield-halved" style={{ fontSize: 14, marginTop: 3 }} />
                <span>{a.defensa}</span>
              </div>
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
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 15, color: T.text }}>
          <i className="fa-solid fa-clipboard-question" style={{ marginRight: 8, color: accent }} />
          Comprueba lo aprendido
        </strong>
        {aprobado && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 800, color: OK }}>
            <i className="fa-solid fa-circle-check" /> Aprobado
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginBottom: 18, lineHeight: 1.5 }}>
        Seis afirmaciones sobre seguridad, normatividad y privacidad al navegar en internet. Decide si son verdaderas o falsas y pulsa «Comprobar».
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUIZ.map((q, qi) => {
          const elegida = resp[qi];
          return (
            <div key={qi}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 11, display: "flex", gap: 10 }}>
                <span style={{ color: accent }}>{qi + 1}.</span>
                <span>{q.pregunta}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 9 }}>
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
                    <button key={oi} className="seg-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="seg-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="seg-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 16px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 14.5, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas e inténtalo de nuevo</span>}
          </div>
        )}
      </div>
    </div>
  );
}
