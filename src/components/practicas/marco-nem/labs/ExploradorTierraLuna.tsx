"use client";
/* eslint-disable -- Código portado tal cual de NEM; las reglas de React Compiler de CEN no aplican a escenas three.js. */
// =============================================================================
// Escena 3D del EXPLORADOR ESPACIAL — la Tierra, la Luna y el Sol
// =============================================================================
// La Tierra lleva fotografías de satélite (no colores planos) y un sombreador
// propio que hace cuatro cosas que un material estándar no hace:
//   • día y noche con la luz del Sol real del instante simulado: la línea que
//     separa el día de la noche es la de esa hora (explorador-espacial-datos);
//   • del lado de noche se encienden las luces de las ciudades;
//   • el Sol se refleja en los océanos y no en los continentes;
//   • el borde se tiñe del azul de la atmósfera, y alrededor brilla un halo.
// Las nubes van en una segunda esfera un poco más grande, con su propia luz:
// por eso proyectan profundidad cuando se gira.
//
// MARCO DE REFERENCIA. El eje de la Tierra es el eje Y de la escena y el Sol
// está lejos en la dirección de `dirSol`, con la altura de la declinación del
// día. Es equivalente a inclinar el eje 23.4° y deja fijo el Sol, así que al
// correr el tiempo la Tierra es la que gira, como en la realidad.
//
// LO QUE NO ESTÁ A ESCALA, y la interfaz lo dice: el Sol (más cerca y más
// chico de lo real para que quepa) y, salvo con «distancia real», la Luna.
// =============================================================================

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, Stars, useTexture } from "@react-three/drei";
import { RUTA, ViaLactea, resolucion, texturaResplandor } from "./explorador-espacial-comun";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  LUNA_DISTANCIA_REAL,
  LUNA_RADIO,
  MEXICO,
  elongacionLuna,
  puntoSubsolar,
  vectorLonLat,
} from "./explorador-espacial-datos";

export type Enfoque = string;

export interface TierraProps {
  /** Milisegundos simulados por cada segundo real (0 = pausa, 1 = tiempo real). */
  velocidad: number;
  /** Cambia este número para regresar el reloj al instante actual. */
  ahoraN: number;
  enfoque: { a: Enfoque; n: number };
  nubes: boolean;
  luces: boolean;
  lunaReal: boolean;
  onSeleccion: (id: string) => void;
  onHora: (fecha: Date) => void;
  onListo: () => void;
}

const DIST_SOL = 160;
const RADIO_SOL = 7;
const LUNA_DIST_CERCA = 9;

// ── Estado del cielo en un instante ─────────────────────────────────────────
// β: ángulo horizontal fijo de la dirección del Sol en la escena.
const BETA = 0;

function cielo(fecha: Date) {
  const s = puntoSubsolar(fecha);
  const d = (s.lat * Math.PI) / 180;
  const dirSol = new THREE.Vector3(Math.cos(d) * Math.cos(BETA), Math.sin(d), Math.cos(d) * Math.sin(BETA));
  // Giro de la Tierra que pone el punto subsolar mirando al Sol (ver la nota de
  // marco arriba): el ángulo horizontal α de un punto baja en θ al girar θ.
  const [px, , pz] = vectorLonLat(s.lon, s.lat);
  const giro = Math.atan2(pz, px) - BETA;
  // La Luna avanza hacia el este, que en esta escena es α decreciente.
  const aLuna = BETA - (elongacionLuna(fecha) * Math.PI) / 180;
  return { dirSol, giro, aLuna };
}

// ── Sombreadores ────────────────────────────────────────────────────────────
const VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    vUv = uv;
    vN = normalize(mat3(modelMatrix) * normal);
    vec4 p = modelMatrix * vec4(position, 1.0);
    vP = p.xyz;
    gl_Position = projectionMatrix * viewMatrix * p;
  }
`;

const FRAG_TIERRA = /* glsl */ `
  uniform sampler2D uDia;
  uniform sampler2D uNoche;
  uniform sampler2D uNubes;
  uniform sampler2D uOceano;
  uniform vec3 uSol;
  uniform float uNubes_on;
  uniform float uLuces;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    vec3 n = normalize(vN);
    vec3 v = normalize(cameraPosition - vP);
    float ndl = dot(n, uSol);
    vec3 dia = texture2D(uDia, vUv).rgb;
    vec3 noche = texture2D(uNoche, vUv).rgb;
    float nube = texture2D(uNubes, vUv).r * uNubes_on;
    float oceano = texture2D(uOceano, vUv).r;

    // Día: luz difusa con una franja de crepúsculo rojiza junto a la línea.
    float luz = smoothstep(-0.06, 0.22, ndl);
    float difusa = max(ndl, 0.0);
    float crep = smoothstep(0.0, 0.18, ndl) * (1.0 - smoothstep(0.18, 0.45, ndl));
    vec3 colDia = dia * (difusa * 1.25 + 0.015);
    colDia *= mix(vec3(1.0), vec3(1.15, 0.78, 0.55), crep * 0.6);
    colDia *= 1.0 - nube * 0.25 * luz; // sombra suave bajo las nubes

    // Brillo del Sol en el agua (no en tierra firme ni bajo nubes).
    vec3 h = normalize(uSol + v);
    float brillo = pow(max(dot(n, h), 0.0), 160.0) * 0.55 + pow(max(dot(n, h), 0.0), 24.0) * 0.06;
    colDia += vec3(1.0, 0.9, 0.72) * brillo * oceano * (1.0 - nube) * luz;

    // Noche: las luces de las ciudades, cálidas, solo del lado oscuro.
    float noct = 1.0 - smoothstep(-0.18, 0.04, ndl);
    vec3 colNoche = noche * noche * vec3(2.6, 1.9, 1.15) * noct * (1.0 - nube * 0.85) * uLuces;

    vec3 col = colDia + colNoche;

    // Atmósfera vista de canto: el borde iluminado se vuelve azul.
    float fres = pow(1.0 - max(dot(n, v), 0.0), 2.5);
    float lado = smoothstep(-0.2, 0.5, ndl);
    col = mix(col, vec3(0.32, 0.58, 1.0) * (0.35 + difusa), fres * lado * 0.75);

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const FRAG_NUBES = /* glsl */ `
  uniform sampler2D uNubes;
  uniform vec3 uSol;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    vec3 n = normalize(vN);
    float ndl = dot(n, uSol);
    float a = texture2D(uNubes, vUv).r;
    float luz = smoothstep(-0.1, 0.3, ndl);
    vec3 c = vec3(1.0, 0.99, 0.97) * (max(ndl, 0.0) * 1.15 + 0.02);
    c *= mix(vec3(1.0), vec3(1.2, 0.8, 0.6), (1.0 - smoothstep(0.0, 0.3, ndl)) * luz);
    gl_FragColor = vec4(c, a * (0.25 + 0.75 * luz) * 0.95);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const VERT_HALO = /* glsl */ `
  varying vec3 vNv;
  varying vec3 vN;
  void main() {
    vNv = normalize(normalMatrix * normal);
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG_HALO = /* glsl */ `
  uniform vec3 uSol;
  varying vec3 vNv;
  varying vec3 vN;
  void main() {
    float i = pow(max(0.0, 0.62 + dot(vNv, vec3(0.0, 0.0, 1.0))), 4.0);
    float lado = smoothstep(-0.35, 0.45, dot(normalize(vN), uSol));
    vec3 c = vec3(0.30, 0.56, 1.0) * i * lado * 2.2;
    gl_FragColor = vec4(c, 1.0);
  }
`;

// ── La Tierra ───────────────────────────────────────────────────────────────
function Tierra({
  grupo,
  dirSol,
  nubes,
  luces,
  onSeleccion,
  mexicoRef,
}: {
  grupo: React.RefObject<THREE.Group | null>;
  dirSol: THREE.Vector3;
  nubes: boolean;
  luces: boolean;
  onSeleccion: (id: string) => void;
  mexicoRef: React.RefObject<HTMLDivElement | null>;
}) {
  const res = useMemo(() => resolucion(), []);
  const gl = useThree((s) => s.gl);
  const [dia, noche, mapaNubes, oceano] = useTexture([
    `${RUTA}/tierra-dia-${res}.webp`,
    `${RUTA}/tierra-noche-${res}.webp`,
    `${RUTA}/tierra-nubes-${res}.webp`,
    `${RUTA}/tierra-oceanos-2k.webp`,
  ]);
  useMemo(() => {
    const aniso = gl.capabilities.getMaxAnisotropy();
    for (const t of [dia, noche]) t!.colorSpace = THREE.SRGBColorSpace;
    for (const t of [dia, noche, mapaNubes, oceano]) t!.anisotropy = aniso;
  }, [dia, noche, mapaNubes, oceano, gl]);

  const uTierra = useMemo(
    () => ({
      uDia: { value: dia },
      uNoche: { value: noche },
      uNubes: { value: mapaNubes },
      uOceano: { value: oceano },
      uSol: { value: dirSol },
      uNubes_on: { value: 1 },
      uLuces: { value: 1 },
    }),
    [dia, noche, mapaNubes, oceano, dirSol]
  );
  const uNubes = useMemo(() => ({ uNubes: { value: mapaNubes }, uSol: { value: dirSol } }), [mapaNubes, dirSol]);
  const uHalo = useMemo(() => ({ uSol: { value: dirSol } }), [dirSol]);
  uTierra.uNubes_on.value = nubes ? 1 : 0;
  uTierra.uLuces.value = luces ? 1 : 0;

  // La etiqueta «México» solo se ve cuando México está del lado de la cámara.
  const camara = useThree((s) => s.camera);
  const local = useMemo(() => new THREE.Vector3(...vectorLonLat(MEXICO.lon, MEXICO.lat)), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const g = grupo.current;
    const el = mexicoRef.current;
    if (!g || !el) return;
    tmp.copy(local).applyQuaternion(g.quaternion);
    const haciaCamara = camara.position.clone().sub(tmp).normalize();
    el.style.opacity = tmp.dot(haciaCamara) > 0.2 ? "1" : "0";
  });

  const pin = useMemo(() => local.clone().multiplyScalar(1.012), [local]);
  const clic = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSeleccion("tierra");
  };
  return (
    <group>
      <group ref={grupo}>
        <mesh onClick={clic}>
          <sphereGeometry args={[1, 160, 80]} />
          <shaderMaterial vertexShader={VERT} fragmentShader={FRAG_TIERRA} uniforms={uTierra} />
        </mesh>
        {nubes && (
          <mesh scale={1.008} raycast={() => null}>
            <sphereGeometry args={[1, 160, 80]} />
            <shaderMaterial vertexShader={VERT} fragmentShader={FRAG_NUBES} uniforms={uNubes} transparent depthWrite={false} />
          </mesh>
        )}
        <mesh position={pin} raycast={() => null}>
          <sphereGeometry args={[0.007, 16, 12]} />
          <meshBasicMaterial color={[1.1, 0.55, 0.12]} toneMapped={false} />
        </mesh>
        <Html position={pin} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div
            ref={mexicoRef}
            style={{
              transform: "translate(0, -26px)",
              transition: "opacity .3s",
              padding: "3px 10px",
              borderRadius: 999,
              background: "#b8eb50",
              border: "2px solid #00153b",
              color: "#00153b",
              fontSize: 14,
              fontWeight: 800,
              whiteSpace: "nowrap",
              fontFamily: "var(--font-cen),'Montserrat',var(--font-sans),sans-serif",
            }}
          >
            México
          </div>
        </Html>
      </group>
      <mesh scale={1.06} raycast={() => null}>
        <sphereGeometry args={[1, 96, 48]} />
        <shaderMaterial
          vertexShader={VERT_HALO}
          fragmentShader={FRAG_HALO}
          uniforms={uHalo}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ── La Luna ─────────────────────────────────────────────────────────────────
function Luna({ luna, onSeleccion }: { luna: React.RefObject<THREE.Mesh | null>; onSeleccion: (id: string) => void }) {
  const mapa = useTexture(`${RUTA}/luna-2k.webp`);
  useMemo(() => {
    mapa.colorSpace = THREE.SRGBColorSpace;
  }, [mapa]);
  return (
    <mesh
      ref={luna}
      onClick={(e) => {
        e.stopPropagation();
        onSeleccion("luna");
      }}
    >
      <sphereGeometry args={[LUNA_RADIO, 96, 48]} />
      {/* El emisivo tenue es la luz cenicienta: la Tierra ilumina un poco la
          parte oscura de la Luna, y por eso se alcanza a ver. */}
      <meshStandardMaterial map={mapa} roughness={1} metalness={0} emissiveMap={mapa} emissive="#9fb4d8" emissiveIntensity={0.07} />
    </mesh>
  );
}

// ── El Sol ──────────────────────────────────────────────────────────────────
function Sol({ dirSol, onSeleccion }: { dirSol: THREE.Vector3; onSeleccion: (id: string) => void }) {
  const mapa = useTexture(`${RUTA}/sol-2k.webp`);
  useMemo(() => {
    mapa.colorSpace = THREE.SRGBColorSpace;
  }, [mapa]);
  const resplandor = useMemo(() => texturaResplandor(), []);
  const ref = useRef<THREE.Group>(null);
  const esfera = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    ref.current?.position.copy(dirSol).multiplyScalar(DIST_SOL);
    if (esfera.current) esfera.current.rotation.y += dt * 0.02;
  });
  return (
    <group ref={ref}>
      <mesh
        ref={esfera}
        onClick={(e) => {
          e.stopPropagation();
          onSeleccion("sol");
        }}
      >
        <sphereGeometry args={[RADIO_SOL, 64, 32]} />
        <meshBasicMaterial map={mapa} color={[2.4, 1.9, 1.3]} toneMapped={false} />
      </mesh>
      <sprite scale={RADIO_SOL * 7} raycast={() => null}>
        <spriteMaterial map={resplandor} blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
      </sprite>
    </group>
  );
}

// ── Reloj, órbitas y cámara ─────────────────────────────────────────────────
export function MundoTierra(p: TierraProps) {
  const tiempo = useRef(Date.now());
  const ultimoAviso = useRef(0);
  const grupoTierra = useRef<THREE.Group>(null);
  const luna = useRef<THREE.Mesh>(null);
  const mexicoRef = useRef<HTMLDivElement>(null);
  const dirSol = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const luzSol = useRef<THREE.DirectionalLight>(null);
  const controles = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  // En pantalla vertical (celular) el ancho visible es angosto: la cámara se
  // aleja lo necesario para que la Tierra quepa completa de lado a lado.
  const lejos = Math.max(1, 0.9 / (size.width / size.height));

  // Cámara: un vuelo suave hacia el objetivo; si el alumno arrastra, se cancela.
  const vuelo = useRef<{ pos: THREE.Vector3; obj: THREE.Vector3; seguir: "luna" | null } | null>(null);
  const siguiendo = useRef<"luna" | null>(null);
  const lunaAntes = useRef(new THREE.Vector3());

  const { onListo, onHora } = p;
  useEffect(() => {
    onListo();
  }, [onListo]);

  useEffect(() => {
    tiempo.current = Date.now();
  }, [p.ahoraN]);

  const posLuna = (aLuna: number, out: THREE.Vector3) =>
    out.set(Math.cos(aLuna), 0, Math.sin(aLuna)).multiplyScalar(p.lunaReal ? LUNA_DISTANCIA_REAL : LUNA_DIST_CERCA);

  // Un objetivo para cada botón. La cámara se pone del lado del Sol corrido un
  // poco, para que se vean a la vez el día, la línea y algo de la noche.
  useEffect(() => {
    const c = cielo(new Date(tiempo.current));
    const lunaPos = posLuna(c.aLuna, new THREE.Vector3());
    const mex = new THREE.Vector3(...vectorLonLat(MEXICO.lon, MEXICO.lat)).applyAxisAngle(new THREE.Vector3(0, 1, 0), c.giro);
    const a = p.enfoque.a;
    if (a === "inicio" || a === "mexico") {
      const dir = mex.clone().normalize();
      vuelo.current = { pos: dir.multiplyScalar((a === "inicio" ? 3.4 : 2.3) * lejos), obj: new THREE.Vector3(), seguir: null };
    } else if (a === "tierra") {
      const lado = c.dirSol.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -1.1).setY(0.35).normalize();
      vuelo.current = { pos: lado.multiplyScalar(3.6 * lejos), obj: new THREE.Vector3(), seguir: null };
    } else if (a === "luna") {
      // Entre la Tierra y el Sol, un poco por arriba: se ve la cara que nos da
      // y buena parte iluminada sea cual sea la fase (la fase del día va en la ficha).
      const haciaTierra = lunaPos.clone().normalize().multiplyScalar(-1);
      const desde = haciaTierra.multiplyScalar(0.6).add(c.dirSol.clone().multiplyScalar(0.8)).add(new THREE.Vector3(0, 0.3, 0)).normalize();
      vuelo.current = { pos: lunaPos.clone().add(desde.multiplyScalar(1.35 * lejos)), obj: lunaPos.clone(), seguir: "luna" };
    } else {
      const solPos = c.dirSol.clone().multiplyScalar(DIST_SOL);
      vuelo.current = { pos: c.dirSol.clone().multiplyScalar(DIST_SOL - RADIO_SOL * 4.5 * lejos).add(new THREE.Vector3(0, RADIO_SOL * 1.2, RADIO_SOL * 1.5)), obj: solPos, seguir: null };
    }
    siguiendo.current = null;
     
  }, [p.enfoque.n]);

  // Al inicio la cámara llega desde lejos.
  useEffect(() => {
    camera.position.set(14, 6, 26);
  }, [camera]);

  useEffect(() => {
    const c = controles.current;
    if (!c) return;
    const cancelar = () => {
      vuelo.current = null;
    };
    c.addEventListener("start", cancelar);
    return () => c.removeEventListener("start", cancelar);
  }, []);

  useFrame((_, dtReal) => {
    const dt = Math.min(dtReal, 0.1);
    tiempo.current += dt * 1000 * p.velocidad;
    const fecha = new Date(tiempo.current);
    const c = cielo(fecha);
    dirSol.copy(c.dirSol);
    if (grupoTierra.current) grupoTierra.current.rotation.y = c.giro;
    if (luzSol.current) luzSol.current.position.copy(dirSol).multiplyScalar(50);

    if (luna.current) {
      posLuna(c.aLuna, luna.current.position);
      // Rotación síncrona: la cara visible (longitud 0 del mapa, +X) mira a la Tierra.
      luna.current.rotation.y = -(c.aLuna + Math.PI);
      // Cámara «montada» en la Luna (ver la nota igual en ExploradorSistemaSolar).
      if (siguiendo.current === "luna" || vuelo.current?.seguir === "luna") {
        const d = luna.current.position.clone().sub(lunaAntes.current);
        camera.position.add(d);
        controles.current?.target.add(d);
        if (vuelo.current) {
          vuelo.current.obj.add(d);
          vuelo.current.pos.add(d);
        }
      }
      lunaAntes.current.copy(luna.current.position);
    }

    const v = vuelo.current;
    const ctl = controles.current;
    if (v && ctl) {
      const k = 1 - Math.exp(-dt * 2.2);
      camera.position.lerp(v.pos, k);
      ctl.target.lerp(v.obj, k);
      if (camera.position.distanceTo(v.pos) < 0.01 * Math.max(1, v.pos.length() / 10)) {
        siguiendo.current = v.seguir;
        vuelo.current = null;
      }
    }

    if (fecha.getTime() - ultimoAviso.current > 1000 * Math.max(1, p.velocidad / 4) || Math.abs(fecha.getTime() - ultimoAviso.current) > 60_000 * Math.max(1, p.velocidad)) {
      ultimoAviso.current = fecha.getTime();
      onHora(fecha);
    }
  });

  return (
    <>
      <ambientLight intensity={0.015} />
      <directionalLight ref={luzSol} intensity={3.2} color="#fff6e8" />
      <ViaLactea />
      <Stars radius={700} depth={200} count={2500} factor={6} saturation={0.15} fade speed={0} />
      <Sol dirSol={dirSol} onSeleccion={p.onSeleccion} />
      <Tierra grupo={grupoTierra} dirSol={dirSol} nubes={p.nubes} luces={p.luces} onSeleccion={p.onSeleccion} mexicoRef={mexicoRef} />
      <Luna luna={luna} onSeleccion={p.onSeleccion} />
      <OrbitControls
        ref={controles}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={0.45}
        maxDistance={260}
        rotateSpeed={0.55}
        zoomSpeed={0.8}
      />
    </>
  );
}

