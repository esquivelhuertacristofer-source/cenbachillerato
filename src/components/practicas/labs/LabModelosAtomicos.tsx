"use client";

/**
 * Laboratorio 3D — Modelos atómicos (de Dalton a Schrödinger).
 * Práctica experimental para CNEYT-I-P03 (el átomo, su composición eléctrica y
 * la evolución de los modelos atómicos).
 *
 * El estudiante elige un ELEMENTO y recorre los 5 MODELOS históricos; ve en 3D
 * cómo cambió la idea del átomo: de esfera maciza (Dalton) → budín de pasas
 * (Thomson) → núcleo + órbitas sin definir (Rutherford) → capas de energía
 * (Bohr) → nube de probabilidad (Schrödinger). El núcleo se arma con el número
 * real de protones y neutrones del elemento, y los electrones se reparten por
 * capas según su configuración.
 *
 * Diseño: tema oscuro "instrumento de laboratorio" coherente con PracticaRunner.
 * Si el dispositivo no soporta WebGL, un fallback 2D sigue describiendo el modelo.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import type { ModeloKey } from "./ModelosAtomicosScene";
import { T, NUM, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { MODELOS_ATOMICOS_FICHA } from "./modelos-atomicos-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./modelos-atomicos-data";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";

const ModelosAtomicosScene = dynamic(() => import("./ModelosAtomicosScene"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        color: "rgba(255,255,255,0.55)",
      }}
    >
      <i className="fa-solid fa-atom fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const PROTON_COLOR = "#FF6B6B";
const NEUTRON_COLOR = "#9AA7B5";
const ELECTRON_COLOR = "#5BC8FF";

/* ── Modelos atómicos: evolución histórica ────────────────────────────── */
interface Modelo {
  key: ModeloKey;
  label: string;
  cientifico: string;
  year: number;
  icon: string;
  col: string;
  desc: string; // qué se ve
  aporte: string;
  limite: string;
}
const MODELOS: Modelo[] = [
  {
    key: "dalton",
    label: "Dalton",
    cientifico: "John Dalton",
    year: 1808,
    icon: "fa-circle",
    col: "#94A3B8",
    desc: "Esfera maciza, indivisible y única para cada elemento.",
    aporte: "Propone que la materia se forma de átomos: indivisibles e idénticos en cada elemento.",
    limite: "No explica la naturaleza eléctrica ni la estructura interna del átomo.",
  },
  {
    key: "thomson",
    label: "Thomson",
    cientifico: "J. J. Thomson",
    year: 1904,
    icon: "fa-cookie",
    col: "#F59E0B",
    desc: "«Budín de pasas»: esfera positiva con electrones incrustados.",
    aporte: "Descubre el electrón: el átomo es divisible y tiene carga negativa y positiva.",
    limite: "No ubica la carga positiva en un núcleo; el orden interno no es correcto.",
  },
  {
    key: "rutherford",
    label: "Rutherford",
    cientifico: "Ernest Rutherford",
    year: 1911,
    icon: "fa-bullseye",
    col: "#F472B6",
    desc: "Núcleo pequeño, denso y positivo; electrones girando en el vacío.",
    aporte: "El experimento de la lámina de oro revela un núcleo central, denso y positivo.",
    limite: "No explica por qué los electrones no caen al núcleo ni los espectros de luz.",
  },
  {
    key: "bohr",
    label: "Bohr",
    cientifico: "Niels Bohr",
    year: 1913,
    icon: "fa-atom",
    col: "#38BDF8",
    desc: "Electrones en órbitas circulares de energía definida (capas).",
    aporte: "Los electrones ocupan niveles de energía definidos; explica el espectro del hidrógeno.",
    limite: "Funciona bien para el hidrógeno, pero falla con átomos de más electrones.",
  },
  {
    key: "schrodinger",
    label: "Schrödinger",
    cientifico: "Erwin Schrödinger",
    year: 1926,
    icon: "fa-cloud",
    col: "#34D399",
    desc: "Modelo cuántico: nube de probabilidad (orbitales).",
    aporte: "Modelo cuántico: orbitales = zonas donde es más probable hallar al electrón.",
    limite: "Es abstracto y matemático; los electrones no siguen trayectorias visibles.",
  },
];

/* ── Elementos (datos reales): Z, símbolo, nombre, masa y capas ───────── */
interface Elemento {
  z: number;
  sym: string;
  nombre: string;
  masa: number; // masa atómica (u)
  shells: number[]; // electrones por capa
  color: string;
}
const ELEMENTOS: Elemento[] = [
  { z: 1, sym: "H", nombre: "Hidrógeno", masa: 1.008, shells: [1], color: "#cfe6ff" },
  { z: 2, sym: "He", nombre: "Helio", masa: 4.003, shells: [2], color: "#ffd6a5" },
  { z: 3, sym: "Li", nombre: "Litio", masa: 6.941, shells: [2, 1], color: "#d7b6ff" },
  { z: 4, sym: "Be", nombre: "Berilio", masa: 9.012, shells: [2, 2], color: "#a5f3c8" },
  { z: 5, sym: "B", nombre: "Boro", masa: 10.811, shells: [2, 3], color: "#ffc9a3" },
  { z: 6, sym: "C", nombre: "Carbono", masa: 12.011, shells: [2, 4], color: "#9aa7b5" },
  { z: 7, sym: "N", nombre: "Nitrógeno", masa: 14.007, shells: [2, 5], color: "#9fd0ff" },
  { z: 8, sym: "O", nombre: "Oxígeno", masa: 15.999, shells: [2, 6], color: "#ff9aa2" },
  { z: 9, sym: "F", nombre: "Flúor", masa: 18.998, shells: [2, 7], color: "#a5ffd6" },
  { z: 10, sym: "Ne", nombre: "Neón", masa: 20.18, shells: [2, 8], color: "#ffadd9" },
  { z: 11, sym: "Na", nombre: "Sodio", masa: 22.99, shells: [2, 8, 1], color: "#c8b6ff" },
  { z: 12, sym: "Mg", nombre: "Magnesio", masa: 24.305, shells: [2, 8, 2], color: "#b6ffd9" },
  { z: 13, sym: "Al", nombre: "Aluminio", masa: 26.982, shells: [2, 8, 3], color: "#d6dde4" },
  { z: 14, sym: "Si", nombre: "Silicio", masa: 28.086, shells: [2, 8, 4], color: "#b3bcc7" },
  { z: 15, sym: "P", nombre: "Fósforo", masa: 30.974, shells: [2, 8, 5], color: "#ffcf99" },
  { z: 16, sym: "S", nombre: "Azufre", masa: 32.06, shells: [2, 8, 6], color: "#ffe28a" },
  { z: 17, sym: "Cl", nombre: "Cloro", masa: 35.45, shells: [2, 8, 7], color: "#bdf5a3" },
  { z: 18, sym: "Ar", nombre: "Argón", masa: 39.948, shells: [2, 8, 8], color: "#c3a3ff" },
  { z: 19, sym: "K", nombre: "Potasio", masa: 39.098, shells: [2, 8, 8, 1], color: "#dabfff" },
  { z: 20, sym: "Ca", nombre: "Calcio", masa: 40.078, shells: [2, 8, 8, 2], color: "#a8f0c0" },
];

const fmt = (n: number, dec = 0) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });

/* ── Constructor de átomos: límites y reparto de capas ─────────────────── */
type Particula = "p" | "n" | "e";
const MAX_P = 20; // hasta Z=20 (Ca), el alcance de la tabla del laboratorio
const MAX_N = 26;
const MAX_E = 22;

// Capacidad de cada capa (regla 2-8-18…) para repartir electrones al construir.
const CAPACIDAD = [2, 8, 18, 32, 32, 18, 8];
function repartirCapas(e: number): number[] {
  const out: number[] = [];
  let rest = e;
  for (const cap of CAPACIDAD) {
    if (rest <= 0) break;
    const n = Math.min(cap, rest);
    out.push(n);
    rest -= n;
  }
  return out.length ? out : [0];
}

const PARTICULAS: { tipo: Particula; label: string; color: string; carga: string; desc: string }[] = [
  { tipo: "p", label: "Protón", color: PROTON_COLOR, carga: "+1", desc: "Define el elemento (núcleo)" },
  { tipo: "n", label: "Neutrón", color: NEUTRON_COLOR, carga: "0", desc: "Aporta masa (núcleo)" },
  { tipo: "e", label: "Electrón", color: ELECTRON_COLOR, carga: "−1", desc: "Orbita en las capas" },
];

/* ── Componentes de UI (declarados fuera del render: estado estable) ──── */

// Tile de modelo histórico (seleccionable)
const ModelTile = ({
  active,
  modelo,
  onClick,
}: {
  active: boolean;
  modelo: Modelo;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="ex-tile"
    data-on={active}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "11px 13px",
      textAlign: "left",
      cursor: "pointer",
      borderRadius: 13,
      border: active ? `1.5px solid ${modelo.col}` : `1px solid ${T.line}`,
      background: active ? `${modelo.col}1f` : T.glass,
      boxShadow: active ? `0 0 18px -4px ${modelo.col}` : "none",
      transition: "all 0.16s ease",
      width: "100%",
    }}
  >
    <span
      style={{
        width: 34,
        height: 34,
        flexShrink: 0,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        color: active ? "#fff" : modelo.col,
        background: active ? modelo.col : `${modelo.col}22`,
        boxShadow: active ? `0 6px 16px -6px ${modelo.col}` : "none",
      }}
    >
      <i className={`fa-solid ${modelo.icon}`} />
    </span>
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: "block", fontSize: 14, fontWeight: 800, color: T.text, lineHeight: 1.2 }}>
        {modelo.label} <span style={{ fontSize: 11.5, fontWeight: 600, color: T.text3, ...NUM }}>· {modelo.year}</span>
      </span>
      <span style={{ display: "block", fontSize: 11.5, color: T.text3 }}>{modelo.cientifico}</span>
    </span>
    {active && <i className="fa-solid fa-check" style={{ fontSize: 12, color: modelo.col }} />}
  </button>
);

// Punto de la leyenda de partículas
const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: T.text2, fontWeight: 600 }}>
    <span style={{ width: 11, height: 11, borderRadius: "50%", background: color, boxShadow: `0 0 8px -1px ${color}` }} />
    {label}
  </span>
);

/* ── Línea del tiempo de los modelos: el "porqué" de la evolución ─────── */
const Timeline = ({ activo, onPick }: { activo: ModeloKey; onPick: (k: ModeloKey) => void }) => {
  const idxActivo = MODELOS.findIndex((m) => m.key === activo);
  return (
    <div>
      <Eyebrow>Línea del tiempo de los modelos</Eyebrow>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* línea base */}
        <div style={{ position: "absolute", left: 16, right: 16, top: 16, height: 2, background: T.lineStrong }} />
        {/* progreso recorrido */}
        <div
          style={{
            position: "absolute",
            left: 16,
            top: 16,
            height: 2,
            width: `calc((100% - 32px) * ${idxActivo / (MODELOS.length - 1)})`,
            background: MODELOS[idxActivo]!.col,
            boxShadow: `0 0 10px -1px ${MODELOS[idxActivo]!.col}`,
            transition: "width 0.4s ease, background 0.3s ease",
          }}
        />
        {MODELOS.map((m, i) => {
          const on = i <= idxActivo;
          const isActivo = m.key === activo;
          return (
            <button
              key={m.key}
              onClick={() => onPick(m.key)}
              style={{
                position: "relative",
                zIndex: 1,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span
                style={{
                  width: isActivo ? 34 : 24,
                  height: isActivo ? 34 : 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isActivo ? 14 : 11,
                  color: on ? "#fff" : T.text3,
                  background: on ? m.col : T.inset,
                  border: `2px solid ${on ? m.col : T.lineStrong}`,
                  boxShadow: isActivo ? `0 0 16px -2px ${m.col}` : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <i className={`fa-solid ${m.icon}`} />
              </span>
              <span style={{ fontSize: 10.5, fontWeight: isActivo ? 800 : 600, color: isActivo ? T.text : T.text3, ...NUM }}>{m.year}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ── Aporte y límite del modelo activo ────────────────────────────────── */
const AporteLimite = ({ modelo }: { modelo: Modelo }) => (
  <div>
    <Eyebrow>Aporte y límite del modelo</Eyebrow>
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-plus" style={{ color: "#34D399", fontSize: 15, marginTop: 1, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
          <strong style={{ color: T.text }}>Aporta:</strong> {modelo.aporte}
        </p>
      </div>
      <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-exclamation" style={{ color: "#FBBF24", fontSize: 15, marginTop: 1, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
          <strong style={{ color: T.text }}>Su límite:</strong> {modelo.limite}
        </p>
      </div>
    </div>
  </div>
);

const RETO_KEY = "cen-modelos-atomicos-reto";

export function LabModelosAtomicos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modo, setModo] = useState<"explorar" | "construir">("explorar");
  const [modeloKey, setModeloKey] = useState<ModeloKey>("dalton");
  const [elementoSym, setElementoSym] = useState("C");
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [visitados, setVisitados] = useState<Set<ModeloKey>>(() => new Set<ModeloKey>(["dalton"]));
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // Constructor de átomos (modo "construir"): el alumno arrastra partículas.
  const [bp, setBp] = useState(0); // protones armados
  const [bn, setBn] = useState(0); // neutrones armados
  const [be, setBe] = useState(0); // electrones armados
  const [dragOver, setDragOver] = useState(false);
  const [logros, setLogros] = useState<Set<string>>(() => new Set<string>());
  // teoría (cajón deslizable) y sonido
  const [drawer, setDrawer] = useState(false);
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

  const modelo = MODELOS.find((m) => m.key === modeloKey)!;
  const elemento = ELEMENTOS.find((e) => e.sym === elementoSym)!;
  const idxModelo = MODELOS.findIndex((m) => m.key === modeloKey);
  const enConstruccion = modo === "construir";

  // ── Identidad del átomo que el alumno está armando ──────────────────
  const elementoConstruido = ELEMENTOS.find((e) => e.z === bp) ?? null;
  const carga = bp - be; // >0 catión, <0 anión, 0 neutro
  const numMasaConstruido = bp + bn;
  const isotopoComun = elementoConstruido ? Math.round(elementoConstruido.masa) : 0;
  const esIsotopo = !!elementoConstruido && bp > 0 && numMasaConstruido !== isotopoComun;
  const shellsConstruido =
    elementoConstruido && be === bp ? elementoConstruido.shells : repartirCapas(be);

  // Composición efectiva (lo que se manda a la escena 3D):
  // en "explorar" = elemento real; en "construir" = lo que armó el alumno.
  const A = Math.round(elemento.masa);
  const protones = enConstruccion ? bp : elemento.z;
  const neutrones = enConstruccion ? bn : Math.max(0, A - elemento.z);
  const electrones = enConstruccion ? be : elemento.z;
  const shells = enConstruccion ? shellsConstruido : elemento.shells;
  // Dalton/Thomson no muestran partículas: al construir usamos Bohr para verlas.
  const modeloEfectivo: ModeloKey =
    enConstruccion && (modeloKey === "dalton" || modeloKey === "thomson") ? "bohr" : modeloKey;

  // Registra un logro del constructor (una sola vez) + sonido de acierto.
  const marcarLogro = useCallback(
    (id: string) => {
      setLogros((prev) => {
        if (prev.has(id)) return prev;
        if (sonido) audioRef.current?.correcto();
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    },
    [sonido],
  );

  // Evalúa los logros con los conteos resultantes (se llama tras cada cambio).
  const evaluarLogros = useCallback(
    (p: number, n: number, e: number) => {
      if (p > 0) marcarLogro("primer-proton");
      if (p > 0 && p === e) marcarLogro("neutro");
      if (p > 0 && p !== e) marcarLogro("ion");
      const el = ELEMENTOS.find((x) => x.z === p);
      if (el && p > 0 && p + n !== Math.round(el.masa)) marcarLogro("isotopo");
    },
    [marcarLogro],
  );

  // Agrega una partícula (por arrastre o por clic).
  const agregar = useCallback(
    (tipo: Particula) => {
      if (sonido) audioRef.current?.blip();
      let p = bp, n = bn, e = be;
      if (tipo === "p") p = Math.min(MAX_P, bp + 1);
      else if (tipo === "n") n = Math.min(MAX_N, bn + 1);
      else e = Math.min(MAX_E, be + 1);
      setBp(p);
      setBn(n);
      setBe(e);
      evaluarLogros(p, n, e);
    },
    [bp, bn, be, sonido, evaluarLogros],
  );

  const quitar = useCallback(
    (tipo: Particula) => {
      let p = bp, n = bn, e = be;
      if (tipo === "p") p = Math.max(0, bp - 1);
      else if (tipo === "n") n = Math.max(0, bn - 1);
      else e = Math.max(0, be - 1);
      setBp(p);
      setBn(n);
      setBe(e);
      evaluarLogros(p, n, e);
    },
    [bp, bn, be, evaluarLogros],
  );

  const vaciar = useCallback(() => {
    setBp(0);
    setBn(0);
    setBe(0);
  }, []);

  const conteo = (tipo: Particula) => (tipo === "p" ? bp : tipo === "n" ? bn : be);

  const retosConstructor = [
    { id: "primer-proton", txt: "Arrastra tu primer protón al núcleo" },
    { id: "neutro", txt: "Arma un átomo neutro (protones = electrones)" },
    { id: "ion", txt: "Forma un ion (quita o agrega electrones)" },
    { id: "isotopo", txt: "Crea un isótopo (cambia los neutrones)" },
  ];

  const irAModelo = (k: ModeloKey) => {
    setModeloKey(k);
    if (sonido) audioRef.current?.blip();
    setVisitados((prev) => {
      if (prev.has(k)) return prev;
      const next = new Set(prev);
      next.add(k);
      return next;
    });
  };
  const paso = (dir: number) => {
    const i = Math.max(0, Math.min(MODELOS.length - 1, idxModelo + dir));
    irAModelo(MODELOS[i]!.key);
  };

  // ── Objetivos guiados (se marcan en vivo) ──────────────────────────
  const objetivos = [
    { txt: "Recorre los 5 modelos atómicos", done: visitados.size === MODELOS.length },
    { txt: "Observa el núcleo (de Rutherford en adelante)", done: ["rutherford", "bohr", "schrodinger"].includes(modeloKey) },
    { txt: "Identifica las capas de energía (Bohr)", done: modeloKey === "bohr" },
    { txt: "Llega al modelo cuántico (Schrödinger)", done: modeloKey === "schrodinger" },
    { txt: "Resuelve el reto de estructura atómica", done: ejercicioAprobado },
  ];
  // Los objetivos se recuerdan (algunos dependían del modo y se desmarcaban
  // solos) y se convierten en la marca del laboratorio, que antes no se
  // guardaba en ninguna parte.
  const { logros: logrosLab, cumplidos: cumplidosLab, total: totalLab } = useLogros(objetivos.map((o) => o.done));
  const { registraEstrellas } = useEstrellas(RETO_KEY);
  useEffect(() => {
    if (cumplidosLab === 0) return;
    const est = cumplidosLab >= totalLab ? 3 : cumplidosLab >= Math.ceil((totalLab * 2) / 3) ? 2 : 1;
    registraEstrellas(est);
  }, [cumplidosLab, totalLab, registraEstrellas]);

  const muestraNucleo = modeloKey === "rutherford" || modeloKey === "bohr" || modeloKey === "schrodinger";

  // Fallback 2D cuando no hay WebGL
  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div
        style={{
          width: 74,
          height: 74,
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          color: "#fff",
          background: modelo.col,
          boxShadow: `0 10px 30px -6px ${modelo.col}`,
        }}
      >
        <i className={`fa-solid ${modelo.icon}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>
        Modelo de {modelo.label} <span style={{ color: T.text3, fontWeight: 700 }}>({modelo.year})</span>
      </div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 340, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero el experimento sigue: {modelo.desc} Elemento:{" "}
        <strong style={{ color: T.text }}>{elemento.nombre}</strong> (Z = {protones}).
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulse 1.6s ease-in-out infinite; }
        .ex-tile:hover { border-color:${T.lineStrong} !important; background:${T.glassSoft} !important; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-divider { height:1px; background:${T.line}; margin:18px 0; }
        .ex-elem { cursor:pointer; aspect-ratio:1; border-radius:10px; border:1px solid ${T.line}; background:${T.glass};
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; transition:all .14s ease; padding:2px; }
        .ex-elem:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; }
        .ex-elem[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); box-shadow:0 0 16px -5px rgba(${color.rgba},0.7); }
        .ex-step { cursor:pointer; flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px;
          border-radius:11px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:13px; font-weight:700; transition:all .15s; }
        .ex-step:hover:not(:disabled) { color:#fff; border-color:${T.lineStrong}; }
        .ex-step:disabled { opacity:0.35; cursor:not-allowed; }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .ex-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ex-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ex-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .ex-drawer[data-open="true"] { transform:translateX(0); }
        .ex-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ex-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ex-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ex-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ex-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .ex-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }

        /* Selector de modo */
        .ma-seg { display:flex; gap:6px; padding:5px; border-radius:14px; background:${T.inset}; border:1px solid ${T.line}; margin-bottom:18px; }
        .ma-seg button { flex:1; display:flex; align-items:center; justify-content:center; gap:9px; padding:11px 14px;
          border-radius:10px; border:none; cursor:pointer; background:transparent; color:${T.text2}; font-size:13.5px; font-weight:800;
          transition:all .16s ease; }
        .ma-seg button[data-on="true"] { background:rgba(${color.rgba},0.20); color:#fff; box-shadow:0 0 18px -6px ${accent}; }
        .ma-seg button:hover:not([data-on="true"]) { color:#fff; background:rgba(255,255,255,0.06); }

        /* Fichas de partícula arrastrables */
        .ma-chip { display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:13px; border:1px solid ${T.line};
          background:${T.glass}; cursor:grab; transition:all .14s ease; user-select:none; }
        .ma-chip:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; transform:translateY(-1px); }
        .ma-chip:active { cursor:grabbing; transform:scale(0.98); }
        .ma-orb { width:34px; height:34px; flex-shrink:0; border-radius:50%; display:flex; align-items:center; justify-content:center;
          font-size:13px; font-weight:900; color:#06121f; }
        .ma-pm { width:30px; height:30px; border-radius:9px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text};
          font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .14s; }
        .ma-pm:hover:not(:disabled) { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ma-pm:disabled { opacity:0.3; cursor:not-allowed; }
      `}</style>

      {/* Selector de modo: explorar la historia · o construir tu propio átomo */}
      <div className="ma-seg" role="tablist">
        <button
          role="tab"
          data-on={modo === "explorar"}
          onClick={() => {
            setModo("explorar");
            if (sonido) audioRef.current?.blip();
          }}
        >
          <i className="fa-solid fa-timeline" /> Explorar modelos
        </button>
        <button
          role="tab"
          data-on={modo === "construir"}
          onClick={() => {
            setModo("construir");
            if (modeloKey === "dalton" || modeloKey === "thomson") setModeloKey("bohr");
            if (sonido) audioRef.current?.blip();
          }}
        >
          <i className="fa-solid fa-hand-pointer" /> Construir átomo
        </button>
      </div>

      <div className="ex-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Escena 3D */}
          <div
            onDragOver={
              enConstruccion
                ? (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "copy";
                    if (!dragOver) setDragOver(true);
                  }
                : undefined
            }
            onDragLeave={enConstruccion ? () => setDragOver(false) : undefined}
            onDrop={
              enConstruccion
                ? (e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const tipo = e.dataTransfer.getData("text/particula") as Particula;
                    if (tipo === "p" || tipo === "n" || tipo === "e") agregar(tipo);
                  }
                : undefined
            }
            style={{
              position: "relative",
              height: "clamp(460px, 66vh, 780px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 50% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06182f 0%,#020d1d 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <ModelosAtomicosScene
                modelo={modeloEfectivo}
                protones={protones}
                neutrones={neutrones}
                electrones={electrones}
                shells={shells}
                elementColor={enConstruccion ? elementoConstruido?.color ?? "#cfe6ff" : elemento.color}
                accent={accent}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Realce visual + pista al arrastrar (no captura punteros: deja girar el átomo) */}
            {enConstruccion && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  borderRadius: 20,
                  border: dragOver ? `2px dashed ${accent}` : "2px dashed transparent",
                  background: dragOver ? `rgba(${color.rgba},0.10)` : "transparent",
                  transition: "all .15s ease",
                }}
              >
                {bp + bn + be === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%,-50%)",
                      textAlign: "center",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    <i className="fa-solid fa-hand-pointer" style={{ fontSize: 30, marginBottom: 12, color: accent }} />
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>Arrastra partículas aquí</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>protones y neutrones forman el núcleo; los electrones, las capas</div>
                  </div>
                )}
              </div>
            )}

            {/* Cinta EN VIVO + modelo */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px 8px 12px",
                borderRadius: 999,
                background: "rgba(2,12,28,0.74)",
                border: `1px solid ${modelo.col}66`,
                backdropFilter: "blur(10px)",
              }}
            >
              <span
                className="ex-live-dot"
                style={{ ["--exc" as string]: `${modelo.col}aa`, width: 9, height: 9, borderRadius: "50%", background: modelo.col }}
              />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <i className={`fa-solid ${modelo.icon}`} style={{ fontSize: 12, color: modelo.col }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: T.text }}>
                {modelo.label} <span style={{ color: T.text3, fontWeight: 600, ...NUM }}>· {modelo.year}</span>
              </span>
            </div>

            {/* Toolbar */}
            <div
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                display: "flex",
                gap: 2,
                padding: 4,
                borderRadius: 12,
                background: "rgba(2,12,28,0.74)",
                border: `1px solid ${T.line}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={() => setResetNonce((n) => n + 1)} title="Reiniciar partículas">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Elemento grande (esquina inferior derecha) */}
            <div
              style={{
                position: "absolute",
                bottom: 14,
                right: 16,
                textAlign: "right",
                pointerEvents: "none",
                background: "rgba(2,12,28,0.6)",
                padding: "8px 14px",
                borderRadius: 13,
                backdropFilter: "blur(6px)",
                border: `1px solid rgba(${color.rgba},0.3)`,
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 900, color: T.text, lineHeight: 1, textShadow: `0 0 18px rgba(${color.rgba},0.5)` }}>
                {elemento.sym}
              </div>
              <div style={{ fontSize: 11, color: T.text3, fontWeight: 600, marginTop: 2, ...NUM }}>
                {elemento.nombre} · Z {elemento.z}
              </div>
            </div>

            {/* Leyenda de partículas (solo cuando se ven) */}
            {muestraNucleo && (
              <div
                style={{
                  position: "absolute",
                  bottom: 14,
                  left: 16,
                  display: "flex",
                  gap: 14,
                  pointerEvents: "none",
                  background: "rgba(2,12,28,0.6)",
                  padding: "7px 13px",
                  borderRadius: 999,
                  backdropFilter: "blur(6px)",
                }}
              >
                <LegendDot color={PROTON_COLOR} label="Protón" />
                <LegendDot color={NEUTRON_COLOR} label="Neutrón" />
                <LegendDot color={ELECTRON_COLOR} label="Electrón" />
              </div>
            )}

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Lectura del experimento: línea del tiempo + aporte/límite */}
          <div style={{ ...card, padding: "20px 22px" }}>
            <Timeline activo={modeloKey} onPick={irAModelo} />
            <div className="ex-divider" />
            <AporteLimite modelo={modelo} />
          </div>
        </div>

        {/* ── Columna controles (panel único) ────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          {/* Modelo actual */}
          <Eyebrow>Modelo actual</Eyebrow>
          <div
            style={{
              borderRadius: 14,
              border: `1px solid ${modelo.col}55`,
              background: `${modelo.col}14`,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                flexShrink: 0,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color: "#fff",
                background: modelo.col,
                boxShadow: `0 8px 22px -6px ${modelo.col}`,
              }}
            >
              <i className={`fa-solid ${modelo.icon}`} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 19, fontWeight: 900, color: T.text, lineHeight: 1.1 }}>
                {modelo.label} <span style={{ fontSize: 13, fontWeight: 700, color: T.text3, ...NUM }}>· {modelo.year}</span>
              </div>
              <div style={{ fontSize: 12.5, color: T.text2, marginTop: 3 }}>{modelo.desc}</div>
            </div>
          </div>

          {/* Pasos prev / next */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="ex-step" onClick={() => paso(-1)} disabled={idxModelo === 0}>
              <i className="fa-solid fa-arrow-left" /> Anterior
            </button>
            <button className="ex-step" onClick={() => paso(1)} disabled={idxModelo === MODELOS.length - 1}>
              Siguiente <i className="fa-solid fa-arrow-right" />
            </button>
          </div>

          <div className="ex-divider" />

          {/* Modelo (lista histórica) */}
          <Eyebrow>Modelos históricos</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MODELOS.map((m) => (
              <ModelTile key={m.key} active={m.key === modeloKey} modelo={m} onClick={() => irAModelo(m.key)} />
            ))}
          </div>

          <div className="ex-divider" />

          {/* Elemento (solo al explorar) */}
          {!enConstruccion && (
            <>
              <Eyebrow>Elemento</Eyebrow>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                {ELEMENTOS.map((e) => (
                  <button key={e.sym} className="ex-elem" data-on={e.sym === elementoSym} onClick={() => setElementoSym(e.sym)} title={`${e.nombre} (Z=${e.z})`}>
                    <span style={{ fontSize: 9, color: T.text3, ...NUM, lineHeight: 1 }}>{e.z}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: e.sym === elementoSym ? "#fff" : T.text2, lineHeight: 1.05 }}>{e.sym}</span>
                  </button>
                ))}
              </div>
              <div className="ex-divider" />
            </>
          )}

          {/* Constructor de átomos (modo construir): arrastra o pulsa +/− */}
          {enConstruccion && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Eyebrow>Tu átomo</Eyebrow>
                <button
                  onClick={vaciar}
                  disabled={bp + bn + be === 0}
                  style={{
                    cursor: bp + bn + be === 0 ? "not-allowed" : "pointer",
                    opacity: bp + bn + be === 0 ? 0.35 : 1,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: T.text3,
                    background: "transparent",
                    border: `1px solid ${T.line}`,
                    borderRadius: 8,
                    padding: "5px 10px",
                  }}
                >
                  <i className="fa-solid fa-trash-can" style={{ marginRight: 6 }} />
                  Vaciar
                </button>
              </div>

              {/* Identidad del átomo construido */}
              <div
                style={{
                  borderRadius: 14,
                  border: `1px solid ${bp > 0 ? accent + "66" : T.line}`,
                  background: bp > 0 ? `rgba(${color.rgba},0.10)` : T.inset,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    flexShrink: 0,
                    borderRadius: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: bp > 0 ? accent : T.glass,
                    color: bp > 0 ? "#06121f" : T.text3,
                    boxShadow: bp > 0 ? `0 8px 22px -8px ${accent}` : "none",
                  }}
                >
                  <span style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{elementoConstruido?.sym ?? "?"}</span>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: T.text, lineHeight: 1.15 }}>
                    {bp === 0 ? "Sin protones aún" : elementoConstruido ? elementoConstruido.nombre : `Z = ${bp} (fuera de la tabla)`}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7 }}>
                    {/* carga */}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        ...NUM,
                        padding: "3px 9px",
                        borderRadius: 999,
                        color: carga === 0 ? "#34D399" : carga > 0 ? "#F87171" : "#60A5FA",
                        background: carga === 0 ? "#34D39922" : carga > 0 ? "#F8717122" : "#60A5FA22",
                      }}
                    >
                      {bp === 0 ? "—" : carga === 0 ? "neutro" : carga > 0 ? `catión +${carga}` : `anión ${carga}`}
                    </span>
                    {/* número de masa */}
                    {bp > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 800, ...NUM, padding: "3px 9px", borderRadius: 999, color: T.text2, background: T.glass }}>
                        A = {numMasaConstruido}
                      </span>
                    )}
                    {/* isótopo */}
                    {esIsotopo && (
                      <span style={{ fontSize: 11, fontWeight: 800, ...NUM, padding: "3px 9px", borderRadius: 999, color: "#FBBF24", background: "#FBBF2422" }}>
                        isótopo
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bandeja de partículas: arrastra al visor o usa +/− */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                {PARTICULAS.map((pt) => {
                  const c = conteo(pt.tipo);
                  const max = pt.tipo === "p" ? MAX_P : pt.tipo === "n" ? MAX_N : MAX_E;
                  return (
                    <div
                      key={pt.tipo}
                      className="ma-chip"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/particula", pt.tipo);
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      onClick={() => agregar(pt.tipo)}
                      title={`Arrastra al visor o pulsa para añadir ${pt.label.toLowerCase()}`}
                    >
                      <span className="ma-orb" style={{ background: pt.color, boxShadow: `0 0 12px -2px ${pt.color}` }}>
                        {pt.carga}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: T.text, lineHeight: 1.15 }}>{pt.label}</div>
                        <div style={{ fontSize: 11, color: T.text3 }}>{pt.desc}</div>
                      </div>
                      <button
                        className="ma-pm"
                        disabled={c === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          quitar(pt.tipo);
                        }}
                        title="Quitar"
                      >
                        <i className="fa-solid fa-minus" />
                      </button>
                      <span style={{ minWidth: 26, textAlign: "center", fontSize: 15, fontWeight: 900, color: T.text, ...NUM }}>{c}</span>
                      <button
                        className="ma-pm"
                        disabled={c >= max}
                        onClick={(e) => {
                          e.stopPropagation();
                          agregar(pt.tipo);
                        }}
                        title="Añadir"
                      >
                        <i className="fa-solid fa-plus" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Retos del constructor */}
              <div style={{ marginTop: 14 }}>
                <Eyebrow>Retos de construcción</Eyebrow>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {retosConstructor.map((r) => {
                    const done = logros.has(r.id);
                    return (
                      <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: done ? "#34D399" : T.text2 }}>
                        <i className={`fa-solid ${done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 14, opacity: done ? 1 : 0.3 }} />
                        <span style={{ fontWeight: done ? 700 : 500 }}>{r.txt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ex-divider" />
            </>
          )}

          {/* Lecturas instrumento: composición */}
          <Eyebrow>Composición del átomo</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Protones" value={fmt(protones)} col={PROTON_COLOR} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Neutrones" value={fmt(neutrones)} col={NEUTRON_COLOR} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Electrones" value={fmt(electrones)} col={ELECTRON_COLOR} />
          </div>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 9 }}>
            <Readout label="N.º atómico (Z)" value={fmt(protones)} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Masa atómica" value={fmt(elemento.masa, 2)} unit="u" />
          </div>

          {/* Configuración por capas */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase" }}>
                Electrones por capa
              </span>
              <span style={{ fontSize: 11, color: T.text3 }}>{elemento.shells.length} {elemento.shells.length === 1 ? "capa" : "capas"}</span>
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {elemento.shells.map((c, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: `${ELECTRON_COLOR}1a`,
                    border: `1px solid ${ELECTRON_COLOR}40`,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: T.text,
                    ...NUM,
                  }}
                >
                  <span style={{ fontSize: 10, color: T.text3 }}>n{i + 1}</span> {c} e⁻
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Objetivos + pista ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
            Objetivos
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {objetivos.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: logrosLab[i] ? "#34D399" : T.text2 }}>
                <i className={`fa-solid ${logrosLab[i] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: logrosLab[i] ? 1 : 0.3 }} />
                <span style={{ fontWeight: logrosLab[i] ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            borderRadius: 18,
            padding: "18px 20px",
            border: `1px solid rgba(${color.rgba},0.3)`,
            background: `rgba(${color.rgba},0.08)`,
            fontSize: 13.5,
            color: T.text2,
            lineHeight: 1.55,
            display: "flex",
            gap: 13,
          }}
        >
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            Cada modelo no «borra» al anterior: lo <strong style={{ color: T.text }}>corrige y amplía</strong>. La ciencia avanza así,
            con evidencia nueva. Cambia de elemento y observa cómo crece el <strong style={{ color: T.text }}>núcleo</strong> y se llenan
            las <strong style={{ color: T.text }}>capas</strong>.
          </span>
        </div>
      </div>

      {/* ── Reto evaluable: el quiz verbatim del ancla ───────────────── */}
      <RetoQuizCard
        quiz={QUIZ_A2}
        accent={accent}
        rgba={color.rgba}
        aprobado={ejercicioAprobado}
        mensajeAprobado="¡Aprobado! Dominas la estructura del átomo."
        onAprobado={() => setEjercicioAprobado(true)}
        playSfx={
          sonido
            ? (ok) => {
                if (ok) audioRef.current?.correcto();
                else audioRef.current?.incorrecto();
              }
            : undefined
        }
        playPick={sonido ? () => audioRef.current?.blip() : undefined}
      />

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <div className="ex-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ex-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ex-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ex-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ex-drawer-body">
          <FichaTeorica data={MODELOS_ATOMICOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}
