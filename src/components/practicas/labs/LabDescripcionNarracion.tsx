"use client";

/**
 * Laboratorio — Taller de descripción y narración.
 * Práctica interactiva para LC-II-P02 (Lengua y Comunicación II, 2.º semestre):
 * «Escribe un texto descriptivo o narrativo de su autoría.»
 *
 * Por qué NO es un laboratorio 3D: el fenómeno de esta progresión es el OFICIO
 * de escribir —qué palabra elijo, en qué orden revelo lo que veo, qué convierte
 * una foto en un suceso—. Eso ocurre en el texto, no en el espacio; una escena
 * tridimensional aquí sería decoración. DOM puro: ligero y accesible con ratón,
 * teclado y pantalla táctil.
 *
 * Por qué no califica la escritura libre: un texto propio no se puede evaluar
 * con honestidad desde el navegador. Lo que sí se puede poner a prueba son las
 * DECISIONES que hay detrás de cada línea, y eso es lo que aquí se manipula. El
 * espacio de escritura propia existe al final, declarado opcional y sin nota.
 *
 * Seis modos, cuatro de ellos de oficio puro:
 *  1. «Del adjetivo al detalle» — cambia el relleno de una frase y ve, en el
 *     visor, qué imagen produce cada elección.
 *  2. «El orden de la mirada» — elige la ruta de una escena (ninguna es
 *     incorrecta) y ordena sus fragmentos en coherencia con tu propia decisión.
 *  3. «De la foto al suceso» — detecta qué pone en movimiento una descripción
 *     quieta y colócalo con el conector temporal que le corresponde.
 *  4. «El verbo que hunde» — señala el verbo comodín de una frase y sustitúyelo.
 *  5. «Escribe el término» — el glosario A5, escrito de memoria.
 *  6. «Completa el texto» — los huecos verbatim de A6.
 *  + Hechos verdadero/falso (A4), reto evaluable (A2) y el taller de escritura
 *    propia (A3), opcional y sin calificación.
 *
 * Hermano de contenido: `historia-de-vida-relato` (LC-II-P01) trabaja el
 * relato de la experiencia propia; este es el taller de oficio. No comparten
 * ni escenas ni ejemplos.
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow } from "./_kit";
import { LabSfx } from "./lab-audio";
import { CompletaTexto, normaliza } from "./_mecanica-huecos";
import { EscribeTermino } from "./_mecanica-termino";
import { DESCRIPCION_NARRACION_HUECOS } from "./descripcion-narracion-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { TableroObjetivos } from "./_objetivos";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { DESCRIPCION_NARRACION_FICHA } from "./descripcion-narracion-ficha";
import {
  FICHAS,
  RELLENO_INFO,
  ESCENAS,
  RUTA_INFO,
  CASOS,
  CONECTORES,
  ITEMS_VERBO,
  GLOSARIO,
  HECHOS,
  RETO_QUIZ,
  TALLER,
  COMODINES,
  COMPRENSION_A1,
  DATO_RULFO,
  type Ruta,
  type FichaDetalle,
  type Escena,
  type CasoSuceso,
  type ItemVerbo,
} from "./descripcion-narracion-data";

const NO = "#FF5E5E";
const RETO_KEY = "cen-taller-descripcion-narracion-reto";

type Modo = "detalle" | "mirada" | "accion" | "verbos" | "glosario" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "detalle", label: "Del adjetivo al detalle", icono: "fa-eye" },
  { id: "mirada", label: "El orden de la mirada", icono: "fa-arrow-down-wide-short" },
  { id: "accion", label: "De la foto al suceso", icono: "fa-play" },
  { id: "verbos", label: "El verbo que hunde", icono: "fa-anchor" },
  { id: "glosario", label: "Escribe el término", icono: "fa-spell-check" },
  { id: "texto", label: "Completa el texto", icono: "fa-pen-to-square" },
];

/** Palabras de verdad: se ignoran los espacios de sobra y los saltos de línea. */
function cuentaPalabras(s: string): number {
  const limpio = s.trim();
  return limpio === "" ? 0 : limpio.split(/\s+/).length;
}

/** Verbos comodín que aparecen en un borrador. No es una nota: es un espejo. */
function comodinesUsados(s: string): string[] {
  const t = ` ${normaliza(s)} `;
  return COMODINES.filter((c) => c.formas.some((f) => t.includes(` ${f} `))).map((c) => c.raiz);
}

export function LabDescripcionNarracion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("detalle");

  // ── sonido y partida ──────────────────────────────────────────────────
  const partida = usePartida();
  const [sonido, setSonido] = useState(false);
  const [drawer, setDrawer] = useState(false);
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

  // ── modo 1: del adjetivo al detalle ───────────────────────────────────
  const [fichaIdx, setFichaIdx] = useState(0);
  const [probado, setProbado] = useState<Record<string, string>>({});
  const [resueltas, setResueltas] = useState<string[]>([]);
  const ficha = FICHAS[fichaIdx]!;

  const probarRelleno = (fichaId: string, opcionId: string) => {
    const f = FICHAS.find((x) => x.id === fichaId);
    const op = f?.opciones.find((o) => o.id === opcionId);
    if (!f || !op) return;
    if (resueltas.includes(fichaId)) return;
    setProbado((p) => ({ ...p, [fichaId]: opcionId }));
    if (op.tipo === "detalle") {
      const nuevas = [...resueltas, fichaId];
      setResueltas(nuevas);
      sfxPlace(op.porque);
      if (nuevas.length >= FICHAS.length) sfxOk();
    } else {
      sfxNo(op.porque);
    }
  };
  const resetDetalle = () => {
    setProbado({});
    setResueltas([]);
    setPie(null);
  };

  // ── modo 2: el orden de la mirada ─────────────────────────────────────
  const [escIdx, setEscIdx] = useState(0);
  const [rutas, setRutas] = useState<Record<string, Ruta>>({});
  const [orden, setOrden] = useState<Record<string, string[]>>({});
  const [armadas, setArmadas] = useState<string[]>([]);
  const [selFrag, setSelFrag] = useState<string | null>(null);
  const [shakeFrag, setShakeFrag] = useState(false);

  const escena = ESCENAS[escIdx]!;
  const rutaEscena = rutas[escena.id] ?? null;
  const ordenEscena = orden[escena.id] ?? [];
  const fragmentosLibres = escena.fragmentos
    .filter((f) => !ordenEscena.includes(f.id))
    .slice()
    .sort((a, b) => a.texto.localeCompare(b.texto, "es"));

  /** Rango que toca colocar, según la ruta que el propio alumno eligió. */
  const rangoEsperado = (e: Escena, ruta: Ruta, colocados: number) =>
    ruta === "general" ? colocados + 1 : e.fragmentos.length - colocados;

  const elegirRuta = (ruta: Ruta) => {
    setRutas((r) => ({ ...r, [escena.id]: ruta }));
    setOrden((o) => ({ ...o, [escena.id]: [] }));
    setSelFrag(null);
    setPie({
      ok: true,
      txt: `Elegiste «${RUTA_INFO[ruta].label}». Ninguna de las dos rutas es incorrecta: lo que cambia es qué imagen se lleva el lector al final. Ahora coloca los fragmentos en ese orden.`,
    });
  };

  const intentarFragmento = (fragId: string) => {
    if (!rutaEscena) return;
    if (ordenEscena.includes(fragId)) return;
    const frag = escena.fragmentos.find((f) => f.id === fragId);
    if (!frag) return;
    const esperado = rangoEsperado(escena, rutaEscena, ordenEscena.length);
    if (frag.rango === esperado) {
      const nuevo = [...ordenEscena, fragId];
      setOrden((o) => ({ ...o, [escena.id]: nuevo }));
      setSelFrag(null);
      sfxPlace(
        rutaEscena === "general"
          ? "Bien: cada fragmento cierra un poco más el encuadre que el anterior."
          : "Bien: cada fragmento abre un poco más el encuadre que el anterior."
      );
      if (nuevo.length >= escena.fragmentos.length) {
        if (!armadas.includes(escena.id)) setArmadas((a) => [...a, escena.id]);
        setPie({ ok: true, txt: rutaEscena === "general" ? escena.cierreGeneral : escena.cierreDetalle });
        sfxOk();
      }
    } else {
      setShakeFrag(true);
      sfxNo(
        rutaEscena === "general"
          ? "Ese fragmento es más cerrado (o más abierto) de lo que toca. Vas de lo general al detalle: el siguiente tiene que abarcar un poco menos que el anterior."
          : "Ese fragmento no sigue tu ruta. Vas del detalle a lo general: el siguiente tiene que abarcar un poco más que el anterior."
      );
      window.setTimeout(() => setShakeFrag(false), 420);
    }
  };
  const resetMirada = () => {
    // Reiniciar esta escena también borra la ruta elegida: la decisión es el
    // primer paso del modo, y empezar de nuevo significa volver a decidirla.
    setRutas((r) => {
      const nx = { ...r };
      delete nx[escena.id];
      return nx;
    });
    setOrden((o) => ({ ...o, [escena.id]: [] }));
    setArmadas((a) => a.filter((id) => id !== escena.id));
    setSelFrag(null);
    setPie(null);
  };

  // ── modo 3: de la foto al suceso ──────────────────────────────────────
  const [casoIdx, setCasoIdx] = useState(0);
  const [sucesos, setSucesos] = useState<Record<string, string>>({});
  const [conectores, setConectores] = useState<Record<string, string>>({});
  const caso = CASOS[casoIdx]!;

  const elegirSuceso = (casoId: string, candId: string) => {
    const c = CASOS.find((x) => x.id === casoId);
    const cand = c?.candidatos.find((k) => k.id === candId);
    if (!c || !cand) return;
    if (sucesos[casoId]) return;
    if (cand.tipo === "cambio") {
      setSucesos((s) => ({ ...s, [casoId]: candId }));
      sfxPlace(cand.porque);
    } else {
      sfxNo(cand.porque);
    }
  };

  const elegirConector = (casoId: string, conId: string) => {
    const c = CASOS.find((x) => x.id === casoId);
    if (!c || !sucesos[casoId] || conectores[casoId]) return;
    if (c.conector === conId) {
      const nuevos = { ...conectores, [casoId]: conId };
      setConectores(nuevos);
      sfxPlace(c.porqueConector);
      if (Object.keys(nuevos).length >= CASOS.length) sfxOk();
    } else {
      const elegido = CONECTORES.find((k) => k.id === conId);
      sfxNo(
        elegido
          ? `«${elegido.texto}» significa: ${elegido.uso.toLowerCase()} Vuelve a leer la relación temporal que pide el caso.`
          : "Ese conector no corresponde a la relación temporal del caso."
      );
    }
  };
  const resetAccion = () => {
    setSucesos({});
    setConectores({});
    setPie(null);
  };

  // ── modo 4: el verbo que hunde ────────────────────────────────────────
  const [itemIdx, setItemIdx] = useState(0);
  const [senalados, setSenalados] = useState<Record<string, string>>({});
  const [reemplazos, setReemplazos] = useState<Record<string, string>>({});
  const item = ITEMS_VERBO[itemIdx]!;

  const senalarVerbo = (itemId: string, verboId: string) => {
    const it = ITEMS_VERBO.find((x) => x.id === itemId);
    if (!it || senalados[itemId]) return;
    if (it.hunde === verboId) {
      setSenalados((s) => ({ ...s, [itemId]: verboId }));
      sfxPlace(it.porqueHunde);
    } else {
      const nota = it.porqueNo.find((p) => p.verboId === verboId);
      sfxNo(nota ? nota.texto : "Ese verbo no es el problema de esta frase.");
    }
  };

  const elegirReemplazo = (itemId: string, repId: string) => {
    const it = ITEMS_VERBO.find((x) => x.id === itemId);
    const rep = it?.reemplazos.find((r) => r.id === repId);
    if (!it || !rep || !senalados[itemId] || reemplazos[itemId]) return;
    if (rep.ok) {
      const nuevos = { ...reemplazos, [itemId]: repId };
      setReemplazos(nuevos);
      sfxPlace(rep.porque);
      if (Object.keys(nuevos).length >= ITEMS_VERBO.length) sfxOk();
    } else {
      sfxNo(rep.porque);
    }
  };
  const resetVerbos = () => {
    setSenalados({});
    setReemplazos({});
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

  // ── hechos (A4) ───────────────────────────────────────────────────────
  const [hechos, setHechos] = useState<(boolean | null)[]>(() => HECHOS.map(() => null));
  const hechosResueltos = hechos.filter((h, i) => h !== null && h === HECHOS[i]!.respuesta).length;
  const hechosDone = hechosResueltos >= HECHOS.length;
  const responderHecho = (i: number, valor: boolean) => {
    const h = HECHOS[i]!;
    if (hechos[i] === h.respuesta) return;
    setHechos((prev) => prev.map((v, j) => (j === i ? valor : v)));
    if (valor === h.respuesta) sfxPlace(h.retro);
    else sfxNo(h.retro);
  };

  // ── taller de escritura propia (A3) — opcional, sin calificación ──────
  const [borrador, setBorrador] = useState("");
  const palabrasBorrador = cuentaPalabras(borrador);
  const comodinesBorrador = comodinesUsados(borrador);

  // ── reto evaluable (A2) ───────────────────────────────────────────────
  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso ──────────────────────────────────────────────────────────
  const detalleDone = resueltas.length >= FICHAS.length;
  const miradaDone = armadas.length >= ESCENAS.length;
  const sucesosDone = Object.keys(sucesos).length >= CASOS.length;
  const conectoresDone = Object.keys(conectores).length >= CASOS.length;
  const verbosSenaladosDone = Object.keys(senalados).length >= ITEMS_VERBO.length;
  const verbosDone = Object.keys(reemplazos).length >= ITEMS_VERBO.length;

  const objetivos = [
    { txt: `Cambia los ${FICHAS.length} adjetivos genéricos por un detalle`, done: detalleDone },
    { txt: `Arma las ${ESCENAS.length} escenas en la ruta que elegiste`, done: miradaDone },
    { txt: `Encuentra el suceso en los ${CASOS.length} casos`, done: sucesosDone },
    { txt: `Coloca los ${CASOS.length} conectores temporales`, done: conectoresDone },
    { txt: `Señala los ${ITEMS_VERBO.length} verbos que hunden la frase`, done: verbosSenaladosDone },
    { txt: `Sustituye los ${ITEMS_VERBO.length} verbos por uno preciso`, done: verbosDone },
    { txt: `Escribe los ${GLOSARIO.length} términos del glosario`, done: glosarioDone },
    { txt: "Completa el texto de la progresión", done: textoDone },
    { txt: `Acierta los ${HECHOS.length} hechos verdadero o falso`, done: hechosDone },
    { txt: "Aprueba el reto evaluable (70 %)", done: quizAprobado },
  ];

  const resetActual =
    modo === "detalle"
      ? resetDetalle
      : modo === "mirada"
        ? resetMirada
        : modo === "accion"
          ? resetAccion
          : modo === "verbos"
            ? resetVerbos
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

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes tdnShake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
        @keyframes tdnPop { 0%{transform:scale(.6);opacity:0;} 100%{transform:scale(1);opacity:1;} }
        .tdn-tab { cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:10px 15px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:13px; font-weight:800; transition:all .14s; }
        .tdn-tab:hover { border-color:${T.lineStrong}; color:#fff; }
        .tdn-tab[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .tdn-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:1px solid ${T.line}; background:${T.glass}; color:rgba(255,255,255,0.7); transition:all .15s; }
        .tdn-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; border-color:${accent}; }
        .tdn-icobtn:hover { background:rgba(255,255,255,0.12); }
        .tdn-prob { cursor:pointer; padding:8px 13px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .tdn-prob:hover { border-color:${T.lineStrong}; color:#fff; }
        .tdn-prob[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .tdn-prob[data-done="true"] { color:${OK}; border-color:${OK}66; }
        .tdn-opt { cursor:pointer; display:flex; align-items:flex-start; gap:12px; width:100%; text-align:left;
          border-radius:13px; border:1.5px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-size:13.5px; line-height:1.5; font-weight:600; padding:13px 16px; transition:all .14s; }
        .tdn-opt:hover:not(:disabled) { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .tdn-opt:disabled { cursor:default; }
        .tdn-opt[data-ok="true"] { border-color:${OK}; background:${OK}16; color:#fff; }
        .tdn-opt[data-bad="true"] { border-color:${NO}; background:${NO}14; color:#fff; animation:tdnShake .4s; }
        .tdn-card { cursor:grab; display:block; padding:12px 15px; border-radius:13px; border:1.5px solid ${T.line};
          background:${T.glassSoft}; color:${T.text}; font-size:13px; line-height:1.5; text-align:left; transition:all .14s; user-select:none; width:100%; }
        .tdn-card:hover { border-color:${T.lineStrong}; background:rgba(255,255,255,0.07); transform:translateY(-2px); }
        .tdn-card[data-sel="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); box-shadow:0 0 16px -5px ${accent}; transform:translateY(-3px); }
        .tdn-card:active { cursor:grabbing; }
        .tdn-slot { border-radius:12px; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; min-height:56px;
          display:flex; align-items:center; justify-content:center; color:${T.text3}; font-size:12.5px; gap:8px; transition:all .16s; padding:8px 12px; }
        .tdn-slot[data-active="true"] { border-color:${accent}; background:rgba(${color.rgba},0.1); cursor:pointer; }
        .tdn-slot[data-shake="true"] { animation:tdnShake .4s; border-color:${NO}; }
        .tdn-verbo { cursor:pointer; border:1.5px dashed ${T.lineStrong}; background:${T.inset}; color:#fff;
          border-radius:8px; padding:2px 8px; font-size:inherit; font-weight:800; font-family:inherit; transition:all .14s; }
        .tdn-verbo:hover:not(:disabled) { border-color:${accent}; background:rgba(${color.rgba},0.18); }
        .tdn-verbo:disabled { cursor:default; }
        .tdn-verbo[data-hunde="true"] { border-style:solid; border-color:${NO}; background:${NO}22; }
        .tdn-chip { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:10px 15px; border-radius:999px;
          border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff; font-size:13px; font-weight:800; transition:all .14s; }
        .tdn-chip:hover:not(:disabled) { border-color:${T.lineStrong}; background:rgba(255,255,255,0.09); transform:translateY(-2px); }
        .tdn-chip:disabled { cursor:default; opacity:.55; }
        .tdn-chip[data-on="true"] { border-color:${OK}; background:${OK}1f; color:#fff; opacity:1; }
        .tdn-ruta { cursor:pointer; text-align:left; width:100%; border:1.5px solid ${T.line}; background:${T.glass};
          border-radius:14px; padding:14px 16px; color:${T.text2}; font-size:13.5px; line-height:1.5; transition:all .15s; }
        .tdn-ruta:hover { border-color:${T.lineStrong}; color:#fff; }
        .tdn-ruta[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 18px -7px ${accent}; }
        .tdn-vf { cursor:pointer; padding:8px 16px; border-radius:10px; border:1.5px solid ${T.line}; background:${T.glass};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .14s; }
        .tdn-vf:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
        .tdn-vf:disabled { cursor:default; opacity:.85; }
        .tdn-vf[data-on="true"] { border-color:${OK}; background:${OK}1f; color:#fff; }
        .tdn-vf[data-bad="true"] { border-color:${NO}; background:${NO}1f; color:#fff; }
        .tdn-ta { width:100%; min-height:210px; resize:vertical; border-radius:13px; border:1.5px solid ${T.lineStrong};
          background:${T.inset}; color:#fff; font-size:14.5px; line-height:1.75; padding:14px 16px; font-family:inherit; outline:none; transition:all .15s; }
        .tdn-ta:focus { border-color:${accent}; box-shadow:0 0 0 3px rgba(${color.rgba},0.18); }
        .tdn-ta::placeholder { color:rgba(255,255,255,0.28); }
        .tdn-divider { height:1px; background:${T.line}; margin:18px 0; }
        .tdn-barra { height:9px; border-radius:999px; background:${T.inset}; border:1px solid ${T.line}; overflow:hidden; }
        .tdn-barra > span { display:block; height:100%; border-radius:999px; transition:width .45s cubic-bezier(.4,0,.2,1), background .35s; }
        @media (prefers-reduced-motion: reduce){
          .tdn-slot[data-shake="true"], .tdn-opt[data-bad="true"] { animation:none; }
          .tdn-card, .tdn-card:hover, .tdn-card[data-sel="true"], .tdn-chip:hover { transform:none; }
          .tdn-barra > span { transition:none; }
        }

        /* Cajón de teoría */
        .tdn-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .tdn-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .tdn-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .tdn-drawer[data-open="true"] { transform:translateX(0); }
        .tdn-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .tdn-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .tdn-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .tdn-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .tdn-teoria-fab { position:fixed; right:20px; bottom:20px; z-index:58; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.86); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .tdn-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
        @media (max-width: 640px){ .tdn-teoria-fab { right:12px; bottom:12px; padding:10px 13px; font-size:12px; } }

        @media (max-width: 900px){ .tdn-grid { grid-template-columns:minmax(0,1fr) !important; } }
      `}</style>

      {/* ── Barra de modos y herramientas ───────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {MODOS.map((m) => (
          <button key={m.id} className="tdn-tab" data-on={modo === m.id} onClick={() => setModo(m.id)}>
            <i className={`fa-solid ${m.icono}`} />
            {m.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
        <button className="tdn-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría de la práctica">
          <i className="fa-solid fa-book-open" />
        </button>
        <button className="tdn-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
          <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
        </button>
        <button className="tdn-icobtn" onClick={resetActual} title="Reiniciar este modo">
          <i className="fa-solid fa-rotate-left" />
        </button>
      </div>

      {/* ── Cajón de teoría ─────────────────────────────────────────────── */}
      <button className="tdn-teoria-fab" onClick={() => setDrawer(true)}>
        <i className="fa-solid fa-book-open" />
        Teoría
      </button>
      <div className="tdn-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="tdn-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="tdn-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="tdn-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="tdn-drawer-body">
          <FichaTeorica data={DESCRIPCION_NARRACION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>

      <div
        className="tdn-grid"
        style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,28vw,400px)", gap: 22, alignItems: "start" }}
      >
        {/* ── Columna principal ─────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {modo === "detalle" && (
            <DetallePanel
              accent={accent}
              rgba={color.rgba}
              ficha={ficha}
              fichaIdx={fichaIdx}
              resueltas={resueltas}
              probado={probado}
              onSelFicha={(i) => {
                setFichaIdx(i);
                setPie(null);
              }}
              onProbar={(opId) => probarRelleno(ficha.id, opId)}
            />
          )}

          {modo === "mirada" && (
            <MiradaPanel
              accent={accent}
              escena={escena}
              escIdx={escIdx}
              armadas={armadas}
              ruta={rutaEscena}
              ordenEscena={ordenEscena}
              fragmentosLibres={fragmentosLibres}
              selFrag={selFrag}
              shakeFrag={shakeFrag}
              onSelEscena={(i) => {
                setEscIdx(i);
                setSelFrag(null);
                setPie(null);
              }}
              onRuta={elegirRuta}
              onSelFrag={(id) => setSelFrag((s) => (s === id ? null : id))}
              onSlot={() => {
                if (selFrag) intentarFragmento(selFrag);
              }}
              onDropSlot={(id) => intentarFragmento(id)}
              dragProps={dragProps}
              dropProps={dropProps}
            />
          )}

          {modo === "accion" && (
            <AccionPanel
              accent={accent}
              rgba={color.rgba}
              caso={caso}
              casoIdx={casoIdx}
              sucesos={sucesos}
              conectores={conectores}
              onSelCaso={(i) => {
                setCasoIdx(i);
                setPie(null);
              }}
              onSuceso={(id) => elegirSuceso(caso.id, id)}
              onConector={(id) => elegirConector(caso.id, id)}
            />
          )}

          {modo === "verbos" && (
            <VerbosPanel
              accent={accent}
              item={item}
              itemIdx={itemIdx}
              senalados={senalados}
              reemplazos={reemplazos}
              onSelItem={(i) => {
                setItemIdx(i);
                setPie(null);
              }}
              onSenalar={(vid) => senalarVerbo(item.id, vid)}
              onReemplazo={(rid) => elegirReemplazo(item.id, rid)}
            />
          )}

          {modo === "glosario" && (
            <div style={{ ...card, padding: "20px 22px" }}>
              <Eyebrow>
                <i className="fa-solid fa-spell-check" style={{ marginRight: 8, color: accent }} />
                Glosario de la progresión · LC-II-P02-A5
              </Eyebrow>
              <EscribeTermino
                key={glosarioIntento}
                pares={GLOSARIO}
                accent={accent}
                rgba={color.rgba}
                completado={glosarioDone}
                instrucciones="Lee la definición y su ejemplo, y escribe el término que le corresponde. Se ignoran acentos y mayúsculas."
                onCompletado={() => {
                  setGlosarioDone(true);
                  setPie({
                    ok: true,
                    txt: "Completaste el glosario de memoria. Esos cinco términos describen el proceso entero: decidir el sentido comunicativo, organizar las ideas, escribir el borrador y revisarlo.",
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
              data={DESCRIPCION_NARRACION_HUECOS}
              accent={accent}
              rgba={color.rgba}
              completado={textoDone}
              onCompletado={() => {
                setTextoDone(true);
                setPie({
                  ok: true,
                  txt: "Texto completo. Ese párrafo es el plan de trabajo de cualquier escrito: primero se ordena, luego se decide para qué, después se arriesga un borrador y al final se revisa.",
                });
                sfxOk();
              }}
              onAcierto={() => sfxPlace()}
              onError={() => sfxNo()}
            />
          )}

          {/* Pie: la última explicación, siempre a la vista */}
          <div
            role="status"
            aria-live="polite"
            style={{
              borderRadius: 14,
              border: `1px solid ${pie ? (pie.ok ? `${OK}55` : `${NO}55`) : T.line}`,
              background: pie ? (pie.ok ? `${OK}12` : `${NO}12`) : T.glass,
              padding: "13px 16px",
              fontSize: 13,
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
              {pie
                ? pie.txt
                : "Aquí aparecerá la explicación de cada decisión: por qué un detalle hace imagen y un adjetivo no, y por qué ese verbo hunde la frase."}
            </span>
          </div>

          <ChuletaCard modo={modo} accent={accent} />
        </div>

        {/* ── Columna lateral ───────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "20px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
              Objetivos de la sesión
            </Eyebrow>
            <TableroObjetivos objetivos={objetivos} retoKey={RETO_KEY} accent={accent} />
          </div>

          {/* Qué se practica en el modo actual */}
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
              {modo === "detalle" && (
                <>
                  Un adjetivo dice lo que tú sentiste; un <strong style={{ color: T.text }}>detalle concreto</strong> deja que el
                  lector lo sienta solo. Prueba los tres rellenos y mira el visor: la imagen cambia de verdad.
                </>
              )}
              {modo === "mirada" && (
                <>
                  Describir es decidir el <strong style={{ color: T.text }}>orden</strong> en que se revela lo que ves. Elige tu
                  ruta —ninguna es incorrecta— y sé coherente con ella: lo último que se lee es lo que queda.
                </>
              )}
              {modo === "accion" && (
                <>
                  Describir muestra un <strong style={{ color: T.text }}>estado</strong>; narrar cuenta un{" "}
                  <strong style={{ color: T.text }}>cambio</strong>. Busca qué rompe la quietud y colócalo en el tiempo con el
                  conector que corresponde.
                </>
              )}
              {modo === "verbos" && (
                <>
                  En una narración el <strong style={{ color: T.text }}>verbo carga la acción</strong>. Cuando es un comodín
                  —hacer, haber, estar, poner, tener— la escena se apaga aunque todo lo demás esté bien escrito.
                </>
              )}
              {modo === "glosario" && (
                <>
                  Recordar el término es más difícil —y enseña más— que reconocerlo entre opciones. Si te atoras, usa la pista o
                  abre el <strong style={{ color: T.text }}>banco de términos</strong>.
                </>
              )}
              {modo === "texto" && (
                <>
                  Lee el párrafo completo antes de escribir: el contexto decide la palabra. Pulsa{" "}
                  <strong style={{ color: T.text }}>Enter</strong> para comprobar cada hueco.
                </>
              )}
            </span>
          </div>

          {/* Dato verbatim del callout de A1 */}
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
            <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 16, marginTop: 1 }} />
            <span>
              <strong style={{ color: T.text }}>¿Sabías?</strong> {DATO_RULFO}
            </span>
          </div>

          {/* Preguntas de comprensión de la lectura A1 (verbatim) */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open-reader" style={{ marginRight: 8, color: accent }} />
              Lectura A1 · para pensar
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {COMPRENSION_A1.map((c, i) => (
                <details key={i} style={{ borderRadius: 11, border: `1px solid ${T.line}`, background: T.inset, padding: "10px 13px" }}>
                  <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 700, color: T.text2, lineHeight: 1.45 }}>
                    {c.pregunta}
                  </summary>
                  <p style={{ margin: "9px 0 0", fontSize: 12.5, color: T.text3, lineHeight: 1.5 }}>{c.guia}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      <HechosCard accent={accent} respuestas={hechos} onResponder={responderHecho} />

      <RetoQuizCard
        quiz={RETO_QUIZ}
        accent={accent}
        rgba={color.rgba}
        aprobado={quizAprobado}
        onAprobado={() => setQuizAprobado(true)}
        playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined}
        mensajeAprobado="Distingues describir de narrar, que es la decisión de la que cuelga todo lo demás."
      />

      <TallerCard
        accent={accent}
        rgba={color.rgba}
        valor={borrador}
        palabras={palabrasBorrador}
        comodines={comodinesBorrador}
        onEscribir={setBorrador}
      />

      {/* Nota al pie: qué es verbatim y qué es de este laboratorio */}
      <p style={{ margin: "20px 2px 0", fontSize: 11.5, lineHeight: 1.6, color: T.text3 }}>
        <i className="fa-solid fa-quote-right" style={{ marginRight: 7, opacity: 0.7 }} />
        <strong style={{ color: T.text2 }}>Verbatim de la progresión LC-II-P02:</strong> la lectura A1 (marco teórico de la
        ficha, sus preguntas de comprensión, el callout sobre Rulfo y los cinco conectores temporales), el reto evaluable A2, la
        consigna, las pistas y los criterios del taller A3, los hechos verdadero/falso A4, el glosario A5 y el texto con huecos
        A6.{" "}
        <strong style={{ color: T.text2 }}>Escrito para este laboratorio (ilustrativo):</strong> todas las frases, escenas y
        casos de los cuatro modos de oficio. Son situaciones verosímiles de un entorno mexicano cotidiano; ninguna persona,
        comercio ni institución es real y no se cita textualmente a ningún autor. El cuento de Juan Rulfo se menciona porque la
        lectura A1 lo comenta, pero no se reproduce aquí ninguna de sus líneas: citar de memoria a un autor real es la forma más
        fácil de atribuirle algo que no escribió.{" "}
        <strong style={{ color: T.text2 }}>Lo que este laboratorio NO califica:</strong> el texto que escribas en el taller
        final. Un texto propio no se puede evaluar con honestidad desde el navegador, así que no se intenta; lo evaluable son
        las decisiones de oficio de los seis modos, el reto A2 y los hechos A4.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Chuleta del modo — la referencia que el alumno necesita a la mano.
 *
 * No es relleno visual: en los cuatro modos de oficio hay que distinguir
 * categorías (tipos de relleno, rutas, conectores, verbos comodín) y tenerlas
 * delante evita que la práctica se convierta en adivinar. En los dos modos de
 * escritura no aparece, porque ahí el andamiaje ya lo dan la pista y el banco.
 * ═══════════════════════════════════════════════════════════════════════════ */
const COMODIN_NOTAS: { verbo: string; nota: string }[] = [
  { verbo: "hacer", nota: "sirve para cualquier acción, así que no muestra ninguna" },
  { verbo: "haber", nota: "solo informa de que algo existe" },
  { verbo: "estar", nota: "deja a los personajes quietos, sin intención" },
  { verbo: "poner", nota: "no dice cómo se hizo, y el cómo es casi toda la información" },
  { verbo: "tener", nota: "indica posesión donde hacía falta un gesto" },
];

function ChuletaCard({ modo, accent }: { modo: Modo; accent: string }) {
  if (modo === "glosario" || modo === "texto") return null;

  const filas: { titulo: string; nota: string; color: string; icono: string }[] =
    modo === "detalle"
      ? (["detalle", "generico", "juicio"] as const).map((t) => ({
          titulo: RELLENO_INFO[t].label,
          color: RELLENO_INFO[t].color,
          icono: RELLENO_INFO[t].icono,
          nota:
            t === "detalle"
              ? "Dato verificable por los sentidos. El lector construye la imagen solo."
              : t === "generico"
                ? "Cabe en cualquier cosa. Sube el volumen sin añadir información."
                : "Conclusión tuya entregada como descripción. Le quita el hallazgo al lector.",
        }))
      : modo === "mirada"
        ? (["general", "detalle"] as Ruta[]).map((r) => ({
            titulo: RUTA_INFO[r].label,
            color: RUTA_INFO[r].color,
            icono: RUTA_INFO[r].icono,
            nota: RUTA_INFO[r].descripcion,
          }))
        : modo === "accion"
          ? CONECTORES.map((c) => ({ titulo: c.texto, nota: c.uso, color: accent, icono: "fa-link" }))
          : COMODIN_NOTAS.map((c) => ({ titulo: c.verbo, nota: c.nota, color: NO, icono: "fa-anchor" }));

  const titulo =
    modo === "detalle"
      ? "Los tres rellenos posibles"
      : modo === "mirada"
        ? "Las dos rutas de la mirada"
        : modo === "accion"
          ? "Los cinco conectores temporales (lectura A1)"
          : "Los cinco verbos comodín";

  return (
    <div style={{ ...card, padding: "18px 22px" }}>
      <Eyebrow>
        <i className="fa-solid fa-table-list" style={{ marginRight: 8, color: accent }} />
        {titulo}
      </Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 10 }}>
        {filas.map((f) => (
          <div
            key={f.titulo}
            style={{
              borderRadius: 12,
              border: `1px solid ${f.color}44`,
              background: `${f.color}0d`,
              padding: "11px 14px",
              display: "flex",
              gap: 11,
              alignItems: "flex-start",
            }}
          >
            <i className={`fa-solid ${f.icono}`} style={{ color: f.color, fontSize: 13, marginTop: 3 }} />
            <span>
              <strong style={{ display: "block", fontSize: 13, color: "#fff", marginBottom: 3 }}>{f.titulo}</strong>
              <span style={{ fontSize: 12, lineHeight: 1.5, color: T.text3 }}>{f.nota}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — «Del adjetivo al detalle»
 * ═══════════════════════════════════════════════════════════════════════════ */
function DetallePanel({
  accent,
  rgba,
  ficha,
  fichaIdx,
  resueltas,
  probado,
  onSelFicha,
  onProbar,
}: {
  accent: string;
  rgba: string;
  ficha: FichaDetalle;
  fichaIdx: number;
  resueltas: string[];
  probado: Record<string, string>;
  onSelFicha: (i: number) => void;
  onProbar: (opcionId: string) => void;
}) {
  const elegidoId = probado[ficha.id] ?? null;
  const elegido = elegidoId ? (ficha.opciones.find((o) => o.id === elegidoId) ?? null) : null;
  const resuelta = resueltas.includes(ficha.id);
  const nitidez = elegido ? elegido.nitidez : 0;
  const colorNitidez = nitidez >= 80 ? OK : nitidez >= 40 ? "#FF8A3C" : T.lineStrong;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {FICHAS.map((f, i) => (
          <button key={f.id} className="tdn-prob" data-on={fichaIdx === i} data-done={resueltas.includes(f.id)} onClick={() => onSelFicha(i)}>
            {resueltas.includes(f.id) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {f.titulo}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 800, color: resueltas.length >= FICHAS.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
          {resueltas.length}/{FICHAS.length}
        </span>
      </div>

      {/* Visor: la frase con el relleno que se está probando */}
      <div
        style={{
          ...card,
          padding: "22px 24px",
          background: `radial-gradient(120% 120% at 0% 0%, rgba(${rgba},0.10) 0%, transparent 55%), ${T.glass}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <Eyebrow>
            <i className="fa-solid fa-image" style={{ marginRight: 8, color: accent }} />
            Visor · qué ve el lector
          </Eyebrow>
          {elegido && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: RELLENO_INFO[elegido.tipo].color,
                border: `1px solid ${RELLENO_INFO[elegido.tipo].color}66`,
                background: `${RELLENO_INFO[elegido.tipo].color}18`,
                borderRadius: 999,
                padding: "5px 12px",
              }}
            >
              <i className={`fa-solid ${RELLENO_INFO[elegido.tipo].icono}`} style={{ marginRight: 7 }} />
              {RELLENO_INFO[elegido.tipo].label}
            </span>
          )}
        </div>

        <p style={{ margin: 0, fontSize: 19, lineHeight: 1.6, color: T.text, fontWeight: 600 }}>
          {ficha.antes}
          <span
            style={{
              borderRadius: 9,
              padding: "1px 9px",
              border: `1.5px ${elegido ? "solid" : "dashed"} ${elegido ? RELLENO_INFO[elegido.tipo].color : T.lineStrong}`,
              background: elegido ? `${RELLENO_INFO[elegido.tipo].color}1f` : T.inset,
              color: elegido ? "#fff" : T.text3,
              transition: "all .2s",
            }}
          >
            {elegido ? elegido.texto : "…"}
          </span>
          {ficha.despues}
        </p>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: T.text3, marginBottom: 7 }}>
            <span>Nitidez de la imagen</span>
            <span style={{ fontVariantNumeric: "tabular-nums", color: colorNitidez }}>{nitidez}%</span>
          </div>
          <div className="tdn-barra">
            <span style={{ width: `${nitidez}%`, background: colorNitidez }} />
          </div>
          <div style={{ marginTop: 11, fontSize: 13.5, lineHeight: 1.55, color: T.text2, display: "flex", gap: 10, alignItems: "flex-start", minHeight: 42 }}>
            <i className="fa-solid fa-eye" style={{ color: elegido ? colorNitidez : T.text3, marginTop: 3, fontSize: 13 }} />
            <span>{elegido ? elegido.imagen : "Elige un relleno abajo y aquí verás qué imagen produce en la cabeza de quien lee."}</span>
          </div>
        </div>
      </div>

      {/* Los tres rellenos */}
      <div style={{ ...card, padding: "18px 22px" }}>
        <Eyebrow>Elige con qué rellenas el hueco</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ficha.opciones.map((op) => {
            const esElegido = elegidoId === op.id;
            return (
              <button
                key={op.id}
                className="tdn-opt"
                data-ok={resuelta && op.tipo === "detalle"}
                data-bad={esElegido && op.tipo !== "detalle"}
                disabled={resuelta}
                onClick={() => onProbar(op.id)}
              >
                <i
                  className={`fa-solid ${resuelta && op.tipo === "detalle" ? "fa-circle-check" : esElegido && op.tipo !== "detalle" ? "fa-circle-xmark" : "fa-circle"}`}
                  style={{ marginTop: 3, fontSize: 14, color: resuelta && op.tipo === "detalle" ? OK : esElegido && op.tipo !== "detalle" ? NO : T.text3, opacity: esElegido || resuelta ? 1 : 0.4 }}
                />
                <span style={{ flex: 1 }}>{op.texto}</span>
              </button>
            );
          })}
        </div>
        {resuelta && (
          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text3, lineHeight: 1.55, borderTop: `1px solid ${T.line}`, paddingTop: 12 }}>
            <i className="fa-solid fa-arrow-right" style={{ marginRight: 8, color: accent }} />
            {fichaIdx < FICHAS.length - 1 ? "Pasa a la siguiente frase con los botones de arriba." : "Terminaste las seis frases: cambia de modo para seguir."}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — «El orden de la mirada»
 * ═══════════════════════════════════════════════════════════════════════════ */
function MiradaPanel({
  accent,
  escena,
  escIdx,
  armadas,
  ruta,
  ordenEscena,
  fragmentosLibres,
  selFrag,
  shakeFrag,
  onSelEscena,
  onRuta,
  onSelFrag,
  onSlot,
  onDropSlot,
  dragProps,
  dropProps,
}: {
  accent: string;
  escena: Escena;
  escIdx: number;
  armadas: string[];
  ruta: Ruta | null;
  ordenEscena: string[];
  fragmentosLibres: Escena["fragmentos"];
  selFrag: string | null;
  shakeFrag: boolean;
  onSelEscena: (i: number) => void;
  onRuta: (r: Ruta) => void;
  onSelFrag: (id: string) => void;
  onSlot: () => void;
  onDropSlot: (id: string) => void;
  dragProps: (id: string) => Record<string, unknown>;
  dropProps: (onDrop: (id: string) => void) => Record<string, unknown>;
}) {
  const completa = armadas.includes(escena.id);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {ESCENAS.map((e, i) => (
          <button key={e.id} className="tdn-prob" data-on={escIdx === i} data-done={armadas.includes(e.id)} onClick={() => onSelEscena(i)}>
            {armadas.includes(e.id) && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {e.titulo}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 800, color: armadas.length >= ESCENAS.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
          {armadas.length}/{ESCENAS.length}
        </span>
      </div>

      {/* Paso 1: elegir la ruta */}
      <div style={{ ...card, padding: "20px 22px" }}>
        <Eyebrow>
          <i className="fa-solid fa-route" style={{ marginRight: 8, color: accent }} />
          Paso 1 · elige tu ruta (ninguna es incorrecta)
        </Eyebrow>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.55, color: T.text2 }}>{escena.contexto}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))", gap: 12 }}>
          {(["general", "detalle"] as Ruta[]).map((r) => {
            const info = RUTA_INFO[r];
            return (
              <button key={r} type="button" className="tdn-ruta" data-on={ruta === r} onClick={() => onRuta(r)}>
                <span style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                  <i className={`fa-solid ${info.icono}`} style={{ marginTop: 3, fontSize: 15, color: ruta === r ? accent : info.color }} />
                  <span>
                    <strong style={{ color: "#fff", display: "block", marginBottom: 3 }}>{info.label}</strong>
                    {info.descripcion}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {ruta && (
        <>
          {/* Paso 2: ordenar */}
          <div style={{ ...card, padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
              <Eyebrow>
                <i className="fa-solid fa-arrow-down-wide-short" style={{ marginRight: 8, color: accent }} />
                Paso 2 · «{escena.titulo}» en la ruta «{RUTA_INFO[ruta].label}»
              </Eyebrow>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: completa ? OK : T.text3 }}>
                {completa ? "Escena montada ✓" : `${ordenEscena.length}/${escena.fragmentos.length} fragmentos`}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {escena.fragmentos.map((_, i) => {
                const colocadoId = ordenEscena[i];
                const frag = colocadoId ? escena.fragmentos.find((f) => f.id === colocadoId) : null;
                const esActivo = i === ordenEscena.length;
                const esUltimo = i === escena.fragmentos.length - 1;
                return (
                  <div key={i}>
                    {i > 0 && (
                      <div style={{ textAlign: "center", color: T.text3, lineHeight: 0.6, margin: "1px 0" }}>
                        <i className="fa-solid fa-arrow-down" style={{ fontSize: 11, opacity: frag || i <= ordenEscena.length ? 0.7 : 0.2 }} />
                      </div>
                    )}
                    {frag ? (
                      <div
                        style={{
                          animation: "tdnPop .25s ease",
                          padding: "12px 15px",
                          borderRadius: 13,
                          border: `1.5px solid ${esUltimo ? accent : `${RUTA_INFO[ruta].color}66`}`,
                          background: esUltimo ? `${accent}1a` : `${RUTA_INFO[ruta].color}12`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                          <span
                            style={{
                              width: 22,
                              height: 22,
                              flexShrink: 0,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 900,
                              background: `${RUTA_INFO[ruta].color}33`,
                              color: "#fff",
                            }}
                          >
                            {i + 1}
                          </span>
                          {esUltimo && (
                            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: accent }}>
                              <i className="fa-solid fa-flag-checkered" style={{ marginRight: 6 }} />
                              Lo que se lleva el lector
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#fff" }}>{frag.texto}</div>
                      </div>
                    ) : (
                      <div
                        className="tdn-slot"
                        data-active={esActivo}
                        data-shake={esActivo && shakeFrag}
                        onClick={() => esActivo && onSlot()}
                        {...(esActivo ? dropProps((id) => onDropSlot(id)) : {})}
                      >
                        {esActivo ? (
                          <>
                            <i className="fa-solid fa-arrow-down-to-bracket" /> Suelta aquí el fragmento {i + 1}
                          </>
                        ) : (
                          <span style={{ opacity: 0.4 }}>Fragmento {i + 1}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ ...card, padding: "18px 22px" }}>
            <Eyebrow>Fragmentos disponibles — arrástralos en tu orden</Eyebrow>
            {fragmentosLibres.length === 0 ? (
              <div style={{ fontSize: 13.5, color: OK, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
                <i className="fa-solid fa-circle-check" /> ¡Escena montada! Cambia de escena arriba, o vuelve a montar esta con la otra ruta.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {fragmentosLibres.map((f) => (
                  <button key={f.id} className="tdn-card" data-sel={selFrag === f.id} onClick={() => onSelFrag(f.id)} {...dragProps(f.id)}>
                    {f.texto}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — «De la foto al suceso»
 * ═══════════════════════════════════════════════════════════════════════════ */
function AccionPanel({
  accent,
  rgba,
  caso,
  casoIdx,
  sucesos,
  conectores,
  onSelCaso,
  onSuceso,
  onConector,
}: {
  accent: string;
  rgba: string;
  caso: CasoSuceso;
  casoIdx: number;
  sucesos: Record<string, string>;
  conectores: Record<string, string>;
  onSelCaso: (i: number) => void;
  onSuceso: (id: string) => void;
  onConector: (id: string) => void;
}) {
  const sucesoId = sucesos[caso.id] ?? null;
  const conectorId = conectores[caso.id] ?? null;
  const hechos = CASOS.filter((c) => sucesos[c.id] && conectores[c.id]).length;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {CASOS.map((c, i) => {
          const listo = Boolean(sucesos[c.id] && conectores[c.id]);
          return (
            <button key={c.id} className="tdn-prob" data-on={casoIdx === i} data-done={listo} onClick={() => onSelCaso(i)}>
              {listo && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
              {c.titulo}
            </button>
          );
        })}
        <span style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 800, color: hechos >= CASOS.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
          {hechos}/{CASOS.length}
        </span>
      </div>

      {/* La foto */}
      <div style={{ ...card, padding: "20px 24px" }}>
        <Eyebrow>
          <i className="fa-solid fa-camera" style={{ marginRight: 8, color: accent }} />
          La foto · descripción quieta
        </Eyebrow>
        <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: T.text2, fontStyle: "italic" }}>{caso.estatica}</p>
      </div>

      {/* Paso 1: qué la pone en movimiento */}
      <div style={{ ...card, padding: "20px 22px" }}>
        <Eyebrow>Paso 1 · ¿cuál de las tres pone la escena en movimiento?</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {caso.candidatos.map((k) => {
            const esElegido = sucesoId === k.id;
            return (
              <button
                key={k.id}
                className="tdn-opt"
                data-ok={esElegido}
                disabled={Boolean(sucesoId)}
                onClick={() => onSuceso(k.id)}
              >
                <i
                  className={`fa-solid ${esElegido ? "fa-circle-play" : "fa-circle"}`}
                  style={{ marginTop: 3, fontSize: 14, color: esElegido ? OK : T.text3, opacity: esElegido ? 1 : 0.4 }}
                />
                <span style={{ flex: 1 }}>{k.texto}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Paso 2: el conector temporal */}
      {sucesoId && (
        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>Paso 2 · ¿con qué conector temporal lo colocas?</Eyebrow>
          <div
            style={{
              borderRadius: 12,
              border: `1px solid rgba(${rgba},0.3)`,
              background: `rgba(${rgba},0.08)`,
              padding: "11px 14px",
              fontSize: 13,
              color: T.text2,
              lineHeight: 1.5,
              marginBottom: 14,
              display: "flex",
              gap: 10,
            }}
          >
            <i className="fa-solid fa-clock" style={{ color: accent, marginTop: 2 }} />
            <span>{caso.relacion}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {CONECTORES.map((k) => (
              <button
                key={k.id}
                className="tdn-chip"
                data-on={conectorId === k.id}
                disabled={Boolean(conectorId)}
                title={k.uso}
                onClick={() => onConector(k.id)}
              >
                {conectorId === k.id && <i className="fa-solid fa-check" style={{ fontSize: 11 }} />}
                {k.texto}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* El resultado */}
      {sucesoId && conectorId && (
        <div
          style={{
            ...card,
            padding: "20px 24px",
            borderColor: `${OK}55`,
            background: `radial-gradient(120% 120% at 0% 0%, ${OK}14 0%, transparent 55%), ${T.glass}`,
            animation: "tdnPop .25s ease",
          }}
        >
          <Eyebrow>
            <i className="fa-solid fa-film" style={{ marginRight: 8, color: OK }} />
            Ya no es una foto: es un suceso
          </Eyebrow>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: "#fff", fontWeight: 600 }}>{caso.resultado}</p>
          <p style={{ margin: "12px 0 0", fontSize: 12.5, lineHeight: 1.55, color: T.text3 }}>
            La descripción sigue ahí —sin ella el suceso no significaría nada—, pero ahora el reloj de la historia avanza.
          </p>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 4 — «El verbo que hunde»
 * ═══════════════════════════════════════════════════════════════════════════ */
function VerbosPanel({
  accent,
  item,
  itemIdx,
  senalados,
  reemplazos,
  onSelItem,
  onSenalar,
  onReemplazo,
}: {
  accent: string;
  item: ItemVerbo;
  itemIdx: number;
  senalados: Record<string, string>;
  reemplazos: Record<string, string>;
  onSelItem: (i: number) => void;
  onSenalar: (verboId: string) => void;
  onReemplazo: (repId: string) => void;
}) {
  const senalado = senalados[item.id] ?? null;
  const repId = reemplazos[item.id] ?? null;
  const rep = repId ? (item.reemplazos.find((r) => r.id === repId) ?? null) : null;
  const listos = ITEMS_VERBO.filter((it) => reemplazos[it.id]).length;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        {ITEMS_VERBO.map((it, i) => (
          <button key={it.id} className="tdn-prob" data-on={itemIdx === i} data-done={Boolean(reemplazos[it.id])} onClick={() => onSelItem(i)}>
            {reemplazos[it.id] && <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />}
            {it.titulo}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 800, color: listos >= ITEMS_VERBO.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
          {listos}/{ITEMS_VERBO.length}
        </span>
      </div>

      <div style={{ ...card, padding: "22px 24px" }}>
        <Eyebrow>
          <i className="fa-solid fa-anchor" style={{ marginRight: 8, color: accent }} />
          {senalado ? "Antes · la frase hundida" : "Paso 1 · señala el verbo que hunde la frase"}
        </Eyebrow>
        {/* El verbo señalado se queda tal cual, en rojo: el «antes» tiene que
            poder compararse con el «después». Sustituirlo aquí dentro dejaría
            la frase a medias («manoteó un movimiento con la mano»). */}
        <p style={{ margin: 0, fontSize: 17.5, lineHeight: 2, color: T.text }}>
          {item.piezas.map((p, i) =>
            p.verboId ? (
              <button
                key={i}
                type="button"
                className="tdn-verbo"
                data-hunde={senalado === p.verboId}
                disabled={Boolean(senalado)}
                aria-label={`Señalar el verbo «${p.texto}»`}
                onClick={() => onSenalar(p.verboId!)}
              >
                {p.texto}
              </button>
            ) : (
              <span key={i}>{p.texto}</span>
            )
          )}
        </p>
        {!senalado && (
          <p style={{ margin: "14px 0 0", fontSize: 12.5, color: T.text3, lineHeight: 1.55 }}>
            <i className="fa-solid fa-hand-pointer" style={{ marginRight: 8, color: accent }} />
            Los verbos de la frase están enmarcados. Toca el que no muestra nada de lo que ocurre.
          </p>
        )}
      </div>

      {senalado && (
        <div style={{ ...card, padding: "20px 22px" }}>
          <Eyebrow>Paso 2 · ¿con cuál lo sustituyes?</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {item.reemplazos.map((r) => {
              const esElegido = repId === r.id;
              return (
                <button key={r.id} className="tdn-opt" data-ok={esElegido} disabled={Boolean(repId)} onClick={() => onReemplazo(r.id)}>
                  <i
                    className={`fa-solid ${esElegido ? "fa-circle-check" : "fa-circle"}`}
                    style={{ marginTop: 3, fontSize: 14, color: esElegido ? OK : T.text3, opacity: esElegido ? 1 : 0.4 }}
                  />
                  <span style={{ flex: 1, fontWeight: 800 }}>{r.texto}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {rep && (
        <div
          style={{
            ...card,
            padding: "20px 24px",
            borderColor: `${OK}55`,
            background: `radial-gradient(120% 120% at 0% 0%, ${OK}14 0%, transparent 55%), ${T.glass}`,
            animation: "tdnPop .25s ease",
          }}
        >
          <Eyebrow>
            <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 8, color: OK }} />
            Después · la frase a flote
          </Eyebrow>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65, color: "#fff", fontWeight: 600 }}>{item.resultado}</p>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Hechos verdadero/falso (A4, verbatim)
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
          Hechos · verdadero o falso (LC-II-P02-A4)
        </Eyebrow>
        <span style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 800, color: aciertos >= HECHOS.length ? OK : T.text3, fontVariantNumeric: "tabular-nums" }}>
          {aciertos}/{HECHOS.length}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {HECHOS.map((h, i) => {
          const r = respuestas[i] ?? null;
          const resuelto = r !== null && r === h.respuesta;
          const fallado = r !== null && r !== h.respuesta;
          return (
            <div
              key={i}
              style={{
                borderRadius: 13,
                border: `1px solid ${resuelto ? `${OK}55` : fallado ? `${NO}55` : T.line}`,
                background: resuelto ? `${OK}0f` : fallado ? `${NO}0f` : T.inset,
                padding: "13px 16px",
                transition: "all .18s",
              }}
            >
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: T.text, marginBottom: 10, display: "flex", gap: 10 }}>
                <span style={{ color: accent, fontWeight: 900 }}>{i + 1}.</span>
                <span>{h.enunciado}</span>
              </div>
              <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    className="tdn-vf"
                    disabled={resuelto}
                    data-on={resuelto && h.respuesta === v}
                    data-bad={fallado && r === v}
                    onClick={() => onResponder(i, v)}
                  >
                    <i className={`fa-solid ${v ? "fa-check" : "fa-xmark"}`} style={{ marginRight: 7 }} />
                    {v ? "Verdadero" : "Falso"}
                  </button>
                ))}
                {resuelto && <span style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.45, flex: 1, minWidth: 220 }}>{h.retro}</span>}
                {fallado && (
                  <span style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.45, flex: 1, minWidth: 220 }}>
                    {h.retro} <em style={{ color: T.text3 }}>Inténtalo de nuevo.</em>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Taller de escritura propia (A3, verbatim). OPCIONAL y SIN CALIFICACIÓN.
 *
 * El laboratorio no finge evaluar lo que no puede: no hay palomitas, no hay
 * estrellas y no cuenta para los objetivos. Lo único que hace la máquina es
 * contar palabras y señalar los verbos comodín, que es exactamente lo que el
 * modo 4 acaba de enseñar a ver.
 * ═══════════════════════════════════════════════════════════════════════════ */
function TallerCard({
  accent,
  rgba,
  valor,
  palabras,
  comodines,
  onEscribir,
}: {
  accent: string;
  rgba: string;
  valor: string;
  palabras: number;
  comodines: string[];
  onEscribir: (s: string) => void;
}) {
  const dentroDeRango = palabras >= TALLER.minimo && palabras <= TALLER.maximo;
  return (
    <div style={{ ...card, padding: "20px 24px 24px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-pen-nib" style={{ marginRight: 8, color: accent }} />
          Tu taller · {TALLER.ancla}
        </Eyebrow>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: T.text3,
            border: `1px solid ${T.line}`,
            background: T.inset,
            borderRadius: 999,
            padding: "5px 12px",
          }}
        >
          Opcional · no se califica
        </span>
      </div>

      <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.65, color: T.text2 }}>{TALLER.prompt}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {TALLER.pistas.map((p, i) => (
          <span key={i} style={{ fontSize: 11.5, lineHeight: 1.4, color: T.text3, border: `1px solid ${T.line}`, background: T.inset, borderRadius: 999, padding: "6px 12px" }}>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 7, color: accent, fontSize: 10 }} />
            {p}
          </span>
        ))}
      </div>

      <textarea
        className="tdn-ta"
        value={valor}
        aria-label="Tu texto descriptivo o narrativo"
        placeholder="Escribe aquí tu texto. Nadie lo califica y no sale de tu navegador: es tuyo."
        onChange={(e) => onEscribir(e.target.value)}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
        <span style={{ fontSize: 12.5, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: dentroDeRango ? OK : T.text3 }}>
          <i className={`fa-solid ${dentroDeRango ? "fa-circle-check" : "fa-pen"}`} style={{ marginRight: 7 }} />
          {palabras} palabra{palabras === 1 ? "" : "s"} · la actividad pide de {TALLER.minimo} a {TALLER.maximo}
        </span>
        {palabras > 0 && (
          <span style={{ fontSize: 12.5, color: comodines.length > 0 ? "#FF8A3C" : OK, fontWeight: 700 }}>
            <i className={`fa-solid ${comodines.length > 0 ? "fa-anchor" : "fa-feather"}`} style={{ marginRight: 7 }} />
            {comodines.length > 0
              ? `Verbos comodín detectados: ${comodines.join(", ")}. Míralos otra vez: ¿alguno podría mostrar más?`
              : "Ningún verbo comodín a la vista."}
          </span>
        )}
      </div>

      <div className="tdn-divider" />

      <Eyebrow>Criterios de la actividad — los valoras tú al releerte</Eyebrow>
      <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 7 }}>
        {TALLER.criterios.map((c) => (
          <li key={c} style={{ fontSize: 13, lineHeight: 1.5, color: T.text2 }}>
            {c}
          </li>
        ))}
      </ul>

      <p style={{ margin: "14px 0 0", fontSize: 11.5, color: T.text3, lineHeight: 1.55, borderTop: `1px solid ${T.line}`, paddingTop: 12 }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: `rgba(${rgba},0.9)` }} />
        Este espacio <strong style={{ color: T.text2 }}>no cuenta para los objetivos ni para las estrellas</strong>: un texto
        propio no se puede calificar con honestidad desde el navegador y este laboratorio no lo finge. Lo que escribas se queda
        en tu navegador mientras dure la sesión; cópialo a tu cuaderno o a la actividad LC-II-P02-A3 si quieres conservarlo.
      </p>
    </div>
  );
}
