"use client";

/**
 * Escala GLOBO del viaje del paquete: la Tierra fotográfica DE NOCHE (las luces
 * de las ciudades son las protagonistas; el amanecer asoma por Europa), los
 * cables submarinos que llegan a México (Cancún, Tijuana) y los que salen de
 * EE. UU. hacia Europa, Sudamérica y Asia, con pulsos de luz que viajan por
 * ellos, y la ruta que de verdad sigue tu paquete, iluminada, con un destello
 * que la recorre a la velocidad del envío.
 *
 * Técnica (la misma de gravitación y subsistemas terrestres, en archivo propio):
 * un sombreador mezcla las fotografías de día y de noche según la dirección del
 * Sol, con nubes en otra capa y un halo atmosférico. Los materiales se crean
 * con `new THREE.ShaderMaterial` y sus uniformes se escriben en el material
 * (R3F no conserva el objeto `uniforms` que se pasa por props).
 *
 * Fotografías: kit _espacio (Solar System Scope, CC BY 4.0, datos de la NASA).
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { rutaTextura, useTexturaEspacio, ViaLactea } from "./_espacio";
import { type DestinoId, type NodoId, nodo, DESTINOS } from "./paquete-internet-data";
import { type LonLat, type PlanEnvio, CABLES_GLOBO, ESTACIONES_GLOBO, avanceEtapa } from "./paquete-internet-viaje";
import { Etiqueta3D, useMando, useReloj, facil, fijarU, sumarU, pedirEncuadre, type Pt } from "./paquete-internet-comun";

const DEG = Math.PI / 180;
export const R_TIERRA = 2.4;

/** Punto de longitud/latitud sobre la esfera (Y = eje de rotación), compatible con la textura equirectangular. */
export function lonLat(lon: number, lat: number, r = 1, out = new THREE.Vector3()): THREE.Vector3 {
  const la = lat * DEG;
  const lo = lon * DEG;
  return out.set(Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)).multiplyScalar(r);
}

/** El Sol sobre el Pacífico occidental: América y Europa de noche; el amanecer asoma por Asia. */
const DIR_SOL = lonLat(132, 6).normalize();

/* ── Sombreadores de la Tierra ────────────────────────────────────────── */

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
    float nube = texture2D(uNubes, vec2(vUv.x - uDesfase, vUv.y)).r;
    float oceano = texture2D(uOceano, vUv).r;

    // Día (solo asoma por el borde este): difusa y crepúsculo rojizo.
    float luz = smoothstep(-0.06, 0.22, ndl);
    float difusa = max(ndl, 0.0);
    float crep = smoothstep(0.0, 0.18, ndl) * (1.0 - smoothstep(0.18, 0.45, ndl));
    vec3 colDia = dia * (difusa * 1.25 + 0.01);
    colDia *= mix(vec3(1.0), vec3(1.2, 0.75, 0.5), crep * 0.7);
    colDia *= 1.0 - nube * 0.3 * luz;
    vec3 h = normalize(uSol + v);
    float nh = max(dot(n, h), 0.0);
    colDia += vec3(1.0, 0.88, 0.7) * (pow(nh, 120.0) * 0.6 + pow(nh, 18.0) * 0.06) * oceano * (1.0 - nube) * luz;

    // Noche: luz de luna azulada que deja ver los continentes, y las ciudades encendidas.
    float noct = 1.0 - smoothstep(-0.16, 0.05, ndl);
    vec3 luna = dia * vec3(0.14, 0.19, 0.32) * (0.11 + 0.08 * (1.0 - oceano));
    vec3 ciudades = noche * noche * vec3(3.1, 2.15, 1.25) * uLuces;
    vec3 colNoche = (luna + ciudades * (1.0 - nube * 0.8)) * noct;
    // Un brillo frío de la luna sobre el mar.
    vec3 hl = normalize(normalize(vec3(-0.4, 0.5, 0.75)) + v);
    colNoche += vec3(0.35, 0.5, 0.8) * pow(max(dot(n, hl), 0.0), 60.0) * 0.18 * oceano * noct * (1.0 - nube);

    vec3 col = colDia + colNoche;

    // Atmósfera de canto: azul del lado de día, tenue del lado de noche.
    float fres = pow(1.0 - max(dot(n, v), 0.0), 2.6);
    float lado = smoothstep(-0.25, 0.5, ndl);
    col = mix(col, vec3(0.32, 0.58, 1.0) * (0.12 + 0.9 * difusa), fres * (0.25 + 0.55 * lado));

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
  void main() {
    float ndl = dot(normalize(vN), uSol);
    float a = texture2D(uNubes, vUv).r;
    float luz = smoothstep(-0.1, 0.3, ndl);
    vec3 c = vec3(1.0, 0.99, 0.97) * (max(ndl, 0.0) * 1.1 + 0.035);
    c = mix(vec3(0.028, 0.036, 0.06), c, luz);
    gl_FragColor = vec4(c, a * (0.26 + 0.66 * luz));
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
    float i = pow(max(0.0, 0.64 + dot(vNv, vec3(0.0, 0.0, 1.0))), 4.0);
    float lado = smoothstep(-0.45, 0.5, dot(normalize(vN), uSol));
    vec3 c = vec3(0.30, 0.56, 1.0) * i * (0.35 + 1.9 * lado);
    gl_FragColor = vec4(c, 1.0);
  }
`;

function TierraNoche({ radio }: { radio: number }) {
  const dia = useTexturaEspacio("tierraDia");
  const noche = useTexturaEspacio("tierraNoche");
  const nubes = useTexture(rutaTextura("tierraNubes"), (t) => {
    const x = Array.isArray(t) ? t[0]! : t;
    x.wrapS = THREE.RepeatWrapping;
    x.anisotropy = 8;
    x.needsUpdate = true;
  });
  const oceano = useTexture(rutaTextura("tierraOceanos"));

  const mats = useMemo(() => {
    const tierra = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG_TIERRA,
      uniforms: {
        uDia: { value: dia },
        uNoche: { value: noche },
        uNubes: { value: nubes },
        uOceano: { value: oceano },
        uSol: { value: DIR_SOL.clone() },
        uDesfase: { value: 0 },
        uLuces: { value: 1 },
      },
    });
    const capa = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG_NUBES,
      uniforms: { uNubes: { value: nubes }, uSol: { value: DIR_SOL.clone() } },
      transparent: true,
      depthWrite: false,
    });
    const halo = new THREE.ShaderMaterial({
      vertexShader: VERT_HALO,
      fragmentShader: FRAG_HALO,
      uniforms: { uSol: { value: DIR_SOL.clone() } },
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    return { tierra, capa, halo };
  }, [dia, noche, nubes, oceano]);
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  const capaNubes = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const m = capaNubes.current;
    if (!m) return;
    m.rotation.y += Math.min(dt, 0.05) * 0.01;
    fijarU(mats.tierra, "uDesfase", m.rotation.y / (2 * Math.PI));
  });

  return (
    <group scale={radio}>
      <mesh material={mats.tierra}>
        <sphereGeometry args={[1, 160, 80]} />
      </mesh>
      <mesh ref={capaNubes} scale={1.007} material={mats.capa} raycast={() => null}>
        <sphereGeometry args={[1, 128, 64]} />
      </mesh>
      <mesh scale={1.07} material={mats.halo} raycast={() => null}>
        <sphereGeometry args={[1, 64, 32]} />
      </mesh>
    </group>
  );
}

/* ── Cables ───────────────────────────────────────────────────────────── */

/** Puntos densos por el círculo máximo entre cada par de [lon, lat]. */
function puntosGranCirculo(puntos: LonLat[], r: number, pasoGrados = 1.2): THREE.Vector3[] {
  const res: THREE.Vector3[] = [];
  for (let i = 0; i + 1 < puntos.length; i++) {
    const a = lonLat(puntos[i]![0], puntos[i]![1]).normalize();
    const b = lonLat(puntos[i + 1]![0], puntos[i + 1]![1]).normalize();
    const ang = a.angleTo(b);
    const n = Math.max(2, Math.ceil(ang / (pasoGrados * DEG)));
    for (let k = i === 0 ? 0 : 1; k <= n; k++) {
      const q = new THREE.Vector3().copy(a);
      const s = k / n;
      // slerp entre vectores unitarios
      const sinA = Math.sin(ang);
      if (sinA < 1e-6) q.copy(a);
      else q.copy(a).multiplyScalar(Math.sin((1 - s) * ang) / sinA).add(b.clone().multiplyScalar(Math.sin(s * ang) / sinA));
      res.push(q.normalize().multiplyScalar(r));
    }
  }
  return res;
}

const VERT_CABLE = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Fibra con pulsos de luz que viajan; `uCabeza` ilumina el tramo ya recorrido por TU paquete. */
const FRAG_CABLE = /* glsl */ `
  uniform vec3 uColor;
  uniform float uT;
  uniform float uRep;
  uniform float uBase;
  uniform float uCabeza;
  uniform float uEstela;
  varying vec2 vUv;
  void main() {
    float x = vUv.x;
    float f = fract(x * uRep - uT * 0.55);
    float pulso = pow(f, 14.0) * 1.6;
    float recorrido = uCabeza > 0.0 ? smoothstep(uCabeza - uEstela, uCabeza, x) * step(x, uCabeza) : 0.0;
    float hecho = uCabeza > 0.0 ? step(x, uCabeza) * 0.55 : 0.0;
    vec3 c = uColor * (uBase + pulso + hecho) + vec3(1.0) * recorrido * 2.2;
    gl_FragColor = vec4(c, 1.0);
    #include <colorspace_fragment>
  }
`;

function Cable({ puntos, radioTubo, color, base, rep }: { puntos: THREE.Vector3[]; radioTubo: number; color: string; base: number; rep?: number }) {
  const geo = useMemo(() => {
    const curva = new THREE.CatmullRomCurve3(puntos, false, "centripetal");
    return new THREE.TubeGeometry(curva, Math.max(24, puntos.length * 3), radioTubo, 6, false);
  }, [puntos, radioTubo]);
  const mat = useMemo(() => {
    let largo = 0;
    for (let i = 1; i < puntos.length; i++) largo += puntos[i]!.distanceTo(puntos[i - 1]!);
    return new THREE.ShaderMaterial({
      vertexShader: VERT_CABLE,
      fragmentShader: FRAG_CABLE,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uT: { value: (largo * 7.31) % 10 },
        uRep: { value: rep ?? Math.max(1, largo / 0.55) },
        uBase: { value: base },
        uCabeza: { value: 0 },
        uEstela: { value: 0.1 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [puntos, color, base, rep]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  useFrame((_, dt) => {
    sumarU(mat, "uT", Math.min(dt, 0.05));
  });
  return <mesh geometry={geo} material={mat} raycast={() => null} />;
}

/* ── Marcadores de ciudad ─────────────────────────────────────────────── */

let _destello: THREE.CanvasTexture | null = null;
function texturaDestello(): THREE.CanvasTexture {
  if (_destello) return _destello;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.16, "rgba(220,245,255,0.9)");
  r.addColorStop(0.4, "rgba(120,200,255,0.25)");
  r.addColorStop(1, "rgba(80,160,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  _destello = new THREE.CanvasTexture(c);
  _destello.colorSpace = THREE.SRGBColorSpace;
  return _destello;
}

function Ciudad({ lonlat, color, tam = 0.09 }: { lonlat: LonLat; color: string; tam?: number }) {
  const p = useMemo(() => lonLat(lonlat[0], lonlat[1], R_TIERRA * 1.008), [lonlat]);
  const tex = useMemo(() => texturaDestello(), []);
  return (
    <sprite position={p} scale={[tam, tam, tam]} raycast={() => null}>
      <spriteMaterial map={tex} color={color} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  );
}

/* ── La ruta de TU paquete ────────────────────────────────────────────── */

/** Dónde está cada nodo de la red sobre la Tierra (la casa y el proveedor están en la CDMX). */
const lonLatNodo = (id: NodoId): LonLat => [nodo(id).lon, nodo(id).lat];
const ARRIBA = new THREE.Vector3(0, 0.18, 0);
const CERO = new THREE.Vector3(0, 0, 0);

function RutaPaquete({ nodos, plan, color }: { nodos: NodoId[]; plan: PlanEnvio; color: string }) {
  const reloj = useReloj();
  const mando = useMando();
  const camera = useThree((s) => s.camera);
  const puntos = useMemo(() => {
    const pts: LonLat[] = [];
    nodos.forEach((n) => {
      const ll = lonLatNodo(n);
      const prev = pts[pts.length - 1];
      if (!prev || Math.abs(prev[0] - ll[0]) + Math.abs(prev[1] - ll[1]) > 0.05) pts.push(ll);
    });
    return pts.length >= 2 ? puntosGranCirculo(pts, R_TIERRA * 1.0045, 0.5) : [];
  }, [nodos]);
  const curva = useMemo(() => (puntos.length >= 2 ? new THREE.CatmullRomCurve3(puntos, false, "centripetal") : null), [puntos]);
  const geo = useMemo(() => (curva ? new THREE.TubeGeometry(curva, Math.max(64, puntos.length * 2), 0.015, 8, false) : null), [curva, puntos.length]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT_CABLE,
        fragmentShader: FRAG_CABLE,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uT: { value: 0 },
          uRep: { value: 18 },
          uBase: { value: 0.5 },
          uCabeza: { value: 0 },
          uEstela: { value: 0.12 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [color],
  );
  useEffect(() => () => { geo?.dispose(); mat.dispose(); }, [geo, mat]);

  const cabeza = useRef<THREE.Sprite>(null);
  const tex = useMemo(() => texturaDestello(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const deseo = useMemo(() => new THREE.Vector3(), []);
  /** Dirección media de la ruta: hacia ahí se inclina la cámara mientras sigue al destello. */
  const base = useMemo(() => {
    const b = new THREE.Vector3();
    puntos.forEach((p) => b.add(p));
    return b.lengthSq() > 0 ? b.normalize() : new THREE.Vector3(0, 0, 1);
  }, [puntos]);

  useFrame((_, dt) => {
    sumarU(mat, "uT", Math.min(dt, 0.05));
    const t = reloj.t;
    const p = t < 0 ? 0 : avanceEtapa(plan, "globo", t);
    const e = facil(p);
    const enCurso = t >= 0 && p > 0 && p < 1;
    fijarU(mat, "uCabeza", t < 0 ? 0 : p <= 0 ? 0 : Math.max(0.0001, e));
    fijarU(mat, "uBase", t >= 0 && p >= 1 ? 0.9 : 0.45);
    if (cabeza.current && curva) {
      cabeza.current.visible = enCurso;
      if (enCurso) {
        curva.getPointAt(e, v);
        cabeza.current.position.copy(v);
        const s = 0.2 + 0.05 * Math.sin(t * 20);
        cabeza.current.scale.set(s, s, s);
        // La cámara acompaña al destello (si el alumno no la ha tomado).
        if (mando && mando.sigue && !mando.libre) {
          const dist = Math.max(5.6, camera.position.length());
          // Acompaña a medias: el destello avanza y la cámara lo sigue sin perder el origen.
          deseo.copy(v).normalize().lerp(base, 0.45).normalize().add(ARRIBA).normalize().multiplyScalar(dist);
          pedirEncuadre(mando, deseo, CERO, 0.4);
        }
      }
    }
  });

  if (!geo) return null;
  return (
    <group>
      <mesh geometry={geo} material={mat} raycast={() => null} />
      <sprite ref={cabeza} visible={false} raycast={() => null}>
        <spriteMaterial map={tex} color="#e0f7ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

/* ── Escala completa ──────────────────────────────────────────────────── */

const NOMBRE_DESTINO: Record<DestinoId, string> = { qro: "Querétaro", ash: "Ashburn, Virginia", mad: "Madrid" };

/** Hacia dónde mira la cámara por destino: [lon, lat, distancia]. */
const VISTA_DESTINO: Record<DestinoId, [number, number, number]> = {
  qro: [-101, 24, 5.0],
  ash: [-88, 30, 6.4],
  mad: [-52, 33, 7.6],
};

export function poseGlobo(destino: DestinoId, aspecto: number): { pos: Pt; target: Pt } {
  const [lo, la, d] = VISTA_DESTINO[destino];
  const k = aspecto < 1 ? Math.min(1.75, 1.05 / Math.max(0.45, aspecto)) : 1;
  const p = lonLat(lo, la, d * k);
  return { pos: [p.x, p.y, p.z], target: [0, 0, 0] };
}

export function EscalaGlobo({ destino, rutaNodos, plan, color }: { destino: DestinoId; rutaNodos: NodoId[]; plan: PlanEnvio; color: string }) {
  const cables = useMemo(
    () =>
      CABLES_GLOBO.map((c) => ({
        ...c,
        pts: puntosGranCirculo(c.puntos, R_TIERRA * (c.tipo === "submarino" ? 1.0025 : 1.003)),
      })),
    [],
  );
  const dest = DESTINOS.find((d) => d.id === destino)!;
  const nDest = nodo(destino);
  const cruzaMarea = rutaNodos.includes("bil");
  const pMarea = useMemo(() => {
    const p = lonLat(-50, 31, R_TIERRA * 1.07);
    return [p.x, p.y, p.z] as Pt;
  }, []);
  const etq = (lon: number, lat: number, alto = 1.06): Pt => {
    const p = lonLat(lon, lat, R_TIERRA * alto);
    return [p.x, p.y, p.z];
  };

  return (
    <group>
      <ViaLactea brillo={0.32} radio={300} />
      <ambientLight intensity={0.05} />
      <TierraNoche radio={R_TIERRA} />

      {cables.map((c) => (
        <Cable
          key={c.id}
          puntos={c.pts}
          radioTubo={c.tipo === "submarino" ? 0.0068 : 0.0052}
          color={c.tipo === "submarino" ? (c.id === "marea" && cruzaMarea ? color : "#2dd4bf") : "#fbbf24"}
          base={c.tipo === "submarino" ? 0.32 : 0.22}
        />
      ))}

      <RutaPaquete nodos={rutaNodos} plan={plan} color={color} />

      {/* Ciudades de la ruta y estaciones de los cables */}
      {rutaNodos.map((id) => (
        <Ciudad key={id} lonlat={lonLatNodo(id)} color={id === destino ? color : "#bfe9ff"} tam={id === destino || id === "casa" ? 0.1 : 0.06} />
      ))}
      {ESTACIONES_GLOBO.map((e) => (
        <Ciudad key={e.id} lonlat={e.lonlat} color="#5eead4" tam={0.07} />
      ))}

      {/* Etiquetas: máximo cuatro */}
      <Etiqueta3D pos={etq(-99.3, 14.5)} col={`${color}aa`}>
        <i className="fa-solid fa-mobile-screen-button" style={{ color }} />
        Tu celular · CDMX
      </Etiqueta3D>
      {destino !== "qro" ? (
        <Etiqueta3D pos={etq(nDest.lon + (destino === "mad" ? 7 : 3), nDest.lat + (destino === "mad" ? 7.5 : 4.2))} col={`${color}cc`}>
          <i className="fa-solid fa-server" style={{ color }} />
          {NOMBRE_DESTINO[destino]}
        </Etiqueta3D>
      ) : (
        <Etiqueta3D pos={etq(-100.2, 23.4)} col={`${color}cc`}>
          <i className="fa-solid fa-server" style={{ color }} />
          Querétaro · {dest.dominio}
        </Etiqueta3D>
      )}
      {cruzaMarea ? (
        <Etiqueta3D pos={pMarea} col="#22d3eeaa" ancha>
          <i className="fa-solid fa-water" style={{ color: "#67e8f9" }} />
          Cable submarino MAREA · 6 600 km
        </Etiqueta3D>
      ) : (
        <>
          <Etiqueta3D pos={etq(-84.5, 18.6)} col="#2dd4bf88" ancha>
            Cancún
          </Etiqueta3D>
          <Etiqueta3D pos={etq(-121.5, 30.6)} col="#2dd4bf88" ancha>
            Tijuana
          </Etiqueta3D>
        </>
      )}
    </group>
  );
}
