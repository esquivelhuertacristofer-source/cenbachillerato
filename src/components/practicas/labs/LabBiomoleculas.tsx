"use client";

/**
 * Laboratorio 3D — "Visor de las 4 biomoléculas" (CNEYT-IV-P05-A1).
 *
 * Práctica experimental anclada a la infografía A1 ("Las cuatro biomoléculas de
 * la vida: carbohidratos, lípidos, proteínas y ácidos nucleicos en la dieta
 * mexicana"; UAC "Reacciones químicas", progresión 5).
 *
 * El alumno elige una de las CUATRO biomoléculas y sube las UNIONES: con 0 ve el
 * MONÓMERO (la subunidad); cada unión nueva pinta un enlace verde que une dos
 * subunidades y libera una molécula de agua (condensación) — el concepto eje del
 * glosario: "Polímero = unión repetida de monómeros". Los lípidos se marcan como
 * NO polímeros (glicerol + ácidos grasos → triglicérido).
 *
 * Fórmulas y conteo de átomos del monómero son reales; las geometrías son
 * representaciones didácticas (no distancias de enlace exactas).
 */

import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import {
  BIOS, bio, conteo, totalAtomos, ELEMS_B,
  IDEAS, DATOS, RETO, BIO_DEF, QUIZ_A2, type BioId,
} from "./biomoleculas-data";
import { FichaTeorica } from "./_ficha";
import { BIOMOLECULAS_FICHA } from "./biomoleculas-cuatro-clases-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { LabSfx } from "./lab-audio";


/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-biomoleculas-cuatro-clases-reto";


const BiomoleculasScene = dynamic(() => import("./BiomoleculasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-dna fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Construyendo la biomolécula…</span>
    </div>
  ),
});

export function LabBiomoleculas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [bioId, setBioId] = useState<BioId>(BIO_DEF);
  // Experimento central: cuántas uniones (enlaces nuevos) se han formado. 0 = solo el monómero.
  const [uniones, setUniones] = useState(0);
  const [resaltar, setResaltar] = useState(true);
  const [girar, setGirar] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [visitadas, setVisitadas] = useState<BioId[]>([BIO_DEF]);
  const [completas, setCompletas] = useState<BioId[]>([]);
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
  const enlacesNuevos = useMemo(() => b.ensamblado.geo.bonds.filter((x) => x.nuevo).length, [b]);
  const maxUniones = Math.max(1, enlacesNuevos); // sin enlaces nuevos (ADN): un solo paso monómero → doble hélice
  const nUniones = Math.min(uniones, maxUniones);
  const ensamblado = nUniones > 0;
  const vista = ensamblado ? b.ensamblado : b.monomero;
  const cuentas = useMemo(() => conteo(vista.geo), [vista]);
  const total = useMemo(() => totalAtomos(vista.geo), [vista]);
  const sceneSig = `${bioId}-${ensamblado ? "e" : "m"}`;
  const aguas = enlacesNuevos > 0 ? nUniones : 0; // cada enlace nuevo libera una molécula de agua (condensación)
  const nC = cuentas.find((c) => c.el === "C")?.n ?? 0;
  const nO = cuentas.find((c) => c.el === "O")?.n ?? 0;
  const col = b.color;

  const reiniciar = () => { setUniones(0); setResetNonce((n) => n + 1); };

  const cambiarUniones = (v: number) => {
    setUniones(v);
    if (v >= maxUniones && !completas.includes(bioId)) setCompletas((c) => [...c, bioId]);
    if (sonido) audioRef.current?.blip();
  };

  const seleccionarBio = (id: BioId) => {
    setBioId(id);
    setUniones(0);
    setVisitadas((v) => (v.includes(id) ? v : [...v, id]));
    if (sonido) audioRef.current?.blip();
  };

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: b.color, boxShadow: `0 10px 30px -6px ${b.color}` }}>
        <i className={`fa-solid ${b.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{vista.nombre}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: {b.label.toLowerCase()} · {b.enlace}.
      </div>
    </div>
  );

  const lectura = ensamblado
    ? (enlacesNuevos > 0
      ? <>{nUniones} {nUniones === 1 ? "unión" : "uniones"} → {aguas} H₂O liberada{aguas === 1 ? "" : "s"}</>
      : <>Doble hélice armada: dos cadenas enlazadas</>)
    : <>Solo el monómero: sube las uniones</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <BiomoleculasScene
            sigId={sceneSig}
            atoms={vista.geo.atoms}
            bonds={vista.geo.bonds}
            accent={accent}
            resaltar={resaltar}
            girar={girar}
            resetNonce={resetNonce}
            unidos={nUniones}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: BIOS.map((bb) => ({ id: bb.id, etiqueta: bb.label, icono: bb.icono })),
        valor: bioId,
        cambiar: (id) => seleccionarBio(id as BioId),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-highlighter" titulo="Resaltar la parte característica" activo={resaltar} onClick={() => setResaltar((v) => !v)} />
          <BotonHerramienta icono={girar ? "fa-pause" : "fa-play"} titulo="Girar la biomolécula" activo={girar} onClick={() => setGirar((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Une monómeros: sube las uniones y cuenta el agua que se libera", done: nUniones > 0 || completas.length > 0 },
        { txt: "Explora las 4 biomoléculas (carbohidratos, lípidos, proteínas y ácidos nucleicos)", done: visitadas.length >= BIOS.length },
        { txt: "Compara el monómero y el ensamblado de al menos una biomolécula", done: completas.length > 0 },
        { txt: "Ensambla por completo dos biomoléculas distintas", done: completas.length >= 2 },
        { txt: "Aprueba el cuestionario de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo={`${b.label}: ${b.esPolimero ? "monómero → polímero" : "columna → estructura"}`} icono={b.icono}>
                {(
                  <Deslizador
                    label="uniones formadas" icon="fa-link" colr="#7DF0C0"
                    valor={`${nUniones} de ${maxUniones}`}
                    min={0} max={maxUniones} step={1} value={nUniones}
                    onChange={cambiarUniones}
                    hintL={b.monomero.nombre} hintR={b.ensamblado.nombre}
                  />
                )}
                <p style={{ margin: 0, color: T.text2 }}>
                  Los enlaces <strong style={{ color: "#7DF0C0" }}>verdes</strong> unen las subunidades{b.esPolimero ? "; cada unión libera una molécula de agua (condensación)" : " (esterificación)"}.
                </p>
              </Bloque>
              <Bloque titulo="Lo que ves ahora" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="vista" value={vista.nombre} col={col} />
                  <Dato label="átomos" value={`${total}`} col={accent} />
                  <Dato label="carbonos" value={`${nC}`} col="#9aa3b2" />
                  <Dato label="oxígenos" value={`${nO}`} col={ELEMS_B.O.color} />
                  <Dato label="enlaces nuevos" value={`${nUniones}`} col="#7DF0C0" />
                  <Dato label="H₂O liberadas" value={`${aguas}`} col="#7dd3fc" />
                </div>
                {vista.nota && <p style={{ margin: 0, color: T.text2 }}>{vista.nota}</p>}
              </Bloque>
            </>
          ),
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido: (
            <RetoQuizCard
              quiz={QUIZ_A2}
              accent={accent}
              rgba={color.rgba}
              aprobado={ejercicioAprobado}
              onAprobado={() => setEjercicioAprobado(true)}
              playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
              playPick={sonido ? () => audioRef.current?.blip() : undefined}
            />
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo={b.label} icono={b.icono}>
                <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", gap: "8px 12px" }}>
                  <span style={{ color: T.text3, fontWeight: 800 }}>Monómero</span>
                  <span style={{ fontFamily: "ui-monospace, monospace" }}>{b.formulaMono}</span>
                  <span style={{ color: T.text3, fontWeight: 800 }}>Enlace</span>
                  <span>{b.enlace}</span>
                  {b.energia ? (<><span style={{ color: T.text3, fontWeight: 800 }}>Energía</span><span>{b.energia}</span></>) : null}
                </div>
              </Bloque>
              <Bloque titulo="La subunidad" icono="fa-circle-nodes"><p style={{ margin: 0, color: T.text2 }}>{b.monomeroDesc}</p></Bloque>
              <Bloque titulo="¿Para qué sirve?" icono="fa-heart-pulse"><p style={{ margin: 0, color: T.text2 }}>{b.funcion}</p></Bloque>
              <Bloque titulo="En México" icono="fa-location-dot"><p style={{ margin: 0, color: T.text2 }}>{b.contexto}</p></Bloque>
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
                      <strong>{dd.valor}</strong>
                      <div style={{ color: T.text2 }}>{dd.texto}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Reto de la infografía" icono="fa-flag-checkered">
                <p style={{ margin: 0, color: T.text2 }}>{RETO.intro}</p>
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {RETO.items.map((it, i) => <li key={i}>{it}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={BIOMOLECULAS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                Las fórmulas de los monómeros (glucosa C₆H₁₂O₆, glicina C₂H₅NO₂, glicerol C₃H₈O₃) y la composición por elemento son valores reales. Las moléculas son modelos de bolas y barras didácticos: el almidón y el péptido muestran 3 subunidades, y el triglicérido y la doble hélice de ADN son esquemas con átomos omitidos.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
