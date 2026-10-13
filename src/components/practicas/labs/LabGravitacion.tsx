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
import { CREDITO_ESPACIO } from "./_espacio";
import type { VistaOrbita } from "./GravitacionScene";
import {
  type Modo, resolverFuerza, resolverPeso, resolverOrbita, cuerpoPorId, CUERPOS,
  R_MIN, R_MAX, R_DEF, F_DEF,
  M_MIN, M_MAX, M_DEF, CUERPO_DEF,
  ALT_MIN, ALT_MAX, ALT_GEO, ALT_DEF, T_TIERRA_H,
  PROBLEMA, PASOS, IDEAS, DATOS,
  sci, fmt0, fmt1, fmt2, fmtKm,
  mareaRelativa, resolverSalto, V_SALTO, ORBITA_EEI, NOTA_JUPITER,
} from "./gravitacion-data";
import { CurvaGravitacion } from "./gravitacion-curvas";

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

const VISTAS: { id: VistaOrbita; etq: string; icono: string; desc: string }[] = [
  { id: "espacio", etq: "Desde el espacio", icono: "fa-earth-americas", desc: "Cámara fija respecto a las estrellas: la Tierra gira y el satélite le da la vuelta." },
  { id: "tierra", etq: "Girando con la Tierra", icono: "fa-arrows-spin", desc: "La cámara gira con la Tierra, como la ve alguien en México: si el satélite es geoestacionario, se queda quieto; lo que se mueve es el cielo." },
  { id: "satelite", etq: "Desde el satélite", icono: "fa-satellite", desc: "Vas montado detrás del satélite: en la geoestacionaria, México se queda siempre debajo de ti." },
];

const RETO_KEY = "cen-gravitacion-universal-reto";

export function LabGravitacion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("fuerza");
  const [r, setR] = useState<number>(R_DEF);          // (a)
  const [cuerpoId, setCuerpoId] = useState<string>(CUERPO_DEF); // (b)
  const [m, setM] = useState<number>(M_DEF);          // (b)
  const [alt, setAlt] = useState<number>(ALT_DEF);    // (c)
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);
  // agregados de la escena «élite»
  const [mareas, setMareas] = useState<boolean>(true);          // (a) abultamiento de marea
  const [salto, setSalto] = useState<number>(0);                // (b) contador de saltos
  const [saltosEn, setSaltosEn] = useState<string[]>([]);       // (b) cuerpos donde ya saltó
  const [velocidad, setVelocidad] = useState<number>(3);        // (c) horas simuladas por segundo
  const [vista, setVista] = useState<VistaOrbita>("espacio");   // (c) punto de vista
  const [eei, setEei] = useState<boolean>(false);               // (c) comparar con la EEI

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

  // El movimiento orbital lo lleva la escena (useFrame): aquí solo se decide
  // si el tiempo corre (`playing`) y a qué velocidad.

  const bump = () => setResetNonce((n) => n + 1);
  const resetModo = () => {
    if (modo === "fuerza") setR(R_DEF);
    else if (modo === "peso") { setCuerpoId(CUERPO_DEF); setM(M_DEF); }
    else { setAlt(ALT_DEF); setVista("espacio"); }
    bump();
  };
  const cambiarModo = (nm: Modo) => {
    if (sonido) audioRef.current?.blip();
    setModo(nm);
    bump();
  };
  const saltar = () => {
    if (sonido) audioRef.current?.blip();
    setSalto((n) => n + 1);
    setSaltosEn((prev) => (prev.includes(cuerpoId) ? prev : [...prev, cuerpoId]));
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

  const salt = resolverSalto(cuerpo.g);
  const marea = mareaRelativa(r);
  const saltoLunaJupiter = saltosEn.includes("luna") && saltosEn.includes("jupiter");

  const objetivos = [
    { txt: "Duplica la distancia Tierra–Luna y comprueba que la fuerza baja a la cuarta parte", done: modo === "fuerza" && Math.abs(ratioF - 0.25) < 0.03, modo: "fuerza" },
    { txt: "Explora la fuerza gravitacional Tierra–Luna (modo Fuerza)", done: modo === "fuerza" && r !== R_DEF, modo: "fuerza" },
    { txt: "Haz saltar al astronauta en la Luna y en Júpiter: mismo impulso, ¿dónde sube más?", done: saltoLunaJupiter, modo: "peso" },
    { txt: "Compara el peso en distintos cuerpos celestes (modo Peso)", done: modo === "peso" || modo === "orbita", modo: ["peso", "orbita"] },
    { txt: "Descubre la órbita geoestacionaria Mexsat (modo Órbita)", done: modo === "orbita", modo: "orbita" },
    { txt: "Lleva el satélite a 35 786 km de altura: su período es de 24 h y parece fijo", done: modo === "orbita" && orb.geo, modo: "orbita" },
    { txt: "Mira la órbita «Girando con la Tierra»: el Mexsat geoestacionario no se mueve sobre México", done: modo === "orbita" && orb.geo && vista === "tierra", modo: "orbita" },
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
          <GravitacionScene modo={modo} r={r} mareas={mareas} cuerpoId={cuerpoId} m={m} salto={salto}
            alt={alt} playing={playing} velocidad={velocidad} vista={vista} eei={eei}
            accent={accent} resetNonce={resetNonce} />
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
          {modo === "peso" && (
            <BotonHerramienta icono="fa-person-running" titulo="Saltar (mismo impulso en todos los cuerpos)" onClick={saltar} />
          )}
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
                    <CurvaGravitacion tipo="fuerza" x={r / R_DEF} y={ratioF} col={C_FUERZA} />
                  </Bloque>
                  <Bloque titulo="Mareas" icono="fa-water">
                    <button type="button" className="gv-btn" aria-pressed={mareas} onClick={() => setMareas((v) => !v)}
                      style={{ color: mareas ? "#04121f" : "#7dd3fc", background: mareas ? "#7dd3fc" : "#7dd3fc1f", border: "1px solid #7dd3fc66" }}>
                      <i className="fa-solid fa-water" style={{ marginRight: 7 }} aria-hidden />{mareas ? "Ocultar el abultamiento del océano" : "Mostrar el abultamiento del océano"}
                    </button>
                    <p style={{ margin: 0, color: T.text2 }}>
                      La Luna jala más fuerte el lado de la Tierra que tiene enfrente que el lado opuesto: el océano se estira hacia los dos lados (en la escena, muy exagerado). Esa diferencia cae como <strong style={{ color: "#fff" }}>1/r³</strong>: ahora la marea es <strong style={{ color: "#fff" }}>{fmt2(marea)}×</strong> la de la distancia del problema.
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
                  <Bloque titulo="Experimento: el salto" icono="fa-person-running">
                    <button type="button" className="gv-btn" onClick={saltar} style={{ color: "#04121f", background: C_PESO, border: `1px solid ${C_PESO}` }}>
                      <i className="fa-solid fa-person-running" style={{ marginRight: 7 }} aria-hidden />Saltar en {cuerpo.nombre}
                    </button>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                      <Dato label="altura del salto" value={`${fmt2(salt.h)} m`} col={C_PESO} />
                      <Dato label="tiempo en el aire" value={`${fmt2(salt.tAire)} s`} col={C_PESO} />
                    </div>
                    <p style={{ margin: 0, color: T.text2 }}>
                      Despega siempre a {fmt2(V_SALTO)} m/s (lo que en la Tierra sube 0.5 m). Con menos g sube más y tarda más en caer: h = v²/(2g). Mientras vuela, la báscula marca <strong style={{ color: "#fff" }}>0 N</strong> aunque la gravedad sigue jalando: va en caída libre.
                    </p>
                    {cuerpo.id === "jupiter" && <p style={{ margin: 0, color: "#fcd34d" }}>{NOTA_JUPITER}</p>}
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
                    <CurvaGravitacion tipo="periodo" x={alt / 1000} y={orb.Th} col={C_ORBITA} />
                  </Bloque>
                  <Bloque titulo="Punto de vista" icono="fa-video">
                    <div className="gv-bodies">
                      {VISTAS.map((vv) => {
                        const on = vv.id === vista;
                        return (
                          <button key={vv.id} type="button" className="gv-tab" data-on={on} onClick={() => setVista(vv.id)}
                            style={{ ["--gvc" as string]: C_ORBITA, background: on ? `${C_ORBITA}22` : "transparent" }}>
                            <div style={{ fontSize: 18, marginBottom: 3, color: on ? C_ORBITA : "inherit" }}><i className={`fa-solid ${vv.icono}`} aria-hidden /></div>
                            <div style={{ fontSize: 14, fontWeight: 900 }}>{vv.etq}</div>
                          </button>
                        );
                      })}
                    </div>
                    <p style={{ margin: 0, color: T.text2 }}>{VISTAS.find((vv) => vv.id === vista)!.desc}</p>
                  </Bloque>
                  <Bloque titulo="Tiempo y comparación" icono="fa-clock">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {[1, 3, 8].map((vel) => (
                        <button key={vel} type="button" className="gv-btn" aria-pressed={velocidad === vel} onClick={() => setVelocidad(vel)}
                          style={{ color: velocidad === vel ? "#04121f" : C_ORBITA, background: velocidad === vel ? C_ORBITA : `${C_ORBITA}1f`, border: `1px solid ${C_ORBITA}66` }}>
                          {vel} h por segundo
                        </button>
                      ))}
                    </div>
                    <button type="button" className="gv-btn" aria-pressed={eei} onClick={() => setEei((x) => !x)}
                      style={{ color: eei ? "#04121f" : "#fde68a", background: eei ? "#fde68a" : "#fde68a1f", border: "1px solid #fde68a66" }}>
                      <i className="fa-solid fa-satellite" style={{ marginRight: 7 }} aria-hidden />{eei ? "Quitar la Estación Espacial" : "Comparar con la Estación Espacial (400 km)"}
                    </button>
                    {eei && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                        <Dato label="período EEI" value={`${fmt0(ORBITA_EEI.Th * 60)} min`} col="#fde68a" />
                        <Dato label="rapidez EEI" value={`${fmt2(ORBITA_EEI.v / 1000)} km/s`} col="#fde68a" />
                      </div>
                    )}
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
              <Bloque titulo="Qué está a escala y qué no" icono="fa-ruler-combined">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  <li><strong style={{ color: "#fff" }}>Fuerza:</strong> la Tierra y la Luna SÍ están a escala entre sí (la Luna mide 0.27 Tierras). La distancia en pantalla es proporcional a r, pero 10 veces más corta que la real (16 veces en celular; la real es de 60 radios terrestres). Las flechas miden proporcional a F; si no caben entre los dos cuerpos se recortan y la etiqueta lo dice. El abultamiento de la marea está muy exagerado (en el océano abierto es de menos de un metro).</li>
                  <li><strong style={{ color: "#fff" }}>Peso:</strong> los cuerpos NO están a escala (Júpiter es 11 veces más grande que la Tierra y la Luna, casi 4 veces más chica) y el astronauta está agrandado. La flecha W sí es proporcional al peso, y el salto sigue h = v²/(2g) y t = 2v/g en tiempo real.</li>
                  <li><strong style={{ color: "#fff" }}>Órbita:</strong> el radio de cada órbita SÍ es proporcional al radio terrestre (por eso la EEI casi roza la Tierra y el Mexsat queda a 6.6 radios). Los satélites están muy agrandados. La Tierra gira una vez por día sideral (23 h 56 min), que es el período real de la órbita geoestacionaria. Cerca de 35 786 km la escena mantiene al satélite en su lugar, como lo hacen sus motores de control de posición.</li>
                </ul>
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Física exacta de cálculo cerrado: Ley de Gravitación Universal (F = G·M·m/r²), peso (W = m·g, con g_Tierra = 9.81 m/s²) y órbita circular con la 3.ª ley de Kepler (T = 2π·√(r³/GM), v = √(GM/r)). Tamaños y distancias del sistema solar <strong>no</strong> están a escala real (la Luna está 30 diámetros terrestres más lejos de lo que cabe en pantalla); las longitudes de las flechas son proporcionales a sus magnitudes (acotadas para verse). El radio de la órbita sí es proporcional al radio terrestre. Valores, datos y procedimiento son verbatim del enunciado A2.
              </p>
              <p style={{ marginTop: 10, fontSize: 14, color: T.text3 }}>
                {CREDITO_ESPACIO} La posición del Mexsat (≈ 113° Oeste) es ilustrativa.
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
