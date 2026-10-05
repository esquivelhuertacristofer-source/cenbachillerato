"use client";

/**
 * Laboratorio 3D — Pirámide de energía y flujo trófico.
 * Práctica experimental para CNEYT-III-P02-A2
 * ("Calcula: ¿cuánta energía llega al tercer nivel trófico?"; progresión 2).
 *
 * La energía entra por los productores (fotosíntesis) y sube por la cadena
 * trófica, pero en cada salto solo se transfiere ~10% al siguiente nivel
 * (eficiencia ecológica); el ~90% restante se pierde como calor. Por eso la
 * energía disponible forma una pirámide: muchos productores sostienen a pocos
 * depredadores tope. El alumno mueve la energía inicial y la eficiencia y ve
 * cuánto llega a cada nivel y cuánto se disipa.
 * Ciencias Naturales, Experimentales y Tecnología III — Ecosistemas (MCCEMS 2025).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { PIRAMIDE_ENERGIA_FICHA } from "./piramide-energia-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";
import {
  NIVELES,
  N_NIVELES,
  flujo,
  pctTope,
  calorTotal,
  fmtKcal,
  fmtPct,
  E0_MIN, E0_MAX, E0_STEP, E0_DEFAULT,
  EFIC_MIN, EFIC_MAX, EFIC_STEP, EFIC_DEFAULT,
  RETO_A2,
} from "./piramide-energia-data";

const PiramideEnergiaScene = dynamic(() => import("./PiramideEnergiaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-layer-group fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const CALOR = "#ff7a4a";

const RETO_KEY = "cen-piramide-energia-reto";

export function LabPiramideEnergia({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [e0, setE0] = useState(E0_DEFAULT);
  const [efic, setEfic] = useState(EFIC_DEFAULT);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // reto evaluable, teoría (cajón deslizable) y sonido
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

  // objetivos
  const [vioPiramide] = useState(true);
  const [movioE0, setMovioE0] = useState(false);
  const [movioEfic, setMovioEfic] = useState(false);
  const [esVerbatim, setEsVerbatim] = useState(true);
  const [vio5, setVio5] = useState(false);
  const [vio20, setVio20] = useState(false);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarE0 = (v: number) => {
    setE0(v);
    setMovioE0(true);
    setEsVerbatim(v === E0_DEFAULT && efic === EFIC_DEFAULT);
    if (sonido) audioRef.current?.blip();
  };
  const cambiarEfic = (v: number) => {
    setEfic(v);
    if (v <= EFIC_MIN) setVio5(true);
    if (v >= EFIC_MAX) setVio20(true);
    setMovioEfic(true);
    setEsVerbatim(e0 === E0_DEFAULT && v === EFIC_DEFAULT);
    if (sonido) audioRef.current?.blip();
  };

  const reset = () => { setE0(E0_DEFAULT); setEfic(EFIC_DEFAULT); setEsVerbatim(true); bump(); };

  const datos = useMemo(() => flujo(e0, efic), [e0, efic]);
  const tope = useMemo(() => pctTope(e0, efic), [e0, efic]);
  const calor = useMemo(() => calorTotal(e0, efic), [e0, efic]);

  const objetivos = [
    { txt: "Lleva la eficiencia a 5 % y luego a 20 %: compara la energía que llega a la cima", done: vio5 && vio20 },
    { txt: "Observa la pirámide de energía", done: vioPiramide },
    { txt: "Cambia la energía de los productores", done: movioE0 },
    { txt: "Mueve la eficiencia (5–20%)", done: movioEfic },
    { txt: "Reproduce el caso de la actividad", done: esVerbatim },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
  ];
  // Los objetivos se recuerdan (algunos dependían del modo y se desmarcaban
  // solos) y se convierten en la marca del laboratorio, que antes no se
  // guardaba en ninguna parte.
  const { cumplidos: cumplidosLab, total: totalLab } = useLogros(objetivos.map((o) => o.done));
  const { registraEstrellas } = useEstrellas(RETO_KEY);
  useEffect(() => {
    if (cumplidosLab === 0) return;
    const est = cumplidosLab >= totalLab ? 3 : cumplidosLab >= Math.ceil((totalLab * 2) / 3) ? 2 : 1;
    registraEstrellas(est);
  }, [cumplidosLab, totalLab, registraEstrellas]);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-layer-group" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>La energía disminuye en cada nivel trófico</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: solo ~10% de la energía pasa al siguiente nivel; el ~90% se pierde como calor. Por eso hay muchos productores y pocos depredadores.
      </div>
    </div>
  );

  const ultimo = datos[N_NIVELES - 1]!;
  const lecturaCorta = <>A las águilas llegan {fmtKcal(ultimo.energia)} kcal ({fmtPct(tope)})</>;

  return (
    <>
      <style>{`
        .ex-chip { cursor:pointer; padding:10px 14px; border-radius:999px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:14px; font-weight:800; transition:all .15s; text-align:left; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-chip[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; }
        .ex-cols { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; }
      `}</style>
      <LabShell
        accent={accent}
        rgba={color.rgba}
        retoKey={RETO_KEY}
        escena={
          <SceneBoundary fallback={sceneFallback}>
            <PiramideEnergiaScene
              e0={e0}
              eficPct={efic}
              accent={accent}
              pausado={pausado}
              autoRotate={autoRotate}
              resetNonce={resetNonce}
            />
          </SceneBoundary>
        }
        herramientas={
          <>
            <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
            <BotonHerramienta icono={pausado ? "fa-play" : "fa-pause"} titulo={pausado ? "Reanudar el flujo" : "Pausar el flujo"} activo={!pausado} onClick={() => setPausado((p) => !p)} />
            <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
            <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
          </>
        }
        leyenda={<MedidorFlujo tope={tope} calor={calor} e0={e0} efic={efic} compacto />}
        lectura={lecturaCorta}
        objetivos={objetivos}
        pestanas={[
          {
            id: "controles",
            etiqueta: "Controles",
            icono: "fa-sliders",
            contenido: (
              <>
                <Bloque titulo="Ajusta el flujo de energía" icono="fa-sliders">
                  <Deslizador label="Eficiencia ecológica por salto" icon="fa-percent" colr={accent}
                    valor={`${efic}%`} min={EFIC_MIN} max={EFIC_MAX} step={EFIC_STEP} value={efic} onChange={cambiarEfic}
                    hintL="real: 5–20%" hintR="regla del 10%" />
                  <Deslizador label="Energía de los productores" icon="fa-seedling" colr={VERDE}
                    valor={`${fmtKcal(e0)} kcal`} min={E0_MIN} max={E0_MAX} step={E0_STEP} value={e0} onChange={cambiarE0}
                    hintL="lo que el Sol fija en las plantas" />
                  <button type="button" className="ex-chip" data-on={esVerbatim} onClick={reset}>
                    <i className="fa-solid fa-rotate-left" style={{ marginRight: 6 }} />
                    Caso de la actividad (10,000 kcal · 10%)
                  </button>
                </Bloque>

                <Bloque titulo="¿Cuánto llega a la cima?" icono="fa-gauge-high">
                  <MedidorFlujo tope={tope} calor={calor} e0={e0} efic={efic} />
                  <p style={{ margin: 0, color: T.text2 }}>
                    Con eficiencia del <strong style={{ color: accent }}>{efic}%</strong>, cada nivel conserva solo esa fracción del anterior: al tope llega apenas <strong style={{ color: CALOR }}>{fmtPct(tope)}</strong>. La pérdida no desaparece: se transforma en <strong style={{ color: CALOR }}>calor</strong> (respiración, movimiento, calor corporal); la energía se conserva, pero deja de estar disponible para comer.
                  </p>
                </Bloque>

                <Bloque titulo="Energía disponible por nivel" icono="fa-table-cells">
                  {NIVELES.map((nv, i) => {
                    const dn = datos[i]!;
                    return (
                      <div key={nv.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 11, background: T.inset, border: `1px solid ${nv.color}33` }}>
                        <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: nv.color, background: `${nv.color}1f` }}>
                          <i className={`fa-solid ${nv.icono}`} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: T.text }}>{nv.nombre}</div>
                          <div style={{ color: T.text3 }}>{nv.ejemplo}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 900, color: nv.color, fontFamily: "ui-monospace, monospace" }}>{fmtKcal(dn.energia)} kcal</div>
                          <div style={{ color: T.text3 }}>{fmtPct(dn.pctDelOriginal)} del total</div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="ex-cols">
                    <Dato label="Llega al nivel tope" value={fmtPct(tope)} col={CALOR} />
                    <Dato label="Perdido como calor" value={`${fmtKcal(calor)} kcal`} col={CALOR} />
                  </div>
                </Bloque>
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
                <Bloque titulo="La regla del 10%" icono="fa-percent">
                  <p style={{ margin: 0, color: T.text2 }}>
                    Al pasar de un nivel trófico al siguiente, solo se transfiere alrededor del <strong style={{ color: accent }}>10%</strong> de la energía; el otro <strong style={{ color: CALOR }}>90%</strong> se pierde como calor. Es una <strong>simplificación didáctica</strong>: en ecosistemas reales la eficiencia va del <strong>5% al 20%</strong> (por eso el deslizador la deja mover).
                  </p>
                </Bloque>
                <Bloque titulo="Los niveles tróficos" icono="fa-layer-group">
                  {NIVELES.map((nv) => (
                    <div key={nv.key} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                      <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: nv.color, background: `${nv.color}1f` }}>
                        <i className={`fa-solid ${nv.icono}`} />
                      </div>
                      <div style={{ color: T.text2 }}>
                        <strong style={{ color: T.text }}>{nv.nombre}</strong> — {nv.ejemplo}
                      </div>
                    </div>
                  ))}
                </Bloque>
                <Bloque titulo="¿Por qué es una pirámide?" icono="fa-triangle-exclamation">
                  <p style={{ margin: 0, color: T.text2 }}>
                    Como la energía cae a una décima parte en cada salto, hace falta una base enorme de productores para sostener unos pocos depredadores tope. Por eso siempre hay <strong>muchísimo más pasto que águilas</strong>. Y por eso comer del primer nivel (plantas) es más eficiente para el planeta: evita las pérdidas de los niveles intermedios.
                  </p>
                </Bloque>
                <Bloque titulo="En la vida real (México)" icono="fa-location-dot">
                  <p style={{ margin: 0, color: T.text2 }}>
                    El <strong style={{ color: accent }}>Mar de Cortés</strong> —«el acuario del mundo»— sostiene cadenas enormes: el fitoplancton (productor) alimenta peces pequeños, que alimentan atunes y, en la cúspide, a tiburones y orcas. Por la regla del 10%, los depredadores tope son escasos y muy vulnerables: si desaparece la base, toda la pirámide se cae.
                  </p>
                </Bloque>
                <Bloque titulo="Cómo usar el laboratorio" icono="fa-lightbulb">
                  <p style={{ margin: 0, color: T.text2 }}>
                    Empieza con el caso de la actividad: <strong style={{ color: VERDE }}>10,000 kcal</strong> y eficiencia <strong style={{ color: accent }}>10%</strong>. Sigue el hilo de energía hacia arriba (cada vez más delgado) y el calor que escapa (enorme en la base). Luego sube la eficiencia al 20% y mira cómo la pirámide se vuelve menos empinada.
                  </p>
                </Bloque>
                <Bloque titulo="Ficha teórica" icono="fa-book">
                  <FichaTeorica data={PIRAMIDE_ENERGIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
                </Bloque>
              </>
            ),
          },
        ]}
      />
    </>
  );
}

/* ── Medidor: de la energía que entra, cuánta llega a la cima y cuánta se va ── */
function MedidorFlujo({ tope, calor, e0, efic, compacto = false }: { tope: number; calor: number; e0: number; efic: number; compacto?: boolean }) {
  const fs = compacto ? 14 : 15;
  const pctCalor = 100 - tope;
  return (
    <div style={{ display: "grid", gap: 6, width: compacto ? 210 : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: fs, fontWeight: 800, color: "#dce6f5" }}>
        <span>Eficiencia {efic}%</span>
        <span style={{ fontFamily: "ui-monospace, monospace", color: VERDE }}>cima {fmtPct(tope)}</span>
      </div>
      <div style={{ display: "flex", height: compacto ? 12 : 16, borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,0.1)" }}>
        <div style={{ width: `${Math.max(tope, 0.8)}%`, background: VERDE, transition: "width 120ms linear" }} />
        <div style={{ width: `${Math.min(100 - Math.max(tope, 0.8), pctCalor)}%`, background: CALOR, transition: "width 120ms linear" }} />
      </div>
      <div style={{ fontSize: fs, color: "#9fb2c8" }}>
        de {fmtKcal(e0)} kcal, {fmtKcal(calor)} se vuelven calor
      </div>
    </div>
  );
}

