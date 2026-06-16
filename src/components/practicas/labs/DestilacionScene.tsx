"use client";

/**
 * Escena 3D del laboratorio de Destilación (React Three Fiber).
 * Se carga de forma diferida (ssr:false) desde LabSeparacionMezclas.tsx.
 *
 * El alumno arma el equipo pieza por pieza desde el shell; aquí cada pieza
 * APARECE y se ensambla en 3D cuando entra en `piezas`. Al operar:
 *   • el líquido del matraz baja conforme se destila (nivel = volumen),
 *   • el mechero enciende con llama que parpadea según su intensidad,
 *   • el mercurio del termómetro sube con la temperatura,
 *   • al hervir, burbujas en el matraz + vapor que VIAJA por el refrigerante
 *     y GOTEA en el colector, donde se acumula el destilado,
 *   • si se sobrecalienta o se derrama → EXPLOSIÓN.
 *
 * Todo se controla por props (estado en el shell). Las animaciones suaves
 * (parpadeo, vapor, mercurio, aparición de piezas) viven en useFrame.
 */

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { PiezaKey, Fase, Accidente, Llama } from "./destilacion-data";
import { CAP } from "./destilacion-data";

export interface DestilacionSceneProps {
  piezas: Record<PiezaKey, boolean>;
  colorLiq: string;
  colorDest: string;
  residuoSolido: boolean;
  tieneResiduo: boolean; // hay mezcla cargada (para mostrar residuo al final)
  volumen: number; // mL actuales en el matraz
  destilado: number; // mL en el colector
  temp: number; // °C
  llama: Llama;
  hirviendo: boolean;
  fase: Fase;
  accidente: Accidente;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
  mostrarVacia?: boolean; // mostrar el aviso "mesa vacía" (se oculta tras la compuerta EPP)
  etiquetas?: boolean; // mostrar etiquetas flotantes con el nombre de cada pieza
}

/* ── Geometría del montaje (coordenadas del mundo) ─────────────────────── */
const TABLE_Y = -2.0;
const GLASS = "#BcD3E6";

const FLASK = { x: -1.4, y: -0.65, r: 1.05 }; // matraz balón
const FLASK_BOTTOM = FLASK.y - FLASK.r;
const NECK_TOP = 1.55;
const STAND_X = -3.15;

// puntos del recorrido del vapor: cuello → brazo lateral → refrigerante → boca del colector
const NECK_OUT = new THREE.Vector3(FLASK.x, 1.2, 0);
const COND_A = new THREE.Vector3(-0.55, 0.95, 0);
const COND_B = new THREE.Vector3(1.9, -0.5, 0);
const COLLECTOR = { x: 2.25, top: -0.55 };

const damp = THREE.MathUtils.damp;

/* ── Cilindro orientado entre dos puntos (tubos, brazos, refrigerante) ──── */
function Tubo({
  a,
  b,
  r,
  color = GLASS,
  opacity = 1,
  metalness = 0,
  roughness = 0.3,
  rough,
}: {
  a: THREE.Vector3;
  b: THREE.Vector3;
  r: number;
  color?: string;
  opacity?: number;
  metalness?: number;
  roughness?: number;
  rough?: boolean;
}) {
  const { pos, quat, len } = useMemo(() => {
    const dir = b.clone().sub(a);
    const length = dir.length();
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { pos: mid, quat: q, len: length };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[r, r, len, 24, 1, false]} />
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        roughness={rough ? 0.5 : roughness}
        metalness={metalness}
        side={opacity < 1 ? THREE.DoubleSide : THREE.FrontSide}
        depthWrite={opacity >= 0.6}
      />
    </mesh>
  );
}

/* ── Aparición / desaparición suave de una pieza ───────────────────────── */
function Aparece({ show, children }: { show: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const s = damp(g.scale.x, show ? 1 : 0.0001, 9, dt);
    g.scale.setScalar(s);
    g.visible = s > 0.02;
  });
  return (
    <group ref={ref} scale={0.0001}>
      {children}
    </group>
  );
}

/* ── Vidrio reutilizable ───────────────────────────────────────────────── */
function vidrio(opacity = 0.18) {
  return (
    <meshPhysicalMaterial
      color={GLASS}
      transparent
      opacity={opacity}
      roughness={0.06}
      metalness={0}
      transmission={0.6}
      thickness={0.4}
      ior={1.4}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

/* ── Soporte universal ─────────────────────────────────────────────────── */
function Soporte({ conMatraz, conRefri }: { conMatraz: boolean; conRefri: boolean }) {
  return (
    <group>
      {/* base */}
      <mesh position={[STAND_X + 0.5, TABLE_Y + 0.06, 0]} castShadow>
        <boxGeometry args={[1.7, 0.12, 1.0]} />
        <meshStandardMaterial color="#2b3646" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* varilla */}
      <mesh position={[STAND_X, TABLE_Y + 2.1, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 4.2, 18]} />
        <meshStandardMaterial color="#8a97a8" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* pinza al matraz */}
      {conMatraz && (
        <Tubo a={new THREE.Vector3(STAND_X, FLASK.y + 0.5, 0)} b={new THREE.Vector3(FLASK.x - 0.1, FLASK.y + 0.55, 0)} r={0.05} color="#8a97a8" metalness={0.7} roughness={0.35} />
      )}
      {/* pinza al refrigerante */}
      {conRefri && <Tubo a={new THREE.Vector3(STAND_X, COND_A.y - 0.1, 0)} b={COND_A.clone()} r={0.05} color="#8a97a8" metalness={0.7} roughness={0.35} />}
    </group>
  );
}

/* ── Mechero Bunsen + llama ─────────────────────────────────────────────── */
function Mechero({ llama }: { llama: Llama }) {
  const flameRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = flameRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.scale.y = 1 + Math.sin(t * 22) * 0.09 + Math.sin(t * 13.3) * 0.05;
    g.scale.x = 1 + Math.sin(t * 17) * 0.04;
  });
  const on = llama !== "off";
  const h = llama === "alta" ? 1.5 : llama === "media" ? 1.0 : 0.6;
  const outer = llama === "alta" ? "#FF7A2C" : llama === "media" ? "#FF9A3C" : "#7FB6FF";
  const inner = llama === "alta" ? "#FFD27A" : llama === "media" ? "#FFE0A0" : "#BfE0FF";
  const baseY = FLASK_BOTTOM - 0.95;
  return (
    <group position={[FLASK.x, 0, 0]}>
      {/* base */}
      <mesh position={[0, TABLE_Y + 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.5, 0.14, 24]} />
        <meshStandardMaterial color="#2b3646" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* cañón */}
      <mesh position={[0, baseY + 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, (baseY - TABLE_Y) * 1.0 + 0.5, 20]} />
        <meshStandardMaterial color="#566476" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* llama */}
      {on && (
        <group ref={flameRef} position={[0, baseY + 0.35, 0]}>
          <mesh position={[0, h * 0.5, 0]}>
            <coneGeometry args={[0.26, h, 22]} />
            <meshStandardMaterial color={outer} emissive={outer} emissiveIntensity={1.7} transparent opacity={0.92} toneMapped={false} depthWrite={false} />
          </mesh>
          <mesh position={[0, h * 0.4, 0]}>
            <coneGeometry args={[0.13, h * 0.66, 18]} />
            <meshStandardMaterial color={inner} emissive={inner} emissiveIntensity={2.4} toneMapped={false} depthWrite={false} />
          </mesh>
          <pointLight position={[0, h * 0.5, 0]} intensity={llama === "alta" ? 6 : llama === "media" ? 3.5 : 1.8} distance={5} color={outer} />
        </group>
      )}
    </group>
  );
}

/* ── Líquido dentro del matraz balón (casquete esférico + tapa plana) ──── */
function Liquido({ frac, color, hirviendo }: { frac: number; color: string; hirviendo: boolean }) {
  const innerR = FLASK.r * 0.93;
  const f = Math.max(0, Math.min(1, frac));
  if (f <= 0.001) return null;
  const cos = 2 * f - 1; // -1 fondo, +1 lleno
  const thetaS = Math.acos(Math.max(-1, Math.min(1, cos)));
  const surfaceY = FLASK.y + innerR * cos;
  const diskR = innerR * Math.sin(thetaS);
  return (
    <group>
      {/* casquete (parte sumergida del balón) */}
      <mesh position={[FLASK.x, FLASK.y, 0]}>
        <sphereGeometry args={[innerR, 32, 24, 0, Math.PI * 2, thetaS, Math.PI - thetaS]} />
        <meshStandardMaterial color={color} transparent opacity={0.9} roughness={0.18} metalness={0.05} emissive={color} emissiveIntensity={0.12} />
      </mesh>
      {/* superficie */}
      <mesh position={[FLASK.x, surfaceY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[diskR, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.96} roughness={0.1} metalness={0.1} emissive={color} emissiveIntensity={0.2} side={THREE.DoubleSide} />
      </mesh>
      {hirviendo && <Burbujas color="#ffffff" cx={FLASK.x} top={surfaceY} bottom={FLASK_BOTTOM + 0.15} r={diskR * 0.8} />}
    </group>
  );
}

/* ── Burbujas de ebullición ────────────────────────────────────────────── */
function Burbujas({ color, cx, top, bottom, r }: { color: string; cx: number; top: number; bottom: number; r: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const seeds = useMemo(() => [0, 1, 2, 3, 4, 5].map((i) => ({ a: i * 1.21, rr: ((i % 3) + 1) / 3, ph: i / 6 })), []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      const s = seeds[i];
      if (!m || !s) return;
      const p = (t * 0.9 + s.ph) % 1;
      m.position.set(cx + Math.cos(s.a) * r * s.rr, bottom + p * (top - bottom), Math.sin(s.a) * r * s.rr);
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.sin(p * Math.PI) * 0.7;
    });
  });
  return (
    <>
      {seeds.map((s, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.05 + (i % 3) * 0.015, 10, 10]} />
          <meshStandardMaterial color={color} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

/* ── Matraz de destilación (balón + cuello + brazo lateral) ─────────────── */
function Matraz({ frac, color, hirviendo, residuo, residuoSolido }: { frac: number; color: string; hirviendo: boolean; residuo: boolean; residuoSolido: boolean }) {
  return (
    <group>
      {/* balón */}
      <mesh position={[FLASK.x, FLASK.y, 0]}>
        <sphereGeometry args={[FLASK.r, 40, 32]} />
        {vidrio(0.16)}
      </mesh>
      {/* cuello */}
      <mesh position={[FLASK.x, (FLASK.y + FLASK.r + NECK_TOP) / 2, 0]}>
        <cylinderGeometry args={[0.17, 0.2, NECK_TOP - (FLASK.y + FLASK.r) + 0.2, 24, 1, true]} />
        {vidrio(0.2)}
      </mesh>
      {/* brazo lateral hacia el refrigerante */}
      <Tubo a={new THREE.Vector3(FLASK.x, NECK_TOP - 0.35, 0)} b={COND_A.clone()} r={0.12} opacity={0.24} />
      {/* líquido */}
      <Liquido frac={frac} color={color} hirviendo={hirviendo} />
      {/* residuo sólido (sal) al fondo cuando se evaporó todo */}
      {residuo && residuoSolido && (
        <mesh position={[FLASK.x, FLASK_BOTTOM + 0.18, 0]}>
          <sphereGeometry args={[FLASK.r * 0.55, 24, 12, 0, Math.PI * 2, Math.PI * 0.62, Math.PI * 0.38]} />
          <meshStandardMaterial color="#eef2f6" roughness={0.9} metalness={0} />
        </mesh>
      )}
    </group>
  );
}

/* ── Termómetro con mercurio ───────────────────────────────────────────── */
function Termometro({ temp, show }: { temp: number; show: boolean }) {
  const bottomY = 0.45;
  const topY = 2.05;
  const frac = Math.max(0, Math.min(1, (temp - 15) / (160 - 15)));
  const merH = 0.12 + frac * (topY - bottomY - 0.2);
  const hot = temp >= 120;
  return (
    <group position={[FLASK.x, 0, 0]}>
      {/* tubo */}
      <mesh position={[0, (bottomY + topY) / 2, 0]}>
        <cylinderGeometry args={[0.055, 0.055, topY - bottomY, 16]} />
        {vidrio(0.28)}
      </mesh>
      {/* bulbo */}
      <mesh position={[0, bottomY, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FF5E5E" emissive="#FF5E5E" emissiveIntensity={0.3} roughness={0.3} />
      </mesh>
      {/* mercurio */}
      <mesh position={[0, bottomY + merH / 2, 0]}>
        <cylinderGeometry args={[0.032, 0.032, merH, 12]} />
        <meshStandardMaterial color={hot ? "#FF3B3B" : "#FF5E5E"} emissive={hot ? "#FF3B3B" : "#FF5E5E"} emissiveIntensity={hot ? 0.6 : 0.25} roughness={0.2} />
      </mesh>
      {show && (
        <Html position={[0.18, topY - 0.05, 0]} center={false} style={{ pointerEvents: "none" }} distanceFactor={9}>
          <div
            style={{
              whiteSpace: "nowrap",
              fontSize: 13,
              fontWeight: 900,
              color: hot ? "#FF6B6B" : "#fff",
              background: "rgba(2,12,28,0.7)",
              border: `1px solid ${hot ? "rgba(255,94,94,0.5)" : "rgba(255,255,255,0.18)"}`,
              padding: "2px 8px",
              borderRadius: 8,
              fontFamily: "system-ui, sans-serif",
              textShadow: "0 1px 2px rgba(0,0,0,0.6)",
            }}
          >
            {Math.round(temp)} °C
          </div>
        </Html>
      )}
    </group>
  );
}

/* ── Refrigerante (camisa con agua circulando + condensación interna) ───── */
const WATER = "#5FC7E8";
function Refrigerante({ activo }: { activo: boolean }) {
  const NF = 10; // partículas de agua de enfriamiento
  const ND = 7; // gotas de condensación en el tubo interno
  const flow = useRef<(THREE.Mesh | null)[]>([]);
  const drops = useRef<(THREE.Mesh | null)[]>([]);

  // base radial: vector perpendicular al eje del refrigerante (en el plano XY)
  const perp = useMemo(() => {
    const dir = COND_B.clone().sub(COND_A).normalize();
    return dir.clone().cross(new THREE.Vector3(0, 0, 1)).normalize();
  }, []);

  const fseeds = useMemo(
    () => Array.from({ length: NF }, (_, i) => ({ off: i / NF, ang: (i * 2.39) % (Math.PI * 2), rad: 0.13 + ((i * 3) % 3) * 0.035, sp: 0.16 + ((i * 5) % 4) * 0.03 })),
    [],
  );
  const dseeds = useMemo(
    () => Array.from({ length: ND }, (_, i) => ({ u: 0.1 + 0.78 * (i / Math.max(1, ND - 1)), ang: (i * 1.7) % (Math.PI * 2), rad: 0.075, ph: (i * 0.37) % 1 })),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // ── agua de enfriamiento circulando (contracorriente: de B hacia A) ──
    for (let i = 0; i < NF; i++) {
      const m = flow.current[i];
      const s = fseeds[i];
      if (!m || !s) continue;
      const u = 1 - ((t * s.sp + s.off) % 1); // 1 → 0  (entra por abajo, sale por arriba)
      const base = COND_A.clone().lerp(COND_B, u);
      const a = s.ang + t * 0.8;
      m.position.set(base.x + perp.x * Math.cos(a) * s.rad, base.y + perp.y * Math.cos(a) * s.rad, base.z + Math.sin(a) * s.rad);
    }
    // ── condensación dentro del tubo interno (gotas que cuelgan y resbalan) ──
    for (let i = 0; i < ND; i++) {
      const m = drops.current[i];
      const s = dseeds[i];
      if (!m || !s) continue;
      m.visible = activo;
      const slide = (t * 0.1 + s.ph) % 1;
      const u = Math.min(0.95, s.u + slide * 0.05);
      const base = COND_A.clone().lerp(COND_B, u);
      m.position.set(base.x + perp.x * 0.02, base.y - s.rad * 0.7, base.z + Math.cos(s.ang) * s.rad);
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.opacity = activo ? 0.45 + 0.3 * Math.sin(slide * Math.PI) : 0;
    }
  });

  return (
    <group>
      {/* camisa exterior */}
      <Tubo a={COND_A.clone()} b={COND_B.clone()} r={0.27} opacity={0.14} />
      {/* agua de enfriamiento (relleno azul translúcido) */}
      <Tubo a={COND_A.clone()} b={COND_B.clone()} r={0.23} color={WATER} opacity={0.16} />
      {/* tubo interno por donde pasa el vapor */}
      <Tubo a={COND_A.clone()} b={COND_B.clone()} r={0.1} opacity={0.34} />
      {/* puertos de agua */}
      <mesh position={[COND_A.x + 0.25, COND_A.y + 0.28, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.32, 12]} />
        <meshStandardMaterial color="#566476" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[COND_B.x - 0.25, COND_B.y - 0.28, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.32, 12]} />
        <meshStandardMaterial color="#566476" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* partículas de agua circulando */}
      {Array.from({ length: NF }, (_, i) => (
        <mesh key={`f${i}`} ref={(el) => { flow.current[i] = el; }}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={WATER} transparent opacity={0.7} emissive={WATER} emissiveIntensity={0.25} roughness={0.4} depthWrite={false} />
        </mesh>
      ))}
      {/* gotas de condensación interna */}
      {Array.from({ length: ND }, (_, i) => (
        <mesh key={`c${i}`} ref={(el) => { drops.current[i] = el; }} visible={false}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color="#EAFBFF" transparent opacity={0} roughness={0.1} metalness={0.1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Vaho/vapor saliendo del cuello del matraz al hervir ────────────────── */
function Vaho({ activo, color }: { activo: boolean; color: string }) {
  const N = 7;
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const tint = useMemo(() => new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.7), [color]);
  const seeds = useMemo(
    () => Array.from({ length: N }, (_, i) => ({ off: i / N, x: (((i * 7) % 5) - 2) * 0.045, sp: 0.22 + ((i * 3) % 4) * 0.03, amp: 0.06 + ((i * 5) % 3) * 0.02, ph: (i * 1.3) % (Math.PI * 2) })),
    [],
  );
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < N; i++) {
      const m = refs.current[i];
      const s = seeds[i];
      if (!m || !s) continue;
      m.visible = activo;
      const p = (t * s.sp + s.off) % 1;
      m.position.set(FLASK.x + s.x + Math.sin(t * 1.5 + s.ph) * s.amp, NECK_TOP - 0.2 + p * 1.5, Math.cos(t * 1.2 + s.ph) * s.amp);
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.opacity = activo ? Math.sin(p * Math.PI) * 0.16 : 0;
      m.scale.setScalar(0.4 + p * 0.9);
    }
  });
  return (
    <>
      {Array.from({ length: N }, (_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color={tint} transparent opacity={0} depthWrite={false} roughness={1} />
        </mesh>
      ))}
    </>
  );
}

/* ── Etiqueta flotante con el nombre de una pieza ───────────────────────── */
function Etiqueta({ pos, texto, accent }: { pos: [number, number, number]; texto: string; accent: string }) {
  return (
    <Html position={pos} center distanceFactor={11} style={{ pointerEvents: "none" }} zIndexRange={[40, 0]}>
      <div
        style={{
          whiteSpace: "nowrap",
          fontSize: 12,
          fontWeight: 800,
          color: "#fff",
          background: "rgba(2,12,28,0.8)",
          border: `1px solid ${accent}66`,
          padding: "3px 9px",
          borderRadius: 8,
          fontFamily: "system-ui, sans-serif",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        {texto}
      </div>
    </Html>
  );
}

/* ── Matraz colector (Erlenmeyer) + destilado ──────────────────────────── */
function Colector({ frac, color }: { frac: number; color: string }) {
  const baseY = TABLE_Y + 0.04;
  const bodyH = 1.1;
  const f = Math.max(0, Math.min(1, frac));
  return (
    <group position={[COLLECTOR.x, 0, 0]}>
      {/* cuerpo cónico */}
      <mesh position={[0, baseY + bodyH / 2, 0]}>
        <cylinderGeometry args={[0.32, 0.72, bodyH, 32, 1, true]} />
        {vidrio(0.18)}
      </mesh>
      {/* fondo */}
      <mesh position={[0, baseY, 0]}>
        <circleGeometry args={[0.72, 32]} />
        <meshStandardMaterial color={GLASS} transparent opacity={0.25} side={THREE.DoubleSide} roughness={0.1} />
      </mesh>
      {/* cuello */}
      <mesh position={[0, baseY + bodyH + 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.36, 20, 1, true]} />
        {vidrio(0.22)}
      </mesh>
      {/* destilado */}
      {f > 0.001 && (
        <mesh position={[0, baseY + (bodyH * f) / 2 + 0.01, 0]}>
          <cylinderGeometry args={[0.32 + (0.72 - 0.32) * (1 - f) * 0 + 0.4 * f, 0.7, bodyH * f, 32]} />
          <meshStandardMaterial color={color} transparent opacity={0.92} roughness={0.12} metalness={0.1} emissive={color} emissiveIntensity={0.18} />
        </mesh>
      )}
    </group>
  );
}

/* ── Vapor: niebla fina por el refrigerante + condensación + goteo ───────── */
function Vapor({ active, color, destFrac }: { active: boolean; color: string; destFrac: number }) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        NECK_OUT.clone(),
        new THREE.Vector3(FLASK.x + 0.55, NECK_TOP - 0.15, 0),
        COND_A.clone(),
        COND_A.clone().lerp(COND_B, 0.5),
        COND_B.clone(),
        new THREE.Vector3(COLLECTOR.x, COLLECTOR.top - 0.1, 0),
      ]),
    [],
  );

  // niebla = el color del destilado aclarado hacia blanco (vapor tenue)
  const mist = useMemo(() => new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.6), [color]);
  const exitY = COLLECTOR.top - 0.05;

  // partículas de niebla (muchas, pequeñas, con jitter → lee como flujo continuo)
  const N = 34;
  const wisps = useRef<(THREE.Mesh | null)[]>([]);
  const seeds = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => ({
        off: i / N,
        speed: 0.11 + ((i * 7) % 6) * 0.011,
        amp: 0.025 + ((i * 5) % 4) * 0.012,
        ph: (i * 1.7) % (Math.PI * 2),
      })),
    [],
  );

  // gotas que se condensan a la salida y caen al colector + onda al impactar
  const D = 5;
  const drips = useRef<(THREE.Mesh | null)[]>([]);
  const rings = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // ── niebla fluyendo ──
    for (let i = 0; i < N; i++) {
      const m = wisps.current[i];
      if (!m) continue;
      m.visible = active;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (!active) {
        mat.opacity = 0;
        continue;
      }
      const s = seeds[i]!;
      const p = (t * s.speed + s.off) % 1;
      const pt = curve.getPoint(p);
      const wob = Math.sin(t * 2.4 + s.ph) * s.amp;
      const wobz = Math.cos(t * 1.9 + s.ph) * s.amp * 1.7;
      m.position.set(pt.x, pt.y + wob, pt.z + wobz);
      const env = Math.sin(p * Math.PI); // 0 en extremos, 1 en el centro del recorrido
      mat.opacity = env * 0.3;
      // ancho al salir del matraz, se encoge a medida que condensa
      m.scale.setScalar((0.45 + env * 0.65) * (1 - p * 0.4));
    }

    // ── condensado goteando + onda en la superficie ──
    const surfaceY = TABLE_Y + 0.05 + 1.1 * Math.max(0, Math.min(1, destFrac));
    for (let i = 0; i < D; i++) {
      const m = drips.current[i];
      const rg = rings.current[i];
      if (!m) continue;
      if (!active) {
        m.visible = false;
        if (rg) rg.visible = false;
        continue;
      }
      const fall = (t * 0.55 + i / D) % 1;
      const y = THREE.MathUtils.lerp(exitY, surfaceY, fall);
      m.visible = y > surfaceY + 0.02;
      m.position.set(COLLECTOR.x, y, 0);
      m.scale.set(1, 1 + fall * 0.7, 1); // se estira en gota al caer
      if (rg) {
        const hit = fall > 0.88 ? (fall - 0.88) / 0.12 : -1; // onda en el último tramo
        if (hit >= 0) {
          rg.visible = true;
          rg.position.set(COLLECTOR.x, surfaceY + 0.012, 0);
          const rs = 0.1 + hit * 0.5;
          rg.scale.set(rs, rs, rs);
          (rg.material as THREE.MeshBasicMaterial).opacity = (1 - hit) * 0.45;
        } else {
          rg.visible = false;
        }
      }
    }
  });

  return (
    <>
      {Array.from({ length: N }, (_, i) => (
        <mesh key={`w${i}`} ref={(el) => { wisps.current[i] = el; }}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color={mist} transparent opacity={0} depthWrite={false} emissive={mist} emissiveIntensity={0.22} roughness={1} />
        </mesh>
      ))}
      {Array.from({ length: D }, (_, i) => (
        <mesh key={`d${i}`} ref={(el) => { drips.current[i] = el; }}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={color} transparent opacity={0.96} roughness={0.08} metalness={0.1} emissive={color} emissiveIntensity={0.25} />
        </mesh>
      ))}
      {Array.from({ length: D }, (_, i) => (
        <mesh key={`r${i}`} ref={(el) => { rings.current[i] = el; }} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <ringGeometry args={[0.42, 0.6, 28]} />
          <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

/* ── Explosión / accidente ─────────────────────────────────────────────── */
function Explosion({ accidente }: { accidente: Accidente }) {
  const ref = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const start = useRef(0);
  useFrame((state) => {
    const g = ref.current;
    if (!g || !matRef.current) return;
    if (start.current === 0) start.current = state.clock.elapsedTime;
    const e = state.clock.elapsedTime - start.current;
    const s = 0.4 + Math.min(e * 5, 3.2);
    g.scale.setScalar(s);
    matRef.current.opacity = Math.max(0, 0.85 - e * 0.5);
  });
  if (!accidente) return null;
  return (
    <group ref={ref} position={[FLASK.x, FLASK.y, 0]}>
      <mesh>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial ref={matRef} color={accidente === "rotura" ? "#FFB347" : "#FF6B6B"} transparent opacity={0.85} toneMapped={false} depthWrite={false} />
      </mesh>
      <Html center position={[0, 0.2, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: 46, filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.6))" }}>💥</div>
      </Html>
    </group>
  );
}

/* ── Mesa de laboratorio ───────────────────────────────────────────────── */
function Mesa() {
  return (
    <mesh position={[0, TABLE_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 24]} />
      <meshStandardMaterial color="#0a1a2e" roughness={0.85} metalness={0.1} />
    </mesh>
  );
}

/* ── Escena ────────────────────────────────────────────────────────────── */
export default function DestilacionScene(props: DestilacionSceneProps) {
  const frac = props.volumen / CAP;
  const destFrac = props.destilado / CAP;
  const algoArmado = props.piezas.soporte || props.piezas.matraz;

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0.4, 12], fov: 40 }}>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 16, 42]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 9, 5]} intensity={1.9} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-near={1} shadow-camera-far={30} shadow-bias={-0.0004} />
      <pointLight position={[-6, 4, 4]} intensity={12} color={props.accent} />
      <pointLight position={[6, 1, 5]} intensity={7} color="#ffffff" />

      <group key={props.resetNonce}>
        <Mesa />

        <Aparece show={props.piezas.soporte}>
          <Soporte conMatraz={props.piezas.matraz} conRefri={props.piezas.refrigerante} />
        </Aparece>

        <Aparece show={props.piezas.mechero}>
          <Mechero llama={props.llama} />
        </Aparece>

        <Aparece show={props.piezas.matraz}>
          <Matraz
            frac={frac}
            color={props.colorLiq}
            hirviendo={props.hirviendo}
            residuo={props.tieneResiduo && props.fase === "listo"}
            residuoSolido={props.residuoSolido}
          />
        </Aparece>

        <Aparece show={props.piezas.termometro && props.piezas.matraz}>
          {/* La etiqueta flotante °C se oculta en "listo"/"accidente": ahí aparece
              la tarjeta de cálculos y el <Html> de drei se encimaría sobre ella. */}
          <Termometro temp={props.temp} show={props.piezas.termometro && props.piezas.matraz && (props.fase === "operar" || props.fase === "cargar")} />
        </Aparece>

        <Aparece show={props.piezas.refrigerante}>
          <Refrigerante activo={props.hirviendo} />
        </Aparece>

        <Aparece show={props.piezas.colector}>
          <Colector frac={destFrac} color={props.colorDest} />
        </Aparece>

        {props.piezas.matraz && <Vaho activo={props.hirviendo} color={props.colorLiq} />}

        {props.piezas.matraz && props.piezas.refrigerante && <Vapor active={props.hirviendo} color={props.colorDest} destFrac={destFrac} />}

        {props.fase === "accidente" && <Explosion key={`ex-${props.resetNonce}`} accidente={props.accidente} />}

        {props.etiquetas && (
          <group>
            {props.piezas.soporte && <Etiqueta pos={[STAND_X, 2.2, 0]} texto="Soporte universal" accent={props.accent} />}
            {props.piezas.mechero && <Etiqueta pos={[FLASK.x, TABLE_Y + 0.9, 0]} texto="Mechero Bunsen" accent={props.accent} />}
            {props.piezas.matraz && <Etiqueta pos={[FLASK.x - 1.1, FLASK.y, 0]} texto="Matraz de destilación" accent={props.accent} />}
            {props.piezas.refrigerante && <Etiqueta pos={[0.7, 0.95, 0]} texto="Refrigerante" accent={props.accent} />}
            {props.piezas.colector && <Etiqueta pos={[COLLECTOR.x + 0.7, COLLECTOR.top - 0.4, 0]} texto="Matraz colector" accent={props.accent} />}
          </group>
        )}

        <ContactShadows position={[0, TABLE_Y + 0.02, 0]} opacity={0.4} scale={22} blur={2.6} far={6} color="#1a2840" />
      </group>

      {!algoArmado && props.mostrarVacia !== false && (
        <Html center position={[0, 0.2, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              textAlign: "center",
              fontFamily: "system-ui, sans-serif",
              color: "rgba(255,255,255,0.62)",
              width: 320,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800 }}>Tu mesa de laboratorio está vacía</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Usa la barra de abajo para armar el equipo de destilación</div>
          </div>
        </Html>
      )}

      <Environment resolution={256}>
        <Lightformer intensity={1.9} position={[0, 5, 2]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.3} position={[-6, 2, -2]} scale={[6, 6, 1]} color={props.accent} />
        <Lightformer intensity={1.0} position={[6, 1, 3]} scale={[5, 5, 1]} color="#bfe8ff" />
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minDistance={8.5}
        maxDistance={15}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.92}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        target={[-0.3, -0.1, 0]}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.4}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.65} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.3} darkness={0.45} />
      </EffectComposer>
    </Canvas>
  );
}
