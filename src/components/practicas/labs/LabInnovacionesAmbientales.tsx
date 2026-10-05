"use client";

/**
 * Laboratorio 3D — "Innovaciones tecnológicas para el ambiente".
 * Progresión 8 de CNEYT-III: «Construye explicaciones sobre innovaciones
 * tecnológicas que utilizan el conocimiento de los subsistemas terrestres para
 * reducir el deterioro ambiental.»
 *
 * Tres modos, cada uno con su escena y su modelo:
 *  (1) Cosecha de lluvia — azotea, cisterna y el régimen de lluvias de cuatro
 *      ciudades: V = A · P · Ce y balance mensual de la cisterna.
 *  (2) Humedal artificial — personas, área y temperatura; la DBO₅ de salida
 *      con el modelo de primer orden de Reed contra la NOM-003.
 *  (3) Restaurar el manglar — especie por zona de inundación, ancho y años;
 *      la ola de tormenta que llega al pueblo y el carbono capturado.
 *
 * Evaluables: estrellas «¿Qué innovación lo resuelve?», quiz (A9 + A8), reto
 * de cálculo de cosecha de lluvia y el texto A6 (fill_blanks verbatim).
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import { RetoQuizCard } from "./_reto-quiz";
import { RetoNumericoCard } from "./_reto-numerico";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { INNOVACIONES_AMBIENTALES_FICHA } from "./innovaciones-ambientales-ficha";
import type { VistaInnovaciones } from "./InnovacionesAmbientalesScene";
import {
  type Modo,
  type CiudadId,
  type TechoId,
  type Medicion,
  type Plantacion,
  type ZonaId,
  type EspecieId,
  MODOS,
  MODOS_DEF,
  SUBSISTEMA_DEF,
  MESES,
  MESES_CORTOS,
  CIUDADES,
  TECHOS,
  AREA_MIN,
  AREA_MAX,
  AREA_PASO,
  CISTERNAS,
  PERSONAS_MIN,
  PERSONAS_MAX,
  USO_NO_POTABLE,
  lluviaAnual,
  balanceAnual,
  PROGRAMA_CDMX,
  HUM_PERSONAS_MIN,
  HUM_PERSONAS_MAX,
  HUM_AREA_MIN,
  HUM_AREA_MAX,
  HUM_T_MIN,
  HUM_T_MAX,
  CLIMAS,
  DBO_ENTRADA,
  AGUA_POR_PERSONA,
  POROSIDAD,
  PROFUNDIDAD,
  K20,
  THETA,
  kT,
  caudal,
  tiempoResidencia,
  dboSalida,
  areaNecesaria,
  calidad,
  CALIDAD_DEF,
  ZONAS,
  ESPECIES,
  PLANTACION_VACIA,
  supervivencia,
  zonacionCorrecta,
  aportaManglar,
  ANCHO_MAX,
  ANCHO_PASO,
  ANIOS_MAX,
  LARGO_COSTA,
  OLA_INICIAL,
  CAPTURA_HA,
  CO2_AUTO,
  olaEnPueblo,
  hectareas,
  co2Acumulado,
  INNOVACIONES,
  PROBLEMAS,
  rondaProblemas,
  estrellasPorErrores,
  mulberry32,
  VIDEO_A8,
  REFLEXION_A3,
  HECHOS,
  GLOSARIO,
  ACTIVIDAD_A5,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  QUIZ_A9,
  HUECOS_A6,
  RETO_LLUVIA,
  num,
} from "./innovaciones-ambientales-data";

const InnovacionesScene = dynamic(() => import("./InnovacionesAmbientalesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-earth-americas fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Cargando el paisaje en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-innovaciones-ambientales-reto";
const WARN = "#FF8A3C";
const T_MES = 1000;
const T_MUESTRA = 1300;
const T_OLA = 4600;
const RONDA_INICIAL = rondaProblemas(mulberry32(8));

/* ── Tarjeta de estrellas: ¿qué innovación lo resuelve? ─────────────────── */
function InnovacionCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [acierto, setAcierto] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = PROBLEMAS[ronda[pos] ?? 0]!;

  const responder = (id: string) => {
    if (resuelto !== null) return;
    const ok = id === actual.solucion;
    const sol = INNOVACIONES.find((i) => i.id === actual.solucion)!;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAcierto(null);
      setAviso(`${INNOVACIONES.find((i) => i.id === id)!.etq} no ataca la causa de este problema. Piensa qué subsistema está involucrado.`);
      return;
    }
    setAviso(null);
    setAcierto(`${sol.etq}: ${sol.usa}.`);
    if (pos + 1 >= ronda.length) {
      const est = estrellasPorErrores(errores);
      setResuelto(est);
      onResultado(est);
    } else setPos((p) => p + 1);
  };
  const otra = () => {
    setRonda(rondaProblemas(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setAcierto(null);
    setResuelto(null);
  };

  return (
    <div style={{ ...card, padding: "16px", marginTop: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          Diagnóstico → acción: ¿qué innovación lo resuelve?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 14, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 14, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
            Problema {pos + 1} de {ronda.length} · elige la innovación que ataca su causa
          </div>
          <div className="ia-problema" style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>
            «{actual.texto}»
          </div>
          <div className="ia-opts">
            {INNOVACIONES.map((inv) => (
              <button key={inv.id} className="ia-opt ia-inv" data-on="true" onClick={() => responder(inv.id)} style={{ ["--iac" as string]: SUBSISTEMA_DEF[inv.subsistema].color }}>
                <i className={`fa-solid ${inv.icono}`} style={{ marginRight: 8 }} />
                {inv.etq}
              </button>
            ))}
          </div>
          {aviso && <div style={{ marginTop: 10, fontSize: 14, color: WARN, lineHeight: 1.5 }}>{aviso} Inténtalo de nuevo.</div>}
          {acierto && !aviso && (
            <div style={{ marginTop: 10, fontSize: 14, color: OK, lineHeight: 1.5 }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: 7 }} />
              Bien: {acierto}
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: "12px 14px", borderRadius: 11, border: `1px solid ${OK}55`, background: "rgba(52,211,153,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[1, 2, 3].map((k) => (
              <i key={k} className="fa-solid fa-star" style={{ fontSize: 15, color: k <= resuelto ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
            ))}
            <span style={{ fontSize: 14, fontWeight: 900, color: OK, marginLeft: 4 }}>Ronda con {errores === 0 ? "cero errores" : `${errores} ${errores === 1 ? "error" : "errores"}`}</span>
          </span>
          <button onClick={otra} style={{ cursor: "pointer", padding: "9px 14px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 14, fontWeight: 900 }}>
            <i className="fa-solid fa-shuffle" style={{ marginRight: 8 }} />
            Otra ronda
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabInnovacionesAmbientales({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("lluvia");

  // ── Cosecha de lluvia
  const [ciudadId, setCiudadId] = useState<CiudadId>("cdmx");
  const [techoId, setTechoId] = useState<TechoId>("concreto");
  const [area, setArea] = useState(80);
  const [capIdx, setCapIdx] = useState(2);
  const [personas, setPersonas] = useState(4);
  const [mesVista, setMesVista] = useState(6);
  const [corriendo, setCorriendo] = useState(false);
  const [simuladas, setSimuladas] = useState<Set<CiudadId>>(() => new Set());
  const [ultimaSim, setUltimaSim] = useState<{ ciudad: CiudadId; cobertura: number; desborde: number } | null>(null);
  const [cobertura75, setCobertura75] = useState(false);

  // ── Humedal
  const [humPersonas, setHumPersonas] = useState(100);
  const [humArea, setHumArea] = useState(60);
  const [tempC, setTempC] = useState(17);
  const [muestraNonce, setMuestraNonce] = useState(0);
  const [midiendo, setMidiendo] = useState(false);
  const [mediciones, setMediciones] = useState<Medicion[]>([]);

  // ── Manglar
  const [plantacion, setPlantacion] = useState<Plantacion>(PLANTACION_VACIA);
  const [zonaSel, setZonaSel] = useState<ZonaId>("borde");
  const [ultima, setUltima] = useState<{ zona: ZonaId; especie: EspecieId } | null>(null);
  const [ancho, setAncho] = useState(100);
  const [anios, setAnios] = useState(0);
  const [olaNonce, setOlaNonce] = useState(0);
  const [olaEnCurso, setOlaEnCurso] = useState(false);
  const [olaResultado, setOlaResultado] = useState<{ h: number; correcta: boolean } | null>(null);
  const [zonacionLograda, setZonacionLograda] = useState(false);
  const [olaMitad, setOlaMitad] = useState(false);
  const [carbono20, setCarbono20] = useState(false);

  // ── Evaluables
  const [clasifico, setClasifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
  const [retoAprobado, setRetoAprobado] = useState(false);
  const [textoOk, setTextoOk] = useState(false);

  // ── Comunes
  const [resetNonce, setResetNonce] = useState(0);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);
  const timers = useRef<number[]>([]);
  const { mejorEstrellas, registraEstrellas: guardaEstrellas } = useEstrellas(RETO_KEY);
  const registraEstrellas = useCallback(
    (est: number) => {
      setClasifico(true);
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
    const lista = timers.current;
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
      lista.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const despues = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const blip = () => {
    if (sonido) audioRef.current?.blip();
  };
  const sfx = (ok: boolean) => {
    if (!sonido) return;
    if (ok) audioRef.current?.correcto();
    else audioRef.current?.incorrecto();
  };

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;

  /* ── Cosecha de lluvia ─────────────────────────────────────────────── */
  const ciudad = CIUDADES.find((c) => c.id === ciudadId)!;
  const techo = TECHOS.find((t) => t.id === techoId)!;
  const capacidad = CISTERNAS[capIdx]!;
  const bal = balanceAnual(ciudad, area, techo.ce, capacidad, personas);
  const mesB = bal.meses[mesVista]!;

  const simular = () => {
    if (corriendo) return;
    setCorriendo(true);
    setMesVista(0);
    blip();
    const c = ciudadId;
    const cob = bal.cobertura;
    const desb = bal.desborde;
    for (let i = 1; i < 12; i++) despues(i * T_MES, () => setMesVista(i));
    despues(12 * T_MES, () => {
      setCorriendo(false);
      setMesVista(11);
      setSimuladas((s) => new Set(s).add(c));
      setUltimaSim({ ciudad: c, cobertura: cob, desborde: desb });
      if (c === "cdmx" && cob >= 0.75) {
        setCobertura75(true);
        sfx(true);
      }
    });
  };
  const comparoRegimenes = simuladas.has("tijuana") && (simuladas.has("cdmx") || simuladas.has("merida") || simuladas.has("monterrey"));

  /* ── Humedal ───────────────────────────────────────────────────────── */
  const tRes = tiempoResidencia(humArea, humPersonas);
  const salida = dboSalida(humArea, humPersonas, tempC);
  const cal = calidad(salida);
  const remocion = 1 - salida / DBO_ENTRADA;
  const aNec20 = areaNecesaria(humPersonas, tempC, 20);
  const cumpleDirecto = mediciones.some((m) => calidad(m.dbo) === "directo");
  const comparoFrio = mediciones.some((a) => a.t <= 12 && mediciones.some((b) => b.t >= 24 && b.area === a.area && b.personas === a.personas));

  const medir = () => {
    if (midiendo) return;
    setMidiendo(true);
    setMuestraNonce((n) => n + 1);
    blip();
    const m: Medicion = { personas: humPersonas, area: humArea, t: tempC, dbo: salida };
    despues(T_MUESTRA, () => {
      setMidiendo(false);
      setMediciones((xs) => [m, ...xs].slice(0, 6));
      sfx(calidad(m.dbo) !== "no");
    });
  };

  /* ── Manglar ───────────────────────────────────────────────────────── */
  const hPueblo = olaEnPueblo(plantacion, ancho, anios);
  const co2 = co2Acumulado(plantacion, ancho, anios);
  const zonasPlantadas = ZONAS.filter((z) => plantacion[z.id] !== null).length;

  const plantar = (z: ZonaId, e: EspecieId) => {
    const nueva = { ...plantacion, [z]: e };
    setPlantacion(nueva);
    setUltima({ zona: z, especie: e });
    const bien = ESPECIES.find((s) => s.id === e)!.zona === z;
    sfx(bien);
    if (zonacionCorrecta(nueva)) setZonacionLograda(true);
    const sig = ZONAS.find((x) => nueva[x.id] === null);
    if (sig) setZonaSel(sig.id);
    if (anios === ANIOS_MAX && ancho > 0 && ZONAS.some((x) => aportaManglar(nueva[x.id]))) setCarbono20(true);
  };
  const cambiarAnios = (v: number) => {
    setAnios(v);
    if (v === ANIOS_MAX && ancho > 0 && ZONAS.some((x) => aportaManglar(plantacion[x.id]))) setCarbono20(true);
  };
  const lanzarOla = () => {
    if (olaEnCurso) return;
    setOlaEnCurso(true);
    setOlaResultado(null);
    setOlaNonce((n) => n + 1);
    blip();
    const h = hPueblo;
    const correcta = zonacionCorrecta(plantacion);
    despues(T_OLA, () => {
      setOlaEnCurso(false);
      setOlaResultado({ h, correcta });
      const ok = h <= OLA_INICIAL / 2;
      if (ok) setOlaMitad(true);
      sfx(ok);
    });
  };

  const cambiarModo = (m: Modo) => {
    if (corriendo || olaEnCurso || midiendo) return;
    setModo(m);
    blip();
  };
  const reiniciar = () => {
    if (corriendo || olaEnCurso || midiendo) return;
    if (modo === "lluvia") {
      setCiudadId("cdmx");
      setTechoId("concreto");
      setArea(80);
      setCapIdx(2);
      setPersonas(4);
      setMesVista(6);
    }
    if (modo === "humedal") {
      setHumPersonas(100);
      setHumArea(60);
      setTempC(17);
      setMuestraNonce(0);
    }
    if (modo === "manglar") {
      setPlantacion(PLANTACION_VACIA);
      setZonaSel("borde");
      setUltima(null);
      setAncho(100);
      setAnios(0);
      setOlaNonce(0);
      setOlaResultado(null);
    }
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { txt: string; done: boolean }[] = [
    { txt: "Diseñar para la Ciudad de México una cosecha de lluvia que cubra al menos 75 % del uso no potable", done: cobertura75 },
    { txt: "Simular un año en Tijuana (lluvia de invierno) y en una ciudad con lluvias de verano", done: comparoRegimenes },
    { txt: "Lograr en el humedal agua apta para reúso con contacto directo (DBO₅ ≤ 20 mg/L)", done: cumpleDirecto },
    { txt: "Medir el mismo humedal con agua fría (≤ 12 °C) y cálida (≥ 24 °C)", done: comparoFrio },
    { txt: "Plantar cada especie nativa de mangle en su zona de inundación", done: zonacionLograda },
    { txt: "Que la ola de tormenta llegue al pueblo con la mitad de su altura o menos", done: olaMitad },
    { txt: "Seguir la restauración 20 años y estimar el CO₂ capturado", done: carbono20 },
    { txt: "Relacionar problemas con innovaciones y ganar estrellas", done: clasifico },
    { txt: "Aprobar el quiz de conceptos (A9 y A8)", done: quizAprobado },
    { txt: "Resolver el reto de cálculo de la cosecha de lluvia", done: retoAprobado },
    { txt: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  const vista: VistaInnovaciones = modo;
  let chipVivo = "";
  let pie = "";
  if (modo === "lluvia") {
    chipVivo = `${MESES[mesVista]} · ${mesB.mm} mm · cisterna ${num(Math.round(mesB.nivel / 10) * 10)} L`;
    pie = corriendo
      ? `${ciudad.etq}, ${MESES[mesVista]}: caen ${mesB.mm} mm y la azotea capta ${num(mesB.captado)} L; la familia usa ${num(mesB.usado)} de ${num(mesB.demanda)} L${mesB.desborde > 0 ? ` y se desbordan ${num(mesB.desborde)} L` : ""}.`
      : `${ciudad.regimen} Con esta azotea se captan ${num(bal.captado)} L al año y se cubre el ${num(bal.cobertura * 100)} % del uso no potable.`;
  } else if (modo === "humedal") {
    chipVivo = `${num(tRes, 1)} días dentro · DBO₅ ${num(salida, 1)} mg/L`;
    pie = `${CALIDAD_DEF[cal].etq}. ${CALIDAD_DEF[cal].explica} El agua pasa ${num(tRes, 1)} días entre la grava y las raíces y pierde el ${num(remocion * 100)} % de su materia orgánica.`;
  } else {
    chipVivo = `ola en el pueblo ${num(hPueblo, 2)} m · ${num(co2)} t CO₂e`;
    pie =
      zonasPlantadas < 3
        ? `Planta una especie en cada zona (${zonasPlantadas} de 3). El manglar funciona como barrera solo si cada especie crece donde tolera la inundación.`
        : `La ola de ${num(OLA_INICIAL, 1)} m llegaría al pueblo con ${num(hPueblo, 2)} m (−${num((1 - hPueblo / OLA_INICIAL) * 100)} %). ${anios < 10 ? "Un manglar joven todavía frena poco: deja pasar los años." : "Los troncos y raíces del bosque maduro disipan la energía del agua."}`;
  }

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los resultados siguen aquí. {pie}</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 14, fontWeight: 900, color: T.text3, margin: "18px 0 8px" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const dato = (etq: string, valor: string, col = "#fff") => <Dato label={etq} value={valor} col={col} />;
  const rango = (label: string, min: number, max: number, paso: number, valor: number, onChange: (v: number) => void, txt: string, icono: string, col: string, disabled = false) => (
    <div style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto", marginTop: 12 }}>
      <Deslizador label={label} icon={icono} colr={col} valor={txt} min={min} max={max} step={paso} value={valor} onChange={onChange} />
    </div>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "lluvia") {
    const aprovechado = bal.captado > 0 ? (bal.usado / bal.captado) * 100 : 0;
    control = (
      <>
        {sub("Ciudad (normal climatológica 1991–2020)")}
        <div className="ia-opts">
          {CIUDADES.map((c) => (
            <button key={c.id} className="ia-opt ia-ciudad" data-on={c.id === ciudadId} disabled={corriendo} onClick={() => { setCiudadId(c.id); blip(); }} style={{ ["--iac" as string]: modoCol, background: c.id === ciudadId ? `${modoCol}1f` : "transparent" }}>
              {c.etq} · {num(lluviaAnual(c))} mm
              {simuladas.has(c.id) && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        {sub("Material de la azotea (coeficiente de escurrimiento)")}
        <div className="ia-opts">
          {TECHOS.map((t) => (
            <button key={t.id} className="ia-opt ia-techo" data-on={t.id === techoId} disabled={corriendo} onClick={() => { setTechoId(t.id); blip(); }} style={{ ["--iac" as string]: accent, background: t.id === techoId ? `rgba(${color.rgba},0.16)` : "transparent" }}>
              {t.etq} · Ce = {t.ce}
            </button>
          ))}
        </div>
        {sub("Cisterna")}
        <div className="ia-opts">
          {CISTERNAS.map((c, i) => (
            <button key={c} className="ia-opt ia-cis" data-on={i === capIdx} disabled={corriendo} onClick={() => { setCapIdx(i); blip(); }} style={{ ["--iac" as string]: accent, background: i === capIdx ? `rgba(${color.rgba},0.16)` : "transparent" }}>
              {num(c)} L
            </button>
          ))}
        </div>
        {rango("Área de azotea", AREA_MIN, AREA_MAX, AREA_PASO, area, setArea, `${area} m²`, "fa-house", modoCol, corriendo)}
        {rango("Personas", PERSONAS_MIN, PERSONAS_MAX, 1, personas, setPersonas, `${personas} · ${personas * USO_NO_POTABLE} L/d`, "fa-people-roof", modoCol, corriendo)}
        <button className="ia-toggle" onClick={simular} disabled={corriendo} style={{ marginTop: 14, ["--iac" as string]: modoCol }}>
          <i className={`fa-solid ${corriendo ? "fa-spinner fa-spin" : "fa-play"}`} style={{ marginRight: 9, color: modoCol }} />
          {corriendo ? `Simulando ${MESES[mesVista]}…` : "Simular un año mes a mes"}
        </button>
        {sub("Mes a mes: lluvia (barra) y cisterna al cierre (línea)")}
        <div className="ia-meses">
          {bal.meses.map((m) => (
            <button key={m.mes} className="ia-mes" data-on={m.mes === mesVista} disabled={corriendo} onClick={() => setMesVista(m.mes)} title={`${MESES[m.mes]}: ${m.mm} mm, cisterna ${num(m.nivel)} L`} aria-label={`Ver ${MESES[m.mes]}`} style={{ ["--iac" as string]: modoCol }}>
              <span className="ia-mes-barra" style={{ height: `${Math.max(3, (m.mm / 190) * 100)}%`, background: m.desborde > 0 ? "#f87171" : modoCol }} />
              <span className="ia-mes-nivel" style={{ bottom: `${(m.nivel / capacidad) * 100}%` }} />
              <span className="ia-mes-letra">{MESES_CORTOS[m.mes]}</span>
            </button>
          ))}
        </div>
        <div className="ia-datos" style={{ marginTop: 12 }}>
          {dato("Captado al año", `${num(bal.captado)} L`)}
          {dato("Uso no potable", `${num(bal.demanda)} L`)}
          {dato("Cubierto", `${num(bal.cobertura * 100)} %`, bal.cobertura >= 0.75 ? OK : bal.cobertura >= 0.5 ? "#fbbf24" : WARN)}
          {dato("Desbordado", `${num(bal.desborde)} L`, bal.desborde > 0 ? WARN : "#fff")}
          {dato("Meses cubiertos", `${bal.mesesCubiertos} de 12`)}
          {dato("Aprovechado", `${num(aprovechado)} % de lo captado`)}
        </div>
        <div style={{ fontSize: 14, color: T.text2, marginTop: 10, ...NUM }}>
          V = A · P · Ce = {area} m² · {num(lluviaAnual(ciudad))} mm · {techo.ce} = <strong style={{ color: "#fff" }}>{num(bal.captado)} L al año</strong>
        </div>
        {nota(
          bal.desborde > bal.captado * 0.25
            ? `La cisterna se llena en la temporada de lluvias y derrama ${num(bal.desborde)} L: la azotea capta más de lo que puedes guardar. Una cisterna mayor guarda el agua del mes lluvioso para los meses secos.`
            : bal.cobertura < 0.5
              ? `Cubres solo el ${num(bal.cobertura * 100)} %: en ${ciudad.etq} llueven ${num(lluviaAnual(ciudad))} mm y ${bal.mesesCubiertos < 6 ? "la mayor parte del año la cisterna está vacía" : "falta agua en los meses secos"}. Prueba más área de captación, un techo con mayor Ce o una cisterna más grande.`
              : `Aprovechas casi toda el agua que captas. ${bal.cobertura >= 0.75 ? "El sistema cubre la mayor parte del uso no potable." : "Para cubrir más, necesitas captar más: más área o un techo con mayor coeficiente."}`,
          bal.desborde > bal.captado * 0.25 || bal.cobertura < 0.5 ? WARN : OK,
          "fa-droplet",
        )}
        {ultimaSim && !corriendo && nota(`Última simulación: ${CIUDADES.find((c) => c.id === ultimaSim.ciudad)!.etq}, ${num(ultimaSim.cobertura * 100)} % cubierto y ${num(ultimaSim.desborde)} L desbordados.`, T.text3, "fa-clock-rotate-left")}
        {ciudadId === "cdmx" && nota(PROGRAMA_CDMX, "#7dd3fc", "fa-landmark")}
        <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          Balance mensual simplificado. Uso no potable de {USO_NO_POTABLE} L por persona al día (sanitario y lavado de ropa, valor ilustrativo). El agua de lluvia necesita filtración y desinfección antes de beberse.
        </div>
      </>
    );
  } else if (modo === "humedal") {
    control = (
      <>
        {rango("Personas", HUM_PERSONAS_MIN, HUM_PERSONAS_MAX, 10, humPersonas, setHumPersonas, `${humPersonas}`, "fa-people-group", modoCol, midiendo)}
        {rango("Área del humedal", HUM_AREA_MIN, HUM_AREA_MAX, 10, humArea, setHumArea, `${humArea} m²`, "fa-vector-square", modoCol, midiendo)}
        {sub("Clima (temperatura del agua)")}
        <div className="ia-opts">
          {CLIMAS.map((c) => (
            <button key={c.id} className="ia-opt ia-clima" data-on={tempC === c.t} disabled={midiendo} onClick={() => { setTempC(c.t); blip(); }} style={{ ["--iac" as string]: accent, background: tempC === c.t ? `rgba(${color.rgba},0.16)` : "transparent" }}>
              {c.etq} · {c.t} °C
            </button>
          ))}
        </div>
        {rango("Temperatura", HUM_T_MIN, HUM_T_MAX, 1, tempC, setTempC, `${tempC} °C`, "fa-temperature-half", "#fb923c", midiendo)}
        <div className="ia-datos" style={{ marginTop: 12 }}>
          {dato("Caudal", `${num(caudal(humPersonas), 1)} m³/día`)}
          {dato("Tiempo dentro", `${num(tRes, 2)} días`)}
          {dato("K a esta temperatura", `${num(kT(tempC), 3)} d⁻¹`)}
          {dato("DBO₅ de salida", `${num(salida, 1)} mg/L`, CALIDAD_DEF[cal].color)}
          {dato("Remoción", `${num(remocion * 100)} %`)}
          {dato("Área por persona", `${num(humArea / humPersonas, 2)} m²`)}
        </div>
        <div style={{ fontSize: 14, color: T.text2, marginTop: 10, lineHeight: 1.6, ...NUM }}>
          t = n·A·d / Q = {POROSIDAD} · {humArea} m² · {PROFUNDIDAD} m / {num(caudal(humPersonas), 1)} m³/d = {num(tRes, 2)} d
          <br />C = C₀ · e^(−K·t) = {DBO_ENTRADA} · e^(−{num(kT(tempC), 3)} · {num(tRes, 2)}) = <strong style={{ color: "#fff" }}>{num(salida, 1)} mg/L</strong>
        </div>
        <button className="ia-toggle" onClick={medir} disabled={midiendo} style={{ marginTop: 12, ["--iac" as string]: modoCol }}>
          <i className={`fa-solid ${midiendo ? "fa-spinner fa-spin" : "fa-vial"}`} style={{ marginRight: 9, color: modoCol }} />
          {midiendo ? "Analizando la muestra…" : "Tomar una muestra a la salida"}
        </button>
        {mediciones.length > 0 && (
          <div className="ia-tabla" style={{ marginTop: 10 }}>
            <div className="ia-fila ia-cab">
              <span>Personas</span>
              <span>Área</span>
              <span>Agua</span>
              <span>DBO₅</span>
            </div>
            {mediciones.map((m, i) => (
              <div key={i} className="ia-fila">
                <span>{m.personas}</span>
                <span>{m.area} m²</span>
                <span>{m.t} °C</span>
                <span style={{ color: CALIDAD_DEF[calidad(m.dbo)].color, fontWeight: 900 }}>{num(m.dbo, 1)} mg/L</span>
              </div>
            ))}
          </div>
        )}
        {nota(
          cal === "no"
            ? `El agua sale demasiado rápido: con ${humPersonas} personas y ${tempC} °C harían falta unos ${num(Math.ceil(aNec20 / 10) * 10)} m² para bajar la DBO₅ a 20 mg/L. Más área = más días dentro = más tiempo para las bacterias.`
            : cal === "indirecto"
              ? `Casi: ya puede regar donde nadie toca el agua. Con unos ${num(Math.ceil(aNec20 / 10) * 10)} m² llegaría a 20 mg/L.`
              : `El lecho da ${num(tRes, 1)} días a las bacterias de la grava y las raíces: suficiente para reúso con contacto directo.`,
          CALIDAD_DEF[cal].color,
          "fa-bacteria",
        )}
        {tempC <= 12 && nota(`Con agua a ${tempC} °C las bacterias trabajan despacio: K baja de ${K20} a ${num(kT(tempC), 2)} d⁻¹. Por eso los humedales de clima frío necesitan más área.`, "#93c5fd", "fa-snowflake")}
        <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          Modelo de primer orden para DBO₅ en flujo subsuperficial (Reed, Crites y Middlebrooks, 1995): K₂₀ = {K20} d⁻¹, θ = {THETA}. Entrada: {DBO_ENTRADA} mg/L, efluente típico de fosa séptica, y {AGUA_POR_PERSONA} L por persona al día (valores típicos). Las guías de diseño agregan margen de área para eliminar nitrógeno y patógenos y evitar que la grava se tape.
        </div>
      </>
    );
  } else {
    const zona = ZONAS.find((z) => z.id === zonaSel)!;
    const especieZona = ultima ? ESPECIES.find((e) => e.id === ultima.especie) : undefined;
    const zonaUltima = ultima ? ZONAS.find((z) => z.id === ultima.zona)! : zona;
    control = (
      <>
        {sub("1 · Elige la zona")}
        <div className="ia-opts">
          {ZONAS.map((z) => {
            const e = ESPECIES.find((s) => s.id === plantacion[z.id]);
            const bien = e?.zona === z.id;
            return (
              <button key={z.id} className="ia-opt ia-zona" data-on={z.id === zonaSel} disabled={olaEnCurso} onClick={() => { setZonaSel(z.id); blip(); }} style={{ ["--iac" as string]: modoCol, background: z.id === zonaSel ? `${modoCol}1f` : "transparent" }}>
                {z.etq}
                {e && <i className={`fa-solid ${bien ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ marginLeft: 7, color: bien ? OK : WARN }} />}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 14, color: T.text3, marginTop: 6 }}>{zona.inundacion}.</div>
        {sub(`2 · Planta una especie en «${zona.etq.toLowerCase()}»`)}
        <div style={{ display: "grid", gap: 7 }}>
          {ESPECIES.map((e) => {
            const on = plantacion[zonaSel] === e.id;
            const col = on ? (e.zona === zonaSel ? OK : WARN) : e.nativa ? accent : "#f87171";
            return (
              <button key={e.id} className="ia-opt ia-especie" data-on={on} disabled={olaEnCurso} onClick={() => plantar(zonaSel, e.id)} style={{ ["--iac" as string]: col, background: on ? `${col}1f` : "transparent", textAlign: "left" }}>
                <i className={`fa-solid ${e.nativa ? "fa-seedling" : "fa-triangle-exclamation"}`} style={{ marginRight: 8 }} />
                {e.etq} <em style={{ fontWeight: 600, color: T.text3 }}>({e.cientifico})</em> · {e.nativa ? "nativa" : "exótica"}
              </button>
            );
          })}
        </div>
        {especieZona &&
          nota(
            <>
              <strong>
                {especieZona.etq} en «{zonaUltima.etq.toLowerCase()}».
              </strong>{" "}
              {especieZona.rasgo}{" "}
              {especieZona.zona === zonaUltima.id
                ? `Es su zona: sobrevive cerca del ${num(supervivencia(especieZona.id, zonaUltima.id) * 100)} % de lo plantado.`
                : especieZona.nativa
                  ? `No es su zona: aquí sobrevive solo el ${num(supervivencia(especieZona.id, zonaUltima.id) * 100)} %. Su lugar es «${ZONAS.find((z) => z.id === especieZona.zona)!.etq.toLowerCase()}».`
                  : "No es un mangle: no tolera la inundación salada, no frena el oleaje como un manglar y puede volverse invasora. Plantar cualquier especie no es restaurar."}
            </>,
            especieZona.zona === zonaUltima.id ? OK : WARN,
            especieZona.zona === zonaUltima.id ? "fa-circle-check" : "fa-circle-exclamation",
          )}
        {sub("3 · Tamaño y tiempo")}
        {rango("Ancho del cinturón", 0, ANCHO_MAX, ANCHO_PASO, ancho, (v) => { setAncho(v); if (v > 0 && anios === ANIOS_MAX && ZONAS.some((x) => aportaManglar(plantacion[x.id]))) setCarbono20(true); }, `${ancho} m`, "fa-ruler-horizontal", modoCol, olaEnCurso)}
        {rango("Años desde que se plantó", 0, ANIOS_MAX, 1, anios, cambiarAnios, `${anios} ${anios === 1 ? "año" : "años"}`, "fa-hourglass-half", modoCol, olaEnCurso)}
        <button className="ia-toggle" onClick={lanzarOla} disabled={olaEnCurso} style={{ marginTop: 14, ["--iac" as string]: "#38bdf8" }}>
          <i className={`fa-solid ${olaEnCurso ? "fa-spinner fa-spin" : "fa-house-flood-water"}`} style={{ marginRight: 9, color: "#38bdf8" }} />
          {olaEnCurso ? "La ola cruza la costa…" : `Lanzar una ola de tormenta de ${num(OLA_INICIAL, 1)} m`}
        </button>
        {olaResultado &&
          nota(
            olaResultado.h <= OLA_INICIAL / 2
              ? `La ola llegó al pueblo con ${num(olaResultado.h, 2)} m: el manglar le quitó el ${num((1 - olaResultado.h / OLA_INICIAL) * 100)} % de su altura.`
              : `La ola llegó con ${num(olaResultado.h, 2)} m (−${num((1 - olaResultado.h / OLA_INICIAL) * 100)} %). ${!olaResultado.correcta ? "Revisa la zonación: donde los árboles mueren no hay barrera." : ancho < 200 ? "El cinturón es angosto: hace falta más ancho de bosque." : "El manglar aún es joven: sus troncos y raíces todavía son delgados."}`,
            olaResultado.h <= OLA_INICIAL / 2 ? OK : WARN,
            "fa-house-flood-water",
          )}
        <div className="ia-datos" style={{ marginTop: 12 }}>
          {dato("Superficie", `${num(hectareas(ancho))} ha`)}
          {dato("Ola en el pueblo", `${num(hPueblo, 2)} m`, hPueblo <= OLA_INICIAL / 2 ? OK : "#fff")}
          {dato("CO₂e capturado", `${num(co2)} t`)}
          {dato("Equivale a", `${num(co2 / CO2_AUTO)} autos · año`)}
        </div>
        {anios === ANIOS_MAX && co2 > 0 && nota(`En 20 años este manglar capturó ${num(co2)} t de CO₂e, lo que emiten ${num(co2 / CO2_AUTO)} autos en un año. Además protege a los peces jóvenes y al pueblo: varios servicios ecosistémicos a la vez.`, OK, "fa-leaf")}
        <div style={{ marginTop: 10, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
          Tramo de {num(LARGO_COSTA)} m de costa. Un manglar maduro y denso reduce la ola a la mitad cada 100 m (dentro del rango medido de 13–66 % en 100 m) y captura {CAPTURA_HA} t CO₂e/ha al año (rango 6–8). La supervivencia por zona y el tiempo de maduración son ilustrativos.
        </div>
      </>
    );
  }

  const estiloCSS = `
        .ia-opts { display:flex; flex-wrap:wrap; gap:8px; }
        .ia-opt { cursor:pointer; border:1px solid var(--iac); border-radius:10px; padding:10px 12px; font-size:14px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .ia-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.78); }
        .ia-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .ia-opt:disabled { cursor:default; opacity:0.6; }
        .ia-toggle { width:100%; cursor:pointer; border:1px solid var(--iac); border-radius:11px; padding:12px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:14px; font-weight:900; text-align:left; transition:all .15s; }
        .ia-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .ia-toggle:disabled { cursor:default; opacity:0.75; }
        .ia-datos { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:8px; }
        .ia-meses { display:grid; grid-template-columns: repeat(12, minmax(0,1fr)); gap:3px; height:96px; }
        .ia-mes { cursor:pointer; position:relative; border:1px solid rgba(255,255,255,0.1); border-radius:7px; background:rgba(4,10,22,0.45); padding:0 0 22px; overflow:hidden; min-width:0; }
        .ia-mes[data-on="true"] { border-color:var(--iac); background:rgba(255,255,255,0.08); }
        .ia-mes:disabled { cursor:default; }
        .ia-mes-barra { position:absolute; left:18%; right:18%; bottom:22px; border-radius:3px 3px 0 0; opacity:0.85; max-height:calc(100% - 22px); }
        .ia-mes-nivel { position:absolute; left:2px; right:2px; height:2px; background:#fff; margin-bottom:22px; box-shadow:0 0 6px #fff; max-width:100%; }
        .ia-mes-letra { position:absolute; left:0; right:0; bottom:2px; font-size:14px; font-weight:900; color:rgba(255,255,255,0.8); text-align:center; }
        .ia-tabla { border:1px solid ${T.line}; border-radius:10px; overflow:hidden; }
        .ia-fila { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:6px; padding:6px 10px; font-size:14px; color:${T.text2}; border-top:1px solid ${T.line}; }
        .ia-fila.ia-cab { border-top:none; font-weight:900; color:${T.text3}; background:rgba(255,255,255,0.03); }
        .ia-sub-chip { display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:999px; font-size:14px; font-weight:800; border:1px solid var(--iac); color:#fff; background:rgba(4,10,22,0.4); }
        .ia-opt:focus-visible, .ia-toggle:focus-visible, .ia-mes:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
  `;

  const sceneEl = (
    <SceneBoundary fallback={sceneFallback}>
      <InnovacionesScene
        vista={vista}
        modoColor={modoCol}
        resetNonce={resetNonce}
        ciudadId={ciudadId}
        techoId={techoId}
        area={area}
        capacidad={capacidad}
        mesVista={mesVista}
        nivel={mesB.nivel}
        desborda={mesB.desborde > 0}
        personas={humPersonas}
        areaHumedal={humArea}
        tempC={tempC}
        muestraNonce={muestraNonce}
        plantacion={plantacion}
        ancho={ancho}
        anios={anios}
        olaNonce={olaNonce}
      />
    </SceneBoundary>
  );

  const parrafo = (txt: ReactNode) => <p style={{ margin: 0, color: T.text2, lineHeight: 1.55 }}>{txt}</p>;

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={sceneEl}
      modos={{
        opciones: MODOS.map((m) => ({ id: m, etiqueta: MODOS_DEF[m].etq, icono: MODOS_DEF[m].icono })),
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        <>
          <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
          <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={reiniciar} />
        </>
      }
      lectura={chipVivo}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: (
            <>
              <style>{estiloCSS}</style>
              <Bloque titulo={def.etq} icono={def.icono}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {def.subsistemas.map((s) => (
                    <span key={s} className="ia-sub-chip" style={{ ["--iac" as string]: SUBSISTEMA_DEF[s].color }}>
                      <i className={`fa-solid ${SUBSISTEMA_DEF[s].icono}`} style={{ color: SUBSISTEMA_DEF[s].color }} />
                      {SUBSISTEMA_DEF[s].etq}
                    </span>
                  ))}
                </div>
                {parrafo(def.conocimiento)}
                {control}
              </Bloque>
              <Bloque titulo="Qué está pasando" icono="fa-eye">
                {parrafo(pie)}
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
              <InnovacionCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />
              <RetoQuizCard quiz={QUIZ_A9} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Dominas los conceptos de la acción ambiental." />
              <RetoNumericoCard reto={RETO_LLUVIA} accent={accent} aprobado={retoAprobado} onAprobado={() => setRetoAprobado(true)} playSfx={sfx} />
              <div style={{ ...card, padding: "16px", marginTop: 22 }}>
                <Eyebrow>
                  <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
                  Completa el texto (A6)
                </Eyebrow>
                <div style={{ marginTop: 12 }}>
                  <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
                </div>
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
              <Bloque titulo="¿Cómo ayuda la tecnología al planeta?" icono="fa-earth-americas">
                {parrafo(PROBLEMA)}
              </Bloque>
              <Bloque titulo={`Video A8 · ${VIDEO_A8.titulo}`} icono="fa-circle-play">
                {parrafo(VIDEO_A8.descripcion)}
                <strong style={{ color: T.text3, fontSize: 14 }}>Para responder</strong>
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  <li>{VIDEO_A8.abierta}</li>
                  <li>¿Verdadero o falso? «{VIDEO_A8.verdaderoFalso}»</li>
                </ul>
              </Bloque>
              <Bloque titulo="Cómo usar el laboratorio" icono="fa-list-ol">
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                  {INSTRUCCIONES.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ol>
              </Bloque>
              <Bloque titulo="Hechos (verdadero o falso A4)" icono="fa-circle-question">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, color: T.text2 }}>
                  {HECHOS.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Glosario (A1 y A5)" icono="fa-book">
                <div style={{ display: "grid", gap: 8 }}>
                  {GLOSARIO.map((gi, i) => (
                    <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                      <span style={{ fontWeight: 900, color: accent }}>{gi.termino}. </span>
                      <span style={{ color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                      <span style={{ fontWeight: 900, color: T.text3, marginLeft: 6 }}>{gi.fuente}</span>
                      <div style={{ color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                        <i className="fa-solid fa-leaf" style={{ marginRight: 6, color: accent }} />
                        {gi.ejemplo}
                      </div>
                    </div>
                  ))}
                </div>
                {parrafo(<><strong style={{ color: "#fff" }}>Actividad A5:</strong> {ACTIVIDAD_A5}</>)}
              </Bloque>
              <Bloque titulo="Ideas clave" icono="fa-lightbulb">
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 9, color: T.text2 }}>
                  {IDEAS.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Tu propuesta (reflexión A3)" icono="fa-people-carry-box">
                {parrafo(REFLEXION_A3.intro)}
                <p style={{ margin: 0, color: "#fff", fontWeight: 700, lineHeight: 1.5 }}>{REFLEXION_A3.pide}</p>
                <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6, color: T.text2 }}>
                  {REFLEXION_A3.requisitos.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ol>
                <p style={{ margin: 0, color: T.text2, fontStyle: "italic", lineHeight: 1.5 }}>{REFLEXION_A3.cierre}</p>
                <strong style={{ color: T.text3, fontSize: 14 }}>Pistas</strong>
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6, color: T.text3 }}>
                  {REFLEXION_A3.pistas.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={INNOVACIONES_AMBIENTALES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
              <p style={{ marginTop: 18, fontSize: 14, color: T.text3, lineHeight: 1.5 }}>
                Esta progresión no tiene lectura: son <strong>verbatim</strong> los glosarios A1 y A5, la reflexión A3, los hechos del verdadero/falso A4, el texto A6, la descripción y las
                preguntas del video A8 y las definiciones y conceptos del relacionar columnas A9, que aquí se presentan como opción múltiple junto con la pregunta del video (sus
                retroalimentaciones son del laboratorio). Los tres modos son <strong>modelos sencillos</strong>: lluvia mensual redondeada de la normal 1991–2020, coeficientes de la
                guía OPS/CEPIS y balance mensual de la cisterna; modelo de primer orden de Reed et al. (1995) con límites de la NOM-003-SEMARNAT-1997; atenuación del oleaje y captura de
                carbono dentro de los rangos publicados, con supervivencia por zona y maduración ilustrativas. El uso de agua por persona, la DBO₅ de entrada, los problemas de la tarjeta
                de estrellas y el reto de cálculo son del laboratorio. Fuente: {FUENTE}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
