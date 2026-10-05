"use client";

/**
 * Laboratorio — Comparatives: Lucía va de compras (simulador)
 * Práctica experimental para IN-II-P05-A4 (Inglés II).
 *
 * El alumno no ordena adjetivos: DECIDE. Lucía (personaje FICTICIO) tiene que
 * elegir entre dos opciones en cuatro compras (teléfono, autobús, película,
 * paseo). Cada opción trae barras con sus datos (valores de juego,
 * «simulación»). El alumno arma una comparación en inglés —«Zeta is cheaper
 * than Orbi»— y Lucía reacciona:
 *  · forma que no existe («more cheap», «gooder») → no entiende y se le explica
 *    por qué en español;
 *  · forma correcta pero frase falsa → se le pide mirar las barras;
 *  · frase verdadera pero de otra cosa → Lucía sigue sin poder decidir;
 *  · frase correcta, verdadera y sobre lo que ella pidió → compra.
 * Las consecuencias salen de `comparativos-ingles-sim.ts`.
 *
 * Modos: «Lucía va de compras» (simulador) y «Complete the text» (se escribe).
 * La teoría verbatim (comparativos, adjetivos por regla, oraciones, dato) vive
 * en la pestaña «Teoría». DOM puro (sin three.js).
 */

import { useEffect, useRef, useState } from "react";
import type { PracticaLabProps } from "../registry";
import { T, OK } from "./_kit";
import { LabShell, Bloque, BotonHerramienta } from "./_shell";
import { LabSfx } from "./lab-audio";
import { CompletaTexto } from "./_mecanica-huecos";
import { COMPARATIVOS_INGLES_HUECOS } from "./comparativos-ingles-huecos";
import { usePartida, MarcadorPartida } from "./_partida";
import { FichaTeorica } from "./_ficha";
import { COMPARATIVOS_INGLES_FICHA } from "./comparativos-ingles-ficha";
import { COMPARATIVOS, ADJETIVOS, ORACIONES, REGLA_INFO, QUIZ, DATO_COMPARATIVOS, type TipoRegla } from "./comparativos-ingles-data";
import { RONDAS, evaluar, fichasDe, opcionDe, otraDe, type OpcionCompra, type Resultado, type Ronda } from "./comparativos-ingles-sim";
import { useEstrellas } from "@/lib/hooks/useEstrellas";

const NO = "#FF5E5E";
const AMBAR = "#FFC75A";
const RETO_KEY = "cen-comparativos-ingles-reto";
const RUTA_SIM = "/media/labs-sim/comparativos-ingles";

type Modo = "compras" | "texto";

const MODOS: { id: Modo; label: string; icono: string }[] = [
  { id: "compras", label: "Lucía va de compras", icono: "fa-cart-shopping" },
  { id: "texto", label: "Complete the text", icono: "fa-pen-to-square" },
];

const TONO: Record<Resultado["veredicto"], { color: string; icono: string }> = {
  bien: { color: OK, icono: "fa-face-grin-stars" },
  gramatica: { color: NO, icono: "fa-face-frown" },
  falsa: { color: AMBAR, icono: "fa-face-meh" },
  fuera: { color: AMBAR, icono: "fa-face-surprise" },
};

export function LabComparativosIngles({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("compras");

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
  const sfxClick = () => sonido && audioRef.current?.blip();

  // ── estado del simulador ──────────────────────────────────────────────
  const [rondaIdx, setRondaIdx] = useState(0);
  const [sujeto, setSujeto] = useState<string | null>(null);
  const [forma, setForma] = useState<string | null>(null);
  const [reac, setReac] = useState<Resultado | null>(null);
  /** compra resuelta: id de ronda → id de la opción que eligió Lucía. */
  const [hechas, setHechas] = useState<Record<string, string>>({});
  /** comparativos válidos y verdaderos que el alumno ya dijo. */
  const [usadas, setUsadas] = useState<string[]>([]);
  const [tipos, setTipos] = useState<TipoRegla[]>([]);

  const ronda = RONDAS[rondaIdx]!;
  const hecha = hechas[ronda.id];

  const resetSim = () => {
    setRondaIdx(0);
    setSujeto(null);
    setForma(null);
    setReac(null);
    setHechas({});
    setUsadas([]);
    setTipos([]);
    partida.reiniciar();
    setModo("compras");
  };
  const resetTexto = () => {
    setTextoDone(false);
    setTextoIntento((n) => n + 1);
  };
  const resetActual = modo === "texto" ? resetTexto : resetSim;

  const irARonda = (i: number) => {
    sfxClick();
    setRondaIdx(i);
    setSujeto(null);
    setForma(null);
    setReac(null);
  };

  const decir = () => {
    if (!sujeto || !forma) return;
    const res = evaluar(ronda, sujeto, forma);
    setReac(res);
    const cuenta = !hecha;
    if (res.veredicto === "bien") {
      if (cuenta) {
        sfxPlace();
        setHechas((h) => ({ ...h, [ronda.id]: res.ganadora ?? "" }));
      }
    } else if (res.veredicto === "gramatica" || res.veredicto === "falsa") {
      if (cuenta) sfxNo();
    } else {
      sfxClick();
    }
    if ((res.veredicto === "bien" || res.veredicto === "fuera") && res.forma && res.tipo) {
      const fm = res.forma;
      const tp = res.tipo;
      setUsadas((u) => (u.includes(fm) ? u : [...u, fm]));
      setTipos((t) => (t.includes(tp) ? t : [...t, tp]));
    }
  };

  const [quizAprobado, setQuizAprobado] = useState(false);

  // ── progreso / estrellas ──────────────────────────────────────────────
  const comprasHechas = Object.keys(hechas).length;
  const simDone = comprasHechas >= RONDAS.length;
  const modosHechos = (simDone ? 1 : 0) + (textoDone ? 1 : 0);
  // Terminar los dos modos vale 2★; la tercera se gana con precisión.
  const estrellas = partida.estrellasCon(modosHechos, 2);

  const { mejorEstrellas: mejor, registraEstrellas } = useEstrellas(RETO_KEY);
  const bestEstrellas = Math.max(estrellas, mejor);
  useEffect(() => {
    if (estrellas > 0) registraEstrellas(estrellas);
  }, [estrellas, registraEstrellas]);

  const objetivos = [
    { txt: "Forma 6 comparativos distintos y verdaderos", done: usadas.length >= 6 },
    { txt: "Usa los tres tipos: -er, more e irregular", done: tipos.length >= 3 },
    { txt: "Convence a Lucía en las 4 compras", done: simDone },
    { txt: "Consigue 3★ (simulador y texto, con pocos errores)", done: bestEstrellas >= 3 },
    { txt: "Aprueba el cuestionario de comprensión", done: quizAprobado },
  ];

  const lectura =
    modo === "compras"
      ? `${comprasHechas}/${RONDAS.length} compras · ${bestEstrellas}★`
      : `${textoDone ? "Texto completo" : "Escribe cada hueco"} · ${bestEstrellas}★`;

  // ── escena ────────────────────────────────────────────────────────────
  const escena = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <style>{ESTILOS(accent, color.rgba)}</style>

      {modo === "compras" && (
        <>
          <div className="cmp-pasos" role="tablist" aria-label="Compras de Lucía">
            {RONDAS.map((r, i) => (
              <button key={r.id} type="button" role="tab" aria-selected={i === rondaIdx} className="cmp-paso" data-on={i === rondaIdx} data-done={!!hechas[r.id]} onClick={() => irARonda(i)}>
                <i className={`fa-solid ${hechas[r.id] ? "fa-circle-check" : r.icono}`} aria-hidden />
                {i + 1} {r.titulo}
              </button>
            ))}
          </div>

          <Lucia ronda={ronda} reac={reac} />

          <div className="cmp-opciones">
            {ronda.opciones.map((o, i) => (
              <TarjetaOpcion
                key={o.id}
                ronda={ronda}
                opcion={o}
                tono={i}
                elegida={sujeto === o.id}
                compra={hecha === o.id}
                onElegir={() => {
                  sfxClick();
                  setSujeto(o.id);
                }}
              />
            ))}
          </div>

          <div className="cmp-constructor">
            <div className="cmp-frase" aria-live="polite">
              <strong>{sujeto ? opcionDe(ronda, sujeto).corto : "…"}</strong>
              <span>is</span>
              <strong className="cmp-hueco" data-lleno={!!forma}>{forma ?? "____"}</strong>
              <span>than</span>
              <strong>{sujeto ? otraDe(ronda, sujeto).corto : "…"}</strong>
            </div>
            <div className="cmp-fichas" role="group" aria-label="Elige el comparativo">
              {fichasDe(ronda).map((f) => (
                <button
                  key={f}
                  type="button"
                  className="cmp-ficha"
                  data-sel={forma === f}
                  onClick={() => {
                    sfxClick();
                    setForma(f);
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="cmp-acciones">
              <button type="button" className="cmp-decir" disabled={!sujeto || !forma} onClick={decir}>
                <i className="fa-solid fa-comment-dots" aria-hidden /> Say it to Lucía
              </button>
              {hecha && rondaIdx < RONDAS.length - 1 && (
                <button type="button" className="cmp-sig" onClick={() => irARonda(rondaIdx + 1)}>
                  Next purchase <i className="fa-solid fa-arrow-right" aria-hidden />
                </button>
              )}
            </div>
            {!sujeto && <div className="cmp-nota">Primero toca la tarjeta de quien va al inicio de la frase.</div>}
          </div>
        </>
      )}

      {modo === "texto" && (
        <CompletaTexto
          key={textoIntento}
          data={COMPARATIVOS_INGLES_HUECOS}
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
    </div>
  );

  const pistaDe: Record<Modo, string> = {
    compras: "Mira las barras y di una comparación VERDADERA sobre lo que Lucía pidió. Adjetivo corto → -er (cheaper); largo → more (more expensive); good, bad y far son irregulares.",
    texto: "Escribe la palabra que falta en cada hueco del texto.",
  };

  return (
    <LabShell
      dom
      accent={accent}
      rgba={color.rgba}
      escena={escena}
      modos={{ opciones: MODOS.map((m) => ({ id: m.id, etiqueta: m.label, icono: m.icono })), valor: modo, cambiar: (id) => setModo(id as Modo) }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo={modo === "texto" ? "Reiniciar este modo" : "Reiniciar las compras"} onClick={resetActual} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      retoKey={RETO_KEY}
      pestanas={[
        {
          id: "pistas",
          etiqueta: "Pistas",
          icono: "fa-lightbulb",
          contenido: (
            <>
              <Bloque titulo="Tu partida" icono="fa-gauge-high">
                <MarcadorPartida partida={partida} accent={accent} rgba={color.rgba} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <i key={s} className="fa-solid fa-star" style={{ fontSize: 20, color: s <= bestEstrellas ? AMBAR : "rgba(255,255,255,0.16)" }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                  {bestEstrellas >= 3 ? "You mastered comparatives in English!" : "Termina las 4 compras y el texto para ganar 2★; la tercera pide 2 errores o menos."}
                </div>
              </Bloque>
              <Bloque titulo="Pista de este modo" icono="fa-lightbulb">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{pistaDe[modo]}</div>
              </Bloque>
              <Bloque titulo="Comparaciones que ya dijiste" icono="fa-comments">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                  {usadas.length === 0 ? "Aún ninguna. Cada una que sea correcta y verdadera aparece aquí." : usadas.join(" · ")}
                </div>
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-clipboard-question",
          contenido: <QuizCard accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sonido ? (ok) => (ok ? sfxOk() : sfxNo()) : undefined} />,
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Teoría de la práctica" icono="fa-book-open">
                <FichaTeorica data={COMPARATIVOS_INGLES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <Bloque titulo="Seis comparativos y su regla" icono="fa-screwdriver-wrench">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {COMPARATIVOS.map((c) => (
                    <div key={c.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>
                        {c.adjetivo} → {c.comparativo} than
                      </strong>{" "}
                      ({c.es}). {c.regla}
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Adjetivos según su regla" icono="fa-table-columns">
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {(["er", "more", "irregular"] as TipoRegla[]).map((t) => (
                    <div key={t} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>
                        {REGLA_INFO[t].titulo} · {REGLA_INFO[t].subtitulo}.
                      </strong>{" "}
                      {ADJETIVOS.filter((a) => a.tipo === t)
                        .map((a) => `${a.palabra} (${a.es})`)
                        .join(", ")}
                      . <em style={{ color: T.text3 }}>{REGLA_INFO[t].ejemplo}</em>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Comparaciones en contexto" icono="fa-pen-fancy">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {ORACIONES.map((o) => (
                    <div key={o.id} style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                      {o.antes} <strong style={{ color: OK }}>{o.resp}</strong> {o.despues} <em style={{ color: T.text3 }}>({o.nota})</em>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Dato" icono="fa-circle-info">
                <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55 }}>{DATO_COMPARATIVOS}</div>
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Piezas de la escena
 * ═══════════════════════════════════════════════════════════════════════════ */

function Lucia({ ronda, reac }: { ronda: Ronda; reac: Resultado | null }) {
  const tono = reac ? TONO[reac.veredicto] : { color: "rgba(255,255,255,0.7)", icono: "fa-face-smile" };
  return (
    <div className="cmp-lucia" role="status">
      <div className="cmp-avatar" style={{ borderColor: tono.color, color: tono.color }}>
        <i className={`fa-solid ${tono.icono}`} aria-hidden />
      </div>
      <div className="cmp-burbuja" style={{ borderColor: reac ? `${tono.color}88` : undefined }}>
        <div className="cmp-nombre">Lucía</div>
        <div className="cmp-ing">{reac ? reac.ingles : ronda.lucia}</div>
        <div className="cmp-es">{reac ? reac.es : ronda.luciaEs}</div>
      </div>
    </div>
  );
}

function Foto({ clave, icono, tono }: { clave: string; icono: string; tono: number }) {
  const [fallo, setFallo] = useState(false);
  const hue = tono === 0 ? 190 : 330;
  return (
    <div className="cmp-foto" style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 26%), hsl(${hue + 40} 50% 14%))` }}>
      <i className={`fa-solid ${icono}`} aria-hidden />
      {!fallo && <img src={`${RUTA_SIM}/${clave}.webp`} alt="" loading="lazy" onError={() => setFallo(true)} />}
    </div>
  );
}

function TarjetaOpcion({ ronda, opcion, tono, elegida, compra, onElegir }: { ronda: Ronda; opcion: OpcionCompra; tono: number; elegida: boolean; compra: boolean; onElegir: () => void }) {
  const otra = otraDe(ronda, opcion.id);
  return (
    <button type="button" className="cmp-op" data-sel={elegida} data-compra={compra} onClick={onElegir} aria-pressed={elegida}>
      <Foto clave={opcion.clave} icono={opcion.icono} tono={tono} />
      <div className="cmp-op-cuerpo">
        <div className="cmp-op-titulo">
          <strong>{opcion.corto}</strong>
          <span>{opcion.que}</span>
          {compra && (
            <span className="cmp-elegida">
              <i className="fa-solid fa-cart-shopping" aria-hidden /> Lucía lo compra
            </span>
          )}
        </div>
        {ronda.atributos.map((a) => {
          const v = opcion.valores[a.id] ?? 0;
          const max = Math.max(v, otra.valores[a.id] ?? 0) || 1;
          return (
            <div key={a.id} className="cmp-barra">
              <div className="cmp-barra-top">
                <span>{a.nombre}</span>
                <strong>{a.unidad === "$" ? `$${v.toLocaleString("en-US")}` : `${v} ${a.unidad}`}</strong>
              </div>
              <div className="cmp-pista">
                <div className="cmp-relleno" style={{ width: `${Math.max(6, (v / max) * 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Estilos
 * ═══════════════════════════════════════════════════════════════════════════ */
const ESTILOS = (accent: string, rgba: string) => `
  .cmp-pasos { display:flex; flex-wrap:wrap; gap:8px; }
  .cmp-paso { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:9px 14px; border-radius:11px; font-size:14px; font-weight:800;
    border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; }
  .cmp-paso[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.18); color:#fff; }
  .cmp-paso[data-done="true"] i { color:${OK}; }
  .cmp-lucia { display:flex; gap:12px; align-items:flex-start; }
  .cmp-avatar { flex-shrink:0; width:52px; height:52px; border-radius:50%; border:2px solid; display:flex; align-items:center; justify-content:center;
    font-size:26px; background:rgba(2,12,28,0.6); transition:all .2s; }
  .cmp-burbuja { flex:1; min-width:0; padding:11px 14px; border-radius:6px 16px 16px 16px; border:1.5px solid ${T.line}; background:${T.glass}; display:grid; gap:4px; }
  .cmp-nombre { font-size:13px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; color:${T.text3}; }
  .cmp-ing { font-size:16px; font-weight:800; color:#fff; line-height:1.35; }
  .cmp-es { font-size:14px; color:${T.text2}; line-height:1.45; }
  .cmp-opciones { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap:12px; }
  .cmp-op { cursor:pointer; text-align:left; display:flex; flex-direction:column; border-radius:16px; border:1.5px solid ${T.line}; background:${T.glass}; color:#fff;
    padding:0; overflow:hidden; transition:border-color .15s, box-shadow .15s; min-width:0; font:inherit; }
  .cmp-op:hover { border-color:${T.lineStrong}; }
  .cmp-op[data-sel="true"] { border-color:${accent}; box-shadow:0 0 0 3px rgba(${rgba},0.22); }
  .cmp-op[data-compra="true"] { border-color:${OK}; background:${OK}14; }
  .cmp-foto { position:relative; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; font-size:38px; color:rgba(255,255,255,0.35); overflow:hidden; }
  .cmp-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .cmp-op-cuerpo { padding:12px 14px 14px; display:grid; gap:10px; }
  .cmp-op-titulo { display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 10px; }
  .cmp-op-titulo strong { font-size:18px; }
  .cmp-op-titulo span { font-size:14px; color:${T.text2}; }
  .cmp-op-titulo .cmp-elegida { color:${OK}; font-weight:800; }
  .cmp-barra { display:grid; gap:4px; }
  .cmp-barra-top { display:flex; justify-content:space-between; gap:8px; font-size:14px; color:${T.text2}; }
  .cmp-barra-top strong { color:#fff; font-variant-numeric:tabular-nums; }
  .cmp-pista { height:10px; border-radius:99px; background:rgba(255,255,255,0.1); overflow:hidden; }
  .cmp-relleno { height:100%; border-radius:99px; background:linear-gradient(90deg, ${accent}, rgba(${rgba},0.55)); transition:width .4s ease; }
  .cmp-constructor { display:grid; gap:12px; padding:14px; border-radius:16px; border:1.5px solid ${T.line}; background:${T.inset}; }
  .cmp-frase { display:flex; flex-wrap:wrap; align-items:baseline; gap:8px; font-size:20px; color:#fff; }
  .cmp-frase span { color:${T.text2}; }
  .cmp-hueco { padding:0 10px; border-radius:8px; border:1.5px dashed ${T.lineStrong}; color:${T.text3}; }
  .cmp-hueco[data-lleno="true"] { border-style:solid; border-color:${accent}; color:#fff; background:rgba(${rgba},0.16); }
  .cmp-fichas { display:flex; flex-wrap:wrap; gap:8px; }
  .cmp-ficha { cursor:pointer; min-height:44px; padding:10px 16px; border-radius:999px; border:1.5px solid ${T.line}; background:${T.glassSoft}; color:#fff;
    font-size:15px; font-weight:800; transition:all .14s; }
  .cmp-ficha:hover { border-color:${T.lineStrong}; }
  .cmp-ficha[data-sel="true"] { border-color:${accent}; background:rgba(${rgba},0.22); box-shadow:0 0 14px -5px ${accent}; }
  .cmp-acciones { display:flex; flex-wrap:wrap; gap:10px; }
  .cmp-decir, .cmp-sig { cursor:pointer; min-height:44px; display:inline-flex; align-items:center; gap:9px; padding:10px 18px; border-radius:11px; font-size:15px; font-weight:900; border:none; }
  .cmp-decir { background:${accent}; color:#04121f; }
  .cmp-decir:disabled { opacity:.4; cursor:not-allowed; }
  .cmp-sig { background:${OK}22; color:${OK}; border:1.5px solid ${OK}88; }
  .cmp-nota { font-size:14px; color:${T.text3}; }
  .cmp-q { cursor:pointer; display:flex; align-items:center; gap:11px; padding:11px 14px; border-radius:11px; border:1.5px solid ${T.line}; background:${T.glass};
    color:${T.text2}; font-size:14px; font-weight:600; text-align:left; width:100%; }
  .cmp-q:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
  .cmp-q:disabled { cursor:default; }
  .cmp-btn { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 18px; border-radius:11px; border:1.5px solid ${T.line};
    background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; }
  .cmp-btn:disabled { opacity:.4; cursor:not-allowed; }
  @media (prefers-reduced-motion: reduce){ .cmp-relleno, .cmp-avatar { transition:none; } }
`;

/* ═══════════════════════════════════════════════════════════════════════════
 * Cuestionario de comprensión (pestaña Reto)
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
    <div style={{ display: "grid", gap: 16 }}>
      <Bloque titulo="Comprueba lo aprendido" icono="fa-clipboard-question">
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
          Cinco afirmaciones sobre los comparativos. Decide si son verdaderas o falsas y pulsa «Comprobar».
          {aprobado && (
            <span style={{ marginLeft: 8, color: OK, fontWeight: 800 }}>
              <i className="fa-solid fa-circle-check" /> Aprobado
            </span>
          )}
        </div>
      </Bloque>

      {QUIZ.map((q, qi) => {
        const elegida = resp[qi];
        return (
          <div key={qi}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 10, display: "flex", gap: 10 }}>
              <span style={{ color: accent }}>{qi + 1}.</span>
              <span>{q.pregunta}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: 9 }}>
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
                  <button key={oi} className="cmp-q" onClick={() => elegir(qi, oi)} disabled={comprobado} style={{ borderColor: borde, background: fondo, color: colorTxt }}>
                    <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, border: `1.5px solid ${sel || (comprobado && esCorrecta) ? "currentColor" : T.line}` }}>
                      {comprobado && esCorrecta ? <i className="fa-solid fa-check" /> : comprobado && sel ? <i className="fa-solid fa-xmark" /> : String.fromCharCode(65 + oi)}
                    </span>
                    <span style={{ flex: 1, lineHeight: 1.35 }}>{op}</span>
                  </button>
                );
              })}
            </div>
            {comprobado && (
              <div style={{ marginTop: 9, fontSize: 14, color: T.text2, lineHeight: 1.5, display: "flex", gap: 9, padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>
                <i className="fa-solid fa-circle-info" style={{ color: accent, marginTop: 3 }} />
                <span>{q.retro}</span>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {!comprobado ? (
          <button className="cmp-btn" style={{ background: accent, color: "#04121f", border: "none" }} onClick={comprobar} disabled={!todas}>
            <i className="fa-solid fa-list-check" />
            Comprobar
          </button>
        ) : (
          <button className="cmp-btn" onClick={reintentar}>
            <i className="fa-solid fa-rotate-left" />
            Reintentar
          </button>
        )}
        {comprobado && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "10px 14px", border: `1px solid ${aprobadoAhora ? OK : NO}55`, background: `${aprobadoAhora ? OK : NO}14`, fontSize: 14, fontWeight: 800, color: aprobadoAhora ? OK : NO }}>
            <i className={`fa-solid ${aprobadoAhora ? "fa-trophy" : "fa-circle-half-stroke"}`} />
            {aciertos} / {total} correctas
            {!aprobadoAhora && <span style={{ color: T.text3, fontWeight: 600 }}>· revisa las marcadas</span>}
          </div>
        )}
      </div>
    </div>
  );
}
