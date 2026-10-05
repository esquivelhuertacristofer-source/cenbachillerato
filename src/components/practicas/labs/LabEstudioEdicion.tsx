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

import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
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
  COMPONENTES,
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
      <span style={{ fontSize: 14, fontWeight: 600 }}>Encendiendo el estudio de edición en 3D…</span>
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
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 14, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 14, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
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
          {aviso && <div style={{ marginTop: 10, fontSize: 14, color: WARN, lineHeight: 1.5 }}>{aviso} Inténtalo de nuevo.</div>}
        </>
      ) : (
        <div style={{ padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 14, fontWeight: 900, color: OK, marginLeft: 4 }}>Ronda con {errores === 0 ? "cero errores" : `${errores} ${errores === 1 ? "error" : "errores"}`}</span>
          </span>
          <button onClick={otra} style={{ cursor: "pointer", padding: "9px 14px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 14, fontWeight: 900 }}>
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
    { t: "Elige la foto y guárdala sin pérdida (RLE): ¿el archivo se encoge o crece?", done: rleHecho.has("foto") },
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
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los resultados siguen aquí. {pie}</div>
    </div>
  );

  const sub_ = (txt: string) => <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const dato = (etq: string, val: string, col = "#fff") => <Dato label={etq} value={val} col={col} />;
  const requisito = (ok: boolean, txt: string) => (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, color: ok ? "#d1fae5" : "#fed7aa", lineHeight: 1.45 }}>
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
        <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>{IMAGENES.find((x) => x.id === imgId)!.detalle}</div>

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
        <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>
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
        <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>{COMPRESIONES.find((c) => c.id === comp)!.detalle}</div>
        {comp === "conPerdida" && (
          <div style={{ marginTop: 12 }}>
            <Deslizador label="Calidad" icon="fa-sliders" colr={modoCol} valor={String(calidad)} min={5} max={95} step={5} value={calidad} onChange={(v) => aplicarImagen({ calidad: v })} hintL="más pequeño, más bloques" hintR="más grande, más fiel" />
          </div>
        )}

        <div className="ed-datos" style={{ marginTop: 14 }}>
          {dato("Sin comprimir", `${num(crudo)} B`)}
          {comp === "conPerdida"
            ? dato("Coeficientes guardados", `${num(proc.noCero!)} de ${num(proc.totalCoef!)}`, modoCol)
            : dato(comp === "sinPerdida" ? "Archivo RLE" : "Archivo", `${num(proc.bytesArchivo!)} B`, comp === "sinPerdida" ? (proc.bytesArchivo! < crudo ? OK : WARN) : "#fff")}
          {dato("Fidelidad (PSNR)", Number.isFinite(proc.psnr) ? `${num(proc.psnr, 1)} dB` : "idéntica", Number.isFinite(proc.psnr) ? "#fde68a" : OK)}
          {dato("Colores distintos", num(proc.colores))}
        </div>
        <div style={{ fontSize: 14, color: T.text2, marginTop: 10, lineHeight: 1.5, ...NUM }}>
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
          <div style={{ flex: 1, minWidth: 0, fontSize: 14, color: T.text2, lineHeight: 1.55, ...NUM }}>
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
        <div style={{ fontSize: 14, color: T.text3, marginBottom: 8 }}>Como en cualquier editor, la lista va de arriba (se ve encima) hacia abajo.</div>
        <div style={{ display: "grid", gap: 8 }}>
          {arribaAbajo.map((id) => {
            const d = CAPA_DEF[id];
            const i = orden.indexOf(id);
            const vis = visible[id];
            return (
              <div key={id} className="ed-capa" data-vis={vis} style={{ ["--edc" as string]: d.color }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: `${d.color}33`, color: d.color, fontSize: 14, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", ...NUM }}>{i + 1}</span>
                  <i className={`fa-solid ${d.icono}`} style={{ color: d.color, width: 14 }} />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 900, color: vis ? "#fff" : T.text3 }}>{d.etq}</span>
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
                <div style={{ marginTop: 6 }}>
                  <Deslizador label={id === "ajuste" ? "Oscurece" : "Opacidad"} colr={d.color} valor={`${Math.round(valor[id] * 100)} %`} min={0} max={100} step={5} value={Math.round(valor[id] * 100)} onChange={(v) => cambiarValor(id, v / 100)} />
                </div>
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
        <div style={{ fontSize: 14, color: T.text2, marginTop: 8, lineHeight: 1.55, ...NUM }}>
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
            <div style={{ fontSize: 14, color: T.text2, marginTop: 8, lineHeight: 1.5 }}>{destinoV.contexto}</div>

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
            <div style={{ marginTop: 14 }}>
              <Deslizador label="Tasa de video" icon="fa-gauge-high" colr={modoCol} valor={`${String(mbps)} Mbps`} min={0} max={TASAS_VIDEO.length - 1} step={1} value={tasaIdx} onChange={setTasaIdx} hintL="menos bits, se ve peor" hintR="más bits, pesa más" />
              <Deslizador label="Duración" icon="fa-clock" colr={modoCol} valor={`${durV} s`} min={10} max={600} step={5} value={durV} onChange={setDurV} />
            </div>

            <div className="ed-datos" style={{ marginTop: 14 }}>
              {dato("Peso del archivo", bytesTxt(calcV.bytes), calcV.cumple.peso ? OK : WARN)}
              {dato("Calidad", CALIDAD_DEF[calcV.calidad].etq, CALIDAD_DEF[calcV.calidad].color)}
              {dato("Compresión del códec", `${num(calcV.factorCompresion, 0)} veces`)}
              {dato(destV === "celular" ? "Descargas con 1 GB" : "Del límite FAT32", destV === "celular" ? `${num(calcV.vecesPaquete)} veces` : `${num(calcV.fraccionContenedor * 100, 1)} %`)}
            </div>
            <div style={{ fontSize: 14, color: T.text2, marginTop: 10, lineHeight: 1.55, ...NUM }}>
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
            <div style={{ fontSize: 14, color: T.text2, marginTop: 8, lineHeight: 1.5 }}>{destinoA.contexto}</div>
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
            {formato === "pcm" && (
              <div style={{ marginTop: 12, color: COMPONENTES.some((c) => c.hz >= frec / 2) ? "#fed7aa" : OK, fontWeight: 700 }}>
                <i className={`fa-solid ${COMPONENTES.some((c) => c.hz >= frec / 2) ? "fa-triangle-exclamation" : "fa-circle-check"}`} style={{ marginRight: 7 }} />
                {COMPONENTES.some((c) => c.hz >= frec / 2)
                  ? `Con ${String(frec / 1000)} kHz de muestreo se pierden: ${COMPONENTES.filter((c) => c.hz >= frec / 2).map((c) => c.etq).join(", ")}. Quedan en rojo en la escena.`
                  : `Con ${String(frec / 1000)} kHz de muestreo caben todos los componentes de la voz.`}
              </div>
            )}
            <div className="ed-datos" style={{ marginTop: 14 }}>
              {dato(`Peso (${destinoA.minutos} min)`, bytesTxt(calcA.bytes), calcA.cumple.peso ? OK : WARN)}
              {dato("Tasa", `${num(calcA.bps / 1000, calcA.bps % 1000 ? 1 : 0)} kbps`)}
              {dato("Frecuencia más aguda", `${String(calcA.frecuenciaMax / 1000)} kHz`)}
              {dato("Rango dinámico", calcA.snrDb !== null ? `${num(calcA.snrDb, 1)} dB` : "—")}
            </div>
            <div style={{ fontSize: 14, color: T.text2, marginTop: 10, lineHeight: 1.55, ...NUM }}>
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

  const css = `
    .ed-opts { display:flex; flex-wrap:wrap; gap:8px; }
    .ed-opt { cursor:pointer; border:1px solid var(--edc); border-radius:10px; padding:10px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
    .ed-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
    .ed-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
    .ed-opt:disabled { cursor:default; }
    .ed-toggle { width:100%; cursor:pointer; border:1px solid var(--edc); border-radius:11px; padding:12px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
    .ed-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
    .ed-datos { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:8px; }
    .ed-mini { cursor:pointer; width:40px; height:40px; border-radius:8px; border:1px solid ${T.line}; background:rgba(4,10,22,0.45); color:#fff; font-size:14px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
    .ed-mini:hover:not(:disabled) { border-color:${accent}; background:rgba(${color.rgba},0.16); }
    .ed-mini:disabled { opacity:0.3; cursor:default; }
    .ed-cruz { display:grid; grid-template-areas: ". a ." "i . d" ". b ."; grid-template-columns: repeat(3,40px); grid-template-rows: repeat(3,40px); gap:3px; }
    .ed-capa { padding:9px 11px; border-radius:11px; border:1px solid var(--edc); background:rgba(4,10,22,0.42); transition:all .15s; }
    .ed-capa[data-vis="false"] { border-color:rgba(255,255,255,0.12); opacity:0.75; }
    .ed-opt:focus-visible, .ed-toggle:focus-visible, .ed-mini:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  `;

  const caja = (borde: string, fondo: string): React.CSSProperties => ({ borderRadius: 14, padding: "14px 16px", border: `1px solid ${borde}`, background: fondo });

  return (
    <>
      <style>{css}</style>
      <LabShell
        accent={accent}
        rgba={color.rgba}
        retoKey={RETO_KEY}
        escena={
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
        }
        modos={{
          opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq, icono: MODOS_DEF[m].icono })),
          valor: modo,
          cambiar: (id) => cambiarModo(id as Modo),
        }}
        herramientas={
          <>
            <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
            <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
          </>
        }
        lectura={chipVivo}
        objetivos={objetivos.map((o) => ({ txt: o.t, done: o.done }))}
        pestanas={[
          {
            id: "controles",
            etiqueta: "Controles",
            icono: "fa-sliders",
            contenido: (
              <Bloque titulo={`${def.etq} — ${modo === "medios" ? (sub === "video" ? "Video: peso, datos y destino" : "Audio: muestreo, bits y destino") : def.subtitulo}`} icono={def.icono}>
                <div style={{ color: T.text2, ...NUM }}>{pie}</div>
                {control}
              </Bloque>
            ),
          },
          {
            id: "reto",
            etiqueta: "Reto",
            icono: "fa-trophy",
            contenido: (
              <>
                <FormatoCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />
                <RetoNumericoCard reto={RETO_VIDEO} accent={accent} aprobado={retoOk} onAprobado={() => setRetoOk(true)} playSfx={sfx} />
                <RetoQuizCard quiz={QUIZ_A8} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes qué se necesita para crear contenido digital." />
                <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
                  <Eyebrow>
                    <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
                    Completa el texto (A6)
                  </Eyebrow>
                  <div style={{ marginTop: 12 }}>
                    <CompletaTexto
                      data={HUECOS_A6}
                      accent={accent}
                      rgba={color.rgba}
                      completado={textoOk}
                      onCompletado={() => {
                        setTextoOk(true);
                        sfx(true);
                      }}
                      onAcierto={blip}
                      onError={() => sfx(false)}
                    />
                  </div>
                </div>
              </>
            ),
          },
          {
            id: "teoria",
            etiqueta: "Teoría",
            icono: "fa-book-open",
            contenido: (
              <>
                <Bloque titulo="Difunde tu proyecto con lo que hay" icono="fa-photo-film">
                  <div style={{ color: T.text2 }}>{PROBLEMA}</div>
                </Bloque>
                <Bloque titulo="Lectura A1" icono="fa-book-open">
                  <div style={caja("#7dd3fc55", "rgba(125,211,252,0.07)")}>
                    <div style={{ color: "#fff", fontWeight: 800, marginBottom: 10 }}>{TITULO_A1}</div>
                    <div style={{ display: "grid", gap: 9 }}>
                      {LECTURA_A1.map((p, i) => (
                        <div key={i} style={{ color: T.text2 }}>{p}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.08em" }}>PARA REFLEXIONAR</div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: T.text2 }}>
                    {PREGUNTAS.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </Bloque>
                <Bloque titulo="Simulación A2 (inspiración)" icono="fa-people-roof">
                  <div style={caja("#c4b5fd55", "rgba(196,181,253,0.07)")}>
                    <div style={{ color: "#fff", fontWeight: 800, marginBottom: 8 }}>{SIMULACION_A2.titulo}</div>
                    <div style={{ color: T.text2 }}>{SIMULACION_A2.descripcion}</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", margin: "12px 0 6px" }}>VARIABLES QUE ESTE LABORATORIO EXPLORA</div>
                    <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6, color: T.text2 }}>
                      {SIMULACION_A2.variables.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                    <div style={{ color: "#e9d5ff", marginTop: 10, fontStyle: "italic" }}>{SIMULACION_A2.reflexion}</div>
                  </div>
                </Bloque>
                <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                  <div style={{ display: "grid", gap: 9 }}>
                    {INSTRUCCIONES.map((p, i) => (
                      <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ color: "#fff", minWidth: 0 }}>{p}</div>
                      </div>
                    ))}
                  </div>
                </Bloque>
                <Bloque titulo="Importante (lectura A1)" icono="fa-landmark">
                  <div style={caja(`${accent}33`, `rgba(${color.rgba},0.07)`)}>
                    <div style={{ color: T.text2 }}>{RECUADRO_A1}</div>
                  </div>
                </Bloque>
                <Bloque titulo="Hechos (quiz A4)" icono="fa-circle-question">
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: T.text2 }}>
                    {HECHOS.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </Bloque>
                <Bloque titulo="Glosario (A5)" icono="fa-book">
                  <div style={{ display: "grid", gap: 8 }}>
                    {GLOSARIO.map((gi, i) => (
                      <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                        <span style={{ fontWeight: 900, color: accent }}>{gi.termino}. </span>
                        <span style={{ color: T.text2 }}>{gi.definicion}</span>
                        <div style={{ color: T.text3, marginTop: 4 }}>
                          <i className="fa-solid fa-people-group" style={{ marginRight: 6, color: accent }} />
                          {gi.ejemplo}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ color: T.text2 }}>
                    <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
                  </div>
                </Bloque>
                <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 9, color: T.text2 }}>
                    {IDEAS.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                  <div style={caja(T.line, "rgba(4,10,22,0.4)")}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 6 }}>PREGUNTA DEL VIDEO A8</div>
                    <div style={{ color: "#fff" }}>{PREGUNTA_ABIERTA_A8}</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", margin: "12px 0 6px" }}>PARA CERRAR (AUTOEVALUACIÓN A7)</div>
                    <div style={{ color: "#fff" }}>{REFLEXION_A7}</div>
                  </div>
                </Bloque>
                <Bloque titulo="Ficha teórica" icono="fa-book">
                  <FichaTeorica data={ESTUDIO_EDICION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
                </Bloque>
                <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                  La lectura A1 con sus preguntas y su recuadro, la descripción de la simulación A2, los hechos del quiz A4, el glosario A5, el texto A6, la reflexión A7 y las preguntas del video A8 son <strong>verbatim</strong> del material de
                  la plataforma; la retroalimentación del cuestionario A8 y el reto de cálculo son del laboratorio. La foto y el logotipo son <strong>imágenes sintéticas</strong>, y los cálculos se hacen de verdad sobre ellas: peso = ancho × alto × bits ÷ 8,
                  compresión RLE contada byte a byte y compresión con la DCT y las tablas de cuantización de JPEG (ITU-T T.81, escaladas como libjpeg, sin submuestreo de color). El contraste usa la fórmula de las WCAG 2.x. Las tasas recomendadas de
                  video son las de la guía de subida de YouTube; los límites de cada destino (15 MB, 10 MB, calidad mínima) y el criterio «aceptable» (al menos la mitad de la tasa recomendada) son <strong>criterios ilustrativos</strong>, igual que
                  los bloques dibujados en los cuadros del video. Unidades del SI: 1 MB = 10⁶ bytes. Fuente: {FUENTE}
                </p>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
