"use client";

/**
 * Laboratorio 3D — Notación científica.
 * Práctica experimental para PM-I-P06-A6.
 *
 * Experimento central: el estudiante mueve el EXPONENTE de a × 10ⁿ y VE cómo
 * el punto decimal recorre la tira de dígitos mientras el marcador sube o baja
 * la torre de escalas reales (del átomo al Sol). Convertir de unidad (m ↔ km ↔
 * mm) solo cambia el exponente. Pensamiento Matemático I.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { NOTACION_CIENTIFICA_FICHA } from "./notacion-cientifica-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./notacion-cientifica-data";
import { LabSfx } from "./lab-audio";
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
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
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

/** Tira de dígitos: el punto decimal (en color) se corre al mover el exponente. */
function TiraDecimal({ texto, accent, compacta = false }: { texto: string; accent: string; compacta?: boolean }) {
  const chars = texto.replace(/ /g, "").split("");
  const lado = compacta ? 22 : 30;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "flex-end", maxWidth: compacta ? 240 : undefined }} aria-label={texto}>
      {chars.map((c, i) =>
        c === "." ? (
          <span key={i} style={{ width: 10, textAlign: "center", fontSize: compacta ? 22 : 30, fontWeight: 900, color: accent, lineHeight: 1 }}>.</span>
        ) : (
          <span
            key={i}
            style={{
              width: lado, height: lado + 6, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6,
              background: c === "0" ? "rgba(255,255,255,0.06)" : `${accent}33`,
              border: `1px solid ${c === "0" ? "rgba(255,255,255,0.14)" : accent}`,
              color: "#fff", fontWeight: 900, fontSize: compacta ? 14 : 18, fontFamily: "ui-monospace, monospace",
            }}
          >
            {c}
          </span>
        ),
      )}
    </div>
  );
}

export function LabNotacionCientifica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [a, setA] = useState(1.7);
  const [n, setN] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [playing, setPlaying] = useState(false);

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
  const [pasoUno, setPasoUno] = useState(false);
  const [movioExp, setMovioExp] = useState(false);
  const [vioGrande, setVioGrande] = useState(false);
  const [vioPequeno, setVioPequeno] = useState(false);
  const [refsVistas, setRefsVistas] = useState<Set<string>>(() => new Set<string>());

  const marcar = (v: number) => {
    setMovioExp(true);
    if (v >= 6) setVioGrande(true);
    if (v <= -6) setVioPequeno(true);
  };
  const moverN = (v: number) => {
    if (Math.abs(v - n) === 1) setPasoUno(true);
    setN(v);
    marcar(v);
    if (sonido) audioRef.current?.blip();
  };
  const irA = (r: Referencia) => {
    setPlaying(false);
    setA(r.a);
    setN(r.n);
    marcar(r.n);
    setRefsVistas((prev) => {
      if (prev.has(r.key)) return prev;
      const next = new Set(prev);
      next.add(r.key);
      return next;
    });
  };
  const reset = () => {
    setPlaying(false);
    setA(1.7);
    setN(0);
    setResetNonce((k) => k + 1);
  };

  // Barrido automático del exponente de ida y vuelta (un salto ×10 por tic).
  useEffect(() => {
    if (!playing) return;
    let dir = 1;
    const id = setInterval(() => {
      setN((prev) => {
        let next = prev + dir;
        if (next >= N_MAX) { next = N_MAX; dir = -1; }
        else if (next <= N_MIN) { next = N_MIN; dir = 1; }
        if (next >= 6) setVioGrande(true);
        if (next <= -6) setVioPequeno(true);
        return next;
      });
      setPasoUno(true);
      setMovioExp(true);
    }, 650);
    return () => clearInterval(id);
  }, [playing]);

  const decimal = useMemo(() => agrupar(expandir(a, n)), [a, n]);
  const aStr = fmtA(a);
  const nKm = n - 3; // 1 m = 10⁻³ km
  const nMm = n + 3; // 1 m = 10³ mm

  const objetivos = [
    { txt: "Sube el exponente de 1 en 1: cada paso multiplica por 10", done: pasoUno },
    { txt: "Mueve el exponente y observa el punto decimal", done: movioExp },
    { txt: "Llega a un número muy grande (n ≥ 6)", done: vioGrande },
    { txt: "Llega a un número muy pequeño (n ≤ −6)", done: vioPequeno },
    { txt: "Visita 3 referencias reales", done: refsVistas.size >= 3 },
    { txt: "Resuelve el reto de notación científica", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-ruler-vertical" />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>
        <Sci a={aStr} n={n} unidad="m" />
      </div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la torre de escalas 3D, pero la idea sigue: en forma desarrollada son <strong style={{ color: T.text, ...NUM }}>{decimal} m</strong>.
      </div>
    </div>
  );

  const lecturaCorta = (
    <>
      <Sci a={aStr} n={n} /> = <span style={{ ...NUM }}>{decimal}</span> m
    </>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <NotacionScene a={a} n={n} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono={playing ? "fa-pause" : "fa-play"} titulo={playing ? "Pausar" : "Recorrer los exponentes"} activo={playing} onClick={() => setPlaying((p) => !p)} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>Forma desarrollada (m)</div>
          <TiraDecimal texto={decimal} accent={accent} compacta />
          <div style={{ fontSize: 14, fontWeight: 900, color: n === 0 ? T.text : accent }}>
            {n === 0 ? "n = 0: el punto no se corre" : n > 0 ? `Punto ${n} a la derecha: ×10^${n}` : `Punto ${-n} a la izquierda: ÷10^${-n}`}
          </div>
        </>
      }
      lectura={lecturaCorta}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <Bloque titulo="Arma el número: a × 10ⁿ" icono="fa-sliders">
                <Deslizador
                  label="Mantisa a" icon="fa-hashtag" colr={accent} valor={aStr} min={A_MIN} max={A_MAX} step={0.1} value={a}
                  onChange={(v) => { setPlaying(false); setA(v); setMovioExp(true); }} hintL="1.0" hintR="9.9 (1 ≤ a < 10)"
                />
                <Deslizador
                  label="Exponente n" icon="fa-up-down" colr="#facc15" valor={n >= 0 ? `+${n}` : `${n}`} min={N_MIN} max={N_MAX} step={1} value={n}
                  onChange={(v) => { setPlaying(false); moverN(v); }} hintL={`${N_MIN} (pequeño)`} hintR={`+${N_MAX} (grande)`}
                />
              </Bloque>

              <Bloque titulo="El punto decimal se corre" icono="fa-ellipsis">
                <TiraDecimal texto={decimal} accent={accent} />
                <p style={{ margin: 0, color: T.text2 }}>
                  {n === 0 ? (
                    <>Con <strong style={{ color: T.text }}>n = 0</strong> el número es la mantisa tal cual.</>
                  ) : n > 0 ? (
                    <>El exponente <strong style={{ color: accent }}>+{n}</strong> corre el punto <strong style={{ color: T.text }}>{n} {n === 1 ? "lugar" : "lugares"} a la derecha</strong>: el número se hace grande.</>
                  ) : (
                    <>El exponente <strong style={{ color: accent }}>{n}</strong> corre el punto <strong style={{ color: T.text }}>{-n} {-n === 1 ? "lugar" : "lugares"} a la izquierda</strong>: el número se hace pequeño.</>
                  )}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  <Dato label="Notación científica" value={`${aStr}·10^${n}`} col={accent} />
                  <Dato label="Saltos ×10" value={`${Math.abs(n)}`} />
                </div>
              </Bloque>

              <Bloque titulo="Misma medida, otra unidad" icono="fa-right-left">
                <p style={{ margin: 0, color: T.text2 }}>Solo cambia el exponente.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                  {[
                    { u: "kilómetros", abbr: "km", nn: nKm },
                    { u: "metros", abbr: "m", nn: n },
                    { u: "milímetros", abbr: "mm", nn: nMm },
                  ].map((c) => (
                    <div key={c.abbr} style={{ borderRadius: 12, border: `1px solid ${c.abbr === "m" ? `${accent}66` : T.line}`, background: c.abbr === "m" ? `${accent}14` : T.inset, padding: "10px 12px", minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: T.text3, marginBottom: 4 }}>{c.u}</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: c.abbr === "m" ? accent : T.text }}>
                        <Sci a={aStr} n={c.nn} unidad={c.abbr} />
                      </div>
                    </div>
                  ))}
                </div>
              </Bloque>

              <Bloque titulo="Salta a un tamaño real" icono="fa-ruler-vertical">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 8 }}>
                  {REFERENCIAS.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => irA(r)}
                      style={{
                        cursor: "pointer", textAlign: "left", borderRadius: 11, border: `1px solid ${r.n === n && r.a === a ? accent : T.line}`,
                        background: r.n === n && r.a === a ? `${accent}28` : T.glass, color: "#fff", padding: "9px 11px",
                        display: "flex", alignItems: "center", gap: 10, minWidth: 0,
                      }}
                    >
                      <i className={`fa-solid ${r.icono}`} style={{ fontSize: 16, width: 20, textAlign: "center", color: accent }} aria-hidden />
                      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 800 }}>{r.nombre}</span>
                        <span style={{ fontSize: 14, color: T.text3, ...NUM }}>10<sup>{r.n}</sup> m</span>
                      </span>
                    </button>
                  ))}
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
              <Bloque titulo="La idea" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  La mantisa siempre va de <strong style={{ color: T.text }}>1 a casi 10</strong>. Si al multiplicar se pasa de 10, sube un escalón el exponente; ese es el truco para comparar tamaños enormes con números pequeños.
                </p>
                <p style={{ margin: 0, color: T.text2 }}>
                  La notación científica vuelve manejables los números <strong style={{ color: T.text }}>enormes</strong> y <strong style={{ color: T.text }}>diminutos</strong>: en lugar de contar ceros, lees el <strong style={{ color: accent }}>exponente</strong>. Del átomo al Sol hay solo <strong style={{ color: T.text }}>19 saltos de ×10</strong>.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={NOTACION_CIENTIFICA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}
