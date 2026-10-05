"use client";

/**
 * Laboratorio 3D — "Gravitación universal: fuerza, peso y órbitas".
 * Práctica experimental para CNEYT-V-P03-A2 ("Cálculos de gravitación: fuerza,
 * peso y órbitas"; progresión 3 "Analiza la gravitación universal y sus
 * implicaciones en el sistema solar y la exploración espacial", UAC CNEYT-V
 * "La energía en procesos de vida diaria").
 *
 * Tres modos, uno por inciso del problema verbatim:
 *  (a) Fuerza  — la atracción Tierra–Luna con F = G·M·m/r² y la ley del inverso
 *      del cuadrado (mueve la distancia y observa cómo cae la fuerza).
 *  (b) Peso    — W = m·g sobre la Luna, Marte, la Tierra o Júpiter; la masa no
 *      cambia, el peso sí.
 *  (c) Órbita  — un satélite Mexsat alrededor de la Tierra; cuando su período
 *      iguala la rotación terrestre (35 786 km → 24 h) queda geoestacionario.
 * Toda la física es de cálculo cerrado (Gravitación universal y 3.ª ley de Kepler).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { GRAVITACION_FICHA } from "./gravitacion-universal-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./gravitacion-universal-data";
import { LabSfx } from "./lab-audio";
import {
  type Modo, resolverFuerza, resolverPeso, resolverOrbita, cuerpoPorId, CUERPOS,
  R_MIN, R_MAX, R_DEF, F_DEF,
  M_MIN, M_MAX, M_DEF, CUERPO_DEF,
  ALT_MIN, ALT_MAX, ALT_GEO, ALT_DEF, T_TIERRA_H,
  PROBLEMA, PASOS, IDEAS, DATOS,
  sci, fmt0, fmt1, fmt2, fmtKm,
} from "./gravitacion-data";

const GravitacionScene = dynamic(() => import("./GravitacionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-earth-americas fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Encendiendo el sistema Tierra–Luna…</span>
    </div>
  ),
});

const C_FUERZA = "#a78bfa";
const C_PESO = "#7dd3fc";
const C_ORBITA = "#34D399";

const MODOS: { id: Modo; etq: string; icono: string; col: string; desc: string }[] = [
  { id: "fuerza", etq: "Fuerza", icono: "fa-down-left-and-up-right-to-center", col: C_FUERZA, desc: "Atracción Tierra–Luna: F = G·M·m/r²" },
  { id: "peso",   etq: "Peso",   icono: "fa-weight-hanging",                   col: C_PESO,   desc: "Peso en distintos cuerpos: W = m·g" },
  { id: "orbita", etq: "Órbita", icono: "fa-satellite",                        col: C_ORBITA, desc: "Satélite geoestacionario: T = 2π·√(r³/GM)" },
];

const RETO_KEY = "cen-gravitacion-universal-reto";

export function LabGravitacion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("fuerza");
  const [r, setR] = useState<number>(R_DEF);          // (a)
  const [cuerpoId, setCuerpoId] = useState<string>(CUERPO_DEF); // (b)
  const [m, setM] = useState<number>(M_DEF);          // (b)
  const [alt, setAlt] = useState<number>(ALT_DEF);    // (c)
  const [t, setT] = useState<number>(0);              // (c) tiempo de simulación (h)
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
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

  // Reproduce el movimiento orbital (rAF) — solo en el modo órbita.
  useEffect(() => {
    if (modo !== "orbita" || !playing) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setT((prev) => {
        const next = prev + dt * 4;     // 4 h de simulación por segundo real
        return next >= 48 ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [modo, playing]);

  const bump = () => setResetNonce((n) => n + 1);
  const resetModo = () => {
    if (modo === "fuerza") setR(R_DEF);
    else if (modo === "peso") { setCuerpoId(CUERPO_DEF); setM(M_DEF); }
    else { setAlt(ALT_DEF); setT(0); }
    bump();
  };
  const cambiarModo = (nm: Modo) => {
    if (sonido) audioRef.current?.blip();
    setModo(nm);
    setT(0);
    bump();
  };

  // valores en vivo según el modo
  const fz = resolverFuerza(r);
  const cuerpo = cuerpoPorId(cuerpoId);
  const pz = resolverPeso(m, cuerpo.g);
  const orb = resolverOrbita(alt);

  const ratioF = fz.F / F_DEF;
  const verbatim =
    modo === "fuerza" ? r === R_DEF
    : modo === "peso" ? cuerpoId === CUERPO_DEF && m === M_DEF
    : alt === ALT_DEF;

  const modoActual = MODOS.find((x) => x.id === modo)!;
  const modoCol = modoActual.col;

  const objetivos = [
    { txt: "Duplica la distancia Tierra–Luna y comprueba que la fuerza baja a la cuarta parte", done: modo === "fuerza" && Math.abs(ratioF - 0.25) < 0.03, modo: "fuerza" },
    { txt: "Explora la fuerza gravitacional Tierra–Luna (modo Fuerza)", done: modo === "fuerza" && r !== R_DEF, modo: "fuerza" },
    { txt: "Compara el peso en distintos cuerpos celestes (modo Peso)", done: modo === "peso" || modo === "orbita", modo: ["peso", "orbita"] },
    { txt: "Descubre la órbita geoestacionaria Mexsat (modo Órbita)", done: modo === "orbita", modo: "orbita" },
    { txt: "Lleva el satélite a 35 786 km de altura: su período es de 24 h y parece fijo", done: modo === "orbita" && orb.geo, modo: "orbita" },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-earth-americas" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>F = G·M·m / r²</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero los números siguen aquí.
        {modo === "fuerza" && ` Fuerza Tierra–Luna a r = ${sci(r)} m: F = ${sci(fz.F)} N.`}
        {modo === "peso" && ` En ${cuerpo.nombre}, ${fmt0(m)} kg pesan ${fmt1(pz.W)} N.`}
        {modo === "orbita" && ` A ${fmtKm(alt)} km de altura el período es ${fmt1(orb.Th)} h.`}
      </div>
    </div>
  );

  const lectura =
    modo === "fuerza" ? <>F = {sci(fz.F)} N · {fmt1(ratioF)}× la del problema</>
    : modo === "peso" ? <>{cuerpo.nombre}: {fmt0(m)} kg pesan {fmt1(pz.W)} N</>
    : <>T = {fmt1(orb.Th)} h · v = {fmt2(orb.v / 1000)} km/s{orb.geo ? " · fija" : ""}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <GravitacionScene modo={modo} r={r} cuerpoId={cuerpoId} m={m} alt={alt} t={t} accent={accent} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      modos={{
        opciones: MODOS.map((mo) => ({ id: mo.id, etiqueta: mo.etq, icono: mo.icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          {modo === "orbita" && (
            <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Reproducir la órbita"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          )}
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar a los valores del problema" onClick={resetModo} />
        </>
      }
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <style>{`
                .gv-bodies { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 120px), 1fr)); gap:8px; }
                .gv-tab { cursor:pointer; border:1px solid var(--gvc); border-radius:12px; padding:10px 8px; text-align:center;
                  background:transparent; transition:all .15s; color:#fff; }
                .gv-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.7); }
                .gv-tab:hover { background:rgba(255,255,255,0.06); }
                .gv-btn { cursor:pointer; font-size:14px; font-weight:800; border-radius:10px; padding:10px 12px; text-align:left; }
              `}</style>

              {modo === "fuerza" && (
                <>
                  <Bloque titulo="Distancia Tierra–Luna" icono="fa-down-left-and-up-right-to-center">
                    <Deslizador label="distancia r (centro a centro)" icon="fa-arrows-left-right" colr={C_FUERZA}
                      valor={`${sci(r)} m`} min={R_MIN} max={R_MAX} step={0.01e8} value={r}
                      onChange={setR} hintL={`${sci(R_MIN)}`} hintR={`${sci(R_MAX)}`} />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <button type="button" className="gv-btn" onClick={() => setR(R_DEF)} style={{ color: C_FUERZA, background: `${C_FUERZA}1f`, border: `1px solid ${C_FUERZA}66` }}>
                        <i className="fa-solid fa-moon" style={{ marginRight: 7 }} aria-hidden />Distancia del problema
                      </button>
                      <button type="button" className="gv-btn" onClick={() => setR(2 * R_DEF)} style={{ color: C_FUERZA, background: `${C_FUERZA}1f`, border: `1px solid ${C_FUERZA}66` }}>
                        <i className="fa-solid fa-xmark" style={{ marginRight: 7 }} aria-hidden />Duplicar la distancia
                      </button>
                    </div>
                  </Bloque>
                  <Bloque titulo="Medidor: la fuerza" icono="fa-gauge-high">
                    <Barra txt="fuerza F" val={ratioF} max={Math.max(ratioF, 1) * 1.25} marca={1 / (Math.max(ratioF, 1) * 1.25) * 1} col={C_FUERZA} fmtv={`${fmt1(ratioF)}× la del problema`} />
                    <p style={{ margin: 0, color: T.text2 }}>
                      La marca blanca es la fuerza del problema ({sci(F_DEF)} N). Al duplicar la distancia, la fuerza baja a la <strong style={{ color: "#fff" }}>cuarta parte</strong>: ley del inverso del cuadrado.
                    </p>
                  </Bloque>
                  <Bloque titulo="Lecturas" icono="fa-list">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                      <Dato label="distancia r" value={`${sci(r)} m`} col={C_FUERZA} />
                      <Dato label="fuerza F" value={`${sci(fz.F)} N`} col={C_FUERZA} />
                      <Dato label="vs problema" value={`${fmt1(ratioF)}×`} />
                    </div>
                  </Bloque>
                </>
              )}

              {modo === "peso" && (
                <>
                  <Bloque titulo="Cuerpo y masa" icono="fa-weight-hanging">
                    <div className="gv-bodies">
                      {CUERPOS.map((c) => {
                        const on = c.id === cuerpoId;
                        return (
                          <button key={c.id} type="button" className="gv-tab" data-on={on} onClick={() => setCuerpoId(c.id)}
                            style={{ ["--gvc" as string]: c.color, background: on ? `${c.color}22` : "transparent" }}>
                            <div style={{ fontSize: 18, marginBottom: 3, color: on ? c.color : "inherit" }}><i className={`fa-solid ${c.icono}`} aria-hidden /></div>
                            <div style={{ fontSize: 14, fontWeight: 900 }}>{c.nombre}</div>
                            <div style={{ fontSize: 14, color: T.text3, marginTop: 2 }}>{c.rel}</div>
                          </button>
                        );
                      })}
                    </div>
                    <Deslizador label="masa m" icon="fa-weight-scale" colr={C_PESO}
                      valor={`${fmt0(m)} kg`} min={M_MIN} max={M_MAX} step={1} value={m}
                      onChange={setM} hintL={`${fmt0(M_MIN)}`} hintR={`${fmt0(M_MAX)}`} />
                  </Bloque>
                  <Bloque titulo="Medidor: tu peso" icono="fa-gauge-high">
                    <Barra txt={`peso en ${cuerpo.nombre}`} val={pz.W} max={Math.max(pz.W, pz.WTierra)} col={C_PESO} fmtv={`${fmt1(pz.W)} N`} />
                    <Barra txt="peso en la Tierra" val={pz.WTierra} max={Math.max(pz.W, pz.WTierra)} col="#94a3b8" fmtv={`${fmt0(pz.WTierra)} N`} />
                    <p style={{ margin: 0, color: T.text2 }}>
                      En <strong style={{ color: "#fff" }}>{cuerpo.nombre}</strong> pesas ≈ {fmt1(pz.kgf)} kg-fuerza. Tu masa, {fmt0(m)} kg, <strong style={{ color: "#fff" }}>no cambia</strong>.
                    </p>
                  </Bloque>
                  <Bloque titulo="Lecturas" icono="fa-list">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                      <Dato label="masa m" value={`${fmt0(m)} kg`} />
                      <Dato label="gravedad g" value={`${fmt2(cuerpo.g)} m/s²`} col={cuerpo.color} />
                      <Dato label="peso W" value={`${fmt1(pz.W)} N`} col={C_PESO} />
                      <Dato label="kg-fuerza" value={`${fmt1(pz.kgf)} kgf`} col={C_PESO} />
                    </div>
                  </Bloque>
                </>
              )}

              {modo === "orbita" && (
                <>
                  <Bloque titulo="Altura de la órbita" icono="fa-satellite">
                    <Deslizador label="altura sobre la superficie" icon="fa-arrows-up-to-line" colr={C_ORBITA}
                      valor={`${fmtKm(alt)} km`} min={ALT_MIN} max={ALT_MAX} step={100e3} value={alt}
                      onChange={setAlt} hintL={`${fmtKm(ALT_MIN)} km`} hintR={`${fmtKm(ALT_MAX)} km`} />
                    <button type="button" className="gv-btn" onClick={() => setAlt(ALT_GEO)} style={{ color: orb.geo ? "#04121f" : C_ORBITA, background: orb.geo ? C_ORBITA : `${C_ORBITA}1f`, border: `1px solid ${C_ORBITA}66` }}>
                      <i className="fa-solid fa-satellite-dish" style={{ marginRight: 7 }} aria-hidden />Ir a la geoestacionaria (35 786 km)
                    </button>
                  </Bloque>
                  <Bloque titulo="Medidor: el período" icono="fa-gauge-high">
                    <Barra txt="período T del satélite" val={orb.Th} max={Math.max(orb.Th, T_TIERRA_H) * 1.25} marca={T_TIERRA_H / (Math.max(orb.Th, T_TIERRA_H) * 1.25)} col={orb.geo ? C_ORBITA : "#94a3b8"} fmtv={`${fmt1(orb.Th)} h`} />
                    <p style={{ margin: 0, color: orb.geo ? C_ORBITA : T.text2, fontWeight: 700 }}>
                      {orb.geo
                        ? "T = 24 h, igual a la rotación terrestre: el satélite parece FIJO."
                        : `La marca blanca son las 24 h de la Tierra. El satélite ${orb.Th < T_TIERRA_H ? "adelanta" : "se retrasa respecto"} a la Tierra y se mueve por el cielo.`}
                    </p>
                  </Bloque>
                  <Bloque titulo="Lecturas" icono="fa-list">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                      <Dato label="altura" value={`${fmtKm(alt)} km`} col={C_ORBITA} />
                      <Dato label="período T" value={`${fmt1(orb.Th)} h`} col={orb.geo ? C_ORBITA : "#fff"} />
                      <Dato label="rapidez v" value={`${fmt2(orb.v / 1000)} km/s`} col={C_ORBITA} />
                      <Dato label="estado" value={orb.geo ? "fija" : "móvil"} col={orb.geo ? C_ORBITA : "#9fb4cc"} />
                    </div>
                  </Bloque>
                </>
              )}

              {!verbatim && (
                <button type="button" className="gv-btn" onClick={resetModo} style={{ marginTop: 16, color: modoCol, background: `${modoCol}22`, border: `1px solid ${modoCol}55` }}>
                  <i className="fa-solid fa-rotate-left" style={{ marginRight: 7 }} aria-hidden />Volver al problema
                </button>
              )}
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
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
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="El problema" icono="fa-meteor">
                <p style={{ margin: 0, color: T.text2 }}>{PROBLEMA}</p>
              </Bloque>
              <Bloque titulo="Respuestas" icono="fa-square-check">
                <Respuesta etq="a" col={C_FUERZA} txt={`F ≈ ${sci(F_DEF)} N`} sub="atracción gravitacional Tierra–Luna" />
                <Respuesta etq="b" col={C_PESO} txt="113.4 N ≈ 11.6 kg-fuerza" sub="peso de 70 kg en la Luna (≈ 1/6 del terrestre)" />
                <Respuesta etq="c" col={C_ORBITA} txt="T = 24 h" sub="período = rotación terrestre ⇒ geoestacionaria" />
              </Bloque>
              <Bloque titulo="Procedimiento" icono="fa-list-ol">
                {PASOS.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                    <div style={{ minWidth: 24, height: 24, padding: "0 4px", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</div>
                    <div style={{ color: "#fff", minWidth: 0 }}>{p.texto}</div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Datos" icono="fa-gauge-high">
                {DATOS.map((dd, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <i className={`fa-solid ${dd.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                    <div>
                      <strong style={{ fontFamily: "ui-monospace, monospace" }}>{dd.valor}</strong>
                      <div style={{ color: T.text2 }}>{dd.texto}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={GRAVITACION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Física exacta de cálculo cerrado: Ley de Gravitación Universal (F = G·M·m/r²), peso (W = m·g, con g_Tierra = 9.81 m/s²) y órbita circular con la 3.ª ley de Kepler (T = 2π·√(r³/GM), v = √(GM/r)). Tamaños y distancias del sistema solar <strong>no</strong> están a escala real (la Luna está 30 diámetros terrestres más lejos de lo que cabe en pantalla); las longitudes de las flechas son proporcionales a sus magnitudes (acotadas para verse). El radio de la órbita sí es proporcional al radio terrestre. Valores, datos y procedimiento son verbatim del enunciado A2.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Barra del medidor, con marca de referencia opcional (fracción 0–1) ─────── */
function Barra({ txt, val, max, col, fmtv, marca }: { txt: string; val: number; max: number; col: string; fmtv: string; marca?: number }) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
        <span>{txt}</span><span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtv}</span>
      </div>
      <div style={{ position: "relative", height: 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, Math.max(0, (val / max) * 100))}%`, height: "100%", background: col, transition: "width 120ms linear" }} />
        {marca != null && (
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${Math.min(99, Math.max(0, marca * 100))}%`, width: 2, background: "#fff" }} />
        )}
      </div>
    </div>
  );
}

/* ── Tarjeta de respuesta ─────────────────────────────────────────────────── */
function Respuesta({ etq, col, txt, sub }: { etq: string; col: string; txt: string; sub: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}44` }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#04121f", background: col, flexShrink: 0 }}>{etq}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{txt}</div>
        <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.3 }}>{sub}</div>
      </div>
    </div>
  );
}
