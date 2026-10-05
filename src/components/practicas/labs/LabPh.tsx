"use client";

/**
 * Laboratorio 3D — Escala de pH, ácidos y bases.
 * Práctica experimental para CNEYT-IV-P03-A2 (simulacion "Simulación de
 * laboratorio: midiendo el pH"; UAC "Reacciones químicas", progresión 3:
 * "Analiza el concepto de pH y la importancia de los ácidos y bases…").
 *
 * Dos modos:
 *  · Medir — el alumno elige una sustancia (las 6 del panel de la simulación +
 *    sustancias cotidianas de la lectura) y ve la disolución teñirse con el
 *    indicador de col morada y el marcador moverse por la escala 0–14.
 *  · Neutralizar — titula un ácido (fuerte HCl / débil vinagre) con NaOH gota a
 *    gota; el pH sube hasta el punto de equivalencia. La curva muestra la
 *    diferencia entre ácido fuerte y débil (región buffer).
 *
 * Valores de pH = los de la actividad. Color del indicador = cualitativo.
 * Curva de titulación = modelo simplificado con las formas correctas.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { PH_FICHA } from "./ph-escala-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./ph-escala-data";
import { EppGate, type EppItem } from "./_epp-gate";
import { LabSfx } from "./lab-audio";
import {
  SUSTANCIAS, COTIDIANAS, sustancia, SUST_DEF,
  ACIDOS, type TipoAcido, phPorGotas, curvaTitulacion, GOTAS_EQ, GOTAS_MAX,
  colorCol, nombreColor, clasifica, fmtPh,
  BUFFER, DATOS, IDEAS, type Sustancia,
} from "./ph-data";

const PhScene = dynamic(() => import("./PhScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando las disoluciones…</span>
    </div>
  ),
});

type Modo = "medir" | "neutralizar";

const WARN = "#FF8A3C";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { VinetaTermino } from "./_vineta";
const RETO_KEY = "cen-ph-reto";

/** Equipo de protección personal: en química se manejan ácidos y bases corrosivos. */
const INSTRUMENTOS: EppItem[] = [
  { key: "lentes", nombre: "Lentes de seguridad", icono: "fa-glasses", ok: true, nota: "Protegen tus ojos de salpicaduras de ácido o base." },
  { key: "bata", nombre: "Bata de laboratorio", icono: "fa-user-doctor", ok: true, nota: "Protege tu piel y tu ropa de los reactivos." },
  { key: "guantes", nombre: "Guantes de nitrilo", icono: "fa-hand", ok: true, nota: "Evitan el contacto directo con sustancias corrosivas." },
  { key: "gorra", nombre: "Gorra", icono: "fa-hat-cowboy", ok: false, nota: "No es equipo de protección de laboratorio." },
  { key: "audifonos", nombre: "Audífonos", icono: "fa-headphones", ok: false, nota: "Te distraen y no protegen de los reactivos." },
  { key: "sandalias", nombre: "Sandalias", icono: "fa-shoe-prints", ok: false, nota: "En el laboratorio se exige calzado cerrado, no sandalias." },
];

export function LabPh({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("medir");
  const [sustId, setSustId] = useState(SUST_DEF);
  const [acidoId, setAcidoId] = useState<TipoAcido>("fuerte");
  const [gotas, setGotas] = useState(0);
  const [titulando, setTitulando] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // pilares: equiparse · pasos · arrastrar · calcular
  const [eppListo, setEppListo] = useState(false);
  const [medido, setMedido] = useState(false);
  const [arrastro, setArrastro] = useState(false);
  const [predicho, setPredicho] = useState(false);
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  // sonido
  const [eqVistas, setEqVistas] = useState<string[]>([]);
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

  const bump = () => setResetNonce((n) => n + 1);

  // pH actual según el modo.
  const sust = useMemo(() => sustancia(sustId), [sustId]);
  const ph = modo === "medir" ? sust.ph : phPorGotas(acidoId, gotas);
  const colorLiquido = colorCol(ph);
  const clase = clasifica(ph);
  const colorTxt = nombreColor(ph);

  const acido = ACIDOS.find((a) => a.id === acidoId)!;
  const curva = useMemo(() => curvaTitulacion(acidoId), [acidoId]);
  const enEquivalencia = modo === "neutralizar" && gotas === GOTAS_EQ;

  // ── Objetivos guiados (se marcan en vivo) ──────────────────────────
  // Ajuste durante el render: recuerda con qué ácidos se llegó a la equivalencia.
  if (enEquivalencia && !eqVistas.includes(acidoId)) setEqVistas([...eqVistas, acidoId]);

  // Concentración relativa de H⁺ respecto al agua pura (potencia de 10).
  const exp = 7 - ph;
  const relTxt = Math.abs(exp) < 0.05 ? "igual que el agua" : `×10${supScript(exp)}`;

  // Titulación automática "paso a paso" (setInterval en useEffect: seguro con
  // React Compiler — no es render ni useFrame).
  useEffect(() => {
    if (!titulando) return;
    const id = setInterval(() => {
      setGotas((g) => {
        if (g >= GOTAS_MAX) {
          setTitulando(false);
          return g;
        }
        return g + 1;
      });
    }, 320);
    return () => clearInterval(id);
  }, [titulando]);

  const cambiarModo = (m: Modo) => {
    setTitulando(false);
    setModo(m);
    bump();
  };

  const elegirSust = (id: string) => {
    setSustId(id);
    setMedido(true);
    if (sonido) audioRef.current?.blip();
    bump();
  };

  // Arrastre de la bureta en la escena 3D → gotas de NaOH (pilar "manipular").
  const onArrastraGotas = useCallback((g: number) => {
    setTitulando(false);
    setArrastro(true);
    setGotas(Math.max(0, Math.min(GOTAS_MAX, Math.round(g))));
  }, []);
  const onGrabGotas = useCallback(() => {
    if (sonido) audioRef.current?.blip();
  }, [sonido]);

  // Registro del reto de cálculo (estrellas + récord en localStorage).
  const registraEstrellas = useCallback((est: number) => {
    setPredicho(true);
    guardaEstrellas(est);
  }, [guardaEstrellas]);

  const elegirAcido = (id: TipoAcido) => {
    setTitulando(false);
    setAcidoId(id);
    setGotas(0);
    bump();
  };

  const titular = () => {
    if (gotas >= GOTAS_MAX) setGotas(0);
    setTitulando(true);
  };

  const reiniciar = () => {
    setTitulando(false);
    setGotas(0);
    bump();
  };

  const goteando = titulando;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-flask" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Escala de pH</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: pH = {fmtPh(ph)} → {clase.etiqueta.toLowerCase()} (indicador de col morada: {colorTxt}).
      </div>
    </div>
  );

  const lectura = <>pH {fmtPh(ph)} · {clase.etiqueta} · indicador {colorTxt}</>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <>
          <style>{CSS_PH}</style>
          <SceneBoundary fallback={sceneFallback}>
            <PhScene
              ph={ph}
              colorLiquido={colorLiquido}
              accent={accent}
              modo={modo}
              goteando={goteando}
              gotas={gotas}
              gotasMax={GOTAS_MAX}
              resetNonce={resetNonce}
              arrastrable={eppListo}
              onGotasChange={onArrastraGotas}
              onGrab={onGrabGotas}
            />
          </SceneBoundary>
          {/* Compuerta de equipamiento: hasta no equiparse no se entra al laboratorio */}
          {!eppListo && (
            <EppGate
              accent={accent}
              rgba={color.rgba}
              items={INSTRUMENTOS}
              titulo="Antes de medir: equípate"
              subtitulo="Vas a manejar ácidos y bases corrosivos. Selecciona tu equipo de protección personal."
              intro="En química la seguridad es lo primero. Elige las tres piezas de protección correctas para entrar al laboratorio."
              verbo="Entrar al laboratorio"
              onEntrar={() => { setEppListo(true); if (sonido) audioRef.current?.blip(); }}
            />
          )}
        </>
      }
      modos={{
        opciones: [
          { id: "medir", etiqueta: "Medir", icono: "fa-eye-dropper" },
          { id: "neutralizar", etiqueta: "Neutralizar", icono: "fa-droplet" },
        ],
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          {modo === "neutralizar" && (
            <BotonHerramienta icono={titulando ? "fa-pause" : "fa-play"} titulo={titulando ? "Pausar" : "Neutralizar paso a paso"} activo={titulando} onClick={() => (titulando ? setTitulando(false) : titular())} />
          )}
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      leyenda={
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: colorLiquido, border: "1px solid rgba(255,255,255,0.4)" }} />
            pH {fmtPh(ph)}
          </div>
          <div style={{ color: clase.color, fontWeight: 800 }}>{clase.etiqueta}{clase.matiz ? ` (${clase.matiz})` : ""}</div>
          <div style={{ color: "#bfe8ff" }}>H⁺ vs agua: {relTxt}</div>
        </>
      }
      lectura={lectura}
      objetivos={[
        { txt: "Equípate con tu equipo de protección personal", done: eppListo },
        { txt: "Mide el pH de una sustancia", done: medido },
        { txt: "Observa cómo cambia el indicador de col morada", done: medido && ph !== 7 },
        { txt: "Arrastra la bureta de NaOH para titular", done: arrastro },
        { txt: "Alcanza el punto de equivalencia (neutralización)", done: modo === "neutralizar" && gotas >= GOTAS_EQ, modo: "neutralizar" },
        { txt: "Titula el ácido fuerte y el débil: compara en qué pH cae cada equivalencia", done: eqVistas.length >= 2 },
        { txt: "Calcula los iones H⁺ (escala logarítmica)", done: predicho },
        { txt: "Aprueba el cuestionario de la actividad A4", done: ejercicioAprobado },
      ]}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: modo === "medir" ? (
            <>
              <Bloque titulo="Elige una sustancia y mide su pH" icono="fa-vials">
                <div style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>En el laboratorio (simulación)</div>
                <div className="ph-chips">
                  {SUSTANCIAS.map((s) => (
                    <ChipSust key={s.id} s={s} on={s.id === sustId} onClick={() => elegirSust(s.id)} />
                  ))}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.text3 }}>En la vida diaria (lectura)</div>
                <div className="ph-chips">
                  {COTIDIANAS.map((s) => (
                    <ChipSust key={s.id} s={s} on={s.id === sustId} onClick={() => elegirSust(s.id)} />
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Lo que lees ahora" icono="fa-flask">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="pH" value={fmtPh(ph)} col={clase.color} />
                  <Dato label="indicador" value={colorTxt} col={colorLiquido} />
                  <Dato label="H⁺ vs agua" value={relTxt} col="#bfe8ff" />
                  <Dato label="tipo" value={clase.etiqueta} col={clase.color} />
                </div>
              </Bloque>
            </>
          ) : (
            <>
              <Bloque titulo="Titula el ácido con NaOH (base fuerte)" icono="fa-flask-vial">
                <div style={{ display: "grid", gap: 8 }}>
                  {ACIDOS.map((a) => (
                    <button key={a.id} className="ph-chip" data-on={a.id === acidoId} onClick={() => elegirAcido(a.id)}>
                      <i className="fa-solid fa-vial" style={{ color: accent }} />
                      <span style={{ color: "#fff", fontWeight: 900 }}>{a.nombre}</span>
                    </button>
                  ))}
                </div>
                <Deslizador label="gotas de NaOH" icon="fa-droplet" colr={accent} valor={`${gotas} de ${GOTAS_MAX}`} min={0} max={GOTAS_MAX} step={1} value={gotas} onChange={(v) => { setArrastro(true); setGotas(Math.round(v)); setTitulando(false); }} hintL="0" hintR={`${GOTAS_MAX}`} />
                <p style={{ margin: 0, color: T.text2 }}>
                  También puedes arrastrar la perilla de la bureta en la escena.
                  {enEquivalencia ? " Estás en el punto de equivalencia." : ` La equivalencia está en ${GOTAS_EQ} gotas.`}
                </p>
                <div className="ph-btnrow">
                  <button className="ph-solve" onClick={titular} disabled={titulando}
                    style={{ background: titulando ? "rgba(255,255,255,0.06)" : accent, color: titulando ? T.text3 : "#04121f", cursor: titulando ? "default" : "pointer" }}>
                    <i className={`fa-solid ${titulando ? "fa-spinner fa-spin" : "fa-play"}`} />
                    {titulando ? "Goteando…" : "Neutralizar paso a paso"}
                  </button>
                  <button className="ph-ghost" onClick={reiniciar}>
                    <i className="fa-solid fa-rotate-left" /> Reiniciar
                  </button>
                </div>
              </Bloque>
              <Bloque titulo="Curva pH vs gotas" icono="fa-chart-line">
                <CurvaTitulacion curva={curva} gotas={gotas} accent={accent} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="pH" value={fmtPh(ph)} col={clase.color} />
                  <Dato label="gotas" value={`${gotas}`} col={accent} />
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
            <>
              <PrediccionPhCard
                accent={accent}
                phLive={ph}
                mejor={mejorEstrellas}
                onResultado={registraEstrellas}
                playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
              />
              <div style={{ marginTop: 18 }}>
                <RetoQuizCard
                  quiz={QUIZ_A2}
                  accent={accent}
                  rgba={color.rgba}
                  aprobado={ejercicioAprobado}
                  onAprobado={() => setEjercicioAprobado(true)}
                  playSfx={sonido ? (ok) => { if (ok) audioRef.current?.correcto(); else audioRef.current?.incorrecto(); } : undefined}
                  playPick={sonido ? () => audioRef.current?.blip() : undefined}
                />
              </div>
            </>
          ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo={modo === "medir" ? "Sobre esta sustancia" : "Sobre esta titulación"} icono="fa-circle-info">
                <p style={{ margin: 0, color: T.text2 }}>{modo === "medir" ? sust.contexto : acido.descripcion}</p>
                {clase.tipo === "acido"
                  ? <p style={{ margin: 0, color: T.text2 }}>Más ácido que el agua: hay <strong style={{ color: "#FB7185" }}>más iones H⁺</strong>. Como la escala es logarítmica, bajar 1 de pH es <strong>×10</strong> más H⁺.</p>
                  : clase.tipo === "base"
                    ? <p style={{ margin: 0, color: T.text2 }}>Más básico que el agua: hay <strong style={{ color: "#34D399" }}>menos iones H⁺</strong> (más OH⁻). Subir 1 de pH es <strong>×10</strong> menos H⁺.</p>
                    : <p style={{ margin: 0, color: T.text2 }}>pH 7: <strong style={{ color: "#A78BFA" }}>neutro</strong>, como el agua pura a 25 °C.</p>}
                <p style={{ margin: 0, color: T.text3 }}>
                  El <strong style={{ color: accent }}>punto de equivalencia</strong> es donde el ácido queda justo neutralizado ({GOTAS_EQ} gotas). En ácido fuerte cae en pH 7; en ácido débil, en pH &gt; 7.
                </p>
              </Bloque>
              <Bloque titulo="¿Qué hace un buffer?" icono="fa-shield-halved">
                <p style={{ margin: 0, color: T.text2 }}>Si añades la misma gota de ácido fuerte a cada una, mira cuánto cambia el pH:</p>
                <div style={{ display: "grid", gap: 12 }}>
                  {BUFFER.map((b) => (
                    <BarraBuffer key={b.nombre} b={b} />
                  ))}
                </div>
                <p style={{ margin: 0, color: T.text3 }}>Por eso la sangre, amortiguada con bicarbonato, se mantiene entre 7.35 y 7.45.</p>
              </Bloque>
              <Bloque titulo="Datos clave" icono="fa-gauge-high">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 10 }}>
                  {DATOS.map((d, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                      <i className={`fa-solid ${d.icono}`} style={{ color: accent, marginTop: 4 }} aria-hidden />
                      <div>
                        <div style={{ fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{d.valor}</div>
                        <div style={{ color: T.text2, lineHeight: 1.4 }}>{d.texto}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: T.text2 }}>
                  {IDEAS.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={PH_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                Los valores de pH son los de la actividad (lectura y simulación); donde hay un rango se usa un valor representativo y se conserva el texto original. El color del indicador de col morada es <strong>cualitativo</strong> (reproduce la regla rojo/rosa→morado→azul/verde, no es una medición colorimétrica). La curva de titulación usa un <strong>modelo simplificado</strong> (ácido 0.1 M en 25 mL, NaOH 0.1 M), pero el salto brusco en la equivalencia y la región buffer del ácido débil son las formas correctas de la fisicoquímica.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

const CSS_PH = `
  .ph-chips { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap:8px; }
  .ph-chip { cursor:pointer; padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
    color:${T.text2}; font-size:14px; font-weight:800; transition:all .15s; text-align:left; display:flex; align-items:center; gap:9px; min-width:0; }
  .ph-chip:hover { border-color:rgba(255,255,255,0.4); color:#fff; }
  .ph-chip[data-on="true"] { border-color:var(--lsa); background:rgba(255,255,255,0.1); color:#fff; }
  .ph-btnrow { display:flex; gap:10px; flex-wrap:wrap; }
  .ph-solve { cursor:pointer; flex:1; min-width:150px; padding:11px 14px; border-radius:11px; border:none; font-size:14px; font-weight:900;
    display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
  .ph-ghost { cursor:pointer; padding:11px 14px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
    color:${T.text2}; font-size:14px; font-weight:900; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
  .ph-ghost:hover { border-color:rgba(255,255,255,0.3); color:#fff; }
  .calc-in { width:100%; padding:11px 13px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
    color:#fff; font-size:16px; font-weight:800; font-family:ui-monospace, monospace; outline:none; transition:border-color .15s; min-width:0; }
  .calc-in:focus { border-color:var(--lsa); }
  .calc-btn { cursor:pointer; padding:11px 16px; border-radius:11px; border:none; font-size:14px; font-weight:900;
    display:inline-flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
  .calc-btn-primary { background:var(--lsa); color:#04121f; }
  .calc-btn-primary:hover { filter:brightness(1.08); }
  .calc-btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
  .calc-btn-ghost { background:${T.inset}; color:${T.text2}; border:1px solid ${T.line}; }
  .calc-btn-ghost:hover { color:#fff; border-color:rgba(255,255,255,0.3); }
`;

/* ── Superíndice de potencia de 10 (entero redondeado) ───────────────────── */
function supScript(exp: number): string {
  const n = Math.round(exp);
  if (n === 0) return "⁰";
  const sup: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
  return String(n).split("").map((c) => sup[c] ?? c).join("");
}

/* ── Factor de concentración (potencia de 10 legible) ────────────────────── */
function fmtFactor(f: number): string {
  if (f >= 100) {
    const e = Math.round(Math.log10(f));
    return `10${supScript(e)}`;
  }
  return f.toFixed(f < 10 ? 1 : 0);
}

/* ── Reto de cálculo: iones H⁺ frente al agua (escala logarítmica) ────────── */
function PrediccionPhCard({
  accent, phLive, mejor, onResultado, playSfx,
}: {
  accent: string;
  phLive: number;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [snap, setSnap] = useState<number | null>(null);
  const [val, setVal] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [check, setCheck] = useState(false);
  const [estrellas, setEstrellas] = useState<number | null>(null);

  const tomarLectura = () => {
    setSnap(Number(phLive.toFixed(2)));
    setVal(""); setIntentos(0); setCheck(false); setEstrellas(null);
  };

  const expDiff = snap !== null ? 7 - snap : 0;
  const absExp = Math.abs(expDiff);
  const esAcido = expDiff > 0.05;
  const esBase = expDiff < -0.05;
  const factorEsp = Math.pow(10, absExp);
  const dir = esAcido ? "más" : esBase ? "menos" : "igual";

  const num = Number((val || "").trim().replace(",", "."));
  const okActual =
    snap !== null && val.trim() !== "" && !Number.isNaN(num) && num > 0 &&
    Math.abs(Math.log10(num) - absExp) <= 0.2;

  const comprobar = () => {
    if (snap === null || val.trim() === "") return;
    const n = intentos + 1;
    setIntentos(n);
    setCheck(true);
    if (okActual) {
      const est = n <= 1 ? 3 : n === 2 ? 2 : 1;
      setEstrellas(est);
      onResultado(est);
    }
    playSfx?.(okActual);
  };

  return (
    <div style={{ ...card, padding: "18px 22px 20px" }}>
      <Eyebrow>
        <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />
        Reto: calcula los iones H⁺
      </Eyebrow>

      {snap === null ? (
        <>
          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, marginBottom: 14 }}>
            La escala de pH es <strong style={{ color: "#fff" }}>logarítmica</strong>: cada unidad de pH equivale a <strong style={{ color: accent }}>×10</strong> en la concentración de iones H⁺. Toma una lectura del visor y calcula cuántas veces difiere del agua pura.
          </div>
          <button className="calc-btn calc-btn-primary" onClick={tomarLectura} style={{ width: "100%" }}>
            <i className="fa-solid fa-crosshairs" /> Tomar lectura del visor (pH {fmtPh(phLive)})
          </button>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <Snap label="pH medido" value={fmtPh(snap)} accent={accent} />
            <i className="fa-solid fa-arrow-right" style={{ color: T.text3 }} />
            <Snap label="agua pura" value="7.00" accent={accent} />
          </div>

          <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>
            ¿Cuántas veces <strong style={{ color: "#fff" }}>{dir === "igual" ? "más o menos" : dir}</strong> concentración de iones H⁺ tiene esta disolución respecto al agua pura?{" "}
            <span style={{ color: T.text3 }}>Pista: {absExp < 0.05 ? "el pH es 7" : `la diferencia es ${absExp.toFixed(absExp % 1 === 0 ? 0 : 1)} unidad(es) de pH`}.</span>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "stretch", marginBottom: 6 }}>
            <input
              className="calc-in"
              inputMode="decimal"
              placeholder="número de veces"
              value={val}
              onChange={(e) => { setVal(e.target.value); setCheck(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") comprobar(); }}
              style={{ flex: 1 }}
            />
            <button className="calc-btn calc-btn-primary" onClick={comprobar} disabled={val.trim() === ""}>
              <i className="fa-solid fa-check" /> Comprobar
            </button>
          </div>

          {check && (
            <div style={{ fontSize: 14, lineHeight: 1.55, marginTop: 10, padding: "11px 13px", borderRadius: 11,
              border: `1px solid ${okActual ? OK : WARN}55`, background: okActual ? `${OK}14` : `${WARN}12`, color: okActual ? OK : WARN }}>
              {okActual ? (
                <>
                  <strong>¡Correcto!</strong> Hay <strong>{fmtFactor(factorEsp)}</strong> veces {dir} H⁺ que el agua{" "}
                  {esAcido ? "(disolución ácida)" : esBase ? "(disolución básica)" : "(es neutra)"}: [H⁺] = 10<sup>−{fmtPh(snap)}</sup> M.
                </>
              ) : (
                <>
                  Aún no. La diferencia de pH es <strong>{absExp.toFixed(absExp % 1 === 0 ? 0 : 1)}</strong> unidad(es), así que el factor es 10<sup>{absExp.toFixed(absExp % 1 === 0 ? 0 : 1)}</sup> = <strong>{fmtFactor(factorEsp)}</strong>. Vuelve a intentarlo.
                </>
              )}
            </div>
          )}

          {estrellas !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {[1, 2, 3].map((s) => (
                  <i key={s} className="fa-solid fa-star" style={{ fontSize: 16, color: s <= estrellas ? "#FBBF24" : "rgba(255,255,255,0.16)" }} />
                ))}
              </div>
              <span style={{ fontSize: 14, color: T.text3, fontWeight: 700 }}>
                {estrellas === 3 ? "¡A la primera!" : estrellas === 2 ? "Bien hecho" : "Resuelto"}
                {mejor > 0 && ` · Mejor: ${mejor}★`}
              </span>
            </div>
          )}

          <button className="calc-btn calc-btn-ghost" onClick={tomarLectura} style={{ width: "100%", marginTop: 12, background: "transparent" }}>
            <i className="fa-solid fa-rotate-left" /> Tomar otra lectura
          </button>
        </>
      )}
    </div>
  );
}

/* ── Mini-tarjeta de lectura capturada ───────────────────────────────────── */
function Snap({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ padding: "8px 14px", borderRadius: 11, border: `1px solid ${accent}44`, background: `${accent}10`, textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, textTransform: "uppercase" }}>{label}</div>
      <div style={{ ...NUM, fontSize: 18, fontWeight: 900, color: "#fff" }}>{value}</div>
    </div>
  );
}

/* ── Chip de sustancia ───────────────────────────────────────────────────── */
function ChipSust({ s, on, onClick }: { s: Sustancia; on: boolean; onClick: () => void }) {
  const col = colorCol(s.ph);
  return (
    <button className="ph-chip" data-on={on} onClick={onClick} title={s.nombre}>
      <span style={{ width: 16, height: 16, borderRadius: 5, background: col, border: "1px solid rgba(255,255,255,0.4)", flexShrink: 0 }} />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", color: "#fff", fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.nombre}</span>
        <span style={{ display: "block", fontSize: 14, color: T.text3, fontWeight: 700 }}>pH {s.phTexto}</span>
      </span>
    </button>
  );
}

/* ── Curva de titulación (SVG inline) ────────────────────────────────────── */
function CurvaTitulacion({ curva, gotas, accent }: { curva: { gota: number; ph: number }[]; gotas: number; accent: string }) {
  const W = 320, H = 150, PL = 30, PB = 22, PT = 8, PR = 8;
  const x = (g: number) => PL + (g / GOTAS_MAX) * (W - PL - PR);
  const y = (ph: number) => PT + (1 - ph / 14) * (H - PT - PB);
  const pts = curva.map((p) => `${x(p.gota).toFixed(1)},${y(p.ph).toFixed(1)}`).join(" ");
  const cur = curva.find((p) => p.gota === gotas) ?? curva[0]!;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {/* rejilla pH 0,7,14 */}
      {[0, 7, 14].map((g) => (
        <g key={g}>
          <line x1={PL} y1={y(g)} x2={W - PR} y2={y(g)} stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray={g === 7 ? "3 3" : undefined} />
          <text x={PL - 5} y={y(g) + 3} textAnchor="end" fontSize={11} fill="rgba(255,255,255,0.5)">{g}</text>
        </g>
      ))}
      {/* línea de equivalencia */}
      <line x1={x(GOTAS_EQ)} y1={PT} x2={x(GOTAS_EQ)} y2={H - PB} stroke={`${accent}66`} strokeWidth={1} strokeDasharray="4 3" />
      <text x={x(GOTAS_EQ)} y={H - 8} textAnchor="middle" fontSize={11} fill={accent} fontWeight={700}>equivalencia</text>
      {/* curva */}
      <polyline points={pts} fill="none" stroke={accent} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
      {/* punto actual */}
      <circle cx={x(cur.gota)} cy={y(cur.ph)} r={4.5} fill="#fff" stroke={accent} strokeWidth={2} />
      <text x={x(cur.gota)} y={y(cur.ph) - 8} textAnchor="middle" fontSize={12} fill="#fff" fontWeight={800}>pH {fmtPh(cur.ph)}</text>
      {/* eje x */}
      <text x={(PL + W - PR) / 2} y={H - 1} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.4)">gotas de NaOH →</text>
    </svg>
  );
}

/* ── Barra del buffer ────────────────────────────────────────────────────── */
function BarraBuffer({ b }: { b: typeof BUFFER[number] }) {
  const delta = Math.abs(b.phAntes - b.phDespues);
  const pct = (ph: number) => `${(ph / 14) * 100}%`;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <VinetaTermino termino={b.nombre} color={T.text2} icono={b.icono} tam={26} radio={7} />
        <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{b.nombre}</span>
        <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 800, color: delta > 1 ? "#FB7185" : "#34D399", fontFamily: "ui-monospace, monospace" }}>
          ΔpH {delta.toFixed(1)}
        </span>
      </div>
      <div style={{ position: "relative", height: 10, borderRadius: 6, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: pct(Math.min(b.phAntes, b.phDespues)), width: `${(delta / 14) * 100}%`, top: 0, bottom: 0, background: delta > 1 ? "rgba(251,113,133,0.5)" : "rgba(52,211,153,0.5)" }} />
        <div style={{ position: "absolute", left: pct(b.phDespues), top: -2, bottom: -2, width: 2, background: "#fff" }} />
        <div style={{ position: "absolute", left: pct(b.phAntes), top: -2, bottom: -2, width: 2, background: "rgba(255,255,255,0.5)" }} />
      </div>
      <div style={{ fontSize: 14, color: T.text3, marginTop: 4 }}>
        pH {b.phAntes} → <strong style={{ color: "#fff" }}>{b.phDespues}</strong> · {b.nota}
      </div>
    </div>
  );
}
