"use client";

/**
 * Laboratorio 3D — Enlaces químicos (¿por qué los átomos se unen?).
 * Práctica experimental para CNEYT-I-P10-A1.
 *
 * EXPERIMENTO CENTRAL: «Tu enlace». El estudiante ELIGE dos elementos y ve en 3D qué
 * enlace forman. Descubre que los átomos se unen para ganar estabilidad (regla del
 * octeto) y que el TIPO de enlace lo decide la diferencia de electronegatividad (ΔEN):
 *   · ΔEN < 0.4  → covalente no polar (comparten por igual: la nube queda al centro)
 *   · 0.4 – 1.7  → covalente polar (comparten desigual: la nube se carga hacia uno)
 *   · ΔEN ≥ 1.7  → iónico (un átomo cede su electrón al otro)
 * También puede recorrer moléculas reales (agua, sal, metano…).
 *
 * Fallback 2D si no hay WebGL.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { ENLACES_QUIMICOS_FICHA } from "./enlaces-quimicos-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./enlaces-quimicos-data";
import { LabSfx } from "./lab-audio";
import {
  MOLECULAS,
  ELEMS,
  CAT_COLOR,
  CAT_LABEL,
  categoriaPorEN,
  deltaEN,
  type Categoria,
  type ElementoQuim,
  type Molecula,
} from "./enlaces-data";

const EnlacesQuimicosScene = dynamic(() => import("./EnlacesQuimicosScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask-vial fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const fmt = (n: number, dec = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const ELEMENTOS_LISTA = Object.keys(ELEMS) as ElementoQuim[];

/* ── Componentes de UI (fuera del render: estado estable) ─────────────── */

const ElemDot = ({ el }: { el: ElementoQuim }) => {
  const e = ELEMS[el];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, color: "#dce6f5", fontWeight: 700 }}>
      <span style={{ width: 13, height: 13, borderRadius: "50%", background: e.color, border: "1px solid rgba(255,255,255,0.25)", boxShadow: `0 0 8px -2px ${e.color}` }} />
      {el} <span style={{ color: T.text3, fontWeight: 500 }}>· EN {e.en}</span>
    </span>
  );
};

// Chip de molécula seleccionable
const MolChip = ({ active, formula, nombre, cat, onClick }: { active: boolean; formula: string; nombre: string; cat: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="ex-mol"
    data-on={active}
    title={nombre}
    style={{
      borderColor: active ? cat : T.line,
      background: active ? `${cat}22` : T.glass,
      boxShadow: active ? `0 0 16px -5px ${cat}` : "none",
    }}
  >
    <span style={{ position: "absolute", top: 7, right: 8, width: 7, height: 7, borderRadius: "50%", background: cat }} />
    <span style={{ fontSize: 17, fontWeight: 900, color: active ? "#fff" : T.text, lineHeight: 1.1 }}>{formula}</span>
    <span style={{ fontSize: 14, color: T.text3, lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{nombre}</span>
  </button>
);

/* ── Escala de electronegatividad: dónde cae este enlace. EL medidor del experimento ── */
const MAX_EN = 3.3;
const EscalaEN = ({ delta, catColor, compacto = false }: { delta: number; catColor: string; compacto?: boolean }) => {
  const pct = Math.min(100, (delta / MAX_EN) * 100);
  const z1 = (0.4 / MAX_EN) * 100;
  const z2 = (1.7 / MAX_EN) * 100;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: compacto ? "#dce6f5" : T.text3, letterSpacing: compacto ? 0 : ".04em" }}>
          {compacto ? "ΔEN" : "Diferencia de electronegatividad (ΔEN)"}
        </span>
        <span style={{ fontSize: 18, fontWeight: 900, color: catColor, ...NUM, textShadow: `0 0 14px ${catColor}66` }}>{fmt(delta, 2)}</span>
      </div>
      <div style={{ position: "relative", height: 16, borderRadius: 999, overflow: "hidden", display: "flex", border: `1px solid ${T.line}` }}>
        <div style={{ width: `${z1}%`, background: `${CAT_COLOR["no-polar"]}55` }} />
        <div style={{ width: `${z2 - z1}%`, background: `${CAT_COLOR["polar"]}55` }} />
        <div style={{ flex: 1, background: `${CAT_COLOR["ionico"]}55` }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `calc(${pct}% - 2px)`,
            width: 4,
            height: "100%",
            borderRadius: 2,
            background: "#fff",
            boxShadow: `0 0 10px 1px ${catColor}`,
            transition: "left 0.35s ease",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: T.text3 }}>
        <span style={{ color: CAT_COLOR["no-polar"] }}>{compacto ? "No pol." : "No polar"}</span>
        <span style={{ color: CAT_COLOR["polar"] }}>Polar</span>
        <span style={{ color: CAT_COLOR["ionico"] }}>Iónico</span>
      </div>
    </div>
  );
};

const EXPLICA: Record<string, string> = {
  "no-polar": "Los átomos tienen electronegatividad parecida (ΔEN < 0.4): comparten los electrones por igual. Es un enlace covalente no polar.",
  polar: "Un átomo atrae más los electrones que el otro (ΔEN entre 0.4 y 1.7). Comparten, pero desigual: enlace covalente polar, con un lado más negativo.",
  ionico: "La diferencia es tan grande (ΔEN ≥ 1.7) que un átomo CEDE su electrón al otro. Se forman iones de carga opuesta que se atraen: enlace iónico.",
};

/** Arma la pareja que elige el alumno como una molécula diatómica (el menos electronegativo primero). */
function armarPar(a: ElementoQuim, b: ElementoQuim): Molecula {
  const [lo, hi] = ELEMS[a].en <= ELEMS[b].en ? [a, b] : [b, a];
  const delta = deltaEN([lo, hi]);
  const cat = categoriaPorEN(delta);
  const ionico = cat === "ionico";
  const sep = ionico ? 2.0 : (ELEMS[lo].radio + ELEMS[hi].radio) * 1.45;
  const orden: 1 | 2 | 3 = lo === hi ? (lo === "O" ? 2 : lo === "N" ? 3 : 1) : 1;
  return {
    key: `par-${lo}-${hi}`,
    formula: lo === hi ? `${lo}₂` : `${lo}–${hi}`,
    nombre: lo === hi ? ELEMS[lo].nombre : `${ELEMS[lo].nombre} + ${ELEMS[hi].nombre}`,
    categoria: cat,
    geometria: ionico ? "Par iónico" : "Diatómica (lineal)",
    descripcion: EXPLICA[cat]!,
    atoms: [
      { el: lo, pos: [-sep / 2, 0, 0] },
      { el: hi, pos: [sep / 2, 0, 0] },
    ],
    bonds: ionico ? [] : [{ a: 0, b: 1, orden }],
    ionico,
    par: [lo, hi],
  };
}

const CSS_EQ = `
.ex-mol { position:relative; cursor:pointer; border-radius:12px; border:1px solid ${T.line}; background:${T.glass};
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; padding:13px 6px 10px; transition:all .14s ease; min-width:0; }
.ex-mol:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; }
.ex-step { cursor:pointer; flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px;
  border-radius:11px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:14px; font-weight:700; transition:all .15s; }
.ex-step:hover:not(:disabled) { color:#fff; border-color:${T.lineStrong}; }
.ex-step:disabled { opacity:0.35; cursor:not-allowed; }
.eq-el { cursor:pointer; border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text};
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; padding:9px 4px; min-width:0; transition:all .14s ease; }
.eq-el:hover:not(:disabled) { border-color:${T.lineStrong}; background:${T.glassSoft}; }
.eq-el:disabled { opacity:0.3; cursor:not-allowed; }
.eq-el strong { font-size:18px; font-weight:900; line-height:1; }
.eq-el span { font-size:14px; color:${T.text3}; font-variant-numeric:tabular-nums; }
`;

const RETO_KEY = "cen-enlaces-quimicos-reto";

export function LabEnlacesQuimicos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<"par" | "mol">("par");
  const [molKey, setMolKey] = useState("H2O");
  const [elA, setElA] = useState<ElementoQuim>("H");
  const [elB, setElB] = useState<ElementoQuim>("Cl");
  const [parTocado, setParTocado] = useState(false);
  const [catsPar, setCatsPar] = useState<Set<Categoria>>(() => new Set<Categoria>());
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [visitados, setVisitados] = useState<Set<string>>(() => new Set<string>(["H2O"]));
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

  const molCatalogo = MOLECULAS.find((m) => m.key === molKey)!;
  const idx = MOLECULAS.findIndex((m) => m.key === molKey);
  const pareja = useMemo(() => armarPar(elA, elB), [elA, elB]);
  const mol: Molecula = modo === "par" ? pareja : molCatalogo;
  const delta = deltaEN(mol.par);
  const catColor = CAT_COLOR[mol.categoria];
  const elementos = Array.from(new Set(mol.atoms.map((a) => a.el)));

  const irAMol = (k: string) => {
    setMolKey(k);
    if (sonido) audioRef.current?.blip();
    setVisitados((prev) => {
      if (prev.has(k)) return prev;
      const next = new Set(prev);
      next.add(k);
      return next;
    });
  };
  const paso = (dir: number) => {
    const i = Math.max(0, Math.min(MOLECULAS.length - 1, idx + dir));
    irAMol(MOLECULAS[i]!.key);
  };

  // Elegir un elemento de la pareja: recuerda qué tipos de enlace ya armó el alumno.
  const elegir = (lado: "A" | "B", el: ElementoQuim) => {
    const a = lado === "A" ? el : elA;
    const b = lado === "B" ? el : elB;
    if (a === "Na" && b === "Na") return; // dos sodios no forman una molécula (metálico)
    if (lado === "A") setElA(el);
    else setElB(el);
    setParTocado(true);
    setCatsPar((prev) => {
      const c = armarPar(a, b).categoria;
      if (prev.has(c)) return prev;
      const next = new Set(prev);
      next.add(c);
      return next;
    });
    if (sonido) audioRef.current?.blip();
  };

  const cambiarModo = (m: "par" | "mol") => {
    setModo(m);
    if (m === "par") {
      setCatsPar((prev) => (prev.has(pareja.categoria) ? prev : new Set(prev).add(pareja.categoria)));
    }
    if (sonido) audioRef.current?.blip();
  };

  const catsVisitadas = new Set<Categoria>([
    ...Array.from(visitados).map((k) => MOLECULAS.find((m) => m.key === k)!.categoria),
    ...Array.from(catsPar),
  ]);
  const objetivos = [
    { txt: "En «Tu enlace», elige dos elementos y mira cómo cambia la ΔEN", done: parTocado },
    { txt: "Combina elementos hasta pasar ΔEN 1.7: el electrón se transfiere (iónico)", done: catsPar.has("ionico") },
    { txt: "Construye un enlace covalente no polar", done: catsVisitadas.has("no-polar") },
    { txt: "Construye un enlace covalente polar", done: catsVisitadas.has("polar") },
    { txt: "Observa un enlace iónico (transferencia)", done: catsVisitadas.has("ionico") },
    { txt: "Recorre al menos 5 moléculas", done: visitados.size >= 5 },
    { txt: "Resuelve el reto de enlaces químicos", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: catColor, boxShadow: `0 10px 30px -6px ${catColor}` }}>
        <i className="fa-solid fa-atom" />
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: T.text }}>{mol.formula}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 360, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero el experimento sigue: <strong style={{ color: T.text }}>{mol.nombre}</strong> — {mol.descripcion}
      </div>
    </div>
  );

  const lectura = <>{mol.formula}: ΔEN {fmt(delta, 2)} → {CAT_LABEL[mol.categoria].toLowerCase()}</>;

  const selectorElementos = (lado: "A" | "B", actual: ElementoQuim, otro: ElementoQuim) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
      {ELEMENTOS_LISTA.map((el) => {
        const on = el === actual;
        const bloqueado = el === "Na" && otro === "Na";
        return (
          <button
            key={el}
            className="eq-el"
            disabled={bloqueado}
            title={`${ELEMS[el].nombre} · EN ${ELEMS[el].en}${bloqueado ? " (dos sodios no forman una molécula)" : ""}`}
            aria-pressed={on}
            onClick={() => elegir(lado, el)}
            style={on ? { borderColor: ELEMS[el].color, background: `${ELEMS[el].color}26`, boxShadow: `0 0 16px -5px ${ELEMS[el].color}` } : undefined}
          >
            <strong style={{ color: on ? "#fff" : T.text }}>{el}</strong>
            <span>EN {ELEMS[el].en}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <>
          <style>{CSS_EQ}</style>
          <SceneBoundary fallback={sceneFallback}>
            <EnlacesQuimicosScene
              molKey={mol.key}
              atoms={mol.atoms}
              bonds={mol.bonds}
              ionico={mol.ionico}
              categoria={mol.categoria}
              accent={accent}
              autoRotate={autoRotate}
              resetNonce={resetNonce}
            />
          </SceneBoundary>
        </>
      }
      modos={{
        opciones: [
          { id: "par", etiqueta: "Tu enlace", icono: "fa-link" },
          { id: "mol", etiqueta: "Moléculas", icono: "fa-flask" },
        ],
        valor: modo,
        cambiar: (id) => cambiarModo(id as "par" | "mol"),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={() => setResetNonce((n) => n + 1)} />
        </>
      }
      leyenda={
        <div style={{ width: 200, display: "grid", gap: 8 }}>
          <EscalaEN delta={delta} catColor={catColor} compacto />
          <div style={{ display: "grid", gap: 2 }}>
            {elementos.map((el) => (
              <ElemDot key={el} el={el} />
            ))}
          </div>
        </div>
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
              {modo === "par" ? (
                <Bloque titulo="Elige los dos átomos" icono="fa-link">
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>ÁTOMO A</div>
                  {selectorElementos("A", elA, elB)}
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>ÁTOMO B</div>
                  {selectorElementos("B", elB, elA)}
                </Bloque>
              ) : (
                <Bloque titulo="Elige una molécula" icono="fa-flask">
                  <div style={{ borderRadius: 14, border: `1px solid ${catColor}55`, background: `${catColor}14`, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ minWidth: 54, height: 54, padding: "0 8px", flexShrink: 0, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 900, color: "#fff", background: catColor, boxShadow: `0 8px 22px -6px ${catColor}` }}>
                        {mol.formula}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: T.text, lineHeight: 1.1 }}>{mol.nombre}</div>
                        <div style={{ fontSize: 14, color: catColor, fontWeight: 700, marginTop: 2 }}>{CAT_LABEL[mol.categoria]}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="ex-step" onClick={() => paso(-1)} disabled={idx === 0}>
                      <i className="fa-solid fa-arrow-left" /> Anterior
                    </button>
                    <button className="ex-step" onClick={() => paso(1)} disabled={idx === MOLECULAS.length - 1}>
                      Siguiente <i className="fa-solid fa-arrow-right" />
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 96px), 1fr))", gap: 8 }}>
                    {MOLECULAS.map((m) => (
                      <MolChip key={m.key} active={m.key === molKey} formula={m.formula} nombre={m.nombre} cat={CAT_COLOR[m.categoria]} onClick={() => irAMol(m.key)} />
                    ))}
                  </div>
                </Bloque>
              )}

              <Bloque titulo="¿Qué enlace se forma?" icono="fa-scale-balanced">
                <EscalaEN delta={delta} catColor={catColor} />
                <p style={{ margin: 0, padding: "10px 12px", borderRadius: 12, border: `1px solid ${catColor}55`, background: `${catColor}12`, color: T.text2 }}>
                  <strong style={{ color: catColor }}>{CAT_LABEL[mol.categoria]}.</strong> {EXPLICA[mol.categoria]}
                </p>
              </Bloque>

              <Bloque titulo="Datos del enlace" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Átomos" value={fmt(mol.atoms.length)} />
                  <Dato label={mol.ionico ? "Iones" : "Enlaces"} value={fmt(mol.ionico ? mol.atoms.length : mol.bonds.length)} />
                  <Dato label="ΔEN" value={fmt(delta, 2)} col={catColor} />
                  <Dato label="Geometría" value={mol.geometria} />
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
              <Bloque titulo="¿Por qué se unen?" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Los átomos se unen para alcanzar <strong style={{ color: "#fff" }}>estabilidad</strong> (regla del octeto): pueden{" "}
                  <strong style={{ color: "#fff" }}>compartir</strong> electrones (covalente) o <strong style={{ color: "#fff" }}>transferirlos</strong> (iónico). La{" "}
                  <strong style={{ color: "#fff" }}>ΔEN</strong> decide cuál ocurre.
                </p>
              </Bloque>
              <Bloque titulo="Los tres tipos de enlace" icono="fa-link">
                {(["no-polar", "polar", "ionico"] as Categoria[]).map((c) => (
                  <p key={c} style={{ margin: 0, color: T.text2 }}>
                    <strong style={{ color: CAT_COLOR[c] }}>{CAT_LABEL[c]}.</strong> {EXPLICA[c]}
                  </p>
                ))}
              </Bloque>
              <Bloque titulo={`Molécula actual: ${mol.nombre}`} icono="fa-atom">
                <p style={{ margin: 0, color: T.text2 }}>{mol.descripcion}</p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={ENLACES_QUIMICOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}
