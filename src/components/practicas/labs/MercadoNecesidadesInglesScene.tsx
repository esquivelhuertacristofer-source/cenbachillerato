"use client";

/**
 * Escena 3D del laboratorio "Needs and wishes: el tianguis y el centro de
 * acopio" (IN-II-P07). Tres vistas:
 *
 *  - mercado: un puesto de tianguis con toldo rosa mexicano, siete productos
 *    con letrero de precio en inglés, el vendedor, la bolsa del mandado donde
 *    cae lo que el alumno pide y una pizarra con el ticket y el presupuesto.
 *  - elegir: la plaza de la asamblea vecinal con el tablero de la necesidad y
 *    dos plataformas (A y B) con la maqueta de cada opción; los datos aparecen
 *    al preguntar y la opción elegida muestra su consecuencia (los árboles
 *    crecen, las sombrillas se abren, llega la pipa…).
 *  - acopio: el centro de acopio con estantes de insumos, la mesa de empaque
 *    con la caja que arma el alumno, el vecino que cuenta su necesidad y la
 *    zona de entregas que se llena con cada familia atendida.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type ProductoId, type Lado, type Caja, type Insumo, PRODUCTOS, PUESTO, PRESUPUESTO, DILEMAS, INSUMOS, VECINOS, itemDe, subtotal, OFERTAS } from "./mercado-necesidades-ingles-data";

export type VistaMercado = "mercado" | "elegir" | "acopio";
export type FaseAcopio = "empatia" | "oferta" | "caja" | "listo";

export interface MercadoSceneProps {
  vista: VistaMercado;
  modoColor: string;
  resetNonce: number;
  // Tianguis
  comprados: ProductoId[];
  seleccionado: ProductoId | null;
  elegible: boolean;
  dichoVendedor: string | null;
  dichoCliente: string | null;
  ofertaIdx: number;
  ofertasAceptadas: ProductoId[];
  totalVisible: boolean;
  pagado: boolean;
  onProducto?: (id: ProductoId) => void;
  // Asamblea
  dilemaIdx: number;
  reveladas: [boolean, boolean];
  elegida: Lado | null;
  resuelto: boolean;
  oracion: string;
  estadoOracion: "ok" | "mal" | null;
  onLado?: (l: Lado) => void;
  // Acopio
  vecinoIdx: number;
  fase: FaseAcopio;
  dichoTu: string | null;
  caja: Caja;
  estadoCaja: "ok" | "mal" | null;
  entregados: string[];
}

type Pt = [number, number, number];

const OK = "#34d399";
const WARN = "#fb923c";
const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

const CAJA = new THREE.BoxGeometry(1, 1, 1);
const ESFERA = new THREE.SphereGeometry(1, 20, 14);
const CILINDRO = new THREE.CylinderGeometry(1, 1, 1, 24);
const CONO = new THREE.ConeGeometry(1, 1, 24);

const cursor = (on: boolean) => {
  document.body.style.cursor = on ? "pointer" : "auto";
};

function Clay({ color, rough = 0.78, emissive, ei = 0 }: { color: string; rough?: number; emissive?: string; ei?: number }) {
  return <meshStandardMaterial color={color} roughness={rough} emissive={emissive ?? "#000000"} emissiveIntensity={ei} />;
}

function Caja3({ p, s, c, rough = 0.78, rot, sombra = true }: { p: Pt; s: Pt; c: string; rough?: number; rot?: Pt; sombra?: boolean }) {
  return (
    <mesh position={p} scale={s} rotation={rot ?? [0, 0, 0]} geometry={CAJA} castShadow={sombra} receiveShadow>
      <Clay color={c} rough={rough} />
    </mesh>
  );
}

function Cil({ p, r, h, c, rot, rough = 0.7 }: { p: Pt; r: number; h: number; c: string; rot?: Pt; rough?: number }) {
  return (
    <mesh position={p} scale={[r, h, r]} rotation={rot ?? [0, 0, 0]} geometry={CILINDRO} castShadow receiveShadow>
      <Clay color={c} rough={rough} />
    </mesh>
  );
}

function Etiqueta({ pos, children, df = 10, col, fs = 12, fondo = "rgba(4,10,22,0.86)" }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number; fondo?: string }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 999,
          background: fondo,
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

function Burbuja({ pos, children, df = 10, ancho = 240, borde = "#ffffff", fs = 13, oscura = false }: { pos: Pt; children: ReactNode; df?: number; ancho?: number; borde?: string; fs?: number; oscura?: boolean }) {
  const fondo = oscura ? "#0b1628" : "#ffffff";
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ position: "relative", width: ancho, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 14,
            background: fondo,
            border: `2px solid ${borde}`,
            color: oscura ? "#fff" : "#0f172a",
            fontSize: fs,
            fontWeight: 800,
            lineHeight: 1.3,
            textAlign: "center",
            boxShadow: "0 10px 24px -10px #000",
          }}
        >
          {children}
        </div>
        <div style={{ position: "absolute", bottom: -7, left: "50%", marginLeft: -7, width: 14, height: 14, background: fondo, transform: "rotate(45deg)", borderRight: `2px solid ${borde}`, borderBottom: `2px solid ${borde}` }} />
      </div>
    </Html>
  );
}

/** Persona de arcilla con brazos, delantal opcional y boca que cambia de ánimo. */
function Persona({ pos, rotY = 0, escala = 1, camisa, piel = "#e7b58f", pelo = "#2b1d14", coleta = false, canoso = false, delantal, animo = "neutro" }: { pos: Pt; rotY?: number; escala?: number; camisa: string; piel?: string; pelo?: string; coleta?: boolean; canoso?: boolean; delantal?: string; animo?: "triste" | "neutro" | "feliz" }) {
  const cabeza = useRef<THREE.Group>(null);
  const semilla = pos[0] * 1.7 + pos[2];
  useFrame(({ clock }) => {
    if (cabeza.current) cabeza.current.rotation.z = Math.sin(clock.elapsedTime * 1.3 + semilla) * 0.05;
  });
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={escala}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.27, 0.72, 8, 16]} />
        <Clay color={camisa} />
      </mesh>
      {delantal && (
        <mesh position={[0, 0.62, 0.2]} scale={[0.4, 0.62, 0.12]} geometry={CAJA}>
          <Clay color={delantal} />
        </mesh>
      )}
      {[-1, 1].map((l) => (
        <mesh key={l} position={[l * 0.33, 0.78, 0.02]} rotation={[0, 0, l * 0.18]} castShadow>
          <capsuleGeometry args={[0.075, 0.46, 6, 10]} />
          <Clay color={camisa} />
        </mesh>
      ))}
      <group ref={cabeza} position={[0, 1.5, 0]}>
        <mesh castShadow geometry={ESFERA} scale={0.24}>
          <Clay color={piel} />
        </mesh>
        <mesh position={[0, 0.08, -0.03]} scale={[1.05, 0.8, 1.05]}>
          <sphereGeometry args={[0.245, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Clay color={canoso ? "#e5e7eb" : pelo} />
        </mesh>
        {coleta && (
          <mesh position={[0, 0.02, -0.26]} geometry={ESFERA} scale={0.1}>
            <Clay color={pelo} />
          </mesh>
        )}
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} position={[x, 0.01, 0.22]} geometry={ESFERA} scale={0.028}>
            <meshBasicMaterial color="#111827" />
          </mesh>
        ))}
        <mesh position={[0, animo === "triste" ? -0.12 : -0.09, 0.215]} rotation={[0, 0, animo === "triste" ? 0 : Math.PI]}>
          <torusGeometry args={[animo === "neutro" ? 0.045 : 0.06, 0.012, 6, 16, animo === "neutro" ? Math.PI * 0.35 : Math.PI]} />
          <meshBasicMaterial color="#7f1d1d" />
        </mesh>
      </group>
    </group>
  );
}

function Clickable({ children, onPick, activo }: { children: ReactNode; onPick?: () => void; activo: boolean }) {
  useEffect(() => () => cursor(false), []);
  return (
    <group
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (!activo || !onPick) return;
        e.stopPropagation();
        onPick();
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        if (!activo) return;
        e.stopPropagation();
        cursor(true);
      }}
      onPointerOut={() => cursor(false)}
    >
      {children}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. EL TIANGUIS
 * ════════════════════════════════════════════════════════════════════════ */

const X_PROD = (i: number) => -3.3 + i * 1.1;
const Y_MESA = 0.92;
const BOLSA: Pt = [3.1, 0, 2.35];

/** Modelos de arcilla de cada producto, con su base en y = 0. */
function ModeloProducto({ id }: { id: ProductoId }) {
  if (id === "eggs") {
    return (
      <group>
        <Caja3 p={[0, 0.04, 0]} s={[0.82, 0.08, 0.34]} c="#c8b59a" />
        {Array.from({ length: 12 }, (_, k) => (
          <mesh key={k} position={[-0.3 + (k % 6) * 0.12, 0.13, k < 6 ? -0.08 : 0.08]} geometry={ESFERA} scale={[0.05, 0.066, 0.05]} castShadow>
            <Clay color={k % 4 === 1 ? "#f5e6cf" : "#fbf5ea"} rough={0.55} />
          </mesh>
        ))}
      </group>
    );
  }
  if (id === "rice") {
    return (
      <group>
        <mesh position={[0, 0.24, 0]} scale={[0.27, 0.48, 0.27]} geometry={CILINDRO} castShadow>
          <Clay color="#d9c7a0" rough={0.95} />
        </mesh>
        <mesh position={[0, 0.49, 0]} scale={[0.29, 0.04, 0.29]} geometry={CILINDRO}>
          <Clay color="#c2ab7d" rough={0.95} />
        </mesh>
        <mesh position={[0, 0.5, 0]} scale={[0.25, 0.07, 0.25]} geometry={ESFERA}>
          <Clay color="#fbf8ef" rough={0.9} />
        </mesh>
        <mesh position={[0.12, 0.56, 0.05]} rotation={[0.6, 0, -0.5]} scale={[0.05, 0.22, 0.05]} geometry={CILINDRO}>
          <Clay color="#94a3b8" rough={0.35} />
        </mesh>
      </group>
    );
  }
  if (id === "milk") {
    return (
      <group>
        {[
          [-0.14, -0.08],
          [0.14, -0.08],
          [0, 0.1],
        ].map(([x, z], k) => (
          <group key={k} position={[x!, 0, z!]}>
            <Caja3 p={[0, 0.17, 0]} s={[0.17, 0.34, 0.17]} c="#f8fafc" rough={0.5} />
            <Caja3 p={[0, 0.25, 0]} s={[0.175, 0.07, 0.175]} c="#2563eb" rough={0.5} sombra={false} />
            <mesh position={[0, 0.37, 0]} rotation={[0, Math.PI / 4, 0]} scale={[0.125, 0.08, 0.125]} geometry={CONO}>
              <meshStandardMaterial color="#e2e8f0" roughness={0.5} flatShading />
            </mesh>
          </group>
        ))}
      </group>
    );
  }
  if (id === "rolls") {
    return (
      <group>
        <mesh position={[0, 0.09, 0]} scale={[0.36, 0.18, 0.36]} geometry={CILINDRO} castShadow>
          <Clay color="#a16207" rough={0.95} />
        </mesh>
        {Array.from({ length: 6 }, (_, k) => {
          const a = (k / 6) * Math.PI * 2;
          return (
            <mesh key={k} position={[Math.cos(a) * 0.17, 0.22 + (k % 2) * 0.03, Math.sin(a) * 0.17]} rotation={[0, -a, Math.PI / 2]} castShadow>
              <capsuleGeometry args={[0.06, 0.1, 6, 10]} />
              <Clay color="#d98a2b" rough={0.7} />
            </mesh>
          );
        })}
        <mesh position={[0, 0.27, 0]} rotation={[0, 0.4, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.06, 0.1, 6, 10]} />
          <Clay color="#e0a24a" rough={0.7} />
        </mesh>
      </group>
    );
  }
  if (id === "oranges") {
    const bolas: Pt[] = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) bolas.push([-0.24 + j * 0.16, 0.2, -0.11 + i * 0.11]);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) bolas.push([-0.16 + j * 0.16, 0.32, -0.055 + i * 0.11]);
    return (
      <group>
        <Caja3 p={[0, 0.06, 0]} s={[0.72, 0.12, 0.44]} c="#b7885a" />
        {bolas.map((b, k) => (
          <mesh key={k} position={b} geometry={ESFERA} scale={0.075} castShadow>
            <Clay color={k % 3 === 0 ? "#f97316" : "#fb8c1d"} rough={0.6} />
          </mesh>
        ))}
      </group>
    );
  }
  if (id === "coffee") {
    return (
      <group>
        {[-0.2, 0.02, 0.24].map((x, k) => (
          <group key={k} position={[x, 0, k === 1 ? 0.08 : -0.04]}>
            <Caja3 p={[0, 0.2, 0]} s={[0.2, 0.4, 0.14]} c="#7c4a24" rough={0.8} />
            <Caja3 p={[0, 0.42, 0]} s={[0.2, 0.05, 0.08]} c="#5b3416" sombra={false} />
            <Caja3 p={[0, 0.22, 0.072]} s={[0.12, 0.12, 0.01]} c="#fde68a" sombra={false} />
          </group>
        ))}
      </group>
    );
  }
  return (
    <group>
      <Caja3 p={[0, 0.05, 0]} s={[0.6, 0.1, 0.38]} c="#b7885a" />
      {Array.from({ length: 5 }, (_, k) => (
        <mesh key={k} position={[-0.16 + k * 0.08, 0.2, 0]} rotation={[0.2, 0, 0.55 - k * 0.12]} castShadow>
          <capsuleGeometry args={[0.045, 0.3, 6, 10]} />
          <Clay color="#facc15" rough={0.6} />
        </mesh>
      ))}
      <mesh position={[0.02, 0.36, 0]} scale={[0.05, 0.06, 0.05]} geometry={CILINDRO}>
        <Clay color="#65a30d" />
      </mesh>
    </group>
  );
}

function ProductoPuesto({ id, i, sel, comprado, activo, enLista, onPick, modoColor }: { id: ProductoId; i: number; sel: boolean; comprado: boolean; activo: boolean; enLista: boolean; onPick?: (id: ProductoId) => void; modoColor: string }) {
  const g = useRef<THREE.Group>(null);
  const aro = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (g.current) {
      const y = sel ? 0.08 + Math.sin(t * 4) * 0.03 : 0;
      g.current.position.y += (y - g.current.position.y) * suave(dt, 0.2);
    }
    if (aro.current) {
      aro.current.visible = sel;
      aro.current.rotation.z = t * 0.8;
    }
  });
  const p = PRODUCTOS[id];
  return (
    <group position={[X_PROD(i), Y_MESA, 0.05]}>
      <Clickable activo={activo} onPick={() => onPick?.(id)}>
        <mesh position={[0, 0.2, 0]} visible={false}>
          <boxGeometry args={[0.95, 0.6, 0.7]} />
          <meshBasicMaterial />
        </mesh>
        <group ref={g}>
          <ModeloProducto id={id} />
        </group>
      </Clickable>
      <mesh ref={aro} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.44, 0.52, 40]} />
        <meshBasicMaterial color={modoColor} toneMapped={false} transparent opacity={0.9} />
      </mesh>
      <Html position={[0, i % 2 === 0 ? -0.26 : -0.6, 0.72]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            padding: "3px 9px",
            borderRadius: 8,
            background: sel ? "#fff7ed" : "rgba(255,250,240,0.94)",
            border: `2px solid ${sel ? modoColor : comprado ? OK : "#78350f"}`,
            color: "#1c1917",
            textAlign: "center",
            whiteSpace: "nowrap",
            boxShadow: "0 6px 14px -8px #000",
            opacity: comprado ? 0.55 : 1,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.15 }}>
            {comprado && <span style={{ color: "#059669", marginRight: 4 }}>✓</span>}
            {p.en}
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: enLista ? "#b45309" : "#57534e", lineHeight: 1.15 }}>{p.letrero}</div>
        </div>
      </Html>
    </group>
  );
}

/** Lo comprado vuela del puesto a la bolsa del mandado. */
function Articulo({ id, idx, desde }: { id: ProductoId; idx: number; desde: Pt }) {
  const g = useRef<THREE.Group>(null);
  const t0 = useRef(-1);
  useFrame(({ clock }) => {
    const grp = g.current;
    if (!grp) return;
    const t = clock.elapsedTime;
    if (t0.current < 0) t0.current = t < 0.6 ? t - 5 : t;
    const e = smooth((t - t0.current) / 1.0);
    const to: Pt = [BOLSA[0] + (idx % 2 === 0 ? -0.18 : 0.18), 0.78 + Math.floor(idx / 2) * 0.24, BOLSA[2] + ((idx % 3) - 1) * 0.08];
    grp.position.set(desde[0] + (to[0] - desde[0]) * e, desde[1] + (to[1] - desde[1]) * e + Math.sin(Math.PI * e) * 1.4, desde[2] + (to[2] - desde[2]) * e);
    grp.scale.setScalar(1 - 0.45 * e);
    grp.rotation.y = (1 - e) * 1.2;
  });
  return (
    <group ref={g} position={desde}>
      <ModeloProducto id={id} />
    </group>
  );
}

function Toldo({ p, w, d, colores, alto = 2.7 }: { p: Pt; w: number; d: number; colores: [string, string]; alto?: number }) {
  const n = 7;
  return (
    <group position={p}>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => <Cil key={`${sx}${sz}`} p={[(sx * w) / 2, alto / 2, (sz * d) / 2]} r={0.045} h={alto} c="#94a3b8" rough={0.35} />),
      )}
      <group position={[0, alto + 0.05, 0]} rotation={[0.1, 0, 0]}>
        {Array.from({ length: n }, (_, k) => (
          <Caja3 key={k} p={[-w / 2 - 0.2 + ((w + 0.4) / n) * (k + 0.5), 0, 0]} s={[(w + 0.4) / n + 0.002, 0.05, d + 0.5]} c={colores[k % 2]!} rough={0.85} />
        ))}
      </group>
    </group>
  );
}

function PapelPicado({ z, y, x0, x1, fase }: { z: number; y: number; x0: number; x1: number; fase: number }) {
  const g = useRef<THREE.Group>(null);
  const COLS = ["#ec4899", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ef4444"];
  const n = 16;
  useFrame(({ clock }) => {
    const grp = g.current;
    if (!grp) return;
    grp.children.forEach((c, k) => {
      c.rotation.x = Math.sin(clock.elapsedTime * 1.6 + k * 0.7 + fase) * 0.25;
    });
  });
  return (
    <group>
      <mesh position={[(x0 + x1) / 2, y + 0.02, z]} rotation={[0, 0, Math.PI / 2]} scale={[0.008, x1 - x0, 0.008]} geometry={CILINDRO}>
        <meshBasicMaterial color="#e5e7eb" />
      </mesh>
      <group ref={g}>
        {Array.from({ length: n }, (_, k) => {
          const x = x0 + ((x1 - x0) / n) * (k + 0.5);
          const cuelga = Math.sin(((k + 0.5) / n) * Math.PI) * 0.25;
          return (
            <mesh key={k} position={[x, y - 0.17 - cuelga, z]}>
              <planeGeometry args={[0.3, 0.34]} />
              <meshStandardMaterial color={COLS[(k + Math.round(fase)) % COLS.length]} side={THREE.DoubleSide} roughness={0.9} transparent opacity={0.95} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function EscenaMercado({ comprados, seleccionado, elegible, dichoVendedor, dichoCliente, ofertaIdx, ofertasAceptadas, totalVisible, pagado, onProducto, modoColor }: Pick<MercadoSceneProps, "comprados" | "seleccionado" | "elegible" | "dichoVendedor" | "dichoCliente" | "ofertaIdx" | "ofertasAceptadas" | "totalVisible" | "pagado" | "onProducto" | "modoColor">) {
  const enBolsa = [...comprados, ...ofertasAceptadas];
  const oferta = ofertaIdx >= 0 && ofertaIdx < OFERTAS.length ? OFERTAS[ofertaIdx]! : null;
  const filas = enBolsa.map((id) => {
    const it = itemDe(id);
    const o = OFERTAS.find((x) => x.prod === id);
    return { id, etq: it ? `${it.cantidad}${it.medida ? (it.medida.sg === "kilo" ? " kg" : " L") : ""} ${PRODUCTOS[id].en}` : `3 ${PRODUCTOS[id].en}`, precio: it ? subtotal(it) : (o?.precio ?? 0) };
  });
  const total = filas.reduce((a, f) => a + f.precio, 0);
  const billete = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (billete.current) {
      const y = pagado ? 0.72 : 0.54;
      billete.current.position.y += (y - billete.current.position.y) * suave(dt, 0.08);
      billete.current.rotation.y += dt * (pagado ? 1.6 : 0);
    }
  });
  return (
    <group>
      {/* Calle y banqueta */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[9.5, 64]} />
        <Clay color="#4b5563" rough={0.95} />
      </mesh>
      <Caja3 p={[0, 0.05, -4.3]} s={[15, 0.1, 1.6]} c="#9ca3af" sombra={false} />
      {[-4.5, -1.5, 1.5, 4.5].map((x) => (
        <Caja3 key={x} p={[x, 0.006, 4.6]} s={[1.6, 0.012, 0.16]} c="#fde047" sombra={false} />
      ))}

      {/* Puesto principal */}
      <Toldo p={[0, 0, -0.2]} w={8.0} d={2.4} colores={["#db2777", "#f9a8d4"]} />
      <Caja3 p={[0, Y_MESA - 0.04, 0.05]} s={[7.9, 0.08, 1.3]} c="#c08a55" />
      {Array.from({ length: 8 }, (_, k) => (
        <Caja3 key={k} p={[-3.45 + k * 0.986, 0.45, 0.72]} s={[0.99, 0.8, 0.03]} c={k % 2 === 0 ? "#0e7490" : "#f8fafc"} sombra={false} />
      ))}
      {[-3.8, 3.8].map((x) => (
        <Caja3 key={x} p={[x, 0.44, -0.5]} s={[0.06, 0.88, 0.06]} c="#78716c" />
      ))}
      {PUESTO.map((id, i) => (
        <ProductoPuesto key={id} id={id} i={i} sel={seleccionado === id || oferta?.prod === id} comprado={enBolsa.includes(id)} activo={elegible && !!itemDe(id) && !comprados.includes(id)} enLista={!!itemDe(id)} onPick={onProducto} modoColor={modoColor} />
      ))}

      {/* Vendedor */}
      <Persona pos={[0.4, 0, -1.25]} camisa="#1d4ed8" delantal="#f1f5f9" pelo="#1f1410" animo={pagado ? "feliz" : "neutro"} />
      {dichoVendedor && (
        <Burbuja pos={[0.4, 2.45, -1.25]} ancho={270} borde="#db2777">
          <span style={{ color: "#db2777", marginRight: 5 }}>Don Beto:</span>
          {dichoVendedor}
        </Burbuja>
      )}

      {/* Tu voz */}
      {dichoCliente && (
        <Burbuja pos={[-1.7, 0.55, 3.2]} df={7} ancho={250} fs={12} borde={modoColor} oscura>
          <span style={{ color: modoColor, marginRight: 6 }}>You:</span>
          {dichoCliente}
        </Burbuja>
      )}

      {/* Bolsa del mandado */}
      <group position={BOLSA}>
        <Caja3 p={[0, 0.2, 0]} s={[1.1, 0.4, 0.8]} c="#78716c" />
        <mesh position={[0, 0.72, 0]} scale={[0.46, 0.64, 0.46]} geometry={CILINDRO} castShadow>
          <Clay color="#0f766e" rough={0.9} />
        </mesh>
        {[0.55, 0.75, 0.95].map((y, k) => (
          <mesh key={y} position={[0, y, 0]} scale={[0.47, 0.06, 0.47]} geometry={CILINDRO}>
            <Clay color={["#f43f5e", "#facc15", "#f8fafc"][k]!} rough={0.9} />
          </mesh>
        ))}
        {[-1, 1].map((l) => (
          <mesh key={l} position={[l * 0.3, 1.06, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.16, 0.025, 8, 20, Math.PI]} />
            <Clay color="#0f766e" />
          </mesh>
        ))}
      </group>
      {enBolsa.map((id, k) => (
        <Articulo key={id} id={id} idx={k} desde={[X_PROD(PUESTO.indexOf(id)), Y_MESA + 0.05, 0.05]} />
      ))}
      <Etiqueta pos={[BOLSA[0], 2.35, BOLSA[2]]} df={10} fs={11} col={`${modoColor}aa`}>
        <i className="fa-solid fa-basket-shopping" style={{ color: modoColor }} />
        {enBolsa.length} {enBolsa.length === 1 ? "item" : "items"}
      </Etiqueta>

      {/* Pizarra con el ticket */}
      <group position={[-2.75, 1.28, 1.55]}>
        {[-0.8, 0.8].map((x) => (
          <mesh key={x} position={[x, 1.85, 0]} scale={[0.012, 0.2, 0.012]} geometry={CILINDRO}>
            <meshBasicMaterial color="#e5e7eb" />
          </mesh>
        ))}
        <Caja3 p={[0, 1.15, 0]} s={[1.95, 1.25, 0.06]} c="#1f3b2d" rough={0.95} />
        <Caja3 p={[0, 1.15, -0.02]} s={[2.07, 1.37, 0.05]} c="#92400e" />
        <Caja3 p={[0, 0.5, 0.08]} s={[1.9, 0.05, 0.16]} c="#92400e" />
        <group ref={billete} position={[0.55, 0.54, 0.1]}>
          <Caja3 p={[0, 0, 0]} s={[0.5, 0.02, 0.25]} c={pagado ? "#bbf7d0" : "#a7f3d0"} sombra={false} />
        </group>
        <Html position={[0, 1.17, 0.06]} center distanceFactor={8} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ width: 176, padding: "6px 8px", color: "#f8fafc", fontFamily: "ui-monospace, monospace", fontSize: 11, lineHeight: 1.35 }}>
            <div style={{ fontWeight: 900, fontSize: 11.5, borderBottom: "1px dashed rgba(255,255,255,0.4)", marginBottom: 3, display: "flex", justifyContent: "space-between" }}>
              <span>TICKET</span>
              <span style={{ color: "#fde68a" }}>budget ${PRESUPUESTO}</span>
            </div>
            {filas.length === 0 && <div style={{ color: "rgba(255,255,255,0.55)" }}>(empty)</div>}
            {filas.map((f) => (
              <div key={f.id} style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.etq}</span>
                <span>${f.precio}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px dashed rgba(255,255,255,0.4)", marginTop: 3, paddingTop: 2, display: "flex", justifyContent: "space-between", fontWeight: 900, color: totalVisible ? (total <= PRESUPUESTO ? "#86efac" : "#fdba74") : "#fde68a" }}>
              <span>TOTAL</span>
              <span>{totalVisible ? `$${total}` : "$ ?"}</span>
            </div>
          </div>
        </Html>
      </group>

      {/* Otros puestos del tianguis */}
      <group position={[-7.2, 0, -2.6]} rotation={[0, 0.5, 0]}>
        <Toldo p={[0, 0, 0]} w={3.2} d={2} colores={["#2563eb", "#93c5fd"]} alto={2.4} />
        <Caja3 p={[0, 0.8, 0]} s={[3.1, 0.08, 1.1]} c="#b7885a" />
        {[-1, 0, 1].map((k) => (
          <mesh key={k} position={[k * 0.9, 0.98, 0]} geometry={ESFERA} scale={[0.35, 0.18, 0.3]} castShadow>
            <Clay color={["#dc2626", "#16a34a", "#f59e0b"][k + 1]!} />
          </mesh>
        ))}
      </group>
      <group position={[7.2, 0, -2.6]} rotation={[0, -0.5, 0]}>
        <Toldo p={[0, 0, 0]} w={3.2} d={2} colores={["#f59e0b", "#fde68a"]} alto={2.4} />
        <Caja3 p={[0, 0.8, 0]} s={[3.1, 0.08, 1.1]} c="#b7885a" />
        {[-1, 0, 1].map((k) => (
          <Caja3 key={k} p={[k * 0.9, 1.0, 0]} s={[0.5, 0.32, 0.4]} c={["#7c3aed", "#0891b2", "#e11d48"][k + 1]!} />
        ))}
      </group>
      <group position={[0, 0, -6.6]}>
        <Toldo p={[-2.6, 0, 0]} w={3.6} d={1.8} colores={["#16a34a", "#bbf7d0"]} alto={2.3} />
        <Toldo p={[2.6, 0, 0]} w={3.6} d={1.8} colores={["#ea580c", "#fed7aa"]} alto={2.3} />
      </group>
      <PapelPicado z={-1.55} y={3.55} x0={-4.2} x1={4.2} fase={0} />
      <PapelPicado z={1.2} y={3.25} x0={-4.2} x1={4.2} fase={2.3} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. LA ASAMBLEA — elegir y justificar
 * ════════════════════════════════════════════════════════════════════════ */

const X_LADO: Record<Lado, number> = { A: -3.3, B: 3.3 };

/** Avance 0→1 de la consecuencia de una opción (crece solo si fue elegida y justificada). */
function useAvance(activo: boolean) {
  const v = useRef(0);
  useFrame((_, dt) => {
    const obj = activo ? 1 : 0;
    v.current += (obj - v.current) * suave(dt, 0.035);
  });
  return v;
}

function ModeloOpcion({ dilema, lado, activo }: { dilema: string; lado: Lado; activo: boolean }) {
  const av = useAvance(activo);
  const g = useRef<THREE.Group>(null);
  const gotas = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const grp = g.current;
    const a = av.current;
    const t = clock.elapsedTime;
    if (grp) {
      grp.traverse((c) => {
        const tipo = c.userData.tipo as string | undefined;
        if (!tipo) return;
        const k = (c.userData.k as number | undefined) ?? 0;
        if (!(c.userData.base instanceof THREE.Vector3)) c.userData.base = c.scale.clone();
        const base = c.userData.base as THREE.Vector3;
        if (tipo === "crece") c.scale.copy(base).multiplyScalar(0.35 + 0.65 * smooth(a * 1.2 - k * 0.08));
        if (tipo === "aparece") {
          const f = smooth(a * 1.6 - k * 0.12);
          c.scale.copy(base).multiplyScalar(Math.max(0.0001, f));
          c.visible = f > 0.01;
        }
        if (tipo === "abre") {
          const f = 0.2 + 0.8 * smooth(a * 1.3 - k * 0.1);
          c.scale.set(base.x * f, base.y * (0.6 + 0.4 * f), base.z * f);
        }
        if (tipo === "llega") c.position.x = 2.3 * (1 - smooth(a * 1.2));
      });
    }
    const gi = gotas.current;
    if (gi) {
      for (let i = 0; i < 40; i++) {
        const p = (t * 1.3 + i * 0.173) % 1;
        tmp.position.set(-1.1 + ((i * 7) % 11) * 0.2, 2.6 - p * 2.2, -0.7 + ((i * 5) % 7) * 0.22);
        tmp.scale.set(0.015, 0.07, 0.015).multiplyScalar(a > 0.05 ? 1 : 0.0001);
        tmp.updateMatrix();
        gi.setMatrixAt(i, tmp.matrix);
      }
      gi.instanceMatrix.needsUpdate = true;
    }
  });

  let piezas: ReactNode = null;
  if (dilema === "libros" && lado === "A") {
    piezas = (
      <>
        {[-0.5, 0, 0.5].map((x, j) =>
          Array.from({ length: 4 }, (_, k) => (
            <mesh key={`${j}-${k}`} position={[x, 0.07 + k * 0.13, 0]} scale={[0.4, 0.12, 0.3]} geometry={CAJA} castShadow userData={{ tipo: k >= 2 ? "aparece" : undefined, k: j + k }}>
              <Clay color={["#ef4444", "#3b82f6", "#22c55e", "#eab308"][(j + k) % 4]!} rough={0.5} />
            </mesh>
          )),
        )}
        <mesh position={[0, 0.55, -0.55]} scale={[1.6, 1.1, 0.3]} geometry={CAJA} castShadow userData={{ tipo: "aparece", k: 2 }}>
          <Clay color="#a16207" />
        </mesh>
      </>
    );
  } else if (dilema === "libros") {
    piezas = (
      <>
        <Caja3 p={[0, 0.5, 0]} s={[1.8, 0.07, 0.8]} c="#e2e8f0" />
        {[-0.7, 0.7].map((x) => (
          <Caja3 key={x} p={[x, 0.24, 0]} s={[0.05, 0.48, 0.7]} c="#64748b" />
        ))}
        {[-0.45, 0.45].map((x) => (
          <Caja3 key={x} p={[x, 0.72, 0]} s={[0.6, 0.38, 0.5]} c="#c69c6d" />
        ))}
        {Array.from({ length: 10 }, (_, k) => (
          <mesh key={k} position={[-0.7 + (k % 5) * 0.35, 0.02 + 0.07 + (k > 4 ? 0.14 : 0), 0.62]} rotation={[0, (k * 0.7) % 1, 0]} scale={[0.3, 0.1, 0.22]} geometry={CAJA} castShadow userData={{ tipo: "aparece", k }}>
            <Clay color={["#a8a29e", "#b45309", "#57534e", "#a16207", "#6b7280"][k % 5]!} />
          </mesh>
        ))}
      </>
    );
  } else if (dilema === "sombra" && lado === "A") {
    piezas = (
      <>
        {[
          [-0.7, -0.4],
          [0.7, -0.4],
          [-0.35, 0.5],
          [0.45, 0.45],
        ].map(([x, z], k) => (
          <group key={k} position={[x!, 0, z!]} userData={{ tipo: "crece", k }}>
            <Cil p={[0, 0.45, 0]} r={0.06} h={0.9} c="#7c4a24" />
            <mesh position={[0, 1.05, 0]} geometry={ESFERA} scale={0.42} castShadow>
              <Clay color={k % 2 ? "#15803d" : "#16a34a"} />
            </mesh>
          </group>
        ))}
      </>
    );
  } else if (dilema === "sombra") {
    piezas = (
      <>
        {[
          [-0.6, 0],
          [0.6, 0],
        ].map(([x, z], k) => (
          <group key={k} position={[x!, 0, z!]}>
            <Cil p={[0, 0.8, 0]} r={0.035} h={1.6} c="#e5e7eb" rough={0.4} />
            <Cil p={[0, 0.04, 0]} r={0.22} h={0.08} c="#475569" />
            <mesh position={[0, 1.62, 0]} scale={[0.95, 0.4, 0.95]} geometry={CONO} castShadow userData={{ tipo: "abre", k }}>
              <Clay color={k ? "#f97316" : "#0ea5e9"} />
            </mesh>
            <Caja3 p={[0, 0.25, 0.45]} s={[0.4, 0.5, 0.05]} c="#78716c" />
          </group>
        ))}
      </>
    );
  } else if (dilema === "comida" && lado === "A") {
    piezas = (
      <>
        {[-0.5, 0.5].map((x, j) => (
          <group key={x} position={[x, 0, 0]}>
            <Caja3 p={[0, 0.12, 0]} s={[0.8, 0.24, 1.5]} c="#7c4a24" />
            <Caja3 p={[0, 0.245, 0]} s={[0.7, 0.02, 1.4]} c="#3f2a1d" sombra={false} />
            {Array.from({ length: 4 }, (_, k) => (
              <mesh key={k} position={[0, 0.34, -0.5 + k * 0.33]} geometry={ESFERA} scale={0.15} castShadow userData={{ tipo: "crece", k: j + k }}>
                <Clay color={j ? "#84cc16" : "#22c55e"} />
              </mesh>
            ))}
          </group>
        ))}
      </>
    );
  } else if (dilema === "comida") {
    piezas = (
      <>
        <Caja3 p={[0, 0.5, -0.3]} s={[1.9, 0.07, 0.7]} c="#e2e8f0" />
        {[-0.8, 0.8].map((x) => (
          <Caja3 key={x} p={[x, 0.24, -0.3]} s={[0.05, 0.48, 0.6]} c="#64748b" />
        ))}
        {[-0.6, 0, 0.6].map((x) => (
          <Caja3 key={x} p={[x, 0.17, 0.5]} s={[0.5, 0.34, 0.4]} c="#c69c6d" />
        ))}
        {Array.from({ length: 12 }, (_, k) => (
          <mesh key={k} position={[-0.75 + (k % 6) * 0.3, 0.64, -0.42 + (k > 5 ? 0.24 : 0)]} scale={[0.09, 0.2, 0.09]} geometry={CILINDRO} castShadow userData={{ tipo: "aparece", k }}>
            <Clay color={["#dc2626", "#f59e0b", "#e5e7eb", "#16a34a"][k % 4]!} rough={0.4} />
          </mesh>
        ))}
      </>
    );
  } else if (dilema === "agua" && lado === "A") {
    piezas = (
      <>
        <Caja3 p={[0, 0.45, -0.2]} s={[1.9, 0.9, 1.2]} c="#fcd34d" />
        <Caja3 p={[0, 0.94, -0.2]} s={[2.0, 0.08, 1.3]} c="#9ca3af" />
        <mesh position={[0.2, 1.4, -0.3]} scale={[0.42, 0.85, 0.42]} geometry={CILINDRO} castShadow>
          <Clay color="#111827" rough={0.5} />
        </mesh>
        <mesh position={[0.2, 1.86, -0.3]} scale={[0.38, 0.1, 0.38]} geometry={ESFERA}>
          <Clay color="#1f2937" rough={0.5} />
        </mesh>
        <Caja3 p={[-0.5, 0.98, 0.45]} s={[1.0, 0.05, 0.1]} c="#6b7280" />
        <Caja3 p={[-0.95, 1.3, 0.45]} s={[0.07, 0.65, 0.07]} c="#6b7280" />
        <Caja3 p={[-0.5, 0.35, 0.41]} s={[0.4, 0.7, 0.02]} c="#92400e" sombra={false} />
        <instancedMesh ref={gotas} args={[undefined, undefined, 40]} geometry={ESFERA} frustumCulled={false}>
          <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.5} transparent opacity={0.85} />
        </instancedMesh>
      </>
    );
  } else {
    piezas = (
      <group userData={{ tipo: "llega" }} position={[2.3, 0, 0]}>
        <Caja3 p={[-0.85, 0.5, 0]} s={[0.6, 0.7, 0.8]} c="#dc2626" />
        <Caja3 p={[-0.95, 0.72, 0]} s={[0.3, 0.26, 0.74]} c="#bae6fd" sombra={false} />
        <mesh position={[0.35, 0.62, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.42, 1.5, 0.42]} geometry={CILINDRO} castShadow>
          <Clay color="#e5e7eb" rough={0.35} />
        </mesh>
        <Caja3 p={[0, 0.2, 0]} s={[2.0, 0.12, 0.7]} c="#374151" />
        {[-0.8, 0.1, 0.8].map((x) =>
          [-0.4, 0.4].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.16, z]} rotation={[Math.PI / 2, 0, 0]} scale={[0.17, 0.12, 0.17]} geometry={CILINDRO}>
              <Clay color="#111827" />
            </mesh>
          )),
        )}
      </group>
    );
  }
  return <group ref={g}>{piezas}</group>;
}

function Plataforma({ lado, dIdx, revel, elegida, resuelto, activo, onLado, modoColor }: { lado: Lado; dIdx: number; revel: [boolean, boolean]; elegida: Lado | null; resuelto: boolean; activo: boolean; onLado?: (l: Lado) => void; modoColor: string }) {
  const d = DILEMAS[dIdx]!;
  const op = lado === "A" ? d.opciones[0] : d.opciones[1];
  const esta = elegida === lado;
  const otra = elegida !== null && !esta;
  const aro = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (aro.current) aro.current.opacity = esta ? 0.65 + Math.sin(clock.elapsedTime * 3) * 0.25 : activo ? 0.18 : 0;
  });
  const col = esta ? (resuelto ? OK : modoColor) : "rgba(255,255,255,0.35)";
  return (
    <group position={[X_LADO[lado], 0, 0.9]}>
      <Clickable activo={activo} onPick={() => onLado?.(lado)}>
        <mesh position={[0, 0.1, 0]} scale={[1.75, 0.2, 1.75]} geometry={CILINDRO} receiveShadow castShadow>
          <Clay color={otra ? "#6b7280" : "#d6c7a8"} />
        </mesh>
        <mesh position={[0, 1.2, 0]} visible={false}>
          <boxGeometry args={[3.2, 2.4, 3]} />
          <meshBasicMaterial />
        </mesh>
        <group position={[0, 0.2, 0]} scale={otra ? 0.85 : 1}>
          <ModeloOpcion dilema={d.id} lado={lado} activo={esta && resuelto} />
        </group>
      </Clickable>
      <mesh position={[0, 0.215, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.62, 1.8, 64]} />
        <meshBasicMaterial ref={aro} color={esta && resuelto ? OK : modoColor} transparent opacity={0} toneMapped={false} />
      </mesh>
      <Html position={[0, 3.15, 0]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ width: 210, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, opacity: otra ? 0.55 : 1 }}>
          <div style={{ padding: "5px 12px", borderRadius: 999, background: "rgba(4,10,22,0.9)", border: `2px solid ${col}`, color: "#fff", fontSize: 14, fontWeight: 900, whiteSpace: "nowrap" }}>
            <span style={{ color: esta ? col : modoColor, marginRight: 6 }}>{lado}</span>
            {op.verbo}
            {esta && resuelto && <span style={{ color: OK, marginLeft: 6 }}>✓</span>}
          </div>
          {([0, 1] as const).map((k) =>
            revel[k] ? (
              <div key={k} style={{ padding: "3px 9px", borderRadius: 8, background: "rgba(255,250,240,0.95)", color: "#1c1917", fontSize: 11.5, fontWeight: 800, textAlign: "center", lineHeight: 1.25, boxShadow: "0 6px 14px -8px #000" }}>
                {op.datos[k]}
              </div>
            ) : (
              <div key={k} style={{ padding: "3px 9px", borderRadius: 8, background: "rgba(4,10,22,0.7)", border: "1px dashed rgba(255,255,255,0.35)", color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 800 }}>
                {d.preguntas[k as 0 | 1].partes[0]}___{d.preguntas[k as 0 | 1].partes[1]}
              </div>
            ),
          )}
          <div style={{ padding: "2px 8px", borderRadius: 7, background: "rgba(4,10,22,0.75)", color: "#e0f2fe", fontSize: 10.5, fontWeight: 700 }}>{op.rasgo}</div>
        </div>
      </Html>
    </group>
  );
}

function EscenaElegir({ dilemaIdx, reveladas, elegida, resuelto, oracion, estadoOracion, onLado, modoColor }: Pick<MercadoSceneProps, "dilemaIdx" | "reveladas" | "elegida" | "resuelto" | "oracion" | "estadoOracion" | "onLado" | "modoColor">) {
  const d = DILEMAS[dilemaIdx]!;
  const activo = reveladas[0] && reveladas[1] && !resuelto;
  const colOracion = estadoOracion === "ok" ? OK : estadoOracion === "mal" ? WARN : modoColor;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9.5, 64]} />
        <Clay color="#b9a98a" rough={0.95} />
      </mesh>
      {[3.2, 5.6, 8].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[r, r + 0.08, 72]} />
          <meshBasicMaterial color="#8d7d62" />
        </mesh>
      ))}
      {/* Tablero de la asamblea */}
      <group position={[0, 0, -2.9]}>
        {[-1.7, 1.7].map((x) => (
          <Caja3 key={x} p={[x, 1.2, 0]} s={[0.12, 2.4, 0.12]} c="#57534e" />
        ))}
        <Caja3 p={[0, 1.75, 0]} s={[3.4, 1.5, 0.1]} c="#b08457" />
        <Caja3 p={[0, 1.75, -0.02]} s={[3.56, 1.66, 0.08]} c="#78350f" />
        <Html position={[0, 1.78, 0.08]} center distanceFactor={9} zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ width: 250, padding: "10px 12px", background: "#fffbeb", borderRadius: 4, boxShadow: "0 8px 18px -8px #000", textAlign: "center", transform: "rotate(-1.5deg)" }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", color: "#b45309" }}>COMMUNITY MEETING · NEED {dilemaIdx + 1}/4</div>
            <div style={{ fontSize: 15.5, fontWeight: 900, color: "#1c1917", lineHeight: 1.25, marginTop: 5 }}>
              <i className={`fa-solid ${d.icono}`} style={{ color: "#0369a1", marginRight: 7 }} />
              {d.necesidad}
            </div>
          </div>
        </Html>
      </group>
      {/* Vecinos de la asamblea */}
      {[
        [-6.3, -1.4, 0.9, "#f472b6"],
        [6.3, -1.4, -0.9, "#22c55e"],
        [-5.45, 1.95, 1.9, "#a855f7"],
        [5.45, 1.95, -1.9, "#f59e0b"],
      ].map(([x, z, r, c], k) => (
        <group key={k}>
          <Persona pos={[x as number, 0, z as number]} rotY={r as number} camisa={c as string} pelo={k % 2 ? "#3f2a1d" : "#111827"} coleta={k % 2 === 0} animo={resuelto ? "feliz" : "neutro"} escala={0.95} />
          {resuelto && (
            <Html position={[x as number, 2.2, z as number]} center distanceFactor={10} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fff", border: `2px solid ${OK}`, color: OK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                <i className="fa-solid fa-thumbs-up" />
              </div>
            </Html>
          )}
        </group>
      ))}
      <Plataforma lado="A" dIdx={dilemaIdx} revel={reveladas} elegida={elegida} resuelto={resuelto} activo={activo} onLado={onLado} modoColor={modoColor} />
      <Plataforma lado="B" dIdx={dilemaIdx} revel={reveladas} elegida={elegida} resuelto={resuelto} activo={activo} onLado={onLado} modoColor={modoColor} />
      <Etiqueta pos={[0, 0.45, 1.6]} df={10} fs={12} col={`${modoColor}aa`}>
        <i className="fa-solid fa-scale-balanced" style={{ color: modoColor }} />
        {elegida ? `You chose ${elegida}` : "A or B?"}
      </Etiqueta>
      {(oracion || elegida) && (
        <Html position={[0, 4.35, -2.9]} center distanceFactor={10} zIndexRange={[25, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ whiteSpace: "nowrap", padding: "8px 16px", borderRadius: 14, background: "rgba(4,10,22,0.9)", border: `2px solid ${colOracion}`, color: oracion ? "#fff" : "rgba(255,255,255,0.55)", fontSize: 16, fontWeight: 900, boxShadow: `0 0 26px -8px ${colOracion}` }}>
            {estadoOracion === "ok" && <i className="fa-solid fa-circle-check" style={{ color: OK, marginRight: 8 }} />}
            {oracion || "I'd rather… because…"}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. EL CENTRO DE ACOPIO
 * ════════════════════════════════════════════════════════════════════════ */

function ModeloInsumo({ id }: { id: Insumo }) {
  if (id === "rice")
    return (
      <mesh position={[0, 0.08, 0]} scale={[0.2, 0.16, 0.12]} geometry={CAJA} castShadow>
        <Clay color="#f5f0e1" rough={0.9} />
      </mesh>
    );
  if (id === "beans")
    return (
      <group>
        <mesh position={[0, 0.07, 0]} scale={[0.065, 0.14, 0.065]} geometry={CILINDRO} castShadow>
          <Clay color="#94a3b8" rough={0.3} />
        </mesh>
        <mesh position={[0, 0.07, 0]} scale={[0.067, 0.08, 0.067]} geometry={CILINDRO}>
          <Clay color="#b45309" />
        </mesh>
      </group>
    );
  if (id === "water")
    return (
      <group>
        <mesh position={[0, 0.12, 0]} scale={[0.06, 0.24, 0.06]} geometry={CILINDRO} castShadow>
          <meshStandardMaterial color="#7dd3fc" roughness={0.1} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 0.26, 0]} scale={[0.03, 0.04, 0.03]} geometry={CILINDRO}>
          <Clay color="#1d4ed8" />
        </mesh>
      </group>
    );
  if (id === "blankets")
    return (
      <mesh position={[0, 0.05, 0]} scale={[0.32, 0.1, 0.24]} geometry={CAJA} castShadow>
        <Clay color="#a855f7" rough={0.95} />
      </mesh>
    );
  if (id === "books")
    return (
      <mesh position={[0, 0.03, 0]} scale={[0.22, 0.06, 0.16]} geometry={CAJA} castShadow>
        <Clay color="#22c55e" rough={0.6} />
      </mesh>
    );
  return (
    <mesh position={[0, 0.03, 0]} scale={[0.12, 0.06, 0.08]} geometry={CAJA} castShadow>
      <Clay color="#f9a8d4" rough={0.4} />
    </mesh>
  );
}

/** Lugar de cada insumo dentro de la caja de empaque (x, z por columna; se apila en y). */
const HUECO_CAJA: Record<Insumo, { x: number; z: number; paso: number; porFila: number; dx: number }> = {
  rice: { x: -0.3, z: -0.14, paso: 0.16, porFila: 2, dx: 0.22 },
  beans: { x: 0.1, z: -0.18, paso: 0.14, porFila: 4, dx: 0.11 },
  water: { x: -0.33, z: 0.14, paso: 0.26, porFila: 4, dx: 0.12 },
  blankets: { x: -0.25, z: 0.0, paso: 0.1, porFila: 1, dx: 0 },
  books: { x: 0.22, z: 0.14, paso: 0.06, porFila: 1, dx: 0 },
  soap: { x: 0.28, z: 0.02, paso: 0.06, porFila: 2, dx: 0.13 },
};

function CajaEmpaque({ caja, estado, modoColor }: { caja: Caja; estado: "ok" | "mal" | null; modoColor: string }) {
  const g = useRef<THREE.Group>(null);
  const ultimo = useRef<"ok" | "mal" | null>(null);
  const tS = useRef(9);
  useFrame((_, dt) => {
    if (estado !== ultimo.current) {
      ultimo.current = estado;
      tS.current = 0;
    }
    tS.current += dt;
    if (g.current) g.current.rotation.z = estado === "mal" && tS.current < 0.5 ? Math.sin(tS.current * 40) * 0.05 : 0;
  });
  const borde = estado === "ok" ? OK : estado === "mal" ? WARN : modoColor;
  return (
    <group ref={g} position={[0, 0.93, 0.45]}>
      <Caja3 p={[0, 0.02, 0]} s={[1.0, 0.04, 0.66]} c="#b88a5a" />
      <Caja3 p={[0, 0.11, -0.33]} s={[1.0, 0.22, 0.03]} c="#c69c6d" />
      <Caja3 p={[0, 0.11, 0.33]} s={[1.0, 0.22, 0.03]} c="#c69c6d" />
      <Caja3 p={[-0.5, 0.11, 0]} s={[0.03, 0.22, 0.66]} c="#c69c6d" />
      <Caja3 p={[0.5, 0.11, 0]} s={[0.03, 0.22, 0.66]} c="#c69c6d" />
      <Caja3 p={[0, 0.3, -0.5]} s={[1.0, 0.03, 0.4]} c="#d6ab7d" rot={[1.1, 0, 0]} />
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.68, 48]} />
        <meshBasicMaterial color={borde} transparent opacity={0.75} toneMapped={false} />
      </mesh>
      {INSUMOS.map((x) =>
        Array.from({ length: caja[x.id] }, (_, k) => {
          const h = HUECO_CAJA[x.id];
          const fila = Math.floor(k / h.porFila);
          const col = k % h.porFila;
          return (
            <group key={`${x.id}-${k}`} position={[h.x + col * h.dx, 0.04 + fila * h.paso, h.z]}>
              <ModeloInsumo id={x.id} />
            </group>
          );
        }),
      )}
    </group>
  );
}

function CajaEntregada({ idx, nombre }: { idx: number; nombre: string }) {
  const g = useRef<THREE.Group>(null);
  const t0 = useRef(-1);
  const destino: Pt = [3.55 + (idx % 2) * 0.95 - 0.45, 0.32 + Math.floor(idx / 2) * 0.62, 0.6];
  useFrame(({ clock }) => {
    const grp = g.current;
    if (!grp) return;
    const t = clock.elapsedTime;
    if (t0.current < 0) t0.current = t < 0.6 ? t - 5 : t;
    const e = smooth((t - t0.current) / 1.1);
    grp.position.set(0 + (destino[0] - 0) * e, 1.2 + (destino[1] - 1.2) * e + Math.sin(Math.PI * e) * 0.9, 0.45 + (destino[2] - 0.45) * e);
  });
  return (
    <group ref={g} position={[0, 1.2, 0.45]}>
      <Caja3 p={[0, 0, 0]} s={[0.85, 0.58, 0.6]} c="#c69c6d" />
      <Caja3 p={[0, 0.02, 0.301]} s={[0.86, 0.08, 0.01]} c="#e8d5b5" sombra={false} />
      <mesh position={[0, 0.15, 0.302]} geometry={CAJA} scale={[0.14, 0.14, 0.01]}>
        <meshBasicMaterial color="#e11d48" />
      </mesh>
      <Html position={[0, -0.12, 0.33]} center distanceFactor={9} zIndexRange={[16, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ padding: "1px 6px", borderRadius: 5, background: "rgba(255,250,240,0.95)", color: "#1c1917", fontSize: 10, fontWeight: 900, whiteSpace: "nowrap" }}>{nombre}</div>
      </Html>
    </group>
  );
}

function EstanteInsumos({ x, insumos }: { x: number; insumos: Insumo[] }) {
  return (
    <group position={[x, 0, -2.9]}>
      {[-1.05, 1.05].map((sx) => (
        <Caja3 key={sx} p={[sx, 1.1, 0]} s={[0.07, 2.2, 0.6]} c="#64748b" />
      ))}
      {[0.35, 1.05, 1.75].map((y) => (
        <Caja3 key={y} p={[0, y, 0]} s={[2.15, 0.05, 0.6]} c="#94a3b8" />
      ))}
      {insumos.map((id, fila) =>
        Array.from({ length: id === "blankets" ? 5 : id === "rice" ? 7 : 9 }, (_, k) => {
          const n = id === "blankets" ? 5 : id === "rice" ? 7 : 9;
          const paso = 1.9 / n;
          return (
            <group key={`${id}-${k}`} position={[-0.95 + paso * (k + 0.5), 0.38 + fila * 0.7, (k % 2) * 0.08 - 0.04]} scale={id === "blankets" ? 1 : 1.25}>
              <ModeloInsumo id={id} />
            </group>
          );
        }),
      )}
    </group>
  );
}

function EscenaAcopio({ vecinoIdx, fase, dichoTu, caja, estadoCaja, entregados, modoColor }: Pick<MercadoSceneProps, "vecinoIdx" | "fase" | "dichoTu" | "caja" | "estadoCaja" | "entregados" | "modoColor">) {
  const v = VECINOS[vecinoIdx]!;
  const yaAtendido = entregados.includes(v.id);
  const animo = yaAtendido || fase === "listo" ? "feliz" : fase === "empatia" ? "triste" : "neutro";
  const dichoVecino = yaAtendido ? "Thank you so much!" : fase === "empatia" ? v.dice : v.contesta;
  const icono = animo === "feliz" ? "fa-face-smile" : animo === "triste" ? "fa-face-frown" : "fa-face-meh";
  const colAnimo = animo === "feliz" ? OK : animo === "triste" ? "#60a5fa" : "#fbbf24";
  const vec = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (vec.current) vec.current.position.y = animo === "feliz" ? Math.abs(Math.sin(clock.elapsedTime * 4)) * 0.06 : 0;
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[13, 9]} />
        <Clay color="#a8a29e" rough={0.95} />
      </mesh>
      {Array.from({ length: 6 }, (_, k) => (
        <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} position={[-6.5 + k * 2.6, 0.004, 0]}>
          <planeGeometry args={[0.03, 9]} />
          <meshBasicMaterial color="#8b8580" />
        </mesh>
      ))}
      <Caja3 p={[0, 1.7, -3.35]} s={[13, 3.4, 0.14]} c="#e7e5e4" />
      <Caja3 p={[-6.43, 1.7, -0.9]} s={[0.14, 3.4, 5]} c="#d6d3d1" />
      <Html position={[0, 3.05, -3.25]} center distanceFactor={10} zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ padding: "6px 18px", borderRadius: 8, background: "#0f766e", color: "#fff", fontWeight: 900, fontSize: 15, whiteSpace: "nowrap", boxShadow: "0 8px 20px -10px #000", border: "2px solid #99f6e4" }}>
          <i className="fa-solid fa-hand-holding-heart" style={{ marginRight: 8, color: "#fbcfe8" }} />
          COMMUNITY HELP CENTER · Centro de acopio Las Flores
        </div>
      </Html>
      <EstanteInsumos x={-2.9} insumos={["rice", "beans", "water"]} />
      <EstanteInsumos x={0.35} insumos={["blankets", "books", "soap"]} />
      {INSUMOS.map((x, k) => (
        <Etiqueta key={x.id} pos={[k < 3 ? -2.9 : 0.35, 0.24 + (k % 3) * 0.7, -2.5]} df={10} fs={9.5} col={`${x.color}99`}>
          {x.en.replace("kilos of ", "").replace("cans of ", "").replace("bottles of ", "").replace("bars of ", "")}
        </Etiqueta>
      ))}

      {/* Mesa de empaque */}
      <Caja3 p={[0, 0.88, 0.45]} s={[2.6, 0.08, 1.2]} c="#a47148" />
      {[
        [-1.2, -0.05],
        [1.2, -0.05],
        [-1.2, 0.95],
        [1.2, 0.95],
      ].map(([x, z]) => (
        <Caja3 key={`${x}${z}`} p={[x!, 0.43, z!]} s={[0.07, 0.86, 0.07]} c="#57534e" />
      ))}
      <CajaEmpaque caja={caja} estado={estadoCaja} modoColor={modoColor} />
      {/* Tú, voluntario */}
      <Persona pos={[1.6, 0, -0.4]} rotY={-0.35} camisa="#334155" delantal={modoColor} pelo="#1f1410" animo="feliz" />
      <Etiqueta pos={[1.6, 2.05, -0.4]} df={10} fs={10.5} col={`${modoColor}aa`}>
        <i className="fa-solid fa-user" style={{ color: modoColor }} />
        You
      </Etiqueta>
      {dichoTu && (
        <Burbuja pos={[1.6, 2.75, -0.4]} ancho={250} borde={modoColor} oscura fs={12.5}>
          {dichoTu}
        </Burbuja>
      )}
      {/* Vecino */}
      <group ref={vec}>
        <Persona pos={[-2.75, 0, 1.45]} rotY={0.55} camisa={v.camisa} pelo={v.cabello} canoso={v.id === "chuy"} coleta={v.coleta} animo={animo} />
      </group>
      <Html position={[-2.75, 2.15, 1.45]} center distanceFactor={10} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff", border: `2px solid ${colAnimo}`, color: colAnimo, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>
          <i className={`fa-solid ${icono}`} />
        </div>
      </Html>
      <Burbuja pos={[-2.6, 3.1, 1.45]} ancho={250} borde={v.camisa} fs={12.5}>
        <span style={{ color: v.camisa, marginRight: 5 }}>{v.nombre}:</span>
        {dichoVecino}
      </Burbuja>

      {/* Zona de entregas */}
      <Caja3 p={[3.55, 0.05, 0.6]} s={[2.1, 0.1, 1.0]} c="#92400e" />
      {entregados.map((id, k) => (
        <CajaEntregada key={id} idx={k} nombre={VECINOS.find((x) => x.id === id)?.nombre ?? id} />
      ))}
      <Etiqueta pos={[3.55, 0.12, 1.45]} df={10} fs={12} col={entregados.length === VECINOS.length ? OK : `${modoColor}aa`}>
        <i className="fa-solid fa-truck-ramp-box" style={{ color: entregados.length === VECINOS.length ? OK : modoColor }} />
        Families helped: {entregados.length}/{VECINOS.length}
      </Etiqueta>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function MercadoNecesidadesInglesScene(p: MercadoSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt; min: number; max: number } => {
    if (vista === "mercado") return { pos: [0, 4.3, 9.6], target: [0, 1.25, 0.3], min: 4, max: 17 };
    if (vista === "elegir") return { pos: [0, 5.4, 11.6], target: [0, 1.5, -0.2], min: 5, max: 19 };
    return { pos: [0, 4.9, 8.0], target: [0, 1.0, -0.1], min: 4, max: 16 };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 45 }} gl={{ antialias: true }} onPointerMissed={() => cursor(false)}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 22, 44]} />
      <ambientLight intensity={0.62} />
      <hemisphereLight args={["#fff7ed", "#334155", 0.45]} />
      <directionalLight position={[5, 10, 7]} intensity={1.25} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.0004} />
      <pointLight position={[-4, 3.5, 4]} intensity={0.35} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.4} position={[0, 6, -6]} scale={[12, 6, 1]} color="#fff7ed" />
        <Lightformer form="rect" intensity={0.6} position={[-7, 2, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "mercado" && (
        <EscenaMercado
          comprados={p.comprados}
          seleccionado={p.seleccionado}
          elegible={p.elegible}
          dichoVendedor={p.dichoVendedor}
          dichoCliente={p.dichoCliente}
          ofertaIdx={p.ofertaIdx}
          ofertasAceptadas={p.ofertasAceptadas}
          totalVisible={p.totalVisible}
          pagado={p.pagado}
          onProducto={p.onProducto}
          modoColor={modoColor}
        />
      )}
      {vista === "elegir" && (
        <EscenaElegir dilemaIdx={p.dilemaIdx} reveladas={p.reveladas} elegida={p.elegida} resuelto={p.resuelto} oracion={p.oracion} estadoOracion={p.estadoOracion} onLado={p.onLado} modoColor={modoColor} />
      )}
      {vista === "acopio" && <EscenaAcopio vecinoIdx={p.vecinoIdx} fase={p.fase} dichoTu={p.dichoTu} caja={p.caja} estadoCaja={p.estadoCaja} entregados={p.entregados} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={cam.min} maxDistance={cam.max} maxPolarAngle={Math.PI * 0.47} minPolarAngle={Math.PI * 0.08} maxAzimuthAngle={Math.PI * 0.35} minAzimuthAngle={-Math.PI * 0.35} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.22} luminanceThreshold={0.92} luminanceSmoothing={0.6} mipmapBlur />
        <Vignette eskil={false} offset={0.22} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
