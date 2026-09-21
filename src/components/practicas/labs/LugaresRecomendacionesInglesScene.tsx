"use client";

/**
 * Escena 3D del laboratorio "Places to visit: Rincón del Colibrí" (IN-III-P03).
 * Tres vistas:
 *
 *  - describir: la maqueta de UN lugar sobre un pedestal (plaza, mercado,
 *    museo, cascada, zona arqueológica, playa o mirador). Las piezas que se
 *    pueden contar se dibujan desde las posiciones del archivo de datos, así que
 *    lo que el alumno ve es lo que se revisa. Una oración correcta marca en
 *    verde las piezas que menciona; una falsa las marca en naranja.
 *  - guia: el mapa completo del pueblo. El visitante sale de la oficina de
 *    turismo, camina por las calles hasta el lugar elegido y reacciona.
 *  - recomendar: el mismo mapa desde el módulo de información; la cámara sigue
 *    al turista hasta el lugar que le recomendaste y ahí dice si le encantó.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se usa
 * <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { LUGARES, VISITANTES_GUIA, TURISTAS, lugar, mulberry32, type LugarId, type Lugar, type Pt, type Reaccion, type TipoOracion } from "./lugares-recomendaciones-ingles-data";

export type VistaLugares = "describir" | "guia" | "recomendar";

export interface LugaresSceneProps {
  vista: VistaLugares;
  modoColor: string;
  resetNonce: number;
  errorNonce: number;
  // Describe the place
  lugarIdx: number;
  resalta: string | null;
  resaltaEstado: "ok" | "valida" | "mal" | null;
  resaltaNonce: number;
  oracion: string;
  hechos: TipoOracion[];
  // Guidebook
  visitaIdx: number;
  guiaElegido: LugarId | null;
  guiaOk: boolean | null;
  guiaResueltos: Partial<Record<string, LugarId>>;
  guiaTab: LugarId;
  viajeNonce: number;
  onTocarLugar?: (id: LugarId) => void;
  // Recommend it
  turistaIdx: number;
  destino: LugarId | null;
  reaccion: Reaccion | null;
  lineaReaccion: string;
  felices: Partial<Record<string, LugarId>>;
}

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const WARN = "#fb923c";
const AMBAR = "#fbbf24";

const CAJA = new THREE.BoxGeometry(1, 1, 1);
const ESFERA = new THREE.SphereGeometry(1, 20, 14);
const CIL = new THREE.CylinderGeometry(1, 1, 1, 24);
const CIL8 = new THREE.CylinderGeometry(1, 1, 1, 8);
const CONO = new THREE.ConeGeometry(1, 1, 20);
const CONO8 = new THREE.ConeGeometry(1, 1, 8);
const CONO4 = new THREE.ConeGeometry(1, 1, 4);
const DODE = new THREE.DodecahedronGeometry(1, 0);
const TORO = new THREE.TorusGeometry(1, 0.18, 8, 24);
const PLANO = new THREE.PlaneGeometry(1, 1);
const ANILLO = new THREE.RingGeometry(0.78, 1, 40);
const ANILLO_FINO = new THREE.RingGeometry(0.97, 1, 72);

type Geo = THREE.BufferGeometry;

/** Malla genérica con material estándar. */
function M({
  geo,
  p,
  s = [1, 1, 1],
  r = [0, 0, 0],
  c,
  rough = 0.8,
  metal = 0,
  emis = 0,
  op,
  sombra = true,
  flat = false,
  doble = false,
}: {
  geo: Geo;
  p: Pt;
  s?: Pt | number;
  r?: Pt;
  c: string;
  rough?: number;
  metal?: number;
  emis?: number;
  op?: number;
  sombra?: boolean;
  flat?: boolean;
  doble?: boolean;
}) {
  return (
    <mesh position={p} scale={s} rotation={r} geometry={geo} castShadow={sombra && op === undefined} receiveShadow>
      <meshStandardMaterial
        color={c}
        roughness={rough}
        metalness={metal}
        emissive={emis ? c : "#000000"}
        emissiveIntensity={emis}
        transparent={op !== undefined}
        opacity={op ?? 1}
        depthWrite={op === undefined || op > 0.6}
        flatShading={flat}
        side={doble ? THREE.DoubleSide : THREE.FrontSide}
      />
    </mesh>
  );
}

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

/** Globo de diálogo con ancho máximo (texto en varias líneas). */
function Globo({ pos, children, col, df = 10, fs = 13, ancho = 300 }: { pos: Pt; children: ReactNode; col: string; df?: number; fs?: number; ancho?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          width: "max-content",
          maxWidth: ancho,
          padding: "8px 13px",
          borderRadius: 13,
          background: "rgba(4,10,22,0.92)",
          border: `2px solid ${col}`,
          color: "#fff",
          fontSize: fs,
          fontWeight: 800,
          lineHeight: 1.35,
          textAlign: "center",
          boxShadow: `0 0 22px -8px ${col}`,
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/** Letrero con poste. El texto (Html) solo se dibuja en la vista de detalle. */
function Letrero({ p, texto, detalle, col = "#fef08a", rotY = 0, alto = 0.62 }: { p: Pt; texto: string; detalle: boolean; col?: string; rotY?: number; alto?: number }) {
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <M geo={CAJA} p={[0, alto / 2, 0]} s={[0.035, alto, 0.035]} c="#44403c" />
      <M geo={CAJA} p={[0, alto + 0.08, 0.02]} s={[0.46, 0.2, 0.03]} c={col} rough={0.5} />
      <M geo={CAJA} p={[0, alto + 0.08, 0.037]} s={[0.4, 0.035, 0.005]} c="#b91c1c" sombra={false} />
      {detalle && (
        <Html position={[0, alto + 0.34, 0.05]} center distanceFactor={6.5} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ padding: "2px 7px", borderRadius: 5, background: "#fef3c7", border: "1.5px solid #b91c1c", color: "#7f1d1d", fontSize: 11, fontWeight: 900, whiteSpace: "nowrap", letterSpacing: "0.03em" }}>{texto}</div>
        </Html>
      )}
    </group>
  );
}

/** Figura estilizada: piernas, cuerpo cápsula, cabeza, cabello y ojos. */
function Figura({ ropa, pelo = "#2b1b12", piel = "#d9a066", pantalon = "#1f2937", gorra, sombrero }: { ropa: string; pelo?: string; piel?: string; pantalon?: string; gorra?: string; sombrero?: boolean }) {
  return (
    <group>
      {[-0.07, 0.07].map((x) => (
        <M key={x} geo={CAJA} p={[x, 0.17, 0]} s={[0.1, 0.34, 0.11]} c={pantalon} />
      ))}
      <mesh position={[0, 0.58, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.3, 6, 14]} />
        <meshStandardMaterial color={ropa} roughness={0.6} />
      </mesh>
      <M geo={ESFERA} p={[0, 1.0, 0]} s={0.14} c={piel} rough={0.6} />
      <M geo={ESFERA} p={[0, 1.04, -0.025]} s={[0.148, 0.14, 0.148]} c={pelo} />
      {[-0.05, 0.05].map((x) => (
        <mesh key={x} position={[x, 1.01, 0.128]} geometry={ESFERA} scale={0.018}>
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      ))}
      {gorra && (
        <>
          <M geo={ESFERA} p={[0, 1.08, 0]} s={[0.152, 0.1, 0.152]} c={gorra} />
          <M geo={CAJA} p={[0, 1.08, 0.13]} s={[0.2, 0.02, 0.14]} c={gorra} />
        </>
      )}
      {sombrero && (
        <>
          <M geo={CIL} p={[0, 1.12, 0]} s={[0.26, 0.02, 0.26]} c="#d6b36a" />
          <M geo={CIL} p={[0, 1.19, 0]} s={[0.13, 0.13, 0.13]} c="#d6b36a" />
        </>
      )}
    </group>
  );
}

function Arbol({ p, s = 1, c = "#2f7d32", maceta = false }: { p: Pt; s?: number; c?: string; maceta?: boolean }) {
  return (
    <group position={p} scale={s}>
      {maceta && <M geo={CIL} p={[0, 0.05, 0]} s={[0.3, 0.1, 0.3]} c="#78716c" />}
      <M geo={CAJA} p={[0, 0.4, 0]} s={[0.1, 0.8, 0.1]} c="#6b4423" />
      <M geo={ESFERA} p={[0, 1.1, 0]} s={[0.42, 0.48, 0.42]} c={c} rough={0.95} flat />
      <M geo={ESFERA} p={[0.14, 1.36, 0.06]} s={[0.26, 0.28, 0.26]} c={c} rough={0.95} flat />
    </group>
  );
}

function Palmera({ p, rot = 0 }: { p: Pt; rot?: number }) {
  const hojas = [0, 1, 2, 3, 4, 5];
  return (
    <group position={p} rotation={[0, rot, 0]}>
      {[0, 1, 2].map((k) => (
        <M key={k} geo={CIL} p={[k * 0.05, 0.3 + k * 0.55, 0]} s={[0.065 - k * 0.008, 0.6, 0.065 - k * 0.008]} r={[0, 0, -0.08]} c="#8b6b43" />
      ))}
      {hojas.map((k) => {
        const a = (k / hojas.length) * Math.PI * 2;
        return (
          <group key={k} position={[0.12, 1.78, 0]} rotation={[0, a, 0]}>
            <M geo={CAJA} p={[0, -0.1, 0.36]} s={[0.16, 0.025, 0.72]} r={[0.45, 0, 0]} c="#3f9a3a" rough={0.9} />
          </group>
        );
      })}
      {[0, 1, 2].map((k) => (
        <M key={`c${k}`} geo={ESFERA} p={[0.12 + Math.cos(k * 2.1) * 0.08, 1.7, Math.sin(k * 2.1) * 0.08]} s={0.055} c="#5b3b1a" />
      ))}
    </group>
  );
}

/** Banca que mira hacia un punto (el respaldo queda del lado contrario). */
function Banca({ p, mira, c = "#92400e" }: { p: Pt; mira?: [number, number]; c?: string }) {
  const rot = mira ? Math.atan2(mira[0] - p[0], mira[1] - p[2]) : 0;
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <M geo={CAJA} p={[0, 0.22, 0]} s={[0.62, 0.05, 0.2]} c={c} />
      <M geo={CAJA} p={[0, 0.4, -0.09]} s={[0.62, 0.24, 0.04]} c={c} />
      {[-0.26, 0.26].map((x) => (
        <M key={x} geo={CAJA} p={[x, 0.1, 0]} s={[0.04, 0.2, 0.18]} c="#27272a" metal={0.5} />
      ))}
    </group>
  );
}

function Tablero({ c, borde = "#6b5b45" }: { c: string; borde?: string }) {
  return (
    <group>
      <M geo={CAJA} p={[0, -0.14, 0]} s={[5.2, 0.28, 5.2]} c={c} rough={0.95} />
      <M geo={CAJA} p={[0, -0.32, 0]} s={[5.24, 0.1, 5.24]} c={borde} rough={1} />
    </group>
  );
}

const posDe = (l: Lugar, clave: string): Pt[] => l.objetos.find((o) => o.clave === clave)?.pos ?? [];

/* ════════════════════════════════════════════════════════════════════════
 * LAS SIETE MAQUETAS (coordenadas locales, tablero de 5.2 × 5.2)
 * ════════════════════════════════════════════════════════════════════════ */

interface DioramaProps {
  detalle: boolean;
}

function DPlaza({ detalle }: DioramaProps) {
  const l = lugar("plaza");
  const chorro = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (chorro.current) chorro.current.position.y = 0.74 + Math.sin(clock.elapsedTime * 5) * 0.025;
  });
  const [kx, , kz] = posDe(l, "kiosk")[0]!;
  return (
    <group>
      <Tablero c="#d8cdb8" />
      <M geo={CAJA} p={[0, 0.006, 0.75]} s={[4.95, 0.012, 3.55]} c="#eadfcb" sombra={false} />
      {[-1.2, 0, 1.2].map((x) => (
        <M key={x} geo={CAJA} p={[x, 0.014, 0.75]} s={[0.03, 0.006, 3.5]} c="#cdbfa3" sombra={false} />
      ))}
      {/* Iglesia antigua */}
      <group position={[0, 0, -1.75]}>
        <M geo={CAJA} p={[0, 0.78, -0.15]} s={[1.5, 1.56, 1.2]} c="#e7c38a" />
        <M geo={CAJA} p={[0, 1.55, 0.44]} s={[0.84, 0.84, 0.06]} r={[0, 0, Math.PI / 4]} c="#e7c38a" />
        <M geo={CAJA} p={[0, 1.58, -0.2]} s={[1.55, 0.06, 1.1]} c="#b45309" />
        {[-0.95, 0.95].map((x) => (
          <group key={x} position={[x, 0, 0.18]}>
            <M geo={CAJA} p={[0, 1.15, 0]} s={[0.5, 2.3, 0.5]} c="#dcae6e" />
            <M geo={CAJA} p={[0, 1.8, 0.255]} s={[0.22, 0.36, 0.02]} c="#3b2a1a" sombra={false} />
            <M geo={CONO4} p={[0, 2.52, 0]} s={[0.38, 0.46, 0.38]} r={[0, Math.PI / 4, 0]} c="#b45309" flat />
            <M geo={CAJA} p={[0, 2.86, 0]} s={[0.025, 0.22, 0.025]} c="#44403c" />
            <M geo={CAJA} p={[0, 2.9, 0]} s={[0.12, 0.025, 0.025]} c="#44403c" />
          </group>
        ))}
        <M geo={CAJA} p={[0, 0.36, 0.46]} s={[0.4, 0.72, 0.03]} c="#5b3a1e" />
        <M geo={CIL} p={[0, 0.72, 0.46]} s={[0.2, 0.03, 0.2]} r={[Math.PI / 2, 0, 0]} c="#5b3a1e" />
        <M geo={CIL} p={[0, 1.18, 0.47]} s={[0.14, 0.02, 0.14]} r={[Math.PI / 2, 0, 0]} c="#60a5fa" emis={0.35} />
      </group>
      {/* Fuente */}
      <group position={posDe(l, "fountain")[0]!}>
        <M geo={CIL} p={[0, 0.1, 0]} s={[0.46, 0.2, 0.46]} c="#cbd5e1" rough={0.6} />
        <M geo={CIL} p={[0, 0.205, 0]} s={[0.4, 0.02, 0.4]} c="#38bdf8" emis={0.25} op={0.85} rough={0.1} />
        <M geo={CIL} p={[0, 0.42, 0]} s={[0.06, 0.46, 0.06]} c="#e2e8f0" />
        <M geo={CIL} p={[0, 0.64, 0]} s={[0.19, 0.05, 0.19]} c="#e2e8f0" />
        <mesh ref={chorro} position={[0, 0.74, 0]} geometry={ESFERA} scale={[0.06, 0.09, 0.06]}>
          <meshStandardMaterial color="#bae6fd" emissive="#38bdf8" emissiveIntensity={0.6} transparent opacity={0.8} />
        </mesh>
      </group>
      <Letrero p={[-0.72, 0, -0.5]} texto="NO SWIMMING" detalle={detalle} />
      {/* Kiosco con músicos */}
      <group position={[kx, 0, kz]}>
        <M geo={CIL8} p={[0, 0.11, 0]} s={[0.68, 0.22, 0.68]} c="#f5f5f4" />
        <M geo={CAJA} p={[0, 0.05, 0.74]} s={[0.4, 0.1, 0.18]} c="#e7e5e4" />
        {Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
          return <M key={k} geo={CIL} p={[Math.sin(a) * 0.56, 0.62, Math.cos(a) * 0.56]} s={[0.03, 0.8, 0.03]} c="#fafaf9" />;
        })}
        <M geo={CIL8} p={[0, 1.04, 0]} s={[0.8, 0.06, 0.8]} c="#fafaf9" />
        <M geo={CONO8} p={[0, 1.3, 0]} s={[0.82, 0.48, 0.82]} c="#15803d" flat />
        <M geo={ESFERA} p={[0, 1.58, 0]} s={0.06} c="#fbbf24" metal={0.6} rough={0.3} />
        {[
          [-0.25, -0.05, "#dc2626"],
          [0.25, -0.05, "#1d4ed8"],
          [0, 0.25, "#f8fafc"],
        ].map(([x, z, col], k) => (
          <group key={k} position={[x as number, 0.22, z as number]} scale={0.4}>
            <Figura ropa={col as string} sombrero={k === 2} />
            <M geo={CIL} p={[0.2, 0.62, 0.15]} s={[0.07, 0.3, 0.07]} r={[0.6, 0, 0]} c="#fbbf24" metal={0.7} rough={0.3} />
          </group>
        ))}
      </group>
      {/* Carrito de nieves */}
      <group position={posDe(l, "icecream")[0]!}>
        <M geo={CAJA} p={[0, 0.34, 0]} s={[0.46, 0.3, 0.3]} c="#fdf2f8" rough={0.5} />
        <M geo={CAJA} p={[0, 0.4, 0.155]} s={[0.46, 0.06, 0.01]} c="#ec4899" sombra={false} />
        {[-0.17, 0.17].map((x) => (
          <M key={x} geo={CIL} p={[x, 0.1, 0.12]} s={[0.09, 0.03, 0.09]} r={[0, 0, Math.PI / 2]} c="#1f2937" />
        ))}
        <M geo={CIL} p={[0, 0.72, 0]} s={[0.015, 0.5, 0.015]} c="#71717a" />
        <M geo={CONO} p={[0, 0.99, 0]} s={[0.36, 0.17, 0.36]} c="#f472b6" />
      </group>
      {posDe(l, "bench").map((b, i) => (
        <Banca key={i} p={b} mira={[kx, kz]} />
      ))}
      {posDe(l, "tree").map((t, i) => (
        <Arbol key={i} p={t} s={0.95} maceta />
      ))}
      <group position={[-1.05, 0, -0.1]} rotation={[0, 0.6, 0]} scale={0.5}>
        <Figura ropa="#0ea5e9" />
      </group>
      <group position={[1.45, 0, 0.3]} rotation={[0, -1.2, 0]} scale={0.5}>
        <Figura ropa="#f8fafc" pelo="#111827" gorra="#ec4899" />
      </group>
      <group position={[0.35, 0, 1.95]} rotation={[0, 2.8, 0]} scale={0.5}>
        <Figura ropa="#a855f7" pelo="#5b3a1e" />
      </group>
    </group>
  );
}

const TOLDOS: [string, string][] = [
  ["#dc2626", "#fef3c7"],
  ["#2563eb", "#facc15"],
  ["#16a34a", "#fce7f3"],
  ["#db2777", "#fef3c7"],
  ["#7c3aed", "#fde68a"],
  ["#ea580c", "#e0f2fe"],
];

function Puesto({ p, i, comida = false }: { p: Pt; i: number; comida?: boolean }) {
  const [c1, c2] = comida ? (["#f97316", "#fef08a"] as [string, string]) : TOLDOS[i % TOLDOS.length]!;
  return (
    <group position={p}>
      <M geo={CAJA} p={[0, 0.22, 0.12]} s={[0.95, 0.44, 0.36]} c="#8b5a2b" />
      <M geo={CAJA} p={[0, 0.455, 0.12]} s={[1.0, 0.03, 0.42]} c="#a16207" />
      {[-0.47, 0.47].map((x) =>
        [-0.18, 0.3].map((z) => <M key={`${x}${z}`} geo={CAJA} p={[x, 0.62, z]} s={[0.035, 1.24, 0.035]} c="#57534e" />),
      )}
      <group position={[0, 1.24, 0.06]} rotation={[-0.22, 0, 0]}>
        {[0, 1, 2, 3].map((k) => (
          <M key={k} geo={CAJA} p={[-0.36 + k * 0.24, 0, 0]} s={[0.24, 0.03, 0.66]} c={k % 2 ? c2 : c1} />
        ))}
      </group>
      {comida ? (
        <>
          <M geo={CIL} p={[0.1, 0.49, 0.1]} s={[0.18, 0.03, 0.18]} c="#27272a" metal={0.4} />
          {[-0.28, 0.35].map((x) => (
            <M key={x} geo={CIL} p={[x, 0.53, 0.14]} s={[0.07, 0.1, 0.07]} c={x < 0 ? "#b45309" : "#16a34a"} />
          ))}
          {[-0.25, 0.25].map((x) => (
            <M key={`b${x}`} geo={CIL} p={[x, 0.14, 0.55]} s={[0.08, 0.28, 0.08]} c="#dc2626" />
          ))}
        </>
      ) : (
        <>
          {[-0.3, -0.05, 0.2, 0.36].map((x, k) => (
            <M key={x} geo={CIL} p={[x, 0.53, 0.14]} s={[0.07 + (k % 2) * 0.02, 0.12 + (k % 3) * 0.03, 0.07 + (k % 2) * 0.02]} c={["#c2410c", "#9a3412", "#ea580c", "#78350f"][k]!} />
          ))}
          {[-0.28, 0, 0.28].map((x, k) => (
            <M key={`t${x}`} geo={CAJA} p={[x, 0.82, -0.17]} s={[0.22, 0.5, 0.02]} c={["#e11d48", "#0891b2", "#ca8a04", "#7c3aed"][(i + k) % 4]!} sombra={false} />
          ))}
        </>
      )}
      <group position={[0.05, 0, -0.08]} rotation={[0, 0, 0]} scale={0.42}>
        <Figura ropa={comida ? "#f8fafc" : c1} pelo="#1c1917" />
      </group>
    </group>
  );
}

function Vapor({ p }: { p: Pt }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const c = g.current;
    if (!c) return;
    c.children.forEach((ch, k) => {
      const f = (clock.elapsedTime * 0.45 + k / 3) % 1;
      ch.position.y = f * 0.55;
      ch.scale.setScalar(0.04 + f * 0.07);
      ((ch as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.5 * (1 - f);
    });
  });
  return (
    <group ref={g} position={p}>
      {[0, 1, 2].map((k) => (
        <mesh key={k} geometry={ESFERA}>
          <meshStandardMaterial color="#f8fafc" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

const PAPEL = ["#ec4899", "#f97316", "#facc15", "#22c55e", "#3b82f6", "#a855f7"];

function DMercado({ detalle }: DioramaProps) {
  const l = lugar("mercado");
  const papel = useMemo(() => {
    const xs: { p: Pt; c: string }[] = [];
    [0.42, -0.92].forEach((z, j) => {
      for (let k = 0; k < 15; k++) xs.push({ p: [-2.24 + k * 0.32, 1.66 - Math.sin((k / 14) * Math.PI) * 0.1, z], c: PAPEL[(k + j * 3) % PAPEL.length]! });
    });
    return xs;
  }, []);
  return (
    <group>
      <Tablero c="#c79a6f" />
      <M geo={CAJA} p={[0, 0.006, -0.35]} s={[4.9, 0.012, 4.2]} c="#b8683f" sombra={false} />
      {posDe(l, "craftstall").map((p, i) => (
        <Puesto key={i} p={p} i={i} />
      ))}
      {posDe(l, "foodstall").map((p, i) => (
        <group key={i}>
          <Puesto p={p} i={i} comida />
          <Vapor p={[p[0] + 0.1, 0.55, p[2] + 0.1]} />
        </group>
      ))}
      {posDe(l, "table").map((p, i) => (
        <group key={i} position={p}>
          <M geo={CAJA} p={[0, 0.32, 0]} s={[0.4, 0.03, 0.4]} c="#fef3c7" />
          <M geo={CIL} p={[0, 0.16, 0]} s={[0.035, 0.32, 0.035]} c="#44403c" />
          {[-0.28, 0.28].map((z) => (
            <M key={z} geo={CIL} p={[0, 0.1, z]} s={[0.08, 0.2, 0.08]} c="#0ea5e9" />
          ))}
        </group>
      ))}
      {/* Arco de entrada */}
      <group position={posDe(l, "arch")[0]!}>
        {[-0.95, 0.95].map((x) => (
          <M key={x} geo={CAJA} p={[x, 0.75, 0]} s={[0.2, 1.5, 0.2]} c="#db2777" />
        ))}
        <M geo={CAJA} p={[0, 1.6, 0]} s={[2.2, 0.24, 0.24]} c="#be185d" />
        <M geo={CAJA} p={[0, 1.6, 0.13]} s={[1.4, 0.15, 0.02]} c="#fef9c3" sombra={false} />
        <M geo={CAJA} p={[0.66, 1.36, 0.13]} s={[0.46, 0.14, 0.02]} c="#f8fafc" sombra={false} />
        {detalle && (
          <>
            <Html position={[0, 1.6, 0.16]} center distanceFactor={6.5} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ color: "#9d174d", fontSize: 12, fontWeight: 900, whiteSpace: "nowrap", letterSpacing: "0.06em" }}>CRAFTS MARKET</div>
            </Html>
            <Html position={[0.66, 1.36, 0.16]} center distanceFactor={6.5} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ padding: "1px 6px", borderRadius: 4, background: "#fef3c7", border: "1.5px solid #b91c1c", color: "#7f1d1d", fontSize: 10, fontWeight: 900, whiteSpace: "nowrap" }}>CASH ONLY</div>
            </Html>
          </>
        )}
      </group>
      {/* Papel picado */}
      {[0.42, -0.92].map((z) => (
        <M key={z} geo={CAJA} p={[0, 1.74, z]} s={[4.8, 0.01, 0.01]} c="#e7e5e4" sombra={false} />
      ))}
      {papel.map((f, k) => (
        <mesh key={k} position={f.p} geometry={PLANO} scale={[0.2, 0.2, 1]}>
          <meshStandardMaterial color={f.c} side={THREE.DoubleSide} roughness={0.7} />
        </mesh>
      ))}
      {[
        [-0.72, 0.55, "#0891b2", 0.3],
        [0.7, 0.35, "#a3e635", -2.6],
        [-0.25, 1.35, "#f43f5e", 3.0],
        [0.45, -0.95, "#fbbf24", 0.2],
        [-0.8, -0.95, "#6366f1", -0.3],
      ].map(([x, z, col, rot], k) => (
        <group key={k} position={[x as number, 0, z as number]} rotation={[0, rot as number, 0]} scale={0.48}>
          <Figura ropa={col as string} pelo={k % 2 ? "#3f2a1d" : "#111827"} />
        </group>
      ))}
    </group>
  );
}

function DMuseo({ detalle }: DioramaProps) {
  const l = lugar("museo");
  const cabina = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (cabina.current) cabina.current.position.y = 0.58 + (Math.sin(clock.elapsedTime * 0.7) * 0.5 + 0.5) * 1.15;
  });
  const [ex, , ez] = posDe(l, "elevator")[0]!;
  const PISO1 = 0.3;
  const PISO2 = 1.45;
  const escalones = 9;
  return (
    <group>
      <Tablero c="#bcc6d1" />
      {[-1.75, 1.75].map((x) => (
        <M key={x} geo={CAJA} p={[x, 0.012, 1.85]} s={[1.5, 0.024, 1.3]} c="#4d8b3f" sombra={false} />
      ))}
      {/* Planta baja (first floor) y estructura */}
      <M geo={CAJA} p={[-0.2, PISO1 / 2, -0.2]} s={[3.5, PISO1, 2.3]} c="#e5e7eb" />
      <M geo={CAJA} p={[-0.2, 1.45, -1.28]} s={[3.5, 2.3, 0.14]} c="#f5efe0" />
      <M geo={CAJA} p={[-1.88, 1.45, -0.2]} s={[0.14, 2.3, 2.3]} c="#efe6d2" />
      <M geo={CAJA} p={[-0.6, PISO2 - 0.05, -0.2]} s={[2.7, 0.1, 2.3]} c="#d6d3d1" />
      <M geo={CAJA} p={[1.15, PISO2 - 0.05, -1.15]} s={[0.8, 0.1, 0.4]} c="#d6d3d1" />
      <M geo={CAJA} p={[-0.2, 2.66, -1.15]} s={[3.7, 0.12, 0.5]} c="#8b95a1" />
      <M geo={CAJA} p={[-1.72, 2.66, -0.2]} s={[0.5, 0.12, 2.5]} c="#8b95a1" />
      {[-1.8, -0.45, 0.45, 1.48].map((x) => (
        <M key={x} geo={CIL} p={[x, (PISO1 + PISO2) / 2 - 0.05, 0.88]} s={[0.07, PISO2 - PISO1 - 0.1, 0.07]} c="#fafaf9" />
      ))}
      <M geo={CAJA} p={[-0.6, 1.62, 0.9]} s={[2.7, 0.3, 0.03]} c="#bae6fd" op={0.35} rough={0.1} />
      {/* Letrero MUSEUM encima de la entrada */}
      <M geo={CAJA} p={posDe(l, "sign")[0]!} s={[0.92, 0.22, 0.04]} c="#312e81" />
      {detalle && (
        <Html position={[0, 1.6, 1.0]} center distanceFactor={6.5} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ color: "#fde68a", fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", whiteSpace: "nowrap" }}>MUSEUM</div>
        </Html>
      )}
      {/* Rampa enfrente de la entrada */}
      <group position={posDe(l, "ramp")[0]!}>
        <M geo={CAJA} p={[0, 0.15, 0]} s={[0.72, 0.06, 1.53]} r={[0.197, 0, 0]} c="#a8a29e" />
        {[-0.37, 0.37].map((x) => (
          <M key={x} geo={CAJA} p={[x, 0.42, 0]} s={[0.025, 0.025, 1.53]} r={[0.197, 0, 0]} c="#e5e7eb" metal={0.6} rough={0.3} />
        ))}
        {[-0.37, 0.37].map((x) =>
          [-0.6, 0.6].map((z) => <M key={`${x}${z}`} geo={CAJA} p={[x, 0.3 - z * 0.2, z]} s={[0.025, 0.3, 0.025]} c="#e5e7eb" metal={0.6} />),
        )}
      </group>
      {/* Vitrinas en la planta baja */}
      {posDe(l, "displaycase").map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <M geo={CAJA} p={[0, 0.25, 0]} s={[0.5, 0.5, 0.4]} c="#6b4423" />
          <M geo={CAJA} p={[0, 0.66, 0]} s={[0.46, 0.32, 0.36]} c="#e0f2fe" op={0.3} rough={0.05} />
          <M geo={i === 1 ? CONO4 : ESFERA} p={[0, 0.6, 0]} s={i === 1 ? [0.09, 0.18, 0.09] : 0.08} c={["#c2410c", "#a8a29e", "#ca8a04"][i]!} />
        </group>
      ))}
      <Letrero p={[-0.9, PISO1, 0.45]} texto="PLEASE DON'T TOUCH" detalle={detalle} alto={0.45} />
      {/* Escaleras y elevador */}
      {Array.from({ length: escalones }, (_, i) => {
        const alto = ((i + 1) / escalones) * (PISO2 - PISO1);
        return <M key={i} geo={CAJA} p={[1.15, PISO1 + alto / 2, 0.72 - i * 0.19]} s={[0.5, alto, 0.19]} c="#d6d3d1" />;
      })}
      <group position={[ex, 0, ez]}>
        <M geo={CAJA} p={[0, 1.36, 0]} s={[0.52, 2.72, 0.52]} c="#bae6fd" op={0.22} rough={0.05} />
        {[-0.25, 0.25].map((x) =>
          [-0.25, 0.25].map((z) => <M key={`${x}${z}`} geo={CAJA} p={[x, 1.36, z]} s={[0.04, 2.72, 0.04]} c="#475569" metal={0.6} />),
        )}
        <mesh ref={cabina} position={[0, 0.58, 0]} geometry={CAJA} scale={[0.42, 0.52, 0.42]} castShadow>
          <meshStandardMaterial color="#fbbf24" roughness={0.4} metalness={0.3} />
        </mesh>
      </group>
      {/* Mural en el segundo piso */}
      <group position={posDe(l, "mural")[0]!}>
        {["#1d4ed8", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed"].map((col, k) => (
          <M key={k} geo={CAJA} p={[-0.64 + k * 0.32, 0.52, 0.01]} s={[0.32, 0.78, 0.02]} c={col} sombra={false} />
        ))}
        <M geo={CIL} p={[0.3, 0.72, 0.03]} s={[0.14, 0.02, 0.14]} r={[Math.PI / 2, 0, 0]} c="#fde047" emis={0.4} sombra={false} />
        <M geo={CONO4} p={[-0.3, 0.42, 0.03]} s={[0.4, 0.4, 0.02]} c="#065f46" sombra={false} />
      </group>
      {/* Fotos antiguas */}
      {posDe(l, "photo").map(([x, y, z], i) => (
        <group key={i} position={[x - 0.05, y, z]}>
          <M geo={CAJA} p={[0, 0, 0]} s={[0.02, 0.3, 0.36]} c="#1f2937" sombra={false} />
          <M geo={CAJA} p={[0.012, 0, 0]} s={[0.01, 0.22, 0.28]} c={i % 3 ? "#d6b98c" : "#a8a29e"} sombra={false} />
        </group>
      ))}
      <group position={[0.2, PISO1, 0.35]} rotation={[0, Math.PI, 0]} scale={0.45}>
        <Figura ropa="#0d9488" />
      </group>
      <group position={[-0.25, PISO2, -0.45]} rotation={[0, Math.PI, 0]} scale={0.45}>
        <Figura ropa="#e11d48" pelo="#78350f" />
      </group>
    </group>
  );
}

const CHORROS = 22;
const CHORROS_X = (() => {
  const r = mulberry32(21);
  return Array.from({ length: CHORROS }, () => [(r() - 0.5) * 0.6, r()] as [number, number]);
})();

function DCascada({ detalle }: DioramaProps) {
  const l = lugar("cascada");
  const [wx, , wz] = posDe(l, "waterfall")[0]!;
  const [px, , pz] = posDe(l, "pool")[0]!;
  const chorros = useRef<THREE.InstancedMesh>(null);
  const nadador = useRef<THREE.Group>(null);
  const espuma = useRef<THREE.Group>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const rocas = useMemo(() => {
    const r = mulberry32(5);
    return Array.from({ length: 14 }, (_, k) => {
      const a = (k / 14) * Math.PI * 2;
      return { p: [px + Math.cos(a) * 1.08, 0.06, pz + Math.sin(a) * 0.78] as Pt, s: 0.1 + r() * 0.09 };
    });
  }, [px, pz]);
  const rio: [number, number][] = [
    [0.7, -0.2],
    [1.0, 0.5],
    [1.35, 1.1],
    [1.62, 1.8],
    [1.95, 2.6],
  ];
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const g = chorros.current;
    if (g) {
      for (let i = 0; i < CHORROS; i++) {
        const [dx, f] = CHORROS_X[i]!;
        const y = 3.05 - ((t * 1.6 + f * 3) % 3);
        obj.position.set(wx + dx, y, wz + 0.09);
        obj.scale.set(0.02, 0.28, 0.02);
        obj.updateMatrix();
        g.setMatrixAt(i, obj.matrix);
      }
      g.instanceMatrix.needsUpdate = true;
    }
    if (nadador.current) nadador.current.position.y = Math.sin(t * 2.2) * 0.02;
    if (espuma.current) espuma.current.children.forEach((c, k) => c.scale.setScalar(0.12 + Math.sin(t * 3 + k) * 0.03));
  });
  return (
    <group>
      <Tablero c="#4f8f3a" />
      {/* Acantilado */}
      <M geo={CAJA} p={[0, 1.55, -2.3]} s={[5.2, 3.1, 0.6]} c="#7c7066" flat />
      <M geo={CAJA} p={[0, 3.12, -2.3]} s={[5.2, 0.06, 0.6]} c="#4d7c0f" />
      {[
        [-2.2, 0.5, -1.9, 0.55],
        [-1.4, 1.6, -1.95, 0.5],
        [-2.0, 2.6, -2.0, 0.45],
        [1.3, 0.4, -1.9, 0.5],
        [2.1, 1.3, -1.95, 0.55],
        [1.2, 2.4, -2.0, 0.5],
        [-0.75, 2.7, -1.98, 0.35],
        [0.95, 1.2, -1.93, 0.35],
      ].map(([x, y, z, s], k) => (
        <M key={k} geo={DODE} p={[x!, y!, z!]} s={s!} c={k % 2 ? "#8a7f73" : "#6f655b"} flat />
      ))}
      {[-1.7, -0.9, 1.1, 1.9].map((x, k) => (
        <M key={`m${k}`} geo={ESFERA} p={[x, 3.2, -2.25]} s={[0.3, 0.2, 0.25]} c="#3f7d20" flat />
      ))}
      {/* Cascada */}
      <M geo={CAJA} p={[wx, 1.6, wz + 0.05]} s={[0.66, 3.0, 0.05]} c="#7dd3fc" emis={0.35} op={0.78} rough={0.1} />
      <instancedMesh ref={chorros} args={[undefined, undefined, CHORROS]} frustumCulled={false} geometry={CAJA}>
        <meshStandardMaterial color="#f0f9ff" emissive="#e0f2fe" emissiveIntensity={0.7} transparent opacity={0.85} />
      </instancedMesh>
      <group ref={espuma}>
        {[-0.25, 0, 0.25, -0.1, 0.15].map((dx, k) => (
          <M key={k} geo={ESFERA} p={[wx + dx, 0.1, wz + 0.25 + (k % 2) * 0.12]} s={0.12} c="#f8fafc" op={0.85} sombra={false} />
        ))}
      </group>
      {/* Poza natural debajo de la cascada */}
      <M geo={CIL} p={[px, 0.01, pz]} s={[1.05, 0.03, 0.78]} c="#0e7490" sombra={false} />
      <M geo={CIL} p={[px, 0.035, pz]} s={[1.0, 0.02, 0.74]} c="#22d3ee" emis={0.2} op={0.75} rough={0.05} sombra={false} />
      {rocas.map((r, k) => (
        <M key={k} geo={DODE} p={r.p} s={r.s} c="#8a8178" flat />
      ))}
      <group ref={nadador}>
        <group position={[px + 0.35, -0.55 * 0.5, pz + 0.2]} scale={0.5}>
          <Figura ropa="#f43f5e" pelo="#1c1917" />
        </group>
      </group>
      {/* Río */}
      {rio.slice(0, -1).map(([x0, z0], k) => {
        const [x1, z1] = rio[k + 1]!;
        const len = Math.hypot(x1 - x0, z1 - z0);
        return <M key={k} geo={CAJA} p={[(x0 + x1) / 2, 0.02, (z0 + z1) / 2]} s={[0.46, 0.03, len + 0.1]} r={[0, Math.atan2(x1 - x0, z1 - z0), 0]} c="#38bdf8" emis={0.15} op={0.85} sombra={false} />;
      })}
      {/* Puente de madera sobre el río */}
      <group position={posDe(l, "bridge")[0]!} rotation={[0, Math.atan2(0.35, 0.6), 0]}>
        <M geo={CAJA} p={[0, 0.12, 0]} s={[0.95, 0.05, 0.34]} c="#92400e" />
        {[-0.16, 0.16].map((z) => (
          <M key={z} geo={CAJA} p={[0, 0.3, z]} s={[0.95, 0.03, 0.03]} c="#78350f" />
        ))}
        {[-0.44, 0, 0.44].map((x) =>
          [-0.16, 0.16].map((z) => <M key={`${x}${z}`} geo={CAJA} p={[x, 0.2, z]} s={[0.03, 0.22, 0.03]} c="#78350f" />),
        )}
      </group>
      {/* Sendero con escalones */}
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <M key={`e${k}`} geo={CAJA} p={[-1.55, 0.12 + k * 0.24, -1.72 - k * 0.02]} s={[0.42, 0.24 + k * 0.48, 0.16]} c="#a8a29e" />
      ))}
      {[
        [-1.35, -1.2],
        [-1.15, -0.55],
        [-1.55, 0.95],
        [-1.2, 1.95],
      ].map(([x, z], k) => (
        <M key={`s${k}`} geo={CIL} p={[x!, 0.012, z!]} s={[0.16, 0.02, 0.13]} c="#d6d3d1" sombra={false} />
      ))}
      {posDe(l, "picnictable").map((p, i) => (
        <group key={i} position={p} rotation={[0, 0.5 - i * 0.3, 0]}>
          <M geo={CAJA} p={[0, 0.3, 0]} s={[0.55, 0.04, 0.3]} c="#a16207" />
          {[-0.26, 0.26].map((z) => (
            <M key={z} geo={CAJA} p={[0, 0.17, z]} s={[0.55, 0.03, 0.12]} c="#a16207" />
          ))}
          {[-0.22, 0.22].map((x) => (
            <M key={`l${x}`} geo={CAJA} p={[x, 0.15, 0]} s={[0.04, 0.3, 0.5]} c="#78350f" />
          ))}
        </group>
      ))}
      {posDe(l, "tree").map((t, i) => (
        <Arbol key={i} p={t} s={0.95} c={i % 2 ? "#166534" : "#2f7d32"} />
      ))}
      <Letrero p={[-0.8, 0, -1.45]} texto="NO JUMPING" detalle={detalle} />
    </group>
  );
}

function DRuinas({ detalle }: DioramaProps) {
  const l = lugar("ruinas");
  const [py, , pz] = posDe(l, "pyramid")[0]!;
  const bandera = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (bandera.current) bandera.current.rotation.y = Math.sin(clock.elapsedTime * 3) * 0.3;
  });
  const [bx, , bz] = posDe(l, "ballcourt")[0]!;
  const [vx, , vz] = posDe(l, "visitorcenter")[0]!;
  return (
    <group>
      <Tablero c="#4d7c0f" />
      <M geo={CAJA} p={[0, 0.006, -0.1]} s={[4.9, 0.012, 4.5]} c="#c9bd95" sombra={false} />
      {/* Pirámide escalonada */}
      {[0, 1, 2, 3].map((i) => {
        const w = 2.0 - i * 0.4;
        return <M key={i} geo={CAJA} p={[py, 0.2 + i * 0.4, pz]} s={[w, 0.4, w]} c={i % 2 ? "#b3a993" : "#a39881"} flat />;
      })}
      <M geo={CAJA} p={[py, 1.82, pz - 0.05]} s={[0.6, 0.44, 0.5]} c="#978b76" />
      <M geo={CAJA} p={[py, 1.75, pz + 0.21]} s={[0.18, 0.28, 0.02]} c="#292524" sombra={false} />
      <M geo={CAJA} p={[py, 0.82, pz + 0.72]} s={[0.46, 0.06, 1.72]} r={[1.21, 0, 0]} c="#cfc6b0" />
      {/* Cuerda y letrero: no se sube */}
      {[-0.35, 0.35].map((x) => (
        <M key={x} geo={CIL} p={[x, 0.2, 0.0]} s={[0.03, 0.4, 0.03]} c="#57534e" />
      ))}
      <M geo={CAJA} p={[0, 0.33, 0.0]} s={[0.7, 0.025, 0.025]} c="#dc2626" />
      <Letrero p={[0.62, 0, 0.05]} texto="DO NOT CLIMB" detalle={detalle} alto={0.5} />
      {/* Monumentos de piedra */}
      {posDe(l, "monument").map(([x, , z], i) => (
        <group key={i} position={[x, 0, z]}>
          <M geo={CAJA} p={[0, 0.42, 0]} s={[0.26, 0.84, 0.12]} c="#9f978a" flat />
          <M geo={CAJA} p={[0, 0.6, 0.065]} s={[0.14, 0.14, 0.01]} c="#57534e" sombra={false} />
          <M geo={CAJA} p={[0, 0.34, 0.065]} s={[0.16, 0.08, 0.01]} c="#57534e" sombra={false} />
        </group>
      ))}
      {/* Juego de pelota */}
      <group position={[bx, 0, bz]}>
        <M geo={CAJA} p={[0, 0.012, 0]} s={[0.5, 0.02, 1.7]} c="#d8cfae" sombra={false} />
        {[-0.38, 0.38].map((x) => (
          <group key={x}>
            <M geo={CAJA} p={[x, 0.22, 0]} s={[0.24, 0.44, 1.7]} c="#a39881" flat />
            <mesh position={[x * 0.62, 0.36, 0]} rotation={[0, Math.PI / 2, 0]} geometry={TORO} scale={0.08}>
              <meshStandardMaterial color="#78716c" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>
      {/* Centro de visitantes */}
      <group position={[vx, 0, vz]}>
        <M geo={CAJA} p={[0, 0.3, 0]} s={[0.9, 0.6, 0.7]} c="#f5e6c8" />
        <M geo={CONO4} p={[0, 0.82, 0]} s={[0.78, 0.45, 0.66]} r={[0, Math.PI / 4, 0]} c="#a16207" flat />
        <M geo={CAJA} p={[-0.18, 0.22, 0.355]} s={[0.22, 0.42, 0.02]} c="#44403c" sombra={false} />
        <M geo={CAJA} p={[0.2, 0.36, 0.355]} s={[0.24, 0.16, 0.02]} c="#bae6fd" sombra={false} />
      </group>
      {/* Guía con turistas */}
      <group position={[-0.95, 0, 1.25]} rotation={[0, 2.3, 0]} scale={0.48}>
        <Figura ropa="#15803d" gorra="#fef3c7" />
        <M geo={CIL} p={[0.25, 1.0, 0]} s={[0.02, 1.2, 0.02]} c="#44403c" />
        <mesh ref={bandera} position={[0.25, 1.55, 0.12]} geometry={CAJA} scale={[0.02, 0.18, 0.26]}>
          <meshStandardMaterial color="#f97316" />
        </mesh>
      </group>
      {[
        [-0.3, 1.6, "#0ea5e9"],
        [-1.45, 1.8, "#e11d48"],
        [-0.6, 2.05, "#eab308"],
      ].map(([x, z, col], k) => (
        <group key={k} position={[x as number, 0, z as number]} rotation={[0, Math.PI + (k - 1) * 0.3, 0]} scale={0.46}>
          <Figura ropa={col as string} pelo={k === 1 ? "#d8b25a" : "#27272a"} />
        </group>
      ))}
      {posDe(l, "tree").map((t, i) => (
        <Arbol key={i} p={t} s={1.05} c={i % 2 ? "#14532d" : "#166534"} />
      ))}
    </group>
  );
}

function DPlaya({ detalle }: DioramaProps) {
  const l = lugar("playa");
  const olas = useRef<THREE.Group>(null);
  const tortugas = useRef<THREE.Group>(null);
  const banista = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (olas.current)
      olas.current.children.forEach((o, k) => {
        const f = (t * 0.25 + k / 3) % 1;
        o.position.z = 2.45 - f * 1.15;
        o.scale.x = 4.9 * (0.6 + 0.4 * Math.sin(f * Math.PI));
        ((o as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.85 * Math.sin(f * Math.PI);
      });
    if (tortugas.current)
      tortugas.current.children.forEach((c, k) => {
        c.position.x = Math.sin(t * 0.6 + k * 1.7) * 0.35;
        c.rotation.y = Math.cos(t * 0.6 + k * 1.7) > 0 ? Math.PI / 2 : -Math.PI / 2;
      });
    if (banista.current) banista.current.position.y = -0.33 + Math.sin(t * 2) * 0.025;
  });
  const [rx, , rz] = posDe(l, "restaurant")[0]!;
  const [tx, , tz] = posDe(l, "turtlecamp")[0]!;
  const [gx, , gz] = posDe(l, "lifeguard")[0]!;
  return (
    <group>
      <Tablero c="#eed6a2" borde="#a38552" />
      <M geo={CAJA} p={[0, 0.01, 1.95]} s={[5.2, 0.04, 1.3]} c="#0ea5e9" op={0.88} rough={0.1} emis={0.08} sombra={false} />
      <M geo={CAJA} p={[0, 0.0, 1.95]} s={[5.2, 0.02, 1.3]} c="#0369a1" sombra={false} />
      <group ref={olas}>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[0, 0.04, 2]} geometry={CAJA} scale={[4.9, 0.01, 0.05]}>
            <meshStandardMaterial color="#f0f9ff" transparent opacity={0.8} depthWrite={false} />
          </mesh>
        ))}
      </group>
      {posDe(l, "palm").map((p, i) => (
        <Palmera key={i} p={p} rot={i * 1.3} />
      ))}
      {/* Restaurante (palapa) */}
      <group position={[rx, 0, rz]}>
        <M geo={CIL8} p={[0, 0.03, 0]} s={[0.8, 0.06, 0.8]} c="#a16207" />
        {[-0.5, 0.5].map((x) =>
          [-0.5, 0.5].map((z) => <M key={`${x}${z}`} geo={CIL} p={[x, 0.6, z]} s={[0.035, 1.14, 0.035]} c="#78350f" />),
        )}
        <M geo={CONO8} p={[0, 1.42, 0]} s={[0.98, 0.66, 0.98]} c="#c08a3e" flat />
        {[-0.22, 0.25].map((x) => (
          <group key={x} position={[x, 0, 0.1]}>
            <M geo={CIL} p={[0, 0.3, 0]} s={[0.17, 0.03, 0.17]} c="#f8fafc" />
            <M geo={CIL} p={[0, 0.16, 0]} s={[0.025, 0.28, 0.025]} c="#44403c" />
          </group>
        ))}
        <M geo={CAJA} p={[0, 0.95, 0.56]} s={[0.56, 0.16, 0.02]} c="#0e7490" sombra={false} />
        <group position={[0.3, 0.06, -0.25]} scale={0.44}>
          <Figura ropa="#f8fafc" pelo="#111827" />
        </group>
      </group>
      {/* Campamento tortuguero */}
      <group position={[tx, 0, tz]}>
        {[
          [-0.62, -0.45],
          [0, -0.45],
          [0.62, -0.45],
          [-0.62, 0.45],
          [0, 0.45],
          [0.62, 0.45],
        ].map(([x, z], k) => (
          <M key={k} geo={CIL} p={[x!, 0.16, z!]} s={[0.02, 0.32, 0.02]} c="#78350f" />
        ))}
        {[-0.45, 0.45].map((z) => (
          <M key={z} geo={CAJA} p={[0, 0.26, z]} s={[1.24, 0.02, 0.01]} c="#e7e5e4" sombra={false} />
        ))}
        {[-0.62, 0.62].map((x) => (
          <M key={x} geo={CAJA} p={[x, 0.26, 0]} s={[0.01, 0.02, 0.9]} c="#e7e5e4" sombra={false} />
        ))}
        {[
          [-0.35, -0.2],
          [0.05, -0.25],
          [0.4, -0.15],
          [-0.2, 0.2],
          [0.3, 0.22],
        ].map(([x, z], k) => (
          <group key={k} position={[x!, 0, z!]}>
            <M geo={ESFERA} p={[0, 0.02, 0]} s={[0.12, 0.05, 0.12]} c="#e2c48a" sombra={false} />
            <M geo={CIL} p={[0.08, 0.1, 0]} s={[0.008, 0.2, 0.008]} c="#57534e" />
          </group>
        ))}
        <group ref={tortugas} position={[0, 0.04, 0.02]}>
          {[-0.05, 0.08, 0.2].map((z, k) => (
            <group key={k} position={[0, 0, z - 0.08]}>
              <M geo={ESFERA} p={[0, 0, 0]} s={[0.05, 0.02, 0.04]} c="#365314" />
              <M geo={ESFERA} p={[0.05, 0, 0]} s={0.018} c="#4d7c0f" />
            </group>
          ))}
        </group>
        <M geo={CAJA} p={[0, 0.7, -0.25]} s={[1.3, 0.02, 0.5]} c="#0f766e" op={0.9} />
      </group>
      <Letrero p={[tx - 0.1, 0, tz + 0.72]} texto="DON'T TOUCH THE TURTLES" detalle={detalle} alto={0.4} />
      {/* Torre de salvavidas */}
      <group position={[gx, 0, gz]}>
        {[-0.22, 0.22].map((x) =>
          [-0.22, 0.22].map((z) => <M key={`${x}${z}`} geo={CIL} p={[x, 0.55, z]} s={[0.03, 1.1, 0.03]} c="#f8fafc" />),
        )}
        <M geo={CAJA} p={[0, 1.12, 0]} s={[0.62, 0.06, 0.62]} c="#f8fafc" />
        <M geo={CAJA} p={[0, 1.36, -0.05]} s={[0.46, 0.42, 0.42]} c="#fef2f2" />
        <M geo={CAJA} p={[0, 1.6, 0]} s={[0.66, 0.06, 0.66]} c="#dc2626" />
        <M geo={CAJA} p={[0, 0.55, 0.5]} s={[0.26, 0.05, 1.15]} r={[1.1, 0, 0]} c="#e5e7eb" />
        <M geo={CIL} p={[0.28, 1.85, 0.2]} s={[0.012, 0.5, 0.012]} c="#44403c" />
        <M geo={CAJA} p={[0.38, 2.0, 0.2]} s={[0.2, 0.13, 0.01]} c="#ef4444" sombra={false} />
      </group>
      {posDe(l, "umbrella").map(([x, , z], i) => (
        <group key={i} position={[x, 0, z]}>
          <M geo={CIL} p={[0, 0.55, 0]} s={[0.018, 1.1, 0.018]} c="#e5e7eb" />
          <M geo={CONO} p={[0, 1.12, 0]} s={[0.46, 0.24, 0.46]} c={i ? "#22d3ee" : "#f97316"} />
          <M geo={CAJA} p={[0.12, 0.1, 0.32]} s={[0.24, 0.05, 0.56]} r={[-0.12, 0, 0]} c="#f8fafc" />
        </group>
      ))}
      {posDe(l, "kayak").map(([x, , z], i) => (
        <group key={i} position={[x, 0.08, z]} rotation={[0, 0.15, 0]}>
          <M geo={ESFERA} p={[0, 0, 0]} s={[0.13, 0.07, 0.42]} c={["#facc15", "#ef4444", "#f97316"][i]!} rough={0.4} />
          <M geo={CAJA} p={[0, 0.08, 0.05]} s={[0.5, 0.015, 0.035]} r={[0, 0.5, 0]} c="#1f2937" />
        </group>
      ))}
      <group ref={banista}>
        <group position={[-0.7, 0, 2.05]} scale={0.5}>
          <Figura ropa="#8b5cf6" pelo="#1c1917" />
        </group>
      </group>
      <group position={[-2.0, 0.14, 0.72]} rotation={[-Math.PI / 2 + 0.25, 0, 0]} scale={0.45}>
        <Figura ropa="#fb7185" pelo="#78350f" />
      </group>
    </group>
  );
}

const MIR_TOP = 1.6;
const MIR_Z0 = 2.2;
const MIR_Z1 = -0.45;

function DMirador({ detalle }: DioramaProps) {
  const l = lugar("mirador");
  const pasos = 16;
  const largo = Math.hypot(MIR_Z0 - MIR_Z1, MIR_TOP);
  const ang = Math.atan2(MIR_TOP, MIR_Z0 - MIR_Z1);
  const [tx, ty, tz] = posDe(l, "telescope")[0]!;
  const [bx, , bz] = posDe(l, "busstop")[0]!;
  const tubo = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (tubo.current) tubo.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.5;
  });
  return (
    <group>
      <Tablero c="#5b8f3e" />
      {/* Cerro */}
      <M geo={CAJA} p={[0, MIR_TOP / 2, -1.5]} s={[4.6, MIR_TOP, 2.1]} c="#7c6f5a" flat />
      <M geo={CAJA} p={[0, MIR_TOP + 0.02, -1.5]} s={[4.6, 0.04, 2.1]} c="#65a30d" />
      {[
        [-2.2, 0.35, -0.5, 0.5],
        [2.2, 0.45, -0.55, 0.55],
        [-1.6, 0.25, -0.35, 0.35],
        [1.55, 0.2, -0.35, 0.32],
        [-2.3, 1.1, -1.2, 0.45],
        [2.3, 1.0, -1.8, 0.5],
      ].map(([x, y, z, s], k) => (
        <M key={k} geo={DODE} p={[x!, y!, z!]} s={s!} c={k % 2 ? "#6f6452" : "#877a64"} flat />
      ))}
      {/* Escalinata */}
      <M geo={CAJA} p={[0, MIR_TOP / 2 - 0.05, (MIR_Z0 + MIR_Z1) / 2]} s={[1.7, 0.14, largo]} r={[ang, 0, 0]} c="#8b7d67" />
      {Array.from({ length: pasos }, (_, i) => {
        const t = (i + 0.5) / pasos;
        return <M key={i} geo={CAJA} p={[0, t * MIR_TOP + 0.02, MIR_Z0 - t * (MIR_Z0 - MIR_Z1)]} s={[0.82, 0.1, (MIR_Z0 - MIR_Z1) / pasos]} c={i % 2 ? "#d6d3d1" : "#c8c3bd"} />;
      })}
      {posDe(l, "lamp").map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <M geo={CIL} p={[0, 0.42, 0]} s={[0.025, 0.84, 0.025]} c="#27272a" metal={0.5} />
          <mesh position={[0, 0.88, 0]} geometry={ESFERA} scale={0.075}>
            <meshStandardMaterial color="#fef3c7" emissive="#fbbf24" emissiveIntensity={1.1} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* Barandal de la cima */}
      {[-2.2, -1.6, -1.0, -0.5, 0.5, 1.0, 1.6, 2.2].map((x) => (
        <M key={x} geo={CAJA} p={[x, MIR_TOP + 0.2, MIR_Z1 - 0.05]} s={[0.035, 0.36, 0.035]} c="#44403c" />
      ))}
      {[-1.35, 1.35].map((x) => (
        <M key={x} geo={CAJA} p={[x, MIR_TOP + 0.36, MIR_Z1 - 0.05]} s={[1.7, 0.03, 0.03]} c="#44403c" />
      ))}
      {/* Telescopio y bancas */}
      <group position={[tx, ty, tz]}>
        {[0, 1, 2].map((k) => {
          const a = (k / 3) * Math.PI * 2;
          return <M key={k} geo={CIL} p={[Math.sin(a) * 0.09, 0.22, Math.cos(a) * 0.09]} s={[0.014, 0.46, 0.014]} r={[Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35]} c="#27272a" />;
        })}
        <group ref={tubo} position={[0, 0.48, 0]}>
          <M geo={CIL} p={[0, 0, 0.08]} s={[0.055, 0.42, 0.055]} r={[1.25, 0, 0]} c="#1e3a8a" metal={0.5} rough={0.35} />
        </group>
      </group>
      {posDe(l, "bench").map((b, i) => (
        <Banca key={i} p={b} />
      ))}
      <group position={[-0.85, MIR_TOP, -0.95]} scale={0.48}>
        <Figura ropa="#fb7185" pelo="#1c1917" />
      </group>
      <group position={[-1.2, MIR_TOP, -0.9]} scale={0.5}>
        <Figura ropa="#2563eb" pelo="#3f2a1d" />
      </group>
      {/* Parada de autobús al pie del cerro */}
      <group position={[bx, 0, bz]}>
        <M geo={CIL} p={[0, 0.5, 0]} s={[0.025, 1.0, 0.025]} c="#475569" />
        <M geo={CIL} p={[0, 0.98, 0.02]} s={[0.14, 0.02, 0.14]} r={[Math.PI / 2, 0, 0]} c="#2563eb" />
        <M geo={CAJA} p={[0.4, 0.2, 0.05]} s={[0.5, 0.04, 0.18]} c="#64748b" />
      </group>
      <Letrero p={[-1.25, 0, 2.15]} texto="NO CARS · STAIRS ONLY" detalle={detalle} />
    </group>
  );
}

const DIORAMAS: Record<LugarId, (p: DioramaProps) => ReactNode> = {
  plaza: DPlaza,
  mercado: DMercado,
  museo: DMuseo,
  cascada: DCascada,
  ruinas: DRuinas,
  playa: DPlaya,
  mirador: DMirador,
};

/* ════════════════════════════════════════════════════════════════════════
 * 1. DESCRIBE THE PLACE — la maqueta sobre su pedestal
 * ════════════════════════════════════════════════════════════════════════ */

function Marcas({ l, clave, estado, nonce }: { l: Lugar; clave: string; estado: "ok" | "valida" | "mal"; nonce: number }) {
  const obj = l.objetos.find((o) => o.clave === clave);
  const g = useRef<THREE.Group>(null);
  const est = useRef<{ n: number; t: number }>({ n: -1, t: 0 });
  useFrame(({ clock }, dt) => {
    if (est.current.n !== nonce) est.current = { n: nonce, t: 0 };
    est.current.t += Math.min(dt, 0.25);
    const c = g.current;
    if (!c) return;
    const pop = Math.min(1, est.current.t * 3.5);
    c.children.forEach((m, k) => {
      const base = m.userData.base as number;
      if (m.userData.flecha) m.position.y = base + Math.sin(clock.elapsedTime * 4 + k) * 0.08;
      m.scale.setScalar((m.userData.s as number) * (0.3 + 0.7 * pop));
    });
  });
  if (!obj) return null;
  const col = estado === "ok" ? OK : estado === "valida" ? AMBAR : WARN;
  return (
    <group ref={g}>
      {obj.pos.flatMap(([x, y, z], i) => [
        <mesh key={`a${i}`} position={[x, y + 0.03, z]} rotation={[-Math.PI / 2, 0, 0]} geometry={ANILLO} scale={0.34} userData={{ base: y + 0.03, s: 0.34 }}>
          <meshBasicMaterial color={col} transparent opacity={0.9} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>,
        <mesh key={`f${i}`} position={[x, y + obj.alto + 0.28, z]} rotation={[Math.PI, 0, 0]} geometry={CONO} scale={0.1} userData={{ base: y + obj.alto + 0.28, s: 0.1, flecha: true }}>
          <meshBasicMaterial color={col} toneMapped={false} />
        </mesh>,
      ])}
    </group>
  );
}

function EscenaDescribir({ lugarIdx, resalta, resaltaEstado, resaltaNonce, oracion, hechos, errorNonce, modoColor }: Pick<LugaresSceneProps, "lugarIdx" | "resalta" | "resaltaEstado" | "resaltaNonce" | "oracion" | "hechos" | "errorNonce" | "modoColor">) {
  const l = LUGARES[lugarIdx] ?? LUGARES[0]!;
  const D = DIORAMAS[l.id];
  const grupo = useRef<THREE.Group>(null);
  const aro = useRef<THREE.MeshStandardMaterial>(null);
  const aparece = useRef(0);
  const ultimo = useRef(errorNonce);
  const flash = useRef(0);
  useFrame(({ clock }, dt) => {
    aparece.current += (1 - aparece.current) * suave(dt, 0.08);
    const k = aparece.current;
    if (grupo.current) {
      grupo.current.scale.setScalar(0.55 + 0.45 * k);
      grupo.current.position.y = 0.62 + (1 - k) * 1.2;
    }
    if (ultimo.current !== errorNonce) {
      ultimo.current = errorNonce;
      flash.current = 1;
    }
    flash.current = Math.max(0, flash.current - dt * 1.4);
    const a = aro.current;
    if (a) {
      a.color.set(flash.current > 0 ? WARN : modoColor);
      a.emissive.set(flash.current > 0 ? WARN : modoColor);
      a.emissiveIntensity = 0.7 + Math.sin(clock.elapsedTime * 2.5) * 0.2 + flash.current * 1.5;
    }
  });
  const colOracion = resaltaEstado === "ok" ? OK : resaltaEstado === "valida" ? AMBAR : resaltaEstado === "mal" ? WARN : modoColor;
  return (
    <group>
      {/* Pedestal */}
      <M geo={CIL} p={[0, -0.05, 0]} s={[4.3, 0.5, 4.3]} c="#1e293b" rough={0.5} metal={0.3} />
      <mesh position={[0, 0.215, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={ANILLO_FINO} scale={4.25}>
        <meshStandardMaterial ref={aro} color={modoColor} emissive={modoColor} emissiveIntensity={0.7} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <M geo={CIL} p={[0, -0.6, 0]} s={[4.7, 0.6, 4.7]} c="#0f172a" rough={0.6} />
      <group ref={grupo} position={[0, 1.8, 0]} scale={0.55}>
        <D detalle />
        {resalta && resaltaEstado && <Marcas key={`${resalta}-${resaltaNonce}`} l={l} clave={resalta} estado={resaltaEstado} nonce={resaltaNonce} />}
      </group>
      <Html position={[0, 0.25, 4.35]} center distanceFactor={10} zIndexRange={[25, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 14px", borderRadius: 12, background: "rgba(4,10,22,0.9)", border: `1.5px solid ${l.color}`, color: "#fff", whiteSpace: "nowrap" }}>
          <i className={`fa-solid ${l.icono}`} style={{ color: l.color, fontSize: 16 }} />
          <span style={{ fontSize: 15, fontWeight: 900 }}>{l.nombre}</span>
          <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.2)" }} />
          {(["sg", "pl", "can"] as TipoOracion[]).map((t) => (
            <span key={t} style={{ fontSize: 11.5, fontWeight: 800, color: hechos.includes(t) ? OK : "rgba(255,255,255,0.45)" }}>
              <i className={`fa-solid ${hechos.includes(t) ? "fa-circle-check" : "fa-circle"}`} style={{ marginRight: 4, fontSize: 10 }} />
              {t === "sg" ? "There is" : t === "pl" ? "There are" : "You can"}
            </span>
          ))}
        </div>
      </Html>
      {oracion && (
        <Globo pos={[0, 4.35, -1.2]} col={colOracion} df={10} fs={17} ancho={560}>
          <i className={`fa-solid ${resaltaEstado === "ok" ? "fa-circle-check" : resaltaEstado === "valida" ? "fa-circle-info" : resaltaEstado === "mal" ? "fa-circle-xmark" : "fa-pen"}`} style={{ color: colOracion, marginRight: 8 }} />
          {oracion}
        </Globo>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * EL MAPA DEL PUEBLO (vistas 2 y 3)
 * ════════════════════════════════════════════════════════════════════════ */

const ESC = 0.72;
const Y_TAB = 0.35 * ESC;
const START: Pt = [-2.6, 0, 3.35];

const aMapa = (l: Lugar, local: Pt): Pt => [l.mapa[0] + local[0] * ESC, Y_TAB + local[1] * ESC, l.mapa[1] + local[2] * ESC];

/** Punto donde se queda el visitante (coordenadas locales de la maqueta). */
const PARADA: Record<LugarId, Pt> = {
  plaza: [0, 0, 2.0],
  mercado: [0, 0, 1.5],
  museo: [0, 0.3, 0.72],
  cascada: [-1.5, 0, -0.3],
  ruinas: [1.3, 0, 1.0],
  playa: [0.3, 0, 0.3],
  mirador: [0.35, MIR_TOP, -1.0],
};

/** Ruta desde la oficina de turismo hasta la parada de cada lugar. */
function ruta(id: LugarId): Pt[] {
  const l = lugar(id);
  const av = 1.35;
  const pts: Pt[] = [START, [-2.6, 0, av]];
  const loc = (x: number, y: number, z: number) => aMapa(l, [x, y, z]);
  if (id === "plaza" || id === "mercado") pts.push([l.mapa[0], 0, av], loc(0, 0, 2.75));
  if (id === "museo") pts.push([l.mapa[0], 0, av], loc(0, 0, 2.75), loc(0, 0, 2.45), loc(0, 0.3, 1.0));
  if (id === "ruinas") pts.push([-8.9, 0, av], [-8.9, 0, 2.7], loc(2.75, 0, 0.4));
  if (id === "playa") pts.push([3.6, 0, av], [3.6, 0, 4.6], loc(0.55, 0, -2.75));
  if (id === "mirador") pts.push([-7.3, 0, av], [-7.3, 0, -4.4], [l.mapa[0], 0, -4.4], loc(0, 0, 2.75), loc(0, 0, MIR_Z0), loc(0, MIR_TOP, MIR_Z1 - 0.1));
  if (id === "cascada") pts.push([7.4, 0, av], [7.4, 0, -6.6], loc(-2.75, 0, 0), loc(-2.2, 0, -0.2));
  pts.push(aMapa(l, PARADA[id]));
  return pts;
}

const CASAS: [number, number, string, number][] = [
  [-8.0, 2.35, "#fca5a5", 0.7],
  [-6.8, 2.4, "#fde68a", 0.55],
  [-5.6, 2.35, "#a5f3fc", 0.65],
  [-0.6, 2.35, "#c4b5fd", 0.6],
  [0.6, 2.4, "#86efac", 0.7],
  [1.8, 2.35, "#fdba74", 0.55],
  [5.4, 2.4, "#f9a8d4", 0.65],
  [6.6, 2.35, "#fde68a", 0.6],
  [8.6, 2.4, "#bfdbfe", 0.7],
  [9.8, 2.35, "#fca5a5", 0.55],
  [-5.8, 4.6, "#fde68a", 0.6],
  [-7.0, 4.6, "#bbf7d0", 0.55],
  [7.0, 4.4, "#c4b5fd", 0.6],
  [8.4, 4.5, "#fdba74", 0.65],
];

const MONTES: [number, number, number, number][] = (() => {
  const r = mulberry32(33);
  const xs: [number, number, number, number][] = [];
  for (let k = 0; k < 13; k++) xs.push([-13.5 + k * 2.25 + (r() - 0.5) * 0.8, -10.3 - r() * 0.6, 1.3 + r() * 1.0, 1.8 + r() * 2.2]);
  return xs;
})();

const SELVA: Pt[] = (() => {
  const r = mulberry32(8);
  const xs: Pt[] = [];
  for (let k = 0; k < 16; k++) {
    const x = -13.6 + r() * 5.0;
    const z = -3.2 + r() * 10.5;
    if (Math.abs(x + 11.2) < 2.3 && Math.abs(z - 2.4) < 2.3) continue;
    if (Math.abs(z - 1.35) < 0.6) continue;
    xs.push([x, 0, z]);
  }
  return xs;
})();

function Calle({ a, b, w = 0.62, c = "#9c8b72" }: { a: [number, number]; b: [number, number]; w?: number; c?: string }) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return <M geo={CAJA} p={[(a[0] + b[0]) / 2, 0.012, (a[1] + b[1]) / 2]} s={[w, 0.024, len + w]} r={[0, Math.atan2(b[0] - a[0], b[1] - a[1]), 0]} c={c} sombra={false} />;
}

function Mapa({ tocar, marcado, marcadoCol, resueltos, dfPin = 16, sinPin = null }: { tocar?: (id: LugarId) => void; marcado: LugarId | null; marcadoCol: string; resueltos: LugarId[]; dfPin?: number; sinPin?: LugarId | null }) {
  const mar = useRef<THREE.MeshStandardMaterial>(null);
  const aro = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (mar.current) mar.current.emissiveIntensity = 0.12 + Math.sin(clock.elapsedTime * 0.8) * 0.05;
    if (aro.current) (aro.current.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(clock.elapsedTime * 4) * 0.3;
  });
  const rio: [number, number][] = [
    [11.6, -4.73],
    [12.3, -2.2],
    [12.45, 3.2],
    [12.8, 9.2],
  ];
  const lm = marcado ? lugar(marcado) : null;
  return (
    <group>
      <M geo={CAJA} p={[0, -0.3, -1.15]} s={[29.5, 0.6, 19.7]} c="#5d8f45" rough={1} />
      <mesh position={[0, -0.12, 9.85]} geometry={CAJA} scale={[29.5, 0.24, 2.3]} receiveShadow>
        <meshStandardMaterial ref={mar} color="#0284c7" emissive="#0ea5e9" emissiveIntensity={0.12} roughness={0.15} />
      </mesh>
      <M geo={CAJA} p={[0, -0.02, 8.45]} s={[29.5, 0.04, 0.6]} c="#eed6a2" sombra={false} />
      {MONTES.map(([x, z, r, h], k) => (
        <M key={k} geo={CONO8} p={[x, h / 2 - 0.05, z]} s={[r, h, r]} c={k % 2 ? "#56704a" : "#4a6340"} flat />
      ))}
      <M geo={CONO8} p={[10.2, 2.3, -9.4]} s={[2.6, 4.8, 1.6]} c="#6b7a5c" flat />
      <M geo={CONO8} p={[-9.6, 1.6, -9.3]} s={[2.4, 3.4, 1.4]} c="#58704b" flat />
      {rio.slice(0, -1).map(([x0, z0], k) => {
        const [x1, z1] = rio[k + 1]!;
        return <Calle key={k} a={[x0, z0]} b={[x1, z1]} w={0.5} c="#38bdf8" />;
      })}
      {/* Calles */}
      <Calle a={[-9.1, 1.35]} b={[11.2, 1.35]} w={0.7} c="#8a8173" />
      <Calle a={[3.6, 1.35]} b={[3.6, 4.7]} />
      <Calle a={[-7.3, 1.35]} b={[-7.3, -4.4]} />
      <Calle a={[-7.3, -4.4]} b={[-9.6, -4.4]} />
      <Calle a={[7.4, 1.35]} b={[7.4, -6.6]} />
      <Calle a={[7.4, -6.6]} b={[8.3, -6.6]} />
      <Calle a={[-8.9, 1.35]} b={[-8.9, 2.7]} />
      <Calle a={[-8.9, 2.7]} b={[-9.3, 2.7]} />
      <Calle a={[-2.6, 1.35]} b={[-2.6, 3.4]} />
      {[0, 4.7, -4.7].map((x) => (
        <Calle key={x} a={[x, 0.45]} b={[x, 1.35]} w={0.5} />
      ))}
      <M geo={CAJA} p={[-2.6, 0.02, 3.55]} s={[3.2, 0.03, 1.3]} c="#d6d3d1" sombra={false} />
      {/* Oficina de turismo */}
      <group position={[-4.75, 0, 3.35]}>
        <M geo={CAJA} p={[0, 0.35, 0]} s={[0.9, 0.7, 0.6]} c="#0e7490" />
        <M geo={CAJA} p={[0, 0.9, 0]} s={[1.1, 0.08, 0.8]} c="#f8fafc" />
        <M geo={CAJA} p={[0, 0.5, 0.31]} s={[0.6, 0.2, 0.02]} c="#fde68a" sombra={false} />
        <group position={[0, 0, -0.45]} scale={0.5}>
          <Figura ropa="#0ea5e9" pelo="#111827" />
        </group>
      </group>
      <Etiqueta pos={[-4.75, 1.2, 3.75]} df={14} fs={11} col="#22d3eeaa">
        <i className="fa-solid fa-circle-info" style={{ color: "#22d3ee" }} />
        Tourist Info
      </Etiqueta>
      {CASAS.map(([x, z, c, s], k) => (
        <group key={k} position={[x, 0, z]}>
          <M geo={CAJA} p={[0, s / 2, 0]} s={[0.9, s, 0.8]} c={c} />
          <M geo={CAJA} p={[0, s + 0.03, 0]} s={[0.96, 0.06, 0.86]} c="#b45309" />
          <M geo={CAJA} p={[0, 0.16, 0.405]} s={[0.18, 0.32, 0.01]} c="#44403c" sombra={false} />
        </group>
      ))}
      {SELVA.map((p, k) => (
        <Arbol key={k} p={p} s={0.8} c={k % 2 ? "#166534" : "#15803d"} />
      ))}
      {[-12, -9, -6, -3, 0.2, 7, 9.5].map((x, k) => (
        <Palmera key={k} p={[x, 0, 8.2]} rot={k} />
      ))}
      {/* Las siete maquetas */}
      {LUGARES.map((l) => {
        const D = DIORAMAS[l.id];
        const alto = l.id === "cascada" ? 3.3 : l.id === "mirador" ? 2.7 : l.id === "museo" ? 2.6 : 2.25;
        const hecho = resueltos.includes(l.id);
        return (
          <group key={l.id}>
            <group position={[l.mapa[0], Y_TAB, l.mapa[1]]} scale={ESC}>
              <D detalle={false} />
            </group>
            <mesh
              position={[l.mapa[0], 1.2, l.mapa[1]]}
              geometry={CAJA}
              scale={[5.2 * ESC, 2.6, 5.2 * ESC]}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                tocar?.(l.id);
              }}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                if (tocar) document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "";
              }}
            >
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            {sinPin !== l.id && (
              <Etiqueta pos={[l.mapa[0], alto, l.mapa[1] - 0.4]} df={dfPin} fs={12} col={`${hecho ? OK : l.color}aa`}>
                <i className={`fa-solid ${hecho ? "fa-circle-check" : l.icono}`} style={{ color: hecho ? OK : l.color }} />
                {l.nombre}
              </Etiqueta>
            )}
          </group>
        );
      })}
      {lm && (
        <mesh ref={aro} position={[lm.mapa[0], 0.05, lm.mapa[1]]} rotation={[-Math.PI / 2, 0, 0]} geometry={ANILLO} scale={2.75}>
          <meshBasicMaterial color={marcadoCol} transparent opacity={0.8} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

type Accesorio = "silla" | "ninos" | "mochila" | "pareja" | "libro" | "toalla" | "sombrero" | "camara" | "baston" | "tabla" | "nino" | "bolsa" | "gorra";

/** Persona con su accesorio (silla de ruedas, niños, mochila…). Mira hacia +z. */
function Persona({ ropa, pelo = "#2b1b12", acc }: { ropa: string; pelo?: string; acc: Accesorio }) {
  if (acc === "silla")
    return (
      <group>
        <M geo={CAJA} p={[0, 0.42, 0]} s={[0.42, 0.05, 0.4]} c="#334155" />
        <M geo={CAJA} p={[0, 0.66, -0.2]} s={[0.42, 0.45, 0.05]} c="#334155" />
        {[-0.24, 0.24].map((x) => (
          <mesh key={x} position={[x, 0.3, -0.02]} rotation={[0, Math.PI / 2, 0]} geometry={TORO} scale={0.27} castShadow>
            <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
        {[-0.16, 0.16].map((x) => (
          <M key={`r${x}`} geo={CIL} p={[x, 0.06, 0.22]} s={[0.05, 0.03, 0.05]} r={[0, 0, Math.PI / 2]} c="#1f2937" />
        ))}
        <group position={[0, 0.2, 0.02]}>
          <M geo={CAJA} p={[0, 0.27, 0.2]} s={[0.26, 0.1, 0.36]} c="#1f2937" />
          <mesh position={[0, 0.66, -0.02]} castShadow>
            <capsuleGeometry args={[0.16, 0.28, 6, 14]} />
            <meshStandardMaterial color={ropa} roughness={0.6} />
          </mesh>
          <M geo={ESFERA} p={[0, 1.06, 0]} s={0.14} c="#c68a5a" />
          <M geo={ESFERA} p={[0, 1.1, -0.025]} s={[0.148, 0.14, 0.148]} c="#d4d4d8" />
        </group>
      </group>
    );
  return (
    <group>
      <Figura ropa={ropa} pelo={pelo} gorra={acc === "gorra" ? "#166534" : undefined} sombrero={acc === "sombrero"} />
      {acc === "mochila" && <M geo={CAJA} p={[0, 0.62, -0.2]} s={[0.28, 0.36, 0.14]} c="#b45309" />}
      {acc === "libro" && <M geo={CAJA} p={[0.14, 0.62, 0.17]} s={[0.18, 0.24, 0.05]} c="#1d4ed8" />}
      {acc === "camara" && (
        <>
          <M geo={CAJA} p={[0, 0.78, 0.2]} s={[0.2, 0.12, 0.08]} c="#111827" />
          <M geo={CIL} p={[0, 0.78, 0.26]} s={[0.04, 0.06, 0.04]} r={[Math.PI / 2, 0, 0]} c="#374151" />
        </>
      )}
      {acc === "toalla" && <M geo={CAJA} p={[0.15, 0.85, 0]} s={[0.1, 0.3, 0.26]} c="#22d3ee" />}
      {acc === "baston" && <M geo={CIL} p={[0.26, 0.4, 0.08]} s={[0.018, 0.8, 0.018]} c="#78350f" />}
      {acc === "tabla" && <M geo={CAJA} p={[0.3, 0.62, -0.05]} s={[0.05, 1.2, 0.3]} c="#f97316" rough={0.4} />}
      {acc === "bolsa" && <M geo={CAJA} p={[-0.22, 0.45, 0.02]} s={[0.1, 0.24, 0.24]} c="#a16207" />}
      {(acc === "ninos" || acc === "nino") &&
        (acc === "ninos" ? [-0.38, 0.38] : [0.38]).map((x, k) => (
          <group key={x} position={[x, 0, 0.05]} scale={0.6}>
            <Figura ropa={k ? "#facc15" : "#22c55e"} pelo={pelo} />
          </group>
        ))}
      {acc === "pareja" && (
        <group position={[0.42, 0, 0]}>
          <Figura ropa="#1d4ed8" pelo="#111827" />
        </group>
      )}
    </group>
  );
}

/** Visitante que camina por la ruta y, al llegar, dice su reacción. */
function Viajero({ id, ropa, pelo, acc, texto, col, icono, salta, df = 11 }: { id: LugarId; ropa: string; pelo?: string; acc: Accesorio; texto: string; col: string; icono: string; salta: boolean; df?: number }) {
  const pts = useMemo(() => ruta(id), [id]);
  const acum = useMemo(() => {
    const xs = [0];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]!;
      const b = pts[i]!;
      xs.push(xs[i - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
    }
    return xs;
  }, [pts]);
  const g = useRef<THREE.Group>(null);
  const d = useRef(0);
  const llegadoRef = useRef(false);
  const [llegado, setLlegado] = useState(false);
  useFrame(({ clock }, dt) => {
    const total = acum[acum.length - 1]!;
    d.current = Math.min(total, d.current + Math.min(dt, 0.1) * 4.2);
    let i = 1;
    while (i < acum.length - 1 && acum[i]! < d.current) i++;
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const seg = acum[i]! - acum[i - 1]!;
    const f = seg > 0 ? (d.current - acum[i - 1]!) / seg : 1;
    const c = g.current;
    if (c) {
      const t = clock.elapsedTime;
      const fin = d.current >= total;
      c.position.set(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f + (fin ? (salta ? Math.abs(Math.sin(t * 5)) * 0.18 : 0) : Math.abs(Math.sin(t * 12)) * 0.05), a[2] + (b[2] - a[2]) * f);
      const objetivo = fin ? 0 : Math.atan2(b[0] - a[0], b[2] - a[2]);
      let delta = objetivo - c.rotation.y;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      c.rotation.y += delta * suave(dt, 0.15);
      if (fin && !llegadoRef.current) {
        llegadoRef.current = true;
        setLlegado(true);
      }
    }
  });
  return (
    <group ref={g} position={START}>
      <group scale={0.62}>
        <Persona ropa={ropa} pelo={pelo} acc={acc} />
      </group>
      {llegado && (
        <Globo pos={[0, 1.45, 0]} col={col} df={df} fs={13} ancho={280}>
          <i className={`fa-solid ${icono}`} style={{ color: col, marginRight: 7 }} />
          {texto}
        </Globo>
      )}
    </group>
  );
}

function Fila({ personas }: { personas: { key: string; ropa: string; pelo?: string; acc: Accesorio }[] }) {
  return (
    <group>
      {personas.map((p, k) => (
        <group key={p.key} position={[-1.55 + k * 0.72, 0, 3.75]} rotation={[0, -0.25, 0]} scale={0.55}>
          <Persona ropa={p.ropa} pelo={p.pelo} acc={p.acc} />
        </group>
      ))}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. GUIDEBOOK
 * ════════════════════════════════════════════════════════════════════════ */

function EscenaGuia({ visitaIdx, guiaElegido, guiaOk, guiaResueltos, guiaTab, viajeNonce, onTocarLugar, modoColor }: Pick<LugaresSceneProps, "visitaIdx" | "guiaElegido" | "guiaOk" | "guiaResueltos" | "guiaTab" | "viajeNonce" | "onTocarLugar" | "modoColor">) {
  const v = VISITANTES_GUIA[visitaIdx] ?? VISITANTES_GUIA[0]!;
  const resueltos = Object.values(guiaResueltos).filter((x): x is LugarId => !!x);
  const fila = VISITANTES_GUIA.filter((x, i) => i !== visitaIdx && !guiaResueltos[x.id]).map((x) => ({ key: x.id, ropa: x.ropa, acc: x.accesorio }));
  const col = guiaOk === null ? modoColor : guiaOk ? OK : WARN;
  return (
    <group>
      <Mapa tocar={onTocarLugar} marcado={guiaElegido ?? guiaTab} marcadoCol={guiaElegido ? col : `${modoColor}`} resueltos={resueltos} />
      {VISITANTES_GUIA.map((x, i) => {
        const dest = guiaResueltos[x.id];
        if (!dest || i === visitaIdx) return null;
        return (
          <group key={x.id} position={aMapa(lugar(dest), PARADA[dest])} scale={0.62}>
            <Persona ropa={x.ropa} acc={x.accesorio} />
          </group>
        );
      })}
      <Fila personas={fila} />
      {guiaElegido ? (
        <Viajero
          key={`${v.id}-${guiaElegido}-${viajeNonce}`}
          id={guiaElegido}
          ropa={v.ropa}
          acc={v.accesorio}
          texto={guiaOk ? "This is perfect for me. Thank you!" : "Hmm… this place isn't right for me."}
          col={col}
          icono={guiaOk ? "fa-face-smile" : "fa-face-frown"}
          salta={!!guiaOk}
          df={17}
        />
      ) : (
        <group position={START}>
          <group scale={0.62}>
            <Persona ropa={v.ropa} acc={v.accesorio} />
          </group>
          <Globo pos={[0, 1.55, 0]} col={modoColor} df={11} fs={13} ancho={300}>
            <span style={{ color: modoColor }}>{v.nombre}:</span> «{v.pide}»
          </Globo>
        </group>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. RECOMMEND IT
 * ════════════════════════════════════════════════════════════════════════ */

function CamaraGuiada({ pos, target, clave }: { pos: Pt; target: Pt; clave: string }) {
  const est = useRef<{ clave: string; t: number } | null>(null);
  useFrame((state, dt) => {
    const { camera } = state;
    const controls = state.controls as unknown as { target?: THREE.Vector3; update?: () => void } | null;
    if (!est.current || est.current.clave !== clave) est.current = { clave, t: 0 };
    const e = est.current;
    if (e.t > 3.2) return;
    e.t += Math.min(dt, 0.25);
    const k = suave(dt, 0.045);
    camera.position.x += (pos[0] - camera.position.x) * k;
    camera.position.y += (pos[1] - camera.position.y) * k;
    camera.position.z += (pos[2] - camera.position.z) * k;
    if (controls?.target) {
      controls.target.x += (target[0] - controls.target.x) * k;
      controls.target.y += (target[1] - controls.target.y) * k;
      controls.target.z += (target[2] - controls.target.z) * k;
      controls.update?.();
    } else camera.lookAt(target[0], target[1], target[2]);
  });
  return null;
}

function EscenaRecomendar({ turistaIdx, destino, reaccion, lineaReaccion, felices, viajeNonce, modoColor }: Pick<LugaresSceneProps, "turistaIdx" | "destino" | "reaccion" | "lineaReaccion" | "felices" | "viajeNonce" | "modoColor">) {
  const t = TURISTAS[turistaIdx] ?? TURISTAS[0]!;
  const resueltos = Object.values(felices).filter((x): x is LugarId => !!x);
  const fila = TURISTAS.filter((x, i) => i !== turistaIdx && !felices[x.id]).map((x) => ({ key: x.id, ropa: x.ropa, pelo: x.pelo, acc: x.accesorio as Accesorio }));
  const col = reaccion === "feliz" ? OK : reaccion === "meh" ? AMBAR : reaccion === "triste" ? WARN : modoColor;
  const cam = useMemo((): { pos: Pt; target: Pt; clave: string } => {
    if (!destino) return { pos: [-1.6, 6.2, 11.2], target: [-2.0, 0.9, 2.6], clave: `base-${turistaIdx}` };
    const l = lugar(destino);
    const alto = destino === "mirador" || destino === "cascada" ? 1.4 : 0.6;
    return { pos: [l.mapa[0] + 0.8, 8.4 + alto, l.mapa[1] + 9.4], target: [l.mapa[0], alto, l.mapa[1]], clave: `${destino}-${turistaIdx}-${viajeNonce}` };
  }, [destino, turistaIdx, viajeNonce]);
  return (
    <group>
      <CamaraGuiada pos={cam.pos} target={cam.target} clave={cam.clave} />
      <Mapa marcado={destino} marcadoCol={col} resueltos={resueltos} dfPin={10} sinPin={destino} />
      {TURISTAS.map((x, i) => {
        const dest = felices[x.id];
        if (!dest || i === turistaIdx) return null;
        return (
          <group key={x.id} position={aMapa(lugar(dest), PARADA[dest])} scale={0.62}>
            <Persona ropa={x.ropa} pelo={x.pelo} acc={x.accesorio as Accesorio} />
          </group>
        );
      })}
      <Fila personas={fila} />
      {destino && reaccion ? (
        <Viajero
          key={`${t.id}-${destino}-${viajeNonce}`}
          id={destino}
          ropa={t.ropa}
          pelo={t.pelo}
          acc={t.accesorio as Accesorio}
          texto={lineaReaccion}
          col={col}
          icono={reaccion === "feliz" ? "fa-face-grin-stars" : reaccion === "meh" ? "fa-face-meh" : "fa-face-frown"}
          salta={reaccion === "feliz"}
          df={8}
        />
      ) : (
        <group position={START}>
          <group scale={0.62}>
            <Persona ropa={t.ropa} pelo={t.pelo} acc={t.accesorio as Accesorio} />
          </group>
          <Globo pos={[0, 1.55, 0]} col={modoColor} df={9} fs={13} ancho={300}>
            <span style={{ color: modoColor }}>{t.nombre}:</span> «{t.dice}»
          </Globo>
        </group>
      )}
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function LugaresRecomendacionesInglesScene(p: LugaresSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt; fondo: string } => {
    if (vista === "describir") return { pos: [0, 8.9, 8.2], target: [0, 0.9, -0.1], fondo: "#0b1a2c" };
    if (vista === "guia") return { pos: [0, 19.5, 17.5], target: [0, 0, -0.2], fondo: "#0a1a2e" };
    return { pos: [-1.6, 6.2, 11.2], target: [-2.0, 0.9, 2.6], fondo: "#0c1628" };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={[cam.fondo]} />
      <fog attach="fog" args={[cam.fondo, 34, 70]} />
      <hemisphereLight args={["#e0f2fe", "#3f3a2a", 0.55]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[7, 16, 10]} intensity={1.45} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-17} shadow-camera-right={17} shadow-camera-top={14} shadow-camera-bottom={-14} shadow-bias={-0.0004} />
      <pointLight position={[-8, 5, 7]} intensity={0.5} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.3} position={[0, 6, -8]} scale={[14, 6, 1]} color="#bae6fd" />
        <Lightformer form="rect" intensity={0.6} position={[-8, 2, 5]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "describir" && (
        <EscenaDescribir
          lugarIdx={p.lugarIdx}
          resalta={p.resalta}
          resaltaEstado={p.resaltaEstado}
          resaltaNonce={p.resaltaNonce}
          oracion={p.oracion}
          hechos={p.hechos}
          errorNonce={p.errorNonce}
          modoColor={modoColor}
        />
      )}
      {vista === "guia" && (
        <EscenaGuia
          visitaIdx={p.visitaIdx}
          guiaElegido={p.guiaElegido}
          guiaOk={p.guiaOk}
          guiaResueltos={p.guiaResueltos}
          guiaTab={p.guiaTab}
          viajeNonce={p.viajeNonce}
          onTocarLugar={p.onTocarLugar}
          modoColor={modoColor}
        />
      )}
      {vista === "recomendar" && (
        <EscenaRecomendar turistaIdx={p.turistaIdx} destino={p.destino} reaccion={p.reaccion} lineaReaccion={p.lineaReaccion} felices={p.felices} viajeNonce={p.viajeNonce} modoColor={modoColor} />
      )}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={4}
        maxDistance={38}
        maxPolarAngle={Math.PI * 0.44}
        minPolarAngle={Math.PI * 0.08}
        minAzimuthAngle={-Math.PI * 0.4}
        maxAzimuthAngle={Math.PI * 0.4}
        target={cam.target}
      />
      <EffectComposer>
        <Bloom intensity={0.25} luminanceThreshold={0.75} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.5} />
      </EffectComposer>
    </Canvas>
  );
}
