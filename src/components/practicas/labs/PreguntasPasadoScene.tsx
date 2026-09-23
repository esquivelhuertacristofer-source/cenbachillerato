"use client";

/**
 * Escena 3D del laboratorio "Preguntas al pasado" (CH-I-P01 + CH-I-P04).
 * Tres vistas:
 *
 *  - excavar: un corte arqueológico bajo una calle mexicana. Cada estrato es
 *    una época (hoy → siglo XX → siglo XIX → virreinato → Mesoamérica); al
 *    excavar, el corte se escalona y en cada terraza aparece la evidencia.
 *  - espiral: la espiral del tiempo de 1300 a hoy, con los tres grandes
 *    periodos; las evidencias ubicadas brillan en su año y los vínculos se
 *    dibujan como arcos o tramos resaltados.
 *  - voces: una fogata con seis voces alrededor; las que se integran a la
 *    explicación tienden un hilo que se trenza al centro.
 *
 * Toda animación ocurre en useFrame mutando refs. NO se usa <Text> de drei
 * (cuelga el chunk con Turbopack): el texto va en <Html>.
 */

import * as THREE from "three";
import { useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import {
  type Modo,
  type ProblemaId,
  type Artefacto,
  type CasoVocesId,
  ESTRATOS,
  PROBLEMAS,
  EVIDENCIAS,
  VINCULOS,
  PROCESO_COLOR,
  RELACION_DEF,
  ANIO_INICIO,
  ANIO_FIN,
  CASOS_VOCES,
  romano,
} from "./preguntas-pasado-data";

export interface PreguntasPasadoSceneProps {
  vista: Modo;
  modoColor: string;
  resetNonce: number;
  // Excavar
  problemaId: ProblemaId;
  profundidad: number;
  estratoSel: number | null;
  // Espiral
  ubicadas: string[];
  evidenciaActual: string | null;
  vinculoId: string | null;
  vinculoResuelto: boolean;
  // Voces
  casoId: CasoVocesId;
  vozSel: string | null;
  identificadas: string[];
  incluidas: string[];
}

type Pt = [number, number, number];

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);

function Etiqueta({ pos, children, df = 10, col, fs = 12, bg = "rgba(4,10,22,0.86)" }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number; bg?: string }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 999,
          background: bg,
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

function Persona({ pos, color, escala = 1, piel = "#c8966b" }: { pos: Pt; color: string; escala?: number; piel?: string }) {
  return (
    <group position={pos} scale={escala}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.17, 0.42, 6, 14]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.98, 0]} castShadow>
        <sphereGeometry args={[0.15, 18, 14]} />
        <meshStandardMaterial color={piel} roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. EXCAVAR
 * ════════════════════════════════════════════════════════════════════════ */

const W = 7;
const D = 5;
const H = 0.72;
const LEDGE = 0.72;
const ESCALA_ART = 1.35;
const X_ART = [-1.7, 1.3, -0.5, 1.9, -1.9];

function recesos(profundidad: number): number[] {
  const k = profundidad - 1;
  return ESTRATOS.map((_, i) => (i <= k ? LEDGE * (k - i + 1) : 0));
}

function Mat({ c, r = 0.6, m = 0, e }: { c: string; r?: number; m?: number; e?: number }) {
  return <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ? c : "#000"} emissiveIntensity={e ?? 0} />;
}

/** Evidencias de cada estrato: piezas de ~0.6 × 0.5 × 0.45. */
function PiezaArtefacto({ tipo }: { tipo: Artefacto }) {
  switch (tipo) {
    case "bomba":
      return (
        <group>
          <mesh position={[0, 0.06, 0]} castShadow>
            <boxGeometry args={[0.6, 0.12, 0.4]} />
            <Mat c="#475569" m={0.4} />
          </mesh>
          <mesh position={[-0.12, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.32, 18]} />
            <Mat c="#2563eb" m={0.5} r={0.35} />
          </mesh>
          <mesh position={[0.16, 0.22, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.34, 12]} />
            <Mat c="#94a3b8" m={0.7} r={0.3} />
          </mesh>
          <mesh position={[0.3, 0.36, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.3, 12]} />
            <Mat c="#94a3b8" m={0.7} r={0.3} />
          </mesh>
        </group>
      );
    case "tubo":
      return (
        <group>
          <mesh position={[0, 0.24, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.7, 28, 1, true]} />
            <meshStandardMaterial color="#9ca3af" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.36, 0.24, 0]} rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.17, 0.25, 28]} />
            <meshStandardMaterial color="#d1d5db" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.35, 0.24, 0]} rotation={[0, Math.PI / 2, 0]}>
            <circleGeometry args={[0.17, 24]} />
            <meshBasicMaterial color="#111827" />
          </mesh>
        </group>
      );
    case "canal":
      return (
        <group>
          {[-0.2, 0.2].map((z) => (
            <mesh key={z} position={[0, 0.12, z]} castShadow>
              <boxGeometry args={[0.72, 0.24, 0.07]} />
              <Mat c="#a8a29e" r={0.9} />
            </mesh>
          ))}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.72, 0.04, 0.34]} />
            <Mat c="#78716c" r={0.9} />
          </mesh>
          <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.7, 0.33]} />
            <meshStandardMaterial color="#0e7490" roughness={0.15} metalness={0.2} emissive="#0e7490" emissiveIntensity={0.25} />
          </mesh>
        </group>
      );
    case "arco":
      return (
        <group>
          {[-0.22, 0.22].map((x) => (
            <mesh key={x} position={[x, 0.16, 0]} castShadow>
              <boxGeometry args={[0.14, 0.32, 0.3]} />
              <Mat c="#a16207" r={0.95} />
            </mesh>
          ))}
          <mesh position={[0, 0.32, 0]} castShadow>
            <torusGeometry args={[0.22, 0.07, 10, 20, Math.PI]} />
            <Mat c="#b45309" r={0.95} />
          </mesh>
          <mesh position={[0, 0.2, -0.1]}>
            <planeGeometry args={[0.3, 0.4]} />
            <meshBasicMaterial color="#0b0b0b" />
          </mesh>
        </group>
      );
    case "chinampa":
      return (
        <group>
          <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.8, 0.44]} />
            <meshStandardMaterial color="#0e7490" roughness={0.15} emissive="#0e7490" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[-0.08, 0.06, 0]} castShadow>
            <boxGeometry args={[0.42, 0.08, 0.26]} />
            <Mat c="#3f6212" r={0.9} />
          </mesh>
          {[-0.24, 0.1].map((x) => (
            <group key={x} position={[x, 0.1, -0.08]}>
              <mesh position={[0, 0.14, 0]}>
                <cylinderGeometry args={[0.012, 0.018, 0.28, 6]} />
                <Mat c="#78350f" />
              </mesh>
              <mesh position={[0, 0.34, 0]}>
                <coneGeometry args={[0.06, 0.24, 8]} />
                <Mat c="#65a30d" r={0.8} />
              </mesh>
            </group>
          ))}
          <mesh position={[0.28, 0.04, 0.12]} rotation={[0, 0.3, Math.PI / 2]} scale={[0.5, 1, 0.5]}>
            <capsuleGeometry args={[0.04, 0.2, 4, 8]} />
            <Mat c="#92400e" />
          </mesh>
        </group>
      );
    case "grafica":
      return (
        <group>
          {[0.2, 0.34, 0.46].map((h, k) => (
            <mesh key={k} position={[-0.18 + k * 0.18, h / 2, 0]} castShadow>
              <boxGeometry args={[0.12, h, 0.12]} />
              <Mat c={["#fbbf24", "#f59e0b", "#d97706"][k]!} e={0.2} />
            </mesh>
          ))}
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[0.62, 0.02, 0.24]} />
            <Mat c="#e5e7eb" />
          </mesh>
        </group>
      );
    case "pupitre":
      return (
        <group>
          <mesh position={[0, 0.26, 0.05]} castShadow>
            <boxGeometry args={[0.36, 0.03, 0.24]} />
            <Mat c="#a16207" />
          </mesh>
          {[
            [-0.15, -0.05],
            [0.15, -0.05],
            [-0.15, 0.15],
            [0.15, 0.15],
          ].map(([x, z], k) => (
            <mesh key={k} position={[x!, 0.12, z!]}>
              <boxGeometry args={[0.025, 0.25, 0.025]} />
              <Mat c="#1f2937" m={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 0.34, -0.16]}>
            <boxGeometry args={[0.56, 0.3, 0.03]} />
            <Mat c="#14532d" r={0.9} />
          </mesh>
          <mesh position={[-0.1, 0.36, -0.14]}>
            <boxGeometry args={[0.22, 0.015, 0.005]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        </group>
      );
    case "pergamino":
      return (
        <group rotation={[0, 0.2, 0]}>
          <mesh position={[0, 0.03, 0]} castShadow>
            <boxGeometry args={[0.5, 0.012, 0.32]} />
            <Mat c="#f5e6c8" r={0.9} />
          </mesh>
          {[-0.26, 0.26].map((x) => (
            <mesh key={x} position={[x, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.36, 12]} />
              <Mat c="#e7d3a8" r={0.9} />
            </mesh>
          ))}
          {[0.08, 0.02, -0.04, -0.1].map((z) => (
            <mesh key={z} position={[-0.02, 0.04, z]}>
              <boxGeometry args={[0.34, 0.004, 0.012]} />
              <meshBasicMaterial color="#57534e" />
            </mesh>
          ))}
          <mesh position={[0.14, 0.05, -0.1]}>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
            <Mat c="#b91c1c" e={0.2} />
          </mesh>
        </group>
      );
    case "libro":
      return (
        <group>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.15, 0.07, 0]} rotation={[0, 0, s * -0.22]} castShadow>
              <boxGeometry args={[0.3, 0.03, 0.38]} />
              <Mat c="#f8f1e0" r={0.9} />
            </mesh>
          ))}
          {[-1, 1].map((s) => (
            <mesh key={`t${s}`} position={[s * 0.15, 0.045, 0]} rotation={[0, 0, s * -0.22]}>
              <boxGeometry args={[0.32, 0.02, 0.4]} />
              <Mat c="#7f1d1d" r={0.7} />
            </mesh>
          ))}
        </group>
      );
    case "codice":
      return (
        <group position={[0, 0, 0]}>
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} position={[-0.27 + k * 0.18, 0.2, (k % 2) * 0.08]} rotation={[0, (k % 2 === 0 ? 1 : -1) * 0.45, 0]} castShadow>
              <boxGeometry args={[0.2, 0.36, 0.015]} />
              <Mat c={["#fde68a", "#fcd34d", "#fde68a", "#fcd34d"][k]!} r={0.9} />
            </mesh>
          ))}
          {[0, 1, 2, 3].map((k) => (
            <mesh key={`g${k}`} position={[-0.27 + k * 0.18, 0.22, (k % 2) * 0.08 + 0.012]} rotation={[0, (k % 2 === 0 ? 1 : -1) * 0.45, 0]}>
              <circleGeometry args={[0.05, 14]} />
              <meshBasicMaterial color={["#b91c1c", "#1d4ed8", "#15803d", "#b91c1c"][k]!} />
            </mesh>
          ))}
        </group>
      );
    case "sobre":
      return (
        <group>
          <mesh position={[0, 0.03, 0]} rotation={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.42, 0.04, 0.28]} />
            <Mat c="#f1f5f9" r={0.8} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[0.24 + k * 0.02, 0.03 + k * 0.03, 0.12]}>
              <cylinderGeometry args={[0.06, 0.06, 0.025, 20]} />
              <Mat c="#eab308" m={0.8} r={0.25} />
            </mesh>
          ))}
        </group>
      );
    case "maleta":
      return (
        <group>
          <mesh position={[0, 0.17, 0]} castShadow>
            <boxGeometry args={[0.46, 0.32, 0.18]} />
            <Mat c="#78350f" r={0.7} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
            <Mat c="#1c1917" />
          </mesh>
          <group position={[0.3, 0.02, 0.1]}>
            <mesh>
              <cylinderGeometry args={[0.16, 0.16, 0.015, 24]} />
              <Mat c="#d6b370" r={0.9} />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.07, 0.08, 0.12, 20]} />
              <Mat c="#d6b370" r={0.9} />
            </mesh>
          </group>
        </group>
      );
    case "tren":
      return (
        <group>
          {[-0.12, 0.12].map((z) => (
            <mesh key={z} position={[0, 0.01, z]}>
              <boxGeometry args={[0.8, 0.02, 0.025]} />
              <Mat c="#9ca3af" m={0.8} r={0.3} />
            </mesh>
          ))}
          <mesh position={[0.08, 0.17, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.36, 18]} />
            <Mat c="#111827" m={0.6} r={0.35} />
          </mesh>
          <mesh position={[-0.18, 0.2, 0]} castShadow>
            <boxGeometry args={[0.18, 0.26, 0.24]} />
            <Mat c="#991b1b" r={0.5} />
          </mesh>
          <mesh position={[0.2, 0.33, 0]}>
            <cylinderGeometry args={[0.035, 0.05, 0.14, 12]} />
            <Mat c="#111827" />
          </mesh>
          {[-0.18, 0.02, 0.2].map((x) => (
            <mesh key={x} position={[x, 0.06, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.055, 0.055, 0.03, 14]} />
              <Mat c="#374151" m={0.6} />
            </mesh>
          ))}
        </group>
      );
    case "carreta":
      return (
        <group>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.46, 0.14, 0.28]} />
            <Mat c="#92400e" r={0.9} />
          </mesh>
          {[-0.17, 0.17].map((z) => (
            <mesh key={z} position={[0, 0.13, z]}>
              <torusGeometry args={[0.12, 0.02, 8, 18]} />
              <Mat c="#451a03" />
            </mesh>
          ))}
          <mesh position={[0.36, 0.16, 0]} rotation={[0, 0, 0.25]}>
            <boxGeometry args={[0.3, 0.025, 0.025]} />
            <Mat c="#78350f" />
          </mesh>
        </group>
      );
    case "huellas":
      return (
        <group>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.78, 0.36]} />
            <meshStandardMaterial color="#f3e8c9" roughness={0.95} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <mesh key={k} position={[-0.3 + k * 0.12, 0.02, k % 2 === 0 ? -0.05 : 0.05]} rotation={[-Math.PI / 2, 0, -0.1]} scale={[1, 0.55, 1]}>
              <circleGeometry args={[0.04, 14]} />
              <meshBasicMaterial color="#1c1917" />
            </mesh>
          ))}
        </group>
      );
  }
}

const COLOR_CASAS = ["#c2410c", "#eab308", "#2563eb", "#db2777", "#16a34a", "#f97316"];
const ALTO_CASAS = [1.1, 0.8, 1.35, 0.95, 1.2, 0.85];

function Superficie({ problemaId }: { problemaId: ProblemaId }) {
  return (
    <group>
      {COLOR_CASAS.map((c, k) => {
        const x = -W / 2 + 0.6 + k * 1.16;
        const h = ALTO_CASAS[k]!;
        return (
          <group key={k} position={[x, 0, -2.05]}>
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.05, h, 0.8]} />
              <meshStandardMaterial color={c} roughness={0.8} />
            </mesh>
            {[-0.25, 0.25].map((wx) => (
              <mesh key={wx} position={[wx, h * 0.62, 0.405]}>
                <planeGeometry args={[0.22, 0.24]} />
                <meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.35} />
              </mesh>
            ))}
            {problemaId === "agua" && (
              <mesh position={[0.25, h + 0.14, 0]} castShadow>
                <cylinderGeometry args={[0.13, 0.13, 0.28, 16]} />
                <meshStandardMaterial color="#111827" roughness={0.6} />
              </mesh>
            )}
          </group>
        );
      })}
      {problemaId === "agua" && (
        <group position={[1.3, 0, -1.45]}>
          <mesh position={[-0.45, 0.28, 0]} castShadow>
            <boxGeometry args={[0.36, 0.4, 0.38]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
          <mesh position={[0.18, 0.32, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.9, 20]} />
            <meshStandardMaterial color="#1d4ed8" metalness={0.5} roughness={0.35} />
          </mesh>
          {[-0.45, 0, 0.45].map((x) => (
            <mesh key={x} position={[x, 0.08, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.06, 14]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
          ))}
          <Etiqueta pos={[0, 0.85, 0]} df={10} fs={10.5} col="#38bdf8aa">
            <i className="fa-solid fa-truck-droplet" style={{ color: "#38bdf8" }} />
            Pipa de agua
          </Etiqueta>
        </group>
      )}
      {problemaId === "lengua" && (
        <group position={[1.2, 0, -1.5]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.5, 0.8, 0.08]} />
            <meshStandardMaterial color="#f5f5f4" roughness={0.9} />
          </mesh>
          {["#dc2626", "#16a34a", "#eab308", "#2563eb"].map((c, k) => (
            <mesh key={c} position={[-0.54 + k * 0.36, 0.45, 0.045]}>
              <planeGeometry args={[0.3, 0.62]} />
              <meshStandardMaterial color={c} roughness={0.8} />
            </mesh>
          ))}
          <mesh position={[0.15, 1.0, 0.05]} rotation={[0, 0, 0.4]}>
            <torusGeometry args={[0.16, 0.035, 8, 20, Math.PI * 1.4]} />
            <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.4} />
          </mesh>
          <Etiqueta pos={[0, 1.45, 0]} df={10} fs={10.5} col="#fbbf24aa">
            <i className="fa-solid fa-comment" style={{ color: "#fbbf24" }} />
            Mural en náhuatl y español
          </Etiqueta>
        </group>
      )}
      {problemaId === "migracion" && (
        <group position={[1.2, 0, -1.45]}>
          <mesh position={[0, 0.32, 0]} castShadow>
            <boxGeometry args={[1.5, 0.48, 0.42]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.4, 0.215]}>
            <planeGeometry args={[1.3, 0.16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.2, 0.215]}>
            <planeGeometry args={[1.46, 0.05]} />
            <meshStandardMaterial color="#db2777" />
          </mesh>
          {[-0.5, 0.5].map((x) => (
            <mesh key={x} position={[x, 0.08, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.06, 14]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
          ))}
          <Etiqueta pos={[0, 0.85, 0]} df={10} fs={10.5} col="#f472b6aa">
            <i className="fa-solid fa-bus" style={{ color: "#f472b6" }} />
            Autobús a la frontera
          </Etiqueta>
        </group>
      )}
    </group>
  );
}

function EscenaExcavar({ problemaId, profundidad, estratoSel, modoColor }: { problemaId: ProblemaId; profundidad: number; estratoSel: number | null; modoColor: string }) {
  const problema = PROBLEMAS.find((p) => p.id === problemaId) ?? PROBLEMAS[0]!;
  const capas = useRef<(THREE.Mesh | null)[]>([]);
  const piezas = useRef<(THREE.Group | null)[]>([]);
  const calle = useRef<THREE.Mesh>(null);
  const arqueologa = useRef<THREE.Group>(null);
  const actual = useRef<number[]>(recesos(profundidad));
  const aparece = useRef<number[]>(ESTRATOS.map((_, i) => (i < profundidad ? 1 : 0)));

  useFrame(({ clock }, dt) => {
    const destino = recesos(profundidad);
    const k = profundidad - 1;
    const r = actual.current.map((v, i) => v + (destino[i]! - v) * suave(dt, 0.08));
    actual.current = r;
    const ap = aparece.current.map((v, i) => v + ((i < profundidad ? 1 : 0) - v) * suave(dt, 0.07));
    aparece.current = ap;
    capas.current.forEach((m, i) => {
      if (!m) return;
      m.scale.z = D - r[i]!;
      m.position.z = -r[i]! / 2;
    });
    if (calle.current) {
      calle.current.scale.z = D - r[0]!;
      calle.current.position.z = -r[0]! / 2;
    }
    piezas.current.forEach((g, i) => {
      if (!g) return;
      const sig = i + 1 < r.length ? r[i + 1]! : 0;
      const s = Math.max(0.001, ap[i]!);
      g.scale.setScalar(s * ESCALA_ART);
      g.position.set(X_ART[i]!, -(i + 1) * H + (1 - s) * -0.2, D / 2 - (r[i]! + sig) / 2);
      g.visible = ap[i]! > 0.02;
      g.rotation.y = Math.sin(clock.elapsedTime * 0.6 + i) * 0.12;
    });
    if (arqueologa.current) {
      const y = k < 0 ? 0 : -(k + 1) * H;
      const z = k < 0 ? D / 2 - 0.3 : D / 2 - r[k]! / 2 + LEDGE / 2 - 0.1;
      const p = arqueologa.current.position;
      p.x = W / 2 - 0.55;
      p.y += (y - p.y) * suave(dt, 0.06);
      p.z += (z - p.z) * suave(dt, 0.06);
    }
  });

  return (
    <group position={[0.9, 1.3, 0]}>
      {/* Estratos */}
      {ESTRATOS.map((e, i) => {
        const excavado = i < profundidad;
        const sel = estratoSel === i;
        return (
          <group key={e.id} position={[0, -(i + 0.5) * H, 0]}>
            <mesh
              ref={(m) => {
                capas.current[i] = m;
              }}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[W, H, 1]} />
              <meshStandardMaterial
                color={excavado ? e.color : new THREE.Color(e.color).multiplyScalar(0.55).getStyle()}
                roughness={0.95}
                emissive={sel ? modoColor : "#000"}
                emissiveIntensity={sel ? 0.18 : 0}
              />
            </mesh>
            {/* Vetas de la capa */}
            {[0.18, -0.2].map((dy, k) => (
              <mesh key={k} position={[0, dy, D / 2 + 0.002]} visible={i >= profundidad}>
                <planeGeometry args={[W, 0.02]} />
                <meshBasicMaterial color="#000" transparent opacity={0.18} />
              </mesh>
            ))}
            <Html position={[-W / 2 - 0.12, 0, D / 2 - recesos(profundidad)[i]!]} distanceFactor={9.5} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
              <div
                style={{
                  transform: "translate(-100%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  padding: "4px 10px",
                  borderRadius: 10,
                  background: "rgba(4,10,22,0.86)",
                  border: `1px solid ${sel ? modoColor : excavado ? e.color : "rgba(255,255,255,0.18)"}`,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  opacity: excavado ? 1 : 0.6,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 900 }}>{e.etq}</span>
                <span style={{ fontSize: 9.5, fontWeight: 600, color: "#cbd5e1" }}>{e.rango}</span>
              </div>
            </Html>
          </group>
        );
      })}
      {/* Roca madre */}
      <mesh position={[0, -ESTRATOS.length * H - 0.15, 0]} receiveShadow>
        <boxGeometry args={[W, 0.3, D]} />
        <meshStandardMaterial color="#292524" roughness={1} />
      </mesh>

      {/* Evidencias */}
      {problema.pistas.map((p, i) => (
        <group
          key={`${problemaId}-${i}`}
          ref={(g) => {
            piezas.current[i] = g;
          }}
          visible={false}
        >
          <PiezaArtefacto tipo={p.artefacto} />
          {i < profundidad && (
            <Etiqueta pos={[0, 0.72, 0]} df={10} fs={10} col={estratoSel === i ? modoColor : "rgba(255,255,255,0.3)"}>
              <i className="fa-solid fa-magnifying-glass" style={{ color: modoColor }} />
              {p.anio}
            </Etiqueta>
          )}
        </group>
      ))}

      {/* Calle (encima del estrato de hoy; retrocede con él) */}
      <mesh ref={calle} position={[0, 0.02, 0]} scale={[1, 1, D]}>
        <boxGeometry args={[W, 0.04, 1]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
      <Superficie problemaId={problemaId} />

      {/* Arqueóloga con lámpara */}
      <group ref={arqueologa} position={[W / 2 - 0.55, 0, D / 2 - 0.3]}>
        <Persona pos={[0, 0, 0]} color={modoColor} escala={0.62} />
        <mesh position={[0.1, 0.62, 0.08]}>
          <sphereGeometry args={[0.05, 12, 10]} />
          <meshBasicMaterial color="#fef3c7" />
        </mesh>
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. ESPIRAL DEL TIEMPO
 * ════════════════════════════════════════════════════════════════════════ */

/*
 * Una vuelta = 110 años (no 100): así los siglos no empiezan todos en el mismo
 * ángulo y sus etiquetas se reparten a lo largo de la espiral. La posición de
 * la etiqueta de cada siglo (año x67) se eligió con un script que minimiza el
 * traslape con las etiquetas de las 10 evidencias.
 */
const VUELTA = 110;
const PASO_RADIAL = 0.7;
const R_MAX = 1.05 + ((ANIO_FIN - ANIO_INICIO) / VUELTA) * PASO_RADIAL;
const ANIO_ETQ_SIGLO = 67;
function posAnio(anio: number, dy = 0): THREE.Vector3 {
  const t = (anio - ANIO_INICIO) / VUELTA;
  const a = t * Math.PI * 2 + Math.PI / 2;
  const r = 1.05 + t * PASO_RADIAL;
  return new THREE.Vector3(Math.cos(a) * r, t * 0.2 + dy, Math.sin(a) * r);
}

class CurvaEspiral extends THREE.Curve<THREE.Vector3> {
  desde: number;
  hasta: number;
  dy: number;
  constructor(desde: number, hasta: number, dy = 0) {
    super();
    this.desde = desde;
    this.hasta = hasta;
    this.dy = dy;
  }
  getPoint(u: number, destino = new THREE.Vector3()) {
    return destino.copy(posAnio(this.desde + (this.hasta - this.desde) * u, this.dy));
  }
}

const PERIODOS: { desde: number; hasta: number; etq: string; color: string }[] = [
  { desde: ANIO_INICIO, hasta: 1521, etq: "Mesoamérica", color: "#b45309" },
  { desde: 1521, hasta: 1821, etq: "Virreinato", color: "#7c3aed" },
  { desde: 1821, hasta: ANIO_FIN, etq: "México independiente", color: "#0d9488" },
];

function Gema({ anio, color, resaltada }: { anio: number; color: string; resaltada: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const caida = useRef(0);
  useFrame(({ clock }, dt) => {
    caida.current = Math.min(1, caida.current + dt * 1.6);
    if (!ref.current) return;
    const c = 1 - Math.pow(1 - caida.current, 3);
    ref.current.position.y = 0.26 + (1 - c) * 2.2 + Math.sin(clock.elapsedTime * 2 + anio) * 0.03;
    ref.current.rotation.y = clock.elapsedTime * 0.8 + anio;
    const s = resaltada ? 1.35 + Math.sin(clock.elapsedTime * 5) * 0.12 : 1;
    ref.current.scale.setScalar(s);
  });
  const p = posAnio(anio);
  return (
    <group position={[p.x, p.y, p.z]}>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={resaltada ? 1.1 : 0.55} roughness={0.25} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.24, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <Etiqueta pos={[0, 0.62, 0]} df={12} fs={resaltada ? 10.5 : 9.5} col={resaltada ? color : `${color}88`}>
        {anio}
      </Etiqueta>
    </group>
  );
}

function EscenaEspiral({ ubicadas, evidenciaActual, vinculoId, vinculoResuelto, modoColor }: { ubicadas: string[]; evidenciaActual: string | null; vinculoId: string | null; vinculoResuelto: boolean; modoColor: string }) {
  const tubos = useMemo(() => PERIODOS.map((p) => new THREE.TubeGeometry(new CurvaEspiral(p.desde, p.hasta), Math.round((p.hasta - p.desde) / 3), 0.05, 8, false)), []);
  const vinculo = VINCULOS.find((v) => v.id === vinculoId) ?? null;
  const tramoGeo = useMemo(() => (vinculo?.tramo ? new THREE.TubeGeometry(new CurvaEspiral(vinculo.tramo[0], vinculo.tramo[1], 0.02), 60, 0.11, 10, false) : null), [vinculo]);
  const arcoGeo = useMemo(() => {
    if (!vinculo || vinculo.puntos.length < 2) return null;
    const a = posAnio(vinculo.puntos[0]!, 0.3);
    const b = posAnio(vinculo.puntos[1]!, 0.3);
    const m = a.clone().add(b).multiplyScalar(0.5);
    m.y += 1.3 + a.distanceTo(b) * 0.18;
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 48, 0.035, 8, false);
  }, [vinculo]);
  const pendiente = EVIDENCIAS.find((e) => e.id === evidenciaActual) ?? null;
  const gemaPend = useRef<THREE.Group>(null);
  const tramoMat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (gemaPend.current) {
      gemaPend.current.rotation.y = clock.elapsedTime * 0.9;
      gemaPend.current.position.y = 1.15 + Math.sin(clock.elapsedTime * 1.6) * 0.06;
    }
    if (tramoMat.current) tramoMat.current.emissiveIntensity = 0.7 + Math.sin(clock.elapsedTime * 3) * 0.3;
  });
  const colV = vinculo ? (vinculoResuelto ? RELACION_DEF[vinculo.correcta].color : modoColor) : modoColor;
  const siglos = Array.from({ length: 8 }, (_, k) => 14 + k);

  return (
    <group position={[0, -1.1, 0.3]}>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[R_MAX + 0.5, R_MAX + 0.5, 0.08, 96]} />
        <meshStandardMaterial color="#0b1628" roughness={0.9} />
      </mesh>
      {tubos.map((g, k) => (
        <mesh key={k} geometry={g} castShadow>
          <meshStandardMaterial color={PERIODOS[k]!.color} emissive={PERIODOS[k]!.color} emissiveIntensity={0.35} roughness={0.4} />
        </mesh>
      ))}
      {/* Siglos: punto blanco donde empieza cada siglo y etiqueta dentro de su tramo */}
      {siglos.map((n) => {
        const inicio = posAnio((n - 1) * 100 + 1);
        const q = posAnio(Math.min((n - 1) * 100 + ANIO_ETQ_SIGLO, 2025));
        return (
          <group key={n}>
            <mesh position={[inicio.x, inicio.y, inicio.z]}>
              <sphereGeometry args={[0.08, 14, 10]} />
              <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.5} />
            </mesh>
            <Etiqueta pos={[q.x, q.y + 0.08, q.z]} df={13} fs={9.5} col={n === 21 ? `${modoColor}aa` : "rgba(255,255,255,0.2)"} bg="rgba(4,10,22,0.78)">
              s. {romano(n)}
              {n === 21 ? " · hoy" : ""}
            </Etiqueta>
          </group>
        );
      })}
      <Etiqueta pos={[posAnio(ANIO_INICIO).x, 0.5, posAnio(ANIO_INICIO).z]} df={13} fs={9.5}>
        1300
      </Etiqueta>

      {EVIDENCIAS.filter((e) => ubicadas.includes(e.id)).map((e) => (
        <Gema key={e.id} anio={e.anio} color={PROCESO_COLOR[e.proceso]} resaltada={!!vinculo && vinculo.puntos.includes(e.anio)} />
      ))}

      {vinculo?.puntos
        .filter((a) => !EVIDENCIAS.some((e) => e.anio === a && ubicadas.includes(e.id)))
        .map((a) => {
          const q = posAnio(a);
          return (
            <mesh key={a} position={[q.x, q.y + 0.26, q.z]}>
              <sphereGeometry args={[0.12, 16, 12]} />
              <meshStandardMaterial color={colV} emissive={colV} emissiveIntensity={0.9} transparent opacity={0.8} />
            </mesh>
          );
        })}
      {tramoGeo && (
        <mesh geometry={tramoGeo}>
          <meshStandardMaterial ref={tramoMat} color={colV} emissive={colV} emissiveIntensity={0.8} transparent opacity={0.75} />
        </mesh>
      )}
      {arcoGeo && (
        <mesh geometry={arcoGeo}>
          <meshStandardMaterial color={colV} emissive={colV} emissiveIntensity={0.9} />
        </mesh>
      )}

      {/* Pedestal central con la evidencia por ubicar */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.5, 0.7, 24]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.3} />
      </mesh>
      {pendiente && (
        <group ref={gemaPend} position={[0, 1.25, 0]}>
          <mesh>
            <octahedronGeometry args={[0.24, 0]} />
            <meshStandardMaterial color={PROCESO_COLOR[pendiente.proceso]} emissive={PROCESO_COLOR[pendiente.proceso]} emissiveIntensity={0.9} roughness={0.2} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. MUCHAS VOCES
 * ════════════════════════════════════════════════════════════════════════ */

const R_VOCES = 3.5;
const CENTRO_HILO = new THREE.Vector3(0, 2.3, 0.4);

function posVoz(i: number, n: number): Pt {
  const a = Math.PI * (1.08 + (0.84 * i) / (n - 1));
  return [Math.cos(a) * R_VOCES, 0, Math.sin(a) * R_VOCES * 0.62 + 0.1];
}

function Hilo({ i, n, color }: { i: number; n: number; color: string }) {
  const geo = useMemo(() => {
    const desde = posVoz(i, n);
    const a = new THREE.Vector3(desde[0], 0.95, desde[2]);
    const m = a.clone().lerp(CENTRO_HILO, 0.5);
    m.y += 0.9;
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, CENTRO_HILO), 40, 0.025, 8, false);
  }, [i, n]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
    </mesh>
  );
}

function Trenza({ clave }: { clave: string }) {
  const grupo = useRef<THREE.Group>(null);
  const colores = useMemo(() => clave.split("|"), [clave]);
  const geos = useMemo(
    () =>
      colores.map((_, k) => {
        const fase = (k / colores.length) * Math.PI * 2;
        const pts = Array.from({ length: 40 }, (_, j) => {
          const u = j / 39;
          const y = 0.55 + u * (CENTRO_HILO.y - 0.55);
          return new THREE.Vector3(Math.cos(fase + u * 9) * 0.12, y, Math.sin(fase + u * 9) * 0.12);
        });
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.028, 8, false);
      }),
    [colores],
  );
  useFrame((_, dt) => {
    if (grupo.current) grupo.current.rotation.y += dt * 0.9;
  });
  return (
    <group ref={grupo} position={[0, 0, CENTRO_HILO.z]}>
      {geos.map((g, k) => (
        <mesh key={k} geometry={g}>
          <meshStandardMaterial color={colores[k]} emissive={colores[k]} emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Fogata() {
  const llamas = useRef<THREE.Group>(null);
  const luz = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    llamas.current?.children.forEach((c, k) => {
      c.scale.y = 1 + 0.22 * Math.sin(t * 9 + k * 2.1);
      c.rotation.y = t * (0.6 + k * 0.2);
    });
    if (luz.current) luz.current.intensity = 5 + Math.sin(t * 13) * 0.6 + Math.sin(t * 7.3) * 0.5;
  });
  return (
    <group position={[0, 0, CENTRO_HILO.z]}>
      {Array.from({ length: 10 }, (_, k) => {
        const a = (k / 10) * Math.PI * 2;
        return (
          <mesh key={k} position={[Math.cos(a) * 0.5, 0.08, Math.sin(a) * 0.5]} scale={[1, 0.7, 1]} castShadow>
            <dodecahedronGeometry args={[0.13, 0]} />
            <meshStandardMaterial color="#57534e" roughness={1} flatShading />
          </mesh>
        );
      })}
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[0, 0.12, 0]} rotation={[0, (k * Math.PI) / 3, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.7, 8]} />
          <meshStandardMaterial color="#451a03" roughness={1} />
        </mesh>
      ))}
      <group ref={llamas}>
        {[
          [0, 0.42, 0, 0.2, 0.62, "#f97316"],
          [0.08, 0.34, 0.05, 0.13, 0.42, "#fbbf24"],
          [-0.08, 0.32, -0.04, 0.12, 0.36, "#ef4444"],
        ].map(([x, y, z, r, h, c], k) => (
          <mesh key={k} position={[x as number, y as number, z as number]}>
            <coneGeometry args={[r as number, h as number, 10, 1, true]} />
            <meshBasicMaterial color={c as string} transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <pointLight ref={luz} position={[0, 0.8, 0]} intensity={5} distance={9} color="#fb923c" castShadow={false} />
    </group>
  );
}

function FiguraVoz({ pos, color, activa, identificada, quien, icono, dice, alto, dx }: { pos: Pt; color: string; activa: boolean; identificada: boolean; quien: string; icono: string; dice: string; alto: boolean; dx: number }) {
  const ref = useRef<THREE.Group>(null);
  const aro = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    if (ref.current) {
      const objetivo = activa ? 1.18 : 1;
      const s = ref.current.scale.x + (objetivo - ref.current.scale.x) * suave(dt, 0.1);
      ref.current.scale.setScalar(s);
      ref.current.position.y = activa ? Math.abs(Math.sin(clock.elapsedTime * 3)) * 0.05 : 0;
    }
    if (aro.current) aro.current.rotation.z = clock.elapsedTime * 0.8;
  });
  // Mira hacia la fogata.
  const giro = Math.atan2(-pos[0], CENTRO_HILO.z - pos[2]);
  return (
    <group position={pos}>
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.24, 20]} />
        <meshStandardMaterial color="#44403c" roughness={0.9} />
      </mesh>
      <group ref={ref} rotation={[0, giro, 0]}>
        <Persona pos={[0, 0.22, 0]} color={color} escala={0.95} />
      </group>
      {activa && (
        <mesh ref={aro} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.55, 40]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
      <Etiqueta pos={[dx, alto ? 1.98 : 1.5, 0]} df={8} fs={11} col={activa ? color : `${color}88`}>
        <i className={`fa-solid ${icono}`} style={{ color }} />
        {quien}
        {identificada && <i className="fa-solid fa-circle-check" style={{ color: "#34d399" }} />}
      </Etiqueta>
      {activa && (
        <Html position={[0, alto ? 3.15 : 2.7, 0]} center distanceFactor={8} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ width: 240, padding: "9px 12px", borderRadius: 13, background: "#fffbeb", color: "#1c1917", fontSize: 11.5, fontWeight: 700, lineHeight: 1.4, boxShadow: "0 10px 26px -10px #000", border: `2px solid ${color}` }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", color: "#78716c", marginBottom: 3 }}>VOZ ILUSTRATIVA</div>«{dice}»
          </div>
        </Html>
      )}
    </group>
  );
}

function EscenaVoces({ casoId, vozSel, identificadas, incluidas, modoColor }: { casoId: CasoVocesId; vozSel: string | null; identificadas: string[]; incluidas: string[]; modoColor: string }) {
  const caso = CASOS_VOCES.find((c) => c.id === casoId) ?? CASOS_VOCES[0]!;
  const n = caso.voces.length;
  const coloresTrenza = caso.voces.filter((v) => incluidas.includes(v.id)).map((v) => v.color);
  const claveTrenza = coloresTrenza.join("|");
  return (
    <group position={[0, -1.3, 0]}>
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <cylinderGeometry args={[4.6, 4.6, 0.08, 72]} />
        <meshStandardMaterial color={caso.id === "canal" ? "#1f2a1c" : "#26221f"} roughness={0.95} />
      </mesh>
      {caso.id === "canal"
        ? Array.from({ length: 22 }, (_, k) => {
            const a = (k / 22) * Math.PI * 2;
            return (
              <mesh key={k} position={[Math.cos(a) * 4.25, 0.3, Math.sin(a) * 4.25]}>
                <coneGeometry args={[0.06, 0.6 + (k % 3) * 0.18, 6]} />
                <meshStandardMaterial color="#4d7c0f" roughness={0.8} />
              </mesh>
            );
          })
        : Array.from({ length: 9 }, (_, k) => {
            const a = (k / 9) * Math.PI * 2 + 0.3;
            return (
              <mesh key={k} position={[Math.cos(a) * 4.1, 0.14, Math.sin(a) * 4.1]} rotation={[0.3 * ((k % 3) - 1), a, 0.25 * ((k % 2) * 2 - 1)]} castShadow>
                <boxGeometry args={[0.7, 0.2, 0.45]} />
                <meshStandardMaterial color="#9ca3af" roughness={0.95} />
              </mesh>
            );
          })}
      <Fogata />
      {caso.voces.map((v, i) => (
        <FiguraVoz key={v.id} alto={i % 2 === 1} dx={i === 0 ? -0.35 : i === n - 1 ? 0.55 : 0} pos={posVoz(i, n)} color={v.color} activa={v.id === vozSel} identificada={identificadas.includes(v.id)} quien={v.corto} icono={v.icono} dice={v.dice} />
      ))}
      {caso.voces.map((v, i) => (incluidas.includes(v.id) ? <Hilo key={`h-${v.id}`} i={i} n={n} color={v.color} /> : null))}
      {coloresTrenza.length > 0 && <Trenza key={claveTrenza} clave={claveTrenza} />}
      <Etiqueta pos={[0, 0.2, CENTRO_HILO.z + 1.1]} df={8} fs={11.5} col={coloresTrenza.length >= 3 ? "#34d399" : `${modoColor}aa`}>
        <i className="fa-solid fa-link" style={{ color: coloresTrenza.length >= 3 ? "#34d399" : modoColor }} />
        {coloresTrenza.length === 0 ? `${caso.etq} · ${caso.fecha}` : `Explicación con ${coloresTrenza.length} ${coloresTrenza.length === 1 ? "voz" : "voces"}`}
      </Etiqueta>
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function PreguntasPasadoScene(p: PreguntasPasadoSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt } => {
    if (vista === "excavar") return { pos: [0.3, 3.4, 12.2], target: [0.3, -0.7, 0] };
    if (vista === "espiral") return { pos: [0, 13, 10.1], target: [0, -1.4, -0.1] };
    return { pos: [0, 3.9, 9.4], target: [0, 0.3, -0.6] };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      {/* Sin altura: esta escena no tenía sombra de la que leerla, así
          que el escenario la MIDE de la propia escena al montarse, en
          vez de que alguien la adivine. */}
      <Escenario acento="#38bdf8" />
      <pointLight position={[-6, 3, 5]} intensity={0.4} color={modoColor} />

      {vista === "excavar" && <EscenaExcavar problemaId={p.problemaId} profundidad={p.profundidad} estratoSel={p.estratoSel} modoColor={modoColor} />}
      {vista === "espiral" && <EscenaEspiral ubicadas={p.ubicadas} evidenciaActual={p.evidenciaActual} vinculoId={p.vinculoId} vinculoResuelto={p.vinculoResuelto} modoColor={modoColor} />}
      {vista === "voces" && <EscenaVoces casoId={p.casoId} vozSel={p.vozSel} identificadas={p.identificadas} incluidas={p.incluidas} modoColor={modoColor} />}

      <OrbitControls makeDefault enablePan={false} enableZoom minDistance={4} maxDistance={20} maxPolarAngle={Math.PI * 0.49} minPolarAngle={Math.PI * 0.08} target={cam.target} />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.62} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
