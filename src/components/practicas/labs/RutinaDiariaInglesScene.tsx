"use client";

/**
 * Escena 3D del laboratorio "Daily routines: el día de Ana" (IN-II-P01).
 * Tres vistas:
 *
 *  - dia: maqueta del barrio de Ana (casa en corte, parada del camión y
 *    escuela) con un sol que recorre el cielo de las 6:00 a las 22:00; Ana
 *    vive cada acción que el alumno narra y una línea de tiempo al frente
 *    recibe las acciones en el orden en que el alumno las coloca.
 *  - hora: un reloj de manecillas (mitad «past» y mitad «to») que se pone
 *    arrastrando la manecilla; Luis pregunta y Ana responde.
 *  - frecuencia: el calendario semanal de Ana con sus hábitos y una escala de
 *    frecuencia de 0 % a 100 %; la oración que arma el alumno flota arriba.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Adverbio, ACCIONES, HABITOS, ESCALA, DIAS_SEMANA, cuentaDias, porcentaje, adverbiosAceptados, horaDigital, hora12Texto, preguntaFrecuencia } from "./rutina-diaria-ingles-data";

export type VistaRutina = "dia" | "hora" | "frecuencia";

export interface RutinaSceneProps {
  vista: VistaRutina;
  modoColor: string;
  resetNonce: number;
  // Build a day
  /** Acciones ya colocadas en la línea de tiempo (0–9). */
  colocados: number;
  /** -1 mientras se ordena; 0–8 acción que se narra; 9 día terminado. */
  paso: number;
  /** Oración que dice la burbuja de Ana. */
  burbuja: string | null;
  // What time…?
  relojMin: number;
  pm: boolean;
  pregunta: string | null;
  respuesta: string | null;
  contexto: string | null;
  contextoIcono: string | null;
  mostrarDigital: boolean;
  arrastrable: boolean;
  onMinuto?: (m: number) => void;
  // How often?
  habitoIdx: number;
  contado: boolean;
  oracion: string;
  estadoOracion: "ok" | "mal" | null;
  adverbio: Adverbio | null;
  hechosFrec: string[];
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const WARN = "#fb923c";
const N = ACCIONES.length;

const CAJA = new THREE.BoxGeometry(1, 1, 1);
const ESFERA = new THREE.SphereGeometry(1, 20, 14);
const CILINDRO = new THREE.CylinderGeometry(1, 1, 1, 24);

function Caja({ p, s, c, rough = 0.75, metal = 0, sombra = true, rotY = 0, emis }: { p: Pt; s: Pt; c: string; rough?: number; metal?: number; sombra?: boolean; rotY?: number; emis?: number }) {
  return (
    <mesh position={p} scale={s} rotation={[0, rotY, 0]} geometry={CAJA} castShadow={sombra} receiveShadow>
      <meshStandardMaterial color={c} roughness={rough} metalness={metal} emissive={emis ? c : "#000000"} emissiveIntensity={emis ?? 0} />
    </mesh>
  );
}

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

function Burbuja({ pos, children, df = 10, ancho = 230, borde = "#ffffff", fs = 13 }: { pos: Pt; children: ReactNode; df?: number; ancho?: number; borde?: string; fs?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ position: "relative", width: ancho, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 14,
            background: "#ffffff",
            border: `2px solid ${borde}`,
            color: "#0f172a",
            fontSize: fs,
            fontWeight: 800,
            lineHeight: 1.3,
            textAlign: "center",
            boxShadow: "0 10px 24px -10px #000",
          }}
        >
          {children}
        </div>
        <div style={{ position: "absolute", bottom: -7, left: "50%", marginLeft: -7, width: 14, height: 14, background: "#fff", transform: "rotate(45deg)", borderRight: `2px solid ${borde}`, borderBottom: `2px solid ${borde}` }} />
      </div>
    </Html>
  );
}

/** Figura estilizada: cuerpo cápsula, cabeza y (opcional) cabello con coleta. */
function Figura({ camisa, coleta = false, cabello = "#2b1b12", piel = "#e8b98f" }: { camisa: string; coleta?: boolean; cabello?: string; piel?: string }) {
  return (
    <group>
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.17, 0.42, 6, 14]} />
        <meshStandardMaterial color={camisa} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.98, 0]} castShadow geometry={ESFERA} scale={0.15}>
        <meshStandardMaterial color={piel} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.02, -0.025]} geometry={ESFERA} scale={[0.158, 0.15, 0.158]}>
        <meshStandardMaterial color={cabello} roughness={0.8} />
      </mesh>
      {coleta && (
        <mesh position={[0, 0.98, -0.18]} geometry={ESFERA} scale={0.075}>
          <meshStandardMaterial color={cabello} roughness={0.8} />
        </mesh>
      )}
      {/* Ojos: dan frente a la figura */}
      {[-0.055, 0.055].map((x) => (
        <mesh key={x} position={[x, 0.99, 0.135]} geometry={ESFERA} scale={0.02}>
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      ))}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. BUILD A DAY — el barrio de Ana
 * ════════════════════════════════════════════════════════════════════════ */

type TipoPose = "pie" | "sentada" | "acostada";
interface Pose {
  pos: Pt;
  rotY: number;
  tipo: TipoPose;
}

const POSE_DORMIDA: Pose = { pos: [-6.6, 0.66, -1.9], rotY: 0, tipo: "acostada" };
const POSE_DESPIERTA: Pose = { pos: [-6.6, 0.18, -2.55], rotY: 0, tipo: "sentada" };
const POSES: Record<string, Pose> = {
  cama: POSE_DORMIDA,
  regadera: { pos: [-4.4, 0.1, -3.05], rotY: 0, tipo: "pie" },
  mesa: { pos: [-5.7, 0.02, -0.72], rotY: 0, tipo: "sentada" },
  parada: { pos: [0.2, 0.02, 2.05], rotY: 0.35, tipo: "pie" },
  escuela: { pos: [4.9, 0.02, -0.9], rotY: 0, tipo: "pie" },
  escritorio: { pos: [-2.0, 0.02, -2.5], rotY: Math.PI, tipo: "sentada" },
  sala: { pos: [-1.5, 0.02, 0.15], rotY: -Math.PI / 2, tipo: "sentada" },
};

function poseDe(paso: number): Pose {
  if (paso < 0 || paso >= N) return POSE_DORMIDA;
  const a = ACCIONES[paso]!;
  if (a.id === "wake") return POSE_DESPIERTA;
  return POSES[a.lugar] ?? POSE_DORMIDA;
}

function horaObjetivo(paso: number): number {
  if (paso < 0) return 6 * 60 + 5;
  if (paso >= N) return 22 * 60;
  return ACCIONES[paso]!.min;
}

/** 0 = pleno día · 1 = noche. */
function nocheDe(min: number): number {
  const ss = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  if (min < 12 * 60) return 1 - ss(5.8 * 60, 7.3 * 60, min);
  return ss(18.6 * 60, 20.4 * 60, min);
}

const CIELO: [number, THREE.Color][] = [
  [5 * 60, new THREE.Color("#050b1a")],
  [6.2 * 60, new THREE.Color("#3b2f4f")],
  [7.2 * 60, new THREE.Color("#6d5a7a")],
  [9 * 60, new THREE.Color("#2f6597")],
  [17 * 60, new THREE.Color("#2f6597")],
  [19 * 60, new THREE.Color("#7a4a5e")],
  [20.3 * 60, new THREE.Color("#1a1633")],
  [22 * 60, new THREE.Color("#050b1a")],
];

function colorCielo(min: number, out: THREE.Color) {
  const first = CIELO[0]!;
  const last = CIELO[CIELO.length - 1]!;
  if (min <= first[0]) return out.copy(first[1]);
  if (min >= last[0]) return out.copy(last[1]);
  for (let i = 0; i < CIELO.length - 1; i++) {
    const a = CIELO[i]!;
    const b = CIELO[i + 1]!;
    if (min >= a[0] && min <= b[0]) return out.copy(a[1]).lerp(b[1], (min - a[0]) / (b[0] - a[0]));
  }
  return out;
}

const ESTRELLAS_GEO = (() => {
  const n = 110;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (0.05 + 0.9 * ((i * 0.6180339) % 1));
    const r = 15 + ((i * 7) % 11) * 0.5;
    arr[i * 3] = -Math.cos(a) * r;
    arr[i * 3 + 1] = 2 + Math.sin(a) * r * 0.55 + ((i * 13) % 7) * 0.3;
    arr[i * 3 + 2] = -12 - ((i * 17) % 9) * 0.6;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  return g;
})();

const X_SLOT = (i: number) => -6.4 + i * 1.6;
const Z_RIEL = 5.6;
const R_ARCO = 13;

function CicloDia({ tiempoRef, paso }: { tiempoRef: RefObject<number>; paso: number }) {
  const sol = useRef<THREE.Mesh>(null);
  const luna = useRef<THREE.Mesh>(null);
  const dir = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const estrellas = useRef<THREE.PointsMaterial>(null);
  const reloj = useRef<HTMLSpanElement>(null);
  const icono = useRef<HTMLElement>(null);
  const tmp = useMemo(() => new THREE.Color(), []);
  const calido = useMemo(() => new THREE.Color("#ffb37a"), []);
  const blanco = useMemo(() => new THREE.Color("#fff6e8"), []);
  const azul = useMemo(() => new THREE.Color("#9db8ff"), []);
  useFrame((state, dt) => {
    const objetivo = horaObjetivo(paso);
    const d = objetivo - tiempoRef.current;
    // Reiniciar el día (de la noche a la madrugada) salta; avanzar corre el reloj.
    if (d < -120) tiempoRef.current = objetivo;
    else tiempoRef.current += Math.sign(d) * Math.min(Math.abs(d), Math.max(90, Math.abs(d) * 1.6) * Math.min(dt, 0.25));
    const t = tiempoRef.current;
    const noche = nocheDe(t);
    colorCielo(t, tmp);
    if (state.scene.background instanceof THREE.Color) state.scene.background.copy(tmp);
    if (state.scene.fog instanceof THREE.Fog) state.scene.fog.color.copy(tmp);
    // Sol de 6:00 (izquierda) a 20:30 (derecha); la luna sale al anochecer.
    const f = (t - 6 * 60) / (20.5 * 60 - 6 * 60);
    const a = Math.PI * (1 - f);
    if (sol.current) {
      sol.current.position.set(Math.cos(a) * R_ARCO, -1.5 + Math.sin(a) * R_ARCO * 0.72, -11);
      sol.current.visible = f > -0.02 && f < 0.95;
    }
    const fl = (t - 19.5 * 60) / (6 * 60);
    const al = Math.PI * (1 - fl);
    if (luna.current) {
      luna.current.position.set(Math.cos(al) * R_ARCO * 0.9, -1.5 + Math.sin(al) * R_ARCO * 0.6, -11.5);
      luna.current.visible = fl > 0 && fl < 1;
    }
    const alba = Math.max(0, 1 - Math.abs(t - 7 * 60) / 70) + Math.max(0, 1 - Math.abs(t - 19.3 * 60) / 70);
    if (dir.current) {
      dir.current.intensity = 0.25 + (1 - noche) * 1.05;
      dir.current.color.copy(blanco).lerp(calido, Math.min(1, alba)).lerp(azul, noche * 0.8);
      const sx = Math.cos(a) * 8;
      dir.current.position.set(noche > 0.8 ? 3 : sx, noche > 0.8 ? 8 : 4 + Math.max(0, Math.sin(a)) * 7, 5);
    }
    if (amb.current) amb.current.intensity = 0.32 + (1 - noche) * 0.33;
    if (estrellas.current) estrellas.current.opacity = noche * 0.9;
    if (reloj.current) reloj.current.textContent = horaDigital(Math.round(t / 5) * 5);
    if (icono.current) icono.current.className = `fa-solid ${noche > 0.5 ? "fa-moon" : "fa-sun"}`;
  });
  return (
    <>
      <ambientLight ref={amb} intensity={0.5} />
      <directionalLight ref={dir} position={[4, 9, 6]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-11} shadow-camera-right={11} shadow-camera-top={9} shadow-camera-bottom={-9} />
      <mesh ref={sol} geometry={ESFERA} scale={0.85}>
        <meshBasicMaterial color="#ffe6a3" toneMapped={false} />
        <mesh geometry={ESFERA} scale={1.9}>
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.16} depthWrite={false} toneMapped={false} />
        </mesh>
      </mesh>
      <mesh ref={luna} geometry={ESFERA} scale={0.55}>
        <meshBasicMaterial color="#e2e8f0" toneMapped={false} />
      </mesh>
      <points geometry={ESTRELLAS_GEO}>
        <pointsMaterial ref={estrellas} color="#ffffff" size={0.09} transparent opacity={0} depthWrite={false} />
      </points>
      <Etiqueta pos={[0, 4.4, -3.2]} df={12} col="#fbbf24aa" fs={15}>
        <i ref={icono} className="fa-solid fa-sun" style={{ color: "#fbbf24" }} />
        <span ref={reloj}>6:05 a.m.</span>
      </Etiqueta>
    </>
  );
}

function Casa({ tiempoRef, paso }: { tiempoRef: RefObject<number>; paso: number }) {
  const actual = paso >= 0 && paso < N ? ACCIONES[paso]!.id : "";
  const tv = useRef<THREE.MeshStandardMaterial>(null);
  const foco = useRef<THREE.MeshStandardMaterial>(null);
  const luzLampara = useRef<THREE.PointLight>(null);
  const luzCasa = useRef<THREE.PointLight>(null);
  const despertador = useRef<THREE.Group>(null);
  const gotas = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const noche = nocheDe(tiempoRef.current);
    if (tv.current) tv.current.emissiveIntensity = actual === "show" ? 1.1 + 0.35 * Math.sin(t * 7) * Math.sin(t * 2.3) : 0.05;
    const estudia = actual === "homework";
    if (foco.current) foco.current.emissiveIntensity = estudia || (noche > 0.5 && paso < N) ? 2.2 : 0.1;
    if (luzLampara.current) luzLampara.current.intensity = estudia ? 3 : 0;
    if (luzCasa.current) luzCasa.current.intensity = paso >= N ? 0 : noche * 6;
    if (despertador.current) despertador.current.rotation.z = actual === "wake" ? Math.sin(t * 38) * 0.18 * (Math.sin(t * 2) > 0 ? 1 : 0) : 0;
    const g = gotas.current;
    if (g) {
      for (let i = 0; i < 28; i++) {
        const p = (t * 1.6 + i * 0.137) % 1;
        const ang = i * 2.4;
        obj.position.set(-4.4 + Math.cos(ang) * 0.18 * ((i % 3) + 1) * 0.6, 1.45 - p * 1.4, -3.05 + Math.sin(ang) * 0.18 * ((i % 3) + 1) * 0.6);
        obj.scale.set(0.018, 0.06, 0.018).multiplyScalar(actual === "shower" ? 1 : 0.0001);
        obj.updateMatrix();
        g.setMatrixAt(i, obj.matrix);
      }
      g.instanceMatrix.needsUpdate = true;
    }
  });
  const pared = "#e7dcc8";
  const bajo = "#d6c7ad";
  return (
    <group>
      {/* Piso por cuartos */}
      <Caja p={[-6.3, 0.04, -2.6]} s={[2.2, 0.08, 2.4]} c="#8a6a4f" sombra={false} />
      <Caja p={[-4.4, 0.04, -2.6]} s={[1.6, 0.08, 2.4]} c="#9fb7c4" sombra={false} />
      <Caja p={[-2.2, 0.04, -2.6]} s={[2.8, 0.08, 2.4]} c="#a07c5a" sombra={false} />
      <Caja p={[-5.7, 0.04, 0]} s={[3.4, 0.08, 2.8]} c="#c9b48f" sombra={false} />
      <Caja p={[-2.4, 0.04, 0]} s={[3.2, 0.08, 2.8]} c="#9a7556" sombra={false} />
      {/* Muros: fondo e izquierdo completos; divisiones bajas */}
      <Caja p={[-4.1, 0.8, -3.86]} s={[6.72, 1.6, 0.12]} c={pared} />
      <Caja p={[-7.46, 0.8, -1.2]} s={[0.12, 1.6, 5.32]} c={pared} />
      <Caja p={[-6.55, 0.35, -1.4]} s={[1.7, 0.7, 0.08]} c={bajo} />
      <Caja p={[-4.4, 0.35, -1.4]} s={[0.9, 0.7, 0.08]} c={bajo} />
      <Caja p={[-1.55, 0.35, -1.4]} s={[1.5, 0.7, 0.08]} c={bajo} />
      <Caja p={[-5.2, 0.35, -2.6]} s={[0.08, 0.7, 2.4]} c={bajo} />
      <Caja p={[-3.6, 0.35, -2.6]} s={[0.08, 0.7, 2.4]} c={bajo} />
      {/* Ventanas del muro del fondo: se encienden de noche */}
      {[-6.3, -2.2].map((x) => (
        <mesh key={x} position={[x, 1.05, -3.79]}>
          <planeGeometry args={[0.9, 0.55]} />
          <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={0.25} />
        </mesh>
      ))}
      <pointLight ref={luzCasa} position={[-4.2, 1.9, -0.8]} intensity={0} distance={7} color="#ffd8a0" />

      {/* Recámara: cama, buró y despertador */}
      <Caja p={[-6.6, 0.2, -2.55]} s={[1.0, 0.24, 1.8]} c="#6b4a33" />
      <Caja p={[-6.6, 0.39, -2.55]} s={[0.94, 0.14, 1.72]} c="#f1f5f9" />
      <Caja p={[-6.6, 0.49, -3.22]} s={[0.7, 0.1, 0.34]} c="#ffffff" />
      <Caja p={[-6.6, 0.47, -2.05]} s={[0.98, 0.1, 1.0]} c="#7c3aed" />
      <Caja p={[-5.72, 0.25, -3.45]} s={[0.46, 0.5, 0.4]} c="#8b5e3c" />
      <group ref={despertador} position={[-5.72, 0.62, -3.45]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} geometry={CILINDRO} scale={[0.12, 0.08, 0.12]}>
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.045]}>
          <circleGeometry args={[0.095, 20]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      </group>
      {/* Baño: regadera */}
      <Caja p={[-4.4, 0.1, -3.05]} s={[1.0, 0.06, 1.0]} c="#e2e8f0" />
      <mesh position={[-4.4, 0.85, -2.55]}>
        <boxGeometry args={[1.0, 1.5, 0.03]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.22} roughness={0.05} depthWrite={false} />
      </mesh>
      <Caja p={[-4.4, 1.62, -3.6]} s={[0.05, 0.05, 0.5]} c="#94a3b8" metal={0.8} rough={0.3} />
      <mesh position={[-4.4, 1.58, -3.35]} rotation={[Math.PI / 2, 0, 0]} geometry={CILINDRO} scale={[0.12, 0.04, 0.12]}>
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} />
      </mesh>
      <instancedMesh ref={gotas} args={[undefined, undefined, 28]} frustumCulled={false} geometry={ESFERA}>
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.4} transparent opacity={0.85} />
      </instancedMesh>
      {/* Estudio: escritorio, silla, lámpara y libro */}
      <Caja p={[-2.0, 0.72, -3.3]} s={[1.4, 0.06, 0.62]} c="#b08968" />
      {[-0.62, 0.62].map((x) => (
        <Caja key={x} p={[-2.0 + x, 0.36, -3.3]} s={[0.06, 0.7, 0.56]} c="#7f5539" />
      ))}
      <Caja p={[-2.0, 0.42, -2.45]} s={[0.5, 0.06, 0.5]} c="#334155" />
      <Caja p={[-2.0, 0.72, -2.22]} s={[0.5, 0.6, 0.06]} c="#334155" />
      <Caja p={[-2.1, 0.77, -3.2]} s={[0.42, 0.04, 0.3]} c="#2563eb" />
      <Caja p={[-1.45, 0.95, -3.45]} s={[0.04, 0.42, 0.04]} c="#1f2937" />
      <mesh position={[-1.45, 1.18, -3.35]} geometry={ESFERA} scale={0.09}>
        <meshStandardMaterial ref={foco} color="#fef3c7" emissive="#fbbf24" emissiveIntensity={0.1} toneMapped={false} />
      </mesh>
      <pointLight ref={luzLampara} position={[-1.6, 1.15, -3.1]} intensity={0} distance={2.6} color="#ffd48a" />
      {/* Comedor: mesa, sillas y platos */}
      <Caja p={[-5.7, 0.7, 0]} s={[1.5, 0.06, 0.95]} c="#a47148" />
      {[
        [-0.62, -0.4],
        [0.62, -0.4],
        [-0.62, 0.4],
        [0.62, 0.4],
      ].map(([x, z], k) => (
        <Caja key={k} p={[-5.7 + x!, 0.35, z!]} s={[0.07, 0.7, 0.07]} c="#6f4e37" />
      ))}
      {[-0.75, 0.75].map((z) => (
        <group key={z}>
          <Caja p={[-5.7, 0.42, z]} s={[0.46, 0.06, 0.42]} c="#b91c1c" />
          <Caja p={[-5.7, 0.72, z + Math.sign(z) * 0.2]} s={[0.46, 0.6, 0.05]} c="#b91c1c" />
        </group>
      ))}
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} position={[-5.7 + x, 0.745, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.16, 20]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}
      <mesh position={[-5.7, 0.8, 0.12]} geometry={ESFERA} scale={[0.16, 0.08, 0.16]}>
        <meshStandardMaterial color={actual === "lunch" ? "#ea580c" : actual === "breakfast" ? "#facc15" : "#e2e8f0"} roughness={0.6} />
      </mesh>
      {/* Sala: sillón y televisión */}
      <Caja p={[-1.25, 0.28, 0.15]} s={[0.7, 0.4, 1.6]} c="#0f766e" />
      <Caja p={[-0.98, 0.62, 0.15]} s={[0.18, 0.5, 1.6]} c="#115e59" />
      <Caja p={[-3.55, 0.3, 0.15]} s={[0.4, 0.5, 1.3]} c="#3f3f46" />
      <Caja p={[-3.5, 0.92, 0.15]} s={[0.08, 0.7, 1.15]} c="#111827" />
      <mesh position={[-3.45, 0.92, 0.15]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.05, 0.6]} />
        <meshStandardMaterial ref={tv} color="#0b1220" emissive="#60a5fa" emissiveIntensity={0.05} toneMapped={false} />
      </mesh>
      {/* Puerta y banqueta de la casa */}
      <Caja p={[-3.2, 0.03, 1.7]} s={[0.9, 0.06, 0.6]} c="#9ca3af" sombra={false} />
    </group>
  );
}

function Camion({ paso }: { paso: number }) {
  const ref = useRef<THREE.Group>(null);
  const idxBus = ACCIONES.findIndex((a) => a.id === "bus");
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    if (paso < idxBus) g.position.x = -12;
    else {
      const objetivo = paso === idxBus ? 1.45 : 13;
      const d = objetivo - g.position.x;
      g.position.x += Math.sign(d) * Math.min(Math.abs(d), (Math.abs(d) > 3 ? 7 : 3.5) * Math.min(dt, 0.25));
    }
    g.visible = Math.abs(g.position.x) < 9.6;
  });
  return (
    <group ref={ref} position={[-12, 0, 3.05]}>
      <Caja p={[0, 0.72, 0]} s={[2.9, 1.0, 1.05]} c="#f8fafc" rough={0.4} />
      <Caja p={[0, 0.42, 0]} s={[2.92, 0.16, 1.07]} c="#16a34a" rough={0.4} />
      <Caja p={[0, 1.24, 0]} s={[2.8, 0.06, 1.0]} c="#e2e8f0" />
      {[-0.95, -0.35, 0.25, 0.85].map((x) => (
        <mesh key={x} position={[x, 0.9, 0.53]}>
          <planeGeometry args={[0.46, 0.34]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.4} />
        </mesh>
      ))}
      <Caja p={[-1.2, 0.62, 0.53]} s={[0.36, 0.72, 0.02]} c="#0f766e" sombra={false} />
      <mesh position={[1.456, 0.88, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 0.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.4} />
      </mesh>
      {[-0.95, 0.95].map((x) =>
        [-0.5, 0.5].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.2, z]} rotation={[Math.PI / 2, 0, 0]} geometry={CILINDRO} scale={[0.2, 0.12, 0.2]}>
            <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>
        )),
      )}
    </group>
  );
}

function Barrio({ tiempoRef, paso }: { tiempoRef: RefObject<number>; paso: number }) {
  const actual = paso >= 0 && paso < N ? ACCIONES[paso]!.id : "";
  const faroles = useRef<THREE.MeshStandardMaterial>(null);
  const ventanas = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    const noche = nocheDe(tiempoRef.current);
    if (faroles.current) faroles.current.emissiveIntensity = 0.1 + noche * 2.4;
    if (ventanas.current) ventanas.current.emissiveIntensity = actual === "classes" ? 0.9 : 0.08 + noche * 0.4;
  });
  return (
    <group>
      {/* Calle y banquetas */}
      <Caja p={[0, 0.02, 3.2]} s={[16, 0.04, 1.6]} c="#374151" sombra={false} rough={0.95} />
      {Array.from({ length: 9 }, (_, k) => (
        <Caja key={k} p={[-7.2 + k * 1.8, 0.05, 3.2]} s={[0.8, 0.01, 0.07]} c="#f8fafc" sombra={false} />
      ))}
      <Caja p={[0, 0.05, 2.1]} s={[16, 0.1, 0.6]} c="#9ca3af" sombra={false} />
      <Caja p={[0, 0.05, 4.25]} s={[16, 0.1, 0.5]} c="#9ca3af" sombra={false} />
      {/* Parada del camión */}
      <group position={[0.9, 0, 1.95]}>
        {[-0.7, 0.7].map((x) => (
          <Caja key={x} p={[x, 0.7, -0.2]} s={[0.06, 1.3, 0.06]} c="#475569" metal={0.5} />
        ))}
        <Caja p={[0, 1.38, -0.05]} s={[1.7, 0.06, 0.7]} c="#0ea5e9" />
        <Caja p={[0, 0.7, -0.38]} s={[1.5, 1.1, 0.03]} c="#bae6fd" rough={0.1} />
        <Caja p={[0, 0.35, -0.2]} s={[1.1, 0.06, 0.3]} c="#78716c" />
        <Etiqueta pos={[0, 1.75, -0.05]} df={11} fs={11} col="#0ea5e9aa">
          <i className="fa-solid fa-bus" style={{ color: "#38bdf8" }} />
          Bus stop
        </Etiqueta>
      </group>
      {/* Escuela */}
      <group position={[4.9, 0, -2.75]}>
        <Caja p={[0, 1.2, 0]} s={[5.0, 2.4, 2.1]} c="#f1e3c6" />
        <Caja p={[0, 2.45, 0]} s={[5.2, 0.12, 2.3]} c="#9a3412" />
        <Caja p={[0, 0.62, 1.02]} s={[5.02, 0.18, 0.06]} c="#1d4ed8" sombra={false} />
        {[-1.8, -0.9, 0.9, 1.8].map((x) =>
          [0.95, 1.8].map((y) => (
            <mesh key={`${x}${y}`} position={[x, y, 1.06]}>
              <planeGeometry args={[0.55, 0.45]} />
              <meshStandardMaterial ref={x === -1.8 && y === 0.95 ? ventanas : undefined} color="#bfdbfe" emissive="#fde68a" emissiveIntensity={0.1} />
            </mesh>
          )),
        )}
        <Caja p={[0, 0.6, 1.07]} s={[0.8, 1.2, 0.04]} c="#7c2d12" />
        <Etiqueta pos={[0, 2.9, 1.1]} df={11} fs={12} col="#fbbf24aa">
          <i className="fa-solid fa-school" style={{ color: "#fbbf24" }} />
          High School
        </Etiqueta>
      </group>
      <Caja p={[4.9, 0.04, -0.6]} s={[4.6, 0.08, 2.2]} c="#a8a29e" sombra={false} />
      {actual === "classes" &&
        [
          [4.1, -0.5, "#f97316"],
          [5.6, -0.4, "#22c55e"],
          [5.2, 0.1, "#e11d48"],
        ].map(([x, z, c], k) => (
          <group key={k} position={[x as number, 0.02, z as number]} scale={0.85} rotation={[0, k === 0 ? 0.6 : -0.6, 0]}>
            <Figura camisa={c as string} coleta={k === 2} cabello={k === 1 ? "#111827" : "#3f2a1d"} />
          </group>
        ))}
      {/* Árboles y faroles */}
      {(
        [
          [7.3, 1.0],
          [2.6, 0.6],
          [-7.3, 2.1],
          [7.4, -3.9],
        ] as [number, number][]
      ).map(([x, z], k) => (
        <group key={k} position={[x, 0, z]}>
          <Caja p={[0, 0.45, 0]} s={[0.14, 0.9, 0.14]} c="#78350f" />
          <mesh position={[0, 1.25, 0]} geometry={ESFERA} scale={[0.55, 0.62, 0.55]} castShadow>
            <meshStandardMaterial color={k % 2 ? "#15803d" : "#166534"} roughness={0.9} flatShading />
          </mesh>
        </group>
      ))}
      {[-5.5, 5.5].map((x) => (
        <group key={x} position={[x, 0, 2.2]}>
          <Caja p={[0, 1.0, 0]} s={[0.06, 2.0, 0.06]} c="#334155" metal={0.6} />
          <mesh position={[0, 2.02, 0.12]} geometry={ESFERA} scale={0.12}>
            <meshStandardMaterial ref={x < 0 ? faroles : undefined} color="#fef9c3" emissive="#fde047" emissiveIntensity={0.1} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function RielDia({ colocados, paso, modoColor }: { colocados: number; paso: number; modoColor: string }) {
  const cursor = useRef<THREE.Group>(null);
  const lozas = useRef<THREE.Group>(null);
  const objetivo = paso < 0 ? Math.min(colocados, N - 1) : Math.min(paso, N - 1);
  useFrame(({ clock }, dt) => {
    if (cursor.current) {
      cursor.current.position.x += (X_SLOT(objetivo) - cursor.current.position.x) * suave(dt, 0.08);
      cursor.current.position.y = 0.95 + Math.sin(clock.elapsedTime * 3) * 0.06;
      cursor.current.visible = paso < N && !(paso < 0 && colocados >= N);
    }
    if (lozas.current)
      lozas.current.children.forEach((c, i) => {
        const y = i === paso ? 0.36 : 0.26;
        c.position.y += (y - c.position.y) * suave(dt, 0.12);
      });
  });
  return (
    <group>
      <Caja p={[0, 0.12, Z_RIEL]} s={[15.2, 0.24, 1.2]} c="#3b2a1e" rough={0.8} />
      <group ref={lozas}>
        {ACCIONES.map((a, i) => {
          const puesto = i < colocados;
          const hecho = paso > i;
          const col = hecho ? OK : puesto ? modoColor : "#1f2937";
          return (
            <mesh key={a.id} position={[X_SLOT(i), 0.26, Z_RIEL]} geometry={CAJA} scale={[1.34, 0.1, 0.9]} castShadow>
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={i === paso ? 0.7 : puesto ? 0.2 : 0} roughness={0.5} />
            </mesh>
          );
        })}
      </group>
      {ACCIONES.map((a, i) => {
        const puesto = i < colocados;
        const hecho = paso > i;
        return (
          <Html key={a.id} position={[X_SLOT(i), 0.55, Z_RIEL + 0.1]} center distanceFactor={11} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div
              style={{
                width: 64,
                padding: "4px 0",
                borderRadius: 9,
                textAlign: "center",
                background: puesto ? "rgba(4,10,22,0.86)" : "rgba(4,10,22,0.55)",
                border: `1px solid ${hecho ? OK : puesto ? modoColor : "rgba(255,255,255,0.18)"}`,
                color: "#fff",
                fontWeight: 900,
                lineHeight: 1.15,
              }}
            >
              {puesto ? (
                <>
                  <i className={`fa-solid ${hecho ? "fa-check" : a.icono}`} style={{ fontSize: 13, color: hecho ? OK : modoColor }} />
                  <div style={{ fontSize: 11, marginTop: 2 }}>
                    {a.horaA1 ? "" : "≈"}
                    {hora12Texto(a.min % 720)}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", padding: "4px 0" }}>{i + 1}</div>
              )}
            </div>
          </Html>
        );
      })}
      <group ref={cursor} position={[X_SLOT(0), 0.95, Z_RIEL]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.13, 0.3, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function Ana({ paso, burbuja, modoColor }: { paso: number; burbuja: string | null; modoColor: string }) {
  const raiz = useRef<THREE.Group>(null);
  const cuerpo = useRef<THREE.Group>(null);
  const mochila = useRef<THREE.Mesh>(null);
  const pose = poseDe(paso);
  const actual = paso >= 0 && paso < N ? ACCIONES[paso]!.id : "";
  const dormida = pose.tipo === "acostada";
  useFrame(({ clock }, dt) => {
    const r = raiz.current;
    const c = cuerpo.current;
    if (!r || !c) return;
    const k = suave(dt, 0.06);
    const [x, y, z] = pose.pos;
    const dx = x - r.position.x;
    const dz = z - r.position.z;
    const dist = Math.hypot(dx, dz);
    r.position.x += dx * k;
    r.position.z += dz * k;
    const salto = Math.min(dist, 1.6) * 0.5 * Math.abs(Math.sin(clock.elapsedTime * 8));
    r.position.y += (y + salto - r.position.y) * suave(dt, 0.3);
    let dy = pose.rotY - r.rotation.y;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    r.rotation.y += dy * k;
    const rx = pose.tipo === "acostada" && dist < 0.6 ? -Math.PI / 2 : 0;
    c.rotation.x += (rx - c.rotation.x) * suave(dt, 0.1);
    const oy = pose.tipo === "sentada" && dist < 0.4 ? 0.28 : 0;
    c.position.y += (oy - c.position.y) * suave(dt, 0.12);
    c.scale.y = 1 + Math.sin(clock.elapsedTime * (dormida ? 1.4 : 2.2)) * 0.012;
    if (mochila.current) mochila.current.visible = actual === "bus" || actual === "classes";
  });
  return (
    <group ref={raiz} position={POSE_DORMIDA.pos}>
      <group ref={cuerpo} scale={1.2}>
        <Figura camisa="#f472b6" coleta />
        <mesh ref={mochila} position={[0, 0.52, -0.22]} geometry={CAJA} scale={[0.28, 0.32, 0.14]} visible={false}>
          <meshStandardMaterial color="#1d4ed8" roughness={0.6} />
        </mesh>
      </group>
      {burbuja ? (
        <Burbuja pos={[0, dormida ? 1.3 : 2.15, 0]} borde={modoColor} df={11} ancho={250}>
          {burbuja}
        </Burbuja>
      ) : (
        dormida && (
          <Etiqueta pos={[0.35, 0.75, 0]} df={11} fs={12} col="#a5b4fcaa">
            <i className="fa-solid fa-moon" style={{ color: "#a5b4fc" }} />
            Zzz…
          </Etiqueta>
        )
      )}
      <Etiqueta pos={[0, dormida ? -0.25 : -0.12, 0.45]} df={12} fs={10} col="#f472b6aa">
        Ana
      </Etiqueta>
    </group>
  );
}

const COLINAS: [number, number, number, number][] = [
  [-10, -9.5, 4.2, 2.4],
  [-4.5, -10.5, 5.2, 3.2],
  [2.5, -10, 4.6, 2.2],
  [9, -9.5, 5.0, 3.0],
];
const EDIFICIOS: [number, number, number][] = [
  [-7.2, 1.6, 0.9],
  [-6.1, 2.4, 0.8],
  [-2.2, 1.3, 1.1],
  [0.4, 2.9, 0.9],
  [1.5, 1.9, 1.0],
  [5.6, 2.2, 0.9],
  [6.8, 1.4, 1.2],
];

/** Colinas y ciudad lejana: dan horizonte a la maqueta. */
function Fondo() {
  return (
    <group>
      {COLINAS.map(([x, z, r, h], k) => (
        <mesh key={k} position={[x, h / 2 - 0.4, z]} scale={[r, h, r * 0.5]}>
          <coneGeometry args={[1, 1, 7]} />
          <meshStandardMaterial color={k % 2 ? "#23374a" : "#2a4155"} roughness={1} flatShading />
        </mesh>
      ))}
      {EDIFICIOS.map(([x, h, w], k) => (
        <Caja key={k} p={[x, h / 2, -7.2 - (k % 3) * 0.5]} s={[w, h, 0.8]} c={k % 2 ? "#334155" : "#3b4b61"} sombra={false} />
      ))}
    </group>
  );
}

function EscenaDia({ colocados, paso, burbuja, modoColor }: { colocados: number; paso: number; burbuja: string | null; modoColor: string }) {
  const tiempoRef = useRef(horaObjetivo(paso));
  return (
    <group position={[0, -1.2, -0.4]}>
      <CicloDia tiempoRef={tiempoRef} paso={paso} />
      <Caja p={[0, -0.22, 0.95]} s={[16.4, 0.4, 11]} c="#35573c" rough={1} />
      <Fondo />
      <Casa tiempoRef={tiempoRef} paso={paso} />
      <Etiqueta pos={[-7.0, 1.95, -3.2]} df={11} fs={12} col="#f472b6aa">
        <i className="fa-solid fa-house" style={{ color: "#f9a8d4" }} />
        Home
      </Etiqueta>
      <Barrio tiempoRef={tiempoRef} paso={paso} />
      <Camion paso={paso} />
      <RielDia colocados={colocados} paso={paso} modoColor={modoColor} />
      <Ana paso={paso} burbuja={burbuja} modoColor={modoColor} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. WHAT TIME…? — el reloj
 * ════════════════════════════════════════════════════════════════════════ */

const R_RELOJ = 2.0;
const Y_RELOJ = 3.25;

function Reloj({ relojMin, arrastrable, onMinuto, mostrarDigital, pm, modoColor }: { relojMin: number; arrastrable: boolean; onMinuto?: (m: number) => void; mostrarDigital: boolean; pm: boolean; modoColor: string }) {
  const horaria = useRef<THREE.Group>(null);
  const minutero = useRef<THREE.Group>(null);
  const disco = useRef<THREE.Mesh>(null);
  const cur = useRef(relojMin);
  const arrastrando = useRef(false);
  const ultimo = useRef(-1);
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    let d = relojMin - (((cur.current % 720) + 720) % 720);
    if (d > 360) d -= 720;
    if (d < -360) d += 720;
    cur.current += d * suave(dt, arrastrando.current ? 0.35 : 0.1);
    const m = cur.current;
    if (horaria.current) horaria.current.rotation.z = -(m / 720) * Math.PI * 2;
    if (minutero.current) minutero.current.rotation.z = -(m / 60) * Math.PI * 2;
  });
  const mover = (e: ThreeEvent<PointerEvent>) => {
    if (!disco.current || !onMinuto) return;
    const p = disco.current.worldToLocal(v.copy(e.point));
    let a = Math.atan2(p.x, p.y);
    if (a < 0) a += Math.PI * 2;
    const m = (Math.round((a / (Math.PI * 2)) * 12) % 12) * 5;
    if (m !== ultimo.current) {
      ultimo.current = m;
      onMinuto(m);
    }
  };
  return (
    <group position={[0, Y_RELOJ, -0.6]}>
      {/* Caja y bisel */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.12]} geometry={CILINDRO} scale={[R_RELOJ + 0.18, 0.3, R_RELOJ + 0.18]} castShadow>
        <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <torusGeometry args={[R_RELOJ + 0.1, 0.09, 12, 64]} />
        <meshStandardMaterial color={modoColor} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <circleGeometry args={[R_RELOJ, 64]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {/* Mitad «past» (derecha) y mitad «to» (izquierda) */}
      <mesh position={[0, 0, 0.04]}>
        <circleGeometry args={[R_RELOJ - 0.05, 48, -Math.PI / 2, Math.PI]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <circleGeometry args={[R_RELOJ - 0.05, 48, Math.PI / 2, Math.PI]} />
        <meshBasicMaterial color="#fb923c" transparent opacity={0.16} depthWrite={false} />
      </mesh>
      {Array.from({ length: 60 }, (_, k) => {
        const a = (k / 60) * Math.PI * 2;
        const hora = k % 5 === 0;
        const r = R_RELOJ - (hora ? 0.16 : 0.1);
        return (
          <mesh key={k} position={[Math.sin(a) * r, Math.cos(a) * r, 0.05]} rotation={[0, 0, -a]} geometry={CAJA} scale={[hora ? 0.05 : 0.02, hora ? 0.2 : 0.09, 0.01]}>
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        );
      })}
      {Array.from({ length: 12 }, (_, k) => {
        const n = k === 0 ? 12 : k;
        const a = (k / 12) * Math.PI * 2;
        return (
          <Html key={k} position={[Math.sin(a) * (R_RELOJ - 0.52), Math.cos(a) * (R_RELOJ - 0.52), 0.06]} center distanceFactor={9} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", fontFamily: "ui-sans-serif, system-ui" }}>{n}</div>
          </Html>
        );
      })}
      <Html position={[0.78, -0.55, 0.06]} center distanceFactor={9} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#0369a1", letterSpacing: "0.08em" }}>PAST</div>
      </Html>
      <Html position={[-0.78, -0.55, 0.06]} center distanceFactor={9} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#c2410c", letterSpacing: "0.08em" }}>TO</div>
      </Html>
      {/* Etiquetas de los cuartos fuera del bisel */}
      <Etiqueta pos={[0, R_RELOJ + 0.55, 0.1]} df={10} fs={11}>
        o&apos;clock
      </Etiqueta>
      <Etiqueta pos={[R_RELOJ + 1.05, 0, 0.1]} df={10} fs={11} col="#38bdf8aa">
        a quarter past
      </Etiqueta>
      <Etiqueta pos={[-R_RELOJ - 1.0, 0, 0.1]} df={10} fs={11} col="#fb923caa">
        a quarter to
      </Etiqueta>
      {/* Manecillas */}
      <group ref={horaria} position={[0, 0, 0.09]}>
        <mesh position={[0, 0.5, 0]} geometry={CAJA} scale={[0.13, 1.15, 0.03]}>
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
      </group>
      <group ref={minutero} position={[0, 0, 0.12]}>
        <mesh position={[0, 0.78, 0]} geometry={CAJA} scale={[0.07, 1.72, 0.03]}>
          <meshStandardMaterial color="#0284c7" roughness={0.4} emissive="#0284c7" emissiveIntensity={0.15} />
        </mesh>
        <mesh position={[0, 1.66, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.09, 0.2, 3]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]} geometry={CILINDRO} scale={[0.12, 0.05, 0.12]}>
        <meshStandardMaterial color={modoColor} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Disco invisible para arrastrar el minutero */}
      <mesh
        ref={disco}
        position={[0, 0, 0.2]}
        onPointerDown={(e) => {
          if (!arrastrable) return;
          e.stopPropagation();
          arrastrando.current = true;
          ultimo.current = -1;
          (e.target as unknown as { setPointerCapture?: (id: number) => void }).setPointerCapture?.(e.pointerId);
          mover(e);
        }}
        onPointerMove={(e) => {
          if (arrastrando.current) mover(e);
        }}
        onPointerUp={(e) => {
          arrastrando.current = false;
          (e.target as unknown as { releasePointerCapture?: (id: number) => void }).releasePointerCapture?.(e.pointerId);
        }}
        onPointerLeave={() => {
          arrastrando.current = false;
        }}
      >
        <circleGeometry args={[R_RELOJ, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Patas */}
      {[-1.1, 1.1].map((x) => (
        <Caja key={x} p={[x, -R_RELOJ - 0.18, -0.12]} s={[0.35, 0.3, 0.45]} c="#1e293b" metal={0.5} rough={0.35} />
      ))}
      {mostrarDigital && (
        <Etiqueta pos={[0, -R_RELOJ - 0.75, 0.5]} df={9} fs={15} col={`${OK}aa`}>
          <i className="fa-solid fa-circle-check" style={{ color: OK }} />
          {hora12Texto(relojMin)} {pm ? "p.m." : "a.m."}
        </Etiqueta>
      )}
    </group>
  );
}

function EscenaHora(p: Pick<RutinaSceneProps, "relojMin" | "pm" | "pregunta" | "respuesta" | "contexto" | "contextoIcono" | "mostrarDigital" | "arrastrable" | "onMinuto" | "modoColor">) {
  const t24 = p.relojMin + (p.pm ? 720 : 0);
  const noche = nocheDe(t24);
  const cielo = colorCielo(t24, new THREE.Color()).getStyle();
  return (
    <group position={[0, -1.4, 0]}>
      <Caja p={[0, -0.1, 0.4]} s={[13, 0.2, 6.4]} c="#6b4f3a" rough={0.85} />
      <Caja p={[0, 3.2, -2.35]} s={[13, 6.6, 0.2]} c="#334155" rough={0.95} />
      <Caja p={[0, 0.25, -2.2]} s={[13, 0.5, 0.1]} c="#1e293b" />
      {/* Ventana con el cielo de la hora: a.m. / p.m. */}
      <group position={[4.6, 4.6, -2.22]}>
        <Caja p={[0, 0, 0]} s={[2.2, 1.7, 0.08]} c="#e2e8f0" />
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[1.95, 1.45]} />
          <meshBasicMaterial color={cielo} />
        </mesh>
        <mesh position={noche > 0.5 ? [0.45, 0.3, 0.08] : [-0.4, -0.05 + (1 - noche) * 0.35, 0.08]} geometry={ESFERA} scale={noche > 0.5 ? 0.2 : 0.26}>
          <meshBasicMaterial color={noche > 0.5 ? "#e2e8f0" : "#fcd34d"} toneMapped={false} />
        </mesh>
        <Caja p={[0, 0, 0.07]} s={[0.05, 1.45, 0.02]} c="#e2e8f0" sombra={false} />
        <Etiqueta pos={[0, 1.18, 0.2]} df={10} fs={12} col={noche > 0.5 ? "#a5b4fcaa" : "#fbbf24aa"}>
          <i className={`fa-solid ${p.pm ? "fa-moon" : "fa-sun"}`} style={{ color: p.pm ? "#a5b4fc" : "#fbbf24" }} />
          {p.pm ? "p.m." : "a.m."}
        </Etiqueta>
      </group>
      {/* Repisa con libros */}
      <group position={[-4.6, 4.4, -2.1]}>
        <Caja p={[0, 0, 0]} s={[2.2, 0.08, 0.35]} c="#a47148" />
        {["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"].map((c, k) => (
          <Caja key={c} p={[-0.8 + k * 0.3, 0.3 + (k % 2) * 0.03, 0]} s={[0.22, 0.52 + (k % 2) * 0.06, 0.28]} c={c} />
        ))}
      </group>
      {/* Mesa */}
      <Caja p={[0, 0.85, -0.6]} s={[3.6, 0.1, 1.4]} c="#a47148" />
      {[-1.6, 1.6].map((x) => (
        <Caja key={x} p={[x, 0.4, -0.6]} s={[0.12, 0.8, 1.1]} c="#7f5539" />
      ))}
      <Reloj relojMin={p.relojMin} arrastrable={p.arrastrable} onMinuto={p.onMinuto} mostrarDigital={p.mostrarDigital} pm={p.pm} modoColor={p.modoColor} />
      {/* Luis pregunta, Ana responde */}
      <group position={[-4.5, 0, 0.9]} rotation={[0, 0.45, 0]} scale={1.5}>
        <Figura camisa="#22c55e" cabello="#111827" />
      </group>
      <Etiqueta pos={[-5.55, 1.0, 1.0]} df={10} fs={12} col="#22c55eaa">
        Luis
      </Etiqueta>
      {p.pregunta && (
        <Burbuja pos={[-4.5, 2.6, 0.9]} df={10} borde="#22c55e" ancho={220}>
          {p.pregunta}
        </Burbuja>
      )}
      <group position={[4.5, 0, 0.9]} rotation={[0, -0.45, 0]} scale={1.5}>
        <Figura camisa="#f472b6" coleta />
      </group>
      <Etiqueta pos={[5.55, 1.0, 1.0]} df={10} fs={12} col="#f472b6aa">
        Ana
      </Etiqueta>
      {p.respuesta && (
        <Burbuja pos={[4.5, 2.6, 0.9]} df={10} borde="#f472b6" ancho={220}>
          {p.respuesta}
        </Burbuja>
      )}
      {p.contexto && (
        <Etiqueta pos={[4.5, 3.75, 0.9]} df={10} fs={11} col="#f472b6aa">
          <i className={`fa-solid ${p.contextoIcono ?? "fa-person"}`} style={{ color: "#f472b6" }} />
          {p.contexto}
        </Etiqueta>
      )}
      {p.arrastrable && !p.mostrarDigital && (
        <Etiqueta pos={[0, 0.35, 0.4]} df={10} fs={11} col={`${p.modoColor}aa`}>
          <i className="fa-solid fa-hand-pointer" style={{ color: p.modoColor }} />
          Arrastra el minutero (azul) alrededor del reloj
        </Etiqueta>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. HOW OFTEN? — el calendario semanal
 * ════════════════════════════════════════════════════════════════════════ */

const X_COL = (c: number) => -2.35 + c * 0.84;
const Y_FILA = (r: number) => 5.05 - r * 0.74;
const X_ESCALA = 5.0;
const Y0_ESC = 0.75;
const Y1_ESC = 5.35;
const yPct = (p: number) => Y0_ESC + ((Y1_ESC - Y0_ESC) * p) / 100;

function FilaHabito({ r, sel, contado, hecho }: { r: number; sel: boolean; contado: boolean; hecho: boolean }) {
  const h = HABITOS[r]!;
  const fichas = useRef<THREE.Group>(null);
  const dias = h.dias.map((v, c) => ({ v, c })).filter((d) => d.v === 1);
  useFrame(({ clock }, dt) => {
    const g = fichas.current;
    if (!g) return;
    const ciclo = Math.floor(clock.elapsedTime * 2.2) % (dias.length + 2);
    g.children.forEach((ch, j) => {
      const s = sel && !contado && j === ciclo ? 1.4 : sel ? 1.12 : 1;
      const k = suave(dt, 0.2);
      ch.scale.x += (s - ch.scale.x) * k;
      ch.scale.y += (s - ch.scale.y) * k;
      ch.scale.z += (s - ch.scale.z) * k;
      ch.position.z = sel ? 0.18 : 0.06;
    });
  });
  return (
    <group position={[0, Y_FILA(r), 0]}>
      {DIAS_SEMANA.map((_, c) => (
        <mesh key={c} position={[X_COL(c), 0, -0.02]} geometry={CAJA} scale={[0.74, 0.62, 0.05]}>
          <meshStandardMaterial color={sel ? "#334155" : "#1e293b"} roughness={0.8} />
        </mesh>
      ))}
      <group ref={fichas}>
        {dias.map((d) => (
          <mesh key={d.c} position={[X_COL(d.c), 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.08, 28]} />
            <meshStandardMaterial color={h.color} emissive={h.color} emissiveIntensity={sel ? 0.55 : 0.12} roughness={0.35} />
          </mesh>
        ))}
      </group>
      <Html position={[X_COL(0) - 0.95, 0, 0.1]} center distanceFactor={10} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: sel ? h.color : "rgba(4,10,22,0.8)", border: `1px solid ${h.color}`, color: sel ? "#04121f" : h.color, fontSize: 16 }}>
          <i className={`fa-solid ${h.icono}`} />
        </div>
      </Html>
      {sel && (
        <Etiqueta pos={[X_COL(6) + 0.95, 0, 0.2]} df={10} fs={13} col={`${h.color}cc`}>
          {contado ? `${cuentaDias(h)}/7` : "?/7"}
        </Etiqueta>
      )}
      {!sel && hecho && (
        <Html position={[X_COL(6) + 0.75, 0, 0.1]} center distanceFactor={10} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
          <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 16 }} />
        </Html>
      )}
    </group>
  );
}

function EscenaFrecuencia({ habitoIdx, contado, oracion, estadoOracion, adverbio, hechosFrec, modoColor }: Pick<RutinaSceneProps, "habitoIdx" | "contado" | "oracion" | "estadoOracion" | "adverbio" | "hechosFrec" | "modoColor">) {
  const h = HABITOS[habitoIdx] ?? HABITOS[0]!;
  const barra = useRef<THREE.Mesh>(null);
  const marcador = useRef<THREE.Group>(null);
  const resalte = useRef<THREE.Mesh>(null);
  const pct = porcentaje(h);
  const aceptados = adverbiosAceptados(h);
  useFrame(({ clock }, dt) => {
    const k = suave(dt, 0.08);
    if (resalte.current) resalte.current.position.y += (Y_FILA(habitoIdx) - resalte.current.position.y) * k;
    const alto = contado ? ((Y1_ESC - Y0_ESC) * pct) / 100 : 0;
    if (barra.current) {
      const s = barra.current.scale.y + (Math.max(0.001, alto) - barra.current.scale.y) * k;
      barra.current.scale.y = s;
      barra.current.position.y = Y0_ESC + s / 2;
    }
    if (marcador.current) {
      marcador.current.position.y += (yPct(contado ? pct : 0) - marcador.current.position.y) * k;
      marcador.current.visible = contado;
      marcador.current.rotation.y = clock.elapsedTime * 1.5;
    }
  });
  const colOracion = estadoOracion === "ok" ? OK : estadoOracion === "mal" ? WARN : modoColor;
  return (
    <group position={[-0.4, -1.3, 0]}>
      <Caja p={[0.8, -0.1, 0.6]} s={[15, 0.2, 5]} c="#1f2a3a" rough={0.9} />
      {/* Pizarrón del calendario */}
      <Caja p={[-0.5, 3.1, -0.22]} s={[7.8, 6.1, 0.18]} c="#0f172a" rough={0.7} />
      <Caja p={[-0.5, 6.18, -0.2]} s={[7.95, 0.12, 0.24]} c={modoColor} />
      <Caja p={[-0.5, 0.02, -0.2]} s={[7.95, 0.12, 0.24]} c={modoColor} />
      <mesh ref={resalte} position={[-0.3, Y_FILA(habitoIdx), -0.1]} geometry={CAJA} scale={[7.1, 0.7, 0.04]}>
        <meshStandardMaterial color={h.color} emissive={h.color} emissiveIntensity={0.35} transparent opacity={0.35} />
      </mesh>
      {DIAS_SEMANA.map((d, c) => (
        <Html key={d} position={[X_COL(c), 5.7, 0.05]} center distanceFactor={10} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: c >= 5 ? "#fca5a5" : "#e2e8f0", letterSpacing: "0.04em" }}>{d}</div>
        </Html>
      ))}
      {HABITOS.map((x, r) => (
        <FilaHabito key={x.id} r={r} sel={r === habitoIdx} contado={contado && r === habitoIdx} hecho={hechosFrec.includes(x.id)} />
      ))}
      {/* Oración que arma el alumno */}
      <Html position={[0.9, 7.0, 0]} center distanceFactor={10} zIndexRange={[25, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            maxWidth: 560,
            whiteSpace: "nowrap",
            padding: "9px 18px",
            borderRadius: 14,
            background: "rgba(4,10,22,0.9)",
            border: `2px solid ${colOracion}`,
            color: oracion ? "#fff" : "rgba(255,255,255,0.5)",
            fontSize: 17,
            fontWeight: 900,
            boxShadow: `0 0 26px -8px ${colOracion}`,
          }}
        >
          {estadoOracion === "ok" && <i className="fa-solid fa-circle-check" style={{ color: OK, marginRight: 8 }} />}
          {oracion || preguntaFrecuencia(h)}
        </div>
      </Html>
      {/* Escala de frecuencia */}
      <mesh position={[X_ESCALA, (Y0_ESC + Y1_ESC) / 2, -0.1]} geometry={CAJA} scale={[0.36, Y1_ESC - Y0_ESC + 0.2, 0.2]}>
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      <mesh ref={barra} position={[X_ESCALA, Y0_ESC, 0.02]} geometry={CAJA} scale={[0.24, 0.001, 0.16]}>
        <meshStandardMaterial color={h.color} emissive={h.color} emissiveIntensity={0.5} />
      </mesh>
      {ESCALA.map((e) => {
        const elegido = adverbio === e.adv;
        const bien = aceptados.includes(e.adv);
        const col = elegido ? (estadoOracion === "ok" || (estadoOracion !== "mal" && bien && contado) ? OK : estadoOracion === "mal" && !bien ? WARN : modoColor) : "rgba(255,255,255,0.25)";
        return (
          <group key={e.adv} position={[X_ESCALA, yPct(e.pct), 0]}>
            <mesh geometry={CAJA} scale={[0.6, 0.04, 0.26]}>
              <meshStandardMaterial color={elegido ? col : "#94a3b8"} emissive={elegido ? col : "#000000"} emissiveIntensity={elegido ? 0.8 : 0} />
            </mesh>
            <Html position={[0.45, 0, 0]} distanceFactor={10} zIndexRange={[15, 0]} style={{ pointerEvents: "none", transform: "translateY(-50%)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "2px 9px",
                  borderRadius: 8,
                  whiteSpace: "nowrap",
                  background: elegido ? "rgba(4,10,22,0.92)" : "rgba(4,10,22,0.6)",
                  border: `1px solid ${col}`,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {e.adv}
                <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>{e.pct} %</span>
              </div>
            </Html>
          </group>
        );
      })}
      <group ref={marcador} position={[X_ESCALA - 0.5, Y0_ESC, 0.1]} visible={false}>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.13, 0.32, 4]} />
          <meshStandardMaterial color={h.color} emissive={h.color} emissiveIntensity={0.7} />
        </mesh>
      </group>
      <Etiqueta pos={[X_ESCALA + 0.2, 0.05, 0.4]} df={10} fs={11}>
        <i className="fa-solid fa-chart-simple" style={{ color: modoColor }} />
        {contado ? `${cuentaDias(h)}/7 ≈ ${pct} %` : "How often?"}
      </Etiqueta>
      {/* Ana junto al calendario */}
      <group position={[-5.1, 0, 1.3]} rotation={[0, 0.5, 0]} scale={1.45}>
        <Figura camisa="#f472b6" coleta />
      </group>
      <Html position={[-5.1, 2.4, 1.3]} center distanceFactor={10} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: `2px solid ${h.color}`, color: h.color, fontSize: 20 }}>
          <i className={`fa-solid ${h.icono}`} />
        </div>
      </Html>
      <Etiqueta pos={[-5.1, 3.0, 1.3]} df={10} fs={11} col="#f472b6aa">
        Ana&apos;s week
      </Etiqueta>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function RutinaDiariaInglesScene(p: RutinaSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "dia") return { pos: [0, 10.2, 13.6], target: [0, -0.6, 0.6] };
    if (vista === "hora") return { pos: [0, 2.6, 11.4], target: [0, 1.7, 0] };
    return { pos: [0.2, 3.1, 13.6], target: [0.2, 2.35, 0] };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={[vista === "dia" ? "#050b1a" : "#040a16"]} />
      <fog attach="fog" args={[vista === "dia" ? "#050b1a" : "#040a16", 24, 48]} />
      {vista !== "dia" && (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 9, 7]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
          <pointLight position={[-6, 3, 5]} intensity={0.5} color={modoColor} />
        </>
      )}
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.3} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.7} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "dia" && <EscenaDia colocados={p.colocados} paso={p.paso} burbuja={p.burbuja} modoColor={modoColor} />}
      {vista === "hora" && (
        <EscenaHora
          relojMin={p.relojMin}
          pm={p.pm}
          pregunta={p.pregunta}
          respuesta={p.respuesta}
          contexto={p.contexto}
          contextoIcono={p.contextoIcono}
          mostrarDigital={p.mostrarDigital}
          arrastrable={p.arrastrable}
          onMinuto={p.onMinuto}
          modoColor={modoColor}
        />
      )}
      {vista === "frecuencia" && (
        <EscenaFrecuencia habitoIdx={p.habitoIdx} contado={p.contado} oracion={p.oracion} estadoOracion={p.estadoOracion} adverbio={p.adverbio} hechosFrec={p.hechosFrec} modoColor={modoColor} />
      )}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        enableRotate={vista !== "hora"}
        minDistance={5}
        maxDistance={24}
        maxPolarAngle={Math.PI * 0.47}
        minPolarAngle={Math.PI * 0.08}
        minAzimuthAngle={-Math.PI * 0.4}
        maxAzimuthAngle={Math.PI * 0.4}
        target={cam.target}
      />
      <EffectComposer>
        <Bloom intensity={0.28} luminanceThreshold={0.7} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
