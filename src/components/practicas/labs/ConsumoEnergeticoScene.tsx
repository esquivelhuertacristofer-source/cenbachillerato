"use client";

/**
 * Escena 3D del laboratorio "Consumo energético e impacto ambiental"
 * (CNEYT-II, progresión 10). Tres vistas:
 *
 *  - casa: una casa mexicana en corte (cocina, sala, recámara y patio de
 *    servicio con tinaco) con 12 aparatos que se encienden, quedan en modo
 *    espera (luz piloto roja) o se desconectan; el medidor gira según la
 *    potencia media de la casa.
 *  - cadena: de la central eléctrica al foco. Partículas de energía salen del
 *    combustible (o del sol), atraviesan la planta, las torres de transmisión y
 *    el transformador y llegan a un foco; las que se desvían son calor perdido
 *    en cada etapa, en la proporción real del modelo.
 *  - huella: la huella de carbono de un año como globos de CO₂ a tamaño real
 *    (15 °C, 1 atm) junto a una casa de dos pisos, una persona y la esfera de
 *    referencia de 1 tonelada.
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
  type Modo,
  type EstadoCasa,
  type AparatoId,
  type PlantaId,
  type FocoId,
  type CategoriaId,
  APARATOS,
  FOCOS,
  PLANTAS,
  CATEGORIAS,
  PERDIDAS_RED,
  N_FOCOS,
  resumenCasa,
  fraccionLuz,
  diametroEsfera,
  num,
  pesos,
} from "./consumo-energetico-data";

export type VistaConsumo = Modo;

export interface ConsumoSceneProps {
  vista: VistaConsumo;
  modoColor: string;
  resetNonce: number;
  // Casa
  casa: EstadoCasa;
  seleccionado: AparatoId;
  onSeleccionar: (id: AparatoId) => void;
  // Cadena
  plantaId: PlantaId;
  focoId: FocoId;
  // Huella
  huella: Record<CategoriaId, number>;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const ROJO = "#f87171";

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

/* ════════════════════════════════════════════════════════════════════════
 * 1. MI CASA
 * ════════════════════════════════════════════════════════════════════════ */

const PARED = "#e9dfcc";
const PARED_BAJA = 0.45;
const ALTO = 2.6;

/** Posición de cada aparato (base en el piso) y altura de su etiqueta. */
const POS_AP: Record<AparatoId, { pos: Pt; alto: number; led?: Pt }> = {
  refri: { pos: [-4.4, 0, -2.95], alto: 2.1, led: [0.25, 1.45, 0.37] },
  micro: { pos: [-2.2, 0.9, -3.05], alto: 0.75, led: [0.18, 0.1, 0.22] },
  focos: { pos: [-2.4, 2.1, 1.75], alto: 0.55 },
  tv: { pos: [-4.62, 0.5, 1.8], alto: 1.3, led: [0.06, 0.08, 0.35] },
  deco: { pos: [-4.55, 0.5, 2.3], alto: 0.45, led: [0.14, 0.04, 0.05] },
  consola: { pos: [-4.55, 0.5, 1.2], alto: 0.45, led: [0.17, 0.05, 0.05] },
  modem: { pos: [-4.55, 0.5, 2.6], alto: 0.5, led: [0.08, 0.05, 0.0] },
  lavadora: { pos: [4.3, 0, 2.9], alto: 1.25, led: [-0.34, 0.8, 0.2] },
  plancha: { pos: [2.1, 0, 2.3], alto: 1.25 },
  bomba: { pos: [4.3, 0, 0.8], alto: 0.75 },
  ventilador: { pos: [4.3, 0, -0.7], alto: 1.75 },
  laptop: { pos: [1.2, 0.76, -3.05], alto: 0.6, led: [0.5, 0.02, 0.2] },
};

/** Ocho focos colgados de las vigas: dos por cuarto. */
const POS_FOCOS: Pt[] = [
  [-3.6, 2.2, -1.75],
  [-1.4, 2.2, -1.75],
  [-3.6, 2.2, 1.75],
  [-1.4, 2.2, 1.75],
  [1.4, 2.2, -1.75],
  [3.6, 2.2, -1.75],
  [1.4, 2.2, 1.75],
  [2.6, 2.2, 1.75],
];

function Pared({ pos, size, color = PARED }: { pos: Pt; size: Pt; color?: string }) {
  return (
    <mesh position={pos} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

function LedEspera({ pos, activo }: { pos: Pt; activo: boolean }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.emissiveIntensity = activo ? 1.6 + Math.sin(clock.elapsedTime * 3.2) * 1.1 : 0;
  });
  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.035, 10, 8]} />
      <meshStandardMaterial ref={ref} color={activo ? ROJO : "#1f2937"} emissive={ROJO} emissiveIntensity={0} />
    </mesh>
  );
}

function Seleccion({ activo, color, r = 0.6 }: { activo: boolean; color: string; r?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.visible = activo;
    ref.current.rotation.z = clock.elapsedTime * 0.8;
    const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.05;
    ref.current.scale.set(s, s, s);
  });
  return (
    <mesh ref={ref} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={activo}>
      <ringGeometry args={[r * 0.82, r, 40]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Ventilador({ on }: { on: boolean }) {
  const aspas = useRef<THREE.Group>(null);
  const cabeza = useRef<THREE.Group>(null);
  const w = useRef(0);
  useFrame(({ clock }, dt) => {
    w.current += ((on ? 14 : 0) - w.current) * suave(dt, 0.03);
    if (aspas.current) aspas.current.rotation.z += w.current * Math.min(dt, 0.1);
    if (cabeza.current) cabeza.current.rotation.y = on ? Math.sin(clock.elapsedTime * 0.5) * 0.6 - 0.9 : -0.9;
  });
  return (
    <group>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.06, 20]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.15, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
      </mesh>
      <group ref={cabeza} position={[0, 1.22, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.07, 0.08, 0.16, 12]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <torusGeometry args={[0.3, 0.012, 6, 32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
        </mesh>
        <group ref={aspas} position={[0, 0, 0.03]}>
          {[0, 1, 2].map((k) => (
            <mesh
              key={k}
              rotation={[0, 0, (k * Math.PI * 2) / 3]}
              position={[Math.cos((k * Math.PI * 2) / 3 + Math.PI / 2) * 0.13, Math.sin((k * Math.PI * 2) / 3 + Math.PI / 2) * 0.13, 0]}
            >
              <boxGeometry args={[0.1, 0.24, 0.01]} />
              <meshStandardMaterial color="#7dd3fc" transparent opacity={0.85} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

function Lavadora({ on }: { on: boolean }) {
  const tambor = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (tambor.current && on) tambor.current.rotation.z += dt * 5;
  });
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.65, 0.9, 0.65]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.35} />
      </mesh>
      <mesh ref={tambor} position={[-0.33, 0.42, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.2, 0.035, 8, 24]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.33, 0.42, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.19, 24]} />
        <meshStandardMaterial color={on ? "#7dd3fc" : "#1e293b"} emissive={on ? "#0ea5e9" : "#000"} emissiveIntensity={on ? 0.5 : 0} />
      </mesh>
    </group>
  );
}

function Medidor({ wMedia }: { wMedia: number }) {
  const disco = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (disco.current) disco.current.rotation.y += (wMedia / 60) * Math.min(dt, 0.1);
  });
  return (
    <group position={[-0.9, 0, 3.95]}>
      <mesh position={[0, 0.7, -0.1]} castShadow>
        <boxGeometry args={[0.5, 1.4, 0.2]} />
        <meshStandardMaterial color="#b45309" roughness={0.9} />
      </mesh>
      <group position={[0, 1.1, 0.05]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[0.12, 0.5, 0.38]} />
          <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.04, 24]} />
          <meshStandardMaterial color="#e2e8f0" transparent opacity={0.5} />
        </mesh>
        <mesh ref={disco} position={[-0.08, -0.05, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.012, 24]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-0.1, -0.05, 0.09]}>
          <boxGeometry args={[0.02, 0.014, 0.03]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
      </group>
    </group>
  );
}

function EscenaCasa({ casa, seleccionado, onSeleccionar, modoColor }: { casa: EstadoCasa; seleccionado: AparatoId; onSeleccionar: (id: AparatoId) => void; modoColor: string }) {
  const r = resumenCasa(casa);
  const foco = FOCOS.find((f) => f.id === casa.foco)!;
  const focosOn = casa.uso.focos && casa.horas.focos > 0;
  const on = (id: AparatoId) => {
    const a = APARATOS.find((x) => x.id === id)!;
    return a.continuo ? true : casa.uso[id] && casa.horas[id] > 0;
  };
  const espera = (id: AparatoId) => {
    const c = r.aparatos.find((x) => x.id === id)!;
    return c.esperaKwhDia > 0;
  };
  const click = (id: AparatoId) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSeleccionar(id);
  };
  const sel = APARATOS.find((a) => a.id === seleccionado)!;
  const cSel = r.aparatos.find((a) => a.id === seleccionado)!;
  const pSel = POS_AP[seleccionado];
  const refriAntiguo = casa.refri === "antiguo";
  const colEsc = r.recibo.escalon === "excedente" ? ROJO : r.recibo.escalon === "intermedio" ? "#fbbf24" : "#34d399";

  const grupo = (id: AparatoId, radio: number, children: ReactNode) => (
    <group position={POS_AP[id].pos} onClick={click(id)}>
      {children}
      {POS_AP[id].led && <LedEspera pos={POS_AP[id].led!} activo={espera(id)} />}
      <Seleccion activo={seleccionado === id} color={modoColor} r={radio} />
    </group>
  );

  return (
    <group position={[0, -0.9, 0]}>
      {/* Terreno */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[14, 0.1, 11]} />
        <meshStandardMaterial color="#1f3b2a" roughness={1} />
      </mesh>
      {/* Pisos: loseta en cocina y lavado, madera en sala y recámara */}
      {(
        [
          [-2.5, -1.75, "#cbb89a"],
          [2.5, -1.75, "#9a6b43"],
          [-2.5, 1.75, "#8f6240"],
          [2.5, 1.75, "#b9b3a6"],
        ] as [number, number, string][]
      ).map(([x, z, c]) => (
        <mesh key={`${x}${z}`} position={[x, 0.01, z]} receiveShadow>
          <boxGeometry args={[5, 0.04, 3.5]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      {/* Muros altos al fondo e izquierda, bajos al frente y derecha (corte) */}
      <Pared pos={[0, ALTO / 2, -3.55]} size={[10.2, ALTO, 0.12]} />
      <Pared pos={[-5.05, ALTO / 2, 0]} size={[0.12, ALTO, 7.2]} color="#e2d5bd" />
      <Pared pos={[0, PARED_BAJA / 2, 3.55]} size={[10.2, PARED_BAJA, 0.12]} color="#c2410c" />
      <Pared pos={[5.05, PARED_BAJA / 2, 0]} size={[0.12, PARED_BAJA, 7.2]} color="#c2410c" />
      {/* Muros interiores con puerta */}
      <Pared pos={[0, ALTO / 2, -2.6]} size={[0.1, ALTO, 1.9]} />
      <Pared pos={[0, ALTO / 2, 2.6]} size={[0.1, ALTO, 1.9]} />
      <Pared pos={[-3.2, ALTO / 2, 0]} size={[3.6, ALTO, 0.1]} />
      <Pared pos={[3.2, ALTO / 2, 0]} size={[3.6, ALTO, 0.1]} />
      {/* Vigas del techo */}
      {[-1.75, 1.75].map((z) => (
        <mesh key={z} position={[0, ALTO + 0.05, z]}>
          <boxGeometry args={[10.2, 0.12, 0.14]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
      ))}

      {/* Cocina: barra, refri, microondas */}
      <mesh position={[-1.9, 0.45, -3.1]} castShadow>
        <boxGeometry args={[2.6, 0.9, 0.7]} />
        <meshStandardMaterial color="#7c5a3a" roughness={0.6} />
      </mesh>
      <mesh position={[-1.9, 0.92, -3.1]}>
        <boxGeometry args={[2.66, 0.04, 0.76]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.3} />
      </mesh>
      {grupo(
        "refri",
        0.7,
        <>
          <mesh position={[0, 0.9, 0]} castShadow>
            <boxGeometry args={[0.8, 1.8, 0.7]} />
            <meshStandardMaterial color={refriAntiguo ? "#eadfc4" : "#cbd5e1"} metalness={refriAntiguo ? 0.05 : 0.6} roughness={refriAntiguo ? 0.6 : 0.25} />
          </mesh>
          <mesh position={[0, 1.28, 0.36]}>
            <boxGeometry args={[0.78, 0.015, 0.02]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          <mesh position={[-0.3, 1.0, 0.37]}>
            <boxGeometry args={[0.04, 0.4, 0.04]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.7} />
          </mesh>
          {!refriAntiguo && (
            <mesh position={[0.12, 0.7, 0.36]}>
              <boxGeometry args={[0.2, 0.26, 0.01]} />
              <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.25} />
            </mesh>
          )}
        </>,
      )}
      {grupo(
        "micro",
        0.42,
        <>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.56, 0.32, 0.4]} />
            <meshStandardMaterial color="#334155" roughness={0.4} />
          </mesh>
          <mesh position={[-0.06, 0.2, 0.205]}>
            <planeGeometry args={[0.34, 0.22]} />
            <meshStandardMaterial color={on("micro") ? "#fde68a" : "#0f172a"} emissive="#fbbf24" emissiveIntensity={on("micro") ? 0.9 : 0} />
          </mesh>
        </>,
      )}

      {/* Sala: mueble, TV, decodificador, consola, módem, sillón */}
      <mesh position={[-4.6, 0.25, 1.85]} castShadow>
        <boxGeometry args={[0.55, 0.5, 1.9]} />
        <meshStandardMaterial color="#5b4636" roughness={0.6} />
      </mesh>
      {grupo(
        "tv",
        0.6,
        <>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.2, 0.04, 0.3]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.05, 0.62, 1.02]} />
            <meshStandardMaterial color="#0b1220" roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0.03, 0.45, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.96, 0.56]} />
            <meshStandardMaterial color={on("tv") ? "#60a5fa" : "#020617"} emissive="#3b82f6" emissiveIntensity={on("tv") ? 1.1 : 0} />
          </mesh>
        </>,
      )}
      {grupo(
        "deco",
        0.28,
        <>
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[0.26, 0.06, 0.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </>,
      )}
      {grupo(
        "consola",
        0.3,
        <>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.3, 0.08, 0.26]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
        </>,
      )}
      {grupo(
        "modem",
        0.2,
        <>
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[0.15, 0.05, 0.12]} />
            <meshStandardMaterial color="#e5e7eb" />
          </mesh>
          {[-0.05, 0.05].map((z) => (
            <mesh key={z} position={[-0.05, 0.14, z]}>
              <cylinderGeometry args={[0.008, 0.008, 0.2, 6]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
          ))}
        </>,
      )}
      <group position={[-2.2, 0, 1.85]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.9, 0.5, 1.8]} />
          <meshStandardMaterial color="#0f766e" roughness={0.8} />
        </mesh>
        <mesh position={[0.35, 0.65, 0]} castShadow>
          <boxGeometry args={[0.25, 0.5, 1.8]} />
          <meshStandardMaterial color="#115e59" roughness={0.8} />
        </mesh>
      </group>
      {/* Regleta */}
      <group position={[-4.2, 0.03, 2.95]}>
        <mesh>
          <boxGeometry args={[0.5, 0.05, 0.12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0.2, 0.04, 0]}>
          <boxGeometry args={[0.07, 0.03, 0.07]} />
          <meshStandardMaterial color={casa.desconectar ? "#475569" : "#ef4444"} emissive={casa.desconectar ? "#000" : "#ef4444"} emissiveIntensity={casa.desconectar ? 0 : 1.2} />
        </mesh>
      </group>

      {/* Recámara: cama, escritorio, laptop, ventilador */}
      <mesh position={[3.4, 0.25, -2.4]} castShadow>
        <boxGeometry args={[1.6, 0.5, 2.0]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>
      <mesh position={[3.4, 0.52, -2.4]}>
        <boxGeometry args={[1.62, 0.06, 1.5]} />
        <meshStandardMaterial color="#6366f1" roughness={0.9} />
      </mesh>
      <mesh position={[1.2, 0.74, -3.1]} castShadow>
        <boxGeometry args={[1.3, 0.05, 0.6]} />
        <meshStandardMaterial color="#a16207" roughness={0.6} />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[1.2 + x, 0.36, -3.1]}>
          <boxGeometry args={[0.05, 0.72, 0.5]} />
          <meshStandardMaterial color="#854d0e" />
        </mesh>
      ))}
      {grupo(
        "laptop",
        0.45,
        <>
          <mesh position={[0, 0.02, 0.05]}>
            <boxGeometry args={[0.42, 0.02, 0.3]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.16, -0.1]} rotation={[-0.25, 0, 0]}>
            <boxGeometry args={[0.42, 0.28, 0.015]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.16, -0.09]} rotation={[-0.25, 0, 0]}>
            <planeGeometry args={[0.38, 0.24]} />
            <meshStandardMaterial color={on("laptop") ? "#a5f3fc" : "#020617"} emissive="#22d3ee" emissiveIntensity={on("laptop") ? 0.8 : 0} />
          </mesh>
        </>,
      )}
      {grupo(
        "ventilador",
        0.45,
        <>
          <Ventilador on={on("ventilador")} />
        </>,
      )}

      {/* Patio de servicio: lavadora, burro de planchar, tinaco y bomba */}
      {grupo(
        "lavadora",
        0.6,
        <>
          <Lavadora on={on("lavadora")} />
        </>,
      )}
      {grupo(
        "plancha",
        0.8,
        <>
          <mesh position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[1.2, 0.04, 0.36]} />
            <meshStandardMaterial color="#93c5fd" roughness={0.8} />
          </mesh>
          {[-0.3, 0.3].map((x) => (
            <mesh key={x} position={[x, 0.42, 0]} rotation={[0, 0, x > 0 ? 0.35 : -0.35]}>
              <cylinderGeometry args={[0.015, 0.015, 0.9, 6]} />
              <meshStandardMaterial color="#64748b" metalness={0.6} />
            </mesh>
          ))}
          <mesh position={[0.3, 0.93, 0]}>
            <boxGeometry args={[0.24, 0.1, 0.13]} />
            <meshStandardMaterial color={on("plancha") ? "#fca5a5" : "#e2e8f0"} emissive="#ef4444" emissiveIntensity={on("plancha") ? 0.6 : 0} />
          </mesh>
        </>,
      )}
      <group position={[3.4, 0, -4.35]}>
        {[
          [-0.35, -0.35],
          [0.35, -0.35],
          [-0.35, 0.35],
          [0.35, 0.35],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x!, 1.3, z!]}>
            <boxGeometry args={[0.07, 2.6, 0.07]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
        ))}
        <mesh position={[0, 2.64, 0]}>
          <boxGeometry args={[0.9, 0.08, 0.9]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
        <mesh position={[0, 3.12, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.46, 0.9, 24]} />
          <meshStandardMaterial color="#111827" roughness={0.5} />
        </mesh>
        <mesh position={[0, 3.6, 0]}>
          <cylinderGeometry args={[0.3, 0.42, 0.1, 24]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
      </group>
      {grupo(
        "bomba",
        0.4,
        <>
          <mesh position={[0, 0.16, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.36, 16]} />
            <meshStandardMaterial color="#2563eb" metalness={0.4} roughness={0.4} />
          </mesh>
          <mesh position={[0.26, 0.35, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        </>,
      )}

      {/* Focos colgados */}
      {POS_FOCOS.map((p, k) => (
        <group key={k} position={p} onClick={click("focos")}>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.36, 6]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh>
            <sphereGeometry args={[casa.foco === "lfc" ? 0.09 : 0.11, 16, 12]} />
            <meshStandardMaterial color={focosOn ? foco.color : "#374151"} emissive={foco.color} emissiveIntensity={focosOn ? (casa.foco === "incandescente" ? 2.4 : 1.8) : 0} />
          </mesh>
          {seleccionado === "focos" && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.2, 0.012, 6, 24]} />
              <meshBasicMaterial color={modoColor} />
            </mesh>
          )}
        </group>
      ))}
      {focosOn && <pointLight position={[0, 2.1, 0]} intensity={casa.foco === "incandescente" ? 1.4 : 1.0} distance={12} color={foco.color} />}

      <Medidor wMedia={r.wMedia} />
      <Etiqueta pos={[-0.9, 1.75, 4.1]} df={12} fs={10}>
        <i className="fa-solid fa-gauge-high" style={{ color: modoColor }} />
        Medidor · {num(r.wMedia)} W de media
      </Etiqueta>

      {/* Etiqueta del aparato seleccionado */}
      <Etiqueta pos={[pSel.pos[0], pSel.pos[1] + pSel.alto, pSel.pos[2]]} df={11} col={`${modoColor}cc`} fs={11.5}>
        <i className={`fa-solid ${sel.icono}`} style={{ color: modoColor }} />
        {seleccionado === "focos" ? `${N_FOCOS} focos` : sel.etq} · {num(cSel.wUso)} W · {num(cSel.kwhBim, 1)} kWh/bim
        {cSel.esperaKwhDia > 0 && <span style={{ color: ROJO }}>· {num(cSel.esperaKwhDia * 60, 1)} fantasma</span>}
      </Etiqueta>

      {/* Resumen sobre la casa */}
      <Etiqueta pos={[0, ALTO + 1.25, -3.55]} df={11} col={`${colEsc}cc`} fs={13.5}>
        <i className="fa-solid fa-file-invoice-dollar" style={{ color: colEsc }} />
        {num(r.kwhBim)} kWh al bimestre · {pesos(r.recibo.total)} · {num(r.co2Bim)} kg CO₂e
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. DE LA PLANTA AL FOCO
 * ════════════════════════════════════════════════════════════════════════ */

const X_TORRES = [-4.6, -0.6, 3.4];
const Y_CABLE = 3.9;
const FOCO_POS = new THREE.Vector3(9.6, 1.55, 0.3);
const RUTA = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-7.6, 2.3, 0),
    new THREE.Vector3(-6.4, Y_CABLE, 0),
    new THREE.Vector3(X_TORRES[0]!, Y_CABLE, 0),
    new THREE.Vector3(-2.6, Y_CABLE - 0.55, 0),
    new THREE.Vector3(X_TORRES[1]!, Y_CABLE, 0),
    new THREE.Vector3(1.4, Y_CABLE - 0.55, 0),
    new THREE.Vector3(X_TORRES[2]!, Y_CABLE, 0),
    new THREE.Vector3(5.0, Y_CABLE - 0.45, 0),
    new THREE.Vector3(6.6, 3.1, 0),
    new THREE.Vector3(8.6, 2.6, 0),
    new THREE.Vector3(9.6, 2.35, 0.3),
    FOCO_POS.clone(),
  ],
  false,
  "catmullrom",
  0.2,
);
const CABLE_GEO = new THREE.TubeGeometry(RUTA, 220, 0.03, 6, false);
const TORRE_GEO = new THREE.CylinderGeometry(0.12, 0.7, Y_CABLE, 4, 4, true);
const TORRE_EDGES = new THREE.EdgesGeometry(TORRE_GEO);

/** Silueta de torre de enfriamiento (hiperboloide). */
const TORRE_ENF_GEO = new THREE.LatheGeometry(
  Array.from({ length: 14 }, (_, k) => {
    const y = (k / 13) * 3.2;
    const r = 0.62 * Math.sqrt(1 + ((y - 2.2) / 1.2) ** 2);
    return new THREE.Vector2(r, y);
  }),
  32,
);

const N_PART = 140;
const CICLO = 7;
const T_IN = 0.18;

const PLANTA_X = -9.2;
const ENTRADA = new THREE.Vector3(-8.2, 1.0, 0.4);
const SALIDA_CALOR: Record<PlantaId, THREE.Vector3> = {
  carbon: new THREE.Vector3(-10.4, 3.3, -1.3),
  combustoleo: new THREE.Vector3(-10.4, 3.3, -1.3),
  ciclo: new THREE.Vector3(-10.4, 3.3, -1.3),
  solar: new THREE.Vector3(-9.4, 0.9, 0.2),
};
const ORIGEN_FUEL: Record<PlantaId, THREE.Vector3> = {
  carbon: new THREE.Vector3(-11.6, 0.4, 1.8),
  combustoleo: new THREE.Vector3(-11.8, 1.2, 1.6),
  ciclo: new THREE.Vector3(-13, 0.5, 0.4),
  solar: new THREE.Vector3(-12.5, 8.5, -5),
};

/** Vector temporal de las partículas (módulo: se reutiliza cada cuadro). */
const V_TMP = new THREE.Vector3();

function hash(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function Particulas({ plantaId, focoId }: { plantaId: PlantaId; focoId: FocoId }) {
  const planta = PLANTAS.find((p) => p.id === plantaId)!;
  const foco = FOCOS.find((f) => f.id === focoId)!;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const colFuel = useMemo(() => new THREE.Color(plantaId === "solar" ? "#fde047" : plantaId === "ciclo" ? "#93c5fd" : plantaId === "carbon" ? "#9ca3af" : "#d97706"), [plantaId]);
  const colElec = useMemo(() => new THREE.Color("#22d3ee"), []);
  const colCalor = useMemo(() => new THREE.Color("#fb923c"), []);
  const colRed = useMemo(() => new THREE.Color("#ef4444"), []);
  const colLuz = useMemo(() => new THREE.Color("#fef9c3"), []);

  const pPlanta = 1 - planta.eta;
  const pRed = planta.eta * PERDIDAS_RED;
  const pLuz = planta.eta * (1 - PERDIDAS_RED) * fraccionLuz(foco);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const origen = ORIGEN_FUEL[plantaId];
    const calor = SALIDA_CALOR[plantaId];
    const v = V_TMP;
    for (let i = 0; i < N_PART; i++) {
      const t = (clock.elapsedTime / CICLO + i / N_PART) % 1;
      // Destino de la partícula: la fracción de cada destino coincide con el modelo.
      const u = (i * 0.61803398875) % 1;
      const j1 = hash(i, 1) - 0.5;
      const j2 = hash(i, 2) - 0.5;
      let escala = 0.075;
      if (t < T_IN) {
        const p = t / T_IN;
        v.copy(origen).lerp(ENTRADA, p);
        v.x += j1 * 0.5 * (1 - p);
        v.z += j2 * 0.5 * (1 - p);
        col.copy(colFuel);
      } else if (u < pPlanta) {
        const p = (t - T_IN) / 0.4;
        if (p > 1) escala = 0.0001;
        else {
          v.set(calor.x + j1 * (0.6 + p * 1.2), calor.y + p * 3.2, calor.z + j2 * (0.6 + p * 1.2));
          escala = 0.09 * (1 - p * 0.7);
        }
        col.copy(colCalor);
      } else {
        const s = Math.min(1, (t - T_IN) / (1 - T_IN) / 0.9);
        if (u < pPlanta + pRed) {
          const sL = 0.18 + hash(i, 3) * 0.55;
          if (s < sL) {
            RUTA.getPointAt(s, v);
            col.copy(colElec);
          } else {
            const p = (s - sL) / 0.18;
            RUTA.getPointAt(sL, v);
            if (p > 1) escala = 0.0001;
            else {
              v.y += p * 1.4;
              v.x += j1 * p * 0.6;
              escala = 0.08 * (1 - p * 0.6);
            }
            col.copy(colRed);
          }
        } else if (s < 1) {
          RUTA.getPointAt(s, v);
          col.copy(colElec);
        } else {
          const p = Math.min(1, ((t - T_IN) / (1 - T_IN) - 0.9) / 0.1);
          if (u > 1 - pLuz) {
            const a = hash(i, 4) * Math.PI * 2;
            const b = hash(i, 5) * Math.PI - Math.PI / 2;
            v.set(FOCO_POS.x + Math.cos(a) * Math.cos(b) * p * 2.2, FOCO_POS.y + Math.sin(b) * p * 1.4, FOCO_POS.z + Math.sin(a) * Math.cos(b) * p * 2.2);
            col.copy(colLuz);
            escala = 0.1;
          } else {
            v.set(FOCO_POS.x + j1 * 0.6 * p, FOCO_POS.y + p * 1.3, FOCO_POS.z + j2 * 0.6 * p);
            col.copy(colRed);
            escala = 0.08 * (1 - p * 0.6);
          }
        }
      }
      obj.position.copy(v);
      obj.scale.setScalar(escala);
      obj.updateMatrix();
      m.setMatrixAt(i, obj.matrix);
      m.setColorAt(i, col);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh key={`${plantaId}-${focoId}`} ref={mesh} args={[undefined, undefined, N_PART]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function Humo({ activo, intensidad }: { activo: boolean; intensidad: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const N = 18;
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < N; i++) {
      const p = (clock.elapsedTime * 0.18 + i / N) % 1;
      obj.position.set(-7.9 + p * 1.8 + Math.sin(p * 5 + i) * 0.2, 4.6 + p * 3.0, -1.2 + Math.cos(i) * 0.2);
      obj.scale.setScalar(activo ? (0.25 + p * 0.9) * intensidad : 0.0001);
      obj.updateMatrix();
      m.setMatrixAt(i, obj.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}>
      <sphereGeometry args={[1, 12, 10]} />
      <meshStandardMaterial color="#6b7280" transparent opacity={0.28} depthWrite={false} />
    </instancedMesh>
  );
}

function Torre({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <lineSegments geometry={TORRE_EDGES} position={[0, Y_CABLE / 2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <lineBasicMaterial color="#cbd5e1" />
      </lineSegments>
      <mesh position={[0, Y_CABLE, 0]}>
        <boxGeometry args={[1.5, 0.07, 0.07]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, Y_CABLE - 0.1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
        <meshStandardMaterial color="#a5b4fc" />
      </mesh>
    </group>
  );
}

function EscenaCadena({ plantaId, focoId, modoColor }: { plantaId: PlantaId; focoId: FocoId; modoColor: string }) {
  const planta = PLANTAS.find((p) => p.id === plantaId)!;
  const foco = FOCOS.find((f) => f.id === focoId)!;
  const fl = fraccionLuz(foco);
  const global = planta.eta * (1 - PERDIDAS_RED) * fl;
  const kgKwh = planta.eta > 0 ? ((3.6 / planta.eta) * planta.feGJ) / 1000 : 0;
  const fosil = plantaId !== "solar";

  return (
    <group position={[1.2, -1.6, 0]}>
      <mesh position={[-1, -0.06, 0]} receiveShadow>
        <boxGeometry args={[34, 0.1, 10]} />
        <meshStandardMaterial color="#14271d" roughness={1} />
      </mesh>

      {/* Central */}
      {fosil ? (
        <group>
          <mesh position={[PLANTA_X + 0.9, 0.9, 0]} castShadow>
            <boxGeometry args={[2.4, 1.8, 2.0]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
          <mesh position={[PLANTA_X + 0.9, 1.85, 0]}>
            <boxGeometry args={[2.5, 0.1, 2.1]} />
            <meshStandardMaterial color={planta.color} emissive={planta.color} emissiveIntensity={0.35} />
          </mesh>
          <mesh geometry={TORRE_ENF_GEO} position={[SALIDA_CALOR.carbon.x, 0, SALIDA_CALOR.carbon.z]} castShadow>
            <meshStandardMaterial color="#d6d3d1" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-7.9, 2.3, -1.2]} castShadow>
            <cylinderGeometry args={[0.16, 0.26, 4.6, 16]} />
            <meshStandardMaterial color="#9ca3af" roughness={0.6} />
          </mesh>
          {[3.6, 4.1].map((y) => (
            <mesh key={y} position={[-7.9, y, -1.2]}>
              <cylinderGeometry args={[0.185, 0.19, 0.12, 16]} />
              <meshStandardMaterial color="#dc2626" />
            </mesh>
          ))}
          <Humo activo intensidad={Math.min(1.4, kgKwh * 1.4 + 0.2)} />
          {plantaId === "carbon" && (
            <mesh position={[ORIGEN_FUEL.carbon.x, 0.35, ORIGEN_FUEL.carbon.z]} castShadow>
              <coneGeometry args={[1.0, 0.8, 9]} />
              <meshStandardMaterial color="#4b5563" roughness={1} flatShading />
            </mesh>
          )}
          {plantaId === "combustoleo" && (
            <mesh position={[ORIGEN_FUEL.combustoleo.x, 0.7, ORIGEN_FUEL.combustoleo.z]} castShadow>
              <cylinderGeometry args={[0.8, 0.8, 1.4, 24]} />
              <meshStandardMaterial color="#e5e7eb" roughness={0.4} metalness={0.3} />
            </mesh>
          )}
          {plantaId === "ciclo" && (
            <mesh position={[-11.5, 0.5, 0.4]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.16, 0.16, 3.4, 12]} />
              <meshStandardMaterial color="#facc15" metalness={0.4} roughness={0.4} />
            </mesh>
          )}
        </group>
      ) : (
        <group>
          {Array.from({ length: 12 }, (_, k) => {
            const cx = -10.9 + (k % 4) * 1.15;
            const cz = -1.6 + Math.floor(k / 4) * 1.35;
            return (
              <group key={k} position={[cx, 0.75, cz]} rotation={[-0.6, 0, 0]}>
                <mesh position={[0, -0.35, 0.1]} rotation={[0.6, 0, 0]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.7, 6]} />
                  <meshStandardMaterial color="#94a3b8" />
                </mesh>
                <mesh castShadow>
                  <boxGeometry args={[1.05, 0.05, 1.1]} />
                  <meshStandardMaterial color="#2563eb" emissive="#1d4ed8" emissiveIntensity={0.35} metalness={0.4} roughness={0.25} />
                </mesh>
                <mesh position={[0, 0.03, 0]}>
                  <boxGeometry args={[1.07, 0.02, 0.04]} />
                  <meshStandardMaterial color="#cbd5e1" />
                </mesh>
              </group>
            );
          })}
          <mesh position={ORIGEN_FUEL.solar.toArray()}>
            <sphereGeometry args={[0.8, 24, 18]} />
            <meshBasicMaterial color="#fde047" toneMapped={false} />
          </mesh>
          <mesh position={[-7.7, 1.1, 0]} castShadow>
            <boxGeometry args={[0.6, 1.2, 0.6]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
        </group>
      )}

      {/* Red de transmisión */}
      {X_TORRES.map((x) => (
        <Torre key={x} x={x} />
      ))}
      <mesh geometry={CABLE_GEO}>
        <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Transformador en poste */}
      <group position={[6.6, 0, -0.2]}>
        <mesh position={[0, 1.7, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 3.4, 10]} />
          <meshStandardMaterial color="#78716c" />
        </mesh>
        <mesh position={[0, 2.6, 0.22]}>
          <cylinderGeometry args={[0.22, 0.22, 0.55, 16]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.35} />
        </mesh>
      </group>
      {/* Casa con el foco */}
      <group position={[9.6, 0, -0.3]}>
        <mesh position={[0, 1.2, -0.9]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 2.4, 0.12]} />
          <meshStandardMaterial color={PARED} roughness={0.85} />
        </mesh>
        {[-1.4, 1.4].map((x) => (
          <mesh key={x} position={[x, 1.2, 0.2]} castShadow>
            <boxGeometry args={[0.12, 2.4, 2.3]} />
            <meshStandardMaterial color="#e2d5bd" roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[0, 2.45, 0.2]} castShadow>
          <boxGeometry args={[3.0, 0.12, 2.5]} />
          <meshStandardMaterial color="#c2410c" roughness={0.7} />
        </mesh>
      </group>
      <group position={FOCO_POS.toArray()}>
        <mesh>
          <sphereGeometry args={[0.26, 24, 18]} />
          <meshStandardMaterial color={foco.color} emissive={foco.color} emissiveIntensity={1.2 + fl * 4} transparent opacity={0.95} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.18, 16]} />
          <meshStandardMaterial color="#a1a1aa" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      <pointLight position={FOCO_POS.toArray()} intensity={1.5 + fl * 6} distance={6} color={foco.color} />

      <Particulas plantaId={plantaId} focoId={focoId} />

      {/* Etiquetas de cada etapa */}
      <Etiqueta pos={[PLANTA_X + 0.4, fosil ? 5.6 : 3.2, 0]} df={20} col={`${modoColor}cc`} fs={12}>
        <i className={`fa-solid ${fosil ? "fa-industry" : "fa-solar-panel"}`} style={{ color: modoColor }} />
        {planta.etq} · η = {num(planta.eta * 100)} %
      </Etiqueta>
      <Etiqueta pos={[fosil ? -10.4 : -9.4, fosil ? 7.2 : 4.4, -1.3]} df={20} col="#fb923caa" fs={11}>
        <i className="fa-solid fa-fire" style={{ color: "#fb923c" }} />
        {num((1 - planta.eta) * 100)} % {fosil ? "se va como calor" : "calor y reflejo"}
      </Etiqueta>
      {fosil && (
        <Etiqueta pos={[-6.4, 8.3, -1.2]} df={20} col="#9ca3afaa" fs={11}>
          <i className="fa-solid fa-smog" style={{ color: "#cbd5e1" }} />
          {num(kgKwh, 2)} kg CO₂ por kWh generado
        </Etiqueta>
      )}
      <Etiqueta pos={[-0.6, Y_CABLE + 1.6, 0]} df={20} col="#ef4444aa" fs={11}>
        <i className="fa-solid fa-bolt" style={{ color: "#ef4444" }} />
        Red: se pierde {num(PERDIDAS_RED * 100, 1)} %
      </Etiqueta>
      <Etiqueta pos={[9.6, 4.1, 0]} df={20} col={`${foco.color}aa`} fs={11}>
        <i className="fa-solid fa-lightbulb" style={{ color: foco.color }} />
        {foco.etq}: {num(fl * 100, 1)} % luz
      </Etiqueta>
      <Etiqueta pos={[0.5, -0.1, 3.4]} df={20} col={`${modoColor}cc`} fs={13}>
        <i className="fa-solid fa-route" style={{ color: modoColor }} />
        De cada 100 unidades de energía ({planta.entrada}), {num(global * 100, 1)} llegan como luz
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. MI HUELLA DE CARBONO
 * ════════════════════════════════════════════════════════════════════════ */

const HUECO = 2.2;
const ANCHO_CASA = 7;
const D_REF = diametroEsfera(1);

function EscenaHuella({ huella, modoColor }: { huella: Record<CategoriaId, number>; modoColor: string }) {
  const esferas = useRef<(THREE.Group | null)[]>([]);
  const casa = useRef<THREE.Group>(null);
  const ref1t = useRef<THREE.Group>(null);
  const raiz = useRef<THREE.Group>(null);
  const d = useRef<number[]>(CATEGORIAS.map((c) => diametroEsfera(huella[c.id])));

  useFrame((_, dt) => {
    const nuevos = CATEGORIAS.map((c, k) => {
      const actual = d.current[k] ?? 0;
      return actual + (diametroEsfera(huella[c.id]) - actual) * suave(dt, 0.06);
    });
    d.current = nuevos;
    const ancho = ANCHO_CASA + HUECO + nuevos.reduce((a, b) => a + b + HUECO, 0) + D_REF;
    // Si la fila no cabe en el encuadre, todo se reduce por igual (mantiene la escala relativa).
    if (raiz.current) raiz.current.scale.setScalar(Math.min(1, 60 / ancho));
    let x = -ancho / 2;
    if (casa.current) casa.current.position.x = x + ANCHO_CASA / 2;
    x += ANCHO_CASA + HUECO;
    nuevos.forEach((di, k) => {
      const g = esferas.current[k];
      if (g) {
        g.position.set(x + di / 2, 0, 0);
        const s = Math.max(0.001, di);
        const bola = g.children[0];
        if (bola) {
          bola.scale.setScalar(s);
          bola.position.y = s / 2;
        }
        const etq = g.children[1];
        if (etq) etq.position.y = s + 1.6;
      }
      x += di + HUECO;
    });
    if (ref1t.current) ref1t.current.position.x = x + D_REF / 2;
  });

  const total = CATEGORIAS.reduce((a, c) => a + huella[c.id], 0);

  return (
    <group position={[0, -6, 0]}>
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[400, 0.2, 260]} />
        <meshStandardMaterial color="#14271d" roughness={1} />
      </mesh>
      <group ref={raiz}>
        {/* Casa de dos pisos, persona y árbol para dar escala */}
        <group ref={casa}>
          <mesh position={[0, 3, 0]} castShadow receiveShadow>
            <boxGeometry args={[ANCHO_CASA, 6, 6]} />
            <meshStandardMaterial color={PARED} roughness={0.85} />
          </mesh>
          <mesh position={[0, 6.1, 0]}>
            <boxGeometry args={[ANCHO_CASA + 0.3, 0.2, 6.3]} />
            <meshStandardMaterial color="#c2410c" roughness={0.7} />
          </mesh>
          <mesh position={[1.8, 6.9, 0.8]}>
            <cylinderGeometry args={[0.55, 0.6, 1.3, 20]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          {[
            [-1.8, 1.6],
            [1.8, 1.6],
            [-1.8, 4.4],
            [1.8, 4.4],
          ].map(([x, y]) => (
            <mesh key={`${x}${y}`} position={[x!, y!, 3.01]}>
              <planeGeometry args={[1.4, 1.2]} />
              <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={0.35} />
            </mesh>
          ))}
          <mesh position={[0, 1.1, 3.01]}>
            <planeGeometry args={[1.1, 2.2]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <group position={[ANCHO_CASA / 2 + 1.1, 0, 3.4]}>
            <mesh position={[0, 0.72, 0]} castShadow>
              <capsuleGeometry args={[0.2, 0.9, 6, 12]} />
              <meshStandardMaterial color={modoColor} roughness={0.55} />
            </mesh>
            <mesh position={[0, 1.55, 0]}>
              <sphereGeometry args={[0.16, 16, 12]} />
              <meshStandardMaterial color="#f1c9a5" />
            </mesh>
          </group>
          <Etiqueta pos={[0, 0.6, 5.2]} df={45} fs={11}>
            <i className="fa-solid fa-house" style={{ color: "#fde68a" }} />
            Casa de 2 pisos ≈ 6 m
          </Etiqueta>
        </group>

        {CATEGORIAS.map((c, k) => (
          <group
            key={c.id}
            ref={(g) => {
              esferas.current[k] = g;
            }}
          >
            <mesh castShadow>
              <sphereGeometry args={[0.5, 40, 28]} />
              <meshStandardMaterial color={c.color} transparent opacity={0.5} roughness={0.2} metalness={0.1} emissive={c.color} emissiveIntensity={0.18} depthWrite={false} />
            </mesh>
            <Html position={[0, 10, 0]} center distanceFactor={45} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 12,
                  background: "rgba(4,10,22,0.86)",
                  border: `1px solid ${c.color}`,
                  color: "#fff",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  boxShadow: "0 6px 18px -8px #000",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: c.color }}>
                  <i className={`fa-solid ${c.icono}`} style={{ marginRight: 6 }} />
                  {c.etq}
                </div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>{num(huella[c.id], 2)} t</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>
                  {total > 0 ? num((huella[c.id] / total) * 100) : 0} % · ⌀ {num(diametroEsfera(huella[c.id]), 1)} m
                </div>
              </div>
            </Html>
          </group>
        ))}

        <group ref={ref1t}>
          <mesh position={[0, D_REF / 2, 0]}>
            <sphereGeometry args={[D_REF / 2, 24, 16]} />
            <meshBasicMaterial color="#e2e8f0" wireframe transparent opacity={0.22} />
          </mesh>
          <Etiqueta pos={[0, 0.6, D_REF / 2 + 2.4]} df={45} fs={11} col="#e2e8f0aa">
            Referencia: 1 t de CO₂ = esfera de {num(D_REF, 1)} m
          </Etiqueta>
        </group>
      </group>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function ConsumoEnergeticoScene(p: ConsumoSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt; min: number; max: number } => {
    if (vista === "casa") return { pos: [8.2, 8.8, 11.6], target: [0.6, -0.4, 1.0], min: 5, max: 26 };
    if (vista === "cadena") return { pos: [0.2, 8.2, 23.5], target: [0, 1.0, 0], min: 7, max: 38 };
    return { pos: [2, 13, 64], target: [0, 4, 0], min: 25, max: 120 };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42, far: 400 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", vista === "huella" ? 90 : 26, vista === "huella" ? 220 : 60]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={vista === "huella" ? [30, 60, 40] : [6, 12, 8]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-8, 5, 6]} intensity={0.4} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "casa" && <EscenaCasa casa={p.casa} seleccionado={p.seleccionado} onSeleccionar={p.onSeleccionar} modoColor={modoColor} />}
      {vista === "cadena" && <EscenaCadena plantaId={p.plantaId} focoId={p.focoId} modoColor={modoColor} />}
      {vista === "huella" && <EscenaHuella huella={p.huella} modoColor={modoColor} />}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={cam.min}
        maxDistance={cam.max}
        maxPolarAngle={Math.PI * 0.47}
        minPolarAngle={Math.PI * 0.08}
        target={cam.target}
      />
      <EffectComposer>
        <Bloom intensity={0.35} luminanceThreshold={0.62} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
