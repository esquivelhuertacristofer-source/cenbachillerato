"use client";

/**
 * Escala RUTA del viaje del paquete: la red troncal como maqueta de mesa
 * (México y EE. UU. a la izquierda, el Atlántico con el cable MAREA sobre el
 * lecho marino, España a la derecha). El archivo, partido en paquetes
 * NUMERADOS, sale del celular; los routers reparten los paquetes por varios
 * caminos, llegan en desorden y el destino los acomoda por su número.
 *
 * El alumno puede cortar un enlace tocándolo (o desde el panel) y ver cómo
 * los paquetes se van por otro lado.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  type DestinoId,
  type EnlaceId,
  type Enlace,
  type NodoId,
  type Ruta,
  NODOS,
  ENLACES,
  nodo,
  DESTINOS,
  T_DNS,
} from "./paquete-internet-data";
import { type PlanEnvio, etapaDe, tiemposPaquetes, PAQUETES_DIBUJADOS } from "./paquete-internet-viaje";
import { Etiqueta3D, useReloj, texturaNumero, facil, suave, fijarU, NO, AMARILLO, OK, type Pt } from "./paquete-internet-comun";

const Y_CABLE = 0.34;
const POS_DNS: Pt = [-4.7, 0, 3.15];

function vNodo(id: NodoId): THREE.Vector3 {
  const p = nodo(id).pos;
  return new THREE.Vector3(p[0], Y_CABLE, p[2]);
}

function curvaEnlace(e: Enlace): THREE.CatmullRomCurve3 {
  const a = vNodo(e.a);
  const b = vNodo(e.b);
  if (e.tipo === "submarino") {
    // Baja por el talud y corre sobre el lecho marino.
    return new THREE.CatmullRomCurve3(
      [a, new THREE.Vector3(2.15, 0.12, 0.8), new THREE.Vector3(2.6, -0.62, 0.66), new THREE.Vector3(3.7, -0.7, 0.4), new THREE.Vector3(4.75, -0.62, 0.16), new THREE.Vector3(5.12, 0.12, 0.06), b],
      false,
      "centripetal",
    );
  }
  const mid = a.clone().lerp(b, 0.5);
  mid.y += 0.1 + a.distanceTo(b) * 0.07;
  return new THREE.CatmullRomCurve3([a, mid, b], false, "centripetal");
}

const CURVAS = Object.fromEntries(ENLACES.map((e) => [e.id, curvaEnlace(e)])) as Record<EnlaceId, THREE.CatmullRomCurve3>;
const TUBOS = Object.fromEntries(ENLACES.map((e) => [e.id, new THREE.TubeGeometry(CURVAS[e.id], 64, e.tipo === "submarino" ? 0.055 : 0.042, 10, false)])) as Record<EnlaceId, THREE.TubeGeometry>;
const TUBOS_TOQUE = Object.fromEntries(ENLACES.filter((e) => e.cortable).map((e) => [e.id, new THREE.TubeGeometry(CURVAS[e.id], 24, 0.2, 6, false)])) as Partial<Record<EnlaceId, THREE.TubeGeometry>>;

const SALIDA = new THREE.Vector3(nodo("casa").pos[0] - 0.62, 0.62, nodo("casa").pos[2] + 0.12);

/** Curva continua de la salida (el celular) al destino, por la lista de nodos. */
function curvaDeRuta(nodos: NodoId[]): THREE.CatmullRomCurve3 | null {
  const pts: THREE.Vector3[] = [SALIDA.clone()];
  for (let k = 0; k + 1 < nodos.length; k++) {
    const e = ENLACES.find((x) => (x.a === nodos[k] && x.b === nodos[k + 1]) || (x.b === nodos[k] && x.a === nodos[k + 1]));
    if (!e) continue;
    const sp = CURVAS[e.id].getSpacedPoints(24);
    const orden = e.a === nodos[k] ? sp : [...sp].reverse();
    pts.push(...orden.slice(1));
  }
  return pts.length >= 2 ? new THREE.CatmullRomCurve3(pts, false, "centripetal") : null;
}

/* ── Texturas de la maqueta ───────────────────────────────────────────── */

let _mapa: THREE.CanvasTexture | null = null;
/** Superficie de tierra: cuadrícula fina tipo carta náutica, con puntos en los cruces. */
function texturaMapa(): THREE.CanvasTexture {
  if (_mapa) return _mapa;
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0f2337";
  g.fillRect(0, 0, 512, 512);
  // manchas suaves (relieve)
  for (let i = 0; i < 40; i++) {
    const x = (i * 97) % 512;
    const y = (i * 181) % 512;
    const r = 30 + ((i * 53) % 70);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, "rgba(40,80,110,0.18)");
    gr.addColorStop(1, "rgba(40,80,110,0)");
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  g.strokeStyle = "rgba(120,190,255,0.24)";
  g.lineWidth = 1.5;
  for (let k = 0; k <= 512; k += 64) {
    g.beginPath();
    g.moveTo(k, 0);
    g.lineTo(k, 512);
    g.stroke();
    g.beginPath();
    g.moveTo(0, k);
    g.lineTo(512, k);
    g.stroke();
  }
  g.fillStyle = "rgba(160,220,255,0.55)";
  for (let x = 0; x <= 512; x += 64) for (let y = 0; y <= 512; y += 64) g.fillRect(x - 2, y - 2, 4, 4);
  _mapa = new THREE.CanvasTexture(c);
  _mapa.colorSpace = THREE.SRGBColorSpace;
  _mapa.wrapS = _mapa.wrapT = THREE.RepeatWrapping;
  _mapa.anisotropy = 8;
  return _mapa;
}

const cacheRotulos = new Map<string, THREE.CanvasTexture>();
/** Nombre de una región, grabado en la maqueta (textura de canvas; no se usa <Text>). */
function texturaRotulo(txt: string): THREE.CanvasTexture {
  const ya = cacheRotulos.get(txt);
  if (ya) return ya;
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.font = "800 64px system-ui, -apple-system, Segoe UI, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "rgba(170,215,255,0.55)";
  const letras = txt.split("").join("\u2009");
  g.fillText(letras, 512, 66);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cacheRotulos.set(txt, t);
  return t;
}

function Rotulo({ txt, pos, ancho, rot = 0 }: { txt: string; pos: Pt; ancho: number; rot?: number }) {
  const tex = useMemo(() => texturaRotulo(txt), [txt]);
  return (
    <mesh position={pos} rotation={[-Math.PI / 2, 0, rot]} raycast={() => null}>
      <planeGeometry args={[ancho, ancho / 8]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

const VERT_MAR = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vP;
  void main() {
    vUv = uv;
    vec4 p = modelMatrix * vec4(position, 1.0);
    vP = p.xyz;
    gl_Position = projectionMatrix * viewMatrix * p;
  }
`;
/** Mar de vidrio: oleaje suave, brillos que corren y transparencia para ver el cable del fondo. */
const FRAG_MAR = /* glsl */ `
  uniform float uT;
  varying vec2 vUv;
  varying vec3 vP;
  void main() {
    float w1 = sin(vP.x * 9.0 + uT * 0.9) * sin(vP.z * 6.0 - uT * 0.6);
    float w2 = sin((vP.x + vP.z) * 14.0 - uT * 1.4);
    float brillo = smoothstep(0.55, 1.0, w1 * 0.6 + w2 * 0.4);
    vec3 hondo = vec3(0.02, 0.16, 0.30);
    vec3 claro = vec3(0.10, 0.45, 0.70);
    float borde = smoothstep(0.0, 0.08, vUv.x) * smoothstep(0.0, 0.08, 1.0 - vUv.x);
    vec3 c = mix(claro, hondo, borde) + vec3(0.5, 0.8, 1.0) * brillo * 0.35;
    gl_FragColor = vec4(c, 0.42 + 0.2 * (1.0 - borde) + brillo * 0.15);
    #include <colorspace_fragment>
  }
`;

function Mar() {
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: VERT_MAR, fragmentShader: FRAG_MAR, uniforms: { uT: { value: 0 } }, transparent: true, depthWrite: false }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame(({ clock }) => fijarU(mat, "uT", clock.elapsedTime));
  return (
    <mesh position={[3.68, -0.06, 0.5]} rotation={[-Math.PI / 2, 0, 0]} material={mat} raycast={() => null}>
      <planeGeometry args={[3.1, 6.5, 1, 1]} />
    </mesh>
  );
}

function Terreno() {
  const mapa = useMemo(() => {
    const t = texturaMapa().clone();
    t.repeat.set(4, 2.6);
    t.needsUpdate = true;
    return t;
  }, []);
  const mapaEu = useMemo(() => {
    const t = texturaMapa().clone();
    t.repeat.set(1.3, 2.6);
    t.needsUpdate = true;
    return t;
  }, []);
  return (
    <group>
      {/* América */}
      <RoundedBox args={[9.7, 0.36, 6.6]} radius={0.12} smoothness={3} position={[-2.85, -0.18, 0.5]} receiveShadow>
        <meshStandardMaterial map={mapa} emissiveMap={mapa} emissive="#3b82f6" emissiveIntensity={0.22} color="#c8dcf0" roughness={0.78} metalness={0.05} />
      </RoundedBox>
      {/* Europa */}
      <RoundedBox args={[3.0, 0.36, 6.6]} radius={0.12} smoothness={3} position={[6.45, -0.18, 0.5]} receiveShadow>
        <meshStandardMaterial map={mapaEu} emissiveMap={mapaEu} emissive="#3b82f6" emissiveIntensity={0.22} color="#c8dcf0" roughness={0.78} metalness={0.05} />
      </RoundedBox>
      {/* Lecho marino */}
      <mesh position={[3.68, -0.86, 0.5]} receiveShadow>
        <boxGeometry args={[3.1, 0.06, 6.5]} />
        <meshStandardMaterial color="#0a1a2a" roughness={1} />
      </mesh>
      {/* Taludes */}
      {[
        [2.18, 0.42],
        [5.2, -0.42],
      ].map(([x, rot]) => (
        <mesh key={x} position={[x!, -0.5, 0.5]} rotation={[0, 0, rot!]}>
          <boxGeometry args={[0.08, 0.8, 6.5]} />
          <meshStandardMaterial color="#0b1d30" roughness={1} />
        </mesh>
      ))}
      {/* Superficie del mar: deja ver el cable del fondo */}
      <Mar />
      {/* Nombres de las regiones, grabados en la maqueta */}
      <Rotulo txt="MÉXICO" pos={[-4.2, 0.005, 3.35]} ancho={3.2} />
      <Rotulo txt="ESTADOS UNIDOS" pos={[-1.2, 0.005, -2.3]} ancho={4.4} />
      <Rotulo txt="OCÉANO ATLÁNTICO" pos={[3.68, -0.02, 2.4]} ancho={4.2} rot={Math.PI / 2} />
      <Rotulo txt="ESPAÑA" pos={[6.45, 0.005, 3.0]} ancho={2.4} />
      {/* Suelo del escenario */}
      <mesh position={[0.4, -0.42, 0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial color="#050c18" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  );
}

/* ── Nodos ────────────────────────────────────────────────────────────── */

function Led({ pos, color, fase = 0, r = 0.035 }: { pos: Pt; color: string; fase?: number; r?: number }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.emissiveIntensity = 1 + 2.2 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 5 + fase * 7.3));
  });
  return (
    <mesh position={pos}>
      <sphereGeometry args={[r, 10, 8]} />
      <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={1} />
    </mesh>
  );
}

function Celular() {
  return (
    <group position={[SALIDA.x, 0, SALIDA.z]}>
      {/* base */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.06, 32]} />
        <meshStandardMaterial color="#1b2a3d" roughness={0.4} metalness={0.6} />
      </mesh>
      <group position={[0, 0.42, 0]} rotation={[-0.18, 0.35, 0]}>
        <RoundedBox args={[0.36, 0.7, 0.04]} radius={0.04} smoothness={4} castShadow>
          <meshPhysicalMaterial color="#111827" metalness={0.6} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
        </RoundedBox>
        <mesh position={[0, 0, 0.021]}>
          <planeGeometry args={[0.32, 0.64]} />
          <meshStandardMaterial color="#0b1730" emissive="#38bdf8" emissiveIntensity={0.85} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

function Casa({ pos }: { pos: Pt }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.6, 0.7]} />
        <meshStandardMaterial color="#d6dde6" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.68, 0.42, 4]} />
        <meshStandardMaterial color="#9a3412" roughness={0.7} />
      </mesh>
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.36, 0.352]}>
          <planeGeometry args={[0.16, 0.14]} />
          <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {/* módem wifi */}
      <group position={[0.62, 0, 0.3]}>
        <RoundedBox args={[0.32, 0.08, 0.22]} radius={0.02} position={[0, 0.06, 0]}>
          <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.3} />
        </RoundedBox>
        {[-0.1, 0.1].map((x) => (
          <mesh key={x} position={[x, 0.24, -0.08]}>
            <cylinderGeometry args={[0.012, 0.012, 0.3, 6]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        ))}
        <Led pos={[0, 0.07, 0.115]} color="#22c55e" />
      </group>
    </group>
  );
}

function Proveedor({ pos }: { pos: Pt }) {
  return (
    <group position={pos}>
      <RoundedBox args={[0.72, 1.15, 0.62]} radius={0.04} position={[0, 0.575, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#1c3350" roughness={0.3} metalness={0.5} clearcoat={0.6} />
      </RoundedBox>
      {[0.3, 0.55, 0.8].map((y) => (
        <mesh key={y} position={[0, y, 0.313]}>
          <planeGeometry args={[0.56, 0.05]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={1.2} />
        </mesh>
      ))}
      <mesh position={[0.2, 1.5, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.7, 6]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} />
      </mesh>
      <Led pos={[0.2, 1.87, 0]} color="#ef4444" />
    </group>
  );
}

/** Router de la red troncal: columna oscura con un anillo que brilla cuando la ruta lo usa. */
function Router({ pos, activo, color, fase }: { pos: Pt; activo: boolean; color: string; fase: number }) {
  const anillo = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (anillo.current) anillo.current.emissiveIntensity = activo ? 1.6 + 1.2 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 3 + fase)) : 0.25;
  });
  const c = activo ? color : "#475569";
  return (
    <group position={pos}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[0.48, 0.52, 0.12, 6]} />
        <meshStandardMaterial color="#13202f" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.46, 6]} />
        <meshPhysicalMaterial color="#1a2b40" roughness={0.28} metalness={0.75} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.31, 0.04, 12, 40]} />
        <meshStandardMaterial ref={anillo} color={c} emissive={c} emissiveIntensity={1} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.05, 24]} />
        <meshStandardMaterial color="#0b1322" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

function CentroDatos({ pos, color, destacado }: { pos: Pt; color: string; destacado: boolean }) {
  return (
    <group position={pos}>
      <RoundedBox args={[1.1, 0.7, 0.76]} radius={0.04} position={[0, 0.35, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={destacado ? "#1e2c42" : "#162234"} roughness={0.3} metalness={0.55} clearcoat={0.7} />
      </RoundedBox>
      {[-0.36, -0.18, 0, 0.18, 0.36].map((x, k) => (
        <mesh key={x} position={[x, 0.35, 0.385]}>
          <planeGeometry args={[0.07, 0.5]} />
          <meshStandardMaterial color="#0b1220" emissive={destacado ? color : "#64748b"} emissiveIntensity={destacado ? 1.1 + (k % 2) * 0.6 : 0.25} />
        </mesh>
      ))}
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} position={[x, 0.73, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.05, 20]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function ServidorDns({ pos, resuelto }: { pos: Pt; resuelto: boolean }) {
  return (
    <group position={pos}>
      <RoundedBox args={[0.46, 0.76, 0.46]} radius={0.03} position={[0, 0.38, 0]} castShadow>
        <meshPhysicalMaterial color="#3b2a10" roughness={0.35} metalness={0.4} clearcoat={0.5} />
      </RoundedBox>
      {[0.2, 0.38, 0.56].map((y, k) => (
        <group key={y}>
          <mesh position={[0, y, 0.232]}>
            <planeGeometry args={[0.36, 0.1]} />
            <meshStandardMaterial color="#1c1917" roughness={0.4} />
          </mesh>
          <Led pos={[0.13, y, 0.24]} color={resuelto ? AMARILLO : "#a16207"} fase={k} r={0.03} />
        </group>
      ))}
    </group>
  );
}

function Estacion({ pos }: { pos: Pt }) {
  return (
    <group position={pos}>
      <RoundedBox args={[0.5, 0.42, 0.44]} radius={0.03} position={[0, 0.21, 0]} castShadow>
        <meshStandardMaterial color="#cbd5e1" roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.56, 0.06, 0.5]} />
        <meshStandardMaterial color="#0e7490" emissive="#0e7490" emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
    </group>
  );
}

function MarcaCorte({ id }: { id: EnlaceId }) {
  const p = CURVAS[id].getPointAt(0.5);
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.25;
  });
  return (
    <group ref={ref} position={[p.x, p.y + 0.05, p.z]}>
      {[1, -1].map((s) => (
        <mesh key={s} rotation={[0, 0, (s * Math.PI) / 4]}>
          <boxGeometry args={[0.42, 0.08, 0.08]} />
          <meshStandardMaterial color={NO} emissive={NO} emissiveIntensity={1.6} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Paquetes numerados ───────────────────────────────────────────────── */

const GEO_PAQ = new THREE.BoxGeometry(0.34, 0.34, 0.34);

function PaqueteNumerado({ i, curva, sale, dura, ini, finTodos, slot, compacto, color }: { i: number; curva: THREE.CatmullRomCurve3 | null; sale: number; dura: number; ini: number; finTodos: number; slot: THREE.Vector3; compacto: THREE.Vector3; color: string }) {
  const reloj = useReloj();
  const ref = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => texturaNumero(i + 1, color), [i, color]);
  const v = useMemo(() => new THREE.Vector3(), []);
  const fin = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const t = reloj.t;
    if (t < 0 || !curva) {
      m.visible = false;
      return;
    }
    const local = t - ini - sale;
    if (local <= 0) {
      m.visible = false;
      return;
    }
    m.visible = true;
    if (local < dura) {
      curva.getPointAt(Math.min(1, local / dura), v);
      m.position.set(v.x, v.y + 0.16, v.z);
      m.rotation.set(local * 2.2, local * 3.1, 0);
      m.scale.setScalar(1);
      return;
    }
    // Llegó: vuela a su lugar (por su número) y, al final, se juntan.
    curva.getPointAt(1, v);
    v.setY(v.y + 0.16);
    const q = facil((local - dura) / 0.4);
    const junta = facil((t - ini - finTodos - 0.45) / 0.5);
    fin.copy(slot).lerp(compacto, junta);
    m.position.copy(v).lerp(fin, q);
    m.rotation.set(0, 0, 0);
    m.scale.setScalar(1);
  });
  return (
    <mesh ref={ref} geometry={GEO_PAQ} visible={false} castShadow>
      <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.35} metalness={0.1} />
    </mesh>
  );
}

/** El paquete del DNS: va del celular al servidor DNS y regresa con la dirección IP. */
function ConsultaDns({ ini, dur }: { ini: number; dur: number }) {
  const reloj = useReloj();
  const ref = useRef<THREE.Mesh>(null);
  const curva = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [SALIDA.clone(), vNodo("isp").setY(0.9), new THREE.Vector3(POS_DNS[0], 1.0, POS_DNS[2]), vNodo("isp").setY(0.9), SALIDA.clone()],
        false,
        "centripetal",
      ),
    [],
  );
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const p = (reloj.t - ini) / dur;
    m.visible = reloj.t >= 0 && p > 0 && p < 1;
    if (!m.visible) return;
    curva.getPointAt(p, v);
    m.position.copy(v);
    m.rotation.y = p * 9;
  });
  return (
    <mesh ref={ref} visible={false}>
      <octahedronGeometry args={[0.15, 0]} />
      <meshStandardMaterial color={AMARILLO} emissive={AMARILLO} emissiveIntensity={2.2} roughness={0.3} />
    </mesh>
  );
}

/* ── Escala completa ──────────────────────────────────────────────────── */

export function poseRuta(aspecto: number): { pos: Pt; target: Pt } {
  // Distancia para que quepan los 15.5 de ancho de la maqueta (fov vertical 44°).
  const d = Math.min(27, Math.max(12, 10.4 / (0.404 * Math.max(0.3, aspecto))));
  const elev = aspecto < 1 ? 1.08 : 0.98; // rad: más cenital en el celular
  return { pos: [-0.1, -0.5 + d * Math.sin(elev), 1.0 + d * Math.cos(elev)], target: [-0.1, -0.5, 0.9] };
}

export function EscalaRuta({
  destino,
  rutas,
  cortados,
  plan,
  conDns,
  dnsResuelto,
  nPaquetes,
  color,
  onCortar,
  debil,
}: {
  destino: DestinoId;
  rutas: Ruta[];
  cortados: EnlaceId[];
  plan: PlanEnvio;
  conDns: boolean;
  dnsResuelto: boolean;
  nPaquetes: number;
  color: string;
  onCortar?: (id: EnlaceId) => void;
  debil: boolean;
}) {
  const reloj = useReloj();
  const [sobre, setSobre] = useState<EnlaceId | null>(null);
  useEffect(() => {
    document.body.style.cursor = sobre ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [sobre]);

  const principal = rutas[0];
  const enRuta = new Set<EnlaceId>(principal?.enlaces ?? []);
  const enAlterna = new Set<EnlaceId>(rutas.slice(1).flatMap((r) => r.enlaces));
  const nodosActivos = new Set<NodoId>(rutas.flatMap((r) => r.nodos));
  const dest = DESTINOS.find((d) => d.id === destino)!;
  const posDest = nodo(destino).pos;

  const etRuta = etapaDe(plan, "ruta");
  const etDns = etapaDe(plan, "dns");
  const n = Math.max(1, Math.min(PAQUETES_DIBUJADOS, nPaquetes));
  const curvas = useMemo(() => rutas.map((r) => curvaDeRuta(r.nodos)), [rutas]);
  const tiempos = useMemo(() => tiemposPaquetes(rutas, n, etRuta?.dur ?? 4), [rutas, n, etRuta?.dur]);

  // Fila de reensamble: arriba del destino, cada paquete en el lugar de su número.
  const fila = useMemo(() => {
    const paso = 0.4;
    const ancho = (n - 1) * paso;
    const cx = destino === "mad" ? 4.9 : posDest[0];
    const base = new THREE.Vector3(cx - ancho / 2, 1.55, posDest[2] - 0.2);
    const slots = Array.from({ length: n }, (_, i) => base.clone().add(new THREE.Vector3(i * paso, 0, 0)));
    const compactos = Array.from({ length: n }, (_, i) => base.clone().add(new THREE.Vector3(ancho / 2 - ((n - 1) * 0.35) / 2 + i * 0.35, 0, 0)));
    return { slots, compactos, centro: base.clone().add(new THREE.Vector3(ancho / 2, 0.5, 0)) };
  }, [n, posDest, destino]);

  const finTodos = tiempos.length ? Math.max(...tiempos.map((x) => x.sale + x.dura)) : 0;
  // ¿Ya se reensambló? (para la etiqueta)
  const listo = useRef<HTMLSpanElement>(null);
  const brillo = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((_, dt) => {
    const t = reloj.t;
    const fin = etRuta ? etRuta.ini + finTodos + 0.9 : Infinity;
    const ok = t >= 0 && t > fin;
    if (listo.current) listo.current.style.display = ok ? "inline" : "none";
    if (brillo.current) brillo.current.opacity += ((ok ? 0.55 : 0) - brillo.current.opacity) * suave(dt, 0.08);
  });

  const cortar = (id: EnlaceId) => (ev: ThreeEvent<MouseEvent>) => {
    ev.stopPropagation();
    onCortar?.(id);
  };

  return (
    <group position={[0, -0.4, 0]}>
      <Terreno />

      {/* Enlaces de fibra */}
      {ENLACES.map((e) => {
        const cortado = cortados.includes(e.id);
        const activo = enRuta.has(e.id);
        const alterna = !activo && enAlterna.has(e.id);
        const hover = sobre === e.id;
        const col = cortado ? NO : activo ? color : alterna ? "#7dd3fc" : e.tipo === "submarino" ? "#0891b2" : "#3b4b61";
        return (
          <group key={e.id}>
            <mesh geometry={TUBOS[e.id]} castShadow={!debil}>
              <meshStandardMaterial
                color={col}
                emissive={col}
                emissiveIntensity={cortado ? 0.7 : activo ? 1.5 : alterna ? 0.55 : hover ? 0.8 : 0.12}
                transparent={cortado}
                opacity={cortado ? 0.4 : 1}
                roughness={0.3}
                metalness={0.2}
              />
            </mesh>
            {TUBOS_TOQUE[e.id] && (
              <mesh
                geometry={TUBOS_TOQUE[e.id]}
                onClick={cortar(e.id)}
                onPointerOver={(ev) => {
                  ev.stopPropagation();
                  setSobre(e.id);
                }}
                onPointerOut={() => setSobre((s) => (s === e.id ? null : s))}
              >
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            )}
          </group>
        );
      })}
      {cortados.map((id) => (
        <MarcaCorte key={id} id={id} />
      ))}

      {/* Nodos */}
      <Celular />
      {NODOS.map((nd, k) => {
        if (nd.tipo === "casa") return <Casa key={nd.id} pos={nd.pos} />;
        if (nd.tipo === "isp") return <Proveedor key={nd.id} pos={nd.pos} />;
        if (nd.tipo === "router") return <Router key={nd.id} pos={nd.pos} activo={nodosActivos.has(nd.id)} color={color} fase={k} />;
        if (nd.tipo === "estacion") return <Estacion key={nd.id} pos={nd.pos} />;
        return <CentroDatos key={nd.id} pos={nd.pos} color={color} destacado={nd.id === destino} />;
      })}
      <ServidorDns pos={POS_DNS} resuelto={dnsResuelto} />

      {/* Paquetes */}
      {conDns && etDns && <ConsultaDns ini={etDns.ini} dur={etDns.dur || T_DNS} />}
      {etRuta &&
        tiempos.map((tp, i) => (
          <PaqueteNumerado key={`${i}-${tp.ruta}`} i={i} curva={curvas[tp.ruta] ?? null} sale={tp.sale} dura={tp.dura} ini={etRuta.ini} finTodos={finTodos} slot={fila.slots[i]!} compacto={fila.compactos[i]!} color={color} />
        ))}
      {/* Riel donde se reensambla */}
      <mesh position={[fila.centro.x, fila.centro.y - 0.68, fila.centro.z]}>
        <boxGeometry args={[Math.max(0.6, n * 0.37), 0.03, 0.44]} />
        <meshStandardMaterial ref={brillo} color={OK} emissive={OK} emissiveIntensity={1.4} transparent opacity={0} />
      </mesh>

      {/* Etiquetas: celular, destino, DNS y estado (máx. 4) */}
      <Etiqueta3D pos={[SALIDA.x - 0.1, 1.45, SALIDA.z + 0.1]} col={`${color}99`} ancha>
        <i className="fa-solid fa-mobile-screen-button" style={{ color }} />
        Tu celular
      </Etiqueta3D>
      <Etiqueta3D pos={[fila.centro.x, fila.centro.y + 0.05, fila.centro.z]} col={`${color}cc`}>
        <i className="fa-solid fa-server" style={{ color }} />
        <span style={{ fontFamily: "ui-monospace, monospace" }}>{dest.dominio}</span>
        <span ref={listo} style={{ display: "none", color: OK }}>
          · <i className="fa-solid fa-check" /> en orden
        </span>
      </Etiqueta3D>
      <Etiqueta3D pos={[POS_DNS[0], 1.25, POS_DNS[2] + 0.1]} col={dnsResuelto ? `${AMARILLO}aa` : undefined} ancha>
        <i className="fa-solid fa-address-book" style={{ color: AMARILLO }} />
        {dnsResuelto ? `DNS: ${dest.ip}` : "Servidor DNS"}
      </Etiqueta3D>
      {sobre && (
        <Etiqueta3D pos={(() => { const p = CURVAS[sobre].getPointAt(0.5); return [p.x, p.y + 0.7, p.z] as Pt; })()} col={`${NO}aa`}>
          <i className="fa-solid fa-scissors" style={{ color: NO }} />
          {cortados.includes(sobre) ? "Toca para reconectar" : `Toca para cortar ${ENLACES.find((e) => e.id === sobre)!.etq}`}
        </Etiqueta3D>
      )}
      {/* Secundarias (solo con «Ver detalles» y en pantalla ancha) */}
      {NODOS.filter((nd) => nd.tipo === "router" || nd.tipo === "estacion").map((nd) => (
        <Etiqueta3D key={nd.id} sec pos={[nd.pos[0], -0.05, nd.pos[2] + 0.62]}>
          {nd.etq.split(" (")[0]}
        </Etiqueta3D>
      ))}
    </group>
  );
}
