"use client";

/**
 * Laboratorio 3D — "Muestreo: cómo elegir una muestra representativa".
 * Práctica experimental anclada a PM-VI-P07-A2 (ejercicio «calcular tamaño de
 * muestra y diseñar un muestreo estratificado»; progresión 7 de la UAC PM-VI
 * "Pensamiento Matemático VI"). El marco teórico es la lectura A1, los hechos
 * salen del quiz A4 y el glosario del A5.
 *
 * Tres modos:
 *  (1) Técnicas probabilísticas — aleatorio simple, sistemático, estratificado
 *      (con el reparto del ejercicio A2) y por conglomerados, sobre los 800
 *      estudiantes de la escuela.
 *  (2) Sesgo de selección — encuesta voluntaria en redes y de conveniencia.
 *  (3) Error muestral — 300 muestras repetidas en un histograma: el tamaño
 *      angosta la distribución; el sesgo la desplaza.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { MUESTREO_ESTADISTICO_FICHA } from "./muestreo-estadistico-ficha";
import {
  type Modo,
  type Metodo,
  type Muestra,
  MODOS,
  MODOS_DEF,
  GRADOS,
  ESTUDIANTES,
  N_POBLACION,
  USAN_MUCHO,
  P_REAL,
  METODOS,
  METODOS_PROB,
  METODOS_SESGO,
  TODOS_METODOS,
  RESPONDE_SI_USA_MUCHO,
  RESPONDE_SI_NO,
  repartoProporcional,
  tomarMuestra,
  proporcionMuestra,
  margenError,
  TAMANOS_ERROR,
  TAMANOS_MUESTRA,
  REPETICIONES,
  resumir,
  SITUACIONES,
  PROBLEMA,
  DEFINICION,
  LECTURA_A1,
  PREGUNTAS,
  INSTRUCCIONES,
  IDEAS,
  GLOSARIO,
  HECHOS,
  DATOS,
  CONTEXTO,
  FUENTE,
  RETO_A2,
} from "./muestreo-estadistico-data";

const MuestreoScene = dynamic(() => import("./MuestreoEstadisticoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-people-group fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando la escuela en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-muestreo-estadistico-reto";
const pct = (x: number, dec = 1) => `${(x * 100).toFixed(dec)} %`;
const LOTE = 6;

/* ── Tarjeta de estrellas: ¿qué técnica es? ───────────────────────────── */
function TecnicaCard({
  accent,
  rgba,
  mejor,
  onResultado,
  playSfx,
}: {
  accent: string;
  rgba: string;
  mejor: number;
  onResultado: (estrellas: number) => void;
  playSfx?: (ok: boolean) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [intentos, setIntentos] = useState(0);
  const [elegida, setElegida] = useState<Metodo | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const s = SITUACIONES[idx]!;

  const elegir = (m: Metodo) => {
    if (resuelto !== null) return;
    const k = intentos + 1;
    setIntentos(k);
    setElegida(m);
    if (m === s.metodo) {
      const est = Math.max(1, 4 - k);
      setResuelto(est);
      playSfx?.(true);
      onResultado(est);
    } else {
      playSfx?.(false);
    }
  };
  const otra = () => {
    setIdx((i) => (i + 1) % SITUACIONES.length);
    setIntentos(0);
    setElegida(null);
    setResuelto(null);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿Qué técnica de muestreo es?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6, ...NUM }}>
        Situación {idx + 1} de {SITUACIONES.length}
      </div>
      <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, lineHeight: 1.5, marginBottom: 14 }}>{s.texto}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {TODOS_METODOS.map((m) => {
          const esta = elegida === m;
          const bien = esta && m === s.metodo;
          const mal = esta && m !== s.metodo;
          return (
            <button
              key={m}
              className="me-sit"
              onClick={() => elegir(m)}
              disabled={resuelto !== null}
              style={{
                cursor: resuelto !== null ? "default" : "pointer",
                padding: "10px 13px",
                borderRadius: 10,
                border: `1px solid ${bien ? OK : mal ? "#FF8A3C" : T.lineStrong}`,
                background: bien ? "rgba(52,211,153,0.16)" : mal ? "rgba(255,138,60,0.12)" : "transparent",
                color: "#fff",
                fontSize: 12.5,
                fontWeight: 800,
              }}
            >
              <i className={`fa-solid ${METODOS[m].icono}`} style={{ marginRight: 7, color: accent }} />
              {METODOS[m].etq}
            </button>
          );
        })}
      </div>
      {elegida && resuelto === null && (
        <div style={{ marginTop: 12, fontSize: 12, color: "#FF8A3C", lineHeight: 1.5 }}>
          <i className="fa-solid fa-rotate-left" style={{ marginRight: 7 }} />
          No es «{METODOS[elegida].etq}». Pregúntate: ¿se sortea a personas, a grupos completos o a nadie? Intento {intentos}.
        </div>
      )}
      {resuelto !== null && (
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6, flexWrap: "wrap" }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 12.5, fontWeight: 900, color: OK, marginLeft: 4 }}>{intentos === 1 ? "Al primer intento" : `En ${intentos} intentos`}</span>
          </div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{s.porque}</div>
          <button onClick={otra} style={{ marginTop: 10, cursor: "pointer", padding: "10px 16px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 12.5, fontWeight: 900 }}>
            <i className="fa-solid fa-forward" style={{ marginRight: 8 }} />
            Siguiente situación
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabMuestreoEstadistico({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("tecnicas");
  const [metodoProb, setMetodoProb] = useState<Metodo>("estratificado");
  const [metodoSesgo, setMetodoSesgo] = useState<Metodo>("voluntaria");
  const [n, setN] = useState(80);
  const [muestra, setMuestra] = useState<Muestra | null>(null);

  // ── Error muestral
  const [metodoError, setMetodoError] = useState<Metodo>("simple");
  const [nError, setNError] = useState(TAMANOS_ERROR[1]!);
  const [estimaciones, setEstimaciones] = useState<number[]>([]);
  const [corriendo, setCorriendo] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  // Logros pegajosos
  const [tecnicasProbadas, setTecnicasProbadas] = useState<Set<Metodo>>(() => new Set());
  const [estratificado80, setEstratificado80] = useState(false);
  const [completados, setCompletados] = useState<Set<string>>(() => new Set());
  const [identifico, setIdentifico] = useState(false);

  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setIdentifico(true);
      guardaEstrellas(est);
    },
    [guardaEstrellas],
  );

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

  const blip = () => {
    if (sonido) audioRef.current?.blip();
  };

  /* ── Derivados ─────────────────────────────────────────────────────── */
  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;
  const metodoPatio = modo === "sesgo" ? metodoSesgo : metodoProb;

  const seleccion = useMemo(() => {
    const s = new Uint8Array(N_POBLACION);
    if (muestra && modo !== "error") for (const i of muestra.indices) s[i] = 1;
    return s;
  }, [muestra, modo]);
  const porGrado = useMemo(() => GRADOS.map((_, gi) => (muestra && modo !== "error" ? muestra.indices.filter((i) => ESTUDIANTES[i]!.grado === gi).length : 0)), [muestra, modo]);
  const pMuestra = muestra ? proporcionMuestra(muestra.indices) : null;
  const nReal = muestra?.indices.length ?? 0;

  const completo = estimaciones.length >= REPETICIONES;
  const corriendoReal = corriendo && !completo;
  const resumen = useMemo(() => resumir(estimaciones), [estimaciones]);
  const meFormula = margenError(P_REAL, nError);

  /* ── Repeticiones del modo «error» ─────────────────────────────────── */
  useEffect(() => {
    if (modo !== "error" || !corriendoReal) return;
    const id = window.setInterval(() => {
      const lote = Array.from({ length: LOTE }, () => proporcionMuestra(tomarMuestra(metodoError, nError).indices));
      setEstimaciones((prev) => (prev.length >= REPETICIONES ? prev : [...prev, ...lote].slice(0, REPETICIONES)));
    }, 90);
    return () => window.clearInterval(id);
  }, [modo, corriendoReal, metodoError, nError]);

  // Una corrida que llega a 300 se registra con su técnica y tamaño.
  const claveCorrida = `${metodoError}:${nError}`;
  const yaRegistrada = completados.has(claveCorrida);
  if (completo && !yaRegistrada) {
    setCompletados((prev) => new Set(prev).add(claveCorrida));
  }

  /* ── Acciones ──────────────────────────────────────────────────────── */
  const bump = () => setResetNonce((k) => k + 1);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setMuestra(null);
    setCorriendo(false);
    blip();
    bump();
  };

  const muestrear = (metodo: Metodo, tam: number) => {
    const nueva = tomarMuestra(metodo, tam);
    setMuestra(nueva);
    setTecnicasProbadas((s) => new Set(s).add(metodo));
    if (metodo === "estratificado" && tam === 80) setEstratificado80(true);
    blip();
  };

  const elegirMetodo = (m: Metodo) => {
    if (modo === "sesgo") setMetodoSesgo(m);
    else setMetodoProb(m);
    muestrear(m, n);
  };
  const elegirN = (tam: number) => {
    setN(tam);
    if (muestra) muestrear(metodoPatio, tam);
  };

  const iniciarRepeticiones = () => {
    setEstimaciones([]);
    setCorriendo(true);
    blip();
  };
  const elegirMetodoError = (m: Metodo) => {
    setMetodoError(m);
    setEstimaciones([]);
    setCorriendo(false);
    blip();
  };
  const elegirNError = (tam: number) => {
    setNError(tam);
    setEstimaciones([]);
    setCorriendo(false);
    blip();
  };

  const reiniciar = () => {
    if (modo === "error") {
      setEstimaciones([]);
      setCorriendo(false);
    } else setMuestra(null);
    bump();
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const tamanosProbCompletos = new Set([...completados].filter((c) => METODOS[c.split(":")[0] as Metodo].probabilistico).map((c) => c.split(":")[1]));
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Tomar una muestra con cada una de las cuatro técnicas probabilísticas", done: METODOS_PROB.every((m) => tecnicasProbadas.has(m)) },
    { t: "Tomar el estratificado del ejercicio A2 (n = 80)", done: estratificado80 },
    { t: "Tomar una muestra con cada técnica sesgada", done: METODOS_SESGO.every((m) => tecnicasProbadas.has(m)) },
    { t: "Completar 300 muestras probabilísticas con dos tamaños distintos", done: tamanosProbCompletos.size >= 2 },
    { t: "Completar 300 muestras de una técnica sesgada con n = 320", done: [...completados].some((c) => METODOS_SESGO.includes(c.split(":")[0] as Metodo) && c.endsWith(":320")) },
    { t: "Identificar una técnica y ganar estrellas", done: identifico },
    { t: "Resolver el reto evaluable (ejercicio A2)", done: ejercicioAprobado },
  ];

  /* ── Textos del visor ──────────────────────────────────────────────── */
  const pie: string =
    modo === "error"
      ? estimaciones.length === 0
        ? `Cada ficha será una muestra de ${nError} estudiantes con «${METODOS[metodoError].etq}». La línea dorada marca el valor real de la escuela: ${pct(P_REAL, 2)}.`
        : `${estimaciones.length} muestras · promedio ${pct(resumen.media)} · el 95 % central cae a ±${(resumen.medio95 * 100).toFixed(1)} puntos. ${Math.abs(resumen.sesgo) > 0.04 ? `Sesgo de ${resumen.sesgo > 0 ? "+" : ""}${(resumen.sesgo * 100).toFixed(1)} puntos: el histograma está fuera del valor real.` : "Centrado en el valor real: sin sesgo."}`
      : !muestra
        ? `${METODOS[metodoPatio].descripcion} Toma una muestra de ${n} estudiantes.`
        : `${nReal} estudiantes en la muestra: ${pct(pMuestra ?? 0)} usa redes más de 3 h al día. En toda la escuela es ${pct(P_REAL)} (${(((pMuestra ?? 0) - P_REAL) * 100).toFixed(1)} puntos de diferencia).`;

  const chipVivo = modo === "error" ? `${estimaciones.length}/${REPETICIONES} muestras · n = ${nError}` : muestra ? `p̂ = ${pct(pMuestra ?? 0)} · real ${pct(P_REAL)}` : `N = ${N_POBLACION} · real ${pct(P_REAL)}`;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {DEFINICION}
      </div>
    </div>
  );

  const sub = (txt: string, extra?: ReactNode) => (
    <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>
      {txt}
      {extra}
    </div>
  );

  const chip = (col: string, txt: ReactNode, forma: "cuadro" | "bola" = "cuadro") => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px", borderRadius: 999, background: "rgba(4,10,22,0.72)", border: `1px solid ${T.line}`, fontSize: 11, fontWeight: 800, color: "#e2e8f0", whiteSpace: "nowrap" }}>
      <span style={{ width: 9, height: 9, borderRadius: forma === "bola" ? "50%" : 3, background: col }} />
      {txt}
    </span>
  );

  const botonesMetodo = (lista: Metodo[], actual: Metodo, destino: "patio" | "error", col: string) => (
    <div className="me-opts">
      {lista.map((m) => (
        <button key={m} className="me-opt" data-on={m === actual} onClick={() => (destino === "error" ? elegirMetodoError(m) : elegirMetodo(m))} style={{ ["--mec" as string]: col, background: m === actual ? `${col}1f` : "transparent" }}>
          <i className={`fa-solid ${METODOS[m].icono}`} style={{ marginRight: 8, color: col }} />
          {METODOS[m].etq}
        </button>
      ))}
    </div>
  );

  /* ── Panel por modo ────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo !== "error") {
    const lista = modo === "sesgo" ? METODOS_SESGO : METODOS_PROB;
    const reparto = repartoProporcional(n);
    control = (
      <>
        {botonesMetodo(lista, metodoPatio, "patio", modoCol)}
        <div style={{ marginTop: 8, fontSize: 11.5, color: T.text3, lineHeight: 1.5 }}>{METODOS[metodoPatio].descripcion}</div>

        {sub("Tamaño de la muestra (n)")}
        <div className="me-opts">
          {TAMANOS_MUESTRA.map((t) => (
            <button key={t} className="me-opt" data-on={t === n} onClick={() => elegirN(t)} style={{ ["--mec" as string]: accent, background: t === n ? `rgba(${color.rgba},0.16)` : "transparent", minWidth: 50, ...NUM }}>
              {t}
            </button>
          ))}
        </div>
        <button className="me-toggle" onClick={() => muestrear(metodoPatio, n)} style={{ marginTop: 12, ["--mec" as string]: accent }}>
          <i className="fa-solid fa-hand-pointer" style={{ marginRight: 9, color: accent }} />
          {muestra ? "Tomar otra muestra" : "Tomar la muestra"}
        </button>

        {metodoPatio === "sistematico" && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 11, border: `1px solid ${modoCol}44`, background: `${modoCol}10`, fontFamily: "ui-monospace, monospace", fontSize: 12.5, color: "#eaf0fb", lineHeight: 1.7, ...NUM }}>
            k = N/n = {N_POBLACION}/{n} = {Number((N_POBLACION / n).toFixed(2))}
            {muestra?.inicio !== undefined && (
              <div>
                Inicio al azar: el n.º {muestra.inicio + 1} de la lista; después {muestra.indices.slice(1, 4).map((i) => i + 1).join(", ")}…
              </div>
            )}
          </div>
        )}

        {metodoPatio === "estratificado" && (
          <>
            {sub("Reparto proporcional por grado")}
            <div style={{ marginBottom: 8, fontFamily: "ui-monospace, monospace", fontSize: 12.5, color: "#fff", ...NUM }}>
              f = n/N = {n}/{N_POBLACION} = {Number((n / N_POBLACION).toFixed(3))}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 3, fontSize: 12.5, ...NUM }}>
                <thead>
                  <tr style={{ color: T.text3, fontSize: 10.5 }}>
                    <th style={{ textAlign: "left", padding: 4 }}>Grado</th>
                    <th style={{ padding: 4 }}>Estudiantes</th>
                    <th style={{ padding: 4 }}>× f</th>
                    <th style={{ padding: 4 }}>En la muestra</th>
                  </tr>
                </thead>
                <tbody>
                  {GRADOS.map((g, gi) => (
                    <tr key={g.nombre}>
                      <td style={{ padding: "6px 4px", color: g.color, fontWeight: 900 }}>{g.nombre}</td>
                      <td className="me-td">{g.tamano}</td>
                      <td className="me-td" style={{ color: T.text3 }}>{Number(((g.tamano * n) / N_POBLACION).toFixed(2))}</td>
                      <td className="me-td" style={{ color: "#fff", fontWeight: 900, background: `${g.color}22` }}>{reparto[gi]}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ padding: "6px 4px", color: T.text3, fontWeight: 900 }}>Total</td>
                    <td className="me-td" style={{ fontWeight: 900 }}>{N_POBLACION}</td>
                    <td className="me-td" />
                    <td className="me-td" style={{ color: "#fff", fontWeight: 900, outline: `2px solid ${accent}`, outlineOffset: -2 }}>{reparto.reduce((a, b) => a + b, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {n % 10 !== 0 || (N_POBLACION * 1) % n !== 0 ? (
              <div style={{ marginTop: 6, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>Cuando el producto no es entero se redondea dando el sobrante a los grados con mayor parte decimal, para que el total siga siendo n.</div>
            ) : null}
          </>
        )}

        {metodoPatio === "conglomerados" && muestra?.salones && (
          <div style={{ marginTop: 12, fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
            Salones sorteados: {muestra.salones.length}. Se encuesta a todos sus integrantes, así que la muestra queda de <strong style={{ color: "#fff" }}>{nReal}</strong> estudiantes{nReal === n ? ", justo los que se pidieron." : ` aunque se pidieron ${n}: no se puede partir un salón.`}
          </div>
        )}
        {metodoPatio === "voluntaria" && muestra?.respondieron !== undefined && (
          <div style={{ marginTop: 12, fontSize: 12, color: T.text2, lineHeight: 1.55, ...NUM }}>
            Respondieron {muestra.respondieron} de {N_POBLACION}: contesta el {Math.round(RESPONDE_SI_USA_MUCHO * 100)} % de quienes usan mucho las redes y solo el {Math.round(RESPONDE_SI_NO * 100)} % de los demás.
            {nReal < n ? ` No alcanzó para ${n}: la muestra quedó de ${nReal}.` : ""}
          </div>
        )}

        {muestra && (
          <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <Readout label="Muestra (p̂)" value={pct(pMuestra ?? 0)} col={accent} />
              <Readout label="Escuela (p)" value={pct(P_REAL)} col="#fbbf24" />
              <Readout label="Diferencia" value={`${(((pMuestra ?? 0) - P_REAL) * 100).toFixed(1)} pts`} size={17} />
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5, textAlign: "center" }}>
              {METODOS[metodoPatio].probabilistico
                ? `Margen de error al 95 %: ±${(margenError(pMuestra ?? 0, nReal) * 100).toFixed(1)} puntos.`
                : "Con un método no probabilístico el margen de error no tiene sentido: el problema no es el azar, es a quién se eligió."}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
              {GRADOS.map((g, gi) => (
                <span key={g.nombre} style={{ fontSize: 11, color: T.text2, padding: "3px 8px", borderRadius: 999, border: `1px solid ${g.color}55`, ...NUM }}>
                  {g.corto}: {nReal ? Math.round((porGrado[gi]! / nReal) * 100) : 0} % de la muestra · {Math.round((g.tamano / N_POBLACION) * 100)} % de la escuela
                </span>
              ))}
            </div>
          </div>
        )}
      </>
    );
  } else {
    control = (
      <>
        {sub("Técnica")}
        {botonesMetodo(TODOS_METODOS, metodoError, "error", modoCol)}
        {sub("Tamaño de cada muestra (n)")}
        <div className="me-opts">
          {TAMANOS_ERROR.map((t) => (
            <button key={t} className="me-opt" data-on={t === nError} onClick={() => elegirNError(t)} style={{ ["--mec" as string]: accent, background: t === nError ? `rgba(${color.rgba},0.16)` : "transparent", minWidth: 56, ...NUM }}>
              {t}
            </button>
          ))}
        </div>
        <button className="me-toggle" onClick={iniciarRepeticiones} disabled={corriendoReal} style={{ marginTop: 12, ["--mec" as string]: accent, opacity: corriendoReal ? 0.6 : 1 }}>
          <i className={`fa-solid ${corriendoReal ? "fa-spinner fa-spin" : "fa-forward-fast"}`} style={{ marginRight: 9, color: accent }} />
          {corriendoReal ? `Tomando muestras… ${estimaciones.length}/${REPETICIONES}` : `Tomar ${REPETICIONES} muestras de ${nError}`}
        </button>

        <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 12, border: `1px solid ${modoCol}55`, background: `${modoCol}12` }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Readout label="Promedio" value={estimaciones.length ? pct(resumen.media) : "—"} col={accent} size={17} />
            <Readout label="95 % central" value={estimaciones.length ? `±${(resumen.medio95 * 100).toFixed(1)}` : "—"} size={17} />
            <Readout label="Sesgo" value={estimaciones.length ? `${resumen.sesgo >= 0 ? "+" : ""}${(resumen.sesgo * 100).toFixed(1)}` : "—"} size={17} col={Math.abs(resumen.sesgo) > 0.04 ? "#f87171" : undefined} />
          </div>
          <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.6, fontFamily: "ui-monospace, monospace", textAlign: "center", ...NUM }}>
            Margen teórico = 1.96 · √(p(1 − p)/n) · √((N − n)/(N − 1)) = ±{(meFormula * 100).toFixed(1)} puntos
          </div>
          {estimaciones.length > 0 && (
            <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5, textAlign: "center", marginTop: 4, ...NUM }}>
              {Math.round(resumen.dentro5 * 100)} % de las muestras quedó a 5 puntos o menos del valor real.
            </div>
          )}
        </div>

        {completados.size > 0 && (
          <>
            {sub("Corridas completas")}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[...completados].map((c) => {
                const [m, t] = c.split(":");
                return (
                  <span key={c} style={{ fontSize: 11, color: T.text2, padding: "4px 9px", borderRadius: 999, border: `1px solid ${METODOS[m as Metodo].probabilistico ? `${OK}55` : "#f8717155"}`, ...NUM }}>
                    {METODOS[m as Metodo].etq} · n = {t}
                  </span>
                );
              })}
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes mePulse { 0%,100%{ box-shadow:0 0 0 0 var(--med); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .me-live-dot { animation: mePulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .me-live-dot { animation:none; } }
        .me-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .me-grid { grid-template-columns: 1fr; } }
        .me-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .me-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .me-icobtn:hover { background:rgba(255,255,255,0.12); }
        .me-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .me-tab { cursor:pointer; border:1px solid var(--mec); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .me-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .me-tab:hover { background:rgba(255,255,255,0.06); }
        .me-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .me-opt { cursor:pointer; border:1px solid var(--mec); border-radius:10px; padding:9px 12px; font-size:12px;
          font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .me-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.66); }
        .me-opt:hover { background:rgba(255,255,255,0.06); }
        .me-opt:focus-visible, .me-tab:focus-visible, .me-toggle:focus-visible, .me-icobtn:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        .me-toggle { width:100%; cursor:pointer; border:1px solid var(--mec); border-radius:11px; padding:11px 14px;
          background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .me-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .me-td { padding:6px; text-align:center; border-radius:6px; background:rgba(4,10,22,0.45); color:${T.text2}; font-weight:800; }
        @media (max-width: 1000px){ .me-bottom { grid-template-columns: 1fr !important; } }

        .me-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .me-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .me-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06121e 0%,#040a16 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .me-drawer[data-open="true"] { transform:translateX(0); }
        .me-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .me-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .me-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .me-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .me-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .me-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="me-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="me-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--mec" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="me-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 58vh, 660px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <MuestreoScene
                modo={modo}
                metodo={metodoPatio}
                seleccion={seleccion}
                salonesElegidos={modo !== "error" && muestra?.salones ? muestra.salones : []}
                porGrado={porGrado}
                estimaciones={estimaciones}
                n={nError}
                accent={accent}
                modoColor={modoCol}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="me-live-dot" style={{ ["--med" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {modo !== "error" ? (
                  <>
                    {chip("#fde047", "En la muestra · usa redes más de 3 h", "bola")}
                    {chip("#f1f5f9", "En la muestra · no", "bola")}
                  </>
                ) : (
                  <>
                    {chip("#fbbf24", `Valor real ${pct(P_REAL, 2)}`)}
                    {chip(accent, "Margen de error teórico")}
                  </>
                )}
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="me-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="me-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="me-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>{pie}</div>
            </div>

            <button className="me-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                Controles — {def.etq}
              </Eyebrow>
              <span style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: "#7dd3fc", border: "1px solid #7dd3fc55", borderRadius: 6, padding: "3px 7px" }}>
                {def.fuente === "A2" ? "EJERCICIO A2" : "LECTURA A1"}
              </span>
            </div>
            {control}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-people-group" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Una muestra que represente</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
            <div style={{ marginTop: 10, fontSize: 12, color: T.text3, lineHeight: 1.5, ...NUM }}>
              La escuela: {N_POBLACION} estudiantes; {USAN_MUCHO} usan redes más de 3 h al día ({pct(P_REAL, 2)}).
            </div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-book-open" style={{ marginRight: 8, color: "#7dd3fc" }} />
              Lectura A1 — Muestreo estadístico
            </Eyebrow>
            <div style={{ display: "grid", gap: 9, marginBottom: 12 }}>
              {LECTURA_A1.map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA REFLEXIONAR</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS.map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  {q}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Cómo usar el laboratorio
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {INSTRUCCIONES.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Eyebrow>
                <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
                Objetivos de la sesión
              </Eyebrow>
              <span style={{ fontSize: 11, fontWeight: 800, color: objetivos.every((o) => o.done) ? OK : T.text3 }}>
                {objetivos.filter((o) => o.done).length}/{objetivos.length}
              </span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {objetivos.map((o, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ marginTop: 2, fontSize: 13, color: o.done ? OK : "rgba(255,255,255,0.22)" }} />
                  <span style={{ fontSize: 12, color: o.done ? "#fff" : T.text2, lineHeight: 1.4 }}>{o.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="me-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />
            Datos clave
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", overflowWrap: "anywhere", ...NUM }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-house-user" style={{ marginRight: 8, color: accent }} />
              Cómo muestrea el INEGI
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{CONTEXTO}</div>
          </div>

          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
              ¿Sabías que? (quiz A4)
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {HECHOS.map((h, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario (A5)
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                    <i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} />
                    {gi.ejemplo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            Ideas clave
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
            {IDEAS.map((x, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La lectura A1, las preguntas de reflexión, los hechos del quiz A4, el glosario A5 y el ejercicio A2 son <strong>verbatim</strong> del material de la
          plataforma. Los 800 estudiantes y sus cuatro grados son los del ejercicio A2; los salones, quién usa redes más de 3 horas y la probabilidad de responder la
          encuesta voluntaria son <strong>datos ilustrativos</strong> del laboratorio, fijados con semilla. Las muestras usan el generador aleatorio del navegador. El
          margen de error teórico incluye la corrección por población finita. Fuente: {FUENTE}
        </span>
      </div>

      <TecnicaCard
        accent={accent}
        rgba={color.rgba}
        mejor={mejorEstrellas}
        onResultado={registraEstrellas}
        playSfx={(ok) => {
          if (!sonido) return;
          if (ok) audioRef.current?.correcto();
          else audioRef.current?.incorrecto();
        }}
      />

      <RetoNumericoCard
        reto={RETO_A2}
        accent={accent}
        aprobado={ejercicioAprobado}
        onAprobado={() => setEjercicioAprobado(true)}
        playSfx={(ok) => {
          if (!sonido) return;
          if (ok) audioRef.current?.correcto();
          else audioRef.current?.incorrecto();
        }}
      />

      <div className="me-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="me-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="me-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="me-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="me-drawer-body">
          <FichaTeorica data={MUESTREO_ESTADISTICO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
