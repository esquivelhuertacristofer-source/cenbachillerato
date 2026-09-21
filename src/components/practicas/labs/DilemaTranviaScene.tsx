"use client";

/**
 * Escena 3D del laboratorio "Dilemas éticos" (PFH-II-P02). Tres vistas:
 *
 *  - tranvia: vías, tranvía y palanca en cuatro variantes (palanca, puente,
 *    lazo y trasplante). Al confirmar la decisión, la escena la ejecuta: la
 *    palanca se mueve, el tranvía avanza por la ruta elegida y frena; quienes
 *    quedan en su camino caen a un lado y se vuelven grises (sin violencia
 *    explícita) y quienes se salvan reciben un anillo verde.
 *  - cotidiano: cuatro dilemas cercanos (el examen, el proyector roto, el auto
 *    autónomo y la pipa de agua). Los afectados que marca el alumno se iluminan
 *    y la conclusión de su argumento se representa en la escena.
 *  - dialogo: una comunidad de diálogo en torno a una balanza. Cada argumento
 *    bien clasificado pesa en el platillo de su postura; las falacias caen al
 *    cesto y no pesan.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type Variante,
  type Decision,
  type CasoId,
  CASOS,
  ORGANOS,
  INTERVENCIONES,
  HABLANTES,
  TEORIA_DEF,
  esFalacia,
  etiquetaClase,
  pesos,
  inclinacion,
  LADO_DEF,
  enRiesgo,
} from "./dilema-tranvia-data";

export type VistaDilema = Modo;

export interface DilemaSceneProps {
  vista: VistaDilema;
  modoColor: string;
  resetNonce: number;
  // Tranvía
  variante: Variante;
  n: number;
  decision: Decision | null;
  animNonce: number;
  // Cotidiano
  casoId: CasoId;
  marcados: string[];
  postura: "A" | "B" | null;
  // Diálogo
  actualId: string | null;
  clasificados: string[];
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const OK = "#34d399";
const NO = "#f87171";
const GRIS = new THREE.Color("#4b5563");
const PIEL = "#e8b98f";

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

const GEO_CUERPO = new THREE.CapsuleGeometry(0.17, 0.42, 6, 14);
const GEO_CABEZA = new THREE.SphereGeometry(0.15, 18, 14);
const GEO_CASCO = new THREE.SphereGeometry(0.165, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
const GEO_MOCHILA = new THREE.BoxGeometry(0.3, 0.42, 0.22);
const GEO_ANILLO = new THREE.TorusGeometry(0.34, 0.035, 8, 36);

/** Persona estilizada (sin animación). */
function Persona({ pos, color, escala = 1, yaw = 0, casco = false }: { pos: Pt; color: string; escala?: number; yaw?: number; casco?: boolean }) {
  return (
    <group position={pos} scale={escala} rotation={[0, yaw, 0]}>
      <mesh geometry={GEO_CUERPO} position={[0, 0.42, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh geometry={GEO_CABEZA} position={[0, 0.98, 0]} castShadow>
        <meshStandardMaterial color={PIEL} roughness={0.6} />
      </mesh>
      {casco && (
        <mesh geometry={GEO_CASCO} position={[0, 1.02, 0]}>
          <meshStandardMaterial color="#facc15" roughness={0.4} />
        </mesh>
      )}
    </group>
  );
}

/** Anillo en el piso: marca a un afectado, a quien se salva o a quien corre riesgo. */
function Anillo({ pos, color, on, radio = 1 }: { pos: Pt; color: string; on: boolean; radio?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const k = useRef(0);
  useFrame(({ clock }, dt) => {
    k.current += ((on ? 1 : 0) - k.current) * suave(dt, 0.12);
    if (!ref.current) return;
    const s = Math.max(0.001, k.current) * radio * (1 + 0.06 * Math.sin(clock.elapsedTime * 4));
    ref.current.scale.set(s, s, s);
    ref.current.visible = k.current > 0.02;
  });
  return (
    <mesh ref={ref} geometry={GEO_ANILLO} position={[pos[0], pos[1] + 0.03, pos[2]]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. EL TRANVÍA
 * ════════════════════════════════════════════════════════════════════════ */

const V = (x: number, z: number) => new THREE.Vector3(x, 0, z);
type Curva = THREE.Curve<THREE.Vector3>;

function ruta(...cs: Curva[]): THREE.CurvePath<THREE.Vector3> {
  const p = new THREE.CurvePath<THREE.Vector3>();
  cs.forEach((c) => p.add(c));
  return p;
}

// Palanca
const PA_APROX = new THREE.LineCurve3(V(-11, 0), V(-3, 0));
const PA_PRINC = new THREE.LineCurve3(V(-3, 0), V(8.5, 0));
const PA_DESV1 = new THREE.CubicBezierCurve3(V(-3, 0), V(-0.8, 0), V(-0.2, -2.6), V(2, -2.6));
const PA_DESV2 = new THREE.LineCurve3(V(2, -2.6), V(8.5, -2.6));
// Puente
const PU_RECTA = new THREE.LineCurve3(V(-11, 0), V(8.5, 0));
// Lazo
const LA_PRINC = new THREE.LineCurve3(V(-3, 0), V(6, 0));
const LA_1 = new THREE.CubicBezierCurve3(V(-3, 0), V(-0.8, 0), V(-0.2, -2.8), V(2, -2.8));
const LA_2 = new THREE.LineCurve3(V(2, -2.8), V(5.5, -2.8));
const LA_3 = new THREE.CubicBezierCurve3(V(5.5, -2.8), V(8.9, -2.8), V(8.9, 0), V(6, 0));

interface ConfigVia {
  piezas: Curva[];
  rutaNo: THREE.CurvePath<THREE.Vector3>;
  rutaSi: THREE.CurvePath<THREE.Vector3>;
  /** Centro del grupo en riesgo (sobre rutaNo). */
  grupoS: number;
  /** Persona que se sacrifica: sobre rutaSi (palanca, lazo) o en el puente. */
  unoS: number;
  palanca: Pt | null;
  tu: Pt;
}

const CONFIG: Record<"palanca" | "puente" | "lazo", ConfigVia> = {
  palanca: {
    piezas: [PA_APROX, PA_PRINC, PA_DESV1, PA_DESV2],
    rutaNo: ruta(PA_APROX, PA_PRINC),
    rutaSi: ruta(PA_APROX, PA_DESV1, PA_DESV2),
    grupoS: 12.5,
    unoS: 8 + PA_DESV1.getLength() + 3.5,
    palanca: [-3.9, 0, 1.25],
    tu: [-4.6, 0, 1.55],
  },
  puente: {
    piezas: [PU_RECTA],
    rutaNo: ruta(PU_RECTA),
    rutaSi: ruta(PU_RECTA),
    grupoS: 15,
    unoS: 8.6,
    palanca: null,
    tu: [-1.5, 2.62, 1.3],
  },
  lazo: {
    piezas: [PA_APROX, LA_PRINC, LA_1, LA_2, LA_3],
    rutaNo: ruta(PA_APROX, LA_PRINC),
    rutaSi: ruta(PA_APROX, LA_1, LA_2, LA_3),
    grupoS: 12.5,
    unoS: 8 + LA_1.getLength() + 1.2,
    palanca: [-3.9, 0, 1.25],
    tu: [-4.6, 0, 1.55],
  },
};

const ANCHO_VIA = 0.3;

/** Rieles (tubos desplazados a cada lado) y durmientes de cada tramo. */
function construirVia(piezas: Curva[]) {
  const rieles: THREE.BufferGeometry[] = [];
  const durmientes: THREE.Matrix4[] = [];
  const o = new THREE.Object3D();
  piezas.forEach((c) => {
    const L = c.getLength();
    const k = Math.max(2, Math.ceil(L * 4));
    [-1, 1].forEach((lado) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= k; i++) {
        const u = i / k;
        const p = c.getPointAt(u);
        const t = c.getTangentAt(u);
        pts.push(new THREE.Vector3(p.x - t.z * ANCHO_VIA * lado, 0.1, p.z + t.x * ANCHO_VIA * lado));
      }
      rieles.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), k, 0.04, 6, false));
    });
    const nd = Math.floor(L / 0.5);
    for (let i = 0; i <= nd; i++) {
      const u = nd === 0 ? 0 : i / nd;
      const p = c.getPointAt(u);
      const t = c.getTangentAt(u);
      o.position.set(p.x, 0.04, p.z);
      o.rotation.set(0, Math.atan2(-t.z, t.x), 0);
      o.updateMatrix();
      durmientes.push(o.matrix.clone());
    }
  });
  return { rieles, durmientes };
}

const VIAS = {
  palanca: construirVia(CONFIG.palanca.piezas),
  puente: construirVia(CONFIG.puente.piezas),
  lazo: construirVia(CONFIG.lazo.piezas),
};

const GEO_DURMIENTE = new THREE.BoxGeometry(0.2, 0.07, 0.95);

function Via({ variante }: { variante: "palanca" | "puente" | "lazo" }) {
  const via = VIAS[variante];
  const inst = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = inst.current;
    if (!m) return;
    via.durmientes.forEach((mat, i) => m.setMatrixAt(i, mat));
    m.instanceMatrix.needsUpdate = true;
  }, [via]);
  return (
    <group>
      <instancedMesh ref={inst} args={[GEO_DURMIENTE, undefined, via.durmientes.length]} receiveShadow>
        <meshStandardMaterial color="#5b4636" roughness={0.9} />
      </instancedMesh>
      {via.rieles.map((g, i) => (
        <mesh key={i} geometry={g} castShadow>
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function puntoRuta(r: THREE.CurvePath<THREE.Vector3>, s: number, lat = 0): { p: THREE.Vector3; yaw: number } {
  const L = r.getLength();
  const u = clamp01(s / L);
  const p = r.getPointAt(u) ?? new THREE.Vector3();
  const t = r.getTangentAt(u) ?? new THREE.Vector3(1, 0, 0);
  return { p: new THREE.Vector3(p.x - t.z * lat, 0, p.z + t.x * lat), yaw: Math.atan2(-t.z, t.x) };
}

/** Persona sobre la vía: cae de lado cuando el tranvía la alcanza; recibe un anillo verde si se salva. */
function EnVia({
  pos,
  yaw,
  lado,
  hitS,
  finS,
  tramS,
  color,
  casco,
  mochila,
}: {
  pos: Pt;
  yaw: number;
  lado: number;
  hitS: number | null;
  finS: number | null;
  tramS: RefObject<number>;
  color: string;
  casco?: boolean;
  mochila?: boolean;
}) {
  const giro = useRef<THREE.Group>(null);
  const cuerpo = useRef<THREE.Mesh>(null);
  const aro = useRef<THREE.Mesh>(null);
  const caida = useRef(0);
  const golpe = useRef(false);
  const base = useMemo(() => new THREE.Color(color), [color]);
  useFrame((_, dt) => {
    const s = tramS.current;
    if (hitS !== null && s + 1.05 >= hitS) golpe.current = true;
    if (golpe.current) caida.current = Math.min(1, caida.current + dt * 2.6);
    const f = 1 - Math.pow(1 - caida.current, 2);
    if (giro.current) giro.current.rotation.x = lado * f * (Math.PI / 2);
    if (cuerpo.current) (cuerpo.current.material as THREE.MeshStandardMaterial).color.lerpColors(base, GRIS, f);
    if (aro.current) aro.current.visible = finS !== null && s >= finS - 0.05;
  });
  return (
    <group position={pos} rotation={[0, yaw, 0]}>
      <group ref={giro}>
        <mesh ref={cuerpo} geometry={GEO_CUERPO} position={[0, 0.42, 0]} castShadow>
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
        <mesh geometry={GEO_CABEZA} position={[0, 0.98, 0]} castShadow>
          <meshStandardMaterial color={PIEL} roughness={0.6} />
        </mesh>
        {casco && (
          <mesh geometry={GEO_CASCO} position={[0, 1.02, 0]}>
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>
        )}
        {mochila && (
          <mesh geometry={GEO_MOCHILA} position={[-0.24, 0.55, 0]} castShadow>
            <meshStandardMaterial color="#7c3aed" roughness={0.7} />
          </mesh>
        )}
      </group>
      <mesh ref={aro} geometry={GEO_ANILLO} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <meshBasicMaterial color={OK} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Tranvia({ grupo }: { grupo: RefObject<THREE.Group | null> }) {
  return (
    <group ref={grupo}>
      <group position={[0, 0.72, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.1, 0.95, 0.92]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.45} metalness={0.2} />
        </mesh>
        <mesh position={[0, -0.28, 0]}>
          <boxGeometry args={[2.14, 0.14, 0.95]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.54, 0]} castShadow>
          <boxGeometry args={[1.9, 0.12, 0.8]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 0.14, s * 0.465]}>
            <boxGeometry args={[1.7, 0.32, 0.01]} />
            <meshStandardMaterial color="#0f172a" emissive="#fde68a" emissiveIntensity={0.18} roughness={0.2} />
          </mesh>
        ))}
        <mesh position={[1.056, 0.14, 0]}>
          <boxGeometry args={[0.01, 0.34, 0.7]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} />
        </mesh>
        <mesh position={[1.07, -0.18, 0]}>
          <sphereGeometry args={[0.08, 14, 10]} />
          <meshBasicMaterial color="#fff7d6" toneMapped={false} />
        </mesh>
        {/* Pantógrafo */}
        <mesh position={[0, 0.84, 0]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.03, 0.55, 0.03]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>
      {[-0.65, 0.65].map((x) =>
        [-1, 1].map((s) => (
          <mesh key={`${x}${s}`} position={[x, 0.2, s * 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.08, 18]} />
            <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.4} />
          </mesh>
        )),
      )}
    </group>
  );
}

const S0 = 4.4;
const T_ESPERA = 0.9;
const VEL = 8;

function EscenaVias({ variante, n, decision, modoColor }: { variante: "palanca" | "puente" | "lazo"; n: number; decision: Decision | null; modoColor: string }) {
  const cfg = CONFIG[variante];
  const tram = useRef<THREE.Group>(null);
  const tramS = useRef(S0);
  const reloj = useRef(0);
  const palanca = useRef<THREE.Group>(null);
  const empujado = useRef<THREE.Group>(null);
  const empCuerpo = useRef<THREE.Mesh>(null);
  const flecha = useRef<THREE.Mesh>(null);
  const empBase = useMemo(() => new THREE.Color("#0ea5e9"), []);

  const actuar = decision === "actuar";
  const rutaTram = actuar && variante !== "puente" ? cfg.rutaSi : cfg.rutaNo;
  const Ltram = rutaTram.getLength();

  // El grupo en riesgo, sobre la vía principal.
  const grupo = Array.from({ length: n }, (_, k) => {
    const s = cfg.grupoS + (k - (n - 1) / 2) * 0.6;
    const lat = (k % 2 === 0 ? 1 : -1) * 0.2;
    const { p, yaw } = puntoRuta(cfg.rutaNo, s, lat);
    return { s, pos: [p.x, 0, p.z] as Pt, yaw: yaw + Math.PI, lado: lat > 0 ? -1 : 1 };
  });
  const ultimoGrupo = cfg.grupoS + ((n - 1) / 2) * 0.6;

  // Dónde se detiene el tranvía.
  let sStop: number;
  if (!decision) sStop = S0;
  else if (variante === "puente") sStop = actuar ? cfg.unoS - 1.7 : Math.min(Ltram - 0.4, ultimoGrupo + 1.8);
  else if (actuar) sStop = variante === "lazo" ? cfg.unoS - 1.9 : Math.min(Ltram - 0.4, cfg.unoS + 2.6);
  else sStop = Math.min(Ltram - 0.4, ultimoGrupo + 1.8);
  const delta = sStop - S0;
  const dur = delta > 0 ? (2 * delta) / VEL : 1;

  const uno = variante === "puente" ? null : puntoRuta(cfg.rutaSi, cfg.unoS, 0);

  useFrame(({ clock }, dt) => {
    if (decision) reloj.current += Math.min(dt, 0.1);
    const t = reloj.current;
    const tau = decision ? clamp01((t - T_ESPERA) / dur) : 0;
    tramS.current = S0 + delta * (1 - (1 - tau) * (1 - tau));
    const { p, yaw } = puntoRuta(rutaTram, tramS.current);
    if (tram.current) {
      tram.current.position.set(p.x, decision ? 0 : Math.sin(clock.elapsedTime * 18) * 0.006, p.z);
      tram.current.rotation.y = yaw;
    }
    if (palanca.current) palanca.current.rotation.z += ((actuar ? -0.55 : 0.55) - palanca.current.rotation.z) * suave(dt, 0.12);
    if (flecha.current) {
      const m = flecha.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.35 + 0.25 * Math.sin(clock.elapsedTime * 3);
    }
    if (empujado.current) {
      // Cae del puente a la vía entre 0.2 s y 0.9 s.
      const f = actuar ? clamp01((t - 0.2) / 0.7) : 0;
      const e = f * f;
      empujado.current.position.set(-1.5 - 0.9 * f, 2.62 * (1 - e) + 0.17 * f, 0.1 * (1 - f) - 0.55 * f);
      empujado.current.rotation.x = f * (Math.PI / 2);
      if (empCuerpo.current) (empCuerpo.current.material as THREE.MeshStandardMaterial).color.lerpColors(empBase, GRIS, actuar ? clamp01((t - 0.9) / 0.6) : 0);
    }
  });

  const guia = variante === "puente" ? null : actuar ? cfg.rutaSi : cfg.rutaNo;
  const guiaPts = useMemo(() => {
    if (!guia) return null;
    const pts: THREE.Vector3[] = [];
    for (let s = 7.4; s <= 11; s += 0.3) {
      const { p } = puntoRuta(guia, s);
      pts.push(new THREE.Vector3(p.x, 0.16, p.z));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.07, 6, false);
  }, [guia]);

  return (
    <group>
      <Via variante={variante} />
      {guiaPts && (
        <mesh ref={flecha} geometry={guiaPts}>
          <meshBasicMaterial color={modoColor} transparent opacity={0.5} toneMapped={false} depthWrite={false} />
        </mesh>
      )}
      <Tranvia grupo={tram} />

      {grupo.map((g, k) => (
        <EnVia
          key={`g${k}`}
          pos={g.pos}
          yaw={g.yaw}
          lado={g.lado}
          hitS={decision && !actuar ? g.s : null}
          finS={decision && actuar ? sStop : null}
          tramS={tramS}
          color="#f97316"
          casco
        />
      ))}
      <Etiqueta pos={[puntoRuta(cfg.rutaNo, cfg.grupoS).p.x, 1.55, puntoRuta(cfg.rutaNo, cfg.grupoS).p.z + 1.25]} col={`${NO}aa`} fs={12}>
        <i className="fa-solid fa-helmet-safety" style={{ color: "#f97316" }} />
        {n === 1 ? "1 trabajador" : `${n} trabajadores`}
      </Etiqueta>

      {uno && (
        <>
          <EnVia
            pos={[uno.p.x, 0, uno.p.z]}
            yaw={uno.yaw + Math.PI}
            lado={-1}
            hitS={decision && actuar ? cfg.unoS - (variante === "lazo" ? 0.9 : 0) : null}
            finS={decision && !actuar ? sStop : null}
            tramS={tramS}
            color={variante === "lazo" ? "#0ea5e9" : "#f97316"}
            casco={variante === "palanca"}
            mochila={variante === "lazo"}
          />
          <Etiqueta pos={[uno.p.x, 1.75, uno.p.z - 0.8]} col="rgba(255,255,255,0.3)" fs={12}>
            <i className={`fa-solid ${variante === "lazo" ? "fa-person-hiking" : "fa-helmet-safety"}`} style={{ color: variante === "lazo" ? "#38bdf8" : "#f97316" }} />
            {variante === "lazo" ? "1 persona con mochila" : "1 trabajador"}
          </Etiqueta>
        </>
      )}

      {cfg.palanca && (
        <group position={cfg.palanca}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.5, 0.24, 0.36]} />
            <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
          </mesh>
          <group ref={palanca} position={[0, 0.24, 0]} rotation={[0, 0, 0.55]}>
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.76, 10]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.78, 0]}>
              <sphereGeometry args={[0.09, 14, 10]} />
              <meshStandardMaterial color={NO} emissive={NO} emissiveIntensity={0.4} />
            </mesh>
          </group>
          <Etiqueta pos={[0, -0.28, 0.55]} fs={10.5} df={11}>
            <i className="fa-solid fa-code-fork" style={{ color: modoColor }} />
            Palanca
          </Etiqueta>
        </group>
      )}

      {variante === "puente" && (
        <group>
          {/* Puente peatonal perpendicular a la vía */}
          <mesh position={[-1.5, 2.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.14, 5.4]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
          {[-1, 1].map((sx) => (
            <mesh key={`r${sx}`} position={[-1.5 + sx * 0.72, 2.95, 0]}>
              <boxGeometry args={[0.05, 0.05, 5.4]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
            </mesh>
          ))}
          {[-2.4, -1.2, 1.2, 2.4].map((z) =>
            [-1, 1].map((sx) => (
              <mesh key={`b${z}${sx}`} position={[-1.5 + sx * 0.72, 2.76, z]}>
                <boxGeometry args={[0.04, 0.4, 0.04]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
              </mesh>
            )),
          )}
          {[-1, 1].map((sz) => (
            <mesh key={`c${sz}`} position={[-1.5, 1.24, sz * 2.4]} castShadow>
              <boxGeometry args={[0.5, 2.5, 0.5]} />
              <meshStandardMaterial color="#475569" roughness={0.7} />
            </mesh>
          ))}
          <group ref={empujado} position={[-1.5, 2.62, 0.1]}>
            <mesh ref={empCuerpo} geometry={GEO_CUERPO} position={[0, 0.42, 0]} castShadow>
              <meshStandardMaterial color="#0ea5e9" roughness={0.55} />
            </mesh>
            <mesh geometry={GEO_CABEZA} position={[0, 0.98, 0]} castShadow>
              <meshStandardMaterial color={PIEL} roughness={0.6} />
            </mesh>
            <mesh geometry={GEO_MOCHILA} position={[0.26, 0.55, 0]} castShadow>
              <meshStandardMaterial color="#7c3aed" roughness={0.7} />
            </mesh>
          </group>
          <Etiqueta pos={[-1.5, 3.25, -2.0]} col="rgba(255,255,255,0.3)" fs={11}>
            <i className="fa-solid fa-person-hiking" style={{ color: "#38bdf8" }} />
            Persona con mochila pesada
          </Etiqueta>
        </group>
      )}

      {variante === "lazo" && (
        <Etiqueta pos={[8.2, 1.2, -1.4]} col={`${modoColor}88`} fs={10.5}>
          <i className="fa-solid fa-rotate" style={{ color: modoColor }} />
          El lazo regresa a la vía principal
        </Etiqueta>
      )}

      <Persona pos={cfg.tu} color={modoColor} yaw={variante === "puente" ? -Math.PI / 2 : 0} />
      <Etiqueta pos={[cfg.tu[0], cfg.tu[1] + (variante === "puente" ? 1.75 : 1.55), cfg.tu[2]]} col={`${modoColor}cc`} fs={12}>
        <i className="fa-solid fa-user" style={{ color: modoColor }} />
        Tú
      </Etiqueta>

      {/* Paisaje: árboles bajos alrededor */}
      {ARBOLES.map((a, k) => (
        <group key={k} position={[a[0], 0, a[1]]} scale={a[2]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.6, 8]} />
            <meshStandardMaterial color="#5b4636" />
          </mesh>
          <mesh position={[0, 1.0, 0]} castShadow>
            <coneGeometry args={[0.5, 1.2, 7]} />
            <meshStandardMaterial color="#166534" roughness={0.9} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const ARBOLES: [number, number, number][] = [
  [-8, -3.5, 1.1],
  [-6.2, -4.6, 0.9],
  [-9.5, 3.4, 1],
  [9.5, 3.2, 1.2],
  [10.5, -4.2, 1],
  [4.5, -5.2, 0.9],
  [-1.5, -5.6, 1.1],
  [1.5, 4.4, 0.8],
];

/* ── Trasplante ───────────────────────────────────────────────────────── */

const CAMAS: Pt[] = [
  [0.9, 0, -2.3],
  [2.3, 0, -1.7],
  [3.3, 0, -0.5],
  [3.4, 0, 0.9],
  [2.6, 0, 2.1],
];

function Monitor({ pos, vive, reloj, retraso }: { pos: Pt; vive: boolean; reloj: RefObject<number>; retraso: number }) {
  const pantalla = useRef<THREE.Mesh>(null);
  const pulso = useRef<THREE.Mesh>(null);
  const verde = useMemo(() => new THREE.Color("#22c55e"), []);
  const apagado = useMemo(() => new THREE.Color("#374151"), []);
  useFrame(({ clock }) => {
    const t = reloj.current;
    const f = vive ? 0 : clamp01((t - retraso) / 1.2);
    if (pantalla.current) (pantalla.current.material as THREE.MeshBasicMaterial).color.lerpColors(verde, apagado, f);
    if (pulso.current) {
      pulso.current.visible = f < 0.95;
      pulso.current.scale.y = 1 + (1 - f) * 2.5 * Math.max(0, Math.sin(clock.elapsedTime * 6 + retraso * 3)) ** 8;
    }
  });
  return (
    <group position={pos}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.1, 8]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.46, 0.34, 0.12]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh ref={pantalla} position={[0, 1.2, 0.065]}>
        <planeGeometry args={[0.38, 0.26]} />
        <meshBasicMaterial color="#22c55e" toneMapped={false} />
      </mesh>
      <mesh ref={pulso} position={[0, 1.2, 0.07]}>
        <boxGeometry args={[0.3, 0.02, 0.01]} />
        <meshBasicMaterial color="#dcfce7" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Paciente({ pos, color, gris, reloj, retraso }: { pos: Pt; color: string; gris: boolean; reloj: RefObject<number>; retraso: number }) {
  const cuerpo = useRef<THREE.Mesh>(null);
  const base = useMemo(() => new THREE.Color(color), [color]);
  useFrame(() => {
    const f = gris ? clamp01((reloj.current - retraso) / 1.2) : 0;
    if (cuerpo.current) (cuerpo.current.material as THREE.MeshStandardMaterial).color.lerpColors(base, GRIS, f);
  });
  return (
    <group position={pos}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.16, 1.8]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.8, 0.4, 1.6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.5} />
      </mesh>
      <group position={[0, 0.72, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh ref={cuerpo} geometry={GEO_CUERPO} position={[0, 0.2, 0]}>
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        <mesh geometry={GEO_CABEZA} position={[0, 0.76, 0]}>
          <meshStandardMaterial color={PIEL} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function Organo({ desde, hasta, reloj, retraso, color }: { desde: Pt; hasta: Pt; reloj: RefObject<number>; retraso: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const f = clamp01((reloj.current - retraso) / 1.4);
    if (!ref.current) return;
    ref.current.visible = f > 0 && f < 1;
    ref.current.position.set(desde[0] + (hasta[0] - desde[0]) * f, 1.2 + Math.sin(f * Math.PI) * 1.4, desde[2] + (hasta[2] - desde[2]) * f);
  });
  return (
    <mesh ref={ref} visible={false}>
      <sphereGeometry args={[0.12, 16, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} />
    </mesh>
  );
}

const SANO: Pt = [-2.6, 0, 0.4];

function EscenaTrasplante({ decision, modoColor }: { decision: Decision | null; modoColor: string }) {
  const reloj = useRef(0);
  const sano = useRef<THREE.Group>(null);
  const sanoCuerpo = useRef<THREE.Mesh>(null);
  const sanoBase = useMemo(() => new THREE.Color("#0ea5e9"), []);
  const actuar = decision === "actuar";
  useFrame((_, dt) => {
    if (decision) reloj.current += Math.min(dt, 0.1);
    const t = reloj.current;
    if (sano.current) {
      if (decision === "no") {
        // Sale del consultorio por la puerta.
        const f = clamp01((t - 0.4) / 2.2);
        sano.current.position.set(SANO[0] - f * 1.6, 0, SANO[2] - f * 2.4);
        sano.current.rotation.y = Math.PI * 0.8;
        sano.current.visible = f < 0.98;
      } else if (actuar) {
        const f = clamp01((t - 0.3) / 0.8);
        sano.current.rotation.x = -f * (Math.PI / 2);
        sano.current.position.y = f * 0.18;
      }
    }
    if (sanoCuerpo.current) (sanoCuerpo.current.material as THREE.MeshStandardMaterial).color.lerpColors(sanoBase, GRIS, actuar ? clamp01((t - 0.6) / 1) : 0);
  });
  const colores = ["#ef4444", "#f472b6", "#a16207", "#c084fc", "#c084fc"];
  return (
    <group>
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[10, 0.06, 7.4]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.6, -3.7]} receiveShadow>
        <boxGeometry args={[10, 3.2, 0.1]} />
        <meshStandardMaterial color="#5f8f89" roughness={0.9} />
      </mesh>
      <mesh position={[-5, 1.6, 0]} receiveShadow>
        <boxGeometry args={[0.1, 3.2, 7.4]} />
        <meshStandardMaterial color="#4c7a75" roughness={0.9} />
      </mesh>
      {/* Puerta */}
      <mesh position={[-4.94, 1.05, -2.2]}>
        <boxGeometry args={[0.04, 2.1, 1.1]} />
        <meshStandardMaterial color="#0f766e" roughness={0.6} />
      </mesh>
      <Etiqueta pos={[-4.7, 2.4, -2.2]} fs={10} df={8}>
        <i className="fa-solid fa-door-open" style={{ color: "#5eead4" }} />
        Salida
      </Etiqueta>

      {CAMAS.map((c, i) => (
        <group key={i}>
          <Paciente pos={c} color="#fde68a" gris={decision === "no"} reloj={reloj} retraso={2.4 + i * 0.35} />
          <Monitor pos={[c[0] - 0.75, 0, c[2] - 0.6]} vive={decision !== "no"} reloj={reloj} retraso={2.4 + i * 0.35} />
          <Etiqueta pos={[c[0] + 0.15, 0.95, c[2] + 1.05]} fs={10} df={7} col="rgba(255,255,255,0.28)">
            <i className="fa-solid fa-heart-pulse" style={{ color: colores[i] }} />
            Necesita {ORGANOS[i]!.toLowerCase()}
          </Etiqueta>
          {actuar && <Organo desde={SANO} hasta={c} reloj={reloj} retraso={1.2 + i * 0.3} color={colores[i]!} />}
          <Anillo pos={c} color={OK} on={actuar} radio={2.2} />
        </group>
      ))}

      <group ref={sano} position={SANO}>
        <mesh ref={sanoCuerpo} geometry={GEO_CUERPO} position={[0, 0.42, 0]} castShadow>
          <meshStandardMaterial color="#0ea5e9" roughness={0.55} />
        </mesh>
        <mesh geometry={GEO_CABEZA} position={[0, 0.98, 0]} castShadow>
          <meshStandardMaterial color={PIEL} roughness={0.6} />
        </mesh>
      </group>
      <Anillo pos={SANO} color={OK} on={decision === "no"} radio={1.2} />
      <Etiqueta pos={[SANO[0], 1.6, SANO[2]]} col="rgba(255,255,255,0.3)" fs={11} df={8}>
        <i className="fa-solid fa-user-check" style={{ color: "#38bdf8" }} />
        Persona sana en revisión
      </Etiqueta>

      <Persona pos={[-0.6, 0, 0.9]} color="#14b8a6" yaw={0.6} />
      <Etiqueta pos={[-0.6, 1.5, 1.2]} col={`${modoColor}cc`} fs={11} df={8}>
        <i className="fa-solid fa-user-doctor" style={{ color: modoColor }} />
        Tú, cirujano
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. DILEMAS COTIDIANOS
 * ════════════════════════════════════════════════════════════════════════ */

/** Etiqueta de un posible afectado: se enciende cuando el alumno lo marca. */
function EtqAfectado({ pos, casoId, id, marcados, modoColor }: { pos: Pt; casoId: CasoId; id: string; marcados: string[]; modoColor: string }) {
  const caso = CASOS.find((c) => c.id === casoId)!;
  const a = caso.afectados.find((x) => x.id === id);
  if (!a) return null;
  const on = marcados.includes(id);
  return (
    <Etiqueta pos={pos} col={on ? modoColor : "rgba(255,255,255,0.22)"} fs={11} df={10}>
      <i className={`fa-solid ${on ? "fa-circle-check" : "fa-user"}`} style={{ color: on ? modoColor : "rgba(255,255,255,0.55)" }} />
      {a.etq}
    </Etiqueta>
  );
}

function Pupitre({ pos }: { pos: Pt }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.06, 0.6]} />
        <meshStandardMaterial color="#b45309" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.36, -0.22]}>
        <boxGeometry args={[0.9, 0.7, 0.05]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Salon({ pizarron }: { pizarron: string }) {
  return (
    <group>
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[9.5, 0.06, 7.6]} />
        <meshStandardMaterial color="#6b5344" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.7, -3.8]} receiveShadow>
        <boxGeometry args={[9.5, 3.4, 0.1]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.9, -3.72]}>
        <boxGeometry args={[4.2, 1.5, 0.05]} />
        <meshStandardMaterial color={pizarron} roughness={0.8} />
      </mesh>
      <mesh position={[4.75, 1.7, 0]} receiveShadow>
        <boxGeometry args={[0.1, 3.4, 7.6]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.9} />
      </mesh>
    </group>
  );
}

const ASIENTOS: Pt[] = [
  [-2.4, 0, -0.4],
  [-0.8, 0, -0.4],
  [0.8, 0, -0.4],
  [2.4, 0, -0.4],
  [-2.4, 0, 1.3],
  [-0.8, 0, 1.3],
  [0.8, 0, 1.3],
  [2.4, 0, 1.3],
];
const COLORES_GRUPO = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#ec4899"];

function EscenaExamen({ marcados, postura, modoColor }: { marcados: string[]; postura: "A" | "B" | null; modoColor: string }) {
  const hoja = useRef<THREE.Mesh>(null);
  const libro = useRef<THREE.Mesh>(null);
  const reloj = useRef(0);
  const TU = 6;
  const AMIGO = 5;
  useFrame((_, dt) => {
    if (postura) reloj.current += Math.min(dt, 0.1);
    const t = reloj.current;
    const tu = ASIENTOS[TU]!;
    const am = ASIENTOS[AMIGO]!;
    if (hoja.current) {
      const f = postura === "A" ? clamp01((t - 0.3) / 1.2) : 0;
      hoja.current.position.set(tu[0] + (am[0] - tu[0]) * f, 0.77 + Math.sin(f * Math.PI) * 0.6, tu[2] + 0.02);
      hoja.current.rotation.y = f * Math.PI * 2;
    }
    if (libro.current) {
      const f = postura === "B" ? clamp01((t - 0.3) / 0.8) : 0;
      libro.current.scale.setScalar(Math.max(0.001, f));
      libro.current.position.y = 1.35 + Math.sin(t * 2) * 0.05;
    }
  });
  const grupoIdx = [0, 1, 2, 3, 4, 7];
  const tu = ASIENTOS[TU]!;
  const am = ASIENTOS[AMIGO]!;
  return (
    <group position={[0, 0, 0.2]}>
      <Salon pizarron="#14532d" />
      <mesh position={[0, 0.5, -2.6]} castShadow>
        <boxGeometry args={[1.8, 1.0, 0.8]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>
      <Persona pos={[1.4, 0, -2.9]} color="#0f766e" />
      <Anillo pos={[1.4, 0, -2.9]} color={modoColor} on={marcados.includes("profe")} />
      <EtqAfectado pos={[1.4, 1.55, -2.9]} casoId="examen" id="profe" marcados={marcados} modoColor={modoColor} />
      {ASIENTOS.map((a, i) => (
        <group key={i}>
          <Pupitre pos={a} />
          <Persona pos={[a[0], -0.2, a[2] + 0.5]} color={i === TU ? modoColor : i === AMIGO ? "#fb7185" : COLORES_GRUPO[i]!} escala={0.95} />
          {grupoIdx.includes(i) && <Anillo pos={[a[0], 0, a[2] + 0.5]} color={modoColor} on={marcados.includes("grupo")} />}
          <mesh position={[a[0] + 0.1, 0.76, a[2]]}>
            <boxGeometry args={[0.3, 0.01, 0.4]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      ))}
      <mesh ref={hoja} position={[tu[0], 0.77, tu[2]]}>
        <boxGeometry args={[0.32, 0.015, 0.42]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.3} />
      </mesh>
      <mesh ref={libro} position={[(tu[0] + am[0]) / 2, 1.9, tu[2]]} scale={0.001}>
        <boxGeometry args={[0.5, 0.12, 0.38]} />
        <meshStandardMaterial color="#2563eb" roughness={0.5} />
      </mesh>
      <Anillo pos={[tu[0], 0, tu[2] + 0.5]} color={modoColor} on={marcados.includes("tu")} />
      <Anillo pos={[am[0], 0, am[2] + 0.5]} color={modoColor} on={marcados.includes("amigo")} />
      <EtqAfectado pos={[tu[0] + 0.2, 0.2, tu[2] + 1.15]} casoId="examen" id="tu" marcados={marcados} modoColor={modoColor} />
      <EtqAfectado pos={[am[0] - 0.2, 0.2, am[2] + 1.15]} casoId="examen" id="amigo" marcados={marcados} modoColor={modoColor} />
      <EtqAfectado pos={[-3.3, 1.45, -0.4]} casoId="examen" id="grupo" marcados={marcados} modoColor={modoColor} />
      {postura === "B" && (
        <Etiqueta pos={[(tu[0] + am[0]) / 2, 1.85, tu[2]]} col={`${OK}aa`} fs={10.5} df={8}>
          <i className="fa-solid fa-book-open" style={{ color: OK }} />
          Estudiar juntos después
        </Etiqueta>
      )}
    </group>
  );
}

function EscenaProyector({ marcados, postura, modoColor }: { marcados: string[]; postura: "A" | "B" | null; modoColor: string }) {
  const tu = useRef<THREE.Group>(null);
  const comp = useRef<THREE.Group>(null);
  const chispa = useRef<THREE.Mesh>(null);
  const reloj = useRef(0);
  const TU0: Pt = [2.4, 0, 2.3];
  const COMP0: Pt = [-0.9, 0, -1.6];
  const DIR: Pt = [3.9, 0, -2.6];
  useFrame(({ clock }, dt) => {
    if (postura) reloj.current += Math.min(dt, 0.1);
    const t = reloj.current;
    const mover = (g: THREE.Group | null, a: Pt, b: Pt, f: number) => {
      if (!g) return;
      g.position.set(a[0] + (b[0] - a[0]) * f, 0, a[2] + (b[2] - a[2]) * f);
    };
    if (postura === "A") {
      mover(tu.current, TU0, [DIR[0] - 0.7, 0, DIR[2] + 0.5], clamp01((t - 0.2) / 2));
      mover(comp.current, COMP0, COMP0, 0);
    } else if (postura === "B") {
      const junto: Pt = [COMP0[0] + 0.7, 0, COMP0[2] + 0.5];
      mover(tu.current, TU0, junto, clamp01((t - 0.2) / 1.6));
      mover(comp.current, COMP0, [DIR[0] - 0.7, 0, DIR[2] + 0.4], clamp01((t - 2.1) / 1.8));
    }
    if (chispa.current) {
      chispa.current.visible = Math.sin(clock.elapsedTime * 13) > 0.2;
    }
  });
  const grupoIdx = [0, 1, 3, 4, 5, 7];
  return (
    <group position={[0, 0, 0.2]}>
      <Salon pizarron="#f1f5f9" />
      {/* Proyector roto en su carrito */}
      <group position={[-0.1, 0, -1.6]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.8, 0.8, 0.6]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
        <group position={[0.05, 0.9, 0]} rotation={[0.25, 0.3, -0.35]}>
          <mesh castShadow>
            <boxGeometry args={[0.55, 0.2, 0.45]} />
            <meshStandardMaterial color="#e5e7eb" roughness={0.4} />
          </mesh>
          <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.1, 16]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh ref={chispa} position={[0.1, 0.12, 0.1]}>
            <octahedronGeometry args={[0.07]} />
            <meshBasicMaterial color="#fde047" toneMapped={false} />
          </mesh>
        </group>
      </group>
      <Etiqueta pos={[-0.1, 0.15, -0.95]} col={`${NO}aa`} fs={10} df={8}>
        <i className="fa-solid fa-triangle-exclamation" style={{ color: NO }} />
        Proyector roto
      </Etiqueta>
      {/* Puerta de la dirección */}
      <mesh position={[4.68, 1.05, -2.6]}>
        <boxGeometry args={[0.04, 2.1, 1.1]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.6} />
      </mesh>
      <Persona pos={DIR} color="#be185d" yaw={-Math.PI / 2} />
      <Anillo pos={DIR} color={modoColor} on={marcados.includes("direccion")} />
      <EtqAfectado pos={[DIR[0] + 0.1, 2.05, DIR[2]]} casoId="proyector" id="direccion" marcados={marcados} modoColor={modoColor} />
      {ASIENTOS.map((a, i) =>
        grupoIdx.includes(i) ? (
          <group key={i}>
            <Pupitre pos={a} />
            <Persona pos={[a[0], -0.2, a[2] + 0.5]} color={COLORES_GRUPO[i]!} escala={0.95} />
            <Anillo pos={[a[0], 0, a[2] + 0.5]} color={modoColor} on={marcados.includes("grupo")} />
          </group>
        ) : (
          <Pupitre key={i} pos={a} />
        ),
      )}
      <EtqAfectado pos={[-3.3, 1.45, -0.4]} casoId="proyector" id="grupo" marcados={marcados} modoColor={modoColor} />
      <group ref={comp} position={COMP0}>
        <Persona pos={[0, 0, 0]} color="#fb7185" />
        <Anillo pos={[0, 0, 0]} color={modoColor} on={marcados.includes("companero")} />
        <EtqAfectado pos={[0, 0.1, 0.55]} casoId="proyector" id="companero" marcados={marcados} modoColor={modoColor} />
      </group>
      <group ref={tu} position={TU0}>
        <Persona pos={[0, 0, 0]} color={modoColor} />
        <Anillo pos={[0, 0, 0]} color={modoColor} on={marcados.includes("tu")} />
        <EtqAfectado pos={[0, 1.5, 0]} casoId="proyector" id="tu" marcados={marcados} modoColor={modoColor} />
      </group>
    </group>
  );
}

function EscenaAuto({ marcados, postura, modoColor }: { marcados: string[]; postura: "A" | "B" | null; modoColor: string }) {
  const auto = useRef<THREE.Group>(null);
  const luz = useRef<THREE.Mesh>(null);
  const destello = useRef<THREE.Mesh>(null);
  const reloj = useRef(0);
  const X0 = -5.2;
  useFrame(({ clock }, dt) => {
    if (postura) reloj.current += Math.min(dt, 0.1);
    const t = reloj.current;
    const g = auto.current;
    let fin = 0;
    if (g) {
      if (!postura) {
        g.position.set(X0, 0, 0.55);
        g.rotation.y = 0;
      } else if (postura === "B") {
        const f = clamp01(t / 2.2);
        const e = 1 - (1 - f) * (1 - f);
        g.position.set(X0 + (1.6 - X0) * e, 0, 0.55);
        g.rotation.y = 0;
        fin = f;
      } else {
        const f = clamp01(t / 2.2);
        const e = 1 - (1 - f) * (1 - f);
        const x = X0 + (0.75 - X0) * e;
        const giro = clamp01((e - 0.55) / 0.45);
        g.position.set(x, 0, 0.55 - giro * giro * 1.75);
        g.rotation.y = giro * 0.7;
        fin = f;
      }
    }
    if (luz.current) luz.current.visible = Math.sin(clock.elapsedTime * 8) > 0;
    if (destello.current) {
      const k = fin >= 1 ? clamp01(1 - (t - 2.2) / 0.8) : 0;
      destello.current.visible = k > 0.01;
      destello.current.scale.setScalar(0.5 + (1 - k) * 1.6);
      (destello.current.material as THREE.MeshBasicMaterial).opacity = k * 0.8;
    }
  });
  const peatones: Pt[] = [
    [3.3, 0, -0.9],
    [3.0, 0, 0.1],
    [3.4, 0, 1.0],
  ];
  return (
    <group>
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[18, 0.06, 3.4]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.06, s * 2.3]} receiveShadow>
          <boxGeometry args={[18, 0.18, 1.2]} />
          <meshStandardMaterial color="#9ca3af" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, k) => (
        <mesh key={k} position={[-7.5 + k * 2.2, 0.005, 0]}>
          <boxGeometry args={[1, 0.01, 0.08]} />
          <meshBasicMaterial color="#fde047" />
        </mesh>
      ))}
      {Array.from({ length: 7 }, (_, k) => (
        <mesh key={k} position={[3.2, 0.006, -1.45 + k * 0.48]}>
          <boxGeometry args={[0.9, 0.012, 0.3]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}
      {/* Muro */}
      <mesh position={[1.6, 0.75, -2.05]} castShadow>
        <boxGeometry args={[2.6, 1.5, 0.45]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.95} />
      </mesh>
      <Etiqueta pos={[1.6, 1.85, -2.3]} fs={10.5} df={9}>
        <i className="fa-solid fa-road-barrier" style={{ color: "#d6d3d1" }} />
        Muro
      </Etiqueta>
      {peatones.map((p, i) => (
        <group key={i}>
          <Persona pos={p} color={["#ef4444", "#10b981", "#8b5cf6"][i]!} yaw={Math.PI / 2} />
          <Anillo pos={p} color={postura === "B" ? NO : modoColor} on={postura === "B" || marcados.includes("peatones")} />
        </group>
      ))}
      <EtqAfectado pos={[3.2, 1.6, -1.3]} casoId="auto" id="peatones" marcados={marcados} modoColor={modoColor} />
      <group ref={auto} position={[X0, 0, 0.55]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[1.9, 0.5, 1.0]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[-0.1, 0.83, 0]} castShadow>
          <boxGeometry args={[1.05, 0.38, 0.9]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.45} metalness={0.3} roughness={0.1} />
        </mesh>
        <mesh position={[-0.15, 0.86, 0.1]}>
          <sphereGeometry args={[0.13, 14, 10]} />
          <meshStandardMaterial color={PIEL} />
        </mesh>
        <mesh position={[0.1, 1.08, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.1, 16]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        {[-0.6, 0.6].map((x) =>
          [-1, 1].map((s) => (
            <mesh key={`${x}${s}`} position={[x, 0.2, s * 0.5]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.12, 18]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
          )),
        )}
        <mesh ref={luz} position={[-0.97, 0.5, 0.35]}>
          <sphereGeometry args={[0.06, 10, 8]} />
          <meshBasicMaterial color="#f59e0b" toneMapped={false} />
        </mesh>
        <Anillo pos={[0, 0, 0]} color={postura === "A" ? NO : modoColor} on={postura === "A" || marcados.includes("pasajero")} radio={2.7} />
        <EtqAfectado pos={[0, 1.65, 0]} casoId="auto" id="pasajero" marcados={marcados} modoColor={modoColor} />
        <mesh ref={destello} position={[0.95, 0.5, 0]} visible={false}>
          <sphereGeometry args={[0.5, 16, 12]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0} toneMapped={false} depthWrite={false} />
        </mesh>
      </group>
      {!postura && (
        <Etiqueta pos={[X0, 2.2, 0.55]} col={`${NO}aa`} fs={11}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: "#f59e0b" }} />
          Fallan los frenos
        </Etiqueta>
      )}
    </group>
  );
}

/** Reparto ilustrativo de la misma agua: A = partes iguales, B = prioridad al centro de salud. */
const TINACOS: { id: "salud" | "escuela" | "familias"; x: number; etq: string; color: string; A: number; B: number; fA: string; fB: string }[] = [
  { id: "salud", x: -0.6, etq: "Centro de salud", color: "#f8fafc", A: 0.5, B: 0.75, fA: "1/3", fB: "1/2" },
  { id: "escuela", x: 1.8, etq: "Escuela", color: "#fcd34d", A: 0.5, B: 0.375, fA: "1/3", fB: "1/4" },
  { id: "familias", x: 4.2, etq: "Familias", color: "#fdba74", A: 0.5, B: 0.375, fA: "1/3", fB: "1/4" },
];
const N_GOTAS = 36;
const PIPA: Pt = [-3.6, 0, 1.2];

function EscenaAgua({ marcados, postura, modoColor }: { marcados: string[]; postura: "A" | "B" | null; modoColor: string }) {
  const niveles = useRef([0.12, 0.12, 0.12]);
  const agua0 = useRef<THREE.Mesh>(null);
  const agua1 = useRef<THREE.Mesh>(null);
  const agua2 = useRef<THREE.Mesh>(null);
  const gotas = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }, dt) => {
    const metas = TINACOS.map((t) => (postura === "A" ? t.A : postura === "B" ? t.B : 0.12));
    // Se llena un tinaco a la vez, en orden.
    const i = metas.findIndex((m, k) => niveles.current[k]! < m - 0.005);
    const nuevos = niveles.current.map((v, k) => (k === i ? Math.min(metas[k]!, v + dt * 0.35) : postura ? v : 0.12));
    niveles.current = nuevos;
    [agua0.current, agua1.current, agua2.current].forEach((m, k) => {
      if (!m) return;
      const h = nuevos[k]! * 1.1;
      m.scale.y = Math.max(0.001, h);
      m.position.y = 1.0 + h / 2;
    });
    const mesh = gotas.current;
    if (mesh) {
      const destino = i >= 0 ? TINACOS[i]! : null;
      for (let g = 0; g < N_GOTAS; g++) {
        const p = (clock.elapsedTime * 0.8 + g / N_GOTAS) % 1;
        if (destino) {
          obj.position.set(PIPA[0] + 0.9 + (destino.x - PIPA[0] - 0.9) * p, 1.4 + Math.sin(p * Math.PI) * 1.4 + p * 0.9, PIPA[2] + (-1.2 - PIPA[2]) * p);
          obj.scale.setScalar(0.07);
        } else obj.scale.setScalar(0.0001);
        obj.updateMatrix();
        mesh.setMatrixAt(g, obj.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  });
  const aguas = [agua0, agua1, agua2];
  return (
    <group>
      <mesh position={[0.4, -0.03, 0]} receiveShadow>
        <boxGeometry args={[13, 0.06, 8]} />
        <meshStandardMaterial color="#a16207" roughness={1} />
      </mesh>
      {/* Pipa */}
      <group position={PIPA}>
        <mesh position={[-1.1, 0.75, 0]} castShadow>
          <boxGeometry args={[0.9, 1.0, 1.1]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
        </mesh>
        <mesh position={[0.45, 0.95, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 2.1, 24]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.6} roughness={0.3} />
        </mesh>
        {[-1.1, 0, 1].map((x) =>
          [-1, 1].map((s) => (
            <mesh key={`${x}${s}`} position={[x, 0.22, s * 0.55]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.14, 16]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
          )),
        )}
      </group>
      <Etiqueta pos={[PIPA[0], 2.0, PIPA[2]]} fs={10.5} df={8}>
        <i className="fa-solid fa-truck-droplet" style={{ color: "#60a5fa" }} />
        Una pipa por semana
      </Etiqueta>
      <instancedMesh ref={gotas} args={[undefined, undefined, N_GOTAS]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.5} />
      </instancedMesh>
      {TINACOS.map((t, k) => (
        <group key={t.id}>
          {/* Edificio detrás */}
          <mesh position={[t.x, 0.8, -2.6]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 1.6, 1.3]} />
            <meshStandardMaterial color={t.color} roughness={0.8} />
          </mesh>
          {t.id === "salud" && (
            <group position={[t.x, 1.1, -1.94]}>
              <mesh>
                <boxGeometry args={[0.5, 0.14, 0.02]} />
                <meshBasicMaterial color="#14b8a6" />
              </mesh>
              <mesh>
                <boxGeometry args={[0.14, 0.5, 0.02]} />
                <meshBasicMaterial color="#14b8a6" />
              </mesh>
            </group>
          )}
          {/* Torre y tinaco */}
          <mesh position={[t.x, 0.5, -1.2]}>
            <boxGeometry args={[0.9, 1.0, 0.9]} />
            <meshStandardMaterial color="#78716c" roughness={0.9} />
          </mesh>
          <mesh position={[t.x, 1.6, -1.2]}>
            <cylinderGeometry args={[0.52, 0.48, 1.2, 28, 1, true]} />
            <meshStandardMaterial color="#1f2937" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh ref={aguas[k]} position={[t.x, 1.06, -1.2]}>
            <cylinderGeometry args={[0.46, 0.44, 1, 28]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.35} transparent opacity={0.85} />
          </mesh>
          <Etiqueta pos={[t.x, 2.75, -1.2]} fs={10} df={8} col={postura ? `${modoColor}aa` : undefined}>
            <i className={`fa-solid ${t.id === "salud" ? "fa-house-medical" : t.id === "escuela" ? "fa-school" : "fa-house-chimney"}`} style={{ color: modoColor }} />
            {t.etq}
            {postura ? ` · ${postura === "A" ? t.fA : t.fB}` : ""}
          </Etiqueta>
        </group>
      ))}
      {/* Quienes reciben el agua */}
      <Persona pos={[-0.6, 0, 0.1]} color="#14b8a6" />
      <Anillo pos={[-0.6, 0, 0.1]} color={modoColor} on={marcados.includes("salud")} />
      <Persona pos={[1.8, 0, 0.1]} color="#f59e0b" escala={0.8} />
      <Anillo pos={[1.8, 0, 0.1]} color={modoColor} on={marcados.includes("escuela")} />
      {[3.8, 4.6].map((x) => (
        <group key={x}>
          <Persona pos={[x, 0, 0.1]} color={x < 4 ? "#ef4444" : "#8b5cf6"} escala={x < 4 ? 1 : 0.75} />
          <Anillo pos={[x, 0, 0.1]} color={modoColor} on={marcados.includes("familias")} />
        </group>
      ))}
      {/* Asamblea */}
      {Array.from({ length: 5 }, (_, k) => {
        const a = (k / 5) * Math.PI * 2;
        const p: Pt = [-0.4 + Math.cos(a) * 0.8, 0, 2.5 + Math.sin(a) * 0.55];
        return (
          <group key={k}>
            <Persona pos={p} color={COLORES_GRUPO[k]!} yaw={-a - Math.PI / 2} escala={0.9} />
            <Anillo pos={p} color={modoColor} on={marcados.includes("asamblea")} radio={0.8} />
          </group>
        );
      })}
      <EtqAfectado pos={[-0.4, 0.1, 3.45]} casoId="agua" id="asamblea" marcados={marcados} modoColor={modoColor} />
      <EtqAfectado pos={[-1.1, 0.1, 0.8]} casoId="agua" id="salud" marcados={marcados} modoColor={modoColor} />
      <EtqAfectado pos={[2.2, 0.1, 1.5]} casoId="agua" id="escuela" marcados={marcados} modoColor={modoColor} />
      <EtqAfectado pos={[4.2, 0.1, 0.85]} casoId="agua" id="familias" marcados={marcados} modoColor={modoColor} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. BALANZA DE ARGUMENTOS
 * ════════════════════════════════════════════════════════════════════════ */

const BRAZO = 2.2;
const Y_VIGA = 2.4;
const N_HAB = HABLANTES.length;
const COL_HAB = ["#f472b6", "#60a5fa", "#fbbf24", "#34d399", "#c084fc", "#fb923c"];

/** Los seis participantes, en semicírculo detrás de la balanza. */
function posHablante(i: number): Pt {
  const a = Math.PI * (0.1 + (0.8 * i) / (N_HAB - 1));
  return [-Math.cos(a) * 5.6, 0, -Math.sin(a) * 2.4 - 2.2];
}

function Hablante({ i, activo, modoColor }: { i: number; activo: boolean; modoColor: string }) {
  const g = useRef<THREE.Group>(null);
  const p = posHablante(i);
  useFrame(({ clock }, dt) => {
    if (!g.current) return;
    const meta = activo ? 0.3 + Math.sin(clock.elapsedTime * 5) * 0.03 : 0;
    g.current.position.y += (meta - g.current.position.y) * suave(dt, 0.1);
  });
  return (
    <group position={p}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[0.45, 0.5, 0.24, 24]} />
        <meshStandardMaterial color={activo ? modoColor : "#334155"} emissive={activo ? modoColor : "#000"} emissiveIntensity={activo ? 0.35 : 0} roughness={0.6} />
      </mesh>
      <group ref={g}>
        <Persona pos={[0, 0.24, 0]} color={COL_HAB[i]!} />
      </group>
      <Etiqueta pos={[0, -0.05, 0.75]} fs={10.5} df={10} col={activo ? modoColor : undefined}>
        {HABLANTES[i]}
      </Etiqueta>
    </group>
  );
}

function EscenaDialogo({ actualId, clasificados, modoColor }: { actualId: string | null; clasificados: string[]; modoColor: string }) {
  const viga = useRef<THREE.Group>(null);
  const platoF = useRef<THREE.Group>(null);
  const platoL = useRef<THREE.Group>(null);
  const ang = useRef(0);
  const p = pesos(clasificados);
  const destino = inclinacion(p);
  const actual = INTERVENCIONES.find((x) => x.id === actualId) ?? null;
  useFrame((_, dt) => {
    ang.current += (destino - ang.current) * suave(dt, 0.05);
    const a = ang.current;
    if (viga.current) viga.current.rotation.z = -a;
    if (platoF.current) platoF.current.position.set(-Math.cos(a) * BRAZO, Y_VIGA + Math.sin(a) * BRAZO, 0);
    if (platoL.current) platoL.current.position.set(Math.cos(a) * BRAZO, Y_VIGA - Math.sin(a) * BRAZO, 0);
  });
  const bloques = (lado: "fines" | "limites") =>
    clasificados
      .map((id) => INTERVENCIONES.find((x) => x.id === id)!)
      .filter((x) => x && !esFalacia(x.clase) && x.lado === lado)
      .map((x, k) => ({ x, y: 0.12 + k * 0.2 }));
  const falacias = clasificados.map((id) => INTERVENCIONES.find((x) => x.id === id)!).filter((x) => x && esFalacia(x.clase));
  const hab = actual ? posHablante(actual.hablante) : null;
  const clasificada = !!actual && clasificados.includes(actual.id);
  const colClase = actual ? (esFalacia(actual.clase) ? NO : TEORIA_DEF[actual.clase as keyof typeof TEORIA_DEF].color) : "#fff";

  return (
    <group position={[0, -0.8, 0]}>
      {/* Piso del ágora */}
      <mesh position={[0, -0.05, -0.8]} receiveShadow>
        <cylinderGeometry args={[7.2, 7.2, 0.1, 72]} />
        <meshStandardMaterial color="#3f3a36" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.005, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.3, 3.45, 72]} />
        <meshBasicMaterial color={modoColor} transparent opacity={0.35} />
      </mesh>
      {HABLANTES.map((_, i) => (
        <Hablante key={i} i={i} activo={actual?.hablante === i} modoColor={modoColor} />
      ))}
      {actual && hab && (
        <Html position={[hab[0] * 0.92, 2.55, hab[2]]} center distanceFactor={10} zIndexRange={[25, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              width: 250,
              padding: "9px 12px",
              borderRadius: 12,
              background: "#fff",
              color: "#0f172a",
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1.35,
              boxShadow: "0 10px 24px -10px #000",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: "#64748b" }}>{HABLANTES[actual.hablante]} dice:</span>
              {clasificada && (
                <span style={{ fontSize: 9.5, fontWeight: 900, color: "#fff", background: colClase, padding: "2px 7px", borderRadius: 999, whiteSpace: "nowrap" }}>
                  {esFalacia(actual.clase) ? "Falacia: " : ""}
                  {etiquetaClase(actual.clase)}
                </span>
              )}
            </div>
            «{actual.texto}»
          </div>
        </Html>
      )}

      {/* Balanza */}
      <group position={[0, 0, 2.2]}>
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.8, 0.2, 32]} />
          <meshStandardMaterial color="#78350f" metalness={0.3} roughness={0.45} />
        </mesh>
        <mesh position={[0, Y_VIGA / 2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, Y_VIGA, 16]} />
          <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.3} />
        </mesh>
        <group ref={viga} position={[0, Y_VIGA, 0]}>
          <mesh castShadow>
            <boxGeometry args={[BRAZO * 2 + 0.2, 0.09, 0.11]} />
            <meshStandardMaterial color="#d97706" metalness={0.7} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <coneGeometry args={[0.05, 0.45, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.25} />
          </mesh>
        </group>
        {(["fines", "limites"] as const).map((lado) => (
          <group key={lado} ref={lado === "fines" ? platoF : platoL} position={[lado === "fines" ? -BRAZO : BRAZO, Y_VIGA, 0]}>
            {[-0.5, 0.5].map((x) => (
              <mesh key={x} position={[x * 0.8, -0.5, 0]} rotation={[0, 0, x * 0.72]}>
                <cylinderGeometry args={[0.011, 0.011, 1.15, 6]} />
                <meshStandardMaterial color="#e5e7eb" />
              </mesh>
            ))}
            <group position={[0, -1.0, 0]}>
              <mesh receiveShadow>
                <cylinderGeometry args={[0.8, 0.66, 0.07, 32]} />
                <meshStandardMaterial color="#b45309" metalness={0.6} roughness={0.3} />
              </mesh>
              {bloques(lado).map(({ x, y }) => (
                <mesh key={x.id} position={[0, y, 0]} castShadow>
                  <boxGeometry args={[0.86, 0.17, 0.58]} />
                  <meshStandardMaterial color={TEORIA_DEF[x.clase as keyof typeof TEORIA_DEF].color} roughness={0.45} emissive={x.id === actualId ? "#ffffff" : "#000"} emissiveIntensity={x.id === actualId ? 0.25 : 0} />
                </mesh>
              ))}
            </group>
          </group>
        ))}
        <Etiqueta pos={[-BRAZO, 0.7, 0.3]} col="#fbbf24aa" fs={11}>
          <i className="fa-solid fa-bullseye" style={{ color: "#fbbf24" }} />
          {LADO_DEF.fines.corto} · {p.fines}
        </Etiqueta>
        <Etiqueta pos={[BRAZO, 0.7, 0.3]} col="#60a5faaa" fs={11}>
          <i className="fa-solid fa-shield-halved" style={{ color: "#60a5fa" }} />
          {LADO_DEF.limites.corto} · {p.limites}
        </Etiqueta>
      </group>

      {/* Cesto de falacias */}
      <group position={[4.6, 0, 2.9]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.55, 0.42, 0.8, 24, 1, true]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.04, 24]} />
          <meshStandardMaterial color="#450a0a" />
        </mesh>
        {falacias.map((f, k) => (
          <mesh key={f.id} position={[Math.sin(k * 2.1) * 0.15, 0.15 + k * 0.17, Math.cos(k * 2.1) * 0.15]} rotation={[0, k * 0.7, 0.2]}>
            <boxGeometry args={[0.5, 0.14, 0.35]} />
            <meshStandardMaterial color={NO} emissive={NO} emissiveIntensity={0.3} />
          </mesh>
        ))}
        <Etiqueta pos={[0, 1.3, 0]} col={`${NO}aa`} fs={10.5}>
          <i className="fa-solid fa-trash-can" style={{ color: NO }} />
          Falacias: no pesan · {falacias.length}
        </Etiqueta>
      </group>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function DilemaTranviaScene(p: DilemaSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "tranvia") {
      if (p.variante === "palanca") return { pos: [-3.5, 8.4, 10.6], target: [1.2, 0, -0.9] };
      if (p.variante === "puente") return { pos: [-7, 6.2, 9.6], target: [0.4, 1, 0] };
      if (p.variante === "lazo") return { pos: [-2, 9.8, 10.8], target: [1.8, 0, -1.2] };
      return { pos: [-1.2, 8.2, 9.6], target: [0.4, 0.4, -0.2] };
    }
    if (vista === "cotidiano") {
      if (p.casoId === "auto") return { pos: [-4.5, 6.8, 7.8], target: [0, 0.3, -0.2] };
      if (p.casoId === "agua") return { pos: [0.6, 8.4, 10.6], target: [0.5, 0.5, -0.5] };
      return { pos: [2.6, 7.2, 8.4], target: [0, 0.3, -0.9] };
    }
    return { pos: [0, 6.8, 11.8], target: [0, 1.0, -0.6] };
  }, [vista, p.variante, p.casoId]);

  const clave = vista === "tranvia" ? p.variante : vista === "cotidiano" ? p.casoId : "dialogo";

  return (
    <Canvas key={`${vista}-${clave}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#040a16"]} />
      <fog attach="fog" args={["#040a16", 20, 44]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 10, 6]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
      <pointLight position={[-6, 3, 5]} intensity={0.4} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[0, 5, -6]} scale={[10, 6, 1]} color="#93c5fd" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 0, 4]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "tranvia" && (
        <group>
          {p.variante !== "trasplante" && (
            <mesh position={[0, -0.06, -0.4]} receiveShadow>
              <cylinderGeometry args={[12.5, 12.5, 0.1, 72]} />
              <meshStandardMaterial color="#1a2e22" roughness={0.95} />
            </mesh>
          )}
          {p.variante === "trasplante" ? (
            <EscenaTrasplante key={`t-${p.decision}-${p.animNonce}`} decision={p.decision} modoColor={modoColor} />
          ) : (
            <EscenaVias key={`v-${p.variante}-${p.decision}-${p.animNonce}`} variante={p.variante} n={enRiesgo(p.variante, p.n)} decision={p.decision} modoColor={modoColor} />
          )}
        </group>
      )}
      {vista === "cotidiano" && (
        <group key={`${p.casoId}-${p.postura}-${p.animNonce}`}>
          {p.casoId === "examen" && <EscenaExamen marcados={p.marcados} postura={p.postura} modoColor={modoColor} />}
          {p.casoId === "proyector" && <EscenaProyector marcados={p.marcados} postura={p.postura} modoColor={modoColor} />}
          {p.casoId === "auto" && <EscenaAuto marcados={p.marcados} postura={p.postura} modoColor={modoColor} />}
          {p.casoId === "agua" && <EscenaAgua marcados={p.marcados} postura={p.postura} modoColor={modoColor} />}
        </group>
      )}
      {vista === "dialogo" && <EscenaDialogo actualId={p.actualId} clasificados={p.clasificados} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={24} maxPolarAngle={Math.PI * 0.46} minPolarAngle={Math.PI * 0.05} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.62} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.65} />
      </EffectComposer>
    </Canvas>
  );
}
