"use client";

/**
 * Escena 3D del laboratorio "Contaminantes químicos y plásticos" (CNEYT-IV,
 * progresión 10). Tres vistas:
 *
 *  - oceano: corte de una costa (playa, columna de agua y fondo) con el sol y
 *    su radiación UV; el plástico cae, flota o se hunde según su densidad, se
 *    fragmenta con el tiempo y una red de manta barre la superficie.
 *  - cadena: pirámide de niveles tróficos sobre el agua; el contaminante sube
 *    de nivel en nivel y cada anillo se enciende según su concentración.
 *  - destino: el residuo viaja a la planta de reciclaje, la composta, el
 *    relleno o el río, y se ve qué le pasa.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import {
  type Modo,
  type ResinaId,
  type Lugar,
  type ContamId,
  type TipoOrg,
  type ObjetoId,
  type DestinoId,
  RESINAS,
  estadoPlastico,
  CLASE_DEF,
  DENS_MAR,
  MALLA_MM,
  CADENAS,
  ppmNivel,
  ppmTxt,
  factorTxt,
  LIMITE_HG,
  OBJETOS,
  DESTINOS,
  desenlace,
  desintegracionPla,
  RESULTADO_DEF,
  num,
} from "./contaminantes-plasticos-data";

export type VistaContaminantes = Modo;

export interface ContaminantesSceneProps {
  vista: VistaContaminantes;
  modoColor: string;
  resetNonce: number;
  // Océano
  resinaId: ResinaId;
  lugar: Lugar;
  tirado: boolean;
  tAnios: number;
  bio: boolean;
  redNonce: number;
  // Cadena
  contamId: ContamId;
  paso: number;
  edadAtun: number;
  ingesta: number;
  // Destino
  objetoId: ObjetoId;
  destinoId: DestinoId | null;
  envioNonce: number;
  tempComposta: number;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
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

/** Pseudoaleatorio determinista para colocar piezas (no usa Math.random). */
function hash(i: number, k: number): number {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. PLÁSTICO EN EL MAR
 * ════════════════════════════════════════════════════════════════════════ */

const X_ORILLA = -3.15;
const Y_FONDO = -3.2;
const ANCHO_Z = 4.4;

const GEO_PLAYA = (() => {
  const s = new THREE.Shape();
  s.moveTo(-7.2, -3.45);
  s.lineTo(-7.2, 0.45);
  s.lineTo(-3.5, 0.3);
  s.lineTo(0.8, -3.45);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: ANCHO_Z, bevelEnabled: false });
  g.translate(0, 0, -ANCHO_Z / 2);
  return g;
})();

const GEO_OLAS = new THREE.PlaneGeometry(9.8, ANCHO_Z, 48, 18);
const OLAS_BASE = Float32Array.from(GEO_OLAS.attributes.position!.array as ArrayLike<number>);

/** Altura de la arena en x (parte alta de la playa). */
function yArena(x: number): number {
  if (x <= -3.5) return 0.45 + ((x + 7.2) / 3.7) * -0.15;
  return 0.3 - ((x + 3.5) / 4.3) * 3.75;
}

const RAYOS = [-5.8, -4.6, -3.4, 0.2, 2.6].map((xf) => {
  const a = new THREE.Vector3(-5.6, 3.4, -2.2);
  const b = new THREE.Vector3(xf, xf < -3 ? yArena(xf) : 0, 0.3);
  return {
    mid: a.clone().add(b).multiplyScalar(0.5),
    len: a.distanceTo(b),
    q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()),
  };
});

const MAX_FRAG = 260;
const GEO_FRAG = new THREE.IcosahedronGeometry(1, 0);

function ObjetoPlastico({ id, color }: { id: ResinaId; color: string }) {
  const mat = <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} transparent={id === "pet" || id === "pp"} opacity={id === "pet" ? 0.72 : id === "pp" ? 0.85 : 1} />;
  if (id === "pet")
    return (
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.62, 24]} />
          {mat}
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.2, 0.18, 20]} />
          {mat}
        </mesh>
        <mesh position={[0, 0.53, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.08, 16]} />
          <meshStandardMaterial color="#2563eb" roughness={0.4} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.205, 0.205, 0.2, 24, 1, true]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  if (id === "pead")
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[0.42, 0.62, 0.34]} />
          {mat}
        </mesh>
        <mesh position={[0, 0.39, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 0.14, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
        <mesh position={[0.15, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.03, 8, 20]} />
          {mat}
        </mesh>
      </group>
    );
  if (id === "pvc")
    return (
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.9, 24, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    );
  if (id === "pebd")
    return (
      <mesh scale={[0.55, 0.2, 0.45]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={color} roughness={0.6} flatShading transparent opacity={0.85} />
      </mesh>
    );
  if (id === "pp")
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[0.62, 0.26, 0.42]} />
          {mat}
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.66, 0.05, 0.46]} />
          <meshStandardMaterial color="#6366f1" roughness={0.4} />
        </mesh>
      </group>
    );
  if (id === "ps")
    return (
      <group>
        {[-0.14, 0, 0.14].map((z, k) => (
          <group key={k} position={[0, 0, z]} rotation={[0, (k - 1) * 0.25, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.55, 0.03, 0.05]} />
              <meshStandardMaterial color={color} roughness={0.3} />
            </mesh>
            <mesh position={[0.34, 0, 0]}>
              <boxGeometry args={[0.16, 0.035, 0.1]} />
              <meshStandardMaterial color={color} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    );
  // Red de pesca de nailon
  return (
    <group>
      {Array.from({ length: 7 }, (_, k) => (
        <mesh key={`a${k}`} position={[-0.6 + k * 0.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.9, 5]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
      {Array.from({ length: 5 }, (_, k) => (
        <mesh key={`b${k}`} position={[0, 0, -0.4 + k * 0.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 1.25, 5]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.02, -0.45]}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color="#f97316" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function EscenaOceano({ resinaId, lugar, tirado, tAnios, bio, redNonce, modoColor }: { resinaId: ResinaId; lugar: Lugar; tirado: boolean; tAnios: number; bio: boolean; redNonce: number; modoColor: string }) {
  const r = RESINAS.find((x) => x.id === resinaId) ?? RESINAS[0]!;
  const e = estadoPlastico(r, lugar, tirado ? tAnios : 0, bio);
  const frac = e.L / r.L0;
  const clase = CLASE_DEF[e.clase];

  const objeto = useRef<THREE.Group>(null);
  const etiqueta = useRef<THREE.Group>(null);
  const frag = useRef<THREE.InstancedMesh>(null);
  const olas = useRef<THREE.Mesh>(null);
  const rayos = useRef<THREE.Group>(null);
  const red = useRef<THREE.Group>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const colFrag = useMemo(() => new THREE.Color(), []);
  const colBase = useMemo(() => new THREE.Color((RESINAS.find((x) => x.id === resinaId) ?? RESINAS[0]!).color), [resinaId]);
  const colViejo = useMemo(() => new THREE.Color("#fde68a"), []);
  const pos = useRef(new THREE.Vector3(lugar === "playa" ? -5.2 : 2.6, 2.4, 0.2));
  const vel = useRef(0);
  const ultimaRed = useRef(redNonce);
  const tRed = useRef(99);
  const nVis = useRef(0);
  const etqRed = useRef<HTMLDivElement>(null);

  const nFrag = e.pedazos < 2 ? 0 : Math.min(MAX_FRAG, Math.round(30 * Math.log10(e.pedazos)));
  const tamVis = Math.min(0.2, Math.max(0.02, 0.02 + 0.18 * clamp01((Math.log10(e.L) + 3) / (Math.log10(r.L0) + 3)) ** 1.6));
  const spread = clamp01(Math.log10(Math.max(1, e.pedazos)) / 3.2);
  const xDestino = lugar === "playa" ? -5.2 : 2.6;
  const yDestino = !tirado ? 2.4 : e.zona === "playa" ? yArena(-5.2) + 0.2 : e.zona === "superficie" ? 0.05 : Y_FONDO + 0.18;
  const envejecido = clamp01(1 - frac);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const p = pos.current;
    p.x += (xDestino - p.x) * suave(dt, 0.08);
    if (!tirado) {
      p.y += (2.4 - p.y) * suave(dt, 0.08);
      vel.current = 0;
    } else if (p.y > yDestino) {
      // Cae con gravedad en el aire; dentro del agua baja despacio.
      const enAgua = p.y < 0.05;
      vel.current = enAgua ? Math.min(vel.current + dt * 2, 0.9) : vel.current + dt * 9.8;
      if (enAgua && vel.current > 0.9) vel.current = 0.9;
      p.y = Math.max(yDestino, p.y - vel.current * Math.min(dt, 0.1));
    } else {
      p.y += (yDestino - p.y) * suave(dt, 0.1);
      vel.current = 0;
    }
    const flotando = tirado && e.zona === "superficie";
    if (objeto.current) {
      objeto.current.position.set(p.x, p.y + (flotando ? Math.sin(t * 1.6) * 0.04 : 0), p.z);
      objeto.current.rotation.y = tirado ? 0.4 : t * 0.6;
      objeto.current.rotation.x = flotando ? Math.sin(t * 1.3) * 0.08 : 0;
      const s = 0.45 + 0.55 * frac;
      objeto.current.scale.setScalar(s);
      objeto.current.visible = frac > 0.1;
    }
    if (etiqueta.current) etiqueta.current.position.set(p.x, p.y + 0.75, p.z + 0.2);

    if (olas.current) {
      const arr = GEO_OLAS.attributes.position!.array as Float32Array;
      for (let i = 0; i < arr.length; i += 3) {
        const x = OLAS_BASE[i]!;
        const y = OLAS_BASE[i + 1]!;
        arr[i + 2] = Math.sin(x * 1.4 + t * 1.6) * 0.035 + Math.cos(y * 2.1 + t * 1.1) * 0.025;
      }
      GEO_OLAS.attributes.position!.needsUpdate = true;
    }
    if (rayos.current)
      rayos.current.children.forEach((c, k) => {
        const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
        m.opacity = 0.18 + 0.12 * Math.sin(t * 2 + k);
      });

    // Red de manta: barre la superficie cuando cambia redNonce.
    if (redNonce !== ultimaRed.current) {
      ultimaRed.current = redNonce;
      tRed.current = 0;
    }
    tRed.current += dt;
    if (red.current) {
      const k = clamp01(tRed.current / 3.2);
      red.current.visible = tirado && lugar === "mar";
      red.current.position.set(-2.4 + k * 8.4, 0.02, -0.3);
    }
    if (etqRed.current) etqRed.current.style.opacity = tirado && lugar === "mar" && tRed.current < 3.2 ? "1" : "0";

    const mesh = frag.current;
    if (mesh) {
      nVis.current += (nFrag - nVis.current) * suave(dt, 0.08);
      const n = Math.round(nVis.current);
      colFrag.copy(colBase).lerp(colViejo, envejecido * 0.55);
      for (let i = 0; i < MAX_FRAG; i++) {
        if (i >= n) {
          obj.scale.setScalar(0.0001);
          obj.position.set(0, -50, 0);
        } else {
          const u = hash(i, 1);
          const v = hash(i, 2);
          const w = hash(i, 3);
          let x: number;
          let y: number;
          const z = -1.8 + w * 3.6;
          if (e.zona === "playa") {
            x = -6.6 + u * 2.9;
            y = yArena(x) + 0.03;
          } else if (e.zona === "superficie") {
            x = X_ORILLA + 0.6 + u * 8.2;
            y = e.L < 1 ? -v * v * 1.6 : 0.03 + Math.sin(t * 1.6 + u * 9) * 0.03;
          } else {
            x = -0.2 + u * 6.4;
            y = e.L < 1 ? Y_FONDO + 0.04 + v * v * 2.6 : Y_FONDO + 0.04;
          }
          const px = p.x + (x - p.x) * spread;
          const py = p.y + (y - p.y) * spread;
          const pz = p.z + (z - p.z) * spread;
          obj.position.set(px, py, pz);
          obj.rotation.set(u * 6, v * 6 + t * 0.2 * (e.zona === "superficie" ? 1 : 0), w * 6);
          obj.scale.set(tamVis * (0.6 + v * 0.8), tamVis * (0.3 + w * 0.4), tamVis * (0.6 + u * 0.8));
        }
        obj.updateMatrix();
        mesh.setMatrixAt(i, obj.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      (mesh.material as THREE.MeshStandardMaterial).color.copy(colFrag);
      (mesh.material as THREE.MeshStandardMaterial).emissive.copy(colFrag);
    }
  });

  return (
    <group position={[-0.2, -0.3, 0]}>
      {/* Playa */}
      <mesh geometry={GEO_PLAYA} receiveShadow>
        <meshStandardMaterial color="#d8b778" roughness={0.95} />
      </mesh>
      {/* Fondo marino */}
      <mesh position={[2.8, Y_FONDO - 0.12, 0]} receiveShadow>
        <boxGeometry args={[8.2, 0.24, ANCHO_Z]} />
        <meshStandardMaterial color="#6b5a3e" roughness={1} />
      </mesh>
      {[0.6, 2.2, 3.9, 5.5].map((x, k) => (
        <mesh key={x} position={[x, Y_FONDO + 0.1, -1.4 + (k % 2) * 2.4]}>
          <dodecahedronGeometry args={[0.18 + (k % 3) * 0.08, 0]} />
          <meshStandardMaterial color="#57534e" roughness={1} flatShading />
        </mesh>
      ))}
      {/* Columna de agua */}
      <mesh position={[1.7, Y_FONDO / 2, 0]}>
        <boxGeometry args={[9.8, -Y_FONDO, ANCHO_Z - 0.08]} />
        <meshStandardMaterial color="#0284c7" transparent opacity={0.2} roughness={0.1} depthWrite={false} />
      </mesh>
      <mesh position={[2.9, Y_FONDO + 0.7, 0]}>
        <boxGeometry args={[7.4, 1.4, ANCHO_Z - 0.12]} />
        <meshStandardMaterial color="#082f49" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh ref={olas} geometry={GEO_OLAS} position={[1.7, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.45} roughness={0.08} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Sol y radiación UV */}
      <mesh position={[-5.6, 3.4, -2.2]}>
        <sphereGeometry args={[0.42, 24, 18]} />
        <meshBasicMaterial color="#fde047" toneMapped={false} />
      </mesh>
      <group ref={rayos}>
        {RAYOS.map((ry, k) => (
          <mesh key={k} position={ry.mid} quaternion={ry.q}>
            <cylinderGeometry args={[0.018, 0.05, ry.len, 6, 1, true]} />
            <meshBasicMaterial color="#c084fc" transparent opacity={0.25} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <Etiqueta pos={[-3.9, 3.55, -2.2]} df={11} col="#c084fcaa" fs={11}>
        <i className="fa-solid fa-sun" style={{ color: "#fde047" }} />
        Radiación UV
      </Etiqueta>

      {/* Zonas */}
      <Etiqueta pos={[-5.6, 1.15, 1.9]} df={11} col={e.zona === "playa" && tirado ? `${modoColor}cc` : undefined} fs={11}>
        <i className="fa-solid fa-umbrella-beach" style={{ color: "#fbbf24" }} />
        Playa · sol, calor y arena
      </Etiqueta>
      <Etiqueta pos={[5.2, 0.62, 1.9]} df={11} col={e.zona === "superficie" && tirado ? `${modoColor}cc` : undefined} fs={11}>
        <i className="fa-solid fa-water" style={{ color: "#38bdf8" }} />
        Superficie
      </Etiqueta>
      <Etiqueta pos={[5.2, Y_FONDO + 0.55, 1.9]} df={11} col={e.zona === "fondo" && tirado ? `${modoColor}cc` : undefined} fs={11}>
        <i className="fa-solid fa-moon" style={{ color: "#94a3b8" }} />
        Fondo · oscuro y frío
      </Etiqueta>
      <Etiqueta pos={[5.2, -1.3, 1.9]} df={11} fs={10.5}>
        Agua de mar · {num(DENS_MAR, 3)} g/cm³
      </Etiqueta>

      {/* El plástico */}
      <group ref={objeto}>
        <ObjetoPlastico id={r.id} color={r.color} />
      </group>
      <group ref={etiqueta}>
        <Html center distanceFactor={10} zIndexRange={[22, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, background: "rgba(4,10,22,0.88)", border: `1px solid ${clase.color}`, color: "#fff", fontSize: 11.5, fontWeight: 800, whiteSpace: "nowrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${r.color}`, fontSize: 10.5 }}>{r.codigo}</span>
            {r.sigla} · {num(r.densidad, 2)} g/cm³
            {tirado && <span style={{ color: clase.color }}>· {clase.etq.toLowerCase()}</span>}
          </div>
        </Html>
      </group>
      <instancedMesh ref={frag} args={[GEO_FRAG, undefined, MAX_FRAG]} frustumCulled={false}>
        <meshStandardMaterial color={r.color} roughness={0.5} emissive={r.color} emissiveIntensity={0.18} flatShading />
      </instancedMesh>

      {/* Red de manta */}
      <group ref={red} visible={false}>
        {[
          [0, 0.18, 0, 0.05, 0.05, 1.6],
          [0, -0.18, 0, 0.05, 0.05, 1.6],
          [0, 0, 0.8, 0.05, 0.4, 0.05],
          [0, 0, -0.8, 0.05, 0.4, 0.05],
        ].map((b, k) => (
          <mesh key={k} position={[b[0]!, b[1]!, b[2]!]}>
            <boxGeometry args={[b[3]!, b[4]!, b[5]!]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[-0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.55, 1.8, 16, 4, true]} />
          <meshBasicMaterial color="#f8fafc" wireframe transparent opacity={0.55} />
        </mesh>
        <Html position={[0, 0.72, 0]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div ref={etqRed} style={{ opacity: 0, display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: "rgba(4,10,22,0.86)", border: `1px solid ${modoColor}aa`, color: "#fff", fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap" }}>
            <i className="fa-solid fa-border-all" style={{ color: modoColor }} />
            Red de manta · malla {num(MALLA_MM, 3)} mm
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. BIOMAGNIFICACIÓN
 * ════════════════════════════════════════════════════════════════════════ */

const SEP_NIVEL = 1.12;
const Y_POZA = -0.55;
const MAX_PUNTOS = 70;
const GEO_PUNTO = new THREE.SphereGeometry(1, 8, 6);
const GEO_CUERPO_PEZ = new THREE.SphereGeometry(1, 16, 10);
const GEO_COLA_PEZ = (() => {
  const g = new THREE.ConeGeometry(0.5, 1, 4);
  g.rotateZ(Math.PI / 2);
  return g;
})();
const GEO_FITO = new THREE.IcosahedronGeometry(1, 1);
const GEO_ZOO = new THREE.CapsuleGeometry(0.4, 1, 3, 8);

function radioNivel(i: number): number {
  return 3.0 - (i - 1) * 0.5;
}
function yNivel(i: number): number {
  return i === 0 ? Y_POZA : 0.2 + (i - 1) * SEP_NIVEL;
}

/** Color según la concentración (escala logarítmica de 10⁻⁷ a 30 ppm). */
function colorConc(ppm: number, out: THREE.Color): THREE.Color {
  const f = clamp01((Math.log10(ppm) + 7) / 8.5);
  return out.setHSL(0.58 - 0.58 * f, 0.85, 0.55);
}
function hexConc(ppm: number): string {
  return `#${colorConc(ppm, new THREE.Color()).getHexString()}`;
}

function puntosPara(ppm: number): number {
  return Math.min(MAX_PUNTOS, Math.max(3, Math.round(4 + (Math.log10(ppm) + 7) * 7)));
}

const PEZ_DEF: Partial<Record<TipoOrg, { n: number; escala: number; color: string; vel: number }>> = {
  pezChico: { n: 11, escala: 0.2, color: "#cbd5e1", vel: 0.55 },
  pezGrande: { n: 4, escala: 0.38, color: "#4d7c0f", vel: 0.35 },
  atun: { n: 2, escala: 0.46, color: "#1e3a8a", vel: 0.3 },
};

function Cardumen({ tipo, i, escalaExtra }: { tipo: TipoOrg; i: number; escalaExtra: number }) {
  const def = PEZ_DEF[tipo]!;
  const cuerpo = useRef<THREE.InstancedMesh>(null);
  const cola = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const r = radioNivel(i);
  const y = yNivel(i);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const s = def.escala * escalaExtra;
    for (let k = 0; k < def.n; k++) {
      const rr = r * (0.35 + 0.45 * hash(k, i + 7));
      const a = (k / def.n) * Math.PI * 2 + t * def.vel * (k % 2 === 0 ? 1 : 0.8);
      const px = Math.cos(a) * rr;
      const pz = Math.sin(a) * rr;
      const py = y + 0.22 + s * 0.5 + Math.sin(t * 2 + k) * 0.03;
      const th = -a - Math.PI / 2;
      const dx = -Math.sin(a);
      const dz = Math.cos(a);
      obj.position.set(px, py, pz);
      obj.rotation.set(0, th, Math.sin(t * 6 + k) * 0.05);
      obj.scale.set(s, s * 0.42, s * 0.3);
      obj.updateMatrix();
      cuerpo.current?.setMatrixAt(k, obj.matrix);
      obj.position.set(px - dx * s * 1.15, py, pz - dz * s * 1.15);
      obj.rotation.set(0, th + Math.sin(t * 8 + k) * 0.35, 0);
      obj.scale.set(s * 0.55, s * 0.75, s * 0.2);
      obj.updateMatrix();
      cola.current?.setMatrixAt(k, obj.matrix);
    }
    if (cuerpo.current) cuerpo.current.instanceMatrix.needsUpdate = true;
    if (cola.current) cola.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={cuerpo} args={[GEO_CUERPO_PEZ, undefined, def.n]} castShadow frustumCulled={false}>
        <meshStandardMaterial color={def.color} roughness={0.35} metalness={0.45} />
      </instancedMesh>
      <instancedMesh ref={cola} args={[GEO_COLA_PEZ, undefined, def.n]} frustumCulled={false}>
        <meshStandardMaterial color={def.color} roughness={0.4} metalness={0.3} />
      </instancedMesh>
    </>
  );
}

function Plancton({ tipo, i }: { tipo: "fito" | "zoo"; i: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const n = tipo === "fito" ? 46 : 26;
  const r = radioNivel(i);
  const y = yNivel(i);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let k = 0; k < n; k++) {
      const a = hash(k, i) * Math.PI * 2 + (tipo === "zoo" ? t * 0.15 : 0);
      const rr = r * 0.85 * Math.sqrt(hash(k, i + 3));
      obj.position.set(Math.cos(a) * rr, y + 0.2 + hash(k, i + 5) * 0.25 + Math.sin(t * 1.5 + k) * 0.04, Math.sin(a) * rr);
      obj.rotation.set(t * 0.3 + k, k, tipo === "zoo" ? Math.PI / 2 : 0);
      obj.scale.setScalar(tipo === "fito" ? 0.07 : 0.09);
      obj.updateMatrix();
      mesh.current?.setMatrixAt(k, obj.matrix);
    }
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[tipo === "fito" ? GEO_FITO : GEO_ZOO, undefined, n]} frustumCulled={false}>
      <meshStandardMaterial color={tipo === "fito" ? "#4ade80" : "#fcd9a8"} emissive={tipo === "fito" ? "#16a34a" : "#b45309"} emissiveIntensity={0.3} roughness={0.5} transparent opacity={0.92} />
    </instancedMesh>
  );
}

function Aguila({ i }: { i: number }) {
  const g = useRef<THREE.Group>(null);
  const alaI = useRef<THREE.Mesh>(null);
  const alaD = useRef<THREE.Mesh>(null);
  const y = yNivel(i);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (g.current) {
      const a = t * 0.45;
      g.current.position.set(Math.cos(a) * 0.55, y + 0.95 + Math.sin(t * 1.2) * 0.08, Math.sin(a) * 0.55);
      g.current.rotation.y = -a - Math.PI / 2;
    }
    const f = Math.sin(t * 4) * 0.4;
    if (alaI.current) alaI.current.rotation.x = f;
    if (alaD.current) alaD.current.rotation.x = -f;
  });
  return (
    <group ref={g}>
      <mesh scale={[0.32, 0.14, 0.14]} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#5b3a1e" roughness={0.6} />
      </mesh>
      <mesh position={[0.3, 0.06, 0]}>
        <sphereGeometry args={[0.1, 14, 10]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      <mesh position={[0.41, 0.04, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.035, 0.1, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh ref={alaI} position={[0, 0.02, 0.1]}>
        <boxGeometry args={[0.28, 0.02, 0.62]} />
        <meshStandardMaterial color="#3f2a16" roughness={0.6} />
      </mesh>
      <mesh ref={alaD} position={[0, 0.02, -0.1]}>
        <boxGeometry args={[0.28, 0.02, 0.62]} />
        <meshStandardMaterial color="#3f2a16" roughness={0.6} />
      </mesh>
    </group>
  );
}

function PuntosNivel({ i, n, ppm, revelado }: { i: number; n: number; ppm: number; revelado: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const escala = useRef(0);
  const r = i === 0 ? 3.4 : radioNivel(i);
  const y = yNivel(i);
  const col = useMemo(() => colorConc(ppm, new THREE.Color()), [ppm]);
  useFrame(({ clock }, dt) => {
    escala.current += ((revelado ? 1 : 0) - escala.current) * suave(dt, 0.06);
    const t = clock.elapsedTime;
    for (let k = 0; k < MAX_PUNTOS; k++) {
      const a = hash(k, i + 20) * Math.PI * 2 + t * 0.1;
      const rr = r * 0.8 * Math.sqrt(hash(k, i + 21));
      const vis = k < n ? escala.current : 0;
      obj.position.set(Math.cos(a) * rr, y + (i === 0 ? -0.1 : 0.25) + hash(k, i + 22) * 0.45 + Math.sin(t * 2 + k) * 0.03, Math.sin(a) * rr);
      obj.scale.setScalar(Math.max(0.0001, 0.045 * vis));
      obj.updateMatrix();
      mesh.current?.setMatrixAt(k, obj.matrix);
    }
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[GEO_PUNTO, undefined, MAX_PUNTOS]} frustumCulled={false}>
      <meshBasicMaterial color={col} toneMapped={false} />
    </instancedMesh>
  );
}

const N_VUELO = 26;

function EscenaCadena({ contamId, paso, edadAtun, ingesta, modoColor }: { contamId: ContamId; paso: number; edadAtun: number; ingesta: number; modoColor: string }) {
  const c = CADENAS[contamId];
  const niveles = c.niveles;
  const vuelo = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const ultimoPaso = useRef(paso);
  const tVuelo = useRef(99);
  const desde = useRef(0);
  const anillos = useRef<THREE.Group>(null);

  useFrame(({ clock }, dt) => {
    if (paso !== ultimoPaso.current) {
      if (paso > ultimoPaso.current) {
        desde.current = paso - 1;
        tVuelo.current = 0;
      }
      ultimoPaso.current = paso;
    }
    tVuelo.current += dt;
    const k = clamp01(tVuelo.current / 1.5);
    const mesh = vuelo.current;
    if (mesh) {
      const i0 = desde.current;
      const i1 = i0 + 1;
      for (let j = 0; j < N_VUELO; j++) {
        const a0 = hash(j, 40) * Math.PI * 2;
        const r0 = (i0 === 0 ? 3.2 : radioNivel(i0)) * 0.8 * Math.sqrt(hash(j, 41));
        const r1 = radioNivel(i1) * 0.3 * hash(j, 42);
        const kk = clamp01(k * 1.25 - hash(j, 43) * 0.25);
        const e = kk * kk * (3 - 2 * kk);
        const x = Math.cos(a0) * (r0 + (r1 - r0) * e);
        const z = Math.sin(a0) * (r0 + (r1 - r0) * e);
        const y = yNivel(i0) + 0.3 + (yNivel(i1) - yNivel(i0)) * e + Math.sin(e * Math.PI) * 0.7;
        obj.position.set(x, y, z);
        obj.scale.setScalar(k < 1 && kk > 0 && kk < 1 ? 0.05 : 0.0001);
        obj.updateMatrix();
        mesh.setMatrixAt(j, obj.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
    if (anillos.current) {
      anillos.current.children.forEach((ch, idx) => {
        const m = (ch as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.emissiveIntensity = idx + 1 <= paso ? 0.9 + 0.35 * Math.sin(clock.elapsedTime * 2 + idx) : 0.05;
      });
    }
  });

  const factorTotal = paso > 0 && niveles[paso]?.ppm !== null ? (ppmNivel(c, Math.min(paso, niveles.length - 1), edadAtun) ?? 0) / niveles[0]!.ppm! : 0;
  const cima = niveles.length - 1;

  return (
    <group position={[0, -1.45, 0]}>
      {/* Agua */}
      <mesh position={[0, Y_POZA - 0.25, 0]} receiveShadow>
        <cylinderGeometry args={[3.9, 3.9, 0.5, 64]} />
        <meshStandardMaterial color="#0369a1" transparent opacity={0.55} roughness={0.1} />
      </mesh>
      <mesh position={[0, Y_POZA - 0.52, 0]}>
        <cylinderGeometry args={[4.1, 4.1, 0.06, 64]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      <PuntosNivel i={0} n={puntosPara(niveles[0]!.ppm!)} ppm={niveles[0]!.ppm!} revelado />
      <Etiqueta pos={[-3.9, Y_POZA + 0.75, 2.2]} df={11} fs={11} col={`${hexConc(niveles[0]!.ppm!)}aa`}>
        <i className="fa-solid fa-droplet" style={{ color: "#38bdf8" }} />
        {niveles[0]!.etq} · {ppmTxt(niveles[0]!.ppm!)} ppm
      </Etiqueta>

      {/* Niveles tróficos */}
      <group ref={anillos}>
        {niveles.slice(1).map((n, j) => {
          const i = j + 1;
          const ppm = ppmNivel(c, i, edadAtun);
          const col = ppm !== null ? hexConc(ppm) : ingesta > LIMITE_HG ? NO : "#34d399";
          return (
            <mesh key={`an-${contamId}-${i}`} position={[0, yNivel(i) + 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[radioNivel(i), 0.045, 10, 72]} />
              <meshStandardMaterial color={paso >= i ? col : "#334155"} emissive={paso >= i ? col : "#000000"} emissiveIntensity={0.05} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
      {niveles.slice(1).map((n, j) => {
        const i = j + 1;
        const r = radioNivel(i);
        const y = yNivel(i);
        const ppm = ppmNivel(c, i, edadAtun);
        const revelado = paso >= i;
        const previo = ppmNivel(c, i - 1, edadAtun);
        return (
          <group key={`${contamId}-${i}`}>
            <mesh position={[0, y, 0]} receiveShadow castShadow>
              <cylinderGeometry args={[r, r * 1.02, 0.12, 64]} />
              <meshStandardMaterial color={revelado ? "#12314f" : "#0d1b2c"} transparent opacity={0.9} roughness={0.35} metalness={0.2} />
            </mesh>
            {i > 1 && (
              <mesh position={[0, y - SEP_NIVEL / 2, 0]}>
                <cylinderGeometry args={[0.08, 0.08, SEP_NIVEL - 0.1, 10]} />
                <meshStandardMaterial color="#1e293b" roughness={0.6} />
              </mesh>
            )}
            {(n.tipo === "fito" || n.tipo === "zoo") && <Plancton tipo={n.tipo} i={i} />}
            {(n.tipo === "pezChico" || n.tipo === "pezGrande" || n.tipo === "atun") && <Cardumen tipo={n.tipo} i={i} escalaExtra={n.tipo === "atun" ? 0.55 + edadAtun * 0.07 : 1} />}
            {n.tipo === "aguila" && <Aguila i={i} />}
            {n.tipo === "persona" && (
              <group position={[0, y + 0.06, 0]}>
                <mesh position={[0, 0.42, 0]} castShadow>
                  <capsuleGeometry args={[0.16, 0.4, 6, 14]} />
                  <meshStandardMaterial color={modoColor} roughness={0.55} />
                </mesh>
                <mesh position={[0, 0.95, 0]} castShadow>
                  <sphereGeometry args={[0.14, 18, 14]} />
                  <meshStandardMaterial color="#e8b890" roughness={0.6} />
                </mesh>
                <mesh position={[0.3, 0.55, 0.12]}>
                  <cylinderGeometry args={[0.18, 0.14, 0.03, 20]} />
                  <meshStandardMaterial color="#f8fafc" roughness={0.4} />
                </mesh>
                <mesh position={[0.3, 0.59, 0.12]} scale={[0.14, 0.04, 0.06]}>
                  <sphereGeometry args={[1, 12, 8]} />
                  <meshStandardMaterial color="#fca5a5" roughness={0.5} />
                </mesh>
              </group>
            )}
            {ppm !== null && <PuntosNivel i={i} n={puntosPara(ppm)} ppm={ppm} revelado={revelado} />}
            <Html position={[r * 0.72 + 1.15, y + 0.28, r * 0.55]} center distanceFactor={11} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "5px 11px",
                  borderRadius: 999,
                  background: "rgba(4,10,22,0.88)",
                  border: `1px solid ${revelado ? (ppm !== null ? hexConc(ppm) : ingesta > LIMITE_HG ? NO : "#34d399") : "rgba(255,255,255,0.18)"}`,
                  color: revelado ? "#fff" : "rgba(255,255,255,0.55)",
                  fontSize: 11.5,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                {n.etq}
                {revelado && ppm !== null && (
                  <>
                    <span style={{ color: hexConc(ppm) }}>· {ppmTxt(ppm)} ppm</span>
                    {previo !== null && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10.5 }}>×{factorTxt(ppm / previo)}</span>}
                  </>
                )}
                {revelado && ppm === null && <span style={{ color: ingesta > LIMITE_HG ? NO : "#34d399" }}>· {num(ingesta, 2)} µg/kg por semana</span>}
                {!revelado && <span>· ?</span>}
              </div>
            </Html>
          </group>
        );
      })}
      <instancedMesh ref={vuelo} args={[GEO_PUNTO, undefined, N_VUELO]} frustumCulled={false}>
        <meshBasicMaterial color="#fb7185" toneMapped={false} />
      </instancedMesh>
      {paso >= 1 && factorTotal > 0 && (
        <Etiqueta pos={[-3.6, yNivel(Math.min(paso, cima)) + 0.9, 0.4]} df={10} fs={12.5} col={`${modoColor}cc`}>
          <i className="fa-solid fa-arrow-trend-up" style={{ color: modoColor }} />
          {c.etq}: ×{factorTxt(factorTotal)} desde el agua
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. ¿A DÓNDE VA TU RESIDUO?
 * ════════════════════════════════════════════════════════════════════════ */

const INICIO: Pt = [0, 0.55, 1.7];
const ESTACION: Record<DestinoId, Pt> = {
  reciclaje: [-4.3, 0, -0.9],
  composta: [-1.5, 0, -2.4],
  relleno: [1.5, 0, -2.4],
  rio: [4.0, 0, -0.9],
};
const T_VIAJE = 1.6;
const T_PROCESO = 2.6;

function ModeloResiduo({ id }: { id: ObjetoId }) {
  if (id === "pet")
    return (
      <group>
        <mesh castShadow>
          <cylinderGeometry args={[0.17, 0.17, 0.52, 22]} />
          <meshStandardMaterial color="#7dd3fc" transparent opacity={0.75} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <cylinderGeometry args={[0.06, 0.17, 0.16, 18]} />
          <meshStandardMaterial color="#7dd3fc" transparent opacity={0.75} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.07, 14]} />
          <meshStandardMaterial color="#2563eb" />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.175, 0.175, 0.16, 22, 1, true]} />
          <meshStandardMaterial color="#0ea5e9" side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  if (id === "bolsa")
    return (
      <mesh scale={[0.38, 0.3, 0.3]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#e2e8f0" flatShading roughness={0.6} transparent opacity={0.9} />
      </mesh>
    );
  if (id === "unicel" || id === "pla")
    return (
      <mesh castShadow>
        <cylinderGeometry args={[0.22, 0.15, 0.46, 24, 1, true]} />
        <meshStandardMaterial color={id === "pla" ? "#d9f99d" : "#f8fafc"} transparent={id === "pla"} opacity={id === "pla" ? 0.7 : 1} roughness={id === "pla" ? 0.2 : 0.9} side={THREE.DoubleSide} />
      </mesh>
    );
  if (id === "multicapa")
    return (
      <group>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.46, 0.2]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.02, 0.101]}>
          <planeGeometry args={[0.22, 0.2]} />
          <meshStandardMaterial color="#16a34a" roughness={0.6} />
        </mesh>
        <mesh position={[0.08, 0.32, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>
    );
  return (
    <group>
      {[0, 1, 2, 3].map((k) => (
        <mesh key={k} position={[Math.cos(k * 1.7) * 0.14, 0.02 + k * 0.03, Math.sin(k * 1.7) * 0.14]} rotation={[k, k * 0.7, 0]} scale={[0.2, 0.06, 0.12]} castShadow>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color={k % 2 === 0 ? "#fb923c" : "#facc15"} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

const N_HOJUELAS = 36;

function EscenaDestino({ objetoId, destinoId, envioNonce, tempComposta, modoColor }: { objetoId: ObjetoId; destinoId: DestinoId | null; envioNonce: number; tempComposta: number; modoColor: string }) {
  const objeto = useRef<THREE.Group>(null);
  const botellaNueva = useRef<THREE.Group>(null);
  const aro = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const hojuelas = useRef<THREE.InstancedMesh>(null);
  const vapor = useRef<THREE.InstancedMesh>(null);
  const agua = useRef<THREE.Mesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const ultimo = useRef(envioNonce);
  const t = useRef(99);
  const des = destinoId ? desenlace(objetoId, destinoId, tempComposta) : null;
  const res = des ? RESULTADO_DEF[des.tipo] : null;
  const fDegrada = des?.tipo === "degrada" ? (objetoId === "pla" ? desintegracionPla(tempComposta) : 0.95) : 0;

  useFrame(({ clock }, dt) => {
    const reloj = clock.elapsedTime;
    if (envioNonce !== ultimo.current) {
      ultimo.current = envioNonce;
      t.current = 0;
    }
    t.current += dt;
    const g = objeto.current;
    const est = destinoId ? ESTACION[destinoId] : null;
    const viaje = destinoId ? clamp01(t.current / T_VIAJE) : 0;
    const proc = destinoId ? clamp01((t.current - T_VIAJE) / T_PROCESO) : 0;
    const tipo = des?.tipo;
    if (g) {
      if (!est) {
        g.position.set(INICIO[0], INICIO[1] + Math.sin(reloj * 1.5) * 0.06, INICIO[2]);
        g.rotation.y = reloj * 0.6;
        g.scale.setScalar(1.35);
        g.visible = true;
      } else {
        const dest: Pt = destinoId === "relleno" ? [est[0], 0.75, est[2] + 0.72] : destinoId === "rio" ? [est[0] - 0.2, 0.12, est[2] + 0.6] : destinoId === "composta" ? [est[0], 0.55, est[2] + 0.35] : [est[0] + 0.5, 0.5, est[2] + 0.9];
        const e = viaje * viaje * (3 - 2 * viaje);
        let x = INICIO[0] + (dest[0] - INICIO[0]) * e;
        let y = INICIO[1] + (dest[1] - INICIO[1]) * e + Math.sin(e * Math.PI) * 2.2;
        let z = INICIO[2] + (dest[2] - INICIO[2]) * e;
        let s = 1.35;
        if (viaje >= 1) {
          if (tipo === "ciclo") s = 1.35 * (1 - clamp01(proc * 2));
          if (tipo === "degrada") s = 1.35 * (1 - fDegrada * clamp01(proc));
          if (tipo === "rechazo") {
            const b = clamp01(proc * 1.4);
            x += b * 1.1;
            z += b * 0.9;
            y = dest[1] + Math.abs(Math.sin(b * Math.PI * 2)) * 0.6 * (1 - b) - b * 0.3;
          }
          if (tipo === "contamina" && destinoId === "rio") {
            const k = ((t.current - T_VIAJE) * 0.18) % 1;
            x = dest[0] + k * 3.0 * 0.6;
            z = dest[2] - k * 3.0 * 0.8;
            y = 0.12 + Math.sin(reloj * 2) * 0.03;
          }
        }
        g.position.set(x, y, z);
        g.rotation.y = viaje < 1 ? e * Math.PI * 3 : tipo === "contamina" ? reloj * 0.5 : 0.3;
        g.scale.setScalar(Math.max(0.0001, s));
        g.visible = s > 0.01;
      }
    }
    if (botellaNueva.current) {
      const s = tipo === "ciclo" && viaje >= 1 ? clamp01((proc - 0.45) * 2) : 0;
      botellaNueva.current.scale.setScalar(Math.max(0.0001, s * 1.35));
      botellaNueva.current.rotation.y = reloj * 0.8;
    }
    if (aro.current) {
      aro.current.visible = tipo === "ciclo" && proc > 0.5;
      aro.current.rotation.z = reloj * 1.4;
    }
    if (halo.current) {
      const show = viaje >= 1 && (tipo === "persiste" || tipo === "rechazo" || tipo === "contamina") && destinoId !== "rio";
      halo.current.visible = show;
      if (g) halo.current.position.set(g.position.x, destinoId === "relleno" ? g.position.y - 0.3 : 0.04, g.position.z);
      halo.current.scale.setScalar(1 + 0.12 * Math.sin(reloj * 3));
    }
    const hj = hojuelas.current;
    if (hj && est) {
      for (let k = 0; k < N_HOJUELAS; k++) {
        let vis = 0;
        if (tipo === "ciclo") vis = clamp01(proc * 3) * (1 - clamp01((proc - 0.6) * 2.5));
        if (tipo === "degrada") vis = clamp01(proc * 2) * 0.8;
        if (tipo === "contamina" && destinoId === "rio") vis = clamp01((t.current - T_VIAJE) * 0.5);
        const u = hash(k, 60);
        const w = hash(k, 61);
        if (destinoId === "rio") {
          const kk = (u + (t.current - T_VIAJE) * 0.08) % 1;
          obj.position.set(est[0] - 0.2 + kk * 1.8 + (w - 0.5) * 0.5, 0.1, est[2] + 0.6 - kk * 2.4 + (w - 0.5) * 0.5);
        } else if (destinoId === "reciclaje") {
          obj.position.set(est[0] + 0.5 + (u - 0.5) * 0.8, 0.12 + w * 0.2, est[2] + 0.9 + (w - 0.5) * 0.6);
        } else {
          obj.position.set(est[0] + (u - 0.5) * 1.2, 0.5 + w * 0.3, est[2] + 0.35 + (w - 0.5) * 0.9);
        }
        obj.rotation.set(u * 6, w * 6, 0);
        obj.scale.set(0.06 * vis, 0.015 * vis + 0.0001, 0.05 * vis);
        obj.updateMatrix();
        hj.setMatrixAt(k, obj.matrix);
      }
      hj.instanceMatrix.needsUpdate = true;
    }
    const vp = vapor.current;
    if (vp) {
      const est2 = ESTACION.composta;
      const intensidad = clamp01((tempComposta - 30) / 28);
      for (let k = 0; k < 14; k++) {
        const p = (reloj * 0.3 + hash(k, 70)) % 1;
        obj.position.set(est2[0] + (hash(k, 71) - 0.5) * 1.1 + Math.sin(p * 5 + k) * 0.1, 0.9 + p * 1.4, est2[2] + (hash(k, 72) - 0.5) * 0.9);
        obj.rotation.set(0, 0, 0);
        obj.scale.setScalar(Math.max(0.0001, intensidad * (0.07 + p * (1 - p) * 0.3)));
        obj.updateMatrix();
        vp.setMatrixAt(k, obj.matrix);
      }
      vp.instanceMatrix.needsUpdate = true;
    }
    if (agua.current) {
      const m = agua.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.15 + 0.08 * Math.sin(reloj * 2);
    }
  });

  const colHojuela = des?.tipo === "degrada" ? "#78350f" : OBJETOS.find((o) => o.id === objetoId)!.color;
  const llegada = destinoId ? ESTACION[destinoId] : null;

  return (
    <group position={[0, -1.3, 0]}>
      <mesh position={[0, -0.06, -0.4]} receiveShadow>
        <cylinderGeometry args={[6.8, 6.8, 0.12, 72]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      {/* Punto de partida */}
      <mesh position={[INICIO[0], 0.12, INICIO[2]]} receiveShadow>
        <cylinderGeometry args={[0.62, 0.7, 0.24, 40]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[INICIO[0], 0.25, INICIO[2]]}>
        <cylinderGeometry args={[0.64, 0.64, 0.03, 40]} />
        <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={0.5} />
      </mesh>

      {DESTINOS.map((d) => {
        const [x, , z] = ESTACION[d.id];
        const activo = destinoId === d.id;
        return (
          <group key={d.id}>
            <mesh position={[x, 0.03, z]} receiveShadow>
              <cylinderGeometry args={[1.25, 1.25, 0.06, 48]} />
              <meshStandardMaterial color="#132338" roughness={0.8} />
            </mesh>
            <mesh position={[x, 0.07, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.25, 0.035, 8, 64]} />
              <meshStandardMaterial color={d.color} emissive={d.color} emissiveIntensity={activo ? 1.2 : 0.25} toneMapped={false} />
            </mesh>
            <Etiqueta pos={[x, 2.35, z]} df={11} fs={11.5} col={activo ? `${d.color}` : `${d.color}66`}>
              <i className={`fa-solid ${d.icono}`} style={{ color: d.color }} />
              {d.etq}
            </Etiqueta>
          </group>
        );
      })}

      {/* Planta de reciclaje */}
      <group position={ESTACION.reciclaje}>
        <mesh position={[-0.2, 0.6, -0.25]} castShadow>
          <boxGeometry args={[1.5, 1.1, 1.0]} />
          <meshStandardMaterial color="#1e3a5f" roughness={0.5} />
        </mesh>
        <mesh position={[-0.2, 1.2, -0.25]}>
          <boxGeometry args={[1.6, 0.1, 1.1]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.4} emissive="#38bdf8" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[-0.65, 1.55, -0.45]}>
          <cylinderGeometry args={[0.1, 0.12, 0.7, 12]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0.45, 0.25, 0.55]} rotation={[0, -0.6, 0]}>
          <boxGeometry args={[1.2, 0.08, 0.36]} />
          <meshStandardMaterial color="#111827" roughness={0.6} />
        </mesh>
        <group ref={botellaNueva} position={[0.75, 0.55, 0.55]} scale={0.0001}>
          <ModeloResiduo id="pet" />
        </group>
        <mesh ref={aro} position={[0.75, 0.8, 0.55]} visible={false}>
          <torusGeometry args={[0.55, 0.035, 8, 48, Math.PI * 1.6]} />
          <meshBasicMaterial color="#34d399" toneMapped={false} />
        </mesh>
      </group>

      {/* Composta */}
      <group position={ESTACION.composta}>
        <mesh position={[0, 0.02, 0]} scale={[1.05, 0.62, 0.85]} castShadow receiveShadow>
          <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#5b3a1e" roughness={1} flatShading />
        </mesh>
        {[-0.5, 0.1, 0.55].map((xx, k) => (
          <mesh key={k} position={[xx, 0.42 - Math.abs(xx) * 0.3, 0.45]} rotation={[0.4, k, 0.3]} scale={[0.14, 0.03, 0.08]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={k === 1 ? "#65a30d" : "#a16207"} roughness={0.8} />
          </mesh>
        ))}
        <Etiqueta pos={[0.95, 1.2, 0.2]} df={10} fs={11} col={tempComposta >= 55 ? "#fb923caa" : "#94a3b8aa"}>
          <i className="fa-solid fa-temperature-half" style={{ color: tempComposta >= 55 ? "#fb923c" : "#cbd5e1" }} />
          {num(tempComposta, 0)} °C
        </Etiqueta>
      </group>
      <instancedMesh ref={vapor} args={[GEO_PUNTO, undefined, 14]} frustumCulled={false}>
        <meshBasicMaterial color="#f1f5f9" transparent opacity={0.16} depthWrite={false} />
      </instancedMesh>

      {/* Relleno sanitario en corte */}
      <group position={ESTACION.relleno}>
        {[
          { y: 0.12, h: 0.24, c: "#1f2937" },
          { y: 0.45, h: 0.42, c: "#57534e" },
          { y: 0.78, h: 0.24, c: "#78716c" },
          { y: 1.05, h: 0.3, c: "#6b4f2e" },
          { y: 1.24, h: 0.08, c: "#4d7c0f" },
        ].map((l, k) => (
          <mesh key={k} position={[0, l.y, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.8, l.h, 1.4]} />
            <meshStandardMaterial color={l.c} roughness={1} />
          </mesh>
        ))}
        {[-0.55, -0.2, 0.25, 0.6].map((xx, k) => (
          <mesh key={k} position={[xx, 0.45 + (k % 2) * 0.1, 0.71]}>
            <boxGeometry args={[0.2, 0.12, 0.02]} />
            <meshStandardMaterial color={["#94a3b8", "#fbbf24", "#e2e8f0", "#7dd3fc"][k]!} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Río */}
      <group position={[ESTACION.rio[0] - 0.2 + 0.6 * 1.5, 0, ESTACION.rio[2] + 0.6 - 0.8 * 1.5]} rotation={[0, Math.atan2(0.6, -0.8), 0]}>
        <mesh ref={agua} position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.1, 4.2]} />
          <meshStandardMaterial color="#0e7490" emissive="#0891b2" emissiveIntensity={0.15} roughness={0.15} />
        </mesh>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.62, 0.1, 0]}>
            <boxGeometry args={[0.16, 0.16, 4.2]} />
            <meshStandardMaterial color="#3f6212" roughness={1} />
          </mesh>
        ))}
      </group>

      <group ref={objeto}>
        <ModeloResiduo id={objetoId} />
      </group>
      <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.35, 0.45, 40]} />
        <meshBasicMaterial color={res?.color ?? "#fbbf24"} transparent opacity={0.85} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <instancedMesh ref={hojuelas} args={[undefined, undefined, N_HOJUELAS]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={colHojuela} roughness={0.6} />
      </instancedMesh>

      {des && res && llegada && (
        <Etiqueta pos={[llegada[0], 3.0, llegada[2]]} df={10} fs={12} col={res.color}>
          <i className={`fa-solid ${res.icono}`} style={{ color: res.color }} />
          {res.etq} · {des.plazo}
        </Etiqueta>
      )}
      <Etiqueta pos={[INICIO[0] + 1.35, 0.3, INICIO[2] + 0.2]} df={10} fs={11}>
        <i className={`fa-solid ${OBJETOS.find((o) => o.id === objetoId)!.icono}`} style={{ color: modoColor }} />
        {OBJETOS.find((o) => o.id === objetoId)!.etq}
      </Etiqueta>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function ContaminantesPlasticosScene(p: ContaminantesSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "oceano") return { pos: [0.2, 2.3, 14.2], target: [-0.4, -0.9, 0] };
    if (vista === "cadena") return { pos: [0, 2.8, 12.4], target: [0.4, 0.6, 0] };
    return { pos: [0, 7.4, 9.2], target: [0, -0.9, -0.9] };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento="#38bdf8" />
      <pointLight position={[6, 3, 5]} intensity={0.45} color={modoColor} />

      {vista === "oceano" && <EscenaOceano resinaId={p.resinaId} lugar={p.lugar} tirado={p.tirado} tAnios={p.tAnios} bio={p.bio} redNonce={p.redNonce} modoColor={modoColor} />}
      {vista === "cadena" && <EscenaCadena contamId={p.contamId} paso={p.paso} edadAtun={p.edadAtun} ingesta={p.ingesta} modoColor={modoColor} />}
      {vista === "destino" && <EscenaDestino objetoId={p.objetoId} destinoId={p.destinoId} envioNonce={p.envioNonce} tempComposta={p.tempComposta} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={22} maxPolarAngle={Math.PI * 0.52} minPolarAngle={Math.PI * 0.05} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.32} luminanceThreshold={0.62} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.62} />
      </EffectComposer>
    </Canvas>
  );
}
