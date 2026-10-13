"use client";

/**
 * Escala CENTRO DE DATOS del viaje del paquete: de cerca, los pasillos fríos
 * de un centro de datos — filas de racks con miles de LEDs que parpadean (un
 * solo InstancedMesh con su propio sombreador), piso técnico de losetas
 * perforadas, charolas amarillas de fibra en el techo y luz fría. Al final del
 * viaje, los paquetes bajan por la charola y entran a UN servidor, que se
 * desliza fuera del rack y se enciende con el color del modo.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { type DestinoId, DESTINOS } from "./paquete-internet-data";
import { type PlanEnvio, etapaDe, PAQUETES_DIBUJADOS } from "./paquete-internet-viaje";
import { Etiqueta3D, useMando, useReloj, texturaNumero, facil, prng, fijarU, asignar, pedirEncuadre, OK, type Pt } from "./paquete-internet-comun";

const RACK = { w: 0.6, h: 2.1, d: 1.1 };
const PASO = 0.64;
const U_POR_RACK = 18;

const NOMBRE_CENTRO: Record<DestinoId, string> = { qro: "Querétaro", ash: "Ashburn, Virginia", mad: "Madrid" };

/* ── Texturas dibujadas ───────────────────────────────────────────────── */

let _frente: THREE.CanvasTexture | null = null;
/** Frente de un rack: servidores de 2U con rejillas, bahías de discos y asas. */
function texturaFrente(): THREE.CanvasTexture {
  if (_frente) return _frente;
  const W = 256;
  const H = 896;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const rnd = prng(7);
  g.fillStyle = "#07090d";
  g.fillRect(0, 0, W, H);
  // marco
  g.fillStyle = "#1a1f27";
  g.fillRect(0, 0, 14, H);
  g.fillRect(W - 14, 0, 14, H);
  const alto = (H - 40) / U_POR_RACK;
  for (let j = 0; j < U_POR_RACK; j++) {
    const y = 20 + j * alto;
    const vacio = rnd() < 0.08;
    if (vacio) {
      g.fillStyle = "#0b0d11";
      g.fillRect(18, y + 2, W - 36, alto - 4);
      continue;
    }
    const tono = 34 + Math.floor(rnd() * 14);
    const grd = g.createLinearGradient(0, y, 0, y + alto);
    grd.addColorStop(0, `rgb(${tono + 10},${tono + 12},${tono + 16})`);
    grd.addColorStop(1, `rgb(${tono - 8},${tono - 6},${tono - 3})`);
    g.fillStyle = grd;
    g.fillRect(18, y + 2, W - 36, alto - 4);
    // rejilla de ventilación
    g.fillStyle = "rgba(0,0,0,0.55)";
    const tipo = rnd();
    if (tipo < 0.5) {
      for (let x = 60; x < W - 40; x += 7) for (let yy = y + 8; yy < y + alto - 8; yy += 6) g.fillRect(x, yy, 4, 3);
    } else {
      // bahías de discos
      for (let k = 0; k < 6; k++) {
        const x = 56 + k * 28;
        g.fillStyle = "#15181e";
        g.fillRect(x, y + 6, 24, alto - 12);
        g.fillStyle = "#2b313b";
        g.fillRect(x + 2, y + 8, 20, 4);
      }
    }
    // asas
    g.fillStyle = "#5b6574";
    g.fillRect(22, y + 6, 6, alto - 12);
    g.fillRect(W - 28, y + 6, 6, alto - 12);
    // etiqueta
    g.fillStyle = "rgba(230,236,245,0.55)";
    g.fillRect(34, y + 8, 14, 4);
  }
  _frente = new THREE.CanvasTexture(c);
  _frente.colorSpace = THREE.SRGBColorSpace;
  _frente.anisotropy = 8;
  return _frente;
}

let _loseta: THREE.CanvasTexture | null = null;
/** Loseta de piso técnico (60 cm): borde, junta y, en los pasillos fríos, perforaciones. */
function texturaLoseta(perforada: boolean): THREE.CanvasTexture {
  if (!perforada && _loseta) return _loseta;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 256, 256);
  grd.addColorStop(0, "#9aa6b5");
  grd.addColorStop(1, "#8794a4");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#3d4651";
  g.lineWidth = 6;
  g.strokeRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(255,255,255,0.25)";
  g.lineWidth = 2;
  g.strokeRect(6, 6, 244, 244);
  if (perforada) {
    g.fillStyle = "#2a313b";
    for (let x = 22; x < 240; x += 12) for (let y = 22; y < 240; y += 12) {
      g.beginPath();
      g.arc(x, y, 3.2, 0, Math.PI * 2);
      g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (!perforada) _loseta = t;
  return t;
}

/* ── LEDs: un InstancedMesh con parpadeo en el sombreador ─────────────── */

const VERT_LED = /* glsl */ `
  attribute float aFase;
  varying float vFase;
  void main() {
    vFase = aFase;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;
const FRAG_LED = /* glsl */ `
  uniform float uT;
  varying float vFase;
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  void main() {
    float h = hash(vFase * 13.7);
    vec3 col = h < 0.74 ? vec3(0.18, 1.0, 0.42) : (h < 0.94 ? vec3(0.25, 0.62, 1.0) : vec3(1.0, 0.66, 0.12));
    float rate = 0.8 + hash(vFase * 7.1) * 6.0;
    float on = step(0.4, fract(uT * rate + hash(vFase * 3.3)));
    float fijo = step(0.55, hash(vFase * 5.9));
    float b = mix(on, 1.0, fijo);
    gl_FragColor = vec4(col * (0.18 + 2.4 * b), 1.0);
    #include <colorspace_fragment>
  }
`;

interface Fila {
  x: number;
  /** Hacia dónde mira el frente: +1 = +x, −1 = −x. */
  mira: 1 | -1;
}

function filasDe(debil: boolean): Fila[] {
  const pasillos = debil ? [0] : [-3.9, 0, 3.9];
  return pasillos.flatMap((cx) => [
    { x: cx - 1.3, mira: 1 as const },
    { x: cx + 1.3, mira: -1 as const },
  ]);
}

const Z0 = -1.2;

function Racks({ filas, n, objetivo }: { filas: Fila[]; n: number; objetivo: { fila: number; k: number } }) {
  const racks = useRef<THREE.InstancedMesh>(null);
  const leds = useRef<THREE.InstancedMesh>(null);
  const total = filas.length * n;
  const LEDS_POR_RACK = U_POR_RACK * 2;

  const mats = useMemo(() => {
    const frente = texturaFrente();
    const lado = new THREE.MeshStandardMaterial({ color: "#14181f", roughness: 0.55, metalness: 0.6 });
    const techo = new THREE.MeshStandardMaterial({ color: "#0d1015", roughness: 0.7, metalness: 0.4 });
    const cara = new THREE.MeshStandardMaterial({ map: frente, roughness: 0.45, metalness: 0.5, color: "#ffffff" });
    const atras = new THREE.MeshStandardMaterial({ color: "#0b0e13", roughness: 0.7, metalness: 0.4 });
    // orden de caras de BoxGeometry: +x, −x, +y, −y, +z (frente), −z
    return [lado, lado, techo, techo, cara, atras];
  }, []);
  const matLed = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: VERT_LED, fragmentShader: FRAG_LED, uniforms: { uT: { value: 0 } } }),
    [],
  );
  const geoRack = useMemo(() => new THREE.BoxGeometry(RACK.w, RACK.h, RACK.d), []);
  const geoLed = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.016, 0.012);
    const fases = new Float32Array(total * LEDS_POR_RACK);
    for (let i = 0; i < fases.length; i++) fases[i] = i * 0.618 + 0.13;
    g.setAttribute("aFase", new THREE.InstancedBufferAttribute(fases, 1));
    return g;
  }, [total, LEDS_POR_RACK]);
  useEffect(
    () => () => {
      geoRack.dispose();
      geoLed.dispose();
      matLed.dispose();
      mats.forEach((m) => m.dispose());
    },
    [geoRack, geoLed, matLed, mats],
  );

  useEffect(() => {
    const r = racks.current;
    const l = leds.current;
    if (!r || !l) return;
    const o = new THREE.Object3D();
    const local = new THREE.Matrix4();
    const m = new THREE.Matrix4();
    let i = 0;
    let j = 0;
    const alto = (RACK.h - 0.1) / U_POR_RACK;
    filas.forEach((f, fi) => {
      for (let k = 0; k < n; k++) {
        o.position.set(f.x, RACK.h / 2, Z0 - k * PASO);
        o.rotation.set(0, (f.mira * Math.PI) / 2, 0);
        o.scale.setScalar(1);
        o.updateMatrix();
        r.setMatrixAt(i++, o.matrix);
        const esObjetivo = fi === objetivo.fila && k === objetivo.k;
        for (let u = 0; u < U_POR_RACK; u++) {
          for (let q = 0; q < 2; q++) {
            // El servidor que recibe el paquete lleva sus propios LEDs.
            const y = -RACK.h / 2 + 0.07 + u * alto + alto * 0.5;
            const x = RACK.w / 2 - 0.09 - q * 0.028;
            local.makeTranslation(x, esObjetivo && u === 9 ? -50 : y, RACK.d / 2 + 0.002);
            m.multiplyMatrices(o.matrix, local);
            l.setMatrixAt(j++, m);
          }
        }
      }
    });
    r.instanceMatrix.needsUpdate = true;
    l.instanceMatrix.needsUpdate = true;
    r.computeBoundingSphere();
    l.computeBoundingSphere();
  }, [filas, n, objetivo]);

  useFrame(({ clock }) => {
    fijarU(matLed, "uT", clock.elapsedTime);
  });

  return (
    <group>
      <instancedMesh ref={racks} args={[geoRack, mats, total]} frustumCulled={false} />
      <instancedMesh ref={leds} args={[geoLed, matLed, total * LEDS_POR_RACK]} frustumCulled={false} />
    </group>
  );
}

/* ── Sala ─────────────────────────────────────────────────────────────── */

function Sala({ filas, n }: { filas: Fila[]; n: number }) {
  const largo = n * PASO + 4;
  const zc = Z0 - (n - 1) * PASO * 0.5;
  const piso = useMemo(() => {
    const t = texturaLoseta(false).clone();
    t.repeat.set(24 / 0.6, largo / 0.6);
    t.needsUpdate = true;
    return t;
  }, [largo]);
  const perf = useMemo(() => {
    const t = texturaLoseta(true);
    t.repeat.set(2, largo / 0.6);
    t.needsUpdate = true;
    return t;
  }, [largo]);
  const pasillos = useMemo(() => Array.from(new Set(filas.map((f) => Math.round((f.x + f.mira * 1.3) * 10) / 10))), [filas]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, zc]} receiveShadow>
        <planeGeometry args={[24, largo]} />
        <meshStandardMaterial map={piso} roughness={0.34} metalness={0.3} envMapIntensity={1.2} />
      </mesh>
      {/* Pasillos fríos: losetas perforadas por donde sube el aire frío */}
      {pasillos.map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.002, zc]}>
          <planeGeometry args={[1.2, largo]} />
          <meshStandardMaterial map={perf} roughness={0.38} metalness={0.35} envMapIntensity={1.2} />
        </mesh>
      ))}
      {/* Techo */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.6, zc]}>
        <planeGeometry args={[24, largo]} />
        <meshStandardMaterial color="#0a0e15" roughness={0.9} />
      </mesh>
      {/* Lámparas lineales de luz fría sobre cada pasillo */}
      {pasillos.map((x) => (
        <mesh key={`l${x}`} position={[x, 3.3, zc]}>
          <boxGeometry args={[0.14, 0.05, largo - 2]} />
          <meshStandardMaterial color="#e8f3ff" emissive="#dcecff" emissiveIntensity={2.4} />
        </mesh>
      ))}
      {/* Charolas: amarilla para fibra, escalerilla gris para cobre */}
      {filas.map((f, i) => (
        <group key={`c${i}`}>
          <mesh position={[f.x, 2.55, zc]}>
            <boxGeometry args={[0.3, 0.1, largo - 1.5]} />
            <meshStandardMaterial color="#eab308" roughness={0.45} metalness={0.1} />
          </mesh>
          <mesh position={[f.x - f.mira * 0.15, 2.85, zc]}>
            <boxGeometry args={[0.42, 0.035, largo - 1.5]} />
            <meshStandardMaterial color="#5b6472" roughness={0.4} metalness={0.7} />
          </mesh>
        </group>
      ))}
      {/* Remates de fila con una franja de color */}
      {filas.map((f, i) => (
        <group key={`r${i}`} position={[f.x, RACK.h / 2, Z0 + PASO * 0.5 + 0.02]}>
          <RoundedBox args={[RACK.d, RACK.h + 0.04, 0.06]} radius={0.02}>
            <meshPhysicalMaterial color="#1b2330" roughness={0.3} metalness={0.6} clearcoat={0.6} />
          </RoundedBox>
          <mesh position={[0, 0.2, 0.032]}>
            <planeGeometry args={[0.05, 1.3]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── El servidor que recibe el paquete ────────────────────────────────── */

function ServidorDestino({ pos, mira, plan, color, nPaquetes }: { pos: THREE.Vector3; mira: 1 | -1; plan: PlanEnvio; color: string; nPaquetes: number }) {
  const reloj = useReloj();
  const cajon = useRef<THREE.Group>(null);
  const tira = useRef<THREE.MeshStandardMaterial>(null);
  const paquetes = useRef<(THREE.Mesh | null)[]>([]);
  const n = Math.max(1, Math.min(6, nPaquetes, PAQUETES_DIBUJADOS));
  const et = etapaDe(plan, "centro");
  const texs = useMemo(() => Array.from({ length: n }, (_, i) => texturaNumero(i + 1, color)), [n, color]);
  const v = useMemo(() => new THREE.Vector3(), []);
  // Camino de cada paquete: baja de la charola amarilla y entra por el frente del servidor.
  const camino = useMemo(() => {
    const frente = new THREE.Vector3(pos.x + mira * 0.7, pos.y, pos.z);
    return new THREE.CatmullRomCurve3([new THREE.Vector3(pos.x, 2.75, pos.z + 2.2), new THREE.Vector3(pos.x + mira * 0.6, 2.4, pos.z + 1.0), new THREE.Vector3(pos.x + mira * 0.9, pos.y + 0.4, pos.z + 0.2), frente, new THREE.Vector3(pos.x + mira * 0.2, pos.y, pos.z)], false, "centripetal");
  }, [pos, mira]);
  const etiqueta = useRef<HTMLSpanElement>(null);

  useFrame(({ clock }) => {
    const t = reloj.t;
    const p = t < 0 || !et ? (t >= 0 ? 1 : 0) : Math.min(1, Math.max(0, (t - et.ini) / et.dur));
    const llego = t >= 0 && p >= 1;
    const activo = t >= 0 && p > 0;
    // El servidor sale del rack mientras recibe.
    const sale = activo ? facil(Math.min(p * 3, 1)) * (llego ? 0.18 : 0.32) : 0;
    if (cajon.current) cajon.current.position.x = mira * (RACK.d / 2 - 0.45 + sale);
    if (tira.current) tira.current.emissiveIntensity = activo ? 2.2 + (llego ? 0.8 : Math.sin(clock.elapsedTime * 18) * 0.9) : 0.6;
    for (let i = 0; i < n; i++) {
      const m = paquetes.current[i];
      if (!m) continue;
      const q = activo && !llego ? (p * 1.35 - i * 0.07) / 0.6 : -1;
      m.visible = q > 0 && q < 1;
      if (m.visible) {
        camino.getPointAt(facil(q), v);
        m.position.copy(v);
        m.rotation.set(q * 6, q * 4, 0);
      }
    }
    if (etiqueta.current) etiqueta.current.style.display = llego ? "inline" : "none";
  });

  return (
    <group>
      <group position={[pos.x, pos.y, pos.z]}>
        <group ref={cajon} rotation={[0, (mira * Math.PI) / 2, 0]}>
          <RoundedBox args={[RACK.w - 0.06, 0.1, 0.9]} radius={0.01} position={[0, 0, 0]} castShadow>
            <meshPhysicalMaterial color="#2a3240" roughness={0.3} metalness={0.8} clearcoat={0.4} />
          </RoundedBox>
          <mesh position={[0, 0, 0.452]}>
            <planeGeometry args={[RACK.w - 0.1, 0.06]} />
            <meshStandardMaterial ref={tira} color="#0b1220" emissive={color} emissiveIntensity={0.6} />
          </mesh>
        </group>
      </group>
      {texs.map((tex, i) => (
        <mesh key={i} ref={(m) => { paquetes.current[i] = m; }} visible={false}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.7} roughness={0.35} />
        </mesh>
      ))}
      <Etiqueta3D pos={[pos.x + mira * 0.75, pos.y + 0.48, pos.z]} col={`${color}cc`}>
        <i className="fa-solid fa-server" style={{ color }} />
        Tu servidor
        <span ref={etiqueta} style={{ display: "none", color: OK }}>
          · <i className="fa-solid fa-check" /> recibido
        </span>
      </Etiqueta3D>
    </group>
  );
}

/* ── Escala completa ──────────────────────────────────────────────────── */

export function poseCentro(aspecto: number): { pos: Pt; target: Pt } {
  const k = aspecto < 1 ? 1.2 : 1;
  return { pos: [-0.15, 1.9, -0.1 + 0.9 * (k - 1)], target: [0.45, 1.2, -7] };
}

export function EscalaCentro({ destino, plan, color, debil, nPaquetes }: { destino: DestinoId; plan: PlanEnvio; color: string; debil: boolean; nPaquetes: number }) {
  const reloj = useReloj();
  const mando = useMando();
  const scene = useThree((s) => s.scene);
  const aspecto = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const filas = useMemo(() => filasDe(debil), [debil]);
  const n = debil ? 12 : 18;
  // El servidor de destino: pasillo central, fila derecha, sexto rack.
  const filaObj = debil ? 1 : 3;
  const kObj = 5;
  const objetivo = useMemo(() => ({ fila: filaObj, k: kObj }), [filaObj]);
  const f = filas[filaObj]!;
  const posServ = useMemo(() => new THREE.Vector3(f.x, -RACK.h / 2 + 0.07 + 9 * ((RACK.h - 0.1) / U_POR_RACK) + (RACK.h - 0.1) / U_POR_RACK / 2 + RACK.h / 2, Z0 - kObj * PASO), [f.x]);
  const dest = DESTINOS.find((d) => d.id === destino)!;
  const et = etapaDe(plan, "centro");

  // Niebla y fondo de la sala (se restauran al salir).
  useEffect(() => {
    const antes = { fog: scene.fog, bg: scene.background };
    asignar(scene, "fog", new THREE.Fog("#070c16", 5, debil ? 18 : 26));
    asignar(scene, "background", new THREE.Color("#070c16"));
    return () => {
      asignar(scene, "fog", antes.fog);
      asignar(scene, "background", antes.bg);
    };
  }, [scene, debil]);

  const v0 = useMemo(() => new THREE.Vector3(), []);
  const v1 = useMemo(() => new THREE.Vector3(), []);
  const v2 = useMemo(() => new THREE.Vector3(), []);
  // Durante la llegada, la cámara avanza por el pasillo hasta el servidor.
  useFrame(() => {
    if (!mando || !et || !mando.sigue || mando.libre) return;
    const t = reloj.t;
    const p = (t - et.ini) / et.dur;
    if (t < 0 || p <= 0 || p >= 1.2) return;
    const e = facil(p * 1.1);
    const ini = poseCentro(aspecto);
    const k = aspecto < 1 ? 1.25 : 1;
    v0.set(...ini.pos).lerp(v1.set(f.x + f.mira * 1.95, posServ.y + 0.5, posServ.z + 1.9 * k), e);
    v2.set(...ini.target).lerp(v1.set(f.x + f.mira * 0.6, posServ.y - 0.05, posServ.z - 0.2), e);
    pedirEncuadre(mando, v0, v2, 0.3);
  });

  return (
    <group>
      <hemisphereLight args={["#cfe3ff", "#0b1220", 0.8]} />
      {(debil ? [-3, -8] : [-1.5, -4.5, -7.5, -10.5]).map((z) => (
        <pointLight key={z} position={[0, 3.0, z]} intensity={debil ? 9 : 7} distance={7.5} decay={2} color="#dbeafe" />
      ))}
      <directionalLight position={[2, 6, 3]} intensity={0.55} color="#dcecff" />
      <pointLight position={[posServ.x - 0.9, posServ.y + 0.6, posServ.z + 0.3]} intensity={2.2} distance={3.2} color={color} />
      <Sala filas={filas} n={n} />
      <Racks filas={filas} n={n} objetivo={objetivo} />
      <ServidorDestino pos={posServ} mira={f.mira} plan={plan} color={color} nPaquetes={nPaquetes} />
      <Etiqueta3D pos={[0.2, 3.0, Z0 - (n - 2) * PASO]} col="#7dd3fc88" ancha>
        <i className="fa-solid fa-building" style={{ color: "#7dd3fc" }} />
        Centro de datos · {NOMBRE_CENTRO[destino]}
      </Etiqueta3D>
      <Etiqueta3D pos={[posServ.x - 1.15, posServ.y - 0.38, posServ.z + 0.35]} col="#ffffff33" ancha>
        <span style={{ fontFamily: "ui-monospace, monospace" }}>
          {dest.dominio} · {dest.ip}
        </span>
      </Etiqueta3D>
    </group>
  );
}
