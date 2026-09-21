"use client";

/**
 * Escena 3D del laboratorio "Where and when?" (IN-I-P05).
 *
 * Una terminal de autobuses ficticia vista en corte (sin techo): a la
 * izquierda taquillas, cajero, farmacia y objetos perdidos; a la derecha
 * cafetería, baños, lockers y salida a taxis; al centro la sala de espera y el
 * módulo de información; al fondo, tras la pared de cristal, 6 andenes con sus
 * autobuses y dos tableros (DEPARTURES y ARRIVALS) que se dibujan en un
 * CanvasTexture y cambian con el reloj del laboratorio.
 *
 *  - preguntar: Lucy pregunta en el módulo; si obtiene un lugar, camina hasta él.
 *  - tablero: cámara frente a los tableros; los autobuses llegan, abordan y se van.
 *  - informacion: plano desde arriba; los visitantes llegan al módulo y, cuando
 *    les respondes bien, caminan a donde les dijiste.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei: el texto va en <Html> o en la textura del tablero.
 */

import * as THREE from "three";
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type LugarId,
  type Lugar,
  type DestId,
  type OrigenId,
  type FilaTablero,
  LUGARES,
  SALIDAS,
  LLEGADAS,
  GATES_X,
  estadoSalida,
  filasSalidas,
  filasLlegadas,
  fmtHora,
} from "./terminal-horarios-ingles-data";

export interface PersonajeEscena {
  nombre: string;
  color: string;
  puntos: [number, number][];
  animKey: number;
  burbuja: string | null;
  /** Ángulo final cuando está quieto en un solo punto. */
  mira?: number;
  maleta?: boolean;
}

export interface TerminalSceneProps {
  vista: Modo;
  modoColor: string;
  resetNonce: number;
  t: number;
  visitante: PersonajeEscena;
  empleada: { nombre: string; burbuja: string | null };
  foco: { lugar: LugarId; ok: boolean } | null;
  filaSalida: { id: DestId; ok: boolean } | null;
  filaLlegada: { id: OrigenId; ok: boolean } | null;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const NO = "#fb923c";
const Z_FONDO = -7;
const Z_FRENTE = 8;
const X_LADO = 12;

/* ── Etiquetas y burbujas (tamaño fijo en pantalla) ───────────────────── */

function Etiqueta({ pos, children, col, fs = 11, z = 20 }: { pos: Pt; children: ReactNode; col?: string; fs?: number; z?: number }) {
  return (
    <Html position={pos} center eps={-1} zIndexRange={[z, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 9px",
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

function Burbuja({ pos, texto, col = "#0f172a", fondo = "#fff", ancho = 240 }: { pos: Pt; texto: string; col?: string; fondo?: string; ancho?: number }) {
  return (
    <Html position={pos} center eps={-1} zIndexRange={[40, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            maxWidth: ancho,
            width: "max-content",
            padding: "7px 12px",
            borderRadius: 12,
            background: fondo,
            color: col,
            fontSize: 12.5,
            fontWeight: 800,
            lineHeight: 1.35,
            textAlign: "center",
            boxShadow: "0 8px 22px -8px #000",
          }}
        >
          {texto}
        </div>
        <div style={{ width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: `8px solid ${fondo}` }} />
      </div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * EDIFICIO
 * ════════════════════════════════════════════════════════════════════════ */

const LOSETAS: { x: number; z: number }[] = (() => {
  const out: { x: number; z: number }[] = [];
  for (let i = 0; i < 12; i++)
    for (let j = 0; j < 7; j++) {
      if ((i + j) % 2 === 0) out.push({ x: -11 + i * 2, z: -6 + j * 2 });
    }
  return out;
})();

function Losetas() {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    LOSETAS.forEach((l, i) => {
      o.position.set(l.x, 0.006, l.z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, LOSETAS.length]} receiveShadow>
      <boxGeometry args={[2, 0.012, 2]} />
      <meshStandardMaterial color="#cfc6b4" roughness={0.35} metalness={0.05} />
    </instancedMesh>
  );
}

function Edificio() {
  const largoLado = Z_FRENTE - Z_FONDO;
  const zMedio = (Z_FRENTE + Z_FONDO) / 2;
  return (
    <group>
      {/* Suelo exterior */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[80, 0.1, 80]} />
        <meshStandardMaterial color="#1b2430" roughness={1} />
      </mesh>
      {/* Piso de la sala */}
      <mesh position={[0, 0, zMedio]} receiveShadow>
        <boxGeometry args={[X_LADO * 2, 0.02, largoLado]} />
        <meshStandardMaterial color="#e6dfd0" roughness={0.4} />
      </mesh>
      <Losetas />
      {/* Muros laterales */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (X_LADO + 0.1), 1.6, zMedio]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 3.2, largoLado]} />
          <meshStandardMaterial color="#efe7d6" roughness={0.85} />
        </mesh>
      ))}
      {/* Pared de cristal del fondo (andenes) */}
      <mesh position={[0, 1.6, Z_FONDO]}>
        <boxGeometry args={[X_LADO * 2, 3.2, 0.06]} />
        <meshStandardMaterial color="#a5d8ff" transparent opacity={0.16} roughness={0.05} metalness={0.2} depthWrite={false} />
      </mesh>
      {[-12, ...Array.from({ length: 12 }, (_, k) => -11 + k * 2), 12].map((x) => (
        <mesh key={x} position={[x, 1.6, Z_FONDO]} castShadow>
          <boxGeometry args={[0.1, 3.2, 0.14]} />
          <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 3.28, Z_FONDO]} castShadow>
        <boxGeometry args={[X_LADO * 2, 0.16, 0.3]} />
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Frente (en corte): antepecho bajo de cristal con la entrada al centro */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * (X_LADO + 1.8) / 2, 0.55, Z_FRENTE]}>
            <boxGeometry args={[X_LADO - 1.8, 1.1, 0.05]} />
            <meshStandardMaterial color="#a5d8ff" transparent opacity={0.14} roughness={0.05} depthWrite={false} />
          </mesh>
          <mesh position={[s * 1.8, 0.6, Z_FRENTE]} castShadow>
            <boxGeometry args={[0.16, 1.2, 0.18]} />
            <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[s * (X_LADO + 1.8) / 2, 0.06, Z_FRENTE]}>
            <boxGeometry args={[X_LADO - 1.8, 0.12, 0.2]} />
            <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* Tapete de la entrada */}
      <mesh position={[0, 0.02, Z_FRENTE - 0.9]} receiveShadow>
        <boxGeometry args={[3.4, 0.02, 1.4]} />
        <meshStandardMaterial color="#334155" roughness={1} />
      </mesh>
      {/* Columnas */}
      {[-5.9, 5.9].flatMap((x) => [-4.3, 2.6].map((z) => [x, z] as const)).map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 1.8, z]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.2, 3.6, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
      ))}
      {/* Andenes exteriores con techumbre */}
      <mesh position={[0, 0.01, -12.5]} receiveShadow>
        <boxGeometry args={[X_LADO * 2 + 2, 0.02, 11]} />
        <meshStandardMaterial color="#2b3440" roughness={0.95} />
      </mesh>
      {GATES_X.map((gx) => (
        <group key={gx}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[gx + s * 1.05, 0.025, -11]} receiveShadow>
              <boxGeometry args={[0.08, 0.02, 7]} />
              <meshStandardMaterial color="#e5e7eb" roughness={0.8} />
            </mesh>
          ))}
          <mesh position={[gx, 0.03, -7.6]}>
            <boxGeometry args={[1.8, 0.02, 0.18]} />
            <meshStandardMaterial color="#facc15" roughness={0.8} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 3.4, -8.9]} castShadow receiveShadow>
        <boxGeometry args={[X_LADO * 2 + 1, 0.12, 3.6]} />
        <meshStandardMaterial color="#64748b" metalness={0.3} roughness={0.6} />
      </mesh>
      {[-12, -4, 4, 12].map((x) => (
        <mesh key={x} position={[x, 1.7, -10.5]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 3.4, 10]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Sala de espera: bancas y gente sentada ──────────────────────────── */

const ASIENTOS: { x: number; z: number }[] = (() => {
  const out: { x: number; z: number }[] = [];
  for (const z of [-3.3, -2.0, -0.7, 0.6])
    for (const s of [-1, 1])
      for (let k = 0; k < 7; k++) out.push({ x: s * (0.95 + k * 0.62), z });
  return out;
})();

const SENTADOS: { x: number; z: number; color: string }[] = [
  { x: -1.57, z: -3.3, color: "#ef4444" },
  { x: -3.43, z: -2.0, color: "#22c55e" },
  { x: 2.19, z: -2.0, color: "#6366f1" },
  { x: 4.67, z: -3.3, color: "#f59e0b" },
  { x: -4.67, z: -0.7, color: "#0ea5e9" },
  { x: 1.57, z: 0.6, color: "#ec4899" },
  { x: 3.43, z: -0.7, color: "#14b8a6" },
  { x: -2.19, z: 0.6, color: "#a855f7" },
];

function SalaEspera() {
  const asientos = useRef<THREE.InstancedMesh>(null);
  const respaldos = useRef<THREE.InstancedMesh>(null);
  const torsos = useRef<THREE.InstancedMesh>(null);
  const cabezas = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    ASIENTOS.forEach((a, i) => {
      o.position.set(a.x, 0.46, a.z);
      o.updateMatrix();
      asientos.current?.setMatrixAt(i, o.matrix);
      o.position.set(a.x, 0.78, a.z + 0.24);
      o.updateMatrix();
      respaldos.current?.setMatrixAt(i, o.matrix);
    });
    SENTADOS.forEach((p, i) => {
      o.position.set(p.x, 0.86, p.z + 0.06);
      o.updateMatrix();
      torsos.current?.setMatrixAt(i, o.matrix);
      torsos.current?.setColorAt(i, c.set(p.color));
      o.position.set(p.x, 1.26, p.z + 0.02);
      o.updateMatrix();
      cabezas.current?.setMatrixAt(i, o.matrix);
    });
    [asientos, respaldos, torsos, cabezas].forEach((r) => {
      if (r.current) {
        r.current.instanceMatrix.needsUpdate = true;
        if (r.current.instanceColor) r.current.instanceColor.needsUpdate = true;
      }
    });
  }, []);
  return (
    <group>
      <instancedMesh ref={asientos} args={[undefined, undefined, ASIENTOS.length]} castShadow receiveShadow>
        <boxGeometry args={[0.54, 0.07, 0.48]} />
        <meshStandardMaterial color="#1e40af" roughness={0.45} />
      </instancedMesh>
      <instancedMesh ref={respaldos} args={[undefined, undefined, ASIENTOS.length]} castShadow>
        <boxGeometry args={[0.54, 0.56, 0.06]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.45} />
      </instancedMesh>
      {[-3.3, -2.0, -0.7, 0.6].flatMap((z) =>
        [-1, 1].map((s) => (
          <mesh key={`${z}-${s}`} position={[s * 2.81, 0.21, z]} castShadow>
            <boxGeometry args={[4.3, 0.42, 0.1]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.35} />
          </mesh>
        )),
      )}
      <instancedMesh ref={torsos} args={[undefined, undefined, SENTADOS.length]} castShadow>
        <capsuleGeometry args={[0.15, 0.3, 4, 10]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={cabezas} args={[undefined, undefined, SENTADOS.length]} castShadow>
        <sphereGeometry args={[0.12, 14, 10]} />
        <meshStandardMaterial color="#c68b5e" roughness={0.6} />
      </instancedMesh>
    </group>
  );
}

/* ── Locales ─────────────────────────────────────────────────────────── */

function Caja({ p, s, color, e = 0, r = 0.6, m = 0, sombra = true }: { p: Pt; s: Pt; color: string; e?: number; r?: number; m?: number; sombra?: boolean }) {
  return (
    <mesh position={p} castShadow={sombra} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={color} emissive={e ? color : "#000000"} emissiveIntensity={e} roughness={r} metalness={m} />
    </mesh>
  );
}

function PropsLocal({ l }: { l: Lugar }) {
  const w = l.ancho;
  switch (l.id) {
    case "tickets":
      return (
        <group>
          <Caja p={[0, 0.5, 0.2]} s={[w * 0.92, 1, 0.6]} color="#f8fafc" />
          <Caja p={[0, 0.98, 0.5]} s={[w * 0.92, 0.05, 0.05]} color={l.color} e={0.6} />
          {[-1, 0, 1].map((k) => (
            <group key={k}>
              <mesh position={[k * 1.2, 1.55, 0.2]}>
                <boxGeometry args={[1.0, 1.0, 0.03]} />
                <meshStandardMaterial color="#bae6fd" transparent opacity={0.3} roughness={0.05} depthWrite={false} />
              </mesh>
              <Caja p={[k * 1.2, 1.0, -0.15]} s={[0.36, 0.28, 0.05]} color="#0f172a" />
            </group>
          ))}
          {[-1.5, -0.5, 0.5, 1.5].map((x) => (
            <Caja key={x} p={[x, 0.45, 1.45]} s={[0.07, 0.9, 0.07]} color="#94a3b8" m={0.7} r={0.3} />
          ))}
          <Caja p={[0, 0.82, 1.45]} s={[3.0, 0.06, 0.02]} color="#dc2626" />
        </group>
      );
    case "atm":
      return (
        <group>
          <Caja p={[0, 0.85, -0.1]} s={[0.8, 1.7, 0.6]} color="#1f2937" m={0.4} r={0.4} />
          <Caja p={[0, 1.25, 0.21]} s={[0.5, 0.36, 0.02]} color="#22d3ee" e={0.9} />
          <Caja p={[0, 0.82, 0.24]} s={[0.46, 0.22, 0.08]} color="#94a3b8" m={0.6} r={0.3} />
          <Caja p={[0, 1.62, 0.21]} s={[0.7, 0.12, 0.02]} color={l.color} e={0.8} />
        </group>
      );
    case "pharmacy":
    case "lostfound": {
      const colores = l.id === "pharmacy" ? ["#f472b6", "#60a5fa", "#fbbf24", "#34d399", "#f87171"] : ["#b45309", "#92400e", "#a16207", "#78350f", "#57534e"];
      return (
        <group>
          <Caja p={[0, 0.5, 0.25]} s={[w * 0.8, 1, 0.55]} color="#f8fafc" />
          {[0.9, 1.45, 2.0].map((y) => (
            <group key={y}>
              <Caja p={[0, y, -0.38]} s={[w * 0.88, 0.05, 0.3]} color="#cbd5e1" />
              {Array.from({ length: 6 }, (_, k) => (
                <Caja key={k} p={[-w * 0.36 + k * w * 0.145, y + 0.16, -0.38]} s={[0.26, 0.28, 0.22]} color={colores[(k + Math.round(y * 3)) % colores.length]!} sombra={false} />
              ))}
            </group>
          ))}
          {l.id === "pharmacy" && (
            <group position={[w * 0.42, 2.45, 0.02]}>
              <Caja p={[0, 0, 0]} s={[0.46, 0.14, 0.05]} color="#22c55e" e={1.4} />
              <Caja p={[0, 0, 0]} s={[0.14, 0.46, 0.05]} color="#22c55e" e={1.4} />
            </group>
          )}
          {l.id === "lostfound" && <Caja p={[0.55, 1.06, 0.3]} s={[0.5, 0.12, 0.35]} color="#1d4ed8" />}
        </group>
      );
    }
    case "cafe":
      return (
        <group>
          <Caja p={[0, 0.5, 0.15]} s={[w * 0.9, 1, 0.6]} color="#7c2d12" r={0.5} />
          <Caja p={[0, 1.02, 0.15]} s={[w * 0.92, 0.05, 0.68]} color="#e7e5e4" r={0.3} />
          <Caja p={[-0.9, 1.3, 0.05]} s={[0.55, 0.5, 0.4]} color="#d1d5db" m={0.8} r={0.25} />
          <Caja p={[0, 1.95, -0.5]} s={[1.6, 0.6, 0.04]} color="#1c1917" />
          <Caja p={[0, 1.95, -0.47]} s={[1.4, 0.42, 0.02]} color="#fde68a" e={0.35} />
          {[-1.2, 0, 1.2].map((x, k) => (
            <group key={x} position={[x, 0, 1.75 + (k % 2) * 0.35]}>
              <mesh position={[0, 0.72, 0]} castShadow>
                <cylinderGeometry args={[0.36, 0.36, 0.05, 20]} />
                <meshStandardMaterial color="#fafaf9" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.36, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.06, 0.72, 8]} />
                <meshStandardMaterial color="#44403c" metalness={0.5} />
              </mesh>
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * 0.55, 0.42, 0]} castShadow>
                  <cylinderGeometry args={[0.17, 0.17, 0.08, 14]} />
                  <meshStandardMaterial color="#f97316" roughness={0.5} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      );
    case "restrooms":
      return (
        <group>
          {[
            [-0.55, "#2563eb"],
            [0.55, "#db2777"],
          ].map(([x, c]) => (
            <group key={String(x)}>
              <Caja p={[x as number, 1.0, -0.42]} s={[0.8, 2.0, 0.06]} color="#334155" r={0.5} />
              <Caja p={[x as number, 2.25, -0.4]} s={[0.36, 0.36, 0.04]} color={c as string} e={0.8} />
            </group>
          ))}
          <Caja p={[0, 1.0, -0.42]} s={[0.12, 2.0, 0.08]} color="#e2e8f0" />
        </group>
      );
    case "luggage":
      return (
        <group>
          {Array.from({ length: 4 }, (_, i) =>
            Array.from({ length: 3 }, (_, j) => (
              <Caja key={`${i}-${j}`} p={[-0.93 + i * 0.62, 0.4 + j * 0.62, -0.25]} s={[0.58, 0.58, 0.5]} color={(i + j) % 2 === 0 ? "#eab308" : "#ca8a04"} r={0.45} m={0.2} />
            )),
          )}
        </group>
      );
    case "exit":
      return (
        <group>
          <Caja p={[0, 1.1, -0.44]} s={[1.5, 2.2, 0.06]} color="#0b1220" r={0.3} />
          <Caja p={[0, 2.35, -0.4]} s={[0.9, 0.24, 0.05]} color="#16a34a" e={1.2} />
          <Caja p={[0.95, 0.9, -0.3]} s={[0.12, 1.8, 0.12]} color="#facc15" />
        </group>
      );
    default:
      return null;
  }
}

function Local({ l, resaltado, colorRes, conEtiqueta }: { l: Lugar; resaltado: boolean; colorRes: string; conEtiqueta: boolean }) {
  const rotY = l.lado === "izq" ? Math.PI / 2 : -Math.PI / 2;
  const x = l.lado === "izq" ? -X_LADO + 0.55 : X_LADO - 0.55;
  return (
    <group position={[x, 0, l.z]} rotation={[0, rotY, 0]}>
      <Caja p={[0, 1.4, -0.5]} s={[l.ancho, 2.8, 0.1]} color="#fffbeb" r={0.8} />
      <Caja p={[0, 2.75, -0.38]} s={[l.ancho * 0.96, 0.32, 0.16]} color={l.color} e={resaltado ? 1.2 : 0.45} />
      <PropsLocal l={l} />
      {resaltado && (
        <mesh position={[0, 0.03, 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(0.9, l.ancho * 0.42), Math.max(1.02, l.ancho * 0.42 + 0.12), 40]} />
          <meshBasicMaterial color={colorRes} transparent opacity={0.9} />
        </mesh>
      )}
      {conEtiqueta && (
        <Etiqueta pos={[0, 2.95, 1.25]} col={resaltado ? colorRes : `${l.color}aa`} fs={resaltado ? 12.5 : 10.5} z={resaltado ? 30 : 20}>
          <i className={`fa-solid ${l.icono}`} style={{ color: l.color }} />
          {l.id === "restrooms" ? "restrooms" : l.id === "lostfound" ? "lost and found" : l.id === "exit" ? "exit · taxis" : l.en}
        </Etiqueta>
      )}
    </group>
  );
}

function ModuloInfo({ resaltado, colorRes, conEtiqueta }: { resaltado: boolean; colorRes: string; conEtiqueta: boolean }) {
  return (
    <group position={[0, 0, 4.6]}>
      <Caja p={[0, 0.52, 0]} s={[3.4, 1.04, 0.8]} color="#f8fafc" r={0.35} />
      <Caja p={[0, 0.62, 0.41]} s={[3.2, 0.3, 0.02]} color="#3b82f6" e={0.6} />
      <Caja p={[0, 1.06, 0]} s={[3.5, 0.05, 0.9]} color="#cbd5e1" r={0.25} />
      <Caja p={[-0.8, 1.28, -0.12]} s={[0.5, 0.34, 0.04]} color="#0f172a" />
      <Caja p={[-0.8, 1.28, -0.095]} s={[0.44, 0.28, 0.01]} color="#38bdf8" e={0.6} sombra={false} />
      <mesh position={[2.1, 1.3, -0.1]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 2.6, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[2.1, 2.75, -0.1]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.1, 28]} />
        <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={resaltado ? 1.3 : 0.7} />
      </mesh>
      {resaltado && (
        <mesh position={[0, 0.03, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.64, 40]} />
          <meshBasicMaterial color={colorRes} transparent opacity={0.9} />
        </mesh>
      )}
      {conEtiqueta && (
        <Etiqueta pos={[2.1, 3.35, -0.1]} col="#60a5faaa" fs={10.5}>
          <i className="fa-solid fa-circle-info" style={{ color: "#60a5fa" }} />
          information desk
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Tableros (CanvasTexture) ────────────────────────────────────────── */

const TONO: Record<FilaTablero["tono"], string> = { ok: "#4ade80", warn: "#fb923c", info: "#22d3ee", off: "#64748b", bad: "#f87171", gate: "#facc15" };
const MONO = "ui-monospace, Consolas, 'Courier New', monospace";

function dibujarTablero(ctx: CanvasRenderingContext2D, tipo: "salidas" | "llegadas", filas: FilaTablero[], reloj: string, resIdx: number, resOk: boolean) {
  const W = 1024;
  const H = 512;
  ctx.fillStyle = "#04070c";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#0b1422";
  ctx.fillRect(0, 0, W, 78);
  ctx.fillStyle = tipo === "salidas" ? "#f59e0b" : "#38bdf8";
  ctx.fillRect(0, 74, W, 4);
  ctx.textBaseline = "middle";
  ctx.font = `900 44px ${MONO}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(tipo === "salidas" ? "DEPARTURES" : "ARRIVALS", 28, 40);
  ctx.font = `900 44px ${MONO}`;
  ctx.fillStyle = "#fbbf24";
  ctx.textAlign = "right";
  ctx.fillText(reloj, W - 28, 40);
  ctx.textAlign = "left";
  ctx.font = `700 22px ${MONO}`;
  ctx.fillStyle = "#94a3b8";
  const xGate = 612;
  const xRem = tipo === "salidas" ? 712 : 612;
  ctx.fillText("TIME", 28, 104);
  ctx.fillText(tipo === "salidas" ? "DESTINATION" : "FROM", 170, 104);
  if (tipo === "salidas") ctx.fillText("GATE", xGate, 104);
  ctx.fillText("REMARKS", xRem, 104);
  const y0 = 126;
  const alto = tipo === "salidas" ? 54 : 70;
  filas.forEach((f, i) => {
    const y = y0 + i * alto;
    if (i === resIdx) {
      ctx.fillStyle = resOk ? "rgba(52,211,153,0.28)" : "rgba(251,146,60,0.28)";
      ctx.fillRect(8, y + 2, W - 16, alto - 4);
      ctx.strokeStyle = resOk ? "#34d399" : "#fb923c";
      ctx.lineWidth = 3;
      ctx.strokeRect(8, y + 2, W - 16, alto - 4);
    } else if (i % 2 === 1) {
      ctx.fillStyle = "rgba(255,255,255,0.035)";
      ctx.fillRect(8, y + 2, W - 16, alto - 4);
    }
    const yc = y + alto / 2 + 1;
    const apagado = f.tono === "off";
    ctx.font = `800 34px ${MONO}`;
    ctx.fillStyle = apagado ? "#64748b" : "#fcd34d";
    ctx.fillText(f.hora, 28, yc);
    ctx.fillText(f.lugar.toUpperCase(), 170, yc);
    if (tipo === "salidas") {
      ctx.fillStyle = apagado ? "#64748b" : f.tono === "gate" ? "#facc15" : "#ffffff";
      ctx.fillText(f.gate, xGate + 18, yc);
    }
    ctx.font = `800 30px ${MONO}`;
    ctx.fillStyle = TONO[f.tono];
    ctx.fillText(f.remarks, xRem, yc);
  });
}

function Tablero({ tipo, t, x, resIdx, resOk }: { tipo: "salidas" | "llegadas"; t: number; x: number; resIdx: number; resOk: boolean }) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const texRef = useRef<THREE.CanvasTexture | null>(null);
  const filas = useMemo(() => (tipo === "salidas" ? filasSalidas(t) : filasLlegadas(t)), [tipo, t]);

  useLayoutEffect(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    texRef.current = tex;
    if (matRef.current) {
      matRef.current.map = tex;
      matRef.current.needsUpdate = true;
    }
    return () => {
      tex.dispose();
    };
  }, []);

  useLayoutEffect(() => {
    const tex = texRef.current;
    if (!tex) return;
    const ctx = (tex.image as HTMLCanvasElement).getContext("2d");
    if (!ctx) return;
    dibujarTablero(ctx, tipo, filas, fmtHora(t), resIdx, resOk);
    tex.needsUpdate = true;
  }, [filas, tipo, t, resIdx, resOk]);

  return (
    <group position={[x, 4.75, -6.2]}>
      <mesh position={[0, 0, -0.08]} castShadow>
        <boxGeometry args={[6.9, 3.6, 0.14]} />
        <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh>
        <planeGeometry args={[6.6, 3.3]} />
        <meshBasicMaterial ref={matRef} toneMapped={false} />
      </mesh>
      {[-2.6, 2.6].map((dx) => (
        <mesh key={dx} position={[dx, 2.6, -0.1]}>
          <cylinderGeometry args={[0.025, 0.025, 1.6, 6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Autobuses ───────────────────────────────────────────────────────── */

const Z_BAHIA = -10.9;
const Z_FUERA = -30;

function Autobus({ id, t }: { id: DestId; t: number }) {
  const s = SALIDAS.find((x) => x.id === id)!;
  const e = estadoSalida(s, t);
  const presente = !e.cancel && t >= e.horaActual - 25 && t < e.horaActual;
  const gx = GATES_X[e.puerta - 1]!;
  const grupo = useRef<THREE.Group>(null);
  const luz = useRef<THREE.MeshStandardMaterial>(null);
  const [ini] = useState<[number, number]>(() => [gx, presente ? Z_BAHIA : Z_FUERA]);
  const objetivoZ = presente ? Z_BAHIA : Z_FUERA;
  const abordando = e.estado === "boarding";

  useFrame(({ clock }, dt) => {
    const g = grupo.current;
    if (!g) return;
    const dz = objetivoZ - g.position.z;
    const paso = Math.min(Math.abs(dz), 7 * Math.min(dt, 0.1));
    g.position.z += Math.sign(dz) * paso;
    g.position.x += (gx - g.position.x) * suave(dt, 0.04);
    g.visible = g.position.z > Z_FUERA + 2;
    if (luz.current) luz.current.emissiveIntensity = abordando ? 1.2 + 0.8 * Math.sin(clock.elapsedTime * 5) : 0.15;
  });

  return (
    <group ref={grupo} position={[ini[0], 0, ini[1]]}>
      <Caja p={[0, 1.12, 0]} s={[1.5, 1.7, 5.6]} color="#f8fafc" r={0.35} m={0.2} />
      <Caja p={[0, 0.62, 0]} s={[1.52, 0.2, 5.62]} color={s.color} r={0.5} sombra={false} />
      <Caja p={[0, 1.42, -0.2]} s={[1.53, 0.6, 4.6]} color="#0f172a" r={0.1} m={0.4} sombra={false} />
      <Caja p={[0, 1.2, 2.81]} s={[1.3, 1.0, 0.03]} color="#1e293b" r={0.05} m={0.5} sombra={false} />
      <Caja p={[0, 1.86, 2.81]} s={[1.2, 0.2, 0.04]} color="#fbbf24" e={0.9} sombra={false} />
      <mesh position={[0.77, 0.9, 2.0]}>
        <boxGeometry args={[0.03, 1.2, 0.7]} />
        <meshStandardMaterial ref={luz} color="#22c55e" emissive="#22c55e" emissiveIntensity={0.15} />
      </mesh>
      {[-1.9, 1.9].flatMap((z) =>
        [-0.72, 0.72].map((x) => (
          <mesh key={`${x}-${z}`} position={[x, 0.34, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.2, 18]} />
            <meshStandardMaterial color="#111827" roughness={0.8} />
          </mesh>
        )),
      )}
    </group>
  );
}

/* ── Personajes ──────────────────────────────────────────────────────── */

function Cuerpo({ color, maleta, piernaI, piernaD, brazoI, brazoD, uniforme }: { color: string; maleta?: boolean; uniforme?: boolean; piernaI?: RefObject<THREE.Group | null>; piernaD?: RefObject<THREE.Group | null>; brazoI?: RefObject<THREE.Group | null>; brazoD?: RefObject<THREE.Group | null> }) {
  return (
    <group scale={0.95}>
      <group ref={piernaI} position={[-0.09, 0.5, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.12, 0.5, 0.13]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
      </group>
      <group ref={piernaD} position={[0.09, 0.5, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.12, 0.5, 0.13]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
      </group>
      <mesh position={[0, 0.82, 0]} castShadow>
        <capsuleGeometry args={[0.19, 0.32, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      {uniforme && (
        <mesh position={[0, 0.92, 0.17]}>
          <boxGeometry args={[0.12, 0.3, 0.04]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
        </mesh>
      )}
      <group ref={brazoI} position={[-0.25, 1.0, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.09, 0.42, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
      </group>
      <group ref={brazoD} position={[0.25, 1.0, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.09, 0.42, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
        {maleta && (
          <group position={[0.12, -0.42, -0.05]}>
            <mesh position={[0, -0.02, 0]} castShadow>
              <boxGeometry args={[0.16, 0.44, 0.3]} />
              <meshStandardMaterial color="#b91c1c" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.26, 0]}>
              <boxGeometry args={[0.03, 0.12, 0.03]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
          </group>
        )}
      </group>
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.16, 18, 14]} />
        <meshStandardMaterial color="#e8b894" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.165, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={uniforme ? "#1f2937" : "#6b4423"} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Caminante({ p }: { p: PersonajeEscena }) {
  const grupo = useRef<THREE.Group>(null);
  const piernaI = useRef<THREE.Group>(null);
  const piernaD = useRef<THREE.Group>(null);
  const brazoI = useRef<THREE.Group>(null);
  const brazoD = useRef<THREE.Group>(null);
  const idx = useRef(0);
  const clave = useRef<number | null>(null);
  const fase = useRef(0);
  const { puntos, animKey, mira } = p;

  useFrame((_, dt) => {
    const g = grupo.current;
    if (!g || puntos.length === 0) return;
    if (clave.current !== animKey) {
      const p0 = puntos[0]!;
      g.position.set(p0[0], 0, p0[1]);
      if (puntos.length > 1) g.rotation.y = Math.atan2(puntos[1]![0] - p0[0], puntos[1]![1] - p0[1]);
      else if (mira !== undefined) g.rotation.y = mira;
      idx.current = Math.min(1, puntos.length - 1);
      clave.current = animKey;
    }
    const obj = puntos[Math.min(idx.current, puntos.length - 1)]!;
    const dx = obj[0] - g.position.x;
    const dz = obj[1] - g.position.z;
    const dist = Math.hypot(dx, dz);
    let camina = false;
    if (dist > 0.03) {
      const paso = Math.min(dist, 2.3 * Math.min(dt, 0.1));
      g.position.x += (dx / dist) * paso;
      g.position.z += (dz / dist) * paso;
      let dif = Math.atan2(dx, dz) - g.rotation.y;
      dif = Math.atan2(Math.sin(dif), Math.cos(dif));
      g.rotation.y += dif * suave(dt, 0.25);
      camina = true;
    } else if (idx.current < puntos.length - 1) idx.current += 1;
    else if (puntos.length === 1 && mira !== undefined) {
      let dif = mira - g.rotation.y;
      dif = Math.atan2(Math.sin(dif), Math.cos(dif));
      g.rotation.y += dif * suave(dt, 0.12);
    }
    fase.current += camina ? dt * 9 : 0;
    const s = camina ? Math.sin(fase.current) * 0.6 : 0;
    if (piernaI.current) piernaI.current.rotation.x = s;
    if (piernaD.current) piernaD.current.rotation.x = -s;
    if (brazoI.current) brazoI.current.rotation.x = -s * 0.8;
    if (brazoD.current) brazoD.current.rotation.x = p.maleta ? 0 : s * 0.8;
    g.position.y = camina ? Math.abs(Math.sin(fase.current)) * 0.03 : 0;
  });

  const p0 = puntos[0] ?? [0, 0];
  return (
    <group ref={grupo} position={[p0[0], 0, p0[1]]}>
      <Cuerpo color={p.color} maleta={p.maleta} piernaI={piernaI} piernaD={piernaD} brazoI={brazoI} brazoD={brazoD} />
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.42, 32]} />
        <meshBasicMaterial color={p.color} transparent opacity={0.85} />
      </mesh>
      {p.burbuja ? (
        <Burbuja pos={[0, 2.05, 0]} texto={p.burbuja} />
      ) : (
        <Etiqueta pos={[0, 1.85, 0]} col={p.color} fs={10.5} z={25}>
          {p.nombre}
        </Etiqueta>
      )}
    </group>
  );
}

/** Paseantes de ambiente: dan la vuelta a la sala por los pasillos. */
const CIRCUITO: [number, number][] = [
  [-7.3, 6.55],
  [7.3, 6.55],
  [7.3, -4.9],
  [-7.3, -4.9],
];
const PERIMETRO = CIRCUITO.reduce((acc, p, i) => {
  const q = CIRCUITO[(i + 1) % CIRCUITO.length]!;
  return acc + Math.hypot(q[0] - p[0], q[1] - p[1]);
}, 0);

function Paseante({ color, desfase, sentido }: { color: string; desfase: number; sentido: 1 | -1 }) {
  const grupo = useRef<THREE.Group>(null);
  const piernaI = useRef<THREE.Group>(null);
  const piernaD = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = grupo.current;
    if (!g) return;
    let u = (((clock.elapsedTime * 1.1 * sentido + desfase) % PERIMETRO) + PERIMETRO) % PERIMETRO;
    for (let i = 0; i < CIRCUITO.length; i++) {
      const a = CIRCUITO[i]!;
      const b = CIRCUITO[(i + 1) % CIRCUITO.length]!;
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (u <= l) {
        const k = u / l;
        g.position.set(a[0] + (b[0] - a[0]) * k + sentido * 0.5, 0, a[1] + (b[1] - a[1]) * k);
        g.rotation.y = Math.atan2((b[0] - a[0]) * sentido, (b[1] - a[1]) * sentido);
        break;
      }
      u -= l;
    }
    const s = Math.sin(clock.elapsedTime * 8 + desfase) * 0.55;
    if (piernaI.current) piernaI.current.rotation.x = s;
    if (piernaD.current) piernaD.current.rotation.x = -s;
  });
  return (
    <group ref={grupo}>
      <Cuerpo color={color} maleta piernaI={piernaI} piernaD={piernaD} />
    </group>
  );
}

function Baliza({ x, z, color }: { x: number; z: number; color: string }) {
  const anillo = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.8) % 1;
    if (anillo.current) anillo.current.scale.setScalar(0.6 + t * 1.2);
    if (mat.current) mat.current.opacity = 0.85 * (1 - t);
  });
  return (
    <group position={[x, 0.05, z]}>
      <mesh ref={anillo} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.84, 40]} />
        <meshBasicMaterial ref={mat} color={color} transparent opacity={0.8} depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 3.2, 24, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function CamaraInicial({ pos, target }: { pos: Pt; target: Pt }) {
  const camera = useThree((st) => st.camera);
  useLayoutEffect(() => {
    camera.position.set(pos[0], pos[1], pos[2]);
    camera.lookAt(target[0], target[1], target[2]);
  }, [camera, pos, target]);
  return null;
}

function focoXZ(id: LugarId): [number, number] {
  const l = LUGARES.find((q) => q.id === id)!;
  if (l.lado === "izq") return [-X_LADO + 2.3, l.z];
  if (l.lado === "der") return [X_LADO - 2.3, l.z];
  if (id === "info") return [0, 5.9];
  if (id === "gates") return [0, -5.6];
  if (id === "waiting") return [0, -1.3];
  return [l.x, l.z - 1];
}

/* ── Escena ───────────────────────────────────────────────────────────── */

const CAMARAS: Record<Modo, { pos: Pt; target: Pt; min: number; max: number }> = {
  preguntar: { pos: [0, 16, 23], target: [0, 0.2, 0.4], min: 6, max: 40 },
  tablero: { pos: [0, 2.3, 6.4], target: [0, 3.5, -6], min: 4, max: 20 },
  informacion: { pos: [0, 27.5, 11.5], target: [0, 0, 1.0], min: 8, max: 40 },
};

export default function TerminalHorariosInglesScene(p: TerminalSceneProps) {
  const { vista, modoColor, resetNonce, t } = p;
  const cam = CAMARAS[vista];
  const conEtiquetas = vista !== "tablero";
  const colFoco = p.foco ? (p.foco.ok ? OK : NO) : modoColor;
  const idxSal = p.filaSalida ? SALIDAS.findIndex((s) => s.id === p.filaSalida!.id) : -1;
  const idxLl = p.filaLlegada ? LLEGADAS.findIndex((s) => s.id === p.filaLlegada!.id) : -1;
  const focoPos = p.foco ? focoXZ(p.foco.lugar) : null;
  const gatesFocoIdx = p.filaSalida && p.filaSalida.ok ? estadoSalida(SALIDAS[idxSal]!, t).puerta : null;

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#08111c"]} />
      <fog attach="fog" args={["#08111c", 34, 70]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fff7e6", "#1e293b", 0.35]} />
      <directionalLight
        position={[8, 18, 10]}
        intensity={1.25}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-bias={-0.0005}
      />
      <pointLight position={[0, 5, 1]} intensity={0.6} color="#fde68a" distance={26} />
      <pointLight position={[-8, 4, -8]} intensity={0.35} color={modoColor} distance={20} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.3} position={[0, 8, 0]} scale={[20, 12, 1]} rotation={[Math.PI / 2, 0, 0]} color="#fff7ed" />
        <Lightformer form="rect" intensity={0.6} position={[-10, 2, 8]} scale={[8, 6, 1]} color={modoColor} />
      </Environment>

      <Edificio />
      <SalaEspera />
      {LUGARES.filter((l) => l.local).map((l) => (
        <Local key={l.id} l={l} resaltado={p.foco?.lugar === l.id} colorRes={colFoco} conEtiqueta={conEtiquetas} />
      ))}
      <ModuloInfo resaltado={p.foco?.lugar === "info"} colorRes={colFoco} conEtiqueta={conEtiquetas && vista !== "preguntar"} />
      <Tablero tipo="salidas" t={t} x={-3.5} resIdx={idxSal} resOk={!!p.filaSalida?.ok} />
      <Tablero tipo="llegadas" t={t} x={3.5} resIdx={idxLl} resOk={!!p.filaLlegada?.ok} />

      {GATES_X.map((gx, i) => (
        <group key={gx}>
          <Caja p={[gx, 2.55, Z_FONDO + 0.12]} s={[1.3, 0.42, 0.08]} color={gatesFocoIdx === i + 1 ? OK : "#1e293b"} e={gatesFocoIdx === i + 1 ? 0.9 : 0} />
          <Etiqueta pos={[gx, vista === "tablero" ? 2.55 : 3.0, Z_FONDO + 0.3]} col={gatesFocoIdx === i + 1 ? OK : "#cbd5e1aa"} fs={vista === "tablero" ? 12 : 10} z={15}>
            <i className="fa-solid fa-door-open" style={{ color: "#cbd5e1" }} />
            Gate {i + 1}
          </Etiqueta>
        </group>
      ))}
      {SALIDAS.map((s) => (
        <Autobus key={s.id} id={s.id} t={t} />
      ))}

      {/* Rosa, la empleada */}
      <group position={[0, 0, 3.95]}>
        <Cuerpo color="#f8fafc" uniforme />
        {vista !== "informacion" && (p.empleada.burbuja ? <Burbuja pos={[0, 1.95, 0]} texto={p.empleada.burbuja} fondo="#dbeafe" col="#0c1a3a" ancho={260} /> : <Etiqueta pos={[0, 1.8, 0]} col="#60a5fa" fs={10.5} z={25}>{p.empleada.nombre}</Etiqueta>)}
        {vista === "informacion" && p.empleada.burbuja && <Burbuja pos={[0, 1.95, 0]} texto={p.empleada.burbuja} fondo="#ede9fe" col="#2e1065" ancho={260} />}
      </group>

      <Caminante p={p.visitante} />
      {vista !== "tablero" && (
        <>
          <Paseante color="#0ea5e9" desfase={3} sentido={1} />
          <Paseante color="#84cc16" desfase={31} sentido={-1} />
        </>
      )}
      {focoPos && <Baliza x={focoPos[0]} z={focoPos[1]} color={colFoco} />}


      <CamaraInicial pos={cam.pos} target={cam.target} />
      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={cam.min} maxDistance={cam.max} maxPolarAngle={Math.PI * 0.47} minPolarAngle={vista === "informacion" ? 0.05 : Math.PI * 0.12} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.85} luminanceSmoothing={0.8} mipmapBlur />
        <Vignette eskil={false} offset={0.22} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
