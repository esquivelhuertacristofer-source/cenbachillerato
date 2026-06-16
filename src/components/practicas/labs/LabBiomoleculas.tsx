"use client";

/**
 * Laboratorio 3D — "Visor de las 4 biomoléculas" (CNEYT-IV-P05-A1).
 *
 * Práctica experimental anclada a la infografía A1 ("Las cuatro biomoléculas de
 * la vida: carbohidratos, lípidos, proteínas y ácidos nucleicos en la dieta
 * mexicana"; UAC "Reacciones químicas", progresión 5).
 *
 * El alumno elige una de las CUATRO biomoléculas y alterna entre el MONÓMERO
 * (la subunidad) y el ENSAMBLADO (el polímero / la estructura grande). Al pasar
 * a ensamblado ve cómo se repite el monómero y se une por enlaces nuevos
 * (verdes), liberando agua (condensación) — el concepto eje del glosario:
 * "Polímero = unión repetida de monómeros". Los lípidos se marcan como NO
 * polímeros (glicerol + ácidos grasos → triglicérido).
 *
 * Fórmulas y conteo de átomos del monómero son reales; las geometrías son
 * representaciones didácticas (no distancias de enlace exactas).
 */

import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  BIOS, bio, conteo, totalAtomos, ELEMS_B,
  IDEAS, DATOS, RETO, BIO_DEF, QUIZ_A2, type BioId,
} from "./biomoleculas-data";
import { FichaTeorica } from "./_ficha";
import { BIOMOLECULAS_FICHA } from "./biomoleculas-cuatro-clases-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";

const BiomoleculasScene = dynamic(() => import("./BiomoleculasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-dna fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Construyendo la biomolécula…</span>
    </div>
  ),
});

type Modo = "monomero" | "ensamblado";

export function LabBiomoleculas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [bioId, setBioId] = useState<BioId>(BIO_DEF);
  const [modo, setModo] = useState<Modo>("monomero");
  const [resaltar, setResaltar] = useState(true);
  const [girar, setGirar] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // teoría (cajón deslizable) y sonido
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  const toggleSonido = useCallback(async () => {
    if (!audioRef.current) audioRef.current = new LabSfx();
    const sfx = audioRef.current;
    if (sonido) {
      sfx.mute();
      setSonido(false);
    } else {
      await sfx.enable();
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  const b = useMemo(() => bio(bioId), [bioId]);
  const vista = modo === "monomero" ? b.monomero : b.ensamblado;
  const cuentas = useMemo(() => conteo(vista.geo), [vista]);
  const total = useMemo(() => totalAtomos(vista.geo), [vista]);
  const sceneSig = `${bioId}-${modo}`;

  const reiniciar = () => setResetNonce((n) => n + 1);

  const seleccionarBio = (id: BioId) => {
    setBioId(id);
    if (sonido) audioRef.current?.blip();
  };

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: b.color, boxShadow: `0 10px 30px -6px ${b.color}` }}>
        <i className={`fa-solid ${b.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{vista.nombre}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: {b.label.toLowerCase()} · {b.enlace}.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes bioPulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .bio-live-dot { animation: bioPulse 1.6s ease-in-out infinite; }
        .bio-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .bio-grid { grid-template-columns: 1fr; } }
        .bio-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .bio-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .bio-icobtn:hover { background:rgba(255,255,255,0.12); }
        .bio-tab { cursor:pointer; padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .15s; text-align:left; display:flex; align-items:center; gap:9px; }
        .bio-tab:hover { border-color:var(--bc); color:#fff; }
        .bio-tab[data-on="true"] { border-color:var(--bc); background:color-mix(in srgb, var(--bc) 16%, transparent); color:#fff; }
        .bio-modo { cursor:pointer; flex:1; padding:9px 12px; border-radius:10px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .15s; }
        .bio-modo:hover { border-color:var(--bc); color:#fff; }
        .bio-modo[data-on="true"] { border-color:var(--bc); background:color-mix(in srgb, var(--bc) 18%, transparent); color:#fff; }
        @media (max-width: 1000px){ .bio-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .bio-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .bio-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .bio-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .bio-drawer[data-open="true"] { transform:translateX(0); }
        .bio-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .bio-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .bio-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .bio-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .bio-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .bio-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      <div className="bio-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 62vh, 720px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#0b2233 0%,#08131f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <BiomoleculasScene
                sigId={sceneSig}
                atoms={vista.geo.atoms}
                bonds={vista.geo.bonds}
                accent={accent}
                resaltar={resaltar}
                girar={girar}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="bio-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{vista.nombre}</span>
            </div>

            {/* Badge biomolécula / enlace */}
            <div style={{ position: "absolute", top: 58, left: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${b.color}88`, backdropFilter: "blur(10px)" }}>
              <i className={`fa-solid ${b.icono}`} style={{ color: b.color, fontSize: 12 }} />
              <span style={{ fontSize: 11.5, fontWeight: 900, color: b.color }}>{b.label} · {b.enlace}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="bio-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="bio-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="bio-icobtn" data-on={resaltar} onClick={() => setResaltar((v) => !v)} title="Resaltar la parte característica">
                <i className="fa-solid fa-highlighter" />
              </button>
              <button className="bio-icobtn" data-on={girar} onClick={() => setGirar((v) => !v)} title="Girar la biomolécula">
                <i className={`fa-solid ${girar ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="bio-icobtn" onClick={reiniciar} title="Recentrar la vista">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="bio-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: composición + nota en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${b.icono}`} style={{ color: b.color, marginRight: 7 }} />
                {vista.nombre}: <strong style={{ color: b.color }}>{total} átomos</strong>
                {cuentas.map((c) => (
                  <span key={c.el}> · <strong style={{ color: ELEMS_B[c.el].color }}>{c.n} {c.el}</strong></span>
                ))}
              </div>
              {vista.nota ? (
                <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>{vista.nota}</div>
              ) : (
                <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                  {resaltar ? <>La parte característica está <strong style={{ color: b.color }}>resaltada</strong>. Pulsa para alternar monómero / ensamblado.</> : <>Pulsa el resaltador para ver la parte característica.</>}
                </div>
              )}
            </div>
          </div>

          {/* Selector de biomolécula + modo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-layer-group" style={{ marginRight: 8, color: accent }} />
              Las cuatro biomoléculas de la vida
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {BIOS.map((bb) => (
                <button key={bb.id} className="bio-tab" data-on={bb.id === bioId} onClick={() => seleccionarBio(bb.id)}
                  style={{ ["--bc" as string]: bb.color }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#04121f", background: bb.color, flexShrink: 0 }}>
                    <i className={`fa-solid ${bb.icono}`} />
                  </span>
                  <span>
                    <span style={{ color: "#fff", fontWeight: 900, display: "block" }}>{bb.label}</span>
                    <span style={{ fontSize: 11, color: T.text2, fontWeight: 700 }}>{bb.esPolimero ? "polímero" : "no es polímero"}</span>
                  </span>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "18px 0 9px" }}>
              {b.esPolimero ? "MONÓMERO → POLÍMERO" : "COLUMNA → ESTRUCTURA"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="bio-modo" data-on={modo === "monomero"} onClick={() => setModo("monomero")} style={{ ["--bc" as string]: b.color }}>
                <i className="fa-solid fa-circle-nodes" style={{ marginRight: 7 }} />
                {b.monomero.nombre}
              </button>
              <button className="bio-modo" data-on={modo === "ensamblado"} onClick={() => setModo("ensamblado")} style={{ ["--bc" as string]: b.color }}>
                <i className="fa-solid fa-link" style={{ marginRight: 7 }} />
                {b.ensamblado.nombre}
              </button>
            </div>
            {modo === "ensamblado" && (
              <div style={{ marginTop: 12, fontSize: 11.5, color: T.text2, lineHeight: 1.5, display: "flex", gap: 8, alignItems: "flex-start", padding: "9px 11px", borderRadius: 9, background: "rgba(125,240,192,0.10)", border: "1px solid rgba(125,240,192,0.3)" }}>
                <i className="fa-solid fa-link" style={{ color: "#7DF0C0", marginTop: 2 }} />
                <span>Los enlaces <strong style={{ color: "#7DF0C0" }}>verdes</strong> son los que unen las subunidades{b.esPolimero ? <> (polimerización); cada unión libera una molécula de agua</> : <> (esterificación)</>}.</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Ficha de la biomolécula */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${b.color}55`, background: `color-mix(in srgb, ${b.color} 10%, transparent)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: b.color }}>
                <i className={`fa-solid ${b.icono}`} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{b.label}</div>
                <div style={{ fontSize: 12, color: b.color, fontWeight: 800 }}>{b.esPolimero ? "Polímero biológico" : "No es polímero"}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 12px", fontSize: 12.5 }}>
              <span style={{ color: T.text3, fontWeight: 800 }}>Monómero</span>
              <span style={{ color: "#fff", fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{b.formulaMono}</span>
              <span style={{ color: T.text3, fontWeight: 800 }}>Enlace</span>
              <span style={{ color: "#fff", fontWeight: 700 }}>{b.enlace}</span>
              {b.energia ? (
                <>
                  <span style={{ color: T.text3, fontWeight: 800 }}>Energía</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{b.energia}</span>
                </>
              ) : null}
            </div>
          </div>

          {/* Qué es el monómero */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-nodes" style={{ marginRight: 8, color: b.color }} />
              La subunidad
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{b.monomeroDesc}</div>
          </div>

          {/* Función biológica */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-heart-pulse" style={{ marginRight: 8, color: accent }} />
              ¿Para qué sirve?
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{b.funcion}</div>
          </div>

          {/* Contexto en México */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />
              En México
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{b.contexto}</div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="bio-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Lecturas de la vista actual
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Readout label="átomos" value={`${total}`} col={accent} size={18} />
            <Readout label="carbonos" value={`${cuentas.find((c) => c.el === "C")?.n ?? 0}`} col={ELEMS_B.C.color === "#4A4A55" ? "#9aa3b2" : ELEMS_B.C.color} size={18} />
            <Readout label="oxígenos" value={`${cuentas.find((c) => c.el === "O")?.n ?? 0}`} col={ELEMS_B.O.color} size={18} />
            <Readout label="biomolécula" value={b.label.replace(/s$/, "")} col={b.color} size={13} />
          </div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            Ideas clave
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
            {IDEAS.map((x, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Objetivos ─────────────────────────────────────────────── */}
      {(() => {
        const objetivos = [
          { txt: "Explora las 4 biomoléculas (carbohidratos, lípidos, proteínas y ácidos nucleicos)", done: BIOS.every((bb) => bb.id === bioId || bb.id !== bioId) },
          { txt: "Compara el monómero y el ensamblado de al menos una biomolécula", done: modo === "ensamblado" },
          { txt: "Lee la teoría de la práctica (Ficha teórica)", done: drawer },
          { txt: "Aprueba el cuestionario de la actividad A2", done: ejercicioAprobado },
        ];
        return (
          <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
            <Eyebrow>
              <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
              Objetivos
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
              {objetivos.map((o, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#34D399" : T.text2 }}>
                  <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
                  <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Reto de la infografía ──────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-flag-checkered" style={{ marginRight: 8, color: accent }} />
          Reto
        </Eyebrow>
        <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>{RETO.intro}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {RETO.items.map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
              <i className="fa-solid fa-utensils" style={{ color: accent, fontSize: 12, marginTop: 2 }} />
              <span style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{it}</span>
            </div>
          ))}
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Las <strong>fórmulas</strong> de los monómeros (glucosa C₆H₁₂O₆, glicina C₂H₅NO₂, glicerol C₃H₈O₃) y la composición por elemento son <strong>valores reales</strong>. Las moléculas se dibujan como modelos de <strong>bolas y barras</strong> didácticos: el almidón y el péptido muestran 3 subunidades (no la cadena completa), y el triglicérido y la doble hélice de ADN son <strong>esquemas</strong> con átomos omitidos para mayor claridad, como se indica en cada nota. Contenido tomado de la infografía de la progresión 5.
        </span>
      </div>

      {/* ── Reto evaluable: el quiz verbatim del ancla ───────────────── */}
      <RetoQuizCard
        quiz={QUIZ_A2}
        accent={accent}
        rgba={color.rgba}
        aprobado={ejercicioAprobado}
        onAprobado={() => setEjercicioAprobado(true)}
        playSfx={
          sonido
            ? (ok) => {
                if (ok) audioRef.current?.correcto();
                else audioRef.current?.incorrecto();
              }
            : undefined
        }
        playPick={sonido ? () => audioRef.current?.blip() : undefined}
      />

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <div className="bio-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="bio-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="bio-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="bio-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="bio-drawer-body">
          <FichaTeorica data={BIOMOLECULAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
