"use client";

/**
 * Escena 3D del laboratorio de Conservación de la energía — un péndulo (R3F).
 * Se carga de forma diferida (ssr:false) desde LabConservacion.tsx.
 *
 * Es un lab ANIMADO: integra la ecuación del péndulo θ'' = −(g/L)·senθ − fricción·ω
 * en useFrame mutando REFS (nunca setState), como exige el React Compiler.
 *   · En lo alto: toda la energía es potencial (Ep = m·g·h), v = 0.
 *   · En el punto bajo: toda es cinética (Ec = ½·m·v²), v máxima.
 *   · Las tres barras (Ep, Ec, Calor) siempre suman la energía inicial E₀:
 *     sin fricción se reparte Ep↔Ec; con fricción una parte pasa a calor.
 * Nada de Math.random ni Date.now: la animación usa state.clock y delta.
 */

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  grados2rad,
  altura,
  energiaPotencial,
  energiaTotal,
  fmtNum,
  ANG_MIN,
  ANG_MAX,
} from "./conservacion-data";

export interface ConservacionSceneProps {
  anguloDeg: number; // ángulo inicial (grados)
  largo: number; // L (m)
  masa: number; // m (kg)
  g: number; // gravedad (m/s²)
  friccion: number; // 0..1
  pausado: boolean;
  accent: string;
  autoRotate: boolean;
  resetNonce: number;
  /** Habilita arrastrar la masa para fijar el ángulo de suelta. */
  arrastrable?: boolean;
  /** Se llama al soltar la masa con el nuevo ángulo (grados). */
  onAnguloChange?: (deg: number) => void;
}

// vectores de trabajo reutilizados en el arrastre (el péndulo oscila en el plano XY)
const _zPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const _hit = new THREE.Vector3();

const EP_COL = "#3BA7FF"; // potencial → azul
const EC_COL = "#FFB13B"; // cinética → ámbar
const HEAT_COL = "#FF5A5A"; // calor → rojo
const META = "#9fc0e0";

const PIVOT: [number, number, number] = [-1.4, 3.7, 0];
const BAR_BASE_Y = 0.0;
const BAR_H = 2.8; // altura de la barra a energía completa
const BAR_W = 0.5;
const BAR_XS = { ep: 2.0, ec: 2.85, heat: 3.7 };

export default function ConservacionScene(props: ConservacionSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      camera={{ position: [0.7, 2.6, 9], fov: 44 }}
    >
      <Contenido {...props} />
    </Canvas>
  );
}

/**
 * Contenido de la escena. DEBE vivir dentro de <Canvas>, porque useFrame y los
 * demás hooks de R3F solo funcionan dentro del árbol del Canvas.
 */
function Contenido(props: ConservacionSceneProps) {
  const { anguloDeg, largo: L, masa: m, g, friccion, pausado, accent, arrastrable, onAnguloChange } = props;

  // estado de la simulación en refs (no dispara renders)
  const thetaRef = useRef(grados2rad(anguloDeg));
  const omegaRef = useRef(0);
  const e0Ref = useRef(energiaTotal(m, g, L, grados2rad(anguloDeg)));
  const prevNonce = useRef(props.resetNonce);

  // arrastre de la masa para fijar el ángulo de suelta (pilar: manipular)
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const [hover, setHover] = useState(false);
  const [dragDeg, setDragDeg] = useState(anguloDeg); // ángulo en vivo durante el arrastre (para la etiqueta)
  const lastDegRef = useRef(anguloDeg);

  const onBobDown = (e: ThreeEvent<PointerEvent>) => {
    if (!arrastrable) return;
    e.stopPropagation();
    draggingRef.current = true;
    setDragging(true);
    omegaRef.current = 0;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onBobMove = (e: ThreeEvent<PointerEvent>) => {
    if (!draggingRef.current) return;
    e.stopPropagation();
    if (!e.ray.intersectPlane(_zPlane, _hit)) return;
    const dx = _hit.x - PIVOT[0];
    const dy = _hit.y - PIVOT[1];
    // θ medido desde la vertical hacia abajo; signo = lado del arrastre
    const raw = Math.atan2(dx, -dy);
    const sign = raw < 0 ? -1 : 1;
    const maxR = grados2rad(ANG_MAX);
    const mag = Math.min(Math.abs(raw), maxR);
    thetaRef.current = sign * mag;
    omegaRef.current = 0;
    const deg = Math.max(ANG_MIN, Math.min(ANG_MAX, Math.round((mag * 180) / Math.PI)));
    lastDegRef.current = deg;
    setDragDeg(deg);
  };
  const endDrag = (e: ThreeEvent<PointerEvent>) => {
    if (!draggingRef.current) return;
    e.stopPropagation();
    draggingRef.current = false;
    setDragging(false);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    onAnguloChange?.(lastDegRef.current);
  };

  // refs de objetos 3D
  const armRef = useRef<THREE.Group>(null);
  const bobRef = useRef<THREE.Mesh>(null);
  const epRef = useRef<THREE.Mesh>(null);
  const ecRef = useRef<THREE.Mesh>(null);
  const heatRef = useRef<THREE.Mesh>(null);
  // refs de etiquetas DOM (texto vivo)
  const epTxt = useRef<HTMLSpanElement>(null);
  const ecTxt = useRef<HTMLSpanElement>(null);
  const heatTxt = useRef<HTMLSpanElement>(null);
  const vTxt = useRef<HTMLSpanElement>(null);

  // arco de la trayectoria (referencia estática)
  const arco = useMemo(() => {
    const t0 = grados2rad(anguloDeg);
    const pts: [number, number, number][] = [];
    const N = 40;
    for (let i = 0; i <= N; i++) {
      const th = -t0 + (2 * t0 * i) / N;
      pts.push([PIVOT[0] + L * Math.sin(th), PIVOT[1] - L * Math.cos(th), 0]);
    }
    return pts;
  }, [anguloDeg, L]);

  const bobR = useMemo(() => 0.16 * Math.cbrt(m), [m]);

  const setBar = (mesh: THREE.Mesh | null, frac: number) => {
    if (!mesh) return;
    const hh = Math.max(BAR_H * Math.min(Math.max(frac, 0), 1), 0.0001);
    mesh.scale.y = hh;
    mesh.position.y = BAR_BASE_Y + hh / 2;
  };

  useFrame((state, rawDelta) => {
    // reinicio si cambió algún control (resetNonce)
    if (prevNonce.current !== props.resetNonce) {
      prevNonce.current = props.resetNonce;
      thetaRef.current = grados2rad(anguloDeg);
      omegaRef.current = 0;
      e0Ref.current = energiaTotal(m, g, L, grados2rad(anguloDeg));
    }

    const delta = Math.min(rawDelta, 0.03);
    if (!pausado && !draggingRef.current) {
      // integración (semi-implícita de Euler)
      const damping = friccion * 1.1;
      const alpha = -(g / L) * Math.sin(thetaRef.current) - damping * omegaRef.current;
      omegaRef.current += alpha * delta;
      thetaRef.current += omegaRef.current * delta;
    }

    const theta = thetaRef.current;
    const omega = omegaRef.current;

    // brazo del péndulo
    if (armRef.current) armRef.current.rotation.z = theta;

    // energías
    const h = altura(L, theta);
    const ep = energiaPotencial(m, g, h);
    const v = Math.abs(omega) * L;
    const ec = 0.5 * m * v * v;
    const e0 = e0Ref.current || 1e-9;
    const mec = ep + ec;
    const heat = Math.max(e0 - mec, 0);

    // barras (fracción de E₀)
    setBar(epRef.current, ep / e0);
    setBar(ecRef.current, ec / e0);
    setBar(heatRef.current, heat / e0);

    // brillo del péndulo según la rapidez
    if (bobRef.current) {
      const mat = bobRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.12 + 0.6 * (ec / e0);
    }

    // etiquetas vivas
    if (epTxt.current) epTxt.current.textContent = `${fmtNum(ep, 1)} J`;
    if (ecTxt.current) ecTxt.current.textContent = `${fmtNum(ec, 1)} J`;
    if (heatTxt.current) heatTxt.current.textContent = `${fmtNum(heat, 1)} J`;
    if (vTxt.current) vTxt.current.textContent = `${fmtNum(v, 2)} m/s`;
  });

  return (
    <>
      <color attach="background" args={["#03101f"]} />
      <fog attach="fog" args={["#03101f", 22, 60]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 12, 8]}
        intensity={1.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={44}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-9, 7, 5]} intensity={5} color={accent} />
      <pointLight position={[8, 5, -4]} intensity={3} color={EC_COL} />

      <group key={`${props.resetNonce}`}>
        {/* Piso */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[44, 44]} />
          <meshStandardMaterial color="#06182f" roughness={0.95} metalness={0.04} />
        </mesh>

        {/* Soporte del pivote */}
        <mesh position={[PIVOT[0], PIVOT[1] / 2, 0]} castShadow>
          <boxGeometry args={[0.12, PIVOT[1], 0.12]} />
          <meshStandardMaterial color="#13314f" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[PIVOT[0] + 0.5, PIVOT[1], 0]} castShadow>
          <boxGeometry args={[1.2, 0.12, 0.12]} />
          <meshStandardMaterial color="#13314f" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={PIVOT}>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshStandardMaterial color={META} roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Arco de la trayectoria */}
        <Line points={arco} color={META} lineWidth={1.6} dashed dashSize={0.12} gapSize={0.1} transparent opacity={0.5} />

        {/* Brazo + masa (rota alrededor del pivote) */}
        <group ref={armRef} position={PIVOT}>
          <mesh position={[0, -L / 2, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, L, 16]} />
            <meshStandardMaterial color={META} roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh ref={bobRef} position={[0, -L, 0]} castShadow>
            <sphereGeometry args={[bobR, 32, 32]} />
            <meshStandardMaterial color={accent} roughness={0.3} metalness={0.25} emissive={accent} emissiveIntensity={0.12} />
            {(hover || dragging) && arrastrable && (
              <mesh>
                <sphereGeometry args={[bobR * 1.18, 24, 24]} />
                <meshBasicMaterial color={accent} transparent opacity={0.18} />
              </mesh>
            )}
          </mesh>

          {/* Objetivo de agarre (invisible, mayor que la masa para arrastrar con facilidad) */}
          {arrastrable && (
            <mesh
              position={[0, -L, 0]}
              onPointerDown={onBobDown}
              onPointerMove={onBobMove}
              onPointerUp={endDrag}
              onPointerOver={() => setHover(true)}
              onPointerOut={() => setHover(false)}
            >
              <sphereGeometry args={[Math.max(bobR * 2.1, 0.42), 16, 16]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          )}

          {arrastrable && (hover || dragging) && (
            <Html center position={[0, -L - bobR - 0.45, 0]} distanceFactor={16} pointerEvents="none">
              <div style={{ whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)", fontWeight: 800, fontSize: 12, color: accent, background: "rgba(2,12,28,0.7)", padding: "3px 8px", borderRadius: 8 }}>
                <i className="fa-solid fa-hand-pointer" style={{ marginRight: 6 }} />
                {dragging ? `suelta a ${dragDeg}°` : "arrastra la masa"}
              </div>
            </Html>
          )}
        </group>

        {/* Plataforma de las barras */}
        <mesh position={[(BAR_XS.ep + BAR_XS.heat) / 2, -0.04, 0]} receiveShadow>
          <boxGeometry args={[2.5, 0.08, 1.0]} />
          <meshStandardMaterial color="#0a2138" roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Barras de energía (altura mutada por ref) */}
        <mesh ref={epRef} position={[BAR_XS.ep, BAR_BASE_Y, 0]}>
          <boxGeometry args={[BAR_W, 1, BAR_W]} />
          <meshStandardMaterial color={EP_COL} emissive={EP_COL} emissiveIntensity={0.3} roughness={0.35} />
        </mesh>
        <mesh ref={ecRef} position={[BAR_XS.ec, BAR_BASE_Y, 0]}>
          <boxGeometry args={[BAR_W, 1, BAR_W]} />
          <meshStandardMaterial color={EC_COL} emissive={EC_COL} emissiveIntensity={0.3} roughness={0.35} />
        </mesh>
        <mesh ref={heatRef} position={[BAR_XS.heat, BAR_BASE_Y, 0]}>
          <boxGeometry args={[BAR_W, 1, BAR_W]} />
          <meshStandardMaterial color={HEAT_COL} emissive={HEAT_COL} emissiveIntensity={0.3} roughness={0.35} />
        </mesh>

        {/* Marca de la energía total (línea fija arriba de las barras) */}
        <Line
          points={[
            [BAR_XS.ep - 0.4, BAR_BASE_Y + BAR_H, 0],
            [BAR_XS.heat + 0.4, BAR_BASE_Y + BAR_H, 0],
          ]}
          color={META}
          lineWidth={2}
          dashed
          dashSize={0.14}
          gapSize={0.1}
        />
        <Html center position={[BAR_XS.heat + 1.05, BAR_BASE_Y + BAR_H, 0]} distanceFactor={15} pointerEvents="none">
          <div style={{ fontWeight: 800, fontSize: 12, color: META, whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}>E₀ total</div>
        </Html>

        {/* Etiquetas de las barras (texto vivo por ref) */}
        <Html center position={[BAR_XS.ep, BAR_BASE_Y + BAR_H + 0.45, 0]} distanceFactor={16} pointerEvents="none">
          <div style={{ textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
            <div style={{ fontWeight: 900, fontSize: 13, color: EP_COL }}>Ep</div>
            <div style={{ fontWeight: 800, fontSize: 12, color: EP_COL }}><span ref={epTxt}>0 J</span></div>
          </div>
        </Html>
        <Html center position={[BAR_XS.ec, BAR_BASE_Y + BAR_H + 0.45, 0]} distanceFactor={16} pointerEvents="none">
          <div style={{ textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
            <div style={{ fontWeight: 900, fontSize: 13, color: EC_COL }}>Ec</div>
            <div style={{ fontWeight: 800, fontSize: 12, color: EC_COL }}><span ref={ecTxt}>0 J</span></div>
          </div>
        </Html>
        <Html center position={[BAR_XS.heat, BAR_BASE_Y + BAR_H + 0.45, 0]} distanceFactor={16} pointerEvents="none">
          <div style={{ textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}>
            <div style={{ fontWeight: 900, fontSize: 13, color: HEAT_COL }}>Calor</div>
            <div style={{ fontWeight: 800, fontSize: 12, color: HEAT_COL }}><span ref={heatTxt}>0 J</span></div>
          </div>
        </Html>

        {/* Velocidad viva junto a la masa */}
        <Html center position={[PIVOT[0], 0.45, 0]} distanceFactor={17} pointerEvents="none">
          <div style={{ whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,0.95)", fontWeight: 800, fontSize: 12, color: accent }}>
            v = <span ref={vTxt}>0 m/s</span>
          </div>
        </Html>

        <ContactShadows position={[0, -0.02, 0]} opacity={0.32} scale={26} blur={3} far={11} color="#020c1c" />
      </group>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 9, 2]} scale={[18, 6, 1]} color="#ffffff" />
        <Lightformer intensity={1.3} position={[-8, 5, -2]} scale={[6, 9, 1]} color={accent} />
        <Lightformer intensity={1.0} position={[8, 4, 4]} scale={[5, 9, 1]} color={EC_COL} />
      </Environment>

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={32}
        minPolarAngle={Math.PI / 9}
        maxPolarAngle={Math.PI / 2.05}
        target={[0.8, 1.9, 0]}
        enabled={!dragging}
        autoRotate={props.autoRotate && !dragging}
        autoRotateSpeed={0.35}
      />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.55} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.42} />
      </EffectComposer>
    </>
  );
}
