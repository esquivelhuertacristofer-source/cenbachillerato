"use client";

/**
 * Laboratorio 3D inmersivo — Destilación / Separación de mezclas (CNEYT-I-P04).
 *
 * Experiencia "Inmersivo 3D": la escena ocupa casi toda la pantalla; el alumno
 * ARMA el equipo pieza por pieza desde una barra flotante, CARGA una mezcla,
 * REGULA el mechero y DESTILA. La teoría vive en un cajón lateral que entra solo
 * al pulsar «Teoría»; los cálculos aparecen como tarjeta flotante al terminar.
 * Si se pasa de temperatura o de volumen con fuego alto → EXPLOTA.
 *
 * Debajo se conserva el explorador 3D de los cuatro métodos de separación.
 *
 * Física y contenido verbatim en destilacion-data.ts (de la lectura ancla A1).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
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

const DestilacionScene = dynamic(() => import("./DestilacionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Montando el laboratorio 3D…</span>
    </div>
  ),
});

const SeparacionMezclasScene = dynamic(() => import("./SeparacionMezclasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-filter fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el explorador 3D…</span>
    </div>
  ),
});

const NO = "#FF5E5E";
const WARN = "#FBBF24";
const RETO_KEY = "cen-destilacion-reto";

type Op = { temp: number; volumen: number; destilado: number };
const PIEZAS_VACIO: Record<PiezaKey, boolean> = { soporte: false, matraz: false, mechero: false, termometro: false, refrigerante: false, colector: false };

export function LabSeparacionMezclas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

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

  const [drawer, setDrawer] = useState(false); // cajón de teoría
  const [autoRotate, setAutoRotate] = useState(false);
  const [etiquetas, setEtiquetas] = useState(false); // etiquetas flotantes de cada pieza
  const [eppListo, setEppListo] = useState(false); // equipo de protección puesto (entrada al lab)

  // curva de calentamiento (muestreo de temperatura en el tiempo)
  const [serie, setSerie] = useState<number[]>([]);

  // sonido sintetizado (opcional)
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabAudio | null>(null);

  // modo reto: estrellas de la corrida actual + mejor marca por mezcla (persistida)
  const [reto, setReto] = useState<{ estrellas: number; eff: number; rec: number } | null>(null);
  const [mejores, setMejores] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const r = window.localStorage.getItem(RETO_KEY);
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
            window.localStorage.setItem(RETO_KEY, JSON.stringify(nx));
          } catch {
            /* localStorage no disponible */
          }
          return nx;
        });
        setFase("listo");
        return;
      }
      if (mez.contaminaTemp !== undefined && nt > mez.contaminaTemp && volumen > 12) setContaminado(true);
    }, TICK);
    return () => clearInterval(id);
  }, [fase, llama, mez, mezKey, contaminado, carga]);

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

  /* ── Estado para la cinta EN VIVO ─────────────────────────────────────── */
  const { estado, estadoColor } = useMemo(() => {
    if (fase === "armar") return { estado: armadoCompleto ? "Equipo armado" : "Arma el equipo", estadoColor: armadoCompleto ? OK : "#8AB4FF" };
    if (fase === "cargar") return { estado: "Carga la mezcla", estadoColor: "#8AB4FF" };
    if (fase === "operar") return hirviendo ? { estado: "Destilando…", estadoColor: OK } : llama === "off" ? { estado: "Enciende el mechero", estadoColor: "#8AB4FF" } : { estado: "Calentando…", estadoColor: WARN };
    if (fase === "listo") return { estado: contaminado ? "Destilado contaminado" : "Destilación completa", estadoColor: contaminado ? WARN : OK };
    return { estado: accidente === "rotura" ? "¡El matraz estalló!" : "¡Se derramó la mezcla!", estadoColor: NO };
  }, [fase, armadoCompleto, hirviendo, llama, contaminado, accidente]);

  const objetivos = [
    { txt: "Equípate con seguridad", done: eppListo },
    { txt: "Arma el equipo de destilación", done: logros.has("armo") },
    { txt: "Carga la mezcla", done: logros.has("cargo") },
    { txt: "Trabaja dentro del límite seguro", done: logros.has("seguro") },
    { txt: "Obtén destilado", done: logros.has("destilo") },
    { txt: "Mantén el destilado limpio", done: logros.has("limpio") },
    { txt: "Resuelve los cálculos", done: logros.has("calculo") },
    { txt: "Consigue una destilación de 3★", done: (mejores[mezKey] ?? 0) >= 3 },
  ];

  /* ── Explorador secundario (4 métodos) ───────────────────────────────── */
  const [mezclaKey, setMezclaKey] = useState("arena-agua");
  const [metodoKey, setMetodoKey] = useState<MetodoKey>("filtracion");
  const [progreso, setProgreso] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoRotateExp, setAutoRotateExp] = useState(true);
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
  const estadoExpColor = !completaExp ? (playing ? WARN : "#8AB4FF") : exitoExp ? OK : NO;
  const objetivosExp = [
    { txt: "Ejecuta una separación", done: interactuo },
    { txt: "Separa una mezcla correctamente", done: exitos.size >= 1 },
    { txt: "Comprueba que un método equivocado no separa", done: falloAlguna },
    { txt: "Separa correctamente las 4 mezclas", done: exitos.size >= 4 },
  ];

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulse 1.6s ease-in-out infinite; }
        .dest-stage { position:relative; height:clamp(580px, 80vh, 900px); border-radius:22px; overflow:hidden;
          border:1px solid rgba(${color.rgba},0.24);
          background:radial-gradient(120% 80% at 50% 0%, rgba(${color.rgba},0.14) 0%, transparent 55%), linear-gradient(180deg,#06182f 0%,#02091a 100%);
          box-shadow:0 0 60px -20px rgba(${color.rgba},0.5), ${T.shadow}; }
        .dest-glass { background:rgba(2,12,28,0.74); border:1px solid ${T.line}; backdrop-filter:blur(12px); }
        .tool { cursor:pointer; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          border-radius:13px; padding:9px 13px; display:flex; flex-direction:column; align-items:center; gap:5px;
          min-width:74px; transition:all .14s ease; }
        .tool:hover:not(:disabled) { border-color:${accent}; color:#fff; background:rgba(${color.rgba},0.14); }
        .tool:disabled { opacity:0.32; cursor:default; }
        .tool[data-done="true"] { border-color:${OK}66; background:${OK}1a; color:${OK}; opacity:1; }
        .tool[data-next="true"] { border-color:${accent}; box-shadow:0 0 16px -5px ${accent}; color:#fff; }
        .flame-btn { cursor:pointer; border-radius:12px; padding:9px 15px; font-size:13px; font-weight:800; border:1px solid ${T.line};
          background:${T.glass}; color:${T.text2}; transition:all .14s; display:inline-flex; align-items:center; gap:8px; }
        .flame-btn[data-on="true"] { color:#04121f; border-color:transparent; }
        .icobtn { cursor:pointer; width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.72); transition:all .15s; }
        .icobtn[data-on="true"] { background:rgba(${color.rgba},0.24); color:#fff; }
        .icobtn:hover { background:rgba(255,255,255,0.12); }
        .btn-primary { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 22px;
          border-radius:12px; border:none; background:${accent}; color:#04121f; font-size:14px; font-weight:800; transition:all .15s; }
        .btn-primary:hover:not(:disabled) { filter:brightness(1.08); }
        .btn-primary:disabled { opacity:0.4; cursor:default; }
        .btn-ghost { cursor:pointer; display:inline-flex; align-items:center; gap:8px; padding:11px 18px; border-radius:12px;
          border:1px solid ${T.line}; background:${T.glass}; color:${T.text}; font-size:13.5px; font-weight:700; transition:all .14s; }
        .btn-ghost:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; }
        .dest-drawer { position:absolute; top:0; right:0; height:100%; width:min(560px, 92%); transform:translateX(102%);
          transition:transform .34s cubic-bezier(.22,.61,.36,1); z-index:30; display:flex; flex-direction:column;
          background:linear-gradient(180deg, rgba(6,18,38,0.96), rgba(3,12,26,0.97)); border-left:1px solid rgba(${color.rgba},0.3);
          box-shadow:-20px 0 60px -20px rgba(0,0,0,0.6); }
        .dest-drawer[data-open="true"] { transform:translateX(0); }
        .dest-scrim { position:absolute; inset:0; background:rgba(2,8,18,0.5); backdrop-filter:blur(2px); z-index:20; opacity:0;
          pointer-events:none; transition:opacity .3s; }
        .dest-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .rng { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none; }
        .rng::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:18px; height:18px; border-radius:50%;
          background:#fff; cursor:pointer; box-shadow:0 0 0 4px rgba(${color.rgba},0.35); }
        .rng::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:#fff; border:none; cursor:pointer; box-shadow:0 0 0 4px rgba(${color.rgba},0.35); }
        .calc-in { width:100%; background:${T.inset}; border:1px solid ${T.line}; border-radius:10px; color:#fff; font-size:15px;
          font-weight:800; padding:9px 12px; outline:none; }
        .calc-in:focus { border-color:${accent}; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } .ex-bottom { grid-template-columns: 1fr !important; }
          .dest-objetivos { display:none; } }
        @media (max-width: 1100px){ .dest-curva { display:none; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-divider { height:1px; background:${T.line}; margin:18px 0; }
        .ex-mx { position:relative; cursor:pointer; border-radius:12px; border:1px solid ${T.line}; background:${T.glass};
          display:flex; align-items:center; gap:10px; padding:11px 13px; transition:all .14s ease; text-align:left; width:100%; }
        .ex-mx:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; }
        .ex-met { cursor:pointer; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          display:flex; flex-direction:column; align-items:center; gap:6px; padding:13px 8px; transition:all .14s ease; text-align:center; }
        .ex-met:hover { border-color:${T.lineStrong}; color:#fff; }
        .ex-play { cursor:pointer; width:100%; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:13px 20px;
          border-radius:12px; border:none; background:${accent}; color:#04121f; font-size:14.5px; font-weight:800; transition:all .15s; }
        .ex-play:hover { filter:brightness(1.08); }
        .ex-section { display:flex; align-items:center; gap:13px; margin:40px 0 18px; }
        .ex-section-line { flex:1; height:1px; background:linear-gradient(90deg, ${T.line}, transparent); }
      `}</style>

      {/* ══════════════ ESCENARIO 3D INMERSIVO ══════════════ */}
      <div className="dest-stage">
        <SceneBoundary
          fallback={
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
              <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent }}>
                <i className="fa-solid fa-flask" />
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Destilación de {mez.nombre.toLowerCase()}</div>
              <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
                Tu equipo no puede mostrar la vista 3D. La idea: el componente volátil hierve primero ({fmt(mez.volatilPE)} °C), su vapor se condensa y se recoge; el residuo ({mez.residuo}) queda en el matraz.
              </div>
            </div>
          }
        >
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
            etiquetas={etiquetas && !drawer}
          />
        </SceneBoundary>

        {/* Cinta EN VIVO */}
        <div className="dest-glass" style={{ position: "absolute", top: 16, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, borderColor: `${estadoColor}66` }}>
          <span className="ex-live-dot" style={{ ["--exc" as string]: `${estadoColor}aa`, width: 9, height: 9, borderRadius: "50%", background: estadoColor }} />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
          <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
          <span style={{ fontSize: 13.5, fontWeight: 800, color: estadoColor }}>{estado}</span>
        </div>

        {/* Controles superiores derecha */}
        <div className="dest-glass" style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 2, padding: 4, borderRadius: 12, zIndex: 5 }}>
          <button className="icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
            <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
          </button>
          <button className="icobtn" data-on={etiquetas} onClick={() => setEtiquetas((v) => !v)} title="Etiquetas de las piezas">
            <i className="fa-solid fa-tags" />
          </button>
          <button className="icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
            <i className="fa-solid fa-arrows-rotate" />
          </button>
          <button className="icobtn" onClick={reiniciarTodo} title="Reiniciar todo">
            <i className="fa-solid fa-rotate-left" />
          </button>
          <button className="icobtn" data-on={drawer} onClick={() => setDrawer((v) => !v)} title="Teoría">
            <i className="fa-solid fa-book-open" />
          </button>
        </div>

        {/* Botón Teoría destacado (cuando el cajón está cerrado) */}
        {!drawer && (
          <button
            onClick={() => setDrawer(true)}
            className="dest-glass"
            style={{ position: "absolute", top: 64, right: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 12, cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 800, zIndex: 5 }}
          >
            <i className="fa-solid fa-book-open" style={{ color: accent }} />
            Teoría
          </button>
        )}

        {/* Objetivos flotantes (izquierda) */}
        <div className="dest-glass dest-objetivos" style={{ position: "absolute", top: 64, left: 16, width: 232, borderRadius: 14, padding: "13px 15px", zIndex: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: T.text3, marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}>
            <i className="fa-solid fa-bullseye" style={{ color: accent }} /> OBJETIVOS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {objetivos.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, color: o.done ? OK : T.text2 }}>
                <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 12, opacity: o.done ? 1 : 0.28 }} />
                <span style={{ fontWeight: o.done ? 700 : 500, lineHeight: 1.25 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lecturas de instrumentos (operar/listo) */}
        {(fase === "operar" || fase === "listo") && (
          <div className="dest-glass" style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", display: "flex", borderRadius: 13, overflow: "hidden", zIndex: 4 }}>
            <Readout label="Temperatura" value={`${fmt(op.temp)} °C`} col={op.temp >= ROTURA_TEMP - 12 ? NO : op.temp >= mez.volatilPE ? WARN : accent} size={15} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="En el matraz" value={`${fmt(Math.max(0, op.volumen))} mL`} col={op.volumen > PELIGRO ? NO : T.text} size={15} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Destilado" value={`${fmt(op.destilado)} mL`} col={OK} size={15} />
          </div>
        )}

        {/* Curva de calentamiento (T° vs tiempo) */}
        {(fase === "operar" || fase === "listo") && serie.length > 1 && (
          <div className="dest-glass dest-curva" style={{ position: "absolute", bottom: 96, left: 16, borderRadius: 14, padding: "11px 13px 9px", zIndex: 4 }}>
            <CurvaCalentamiento serie={serie} volatilPE={mez.volatilPE} accent={accent} hirviendo={hirviendo} />
          </div>
        )}

        {/* ── BARRA FLOTANTE INFERIOR (contextual por fase) ── */}
        <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", width: "min(94%, 880px)", zIndex: 6 }}>
          <div className="dest-glass" style={{ borderRadius: 18, padding: "14px 16px" }}>
            {/* Encabezado de paso */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              {(["armar", "cargar", "operar", "listo"] as Fase[]).map((f, i) => {
                const order: Fase[] = ["armar", "cargar", "operar", "listo"];
                const cur = order.indexOf(fase === "accidente" ? "operar" : fase);
                const active = i === cur;
                const past = i < cur;
                return (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, background: active ? accent : past ? `${OK}33` : T.inset, color: active ? "#04121f" : past ? OK : T.text3, border: `1px solid ${active ? accent : past ? `${OK}66` : T.line}` }}>
                      {past ? <i className="fa-solid fa-check" style={{ fontSize: 9 }} /> : i + 1}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: active ? 800 : 600, color: active ? "#fff" : T.text3, textTransform: "capitalize" }}>{f}</span>
                    {i < 3 && <span style={{ flex: 1, height: 1, background: T.line }} />}
                  </div>
                );
              })}
            </div>

            {/* ARMAR */}
            {fase === "armar" && (
              <div style={{ display: "flex", gap: 9, alignItems: "stretch", flexWrap: "wrap", justifyContent: "center" }}>
                {ORDEN.map((k) => {
                  const def = PIEZAS.find((p) => p.key === k)!;
                  const done = piezas[k];
                  const idx = ORDEN.indexOf(k);
                  const next = !done && ORDEN.slice(0, idx).every((p) => piezas[p]);
                  return (
                    <button key={k} className="tool" data-done={done} data-next={next} disabled={done || !next} onClick={() => colocar(k)} title={next || done ? def.ayuda : "Coloca primero las piezas anteriores"}>
                      <i className={`fa-solid ${def.icono}`} style={{ fontSize: 17 }} />
                      <span style={{ fontSize: 10.5, fontWeight: 700, lineHeight: 1.15, maxWidth: 78, textAlign: "center" }}>{def.nombre}</span>
                      {done && <i className="fa-solid fa-circle-check" style={{ fontSize: 11, color: OK }} />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* CARGAR */}
            {fase === "cargar" && (
              <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 520 }}>
                  {(Object.keys(MEZCLAS) as MezKey[]).map((k) => {
                    const on = k === mezKey;
                    return (
                      <button key={k} className="flame-btn" data-on={on} onClick={() => setMezKey(k)} style={{ background: on ? accent : T.glass, borderColor: on ? "transparent" : T.line, color: on ? "#04121f" : T.text2 }}>
                        <i className="fa-solid fa-droplet" />
                        {MEZCLAS[k].nombre}
                      </button>
                    );
                  })}
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 6 }}>
                    <span style={{ color: T.text3, fontWeight: 700 }}>Volumen a cargar</span>
                    <span style={{ fontWeight: 800, color: carga > PELIGRO ? NO : carga > SEGURO ? WARN : accent }}>
                      {fmt(carga)} mL {carga > PELIGRO ? "· ¡peligro!" : carga > SEGURO ? "· arriesgado" : "· seguro"}
                    </span>
                  </div>
                  <input
                    className="rng"
                    type="range"
                    min={20}
                    max={CAP}
                    step={5}
                    value={carga}
                    onChange={(e) => setCarga(Number(e.target.value))}
                    style={{ background: `linear-gradient(90deg, ${accent} 0%, ${WARN} ${(SEGURO / CAP) * 100}%, ${NO} ${(PELIGRO / CAP) * 100}%, ${NO} 100%)` }}
                  />
                </div>
                <button className="btn-primary" onClick={cargarMezcla}>
                  <i className="fa-solid fa-fill-drip" /> Cargar mezcla
                </button>
              </div>
            )}

            {/* OPERAR */}
            {fase === "operar" && (
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text3 }}>
                    <i className="fa-solid fa-fire" style={{ marginRight: 7, color: llama === "off" ? T.text3 : WARN }} />
                    Mechero
                  </span>
                  {(["off", "baja", "media", "alta"] as Llama[]).map((l) => {
                    const on = l === llama;
                    const col = l === "alta" ? "#FF7A2C" : l === "media" ? "#FF9A3C" : l === "baja" ? "#7FB6FF" : T.text3;
                    const etiqueta = { off: "Apagado", baja: "Baja", media: "Media", alta: "Alta" }[l];
                    return (
                      <button key={l} className="flame-btn" data-on={on} onClick={() => setLlama(l)} style={{ background: on ? col : T.glass, color: on ? "#04121f" : T.text2, borderColor: on ? "transparent" : T.line }}>
                        {etiqueta}
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: 12, color: T.text3, display: "flex", alignItems: "center", gap: 8, maxWidth: 320 }}>
                  <i className="fa-solid fa-circle-info" style={{ color: accent }} />
                  <span>
                    Mantén la temperatura cerca de <strong style={{ color: T.text }}>{fmt(mez.volatilPE)} °C</strong>. Pasar de {fmt(ROTURA_TEMP)} °C rompe el matraz.
                  </span>
                </div>
              </div>
            )}

            {/* LISTO / ACCIDENTE */}
            {(fase === "listo" || fase === "accidente") && (
              <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center" }}>
                <button className="btn-primary" onClick={repetir}>
                  <i className="fa-solid fa-rotate-right" /> Destilar otra vez
                </button>
                <button className="btn-ghost" onClick={reiniciarTodo}>
                  <i className="fa-solid fa-screwdriver-wrench" /> Rearmar equipo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── TARJETA DE CÁLCULOS (flotante al terminar) ── */}
        {fase === "listo" && <CalcCard accent={accent} rgba={color.rgba} mez={mez} destilado={op.destilado} contaminado={contaminado} reto={reto} mejor={mejores[mezKey] ?? 0} onResuelto={() => marca("calculo")} />}

        {/* ── ACCIDENTE (banner) ── */}
        {fase === "accidente" && (
          <div style={{ position: "absolute", top: 70, left: "50%", transform: "translateX(-50%)", width: "min(94%, 560px)", zIndex: 8 }}>
            <div style={{ borderRadius: 16, border: `1px solid ${NO}66`, background: "rgba(40,8,12,0.9)", backdropFilter: "blur(12px)", padding: "16px 20px", display: "flex", gap: 14 }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: NO, fontSize: 22, marginTop: 2 }} />
              <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.5 }}>
                <strong style={{ color: "#fff" }}>{accidente === "rotura" ? "El matraz se sobrecalentó y estalló." : "El matraz estaba demasiado lleno y la mezcla hirviendo se derramó."}</strong>{" "}
                {accidente === "rotura"
                  ? `Nunca pases de ${fmt(ROTURA_TEMP)} °C: baja la llama y mantén la temperatura cerca del punto de ebullición (${fmt(mez.volatilPE)} °C).`
                  : `Carga como máximo ${fmt(SEGURO)} mL (≈ 2/3 del matraz) o usa una llama más baja.`}
              </div>
            </div>
          </div>
        )}

        {/* ── CAJÓN DE TEORÍA ── */}
        <div className="dest-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
        <div className="dest-drawer" data-open={drawer}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: `1px solid ${T.line}` }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 900, color: "#fff" }}>
              <i className="fa-solid fa-book-open" style={{ color: accent }} /> Teoría de la práctica
            </span>
            <button className="icobtn" onClick={() => setDrawer(false)} title="Cerrar">
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "18px" }}>
            <FichaTeorica data={SEPARACION_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
          </div>
        </div>

        {/* ── COMPUERTA DE SEGURIDAD (EPP) antes de entrar al laboratorio ── */}
        {!eppListo && <EppGate accent={accent} rgba={color.rgba} onEntrar={() => setEppListo(true)} />}
      </div>

      {/* Pista bajo el escenario */}
      <div style={{ marginTop: 16, borderRadius: 16, padding: "16px 20px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 13 }}>
        <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
        <span>
          La <strong style={{ color: T.text }}>destilación</strong> separa una mezcla aprovechando el <strong style={{ color: T.text }}>punto de ebullición</strong>: el componente volátil hierve primero, su vapor se condensa en el refrigerante y se recoge puro; el residuo queda en el matraz. {mez.explica}
        </span>
      </div>

      {/* ══════════════ EXPLORADOR SECUNDARIO · 4 MÉTODOS ══════════════ */}
      <div className="ex-section">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: accent, background: `rgba(${color.rgba},0.16)` }}>
            <i className="fa-solid fa-cubes" />
          </span>
          <span>
            <span style={{ display: "block", fontSize: 16, fontWeight: 900, color: T.text, lineHeight: 1.1 }}>Explorador 3D · los cuatro métodos</span>
            <span style={{ display: "block", fontSize: 12.5, color: T.text2, marginTop: 2 }}>Prueba cada método con distintas mezclas y descubre cuál separa cada una</span>
          </span>
        </span>
        <span className="ex-section-line" />
      </div>

      <div className="ex-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ position: "relative", height: "clamp(440px, 62vh, 720px)", borderRadius: 20, overflow: "hidden", border: `1px solid rgba(${color.rgba},0.22)`, background: `radial-gradient(120% 80% at 50% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06182f 0%,#020d1d 100%)`, boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}` }}>
            <SceneBoundary
              fallback={
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
                  <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent }}>
                    <i className="fa-solid fa-filter" />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{mezclaExp.nombre}</div>
                  <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>Tu equipo no puede mostrar la vista 3D, pero la idea sigue: cada mezcla se separa con el método que aprovecha la propiedad en que difieren sus componentes.</div>
                </div>
              }
            >
              <SeparacionMezclasScene mezclaKey={mezclaExp.key} comps={comps} funciona={funciona} metodoKey={metodoKey} progreso={progreso} accent={accent} autoRotate={autoRotateExp} resetNonce={resetNonce} />
            </SceneBoundary>

            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${estadoExpColor}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${estadoExpColor}aa`, width: 9, height: 9, borderRadius: "50%", background: estadoExpColor }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: estadoExpColor }}>{estadoExp}</span>
            </div>

            <div style={{ position: "absolute", bottom: 16, left: 18, maxWidth: 150, fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: completaExp && funciona ? OK : "rgba(255,255,255,0.32)", textTransform: "uppercase", pointerEvents: "none", lineHeight: 1.3 }}>
              ← {comps[0].nombre}
            </div>
            <div style={{ position: "absolute", bottom: 16, right: 18, maxWidth: 150, textAlign: "right", fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: completaExp && funciona ? OK : "rgba(255,255,255,0.32)", textTransform: "uppercase", pointerEvents: "none", lineHeight: 1.3 }}>
              {comps[1].nombre} →
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={autoRotateExp} onClick={() => setAutoRotateExp((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={() => { setProgreso(0); setPlaying(false); setResetNonce((n) => n + 1); }} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>
          </div>

          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <Eyebrow>Método aplicado</Eyebrow>
                <div style={{ fontSize: 17, fontWeight: 900, color: T.text }}>
                  <i className={`fa-solid ${metodo.icono}`} style={{ marginRight: 9, color: accent }} />
                  {metodo.nombre}
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, marginTop: 4 }}>
                  Aprovecha: <strong style={{ color: T.text }}>{metodo.propiedad}</strong>
                </div>
              </div>
              <div style={{ width: 180 }}>
                <button className="ex-play" onClick={() => { setInteractuo(true); if (progreso >= 1) setProgreso(0); setPlaying(true); }} disabled={playing}>
                  <i className={`fa-solid ${playing ? "fa-spinner fa-spin" : completaExp ? "fa-rotate-right" : "fa-play"}`} />
                  {playing ? "Separando…" : completaExp ? "Repetir" : "Separar"}
                </button>
              </div>
            </div>

            {completaExp && (
              <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${exitoExp ? OK : NO}55`, background: `${exitoExp ? OK : NO}14`, padding: "13px 16px", display: "flex", gap: 12 }}>
                <i className={`fa-solid ${exitoExp ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: exitoExp ? OK : NO, fontSize: 18, marginTop: 1 }} />
                <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>
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
            )}
          </div>
        </div>

        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Mezcla a separar</Eyebrow>
          <div style={{ borderRadius: 14, border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.1)`, padding: "16px 18px" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text, lineHeight: 1.15 }}>{mezclaExp.nombre}</div>
            <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
              {comps.map((c) => (
                <span key={c.key} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: T.text2 }}>
                  <span style={{ width: 13, height: 13, borderRadius: "50%", background: c.color, border: "1px solid rgba(255,255,255,0.25)", boxShadow: `0 0 8px -2px ${c.color}` }} />
                  {c.nombre}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 12.5, color: accent, marginTop: 11, fontWeight: 700 }}>
              <i className="fa-solid fa-flask-vial" style={{ marginRight: 7 }} />
              Difieren en: {mezclaExp.propiedad}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {MEZCLAS_EXP.map((m) => {
              const on = m.key === mezclaKey;
              const done = exitos.has(m.key);
              return (
                <button key={m.key} className="ex-mx" onClick={() => { setMezclaKey(m.key); setProgreso(0); setPlaying(false); }} style={{ borderColor: on ? accent : T.line, background: on ? `rgba(${color.rgba},0.16)` : T.glass, boxShadow: on ? `0 0 16px -6px ${accent}` : "none" }}>
                  <span style={{ display: "flex", gap: 4 }}>
                    <span style={{ width: 13, height: 13, borderRadius: "50%", background: COMPONENTES[m.comps[0].c].color, border: "1px solid rgba(255,255,255,0.25)" }} />
                    <span style={{ width: 13, height: 13, borderRadius: "50%", background: COMPONENTES[m.comps[1].c].color, border: "1px solid rgba(255,255,255,0.25)" }} />
                  </span>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 800, color: on ? "#fff" : T.text }}>{m.nombre}</span>
                  {done && <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 13 }} />}
                </button>
              );
            })}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Elige el método de separación</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {METODOS.map((m) => {
              const on = m.key === metodoKey;
              return (
                <button key={m.key} className="ex-met" onClick={() => { setMetodoKey(m.key); setProgreso(0); setPlaying(false); }} style={{ borderColor: on ? accent : T.line, background: on ? `rgba(${color.rgba},0.18)` : T.inset, color: on ? "#fff" : T.text2, boxShadow: on ? `0 0 14px -6px ${accent}` : "none" }}>
                  <i className={`fa-solid ${m.icono}`} style={{ fontSize: 18, color: on ? accent : T.text3 }} />
                  <span style={{ fontSize: 12.5, fontWeight: 800 }}>{m.nombre}</span>
                </button>
              );
            })}
          </div>
          <p style={{ margin: "11px 0 0", fontSize: 12, color: T.text3, lineHeight: 1.45, fontStyle: "italic" }}>{metodo.desc}</p>

          <div className="ex-divider" />

          <Eyebrow>Resultado</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Avance" value={`${fmt(progreso * 100)}%`} col={accent} size={16} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="¿Separa?" value={funciona ? "Sí" : "No"} col={funciona ? OK : NO} size={16} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Logradas" value={`${exitos.size}/4`} col={exitos.size >= 4 ? OK : T.text} size={16} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
            Objetivos del explorador
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {objetivosExp.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? OK : T.text2 }}>
                <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
                <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: "18px 20px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 13 }}>
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            Una mezcla se separa por <strong style={{ color: T.text }}>métodos físicos</strong> (no cambia la naturaleza de las sustancias). El método correcto aprovecha la <strong style={{ color: T.text }}>propiedad en que difieren</strong> sus componentes: tamaño, densidad, punto de ebullición o magnetismo.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Curva de calentamiento (T° vs tiempo, resalta la meseta de ebullición) ── */
function CurvaCalentamiento({ serie, volatilPE, accent, hirviendo }: { serie: number[]; volatilPE: number; accent: string; hirviendo: boolean }) {
  const W = 246;
  const H = 116;
  const PAD_L = 30;
  const PAD_B = 18;
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
    <div style={{ width: W }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: T.text3 }}>CURVA DE CALENTAMIENTO</span>
        {hirviendo && <span style={{ fontSize: 9.5, fontWeight: 800, color: OK }}>● meseta de ebullición</span>}
      </div>
      <svg width={W} height={H} style={{ display: "block" }}>
        {/* línea de ebullición */}
        <line x1={PAD_L} y1={yPE} x2={W - PAD_R} y2={yPE} stroke={OK} strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
        <text x={PAD_L - 4} y={yPE + 3} textAnchor="end" fontSize={8} fill={OK} fontWeight={700}>
          {fmt(volatilPE)}°
        </text>
        {/* línea de rotura */}
        <line x1={PAD_L} y1={yRot} x2={W - PAD_R} y2={yRot} stroke={NO} strokeWidth={1} strokeDasharray="2 3" opacity={0.6} />
        <text x={PAD_L - 4} y={yRot + 3} textAnchor="end" fontSize={8} fill={NO} fontWeight={700}>
          {fmt(ROTURA_TEMP)}°
        </text>
        {/* eje */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + ih} stroke={T.line} strokeWidth={1} />
        <line x1={PAD_L} y1={PAD_T + ih} x2={W - PAD_R} y2={PAD_T + ih} stroke={T.line} strokeWidth={1} />
        <text x={(PAD_L + W - PAD_R) / 2} y={H - 4} textAnchor="middle" fontSize={8.5} fill={T.text3}>
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
        <span style={{ fontSize: 12.5, color: T.text2, fontWeight: 600, lineHeight: 1.3, maxWidth: 300 }}>{label}</span>
        {check && <i className={`fa-solid ${ok ? "fa-circle-check" : "fa-circle-xmark"}`} style={{ color: ok ? OK : NO, fontSize: 15 }} />}
      </div>
      {input}
    </div>
  );

  return (
    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(94%, 440px)", zIndex: 9 }}>
      <div style={{ borderRadius: 20, border: `1px solid rgba(${rgba},0.4)`, background: "linear-gradient(180deg, rgba(8,20,40,0.97), rgba(3,12,26,0.98))", backdropFilter: "blur(14px)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.7)", padding: "22px 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 6 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#04121f", background: accent }}>
            <i className="fa-solid fa-calculator" />
          </span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>Cálculos de tu destilación</div>
            <div style={{ fontSize: 12, color: T.text3 }}>Responde con tus resultados</div>
          </div>
        </div>

        {reto && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "12px 0 4px", borderRadius: 12, border: `1px solid ${reto.estrellas >= 3 ? OK : WARN}44`, background: `${reto.estrellas >= 3 ? OK : WARN}12`, padding: "10px 14px" }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", color: T.text3 }}>TU PUNTUACIÓN</div>
              <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                {[1, 2, 3].map((s) => (
                  <i key={s} className="fa-solid fa-star" style={{ fontSize: 17, color: s <= reto.estrellas ? "#FBBF24" : "rgba(255,255,255,0.18)" }} />
                ))}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 11.5, color: T.text2, lineHeight: 1.5 }}>
              <div>Recuperaste <strong style={{ color: "#fff" }}>{fmt(reto.eff * 100)}%</strong></div>
              <div style={{ color: T.text3 }}>Mejor con esta mezcla: <strong style={{ color: mejor >= 3 ? OK : T.text2 }}>{mejor}★</strong></div>
            </div>
          </div>
        )}

        {contaminado && (
          <div style={{ margin: "10px 0 14px", borderRadius: 10, border: `1px solid ${WARN}55`, background: `${WARN}14`, padding: "9px 12px", fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
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
                <button key={o} onClick={() => setRes(o)} style={{ cursor: "pointer", textAlign: "left", borderRadius: 10, border: `1px solid ${on ? accent : T.line}`, background: on ? `rgba(${rgba},0.16)` : T.inset, color: on ? "#fff" : T.text2, padding: "9px 12px", fontSize: 13, fontWeight: 700, transition: "all .14s" }}>
                  <i className={`fa-solid ${on ? "fa-circle-dot" : "fa-circle"}`} style={{ marginRight: 9, color: on ? accent : T.text3, fontSize: 12 }} />
                  {o}
                </button>
              );
            })}
          </div>,
        )}

        {check && todoOk ? (
          <div style={{ borderRadius: 12, border: `1px solid ${OK}55`, background: `${OK}14`, padding: "12px 14px", display: "flex", gap: 11 }}>
            <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 17, marginTop: 1 }} />
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
              <strong style={{ color: "#fff" }}>¡Correcto!</strong> {mez.explica}
            </div>
          </div>
        ) : (
          <button className="btn-primary" style={{ width: "100%", marginTop: 4 }} onClick={comprobar} disabled={!pe || !ml || !res}>
            <i className="fa-solid fa-check-double" /> {check ? "Revisar de nuevo" : "Comprobar"}
          </button>
        )}
        {check && !todoOk && <div style={{ marginTop: 10, fontSize: 12, color: NO, textAlign: "center", fontWeight: 600 }}>Revisa las respuestas marcadas y vuelve a comprobar.</div>}
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
        padding: 18,
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
          width: "min(96%, 560px)",
          borderRadius: 22,
          border: `1px solid rgba(${rgba},0.4)`,
          background: "linear-gradient(180deg, rgba(8,20,40,0.97), rgba(3,12,26,0.98))",
          boxShadow: "0 30px 80px -30px rgba(0,0,0,0.7)",
          padding: "24px 26px 22px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "#04121f", background: accent }}>
            <i className="fa-solid fa-helmet-safety" />
          </span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>Antes de entrar: equípate</div>
            <div style={{ fontSize: 12.5, color: T.text3 }}>Identifica el equipo de protección personal</div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.5, margin: "12px 0 16px" }}>
          En un laboratorio real, nunca se trabaja con fuego y químicos sin protección. Entre el material de abajo, selecciona solo las <strong style={{ color: T.text }}>{correctos}</strong> piezas de protección personal (no los instrumentos) para acceder.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {EPP.map((e) => {
            const puesto = e.ok && puestos.has(e.key);
            return (
              <button key={e.key} className="epp-card" data-puesto={puesto} data-malo={malo === e.key} onClick={() => tocar(e)} title={e.nombre}>
                <i className={`fa-solid ${e.icono}`} style={{ fontSize: 22 }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.2, textAlign: "center" }}>{e.nombre}</span>
                {puesto && <i className="fa-solid fa-circle-check" style={{ position: "absolute", top: 7, right: 8, fontSize: 12, color: OK }} />}
              </button>
            );
          })}
        </div>

        <div style={{ minHeight: 34, display: "flex", alignItems: "center", gap: 9, margin: "14px 2px 4px", fontSize: 12.5, color: malo ? NO : T.text2, lineHeight: 1.4 }}>
          {aviso && <i className={`fa-solid ${malo ? "fa-circle-xmark" : "fa-circle-info"}`} style={{ color: malo ? NO : accent, marginTop: 1 }} />}
          <span>{aviso ?? ""}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: completo ? OK : T.text3 }}>
            {listos}/{correctos} equipo correcto
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={onEntrar} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: T.text3, fontWeight: 600, textDecoration: "underline" }} title="Omitir el repaso de seguridad">
              Ya lo sé, omitir
            </button>
            <button className="btn-primary" onClick={onEntrar} disabled={!completo} style={{ opacity: completo ? 1 : 0.4 }}>
              <i className="fa-solid fa-door-open" /> Entrar al laboratorio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
