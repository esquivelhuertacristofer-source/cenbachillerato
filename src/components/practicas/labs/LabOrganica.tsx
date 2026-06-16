"use client";

/**
 * Laboratorio 3D — Visor molecular de química orgánica.
 * Práctica experimental para CNEYT-IV-P04-A1 (lectura "Química orgánica:
 * alcanos, alquenos, alcoholes y ácidos carboxílicos"; UAC "Reacciones
 * químicas", progresión 4).
 *
 * El alumno elige una de las CUATRO familias y un compuesto representativo, gira
 * la molécula ball-and-stick en 3D y resalta su grupo funcional (–OH, –COOH o el
 * doble enlace C=C) para ver de un vistazo qué define a esa familia. Composición
 * (nº de C, H, O), fórmula y grupo funcional son los reales del compuesto; las
 * geometrías son representaciones didácticas (ángulos sp3/sp2, no distancias de
 * enlace exactas).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  FAMILIAS, compuesto, familiaInfo, compuestosDe,
  IDEAS, DATOS, COMP_DEF, type Familia,
} from "./organica-data";
import { FichaTeorica } from "./_ficha";
import { ORGANICA_FICHA } from "./organica-visor-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./organica-visor-data";
import { LabSfx } from "./lab-audio";

const OrganicaScene = dynamic(() => import("./OrganicaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-atom fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Construyendo la molécula…</span>
    </div>
  ),
});

export function LabOrganica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [compId, setCompId] = useState(COMP_DEF);
  const [resaltarFG, setResaltarFG] = useState(true);
  const [girar, setGirar] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
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

  const comp = useMemo(() => compuesto(compId), [compId]);
  const fam = useMemo(() => familiaInfo(comp.familia), [comp.familia]);
  const fgColor = fam.color;

  const elegirFamilia = (id: Familia) => {
    const lista = compuestosDe(id);
    if (lista.length > 0) {
      setCompId(lista[0]!.id);
      if (sonido) audioRef.current?.blip();
    }
  };
  const reiniciar = () => setResetNonce((n) => n + 1);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-atom" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{comp.nombre} ({comp.formula})</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: es un {fam.label.toLowerCase().replace(/s$/, "")}, grupo funcional {fam.grupoFuncional.toLowerCase()}.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes orgPulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .org-live-dot { animation: orgPulse 1.6s ease-in-out infinite; }
        .org-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .org-grid { grid-template-columns: 1fr; } }
        .org-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .org-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .org-icobtn:hover { background:rgba(255,255,255,0.12); }
        .org-fam { cursor:pointer; padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .15s; text-align:left; display:flex; align-items:center; gap:9px; }
        .org-fam:hover { border-color:var(--fc); color:#fff; }
        .org-fam[data-on="true"] { border-color:var(--fc); background:color-mix(in srgb, var(--fc) 16%, transparent); color:#fff; }
        .org-comp { cursor:pointer; padding:7px 12px; border-radius:999px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; font-family:ui-monospace, monospace; }
        .org-comp:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .org-comp[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
        @media (max-width: 1000px){ .org-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .ex-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ex-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ex-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .ex-drawer[data-open="true"] { transform:translateX(0); }
        .ex-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ex-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ex-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ex-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ex-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .ex-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      <div className="org-grid">
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
              <OrganicaScene
                molId={comp.id}
                atoms={comp.atoms}
                bonds={comp.bonds}
                accent={accent}
                fgColor={fgColor}
                resaltarFG={resaltarFG}
                girar={girar}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="org-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{comp.formula}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text2 }}>{comp.nombre}</span>
            </div>

            {/* Badge familia / grupo funcional */}
            <div style={{ position: "absolute", top: 58, left: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${fgColor}88`, backdropFilter: "blur(10px)" }}>
              <i className={`fa-solid ${fam.icono}`} style={{ color: fgColor, fontSize: 12 }} />
              <span style={{ fontSize: 11.5, fontWeight: 900, color: fgColor }}>{fam.label} · {fam.grupoFuncional}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="org-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="org-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="org-icobtn" data-on={resaltarFG} onClick={() => setResaltarFG((v) => !v)} title="Resaltar el grupo funcional">
                <i className="fa-solid fa-highlighter" />
              </button>
              <button className="org-icobtn" data-on={girar} onClick={() => setGirar((v) => !v)} title="Girar la molécula">
                <i className={`fa-solid ${girar ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="org-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="org-icobtn" onClick={reiniciar} title="Recentrar la vista">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: composición en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${fam.icono}`} style={{ color: fgColor, marginRight: 7 }} />
                {comp.nombre}: <strong style={{ color: fgColor }}>{comp.nC} C</strong> · <strong style={{ color: fgColor }}>{comp.nH} H</strong>{comp.nO > 0 ? <> · <strong style={{ color: fgColor }}>{comp.nO} O</strong></> : null}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                {resaltarFG ? <>El grupo funcional <strong style={{ color: fgColor }}>{fam.grupoFuncional}</strong> está resaltado.</> : <>Pulsa el resaltador para ver el grupo funcional.</>}
              </div>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Selector de familia */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-layer-group" style={{ marginRight: 8, color: accent }} />
              Las cuatro familias orgánicas
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {FAMILIAS.map((f) => (
                <button key={f.id} className="org-fam" data-on={f.id === comp.familia} onClick={() => elegirFamilia(f.id)}
                  style={{ ["--fc" as string]: f.color }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#04121f", background: f.color, flexShrink: 0 }}>
                    <i className={`fa-solid ${f.icono}`} />
                  </span>
                  <span>
                    <span style={{ color: "#fff", fontWeight: 900, display: "block" }}>{f.label}</span>
                    <span style={{ fontSize: 11, color: T.text2, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{f.grupoFuncional}</span>
                  </span>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "18px 0 9px" }}>COMPUESTOS DE ESTA FAMILIA</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {compuestosDe(comp.familia).map((c) => (
                <button key={c.id} className="org-comp" data-on={c.id === compId} onClick={() => setCompId(c.id)} title={c.nombre}>
                  {c.formula} <span style={{ opacity: 0.7, fontFamily: "system-ui, sans-serif" }}>· {c.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Ficha del compuesto */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${fgColor}55`, background: `color-mix(in srgb, ${fgColor} 10%, transparent)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: fgColor }}>
                <i className={`fa-solid ${fam.icono}`} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", lineHeight: 1.1, fontFamily: "ui-monospace, monospace" }}>{comp.formula}</div>
                <div style={{ fontSize: 12, color: fgColor, fontWeight: 800 }}>{comp.nombre} · {fam.label}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 12px", fontSize: 12.5 }}>
              <span style={{ color: T.text3, fontWeight: 800 }}>Grupo funcional</span>
              <span style={{ color: "#fff", fontWeight: 700 }}>{fam.grupoFuncional}</span>
              <span style={{ color: T.text3, fontWeight: 800 }}>Fórmula general</span>
              <span style={{ color: "#fff", fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{fam.formulaGeneral}</span>
              <span style={{ color: T.text3, fontWeight: 800 }}>Enlaces</span>
              <span style={{ color: "#fff", fontWeight: 700 }}>{comp.enlaces}</span>
            </div>
          </div>

          {/* Uso / contexto en México */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />
              ¿Para qué sirve? (contexto)
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{comp.contexto}</div>
          </div>

          {/* Reactividad */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-bolt" style={{ marginRight: 8, color: accent }} />
              Reactividad
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{comp.reactividad}</div>
          </div>

          {/* Qué define a esta familia */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className={`fa-solid ${fam.icono}`} style={{ marginRight: 8, color: fgColor }} />
              Qué define a los {fam.label.toLowerCase()}
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{fam.descripcion}</div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="org-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Lecturas del compuesto
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Readout label="carbonos" value={`${comp.nC}`} col={accent} size={18} />
            <Readout label="hidrógenos" value={`${comp.nH}`} col="#E8EEF5" size={18} />
            <Readout label="oxígenos" value={`${comp.nO}`} col={comp.nO > 0 ? "#FF6B6B" : T.text3} size={18} />
            <Readout label="familia" value={fam.label.replace(/s$/, "")} col={fgColor} size={13} />
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

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La composición (número de C, H y O), la fórmula y el grupo funcional son los <strong>valores reales</strong> de cada compuesto. Las moléculas se dibujan como modelos de <strong>bolas y barras</strong> con ángulos tetraédricos (sp3, 109.5°) y trigonales planos (sp2, 120°): son representaciones <strong>didácticas</strong>, no las distancias de enlace reales. Compuestos tomados de la lectura de la progresión 4.
        </span>
      </div>

      {/* ── Objetivos guiados ──────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {[
            { txt: "Explora las cuatro familias orgánicas", done: FAMILIAS.every((f) => f.id === comp.familia || compuestosDe(f.id).length > 0) && comp.familia !== COMP_DEF.split("-")[0] },
            { txt: "Identifica un grupo funcional resaltado", done: resaltarFG },
            { txt: "Observa un alqueno (doble enlace C=C)", done: comp.familia === "alqueno" },
            { txt: "Aprueba el cuestionario de la actividad A2", done: ejercicioAprobado },
          ].map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#34D399" : T.text2 }}>
              <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
        </div>
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
      <div className="ex-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ex-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ex-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ex-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ex-drawer-body">
          <FichaTeorica data={ORGANICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
