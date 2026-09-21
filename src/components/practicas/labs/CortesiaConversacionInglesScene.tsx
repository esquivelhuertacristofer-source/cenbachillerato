"use client";

/**
 * Escena 3D del laboratorio "Polite conversations" (IN-IV-P06).
 *
 * Cinco escenarios de interior (cafetería de la escuela, patio de una fiesta
 * de cumpleaños, videollamada en una pantalla grande, recepción de una clínica
 * y salón de inglés) con dos personajes articulados: tú (Alex) y tu
 * interlocutor. El interlocutor muestra lenguaje corporal según cómo le
 * hablas (sonríe y rebota, cruza los brazos y retrocede, se rasca la cabeza,
 * baja la mirada, se despide con la mano) y una esfera de luz marca quién
 * tiene el turno.
 *
 * Cada modo agrega un instrumento que representa el fenómeno:
 *  - conversar: tres placas en el piso (OPEN · KEEP · CLOSE) y dos tubos que
 *    se llenan con la cortesía y la fluidez de tus respuestas.
 *  - registro: un indicador de aguja informal · neutral · formal con la zona
 *    que espera tu interlocutor.
 *  - arreglar: la conversación como torre de turnos; se toca la línea
 *    descortés directamente en 3D.
 *
 * Toda animación ocurre en useFrame mutando refs y avanza por tiempo. NO se
 * usa <Text> de drei (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { type Modo, type Escenario, type PersonajeId, type Emocion, type Etapa, type Aspecto, PERSONAJES, EMOCION_DEF, ETAPA_DEF, BANDA_DEF } from "./cortesia-conversacion-ingles-data";

type Pt = [number, number, number];

export interface LineaTorre {
  quien: "npc" | "tu";
  estado: "normal" | "elegida" | "mal" | "arreglada";
  activa: boolean;
}

export interface CortesiaSceneProps {
  vista: Modo;
  modoColor: string;
  resetNonce: number;
  escenario: Escenario;
  npc: PersonajeId;
  npcEmo: Emocion;
  npcDice: string | null;
  tuDice: string | null;
  tuAccion: boolean;
  habla: "npc" | "tu" | null;
  orbeColor: string;
  // conversar
  etapa: Etapa | null;
  etapasHechas: Etapa[];
  cortesia: number | null;
  fluidez: number | null;
  // registro
  aguja: number | null;
  objetivo: "informal" | "formal";
  // arreglar
  lineas: LineaTorre[];
  onTocarLinea: (i: number) => void;
}

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const OK = "#34d399";
const WARN = "#fb923c";

/* ════════════════════════════════════════════════════════════════════════
 * Texto en escena (Html)
 * ════════════════════════════════════════════════════════════════════════ */

function Etiqueta({ pos, children, col, fs = 11 }: { pos: Pt; children: ReactNode; col?: string; fs?: number }) {
  return (
    <Html position={pos} center zIndexRange={[18, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 9px",
          borderRadius: 999,
          background: "rgba(4,10,22,0.84)",
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

function Burbuja({ pos, quien, texto, col, lado, accion = false }: { pos: Pt; quien: string; texto: string; col: string; lado: "izq" | "der"; accion?: boolean }) {
  return (
    <Html position={pos} zIndexRange={[40, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ transform: `translate(${lado === "izq" ? "-78%" : "-22%"}, -100%)`, display: "flex", flexDirection: "column", alignItems: lado === "izq" ? "flex-end" : "flex-start" }}>
        <div
          className="cc-burbuja"
          style={{
            width: "max-content",
            maxWidth: 250,
            padding: "7px 12px 8px",
            borderRadius: 13,
            background: "#fff",
            color: "#0f172a",
            fontSize: 13,
            fontWeight: 800,
            lineHeight: 1.35,
            boxShadow: "0 10px 26px -10px #000",
            borderTop: `4px solid ${col}`,
            fontStyle: accion ? "italic" : "normal",
          }}
        >
          <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: col, textTransform: "uppercase", marginBottom: 2, fontStyle: "normal" }}>{quien}</div>
          {texto}
        </div>
        <div style={{ width: 0, height: 0, margin: lado === "izq" ? "0 22% 0 0" : "0 0 0 22%", borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: "9px solid #fff" }} />
      </div>
    </Html>
  );
}

function EmoBadge({ pos, emo }: { pos: Pt; emo: Emocion }) {
  const d = EMOCION_DEF[emo];
  return (
    <Html position={pos} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px 3px 5px", borderRadius: 999, background: "rgba(4,10,22,0.86)", border: `1px solid ${d.col}`, color: "#fff", fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap" }}>
        <i className={`fa-solid ${d.icono}`} style={{ color: d.col, fontSize: 13 }} />
        {d.es}
      </div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Geometrías compartidas
 * ════════════════════════════════════════════════════════════════════════ */

const G = {
  esfera: new THREE.SphereGeometry(1, 22, 16),
  esferaB: new THREE.SphereGeometry(1, 10, 8),
  caja: new THREE.BoxGeometry(1, 1, 1),
  cil: new THREE.CylinderGeometry(1, 1, 1, 20),
  cilB: new THREE.CylinderGeometry(1, 1, 1, 10),
  cono: new THREE.ConeGeometry(1, 1, 12),
  muslo: new THREE.CapsuleGeometry(0.075, 0.34, 5, 12),
  espinilla: new THREE.CapsuleGeometry(0.065, 0.34, 5, 12),
  brazo: new THREE.CapsuleGeometry(0.052, 0.24, 5, 10),
  antebrazo: new THREE.CapsuleGeometry(0.046, 0.22, 5, 10),
  torso: new THREE.CapsuleGeometry(0.18, 0.32, 6, 16),
  pelo: new THREE.SphereGeometry(0.142, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
  sonrisa: new THREE.TorusGeometry(0.034, 0.009, 6, 16, Math.PI),
  aro: new THREE.TorusGeometry(0.03, 0.006, 8, 20),
  disco: new THREE.CylinderGeometry(1, 1, 0.04, 40),
  tubo: new THREE.CylinderGeometry(0.1, 0.1, 1, 24, 1, true),
  anillo: new THREE.TorusGeometry(0.55, 0.075, 10, 40, Math.PI / 3),
  plano: new THREE.PlaneGeometry(1, 1),
  medioDisco: new THREE.CylinderGeometry(0.13, 0.13, 0.03, 20, 1, false, 0, Math.PI),
};

function Mat({ c, r = 0.62, m = 0, e, ei = 0, t, o = 1 }: { c: string; r?: number; m?: number; e?: string; ei?: number; t?: boolean; o?: number }) {
  return <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? "#000000"} emissiveIntensity={ei} transparent={t} opacity={o} />;
}

function Caja({ p, s, c, r = 0.7, m = 0, rot, sombra = true, e, ei }: { p: Pt; s: Pt; c: string; r?: number; m?: number; rot?: Pt; sombra?: boolean; e?: string; ei?: number }) {
  return (
    <mesh geometry={G.caja} position={p} scale={s} rotation={rot} castShadow={sombra} receiveShadow>
      <Mat c={c} r={r} m={m} e={e} ei={ei} />
    </mesh>
  );
}

function Cil({ p, s, c, r = 0.6, m = 0, rot, e, ei }: { p: Pt; s: Pt; c: string; r?: number; m?: number; rot?: Pt; e?: string; ei?: number }) {
  return (
    <mesh geometry={G.cil} position={p} scale={s} rotation={rot} castShadow receiveShadow>
      <Mat c={c} r={r} m={m} e={e} ei={ei} />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Personaje articulado con lenguaje corporal
 * ════════════════════════════════════════════════════════════════════════ */

interface Pose {
  /** Hombros: rotación x y z. Índice 0 = brazo del lado −x (mano derecha), 1 = lado +x. */
  sx: [number, number];
  sz: [number, number];
  codo: [number, number];
  cabX: number;
  cabZ: number;
  inclina: number;
  atras: number;
}

const POSES: Record<Emocion, Pose> = {
  neutral: { sx: [0.05, 0.05], sz: [-0.1, 0.1], codo: [-0.2, -0.2], cabX: 0, cabZ: 0, inclina: 0, atras: 0 },
  feliz: { sx: [-0.2, -0.2], sz: [-0.3, 0.3], codo: [-0.55, -0.55], cabX: -0.05, cabZ: 0.06, inclina: 0, atras: 0 },
  incomoda: { sx: [-0.32, -0.32], sz: [0.5, -0.5], codo: [-1.95, -1.95], cabX: -0.1, cabZ: -0.05, inclina: -0.08, atras: -0.2 },
  confundida: { sx: [-2.75, 0.05], sz: [0.4, 0.12], codo: [-1.95, -0.2], cabX: 0, cabZ: 0.26, inclina: 0, atras: 0 },
  triste: { sx: [-0.12, -0.12], sz: [0.02, -0.02], codo: [-0.15, -0.15], cabX: 0.42, cabZ: 0, inclina: 0.1, atras: 0 },
  despide: { sx: [0, 0.05], sz: [-2.55, 0.12], codo: [-0.35, -0.2], cabX: -0.05, cabZ: 0.08, inclina: 0, atras: 0 },
};

function Figura({ a, emo, habla, sentado = false, fase = 0 }: { a: Aspecto; emo: Emocion; habla: boolean; sentado?: boolean; fase?: number }) {
  const raiz = useRef<THREE.Group>(null);
  const cuerpo = useRef<THREE.Group>(null);
  const cabeza = useRef<THREE.Group>(null);
  const hombro0 = useRef<THREE.Group>(null);
  const hombro1 = useRef<THREE.Group>(null);
  const codo0 = useRef<THREE.Group>(null);
  const codo1 = useRef<THREE.Group>(null);
  const boca = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + fase;
    const k = suave(dt, 0.12);
    const p = POSES[emo];
    const r = raiz.current;
    const c = cuerpo.current;
    const h = cabeza.current;
    if (r) {
      const bote = emo === "feliz" ? Math.abs(Math.sin(t * 5)) * 0.035 : 0;
      r.position.y += (bote - r.position.y) * suave(dt, 0.35);
      r.position.z += (p.atras - r.position.z) * k;
    }
    if (c) {
      const resp = Math.sin(t * 1.9) * 0.012;
      c.rotation.x += (p.inclina + resp - c.rotation.x) * k;
    }
    if (h) {
      const asiente = emo === "neutral" ? Math.sin(t * 2.2) * 0.05 : 0;
      const ladeo = emo === "feliz" ? Math.sin(t * 3) * 0.05 : 0;
      h.rotation.x += (p.cabX + asiente - h.rotation.x) * k;
      h.rotation.z += (p.cabZ + ladeo - h.rotation.z) * k;
    }
    const ola = emo === "despide" ? Math.sin(t * 9) * 0.28 : 0;
    const rasca = emo === "confundida" ? Math.sin(t * 10) * 0.12 : 0;
    const brazos: [THREE.Group | null, THREE.Group | null, number][] = [
      [hombro0.current, codo0.current, 0],
      [hombro1.current, codo1.current, 1],
    ];
    for (const [hg, cg, i] of brazos) {
      const sx = p.sx[i]!;
      const sz = p.sz[i]! + (i === 0 ? ola : 0);
      const cx = p.codo[i]! + (i === 0 ? rasca : 0);
      if (hg) {
        hg.rotation.x += (sx - hg.rotation.x) * k;
        hg.rotation.z += (sz - hg.rotation.z) * k;
      }
      if (cg) cg.rotation.x += (cx - cg.rotation.x) * k;
    }
    const b = boca.current;
    if (b) {
      const abre = habla ? 0.35 + Math.abs(Math.sin(t * 13)) * 0.9 : 0.05;
      b.scale.y += (abre * 0.02 - b.scale.y) * suave(dt, 0.5);
    }
  });

  const esc = a.escala ?? 1;
  const dy = sentado ? -0.4 : 0;
  const sonrie = emo === "feliz" || emo === "despide";
  const molesta = emo === "incomoda" || emo === "triste";
  const cejaZ = emo === "triste" ? 0.35 : emo === "incomoda" ? -0.32 : 0;
  const cejaY = emo === "feliz" || emo === "despide" ? 0.012 : emo === "confundida" ? 0.015 : 0;

  const pierna = (lado: number) => (
    <group key={lado} position={[lado * 0.1, 0.88 + dy, 0]} rotation={[sentado ? -1.5 : 0, 0, 0]}>
      <mesh geometry={G.muslo} position={[0, -0.23, 0]} castShadow>
        <Mat c={a.pantalon} />
      </mesh>
      <group position={[0, -0.46, 0]} rotation={[sentado ? 1.5 : 0, 0, 0]}>
        <mesh geometry={G.espinilla} position={[0, -0.21, 0]} castShadow>
          <Mat c={a.pantalon} />
        </mesh>
        <mesh geometry={G.caja} position={[0, -0.41, 0.045]} scale={[0.11, 0.07, 0.22]} castShadow>
          <Mat c="#1f2937" r={0.5} />
        </mesh>
      </group>
    </group>
  );

  const brazo = (i: 0 | 1) => {
    const lado = i === 0 ? -1 : 1;
    return (
      <group ref={i === 0 ? hombro0 : hombro1} position={[lado * 0.25, 1.4, 0]}>
        <mesh geometry={G.brazo} position={[0, -0.15, 0]} castShadow>
          <Mat c={a.uniforme === "saco" ? "#1e293b" : a.camisa} />
        </mesh>
        <group ref={i === 0 ? codo0 : codo1} position={[0, -0.31, 0]}>
          <mesh geometry={G.antebrazo} position={[0, -0.13, 0]} castShadow>
            <Mat c={a.uniforme === "saco" ? "#1e293b" : a.camisa} />
          </mesh>
          <mesh geometry={G.esfera} position={[0, -0.3, 0]} scale={0.052}>
            <Mat c={a.piel} />
          </mesh>
        </group>
      </group>
    );
  };

  return (
    <group scale={esc}>
      <group ref={raiz}>
        {pierna(-1)}
        {pierna(1)}
        <group position={[0, dy, 0]}>
          <group ref={cuerpo} position={[0, 0.9, 0]}>
            <group position={[0, -0.9, 0]}>
              <mesh geometry={G.caja} position={[0, 0.9, 0]} scale={[0.4, 0.14, 0.24]} castShadow>
                <Mat c={a.pantalon} />
              </mesh>
              <mesh geometry={G.torso} position={[0, 1.17, 0]} scale={[1.18, 1, 0.74]} castShadow>
                <Mat c={a.uniforme === "saco" ? "#1e293b" : a.camisa} r={0.7} />
              </mesh>
              {[-1, 1].map((s) => (
                <mesh key={s} geometry={G.esfera} position={[s * 0.235, 1.39, 0]} scale={0.068} castShadow>
                  <Mat c={a.uniforme === "saco" ? "#1e293b" : a.camisa} r={0.7} />
                </mesh>
              ))}
              {a.uniforme === "mandil" && (
                <>
                  <mesh geometry={G.caja} position={[0, 0.98, 0.14]} scale={[0.34, 0.5, 0.02]} castShadow>
                    <Mat c="#f8fafc" r={0.9} />
                  </mesh>
                  <mesh geometry={G.caja} position={[0, 1.47, 0.02]} scale={[0.2, 0.06, 0.2]}>
                    <Mat c="#f8fafc" r={0.9} />
                  </mesh>
                </>
              )}
              {a.uniforme === "chaleco" && (
                <>
                  {[-1, 1].map((s) => (
                    <mesh key={s} geometry={G.caja} position={[s * 0.1, 1.18, 0.125]} scale={[0.14, 0.44, 0.03]} castShadow>
                      <Mat c="#0f766e" r={0.6} />
                    </mesh>
                  ))}
                  <mesh geometry={G.caja} position={[0.11, 1.3, 0.145]} scale={[0.07, 0.035, 0.01]}>
                    <Mat c="#f8fafc" e="#ffffff" ei={0.2} />
                  </mesh>
                </>
              )}
              {a.uniforme === "saco" && (
                <mesh geometry={G.caja} position={[0, 1.3, 0.125]} rotation={[0.2, 0, Math.PI / 4]} scale={[0.13, 0.13, 0.02]}>
                  <Mat c={a.camisa} r={0.7} />
                </mesh>
              )}
              {brazo(0)}
              {brazo(1)}
              <mesh geometry={G.cil} position={[0, 1.49, 0]} scale={[0.05, 0.1, 0.05]}>
                <Mat c={a.piel} />
              </mesh>
              <group ref={cabeza} position={[0, 1.55, 0]}>
                <group position={[0, 0.09, 0]} scale={1.12}>
                  <mesh geometry={G.esfera} scale={[0.13, 0.14, 0.13]} castShadow>
                    <Mat c={a.piel} r={0.55} />
                  </mesh>
                  {[-1, 1].map((s) => (
                    <group key={s}>
                      <mesh geometry={G.esferaB} position={[s * 0.047, 0.018, 0.115]} scale={[0.016, emo === "triste" ? 0.011 : 0.019, 0.012]}>
                        <meshStandardMaterial color="#0b0f14" roughness={0.3} />
                      </mesh>
                      <mesh geometry={G.caja} position={[s * 0.047, 0.056 + cejaY * (emo === "confundida" && s === 1 ? 2 : 1), 0.118]} rotation={[0, 0, s * cejaZ]} scale={[0.048, 0.011, 0.012]}>
                        <meshStandardMaterial color="#1b120c" />
                      </mesh>
                      {sonrie && (
                        <mesh geometry={G.esferaB} position={[s * 0.075, -0.025, 0.098]} scale={[0.024, 0.014, 0.01]}>
                          <meshStandardMaterial color="#f472b6" transparent opacity={0.55} />
                        </mesh>
                      )}
                    </group>
                  ))}
                  <mesh geometry={G.esferaB} position={[0, -0.005, 0.13]} scale={0.018}>
                    <Mat c={a.piel} r={0.5} />
                  </mesh>
                  {sonrie && (
                    <mesh geometry={G.sonrisa} position={[0, -0.04, 0.118]} rotation={[0.1, 0, Math.PI]}>
                      <meshStandardMaterial color="#7c2d12" />
                    </mesh>
                  )}
                  {molesta && (
                    <mesh geometry={G.sonrisa} position={[0, -0.078, 0.114]} rotation={[-0.1, 0, 0]} scale={[0.85, 0.7, 1]}>
                      <meshStandardMaterial color="#7c2d12" />
                    </mesh>
                  )}
                  {!sonrie && !molesta && (
                    <mesh geometry={G.caja} position={[0.004, -0.062, 0.121]} rotation={[0, 0, emo === "confundida" ? 0.3 : 0]} scale={[0.05, 0.009, 0.01]}>
                      <meshStandardMaterial color="#7c2d12" />
                    </mesh>
                  )}
                  <mesh ref={boca} geometry={G.esferaB} position={[0, -0.062, 0.118]} scale={[0.024, 0.001, 0.012]}>
                    <meshStandardMaterial color="#3b0d0d" />
                  </mesh>
                  <Peinado a={a} />
                  {a.lentes && (
                    <group position={[0, 0.018, 0.128]}>
                      {[-1, 1].map((s) => (
                        <mesh key={s} geometry={G.aro} position={[s * 0.047, 0, 0]}>
                          <meshStandardMaterial color="#111827" metalness={0.4} roughness={0.3} />
                        </mesh>
                      ))}
                      <mesh geometry={G.caja} scale={[0.034, 0.006, 0.006]}>
                        <meshStandardMaterial color="#111827" />
                      </mesh>
                    </group>
                  )}
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function Peinado({ a }: { a: Aspecto }) {
  return (
    <group>
      <mesh geometry={G.pelo} rotation={[-0.45, 0, 0]} position={[0, 0.018, -0.012]} castShadow>
        <Mat c={a.pelo} r={0.85} />
      </mesh>
      {a.peinado === "largo" && (
        <>
          <mesh geometry={G.caja} position={[0, -0.12, -0.085]} scale={[0.27, 0.34, 0.07]} castShadow>
            <Mat c={a.pelo} r={0.85} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} geometry={G.caja} position={[s * 0.125, -0.07, -0.01]} scale={[0.04, 0.24, 0.12]}>
              <Mat c={a.pelo} r={0.85} />
            </mesh>
          ))}
        </>
      )}
      {a.peinado === "coleta" && (
        <>
          <mesh geometry={G.esferaB} position={[0, 0.05, -0.15]} scale={0.045}>
            <Mat c={a.pelo} r={0.85} />
          </mesh>
          <mesh geometry={G.esfera} position={[0, -0.07, -0.185]} scale={[0.05, 0.13, 0.05]} rotation={[0.35, 0, 0]} castShadow>
            <Mat c={a.pelo} r={0.85} />
          </mesh>
        </>
      )}
      {a.peinado === "chongo" && (
        <mesh geometry={G.esfera} position={[0, 0.1, -0.1]} scale={0.07} castShadow>
          <Mat c={a.pelo} r={0.85} />
        </mesh>
      )}
    </group>
  );
}

/* ── Esfera del turno ─────────────────────────────────────────────────── */

function OrbeTurno({ a, b, habla, color }: { a: Pt; b: Pt; habla: "npc" | "tu" | null; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const col = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }, dt) => {
    const m = ref.current;
    if (!m) return;
    const destino = habla === "npc" ? b : habla === "tu" ? a : ([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.1, (a[2] + b[2]) / 2] as Pt);
    const k = suave(dt, 0.06);
    const t = clock.elapsedTime;
    m.position.x += (destino[0] - m.position.x) * k;
    m.position.y += (destino[1] + Math.sin(t * 2.4) * 0.04 - m.position.y) * k;
    m.position.z += (destino[2] - m.position.z) * k;
    const s = habla ? 0.065 + Math.sin(t * 6) * 0.008 : 0.045;
    m.scale.setScalar(m.scale.x + (s - m.scale.x) * k);
    col.set(color);
    const mat = m.material as THREE.MeshStandardMaterial;
    mat.color.lerp(col, k);
    mat.emissive.lerp(col, k);
  });
  return (
    <>
      <mesh ref={ref} geometry={G.esfera} position={[(a[0] + b[0]) / 2, a[1], (a[2] + b[2]) / 2]} scale={0.05}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Escenarios
 * ════════════════════════════════════════════════════════════════════════ */

const PISO_CAFE: { x: number; z: number }[] = (() => {
  const out: { x: number; z: number }[] = [];
  for (let i = -10; i < 10; i++) for (let j = -7; j < 6; j++) if ((i + j) % 2 === 0) out.push({ x: i * 0.6 + 0.3, z: j * 0.6 + 0.3 });
  return out;
})();

function Baldosas({ items, color }: { items: { x: number; z: number }[]; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    const m = ref.current;
    if (!m || m.userData.listo) return;
    items.forEach((it, i) => {
      tmp.position.set(it.x, 0.004, it.z);
      tmp.rotation.set(-Math.PI / 2, 0, 0);
      tmp.scale.set(0.6, 0.6, 1);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.userData.listo = true;
  });
  return (
    <instancedMesh ref={ref} args={[G.plano, undefined, items.length]} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.8} />
    </instancedMesh>
  );
}

function Cuarto({ piso, pared, zoclo }: { piso: string; pared: string; zoclo: string }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[14, 11, 1]} geometry={G.plano} receiveShadow>
        <Mat c={piso} r={0.85} />
      </mesh>
      <Caja p={[0, 1.8, -2.75]} s={[14, 3.6, 0.2]} c={pared} r={0.9} sombra={false} />
      <Caja p={[0, 0.45, -2.63]} s={[14, 0.9, 0.04]} c={zoclo} r={0.8} sombra={false} />
      <Caja p={[-5.2, 1.8, 0]} s={[0.2, 3.6, 11]} c={pared} r={0.9} sombra={false} />
      <Caja p={[5.2, 1.8, 0]} s={[0.2, 3.6, 11]} c={pared} r={0.9} sombra={false} />
    </group>
  );
}

function Ventana({ p, w = 1.2, h = 1 }: { p: Pt; w?: number; h?: number }) {
  return (
    <group position={p}>
      <Caja p={[0, 0, 0]} s={[w + 0.12, h + 0.12, 0.05]} c="#e2e8f0" sombra={false} />
      <mesh geometry={G.plano} position={[0, 0, 0.03]} scale={[w, h, 1]}>
        <meshStandardMaterial color="#bae6fd" emissive="#7dd3fc" emissiveIntensity={0.55} />
      </mesh>
      <Caja p={[0, 0, 0.04]} s={[0.04, h, 0.02]} c="#e2e8f0" sombra={false} />
    </group>
  );
}

function Mesa({ p, w = 1.8, d = 0.8, c = "#e2e8f0", bancas = true }: { p: Pt; w?: number; d?: number; c?: string; bancas?: boolean }) {
  return (
    <group position={p}>
      <Caja p={[0, 0.74, 0]} s={[w, 0.06, d]} c={c} r={0.4} />
      {[-1, 1].map((sx) => [-1, 1].map((sz) => <Cil key={`${sx}${sz}`} p={[sx * (w / 2 - 0.1), 0.37, sz * (d / 2 - 0.1)]} s={[0.03, 0.74, 0.03]} c="#64748b" m={0.6} r={0.3} />))}
      {bancas &&
        [-1, 1].map((sz) => (
          <group key={sz}>
            <Caja p={[0, 0.44, sz * (d / 2 + 0.3)]} s={[w, 0.05, 0.3]} c="#0e7490" r={0.5} />
            <Caja p={[0, 0.22, sz * (d / 2 + 0.3)]} s={[w - 0.3, 0.44, 0.04]} c="#475569" />
          </group>
        ))}
    </group>
  );
}

function Cafeteria({ mostrador }: { mostrador: boolean }) {
  return (
    <group>
      <Cuarto piso="#e7e1d3" pared="#f6ecd9" zoclo="#0e7490" />
      <Baldosas items={PISO_CAFE} color="#cfc6b2" />
      <Ventana p={[-3.6, 1.95, -2.63]} />
      <Ventana p={[-2.1, 1.95, -2.63]} />
      {/* Barra de servicio al fondo */}
      <group position={[1.6, 0, -2.2]}>
        <Caja p={[0, 0.48, 0]} s={[3.2, 0.96, 0.6]} c="#0e7490" r={0.5} />
        <Caja p={[0, 0.98, 0]} s={[3.3, 0.05, 0.66]} c="#cbd5e1" m={0.7} r={0.25} />
        {[-1.1, -0.35, 0.4, 1.15].map((x, i) => (
          <Caja key={x} p={[x, 1.05, 0]} s={[0.5, 0.07, 0.36]} c={["#f59e0b", "#ef4444", "#84cc16", "#fde68a"][i]!} r={0.6} />
        ))}
        <mesh geometry={G.caja} position={[0, 1.3, 0.12]} scale={[3.1, 0.02, 0.4]}>
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.25} roughness={0.05} />
        </mesh>
        <Caja p={[0, 2.35, -0.33]} s={[2.6, 0.8, 0.06]} c="#14532d" r={0.8} sombra={false} />
        {[0, 1, 2].map((k) => (
          <Caja key={k} p={[-0.6, 2.55 - k * 0.2, -0.29]} s={[1.1, 0.05, 0.01]} c="#fef3c7" sombra={false} />
        ))}
        {[0, 1, 2].map((k) => (
          <Caja key={k} p={[0.85, 2.55 - k * 0.2, -0.29]} s={[0.4, 0.05, 0.01]} c="#fcd34d" sombra={false} />
        ))}
        <Etiqueta pos={[0, 2.9, -0.2]} col="#fcd34d">
          <i className="fa-solid fa-utensils" style={{ color: "#fcd34d" }} />
          Cafetería
        </Etiqueta>
      </group>
      <Mesa p={[-3.1, 0, -0.9]} />
      <Mesa p={[3.9, 0, 0.6]} w={1.4} />
      {/* Mochila y bote */}
      <Caja p={[-2.4, 0.18, 0.1]} s={[0.3, 0.36, 0.18]} c="#7c3aed" r={0.8} rot={[0, 0.4, 0]} />
      <Cil p={[-4.4, 0.4, -2.2]} s={[0.25, 0.8, 0.25]} c="#16a34a" r={0.5} />
      {mostrador && (
        <group position={[0.75, 0, -0.18]}>
          <Caja p={[0, 0.5, 0]} s={[1.9, 1, 0.55]} c="#155e75" r={0.5} />
          <Caja p={[0, 1.03, 0]} s={[2, 0.06, 0.62]} c="#cbd5e1" m={0.7} r={0.25} />
          <Caja p={[0.45, 1.08, 0.05]} s={[0.46, 0.03, 0.32]} c="#f97316" r={0.5} />
          <mesh geometry={G.medioDisco} position={[0.45, 1.11, 0.07]} rotation={[0, 0.3, 0]}>
            <Mat c="#fcd34d" r={0.7} />
          </mesh>
          <Cil p={[-0.55, 1.14, 0]} s={[0.05, 0.14, 0.05]} c="#ef4444" r={0.4} />
          <Cil p={[-0.42, 1.12, 0.05]} s={[0.05, 0.1, 0.05]} c="#16a34a" r={0.4} />
        </group>
      )}
    </group>
  );
}

const PAPEL = ["#ec4899", "#f97316", "#22c55e", "#a855f7", "#facc15", "#06b6d4"];

function Fiesta() {
  const cuerdas = useRef<THREE.Group>(null);
  const globos = useRef<THREE.Group>(null);
  const flamas = useRef<THREE.Group>(null);
  const pinata = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    cuerdas.current?.children.forEach((c, i) => {
      c.rotation.x = Math.sin(t * 1.6 + i * 0.8) * 0.18;
    });
    globos.current?.children.forEach((c, i) => {
      c.position.y = Math.sin(t * 1.3 + i) * 0.05;
    });
    flamas.current?.children.forEach((c, i) => {
      c.scale.y = 1 + Math.sin(t * 17 + i * 2) * 0.2;
    });
    if (pinata.current) pinata.current.rotation.y = Math.sin(t * 0.7) * 0.4;
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[14, 11, 1]} geometry={G.plano} receiveShadow>
        <Mat c="#5aa846" r={0.95} />
      </mesh>
      {/* Casa al fondo */}
      <Caja p={[0, 1.8, -2.75]} s={[14, 3.6, 0.2]} c="#f4c7a1" r={0.95} sombra={false} />
      <Caja p={[0, 0.2, -2.6]} s={[14, 0.4, 0.1]} c="#b45309" sombra={false} />
      <group position={[-1.6, 0, -2.62]}>
        <Caja p={[0, 1.05, 0]} s={[1, 2.1, 0.06]} c="#7c2d12" r={0.7} sombra={false} />
        <mesh geometry={G.esferaB} position={[0.35, 1.05, 0.05]} scale={0.04}>
          <Mat c="#fcd34d" m={0.8} r={0.3} />
        </mesh>
      </group>
      <Ventana p={[1.4, 1.8, -2.63]} w={1.3} h={0.9} />
      <Ventana p={[3.6, 1.8, -2.63]} w={1.3} h={0.9} />
      {/* Barda lateral con buganvilia */}
      <Caja p={[-5.2, 1.1, 0]} s={[0.25, 2.2, 11]} c="#f1ddc3" sombra={false} />
      <Caja p={[5.2, 1.1, 0]} s={[0.25, 2.2, 11]} c="#f1ddc3" sombra={false} />
      {/* Papel picado */}
      <group ref={cuerdas}>
        {[-1.9, -0.7].map((z, fila) => (
          <group key={z} position={[0, 2.62, z]}>
            <mesh geometry={G.cilB} rotation={[0, 0, Math.PI / 2]} scale={[0.006, 9, 0.006]}>
              <Mat c="#e5e7eb" />
            </mesh>
            {Array.from({ length: 18 }, (_, i) => (
              <mesh key={i} geometry={G.plano} position={[-4.25 + i * 0.5, -0.14, 0]} scale={[0.34, 0.26, 1]}>
                <meshStandardMaterial color={PAPEL[(i + fila * 2) % PAPEL.length]!} side={THREE.DoubleSide} roughness={0.7} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      {/* Mesa del pastel */}
      <group position={[-2.7, 0, -1.2]}>
        <Caja p={[0, 0.74, 0]} s={[1.5, 0.05, 0.8]} c="#fdf2f8" r={0.9} />
        <Caja p={[0, 0.5, 0.41]} s={[1.5, 0.45, 0.01]} c="#f9a8d4" r={0.9} sombra={false} />
        {[-1, 1].map((sx) => [-1, 1].map((sz) => <Cil key={`${sx}${sz}`} p={[sx * 0.65, 0.37, sz * 0.32]} s={[0.025, 0.74, 0.025]} c="#94a3b8" />))}
        <Cil p={[0, 0.86, 0]} s={[0.28, 0.2, 0.28]} c="#fbcfe8" r={0.7} />
        <Cil p={[0, 1.04, 0]} s={[0.19, 0.16, 0.19]} c="#fdf2f8" r={0.7} />
        <group ref={flamas}>
          {[-0.08, 0, 0.08].map((x) => (
            <group key={x} position={[x, 1.17, 0]}>
              <mesh geometry={G.cilB} position={[0, -0.02, 0]} scale={[0.008, 0.08, 0.008]}>
                <Mat c="#60a5fa" />
              </mesh>
              <mesh geometry={G.esferaB} position={[0, 0.04, 0]} scale={[0.012, 0.024, 0.012]}>
                <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={3} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
        {[-0.5, 0.5].map((x) => (
          <Cil key={x} p={[x, 0.78, 0.12]} s={[0.12, 0.012, 0.12]} c="#fef9c3" r={0.4} />
        ))}
      </group>
      {/* Globos */}
      <group position={[3.4, 0, -1.9]} ref={globos}>
        {[
          [0, 2.2, 0, "#ef4444"],
          [0.35, 2.05, 0.1, "#3b82f6"],
          [-0.3, 1.95, 0.15, "#facc15"],
          [0.15, 1.75, -0.2, "#a855f7"],
        ].map(([x, y, z, c], i) => (
          <group key={i}>
            <mesh geometry={G.esfera} position={[x as number, y as number, z as number]} scale={[0.18, 0.22, 0.18]} castShadow>
              <meshStandardMaterial color={c as string} roughness={0.25} metalness={0.05} />
            </mesh>
            <mesh geometry={G.cilB} position={[(x as number) / 2, ((y as number) - 0.2) / 2 + 0.5, (z as number) / 2]} rotation={[(z as number) * 0.6, 0, -(x as number) * 0.6]} scale={[0.004, (y as number) - 0.7, 0.004]}>
              <Mat c="#e5e7eb" />
            </mesh>
          </group>
        ))}
        <Caja p={[0, 0.5, 0]} s={[0.2, 1, 0.2]} c="#e5e7eb" sombra={false} />
      </group>
      {/* Piñata de estrella */}
      <group ref={pinata} position={[0.2, 2.55, -2.0]}>
        <mesh geometry={G.cilB} position={[0, 0.5, 0]} scale={[0.006, 1, 0.006]}>
          <Mat c="#a16207" />
        </mesh>
        <mesh geometry={G.esfera} scale={0.2} castShadow>
          <Mat c="#f472b6" r={0.8} />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6].map((k) => {
          const ang = (k / 7) * Math.PI * 2;
          return (
            <mesh key={k} geometry={G.cono} position={[Math.cos(ang) * 0.27, Math.sin(ang) * 0.27, 0]} rotation={[0, 0, ang - Math.PI / 2]} scale={[0.08, 0.26, 0.08]} castShadow>
              <Mat c={PAPEL[k % PAPEL.length]!} r={0.8} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function Clinica() {
  const minutero = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (minutero.current) minutero.current.rotation.z = -clock.elapsedTime * 0.15;
  });
  return (
    <group>
      <Cuarto piso="#e6eef2" pared="#e3f4f1" zoclo="#14b8a6" />
      {/* Letrero */}
      <group position={[-1.9, 2.35, -2.63]}>
        <Caja p={[0, 0, 0]} s={[0.36, 0.1, 0.04]} c="#16a34a" e="#16a34a" ei={0.3} sombra={false} />
        <Caja p={[0, 0, 0]} s={[0.1, 0.36, 0.04]} c="#16a34a" e="#16a34a" ei={0.3} sombra={false} />
        <Etiqueta pos={[0, -0.36, 0.05]} col="#34d399">
          Clínica Los Pinos · Reception
        </Etiqueta>
      </group>
      {/* Reloj */}
      <group position={[2.2, 2.45, -2.62]}>
        <mesh geometry={G.cil} rotation={[Math.PI / 2, 0, 0]} scale={[0.26, 0.05, 0.26]}>
          <Mat c="#f8fafc" />
        </mesh>
        <Caja p={[0, 0.06, 0.04]} s={[0.02, 0.13, 0.01]} c="#0f172a" sombra={false} />
        <group ref={minutero} position={[0, 0, 0.045]}>
          <Caja p={[0, 0.09, 0]} s={[0.012, 0.18, 0.01]} c="#0f172a" sombra={false} />
        </group>
      </group>
      {/* Mostrador de recepción */}
      <group position={[0.75, 0, -0.2]}>
        <Caja p={[0, 0.55, 0]} s={[2.1, 1.1, 0.5]} c="#f8fafc" r={0.6} />
        <Caja p={[0, 0.55, 0.26]} s={[2.1, 0.5, 0.02]} c="#14b8a6" r={0.5} />
        <Caja p={[0, 1.13, 0.02]} s={[2.2, 0.05, 0.6]} c="#b45309" r={0.5} />
        <group position={[-0.45, 1.16, -0.1]} rotation={[0, 0.35, 0]}>
          <Caja p={[0, 0.24, 0]} s={[0.46, 0.3, 0.03]} c="#0f172a" r={0.3} />
          <mesh geometry={G.plano} position={[0, 0.24, 0.017]} scale={[0.42, 0.26, 1]}>
            <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.6} />
          </mesh>
          <Caja p={[0, 0.05, 0]} s={[0.05, 0.1, 0.05]} c="#334155" />
        </group>
        <mesh geometry={G.esfera} position={[0.55, 1.16, 0.12]} scale={[0.06, 0.04, 0.06]}>
          <Mat c="#fcd34d" m={0.85} r={0.2} />
        </mesh>
        <Caja p={[0.2, 1.165, 0.12]} s={[0.22, 0.01, 0.3]} c="#f8fafc" sombra={false} />
        <Cil p={[0.85, 1.22, -0.05]} s={[0.04, 0.12, 0.04]} c="#0e7490" />
      </group>
      {/* Sala de espera */}
      {[0, 1, 2].map((k) => (
        <group key={k} position={[-3.9 + k * 0.62, 0, -2.1]}>
          <Caja p={[0, 0.45, 0]} s={[0.52, 0.06, 0.48]} c="#2563eb" r={0.5} />
          <Caja p={[0, 0.75, -0.22]} s={[0.52, 0.55, 0.05]} c="#2563eb" r={0.5} />
          <Cil p={[0, 0.22, 0]} s={[0.03, 0.44, 0.03]} c="#94a3b8" m={0.6} />
        </group>
      ))}
      <group position={[3.8, 0, -2.0]}>
        <Cil p={[0, 0.25, 0]} s={[0.22, 0.5, 0.22]} c="#a16207" />
        {[0, 1, 2, 3, 4].map((k) => (
          <mesh key={k} geometry={G.esferaB} position={[Math.cos(k * 1.3) * 0.18, 0.75 + (k % 2) * 0.18, Math.sin(k * 1.3) * 0.18]} scale={0.24}>
            <Mat c="#15803d" r={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Salon() {
  return (
    <group>
      <Cuarto piso="#c99c6b" pared="#fef6df" zoclo="#92400e" />
      {/* Pizarrón */}
      <group position={[-2.35, 1.75, -2.62]}>
        <Caja p={[0, 0, 0]} s={[3, 1.3, 0.06]} c="#94a3b8" m={0.4} sombra={false} />
        <Caja p={[0, 0, 0.035]} s={[2.86, 1.16, 0.02]} c="#f8fafc" r={0.25} sombra={false} />
        <Caja p={[0, -0.7, 0.08]} s={[2.6, 0.04, 0.1]} c="#94a3b8" sombra={false} />
        <Html position={[0, 0.15, 0.06]} center transform distanceFactor={2.2} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ width: 520, textAlign: "center", fontFamily: "ui-rounded, 'Comic Sans MS', system-ui, sans-serif", color: "#1e3a8a" }}>
            <div style={{ fontSize: 34, fontWeight: 900 }}>Unit 6 · Social English</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#b91c1c", marginTop: 8 }}>Open → Keep → Close</div>
          </div>
        </Html>
      </group>
      {/* Escritorio de la maestra */}
      <group position={[2.4, 0, -1.1]} rotation={[0, -0.3, 0]}>
        <Caja p={[0, 0.74, 0]} s={[1.4, 0.06, 0.7]} c="#92400e" r={0.6} />
        <Caja p={[0, 0.37, 0]} s={[1.3, 0.7, 0.6]} c="#78350f" r={0.7} />
        <Caja p={[-0.35, 0.82, 0]} s={[0.3, 0.1, 0.22]} c="#1d4ed8" />
        <Caja p={[-0.35, 0.91, 0]} s={[0.28, 0.08, 0.2]} c="#dc2626" />
        <mesh geometry={G.esfera} position={[0.35, 0.83, 0.1]} scale={0.06}>
          <Mat c="#dc2626" r={0.3} />
        </mesh>
      </group>
      {/* Pupitres */}
      {[-4.3, -3.3].map((x) =>
        [-0.6, 0.6].map((z) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <Caja p={[0, 0.7, 0]} s={[0.7, 0.04, 0.5]} c="#d6b48a" />
            <Caja p={[0, 0.35, 0.2]} s={[0.04, 0.7, 0.04]} c="#475569" />
            <Caja p={[0, 0.44, 0.45]} s={[0.4, 0.04, 0.38]} c="#0e7490" />
          </group>
        )),
      )}
      {/* Mapa */}
      <group position={[2.6, 2.0, -2.62]}>
        <Caja p={[0, 0, 0]} s={[1.2, 0.8, 0.02]} c="#bfdbfe" sombra={false} />
        {[
          [-0.3, 0.12, 0.34, 0.26],
          [0.2, -0.08, 0.26, 0.34],
          [0.35, 0.18, 0.2, 0.12],
        ].map(([x, y, w, h], i) => (
          <Caja key={i} p={[x!, y!, 0.015]} s={[w!, h!, 0.01]} c="#4ade80" sombra={false} />
        ))}
      </group>
    </group>
  );
}

/** Videollamada: la pantalla es una ventana real hacia el cuarto de Emily. */
function Videollamada() {
  const W = 2.3;
  const H = 1.34;
  const CY = 1.58;
  const ZP = -0.72;
  return (
    <group>
      {/* Tu cuarto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[12, 9, 1]} position={[0, 0, 2.5]} geometry={G.plano} receiveShadow>
        <Mat c="#8b6a4f" r={0.8} />
      </mesh>
      <Caja p={[-(W / 2 + 2), 1.7, ZP]} s={[4, 3.4, 0.1]} c="#c7d2fe" r={0.9} sombra={false} />
      <Caja p={[W / 2 + 2, 1.7, ZP]} s={[4, 3.4, 0.1]} c="#c7d2fe" r={0.9} sombra={false} />
      <Caja p={[0, (CY - H / 2) / 2, ZP]} s={[W, CY - H / 2, 0.1]} c="#c7d2fe" r={0.9} sombra={false} />
      <Caja p={[0, (CY + H / 2 + 3.4) / 2, ZP]} s={[W, 3.4 - (CY + H / 2), 0.1]} c="#c7d2fe" r={0.9} sombra={false} />
      {/* Marco de la pantalla */}
      <group position={[0, CY, ZP + 0.07]}>
        <Caja p={[0, H / 2 + 0.05, 0]} s={[W + 0.2, 0.1, 0.06]} c="#0b1220" r={0.3} sombra={false} />
        <Caja p={[0, -H / 2 - 0.12, 0]} s={[W + 0.2, 0.24, 0.06]} c="#0b1220" r={0.3} sombra={false} />
        <Caja p={[-W / 2 - 0.05, 0, 0]} s={[0.1, H + 0.34, 0.06]} c="#0b1220" r={0.3} sombra={false} />
        <Caja p={[W / 2 + 0.05, 0, 0]} s={[0.1, H + 0.34, 0.06]} c="#0b1220" r={0.3} sombra={false} />
        {/* Botones de la llamada */}
        <mesh geometry={G.cil} position={[0, -H / 2 - 0.12, 0.04]} rotation={[Math.PI / 2, 0, 0]} scale={[0.07, 0.02, 0.07]}>
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
        </mesh>
        {[-0.22, 0.22].map((x) => (
          <mesh key={x} geometry={G.cil} position={[x, -H / 2 - 0.12, 0.04]} rotation={[Math.PI / 2, 0, 0]} scale={[0.055, 0.02, 0.055]}>
            <meshStandardMaterial color="#334155" emissive="#94a3b8" emissiveIntensity={0.25} />
          </mesh>
        ))}
        {/* Tu recuadro (self-view) */}
        <group position={[W / 2 - 0.32, -H / 2 + 0.24, 0.02]}>
          <Caja p={[0, 0, 0]} s={[0.5, 0.36, 0.02]} c="#1e3a8a" sombra={false} />
          <mesh geometry={G.esfera} position={[0, 0.02, 0.02]} scale={[0.07, 0.08, 0.02]}>
            <Mat c="#c98b5e" />
          </mesh>
          <Caja p={[0, -0.13, 0.02]} s={[0.22, 0.1, 0.01]} c="#2563eb" sombra={false} />
        </group>
        <Html position={[-W / 2 + 0.34, H / 2 - 0.1, 0.03]} center zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 6, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />
            Emily · Ohio
          </div>
        </Html>
      </group>
      {/* Escritorio, silla y objetos */}
      <group position={[0, 0, -0.25]}>
        <Caja p={[0, 0.74, 0]} s={[2.6, 0.06, 0.8]} c="#e2e8f0" r={0.4} />
        {[-1.2, 1.2].map((x) => (
          <Caja key={x} p={[x, 0.37, 0]} s={[0.06, 0.74, 0.7]} c="#94a3b8" />
        ))}
        <Caja p={[-0.2, 0.785, 0.15]} s={[0.7, 0.025, 0.22]} c="#1f2937" r={0.4} />
        <Cil p={[0.5, 0.83, 0.1]} s={[0.05, 0.12, 0.05]} c="#f97316" />
      </group>
      <group position={[-0.35, 0, 0.72]}>
        <Caja p={[0, 0.46, 0]} s={[0.5, 0.06, 0.48]} c="#1f2937" r={0.5} />
        <Caja p={[0, 0.8, 0.24]} s={[0.5, 0.62, 0.06]} c="#1f2937" r={0.5} />
        <Cil p={[0, 0.23, 0]} s={[0.035, 0.46, 0.035]} c="#94a3b8" m={0.6} />
      </group>
      {/* El cuarto de Emily, detrás de la pantalla */}
      <group>
        <Caja p={[0, 1.4, -3.1]} s={[3.4, 2.8, 0.1]} c="#fde68a" r={0.9} sombra={false} />
        <Caja p={[-1.6, 1.4, -1.9]} s={[0.1, 2.8, 2.4]} c="#fcd9a8" r={0.9} sombra={false} />
        <Caja p={[1.6, 1.4, -1.9]} s={[0.1, 2.8, 2.4]} c="#fcd9a8" r={0.9} sombra={false} />
        <Caja p={[0, 2.8, -1.9]} s={[3.4, 0.1, 2.4]} c="#fff7ed" sombra={false} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -1.9]} scale={[3.3, 2.4, 1]} geometry={G.plano}>
          <Mat c="#a78bfa" r={0.9} />
        </mesh>
        {/* Banderín y estante */}
        <mesh geometry={G.cono} position={[-0.75, 2.0, -3.03]} rotation={[0, 0, Math.PI / 2]} scale={[0.14, 0.6, 0.02]}>
          <Mat c="#b91c1c" />
        </mesh>
        <Caja p={[0.85, 1.55, -2.95]} s={[0.9, 0.05, 0.25]} c="#92400e" sombra={false} />
        {[0, 1, 2, 3].map((k) => (
          <Caja key={k} p={[0.55 + k * 0.17, 1.7, -2.95]} s={[0.1, 0.26 - (k % 2) * 0.05, 0.18]} c={["#2563eb", "#16a34a", "#f59e0b", "#db2777"][k]!} sombra={false} />
        ))}
        <Cil p={[-0.95, 1.05, -2.7]} s={[0.06, 0.9, 0.06]} c="#334155" />
        <mesh geometry={G.cono} position={[-0.95, 1.55, -2.7]} scale={[0.2, 0.2, 0.2]}>
          <meshStandardMaterial color="#fef3c7" emissive="#fde68a" emissiveIntensity={0.9} />
        </mesh>
        <pointLight position={[0.2, 2.2, -1.2]} intensity={2.2} distance={4.5} color="#fff1d6" />
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Instrumentos
 * ════════════════════════════════════════════════════════════════════════ */

const ETAPAS: Etapa[] = ["open", "keep", "close"];

function PlacasEtapa({ centro, etapa, hechas }: { centro: Pt; etapa: Etapa | null; hechas: Etapa[] }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    ETAPAS.forEach((e, i) => {
      const m = refs.current[i];
      if (!m) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      const activa = e === etapa;
      mat.emissiveIntensity = activa ? 0.9 + Math.sin(t * 4) * 0.35 : hechas.includes(e) ? 0.45 : 0.06;
    });
  });
  return (
    <group position={centro}>
      {ETAPAS.map((e, i) => {
        const d = ETAPA_DEF[e];
        const hecha = hechas.includes(e);
        const x = (i - 1) * 0.78;
        return (
          <group key={e} position={[x, 0, 0]}>
            <mesh
              ref={(m) => {
                refs.current[i] = m;
              }}
              geometry={G.disco}
              scale={[0.3, 1, 0.3]}
              position={[0, 0.02, 0]}
              receiveShadow
            >
              <meshStandardMaterial color={hecha ? OK : d.col} emissive={hecha ? OK : d.col} emissiveIntensity={0.1} roughness={0.4} />
            </mesh>
            {i < 2 && (
              <mesh geometry={G.caja} position={[0.39, 0.02, 0]} scale={[0.18, 0.012, 0.03]}>
                <Mat c="#e2e8f0" />
              </mesh>
            )}
            <Etiqueta pos={[0, 0.16, 0.32]} col={e === etapa ? d.col : hecha ? OK : undefined} fs={10}>
              {hecha && <i className="fa-solid fa-check" style={{ color: OK }} />}
              {d.en.toUpperCase()}
            </Etiqueta>
          </group>
        );
      })}
    </group>
  );
}

const ROJO = new THREE.Color("#fb7185");
const AMBAR = new THREE.Color("#fbbf24");
const VERDE = new THREE.Color("#34d399");

function colorValor(v: number, out: THREE.Color) {
  if (v < 50) out.copy(ROJO).lerp(AMBAR, v / 50);
  else out.copy(AMBAR).lerp(VERDE, (v - 50) / 50);
  return out;
}

function Medidores({ pos, escala = 1, cortesia, fluidez }: { pos: Pt; escala?: number; cortesia: number | null; fluidez: number | null }) {
  const llenos = useRef<(THREE.Mesh | null)[]>([]);
  const tmp = useMemo(() => new THREE.Color(), []);
  const ALTO = 1.1;
  useFrame((_, dt) => {
    [cortesia, fluidez].forEach((v, i) => {
      const m = llenos.current[i];
      if (!m) return;
      const obj = Math.max(0.02, (v ?? 50) / 100);
      const k = suave(dt, 0.08);
      m.scale.y += (obj * ALTO - m.scale.y) * k;
      m.position.y = 0.12 + m.scale.y / 2;
      const mat = m.material as THREE.MeshStandardMaterial;
      colorValor(m.scale.y / ALTO * 100, tmp);
      mat.color.copy(tmp);
      mat.emissive.copy(tmp);
    });
  });
  return (
    <group position={pos} scale={escala}>
      <Caja p={[0, 0.05, 0]} s={[0.85, 0.1, 0.45]} c="#1e293b" r={0.4} m={0.3} />
      {[
        ["Cortesía", cortesia, "fa-hand-holding-heart"],
        ["Fluidez", fluidez, "fa-water"],
      ].map(([nombre, v, icono], i) => {
        const x = (i - 0.5) * 0.38;
        return (
          <group key={nombre as string} position={[x, 0, 0]}>
            <mesh
              ref={(m) => {
                llenos.current[i] = m;
              }}
              geometry={G.cil}
              position={[0, 0.4, 0]}
              scale={[0.075, 0.5, 0.075]}
            >
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.55} roughness={0.3} />
            </mesh>
            <mesh geometry={G.tubo} position={[0, 0.12 + ALTO / 2, 0]} scale={[1, ALTO, 1]}>
              <meshStandardMaterial color="#e0f2fe" transparent opacity={0.18} roughness={0.05} metalness={0.1} side={THREE.DoubleSide} />
            </mesh>
            <Cil p={[0, 0.13 + ALTO, 0]} s={[0.11, 0.03, 0.11]} c="#94a3b8" m={0.7} r={0.3} />
            <Etiqueta pos={[0, 1.4 + i * 0.26, 0]} fs={10}>
              <i className={`fa-solid ${icono as string}`} style={{ color: "#7dd3fc" }} />
              {nombre as string} {v === null ? "—" : `${v as number}%`}
            </Etiqueta>
          </group>
        );
      })}
    </group>
  );
}

const BANDAS = ["informal", "neutral", "formal"] as const;

function Indicador({ pos, aguja, objetivo, poste = true }: { pos: Pt; aguja: number | null; objetivo: "informal" | "formal"; poste?: boolean }) {
  const ESC = 0.78;
  const agujaRef = useRef<THREE.Group>(null);
  const segs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }, dt) => {
    const g = agujaRef.current;
    const t = clock.elapsedTime;
    if (g) {
      const obj = aguja === null ? Math.PI * 0.98 + Math.sin(t * 1.2) * 0.02 : Math.PI * (1 - aguja / 2);
      g.rotation.z += (obj - g.rotation.z) * suave(dt, 0.09);
    }
    BANDAS.forEach((b, i) => {
      const m = segs.current[i];
      if (!m) return;
      const meta = objetivo === "informal" ? b !== "formal" : b === "formal";
      (m.material as THREE.MeshStandardMaterial).emissiveIntensity = meta ? 0.55 + Math.sin(t * 3) * 0.25 : 0.05;
    });
  });
  return (
    <group position={pos} scale={ESC}>
      {poste && <Cil p={[0, -0.9, -0.05]} s={[0.04, 1.8, 0.04]} c="#475569" m={0.6} r={0.3} />}
      {poste && <Caja p={[0, -1.78, -0.05]} s={[0.6, 0.06, 0.4]} c="#1e293b" />}
      <mesh geometry={G.caja} position={[0, 0.26, -0.08]} scale={[1.62, 0.95, 0.05]}>
        <meshStandardMaterial color="#0b1220" roughness={0.4} metalness={0.2} />
      </mesh>
      {BANDAS.map((b, i) => (
        <mesh
          key={b}
          ref={(m) => {
            segs.current[i] = m;
          }}
          geometry={G.anillo}
          rotation={[0, 0, Math.PI - (i + 1) * (Math.PI / 3) + 0.012]}
          scale={[1, 1, 0.5]}
        >
          <meshStandardMaterial color={BANDA_DEF[b].col} emissive={BANDA_DEF[b].col} emissiveIntensity={0.1} roughness={0.35} />
        </mesh>
      ))}
      <group ref={agujaRef} position={[0, 0, 0.06]} rotation={[0, 0, Math.PI]}>
        <mesh geometry={G.caja} position={[0.25, 0, 0]} scale={[0.5, 0.03, 0.02]}>
          <meshStandardMaterial color="#f8fafc" emissive="#ffffff" emissiveIntensity={0.4} />
        </mesh>
      </group>
      <mesh geometry={G.esfera} position={[0, 0, 0.07]} scale={0.05}>
        <Mat c="#f8fafc" m={0.6} r={0.3} />
      </mesh>
      {BANDAS.map((b, i) => {
        const ang = Math.PI - (i + 0.5) * (Math.PI / 3);
        return (
          <Etiqueta key={b} pos={[Math.cos(ang) * 0.72, Math.sin(ang) * 0.72 + 0.04, 0.02]} col={BANDA_DEF[b].col} fs={10}>
            {b}
          </Etiqueta>
        );
      })}
      <Etiqueta pos={[0, -0.24, 0.05]} fs={10} col="#fbbf24">
        <i className="fa-solid fa-bullseye" style={{ color: "#fbbf24" }} />
        espera: {objetivo === "informal" ? "informal o neutral" : "formal"}
      </Etiqueta>
    </group>
  );
}

function TorreTurnos({ pos, escala = 1, lineas, nombreNpc, onTocar }: { pos: Pt; escala?: number; lineas: LineaTorre[]; nombreNpc: string; onTocar: (i: number) => void }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    lineas.forEach((l, i) => {
      const m = refs.current[i];
      if (!m) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      const brillo = l.activa ? 0.9 + Math.sin(t * 5) * 0.2 : l.estado === "normal" ? 0.12 : 0.6;
      mat.emissiveIntensity += (brillo - mat.emissiveIntensity) * suave(dt, 0.2);
      const dx = l.estado === "elegida" || l.estado === "mal" ? 0.08 : 0;
      m.position.x += ((l.quien === "tu" ? -0.12 : 0.12) + dx - m.position.x) * suave(dt, 0.15);
    });
  });
  const paso = 0.28;
  return (
    <group position={pos} scale={escala}>
      <Caja p={[0, -0.02, 0]} s={[0.9, 0.04, 0.5]} c="#1e293b" />
      {lineas.map((l, i) => {
        const y = 0.2 + (lineas.length - 1 - i) * paso;
        const col = l.estado === "mal" ? WARN : l.estado === "arreglada" ? OK : l.estado === "elegida" ? "#a78bfa" : l.quien === "tu" ? "#3b82f6" : "#64748b";
        return (
          <group key={i}>
            <mesh
              ref={(m) => {
                refs.current[i] = m;
              }}
              geometry={G.caja}
              position={[l.quien === "tu" ? -0.12 : 0.12, y, 0]}
              scale={[0.62, 0.2, 0.26]}
              castShadow
              onClick={(e) => {
                e.stopPropagation();
                onTocar(i);
              }}
              onPointerOver={() => {
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "";
              }}
            >
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.12} roughness={0.35} />
            </mesh>
            <Etiqueta pos={[l.quien === "tu" ? -0.12 : 0.12, y, 0.16]} fs={9.5} col={l.estado !== "normal" ? col : undefined}>
              {l.estado === "mal" && <i className="fa-solid fa-triangle-exclamation" style={{ color: WARN }} />}
              {l.estado === "arreglada" && <i className="fa-solid fa-check" style={{ color: OK }} />}
              {i + 1} · {l.quien === "tu" ? "Alex" : nombreNpc}
            </Etiqueta>
          </group>
        );
      })}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Distribución por escenario
 * ════════════════════════════════════════════════════════════════════════ */

interface Distribucion {
  tu: { pos: Pt; rotY: number; sentado?: boolean };
  npc: { pos: Pt; rotY: number };
  cam: Pt;
  target: Pt;
  instrumento: Pt;
  placas: Pt;
}

function distribucion(escenario: Escenario, npc: PersonajeId): Distribucion {
  if (escenario === "videollamada") {
    return { tu: { pos: [-0.35, 0, 0.72], rotY: Math.PI, sentado: true }, npc: { pos: [0.05, 0, -1.95], rotY: 0 }, cam: [1.05, 2.05, 3.9], target: [0.1, 1.3, -0.6], instrumento: [-1.0, 0.77, -0.3], placas: [0.75, 0, 1.25] };
  }
  const detras = escenario === "clinica" || npc === "lupita";
  if (detras) {
    return { tu: { pos: [-0.75, 0, 0.62], rotY: 0.65 }, npc: { pos: [0.8, 0, -0.72], rotY: -0.55 }, cam: [0.15, 2.25, 4.9], target: [0.1, 1.05, 0], instrumento: [1.95, 0, 0.3], placas: [-0.15, 0, 0.9] };
  }
  return { tu: { pos: [-0.95, 0, 0.35], rotY: 0.8 }, npc: { pos: [0.72, 0, -0.1], rotY: -0.75 }, cam: [0.15, 2.25, 4.9], target: [0.0, 1.05, 0], instrumento: [1.95, 0, 0.3], placas: [-0.15, 0, 0.85] };
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function CortesiaConversacionInglesScene(p: CortesiaSceneProps) {
  const { vista, modoColor, resetNonce, escenario, npc } = p;
  const d = useMemo(() => distribucion(escenario, npc), [escenario, npc]);
  const npcDef = PERSONAJES[npc];
  const tuDef = PERSONAJES.tu;
  const sentado = !!d.tu.sentado;
  const cabezaTu: Pt = [d.tu.pos[0], sentado ? 1.45 : 1.85, d.tu.pos[2]];
  const cabezaNpc: Pt = [d.npc.pos[0], 1.85 * (npcDef.aspecto.escala ?? 1), d.npc.pos[2]];
  const orbeTu: Pt = [d.tu.pos[0] + 0.3, sentado ? 1.2 : 1.45, d.tu.pos[2] + 0.2];
  const orbeNpc: Pt = [d.npc.pos[0] - 0.3, 1.45, d.npc.pos[2] + 0.2];
  const video = escenario === "videollamada";
  const instY = vista === "registro" ? (video ? 1.55 : 1.45) : vista === "arreglar" ? 0.05 : d.instrumento[1];
  const instArr: Pt = video ? [1.0, 0.79, -0.4] : [d.instrumento[0], instY, d.instrumento[2]];

  return (
    <Canvas key={`${vista}-${escenario}-${npc}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: d.cam, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#0b1220"]} />
      <fog attach="fog" args={["#0b1220", 12, 26]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fff7ed", "#334155", 0.35]} />
      <directionalLight
        position={[3.5, 6.5, 5]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />
      <pointLight position={[-3, 2.6, 2.5]} intensity={0.18} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.2} position={[0, 5, -4]} scale={[10, 4, 1]} color="#fde68a" />
        <Lightformer form="rect" intensity={0.6} position={[-6, 2, 5]} scale={[6, 5, 1]} color={modoColor} />
      </Environment>

      {escenario === "cafeteria" && <Cafeteria mostrador={npc === "lupita"} />}
      {escenario === "fiesta" && <Fiesta />}
      {escenario === "clinica" && <Clinica />}
      {escenario === "salon" && <Salon />}
      {video && <Videollamada />}

      <group position={d.tu.pos} rotation={[0, d.tu.rotY, 0]}>
        <Figura a={tuDef.aspecto} emo="neutral" habla={p.habla === "tu"} sentado={sentado} fase={1.3} />
      </group>
      <group position={d.npc.pos} rotation={[0, d.npc.rotY, 0]}>
        <Figura a={npcDef.aspecto} emo={p.npcEmo} habla={p.habla === "npc"} />
      </group>

      <OrbeTurno a={orbeTu} b={orbeNpc} habla={p.habla} color={p.orbeColor} />

      {p.tuDice && <Burbuja pos={[cabezaTu[0], cabezaTu[1] + 0.08, cabezaTu[2]]} quien="Alex (tú)" texto={p.tuDice} col="#3b82f6" lado="izq" accion={p.tuAccion} />}
      {p.npcDice && <Burbuja pos={[cabezaNpc[0], cabezaNpc[1] + (video ? 0.02 : 0.3), cabezaNpc[2]]} quien={npcDef.nombre} texto={p.npcDice} col={npc === "recepcionista" ? "#0f766e" : npcDef.aspecto.camisa} lado="der" />}
      {!p.npcDice && <Etiqueta pos={[cabezaNpc[0], cabezaNpc[1] + 0.12, cabezaNpc[2]]}>{npcDef.nombre}</Etiqueta>}
      <EmoBadge pos={[cabezaNpc[0] + 0.42, cabezaNpc[1] - 0.3, cabezaNpc[2]]} emo={p.npcEmo} />

      {vista === "conversar" && (
        <>
          <PlacasEtapa centro={d.placas} etapa={p.etapa} hechas={p.etapasHechas} />
          <Medidores pos={d.instrumento} escala={video ? 0.55 : 1} cortesia={p.cortesia} fluidez={p.fluidez} />
        </>
      )}
      {vista === "registro" && <Indicador pos={[d.instrumento[0], instY, d.instrumento[2]]} aguja={p.aguja} objetivo={p.objetivo} poste={!video} />}
      {vista === "arreglar" && <TorreTurnos pos={instArr} escala={video ? 0.62 : 1} lineas={p.lineas} nombreNpc={npcDef.nombre} onTocar={p.onTocarLinea} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={2.6} maxDistance={8.5} minPolarAngle={Math.PI * 0.28} maxPolarAngle={Math.PI * 0.49} minAzimuthAngle={-0.75} maxAzimuthAngle={0.75} target={d.target} />
      <EffectComposer>
        <Bloom intensity={0.35} luminanceThreshold={0.8} luminanceSmoothing={0.7} mipmapBlur />
        <Vignette eskil={false} offset={0.22} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
