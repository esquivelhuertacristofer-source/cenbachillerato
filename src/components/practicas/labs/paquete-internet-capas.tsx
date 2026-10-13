"use client";

/**
 * Escala CAPAS del viaje del paquete: la encapsulación en 3D. Un trozo de tu
 * archivo (el bloque dorado, con los primeros bytes reales de su formato) se
 * envuelve en tres capas: TCP (número de orden y puerto), IP (direcciones) y
 * la trama del tramo físico (wifi o Ethernet, con su verificación al final).
 * Cada capa agrega su encabezado a la izquierda y una envoltura de vidrio.
 *
 * Las envolturas usan un sombreador de borde (Fresnel), no `transmission`: a
 * través de `transmission` solo se ve lo opaco y las capas internas
 * desaparecerían.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, ContactShadows } from "@react-three/drei";
import { num } from "./paquete-internet-data";
import { type PlanEnvio, type TramoId, avanceEtapa, BYTES_CAPA, BYTES_TRAMA, CAPAS_DEF } from "./paquete-internet-viaje";
import { Etiqueta3D, useReloj, facil, suave, prng, fijarU, type Pt } from "./paquete-internet-comun";

/* ── Texturas ─────────────────────────────────────────────────────────── */

const cacheBytes = new Map<string, THREE.CanvasTexture>();
/** Cara del bloque de datos: bytes en hexadecimal, empezando por la firma del formato. */
function texturaBytes(firma: string): THREE.CanvasTexture {
  const ya = cacheBytes.get(firma);
  if (ya) return ya;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 512, 256);
  grd.addColorStop(0, "#5a3a06");
  grd.addColorStop(1, "#2d1c02");
  g.fillStyle = grd;
  g.fillRect(0, 0, 512, 256);
  g.font = "700 22px ui-monospace, Consolas, monospace";
  g.textBaseline = "top";
  const rnd = prng(firma.length * 31 + firma.charCodeAt(0));
  const hex = () => Math.floor(rnd() * 256).toString(16).toUpperCase().padStart(2, "0");
  const primeros = firma.split(" ");
  for (let fila = 0; fila < 9; fila++) {
    const bytes = Array.from({ length: 12 }, (_, k) => (fila === 0 && k < primeros.length ? primeros[k]! : hex()));
    bytes.forEach((b, k) => {
      g.fillStyle = fila === 0 && k < primeros.length ? "#fff3c4" : `rgba(255,214,120,${0.45 + rnd() * 0.4})`;
      g.fillText(b, 14 + k * 41, 12 + fila * 27);
    });
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cacheBytes.set(firma, t);
  return t;
}

/* ── Vidrio de borde ──────────────────────────────────────────────────── */

const VERT_VIDRIO = /* glsl */ `
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    vN = normalize(mat3(modelMatrix) * normal);
    vec4 p = modelMatrix * vec4(position, 1.0);
    vP = p.xyz;
    gl_Position = projectionMatrix * viewMatrix * p;
  }
`;
const FRAG_VIDRIO = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOp;
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    vec3 n = normalize(vN);
    vec3 v = normalize(cameraPosition - vP);
    float f = pow(1.0 - abs(dot(n, v)), 2.2);
    float arriba = 0.5 + 0.5 * n.y;
    vec3 c = uColor * (0.35 + 1.5 * f) + vec3(1.0) * pow(f, 6.0) * 0.6 * arriba;
    gl_FragColor = vec4(c, (0.05 + 0.6 * f) * uOp);
    #include <colorspace_fragment>
  }
`;

function useVidrio(color: string) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT_VIDRIO,
        fragmentShader: FRAG_VIDRIO,
        uniforms: { uColor: { value: new THREE.Color(color) }, uOp: { value: 0 } },
        transparent: true,
        depthWrite: false,
      }),
    [color],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

/* ── Geometría de las capas (unidades de escena, no a escala de bytes) ── */

const ANCHO_B = 0.011; // escena por byte de encabezado
const DATOS = { x0: -0.6, x1: 0.6, alto: 0.5 };

interface Capa {
  id: "tcp" | "ip" | "enlace";
  color: string;
  /** Encabezado: [x0, x1] y lado. */
  hx0: number;
  hx1: number;
  lado: number;
  /** Envoltura: centro x, tamaño. */
  cx: number;
  tam: [number, number, number];
  /** Cola (solo la trama): [x0, x1]. */
  cola?: [number, number];
}

function capasDe(tramo: TramoId): Capa[] {
  const col = (id: string) => CAPAS_DEF.find((c) => c.id === id)!.color;
  const tcpW = BYTES_CAPA.tcp * ANCHO_B;
  const ipW = BYTES_CAPA.ip * ANCHO_B;
  const tramaH = (BYTES_TRAMA[tramo] - 4) * ANCHO_B;
  const tcpX1 = DATOS.x0 - 0.03;
  const tcpX0 = tcpX1 - tcpW;
  const ipX1 = tcpX0 - 0.1;
  const ipX0 = ipX1 - ipW;
  const trX1 = ipX0 - 0.1;
  const trX0 = trX1 - tramaH;
  const cola: [number, number] = [DATOS.x1 + 0.22, DATOS.x1 + 0.22 + Math.max(0.07, 4 * ANCHO_B)];
  const env = (x0: number, x1: number, lado: number): Pick<Capa, "cx" | "tam"> => ({ cx: (x0 + x1) / 2, tam: [x1 - x0, lado, lado] });
  return [
    { id: "tcp", color: col("tcp"), hx0: tcpX0, hx1: tcpX1, lado: 0.58, ...env(tcpX0 - 0.05, DATOS.x1 + 0.06, 0.7) },
    { id: "ip", color: col("ip"), hx0: ipX0, hx1: ipX1, lado: 0.76, ...env(ipX0 - 0.05, DATOS.x1 + 0.13, 0.9) },
    { id: "enlace", color: tramo === "wifi" ? col("enlace") : "#f472b6", hx0: trX0, hx1: trX1, lado: 0.96, cola, ...env(trX0 - 0.05, cola[1] + 0.05, 1.12) },
  ];
}

function CapaPaquete({ capa, k, nivel }: { capa: Capa; k: number; nivel: MutableRefObject<number> }) {
  const vidrio = useVidrio(capa.color);
  const env = useRef<THREE.Mesh>(null);
  const cab = useRef<THREE.Group>(null);
  const cola = useRef<THREE.Group>(null);
  useFrame(() => {
    const a = facil(nivel.current - k);
    fijarU(vidrio, "uOp", a);
    if (env.current) {
      env.current.visible = a > 0.01;
      env.current.scale.setScalar(1 + (1 - a) * 0.55);
    }
    if (cab.current) {
      cab.current.visible = a > 0.01;
      cab.current.position.set(-(1 - a) * 1.6, (1 - a) * 0.9, 0);
      cab.current.scale.setScalar(Math.max(0.001, a));
    }
    if (cola.current) {
      cola.current.visible = a > 0.01;
      cola.current.position.set((1 - a) * 1.4, (1 - a) * 0.6, 0);
      cola.current.scale.setScalar(Math.max(0.001, a));
    }
  });
  const hw = capa.hx1 - capa.hx0;
  return (
    <group>
      <group ref={cab}>
        <RoundedBox args={[hw, capa.lado, capa.lado]} radius={0.025} smoothness={3} position={[(capa.hx0 + capa.hx1) / 2, 0, 0]} castShadow>
          <meshPhysicalMaterial color={capa.color} roughness={0.28} metalness={0.15} clearcoat={1} clearcoatRoughness={0.15} emissive={capa.color} emissiveIntensity={0.28} />
        </RoundedBox>
        {/* ranuras: «campos» del encabezado */}
        {[0.3, 0.1, -0.1, -0.3].map((y) => (
          <mesh key={y} position={[(capa.hx0 + capa.hx1) / 2, y * capa.lado, capa.lado / 2 + 0.002]}>
            <planeGeometry args={[hw * 0.7, 0.02]} />
            <meshStandardMaterial color="#04101f" roughness={0.6} />
          </mesh>
        ))}
      </group>
      {capa.cola && (
        <group ref={cola}>
          <RoundedBox args={[capa.cola[1] - capa.cola[0], capa.lado, capa.lado]} radius={0.02} smoothness={3} position={[(capa.cola[0] + capa.cola[1]) / 2, 0, 0]} castShadow>
            <meshPhysicalMaterial color={capa.color} roughness={0.28} clearcoat={1} emissive={capa.color} emissiveIntensity={0.28} />
          </RoundedBox>
        </group>
      )}
      <mesh ref={env} position={[capa.cx, 0, 0]} material={vidrio} renderOrder={k + 2}>
        <boxGeometry args={capa.tam} />
      </mesh>
    </group>
  );
}

/* ── Escala completa ──────────────────────────────────────────────────── */

export function poseCapas(aspecto: number): { pos: Pt; target: Pt } {
  const k = aspecto < 1 ? Math.min(2.1, 1.15 / Math.max(0.42, aspecto)) : aspecto < 1.35 ? 1.12 : 1;
  return { pos: [1.25 * k, 0.95 + 1.7 * k, 5.4 * k], target: [-0.3, 0.75, 0] };
}

export function EscalaCapas({
  nivelManual,
  tramo,
  bytesDatos,
  firma,
  ipDestino,
  plan,
  color,
}: {
  nivelManual: number;
  tramo: TramoId;
  bytesDatos: number;
  firma: string;
  ipDestino: string;
  plan: PlanEnvio;
  color: string;
}) {
  const reloj = useReloj();
  const capas = useMemo(() => capasDe(tramo), [tramo]);
  const nivel = useRef(nivelManual);
  const giro = useRef<THREE.Group>(null);
  const tex = useMemo(() => texturaBytes(firma), [firma]);
  const [visibles, setVisibles] = useState(() => Math.round(nivelManual));
  const visiblesRef = useRef(visibles);

  useFrame(({ clock }, dt) => {
    const t = reloj.t;
    // Durante la etapa «capas» de un envío, el paquete se envuelve solo.
    const enEtapa = t >= 0 && avanceEtapa(plan, "capas", t) < 1;
    const meta = enEtapa ? 3 * avanceEtapa(plan, "capas", t) * 1.12 : nivelManual;
    nivel.current += (Math.min(3, meta) - nivel.current) * suave(dt, enEtapa ? 0.25 : 0.07);
    if (giro.current) giro.current.rotation.y = -0.32 + Math.sin(clock.elapsedTime * 0.35) * 0.16;
    const v = Math.max(0, Math.min(3, Math.floor(nivel.current + 0.45)));
    if (v !== visiblesRef.current) {
      visiblesRef.current = v;
      setVisibles(v);
    }
  });

  const nombreTrama = tramo === "wifi" ? "Wi‑Fi" : "Ethernet";
  const etiquetas: { pos: Pt; col: string; contenido: ReactNode }[] = [
    { pos: [0.55, -0.62, 0.62], col: "#fbbf24", contenido: <>Datos · {num(bytesDatos)} B</> },
    { pos: [(capas[0]!.hx0 + capas[0]!.hx1) / 2 + 0.2, 0.68, 0.2], col: capas[0]!.color, contenido: <>TCP · 20 B · nº de orden</> },
    { pos: [(capas[1]!.hx0 + capas[1]!.hx1) / 2 - 0.35, -0.86, 0.5], col: capas[1]!.color, contenido: <span style={{ fontFamily: "ui-monospace, monospace" }}>IP · 20 B · → {ipDestino}</span> },
    { pos: [(capas[2]!.hx0 + capas[2]!.hx1) / 2 - 0.2, 1.0, 0.2], col: capas[2]!.color, contenido: <>{nombreTrama} · {tramo === "wifi" ? "≈ 38" : "18"} B</> },
  ];

  return (
    <group>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-3, 4, 2]} angle={0.5} penumbra={0.8} intensity={18} color={color} distance={10} />
      {/* Pedestal */}
      <mesh position={[0, 0.09, 0]} receiveShadow>
        <cylinderGeometry args={[2.1, 2.25, 0.18, 96]} />
        <meshPhysicalMaterial color="#0f1a2a" roughness={0.25} metalness={0.7} clearcoat={0.8} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[0, 0.181, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.06, 0.018, 8, 128]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#050b16" roughness={0.75} metalness={0.15} />
      </mesh>
      <ContactShadows position={[0, 0.185, 0]} opacity={0.6} scale={6} blur={2.6} far={1.6} resolution={512} color="#000814" />

      <group ref={giro} position={[0.25, 0.95, 0]}>
        {/* Datos */}
        <RoundedBox args={[DATOS.x1 - DATOS.x0, DATOS.alto, DATOS.alto]} radius={0.03} smoothness={4} castShadow>
          <meshPhysicalMaterial map={tex} emissiveMap={tex} emissive="#ffb43a" emissiveIntensity={0.55} roughness={0.32} metalness={0.2} clearcoat={0.8} />
        </RoundedBox>
        {capas.map((c, k) => (
          <CapaPaquete key={`${c.id}-${tramo}`} capa={c} k={k} nivel={nivel} />
        ))}
        {etiquetas.map((e, i) =>
          i <= visibles ? (
            <Etiqueta3D key={i} pos={e.pos} col={`${e.col}cc`}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: e.col, display: "inline-block" }} />
              {e.contenido}
            </Etiqueta3D>
          ) : null,
        )}
      </group>
    </group>
  );
}
