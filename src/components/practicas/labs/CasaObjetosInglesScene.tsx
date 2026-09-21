"use client";

/**
 * Escena 3D del laboratorio "Objects and spaces" (IN-I-P03). Tres vistas:
 *
 *  - buscar: un aula con pizarrón, bancas, escritorio, estantes y 20 objetos
 *    (relojes en la pared, cajas en los estantes, mochilas en el piso,
 *    cuadernos en las bancas y lápices en el escritorio) que se distinguen
 *    por tamaño, forma y color. El alumno hace clic en el que pide la
 *    instrucción.
 *  - perdidos: la ventanilla de objetos perdidos de la escuela: un estante de
 *    4 × 4, el encargado y el mostrador. Lo que el alumno describe se ilumina
 *    en el estante y, si es su objeto, viaja al mostrador.
 *  - acomodar: una recámara con cama, escritorio, estante, caja de juguetes y
 *    puerta; nueve lugares numerados y seis objetos que el alumno acomoda.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, RoundedBox } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type Objeto,
  type NounId,
  type Tamano,
  type Forma,
  type ColorId,
  type MovibleId,
  type SpotId,
  COLORES,
  MOVIBLES,
  MOVIBLE_DEF,
  SPOTS_MARCADOS,
  nucleo,
  rasgosDe,
} from "./casa-objetos-ingles-data";

export interface CasaSceneProps {
  vista: Modo;
  modoColor: string;
  resetNonce: number;
  // Find it
  aula: Objeto[];
  halladosAula: string[];
  falloAula: { id: string; n: number } | null;
  numerosAula: boolean;
  onPickAula: (id: string) => void;
  // Lost and found
  estante: Objeto[];
  tuyoId: string | null;
  coinciden: string[];
  equivocadoId: string | null;
  recuperados: string[];
  burbuja: string;
  // Arrange the room
  ubic: Record<MovibleId, SpotId>;
  seleccion: MovibleId | null;
  intento: { obj: MovibleId; spot: SpotId; n: number } | null;
  marcaFrase: { spot: SpotId; texto: string; ok: boolean } | null;
  onPickMovible: (m: MovibleId) => void;
  onPickSpot: (s: SpotId) => void;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const WARN = "#fb923c";
const hex = (c: ColorId) => COLORES[c].hex;

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

/** Texto pintado en una textura (sin DOM ni troika): lo tapa lo que tenga delante. */
function TextoPlano({ texto, w, h, px, pos, color = "#ffffff", fuente = "900 {px}px system-ui, 'Segoe UI', sans-serif" }: { texto: string; w: number; h: number; px: number; pos: Pt; color?: string; fuente?: string }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = Math.round(w * 256);
    c.height = Math.round(h * 256);
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = color;
      let tam = px;
      ctx.font = fuente.replace("{px}", String(tam));
      while (tam > 12 && ctx.measureText(texto).width > c.width * 0.94) {
        tam -= 4;
        ctx.font = fuente.replace("{px}", String(tam));
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(texto, c.width / 2, c.height / 2 + tam * 0.04);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [texto, w, h, px, color, fuente]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh position={pos}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function Clay({ color, rough = 0.78, emissive, ei = 0 }: { color: string; rough?: number; emissive?: string; ei?: number }) {
  return <meshStandardMaterial color={color} roughness={rough} emissive={emissive ?? "#000000"} emissiveIntensity={ei} />;
}

const cursor = (on: boolean) => {
  document.body.style.cursor = on ? "pointer" : "auto";
};

/* ════════════════════════════════════════════════════════════════════════
 * MODELOS DE OBJETOS (origen en la base, de frente a +z)
 * ════════════════════════════════════════════════════════════════════════ */

function Reloj({ tamano, forma, color }: { tamano: Tamano; forma: Forma | null; color: ColorId }) {
  const R = tamano === "big" ? 0.42 : 0.26;
  const c = hex(color);
  return (
    <group>
      {forma === "square" ? (
        <>
          <RoundedBox args={[R * 1.8, R * 1.8, 0.1]} radius={0.04} smoothness={3} castShadow>
            <Clay color={c} />
          </RoundedBox>
          <mesh position={[0, 0, 0.052]}>
            <planeGeometry args={[R * 1.45, R * 1.45]} />
            <meshStandardMaterial color="#fbfaf5" roughness={0.6} />
          </mesh>
        </>
      ) : forma === "triangular" ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -R * 0.1, 0]} castShadow>
            <cylinderGeometry args={[R * 1.3, R * 1.3, 0.1, 3]} />
            <Clay color={c} />
          </mesh>
          <mesh position={[0, -R * 0.1, 0.052]} rotation={[0, 0, Math.PI / 2]}>
            <circleGeometry args={[R * 0.98, 3]} />
            <meshStandardMaterial color="#fbfaf5" roughness={0.6} />
          </mesh>
        </>
      ) : (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[R, R, 0.1, 40]} />
            <Clay color={c} />
          </mesh>
          <mesh position={[0, 0, 0.052]}>
            <circleGeometry args={[R * 0.8, 40]} />
            <meshStandardMaterial color="#fbfaf5" roughness={0.6} />
          </mesh>
        </>
      )}
      {Array.from({ length: 4 }, (_, k) => {
        const a = (k / 4) * Math.PI * 2;
        return (
          <mesh key={k} position={[Math.sin(a) * R * 0.52, Math.cos(a) * R * 0.52 - (forma === "triangular" ? R * 0.1 : 0), 0.058]}>
            <circleGeometry args={[R * 0.05, 10]} />
            <meshBasicMaterial color="#1f2937" />
          </mesh>
        );
      })}
      <mesh position={[0, R * 0.18, 0.062]}>
        <boxGeometry args={[R * 0.06, R * 0.42, 0.01]} />
        <meshBasicMaterial color="#111827" />
      </mesh>
      <mesh position={[R * 0.13, -R * 0.02, 0.064]} rotation={[0, 0, -1.2]}>
        <boxGeometry args={[R * 0.06, R * 0.3, 0.01]} />
        <meshBasicMaterial color="#111827" />
      </mesh>
    </group>
  );
}

/** Caja, lonchera o estuche según la forma. `eje` = hacia dónde mira la cara con la forma. */
function Caja({ s, forma, color, asa = false, largo = 1 }: { s: number; forma: Forma | null; color: ColorId; asa?: boolean; largo?: number }) {
  const c = hex(color);
  let cuerpo: ReactNode;
  let alto = s;
  if (forma === "rectangular") {
    alto = s * 0.72;
    cuerpo = (
      <RoundedBox args={[s * 1.55, alto, s * 0.8 * largo]} radius={0.04} smoothness={3} position={[0, alto / 2, 0]} castShadow receiveShadow>
        <Clay color={c} />
      </RoundedBox>
    );
  } else if (forma === "round") {
    alto = s;
    cuerpo = (
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, s / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[s / 2, s / 2, s * 0.8 * largo, 36]} />
        <Clay color={c} />
      </mesh>
    );
  } else if (forma === "triangular") {
    const r = s * 0.66;
    alto = r * 1.5;
    cuerpo = (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, r / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, s * 0.8 * largo, 3]} />
        <Clay color={c} />
      </mesh>
    );
  } else {
    cuerpo = (
      <RoundedBox args={[s, s, s * 0.8 * largo]} radius={0.04} smoothness={3} position={[0, s / 2, 0]} castShadow receiveShadow>
        <Clay color={c} />
      </RoundedBox>
    );
  }
  return (
    <group>
      {cuerpo}
      {asa && (
        <mesh position={[0, alto + 0.005, 0]}>
          <torusGeometry args={[s * 0.18, s * 0.035, 8, 20, Math.PI]} />
          <meshStandardMaterial color="#374151" roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

function Mochila({ tamano, color }: { tamano: Tamano; color: ColorId }) {
  const k = tamano === "big" ? 1 : 0.62;
  const c = hex(color);
  return (
    <group scale={k}>
      <RoundedBox args={[0.52, 0.64, 0.3]} radius={0.12} smoothness={4} position={[0, 0.32, 0]} castShadow receiveShadow>
        <Clay color={c} />
      </RoundedBox>
      <RoundedBox args={[0.38, 0.26, 0.1]} radius={0.05} smoothness={3} position={[0, 0.2, 0.16]} castShadow>
        <Clay color={c} rough={0.6} />
      </RoundedBox>
      <mesh position={[0, 0.33, 0.212]}>
        <boxGeometry args={[0.3, 0.018, 0.01]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <torusGeometry args={[0.08, 0.022, 8, 18, Math.PI]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

function Cuaderno({ tamano, color }: { tamano: Tamano; color: ColorId }) {
  const [w, d] = tamano === "big" ? [0.52, 0.68] : [0.34, 0.46];
  const anillos = tamano === "big" ? 6 : 4;
  return (
    <group>
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.96, 0.03, d * 0.96]} />
        <meshStandardMaterial color="#fbfaf5" roughness={0.9} />
      </mesh>
      <RoundedBox args={[w, 0.022, d]} radius={0.008} smoothness={2} position={[0, 0.045, 0]} castShadow>
        <Clay color={hex(color)} />
      </RoundedBox>
      {Array.from({ length: anillos }, (_, i) => (
        <mesh key={i} position={[-w / 2, 0.035, -d / 2 + ((i + 0.5) / anillos) * d]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.022, 0.006, 6, 12]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Lapiz({ tamano, color }: { tamano: Tamano; color: ColorId }) {
  const L = tamano === "long" ? 0.95 : 0.5;
  const r = 0.06;
  return (
    <group position={[0, r, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[r, r, L, 6]} />
        <Clay color={hex(color)} rough={0.55} />
      </mesh>
      <mesh position={[0, L / 2 + 0.06, 0]}>
        <coneGeometry args={[r, 0.12, 6]} />
        <meshStandardMaterial color="#e8c28a" roughness={0.8} />
      </mesh>
      <mesh position={[0, L / 2 + 0.1, 0]}>
        <coneGeometry args={[r * 0.38, 0.045, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0, -L / 2 - 0.03, 0]}>
        <cylinderGeometry args={[r * 1.02, r * 1.02, 0.06, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -L / 2 - 0.09, 0]}>
        <cylinderGeometry args={[r, r, 0.07, 12]} />
        <meshStandardMaterial color="#f9a8d4" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Pelota({ tamano, color }: { tamano: Tamano; color: ColorId }) {
  const r = tamano === "big" ? 0.3 : 0.17;
  return (
    <group position={[0, r, 0]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[r, 32, 24]} />
        <Clay color={hex(color)} rough={0.5} />
      </mesh>
      <mesh rotation={[0.3, 0, 0.5]}>
        <torusGeometry args={[r * 1.002, r * 0.07, 8, 40]} />
        <meshStandardMaterial color={color === "white" ? "#9ca3af" : "#f8fafc"} roughness={0.5} />
      </mesh>
    </group>
  );
}

function ModeloObjeto({ o }: { o: Pick<Objeto, "noun" | "tamano" | "forma" | "color"> }) {
  const { noun, tamano, forma, color } = o;
  if (noun === "clock") return <Reloj tamano={tamano} forma={forma} color={color} />;
  if (noun === "box") return <Caja s={tamano === "big" ? 0.56 : 0.34} forma={forma} color={color} />;
  if (noun === "lunchbox") return <Caja s={tamano === "big" ? 0.62 : 0.38} forma={forma} color={color} asa />;
  if (noun === "pencilcase")
    return (
      <group rotation={[0, -0.75, 0]}>
        <Caja s={tamano === "big" ? 0.34 : 0.22} forma={forma} color={color} largo={tamano === "big" ? 3.2 : 2.6} />
      </group>
    );
  if (noun === "backpack") return <Mochila tamano={tamano} color={color} />;
  if (noun === "notebook") return <Cuaderno tamano={tamano} color={color} />;
  if (noun === "pencil") return <Lapiz tamano={tamano} color={color} />;
  return <Pelota tamano={tamano} color={color} />;
}

/** Radio aproximado del objeto (para el halo). */
function radioDe(noun: NounId, tamano: Tamano): number {
  const big = tamano === "big" || tamano === "long";
  if (noun === "clock") return big ? 0.55 : 0.36;
  if (noun === "pencil") return big ? 0.62 : 0.4;
  if (noun === "notebook") return big ? 0.48 : 0.32;
  if (noun === "backpack") return big ? 0.42 : 0.28;
  if (noun === "pencilcase") return big ? 0.62 : 0.42;
  return big ? 0.5 : 0.32;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. FIND IT — el aula
 * ════════════════════════════════════════════════════════════════════════ */

const SLOTS_AULA: Record<string, { p: Pt; pared?: boolean }[]> = {
  clock: [
    { p: [-5.2, 2.75, -4.47], pared: true },
    { p: [-3.75, 3.2, -4.47], pared: true },
    { p: [3.75, 3.2, -4.47], pared: true },
    { p: [5.2, 2.75, -4.47], pared: true },
  ],
  box: [
    { p: [-5.15, 0.9, -4.15] },
    { p: [-3.85, 0.9, -4.15] },
    { p: [3.85, 0.9, -4.15] },
    { p: [5.15, 0.9, -4.15] },
  ],
  backpack: [{ p: [-1.72, 0, -0.35] }, { p: [1.72, 0, -0.35] }, { p: [-1.72, 0, 2.3] }, { p: [1.72, 0, 2.3] }],
  notebook: [{ p: [-3.4, 0.79, -0.7] }, { p: [0, 0.79, -0.7] }, { p: [3.4, 0.79, -0.7] }, { p: [0, 0.79, 1.9] }],
  pencil: [{ p: [-3.4, 0.79, 1.72] }, { p: [-3.4, 0.79, 2.12] }, { p: [3.4, 0.79, 1.72] }, { p: [3.4, 0.79, 2.12] }],
};

function posAula(o: Objeto) {
  return SLOTS_AULA[o.noun]![o.slot]!;
}

function ObjetoClicable({
  o,
  pos,
  pared,
  estado,
  sacude,
  numero,
  onPick,
}: {
  o: Objeto;
  pos: Pt;
  pared?: boolean;
  estado: "normal" | "hallado";
  sacude: number;
  numero: number | null;
  onPick: (id: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const g = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const ultimo = useRef(sacude);
  const tSacude = useRef(99);
  const tHallado = useRef(estado === "hallado" ? 99 : 0);
  const r = radioDe(o.noun, o.tamano);
  useFrame((_, dt) => {
    if (sacude !== ultimo.current) {
      ultimo.current = sacude;
      tSacude.current = 0;
    }
    tSacude.current += dt;
    if (estado === "hallado") tHallado.current += dt;
    else tHallado.current = 0;
    const grp = g.current;
    if (grp) {
      const s = tSacude.current < 0.6 ? Math.sin(tSacude.current * 38) * 0.12 * (1 - tSacude.current / 0.6) : 0;
      grp.rotation.z = pared ? s : 0;
      grp.rotation.y = pared ? 0 : s;
      const salto = estado === "hallado" && tHallado.current < 0.7 ? Math.sin((tHallado.current / 0.7) * Math.PI) * 0.35 : 0;
      grp.position.set(pos[0], pos[1] + (pared ? 0 : salto), pos[2] + (pared ? salto * 0.4 : 0));
    }
    if (halo.current) {
      const m = halo.current.material as THREE.MeshBasicMaterial;
      const alerta = tSacude.current < 1.2;
      m.color.set(alerta ? WARN : estado === "hallado" ? OK : "#ffffff");
      m.opacity = alerta ? 0.75 : estado === "hallado" ? 0.7 : hover ? 0.55 : 0;
      halo.current.visible = m.opacity > 0.01;
    }
  });
  return (
    <group
      ref={g}
      position={pos}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onPick(o.id);
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHover(true);
        cursor(true);
      }}
      onPointerOut={() => {
        setHover(false);
        cursor(false);
      }}
    >
      <mesh ref={halo} position={pared ? [0, 0, -0.02] : [0, 0.012, 0]} rotation={pared ? [0, 0, 0] : [-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[r * 0.95, r * 1.2, 40]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <ModeloObjeto o={o} />
      {estado === "hallado" && (
        <Html position={[0, pared ? r + 0.12 : r * 1.6 + 0.2, 0]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ width: 22, height: 22, borderRadius: 999, background: OK, color: "#04121f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, boxShadow: "0 4px 12px -4px #000" }}>✓</div>
        </Html>
      )}
      {numero !== null && (
        <Html position={pared ? [r + 0.24, 0, 0.1] : o.noun === "pencil" ? [r + 0.12, 0.12, 0] : [0, r * 1.4 + 0.12, 0]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div data-co-num={numero} data-co-desc={nucleo(rasgosDe(o))} style={{ minWidth: 22, padding: "2px 6px", borderRadius: 7, background: "rgba(4,10,22,0.88)", border: "1px solid rgba(255,255,255,0.45)", color: "#fff", fontSize: 12, fontWeight: 900, textAlign: "center" }}>
            {numero}
          </div>
        </Html>
      )}
    </group>
  );
}

function Pupitre({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[1.35, 0.08, 0.85]} radius={0.03} smoothness={3} position={[0, 0.74, 0]} castShadow receiveShadow>
        <Clay color="#d9b27a" />
      </RoundedBox>
      {[
        [-0.58, -0.35],
        [0.58, -0.35],
        [-0.58, 0.35],
        [0.58, 0.35],
      ].map(([a, b]) => (
        <mesh key={`${a}${b}`} position={[a!, 0.35, b!]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <RoundedBox args={[0.6, 0.06, 0.5]} radius={0.02} smoothness={2} position={[0, 0.44, 0.72]} castShadow>
        <Clay color="#4b6a8f" />
      </RoundedBox>
      <RoundedBox args={[0.6, 0.34, 0.05]} radius={0.02} smoothness={2} position={[0, 0.66, 0.96]} castShadow>
        <Clay color="#4b6a8f" />
      </RoundedBox>
      {[-0.26, 0.26].map((a) => (
        <mesh key={a} position={[a, 0.22, 0.72]}>
          <cylinderGeometry args={[0.022, 0.022, 0.44, 6]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}
    </group>
  );
}

function Estante({ x, z, w = 2.8, alto = 1.7, prof = 0.62, madera = "#a8744a", abierto = false }: { x: number; z: number; w?: number; alto?: number; prof?: number; madera?: string; abierto?: boolean }) {
  return (
    <group position={[x, 0, z]}>
      {[0.04, alto / 2, alto].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.06, prof]} />
          <Clay color={madera} />
        </mesh>
      ))}
      {[-w / 2, w / 2].map((a) =>
        abierto ? (
          <mesh key={a} position={[a * 0.97, alto / 2, prof / 2 - 0.04]} castShadow>
            <boxGeometry args={[0.06, alto, 0.06]} />
            <Clay color={madera} />
          </mesh>
        ) : (
          <mesh key={a} position={[a, alto / 2, 0]} castShadow>
            <boxGeometry args={[0.07, alto + 0.06, prof]} />
            <Clay color={madera} />
          </mesh>
        ),
      )}
      <mesh position={[0, alto / 2, -prof / 2 + 0.02]}>
        <boxGeometry args={[w, alto, 0.03]} />
        <Clay color="#7a5234" />
      </mesh>
    </group>
  );
}

function Aula({ aula, hallados, fallo, numeros, onPick }: { aula: Objeto[]; hallados: string[]; fallo: { id: string; n: number } | null; numeros: boolean; onPick: (id: string) => void }) {
  return (
    <group>
      {/* Piso de duela */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[12.6, 0.1, 9.4]} />
        <Clay color="#c99a68" />
      </mesh>
      {Array.from({ length: 15 }, (_, i) => (
        <mesh key={i} position={[-6.3 + i * 0.9, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.02, 9.4]} />
          <meshBasicMaterial color="#a97d52" />
        </mesh>
      ))}
      {/* Paredes */}
      <mesh position={[0, 2.1, -4.65]} receiveShadow>
        <boxGeometry args={[12.6, 4.2, 0.2]} />
        <Clay color="#bccadb" />
      </mesh>
      <mesh position={[0, 0.12, -4.53]}>
        <boxGeometry args={[12.6, 0.24, 0.05]} />
        <Clay color="#6b7f99" />
      </mesh>
      <mesh position={[-6.35, 2.1, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.2, 9.4]} />
        <Clay color="#aebed2" />
      </mesh>
      <mesh position={[6.35, 2.1, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.2, 9.4]} />
        <Clay color="#aebed2" />
      </mesh>
      {/* Ventanas (pared izquierda) */}
      {[-2.2, 1.4].map((z) => (
        <group key={z} position={[-6.22, 2.3, z]}>
          <mesh>
            <boxGeometry args={[0.06, 1.6, 2.0]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
          <mesh position={[0.04, 0, 0]}>
            <boxGeometry args={[0.02, 1.42, 1.82]} />
            <meshStandardMaterial color="#9fd3f5" emissive="#7cc4f2" emissiveIntensity={0.55} roughness={0.2} />
          </mesh>
          <mesh position={[0.06, 0, 0]}>
            <boxGeometry args={[0.02, 1.42, 0.05]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      ))}
      {/* Puerta (pared derecha) */}
      <group position={[6.22, 0, 2.6]}>
        <RoundedBox args={[0.08, 2.5, 1.2]} radius={0.02} smoothness={2} position={[0, 1.25, 0]}>
          <Clay color="#8a5a36" />
        </RoundedBox>
        <mesh position={[-0.07, 1.2, -0.42]}>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      {/* Pizarrón con figuras de gis */}
      <group position={[0, 2.3, -4.52]}>
        <RoundedBox args={[4.9, 2.05, 0.08]} radius={0.03} smoothness={2}>
          <Clay color="#8a5a36" />
        </RoundedBox>
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[4.6, 1.78]} />
          <meshStandardMaterial color="#2f5d46" roughness={0.95} />
        </mesh>
        <mesh position={[-1.4, -0.15, 0.05]}>
          <torusGeometry args={[0.36, 0.018, 6, 48]} />
          <meshBasicMaterial color="#f1f5f9" />
        </mesh>
        {[
          [0, 0.35, 0.72, 0.036],
          [0, -0.37, 0.72, 0.036],
          [-0.35, -0.01, 0.036, 0.72],
          [0.35, -0.01, 0.036, 0.72],
        ].map(([x, y, w, h], i) => (
          <mesh key={i} position={[x!, y! - 0.15, 0.05]}>
            <planeGeometry args={[w!, h!]} />
            <meshBasicMaterial color="#f1f5f9" />
          </mesh>
        ))}
        {[0, 1, 2].map((k) => {
          const a1 = Math.PI / 2 + (k * 2 * Math.PI) / 3;
          const a2 = Math.PI / 2 + ((k + 1) * 2 * Math.PI) / 3;
          const p1 = [Math.cos(a1) * 0.44, Math.sin(a1) * 0.44];
          const p2 = [Math.cos(a2) * 0.44, Math.sin(a2) * 0.44];
          const len = Math.hypot(p2[0]! - p1[0]!, p2[1]! - p1[1]!);
          return (
            <mesh key={k} position={[1.4 + (p1[0]! + p2[0]!) / 2, -0.25 + (p1[1]! + p2[1]!) / 2, 0.05]} rotation={[0, 0, Math.atan2(p2[1]! - p1[1]!, p2[0]! - p1[0]!)]}>
              <planeGeometry args={[len, 0.036]} />
              <meshBasicMaterial color="#f1f5f9" />
            </mesh>
          );
        })}
        <TextoPlano texto="round  ·  square  ·  triangular" w={4.2} h={0.5} px={84} pos={[0, 0.58, 0.055]} color="#eef2f7" fuente="700 {px}px 'Segoe Print', 'Comic Sans MS', cursive" />
        <mesh position={[0, -1.08, 0.12]}>
          <boxGeometry args={[4.6, 0.05, 0.16]} />
          <Clay color="#8a5a36" />
        </mesh>
      </group>
      {/* Escritorio del maestro */}
      <group position={[0, 0, -3.0]}>
        <RoundedBox args={[2.5, 0.1, 1.05]} radius={0.03} smoothness={3} position={[0, 0.78, 0]} castShadow receiveShadow>
          <Clay color="#b98352" />
        </RoundedBox>
        <mesh position={[0, 0.38, 0.46]} castShadow>
          <boxGeometry args={[2.4, 0.7, 0.06]} />
          <Clay color="#8f6340" />
        </mesh>
        {[-1.15, 1.15].map((a) => (
          <mesh key={a} position={[a, 0.38, 0]} castShadow>
            <boxGeometry args={[0.08, 0.76, 0.95]} />
            <Clay color="#8f6340" />
          </mesh>
        ))}
        <mesh position={[0.75, 0.96, 0.05]} castShadow>
          <sphereGeometry args={[0.13, 20, 16]} />
          <Clay color="#dc2626" rough={0.45} />
        </mesh>
        <mesh position={[0.75, 1.1, 0.05]}>
          <cylinderGeometry args={[0.012, 0.012, 0.07, 6]} />
          <Clay color="#78350f" />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[-0.7, 0.87 + k * 0.08, 0]} rotation={[0, k * 0.2 - 0.2, 0]} castShadow>
            <boxGeometry args={[0.5, 0.075, 0.36]} />
            <Clay color={["#1d4ed8", "#b45309", "#15803d"][k]!} />
          </mesh>
        ))}
      </group>
      {/* Bancas */}
      {[-3.4, 0, 3.4].flatMap((x) => [-0.7, 1.9].map((z) => <Pupitre key={`${x}${z}`} x={x} z={z} />))}
      {/* Estantes */}
      <Estante x={-4.5} z={-4.18} />
      <Estante x={4.5} z={-4.18} />
      <group position={[-4.5, 1.73, -4.15]}>
        <mesh position={[0, 0.34, 0]} castShadow>
          <sphereGeometry args={[0.3, 28, 20]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.14, 0.18, 0.06, 18]} />
          <Clay color="#374151" />
        </mesh>
      </group>
      <group position={[4.5, 1.73, -4.15]}>
        <mesh position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.17, 0.13, 0.3, 18]} />
          <Clay color="#c2410c" />
        </mesh>
        {[-0.12, 0, 0.12].map((a, k) => (
          <mesh key={a} position={[a, 0.46 + (k % 2) * 0.08, 0]} castShadow>
            <sphereGeometry args={[0.15, 14, 10]} />
            <Clay color="#15803d" />
          </mesh>
        ))}
      </group>
      {[-5.1, -4.85, -4.6].map((x, k) => (
        <mesh key={x} position={[x, 0.3, -4.15]} rotation={[0, 0, k === 2 ? -0.25 : 0]} castShadow>
          <boxGeometry args={[0.16, 0.46, 0.34]} />
          <Clay color={["#475569", "#64748b", "#334155"][k]!} />
        </mesh>
      ))}

      {aula.map((o, i) => {
        const s = posAula(o);
        return (
          <ObjetoClicable
            key={o.id}
            o={o}
            pos={s.p}
            pared={s.pared}
            estado={hallados.includes(o.id) ? "hallado" : "normal"}
            sacude={fallo && fallo.id === o.id ? fallo.n : 0}
            numero={numeros ? i + 1 : null}
            onPick={onPick}
          />
        );
      })}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. LOST AND FOUND
 * ════════════════════════════════════════════════════════════════════════ */

const CUBO_W = 1.55;
const CUBO_H = 1.0;
const X0 = -3.1;
const Y0 = 0.5;
const Z_EST = -1.75;
const MOSTRADOR: Pt[] = [
  [-2.6, 1.1, 1.25],
  [-1.2, 1.1, 1.25],
  [0.2, 1.1, 1.25],
  [1.6, 1.1, 1.25],
];

function posCubo(slot: number): Pt {
  const col = slot % 4;
  const fila = Math.floor(slot / 4);
  return [X0 + CUBO_W / 2 + col * CUBO_W, Y0 + 0.05 + fila * CUBO_H, Z_EST];
}

function ObjetoPerdido({ o, estado, indiceMostrador }: { o: Objeto; estado: "normal" | "coincide" | "equivocado" | "tuyo" | "recuperado"; indiceMostrador: number }) {
  const g = useRef<THREE.Group>(null);
  const fondo = useRef<THREE.Mesh>(null);
  const base = posCubo(o.slot);
  const destino = estado === "recuperado" ? MOSTRADOR[Math.max(0, indiceMostrador)] ?? base : base;
  const t = useRef(0);
  useFrame(({ clock }, dt) => {
    t.current += dt;
    const grp = g.current;
    if (grp) {
      const k = suave(dt, 0.06);
      grp.position.x += (destino[0] - grp.position.x) * k;
      grp.position.z += (destino[2] - grp.position.z) * k;
      const dist = Math.hypot(destino[0] - grp.position.x, destino[2] - grp.position.z);
      const arco = estado === "recuperado" ? Math.min(0.9, dist * 0.35) : 0;
      grp.position.y += (destino[1] + arco - grp.position.y) * k;
      grp.rotation.y = estado === "coincide" || estado === "equivocado" ? Math.sin(clock.elapsedTime * 3) * 0.25 : grp.rotation.y * (1 - k);
    }
    if (fondo.current) {
      const m = fondo.current.material as THREE.MeshStandardMaterial;
      const col = estado === "coincide" ? "#fbbf24" : estado === "equivocado" ? WARN : estado === "tuyo" ? "#f472b6" : "#000000";
      const activo = estado !== "normal" && estado !== "recuperado";
      m.color.set(activo ? col : "#9aa9bd");
      m.emissive.set(col);
      m.emissiveIntensity = activo ? 0.35 + 0.2 * Math.sin(clock.elapsedTime * 4) : 0;
    }
  });
  return (
    <>
      <mesh ref={fondo} position={[base[0], base[1] + CUBO_H / 2 - 0.05, Z_EST - 0.42]}>
        <planeGeometry args={[CUBO_W - 0.1, CUBO_H - 0.1]} />
        <meshStandardMaterial color="#9aa9bd" roughness={0.9} />
      </mesh>
      <group ref={g} position={base}>
        <group scale={1.3}>
          <ModeloObjeto o={o} />
        </group>
      </group>
    </>
  );
}

function Persona({ pos, color, piel = "#e7b58f", pelo = "#2b1d14" }: { pos: Pt; color: string; piel?: string; pelo?: string }) {
  const cabeza = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (cabeza.current) cabeza.current.rotation.z = Math.sin(clock.elapsedTime * 1.3) * 0.05;
  });
  return (
    <group position={pos}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.27, 0.72, 8, 16]} />
        <Clay color={color} />
      </mesh>
      <group ref={cabeza} position={[0, 1.5, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.24, 24, 18]} />
          <Clay color={piel} />
        </mesh>
        <mesh position={[0, 0.08, -0.03]} scale={[1.05, 0.8, 1.05]}>
          <sphereGeometry args={[0.245, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Clay color={pelo} />
        </mesh>
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} position={[x, 0.01, 0.22]}>
            <sphereGeometry args={[0.028, 10, 8]} />
            <meshBasicMaterial color="#111827" />
          </mesh>
        ))}
        <mesh position={[0, -0.09, 0.215]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.06, 0.012, 6, 16, Math.PI]} />
          <meshBasicMaterial color="#7f1d1d" />
        </mesh>
      </group>
    </group>
  );
}

function ObjetosPerdidos({ estante, tuyoId, coinciden, equivocadoId, recuperados, burbuja, modoColor }: { estante: Objeto[]; tuyoId: string | null; coinciden: string[]; equivocadoId: string | null; recuperados: string[]; burbuja: string; modoColor: string }) {
  const flecha = useRef<THREE.Group>(null);
  const tuyo = estante.find((o) => o.id === tuyoId) ?? null;
  const pt = tuyo ? posCubo(tuyo.slot) : null;
  useFrame(({ clock }) => {
    if (flecha.current) flecha.current.position.y = Math.sin(clock.elapsedTime * 3.2) * 0.07;
  });
  return (
    <group>
      <mesh position={[0, -0.05, 0.5]} receiveShadow>
        <boxGeometry args={[14, 0.1, 9]} />
        <Clay color="#a7b1bf" />
      </mesh>
      {Array.from({ length: 14 }, (_, i) =>
        Array.from({ length: 9 }, (_, j) =>
          (i + j) % 2 === 0 ? (
            <mesh key={`${i}-${j}`} position={[-6.5 + i, 0.003, -3.5 + j]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial color="#c3cad5" roughness={0.9} />
            </mesh>
          ) : null,
        ),
      )}
      <mesh position={[0, 2.8, -2.35]} receiveShadow>
        <boxGeometry args={[14, 5.8, 0.2]} />
        <Clay color="#d3dbe6" />
      </mesh>
      <mesh position={[0, 0.14, -2.22]}>
        <boxGeometry args={[14, 0.28, 0.05]} />
        <Clay color="#64748b" />
      </mesh>
      {/* Estante 4 × 4 */}
      <group>
        <mesh position={[0, Y0 / 2, Z_EST]} castShadow receiveShadow>
          <boxGeometry args={[CUBO_W * 4 + 0.1, Y0, 0.9]} />
          <Clay color="#7a5234" />
        </mesh>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={`h${i}`} position={[0, Y0 + i * CUBO_H, Z_EST]} castShadow receiveShadow>
            <boxGeometry args={[CUBO_W * 4 + 0.1, 0.07, 0.9]} />
            <Clay color="#b98352" />
          </mesh>
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={`v${i}`} position={[X0 + i * CUBO_W, Y0 + (CUBO_H * 4) / 2, Z_EST]} castShadow>
            <boxGeometry args={[0.07, CUBO_H * 4 + 0.07, 0.9]} />
            <Clay color="#b98352" />
          </mesh>
        ))}
        <mesh position={[0, Y0 + (CUBO_H * 4) / 2, Z_EST - 0.44]}>
          <boxGeometry args={[CUBO_W * 4, CUBO_H * 4, 0.02]} />
          <Clay color="#8797ad" />
        </mesh>
      </group>
      {/* Letrero */}
      <group position={[0, Y0 + CUBO_H * 4 + 0.5, Z_EST + 0.1]}>
        <RoundedBox args={[3.6, 0.62, 0.1]} radius={0.05} smoothness={3} castShadow>
          <Clay color={modoColor} />
        </RoundedBox>
        <TextoPlano texto="LOST & FOUND" w={3.4} h={0.56} px={100} pos={[0, 0, 0.056]} color="#1e1b2e" />
      </group>
      {estante.map((o) => {
        const idx = recuperados.indexOf(o.id);
        const estado = idx >= 0 ? "recuperado" : equivocadoId === o.id ? "equivocado" : coinciden.includes(o.id) ? "coincide" : o.id === tuyoId ? "tuyo" : "normal";
        return <ObjetoPerdido key={o.id} o={o} estado={estado} indiceMostrador={idx} />;
      })}
      {/* Tu objeto */}
      {pt && (
        <group position={[pt[0], pt[1] + CUBO_H - 0.2, Z_EST + 0.5]}>
          <group ref={flecha}>
            <mesh rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.1, 0.22, 16]} />
              <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.9} toneMapped={false} />
            </mesh>
          </group>
          <Html position={[0.46, 0.02, 0]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div data-co-tuyo={tuyo ? nucleo(rasgosDe(tuyo)) : ""} style={{ padding: "3px 8px", borderRadius: 7, background: "#f472b6", color: "#1e1b2e", fontSize: 11, fontWeight: 900, whiteSpace: "nowrap" }}>Tu objeto</div>
          </Html>
        </group>
      )}
      {/* Mostrador */}
      <group position={[-0.8, 0, 1.25]}>
        <RoundedBox args={[8.2, 1.0, 0.8]} radius={0.04} smoothness={3} position={[0, 0.5, 0]} castShadow receiveShadow>
          <Clay color="#8f6340" />
        </RoundedBox>
        <RoundedBox args={[8.4, 0.08, 0.95]} radius={0.03} smoothness={3} position={[0, 1.04, 0]} castShadow receiveShadow>
          <Clay color="#e7d3b1" />
        </RoundedBox>
      </group>
      <group position={[-4.25, 0.3, 0.35]} scale={1.25}>
        <Persona pos={[0, 0, 0]} color="#0f766e" />
      </group>
      <Html position={[-4.25, 3.05, 0.35]} distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none", transform: "translate(-30%, -100%)" }}>
        <div
          style={{
            width: 190,
            padding: "8px 11px",
            borderRadius: 13,
            background: "#ffffff",
            color: "#0f172a",
            fontSize: 12.5,
            fontWeight: 800,
            lineHeight: 1.35,
            boxShadow: "0 8px 20px -8px #000",
          }}
        >
          {burbuja}
        </div>
      </Html>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. ARRANGE THE ROOM — la recámara
 * ════════════════════════════════════════════════════════════════════════ */

const SPOT_POS: Record<SpotId, { p: Pt; k: number }> = {
  bedOn: { p: [-3.0, 0.72, -1.6], k: 1 },
  bedUnder: { p: [-2.15, 0, -1.45], k: 0.6 },
  deskOn: { p: [2.1, 0.84, -2.95], k: 0.9 },
  deskUnder: { p: [2.1, 0, -2.8], k: 0.8 },
  boxIn: { p: [2.85, 0.14, 2.05], k: 0.72 },
  shelfOn: { p: [3.62, 1.33, -0.6], k: 0.8 },
  shelfFront: { p: [2.7, 0, -0.6], k: 0.95 },
  between: { p: [-0.45, 0, -2.75], k: 0.95 },
  doorNext: { p: [-3.35, 0, 0.5], k: 0.95 },
  rug: { p: [0.2, 0.03, 0.9], k: 1 },
};
const RUG_OFF: Record<MovibleId, [number, number]> = {
  ballSmall: [-0.95, 0.45],
  ballBig: [-0.25, 1.05],
  lamp: [0.75, 0.25],
  books: [0.95, 1.0],
  shoes: [-0.7, -0.35],
  backpack: [0.05, -0.45],
};

function destinoDe(m: MovibleId, s: SpotId): { p: Pt; k: number } {
  const d = SPOT_POS[s];
  if (s !== "rug") return d;
  const o = RUG_OFF[m];
  return { p: [d.p[0] + o[0], d.p[1], d.p[2] + o[1]], k: 1 };
}

function ModeloMovible({ m }: { m: MovibleId }) {
  const d = MOVIBLE_DEF[m];
  const c = hex(d.color);
  if (m === "ballSmall" || m === "ballBig") return <Pelota tamano={d.tamano!} color={d.color} />;
  if (m === "backpack") return <Mochila tamano="big" color={d.color} />;
  if (m === "lamp")
    return (
      <group>
        <mesh position={[0, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.17, 0.06, 24]} />
          <Clay color={c} />
        </mesh>
        <mesh position={[0, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.46, 10]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.56, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.22, 0.24, 28, 1, true]} />
          <meshStandardMaterial color={c} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.06, 14, 10]} />
          <meshStandardMaterial color="#fef3c7" emissive="#fde68a" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      </group>
    );
  if (m === "books")
    return (
      <group>
        {[0, 1].map((k) => (
          <group key={k} position={[0, 0.045 + k * 0.1, 0]} rotation={[0, k * 0.25, 0]}>
            <mesh position={[0.012, 0, 0]}>
              <boxGeometry args={[0.33, 0.07, 0.24]} />
              <meshStandardMaterial color="#fbfaf5" roughness={0.9} />
            </mesh>
            <RoundedBox args={[0.36, 0.09, 0.27]} radius={0.015} smoothness={2} position={[-0.012, 0, 0]} castShadow>
              <meshStandardMaterial color={c} roughness={0.7} />
            </RoundedBox>
          </group>
        ))}
      </group>
    );
  return (
    <group>
      {[-0.1, 0.1].map((x, k) => (
        <group key={x} position={[x, 0, 0]} rotation={[0, k === 0 ? 0.12 : -0.08, 0]}>
          <RoundedBox args={[0.14, 0.045, 0.32]} radius={0.02} smoothness={2} position={[0, 0.022, 0]} castShadow>
            <Clay color="#f1f5f9" />
          </RoundedBox>
          <RoundedBox args={[0.13, 0.12, 0.23]} radius={0.05} smoothness={3} position={[0, 0.1, -0.035]} castShadow>
            <Clay color={c} rough={0.55} />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}

function Movible({ m, spotActual, seleccionado, intento, onPick }: { m: MovibleId; spotActual: SpotId; seleccionado: boolean; intento: { obj: MovibleId; spot: SpotId; n: number } | null; onPick: (m: MovibleId) => void }) {
  const g = useRef<THREE.Group>(null);
  const aro = useRef<THREE.Mesh>(null);
  // Solo la posición inicial va como prop: después la anima useFrame (si fuera prop, R3F la saltaría).
  const [inicio] = useState(() => destinoDe(m, spotActual));
  const ultimo = useRef(intento?.n ?? 0);
  const tVuelo = useRef(99);
  const [hover, setHover] = useState(false);
  useFrame(({ clock }, dt) => {
    if (intento && intento.obj === m && intento.n !== ultimo.current) {
      ultimo.current = intento.n;
      tVuelo.current = 0;
    }
    tVuelo.current += dt;
    const volando = intento !== null && intento.obj === m && tVuelo.current < 1.1;
    const d = volando ? destinoDe(m, intento.spot) : destinoDe(m, spotActual);
    const grp = g.current;
    if (!grp) return;
    const k = suave(dt, 0.1);
    grp.position.x += (d.p[0] - grp.position.x) * k;
    grp.position.z += (d.p[2] - grp.position.z) * k;
    const dist = Math.hypot(d.p[0] - grp.position.x, d.p[2] - grp.position.z);
    const alto = d.p[1] + Math.min(1.0, dist * 0.45) + (seleccionado ? 0.28 + Math.sin(clock.elapsedTime * 4) * 0.04 : 0);
    grp.position.y += (alto - grp.position.y) * k;
    const s = grp.scale.x + (d.k - grp.scale.x) * k;
    grp.scale.setScalar(s);
    grp.rotation.z = volando && tVuelo.current > 0.75 ? Math.sin(tVuelo.current * 40) * 0.12 : 0;
    if (aro.current) {
      aro.current.visible = seleccionado || hover;
      aro.current.rotation.z = clock.elapsedTime;
    }
  });
  return (
    <group
      ref={g}
      position={inicio.p}
      scale={inicio.k}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onPick(m);
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHover(true);
        cursor(true);
      }}
      onPointerOut={() => {
        setHover(false);
        cursor(false);
      }}
    >
      <mesh ref={aro} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} visible={false}>
        <ringGeometry args={[0.36, 0.44, 32, 1, 0, Math.PI * 1.6]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.9} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
      </mesh>
      <ModeloMovible m={m} />
    </group>
  );
}

function Marcador({ s, numero, activo, onPick }: { s: SpotId; numero: number; activo: boolean; onPick: (s: SpotId) => void }) {
  const aro = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const { p } = SPOT_POS[s];
  useFrame(({ clock }) => {
    if (!aro.current) return;
    const m = aro.current.material as THREE.MeshBasicMaterial;
    m.opacity = activo ? 0.55 + 0.35 * Math.sin(clock.elapsedTime * 5) : hover ? 0.7 : 0.35;
    aro.current.scale.setScalar(activo ? 1 + 0.08 * Math.sin(clock.elapsedTime * 5) : 1);
  });
  return (
    <group position={[p[0], p[1] + 0.015, p[2]]}>
      <mesh ref={aro} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.38, 36]} />
        <meshBasicMaterial color={activo ? "#fbbf24" : "#ffffff"} transparent opacity={0.35} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh
        position={[0, 0.3, 0]}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onPick(s);
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHover(true);
          cursor(true);
        }}
        onPointerOut={() => {
          setHover(false);
          cursor(false);
        }}
      >
        <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html position={[0.36, 0.1, 0.36]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          data-co-spot={numero}
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 900,
            background: activo ? "#fbbf24" : "rgba(4,10,22,0.85)",
            color: activo ? "#1e1b2e" : "#fff",
            border: "1.5px solid #fbbf24",
          }}
        >
          {numero}
        </div>
      </Html>
    </group>
  );
}

function Recamara({ ubic, seleccion, intento, marcaFrase, onPickMovible, onPickSpot }: Pick<CasaSceneProps, "ubic" | "seleccion" | "intento" | "marcaFrase" | "onPickMovible" | "onPickSpot">) {
  return (
    <group>
      <mesh position={[0, -0.05, -0.2]} receiveShadow>
        <boxGeometry args={[8.4, 0.1, 6.8]} />
        <Clay color="#d8b98f" />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[-4.2 + i * 0.84, 0.002, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.02, 6.8]} />
          <meshBasicMaterial color="#bf9e73" />
        </mesh>
      ))}
      <mesh position={[0, 1.7, -3.65]} receiveShadow>
        <boxGeometry args={[8.4, 3.4, 0.2]} />
        <Clay color="#f2d7c9" />
      </mesh>
      <mesh position={[-4.25, 1.7, -0.2]} receiveShadow>
        <boxGeometry args={[0.2, 3.4, 6.8]} />
        <Clay color="#e9cbbd" />
      </mesh>
      <mesh position={[4.25, 1.7, -0.2]} receiveShadow>
        <boxGeometry args={[0.2, 3.4, 6.8]} />
        <Clay color="#e9cbbd" />
      </mesh>
      {/* Ventana */}
      <group position={[-0.45, 2.1, -3.53]}>
        <mesh>
          <boxGeometry args={[1.7, 1.25, 0.06]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[1.55, 1.1]} />
          <meshStandardMaterial color="#a5d8f5" emissive="#86c8f0" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[0.05, 1.1, 0.02]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>
      {/* Tapete */}
      <mesh position={[0.2, 0.012, 0.9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.75, 48]} />
        <Clay color="#7dd3c0" />
      </mesh>
      <mesh position={[0.2, 0.016, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.45, 1.55, 48]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      {/* Cama */}
      <group position={[-3.0, 0, -2.15]}>
        <RoundedBox args={[1.8, 0.14, 2.7]} radius={0.04} smoothness={3} position={[0, 0.42, 0]} castShadow receiveShadow>
          <Clay color="#9b6b43" />
        </RoundedBox>
        <RoundedBox args={[1.7, 0.2, 2.55]} radius={0.08} smoothness={3} position={[0, 0.6, 0.02]} castShadow receiveShadow>
          <Clay color="#f8fafc" />
        </RoundedBox>
        <RoundedBox args={[1.72, 0.05, 1.7]} radius={0.02} smoothness={2} position={[0, 0.715, 0.45]} castShadow>
          <Clay color="#6d8fd6" />
        </RoundedBox>
        <RoundedBox args={[0.9, 0.16, 0.45]} radius={0.07} smoothness={3} position={[0, 0.78, -0.95]} castShadow>
          <Clay color="#fde2e4" />
        </RoundedBox>
        <RoundedBox args={[1.8, 1.1, 0.12]} radius={0.05} smoothness={3} position={[0, 0.7, -1.38]} castShadow>
          <Clay color="#9b6b43" />
        </RoundedBox>
        {[
          [-0.82, 1.25],
          [0.82, 1.25],
          [0.82, -1.25],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x!, 0.18, z!]} castShadow>
            <boxGeometry args={[0.1, 0.36, 0.1]} />
            <Clay color="#7a5234" />
          </mesh>
        ))}
      </group>
      {/* Escritorio */}
      <group position={[2.1, 0, -2.95]}>
        <RoundedBox args={[1.9, 0.08, 0.9]} radius={0.03} smoothness={3} position={[0, 0.8, 0]} castShadow receiveShadow>
          <Clay color="#f1f5f9" />
        </RoundedBox>
        {[
          [-0.88, -0.38],
          [0.88, -0.38],
          [-0.88, 0.38],
          [0.88, 0.38],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x!, 0.4, z!]} castShadow>
            <boxGeometry args={[0.06, 0.8, 0.06]} />
            <Clay color="#94a3b8" />
          </mesh>
        ))}
      </group>
      {/* Estante */}
      <group position={[3.72, 0, -0.6]} rotation={[0, -Math.PI / 2, 0]}>
        <Estante x={0} z={0} w={1.5} alto={1.28} prof={0.6} madera="#c28f5c" abierto />
        {(
          [
            ["#2563eb", -0.5],
            ["#16a34a", -0.36],
            ["#dc2626", -0.22],
          ] as const
        ).map(([c, x]) => (
          <mesh key={c} position={[x, 0.3, 0]} castShadow>
            <boxGeometry args={[0.12, 0.46, 0.4]} />
            <Clay color={c} />
          </mesh>
        ))}
        <mesh position={[0.35, 0.8, 0]} castShadow>
          <boxGeometry args={[0.5, 0.3, 0.4]} />
          <Clay color="#f4a261" />
        </mesh>
      </group>
      {/* Caja de juguetes (abierta) */}
      <group position={[2.85, 0, 2.05]}>
        <mesh position={[0, 0.03, 0]} receiveShadow>
          <boxGeometry args={[1.0, 0.06, 0.78]} />
          <Clay color="#e76f51" />
        </mesh>
        {[
          [0, 0.39, 1.0, 0.06],
          [0, -0.39, 1.0, 0.06],
        ].map(([x, z, w, d], i) => (
          <mesh key={`a${i}`} position={[x!, 0.26, z!]} castShadow receiveShadow>
            <boxGeometry args={[w!, 0.52, d!]} />
            <Clay color="#e76f51" />
          </mesh>
        ))}
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.26, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.06, 0.52, 0.78]} />
            <Clay color="#e76f51" />
          </mesh>
        ))}
        <mesh position={[0, 0.3, 0.425]}>
          <boxGeometry args={[0.5, 0.14, 0.02]} />
          <Clay color="#fef3c7" />
        </mesh>
      </group>
      {/* Puerta (pared izquierda) */}
      <group position={[-4.13, 0, 1.75]}>
        <RoundedBox args={[0.08, 2.3, 1.1]} radius={0.02} smoothness={2} position={[0, 1.15, 0]}>
          <Clay color="#8a5a36" />
        </RoundedBox>
        <mesh position={[0.07, 1.1, -0.4]}>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {SPOTS_MARCADOS.map((s, i) => (
        <Marcador key={s} s={s} numero={i + 1} activo={seleccion !== null && !Object.values(ubic).includes(s)} onPick={onPickSpot} />
      ))}
      {MOVIBLES.map((m) => (
        <Movible key={m} m={m} spotActual={ubic[m]} seleccionado={seleccion === m} intento={intento} onPick={onPickMovible} />
      ))}
      {marcaFrase && (
        <Etiqueta pos={[SPOT_POS[marcaFrase.spot].p[0], SPOT_POS[marcaFrase.spot].p[1] + (SPOT_POS[marcaFrase.spot].p[1] > 0.2 ? 1.0 : 0.72), SPOT_POS[marcaFrase.spot].p[2]]} df={10} col={marcaFrase.ok ? OK : WARN} fs={12}>
          <span style={{ color: marcaFrase.ok ? OK : WARN }}>{marcaFrase.ok ? "✓" : "✗"}</span>
          {marcaFrase.texto}
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function CasaObjetosInglesScene(p: CasaSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt; min: number; max: number } => {
    if (vista === "buscar") return { pos: [0, 5.0, 9.9], target: [0, 1.45, -1.2], min: 4, max: 17 };
    if (vista === "perdidos") return { pos: [-0.6, 3.3, 11.2], target: [-0.6, 2.35, -0.8], min: 4, max: 17 };
    return { pos: [0.5, 6.2, 9.4], target: [0, 0.55, -0.7], min: 4, max: 16 };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 45 }} gl={{ antialias: true }} onPointerMissed={() => cursor(false)}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 22, 44]} />
      <ambientLight intensity={0.62} />
      <hemisphereLight args={["#fff7ed", "#334155", 0.45]} />
      <directionalLight position={[5, 10, 7]} intensity={1.25} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-bias={-0.0004} />
      <pointLight position={[-4, 3.5, 4]} intensity={0.35} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.4} position={[0, 6, -6]} scale={[12, 6, 1]} color="#fff7ed" />
        <Lightformer form="rect" intensity={0.6} position={[-7, 2, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "buscar" && <Aula aula={p.aula} hallados={p.halladosAula} fallo={p.falloAula} numeros={p.numerosAula} onPick={p.onPickAula} />}
      {vista === "perdidos" && <ObjetosPerdidos estante={p.estante} tuyoId={p.tuyoId} coinciden={p.coinciden} equivocadoId={p.equivocadoId} recuperados={p.recuperados} burbuja={p.burbuja} modoColor={modoColor} />}
      {vista === "acomodar" && <Recamara ubic={p.ubic} seleccion={p.seleccion} intento={p.intento} marcaFrase={p.marcaFrase} onPickMovible={p.onPickMovible} onPickSpot={p.onPickSpot} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={cam.min} maxDistance={cam.max} maxPolarAngle={Math.PI * 0.47} minPolarAngle={Math.PI * 0.08} maxAzimuthAngle={Math.PI * 0.35} minAzimuthAngle={-Math.PI * 0.35} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.22} luminanceThreshold={0.92} luminanceSmoothing={0.6} mipmapBlur />
        <Vignette eskil={false} offset={0.22} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
