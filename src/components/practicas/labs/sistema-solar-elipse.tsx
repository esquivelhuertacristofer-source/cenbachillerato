"use client";
// =============================================================================
// Sistema Solar — LA ÓRBITA DE KEPLER (modos «Áreas» y «Rapidez»)
// =============================================================================
// Una sola órbita, grande, con el Sol en un FOCO. El cuerpo se mueve resolviendo
// la ecuación de Kepler cuadro por cuadro (M = E − e·sen E): nada de rapidez
// «a ojo».
//
// · ÁREAS (2.ª ley). El periodo se divide en N tiempos iguales; mientras el
//   planeta avanza, va pintando el abanico que barre la línea Sol–planeta en
//   cada uno. Junto al Sol el sector sale largo y flaco; lejos, corto y ancho.
//   Sus áreas (medidas con la fórmula del cordón en sistema-solar-datos.ts)
//   son iguales.
// · RAPIDEZ (vis-viva). Flecha de velocidad proporcional a v = √(GM(2/r−1/a)),
//   la órbita coloreada por rapidez (azul lento → naranja rápido) y dos
//   flechas fijas, en el perihelio y en el afelio, para compararlas.
//
// LA ESCALA. La órbita se dibuja siempre del mismo tamaño en pantalla (el
// semieje mayor real va en el panel); su FORMA (la excentricidad) sí es la real.
// =============================================================================

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Line, OrbitControls, Stars } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ViaLactea, texturaResplandor } from "./_espacio";
import { FlechaY, Rotulo, SolFoto, azarCon, texturaPunto, useTexturaSS } from "./sistema-solar-comun";
import { areasSectores, miles, puntoKepler, visViva } from "./sistema-solar-datos";

export interface OrbitaEscena {
  id: string;
  a: number; // UA
  e: number;
  textura: string | null; // null = cometa
  color: string;
}

export interface EstadoElipse {
  M: number;
  rUA: number;
  v: number;
  /** Sectores ya pintados (0..N). */
  pintados: number;
}

export interface ElipseProps {
  modo: "areas" | "rapidez";
  orbita: OrbitaEscena;
  divisiones: number;
  playing: boolean;
  ritmo: number;
  irA: { cual: "peri" | "afel" | "ninguno"; n: number };
  pintarN: number;
  onEstado: (s: EstadoElipse) => void;
  onPaso: (cual: "peri" | "afel") => void;
}

/** Semieje mayor en la escena. */
const A_S = 9;
/** Segundos por vuelta con ritmo 1. */
const P_VIS = 14;
const K = 40; // triángulos por sector
const C_A = "#38bdf8";
const C_B = "#f59e0b";
const EJE_Y = new THREE.Vector3(0, 1, 0);

/** Punto de la órbita en la escena (plano XZ, perihelio hacia +X). */
function enEscena(e: number, M: number, out: THREE.Vector3) {
  const k = puntoKepler(A_S, e, M);
  return out.set(k.x, 0, -k.y);
}

/* ── La órbita como tubo (no línea de 1 px), coloreada por rapidez ───────── */
function TuboOrbita({ e, aUA, porRapidez }: { e: number; aUA: number; porRapidez: boolean }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segs = 480;
    for (let i = 0; i < segs; i++) {
      const E = (i / segs) * 2 * Math.PI; // por anomalía excéntrica: puntos parejos en la curva
      pts.push(new THREE.Vector3(A_S * (Math.cos(E) - e), 0, -A_S * Math.sqrt(1 - e * e) * Math.sin(E)));
    }
    const curva = new THREE.CatmullRomCurve3(pts, true);
    const g = new THREE.TubeGeometry(curva, segs, porRapidez ? 0.08 : 0.055, 10, true);
    // Color por rapidez: azul (afelio, lento) → naranja (perihelio, rápido).
    const vp = visViva(aUA * (1 - e), aUA);
    const va = visViva(aUA * (1 + e), aUA);
    const col = new Float32Array(g.attributes.position!.count * 3);
    const lento = new THREE.Color("#60a5fa");
    const rapido = new THREE.Color("#fb923c");
    const neutro = new THREE.Color("#b6c2d4");
    const c = new THREE.Color();
    const pos = g.attributes.position!;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      if (!porRapidez) {
        c.copy(neutro);
      } else {
        const r = (Math.hypot(v.x, v.z) / A_S) * aUA;
        const t = vp - va > 1e-6 ? (visViva(Math.max(r, aUA * (1 - e)), aUA) - va) / (vp - va) : 0.5;
        c.copy(lento).lerp(rapido, THREE.MathUtils.clamp(t, 0, 1));
      }
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [e, aUA, porRapidez]);
  return (
    <mesh geometry={geo} raycast={() => null}>
      {/* La órbita es una guía luminosa: color propio, sin sombrear. */}
      <meshBasicMaterial vertexColors />
    </mesh>
  );
}

/* ── Los sectores de la 2.ª ley: un solo abanico con drawRange ───────────── */
function Abanico({ e, N, malla }: { e: number; N: number; malla: (m: THREE.Mesh | null) => void }) {
  const geo = useMemo(() => {
    const total = N * K;
    const pos = new Float32Array(total * 9);
    const col = new Float32Array(total * 9);
    const p0 = new THREE.Vector3();
    const p1 = new THREE.Vector3();
    const cA = new THREE.Color(C_A);
    const cB = new THREE.Color(C_B);
    for (let j = 0; j < total; j++) {
      enEscena(e, (j / total) * 2 * Math.PI, p0);
      enEscena(e, ((j + 1) / total) * 2 * Math.PI, p1);
      pos.set([0, 0.02, 0, p0.x, 0.02, p0.z, p1.x, 0.02, p1.z], j * 9);
      const c = Math.floor(j / K) % 2 === 0 ? cA : cB;
      for (let v = 0; v < 3; v++) col.set([c.r, c.g, c.b], j * 9 + v * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.setDrawRange(0, 0);
    return g;
  }, [e, N]);
  const radios = useMemo(() => {
    const out: [number, number, number][][] = [];
    const p = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      enEscena(e, (i / N) * 2 * Math.PI, p);
      out.push([[0, 0.03, 0], [p.x, 0.03, p.z]]);
    }
    return out;
  }, [e, N]);
  return (
    <>
      <mesh ref={malla} geometry={geo} raycast={() => null}>
        <meshBasicMaterial vertexColors transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      {radios.map((r, i) => (
        <Line key={i} points={r} color="#e2e8f0" lineWidth={1} transparent opacity={0.35} />
      ))}
    </>
  );
}

/* ── El cuerpo que orbita: planeta con foto o cometa con cola ────────────── */
function CuerpoFoto({ textura }: { textura: string }) {
  const mapa = useTexturaSS(textura);
  const giro = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (giro.current) giro.current.rotation.y += Math.min(dt, 0.1) * 0.5;
  });
  return (
    <mesh ref={giro} rotation={[0.3, 0, 0]}>
      <sphereGeometry args={[0.5, 64, 32]} />
      <meshStandardMaterial map={mapa} roughness={1} emissiveMap={mapa} emissive="#ffffff" emissiveIntensity={0.08} />
    </mesh>
  );
}

function NucleoCometa({ nucleo }: { nucleo: React.RefObject<THREE.Group | null> }) {
  const N = 360;
  const resplandor = useMemo(() => texturaResplandor(), []);
  const punto = useMemo(() => texturaPunto(), []);
  const cola = useRef<THREE.Points>(null);
  const base = useMemo(() => {
    const out: { t: number; a: number; r: number }[] = [];
    const azar = azarCon(7);
    for (let i = 0; i < N; i++) out.push({ t: Math.pow(azar(), 1.6), a: azar() * 2 * Math.PI, r: azar() });
    return out;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    const col = new Float32Array(N * 3);
    base.forEach((b, i) => col.set([0.75 * (1 - b.t), 0.88 * (1 - b.t), 1 - b.t], i * 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [base]);
  const anti = useMemo(() => new THREE.Vector3(), []);
  const lado = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const n = nucleo.current;
    const c = cola.current;
    if (!n || !c) return;
    const r = Math.max(0.2, n.position.length());
    anti.copy(n.position).normalize();
    lado.set(0, 1, 0).cross(anti).normalize();
    // La cola, lejos del Sol, crece al acercarse (hielo que se evapora).
    const largo = THREE.MathUtils.clamp(5 / Math.pow(r, 0.7), 0.15, 6);
    const pos = c.geometry.attributes.position as THREE.BufferAttribute;
    base.forEach((b, i) => {
      const abre = b.t * largo * 0.16 * b.r;
      pos.setXYZ(i, anti.x * b.t * largo + lado.x * Math.cos(b.a) * abre, Math.sin(b.a) * abre, anti.z * b.t * largo + lado.z * Math.cos(b.a) * abre);
    });
    pos.needsUpdate = true;
  });
  return (
    <>
      <mesh>
        <sphereGeometry args={[0.16, 20, 14]} />
        <meshBasicMaterial color={[1.05, 1.15, 1.3]} toneMapped={false} />
      </mesh>
      <sprite scale={1.6} raycast={() => null}>
        <spriteMaterial map={resplandor} color="#9cc8ff" opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
      </sprite>
      <points ref={cola} geometry={geo} raycast={() => null}>
        <pointsMaterial map={punto} size={0.32} sizeAttenuation vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </points>
    </>
  );
}

/* ── Todo junto ──────────────────────────────────────────────────────────── */
export function MundoElipse(p: ElipseProps) {
  const { e, a: aUA } = p.orbita;
  const M = useRef(0);
  const acumulado = useRef(0);
  const ultimo = useRef(0);
  const cuerpo = useRef<THREE.Group>(null);
  const flecha = useRef<THREE.Group>(null);
  const vCuerpo = useRef<THREE.Mesh>(null);
  const vPunta = useRef<THREE.Mesh>(null);
  const abanico = useRef<THREE.Mesh | null>(null);
  const textoV = useRef<HTMLSpanElement>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const vel = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const controles = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  const aspecto = size.width / Math.max(1, size.height);
  const angosto = size.width < 640;

  const rp = A_S * (1 - e);
  const ra = A_S * (1 + e);
  const vp = visViva(aUA * (1 - e), aUA);
  const va = visViva(aUA * (1 + e), aUA);
  const largoV = (v: number) => 0.45 + 4.6 * (v / Math.max(vp, 1e-6));
  const radioSol = THREE.MathUtils.clamp(rp * 0.5, 0.22, 0.8);

  // Encuadre: la elipse completa, entre la barra de arriba y la misión de abajo.
  useEffect(() => {
    const centroX = -A_S * e;
    const tan = Math.tan((21 * Math.PI) / 180);
    // Ancho: el eje mayor completo. Alto: el eje menor, en el ~75 % de la
    // pantalla que dejan libre la barra de arriba y la misión de abajo.
    const dAncho = (A_S * 1.22) / (tan * aspecto);
    const dAlto = (A_S * Math.sqrt(1 - e * e) * 1.2) / (tan * 0.74);
    const d = Math.max(dAncho, dAlto) * (angosto ? 1.06 : 1);
    // Casi cenital: la forma de la órbita y los sectores se leen sin escorzo.
    const dir = new THREE.Vector3(0, 2.3, 1).normalize();
    const objetivo = new THREE.Vector3(centroX, 0, 1.2);
    camera.position.copy(objetivo).addScaledVector(dir, d);
    controles.current?.target.copy(objetivo);
    controles.current?.update();
  }, [camera, e, aspecto, angosto]);

  // Reiniciar la pintura (y el planeta al perihelio) al cambiar la órbita.
  useEffect(() => {
    M.current = 0;
    acumulado.current = 0;
  }, [p.pintarN, e, p.divisiones]);

  const { cual: irCual, n: irN } = p.irA;
  useEffect(() => {
    // Al extremo pedido, sin perder las vueltas ya contadas.
    const base = Math.floor(M.current / (2 * Math.PI)) * 2 * Math.PI;
    if (irCual === "peri") M.current = base + 2 * Math.PI;
    else if (irCual === "afel") M.current = base + Math.PI;
  }, [irCual, irN]);

  useFrame((_, dtReal) => {
    const dt = Math.min(dtReal, 0.1);
    const antes = M.current;
    if (p.playing) {
      const dM = (2 * Math.PI * dt * p.ritmo) / P_VIS;
      M.current += dM;
      acumulado.current += dM;
    }
    // ¿Cruzó el perihelio (M = 0) o el afelio (M = π)?
    const vueltaAntes = Math.floor(antes / (2 * Math.PI));
    const vueltaAhora = Math.floor(M.current / (2 * Math.PI));
    if (vueltaAhora > vueltaAntes) p.onPaso("peri");
    if (Math.floor((antes - Math.PI) / (2 * Math.PI)) < Math.floor((M.current - Math.PI) / (2 * Math.PI))) p.onPaso("afel");

    const k = puntoKepler(A_S, e, M.current);
    if (cuerpo.current) cuerpo.current.position.set(k.x, 0, -k.y);
    const rUA = (k.r / A_S) * aUA;
    const v = visViva(rUA, aUA);

    // Velocidad: derivada de la posición respecto a E (dirección tangente).
    if (flecha.current) {
      const b = A_S * Math.sqrt(1 - e * e);
      vel.set(-A_S * Math.sin(k.E), 0, -b * Math.cos(k.E)).normalize();
      q.setFromUnitVectors(EJE_Y, vel);
      flecha.current.quaternion.copy(q);
      flecha.current.position.set(k.x, 0, -k.y).addScaledVector(vel, 0.55);
      const L = largoV(v);
      const punta = Math.min(L * 0.45, 0.6);
      const cuerpoL = Math.max(0.001, L - punta);
      if (vCuerpo.current) {
        vCuerpo.current.scale.set(1, cuerpoL, 1);
        vCuerpo.current.position.y = cuerpoL / 2;
      }
      if (vPunta.current) {
        vPunta.current.scale.set(1, punta, 1);
        vPunta.current.position.y = cuerpoL + punta / 2;
      }
    }
    if (textoV.current) textoV.current.textContent = miles(v, v < 10 ? 2 : 1);

    const N = p.divisiones;
    const pintadosTri = Math.min(N * K, Math.floor((acumulado.current / (2 * Math.PI)) * N * K));
    if (abanico.current) abanico.current.geometry.setDrawRange(0, pintadosTri * 3);

    ultimo.current += dt;
    if (ultimo.current > 0.1) {
      ultimo.current = 0;
      p.onEstado({ M: ((M.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), rUA, v, pintados: Math.floor(pintadosTri / K) });
    }
  });

  // Rótulos (≤ 4): Sol, perihelio, afelio y la rapidez del cuerpo.
  const peri: [number, number, number] = [rp, 0.15, 0];
  const afel: [number, number, number] = [-ra, 0.15, 0];
  const centroSector = (i: number) => enEscena(e, ((i + 0.5) / p.divisiones) * 2 * Math.PI, tmp.clone()).multiplyScalar(0.62);
  const sP = centroSector(0);
  const sA = centroSector(Math.floor(p.divisiones / 2));
  // Áreas MEDIDAS (fórmula del cordón), no supuestas.
  const medidas = useMemo(() => areasSectores(e, p.divisiones), [e, p.divisiones]);
  const iLejos = Math.floor(p.divisiones / 2);
  const pct = (f: number | undefined) => ((f ?? 0) * 100).toFixed(2);

  return (
    <>
      <ambientLight intensity={0.12} />
      <ViaLactea brillo={0.7} />
      <Stars radius={600} depth={200} count={4000} factor={6} saturation={0.2} fade speed={0} />
      <SolFoto radio={radioSol} luz={3.6} />

      <TuboOrbita e={e} aUA={aUA} porRapidez={p.modo === "rapidez"} />
      {/* Eje mayor y focos: guías finas (no son el sujeto). */}
      <Line points={[[rp + 0.6, 0.01, 0], [-ra - 0.6, 0.01, 0]]} color="#94a3b8" lineWidth={1} dashed dashSize={0.3} gapSize={0.22} transparent opacity={0.5} />
      <mesh position={[-2 * A_S * e, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <ringGeometry args={[0.14, 0.2, 32]} />
        <meshBasicMaterial color="#94a3b8" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {[peri, afel].map((pt, i) => (
        <mesh key={i} position={[pt[0], 0, 0]} raycast={() => null}>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {p.modo === "areas" && (
        <Abanico
          e={e}
          N={p.divisiones}
          malla={(m) => {
            abanico.current = m;
          }}
        />
      )}

      <group ref={cuerpo}>
        {p.orbita.textura ? <CuerpoFoto textura={p.orbita.textura} /> : <NucleoCometa nucleo={cuerpo} />}
        {p.modo === "rapidez" && (
          <group position={[0, 1.0, 0]}>
            <Rotulo posicion={[0, 0, 0]} color={p.orbita.color} fuerte>
              v = <span ref={textoV}>–</span> km/s
            </Rotulo>
          </group>
        )}
      </group>

      {p.modo === "rapidez" && (
        <>
          <group ref={flecha}>
            <mesh ref={vCuerpo} raycast={() => null}>
              <cylinderGeometry args={[0.11, 0.11, 1, 16]} />
              <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={0.6} roughness={0.4} />
            </mesh>
            <mesh ref={vPunta} raycast={() => null}>
              <coneGeometry args={[0.28, 1, 20]} />
              <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={0.6} roughness={0.4} />
            </mesh>
          </group>
          {/* Flechas fijas en los extremos: misma escala, para compararlas. */}
          <group position={[rp, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <FlechaY largo={largoV(vp)} grosor={0.08} color="#fb923c" opacidad={0.4} />
          </group>
          <group position={[-ra, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <FlechaY largo={largoV(va)} grosor={0.08} color="#60a5fa" opacidad={0.4} />
          </group>
          {/* En pantallas angostas no caben: las cifras ya están en el panel. */}
          {!angosto && (
            <>
              <Rotulo posicion={[Math.min(rp, A_S * 0.9), 0, 1.1]} color="#fb923c" lado="abajo" fuerte>
                Perihelio · {miles(vp, vp < 10 ? 2 : 1)} km/s
              </Rotulo>
              <Rotulo posicion={[-ra + 0.4, 0, 1.1]} color="#60a5fa" lado="abajo" fuerte>
                Afelio · {miles(va, va < 10 ? 2 : 1)} km/s
              </Rotulo>
            </>
          )}
        </>
      )}

      {p.modo === "areas" && !angosto && (
        <>
          <Rotulo posicion={[sP.x, 0.1, sP.z]} color={C_A} lado="derecha" fuerte>
            Junto al Sol · {pct(medidas[0])} %
          </Rotulo>
          <Rotulo posicion={[sA.x, 0.1, sA.z]} color={Math.floor(p.divisiones / 2) % 2 === 0 ? C_A : C_B} lado="izquierda" fuerte>
            Lejos · {pct(medidas[iLejos])} %
          </Rotulo>
          <Rotulo posicion={[0, 0, radioSol + 0.5]} color="#fbbf24" lado="abajo">Sol</Rotulo>
        </>
      )}

      <OrbitControls ref={controles} makeDefault enablePan={false} enableDamping dampingFactor={0.08} minDistance={4} maxDistance={70} minPolarAngle={0.05} maxPolarAngle={Math.PI / 2.05} />
    </>
  );
}
