"use client";

/**
 * Laboratorio 3D — Separación de mezclas y destilación (CNEYT-I-P04).
 *
 * Dos escenarios en el mismo laboratorio (barra de modos de la escena):
 *  · «Separar» — explorador de los cuatro métodos: elige una mezcla y un
 *    método; si el método aprovecha la propiedad en que difieren sus
 *    componentes, las partículas viajan a su vaso; si no, la mezcla sigue
 *    revuelta.
 *  · «Destilar» — el alumno ARMA el equipo pieza por pieza, CARGA una mezcla,
 *    REGULA el mechero y destila. EXPERIMENTO CENTRAL: mantener la temperatura
 *    en la meseta de ebullición del componente volátil (el termómetro de la
 *    escena marca la zona segura). Si se pasa de temperatura o de volumen con
 *    fuego alto → EXPLOTA.
 *
 * Física y contenido verbatim en destilacion-data.ts (de la lectura ancla A1).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, SceneBoundary } from "./_kit";
import { LabShell, Bloque, Dato, Deslizador, BotonHerramienta } from "./_shell";
import type { CompVisual } from "./SeparacionMezclasScene";
import { MEZCLAS as MEZCLAS_EXP, METODOS, COMPONENTES, separa, type MetodoKey } from "./separacion-data";
import { FichaTeorica } from "./_ficha";
import { SEPARACION_FICHA } from "./separacion-ficha";
import {
  PIEZAS,
  ORDEN,
  MEZCLAS,
  CAP,
  SEGURO,
  PELIGRO,
  ROTURA_TEMP,
  CONTAMINA_TEMP,
  TICK,
  LLAMA_TARGET,
  LLAMA_RATE,
  fmt,
  type PiezaKey,
  type MezKey,
  type Fase,
  type Accidente,
  type Llama,
} from "./destilacion-data";
import { LabAudio } from "./destilacion-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";

const DestilacionScene = dynamic(() => import("./DestilacionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Montando el laboratorio 3D…</span>
    </div>
  ),
});

const SeparacionMezclasScene = dynamic(() => import("./SeparacionMezclasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-filter fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Preparando el explorador 3D…</span>
    </div>
  ),
});

const NO = "#FF5E5E";
const WARN = "#FBBF24";
const RETO_KEY = "cen-destilacion-reto";
/** La mejor marca de CADA mezcla (local a este equipo). Aparte de RETO_KEY, que guarda un número. */
const MEZCLAS_KEY = `${RETO_KEY}-mezclas`;

type Modo = "explorar" | "destilar";
type Op = { temp: number; volumen: number; destilado: number };
const PIEZAS_VACIO: Record<PiezaKey, boolean> = { soporte: false, matraz: false, mechero: false, termometro: false, refrigerante: false, colector: false };
const LLAMAS: Llama[] = ["off", "baja", "media", "alta"];
const LLAMA_ETQ: Record<Llama, string> = { off: "Apagado", baja: "Baja", media: "Media", alta: "Alta" };
const LLAMA_COL: Record<Llama, string> = { off: "#9FB0C6", baja: "#7FB6FF", media: "#FF9A3C", alta: "#FF7A2C" };

export function LabSeparacionMezclas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<Modo>("explorar");

  /* ── Estado del laboratorio de destilación ───────────────────────────── */
  const [piezas, setPiezas] = useState<Record<PiezaKey, boolean>>({ ...PIEZAS_VACIO });
  const [mezKey, setMezKey] = useState<MezKey>("agua-sal");
  const [carga, setCarga] = useState(120); // mL a cargar
  const [op, setOp] = useState<Op>({ temp: 22, volumen: 0, destilado: 0 });
  const opRef = useRef<Op>({ temp: 22, volumen: 0, destilado: 0 });
  const [llama, setLlama] = useState<Llama>("off");
  const [fase, setFase] = useState<Fase>("armar");
  const [accidente, setAccidente] = useState<Accidente>(null);
  const [contaminado, setContaminado] = useState(false);
  const [destNonce, setDestNonce] = useState(0);

  const [autoRotate, setAutoRotate] = useState(false);
  const [etiquetas, setEtiquetas] = useState(true); // etiquetas de las piezas principales
  const [eppListo, setEppListo] = useState(false); // equipo de protección puesto (entrada al lab)

  // curva de calentamiento (muestreo de temperatura en el tiempo)
  const [serie, setSerie] = useState<number[]>([]);

  // sonido sintetizado (opcional)
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabAudio | null>(null);

  // modo reto: estrellas de la corrida actual + mejor marca por mezcla (persistida)
  const [reto, setReto] = useState<{ estrellas: number; eff: number; rec: number } | null>(null);
  // La base guarda una sola mejor marca por laboratorio; el mapa de abajo
  // guarda además la de CADA mezcla, que es local a este equipo. Se conservan
  // los dos: el hook recupera la marca global entre dispositivos y el mapa
  // sigue diciendo cuál mezcla ya se dominó aquí.
  const { mejorEstrellas: mejorGlobal, registraEstrellas } = useEstrellas(RETO_KEY);
  const [mejores, setMejores] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const r = window.localStorage.getItem(MEZCLAS_KEY);
      return r ? (JSON.parse(r) as Record<string, number>) : {};
    } catch {
      return {};
    }
  });

  // logros
  const [logros, setLogros] = useState<Set<string>>(() => new Set<string>());
  const marca = (k: string) => setLogros((p) => (p.has(k) ? p : new Set(p).add(k)));

  const mez = MEZCLAS[mezKey];
  const armadoCompleto = ORDEN.every((k) => piezas[k]);
  const hirviendo = fase === "operar" && op.temp >= mez.volatilPE && op.volumen > 12 && !accidente;

  /* ── Bucle de operación: calentar / hervir / destilar / accidentes ────── */
  // La detección de fin/accidente vive aquí (callback asíncrono del timer),
  // no en un efecto reactivo, para no disparar renders en cascada.
  useEffect(() => {
    if (fase !== "operar") return;
    const id = setInterval(() => {
      const prev = opRef.current;
      const target = llama === "off" ? 22 : LLAMA_TARGET[llama];
      const rate = llama === "off" ? 0.03 : LLAMA_RATE[llama];
      const nt = prev.temp + (target - prev.temp) * rate;
      let { volumen, destilado } = prev;
      const derrameInminente = volumen > PELIGRO && llama === "alta";
      if (nt >= mez.volatilPE && nt <= ROTURA_TEMP && !derrameInminente) {
        const evap = Math.min(2.2, Math.max(0.25, (nt - mez.volatilPE) / 7) * 1.8);
        const ev = Math.min(evap, volumen);
        volumen -= ev;
        destilado += ev;
      }
      const next: Op = { temp: nt, volumen, destilado };
      opRef.current = next;
      setOp(next);
      setSerie((s) => (s.length >= 320 ? s : [...s, nt]));

      // meseta de ebullición: temperatura sostenida justo sobre el punto de ebullición
      if (nt >= mez.volatilPE && nt <= mez.volatilPE + 12 && volumen > 12) marca("meseta");

      if (nt > ROTURA_TEMP) {
        setAccidente("rotura");
        setFase("accidente");
        return;
      }
      if (nt >= mez.volatilPE && volumen > PELIGRO && llama === "alta") {
        setAccidente("derrame");
        setFase("accidente");
        return;
      }
      if (volumen <= 12 && destilado > 0.5) {
        marca("destilo");
        if (!contaminado) marca("limpio");
        // puntuación: limpio + recuperación alta = 3★; limpio = 2★; contaminado = 1★
        const eff = carga > 0 ? destilado / carga : 0;
        const est = contaminado ? 1 : eff >= 0.4 ? 3 : 2;
        setReto({ estrellas: est, eff, rec: destilado });
        setMejores((prev) => {
          const previo = prev[mezKey] ?? 0;
          if (est <= previo) return prev;
          const nx = { ...prev, [mezKey]: est };
          try {
            window.localStorage.setItem(MEZCLAS_KEY, JSON.stringify(nx));
          } catch {
            /* localStorage no disponible */
          }
          return nx;
        });
        registraEstrellas(est);
        setFase("listo");
        return;
      }
      if (mez.contaminaTemp !== undefined && nt > mez.contaminaTemp && volumen > 12) setContaminado(true);
    }, TICK);
    return () => clearInterval(id);
  }, [fase, llama, mez, mezKey, contaminado, carga, registraEstrellas]);

  /* ── Acciones ─────────────────────────────────────────────────────────── */
  const colocar = (k: PiezaKey) => {
    // Orden obligatorio: una pieza solo se coloca si todas las anteriores ya están.
    const idx = ORDEN.indexOf(k);
    if (piezas[k]) return;
    if (!ORDEN.slice(0, idx).every((x) => piezas[x])) return;
    setPiezas((p) => ({ ...p, [k]: true }));
    if (ORDEN.every((x) => x === k || piezas[x])) {
      marca("armo");
      setFase("cargar");
    }
  };
  const cargarMezcla = () => {
    const inicial: Op = { temp: 22, volumen: carga, destilado: 0 };
    opRef.current = inicial;
    setOp(inicial);
    setContaminado(false);
    setSerie([]);
    setReto(null);
    marca("cargo");
    if (carga <= SEGURO) marca("seguro");
    setLlama("off");
    setFase("operar");
  };
  const repetir = () => {
    const vacio: Op = { temp: 22, volumen: 0, destilado: 0 };
    opRef.current = vacio;
    setOp(vacio);
    setLlama("off");
    setAccidente(null);
    setContaminado(false);
    setSerie([]);
    setReto(null);
    setFase("cargar");
    setDestNonce((n) => n + 1);
  };
  const reiniciarTodo = () => {
    const vacio: Op = { temp: 22, volumen: 0, destilado: 0 };
    opRef.current = vacio;
    setPiezas({ ...PIEZAS_VACIO });
    setOp(vacio);
    setLlama("off");
    setAccidente(null);
    setContaminado(false);
    setSerie([]);
    setReto(null);
    setFase("armar");
    setDestNonce((n) => n + 1);
  };
  const siguienteLlama = () => setLlama((l) => LLAMAS[(LLAMAS.indexOf(l) + 1) % LLAMAS.length]!);
  const cambiarModo = (m: Modo) => {
    // Nunca se deja el mechero encendido sin vigilancia al salir del escenario.
    if (m !== "destilar" && fase === "operar") setLlama("off");
    setModo(m);
  };

  /* ── Sonido sintetizado (opcional, se crea tras gesto del usuario) ─────── */
  const toggleSonido = async () => {
    if (!sonido) {
      if (!audioRef.current) audioRef.current = new LabAudio();
      await audioRef.current.enable();
      setSonido(true);
    } else {
      audioRef.current?.mute();
      setSonido(false);
    }
  };

  // Ebullición + goteo del condensado
  useEffect(() => {
    if (!sonido) return;
    const a = audioRef.current;
    if (!a) return;
    a.setBoiling(hirviendo);
    if (hirviendo) a.startDrips();
    else a.stopDrips();
  }, [sonido, hirviendo]);

  // Soplido del mechero según intensidad (solo mientras se opera)
  useEffect(() => {
    if (!sonido) return;
    audioRef.current?.setFlame(fase === "operar" ? llama : "off");
  }, [sonido, llama, fase]);

  // Estallido al accidente
  useEffect(() => {
    if (!sonido || !accidente) return;
    audioRef.current?.explosion();
  }, [sonido, accidente]);

  // Liberar el AudioContext al desmontar
  useEffect(() => () => audioRef.current?.dispose(), []);

  /* ── Estado en vivo de la destilación ─────────────────────────────────── */
  const { estado } = useMemo(() => {
    if (fase === "armar") return { estado: armadoCompleto ? "Equipo armado" : "Arma el equipo", estadoColor: armadoCompleto ? OK : "#8AB4FF" };
    if (fase === "cargar") return { estado: "Carga la mezcla", estadoColor: "#8AB4FF" };
    if (fase === "operar") return hirviendo ? { estado: "Destilando…", estadoColor: OK } : llama === "off" ? { estado: "Enciende el mechero", estadoColor: "#8AB4FF" } : { estado: "Calentando…", estadoColor: WARN };
    if (fase === "listo") return { estado: contaminado ? "Destilado contaminado" : "Destilación completa", estadoColor: contaminado ? WARN : OK };
    return { estado: accidente === "rotura" ? "¡El matraz estalló!" : "¡Se derramó la mezcla!", estadoColor: NO };
  }, [fase, armadoCompleto, hirviendo, llama, contaminado, accidente]);

  /* ── Explorador (4 métodos) ──────────────────────────────────────────── */
  const [mezclaKey, setMezclaKey] = useState("arena-agua");
  const [metodoKey, setMetodoKey] = useState<MetodoKey>("filtracion");
  const [progreso, setProgreso] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoRotateExp, setAutoRotateExp] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [interactuo, setInteractuo] = useState(false);
  const [exitos, setExitos] = useState<Set<string>>(() => new Set<string>());
  const [falloAlguna, setFalloAlguna] = useState(false);

  const mezclaExp = useMemo(() => MEZCLAS_EXP.find((m) => m.key === mezclaKey)!, [mezclaKey]);
  const metodo = METODOS.find((m) => m.key === metodoKey)!;
  const funciona = separa(mezclaExp, metodoKey);
  const comps = useMemo<[CompVisual, CompVisual]>(
    () => [
      { key: mezclaExp.comps[0].c, nombre: COMPONENTES[mezclaExp.comps[0].c].nombre, color: COMPONENTES[mezclaExp.comps[0].c].color },
      { key: mezclaExp.comps[1].c, nombre: COMPONENTES[mezclaExp.comps[1].c].nombre, color: COMPONENTES[mezclaExp.comps[1].c].color },
    ],
    [mezclaExp],
  );

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgreso((p) => {
        const np = Math.min(1, p + 0.02);
        if (np >= 1) {
          setPlaying(false);
          if (funciona) setExitos((prev) => (prev.has(mezclaKey) ? prev : new Set(prev).add(mezclaKey)));
          else setFalloAlguna(true);
        }
        return np;
      });
    }, 32);
    return () => clearInterval(id);
  }, [playing, funciona, mezclaKey]);

  const completaExp = progreso >= 1;
  const exitoExp = completaExp && funciona;
  const estadoExp = !completaExp ? (playing ? "Separando…" : "Listo para separar") : exitoExp ? "¡Separación lograda!" : "No se separó";
  const separar = () => {
    setInteractuo(true);
    if (progreso >= 1) setProgreso(0);
    setPlaying(true);
  };
  const elegirMezcla = (k: string) => { setMezclaKey(k); setProgreso(0); setPlaying(false); };
  const elegirMetodo = (k: MetodoKey) => { setMetodoKey(k); setProgreso(0); setPlaying(false); };

  /* ── Misiones: explorador primero (rápido), luego la destilación ───────── */
  const objetivos = [
    { txt: "Explorador: ejecuta una separación", done: interactuo },
    { txt: "Explorador: separa una mezcla correctamente", done: exitos.size >= 1 },
    { txt: "Explorador: comprueba que un método equivocado no separa", done: falloAlguna },
    { txt: "Explorador: separa correctamente las 4 mezclas", done: exitos.size >= 4 },
    { txt: "Destilación: equípate con seguridad", done: eppListo },
    { txt: "Destilación: arma el equipo", done: logros.has("armo") },
    { txt: "Destilación: carga la mezcla", done: logros.has("cargo") },
    { txt: "Destilación: trabaja dentro del límite seguro", done: logros.has("seguro") },
    { txt: "Destilación: sube la llama y sostén la temperatura sobre la ebullición (meseta)", done: logros.has("meseta") },
    { txt: "Destilación: obtén destilado", done: logros.has("destilo") },
    { txt: "Destilación: mantén el destilado limpio", done: logros.has("limpio") },
    { txt: "Destilación: resuelve los cálculos (pestaña Reto)", done: logros.has("calculo") },
    { txt: "Destilación: consigue una destilación de 3★", done: Math.max(mejores[mezKey] ?? 0, mejorGlobal) >= 3 },
  ];

  /* ── Lecturas cortas sobre la escena ──────────────────────────────────── */
  const lectura =
    modo === "explorar"
      ? `${metodo.nombre} · ${estadoExp}`
      : fase === "operar" || fase === "listo"
        ? `${fmt(op.temp)} °C · ${estado} · ${fmt(op.destilado)} mL`
        : estado;

  const fallbackDest = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent }}>
        <i className="fa-solid fa-flask" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Destilación de {mez.nombre.toLowerCase()}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D. La idea: el componente volátil hierve primero ({fmt(mez.volatilPE)} °C), su vapor se condensa y se recoge; el residuo ({mez.residuo}) queda en el matraz.
      </div>
    </div>
  );
  const fallbackExp = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent }}>
        <i className="fa-solid fa-filter" />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{mezclaExp.nombre}</div>
      <div style={{ fontSize: 14, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>Tu equipo no puede mostrar la vista 3D, pero la idea sigue: cada mezcla se separa con el método que aprovecha la propiedad en que difieren sus componentes.</div>
    </div>
  );

  /* ── Termómetro-medidor sobre la escena de destilación ─────────────────── */
  const T_MIN = 15;
  const T_MAX = ROTURA_TEMP + 10;
  const pct = (t: number) => `${(100 - ((Math.min(T_MAX, Math.max(T_MIN, t)) - T_MIN) / (T_MAX - T_MIN)) * 100).toFixed(1)}%`;
  const corte = mez.contaminaTemp ?? CONTAMINA_TEMP;
  const finVerde = mez.contaminaTemp !== undefined ? corte : ROTURA_TEMP - 14;
  const gradiente = `linear-gradient(180deg, ${NO} 0%, ${NO} ${pct(ROTURA_TEMP - 14)}, ${WARN} ${pct(ROTURA_TEMP - 14)}, ${WARN} ${pct(finVerde)}, ${OK} ${pct(finVerde)}, ${OK} ${pct(mez.volatilPE)}, #2b5d8c ${pct(mez.volatilPE)}, #2b5d8c 100%)`;
  const mostrarMedidor = modo === "destilar" && eppListo && (fase === "operar" || fase === "listo" || fase === "accidente");

  const escenaDestilar = (
    <div style={{ position: "absolute", inset: 0 }}>
      <SceneBoundary fallback={fallbackDest}>
        <DestilacionScene
          piezas={piezas}
          colorLiq={mez.colorLiq}
          colorDest={contaminado ? "#BcCBD6" : mez.colorDest}
          residuoSolido={mez.residuoSolido}
          tieneResiduo={op.volumen <= 12 && fase === "listo"}
          volumen={op.volumen}
          destilado={op.destilado}
          temp={op.temp}
          llama={llama}
          hirviendo={hirviendo}
          fase={fase}
          accidente={accidente}
          accent={accent}
          autoRotate={autoRotate && fase !== "operar"}
          resetNonce={destNonce}
          mostrarVacia={eppListo}
          etiquetas={etiquetas}
        />
      </SceneBoundary>

      {mostrarMedidor && (
        <div className="sm-gauge" aria-label={`Temperatura ${fmt(op.temp)} grados`}>
          <div className="sm-gauge-tit">°C</div>
          <div className="sm-gauge-track" style={{ background: gradiente }}>
            <span className="sm-gauge-pe" style={{ top: pct(mez.volatilPE) }}>{fmt(mez.volatilPE)}</span>
            <span className="sm-gauge-marca" style={{ top: pct(op.temp) }}>
              <b>{fmt(op.temp)}</b>
            </span>
          </div>
          <div className="sm-gauge-pie" style={{ color: op.temp > ROTURA_TEMP - 14 ? NO : op.temp >= mez.volatilPE ? OK : "#9FB0C6" }}>
            {op.temp > ROTURA_TEMP - 14 ? "¡baja!" : op.temp >= mez.volatilPE ? "hierve" : "calienta"}
          </div>
        </div>
      )}

      {fase === "listo" && (
        <div className="sm-banner" style={{ borderColor: `${OK}88` }}>
          <i className="fa-solid fa-circle-check" style={{ color: OK }} aria-hidden /> Destilación lista: resuelve los cálculos en la pestaña <strong>Reto</strong>.
        </div>
      )}

      {fase === "accidente" && (
        <div className="sm-banner" style={{ borderColor: `${NO}88`, background: "rgba(40,8,12,0.92)" }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: NO }} aria-hidden />{" "}
          <span>
            <strong style={{ color: "#fff" }}>{accidente === "rotura" ? "El matraz se sobrecalentó y estalló." : "El matraz estaba demasiado lleno y la mezcla hirviendo se derramó."}</strong>{" "}
            {accidente === "rotura"
              ? `Nunca pases de ${fmt(ROTURA_TEMP)} °C: mantén la temperatura cerca de ${fmt(mez.volatilPE)} °C.`
              : `Carga como máximo ${fmt(SEGURO)} mL o usa una llama más baja.`}
          </span>
        </div>
      )}

      {!eppListo && <EppGate accent={accent} rgba={color.rgba} onEntrar={() => setEppListo(true)} />}
    </div>
  );

  const escenaExplorar = (
    <div style={{ position: "absolute", inset: 0 }}>
      <SceneBoundary fallback={fallbackExp}>
        <SeparacionMezclasScene mezclaKey={mezclaExp.key} comps={comps} funciona={funciona} metodoKey={metodoKey} progreso={progreso} accent={accent} autoRotate={autoRotateExp} resetNonce={resetNonce} />
      </SceneBoundary>
    </div>
  );

  /* ── Panel: controles de cada escenario ───────────────────────────────── */
  const pasos: Fase[] = ["armar", "cargar", "operar", "listo"];
  const pasoActual = pasos.indexOf(fase === "accidente" ? "operar" : fase);

  const controlesExplorar = (
    <>
      <Bloque titulo="Mezcla a separar" icono="fa-flask-vial">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
          {MEZCLAS_EXP.map((m) => {
            const on = m.key === mezclaKey;
            const done = exitos.has(m.key);
            return (
              <button key={m.key} type="button" className="sm-opt" data-on={on} onClick={() => elegirMezcla(m.key)}>
                <span style={{ display: "flex", gap: 4 }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: COMPONENTES[m.comps[0].c].color, border: "1px solid rgba(255,255,255,0.25)" }} />
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: COMPONENTES[m.comps[1].c].color, border: "1px solid rgba(255,255,255,0.25)" }} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>{m.nombre}</span>
                {done && <i className="fa-solid fa-circle-check" style={{ color: OK }} aria-hidden />}
              </button>
            );
          })}
        </div>
        <p style={{ margin: 0, color: accent, fontWeight: 700 }}>
          <i className="fa-solid fa-flask-vial" aria-hidden /> Sus componentes difieren en: {mezclaExp.propiedad}
        </p>
      </Bloque>

      <Bloque titulo="Método de separación" icono={metodo.icono}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
          {METODOS.map((m) => (
            <button key={m.key} type="button" className="sm-opt" data-on={m.key === metodoKey} onClick={() => elegirMetodo(m.key)}>
              <i className={`fa-solid ${m.icono}`} style={{ color: m.key === metodoKey ? accent : T.text3 }} aria-hidden />
              <span style={{ flex: 1, minWidth: 0 }}>{m.nombre}</span>
            </button>
          ))}
        </div>
        <p style={{ margin: 0, color: T.text2, fontStyle: "italic" }}>{metodo.desc}</p>
        <button type="button" className="sm-primary" onClick={separar} disabled={playing}>
          <i className={`fa-solid ${playing ? "fa-spinner fa-spin" : completaExp ? "fa-rotate-right" : "fa-play"}`} aria-hidden /> {playing ? "Separando…" : completaExp ? "Repetir" : "Separar"}
        </button>
      </Bloque>

      <Bloque titulo="Resultado" icono="fa-circle-check">
        {completaExp ? (
          <div style={{ borderRadius: 13, border: `1px solid ${exitoExp ? OK : NO}55`, background: `${exitoExp ? OK : NO}14`, padding: "12px 14px", display: "flex", gap: 12 }}>
            <i className={`fa-solid ${exitoExp ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: exitoExp ? OK : NO, fontSize: 18, marginTop: 2 }} aria-hidden />
            <div style={{ color: T.text2 }}>
              {exitoExp ? (
                <>
                  <strong style={{ color: T.text }}>¡Separación lograda!</strong> {mezclaExp.explica}
                </>
              ) : (
                <>
                  <strong style={{ color: T.text }}>Este método no separa esta mezcla.</strong> Para «{mezclaExp.nombre}» necesitas un método que aproveche su propiedad: <strong style={{ color: T.text }}>{mezclaExp.propiedad}</strong>.
                </>
              )}
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, color: T.text2 }}>Pulsa «Separar» para ver si este método funciona con esta mezcla.</p>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
          <Dato label="avance" value={`${fmt(progreso * 100)} %`} col={accent} />
          <Dato label="¿separa?" value={funciona ? "Sí" : "No"} col={funciona ? OK : NO} />
          <Dato label="logradas" value={`${exitos.size}/4`} col={exitos.size >= 4 ? OK : undefined} />
        </div>
      </Bloque>
    </>
  );

  const controlesDestilar = (
    <>
      <Bloque titulo="Pasos" icono="fa-list-ol">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 6 }}>
          {pasos.map((f, i) => {
            const active = i === pasoActual;
            const past = i < pasoActual;
            return (
              <div key={f} style={{ display: "grid", justifyItems: "center", gap: 4, padding: "8px 2px", borderRadius: 10, border: `1px solid ${active ? accent : past ? `${OK}66` : T.line}`, background: active ? `rgba(${color.rgba},0.18)` : past ? `${OK}14` : "transparent", color: active ? "#fff" : past ? OK : T.text3, fontSize: 14, fontWeight: 800, textTransform: "capitalize" }}>
                <span>{past ? <i className="fa-solid fa-check" aria-hidden /> : i + 1}</span>
                <span>{f}</span>
              </div>
            );
          })}
        </div>
      </Bloque>

      {fase === "armar" && (
        <Bloque titulo="Arma el equipo (en orden)" icono="fa-screwdriver-wrench">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            {ORDEN.map((k) => {
              const def = PIEZAS.find((p) => p.key === k)!;
              const done = piezas[k];
              const idx = ORDEN.indexOf(k);
              const next = !done && ORDEN.slice(0, idx).every((p) => piezas[p]);
              return (
                <button key={k} type="button" className="sm-opt" data-on={next} data-done={done} disabled={done || !next || !eppListo} onClick={() => colocar(k)} title={next || done ? def.ayuda : "Coloca primero las piezas anteriores"}>
                  <i className={`fa-solid ${done ? "fa-circle-check" : def.icono}`} style={{ color: done ? OK : undefined }} aria-hidden />
                  <span style={{ flex: 1, minWidth: 0 }}>{def.nombre}</span>
                </button>
              );
            })}
          </div>
          <p style={{ margin: 0, color: T.text2 }}>{eppListo ? "Coloca las piezas en el orden marcado: la siguiente se ilumina." : "Primero ponte el equipo de protección en la escena."}</p>
        </Bloque>
      )}

      {fase === "cargar" && (
        <Bloque titulo="Carga la mezcla" icono="fa-fill-drip">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            {(Object.keys(MEZCLAS) as MezKey[]).map((k) => (
              <button key={k} type="button" className="sm-opt" data-on={k === mezKey} onClick={() => setMezKey(k)}>
                <i className="fa-solid fa-droplet" aria-hidden />
                <span style={{ flex: 1, minWidth: 0 }}>{MEZCLAS[k].nombre}</span>
              </button>
            ))}
          </div>
          <Deslizador
            label="volumen a cargar"
            icon="fa-vial"
            colr={carga > PELIGRO ? NO : carga > SEGURO ? WARN : accent}
            valor={`${fmt(carga)} mL ${carga > PELIGRO ? "· ¡peligro!" : carga > SEGURO ? "· arriesgado" : "· seguro"}`}
            min={20}
            max={CAP}
            step={5}
            value={carga}
            onChange={setCarga}
            hintL="20 mL"
            hintR={`${CAP} mL`}
          />
          <button type="button" className="sm-primary" onClick={cargarMezcla}>
            <i className="fa-solid fa-fill-drip" aria-hidden /> Cargar mezcla
          </button>
        </Bloque>
      )}

      {fase === "operar" && (
        <Bloque titulo="Regula el mechero" icono="fa-fire">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 6 }}>
            {LLAMAS.map((l) => (
              <button key={l} type="button" className="sm-llama" data-on={l === llama} style={{ ["--llc" as string]: LLAMA_COL[l] }} onClick={() => setLlama(l)}>
                {LLAMA_ETQ[l]}
              </button>
            ))}
          </div>
          <p style={{ margin: 0, color: T.text2 }}>
            Mantén la temperatura cerca de <strong style={{ color: T.text }}>{fmt(mez.volatilPE)} °C</strong>. Pasar de {fmt(ROTURA_TEMP)} °C rompe el matraz.
          </p>
        </Bloque>
      )}

      {(fase === "listo" || fase === "accidente") && (
        <Bloque titulo={fase === "listo" ? "Destilación terminada" : "Algo salió mal"} icono={fase === "listo" ? "fa-circle-check" : "fa-triangle-exclamation"}>
          {fase === "listo" && <p style={{ margin: 0, color: T.text2 }}>Abre la pestaña <strong style={{ color: T.text }}>Reto</strong> para resolver los cálculos de tu destilación.</p>}
          <button type="button" className="sm-primary" onClick={repetir}>
            <i className="fa-solid fa-rotate-right" aria-hidden /> Destilar otra vez
          </button>
          <button type="button" className="sm-ghost" onClick={reiniciarTodo}>
            <i className="fa-solid fa-screwdriver-wrench" aria-hidden /> Rearmar equipo
          </button>
        </Bloque>
      )}

      {(fase === "operar" || fase === "listo" || fase === "accidente") && (
        <Bloque titulo="Instrumentos" icono="fa-gauge-high">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            <Dato label="temperatura" value={`${fmt(op.temp)} °C`} col={op.temp >= ROTURA_TEMP - 12 ? NO : op.temp >= mez.volatilPE ? WARN : accent} />
            <Dato label="en el matraz" value={`${fmt(Math.max(0, op.volumen))} mL`} col={op.volumen > PELIGRO ? NO : undefined} />
            <Dato label="destilado" value={`${fmt(op.destilado)} mL`} col={OK} />
            <Dato label="ebullición" value={`${fmt(mez.volatilPE)} °C`} col={OK} />
          </div>
          {serie.length > 1 && <CurvaCalentamiento serie={serie} volatilPE={mez.volatilPE} accent={accent} hirviendo={hirviendo} />}
        </Bloque>
      )}
    </>
  );

  return (
    <LabShell
      accent={accent}
      rgba={color.rgba}
      retoKey={RETO_KEY}
      escena={
        <>
          <style>{CSS_SM(accent, color.rgba)}</style>
          {modo === "destilar" ? escenaDestilar : escenaExplorar}
        </>
      }
      modos={{
        opciones: [
          { id: "explorar", etiqueta: "Separar", icono: "fa-filter" },
          { id: "destilar", etiqueta: "Destilar", icono: "fa-fire" },
        ],
        valor: modo,
        cambiar: (id) => cambiarModo(id as Modo),
      }}
      herramientas={
        modo === "destilar" ? (
          <>
            <BotonHerramienta icono={sonido ? "fa-volume-high" : "fa-volume-xmark"} titulo={sonido ? "Silenciar" : "Activar sonido"} activo={sonido} onClick={toggleSonido} />
            {fase === "operar" && <BotonHerramienta icono="fa-fire" titulo={`Mechero: ${LLAMA_ETQ[llama]} (pulsa para subir)`} activo={llama !== "off"} onClick={siguienteLlama} />}
            <BotonHerramienta icono="fa-tags" titulo="Etiquetas de las piezas" activo={etiquetas} onClick={() => setEtiquetas((v) => !v)} />
            <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotate} onClick={() => setAutoRotate((v) => !v)} />
            <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar todo" onClick={reiniciarTodo} />
          </>
        ) : (
          <>
            <BotonHerramienta icono={playing ? "fa-spinner" : "fa-play"} titulo="Separar" activo={playing} onClick={separar} />
            <BotonHerramienta icono="fa-arrows-rotate" titulo="Girar automáticamente" activo={autoRotateExp} onClick={() => setAutoRotateExp((v) => !v)} />
            <BotonHerramienta icono="fa-rotate-left" titulo="Reiniciar" onClick={() => { setProgreso(0); setPlaying(false); setResetNonce((n) => n + 1); }} />
          </>
        )
      }
      lectura={lectura}
      objetivos={objetivos}
      pestanas={[
        {
          id: "controles",
          etiqueta: "Controles",
          icono: "fa-sliders",
          contenido: modo === "destilar" ? controlesDestilar : controlesExplorar,
        },
        {
          id: "reto",
          etiqueta: "Reto",
          icono: "fa-trophy",
          contenido:
            fase === "listo" ? (
              <CalcCard accent={accent} rgba={color.rgba} mez={mez} destilado={op.destilado} contaminado={contaminado} reto={reto} mejor={mejores[mezKey] ?? 0} onResuelto={() => marca("calculo")} />
            ) : (
              <Bloque titulo="Reto de la destilación" icono="fa-trophy">
                <p style={{ margin: 0, color: T.text2 }}>
                  Termina una destilación (modo «Destilar») para desbloquear los cálculos: punto de ebullición, mililitros recogidos y residuo. Tus estrellas dependen de que el destilado quede limpio y de cuánto recuperes.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                  {(Object.keys(MEZCLAS) as MezKey[]).map((k) => (
                    <Dato key={k} label={MEZCLAS[k].nombre} value={`${mejores[k] ?? 0} ★`} col={(mejores[k] ?? 0) >= 3 ? OK : undefined} />
                  ))}
                </div>
              </Bloque>
            ),
        },
        {
          id: "teoria",
          etiqueta: "Teoría",
          icono: "fa-book-open",
          contenido: (
            <>
              <Bloque titulo="Separar una mezcla" icono="fa-lightbulb">
                <p style={{ margin: 0, color: T.text2 }}>
                  Una mezcla se separa por <strong style={{ color: T.text }}>métodos físicos</strong> (no cambia la naturaleza de las sustancias). El método correcto aprovecha la <strong style={{ color: T.text }}>propiedad en que difieren</strong> sus componentes: tamaño, densidad, punto de ebullición o magnetismo.
                </p>
              </Bloque>
              <Bloque titulo="Destilación" icono="fa-fire">
                <p style={{ margin: 0, color: T.text2 }}>
                  La <strong style={{ color: T.text }}>destilación</strong> separa una mezcla aprovechando el <strong style={{ color: T.text }}>punto de ebullición</strong>: el componente volátil hierve primero, su vapor se condensa en el refrigerante y se recoge puro; el residuo queda en el matraz. {mez.explica}
                </p>
              </Bloque>
              <Bloque titulo="Ficha teórica" icono="fa-book">
                <FichaTeorica data={SEPARACION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
              </Bloque>
            </>
          ),
        },
      ]}
    />
  );
}

/* ── Estilos propios (clases sm-*) ────────────────────────────────────────── */
const CSS_SM = (accent: string, rgba: string) => `
.sm-opt { cursor:pointer; display:flex; align-items:center; gap:9px; padding:10px 11px; border-radius:12px; text-align:left;
  border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; min-width:0; transition:all .14s; }
.sm-opt:hover:not(:disabled) { border-color:${T.lineStrong}; color:#fff; }
.sm-opt[data-on="true"] { border-color:${accent}; background:rgba(${rgba},0.2); color:#fff; box-shadow:0 0 14px -6px ${accent}; }
.sm-opt[data-done="true"] { border-color:${OK}66; background:${OK}18; color:${OK}; }
.sm-opt:disabled { opacity:0.45; cursor:default; }
.sm-primary { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 18px; width:100%;
  border-radius:12px; border:none; background:${accent}; color:#04121f; font-size:15px; font-weight:800; transition:all .15s; }
.sm-primary:hover:not(:disabled) { filter:brightness(1.08); }
.sm-primary:disabled { opacity:0.45; cursor:default; }
.sm-ghost { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 16px; width:100%; border-radius:12px;
  border:1px solid ${T.line}; background:${T.glass}; color:${T.text}; font-size:14px; font-weight:700; }
.sm-ghost:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; }
.sm-llama { cursor:pointer; padding:11px 2px; border-radius:11px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2}; font-size:14px; font-weight:800; }
.sm-llama[data-on="true"] { background:var(--llc); color:#04121f; border-color:transparent; }
.calc-in { width:100%; background:${T.inset}; border:1px solid ${T.line}; border-radius:10px; color:#fff; font-size:16px; font-weight:800; padding:9px 12px; outline:none; }
.calc-in:focus { border-color:${accent}; }
.sm-gauge { position:absolute; left:12px; top:76px; width:100px; height:min(230px, 38%); display:grid; grid-template-rows:auto 1fr auto; gap:5px; justify-items:center;
  padding:8px 6px; border-radius:14px; background:rgba(4,10,22,0.78); border:1px solid ${T.line}; backdrop-filter:blur(8px); z-index:3; }
.sm-gauge-tit { font-size:14px; font-weight:900; color:#fff; }
.sm-gauge-track { position:relative; justify-self:start; margin-left:40px; width:14px; height:100%; border-radius:99px; min-height:90px; }
.sm-gauge-pe { position:absolute; left:20px; transform:translateY(-50%); font-size:14px; font-weight:900; color:${OK}; font-family:ui-monospace,monospace; }
.sm-gauge-marca { position:absolute; left:-6px; right:-6px; height:0; border-top:3px solid #fff; transition:top .12s linear; }
.sm-gauge-marca b { position:absolute; right:calc(100% + 4px); top:-11px; font-size:14px; color:#fff; font-family:ui-monospace,monospace; text-shadow:0 1px 4px #000; }
.sm-gauge-pie { font-size:14px; font-weight:900; }
.sm-banner { position:absolute; top:76px; left:50%; transform:translateX(-50%); width:min(calc(100% - 24px), 520px); z-index:4; display:flex; gap:10px; align-items:flex-start;
  padding:11px 14px; border-radius:14px; border:1px solid ${T.line}; background:rgba(4,16,30,0.92); backdrop-filter:blur(10px); color:${T.text2}; font-size:14px; line-height:1.4; }
@media (max-width: 640px) { .sm-gauge { display:none; } }
`;

/* ── Curva de calentamiento (T° vs tiempo, resalta la meseta de ebullición) ── */
function CurvaCalentamiento({ serie, volatilPE, accent, hirviendo }: { serie: number[]; volatilPE: number; accent: string; hirviendo: boolean }) {
  const W = 300;
  const H = 140;
  const PAD_L = 38;
  const PAD_B = 24;
  const PAD_T = 8;
  const PAD_R = 8;
  const iw = W - PAD_L - PAD_R;
  const ih = H - PAD_T - PAD_B;
  const tMin = 15;
  const tMax = Math.max(ROTURA_TEMP, volatilPE + 20);
  const x = (i: number) => PAD_L + (serie.length <= 1 ? 0 : (i / (serie.length - 1)) * iw);
  const y = (t: number) => PAD_T + ih - ((Math.min(tMax, Math.max(tMin, t)) - tMin) / (tMax - tMin)) * ih;
  const pts = serie.map((t, i) => `${x(i).toFixed(1)},${y(t).toFixed(1)}`).join(" ");
  const last = serie[serie.length - 1] ?? tMin;
  const yPE = y(volatilPE);
  const yRot = y(ROTURA_TEMP);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", color: T.text3 }}>CURVA DE CALENTAMIENTO</span>
        {hirviendo && <span style={{ fontSize: 14, fontWeight: 800, color: OK }}>● meseta de ebullición</span>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img" aria-label="Curva de calentamiento: temperatura contra tiempo">
        {/* línea de ebullición */}
        <line x1={PAD_L} y1={yPE} x2={W - PAD_R} y2={yPE} stroke={OK} strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
        <text x={PAD_L - 4} y={yPE + 3} textAnchor="end" fontSize={12} fill={OK} fontWeight={700}>
          {fmt(volatilPE)}°
        </text>
        {/* línea de rotura */}
        <line x1={PAD_L} y1={yRot} x2={W - PAD_R} y2={yRot} stroke={NO} strokeWidth={1} strokeDasharray="2 3" opacity={0.6} />
        <text x={PAD_L - 4} y={yRot + 3} textAnchor="end" fontSize={12} fill={NO} fontWeight={700}>
          {fmt(ROTURA_TEMP)}°
        </text>
        {/* eje */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + ih} stroke={T.line} strokeWidth={1} />
        <line x1={PAD_L} y1={PAD_T + ih} x2={W - PAD_R} y2={PAD_T + ih} stroke={T.line} strokeWidth={1} />
        <text x={(PAD_L + W - PAD_R) / 2} y={H - 6} textAnchor="middle" fontSize={12} fill={T.text3}>
          tiempo →
        </text>
        {/* curva */}
        <polyline points={pts} fill="none" stroke={accent} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {/* punto actual */}
        <circle cx={x(serie.length - 1)} cy={y(last)} r={3} fill="#fff" stroke={accent} strokeWidth={1.5} />
      </svg>
    </div>
  );
}

/* ── Tarjeta de cálculos flotante ───────────────────────────────────────── */
function CalcCard({
  accent,
  rgba,
  mez,
  destilado,
  contaminado,
  reto,
  mejor,
  onResuelto,
}: {
  accent: string;
  rgba: string;
  mez: (typeof MEZCLAS)[MezKey];
  destilado: number;
  contaminado: boolean;
  reto: { estrellas: number; eff: number; rec: number } | null;
  mejor: number;
  onResuelto: () => void;
}) {
  const [pe, setPe] = useState("");
  const [ml, setMl] = useState("");
  const [res, setRes] = useState<string | null>(null);
  const [check, setCheck] = useState(false);

  const peOk = Number(pe) === mez.volatilPE;
  const mlOk = Math.abs(Number(ml) - destilado) <= 18;
  const resOk = res === mez.residuo;
  const todoOk = peOk && mlOk && resOk;

  const comprobar = () => {
    setCheck(true);
    if (todoOk) onResuelto();
  };

  const opciones = [mez.residuo, mez.volatil, "Nada, se evapora todo"];

  const fila = (ok: boolean, label: string, input: React.ReactNode) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
        <span style={{ fontSize: 14, color: T.text2, fontWeight: 600, lineHeight: 1.3 }}>{label}</span>
        {check && <i className={`fa-solid ${ok ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: ok ? OK : NO, fontSize: 15 }} />}
      </div>
      {input}
    </div>
  );

  return (
    <div>
      <div style={{ borderRadius: 18, border: `1px solid rgba(${rgba},0.4)`, background: "rgba(3,12,26,0.6)", padding: "16px 16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 6 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#04121f", background: accent }}>
            <i className="fa-solid fa-calculator" />
          </span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>Cálculos de tu destilación</div>
            <div style={{ fontSize: 14, color: T.text3 }}>Responde con tus resultados</div>
          </div>
        </div>

        {reto && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "12px 0 4px", borderRadius: 12, border: `1px solid ${reto.estrellas >= 3 ? OK : WARN}44`, background: `${reto.estrellas >= 3 ? OK : WARN}12`, padding: "10px 14px" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.1em", color: T.text3 }}>TU PUNTUACIÓN</div>
              <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                {[1, 2, 3].map((s) => (
                  <i key={s} className="fa-solid fa-star" style={{ fontSize: 17, color: s <= reto.estrellas ? "#FBBF24" : "rgba(255,255,255,0.18)" }} />
                ))}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
              <div>Recuperaste <strong style={{ color: "#fff" }}>{fmt(reto.eff * 100)}%</strong></div>
              <div style={{ color: T.text3 }}>Mejor con esta mezcla: <strong style={{ color: mejor >= 3 ? OK : T.text2 }}>{mejor}★</strong></div>
            </div>
          </div>
        )}

        {contaminado && (
          <div style={{ margin: "10px 0 14px", borderRadius: 10, border: `1px solid ${WARN}55`, background: `${WARN}14`, padding: "9px 12px", fontSize: 14, color: T.text2, lineHeight: 1.45 }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: WARN, marginRight: 7 }} />
            Subiste de {fmt(mez.contaminaTemp ?? CONTAMINA_TEMP)} °C: tu destilado arrastró {mez.residuo.toLowerCase()} y quedó contaminado. Aun así, calcula tus datos.
          </div>
        )}

        {fila(peOk, "¿A qué temperatura (°C) hierve el componente volátil?", <input className="calc-in" type="number" inputMode="numeric" placeholder="°C" value={pe} onChange={(e) => setPe(e.target.value)} />)}
        {fila(mlOk, "¿Cuántos mL de destilado recogiste aproximadamente?", <input className="calc-in" type="number" inputMode="numeric" placeholder="mL" value={ml} onChange={(e) => setMl(e.target.value)} />)}
        {fila(
          resOk,
          "¿Qué quedó como residuo en el matraz?",
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {opciones.map((o) => {
              const on = res === o;
              return (
                <button key={o} onClick={() => setRes(o)} style={{ cursor: "pointer", textAlign: "left", borderRadius: 10, border: `1px solid ${on ? accent : T.line}`, background: on ? `rgba(${rgba},0.16)` : T.inset, color: on ? "#fff" : T.text2, padding: "9px 12px", fontSize: 14, fontWeight: 700, transition: "all .14s" }}>
                  <i className={`fa-solid ${on ? "fa-circle-dot" : "fa-circle"}`} style={{ marginRight: 9, color: on ? accent : T.text3, fontSize: 14 }} />
                  {o}
                </button>
              );
            })}
          </div>,
        )}

        {check && todoOk ? (
          <div style={{ borderRadius: 12, border: `1px solid ${OK}55`, background: `${OK}14`, padding: "12px 14px", display: "flex", gap: 11 }}>
            <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 17, marginTop: 1 }} />
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
              <strong style={{ color: "#fff" }}>¡Correcto!</strong> {mez.explica}
            </div>
          </div>
        ) : (
          <button className="sm-primary" style={{ width: "100%", marginTop: 4 }} onClick={comprobar} disabled={!pe || !ml || !res}>
            <i className="fa-solid fa-check-double" /> {check ? "Revisar de nuevo" : "Comprobar"}
          </button>
        )}
        {check && !todoOk && <div style={{ marginTop: 10, fontSize: 14, color: NO, textAlign: "center", fontWeight: 600 }}>Revisa las respuestas marcadas y vuelve a comprobar.</div>}
      </div>
    </div>
  );
}

/* ── Compuerta de seguridad: ponte el EPP antes de entrar al laboratorio ──── */
type EppItem = { key: string; nombre: string; icono: string; ok: boolean; nota: string };
const EPP: EppItem[] = [
  { key: "gafas", nombre: "Gafas de seguridad", icono: "fa-glasses", ok: true, nota: "Protegen tus ojos de salpicaduras y vapores." },
  { key: "bata", nombre: "Bata de laboratorio", icono: "fa-user-doctor", ok: true, nota: "Cubre tu ropa y tu piel de salpicaduras calientes." },
  { key: "guantes", nombre: "Guantes", icono: "fa-mitten", ok: true, nota: "Protegen tus manos del calor y los químicos." },
  { key: "mechero", nombre: "Mechero Bunsen", icono: "fa-fire", ok: false, nota: "Es una herramienta de calentamiento, no equipo de protección." },
  { key: "probeta", nombre: "Probeta graduada", icono: "fa-vial", ok: false, nota: "Sirve para medir volúmenes, no para protegerte." },
  { key: "pipeta", nombre: "Pipeta", icono: "fa-eye-dropper", ok: false, nota: "Sirve para medir y trasvasar líquidos, no para protegerte." },
];

function EppGate({ accent, rgba, onEntrar }: { accent: string; rgba: string; onEntrar: () => void }) {
  const [puestos, setPuestos] = useState<Set<string>>(() => new Set<string>());
  const [malo, setMalo] = useState<string | null>(null); // último incorrecto (para sacudir)
  const [aviso, setAviso] = useState<string | null>(null);
  const correctos = EPP.filter((e) => e.ok).length;
  const listos = EPP.filter((e) => e.ok && puestos.has(e.key)).length;
  const completo = listos === correctos;

  const tocar = (e: EppItem) => {
    if (e.ok) {
      setPuestos((p) => (p.has(e.key) ? p : new Set(p).add(e.key)));
      setAviso(e.nota);
      setMalo(null);
    } else {
      setMalo(e.key);
      setAviso(e.nota);
      window.setTimeout(() => setMalo((m) => (m === e.key ? null : m)), 480);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        overflowY: "auto",
        background: "radial-gradient(120% 90% at 50% 0%, rgba(3,16,33,0.82) 0%, rgba(2,9,20,0.94) 70%)",
        backdropFilter: "blur(8px)",
      }}
    >
      <style>{`
        @keyframes epp-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 50%{transform:translateX(6px)} 75%{transform:translateX(-4px)} }
        .epp-card { cursor:pointer; border-radius:14px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px 10px; transition:all .14s ease; position:relative; }
        .epp-card:hover { border-color:${T.lineStrong}; color:#fff; }
        .epp-card[data-puesto="true"] { border-color:${OK}88; background:${OK}1c; color:${OK}; }
        .epp-card[data-malo="true"] { animation:epp-shake .45s ease; border-color:${NO}; background:${NO}18; color:${NO}; }
      `}</style>

      <div
        style={{
          width: "min(100%, 560px)",
          margin: "auto",
          borderRadius: 22,
          border: `1px solid rgba(${rgba},0.4)`,
          background: "linear-gradient(180deg, rgba(8,20,40,0.97), rgba(3,12,26,0.98))",
          boxShadow: "0 30px 80px -30px rgba(0,0,0,0.7)",
          padding: "20px 18px 18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "#04121f", background: accent }}>
            <i className="fa-solid fa-helmet-safety" />
          </span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>Antes de entrar: equípate</div>
            <div style={{ fontSize: 14, color: T.text3 }}>Identifica el equipo de protección personal</div>
          </div>
        </div>

        <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.5, margin: "12px 0 16px" }}>
          En un laboratorio real, nunca se trabaja con fuego y químicos sin protección. Entre el material de abajo, selecciona solo las <strong style={{ color: T.text }}>{correctos}</strong> piezas de protección personal (no los instrumentos) para acceder.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          {EPP.map((e) => {
            const puesto = e.ok && puestos.has(e.key);
            return (
              <button key={e.key} className="epp-card" data-puesto={puesto} data-malo={malo === e.key} onClick={() => tocar(e)} title={e.nombre}>
                <i className={`fa-solid ${e.icono}`} style={{ fontSize: 22 }} />
                <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, textAlign: "center" }}>{e.nombre}</span>
                {puesto && <i className="fa-solid fa-circle-check" style={{ position: "absolute", top: 7, right: 8, fontSize: 14, color: OK }} />}
              </button>
            );
          })}
        </div>

        <div style={{ minHeight: 34, display: "flex", alignItems: "center", gap: 9, margin: "14px 2px 4px", fontSize: 14, color: malo ? NO : T.text2, lineHeight: 1.4 }}>
          {aviso && <i className={`fa-solid ${malo ? "fa-circle-xmark" : "fa-circle-info"}`} style={{ color: malo ? NO : accent, marginTop: 1 }} />}
          <span>{aviso ?? ""}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: completo ? OK : T.text3 }}>
            {listos}/{correctos} equipo correcto
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={onEntrar} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: T.text3, fontWeight: 600, textDecoration: "underline" }} title="Omitir el repaso de seguridad">
              Ya lo sé, omitir
            </button>
            <button className="sm-primary" onClick={onEntrar} disabled={!completo} style={{ width: "auto" }}>
              <i className="fa-solid fa-door-open" /> Entrar al laboratorio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
