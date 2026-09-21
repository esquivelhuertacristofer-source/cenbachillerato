"use client";

/**
 * Laboratorio 3D — "Tipos de energía: de los fenómenos naturales a la
 * tecnología".
 * Práctica experimental anclada a CNEYT-II-P08-A2 (simulación «Diseña tu
 * investigación sobre energía»), CNEYT-II-P08-A4 (quiz verdadero/falso) y
 * CNEYT-II-P08-A6 (completa el texto); progresión 8 de la UAC CNEYT-II. El
 * glosario sale de A5 y A1, y los hechos y la reflexión, del video A8 y de la
 * autoevaluación A7.
 *
 * Tres modos:
 *  (1) Explica el fenómeno — arma la cadena de energía de un rayo, la brisa
 *      marina, una erupción y la fotosíntesis; cada acierto enciende su etapa.
 *  (2) Aprovéchala — aerogenerador, planta geotérmica y panel solar frente a
 *      una hoja, con un diagrama de flujo (Sankey) 3D de energía útil y
 *      pérdidas.
 *  (3) Diseña tu investigación — la simulación A2: pregunta, hipótesis,
 *      variables, niveles, repeticiones, datos y conclusión.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { CompletaTexto } from "./_mecanica-huecos";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { TIPOS_ENERGIA_FICHA } from "./tipos-energia-ficha";
import {
  type Modo,
  type FenomenoId,
  type FormaId,
  type Magma,
  type TecId,
  type SitioId,
  type Rol,
  type Tendencia,
  type FilaDatos,
  MODOS,
  MODOS_DEF,
  FORMAS,
  FORMA_DEF,
  FENOMENOS,
  revisarFinales,
  pistaCadena,
  retrasoTrueno,
  MAGMAS,
  tasaFotosintesis,
  TECNOLOGIAS,
  SITIOS_VIENTO,
  densidadAire,
  aerogenerador,
  V_ARRANQUE,
  V_CORTE,
  BETZ,
  CP,
  geotermica,
  carnot,
  META_GEO_MW,
  panelSolar,
  hoja,
  eficiencia,
  INVESTIGACIONES,
  ROL_DEF,
  TENDENCIAS,
  factores,
  opcionesVD,
  tendenciaReal,
  simular,
  MIN_NIVELES,
  CATEGORIAS,
  CASOS,
  rondaCasos,
  estrellasPorErrores,
  mulberry32,
  A2,
  QUIZ_A4,
  GLOSARIO_A5,
  ACTIVIDAD_A5,
  GLOSARIO_A1,
  ACTIVIDAD_A1,
  HECHOS_A8,
  TITULO_A8,
  REFLEXION,
  HUECOS_A6,
  FUENTE,
  PROBLEMA,
  INSTRUCCIONES,
  IDEAS,
  num,
  potencia,
} from "./tipos-energia-data";

const TiposScene = dynamic(() => import("./TiposEnergiaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bolt fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando los fenómenos en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-tipos-energia-reto";
const WARN = "#FF8A3C";
const T_ENSAYO = 1700;
const RONDA_INICIAL = rondaCasos(mulberry32(5));

interface ProgresoCadena {
  paso: number;
  errores: number;
  marcadas: FormaId[];
  final: boolean;
  aviso: string | null;
}
const CADENA_VACIA: ProgresoCadena = { paso: 0, errores: 0, marcadas: [], final: false, aviso: null };
const CADENAS_INICIALES = Object.fromEntries(FENOMENOS.map((f) => [f.id, CADENA_VACIA])) as Record<FenomenoId, ProgresoCadena>;

/* ── Tarjeta de estrellas: ¿fenómeno o tecnología? ────────────────────── */
function CasosCard({ accent, rgba, mejor, onResultado, playSfx }: { accent: string; rgba: string; mejor: number; onResultado: (e: number) => void; playSfx?: (ok: boolean) => void }) {
  const [ronda, setRonda] = useState<number[]>(RONDA_INICIAL);
  const [pos, setPos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<number | null>(null);
  const actual = CASOS[ronda[pos] ?? 0]!;

  const responder = (cat: string) => {
    if (resuelto !== null) return;
    const ok = cat === actual.cat;
    playSfx?.(ok);
    if (!ok) {
      setErrores((e) => e + 1);
      setAviso(`No es «${CATEGORIAS.find((c) => c.id === cat)!.etq}». Pista: piensa qué forma de energía entra y cuál sale.`);
      return;
    }
    setAviso(null);
    if (pos + 1 >= ronda.length) {
      const est = estrellasPorErrores(errores);
      setResuelto(est);
      onResultado(est);
    } else setPos((p) => p + 1);
  };
  const otra = () => {
    setRonda(rondaCasos(Math.random));
    setPos(0);
    setErrores(0);
    setAviso(null);
    setResuelto(null);
  };

  return (
    <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <Eyebrow>
          <i className="fa-solid fa-star" style={{ marginRight: 8, color: accent }} />
          ¿Fenómeno o tecnología? (glosario A5)
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
            Caso {pos + 1} de {ronda.length} · ¿qué es?
          </div>
          <div style={{ fontSize: 15.5, color: "#fff", fontWeight: 800, lineHeight: 1.45, marginBottom: 12 }}>{actual.texto}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIAS.map((c) => (
              <button key={c.id} className="te-opt te-cat" data-on="true" onClick={() => responder(c.id)} style={{ ["--tec" as string]: c.color }}>
                <i className={`fa-solid ${c.icono}`} style={{ marginRight: 8, color: c.color }} />
                {c.etq}
              </button>
            ))}
          </div>
          {aviso && <div style={{ marginTop: 10, fontSize: 12, color: WARN, lineHeight: 1.5 }}>{aviso}</div>}
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
      <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.45 }}>Máquina térmica: transforma calor en trabajo mecánico. Generador eléctrico: transforma energía mecánica en eléctrica (definiciones del glosario A5).</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Shell
 * ════════════════════════════════════════════════════════════════════════ */

export function LabTiposEnergia({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("fenomenos");

  // ── Fenómenos
  const [fenId, setFenId] = useState<FenomenoId>("tormenta");
  const [cadenas, setCadenas] = useState<Record<FenomenoId, ProgresoCadena>>(CADENAS_INICIALES);
  const [sinErrores, setSinErrores] = useState(false);
  const [distanciaKm, setDistanciaKm] = useState(2);
  const [rayoNonce, setRayoNonce] = useState(0);
  const [trueno, setTrueno] = useState<"esperando" | number | null>(null);
  const [noche, setNoche] = useState(false);
  const [magma, setMagma] = useState<Magma>("viscoso");
  const [luzPct, setLuzPct] = useState(70);

  // ── Tecnología
  const [tecId, setTecId] = useState<TecId>("aerogenerador");
  const [viento, setViento] = useState(6);
  const [sitio, setSitio] = useState<SitioId>("istmo");
  const [medicionA, setMedicionA] = useState<{ v: number; p: number } | null>(null);
  const [vioNominal, setVioNominal] = useState(false);
  const [vioOcho, setVioOcho] = useState(false);
  const [tempGeo, setTempGeo] = useState(200);
  const [flujoGeo, setFlujoGeo] = useState(80);
  const [metaGeo, setMetaGeo] = useState(false);
  const [irradiancia, setIrradiancia] = useState(600);
  const [angulo, setAngulo] = useState(30);
  const [comparoPleno, setComparoPleno] = useState(false);

  // ── Investigación
  const [invIdx, setInvIdx] = useState(0);
  const [viIdx, setViIdx] = useState<number | null>(null);
  const [vdSel, setVdSel] = useState<number | null>(null);
  const [hipotesis, setHipotesis] = useState<Tendencia | null>(null);
  const [roles, setRoles] = useState<(Rol | null)[]>([null, null, null, null, null]);
  const [rolesRevisados, setRolesRevisados] = useState(false);
  const [rolErrores, setRolErrores] = useState(0);
  const [nivelesSel, setNivelesSel] = useState<number[]>([]);
  const [reps, setReps] = useState(3);
  const [datos, setDatos] = useState<FilaDatos[] | null>(null);
  const [hechos, setHechos] = useState(0);
  const [nivelActual, setNivelActual] = useState<number | null>(null);
  const [ensayoNonce, setEnsayoNonce] = useState(0);
  const [conclusion, setConclusion] = useState<boolean | null>(null);
  const [disenoCompleto, setDisenoCompleto] = useState(false);
  const [conclusionOk, setConclusionOk] = useState(false);

  // ── Evaluables
  const [clasifico, setClasifico] = useState(false);
  const [quizAprobado, setQuizAprobado] = useState(false);
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
  const limpiarTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
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

  /* ── Fenómenos ─────────────────────────────────────────────────────── */
  const fen = FENOMENOS.find((f) => f.id === fenId)!;
  const prog = cadenas[fenId];
  const cadenaLista = prog.paso >= fen.pasos.length;
  const etapa = prog.paso + (prog.final ? 1 : 0);
  const completas = FENOMENOS.filter((f) => cadenas[f.id].final).length;

  const actualizar = (id: FenomenoId, cambio: Partial<ProgresoCadena>) => setCadenas((c) => ({ ...c, [id]: { ...c[id], ...cambio } }));

  const elegirForma = (forma: FormaId) => {
    if (cadenaLista) return;
    const esperada = fen.pasos[prog.paso]!.forma;
    if (forma === esperada) {
      actualizar(fenId, { paso: prog.paso + 1, aviso: null });
      sfx(true);
    } else {
      actualizar(fenId, { errores: prog.errores + 1, aviso: pistaCadena(fen, prog.paso, forma) });
      sfx(false);
    }
  };
  const marcarFinal = (forma: FormaId) => {
    if (!cadenaLista || prog.final) return;
    const marcadas = prog.marcadas.includes(forma) ? prog.marcadas.filter((x) => x !== forma) : [...prog.marcadas, forma];
    actualizar(fenId, { marcadas, aviso: null });
    blip();
  };
  const comprobarFinal = () => {
    const r = revisarFinales(fen, prog.marcadas);
    if (r.ok) {
      actualizar(fenId, { final: true, aviso: null });
      if (prog.errores === 0) setSinErrores(true);
      sfx(true);
    } else {
      const partes: string[] = [];
      if (r.faltan.length) partes.push(`Te falta ${r.faltan.length === 1 ? "una forma" : `${r.faltan.length} formas`}.`);
      if (r.sobran.length) partes.push(`${r.sobran.map((x) => FORMA_DEF[x].etq).join(", ")} no ${r.sobran.length === 1 ? "aparece" : "aparecen"} al final.`);
      actualizar(fenId, { errores: prog.errores + 1, aviso: partes.join(" ") });
      sfx(false);
    }
  };
  const elegirFenomeno = (id: FenomenoId) => {
    setFenId(id);
    setTrueno(null);
    blip();
  };
  const lanzarRayo = () => {
    if (etapa < 4 || trueno === "esperando") return;
    setRayoNonce((n) => n + 1);
    setTrueno("esperando");
    if (sonido) audioRef.current?.chispa();
    const d = retrasoTrueno(distanciaKm);
    despues(d * 1000, () => {
      setTrueno(d);
      if (sonido) audioRef.current?.romper();
    });
  };

  /* ── Tecnología ────────────────────────────────────────────────────── */
  const rho = densidadAire(SITIOS_VIENTO.find((s) => s.id === sitio)!.altitud);
  const aero = aerogenerador(viento, rho);
  const geo = geotermica(tempGeo, flujoGeo);
  const fPanel = panelSolar(irradiancia, angulo);
  const fHoja = hoja(irradiancia, angulo);

  const revisarOcho = (v: number, s: SitioId, a: { v: number; p: number } | null) => {
    if (!a) return;
    const r = aerogenerador(v, densidadAire(SITIOS_VIENTO.find((x) => x.id === s)!.altitud));
    if (r.estado !== "operando" || a.p <= 0) return;
    const razonV = v / a.v;
    const razonP = r.pElec / a.p;
    if ((Math.abs(razonV - 2) < 0.01 && Math.abs(razonP - 8) < 0.05) || (Math.abs(razonV - 0.5) < 0.01 && Math.abs(razonP - 0.125) < 0.01)) setVioOcho(true);
  };
  const cambiarViento = (v: number) => {
    setViento(v);
    if (aerogenerador(v, rho).estado === "nominal") setVioNominal(true);
    revisarOcho(v, sitio, medicionA);
  };
  const cambiarSitio = (s: SitioId) => {
    setSitio(s);
    setMedicionA(null);
    blip();
  };
  const guardarA = () => {
    const a = { v: viento, p: aero.pElec };
    setMedicionA(a);
    blip();
  };
  const cambiarGeo = (t: number, f: number) => {
    setTempGeo(t);
    setFlujoGeo(f);
    if (geotermica(t, f).pElec >= META_GEO_MW * 1e6) setMetaGeo(true);
  };
  const cambiarSolar = (g: number, a: number) => {
    setIrradiancia(g);
    setAngulo(a);
    if (g === 1000 && a === 0) setComparoPleno(true);
  };

  /* ── Investigación ─────────────────────────────────────────────────── */
  const inv = INVESTIGACIONES[invIdx]!;
  const op = viIdx !== null ? inv.vis[viIdx]! : null;
  const opsVD = viIdx !== null ? opcionesVD(inv, viIdx) : [];
  const vdOk = vdSel !== null && !!opsVD[vdSel]?.ok;
  const facts = viIdx !== null ? factores(inv, viIdx) : [];
  const rolesOk = facts.length > 0 && facts.every((f, i) => roles[i] === f.rol);
  const midiendo = datos !== null && hechos < datos.length;
  const datosListos = datos !== null && hechos >= datos.length;
  const tendencia = op && datos ? tendenciaReal(op, datos.map((d) => d.nivel)) : null;
  const confirma = tendencia !== null && hipotesis === tendencia;
  const puedeCorrer = !!op && vdOk && hipotesis !== null && rolesRevisados && rolesOk && nivelesSel.length >= MIN_NIVELES && !midiendo;

  const reiniciarDatos = () => {
    limpiarTimers();
    setDatos(null);
    setHechos(0);
    setNivelActual(null);
    setConclusion(null);
  };
  const elegirInv = (i: number) => {
    reiniciarDatos();
    setInvIdx(i);
    setViIdx(null);
    setVdSel(null);
    setHipotesis(null);
    setRoles([null, null, null, null, null]);
    setRolesRevisados(false);
    setNivelesSel([]);
    blip();
  };
  const elegirVI = (i: number) => {
    reiniciarDatos();
    setViIdx(i);
    setVdSel(null);
    setRoles([null, null, null, null, null]);
    setRolesRevisados(false);
    setNivelesSel([]);
    blip();
  };
  const elegirVD = (i: number) => {
    setVdSel(i);
    sfx(!!opsVD[i]?.ok);
  };
  const asignarRol = (i: number, r: Rol) => {
    setRoles((xs) => xs.map((x, k) => (k === i ? r : x)));
    setRolesRevisados(false);
    blip();
  };
  const revisarRoles = () => {
    setRolesRevisados(true);
    if (!rolesOk) setRolErrores((e) => e + 1);
    sfx(rolesOk);
  };
  const toggleNivel = (i: number) => {
    reiniciarDatos();
    setNivelesSel((xs) => (xs.includes(i) ? xs.filter((x) => x !== i) : [...xs, i].sort((a, b) => a - b)));
    blip();
  };
  const cambiarReps = (v: number) => {
    reiniciarDatos();
    setReps(v);
  };
  const correr = () => {
    if (!puedeCorrer || !op) return;
    limpiarTimers();
    const niveles = nivelesSel.map((i) => op.niveles[i]!);
    const filas = simular(op, niveles, reps);
    setDatos(filas);
    setHechos(0);
    setConclusion(null);
    setDisenoCompleto(true);
    const orden = [...nivelesSel].sort((a, b) => op.niveles[a]!.v - op.niveles[b]!.v);
    orden.forEach((idx, k) => {
      despues(k * T_ENSAYO, () => {
        setNivelActual(idx);
        setEnsayoNonce((n) => n + 1);
        blip();
      });
      despues(k * T_ENSAYO + T_ENSAYO - 250, () => setHechos(k + 1));
    });
  };
  const concluir = (dice: boolean) => {
    if (!datosListos || conclusion !== null) return;
    setConclusion(dice);
    const ok = dice === confirma;
    if (ok) setConclusionOk(true);
    sfx(ok);
  };

  const cambiarModo = (m: Modo) => {
    setModo(m);
    blip();
  };
  const irATecnologia = (id: TecId) => {
    setTecId(id);
    setModo("tecnologia");
    blip();
  };
  const reiniciar = () => {
    if (modo === "fenomenos") {
      actualizar(fenId, CADENA_VACIA);
      setTrueno(null);
    }
    if (modo === "tecnologia") {
      setViento(6);
      setMedicionA(null);
      setTempGeo(200);
      setFlujoGeo(80);
      setIrradiancia(600);
      setAngulo(30);
    }
    if (modo === "investigacion") elegirInv(invIdx);
    setResetNonce((k) => k + 1);
  };

  /* ── Objetivos ─────────────────────────────────────────────────────── */
  const objetivos: { t: string; done: boolean }[] = [
    { t: "Armar sin errores la cadena de energía de un fenómeno", done: sinErrores },
    { t: "Explicar los cuatro fenómenos naturales con su cadena", done: completas === FENOMENOS.length },
    { t: "Llevar el aerogenerador a su potencia nominal (2 MW)", done: vioNominal },
    { t: "Comprobar que con el doble de viento hay 8 veces más potencia", done: vioOcho },
    { t: `Generar al menos ${META_GEO_MW} MW en la planta geotérmica`, done: metaGeo },
    { t: "Comparar el panel y la hoja a pleno sol y de frente", done: comparoPleno },
    { t: "Diseñar y correr una investigación completa (A2)", done: disenoCompleto },
    { t: "Concluir correctamente a partir de tus datos", done: conclusionOk },
    { t: "Clasificar casos y ganar estrellas", done: clasifico },
    { t: "Aprobar el quiz A4", done: quizAprobado },
    { t: "Completar el texto (A6)", done: textoOk },
  ];

  /* ── Visor ─────────────────────────────────────────────────────────── */
  let chipVivo = "";
  let pie = "";
  if (modo === "fenomenos") {
    const formas = fen.pasos.slice(0, prog.paso).map((p) => FORMA_DEF[p.forma].etq.toLowerCase());
    chipVivo = `${fen.etq.toLowerCase()} · ${prog.final ? "explicado" : cadenaLista ? "¿en qué termina?" : `eslabón ${prog.paso + 1} de ${fen.pasos.length}`}`;
    if (fenId === "tormenta" && trueno !== null) chipVivo = trueno === "esperando" ? `relámpago · contando segundos…` : `trueno a los ${num(trueno, 1)} s → ${num(distanciaKm)} km`;
    pie = prog.final ? fen.explicaFinal : prog.paso > 0 ? `${formas.join(" → ")}: ${fen.pasos[prog.paso - 1]!.explica}` : `${fen.pregunta} Elige con qué forma de energía empieza todo.`;
  } else if (modo === "tecnologia") {
    if (tecId === "aerogenerador") {
      chipVivo = `${num(viento, 1)} m/s · ${potencia(aero.pElec)} · η ${num(eficiencia(aero.flujo) * 100, 1)} %`;
      pie =
        aero.estado === "calma"
          ? `Con menos de ${V_ARRANQUE} m/s el rotor no arranca: el viento lleva ${potencia(aero.pViento)}, pero no alcanza para vencer la fricción.`
          : aero.estado === "corte"
            ? `Arriba de ${V_CORTE} m/s el aerogenerador se frena y gira sus aspas para no romperse: toda la energía sigue de largo.`
            : aero.estado === "nominal"
              ? `El generador ya da sus 2 MW: las aspas se giran para dejar pasar el viento sobrante, por eso la eficiencia baja aunque sople más.`
              : `El viento lleva ${potencia(aero.pViento)} a través del rotor; el rotor toma el ${num(CP * 100)} % (el máximo teórico es ${num(BETZ * 100, 1)} %) y engranes y generador pierden un poco más como calor.`;
    } else if (tecId === "geotermica") {
      chipVivo = `${tempGeo} °C · ${flujoGeo} kg/s · ${potencia(geo.pElec)}`;
      pie = `Con vapor a ${tempGeo} °C y condensador a 40 °C, ninguna turbina puede superar ${num(carnot(tempGeo) * 100, 1)} % (Carnot); la planta real logra ${num(eficiencia(geo.flujo) * 100, 1)} %. El resto del calor sale por la torre de enfriamiento.`;
    } else {
      chipVivo = `${num(irradiancia)} W/m² · ${angulo}° · panel ${potencia(fPanel.tramos[1]!.w)} · hoja ${potencia(fHoja.tramos[2]!.w)}`;
      pie = `Con la misma luz, el panel entrega ${num(eficiencia(fPanel) * 100)} % como electricidad y la hoja guarda ${num(eficiencia(fHoja) * 100)} % como glucosa: ${fHoja.tramos[2]!.w > 0 ? `el panel produce ${num(fPanel.tramos[1]!.w / fHoja.tramos[2]!.w)} veces más energía útil` : "sin luz, ninguno produce nada"}. Pero la hoja se construye sola y guarda su energía por meses.`;
    }
  } else {
    chipVivo = midiendo ? `midiendo · prueba ${Math.min(hechos + 1, datos!.length)} de ${datos!.length}` : datosListos ? `${datos!.length} niveles × ${reps} repeticiones` : `${inv.etq.toLowerCase()} · diseñando`;
    pie = op
      ? `¿Cómo afecta ${op.frase} a ${op.vd.frase}? ${op.montaje}${datosListos && conclusion !== null ? ` ${op.porque}` : ""}`
      : `${inv.etq}: elige qué vas a modificar (la variable independiente) para formular tu pregunta.`;
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
  const rango = (label: string, icono: string, col: string, min: number, max: number, step: number, value: number, onChange: (v: number) => void, texto: string) => (
    <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
      <i className={`fa-solid ${icono}`} style={{ color: col, width: 16 }} />
      <input type="range" aria-label={label} className="te-range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ ["--tec" as string]: col }} />
      <span style={{ width: 92, textAlign: "right", fontSize: 12.5, color: "#fff", fontWeight: 800, ...NUM }}>{texto}</span>
    </label>
  );
  const lectura = (etq: string, valor: string, col = "#fff") => (
    <div style={{ flex: "1 1 110px", padding: "9px 10px", borderRadius: 10, background: "rgba(4,10,22,0.45)", border: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.06em", color: T.text3, textTransform: "uppercase" }}>{etq}</div>
      <div style={{ fontSize: 14.5, fontWeight: 900, color: col, marginTop: 3, ...NUM }}>{valor}</div>
    </div>
  );

  /* ── Panel ─────────────────────────────────────────────────────────── */
  let control: ReactNode = null;
  if (modo === "fenomenos") {
    const tec = TECNOLOGIAS.find((t) => t.fenomeno === fenId);
    control = (
      <>
        <div className="te-opts">
          {FENOMENOS.map((f) => (
            <button key={f.id} className="te-opt te-fen" data-on={f.id === fenId} onClick={() => elegirFenomeno(f.id)} style={{ ["--tec" as string]: modoCol, background: f.id === fenId ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${f.icono}`} style={{ marginRight: 7 }} />
              {f.etq}
              {cadenas[f.id].final && <i className="fa-solid fa-circle-check" style={{ marginLeft: 7, color: OK }} />}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14.5, color: "#fff", fontWeight: 900, lineHeight: 1.45, marginTop: 12 }}>{fen.pregunta}</div>
        {sub("Tu cadena de energía")}
        <div className="te-cadena">
          {fen.pasos.map((p, k) => {
            const hecho = k < prog.paso;
            const d = FORMA_DEF[p.forma];
            return (
              <div key={k} style={{ display: "contents" }}>
                {k > 0 && <i className="fa-solid fa-arrow-right" style={{ color: T.text3, fontSize: 11 }} />}
                <span className="te-eslabon" data-on={hecho} style={{ ["--tec" as string]: hecho ? d.color : "rgba(255,255,255,0.2)" }}>
                  {hecho ? (
                    <>
                      <i className={`fa-solid ${d.icono}`} style={{ marginRight: 6, color: d.color }} />
                      {d.etq}
                    </>
                  ) : k === prog.paso ? (
                    "¿?"
                  ) : (
                    "…"
                  )}
                </span>
              </div>
            );
          })}
          <i className="fa-solid fa-arrow-right" style={{ color: T.text3, fontSize: 11 }} />
          <span className="te-eslabon" data-on={prog.final} style={{ ["--tec" as string]: prog.final ? OK : "rgba(255,255,255,0.2)" }}>
            {prog.final ? fen.finales.map((x) => FORMA_DEF[x].etq).join(" + ") : "final"}
          </span>
        </div>
        {prog.paso > 0 && (
          <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
            {fen.pasos.slice(0, prog.paso).map((p, k) => (
              <div key={k} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45, display: "flex", gap: 8 }}>
                <span style={{ color: FORMA_DEF[p.forma].color, fontWeight: 900, flexShrink: 0 }}>{k + 1}.</span>
                <span>{p.explica}</span>
              </div>
            ))}
          </div>
        )}
        {!cadenaLista && (
          <>
            {sub(prog.paso === 0 ? "1 · ¿Con qué forma de energía empieza?" : `${prog.paso + 1} · ¿En qué forma se transforma después?`)}
            <div className="te-opts">
              {FORMAS.map((x) => (
                <button key={x} className="te-opt te-forma" data-on="true" onClick={() => elegirForma(x)} style={{ ["--tec" as string]: FORMA_DEF[x].color }}>
                  <i className={`fa-solid ${FORMA_DEF[x].icono}`} style={{ marginRight: 7, color: FORMA_DEF[x].color }} />
                  {FORMA_DEF[x].etq}
                </button>
              ))}
            </div>
          </>
        )}
        {cadenaLista && !prog.final && (
          <>
            {sub(`${fen.pasos.length + 1} · ${fen.preguntaFinal}`)}
            <div className="te-opts">
              {FORMAS.map((x) => {
                const on = prog.marcadas.includes(x);
                return (
                  <button key={x} className="te-opt te-final" data-on={on} onClick={() => marcarFinal(x)} style={{ ["--tec" as string]: FORMA_DEF[x].color, background: on ? `${FORMA_DEF[x].color}24` : "transparent" }}>
                    <i className={`fa-solid ${on ? "fa-square-check" : "fa-square"}`} style={{ marginRight: 7, color: on ? FORMA_DEF[x].color : T.text3 }} />
                    {FORMA_DEF[x].etq}
                  </button>
                );
              })}
            </div>
            <button className="te-toggle" onClick={comprobarFinal} disabled={prog.marcadas.length === 0} style={{ marginTop: 10, ["--tec" as string]: modoCol }}>
              <i className="fa-solid fa-check-double" style={{ marginRight: 9, color: modoCol }} />
              Comprobar el final de la cadena
            </button>
          </>
        )}
        {prog.aviso && nota(`${prog.aviso} Inténtalo de nuevo.`, WARN, "fa-rotate-left")}
        {prog.final && (
          <>
            {nota(
              <>
                <strong>{prog.errores === 0 ? "Cadena perfecta. " : `Cadena completa (${prog.errores} ${prog.errores === 1 ? "tropiezo" : "tropiezos"}). `}</strong>
                {fen.explicaFinal} {fen.explicaOpcional}
              </>,
              OK,
              "fa-circle-check",
            )}
            <ul style={{ margin: "10px 0 0", paddingLeft: 16, display: "grid", gap: 5 }}>
              {fen.datos.map((d, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45, ...NUM }}>
                  {d}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 11, border: `1px solid #22d3ee44`, background: "rgba(34,211,238,0.06)", fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
              <i className="fa-solid fa-gears" style={{ marginRight: 7, color: "#22d3ee" }} />
              <strong style={{ color: "#fff" }}>Tecnología: </strong>
              {fen.tecnologia}
              {tec && (
                <button className="te-link" onClick={() => irATecnologia(tec.id)}>
                  Ver {tec.etq.toLowerCase()} <i className="fa-solid fa-arrow-right" style={{ marginLeft: 4 }} />
                </button>
              )}
            </div>
          </>
        )}
        {sub("Experimenta con el fenómeno")}
        {fenId === "tormenta" && (
          <div style={{ opacity: etapa >= 4 ? 1 : 0.45, pointerEvents: etapa >= 4 ? "auto" : "none" }}>
            {rango("Distancia a la tormenta (km)", "fa-ruler-horizontal", "#f472b6", 1, 6, 1, distanciaKm, (v) => { setDistanciaKm(v); setTrueno(null); }, `${distanciaKm} km`)}
            <button className="te-toggle" onClick={lanzarRayo} disabled={trueno === "esperando"} style={{ marginTop: 10, ["--tec" as string]: "#e0f2fe" }}>
              <i className={`fa-solid ${trueno === "esperando" ? "fa-stopwatch fa-beat" : "fa-bolt-lightning"}`} style={{ marginRight: 9, color: "#fde047" }} />
              {trueno === "esperando" ? "Cuenta los segundos hasta el trueno…" : "Lanzar un rayo y medir el trueno"}
            </button>
            {typeof trueno === "number" && nota(`La luz llegó al instante; el trueno tardó ${num(trueno, 1)} s. A 343 m/s eso son ${num((trueno * 343) / 1000, 1)} km: la regla de «segundos entre 3» da ${num(trueno / 3, 1)} km.`, "#f9a8d4", "fa-ear-listen")}
            {etapa < 4 && nota("Completa la cadena hasta la energía eléctrica para lanzar un rayo.", T.text3)}
          </div>
        )}
        {fenId === "brisa" && (
          <>
            <div className="te-opts">
              {[false, true].map((n) => (
                <button key={String(n)} className="te-opt te-noche" data-on={noche === n} onClick={() => { setNoche(n); blip(); }} style={{ ["--tec" as string]: modoCol, background: noche === n ? `${modoCol}1f` : "transparent" }}>
                  <i className={`fa-solid ${n ? "fa-moon" : "fa-sun"}`} style={{ marginRight: 7 }} />
                  {n ? "De noche" : "De día"}
                </button>
              ))}
            </div>
            {nota(noche ? "De noche la arena pierde su calor más rápido que el mar: el aire sube sobre el agua, más tibia, y la brisa sopla de la tierra al mar." : "De día la arena se calienta más que el mar: el aire sube sobre la playa y la brisa sopla del mar hacia la tierra.", T.text2, noche ? "fa-moon" : "fa-sun")}
          </>
        )}
        {fenId === "volcan" && (
          <>
            <div className="te-opts">
              {MAGMAS.map((m) => (
                <button key={m.id} className="te-opt te-magma" data-on={magma === m.id} onClick={() => { setMagma(m.id); blip(); }} style={{ ["--tec" as string]: modoCol, background: magma === m.id ? `${modoCol}1f` : "transparent" }}>
                  {m.etq}
                </button>
              ))}
            </div>
            {nota(`${MAGMAS.find((m) => m.id === magma)!.explica}${etapa < 3 ? " (La erupción aparece al completar la cadena hasta la energía cinética.)" : ""}`, T.text2, "fa-volcano")}
          </>
        )}
        {fenId === "fotosintesis" && (
          <>
            {rango("Luz sobre la planta (% de pleno sol)", "fa-sun", "#fde047", 0, 100, 5, luzPct, (v) => setLuzPct(v), `${luzPct} %`)}
            {nota(`Tasa de fotosíntesis: ${num(tasaFotosintesis(luzPct))} % de la máxima. ${luzPct === 0 ? "Sin luz no hay fotosíntesis: la planta solo respira." : luzPct >= 50 ? "Arriba de cierta luz la tasa casi no sube: la hoja se satura." : "Con poca luz, más luz significa bastante más glucosa."} (Curva ilustrativa.)`, T.text2, "fa-leaf")}
          </>
        )}
      </>
    );
  } else if (modo === "tecnologia") {
    control = (
      <>
        <div className="te-opts">
          {TECNOLOGIAS.map((t) => (
            <button key={t.id} className="te-opt te-tec" data-on={t.id === tecId} onClick={() => { setTecId(t.id); blip(); }} style={{ ["--tec" as string]: modoCol, background: t.id === tecId ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${t.icono}`} style={{ marginRight: 7 }} />
              {t.etq}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: T.text2, marginTop: 10, lineHeight: 1.5 }}>
          {TECNOLOGIAS.find((t) => t.id === tecId)!.descripcion} Aprovecha la energía de: <strong style={{ color: "#fff" }}>{FENOMENOS.find((f) => f.id === TECNOLOGIAS.find((t) => t.id === tecId)!.fenomeno)!.etq.toLowerCase()}</strong>.
        </div>
        {tecId === "aerogenerador" && (
          <>
            <div className="te-opts" style={{ marginTop: 10 }}>
              {SITIOS_VIENTO.map((s) => (
                <button key={s.id} className="te-opt te-sitio" data-on={s.id === sitio} onClick={() => cambiarSitio(s.id)} style={{ ["--tec" as string]: accent, background: s.id === sitio ? `rgba(${color.rgba},0.16)` : "transparent" }}>
                  {s.etq}
                </button>
              ))}
            </div>
            {rango("Velocidad del viento (m/s)", "fa-wind", "#60a5fa", 0, 30, 0.5, viento, cambiarViento, `${num(viento, 1)} m/s`)}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
              {lectura("Viento en el rotor", potencia(aero.pViento), "#60a5fa")}
              {lectura("Electricidad", potencia(aero.pElec), "#22d3ee")}
              {lectura("Eficiencia", `${num(eficiencia(aero.flujo) * 100, 1)} %`)}
            </div>
            <div style={{ fontSize: 12, color: T.text2, marginTop: 8, ...NUM }}>
              P = ½·ρ·A·v³ = ½ · {num(rho, 3)} kg/m³ · {num(Math.PI * 45 * 45)} m² · ({num(viento, 1)} m/s)³ = <strong style={{ color: "#fff" }}>{potencia(aero.pViento)}</strong>
            </div>
            {sub("Compara dos vientos")}
            <button className="te-toggle te-guardar" onClick={guardarA} style={{ ["--tec" as string]: modoCol }}>
              <i className="fa-solid fa-thumbtack" style={{ marginRight: 9, color: modoCol }} />
              {medicionA ? `Medición A: ${num(medicionA.v, 1)} m/s → ${potencia(medicionA.p)} (toca para reemplazar)` : "Guardar esta medición como A"}
            </button>
            {medicionA &&
              medicionA.p > 0 &&
              aero.estado === "operando" &&
              nota(`Ahora: ${num(viento / medicionA.v, 2)} veces el viento → ${num(aero.pElec / medicionA.p, 2)} veces la potencia. ${Math.abs(viento / medicionA.v - 2) < 0.01 ? "¡El doble de viento da 8 veces más potencia: 2³ = 8!" : "Prueba con el doble exacto del viento de A."}`, vioOcho ? OK : T.text2, "fa-scale-balanced")}
            {medicionA && medicionA.p > 0 && aero.estado !== "operando" && nota("Para comparar, ambas mediciones deben estar entre el arranque y la potencia nominal (unos 4 a 11 m/s).", T.text3)}
            {medicionA && medicionA.p === 0 && nota("La medición A no produjo electricidad: guarda una con el rotor girando.", T.text3)}
          </>
        )}
        {tecId === "geotermica" && (
          <>
            {rango("Temperatura del vapor (°C)", "fa-temperature-high", "#fb923c", 150, 320, 5, tempGeo, (v) => cambiarGeo(v, flujoGeo), `${tempGeo} °C`)}
            {rango("Flujo de vapor (kg/s)", "fa-water", "#e2e8f0", 20, 200, 5, flujoGeo, (v) => cambiarGeo(tempGeo, v), `${flujoGeo} kg/s`)}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
              {lectura("Calor del vapor", potencia(geo.pTermica), "#fb923c")}
              {lectura("Electricidad", potencia(geo.pElec), geo.pElec >= META_GEO_MW * 1e6 ? OK : "#22d3ee")}
              {lectura("Máx. Carnot", `${num(carnot(tempGeo) * 100, 1)} %`)}
            </div>
            <div style={{ fontSize: 12, color: T.text2, marginTop: 8, ...NUM }}>
              η Carnot = 1 − T fría / T caliente = 1 − 313 K / {num(tempGeo + 273)} K = {num(carnot(tempGeo) * 100, 1)} %; la planta logra {num(eficiencia(geo.flujo) * 100, 1)} %.
            </div>
            {nota(geo.pElec >= META_GEO_MW * 1e6 ? `¡Meta cumplida! ${potencia(geo.pElec)} de electricidad.` : `Meta: ${META_GEO_MW} MW. ¿Conviene más vapor, o vapor más caliente? Prueba las dos.`, geo.pElec >= META_GEO_MW * 1e6 ? OK : T.text2, "fa-bullseye")}
          </>
        )}
        {tecId === "solar" && (
          <>
            {rango("Intensidad de la luz (W/m²)", "fa-sun", "#fde047", 0, 1000, 50, irradiancia, (v) => cambiarSolar(v, angulo), `${num(irradiancia)} W/m²`)}
            {rango("Ángulo con los rayos (°)", "fa-rotate", "#a78bfa", 0, 85, 5, angulo, (v) => cambiarSolar(irradiancia, v), `${angulo}°`)}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
              {lectura("Luz que recibe", potencia(fPanel.tramos[0]!.w), "#fde047")}
              {lectura("Panel: electricidad", potencia(fPanel.tramos[1]!.w), "#22d3ee")}
              {lectura("Hoja: glucosa", potencia(fHoja.tramos[2]!.w), "#4ade80")}
            </div>
            <div style={{ fontSize: 12, color: T.text2, marginTop: 8, ...NUM }}>
              Luz = {num(irradiancia)} W/m² · cos {angulo}° · 1 m² = {potencia(fPanel.tramos[0]!.w)}
            </div>
            {comparoPleno ? nota("A pleno sol (1 000 W/m²) y de frente: el panel da 200 W y la hoja guarda 10 W. El panel es 20 veces más eficiente, pero la hoja se reproduce, se repara y guarda la energía sin baterías.", OK, "fa-scale-balanced") : nota("Pon la luz a 1 000 W/m² (pleno sol) y el ángulo en 0° para comparar en las mejores condiciones.", T.text3)}
          </>
        )}
        <div style={{ marginTop: 10, fontSize: 11, color: T.text3, lineHeight: 1.5 }}>En el diagrama de flujo el ancho de cada franja es proporcional a la energía; lo que cae hacia abajo son pérdidas, casi siempre calor.</div>
      </>
    );
  } else {
    control = (
      <>
        <div className="te-opts">
          {INVESTIGACIONES.map((x, i) => (
            <button key={x.id} className="te-opt te-inv" data-on={i === invIdx} onClick={() => elegirInv(i)} style={{ ["--tec" as string]: modoCol, background: i === invIdx ? `${modoCol}1f` : "transparent" }}>
              <i className={`fa-solid ${x.icono}`} style={{ marginRight: 7 }} />
              {x.etq}
            </button>
          ))}
        </div>

        {sub("1 · Tu pregunta: ¿qué vas a modificar y qué vas a medir?")}
        <div className="te-opts">
          {inv.vis.map((o, i) => (
            <button key={o.id} className="te-opt te-vi" data-on={viIdx === i} onClick={() => elegirVI(i)} style={{ ["--tec" as string]: ROL_DEF.vi.color, background: viIdx === i ? `${ROL_DEF.vi.color}1f` : "transparent" }}>
              Modifico: {o.corta}
            </button>
          ))}
        </div>
        {op && (
          <div className="te-opts" style={{ marginTop: 8 }}>
            {opsVD.map((o, i) => {
              const on = vdSel === i;
              const col = on ? (o.ok ? OK : WARN) : ROL_DEF.vd.color;
              return (
                <button key={i} className="te-opt te-vd" data-on={on} onClick={() => elegirVD(i)} style={{ ["--tec" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                  Mido: {o.etq}
                </button>
              );
            })}
          </div>
        )}
        {vdSel !== null && opsVD[vdSel] && nota(opsVD[vdSel]!.porque, opsVD[vdSel]!.ok ? OK : WARN, opsVD[vdSel]!.ok ? "fa-circle-check" : "fa-rotate-left")}
        {op && vdOk && (
          <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${modoCol}55`, fontSize: 13.5, color: "#fff", fontWeight: 800, lineHeight: 1.45 }}>
            «¿Cómo afecta {op.frase} a {op.vd.frase}?»
          </div>
        )}

        {op && vdOk && (
          <>
            {sub("2 · Tu hipótesis (antes de medir)")}
            <div style={{ fontSize: 12, color: T.text2, marginBottom: 7 }}>Al aumentar {op.frase}, {op.vd.frase}…</div>
            <div className="te-opts">
              {TENDENCIAS.map((h) => (
                <button key={h.id} className="te-opt te-hip" data-on={hipotesis === h.id} onClick={() => { setHipotesis(h.id); setConclusion(null); blip(); }} disabled={midiendo} style={{ ["--tec" as string]: modoCol, background: hipotesis === h.id ? `${modoCol}1f` : "transparent" }}>
                  <i className={`fa-solid ${h.icono}`} style={{ marginRight: 7 }} />
                  {h.etq}
                </button>
              ))}
            </div>
          </>
        )}

        {op && vdOk && hipotesis && (
          <>
            {sub("3 · Configura: clasifica cada variable")}
            <div style={{ display: "grid", gap: 6 }}>
              {facts.map((f, i) => {
                const mal = rolesRevisados && roles[i] !== f.rol;
                return (
                  <div key={i} className="te-fila" style={{ borderColor: mal ? `${WARN}88` : T.line }}>
                    <span style={{ fontSize: 12, color: "#fff", fontWeight: 800, flex: "1 1 150px" }}>{f.etq}</span>
                    <span style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {(["vi", "vd", "vc"] as Rol[]).map((r) => (
                        <button key={r} className="te-rol" data-on={roles[i] === r} onClick={() => asignarRol(i, r)} disabled={midiendo} aria-label={`${f.etq}: ${ROL_DEF[r].corta}`} style={{ ["--tec" as string]: ROL_DEF[r].color }}>
                          {ROL_DEF[r].corta}
                        </button>
                      ))}
                    </span>
                  </div>
                );
              })}
            </div>
            <button className="te-toggle te-revisar" onClick={revisarRoles} disabled={roles.some((r) => r === null)} style={{ marginTop: 9, ["--tec" as string]: modoCol }}>
              <i className="fa-solid fa-list-check" style={{ marginRight: 9, color: modoCol }} />
              Revisar la tabla de variables
            </button>
            {rolesRevisados &&
              nota(
                rolesOk
                  ? "Tabla correcta: cambias una sola variable, mides otra con números y mantienes constantes todas las demás."
                  : "Hay variables mal clasificadas (en naranja). Recuerda: solo una se modifica, solo una se mide y todo lo demás se mantiene constante para que no interfiera.",
                rolesOk ? OK : WARN,
                rolesOk ? "fa-circle-check" : "fa-rotate-left",
              )}
          </>
        )}

        {op && vdOk && hipotesis && rolesRevisados && rolesOk && (
          <>
            {sub(`4 · Diseña las pruebas: al menos ${MIN_NIVELES} niveles de ${op.corta.toLowerCase()}`)}
            <div className="te-opts">
              {op.niveles.map((n, i) => (
                <button key={i} className="te-opt te-nivel" data-on={nivelesSel.includes(i)} onClick={() => toggleNivel(i)} disabled={midiendo} style={{ ["--tec" as string]: ROL_DEF.vi.color, background: nivelesSel.includes(i) ? `${ROL_DEF.vi.color}1f` : "transparent" }}>
                  {n.etq}
                </button>
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <i className="fa-solid fa-repeat" style={{ color: "#a78bfa", width: 16 }} />
              <input type="range" aria-label="Repeticiones por nivel" className="te-range" min={1} max={5} step={1} value={reps} disabled={midiendo} onChange={(e) => cambiarReps(Number(e.target.value))} style={{ ["--tec" as string]: "#a78bfa" }} />
              <span style={{ width: 92, textAlign: "right", fontSize: 12.5, color: "#fff", fontWeight: 800, ...NUM }}>{reps} {reps === 1 ? "vez" : "veces"}</span>
            </label>
            <button className="te-toggle te-correr" onClick={correr} disabled={!puedeCorrer} style={{ marginTop: 10, ["--tec" as string]: accent }}>
              <i className={`fa-solid ${midiendo ? "fa-spinner fa-spin" : "fa-play"}`} style={{ marginRight: 9, color: accent }} />
              {midiendo ? "Midiendo…" : nivelesSel.length < MIN_NIVELES ? `Elige ${MIN_NIVELES - nivelesSel.length} ${MIN_NIVELES - nivelesSel.length === 1 ? "nivel" : "niveles"} más` : datos ? "Repetir el experimento" : "Correr las pruebas"}
            </button>
          </>
        )}

        {op && datos && (
          <>
            {sub("5 · Tabla de datos")}
            <div style={{ overflowX: "auto" }}>
              <table className="te-tabla">
                <thead>
                  <tr>
                    <th>{op.corta} ({op.unidad})</th>
                    {Array.from({ length: reps }, (_, k) => (
                      <th key={k}>Rep. {k + 1}</th>
                    ))}
                    <th>Promedio ({op.vd.unidad})</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.map((f, i) => (
                    <tr key={i} style={{ opacity: i < hechos ? 1 : 0.3 }}>
                      <td>{f.nivel.etq}</td>
                      {f.medidas.map((m, k) => (
                        <td key={k}>{i < hechos ? num(m, op.vd.dec) : "…"}</td>
                      ))}
                      <td style={{ color: "#fff", fontWeight: 900 }}>{i < hechos ? num(f.promedio, op.vd.dec) : "…"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {op && datosListos && hipotesis && (
          <>
            {sub("6 · Analiza: tu hipótesis decía que " + op.vd.frase + " " + TENDENCIAS.find((h) => h.id === hipotesis)!.etq)}
            <div className="te-opts">
              {[true, false].map((d) => {
                const on = conclusion === d;
                const col = on ? (d === confirma ? OK : WARN) : modoCol;
                return (
                  <button key={String(d)} className="te-opt te-concl" data-on={on} onClick={() => concluir(d)} disabled={conclusion !== null} style={{ ["--tec" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                    <i className={`fa-solid ${d ? "fa-thumbs-up" : "fa-thumbs-down"}`} style={{ marginRight: 7 }} />
                    Los datos {d ? "confirman" : "refutan"} mi hipótesis
                  </button>
                );
              })}
            </div>
            {conclusion !== null &&
              nota(
                <>
                  <strong>{conclusion === confirma ? "Conclusión correcta. " : "Revisa la tabla. "}</strong>
                  Los datos muestran que al aumentar {op.frase}, {op.vd.frase} {TENDENCIAS.find((h) => h.id === tendencia)!.etq}: tu hipótesis {confirma ? "se confirma" : "se refuta"}. {op.porque}{" "}
                  {!confirma && "Una hipótesis refutada no es un fracaso: es información nueva que corrige lo que pensabas."}{" "}
                  {reps < 3 ? "Con tan pocas repeticiones, un error de medición podría engañarte: repite cada prueba al menos 3 veces." : "Las repeticiones muestran la variación de la medición y hacen más confiable el promedio."}
                </>,
                conclusion === confirma ? OK : WARN,
                conclusion === confirma ? "fa-circle-check" : "fa-rotate-left",
              )}
            {conclusion !== null && conclusion !== confirma && (
              <button className="te-opt" data-on="false" onClick={() => setConclusion(null)} style={{ marginTop: 8, ["--tec" as string]: modoCol }}>
                <i className="fa-solid fa-rotate-left" style={{ marginRight: 7 }} />
                Concluir de nuevo
              </button>
            )}
          </>
        )}
        {rolErrores > 0 && !rolesOk && <div style={{ marginTop: 8, fontSize: 11, color: T.text3 }}>Revisiones con errores: {rolErrores}</div>}
      </>
    );
  }

  const nivelEscena = nivelActual ?? (op && nivelesSel.length ? nivelesSel[0]! : 0);

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes tePulse { 0%,100%{ box-shadow:0 0 0 0 var(--ted); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .te-live-dot { animation: tePulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .te-live-dot { animation:none; } }
        .te-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .te-grid { grid-template-columns: 1fr; } }
        .te-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .te-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .te-icobtn:hover { background:rgba(255,255,255,0.12); }
        .te-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .te-tab { cursor:pointer; border:1px solid var(--tec); border-radius:12px; padding:11px 8px; text-align:center; background:transparent; transition:all .15s; color:#fff; }
        .te-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .te-tab:hover { background:rgba(255,255,255,0.06); }
        .te-opts { display:flex; flex-wrap:wrap; gap:7px; }
        .te-opt { cursor:pointer; border:1px solid var(--tec); border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; color:#fff; background:transparent; transition:all .15s; }
        .te-opt[data-on="false"] { border-color:rgba(255,255,255,0.14); color:rgba(255,255,255,0.72); }
        .te-opt:hover:not(:disabled) { background:rgba(255,255,255,0.06); }
        .te-opt:disabled { cursor:default; }
        .te-opt:disabled[data-on="false"] { opacity:0.55; }
        .te-toggle { width:100%; cursor:pointer; border:1px solid var(--tec); border-radius:11px; padding:11px 14px; background:rgba(4,10,22,0.4); color:#fff; font-size:12.5px; font-weight:900; text-align:left; transition:all .15s; }
        .te-toggle:hover:not(:disabled) { background:rgba(255,255,255,0.07); }
        .te-toggle:disabled { cursor:default; opacity:0.6; }
        .te-range { flex:1; accent-color: var(--tec); min-width:0; }
        .te-cadena { display:flex; flex-wrap:wrap; align-items:center; gap:7px; }
        .te-eslabon { display:inline-flex; align-items:center; padding:6px 10px; border-radius:9px; border:1px dashed var(--tec); font-size:11.5px; font-weight:900; color:rgba(255,255,255,0.55); }
        .te-eslabon[data-on="true"] { border-style:solid; color:#fff; background:rgba(4,10,22,0.5); }
        .te-link { cursor:pointer; margin-left:8px; border:none; background:transparent; color:#67e8f9; font-size:12px; font-weight:900; padding:0; }
        .te-link:hover { text-decoration:underline; }
        .te-fila { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; padding:8px 10px; border-radius:10px; border:1px solid; background:rgba(4,10,22,0.35); }
        .te-rol { cursor:pointer; border:1px solid rgba(255,255,255,0.14); border-radius:8px; padding:5px 8px; font-size:11px; font-weight:800; color:rgba(255,255,255,0.7); background:transparent; transition:all .15s; }
        .te-rol[data-on="true"] { border-color:var(--tec); color:#fff; background:rgba(255,255,255,0.08); box-shadow:inset 0 0 0 1px var(--tec); }
        .te-rol:disabled { cursor:default; }
        .te-tabla { width:100%; border-collapse:collapse; font-size:12px; font-variant-numeric:tabular-nums; }
        .te-tabla th { text-align:left; font-size:10px; letter-spacing:.04em; color:rgba(255,255,255,0.5); font-weight:900; padding:6px 8px; border-bottom:1px solid rgba(255,255,255,0.14); white-space:nowrap; }
        .te-tabla td { padding:6px 8px; color:rgba(255,255,255,0.78); border-bottom:1px solid rgba(255,255,255,0.06); white-space:nowrap; transition:opacity .3s; }
        .te-opt:focus-visible, .te-tab:focus-visible, .te-toggle:focus-visible, .te-icobtn:focus-visible, .te-range:focus-visible, .te-rol:focus-visible, .te-link:focus-visible { outline:2px solid ${accent}; outline-offset:2px; }
        @media (max-width: 1000px){ .te-bottom { grid-template-columns: 1fr !important; } }
        .te-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px); opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .te-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .te-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61; background:linear-gradient(180deg,#06121e 0%,#040a16 100%);
          border-left:1px solid rgba(${color.rgba},0.32); box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; }
        .te-drawer[data-open="true"] { transform:translateX(0); }
        .te-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .te-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .te-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line}; background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .te-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .te-teoria-fab { position:absolute; bottom:16px; right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:9px; padding:11px 16px; border-radius:999px;
          border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800; background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .te-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateY(-1px); }
      `}</style>

      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="te-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="te-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--tec" as string]: col, background: on ? `${col}1f` : "transparent" }}>
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

      <div className="te-grid">
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
              <TiposScene
                vista={modo}
                modoColor={modoCol}
                resetNonce={resetNonce}
                fenomenoId={fenId}
                etapa={etapa}
                distanciaKm={distanciaKm}
                rayoNonce={rayoNonce}
                noche={noche}
                magma={magma}
                luzPct={luzPct}
                tecId={tecId}
                viento={viento}
                sitio={sitio}
                tempGeo={tempGeo}
                flujoGeo={flujoGeo}
                irradiancia={irradiancia}
                angulo={angulo}
                invId={inv.id}
                viIdx={viIdx ?? 0}
                nivelIdx={nivelEscena}
                midiendo={midiendo && nivelActual !== null}
                medido={datosListos}
                ensayoNonce={ensayoNonce}
              />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, right: 150, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, pointerEvents: "none" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)", maxWidth: "100%" }}>
                <span className="te-live-dot" style={{ ["--ted" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3, flexShrink: 0 }}>EN VIVO</span>
                <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...NUM }}>{chipVivo}</span>
              </div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="te-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría" aria-label="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="te-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"} aria-label={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="te-icobtn" onClick={reiniciar} title="Reiniciar" aria-label="Reiniciar">
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

            <button className="te-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
              Controles — {def.etq}
            </Eyebrow>
            <div style={{ marginTop: 12 }}>{control}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-bolt" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>¿Qué tienen en común un rayo y una hoja?</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #a78bfa55", background: "rgba(167,139,250,0.07)" }}>
            <Eyebrow>
              <i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: "#a78bfa" }} />
              Simulación A2
            </Eyebrow>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 800, lineHeight: 1.4, marginBottom: 8 }}>{A2.titulo}</div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{A2.descripcion}</div>
            <ol style={{ margin: "10px 0 0", paddingLeft: 18, display: "grid", gap: 6 }}>
              {A2.instrucciones.map((x, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {x}
                </li>
              ))}
            </ol>
            <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.5, marginTop: 10 }}>
              <strong style={{ color: "#fff" }}>Reporte esperado:</strong> {A2.reporteEsperado}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: T.text3, letterSpacing: "0.08em", margin: "12px 0 8px" }}>PARA REFLEXIONAR</div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 7 }}>
              {A2.preguntasReflexion.map((q, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="te-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow>
              <i className="fa-solid fa-circle-play" style={{ marginRight: 8, color: accent }} />
              Hechos (video A8 · {TITULO_A8})
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {HECHOS_A8.map((h, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />
              Glosario: fenómenos y tecnología (A5)
            </Eyebrow>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
              {GLOSARIO_A5.map((gi, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>
                    <i className="fa-solid fa-bolt" style={{ marginRight: 6, color: accent }} />
                    {gi.ejemplo}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, marginTop: 10 }}>
              <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A5}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />
              Glosario: diseño de investigaciones (A1)
            </Eyebrow>
            <div style={{ display: "grid", gap: 7, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
              {GLOSARIO_A1.map((gi, i) => (
                <div key={i} style={{ padding: "8px 11px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 11.5, fontWeight: 900, color: "#c4b5fd" }}>{gi.termino}. </span>
                  <span style={{ fontSize: 11, color: T.text2, lineHeight: 1.45 }}>{gi.definicion}</span>
                  <div style={{ fontSize: 10.5, color: T.text3, lineHeight: 1.4, marginTop: 4 }}>{gi.ejemplo}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.text2, marginTop: 10 }}>
              <strong style={{ color: "#fff" }}>Actividad:</strong> {ACTIVIDAD_A1}
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
          <div style={{ marginTop: 16 }}>
            <Eyebrow>
              <i className="fa-solid fa-comments" style={{ marginRight: 8, color: accent }} />
              Para reflexionar (A8 y A7)
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {REFLEXION.map((x, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          La simulación A2, el quiz A4, los glosarios A1 y A5, el texto A6, las preguntas del video A8 y la reflexión A7 son <strong>verbatim</strong> del material de la plataforma. Las cadenas de
          energía y las cifras de los fenómenos (rayo, calores específicos, flujo de calor interno de la Tierra, eficiencia fotosintética) son datos científicos publicados, redondeados. Son{" "}
          <strong>modelos simplificados</strong>: el aerogenerador (rotor de 90 m, 2 MW, Cp = 0.40, engranes y generador al 95 %), la planta geotérmica (40 % del máximo de Carnot, condensador a 40 °C,
          2 610 kJ por kg de vapor), el reparto de pérdidas del panel (20 %) y de la hoja (1 %), la conducción en una barra sin pérdidas laterales, el panel que pierde 0.4 % por °C y la curva de saturación
          de la fotosíntesis, que es ilustrativa. Los datos de la investigación se simulan con esos modelos y una pequeña variación aleatoria. Fuente: {FUENTE}
        </span>
      </div>

      <CasosCard accent={accent} rgba={color.rgba} mejor={mejorEstrellas} onResultado={registraEstrellas} playSfx={sfx} />

      <RetoQuizCard quiz={QUIZ_A4} accent={accent} rgba={color.rgba} aprobado={quizAprobado} onAprobado={() => setQuizAprobado(true)} playSfx={sfx} playPick={blip} mensajeAprobado="¡Aprobado! Sabes explicar fenómenos y aplicaciones de la energía." />

      <div style={{ ...card, padding: "20px 24px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-keyboard" style={{ marginRight: 8, color: accent }} />
          Completa el texto (A6)
        </Eyebrow>
        <div style={{ marginTop: 12 }}>
          <CompletaTexto data={HUECOS_A6} accent={accent} rgba={color.rgba} completado={textoOk} onCompletado={() => { setTextoOk(true); sfx(true); }} onAcierto={blip} onError={() => sfx(false)} />
        </div>
      </div>

      <div className="te-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="te-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="te-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="te-close" onClick={() => setDrawer(false)} title="Cerrar" aria-label="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="te-drawer-body">
          <FichaTeorica data={TIPOS_ENERGIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
