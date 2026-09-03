"use client";

/**
 * Laboratorio 3D — Notación científica.
 * Práctica experimental para PM-I-P06-A6.
 *
 * El estudiante arma un número en notación científica (mantisa a × 10ⁿ) y ve:
 *   · cómo el EXPONENTE corre el punto decimal y agranda o achica el número;
 *   · dónde cae ese tamaño en una torre de escalas reales (del átomo al Sol);
 *   · que CONVERTIR de unidad (m ↔ km ↔ mm) solo cambia el exponente.
 * Pensamiento Matemático I.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { NOTACION_CIENTIFICA_FICHA } from "./notacion-cientifica-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./notacion-cientifica-data";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";
import {
  REFERENCIAS,
  N_MIN,
  N_MAX,
  A_MIN,
  A_MAX,
  expandir,
  agrupar,
  fmtA,
  type Referencia,
} from "./notacion-data";

const NotacionScene = dynamic(() => import("./NotacionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-up-right-and-down-left-from-center fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const Sci = ({ a, n, unidad }: { a: string; n: number; unidad?: string }) => (
  <span style={{ ...NUM }}>
    {a} × 10<sup style={{ fontSize: "0.62em" }}>{n}</sup>
    {unidad ? ` ${unidad}` : ""}
  </span>
);

const RETO_KEY = "cen-notacion-cientifica-reto";

export function LabNotacionCientifica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [a, setA] = useState(1.7);
  const [n, setN] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable, teoría (cajón deslizable) y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
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

  // seguimiento de objetivos
  const [movioExp, setMovioExp] = useState(false);
  const [vioGrande, setVioGrande] = useState(false);
  const [vioPequeno, setVioPequeno] = useState(false);
  const [refsVistas, setRefsVistas] = useState<Set<string>>(() => new Set<string>());

  const moverN = (v: number) => {
    setN(v);
    setMovioExp(true);
    if (sonido) audioRef.current?.blip();
    if (v >= 6) setVioGrande(true);
    if (v <= -6) setVioPequeno(true);
  };
  const irA = (r: Referencia) => {
    setA(r.a);
    setN(r.n);
    setMovioExp(true);
    if (r.n >= 6) setVioGrande(true);
    if (r.n <= -6) setVioPequeno(true);
    setRefsVistas((prev) => {
      if (prev.has(r.key)) return prev;
      const next = new Set(prev);
      next.add(r.key);
      return next;
    });
  };
  const reset = () => setResetNonce((k) => k + 1);

  const decimal = useMemo(() => agrupar(expandir(a, n)), [a, n]);
  const aStr = fmtA(a);
  const nKm = n - 3; // 1 m = 10⁻³ km
  const nMm = n + 3; // 1 m = 10³ mm

  const objetivos = [
    { txt: "Mueve el exponente y observa el punto decimal", done: movioExp },
    { txt: "Llega a un número muy grande (n ≥ 6)", done: vioGrande },
    { txt: "Llega a un número muy pequeño (n ≤ −6)", done: vioPequeno },
    { txt: "Visita 3 referencias reales", done: refsVistas.size >= 3 },
    { txt: "Resuelve el reto de notación científica", done: ejercicioAprobado },
  ];
  // Los objetivos se recuerdan (algunos dependían del modo y se desmarcaban
  // solos) y se convierten en la marca del laboratorio, que antes no se
  // guardaba en ninguna parte.
  const { logros: logrosLab, cumplidos: cumplidosLab, total: totalLab } = useLogros(objetivos.map((o) => o.done));
  const { registraEstrellas } = useEstrellas(RETO_KEY);
  useEffect(() => {
    if (cumplidosLab === 0) return;
    const est = cumplidosLab >= totalLab ? 3 : cumplidosLab >= Math.ceil((totalLab * 2) / 3) ? 2 : 1;
    registraEstrellas(est);
  }, [cumplidosLab, totalLab, registraEstrellas]);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-ruler-vertical" />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>
        <Sci a={aStr} n={n} unidad="m" />
      </div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la torre de escalas 3D, pero la idea sigue: en forma desarrollada son <strong style={{ color: T.text, ...NUM }}>{decimal} m</strong>.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulse 1.6s ease-in-out infinite; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-divider { height:1px; background:${T.line}; margin:18px 0; }
        .ex-ref { cursor:pointer; text-align:left; border-radius:11px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          padding:9px 11px; transition:all .14s ease; display:flex; align-items:center; gap:10px; }
        .ex-ref:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .ex-ref[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .ex-slider { -webkit-appearance:none; appearance:none; width:100%; height:7px; border-radius:999px; background:${T.lineStrong}; outline:none; cursor:pointer; }
        .ex-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:21px; height:21px; border-radius:50%; background:#fff; border:3px solid ${accent}; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-slider::-moz-range-thumb { width:21px; height:21px; border-radius:50%; background:#fff; border:3px solid ${accent}; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }

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

      <div className="ex-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(460px, 66vh, 780px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 50% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06182f 0%,#020d1d 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <NotacionScene a={a} n={n} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent }}>
                <Sci a={aStr} n={n} unidad="m" />
              </span>
            </div>

            {/* Etiqueta inferior */}
            <div style={{ position: "absolute", bottom: 16, left: 18, fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", pointerEvents: "none" }}>
              <i className="fa-solid fa-layer-group" style={{ marginRight: 7, color: accent }} />
              Torre de escalas · del átomo (10⁻¹⁰ m) al Sol (10⁹ m)
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar vista">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>
            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Controles: mantisa y exponente */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>Arma el número: mantisa × 10 elevado al exponente</Eyebrow>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "4px 0 9px" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Mantisa (a)</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: accent, ...NUM }}>{aStr}</span>
            </div>
            <input className="ex-slider" type="range" min={A_MIN} max={A_MAX} step={0.1} value={a} onChange={(e) => { setA(Number(e.target.value)); setMovioExp(true); }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: T.text3, ...NUM }}>
              <span>1.0</span>
              <span style={{ color: T.text2 }}>1 ≤ a &lt; 10</span>
              <span>9.9</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "16px 0 9px" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Exponente (n)</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: accent, ...NUM }}>{n >= 0 ? `+${n}` : n}</span>
            </div>
            <input className="ex-slider" type="range" min={N_MIN} max={N_MAX} step={1} value={n} onChange={(e) => moverN(Number(e.target.value))} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: T.text3, ...NUM }}>
              <span>{N_MIN} (pequeño)</span>
              <span>0</span>
              <span>+{N_MAX} (grande)</span>
            </div>

            <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 16 }}>
              <Readout label="Notación científica" value={`${aStr}·10^${n}`} col={accent} size={15} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Forma desarrollada (m)" value={decimal} size={15} />
            </div>
          </div>

          {/* El corazón: punto decimal + conversiones */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>El exponente mueve el punto decimal</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>
              {n === 0 ? (
                <>Con <strong style={{ color: T.text }}>n = 0</strong> el número es la mantisa tal cual: <strong style={{ color: T.text, ...NUM }}>{decimal}</strong>. </>
              ) : n > 0 ? (
                <>El exponente <strong style={{ color: accent }}>+{n}</strong> corre el punto <strong style={{ color: T.text }}>{n} {n === 1 ? "lugar" : "lugares"} a la derecha</strong>: el número se hace <strong style={{ color: T.text }}>grande</strong>. </>
              ) : (
                <>El exponente <strong style={{ color: accent }}>{n}</strong> corre el punto <strong style={{ color: T.text }}>{-n} {(-n) === 1 ? "lugar" : "lugares"} a la izquierda</strong>: el número se hace <strong style={{ color: T.text }}>pequeño</strong>. </>
              )}
              <strong style={{ color: T.text }}>
                <Sci a={aStr} n={n} /> = <span style={{ ...NUM }}>{decimal}</span>
              </strong>
            </div>

            <div style={{ marginTop: 16 }}>
              <Eyebrow>Misma medida, otra unidad — solo cambia el exponente</Eyebrow>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { u: "kilómetros", abbr: "km", nn: nKm },
                  { u: "metros", abbr: "m", nn: n },
                  { u: "milímetros", abbr: "mm", nn: nMm },
                ].map((c) => (
                  <div key={c.abbr} style={{ borderRadius: 12, border: `1px solid ${c.abbr === "m" ? `${accent}66` : T.line}`, background: c.abbr === "m" ? `${accent}14` : T.inset, padding: "11px 12px" }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", color: T.text3, textTransform: "uppercase", marginBottom: 5 }}>{c.u}</div>
                    <div style={{ fontSize: 14.5, fontWeight: 900, color: c.abbr === "m" ? accent : T.text }}>
                      <Sci a={aStr} n={c.nn} unidad={c.abbr} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Salta a un tamaño real</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {REFERENCIAS.map((r) => (
              <button key={r.key} className="ex-ref" data-on={r.n === n} onClick={() => irA(r)}>
                <i className={`fa-solid ${r.icono}`} style={{ fontSize: 15, width: 18, textAlign: "center", color: r.n === n ? accent : T.text3 }} />
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{r.nombre}</span>
                  <span style={{ fontSize: 10.5, color: T.text3, ...NUM }}>10<sup>{r.n}</sup> m</span>
                </span>
              </button>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Marcador</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Mantisa" value={aStr} col={accent} size={15} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Exponente" value={n >= 0 ? `+${n}` : `${n}`} size={15} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Saltos ×10" value={`${Math.abs(n)}`} size={15} />
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            La mantisa siempre va de <strong style={{ color: T.text }}>1 a casi 10</strong>. Si al multiplicar se pasa de 10, sube un escalón el exponente; ese es el truco para comparar tamaños enormes con números pequeños.
          </div>
        </div>
      </div>

      {/* ── Objetivos + pista ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
            Objetivos
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {objetivos.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: logrosLab[i] ? OK : T.text2 }}>
                <i className={`fa-solid ${logrosLab[i] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: logrosLab[i] ? 1 : 0.3 }} />
                <span style={{ fontWeight: logrosLab[i] ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: "18px 20px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 13 }}>
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            La notación científica vuelve manejables los números <strong style={{ color: T.text }}>enormes</strong> y <strong style={{ color: T.text }}>diminutos</strong>: en lugar de contar ceros, lees el <strong style={{ color: accent }}>exponente</strong>. Por eso del átomo al Sol hay solo <strong style={{ color: T.text }}>19 saltos de ×10</strong>.
          </span>
        </div>
      </div>
      {/* ── Reto evaluable: el ejercicio verbatim del ancla A2 ────────── */}
      <RetoNumericoCard
        reto={RETO_A2}
        accent={accent}
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
          <FichaTeorica data={NOTACION_CIENTIFICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
