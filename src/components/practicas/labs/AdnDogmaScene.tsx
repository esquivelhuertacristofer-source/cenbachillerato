"use client";

/**
 * Escena 3D del laboratorio "El dogma central de la biología molecular"
 * (CNEYT-VI-P04). Tres procesos sobre una misma secuencia:
 *
 *  - replicacion:  doble hélice que se abre (helicasa) y cada hebra molde
 *                  templa una hebra nueva complementaria → dos ADN idénticos.
 *  - transcripcion: la hebra molde del ADN templa un ARN mensajero (T→U) que
 *                  se sintetiza base a base.
 *  - traduccion:   el ribosoma recorre el ARNm codón a codón; cada ARNt aporta
 *                  un aminoácido y crece la cadena polipeptídica.
 *
 * Toda animación ocurre dentro de useFrame mutando refs (nunca en el render),
 * conforme a las reglas del React Compiler.
 */

import * as THREE from "three";
import { useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, Line, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type Base,
  type Pt,
  type CodonInfo,
  BASE_COLOR,
  HELICE_RADIO as R,
  HELICE_PASO as PASO,
  HELICE_VUELTA,
  complementoARN,
  CODON_INICIO,
} from "./adn-dogma-data";

export interface AdnDogmaSceneProps {
  modo: Modo;
  codificante: string; // hebra codificante (sentido) 5'→3'
  molde: string; // hebra molde (antiparalela)
  arnm: string; // ARN mensajero
  codones: CodonInfo[]; // resultado de la traducción
  progreso: number; // paso actual (índice)
  total: number; // pasos totales del modo
  playing: boolean;
  accent: string;
  modoColor: string;
  resetNonce: number;
  /** Habilita arrastrar la maquinaria (helicasa/ARN polimerasa/ribosoma). */
  arrastrable?: boolean;
  /** Arrastrar la maquinaria fija el paso del proceso. */
  onScrub?: (paso: number) => void;
  /** Se llama al tomar la maquinaria (para el sonido). */
  onGrab?: () => void;
}

/* ── Scratch a nivel de módulo (sin asignar memoria por frame) ─────────── */
const _planeCam = new THREE.Plane();
const _camDir = new THREE.Vector3();
const _hit = new THREE.Vector3();
const _zero = new THREE.Vector3(0, 0, 0);
const _col = new THREE.Color();
const _obj = new THREE.Object3D();
const PART_N = 26; // nucleótidos libres flotando (partículas en tiempo real)
const PAL_BASE = ["#34d399", "#f87171", "#fbbf24", "#38bdf8"]; // A, T/U, G, C

/* ── helpers de geometría (puros) ─────────────────────────────────────── */
function seg(a: Pt, b: Pt): { pos: Pt; quat: [number, number, number, number]; len: number } {
  const va = new THREE.Vector3(a[0], a[1], a[2]);
  const vb = new THREE.Vector3(b[0], b[1], b[2]);
  const dir = new THREE.Vector3().subVectors(vb, va);
  const len = dir.length() || 0.0001;
  const mid = new THREE.Vector3().addVectors(va, vb).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return { pos: [mid.x, mid.y, mid.z], quat: [q.x, q.y, q.z, q.w], len };
}
const charAt = (s: string, i: number): Base => (s[i] ?? "A") as Base;

/* ── Etiqueta flotante (Html) ─────────────────────────────────────────── */
function Etiqueta({ pos, children, df = 11, col }: { pos: Pt; children: ReactNode; df?: number; col?: string }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: "rgba(4,10,22,0.82)", border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`, color: "#fff", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 6px 18px -8px #000" }}>
        {children}
      </div>
    </Html>
  );
}

/* ── Un nucleótido: esfera coloreada por base + letra ─────────────────── */
function Nucleo({ pos, base, activo, tenue }: { pos: Pt; base: Base; activo?: boolean; tenue?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const k = activo ? 1 + Math.sin(s.clock.elapsedTime * 6) * 0.12 : 1;
    ref.current.scale.setScalar(k);
  });
  const col = BASE_COLOR[base];
  return (
    <group ref={ref} position={pos}>
      <mesh castShadow>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={activo ? 0.9 : 0.28} transparent opacity={tenue ? 0.4 : 1} roughness={0.35} metalness={0.1} />
      </mesh>
      <Html center position={[0, 0, 0.34]} distanceFactor={7} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 900, fontSize: 22, lineHeight: 1, color: "#04121f", opacity: tenue ? 0.5 : 1, userSelect: "none" }}>{base}</span>
      </Html>
    </group>
  );
}

/* ── Puentes de hidrógeno (n cilindros) entre dos puntos ──────────────── */
function Puentes({ a, b, n, activo }: { a: Pt; b: Pt; n: number; activo?: boolean }) {
  const rods: ReactNode[] = [];
  for (let k = 0; k < n; k++) {
    const off = (k - (n - 1) / 2) * 0.14;
    const sa: Pt = [a[0], a[1] + off, a[2]];
    const sb: Pt = [b[0], b[1] + off, b[2]];
    const { pos, quat, len } = seg(sa, sb);
    rods.push(
      <mesh key={k} position={pos} quaternion={quat}>
        <cylinderGeometry args={[0.035, 0.035, len * 0.62, 6]} />
        <meshStandardMaterial color="#dbe7f4" emissive="#9fb6cc" emissiveIntensity={activo ? 0.7 : 0.2} transparent opacity={0.8} />
      </mesh>,
    );
  }
  return <group>{rods}</group>;
}

/* ── Línea de esqueleto fosfato-desoxirribosa ─────────────────────────── */
function Backbone({ pts, color }: { pts: Pt[]; color: string }) {
  if (pts.length < 2) return null;
  return <Line points={pts} color={color} lineWidth={3} transparent opacity={0.55} />;
}

/* ── MODO replicación: la doble hélice se abre y se duplica ───────────── */
function MundoReplicacion({ codificante, molde, progreso }: { codificante: string; molde: string; progreso: number }) {
  const n = codificante.length;
  const y0 = -((n - 1) * PASO) / 2;
  const senseClosed: Pt[] = [];
  const templClosed: Pt[] = [];
  const senseOpen: Pt[] = [];
  const templOpen: Pt[] = [];
  const nodos: ReactNode[] = [];

  for (let i = 0; i < n; i++) {
    const ang = (i / HELICE_VUELTA) * Math.PI * 2;
    const y = y0 + i * PASO;
    const cx = Math.cos(ang) * R;
    const cz = Math.sin(ang) * R;
    const copiado = i < progreso;
    const activo = i === progreso;
    const bS = charAt(codificante, i); // hebra codificante (sentido)
    const bT = charAt(molde, i); // hebra molde
    if (!copiado) {
      const pS: Pt = [cx, y, cz];
      const pT: Pt = [-cx, y, -cz];
      senseClosed.push(pS);
      templClosed.push(pT);
      nodos.push(<Nucleo key={`s${i}`} pos={pS} base={bS} activo={activo} />);
      nodos.push(<Nucleo key={`t${i}`} pos={pT} base={bT} activo={activo} />);
      const nB = bS === "G" || bS === "C" ? 3 : 2;
      nodos.push(<Puentes key={`h${i}`} a={pS} b={pT} n={nB} activo={activo} />);
    } else {
      // hija izquierda: hebra sentido (orig) + nueva molde (complemento, glow)
      const lx = -2.6;
      const pSo: Pt = [lx + Math.cos(ang) * 0.85, y, cz * 0.85];
      const pNewT: Pt = [lx - Math.cos(ang) * 0.85, y, -cz * 0.85];
      // hija derecha: hebra molde (orig) + nueva sentido (complemento, glow)
      const rx = 2.6;
      const pTo: Pt = [rx - Math.cos(ang) * 0.85, y, -cz * 0.85];
      const pNewS: Pt = [rx + Math.cos(ang) * 0.85, y, cz * 0.85];
      senseOpen.push(pSo);
      templOpen.push(pTo);
      const newT = bS === "A" ? "T" : bS === "T" ? "A" : bS === "G" ? "C" : "G";
      const newS = bT === "A" ? "T" : bT === "T" ? "A" : bT === "G" ? "C" : "G";
      nodos.push(<Nucleo key={`so${i}`} pos={pSo} base={bS} />);
      nodos.push(<Nucleo key={`nt${i}`} pos={pNewT} base={newT as Base} tenue />);
      nodos.push(<Nucleo key={`to${i}`} pos={pTo} base={bT} />);
      nodos.push(<Nucleo key={`ns${i}`} pos={pNewS} base={newS as Base} tenue />);
      nodos.push(<Puentes key={`hl${i}`} a={pSo} b={pNewT} n={2} />);
      nodos.push(<Puentes key={`hr${i}`} a={pTo} b={pNewS} n={2} />);
    }
  }
  const forkY = y0 + Math.min(progreso, n) * PASO;
  return (
    <group>
      <Backbone pts={senseClosed} color="#7dd3fc" />
      <Backbone pts={templClosed} color="#94a3b8" />
      <Backbone pts={senseOpen} color="#7dd3fc" />
      <Backbone pts={templOpen} color="#94a3b8" />
      {nodos}
      {progreso > 0 && progreso < n && (
        <Etiqueta pos={[0, forkY, 0]} col="#38bdf8aa">
          <i className="fa-solid fa-scissors" style={{ color: "#38bdf8" }} /> Helicasa
        </Etiqueta>
      )}
      {progreso >= n && (
        <>
          <Etiqueta pos={[-2.6, y0 + n * PASO * 0.5 + 1, 0]} col="#34d399aa">ADN hija 1</Etiqueta>
          <Etiqueta pos={[2.6, y0 + n * PASO * 0.5 + 1, 0]} col="#34d399aa">ADN hija 2</Etiqueta>
        </>
      )}
    </group>
  );
}

/* ── MODO transcripción: el ADN templa un ARNm ───────────────────────── */
function MundoTranscripcion({ codificante, molde, arnm, progreso }: { codificante: string; molde: string; arnm: string; progreso: number }) {
  const n = codificante.length;
  const y0 = -((n - 1) * PASO) / 2;
  const senseB: Pt[] = [];
  const templB: Pt[] = [];
  const arnB: Pt[] = [];
  const nodos: ReactNode[] = [];
  const ARN_X = 3.3;

  for (let i = 0; i < n; i++) {
    const ang = (i / HELICE_VUELTA) * Math.PI * 2;
    const y = y0 + i * PASO;
    const cx = Math.cos(ang) * R;
    const cz = Math.sin(ang) * R;
    const pS: Pt = [cx, y, cz];
    const pT: Pt = [-cx, y, -cz];
    senseB.push(pS);
    templB.push(pT);
    nodos.push(<Nucleo key={`s${i}`} pos={pS} base={charAt(codificante, i)} tenue />);
    nodos.push(<Nucleo key={`t${i}`} pos={pT} base={charAt(molde, i)} activo={i === progreso} />);
    const bS = charAt(codificante, i);
    const nB = bS === "G" || bS === "C" ? 3 : 2;
    nodos.push(<Puentes key={`h${i}`} a={pS} b={pT} n={nB} />);
    // ARNm sintetizado a la derecha (solo lo ya transcrito)
    if (i < progreso) {
      const pR: Pt = [ARN_X, y, 0];
      arnB.push(pR);
      nodos.push(<Nucleo key={`r${i}`} pos={pR} base={charAt(arnm, i)} />);
    }
  }
  const polY = y0 + Math.min(progreso, n) * PASO;
  return (
    <group>
      <Backbone pts={senseB} color="#475569" />
      <Backbone pts={templB} color="#94a3b8" />
      <Backbone pts={arnB} color="#c084fc" />
      {nodos}
      {progreso < n && (
        <group position={[(ARN_X - R) / 2 + 0.2, polY, 0]}>
          <mesh>
            <sphereGeometry args={[1.05, 24, 24]} />
            <meshStandardMaterial color="#a855f7" transparent opacity={0.34} emissive="#a855f7" emissiveIntensity={0.5} roughness={0.3} />
          </mesh>
          <Etiqueta pos={[0, 1.4, 0]} col="#a855f7aa">
            <i className="fa-solid fa-pen-nib" style={{ color: "#c084fc" }} /> ARN polimerasa
          </Etiqueta>
        </group>
      )}
      <Etiqueta pos={[ARN_X, y0 + n * PASO + 0.6, 0]} col="#c084fcaa">{"ARNm (5'→3')"}</Etiqueta>
    </group>
  );
}

/* ── MODO traducción: el ribosoma recorre el ARNm ────────────────────── */
function Ribosoma({ x, color }: { x: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.position.y = Math.sin(s.clock.elapsedTime * 2) * 0.06;
  });
  return (
    <group ref={ref} position={[x, 0, 0]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.95, 24, 24]} />
        <meshStandardMaterial color={color} transparent opacity={0.42} emissive={color} emissiveIntensity={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.35, 0]} castShadow>
        <sphereGeometry args={[1.15, 24, 24]} />
        <meshStandardMaterial color={color} transparent opacity={0.34} emissive={color} emissiveIntensity={0.3} roughness={0.3} />
      </mesh>
    </group>
  );
}

function MundoTraduccion({ arnm, codones, progreso, modoColor }: { arnm: string; codones: CodonInfo[]; progreso: number; modoColor: string }) {
  const n = arnm.length;
  const x0 = -((n - 1) * PASO) / 2;
  const start = Math.max(0, arnm.indexOf(CODON_INICIO));
  const nodos: ReactNode[] = [];
  const arnB: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + i * PASO;
    const p: Pt = [x, -0.2, 0];
    arnB.push(p);
    const codIdx = i >= start ? Math.floor((i - start) / 3) : -1;
    const leido = codIdx >= 0 && codIdx < progreso;
    nodos.push(<Nucleo key={`r${i}`} pos={p} base={charAt(arnm, i)} tenue={!leido && codIdx !== progreso} activo={codIdx === progreso} />);
  }
  // ribosoma sobre el codón actual
  const curCod = codones[progreso];
  const ribX = x0 + (start + progreso * 3 + 1) * PASO;
  // cadena polipeptídica (aminoácidos ya añadidos, sin contar el codón de paro)
  const cadena: ReactNode[] = [];
  const pts: Pt[] = [];
  for (let k = 0; k < Math.min(progreso, codones.length); k++) {
    const c = codones[k];
    if (!c || c.paro) continue;
    const ax = ribX - 0.4 - k * 0.5;
    const ay = 1.8 + Math.sin(k * 0.9) * 0.35;
    const p: Pt = [ax, ay, Math.cos(k * 0.9) * 0.35];
    pts.push(p);
    cadena.push(
      <mesh key={k} position={p} castShadow>
        <sphereGeometry args={[0.34, 20, 20]} />
        <meshStandardMaterial color={c.amino.color} emissive={c.amino.color} emissiveIntensity={0.3} roughness={0.4} />
      </mesh>,
    );
  }
  // ARNt entrante en el codón actual
  let trna: ReactNode = null;
  if (curCod && !curCod.paro) {
    const anti = curCod.codon.split("").map((b) => complementoARN(b as Base)).join("");
    trna = (
      <group position={[ribX, 1.5, 0]}>
        <mesh>
          <coneGeometry args={[0.45, 1.1, 4]} />
          <meshStandardMaterial color={curCod.amino.color} emissive={curCod.amino.color} emissiveIntensity={0.45} roughness={0.4} />
        </mesh>
        <Etiqueta pos={[0, 1.0, 0]} col={`${curCod.amino.color}aa`}>
          {curCod.amino.abr} · anti {anti}
        </Etiqueta>
      </group>
    );
  }
  return (
    <group>
      <Backbone pts={arnB} color="#34d399" />
      {nodos}
      <Ribosoma x={ribX} color={modoColor} />
      {trna}
      {pts.length > 1 && <Line points={pts} color="#e2e8f0" lineWidth={2.5} />}
      {cadena}
      <Etiqueta pos={[x0, -1.1, 0]} col="#34d399aa">{"ARNm 5'"}</Etiqueta>
      {progreso >= codones.length && codones.length > 0 && (
        <Etiqueta pos={[ribX - 2.5, 3.0, 0]} col="#34d399aa">
          <i className="fa-solid fa-check" style={{ color: "#34d399" }} /> Polipéptido completo
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Nucleótidos libres flotando (partículas en tiempo real) ──────────── */
function NucleotidosLibres() {
  const ref = useRef<THREE.InstancedMesh>(null);
  useFrame((s) => {
    const m = ref.current;
    if (!m) return;
    const t = s.clock.elapsedTime;
    for (let i = 0; i < PART_N; i++) {
      const a = (i / PART_N) * Math.PI * 2;
      const rad = 4.2 + (i % 5) * 0.55;
      const p = (t * 0.07 + i / PART_N) % 1; // fase ascendente continua
      const y = -6 + p * 12;
      _obj.position.set(Math.cos(a + t * 0.18) * rad, y, Math.sin(a + t * 0.18) * rad);
      const sc = 0.12 + 0.05 * Math.sin(t * 1.8 + i);
      _obj.scale.setScalar(sc);
      _obj.updateMatrix();
      m.setMatrixAt(i, _obj.matrix);
      m.setColorAt(i, _col.set(PAL_BASE[i % 4] as string));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, PART_N]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial transparent opacity={0.5} emissiveIntensity={0.6} toneMapped={false} />
    </instancedMesh>
  );
}

/* ── Maquinaria arrastrable (helicasa / ARN polimerasa / ribosoma) ────── */
function Arrastrador({
  modo,
  total,
  progreso,
  y0,
  x0,
  start,
  accent,
  onScrub,
  onGrab,
  setDragging,
}: {
  modo: Modo;
  total: number;
  progreso: number;
  y0: number;
  x0: number;
  start: number;
  accent: string;
  onScrub?: (paso: number) => void;
  onGrab?: () => void;
  setDragging: (v: boolean) => void;
}) {
  const drag = useRef(false);
  const knob = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const { camera } = useThree();
  const vertical = modo !== "traduccion";

  useFrame((s) => {
    if (knob.current) {
      const t = s.clock.elapsedTime;
      knob.current.scale.setScalar((hover || drag.current ? 1.28 : 1) * (1 + Math.sin(t * 4) * 0.06));
    }
  });

  const hx = vertical ? -(R + 1.9) : x0 + (start + progreso * 3 + 1) * PASO;
  const hy = vertical ? y0 + progreso * PASO : -1.9;
  const pos: [number, number, number] = [hx, hy, 0];

  const scrub = (e: ThreeEvent<PointerEvent>) => {
    camera.getWorldDirection(_camDir);
    _planeCam.setFromNormalAndCoplanarPoint(_camDir, _zero);
    if (!e.ray.intersectPlane(_planeCam, _hit)) return;
    const idx = vertical
      ? Math.round((_hit.y - y0) / PASO)
      : Math.round(((_hit.x - x0) / PASO - start - 1) / 3);
    onScrub?.(Math.max(0, Math.min(total, idx)));
  };

  return (
    <group position={pos}>
      {/* perilla visible */}
      <mesh ref={knob}>
        <sphereGeometry args={[0.34, 22, 22]} />
        <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.85} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.05, 12, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={hover ? 0.9 : 0.45} />
      </mesh>
      {/* esfera de captura (invisible, área grande) */}
      <mesh
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        onPointerDown={(e) => {
          e.stopPropagation();
          (e.target as Element).setPointerCapture?.(e.pointerId);
          drag.current = true;
          setDragging(true);
          onGrab?.();
          scrub(e);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          e.stopPropagation();
          scrub(e);
        }}
        onPointerUp={(e) => {
          drag.current = false;
          setDragging(false);
          (e.target as Element).releasePointerCapture?.(e.pointerId);
        }}
      >
        <sphereGeometry args={[0.95, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Etiqueta pos={[0, 0.95, 0]} col={`${accent}cc`}>
        <i className="fa-solid fa-hand-pointer" /> arrástrame
      </Etiqueta>
    </group>
  );
}

/* ── Mundo + cámara + post ────────────────────────────────────────────── */
function Contenido(props: AdnDogmaSceneProps) {
  const { modo, codificante, molde, arnm, codones, progreso, total, modoColor, resetNonce, playing, accent, arrastrable, onScrub, onGrab } = props;
  const [dragging, setDragging] = useState(false);
  const giro = useRef<THREE.Group>(null);
  useFrame((s, dt) => {
    if (giro.current && playing && !dragging && modo !== "traduccion") giro.current.rotation.y += dt * 0.18;
  });

  const y0 = -((codificante.length - 1) * PASO) / 2;
  const x0 = -((arnm.length - 1) * PASO) / 2;
  const start = Math.max(0, arnm.indexOf(CODON_INICIO));

  const mundo: ReactNode =
    modo === "replicacion" ? (
      <MundoReplicacion codificante={codificante} molde={molde} progreso={progreso} />
    ) : modo === "transcripcion" ? (
      <MundoTranscripcion codificante={codificante} molde={molde} arnm={arnm} progreso={progreso} />
    ) : (
      <MundoTraduccion arnm={arnm} codones={codones} progreso={progreso} modoColor={modoColor} />
    );

  return (
    <>
      <color attach="background" args={["#040912"]} />
      <fog attach="fog" args={["#040912", 18, 40]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 9, 6]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -4]} intensity={0.5} color={modoColor} />
      <Stars radius={70} depth={30} count={1100} factor={3} fade speed={0.5} />
      <NucleotidosLibres />

      <group ref={giro} key={`${modo}-${resetNonce}`}>{mundo}</group>

      {arrastrable && (
        <Arrastrador
          modo={modo}
          total={total}
          progreso={progreso}
          y0={y0}
          x0={x0}
          start={start}
          accent={accent}
          onScrub={onScrub}
          onGrab={onGrab}
          setDragging={setDragging}
        />
      )}

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.1} position={[0, 6, 4]} scale={8} color="#bcd4ff" />
        <Lightformer form="rect" intensity={0.7} position={[5, 0, -4]} scale={6} color={modoColor} />
      </Environment>
      <OrbitControls enablePan={false} enabled={!dragging} minDistance={7} maxDistance={28} autoRotate={false} />
      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.2} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.72} />
      </EffectComposer>
    </>
  );
}

export default function AdnDogmaScene(props: AdnDogmaSceneProps) {
  const cam: Pt =
    props.modo === "traduccion" ? [0, 2.5, 15] : props.modo === "transcripcion" ? [3, 1, 16] : [0, 1, 15];
  return (
    <Canvas key={props.modo} shadows dpr={[1, 2]} camera={{ position: cam, fov: 46 }} gl={{ antialias: true }} style={{ width: "100%", height: "100%" }}>
      <Contenido {...props} />
    </Canvas>
  );
}
