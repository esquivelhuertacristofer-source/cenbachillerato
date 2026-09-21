"use client";

/**
 * Laboratorio 3D — "Estudio de edición de contenido digital".
 * Progresión 3 de Cultura Digital III (actividades CD-III-P04-A1…A8).
 * Propósito: «Utiliza dispositivos tecnológicos, servicios de difusión y
 * herramientas de software para crear y editar contenido digital, conforme a
 * sus recursos y contextos.»
 *
 * Hilo (inspirado en la simulación A2): un grupo del bachillerato difunde la
 * limpieza del parque de su colonia con los recursos que tiene.
 *
 * Tres modos:
 *  (1) La imagen por dentro — resolución, profundidad de color y compresión
 *      sin pérdida (RLE) o con pérdida (DCT 8×8 como JPEG), calculadas de
 *      verdad sobre la imagen que se ve en 3D; inspector de bits del píxel.
 *  (2) Capas de edición — orden, visibilidad y opacidad de cuatro capas;
 *      contraste WCAG del texto calculado píxel a píxel; exportar el cartel.
 *  (3) Video y audio — resolución, fps, tasa de bits, duración, muestreo y
 *      bits para tres destinos reales de la comunidad; peso exacto en bytes.
 *
 * Evaluables: estrellas «¿Con pérdida o sin pérdida?», reto de cálculo del
 * laboratorio, cuestionario del video A8 y completa el texto A6.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { RetoNumericoCard } from "./_reto-numerico";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { ESTUDIO_EDICION_FICHA } from "./estudio-edicion-ficha";
import type { VistaEdicion } from "./EstudioEdicionScene";
import {
  type Modo,
  type ImagenId,
  type Bits,
  type Compresion,
  type CapaId,
  type ColorTextoId,
  type DestinoVideoId,
  type DestinoAudioId,
  type Fps,
  type FormatoAudio,
  type CalculoVideo,
  type CalculoAudio,
  MODOS,
  MODOS_DEF,
  IMAGENES,
  RESOLUCIONES,
  PROFUNDIDADES,
  COMPRESIONES,
  FOTOS_REALES,
  procesarImagen,
  cuantizarPixel,
  bytesCrudos,
  bytesTxt,
  CAPA_DEF,
  ORDEN_INICIAL,
  COLORES_TEXTO,
  CARTEL_REAL,
  CONTRASTE_AA,
  fotoCartel,
  evaluarCapas,
  luminancia,
  RES_VIDEO,
  FPS,
  TASAS_VIDEO,
  AUDIO_VIDEO_KBPS,
  CALIDAD_DEF,
  DESTINOS_VIDEO,
  calcularVideo,
  FRECUENCIAS,
  BITS_AUDIO,
  TASAS_AUDIO,
  DESTINOS_AUDIO,
  calcularAudio,
  CASOS_FORMATO,
  rondaCasos,
  estrellasPorErrores,
  mulberry32,
  TITULO_A1,
  LECTURA_A1,
  RECUADRO_A1,
  PREGUNTAS,
  SIMULACION_A2,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  PREGUNTA_ABIERTA_A8,
  REFLEXION_A7,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A8,
  HUECOS_A6,
  RETO_VIDEO,
  num,
} from "./estudio-edicion-data";

const EstudioScene = dynamic(() => import("./EstudioEdicionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-photo-film fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Encendiendo el estudio de edición en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-estudio-edicion-reto";
const WARN = "#FF8A3C";
const RONDA_INICIAL = rondaCasos(mulberry32(23));
const Q_BLOQUES = 25;

type Sub = "video" | "audio";

/* ── Tarjeta de estrellas: ¿con pérdida o sin pérdida? ────────────────── */
function FormatoCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = CASOS_FORMATO[ronda[pos] ?? 0]!;

  const responder = (sinPerdida: boolean) => {
    if (resuelto !== null) return;
    const ok = sinPerdida === actual.sinPerdida;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`${actual.sinPerdida ? "Va sin pérdida" : "Va con pérdida"}: ${actual.porque}`);
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
    setRonda(rondaCasos(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setResuelto(null);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿Con pérdida o sin pérdida?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
            Caso {pos + 1} de {ronda.length} · ¿cómo conviene comprimir este archivo?
          </div>
          <div style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>«{actual.texto}»</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="ed-opt ed-formato" data-on="true" onClick={() => responder(true)} style={{ ["--edc" as string]: OK }}>
              <i className="fa-solid fa-file-zipper" style={{ marginRight: 8 }} />
              Sin pérdida (PNG, WAV, FLAC, ZIP)
            </button>
            <button className="ed-opt ed-formato" data-on="true" onClick={() => responder(false)} style={{ ["--edc" as string]: WARN }}>
              <i className="fa-solid fa-scissors" style={{ marginRight: 8 }} />
              Con pérdida (JPEG, MP3, AAC, MP4)
            </button>
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

const rgbTxt = (c: number[]) => `(${c.map((x) => Math.round(x)).join(", ")})`;

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabEstudioEdicion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("imagen");

  // ── Imagen
  const [imgId, setImgId] = useState<ImagenId>("foto");
  const [resIdx, setResIdx] = useState(0);
  const [bits, setBits] = useState<Bits>(24);
  const [comp, setComp] = useState<Compresion>("ninguna");
  const [calidad, setCalidad] = useState(50);
  const [selU, setSelU] = useState(0.68);
  const [selV, setSelV] = useState(0.44);
  const [vio1bit, setVio1bit] = useState(false);
  const [vioBaja, setVioBaja] = useState(false);
  const [rleHecho, setRleHecho] = useState<Set<ImagenId>>(() => new Set());
  const [vioBloques, setVioBloques] = useState(false);

  // ── Capas
  const [orden, setOrden] = useState<CapaId[]>(ORDEN_INICIAL);
  const [visible, setVisible] = useState<Record<CapaId, boolean>>({ foto: true, ajuste: true, banda: true, texto: true });
  const [valor, setValor] = useState<Record<CapaId, number>>({ foto: 1, ajuste: 0.15, banda: 0.2, texto: 1 });
  const [colorTexto, setColorTexto] = useState<ColorTextoId>("blanco");
  const [ordenLogrado, setOrdenLogrado] = useState(false);
  const [exportCartel, setExportCartel] = useState<{ ok: boolean; motivos: string[] } | null>(null);
  const [cartelOk, setCartelOk] = useState(false);

  // ── Video y audio
  const [sub, setSub] = useState<Sub>("video");
  const [destV, setDestV] = useState<DestinoVideoId>("celular");
  const [resV, setResV] = useState(3);
  const [fps, setFps] = useState<Fps>(30);
  const [tasaIdx, setTasaIdx] = useState(TASAS_VIDEO.indexOf(8));
  const [durV, setDurV] = useState(60);
  const [expV, setExpV] = useState<{ destino: DestinoVideoId; c: CalculoVideo } | null>(null);
  const [videoOk, setVideoOk] = useState<Set<DestinoVideoId>>(() => new Set());
  const [destA, setDestA] = useState<DestinoAudioId>("podcast");
  const [formato, setFormato] = useState<FormatoAudio>("pcm");
  const [frec, setFrec] = useState(44100);
  const [bitsA, setBitsA] = useState(16);
  const [canales, setCanales] = useState(2);
  const [kbps, setKbps] = useState(128);
  const [expA, setExpA] = useState<{ destino: DestinoAudioId; c: CalculoAudio } | null>(null);
  const [audioOk, setAudioOk] = useState<Set<DestinoAudioId>>(() => new Set());

  // ── Evaluables
  const [clasifico, setClasifico] = useState(false);
  const [retoOk, setRetoOk] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setClasifico(true);
      guardaEstrellas(est);
    },
    [guardaEstrellas],
  );

  const toggleSonido = useCallback(async () => {
    if (!audioRef.current) audioRef.current = new LabSfx();
    const sfxObj = audioRef.current;
    if (sonido) {
      sfxObj.mute();
      setSonido(false);
    } else {
      await sfxObj.enable();
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
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

  /* ── Imagen ────────────────────────────────────────────────────────── */
  const proc = useMemo(() => procesarImagen(imgId, resIdx, bits, comp, calidad), [imgId, resIdx, bits, comp, calidad]);
  const selX = Math.min(proc.w - 1, Math.floor(selU * proc.w));
  const selY = Math.min(proc.h - 1, Math.floor(selV * proc.h));
  const iSel = (selY * proc.w + selX) * 3;
  const origSel = [proc.original[iSel]!, proc.original[iSel + 1]!, proc.original[iSel + 2]!];
  const verSel = [proc.px[iSel]!, proc.px[iSel + 1]!, proc.px[iSel + 2]!];
  const codigos = comp === "conPerdida" ? verSel : cuantizarPixel(origSel[0]!, origSel[1]!, origSel[2]!, proc.bitsEfectivos).codigos;
  const reparto = PROFUNDIDADES.find((p) => p.bits === proc.bitsEfectivos)!.reparto;

  const aplicarImagen = (c: { img?: ImagenId; res?: number; bits?: Bits; comp?: Compresion; calidad?: number }) => {
    const nImg = c.img ?? imgId;
    const nRes = c.res ?? resIdx;
    const nBits = c.bits ?? bits;
    const nComp = c.comp ?? comp;
    const nCal = c.calidad ?? calidad;
    if (c.img !== undefined) setImgId(nImg);
    if (c.res !== undefined) setResIdx(nRes);
    if (c.bits !== undefined) setBits(nBits);
    if (c.comp !== undefined) setComp(nComp);
    if (c.calidad !== undefined) setCalidad(nCal);
    if (nComp !== "conPerdida" && nBits === 1) setVio1bit(true);
    if (nRes === RESOLUCIONES.length - 1) setVioBaja(true);
    if (nComp === "sinPerdida") setRleHecho((s) => (s.has(nImg) ? s : new Set(s).add(nImg)));
    if (nComp === "conPerdida" && nImg === "foto" && nRes === 0 && nCal <= Q_BLOQUES) setVioBloques(true);
  };
  const moverPixel = (dx: number, dy: number) => {
    const nx = Math.max(0, Math.min(proc.w - 1, selX + dx));
    const ny = Math.max(0, Math.min(proc.h - 1, selY + dy));
    setSelU((nx + 0.5) / proc.w);
    setSelV((ny + 0.5) / proc.h);
    blip();
  };
  const onPixel = useCallback((x: number, y: number) => {
    setSelU((x + 0.5) / proc.w);
    setSelV((y + 0.5) / proc.h);
  }, [proc.w, proc.h]);

  /* ── Capas ─────────────────────────────────────────────────────────── */
  const foto = useMemo(() => fotoCartel(), []);
  const evalC = useMemo(() => evaluarCapas({ orden, visible, valor, colorTexto }, foto), [orden, visible, valor, colorTexto, foto]);
  const mover = (id: CapaId, d: number) => {
    const i = orden.indexOf(id);
    const j = i + d;
    if (j < 0 || j >= orden.length) return;
    const nuevo = [...orden];
    [nuevo[i], nuevo[j]] = [nuevo[j]!, nuevo[i]!];
    setOrden(nuevo);
    setExportCartel(null);
    blip();
    if (nuevo[0] === "foto" && nuevo[3] === "texto") {
      if (!ordenLogrado) sfx(true);
      setOrdenLogrado(true);
    }
  };
  const alternar = (id: CapaId) => {
    setVisible((v) => ({ ...v, [id]: !v[id] }));
    setExportCartel(null);
    blip();
  };
  const cambiarValor = (id: CapaId, v: number) => {
    setValor((x) => ({ ...x, [id]: v }));
    setExportCartel(null);
  };
  const exportarCartel = () => {
    const motivos: string[] = [];
    if (!evalC.ordenCorrecto) motivos.push("El orden no es el correcto: la foto va hasta abajo y el texto hasta arriba.");
    if (!visible.foto || valor.foto < 0.9) motivos.push("El cartel necesita la foto visible y casi opaca (al menos 90 %).");
    if (!visible.texto || valor.texto < 0.9) motivos.push("El texto debe estar visible y casi opaco (al menos 90 %).");
    if (evalC.contraste < CONTRASTE_AA) motivos.push(`El contraste mínimo es ${num(evalC.contraste, 2)}:1 y hace falta al menos ${CONTRASTE_AA}:1: sube la banda o el ajuste, o cambia el color del texto.`);
    const ok = motivos.length === 0;
    setExportCartel({ ok, motivos });
    sfx(ok);
    if (ok) setCartelOk(true);
  };

  /* ── Video ─────────────────────────────────────────────────────────── */
  const destinoV = DESTINOS_VIDEO.find((d) => d.id === destV)!;
  const mbps = TASAS_VIDEO[tasaIdx] ?? 8;
  const calcV = calcularVideo(destinoV, resV, fps, mbps, durV);
  const rv = RES_VIDEO[resV]!;
  const elegirDestinoV = (id: DestinoVideoId) => {
    setDestV(id);
    setDurV(DESTINOS_VIDEO.find((d) => d.id === id)!.duracionInicial);
    setExpV(null);
    blip();
  };
  const exportarVideo = () => {
    setExpV({ destino: destV, c: calcV });
    sfx(calcV.ok);
    if (calcV.ok) setVideoOk((s) => new Set(s).add(destV));
  };

  /* ── Audio ─────────────────────────────────────────────────────────── */
  const destinoA = DESTINOS_AUDIO.find((d) => d.id === destA)!;
  const calcA = calcularAudio(destinoA, formato, frec, bitsA, canales, kbps, destinoA.minutos);
  const elegirDestinoA = (id: DestinoAudioId) => {
    setDestA(id);
    setExpA(null);
    blip();
  };
  const exportarAudio = () => {
    setExpA({ destino: destA, c: calcA });
    sfx(calcA.ok);
    if (calcA.ok) setAudioOk((s) => new Set(s).add(destA));
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (modo === "imagen") {
      setImgId("foto");
      setResIdx(0);
      setBits(24);
      setComp("ninguna");
      setCalidad(50);
      setSelU(0.68);
      setSelV(0.44);
    }
    if (modo === "capas") {
      setOrden(ORDEN_INICIAL);
      setVisible({ foto: true, ajuste: true, banda: true, texto: true });
      setValor({ foto: 1, ajuste: 0.15, banda: 0.2, texto: 1 });
      setColorTexto("blanco");
      setExportCartel(null);
    }
    if (modo === "medios") {
      setResV(3);
      setFps(30);
      setTasaIdx(TASAS_VIDEO.indexOf(8));
      setDurV(destinoV.duracionInicial);
      setFormato("pcm");
      setFrec(44100);
      setBitsA(16);
      setCanales(2);
      setKbps(128);
      setExpV(null);
      setExpA(null);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Ver la foto con 1 bit de color y con la resolución más baja (16 × 12)", done: vio1bit && vioBaja },
    { t: "Comprimir sin pérdida la foto y el logotipo, y comparar cuánto se reduce cada uno", done: rleHecho.size === IMAGENES.length },
    { t: `Comprimir la foto de 64 × 48 con pérdida a calidad ${Q_BLOQUES} o menos y ver los bloques de 8 × 8`, done: vioBloques },
    { t: "Ordenar las capas del cartel: la foto abajo y el texto arriba", done: ordenLogrado },
    { t: `Exportar el cartel con contraste de al menos ${CONTRASTE_AA}:1`, done: cartelOk },
    { t: "Exportar el video para celulares con datos y para el proyector cumpliendo sus requisitos", done: videoOk.size === DESTINOS_VIDEO.length },
    { t: "Exportar el podcast y la grabación maestra cumpliendo sus requisitos", done: audioOk.size === DESTINOS_AUDIO.length },
    { t: "Clasificar archivos con o sin pérdida y ganar estrellas", done: clasifico },
    { t: "Resolver el reto de cálculo del video de la asamblea", done: retoOk },
    { t: "Aprobar el cuestionario del video A8", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaEdicion = modo === "medios" ? sub : modo;
  let chipVivo = "";
  let pie = "";
  const crudo = proc.bytesSinComprimir;
  if (modo === "imagen") {
    if (comp === "conPerdida") {
      chipVivo = `${proc.w}×${proc.h} · calidad ${calidad} · ${num((100 * proc.noCero!) / proc.totalCoef!, 1)} % de coeficientes`;
      pie = `La DCT convierte cada bloque de 8 × 8 en frecuencias y la calidad ${calidad} redondea a cero las que menos se notan: se guardan ${num(proc.noCero!)} de ${num(proc.totalCoef!)} coeficientes. Fidelidad: PSNR ${num(proc.psnr, 1)} dB.`;
    } else {
      chipVivo = `${proc.w}×${proc.h} · ${proc.bitsEfectivos} ${proc.bitsEfectivos === 1 ? "bit" : "bits"} · ${bytesTxt(proc.bytesArchivo!)}`;
      pie =
        comp === "sinPerdida"
          ? `RLE guarda cada racha de píxeles iguales como (repeticiones, color): ${num(proc.secuencias!)} rachas × ${1 + Math.ceil(proc.bitsEfectivos / 8)} B = ${num(proc.bytesArchivo!)} B, el ${num((100 * proc.bytesArchivo!) / crudo, 1)} % de ${num(crudo)} B. Al abrirla, la imagen es idéntica.`
          : `Peso = ${proc.w} × ${proc.h} × ${proc.bitsEfectivos} ÷ 8 = ${num(crudo)} B. Cada prisma es un píxel con su color real; su altura es su brillo. Toca un prisma para ver sus bits.`;
    }
  } else if (modo === "capas") {
    chipVivo = `contraste ${num(Math.min(evalC.contraste, 21), 2)}:1 · ${evalC.contraste >= CONTRASTE_AA ? "legible (AA)" : `menos de ${CONTRASTE_AA}:1`}`;
    pie = evalC.textoTapado
      ? "La foto es opaca y está encima del texto: lo tapa por completo. Cada capa cubre lo que tiene debajo."
      : evalC.ajusteSobreTexto
        ? "El ajuste de oscurecer está encima del texto: oscurece también las letras. Una capa de ajuste modifica todo lo que tiene debajo."
        : evalC.bandaSobreTexto
          ? "La banda oscura está encima del texto: tapa las letras junto con el fondo. Debe ir entre la foto y el texto."
          : `Cada capa se dibuja encima de las de abajo: C = α · capa + (1 − α) · fondo. En el peor punto de la zona del texto el contraste es ${num(Math.min(evalC.contraste, 21), 2)}:1.`;
  } else if (sub === "video") {
    chipVivo = `${rv.id} · ${fps} fps · ${String(mbps)} Mbps · ${bytesTxt(calcV.bytes)}`;
    pie = `(${String(mbps)} Mbps + ${AUDIO_VIDEO_KBPS} kbps) × ${durV} s ÷ 8 = ${bytesTxt(calcV.bytes)}. Sin comprimir, el video pediría ${num(calcV.crudoBps / 1e6, 1)} Mbps: el códec lo reduce ${num(calcV.factorCompresion, 0)} veces. ${CALIDAD_DEF[calcV.calidad].explica} Los bloques del cuadro son ilustrativos.`;
  } else {
    chipVivo = formato === "pcm" ? `${String(frec / 1000)} kHz · ${bitsA} bits · ${canales === 1 ? "mono" : "estéreo"} · ${bytesTxt(calcA.bytes)}` : `${kbps} kbps · ${bytesTxt(calcA.bytes)}`;
    pie =
      formato === "pcm"
        ? `PCM mide la onda ${num(frec)} veces por segundo con ${num(2 ** bitsA)} niveles: ${num(frec)} × ${bitsA} × ${canales} = ${num(calcA.bps)} bit/s. Solo caben frecuencias menores que ${String(frec / 2000)} kHz (Nyquist); lo que queda arriba se pierde.`
        : `El audio comprimido no guarda cada muestra: describe las frecuencias y descarta lo que el oído casi no percibe. ${kbps} kbps × ${destinoA.minutos * 60} s ÷ 8 = ${bytesTxt(calcA.bytes)}.`;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los resultados siguen aquí. {pie}</div>
    </div>
  );

  const sub_ = (txt: string) => <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const dato = (etq: string, val: ReactNode, col = "#fff") => (
    <div style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 9.5, fontWeight: 900, color: T.text3, letterSpacing: "0.06em", textTransform: "uppercase" }}>{etq}</div>
      <div style={{ fontSize: 13.5, fontWeight: 900, color: col, marginTop: 3, ...NUM }}>{val}</div>
    </div>
  );
  const requisito = (ok: boolean, txt: string) => (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: ok ? "#d1fae5" : "#fed7aa", lineHeight: 1.45 }}>
      <i className={`fa-solid ${ok ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginTop: 2, color: ok ? OK : WARN }} />
      {txt}
    </div>
  );
  const btn = (on: boolean, col: string) => ({ ["--edc" as string]: col, background: on ? `${col}1f` : "transparent" });

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "imagen") {
    const explica =
      comp === "conPerdida"
        ? proc.psnr >= 40
          ? "PSNR de 40 dB o más: a simple vista casi no se distingue del original, y aun así se descartó información."
          : proc.psnr >= 30
            ? "PSNR entre 30 y 40 dB: se ve bien, pero en los degradados y bordes ya hay pequeñas diferencias."
            : `PSNR menor de 30 dB: se notan los bloques de 8 × 8, porque cada bloque quedó con muy pocas frecuencias.${imgId === "logo" ? " En el logotipo, además, aparecen halos junto a los bordes nítidos." : ""}`
        : comp === "sinPerdida"
          ? proc.bytesArchivo! < crudo
            ? `Se redujo al ${num((100 * proc.bytesArchivo!) / crudo, 1)} %: hay rachas largas de píxeles idénticos${imgId === "logo" ? " porque el logotipo tiene colores planos" : ""}. Sin pérdida: error cero.`
            : proc.bitsEfectivos === 1
              ? `¡Creció al ${num((100 * proc.bytesArchivo!) / crudo, 1)} %! Con 1 bit cada píxel ocupa solo 1/8 de byte, y cada racha de RLE ocupa 2 bytes.`
              : `¡Creció al ${num((100 * proc.bytesArchivo!) / crudo, 1)} %! Por el grano de la cámara casi ningún píxel es igual a su vecino: cada racha mide 1 píxel y el conteo añade 1 byte. Sin pérdida no siempre reduce.`
          : bits === 1
            ? "Con 1 bit cada píxel solo puede ser blanco o negro: se guarda si su brillo pasa de la mitad. Pesa 24 veces menos que a 24 bits."
            : bits === 8
              ? `Con 8 bits (3 rojo, 3 verde, 2 azul) solo hay 256 colores posibles: los degradados se vuelven franjas. Esta imagen quedó con ${num(proc.colores)} colores distintos.`
              : bits === 16
                ? `Con 16 bits (5-6-5) hay 65 536 colores: casi no se nota la diferencia y pesa dos tercios de lo que pesa a 24 bits. Colores distintos: ${num(proc.colores)}.`
                : `Con 24 bits cada canal tiene 256 niveles: 16 777 216 colores posibles. Esta imagen usa ${num(proc.colores)} colores distintos.`;
    control = (
      <>
        <div className="ed-opts">
          {IMAGENES.map((im) => (
            <button key={im.id} className="ed-opt ed-img" data-on={im.id === imgId} onClick={() => { aplicarImagen({ img: im.id }); blip(); }} style={btn(im.id === imgId, modoCol)}>
              <i className={`fa-solid ${im.icono}`} style={{ marginRight: 8 }} />
              {im.etq}
              {rleHecho.has(im.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>{IMAGENES.find((x) => x.id === imgId)!.detalle}</div>

        {sub_("1 · Resolución")}
        <div className="ed-opts">
          {RESOLUCIONES.map((r, k) => (
            <button key={k} className="ed-opt ed-res" data-on={k === resIdx} onClick={() => { aplicarImagen({ res: k }); blip(); }} style={btn(k === resIdx, accent)}>
              {r.w} × {r.h}
            </button>
          ))}
        </div>

        {sub_("2 · Profundidad de color")}
        <div className="ed-opts" style={{ opacity: comp === "conPerdida" ? 0.45 : 1 }}>
          {PROFUNDIDADES.map((pr) => (
            <button key={pr.bits} className="ed-opt ed-bits" data-on={pr.bits === proc.bitsEfectivos} disabled={comp === "conPerdida"} onClick={() => { aplicarImagen({ bits: pr.bits }); blip(); }} style={btn(pr.bits === proc.bitsEfectivos, accent)} title={pr.detalle}>
              {pr.etq}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>
          {comp === "conPerdida" ? "La compresión tipo JPEG trabaja siempre con 24 bits (8 por canal)." : `${PROFUNDIDADES.find((p) => p.bits === bits)!.detalle} · 2^${bits} = ${num(2 ** bits)}`}
        </div>

        {sub_("3 · Guardar el archivo")}
        <div className="ed-opts">
          {COMPRESIONES.map((c) => (
            <button key={c.id} className="ed-opt ed-comp" data-on={c.id === comp} onClick={() => { aplicarImagen({ comp: c.id }); blip(); }} style={btn(c.id === comp, modoCol)} title={c.detalle}>
              <i className={`fa-solid ${c.icono}`} style={{ marginRight: 8 }} />
              {c.etq}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>{COMPRESIONES.find((c) => c.id === comp)!.detalle}</div>
        {comp === "conPerdida" && (
          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: T.text2, width: 58 }}>Calidad</span>
            <input type="range" aria-label="Calidad de la compresión con pérdida" className="ed-range" min={5} max={95} step={5} value={calidad} onChange={(e) => aplicarImagen({ calidad: Number(e.target.value) })} style={{ ["--edc" as string]: modoCol }} />
            <span style={{ width: 34, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{calidad}</span>
          </label>
        )}

        <div className="ed-datos" style={{ marginTop: 14 }}>
          {dato("Sin comprimir", `${num(crudo)} B`)}
          {comp === "conPerdida"
            ? dato("Coeficientes guardados", `${num(proc.noCero!)} de ${num(proc.totalCoef!)}`, modoCol)
            : dato(comp === "sinPerdida" ? "Archivo RLE" : "Archivo", `${num(proc.bytesArchivo!)} B`, comp === "sinPerdida" ? (proc.bytesArchivo! < crudo ? OK : WARN) : "#fff")}
          {dato("Fidelidad (PSNR)", Number.isFinite(proc.psnr) ? `${num(proc.psnr, 1)} dB` : "idéntica", Number.isFinite(proc.psnr) ? "#fde68a" : OK)}
          {dato("Colores distintos", num(proc.colores))}
        </div>
        <div style={{ fontSize: 12, color: T.text2, marginTop: 10, lineHeight: 1.5, ...NUM }}>
          {proc.w} × {proc.h} × {proc.bitsEfectivos} ÷ 8 = <strong style={{ color: "#fff" }}>{num(crudo)} B</strong>. A tamaño real, con los mismos bits:{" "}
          {FOTOS_REALES.map((f, k) => (
            <span key={f.etq}>
              {k > 0 ? "; " : ""}
              {f.etq.toLowerCase()}, {num(f.w)} × {num(f.h)} × {proc.bitsEfectivos} ÷ 8 = <strong style={{ color: "#fff" }}>{bytesTxt(bytesCrudos(f.w, f.h, proc.bitsEfectivos))}</strong>
            </span>
          ))}
          .
        </div>
        {nota(explica, comp === "sinPerdida" && proc.bytesArchivo! >= crudo ? WARN : comp === "conPerdida" && proc.psnr < 30 ? "#fbbf24" : T.text2, "fa-lightbulb")}

        {sub_("Inspector de bits del píxel")}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="ed-cruz">
            <button className="ed-mini" aria-label="Píxel de arriba" onClick={() => moverPixel(0, -1)} style={{ gridArea: "a" }}>
              <i className="fa-solid fa-caret-up" />
            </button>
            <button className="ed-mini" aria-label="Píxel de la izquierda" onClick={() => moverPixel(-1, 0)} style={{ gridArea: "i" }}>
              <i className="fa-solid fa-caret-left" />
            </button>
            <button className="ed-mini" aria-label="Píxel de la derecha" onClick={() => moverPixel(1, 0)} style={{ gridArea: "d" }}>
              <i className="fa-solid fa-caret-right" />
            </button>
            <button className="ed-mini" aria-label="Píxel de abajo" onClick={() => moverPixel(0, 1)} style={{ gridArea: "b" }}>
              <i className="fa-solid fa-caret-down" />
            </button>
          </div>
          <div style={{ flex: 1, minWidth: 180, fontSize: 12, color: T.text2, lineHeight: 1.55, ...NUM }}>
            <div>
              Píxel ({selX}, {selY}) · original RGB <strong style={{ color: "#fff" }}>{rgbTxt(origSel)}</strong>
            </div>
            <div>
              Guardado:{" "}
              <strong style={{ color: "#fff", fontFamily: "ui-monospace, monospace" }}>
                {proc.bitsEfectivos === 1 ? codigos[0]!.toString(2) : codigos.map((cd, k) => `${["R", "G", "B"][k]} ${cd.toString(2).padStart(reparto[k]!, "0")}`).join(" · ")}
              </strong>
            </div>
            <div>
              Se ve como RGB <strong style={{ color: "#fff" }}>{rgbTxt(verSel)}</strong>
              <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, marginLeft: 7, verticalAlign: "-2px", background: `rgb(${verSel.join(",")})`, border: "1px solid rgba(255,255,255,0.3)" }} />
            </div>
          </div>
        </div>
      </>
    );
  } else if (modo === "capas") {
    const arribaAbajo = [...orden].reverse();
    const pl = luminancia(evalC.peorFondo);
    const pt = luminancia(evalC.peorTexto);
    const okC = evalC.contraste >= CONTRASTE_AA;
    control = (
      <>
        <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 8 }}>Como en cualquier editor, la lista va de arriba (se ve encima) hacia abajo.</div>
        <div style={{ display: "grid", gap: 8 }}>
          {arribaAbajo.map((id) => {
            const d = CAPA_DEF[id];
            const i = orden.indexOf(id);
            const vis = visible[id];
            return (
              <div key={id} className="ed-capa" data-vis={vis} style={{ ["--edc" as string]: d.color }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: `${d.color}33`, color: d.color, fontSize: 10.5, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", ...NUM }}>{i + 1}</span>
                  <i className={`fa-solid ${d.icono}`} style={{ color: d.color, width: 14 }} />
                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 900, color: vis ? "#fff" : T.text3 }}>{d.etq}</span>
                  <button className="ed-mini ed-ojo" aria-label={`${vis ? "Ocultar" : "Mostrar"} ${d.etq}`} onClick={() => alternar(id)}>
                    <i className={`fa-solid ${vis ? "fa-eye" : "fa-eye-slash"}`} />
                  </button>
                  <button className="ed-mini ed-subir" aria-label={`Subir ${d.etq}`} disabled={i === orden.length - 1} onClick={() => mover(id, 1)}>
                    <i className="fa-solid fa-arrow-up" />
                  </button>
                  <button className="ed-mini ed-bajar" aria-label={`Bajar ${d.etq}`} disabled={i === 0} onClick={() => mover(id, -1)}>
                    <i className="fa-solid fa-arrow-down" />
                  </button>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 7 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, width: 64 }}>{id === "ajuste" ? "Oscurece" : "Opacidad"}</span>
                  <input type="range" aria-label={`${id === "ajuste" ? "Oscurecimiento" : "Opacidad"} de ${d.etq} (%)`} className="ed-range" min={0} max={100} step={5} value={Math.round(valor[id] * 100)} onChange={(e) => cambiarValor(id, Number(e.target.value) / 100)} style={{ ["--edc" as string]: d.color }} />
                  <span style={{ width: 40, textAlign: "right", fontSize: 12, color: "#fff", fontWeight: 800, ...NUM }}>{Math.round(valor[id] * 100)} %</span>
                </label>
              </div>
            );
          })}
        </div>

        {sub_("Color del texto")}
        <div className="ed-opts">
          {COLORES_TEXTO.map((c) => (
            <button key={c.id} className="ed-opt ed-color" data-on={c.id === colorTexto} onClick={() => { setColorTexto(c.id); setExportCartel(null); blip(); }} style={btn(c.id === colorTexto, accent)}>
              <span style={{ display: "inline-block", width: 11, height: 11, borderRadius: 3, marginRight: 7, verticalAlign: "-1px", background: `rgb(${c.rgb.join(",")})`, border: "1px solid rgba(255,255,255,0.35)" }} />
              {c.etq}
            </button>
          ))}
        </div>

        {sub_("Diagnóstico del orden")}
        <div style={{ display: "grid", gap: 5 }}>
          {requisito(!evalC.textoTapado && orden.indexOf("foto") < orden.indexOf("texto"), "El texto queda encima de la foto")}
          {requisito(!evalC.bandaSobreTexto && !evalC.bandaDebajoFoto, "La banda está entre la foto y el texto")}
          {requisito(!evalC.ajusteSobreTexto, "El ajuste de oscurecer no queda encima del texto")}
        </div>

        {sub_("Contraste del texto (WCAG 2.x)")}
        <div className="ed-datos">
          {dato("Contraste mínimo", `${num(Math.min(evalC.contraste, 21), 2)}:1`, okC ? OK : WARN)}
          {dato("Meta para texto normal", `≥ ${CONTRASTE_AA}:1`)}
        </div>
        <div style={{ fontSize: 12, color: T.text2, marginTop: 8, lineHeight: 1.55, ...NUM }}>
          Peor punto de la zona del texto: fondo RGB {rgbTxt(evalC.peorFondo)} con L = {num(pl, 3)} y letras RGB {rgbTxt(evalC.peorTexto)} con L = {num(pt, 3)} → ({num(Math.max(pl, pt), 3)} + 0.05) ÷ ({num(Math.min(pl, pt), 3)} + 0.05) ={" "}
          <strong style={{ color: okC ? OK : WARN }}>{num(Math.min(evalC.contraste, 21), 2)}:1</strong>.
          {visible.banda && orden.indexOf("banda") > orden.indexOf("foto") && ` Con la banda al ${Math.round(valor.banda * 100)} %: C = ${num(valor.banda, 2)} · negro + ${num(1 - valor.banda, 2)} · fondo.`}
        </div>

        <button className="ed-toggle" onClick={exportarCartel} style={{ marginTop: 14, ["--edc" as string]: accent }}>
          <i className="fa-solid fa-file-export" style={{ marginRight: 9, color: accent }} />
          Exportar el cartel ({CARTEL_REAL.w} × {CARTEL_REAL.h})
        </button>
        {exportCartel &&
          (exportCartel.ok
            ? nota(
                <>
                  Cartel listo y legible. Sin comprimir pesaría {num(CARTEL_REAL.w)} × {num(CARTEL_REAL.h)} × 24 ÷ 8 = {num(bytesCrudos(CARTEL_REAL.w, CARTEL_REAL.h, 24))} B ({bytesTxt(bytesCrudos(CARTEL_REAL.w, CARTEL_REAL.h, 24))}). Como es sobre todo una foto con letras grandes, conviene
                  JPEG de calidad alta para compartirlo; guarda también el proyecto con capas para poder editarlo después.
                </>,
                OK,
                "fa-circle-check",
              )
            : nota(exportCartel.motivos.join(" "), WARN, "fa-triangle-exclamation"))}
      </>
    );
  } else {
    control = (
      <>
        <div className="ed-opts">
          {(["video", "audio"] as Sub[]).map((s) => (
            <button key={s} className="ed-opt ed-sub" data-on={s === sub} onClick={() => { setSub(s); blip(); }} style={btn(s === sub, modoCol)}>
              <i className={`fa-solid ${s === "video" ? "fa-video" : "fa-microphone"}`} style={{ marginRight: 8 }} />
              {s === "video" ? "Video" : "Audio"}
            </button>
          ))}
        </div>
        {sub === "video" ? (
          <>
            {sub_("Destino")}
            <div className="ed-opts">
              {DESTINOS_VIDEO.map((d) => (
                <button key={d.id} className="ed-opt ed-destv" data-on={d.id === destV} onClick={() => elegirDestinoV(d.id)} style={btn(d.id === destV, modoCol)}>
                  <i className={`fa-solid ${d.icono}`} style={{ marginRight: 8 }} />
                  {d.etq}
                  {videoOk.has(d.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.text2, marginTop: 8, lineHeight: 1.5 }}>{destinoV.contexto}</div>

            {sub_("Resolución")}
            <div className="ed-opts">
              {RES_VIDEO.map((r, k) => (
                <button key={r.id} className="ed-opt ed-resv" data-on={k === resV} onClick={() => { setResV(k); blip(); }} style={btn(k === resV, accent)}>
                  {r.id}
                </button>
              ))}
            </div>
            {sub_("Cuadros por segundo")}
            <div className="ed-opts">
              {FPS.map((f) => (
                <button key={f} className="ed-opt ed-fps" data-on={f === fps} onClick={() => { setFps(f); blip(); }} style={btn(f === fps, accent)}>
                  {f} fps
                </button>
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: T.text2, width: 86 }}>Tasa de video</span>
              <input type="range" aria-label="Tasa de bits del video (paso)" className="ed-range" min={0} max={TASAS_VIDEO.length - 1} step={1} value={tasaIdx} onChange={(e) => setTasaIdx(Number(e.target.value))} style={{ ["--edc" as string]: modoCol }} />
              <span style={{ width: 78, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{String(mbps)} Mbps</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: T.text2, width: 86 }}>Duración</span>
              <input type="range" aria-label="Duración del video (s)" className="ed-range" min={10} max={600} step={5} value={durV} onChange={(e) => setDurV(Number(e.target.value))} style={{ ["--edc" as string]: modoCol }} />
              <span style={{ width: 78, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{durV} s</span>
            </label>

            <div className="ed-datos" style={{ marginTop: 14 }}>
              {dato("Peso del archivo", bytesTxt(calcV.bytes), calcV.cumple.peso ? OK : WARN)}
              {dato("Calidad", CALIDAD_DEF[calcV.calidad].etq, CALIDAD_DEF[calcV.calidad].color)}
              {dato("Compresión del códec", `${num(calcV.factorCompresion, 0)} veces`)}
              {dato(destV === "celular" ? "Descargas con 1 GB" : "Del límite FAT32", destV === "celular" ? `${num(calcV.vecesPaquete)} veces` : `${num(calcV.fraccionContenedor * 100, 1)} %`)}
            </div>
            <div style={{ fontSize: 12, color: T.text2, marginTop: 10, lineHeight: 1.55, ...NUM }}>
              Sin comprimir: {num(rv.w)} × {num(rv.h)} × 24 × {fps} = {num(calcV.crudoBps)} bit/s → en {durV} s serían <strong style={{ color: "#fff" }}>{bytesTxt(Math.round((calcV.crudoBps * durV) / 8))}</strong>. Comprimido: ({num(calcV.bpsVideo)} + {num(AUDIO_VIDEO_KBPS * 1000)}) bit/s × {durV} s ÷ 8 ={" "}
              <strong style={{ color: "#fff" }}>{num(calcV.bytes)} B</strong>. Tasa recomendada para {rv.id} a {fps} fps: {num(calcV.recomendada, calcV.recomendada % 1 ? 1 : 0)} Mbps.
            </div>
            {sub_("Requisitos del destino")}
            <div style={{ display: "grid", gap: 5 }}>
              {requisito(calcV.cumple.resolucion, destV === "celular" ? "Resolución de 480p o más" : "Resolución igual a la del proyector (1080p)")}
              {requisito(calcV.cumple.calidad, destV === "celular" ? "Se ve al menos aceptable" : "Se ve nítido")}
              {requisito(calcV.cumple.peso, destV === "celular" ? "Pesa 15 MB o menos" : "Cabe en FAT32 (menos de 4 GiB)")}
            </div>
            <button className="ed-toggle" onClick={exportarVideo} style={{ marginTop: 12, ["--edc" as string]: accent }}>
              <i className="fa-solid fa-file-export" style={{ marginRight: 9, color: accent }} />
              Exportar para «{destinoV.etq}»
            </button>
            {expV &&
              expV.destino === destV &&
              (expV.c.ok
                ? nota(`Exportado: ${bytesTxt(expV.c.bytes)}, calidad ${CALIDAD_DEF[expV.c.calidad].etq.toLowerCase()}. ${destV === "celular" ? `Cada familia gasta el ${num(expV.c.fraccionContenedor * 100, 2)} % de su paquete al descargarlo.` : "El proyector lo mostrará a su resolución completa sin desperdiciar espacio."}`, OK, "fa-circle-check")
                : nota(
                    `Todavía no cumple: ${[!expV.c.cumple.resolucion && (destV === "celular" ? "necesita 480p o más" : "debe ser 1080p, la resolución del proyector"), !expV.c.cumple.calidad && "le faltan bits para verse con la calidad pedida (sube la tasa o baja la resolución o los fps)", !expV.c.cumple.peso && "pesa demasiado (baja la tasa, la resolución o la duración)"].filter(Boolean).join("; ")}.`,
                    WARN,
                    "fa-triangle-exclamation",
                  ))}
          </>
        ) : (
          <>
            {sub_("Destino")}
            <div className="ed-opts">
              {DESTINOS_AUDIO.map((d) => (
                <button key={d.id} className="ed-opt ed-desta" data-on={d.id === destA} onClick={() => elegirDestinoA(d.id)} style={btn(d.id === destA, modoCol)}>
                  <i className={`fa-solid ${d.icono}`} style={{ marginRight: 8 }} />
                  {d.etq}
                  {audioOk.has(d.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.text2, marginTop: 8, lineHeight: 1.5 }}>{destinoA.contexto}</div>
            {sub_("Formato")}
            <div className="ed-opts">
              {(["pcm", "comprimido"] as FormatoAudio[]).map((f) => (
                <button key={f} className="ed-opt ed-fmt" data-on={f === formato} onClick={() => { setFormato(f); blip(); }} style={btn(f === formato, accent)}>
                  {f === "pcm" ? "PCM · WAV (sin pérdida)" : "Comprimido · MP3/AAC (con pérdida)"}
                </button>
              ))}
            </div>
            {formato === "pcm" ? (
              <>
                {sub_("Frecuencia de muestreo")}
                <div className="ed-opts">
                  {FRECUENCIAS.map((f) => (
                    <button key={f} className="ed-opt ed-frec" data-on={f === frec} onClick={() => { setFrec(f); blip(); }} style={btn(f === frec, accent)}>
                      {String(f / 1000)} kHz
                    </button>
                  ))}
                </div>
                {sub_("Bits por muestra y canales")}
                <div className="ed-opts">
                  {BITS_AUDIO.map((b) => (
                    <button key={b} className="ed-opt ed-bitsa" data-on={b === bitsA} onClick={() => { setBitsA(b); blip(); }} style={btn(b === bitsA, accent)}>
                      {b} bits
                    </button>
                  ))}
                  {[1, 2].map((c) => (
                    <button key={c} className="ed-opt ed-can" data-on={c === canales} onClick={() => { setCanales(c); blip(); }} style={btn(c === canales, modoCol)}>
                      {c === 1 ? "Mono" : "Estéreo"}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {sub_("Tasa de bits (todos los canales)")}
                <div className="ed-opts">
                  {TASAS_AUDIO.map((k) => (
                    <button key={k} className="ed-opt ed-kbps" data-on={k === kbps} onClick={() => { setKbps(k); blip(); }} style={btn(k === kbps, accent)}>
                      {k} kbps
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="ed-datos" style={{ marginTop: 14 }}>
              {dato(`Peso (${destinoA.minutos} min)`, bytesTxt(calcA.bytes), calcA.cumple.peso ? OK : WARN)}
              {dato("Tasa", `${num(calcA.bps / 1000, calcA.bps % 1000 ? 1 : 0)} kbps`)}
              {dato("Frecuencia más aguda", `${String(calcA.frecuenciaMax / 1000)} kHz`)}
              {dato("Rango dinámico", calcA.snrDb !== null ? `${num(calcA.snrDb, 1)} dB` : "—")}
            </div>
            <div style={{ fontSize: 12, color: T.text2, marginTop: 10, lineHeight: 1.55, ...NUM }}>
              {formato === "pcm" ? (
                <>
                  {num(frec)} muestras/s × {bitsA} bits × {canales} {canales === 1 ? "canal" : "canales"} = {num(calcA.bps)} bit/s; × {destinoA.minutos * 60} s ÷ 8 = <strong style={{ color: "#fff" }}>{num(calcA.bytes)} B</strong>. Con {bitsA} bits hay {num(2 ** bitsA)} niveles y el rango
                  dinámico teórico de un tono es 6.02 × {bitsA} + 1.76 = {num(calcA.snrDb!, 2)} dB.
                </>
              ) : (
                <>
                  {kbps} 000 bit/s × {destinoA.minutos * 60} s ÷ 8 = <strong style={{ color: "#fff" }}>{num(calcA.bytes)} B</strong>. Frente al WAV de 44.1 kHz, 16 bits y estéreo (1 411.2 kbps), ocupa {num(1411.2 / kbps, 1)} veces menos.
                </>
              )}
            </div>
            {sub_("Requisitos del destino")}
            <div style={{ display: "grid", gap: 5 }}>
              {destinoA.maxBytes !== null && requisito(calcA.cumple.peso, `Pesa ${bytesTxt(destinoA.maxBytes)} o menos`)}
              {destinoA.sinPerdida && requisito(calcA.cumple.formato, "Se guarda sin pérdida (PCM)")}
              {requisito(calcA.cumple.claridad, destinoA.id === "podcast" ? "Voz clara: 16 kHz o más; si se comprime, 64 kbps o más" : "Calidad de música: 44.1 kHz o más")}
            </div>
            <button className="ed-toggle" onClick={exportarAudio} style={{ marginTop: 12, ["--edc" as string]: accent }}>
              <i className="fa-solid fa-file-export" style={{ marginRight: 9, color: accent }} />
              Exportar para «{destinoA.etq}»
            </button>
            {expA &&
              expA.destino === destA &&
              (expA.c.ok
                ? nota(`Exportado: ${bytesTxt(expA.c.bytes)}. ${destA === "podcast" ? "Se descarga con pocos datos y la voz se entiende." : "La maestra conserva todo para editar; el episodio comprimido se saca después de ella."}`, OK, "fa-circle-check")
                : nota(
                    `Todavía no cumple: ${[!expA.c.cumple.formato && "la maestra no puede ir con pérdida", !expA.c.cumple.claridad && (destA === "podcast" ? "la voz no quedará clara (sube la frecuencia o la tasa)" : "falta frecuencia de muestreo"), !expA.c.cumple.peso && "pesa demasiado para descargarse con datos (prueba comprimir)"].filter(Boolean).join("; ")}.`,
                    WARN,
                    "fa-triangle-exclamation",
                  ))}
          </>
        )}
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes edPulse { 0%,100%{ box-shadow:0 0 0 0 var(--edd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ed-live-dot { animation: edPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .ed-live-dot { animation:none; } }
        .ed-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ed-grid { grid-template-columns: 1fr; } }
        .ed-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ed-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ed-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ed-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .ed-tab { cursor:pointer; border:1px solid var(--edc); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .ed-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .ed-tab:hover { background:rgba(255,255,255,0.06); }
        .ed-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .ed-opt { cursor:pointer; border:1px solid var(--edc); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .ed-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .ed-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .ed-opt:disabled { cursor:default; }
        .ed-toggle { width:100%; cursor:pointer; border:1px solid var(--edc); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .ed-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .ed-range { flex:1; min-width:0; accent-color: var(--edc); }
        .ed-datos { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:7px; }
        .ed-mini { cursor:pointer; width:30px; height:30px; border-radius:8px; border:1px solid ${T.line}; background:rgba(4,10,22,0.45); color:#fff; font-size:12px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ed-mini:hover:not(:disabled) { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ed-mini:disabled { opacity:0.3; cursor:default; }
        .ed-cruz { display:grid; grid-template-areas: ". a ." "i . d" ". b ."; grid-template-columns: repeat(3,30px); grid-template-rows: repeat(3,30px); gap:3px; }
        .ed-capa { padding:9px 11px; border-radius:11px; border:1px solid var(--edc); background:rgba(4,10,22,0.42); transition:all .15s; }
        .ed-capa[data-vis="false"] { border-color:rgba(255,255,255,0.12); opacity:0.75; }
        .ed-opt:focus-visible, .ed-tab:focus-visible, .ed-toggle:focus-visible, .ed-icobtn:focus-visible, .ed-range:focus-visible, .ed-mini:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .ed-bottom { grid-template-columns: 1fr !important; } }
        .ed-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ed-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ed-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .ed-drawer[data-open="true"] { transform:translateX(0); }
        .ed-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ed-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ed-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ed-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ed-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .ed-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="ed-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="ed-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--edc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="ed-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 58vh, 660px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <EstudioScene
                vista={vista}
                modoColor={modoCol}
                resetNonce={resetNonce}
                imgW={proc.w}
                imgH={proc.h}
                imgPx={proc.px}
                bloques={comp === "conPerdida"}
                selX={selX}
                selY={selY}
                bits={proc.bitsEfectivos}
                codigos={codigos}
                onPixel={onPixel}
                orden={orden}
                visibleFoto={visible.foto}
                visibleAjuste={visible.ajuste}
                visibleBanda={visible.banda}
                visibleTexto={visible.texto}
                valorFoto={valor.foto}
                valorAjuste={valor.ajuste}
                valorBanda={valor.banda}
                valorTexto={valor.texto}
                colorTexto={colorTexto}
                contraste={evalC.contraste}
                destinoVideo={destV}
                resVideoIdx={resV}
                fps={fps}
                calidad={calcV.calidad}
                bytesVideo={calcV.bytes}
                maxBytesVideo={destinoV.maxBytes}
                formato={formato}
                frecuencia={frec}
                bitsAudio={bitsA}
                bytesAudio={calcA.bytes}
                maxBytesAudio={destinoA.maxBytes}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="ed-live-dot" style={{ ["--edd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ed-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ed-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ed-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {modo === "medios" ? (sub === "video" ? "Video: peso, datos y destino" : "Audio: muestreo, bits y destino") : def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6, ...NUM }}>{pie}</div>
            </div>

            <button className="ed-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
              Controles — {def.etq}
            </Eyebrow>
            <div style={{ marginTop: 12 }}>{control}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-photo-film" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Difunde tu proyecto con lo que hay</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #c4b5fd55", background: "rgba(196,181,253,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-people-roof" style={{ marginRight: 8, color: "#c4b5fd" }} />
              Simulación A2 (inspiración)
            </Eyebrow>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 800, lineHeight: 1.4, marginBottom: 8 }}>{SIMULACION_A2.titulo}</div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{SIMULACION_A2.descripcion}</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", margin: "12px 0 6px" }}>VARIABLES QUE ESTE LABORATORIO EXPLORA</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 6 }}>
              {SIMULACION_A2.variables.map((v, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  {v}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 12, color: "#e9d5ff", lineHeight: 1.5, marginTop: 10, fontStyle: "italic" }}>{SIMULACION_A2.reflexion}</div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />
              Lectura A1
            </Eyebrow>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 800, lineHeight: 1.4, marginBottom: 10 }}>{TITULO_A1}</div>
            <div style={{ display: "grid", gap: 9, marginBottom: 12 }}>
              {LECTURA_A1.map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA REFLEXIONAR</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  {q}
                </li>
              ))}
            </ul>
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
              <span className="ed-objetivos-cuenta" style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ed-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-landmark" style={{ marginRight: 8, color: accent }} />
              Importante (lectura A1)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{RECUADRO_A1}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              Hechos (quiz A4)
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {HECHOS.map((h, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {h}
                </li>
              ))}
            </ul>
          </div>
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
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                    <i className="fa-solid fa-people-group" style={{ marginRight: 6, color: accent }} />
                    {gi.ejemplo}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, marginTop: 10 }}>
              <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
            </div>
          </div>
        </div>
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
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, border: `1px solid ${T.line}`, background: "rgba(4,10,22,0.4)" }}>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 6 }}>PREGUNTA DEL VIDEO A8</div>
            <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.5 }}>{PREGUNTA_ABIERTA_A8}</div>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", margin: "12px 0 6px" }}>PARA CERRAR (AUTOEVALUACIÓN A7)</div>
            <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.5 }}>{REFLEXION_A7}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1 con sus preguntas y su recuadro, la descripción de la simulación A2, los hechos del quiz A4, el glosario A5, el texto A6, la reflexión A7 y las preguntas del video A8 son <strong>verbatim</strong> del material de
          la plataforma; la retroalimentación del cuestionario A8 y el reto de cálculo son del laboratorio. La foto y el logotipo son <strong>imágenes sintéticas</strong>, y los cálculos se hacen de verdad sobre ellas: peso = ancho × alto × bits ÷ 8,
          compresión RLE contada byte a byte y compresión con la DCT y las tablas de cuantización de JPEG (ITU-T T.81, escaladas como libjpeg, sin submuestreo de color). El contraste usa la fórmula de las WCAG 2.x. Las tasas recomendadas de
          video son las de la guía de subida de YouTube; los límites de cada destino (15 MB, 10 MB, calidad mínima) y el criterio «aceptable» (al menos la mitad de la tasa recomendada) son <strong>criterios ilustrativos</strong>, igual que
          los bloques dibujados en los cuadros del video. Unidades del SI: 1 MB = 10⁶ bytes. Fuente: {FUENTE}
        </span>
      </div>

      <FormatoCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoNumericoCard reto={RETO_VIDEO} accent={accent} aprobado={retoOk} onAprobado={() => setRetoOk(true)} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A8} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes qué se necesita para crear contenido digital." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="ed-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ed-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ed-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ed-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ed-drawer-body">
          <FichaTeorica data={ESTUDIO_EDICION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
