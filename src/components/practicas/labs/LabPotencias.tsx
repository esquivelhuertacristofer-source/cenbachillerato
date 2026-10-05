"use client";

/**
 * Laboratorio 3D — Potencias y raíces.
 * Práctica experimental para PM-I-P09-A1.
 *
 * El estudiante elige una BASE y un EXPONENTE (² o ³) y ve la potencia
 * CONSTRUIDA con cubitos: n² es un cuadrado (área) y n³ es un cubo (volumen);
 * el número de cubitos es el valor de la potencia. Al resaltar el LADO descubre
 * la raíz como operación inversa: √(n²) = n y ∛(n³) = n. Pensamiento Matemático I.
 *
 * EXPERIMENTO CENTRAL: «Duplicar el lado». El alumno duplica el lado del
 * cuadrado y del cubo y VE crecer el bloque: los cubitos se multiplican ×4 en el
 * cuadrado y ×8 en el cubo. Un medidor compara n² y n³ para la misma base.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { POTENCIAS_RAICES_FICHA } from "./potencias-raices-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./potencias-raices-data";
import { LabSfx } from "./lab-audio";
import { BASES, EXPONENTES, expansion, potencia, type Exponente } from "./potencias-data";

const PotenciasScene = dynamic(() => import("./PotenciasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-cube fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const LADO = "#FFD166";
const C_CUAD = "#38bdf8";
const C_CUBO = "#fb923c";
const BASE_MIN = BASES[0];
const BASE_MAX = BASES[BASES.length - 1]!;
const MAX_CUBITOS = BASE_MAX ** 3;

const fmt = (n: number) => n.toLocaleString("es-MX");

const RETO_KEY = "cen-potencias-raices-reto";

export function LabPotencias({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [base, setBase] = useState(3);
  const [exponente, setExponente] = useState<Exponente>(2);
  const [resaltarLado, setResaltarLado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  // Último «duplicar el lado»: de qué lado a cuál y por cuánto se multiplicaron los cubitos.
  const [dup, setDup] = useState<{ e: Exponente; de: number; a: number; factor: number } | null>(null);
  const [dupVistos, setDupVistos] = useState<Set<number>>(() => new Set<number>());

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

  // seguimiento de objetivos
  const [interactuo, setInteractuo] = useState(false);
  const [expsVistos, setExpsVistos] = useState<Set<number>>(() => new Set<number>());
  const [usoRaiz, setUsoRaiz] = useState(false);

  const registrarExp = (e: Exponente) =>
    setExpsVistos((prev) => {
      if (prev.has(e)) return prev;
      const next = new Set(prev);
      next.add(e);
      return next;
    });

  const elegirBase = (n: number) => {
    setBase(n);
    setDup(null);
    setInteractuo(true);
    registrarExp(exponente);
    if (sonido) audioRef.current?.blip();
  };
  const elegirExponente = (e: Exponente) => {
    setExponente(e);
    setDup(null);
    setInteractuo(true);
    registrarExp(e);
    if (sonido) audioRef.current?.blip();
  };
  const duplicarLado = () => {
    const nuevo = base * 2;
    if (nuevo > BASE_MAX) return;
    const factor = potencia(nuevo, exponente) / potencia(base, exponente);
    setDup({ e: exponente, de: base, a: nuevo, factor });
    setDupVistos((prev) => new Set(prev).add(exponente));
    setBase(nuevo);
    setInteractuo(true);
    registrarExp(exponente);
    if (sonido) audioRef.current?.blip();
  };
  const toggleLado = () => {
    setResaltarLado((v) => {
      if (!v) setUsoRaiz(true);
      return !v;
    });
  };
  const reset = () => {
    setBase(3);
    setExponente(2);
    setResaltarLado(false);
    setDup(null);
    setResetNonce((n) => n + 1);
  };

  const info = useMemo(() => EXPONENTES.find((x) => x.e === exponente)!, [exponente]);
  const resultado = useMemo(() => potencia(base, exponente), [base, exponente]);
  const cuad = potencia(base, 2);
  const cubo = potencia(base, 3);

  const objetivos = [
    { txt: "Duplica el lado del cuadrado y del cubo: ¿por cuánto se multiplican los cubitos?", done: dupVistos.size >= 2 },
    { txt: "Cambia la base y observa el crecimiento", done: interactuo },
    { txt: "Construye un cuadrado: n² (área)", done: expsVistos.has(2) },
    { txt: "Construye un cubo: n³ (volumen)", done: expsVistos.has(3) },
    { txt: "Descubre la raíz: identifica el lado", done: usoRaiz },
    { txt: "Resuelve el reto de potencias y raíces", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${info.icono}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, ...NUM }}>
        {base}{info.simbolo} = {fmt(resultado)}
      </div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: {base}{info.simbolo} es {expansion(base, exponente)} = {fmt(resultado)} cubitos, y su raíz devuelve el lado {base}.
      </div>
    </div>
  );

  const lectura = dup && dup.e === exponente
    ? `Lado ×2 → los cubitos se multiplican ×${dup.factor}`
    : `${base}${info.simbolo} = ${expansion(base, exponente)} = ${fmt(resultado)} cubitos`;

  const puedeDuplicar = base * 2 <= BASE_MAX;

  return (
    <>
      <style>{CSS(accent)}</style>
      <LabShell
        accent={accent}
        rgba={color.rgba}
        retoKey={RETO_KEY}
        escena={
          <SceneBoundary fallback={sceneFallback}>
            <PotenciasScene base={base} exponente={exponente} resaltarLado={resaltarLado} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
          </SceneBoundary>
        }
        modos={{
          opciones: EXPONENTES.map((x) => ({ id: String(x.e), etiqueta: `${x.nombre} (n${x.simbolo})`, icono: x.icono })),
          valor: String(exponente),
          cambiar: (id) => elegirExponente(Number(id) as Exponente),
        }}
        herramientas={
          <>
            <BotonHerramienta icono="fa-up-right-and-down-left-from-center" titulo={puedeDuplicar ? "Duplicar el lado" : "Para duplicar, elige una base de 1 a 3"} onClick={duplicarLado} />
            <BotonHerramienta icono="fa-ruler-combined" titulo={resaltarLado ? "Ocultar el lado" : "Mostrar el lado (la raíz)"} activo={resaltarLado} onClick={toggleLado} />
            <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
            <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
            <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
          </>
        }
        leyenda={<MedidorCrecimiento cuad={cuad} cubo={cubo} activo={exponente} />}
        lectura={lectura}
        objetivos={objetivos}
        pestanas={[
          {
            id: "controles",
            etiqueta: "Controles",
            icono: "fa-sliders",
            contenido: (
              <>
                <Bloque titulo="Construye la potencia" icono={info.icono}>
                  <Deslizador
                    label="Base: el número que se repite"
                    icon="fa-ruler"
                    colr={accent}
                    valor={`${base}`}
                    min={BASE_MIN}
                    max={BASE_MAX}
                    step={1}
                    value={base}
                    onChange={elegirBase}
                    hintL={`${BASE_MIN}`}
                    hintR={`${BASE_MAX}`}
                  />
                  <button type="button" className="po-dup" onClick={duplicarLado} disabled={!puedeDuplicar}>
                    <i className="fa-solid fa-up-right-and-down-left-from-center" aria-hidden />
                    {puedeDuplicar ? `Duplicar el lado (${base} → ${base * 2})` : "Para duplicar, elige una base de 1 a 3"}
                  </button>
                  {dup && dup.e === exponente && (
                    <div className="po-aviso">
                      <i className="fa-solid fa-circle-check" aria-hidden />
                      <div>
                        El lado pasó de <strong style={NUM}>{dup.de}</strong> a <strong style={NUM}>{dup.a}</strong> (el doble) y los cubitos de{" "}
                        <strong style={NUM}>{fmt(potencia(dup.de, dup.e))}</strong> a <strong style={NUM}>{fmt(potencia(dup.a, dup.e))}</strong>: se multiplicaron{" "}
                        <strong style={{ color: LADO }}>×{dup.factor}</strong>, porque {dup.e === 2 ? "2² = 4" : "2³ = 8"}.
                      </div>
                    </div>
                  )}
                  <button type="button" className="po-lado" data-on={resaltarLado} onClick={toggleLado}>
                    <i className="fa-solid fa-ruler-combined" aria-hidden />
                    {resaltarLado ? "Ocultar el lado" : "Mostrar el lado (la raíz)"}
                  </button>
                </Bloque>

                <Bloque titulo="¿Cuánto crece cada una?" icono="fa-chart-simple">
                  <MedidorCrecimiento cuad={cuad} cubo={cubo} activo={exponente} />
                  <div style={{ color: T.text2 }}>
                    Compara <strong style={{ color: T.text }}>5² = 25</strong> con <strong style={{ color: T.text }}>5³ = 125</strong>: el cubo crece mucho más rápido.
                  </div>
                </Bloque>

                <Bloque titulo="La potencia paso a paso" icono="fa-list-ol">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                    <Dato label="Base" value={`${base}`} col={accent} />
                    <Dato label="Exponente" value={`${exponente}`} />
                    <Dato label={`Potencia (${info.figura})`} value={fmt(resultado)} col={accent} />
                    <Dato label="Raíz (lado)" value={`${base}`} col={resaltarLado ? LADO : undefined} />
                  </div>
                  <div style={{ color: T.text2 }}>
                    <strong style={{ color: T.text, ...NUM }}>{base}{info.simbolo}</strong> significa multiplicar la base por sí misma {exponente} veces:{" "}
                    <strong style={{ color: accent, ...NUM }}>{expansion(base, exponente)} = {fmt(resultado)}</strong>. Es el {info.forma} de un {info.figura} de lado {base}.
                  </div>
                </Bloque>

                <Bloque titulo="La raíz: operación inversa" icono="fa-square-root-variable">
                  <div style={{ color: T.text2 }}>
                    Si la potencia te da el {info.forma}, la raíz hace lo contrario: a partir del {info.forma}{" "}
                    <strong style={{ color: T.text, ...NUM }}>{fmt(resultado)}</strong> recupera el lado.
                  </div>
                  <div style={{ borderRadius: 13, border: `1px solid ${LADO}55`, background: `${LADO}14`, padding: "12px 14px", fontSize: 16, fontWeight: 800, color: T.text, ...NUM }}>
                    {info.raiz}{fmt(resultado)} = {base}
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.text2, marginLeft: 10 }}>(el lado mide {base} cubitos)</span>
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
                <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                  <p style={{ margin: 0, color: T.text2 }}>
                    El <strong style={{ color: T.text }}>exponente</strong> dice cuántas veces se multiplica la base, no por cuánto se multiplica. La{" "}
                    <strong style={{ color: LADO }}>raíz</strong> deshace la potencia: por eso <strong style={{ color: T.text, ...NUM }}>√(n²) = n</strong> y{" "}
                    <strong style={{ color: T.text, ...NUM }}>∛(n³) = n</strong>.
                  </p>
                </Bloque>
                <Bloque titulo="Ficha teórica" icono="fa-book">
                  <FichaTeorica data={POTENCIAS_RAICES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
                </Bloque>
              </>
            ),
          },
        ]}
      />
    </>
  );
}

/* ── Medidor: cubitos de n² y de n³ para la misma base, a la misma escala ───── */
function MedidorCrecimiento({ cuad, cubo, activo }: { cuad: number; cubo: number; activo: Exponente }) {
  const fila = (txt: string, v: number, c: string, on: boolean) => (
    <div style={{ display: "grid", gap: 3, opacity: on ? 1 : 0.7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: on ? 900 : 700, color: "#dce6f5" }}>
        <span>{txt}</span>
        <span style={{ fontFamily: "ui-monospace, monospace" }}>{fmt(v)}</span>
      </div>
      <div style={{ height: 8, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: `${(v / MAX_CUBITOS) * 100}%`, minWidth: 4, height: "100%", background: c, transition: "width 160ms ease" }} />
      </div>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 220 }}>
      {fila("n² cubitos", cuad, C_CUAD, activo === 2)}
      {fila("n³ cubitos", cubo, C_CUBO, activo === 3)}
    </div>
  );
}

const CSS = (accent: string) => `
.po-dup { cursor:pointer; width:100%; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:13px 16px;
  border-radius:12px; border:none; background:${accent}; color:#04121f; font-size:15px; font-weight:800; transition:all .15s; }
.po-dup:hover:not(:disabled) { filter:brightness(1.08); }
.po-dup:disabled { opacity:0.5; cursor:default; }
.po-lado { cursor:pointer; width:100%; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 16px;
  border-radius:12px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
.po-lado i { color:${LADO}; }
.po-lado:hover { border-color:${LADO}; }
.po-lado[data-on="true"] { border-color:${LADO}; background:${LADO}1f; }
.po-aviso { display:flex; gap:11px; align-items:flex-start; padding:12px 14px; border-radius:13px; border:1px solid ${OK}55;
  background:${OK}14; color:${T.text2}; }
.po-aviso i { color:${OK}; font-size:17px; margin-top:3px; }
`;
