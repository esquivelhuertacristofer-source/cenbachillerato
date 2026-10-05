"use client";

/**
 * Laboratorio 3D — Visor molecular de química orgánica.
 * Práctica experimental para CNEYT-IV-P04-A1 (lectura "Química orgánica:
 * alcanos, alquenos, alcoholes y ácidos carboxílicos"; UAC "Reacciones
 * químicas", progresión 4).
 *
 * El alumno elige una de las CUATRO familias y un compuesto representativo, gira
 * la molécula ball-and-stick en 3D y resalta su grupo funcional (–OH, –COOH o el
 * doble enlace C=C). EXPERIMENTO CENTRAL: con el deslizador «Separar» aleja el
 * grupo funcional del resto de la molécula y ve, literalmente, qué parte define
 * a la familia (y que el alcano no tiene ninguna). Composición (nº de C, H, O),
 * fórmula y grupo funcional son los reales del compuesto; las geometrías son
 * representaciones didácticas (ángulos sp3/sp2, no distancias de enlace exactas).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import {
  FAMILIAS, compuesto, familiaInfo, compuestosDe,
  IDEAS, DATOS, COMP_DEF, type Familia,
} from "./organica-data";
import { FichaTeorica } from "./_ficha";
import { ORGANICA_FICHA } from "./organica-visor-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./organica-visor-data";
import { LabSfx } from "./lab-audio";

/** Clave de la mejor marca de este laboratorio. */
const RETO_KEY = "cen-organica-visor-reto";

const OrganicaScene = dynamic(() => import("./OrganicaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-atom fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Construyendo la molécula…</span>
    </div>
  ),
});

/** Etiqueta corta del grupo funcional que se rotula en la escena. */
const ETIQUETA_FG: Record<Familia, string> = {
  alcano: "",
  alqueno: "C=C",
  alcohol: "–OH",
  acido: "–COOH",
};

export function LabOrganica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [compId, setCompId] = useState(COMP_DEF);
  const [resaltarFG, setResaltarFG] = useState(true);
  const [girar, setGirar] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [separacion, setSeparacion] = useState(0);
  const [separoFG, setSeparoFG] = useState(false);
  const [visitadas, setVisitadas] = useState<Familia[]>(["alcano"]);
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

  const comp = useMemo(() => compuesto(compId), [compId]);
  const fam = useMemo(() => familiaInfo(comp.familia), [comp.familia]);
  const fgColor = fam.color;
  const tieneFG = comp.familia !== "alcano";

  const elegirFamilia = (id: Familia) => {
    const lista = compuestosDe(id);
    if (lista.length > 0) {
      setCompId(lista[0]!.id);
      setSeparacion(0);
      setVisitadas((v) => (v.includes(id) ? v : [...v, id]));
      if (sonido) audioRef.current?.blip();
    }
  };
  const reiniciar = () => { setResetNonce((n) => n + 1); setSeparacion(0); };
  const separar = (v: number) => {
    setSeparacion(v);
    if (v >= 0.7 && tieneFG) setSeparoFG(true);
  };

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-atom" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{comp.nombre} ({comp.formula})</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: es un {fam.label.toLowerCase().replace(/s$/, "")}, grupo funcional {fam.grupoFuncional.toLowerCase()}.
      </div>
    </div>
  );

  const lectura = tieneFG
    ? <>{comp.formula}: el grupo funcional {ETIQUETA_FG[comp.familia]} define a los {fam.label.toLowerCase()}</>
    : <>{comp.formula}: sin grupo funcional, solo enlaces simples</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
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
            separacion={separacion}
            etiquetaFG={ETIQUETA_FG[comp.familia]}
          />
        </SceneBoundary>
      }
      modos={{
        opciones: FAMILIAS.map((f) => ({ id: f.id, etiqueta: f.label, icono: f.icono })),
        valor: comp.familia,
        cambiar: (id) => elegirFamilia(id as Familia),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-highlighter" titulo="Resaltar el grupo funcional" activo={resaltarFG} onClick={() => setResaltarFG((v) => !v)} />
          <BotonHerramienta icono={girar ? "fa-pause" : "fa-play"} titulo="Girar la molécula" activo={girar} onClick={() => setGirar((v) => !v)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar la cámara" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Recentrar la vista" onClick={reiniciar} />
        </>
      }
      leyenda={
        <>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{comp.formula}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text2 }}>{comp.nombre}</div>
          <MedidorAtomos nC={comp.nC} nH={comp.nH} nO={comp.nO} compacto />
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Aleja el grupo funcional con «Separar» y mira qué parte define a la familia", done: separoFG },
        { txt: "Explora las cuatro familias orgánicas", done: visitadas.length >= FAMILIAS.length },
        { txt: "Identifica un grupo funcional resaltado", done: resaltarFG },
        { txt: "Observa un alqueno (doble enlace C=C)", done: comp.familia === "alqueno" },
        { txt: "Elige un ácido carboxílico y encuentra su –COOH resaltado", done: comp.familia === "acido" && resaltarFG },
        { txt: "Aprueba el cuestionario de la actividad A2", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Separa el grupo funcional" icono="fa-up-down-left-right">
                <Deslizador label="Separar" icon="fa-arrows-left-right-to-line" colr={fgColor} valor={`${Math.round(separacion * 100)} %`} min={0} max={1} step={0.05} value={separacion} onChange={separar} hintL="junto" hintR="separado" />
                <p style={{ margin: 0, color: T.text2 }}>
                  {tieneFG
                    ? <>Lo que se aleja es el <strong style={{ color: fgColor }}>{fam.grupoFuncional}</strong>: esa parte hace que sea {fam.label.toLowerCase().replace(/s$/, "")}.</>
                    : <>Un alcano no tiene grupo funcional: no hay nada que separar, solo enlaces simples C–C y C–H.</>}
                </p>
              </Bloque>

              <Bloque titulo="Compuestos de esta familia" icono="fa-flask">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                  {compuestosDe(comp.familia).map((c) => {
                    const on = c.id === compId;
                    return (
                      <button key={c.id} type="button" title={c.nombre} onClick={() => { setCompId(c.id); setSeparacion(0); if (sonido) audioRef.current?.blip(); }}
                        style={{ cursor: "pointer", padding: "10px 12px", borderRadius: 12, textAlign: "left", fontSize: 14, fontWeight: 800,
                          border: `1px solid ${on ? fgColor : T.line}`, background: on ? `color-mix(in srgb, ${fgColor} 18%, transparent)` : T.inset, color: on ? "#fff" : T.text2 }}>
                        <span style={{ fontFamily: "ui-monospace, monospace", display: "block" }}>{c.formula}</span>
                        <span style={{ fontWeight: 700, opacity: 0.85 }}>{c.nombre}</span>
                      </button>
                    );
                  })}
                </div>
              </Bloque>

              <Bloque titulo="Contando átomos" icono="fa-gauge-high">
                <MedidorAtomos nC={comp.nC} nH={comp.nH} nO={comp.nO} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="carbonos" value={`${comp.nC}`} col={accent} />
                  <Dato label="hidrógenos" value={`${comp.nH}`} col="#E8EEF5" />
                  <Dato label="oxígenos" value={`${comp.nO}`} col={comp.nO > 0 ? "#FF6B6B" : T.text3} />
                  <Dato label="familia" value={fam.label.replace(/s$/, "")} col={fgColor} />
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
              <Bloque titulo={`${comp.nombre} · ${fam.label}`} icono={fam.icono}>
                <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", gap: "8px 12px" }}>
                  <span style={{ color: T.text3, fontWeight: 800 }}>Grupo funcional</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{fam.grupoFuncional}</span>
                  <span style={{ color: T.text3, fontWeight: 800 }}>Fórmula general</span>
                  <span style={{ color: "#fff", fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{fam.formulaGeneral}</span>
                  <span style={{ color: T.text3, fontWeight: 800 }}>Enlaces</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{comp.enlaces}</span>
                </div>
              </Bloque>
              <Bloque titulo="¿Para qué sirve? (contexto)" icono="fa-location-dot">
                <p style={{ margin: 0, color: T.text2 }}>{comp.contexto}</p>
              </Bloque>
              <Bloque titulo="Reactividad" icono="fa-bolt">
                <p style={{ margin: 0, color: T.text2 }}>{comp.reactividad}</p>
              </Bloque>
              <Bloque titulo={`Qué define a los ${fam.label.toLowerCase()}`} icono={fam.icono}>
                <p style={{ margin: 0, color: T.text2 }}>{fam.descripcion}</p>
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
                      <strong>{dd.valor}</strong>
                      <div style={{ color: T.text2 }}>{dd.texto}</div>
                    </div>
                  </div>
                ))}
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ORGANICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3 }}>
                La composición (número de C, H y O), la fórmula y el grupo funcional son los <strong>valores reales</strong> de cada compuesto. Las moléculas se dibujan como modelos de <strong>bolas y barras</strong> con ángulos tetraédricos (sp3, 109.5°) y trigonales planos (sp2, 120°): son representaciones <strong>didácticas</strong>, no las distancias de enlace reales. Compuestos tomados de la lectura de la progresión 4.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Medidor de átomos: una barra por elemento, crece con la molécula ─────── */
function MedidorAtomos({ nC, nH, nO, compacto = false }: { nC: number; nH: number; nO: number; compacto?: boolean }) {
  const tope = 10;
  const filas: { el: string; n: number; col: string }[] = [
    { el: "C", n: nC, col: "#94a3b8" },
    { el: "H", n: nH, col: "#E8EEF5" },
    { el: "O", n: nO, col: "#FF6B6B" },
  ];
  return (
    <div style={{ display: "grid", gap: compacto ? 4 : 8, width: compacto ? 176 : undefined, marginTop: compacto ? 4 : 0 }}>
      {filas.map((f) => (
        <div key={f.el} style={{ display: "grid", gridTemplateColumns: "20px minmax(0,1fr) 26px", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#dce6f5" }}>
          <span>{f.el}</span>
          <div style={{ height: compacto ? 8 : 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, (f.n / tope) * 100)}%`, height: "100%", background: f.col, transition: "width 200ms ease" }} />
          </div>
          <span style={{ fontFamily: "ui-monospace, monospace", textAlign: "right" }}>{f.n}</span>
        </div>
      ))}
    </div>
  );
}
