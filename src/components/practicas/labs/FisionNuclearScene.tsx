"use client";

/**
 * Escena 3D del laboratorio "Energía nuclear: fisión y ética" (CNEYT-V-P08).
 * Cuatro vistas:
 *
 *  - reactor: vasija de un reactor de agua en ebullición en corte, con el
 *    combustible, las barras de control que entran por abajo, los neutrones,
 *    las fisiones, el vapor y la turbina; tras el apagado, el nivel del agua.
 *  - energia: una fisión n + ²³⁵U → ¹⁴¹Ba + ⁹²Kr + 3n con la balanza de masas,
 *    o la comparación pastillas de combustible frente a góndolas de carbón.
 *  - residuos: columnas de ocho isótopos que decaen con el tiempo y el corte
 *    de un repositorio geológico.
 *  - telecom: cobertura de torres sobre un terreno con pueblos, el haz de una
 *    antena con su zona de exclusión, o la ubicación de un celular con tres
 *    antenas.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type TipoReactor,
  type DemandaId,
  type IsotopoId,
  type BandaId,
  type TorreId,
  type SubTelecom,
  REGIMEN_DEF,
  regimen,
  AGUA_SOBRE_NUCLEO_T,
  P_ELECTRICA_MW,
  MASA_ANTES,
  MASA_DESPUES,
  DEFECTO_U,
  E_FISION_MEV,
  DEMANDAS,
  comparar,
  ENSAMBLE_U_KG,
  ISOTOPOS,
  fraccionRestante,
  PROFUNDIDAD_ONKALO_M,
  BANDAS_TEL,
  alcanceKm,
  TORRES,
  LOCALIDADES,
  cubiertas,
  densidadPotencia,
  distanciaLimite,
  D_MAX_M,
  ANTENAS_RASTREO,
  interseccionCirculos,
  INCERTIDUMBRE_KM,
  num,
  cient,
} from "./fision-nuclear-data";

export type SubEnergia = "fision" | "combustible";

export interface FisionSceneProps {
  vista: Modo;
  modoColor: string;
  resetNonce: number;
  // Reactor
  p: number;
  k: number;
  barras: number;
  vacios: number;
  tipo: TipoReactor;
  scram: boolean;
  agua: number;
  bombas: boolean;
  ebullicion: number;
  // Energía
  subEnergia: SubEnergia;
  disparo: number;
  demanda: DemandaId;
  revelado: boolean;
  // Residuos
  tAnios: number;
  isotopo: IsotopoId;
  // Telecom
  subTelecom: SubTelecom;
  banda: BandaId;
  torres: TorreId[];
  distanciaM: number;
  antenas: number[];
  telefono: { x: number; z: number };
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const NO = "#f87171";

function Etiqueta({ pos, children, df = 10, col, fs = 12, retraso }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number; retraso?: number }) {
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
          // La animación fnAparece vive en el <style> del shell.
          animation: retraso !== undefined ? `fnAparece .5s ease-out ${retraso}s both` : undefined,
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/** Geometrías compartidas (constantes de módulo). */
const G_ESFERA = new THREE.SphereGeometry(1, 12, 10);
const G_CAJA = new THREE.BoxGeometry(1, 1, 1);
const G_CILINDRO = new THREE.CylinderGeometry(1, 1, 1, 14);

function Persona({ pos, color, escala = 1 }: { pos: Pt; color: string; escala?: number }) {
  return (
    <group position={pos} scale={escala}>
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

/* ════════════════════════════════════════════════════════════════════════
 * 1. REACTOR
 * ════════════════════════════════════════════════════════════════════════ */

const R_VASIJA = 1.9;
const Y_NUCLEO_0 = 0.6;
const H_NUCLEO = 2.4;
const Y_NUCLEO_1 = Y_NUCLEO_0 + H_NUCLEO;
const ABERTURA = 0.34 * Math.PI;

/** Varillas de combustible en una malla circular. */
const VARILLAS: { x: number; z: number }[] = (() => {
  const out: { x: number; z: number }[] = [];
  for (let i = -6; i <= 6; i++)
    for (let j = -6; j <= 6; j++) {
      const x = i * 0.23;
      const z = j * 0.23;
      if (Math.hypot(x, z) < 1.45 && !(Math.abs(i) % 3 === 0 && Math.abs(j) % 3 === 0)) out.push({ x, z });
    }
  return out;
})();
/** Hojas cruciformes de control entre los ensambles. */
const HOJAS: { x: number; z: number }[] = [-0.69, 0, 0.69].flatMap((x) => [-0.69, 0, 0.69].map((z) => ({ x, z })));

const N_NEUTRONES = 150;
const N_DESTELLOS = 36;
const N_BURBUJAS = 90;

function nivelAgua(agua: number): number {
  if (agua >= 0) return Y_NUCLEO_1 + (agua / AGUA_SOBRE_NUCLEO_T) * 1.4;
  return Y_NUCLEO_1 + (agua / 80) * 1.2;
}

function EscenaReactor({ p, k, barras, vacios, tipo, scram, agua, bombas, ebullicion, modoColor }: { p: number; k: number; barras: number; vacios: number; tipo: TipoReactor; scram: boolean; agua: number; bombas: boolean; ebullicion: number; modoColor: string }) {
  const varillas = useRef<THREE.InstancedMesh>(null);
  const descubierto = useRef<THREE.InstancedMesh>(null);
  const hojas = useRef<THREE.InstancedMesh>(null);
  const neutrones = useRef<THREE.InstancedMesh>(null);
  const destellos = useRef<THREE.InstancedMesh>(null);
  const burbujas = useRef<THREE.InstancedMesh>(null);
  const aguaMesh = useRef<THREE.Mesh>(null);
  const luz = useRef<THREE.PointLight>(null);
  const turbina = useRef<THREE.Group>(null);
  const bomba = useRef<THREE.Group>(null);
  const matVarilla = useRef<THREE.MeshStandardMaterial>(null);
  const matAgua = useRef<THREE.MeshStandardMaterial>(null);
  const lecturaP = useRef<HTMLSpanElement>(null);
  const pSuave = useRef(p);
  const barrasSuave = useRef(barras);
  const nivel = useRef(nivelAgua(agua));
  const giro = useRef(0);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const semillas = useMemo(
    () =>
      Array.from({ length: N_NEUTRONES }, (_, i) => ({
        w1: 0.7 + ((i * 0.618) % 1) * 1.6,
        w2: 0.6 + ((i * 0.377) % 1) * 1.7,
        w3: 0.5 + ((i * 0.731) % 1) * 1.4,
        f1: i * 1.93,
        f2: i * 2.71,
        f3: i * 0.53,
        orden: (i * 37) % N_NEUTRONES,
      })),
    [],
  );
  const reg = regimen(k);
  const colReg = REGIMEN_DEF[reg].color;

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    pSuave.current += (p - pSuave.current) * suave(dt, 0.08);
    barrasSuave.current += (barras - barrasSuave.current) * suave(dt, 0.1);
    nivel.current += (nivelAgua(agua) - nivel.current) * suave(dt, 0.06);
    const P = Math.max(0, pSuave.current);
    const lvl = nivel.current;

    if (varillas.current) {
      VARILLAS.forEach((v, i) => {
        obj.position.set(v.x, Y_NUCLEO_0 + H_NUCLEO / 2, v.z);
        obj.rotation.set(0, 0, 0);
        obj.scale.set(0.05, H_NUCLEO, 0.05);
        obj.updateMatrix();
        varillas.current!.setMatrixAt(i, obj.matrix);
      });
      varillas.current.instanceMatrix.needsUpdate = true;
    }
    if (matVarilla.current) matVarilla.current.emissiveIntensity = 0.05 + Math.min(0.9, P * 0.38);
    if (matAgua.current) matAgua.current.emissiveIntensity = Math.min(0.9, P * 0.45);
    if (descubierto.current) {
      const alto = Math.max(0, Y_NUCLEO_1 - Math.max(lvl, Y_NUCLEO_0));
      VARILLAS.forEach((v, i) => {
        obj.position.set(v.x, Y_NUCLEO_1 - alto / 2, v.z);
        obj.rotation.set(0, 0, 0);
        obj.scale.set(0.062, Math.max(0.0001, alto), 0.062);
        obj.updateMatrix();
        descubierto.current!.setMatrixAt(i, obj.matrix);
      });
      descubierto.current.visible = alto > 0.01;
      descubierto.current.instanceMatrix.needsUpdate = true;
    }
    if (hojas.current) {
      const ins = barrasSuave.current;
      HOJAS.forEach((h, i) => {
        const yc = Y_NUCLEO_0 + H_NUCLEO * ins - H_NUCLEO / 2;
        for (let r = 0; r < 2; r++) {
          obj.position.set(h.x, yc, h.z);
          obj.rotation.set(0, r * (Math.PI / 2) + Math.PI / 4, 0);
          obj.scale.set(0.56, H_NUCLEO, 0.028);
          obj.updateMatrix();
          hojas.current!.setMatrixAt(i * 2 + r, obj.matrix);
        }
      });
      hojas.current.instanceMatrix.needsUpdate = true;
    }
    // Neutrones: cuantos más, más potencia (escala logarítmica).
    const visibles = Math.round(N_NEUTRONES * Math.min(1, Math.max(0, Math.log10(P * 1000 + 1) / Math.log10(2500))));
    if (neutrones.current) {
      semillas.forEach((s, i) => {
        const on = s.orden < visibles;
        obj.position.set(Math.sin(t * s.w1 + s.f1) * 1.3 * Math.cos(t * 0.3 + s.f3), Y_NUCLEO_0 + H_NUCLEO / 2 + Math.sin(t * s.w3 + s.f2) * 1.1, Math.cos(t * s.w2 + s.f2) * 1.3 * Math.sin(t * 0.27 + s.f1 + 1));
        obj.rotation.set(0, 0, 0);
        obj.scale.setScalar(on ? 0.05 : 0.0001);
        obj.updateMatrix();
        neutrones.current!.setMatrixAt(i, obj.matrix);
      });
      neutrones.current.instanceMatrix.needsUpdate = true;
    }
    if (destellos.current) {
      const activos = Math.round(N_DESTELLOS * Math.min(1, P));
      for (let i = 0; i < N_DESTELLOS; i++) {
        const periodo = 0.9 + (i % 5) * 0.23;
        const fase = ((t + i * 0.37) % periodo) / periodo;
        const v = VARILLAS[(i * 13 + Math.floor((t + i * 0.37) / periodo) * 7) % VARILLAS.length]!;
        const on = i < activos && fase < 0.22;
        obj.position.set(v.x, Y_NUCLEO_0 + 0.3 + ((i * 0.41) % 1) * (H_NUCLEO - 0.6), v.z);
        obj.rotation.set(0, 0, 0);
        obj.scale.setScalar(on ? 0.05 + (fase / 0.22) * 0.14 : 0.0001);
        obj.updateMatrix();
        destellos.current.setMatrixAt(i, obj.matrix);
      }
      destellos.current.instanceMatrix.needsUpdate = true;
    }
    if (burbujas.current) {
      const n = Math.round(N_BURBUJAS * Math.min(1, ebullicion));
      for (let i = 0; i < N_BURBUJAS; i++) {
        const v = VARILLAS[(i * 7) % VARILLAS.length]!;
        const vel = 0.5 + ((i * 0.29) % 1) * 0.6;
        const y0 = Y_NUCLEO_0 + 0.2;
        const alto = Math.max(0.3, lvl - y0);
        const y = y0 + ((t * vel + i * 0.173) % 1) * alto;
        const on = i < n && y < lvl - 0.05;
        obj.position.set(v.x + 0.1, y, v.z + 0.08);
        obj.rotation.set(0, 0, 0);
        obj.scale.setScalar(on ? 0.04 + ((i * 0.53) % 1) * 0.04 : 0.0001);
        obj.updateMatrix();
        burbujas.current.setMatrixAt(i, obj.matrix);
      }
      burbujas.current.instanceMatrix.needsUpdate = true;
    }
    if (aguaMesh.current) {
      const h = Math.max(0.01, lvl - 0.05);
      aguaMesh.current.scale.y = h;
      aguaMesh.current.position.y = 0.05 + h / 2;
    }
    if (luz.current) luz.current.intensity = 0.4 + Math.min(3.5, P * 2.6);
    giro.current += dt * (scram ? 0.15 : 6) * Math.min(1.3, P + 0.02);
    if (turbina.current) turbina.current.rotation.x = giro.current;
    if (bomba.current && bombas) bomba.current.rotation.y += dt * 5;
    if (lecturaP.current) lecturaP.current.textContent = scram ? "0 MW" : `${num(P_ELECTRICA_MW * Math.min(P, 3))} MW`;
  });

  const esRbmk = tipo === "rbmk";
  const sinAgua = agua < 0;
  return (
    <group position={[-0.6, -2.3, 0]} scale={0.85}>
      <mesh position={[1.5, -2.72, 0]} receiveShadow>
        <cylinderGeometry args={[7.5, 7.5, 0.1, 64]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      {/* Faldón y mecanismos de las barras (debajo de la vasija) */}
      <mesh position={[0, -1.35, 0]}>
        <cylinderGeometry args={[1.6, 1.6, 2.7, 40, 1, true, ABERTURA, Math.PI * 2 - 2 * ABERTURA]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {HOJAS.map((h, i) => (
        <mesh key={i} position={[h.x, -1.45, h.z]}>
          <cylinderGeometry args={[0.035, 0.035, 2.5, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {/* Vasija en corte */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[R_VASIJA, R_VASIJA, 5, 56, 1, true, ABERTURA, Math.PI * 2 - 2 * ABERTURA]} />
        <meshStandardMaterial color="#64748b" metalness={0.75} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[R_VASIJA, R_VASIJA, 0.06, 56]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R_VASIJA, 0.08, 10, 56]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Moderador: agua (BWR) o grafito (RBMK) */}
      {esRbmk && (
        <mesh position={[0, Y_NUCLEO_0 + H_NUCLEO / 2, 0]}>
          <cylinderGeometry args={[1.55, 1.55, H_NUCLEO, 40, 1, true]} />
          <meshStandardMaterial color="#1f2937" roughness={0.9} transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      <mesh ref={aguaMesh} position={[0, 2, 0]}>
        <cylinderGeometry args={[R_VASIJA - 0.06, R_VASIJA - 0.06, 1, 48]} />
        <meshStandardMaterial ref={matAgua} color="#38bdf8" emissive="#2563eb" emissiveIntensity={0.4} transparent opacity={esRbmk ? 0.12 : 0.24 - vacios * 0.08} roughness={0.1} depthWrite={false} />
      </mesh>
      <instancedMesh ref={varillas} args={[G_CILINDRO, undefined, VARILLAS.length]} castShadow>
        <meshStandardMaterial ref={matVarilla} color="#a8a29e" emissive="#f59e0b" emissiveIntensity={0.4} metalness={0.55} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={descubierto} args={[G_CILINDRO, undefined, VARILLAS.length]} visible={false}>
        <meshStandardMaterial color="#7f1d1d" emissive="#ef4444" emissiveIntensity={1.8} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={hojas} args={[G_CAJA, undefined, HOJAS.length * 2]} castShadow>
        <meshStandardMaterial color="#111827" metalness={0.6} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={neutrones} args={[G_ESFERA, undefined, N_NEUTRONES]} frustumCulled={false}>
        <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={2.2} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={destellos} args={[G_ESFERA, undefined, N_DESTELLOS]} frustumCulled={false}>
        <meshBasicMaterial color="#fde68a" transparent opacity={0.85} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={burbujas} args={[G_ESFERA, undefined, N_BURBUJAS]} frustumCulled={false}>
        <meshStandardMaterial color="#f0f9ff" transparent opacity={0.7} roughness={0.1} />
      </instancedMesh>
      <pointLight ref={luz} position={[0, Y_NUCLEO_0 + H_NUCLEO / 2, 0.4]} color="#60a5fa" distance={6} intensity={2} />

      {/* Línea de vapor, turbina y generador */}
      <mesh position={[2.9, 4.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 2.2, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[4.0, 3.2, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 2.6, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.25} />
      </mesh>
      <group position={[4.9, 1.6, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.55, 0.85, 1.6, 32]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
        </mesh>
        <group ref={turbina} position={[-0.9, 0, 0]}>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} rotation={[(i / 8) * Math.PI * 2, 0, 0]} position={[0, 0, 0]}>
              <boxGeometry args={[0.05, 1.3, 0.16]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </group>
        <mesh position={[1.35, 0, 0]} castShadow>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshStandardMaterial color={modoColor} metalness={0.3} roughness={0.45} />
        </mesh>
        <mesh position={[0.2, -1.05, 0]}>
          <boxGeometry args={[3.0, 0.5, 1.3]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
      </group>
      <Etiqueta pos={[5.2, 3.0, 0]} df={10} fs={11} col={`${modoColor}aa`}>
        <i className="fa-solid fa-bolt" style={{ color: modoColor }} />
        Generador · <span ref={lecturaP}>810 MW</span>
      </Etiqueta>

      {/* Bomba de recirculación */}
      <group position={[2.6, -0.3, 0.9]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.6, 20]} />
          <meshStandardMaterial color={bombas ? "#0ea5e9" : "#7f1d1d"} metalness={0.5} roughness={0.4} />
        </mesh>
        <group ref={bomba} position={[0, 0.34, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation={[0, (i / 3) * Math.PI * 2, 0]} position={[0, 0, 0]}>
              <boxGeometry args={[0.6, 0.05, 0.1]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.7} />
            </mesh>
          ))}
        </group>
        <mesh position={[-0.75, 0, -0.45]} rotation={[0, 0.55, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 1.2, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      <Etiqueta pos={[3.7, 0.55, 1.1]} df={10} fs={10.5} col={bombas ? "#38bdf8aa" : `${NO}cc`}>
        <i className="fa-solid fa-fan" style={{ color: bombas ? "#38bdf8" : NO }} />
        {bombas ? "Bombas de enfriamiento" : "Bombas apagadas"}
      </Etiqueta>

      <Etiqueta pos={[-2.9, Y_NUCLEO_0 + 1.4, 0.6]} df={10} fs={10.5} col="#f59e0baa">
        <i className="fa-solid fa-circle-radiation" style={{ color: "#f59e0b" }} />
        Combustible UO₂
      </Etiqueta>
      <Etiqueta pos={[-3.1, -0.5, 0.6]} df={10} fs={10.5}>
        <i className="fa-solid fa-arrow-up" style={{ color: "#cbd5e1" }} />
        Barras de control · {num(barras * 100)} %
      </Etiqueta>
      <Etiqueta pos={[-2.9, 4.3, 0.6]} df={10} fs={10.5} col="#38bdf8aa">
        <i className="fa-solid fa-droplet" style={{ color: "#38bdf8" }} />
        {esRbmk ? "Grafito modera · agua enfría" : "Agua: moderador y refrigerante"}
      </Etiqueta>
      <Etiqueta pos={[0, 6.1, 0]} df={9} fs={14} col={`${scram ? NO : colReg}cc`}>
        <i className="fa-solid fa-atom" style={{ color: scram ? NO : colReg }} />
        {scram ? "SCRAM · reactor apagado" : `k = ${k.toFixed(3)} · ${REGIMEN_DEF[reg].etq}`}
      </Etiqueta>
      {scram && (
        <Etiqueta pos={[0, 5.4, 1.2]} df={10} fs={11} col={sinAgua ? `${NO}cc` : "#38bdf8aa"}>
          <i className={`fa-solid ${sinAgua ? "fa-triangle-exclamation" : "fa-water"}`} style={{ color: sinAgua ? NO : "#38bdf8" }} />
          {sinAgua ? "¡Combustible descubierto: se sobrecalienta!" : `Agua sobre el combustible: ${num(Math.max(0, agua))} t`}
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. E = mc²
 * ════════════════════════════════════════════════════════════════════════ */

const N_NUCLEONES = 72;
/** Nucleones en una esfera compacta (espiral de Fibonacci por capas). */
const NUCLEONES: { x: number; y: number; z: number; proton: boolean; frag: 0 | 1 }[] = (() => {
  const out: { x: number; y: number; z: number; proton: boolean; frag: 0 | 1 }[] = [];
  const oro = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N_NUCLEONES; i++) {
    const r = 0.72 * Math.cbrt((i + 0.5) / N_NUCLEONES);
    const y = 1 - (2 * (i + 0.5)) / N_NUCLEONES;
    const rad = Math.sqrt(1 - y * y);
    const th = oro * i;
    out.push({ x: Math.cos(th) * rad * r, y: y * r, z: Math.sin(th) * rad * r, proton: (i * 92) % 235 < 92, frag: 0 });
  }
  // Los 42 nucleones de más a la izquierda forman el bario; el resto, el kriptón.
  const orden = out.map((n, i) => ({ i, x: n.x })).sort((a, b) => a.x - b.x);
  orden.forEach((o, k) => {
    out[o.i]!.frag = k < 43 ? 0 : 1;
  });
  return out;
})();
const CENTRO_FRAG = [0, 1].map((f) => {
  const xs = NUCLEONES.filter((n) => n.frag === f);
  return { x: xs.reduce((a, n) => a + n.x, 0) / xs.length, y: xs.reduce((a, n) => a + n.y, 0) / xs.length };
});
const DIR_NEUTRONES: Pt[] = [
  [0.9, 1.1, 0.4],
  [-0.3, -1.2, 0.7],
  [1.2, -0.2, -0.8],
];
const T_LLEGA = 1.0;
const T_PARTE = 1.7;
/** Hacia dónde sale cada fragmento (bario a la izquierda, kriptón a la derecha). */
const SALIDA: [number, number][] = [
  [-2.8, 0.6],
  [2.9, 0.35],
];

const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

function EscenaFision({ disparo, modoColor }: { disparo: number; modoColor: string }) {
  const nucleo = useRef<THREE.InstancedMesh>(null);
  const bala = useRef<THREE.Mesh>(null);
  const salientes = useRef<THREE.InstancedMesh>(null);
  const destello = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const cProton = useMemo(() => new THREE.Color("#f87171"), []);
  const cNeutron = useMemo(() => new THREE.Color("#94a3b8"), []);

  useFrame(({ clock }, dt) => {
    if (disparo > 0) t.current += Math.min(dt, 0.1);
    const tt = t.current;
    const temblor = disparo > 0 && tt > T_LLEGA && tt < T_PARTE ? (tt - T_LLEGA) / (T_PARTE - T_LLEGA) : 0;
    const sep = disparo > 0 ? easeOut((tt - T_PARTE) / 1.4) : 0;
    const respira = 1 + Math.sin(clock.elapsedTime * 2) * 0.015;
    if (nucleo.current) {
      NUCLEONES.forEach((n, i) => {
        const alarga = tt >= T_PARTE ? 1.55 : 1 + temblor * 0.55;
        const vib = temblor * 0.03 * Math.sin(clock.elapsedTime * 40 + i);
        const c = CENTRO_FRAG[n.frag]!;
        let x = n.x * alarga * respira + vib;
        let y = n.y * (tt >= T_PARTE ? 0.82 : 1 - temblor * 0.18) * respira;
        if (sep > 0) {
          // Cada fragmento se contrae hacia su centro y sale disparado.
          const cx = c.x * 1.55;
          const cy = c.y * 0.82;
          const [dx, dy] = SALIDA[n.frag]!;
          x = cx + (x - cx) * (1 - 0.25 * sep) + dx * sep;
          y = cy + (y - cy) * (1 - 0.25 * sep) + dy * sep;
        }
        obj.position.set(x, y, n.z);
        obj.rotation.set(0, 0, 0);
        obj.scale.setScalar(0.135);
        obj.updateMatrix();
        nucleo.current!.setMatrixAt(i, obj.matrix);
        nucleo.current!.setColorAt(i, n.proton ? cProton : cNeutron);
      });
      nucleo.current.instanceMatrix.needsUpdate = true;
      if (nucleo.current.instanceColor) nucleo.current.instanceColor.needsUpdate = true;
    }
    if (bala.current) {
      const f = disparo > 0 ? Math.min(1, tt / T_LLEGA) : 0;
      bala.current.position.set(-4.2 + f * 3.5, 0.05, 0);
      bala.current.visible = disparo === 0 || tt < T_LLEGA;
      const s = disparo === 0 ? 1 + Math.sin(clock.elapsedTime * 4) * 0.12 : 1;
      bala.current.scale.setScalar(0.15 * s);
    }
    if (salientes.current) {
      DIR_NEUTRONES.forEach((d, i) => {
        const f = sep * 3.2;
        obj.position.set(d[0] * f, d[1] * f, d[2] * f);
        obj.rotation.set(0, 0, 0);
        obj.scale.setScalar(sep > 0 ? 0.15 : 0.0001);
        obj.updateMatrix();
        salientes.current!.setMatrixAt(i, obj.matrix);
      });
      salientes.current.instanceMatrix.needsUpdate = true;
    }
    if (destello.current) {
      const g = disparo > 0 ? Math.max(0, 1 - Math.abs(tt - T_PARTE - 0.15) / 0.45) : 0;
      destello.current.scale.setScalar(0.2 + g * 2.6);
      (destello.current.material as THREE.MeshBasicMaterial).opacity = g * 0.75;
      destello.current.visible = g > 0.01;
    }
  });

  const alto = (m: number) => 0.25 + (m - 235.8) * 4;
  return (
    <group position={[0.3, 0.2, 0]}>
      <instancedMesh ref={nucleo} args={[G_ESFERA, undefined, N_NUCLEONES]} frustumCulled={false} castShadow>
        <meshStandardMaterial roughness={0.35} metalness={0.1} />
      </instancedMesh>
      <mesh ref={bala}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <instancedMesh ref={salientes} args={[G_ESFERA, undefined, 3]} frustumCulled={false}>
        <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={2} toneMapped={false} />
      </instancedMesh>
      <mesh ref={destello} visible={false}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      {disparo === 0 && (
        <>
          <Etiqueta pos={[-4.2, 0.75, 0]} df={9} fs={11} col="#7dd3fcaa">
            <i className="fa-solid fa-circle" style={{ color: "#7dd3fc", fontSize: 8 }} />
            Neutrón lento
          </Etiqueta>
          <Etiqueta pos={[0, 1.35, 0]} df={9} fs={12} col={`${modoColor}aa`}>
            ²³⁵U · 92 protones y 143 neutrones
          </Etiqueta>
        </>
      )}
      {disparo > 0 && (
        <>
          <Etiqueta retraso={2.9} pos={[-3.0, 1.45, 0]} df={9} fs={12} col="#f87171aa">
              ¹⁴¹Ba · 140.9144 u
            </Etiqueta>
          <Etiqueta retraso={2.9} pos={[3.1, 1.2, 0]} df={9} fs={12} col="#f87171aa">
              ⁹²Kr · 91.9262 u
            </Etiqueta>
          <Etiqueta retraso={2.9} pos={[1.1, 1.9, 1.0]} df={9} fs={11} col="#7dd3fcaa">
              3 neutrones → más fisiones
            </Etiqueta>
        </>
      )}
      {/* Balanza de masas (la diferencia se dibuja ampliada) */}
      <group position={[0, -3.1, -1.2]}>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[2.6, 0.1, 1.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        {[
          { x: -0.6, m: MASA_ANTES, etq: "Antes", col: "#94a3b8" },
          { x: 0.6, m: MASA_DESPUES, etq: "Después", col: modoColor },
        ].map((b) => (
          <group key={b.etq} position={[b.x, 0, 0]}>
            <mesh position={[0, alto(b.m) / 2, 0]} castShadow>
              <boxGeometry args={[0.8, alto(b.m), 0.6]} />
              <meshStandardMaterial color={b.col} roughness={0.4} metalness={0.2} />
            </mesh>
            <Etiqueta pos={[b.x < 0 ? -1.75 : 1.8, alto(b.m) * 0.6, 0]} df={10} fs={11}>
              {b.etq}: {b.m.toFixed(4)} u
            </Etiqueta>
          </group>
        ))}
        <Etiqueta pos={[0, 1.65, 0]} df={10} fs={10.5} col={`${modoColor}aa`}>
          Faltan {DEFECTO_U.toFixed(4)} u → {num(E_FISION_MEV, 1)} MeV · diferencia ampliada
        </Etiqueta>
      </group>
    </group>
  );
}

const N_PASTILLAS = 40;
const N_VAGONES = 36;
const N_TROZOS = 70;

function EscenaCombustible({ demanda, revelado, modoColor }: { demanda: DemandaId; revelado: boolean; modoColor: string }) {
  const d = DEMANDAS.find((x) => x.id === demanda) ?? DEMANDAS[0]!;
  const c = comparar(d.kwh);
  const chica = demanda === "casa";
  const ensambles = c.uKg / ENSAMBLE_U_KG;
  const nNuc = chica ? 1 : Math.min(N_PASTILLAS, Math.max(1, Math.round(ensambles)));
  const porNuc = chica ? 1 : ensambles / nNuc;
  const nVag = chica ? 0 : Math.min(N_VAGONES, Math.max(1, Math.round(c.vagones)));
  const porVag = chica ? 0 : c.vagones / Math.max(1, nVag);
  const nuc = useRef<THREE.InstancedMesh>(null);
  const vag = useRef<THREE.InstancedMesh>(null);
  const carga = useRef<THREE.InstancedMesh>(null);
  const trozos = useRef<THREE.InstancedMesh>(null);
  const brote = useRef(0);
  const obj = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, dt) => {
    brote.current = Math.min(1, brote.current + dt * (revelado ? 0.8 : 0));
    const b = easeOut(brote.current);
    if (nuc.current) {
      for (let i = 0; i < N_PASTILLAS; i++) {
        const on = i < nNuc;
        if (chica) {
          obj.position.set(0, 1.14 + 0.08 * c.pastillas, 0);
          obj.scale.set(0.2, 0.34 * c.pastillas, 0.2);
        } else {
          const fila = Math.floor(i / 8);
          const col = i % 8;
          obj.position.set((col - 3.5) * 0.24, 1.1 + 0.9, (fila - 2) * 0.24);
          obj.scale.set(0.09, 1.8, 0.09);
        }
        if (!on) obj.scale.setScalar(0.0001);
        obj.rotation.set(0, 0, 0);
        obj.updateMatrix();
        nuc.current.setMatrixAt(i, obj.matrix);
      }
      nuc.current.instanceMatrix.needsUpdate = true;
    }
    if (vag.current && carga.current) {
      for (let i = 0; i < N_VAGONES; i++) {
        const on = i < nVag;
        const a = -0.2 + i * 0.075;
        const r = 5 + i * 0.12;
        const x = 2.2 + Math.sin(a) * r * 0.9;
        const z = 4.2 - Math.cos(a) * r;
        obj.position.set(x, 0.35, z);
        obj.rotation.set(0, -a, 0);
        obj.scale.set(on ? 0.7 : 0.0001, on ? 0.5 : 0.0001, on ? 1.35 : 0.0001);
        obj.updateMatrix();
        vag.current.setMatrixAt(i, obj.matrix);
        obj.position.set(x, 0.6 + 0.12 * b, z);
        obj.scale.set(on ? 0.62 : 0.0001, on ? 0.02 + 0.24 * b : 0.0001, on ? 1.25 : 0.0001);
        obj.updateMatrix();
        carga.current.setMatrixAt(i, obj.matrix);
      }
      vag.current.instanceMatrix.needsUpdate = true;
      carga.current.instanceMatrix.needsUpdate = true;
    }
    if (trozos.current) {
      // 833 kg de carbón ≈ 1 m³ a granel: una pila del tamaño de una persona sentada.
      for (let i = 0; i < N_TROZOS; i++) {
        const on = chica;
        const ang = i * 2.399;
        const rr = 0.55 * Math.sqrt((i + 0.5) / N_TROZOS);
        const h = (1 - rr / 0.6) * 0.75 * b;
        obj.position.set(2.6 + Math.cos(ang) * rr, 0.08 + h * ((i % 3) / 3 + 0.4), Math.sin(ang) * rr);
        obj.rotation.set(i, i * 0.7, i * 1.3);
        obj.scale.setScalar(on ? 0.1 + ((i * 0.37) % 1) * 0.07 : 0.0001);
        obj.updateMatrix();
        trozos.current.setMatrixAt(i, obj.matrix);
      }
      trozos.current.instanceMatrix.needsUpdate = true;
    }
  });
  const nucEtq = chica ? `${num(c.pastillas, 1)} de una pastilla de UO₂ (≈ ${num(c.uKg * 1000, 1)} g de uranio)` : `${num(ensambles)} ensambles de combustible (${num(c.uKg / 1000, 1)} t de uranio)`;
  const carEtq = chica ? `${num(c.carbonKg)} kg de carbón` : `${num(c.vagones)} góndolas de 100 t (${cient(c.carbonKg / 1000, 2)} t de carbón)`;
  return (
    <group position={[0.2, -1.6, 0]}>
      <mesh position={[1, -0.05, 1.5]} receiveShadow>
        <cylinderGeometry args={[9, 9, 0.1, 64]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      {/* Lado nuclear */}
      <group position={[-2.4, 0, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[chica ? 0.6 : 1.3, chica ? 0.75 : 1.45, 1, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[chica ? 0.62 : 1.32, chica ? 0.62 : 1.32, 0.04, 32]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
        </mesh>
        <instancedMesh ref={nuc} args={[chica ? G_CILINDRO : G_CAJA, undefined, N_PASTILLAS]} key={chica ? "p" : "e"} castShadow frustumCulled={false}>
          <meshStandardMaterial color={chica ? "#57534e" : "#a8a29e"} metalness={chica ? 0.2 : 0.7} roughness={0.35} />
        </instancedMesh>
        <Etiqueta pos={[0, chica ? 2.0 : 3.35, 0]} df={10} fs={11.5} col="#38bdf8aa">
          <i className="fa-solid fa-atom" style={{ color: "#38bdf8" }} />
          {nucEtq}
        </Etiqueta>
        {chica && (
          <Etiqueta pos={[0, -0.35, 1.0]} df={10} fs={10}>
            pastilla de ≈ 1 cm dibujada muy ampliada · el carbón, a escala
          </Etiqueta>
        )}
        {!chica && porNuc > 1.05 && (
          <Etiqueta pos={[0, -0.35, 1.5]} df={10} fs={10}>
            cada barra dibujada = {num(porNuc, 1)} ensambles
          </Etiqueta>
        )}
      </group>
      {/* Lado del carbón */}
      <Persona pos={[1.4, 0, 0.5]} color="#64748b" />
      <instancedMesh ref={trozos} args={[undefined, undefined, N_TROZOS]} frustumCulled={false} castShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#1c1917" roughness={0.8} metalness={0.15} />
      </instancedMesh>
      <instancedMesh ref={vag} args={[G_CAJA, undefined, N_VAGONES]} frustumCulled={false} castShadow>
        <meshStandardMaterial color="#7c2d12" roughness={0.6} metalness={0.3} />
      </instancedMesh>
      <instancedMesh ref={carga} args={[G_CAJA, undefined, N_VAGONES]} frustumCulled={false}>
        <meshStandardMaterial color="#1c1917" roughness={0.9} />
      </instancedMesh>
      <Etiqueta pos={[chica ? 2.6 : 3.2, chica ? 1.6 : 1.8, chica ? 0 : 1.2]} df={10} fs={11.5} col={revelado ? "#a8a29eaa" : `${modoColor}aa`}>
        <i className="fa-solid fa-train" style={{ color: revelado ? "#d6d3d1" : modoColor }} />
        {revelado ? carEtq : "¿Cuánto carbón? Predice primero"}
      </Etiqueta>
      {revelado && !chica && porVag > 1.05 && (
        <Etiqueta pos={[3.2, 2.45, 1.2]} df={10} fs={10}>
          cada góndola dibujada = {num(porVag)} góndolas
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. RESIDUOS Y TIEMPO
 * ════════════════════════════════════════════════════════════════════════ */

const ALTO_COL = 2.4;

function Columna({ i, frac, col, etq, t12, sel }: { i: number; frac: number; col: string; etq: string; t12: number; sel: boolean }) {
  // etq: símbolo corto (Pu-239) para que las etiquetas no se encimen.
  const barra = useRef<THREE.Mesh>(null);
  const f = useRef(frac);
  const lectura = useRef<HTMLSpanElement>(null);
  useFrame((_, dt) => {
    f.current += (frac - f.current) * suave(dt, 0.12);
    const h = Math.max(0.002, f.current * ALTO_COL);
    if (barra.current) {
      barra.current.scale.set(0.2, h, 0.2);
      barra.current.position.y = 0.12 + h / 2;
    }
    if (lectura.current) lectura.current.textContent = f.current >= 0.1 ? `${num(f.current * 100)} %` : f.current >= 0.001 ? `${num(f.current * 100, 1)} %` : "≈ 0 %";
  });
  const x = (i - 3.5) * 1.05;
  const z = Math.abs(i - 3.5) * 0.12;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.36, 0.4, 0.12, 24]} />
        <meshStandardMaterial color={sel ? col : "#1e293b"} emissive={sel ? col : "#000"} emissiveIntensity={sel ? 0.18 : 0} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.12 + ALTO_COL / 2, 0]}>
        <cylinderGeometry args={[0.26, 0.26, ALTO_COL, 24, 1, true]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.1} roughness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={barra} geometry={G_CILINDRO}>
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.9} roughness={0.3} toneMapped={false} />
      </mesh>
      <Etiqueta pos={[0, ALTO_COL + 0.5, 0]} df={10} fs={11} col={`${col}aa`}>
        <span ref={lectura}>100 %</span>
      </Etiqueta>
      <Html position={[0, -0.32, 0.45]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ textAlign: "center", color: "#fff", fontSize: 10.5, fontWeight: 800, lineHeight: 1.2, whiteSpace: "nowrap", padding: "3px 7px", borderRadius: 8, background: sel ? "rgba(4,10,22,0.92)" : "rgba(4,10,22,0.7)", border: `1px solid ${sel ? col : "transparent"}` }}>
          {etq}
          <div style={{ fontSize: 9.5, color: "#cbd5e1", fontWeight: 700 }}>T½ {t12 < 1 ? `${num(t12 * 365.25, 1)} d` : t12 >= 1e6 ? `${num(t12 / 1e6, 1)} Ma` : `${num(t12, t12 < 10 ? 1 : 0)} a`}</div>
        </div>
      </Html>
    </group>
  );
}

function EscenaResiduos({ tAnios, isotopo, modoColor }: { tAnios: number; isotopo: IsotopoId; modoColor: string }) {
  const actividad = ISOTOPOS.reduce((a, iso) => a + fraccionRestante(tAnios, iso.t12), 0) / ISOTOPOS.length;
  const matCont = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (matCont.current) matCont.current.emissiveIntensity = 0.1 + actividad * (1.4 + Math.sin(clock.elapsedTime * 2) * 0.2);
  });
  return (
    <group position={[0, -2.6, 0]}>
      <mesh position={[0, -0.05, 0.6]} receiveShadow>
        <cylinderGeometry args={[5.6, 5.6, 0.1, 64]} />
        <meshStandardMaterial color="#0f1b2d" roughness={0.9} />
      </mesh>
      {ISOTOPOS.map((iso, i) => (
        <Columna key={iso.id} i={i} frac={fraccionRestante(tAnios, iso.t12)} col={iso.color} etq={iso.simbolo} t12={iso.t12} sel={iso.id === isotopo} />
      ))}
      {/* Corte del repositorio geológico */}
      <group position={[0, 4.3, -6.5]} scale={0.78}>
        {[
          { y: 1.7, h: 0.5, c: "#3f6212" },
          { y: 0.8, h: 1.3, c: "#57534e" },
          { y: -0.8, h: 1.9, c: "#44403c" },
        ].map((s, k) => (
          <mesh key={k} position={[0, s.y, 0]}>
            <boxGeometry args={[8.4, s.h, 1.2]} />
            <meshStandardMaterial color={s.c} roughness={0.95} />
          </mesh>
        ))}
        <mesh position={[-2.6, 2.3, 0]}>
          <boxGeometry args={[1.2, 0.7, 0.8]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
        </mesh>
        <mesh position={[-2.6, 0.9, 0.2]}>
          <boxGeometry args={[0.16, 2.2, 0.16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.6, -1.1, 0.35]}>
          <boxGeometry args={[6.2, 0.55, 0.6]} />
          <meshStandardMaterial color="#1c1917" roughness={1} />
        </mesh>
        {Array.from({ length: 7 }, (_, k) => (
          <group key={k} position={[-2.0 + k * 0.85, -1.1, 0.5]}>
            <mesh>
              <cylinderGeometry args={[0.2, 0.2, 0.36, 18]} />
              <meshStandardMaterial ref={k === 0 ? matCont : undefined} color="#b45309" metalness={0.8} roughness={0.3} emissive={modoColor} emissiveIntensity={0.3} />
            </mesh>
          </group>
        ))}
        <Etiqueta pos={[3.6, -1.1, 0.8]} df={11} fs={10.5} col={`${modoColor}aa`}>
          <i className="fa-solid fa-arrow-down" style={{ color: modoColor }} />≈ {PROFUNDIDAD_ONKALO_M} m bajo tierra (Onkalo)
        </Etiqueta>
        <Etiqueta pos={[-2.6, 3.0, 0.6]} df={13} fs={10.5}>
          Repositorio geológico
        </Etiqueta>
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 4. ONDAS Y SOCIEDAD
 * ════════════════════════════════════════════════════════════════════════ */

const KM = 0.5; // unidades de escena por km en la vista de cobertura

function Torre({ pos, alto = 2.2, color, fantasma = false }: { pos: Pt; alto?: number; color: string; fantasma?: boolean }) {
  return (
    <group position={pos}>
      <mesh position={[0, alto / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.12, alto, 6]} />
        <meshStandardMaterial color={fantasma ? "#475569" : "#e2e8f0"} metalness={0.7} roughness={0.3} transparent={fantasma} opacity={fantasma ? 0.45 : 1} />
      </mesh>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[Math.sin((k * Math.PI * 2) / 3) * 0.13, alto - 0.2, Math.cos((k * Math.PI * 2) / 3) * 0.13]} rotation={[0, (k * Math.PI * 2) / 3, 0]}>
          <boxGeometry args={[0.1, 0.34, 0.04]} />
          <meshStandardMaterial color={fantasma ? "#64748b" : "#f8fafc"} transparent={fantasma} opacity={fantasma ? 0.45 : 1} />
        </mesh>
      ))}
      {!fantasma && (
        <mesh position={[0, alto + 0.08, 0]}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

function Onda({ pos, radio, color }: { pos: Pt; radio: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const f = (clock.elapsedTime * 0.35) % 1;
    if (ref.current) ref.current.scale.set(radio * f + 0.01, radio * f + 0.01, 1);
    if (mat.current) mat.current.opacity = 0.55 * (1 - f);
  });
  return (
    <mesh ref={ref} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.97, 1, 64]} />
      <meshBasicMaterial ref={mat} color={color} transparent opacity={0.5} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

const CERROS: { x: number; z: number; r: number; h: number }[] = [
  { x: 26, z: -4, r: 5.5, h: 3.0 },
  { x: 30, z: 8, r: 4, h: 1.6 },
  { x: 10, z: -12, r: 5, h: 1.8 },
  { x: -8, z: -10, r: 4, h: 1.2 },
  { x: 38, z: -12, r: 5, h: 2.2 },
];
/** Edificios de la ciudad (constantes). */
const EDIFICIOS: { x: number; z: number; h: number }[] = Array.from({ length: 34 }, (_, i) => {
  const a = i * 2.399;
  const r = 0.35 + 1.5 * Math.sqrt((i + 0.5) / 34);
  return { x: -1.5 + Math.cos(a) * r, z: 1 + Math.sin(a) * r, h: 0.4 + ((i * 0.618) % 1) * 1.4 * (1 - r / 2.2) };
});

function EscenaCobertura({ banda, torres, modoColor }: { banda: BandaId; torres: TorreId[]; modoColor: string }) {
  const b = BANDAS_TEL.find((x) => x.id === banda) ?? BANDAS_TEL[0]!;
  const r = alcanceKm(b.mhz) * KM;
  const cub = cubiertas(b.mhz, torres);
  return (
    <group position={[-7.6, -1.6, 0]}>
      <mesh position={[16 * KM * 1.0 + 1, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[24, 24, 0.1, 72]} />
        <meshStandardMaterial color="#14301f" roughness={1} />
      </mesh>
      {CERROS.map((c, k) => (
        <mesh key={k} position={[c.x * KM, (c.h * 1) / 2 - 0.05, c.z * KM]} castShadow receiveShadow>
          <coneGeometry args={[c.r * KM, c.h, 9]} />
          <meshStandardMaterial color="#2f4a2a" roughness={0.95} flatShading />
        </mesh>
      ))}
      {EDIFICIOS.map((e, k) => (
        <mesh key={k} position={[e.x * KM, e.h / 2, e.z * KM]} castShadow>
          <boxGeometry args={[0.22, e.h, 0.22]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} emissive="#fef3c7" emissiveIntensity={0.08} />
        </mesh>
      ))}
      {LOCALIDADES.filter((l) => !l.ciudad).map((l) => {
        const on = cub.has(l.id);
        const col = on ? OK : NO;
        return (
          <group key={l.id} position={[l.x * KM, 0, l.z * KM]}>
            {Array.from({ length: l.habitantes > 2000 ? 7 : 4 }, (_, k) => (
              <group key={k} position={[Math.cos(k * 2.3) * 0.45, 0, Math.sin(k * 2.3) * 0.45]}>
                <mesh position={[0, 0.11, 0]}>
                  <boxGeometry args={[0.2, 0.22, 0.2]} />
                  <meshStandardMaterial color="#e7e5e4" roughness={0.7} />
                </mesh>
                <mesh position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
                  <coneGeometry args={[0.18, 0.16, 4]} />
                  <meshStandardMaterial color="#b45309" roughness={0.7} />
                </mesh>
              </group>
            ))}
            <mesh position={[0, 1.0, 0]}>
              <sphereGeometry args={[0.13, 14, 10]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.6} toneMapped={false} />
            </mesh>
            <Etiqueta pos={[0, 1.55, 0]} df={16} fs={12} col={`${col}cc`}>
              <i className={`fa-solid ${on ? "fa-signal" : "fa-ban"}`} style={{ color: col }} />
              {l.etq} · {num(l.habitantes)} hab.
            </Etiqueta>
          </group>
        );
      })}
      <Etiqueta pos={[-1.5 * KM, 2.4, 1 * KM]} df={16} fs={12} col="#e2e8f0aa">
        <i className="fa-solid fa-city" /> Ciudad · 250 000 hab.
      </Etiqueta>
      {TORRES.map((t) => {
        const activa = torres.includes(t.id);
        const cima = t.id === "cerro" ? 3.0 : 0;
        return (
          <group key={t.id}>
            <Torre pos={[t.x * KM, cima - 0.05, t.z * KM]} color={modoColor} fantasma={!activa} alto={2.2} />
            {activa && (
              <>
                <mesh position={[t.x * KM, 0.04, t.z * KM]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[r, 72]} />
                  <meshBasicMaterial color={modoColor} transparent opacity={0.13} depthWrite={false} />
                </mesh>
                <mesh position={[t.x * KM, 0.05, t.z * KM]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[r - 0.08, r, 96]} />
                  <meshBasicMaterial color={modoColor} transparent opacity={0.7} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
                <Onda pos={[t.x * KM, 0.06, t.z * KM]} radio={r} color={modoColor} />
              </>
            )}
            {!activa && (
              <Etiqueta pos={[t.x * KM, cima + 0.2, t.z * KM + 1.3]} df={14} fs={10.5}>
                <i className="fa-solid fa-plus" /> Sitio disponible
              </Etiqueta>
            )}
          </group>
        );
      })}
      <Etiqueta pos={[17 * KM, 0.5, -15 * KM]} df={16} fs={13} col={`${modoColor}cc`}>
        <i className="fa-solid fa-tower-cell" style={{ color: modoColor }} />
        {b.etq} · alcance ≈ {num(alcanceKm(b.mhz), 1)} km
      </Etiqueta>
    </group>
  );
}

const X_MAX_EXP = 13;
function xDeDistancia(d: number): number {
  return (Math.log10(d) / Math.log10(D_MAX_M)) * X_MAX_EXP;
}

function EscenaExposicion({ banda, distanciaM, modoColor }: { banda: BandaId; distanciaM: number; modoColor: string }) {
  const b = BANDAS_TEL.find((x) => x.id === banda) ?? BANDAS_TEL[0]!;
  const dLim = distanciaLimite(b.limite);
  const S = densidadPotencia(distanciaM);
  const excede = S > b.limite;
  const persona = useRef<THREE.Group>(null);
  const px = useRef(xDeDistancia(distanciaM));
  const arcos = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    px.current += (xDeDistancia(distanciaM) - px.current) * suave(dt, 0.12);
    if (persona.current) persona.current.position.x = px.current;
    if (arcos.current)
      arcos.current.children.forEach((c, k) => {
        const f = (clock.elapsedTime * 0.45 + k / 5) % 1;
        c.position.x = 0.3 + f * X_MAX_EXP;
        const s = 0.6 + f * 3.0;
        c.scale.set(s, s, s);
        const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
        m.opacity = 0.75 * (1 - f);
      });
  });
  const ticks = [1, 3, 10, 30, 100, 300];
  const xl = xDeDistancia(Math.max(1, dLim));
  return (
    <group position={[-5.8, -1.8, 0]}>
      <mesh position={[X_MAX_EXP / 2, -0.06, 0]} receiveShadow>
        <boxGeometry args={[X_MAX_EXP + 3, 0.1, 5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      {/* Zona donde se rebasa el límite */}
      <mesh position={[xl / 2 - 0.5, 0.01, 0]}>
        <boxGeometry args={[xl + 1, 0.02, 2.2]} />
        <meshStandardMaterial color={NO} emissive={NO} emissiveIntensity={0.5} transparent opacity={0.45} />
      </mesh>
      <mesh position={[xl + (X_MAX_EXP - xl) / 2, 0.01, 0]}>
        <boxGeometry args={[X_MAX_EXP - xl, 0.02, 2.2]} />
        <meshStandardMaterial color={OK} emissive={OK} emissiveIntensity={0.25} transparent opacity={0.22} />
      </mesh>
      {ticks.map((d) => (
        <group key={d} position={[xDeDistancia(d), 0, 1.3]}>
          <mesh>
            <boxGeometry args={[0.04, 0.05, 0.4]} />
            <meshBasicMaterial color="#e2e8f0" />
          </mesh>
          <Etiqueta pos={[0, 0, 0.55]} df={12} fs={10}>
            {d} m
          </Etiqueta>
        </group>
      ))}
      {/* Mástil con la antena */}
      <mesh position={[-0.5, 1.2, 0]} castShadow>
        <boxGeometry args={[0.12, 2.4, 0.12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.3, 1.9, 0]} castShadow>
        <boxGeometry args={[0.14, 1.0, 0.36]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      {/* Haz principal de la antena */}
      <mesh position={[X_MAX_EXP / 2, 1.9, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[1.6, X_MAX_EXP + 0.6, 32, 1, true]} />
        <meshBasicMaterial color={modoColor} transparent opacity={0.06} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <group ref={arcos} position={[0, 1.9, 0]}>
        {Array.from({ length: 5 }, (_, k) => (
          <mesh key={k} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.35, 0.03, 8, 40, Math.PI * 0.7]} />
            <meshBasicMaterial color={modoColor} transparent opacity={0.6} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group ref={persona} position={[xDeDistancia(distanciaM), 0, 0]}>
        <Persona pos={[0, 0, 0]} color={excede ? NO : "#38bdf8"} escala={1.3} />
        <Etiqueta pos={[0, 2.35, 0]} df={10} fs={12} col={`${excede ? NO : OK}cc`}>
          <i className="fa-solid fa-person" style={{ color: excede ? NO : OK }} />
          {num(distanciaM, distanciaM < 10 ? 1 : 0)} m · S = {S >= 0.01 ? num(S, S < 1 ? 3 : 2) : cient(S, 1)} W/m² · {num((S / b.limite) * 100, S / b.limite < 0.1 ? 2 : 0)} % del límite
        </Etiqueta>
      </group>
      <Etiqueta pos={[xl, 0.55, -1.4]} df={11} fs={10.5} col={`${NO}aa`}>
        Límite ICNIRP {num(b.limite, 1)} W/m² a {num(dLim, 1)} m
      </Etiqueta>
      <Etiqueta pos={[1.2, 3.1, 0]} df={11} fs={10.5} col={`${modoColor}aa`}>
        <i className="fa-solid fa-tower-cell" style={{ color: modoColor }} /> Antena {b.etq} · haz principal
      </Etiqueta>
    </group>
  );
}

const MANZANAS: { x: number; z: number; h: number }[] = (() => {
  const out: { x: number; z: number; h: number }[] = [];
  for (let i = -5; i <= 5; i++)
    for (let j = -4; j <= 4; j++) {
      const x = i * 0.7;
      const z = j * 0.7;
      if (Math.hypot(x, z * 1.1) < 3.9) out.push({ x, z, h: 0.12 + ((Math.abs(i * 7 + j * 13) % 10) / 10) * 0.5 });
    }
  return out;
})();

function EscenaRastreo({ antenas, telefono, modoColor }: { antenas: number[]; telefono: { x: number; z: number }; modoColor: string }) {
  const manz = useRef<THREE.InstancedMesh>(null);
  const marca = useRef<THREE.Mesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const circulos = ANTENAS_RASTREO.filter((a) => antenas.includes(a.id)).map((a) => ({ x: a.x, z: a.z, r: Math.hypot(telefono.x - a.x, telefono.z - a.z) }));
  const candidatos = circulos.length === 2 ? interseccionCirculos(circulos[0]!, circulos[1]!) : [];
  const ubicado = circulos.length === 3;
  useFrame(({ clock }) => {
    if (manz.current) {
      MANZANAS.forEach((m, i) => {
        obj.position.set(m.x, m.h / 2, m.z);
        obj.rotation.set(0, 0, 0);
        obj.scale.set(0.5, m.h, 0.5);
        obj.updateMatrix();
        manz.current!.setMatrixAt(i, obj.matrix);
      });
      manz.current.instanceMatrix.needsUpdate = true;
    }
    if (marca.current) marca.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 5) * 0.2);
  });
  return (
    <group position={[0, -1.4, 0]}>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[5.4, 5.4, 0.1, 64]} />
        <meshStandardMaterial color="#111c2e" roughness={0.9} />
      </mesh>
      <instancedMesh ref={manz} args={[G_CAJA, undefined, MANZANAS.length]} castShadow>
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </instancedMesh>
      {ANTENAS_RASTREO.map((a) => {
        const on = antenas.includes(a.id);
        return (
          <group key={a.id}>
            <Torre pos={[a.x, 0, a.z]} alto={1.6} color={modoColor} fantasma={!on} />
            <Etiqueta pos={[a.x, 2.15, a.z]} df={11} fs={10.5} col={on ? `${modoColor}aa` : undefined}>
              Antena {a.id + 1}
            </Etiqueta>
          </group>
        );
      })}
      {circulos.map((c, k) => (
        <mesh key={k} position={[c.x, 0.7, c.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(0.01, c.r - INCERTIDUMBRE_KM), c.r + INCERTIDUMBRE_KM, 128]} />
          <meshBasicMaterial color={modoColor} transparent opacity={0.75} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
      {/* El celular (su dueño no sabe que lo están ubicando) */}
      <group position={[telefono.x, 0.75, telefono.z]}>
        <mesh>
          <boxGeometry args={[0.12, 0.22, 0.03]} />
          <meshStandardMaterial color="#0f172a" emissive="#e0f2fe" emissiveIntensity={0.9} />
        </mesh>
      </group>
      {candidatos.map((c, k) => (
        <group key={k} position={[c.x, 0.75, c.z]}>
          <mesh>
            <sphereGeometry args={[0.1, 14, 10]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
          <Etiqueta pos={[0, 0.5, 0]} df={11} fs={10.5} col="#fbbf24aa">
            ¿Aquí?
          </Etiqueta>
        </group>
      ))}
      {ubicado && (
        <group position={[telefono.x, 0.72, telefono.z]}>
          <mesh ref={marca} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.16, 0.24, 32]} />
            <meshBasicMaterial color={NO} transparent opacity={0.95} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          <Etiqueta pos={[0, 0.75, 0]} df={10} fs={12} col={`${NO}cc`}>
            <i className="fa-solid fa-location-crosshairs" style={{ color: NO }} />
            Ubicado · ± {num(INCERTIDUMBRE_KM * 1000)} m
          </Etiqueta>
        </group>
      )}
      {circulos.length === 1 && (
        <Etiqueta pos={[circulos[0]!.x, 1.5, circulos[0]!.z - circulos[0]!.r]} df={11} fs={10.5} col={`${modoColor}aa`}>
          En algún punto de este círculo
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function FisionNuclearScene(p: FisionSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const sub = vista === "energia" ? p.subEnergia : vista === "telecom" ? p.subTelecom : "";
  const cam = useMemo((): { pos: Pt; target: Pt; min: number; max: number } => {
    if (vista === "reactor") return { pos: [3.4, 2.8, 10.6], target: [1.0, -0.2, 0], min: 4, max: 18 };
    if (vista === "energia") return sub === "fision" ? { pos: [0, 1.4, 9.6], target: [0, -0.4, -0.8], min: 4, max: 16 } : { pos: [0.9, 3.4, 9.4], target: [0.6, -0.3, 0.6], min: 4, max: 20 };
    if (vista === "residuos") return { pos: [0, 1.6, 12], target: [0, 0.0, -1.5], min: 4, max: 20 };
    if (sub === "cobertura") return { pos: [0, 13, 15], target: [0, -1.5, 0], min: 6, max: 34 };
    if (sub === "exposicion") return { pos: [0.9, 4.4, 13.6], target: [0.9, 0.4, 0], min: 5, max: 22 };
    return { pos: [0, 6.2, 7.4], target: [0, -0.6, 0], min: 4, max: 16 };
  }, [vista, sub]);

  return (
    <Canvas key={`${vista}-${sub}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 22, 55]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 9, 6]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, 3, 5]} intensity={0.4} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "reactor" && (
        <EscenaReactor p={p.p} k={p.k} barras={p.barras} vacios={p.vacios} tipo={p.tipo} scram={p.scram} agua={p.agua} bombas={p.bombas} ebullicion={p.ebullicion} modoColor={modoColor} />
      )}
      {vista === "energia" && p.subEnergia === "fision" && <EscenaFision key={p.disparo} disparo={p.disparo} modoColor={modoColor} />}
      {vista === "energia" && p.subEnergia === "combustible" && <EscenaCombustible key={`${p.demanda}-${p.revelado}`} demanda={p.demanda} revelado={p.revelado} modoColor={modoColor} />}
      {vista === "residuos" && <EscenaResiduos tAnios={p.tAnios} isotopo={p.isotopo} modoColor={modoColor} />}
      {vista === "telecom" && p.subTelecom === "cobertura" && <EscenaCobertura banda={p.banda} torres={p.torres} modoColor={modoColor} />}
      {vista === "telecom" && p.subTelecom === "exposicion" && <EscenaExposicion banda={p.banda} distanciaM={p.distanciaM} modoColor={modoColor} />}
      {vista === "telecom" && p.subTelecom === "rastreo" && <EscenaRastreo antenas={p.antenas} telefono={p.telefono} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={cam.min} maxDistance={cam.max} maxPolarAngle={Math.PI * 0.48} minPolarAngle={Math.PI * 0.05} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.35} luminanceThreshold={0.62} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.65} />
      </EffectComposer>
    </Canvas>
  );
}
