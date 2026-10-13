"use client";

/**
 * Piezas 3D del laboratorio de Gravitación universal (CNEYT-V-P03).
 *
 * Todo lo que «se ve real» vive aquí, para que GravitacionScene.tsx solo cuente
 * la física:
 *  · TierraFoto  — fotografías de la NASA (kit _espacio) con un sombreador
 *    propio: día y noche según la luz del Sol (del lado oscuro se encienden las
 *    ciudades), brillo del Sol SOLO en los océanos (máscara tierraOceanos),
 *    nubes en una capa aparte que gira y proyecta sombra, y halo atmosférico.
 *  · CuerpoFoto  — Luna, Marte y Júpiter con su fotografía.
 *  · Mareas      — el océano abultado hacia la Luna y hacia el lado opuesto.
 *  · Mexsat      — satélite de comunicaciones: bus con aislante dorado, alas de
 *    celdas solares orientadas norte–sur y reflectores parabólicos.
 *  · EstacionEEI — la Estación Espacial Internacional, simplificada.
 *  · Astronauta y Bascula — para el modo Peso.
 *
 * Las texturas de dibujo (celdas solares, aislante, pantalla de la báscula)
 * se generan en canvas con un generador pseudoaleatorio fijo (sin red y sin
 * Math.random en el render).
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import { rutaTextura, useTexturaEspacio, type TexturaEspacio } from "./_espacio";

/* ── Geografía ────────────────────────────────────────────────────────────── */
export const MEXICO = { lon: -102.5, lat: 23.6 };
/** Posición orbital de referencia de los Mexsat (la del Morelos 3, ≈ 113° Oeste). */
export const MEXSAT_LON = -113;

const DEG = Math.PI / 180;

/**
 * Punto de longitud/latitud sobre una esfera de radio r, en el marco de la
 * esfera (el eje Y es el eje de rotación). Compatible con la proyección
 * equirectangular de las texturas: el acimut de un punto ES su longitud.
 */
export function lonLat(lon: number, lat: number, r = 1, out = new THREE.Vector3()): THREE.Vector3 {
  const la = lat * DEG;
  const lo = lon * DEG;
  return out.set(Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)).multiplyScalar(r);
}

/* ── Generador pseudoaleatorio con semilla (mulberry32) ───────────────────── */
function prng(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ════════════════════════════════════════════════════════════════════════════
   LA TIERRA FOTOGRÁFICA
   ════════════════════════════════════════════════════════════════════════════ */
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
  uniform float uDesfase;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    vec3 n = normalize(vN);
    vec3 v = normalize(cameraPosition - vP);
    float ndl = dot(n, uSol);
    vec3 dia = texture2D(uDia, vUv).rgb;
    vec3 noche = texture2D(uNoche, vUv).rgb;
    float nube = texture2D(uNubes, vec2(vUv.x - uDesfase, vUv.y)).r;
    float oceano = texture2D(uOceano, vUv).r;

    // Día: luz difusa y una franja rojiza de crepúsculo junto a la línea día–noche.
    float luz = smoothstep(-0.06, 0.22, ndl);
    float difusa = max(ndl, 0.0);
    float crep = smoothstep(0.0, 0.18, ndl) * (1.0 - smoothstep(0.18, 0.45, ndl));
    vec3 colDia = dia * (difusa * 1.3 + 0.012);
    colDia *= mix(vec3(1.0), vec3(1.15, 0.78, 0.55), crep * 0.6);
    colDia *= 1.0 - nube * 0.3 * luz;

    // El Sol se refleja en el agua, no en tierra firme ni bajo las nubes.
    vec3 h = normalize(uSol + v);
    float nh = max(dot(n, h), 0.0);
    float brillo = pow(nh, 140.0) * 0.7 + pow(nh, 20.0) * 0.07;
    colDia += vec3(1.0, 0.9, 0.72) * brillo * oceano * (1.0 - nube) * luz;

    // Noche: luces de las ciudades, cálidas, solo del lado oscuro.
    float noct = 1.0 - smoothstep(-0.18, 0.04, ndl);
    vec3 colNoche = noche * noche * vec3(2.8, 2.0, 1.2) * noct * (1.0 - nube * 0.85);

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
    gl_FragColor = vec4(c, a * (0.2 + 0.8 * luz) * 0.95);
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

function repetirEnX(t: THREE.Texture | THREE.Texture[]) {
  const lista = Array.isArray(t) ? t : [t];
  for (const x of lista) {
    x.wrapS = THREE.RepeatWrapping;
    x.anisotropy = 8;
    x.needsUpdate = true;
  }
}

/**
 * La Tierra con fotografías. `dirSol` es la dirección (mundo) hacia el Sol.
 * Gira la Tierra desde fuera (grupo padre); las nubes se desplazan solas.
 */
export function TierraFoto({ radio = 1, dirSol, segmentos = 128, halo = true }: {
  radio?: number; dirSol: THREE.Vector3; segmentos?: number; halo?: boolean;
}) {
  const dia = useTexturaEspacio("tierraDia");
  const noche = useTexturaEspacio("tierraNoche");
  const nubes = useTexture(rutaTextura("tierraNubes"), repetirEnX);
  const oceano = useTexture(rutaTextura("tierraOceanos"));

  const uTierra = useMemo(() => ({
    uDia: { value: dia }, uNoche: { value: noche }, uNubes: { value: nubes }, uOceano: { value: oceano },
    uSol: { value: dirSol }, uDesfase: { value: 0 },
  }), [dia, noche, nubes, oceano, dirSol]);
  const uNubes = useMemo(() => ({ uNubes: { value: nubes }, uSol: { value: dirSol } }), [nubes, dirSol]);
  const uHalo = useMemo(() => ({ uSol: { value: dirSol } }), [dirSol]);

  const capaNubes = useRef<THREE.Mesh>(null);
  const matTierra = useRef<THREE.ShaderMaterial>(null);
  useFrame((_, dt) => {
    const m = capaNubes.current;
    if (!m) return;
    m.rotation.y += Math.min(dt, 0.05) * 0.012;
    if (matTierra.current) matTierra.current.uniforms.uDesfase!.value = m.rotation.y / (2 * Math.PI);
  });

  return (
    <group scale={radio}>
      <mesh>
        <sphereGeometry args={[1, segmentos, segmentos / 2]} />
        <shaderMaterial ref={matTierra} vertexShader={VERT} fragmentShader={FRAG_TIERRA} uniforms={uTierra} />
      </mesh>
      <mesh ref={capaNubes} scale={1.008} raycast={() => null}>
        <sphereGeometry args={[1, segmentos, segmentos / 2]} />
        <shaderMaterial vertexShader={VERT} fragmentShader={FRAG_NUBES} uniforms={uNubes} transparent depthWrite={false} />
      </mesh>
      {halo && (
        <mesh scale={1.06} raycast={() => null}>
          <sphereGeometry args={[1, 64, 32]} />
          <shaderMaterial vertexShader={VERT_HALO} fragmentShader={FRAG_HALO} uniforms={uHalo}
            side={THREE.BackSide} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

/** Luna, Marte, Júpiter… con su fotografía. La Tierra va con TierraFoto. */
export function CuerpoFoto({ textura, radio, segmentos = 96, brilloNoche = 0.05 }: {
  textura: Exclude<TexturaEspacio, "tierraDia" | "tierraNoche" | "tierraNubes" | "tierraOceanos" | "viaLactea">;
  radio: number; segmentos?: number; brilloNoche?: number;
}) {
  const mapa = useTexturaEspacio(textura);
  return (
    <mesh scale={radio} receiveShadow>
      <sphereGeometry args={[1, segmentos, segmentos / 2]} />
      {/* Emisivo tenue: la luz cenicienta que deja ver el lado oscuro. */}
      <meshStandardMaterial map={mapa} roughness={1} metalness={0} envMapIntensity={0}
        emissiveMap={mapa} emissive="#9fb4d8" emissiveIntensity={brilloNoche} />
    </mesh>
  );
}

/* ── Mareas: el océano abultado sobre el eje Tierra–Luna (exagerado) ─────── */
const FRAG_MAREA = /* glsl */ `
  uniform vec3 uSol;
  uniform vec3 uCentro;
  uniform float uRadio;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    vec3 n = normalize(vN);
    vec3 v = normalize(cameraPosition - vP);
    // Agua translúcida: casi invisible de frente, se nota en el contorno.
    float fres = pow(1.0 - max(dot(n, v), 0.0), 2.2);
    float luz = 0.55 + 0.6 * max(dot(n, uSol), 0.0);
    vec3 h = normalize(uSol + v);
    float brillo = pow(max(dot(n, h), 0.0), 80.0) * 0.6;
    vec3 c = vec3(0.30, 0.68, 1.0) * luz + vec3(1.0) * brillo;
    // Mezcla aditiva: el agua solo suma luz (no oscurece el planeta donde se corta).
    // Se desvanece donde la capa apenas sobresale: sin costura con el planeta.
    float altura = length(vP - uCentro) - uRadio;
    float sobresale = smoothstep(0.0, 0.07 * uRadio, altura);
    gl_FragColor = vec4(c * (0.07 + 0.6 * fres + brillo) * sobresale, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Capa de agua estirada hacia +X (donde está la Luna). `a` = abultamiento relativo. */
export function Mareas({ radio, a, dirSol }: { radio: number; a: number; dirSol: THREE.Vector3 }) {
  // La Tierra está en el origen de su grupo (modo Fuerza).
  const u = useMemo(() => ({ uSol: { value: dirSol }, uCentro: { value: new THREE.Vector3(0, 0, 0) }, uRadio: { value: radio * 1.008 } }), [dirSol, radio]);
  const s = radio * 1.012;
  return (
    <mesh scale={[s * (1 + a), s * (1 - a / 2), s * (1 - a / 2)]} raycast={() => null}>
      <sphereGeometry args={[1, 96, 48]} />
      <shaderMaterial vertexShader={VERT} fragmentShader={FRAG_MAREA} uniforms={u} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   TEXTURAS DIBUJADAS (celdas solares, aislante dorado)
   ════════════════════════════════════════════════════════════════════════════ */
let _celdas: THREE.CanvasTexture | null = null;
function texturaCeldas(): THREE.CanvasTexture {
  if (_celdas) return _celdas;
  const W = 256, H = 512;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#b9bec6";
  g.fillRect(0, 0, W, H);
  const rnd = prng(17);
  const cols = 6, filas = 12, m = 6, sep = 3;
  const cw = (W - 2 * m - (cols - 1) * sep) / cols;
  const ch = (H - 2 * m - (filas - 1) * sep) / filas;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < filas; j++) {
      const x = m + i * (cw + sep);
      const y = m + j * (ch + sep);
      const k = 0.85 + rnd() * 0.3;
      const gr = g.createLinearGradient(x, y, x + cw, y + ch);
      gr.addColorStop(0, `rgb(${Math.round(18 * k)},${Math.round(34 * k)},${Math.round(78 * k)})`);
      gr.addColorStop(1, `rgb(${Math.round(30 * k)},${Math.round(52 * k)},${Math.round(110 * k)})`);
      g.fillStyle = gr;
      g.fillRect(x, y, cw, ch);
      // conductores finos de plata
      g.fillStyle = "rgba(200,210,225,0.35)";
      for (let b = 1; b < 4; b++) g.fillRect(x + (cw * b) / 4, y, 1, ch);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  _celdas = t;
  return t;
}

let _foil: THREE.CanvasTexture | null = null;
/** Arrugas del aislante multicapa (MLI): mapa de relieve en escala de grises. */
function texturaFoil(): THREE.CanvasTexture {
  if (_foil) return _foil;
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, S, S);
  const rnd = prng(42);
  for (let i = 0; i < 260; i++) {
    const x = rnd() * S, y = rnd() * S, l = 10 + rnd() * 40, a = rnd() * Math.PI;
    const v = Math.round(90 + rnd() * 110);
    g.strokeStyle = `rgba(${v},${v},${v},0.55)`;
    g.lineWidth = 1 + rnd() * 3;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.6, y + Math.sin(a + 0.6) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  _foil = t;
  return t;
}

let _plato: THREE.LatheGeometry | null = null;
/** Reflector parabólico (y = k·x²), abierto hacia +Y. */
function geometriaPlato(): THREE.LatheGeometry {
  if (_plato) return _plato;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 14; i++) {
    const x = i / 14;
    pts.push(new THREE.Vector2(x, 0.38 * x * x));
  }
  _plato = new THREE.LatheGeometry(pts, 40);
  return _plato;
}

/* ════════════════════════════════════════════════════════════════════════════
   MEXSAT — satélite geoestacionario de comunicaciones
   Marco local: +Z apunta a la Tierra (nadir), ±Y es norte–sur (las alas).
   ════════════════════════════════════════════════════════════════════════════ */
function AlaSolar({ signo, mats }: { signo: 1 | -1; mats: { celdas: THREE.Material; marco: THREE.Material } }) {
  const paneles = [0, 1, 2, 3];
  return (
    <group position={[0, signo * 0.3, 0]}>
      {/* yugo */}
      <mesh position={[0, signo * 0.14, 0]} material={mats.marco}>
        <cylinderGeometry args={[0.012, 0.012, 0.28, 8]} />
      </mesh>
      {paneles.map((i) => (
        <mesh key={i} position={[0, signo * (0.3 + i * 0.27 + 0.13), 0]} material={mats.celdas}>
          <boxGeometry args={[0.36, 0.25, 0.012]} />
        </mesh>
      ))}
    </group>
  );
}

export function Mexsat({ escala = 1 }: { escala?: number }) {
  const mats = useMemo(() => {
    const foil = texturaFoil();
    return {
      oro: new THREE.MeshPhysicalMaterial({ color: "#d9a93a", metalness: 1, roughness: 0.32, bumpMap: foil, bumpScale: 1.4, clearcoat: 0.3 }),
      radiador: new THREE.MeshPhysicalMaterial({ color: "#e9edf2", metalness: 0.85, roughness: 0.12 }),
      blanco: new THREE.MeshStandardMaterial({ color: "#c9d0d8", roughness: 0.45, metalness: 0.35, side: THREE.DoubleSide }),
      celdas: new THREE.MeshPhysicalMaterial({ map: texturaCeldas(), metalness: 0.35, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 }),
      marco: new THREE.MeshStandardMaterial({ color: "#9aa3ad", metalness: 0.9, roughness: 0.35 }),
      bocina: new THREE.MeshStandardMaterial({ color: "#c7ccd3", metalness: 0.8, roughness: 0.3 }),
    };
  }, []);
  useEffect(() => () => { for (const m of Object.values(mats)) m.dispose(); }, [mats]);
  const plato = geometriaPlato();

  return (
    <group scale={escala}>
      {/* bus: caras este/oeste y cubierta terrestre con aislante dorado */}
      <mesh material={mats.oro} castShadow>
        <boxGeometry args={[0.34, 0.36, 0.4]} />
      </mesh>
      {/* radiadores espejo en las caras norte y sur */}
      <mesh position={[0, 0.181, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.radiador}>
        <planeGeometry args={[0.33, 0.39]} />
      </mesh>
      <mesh position={[0, -0.181, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.radiador}>
        <planeGeometry args={[0.33, 0.39]} />
      </mesh>
      {/* alas solares norte–sur */}
      <AlaSolar signo={1} mats={mats} />
      <AlaSolar signo={-1} mats={mats} />
      {/* reflectores desplegables en las caras este y oeste, mirando a la Tierra */}
      {[1, -1].map((s) => (
        <group key={s} position={[s * 0.36, 0, 0.12]} rotation={[Math.PI / 2, 0, s * 0.35]}>
          <mesh geometry={plato} scale={[0.22, 0.22, 0.22]} material={mats.blanco} />
          <mesh position={[0, 0.2, 0]} rotation={[Math.PI, 0, 0]} material={mats.bocina}>
            <coneGeometry args={[0.03, 0.08, 12]} />
          </mesh>
          <mesh position={[-s * 0.1, 0.1, 0]} rotation={[0, 0, s * 0.8]} material={mats.marco}>
            <cylinderGeometry args={[0.006, 0.006, 0.26, 6]} />
          </mesh>
        </group>
      ))}
      {/* antena de la cubierta terrestre */}
      <group position={[0, 0.06, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={plato} scale={[0.12, 0.12, 0.12]} material={mats.blanco} />
        <mesh position={[0, 0.1, 0]} material={mats.bocina}>
          <cylinderGeometry args={[0.012, 0.02, 0.09, 10]} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Estación Espacial Internacional (simplificada) ───────────────────────── */
export function EstacionEEI({ escala = 1 }: { escala?: number }) {
  const mats = useMemo(() => ({
    celdas: new THREE.MeshPhysicalMaterial({ map: texturaCeldas(), color: "#e8c98a", metalness: 0.4, roughness: 0.3, clearcoat: 1 }),
    modulo: new THREE.MeshStandardMaterial({ color: "#e4e7eb", metalness: 0.3, roughness: 0.5 }),
    viga: new THREE.MeshStandardMaterial({ color: "#a7adb5", metalness: 0.8, roughness: 0.4 }),
  }), []);
  useEffect(() => () => { for (const m of Object.values(mats)) m.dispose(); }, [mats]);
  const alas = [-0.42, -0.3, 0.3, 0.42];
  return (
    <group scale={escala}>
      {/* viga principal */}
      <mesh material={mats.viga}>
        <boxGeometry args={[1.0, 0.04, 0.04]} />
      </mesh>
      {/* módulos presurizados */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05]} material={mats.modulo}>
        <cylinderGeometry args={[0.045, 0.045, 0.42, 14]} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.18]} material={mats.modulo}>
        <cylinderGeometry args={[0.04, 0.04, 0.24, 14]} />
      </mesh>
      {/* alas solares */}
      {alas.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0, 0.2]} material={mats.celdas}>
            <boxGeometry args={[0.08, 0.008, 0.32]} />
          </mesh>
          <mesh position={[0, 0, -0.2]} material={mats.celdas}>
            <boxGeometry args={[0.08, 0.008, 0.32]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ASTRONAUTA (traje de actividad extravehicular) — mide 1.15 unidades
   ════════════════════════════════════════════════════════════════════════════ */
let _bandera: THREE.CanvasTexture | null = null;
function texturaBandera(): THREE.CanvasTexture {
  if (_bandera) return _bandera;
  const c = document.createElement("canvas");
  c.width = 96; c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#006847"; g.fillRect(0, 0, 32, 64);
  g.fillStyle = "#ffffff"; g.fillRect(32, 0, 32, 64);
  g.fillStyle = "#ce1126"; g.fillRect(64, 0, 32, 64);
  g.fillStyle = "#8a6a2c"; g.beginPath(); g.arc(48, 32, 8, 0, Math.PI * 2); g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  _bandera = t;
  return t;
}

export function Astronauta() {
  const mats = useMemo(() => ({
    traje: new THREE.MeshPhysicalMaterial({ color: "#eef0f2", roughness: 0.82, metalness: 0, sheen: 0.7, sheenColor: new THREE.Color("#ffffff"), sheenRoughness: 0.6 }),
    gris: new THREE.MeshStandardMaterial({ color: "#7d8591", roughness: 0.6, metalness: 0.3 }),
    casco: new THREE.MeshPhysicalMaterial({ color: "#f4f6f8", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 }),
    visor: new THREE.MeshPhysicalMaterial({ color: "#d9a640", metalness: 1, roughness: 0.06, clearcoat: 1, envMapIntensity: 1.6 }),
    guante: new THREE.MeshStandardMaterial({ color: "#d7dce3", roughness: 0.7 }),
    led: new THREE.MeshStandardMaterial({ color: "#1b2330", emissive: "#38bdf8", emissiveIntensity: 1.6 }),
    bandera: new THREE.MeshStandardMaterial({ map: texturaBandera(), roughness: 0.8 }),
  }), []);
  useEffect(() => () => { for (const m of Object.values(mats)) m.dispose(); }, [mats]);

  return (
    <group>
      {/* botas */}
      {[-0.11, 0.11].map((x) => (
        <RoundedBox key={`b${x}`} args={[0.15, 0.1, 0.26]} radius={0.04} position={[x, 0.05, 0.03]} material={mats.gris} castShadow />
      ))}
      {/* piernas */}
      {[-0.11, 0.11].map((x) => (
        <mesh key={`p${x}`} position={[x, 0.3, 0]} material={mats.traje} castShadow>
          <capsuleGeometry args={[0.085, 0.3, 6, 14]} />
        </mesh>
      ))}
      {/* torso */}
      <RoundedBox args={[0.44, 0.44, 0.3]} radius={0.12} position={[0, 0.68, 0]} material={mats.traje} castShadow />
      {/* módulo de control en el pecho, con luces */}
      <RoundedBox args={[0.2, 0.1, 0.08]} radius={0.02} position={[0, 0.66, 0.17]} material={mats.gris} />
      <mesh position={[-0.05, 0.67, 0.212]} material={mats.led}><sphereGeometry args={[0.012, 8, 8]} /></mesh>
      <mesh position={[0.05, 0.67, 0.212]} material={mats.led}><sphereGeometry args={[0.012, 8, 8]} /></mesh>
      {/* brazos y guantes */}
      {[-1, 1].map((s) => (
        <group key={`a${s}`}>
          <mesh position={[s * 0.29, 0.64, 0]} rotation={[0, 0, s * 0.22]} material={mats.traje} castShadow>
            <capsuleGeometry args={[0.072, 0.3, 6, 14]} />
          </mesh>
          <mesh position={[s * 0.33, 0.44, 0.02]} material={mats.guante} castShadow>
            <sphereGeometry args={[0.075, 16, 12]} />
          </mesh>
        </group>
      ))}
      {/* bandera en el hombro izquierdo */}
      <mesh position={[0.31, 0.77, 0.075]} rotation={[0, 0.25, -0.22]} material={mats.bandera}>
        <planeGeometry args={[0.08, 0.055]} />
      </mesh>
      {/* mochila de soporte vital */}
      <RoundedBox args={[0.42, 0.52, 0.18]} radius={0.05} position={[0, 0.74, -0.23]} material={mats.casco} castShadow />
      {/* anillo del cuello y casco con visor dorado */}
      <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.gris}>
        <torusGeometry args={[0.13, 0.03, 10, 28]} />
      </mesh>
      <mesh position={[0, 1.0, 0]} material={mats.casco} castShadow>
        <sphereGeometry args={[0.175, 32, 24]} />
      </mesh>
      <mesh position={[0, 1.0, 0]} material={mats.visor}>
        <sphereGeometry args={[0.18, 32, 24, Math.PI * 0.18, Math.PI * 0.64, Math.PI * 0.26, Math.PI * 0.4]} />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   BÁSCULA de plataforma con columna y pantalla digital
   La pantalla es una textura de canvas (no <Text>): se redibuja con `pintar`.
   ════════════════════════════════════════════════════════════════════════════ */
export interface PantallaBascula {
  textura: THREE.CanvasTexture;
  pintar: (principal: string, secundaria: string, color: string) => void;
}

export function crearPantallaBascula(): PantallaBascula {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 224;
  const g = c.getContext("2d")!;
  const textura = new THREE.CanvasTexture(c);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 8;
  const pintar = (principal: string, secundaria: string, color: string) => {
    const fondo = g.createLinearGradient(0, 0, 0, 224);
    fondo.addColorStop(0, "#071a14");
    fondo.addColorStop(1, "#03100c");
    g.fillStyle = fondo;
    g.fillRect(0, 0, 512, 224);
    g.strokeStyle = "rgba(120,255,200,0.18)";
    g.lineWidth = 4;
    g.strokeRect(6, 6, 500, 212);
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = color;
    g.shadowColor = color;
    g.shadowBlur = 18;
    g.font = "800 104px ui-monospace, Menlo, Consolas, monospace";
    g.fillText(principal, 256, 98);
    g.shadowBlur = 0;
    g.fillStyle = "rgba(190,255,225,0.75)";
    g.font = "700 38px system-ui, sans-serif";
    g.fillText(secundaria, 256, 182);
    textura.needsUpdate = true;
  };
  return { textura, pintar };
}

export function Bascula({ pantalla }: { pantalla: PantallaBascula }) {
  const mats = useMemo(() => ({
    base: new THREE.MeshPhysicalMaterial({ color: "#2a313b", metalness: 0.6, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.15 }),
    plato: new THREE.MeshPhysicalMaterial({ color: "#b8c0ca", metalness: 0.9, roughness: 0.28 }),
    goma: new THREE.MeshStandardMaterial({ color: "#14181e", roughness: 0.95 }),
    pantalla: new THREE.MeshStandardMaterial({ map: pantalla.textura, emissiveMap: pantalla.textura, emissive: "#ffffff", emissiveIntensity: 0.9, roughness: 0.4 }),
  }), [pantalla]);
  useEffect(() => () => { for (const m of Object.values(mats)) m.dispose(); }, [mats]);
  return (
    <group>
      {/* plataforma */}
      <RoundedBox args={[0.9, 0.09, 0.72]} radius={0.03} position={[0, 0.045, 0]} material={mats.base} receiveShadow castShadow />
      <RoundedBox args={[0.78, 0.02, 0.6]} radius={0.008} position={[0, 0.098, 0]} material={mats.goma} receiveShadow />
      {/* columna y cabezal con la pantalla */}
      <mesh position={[0.36, 0.62, -0.26]} material={mats.plato} castShadow>
        <cylinderGeometry args={[0.03, 0.035, 1.06, 14]} />
      </mesh>
      <group position={[0.36, 1.2, -0.2]} rotation={[-0.12, -0.35, 0]}>
        <RoundedBox args={[0.6, 0.3, 0.09]} radius={0.03} material={mats.base} castShadow />
        <mesh position={[0, 0, 0.047]} material={mats.pantalla}>
          <planeGeometry args={[0.54, 0.236]} />
        </mesh>
      </group>
    </group>
  );
}
