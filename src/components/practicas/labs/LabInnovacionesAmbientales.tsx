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
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el paisaje en 3D…</span>
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
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          Diagnóstico → acción: ¿qué innovación lo resuelve?
        </Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: T.text3, letterSpacing: "0.06em" }}>MEJOR MARCA</span>
          {[1, 2, 3].map((k) => (
            <i key={k} className="fa-solid fa-star" style={{ fontSize: 13, color: k <= mejor ? "#fbbf24" : "rgba(255,255,255,0.16)" }} />
          ))}
        </div>
      </div>
      {resuelto === null ? (
        <>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 800, marginBottom: 6 }}>
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
          {aviso && <div style={{ marginTop: 10, fontSize: 12, color: WARN, lineHeight: 1.5 }}>{aviso} Inténtalo de nuevo.</div>}
          {acierto && !aviso && (
            <div style={{ marginTop: 10, fontSize: 12, color: OK, lineHeight: 1.5 }}>
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
            <span style={{ fontSize: 12.5, fontWeight: 900, color: OK, marginLeft: 4 }}>Ronda con {errores === 0 ? "cero errores" : `${errores} ${errores === 1 ? "error" : "errores"}`}</span>
          </span>
          <button onClick={otra} style={{ cursor: "pointer", padding: "9px 14px", borderRadius: 10, border: `1px solid ${accent}`, background: `rgba(${rgba},0.16)`, color: "#fff", fontSize: 12.5, fontWeight: 900 }}>
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
  const [drawer, setDrawer] = useState(false);
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
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Diseñar para la Ciudad de México una cosecha de lluvia que cubra al menos 75 % del uso no potable", done: cobertura75 },
    { t: "Simular un año en Tijuana (lluvia de invierno) y en una ciudad con lluvias de verano", done: comparoRegimenes },
    { t: "Lograr en el humedal agua apta para reúso con contacto directo (DBO₅ ≤ 20 mg/L)", done: cumpleDirecto },
    { t: "Medir el mismo humedal con agua fría (≤ 12 °C) y cálida (≥ 24 °C)", done: comparoFrio },
    { t: "Plantar cada especie nativa de mangle en su zona de inundación", done: zonacionLograda },
    { t: "Que la ola de tormenta llegue al pueblo con la mitad de su altura o menos", done: olaMitad },
    { t: "Seguir la restauración 20 años y estimar el CO₂ capturado", done: carbono20 },
    { t: "Relacionar problemas con innovaciones y ganar estrellas", done: clasifico },
    { t: "Aprobar el quiz de conceptos (A9 y A8)", done: quizAprobado },
    { t: "Resolver el reto de cálculo de la cosecha de lluvia", done: retoAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
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
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>Tu equipo no puede mostrar la escena en 3D, pero los controles y los resultados siguen aquí. {pie}</div>
    </div>
  );

  const sub = (txt: string) => <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px", textTransform: "uppercase" }}>{txt}</div>;
  const nota = (txt: ReactNode, col: string, icono = "fa-circle-info") => (
    <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.55, color: col }}>
      <i className={`fa-solid ${icono}`} style={{ marginRight: 7 }} />
      {txt}
    </div>
  );
  const dato = (etq: string, valor: string, col = "#fff") => (
    <div className="ia-dato">
      <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.07em", color: T.text3, textTransform: "uppercase" }}>{etq}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: col, marginTop: 3, ...NUM }}>{valor}</div>
    </div>
  );
  const rango = (label: string, min: number, max: number, paso: number, valor: number, onChange: (v: number) => void, txt: string, icono: string, col: string, disabled = false) => (
    <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, opacity: disabled ? 0.5 : 1 }}>
      <i className={`fa-solid ${icono}`} style={{ color: col, width: 16, textAlign: "center" }} />
      <span style={{ fontSize: 12, color: T.text2, width: 108, flexShrink: 0 }}>{label}</span>
      <input type="range" aria-label={label} className="ia-range" min={min} max={max} step={paso} value={valor} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} style={{ ["--iac" as string]: col }} />
      <span style={{ width: 84, textAlign: "right", fontSize: 13, color: "#fff", fontWeight: 800, ...NUM }}>{txt}</span>
    </label>
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
        <div style={{ fontSize: 12, color: T.text2, marginTop: 10, ...NUM }}>
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
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>
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
        <div style={{ fontSize: 12, color: T.text2, marginTop: 10, lineHeight: 1.6, ...NUM }}>
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
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>
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
        <div style={{ fontSize: 11.5, color: T.text3, marginTop: 6 }}>{zona.inundacion}.</div>
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
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>
          Tramo de {num(LARGO_COSTA)} m de costa. Un manglar maduro y denso reduce la ola a la mitad cada 100 m (dentro del rango medido de 13–66 % en 100 m) y captura {CAPTURA_HA} t CO₂e/ha al año (rango 6–8). La supervivencia por zona y el tiempo de maduración son ilustrativos.
        </div>
      </>
    );
  }

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes iaPulse { 0%,100%{ box-shadow:0 0 0 0 var(--iad); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ia-live-dot { animation: iaPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .ia-live-dot { animation:none; } }
        .ia-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ia-grid { grid-template-columns: 1fr; } }
        .ia-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ia-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ia-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ia-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .ia-tab { cursor:pointer; border:1px solid var(--iac); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .ia-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .ia-tab:hover { background:rgba(255,255,255,0.06); }
        .ia-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .ia-opt { cursor:pointer; border:1px solid var(--iac); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .ia-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .ia-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .ia-opt:disabled { cursor:default; opacity:0.6; }
        .ia-toggle { width:100%; cursor:pointer; border:1px solid var(--iac); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .ia-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .ia-toggle:disabled { cursor:default; opacity:0.75; }
        .ia-range { flex:1; min-width:0; accent-color: var(--iac); }
        .ia-datos { display:grid; grid-template-columns: repeat(auto-fit, minmax(120px,1fr)); gap:7px; }
        .ia-dato { padding:9px 11px; border-radius:10px; background:rgba(4,10,22,0.45); border:1px solid ${T.line}; min-width:0; }
        .ia-meses { display:grid; grid-template-columns: repeat(12, 1fr); gap:4px; height:78px; }
        .ia-mes { cursor:pointer; position:relative; border:1px solid rgba(255,255,255,0.1); border-radius:7px; background:rgba(4,10,22,0.45); padding:0 0 16px; overflow:hidden; }
        .ia-mes[data-on="true"] { border-color:var(--iac); background:rgba(255,255,255,0.08); }
        .ia-mes:disabled { cursor:default; }
        .ia-mes-barra { position:absolute; left:22%; right:22%; bottom:16px; border-radius:3px 3px 0 0; opacity:0.85; max-height:calc(100% - 16px); }
        .ia-mes-nivel { position:absolute; left:4px; right:4px; height:2px; background:#fff; margin-bottom:16px; box-shadow:0 0 6px #fff; max-width:100%; }
        .ia-mes-letra { position:absolute; left:0; right:0; bottom:2px; font-size:9.5px; font-weight:900; color:rgba(255,255,255,0.7); text-align:center; }
        .ia-tabla { border:1px solid ${T.line}; border-radius:10px; overflow:hidden; }
        .ia-fila { display:grid; grid-template-columns: 1fr 1fr 1fr 1.3fr; gap:6px; padding:6px 10px; font-size:11.5px; color:${T.text2}; border-top:1px solid ${T.line}; }
        .ia-fila.ia-cab { border-top:none; font-size:9.5px; font-weight:900; letter-spacing:0.07em; text-transform:uppercase; color:${T.text3}; background:rgba(255,255,255,0.03); }
        .ia-sub-chip { display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:999px; font-size:11.5px; font-weight:800; border:1px solid var(--iac); color:#fff; background:rgba(4,10,22,0.4); }
        .ia-opt:focus-visible, .ia-tab:focus-visible, .ia-toggle:focus-visible, .ia-icobtn:focus-visible, .ia-range:focus-visible, .ia-mes:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .ia-bottom { grid-template-columns: 1fr !important; } }
        .ia-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ia-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ia-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .ia-drawer[data-open="true"] { transform:translateX(0); }
        .ia-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ia-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ia-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ia-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ia-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .ia-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="ia-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="ia-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--iac" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="ia-grid">
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

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="ia-live-dot" style={{ ["--iad" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ia-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ia-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ia-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 132px 14px 18px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {def.etq} — {def.subtitulo}
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6, ...NUM }}>{pie}</div>
            </div>

            <button className="ia-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
              Controles — {def.etq}
            </Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
              {def.subsistemas.map((s) => (
                <span key={s} className="ia-sub-chip" style={{ ["--iac" as string]: SUBSISTEMA_DEF[s].color }}>
                  <i className={`fa-solid ${SUBSISTEMA_DEF[s].icono}`} style={{ color: SUBSISTEMA_DEF[s].color }} />
                  {SUBSISTEMA_DEF[s].etq}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginTop: 6 }}>{def.conocimiento}</div>
            <div style={{ marginTop: 4 }}>{control}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-earth-americas" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿Cómo ayuda la tecnología al planeta?</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-play" style={{ marginRight: 8, color: "#7dd3fc" }} />
              Video A8
            </Eyebrow>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 800, lineHeight: 1.4, marginBottom: 8 }}>{VIDEO_A8.titulo}</div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>{VIDEO_A8.descripcion}</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", marginBottom: 8 }}>PARA RESPONDER</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              <li style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{VIDEO_A8.abierta}</li>
              <li style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>¿Verdadero o falso? «{VIDEO_A8.verdaderoFalso}»</li>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ia-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />
            Hechos (verdadero o falso A4)
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
            {HECHOS.map((h, i) => (
              <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                {h}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario (A1 y A5)
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <span style={{ fontSize: 9.5, fontWeight: 900, color: T.text3, marginLeft: 6 }}>{gi.fuente}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                    <i className="fa-solid fa-leaf" style={{ marginRight: 6, color: accent }} />
                    {gi.ejemplo}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, marginTop: 10 }}>
              <strong style={{ color: "#fff" }}>Actividad A5:</strong> {ACTIVIDAD_A5}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
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
          <div style={{ ...card, padding: "18px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-people-carry-box" style={{ marginRight: 8, color: accent }} />
              Tu propuesta (reflexión A3)
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>{REFLEXION_A3.intro}</div>
            <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.5, marginTop: 8, fontWeight: 700 }}>{REFLEXION_A3.pide}</div>
            <ol style={{ margin: "6px 0 0", paddingLeft: 18, display: "grid", gap: 5 }}>
              {REFLEXION_A3.requisitos.map((r, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {r}
                </li>
              ))}
            </ol>
            <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5, marginTop: 8, fontStyle: "italic" }}>{REFLEXION_A3.cierre}</div>
            <div style={{ fontSize: 10, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", margin: "12px 0 6px" }}>PISTAS</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 5 }}>
              {REFLEXION_A3.pistas.map((r, i) => (
                <li key={i} style={{ fontSize: 11, color: T.text3, lineHeight: 1.45 }}>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Esta progresión no tiene lectura: son <strong>verbatim</strong> los glosarios A1 y A5, la reflexión A3, los hechos del verdadero/falso A4, el texto A6, la descripción y las
          preguntas del video A8 y las definiciones y conceptos del relacionar columnas A9, que aquí se presentan como opción múltiple junto con la pregunta del video (sus
          retroalimentaciones son del laboratorio). Los tres modos son <strong>modelos sencillos</strong>: lluvia mensual redondeada de la normal 1991–2020, coeficientes de la
          guía OPS/CEPIS y balance mensual de la cisterna; modelo de primer orden de Reed et al. (1995) con límites de la NOM-003-SEMARNAT-1997; atenuación del oleaje y captura de
          carbono dentro de los rangos publicados, con supervivencia por zona y maduración ilustrativas. El uso de agua por persona, la DBO₅ de entrada, los problemas de la tarjeta
          de estrellas y el reto de cálculo son del laboratorio. Fuente: {FUENTE}
        </span>
      </div>

      <InnovacionCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A9} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Dominas los conceptos de la acción ambiental." />

      <RetoNumericoCard reto={RETO_LLUVIA} accent={accent} aprobado={retoAprobado} onAprobado={() => setRetoAprobado(true)} playSfx={sfx} />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="ia-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ia-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ia-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ia-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ia-drawer-body">
          <FichaTeorica data={INNOVACIONES_AMBIENTALES_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
