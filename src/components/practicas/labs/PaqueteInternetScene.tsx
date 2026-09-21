"use client";

/**
 * Escena 3D del laboratorio "El viaje de un paquete por Internet" (CD-I-P10).
 * Tres vistas:
 *
 *  - viaje: red esquemática de la Ciudad de México a Madrid. Tu casa, el
 *    proveedor, el servidor DNS, los routers de Guadalajara y Monterrey, los
 *    centros de datos de Querétaro, Ashburn y Madrid y el cable submarino
 *    MAREA bajo el Atlántico. La consulta DNS y los paquetes recorren la ruta
 *    más corta; los enlaces cortados se ven rotos y la ruta se desvía.
 *  - consulta: una wifi pública en un café con un espía, el router, el
 *    servidor de la IA legítimo y uno de phishing, y la banda donde se
 *    verifican las cinco afirmaciones que devuelve la IA.
 *  - dispositivo: un teléfono desarmado, la columna de su huella anual y sus
 *    tres destinos posibles: cajón, basura común o planta de reciclaje con los
 *    metales recuperados.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo real. NO
 * se usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type NodoId,
  type EnlaceId,
  type Enlace,
  type DestinoId,
  type SitioId,
  type AfirmacionId,
  type DecisionIA,
  type DestinoFinalId,
  NODOS,
  ENLACES,
  nodo,
  DESTINOS,
  SITIOS,
  AFIRMACIONES_IA,
  T_DNS,
  T_DATOS,
  T_ENVIO_IA,
  T_RESP_IA,
  T_VUELO,
  huellaAnual,
  ANIOS_BASE,
  ANIOS_MAX,
  METALES,
  metalesRecuperadosG,
  masa,
  num,
} from "./paquete-internet-data";

export type VistaPaquete = "viaje" | "consulta" | "dispositivo";

export interface PaqueteSceneProps {
  vista: VistaPaquete;
  modoColor: string;
  resetNonce: number;
  // Viaje
  destino: DestinoId;
  rutaClave: string;
  cortados: EnlaceId[];
  envioNonce: number;
  conDns: boolean;
  paquetesVisibles: number;
  dnsResuelto: boolean;
  // Consulta
  sitio: SitioId | null;
  iaNonce: number;
  iaCifrado: boolean;
  espiaTexto: string;
  espiaCifrado: string;
  verificadas: AfirmacionId[];
  decisiones: Partial<Record<AfirmacionId, DecisionIA>>;
  declarado: boolean;
  // Dispositivo
  anios: number;
  destinoFinal: DestinoFinalId | null;
  destinoNonce: number;
  lote: number;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const NO = "#f87171";
const AMARILLO = "#fbbf24";

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

function Persona({ pos, color, escala = 1, rotY = 0 }: { pos: Pt; color: string; escala?: number; rotY?: number }) {
  return (
    <group position={pos} scale={escala} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.17, 0.42, 6, 14]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.98, 0]} castShadow>
        <sphereGeometry args={[0.15, 18, 14]} />
        <meshStandardMaterial color="#f1c9a5" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ── Ráfaga de paquetes a lo largo de un camino ───────────────────────── */

const MAX_PAQUETES = 28;
const GEO_PAQUETE = new THREE.BoxGeometry(1, 0.62, 0.8);

/** Clave "x,y,z;x,y,z;…" → curva. Se pasa como string para no depender de la identidad de un arreglo. */
function curvaDeClave(clave: string): THREE.CatmullRomCurve3 | null {
  const pts = clave
    .split(";")
    .filter(Boolean)
    .map((s) => {
      const [x, y, z] = s.split(",").map(Number);
      return new THREE.Vector3(x ?? 0, y ?? 0, z ?? 0);
    });
  if (pts.length < 2) return null;
  return new THREE.CatmullRomCurve3(pts, false, "centripetal");
}

const claveDe = (pts: THREE.Vector3[]) => pts.map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)},${p.z.toFixed(3)}`).join(";");

function Rafaga({ clave, nonce, inicio, duracion, n, color, tam = 0.13 }: { clave: string; nonce: number; inicio: number; duracion: number; n: number; color: string; tam?: number }) {
  const curva = useMemo(() => curvaDeClave(clave), [clave]);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const visto = useRef(nonce);
  const t = useRef(Number.POSITIVE_INFINITY);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    if (visto.current !== nonce) {
      visto.current = nonce;
      t.current = 0;
    }
    t.current += dt;
    const m = mesh.current;
    if (!m) return;
    const k = Math.max(1, Math.min(n, MAX_PAQUETES));
    const gap = k > 1 ? Math.min(0.16, (duracion * 0.45) / (k - 1)) : 0;
    const viaje = duracion - gap * (k - 1);
    for (let i = 0; i < MAX_PAQUETES; i++) {
      const u = (t.current - inicio - i * gap) / viaje;
      if (!curva || i >= k || !(u > 0 && u < 1)) {
        obj.position.set(0, -60, 0);
        obj.scale.setScalar(0.0001);
      } else {
        curva.getPointAt(u, v);
        obj.position.set(v.x, v.y + 0.12, v.z);
        obj.rotation.set(0, u * 8, 0);
        obj.scale.setScalar(tam);
      }
      obj.updateMatrix();
      m.setMatrixAt(i, obj.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[GEO_PAQUETE, undefined, MAX_PAQUETES]} frustumCulled={false}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} roughness={0.3} toneMapped={false} />
    </instancedMesh>
  );
}

/** Anillo que se expande cuando llega algo a un punto. */
function Pulso({ pos, nonce, retraso, color }: { pos: Pt; nonce: number; retraso: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const visto = useRef(nonce);
  const t = useRef(Number.POSITIVE_INFINITY);
  useFrame((_, dt) => {
    if (visto.current !== nonce) {
      visto.current = nonce;
      t.current = 0;
    }
    t.current += dt;
    const p = (t.current - retraso) / 1.3;
    if (ref.current && mat.current) {
      const activo = p > 0 && p < 1;
      ref.current.visible = activo;
      ref.current.scale.setScalar(0.4 + p * 1.8);
      mat.current.opacity = activo ? (1 - p) * 0.85 : 0;
    }
  });
  return (
    <mesh ref={ref} position={pos} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.55, 0.68, 40]} />
      <meshBasicMaterial ref={mat} color={color} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. EL VIAJE DEL PAQUETE
 * ════════════════════════════════════════════════════════════════════════ */

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
    return new THREE.CatmullRomCurve3(
      [a, new THREE.Vector3(2.2, 0.1, 0.8), new THREE.Vector3(2.75, -0.58, 0.62), new THREE.Vector3(3.7, -0.62, 0.4), new THREE.Vector3(4.65, -0.58, 0.18), new THREE.Vector3(5.05, 0.1, 0.08), b],
      false,
      "centripetal",
    );
  }
  const mid = a.clone().lerp(b, 0.5);
  mid.y += 0.12 + a.distanceTo(b) * 0.06;
  return new THREE.CatmullRomCurve3([a, mid, b], false, "centripetal");
}

const CURVAS = Object.fromEntries(ENLACES.map((e) => [e.id, curvaEnlace(e)])) as Record<EnlaceId, THREE.CatmullRomCurve3>;
const TUBOS = Object.fromEntries(ENLACES.map((e) => [e.id, new THREE.TubeGeometry(CURVAS[e.id], 64, e.tipo === "submarino" ? 0.05 : 0.035, 8, false)])) as Record<EnlaceId, THREE.TubeGeometry>;

function enlaceEntre(a: NodoId, b: NodoId): Enlace | undefined {
  return ENLACES.find((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a));
}

/** Puntos del camino que siguen los paquetes por la ruta "casa>isp>qro". */
function clavePorRuta(rutaClave: string): string {
  const ids = rutaClave.split(">").filter(Boolean) as NodoId[];
  const pts: THREE.Vector3[] = [new THREE.Vector3(nodo("casa").pos[0] - 0.55, 0.55, nodo("casa").pos[2] + 0.1)];
  for (let k = 0; k + 1 < ids.length; k++) {
    const e = enlaceEntre(ids[k]!, ids[k + 1]!);
    if (!e) continue;
    const sp = CURVAS[e.id].getSpacedPoints(24);
    const orden = e.a === ids[k] ? sp : [...sp].reverse();
    pts.push(...(pts.length > 1 ? orden.slice(1) : orden));
  }
  return claveDe(pts);
}

const CLAVE_DNS = claveDe([
  new THREE.Vector3(nodo("casa").pos[0] - 0.55, 0.55, nodo("casa").pos[2] + 0.1),
  vNodo("isp"),
  new THREE.Vector3(POS_DNS[0], 0.7, POS_DNS[2]),
  vNodo("isp"),
  new THREE.Vector3(nodo("casa").pos[0] - 0.55, 0.55, nodo("casa").pos[2] + 0.1),
]);

function Led({ pos, color, fase = 0 }: { pos: Pt; color: string; fase?: number }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.emissiveIntensity = 0.6 + 1.6 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 5 + fase * 7.3));
  });
  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.035, 8, 6]} />
      <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={1} toneMapped={false} />
    </mesh>
  );
}

function CentroDatos({ pos, color, destacado }: { pos: Pt; color: string; destacado: boolean }) {
  const ventiladores = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ventiladores.current) ventiladores.current.children.forEach((c) => (c.rotation.y += dt * 6));
  });
  return (
    <group position={pos}>
      <mesh position={[0, 0.33, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.05, 0.66, 0.72]} />
        <meshStandardMaterial color={destacado ? "#1e293b" : "#172234"} roughness={0.45} metalness={0.3} />
      </mesh>
      {[-0.3, -0.1, 0.1, 0.3].map((x, k) => (
        <group key={x}>
          <mesh position={[x, 0.33, 0.365]}>
            <boxGeometry args={[0.15, 0.52, 0.01]} />
            <meshStandardMaterial color="#0b1220" roughness={0.3} />
          </mesh>
          {[0.16, 0.3, 0.44].map((y, j) => (
            <Led key={y} pos={[x - 0.03 + j * 0.03, y, 0.375]} color={destacado ? color : "#64748b"} fase={k + j} />
          ))}
        </group>
      ))}
      <group ref={ventiladores}>
        {[-0.28, 0.28].map((x) => (
          <mesh key={x} position={[x, 0.7, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.05, 6]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.35} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function RouterTroncal({ pos }: { pos: Pt }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.4, 0.44, 8]} />
        <meshStandardMaterial color="#1f3a5a" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.04, 8]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.35} />
      </mesh>
      {[0, 1, 2, 3].map((k) => (
        <Led key={k} pos={[Math.cos((k / 4) * Math.PI * 2) * 0.3, 0.3, Math.sin((k / 4) * Math.PI * 2) * 0.3 + 0.12]} color="#22d3ee" fase={k} />
      ))}
    </group>
  );
}

function Casa({ pos }: { pos: Pt }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.6, 0.7]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.68, 0.42, 4]} />
        <meshStandardMaterial color="#b45309" roughness={0.7} />
      </mesh>
      <mesh position={[0.12, 0.2, 0.355]}>
        <boxGeometry args={[0.18, 0.34, 0.01]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* Celular */}
      <group position={[-0.55, 0.02, 0.1]}>
        <mesh position={[0, 0.3, 0]} rotation={[-0.25, 0.3, 0]}>
          <boxGeometry args={[0.2, 0.38, 0.03]} />
          <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0.006, 0.303, 0.018]} rotation={[-0.25, 0.3, 0]}>
          <boxGeometry args={[0.17, 0.33, 0.005]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
      </group>
      {/* Router wifi */}
      <group position={[0.62, 0, 0.3]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.32, 0.08, 0.22]} />
          <meshStandardMaterial color="#111827" roughness={0.4} />
        </mesh>
        {[-0.1, 0.1].map((x) => (
          <mesh key={x} position={[x, 0.24, -0.08]}>
            <cylinderGeometry args={[0.012, 0.012, 0.3, 6]} />
            <meshStandardMaterial color="#111827" />
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
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 1.1, 0.6]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.45} metalness={0.25} />
      </mesh>
      {[0.3, 0.55, 0.8].map((y) => (
        <mesh key={y} position={[0, y, 0.305]}>
          <boxGeometry args={[0.56, 0.06, 0.01]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={0.5} />
        </mesh>
      ))}
      <mesh position={[0.2, 1.45, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.7, 6]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.7} />
      </mesh>
      <Led pos={[0.2, 1.82, 0]} color="#ef4444" />
    </group>
  );
}

function ServidorDns({ pos, resuelto }: { pos: Pt; resuelto: boolean }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.36, 0]} castShadow>
        <boxGeometry args={[0.42, 0.72, 0.42]} />
        <meshStandardMaterial color="#422006" roughness={0.5} />
      </mesh>
      {[0.2, 0.36, 0.52].map((y, k) => (
        <group key={y}>
          <mesh position={[0, y, 0.215]}>
            <boxGeometry args={[0.34, 0.1, 0.01]} />
            <meshStandardMaterial color="#1c1917" />
          </mesh>
          <Led pos={[0.12, y, 0.225]} color={resuelto ? AMARILLO : "#a16207"} fase={k} />
        </group>
      ))}
    </group>
  );
}

function Estacion({ pos }: { pos: Pt }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.46, 0.4, 0.4]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.43, 0]}>
        <boxGeometry args={[0.52, 0.06, 0.46]} />
        <meshStandardMaterial color="#0e7490" roughness={0.5} />
      </mesh>
    </group>
  );
}

function MarcaCorte({ id }: { id: EnlaceId }) {
  const p = CURVAS[id].getPointAt(0.5);
  return (
    <group position={[p.x, p.y + 0.02, p.z]}>
      {[1, -1].map((s) => (
        <mesh key={s} rotation={[0, 0, s * Math.PI / 4]}>
          <boxGeometry args={[0.36, 0.07, 0.07]} />
          <meshStandardMaterial color={NO} emissive={NO} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function EscenaViaje({
  destino,
  rutaClave,
  cortados,
  envioNonce,
  conDns,
  paquetesVisibles,
  dnsResuelto,
  modoColor,
}: {
  destino: DestinoId;
  rutaClave: string;
  cortados: EnlaceId[];
  envioNonce: number;
  conDns: boolean;
  paquetesVisibles: number;
  dnsResuelto: boolean;
  modoColor: string;
}) {
  const ids = rutaClave.split(">").filter(Boolean) as NodoId[];
  const enRuta = new Set<EnlaceId>();
  for (let k = 0; k + 1 < ids.length; k++) {
    const e = enlaceEntre(ids[k]!, ids[k + 1]!);
    if (e) enRuta.add(e.id);
  }
  const clavePaquetes = useMemo(() => clavePorRuta(rutaClave), [rutaClave]);
  const dest = DESTINOS.find((d) => d.id === destino)!;
  const posDest = nodo(destino).pos;
  const inicioDatos = conDns ? T_DNS : 0;

  return (
    <group position={[0, -0.6, 0]}>
      {/* Continente americano, océano y Europa */}
      <mesh position={[-2.6, -0.16, 0.5]} receiveShadow>
        <boxGeometry args={[10.2, 0.32, 6.4]} />
        <meshStandardMaterial color="#10263a" roughness={0.9} />
      </mesh>
      <mesh position={[6.35, -0.16, 0.5]} receiveShadow>
        <boxGeometry args={[2.9, 0.32, 6.4]} />
        <meshStandardMaterial color="#10263a" roughness={0.9} />
      </mesh>
      <mesh position={[3.65, -0.8, 0.5]}>
        <boxGeometry args={[2.4, 0.04, 6.4]} />
        <meshStandardMaterial color="#0b1a2b" roughness={1} />
      </mesh>
      <mesh position={[3.65, -0.05, 0.5]}>
        <boxGeometry args={[2.4, 0.02, 6.4]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.22} roughness={0.1} metalness={0.2} depthWrite={false} />
      </mesh>
      <gridHelper args={[16, 32, "#1e3a5f", "#132a40"]} position={[0.2, 0.005, 0.5]} />

      {/* Enlaces */}
      {ENLACES.map((e) => {
        const cortado = cortados.includes(e.id);
        const activo = enRuta.has(e.id);
        const col = cortado ? NO : activo ? modoColor : e.tipo === "submarino" ? "#0891b2" : "#475569";
        return (
          <mesh key={e.id} geometry={TUBOS[e.id]}>
            <meshStandardMaterial
              color={col}
              emissive={col}
              emissiveIntensity={cortado ? 0.5 : activo ? 0.9 : 0.12}
              transparent={cortado}
              opacity={cortado ? 0.45 : 1}
              roughness={0.35}
              toneMapped={!activo}
            />
          </mesh>
        );
      })}
      {cortados.map((id) => (
        <MarcaCorte key={id} id={id} />
      ))}

      {/* Nodos */}
      {NODOS.map((n) => {
        if (n.tipo === "casa") return <Casa key={n.id} pos={n.pos} />;
        if (n.tipo === "isp") return <Proveedor key={n.id} pos={n.pos} />;
        if (n.tipo === "router") return <RouterTroncal key={n.id} pos={n.pos} />;
        if (n.tipo === "estacion") return <Estacion key={n.id} pos={n.pos} />;
        return <CentroDatos key={n.id} pos={n.pos} color={modoColor} destacado={n.id === destino} />;
      })}
      <ServidorDns pos={POS_DNS} resuelto={dnsResuelto} />

      {/* Etiquetas */}
      {NODOS.map((n) => {
        const esDest = n.id === destino;
        const alto = n.tipo === "isp" ? 2.15 : n.tipo === "casa" ? 1.35 : n.tipo === "datos" ? 1.15 : 0.85;
        const corto = n.id === "casa" ? "Tu casa" : n.id === "isp" ? "Proveedor" : n.id === "bil" ? "Bilbao" : n.id === "ash" ? "Ashburn" : n.etq;
        return (
          <Etiqueta key={n.id} pos={[n.pos[0], alto, n.pos[2]]} df={esDest ? 11 : 12.5} fs={esDest ? 12 : 10.5} col={esDest ? `${modoColor}cc` : undefined}>
            {n.tipo === "datos" && <i className="fa-solid fa-server" style={{ color: esDest ? modoColor : "#94a3b8" }} />}
            {corto}
          </Etiqueta>
        );
      })}
      <Etiqueta pos={[POS_DNS[0], 0.02, POS_DNS[2] + 0.62]} df={11.5} fs={10.5} col={dnsResuelto ? `${AMARILLO}aa` : undefined}>
        <i className="fa-solid fa-address-book" style={{ color: AMARILLO }} />
        {dnsResuelto ? `DNS: ${dest.dominio} → ${dest.ip}` : "Servidor DNS"}
      </Etiqueta>
      <Etiqueta pos={[3.65, -0.45, 2.9]} df={12} fs={10.5} col="#0891b2aa">
        <i className="fa-solid fa-water" style={{ color: "#67e8f9" }} />
        Cable submarino MAREA · 6 600 km
      </Etiqueta>
      <Etiqueta pos={[3.65, 0.2, -2.3]} df={13} fs={10}>
        Océano Atlántico (distancias no a escala)
      </Etiqueta>

      {/* Consulta DNS y paquetes */}
      {conDns && <Rafaga clave={CLAVE_DNS} nonce={envioNonce} inicio={0} duracion={T_DNS} n={1} color={AMARILLO} tam={0.17} />}
      <Rafaga clave={clavePaquetes} nonce={envioNonce} inicio={inicioDatos} duracion={T_DATOS} n={paquetesVisibles} color={modoColor} />
      <Pulso pos={[posDest[0], 0.03, posDest[2]]} nonce={envioNonce} retraso={inicioDatos + T_DATOS - 0.2} color={modoColor} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. CONSULTA SEGURA A LA IA
 * ════════════════════════════════════════════════════════════════════════ */

const POS_LAPTOP: Pt = [-3.5, 0.95, 1.5];
const POS_ROUTER: Pt = [-3.0, 2.15, -1.7];
const POS_NUBE: Pt = [-0.4, 1.9, -1.0];
const POS_LEGIT: Pt = [2.4, 0, -1.9];
const POS_FALSO: Pt = [5.3, 0, -0.9];
const X_BANDA = 0.9;
const Z_BANDA = 2.3;

function Laptop({ pos, pantalla, rotY = 0 }: { pos: Pt; pantalla: string; rotY?: number }) {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh>
        <boxGeometry args={[0.62, 0.03, 0.42]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} />
      </mesh>
      <group position={[0, 0.02, -0.2]} rotation={[-0.3, 0, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.62, 0.4, 0.02]} />
          <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.2, 0.012]}>
          <boxGeometry args={[0.56, 0.34, 0.005]} />
          <meshStandardMaterial color={pantalla} emissive={pantalla} emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Mesa({ pos }: { pos: Pt }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.62, 0.05, 32]} />
        <meshStandardMaterial color="#92400e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.76, 10]} />
        <meshStandardMaterial color="#1f2937" metalness={0.6} />
      </mesh>
    </group>
  );
}

function OndasWifi({ pos, color }: { pos: Pt; color: string }) {
  const grupo = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    grupo.current?.children.forEach((c, k) => {
      const p = (clock.elapsedTime * 0.5 + k / 3) % 1;
      c.scale.setScalar(0.3 + p * 2.4);
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = (1 - p) * 0.35;
    });
  });
  return (
    <group ref={grupo} position={pos}>
      {[0, 1, 2].map((k) => (
        <mesh key={k} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.46, 0.5, 40]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function PantallaEspia({ nonce, retraso, cifrado, texto, cifra, dominio }: { nonce: number; retraso: number; cifrado: boolean; texto: string; cifra: string; dominio: string }) {
  const espera = useRef<HTMLDivElement>(null);
  const captura = useRef<HTMLDivElement>(null);
  const visto = useRef(nonce);
  const t = useRef(nonce > 0 ? 99 : Number.NEGATIVE_INFINITY);
  useFrame((_, dt) => {
    if (visto.current !== nonce) {
      visto.current = nonce;
      t.current = 0;
    }
    t.current += dt;
    const ya = t.current > retraso;
    if (espera.current) espera.current.style.display = ya ? "none" : "block";
    if (captura.current) captura.current.style.display = ya ? "block" : "none";
  });
  const col = cifrado ? OK : NO;
  return (
    <Html position={[-6.0, 2.95, -0.9]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ width: 230, borderRadius: 10, overflow: "hidden", border: `1px solid ${col}88`, background: "rgba(2,6,14,0.94)", boxShadow: "0 10px 24px -10px #000" }}>
        <div style={{ padding: "5px 9px", fontSize: 10, fontWeight: 900, color: "#fff", background: "rgba(127,29,29,0.55)", letterSpacing: "0.04em" }}>
          <i className="fa-solid fa-user-secret" style={{ marginRight: 6 }} />
          LO QUE CAPTURA EL ESPÍA
        </div>
        <div ref={espera} style={{ padding: "8px 10px", fontSize: 10.5, color: "#94a3b8", fontFamily: "ui-monospace, monospace" }}>
          Escuchando la wifi del café…
        </div>
        <div ref={captura} style={{ display: "none", padding: "7px 10px 9px", fontFamily: "ui-monospace, monospace" }}>
          <div style={{ fontSize: 9.5, color: "#94a3b8", marginBottom: 4 }}>destino: {dominio}</div>
          {cifrado ? (
            <div style={{ fontSize: 9.5, color: OK, whiteSpace: "pre", lineHeight: 1.35 }}>{cifra}</div>
          ) : (
            <div style={{ fontSize: 10, color: "#fecaca", lineHeight: 1.4, whiteSpace: "normal" }}>{texto || "(mensaje vacío)"}</div>
          )}
          <div style={{ fontSize: 9.5, fontWeight: 900, color: col, marginTop: 5 }}>{cifrado ? "HTTPS: solo bytes cifrados" : "HTTP: texto legible"}</div>
        </div>
      </div>
    </Html>
  );
}

function Tarjeta({ i, verificada, decision, correcta }: { i: number; verificada: boolean; decision: DecisionIA | undefined; correcta: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const x = X_BANDA + i * 0.95;
  useFrame((_, dt) => {
    if (!ref.current) return;
    // Usar: sube a «tu trabajo». Descartar: se acuesta sobre la banda.
    const yDest = decision === "usar" ? 1.3 : decision === "descartar" ? 0.58 : 0.95;
    const rotDest = decision === "descartar" ? -Math.PI / 2 : 0;
    const zDest = Z_BANDA;
    const s = suave(dt, 0.08);
    ref.current.position.y += (yDest - ref.current.position.y) * s;
    ref.current.position.z += (zDest - ref.current.position.z) * s;
    ref.current.rotation.x += (rotDest - ref.current.rotation.x) * s;
  });
  const col = decision ? (decision === "usar" ? OK : NO) : verificada ? (correcta ? "#86efac" : "#fca5a5") : "#cbd5e1";
  const bien = decision ? (decision === "usar") === correcta : null;
  return (
    <group ref={ref} position={[x, 0.95, Z_BANDA]}>
      <mesh castShadow>
        <boxGeometry args={[0.72, 0.9, 0.05]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, 0.03]}>
        <boxGeometry args={[0.72, 0.16, 0.01]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={decision ? 0.6 : 0.2} />
      </mesh>
      {[0.08, -0.04, -0.16, -0.28].map((y, k) => (
        <mesh key={y} position={[-0.04 + (k % 2) * 0.04, y, 0.03]}>
          <boxGeometry args={[0.5 - (k % 3) * 0.08, 0.035, 0.005]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      ))}
      {verificada && !decision && (
        <mesh position={[0.26, -0.25, 0.1]}>
          <torusGeometry args={[0.1, 0.022, 8, 24]} />
          <meshStandardMaterial color={AMARILLO} emissive={AMARILLO} emissiveIntensity={0.8} />
        </mesh>
      )}
      <Html position={[0, 0.72, 0]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ padding: "2px 8px", borderRadius: 8, background: "rgba(4,10,22,0.88)", border: `1px solid ${col}`, color: "#fff", fontSize: 11, fontWeight: 900, whiteSpace: "nowrap" }}>
          {i + 1}
          {verificada && <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: 5, color: AMARILLO }} />}
          {bien !== null && <i className={`fa-solid ${bien ? "fa-check" : "fa-xmark"}`} style={{ marginLeft: 5, color: bien ? OK : NO }} />}
        </div>
      </Html>
    </group>
  );
}

function EscenaConsulta({
  sitio,
  iaNonce,
  iaCifrado,
  espiaTexto,
  espiaCifrado,
  verificadas,
  decisiones,
  declarado,
  modoColor,
}: {
  sitio: SitioId | null;
  iaNonce: number;
  iaCifrado: boolean;
  espiaTexto: string;
  espiaCifrado: string;
  verificadas: AfirmacionId[];
  decisiones: Partial<Record<AfirmacionId, DecisionIA>>;
  declarado: boolean;
  modoColor: string;
}) {
  const s = SITIOS.find((x) => x.id === sitio) ?? null;
  const legit = s?.legitimo ?? true;
  const posServ = legit ? POS_LEGIT : POS_FALSO;
  const claveIda = useMemo(
    () => claveDe([new THREE.Vector3(...POS_LAPTOP), new THREE.Vector3(...POS_ROUTER), new THREE.Vector3(...POS_NUBE), new THREE.Vector3(posServ[0], 1.15, posServ[2])]),
    [posServ],
  );
  const claveVuelta = useMemo(
    () => claveDe([new THREE.Vector3(posServ[0], 1.15, posServ[2]), new THREE.Vector3(...POS_NUBE), new THREE.Vector3(...POS_ROUTER), new THREE.Vector3(...POS_LAPTOP)]),
    [posServ],
  );
  const nube = useRef<THREE.Mesh>(null);
  const alarma = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (nube.current) nube.current.rotation.y = clock.elapsedTime * 0.3;
    if (alarma.current) alarma.current.emissiveIntensity = 0.5 + 1.2 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 6));
  });
  const colPaq = iaCifrado ? modoColor : NO;

  return (
    <group position={[0, -1.1, 0]}>
      <mesh position={[0, -0.06, 0.4]} receiveShadow>
        <boxGeometry args={[13.6, 0.1, 6.6]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      {/* Café con wifi pública */}
      <mesh position={[-4.6, -0.005, 0.4]} receiveShadow>
        <boxGeometry args={[4.2, 0.02, 5.6]} />
        <meshStandardMaterial color="#3f2a1d" roughness={0.8} />
      </mesh>
      <Mesa pos={[POS_LAPTOP[0], 0, POS_LAPTOP[2]]} />
      <Laptop pos={[POS_LAPTOP[0], 0.8, POS_LAPTOP[2]]} pantalla={modoColor} />
      <Persona pos={[POS_LAPTOP[0], 0, POS_LAPTOP[2] + 0.75]} color="#0ea5e9" />
      <Mesa pos={[-5.75, 0, -0.55]} />
      <Laptop pos={[-5.75, 0.8, -0.55]} pantalla="#22c55e" rotY={Math.PI * 0.15} />
      <Persona pos={[-6.2, 0, 0.05]} color="#1f2937" rotY={0.4} />
      <mesh position={[POS_ROUTER[0], 1.05, POS_ROUTER[2]]}>
        <cylinderGeometry args={[0.04, 0.05, 2.1, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={POS_ROUTER}>
        <boxGeometry args={[0.46, 0.1, 0.3]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <OndasWifi pos={[POS_ROUTER[0], POS_ROUTER[1] - 0.2, POS_ROUTER[2]]} color="#38bdf8" />
      <Etiqueta pos={[POS_ROUTER[0] + 0.1, POS_ROUTER[1] + 0.45, POS_ROUTER[2]]} df={11} fs={10.5}>
        <i className="fa-solid fa-wifi" style={{ color: "#38bdf8" }} />
        Wifi pública del café
      </Etiqueta>
      <PantallaEspia nonce={iaNonce} retraso={T_ENVIO_IA * 0.35} cifrado={iaCifrado} texto={espiaTexto} cifra={espiaCifrado} dominio={s ? s.url.replace(/^https?:\/\//, "") : "—"} />

      {/* Internet */}
      <mesh ref={nube} position={POS_NUBE}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color="#1e3a8a" emissive="#3b82f6" emissiveIntensity={0.35} wireframe />
      </mesh>
      <Etiqueta pos={[POS_NUBE[0], POS_NUBE[1] + 0.72, POS_NUBE[2]]} df={11} fs={10.5}>
        <i className="fa-solid fa-globe" style={{ color: "#93c5fd" }} />
        Internet
      </Etiqueta>

      {/* Servidores */}
      <CentroDatos pos={POS_LEGIT} color={modoColor} destacado={sitio === "legitimo"} />
      <Etiqueta pos={[POS_LEGIT[0] - 0.35, 1.2, POS_LEGIT[2]]} df={11} fs={10.5} col={sitio === "legitimo" ? `${modoColor}cc` : undefined}>
        <i className="fa-solid fa-robot" style={{ color: modoColor }} />
        tutor-ia.ejemplo.mx · 198.51.100.7
      </Etiqueta>
      <group position={POS_FALSO}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.6, 1.4, 0.6]} />
          <meshStandardMaterial color="#1c1917" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.7, 0.305]}>
          <boxGeometry args={[0.08, 1.2, 0.01]} />
          <meshStandardMaterial ref={alarma} color={NO} emissive={NO} emissiveIntensity={1} toneMapped={false} />
        </mesh>
      </group>
      <Etiqueta pos={[POS_FALSO[0] + 0.45, 2.35, POS_FALSO[2]]} df={11} fs={10.5} col={s && !s.legitimo ? `${NO}cc` : undefined}>
        <i className="fa-solid fa-skull-crossbones" style={{ color: NO }} />
        Sitio de phishing · 203.0.113.66
      </Etiqueta>

      {/* Banda de verificación */}
      <mesh position={[X_BANDA + 1.9, 0.25, Z_BANDA]} receiveShadow castShadow>
        <boxGeometry args={[4.6, 0.5, 0.7]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      <mesh position={[X_BANDA + 1.9, 0.51, Z_BANDA]}>
        <boxGeometry args={[4.5, 0.02, 0.6]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      {AFIRMACIONES_IA.map((a, i) => (
        <Tarjeta key={a.id} i={i} verificada={verificadas.includes(a.id)} decision={decisiones[a.id]} correcta={a.correcta} />
      ))}
      <Etiqueta pos={[X_BANDA + 1.9, 0.05, Z_BANDA + 0.72]} df={11} fs={10.5} col={declarado ? `${OK}cc` : undefined}>
        <i className={`fa-solid ${declarado ? "fa-file-circle-check" : "fa-magnifying-glass"}`} style={{ color: declarado ? OK : AMARILLO }} />
        {declarado ? "Uso de IA declarado en tu trabajo" : "Verificación de la respuesta"}
      </Etiqueta>

      <Rafaga clave={claveIda} nonce={iaNonce} inicio={0} duracion={T_ENVIO_IA} n={7} color={colPaq} tam={0.12} />
      {legit && <Rafaga clave={claveVuelta} nonce={iaNonce} inicio={T_ENVIO_IA} duracion={T_RESP_IA} n={7} color={AMARILLO} tam={0.12} />}
      <Pulso pos={[posServ[0], 0.03, posServ[2]]} nonce={iaNonce} retraso={T_ENVIO_IA - 0.15} color={legit ? modoColor : NO} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. VIDA DEL DISPOSITIVO
 * ════════════════════════════════════════════════════════════════════════ */

const POS_TELEFONO: Pt = [-1.2, 0, 0.1];
const POS_COLUMNA: Pt = [-4.1, 0, 0.1];
const ESCALA_KG = 0.07;
const DESTINOS_POS: Record<DestinoFinalId, Pt> = {
  cajon: [1.5, 0, -1.7],
  basura: [4.5, 0, -1.5],
  reciclaje: [3.4, 0, 1.6],
};

function TelefonoDesarmado() {
  const grupo = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (grupo.current) grupo.current.rotation.y = -0.5 + Math.sin(clock.elapsedTime * 0.4) * 0.35;
  });
  const capa = (y: number, children: ReactNode) => <group position={[0, y, 0]}>{children}</group>;
  return (
    <group position={POS_TELEFONO}>
      <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.9, 1.05, 0.5, 40]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.3} />
      </mesh>
      <group ref={grupo} position={[0, 0.7, 0]}>
        {capa(
          0,
          <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <boxGeometry args={[0.8, 1.6, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.35} />
          </mesh>,
        )}
        {capa(
          0.5,
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <boxGeometry args={[0.62, 1.0, 0.1]} />
              <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.056, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.4, 0.3, 0.005]} />
              <meshStandardMaterial color={AMARILLO} />
            </mesh>
          </>,
        )}
        {capa(
          1.0,
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <boxGeometry args={[0.7, 1.4, 0.03]} />
              <meshStandardMaterial color="#166534" roughness={0.6} />
            </mesh>
            {[
              [-0.15, 0.3, 0.26, 0.22],
              [0.16, 0.34, 0.18, 0.18],
              [0.0, -0.1, 0.34, 0.2],
              [-0.18, -0.46, 0.16, 0.14],
              [0.16, -0.48, 0.14, 0.2],
            ].map(([x, z, w, d], k) => (
              <mesh key={k} position={[x!, 0.035, -z!]}>
                <boxGeometry args={[w!, 0.04, d!]} />
                <meshStandardMaterial color="#111827" metalness={0.4} roughness={0.35} />
              </mesh>
            ))}
            {[-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3].map((x) => (
              <mesh key={x} position={[x, 0.02, 0.66]}>
                <boxGeometry args={[0.05, 0.01, 0.06]} />
                <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
          </>,
        )}
        {capa(
          1.5,
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <boxGeometry args={[0.8, 1.6, 0.04]} />
              <meshStandardMaterial color="#0f172a" metalness={0.3} roughness={0.15} transparent opacity={0.9} />
            </mesh>
            <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.72, 1.5, 0.005]} />
              <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.35} transparent opacity={0.75} />
            </mesh>
          </>,
        )}
      </group>
      <Etiqueta pos={[1.2, 2.4, 0]} df={11} fs={10.5}>
        Pantalla
      </Etiqueta>
      <Etiqueta pos={[1.6, 1.85, 0]} df={11} fs={10.5}>
        Tarjeta: cobre, plata, oro, paladio
      </Etiqueta>
      <Etiqueta pos={[1.3, 1.3, 0]} df={11} fs={10.5}>
        Batería de litio
      </Etiqueta>
      <Etiqueta pos={[1.1, 0.75, 0]} df={11} fs={10.5}>
        Carcasa
      </Etiqueta>
    </group>
  );
}

function ColumnaHuella({ anios, modoColor }: { anios: number; modoColor: string }) {
  const fab = useRef<THREE.Mesh>(null);
  const uso = useRef<THREE.Mesh>(null);
  const lectura = useRef<HTMLSpanElement>(null);
  const etq = useRef<THREE.Group>(null);
  const a = useRef(anios);
  const hUso = huellaAnual(1).uso * ESCALA_KG;
  const hBase = huellaAnual(ANIOS_BASE).total * ESCALA_KG;
  useFrame((_, dt) => {
    a.current += (anios - a.current) * suave(dt, 0.08);
    const h = huellaAnual(a.current);
    const hFab = h.fabricacion * ESCALA_KG;
    if (fab.current) {
      fab.current.scale.y = hFab;
      fab.current.position.y = 0.2 + hUso + hFab / 2;
    }
    if (etq.current) etq.current.position.y = 0.2 + hUso + hFab + 0.32;
    if (lectura.current) lectura.current.textContent = `${num(h.total, 1)} kg CO₂e por año`;
  });
  const hInicial = huellaAnual(anios).fabricacion * ESCALA_KG;
  return (
    <group position={POS_COLUMNA}>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[1.3, 0.2, 1.3]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      <mesh ref={uso} position={[0, 0.2 + hUso / 2, 0]} castShadow>
        <boxGeometry args={[0.8, hUso, 0.8]} />
        <meshStandardMaterial color={AMARILLO} roughness={0.4} emissive={AMARILLO} emissiveIntensity={0.15} />
      </mesh>
      <mesh ref={fab} position={[0, 0.2 + hUso + hInicial / 2, 0]} scale={[1, hInicial, 1]} castShadow>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color="#64748b" roughness={0.45} />
      </mesh>
      {/* Referencia: 2 años de uso */}
      <mesh position={[0, 0.2 + hBase / 2, 0]}>
        <boxGeometry args={[0.92, hBase, 0.92]} />
        <meshBasicMaterial color="#e2e8f0" wireframe transparent opacity={0.25} />
      </mesh>
      <group ref={etq} position={[0, 0.2 + hUso + hInicial + 0.32, 0]}>
        <Etiqueta pos={[0, 0, 0]} df={10} fs={12.5} col={`${modoColor}aa`}>
          <i className="fa-solid fa-smog" style={{ color: "#cbd5e1" }} />
          <span ref={lectura}>{num(huellaAnual(anios).total, 1)} kg CO₂e por año</span>
        </Etiqueta>
      </group>
      {/* Años de uso */}
      {Array.from({ length: ANIOS_MAX }, (_, k) => (
        <mesh key={k} position={[-0.7 + k * 0.2, 0.06, 0.95]}>
          <boxGeometry args={[0.15, 0.12, 0.15]} />
          <meshStandardMaterial color={k < anios ? modoColor : "#1e293b"} emissive={k < anios ? modoColor : "#000"} emissiveIntensity={k < anios ? 0.6 : 0} />
        </mesh>
      ))}
      <Etiqueta pos={[0.9, -0.2, 1.45]} df={11} fs={10.5}>
        <span style={{ color: "#cbd5e1" }}>■ fabricación repartida</span>
        <span style={{ color: AMARILLO }}>■ carga</span>
        <span style={{ color: "#94a3b8" }}>▢ cada {ANIOS_BASE} años</span>· {anios} {anios === 1 ? "año" : "años"} de uso
      </Etiqueta>
    </group>
  );
}

function Cajon({ activo, nonce }: { activo: boolean; nonce: number }) {
  const cajon = useRef<THREE.Group>(null);
  const visto = useRef(nonce);
  const t = useRef(activo ? 99 : 0);
  useFrame((_, dt) => {
    if (visto.current !== nonce) {
      visto.current = nonce;
      t.current = 0;
    }
    t.current += dt;
    // Abierto mientras llega el teléfono; se cierra después.
    const abierto = activo && t.current < T_VUELO + 0.2 ? 0.45 : 0;
    if (cajon.current) cajon.current.position.z += (abierto - cajon.current.position.z) * suave(dt, 0.08);
  });
  return (
    <group position={DESTINOS_POS.cajon}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.9, 0.9]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} />
      </mesh>
      <group ref={cajon} position={[0, 0, 0]}>
        <mesh position={[0, 0.62, 0.05]} castShadow>
          <boxGeometry args={[1.06, 0.3, 0.9]} />
          <meshStandardMaterial color="#92400e" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.62, 0.51]}>
          <boxGeometry args={[0.3, 0.05, 0.05]} />
          <meshStandardMaterial color="#d6d3d1" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function Basura({ activo, nonce }: { activo: boolean; nonce: number }) {
  const mancha = useRef<THREE.Mesh>(null);
  const brillo = useRef<THREE.PointLight>(null);
  const visto = useRef(nonce);
  const t = useRef(activo ? 99 : 0);
  useFrame(({ clock }, dt) => {
    if (visto.current !== nonce) {
      visto.current = nonce;
      t.current = 0;
    }
    t.current += dt;
    const p = activo ? Math.min(1, Math.max(0, (t.current - T_VUELO) / 3)) : 0;
    if (mancha.current) mancha.current.scale.setScalar(0.001 + p * 1.25);
    if (brillo.current) brillo.current.intensity = activo && t.current > T_VUELO ? 1.2 + Math.sin(clock.elapsedTime * 17) * 0.6 + Math.sin(clock.elapsedTime * 7.1) * 0.4 : 0;
  });
  return (
    <group position={DESTINOS_POS.basura}>
      <mesh position={[0.2, 0.02, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.05, 32]} />
        <meshStandardMaterial color="#57534e" roughness={1} />
      </mesh>
      <mesh ref={mancha} position={[0.3, 0.03, 0.3]} rotation={[-Math.PI / 2, 0, 0]} scale={0.001}>
        <circleGeometry args={[0.75, 28]} />
        <meshStandardMaterial color="#3f6212" roughness={1} transparent opacity={0.7} />
      </mesh>
      <mesh position={[-0.3, 0.45, -0.2]} castShadow>
        <cylinderGeometry args={[0.36, 0.3, 0.9, 20, 1, true]} />
        <meshStandardMaterial color="#374151" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {[
        [0.45, 0.12, -0.3, 0.3],
        [0.6, 0.1, 0.35, 0.22],
        [0.1, 0.09, 0.55, 0.2],
      ].map(([x, y, z, r], k) => (
        <mesh key={k} position={[x!, y!, z!]}>
          <dodecahedronGeometry args={[r!, 0]} />
          <meshStandardMaterial color={["#78716c", "#a8a29e", "#57534e"][k]!} roughness={0.9} flatShading />
        </mesh>
      ))}
      <pointLight ref={brillo} position={[-0.3, 0.9, -0.2]} color="#f97316" intensity={0} distance={3} />
    </group>
  );
}

function Lingote({ pos, color, gramos, visible }: { pos: Pt; color: string; gramos: number; visible: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  // Tamaño en escala logarítmica para que 34 mg y 16 t sean visibles a la vez.
  const s = 0.16 + Math.max(0, Math.log10(Math.max(gramos, 0.001) / 0.001)) * 0.035;
  useFrame((_, dt) => {
    if (!ref.current) return;
    const dest = visible ? s : 0.001;
    const nuevo = ref.current.scale.x + (dest - ref.current.scale.x) * suave(dt, 0.06);
    ref.current.scale.setScalar(Math.max(0.001, nuevo));
  });
  return (
    <group position={pos}>
      <mesh ref={ref} position={[0, 0.2, 0]} scale={0.001} castShadow>
        <boxGeometry args={[1.4, 0.7, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.22} />
      </mesh>
    </group>
  );
}

function Reciclaje({ activo, nonce, lote, modoColor }: { activo: boolean; nonce: number; lote: number; modoColor: string }) {
  const banda = useRef<THREE.Group>(null);
  const visto = useRef(nonce);
  const t = useRef(activo ? 99 : 0);
  const listo = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (visto.current !== nonce) {
      visto.current = nonce;
      t.current = 0;
    }
    t.current += dt;
    if (banda.current) banda.current.children.forEach((c) => (c.position.x = ((c.position.x + dt * (activo ? 0.6 : 0.15) + 1.1) % 2.2) - 1.1));
    if (listo.current) listo.current.visible = activo && t.current > T_VUELO + 0.6;
  });
  const g = metalesRecuperadosG(lote);
  return (
    <group position={DESTINOS_POS.reciclaje}>
      <mesh position={[-0.9, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.8, 0.9]} />
        <meshStandardMaterial color="#14532d" roughness={0.55} />
      </mesh>
      <mesh position={[-0.9, 0.82, 0]}>
        <boxGeometry args={[0.96, 0.06, 0.96]} />
        <meshStandardMaterial color={modoColor} emissive={modoColor} emissiveIntensity={activo ? 0.8 : 0.2} />
      </mesh>
      <mesh position={[0.35, 0.22, 0]} receiveShadow>
        <boxGeometry args={[2.3, 0.1, 0.6]} />
        <meshStandardMaterial color="#1f2937" roughness={0.6} />
      </mesh>
      <group ref={banda} position={[0.35, 0.28, 0]}>
        {Array.from({ length: 8 }, (_, k) => (
          <mesh key={k} position={[-1.1 + k * 0.275, 0, 0]}>
            <boxGeometry args={[0.04, 0.02, 0.56]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        ))}
      </group>
      {activo && (
        <Html position={[0.55, -0.05, 0.85]} center distanceFactor={11} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: 8, padding: "6px 10px", borderRadius: 10, background: "rgba(4,10,22,0.9)", border: `1px solid ${modoColor}aa`, whiteSpace: "nowrap" }}>
            {METALES.map((m) => (
              <div key={m.id} style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: "#cbd5e1", lineHeight: 1.25 }}>
                {m.etq}
                <div style={{ fontSize: 11.5, color: m.color }}>{masa(g[m.id])}</div>
              </div>
            ))}
          </div>
        </Html>
      )}
      <group ref={listo} visible={false}>
        {METALES.map((m, k) => (
          <Lingote key={`${m.id}-${lote}`} pos={[-0.25 + k * 0.66, 0.28, 0.02]} color={m.color} gramos={g[m.id]} visible={activo} />
        ))}
      </group>
    </group>
  );
}

function TelefonoViajero({ destino, nonce }: { destino: DestinoFinalId | null; nonce: number }) {
  const ref = useRef<THREE.Group>(null);
  const visto = useRef(nonce);
  const t = useRef(destino ? 99 : 0);
  useFrame((_, dt) => {
    if (visto.current !== nonce) {
      visto.current = nonce;
      t.current = 0;
    }
    t.current += dt;
    if (!ref.current) return;
    if (!destino) {
      ref.current.visible = false;
      return;
    }
    const d = DESTINOS_POS[destino];
    const p = Math.min(1, t.current / T_VUELO);
    const e = p * p * (3 - 2 * p);
    const x0 = POS_TELEFONO[0];
    const z0 = POS_TELEFONO[2];
    const yFin = destino === "cajon" ? 0.72 : destino === "basura" ? 0.6 : 0.6;
    const xFin = destino === "basura" ? d[0] - 0.3 : destino === "reciclaje" ? d[0] - 0.9 : d[0];
    const zFin = destino === "cajon" ? d[2] + 0.5 : destino === "basura" ? d[2] - 0.2 : d[2];
    ref.current.position.set(x0 + (xFin - x0) * e, 1.2 + (yFin - 1.2) * e + Math.sin(e * Math.PI) * 1.6, z0 + (zFin - z0) * e);
    ref.current.rotation.set(e * Math.PI * 2, e * Math.PI, 0);
    // Desaparece dentro de su destino.
    ref.current.visible = p < 1 || destino === "basura";
    if (destino === "basura" && p >= 1) ref.current.rotation.set(Math.PI / 2, 0.4, 0);
  });
  return (
    <group ref={ref} visible={false}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.6, 0.05]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.028]}>
        <boxGeometry args={[0.26, 0.54, 0.005]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} />
      </mesh>
    </group>
  );
}

function EscenaDispositivo({ anios, destinoFinal, destinoNonce, lote, modoColor }: { anios: number; destinoFinal: DestinoFinalId | null; destinoNonce: number; lote: number; modoColor: string }) {
  return (
    <group position={[0, -1.2, 0]}>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[12.6, 0.1, 6.4]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      <TelefonoDesarmado />
      <ColumnaHuella anios={anios} modoColor={modoColor} />
      <Cajon activo={destinoFinal === "cajon"} nonce={destinoNonce} />
      <Basura activo={destinoFinal === "basura"} nonce={destinoNonce} />
      <Reciclaje activo={destinoFinal === "reciclaje"} nonce={destinoNonce} lote={lote} modoColor={modoColor} />
      <TelefonoViajero destino={destinoFinal} nonce={destinoNonce} />
      <Etiqueta pos={[DESTINOS_POS.cajon[0], 1.4, DESTINOS_POS.cajon[2]]} df={11} fs={10.5} col={destinoFinal === "cajon" ? `${AMARILLO}cc` : undefined}>
        <i className="fa-solid fa-box-archive" style={{ color: AMARILLO }} />
        Cajón
      </Etiqueta>
      <Etiqueta pos={[DESTINOS_POS.basura[0], 1.4, DESTINOS_POS.basura[2]]} df={11} fs={10.5} col={destinoFinal === "basura" ? `${NO}cc` : undefined}>
        <i className="fa-solid fa-trash-can" style={{ color: NO }} />
        Basura común
      </Etiqueta>
      <Etiqueta pos={[DESTINOS_POS.reciclaje[0] - 0.9, 1.25, DESTINOS_POS.reciclaje[2]]} df={11} fs={10.5} col={destinoFinal === "reciclaje" ? `${OK}cc` : undefined}>
        <i className="fa-solid fa-recycle" style={{ color: OK }} />
        Reciclaje formal
      </Etiqueta>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function PaqueteInternetScene(p: PaqueteSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "viaje") return { pos: [0.2, 11.2, 9.4], target: [0.2, -0.9, 0.6] };
    if (vista === "consulta") return { pos: [-0.6, 6.6, 11.6], target: [-0.5, 0.2, 0.3] };
    return { pos: [0.4, 5.6, 10.8], target: [0.4, 0.4, 0.0] };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 20, 42]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 9, 6]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 3, 5]} intensity={0.4} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "viaje" && (
        <EscenaViaje
          destino={p.destino}
          rutaClave={p.rutaClave}
          cortados={p.cortados}
          envioNonce={p.envioNonce}
          conDns={p.conDns}
          paquetesVisibles={p.paquetesVisibles}
          dnsResuelto={p.dnsResuelto}
          modoColor={modoColor}
        />
      )}
      {vista === "consulta" && (
        <EscenaConsulta
          sitio={p.sitio}
          iaNonce={p.iaNonce}
          iaCifrado={p.iaCifrado}
          espiaTexto={p.espiaTexto}
          espiaCifrado={p.espiaCifrado}
          verificadas={p.verificadas}
          decisiones={p.decisiones}
          declarado={p.declarado}
          modoColor={modoColor}
        />
      )}
      {vista === "dispositivo" && <EscenaDispositivo anios={p.anios} destinoFinal={p.destinoFinal} destinoNonce={p.destinoNonce} lote={p.lote} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={24} maxPolarAngle={Math.PI * 0.47} minPolarAngle={Math.PI * 0.05} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.35} luminanceThreshold={0.62} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
