"use client";

/**
 * Escena 3D del laboratorio "Likes and opinions: la feria de gustos"
 * (IN-I-P07). El patio de la Preparatoria Las Jacarandas (ficticia) con seis
 * puestos —Sports, Video games, Books, Art, Spicy food y Karaoke—, papel
 * picado y un escenario con una gráfica de barras. Tres vistas:
 *
 *  - encuesta: seis compañeros en fila. Al contestar tu «Do you like…?»,
 *    quien dice like / really like / love va al puesto y festeja; quien dice
 *    don't mind se queda y se encoge de hombros; quien dice don't like / hate
 *    se aleja. Un emoji 3D muestra su grado y la gráfica suma su respuesta.
 *  - mesas: tres mesas frente a sus puestos; los amigos se sientan donde los
 *    pongas y, al comprobar, su emoji dice si están contentos (confeti si
 *    todos lo están).
 *  - opinion: un compañero opina frente a su puesto y tú le respondes; su
 *    emoji y su postura reaccionan a tu empatía.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type Modo,
  type TemaId,
  type PersonaId,
  type Grado,
  type Persona as PersonaData,
  TEMAS,
  TEMA_DEF,
  GRADO_DEF,
  COMPANEROS,
  GUSTOS,
  ESCENARIOS,
  TURNOS,
  PERSONAS,
} from "./gustos-opiniones-ingles-data";

export type Emocion = Grado | "enojo";

export interface RespuestaEncuesta {
  persona: PersonaId;
  tema: TemaId;
  clave: number;
}

export interface GustosSceneProps {
  vista: Modo;
  modoColor: string;
  resetNonce: number;
  // Encuesta
  temaSel: TemaId;
  seleccion: PersonaId;
  ultima: RespuestaEncuesta | null;
  burbuja: string | null;
  /** Compañeros que ya respondieron por el tema seleccionado. */
  respondidos: PersonaId[];
  /** Respuestas acumuladas por tema para la gráfica. */
  grafica: Record<TemaId, { like: number; mind: number; dislike: number; n: number }>;
  onElegir: (id: PersonaId) => void;
  // Mesas
  escIdx: number;
  asientos: Partial<Record<PersonaId, TemaId>>;
  revisado: boolean;
  selMesa: PersonaId;
  onElegirMesa: (id: PersonaId) => void;
  // Opinión
  turnoIdx: number;
  respuestaTurno: string | null;
  reaccion: "feliz" | "neutral" | "enojo" | null;
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";

/* ════════════════════════════════════════════════════════════════════════
 * Texto en escena
 * ════════════════════════════════════════════════════════════════════════ */

function Etiqueta({
  pos,
  children,
  df = 10,
  col,
  fs = 12,
  fondo = "rgba(4,10,22,0.86)",
}: {
  pos: Pt;
  children: ReactNode;
  df?: number;
  col?: string;
  fs?: number;
  fondo?: string;
}) {
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

function Burbuja({ pos, texto, col, df = 8, lado = "centro", ancho = 300 }: { pos: Pt; texto: string; col: string; df?: number; lado?: "izq" | "der" | "centro"; ancho?: number }) {
  const dx = lado === "izq" ? "-80%" : lado === "der" ? "-20%" : "-50%";
  const cola = lado === "izq" ? "80%" : lado === "der" ? "20%" : "50%";
  return (
    <Html position={pos} distanceFactor={df} zIndexRange={[24, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ transform: `translate(${dx}, -100%)` }}>
        <div
          lang="en"
          style={{
            position: "relative",
            padding: "8px 14px",
            borderRadius: 14,
            background: "#fff",
            color: "#0f172a",
            fontSize: 15,
            fontWeight: 900,
            maxWidth: ancho,
            width: "max-content",
            lineHeight: 1.3,
            border: `3px solid ${col}`,
            boxShadow: "0 10px 24px -10px #000",
            fontFamily: "ui-rounded, system-ui, sans-serif",
          }}
        >
          {texto}
          <div
            style={{
              position: "absolute",
              left: cola,
              bottom: -9,
              width: 14,
              height: 14,
              marginLeft: -7,
              background: "#fff",
              borderRight: `3px solid ${col}`,
              borderBottom: `3px solid ${col}`,
              transform: "rotate(45deg)",
            }}
          />
        </div>
      </div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Geometrías compartidas
 * ════════════════════════════════════════════════════════════════════════ */

function geoCorazon(): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(-0.15, -0.35, -0.5, -0.12, -0.5, 0.15);
  s.bezierCurveTo(-0.5, 0.42, -0.2, 0.52, 0, 0.3);
  s.bezierCurveTo(0.2, 0.52, 0.5, 0.42, 0.5, 0.15);
  s.bezierCurveTo(0.5, -0.12, 0.15, -0.35, 0, -0.5);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 3, curveSegments: 18 });
  g.center();
  return g;
}

const G = {
  esfera: new THREE.SphereGeometry(1, 22, 16),
  esferaB: new THREE.SphereGeometry(1, 10, 8),
  caja: new THREE.BoxGeometry(1, 1, 1),
  barra: new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
  cil: new THREE.CylinderGeometry(1, 1, 1, 20),
  pierna: new THREE.CapsuleGeometry(0.075, 0.62, 5, 12),
  brazo: new THREE.CapsuleGeometry(0.052, 0.46, 5, 10),
  torso: new THREE.CapsuleGeometry(0.17, 0.34, 6, 16),
  pelo: new THREE.SphereGeometry(0.142, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
  gorra: new THREE.SphereGeometry(0.146, 22, 10, 0, Math.PI * 2, 0, Math.PI * 0.4),
  falda: new THREE.CylinderGeometry(0.19, 0.3, 0.5, 22, 1, true),
  aro: new THREE.TorusGeometry(0.034, 0.007, 8, 20),
  anillo: new THREE.RingGeometry(0.42, 0.52, 40),
  copa: new THREE.IcosahedronGeometry(1, 1),
  arco: new THREE.TorusGeometry(0.12, 0.028, 8, 28, Math.PI),
  bocaAbierta: new THREE.CircleGeometry(0.13, 24, Math.PI, Math.PI),
  corazon: geoCorazon(),
  destello: new THREE.OctahedronGeometry(0.07, 0),
  taco: new THREE.CylinderGeometry(0.13, 0.13, 0.06, 18, 1, false, 0, Math.PI),
  chile: new THREE.CapsuleGeometry(0.035, 0.16, 4, 8),
  papel: new THREE.PlaneGeometry(0.34, 0.42),
  confeti: new THREE.PlaneGeometry(0.09, 0.05),
};

function Mat({ c, r = 0.62, m = 0, e, ei = 0.6, t, o = 1 }: { c: string; r?: number; m?: number; e?: string; ei?: number; t?: boolean; o?: number }) {
  return <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? "#000000"} emissiveIntensity={e ? ei : 0} transparent={t} opacity={o} />;
}

function Caja({ p, s, c, r = 0.75, m = 0, rot, sombra = true, e, ei }: { p: Pt; s: Pt; c: string; r?: number; m?: number; rot?: Pt; sombra?: boolean; e?: string; ei?: number }) {
  return (
    <mesh geometry={G.caja} position={p} scale={s} rotation={rot ?? [0, 0, 0]} castShadow={sombra} receiveShadow>
      <Mat c={c} r={r} m={m} e={e} ei={ei} />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Distribución de la feria
 * ════════════════════════════════════════════════════════════════════════ */

/** Puesto: posición y hacia dónde mira (+1 = hacia +x, −1 = hacia −x). */
const PUESTO: Record<TemaId, { x: number; z: number; dir: 1 | -1 }> = {
  soccer: { x: -7.4, z: -3.8, dir: 1 },
  videogames: { x: -7.4, z: -0.6, dir: 1 },
  reading: { x: -7.4, z: 2.6, dir: 1 },
  drawing: { x: 7.4, z: -3.8, dir: -1 },
  spicy: { x: 7.4, z: -0.6, dir: -1 },
  karaoke: { x: 7.4, z: 2.6, dir: -1 },
};

const frente = (t: TemaId, d: number, dz = 0): Pt => [PUESTO[t].x + PUESTO[t].dir * d, 0, PUESTO[t].z + dz];
const mira = (de: Pt, a: Pt) => Math.atan2(a[0] - de[0], a[2] - de[2]);
const LINEA = (k: number, z: number): Pt => [-5 + k * 2, 0, z];

const GENERAL = { pos: [0, 12.5, 17.5] as Pt, target: [0, 0.4, -0.6] as Pt };

/* ════════════════════════════════════════════════════════════════════════
 * Emoji 3D
 * ════════════════════════════════════════════════════════════════════════ */

function Emoji({ emocion, clave, escala = 1 }: { emocion: Emocion; clave: string; escala?: number }) {
  const raiz = useRef<THREE.Group>(null);
  const brillo = useRef<THREE.Group>(null);
  const est = useRef<{ clave: string; t: number }>({ clave: "", t: 0 });
  const q = useMemo(() => new THREE.Quaternion(), []);
  useFrame(({ camera, clock }, dt) => {
    const g = raiz.current;
    if (!g) return;
    const s = est.current;
    if (s.clave !== clave) {
      s.clave = clave;
      s.t = 0;
    }
    s.t += Math.min(dt, 0.1);
    const u = Math.min(1, s.t / 0.45);
    const back = 1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2);
    const k = escala * (u >= 1 ? 1 : Math.max(0.01, back));
    g.scale.setScalar(k);
    g.position.y = Math.sin(clock.elapsedTime * 2.4) * 0.05;
    // Mira a la cámara (billboard) sin heredar la rotación del padre.
    const padre = g.parent;
    if (padre) {
      padre.getWorldQuaternion(q).invert();
      g.quaternion.copy(q.multiply(camera.quaternion));
    }
    if (brillo.current) brillo.current.rotation.z = clock.elapsedTime * 1.6;
  });
  const enojo = emocion === "enojo" || emocion === 0;
  const cara = enojo ? "#ef4444" : emocion === 2 ? "#fde68a" : emocion === 1 ? "#fbbf24" : "#facc15";
  const R = 0.3;
  const zf = R * 0.93;
  return (
    <group ref={raiz}>
      <mesh geometry={G.esfera} scale={R}>
        <meshStandardMaterial color={cara} roughness={0.35} emissive={cara} emissiveIntensity={0.18} />
      </mesh>
      {/* Ojos */}
      {emocion === 5
        ? [-1, 1].map((s) => (
            <mesh key={s} geometry={G.corazon} position={[s * 0.1, 0.06, zf]} scale={0.1}>
              <meshStandardMaterial color="#e11d48" emissive="#e11d48" emissiveIntensity={0.4} />
            </mesh>
          ))
        : [-1, 1].map((s) => (
            <mesh key={s} geometry={G.esferaB} position={[s * 0.1, 0.07, zf]} scale={[0.035, emocion === 2 ? 0.02 : 0.045, 0.02]}>
              <meshStandardMaterial color="#1c1917" roughness={0.3} />
            </mesh>
          ))}
      {/* Cejas de enojo */}
      {enojo &&
        [-1, 1].map((s) => (
          <mesh key={s} geometry={G.caja} position={[s * 0.1, 0.15, zf - 0.01]} rotation={[0, 0, s * -0.45]} scale={[0.1, 0.022, 0.02]}>
            <meshStandardMaterial color="#1c1917" />
          </mesh>
        ))}
      {/* Boca */}
      {emocion === 5 || emocion === 4 ? (
        <mesh geometry={G.bocaAbierta} position={[0, -0.04, zf + 0.005]}>
          <meshStandardMaterial color="#7f1d1d" side={THREE.DoubleSide} />
        </mesh>
      ) : emocion === 3 ? (
        <mesh geometry={G.arco} position={[0, -0.03, zf - 0.01]} rotation={[0, 0, Math.PI]} scale={[0.9, 0.8, 1]}>
          <meshStandardMaterial color="#1c1917" />
        </mesh>
      ) : emocion === 2 ? (
        <mesh geometry={G.caja} position={[0, -0.1, zf]} scale={[0.16, 0.025, 0.02]}>
          <meshStandardMaterial color="#1c1917" />
        </mesh>
      ) : (
        <mesh geometry={G.arco} position={[0, -0.16, zf - 0.01]} scale={[0.85, 0.7, 1]}>
          <meshStandardMaterial color="#1c1917" />
        </mesh>
      )}
      {/* Rubor y adornos */}
      {(emocion === 5 || emocion === 4 || emocion === 3) &&
        [-1, 1].map((s) => (
          <mesh key={`r${s}`} geometry={G.esferaB} position={[s * 0.19, -0.04, zf - 0.06]} scale={[0.05, 0.03, 0.01]}>
            <meshStandardMaterial color="#fb7185" transparent opacity={0.7} />
          </mesh>
        ))}
      {emocion === 5 && (
        <mesh geometry={G.corazon} position={[0.3, 0.3, 0]} scale={0.16} rotation={[0, 0, -0.3]}>
          <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      )}
      {emocion === 4 && (
        <group ref={brillo}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} geometry={G.destello} position={[Math.cos((i * Math.PI * 2) / 3) * 0.42, Math.sin((i * Math.PI * 2) / 3) * 0.42, 0]}>
              <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={1} toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Personas
 * ════════════════════════════════════════════════════════════════════════ */

export type Pose = "parado" | "saluda" | "festeja" | "no" | "encoger" | "hablar" | "sentado" | "aplaude";

function PersonaFig({
  p,
  destino,
  rotY,
  pose,
  fase = 0,
  etiqueta,
  etiquetaCol,
  children,
  onClick,
  anillo,
  emocion,
  claveEmocion,
  emojiEscala = 1,
  etiquetaDf = 11,
}: {
  p: PersonaData;
  destino: Pt;
  rotY: number;
  pose: Pose;
  fase?: number;
  etiqueta?: ReactNode;
  etiquetaCol?: string;
  children?: ReactNode;
  onClick?: () => void;
  anillo?: string | null;
  emocion?: Emocion | null;
  claveEmocion?: string;
  emojiEscala?: number;
  etiquetaDf?: number;
}) {
  const raiz = useRef<THREE.Group>(null);
  const cuerpo = useRef<THREE.Group>(null);
  const bI = useRef<THREE.Group>(null);
  const bD = useRef<THREE.Group>(null);
  const pI = useRef<THREE.Group>(null);
  const pD = useRef<THREE.Group>(null);
  const cabeza = useRef<THREE.Group>(null);
  const est = useRef({ init: false, sentar: 0 });

  useFrame(({ clock }, dt) => {
    const g = raiz.current;
    const c = cuerpo.current;
    if (!g || !c) return;
    const s = est.current;
    const t = clock.elapsedTime + fase;
    if (!s.init) {
      g.position.set(destino[0], destino[1], destino[2]);
      g.rotation.y = rotY;
      s.init = true;
    }
    const ex = destino[0] - g.position.x;
    const ez = destino[2] - g.position.z;
    const dist = Math.hypot(ex, ez);
    const andando = dist > 0.04;
    if (andando) {
      const paso = Math.min(dist, 3.6 * Math.min(dt, 0.1));
      g.position.x += (ex / dist) * paso;
      g.position.z += (ez / dist) * paso;
      const ang = Math.atan2(ex, ez);
      let dA = ang - g.rotation.y;
      dA = Math.atan2(Math.sin(dA), Math.cos(dA));
      g.rotation.y += dA * suave(dt, 0.25);
    } else {
      let dA = rotY - g.rotation.y;
      dA = Math.atan2(Math.sin(dA), Math.cos(dA));
      g.rotation.y += dA * suave(dt, 0.12);
    }
    const poseReal: Pose = andando ? "parado" : pose;
    s.sentar += ((poseReal === "sentado" ? 1 : 0) - s.sentar) * suave(dt, 0.15);
    const bi = bI.current!;
    const bd = bD.current!;
    const pi = pI.current!;
    const pd = pD.current!;
    const cab = cabeza.current!;
    [bi, bd, pi, pd, cab].forEach((gr) => gr.rotation.set(0, 0, 0));
    c.rotation.set(0, 0, 0);
    c.position.set(0, 0.9 - s.sentar * 0.43, 0);
    pi.rotation.x = -s.sentar * 1.5;
    pd.rotation.x = -s.sentar * 1.5;
    if (andando) {
      const a = Math.sin(t * 9) * 0.55;
      pi.rotation.x = a;
      pd.rotation.x = -a;
      bi.rotation.x = -a * 0.7;
      bd.rotation.x = a * 0.7;
      c.position.y += Math.abs(Math.sin(t * 9)) * 0.03;
      return;
    }
    bi.rotation.z = -0.08;
    bd.rotation.z = 0.08;
    cab.rotation.y = Math.sin(t * 0.6) * 0.08;
    switch (poseReal) {
      case "saluda":
        bd.rotation.z = 2.6 + Math.sin(t * 8) * 0.25;
        break;
      case "festeja":
        c.position.y += Math.abs(Math.sin(t * 5)) * 0.14;
        bi.rotation.z = -2.5 + Math.sin(t * 10) * 0.12;
        bd.rotation.z = 2.5 - Math.sin(t * 10) * 0.12;
        break;
      case "aplaude": {
        const u = Math.abs(Math.sin(t * 7));
        bi.rotation.x = -1.2;
        bd.rotation.x = -1.2;
        bi.rotation.z = 0.35 * u;
        bd.rotation.z = -0.35 * u;
        break;
      }
      case "hablar":
        bd.rotation.x = -0.6 + Math.sin(t * 3) * 0.25;
        bd.rotation.z = 0.5;
        bi.rotation.x = -0.3 + Math.sin(t * 3 + 1) * 0.2;
        break;
      case "encoger": {
        const u = (Math.sin(t * 2.2) + 1) / 2;
        bi.rotation.z = -0.55 * u;
        bd.rotation.z = 0.55 * u;
        bi.rotation.x = -0.7 * u;
        bd.rotation.x = -0.7 * u;
        cab.rotation.z = 0.2 * u;
        break;
      }
      case "no":
        cab.rotation.y = Math.sin(t * 7) * 0.45;
        bi.rotation.z = -0.25;
        bd.rotation.z = 0.25;
        bi.rotation.x = 0.2;
        bd.rotation.x = 0.2;
        break;
      case "sentado":
        bi.rotation.x = -0.9 + Math.sin(t * 1.3) * 0.05;
        bd.rotation.x = -0.9 - Math.sin(t * 1.3) * 0.05;
        cab.rotation.y = Math.sin(t * 0.8) * 0.25;
        break;
      default:
        bi.rotation.x = Math.sin(t * 1.4) * 0.05;
        bd.rotation.x = -Math.sin(t * 1.4) * 0.05;
    }
  });

  const esc = 0.94;
  return (
    <group ref={raiz}>
      <group scale={esc}>
        <group ref={cuerpo} position={[0, 0.9, 0]}>
          <group position={[0, -0.9, 0]}>
            {[-1, 1].map((lado) => (
              <group key={lado} ref={lado < 0 ? pI : pD} position={[lado * 0.095, 0.88, 0]}>
                <mesh geometry={G.pierna} position={[0, -0.42, 0]} castShadow>
                  <Mat c={p.falda ? p.piel : p.pantalon} />
                </mesh>
                <mesh geometry={G.caja} position={[0, -0.84, 0.04]} scale={[0.11, 0.07, 0.22]} castShadow>
                  <Mat c="#1f2937" r={0.5} />
                </mesh>
              </group>
            ))}
            {p.falda ? (
              <mesh geometry={G.falda} position={[0, 0.66, 0]} castShadow>
                <meshStandardMaterial color={p.pantalon} roughness={0.8} side={THREE.DoubleSide} />
              </mesh>
            ) : (
              <mesh geometry={G.caja} position={[0, 0.9, 0]} scale={[0.36, 0.16, 0.22]} castShadow>
                <Mat c={p.pantalon} />
              </mesh>
            )}
            <mesh geometry={G.torso} position={[0, 1.14, 0]} scale={[1, 1, 0.78]} castShadow>
              <Mat c={p.camisa} r={0.7} />
            </mesh>
            {[-1, 1].map((lado) => (
              <group key={lado} ref={lado < 0 ? bI : bD} position={[lado * 0.25, 1.38, 0]}>
                <mesh geometry={G.brazo} position={[0, -0.28, 0]} castShadow>
                  <Mat c={p.camisa} r={0.7} />
                </mesh>
                <mesh geometry={G.esfera} position={[0, -0.56, 0]} scale={0.055}>
                  <Mat c={p.piel} />
                </mesh>
              </group>
            ))}
            <mesh geometry={G.cil} position={[0, 1.47, 0]} scale={[0.05, 0.1, 0.05]}>
              <Mat c={p.piel} />
            </mesh>
            <group ref={cabeza} position={[0, 1.6, 0]}>
              <mesh geometry={G.esfera} scale={0.13} castShadow>
                <Mat c={p.piel} r={0.55} />
              </mesh>
              {[-1, 1].map((s) => (
                <mesh key={s} geometry={G.esferaB} position={[s * 0.045, 0.015, 0.118]} scale={0.017}>
                  <meshStandardMaterial color="#0b0f14" roughness={0.3} />
                </mesh>
              ))}
              <mesh geometry={G.caja} position={[0, -0.056, 0.12]} scale={[0.05, 0.008, 0.01]}>
                <meshStandardMaterial color="#7c2d12" />
              </mesh>
              <mesh geometry={G.pelo} rotation={[-0.42, 0, 0]} position={[0, 0.012, -0.01]} castShadow>
                <Mat c={p.pelo} r={0.85} />
              </mesh>
              {p.peinado === "largo" && <Caja p={[0, -0.16, -0.095]} s={[0.27, 0.34, 0.06]} c={p.pelo} sombra={false} />}
              {p.peinado === "cola" && (
                <mesh geometry={G.esfera} position={[0, -0.02, -0.17]} scale={[0.06, 0.12, 0.06]} rotation={[0.4, 0, 0]}>
                  <Mat c={p.pelo} r={0.85} />
                </mesh>
              )}
              {p.peinado === "chongo" && (
                <mesh geometry={G.esfera} position={[0, 0.1, -0.12]} scale={0.075}>
                  <Mat c={p.pelo} r={0.85} />
                </mesh>
              )}
              {p.lentes && (
                <group position={[0, 0.015, 0.134]}>
                  {[-1, 1].map((s) => (
                    <mesh key={s} geometry={G.aro} position={[s * 0.047, 0, 0]}>
                      <meshStandardMaterial color="#111827" metalness={0.4} roughness={0.3} />
                    </mesh>
                  ))}
                </group>
              )}
              {p.gorra && (
                <>
                  <mesh geometry={G.gorra} position={[0, 0.045, -0.005]} rotation={[-0.2, 0, 0]} castShadow>
                    <Mat c={p.gorra} r={0.7} />
                  </mesh>
                  <Caja p={[0, 0.05, 0.16]} s={[0.17, 0.014, 0.13]} c={p.gorra} sombra={false} />
                </>
              )}
            </group>
          </group>
          {emocion !== null && emocion !== undefined && (
            <group position={[0, 1.35, 0]}>
              <Emoji emocion={emocion} clave={claveEmocion ?? String(emocion)} escala={emojiEscala} />
            </group>
          )}
        </group>
      </group>
      {anillo && (
        <mesh geometry={G.anillo} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={anillo} transparent opacity={0.95} toneMapped={false} />
        </mesh>
      )}
      {onClick && (
        <mesh
          position={[0, 0.95, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
          }}
        >
          <cylinderGeometry args={[0.42, 0.42, 1.9, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      {etiqueta && (
        <Etiqueta pos={[0, emocion !== null && emocion !== undefined ? 2.72 : 2.05, 0]} df={etiquetaDf} fs={12} col={etiquetaCol}>
          {etiqueta}
        </Etiqueta>
      )}
      {children}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * La feria
 * ════════════════════════════════════════════════════════════════════════ */

function Arbol({ pos, s = 1 }: { pos: Pt; s?: number }) {
  return (
    <group position={pos} scale={s}>
      <mesh geometry={G.cil} position={[0, 0.7, 0]} scale={[0.11, 1.4, 0.11]} castShadow>
        <Mat c="#6b4423" />
      </mesh>
      <mesh geometry={G.copa} position={[0, 1.9, 0]} scale={0.85} castShadow>
        <Mat c="#8b5cf6" r={0.9} />
      </mesh>
      <mesh geometry={G.copa} position={[0.45, 2.3, 0.1]} scale={0.55} castShadow>
        <Mat c="#a78bfa" r={0.9} />
      </mesh>
      <mesh geometry={G.copa} position={[-0.4, 2.2, -0.2]} scale={0.5} castShadow>
        <Mat c="#7c3aed" r={0.9} />
      </mesh>
    </group>
  );
}

function Libros({ ancho = 1.2, filas = 2 }: { ancho?: number; filas?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const libros = useMemo(() => {
    const out: { p: Pt; h: number; c: string }[] = [];
    const cols = ["#dc2626", "#2563eb", "#16a34a", "#f59e0b", "#7c3aed", "#0891b2", "#be185d", "#f8fafc"];
    const n = Math.floor(ancho / 0.12);
    for (let fila = 0; fila < filas; fila++)
      for (let k = 0; k < n; k++) {
        const h = 0.24 + ((k * 7 + fila * 3) % 5) * 0.025;
        out.push({ p: [-ancho / 2 + 0.06 + k * 0.12, fila * 0.5 + h / 2 + 0.03, 0], h, c: cols[(k * 3 + fila) % cols.length]! });
      }
    return out;
  }, [ancho, filas]);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    libros.forEach((l, i) => {
      o.position.set(l.p[0], l.p[1], l.p[2]);
      o.scale.set(0.1, l.h, 0.22);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(l.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [libros]);
  return (
    <instancedMesh ref={ref} args={[G.caja, undefined, libros.length]} castShadow>
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  );
}

/** Utilería de cada puesto, en coordenadas locales (frente del puesto hacia +z). */
function Utileria({ tema }: { tema: TemaId }) {
  if (tema === "soccer")
    return (
      <group>
        {[-0.75, 0.75].map((x) => (
          <mesh key={x} geometry={G.cil} position={[x, 0.6, -0.35]} scale={[0.04, 1.2, 0.04]} castShadow>
            <Mat c="#f8fafc" r={0.3} />
          </mesh>
        ))}
        <mesh geometry={G.cil} position={[0, 1.2, -0.35]} rotation={[0, 0, Math.PI / 2]} scale={[0.04, 1.54, 0.04]} castShadow>
          <Mat c="#f8fafc" r={0.3} />
        </mesh>
        <mesh geometry={G.caja} position={[0, 0.6, -0.62]} scale={[1.5, 1.2, 0.5]}>
          <meshStandardMaterial color="#e2e8f0" wireframe transparent opacity={0.55} />
        </mesh>
        <mesh geometry={G.esfera} position={[0.45, 1.16, 0.5]} scale={0.14} castShadow>
          <Mat c="#f8fafc" r={0.5} />
        </mesh>
        <mesh geometry={G.copa} position={[0.45, 1.16, 0.5]} scale={0.145}>
          <meshStandardMaterial color="#111827" wireframe />
        </mesh>
        <mesh geometry={G.cil} position={[-0.45, 1.13, 0.5]} scale={[0.08, 0.1, 0.08]} castShadow>
          <Mat c="#eab308" m={0.7} r={0.25} />
        </mesh>
        <mesh geometry={G.esfera} position={[-0.45, 1.3, 0.5]} scale={[0.13, 0.12, 0.13]} castShadow>
          <Mat c="#eab308" m={0.7} r={0.25} />
        </mesh>
      </group>
    );
  if (tema === "videogames")
    return (
      <group>
        <Caja p={[0, 1.55, -0.72]} s={[1.4, 0.82, 0.07]} c="#0f172a" />
        <mesh geometry={G.caja} position={[0, 1.55, -0.68]} scale={[1.3, 0.72, 0.01]}>
          <Mat c="#4f46e5" e="#6366f1" ei={1.1} />
        </mesh>
        {[
          [-0.35, 1.45, "#22d3ee"],
          [0.1, 1.7, "#f472b6"],
          [0.4, 1.4, "#facc15"],
        ].map(([x, y, c], i) => (
          <mesh key={i} geometry={G.caja} position={[x as number, y as number, -0.66]} scale={[0.12, 0.12, 0.01]}>
            <Mat c={c as string} e={c as string} ei={1.4} />
          </mesh>
        ))}
        <Caja p={[-0.35, 1.08, 0.5]} s={[0.46, 0.08, 0.3]} c="#1e293b" r={0.3} />
        <group position={[0.35, 1.07, 0.5]} rotation={[0, 0.4, 0]}>
          <Caja p={[0, 0, 0]} s={[0.26, 0.06, 0.12]} c="#334155" sombra={false} />
          {[-1, 1].map((s) => (
            <mesh key={s} geometry={G.esferaB} position={[s * 0.13, 0, 0.02]} scale={0.07}>
              <Mat c="#334155" />
            </mesh>
          ))}
        </group>
      </group>
    );
  if (tema === "reading")
    return (
      <group>
        <Caja p={[0, 0.9, -0.75]} s={[1.5, 1.8, 0.06]} c="#7c4a24" />
        {[0.02, 0.52, 1.02].map((y) => (
          <Caja key={y} p={[0, y + 0.3, -0.6]} s={[1.5, 0.04, 0.3]} c="#8b5a2b" sombra={false} />
        ))}
        <group position={[0, 0.32, -0.58]}>
          <Libros ancho={1.4} filas={3} />
        </group>
        <group position={[0, 1.07, 0.48]}>
          <Caja p={[-0.16, 0, 0]} s={[0.3, 0.03, 0.4]} rot={[0, 0, 0.12]} c="#f8fafc" sombra={false} />
          <Caja p={[0.16, 0, 0]} s={[0.3, 0.03, 0.4]} rot={[0, 0, -0.12]} c="#f8fafc" sombra={false} />
        </group>
        <Caja p={[0.55, 1.12, 0.5]} s={[0.24, 0.16, 0.32]} c="#2563eb" sombra={false} />
      </group>
    );
  if (tema === "drawing")
    return (
      <group>
        <group position={[0, 0, -0.4]}>
          {[-0.32, 0.32].map((x) => (
            <mesh key={x} geometry={G.cil} position={[x, 0.95, 0]} rotation={[0, 0, x > 0 ? -0.12 : 0.12]} scale={[0.03, 1.9, 0.03]}>
              <Mat c="#92400e" />
            </mesh>
          ))}
          <Caja p={[0, 1.5, 0.06]} s={[0.95, 0.75, 0.04]} c="#fffdf5" />
          {[
            [-0.22, 1.62, "#f472b6", 0.14],
            [0.18, 1.52, "#38bdf8", 0.18],
            [-0.05, 1.33, "#facc15", 0.12],
            [0.25, 1.72, "#34d399", 0.09],
          ].map(([x, y, c, s], i) => (
            <mesh key={i} geometry={G.esferaB} position={[x as number, y as number, 0.09]} scale={[s as number, (s as number) * 0.8, 0.01]}>
              <Mat c={c as string} r={0.9} />
            </mesh>
          ))}
          <Caja p={[0, 1.1, 0.1]} s={[0.9, 0.04, 0.12]} c="#92400e" sombra={false} />
        </group>
        <mesh geometry={G.cil} position={[0.35, 1.05, 0.5]} scale={[0.22, 0.02, 0.16]}>
          <Mat c="#d6a354" />
        </mesh>
        {["#ef4444", "#3b82f6", "#22c55e", "#facc15"].map((c, i) => (
          <mesh key={c} geometry={G.esferaB} position={[0.27 + i * 0.06, 1.075, 0.46 + (i % 2) * 0.06]} scale={0.028}>
            <Mat c={c} />
          </mesh>
        ))}
        <mesh geometry={G.cil} position={[-0.4, 1.12, 0.5]} rotation={[0, 0, 0.8]} scale={[0.015, 0.34, 0.015]}>
          <Mat c="#0ea5e9" />
        </mesh>
      </group>
    );
  if (tema === "spicy")
    return (
      <group>
        <mesh geometry={G.cil} position={[0, 1.04, 0.45]} scale={[0.42, 0.03, 0.3]} castShadow>
          <Mat c="#292524" m={0.5} r={0.4} />
        </mesh>
        {[-0.22, 0, 0.22].map((x) => (
          <mesh key={x} geometry={G.taco} position={[x, 1.14, 0.45]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
            <Mat c="#eab308" r={0.8} />
          </mesh>
        ))}
        {[
          [-0.55, "#dc2626"],
          [0.55, "#16a34a"],
        ].map(([x, c]) => (
          <group key={x as number} position={[x as number, 1.06, 0.5]}>
            <mesh geometry={G.cil} scale={[0.1, 0.06, 0.1]}>
              <Mat c="#f5f5f4" />
            </mesh>
            <mesh geometry={G.cil} position={[0, 0.02, 0]} scale={[0.085, 0.03, 0.085]}>
              <Mat c={c as string} r={0.3} />
            </mesh>
          </group>
        ))}
        {[-0.3, -0.1, 0.12, 0.34].map((x, i) => (
          <mesh key={x} geometry={G.chile} position={[x, 1.5 + (i % 2) * 0.08, -0.7]} rotation={[0, 0, 0.3 - i * 0.2]}>
            <Mat c={i % 2 ? "#b91c1c" : "#dc2626"} r={0.3} />
          </mesh>
        ))}
        <Caja p={[0, 1.72, -0.72]} s={[0.9, 0.03, 0.03]} c="#78350f" sombra={false} />
      </group>
    );
  return (
    <group>
      <mesh geometry={G.cil} position={[0.45, 0.62, 0.95]} scale={[0.02, 1.24, 0.02]}>
        <Mat c="#1f2937" m={0.7} r={0.3} />
      </mesh>
      <mesh geometry={G.esfera} position={[0.45, 1.3, 0.95]} scale={0.06}>
        <Mat c="#111827" m={0.5} r={0.2} />
      </mesh>
      {[-0.6, 0.6].map((x) => (
        <group key={x} position={[x, 0, -0.55]}>
          <Caja p={[0, 0.55, 0]} s={[0.4, 1.1, 0.35]} c="#18181b" r={0.4} />
          {[0.75, 0.35].map((y, i) => (
            <mesh key={y} geometry={G.cil} position={[0, y, 0.18]} rotation={[Math.PI / 2, 0, 0]} scale={[i ? 0.14 : 0.09, 0.02, i ? 0.14 : 0.09]}>
              <Mat c="#3f3f46" m={0.4} />
            </mesh>
          ))}
        </group>
      ))}
      <Caja p={[0, 1.75, -0.76]} s={[1.1, 0.3, 0.04]} c="#1e1b4b" />
      <mesh geometry={G.caja} position={[0, 1.75, -0.73]} scale={[0.95, 0.06, 0.01]}>
        <Mat c="#e879f9" e="#e879f9" ei={2} />
      </mesh>
      <mesh geometry={G.esfera} position={[0, 2.25, 0.2]} scale={0.14}>
        <meshStandardMaterial color="#e5e7eb" metalness={1} roughness={0.15} />
      </mesh>
    </group>
  );
}

function Puesto({ tema, foco }: { tema: TemaId; foco: boolean }) {
  const d = TEMA_DEF[tema];
  const { x, z, dir } = PUESTO[tema];
  return (
    <group position={[x, 0, z]} rotation={[0, (dir * Math.PI) / 2, 0]}>
      {/* Tarima y barra */}
      <Caja p={[0, 0.04, 0]} s={[2.6, 0.08, 2.0]} c="#78716c" r={0.9} />
      <Caja p={[0, 0.5, 0.45]} s={[2.2, 1.0, 0.5]} c="#fafaf9" r={0.6} />
      <Caja p={[0, 0.5, 0.71]} s={[2.2, 0.26, 0.02]} c={d.color} sombra={false} />
      <Caja p={[0, 1.02, 0.45]} s={[2.3, 0.05, 0.6]} c="#a16207" r={0.5} />
      {/* Muro trasero y postes */}
      <Caja p={[0, 1.3, -0.85]} s={[2.5, 2.6, 0.1]} c="#f5f0e6" r={0.95} />
      {[-1.18, 1.18].map((px) => (
        <mesh key={px} geometry={G.cil} position={[px, 1.35, 0.8]} scale={[0.05, 2.7, 0.05]} castShadow>
          <Mat c="#57534e" m={0.4} r={0.5} />
        </mesh>
      ))}
      {/* Toldo a rayas */}
      <group position={[0, 2.62, 0]} rotation={[0.22, 0, 0]}>
        {Array.from({ length: 6 }, (_, k) => (
          <Caja key={k} p={[-1.05 + k * 0.42, 0, 0]} s={[0.42, 0.06, 2.0]} c={k % 2 ? "#fafaf9" : d.color} r={0.8} />
        ))}
      </group>
      <Caja p={[0, 3.05, -0.85]} s={[1.9, 0.5, 0.08]} c={d.color} r={0.5} e={foco ? d.color : undefined} ei={0.35} />
      <Utileria tema={tema} />
    </group>
  );
}

const PICADO_Y = 5.2;

/** Tiras de papel picado, en lo alto, entre los dos lados del patio. */
function PapelPicado() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const tiras = useMemo(() => [-3.9, -0.9], []);
  const piezas = useMemo(() => {
    const out: { p: Pt; c: string }[] = [];
    const cols = ["#ec4899", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ef4444", "#14b8a6"];
    tiras.forEach((z, f) => {
      for (let k = 0; k < 35; k++) {
        const x = -8.5 + k * 0.5;
        out.push({ p: [x, PICADO_Y - 0.23, z], c: cols[(k + f * 2) % cols.length]! });
      }
    });
    return out;
  }, [tiras]);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    piezas.forEach((pz, i) => {
      o.position.set(pz.p[0], pz.p[1], pz.p[2]);
      o.rotation.set(0, 0, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(pz.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [piezas]);
  const obj = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = clock.elapsedTime;
    piezas.forEach((pz, i) => {
      obj.position.set(pz.p[0], pz.p[1], pz.p[2]);
      obj.rotation.set(Math.sin(t * 1.7 + i * 0.7) * 0.35, 0, 0);
      obj.updateMatrix();
      m.setMatrixAt(i, obj.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <instancedMesh ref={ref} args={[G.papel, undefined, piezas.length]} frustumCulled={false}>
        <meshStandardMaterial side={THREE.DoubleSide} roughness={0.8} />
      </instancedMesh>
      {tiras.map((z) => (
        <group key={z}>
          <mesh geometry={G.cil} position={[0, PICADO_Y, z]} rotation={[0, 0, Math.PI / 2]} scale={[0.01, 17.8, 0.01]}>
            <meshStandardMaterial color="#e5e7eb" />
          </mesh>
          {[-8.9, 8.9].map((x) => (
            <mesh key={x} geometry={G.cil} position={[x, PICADO_Y / 2, z]} scale={[0.06, PICADO_Y, 0.06]} castShadow>
              <Mat c="#78350f" r={0.7} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Patio({ foco, sinNombres }: { foco: TemaId | null; sinNombres: boolean }) {
  return (
    <group>
      <mesh position={[0, -0.16, -0.6]} receiveShadow>
        <boxGeometry args={[22, 0.3, 17]} />
        <meshStandardMaterial color="#8b8174" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.005, -0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[21.6, 16.6]} />
        <meshStandardMaterial color="#d9c9a8" roughness={0.92} />
      </mesh>
      {Array.from({ length: 13 }, (_, k) => (
        <mesh key={`lx${k}`} position={[-9.6 + k * 1.6, 0.009, -0.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.03, 16.6]} />
          <meshStandardMaterial color="#c2b08b" />
        </mesh>
      ))}
      {Array.from({ length: 11 }, (_, k) => (
        <mesh key={`lz${k}`} position={[0, 0.009, -8.6 + k * 1.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[21.6, 0.03]} />
          <meshStandardMaterial color="#c2b08b" />
        </mesh>
      ))}
      <mesh position={[0, 0.012, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.3, 2.45, 48]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>

      {/* Edificio de la escuela al fondo */}
      <Caja p={[0, 2.1, -8.6]} s={[21, 4.2, 0.5]} c="#f1e7d3" r={0.95} />
      <Caja p={[0, 4.3, -8.6]} s={[21.4, 0.25, 0.7]} c="#9a3412" r={0.8} />
      {Array.from({ length: 9 }, (_, k) => (
        <group key={k} position={[-8.8 + k * 2.2, 0, -8.33]}>
          <Caja p={[0, 2.75, 0]} s={[1.1, 0.9, 0.06]} c="#1e3a5f" r={0.2} m={0.3} sombra={false} />
          <Caja p={[0, 1.05, 0]} s={[1.1, 0.9, 0.06]} c="#1e3a5f" r={0.2} m={0.3} sombra={false} />
        </group>
      ))}

      {TEMAS.map((tm) => (
        <Puesto key={tm} tema={tm} foco={foco === tm} />
      ))}
      {!sinNombres &&
        TEMAS.map((tm) => {
          const d = TEMA_DEF[tm];
          const { x, z, dir } = PUESTO[tm];
          if (foco && foco !== tm) return null;
          return (
            <Etiqueta key={tm} pos={[x - dir * 0.85, 3.12, z]} df={foco ? 7 : 12} fs={13} col={`${d.color}cc`}>
              <i className={`fa-solid ${d.icono}`} style={{ color: d.color }} />
              <span lang="en">{d.puesto}</span>
            </Etiqueta>
          );
        })}

      <PapelPicado />
      <Arbol pos={[-10.2, 0, -7.2]} s={1.1} />
      <Arbol pos={[10.2, 0, -7.2]} s={1.15} />
      <Arbol pos={[-10.3, 0, 6.6]} s={0.95} />
      <Arbol pos={[10.3, 0, 6.6]} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. LIKES SURVEY
 * ════════════════════════════════════════════════════════════════════════ */

const BARRA_U = 0.4;
const ESCENARIO_Z = -4.7;

function Barra({ x, z, n, col }: { x: number; z: number; n: number; col: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    const obj = Math.max(0.001, n * BARRA_U);
    m.scale.y += (obj - m.scale.y) * suave(dt, 0.1);
    m.visible = m.scale.y > 0.01;
  });
  return (
    <mesh ref={ref} geometry={G.barra} position={[x, 0.42, z]} scale={[0.34, 0.001, 0.34]} castShadow>
      <meshStandardMaterial color={col} roughness={0.35} emissive={col} emissiveIntensity={0.25} />
    </mesh>
  );
}

const COL_LIKE = "#34d399";
const COL_MIND = "#fbbf24";
const COL_DISLIKE = "#f87171";

function Grafica({ grafica, temaSel }: { grafica: GustosSceneProps["grafica"]; temaSel: TemaId }) {
  const z = ESCENARIO_Z;
  return (
    <group>
      <Caja p={[0, 0.2, z]} s={[9.2, 0.4, 2.2]} c="#334155" r={0.6} />
      <Caja p={[0, 0.41, z]} s={[9.0, 0.02, 2.0]} c="#1e293b" r={0.4} sombra={false} />
      <Caja p={[0, 2.2, z - 1.05]} s={[9.2, 3.6, 0.12]} c="#0f172a" r={0.5} />
      {[1, 2, 3, 4, 5, 6].map((k) => (
        <mesh key={k} position={[0, 0.42 + k * BARRA_U, z - 0.98]}>
          <planeGeometry args={[8.8, 0.012]} />
          <meshBasicMaterial color="#475569" />
        </mesh>
      ))}
      {TEMAS.map((tm, i) => {
        const x = -3.75 + i * 1.5;
        const g = grafica[tm];
        const d = TEMA_DEF[tm];
        const on = tm === temaSel;
        return (
          <group key={tm}>
            {on && (
              <mesh position={[x, 0.425, z]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.42, 1.8]} />
                <meshBasicMaterial color={d.color} transparent opacity={0.28} />
              </mesh>
            )}
            <Barra x={x - 0.4} z={z} n={g.like} col={COL_LIKE} />
            <Barra x={x} z={z} n={g.mind} col={COL_MIND} />
            <Barra x={x + 0.4} z={z} n={g.dislike} col={COL_DISLIKE} />
            <Etiqueta pos={[x, 0.2, z + 1.25]} df={11} fs={12} col={on ? d.color : `${d.color}66`} fondo={on ? "rgba(4,10,22,0.92)" : "rgba(4,10,22,0.7)"}>
              <i className={`fa-solid ${d.icono}`} style={{ color: d.color }} />
              {g.n > 0 && (
                <span style={{ fontFamily: "ui-monospace, monospace" }}>
                  <span style={{ color: COL_LIKE }}>{g.like}</span>·<span style={{ color: COL_MIND }}>{g.mind}</span>·<span style={{ color: COL_DISLIKE }}>{g.dislike}</span>
                </span>
              )}
            </Etiqueta>
          </group>
        );
      })}
      <Etiqueta pos={[0, 4.35, z - 1.0]} df={12} fs={13} col="#94a3b8aa">
        <i className="fa-solid fa-square-poll-vertical" style={{ color: COL_LIKE }} />
        <span lang="en">Likes survey</span>
        <span style={{ color: COL_LIKE }}>■ like</span>
        <span style={{ color: COL_MIND }}>■ don&apos;t mind</span>
        <span style={{ color: COL_DISLIKE }}>■ don&apos;t like</span>
      </Etiqueta>
    </group>
  );
}

/** Lugar de cada compañero según su respuesta: cerca del puesto, en la fila o lejos. */
function lugarEncuesta(p: PersonaId, k: number, tema: TemaId, respondidos: PersonaId[]): { pos: Pt; rot: number; pose: Pose } {
  const base = LINEA(k, 3.4);
  if (!respondidos.includes(p)) return { pos: base, rot: 0, pose: "parado" };
  const g = GUSTOS[p][tema].g;
  if (g >= 3) {
    const fans = respondidos.filter((x) => GUSTOS[x][tema].g >= 3);
    const j = fans.indexOf(p);
    const fila = j % 3;
    const col = Math.floor(j / 3);
    const pos = frente(tema, 1.9 + col * 0.9, -0.9 + fila * 0.9);
    return { pos, rot: mira(pos, [PUESTO[tema].x, 0, PUESTO[tema].z]), pose: "festeja" };
  }
  if (g === 2) return { pos: base, rot: 0, pose: "encoger" };
  return { pos: [base[0], 0, 5.4], rot: mira([base[0], 0, 5.4], [PUESTO[tema].x, 0, PUESTO[tema].z]) + Math.PI, pose: "no" };
}

function VistaEncuesta({
  temaSel,
  seleccion,
  ultima,
  burbuja,
  respondidos,
  grafica,
  onElegir,
  modoColor,
}: Pick<GustosSceneProps, "temaSel" | "seleccion" | "ultima" | "burbuja" | "respondidos" | "grafica" | "onElegir" | "modoColor">) {
  return (
    <group>
      <Grafica grafica={grafica} temaSel={temaSel} />
      {COMPANEROS.map((id, k) => {
        const p = PERSONAS[id];
        const l = lugarEncuesta(id, k, temaSel, respondidos);
        const sel = seleccion === id;
        const resp = respondidos.includes(id);
        const esUltima = !!ultima && ultima.persona === id && ultima.tema === temaSel;
        const g = GUSTOS[id][temaSel].g;
        return (
          <PersonaFig
            key={id}
            p={p}
            destino={l.pos}
            rotY={l.rot}
            pose={resp ? l.pose : sel ? "saluda" : "parado"}
            fase={k * 0.8}
            onClick={() => onElegir(id)}
            anillo={sel ? modoColor : null}
            etiquetaCol={sel ? modoColor : resp ? `${GRADO_DEF[g].col}aa` : "rgba(255,255,255,0.28)"}
            etiqueta={
              !resp || sel || esUltima ? (
                <>
                  {p.nombre}
                  {resp && <i className={`fa-solid ${GRADO_DEF[g].icono}`} style={{ color: GRADO_DEF[g].col }} />}
                </>
              ) : undefined
            }
            emocion={resp ? g : null}
            emojiEscala={1.35}
            claveEmocion={`${temaSel}-${id}-${esUltima ? ultima!.clave : 0}`}
          >
            {esUltima && burbuja && <Burbuja pos={[0, 3.05, 0]} texto={burbuja} col={GRADO_DEF[g].col} df={9} lado={PUESTO[temaSel].dir > 0 ? "der" : "izq"} ancho={280} />}
          </PersonaFig>
        );
      })}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. MATCH THE FRIENDS
 * ════════════════════════════════════════════════════════════════════════ */

/** Las tres mesas van en el centro del patio, frente a la cámara. */
const MESA_POS = (i: number): Pt => [-3.8 + i * 3.8, 0, 0.9];
const SILLA_DX = 0.92;
const asientoPos = (i: number, s: number): Pt => {
  const m = MESA_POS(i);
  return [m[0] + (s === 0 ? -SILLA_DX : SILLA_DX), 0, m[2]];
};

function CentroMesa({ tema }: { tema: TemaId }) {
  const y = 0.78;
  if (tema === "soccer")
    return (
      <group position={[0, y + 0.12, 0]}>
        <mesh geometry={G.esfera} scale={0.12} castShadow>
          <Mat c="#f8fafc" r={0.5} />
        </mesh>
        <mesh geometry={G.copa} scale={0.125}>
          <meshStandardMaterial color="#111827" wireframe />
        </mesh>
      </group>
    );
  if (tema === "videogames")
    return (
      <group position={[0, y + 0.04, 0]} rotation={[0, 0.5, 0]}>
        <Caja p={[0, 0, 0]} s={[0.28, 0.06, 0.13]} c="#334155" />
        {[-1, 1].map((k) => (
          <mesh key={k} geometry={G.esferaB} position={[k * 0.14, 0, 0.02]} scale={0.075}>
            <Mat c="#334155" />
          </mesh>
        ))}
      </group>
    );
  if (tema === "reading") return <Caja p={[0, y + 0.06, 0]} s={[0.3, 0.1, 0.22]} rot={[0, 0.4, 0]} c="#2563eb" />;
  if (tema === "drawing")
    return (
      <group position={[0, y + 0.02, 0]}>
        <Caja p={[0, 0, 0]} s={[0.36, 0.01, 0.26]} rot={[0, -0.3, 0]} c="#fffdf5" />
        {["#ef4444", "#3b82f6", "#facc15"].map((c, i) => (
          <mesh key={c} geometry={G.cil} position={[-0.1 + i * 0.1, 0.03, 0.05]} rotation={[0, 0, Math.PI / 2]} scale={[0.015, 0.2, 0.015]}>
            <Mat c={c} />
          </mesh>
        ))}
      </group>
    );
  if (tema === "spicy")
    return (
      <group position={[0, y + 0.02, 0]}>
        <mesh geometry={G.cil} scale={[0.24, 0.02, 0.24]}>
          <Mat c="#f5f5f4" />
        </mesh>
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} geometry={G.taco} position={[x, 0.07, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} scale={0.8}>
            <Mat c="#eab308" r={0.8} />
          </mesh>
        ))}
        <mesh geometry={G.chile} position={[0, 0.03, 0.16]} rotation={[0, 0, Math.PI / 2]}>
          <Mat c="#dc2626" r={0.3} />
        </mesh>
      </group>
    );
  return (
    <group position={[0, y, 0]}>
      <mesh geometry={G.cil} position={[0, 0.1, 0]} scale={[0.025, 0.2, 0.025]}>
        <Mat c="#1f2937" m={0.6} />
      </mesh>
      <mesh geometry={G.esfera} position={[0, 0.24, 0]} scale={0.055}>
        <Mat c="#9ca3af" m={0.7} r={0.3} />
      </mesh>
    </group>
  );
}

function Mesa({ i, tema, nombre, modoColor }: { i: number; tema: TemaId; nombre: string; modoColor: string }) {
  const [x, , z] = MESA_POS(i);
  const d = TEMA_DEF[tema];
  return (
    <group>
      <group position={[x, 0, z]}>
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[1.45, 40]} />
          <meshStandardMaterial color={d.color} transparent opacity={0.22} />
        </mesh>
        <mesh geometry={G.cil} position={[0, 0.72, 0]} scale={[0.55, 0.05, 0.55]} castShadow receiveShadow>
          <Mat c="#fef3c7" r={0.5} />
        </mesh>
        <mesh geometry={G.cil} position={[0, 0.36, 0]} scale={[0.06, 0.72, 0.06]}>
          <Mat c="#57534e" m={0.5} />
        </mesh>
        <mesh geometry={G.cil} position={[0, 0.02, 0]} scale={[0.3, 0.04, 0.3]}>
          <Mat c="#57534e" m={0.5} />
        </mesh>
        <mesh geometry={G.cil} position={[0, 0.752, 0]} scale={[0.5, 0.01, 0.5]}>
          <Mat c={d.color} r={0.4} e={d.color} ei={0.2} />
        </mesh>
        <CentroMesa tema={tema} />
        {[-1, 1].map((lado) => (
          <group key={lado} position={[lado * SILLA_DX, 0, 0]}>
            <Caja p={[0, 0.44, 0]} s={[0.42, 0.05, 0.42]} c={modoColor} r={0.5} />
            {[-0.17, 0.17].map((lx) =>
              [-0.17, 0.17].map((lz) => (
                <mesh key={`${lx}${lz}`} geometry={G.cil} position={[lx, 0.22, lz]} scale={[0.02, 0.44, 0.02]}>
                  <Mat c="#44403c" m={0.5} />
                </mesh>
              )),
            )}
            <Caja p={[lado * 0.2, 0.72, 0]} s={[0.04, 0.52, 0.42]} c={modoColor} r={0.5} />
          </group>
        ))}
      </group>
      <Etiqueta pos={[x, 0.1, z + 1.55]} df={10} fs={13} col={`${d.color}cc`}>
        <i className={`fa-solid ${d.icono}`} style={{ color: d.color }} />
        <span lang="en">{nombre}</span>
      </Etiqueta>
    </group>
  );
}

function Confeti({ activo, centros }: { activo: boolean; centros: Pt[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const obj = useMemo(() => new THREE.Object3D(), []);
  const N = 90;
  const semillas = useMemo(
    () => Array.from({ length: N }, (_, i) => ({ a: (i * 2.399) % (Math.PI * 2), r: 0.3 + ((i * 37) % 11) / 10, v: 0.5 + ((i * 53) % 7) / 10, c: i % centros.length })),
    [centros.length],
  );
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const c = new THREE.Color();
    const cols = ["#f472b6", "#facc15", "#34d399", "#38bdf8", "#a78bfa", "#fb923c"];
    for (let i = 0; i < N; i++) m.setColorAt(i, c.set(cols[i % cols.length]!));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    m.visible = activo;
    if (!activo) return;
    const t = clock.elapsedTime;
    semillas.forEach((s, i) => {
      const ctr = centros[s.c] ?? [0, 0, 0];
      const f = (t * s.v * 0.35 + i / N) % 1;
      obj.position.set(ctr[0] + Math.cos(s.a + t * 0.6) * s.r, 3.2 - f * 3.0, ctr[2] + Math.sin(s.a + t * 0.6) * s.r);
      obj.rotation.set(t * 3 + i, t * 2 + i * 0.5, 0);
      obj.updateMatrix();
      m.setMatrixAt(i, obj.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[G.confeti, undefined, N]} frustumCulled={false} visible={false}>
      <meshStandardMaterial side={THREE.DoubleSide} emissive="#ffffff" emissiveIntensity={0.15} />
    </instancedMesh>
  );
}

function VistaMesas({
  escIdx,
  asientos,
  revisado,
  selMesa,
  onElegirMesa,
  modoColor,
}: Pick<GustosSceneProps, "escIdx" | "asientos" | "revisado" | "selMesa" | "onElegirMesa" | "modoColor">) {
  const esc = ESCENARIOS[escIdx] ?? ESCENARIOS[0]!;
  // Orden de asiento: por orden de la lista de compañeros dentro de cada mesa.
  const ocupantes: Record<string, PersonaId[]> = {};
  COMPANEROS.forEach((p) => {
    const tm = asientos[p];
    if (tm) ocupantes[tm] = [...(ocupantes[tm] ?? []), p];
  });
  const todos = COMPANEROS.every((p) => asientos[p]);
  const felices = revisado && todos && COMPANEROS.every((p) => GUSTOS[p][asientos[p]!].g >= 3);
  const libres = COMPANEROS.filter((x) => !asientos[x]);
  return (
    <group>
      {esc.temas.map((tm, i) => (
        <Mesa key={tm} i={i} tema={tm} nombre={esc.mesa[tm]!} modoColor={modoColor} />
      ))}
      {COMPANEROS.map((id, k) => {
        const p = PERSONAS[id];
        const tm = asientos[id];
        const sel = selMesa === id;
        let pos: Pt;
        let rot = 0;
        let pose: Pose = sel ? "saluda" : "parado";
        let emo: Emocion | null = null;
        if (tm) {
          const i = esc.temas.indexOf(tm);
          const s = (ocupantes[tm] ?? []).indexOf(id);
          pos = asientoPos(i, s);
          rot = mira(pos, MESA_POS(i));
          pose = "sentado";
          if (revisado) emo = GUSTOS[id][tm].g;
        } else {
          pos = LINEA(libres.indexOf(id), 4.6);
        }
        return (
          <PersonaFig
            key={id}
            p={p}
            destino={pos}
            rotY={rot}
            pose={pose}
            fase={k * 0.7}
            onClick={() => onElegirMesa(id)}
            anillo={sel ? modoColor : null}
            etiquetaCol={sel ? modoColor : emo !== null ? `${GRADO_DEF[emo as Grado].col}aa` : "rgba(255,255,255,0.28)"}
            etiqueta={<>{p.nombre}</>}
            emocion={emo}
            claveEmocion={`${escIdx}-${id}-${tm ?? ""}-${revisado ? 1 : 0}`}
          />
        );
      })}
      <Confeti activo={felices} centros={esc.temas.map((_, i) => MESA_POS(i))} />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. GIVE YOUR OPINION KINDLY
 * ════════════════════════════════════════════════════════════════════════ */

function VistaOpinion({ turnoIdx, respuestaTurno, reaccion }: Pick<GustosSceneProps, "turnoIdx" | "respuestaTurno" | "reaccion">) {
  const tu = TURNOS[turnoIdx] ?? TURNOS[0]!;
  const compa = PERSONAS[tu.quien];
  const yo = PERSONAS.tu;
  const posC = frente(tu.tema, 1.75, 0.2);
  const posT = frente(tu.tema, 3.35, 0.55);
  const rotC = mira(posC, posT);
  const rotT = mira(posT, posC);
  const emoC: Emocion = reaccion === "enojo" ? "enojo" : reaccion === "neutral" ? 2 : reaccion === "feliz" ? (tu.diferente ? 3 : 5) : tu.gradoCompa;
  const emoT: Emocion | null = respuestaTurno ? (tu.tarjeta.grado ?? 4) : null;
  const poseC: Pose = reaccion === "enojo" ? "no" : reaccion === "neutral" ? "encoger" : reaccion === "feliz" ? "aplaude" : "hablar";
  const lado = PUESTO[tu.tema].dir > 0 ? "der" : "izq";
  return (
    <group>
      <PersonaFig
        key={`c-${tu.id}`}
        p={compa}
        destino={posC}
        rotY={rotC}
        pose={poseC}
        etiqueta={<>{compa.nombre}</>}
        etiquetaDf={6.5}
        etiquetaCol={`${GRADO_DEF[tu.gradoCompa].col}aa`}
        emocion={emoC}
        claveEmocion={`${tu.id}-${reaccion ?? "linea"}`}
      >
        {!respuestaTurno && <Burbuja pos={[0, 3.3, 0]} texto={tu.linea} col={GRADO_DEF[tu.gradoCompa].col} df={5.8} lado={lado} ancho={340} />}
      </PersonaFig>
      <PersonaFig
        key={`t-${tu.id}`}
        p={yo}
        destino={posT}
        rotY={rotT}
        pose={respuestaTurno ? "hablar" : "parado"}
        etiqueta={<>You</>}
        etiquetaDf={6.5}
        etiquetaCol="#facc15cc"
        anillo="#facc15"
        emocion={emoT}
        claveEmocion={`${tu.id}-tu-${respuestaTurno ? 1 : 0}`}
      >
        {respuestaTurno && (
          <Burbuja
            pos={[0, 3.3, 0]}
            texto={respuestaTurno}
            col={reaccion === "feliz" ? OK : reaccion === "enojo" ? "#ef4444" : "#fbbf24"}
            df={5.8}
            lado={lado === "der" ? "izq" : "der"}
            ancho={340}
          />
        )}
      </PersonaFig>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Cámara guiada y escena
 * ════════════════════════════════════════════════════════════════════════ */

function CamaraGuiada({ pos, target, clave }: { pos: Pt; target: Pt; clave: string }) {
  const est = useRef<{ clave: string; t: number } | null>(null);
  useFrame((state, dt) => {
    const { camera } = state;
    const controls = state.controls as unknown as { target?: THREE.Vector3; update?: () => void } | null;
    if (!est.current || est.current.clave !== clave) est.current = { clave, t: 0 };
    const d = est.current;
    if (d.t > 2.4) return;
    d.t += Math.min(dt, 0.25);
    const k = suave(dt, 0.06);
    camera.position.x += (pos[0] - camera.position.x) * k;
    camera.position.y += (pos[1] - camera.position.y) * k;
    camera.position.z += (pos[2] - camera.position.z) * k;
    if (controls?.target) {
      controls.target.x += (target[0] - controls.target.x) * k;
      controls.target.y += (target[1] - controls.target.y) * k;
      controls.target.z += (target[2] - controls.target.z) * k;
      controls.update?.();
    } else camera.lookAt(target[0], target[1], target[2]);
  });
  return null;
}

export default function GustosOpinionesInglesScene(p: GustosSceneProps) {
  const { vista, modoColor, resetNonce } = p;

  let cam = GENERAL;
  let clave = `${vista}-general`;
  let foco: TemaId | null = null;
  if (vista === "encuesta") {
    foco = p.temaSel;
    const d = PUESTO[p.temaSel].dir;
    cam = { pos: [-d * 0.8, 12.4, 17.6], target: [-d * 0.9, 0.4, -0.8] };
    clave = `encuesta-${p.temaSel}`;
  } else if (vista === "mesas") {
    cam = { pos: [0, 8.6, 12.6], target: [0, 0.9, 0.9] };
    clave = `mesas-${p.escIdx}`;
  } else {
    const tu = TURNOS[p.turnoIdx] ?? TURNOS[0]!;
    const { x, z, dir } = PUESTO[tu.tema];
    foco = tu.tema;
    cam = { pos: [x + dir * 8.4, 3.9, z + 6.4], target: [x + dir * 2.5, 1.6, z + 0.3] };
    clave = `opinion-${p.turnoIdx}`;
  }

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: vista === "opinion" ? cam.pos : GENERAL.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#0b1530"]} />
      <fog attach="fog" args={["#0b1530", 32, 62]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#e0f2fe", "#4a3f2f", 0.45]} />
      <directionalLight
        position={[-6, 14, 10]}
        intensity={1.3}
        color="#fff1d6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 4.5, 1]} intensity={0.6} color={modoColor} distance={16} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.2} position={[0, 6, -9]} scale={[14, 6, 1]} color="#bfdbfe" />
        <Lightformer form="rect" intensity={0.6} position={[-8, 2, 7]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      <Patio foco={vista === "opinion" ? foco : null} sinNombres={false} />
      {vista === "encuesta" && (
        <VistaEncuesta
          temaSel={p.temaSel}
          seleccion={p.seleccion}
          ultima={p.ultima}
          burbuja={p.burbuja}
          respondidos={p.respondidos}
          grafica={p.grafica}
          onElegir={p.onElegir}
          modoColor={modoColor}
        />
      )}
      {vista === "mesas" && <VistaMesas escIdx={p.escIdx} asientos={p.asientos} revisado={p.revisado} selMesa={p.selMesa} onElegirMesa={p.onElegirMesa} modoColor={modoColor} />}
      {vista === "opinion" && <VistaOpinion turnoIdx={p.turnoIdx} respuestaTurno={p.respuestaTurno} reaccion={p.reaccion} />}
      {vista !== "encuesta" && (
        <group>
          <Caja p={[0, 0.2, ESCENARIO_Z]} s={[9.2, 0.4, 2.2]} c="#334155" r={0.6} />
          <Caja p={[0, 2.2, ESCENARIO_Z - 1.05]} s={[9.2, 3.6, 0.12]} c="#0f172a" r={0.5} />
          {vista === "mesas" && (
            <Etiqueta pos={[0, 3.2, ESCENARIO_Z - 0.9]} df={12} fs={14} col="#fbbf24aa">
              <i className="fa-solid fa-people-group" style={{ color: "#fbbf24" }} />
              <span lang="en">{(ESCENARIOS[p.escIdx] ?? ESCENARIOS[0]!).titulo}</span>
            </Etiqueta>
          )}
        </group>
      )}
      {vista !== "opinion" && (
        <Etiqueta pos={[0, 4.95, -8.4]} df={14} fs={13} col="#c4b5fdaa">
          <i className="fa-solid fa-school" style={{ color: "#c4b5fd" }} />
          Feria de Gustos · Preparatoria Las Jacarandas
        </Etiqueta>
      )}

      <CamaraGuiada pos={cam.pos} target={cam.target} clave={clave} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={4}
        maxDistance={30}
        maxPolarAngle={Math.PI * 0.46}
        minPolarAngle={Math.PI * 0.08}
        minAzimuthAngle={-Math.PI * 0.5}
        maxAzimuthAngle={Math.PI * 0.5}
      />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.8} luminanceSmoothing={0.7} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.5} />
      </EffectComposer>
    </Canvas>
  );
}
