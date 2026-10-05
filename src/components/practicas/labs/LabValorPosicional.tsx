"use client";

/**
 * Laboratorio 3D — Valor posicional.
 * Práctica experimental para PM-I-P08-A2.
 *
 * Experimento central: el CANJE. El estudiante suma de uno en uno y ve que al
 * juntar 10 cubitos se cambian por 1 barra (10 barras por 1 placa, 10 placas
 * por 1 cubo): cada posición vale 10 veces la de su derecha. Con bloques
 * base-10 también ve que el VALOR de una cifra = cifra × valor del lugar y que
 * el CERO es un marcador de posición.
 * Pensamiento Matemático I.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { FichaTeorica } from "./_ficha";
import { VALOR_POSICIONAL_FICHA } from "./valor-posicional-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./valor-posicional-data";
import { LabSfx } from "./lab-audio";
import {
  LUGARES,
  MAX_DIGITO,
  NUM_DEFAULT,
  numeroDe,
  digitosDe,
  tieneCeroIntermedio,
  type Digitos,
  type Lugar,
} from "./valor-data";

const ValorPosicionalScene = dynamic(() => import("./ValorPosicionalScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-cubes-stacked fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-valor-posicional-reto";

const fmt = (n: number) => n.toLocaleString("es-MX");

export function LabValorPosicional({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [digitos, setDigitos] = useState<Digitos>(NUM_DEFAULT);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);

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
  const [movio, setMovio] = useState(false);
  const [canje, setCanje] = useState(false);
  const [vioMillar, setVioMillar] = useState(false);
  const [vioCero, setVioCero] = useState(false);
  const [vioMax, setVioMax] = useState(false);

  const aplicar = (next: Digitos) => {
    setDigitos(next);
    setMovio(true);
    if (next.millares >= 1) setVioMillar(true);
    if (tieneCeroIntermedio(next)) setVioCero(true);
    if (next.millares === 9 && next.centenas === 9 && next.decenas === 9 && next.unidades === 9) setVioMax(true);
  };

  /** Suma o resta UNA pieza del lugar; al pasar de 9 (o bajar de 0) hay canje con el lugar vecino. */
  const paso = (l: Lugar, dir: 1 | -1) => {
    const actual = numeroDe(digitos);
    const nuevo = actual + dir * l.valor;
    if (nuevo < 0 || nuevo > 9999) return;
    const cifra = digitos[l.key];
    const vecino = LUGARES[LUGARES.indexOf(l) - 1];
    if (dir === 1 && cifra >= MAX_DIGITO && vecino) {
      setCanje(true);
      setAviso(`¡Canje! 10 ${l.nombre.toLowerCase()} se cambian por 1 de ${vecino.nombre.toLowerCase()}.`);
    } else if (dir === -1 && cifra <= 0 && vecino) {
      setCanje(true);
      setAviso(`¡Canje! 1 de ${vecino.nombre.toLowerCase()} se deshace en 10 ${l.nombre.toLowerCase()}.`);
    } else {
      setAviso(null);
    }
    if (sonido) audioRef.current?.blip();
    aplicar(digitosDe(nuevo));
  };
  const setNumero = (n: number) => { setAviso(null); aplicar(digitosDe(n)); };
  const reset = () => { setDigitos(NUM_DEFAULT); setAviso(null); setResetNonce((k) => k + 1); };

  const numero = useMemo(() => numeroDe(digitos), [digitos]);

  const objetivos = [
    { txt: "Suma 1 a las unidades hasta pasar de 9: 10 cubitos se cambian por 1 barra", done: canje },
    { txt: "Cambia alguna posición", done: movio },
    { txt: "Forma un número de millares (≥ 1000)", done: vioMillar },
    { txt: "Usa el 0 como marcador (un 0 en medio)", done: vioCero },
    { txt: "Forma el número mayor: 9999", done: vioMax },
    { txt: "Resuelve el reto de valor posicional", done: ejercicioAprobado },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-cubes" />
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: T.text, ...NUM }}>{fmt(numero)}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar los bloques 3D, pero la idea sigue: cada posición vale 10 veces la de su derecha.
      </div>
    </div>
  );

  const uni = digitos.unidades;

  const lecturaCorta = aviso ? (
    <>{aviso}</>
  ) : (
    <>
      {LUGARES.map((l, i) => (
        <span key={l.key}>
          {i > 0 && " + "}
          {fmt(digitos[l.key] * l.valor)}
        </span>
      ))}{" "}
      = <strong>{fmt(numero)}</strong>
    </>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <SceneBoundary fallback={sceneFallback}>
          <ValorPosicionalScene digitos={digitos} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
        </SceneBoundary>
      }
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reset} />
        </>
      }
      leyenda={
        <>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text2 }}>Cubitos para canjear</div>
          <div style={{ display: "flex", gap: 3 }} aria-label={`${uni} de 10 cubitos`}>
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} style={{ width: 14, height: 18, borderRadius: 3, background: i < uni ? LUGARES[3]!.color : "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)" }} />
            ))}
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: uni >= 9 ? "#fde68a" : T.text }}>
            {uni >= 9 ? "Uno más y se canjean por 1 barra" : `${uni} de 10: faltan ${10 - uni}`}
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
              <Bloque titulo="Una pieza a la vez" icono="fa-cubes-stacked">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 10 }}>
                  {LUGARES.map((l) => {
                    const cifra = digitos[l.key];
                    const btn = { cursor: "pointer", width: 44, height: 44, borderRadius: 10, border: `1px solid ${T.line}`, background: T.inset, color: "#fff", fontSize: 16 } as const;
                    return (
                      <div key={l.key} style={{ borderRadius: 14, border: `1px solid ${cifra > 0 ? `${l.color}66` : T.line}`, background: cifra > 0 ? `${l.color}14` : T.inset, padding: "10px 10px 12px", textAlign: "center", minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: l.color }}>
                          <i className={`fa-solid ${l.icono}`} style={{ marginRight: 6 }} aria-hidden />
                          {l.nombre}
                        </div>
                        <div style={{ margin: "6px 0 2px", fontSize: 40, fontWeight: 900, lineHeight: 1, color: cifra > 0 ? l.color : T.text3, ...NUM }}>{cifra}</div>
                        <div style={{ fontSize: 14, color: T.text2, ...NUM }}>×{fmt(l.valor)} = {fmt(cifra * l.valor)}</div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
                          <button type="button" style={btn} onClick={() => paso(l, -1)} disabled={numero - l.valor < 0} aria-label={`Quitar ${l.singular}`}>
                            <i className="fa-solid fa-minus" />
                          </button>
                          <button type="button" style={btn} onClick={() => paso(l, 1)} disabled={numero + l.valor > 9999} aria-label={`Agregar ${l.singular}`}>
                            <i className="fa-solid fa-plus" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Deslizador label="O desliza el número completo" icon="fa-hashtag" colr={accent} valor={fmt(numero)} min={0} max={9999} step={1} value={numero} onChange={setNumero} hintL="0" hintR="9 999" />
              </Bloque>

              <Bloque titulo="El valor de cada cifra" icono="fa-equals">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {LUGARES.map((l) => (
                    <Dato key={l.key} label={l.nombre} value={fmt(digitos[l.key] * l.valor)} col={l.color} />
                  ))}
                  <Dato label="Número" value={fmt(numero)} col={accent} />
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  {tieneCeroIntermedio(digitos) ? (
                    <>Hay un <strong style={{ color: T.text }}>cero</strong> en medio: no aporta valor, pero <strong style={{ color: T.text }}>guarda el lugar</strong> para que las demás cifras valgan lo que deben.</>
                  ) : (
                    <>La misma cifra vale distinto según su lugar: un <strong style={{ color: T.text }}>5</strong> en las decenas vale <strong style={{ color: T.text, ...NUM }}>50</strong>, pero en los millares vale <strong style={{ color: T.text, ...NUM }}>5 000</strong>.</>
                  )}
                </p>
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
              <Bloque titulo="Cada posición vale 10 veces la anterior" icono="fa-layer-group">
                <div style={{ display: "grid", gap: 8 }}>
                  {LUGARES.map((l, i) => (
                    <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 12, border: `1px solid ${l.color}55`, background: `${l.color}12`, padding: "10px 12px" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#04121f", background: l.color, flexShrink: 0 }}>
                        <i className={`fa-solid ${l.icono}`} aria-hidden />
                      </div>
                      <div style={{ flex: 1, lineHeight: 1.3, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{l.nombre}</div>
                        <div style={{ fontSize: 14, color: T.text2 }}>
                          {i < LUGARES.length - 1 ? `= 10 × ${LUGARES[i + 1]?.singular ?? ""}` : "el bloque base"} · vale {fmt(l.valor)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ margin: 0, color: T.text2 }}>
                  Diez <strong style={{ color: T.text }}>cubitos</strong> forman una <strong style={{ color: T.text }}>barra</strong>; diez barras, una <strong style={{ color: T.text }}>placa</strong>; diez placas, un <strong style={{ color: T.text }}>cubo</strong>. Ese “diez a la vez” es la base del sistema decimal.
                </p>
              </Bloque>
              <Bloque titulo="Por qué importa" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  El valor posicional hace poderoso al sistema decimal: con solo <strong style={{ color: T.text }}>diez símbolos</strong> (0–9) y la <strong style={{ color: accent }}>posición</strong>, escribes cualquier número, por grande que sea.
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={VALOR_POSICIONAL_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}
