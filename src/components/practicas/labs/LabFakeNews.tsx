"use client";

/**
 * Laboratorio — Simulador de verificación: fake news y desinformación
 * Práctica experimental para CD-II-P03-A2 (Cultura Digital II).
 *
 * El alumno INVESTIGA, no ordena frases. «Tu feed» trae seis publicaciones
 * ficticias (foto, cuenta, medio, fecha, compartidos). Con cinco herramientas
 * de verificación (buscar la imagen, revisar el sitio, buscar en otros medios,
 * leer completo, revisar fecha y autor) descubre evidencia; cada consulta
 * cuesta 1 de los 16 «minutos» disponibles, así que hay que elegir. La
 * evidencia va al Cuaderno; después emite un veredicto (verdadera, falsa,
 * engañosa o sátira) y marca qué evidencia lo respalda.
 *
 * Modos: Feed (simulador) · Repaso de señales (clasificar, verbatim A1) ·
 * Escribe el término (glosario A5) · Completa el texto (A6). La teoría
 * (señales y técnicas verbatim de A1) vive en la pestaña «Teoría» y el
 * cuestionario V/F de A2 en «Reto».
 *
 * Todos los medios, personas y dominios son FICTICIOS. Las fotos son
 * imágenes generadas, sin texto ni marcas.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta, Mesa, Dato } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { DETECCION_FAKE_NEWS_HUECOS } from "./deteccion-fake-news-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { DETECCION_FAKE_NEWS_FICHA } from "./deteccion-fake-news-ficha";
import {
  SENALES,
  CATEGORIA_INFO,
  TECNICAS,
  PARES,
  QUIZ,
  DATO_FAKE,
  type Categoria,
} from "./fake-news-data";
import {
  PUBLICACIONES,
  HERRAMIENTAS,
  VEREDICTOS,
  PRESUPUESTO,
  type Herramienta,
  type Publicacion,
  type Veredicto,
} from "./fake-news-feed";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { FondoTermino, VinetaTermino } from "./_vineta";

const NO = "#FF5E5E";
const AVISO = "#FFC75A";
const RETO_KEY = "cen-fake-news-reto";
const RUTA_FOTOS = "/media/labs-fakenews";

type Modo = "feed" | "senales" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "feed", label: "Tu feed", icono: "fa-magnifying-glass" },
  { id: "senales", label: "Repaso de señales", icono: "fa-flag" },
  { id: "glosario", label: "Escribe el término", icono: "fa-keyboard" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

interface Resultado {
  veredicto: Veredicto;
  correcto: boolean;
  /** Evidencia marcada: cuántas eran clave y cuántas no. */
  buenas: number;
  malas: number;
  puntos: number;
}

const clave = (p: string, h: Herramienta) => `${p}:${h}`;
const etiquetaVeredicto = (v: Veredicto) => VEREDICTOS.find((x) => x.id === v)!.etiqueta;

export function LabFakeNews({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("feed");

  // ── sonido ────────────────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
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

  // ── progreso / estrellas ──────────────────────────────────────────────
  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);

  // ── simulador: investigación ──────────────────────────────────────────
  const [actual, setActual] = useState(PUBLICACIONES[0]!.id);
  const [reveladas, setReveladas] = useState<Record<string, boolean>>({});
  const [marcadas, setMarcadas] = useState<Record<string, boolean>>({});
  const [elegido, setElegido] = useState<Record<string, Veredicto | undefined>>({});
  const [resultados, setResultados] = useState<Record<string, Resultado>>({});

  const minutosUsados = Object.keys(reveladas).length;
  const minutosQuedan = Math.max(0, PRESUPUESTO - minutosUsados);
  const post = PUBLICACIONES.find((p) => p.id === actual)!;
  const resPost = resultados[post.id];

  const investigar = (h: Herramienta) => {
    const k = clave(post.id, h);
    if (reveladas[k] || resPost) return;
    if (minutosQuedan <= 0) return;
    setReveladas((r) => ({ ...r, [k]: true }));
    sfxBlip();
  };
  const alternarMarca = (h: Herramienta) => {
    if (resPost) return;
    const k = clave(post.id, h);
    setMarcadas((m) => ({ ...m, [k]: !m[k] }));
  };

  const emitirVeredicto = () => {
    const v = elegido[post.id];
    if (!v || resPost) return;
    let buenas = 0;
    let malas = 0;
    for (const h of HERRAMIENTAS) {
      if (!marcadas[clave(post.id, h.id)]) continue;
      if (post.evidencias[h.id].clave) buenas++;
      else malas++;
    }
    const correcto = v === post.veredicto;
    // 2 puntos por el veredicto; 1 si la evidencia marcada lo respalda y no hay ruido.
    const puntos = (correcto ? 2 : 0) + (buenas > 0 && malas === 0 ? 1 : 0);
    const todos = { ...resultados, [post.id]: { veredicto: v, correcto, buenas, malas, puntos } };
    setResultados(todos);
    if (correcto) sfxPlace();
    else sfxNo();
    const hechosN = Object.keys(todos).length;
    const buenosN = Object.values(todos).filter((r) => r.correcto && r.buenas > 0).length;
    const perfectos = Object.values(todos).filter((r) => r.puntos === 3).length;
    // 1★ por verificar las 6; 2★ con 5 aciertos con evidencia; 3★ con las 6 perfectas.
    if (hechosN >= PUBLICACIONES.length) {
      registraEstrellas(perfectos >= PUBLICACIONES.length ? 3 : buenosN >= 5 ? 2 : 1);
      sfxOk();
    }
  };

  const reiniciarFeed = () => {
    setReveladas({});
    setMarcadas({});
    setElegido({});
    setResultados({});
    setActual(PUBLICACIONES[0]!.id);
    partida.reiniciar();
  };

  const verificadas = Object.keys(resultados).length;
  const buenos = Object.values(resultados).filter((r) => r.correcto && r.buenas > 0).length;
  const puntosTotal = Object.values(resultados).reduce((n, r) => n + r.puntos, 0);
  const puntosMax = PUBLICACIONES.length * 3;
  const feedHecho = verificadas >= PUBLICACIONES.length;
  const bonoMinutos = feedHecho ? minutosQuedan : 0;
  const fotoDesmontada = !!reveladas[clave("p1", "imagen")];
  const estrellasFeed = !feedHecho
    ? 0
    : Object.values(resultados).filter((r) => r.puntos === 3).length >= PUBLICACIONES.length
      ? 3
      : buenos >= 5
        ? 2
        : 1;
  const bestEstrellas = Math.max(estrellasFeed, mejor);

  // ── modo señales (clasifica alerta / fiable) ───────────────────────────
  const [ubicSenal, setUbicSenal] = useState<Record<string, Categoria>>({});
  const [selSenal, setSelSenal] = useState<string | null>(null);
  const [shakeSenal, setShakeSenal] = useState<Categoria | null>(null);
  const senalesLibres = SENALES.filter((s) => !ubicSenal[s.id]).slice().sort((a, b) => a.texto.localeCompare(b.texto, "es"));
  const senalesDone = Object.keys(ubicSenal).length >= SENALES.length;

  const intentarSenal = (senalId: string, bin: Categoria) => {
    if (ubicSenal[senalId]) return;
    const s = SENALES.find((x) => x.id === senalId);
    if (s && s.categoria === bin) {
      setUbicSenal((e) => ({ ...e, [senalId]: bin }));
      setSelSenal(null);
      sfxPlace();
      if (Object.keys(ubicSenal).length + 1 >= SENALES.length) sfxOk();
    } else {
      setShakeSenal(bin);
      sfxNo();
      window.setTimeout(() => setShakeSenal(null), 420);
    }
  };
  const resetSenales = () => {
    setUbicSenal({});
    setSelSenal(null);
  };

  // ── modo glosario / texto ──────────────────────────────────────────────
  const [glosarioDone, setGlosarioDone] = useState(false);
  const [glosIntento, setGlosIntento] = useState(0);
  const resetGlosario = () => {
    setGlosarioDone(false);
    setGlosIntento((n) => n + 1);
  };
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  const objetivos = [
    { txt: "Desmonta la foto reciclada con búsqueda inversa", done: fotoDesmontada },
    { txt: "Verifica las 6 publicaciones del feed", done: feedHecho },
    { txt: "Acierta 5 de 6 con evidencia que lo respalde", done: buenos >= 5 },
    { txt: "Escribe los términos del glosario sin ayuda", done: glosarioDone },
    { txt: "Resuelve el reto de comprensión", done: quizAprobado },
  ];

  const resetActual =
    modo === "feed" ? reiniciarFeed : modo === "texto" ? resetTexto : modo === "senales" ? resetSenales : resetGlosario;

  const lectura =
    modo === "feed" ? (
      <>Minutos: {minutosQuedan}/{PRESUPUESTO} · Verificadas: {verificadas}/{PUBLICACIONES.length}</>
    ) : modo === "senales" ? (
      <>Indicios clasificados: {Object.keys(ubicSenal).length}/{SENALES.length}</>
    ) : (
      <>Repaso de los términos de la verificación</>
    );

  const instruccion = (txt: string, n?: string, ok?: boolean) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 15, fontWeight: 800, color: T.text }}>
      <span>{txt}</span>
      {n && <span style={{ fontSize: 15, fontWeight: 900, color: ok ? OK : T.text3 }}>{n}</span>}
    </div>
  );

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

  const cuadernoPost = (p: Publicacion) => HERRAMIENTAS.filter((h) => reveladas[clave(p.id, h.id)]);

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

          {modo === "feed" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
              <div className="fn-presu" data-bajo={minutosQuedan <= 3}>
                <span><i className="fa-solid fa-hourglass-half" /> Minutos de investigación</span>
                <strong>{minutosQuedan} / {PRESUPUESTO}</strong>
                <div className="fn-barra"><div style={{ width: `${(minutosQuedan / PRESUPUESTO) * 100}%` }} /></div>
              </div>

              <div className="fn-feed" role="tablist" aria-label="Tu feed">
                {PUBLICACIONES.map((p, i) => {
                  const r = resultados[p.id];
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="tab"
                      aria-selected={p.id === actual}
                      className="fn-mini"
                      data-sel={p.id === actual}
                      onClick={() => setActual(p.id)}
                    >
                      <img src={`${RUTA_FOTOS}/${p.foto}.webp`} alt="" loading="lazy" />
                      <span className="fn-mini-n">{i + 1}</span>
                      {r && (
                        <span className="fn-mini-ok" style={{ background: r.correcto ? OK : NO }}>
                          <i className={`fa-solid ${r.correcto ? "fa-check" : "fa-xmark"}`} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <TarjetaPost post={post} />

              <div>
                {instruccion("Investiga antes de opinar", `${cuadernoPost(post).length}/${HERRAMIENTAS.length} pistas`)}
                <div className="fn-tools">
                  {HERRAMIENTAS.map((h) => {
                    const hecha = !!reveladas[clave(post.id, h.id)];
                    const sinMinutos = !hecha && minutosQuedan <= 0;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        className="fn-tool"
                        data-hecha={hecha}
                        disabled={!!resPost || sinMinutos}
                        onClick={() => investigar(h.id)}
                      >
                        <i className={`fa-solid ${hecha ? "fa-check" : h.icono}`} />
                        <span>{h.etiqueta}</span>
                        <em>{hecha ? "revisado" : "1 min"}</em>
                      </button>
                    );
                  })}
                </div>
                {minutosQuedan <= 0 && !resPost && (
                  <div className="fn-nota" style={{ color: AVISO }}>
                    Se acabaron los minutos: decide con la evidencia que reuniste.
                  </div>
                )}
              </div>

              {cuadernoPost(post).length > 0 && (
                <div className="fn-evid">
                  <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>
                    <i className="fa-solid fa-book-open" style={{ color: accent, marginRight: 8 }} />
                    Evidencia de esta publicación
                  </div>
                  {!resPost && <div className="fn-nota">Marca la evidencia que respalda tu veredicto.</div>}
                  {cuadernoPost(post).map((h) => {
                    const ev = post.evidencias[h.id];
                    const k = clave(post.id, h.id);
                    const on = !!marcadas[k];
                    const estado = resPost ? (ev.clave ? "clave" : on ? "ruido" : "") : "";
                    return (
                      <label key={h.id} className="fn-ev" data-on={on} data-estado={estado}>
                        <input type="checkbox" checked={on} disabled={!!resPost} onChange={() => alternarMarca(h.id)} />
                        <span className="fn-ev-cuerpo">
                          <strong><i className={`fa-solid ${h.icono}`} /> {h.etiqueta}</strong>
                          <span>{ev.texto}</span>
                          {resPost && ev.clave && <em style={{ color: OK }}>Evidencia clave</em>}
                          {resPost && !ev.clave && on && <em style={{ color: NO }}>No prueba el veredicto</em>}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="fn-veredicto">
                {instruccion("Tu veredicto", resPost ? "emitido" : undefined, !!resPost)}
                <div className="fn-vgrid">
                  {VEREDICTOS.map((v) => {
                    const sel = (resPost?.veredicto ?? elegido[post.id]) === v.id;
                    const esReal = !!resPost && v.id === post.veredicto;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        className="fn-vbtn"
                        data-sel={sel}
                        data-real={esReal}
                        disabled={!!resPost}
                        onClick={() => setElegido((e) => ({ ...e, [post.id]: v.id }))}
                      >
                        <i className={`fa-solid ${v.icono}`} />
                        <span>{v.etiqueta}</span>
                      </button>
                    );
                  })}
                </div>
                {!resPost && (
                  <button
                    type="button"
                    className="fn-btn"
                    style={{ background: accent, color: "#04121f", border: "none", marginTop: 10, opacity: elegido[post.id] ? 1 : 0.5 }}
                    disabled={!elegido[post.id]}
                    onClick={emitirVeredicto}
                  >
                    <i className="fa-solid fa-gavel" /> Emitir veredicto
                  </button>
                )}
                {resPost && (
                  <div className="fn-retro" data-ok={resPost.correcto}>
                    <strong>
                      <i className={`fa-solid ${resPost.correcto ? "fa-circle-check" : "fa-circle-xmark"}`} />{" "}
                      {resPost.correcto ? "Veredicto correcto" : `Era: ${etiquetaVeredicto(post.veredicto)}`} · {resPost.puntos}/3 puntos
                    </strong>
                    <span>{post.decisiva}</span>
                    {resPost.correcto && resPost.buenas === 0 && <span style={{ color: AVISO }}>Acertaste, pero sin marcar evidencia que lo pruebe: un veredicto sin pruebas es una corazonada.</span>}
                    {resPost.malas > 0 && <span style={{ color: AVISO }}>Marcaste {resPost.malas} evidencia{resPost.malas > 1 ? "s" : ""} que no prueba{resPost.malas > 1 ? "n" : ""} el veredicto.</span>}
                    {!feedHecho && (
                      <button
                        type="button"
                        className="fn-btn"
                        onClick={() => {
                          const sig = PUBLICACIONES.find((p) => !resultados[p.id]);
                          if (sig) setActual(sig.id);
                        }}
                      >
                        <i className="fa-solid fa-arrow-right" /> Siguiente publicación
                      </button>
                    )}
                  </div>
                )}
              </div>

              {feedHecho && (
                <div className="fn-retro" data-ok={buenos >= 5}>
                  <strong>
                    <i className="fa-solid fa-flag-checkered" /> Feed verificado: {puntosTotal}/{puntosMax} puntos
                    {bonoMinutos > 0 ? ` + ${bonoMinutos} por minutos que sobraron` : ""}
                  </strong>
                  <span>{buenos >= 5 ? "Verificas con pruebas antes de compartir." : "Repasa qué herramienta daba la evidencia decisiva en cada caso y vuelve a intentarlo."}</span>
                </div>
              )}
            </div>
          )}

          {modo === "texto" && (
            <CompletaTexto
              key={textoIntento}
              data={DETECCION_FAKE_NEWS_HUECOS}
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

          {modo === "senales" && (
            <Mesa>
              <div>
              {instruccion("Arrastra cada indicio a su categoría", `${Object.keys(ubicSenal).length}/${SENALES.length}`, senalesDone)}
              {senalesLibres.length === 0 ? (
                <div style={{ fontSize: 15, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                  <i className="fa-solid fa-circle-check" /> ¡Clasificaste los {SENALES.length} indicios!
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {senalesLibres.map((s) => (
                    <button key={s.id} className="fn-chip" data-sel={selSenal === s.id} onClick={() => setSelSenal((v) => (v === s.id ? null : s.id))} {...dragProps(s.id)}>
                      {s.texto}
                    </button>
                  ))}
                </div>
              )}
              </div>
              <BinsSenales selSenal={selSenal} shakeSenal={shakeSenal} ubicSenal={ubicSenal} onMatch={intentarSenal} dropProps={dropProps} />
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
                  <Dato label="Minutos" value={`${minutosQuedan}/${PRESUPUESTO}`} col={minutosQuedan <= 3 ? AVISO : undefined} />
                  <Dato label="Puntos" value={`${puntosTotal}/${puntosMax}`} col={feedHecho ? OK : undefined} />
                  <Dato label="Con pruebas" value={`${buenos}/${PUBLICACIONES.length}`} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? "#FFC75A" : "rgba(255,255,255,0.16)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: T.text2, lineHeight: 1.45, flex: "1 1 160px" }}>
                    1★ verificar las 6 · 2★ acertar 5 con evidencia · 3★ las 6 con evidencia y sin ruido.
                  </span>
                </div>
              </Bloque>
              {PUBLICACIONES.map((p, i) => {
                const hechas = cuadernoPost(p);
                const r = resultados[p.id];
                return (
                  <Bloque key={p.id} titulo={`${i + 1}. ${p.medio}${r ? ` · ${etiquetaVeredicto(r.veredicto)}` : ""}`} icono={r ? (r.correcto ? "fa-circle-check" : "fa-circle-xmark") : "fa-folder-open"}>
                    {hechas.length === 0 ? (
                      <p style={{ margin: 0, color: T.text3 }}>Sin evidencia todavía. Usa las herramientas en «Tu feed».</p>
                    ) : (
                      hechas.map((h) => (
                        <p key={h.id} style={{ margin: 0, color: T.text2 }}>
                          <strong style={{ color: T.text }}>{h.etiqueta}.</strong> {p.evidencias[h.id].texto}
                        </p>
                      ))
                    )}
                  </Bloque>
                );
              })}
              <Bloque titulo="Repasos" icono="fa-list-check">
                <p style={{ margin: 0, color: T.text2 }}>
                  Señales: {senalesDone ? "clasificadas" : "pendiente"} · Glosario: {glosarioDone ? "completo" : "pendiente"} · Texto: {textoDone ? "completo" : "pendiente"}
                </p>
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
              <Bloque titulo="Cómo decidir un veredicto" icono="fa-gavel">
                {VEREDICTOS.map((v) => (
                  <p key={v.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{v.etiqueta}.</strong> {v.def}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Las dos categorías" icono="fa-flag">
                {(Object.keys(CATEGORIA_INFO) as Categoria[]).map((c) => (
                  <p key={c} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{CATEGORIA_INFO[c].titulo}.</strong> {CATEGORIA_INFO[c].subtitulo}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Las técnicas de verificación" icono="fa-magnifying-glass-chart">
                {TECNICAS.map((t) => (
                  <p key={t.id} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: T.text }}>{t.tecnica}.</strong> {t.funcion} <em>{t.ejemplo}</em>
                  </p>
                ))}
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{DATO_FAKE}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={DETECCION_FAKE_NEWS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Tarjeta de publicación (estilo genérico de red social, sin marcas reales)
 * ═══════════════════════════════════════════════════════════════════════════ */
function TarjetaPost({ post }: { post: Publicacion }) {
  const cadena = post.formato === "cadena";
  return (
    <article className="fn-post" data-formato={post.formato}>
      <header className="fn-post-cab">
        <span className="fn-avatar" aria-hidden>
          <i className={`fa-solid ${cadena ? "fa-share" : "fa-user"}`} />
        </span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <strong className="fn-post-autor">{post.autor}</strong>
          <span className="fn-post-meta">{post.medio} · {post.dominio}</span>
        </span>
        <span className="fn-post-fecha">{post.fecha}</span>
      </header>
      {cadena && <div className="fn-reenv"><i className="fa-solid fa-share" /> Reenviado</div>}
      <img className="fn-post-foto" src={`${RUTA_FOTOS}/${post.foto}.webp`} alt={post.alt} />
      <div className="fn-post-cuerpo">
        <h3>{post.titular}</h3>
        <p>{post.cuerpo}</p>
      </div>
      <footer className="fn-post-pie">
        <span><i className="fa-solid fa-share-nodes" /> {post.compartidos}</span>
        <span><i className="fa-regular fa-thumbs-up" /> Me gusta</span>
      </footer>
    </article>
  );
}

const css = (accent: string, rgba: string) => `
  @keyframes fnShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes fnPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .fn-chip { cursor:grab; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14.5px; font-weight:700; user-select:none; max-width:100%; text-align:left; line-height:1.4;
    transition:transform .14s, box-shadow .14s, border-color .14s, background .14s; }
  .fn-chip:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
  .fn-chip[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px) scale(1.02); }
  .fn-chip:active { cursor:grabbing; }
  .fn-row { border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; padding:14px 16px; transition:all .16s; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .fn-row[data-shake="true"] { animation:fnShake .4s; border-color:${NO}; }
  .fn-row[data-done="true"] { border-color:${OK}66; background:${OK}0f; }
  .fn-slot { flex-shrink:0; min-width:200px; min-height:42px; border-radius:11px; border:1.5px dashed ${T.lineStrong}; background:${T.inset};
    display:inline-flex; align-items:center; justify-content:center; color:${T.text3}; font-size:14px; transition:all .16s; cursor:pointer; padding:4px 10px; }
  .fn-slot[data-armed="true"] { border-color:${accent}; background:rgba(${rgba},0.1); }
  .fn-bin { border-radius:15px; border:1.5px solid ${T.line}; background:${T.glass}; padding:16px; transition:all .16s; min-height:220px; }
  .fn-bin[data-shake="true"] { animation:fnShake .4s; border-color:${NO}; }
  .fn-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px;
    border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14.5px; font-weight:600; text-align:left; width:100%; transition:all .14s; }
  .fn-q:hover:not(:disabled){ border-color:${T.lineStrong}; color:#fff; }
  .fn-q:disabled{ cursor:default; }
  .fn-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px;
    border-radius:11px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14.5px; font-weight:800; transition:all .14s; }
  .fn-btn:hover { border-color:${T.lineStrong}; }

  /* Identidad del tablero */
  .fn-bin, .fn-row { --tono:188; position:relative;
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.11) 0%, transparent 62%); }
  .fn-bin:nth-of-type(6n+1), .fn-row:nth-of-type(6n+1) { --tono:188; }
  .fn-bin:nth-of-type(6n+2), .fn-row:nth-of-type(6n+2) { --tono:262; }
  .fn-bin:nth-of-type(6n+3), .fn-row:nth-of-type(6n+3) { --tono:44; }
  .fn-bin:nth-of-type(6n+4), .fn-row:nth-of-type(6n+4) { --tono:152; }
  .fn-bin:nth-of-type(6n+5), .fn-row:nth-of-type(6n+5) { --tono:330; }
  .fn-bin:nth-of-type(6n+6), .fn-row:nth-of-type(6n+6) { --tono:18; }
  .fn-bin::before, .fn-row::before { content:""; position:absolute; top:0; left:10px; right:10px; height:3px; border-radius:0 0 3px 3px;
    background:linear-gradient(90deg, hsl(var(--tono) 78% 62%) 0%, hsl(var(--tono) 78% 62% / 0.15) 100%); }
  .fn-bin[data-done="true"], .fn-row[data-done="true"] {
    background-image:radial-gradient(120% 90% at 0% 0%, hsl(var(--tono) 72% 58% / 0.2) 0%, transparent 68%); }
  @media (prefers-reduced-motion: reduce){ .fn-row[data-shake="true"], .fn-bin[data-shake="true"] { animation:none; } .fn-chip, .fn-chip:hover, .fn-chip[data-sel="true"] { transform:none; transition:none; } }

  /* Simulador de verificación */
  .fn-presu { display:grid; grid-template-columns:1fr auto; gap:4px 12px; align-items:center; padding:11px 14px; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; font-size:14px; color:${T.text2}; font-weight:700; }
  .fn-presu strong { color:#fff; font-size:15px; font-variant-numeric:tabular-nums; }
  .fn-presu[data-bajo="true"] strong { color:${AVISO}; }
  .fn-barra { grid-column:1 / -1; height:7px; border-radius:6px; background:${T.inset}; overflow:hidden; }
  .fn-barra > div { height:100%; border-radius:6px; background:${accent}; transition:width .3s; }
  .fn-presu[data-bajo="true"] .fn-barra > div { background:${AVISO}; }
  .fn-feed { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:8px; }
  @media (min-width:640px){ .fn-feed { grid-template-columns:repeat(6, minmax(0, 1fr)); } }
  .fn-mini { position:relative; padding:0; border-radius:12px; overflow:hidden; border:2px solid ${T.line}; background:${T.inset}; cursor:pointer; aspect-ratio:16/10; transition:border-color .14s, transform .14s; }
  .fn-mini img { width:100%; height:100%; object-fit:cover; display:block; opacity:.75; }
  .fn-mini[data-sel="true"] { border-color:${accent}; transform:translateY(-2px); box-shadow:0 0 16px -5px ${accent}; }
  .fn-mini[data-sel="true"] img { opacity:1; }
  .fn-mini-n { position:absolute; left:6px; top:6px; min-width:24px; height:24px; border-radius:12px; background:rgba(2,12,28,.82); color:#fff; font-size:14px; font-weight:900; display:flex; align-items:center; justify-content:center; padding:0 6px; }
  .fn-mini-ok { position:absolute; right:6px; bottom:6px; width:24px; height:24px; border-radius:12px; color:#04121f; font-size:14px; display:flex; align-items:center; justify-content:center; }
  .fn-post { border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; overflow:hidden; width:100%; min-width:0; }
  .fn-post[data-formato="cadena"] { border-left:5px solid #25D366; }
  .fn-post[data-formato="flash"] { border-top:4px solid #FFC75A; }
  .fn-post-cab { display:flex; align-items:center; gap:10px; padding:12px 14px; }
  .fn-avatar { flex-shrink:0; width:38px; height:38px; border-radius:50%; background:${T.glassSoft}; border:1.5px solid ${T.lineStrong}; display:flex; align-items:center; justify-content:center; color:${T.text2}; font-size:15px; }
  .fn-post-autor { display:block; font-size:15px; color:#fff; overflow-wrap:anywhere; }
  .fn-post-meta { display:block; font-size:14px; color:${T.text3}; overflow-wrap:anywhere; }
  .fn-post-fecha { flex-shrink:0; font-size:14px; color:${T.text3}; }
  .fn-reenv { padding:0 14px 8px; font-size:14px; color:${T.text3}; font-style:italic; }
  .fn-post-foto { display:block; width:100%; height:auto; aspect-ratio:16/9; max-height:min(40vh, 380px); object-fit:contain; background:#000; }
  .fn-post-cuerpo { padding:12px 14px 4px; }
  .fn-post-cuerpo h3 { margin:0 0 6px; font-size:17px; line-height:1.3; color:#fff; font-weight:800; overflow-wrap:anywhere; }
  .fn-post-cuerpo p { margin:0; font-size:15px; line-height:1.5; color:${T.text2}; overflow-wrap:anywhere; }
  .fn-post-pie { display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; padding:10px 14px 12px; font-size:14px; color:${T.text3}; }
  .fn-tools { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:10px; margin-top:10px; }
  @media (min-width:640px){ .fn-tools { grid-template-columns:repeat(5, minmax(0, 1fr)); } }
  .fn-tool { cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; min-height:78px; padding:10px 8px; border-radius:14px;
    border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:14px; font-weight:800; text-align:center; line-height:1.25; transition:all .14s; }
  .fn-tool i { font-size:19px; color:${accent}; }
  .fn-tool em { font-style:normal; font-size:14px; color:${T.text3}; font-weight:700; }
  .fn-tool:hover:not(:disabled) { border-color:${accent}; transform:translateY(-2px); }
  .fn-tool[data-hecha="true"] { border-color:${OK}66; background:${OK}12; }
  .fn-tool[data-hecha="true"] i { color:${OK}; }
  .fn-tool:disabled { cursor:default; opacity:.55; }
  .fn-nota { margin-top:8px; font-size:14px; color:${T.text3}; line-height:1.45; }
  .fn-evid { display:flex; flex-direction:column; gap:10px; padding:14px; border-radius:14px; border:1.5px solid ${T.line}; background:${T.glass}; }
  .fn-ev { display:flex; gap:12px; align-items:flex-start; padding:12px; border-radius:12px; border:1.5px solid ${T.line}; background:${T.inset}; cursor:pointer; }
  .fn-ev input { width:22px; height:22px; flex-shrink:0; margin-top:2px; accent-color:${accent}; }
  .fn-ev[data-on="true"] { border-color:${accent}; }
  .fn-ev[data-estado="clave"] { border-color:${OK}; background:${OK}12; }
  .fn-ev[data-estado="ruido"] { border-color:${NO}; background:${NO}10; }
  .fn-ev-cuerpo { display:flex; flex-direction:column; gap:4px; min-width:0; font-size:14.5px; line-height:1.5; color:${T.text2}; }
  .fn-ev-cuerpo strong { color:#fff; font-size:14.5px; }
  .fn-ev-cuerpo em { font-style:normal; font-weight:800; font-size:14px; }
  .fn-vgrid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:10px; margin-top:10px; }
  @media (min-width:640px){ .fn-vgrid { grid-template-columns:repeat(4, minmax(0, 1fr)); } }
  .fn-vbtn { cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; min-height:56px; padding:10px; border-radius:13px; border:1.5px solid ${T.line}; background:${T.glassSoft};
    color:#fff; font-size:14.5px; font-weight:800; text-align:center; line-height:1.25; transition:all .14s; }
  .fn-vbtn[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.2); box-shadow:0 0 16px -6px ${accent}; }
  .fn-vbtn[data-real="true"] { border-color:${OK}; background:${OK}18; }
  .fn-vbtn:disabled { cursor:default; }
  .fn-retro { display:flex; flex-direction:column; gap:8px; align-items:flex-start; margin-top:12px; padding:13px 15px; border-radius:13px; font-size:14.5px; line-height:1.5; color:${T.text2};
    border:1.5px solid ${NO}66; background:${NO}10; }
  .fn-retro[data-ok="true"] { border-color:${OK}66; background:${OK}10; }
  .fn-retro strong { color:#fff; font-size:15px; }
  .fn-tool:focus-visible, .fn-vbtn:focus-visible, .fn-mini:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  @media (prefers-reduced-motion: reduce){ .fn-tool:hover:not(:disabled), .fn-mini[data-sel="true"] { transform:none; } .fn-barra > div { transition:none; } }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Paneles de cada modo (componentes hijos: reciben los manejadores como props,
 * así el linter no rastrea el acceso al ref de audio hasta el render del map).
 * ═══════════════════════════════════════════════════════════════════════════ */
type DropFactory = (onDrop: (id: string) => void) => {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

function BinsSenales({
  selSenal,
  shakeSenal,
  ubicSenal,
  onMatch,
  dropProps,
}: {
  selSenal: string | null;
  shakeSenal: Categoria | null;
  ubicSenal: Record<string, Categoria>;
  onMatch: (senalId: string, bin: Categoria) => void;
  dropProps: DropFactory;
}) {
  const bins: Categoria[] = ["alerta", "fiable"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
      {bins.map((bin) => {
        const info = CATEGORIA_INFO[bin];
        const dentro = SENALES.filter((s) => ubicSenal[s.id] === bin);
        const tint = bin === "alerta" ? NO : OK;
        return (
          <div
            key={bin}
            className="fn-bin"
            data-shake={shakeSenal === bin}
            onClick={() => selSenal && onMatch(selSenal, bin)}
            style={{ position: "relative", isolation: "isolate" }}
            {...dropProps((id) => onMatch(id, bin))}
          >
            {/* La ilustración del concepto llenando la caja vacía. */}
            <FondoTermino termino={info.titulo} />
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <VinetaTermino termino={info.titulo} color={tint} icono={info.icono} tam={29} radio={8} />
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{info.titulo}</span>
            </div>
            <div style={{ height: 8 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dentro.length === 0 ? (
                <div style={{ fontSize: 14, color: T.text3, opacity: 0.7, padding: "8px 0" }}>Arrastra aquí…</div>
              ) : (
                dentro.map((s) => (
                  <span key={s.id} style={{ animation: "fnPop .25s ease", display: "inline-flex", alignItems: "flex-start", gap: 7, padding: "8px 12px", borderRadius: 11, background: `${OK}1a`, border: `1px solid ${OK}55`, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 14, color: OK, marginTop: 2 }} />
                    {s.texto}
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
        Seis afirmaciones sobre las fake news y la verificación de información. Decide si son verdaderas o falsas y pulsa «Comprobar».
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 9 }}>
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
                    <button key={oi} className="fn-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
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
          <button className="fn-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="fn-btn" onClick={reintentar}>
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
