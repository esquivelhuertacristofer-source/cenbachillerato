"use client";

/**
 * Escena 3D del laboratorio de Funciones de variable real — R3F.
 * Se carga de forma diferida (ssr:false) desde LabFunciones.tsx.
 *
 * Sobre un plano cartesiano se dibuja la gráfica y = f(x) de la función elegida.
 * Se marcan sus rasgos —raíces (cruces con X), intersección con Y, máximos y
 * mínimos locales— y, al analizar la SIMETRÍA, se superpone la curva reflejada
 * respecto al eje Y (si es PAR) o respecto al origen (si es IMPAR); cuando no
 * hay simetría, el reflejo respecto al eje Y NO coincide con la curva.
 *
 * Experimento central: la SONDA. El alumno elige un x; la escena pone el punto
 * P = (x, f(x)) y su gemelo Q = (−x, f(−x)) con guías hasta el eje X. Si los
 * dos están a la misma altura la función es par en ese punto; si están a
 * alturas opuestas, impar; si no, ninguna.
 *
 * Etiquetas: solo <Html>, 14 px, máx. 4 a la vez (P, Q y las letras de los
 * ejes); los valores de los rasgos viven en el panel.
 */

import * as THREE from "three";
import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Escenario } from "./_escenario";
import { PanelGrafica, CurvaTubo, EjeVarilla, MarcasEje } from "./_tablero";
import { EncuadreMate } from "./EncuadreMate";
import {
  funcionPorId,
  segmentosCurva,
  raices,
  interseccionY,
  extremos,
  simetria,
  relacionSonda,
  RANGO,
  fmtNum,
  type Simetria,
} from "./funciones-data";

export interface FuncionesSceneProps {
  funcionId: string;
  accent: string;
  showSimetria: boolean;
  showRasgos: boolean;
  /** Abscisa de la sonda (positiva); su gemelo está en −x. */
  x0: number;
  resetNonce: number;
}

const ORO = "#ffd24a";
const VERDE = "#34D399";
const CIAN = "#7fd4ff";
const MAGENTA = "#f0a6ff";
const ROJO = "#ff7a7a";
const EJE = "#9fb2c8";
const H = RANGO; // medio-ancho del plano (mundo: −H..H)

/** Refleja una lista de segmentos según el tipo de simetría a comprobar. */
function reflejar(
  segs: Array<Array<[number, number]>>,
  modo: "ejeY" | "origen"
): Array<Array<[number, number]>> {
  return segs.map((s) =>
    s.map(([x, y]) => (modo === "ejeY" ? [-x, y] : [-x, -y]) as [number, number])
  );
}

/* ════════════════════ CONTENIDO DEL PLANO ═══════════════════════════════ */
function Plano({ funcionId, accent, showSimetria, showRasgos, x0 }: {
  funcionId: string; accent: string; showSimetria: boolean; showRasgos: boolean; x0: number;
}) {
  const fn = useMemo(() => funcionPorId(funcionId), [funcionId]);
  const segs = useMemo(() => segmentosCurva(fn), [fn]);
  const sim = useMemo<Simetria>(() => simetria(fn), [fn]);
  const rs = useMemo(() => raices(fn), [fn]);
  const iy = useMemo(() => interseccionY(fn), [fn]);
  const exs = useMemo(() => extremos(fn), [fn]);

  // curva reflejada para ilustrar la simetría
  const reflejo = useMemo(() => {
    if (sim === "impar") return reflejar(segs, "origen");
    return reflejar(segs, "ejeY"); // par → coincide; ninguna → NO coincide (lo evidencia)
  }, [segs, sim]);
  const reflejoColor = sim === "impar" ? CIAN : sim === "par" ? ORO : ROJO;

  // sonda: P = (x, f(x)) y su gemelo Q = (−x, f(−x))
  const yP = fn.f(x0);
  const yQ = fn.f(-x0);
  const rel = relacionSonda(fn, x0);
  const colQ = rel === "igual" ? ORO : rel === "opuesto" ? CIAN : ROJO;
  const pVisible = Number.isFinite(yP) && Math.abs(yP) <= H;
  const qVisible = Number.isFinite(yQ) && Math.abs(yQ) <= H;

  const iyVisible = Math.abs(iy) <= H;

  return (
    <group>
      {/* El tablero, con grosor y marco. */}
      <PanelGrafica ancho={2 * H + 1.4} alto={2 * H + 1.4} />

      {/* rejilla del plano cartesiano */}
      <gridHelper
        args={[2 * H, 2 * H, "#274868", "#16314c"]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -0.04]}
      />

      {/* eje X: varilla con punta, una sola pieza que recibe luz */}
      <EjeVarilla desde={[-H - 0.4, 0, 0]} hasta={[H + 0.5, 0, 0]} color={EJE} />
      <Html position={[H + 0.95, 0.05, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
        <div style={{ color: EJE, fontSize: 14, fontWeight: 900 }}>X</div>
      </Html>

      {/* eje Y */}
      <EjeVarilla desde={[0, -H - 0.4, 0]} hasta={[0, H + 0.5, 0]} color={EJE} />
      <Html position={[0.05, H + 0.95, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
        <div style={{ color: EJE, fontSize: 14, fontWeight: 900 }}>Y</div>
      </Html>

      {/* marcas de unidad, como geometria y no como rayitas pintadas */}
      <MarcasEje desde={-H} hasta={H} eje="x" color={EJE} />
      <MarcasEje desde={-H} hasta={H} eje="y" color={EJE} />

      {/* curva reflejada (simetría) */}
      {showSimetria &&
        reflejo.map((seg, i) => (
          <Line
            key={`ref${i}`}
            points={seg.map(([x, y]) => [x, y, 0.005] as [number, number, number])}
            color={reflejoColor}
            lineWidth={3}
            dashed
            dashSize={0.18}
            gapSize={0.12}
          />
        ))}

      {/* La curva y = f(x), con cuerpo. */}
      {segs.map((seg, i) => (
        <CurvaTubo key={`cur${i}`} puntos={seg} color={accent} grosor={0.075} brillo={0.55} z={0.06} />
      ))}

      {/* eje de simetría / centro */}
      {showSimetria && sim === "par" && (
        <CurvaTubo puntos={[[0, -H, 0.02], [0, H, 0.02]]} color={ORO} grosor={0.025} brillo={0.6} />
      )}
      {showSimetria && sim === "impar" && (
        <mesh position={[0, 0, 0.03]}>
          <ringGeometry args={[0.12, 0.2, 24]} />
          <meshStandardMaterial color={CIAN} emissive={CIAN} emissiveIntensity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* rasgos: raíces (sin texto; los valores están en el panel) */}
      {showRasgos &&
        rs.map((x, i) => (
          <mesh key={`r${i}`} position={[x, 0, 0.05]}>
            <ringGeometry args={[0.1, 0.17, 22]} />
            <meshStandardMaterial color={VERDE} emissive={VERDE} emissiveIntensity={0.6} side={THREE.DoubleSide} />
          </mesh>
        ))}

      {/* rasgos: intersección con Y */}
      {showRasgos && iyVisible && (
        <mesh position={[0, iy, 0.06]} castShadow>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={0.6} />
        </mesh>
      )}

      {/* rasgos: máximos y mínimos locales */}
      {showRasgos &&
        exs.map((e, i) => (
          <mesh key={`e${i}`} position={[e.x, e.y, 0.06]} castShadow>
            <sphereGeometry args={[0.14, 22, 22]} />
            <meshStandardMaterial
              color={e.tipo === "max" ? MAGENTA : CIAN}
              emissive={e.tipo === "max" ? MAGENTA : CIAN}
              emissiveIntensity={0.6}
            />
          </mesh>
        ))}

      {/* sonda: P = (x, f(x)) y su gemelo Q = (−x, f(−x)) */}
      {pVisible && (
        <>
          <CurvaTubo puntos={[[x0, 0, 0.03], [x0, yP, 0.03]]} color="#ffffff" grosor={0.026} brillo={0.3} />
          <group position={[x0, yP, 0.1]}>
            <mesh castShadow>
              <sphereGeometry args={[0.2, 24, 24]} />
              <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.5} roughness={0.4} />
            </mesh>
            <Html position={[0.3, yP >= 0 ? 0.75 : -0.75, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
              <div style={{ background: "rgba(2,12,28,0.88)", border: `1px solid ${accent}99`, borderRadius: 8, padding: "3px 8px", whiteSpace: "nowrap" }}>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>f({fmtNum(x0, 2)}) = {fmtNum(yP, 2)}</span>
              </div>
            </Html>
          </group>
        </>
      )}
      {qVisible && (
        <>
          <CurvaTubo puntos={[[-x0, 0, 0.03], [-x0, yQ, 0.03]]} color={colQ} grosor={0.026} brillo={0.5} />
          <group position={[-x0, yQ, 0.1]}>
            <mesh castShadow>
              <sphereGeometry args={[0.2, 24, 24]} />
              <meshStandardMaterial color={colQ} emissive={colQ} emissiveIntensity={0.5} roughness={0.4} />
            </mesh>
            <Html position={[-0.3, yQ >= 0 ? 0.75 : -0.75, 0]} center pointerEvents="none" zIndexRange={[20, 0]}>
              <div style={{ background: "rgba(2,12,28,0.88)", border: `1px solid ${colQ}99`, borderRadius: 8, padding: "3px 8px", whiteSpace: "nowrap" }}>
                <span style={{ color: colQ, fontSize: 14, fontWeight: 900 }}>f({fmtNum(-x0, 2)}) = {fmtNum(yQ, 2)}</span>
              </div>
            </Html>
          </group>
        </>
      )}
    </group>
  );
}

/* ════════════════════ CANVAS + CONTENIDO ═════════════════════════════════ */
export default function FuncionesScene(props: FuncionesSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0, 0, 20], fov: 46 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

function Contenido(props: FuncionesSceneProps) {
  const { funcionId, accent, showSimetria, showRasgos, x0, resetNonce } = props;
  return (
    <>
      {/* Suelo, luz de tres puntos y entorno que reflejar. */}
      <Escenario acento={accent} suelo={0} />

      <EncuadreMate ancho={2 * H + 2} alto={2 * H + 2} nonce={resetNonce} />

      <group key={`${resetNonce}`}>
        <Plano funcionId={funcionId} accent={accent} showSimetria={showSimetria} showRasgos={showRasgos} x0={x0} />
      </group>

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={40}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
