"use client";

/**
 * Escena 3D del laboratorio "Centros de datos y la huella de la nube" (CD-I-P03).
 * Tres vistas:
 *
 *  - centro: una sala de servidores en corte (dos filas de racks con pasillo
 *    frío y caliente, aire que circula) y su patio de enfriamiento, que cambia
 *    con el sistema elegido: torres que echan vapor, enfriadoras con
 *    ventiladores o muros de aire exterior con paneles húmedos. Un tanque
 *    muestra el agua que se repone y una línea eléctrica la energía total.
 *  - huella: un celular en su base con cinco apps; al vivir el día salen
 *    paquetes de datos de colores hacia los servidores de la empresa, la red
 *    de anunciantes y un corredor de datos, con contadores reales.
 *  - brecha: cuatro plazas con veinte personas cada una frente a la oficina
 *    de un programa; al lanzar el trámite cada persona se colorea según lo
 *    que la dejó fuera. Las medidas elegidas aparecen como objetos.
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
  type Enfriamiento,
  type AppId,
  type Permisos,
  type Destino,
  type Politica,
  type GrupoId,
  type Barrera,
  ENFRIAMIENTO_DEF,
  enfriamiento,
  pueInstantaneo,
  T_RECOM_MAX,
  IT_MAX,
  APPS,
  APPS_ORDEN,
  DESTINO_DEF,
  TIPO_DATO_COLOR,
  eventosDia,
  T_DIA,
  momentoEnHora,
  GRUPOS,
  GRUPOS_ORDEN,
  BARRERA_DEF,
  resultados,
  repartir,
  PERSONAS_POR_GRUPO,
  num,
  clamp,
} from "./centro-datos-data";

export type VistaCentro = "centro" | "huella" | "brecha";

export interface CentroDatosSceneProps {
  vista: VistaCentro;
  modoColor: string;
  resetNonce: number;
  // Centro
  tipo: Enfriamiento;
  tExt: number;
  tSet: number;
  itMW: number;
  // Huella
  permisos: Record<AppId, Permisos>;
  appSel: AppId;
  /** Cambia cada vez que se inicia un día; 0 = sin día en curso. */
  diaNonce: number;
  // Brecha
  politicas: Politica[];
  lanzado: boolean;
}

type Pt = [number, number, number];


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

/* ── Geometrías compartidas ───────────────────────────────────────────── */
const GEO_CAJA = new THREE.BoxGeometry(1, 1, 1);
const GEO_ESFERA = new THREE.SphereGeometry(1, 10, 8);
const GEO_CUERPO = new THREE.CapsuleGeometry(0.13, 0.36, 4, 10);
const GEO_CABEZA = new THREE.SphereGeometry(0.12, 12, 10);

/* ════════════════════════════════════════════════════════════════════════
 * 1. DENTRO DE LA NUBE
 * ════════════════════════════════════════════════════════════════════════ */

const RACKS_POR_FILA = 8;
const PASO_RACK = 0.62;
const X0_RACK = -4.4;
const Z_FILA = 1.1;
const N_FRIO = 90;
const N_CALIENTE = 90;
const X_PATIO = 3.6;

function posRack(i: number): Pt {
  const fila = i < RACKS_POR_FILA ? -1 : 1;
  const k = i % RACKS_POR_FILA;
  return [X0_RACK + k * PASO_RACK, 0.95, fila * Z_FILA];
}

function SalaServidores({ itMW, tSet, modoColor }: { itMW: number; tSet: number; modoColor: string }) {
  const racks = useRef<THREE.InstancedMesh>(null);
  const leds = useRef<THREE.InstancedMesh>(null);
  const frio = useRef<THREE.InstancedMesh>(null);
  const caliente = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const encendidos = Math.round((itMW / IT_MAX) * RACKS_POR_FILA * 2);
  const calor = tSet > T_RECOM_MAX;
  const tFrio = useRef(0);
  const semillas = useMemo(
    () =>
      Array.from({ length: Math.max(N_FRIO, N_CALIENTE) }, (_, i) => ({
        k: i % RACKS_POR_FILA,
        fila: i % 2 === 0 ? -1 : 1,
        y: 0.25 + ((i * 0.618) % 1) * 1.4,
        fase: (i * 0.377) % 1,
      })),
    [],
  );

  useFrame(({ clock }, dt) => {
    const vel = 0.25 + (itMW / IT_MAX) * 0.55;
    tFrio.current += dt * vel;
    const rm = racks.current;
    const lm = leds.current;
    if (rm && lm) {
      for (let i = 0; i < RACKS_POR_FILA * 2; i++) {
        const [x, y, z] = posRack(i);
        obj.position.set(x, y, z);
        obj.rotation.set(0, 0, 0);
        obj.scale.set(0.54, 1.9, 0.9);
        obj.updateMatrix();
        rm.setMatrixAt(i, obj.matrix);
        const on = (i % RACKS_POR_FILA) * 2 + (i < RACKS_POR_FILA ? 0 : 1) < encendidos;
        for (let l = 0; l < 6; l++) {
          const j = i * 6 + l;
          const frente = i < RACKS_POR_FILA ? 1 : -1;
          obj.position.set(x - 0.14 + (l % 2) * 0.28, 0.3 + Math.floor(l / 2) * 0.55 + 0.1, z + frente * 0.46);
          obj.scale.set(0.12, 0.03, 0.01);
          obj.updateMatrix();
          lm.setMatrixAt(j, obj.matrix);
          const parpadeo = 0.5 + 0.5 * Math.sin(clock.elapsedTime * (3 + ((j * 7) % 5)) + j);
          if (!on) col.set("#1e293b");
          else if (calor) col.setRGB(1, 0.35 + 0.25 * parpadeo, 0.1);
          else col.setRGB(0.1, 0.65 + 0.35 * parpadeo, 0.55);
          lm.setColorAt(j, col);
        }
      }
      rm.instanceMatrix.needsUpdate = true;
      lm.instanceMatrix.needsUpdate = true;
      if (lm.instanceColor) lm.instanceColor.needsUpdate = true;
    }
    const fm = frio.current;
    if (fm) {
      semillas.slice(0, N_FRIO).forEach((s, i) => {
        const p = (tFrio.current + s.fase) % 1;
        const [x] = posRack(s.k);
        // Sube del piso del pasillo frío y entra al frente del rack.
        const sube = Math.min(1, p / 0.55);
        const entra = Math.max(0, (p - 0.55) / 0.45);
        obj.position.set(x + Math.sin(i) * 0.18, 0.05 + sube * s.y, s.fila * entra * (Z_FILA - 0.4));
        obj.scale.setScalar(0.05 * (1 - entra * 0.5));
        obj.updateMatrix();
        fm.setMatrixAt(i, obj.matrix);
      });
      fm.instanceMatrix.needsUpdate = true;
    }
    const cm = caliente.current;
    if (cm) {
      semillas.slice(0, N_CALIENTE).forEach((s, i) => {
        const p = (tFrio.current * 0.8 + s.fase) % 1;
        const [x, , zr] = posRack(s.fila < 0 ? s.k : s.k + RACKS_POR_FILA);
        const zSal = zr + s.fila * 0.62;
        // Sale por detrás, sube al plenum y viaja al patio de enfriamiento.
        const sube = Math.min(1, p / 0.4);
        const viaja = Math.max(0, (p - 0.4) / 0.6);
        const y = s.y + sube * (2.55 - s.y);
        obj.position.set(x + viaja * (X_PATIO - 0.8 - x), y, zSal * (1 - viaja) + viaja * 0);
        obj.scale.setScalar(0.04);
        obj.updateMatrix();
        cm.setMatrixAt(i, obj.matrix);
      });
      cm.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Piso técnico con rejillas en el pasillo frío */}
      <mesh position={[-2.3, -0.03, 0]} receiveShadow>
        <boxGeometry args={[6.2, 0.06, 4.6]} />
        <meshStandardMaterial color="#1b2638" roughness={0.85} />
      </mesh>
      {Array.from({ length: RACKS_POR_FILA }, (_, k) => (
        <mesh key={k} position={[X0_RACK + k * PASO_RACK, 0.005, 0]}>
          <boxGeometry args={[0.5, 0.01, 0.5]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.35} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Muro trasero y lateral (corte) */}
      <mesh position={[-2.3, 1.45, -2.3]} receiveShadow>
        <boxGeometry args={[6.2, 2.9, 0.1]} />
        <meshStandardMaterial color="#223047" roughness={0.9} />
      </mesh>
      <mesh position={[-5.4, 1.45, 0]} receiveShadow>
        <boxGeometry args={[0.1, 2.9, 4.6]} />
        <meshStandardMaterial color="#1c283c" roughness={0.9} />
      </mesh>
      {/* Plenum de retorno de aire caliente */}
      <mesh position={[-1.4, 2.6, 0]}>
        <boxGeometry args={[8.0, 0.35, 3.6]} />
        <meshStandardMaterial color="#334155" transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <instancedMesh ref={racks} args={[GEO_CAJA, undefined, RACKS_POR_FILA * 2]} castShadow>
        <meshStandardMaterial color="#0f172a" metalness={0.55} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={leds} args={[GEO_CAJA, undefined, RACKS_POR_FILA * 2 * 6]}>
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={frio} args={[GEO_ESFERA, undefined, N_FRIO]} frustumCulled={false}>
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.85} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={caliente} args={[GEO_ESFERA, undefined, N_CALIENTE]} frustumCulled={false}>
        <meshBasicMaterial color={calor ? "#ef4444" : "#fb923c"} transparent opacity={0.8} toneMapped={false} />
      </instancedMesh>
      <Etiqueta pos={[-2.2, 0.08, 2.75]} df={11} col={calor ? "#ef4444aa" : `${modoColor}aa`} fs={11}>
        <i className="fa-solid fa-temperature-arrow-down" style={{ color: calor ? "#fca5a5" : "#7dd3fc" }} />
        Pasillo frío: {tSet} °C{calor ? " · fuera del rango recomendado" : ""}
      </Etiqueta>
      <Etiqueta pos={[-2.2, 3.15, -1.4]} df={11} fs={10.5} col="#fb923caa">
        <i className="fa-solid fa-temperature-arrow-up" style={{ color: "#fdba74" }} />
        Aire caliente ≈ {tSet + 12} °C hacia el enfriamiento
      </Etiqueta>
    </group>
  );
}

const N_VAPOR = 70;
const ADIAB_X = [-0.1, 1.8];
const ADIAB_Z = 0.1;

function PatioEnfriamiento({ tipo, tExt, tSet, itMW }: { tipo: Enfriamiento; tExt: number; tSet: number; itMW: number }) {
  const est = enfriamiento(tipo, tExt, tSet);
  const aguaM3h = (itMW * est.litrosPorMWh) / 1000;
  const vapor = useRef<THREE.InstancedMesh>(null);
  const aspas = useRef<THREE.Group>(null);
  const nivel = useRef<THREE.Mesh>(null);
  const flujo = useRef(0);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const semillas = useMemo(
    () =>
      Array.from({ length: N_VAPOR }, (_, i) => ({
        torre: i % 2,
        x: Math.sin(i * 12.9898) * 0.35,
        z: Math.cos(i * 78.233) * 0.35,
        fase: (i * 0.618) % 1,
      })),
    [],
  );
  // Intensidad visual del agua y de los ventiladores.
  const fAgua = clamp(aguaM3h / 120, 0, 1);
  const fVent = clamp(est.enfr / 0.35, 0.15, 1);

  useFrame(({ clock }, dt) => {
    flujo.current += dt;
    const vm = vapor.current;
    if (vm) {
      semillas.forEach((s, i) => {
        const p = (clock.elapsedTime * 0.28 + s.fase) % 1;
        if (tipo === "torre") {
          // Penacho de vapor sobre cada torre.
          obj.position.set(X_PATIO + (s.torre ? 1.55 : 0) + s.x * (1 + p), 2.35 + p * 2.0, -1.1 + s.z * (1 + p));
          obj.scale.setScalar(fAgua > 0.01 ? (0.07 + p * 0.2) * (0.5 + fAgua * 0.6) : 0.0001);
        } else {
          // Gotas que escurren por los paneles húmedos (el aire humedecido entra a la sala: no hay penacho).
          const q = (clock.elapsedTime * 0.7 + s.fase) % 1;
          obj.position.set(X_PATIO + ADIAB_X[s.torre]! + s.x * 1.5, 1.8 - q * 1.6, ADIAB_Z + 0.76);
          obj.scale.setScalar(tipo === "adiabatico" && est.litrosPorMWh > 0 ? 0.035 : 0.0001);
        }
        obj.updateMatrix();
        vm.setMatrixAt(i, obj.matrix);
      });
      vm.instanceMatrix.needsUpdate = true;
    }
    if (aspas.current) aspas.current.children.forEach((c, k) => (c.rotation.y += dt * (4 + 14 * fVent) * (k % 2 ? 1 : -1)));
    if (nivel.current) {
      // El tanque baja al reponer agua y se vuelve a llenar de forma cíclica.
      const ciclo = fAgua > 0.01 ? (flujo.current * (0.05 + fAgua * 0.25)) % 1 : 0;
      const h = 1.3 * (1 - ciclo * 0.7);
      nivel.current.scale.y = Math.max(0.02, h);
      nivel.current.position.y = 0.1 + h / 2;
    }
  });

  return (
    <group>
      <mesh position={[X_PATIO + 0.9, -0.03, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.06, 4.6]} />
        <meshStandardMaterial color="#1f2a37" roughness={0.95} />
      </mesh>
      {tipo === "torre" && (
        <group>
          {[0, 1.55].map((dx, k) => (
            <group key={k} position={[X_PATIO + dx, 0, -1.1]}>
              <mesh position={[0, 1.1, 0]} castShadow>
                <cylinderGeometry args={[0.55, 0.72, 2.2, 24, 1, true]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.6} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 2.22, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.06, 24]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
            </group>
          ))}
          <group ref={aspas}>
            {[0, 1.55].map((dx, k) => (
              <mesh key={k} position={[X_PATIO + dx, 2.28, -1.1]}>
                <boxGeometry args={[0.9, 0.03, 0.12]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            ))}
          </group>
          {/* Enfriadoras */}
          {[0, 1.2].map((dx) => (
            <mesh key={dx} position={[X_PATIO + dx, 0.4, 1.1]} castShadow>
              <boxGeometry args={[1.0, 0.8, 0.8]} />
              <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[X_PATIO + 0.8, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 2.2, 10]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.4} />
          </mesh>
        </group>
      )}
      {tipo === "seco" && (
        <group>
          {[-1.1, 0, 1.1].map((dz) => (
            <group key={dz} position={[X_PATIO + 0.8, 0, dz]}>
              <mesh position={[0, 0.55, 0]} castShadow>
                <boxGeometry args={[2.4, 0.9, 0.9]} />
                <meshStandardMaterial color="#64748b" metalness={0.45} roughness={0.35} />
              </mesh>
              {[-0.8, 0, 0.8].map((dx) => (
                <mesh key={dx} position={[dx, 1.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.3, 0.03, 8, 24]} />
                  <meshStandardMaterial color="#1e293b" />
                </mesh>
              ))}
            </group>
          ))}
          <group ref={aspas}>
            {[-1.1, 0, 1.1].flatMap((dz) =>
              [-0.8, 0, 0.8].map((dx) => (
                <mesh key={`${dz}-${dx}`} position={[X_PATIO + 0.8 + dx, 1.02, dz]}>
                  <boxGeometry args={[0.56, 0.02, 0.09]} />
                  <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
                </mesh>
              )),
            )}
          </group>
        </group>
      )}
      {tipo === "adiabatico" && (
        <group>
          {ADIAB_X.map((dx) => (
            <group key={dx} position={[X_PATIO + dx, 0, ADIAB_Z]}>
              <mesh position={[0, 1.0, 0]} castShadow>
                <boxGeometry args={[1.6, 2.0, 1.4]} />
                <meshStandardMaterial color="#475569" metalness={0.3} roughness={0.5} />
              </mesh>
              {/* Paneles húmedos: se iluminan cuando evaporan */}
              <mesh position={[0, 1.0, 0.71]}>
                <boxGeometry args={[1.2, 1.6, 0.03]} />
                <meshStandardMaterial color={est.litrosPorMWh > 0 ? "#38bdf8" : "#94a3b8"} emissive={est.litrosPorMWh > 0 ? "#0ea5e9" : "#000"} emissiveIntensity={est.litrosPorMWh > 0 ? 0.7 : 0} />
              </mesh>
              {Array.from({ length: 6 }, (_, k) => (
                <mesh key={k} position={[0, 0.35 + k * 0.26, 0.74]}>
                  <boxGeometry args={[1.25, 0.04, 0.02]} />
                  <meshStandardMaterial color="#1e293b" />
                </mesh>
              ))}
            </group>
          ))}
          <group ref={aspas}>
            {ADIAB_X.map((dx) => (
              <mesh key={dx} position={[X_PATIO + dx, 2.03, ADIAB_Z]}>
                <boxGeometry args={[0.9, 0.03, 0.12]} />
                <meshStandardMaterial color="#e2e8f0" />
              </mesh>
            ))}
          </group>
        </group>
      )}
      <instancedMesh ref={vapor} args={[GEO_ESFERA, undefined, N_VAPOR]} frustumCulled={false}>
        <meshBasicMaterial color={tipo === "torre" ? "#e2e8f0" : "#7dd3fc"} transparent opacity={tipo === "torre" ? 0.1 : 0.9} depthWrite={false} toneMapped={false} />
      </instancedMesh>
      {/* Tanque de agua de reposición */}
      <group position={[X_PATIO + 2.45, 0, 1.55]}>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 1.5, 24, 1, true]} />
          <meshStandardMaterial color="#e2e8f0" transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh ref={nivel} position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 1, 24]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.3} transparent opacity={0.85} />
        </mesh>
      </group>
      <Etiqueta pos={[X_PATIO + 0.3, 3.3, 0.2]} df={10} col="#38bdf8aa" fs={12}>
        <i className={`fa-solid ${ENFRIAMIENTO_DEF[tipo].icono}`} style={{ color: "#7dd3fc" }} />
        {ENFRIAMIENTO_DEF[tipo].corto} · {est.regimen === "libre" ? "enfriamiento libre" : est.regimen === "evaporativo" ? "evaporando agua" : est.regimen === "mixto" ? "apoyo del compresor" : "compresor"} · afuera {tExt} °C
      </Etiqueta>
      <Etiqueta pos={[X_PATIO + 2.45, 1.95, 1.55]} df={10} col="#0ea5e9aa" fs={11}>
        <i className="fa-solid fa-droplet" style={{ color: "#38bdf8" }} />
        {num(aguaM3h, 1)} m³/h
      </Etiqueta>
    </group>
  );
}

const POSTE_A: Pt = [-5.9, 3.55, 2.6];
const POSTE_B: Pt = [-5.42, 2.7, 1.2];

function LineaElectrica({ itMW, pue }: { itMW: number; pue: number }) {
  const puntos = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const t = useRef(0);
  const N = 14;
  const cable = useMemo(() => {
    const a = new THREE.Vector3(...POSTE_A);
    const b = new THREE.Vector3(...POSTE_B);
    const o = new THREE.Object3D();
    o.position.copy(a).add(b).multiplyScalar(0.5);
    o.lookAt(b);
    o.rotateX(Math.PI / 2);
    return { pos: o.position.toArray() as Pt, rot: [o.rotation.x, o.rotation.y, o.rotation.z] as Pt, largo: a.distanceTo(b) };
  }, []);
  useFrame((_, dt) => {
    t.current += dt * (0.2 + ((itMW * pue) / (IT_MAX * 1.4)) * 0.9);
    const m = puntos.current;
    if (!m) return;
    for (let i = 0; i < N; i++) {
      const p = (t.current + i / N) % 1;
      obj.position.set(POSTE_A[0] + (POSTE_B[0] - POSTE_A[0]) * p, POSTE_A[1] + (POSTE_B[1] - POSTE_A[1]) * p, POSTE_A[2] + (POSTE_B[2] - POSTE_A[2]) * p);
      obj.scale.setScalar(0.045);
      obj.updateMatrix();
      m.setMatrixAt(i, obj.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <mesh position={[POSTE_A[0], POSTE_A[1] / 2, POSTE_A[2]]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, POSTE_A[1], 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={cable.pos} rotation={cable.rot}>
        <cylinderGeometry args={[0.012, 0.012, cable.largo, 6]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <instancedMesh ref={puntos} args={[GEO_ESFERA, undefined, N]} frustumCulled={false}>
        <meshBasicMaterial color="#facc15" toneMapped={false} />
      </instancedMesh>
      <Etiqueta pos={[POSTE_B[0] + 1.1, POSTE_B[1] + 0.75, POSTE_B[2]]} df={10} col="#facc15aa" fs={11}>
        <i className="fa-solid fa-bolt" style={{ color: "#facc15" }} />
        {num(itMW * pue, 1)} MW de la red
      </Etiqueta>
    </group>
  );
}

function EscenaCentro({ tipo, tExt, tSet, itMW, modoColor }: { tipo: Enfriamiento; tExt: number; tSet: number; itMW: number; modoColor: string }) {
  const pue = pueInstantaneo(tipo, tExt, tSet);
  const sol = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (sol.current) sol.current.scale.setScalar(0.5 + ((tExt - 4) / 32) * 0.5 + Math.sin(clock.elapsedTime * 2) * 0.02);
  });
  const colSol = tExt >= 28 ? "#f97316" : tExt >= 18 ? "#facc15" : "#bae6fd";
  return (
    <group position={[0, -1.3, 0]}>
      <mesh position={[0, -0.09, 0]} receiveShadow>
        <cylinderGeometry args={[8.5, 8.5, 0.1, 64]} />
        <meshStandardMaterial color="#0d1726" roughness={0.95} />
      </mesh>
      <SalaServidores itMW={itMW} tSet={tSet} modoColor={modoColor} />
      <PatioEnfriamiento tipo={tipo} tExt={tExt} tSet={tSet} itMW={itMW} />
      <LineaElectrica itMW={itMW} pue={pue} />
      <mesh ref={sol} position={[7.6, 2.4, -3.4]}>
        <sphereGeometry args={[0.6, 24, 16]} />
        <meshBasicMaterial color={colSol} toneMapped={false} />
      </mesh>
      <Etiqueta pos={[-1.4, 4.3, -1.6]} df={9} col={`${modoColor}aa`} fs={15}>
        <i className="fa-solid fa-gauge-high" style={{ color: modoColor }} />
        PUE ahora: {num(pue, 2)}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. TU HUELLA DE DATOS
 * ════════════════════════════════════════════════════════════════════════ */

const N_VUELOS = 240;
const DESTINOS: Destino[] = ["empresa", "anunciantes", "corredor"];
const POS_DESTINO: Record<Destino, Pt> = { empresa: [-3.9, 0, -2.6], anunciantes: [0, 0, -4.2], corredor: [3.9, 0, -2.6] };
const T_VUELO = 1.1;
const ORIGEN: Pt = [0, 2.1, 0.2];

function Edificio({ d }: { d: Destino }) {
  const [x, , z] = POS_DESTINO[d];
  const col = DESTINO_DEF[d].color;
  return (
    <group position={[x, 0, z]} rotation={[0, -x * 0.12, 0]}>
      {d === "empresa" && (
        <>
          {[-0.45, 0.45].map((dx) => (
            <mesh key={dx} position={[dx, 1.2, 0]} castShadow>
              <boxGeometry args={[0.7, 2.4, 0.9]} />
              <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.35} />
            </mesh>
          ))}
          {Array.from({ length: 10 }, (_, k) => (
            <mesh key={k} position={[k % 2 ? 0.45 : -0.45, 0.3 + Math.floor(k / 2) * 0.45, 0.46]}>
              <boxGeometry args={[0.5, 0.05, 0.01]} />
              <meshBasicMaterial color={col} toneMapped={false} />
            </mesh>
          ))}
        </>
      )}
      {d === "anunciantes" && (
        <>
          <mesh position={[0, 0.9, 0]} castShadow>
            <boxGeometry args={[1.2, 1.8, 1.0]} />
            <meshStandardMaterial color="#1f2937" roughness={0.5} />
          </mesh>
          <mesh position={[0, 2.35, 0.1]}>
            <boxGeometry args={[2.2, 1.1, 0.08]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.55} />
          </mesh>
          <Html position={[0, 2.35, 0.16]} center distanceFactor={9} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ width: 120, textAlign: "center", color: "#3b0a24", fontSize: 11, fontWeight: 900, lineHeight: 1.15 }}>
              SE SUBASTA
              <br />
              TU ATENCIÓN
            </div>
          </Html>
          {[-0.8, 0.8].map((dx) => (
            <mesh key={dx} position={[dx, 1.85, 0.1]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
          ))}
        </>
      )}
      {d === "corredor" && (
        <>
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} position={[0, 0.3 + k * 0.52, 0]} castShadow>
              <cylinderGeometry args={[0.75, 0.75, 0.42, 32]} />
              <meshStandardMaterial color="#292524" metalness={0.4} roughness={0.4} />
            </mesh>
          ))}
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} position={[0, 0.52 + k * 0.52, 0]}>
              <torusGeometry args={[0.76, 0.025, 8, 40]} />
              <meshBasicMaterial color={col} toneMapped={false} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function EscenaHuella({ permisos, appSel, diaNonce, modoColor }: { permisos: Record<AppId, Permisos>; appSel: AppId; diaNonce: number; modoColor: string }) {
  const eventos = useMemo(() => eventosDia(permisos), [permisos]);
  const vuelos = useRef<THREE.InstancedMesh>(null);
  const sol = useRef<THREE.Group>(null);
  const reloj = useRef<HTMLSpanElement>(null);
  const momento = useRef<HTMLSpanElement>(null);
  const cuentaEmpresa = useRef<HTMLSpanElement>(null);
  const cuentaAnunciantes = useRef<HTMLSpanElement>(null);
  const cuentaCorredor = useRef<HTMLSpanElement>(null);
  const t = useRef(0);
  const puntero = useRef(0);
  const slot = useRef(0);
  const conteo = useRef<Record<Destino, number>>({ empresa: 0, anunciantes: 0, corredor: 0 });
  const nacimiento = useRef<Float32Array>(new Float32Array(N_VUELOS).fill(-10));
  const destinoSlot = useRef<Uint8Array>(new Uint8Array(N_VUELOS));
  const obj = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const activo = diaNonce > 0;
  const app = APPS[appSel];

  useFrame((_, dt) => {
    if (activo) t.current += dt;
    const dur = T_DIA / 1000;
    const h = activo ? Math.min(24, (t.current / dur) * 24) : 0;
    const m = vuelos.current;
    // Lanza los envíos cuya hora ya pasó.
    while (m && activo && puntero.current < eventos.length && eventos[puntero.current]!.h <= h) {
      const e = eventos[puntero.current]!;
      const s = slot.current % N_VUELOS;
      nacimiento.current[s] = t.current;
      destinoSlot.current[s] = DESTINOS.indexOf(e.destino);
      col.set(TIPO_DATO_COLOR[e.tipo]);
      m.setColorAt(s, col);
      conteo.current[e.destino] += 1;
      slot.current += 1;
      puntero.current += 1;
    }
    if (m) {
      for (let i = 0; i < N_VUELOS; i++) {
        const edad = t.current - nacimiento.current[i]!;
        if (!activo || edad < 0 || edad > T_VUELO) {
          obj.position.set(0, -50, 0);
          obj.scale.setScalar(0.0001);
        } else {
          const p = edad / T_VUELO;
          const [dx, , dz] = POS_DESTINO[DESTINOS[destinoSlot.current[i]!]!];
          const jit = ((i * 0.618) % 1) - 0.5;
          obj.position.set(ORIGEN[0] + (dx - ORIGEN[0]) * p + jit * 0.3 * Math.sin(p * Math.PI), ORIGEN[1] + Math.sin(p * Math.PI) * 1.6 + (1.4 - ORIGEN[1]) * p, ORIGEN[2] + (dz - ORIGEN[2]) * p);
          obj.scale.setScalar(0.13 * (1 - p * 0.35));
        }
        obj.rotation.set(t.current * 3 + i, t.current * 2, 0);
        obj.updateMatrix();
        m.setMatrixAt(i, obj.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
    if (sol.current) sol.current.rotation.z = -((h - 6) / 24) * Math.PI * 2;
    if (reloj.current) {
      const hh = Math.floor(h) % 24;
      const mm = Math.floor((h - Math.floor(h)) * 60);
      reloj.current.textContent = activo ? (h >= 24 ? "24:00" : `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`) : "07:00";
    }
    if (momento.current) {
      const mo = momentoEnHora(h);
      momento.current.textContent = !activo ? "Listo para vivir el día" : h >= 24 ? "Fin del día" : h < 7 ? "Durmiendo" : mo ? mo.txt.slice(8) : "";
    }
    if (cuentaEmpresa.current) cuentaEmpresa.current.textContent = num(conteo.current.empresa);
    if (cuentaAnunciantes.current) cuentaAnunciantes.current.textContent = num(conteo.current.anunciantes);
    if (cuentaCorredor.current) cuentaCorredor.current.textContent = num(conteo.current.corredor);
  });

  const refCuenta = (d: Destino) => (d === "empresa" ? cuentaEmpresa : d === "anunciantes" ? cuentaAnunciantes : cuentaCorredor);

  return (
    <group position={[0, -1.4, 0.4]}>
      <mesh position={[0, -0.06, -1.5]} receiveShadow>
        <cylinderGeometry args={[6.4, 6.4, 0.1, 64]} />
        <meshStandardMaterial color="#120f22" roughness={0.9} />
      </mesh>
      {/* Arco del día con el sol y la luna */}
      <group position={[0, 0.2, -5.6]}>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[4.6, 0.02, 8, 96, Math.PI]} />
          <meshBasicMaterial color="#475569" transparent opacity={0.6} />
        </mesh>
        <group ref={sol}>
          <mesh position={[4.6, 0, 0]}>
            <sphereGeometry args={[0.28, 20, 14]} />
            <meshBasicMaterial color="#fde047" toneMapped={false} />
          </mesh>
          <mesh position={[-4.6, 0, 0]}>
            <sphereGeometry args={[0.2, 20, 14]} />
            <meshBasicMaterial color="#e2e8f0" toneMapped={false} />
          </mesh>
        </group>
      </group>
      {/* Base y celular */}
      <mesh position={[0, 0.1, 0.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 1.05, 0.2, 40]} />
        <meshStandardMaterial color="#1e1b2e" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.21, 0.2]}>
        <torusGeometry args={[0.95, 0.02, 8, 48]} />
        <meshBasicMaterial color={modoColor} toneMapped={false} />
      </mesh>
      <group position={[0, 1.45, 0.2]} rotation={[-0.08, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.25, 2.4, 0.12]} />
          <meshStandardMaterial color="#0b0b12" metalness={0.7} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.065]}>
          <planeGeometry args={[1.12, 2.24]} />
          <meshStandardMaterial color="#1e1b4b" emissive="#312e81" emissiveIntensity={0.5} />
        </mesh>
        {APPS_ORDEN.map((id, k) => {
          const a = APPS[id];
          const sel = id === appSel;
          return (
            <mesh key={id} position={[-0.3 + (k % 3) * 0.3, 0.2 - Math.floor(k / 3) * 0.32, 0.075]} scale={sel ? 1.15 : 1}>
              <boxGeometry args={[0.22, 0.22, 0.02]} />
              <meshStandardMaterial color={a.color} emissive={a.color} emissiveIntensity={sel ? 0.9 : 0.25} />
            </mesh>
          );
        })}
        <Html position={[0, 0.72, 0.08]} center distanceFactor={7} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ width: 150, textAlign: "center", color: "#fff", lineHeight: 1.2 }}>
            <div style={{ fontSize: 26, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
              <span ref={reloj}>07:00</span>
            </div>
            <div style={{ fontSize: 10, color: "#c7d2fe", fontWeight: 700, minHeight: 13 }}>
              <span ref={momento}>Listo para vivir el día</span>
            </div>
          </div>
        </Html>
        <Html position={[0, -0.72, 0.08]} center distanceFactor={7} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ width: 150, textAlign: "center", color: "#fff", fontSize: 11.5, fontWeight: 800, lineHeight: 1.3 }}>
            <i className={`fa-solid ${app.icono}`} style={{ color: app.color, fontSize: 16 }} />
            <div style={{ marginTop: 3 }}>{app.etq}</div>
            <div style={{ fontSize: 10, color: "#c7d2fe", marginTop: 1 }}>Sede: {app.sede}</div>
          </div>
        </Html>
      </group>
      {DESTINOS.map((d) => {
        const [x, , z] = POS_DESTINO[d];
        const def = DESTINO_DEF[d];
        return (
          <group key={d}>
            <Edificio d={d} />
            <Html position={[x, d === "anunciantes" ? 3.55 : 2.95, z]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ padding: "6px 11px", borderRadius: 12, background: "rgba(4,10,22,0.88)", border: `1px solid ${def.color}aa`, color: "#fff", textAlign: "center", whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 11, fontWeight: 800 }}>
                  <i className={`fa-solid ${def.icono}`} style={{ color: def.color, marginRight: 6 }} />
                  {def.etq}
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
                  <span ref={refCuenta(d)}>0</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}> paquetes</span>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
      <instancedMesh key={`vuelos-${diaNonce}`} ref={vuelos} args={[GEO_CAJA, undefined, N_VUELOS]} frustumCulled={false}>
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. BRECHA DIGITAL
 * ════════════════════════════════════════════════════════════════════════ */

const POS_PLAZA: Record<GrupoId, Pt> = { urbano: [-4.8, 0, 1.2], rural: [-1.6, 0, 2.2], mayores: [1.6, 0, 2.2], mayores75: [4.8, 0, 1.2] };
const N_PERSONAS = GRUPOS_ORDEN.length * PERSONAS_POR_GRUPO;

function Entorno({ g }: { g: GrupoId }) {
  const [x, , z] = POS_PLAZA[g];
  if (g === "urbano")
    return (
      <group position={[x, 0, z - 1.6]}>
        {[
          [-0.9, 1.6],
          [0, 2.3],
          [0.9, 1.3],
        ].map(([dx, h], k) => (
          <mesh key={k} position={[dx!, h! / 2, 0]} castShadow>
            <boxGeometry args={[0.7, h!, 0.7]} />
            <meshStandardMaterial color={["#334155", "#1e3a5f", "#3f3f46"][k]!} roughness={0.6} />
          </mesh>
        ))}
      </group>
    );
  if (g === "rural")
    return (
      <group position={[x, 0, z - 1.6]}>
        {[-0.8, 0.6].map((dx, k) => (
          <group key={k} position={[dx, 0, k * 0.2]}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[0.7, 0.6, 0.6]} />
              <meshStandardMaterial color="#b45309" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.78, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.58, 0.4, 4]} />
              <meshStandardMaterial color="#7c2d12" roughness={0.9} />
            </mesh>
          </group>
        ))}
        {Array.from({ length: 12 }, (_, k) => (
          <mesh key={k} position={[-1.1 + (k % 6) * 0.44, 0.3, -0.7 - Math.floor(k / 6) * 0.3]}>
            <coneGeometry args={[0.06, 0.6, 5]} />
            <meshStandardMaterial color="#65a30d" roughness={0.8} />
          </mesh>
        ))}
      </group>
    );
  return (
    <group position={[x, 0, z - 1.6]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.8, 0.9, 0.8]} />
        <meshStandardMaterial color={g === "mayores" ? "#9f1239" : "#6d28d9"} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[2.0, 0.1, 1.0]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.7} />
      </mesh>
      {[-0.55, 0.55].map((dx) => (
        <mesh key={dx} position={[dx, 0.2, 0.75]}>
          <boxGeometry args={[0.6, 0.06, 0.2]} />
          <meshStandardMaterial color="#a16207" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Antena({ pos }: { pos: Pt }) {
  const ondas = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    ondas.current?.children.forEach((c, k) => {
      const p = (clock.elapsedTime * 0.6 + k / 3) % 1;
      c.scale.setScalar(0.2 + p * 1.2);
      const mat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = 0.7 * (1 - p);
    });
  });
  return (
    <group position={pos}>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 1.6, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} />
      </mesh>
      <group ref={ondas} position={[0, 1.65, 0]}>
        {[0, 1, 2].map((k) => (
          <mesh key={k} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.4, 0.015, 6, 32]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function EscenaBrecha({ politicas, lanzado, modoColor }: { politicas: Politica[]; lanzado: boolean; modoColor: string }) {
  const res = useMemo(() => resultados(politicas), [politicas]);
  const destinos = useMemo(() => {
    const out: Barrera[] = [];
    res.forEach((r) => out.push(...repartir(r, PERSONAS_POR_GRUPO)));
    return out;
  }, [res]);
  const cuerpos = useRef<THREE.InstancedMesh>(null);
  const cabezas = useRef<THREE.InstancedMesh>(null);
  const pulso = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const neutro = useMemo(() => new THREE.Color("#64748b"), []);
  const paleta = useMemo(() => Object.fromEntries(Object.entries(BARRERA_DEF).map(([k, v]) => [k, new THREE.Color(v.color)])) as Record<Barrera, THREE.Color>, []);
  const tiene = (p: Politica) => politicas.includes(p);

  useFrame(({ clock }, dt) => {
    t.current = lanzado ? t.current + dt : 0;
    const cm = cuerpos.current;
    const hm = cabezas.current;
    if (cm && hm) {
      GRUPOS_ORDEN.forEach((g, gi) => {
        const [px, , pz] = POS_PLAZA[g];
        for (let k = 0; k < PERSONAS_POR_GRUPO; k++) {
          const i = gi * PERSONAS_POR_GRUPO + k;
          const fila = Math.floor(k / 5);
          const colu = k % 5;
          const b = destinos[i] ?? "completa";
          const llega = clamp((t.current - 0.6 - (fila * 0.25 + colu * 0.08 + gi * 0.15)) / 0.5, 0, 1);
          const salto = b === "completa" && llega > 0 ? Math.abs(Math.sin(clock.elapsedTime * 3 + i)) * 0.06 * llega : 0;
          const x = px - 0.96 + colu * 0.48;
          const z = pz - 0.4 + fila * 0.42;
          obj.position.set(x, 0.3 + salto, z);
          obj.scale.setScalar(1);
          obj.updateMatrix();
          cm.setMatrixAt(i, obj.matrix);
          obj.position.set(x, 0.72 + salto, z);
          obj.updateMatrix();
          hm.setMatrixAt(i, obj.matrix);
          col.copy(neutro).lerp(paleta[b], llega);
          cm.setColorAt(i, col);
        }
      });
      cm.instanceMatrix.needsUpdate = true;
      hm.instanceMatrix.needsUpdate = true;
      if (cm.instanceColor) cm.instanceColor.needsUpdate = true;
    }
    if (pulso.current) {
      const p = lanzado ? Math.min(1, t.current / 1.2) : 0;
      pulso.current.scale.setScalar(0.2 + p * 7.5);
      (pulso.current.material as THREE.MeshBasicMaterial).opacity = lanzado ? 0.5 * (1 - p) : 0;
    }
  });

  return (
    <group position={[0, -1.3, 0]}>
      <mesh position={[0, -0.06, 0.4]} receiveShadow>
        <boxGeometry args={[14, 0.1, 8.4]} />
        <meshStandardMaterial color="#1a2418" roughness={1} />
      </mesh>
      {/* Oficina del programa con el registro en línea */}
      <group position={[0, 0, -2.6]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[2.4, 1.6, 1.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.75, 0.2]}>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <Html position={[0, 2.35, 0.26]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ width: 210, textAlign: "center", color: "#1c1917", background: modoColor, borderRadius: 10, padding: "7px 10px", boxShadow: `0 0 24px -4px ${modoColor}`, fontSize: 13, fontWeight: 900, lineHeight: 1.25 }}>
            <i className="fa-solid fa-laptop" style={{ marginRight: 6 }} />
            Registro {tiene("ventanilla") ? "en línea o en ventanilla" : "solo en línea"}
            <div style={{ fontSize: 10.5, fontWeight: 800 }}>
              {tiene("celular") ? "funciona en celular" : "requiere computadora"} · plazo {tiene("plazo") ? "30" : "5"} días
            </div>
          </div>
        </Html>
      </group>
      <mesh ref={pulso} position={[0, 0.05, -2.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1, 64]} />
        <meshBasicMaterial color={modoColor} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {tiene("ventanilla") && (
        <group position={[0, 0, -0.75]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.3, 0.9, 0.8]} />
            <meshStandardMaterial color="#e5e7eb" roughness={0.6} />
          </mesh>
          {[-0.45, -0.15, 0.15, 0.45].map((dx) => (
            <mesh key={dx} position={[dx, 0.5, 0.41]}>
              <boxGeometry args={[0.08, 0.8, 0.02]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          ))}
          <mesh position={[0, 1.02, 0]}>
            <boxGeometry args={[1.5, 0.14, 1.0]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.6} />
          </mesh>
          <Etiqueta pos={[0, 1.45, 0]} df={10} fs={10.5} col="#e5e7ebaa">
            <i className="fa-solid fa-building-columns" /> Ventanilla
          </Etiqueta>
        </group>
      )}
      {tiene("plazo") && (
        <group position={[-1.9, 0, -2.4]}>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[0.8, 0.9, 0.06]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, 1.1, 0.04]}>
            <boxGeometry args={[0.8, 0.18, 0.02]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          <Etiqueta pos={[0, 0.6, 0.1]} df={9} fs={12}>
            30 días
          </Etiqueta>
        </group>
      )}
      {tiene("celular") && (
        <group position={[1.9, 0, -2.4]}>
          <mesh position={[0, 0.75, 0]} castShadow>
            <boxGeometry args={[0.45, 0.85, 0.06]} />
            <meshStandardMaterial color="#0b0b12" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.75, 0.035]}>
            <planeGeometry args={[0.38, 0.74]} />
            <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}
      {GRUPOS_ORDEN.map((g) => {
        const [x, , z] = POS_PLAZA[g];
        const r = res.find((q) => q.grupo === g)!;
        const grupo = GRUPOS[g];
        const meta = r.completa;
        return (
          <group key={g}>
            <mesh position={[x, 0.005, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <circleGeometry args={[1.45, 48]} />
              <meshStandardMaterial color="#44403c" roughness={0.95} />
            </mesh>
            <Entorno g={g} />
            {tiene("wifi") && <Antena pos={[x + 1.35, 0, z - 0.9]} />}
            {tiene("promotores") && (
              <group position={[x - 1.35, 0, z + 0.2]}>
                <mesh position={[0, 0.34, 0]}>
                  <capsuleGeometry args={[0.15, 0.42, 4, 10]} />
                  <meshStandardMaterial color="#facc15" emissive="#a16207" emissiveIntensity={0.3} />
                </mesh>
                <mesh position={[0, 0.8, 0]}>
                  <sphereGeometry args={[0.13, 12, 10]} />
                  <meshStandardMaterial color="#f1c9a5" />
                </mesh>
              </group>
            )}
            <Html position={[x, 2.45, z - 0.5]} center distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
              <div style={{ padding: "5px 10px", borderRadius: 12, background: "rgba(4,10,22,0.88)", border: `1px solid ${lanzado ? (meta >= 0.75 ? "#34d399" : "#f87171") : "rgba(255,255,255,0.25)"}`, color: "#fff", textAlign: "center", whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 11, fontWeight: 800 }}>
                  <i className={`fa-solid ${grupo.icono}`} style={{ marginRight: 6, color: modoColor }} />
                  {grupo.etq}
                </div>
                <div style={{ fontSize: 10, color: "#cbd5e1" }}>usa internet: {num(grupo.acceso * 100, 1)} %</div>
                {lanzado && <div style={{ fontSize: 14, fontWeight: 900, color: meta >= 0.75 ? "#6ee7b7" : "#fca5a5", fontVariantNumeric: "tabular-nums" }}>completó: {num(meta * 100, 0)} %</div>}
              </div>
            </Html>
          </group>
        );
      })}
      <instancedMesh key={`cuerpos-${politicas.join("-")}`} ref={cuerpos} args={[GEO_CUERPO, undefined, N_PERSONAS]} castShadow>
        <meshStandardMaterial roughness={0.55} />
      </instancedMesh>
      <instancedMesh ref={cabezas} args={[GEO_CABEZA, undefined, N_PERSONAS]}>
        <meshStandardMaterial color="#e8b98f" roughness={0.6} />
      </instancedMesh>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function CentroDatosScene(p: CentroDatosSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "centro") return { pos: [1.2, 9.2, 12.6], target: [0.4, -0.2, 0] };
    if (vista === "huella") return { pos: [0, 5.2, 11.2], target: [0, 0.7, -1.6] };
    return { pos: [0, 9.4, 10.8], target: [0, -0.6, 0.4] };
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

      {vista === "centro" && <EscenaCentro tipo={p.tipo} tExt={p.tExt} tSet={p.tSet} itMW={p.itMW} modoColor={modoColor} />}
      {vista === "huella" && <EscenaHuella key={p.diaNonce} permisos={p.permisos} appSel={p.appSel} diaNonce={p.diaNonce} modoColor={modoColor} />}
      {vista === "brecha" && <EscenaBrecha politicas={p.politicas} lanzado={p.lanzado} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={22} maxPolarAngle={Math.PI * 0.47} minPolarAngle={Math.PI * 0.05} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.62} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.65} />
      </EffectComposer>
    </Canvas>
  );
}
