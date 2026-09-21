"use client";

/**
 * Escena 3D del laboratorio "Directions in town" (IN-II-P06).
 *
 * Un barrio ficticio en cuadrícula: 4 calles norte-sur y 4 avenidas este-oeste,
 * 8 manzanas con casas y 14 lugares con nombre, un parque con kiosco, tres
 * semáforos y una parada de autobús. Encima de ese mismo barrio:
 *
 *  - seguir: Emma camina esquina por esquina según los botones del alumno.
 *  - dar: Sam ejecuta al pie de la letra la ruta escrita y deja un rastro.
 *  - donde: la cámara se acerca al lugar preguntado; dos personas conversan y
 *    se dibujan las relaciones (next to, across from…) que el alumno afirma.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { createContext, useContext, useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Estado,
  type Punto,
  type Referente,
  type Lugar,
  type CalleId,
  LUGARES,
  CALLES,
  SEMAFOROS,
  PARQUE,
  DIRS,
  N_NODOS,
  CELDA,
  ANCHO_CALLE,
  BLOQUE,
  PASO,
  nodoW,
  centroLote,
  centroReferente,
  callesDeLote,
  lugarEn,
  nombreEn,
  calle,
} from "./ciudad-direcciones-ingles-data";

export type VistaCiudad = "seguir" | "dar" | "donde";

export interface RelacionDibujo {
  ref: Referente;
  ok: boolean;
}

export interface CiudadSceneProps {
  vista: VistaCiudad;
  modoColor: string;
  resetNonce: number;
  camSeguir: boolean;
  ayudaLados: boolean;
  // seguir / dar
  puntos: Punto[];
  animKey: number;
  nombre: string;
  colorPersona: string;
  inicio: Estado;
  burbuja: string | null;
  destino: Referente | null;
  destinoColor: string;
  // donde
  foco: Referente;
  pregunta: string | null;
  respuesta: string | null;
  relaciones: RelacionDibujo[];
  esquina: { calles: [CalleId, CalleId]; ok: boolean } | null;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const NO = "#fb923c";

/**
 * Escala de las etiquetas. En la vista de mapa (0) tienen tamaño fijo en pantalla, para que
 * las lejanas se lean igual que las cercanas; con la cámara cerca se escalan con la distancia.
 */
const EscalaEtiquetas = createContext(1);

function Etiqueta({ pos, children, df = 14, col, fs = 12, z = 20 }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number; z?: number }) {
  const escala = useContext(EscalaEtiquetas);
  return (
    <Html position={pos} center eps={-1} distanceFactor={escala === 0 ? undefined : df * escala} zIndexRange={[z, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
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

function Burbuja({ pos, texto, col = "#0f172a", df = 12 }: { pos: Pt; texto: string; col?: string; df?: number }) {
  const escala = useContext(EscalaEtiquetas);
  return (
    <Html position={pos} center eps={-1} distanceFactor={escala === 0 ? undefined : df * escala} zIndexRange={[escala === 0 ? 10 : 40, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            maxWidth: 230,
            width: "max-content",
            padding: "7px 12px",
            borderRadius: 12,
            background: "#fff",
            color: col,
            fontSize: 13,
            fontWeight: 800,
            lineHeight: 1.35,
            textAlign: "center",
            boxShadow: "0 8px 22px -8px #000",
          }}
        >
          {texto}
        </div>
        <div style={{ width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: "8px solid #fff" }} />
      </div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * EL BARRIO
 * ════════════════════════════════════════════════════════════════════════ */

const PALETA = ["#f9a8d4", "#fcd34d", "#5eead4", "#fdba74", "#c4b5fd", "#86efac", "#fca5a5", "#93c5fd", "#fde68a"];
const LIMITE = nodoW(N_NODOS - 1) + ANCHO_CALLE / 2;

interface Casa {
  x: number;
  z: number;
  fx: number;
  fz: number;
  alto: number;
  color: string;
}

const CASAS: Casa[] = (() => {
  const out: Casa[] = [];
  for (let bx = 0; bx < 3; bx++)
    for (let bz = 0; bz < 3; bz++) {
      if (bx === PARQUE.bx && bz === PARQUE.bz) continue;
      for (let cx = 0; cx < 3; cx++)
        for (let cz = 0; cz < 3; cz++) {
          if (cx === 1 && cz === 1) continue;
          if (lugarEn(bx, bz, cx, cz)) continue;
          const dir = callesDeLote(bx, bz, cx, cz)[0]!.dir;
          const [x, z] = centroLote(bx, bz, cx, cz);
          const i = out.length;
          out.push({ x, z, fx: DIRS[dir]![0], fz: DIRS[dir]![1], alto: 0.75 + ((i * 7 + bx + bz * 2) % 5) * 0.2, color: PALETA[(i * 5 + bx * 3 + bz) % PALETA.length]! });
        }
    }
  return out;
})();

/** Rayas de los pasos peatonales y líneas centrales. */
const RAYAS: { x: number; z: number; sx: number; sz: number }[] = (() => {
  const out: { x: number; z: number; sx: number; sz: number }[] = [];
  const off = ANCHO_CALLE / 2 + 0.42;
  for (let x = 0; x < N_NODOS; x++)
    for (let z = 0; z < N_NODOS; z++) {
      const wx = nodoW(x);
      const wz = nodoW(z);
      DIRS.forEach(([dx, dz]) => {
        if (x + dx < 0 || x + dx >= N_NODOS || z + dz < 0 || z + dz >= N_NODOS) return;
        for (let k = 0; k < 5; k++) {
          const t = (k - 2) * 0.4;
          if (dx === 0) out.push({ x: wx + t, z: wz + dz * off, sx: 0.2, sz: 0.62 });
          else out.push({ x: wx + dx * off, z: wz + t, sx: 0.62, sz: 0.2 });
        }
      });
    }
  return out;
})();

const LINEAS: { x: number; z: number; sx: number; sz: number }[] = (() => {
  const out: { x: number; z: number; sx: number; sz: number }[] = [];
  for (let a = 0; a < N_NODOS; a++)
    for (let b = 0; b < N_NODOS - 1; b++) {
      for (let k = 0; k < 4; k++) {
        const t = nodoW(b) + ANCHO_CALLE / 2 + 0.9 + (k + 0.5) * ((PASO - ANCHO_CALLE - 1.8) / 4);
        out.push({ x: nodoW(a), z: t, sx: 0.07, sz: 0.36 });
        out.push({ x: t, z: nodoW(a), sx: 0.36, sz: 0.07 });
      }
    }
  return out;
})();

const ARBOLES_FUERA: Pt[] = (() => {
  const out: Pt[] = [];
  const r = LIMITE + 1.6;
  for (let k = 0; k < 44; k++) {
    const lado = k % 4;
    const t = -r + ((k * 0.618) % 1) * 2 * r;
    const jit = ((k * 0.37) % 1) * 2.4;
    if (lado === 0) out.push([t, 0, -r - jit]);
    else if (lado === 1) out.push([t, 0, r + jit]);
    else if (lado === 2) out.push([-r - jit, 0, t]);
    else out.push([r + jit, 0, t]);
  }
  return out;
})();

function Instancias({ items, color, y = 0.012 }: { items: { x: number; z: number; sx: number; sz: number }[]; color: string; y?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    items.forEach((it, i) => {
      o.position.set(it.x, y, it.z);
      o.scale.set(it.sx, 1, it.sz);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [items, y]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} receiveShadow>
      <boxGeometry args={[1, 0.02, 1]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </instancedMesh>
  );
}

function Casas() {
  const cuerpos = useRef<THREE.InstancedMesh>(null);
  const techos = useRef<THREE.InstancedMesh>(null);
  const puertas = useRef<THREE.InstancedMesh>(null);
  const ventanas = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    const w = CELDA * 0.84;
    CASAS.forEach((h, i) => {
      const ang = Math.atan2(h.fx, h.fz);
      o.rotation.set(0, ang, 0);
      o.position.set(h.x, 0.14 + h.alto / 2, h.z);
      o.scale.set(w, h.alto, w);
      o.updateMatrix();
      cuerpos.current?.setMatrixAt(i, o.matrix);
      cuerpos.current?.setColorAt(i, c.set(h.color));
      o.position.set(h.x, 0.14 + h.alto + 0.04, h.z);
      o.scale.set(w + 0.08, 0.08, w + 0.08);
      o.updateMatrix();
      techos.current?.setMatrixAt(i, o.matrix);
      o.position.set(h.x + h.fx * (w / 2 + 0.01), 0.14 + 0.2, h.z + h.fz * (w / 2 + 0.01));
      o.scale.set(0.24, 0.4, 0.04);
      o.updateMatrix();
      puertas.current?.setMatrixAt(i, o.matrix);
      o.position.set(h.x + h.fx * (w / 2 + 0.01), 0.14 + h.alto * 0.68, h.z + h.fz * (w / 2 + 0.01));
      o.scale.set(0.6, 0.16, 0.03);
      o.updateMatrix();
      ventanas.current?.setMatrixAt(i, o.matrix);
    });
    [cuerpos, techos, puertas, ventanas].forEach((r) => {
      if (r.current) {
        r.current.instanceMatrix.needsUpdate = true;
        if (r.current.instanceColor) r.current.instanceColor.needsUpdate = true;
      }
    });
  }, []);
  return (
    <>
      <instancedMesh ref={cuerpos} args={[undefined, undefined, CASAS.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={techos} args={[undefined, undefined, CASAS.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#a8553a" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={puertas} args={[undefined, undefined, CASAS.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#5b3a29" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={ventanas} args={[undefined, undefined, CASAS.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={0.55} roughness={0.4} />
      </instancedMesh>
    </>
  );
}

function Toldo({ ancho, colores, y, z }: { ancho: number; colores: string[]; y: number; z: number }) {
  const n = colores.length;
  return (
    <group position={[0, y, z]} rotation={[0.45, 0, 0]}>
      {colores.map((c, k) => (
        <mesh key={k} position={[(k - (n - 1) / 2) * (ancho / n), 0, 0.2]} castShadow>
          <boxGeometry args={[ancho / n, 0.04, 0.42]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Cruz({ col, y, z }: { col: string; y: number; z: number }) {
  return (
    <group position={[0, y, z]}>
      <mesh>
        <boxGeometry args={[0.3, 0.1, 0.03]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.2} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.1, 0.3, 0.03]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

const ALTOS: Record<string, number> = { church: 1.5, hotel: 2.7, supermarket: 1.3, bank: 1.5, school: 1.2, market: 0.95, library: 1.4, health: 1.35, post: 1.2, gym: 1.3, pharmacy: 1.2, tacos: 0.95, bakery: 1.05, butcher: 1.05 };
const CUERPO: Record<string, string> = { church: "#f5e6c8", hotel: "#cbd5e1", supermarket: "#f1f5f9", bank: "#e2e8f0", school: "#fef3c7", market: "#fde7ef", library: "#ede9fe", health: "#f0fdfa", post: "#dbeafe", gym: "#cffafe", pharmacy: "#ecfdf5", tacos: "#ffedd5", bakery: "#fef9c3", butcher: "#fee2e2" };

/** Altura de la etiqueta de un lugar: escalonada para que en el mapa no se encimen. */
function alturaEtiqueta(l: Lugar): number {
  const alto = ALTOS[l.id] ?? 1.2;
  return alto + 0.45 + (l.frente % 2 === 0 ? (l.cx === 1 ? 1.9 : l.id === "church" ? 3.3 : 0) : (2 - l.cz) * 0.5);
}

function Edificio({ l, resaltado, sinEtiqueta }: { l: Lugar; resaltado: boolean; sinEtiqueta: boolean }) {
  const [x, z] = centroLote(l.bx, l.bz, l.cx, l.cz);
  const [fx, fz] = DIRS[l.frente]!;
  const w = CELDA * 0.86;
  const alto = ALTOS[l.id] ?? 1.2;
  const d = l.id === "school" ? w * 0.78 : w;
  const zf = d / 2 + 0.01;
  const ident = l.id;
  return (
    <group position={[x, 0.14, z]} rotation={[0, Math.atan2(fx, fz), 0]}>
      <mesh position={[0, alto / 2, l.id === "school" ? -(w - d) / 2 : 0]} castShadow receiveShadow>
        <boxGeometry args={[w, alto, d]} />
        <meshStandardMaterial color={CUERPO[ident] ?? "#e5e7eb"} roughness={0.75} />
      </mesh>
      <mesh position={[0, alto + 0.04, l.id === "school" ? -(w - d) / 2 : 0]} castShadow>
        <boxGeometry args={[w + 0.08, 0.08, d + 0.08]} />
        <meshStandardMaterial color={l.color} roughness={0.6} />
      </mesh>
      {/* Letrero de color */}
      <mesh position={[0, alto * 0.78, zf - (l.id === "school" ? (w - d) / 2 : 0)]}>
        <boxGeometry args={[w * 0.8, 0.16, 0.04]} />
        <meshStandardMaterial color={l.color} emissive={l.color} emissiveIntensity={resaltado ? 1.1 : 0.45} />
      </mesh>
      {/* Puerta */}
      <mesh position={[0, 0.24, zf - (l.id === "school" ? (w - d) / 2 : 0)]}>
        <boxGeometry args={[0.3, 0.48, 0.04]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.2} />
      </mesh>
      {ident === "church" && (
        <group position={[w * 0.28, 0, -0.05]}>
          <mesh position={[0, alto + 0.45, 0]} castShadow>
            <boxGeometry args={[0.36, 0.9, 0.36]} />
            <meshStandardMaterial color="#f5e6c8" roughness={0.75} />
          </mesh>
          <mesh position={[0, alto + 1.08, 0]} castShadow>
            <coneGeometry args={[0.26, 0.38, 4]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
          <mesh position={[0, alto + 1.38, 0]}>
            <boxGeometry args={[0.03, 0.22, 0.03]} />
            <meshStandardMaterial color="#fcd34d" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, alto + 1.42, 0]}>
            <boxGeometry args={[0.13, 0.03, 0.03]} />
            <meshStandardMaterial color="#fcd34d" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      )}
      {(ident === "bank" || ident === "library") &&
        [-0.33, -0.11, 0.11, 0.33].map((cx) => (
          <mesh key={cx} position={[cx, 0.5, zf + 0.12]} castShadow>
            <cylinderGeometry args={[0.045, 0.05, 1, 10]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
        ))}
      {(ident === "bank" || ident === "library") && (
        <mesh position={[0, 1.04, zf + 0.12]}>
          <boxGeometry args={[w * 0.9, 0.08, 0.3]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
      )}
      {ident === "school" && (
        <group position={[w * 0.38, 0, zf + 0.05]}>
          <mesh position={[0, 0.85, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 1.7, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
          </mesh>
          {["#15803d", "#f8fafc", "#dc2626"].map((c, k) => (
            <mesh key={c} position={[-0.09 - k * 0.12, 1.55, 0]}>
              <boxGeometry args={[0.12, 0.22, 0.01]} />
              <meshStandardMaterial color={c} roughness={0.7} />
            </mesh>
          ))}
        </group>
      )}
      {ident === "market" && <Toldo ancho={w} colores={["#f472b6", "#fde047", "#34d399", "#60a5fa", "#fb923c"]} y={0.62} z={zf} />}
      {ident === "tacos" && <Toldo ancho={w} colores={["#fb923c", "#fff7ed", "#fb923c", "#fff7ed"]} y={0.62} z={zf} />}
      {ident === "bakery" && <Toldo ancho={w} colores={["#a16207", "#fef3c7", "#a16207", "#fef3c7"]} y={0.66} z={zf} />}
      {ident === "butcher" && <Toldo ancho={w} colores={["#dc2626", "#fff", "#dc2626", "#fff"]} y={0.66} z={zf} />}
      {ident === "pharmacy" && <Cruz col="#22c55e" y={alto + 0.32} z={zf - 0.2} />}
      {ident === "health" && <Cruz col="#14b8a6" y={alto + 0.32} z={zf - 0.2} />}
      {(ident === "supermarket" || ident === "gym") && (
        <mesh position={[0, 0.42, zf + 0.005]}>
          <boxGeometry args={[w * 0.82, 0.5, 0.02]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.35} roughness={0.1} metalness={0.3} />
        </mesh>
      )}
      {ident === "hotel" &&
        [0.7, 1.15, 1.6, 2.05].map((y) => (
          <mesh key={y} position={[0, y, zf + 0.005]}>
            <boxGeometry args={[w * 0.74, 0.18, 0.02]} />
            <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={0.5} />
          </mesh>
        ))}
      {ident === "post" && (
        <mesh position={[0.34, 0.2, zf + 0.18]} castShadow>
          <boxGeometry args={[0.16, 0.36, 0.14]} />
          <meshStandardMaterial color="#2563eb" roughness={0.5} />
        </mesh>
      )}
      {!sinEtiqueta && (
      <Etiqueta pos={[0, alturaEtiqueta(l), 0]} col={`${l.color}${resaltado ? "" : "aa"}`} fs={resaltado ? 12.5 : 10.5} df={14} z={resaltado ? 30 : 20}>
        <i className={`fa-solid ${l.icono}`} style={{ color: l.color }} />
        {l.en}
      </Etiqueta>
      )}
    </group>
  );
}

function Semaforo({ x, z, fase }: { x: number; z: number; fase: number }) {
  const rojo = useRef<THREE.MeshStandardMaterial>(null);
  const ambar = useRef<THREE.MeshStandardMaterial>(null);
  const verde = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime + fase) % 9;
    if (verde.current) verde.current.emissiveIntensity = t < 4 ? 2.4 : 0.05;
    if (ambar.current) ambar.current.emissiveIntensity = t >= 4 && t < 5 ? 2.4 : 0.05;
    if (rojo.current) rojo.current.emissiveIntensity = t >= 5 ? 2.4 : 0.05;
  });
  const px = nodoW(x) + ANCHO_CALLE / 2 + 0.12;
  const pz = nodoW(z) - ANCHO_CALLE / 2 - 0.12;
  return (
    <group position={[px, 0.14, pz]}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.04, 1.4, 8]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[0.2, 0.52, 0.18]} />
        <meshStandardMaterial color="#111827" roughness={0.5} />
      </mesh>
      {(
        [
          [1.66, "#ef4444", rojo],
          [1.5, "#f59e0b", ambar],
          [1.34, "#22c55e", verde],
        ] as const
      ).map(([y, c, r]) => (
        <mesh key={c} position={[-0.105, y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.02, 14]} />
          <meshStandardMaterial ref={r} color={c} emissive={c} emissiveIntensity={0.05} />
        </mesh>
      ))}
    </group>
  );
}

const TRONCOS_PARQUE: Pt[] = (() => {
  const [cx, cz] = centroReferente("park");
  const out: Pt[] = [];
  const r = BLOQUE / 2 - 0.45;
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + Math.PI / 12;
    const rr = k % 2 === 0 ? r : r * 0.62;
    out.push([cx + Math.cos(a) * rr, 0, cz + Math.sin(a) * rr]);
  }
  return out;
})();

function Arboles({ pts, escala = 1 }: { pts: Pt[]; escala?: number }) {
  const troncos = useRef<THREE.InstancedMesh>(null);
  const copas = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    pts.forEach(([x, , z], i) => {
      const s = escala * (0.85 + ((i * 0.37) % 1) * 0.4);
      o.position.set(x, 0.14 + 0.25 * s, z);
      o.scale.set(s, s, s);
      o.updateMatrix();
      troncos.current?.setMatrixAt(i, o.matrix);
      o.position.set(x, 0.14 + 0.72 * s, z);
      o.updateMatrix();
      copas.current?.setMatrixAt(i, o.matrix);
    });
    if (troncos.current) troncos.current.instanceMatrix.needsUpdate = true;
    if (copas.current) copas.current.instanceMatrix.needsUpdate = true;
  }, [pts, escala]);
  return (
    <>
      <instancedMesh ref={troncos} args={[undefined, undefined, pts.length]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.5, 8]} />
        <meshStandardMaterial color="#6b4423" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={copas} args={[undefined, undefined, pts.length]} castShadow>
        <icosahedronGeometry args={[0.38, 1]} />
        <meshStandardMaterial color="#2f855a" roughness={0.85} flatShading />
      </instancedMesh>
    </>
  );
}

function Parque() {
  const [cx, cz] = centroReferente("park");
  return (
    <group>
      <mesh position={[cx, 0.07, cz]} receiveShadow>
        <boxGeometry args={[BLOQUE + 0.36, 0.14, BLOQUE + 0.36]} />
        <meshStandardMaterial color="#8b95a1" roughness={0.9} />
      </mesh>
      <mesh position={[cx, 0.145, cz]} receiveShadow>
        <boxGeometry args={[BLOQUE - 0.1, 0.02, BLOQUE - 0.1]} />
        <meshStandardMaterial color="#4d8a4f" roughness={1} />
      </mesh>
      {[0, Math.PI / 2].map((r) => (
        <mesh key={r} position={[cx, 0.16, cz]} rotation={[0, r, 0]} receiveShadow>
          <boxGeometry args={[BLOQUE - 0.1, 0.02, 0.36]} />
          <meshStandardMaterial color="#d6c7a1" roughness={1} />
        </mesh>
      ))}
      {/* Kiosco */}
      <mesh position={[cx, 0.24, cz]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.78, 0.18, 8]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.7} />
      </mesh>
      {Array.from({ length: 8 }, (_, k) => {
        const a = (k / 8) * Math.PI * 2;
        return (
          <mesh key={k} position={[cx + Math.cos(a) * 0.6, 0.62, cz + Math.sin(a) * 0.6]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.62, 6]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
        );
      })}
      <mesh position={[cx, 1.08, cz]} castShadow>
        <coneGeometry args={[0.86, 0.46, 8]} />
        <meshStandardMaterial color="#15803d" roughness={0.6} />
      </mesh>
      <Arboles pts={TRONCOS_PARQUE} />
      <Etiqueta pos={[cx, 1.75, cz]} col="#4ade80aa" fs={10.5} df={14}>
        <i className="fa-solid fa-tree" style={{ color: "#4ade80" }} />
        park
      </Etiqueta>
    </group>
  );
}

function ParadaAutobus({ resaltado, etiqueta }: { resaltado: boolean; etiqueta: boolean }) {
  const [x, z] = centroReferente("busstop");
  return (
    <group position={[x + 0.35, 0.14, z]}>
      <mesh position={[0, 0.38, 0.14]} castShadow>
        <boxGeometry args={[0.8, 0.62, 0.03]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.55} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[0.9, 0.05, 0.36]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
      </mesh>
      <mesh position={[0.52, 0.5, -0.05]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0.52, 1.0, -0.05]}>
        <circleGeometry args={[0.13, 20]} />
        <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={resaltado ? 1.2 : 0.4} side={THREE.DoubleSide} />
      </mesh>
      {(etiqueta || resaltado) && (
      <Etiqueta pos={[-0.35, 0.3, -0.45]} col={resaltado ? "#60a5fa" : "#60a5faaa"} fs={resaltado ? 12.5 : 10} df={14} z={resaltado ? 30 : 20}>
        <i className="fa-solid fa-bus" style={{ color: "#60a5fa" }} />
        bus stop
      </Etiqueta>
      )}
    </group>
  );
}

function Letreros({ ambosExtremos }: { ambosExtremos: boolean }) {
  const lejos = LIMITE + 1.5;
  return (
    <>
      {CALLES.map((c) => {
        const w = nodoW(c.idx);
        // En el mapa basta un letrero por calle (sur y oeste); de cerca se ponen en los dos extremos.
        const ends: Pt[] = (c.eje === "v" ? [[w, 0, lejos], [w, 0, -lejos]] : [[-lejos, 0, w], [lejos, 0, w]]).slice(0, ambosExtremos ? 2 : 1) as Pt[];
        return ends.map((p, k) => (
          <group key={`${c.id}-${k}`}>
            <mesh position={[p[0], 0.4, p[2]]}>
              <cylinderGeometry args={[0.025, 0.025, 0.8, 6]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            <Etiqueta pos={[p[0], 1.0, p[2]]} col="#16a34a" fs={10.5} df={14}>
              <span style={{ color: "#86efac", fontSize: 10 }}>{c.eje === "v" ? "↕" : "↔"}</span>
              {c.corto}
            </Etiqueta>
          </group>
        ));
      })}
      <group position={[-LIMITE - 2.6, 0.05, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.7, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.06, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.2, 0.7, 3]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
        </mesh>
        <Etiqueta pos={[0, 0.9, -0.2]} col="#ef4444" fs={12} df={16}>
          N
        </Etiqueta>
      </group>
    </>
  );
}

function Barrio({ resaltar, cerca, sinEtiqueta }: { resaltar: Referente[]; cerca: boolean; sinEtiqueta: Referente | null }) {
  return (
    <group>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[64, 0.1, 64]} />
        <meshStandardMaterial color="#1d2a24" roughness={1} />
      </mesh>
      <mesh position={[0, 0.0, 0]} receiveShadow>
        <boxGeometry args={[LIMITE * 2 + 0.4, 0.02, LIMITE * 2 + 0.4]} />
        <meshStandardMaterial color="#303845" roughness={0.95} />
      </mesh>
      <Instancias items={RAYAS} color="#e5e7eb" y={0.015} />
      <Instancias items={LINEAS} color="#facc15" y={0.015} />
      {Array.from({ length: 9 }, (_, i) => {
        const bx = i % 3;
        const bz = Math.floor(i / 3);
        if (bx === PARQUE.bx && bz === PARQUE.bz) return null;
        return (
          <mesh key={i} position={[nodoW(bx) + PASO / 2, 0.07, nodoW(bz) + PASO / 2]} receiveShadow castShadow>
            <boxGeometry args={[BLOQUE + 0.36, 0.14, BLOQUE + 0.36]} />
            <meshStandardMaterial color="#8b95a1" roughness={0.9} />
          </mesh>
        );
      })}
      <Casas />
      {LUGARES.map((l) => (
        <Edificio key={l.id} l={l} resaltado={resaltar.includes(l.id)} sinEtiqueta={sinEtiqueta === l.id} />
      ))}
      <Parque />
      <ParadaAutobus resaltado={resaltar.includes("busstop")} etiqueta={cerca} />
      {SEMAFOROS.map(([x, z], k) => (
        <Semaforo key={k} x={x} z={z} fase={k * 3} />
      ))}
      <Arboles pts={ARBOLES_FUERA} escala={1.3} />
      <Letreros ambosExtremos={cerca} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * PERSONAJES Y MARCAS
 * ════════════════════════════════════════════════════════════════════════ */

function Cuerpo({ color, piernaI, piernaD, brazoI, brazoD }: { color: string; piernaI?: RefObject<THREE.Group | null>; piernaD?: RefObject<THREE.Group | null>; brazoI?: RefObject<THREE.Group | null>; brazoD?: RefObject<THREE.Group | null> }) {
  return (
    <group scale={0.62}>
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
      </group>
      <mesh position={[0, 0.82, -0.2]} castShadow>
        <boxGeometry args={[0.28, 0.34, 0.12]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.16, 18, 14]} />
        <meshStandardMaterial color="#e8b894" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.165, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3f2a1d" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Caminante({
  puntos,
  animKey,
  color,
  nombre,
  burbuja,
  grupoRef,
  llegadosRef,
  ayudaLados,
}: {
  puntos: Punto[];
  animKey: number;
  color: string;
  nombre: string;
  burbuja: string | null;
  grupoRef: RefObject<THREE.Group | null>;
  llegadosRef: RefObject<number>;
  ayudaLados: boolean;
}) {
  const piernaI = useRef<THREE.Group>(null);
  const piernaD = useRef<THREE.Group>(null);
  const brazoI = useRef<THREE.Group>(null);
  const brazoD = useRef<THREE.Group>(null);
  const idx = useRef(0);
  const previos = useRef<Punto[] | null>(null);
  const clave = useRef<number | null>(null);
  const fase = useRef(0);

  useFrame((_, dt) => {
    const g = grupoRef.current;
    if (!g || puntos.length === 0) return;
    if (clave.current !== animKey) {
      const p0 = puntos[0]!;
      g.position.set(p0.x, 0.14, p0.z);
      g.rotation.y = p0.ang;
      idx.current = Math.min(1, puntos.length - 1);
      llegadosRef.current = 0;
      clave.current = animKey;
      previos.current = puntos;
    } else if (previos.current !== puntos) {
      const p0 = previos.current;
      const extiende = !!p0 && puntos.length >= p0.length && p0.every((q, i) => q.x === puntos[i]!.x && q.z === puntos[i]!.z && q.ang === puntos[i]!.ang);
      if (!extiende) {
        const u = puntos[puntos.length - 1]!;
        g.position.set(u.x, 0.14, u.z);
        g.rotation.y = u.ang;
        idx.current = puntos.length - 1;
        llegadosRef.current = puntos.length - 1;
      }
      previos.current = puntos;
    }
    const obj = puntos[Math.min(idx.current, puntos.length - 1)]!;
    const dx = obj.x - g.position.x;
    const dz = obj.z - g.position.z;
    const dist = Math.hypot(dx, dz);
    let camina = false;
    let angObj = obj.ang;
    if (dist > 0.02) {
      const paso = Math.min(dist, 2.4 * Math.min(dt, 0.1));
      g.position.x += (dx / dist) * paso;
      g.position.z += (dz / dist) * paso;
      angObj = Math.atan2(dx, dz);
      camina = true;
    }
    let dif = angObj - g.rotation.y;
    dif = Math.atan2(Math.sin(dif), Math.cos(dif));
    g.rotation.y += dif * suave(dt, camina ? 0.3 : 0.14);
    if (!camina && Math.abs(dif) < 0.04 && idx.current < puntos.length) {
      llegadosRef.current = Math.max(llegadosRef.current, idx.current);
      if (idx.current < puntos.length - 1) idx.current += 1;
    }
    fase.current += camina ? dt * 9 : 0;
    const s = camina ? Math.sin(fase.current) * 0.6 : 0;
    if (piernaI.current) piernaI.current.rotation.x = s;
    if (piernaD.current) piernaD.current.rotation.x = -s;
    if (brazoI.current) brazoI.current.rotation.x = -s * 0.8;
    if (brazoD.current) brazoD.current.rotation.x = s * 0.8;
    g.position.y = 0.14 + (camina ? Math.abs(Math.sin(fase.current)) * 0.03 : 0);
  });

  const p0 = puntos[0] ?? { x: 0, z: 0, ang: 0 };
  return (
    <group ref={grupoRef} position={[p0.x, 0.14, p0.z]} rotation={[0, p0.ang, 0]}>
      <Cuerpo color={color} piernaI={piernaI} piernaD={piernaD} brazoI={brazoI} brazoD={brazoD} />
      {/* Flecha de rumbo en el piso */}
      <mesh position={[0, 0.02, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.16, 0.34, 3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.38, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      {ayudaLados && (
        <>
          <Etiqueta pos={[0.62, 0.55, 0]} col="#fbbf24" fs={11} df={11} z={25}>
            left
          </Etiqueta>
          <Etiqueta pos={[-0.62, 0.55, 0]} col="#22d3ee" fs={11} df={11} z={25}>
            right
          </Etiqueta>
        </>
      )}
      {burbuja ? <Burbuja pos={[0, 1.35, 0]} texto={burbuja} /> : <Etiqueta pos={[0, 1.25, 0]} col={color} fs={11} df={13} z={25}>{nombre}</Etiqueta>}
    </group>
  );
}

function Rastro({ puntos, llegadosRef, color }: { puntos: Punto[]; llegadosRef: RefObject<number>; color: string }) {
  const grupoRef = useRef<THREE.Group>(null);
  const segs = useMemo(
    () =>
      puntos.slice(1).map((b, i) => {
        const a = puntos[i]!;
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        return { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2, largo: Math.hypot(dx, dz), ang: Math.atan2(dx, dz) };
      }),
    [puntos],
  );
  useFrame(() => {
    const g = grupoRef.current;
    if (!g) return;
    g.children.forEach((c, i) => {
      c.visible = llegadosRef.current >= i + 1;
    });
  });
  return (
    <group ref={grupoRef}>
      {segs.map((s, i) => (
        <mesh key={i} position={[s.x, 0.03, s.z]} rotation={[0, s.ang, 0]} visible={false}>
          <boxGeometry args={[0.12, 0.02, Math.max(0.001, s.largo)]} />
          <meshBasicMaterial color={color} transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  );
}

function Baliza({ x, z, color, texto, yTexto = 4.6 }: { x: number; z: number; color: string; texto?: string; yTexto?: number }) {
  const anillo = useRef<THREE.Mesh>(null);
  const haz = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.8) % 1;
    if (anillo.current) {
      anillo.current.scale.setScalar(0.6 + t * 1.2);
      (anillo.current.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - t);
    }
    if (haz.current) (haz.current.material as THREE.MeshBasicMaterial).opacity = 0.16 + 0.06 * Math.sin(clock.elapsedTime * 3);
  });
  return (
    <group position={[x, 0.16, z]}>
      <mesh ref={anillo} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.82, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} depthWrite={false} />
      </mesh>
      <mesh ref={haz} position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 4.4, 24, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {texto && (
        <Etiqueta pos={[0, yTexto, 0]} col={color} fs={11.5} df={14} z={35}>
          <i className="fa-solid fa-location-dot" style={{ color }} />
          {texto}
        </Etiqueta>
      )}
    </group>
  );
}

function MarcaInicio({ e, color }: { e: Estado; color: string }) {
  const x = nodoW(e.x);
  const z = nodoW(e.z);
  return (
    <group position={[x, 0.03, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.05, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
      <Etiqueta pos={[-DIRS[e.h]![1] * 1.4, 0.3, DIRS[e.h]![0] * 1.4]} col={color} fs={10.5} df={16}>
        <i className="fa-solid fa-flag" style={{ color }} />
        START
      </Etiqueta>
    </group>
  );
}

/** Devuelve la cámara a la vista de mapa al salir de la cámara que sigue al personaje. */
function CamaraInicial({ pos, target }: { pos: Pt; target: Pt }) {
  const camera = useThree((st) => st.camera);
  useLayoutEffect(() => {
    camera.position.set(pos[0], pos[1], pos[2]);
    camera.lookAt(target[0], target[1], target[2]);
  }, [camera, pos, target]);
  return null;
}

function CamaraSeguidora({ grupoRef }: { grupoRef: RefObject<THREE.Group | null> }) {
  const mira = useMemo(() => new THREE.Vector3(), []);
  const destino = useMemo(() => new THREE.Vector3(), []);
  const objetivo = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }, dt) => {
    const g = grupoRef.current;
    if (!g) return;
    const fx = Math.sin(g.rotation.y);
    const fz = Math.cos(g.rotation.y);
    destino.set(g.position.x - fx * 4.6, 3.4, g.position.z - fz * 4.6);
    camera.position.lerp(destino, suave(dt, 0.06));
    objetivo.set(g.position.x + fx * 3, 0.5, g.position.z + fz * 3);
    mira.lerp(objetivo, suave(dt, 0.1));
    camera.lookAt(mira);
  });
  return null;
}

/* ════════════════════════════════════════════════════════════════════════
 * MODO 3: relaciones dibujadas
 * ════════════════════════════════════════════════════════════════════════ */

function Linea({ a, b, color }: { a: [number, number]; b: [number, number]; color: string }) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const largo = Math.hypot(dx, dz);
  return (
    <mesh position={[(a[0] + b[0]) / 2, 0.24, (a[1] + b[1]) / 2]} rotation={[0, Math.atan2(dx, dz), 0]}>
      <boxGeometry args={[0.09, 0.04, Math.max(0.001, largo - 0.9)]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

function EscenaDonde({ foco, pregunta, respuesta, relaciones, esquina, modoColor }: { foco: Referente; pregunta: string | null; respuesta: string | null; relaciones: RelacionDibujo[]; esquina: CiudadSceneProps["esquina"]; modoColor: string }) {
  const [fx, fz] = centroReferente(foco);
  // Dónde conversan: sobre la banqueta frente al lugar.
  const frente = foco === "park" || foco === "busstop" ? 0 : LUGARES.find((l) => l.id === foco)!.frente;
  const [dx, dz] = foco === "busstop" ? [0, -1] : DIRS[frente]!;
  const px = fx + dx * (CELDA / 2 + 0.5);
  const pz = fz + dz * (CELDA / 2 + 0.5);
  const lat: [number, number] = [-dz, dx];
  const nodoEsq = (() => {
    if (!esquina) return null;
    const [c1, c2] = esquina.calles.map(calle);
    const v = c1!.eje === "v" ? c1! : c2!;
    const h = c1!.eje === "h" ? c1! : c2!;
    if (v.eje !== "v" || h.eje !== "h") return null;
    return [nodoW(v.idx), nodoW(h.idx)] as [number, number];
  })();
  return (
    <group>
      <Baliza x={fx} z={fz} color={modoColor} />
      <group position={[px + lat[0] * 0.45, 0.14, pz + lat[1] * 0.45]} rotation={[0, Math.atan2(-lat[0], -lat[1]), 0]}>
        <Cuerpo color="#a78bfa" />
        {pregunta && <Burbuja pos={[0, 2.25, 0]} texto={pregunta} df={7} />}
      </group>
      <group position={[px - lat[0] * 0.45, 0.14, pz - lat[1] * 0.45]} rotation={[0, Math.atan2(lat[0], lat[1]), 0]}>
        <Cuerpo color="#f472b6" />
        {respuesta && <Burbuja pos={[0, 1.15, 0]} texto={respuesta} col="#1e1b4b" df={7} />}
      </group>
      {relaciones.map((r, k) => {
        const [rx, rz] = centroReferente(r.ref);
        const col = r.ok ? OK : NO;
        return (
          <group key={`${r.ref}-${k}`}>
            <Linea a={[fx, fz]} b={[rx, rz]} color={col} />
            <mesh position={[rx, 0.2, rz]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r.ref === "park" ? 1.6 : 0.62, r.ref === "park" ? 1.75 : 0.74, 40]} />
              <meshBasicMaterial color={col} transparent opacity={0.9} />
            </mesh>
          </group>
        );
      })}
      {esquina && nodoEsq && (
        <group>
          <Linea a={[fx, fz]} b={nodoEsq} color={esquina.ok ? OK : NO} />
          <mesh position={[nodoEsq[0], 0.05, nodoEsq[1]]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.9, 1.05, 40]} />
            <meshBasicMaterial color={esquina.ok ? OK : NO} transparent opacity={0.9} />
          </mesh>
          <Etiqueta pos={[nodoEsq[0], 0.5, nodoEsq[1]]} col={esquina.ok ? OK : NO} fs={11} df={12} z={30}>
            {calle(esquina.calles[0]).corto} & {calle(esquina.calles[1]).corto}
          </Etiqueta>
        </group>
      )}
      {esquina && !nodoEsq && (
        <Etiqueta pos={[fx, 2.8, fz]} col={NO} fs={11} df={12} z={30}>
          Esas dos calles no se cruzan
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function CiudadDireccionesInglesScene(p: CiudadSceneProps) {
  const { vista, modoColor, resetNonce, camSeguir } = p;
  const grupoRef = useRef<THREE.Group>(null);
  const llegadosRef = useRef(0);
  const foco = p.foco;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "donde") {
      const [fx, fz] = centroReferente(foco);
      return { pos: [fx + 1.2, 8.2, fz + 8.8], target: [fx, 0.4, fz + 0.6] };
    }
    return { pos: [0, 22.5, 20.5], target: [0, 0, 2.6] };
  }, [vista, foco]);
  const resaltar = useMemo<Referente[]>(() => {
    if (vista === "donde") return [foco, ...p.relaciones.map((r) => r.ref)];
    return [];
  }, [vista, foco, p.relaciones]);
  const seguirActivo = vista !== "donde" && camSeguir;
  const destinoXZ = p.destino ? centroReferente(p.destino) : null;

  return (
    <Canvas key={`${vista}-${vista === "donde" ? foco : ""}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#08121f"]} />
      <fog attach="fog" args={["#08121f", 30, 62]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[9, 16, 7]}
        intensity={1.25}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0005}
      />
      <pointLight position={[-10, 5, 8]} intensity={0.35} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.4} position={[0, 6, -8]} scale={[14, 6, 1]} color="#fde68a" />
        <Lightformer form="rect" intensity={0.7} position={[-8, 1, 6]} scale={[8, 6, 1]} color={modoColor} />
      </Environment>

      <EscalaEtiquetas.Provider value={seguirActivo ? 0.3 : vista === "donde" ? 1 : 0}>
      <Barrio resaltar={resaltar} cerca={vista === "donde" || seguirActivo} sinEtiqueta={vista !== "donde" && !seguirActivo ? p.destino : null} />

      {vista !== "donde" && (
        <>
          <MarcaInicio e={p.inicio} color={modoColor} />
          <Rastro puntos={p.puntos} llegadosRef={llegadosRef} color={p.colorPersona} />
          <Caminante puntos={p.puntos} animKey={p.animKey} color={p.colorPersona} nombre={p.nombre} burbuja={p.burbuja} grupoRef={grupoRef} llegadosRef={llegadosRef} ayudaLados={p.ayudaLados} />
          {p.destino && destinoXZ && <Baliza x={destinoXZ[0]} z={destinoXZ[1]} color={p.destinoColor} texto={`the ${nombreEn(p.destino)}`} yTexto={p.destino === "park" ? 1.6 : p.destino === "busstop" ? 0.3 : alturaEtiqueta(LUGARES.find((l) => l.id === p.destino)!)} />}
          {seguirActivo && <CamaraSeguidora grupoRef={grupoRef} />}
        </>
      )}
      </EscalaEtiquetas.Provider>
      {vista === "donde" && <EscenaDonde foco={foco} pregunta={p.pregunta} respuesta={p.respuesta} relaciones={p.relaciones} esquina={p.esquina} modoColor={modoColor} />}

      {!seguirActivo && <CamaraInicial pos={cam.pos} target={cam.target} />}
      {!seguirActivo && (
        <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={36} maxPolarAngle={Math.PI * 0.46} minPolarAngle={Math.PI * 0.04} target={cam.target} />
      )}
      <EffectComposer>
        <Bloom intensity={0.35} luminanceThreshold={0.7} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}

