"use client";

/**
 * Laboratorio — Tipos de tiempo histórico: el tiempo que medimos y el que
 * sentimos.
 * Práctica experimental para CH-I-P02 (Conciencia Histórica I).
 *
 * El alumno trabaja en un TALLER DE LÍNEA DEL TIEMPO: coloca sobre el eje siete
 * sucesos reales (los de la infografía y el glosario, más tres procesos que los
 * enmarcan), cambia la ESCALA (año, década, siglo) y la PERIODIZACIÓN (por
 * siglos, por etapas de México, ninguna) y ve al instante tres consecuencias:
 * barras cuya longitud es la duración real (corta, mediana, larga), las
 * simultaneidades (qué coincidió con qué) y una medida de coherencia. A escala
 * de siglo, la Revolución y la Constitución caen en la misma marca y ya no se
 * distingue cuál fue antes; una periodización por siglos parte la época
 * colonial en cuatro pedazos y la de etapas no.
 *
 * Modos: Taller · ¿Larga, mediana o corta? (clasificar, verbatim A5) · Línea
 * cronológica (ordenar, verbatim A1) · Escribe el término (glosario A5) ·
 * Completa el texto. El cuestionario V/F de A4 vive en «Reto» y todo el texto
 * curricular en «Teoría».
 */

import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent, type PointerEvent } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato, Deslizador } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { TIEMPO_HISTORICO_HUECOS } from "./tiempo-historico-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { TIEMPO_HISTORICO_FICHA } from "./tiempo-historico-ficha";
import {
  ITEMS_DURACION,
  DURACION_INFO,
  HITOS,
  PARES,
  QUIZ,
  DATO_TIEMPO,
  type Duracion,
} from "./tiempo-historico-data";
import {
  SUCESOS,
  ANIO_MIN,
  ANIO_MAX,
  DURACION_TXT,
  ESCALAS,
  PERIODIZACIONES,
  ajustar,
  barras,
  coherencia,
  cortados,
  empates,
  etiquetas,
  explicarTaller,
  marcas,
  retro,
  simultaneosReales,
  type Barra,
  type Colocados,
  type Escala,
  type Periodo,
} from "./tiempo-historico-sim";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";

const NO = "#FF5E5E";
const AVISO = "#FFC75A";
const RETO_KEY = "cen-tiempo-historico-reto";
const RUTA_IMG = "/media/labs-sim/tiempo-historico";
const TOTAL = ANIO_MAX - ANIO_MIN;

type Modo = "taller" | "duracion" | "linea" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "taller", label: "Taller de la línea del tiempo", icono: "fa-timeline" },
  { id: "duracion", label: "¿Larga, mediana o corta duración?", icono: "fa-layer-group" },
  { id: "linea", label: "La línea del tiempo cronológico", icono: "fa-calendar-days" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

const pct = (anio: number) => `${((anio - ANIO_MIN) / TOTAL) * 100}%`;
const ux = (anio: number) => ((anio - ANIO_MIN) / TOTAL) * 1000;

export function LabTiempoHistorico({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("taller");

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
  const sfxBlip = () => sonido && audioRef.current?.blip();

  // ── taller de la línea del tiempo ──────────────────────────────────────
  const [escala, setEscala] = useState<Escala>("decada");
  const [periodo, setPeriodo] = useState<Periodo>("siglos");
  const [colocados, setColocados] = useState<Colocados>({});
  const [primero, setPrimero] = useState<Record<string, boolean>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [cursor, setCursor] = useState(1700);
  const [ultimo, setUltimo] = useState<string | null>(null);
  const [hEmpate, setHEmpate] = useState(false);

  const bs = barras(colocados, escala);
  const coh = coherencia(bs);
  const cortes = cortados(bs, periodo);
  const nColocados = bs.length;
  const aPrimera = Object.values(primero).filter(Boolean).length;
  const barraUltima = bs.find((b) => b.suceso.id === ultimo);

  // Los hitos se guardan: cambiar de modo o de escala no los des-cumple.
  const revisarEmpate = (col: Colocados, esc: Escala) => {
    if (esc === "siglo" && empates(barras(col, esc)).length > 0) setHEmpate(true);
  };

  const moverCursor = (anio: number) => setCursor(ajustar(anio, escala));
  const cambiarEscala = (e: Escala) => {
    setEscala(e);
    setCursor((c) => ajustar(c, e));
    revisarEmpate(colocados, e);
    sfxBlip();
  };
  const cambiarPeriodo = (p: Periodo) => {
    setPeriodo(p);
    sfxBlip();
  };
  const colocar = () => {
    if (!sel) return;
    const anio = ajustar(cursor, escala);
    const suc = SUCESOS.find((s) => s.id === sel)!;
    const col = { ...colocados, [sel]: anio };
    setColocados(col);
    if (primero[sel] === undefined) {
      const bien = Math.abs(anio - suc.inicio) <= ESCALAS[escala].tolerancia;
      setPrimero((p) => ({ ...p, [sel]: bien }));
      if (bien) sfxPlace();
      else sfxNo();
    } else {
      sfxBlip();
    }
    setUltimo(sel);
    setSel(null);
    revisarEmpate(col, escala);
  };
  const resetTaller = () => {
    setColocados({});
    setPrimero({});
    setSel(null);
    setUltimo(null);
    setCursor(1700);
  };

  const clicEje = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (r.width <= 0) return;
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    moverCursor(ANIO_MIN + f * TOTAL);
  };
  const tecladoEje = (e: KeyboardEvent<HTMLDivElement>) => {
    const paso = ESCALAS[escala].paso;
    if (e.key === "ArrowLeft") moverCursor(cursor - paso);
    else if (e.key === "ArrowRight") moverCursor(cursor + paso);
    else if (e.key === "PageDown") moverCursor(cursor - 50);
    else if (e.key === "PageUp") moverCursor(cursor + 50);
    else if (e.key === "Home") moverCursor(ANIO_MIN);
    else if (e.key === "End") moverCursor(ANIO_MAX);
    else if (e.key === "Enter" && sel) colocar();
    else return;
    e.preventDefault();
  };

  // ── modo Duración (clasifica en 3 columnas de Braudel) ──────────────────
  const [ubicDur, setUbicDur] = useState<Record<string, Duracion>>({});
  const [selDur, setSelDur] = useState<string | null>(null);
  const [shakeDur, setShakeDur] = useState<Duracion | null>(null);
  const durLibres = ITEMS_DURACION.filter((x) => !ubicDur[x.id])
    .slice()
    .sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarDur = (itemId: string, bin: Duracion) => {
    if (ubicDur[itemId]) return;
    const it = ITEMS_DURACION.find((x) => x.id === itemId);
    if (it && it.duracion === bin) {
      setUbicDur((e) => ({ ...e, [itemId]: bin }));
      setSelDur(null);
      sfxPlace();
      if (Object.keys(ubicDur).length + 1 >= ITEMS_DURACION.length) {
        sfxOk();
        persistMejor(true, lineaDone, glosarioDone);
      }
    } else {
      setShakeDur(bin);
      sfxNo();
      window.setTimeout(() => setShakeDur(null), 420);
    }
  };
  const resetDuracion = () => {
    setUbicDur({});
    setSelDur(null);
  };

  // ── modo Línea (ordena cronológicamente) ───────────────────────────────
  const [lineaPos, setLineaPos] = useState(0);
  const [selL, setSelL] = useState<string | null>(null);
  const [shakeL, setShakeL] = useState(false);
  // mezcla determinista: por una clave de texto, NO por fecha (localeCompare)
  const lineaLibres = HITOS.filter((h) => h.orden >= lineaPos)
    .slice()
    .sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  const intentarLinea = (hitoId: string) => {
    if (lineaPos >= HITOS.length) return;
    const esperado = HITOS[lineaPos]!;
    if (hitoId === esperado.id) {
      setLineaPos((p) => p + 1);
      setSelL(null);
      sfxPlace();
      if (lineaPos + 1 >= HITOS.length) {
        sfxOk();
        persistMejor(duracionDone, true, glosarioDone);
      }
    } else {
      setShakeL(true);
      sfxNo();
      window.setTimeout(() => setShakeL(false), 420);
    }
  };
  const resetLinea = () => {
    setLineaPos(0);
    setSelL(null);
  };

  // ── modo Glosario (escribe el término) ─────────────────────────────────
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
  const duracionDone = Object.keys(ubicDur).length >= ITEMS_DURACION.length;
  const lineaDone = lineaPos >= HITOS.length;
  const modosHechos = (duracionDone ? 1 : 0) + (lineaDone ? 1 : 0) + (glosarioDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los 3 modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 4);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);

  const persistMejor = (a: boolean, b: boolean, c: boolean) => {
    const est = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0);
    registraEstrellas(est);
  };

  const objetivos = [
    { txt: "Coloca los 7 sucesos en la línea del tiempo", done: Object.keys(colocados).length >= SUCESOS.length },
    { txt: "Cambia a escala de siglo y descubre qué sucesos dejan de distinguirse", done: hEmpate },
    { txt: "Clasifica los 6 casos por su duración (Braudel)", done: duracionDone },
    { txt: "Ordena la línea del tiempo cronológico", done: lineaDone },
    { txt: "Escribe los 6 conceptos del glosario", done: glosarioDone, modo: "glosario" },
    { txt: "Consigue 3★ (una por cada modo)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  // arrastre nativo
  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      // El hueco que deja la tarjeta mientras viaja. Por atributo y no por
      // estado: un render por cada gesto de arrastre se nota con 20 tarjetas.
      e.currentTarget.setAttribute("data-arrastrando", "true");
    },
    onDragEnd: (e: DragEvent) => {
      // También cuando se suelta FUERA de cualquier zona; si no, la tarjeta se
      // queda medio borrada para siempre.
      e.currentTarget.removeAttribute("data-arrastrando");
      document.querySelectorAll('[data-sobre="true"]').forEach((z) => z.removeAttribute("data-sobre"));
    },
  });
  const dropProps = (onDrop: (id: string) => void) => ({
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDragEnter: (e: DragEvent) => {
      e.preventDefault();
      e.currentTarget.setAttribute("data-sobre", "true");
    },
    onDragLeave: (e: DragEvent) => {
      // `dragleave` salta también al pasar sobre un HIJO de la zona. Apagar sin
      // comprobar deja la zona parpadeando mientras mueves la mano por dentro.
      const r = e.currentTarget.getBoundingClientRect();
      const fuera = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (fuera) e.currentTarget.removeAttribute("data-sobre");
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      e.currentTarget.removeAttribute("data-sobre");
      const id = e.dataTransfer.getData("text/plain");
      if (id) onDrop(id);
    },
    "data-zona": "true" as const,
    role: "button" as const,
    tabIndex: 0,
    onKeyDown: (e: KeyboardEvent) => {
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
  const resetActual = modo === "texto" ? resetTexto : modo === "taller" ? resetTaller : modo === "duracion" ? resetDuracion : modo === "linea" ? resetLinea : resetGlosario;

  const lectura =
    modo === "taller" ? (
      <>Coherencia {coh === null ? "—" : `${coh} %`} · Colocados {nColocados}/{SUCESOS.length} · Cortes {cortes.length}</>
    ) : modo === "duracion" ? (
      <>Casos clasificados: {Object.keys(ubicDur).length}/{ITEMS_DURACION.length}</>
    ) : modo === "linea" ? (
      <>Hitos ordenados: {lineaPos}/{HITOS.length}</>
    ) : modo === "glosario" ? (
      <>Repaso de los términos del tiempo histórico</>
    ) : (
      <>Completa el párrafo sobre el tiempo</>
    );

  const instruccion = (txt: string, n?: string, ok?: boolean) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 15, fontWeight: 800, color: T.text }}>
      <span>{txt}</span>
      {n && <span style={{ fontSize: 15, fontWeight: 900, color: ok ? OK : T.text3 }}>{n}</span>}
    </div>
  );

  const cohCol = coh === null ? T.text3 : coh >= 85 ? OK : coh >= 60 ? AVISO : NO;
  const suceso = sel ? SUCESOS.find((s) => s.id === sel)! : null;

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

          {modo === "taller" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
              {/* Variables del experimento */}
              <div className="th-ctrl">
                <div className="th-seg" role="group" aria-label="Escala">
                  <span>Escala</span>
                  {(Object.keys(ESCALAS) as Escala[]).map((e) => (
                    <button key={e} type="button" className="th-segb" data-on={escala === e} onClick={() => cambiarEscala(e)}>
                      {ESCALAS[e].etiqueta}
                    </button>
                  ))}
                </div>
                <div className="th-seg" role="group" aria-label="Periodización">
                  <span>Periodización</span>
                  {(Object.keys(PERIODIZACIONES) as Periodo[]).map((p) => (
                    <button key={p} type="button" className="th-segb" data-on={periodo === p} onClick={() => cambiarPeriodo(p)}>
                      {PERIODIZACIONES[p].etiqueta}
                    </button>
                  ))}
                </div>
              </div>

              {/* Banco de sucesos */}
              <div>
                {instruccion("1. Elige un suceso", `${nColocados}/${SUCESOS.length} en la línea`, nColocados >= SUCESOS.length)}
                <div className="th-banco">
                  {SUCESOS.map((s) => {
                    const puesto = colocados[s.id];
                    return (
                      <button key={s.id} type="button" className="th-suc" data-sel={sel === s.id} data-puesto={puesto !== undefined} onClick={() => setSel((v) => (v === s.id ? null : s.id))}>
                        <span className="th-thumb">
                          <i className={`fa-solid ${s.icono}`} aria-hidden />
                          <img
                            src={`${RUTA_IMG}/${s.clave}.webp`}
                            alt=""
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </span>
                        <span className="th-suc-txt">
                          <strong>{s.nombre}</strong>
                          <em>{puesto !== undefined ? `Pusiste ${puesto}` : "Sin colocar"}</em>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Eje + barras */}
              <div>
                {instruccion("2. Marca el año en el eje y colócalo", `Cursor: ${cursor}`)}
                <div className="th-tablero">
                  <div
                    className="th-eje"
                    role="slider"
                    tabIndex={0}
                    aria-label="Año del cursor"
                    aria-valuemin={ANIO_MIN}
                    aria-valuemax={ANIO_MAX}
                    aria-valuenow={cursor}
                    onPointerDown={clicEje}
                    onPointerMove={(e) => e.buttons === 1 && clicEje(e)}
                    onKeyDown={tecladoEje}
                  >
                    <svg className="th-ruler" viewBox="0 0 1000 14" preserveAspectRatio="none" aria-hidden>
                      {marcas(escala).map((a) => (
                        <line key={a} x1={ux(a)} x2={ux(a)} y1={a % 50 === 0 ? 2 : 8} y2={14} stroke="rgba(255,255,255,0.4)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                      ))}
                    </svg>
                    {etiquetas(escala).map((a) => (
                      <span key={a} className="th-tick" style={{ left: pct(a) }}>{a}</span>
                    ))}
                    <span className="th-cursor-eje" style={{ left: pct(cursor) }} aria-hidden />
                  </div>

                  <div className="th-filas">
                    <span className="th-cursor" style={{ left: pct(cursor) }} aria-hidden />
                    {bs.length === 0 && <div className="th-vacio">Aquí aparecerán las barras: su largo es lo que duró cada suceso.</div>}
                    {bs.map((b) => (
                      <FilaBarra key={b.suceso.id} b={b} bs={bs} periodo={periodo} />
                    ))}
                  </div>
                </div>

                <div className="th-acciones">
                  <button type="button" className="th-mini" aria-label="Año anterior" onClick={() => moverCursor(cursor - ESCALAS[escala].paso)}>
                    <i className="fa-solid fa-chevron-left" aria-hidden />
                  </button>
                  <button type="button" className="th-poner" disabled={!sel} onClick={colocar}>
                    <i className="fa-solid fa-thumbtack" aria-hidden /> {suceso ? `Colocar «${suceso.nombre}» en ${ajustar(cursor, escala)}` : "Elige un suceso para colocarlo"}
                  </button>
                  <button type="button" className="th-mini" aria-label="Año siguiente" onClick={() => moverCursor(cursor + ESCALAS[escala].paso)}>
                    <i className="fa-solid fa-chevron-right" aria-hidden />
                  </button>
                </div>
              </div>

              {/* Leyenda de duración + periodización */}
              <div className="th-leyenda">
                {(Object.keys(DURACION_TXT) as Duracion[]).map((d) => (
                  <span key={d}><i style={{ background: DURACION_TXT[d].col }} aria-hidden /> {DURACION_TXT[d].nombre}: {DURACION_TXT[d].regla}</span>
                ))}
              </div>
              {periodo !== "ninguna" && (
                <div className="th-periodos">
                  <strong>{PERIODIZACIONES[periodo].etiqueta}:</strong>{" "}
                  {PERIODIZACIONES[periodo].bandas.map((b) => `${b.nombre} (${b.desde}–${b.hasta === ANIO_MAX ? "…" : b.hasta})`).join(" · ")}
                </div>
              )}

              {/* Medidores */}
              <div className="th-meds">
                <div className="th-med">
                  <div className="th-med-top"><span>Coherencia</span><strong style={{ color: cohCol }}>{coh === null ? "—" : `${coh} %`}</strong></div>
                  <div className="th-barra" role="img" aria-label={`Coherencia ${coh ?? 0} de 100`}><div style={{ width: `${coh ?? 0}%`, background: cohCol }} /></div>
                  <span className="th-nota">Orden y simultaneidad bien resueltos</span>
                </div>
                <div className="th-med">
                  <div className="th-med-top"><span>Procesos partidos</span><strong style={{ color: cortes.length > 0 ? AVISO : OK }}>{cortes.length}</strong></div>
                  <div className="th-barra"><div style={{ width: `${Math.min(100, (cortes.length / SUCESOS.length) * 100)}%`, background: cortes.length > 0 ? AVISO : OK }} /></div>
                  <span className="th-nota">Cortes de la periodización que atraviesan un suceso</span>
                </div>
              </div>

              {barraUltima && (
                <div className="th-retro" data-ok={barraUltima.bien}>
                  <i className={`fa-solid ${barraUltima.bien ? "fa-circle-check" : "fa-circle-xmark"}`} aria-hidden />
                  <span>{retro(barraUltima)}</span>
                </div>
              )}

              <div className="th-porque">
                <div className="th-sub"><i className="fa-solid fa-circle-question" aria-hidden /> Por qué se ve así</div>
                <ul>
                  {explicarTaller(bs, escala, periodo).map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={TIEMPO_HISTORICO_HUECOS}
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

          {modo === "duracion" && (
            <Mesa>
              <div>
                {instruccion("Arrastra cada caso a su duración histórica", `${Object.keys(ubicDur).length}/${ITEMS_DURACION.length}`, duracionDone)}
                {durLibres.length === 0 ? (
                  <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9, marginTop: 10 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {ITEMS_DURACION.length} casos!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                    {durLibres.map((x) => (
                      <button key={x.id} className="th-chip" data-sel={selDur === x.id} onClick={() => setSelDur((s) => (s === x.id ? null : x.id))} {...dragProps(x.id)}>
                        {x.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <BinsDuracion selDur={selDur} shakeDur={shakeDur} ubicDur={ubicDur} onMatch={intentarDur} dropProps={dropProps} />
            </Mesa>
          )}

          {modo === "linea" && (
            <Mesa>
              <div>
                {instruccion("Ordena los hitos del más antiguo al más reciente", `${lineaPos}/${HITOS.length}`, lineaDone)}
                {lineaLibres.length === 0 ? (
                  <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9, marginTop: 10 }}>
                    <i className="fa-solid fa-circle-check" /> ¡Reconstruiste la línea del tiempo cronológico!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                    {lineaLibres.map((h) => (
                      <button key={h.id} className="th-chip" data-sel={selL === h.id} onClick={() => setSelL((s) => (s === h.id ? null : h.id))} {...dragProps(h.id)}>
                        <i className="fa-solid fa-calendar-days" style={{ fontSize: 14, color: T.text3 }} />
                        {h.texto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <LineaOrden selL={selL} shakeL={shakeL} lineaPos={lineaPos} onMatch={intentarLinea} dropProps={dropProps} />
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
                persistMejor(duracionDone, lineaDone, true);
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
              <Bloque titulo="Cursor del eje" icono="fa-sliders">
                <Deslizador
                  label="Año del cursor"
                  icon="fa-location-dot"
                  colr={accent}
                  valor={`${ajustar(cursor, escala)}`}
                  min={ANIO_MIN}
                  max={ANIO_MAX}
                  step={ESCALAS[escala].paso}
                  value={cursor}
                  onChange={(v) => moverCursor(v)}
                  hintL={`${ANIO_MIN}`}
                  hintR={`${ANIO_MAX}`}
                />
              </Bloque>

              <Bloque titulo="Lo que mide el taller" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Coherencia" value={coh === null ? "—" : `${coh} %`} col={coh === null ? undefined : cohCol} />
                  <Dato label="Colocados" value={`${nColocados}/${SUCESOS.length}`} col={nColocados >= SUCESOS.length ? OK : undefined} />
                  <Dato label="A la primera" value={`${aPrimera}/${SUCESOS.length}`} />
                  <Dato label="Coincidencias" value={`${simultaneosReales(bs).length}`} />
                </div>
              </Bloque>

              <Bloque titulo="Bitácora de sucesos" icono="fa-clipboard-list">
                {bs.length === 0 ? (
                  <p style={{ margin: 0, color: T.text3 }}>Aún no colocas ninguno. Hazlo en «Taller de la línea del tiempo».</p>
                ) : (
                  bs.map((b) => (
                    <p key={b.suceso.id} style={{ margin: 0, color: T.text2 }}>
                      <strong style={{ color: b.bien ? OK : NO }}>{b.suceso.nombre}.</strong> {retro(b)}
                    </p>
                  ))
                )}
              </Bloque>

              <Bloque titulo="Tu partida" icono="fa-star">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    {bestEstrellas >= 3 ? "¡Distingues el tiempo que medimos del que sentimos!" : "Termina los tres modos de repaso para ganar 2★; la tercera pide 2 errores o menos."}
                  </span>
                </div>
              </Bloque>
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
              <Bloque titulo="Los tres tiempos de Braudel" icono="fa-layer-group">
                {(Object.keys(DURACION_INFO) as Duracion[]).map((d) => (
                  <p key={d} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{DURACION_INFO[d].titulo}.</strong> {DURACION_INFO[d].subtitulo}
                  </p>
                ))}
                <p style={{ margin: 0, color: T.text2 }}>
                  El <strong style={{ color: T.text }}>clima</strong> y la geografía son de larga duración; una <strong style={{ color: T.text }}>crisis económica</strong> es de mediana duración; una <strong style={{ color: T.text }}>batalla</strong> es de tiempo corto.
                </p>
              </Bloque>
              <Bloque titulo="La línea del tiempo de la infografía" icono="fa-timeline">
                {HITOS.map((h) => (
                  <p key={h.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{h.anio}.</strong> {h.texto} ({h.etapa})
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Glosario" icono="fa-book-open">
                {PARES.map((p) => (
                  <p key={p.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{p.termino}.</strong> {p.definicion} <em style={{ color: T.text3 }}>{p.ejemplo}</em>
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Cómo funciona el taller" icono="fa-calculator">
                <p style={{ margin: 0, color: T.text2 }}>
                  El largo de cada barra es la duración real del suceso; tú decides dónde empieza. La escala redondea tu año (al año, a la década o al siglo): cuanto más gruesa, menos se distingue. La coherencia compara, en cada par de sucesos, si acertaste cuál fue antes y si coincidieron en el tiempo. Los cortes de la periodización son líneas: si pasan por dentro de una barra, parten ese proceso.
                </p>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_TIEMPO}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={TIEMPO_HISTORICO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Una fila del taller: nombre y fechas arriba; debajo, el carril en SVG con las
 * bandas de la periodización, los cortes, las coincidencias y la barra.
 * ═══════════════════════════════════════════════════════════════════════════ */
function FilaBarra({ b, bs, periodo }: { b: Barra; bs: Barra[]; periodo: Periodo }) {
  const p = PERIODIZACIONES[periodo];
  const col = DURACION_TXT[b.duracion].col;
  const x1 = ux(b.desde);
  const x2 = ux(b.hasta);
  const s = b.suceso;
  // Coincidencias de ESTA barra con las demás, como se ven en el eje.
  const traslapes = bs
    .filter((o) => o.suceso.id !== s.id && o.desde <= b.hasta && b.desde <= o.hasta)
    .map((o) => ({ id: o.suceso.id, a: Math.max(b.desde, o.desde), z: Math.min(b.hasta, o.hasta) }));
  const dur = s.fin - s.inicio;
  return (
    <div className="th-fila">
      <div className="th-fila-txt">
        <strong>{s.nombre}</strong>
        <span>
          {b.desde}
          {dur > 0 ? `–${b.hasta}` : ""} · {DURACION_TXT[b.duracion].nombre}
          {!b.bien ? ` · real: ${s.inicio}${dur > 0 ? `–${s.fin}` : ""}` : ""}
        </span>
      </div>
      <svg viewBox="0 0 1000 24" preserveAspectRatio="none" className="th-carril" role="img" aria-label={`${s.nombre}: barra de ${dur === 0 ? "menos de un año" : `${dur} años`}`}>
        {p.bandas.map((ba, i) => (
          <rect key={ba.nombre} x={ux(ba.desde)} width={ux(ba.hasta) - ux(ba.desde)} y={0} height={24} fill={i % 2 === 0 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0)"} />
        ))}
        {traslapes.map((t) => (
          <rect key={t.id} x={ux(t.a)} width={Math.max(8, ux(t.z) - ux(t.a))} y={0} height={24} fill="rgba(255,255,255,0.2)" />
        ))}
        {p.cortes.map((c) => (
          <line key={c} x1={ux(c)} x2={ux(c)} y1={0} y2={24} stroke="rgba(255,255,255,0.55)" strokeWidth={1.5} strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
        ))}
        {!b.bien && (
          <rect x={ux(s.inicio)} width={Math.max(10, ux(s.fin) - ux(s.inicio))} y={2} height={20} rx={4} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={1.5} strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
        )}
        <rect x={x1} width={Math.max(10, x2 - x1)} y={6} height={12} rx={4} fill={col} />
      </svg>
    </div>
  );
}

const css = (accent: string, rgba: string) => `
  @keyframes thShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes thPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .th-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:700; user-select:none; max-width:100%; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .th-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .th-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .th-chip:active { cursor:grabbing; }
  .th-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:200px; }
  .th-bin[data-shake="true"] { animation:thShake .4s; border-color:${NO}; }
  .th-step { border-radius:13px; border:1.5px solid ${OK}66; background:${OK}0f; padding:13px 16px; display:flex; align-items:flex-start; gap:12px; animation:thPop .25s ease; }
  .th-fslot { border-radius:13px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; padding:14px 16px; transition:all .16s;
    display:flex; align-items:center; gap:12px; color:${T.text3}; font-size:14.5px; cursor:pointer; }
  .th-fslot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); color:#fff; }
  .th-fslot[data-shake="true"] { animation:thShake .4s; border-color:${NO}; }
  .th-locked { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:13px 16px; display:flex; align-items:center; gap:12px; opacity:0.55; }
  .th-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .th-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .th-q:disabled{ cursor:default; }
  .th-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14.5px; font-weight:800; transition:all .14s; }
  .th-btn:hover { border-color:${T.lineStrong}; }
  @media (prefers-reduced-motion: reduce){ .th-bin[data-shake="true"], .th-fslot[data-shake="true"] { animation:none; } .th-chip, .th-chip:hover, .th-chip[data-sel="true"] { transform:none; transition:none; } }

  /* Taller de la línea del tiempo */
  .th-ctrl { display:grid; gap:10px; }
  .th-seg { display:flex; flex-wrap:wrap; align-items:center; gap:8px; font-size:14px; font-weight:800; color:${T.text2}; }
  .th-seg > span { flex:0 0 auto; min-width:104px; }
  .th-segb { cursor:pointer; min-height:40px; padding:8px 14px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; transition:all .14s; }
  .th-segb:hover { border-color:${accent}; }
  .th-segb[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.24); }
  .th-banco { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 210px), 1fr)); gap:8px; margin-top:10px; }
  .th-suc { cursor:pointer; display:flex; align-items:center; gap:10px; padding:7px 10px 7px 7px; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; text-align:left; transition:all .14s; min-width:0; }
  .th-suc:hover { border-color:${T.lineStrong}; }
  .th-suc[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.22); box-shadow:0 0 14px -5px ${accent}; }
  .th-suc[data-puesto="true"] { border-color:${OK}66; }
  .th-thumb { position:relative; flex:0 0 48px; height:48px; border-radius:10px; overflow:hidden; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, rgba(${rgba},0.35), rgba(2,12,28,0.9)); }
  .th-thumb > i { font-size:18px; color:rgba(255,255,255,0.6); }
  .th-thumb > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .th-suc-txt { display:flex; flex-direction:column; gap:2px; min-width:0; }
  .th-suc-txt strong { font-size:14.5px; line-height:1.25; overflow-wrap:anywhere; }
  .th-suc-txt em { font-style:normal; font-size:14px; color:${T.text3}; }
  .th-tablero { margin-top:10px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glass}; padding:10px 12px 12px; }
  .th-eje { position:relative; height:46px; cursor:crosshair; touch-action:none; border-bottom:1.5px solid ${T.lineStrong}; outline:none; margin-bottom:6px; }
  .th-eje:focus-visible { box-shadow:0 0 0 3px rgba(${rgba},0.5); border-radius:6px; }
  .th-ruler { position:absolute; left:0; right:0; top:0; width:100%; height:14px; }
  .th-tick { position:absolute; top:18px; transform:translateX(-50%); font-size:14px; font-weight:700; color:${T.text2}; font-variant-numeric:tabular-nums; }
  .th-tick:first-of-type { transform:none; }
  .th-cursor-eje { position:absolute; top:0; bottom:-2px; width:3px; margin-left:-1.5px; background:${accent}; border-radius:2px; }
  .th-filas { position:relative; display:grid; gap:6px; min-height:60px; }
  .th-cursor { position:absolute; top:0; bottom:0; width:2px; margin-left:-1px; background:${accent}; opacity:.7; pointer-events:none; z-index:2; }
  .th-vacio { padding:14px 4px; font-size:14.5px; color:${T.text3}; line-height:1.4; }
  .th-fila { display:grid; gap:2px; }
  .th-fila-txt { display:flex; flex-wrap:wrap; justify-content:space-between; gap:2px 10px; font-size:14px; }
  .th-fila-txt strong { color:#fff; font-size:14.5px; }
  .th-fila-txt span { color:${T.text3}; }
  .th-carril { display:block; width:100%; height:24px; border-radius:6px; background:${T.inset}; }
  .th-acciones { display:flex; gap:8px; align-items:stretch; margin-top:10px; }
  .th-mini { cursor:pointer; flex:0 0 48px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:15px; }
  .th-mini:hover { border-color:${accent}; }
  .th-poner { cursor:pointer; flex:1; min-height:48px; padding:8px 14px; border-radius:12px; border:none; background:${accent}; color:#04121f; font-size:15px; font-weight:900; line-height:1.25; }
  .th-poner:disabled { cursor:default; background:${T.glassSoft}; color:${T.text3}; border:1.5px solid ${T.line}; }
  .th-leyenda { display:flex; flex-wrap:wrap; gap:6px 16px; font-size:14px; color:${T.text2}; }
  .th-leyenda span { display:inline-flex; align-items:center; gap:7px; }
  .th-leyenda i { width:18px; height:10px; border-radius:3px; display:inline-block; }
  .th-periodos { font-size:14px; color:${T.text2}; line-height:1.5; }
  .th-periodos strong { color:#fff; }
  .th-meds { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap:10px; }
  .th-med { display:grid; gap:6px; padding:11px 13px; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; min-width:0; }
  .th-med-top { display:flex; justify-content:space-between; align-items:baseline; gap:8px; font-size:14px; font-weight:800; color:${T.text2}; }
  .th-med-top strong { font-size:20px; font-weight:900; font-variant-numeric:tabular-nums; font-family:ui-monospace, monospace; }
  .th-barra { height:9px; border-radius:6px; background:${T.inset}; overflow:hidden; }
  .th-barra > div { height:100%; border-radius:6px; transition:width .35s, background .35s; }
  .th-nota { font-size:14px; color:${T.text3}; line-height:1.35; }
  .th-retro { display:flex; gap:10px; align-items:flex-start; padding:12px 14px; border-radius:13px; border:1.5px solid ${NO}66; background:${NO}10; font-size:14.5px; line-height:1.5; color:${T.text2}; }
  .th-retro[data-ok="true"] { border-color:${OK}66; background:${OK}10; }
  .th-retro i { margin-top:3px; color:${NO}; }
  .th-retro[data-ok="true"] i { color:${OK}; }
  .th-sub { font-size:14px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; color:${T.text3}; margin-bottom:6px; }
  .th-sub i { color:${accent}; margin-right:6px; }
  .th-porque { padding:12px 14px; border-radius:13px; border:1.5px solid rgba(${rgba},0.4); background:rgba(${rgba},0.08); }
  .th-porque ul { margin:0; padding-left:20px; display:grid; gap:6px; font-size:14.5px; line-height:1.5; color:${T.text2}; }
  .th-segb:focus-visible, .th-suc:focus-visible, .th-poner:focus-visible, .th-mini:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  @media (prefers-reduced-motion: reduce){ .th-barra > div { transition:none; } }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
};

function BinsDuracion({
  selDur,
  shakeDur,
  ubicDur,
  onMatch,
  dropProps,
}: {
  selDur: string | null;
  shakeDur: Duracion | null;
  ubicDur: Record<string, Duracion>;
  onMatch: (itemId: string, bin: Duracion) => void;
  dropProps: DropFactory;
}) {
  const bins: Duracion[] = ["larga", "mediana", "corta"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = DURACION_INFO[bin];
        const dentro = ITEMS_DURACION.filter((x) => ubicDur[x.id] === bin);
        return (
          <div
            key={bin}
            className="th-bin"
            data-shake={shakeDur === bin}
            onClick={() => selDur && onMatch(selDur, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={T.text2} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ fontSize: 14, color: T.text3, marginBottom: 12, lineHeight: 1.4 }}>{info.subtitulo}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((x) => (
                  <span key={x.id} style={{ animation: "thPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 2 }} />
                    {x.texto}
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

function LineaOrden({
  selL,
  shakeL,
  lineaPos,
  onMatch,
  dropProps,
}: {
  selL: string | null;
  shakeL: boolean;
  lineaPos: number;
  onMatch: (hitoId: string) => void;
  dropProps: DropFactory;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {HITOS.map((h, i) => {
        const num = (
          <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: `1.5px solid ${T.lineStrong}`, color: T.text2 }}>
            {i + 1}
          </span>
        );
        if (i < lineaPos) {
          // ya colocado
          return (
            <div key={h.id} className="th-step">
              <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, background: OK, color: "#04121f", marginTop: 1 }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{h.anio}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: OK, border: `1px solid ${OK}55`, borderRadius: 6, padding: "2px 8px" }}>
                    {h.etapa}
                  </span>
                </div>
                <div style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.4 }}>{h.texto}</div>
              </div>
            </div>
          );
        }
        if (i === lineaPos) {
          // hueco activo
          return (
            <div
              key={h.id}
              className="th-fslot"
              data-armed={!!selL}
              data-shake={shakeL}
              onClick={() => selL && onMatch(selL)}
              {...dropProps((id) => onMatch(id))}
            >
              {num}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-arrow-down" style={{ fontSize: 14 }} />
                <span style={{ fontWeight: 700 }}>Suelta aquí el siguiente hito</span>
              </div>
            </div>
          );
        }
        // bloqueado
        return (
          <div key={h.id} className="th-locked">
            {num}
            <span style={{ fontSize: 14.5, color: T.text3 }}>
              <i className="fa-solid fa-lock" style={{ marginRight: 8, fontSize: 14 }} />
              Hito {i + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Cuestionario de comprensión (V/F de A4, verbatim)
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
        Cinco afirmaciones sobre el tiempo cronológico, cíclico y subjetivo. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 9 }}>
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
                    <button key={oi} className="th-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="th-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="th-btn" onClick={reintentar}>
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
