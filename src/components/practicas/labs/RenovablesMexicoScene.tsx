"use client";

/**
 * Escena 3D del laboratorio "Energías renovables y no renovables en México"
 * (CNEYT-II, progresión 11). Tres vistas:
 *
 *  - mapa: relieve estilizado de México con doce centrales reales; cada una es
 *    una columna de vidrio cuya altura es la capacidad instalada y cuyo relleno
 *    es la energía que de verdad genera en un año (factor de planta).
 *  - red: una región con campo solar, aerogeneradores, geotermia, baterías,
 *    central de gas y ciudad, que viven hora a hora el despacho simulado.
 *  - mezcla: torres de la mezcla nacional con sus nubes de CO₂, o las
 *    columnas de barriles de la producción petrolera 2004–2023.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type TecId,
  type Mezcla,
  type ParamsRed,
  type ResultadoRed,
  TEC,
  CENTRALES,
  CONTORNO_MEXICO,
  proyecta,
  generacionGWh,
  FP_SOLAR_TIPICO,
  SOL,
  alturaSol,
  factorEolico,
  pasoEn,
  horaTexto,
  TWH_MEXICO,
  emisionesMt,
  pctLimpia,
  META_LIMPIA,
  PRODUCCION,
  num,
} from "./renovables-mexico-data";

export type VistaRenovables = "mapa" | "red" | "mezcla";
export type SubMezcla = "emisiones" | "agotamiento";

export interface RenovablesSceneProps {
  vista: VistaRenovables;
  modoColor: string;
  resetNonce: number;
  // Mapa
  centralSel: string;
  revelado: boolean;
  solarEquivMW: number;
  onSelCentral: (id: string) => void;
  // Red
  params: ParamsRed;
  red: ResultadoRed;
  hora: number;
  // Mezcla
  subMezcla: SubMezcla;
  mezcla: Mezcla;
  anioIdx: number;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const NO = "#f87171";

function Etiqueta({ pos, children, df = 10, col, fs = 12 }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.86)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: fs,
          fontWeight: 800,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 18px -8px #000",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/** Bocanadas de humo o vapor que suben en bucle; `nivel` (0–1) regula su tamaño. */
function Humo({ pos, color, n = 4, escala = 1, altura = 0.5, nivel = 1, opacidad = 0.55 }: { pos: Pt; color: string; n?: number; escala?: number; altura?: number; nivel?: number; opacidad?: number }) {
  const grupo = useRef<THREE.Group>(null);
  const actual = useRef(nivel);
  useFrame(({ clock }, dt) => {
    actual.current += (nivel - actual.current) * suave(dt, 0.06);
    const g = grupo.current;
    if (!g) return;
    g.children.forEach((c, k) => {
      const p = (clock.elapsedTime * 0.35 + k / n) % 1;
      c.position.set(Math.sin(k * 2.3 + p * 3) * 0.08 * escala, p * altura, Math.cos(k * 1.7 + p * 2) * 0.05 * escala);
      c.scale.setScalar(actual.current < 0.02 ? 0.0001 : (0.25 + p * 0.9) * escala * 0.1 * (0.4 + 0.6 * actual.current));
    });
  });
  return (
    <group ref={grupo} position={pos}>
      {Array.from({ length: n }, (_, k) => (
        <mesh key={k}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={color} transparent opacity={opacidad} depthWrite={false} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/** Aerogenerador: torre, góndola y rotor de tres aspas que gira con `vel` (rad/s). */
function Aerogenerador({ pos, alto = 1, vel }: { pos: Pt; alto?: number; vel: number }) {
  const rotor = useRef<THREE.Group>(null);
  const w = useRef(vel);
  useFrame((_, dt) => {
    w.current += (vel - w.current) * suave(dt, 0.04);
    if (rotor.current) rotor.current.rotation.z -= w.current * Math.min(dt, 0.25);
  });
  return (
    <group position={pos} scale={alto}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.04, 1, 10]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.0, 0.02]}>
        <boxGeometry args={[0.07, 0.06, 0.14]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
      </mesh>
      <group ref={rotor} position={[0, 1.0, 0.1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.03, 0.06, 10]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} rotation={[0, 0, (k * 2 * Math.PI) / 3]} position={[0, 0, 0]}>
            <boxGeometry args={[0.035, 0.72, 0.01]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.35} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. MAPA DE CENTRALES
 * ════════════════════════════════════════════════════════════════════════ */

const PROF_MAPA = 0.2;
const TOPE = PROF_MAPA + 0.04;

const GEO_MEXICO = (() => {
  const forma = new THREE.Shape();
  CONTORNO_MEXICO.forEach(([lon, lat], i) => {
    const [x, z] = proyecta(lon, lat);
    if (i === 0) forma.moveTo(x, -z);
    else forma.lineTo(x, -z);
  });
  return new THREE.ExtrudeGeometry(forma, { depth: PROF_MAPA, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 2, curveSegments: 1 });
})();

const MAT_MEXICO = [new THREE.MeshStandardMaterial({ color: "#34523d", roughness: 0.85, flatShading: true }), new THREE.MeshStandardMaterial({ color: "#1b2e22", roughness: 0.9 })];

/** Sierras (lon, lat, altura, radio): Sierra Madre Occidental, Oriental, Eje Neovolcánico, del Sur, Chiapas y Baja California. */
const SIERRAS: [number, number, number, number, boolean?][] = [
  [-107.6, 28.6, 0.26, 0.34],
  [-106.6, 26.6, 0.3, 0.36],
  [-105.6, 24.6, 0.26, 0.32],
  [-104.7, 22.7, 0.22, 0.28],
  [-100.9, 25.6, 0.2, 0.26],
  [-99.9, 23.6, 0.22, 0.24],
  [-103.6, 19.5, 0.26, 0.18, true],
  [-99.3, 19.35, 0.2, 0.16],
  [-98.62, 19.02, 0.34, 0.15, true],
  [-97.27, 18.9, 0.36, 0.14, true],
  [-99.6, 17.6, 0.2, 0.26],
  [-97.0, 17.2, 0.22, 0.24],
  [-92.6, 16.3, 0.2, 0.24],
  [-115.6, 31.0, 0.2, 0.22],
  [-113.0, 28.1, 0.14, 0.18],
  [-111.6, 25.8, 0.12, 0.16],
];

const altoColumna = (mw: number) => 0.3 + (mw / 2800) * 1.8;

function IconoCentral({ tec }: { tec: TecId }) {
  const col = TEC[tec].color;
  if (tec === "eolica")
    return (
      <group>
        <Aerogenerador pos={[-0.07, 0, 0]} alto={0.3} vel={3} />
        <Aerogenerador pos={[0.08, 0, -0.03]} alto={0.26} vel={3.4} />
      </group>
    );
  if (tec === "solar")
    return (
      <group>
        {[-0.07, 0.07].map((x) => (
          <mesh key={x} position={[x, 0.05, 0]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[0.12, 0.01, 0.1]} />
            <meshStandardMaterial color="#1e3a8a" metalness={0.6} roughness={0.25} emissive="#1d4ed8" emissiveIntensity={0.25} />
          </mesh>
        ))}
      </group>
    );
  if (tec === "geotermia")
    return (
      <group>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.14, 0.08, 0.1]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        <mesh position={[0.05, 0.09, 0]}>
          <cylinderGeometry args={[0.025, 0.035, 0.1, 10]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <Humo pos={[0.05, 0.14, 0]} color="#f8fafc" n={4} escala={0.9} altura={0.4} opacidad={0.5} />
      </group>
    );
  if (tec === "hidro")
    return (
      <group>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.2, 0.12, 0.035]} />
          <meshStandardMaterial color="#d6d3d1" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.1, -0.06]}>
          <boxGeometry args={[0.2, 0.02, 0.09]} />
          <meshStandardMaterial color={col} roughness={0.15} metalness={0.2} emissive={col} emissiveIntensity={0.25} />
        </mesh>
      </group>
    );
  if (tec === "nuclear")
    return (
      <group>
        {[-0.05, 0.05].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.045, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.09, 16]} />
              <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.09, 0]}>
              <sphereGeometry args={[0.04, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>
    );
  const humo = tec === "gas" ? "#cbd5e1" : tec === "bio" ? "#a3a3a3" : "#57534e";
  return (
    <group>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.13, 0.08, 0.1]} />
        <meshStandardMaterial color={tec === "bio" ? "#a16207" : "#64748b"} roughness={0.6} />
      </mesh>
      <mesh position={[0.045, 0.12, 0]}>
        <cylinderGeometry args={[0.014, 0.02, tec === "bio" ? 0.12 : 0.2, 10]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
      <Humo pos={[0.045, tec === "bio" ? 0.18 : 0.23, 0]} color={humo} n={4} escala={tec === "gas" ? 0.8 : 1.1} altura={0.4} opacidad={tec === "gas" ? 0.4 : 0.7} />
    </group>
  );
}

function ColumnaCentral({ id, sel, revelado, onSel }: { id: string; sel: boolean; revelado: boolean; onSel: (id: string) => void }) {
  const c = CENTRALES.find((x) => x.id === id)!;
  const [x, z] = proyecta(c.lon, c.lat);
  const H = altoColumna(c.mw);
  const col = TEC[c.tec].color;
  const relleno = useRef<THREE.Mesh>(null);
  const aro = useRef<THREE.Mesh>(null);
  const alto = useRef(0);
  useFrame(({ clock }, dt) => {
    alto.current += ((revelado ? H * c.fp : 0) - alto.current) * suave(dt, 0.05);
    if (relleno.current) {
      relleno.current.scale.y = Math.max(0.001, alto.current);
      relleno.current.position.y = alto.current / 2;
      relleno.current.visible = alto.current > 0.005;
    }
    if (aro.current) {
      const s = 1 + 0.18 * Math.sin(clock.elapsedTime * 4);
      aro.current.scale.set(s, s, 1);
      aro.current.visible = sel;
    }
  });
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSel(id);
  };
  return (
    <group position={[x, TOPE, z]}>
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 24]} />
        <meshBasicMaterial color={col} transparent opacity={0.55} />
      </mesh>
      <mesh ref={aro} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.14, 0.18, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, H / 2, 0]}>
        <cylinderGeometry args={[0.065, 0.065, H, 20, 1, true]} />
        <meshStandardMaterial color={col} transparent opacity={sel ? 0.3 : 0.16} emissive={col} emissiveIntensity={0.15} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, H, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.055, 0.07, 24]} />
        <meshBasicMaterial color={col} />
      </mesh>
      <mesh ref={relleno} visible={false}>
        <cylinderGeometry args={[0.048, 0.048, 1, 16]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.55} roughness={0.35} />
      </mesh>
      <group position={[0, H, 0]}>
        <IconoCentral tec={c.tec} />
      </group>
      <mesh
        position={[0, H / 2 + 0.1, 0]}
        onClick={click}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <cylinderGeometry args={[0.15, 0.15, H + 0.3, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {sel && (
        <Etiqueta pos={[0, H + 0.5, 0]} df={6.5} col={`${col}cc`} fs={11.5}>
          <i className={`fa-solid ${TEC[c.tec].icono}`} style={{ color: col }} />
          {c.nombre} · {num(c.mw)} MW{revelado ? ` · ${num(generacionGWh(c.mw, c.fp))} GWh/año` : ""}
        </Etiqueta>
      )}
    </group>
  );
}

const N_PANELES_MAPA = 80;
const GRANJA: [number, number] = proyecta(-110.2, 29.85);

function GranjaSolarMapa({ mw }: { mw: number }) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const n = Math.min(N_PANELES_MAPA, Math.round(mw / 100));
  const cuenta = useRef(0);
  useFrame((_, dt) => {
    cuenta.current += (n - cuenta.current) * suave(dt, 0.12);
    const m = inst.current;
    if (!m) return;
    for (let i = 0; i < N_PANELES_MAPA; i++) {
      const fila = Math.floor(i / 10);
      const colu = i % 10;
      obj.position.set(GRANJA[0] - 0.45 + colu * 0.1, TOPE + 0.03, GRANJA[1] - 0.32 + fila * 0.085);
      obj.rotation.set(-0.45, 0, 0);
      const s = Math.min(1, Math.max(0, cuenta.current - i));
      obj.scale.setScalar(s < 0.02 ? 0.0001 : s);
      obj.updateMatrix();
      m.setMatrixAt(i, obj.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={inst} args={[undefined, undefined, N_PANELES_MAPA]} frustumCulled={false}>
        <boxGeometry args={[0.085, 0.008, 0.065]} />
        <meshStandardMaterial color="#1e40af" metalness={0.6} roughness={0.25} emissive="#2563eb" emissiveIntensity={0.35} />
      </instancedMesh>
      {mw > 0 && (
        <Etiqueta pos={[GRANJA[0] + 0.3, TOPE + 0.12, GRANJA[1] + 0.6]} df={6.5} col="#facc15cc" fs={11}>
          <i className="fa-solid fa-solar-panel" style={{ color: "#facc15" }} />
          Tus paneles en Sonora: {num(mw)} MW · {num(generacionGWh(mw, FP_SOLAR_TIPICO))} GWh/año
        </Etiqueta>
      )}
    </>
  );
}

function EscenaMapa({ centralSel, revelado, solarEquivMW, onSelCentral }: { centralSel: string; revelado: boolean; solarEquivMW: number; onSelCentral: (id: string) => void }) {
  return (
    <group position={[0, -0.6, 0]}>
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 72]} />
        <meshStandardMaterial color="#0a2540" roughness={0.3} metalness={0.15} />
      </mesh>
      {Array.from({ length: 5 }, (_, k) => (
        <mesh key={k} position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2 + k * 1.6, 2.012 + k * 1.6, 96]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.08} />
        </mesh>
      ))}
      <mesh geometry={GEO_MEXICO} material={MAT_MEXICO} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow />
      {SIERRAS.map(([lon, lat, h, r, nieve], k) => {
        const [x, z] = proyecta(lon, lat);
        return (
          <group key={k} position={[x, TOPE, z]}>
            <mesh position={[0, h / 2, 0]} castShadow>
              <coneGeometry args={[r, h, 6]} />
              <meshStandardMaterial color="#56694a" roughness={0.95} flatShading />
            </mesh>
            {nieve && (
              <mesh position={[0, h * 0.86, 0]}>
                <coneGeometry args={[r * 0.26, h * 0.28, 6]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} flatShading />
              </mesh>
            )}
          </group>
        );
      })}
      {CENTRALES.map((c) => (
        <ColumnaCentral key={c.id} id={c.id} sel={c.id === centralSel} revelado={revelado} onSel={onSelCentral} />
      ))}
      <GranjaSolarMapa mw={solarEquivMW} />
      <Etiqueta pos={[proyecta(-88.5, 26.5)[0], 0.2, proyecta(-88.5, 26.5)[1]]} df={10} fs={10.5} col="#38bdf866">
        Golfo de México
      </Etiqueta>
      <Etiqueta pos={[proyecta(-110, 17.2)[0], 0.2, proyecta(-110, 17.2)[1]]} df={10} fs={10.5} col="#38bdf866">
        Océano Pacífico
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. UN DÍA EN LA RED
 * ════════════════════════════════════════════════════════════════════════ */

const N_PANELES = 90;
const N_EDIFICIOS = 34;
const N_CONTENEDORES = 12;
const POS_TURBINAS: Pt[] = [
  [-6.2, 0, -3.0],
  [-4.8, 0, -3.0],
  [-3.4, 0, -3.0],
  [-2.0, 0, -3.0],
  [-5.5, 0, -4.6],
  [-4.1, 0, -4.6],
  [-2.7, 0, -4.6],
  [-1.3, 0, -4.6],
];
const SUBESTACION: Pt = [2.2, 0, -0.6];
const ORIGENES: { id: "solar" | "eolica" | "bateria" | "gas" | "geo"; pos: Pt; color: string }[] = [
  { id: "solar", pos: [-3.2, 0, 1.8], color: "#facc15" },
  { id: "eolica", pos: [-3.6, 0, -3.6], color: "#5eead4" },
  { id: "bateria", pos: [3.6, 0, 2.6], color: "#34d399" },
  { id: "gas", pos: [1.9, 0, -4.4], color: "#fb923c" },
  { id: "geo", pos: [0.2, 0, 2.8], color: "#f472b6" },
];
const N_PULSOS = 7;

const EDIFICIOS = Array.from({ length: N_EDIFICIOS }, (_, i) => {
  const a = i * 2.39996;
  const r = 0.35 + Math.sqrt(i / N_EDIFICIOS) * 1.75;
  return { x: 4.5 + Math.cos(a) * r, z: -0.7 + Math.sin(a) * r * 0.7, h: 0.35 + ((i * 7919) % 13) / 13 + (i < 6 ? 0.9 : 0), w: 0.28 + ((i * 31) % 5) * 0.03 };
});

function EscenaRed({ params, red, hora, modoColor }: { params: ParamsRed; red: ResultadoRed; hora: number; modoColor: string }) {
  const paso = pasoEn(red, hora);
  const nPaneles = Math.min(N_PANELES, Math.round(params.solarMW / 34));
  const nTurbinas = Math.min(POS_TURBINAS.length, Math.round(params.eolicaMW / 250));
  const nCont = Math.min(N_CONTENEDORES, Math.ceil(params.bateriaMWh / 500));
  const fSol = params.solarMW > 0 ? paso.solar / params.solarMW : 0;
  const fViento = factorEolico(paso.h, params.estacion);
  const gasNivel = params.gasMW > 0 ? paso.gas / params.gasMW : 0;
  const deficit = paso.deficit > 0.5;
  const sol = SOL[params.estacion];
  const noche = paso.h < sol.sale || paso.h > sol.pone;

  const paneles = useRef<THREE.InstancedMesh>(null);
  const matPanel = useRef<THREE.MeshStandardMaterial>(null);
  const edificios = useRef<THREE.InstancedMesh>(null);
  const matCiudad = useRef<THREE.MeshStandardMaterial>(null);
  const astro = useRef<THREE.Mesh>(null);
  const luzSol = useRef<THREE.DirectionalLight>(null);
  const pulsos = useRef<THREE.InstancedMesh>(null);
  const cargas = useRef<THREE.Group>(null);
  const horaSuave = useRef(hora);
  const fase = useRef<number[]>([0, 0, 0, 0, 0]);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const cNoche = useMemo(() => new THREE.Color("#030712"), []);
  const cDia = useMemo(() => new THREE.Color("#2a5c93"), []);
  const cOcaso = useMemo(() => new THREE.Color("#9a3412"), []);
  const cTmp = useMemo(() => new THREE.Color(), []);
  const cVentana = useMemo(() => new THREE.Color("#fde68a"), []);
  const cApagon = useMemo(() => new THREE.Color("#7f1d1d"), []);

  const flujos = [paso.solar, paso.eolica, paso.descarga, paso.gas, paso.geo];

  useFrame((state, dt) => {
    const d = hora - horaSuave.current;
    if (Math.abs(d) > 3) horaSuave.current = hora;
    else horaSuave.current += d * suave(dt, 0.12);
    const h = horaSuave.current;
    const elev = alturaSol(h, params.estacion);
    // Cielo
    const bg = state.scene.background;
    if (bg instanceof THREE.Color) {
      const dia = Math.min(1, Math.max(0, elev * 2.2));
      cTmp.copy(cNoche).lerp(cDia, dia);
      const ocaso = Math.max(0, 1 - Math.abs(elev) * 5) * 0.55;
      cTmp.lerp(cOcaso, ocaso);
      bg.copy(cTmp);
      if (state.scene.fog) state.scene.fog.color.copy(cTmp);
    }
    // Sol que cruza el cielo
    const medio = (sol.sale + sol.pone) / 2;
    const ang = Math.PI / 2 - ((h - medio) / (sol.pone - sol.sale)) * Math.PI;
    if (astro.current) {
      astro.current.position.set(Math.cos(ang) * 7.5, -1 + Math.sin(ang) * 8, -14);
      astro.current.visible = elev > -0.15;
    }
    if (luzSol.current) {
      luzSol.current.position.set(Math.cos(ang) * 9, Math.max(1, Math.sin(ang) * 9), 4);
      luzSol.current.intensity = Math.max(0.08, elev) * 1.3;
    }
    // Paneles
    if (matPanel.current) matPanel.current.emissiveIntensity = 0.1 + fSol * 1.1;
    const mp = paneles.current;
    if (mp) {
      for (let i = 0; i < N_PANELES; i++) {
        const fila = Math.floor(i / 10);
        const colu = i % 10;
        obj.position.set(-5.4 + colu * 0.46, 0.22, 0.6 + fila * 0.42);
        obj.rotation.set(-0.55, 0, 0);
        obj.scale.setScalar(i < nPaneles ? 1 : 0.0001);
        obj.updateMatrix();
        mp.setMatrixAt(i, obj.matrix);
      }
      mp.instanceMatrix.needsUpdate = true;
    }
    // Ciudad
    const me = edificios.current;
    if (me) {
      EDIFICIOS.forEach((b, i) => {
        obj.position.set(b.x, b.h / 2, b.z);
        obj.rotation.set(0, 0, 0);
        obj.scale.set(b.w, b.h, b.w);
        obj.updateMatrix();
        me.setMatrixAt(i, obj.matrix);
      });
      me.instanceMatrix.needsUpdate = true;
    }
    if (matCiudad.current) {
      const parpadeo = deficit ? 0.25 + 0.25 * Math.max(0, Math.sin(state.clock.elapsedTime * 9)) : 1;
      matCiudad.current.emissive.copy(deficit ? cApagon : cVentana);
      matCiudad.current.emissiveIntensity = (Math.min(1, Math.max(0, 1 - elev * 1.6)) * 0.3 + 0.03) * parpadeo;
    }
    // Pulsos de energía hacia la subestación
    const pu = pulsos.current;
    if (pu) {
      ORIGENES.forEach((o, j) => {
        const f = flujos[j]!;
        fase.current[j] = (fase.current[j]! + Math.min(dt, 0.25) * (0.15 + f / 900)) % 1;
        for (let k = 0; k < N_PULSOS; k++) {
          const p = (fase.current[j]! + k / N_PULSOS) % 1;
          const x = o.pos[0] + (SUBESTACION[0] - o.pos[0]) * p;
          const z = o.pos[2] + (SUBESTACION[2] - o.pos[2]) * p;
          obj.position.set(x, 0.55 + Math.sin(p * Math.PI) * 0.35, z);
          obj.rotation.set(0, 0, 0);
          obj.scale.setScalar(f > 1 ? 0.05 + Math.min(0.06, f / 12000) : 0.0001);
          obj.updateMatrix();
          pu.setMatrixAt(j * N_PULSOS + k, obj.matrix);
        }
      });
      pu.instanceMatrix.needsUpdate = true;
    }
    // Carga de las baterías
    const g = cargas.current;
    if (g)
      g.children.forEach((c) => {
        const s = Math.max(0.02, paso.soc);
        c.scale.y = s;
        c.position.y = 0.06 + (0.26 * s) / 2;
      });
  });

  const pulsoColores = useMemo(() => {
    const arr = new Float32Array(ORIGENES.length * N_PULSOS * 3);
    const c = new THREE.Color();
    ORIGENES.forEach((o, j) => {
      c.set(o.color);
      for (let k = 0; k < N_PULSOS; k++) c.toArray(arr, (j * N_PULSOS + k) * 3);
    });
    return arr;
  }, []);

  const colBateria = paso.carga > 1 ? "#34d399" : paso.descarga > 1 ? "#fbbf24" : "#64748b";

  return (
    <group position={[0, -1.4, 0.6]}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[8.6, 8.6, 0.1, 72]} />
        <meshStandardMaterial color="#1f3322" roughness={1} />
      </mesh>
      <directionalLight ref={luzSol} position={[4, 9, 4]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
      <mesh ref={astro}>
        <sphereGeometry args={[0.6, 24, 16]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>

      {/* Campo solar */}
      <instancedMesh ref={paneles} args={[undefined, undefined, N_PANELES]} castShadow frustumCulled={false}>
        <boxGeometry args={[0.4, 0.03, 0.3]} />
        <meshStandardMaterial ref={matPanel} color="#1e3a8a" metalness={0.65} roughness={0.2} emissive="#3b82f6" emissiveIntensity={0.3} />
      </instancedMesh>
      <Etiqueta pos={[-3.3, 1.2, 1.4]} df={11} col="#facc15aa" fs={12}>
        <i className="fa-solid fa-solar-panel" style={{ color: "#facc15" }} />
        Solar {num(params.solarMW)} MW → {num(paso.solar)} MW
      </Etiqueta>

      {/* Viento */}
      {POS_TURBINAS.slice(0, nTurbinas).map((p, k) => (
        <Aerogenerador key={k} pos={p} alto={2} vel={0.5 + fViento * 7} />
      ))}
      {nTurbinas > 0 && (
        <Etiqueta pos={[-3.8, 2.75, -3.4]} df={11} col="#5eead4aa" fs={12}>
          <i className="fa-solid fa-wind" style={{ color: "#5eead4" }} />
          Eólica {num(params.eolicaMW)} MW → {num(paso.eolica)} MW
        </Etiqueta>
      )}

      {/* Geotermia de base */}
      <group position={[0.2, 0, 2.8]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.8, 0.5, 0.5]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        <mesh position={[0.25, 0.65, 0]}>
          <cylinderGeometry args={[0.1, 0.14, 0.4, 14]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <Humo pos={[0.25, 0.85, 0]} color="#f8fafc" n={5} escala={2.2} altura={1.2} opacidad={0.3} />
        <Etiqueta pos={[-0.9, 0.6, 0]} df={11} col="#f472b6aa" fs={11}>
          <i className="fa-solid fa-volcano" style={{ color: "#f472b6" }} />
          Geotermia {num(paso.geo)} MW · 24 h
        </Etiqueta>
      </group>

      {/* Baterías */}
      <group position={[3.6, 0, 2.6]}>
        {Array.from({ length: nCont }, (_, i) => (
          <mesh key={i} position={[-1.1 + (i % 6) * 0.44, 0.19, Math.floor(i / 6) * 0.5]} castShadow>
            <boxGeometry args={[0.36, 0.38, 0.4]} />
            <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
          </mesh>
        ))}
        <group ref={cargas}>
          {Array.from({ length: nCont }, (_, i) => (
            <mesh key={i} position={[-1.1 + (i % 6) * 0.44, 0.19, Math.floor(i / 6) * 0.5 + 0.205]}>
              <boxGeometry args={[0.24, 0.26, 0.02]} />
              <meshStandardMaterial color={colBateria} emissive={colBateria} emissiveIntensity={0.9} />
            </mesh>
          ))}
        </group>
        {nCont > 0 ? (
          <Etiqueta pos={[0, 1.0, 0.2]} df={11} col={`${colBateria}aa`} fs={11.5}>
            <i className="fa-solid fa-car-battery" style={{ color: colBateria }} />
            Batería {num(paso.soc * 100)} % · {paso.carga > 1 ? `carga ${num(paso.carga)} MW` : paso.descarga > 1 ? `entrega ${num(paso.descarga)} MW` : "en espera"}
          </Etiqueta>
        ) : (
          <Etiqueta pos={[0, 0.3, 0.2]} df={11} fs={10.5}>
            Sin baterías
          </Etiqueta>
        )}
      </group>

      {/* Central de gas */}
      <group position={[1.9, 0, -4.4]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1.4, 0.8, 0.9]} />
          <meshStandardMaterial color={params.gasMW > 0 ? "#64748b" : "#334155"} roughness={0.6} />
        </mesh>
        {[-0.35, 0.35].map((x) => (
          <group key={x}>
            <mesh position={[x, 1.2, -0.1]} castShadow>
              <cylinderGeometry args={[0.1, 0.14, 1.6, 14]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
            <Humo pos={[x, 2.0, -0.1]} color="#94a3b8" n={6} escala={4.2} altura={2.2} nivel={gasNivel} opacidad={0.45} />
          </group>
        ))}
        <Etiqueta pos={[0, 2.35, 0]} df={11} col="#fb923caa" fs={11.5}>
          <i className="fa-solid fa-fire-flame-simple" style={{ color: "#fb923c" }} />
          {params.gasMW > 0 ? `Gas ${num(paso.gas)} de ${num(params.gasMW)} MW` : "Sin respaldo de gas"}
        </Etiqueta>
      </group>

      {/* Subestación y líneas */}
      <mesh position={[SUBESTACION[0], 0.3, SUBESTACION[2]]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.5]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} emissive={modoColor} emissiveIntensity={0.15} />
      </mesh>
      {ORIGENES.map((o) => {
        const dx = SUBESTACION[0] - o.pos[0];
        const dz = SUBESTACION[2] - o.pos[2];
        const largo = Math.hypot(dx, dz);
        return (
          <mesh key={o.id} position={[(o.pos[0] + SUBESTACION[0]) / 2, 0.02, (o.pos[2] + SUBESTACION[2]) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
            <boxGeometry args={[largo, 0.02, 0.05]} />
            <meshBasicMaterial color={o.color} transparent opacity={0.28} />
          </mesh>
        );
      })}
      <instancedMesh ref={pulsos} args={[undefined, undefined, ORIGENES.length * N_PULSOS]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 8]}>
          <instancedBufferAttribute attach="attributes-color" args={[pulsoColores, 3]} />
        </sphereGeometry>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </instancedMesh>

      {/* Ciudad */}
      <instancedMesh ref={edificios} args={[undefined, undefined, N_EDIFICIOS]} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial ref={matCiudad} color="#334155" roughness={0.5} emissive="#fde68a" emissiveIntensity={0.3} />
      </instancedMesh>
      <Etiqueta pos={[4.5, 2.6, -0.7]} df={11} col={deficit ? `${NO}cc` : `${modoColor}aa`} fs={12.5}>
        <i className={`fa-solid ${deficit ? "fa-triangle-exclamation" : "fa-city"}`} style={{ color: deficit ? NO : modoColor }} />
        {deficit ? `¡Déficit de ${num(paso.deficit)} MW! Faltan ${num(paso.deficit)} de ${num(paso.demanda)} MW` : `Ciudad: demanda ${num(paso.demanda)} MW`}
      </Etiqueta>
      <Etiqueta pos={[0, 4.2, -6]} df={11} col={`${modoColor}aa`} fs={15}>
        <i className={`fa-solid ${noche ? "fa-moon" : "fa-sun"}`} style={{ color: noche ? "#c7d2fe" : "#fde68a" }} />
        {horaTexto(paso.h - 0.125)} · {params.estacion}
        {params.nublado ? " · nublado" : ""}
      </Etiqueta>
      {paso.vertido > 1 && (
        <Etiqueta pos={[-3.3, 1.95, 1.4]} df={11} col="#94a3b8aa" fs={10.5}>
          Excedente que se desperdicia: {num(paso.vertido)} MW
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. EMISIONES Y AGOTAMIENTO
 * ════════════════════════════════════════════════════════════════════════ */

const ORDEN_TORRES: TecId[] = ["hidro", "eolica", "solar", "geotermia", "bio", "nuclear", "gas", "combustoleo", "carbon"];
const X_TORRE = (i: number) => (i < 5 ? -5.0 + i * 0.95 : 1.05 + (i - 5) * 1.05);
const ESCALA_TORRE = 0.055;
const N_NUBE = 80;
const MT_POR_BOLA = 2.5;

function Torre({ tec, pct, i }: { tec: TecId; pct: number; i: number }) {
  const t = TEC[tec];
  const caja = useRef<THREE.Mesh>(null);
  const alto = useRef(pct * ESCALA_TORRE);
  useFrame((_, dt) => {
    alto.current += (pct * ESCALA_TORRE - alto.current) * suave(dt, 0.08);
    if (caja.current) {
      const h = Math.max(0.01, alto.current);
      caja.current.scale.y = h;
      caja.current.position.y = 0.12 + h / 2;
    }
  });
  const x = X_TORRE(i);
  return (
    <group position={[x, 0, 0]}>
      <mesh ref={caja} castShadow>
        <boxGeometry args={[0.66, 1, 0.66]} />
        <meshStandardMaterial color={t.color} roughness={0.4} emissive={t.color} emissiveIntensity={0.18} />
      </mesh>
      <Etiqueta pos={[0, 0.12 + pct * ESCALA_TORRE + 0.32, 0]} df={10} col={`${t.color}aa`} fs={11}>
        {num(pct, pct < 10 && pct % 1 !== 0 ? 1 : 0)} %
      </Etiqueta>
      <Html position={[0, 0.12, 0.62]} center distanceFactor={10} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ width: 74, textAlign: "center", color: "#e2e8f0", fontSize: 10, fontWeight: 800, lineHeight: 1.15 }}>
          <i className={`fa-solid ${t.icono}`} style={{ color: t.color, display: "block", fontSize: 13, marginBottom: 2 }} />
          {t.etq}
          {tec === "nuclear" && <div style={{ color: "#a78bfa", fontSize: 9 }}>limpia, no renovable</div>}
        </div>
      </Html>
    </group>
  );
}

function EscenaEmisiones({ mezcla, modoColor }: { mezcla: Mezcla; modoColor: string }) {
  const nube = useRef<THREE.InstancedMesh>(null);
  const barra = useRef<THREE.Mesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const bolas = ORDEN_TORRES.map((t) => Math.round(((mezcla[t] / 100) * TWH_MEXICO * TEC[t].gCO2) / 1000 / MT_POR_BOLA));
  const limpia = pctLimpia(mezcla);
  const mt = emisionesMt(mezcla);
  const limpiaSuave = useRef(limpia);
  useFrame(({ clock }, dt) => {
    const m = nube.current;
    if (m) {
      let idx = 0;
      ORDEN_TORRES.forEach((t, i) => {
        const nb = Math.min(bolas[i]!, N_NUBE - idx);
        const x0 = X_TORRE(i);
        const top = 0.12 + mezcla[t] * ESCALA_TORRE;
        for (let k = 0; k < nb; k++) {
          const a = k * 2.39996 + clock.elapsedTime * 0.25;
          const r = 0.12 + Math.sqrt(k) * 0.11;
          const sube = (clock.elapsedTime * 0.08 + k * 0.137) % 1;
          obj.position.set(x0 + Math.cos(a) * r * 0.8, top + 0.35 + Math.sqrt(k) * 0.12 + sube * 0.3, Math.sin(a) * r * 0.6);
          obj.scale.setScalar(0.16 + 0.05 * Math.sin(k + clock.elapsedTime));
          obj.updateMatrix();
          m.setMatrixAt(idx++, obj.matrix);
        }
      });
      for (; idx < N_NUBE; idx++) {
        obj.position.set(0, -50, 0);
        obj.scale.setScalar(0.0001);
        obj.updateMatrix();
        m.setMatrixAt(idx, obj.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    }
    limpiaSuave.current += (limpia - limpiaSuave.current) * suave(dt, 0.08);
    if (barra.current) {
      const w = Math.max(0.01, (limpiaSuave.current / 100) * 10);
      barra.current.scale.x = w;
      barra.current.position.x = -5 + w / 2;
    }
  });
  return (
    <group position={[0, -1.6, 0]}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[7.5, 7.5, 0.1, 72]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      <mesh position={[-3.1, 0.05, 0.3]} receiveShadow>
        <boxGeometry args={[4.9, 0.1, 2.1]} />
        <meshStandardMaterial color="#14532d" roughness={0.8} />
      </mesh>
      <mesh position={[2.63, 0.05, 0.3]} receiveShadow>
        <boxGeometry args={[4.3, 0.1, 2.1]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.8} />
      </mesh>
      <Etiqueta pos={[-3.1, 0.15, 1.75]} df={10} col="#34d399aa" fs={11}>
        <i className="fa-solid fa-rotate" style={{ color: "#34d399" }} />
        Renovables: se reponen
      </Etiqueta>
      <Etiqueta pos={[2.63, 0.15, 1.75]} df={10} col="#a1a1aaaa" fs={11}>
        <i className="fa-solid fa-hourglass-end" style={{ color: "#a1a1aa" }} />
        No renovables: se agotan
      </Etiqueta>
      {ORDEN_TORRES.map((t, i) => (
        <Torre key={t} tec={t} pct={mezcla[t]} i={i} />
      ))}
      <instancedMesh ref={nube} args={[undefined, undefined, N_NUBE]} frustumCulled={false}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#4b5563" roughness={1} transparent opacity={0.82} />
      </instancedMesh>
      {/* Barra de energía limpia con la meta */}
      <group position={[0, 0.12, -1.75]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[10, 0.08, 0.22]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh ref={barra} position={[-2.5, 0.02, 0]}>
          <boxGeometry args={[1, 0.1, 0.24]} />
          <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[-5 + (META_LIMPIA / 100) * 10, 0.45, 0]}>
          <boxGeometry args={[0.05, 0.9, 0.3]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
        </mesh>
        <Etiqueta pos={[-5 + (META_LIMPIA / 100) * 10, 1.2, 0]} df={10} col="#fbbf24aa" fs={11}>
          Meta: {META_LIMPIA} % limpia
        </Etiqueta>
        <Etiqueta pos={[3.6, 0.5, 0]} df={10} col={limpia >= META_LIMPIA ? "#34d399cc" : "#ffffff44"} fs={11.5}>
          <i className="fa-solid fa-leaf" style={{ color: "#34d399" }} />
          Generación limpia: {num(limpia, 1)} %
        </Etiqueta>
      </group>
      <Etiqueta pos={[-2.6, 4.3, -1.2]} df={10} col={`${modoColor}aa`} fs={14}>
        <i className="fa-solid fa-smog" style={{ color: modoColor }} />
        {num(mt, 1)} Mt CO₂e al año · cada bola gris = {MT_POR_BOLA} Mt
      </Etiqueta>
    </group>
  );
}

const MBD_POR_BARRIL = 0.2;
const MAX_BARRILES = 17;

function EscenaAgotamiento({ anioIdx, modoColor }: { anioIdx: number; modoColor: string }) {
  const barriles = useRef<THREE.InstancedMesh>(null);
  const balancin = useRef<THREE.Group>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const cVivo = useMemo(() => new THREE.Color("#64748b"), []);
  const cSel = useMemo(() => new THREE.Color("#b45309"), []);
  const cFuturo = useMemo(() => new THREE.Color("#1e293b"), []);
  const total = PRODUCCION.length * MAX_BARRILES;
  const sel = PRODUCCION[anioIdx]!;
  const velBomba = useRef(sel.mbd);
  const angulo = useRef(0);
  useFrame((_, dt) => {
    const m = barriles.current;
    if (m) {
      PRODUCCION.forEach((p, j) => {
        const n = Math.round(p.mbd / MBD_POR_BARRIL);
        for (let k = 0; k < MAX_BARRILES; k++) {
          const i = j * MAX_BARRILES + k;
          obj.position.set(-2.6 + j * 1.3, 0.12 + k * 0.215, 0);
          obj.scale.setScalar(k < n ? 1 : 0.0001);
          obj.updateMatrix();
          m.setMatrixAt(i, obj.matrix);
          m.setColorAt(i, j === anioIdx ? cSel : j < anioIdx ? cVivo : cFuturo);
        }
      });
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
    velBomba.current += (sel.mbd - velBomba.current) * suave(dt, 0.05);
    angulo.current += Math.min(dt, 0.25) * velBomba.current * 1.2;
    if (balancin.current) balancin.current.rotation.z = Math.sin(angulo.current) * 0.28;
  });
  return (
    <group position={[0, -1.6, 0]}>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[7.5, 7.5, 0.1, 72]} />
        <meshStandardMaterial color="#1c1917" roughness={0.95} />
      </mesh>
      <instancedMesh ref={barriles} args={[undefined, undefined, total]} castShadow frustumCulled={false}>
        <cylinderGeometry args={[0.26, 0.26, 0.2, 18]} />
        <meshStandardMaterial color="#ffffff" metalness={0.45} roughness={0.4} />
      </instancedMesh>
      {/* Nivel de 2004 como referencia */}
      <mesh position={[0, 0.12 + Math.round(3.4 / MBD_POR_BARRIL) * 0.215 - 0.1, 0]}>
        <boxGeometry args={[6.6, 0.015, 0.02]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.7} />
      </mesh>
      <Etiqueta pos={[-4.4, 0.12 + Math.round(3.4 / MBD_POR_BARRIL) * 0.215 - 0.1, 0]} df={10} col="#fbbf24aa" fs={10.5}>
        pico de 2004: 3.4 mbd
      </Etiqueta>
      {PRODUCCION.map((p, j) => (
        <group key={p.anio}>
          <Etiqueta pos={[-2.6 + j * 1.3, -0.05, 0.75]} df={10} col={j === anioIdx ? `${modoColor}cc` : undefined} fs={j === anioIdx ? 13 : 11}>
            {p.anio}
          </Etiqueta>
          {j <= anioIdx && (
            <Etiqueta pos={[-2.6 + j * 1.3, 0.12 + Math.round(p.mbd / MBD_POR_BARRIL) * 0.215 + 0.28, 0]} df={10} col={j === anioIdx ? "#f59e0bcc" : undefined} fs={11}>
              {num(p.mbd, 1)} mbd
            </Etiqueta>
          )}
        </group>
      ))}
      {/* Balancín de bombeo */}
      <group position={[-4.7, 0, -0.4]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.14, 1.1, 0.5]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        <group ref={balancin} position={[0, 1.1, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.8, 0.14, 0.14]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.4} roughness={0.4} />
          </mesh>
          <mesh position={[0.95, -0.12, 0]}>
            <boxGeometry args={[0.18, 0.4, 0.2]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.4} roughness={0.4} />
          </mesh>
        </group>
        <mesh position={[0.95, 0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
        <Etiqueta pos={[0.3, 2.05, 0]} df={10} col="#f59e0baa" fs={10.5}>
          <i className="fa-solid fa-oil-well" style={{ color: "#f59e0b" }} />
          1 barril = 0.2 millones de barriles diarios
        </Etiqueta>
      </group>
      {/* El flujo renovable no se agota */}
      <group position={[4.6, 0, -0.8]}>
        <Aerogenerador pos={[0, 0, 0]} alto={2.2} vel={2.2} />
        <mesh position={[1.0, 3.6, -0.6]}>
          <sphereGeometry args={[0.32, 20, 14]} />
          <meshBasicMaterial color="#fde68a" toneMapped={false} />
        </mesh>
        <Etiqueta pos={[0, 2.7, 0.3]} df={10} col="#5eead4aa" fs={10.5}>
          Sol y viento: llegan cada día
        </Etiqueta>
      </group>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function RenovablesMexicoScene(p: RenovablesSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "mapa") return { pos: [0.3, 7.1, 5.5], target: [0.2, -0.45, -0.2] };
    if (vista === "red") return { pos: [0.4, 8.6, 11.4], target: [0.2, -1.2, 0.2] };
    if (p.subMezcla === "emisiones") return { pos: [0, 5.6, 9.4], target: [0, 0.1, 0.3] };
    return { pos: [0, 3.4, 10.6], target: [0, 0.6, 0] };
  }, [vista, p.subMezcla]);

  return (
    <Canvas key={`${vista}-${p.subMezcla}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 20, 42]} />
      <ambientLight intensity={vista === "red" ? 0.35 : 0.55} />
      {vista !== "red" && <directionalLight position={[4, 9, 6]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />}
      <pointLight position={[-6, 3, 5]} intensity={0.4} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "mapa" && <EscenaMapa centralSel={p.centralSel} revelado={p.revelado} solarEquivMW={p.solarEquivMW} onSelCentral={p.onSelCentral} />}
      {vista === "red" && <EscenaRed params={p.params} red={p.red} hora={p.hora} modoColor={modoColor} />}
      {vista === "mezcla" && p.subMezcla === "emisiones" && <EscenaEmisiones mezcla={p.mezcla} modoColor={modoColor} />}
      {vista === "mezcla" && p.subMezcla === "agotamiento" && <EscenaAgotamiento anioIdx={p.anioIdx} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={3.5} maxDistance={20} maxPolarAngle={Math.PI * 0.46} minPolarAngle={Math.PI * 0.05} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.62} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}

